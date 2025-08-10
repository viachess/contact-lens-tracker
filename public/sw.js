// basic service worker for offline cache
const CACHE = 'lens-tracker-cache-v2'
const ASSETS = ['/', '/index.html', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // Only handle HTTP(S) GET requests; ignore others (e.g., chrome-extension:)
  if (req.method !== 'GET' || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
    return
  }

  // Bypass cross-origin requests entirely (e.g., Supabase API). Let the network handle them.
  if (url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      // Network-first for navigation requests (HTML documents)
      if (req.mode === 'navigate') {
        return fetch(req).catch(() => cached || caches.match('/'))
      }

      // For same-origin static assets, prefer cached then revalidate in background
      const fetchAndMaybeCache = fetch(req).then((res) => {
        const destination = req.destination // 'script' | 'style' | 'image' | 'font' | 'document' | 'fetch' ...
        const shouldCache =
          res &&
          res.ok &&
          (res.type === 'basic' || res.type === 'cors') &&
          ['script', 'style', 'image', 'font'].includes(destination)

        if (shouldCache) {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
        }
        return res
      })

      return cached || fetchAndMaybeCache
    })
  )
})


// Push notifications handler
self.addEventListener('push', (event) => {
  const data = (() => {
    try {
      return event.data ? event.data.json() : { title: 'Reminder', body: 'Update your lens status' }
    } catch {
      return { title: 'Reminder', body: 'Update your lens status' }
    }
  })()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Reminder', {
      body: data.body || 'Update your lens status',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'lens-reminder'
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/')
    })
  )
})


