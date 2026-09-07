/**
 * API ROUTE: POST /api/user/profile
 * Guardar o actualizar perfil de usuario en Firestore
 */

async function requireAuthenticatedUser(request, requestedUserId) {
  const authorization = request.headers.get('authorization') || '';
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!idToken) {
    return { error: Response.json({ error: 'Autenticación requerida' }, { status: 401 }) };
  }

  try {
    // Cargamos Admin solo después de confirmar que la solicitud trae token.
    // Así una petición anónima siempre puede recibir su 401, aun si falta una
    // credencial de servidor en un entorno de preview.
    const { getAdminAuth } = await import('@/lib/firebaseAdmin');
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    if (decodedToken.uid !== requestedUserId) {
      return { error: Response.json({ error: 'No tienes permiso para este perfil' }, { status: 403 }) };
    }
    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('[USER] Token inválido:', error.code || error.message);
    return { error: Response.json({ error: 'Sesión inválida o expirada' }, { status: 401 }) };
  }
}

export async function POST(request) {
  try {
    const { userId, ...profileData } = await request.json();

    if (!userId) {
      return Response.json({ error: 'userId requerido' }, { status: 400 });
    }

    const authentication = await requireAuthenticatedUser(request, userId);
    if (authentication.error) return authentication.error;

    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const userRef = getAdminDb().collection('users').doc(userId);
    const existingUser = await userRef.get();

    if (existingUser.exists()) {
      await userRef.update({
        ...profileData,
        updatedAt: new Date().toISOString()
      });
    } else {
      await userRef.set({
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`[USER] Perfil actualizado para ${userId}`);
    return Response.json({ success: true, userId });
  } catch (error) {
    console.error('[USER] Error guardando perfil:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId requerido' }, { status: 400 });
    }

    const authentication = await requireAuthenticatedUser(request, userId);
    if (authentication.error) return authentication.error;

    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const userRef = getAdminDb().collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists()) {
      return Response.json({ exists: false });
    }

    return Response.json({ exists: true, profile: userSnap.data() });
  } catch (error) {
    console.error('[USER] Error obteniendo perfil:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
