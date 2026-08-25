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

## 🎨 Colores Críticos

- **Sangrado:** Rojo → Rosa → Marrón → Amarillo (lochia progression)
- **Eventos:** Verde (#4CAF50)
- **Síntomas:** Amarillo (#FFC107)
- **Primario:** Amarillo (#FFD700)
- **Secundario:** Rosa (#E91E63)

## 🚀 Comandos Esenciales

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:3000)
npm run build           # Production build
npm start               # Serve production
```

## 📋 Archivo Principal Que Leer Primero

- **ARQUITECTURA_V2.md** — Especificación completa (solo abre si la feature lo requiere)
- **README.md** — Visión general y setup

## 🚫 No Tocar (Salvo Spec Explícita)

- `app/page.js` — Onboarding principal (estable)
- `lib/` — Utilidades compartidas (coordinar cambios)
- `node_modules/`, `.next/`, `build/` — Nunca

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
