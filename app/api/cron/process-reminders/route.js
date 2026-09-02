import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { isWithinQuietHours, sendPushToUser } from '@/lib/pushServer';

export const runtime = 'nodejs';
const dateInZone = (date, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getAdminDb(), now = new Date();
    const due = await db.collection('scheduled_reminders').where('sent', '==', false).limit(100).get();
    console.info('[CRON] Pending reminder scan', { nowUtc: now.toISOString(), pendingCount: due.size });
    let reminders = 0, daily = 0;
    for (const document of due.docs) {
      const reminder = document.data();
      const triggerAt = reminder.triggerTimestamp?.toDate?.();
      if (!triggerAt) {
        console.warn('[CRON] Reminder skipped: invalid trigger timestamp', { reminderId: document.id, userId: reminder.userId });
        continue;
      }
      const isDue = triggerAt <= now;
      console.info('[CRON] Reminder evaluated', { reminderId: document.id, userId: reminder.userId, eventId: reminder.eventId, reminder: reminder.reminder, triggerTimestampUtc: triggerAt.toISOString(), serverNowUtc: now.toISOString(), timeZone: reminder.timeZone || null, isDue });
      if (!isDue) continue;
      const delivery = await sendPushToUser(reminder.userId, { title: reminder.eventTitle, body: `Recordatorio: ${reminder.eventTitle}`, tag: `calendar-reminder-${reminder.eventId}`, data: { url: '/?tab=calendar', reminderId: document.id, snoozeToken: reminder.snoozeToken } });
      if (delivery.delivered > 0) {
        await document.ref.set({ sent: true, sentAt: now, lastDelivery: delivery }, { merge: true });
        reminders += 1;
      } else {
        await document.ref.set({ lastAttemptAt: now, lastDelivery: delivery }, { merge: true });
        console.warn('[CRON] Reminder retained for retry because delivery was not accepted', { reminderId: document.id, delivery });
      }
    }
    const subscriptions = await db.collection('push_subscriptions').limit(500).get();
    for (const document of subscriptions.docs) {
      const sub = document.data(), zone = sub.timeZone || 'America/Argentina/Buenos_Aires';
      const clock = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
      const trigger = clock === (sub.checkinTime || '11:00') ? 'morning' : clock === (sub.pauseTime || '18:00') ? 'afternoon' : null, day = dateInZone(now, zone);
      const checkedIn = sub.lastCheckinTimestamp && dateInZone(sub.lastCheckinTimestamp.toDate(), zone) === day;
      if (sub.dailyWellbeingEnabled === false || !trigger || sub.lastDailyDeliveryKey === `${day}:${trigger}` || isWithinQuietHours(now, sub.quietStart, sub.quietEnd, zone) || (trigger === 'morning' && checkedIn)) continue;
      const payload = trigger === 'morning' ? { title: 'Tu registro de hoy 💜', body: '¿Cómo te sientes en este momento?' } : { title: 'Un momento para ti ✨', body: '¿Hacemos una pausa para respirar?' };
      const delivery = await sendPushToUser(sub.userId, { ...payload, tag: 'daily-reminder', data: { url: trigger === 'morning' ? '/checkin' : '/respiracion' } });
      if (delivery.delivered > 0) {
        await document.ref.set({ lastDailyDeliveryKey: `${day}:${trigger}`, updatedAt: now, lastDailyDelivery: delivery }, { merge: true });
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
