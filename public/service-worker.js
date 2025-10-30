const CACHE_NAME = "hrms-v1"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/android-launchericon-48-48.png",
  "/icons/android-launchericon-72-72.png",
  "/icons/android-launchericon-96-96.png",
  "/icons/android-launchericon-144-144.png",
  "/icons/android-launchericon-192-192.png",
  "/icons/android-launchericon-512-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.log("[v0] Service Worker: Some assets failed to cache", error)
      })
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  if (event.request.url.includes("hrms-2-y7li.onrender.com")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        }),
    )
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === "error") {
              return response
            }
            const clonedResponse = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse)
            })
            return response
          })
          .catch(() => {
            return new Response("Offline - Resource not available", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({
                "Content-Type": "text/plain",
              }),
            })
          })
      }),
    )
  }
})
