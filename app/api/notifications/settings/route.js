import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
const defaults = { dailyWellbeingEnabled: true, checkinTime: '11:00', pauseTime: '18:00' };
const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export async function GET(request) {
  try {
    const userId = new URL(request.url).searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    const snapshot = await getAdminDb().collection('users').doc(userId).collection('settings').doc('notifications').get();
    return NextResponse.json({ settings: { ...defaults, ...(snapshot.exists ? snapshot.data() : {}) } });
  } catch (error) {
    console.error('[PUSH] Settings read failed:', error);
    return NextResponse.json({ error: 'Unable to load notification settings' }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    const { userId, dailyWellbeingEnabled, checkinTime, pauseTime } = await request.json();
    if (!userId || typeof dailyWellbeingEnabled !== 'boolean' || !isTime(checkinTime) || !isTime(pauseTime)) return NextResponse.json({ error: 'Invalid notification settings' }, { status: 400 });

    const db = getAdminDb();
    const settings = { dailyWellbeingEnabled, checkinTime, pauseTime, updatedAt: new Date() };
    const subscriptions = await db.collection('push_subscriptions').where('userId', '==', userId).get();
    const batch = db.batch();
    batch.set(db.collection('users').doc(userId).collection('settings').doc('notifications'), settings, { merge: true });
    subscriptions.docs.forEach(document => batch.set(document.ref, settings, { merge: true }));
    await batch.commit();
    console.info('[PUSH] Daily wellbeing settings updated', { userId, dailyWellbeingEnabled, checkinTime, pauseTime, subscriptionCount: subscriptions.size });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[PUSH] Settings save failed:', error);
    return NextResponse.json({ error: 'Unable to save notification settings' }, { status: 503 });
  }
}
