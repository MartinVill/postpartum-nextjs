/**
 * Service Worker for Postpartum App Push Notifications
 * Handles incoming push events and user interactions
 */

self.addEventListener('push', function(event) {
  console.log('[SW] Push event received');

  if (!event.data) {
    console.warn('[SW] No data in push event');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
    data = {
      title: 'Soporte Postparto',
      body: event.data.text() || 'Un momento para ti 💜'
    };
  }

  const options = {
    body: data.body || 'Un momento para ti 💜',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || { url: data.url || '/' },
    tag: data.tag || 'daily-reminder',
    renotify: data.renotify ?? true,
    actions: data.actions || [
      { action: 'open', title: 'Abrir ahora' },
      { action: 'snooze', title: 'Recordar en 15m' }
    ],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Soporte Postparto', options)
      .then(() => console.log('[SW] Notification shown:', data.title || 'Soporte Postparto'))
      .catch((error) => console.error('[SW] Failed to show notification:', error))
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification.tag, event.action || 'open');
  event.notification.close();

  event.waitUntil(
    (async function() {
      const notificationData = event.notification.data || {};
      if (event.action === 'snooze' && notificationData.reminderId && notificationData.snoozeToken) {
        try {
          const response = await fetch('/api/notifications/snooze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reminderId: notificationData.reminderId, snoozeToken: notificationData.snoozeToken })
          });
          console.log('[SW] Snooze request:', response.status);
        } catch (error) {
          console.error('[SW] Snooze request failed:', error);
        }
      }

      const targetUrl = new URL(notificationData.url || '/', self.location.origin).href;
      const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Open app if not already open
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })()
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Periodic Background Sync (optional - for future scheduling)
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-checkins') {
    console.log('[SW] Background sync triggered');
    // Future: sync check-ins, mood scores, etc.
  }
});
