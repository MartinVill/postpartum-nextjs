import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
const minutesByReminder = { '15min': 15, '30min': 30, '1h': 60, '1day': 1440 };

export async function POST(request) {
  try {
    const { userId, eventId, eventTitle, eventType = 'evento', eventTimestamp, reminders = [] } = await request.json();
    if (!userId || !eventId || !eventTitle || !eventTimestamp) return NextResponse.json({ error: 'Missing event reminder fields' }, { status: 400 });
    const eventDate = new Date(eventTimestamp);
    if (Number.isNaN(eventDate.getTime())) return NextResponse.json({ error: 'Invalid event timestamp' }, { status: 400 });
    const db = getAdminDb();
    const existing = await db.collection('scheduled_reminders').where('userId', '==', userId).where('eventId', '==', String(eventId)).get();
    const batch = db.batch();
    existing.docs.forEach((document) => batch.delete(document.ref));
    [...new Set(reminders)].forEach((reminder) => {
      const minutes = minutesByReminder[reminder];
      if (!minutes) return;
      const triggerTimestamp = new Date(eventDate.getTime() - minutes * 60000);
      if (triggerTimestamp <= new Date()) return;
      batch.set(db.collection('scheduled_reminders').doc(`${userId}_${eventId}_${reminder}`), { userId, eventId: String(eventId), eventTitle, eventType, reminder, triggerTimestamp, sent: false, createdAt: new Date() });
    });
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUSH] Reminder scheduling failed:', error);
    return NextResponse.json({ error: 'Unable to schedule reminder' }, { status: 503 });
  }
}
