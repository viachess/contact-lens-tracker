/// <reference lib="WebWorker" />
// basic service worker for offline cache
const sw = self as unknown as ServiceWorkerGlobalScope

const CACHE = 'lens-tracker-cache-v1'
const ASSETS = ['/', '/index.html', '/favicon.svg']

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
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
