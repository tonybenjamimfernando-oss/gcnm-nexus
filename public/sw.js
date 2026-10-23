const CACHE = "gcnm-nexus-v1";

self.addEventListener("install", function install() {
  self.skipWaiting();
});

self.addEventListener("activate", function activate(event) {
  event.waitUntil(
    caches.keys().then(function keys() {
      return self.clients.claim();
    }),
  );
});

self.addEventListener("fetch", function onFetch(event) {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(function cached(found) {
      const network = fetch(event.request)
        .then(function handle(response) {
          const copy = response.clone();
          caches
            .open(CACHE)
            .then(function store(cache) {
              cache.put(event.request, copy);
            })
            .catch(function keep() {});
          return response;
        })
        .catch(function offline() {
          return found || Response.error();
        });
      return found || network;
    }),
  );
});
