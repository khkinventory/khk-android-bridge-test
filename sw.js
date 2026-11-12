
const CACHE_NAME = "khk-bridge-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./db.js"
];

// Install: cache the application interface
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// Activate: remove outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve cached pages when offline
self.addEventListener("fetch", (event) => {

  const url = new URL(event.request.url);

  // Never intercept Android localhost bridge requests
  if (url.hostname === "127.0.0.1") {
    return;
  }

  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);

      if (cached) {
        return cached;
      }

      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }

      return Response.error();
    })
  );
});
