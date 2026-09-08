# Inventario de datos y riesgos — lanzamiento AR/EE. UU.

Estado: borrador operativo. No reemplaza una revisión legal ni clínica independiente.

## Principios ya aplicados

- No se usa IA para decidir seguridad del plan inicial; solo reglas deterministas y conservadoras.
- Las respuestas de bienestar se solicitan con consentimiento explícito y se pueden omitir.
- No se deben enviar síntomas, estado emocional, ciclo, conversaciones ni audio a píxeles publicitarios o plataformas de analítica.
- El producto debe describirse como bienestar general. No diagnostica, trata, cura, previene ni sustituye atención profesional.

## Inventario actual

| Categoría | Datos | Uso previsto | Almacenamiento actual | Riesgo / acción obligatoria |
| --- | --- | --- | --- | --- |
| Identidad | nombre, email, Firebase UID | cuenta y recuperación de sesión | `localStorage`; Firestore al activar cuenta | reglas Firestore por UID, eliminación de cuenta y política de retención |
| Bienestar posparto | fecha nacimiento bebé, tipo de parto, alta médica, molestias físicas y emocionales | guía inicial conservadora | `localStorage`; Firestore al activar cuenta | dato sensible: consentimiento, minimización, acceso restringido, no publicidad |
| Ciclo y calendario | eventos, síntomas, sangrado, recordatorios | seguimiento personal y avisos | `localStorage`; sincronización de recordatorios | cifrado en tránsito, autorización por UID, borrado exportable |
| Chat y voz | mensajes, audios/transcripciones y contexto | respuesta de IA | API de chat / proveedor IA | consentimiento separado, retención definida, no entrenar modelos con datos sin permiso explícito |
| Notificaciones | suscripción web push, horarios | recordatorios solicitados | Firestore / navegador | permiso iniciado por usuaria, revocación clara |
| Pago y prueba | inicio de prueba, acceso y futura transacción PayPal | acceso al producto | perfil / futuro proveedor de pagos | PayPal debe ser fuente de verdad; no almacenar tarjetas |

## Controles por implementar antes de publicidad o cobro

1. Política de privacidad pública, términos, contacto de soporte, política de borrado y retención aprobados por abogado.
2. Borrado de cuenta y datos desde la app y mediante URL pública.
3. Reglas Firestore y rutas API: cada lectura/escritura limitada al UID autenticado.
4. Consentimiento específico para: datos sensibles, notificaciones, procesamiento de voz/IA y analítica no esencial.
5. Registro de accesos y errores sin incluir contenido sensible; rate limiting para autenticación, chat y APIs públicas.
6. Revisión clínica de señales de alerta y recursos de ayuda para Argentina y Estados Unidos.
7. Inventario de SDKs y declaración exacta de Data Safety / Health Apps antes de publicar en Play.

## Límites de lanzamiento

- Play Store: distribuir inicialmente solo en Argentina y Estados Unidos.
- Meta Ads: segmentación geográfica; nunca audiencias construidas con síntomas, ánimo, ciclo, contenido de chat ni datos de salud.
- Cualquier ampliación a un país nuevo requiere revisar primero sus requisitos de privacidad, consumo y salud digital.
