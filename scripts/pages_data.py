# Page copy for the traffic guides. Checked 17 Nov 2026.
# Imported by build_traffic_pages.py via exec.

TATKAL_TOOL = r"""
<section class="block"><div class="wrap">
  <div class="tool-card">
    <form id="tatkalForm">
      <div class="f-grid">
        <div class="f-field">
          <label for="tClass">Class</label>
          <select id="tClass" name="class">
            <option value="2A">AC 2 Tier (2A) — opens 10:00</option>
            <option value="3A">AC 3 Tier (3A) — opens 10:00</option>
            <option value="CC">AC Chair Car (CC) — opens 10:00</option>
            <option value="3E">AC 3 Economy (3E) — opens 10:00</option>
            <option value="EC">EC, as listed by IRCTC — opens 10:00</option>
            <option value="SL">Sleeper (SL) — opens 11:00</option>
            <option value="FC">First Class (FC) — opens 11:00</option>
            <option value="2S">Second Sitting (2S) — opens 11:00</option>
          </select>
        </div>
        <div class="f-field">
          <label for="tDate">Journey date</label>
          <input id="tDate" name="date" type="date" required />
        </div>
      </div>
      <button class="btn btn-accent" type="submit" style="margin-top:18px">When does Tatkal open?</button>
    </form>
    <div id="tatkalOut" class="tool-result" hidden></div>
    <p class="checked">Uses the opening times on IRCTC's Tatkal FAQ: 10:00 for the AC classes it names, 11:00 for SL, FC and 2S, one calendar day before the journey, excluding the journey date, counted from the train's originating station. Last checked 17 Nov 2026.</p>
  </div>
</div></section>
"""

TATKAL_JS = r"""
<script>
(function () {
  var ac = { "2A": 1, "3A": 1, "CC": 1, "3E": 1, "EC": 1 };
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var form = document.getElementById("tatkalForm");
  var out = document.getElementById("tatkalOut");
  if (!form || !out) return;
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var cls = document.getElementById("tClass").value;
    var raw = document.getElementById("tDate").value;
    if (!raw) return;
    var p = raw.split("-");
    var open = new Date(+p[0], +p[1] - 1, +p[2]);
    open.setDate(open.getDate() - 1);
    var hh = ac[cls] ? "10:00" : "11:00";
    var when = open.getDate() + " " + months[open.getMonth()] + " " + open.getFullYear();
    out.hidden = false;
    out.innerHTML = "<p>For " + cls + ", Tatkal booking opens at <b>" + hh + " IST on " + when + "</b>.</p>"
      + "<p>That is one day before the journey date you picked, excluding the journey date. IRCTC counts it from the train's departure at the originating station. If you board midway, use the origin's departure date, not your boarding date.</p>"
      + "<p>First AC is excluded by the same IRCTC FAQ. If a class is not on the train list, it is not bookable. Premium Tatkal was stated by IRCTC in April 2025 to use the same opening times.</p>";
  });
})();
</script>
"""

BUDGET_TOOL = r"""
<section class="block"><div class="wrap">
  <div class="tool-card">
    <form id="budgetForm">
      <p>Type the quotes you already have. This page does not look up fares or hotel rates, and it does not suggest prices.</p>
      <div class="f-grid">
        <div class="f-field"><label for="bAdults">Adults</label><input id="bAdults" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bChildren">Children</label><input id="bChildren" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bNights">Nights</label><input id="bNights" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bDays">Days you will buy food and local travel</label><input id="bDays" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bFlights">Flights, total for the family (₹)</label><input id="bFlights" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bHotel">Stay, per night for the family (₹)</label><input id="bHotel" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bFood">Food, per person per day (₹)</label><input id="bFood" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bLocal">Local travel, per day for the family (₹)</label><input id="bLocal" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bVisa">Visas, arrival cards, fees (₹)</label><input id="bVisa" type="number" min="0" inputmode="numeric" value="0" /></div>
        <div class="f-field"><label for="bOther">Other: eSIM, shopping, buffer (₹)</label><input id="bOther" type="number" min="0" inputmode="numeric" value="0" /></div>
      </div>
    </form>
    <div id="budgetOut" class="tool-result" aria-live="polite"><p>Total: ₹0</p><p>Add your own quotes. Empty boxes count as zero.</p></div>
  </div>
</div></section>
"""

BUDGET_JS = r"""
<script>
(function () {
  var ids = ["bAdults","bChildren","bNights","bDays","bFlights","bHotel","bFood","bLocal","bVisa","bOther"];
  var out = document.getElementById("budgetOut");
  function num(id) {
    var el = document.getElementById(id);
    var n = el ? Number(el.value) : 0;
    return isFinite(n) && n > 0 ? n : 0;
  }
  function rupees(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }
  function calc() {
    var people = num("bAdults") + num("bChildren");
    var nights = num("bNights");
    var days = num("bDays");
    var stay = num("bHotel") * nights;
    var food = num("bFood") * people * days;
    var local = num("bLocal") * days;
    var total = num("bFlights") + stay + food + local + num("bVisa") + num("bOther");
    if (!out) return;
    out.innerHTML = "<p>Total: <b>" + rupees(total) + "</b></p>"
      + "<p>Flights " + rupees(num("bFlights"))
      + " · stay " + rupees(stay)
      + " · food " + rupees(food)
      + " · local travel " + rupees(local)
      + " · visas and fees " + rupees(num("bVisa"))
      + " · other " + rupees(num("bOther")) + ".</p>"
      + "<p>Food uses adults plus children, times the days you entered. Stay is the nightly figure times nights. This is your arithmetic, not a fare.</p>";
  }
  ids.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", calc);
  });
  calc();
})();
</script>
"""

VISA_TOOL = r"""
<section class="block"><div class="wrap">
  <div class="tool-card">
    <div class="f-field">
      <label for="visaQ">Country</label>
      <input id="visaQ" type="search" placeholder="Type a country, for example Nepal" autocomplete="off" />
    </div>
    <div class="filter-bar" role="group" aria-label="Filter by entry type">
      <button type="button" class="filter-btn" data-kind="all" aria-pressed="true">All</button>
      <button type="button" class="filter-btn" data-kind="visa-free" aria-pressed="false">Visa-free</button>
      <button type="button" class="filter-btn" data-kind="visa-on-arrival" aria-pressed="false">Visa on arrival</button>
    </div>
    <p id="visaStatus" class="checked" aria-live="polite">Loading the list…</p>
    <div id="visaList" class="finder-list"></div>
  </div>
</div></section>
"""

VISA_JS = r"""
<script>
(function () {
  var listEl = document.getElementById("visaList");
  var statusEl = document.getElementById("visaStatus");
  var qEl = document.getElementById("visaQ");
  var kind = "all";
  var rows = [];
  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function show() {
    var q = (qEl.value || "").trim().toLowerCase();
    var shown = rows.filter(function (r) {
      if (kind !== "all" && r.kind !== kind) return false;
      if (!q) return true;
      return (r.name + " " + (r.notes || "") + " " + (r.stay || "")).toLowerCase().indexOf(q) !== -1;
    });
    statusEl.textContent = shown.length + " of " + rows.length + " rows. Last checked 17 Nov 2026.";
    listEl.innerHTML = shown.map(function (r) {
      var label = r.kind === "visa-free" ? "Visa-free" : "Visa on arrival";
      var stay = r.stay ? "<p><b>" + esc(r.stay) + "</b></p>" : "";
      var notes = r.notes ? "<p>" + esc(r.notes) + "</p>" : "";
      var src = (r.sources || []).map(function (s) {
        return '<a href="' + esc(s.url) + '">' + esc(s.title) + "</a>";
      }).join(" · ");
      return '<article class="finder-item"><h3>' + esc(r.name) + '<span class="kind">' + label + '</span></h3>' + stay + notes + '<p>' + src + '</p></article>';
    }).join("") || "<p>No country in this list matches. If it is not here, it was not on the MEA visa-free or visa-on-arrival tables we copied, after the Thailand correction.</p>";
  }
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      kind = btn.getAttribute("data-kind");
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      show();
    });
  });
  qEl.addEventListener("input", show);
  fetch("/data/visa-india.json").then(function (r) { return r.json(); }).then(function (data) {
    rows = data.countries || [];
    show();
  }).catch(function () {
    statusEl.textContent = "The country list did not load. Refresh the page.";
  });
})();
</script>
"""

PAGES = []

def add(**kwargs):
    PAGES.append(kwargs)

add(
    slug="tirumala-darshan-booking",
    title="Tirumala Darshan Ticket Booking Guide | SJ Tours",
    meta="Book Tirumala darshan only on the official TTD website. What the Rs.300 special-entry ticket, the time slot and the dress rule mean for your family trip.",
    h1="Tirumala darshan ticket booking",
    kicker="Pilgrimage · Free guide",
    lede="Book on the Tirumala Tirupati Devasthanams website, not on a page that asks you to pay a stranger. This is the booking path, the Rs.300 special-entry ticket TTD's own newsroom described in 2026, and the slot rule.",
    hub="guide",
    hub_title="Tirumala darshan ticket booking",
    hub_blurb="Official TTD site, the Rs.300 special-entry ticket, and the allotted time slot.",
    blocks=[
        {"h2": "Use the official booking site", "p": [
            "Tirumala's own page on special entry darshan says pilgrims book it on the internet at [ttdevasthanams.ap.gov.in](https://ttdevasthanams.ap.gov.in). TTD's newsroom, writing on 6 October 2026, asked devotees to book only through that site.",
            "The same temple page says Special Entry Darshan, also called Seeghra Darshan, was introduced on 21 September 2009, and advance booking on the internet started on 27 August 2014.",
            "Release dates are not a fixed calendar you can memorise. The 6 October 2026 note was about tickets for six specific October dates, released at 10:00 that morning. Treat that as an example of how TTD announces a release, not as a rule that tickets always open at 10:00.",
        ]},
        {"h2": "What the Rs.300 ticket is", "p": [
            "TTD's newsroom called these Rs.300 Special Entry Darshan tickets on 10 March 2026 and again on 6 October 2026. That is the price TTD itself printed in those notes. The amount on the booking screen that day is the one that applies. This page does not add a service fee, and SJ Tours does not sell the ticket.",
            "The 10 March 2026 note covers two products: Slotted Sarva Darshan tokens, and the Rs.300 special-entry tickets. Both are honoured only at the allotted time. Arriving early or late is not accepted into the queue. Plan the drive up the hill around the slot printed on the ticket, not around a hope of being let in whenever you reach.",
        ]},
        {"h2": "Dress, children, and what the older FAQ still says", "p": [
            "TTD's published EDP FAQ says traditional dress is mandatory for arjitha sevas and for advance-booking ticket holders. For men it lists dhoti and shirt, or kurta-pyjama. For women it lists a sari with blouse, a half-sari with blouse, or churidar-pyjama with a dupatta. Confirm the line on your ticket. Festival days can be stricter than a quiet weekday.",
            "The same FAQ says children below 12 do not need a darshan ticket, and that the child's Aadhaar is mandatory. The booking form is the final word if it asks for something the FAQ does not.",
            "The FAQ also describes older token counters and footpath timings. TTD's March 2026 note is about slotted entry. This page does not repeat the older footpath hours, because they may no longer be how a free darshan token is issued.",
        ]},
        {"h2": "A monthly group from Ambur", "p": [
            "SJ Tours runs a monthly Tirumala trip: one group, one vehicle, seats together, the same darshan slot. Joining the waitlist does not book the ticket and does not take payment. The darshan ticket, if you want the special-entry one, is still booked on the TTD site.",
        ]},
    ],
    lead=("WhatsApp me the free Tirumala trip checklist", "Hi, please send the free Tirumala trip checklist (from /tirumala-darshan-booking)"),
    wa=("Ask about the monthly Tirumala run", "Hi, I want a seat on the next Tirumala run (from /tirumala-darshan-booking)"),
    faqs=[
        ("Where do I buy a Tirumala darshan ticket?", "On https://ttdevasthanams.ap.gov.in. TTD's newsroom has told devotees to use that site. Do not pay a webpage that is not TTD."),
        ("Is the special-entry ticket Rs.300?", "TTD's own news notes in March 2026 and October 2026 called it a Rs.300 Special Entry Darshan ticket. Check the figure on the booking screen before you pay. Releases are announced for particular dates."),
        ("Can we enter the queue early?", "TTD's 10 March 2026 note says Slotted Sarva Darshan tokens and Rs.300 special-entry tickets are allowed only at the allotted time."),
        ("What should we wear?", "TTD's EDP FAQ requires traditional dress for advance-booking ticket holders: dhoti and shirt or kurta-pyjama for men; sari, half-sari, or churidar with a dupatta for women. Read the ticket as well."),
        ("Do you book the darshan for us?", "The monthly run is a shared vehicle and a shared slot. The ticket itself is booked on the TTD website. Message us on WhatsApp for the next run or for the free checklist."),
    ],
    related=[
        ("/waitlist-tirumala", "Monthly Tirumala run", "Join the waitlist. No payment yet."),
        ("/tirupati-from-chennai-bengaluru-vellore", "Tirupati by train and road", "From Chennai, Bengaluru and Vellore."),
        ("/holiday-packages", "Holiday packages", "If you want the travel arranged."),
        ("/guides", "All guides", "Tatkal, visas, Jain food, budgets."),
    ],
    sources=[
        ("TTD — Special Entry Darshan", "https://www.tirumala.org/SpecialEntryDarshan.aspx"),
        ("TTD news, 6 October 2026 — Rs.300 ticket release", "https://news.tirumala.org/ttd-to-release-rs-300-sed-tickets-on-october-7-_-%e0%b0%85%e0%b0%95%e0%b1%8d%e0%b0%9f%e0%b1%8b%e0%b0%ac%e0%b0%b0%e0%b1%8d-7%e0%b0%a8-%e0%b0%b0%e0%b1%82-300-%e0%b0%aa%e0%b1%8d%e0%b0%b0%e0%b0%a4/"),
        ("TTD news, 10 March 2026 — slot rule", "https://news.tirumala.org/devotees-with-ssd-tokens-and-rs-300-sed-tickets-allowed-only-at-the-allotted-time-_-%e0%b0%b8%e0%b1%8d%e0%b0%b2%e0%b0%be%e0%b0%9f%e0%b1%86%e0%b0%a1%e0%b1%8d-%e0%b0%b8%e0%b0%b0%e0%b1%8d%e0%b0%b5/"),
        ("TTD EDP FAQ (dress code and children under 12)", "https://www.tirumala.org/Downloads/MoreFaqs.pdf"),
        ("Booking site named by TTD", "https://ttdevasthanams.ap.gov.in"),
    ],
)

add(
    slug="tirupati-from-chennai-bengaluru-vellore",
    title="Tirupati from Chennai, Bengaluru and Vellore | SJ Tours",
    meta="How to reach Tirupati from Chennai, Bengaluru and Vellore by train or road, which station codes to search on IRCTC, and what to confirm before you leave.",
    h1="Tirupati from Chennai, Bengaluru and Vellore",
    kicker="Pilgrimage · Train and road",
    lede="The useful fact is the station code, not a clock time copied off a blog. Search IRCTC on the day you travel. Below is what two timetable sites agreed on 17 Nov 2026, and what they did not agree on.",
    hub="guide",
    hub_title="Tirupati from Chennai, Bengaluru and Vellore",
    hub_blurb="Station codes for IRCTC, and what not to trust until you check the day.",
    blocks=[
        {"h2": "Chennai", "p": [
            "Search MGR Chennai Central (MAS) to Tirupati (TPTY) on [IRCTC](https://www.irctc.co.in).",
            "Ixigo and RailYatri both listed 16057 Sapthagiri Express as a daily train from MAS to TPTY, about 151 km, when checked on 17 Nov 2026. RailYatri also says the IRCTC timetable can differ from other listings. This page therefore does not print a departure clock time. Open IRCTC or the NTES app and read that day's departure before you leave for the station.",
            "Those listings show the train calling at Tiruvallur, Arakkonam, Tiruttani, Puttur and Renigunta before Tirupati. That is the rail corridor. It is not a promise that a road journey takes the same number of minutes.",
        ]},
        {"h2": "Bengaluru", "p": [
            "Search KSR Bengaluru (SBC), or Yesvantpur (YPR) if that is the closer terminal, to Tirupati (TPTY).",
            "This page does not name a Bengaluru–Tirupati train or a departure time. The listings we compared were not consistent enough to print. IRCTC is the booking screen that matters.",
        ]},
        {"h2": "Vellore", "p": [
            "The railhead is Katpadi Junction (KPD), not a station in the middle of Vellore town. Search KPD to TPTY.",
            "Timetable sites list several daily trains on this pair. Their clock times did not match each other on 17 Nov 2026, so none are printed here. One listing put the rail distance near 113–115 km. Confirm the train and the time on IRCTC.",
            "Some of those trains are shown as terminating at Renigunta (RU), one stop before Tirupati. Read the destination on the IRCTC row before you book. Renigunta is not the temple.",
        ]},
        {"h2": "Road", "p": [
            "Use a live map on the day. Closures and hill traffic are not something a static page can know. From Chennai, drivers generally follow the corridor that also carries the rail line through Tiruttani and Puttur. From Vellore, start at Katpadi and head toward Chittoor and Tirupati. From Bengaluru, the usual road runs via Chittoor.",
            "This page does not state a driving time or a toll. The map you open that morning is the number to trust.",
            "Once you are in Tirupati, the darshan ticket is a separate job. Book it on the TTD site, and read the slot before you climb the hill.",
        ]},
    ],
    wa=("Plan the Tirumala run on WhatsApp", "Hi, I am coming to Tirupati and want the monthly Tirumala run (from /tirupati-from-chennai-bengaluru-vellore)"),
    faqs=[
        ("Which station code is Tirupati?", "TPTY. Chennai Central is MAS, KSR Bengaluru is SBC, Yesvantpur is YPR, and the Vellore railhead is Katpadi, KPD."),
        ("Is Sapthagiri Express the Chennai train?", "16057 is listed by Ixigo and RailYatri as a daily MAS–TPTY train. Confirm the time on IRCTC. This page does not print a clock time."),
        ("Does every Katpadi train reach Tirupati?", "No. Some listings end at Renigunta. Read the IRCTC destination before you pay."),
        ("How long is the drive?", "This page does not state one. Check a live map. Hill traffic changes the hour."),
    ],
    related=[
        ("/tirumala-darshan-booking", "Tirumala darshan booking", "Official site, Rs.300 ticket, time slot."),
        ("/waitlist-tirumala", "Monthly Tirumala run", "One vehicle, one slot, no payment yet."),
        ("/irctc-tatkal-booking", "Tatkal timings", "When the one-day window opens."),
        ("/irctc-waitlist-confirmation", "Waitlist codes", "GNWL, PQWL, RAC, and the chart."),
    ],
    sources=[
        ("IRCTC", "https://www.irctc.co.in"),
        ("Ixigo listing for 16057, checked 17 Nov 2026", "https://www.ixigo.com/trains/16057"),
        ("RailYatri listing for 16057, with its own warning that IRCTC times can differ", "https://www.railyatri.in/time-table/16057"),
        ("Indian Railways PNR and train enquiry", "https://indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en"),
    ],
)

add(
    slug="irctc-tatkal-booking",
    title="IRCTC Tatkal Booking Timings and Tips | SJ Tours",
    meta="IRCTC Tatkal opens one day before travel: 10:00 for AC classes and 11:00 for non-AC. Aadhaar, the four-passenger cap, and what the FAQ says now on IRCTC.",
    h1="IRCTC Tatkal booking timings",
    kicker="Trains · Free guide",
    lede="The opening clock is published by IRCTC. The rest of this page is the other rules on that same FAQ and on IRCTC's own booking guide and Aadhaar note, plus one ministry rule reported by The Hindu.",
    hub="guide",
    hub_title="IRCTC Tatkal timings and tips",
    hub_blurb="10:00 for AC, 11:00 for non-AC, one day before the origin departure.",
    blocks=[
        {"h2": "When the window opens", "p": [
            "IRCTC's Tatkal FAQ says a Tatkal e-ticket can be booked one day in advance, excluding the date of journey, from the train's originating station. On that opening day it starts at 10:00 for AC classes it lists as 2A, 3A, CC, EC and 3E, and at 11:00 for non-AC classes it lists as SL, FC and 2S.",
            "IRCTC's own example: if the train leaves its origin on 2 August, AC Tatkal opens at 10:00 on 1 August and non-AC Tatkal opens at 11:00 on 1 August.",
            "The same FAQ says Tatkal is allowed in all classes except First AC and Executive class. The booking-guide page on IRCTC still mentions 1A in an opening-time sentence. Where those two pages conflict, this guide follows the FAQ's exclusion of First AC. If IRCTC does not show a class on the train list, you cannot book it. EC appears in the FAQ's 10:00 list, so the helper includes it and asks you to confirm the code on the train.",
            "The Indian Express reported on 11 April 2025 that IRCTC had posted that Tatkal and Premium Tatkal timings were not being changed, and restated the same 10:00 and 11:00 clocks.",
        ]},
        {"h2": "Aadhaar, passengers, and money", "ul": [
            "IRCTC's Aadhaar guide for the Rail Connect app says that from 1 July 2025 only Aadhaar-authenticated users can book Tatkal and Premium Tatkal tickets.",
            "IRCTC's booking guide says a maximum of four passengers can be booked on one Tatkal e-ticket, names are limited to 15 characters, and senior-citizen concession is not allowed. The FAQ is wider: no concession is allowed in Tatkal.",
            "The FAQ says no refund is granted on cancellation of confirmed Tatkal tickets. Waitlisted Tatkal cancellations follow existing railway rules. This page does not invent that charge.",
            "Ladies quota and general quota cannot be combined with Tatkal quota, the FAQ says.",
            "Tatkal charges are extra, on top of the normal fare. The FAQ sets them as 10% of basic fare for second class and 30% for other classes, inside a minimum and maximum it prints: second sitting ₹10–15, sleeper ₹100–200, AC chair car ₹125–225, AC 3-tier ₹300–400, AC 2-tier ₹400–500. The same table prints an Executive row of ₹400–500 even though the FAQ says Executive class is excluded. Read both lines on the FAQ before you argue with the fare shown at payment.",
        ]},
        {"h2": "Agents, and ordinary tickets, which are a different clock", "p": [
            "The Hindu reported on 11 June 2025 that the Railway Ministry said authorised agents cannot book opening-day Tatkal during the first 30 minutes: 10:00–10:30 for AC, and 11:00–11:30 for non-AC. That is a news report of a ministry spokesperson, not a line we found on the Tatkal FAQ page itself.",
            "Ordinary reserved tickets are not Tatkal. IRCTC's terms say internet booking runs from 00:20 to 23:45 IST, the advance period is 60 days excluding the journey date for trains that use the full period, and opening-day general booking starts after 08:00. Some trains have a shorter advance period. Do not use the Tatkal helper for a general-quota ticket.",
        ]},
    ],
    lead=("WhatsApp me the free Tatkal cheat sheet", "Hi, please send the free Tatkal cheat sheet (from /irctc-tatkal-booking)"),
    wa=("Ask SJ Tours a train question", "Hi, I have a Tatkal question (from /irctc-tatkal-booking)"),
    faqs=[
        ("What time does Tatkal open?", "10:00 IST for the AC classes IRCTC lists (2A, 3A, CC, EC, 3E) and 11:00 IST for SL, FC and 2S, one day before the origin departure, excluding the journey date."),
        ("Is First AC on Tatkal?", "IRCTC's Tatkal FAQ says bookings are allowed in all classes except First AC and Executive class."),
        ("How many people on one Tatkal ticket?", "IRCTC's booking guide says a maximum of four passengers per Tatkal e-ticket."),
        ("Can I cancel a confirmed Tatkal ticket?", "The FAQ says no refund is granted on cancellation of confirmed Tatkal tickets."),
        ("Do I need Aadhaar?", "IRCTC's July 2025 guide says only Aadhaar-authenticated users can book Tatkal and Premium Tatkal on the website and app."),
    ],
    related=[
        ("/tatkal-booking-window", "Tatkal opening helper", "Pick a class and a date. It applies the IRCTC clocks."),
        ("/irctc-waitlist-confirmation", "Waitlist and the chart", "What the status codes mean. No fake percentages."),
        ("/tirupati-from-chennai-bengaluru-vellore", "Tirupati trains", "Station codes from Chennai, Bengaluru and Vellore."),
        ("/flight-finder", "Flight Finder — ₹199", "If the train is not going to work."),
    ],
    sources=[
        ("IRCTC Tatkal FAQ", "https://contents.irctc.co.in/en/TatkalFaq.html"),
        ("IRCTC Tatkal booking guide", "https://contents.irctc.co.in/en/TatkalBooking.html"),
        ("IRCTC — Aadhaar authentication for Tatkal, from 1 July 2025", "https://contents.irctc.co.in/en/MobileAppUserGuideAadhaarAuthenticationForTatkalBooking.pdf"),
        ("IRCTC terms — booking hours and the 60-day advance period", "https://contents.irctc.co.in/en/Terms%20and%20conditions.pdf"),
        ("The Hindu, 11 June 2025 — agent window, quoting the Railway Ministry", "https://www.thehindu.com/news/national/railways-tightens-tatkal-ticket-norms-aadhaar-based-authentication-made-mandatory/article69683148.ece"),
        ("Indian Express, 11 April 2025 — IRCTC post on unchanged timings", "https://indianexpress.com/article/india/tatkal-ticket-booking-timings-change-irctc-9940507/"),
    ],
)

add(
    slug="tatkal-booking-window",
    title="Tatkal Booking Window Helper | SJ Tours",
    meta="Pick an IRCTC class and a journey date. The helper shows the Tatkal opening day and the 10:00 or 11:00 clock from IRCTC's own FAQ. Nothing is uploaded.",
    h1="Tatkal booking window",
    kicker="Free tool · In your browser",
    lede="Choose the class and the journey date. The result is the opening published on IRCTC's Tatkal FAQ. It does not log into IRCTC and it does not know whether that train has a Tatkal quota.",
    hub="tool",
    hub_title="Tatkal booking window",
    hub_blurb="Class and journey date in, opening day and clock out. IRCTC's published rule.",
    blocks=[
        {"h2": "What it is using", "p": [
            "One day before the date you enter, excluding that date. 10:00 IST if you pick 2A, 3A, CC, EC or 3E. 11:00 IST if you pick SL, FC or 2S. The FAQ says the count is from the originating station. The tool cannot see your train, so if you board midway you must type the origin's departure date, not your boarding date.",
            "The full rules, including Aadhaar and the four-passenger cap, are on the Tatkal guide. The cheat sheet is a WhatsApp message, not an email form.",
        ]},
    ],
    tool_html=TATKAL_TOOL,
    extra_js=TATKAL_JS,
    lead=("WhatsApp me the free Tatkal cheat sheet", "Hi, please send the free Tatkal cheat sheet (from /tatkal-booking-window)"),
    wa=("Ask about a train", "Hi, I used the Tatkal helper and have a question (from /tatkal-booking-window)"),
    faqs=[
        ("Does this book the ticket?", "No. It only shows the opening day and clock from IRCTC's FAQ. You book on irctc.co.in."),
        ("Why is there no 1A option?", "The Tatkal FAQ says First AC is excluded."),
        ("What if my train starts the previous night?", "Use the origin departure date in the date box. IRCTC does not count from your boarding station."),
        ("Are the times ever different?", "IRCTC said in April 2025 they were not changing them. If the FAQ changes, this tool should be updated. The FAQ link is below."),
    ],
    related=[
        ("/irctc-tatkal-booking", "Tatkal rules in full", "Aadhaar, four passengers, charges, no refund on a confirmed ticket."),
        ("/irctc-waitlist-confirmation", "Waitlist codes", "RAC, GNWL, PQWL, and when the chart is prepared."),
        ("/guides", "All guides", "Back to the hub."),
    ],
    sources=[
        ("IRCTC Tatkal FAQ — opening times", "https://contents.irctc.co.in/en/TatkalFaq.html"),
    ],
)
