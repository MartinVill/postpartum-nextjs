// Servicio de OpenAI para respuestas de Chat

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4-turbo';

// Contexto del sistema para la IA
const SYSTEM_PROMPT = `Eres un asistente especializado de salud postparto para mujeres en recuperación post-cesárea.

Tu rol es:
1. Proporcionar información honesta y basada en evidencia sobre recuperación postparto
2. Identificar banderas rojas que requieren atención médica inmediata
3. Ser empático y apoyo emocional
4. NUNCA diagnosticar - siempre recomendar consultar con médico
5. Responder en español de manera clara y amable

Contexto importante:
- Estás hablando con una mujer que ha tenido una cesárea recientemente
- Su cuerpo está en recuperación crítica
- La seguridad es la prioridad número uno
- La depresión postparto es común y no es culpa de ella

Banderas rojas que requieren atención médica INMEDIATA:
- Sangrado profuso (empapar más de una toalla por hora)
- Fiebre superior a 38°C
- Dolor muy intenso que no mejora con medicinas
- Enrojecimiento, calor o pus en la incisión
- Mareos o desmayos frecuentes
- Pensamientos de hacerse daño o depresión severa

Estructura tus respuestas:
- Sé breve pero completo
- Usa emojis apropiados para calidez
- Termina con preguntas de seguimiento si es relevante
- Si es una bandera roja, sé muy clara y directa

No tengas más de 200 palabras por respuesta.`;

export async function generateChatResponse(userMessage, conversationHistory = []) {
  // Si no hay API key, usar respuestas locales
  if (!OPENAI_API_KEY) {
    return generateLocalResponse(userMessage);
  }

  try {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 300,
        top_p: 0.9,
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return generateLocalResponse(userMessage);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0].message.content,
      source: 'openai'
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return generateLocalResponse(userMessage);
  }
}

// Respuestas locales como fallback
function generateLocalResponse(userMessage) {
  const message = userMessage.toLowerCase();

  // Patrones comunes
  const responses = {
    pain: {
      trigger: ['dolor', 'duele', 'molestia', 'incisión'],
      response: `El dolor leve después de una cesárea es normal. Sin embargo, si es intenso o aumenta, necesitas consultar a tu médico.

Mientras tanto:
- Descansa más
- Toma el medicamento del dolor recetado
- No hagas movimientos bruscos
- Si el dolor es 8+ (en escala 0-10), busca ayuda médica 🏥`
    },
    bleeding: {
      trigger: ['sangrado', 'sangre', 'sangra'],
      response: `El sangrado postparto es normal las primeras semanas, pero hay límites:

⚠️ BUSCA AYUDA MÉDICA SI:
- Cambias más de una toalla por hora
- Sangrado con coágulos grandes
- Olor muy fuerte

Normal:
- Primeros 5 días: rojo brillante
- Semana 2-3: marrón/rosado
- Semanas 3+: muy poco

Si tienes duda, llama a tu médico 📞`
    },
    depression: {
      trigger: ['depresión', 'triste', 'llorar', 'ansiedad', 'pánico', 'suicidio'],
      response: `La depresión postparto NO es debilidad. Es una enfermedad treatable.

Síntomas comunes:
- Tristeza persistente
- Falta de esperanza
- Incapacidad para disfrutar
- Ansiedad o pánico
- Pensamientos oscuros

Esto es IMPORTANTE: No estás sola. Hay ayuda:
📞 Postpartum Support: 1-800-944-4773
🏥 Habla con tu médico
👥 Busca terapeuta especializada

Tomar medicinas es seguro, incluso amamantando.

¿Cómo te sientes hoy específicamente? 💙`
    },
    exercise: {
      trigger: ['ejercicio', 'workout', 'actividad', 'entrenar'],
      response: `El ejercicio postparto debe ser gradual y seguro.

SEMANA 1-2:
- Solo respiración y estiramiento suave
- 5-10 minutos máximo
- Sin presión abdominal

SEMANA 3+:
- Pequeños aumentos en intensidad
- Escucha a tu cuerpo
- Para si sientes dolor intenso

EVITA:
- Abdominales tradicionales (primeras 6 semanas)
- Saltos o impacto (primeras 8 semanas)
- Levantar cosas pesadas

¿En qué semana de recuperación estás? 💪`
    },
    nutrition: {
      trigger: ['comida', 'nutrición', 'hambre', 'dieta', 'hierro'],
      response: `La nutrición es clave para recuperarte rápido.

PRIORIDADES:
🥩 Hierro: Carnes rojas, lentejas, espinacas
🍗 Proteína: Pollo, pescado, huevos, yogur
🍊 Vitamina C: Cítricos, fresas, brócoli
🥛 Calcio: Leche, queso, almendras

TIP: Come carne CON naranja/tomate para absorber mejor el hierro.

¿Tienes algún alimento que te cuesta comer? Puedo sugerir alternativas 🥗`
    },
    pelvic: {
      trigger: ['piso pélvico', 'kegel', 'incontinencia'],
      response: `El piso pélvico es CRÍTICO después de una cesárea.

Aunque la cesárea no lo daña directamente, debilidad pélvica causa:
- Incontinencia urinaria (30-40% después del parto)
- Dolor pélvico crónico
- Problemas sexuales futuros

COMIENZA SUAVE:
- Semana 1: Solo conciencia (identifica dónde está)
- Semana 2: Kegels suaves (3 segundos)
- Semana 3+: Aumenta gradualmente

Si sigue siendo problema después, un fisioterapeuta especializado puede ayudar.

¿Tienes síntomas de incontinencia? 💙`
    }
  };

  // Buscar patrón coincidente
  for (const [key, data] of Object.entries(responses)) {
    if (data.trigger.some(t => message.includes(t))) {
      return {
        success: true,
        message: data.response,
        source: 'local'
      };
    }
  }

  // Respuesta por defecto
  return {
    success: true,
    message: `Me encantaría ayudarte. 💙

Puedo responder preguntas sobre:
- Dolor y recuperación
- Sangrado postparto
- Ejercicio seguro
- Nutrición
- Salud mental
- Piso pélvico

¿Cuál es tu pregunta específica?

Si es una emergencia médica (fiebre alta, sangrado profuso, dolor muy severo), llama a emergencias 🚑`,
    source: 'local'
  };
}

// Validar si es una bandera roja
export function checkRedFlags(message) {
  const redFlags = [
    { pattern: /fiebre|fever|38|39|40/, type: 'fever', severity: 'critical' },
    { pattern: /sangrado.*profuso|sangra.*mucho|empapar|hemorragia/, type: 'bleeding', severity: 'critical' },
    { pattern: /pensamientos.*daño|suicida|matarme|quiero morir/, type: 'suicidal', severity: 'critical' },
    { pattern: /pus|infección|inflamación|rojo|caliente/, type: 'infection', severity: 'high' },
    { pattern: /mareos|desmayo|no puedo respirar/, type: 'cardiac', severity: 'high' }
  ];

  for (const flag of redFlags) {
    if (flag.pattern.test(message.toLowerCase())) {
      return {
        isRedFlag: true,
        type: flag.type,
        severity: flag.severity,
        message: `⚠️ BUSCA AYUDA MÉDICA INMEDIATAMENTE 🚑\n\nLlama a emergencias (911) o ve al hospital ahora.`
      };
    }
  }

  return { isRedFlag: false };
}

export default {
  generateChatResponse,
  checkRedFlags
};
