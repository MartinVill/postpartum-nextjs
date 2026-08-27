# CLAUDE.md - Postpartum Health App

## 📱 Stack
- **Frontend:** Next.js 13+ (React)
- **Styling:** CSS-in-JS inline (no Tailwind)
- **Storage:** localStorage (offline-first)
- **AI:** OpenAI API (fallback: respuestas estáticas)
- **Build:** npm + Node.js

## 📁 Estructura Clave

```
app/
├── components/          # React components (UI)
│   ├── Calendar.jsx     # Sangrado + eventos (1000 líneas, ESTABLE)
│   ├── DailyChallenge.jsx
│   ├── DailyCheckIn.jsx
│   ├── ChatSection.jsx
│   ├── NightReflection.jsx
│   ├── DynamicFeed.jsx
│   └── OnboardingForm.jsx
├── api/                 # API routes
│   ├── chat/
│   └── user/
├── page.js             # Entry point (onboarding → tabs)
└── layout.js           # PWA layout

lib/                    # Utilities (no editar salvo spec)
├── app-config.js
├── validators.js
├── gamification.js
├── educational-content.js
└── [otros helpers]

public/                 # Assets
```

## 🔑 localStorage Keys

```javascript
userProfile             // { name, babyBirthDate, lastMenstruationDate, hobbies, endearment }
userId                  // Unique user ID
energyScore             // Last energy check-in (1-10)
eventLogs               // Array: { id, name, time, date, type, notification }
sangradoLogs            // Array: { date, notes }
dailyChallengeData      // { currentChallenge, completed, streak, points }
nightReflections        // Array: { date, reflection, gratitude }
```

## 🎨 Colores Críticos (NO CAMBIAR)

- **Primario:** Magenta (#D946EF) — Botones, interacción
- **Fondo Gradiente:** #FFF8DC → #FFF5E1 (crema)
- **Chat:** Blanco con sombras suaves
- **Sangrado:** Rojo → Rosa → Marrón → Amarillo (lochia progression)

## ⚙️ Configuración REQUERIDA

**Archivo:** `.env.local`
```
OPENAI_API_KEY=sk-[TU-CLAVE-AQUI]
```
**Sin esto:** El chat NO funciona. Crear archivo si no existe.

## 🚀 Comandos Esenciales

```bash
npm install --legacy-peer-deps  # Install dependencies (REQUERIDO)
npm run dev                      # Start dev server (localhost:3000)
npm run build                    # Production build
npm start                        # Serve production
```

**Verificar post-startup:**
1. Terminal dice: `✓ Ready in Xs`
2. App carga: `http://192.168.1.34:3000` (desde teléfono)
3. Chat responde
4. Calendario visible

## 📋 Archivo Principal Que Leer Primero

- **ARQUITECTURA_V2.md** — Especificación completa (solo abre si la feature lo requiere)
- **README.md** — Visión general y setup

## 🚫 BLOQUEADOS - NO TOCAR (Por ningún motivo)

- ❌ `app/components/ChatSection.jsx` — Chat con OpenAI (ESTABLE, tardó horas)
- ❌ `app/components/Calendar.jsx` — Sangrado + eventos (ESTABLE, 1000 líneas)
- ❌ `app/api/chat/route.js` — OpenAI endpoint (COMPLETO)
- ❌ `next.config.ts` — Turbopack deshabilitado (correcto así)

**Por qué?** Estas features fueron completadas y estabilizadas. Cambiarlas rompe todo.

## ✅ Convenciones

- **Componentes:** Functional + useState/useEffect
- **Props:** Pasar solo lo necesario
- **Persistencia:** Siempre con localStorage
- **Mobile-first:** 100dvh + responsive design
- **Commits:** Mensaje claro + `/clear` entre features

## 📊 Estado Actual

Ver: **docs/estado-proyecto.md** (actualizado al cerrar cada feature)

## 🎯 Flujo Para IAs Externas

1. Leer este archivo primero (~2 min)
2. Leer README.md para contexto
3. Leer ARQUITECTURA_V2.md SOLO si la feature lo requiere
4. Pedí un plan de 5-10 líneas antes de editar
5. Ejecutá cambios mínimos + tests focalizados
6. Mostrá diff breve (máximo 50 líneas)

## 🔗 GitHub

https://github.com/MartinVill/postpartum-nextjs

---

**Última actualización:** 25 Agosto 2026  
**Versión:** 2.0 (En desarrollo)
