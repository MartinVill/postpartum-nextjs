import { GOOGLE_PLAY_PLAN_TYPES, verifyGooglePlayPurchase } from '@/lib/googlePlayServer';

export const runtime = 'nodejs';

async function requireAuthenticatedUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;
  try { const { getAdminAuth } = await import('@/lib/firebaseAdmin'); return await (await getAdminAuth()).verifyIdToken(token); } catch { return null; }
}

export async function POST(request) {
  const identity = await requireAuthenticatedUser(request);
  if (!identity) return Response.json({ error: 'Autenticación requerida' }, { status: 401 });
  try {
    const { planType, purchaseToken } = await request.json();
    if (![GOOGLE_PLAY_PLAN_TYPES.MONTHLY, GOOGLE_PLAY_PLAN_TYPES.LIFETIME].includes(planType) || typeof purchaseToken !== 'string') {
      return Response.json({ error: 'Compra de Google Play inválida' }, { status: 400 });
    }
    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const db = getAdminDb();
    const existing = await db.collection('billing_entitlements').where('googlePlayPurchaseToken', '==', purchaseToken).limit(1).get();
    if (!existing.empty && existing.docs[0].id !== identity.uid) return Response.json({ error: 'Este comprobante ya está asociado a otra cuenta' }, { status: 409 });

    const purchase = await verifyGooglePlayPurchase({ planType, purchaseToken });
    const now = new Date().toISOString();
    const entitlement = {
      userId: identity.uid,
      provider: 'google-play',
      planType,
      planLabel: planType === GOOGLE_PLAY_PLAN_TYPES.LIFETIME ? 'lifetime' : 'monthly',
      googlePlayProductId: purchase.productId,
      googlePlayPurchaseToken: purchase.purchaseToken,
      googlePlayOrderId: purchase.orderId,
      billingStatus: purchase.billingStatus,
      accessStatus: planType === GOOGLE_PLAY_PLAN_TYPES.LIFETIME ? 'active' : 'trialing',
      trialStartedAt: purchase.trialStartedAt,
      trialEndsAt: purchase.trialEndsAt,
      nextBillingAt: purchase.nextBillingAt,
      recurring: purchase.recurring,
      activatedAt: now,
      updatedAt: now
    };
    await db.collection('billing_entitlements').doc(identity.uid).set(entitlement, { merge: true });
    await db.collection('users').doc(identity.uid).set({ checkoutState: 'trial_active', checkoutProvider: 'google-play', trialActiveAt: now, checkoutStateUpdatedAt: now }, { merge: true });
    return Response.json({ entitlement });
  } catch (error) {
    console.error('[BILLING] Google Play verification failed:', error.message);
    return Response.json({ error: 'No pudimos validar tu compra con Google Play. Inténtalo nuevamente.' }, { status: 503 });
  }
}
