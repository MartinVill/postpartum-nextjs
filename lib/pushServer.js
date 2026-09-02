import webpush from 'web-push';
import { getAdminDb } from './firebaseAdmin';

export function configureWebPush() {
  const { NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) throw new Error('VAPID is not configured');
  webpush.setVapidDetails(VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function sendPushToUser(userId, payload) {
  configureWebPush();
  const subscriptions = await getAdminDb().collection('push_subscriptions').where('userId', '==', userId).get();
  console.info('[PUSH] Subscription lookup', { userId, subscriptionCount: subscriptions.size });
  const outcomes = await Promise.all(subscriptions.docs.map(async (document) => {
    const subscription = document.data().subscriptionObject;
    const endpointHost = (() => { try { return new URL(subscription?.endpoint).host; } catch { return null; } })();
    const valid = Boolean(subscription?.endpoint && subscription?.keys?.p256dh && subscription?.keys?.auth);
    console.info('[PUSH] Subscription evaluated', { subscriptionId: document.id, userId, endpointHost, hasEndpoint: Boolean(subscription?.endpoint), hasP256dh: Boolean(subscription?.keys?.p256dh), hasAuth: Boolean(subscription?.keys?.auth), valid });
    if (!valid) return { sent: false, statusCode: null, reason: 'invalid-subscription' };
    try {
      const response = await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 3600, urgency: 'high' });
      console.info('[PUSH] Delivery accepted', { subscriptionId: document.id, userId, statusCode: response.statusCode });
      return { sent: true, statusCode: response.statusCode };
    } catch (error) {
      const statusCode = error.statusCode || null;
      console.warn('[PUSH] Delivery rejected', { subscriptionId: document.id, userId, endpointHost, statusCode, message: error.message });
      if (statusCode === 404 || statusCode === 410) await document.ref.delete();
      return { sent: false, statusCode, error: error.message };
    }
  }));
  return { subscriptionCount: subscriptions.size, delivered: outcomes.filter(outcome => outcome.sent).length, outcomes };
}

export function isWithinQuietHours(now, start = '22:00', end = '08:00', timeZone = 'America/Argentina/Buenos_Aires') {
  const current = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  const minutes = (value) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; };
  const currentMinutes = minutes(current), startMinutes = minutes(start), endMinutes = minutes(end);
  return startMinutes > endMinutes ? currentMinutes >= startMinutes || currentMinutes < endMinutes : currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
