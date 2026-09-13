import { verifyFirebaseIdToken } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

async function requireAuthenticatedUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!idToken) return null;
  try {
    return await verifyFirebaseIdToken(idToken);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const identity = await requireAuthenticatedUser(request);
  if (!identity) return Response.json({ error: 'Autenticación requerida' }, { status: 401 });

  const { getAdminDb } = await import('@/lib/firebaseAdmin');
  const entitlementRef = getAdminDb().collection('billing_entitlements').doc(identity.uid);
  const snapshot = await entitlementRef.get();
  if (!snapshot.exists) return Response.json({ entitlement: null });

  let entitlement = snapshot.data();
  // RTDN is the primary lifecycle signal. This revalidation is a deliberate
  // safety net for an app launch while a push is delayed or was not delivered.
  // It prevents stale local storage from extending access after a Play
  // subscription has actually expired.
  if (entitlement.provider === 'google-play' && entitlement.googlePlayPurchaseToken && entitlement.planType) {
    try {
      const { refreshGooglePlayPurchase } = await import('@/lib/googlePlayServer');
      const refreshed = await refreshGooglePlayPurchase({
        planType: entitlement.planType,
        purchaseToken: entitlement.googlePlayPurchaseToken
      });
      const now = new Date().toISOString();
      const changes = {
        billingStatus: refreshed.billingStatus,
        accessStatus: refreshed.accessStatus,
        trialEndsAt: refreshed.trialEndsAt,
        nextBillingAt: refreshed.nextBillingAt,
        googlePlayOrderId: refreshed.orderId,
        lastVerifiedAt: now,
        updatedAt: now,
        ...(refreshed.accessStatus === 'inactive' ? { accessEndedAt: now } : {})
      };
      await entitlementRef.set(changes, { merge: true });
      entitlement = { ...entitlement, ...changes };
    } catch (error) {
      // A temporary Google API outage must not sign a paid user out. RTDN will
      // retry independently and the stored entitlement remains the fallback.
      console.error('[BILLING] Google Play entitlement refresh failed:', error.message);
    }
  }

  return Response.json({ entitlement });
}
