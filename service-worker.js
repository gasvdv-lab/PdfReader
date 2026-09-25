/* PdfReader v0.2.6 — Offline Engine */
const VERSION = "0.3.1";
const CACHE_NAME = `pdfreader-${VERSION}`;
const CACHE_PREFIX = "pdfreader-";

const SCOPE_URL = new URL(self.registration.scope);
const BASE_PATH = SCOPE_URL.pathname.endsWith("/")
  ? SCOPE_URL.pathname
  : `${SCOPE_URL.pathname}/`;

const PDFJS_MAIN =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs";
const PDFJS_WORKER =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=0.3.1",
  "./app.js?v=0.3.1",
  "./manifest.webmanifest?v=0.3.1",
  "./icon.svg",
  "./icon-192.png?v=0.3.1",
  "./icon-512.png",
  PDFJS_MAIN,
  PDFJS_WORKER
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    for (const asset of APP_SHELL) {
      try {
        const request = new Request(asset, { cache: "reload" });
        const response = await fetch(request);

        if (!response.ok && response.type !== "opaque") {
          throw new Error(`HTTP ${response.status}`);
        }

        await cache.put(request, response.clone());
      } catch (error) {
        console.warn("Precache overgeslagen:", asset, error);
      }
    }

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

function isPdfJsRequest(url) {
  return url.href === PDFJS_MAIN || url.href === PDFJS_WORKER;
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put("./index.html", response.clone());
    }

    return response;
  } catch {
    return (
      await cache.match("./index.html") ||
      await cache.match("./") ||
      new Response(
        "PdfReader is offline en de app-shell is nog niet gecachet.",
        {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        }
      )
    );
  }
}

async function sameOriginAsset(request) {
  const cache = await caches.open(CACHE_NAME);

  const cached =
    await cache.match(request) ||
    await cache.match(request, { ignoreSearch: true });

  if (cached) {
    fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});

    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isPdfJsRequest(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith(BASE_PATH)
  ) {
    event.respondWith(sameOriginAsset(request));
  }
});
