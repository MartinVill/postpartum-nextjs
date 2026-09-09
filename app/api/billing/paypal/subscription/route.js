import { PAYPAL_PLAN_TYPES, createPayPalSubscription, getTrustedAppUrl } from '@/lib/paypalServer';
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
  } catch {
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
    await getAdminDb().collection('billing_entitlements').doc(identity.uid).set(entitlement, { merge: true });

    return Response.json({ approvalUrl: subscription.approvalUrl, subscriptionId: subscription.subscriptionId });
  } catch (error) {
    console.error('[BILLING] Unable to create PayPal subscription:', error.message);
    return Response.json({ error: 'No pudimos iniciar PayPal. Inténtalo nuevamente.' }, { status: 503 });
  }
}
