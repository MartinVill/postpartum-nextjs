import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { userId, subscription, quietStart = '22:00', quietEnd = '08:00', timeZone = 'America/Argentina/Buenos_Aires' } = await request.json();
    if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) return NextResponse.json({ error: 'userId and a valid push subscription are required' }, { status: 400 });
    const id = createHash('sha256').update(subscription.endpoint).digest('hex');
    const db = getAdminDb();
    const now = new Date();
    const settingsSnapshot = await db.collection('users').doc(userId).collection('settings').doc('notifications').get();
    const notificationSettings = { dailyWellbeingEnabled: true, checkinTime: '11:00', pauseTime: '18:00', ...(settingsSnapshot.exists ? settingsSnapshot.data() : {}) };
    const subscriptionData = { userId, subscriptionObject: subscription, quietStart, quietEnd, timeZone, ...notificationSettings, updatedAt: now, createdAt: now };
    await Promise.all([
      db.collection('push_subscriptions').doc(id).set(subscriptionData, { merge: true }),
      // This is the per-user source of truth for the device's Web Push subscription.
      // The app uses Web Push/VAPID, not Firebase Cloud Messaging tokens.
      db.collection('users').doc(userId).set({ pushSubscription: subscription, notificationStatus: 'active', pushSubscriptionUpdatedAt: now }, { merge: true })
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUSH] Subscription persistence failed:', error);
    return NextResponse.json({ error: 'Unable to save push subscription' }, { status: 503 });
  }
}
