import { randomUUID } from 'crypto';

const PAYPAL_SANDBOX_API = 'https://api-m.sandbox.paypal.com';
const PAYPAL_LIVE_API = 'https://api-m.paypal.com';

export const PAYPAL_PLAN_TYPES = Object.freeze({
  MONTHLY: 'monthly',
  LIFETIME: 'lifetime'
});

let cachedAccessToken = null;

function getConfiguration() {
  const environment = process.env.PAYPAL_ENVIRONMENT;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!environment || !['sandbox', 'live'].includes(environment) || !clientId || !clientSecret) {
    throw new Error('PayPal is not configured');
  }

  return { environment, clientId, clientSecret, baseUrl: environment === 'live' ? PAYPAL_LIVE_API : PAYPAL_SANDBOX_API };
}

export function getPayPalPlan(planType) {
  const plans = {
    [PAYPAL_PLAN_TYPES.MONTHLY]: process.env.PAYPAL_PLAN_MONTHLY_ID,
    [PAYPAL_PLAN_TYPES.LIFETIME]: process.env.PAYPAL_PLAN_LIFETIME_ID
  };
  const id = plans[planType];
  if (!id) throw new Error('Unknown or unavailable billing plan');
  return id;
}

async function getAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 30_000) return cachedAccessToken.token;

  const { baseUrl, clientId, clientSecret } = getConfiguration();
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) throw new Error('PayPal authentication failed');

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: now + Math.max(60, Number(payload.expires_in || 300)) * 1000
  };
  return cachedAccessToken.token;
}

async function paypalRequest(path, { method = 'GET', body, requestId } = {}) {
  const { baseUrl } = getConfiguration();
  const accessToken = await getAccessToken();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('[PAYPAL] Request rejected', { path, status: response.status, name: payload.name || null });
    throw new Error('PayPal request failed');
  }
  return payload;
}

export async function createPayPalSubscription({ userId, planType, returnUrl, cancelUrl }) {
  const planId = getPayPalPlan(planType);
  const payload = await paypalRequest('/v1/billing/subscriptions', {
    method: 'POST',
    requestId: randomUUID(),
    body: {
      plan_id: planId,
      custom_id: userId,
      application_context: {
        brand_name: 'Posparto',
        locale: 'es-AR',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    }
  });
  const approvalUrl = payload.links?.find(link => link.rel === 'approve')?.href;
  if (!payload.id || !approvalUrl) throw new Error('PayPal did not provide an approval link');
  return { subscriptionId: payload.id, approvalUrl, status: payload.status, planId };
}

export async function cancelPayPalSubscription(subscriptionId) {
  await paypalRequest(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: 'POST',
    requestId: randomUUID(),
    body: { reason: 'Cancelled by customer in Posparto' }
  });
}

export async function verifyPayPalWebhook(request, webhookEvent) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error('PayPal webhook is not configured');

  const verification = await paypalRequest('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: {
      auth_algo: request.headers.get('paypal-auth-algo'),
      cert_url: request.headers.get('paypal-cert-url'),
      transmission_id: request.headers.get('paypal-transmission-id'),
      transmission_sig: request.headers.get('paypal-transmission-sig'),
      transmission_time: request.headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: webhookEvent
    }
  });
  return verification.verification_status === 'SUCCESS';
}

export function getTrustedAppUrl() {
  const url = process.env.APP_BASE_URL;
  if (!url || !/^https?:\/\//.test(url)) throw new Error('APP_BASE_URL is not configured');
  return url.replace(/\/$/, '');
}
