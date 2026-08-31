import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
  // Try/catch global para todo el handler
  try {
    // Validar OPENAI_API_KEY antes de crear el cliente
    if (!process.env.OPENAI_API_KEY) {
      console.error('[TRANSCRIBE] ERROR: OPENAI_API_KEY no está definida');
      return NextResponse.json(
        { error: 'API key not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('[TRANSCRIBE] Recibiendo solicitud de transcripción...');

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      console.error('[TRANSCRIBE] ERROR: No audio file provided');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('[TRANSCRIBE] Archivo de audio recibido:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    });

    // Transcripción con Whisper
    console.log('[TRANSCRIBE] Iniciando transcripción con Whisper...');
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    const transcribedText = transcriptionResponse.text;
    console.log('[TRANSCRIBE] Transcripción completada:', {
      length: transcribedText.length,
      preview: transcribedText.substring(0, 100),
    });

    if (!transcribedText || transcribedText.trim().length === 0) {
      console.warn('[TRANSCRIBE] Advertencia: transcripción vacía');
      return NextResponse.json({
        success: true,
        transcription: '[Sin audio detectado]',
        moodScore: 5,
        summary: 'No se detectó audio claro',
        tags: ['sin-audio'],
      });
    }

    // Análisis emocional con GPT-4o-mini
    console.log('[TRANSCRIBE] Iniciando análisis emocional con GPT-4o-mini...');
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente especializado en análisis emocional para mujeres en recuperación posparto.
Analiza el estado emocional de la mamá basándote en lo que dice, sin juzgar.
Responde ÚNICAMENTE un JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura exacta:
{
  "moodScore": number entre 0 y 10,
  "summary": string breve (máx 30 palabras) del estado emocional,
  "tags": array de strings con máx 3 etiquetas (ej: ["cansada", "positiva", "ansiosa"])
}

Mapeo de moodScore:
- 0-4: Ánimo bajo, extenuada, necesita apoyo urgente
- 5-7: Estado neutral/estable
- 8-10: Energía alta, positiva, lista para actividades

NO incluyas markdown, backticks, ni explicaciones. Solo JSON puro válido.`,
        },
        {
          role: 'user',
          content: `Analiza el estado emocional: "${transcribedText}"`,
        },
      ],
      temperature: 0.7,
    });

    // Parsear respuesta JSON
    const analysisText = analysisResponse.choices[0].message.content.trim();
    console.log('[TRANSCRIBE] Respuesta de análisis:', analysisText);

    let moodAnalysis;
    try {
      moodAnalysis = JSON.parse(analysisText);
      console.log('[TRANSCRIBE] Análisis parseado correctamente:', moodAnalysis);
    } catch (parseError) {
      console.error('[TRANSCRIBE] Error parseando JSON:', {
        error: parseError.message,
        rawText: analysisText,
      });
      // Fallback si el JSON no es válido
      moodAnalysis = {
        moodScore: 5,
        summary: 'Registro de voz procesado',
        tags: ['registro-completado'],
      };
    }

    const finalResponse = {
      success: true,
      transcription: transcribedText,
      moodScore: typeof moodAnalysis.moodScore === 'number' ? moodAnalysis.moodScore : 5,
      summary: moodAnalysis.summary || 'Registro completado',
      tags: Array.isArray(moodAnalysis.tags) ? moodAnalysis.tags : [],
    };

    console.log('[TRANSCRIBE] Respuesta final:', finalResponse);

    return NextResponse.json(finalResponse);
  } catch (error) {
    // Capturar errores específicos
    const errorMessage = error?.message || 'Unknown error';
    const errorType = error?.constructor?.name || 'Error';

    console.error('[TRANSCRIBE] FATAL ERROR:', {
      type: errorType,
      message: errorMessage,
      stack: error?.stack,
    });

    // Determinar status code basado en el tipo de error
    let statusCode = 500;
    let userMessage = 'Error al procesar el audio. Por favor intenta de nuevo.';

    if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
      statusCode = 401;
      userMessage = 'Error de autenticación. Contacta soporte.';
    } else if (errorMessage.includes('429')) {
      statusCode = 429;
      userMessage = 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.';
    } else if (errorMessage.includes('timeout')) {
      statusCode = 504;
      userMessage = 'La solicitud tardó demasiado. Intenta con un audio más corto.';
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: statusCode }
    );
  }
}
