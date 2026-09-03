# Estado del Proyecto — Posparto

**Última actualización:** 3 de septiembre de 2026  
**Versión de trabajo:** 3.0  
**Estado general:** MVP funcional desplegado en producción  
**Producción:** https://postpartum-nextjs.vercel.app/

---

## Resumen actual

Posparto es una PWA mobile-first de acompañamiento emocional y bienestar para madres en los primeros 0–12 meses posparto. La experiencia actual prioriza pasos breves, lenguaje cálido y control claro sobre recordatorios.

- **Framework:** Next.js 16 (App Router) + React 19.
- **Interfaz:** CSS-in-JS/estilos inline; fondo estándar `#FFFDF6` y magenta `#D946EF` para acciones.
- **Persistencia local:** `localStorage` para datos de uso inmediato/offline.
- **Persistencia servidor:** Firebase Admin + Firestore para suscripciones push, preferencias, recordatorios y minutos de respiración.
- **Producción:** Vercel, con deploy automático al hacer push a `main`.

---

## Experiencia principal

### Onboarding y Home

- El onboarding se redujo a **4 pasos**; el antiguo paso de horario de sueño ya no forma parte del flujo.
- Al finalizar, la app solicita permiso de notificaciones desde una acción de la usuaria y abre el dashboard.
- La Home utiliza `#FFFDF6` de extremo a extremo, sin franjas blancas en el encabezado ni en la grilla.
- El reto diario conserva un solo gesto de finalización, celebración y modal emocional.
- La navegación inferior se renderiza una sola vez a nivel raíz y permanece fija en Inicio, Calendario, Perfil, Chat, Reto y Cuerpo y Calma. El contenido tiene espacio inferior para no quedar oculto detrás de ella.

### Check-in emocional

- Slider de energía y registro por voz opcional.
- El check-in local se conserva en `dailyCheckIn` y `lastCheckIn`.
- Cuando hay una suscripción push activa, el check-in también informa al backend para evitar el recordatorio matutino si ya fue realizado ese día.
- La pantalla usa el mismo fondo crema de la Home.

### Calendario y eventos

**Archivo base bloqueado:** `app/components/Calendar.jsx`.

- Vista mensual con seguimiento de sangrado posparto y códigos visuales por tipo.
- Fondo unificado con la Home (`#FFFDF6`).
- Barra rápida para crear **Evento** o **Síntoma** debajo del calendario, con entrada de texto, selector de tipo y acción `+`.
- Al tocar una fecha se abre el flujo de creación; si la fecha ya contiene elementos, se muestra primero una lista compacta de los eventos de ese día.
- Soporta varios eventos en una misma fecha.
- Las tarjetas de evento usan contorno verde; los síntomas, contorno amarillo. Los síntomas no muestran hora ni recordatorios.
- Las tarjetas de evento muestran hora, edición directa con lápiz y recordatorios compactos.
- Se pueden añadir, cambiar o quitar varios recordatorios por evento (`15 min`, `30 min`, `1 h` y `1 día antes`).
- Los eventos se conservan en `eventLogs`; los recordatorios de eventos también se sincronizan con Firestore para entrega push.
- Se normalizaron fechas y timestamps para evitar que un evento creado para ayer, hoy o mañana se marque en un día distinto por zona horaria.

### Chat de apoyo

**Archivos bloqueados:** `app/components/ChatSection.jsx` y `app/api/chat/route.js`.

- Chat con OpenAI y fallback configurado por la app.
- Layout móvil de pantalla completa: el área de mensajes se adapta al viewport y el campo de entrada queda fijo sobre la navegación/teclado cuando el navegador lo permite.
- Estado vacío con la guía “Escribe algo abajo”.
- Se retiraron los controles visuales de feedback 👍/👎: no existía un circuito de aprendizaje o entrenamiento que aprovechara esas señales, por lo que se evitó presentar un control sin efecto real.

### Reto del día

- La tarjeta de reto está centrada, con un único botón “¡Lo hice!”, confeti, sonido de celebración y cierre emocional.
- Se corrigió el espacio blanco que aparecía al hacer scroll al final, manteniendo intacta la navegación inferior fija.

---

## Cuerpo y Calma

### Categorías generales

- Cuatro categorías: **Respiración y Core**, **Estiramiento y Postura**, **Relajación y Pausa** y **Movimiento Suave**.
- Todos los títulos de categorías y actividades están centrados; el botón de regreso queda posicionado de forma independiente a la izquierda para no desplazar el texto.
- Se eliminan los emojis del texto de los encabezados para evitar solapamientos en móvil.
- Fondo de toda la sección y de sus tarjetas: `#FFFDF6`.
- Modal de bienvenida con el mensaje de cuidado médico actualizado, texto oscuro de 16 px y botón magenta “Entendido”.

### Respiración y Core

**Vista específica:** `app/components/BodyAndCalm/BreathingAndCoreExperience.jsx`.

- Acceso rápido “Pausa rápida de 2 minutos” y tres tarjetas de necesidad concreta:
  - Respiración Diafragmática — “Alivia la presión lumbar”.
  - Activación de Core Suave — “Reconecta tu abdomen”.
  - Relajación de Suelo Pélvico — “Suelta la tensión acumulada”.
- La guía visual silenciosa realiza **10 ciclos** exactos: inhala 4 s, sostén 2 s y exhala 6 s; la duración total es 2 minutos.
- Orbe magenta de alto contraste y escala amplia, anillo SVG de progreso sincronizado, texto de fase grande y diez indicadores de ciclo.
- Vibración suave en los cambios de fase cuando el dispositivo la admite.
- Botón `×` discreto para salir sin confirmación ni mensajes de culpa.
- Al completar se muestra un cierre cálido y se suman 2 minutos al total semanal.
- El acumulador solo aparece después de la primera sesión completada; se guarda en `users/{userId}/stats/breathing` y cuenta con respaldo local para conexiones intermitentes.
- Durante una sesión se solicita **Wake Lock** de pantalla para que el teléfono permanezca encendido. Se libera al terminar, cancelar o salir; depende de que el navegador/dispositivo admita esta API.

**Archivo bloqueado:** `app/components/BodyAndCalm/ExercisePlayer.jsx`. Las actividades de las otras categorías siguen usando su reproductor estable.

---

## Notificaciones Web Push

### Activación y preferencias

- La app **no solicita permiso automáticamente al montar**. El permiso se pide únicamente al pulsar “Activar notificaciones” en Perfil.
- El estado visible es: **Activas**, **Bloqueadas** o **Desactivadas**.
- Tras conceder el permiso, se registra el Service Worker, se crea la suscripción Web Push y se guarda en Firestore.
- Los ajustes de bienestar diario (interruptor y horarios de registro/pausa) se guardan en `users/{userId}/settings/notifications` y se propagan a las suscripciones, por lo que la interfaz refleja el horario que consulta el backend.

### Tipos de entrega implementados

| Tipo | Regla de entrega | Destino |
|---|---|---|
| Recordatorio de evento | Se procesa al llegar `triggerTimestamp` UTC del recordatorio pendiente. | Calendario y evento asociado |
| Registro diario | Se envía a la hora configurada, salvo que la usuaria ya haya realizado su check-in ese día. | `/checkin` |
| Pausa diaria | Se envía a la hora configurada si Bienestar diario está activo. | `/respiracion` |

- Copy actual: “Tu registro de hoy 💜 / ¿Cómo te sientes en este momento?” y “Un momento para ti ✨ / ¿Hacemos una pausa para respirar?”.
- El Service Worker (`public/sw.js`) incorpora ícono, badge, vibración suave, etiquetas para agrupar alertas y acciones “Abrir ahora” / “Recordar en 15m”.
- La acción de posponer usa `/api/notifications/snooze` cuando la notificación contiene un recordatorio de calendario válido.
- Las suscripciones se almacenan en `push_subscriptions`; los avisos de calendario en `scheduled_reminders`.
- `/api/cron/process-reminders` hace la entrega real, registra diagnósticos de recordatorios pendientes, controla reintentos y marca como enviados únicamente los que fueron aceptados por el proveedor push.

### Operación y límites reales

- El procesador de cron requiere una llamada autenticada con `Authorization: Bearer <CRON_SECRET>`. Debe mantenerse una tarea externa recurrente (por ejemplo, Cron-Job.org) para ejecutar `/api/cron/process-reminders`.
- El endpoint histórico `/api/notifications/send-scheduled` sigue siendo una utilidad de previsualización/simulación; la entrega productiva se realiza desde `/api/cron/process-reminders`.
- La recepción en segundo plano requiere HTTPS, permiso concedido y una suscripción válida. En iPhone/iPad, Web Push requiere iOS/iPadOS 16.4+ y la PWA instalada en pantalla de inicio.
- Las pruebas definitivas de notificaciones y Wake Lock se hacen en un teléfono real: un navegador de escritorio no puede simular el apagado físico de la pantalla ni todas las restricciones del sistema operativo.

### Variables de entorno necesarias

No deben guardarse en Git ni copiarse al documento:

```text
OPENAI_API_KEY
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
CRON_SECRET
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

---

## Datos y arquitectura

### LocalStorage principal

```text
userProfile
userId
energyScore
dailyCheckIn
lastCheckIn
eventLogs
sangradoLogs
postpartum_active_challenge
postpartum_breathing_minutes_{userId}
```

### Firestore

```text
users/{userId}/settings/notifications
users/{userId}/stats/breathing
push_subscriptions/{subscriptionId}
scheduled_reminders/{reminderId}
```

El uso local sigue siendo el respaldo inmediato para la experiencia offline. Firestore se utiliza donde hace falta sincronización o procesamiento en segundo plano: push, recordatorios y estadísticas semanales de respiración.

---

## Archivos protegidos

No modificar salvo instrucción explícita del responsable del proyecto:

```text
app/components/ChatSection.jsx
app/components/Calendar.jsx
app/components/BodyAndCalm/ExercisePlayer.jsx
app/api/chat/route.js
next.config.ts
```

---

## Verificación de cambios

Para cualquier cambio de código:

1. Ejecutar `npm run build` sin errores.
2. Hacer commit y `git push origin main`.
3. Esperar el deploy de Vercel.
4. Validar la interfaz o el flujo en https://postpartum-nextjs.vercel.app/ cuando sea posible.

---

## Próximos focos recomendados

1. Realizar una matriz de pruebas en teléfonos Android y iOS/PWA para recordatorios, Wake Lock y teclado virtual.
2. Configurar y monitorizar el cron externo de producción; revisar los logs de Vercel ante fallas de push.
3. Mantener pruebas de regresión manuales para Calendario, Chat y ExercisePlayer antes de cualquier cambio transversal.
4. Evaluar nuevas funciones solo si mantienen la promesa de bajo esfuerzo, calidez y control real para la madre posparto.
