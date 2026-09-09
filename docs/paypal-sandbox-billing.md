# PayPal Sandbox y acceso de prueba

**Estado:** backend y Sandbox configurados; interfaz de Paywall pendiente.  
**Última actualización:** 9 de septiembre de 2026.

## Planes Sandbox activos

Se creó un producto de servicio de Posparto con dos planes independientes. Los identificadores se guardan solo en variables de entorno, nunca en Git.

| Opción de producto | Ciclo de prueba | Cobro posterior | Renovación |
| --- | --- | --- | --- |
| Mensual | 1 semana a USD 0 | USD 5 cada mes | Sí, hasta cancelar |
| Pago único | 1 semana a USD 0 | USD 15 una vez | No; el ciclo regular es finito (`total_cycles: 1`) |

Ambos planes fueron consultados directamente desde la API Sandbox de PayPal y devolvieron estado `ACTIVE` con los ciclos esperados.

## Variables requeridas

```text
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_ENVIRONMENT=sandbox | live
PAYPAL_PRODUCT_ID
PAYPAL_PLAN_MONTHLY_ID
PAYPAL_PLAN_LIFETIME_ID
PAYPAL_WEBHOOK_ID
APP_BASE_URL
```

Las variables Sandbox están configuradas temporalmente en Vercel para validar esta integración. Antes de lanzar cobros reales deben sustituirse por las credenciales, planes y webhook de **Live**; no se deben mezclar entornos.

## Colecciones de Firestore

Firestore crea colecciones al escribir el primer documento; no se requieren migraciones manuales.

### `billing_entitlements/{firebaseUid}`

Fuente de verdad del acceso a la app. El servidor escribe estos documentos; el cliente no debe poder asignarse acceso ni alterar precios, fechas, plan o estado.

Campos principales:

```text
userId
provider: paypal
providerEnvironment: sandbox | live
paypalSubscriptionId
paypalPlanId
planType: monthly | lifetime
accessStatus: pending_approval | trialing | active | inactive
billingStatus
trialStartedAt
trialEndsAt
reminderScheduledFor
nextBillingAt
recurring
cancellationRequestedAt
cancellationConfirmedAt
lastWebhookEvent
lastWebhookEventAt
```

El acceso no se habilita hasta recibir `BILLING.SUBSCRIPTION.ACTIVATED`. La fecha de fin y el recordatorio se toman de `next_billing_time`, la fecha exacta que devuelve PayPal para el próximo cobro; así la app no calcula una fecha distinta a la del proveedor.

### `paypal_webhook_events/{paypalEventId}`

Registro idempotente de entregas de PayPal. Evita duplicar cambios cuando PayPal reintenta un webhook. Conserva tipo de evento, recurso, momento de recepción y momento de procesamiento, sin guardar tarjetas ni datos de pago.

## Webhook y seguridad

El endpoint es `POST /api/billing/paypal/webhook`. Está registrado en Sandbox para recibir:

```text
BILLING.SUBSCRIPTION.CREATED
BILLING.SUBSCRIPTION.ACTIVATED
BILLING.SUBSCRIPTION.CANCELLED
BILLING.SUBSCRIPTION.EXPIRED
BILLING.SUBSCRIPTION.SUSPENDED
BILLING.SUBSCRIPTION.PAYMENT.FAILED
PAYMENT.SALE.COMPLETED
```

Antes de escribir en Firestore, el servidor envía los encabezados de transmisión y el evento a `verify-webhook-signature` de PayPal. Un evento no verificable no modifica acceso ni datos.

Las rutas de crear suscripción y cancelar requieren un ID token de Firebase y solo operan sobre el `firebaseUid` autenticado. El plan se decide en el servidor a partir de una lista cerrada; el cliente no puede enviar importes ni IDs PayPal arbitrarios.

## Validación realizada

- Credenciales Sandbox autenticadas correctamente.
- Producto y dos planes creados y consultados por API.
- Endpoint de webhook publicado en Producción para permitir la entrega pública de Sandbox.
- Webhook Sandbox registrado con los siete eventos de facturación.
- Se creó una suscripción Sandbox de validación en estado `APPROVAL_PENDING`, que devolvió enlace de aprobación.

## Prueba pendiente para cerrar Sandbox

Una cuenta **Personal Sandbox** debe abrir y aprobar el enlace de la suscripción de validación. Después se verifica que llegue `BILLING.SUBSCRIPTION.ACTIVATED` y que el documento `billing_entitlements/paypal-sandbox-validation` cambie a `trialing`, con fechas de prueba y recordatorio calculadas. No hay cobro real en Sandbox.

No se debe usar el simulador de webhooks como validación final: sus eventos no usan la firma verificable de la aplicación registrada.
