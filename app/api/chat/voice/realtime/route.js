import { createHash } from 'crypto';

export const runtime = 'nodejs';

const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const sdp = await request.text();

  if (!apiKey) {
    return Response.json({ error: 'OpenAI API key no configurada' }, { status: 500 });
  }

  if (!sdp || !sdp.includes('v=0')) {
    return Response.json({ error: 'Oferta de audio inválida' }, { status: 400 });
  }

  const userId = request.headers.get('x-postpartum-user') || 'anonymous';
  const safetyIdentifier = createHash('sha256').update(userId).digest('hex');

  const formData = new FormData();
  formData.set('sdp', sdp);
  formData.set('session', JSON.stringify({
    type: 'transcription',
    audio: {
      input: {
        transcription: {
          model: 'gpt-live-transcribe'
        },
        noise_reduction: {
          type: 'near_field'
        },
        turn_detection: null
      }
    }
  }));

  try {
    const response = await fetch(OPENAI_REALTIME_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Safety-Identifier': safetyIdentifier
      },
      body: formData
    });

    const answerSdp = await response.text();
    if (!response.ok) {
      console.error('[VOICE REALTIME] No se pudo crear la sesión:', response.status, answerSdp.slice(0, 300));
      return Response.json({ error: 'No pudimos preparar la nota de voz en tiempo real.' }, { status: 503 });
    }

    return new Response(answerSdp, {
      status: 200,
      headers: { 'Content-Type': 'application/sdp' }
    });
  } catch (error) {
    console.error('[VOICE REALTIME] Error al crear sesión:', error);
    return Response.json({ error: 'No pudimos preparar la nota de voz en tiempo real.' }, { status: 503 });
  }
}
