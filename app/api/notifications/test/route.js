import { NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/pushServer';

export const runtime = 'nodejs';

/**
 * Delivers a real Web Push message to the current user's saved subscription.
 * It is intentionally separate from scheduling so a device can validate the
 * complete VAPID + Service Worker path immediately after activation.
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const delivery = await sendPushToUser(userId, {
      title: 'Notificaciones activas 💜',
      body: 'Todo está listo para acompañarte con tus recordatorios.',
      tag: `push-test-${userId}`,
      data: { url: '/' }
    });

    if (delivery.delivered === 0) {
      return NextResponse.json({ error: 'No encontramos una suscripción activa para este dispositivo.', delivery }, { status: 409 });
    }

    return NextResponse.json({ success: true, delivery });
  } catch (error) {
    console.error('[PUSH] Test delivery failed:', error);
    return NextResponse.json({ error: 'No pudimos enviar la prueba de notificación.' }, { status: 503 });
  }
}
