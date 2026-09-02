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
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge.png',
    vibrate: [100, 50, 100],
    data: data.data || { url: data.url || '/' },
    tag: data.tag || 'postpartum-checkin',
    renotify: false,
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Soporte Postparto', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === new URL(event.notification.data.url || '/', self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }
      // Open app if not already open
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
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
