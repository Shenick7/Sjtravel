/* SJ Tours and Travels — business phone number, one place.
 *
 * HOW TO CHANGE THE NUMBER: edit the four values in SJ_SITE below and the
 * whole site updates — the header and footer, every WhatsApp link, every
 * tel: link, the phone text on the page, the telephone in the schema.org
 * data, and the UPI ID on the kit pages. Nothing else needs editing.
 * (The static HTML still carries the current number as the fallback, so
 * the site stays correct for visitors with JavaScript off and for
 * search engines.)
 *
 * Current number: +91 95669 77211.
 *   phoneDigits — digits only, for wa.me and tel: links (919566977211)
 *   phoneDisplay — how the number reads on the page (+91 95669 77211)
 *   phoneTel — the tel: link value (+919566977211)
 *   phoneSchema — the schema.org telephone value (+91-95669-77211)
 */
window.SJ_SITE = {
  phoneDigits: "919566977211",
  phoneDisplay: "+91 95669 77211",
  phoneTel: "+919566977211",
  phoneSchema: "+91-95669-77211",
  whatsapp: "https://wa.me/919566977211"
};
(function () {
  var S = window.SJ_SITE;
  var OLD_DISPLAY = "+91 95669 77211";
  var OLD_SCHEMA = "+91-95669-77211";
  var OLD_UPI = "9566977211@upi";
  function rewrite() {
    var i, links;
    links = document.querySelectorAll('a[href*="wa.me/"]');
    for (i = 0; i < links.length; i++) {
      links[i].href = links[i].href.replace(/wa\.me\/\d+/, "wa.me/" + S.phoneDigits);
    }
    links = document.querySelectorAll('a[href^="tel:"]');
    for (i = 0; i < links.length; i++) {
      links[i].href = "tel:" + S.phoneTel;
    }
    links = document.querySelectorAll('a[href^="upi://pay"]');
    for (i = 0; i < links.length; i++) {
      links[i].href = links[i].href.replace(/pa=[^&]+/, "pa=" + encodeURIComponent(S.phoneDigits + "@upi"));
    }
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        return (p && (p.nodeName === "SCRIPT" || p.nodeName === "STYLE"))
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (node.nodeValue.indexOf(OLD_DISPLAY) !== -1) {
        node.nodeValue = node.nodeValue.split(OLD_DISPLAY).join(S.phoneDisplay);
      }
      if (node.nodeValue.indexOf(OLD_UPI) !== -1) {
        node.nodeValue = node.nodeValue.split(OLD_UPI).join(S.phoneDigits + "@upi");
      }
    });
    var ld = document.querySelectorAll('script[type="application/ld+json"]');
    for (i = 0; i < ld.length; i++) {
      if (ld[i].textContent.indexOf(OLD_SCHEMA) !== -1) {
        ld[i].textContent = ld[i].textContent.split(OLD_SCHEMA).join(S.phoneSchema);
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewrite);
  } else {
    rewrite();
  }
})();

/* Kit and bundle prices — ONE settings file for every price on the site.
 *
 * Launch prices apply until 31 Dec 2026, 11:59 PM IST; regular prices from
 * 1 Jan 2027, 00:00 IST. The static HTML carries the LAUNCH presentation
 * (correct now, and correct for crawlers and visitors with JavaScript off).
 * On/after the switch date this script rewrites the page to the regular
 * prices, so the switch happens without a redeploy. A scheduled rebuild on
 * 1 Jan 2027 bakes the regular prices into the HTML itself.
 *
 * Preview: add ?prices=2027 to any URL to see the regular prices now,
 * or ?prices=launch to force the launch prices. Ordinary visitors see
 * nothing different — the preview only changes this one browser's view.
 *
 * The kit has never sold at ₹1,499, so ₹1,499 is never shown as a "was"
 * price: no strikethrough, no "List price", no "List total", no "You save".
 * The launch offer is dated instead — "launch price till 31 Dec 2026",
 * going up to ₹1,499 on 1 Jan 2027.
 */
window.SJ_PRICES = {
  switchDate: "2027-01-01",
  launch: { single: 999, bundles: { 1: 999, 2: 1998, 3: 1999, 4: 2998, 5: 3499, 6: 3999 } },
  regular: { single: 1499, bundles: { 1: 1499, 2: 2998, 3: 2999, 4: 4498, 5: 4999, 6: 5499 } },
  period: function () {
    var q = "";
    try { q = new URLSearchParams(window.location.search).get("prices") || ""; } catch (e) { q = ""; }
    if (q === "2027") return "regular";
    if (q === "launch") return "launch";
    var ist = "";
    try {
      ist = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    } catch (e) { ist = ""; }
    if (!ist) return "launch";
    return ist >= "2027-01-01" ? "regular" : "launch";
  },
  isRegular: function () { return this.period() === "regular"; },
  single: function () { return (this.isRegular() ? this.regular : this.launch).single; },
  priceFor: function (n) { return (this.isRegular() ? this.regular : this.launch).bundles[n] || 0; }
};

(function () {
  /* Launch wording -> regular wording, longest first. The order matters:
     a short pair must never run before a longer pair that contains it
     (e.g. "launch price ₹999" must not run before
     "launch price ₹999 till 31 Dec 2026"). The same table is used by the
     1 Jan 2027 rebuild script, so the browser switch and the rebuild agree.
     "31 Dec" is only used for the kit launch offer; the visa-free
     "31 December 2026" dates elsewhere on the site are a different fact
     and are deliberately NOT touched. */
  var PRICE_SWAP = [
    ["₹999 — launch price till 31 Dec 2026. Goes up to ₹1,499 on 1 Jan 2027.", "₹1,499."],
    ["₹999 — launch price till 31 Dec 2026. Goes up to ₹1,499 on 1 Jan 2027:", "₹1,499:"],
    ["₹999 — launch price till 31 Dec 2026", "₹1,499"],
    ["Launch prices till 31 Dec: 3 for ₹1,999 · 5 for ₹3,499 · all 6 for ₹3,999.", "Prices: 3 for ₹2,999 · 5 for ₹4,999 · all 6 for ₹5,499."],
    ["Launch prices till 31 Dec: 3 for ₹1,999 · 5 for ₹3,499 · all 6 for ₹3,999", "Prices: 3 for ₹2,999 · 5 for ₹4,999 · all 6 for ₹5,499"],
    ["launch prices till 31 Dec: 3 for ₹1,999 · 5 for ₹3,499 · all 6 for ₹3,999", "prices: 3 for ₹2,999 · 5 for ₹4,999 · all 6 for ₹5,499"],
    ["₹999 launch price till 31 Dec 2026", "₹1,499"],
    ["launch price ₹999 till 31 Dec 2026", "₹1,499"],
    ["Launch price ₹999 till 31 Dec 2026", "₹1,499"],
    ["Launch prices you pay: 1 kit ₹999 · 2 kits ₹1,998 · 3 kits ₹1,999 · 4 kits ₹2,998 · 5 kits ₹3,499 · all 6 ₹3,999.", "Prices: 1 kit ₹1,499 · 2 kits ₹2,998 · 3 kits ₹2,999 · 4 kits ₹4,498 · 5 kits ₹4,999 · all 6 ₹5,499."],
    ["Launch prices you pay:", "Prices:"],
    ["launch price ₹999", "₹1,499"],
    ["Launch price ₹999", "₹1,499"],
    ["₹999 launch price", "₹1,499"],
    ["Any 3 kits — ₹1,999", "Any 3 kits — ₹2,999"],
    ["5 kits — ₹3,499", "5 kits — ₹4,999"],
    ["All 6 kits — ₹3,999", "All 6 kits — ₹5,499"],
    ["3 for ₹1,999", "3 for ₹2,999"],
    ["5 for ₹3,499", "5 for ₹4,999"],
    ["all 6 for ₹3,999", "all 6 for ₹5,499"],
    ["All 6 for ₹3,999", "All 6 for ₹5,499"],
    ["any 3 kits ₹1,999", "any 3 kits ₹2,999"],
    ["any 3 for ₹1,999", "any 3 for ₹2,999"],
    ["3 kits ₹1,999", "3 kits ₹2,999"],
    ["5 kits ₹3,499", "5 kits ₹4,999"],
    ["all 6 kits ₹3,999", "all 6 kits ₹5,499"],
    ["1 kit ₹999", "1 kit ₹1,499"],
    ["2 kits ₹1,998", "2 kits ₹2,998"],
    ["4 kits ₹2,998", "4 kits ₹4,498"],
    ["1 for ₹999", "1 for ₹1,499"],
    ["2 for ₹1,998", "2 for ₹2,998"],
    ["4 for ₹2,998", "4 for ₹4,498"],
    /* Bare amounts, last. NOTE: there is deliberately NO bare "₹2,998" pair:
       "₹2,998" is both the launch 4-kit price AND the regular 2-kit price, so
       a bare pair would corrupt the regular price on a second run (and in the
       browser it would corrupt a price the calculator or pay.js already set).
       Every launch "₹2,998" is covered by a specific pair above ("4 kits
       ₹2,998", "4 for ₹2,998", and the "Launch prices you pay" sentence). */
    ["₹1,999", "₹2,999"],
    ["₹3,499", "₹4,999"],
    ["₹3,999", "₹5,499"],
    ["₹1,998", "₹2,998"],
    ["₹999", "₹1,499"]
  ];
  /* Launch UPI amounts -> regular UPI amounts (for upi://pay links and
     data-amount attributes the payment script has not already rewritten). */
  var AMOUNTS = { "999": "1499", "1998": "2998", "1999": "2999", "2998": "4498", "3499": "4999", "3999": "5499" };

  function swapText(s) {
    /* Two-phase replacement: first swap each launch string for a unique
       placeholder, then swap the placeholders for the regular strings.
       A plain sequential replace would re-process its own output — e.g.
       "2 kits ₹1,998" -> "2 kits ₹2,998" would then be hit by the bare
       "₹2,998" -> "₹4,498" pair and come out as the wrong "2 kits ₹4,498".
       The same table is used by the 1 Jan 2027 rebuild script. */
    var out = s;
    var done = [];
    for (var i = 0; i < PRICE_SWAP.length; i++) {
      var pair = PRICE_SWAP[i];
      if (out.indexOf(pair[0]) !== -1) {
        var ph = "" + i + "";
        out = out.split(pair[0]).join(ph);
        done.push([ph, pair[1]]);
      }
    }
    for (var j = 0; j < done.length; j++) out = out.split(done[j][0]).join(done[j][1]);
    return out;
  }

  function swapJsonLd(el) {
    var d;
    try { d = JSON.parse(el.textContent); } catch (e) { return; }
    (function walk(o) {
      var k;
      if (Array.isArray(o)) { for (k = 0; k < o.length; k++) walk(o[k]); return; }
      if (o && typeof o === "object") {
        for (k in o) {
          if (typeof o[k] === "string") o[k] = swapText(o[k]);
          else walk(o[k]);
        }
      }
    })(d);
    if (d && d.offers && typeof d.offers === "object") {
      if (d.offers.price === "999" || d.offers.price === 999) d.offers.price = "1499";
      delete d.offers.priceValidUntil;
      delete d.offers.priceSpecification;
    }
    el.textContent = JSON.stringify(d, null, 2);
  }

  function rewritePrices() {
    if (!window.SJ_PRICES || !window.SJ_PRICES.isRegular()) return;
    var i, links, el;
    document.title = swapText(document.title);
    var metas = document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"], meta[property="og:title"], meta[name="twitter:title"], meta[property="og:image:alt"]');
    for (i = 0; i < metas.length; i++) {
      var c = metas[i].getAttribute("content");
      if (c) metas[i].setAttribute("content", swapText(c));
    }
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        return (p && (p.nodeName === "SCRIPT" || p.nodeName === "STYLE"))
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) { node.nodeValue = swapText(node.nodeValue); });
    var ld = document.querySelectorAll('script[type="application/ld+json"]');
    for (i = 0; i < ld.length; i++) swapJsonLd(ld[i]);
    links = document.querySelectorAll('a[href*="wa.me/"]');
    for (i = 0; i < links.length; i++) {
      var m = links[i].href.match(/[?&]text=([^&]*)/);
      if (!m) continue;
      var dec = "";
      try { dec = decodeURIComponent(m[1]); } catch (e) { continue; }
      var rep = swapText(dec);
      if (rep !== dec) links[i].href = links[i].href.replace(m[1], encodeURIComponent(rep));
    }
    links = document.querySelectorAll('a[href^="upi://pay"]');
    for (i = 0; i < links.length; i++) {
      links[i].href = links[i].href.replace(/am=(\d+)\.00/, function (_, a) {
        return AMOUNTS[a] ? "am=" + AMOUNTS[a] + ".00" : "am=" + a + ".00";
      });
    }
    var boxes = document.querySelectorAll(".upi-box[data-amount]");
    for (i = 0; i < boxes.length; i++) {
      var a = boxes[i].getAttribute("data-amount");
      if (AMOUNTS[a]) boxes[i].setAttribute("data-amount", AMOUNTS[a]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewritePrices);
  } else {
    rewritePrices();
  }
})();
