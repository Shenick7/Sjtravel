!function(){"use strict";var e;e=function(){var e=document.getElementById("menuToggle"),t=document.getElementById("mobileMenu");if(e&&t){var n=function(){t.hidden=!0,e.setAttribute("aria-expanded","false"),e.textContent="☰",e.classList.remove("open")};e.addEventListener("click",function(){var n=t.hidden;t.hidden=!n,e.setAttribute("aria-expanded",String(n)),e.textContent=n?"✕":"☰",e.classList.toggle("open",n)}),t.addEventListener("click",function(e){e.target.closest("a")&&n()}),document.addEventListener("keydown",function(e){"Escape"!==e.key||t.hidden||n()}),document.addEventListener("pointerdown",function(d){t.hidden||t.contains(d.target)||e.contains(d.target)||n()})}function d(e){return e&&("INPUT"===e.tagName||"SELECT"===e.tagName||"TEXTAREA"===e.tagName)}document.addEventListener("focusin",function(e){d(e.target)&&document.body.classList.add("field-focused")}),document.addEventListener("focusout",function(){setTimeout(function(){d(document.activeElement)||document.body.classList.remove("field-focused")},0)})},"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e()}();
window.sjTrack = function(name, params){
  params = params || {};
  if (!params.page_path) params.page_path = location.pathname;
  try { if (window.gtag) gtag("event", name, params); } catch (e) {}
  try { if (window.clarity) clarity("event", name); } catch (e) {}
};
document.addEventListener("click", function(e){
  var t = e.target && e.target.closest ? e.target.closest("[data-track]") : null;
  if (t && window.sjTrack) {
    var k = t.getAttribute("data-kit");
    try { sjTrack(t.getAttribute("data-track"), k ? { kit: k } : {}); } catch (err) {}
  }
  var a = e.target && e.target.closest ? e.target.closest("a") : null;
  if (!a || !window.sjTrack) return;
  var href = a.getAttribute("href") || "";
  if (a.getAttribute("data-track")) return;
  if (href.indexOf("wa.me/") !== -1 || href.indexOf("api.whatsapp.com") !== -1) sjTrack("whatsapp_click", {});
  else if (href.indexOf("tel:") === 0) sjTrack("call_click", {});
});
document.addEventListener("submit", function (e) {
  var f = e.target;
  if (!f || f.tagName !== "FORM" || !window.sjTrack) return;
  sjTrack("lead_form", { form_id: f.id || "" });
}, true);
document.addEventListener("DOMContentLoaded", function () {
  var wa = document.querySelector(".tap-bar .tap-wa");
  if (!wa) return;
  var msg = "Hi SJ Tours, I am on this page: " + document.title;
  wa.href = "https://wa.me/919566977211?text=" + encodeURIComponent(msg);
});
