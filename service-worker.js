const CACHE_NAME = "pdfreader-v0.1.3";
const STATIC_ASSETS = [
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./.nojekyll"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("pdfreader-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    return response;
  } catch {
    const cached = await caches.match("./index.html");
    if (cached) return cached;
    throw new Error("Offline en geen gecachte pagina beschikbaar.");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request, { cache: "no-cache" })
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // HTML/navigation: altijd eerst het netwerk proberen.
  if (request.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Alleen eigen statische assets cachen.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
