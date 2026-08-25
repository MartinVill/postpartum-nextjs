// Motor de Personalización + Chat con OpenAI
// Máxima personalización: copy, tono, recomendaciones, todo dinámico

import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

/**
 * PERSONALIZATION ENGINE
 * Adapta TODO según el perfil único de cada usuaria
 */
export class PersonalizationEngine {
  constructor(userProfile) {
    this.user = userProfile;
    this.conversationHistory = [];
  }

  /**
   * Crear prompt system personalizado para cada usuaria
   * El prompt cambia según: nombre, gustos, ciclo, energía, síntomas
   */
  buildPersonalizedSystemPrompt() {
    const {
      name,
      favoriteTermsOfEndearment = ['hermosa', 'reina'],
      hobbies = [],
      cyclePhase = 'folicular',
      energyLevel = 6,
      preferredLanguageTone = 'warm', // warm, professional, playful
      babyAge = 7,
      concernsToday = [],
    } = this.user;

    const termOfEndearment = favoriteTermsOfEndearment[0] || 'hermosa';

    return `Eres una compañera emocional experta en postparto para mujeres latinas.
Tu nombre es Sofia. Estás aquí para apoyar a ${name} en su recuperación postparto.

SOBRE ${name.toUpperCase()}:
- Término de cariño favorito: "${termOfEndearment}"
- Sus hobbies: ${hobbies.length > 0 ? hobbies.join(', ') : 'aún no sabemos'}
- Bebé de aproximadamente ${babyAge} días/semanas
- Fase del ciclo: ${cyclePhase} (influye en energía)
- Energía actual: ${energyLevel}/10
- Preocupaciones hoy: ${concernsToday.length > 0 ? concernsToday.join(', ') : 'recuperación general'}

INSTRUCCIONES CRÍTICAS:
1. SIEMPRE comienza con validación emocional ("Entiendo que...", "Es completamente normal que...")
2. PERSONALIZA: Usa sus hobbies en recomendaciones. Si ama leer, sugiere libros. Si ama pintura, sugiere crear.
3. CICLO: Si está en fase lútea (baja energía), NO sugieras ejercicio intenso. Si está en folicular, puedes motivar más.
4. TONO: ${preferredLanguageTone === 'warm' ? 'Cálido, como una amiga cercana. Usa emojis. Sé maternal pero empoderada.' : preferredLanguageTone === 'playful' ? 'Juguetón, divertido, con humor. Eres su amiga que la hace reír.' : 'Profesional pero cálido. Basado en evidencia.'}
5. NUNCA diagnostiques. Siempre sugiere consultar médico si es grave.
6. RESPUESTAS CORTAS: Máximo 150 palabras para mantener engagement.
7. EMPODERAMIENTO: Recuérdales que son fuertes, que hicieron lo más increíble (dar a luz).

CONTEXTO DE RECUPERACIÓN POSTPARTO:
- Los primeros 6 semanas son críticas (6ta semana = sin presión abdominal)
- El periodo postparto no es solo físico, es mental (depresión postparto es real)
- No todas las mujeres aman la maternidad al instante (y está bien)
- El autocuidado NO es lujo, es necesidad
- Un bebé recién nacido cambia todo (sueño, cuerpo, identidad)

RESPONDE SIEMPRE CON:
- Validación emocional
- Recomendación personalizada a sus hobbies
- Un emoji que refleje esperanza/amor
- Pregunta de seguimiento que muestre que la escuchas`;
  }

  /**
   * Personalizar recomendaciones basadas en gustos + energía + ciclo
   */
  generatePersonalizedRecommendations(emotionalScore, concernsToday) {
    const { hobbies = [], energyLevel = 6, cyclePhase = 'folicular' } = this.user;
    const recommendations = [];

    // Basado en energía
    if (emotionalScore <= 3) {
      // Muy baja energía: sugerir rest + hobbies calmantes
      recommendations.push({
        emoji: '🛏️',
        action: 'Descansar sin culpa',
        reason: 'Tu cuerpo está en recuperación'
      });

      if (hobbies.includes('lectura')) {
        recommendations.push({
          emoji: '📖',
          action: 'Leer algo que te reconforte',
          reason: 'Un buen libro es compañía sin exigencias'
        });
      }

      if (hobbies.includes('musica')) {
        recommendations.push({
          emoji: '🎵',
          action: 'Playlist de calma',
          reason: 'La música baja cortisol (estrés)'
        });
      }
    } else if (emotionalScore <= 5) {
      // Energía moderada
      recommendations.push({
        emoji: '💅',
        action: 'Skincare + autocuidado',
        reason: 'Cuidarte es amarte'
      });

      if (hobbies.includes('pintura')) {
        recommendations.push({
          emoji: '🎨',
          action: 'Pintar algo pequeño',
          reason: 'Creatividad es terapia'
        });
      }
    } else {
      // Buena energía: pueden hacer más
      recommendations.push({
        emoji: '💪',
        action: '¿Ejercitamos?',
        reason: 'Tienes energía, aprovechemos'
      });

      if (hobbies.includes('bailar')) {
        recommendations.push({
          emoji: '💃',
          action: 'Bailar con tu bebé',
          reason: 'Diversión + ejercicio + bonding'
        });
      }
    }

    // Basado en ciclo
    if (cyclePhase === 'lútea' && emotionalScore < 5) {
      recommendations.push({
        emoji: '🌙',
        action: 'Reconoce que estás en fase lútea',
        reason: 'Es normal tener menos energía. Descansa sin culpa.'
      });
    }

    return recommendations.slice(0, 4); // Máx 4 recomendaciones
  }

  /**
   * Personalizar el copy de bienvenida
   */
  generatePersonalizedGreeting() {
    const termOfEndearment = this.user.favoriteTermsOfEndearment?.[0] || 'hermosa';
    const time = new Date().getHours();

    const greetings = [
      `¡Hola ${termOfEndearment}! 💛 Hoy es un gran día para brillar`,
      `¡${termOfEndearment} mía! ✨ Nadie brilla más que tú`,
      `¡Eres un milagro, ${termOfEndearment}! 💗 Tu cuerpo hizo lo más increíble`,
      `¡Mamá guerrera! 💪 Hoy vamos a cuidarte`,
      `¡Qué bueno verte de nuevo, ${termOfEndearment}! 🌟`,
      `¡${termOfEndearment}, mi reina! 👑 Hoy brillas diferente`,
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Personalizar recomendaciones de hobbies
   */
  getHobbySpecificAdvice(hobbyId) {
    const adviceMap = {
      lectura: {
        title: '📚 Tu momento de lectura',
        suggestion: 'Un capítulo de tu libro favorito es como un café con una amiga. Te mereces esos minutos.',
        books: [
          'Ficción romántica (escape)',
          'Autoayuda sobre maternidad (validación)',
          'Ensayos feministas (empoderamiento)',
          'Thrillers (emoción controlada)'
        ]
      },
      pintura: {
        title: '🎨 Tu creatividad es medicina',
        suggestion: 'Pintar 5 minutos libera cortisol. No importa si es "bonito", importa que es TUYO.',
        ideas: [
          'Pinta tu estado emocional (sin juicio)',
          'Pinta a tu bebé (memoria)',
          'Pinta lo que ves desde la ventana',
          'Garabatea colores que te calman'
        ]
      },
      musica: {
        title: '🎵 Playlist terapia',
        suggestion: 'La música es medicina. Crea playlist por estado emocional.',
        playlists: [
          'Energía (para días buenos)',
          'Calma (para ansiedad)',
          'Empoderamiento (para sentirte fuerte)',
          'Nostalgia (para procesar cambios)'
        ]
      },
      cocina: {
        title: '🍳 Cocinar es quererse',
        suggestion: 'Cocinar tu comida favorita es autocuidado. No tiene que ser salud, puede ser delicia.',
        ideas: [
          'Tu postre favorito (porque lo mereces)',
          'Comida de tu infancia (nostalgia sana)',
          'Algo sencillo pero delicioso (sin exigencias)',
          'Cocinar con tu pareja (conexión)'
        ]
      },
      jardineria: {
        title: '🌱 La naturaleza te sana',
        suggestion: 'Tocar tierra libera bacterias buenas para tu cerebro. Cultiva algo pequeño.',
        ideas: [
          'Maceta con hierba (fácil)',
          'Flores coloridas (alegría)',
          'Hierbas aromáticas (funcionales)',
          'Ver crecer algo (como tu bebé)'
        ]
      }
    };

    return adviceMap[hobbyId] || null;
  }
}

/**
 * EMOTION-AWARE CHAT
 * Chat que entiende el contexto emocional completo
 */
export class EmotionAwareChat {
  constructor(userProfile) {
    this.engine = new PersonalizationEngine(userProfile);
    this.conversationHistory = [];
    this.maxTokens = 300; // Respuestas cortas
  }

  /**
   * Chat por texto con OpenAI
   */
  async sendMessage(userMessage, emotionalContext = {}) {
    try {
      const systemPrompt = this.engine.buildPersonalizedSystemPrompt();

      const messages = [
        ...this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Contexto emocional actual
      if (emotionalContext.todayScore) {
        messages[messages.length - 1].content += `\n\n[CONTEXTO: Mi ánimo hoy es ${emotionalContext.todayScore}/10. ${emotionalContext.concerns || ''}]`;
      }

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo económico
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: this.maxTokens,
        top_p: 0.9,
      });

      const assistantMessage = response.choices[0].message.content;

      // Guardar en historial
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      return {
        success: true,
        message: assistantMessage,
        tokens: response.usage.total_tokens,
        cost: this.estimateCost(response.usage),
        source: 'openai'
      };
    } catch (error) {
      console.error('Error en chat:', error);
      return {
        success: false,
        message: 'Hubo un error. Estoy aquí, cuéntame qué sientes.',
        error: error.message
      };
    }
  }

  /**
   * Chat por voz: transcribir + responder + reproducir
   */
  async sendVoiceMessage(audioBlob, emotionalContext = {}) {
    try {
      // 1. Transcribir audio (Whisper API)
      const transcript = await this.transcribeAudio(audioBlob);

      if (!transcript.success) {
        return { success: false, message: 'No entendí bien. ¿Puedes repetir?' };
      }

      // 2. Enviar como mensaje de texto
      const chatResponse = await this.sendMessage(transcript.text, emotionalContext);

      if (!chatResponse.success) {
        return chatResponse;
      }

      // 3. Convertir respuesta a voz
      const audioResponse = await this.textToSpeech(chatResponse.message);

      return {
        success: true,
        transcript: transcript.text,
        message: chatResponse.message,
        audio: audioResponse.audioUrl,
        tokens: chatResponse.tokens,
        cost: chatResponse.cost
      };
    } catch (error) {
      console.error('Error en voz:', error);
      return { success: false, message: 'Error al procesar tu voz' };
    }
  }

  /**
   * Transcribir audio a texto (Whisper)
   */
  async transcribeAudio(audioBlob) {
    try {
      const file = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

      const transcript = await client.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'es',
      });

      return {
        success: true,
        text: transcript.text,
        cost: 0.02 // $0.02 por minuto
      };
    } catch (error) {
      console.error('Error transcribiendo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convertir texto a voz
   * Nota: OpenAI TTS es mejor pero caro. Alternativa: usar Web Speech API (gratis)
   */
  async textToSpeech(text) {
    try {
      // Opción 1: OpenAI TTS (más natural, pero $0.015 por 1K caracteres)
      // const audio = await client.audio.speech.create({
      //   model: 'tts-1',
      //   voice: 'nova',
      //   input: text,
      // });

      // Opción 2: Web Speech API (gratis, en navegador)
      // Esto se implementaría en el componente React
      return {
        success: true,
        audioUrl: 'usar-web-speech-api',
        method: 'browser-native', // Gratis
        cost: 0
      };
    } catch (error) {
      console.error('Error en TTS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Estimar costo de API
   */
  estimateCost(usage) {
    const inputCost = (usage.prompt_tokens / 1_000_000) * 0.15; // $0.15 por 1M
    const outputCost = (usage.completion_tokens / 1_000_000) * 0.60; // $0.60 por 1M
    return {
      total: (inputCost + outputCost).toFixed(4),
      tokens: usage.total_tokens,
      breakdown: { input: inputCost.toFixed(4), output: outputCost.toFixed(4) }
    };
  }

  /**
   * Generar respuesta de bienvenida personalizada
   */
  getWelcomeMessage() {
    return {
      greeting: this.engine.generatePersonalizedGreeting(),
      checkInPrompt: '¿Cómo te sentís hoy? (1-10)',
      icon: '💛'
    };
  }

  /**
   * Generar recomendaciones personalizadas
   */
  getPersonalizedRecommendations(emotionalScore, concerns = []) {
    return this.engine.generatePersonalizedRecommendations(emotionalScore, concerns);
  }

  /**
   * Obtener consejo basado en hobby
   */
  getHobbyAdvice(hobbyId) {
    return this.engine.getHobbySpecificAdvice(hobbyId);
  }

  /**
   * Limpiar historial (nueva sesión)
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Obtener estadísticas de uso
   */
  getUsageStats() {
    const totalMessages = this.conversationHistory.length;
    const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
    return { totalMessages, userMessages };
  }
}

export default {
  PersonalizationEngine,
  EmotionAwareChat
};
