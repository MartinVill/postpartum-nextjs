import { verifyPayPalWebhook } from '@/lib/paypalServer';
import { planTypeFromPlanId, webhookEntitlementUpdate } from '@/lib/billingEntitlements';

export const runtime = 'nodejs';

async function claimWebhookEvent(db, event) {
  const ref = db.collection('paypal_webhook_events').doc(event.id);
  return db.runTransaction(async transaction => {
    const existing = await transaction.get(ref);
    if (existing.exists && existing.data()?.processedAt) return false;
    const processingStartedAt = existing.data()?.processingStartedAt;
    const isRecentlyProcessing = processingStartedAt && Date.now() - new Date(processingStartedAt).getTime() < 5 * 60 * 1000;
    if (isRecentlyProcessing) return false;
    transaction.set(ref, {
      eventType: event.event_type || 'unknown',
      resourceId: event.resource?.id || null,
      processingStartedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  });
}

async function findEntitlement(db, resource) {
  const userId = resource?.custom_id;
  if (userId) return { ref: db.collection('billing_entitlements').doc(userId), userId };
  const subscriptionId = resource?.billing_agreement_id || resource?.id;
  if (!subscriptionId) return null;
  const matches = await db.collection('billing_entitlements').where('paypalSubscriptionId', '==', subscriptionId).limit(1).get();
  if (matches.empty) return null;
  return { ref: matches.docs[0].ref, userId: matches.docs[0].id };
}

export async function POST(request) {
  let event;
  try { event = await request.json(); } catch { return Response.json({ error: 'Invalid payload' }, { status: 400 }); }

  try {
    const verified = await verifyPayPalWebhook(request, event);
    if (!verified) return Response.json({ error: 'Invalid PayPal signature' }, { status: 400 });

    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const db = getAdminDb();
    if (!event.id || !(await claimWebhookEvent(db, event))) return Response.json({ received: true, duplicate: true });
    const eventRef = db.collection('paypal_webhook_events').doc(event.id);
    const resource = event.resource || {};
    const entitlement = await findEntitlement(db, resource);

    if (entitlement) {
      const planType = planTypeFromPlanId(resource.plan_id);
      const paypalSubscriptionId = resource.billing_agreement_id || (event.event_type.startsWith('BILLING.SUBSCRIPTION.') ? resource.id : null);
      await entitlement.ref.set({
        ...(planType ? { planType } : {}),
        ...webhookEntitlementUpdate(event.event_type, resource),
        ...(paypalSubscriptionId ? { paypalSubscriptionId } : {}),
        lastWebhookEvent: event.event_type,
        lastWebhookEventAt: new Date().toISOString()
      }, { merge: true });
    }
    await eventRef.set({ processedAt: new Date().toISOString(), matchedEntitlement: Boolean(entitlement) }, { merge: true });
    return Response.json({ received: true });
  } catch (error) {
    console.error('[BILLING] PayPal webhook processing failed:', error.message);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
