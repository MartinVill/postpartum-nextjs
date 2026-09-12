import { capturePayPalLifetimeOrder } from '@/lib/paypalServer';
import { verifyFirebaseIdToken } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

async function requireAuthenticatedUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;
  try { return await verifyFirebaseIdToken(token); } catch { return null; }
}

export async function POST(request) {
  const identity = await requireAuthenticatedUser(request);
  if (!identity) return Response.json({ error: 'Autenticación requerida' }, { status: 401 });
  try {
    const { orderId } = await request.json();
    if (typeof orderId !== 'string' || !orderId) return Response.json({ error: 'Orden inválida' }, { status: 400 });
    const capture = await capturePayPalLifetimeOrder(orderId, identity.uid);
    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const db = getAdminDb();
    const now = new Date().toISOString();
    const entitlement = {
      userId: identity.uid, provider: 'paypal', providerEnvironment: process.env.PAYPAL_ENVIRONMENT || 'unknown', planType: 'lifetime', planLabel: 'lifetime',
      paypalOrderId: capture.orderId, paypalCaptureId: capture.captureId, billingStatus: capture.status, accessStatus: 'active', recurring: false,
      activatedAt: now, trialStartedAt: null, trialEndsAt: null, nextBillingAt: null, updatedAt: now
    };
    await db.collection('billing_entitlements').doc(identity.uid).set(entitlement, { merge: true });
    await db.collection('users').doc(identity.uid).set({ checkoutState: 'trial_active', checkoutProvider: 'paypal', trialActiveAt: now, checkoutStateUpdatedAt: now }, { merge: true });
    return Response.json({ entitlement });
  } catch (error) {
    console.error('[BILLING] PayPal lifetime capture failed:', error.message);
    return Response.json({ error: 'No pudimos confirmar tu pago con PayPal. Inténtalo nuevamente.' }, { status: 503 });
  }
}
