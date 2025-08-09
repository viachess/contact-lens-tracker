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

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        const isCacheable =
          res &&
          res.ok &&
          (res.type === 'basic' || res.type === 'cors') &&
          res.headers.get('content-type')?.includes('application/javascript') === false
            ? true
            : true
        // Only cache GET requests for assets (js/css/image), not HTML navigations
        const isNavigationHtml = res.headers
          .get('content-type')
          ?.includes('text/html') && req.mode === 'navigate'
        if (isCacheable && !isNavigationHtml) {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
        }
        return res
      })
    })
  )
})


