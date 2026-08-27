# Postpartum Health - App de Salud Posparto

Una aplicación web moderna para mujeres en recuperación posparto con seguimiento de sangrado, calendario integrado, check-ins diarios emocionales, retos de 30 días y soporte comunitario.

🚀 **[Accede a la app en vivo](https://postpartum-nextjs-martinvill.vercel.app)** — Deployada en Vercel

## 🎯 Objetivo

Proporcionar una plataforma integral de apoyo emocional, seguimiento de síntomas y educación para la recuperación postparto segura.

## ✨ Features Principales

### 1. **Onboarding Personalizado**
- Registro de nombre, hobbies, fecha última menstruación
- Edad del bebé
- Término de cariño personalizado

### 2. **Calendario Integrado** (`app/components/Calendar.jsx`)
- Vista mensual tipo Google Calendar
- Seguimiento de sangrado postparto con color-progresión
- Registro de eventos/síntomas con hora (opcional)
- Notificaciones opcionales
- Persistencia en localStorage
- Diseño mobile-responsive con teclado virtual optimizado

### 3. **Check-in Diario Emocional** (`app/components/DailyCheckIn.jsx`)
- Evaluación de energía (slider 1-10)
- Historial persistente
- Recomendaciones personalizadas

### 4. **Retos de 30 Días** (`app/components/DailyChallenge.jsx`)
- Retos rotativos semanales
- Sistema de puntos
- Seguimiento de progreso
- Badges y logros

### 5. **Reflexión Nocturna** (`app/components/NightReflection.jsx`)
- Preguntas reflexivas
- Gratitud diaria
- Notas personales

### 6. **Chat Emocional** (`app/components/ChatSection.jsx`)
- Integración OpenAI (con fallback)
- Soporte emocional sin juzgar
- FAQ pre-configuradas

### 7. **Feed Dinámico** (`app/components/DynamicFeed.jsx`)
- Contenido educativo
- Tips de cuidado
- Actualizaciones personalizadas

## 📱 Stack Tecnológico

```
Frontend:     Next.js 13+ (React)
Styling:      CSS-in-JS inline (flexible para Tailwind)
Storage:      localStorage (offline-first)
AI:           OpenAI API (fallback con respuestas estáticas)
PWA:          Manifest + Service Workers (en desarrollo)
Build:        npm / Node.js
```

## 🚀 Cómo Empezar

### Instalación

```bash
# Instalar dependencias (REQUERIDO con legacy-peer-deps)
npm install --legacy-peer-deps

# Configurar OpenAI (REQUERIDO para que el chat funcione)
# Crear archivo: .env.local
# Contenido:
# OPENAI_API_KEY=sk-[tu-clave-openai-aqui]
```

### Desarrollo Local

```bash
# Iniciar servidor dev
npm run dev
# Esperar: ✓ Ready in Xs

# En teléfono o navegador:
# http://localhost:3000 (desktop)
# http://192.168.1.34:3000 (desde móvil en la misma red)
```

**Verificación post-startup (ANTES de hacer cambios):**
1. Servidor dice "Ready in Xs" (no cuelga compilando)
2. App carga en teléfono: slider de energía visible
3. Chat responde cuando escribes algo
4. Calendario muestra días con color

Si algo falla aquí: **arregla el servidor ANTES de tocar código**

### Build para Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
postpartum-nextjs/
├── app/
│   ├── components/              # Componentes React principales
│   │   ├── Calendar.jsx         # Calendario con sangrado/eventos
│   │   ├── DailyCheckIn.jsx     # Check-in emocional
│   │   ├── DailyChallenge.jsx   # Retos de 30 días
│   │   ├── NightReflection.jsx  # Reflexión nocturna
│   │   ├── ChatSection.jsx      # Chat emocional
│   │   ├── DynamicFeed.jsx      # Feed de contenido
│   │   └── OnboardingForm.jsx   # Onboarding inicial
│   ├── api/                     # Rutas API
│   │   └── chat/               # Endpoints para IA
│   ├── admin/                   # Panel admin (opcional)
│   ├── layout.js               # Layout principal
│   └── page.js                 # Página raíz
├── lib/                         # Utilidades compartidas
│   ├── app-config.js           # Config global
│   ├── validators.js           # Validaciones
│   └── [otros helpers]
├── public/                      # Assets estáticos
│   ├── manifest.json           # PWA manifest
│   └── [imágenes/avatares]
├── ARQUITECTURA_V2.md          # Especificación completa de features
├── package.json                # Dependencias
├── next.config.ts              # Config Next.js
└── README.md                   # Este archivo
```

## 🎨 Diseño

### Paleta de Colores (NO CAMBIAR)
- **Primario**: Magenta (#D946EF) - Botones, interacción
- **Fondo Gradiente**: #FFF8DC → #FFF5E1 (crema claro → oscuro)
- **Chat Primario**: Blanco con sombras suaves
- **Sangrado**: Rojo → Rosa → Marrón → Amarillo (progresión de lochia)

### Componentes Clave
- Color verde para "eventos"
- Color amarillo para "síntomas"
- Color rojo/rosa para "sangrado postparto"
- Bordes punteados para períodos menstruales

## 📊 Persistencia de Datos

**localStorage keys:**
```javascript
userProfile         // { name, babyBirthDate, lastMenstruationDate, hobbies, endearment }
userId              // ID único del usuario
energyScore         // Último score de energía
eventLogs           // Array de eventos/síntomas
sangradoLogs        // Array de registros de sangrado
dailyChallengeData  // { currentChallenge, completed, streak, points }
nightReflections    // Historial de reflexiones
```

## 🚫 BLOQUEADOS - NO TOCAR

Estas features funcionan perfectamente y han sido estabilizadas. **No modificar:**

```
❌ app/components/ChatSection.jsx     — Chat con OpenAI funciona
❌ app/components/Calendar.jsx        — Sangrado postparto estable
❌ app/api/chat/route.js              — OpenAI integration completa
❌ next.config.ts                     — Turbopack deshabilitado (correcto)
```

**Tocar estos archivos = romper features que funcionan.**

---

## 🔧 Para Otra IA (Codex, Gemini, etc.)

### Puntos de Entrada
1. **Onboarding**: `app/page.js` → `OnboardingForm.jsx`
2. **Calendario**: `Calendar.jsx` (640 líneas, manejo completo de fechas)
3. **Retos**: `DailyChallenge.jsx` (gamificación + persistencia)
4. **Chat**: `ChatSection.jsx` + `app/api/chat/route.js`

### Próximas Features
- [ ] Reto de 30 días (UI completa, lógica de progresión)
- [ ] Chat mejorado con IA contextual
- [ ] Integración PayPal para suscripción
- [ ] Notificaciones push
- [ ] Compartir logros con comunidad
- [ ] Videos de ejercicio embebidos

### Parámetros de Config
- Ver `ARQUITECTURA_V2.md` para especificación completa
- Ver `lib/app-config.js` para valores configurables

## 📝 Notas Importantes

- **Médica**: Esta app es educativa. Siempre consultar con médico.
- **Privacidad**: Datos guardados localmente (localStorage), NO se envían servidores (excepto chat OpenAI si está habilitado)
- **Mobile-First**: Optimizado para teléfono, responsive en desktop
- **Offline**: Funciona sin internet (excepto chat)

## 📖 Documentación Adicional

- **[ARQUITECTURA_V2.md](./ARQUITECTURA_V2.md)** - Especificación completa de features y UX
- **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** - Checklist para producción
- **[SETUP_OPENAI.md](./SETUP_OPENAI.md)** - Configuración de OpenAI API

## 🤝 Contribuciones

Para trabajar en nuevas features:
1. Leer `ARQUITECTURA_V2.md` para entender el diseño general
2. Seguir estructura de componentes en `app/components/`
3. Usar localStorage para persistencia
4. Mobile-first responsive design

## 👤 Autor

Martín Villarroel
Email: martinvillarroel639@gmail.com

## 📄 Licencia

Privado - Para uso personal

---

**Versión**: 2.0 (En desarrollo)  
**Última actualización**: Agosto 25, 2026  
**Estado**: 
- ✅ Onboarding: Funcional
- ✅ Calendario: Sangrado + eventos funcionales
- ✅ Chat: OpenAI integration estable
- ✅ Check-in emocional: Funcional
- 🔄 Retos de 30 días: En desarrollo
- ⏳ Reflexión nocturna: Pendiente
- ⏳ Feed dinámico: Pendiente
