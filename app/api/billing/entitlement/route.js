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
  const snapshot = await getAdminDb().collection('billing_entitlements').doc(identity.uid).get();
  return Response.json({ entitlement: snapshot.exists ? snapshot.data() : null });
}
