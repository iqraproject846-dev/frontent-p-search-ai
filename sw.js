// sw.js - Service Worker for P-Search AI v3
const CACHE_NAME = "p-search-ai-v3";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/chatbot.html",
  "/auth.html",
  "/styles.css",
  "/profile.css",
  "/image.css",
  "/temp-chat.css",
  "/library.css",
  "/voice.css",
  "/script.js",
  "/api.js",
  "/profile.js",
  "/temp-chat.js",
  "/library.js",
  "/image.js",
  "/voice.js",
  "/manifest.json",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png"
];

// Install: precache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ SW: Precaching assets");
      // addAll one by one so one failure doesn't kill everything
      return Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url).catch(e => console.warn("SW cache skip:", url, e.message)))
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("🗑️ SW: Removing old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin (Firebase, APIs, CDNs)
  if (event.request.method !== "GET") return;
  if (url.origin !== location.origin) return;

  // HTML pages: network-first (always fresh)
  if (event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache-first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback for HTML
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/index.html");
        }
      });
    })
  );
});
