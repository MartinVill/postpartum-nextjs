import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { userId, subscription, quietStart = '22:00', quietEnd = '08:00', timeZone = 'America/Argentina/Buenos_Aires' } = await request.json();
    if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) return NextResponse.json({ error: 'userId and a valid push subscription are required' }, { status: 400 });
    const id = createHash('sha256').update(subscription.endpoint).digest('hex');
    await getAdminDb().collection('push_subscriptions').doc(id).set({ userId, subscriptionObject: subscription, quietStart, quietEnd, timeZone, updatedAt: new Date(), createdAt: new Date() }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUSH] Subscription persistence failed:', error);
    return NextResponse.json({ error: 'Unable to save push subscription' }, { status: 503 });
  }
}
