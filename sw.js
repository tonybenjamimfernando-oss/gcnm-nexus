const CACHE = "gcnm-nexus-v3";
const CACHE_PREFIX = "gcnm-nexus-";

self.addEventListener("install", function install() {
  self.skipWaiting();
});

self.addEventListener("activate", function activate(event) {
  event.waitUntil(
    caches.keys().then(function removeOldCaches(keys) {
      return Promise.all(
        keys
          .filter(function isOldCache(key) {
            return key.startsWith(CACHE_PREFIX) && key !== CACHE;
          })
          .map(function deleteOldCache(key) {
            return caches.delete(key);
          }),
      );
    }).then(function claimClients() {
      return self.clients.claim();
    }),
  );
});

self.addEventListener("fetch", function onFetch(event) {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function updateCache(response) {
        if (response && response.ok && response.type !== "opaque") {
          const copy = response.clone();
          caches.open(CACHE).then(function store(cache) {
            cache.put(event.request, copy);
          }).catch(function ignoreCacheFailure() {});
        }
        return response;
      })
      .catch(function useCachedResponse() {
        return caches.match(event.request).then(function cached(response) {
          return response || Response.error();
        });
      }),
  );
});
