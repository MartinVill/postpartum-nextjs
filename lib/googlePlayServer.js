import { JWT } from 'google-auth-library';

export const GOOGLE_PLAY_PLAN_TYPES = { MONTHLY: 'monthly', LIFETIME: 'lifetime' };
export const GOOGLE_PLAY_PRODUCT_IDS = {
  [GOOGLE_PLAY_PLAN_TYPES.MONTHLY]: 'postpartum_subscription_monthly',
  [GOOGLE_PLAY_PLAN_TYPES.LIFETIME]: 'postpartum_lifetime_one_time'
};

function googlePlayConfig() {
  const packageName = process.env.GOOGLE_PLAY_ANDROID_PACKAGE_NAME;
  const clientEmail = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!packageName || !clientEmail || !privateKey) throw new Error('Google Play server validation is not configured');
  return { packageName, clientEmail, privateKey };
}

async function androidPublisherRequest(path, options = {}) {
  const { packageName, clientEmail, privateKey } = googlePlayConfig();
  const client = new JWT({ email: clientEmail, key: privateKey, scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
  const tokenResult = await client.getAccessToken();
  const token = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;
  if (!token) throw new Error('Google Play access token unavailable');
  const response = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Google Play verification failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}

export async function verifyGooglePlayPurchase({ planType, purchaseToken }) {
  const productId = GOOGLE_PLAY_PRODUCT_IDS[planType];
  if (!productId || !purchaseToken) throw new Error('Google Play purchase data is invalid');

  if (planType === GOOGLE_PLAY_PLAN_TYPES.MONTHLY) {
    const purchase = await androidPublisherRequest(`/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`);
    const lineItem = purchase.lineItems?.find(item => item.productId === productId);
    const validStates = new Set(['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD']);
    if (!lineItem || !validStates.has(purchase.subscriptionState)) throw new Error('Google Play subscription is not active');
    await androidPublisherRequest(`/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, { method: 'POST', body: '{}' });
    return {
      productId,
      purchaseToken,
      recurring: true,
      billingStatus: purchase.subscriptionState,
      trialStartedAt: purchase.startTime || new Date().toISOString(),
      trialEndsAt: lineItem.expiryTime || null,
      nextBillingAt: lineItem.expiryTime || null,
      orderId: purchase.latestOrderId || null
    };
  }

  const purchase = await androidPublisherRequest(`/purchases/productsv2/tokens/${encodeURIComponent(purchaseToken)}`);
  const lineItem = purchase.productLineItem?.find(item => item.productId === productId);
  if (!lineItem || purchase.purchaseStateContext?.purchaseState !== 'PURCHASE_STATE_PURCHASED') throw new Error('Google Play purchase is not completed');
  await androidPublisherRequest(`/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, { method: 'POST', body: '{}' });
  return { productId, purchaseToken, recurring: false, billingStatus: 'PURCHASED', trialStartedAt: new Date().toISOString(), trialEndsAt: null, nextBillingAt: null, orderId: purchase.orderId || null };
}
