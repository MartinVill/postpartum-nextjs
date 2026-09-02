import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { isWithinQuietHours, sendPushToUser } from '@/lib/pushServer';

export const runtime = 'nodejs';
const dateInZone = (date, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const timeInZone = (date, timeZone) => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);

async function claimDueReminder(db, reference, now) {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) return null;
    const reminder = snapshot.data();
    const triggerAt = reminder.triggerTimestamp?.toDate?.();
    const isPending = (reminder.status || (reminder.sent === false ? 'pending' : 'sent')) === 'pending';
    if (!isPending || !triggerAt || triggerAt > now) return null;

    transaction.set(reference, {
      status: 'sending',
      sent: false,
      lastAttemptAt: now,
      attemptCount: (reminder.attemptCount || 0) + 1
    }, { merge: true });
    return reminder;
  });
}

export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb(), now = new Date();
    // `status` is the current schema. The legacy query keeps reminders made
    // before this migration deliverable until they are handled once.
    let pendingSnapshot;
    try {
      pendingSnapshot = await db.collection('scheduled_reminders').where('status', '==', 'pending').where('triggerTimestamp', '<=', now).limit(100).get();
    } catch (error) {
      // Firestore may still be building the optional composite index. Do not
      // stop every notification type while that happens: query pending items
      // and apply the identical UTC timestamp condition below.
      if (error.code !== 9) throw error;
      console.warn('[CRON] Pending reminder compound index unavailable; using timestamp-filter fallback', { code: error.code });
      pendingSnapshot = await db.collection('scheduled_reminders').where('status', '==', 'pending').limit(100).get();
    }
    const legacySnapshot = await db.collection('scheduled_reminders').where('sent', '==', false).limit(100).get();
    const pendingById = new Map();
    [...pendingSnapshot.docs, ...legacySnapshot.docs].forEach(document => {
      const reminder = document.data();
      const triggerAt = reminder.triggerTimestamp?.toDate?.();
      if (triggerAt && triggerAt <= now && (reminder.status || (reminder.sent === false ? 'pending' : 'sent')) === 'pending') pendingById.set(document.id, document);
    });
    const due = [...pendingById.values()];
    console.info('[CRON] Due calendar reminder scan', { nowUtc: now.toISOString(), pendingMatchedCount: due.length, pendingSchemaCount: pendingSnapshot.size, legacyPendingCount: legacySnapshot.size });
    let reminders = 0, daily = 0;
    for (const document of due) {
      const reminder = await claimDueReminder(db, document.ref, now);
      if (!reminder) continue;
      const triggerAt = reminder.triggerTimestamp?.toDate?.();
      if (!triggerAt) {
        console.warn('[CRON] Reminder skipped: invalid trigger timestamp', { reminderId: document.id, userId: reminder.userId });
        continue;
      }
      const isDue = triggerAt <= now;
      console.info('[CRON] Reminder evaluated', { reminderId: document.id, userId: reminder.userId, eventId: reminder.eventId, reminder: reminder.reminder, triggerTimestampUtc: triggerAt.toISOString(), serverNowUtc: now.toISOString(), timeZone: reminder.timeZone || null, isDue });
      if (!isDue) continue;
      let delivery;
      try {
        delivery = await sendPushToUser(reminder.userId, {
          title: reminder.eventTitle,
          body: `Recordatorio: ${reminder.eventTitle}${reminder.eventTime ? ` · ${reminder.eventTime}` : ''}`,
          tag: `calendar-reminder-${reminder.eventId}`,
          data: { url: `/?tab=calendar&event=${encodeURIComponent(reminder.eventId)}`, eventId: reminder.eventId, reminderId: document.id, snoozeToken: reminder.snoozeToken }
        });
      } catch (error) {
        await document.ref.set({ status: 'pending', sent: false, lastAttemptAt: now, lastError: error.message }, { merge: true });
        console.error('[CRON] Calendar reminder push failed before delivery', { reminderId: document.id, userId: reminder.userId, message: error.message });
        continue;
      }
      if (delivery.delivered > 0) {
        await document.ref.set({ status: 'sent', sent: true, sentAt: now, lastDelivery: delivery }, { merge: true });
        reminders += 1;
      } else {
        await document.ref.set({ status: 'pending', sent: false, lastAttemptAt: now, lastDelivery: delivery }, { merge: true });
        console.warn('[CRON] Reminder retained for retry because delivery was not accepted', { reminderId: document.id, delivery });
      }
    }
    const subscriptions = await db.collection('push_subscriptions').limit(500).get();
    for (const document of subscriptions.docs) {
      const sub = document.data(), zone = sub.timeZone || 'America/Argentina/Buenos_Aires';
      const clock = timeInZone(now, zone);
      const checkinTime = sub.checkinTime || '11:00';
      const pauseTime = sub.pauseTime || '18:00';
      const trigger = clock >= checkinTime && clock < pauseTime && !sub.lastDailyDeliveryKey?.endsWith(`:morning:${checkinTime}`)
        ? 'morning'
        : clock >= pauseTime && !sub.lastDailyDeliveryKey?.endsWith(`:afternoon:${pauseTime}`)
          ? 'afternoon'
          : null;
      const scheduledTime = trigger === 'morning' ? checkinTime : pauseTime;
      const day = dateInZone(now, zone);
      const checkedIn = sub.lastCheckinTimestamp && dateInZone(sub.lastCheckinTimestamp.toDate(), zone) === day;
      const dailyDeliveryKey = `${day}:${trigger}:${scheduledTime}`;
      const defaultTime = trigger === 'morning' ? '11:00' : '18:00';
      const isLegacyDefaultDelivery = sub.lastDailyDeliveryKey === `${day}:${trigger}` && scheduledTime === defaultTime;
      if (sub.dailyWellbeingEnabled === false || !trigger || sub.lastDailyDeliveryKey === dailyDeliveryKey || isLegacyDefaultDelivery || isWithinQuietHours(now, sub.quietStart, sub.quietEnd, zone) || (trigger === 'morning' && checkedIn)) continue;
      const payload = trigger === 'morning' ? { title: 'Tu registro de hoy 💜', body: '¿Cómo te sientes en este momento?' } : { title: 'Un momento para ti ✨', body: '¿Hacemos una pausa para respirar?' };
      const delivery = await sendPushToUser(sub.userId, { ...payload, tag: 'daily-reminder', data: { url: trigger === 'morning' ? '/checkin' : '/respiracion' } });
      if (delivery.delivered > 0) {
        await document.ref.set({ lastDailyDeliveryKey: dailyDeliveryKey, lastDailyDeliveryAt: now, updatedAt: now, lastDailyDelivery: delivery }, { merge: true });
        daily += 1;
      } else {
        console.warn('[CRON] Daily reminder not marked delivered', { userId: sub.userId, trigger, delivery });
      }
    }
    return NextResponse.json({ success: true, reminders, daily });
  } catch (error) {
    console.error('[CRON] Push delivery failed:', error);
    return NextResponse.json({ error: 'Push processing failed' }, { status: 503 });
  }
}
