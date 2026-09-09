'use client';

import { useEffect, useState } from 'react';

export const GOOGLE_PLAY_BILLING_METHOD = 'https://play.google.com/billing';
export const GOOGLE_PLAY_PRODUCT_IDS = {
  monthly: 'postpartum_subscription_monthly',
  lifetime: 'postpartum_lifetime_one_time'
};

/**
 * A standard browser never exposes getDigitalGoodsService. We deliberately
 * fall back to PayPal there, including when a TWA is misconfigured, so the
 * web checkout remains usable during a staged Android rollout.
 */
export function usePaymentProvider() {
  const [state, setState] = useState({ provider: 'paypal', ready: false, products: {}, service: null });

  useEffect(() => {
    let disposed = false;
    async function detect() {
      if (typeof window === 'undefined' || typeof window.getDigitalGoodsService !== 'function' || typeof window.PaymentRequest !== 'function') {
        if (!disposed) setState({ provider: 'paypal', ready: true, products: {}, service: null });
        return;
      }
      try {
        const service = await window.getDigitalGoodsService(GOOGLE_PLAY_BILLING_METHOD);
        const productIds = Object.values(GOOGLE_PLAY_PRODUCT_IDS);
        const productDetails = await service.getDetails(productIds);
        const products = Object.fromEntries((productDetails || []).map(product => [product.itemId, product]));
        if (!disposed) setState({ provider: 'google-play', ready: true, products, service });
      } catch (error) {
        // A browser can expose an incomplete implementation. Payment must not
        // fail closed for a web user in that case.
        console.warn('[BILLING] Google Play Billing unavailable; using PayPal.', error?.message);
        if (!disposed) setState({ provider: 'paypal', ready: true, products: {}, service: null });
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
  const purchaseToken = response?.details?.purchaseToken;
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
