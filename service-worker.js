const CACHE_NAME = "karaoke-manager-v19-bulk-edit";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./version.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

const UPDATE_SENSITIVE = new Set([
  "index.html",
  "style.css",
  "app.js",
  "manifest.webmanifest",
  "version.json"
]);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isUpdateSensitiveRequest(request) {
  if (request.mode === "navigate") return true;

  const url = new URL(request.url);
  const fileName = url.pathname.split("/").pop() || "index.html";
  return UPDATE_SENSITIVE.has(fileName);
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, { cache: "no-store" });

    if (response && response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    if (request.mode === "navigate") {
      return (await cache.match("./index.html")) || Response.error();
    }

    return Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });

  if (cached) return cached;

  const response = await fetch(request);

  if (response && response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isUpdateSensitiveRequest(event.request)) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});
