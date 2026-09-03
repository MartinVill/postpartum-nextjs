/**
 * API ROUTE: POST /api/chat/voice
 * Maneja chat por voz: Whisper transcribe + OpenAI responde (DEPLOYMENT VERSION)
 */

import { OpenAI } from 'openai';

export const runtime = 'nodejs';

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

/**
 * Construir prompt personalizado (igual que en route.js)
 */
function buildPersonalizedSystemPrompt(userProfile, emotionalContext = {}) {
  const {
    name = 'Hermosa',
    favoriteTermsOfEndearment = ['hermosa'],
    hobbies = [],
    cyclePhase = 'unknown',
    energyLevel = 5,
    babyAge = 7,
  } = userProfile;

  const termOfEndearment = favoriteTermsOfEndearment[0] || 'hermosa';

  const emotionalScore = emotionalContext?.todayScore || 5;

  return `Eres Sofia, una amiga coach que ha ayudado a miles de mamás en postparto. Tu objetivo: RESOLVER el problema de ${name}, no solo validar.

ENERGÍA ACTUAL DE ${name.toUpperCase()}: ${emotionalScore}/10

ADAPTA TU RESPUESTA SEGÚN LA ENERGÍA:
- Score 1-3 (muy baja): Respuestas ULTRACORTAS. Validá fuerte. NO pidas más info. Dale UNA cosa para hacer AHORA.
- Score 4-6 (media): Respuestas normales, balanceadas. Preguntá si necesitas info.
- Score 7-10 (alta): Respuestas con energía, empoderantes. Llévala a RESOLVER.

EJEMPLOS POR ENERGÍA:

Baja (1-3):
Usuario: "No puedo más"
Sofia: "Entiendo. Hacé UNA cosa ahora: acuéstate 10 minutos."
(NO: "¿Qué es lo peor?" - es DEMASIADO cuando está en piso)

Media (4-6):
Usuario: "No puedo más"
Sofia: "Es postparto, es intenso. ¿Alguien podría ayudarte hoy?"

Alta (7-10):
Usuario: "Estoy cansada"
Sofia: "Cansancio es normal pero VOS PODÉS. ¿Qué te ayudaría a recargar?"

FILOSOFÍA (CRÍTICA):
1. NO SEAS REDUNDANTE: si pregunta "qué es X", NO digas "entiendo que no lo conozcas". Obvio.
2. MENSAJES TIPO WHATSAPP: máximo 1-2 frases CORTAS.
3. USA METÁFORAS: "es como...", VIVENCIAL. NUNCA académico.
4. SOLUCIÓN SIMPLE > CORRECTA: Dale LA MEJOR, no todas.

REGLAS DE ORO:
- CRITERIO: VAGO → PREGUNTA | ESPECÍFICO → SOLUCIONA.
- Nunca des 2+ opciones. UNA máximo.
- NO repitas preguntas, NO hagas preguntas obvias.
- Cuando usuario responde, CONTINÚA EL HILO.
- Una pregunta máximo por respuesta.
- Si dice "sí", reacciona: "Dale! Hacé eso" (no "¿me contás?")
- Grave (suicidio, abandono, daño): "Anda al médico HOY."

CRITERIO VAGO vs ESPECÍFICO:
VAGO ("no me siento bien", "estoy mal") → PREGUNTA para entender.
ESPECÍFICO ("no duermo", "bebé llora") → SOLUCIONA sin pedir más info.

CRÍTICO: NUNCA repitas la MISMA pregunta. Varía cómo preguntas.

EJEMPLOS DE VARIACIÓN (TODAS BUSCAN LO MISMO, PERO DIFERENTES):

Usuario: "No me siento bien"
Opción 1: "¿Es cansancio, ansiedad, o algo físico?"
Opción 2: "Cuéntame un poco. ¿Qué es lo que más te pesa?"
Opción 3: "¿Desde cuándo te sientes así?"
Opción 4: "¿Qué cambió hoy?"
Opción 5: "¿Es algo de la mente o del cuerpo?"

Usuario dice "no sé" a la primera → NO vuelvas a preguntar igual
Bien: "Ok, probá esto: ¿dormiste bien anoche?"
Bien: "¿Pasó algo hoy que te afecte?"

Usuario: "No duermo"
Bien: "¿Alguien podría cuidar al bebé una noche?"

Usuario: "¿Qué es ruido blanco?"
Bien: "Es como cuando te cantaban de bebé. Vos hacés 'shhhh shhhh' y el bebé se duerme."

TONO FINAL:
- Convencida, directa, SIN dudas ni explicaciones innecesarias.
- Vivencial: "es como", "imaginate", "hablamos de", como si lo hubieras vivido.
- Una amiga que VIVIÓ postparto, no que lo leyó.

Responde EN ESPAÑOL, como si ${name} fuera tu hermana.`;
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const isRealtimeTranscript = request.headers.get('content-type')?.includes('application/json');
    let audio = null;
    let transcriptText = '';
    let userProfile = {};
    let emotionalContext = {};

    if (isRealtimeTranscript) {
      const body = await request.json();
      transcriptText = body.transcript?.trim() || '';
      userProfile = body.userProfile || {};
      emotionalContext = body.emotionalContext || {};

      if (!transcriptText) {
        return Response.json({ error: 'No logramos escuchar palabras en esa nota.' }, { status: 422, headers });
      }
    } else {
      const formData = await request.formData();
      audio = formData.get('audio');
      userProfile = JSON.parse(formData.get('userProfile') || '{}');
      emotionalContext = JSON.parse(formData.get('emotionalContext') || '{}');

      if (!audio || typeof audio === 'string' || audio.size === 0) {
        return Response.json({ error: 'Audio requerido' }, { status: 400, headers });
      }

      if (audio.size > 25 * 1024 * 1024) {
        return Response.json({ error: 'La nota de voz es demasiado pesada. Intenta grabarla nuevamente.' }, { status: 413, headers });
      }
    }

    if (!process.env.OPENAI_API_KEY && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return Response.json(
        { error: 'OpenAI API key no configurada' },
        { status: 500, headers }
      );
    }

    if (!isRealtimeTranscript) {
      console.log(`[VOICE] Transcribiendo audio de respaldo para usuario ${userProfile?.userId || 'anon'} (${audio.type || 'tipo desconocido'}, ${audio.size} bytes)...`);

      const transcript = await openai.audio.transcriptions.create({
        file: audio,
        model: 'gpt-transcribe',
      });

      transcriptText = transcript.text?.trim() || '';
      if (!transcriptText) {
        return Response.json({ error: 'No logramos escuchar palabras en esa nota. Intenta hablar un poco más cerca.' }, { status: 422, headers });
      }
    }
    console.log(`[VOICE] Transcripción lista (${transcriptText.length} caracteres, ${isRealtimeTranscript ? 'Realtime' : 'respaldo'}).`);

    // PASO 2: Enviar transcripción a GPT para respuesta personalizada
    const systemPrompt = buildPersonalizedSystemPrompt(userProfile, emotionalContext);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: transcriptText,
        },
      ],
      temperature: 0.7,
      max_tokens: parseInt(process.env.MAX_TOKENS_PER_RESPONSE || '300'),
      top_p: 0.9,
    });

    const responseText = completion.choices[0].message.content || 'Te escucho. ¿Quieres contarme un poco más?';

    // El coste final depende de la duración de audio y del modelo de transcripción activo.
    const transcriptionCost = 0;
    const inputCost = (completion.usage.prompt_tokens / 1_000_000) * 0.15;
    const outputCost = (completion.usage.completion_tokens / 1_000_000) * 0.60;
    const totalCost = transcriptionCost + inputCost + outputCost;

    console.log(`[VOICE] Respuesta generada | Costo total: $${totalCost.toFixed(4)}`);

    // PASO 3: Convertir respuesta a voz (usando Web Speech API del navegador)
    // No usamos TTS pagado, el navegador lo hace gratis
    return Response.json(
      {
        transcript: transcriptText,
        message: responseText,
        audio: 'usar-web-speech-api', // El navegador lo dice gratis
        tokens: completion.usage.total_tokens,
        cost: totalCost.toFixed(4),
        success: true,
        source: isRealtimeTranscript ? 'openai-gpt-live-transcribe-gpt4o-mini' : 'openai-gpt-transcribe-gpt4o-mini',
      },
      { headers }
    );

  } catch (error) {
    console.error('Error en /api/chat/voice:', error);

    if (error.status === 401) {
      return Response.json(
        { error: 'API key inválida' },
        { status: 401, headers }
      );
    }

    if (error.status === 429) {
      return Response.json(
        { error: 'Rate limit de OpenAI. Espera un momento.' },
        { status: 429, headers }
      );
    }

    return Response.json(
      { error: error.message || 'Error procesando voz' },
      { status: 500, headers }
    );
  }
}
