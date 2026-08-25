/**
 * API ROUTE: POST/GET /api/chat/messages
 * Guardar y obtener mensajes del chat en Firestore
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

export async function POST(request) {
  try {
    const { userId, role, text, tokens, cost, emotionalScore } = await request.json();

    if (!userId || !role || !text) {
      return Response.json({ error: 'Parámetros requeridos faltantes' }, { status: 400 });
    }

    const messagesRef = collection(db, 'users', userId, 'messages');
    const docRef = await addDoc(messagesRef, {
      role,
      text,
      tokens: tokens || 0,
      cost: cost || 0,
      emotionalScore: emotionalScore || 5,
      timestamp: new Date().toISOString()
    });

    console.log(`[CHAT] Mensaje guardado para ${userId}: ${docRef.id}`);
    return Response.json({ success: true, messageId: docRef.id });
  } catch (error) {
    console.error('[CHAT] Error guardando mensaje:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return Response.json({ error: 'userId requerido' }, { status: 400 });
    }

    const messagesRef = collection(db, 'users', userId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs
      .slice(-limit)
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    return Response.json({ messages });
  } catch (error) {
    console.error('[CHAT] Error obteniendo mensajes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
