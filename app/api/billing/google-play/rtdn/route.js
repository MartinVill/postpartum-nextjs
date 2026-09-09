import { OAuth2Client } from 'google-auth-library';
import { refreshGooglePlayPurchase } from '@/lib/googlePlayServer';

export const runtime = 'nodejs';

const verifier = new OAuth2Client();

async function verifyPubSubRequest(request) {
  const audience = process.env.GOOGLE_PUBSUB_PUSH_AUDIENCE;
  const expectedEmail = process.env.GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT;
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!audience || !expectedEmail || !token) return false;
  const ticket = await verifier.verifyIdToken({ idToken: token, audience });
  const claims = ticket.getPayload();
  return claims?.email_verified === true && claims.email === expectedEmail;
}

function decodeNotification(data) {
  if (!data) return null;
  return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
}

async function claimMessage(db, messageId) {
  const ref = db.collection('google_play_rtdn_events').doc(messageId);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists) return false;
    transaction.set(ref, { receivedAt: new Date().toISOString(), status: 'processing' });
    return true;
  });
}

export async function POST(request) {
  try {
    if (!(await verifyPubSubRequest(request))) return Response.json({ error: 'Unauthorized Pub/Sub push' }, { status: 401 });
    const payload = await request.json();
    const message = payload?.message;
    if (!message?.messageId) return Response.json({ error: 'Invalid Pub/Sub message' }, { status: 400 });
    const notification = decodeNotification(message.data);
    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const db = getAdminDb();
    if (!(await claimMessage(db, message.messageId))) return Response.json({ received: true, duplicate: true });
    const eventRef = db.collection('google_play_rtdn_events').doc(message.messageId);

    const expectedPackage = process.env.GOOGLE_PLAY_ANDROID_PACKAGE_NAME;
    if (!notification || notification.packageName !== expectedPackage) {
      await eventRef.set({ status: 'ignored', reason: 'package_mismatch', processedAt: new Date().toISOString() }, { merge: true });
      return Response.json({ received: true });
    }
    if (notification.testNotification) {
      await eventRef.set({ status: 'test_received', processedAt: new Date().toISOString() }, { merge: true });
      return Response.json({ received: true });
    }

    const change = notification.subscriptionNotification || notification.oneTimeProductNotification || notification.voidedPurchaseNotification;
    const purchaseToken = change?.purchaseToken;
    if (!purchaseToken) {
      await eventRef.set({ status: 'ignored', reason: 'no_purchase_token', processedAt: new Date().toISOString() }, { merge: true });
      return Response.json({ received: true });
    }
    const matches = await db.collection('billing_entitlements').where('googlePlayPurchaseToken', '==', purchaseToken).limit(1).get();
    if (matches.empty) {
      await eventRef.set({ status: 'unmatched', purchaseToken, processedAt: new Date().toISOString() }, { merge: true });
      return Response.json({ received: true });
    }

    const entitlementRef = matches.docs[0].ref;
    const existing = matches.docs[0].data();
    const now = new Date().toISOString();
    if (notification.voidedPurchaseNotification) {
      await entitlementRef.set({ accessStatus: 'inactive', billingStatus: 'VOIDED', accessEndedAt: now, lastRtdnAt: now, updatedAt: now }, { merge: true });
    } else {
      const purchase = await refreshGooglePlayPurchase({ planType: existing.planType, purchaseToken });
      await entitlementRef.set({
        billingStatus: purchase.billingStatus,
        accessStatus: purchase.accessStatus,
        trialEndsAt: purchase.trialEndsAt,
        nextBillingAt: purchase.nextBillingAt,
        googlePlayOrderId: purchase.orderId,
        lastRtdnAt: now,
        updatedAt: now,
        ...(purchase.accessStatus === 'inactive' ? { accessEndedAt: now } : {})
      }, { merge: true });
    }
    await eventRef.set({ status: 'processed', entitlementId: matches.docs[0].id, processedAt: now }, { merge: true });
    return Response.json({ received: true });
  } catch (error) {
    // A non-2xx response tells Pub/Sub to retry the notification. Do not
    // acknowledge a transient validation or database failure.
    console.error('[BILLING] RTDN processing failed:', error.message);
    return Response.json({ error: 'RTDN processing failed' }, { status: 500 });
  }
}
