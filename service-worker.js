/* PdfReader v0.3.2.3 — Cache Coherency & Runtime Recovery */
const VERSION = "0.3.3";
const CACHE_NAME = `pdfreader-${VERSION}`;
const INSTALL_CACHE = `${CACHE_NAME}-installing`;
const CACHE_PREFIX = "pdfreader-";

const PDFJS_MAIN =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs";
const PDFJS_WORKER =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

const CRITICAL_ASSETS = [
  "./index.html",
  "./styles.css?v=0.3.3",
  "./app.js?v=0.3.3",
  "./manifest.webmanifest?v=0.3.3",
  "./icon.svg",
  "./icon-192.png?v=0.3.3",
  "./icon-512.png",
  PDFJS_MAIN,
  PDFJS_WORKER
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    await caches.delete(INSTALL_CACHE);
    await caches.delete(CACHE_NAME);

    const tempCache = await caches.open(INSTALL_CACHE);

    try {
      for (const asset of CRITICAL_ASSETS) {
        const request = new Request(asset, { cache: "reload" });
        const response = await fetch(request);

        if (!response.ok && response.type !== "opaque") {
          throw new Error(
            `Precache mislukt voor ${asset}: HTTP ${response.status}`
          );
        }

        await tempCache.put(request, response.clone());
      }

      const finalCache = await caches.open(CACHE_NAME);

      for (const asset of CRITICAL_ASSETS) {
        const request = new Request(asset, { cache: "reload" });
        const cached = await tempCache.match(request);

        if (!cached) {
          throw new Error(`Kritiek cachebestand ontbreekt: ${asset}`);
        }

        await finalCache.put(request, cached.clone());
      }

      await caches.delete(INSTALL_CACHE);
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(INSTALL_CACHE);
      await caches.delete(CACHE_NAME);
      console.error("PdfReader service worker installatie afgebroken.", error);
      throw error;
    }
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith(CACHE_PREFIX) &&
          key !== CACHE_NAME &&
          key !== INSTALL_CACHE
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

function isPdfJsRequest(url) {
  return url.href === PDFJS_MAIN || url.href === PDFJS_WORKER;
}

function isVersionedAppAsset(url) {
  if (url.origin !== self.location.origin) return false;

  return [
    "/PdfReader/app.js",
    "/PdfReader/styles.css",
    "/PdfReader/manifest.webmanifest",
    "/PdfReader/icon-192.png"
  ].includes(url.pathname);
}

async function exactCacheFirst(request) {
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
    const response = await fetch(request, { cache: "no-store" });

    if (response.ok) {
      const indexRequest = new Request("./index.html", { cache: "reload" });
      await cache.put(indexRequest, response.clone());
    }

    return response;
  } catch {
    const indexRequest = new Request("./index.html", { cache: "reload" });
    const cached = await cache.match(indexRequest);

    return cached || new Response(
      "PdfReader is offline en de app-shell is nog niet correct gecachet.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      }
    );
  }
}

async function networkFirstSameOrigin(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, { cache: "no-store" });

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("Offline asset ontbreekt.");
  }
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
    event.respondWith(exactCacheFirst(request));
    return;
  }

  if (isVersionedAppAsset(url)) {
    // Exacte requestmatching. Querystring wordt NOOIT genegeerd.
    event.respondWith(networkFirstSameOrigin(request));
    return;
  }

  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith("/PdfReader/")
  ) {
    event.respondWith(exactCacheFirst(request));
  }
});

self.addEventListener("message", event => {
  const data = event.data || {};

  if (data.type === "PDFREADER_VERSION_CHECK") {
    event.source?.postMessage?.({
      type: "PDFREADER_VERSION_RESULT",
      version: VERSION
    });
  }
});
