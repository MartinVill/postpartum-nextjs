# Google Play Billing para la TWA

La web sigue usando PayPal. La TWA usa Google Play Billing sólo cuando el navegador expone `getDigitalGoodsService` y `PaymentRequest`.

## Productos de Google Play

- Suscripción mensual: `postpartum_subscription_monthly`.
- Compra única: `postpartum_lifetime_one_time`, cobrada de inmediato por $15 USD.

Los IDs se verifican tanto en el cliente como en el servidor. Nunca se concede acceso sólo con un token entregado por el navegador: `POST /api/billing/google-play/verify` consulta Google Play con credenciales de servidor y reconoce la compra después de validarla.

## Variables de entorno (Vercel y desarrollo)

Configurar estas variables sin exponerlas en el repositorio:

- `GOOGLE_PLAY_ANDROID_PACKAGE_NAME`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY`
- `TWA_ANDROID_PACKAGE_NAME`
- `TWA_SHA256_CERT_FINGERPRINTS` (una o varias huellas SHA-256 separadas por comas)
- `GOOGLE_PUBSUB_PUSH_AUDIENCE` (URL exacta de `/api/billing/google-play/rtdn`)
- `GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT` (email de la service account que firma el push)

La service account debe tener acceso a la aplicación en Play Console y permisos para consultar pedidos y reconocer compras. La ruta pública `/.well-known/assetlinks.json` responde `503` hasta que el package y las huellas estén configurados; no publica una asociación vacía.

## Estado de conversión para Resend

Se guarda en `users/{uid}`:

- `checkoutState: "checkout_started"` cuando una usuaria autenticada abre una pasarela.
- `checkoutState: "checkout_abandoned"` cuando cancela PayPal o Google Play sin activar acceso.
- `checkoutState: "trial_active"` cuando el webhook de PayPal o la validación de Google Play confirma el acceso.

También se persisten `checkoutProvider`, las fechas de cada evento y, para el acceso, `trialActiveAt`. Resend puede consumir estos cambios posteriormente sin rediseñar el checkout.

## Límite importante de producto

Google Play permite pruebas gratuitas automáticas en **suscripciones** configuradas con una oferta de prueba. La compra única durable de $15 no promete prueba ni cobro diferido: se procesa inmediatamente. En web/iOS ese mismo plan se procesa como una orden única de PayPal, también por $15 USD.

## Verificación manual antes de publicar

1. Crear ambos productos y la oferta de prueba en Play Console.
2. Agregar la service account a Play Console.
3. Generar y publicar el `assetlinks.json` con el certificado de firma de Play App Signing.
4. Probar en un dispositivo Android mediante un track cerrado: compra, cancelación, restauración y renovación.
5. Configurar RTDN de Google Play para mantener estados de renovación/cancelación después de la compra inicial.

## Restauración y RTDN

En la TWA, el enlace **Restaurar compras** consulta `listPurchases()` y vuelve a validar cada comprobante en el servidor. Nunca restituye acceso sólo desde el navegador.

`POST /api/billing/google-play/rtdn` recibe el push autenticado de Cloud Pub/Sub, deduplica por `messageId` en `google_play_rtdn_events` y consulta nuevamente la API de Google Play antes de modificar un entitlement. Al configurar Pub/Sub, usar una push subscription con autenticación OIDC cuyo audience sea la URL exacta de ese endpoint.
