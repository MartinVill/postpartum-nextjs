/**
 * API ROUTE: POST /api/user/profile
 * Guardar o actualizar perfil de usuario en Firestore
 */

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { userId, ...profileData } = await request.json();

    if (!userId) {
      return Response.json({ error: 'userId requerido' }, { status: 400 });
    }

    const userRef = doc(db, 'users', userId);
    const existingUser = await getDoc(userRef);

    if (existingUser.exists()) {
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
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

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return Response.json({ exists: false });
    }

    return Response.json({ exists: true, profile: userSnap.data() });
  } catch (error) {
    console.error('[USER] Error obteniendo perfil:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
