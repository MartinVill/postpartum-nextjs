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
  return Promise.all(subscriptions.docs.map(async (document) => {
    try {
      await webpush.sendNotification(document.data().subscriptionObject, JSON.stringify(payload), { TTL: 3600, urgency: 'high' });
      return { sent: true };
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) await document.ref.delete();
      return { sent: false, error: error.message };
    }
  }));
}

export function isWithinQuietHours(now, start = '22:00', end = '08:00', timeZone = 'America/Argentina/Buenos_Aires') {
  const current = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  const minutes = (value) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; };
  const currentMinutes = minutes(current), startMinutes = minutes(start), endMinutes = minutes(end);
  return startMinutes > endMinutes ? currentMinutes >= startMinutes || currentMinutes < endMinutes : currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
