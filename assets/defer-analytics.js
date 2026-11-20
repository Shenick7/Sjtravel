/* Loads Google Analytics and Microsoft Clarity only after the visitor
   accepts cookies (localStorage sj-cookies === "accepted").
   Pointer, keyboard, touch and the 3 second timer do not load anything
   otherwise. The Search Console meta tag stays in the page and is not a script. */
(function () {
  var KEY = "sj-cookies";
  function choice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function loadAll() {
    if (window.__sjAnalyticsLoaded) return;
    if (choice() !== "accepted") return;
    window.__sjAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-YPM6XLXTVQ");
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=G-YPM6XLXTVQ";
    document.head.appendChild(g);

    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", "zee487ap4w");
  }
  window.sjLoadAnalytics = loadAll;

  function schedule() {
    if (choice() !== "accepted") return;
    var done = false;
    function go() {
      if (done || choice() !== "accepted") return;
      done = true;
      loadAll();
    }
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, go, { once: true, passive: true });
    });
    window.addEventListener("load", function () { window.setTimeout(go, 3000); });
  }

  function wireNotice() {
    var note = document.getElementById("cookieNote");
    if (!note) return;
    if (!choice()) note.hidden = false;
    var accept = document.getElementById("cookieAccept");
    var decline = document.getElementById("cookieDecline");
    if (accept) accept.addEventListener("click", function () {
      try { localStorage.setItem(KEY, "accepted"); } catch (e) {}
      note.hidden = true;
      loadAll();
    });
    if (decline) decline.addEventListener("click", function () {
      try { localStorage.setItem(KEY, "declined"); } catch (e) {}
      note.hidden = true;
    });
  }

  function start() {
    wireNotice();
    schedule();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
