/* SJ Tours and Travels — service worker.
   NOTE (live deployment): the six destination photos are inlined as
   data-URIs in the HTML, so they are not separate files and are NOT
   precached here (cache.addAll would fail on a missing file). Only
   files that actually exist on the site are precached.
   Strategy: HTML pages are ALWAYS fetched live from the network first,
   so the homepage and flight prices are never stale. Static files
   (photos, icons, the manifest) are served from cache for speed and
   refreshed in the background. Cross-origin requests (the flight
   search on flights.sjtravel.in, fonts, WhatsApp) are never touched. */
var CACHE = "sj-shell-v1";

/* The shell: only static assets, never any HTML page. Paths are
   resolved against the site root (this file lives in /assets/,
   so the root is one level up from its own scope when deployed). */
function rootUrl() {
  var scope = self.registration.scope;
  return scope.replace(/assets\/$/, "");
}

self.addEventListener("install", function (event) {
  var root = rootUrl();
  var shell = [
    "assets/icon-192.png",
    "assets/icon-512.png",
    "assets/icon-maskable-512.png",
    "assets/apple-touch-icon.png",
    "assets/manifest.webmanifest",
  ].map(function (path) { return root + path; });
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(shell);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        return key === CACHE ? null : caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; /* live services pass through */

  var isPage = req.mode === "navigate" ||
    (req.headers.get("accept") || "").indexOf("text/html") !== -1;

  if (isPage) {
    /* Network-first: the live page always wins. A cached copy is kept
       only as an offline fallback and is never served while online. */
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  /* Static assets: cache-first for speed, refreshed in the background. */
  event.respondWith(
    caches.match(req).then(function (hit) {
      var network = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || network;
    })
  );
});
