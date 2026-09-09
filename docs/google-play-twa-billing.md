# Google Play Billing para la TWA

La web sigue usando PayPal. La TWA usa Google Play Billing sólo cuando el navegador expone `getDigitalGoodsService` y `PaymentRequest`.

## Productos de Google Play

- Suscripción mensual: `postpartum_subscription_monthly`.
- Compra única: `postpartum_lifetime_one_time`.

Los IDs se verifican tanto en el cliente como en el servidor. Nunca se concede acceso sólo con un token entregado por el navegador: `POST /api/billing/google-play/verify` consulta Google Play con credenciales de servidor y reconoce la compra después de validarla.

## Variables de entorno (Vercel y desarrollo)

Configurar estas variables sin exponerlas en el repositorio:

- `GOOGLE_PLAY_ANDROID_PACKAGE_NAME`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY`
- `TWA_ANDROID_PACKAGE_NAME`
- `TWA_SHA256_CERT_FINGERPRINTS` (una o varias huellas SHA-256 separadas por comas)

La service account debe tener acceso a la aplicación en Play Console y permisos para consultar pedidos y reconocer compras. La ruta pública `/.well-known/assetlinks.json` responde `503` hasta que el package y las huellas estén configurados; no publica una asociación vacía.

## Estado de conversión para Resend

Se guarda en `users/{uid}`:

- `checkoutState: "checkout_started"` cuando una usuaria autenticada abre una pasarela.
- `checkoutState: "checkout_abandoned"` cuando cancela PayPal o Google Play sin activar acceso.
- `checkoutState: "trial_active"` cuando el webhook de PayPal o la validación de Google Play confirma el acceso.

También se persisten `checkoutProvider`, las fechas de cada evento y, para el acceso, `trialActiveAt`. Resend puede consumir estos cambios posteriormente sin rediseñar el checkout.

## Límite importante de producto

Google Play permite pruebas gratuitas automáticas en **suscripciones** configuradas con una oferta de prueba. Una compra única durable no puede prometer por sí sola un cobro diferido de siete días como si fuera una suscripción. Antes de publicar, definir en Play Console qué producto/oferta respalda la promesa de “$0 hoy” para el plan de $15; hasta entonces no debe activarse ese copy para la compra única en la TWA de producción.

## Verificación manual antes de publicar

1. Crear ambos productos y la oferta de prueba en Play Console.
2. Agregar la service account a Play Console.
3. Generar y publicar el `assetlinks.json` con el certificado de firma de Play App Signing.
4. Probar en un dispositivo Android mediante un track cerrado: compra, cancelación, restauración y renovación.
5. Configurar RTDN de Google Play para mantener estados de renovación/cancelación después de la compra inicial.
