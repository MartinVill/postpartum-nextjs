import { PAYPAL_PLAN_TYPES, getPayPalPlan } from '@/lib/paypalServer';

const DAY_MS = 24 * 60 * 60 * 1000;

export function entitlementFromSubscription({ userId, planType, subscriptionId, status, nextBillingTime = null }) {
  const now = new Date();
  const isLifetime = planType === PAYPAL_PLAN_TYPES.LIFETIME;

  return {
    userId,
    provider: 'paypal',
    providerEnvironment: process.env.PAYPAL_ENVIRONMENT || 'unknown',
    paypalSubscriptionId: subscriptionId,
    paypalPlanId: getPayPalPlan(planType),
    planType,
    planLabel: isLifetime ? 'lifetime' : 'monthly',
    billingStatus: status,
    accessStatus: 'pending_approval',
    authorizationCreatedAt: now.toISOString(),
    trialStartedAt: null,
    trialEndsAt: null,
    reminderScheduledFor: null,
    nextBillingAt: nextBillingTime,
    recurring: !isLifetime,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function webhookEntitlementUpdate(eventType, resource) {
  const status = String(resource?.status || '').toLowerCase();
  const nextBillingAt = resource?.billing_info?.next_billing_time || null;
  const now = new Date().toISOString();

  if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const activatedAt = new Date();
    return {
      billingStatus: status || 'active',
      accessStatus: 'trialing',
      nextBillingAt,
      activatedAt: activatedAt.toISOString(),
      trialStartedAt: activatedAt.toISOString(),
      trialEndsAt: new Date(activatedAt.getTime() + 7 * DAY_MS).toISOString(),
      reminderScheduledFor: new Date(activatedAt.getTime() + 5 * DAY_MS).toISOString(),
      updatedAt: now
    };
  }
  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
    return { billingStatus: status || 'cancelled', cancellationConfirmedAt: now, updatedAt: now };
  }
  if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' || eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
    return { billingStatus: status || 'inactive', accessStatus: 'inactive', accessEndedAt: now, updatedAt: now };
  }
  if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
    return { billingStatus: status || 'payment_failed', paymentFailedAt: now, updatedAt: now };
  }
  if (eventType === 'PAYMENT.SALE.COMPLETED') {
    return { lastPaymentAt: now, billingStatus: 'active', accessStatus: 'active', nextBillingAt, updatedAt: now };
  }
  return { billingStatus: status || 'updated', nextBillingAt, updatedAt: now };
}

export function planTypeFromPlanId(planId) {
  if (planId === getPayPalPlan(PAYPAL_PLAN_TYPES.MONTHLY)) return PAYPAL_PLAN_TYPES.MONTHLY;
  if (planId === getPayPalPlan(PAYPAL_PLAN_TYPES.LIFETIME)) return PAYPAL_PLAN_TYPES.LIFETIME;
  return null;
}
