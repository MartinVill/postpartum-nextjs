import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Transcripción con Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    const transcribedText = transcriptionResponse.text;

    // Análisis emocional con GPT-4o-mini
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente especializado en análisis emocional para mujeres en recuperación posparto.
Analiza el estado emocional de la mamá basándote en lo que dice, sin juzgar.
Responde ÚNICAMENTE un JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura:
{
  "moodScore": number entre 0 y 10,
  "summary": string breve (máx 30 palabras) del estado emocional,
  "tags": array de strings con máx 3 etiquetas (ej: ["cansada", "positiva", "ansiosa"])
}

Mapeo de moodScore:
- 0-4: Ánimo bajo, extenuada, necesita apoyo urgente
- 5-7: Estado neutral/estable
- 8-10: Energía alta, positiva, lista para actividades

NO incluyas markdown, backticks, ni explicaciones. Solo JSON puro.`,
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
    let moodAnalysis;

    try {
      moodAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Error parsing mood analysis:', analysisText);
      // Fallback si el JSON no es válido
      moodAnalysis = {
        moodScore: 5,
        summary: 'Análisis procesado',
        tags: ['registro-voz'],
      };
    }

    return NextResponse.json({
      success: true,
      transcription: transcribedText,
      moodScore: moodAnalysis.moodScore || 5,
      summary: moodAnalysis.summary || 'Registro completado',
      tags: moodAnalysis.tags || [],
    });
  } catch (error) {
    console.error('Transcribe API error:', error);
    return NextResponse.json(
      { error: 'Error processing audio. Please try again.' },
      { status: 500 }
    );
  }
}
