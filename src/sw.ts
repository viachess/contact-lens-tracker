/// <reference lib="WebWorker" />
// basic service worker for offline cache
const sw = self as unknown as ServiceWorkerGlobalScope

const CACHE = 'lens-tracker-cache-v3'
const ASSETS = ['/', '/index.html', '/icon-lens.svg', '/manifest.webmanifest']

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
  // Force the waiting service worker to become active immediately (iOS 26 requirement)
  sw.skipWaiting()
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => sw.clients.claim())
  )
})

sw.addEventListener('fetch', (event) => {
  const req = event.request
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
          return res
        })
    )
  )
})

// Handle push notifications (required for iOS 26+)
sw.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Notification'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-lens.png',
    badge: data.badge || '/icon-lens.png',
    data: data.data || {},
    tag: data.tag || 'default'
  }
  event.waitUntil(sw.registration.showNotification(title, options))
})

// Handle notification clicks
sw.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (sw.clients.openWindow) {
        return sw.clients.openWindow('/')
      }
    })
  )
})
