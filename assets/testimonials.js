/* Renders "What travellers say" only when content/testimonials.json
   has real entries. An empty list leaves the section hidden.
   Each entry: name, city, trip, month, quote. photo is optional.
   Do not add Review schema until the owner publishes real quotes. */
(function () {
  var root = document.getElementById("what-travellers-say");
  if (!root) return;
  var mount = root.querySelector("[data-testimonials-mount]");
  if (!mount) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  fetch("/content/testimonials.json", { headers: { Accept: "application/json" } })
    .then(function (res) { return res.ok ? res.json() : []; })
    .then(function (items) {
      if (!Array.isArray(items)) return;
      var real = items.filter(function (item) {
        return item && item.quote && item.name && item.trip && item.month;
      });
      if (!real.length) return;
      mount.innerHTML = real.slice(0, 6).map(function (item) {
        var photo = item.photo
          ? '<img src="' + esc(item.photo) + '" alt="' + esc(item.photoAlt || item.trip) + '" loading="lazy">'
          : "";
        return '<article class="svc">' + photo +
          "<h3>" + esc(item.trip) + "</h3>" +
          "<p>“" + esc(item.quote) + "”</p>" +
          '<p class="svc-note">' + esc(item.name) +
          (item.city ? " · " + esc(item.city) : "") +
          " · " + esc(item.month) + "</p></article>";
      }).join("");
      root.hidden = false;
    })
    .catch(function () {});
})();
