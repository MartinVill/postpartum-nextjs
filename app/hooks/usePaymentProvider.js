'use client';

import { useEffect, useState } from 'react';

export const GOOGLE_PLAY_BILLING_METHOD = 'https://play.google.com/billing';
export const GOOGLE_PLAY_PRODUCT_IDS = {
  monthly: 'postpartum_subscription_monthly',
  lifetime: 'postpartum_lifetime_one_time'
};

/**
 * A standard browser never exposes getDigitalGoodsService, so it uses PayPal.
 * Once the TWA exposes the Google Play service, it must stay on Google Play:
 * an unavailable SKU should be reported by Play, not silently routed to a
 * different payment provider.
 */
export function usePaymentProvider() {
  const [state, setState] = useState({ provider: 'paypal', ready: false, products: {}, service: null, diagnostics: {} });

  useEffect(() => {
    let disposed = false;
    async function detect() {
      if (typeof window === 'undefined' || typeof window.getDigitalGoodsService !== 'function' || typeof window.PaymentRequest !== 'function') {
        if (!disposed) setState({ provider: 'paypal', ready: true, products: {}, service: null, diagnostics: { digitalGoods: false } });
        return;
      }
      try {
        const service = await window.getDigitalGoodsService(GOOGLE_PLAY_BILLING_METHOD);
        const productIds = Object.values(GOOGLE_PLAY_PRODUCT_IDS);
        let products = {};
        let detailsAvailable = false;
        try {
          const productDetails = await service.getDetails(productIds);
          products = Object.fromEntries((productDetails || []).map(product => [product.itemId, product]));
          detailsAvailable = true;
        } catch (error) {
          // Product metadata can take longer to propagate than the Billing
          // service itself. Preserve the native provider and let the Play
          // purchase sheet supply the authoritative product error if needed.
          console.warn('[BILLING] Google Play product details unavailable.', error?.message);
        }
        let canMakePayment = null;
        try {
          const preflight = new window.PaymentRequest([
            { supportedMethods: GOOGLE_PLAY_BILLING_METHOD, data: { sku: GOOGLE_PLAY_PRODUCT_IDS.monthly } }
          ], { total: { label: 'Postpartum', amount: { currency: 'USD', value: '0.00' } } });
          canMakePayment = await preflight.canMakePayment();
        } catch (error) {
          console.warn('[BILLING] Google Play payment preflight unavailable.', error?.message);
        }
        if (!disposed) setState({ provider: 'google-play', ready: true, products, service, diagnostics: { digitalGoods: true, detailsAvailable, canMakePayment } });
      } catch (error) {
        // A browser can expose an incomplete implementation. Payment must not
        // fail closed for a web user in that case.
        console.warn('[BILLING] Google Play Billing unavailable; using PayPal.', error?.message);
        if (!disposed) setState({ provider: 'paypal', ready: true, products: {}, service: null, diagnostics: { digitalGoods: false, initializationError: String(error?.message || '').slice(0, 160) } });
      }
    }
    detect();
    return () => { disposed = true; };
  }, []);

  return state;
}

export async function requestGooglePlayPurchase(productId, amount = '0.00') {
  if (typeof window === 'undefined' || typeof window.PaymentRequest !== 'function') {
    throw new Error('Google Play Billing no está disponible en este dispositivo.');
  }
  const request = new window.PaymentRequest([
    { supportedMethods: GOOGLE_PLAY_BILLING_METHOD, data: { sku: productId } }
  ], {
    total: { label: 'Postpartum', amount: { currency: 'USD', value: amount } }
  });
  const response = await request.show();
  // Chrome's Payment Request response uses `token`; some Android Browser
  // Helper versions expose the equivalent field as `purchaseToken`.
  const purchaseToken = response?.details?.token || response?.details?.purchaseToken;
  if (!purchaseToken) {
    await response.complete('fail');
    throw new Error('Google Play no devolvió un comprobante de compra.');
  }
  return { response, purchaseToken };
}

export async function listGooglePlayPurchases(service) {
  if (!service || typeof service.listPurchases !== 'function') throw new Error('No pudimos consultar tus compras de Google Play.');
  return service.listPurchases();
}
