!function(){"use strict";var e;e=function(){var e=document.getElementById("menuToggle"),t=document.getElementById("mobileMenu");if(e&&t){var n=function(){t.hidden=!0,e.setAttribute("aria-expanded","false"),e.textContent="☰",e.classList.remove("open")};e.addEventListener("click",function(){var n=t.hidden;t.hidden=!n,e.setAttribute("aria-expanded",String(n)),e.textContent=n?"✕":"☰",e.classList.toggle("open",n)}),t.addEventListener("click",function(e){e.target.closest("a")&&n()}),document.addEventListener("keydown",function(e){"Escape"!==e.key||t.hidden||n()}),document.addEventListener("pointerdown",function(d){t.hidden||t.contains(d.target)||e.contains(d.target)||n()})}function d(e){return e&&("INPUT"===e.tagName||"SELECT"===e.tagName||"TEXTAREA"===e.tagName)}document.addEventListener("focusin",function(e){d(e.target)&&document.body.classList.add("field-focused")}),document.addEventListener("focusout",function(){setTimeout(function(){d(document.activeElement)||document.body.classList.remove("field-focused")},0)})},"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e()}();
window.sjTrack = function(name, params){ try{ if(window.gtag){ gtag('event', name, params||{}); } }catch(e){} try{ if(window.clarity){ clarity('event', name); } }catch(e){} };
document.addEventListener("click", function(e){
  var t = e.target && e.target.closest ? e.target.closest("a,button") : null;
  if(!t || !window.sjTrack) return;
  var href = t.getAttribute("href") || "";
  var track = t.getAttribute("data-track") || "";
  var params = { page: location.pathname || "/" };
  var kit = t.getAttribute("data-kit");
  var sub = t.getAttribute("data-subid");
  if(kit) params.kit = kit;
  if(sub) params.sub_id = sub;
  var rel = t.getAttribute("rel") || "";
  var wa = href.indexOf("wa.me/") !== -1 || href.indexOf("api.whatsapp.com") !== -1;
  var aff = rel.indexOf("sponsored") !== -1 || href.indexOf("tpo.lu/") !== -1 || href.indexOf("marker=600744") !== -1;
  try {
    if(track) sjTrack(track, params);
    if(wa && track !== "whatsapp_click") sjTrack("whatsapp_click", params);
    if(aff && track !== "affiliate_click") sjTrack("affiliate_click", params);
    if((track === "kit_buy_click" || track === "bundle_order_click") && track !== "kit_cta_click") sjTrack("kit_cta_click", params);
  } catch (err) {}
});
