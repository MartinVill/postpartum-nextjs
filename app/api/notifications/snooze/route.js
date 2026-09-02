import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { reminderId, snoozeToken } = await request.json();
    if (!reminderId || !snoozeToken) return NextResponse.json({ error: 'Missing snooze details' }, { status: 400 });

    const ref = getAdminDb().collection('scheduled_reminders').doc(reminderId);
    const document = await ref.get();
    if (!document.exists || document.data().snoozeToken !== snoozeToken) return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });

    const now = new Date();
    const triggerTimestamp = new Date(now.getTime() + 15 * 60 * 1000);
    await ref.set({ triggerTimestamp, sent: false, snoozedAt: now, lastSnoozeAt: now }, { merge: true });
    console.info('[PUSH] Reminder snoozed', { reminderId, triggerTimestampUtc: triggerTimestamp.toISOString() });
    return NextResponse.json({ success: true, triggerTimestampUtc: triggerTimestamp.toISOString() });
  } catch (error) {
    console.error('[PUSH] Snooze failed:', error);
    return NextResponse.json({ error: 'Unable to snooze reminder' }, { status: 503 });
  }
}
