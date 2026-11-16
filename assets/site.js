/* SJ Tours and Travels — site chrome shared by index.html and flights.html.
   1. Hamburger menu for the title bar (shown under 1100px).
   2. Floating WhatsApp button lifts up while a form field is focused,
      so it never covers the field being typed into. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    /* ---- Hamburger menu ---- */
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    if (toggle && menu) {
      var closeMenu = function () {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
        toggle.classList.remove("open");
      };
      toggle.addEventListener("click", function () {
        var opening = menu.hidden;
        menu.hidden = !opening;
        toggle.setAttribute("aria-expanded", String(opening));
        toggle.textContent = opening ? "✕" : "☰";
        toggle.classList.toggle("open", opening);
      });
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !menu.hidden) closeMenu();
      });
      document.addEventListener("pointerdown", function (e) {
        if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
      });
    }

    /* ---- WhatsApp float lift while a form field is focused ---- */
    function isField(el) {
      return el && (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA");
    }
    document.addEventListener("focusin", function (e) {
      if (isField(e.target)) document.body.classList.add("field-focused");
    });
    document.addEventListener("focusout", function () {
      setTimeout(function () {
        if (!isField(document.activeElement)) document.body.classList.remove("field-focused");
      }, 0);
    });
  });
})();
