import { PAYPAL_PLAN_TYPES, createPayPalLifetimeOrder, createPayPalSubscription, getTrustedAppUrl } from '@/lib/paypalServer';
import { entitlementFromSubscription } from '@/lib/billingEntitlements';

export const runtime = 'nodejs';

async function requireAuthenticatedUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!idToken) return null;
  try {
    const { getAdminAuth } = await import('@/lib/firebaseAdmin');
    const adminAuth = await getAdminAuth();
    return await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('[BILLING] Firebase token verification failed:', {
      code: error?.code,
      message: error?.message,
      projectId: process.env.FIREBASE_PROJECT_ID || 'missing'
    });
    return null;
  }
}

export async function POST(request) {
  const identity = await requireAuthenticatedUser(request);
  if (!identity) return Response.json({ error: 'Autenticación requerida' }, { status: 401 });

  try {
    const { planType } = await request.json();
    if (![PAYPAL_PLAN_TYPES.MONTHLY, PAYPAL_PLAN_TYPES.LIFETIME].includes(planType)) {
      return Response.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const appUrl = getTrustedAppUrl();
    if (planType === PAYPAL_PLAN_TYPES.LIFETIME) {
      const order = await createPayPalLifetimeOrder({
        userId: identity.uid,
        returnUrl: `${appUrl}/?paypal=lifetime-approved`,
        cancelUrl: `${appUrl}/?paypal=lifetime-cancelled`
      });
      const { getAdminDb } = await import('@/lib/firebaseAdmin');
      const now = new Date().toISOString();
      const db = getAdminDb();
      await db.collection('billing_entitlements').doc(identity.uid).set({
        userId: identity.uid, provider: 'paypal', providerEnvironment: process.env.PAYPAL_ENVIRONMENT || 'unknown', planType, planLabel: 'lifetime', paypalOrderId: order.orderId,
        billingStatus: order.status, accessStatus: 'pending_approval', recurring: false, authorizationCreatedAt: now, updatedAt: now
      }, { merge: true });
      await db.collection('users').doc(identity.uid).set({ checkoutState: 'checkout_started', checkoutProvider: 'paypal', checkoutStartedAt: now, checkoutStateUpdatedAt: now }, { merge: true });
      return Response.json({ approvalUrl: order.approvalUrl, orderId: order.orderId, checkoutType: 'lifetime' });
    }

    const subscription = await createPayPalSubscription({
      userId: identity.uid,
      planType,
      returnUrl: `${appUrl}/?paypal=approved`,
      cancelUrl: `${appUrl}/?paypal=cancelled`
    });
    const entitlement = entitlementFromSubscription({
      userId: identity.uid,
      planType,
      subscriptionId: subscription.subscriptionId,
      status: subscription.status
    });
    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const db = getAdminDb();
    await db.collection('billing_entitlements').doc(identity.uid).set(entitlement, { merge: true });
    await db.collection('users').doc(identity.uid).set({
      checkoutState: 'checkout_started',
      checkoutProvider: 'paypal',
      checkoutStartedAt: new Date().toISOString(),
      checkoutStateUpdatedAt: new Date().toISOString()
    }, { merge: true });

    return Response.json({ approvalUrl: subscription.approvalUrl, subscriptionId: subscription.subscriptionId });
  } catch (error) {
    console.error('[BILLING] Unable to create PayPal subscription:', error.message);
    return Response.json({ error: 'No pudimos iniciar PayPal. Inténtalo nuevamente.' }, { status: 503 });
  }
}
