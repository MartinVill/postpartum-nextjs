# PostpartumFitness + OpenAI: Arquitectura de Personalización Completa

## 🎯 Visión

Una app que es **una amiga emocional única** para cada usuaria. No dos usuarias ven la misma cosa. Cada chat, cada recomendación, cada palabra está personalizada según:
- Su nombre y términos favoritos de cariño
- Sus hobbies (lectura, pintura, música, etc)
- Su ciclo menstrual (energía y recomendaciones cambian)
- Su energía hoy (1-10)
- Sus síntomas y preocupaciones
- Cuántos días postparto tiene

---

## 🏗️ Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                       │
│  ChatComponent + VoiceRecorder + EmotionalCheckIn      │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   /api/chat          /api/chat/voice
   (texto)            (audio)
        │                   │
        └─────────┬─────────┘
                  ▼
    ┌────────────────────────────────┐
    │  NEXT.JS API ROUTES (Backend)  │
    │  - Validación                  │
    │  - Manejo de errores           │
    │  - Rate limiting               │
    └────────────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   OPENAI APIS              FIRESTORE
   ├─ GPT-4O-MINI          ├─ User Profiles
   │  (Chat principal)      ├─ Chat History
   ├─ Whisper-1            ├─ Preferences
   │  (Speech-to-Text)     └─ Analytics
   └─ TTS
      (Text-to-Speech)
```

---

## 💬 MOTOR DE PERSONALIZACIÓN

### 1. Sistema de Prompts Dinámicos

Cada usuaria tiene un **prompt system único** que se genera al inicio:

```javascript
// EJEMPLO: Para Lauren
const systemPrompt = `
Eres Sofia, compañera emocional de Lauren.

SOBRE LAUREN:
- Término favorito: "Reina"
- Hobbies: lectura, pintura
- Ciclo: postpartum week 1
- Energía: 5/10
- Bebé: 7 días

INSTRUCCIONES:
- Siempre comienza con "Reina"
- Sugiere libros y pintura cuando puedas
- Reconoce que está en semana 1 (máximo rest)
- Energía baja = NO ejercicio, SÍ autocuidado
- Máximo 150 palabras
- Usa emojis cálidos
`;
```

**Resultado**: Lauren ve una app que habla su lenguaje. Cada respuesta siente como escrita para ella.

### 2. Recomendaciones Inteligentes

Basadas en matriz de decisión:

```javascript
const recommendationMatrix = {
  energyLevel: {
    1-3: ['rest', 'meditate', 'read', 'hobby'],
    4-6: ['self-care', 'light-walk', 'hobby'],
    7-10: ['exercise', 'hobby', 'adventure']
  },
  cyclePhase: {
    'menstruation': ['rest', 'iron-rich food', 'comfort'],
    'follicular': ['exercise', 'social', 'adventure'],
    'ovulation': ['high-intensity', 'social'],
    'luteal': ['rest', 'comfort', 'alone-time']
  },
  personalHobbies: {
    'lectura': ['books', 'quiet-time', 'comfort'],
    'pintura': ['creative-expression', 'therapy'],
    'musica': ['dance', 'playlist', 'movement']
  }
};

// Para Lauren: energía 5 + semana 1 + ama leer
// → Recomendación: lee tu libro favorito + autocuidado
```

---

## 🗣️ CHAT MULTI-MODAL

### Flujo Completo

1. **Usuaria habla** (o escribe)
   ```
   "No puedo dormir, el bebé duerme pero mi mente no para"
   ```

2. **Si es voz: Transcribir con Whisper**
   ```
   Audio → Whisper API → "No puedo dormir..."
   Costo: $0.02
   ```

3. **Enviar a OpenAI con contexto personalizado**
   ```javascript
   {
     system: [prompt personalizado para Lauren],
     user: "No puedo dormir...",
     context: {
       energyLevel: 4,
       cyclePhase: "postpartum-week1",
       hobbies: ["lectura", "pintura"],
       emotionalScore: 4
     }
   }
   ```

4. **OpenAI responde (PERSONALIZADO)**
   ```
   "Reina, lo que describes es NORMAL. Tu cerebro está en modo alerta.
   
   Sé que amas leer. ¿Qué tal si probamos: lee 10 minutos algo 
   muy ligero. Tu libro favorito. Después vuelve a la cama.
   
   Si el tema es ansiedad, puedo recomendarte meditación. 💛"
   ```
   Costo: ~$0.01
   Tokens: ~150-200

5. **Si es voz: Reproducir con Web Speech API** (gratis)
   ```
   Respuesta de texto → SpeechSynthesis → Usuario escucha
   Costo: $0 (navegador nativo)
   ```

---

## 💰 MODELO ECONÓMICO

### Costos Reales por Usuaria

```
ESCENARIO 1: Light User (1 chat/día)
─────────────────────────────────────
Chats por mes:        20
Tokens por chat:      200
Total tokens:         4,000
Costo GPT-4o-mini:    $0.05
Costo Whisper:        $0.00
TOTAL:                $0.05/mes


ESCENARIO 2: Regular User (2 text + 2 voice daily)
──────────────────────────────────────────────────
Chats de texto:       50 × 250 tokens = 12,500 tokens
Costo GPT-4o-mini:    $0.18
Costo Whisper:        50 min × $0.02 = $1.00
Costo TTS (opcional): $0.00 (Web Speech API)
TOTAL:                $1.18/mes


ESCENARIO 3: Power User (4 text + 2 voice daily)
────────────────────────────────────────────────
Chats de texto:       112 × 300 tokens = 33,600 tokens
Costo GPT-4o-mini:    $0.40
Costo Whisper:        56 min × $0.02 = $1.12
Costo TTS:            $0.00
TOTAL:                $1.52/mes
```

### Pricing para Usuarias

```
TRIAL: 14 días gratis
├─ 10 chats/día máximo
├─ Chat de texto solamente
└─ Sin voz

MONTHLY: $9.99/mes
├─ Chats ilimitados
├─ Voz ilimitada
├─ Personalización completa
└─ Historial guardado

YEARLY: $99/año ($8.25/mes)
├─ Mismo que monthly
├─ 17% descuento
└─ Compromiso anual
```

### Rentabilidad

```
Con 1,000 usuarias:
─────────────────────
Ingresos:          $9,990/mes
Costo APIs:        $1,200/mes (máximo, assuming power users)
Margen bruto:      $8,790/mes
Margen %:          88%
```

---

## 🔧 IMPLEMENTACIÓN

### Setup Inicial

```bash
# 1. Obtener API keys
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
FIREBASE_PROJECT_ID=postpartum-...

# 2. Instalar dependencias
npm install openai firebase

# 3. Variables de entorno
.env.local:
  NEXT_PUBLIC_OPENAI_API_KEY
  NEXT_PUBLIC_FIREBASE_*

# 4. Ejecutar
npm run dev
```

### Flujo de un Chat

```javascript
// 1. Usuario abre app
// → Cargar userProfile desde Firestore

// 2. Usuario escribe mensaje
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "No puedo dormir",
    emotionalContext: { todayScore: 4 },
    userProfile: userProfile // ← Contiene nombre, hobbies, ciclo, etc
  })
});

// 3. En el backend:
// → GenerarSystemPrompt(userProfile)
// → Llamar OpenAI con sistema personalizado
// → Guardar en Firestore
// → Retornar respuesta

// 4. Mostrar respuesta con opción de escuchar
// → Si usuario da click: Web Speech API reproduce voz
```

---

## 🎯 DIFERENCIADORES COMPETITIVOS

### 1. Máxima Personalización
- Mientras 10 mamás usan la app → 10 experiencias completamente diferentes
- No hay "copy genérico"
- Cada recomendación es para ELLA

### 2. Ciclo Menstrual Aware
- Semana 1: reposo completo (no sugiere ejercicio)
- Semana 2-3: energía baja, autocuidado
- Semana 4: energía retorna, recomendaciones cambian
- Ninguna competidora lo hace

### 3. Hobby Integration
- App aprende qué le gusta
- Recomendaciones personalizadas a sus hobbies
- Lectura → sugiere libros
- Pintura → sugiere pintar emociones
- Música → sugiere bailar

### 4. Voz + Texto
- Mamás ocupadas pueden hablar
- Manos ocupadas con bebé
- Respuestas en voz también (optional)

### 5. Verdadera Inteligencia Emocional
- No solo responde texto
- Entiende contexto emocional completo
- Ciclo menstrual
- Síntomas
- Energía
- Miedos

---

## 🚀 ROADMAP DE ACTIVACIÓN

### Fase 1: MVP (Ahora)
- ✅ Chat de texto personalizado
- ✅ Recomendaciones dinámicas
- ✅ Web Speech API (voz nativa del navegador)

### Fase 2: Voice (Semana 2)
- [ ] Whisper API para transcripción
- [ ] Storage de historiales
- [ ] Analytics básico

### Fase 3: Premium (Semana 3)
- [ ] TTS profesional (OpenAI o similar)
- [ ] Integración Stripe/PayPal
- [ ] Trial automático

### Fase 4: Inteligencia (Mes 2)
- [ ] Function calling (OpenAI ejecuta funciones)
- [ ] Recomendaciones basadas en historial
- [ ] Predicción de estados emocionales

---

## 📊 MÉTRICAS A TRACKEAR

```
Costo por chat:
- Texto: ~$0.01
- Voz: ~$0.15 (transcripción + respuesta)

Uso promedio:
- Light: 20 chats/mes
- Regular: 150 chats/mes
- Power: 300+ chats/mes

Retención:
- Con personalización: +40% vs genérico
- Con voz: +25% vs solo texto

LTV (Lifetime Value):
- Trial conversion: 15%
- Churn mensual: 5%
- LTV = (9.99 × 20 meses) / 0.05 = $3,996
```

---

## 🔐 Consideraciones de Privacidad

```
Datos sensibles que guardamos:
✓ Preferencias (hobbies, términos, ciclo)
✓ Chat history (encriptado)
✗ No guardamos grabaciones de audio
✗ No compartimos con terceros

Cumplimiento:
- GDPR compliant
- CCPA ready
- Derecho a borrar datos
- Transparencia en uso de IA
```

---

## ✨ Por Qué Esto Gana

1. **No hay competencia**: Nadie hace chat postparto personalizado con ciclo menstrual
2. **Economía viral**: A mayor uso, más se personaliza (better recommendations → more usage)
3. **Retención alta**: Máxima personalización = máximo attachment
4. **Margen excelente**: 88% gross margin
5. **Defensible**: Model de datos personalizado es difícil de copiar
6. **Humano primero**: IA sirve a la relación, no lo opuesto

---

## 🎁 Diferenciales Únicos

- **Ciclo menstrual aware**: Ningún otro competidor lo hace
- **Hobby-personalized**: Recomendaciones adaptan a lo que realmente le gusta
- **Voice + Text**: Para manos ocupadas de mamás
- **True emotional intelligence**: No solo chatbot, es amiga
- **Económicamente viable**: $9.99/mes con 88% margen

