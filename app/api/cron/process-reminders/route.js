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
    let reminders = 0, daily = 0;
    for (const document of due.docs) {
      const reminder = document.data();
      if (reminder.triggerTimestamp.toDate() > now) continue;
      await sendPushToUser(reminder.userId, { title: reminder.eventTitle, body: `Recordatorio: ${reminder.eventTitle}`, icon: '/icon-192.png', badge: '/badge.png', tag: `reminder-${document.id}`, data: { url: '/?tab=calendar' } });
      await document.ref.set({ sent: true, sentAt: now }, { merge: true }); reminders += 1;
    }
    const subscriptions = await db.collection('push_subscriptions').limit(500).get();
    for (const document of subscriptions.docs) {
      const sub = document.data(), zone = sub.timeZone || 'America/Argentina/Buenos_Aires';
      const clock = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
      const trigger = clock === '11:00' ? 'morning' : clock === '18:00' ? 'afternoon' : null, day = dateInZone(now, zone);
      const checkedIn = sub.lastCheckinTimestamp && dateInZone(sub.lastCheckinTimestamp.toDate(), zone) === day;
      if (!trigger || sub.lastDailyDeliveryKey === `${day}:${trigger}` || isWithinQuietHours(now, sub.quietStart, sub.quietEnd, zone) || (trigger === 'morning' && checkedIn)) continue;
      const payload = trigger === 'morning' ? { title: 'Tu check-in de hoy 💜', body: '¿Cómo te sientes hoy? 💜' } : { title: 'Un momento para vos ✨', body: '¿Hacemos una pausa? ✨' };
      await sendPushToUser(sub.userId, { ...payload, icon: '/icon-192.png', badge: '/badge.png', tag: `daily-${trigger}-${day}`, data: { url: '/' } });
      await document.ref.set({ lastDailyDeliveryKey: `${day}:${trigger}`, updatedAt: now }, { merge: true }); daily += 1;
    }
    return NextResponse.json({ success: true, reminders, daily });
  } catch (error) {
    console.error('[CRON] Push delivery failed:', error);
    return NextResponse.json({ error: 'Push processing failed' }, { status: 503 });
  }
}
