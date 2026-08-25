/**
 * API ROUTE: POST /api/chat/extract-preferences
 * Extrae preferencias nuevas del historial de chat usando OpenAI
 * Se ejecuta cada N mensajes para aprender más sobre la usuaria
 */

import { OpenAI } from 'openai';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { userId, currentProfile } = await request.json();

    if (!userId || !currentProfile) {
      return Response.json({ error: 'userId y currentProfile requeridos' }, { status: 400 });
    }

    // Obtener últimos 20 mensajes del chat para analizar
    const messagesRef = collection(db, 'users', userId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const recentMessages = querySnapshot.docs
      .slice(0, 20)
      .reverse()
      .map(doc => ({
        role: doc.data().role,
        text: doc.data().text
      }));

    if (recentMessages.length < 5) {
      return Response.json({
        success: false,
        message: 'No hay suficientes mensajes para extraer preferencias'
      });
    }

    // Construir prompt para extraer preferencias
    const extractionPrompt = `Eres un asistente que extrae preferencias y patrones de conversaciones para personalizar mejor el coaching.

PERFIL ACTUAL DE ${currentProfile.name}:
- Hobbies: ${currentProfile.hobbies.join(', ')}
- Fase del ciclo: ${currentProfile.cyclePhase}
- Edad del bebé: ${currentProfile.babyAge} meses
- Términos de cariño preferidos: ${currentProfile.favoriteTermsOfEndearment.join(', ') || 'ninguno específico'}

HISTORIAL RECIENTE DEL CHAT:
${recentMessages.map(m => `${m.role === 'user' ? 'USUARIO' : 'SOFIA'}: ${m.text}`).join('\n')}

Analiza el historial y extrae:
1. Nuevos hobbies o actividades mencionadas (agregar a la lista actual)
2. Problemas específicos (sueño, ansiedad, energía, relación, etc.)
3. Patrones de comportamiento o preferencias comunicativas
4. Cualquier cosa que mencione sobre cómo le gusta ser tratada

Responde en JSON con esta estructura:
{
  "newHobbies": [],
  "specificChallenges": [],
  "communicationPreferences": [],
  "learnings": ""
}

Sé conciso. Solo incluye información clara del chat.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: extractionPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    let extractedData = {
      newHobbies: [],
      specificChallenges: [],
      communicationPreferences: [],
      learnings: ''
    };

    try {
      const responseText = completion.choices[0].message.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('[EXTRACT] No se pudo parsear respuesta de OpenAI');
    }

    // Actualizar perfil con nuevas preferencias
    const updatedProfile = { ...currentProfile };

    if (extractedData.newHobbies && extractedData.newHobbies.length > 0) {
      extractedData.newHobbies.forEach(hobby => {
        if (!updatedProfile.hobbies.includes(hobby)) {
          updatedProfile.hobbies.push(hobby);
        }
      });
    }

    updatedProfile.specificChallenges = extractedData.specificChallenges;
    updatedProfile.communicationPreferences = extractedData.communicationPreferences;
    updatedProfile.learnings = extractedData.learnings;
    updatedProfile.lastPreferenceUpdate = new Date().toISOString();

    // Guardar en Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updatedProfile,
      updatedAt: new Date().toISOString()
    });

    console.log(`[EXTRACT] Preferencias actualizadas para ${userId}`);
    return Response.json({
      success: true,
      extracted: extractedData,
      updatedProfile
    });
  } catch (error) {
    console.error('[EXTRACT] Error extrayendo preferencias:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
