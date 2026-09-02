import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export async function POST(request) {
  try {
    const { userId, timestamp = new Date().toISOString() } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    const db = getAdminDb();
    const subscriptions = await db.collection('push_subscriptions').where('userId', '==', userId).get();
    const batch = db.batch();
    subscriptions.docs.forEach((document) => batch.set(document.ref, { lastCheckinTimestamp: timestamp, updatedAt: new Date() }, { merge: true }));
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to record check-in' }, { status: 503 });
  }
}
