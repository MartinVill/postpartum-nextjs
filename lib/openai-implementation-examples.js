// EJEMPLOS DE USO: Motor de Personalización + Chat

/**
 * EJEMPLO 1: Usuaria Lauren
 * Nombre: Lauren
 * Hobbies: Lectura, Pintura
 * Término favorito: "Reina"
 * Bebé: 7 días
 * Energía hoy: 5/10 (media)
 */

export const EXAMPLE_LAUREN = {
  userId: 'user_123',
  name: 'Lauren',
  favoriteTermsOfEndearment: ['Reina', 'Hermosa'],
  hobbies: ['lectura', 'pintura'],
  favoriteBooks: ['It Ends with Us', 'The Midnight Library'],
  favoriteArtists: ['Frida Kahlo', 'Georgia O\'Keeffe'],
  cyclePhase: 'postpartum-week1',
  energyLevel: 5,
  babyAge: 7, // días
  concernsToday: ['sangrado', 'cansancio extremo', 'ansiedad nocturna'],
  lastPeriod: '2026-08-01',
  preferredLanguageTone: 'warm',
};

/**
 * EJEMPLO DE INTERACCIÓN 1: Chat por texto
 *
 * Usuario: "No puedo dormir. El bebé duerme pero mi mente no deja de pensar"
 *
 * Respuesta PERSONALIZADA (sin IA):
 * "Reina, lo que describes es NORMAL. Tu cerebro está en modo alerta porque
 * tu bebé está cerca. Es supervivencia, no debilidad.
 *
 * Sé que amas leer. ¿Qué tal si probamos esto: En lugar de obligarte a dormir,
 * lee 10 minutos algo muy ligero (no thrillers). Tu libro favorito. Después,
 * vuelve a la cama. 📖
 *
 * Si el tema es ansiedad, puedo recomendarte una meditación de 5 min.
 * ¿Qué te parece? 💛"
 *
 * LO QUE HACE ESPECIAL:
 * - Usa "Reina" (su término favorito)
 * - Menciona "leer" (su hobby)
 * - Valida emoción primero
 * - Recommends específicamente para ella
 * - Sin juzgar su falta de sueño
 */

export const EXAMPLE_CHAT_INTERACTION_1 = {
  userMessage: "No puedo dormir. El bebé duerme pero mi mente no deja de pensar",
  emotionalContext: {
    todayScore: 4,
    concerns: ['ansiedad', 'insomnio', 'abrumada'],
    timeOfDay: 'night'
  },
  personalizationFactors: {
    appliedTermOfEndearment: 'Reina',
    appliedHobby: 'lectura',
    appliedCyclePhase: 'postpartum-week1',
    appliedEnergyLevel: 4 // Baja por noche
  },
  expectedResponseCharacteristics: {
    validatesEmotions: true,
    mentionsHobby: true,
    suggestsAlternativeToForceASleep: true,
    recommendsShortMeditationIfNeeded: true,
    usesWarmTone: true
  }
};

/**
 * EJEMPLO 2: Usuaria Sofia
 * Nombre: Sofia
 * Hobbies: Música, Danza, Yoga
 * Término favorito: "Mamá Guerrera"
 * Bebé: 28 días
 * Energía hoy: 7/10 (buena)
 * Diferencia: Más activa, fase de energía
 */

export const EXAMPLE_SOFIA = {
  userId: 'user_456',
  name: 'Sofia',
  favoriteTermsOfEndearment: ['Mamá Guerrera', 'Mi amor'],
  hobbies: ['musica', 'jardineria'],
  favoriteMusicGenres: ['indie', 'folk', 'ukulele covers'],
  favoriteArtists: ['Iron & Wine', 'Daughter', 'The Lumineers'],
  cyclePhase: 'postpartum-week3',
  energyLevel: 7,
  babyAge: 28, // días
  concernsToday: ['quiero ejercitar pero miedo de dañar incisión'],
  lastPeriod: '2026-08-01',
  preferredLanguageTone: 'playful',
};

/**
 * EJEMPLO DE INTERACCIÓN 2: Sofia con buena energía
 *
 * Usuario: "Hoy me siento con energía. ¿Puedo ejercitar?"
 *
 * Respuesta PERSONALIZADA:
 * "¡Mamá Guerrera! Ese ánimo te hace BRILLAR. 🔥
 *
 * Week 3 = sí puedes ejercitar. Empecemos con algo divertido:
 *
 * 🎵 Opción 1: Baila con tu bebé mientras suena tu playlist indie favorita
 * (El bebé ama el movimiento + tú quemas calorías + diversión = triple ganadora)
 *
 * 🌱 Opción 2: Yoga suave (15 min) - nada de presión abdominal
 *
 * 💪 Opción 3: Sentadillas con bebé en brazos (simple pero FUERTE)
 *
 * ¿Cuál te late más? 💛"
 *
 * LO QUE HACE ESPECIAL:
 * - Usa "Mamá Guerrera" (su término favorito)
 * - Responde a su energía con energía
 * - Personaliza con su hobby (música)
 * - Recomendaciones específicas para semana 3
 * - Playful tone (no serio)
 * - Emojis que hacen más viral
 */

export const EXAMPLE_CHAT_INTERACTION_2 = {
  userMessage: "Hoy me siento con energía. ¿Puedo ejercitar?",
  emotionalContext: {
    todayScore: 7,
    concerns: ['miedo incisión'],
    cyclePhase: 'folicular'
  },
  personalizationFactors: {
    appliedTermOfEndearment: 'Mamá Guerrera',
    appliedHobbies: ['musica', 'jardineria'],
    appliedCyclePhase: 'postpartum-week3',
    appliedEnergyLevel: 7,
    appliedTone: 'playful'
  },
  expectedResponseCharacteristics: {
    matchesEnergyLevel: true,
    recommendsMultipleOptions: true,
    mentionsHobbies: true,
    addressesFear: true,
    celebratesGoodMood: true,
    usesFunEmojis: true
  }
};

/**
 * MODELO ECONÓMICO
 */

export const COST_MODEL = {
  title: 'Modelo de costos: PostpartumFitness con OpenAI',

  perUserPerMonth: {
    description: 'Costo aproximado por usuaria por mes',

    scenario1: {
      name: 'Usuaria Light (1 chat por día)',
      chatsPerDay: 1,
      voiceMessagesPerDay: 0,
      estimatedTokensPerChat: 200,
      daysActive: 20, // No todos los días

      calculation: {
        textChats: '20 chats × 200 tokens = 4,000 tokens',
        voiceChats: '0 voice messages',
        totalTokens: 4000,
        costAtGPT4oMini: '$0.05' // (4000/1M)*0.15
      }
    },

    scenario2: {
      name: 'Usuaria Regular (2 chats + 2 voice por día)',
      chatsPerDay: 2,
      voiceMessagesPerDay: 2,
      estimatedTokensPerChat: 250,
      estimatedTokensPerVoice: 400,
      daysActive: 25,

      calculation: {
        textChats: '50 chats × 250 tokens = 12,500 tokens',
        voiceTranscription: '50 × 60 sec avg = $1.00 (Whisper)',
        voiceGeneration: '50 × $0.015 per 100 chars = $0.75 (TTS, optional)',
        totalTokens: 20000,
        costAtGPT4oMini: '$0.18',
        voiceCost: '$1.00 (Whisper) + $0.75 (TTS) = $1.75',
        totalWithVoice: '$1.93'
      }
    },

    scenario3: {
      name: 'Power User (4 chats + 2 voice daily)',
      chatsPerDay: 4,
      voiceMessagesPerDay: 2,
      estimatedTokensPerChat: 300,
      daysActive: 28,

      calculation: {
        textChats: '112 chats × 300 tokens = 33,600 tokens',
        voiceTranscription: '56 × 60 sec = $1.12',
        voiceGeneration: '56 × $0.015 per 100 chars = $0.84',
        totalTokens: 40000,
        costAtGPT4oMini: '$0.40',
        voiceCost: '$1.12 + $0.84 = $1.96',
        totalWithVoice: '$2.36'
      }
    }
  },

  pricingStrategy: {
    trialPeriod: {
      duration: '14 días',
      cost: '$0 (limitado a 10 chats/día)',
      features: 'Chat de texto, recomendaciones personalizadas'
    },

    monthlySubscription: {
      price: '$9.99/mes',
      includedChats: 'Ilimitado',
      includedVoice: 'Ilimitado (WebSpeech API = gratis + Whisper)',

      breakEven: {
        costToCompany: '$0.30 + infra/mgmt',
        margin: '$9.69 por usuaria/mes',
        profitMarginPercent: '97%'
      }
    },

    yearlySubscription: {
      price: '$99/año ($8.25/mes)',
      savings: '17%',
      includedChats: 'Ilimitado',
      includedVoice: 'Ilimitado'
    },

    freeWithAds: {
      description: 'Opción alternativa (futuro)',
      model: 'Chats gratis + anuncios contextuales',
      example: 'Chat sobre depresión = anuncio de nutricionista postparto'
    }
  },

  optimization: {
    cacheResponses: 'Guardar respuestas frecuentes para reutilizar (reduce tokens 90%)',
    batchRequests: 'Agrupar chats si es posible',
    useFasterModel: 'gpt-4o-mini en lugar de gpt-4 (10x más barato)',
    limitTokens: 'max_tokens=250 (respuestas cortas = menos costo)',
    offlineFirst: 'WebSpeech API para voz (gratis) vs Whisper (pago)',
  },

  profitability: {
    monthlyRevenueAt1000Users: {
      scenario: '1,000 usuarias pagando $9.99/mes',
      revenue: '$9,990/mes',
      estimatedAPIcost: {
        average: '$0.40 per user',
        total: '$400/mes'
      },
      grossMargin: '$9,590',
      marginPercent: '96%'
    }
  }
};

/**
 * ARQUITECTURA DE COSTO
 *
 * 💚 WEB SPEECH API (GRATIS)
 * - Text to Speech para respuestas
 * - Navegador nativo = sin costo
 * - Calidad media pero funcional
 *
 * 🎙️ WHISPER API ($0.02/min)
 * - Voice to Text
 * - ~$1 por 50 minutos
 * - Muy preciso en español
 *
 * 💬 GPT-4O-MINI ($0.15 input, $0.60 output per 1M tokens)
 * - Chat + Personalización
 * - ~200-300 tokens por respuesta
 * - ~$0.01-0.05 per chat
 *
 * 📊 FIRESTORE (PAY AS YOU GO)
 * - $0.06 per 100k reads
 * - $0.18 per 100k writes
 * - Gratis primeros 50k reads/writes
 * - Típico: <$10/mes para 10k usuarias
 */

export const TECHNICAL_IMPLEMENTATION = {
  frontend: {
    components: [
      'ChatComponent (texto + voice buttons)',
      'VoiceRecorder (WebRTC)',
      'AudioPlayer (WebAudio API)',
      'EmotionalCheckIn (dropdown/slider)',
      'PersonalizedRecommendations (grid)'
    ]
  },

  backend: {
    endpoints: [
      'POST /api/chat - send message & get response',
      'POST /api/voice/transcribe - Whisper API',
      'GET /api/user/profile - personalization data',
      'POST /api/user/preferences - save hobbies/terms'
    ]
  },

  services: {
    openai: {
      model: 'gpt-4o-mini',
      voiceModel: 'whisper-1',
      features: ['streaming', 'function_calling']
    },
    firestore: {
      collections: [
        'users (profile + preferences)',
        'chats (conversation history)',
        'voice_logs (transcripts)',
        'analytics (usage stats)'
      ]
    }
  }
};

/**
 * DIFERENCIADORES CON OPENAI
 */

export const OPENAI_DIFFERENTIATORS = {
  noCompetitor: {
    feature: 'Cada usuaria ve copy diferente',
    explanation: 'Mientras 10 mamás usan la app, ve 10 bienvenidas diferentes según sus gustos/ciclo/energía',
    value: 'Máxima personalización = máximo engagement'
  },

  emotionalIntelligence: {
    feature: 'IA entiende contexto emocional completo',
    explanation: 'No solo responde texto. Entiende: ciclo menstrual, energía, síntomas, hobbies, miedos',
    value: 'Chat que se siente como una amiga real'
  },

  multimodal: {
    feature: 'Texto + Voz',
    explanation: 'Para mamás que no pueden escribir (brazos ocupados). Hablan → IA escucha → IA responde en voz',
    value: 'Accesibilidad real para el contexto postparto'
  },

  cycleAware: {
    feature: 'Recomendaciones cambian según ciclo menstrual',
    explanation: 'Fase lútea = sugiere rest. Fase folicular = sugiere ejercicio',
    value: 'Respeta ritmo natural del cuerpo (no mainstream)'
  },

  hobbyIntegration: {
    feature: 'Recomendaciones adaptan a hobbies',
    explanation: 'Ama leer? Sugiere libros. Ama pintar? Sugiere pintar emociones',
    value: 'Autocuidado no es sacrificio, es hacer lo que amas'
  }
};

export default {
  EXAMPLE_LAUREN,
  EXAMPLE_SOFIA,
  EXAMPLE_CHAT_INTERACTION_1,
  EXAMPLE_CHAT_INTERACTION_2,
  COST_MODEL,
  TECHNICAL_IMPLEMENTATION,
  OPENAI_DIFFERENTIATORS
};
