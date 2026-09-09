import { cancelPayPalSubscription } from '@/lib/paypalServer';

export const runtime = 'nodejs';

async function requireAuthenticatedUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!idToken) return null;
  try {
    const { getAdminAuth } = await import('@/lib/firebaseAdmin');
    const adminAuth = await getAdminAuth();
    return await adminAuth.verifyIdToken(idToken);
  } catch { return null; }
}

export async function POST(request) {
  const identity = await requireAuthenticatedUser(request);
  if (!identity) return Response.json({ error: 'Autenticación requerida' }, { status: 401 });

  try {
    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const entitlementRef = getAdminDb().collection('billing_entitlements').doc(identity.uid);
    const entitlement = await entitlementRef.get();
    const subscriptionId = entitlement.data()?.paypalSubscriptionId;
    if (!subscriptionId) return Response.json({ error: 'No hay una autorización de PayPal para cancelar' }, { status: 404 });

    await cancelPayPalSubscription(subscriptionId);
    await entitlementRef.set({ cancellationRequestedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true });
    return Response.json({ success: true });
  } catch (error) {
    console.error('[BILLING] Unable to cancel PayPal subscription:', error.message);
    return Response.json({ error: 'No pudimos cancelar la autorización. Inténtalo nuevamente.' }, { status: 503 });
  }
}
