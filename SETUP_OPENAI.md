# 🚀 Setup OpenAI - Guía Paso a Paso

## ✅ Lo Que Necesitas

1. **Cuenta OpenAI** (si no la tienes)
   - Ve a: https://platform.openai.com/signup
   - Regístrate gratis
   - Completa verificación de email

2. **API Key de OpenAI**
   - Ve a: https://platform.openai.com/account/api-keys
   - Click "Create new secret key"
   - Copia la key (aparece una sola vez)
   - Guárdala en lugar seguro

3. **Firebase Project** (ya lo tenemos)
   - Ya está configurado en `.env.local`

---

## 🔧 Instalación (3 pasos)

### Paso 1: Copiar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# En .env.local, reemplaza esto:
# NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-AQUI-TU-API-KEY-DE-OPENAI

# CON tu API key real:
# NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-abc123xyz...
```

### Paso 2: Instalar OpenAI SDK

```bash
npm install openai
```

### Paso 3: Reiniciar servidor

```bash
# Si está corriendo, Ctrl+C
# Luego:
npm run dev
```

---

## 🧪 Probar que Funciona

### Test desde Terminal

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "No puedo dormir",
    "emotionalContext": {"todayScore": 5},
    "userProfile": {
      "userId": "test-user",
      "name": "Test",
      "favoriteTermsOfEndearment": ["hermosa"],
      "hobbies": ["lectura"],
      "energyLevel": 5
    }
  }'
```

Esperado: 
```json
{
  "message": "Hermosa, es normal no poder dormir...",
  "tokens": 150,
  "cost": "0.0015",
  "success": true
}
```

### Test desde Navegador

1. Abre: http://localhost:3000
2. Ve a tab "Chat"
3. Escribe un mensaje
4. Debería responder desde OpenAI

---

## 💰 Controlar Costos

### Límites Configurables (en `.env.local`)

```env
# Máximo de chats por usuaria por día
MAX_CHATS_PER_DAY=50

# Máximo de tokens por respuesta (controla costo)
MAX_TOKENS_PER_RESPONSE=300

# Presupuesto mensual (en USD)
MONTHLY_OPENAI_BUDGET=500
```

### Costo Real por Uso

```
Chat de texto (150 tokens):    ~$0.01
Chat de voz (transcription):   ~$0.02 + ~$0.01 = $0.03
Promedio por usuaria/mes:      $1-3
```

### Dashboard de Costos (Próximamente)

En `/admin/costs` podrás ver:
- Costo acumulado hoy
- Costo acumulado este mes
- Por usuaria
- Comparación vs presupuesto

---

## 🔐 Seguridad

### Nunca hagas esto:

```bash
# ❌ NO commitees tu API key
git add .env.local  # NUNCA!

# ❌ NO la commits en código
console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY)  // NUNCA!

# ❌ NO la compartas en Slack/Discord
```

### Lo que SÍ hacer:

```bash
# ✅ Usa .env.local (gitignored)
# ✅ En Vercel, agrega en Settings > Environment Variables
# ✅ Si la expones, regenera inmediatamente en OpenAI dashboard
```

### Monitoreo

OpenAI te alerta si:
- Alguien usa tu key desde IP diferente
- Gastos inusuales

Ve a: https://platform.openai.com/account/billing/overview

---

## 🚨 Troubleshooting

### "API key inválida"

```bash
# Verificar que está en .env.local
cat .env.local | grep OPENAI_API_KEY

# Verificar que NO hay espacios
# Debe ser exactamente: sk-proj-...
```

### "Rate limit alcanzado"

```bash
# OpenAI limita a 3,500 requests/min en tier free
# Solución: espera un momento o sube a tier pago
```

### "Error 500 en /api/chat"

```bash
# Revisar logs del servidor
# npm run dev muestra errors en consola

# Verificar que OpenAI SDK está instalado
npm list openai
```

---

## 📊 Monitorear Gastos

```javascript
// En la respuesta de /api/chat, recibes:
{
  cost: "0.0015",  // Costo de este chat
  tokens: 150,     // Tokens usados
  source: "openai-gpt-4o-mini"
}

// Multiplica por número de usuarios para presupuesto mensual
// Si 1,000 usuarios × $1.50/mes = $1,500/mes
```

---

## ✅ Checklist Final

- [ ] Tengo cuenta OpenAI (https://platform.openai.com)
- [ ] Generé API key en https://platform.openai.com/account/api-keys
- [ ] Copié .env.example a .env.local
- [ ] Pegué mi API key en .env.local
- [ ] Corrí `npm install openai`
- [ ] Reinicié servidor con `npm run dev`
- [ ] Testé `/api/chat` desde terminal (curl)
- [ ] Testé chat desde navegador
- [ ] El chat responde en < 2 segundos

Si pasa todos: **¡Estás listo!**

---

## 🎉 Próximos Pasos

1. **Implementar persistencia** (guardar chats en Firestore)
2. **Analytics** (trackear uso por usuaria)
3. **Billing** (conectar Stripe/PayPal)
4. **Voice mejorado** (TTS profesional)
5. **Deploy a Vercel** (producción)

---

## 📞 Soporte

Si algo falla:
1. Verifica los logs: `npm run dev` muestra errores
2. Chequea que API key es válida en https://platform.openai.com/account/api-keys
3. Verifica que `npm install openai` corrió sin errores
4. Revisa que `.env.local` tiene las variables correctas (sin espacios)

