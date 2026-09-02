/**
 * Push Notification Manager for Postpartum App
 * Handles quiet hours logic, VAPID registration, and mood-adaptive notifications
 */

/**
 * Evaluates if current time falls within user's registered quiet/sleep hours
 * Handles overnight windows (e.g., 22:00 to 08:00 across midnight)
 *
 * @param {string} quietStart - Sleep start time in HH:MM format (default: "22:00")
 * @param {string} quietEnd - Wake time in HH:MM format (default: "08:00")
 * @returns {boolean} true if within quiet hours, false otherwise
 */
export function isWithinQuietHours(quietStart = "22:00", quietEnd = "08:00") {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sHours, sMins] = quietStart.split(':').map(Number);
  const [eHours, eMins] = quietEnd.split(':').map(Number);

  const startMinutes = sHours * 60 + sMins;
  const endMinutes = eHours * 60 + eMins;

  if (startMinutes > endMinutes) {
    // Overnight window (e.g., 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Same-day window
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Registers Service Worker and initiates push notification subscription
 * Called AFTER user approves in SleepScheduleModal
 *
 * @param {string} vapidPublicKey - Server's VAPID public key
 * @param {Object} quietHours - { quietStart: "HH:MM", quietEnd: "HH:MM" }
 * @returns {Promise<Object>} Subscription object or error
 */
export async function registerServiceWorkerAndSubscribe(vapidPublicKey, quietHours = {}, userId = localStorage.getItem('userId')) {
  try {
    // Check browser support
    if (!('serviceWorker' in navigator)) {
      console.warn('[PUSH] Service Workers not supported');
      return { success: false, message: 'Service Workers not supported' };
    }

    if (!('PushManager' in window)) {
      console.warn('[PUSH] Push notifications not supported');
      return { success: false, message: 'Push notifications not supported' };
    }

    if (!userId) {
      return { success: false, message: 'User ID is required to activate notifications' };
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return { success: false, message: 'Notification permission must be granted first' };
    }

    // Register Service Worker
    console.log('[PUSH] Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    // Reuse an existing subscription when possible. This avoids a second
    // browser prompt and makes activation idempotent for the same device.
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      if (!vapidPublicKey) return { success: false, message: 'VAPID public key is not configured' };
      console.log('[PUSH] Subscribing to push...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
    }

    console.log('[PUSH] Subscription successful:', subscription);

    // Send subscription + quiet hours to backend
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON(),
        quietStart: quietHours.quietStart || "22:00",
        quietEnd: quietHours.quietEnd || "08:00",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }

    // Save quiet hours to localStorage for client-side checks
    localStorage.setItem('quietHours', JSON.stringify({
      quietStart: quietHours.quietStart || "22:00",
      quietEnd: quietHours.quietEnd || "08:00",
      updatedAt: new Date().toISOString()
    }));

    return { success: true, subscription };
  } catch (error) {
    console.error('[PUSH] Error registering Service Worker:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Utility: Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Gets stored quiet hours from localStorage
 * @returns {Object} { quietStart, quietEnd, updatedAt }
 */
export function getStoredQuietHours() {
  const stored = localStorage.getItem('quietHours');
  if (!stored) return { quietStart: "22:00", quietEnd: "08:00" };

  try {
    return JSON.parse(stored);
  } catch {
    return { quietStart: "22:00", quietEnd: "08:00" };
  }
}

/**
 * Checks if push notifications are currently enabled
 * @returns {boolean}
 */
export async function isPushEnabled() {
  return (await getPushStatus()) === 'active';
}

/**
 * Read-only status check. It never requests permission or creates a
 * subscription, so it is safe to call during component mount.
 */
export async function getPushStatus() {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'disabled';
  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission !== 'granted') return 'disabled';

  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    return subscription ? 'active' : 'disabled';
  } catch {
    return 'disabled';
  }
}
