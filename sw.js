/* SJ Tours and Travels — service worker.
   Network-first for pages, so live prices stay fresh.
   Core pages and the new guides are cached so they open offline.
   If a page was never opened and the network is down, /offline.html is shown.
   Cache name bumps when the shell changes so old copies are dropped. */
var CACHE = "sj-shell-v3";
var CORE = [
  "/",
  "/offline.html",
  "/guides",
  "/contact",
  "/flights",
  "/flight-finder",
  "/tirumala-darshan-booking",
  "/tirupati-from-chennai-bengaluru-vellore",
  "/irctc-tatkal-booking",
  "/irctc-waitlist-confirmation",
  "/tatkal-booking-window",
  "/jain-food-bangkok",
  "/jain-food-singapore",
  "/jain-food-kuala-lumpur",
  "/jain-food-colombo",
  "/visa-free-countries-indian-passport",
  "/visa-free-finder",
  "/family-trip-budget",
  "/dubai-budget-from-chennai",
  "/thailand-budget-from-chennai",
  "/malaysia-visa-free-for-indians",
  "/assets/extras.css",
  "/assets/fonts.css",
  "/assets/guide.css",
  "/assets/site.js",
  "/assets/manifest.webmanifest",
  "/assets/IMG_1541.png",
  "/assets/IMG_1542.png",
  "/assets/IMG_1544.png",
  "/assets/icon-maskable-192.png",
  "/assets/icon-maskable-512.png",
  "/favicon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(CORE.map(function (url) {
        return cache.add(url).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        return key === CACHE ? null : caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  var isPage = req.mode === "navigate" ||
    (req.headers.get("accept") || "").indexOf("text/html") !== -1;

  if (isPage) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("/offline.html");
        });
      })
    );
    return;
  }

  if (url.pathname.endsWith(".json")) {
    event.respondWith(fetch(req).catch(function () { return caches.match(req); }));
    return;
  }

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
