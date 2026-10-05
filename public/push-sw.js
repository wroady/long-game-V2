// Web Push handlers, pulled into the Workbox-generated service worker via workbox.importScripts
// (vite.config.js). Kept separate so the generated caching/update logic stays untouched.
self.addEventListener('push', function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(data.title || 'The Long Game', {
    body: data.body || '',
    tag: data.tag || undefined,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
  }));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if ('focus' in list[i]) return list[i].focus();
    }
    return self.clients.openWindow(self.registration.scope);
  }));
});
