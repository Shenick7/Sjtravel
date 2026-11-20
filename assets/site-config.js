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
