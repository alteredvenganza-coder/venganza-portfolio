// Venganza OS — Service Worker per Push Notifications

self.addEventListener('push', function (event) {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'Venganza OS', body: event.data.text() }; }

  const options = {
    body:    data.body  ?? '',
    icon:    '/favicon.ico',
    badge:   '/favicon.ico',
    tag:     data.tag   ?? 'venganza-os',
    renotify: true,
    data:    { url: data.url ?? '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Venganza OS', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
