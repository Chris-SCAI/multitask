// Custom service worker additions for push notifications

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}

  const title = data.title || 'MultiTasks'
  const options = {
    body: data.body || 'Vous avez une notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'multitasks-notification',
    requireInteraction: data.requireInteraction ?? false,
    data: {
      url: data.url || '/',
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Open a new window if none found
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
