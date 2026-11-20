/* Renders Pay by UPI from window.SJ_PAY.
   Each .upi-box needs data-product, data-amount and data-page.
   data-dynamic="1" stays hidden until SJPay.fill() is called
   (the homepage bundle picker does this). */
(function () {
  "use strict";
  var cfg = window.SJ_PAY || { enabled: false, upiId: "", payeeName: "" };

  if (!document.getElementById("sj-upi-style")) {
    var style = document.createElement("style");
    style.id = "sj-upi-style";
    style.textContent = ".upi-box{margin-top:14px;border:1px solid #e3e7ee;border-radius:12px;padding:16px 18px;display:grid;gap:10px;background:#fff;max-width:100%}.upi-box[hidden]{display:none}.upi-kicker{margin:0;font-size:.74rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#034694}.upi-box p{margin:0;color:#5a6573;font-size:1rem}.upi-box b{color:#14181a}.upi-qr svg{width:168px;height:168px;max-width:70vw;height:auto;display:block}.upi-actions{display:flex;flex-wrap:wrap;gap:10px}.upi-actions .btn{min-height:48px;flex:1 1 100%}.foot{flex-wrap:wrap}.buy-row{flex-wrap:wrap}.foot .upi-box,.buy-row .upi-box,.svc .upi-box{flex:1 0 100%;max-width:100%}";
    document.head.appendChild(style);
  }

  function rupees(amount) {
    var n = Number(amount);
    if (!isFinite(n)) return "";
    return "₹" + n.toLocaleString("en-IN");
  }

  function upiUrl(amount, note) {
    return "upi://pay?pa=" + encodeURIComponent(cfg.upiId)
      + "&pn=" + encodeURIComponent(cfg.payeeName || "SJ Tours and Travels")
      + "&am=" + encodeURIComponent(Number(amount).toFixed(2))
      + "&cu=INR&tn=" + encodeURIComponent(note);
  }

  function shotUrl(product, amount, page) {
    var msg = "Hi, I paid by UPI for the " + product + " (" + rupees(amount) + ", from " + page + "). Sending the payment screenshot.";
    return (window.SJ_SITE ? window.SJ_SITE.whatsapp : "https://wa.me/919566977211") + "?text=" + encodeURIComponent(msg);
  }

  var qrLoading = null;
  function ensureQr(cb) {
    if (typeof qrcode === "function") { cb(); return; }
    if (!qrLoading) {
      qrLoading = new Promise(function (resolve) {
        var s = document.createElement("script");
        s.src = "/assets/qrcode.js";
        s.onload = function () { resolve(); };
        s.onerror = function () { resolve(); };
        document.head.appendChild(s);
      });
    }
    qrLoading.then(cb);
  }

  function drawQr(el, text) {
    if (!el) return;
    ensureQr(function () {
      if (typeof qrcode !== "function") return;
      try {
        var qr = qrcode(0, "M");
        qr.addData(text);
        qr.make();
        el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: "UPI QR code", title: "UPI QR code" });
      } catch (err) {
        el.textContent = "";
      }
    });
  }

  function fill(box) {
    if (!box) return;
    var product = box.getAttribute("data-product") || "";
    var amount = box.getAttribute("data-amount") || "";
    var page = box.getAttribute("data-page") || (location.pathname || "/");
    if (!cfg.enabled || !cfg.upiId || !product || !amount || Number(amount) <= 0) {
      box.hidden = true;
      return;
    }
    var link = upiUrl(amount, product);
    var pay = box.querySelector("[data-upi-link]");
    if (pay) {
      pay.href = link;
      pay.textContent = "Pay " + rupees(amount) + " by UPI";
      pay.setAttribute("data-kit", product);
    }
    var shot = box.querySelector("[data-upi-shot]");
    if (shot) {
      shot.href = shotUrl(product, amount, page);
      shot.setAttribute("data-kit", product);
    }
    var idEl = box.querySelector("[data-upi-id]");
    if (idEl) idEl.textContent = cfg.upiId;
    var nameEl = box.querySelector("[data-upi-name]");
    if (nameEl) nameEl.textContent = cfg.payeeName || "SJ Tours and Travels";
    var noteEl = box.querySelector("[data-upi-note]");
    if (noteEl) noteEl.textContent = product;
    var amtEl = box.querySelector("[data-upi-amt]");
    if (amtEl) amtEl.textContent = rupees(amount);
    drawQr(box.querySelector("[data-upi-qr]"), link);
    box.hidden = false;
  }

  function init() {
    var boxes = document.querySelectorAll(".upi-box");
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].getAttribute("data-dynamic") === "1") continue;
      fill(boxes[i]);
    }
  }

  window.SJPay = { fill: fill, upiUrl: upiUrl };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
