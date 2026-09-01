import { OpenAI } from 'openai';
import { buildContextualizedPrompt } from '@/app/utils/vocativeManager';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getSystemPrompt(userProfile, emotionalScore) {
  const name = userProfile?.name || 'hermosa';
  const nicknames = userProfile?.favoriteTermsOfEndearment || [];

  const basePrompt = `Sos amiga de ${name}, pasaste postparto. Validá, escuchá, preguntá. Corto, natural. Energía ${emotionalScore}/10. No ordenes.

IMPORTANTE: Si hay palabras mal escritas o con errores tipográficos, intenta entenderlas por contexto. Busca palabras similares o correcciones ortográficas. Por ejemplo: "Masonenos" probablemente significa "mas o menos". No asumas que son nombres propios. Entiende la intención real del mensaje.`;

  // Inyectar contexto de usuario y reglas de vocativos
  return buildContextualizedPrompt(basePrompt, name, nicknames);
}

const fallbacks = {
  'no puedo': 'Entiendo que es muy duro ahora. ¿Hay alguien cerca tuyo?',
  'lo peor': 'Sé que duele. Esto es temporal. ¿Alguien puede ayudarte ahora?',
  'no duerm': '¿El bebé duerme? ¿O es tu sueño?',
  'default': 'Contame más. ¿Qué es lo que más te cuesta?'
};

function getFallback(message) {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(fallbacks)) {
    if (key !== 'default' && lower.includes(key)) return response;
  }
  return fallbacks.default;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
  });
}

export async function POST(request) {
  const headers = { 'Access-Control-Allow-Origin': '*' };

  try {
    const { message, emotionalContext, userProfile, conversationHistory } = await request.json();

    if (!message || !userProfile) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400, headers });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'API no configurada' }, { status: 500, headers });
    }

    console.log('[API] Request:', { msg: message.substring(0, 30), user: userProfile?.name, historyLength: conversationHistory?.length || 0 });

    const emotionalScore = emotionalContext?.todayScore || 5;
    const systemPrompt = getSystemPrompt(userProfile, emotionalScore);

    // Construir lista de mensajes incluyendo el historial
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Agregar historial de conversación anterior (últimos 50 mensajes ya filtrados del cliente)
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Agregar mensaje actual
    messages.push({ role: 'user', content: message });

    console.log('[API] Calling OpenAI with', messages.length, 'messages...');

    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 150
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 6000))
    ]);

    const responseText = completion.choices[0].message.content;
    console.log('[API] Success');

    return Response.json({
      message: responseText,
      success: true
    }, { headers });

  } catch (error) {
    console.error('[API] Error:', error.message);
    const message = error.message === 'TIMEOUT' ?
      '⏳ Un poco lenta, intenta de nuevo.' :
      getFallback(error.message || '');

    return Response.json({ message, success: true }, { headers });
  }
}
