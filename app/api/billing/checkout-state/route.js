export const runtime = 'nodejs';

async function requireAuthenticatedUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;
  try {
    const { getAdminAuth } = await import('@/lib/firebaseAdmin');
    return await (await getAdminAuth()).verifyIdToken(token);
  } catch { return null; }
}

export async function POST(request) {
  const identity = await requireAuthenticatedUser(request);
  if (!identity) return Response.json({ error: 'Autenticación requerida' }, { status: 401 });
  const { state, provider } = await request.json().catch(() => ({}));
  if (!['checkout_started', 'checkout_abandoned'].includes(state) || !['paypal', 'google-play'].includes(provider)) {
    return Response.json({ error: 'Estado de checkout inválido' }, { status: 400 });
  }
  const now = new Date().toISOString();
  const data = {
    checkoutState: state,
    checkoutProvider: provider,
    checkoutStateUpdatedAt: now,
    ...(state === 'checkout_started' ? { checkoutStartedAt: now } : { checkoutAbandonedAt: now })
  };
  const { getAdminDb } = await import('@/lib/firebaseAdmin');
  await getAdminDb().collection('users').doc(identity.uid).set(data, { merge: true });
  return Response.json({ ok: true });
}
