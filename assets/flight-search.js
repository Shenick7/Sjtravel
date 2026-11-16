/* SJ Tours and Travels — shared flight search.
   Used by BOTH index.html (homepage form) and flights.html.
   Builds one link format for the Travelpayouts White Label:
     https://flights.sjtravel.in/?flightSearch=CODE&marker=600744
   CODE = FROM + DDMM + TO + [return DDMM] + [class letter] + [passengers]
   Class letters: Economy = none, Premium Economy = w, Business = c, First = f.
   Passenger segment: adults digit, then the children digit if children > 0
   OR infants > 0, then the infants digit if infants > 0.
     1 adult + 1 infant = "101" | 2 adults + 2 infants = "202"
     2 adults + 1 child = "21"  | 1 adult only = "1"
   Validation messages are shown under the form; nothing opens on failure.
   "Today" is the current date in Asia/Kolkata. */
(function () {
  "use strict";

  var WL = "https://flights.sjtravel.in";
  var MARKER = "600744";
  var MAX_SUGGESTIONS = 6;

  /* ---- Airport data (same list on both pages; Indian airports first) ---- */
  var AIRPORTS = [
    "MAA – Chennai",
    "BLR – Bengaluru",
    "HYD – Hyderabad",
    "BOM – Mumbai",
    "DEL – New Delhi",
    "COK – Kochi",
    "TRZ – Tiruchirappalli",
    "IXM – Madurai",
    "CJB – Coimbatore",
    "VGA – Vijayawada",
    "VTZ – Visakhapatnam",
    "TIR – Tirupati",
    "IXE – Mangaluru",
    "CCJ – Kozhikode",
    "TRV – Thiruvananthapuram",
    "IXB – Bagdogra",
    "GAU – Guwahati",
    "PAT – Patna",
    "BBI – Bhubaneswar",
    "RPR – Raipur",
    "NAG – Nagpur",
    "PNQ – Pune",
    "AMD – Ahmedabad",
    "STV – Surat",
    "JAI – Jaipur",
    "UDR – Udaipur",
    "JDH – Jodhpur",
    "LKO – Lucknow",
    "VNS – Varanasi",
    "GOP – Gorakhpur",
    "IXC – Chandigarh",
    "ATQ – Amritsar",
    "SXR – Srinagar",
    "IXJ – Jammu",
    "DED – Dehradun",
    "IDR – Indore",
    "BHO – Bhopal",
    "RJA – Rajahmundry",
    "IXR – Ranchi",
    "IXZ – Port Blair",
    "IXA – Agartala",
    "IMF – Imphal",
    "SHL – Shillong",
    "DIB – Dibrugarh",
    "AJL – Aizawl",
    "DMU – Dimapur",
    "TEZ – Tezpur",
    "IXS – Silchar",
    "RUP – Rupsi",
    "IXD – Prayagraj",
    "KNU – Kanpur",
    "GWL – Gwalior",
    "JBP – Jabalpur",
    "HBX – Hubli",
    "IXG – Belagavi",
    "MYQ – Mysuru",
    "CNN – Kannur",
    "KTM – Kathmandu",
    "IXL – Leh",
    "GOX – Goa (Mopa)",
    "GOI – Goa (Dabolim)",
    "DXB – Dubai",
    "SIN – Singapore",
    "CMB – Colombo",
    "BKK – Bangkok",
    "KUL – Kuala Lumpur",
    "CGK – Jakarta",
    "MNL – Manila",
    "HKG – Hong Kong",
    "DOH – Doha",
    "AUH – Abu Dhabi",
    "MCT – Muscat",
    "BAH – Bahrain",
    "RUH – Riyadh",
    "JED – Jeddah",
    "KWI – Kuwait",
    "DAC – Dhaka",
    "MLE – Malé",
    "LHR – London",
    "CDG – Paris",
    "FRA – Frankfurt",
    "AMS – Amsterdam",
    "IST – Istanbul",
    "ZRH – Zurich",
    "JFK – New York",
    "YYZ – Toronto",
    "SYD – Sydney",
    "MEL – Melbourne",
    "TCR – Tuticorin",
    "SXV – Salem",
    "PNY – Pondicherry",
    "BKB – Bikaner",
    "JSA – Jaisalmer",
    "KTU – Kota",
    "KQH – Kishangarh (Ajmer)",
    "BDQ – Vadodara",
    "HSR – Rajkot",
    "JGA – Jamnagar",
    "BHJ – Bhuj",
    "BHU – Bhavnagar",
    "PBD – Porbandar",
    "DIU – Diu",
    "AGR – Agra",
    "AYJ – Ayodhya",
    "GAY – Gaya",
    "KBK – Kushinagar",
    "BEK – Bareilly",
    "CCU – Kolkata",
    "SAG – Shirdi",
    "IXU – Aurangabad",
    "DPS – Bali (Denpasar)",
    "NRT – Tokyo (Narita)",
    "ICN – Seoul (Incheon)",
  ];

  var CITY_CODES = {
    "Abu Dhabi": "AUH",
    Agartala: "IXA",
    Agra: "AGR",
    Ahmedabad: "AMD",
    Aizawl: "AJL",
    Ajmer: "KQH",
    Allahabad: "IXD",
    Amritsar: "ATQ",
    Amsterdam: "AMS",
    Aurangabad: "IXU",
    Ayodhya: "AYJ",
    Bagdogra: "IXB",
    Bahrain: "BAH",
    Bali: "DPS",
    "Bali Denpasar": "DPS",
    Bangalore: "BLR",
    Bangkok: "BKK",
    Bareilly: "BEK",
    Baroda: "BDQ",
    Belagavi: "IXG",
    Belgaum: "IXG",
    Bengaluru: "BLR",
    Bhavnagar: "BHU",
    Bhopal: "BHO",
    Bhubaneswar: "BBI",
    Bhuj: "BHJ",
    Bikaner: "BKB",
    Bombay: "BOM",
    Calicut: "CCJ",
    Chandigarh: "IXC",
    Chennai: "MAA",
    Cochin: "COK",
    Coimbatore: "CJB",
    Colombo: "CMB",
    Dehradun: "DED",
    Delhi: "DEL",
    Denpasar: "DPS",
    Dhaka: "DAC",
    Dibrugarh: "DIB",
    Dimapur: "DMU",
    Diu: "DIU",
    Doha: "DOH",
    Dubai: "DXB",
    Frankfurt: "FRA",
    Gaya: "GAY",
    Goa: "GOX",
    "Goa (Dabolim)": "GOI",
    "Goa (Mopa)": "GOX",
    Gorakhpur: "GOP",
    Guwahati: "GAU",
    Gwalior: "GWL",
    "Hong Kong": "HKG",
    Hubli: "HBX",
    Hyderabad: "HYD",
    Imphal: "IMF",
    Indore: "IDR",
    Istanbul: "IST",
    Jabalpur: "JBP",
    Jaipur: "JAI",
    Jaisalmer: "JSA",
    Jakarta: "CGK",
    Jammu: "IXJ",
    Jamnagar: "JGA",
    Jeddah: "JED",
    Jodhpur: "JDH",
    Kannur: "CNN",
    Kanpur: "KNU",
    Kathmandu: "KTM",
    Kishangarh: "KQH",
    Kochi: "COK",
    Kolkata: "CCU",
    Kota: "KTU",
    Kozhikode: "CCJ",
    "Kuala Lumpur": "KUL",
    Kushinagar: "KBK",
    Kuwait: "KWI",
    Leh: "IXL",
    London: "LHR",
    Lucknow: "LKO",
    Madras: "MAA",
    Madurai: "IXM",
    Maldives: "MLE",
    Male: "MLE",
    "Malé": "MLE",
    Mangalore: "IXE",
    Mangaluru: "IXE",
    Manila: "MNL",
    Melbourne: "MEL",
    Mopa: "GOX",
    Mumbai: "BOM",
    Muscat: "MCT",
    Mysore: "MYQ",
    Mysuru: "MYQ",
    Nagpur: "NAG",
    "New Delhi": "DEL",
    "New York": "JFK",
    Paris: "CDG",
    Patna: "PAT",
    Pondicherry: "PNY",
    Porbandar: "PBD",
    "Port Blair": "IXZ",
    Prayagraj: "IXD",
    Puducherry: "PNY",
    Pune: "PNQ",
    Raipur: "RPR",
    Rajahmundry: "RJA",
    Rajkot: "HSR",
    Ranchi: "IXR",
    Riyadh: "RUH",
    Rupsi: "RUP",
    Salem: "SXV",
    Seoul: "ICN",
    Shillong: "SHL",
    Shirdi: "SAG",
    Silchar: "IXS",
    Siliguri: "IXB",
    Singapore: "SIN",
    Srinagar: "SXR",
    Surat: "STV",
    Sydney: "SYD",
    Tezpur: "TEZ",
    Thiruvananthapuram: "TRV",
    Thoothukudi: "TCR",
    Tiruchirappalli: "TRZ",
    Tirupati: "TIR",
    Tokyo: "NRT",
    Toronto: "YYZ",
    Trichy: "TRZ",
    Trivandrum: "TRV",
    Tuticorin: "TCR",
    Udaipur: "UDR",
    Vadodara: "BDQ",
    Varanasi: "VNS",
    Vijayawada: "VGA",
    Visakhapatnam: "VTZ",
    Vizag: "VTZ",
    Zurich: "ZRH"
  };

  var REMOTE_CODES = {};

  /* ---- Helpers ---- */
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function codeFrom(value) {
    var v = String(value || "").trim();
    if (!v) return "";
    var paren = v.match(/\(([A-Z]{3})\)/);
    if (paren) return paren[1];
    if (CITY_CODES[v]) return CITY_CODES[v];
    var low = v.toLowerCase();
    var k;
    for (k in CITY_CODES) {
      if (k.toLowerCase() === low) return CITY_CODES[k];
    }
    if (REMOTE_CODES[v]) return REMOTE_CODES[v];
    for (k in REMOTE_CODES) {
      if (k.toLowerCase() === low) return REMOTE_CODES[k];
    }
    /* A city name inside a longer typed value, e.g. "Chennai airport". */
    var best = "";
    var bestLen = 0;
    for (k in CITY_CODES) {
      if (k.length > bestLen && low.indexOf(k.toLowerCase()) !== -1) {
        best = k;
        bestLen = k.length;
      }
    }
    if (best) return CITY_CODES[best];
    /* A bare 3-letter code, any case. */
    var up = v.toUpperCase();
    if (/^[A-Z]{3}$/.test(up)) return up;
    var lead = v.match(/^([A-Z]{3})(?![A-Z])/);
    if (lead) return lead[1];
    return "";
  }

  function ddmm(iso) {
    var p = String(iso || "").split("-");
    return p.length === 3 ? p[2] + p[1] : "";
  }

  /* Today's date in Asia/Kolkata, as YYYY-MM-DD. */
  function todayIST() {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch (e) {
      var d = new Date();
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }
  }

  function parseISO(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }

  function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }

  function inr(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  /* ---- Link building ---- */
  var CABIN_LETTER = { economy: "", premium: "w", business: "c", first: "f" };

  function passengerCode(adults, children, infants) {
    var s = String(adults);
    if (children > 0 || infants > 0) s += String(children);
    if (infants > 0) s += String(infants);
    return s;
  }

  function buildCode(o, d, depISO, retISO, cabin, adults, children, infants) {
    var s = o + ddmm(depISO) + d;
    if (retISO) s += ddmm(retISO);
    s += CABIN_LETTER[cabin] || "";
    s += passengerCode(adults, children, infants);
    return s;
  }

  function buildUrl(o, d, depISO, retISO, cabin, adults, children, infants) {
    return WL + "/?flightSearch=" + buildCode(o, d, depISO, retISO, cabin, adults, children, infants) + "&marker=" + MARKER;
  }

  /* ---- Validation ----
     v = { fromText, toText, trip: "return" | "oneway",
           depart: "YYYY-MM-DD" | "", ret: "YYYY-MM-DD" | "",
           adults, children, infants }
     Returns "" when the search is valid, otherwise the message to show
     under the form. Never opens a tab when validation fails. */
  function validateSearch(v) {
    var fromText = String(v.fromText || "").trim();
    var toText = String(v.toText || "").trim();
    if (!fromText) return "Choose where you're flying from";
    if (!toText) return "Choose where you're flying to";
    var from = codeFrom(fromText);
    var to = codeFrom(toText);
    if (!from) return "Please pick a From airport from the suggestions — city name or 3-letter code.";
    if (!to) return "Please pick a To airport from the suggestions — city name or 3-letter code.";
    if (from === to) return "From and To cannot be the same airport.";
    if (!v.depart) return "Please choose a depart date.";
    var today = parseISO(todayIST());
    var dep = parseISO(v.depart);
    if (!dep) return "Please choose a depart date.";
    if (dep < today) return "Depart date cannot be in the past — please pick today or a later date.";
    if (daysBetween(today, dep) > 330) return "Depart date is more than 330 days ahead — please pick a date within 330 days.";
    if (v.trip === "return") {
      if (!v.ret) return "Please choose a return date, or pick One-way.";
      var ret = parseISO(v.ret);
      if (!ret) return "Please choose a return date, or pick One-way.";
      if (ret < dep) return "Return date cannot be before the depart date.";
    }
    var ad = v.adults | 0;
    var ch = v.children | 0;
    var inf = v.infants | 0;
    if (ad < 1 || ad > 9) return "Adults must be between 1 and 9.";
    if (ad + ch + inf > 9) return "Total passengers cannot be more than 9 — please reduce children or infants.";
    if (inf > ad) return "Infants cannot be more than adults — each infant travels on an adult's lap.";
    return "";
  }

  /* ---- Autocomplete ----
     Indian airports first, at most 6 suggestions, and only results that
     actually match the typed text (a fuzzy remote match such as
     "Naberezhnye Chelny" for "Chennai" is dropped). */
  function localMatches(q) {
    q = q.trim().toLowerCase();
    if (!q) return AIRPORTS.slice();
    return AIRPORTS.filter(function (a) {
      return a.toLowerCase().indexOf(q) !== -1;
    });
  }

  function setupAutocomplete(input, listEl, opts) {
    if (!input || !listEl) return;
    var itemClass = opts.itemClass || "ac-item";
    var emptyClass = opts.emptyClass || "ac-empty";
    var emptyText = opts.emptyText || "No match — type the city name or a 3-letter code.";
    var timer = null;
    var active = -1;
    var items = [];

    function hide() {
      listEl.hidden = true;
      listEl.style.display = "none";
      listEl.innerHTML = "";
      input.setAttribute("aria-expanded", "false");
      active = -1;
      items = [];
    }

    function show() {
      listEl.hidden = false;
      listEl.style.display = "block";
      input.setAttribute("aria-expanded", "true");
    }

    function highlight(i) {
      var els = listEl.querySelectorAll("." + itemClass);
      els.forEach(function (el, idx) {
        el.classList.toggle("active", idx === i);
      });
    }

    function pick(item) {
      input.value = item;
      hide();
      input.focus();
    }

    function render(list) {
      items = list.slice(0, MAX_SUGGESTIONS);
      listEl.innerHTML = "";
      active = -1;
      if (!items.length) {
        var empty = document.createElement(listEl.tagName === "UL" ? "li" : "div");
        empty.className = emptyClass;
        empty.textContent = emptyText;
        listEl.appendChild(empty);
      } else {
        items.forEach(function (item) {
          var el = document.createElement(listEl.tagName === "UL" ? "li" : "div");
          el.className = itemClass;
          el.setAttribute("role", "option");
          /* "CODE – Name" as a bold code + city, so each page's CSS styles it. */
          var dash = item.indexOf(" – ");
          if (dash > 0) {
            var code = document.createElement("b");
            code.className = "fs-ac-code";
            code.textContent = item.slice(0, dash);
            var city = document.createElement("span");
            city.className = "fs-ac-city";
            city.textContent = item.slice(dash + 3);
            el.appendChild(code);
            el.appendChild(city);
          } else {
            el.textContent = item;
          }
          el.addEventListener("mousedown", function (e) {
            e.preventDefault();
            pick(item);
          });
          listEl.appendChild(el);
        });
      }
      show();
    }

    function open() {
      var q = input.value.trim();
      render(localMatches(q));
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (q.length < 2) return;
        fetch("/api/airports?q=" + encodeURIComponent(q), { headers: { Accept: "application/json" } })
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            var results = Array.isArray(data && data.results) ? data.results : [];
            var needle = q.toLowerCase();
            var seen = {};
            items.forEach(function (it) {
              seen[it.split(" ")[0]] = true;
            });
            var remote = results
              .filter(function (r) {
                /* Keep only results that actually match the typed text. */
                var hay = [r.code, r.name, r.city, r.country].join(" ").toLowerCase();
                return hay.indexOf(needle) !== -1;
              })
              .filter(function (r) {
                return r && r.code && !seen[r.code];
              })
              .sort(function (a, b) {
                /* Indian airports first. */
                return (b.country === "India" ? 1 : 0) - (a.country === "India" ? 1 : 0);
              })
              .map(function (r) {
                var label = r.code + " – " + (r.city || r.name);
                REMOTE_CODES[label] = r.code;
                return label;
              });
            if (remote.length) {
              var combined = items.concat(remote);
              var deduped = [];
              var have = {};
              combined.forEach(function (it) {
                if (!have[it]) {
                  have[it] = true;
                  deduped.push(it);
                }
              });
              render(deduped);
            }
          })
          .catch(function () {
            /* Local list already shown — nothing more to do. */
          });
      }, 300);
    }

    input.addEventListener("focus", open);
    input.addEventListener("input", open);
    input.addEventListener("keydown", function (e) {
      if (listEl.hidden) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = Math.min(active + 1, items.length - 1);
        highlight(active);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = Math.max(active - 1, 0);
        highlight(active);
      } else if (e.key === "Enter" && active >= 0 && items[active]) {
        e.preventDefault();
        pick(items[active]);
      } else if (e.key === "Escape") {
        hide();
      }
    });
    document.addEventListener("pointerdown", function (e) {
      if (e.target !== input && !listEl.contains(e.target)) hide();
    });
  }

  /* ---- Form wiring ----
     cfg = { form, fromInput, toInput, fromList, toList,
             getTrip: fn() -> "return" | "oneway",
             setTripUI: fn(oneway) -> void,
             departInput, returnInput, adultsSel, childrenSel,
             infantsSel, cabinSel, errorEl,
             itemClass, emptyClass, emptyText }
     On submit: validate, show the message under the form on failure,
     otherwise open the White Label search in a new tab. */
  function initFlightForm(cfg) {
    if (!cfg.form) return;
    var errorEl = cfg.errorEl;

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg || "";
      // The <p> starts with a `hidden` attribute; toggle it so the message
      // is actually visible when set and hidden again once cleared.
      errorEl.hidden = !msg;
    }

    setupAutocomplete(cfg.fromInput, cfg.fromList, cfg);
    setupAutocomplete(cfg.toInput, cfg.toList, cfg);

    if (cfg.getTrip && cfg.setTripUI) {
      var syncTrip = function () {
        cfg.setTripUI(cfg.getTrip() === "oneway");
      };
      var tripControls = cfg.form.querySelectorAll('[name="trip"], #fs-trip-type');
      tripControls.forEach(function (el) {
        el.addEventListener("change", syncTrip);
      });
      syncTrip();
    }

    cfg.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var trip = cfg.getTrip ? cfg.getTrip() : "return";
      var v = {
        fromText: cfg.fromInput ? cfg.fromInput.value : "",
        toText: cfg.toInput ? cfg.toInput.value : "",
        trip: trip,
        depart: cfg.departInput ? cfg.departInput.value : "",
        ret: trip === "return" && cfg.returnInput ? cfg.returnInput.value : "",
        adults: cfg.adultsSel ? parseInt(cfg.adultsSel.value, 10) : 1,
        children: cfg.childrenSel ? parseInt(cfg.childrenSel.value, 10) : 0,
        infants: cfg.infantsSel ? parseInt(cfg.infantsSel.value, 10) : 0,
      };
      var msg = validateSearch(v);
      if (msg) {
        showError(msg);
        return;
      }
      showError("");
      var from = codeFrom(v.fromText);
      var to = codeFrom(v.toText);
      var cabin = cfg.cabinSel ? cfg.cabinSel.value : "economy";
      window.open(
        buildUrl(from, to, v.depart, trip === "return" ? v.ret : "", cabin, v.adults, v.children, v.infants),
        "_blank",
        "noopener"
      );
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* Auto-wire whichever flight form is on this page. */
  ready(function () {
    var homeForm = document.getElementById("flightSearchForm");
    if (homeForm) {
      var tripSel = document.getElementById("fs-trip-type");
      var returnField = document.getElementById("fs-return-field");
      var returnInput = document.getElementById("fs-return");
      initFlightForm({
        form: homeForm,
        fromInput: document.getElementById("fs-from"),
        toInput: document.getElementById("fs-to"),
        fromList: document.getElementById("fs-from-list"),
        toList: document.getElementById("fs-to-list"),
        getTrip: function () {
          return tripSel ? tripSel.value : "return";
        },
        setTripUI: function (oneway) {
          if (returnField) returnField.classList.toggle("hidden", oneway);
          if (returnInput) returnInput.disabled = oneway;
        },
        departInput: document.getElementById("fs-depart"),
        returnInput: returnInput,
        adultsSel: document.getElementById("fs-adults"),
        childrenSel: document.getElementById("fs-children"),
        infantsSel: document.getElementById("fs-infants"),
        cabinSel: document.getElementById("fs-cabin"),
        errorEl: document.getElementById("fs-error"),
        itemClass: "fs-ac-item",
        emptyClass: "fs-ac-empty",
        emptyText: "No matches — try the city name or a 3-letter code.",
      });
    }

    var flightsForm = document.getElementById("flightSearch");
    if (flightsForm) {
      var retField = document.getElementById("retField");
      var retInput = document.getElementById("returnDate");
      initFlightForm({
        form: flightsForm,
        fromInput: document.getElementById("fromCode"),
        toInput: document.getElementById("toCode"),
        fromList: document.getElementById("fromCode-list"),
        toList: document.getElementById("toCode-list"),
        getTrip: function () {
          var checked = flightsForm.querySelector('input[name="trip"]:checked');
          return checked ? checked.value : "return";
        },
        setTripUI: function (oneway) {
          if (retField) retField.style.display = oneway ? "none" : "";
          if (retInput) {
            retInput.required = !oneway;
            if (oneway) retInput.value = "";
          }
        },
        departInput: document.getElementById("departDate"),
        returnInput: retInput,
        adultsSel: document.getElementById("adults"),
        childrenSel: document.getElementById("children"),
        infantsSel: document.getElementById("infants"),
        cabinSel: document.getElementById("cabin"),
        errorEl: document.getElementById("flightMsg"),
        itemClass: "ac-item",
        emptyClass: "ac-empty",
        emptyText: "No match — type the city name or a 3-letter code.",
      });
    }
  });

  /* Public API — used by flights.html calendar and popular routes. */
  window.SJFlights = {
    buildCode: buildCode,
    buildUrl: buildUrl,
    validateSearch: validateSearch,
    codeFrom: codeFrom,
    ddmm: ddmm,
    todayIST: todayIST,
    inr: inr,
    setupAutocomplete: setupAutocomplete,
    initFlightForm: initFlightForm,
    passengerCode: passengerCode,
  };
})();
