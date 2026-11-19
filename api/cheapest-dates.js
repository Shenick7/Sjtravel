// GET /api/cheapest-dates?origin=MAA&destination=DXB&month=YYYY-MM
//   -> lowest recently found fare per day for that route/month (calendar)
// GET /api/cheapest-dates?mode=cheap&origin=MAA&destination=DXB
//   -> single cheapest recently found fare for the route (popular routes)
//
// Both modes draw from the SAME source: Travelpayouts v3
// prices_for_dates, currency INR, one_way=true. The calendar returns the
// cheapest one-way fare per day; cheap mode takes the cheapest one-way
// fare across the next 60 days. The two can still disagree for a while:
// the cache below is an in-memory Map inside this serverless function,
// and Vercel runs several copies of it — each copy holds its own cache,
// refreshed at different times. So two pages can show two different
// "recently found" prices until every copy has refreshed. The frontend
// also keeps a shared 6-hour copy in the visitor's browser
// (localStorage key sj-cheap:<ORIGIN>-<DEST>) so both pages agree there,
// and this endpoint sends CDN-Cache-Control so Vercel's edge cache can
// share one copy across instances. If v3 returns nothing, cheap mode
// falls back to v1 prices/cheap, which can return a return fare — the
// response then carries return_at and one_way:false, and the frontend
// labels it "return" on the site.
//
// Server-side only. The Travelpayouts API token is read ONLY from the
// TRAVELPAYOUTS_API_TOKEN environment variable (set in Vercel, never in
// code, never committed, never sent to the browser). If it is not set,
// the endpoint answers configured:false and the site shows live fares
// on the White Label instead of any price. No fares are invented here:
// every price comes from Travelpayouts' cached Data API, and the
// frontend labels them "recently found".

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cache = new Map(); // key -> { at, body }

function cached(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.body;
  cache.delete(key);
  return null;
}
function store(key, body) {
  cache.set(key, { at: Date.now(), body });
  if (cache.size > 200) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
}

function isIata(v) {
  return typeof v === "string" && /^[A-Z]{3}$/.test(v.toUpperCase());
}
function isMonth(v) {
  return typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}

function pad(n) {
  return (n < 10 ? "0" : "") + n;
}
function isoOf(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
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
    return isoOf(new Date());
  }
}

/* "YYYY-MM" strings covering today .. today + daysAhead. */
function monthsInWindow(daysAhead) {
  const start = new Date(todayIST() + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + daysAhead);
  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(cur.getFullYear() + "-" + pad(cur.getMonth() + 1));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) throw new Error("upstream " + res.status);
  return JSON.parse(text);
}

// Cheapest one-way fare per day in a month, via v3 prices_for_dates.
// Falls back to v1 prices/calendar if v3 returns nothing.
async function calendarPrices(origin, destination, month, token) {
  const q = new URLSearchParams({
    origin,
    destination,
    departure_at: month,
    currency: "inr",
    one_way: "true",
    sorting: "price",
    limit: "1000",
    token,
  });
  try {
    const data = await fetchJson(
      "https://api.travelpayouts.com/aviasales/v3/prices_for_dates?" + q
    );
    const days = {};
    for (const item of Array.isArray(data.data) ? data.data : []) {
      if (!item || typeof item.price !== "number" || !item.departure_at) continue;
      const date = String(item.departure_at).slice(0, 10);
      if (!date.startsWith(month)) continue;
      if (days[date] == null || item.price < days[date].price) {
        days[date] = { date, price: item.price };
        if (item.return_at) days[date].return_at = item.return_at;
      }
    }
    const list = Object.keys(days).sort().map((date) => days[date]);
    if (list.length) return list;
  } catch (e) {
    // fall through to the v1 calendar endpoint
  }
  const q2 = new URLSearchParams({
    origin,
    destination,
    depart_date: month + "-01",
    currency: "inr",
    token,
  });
  const data = await fetchJson(
    "https://api.travelpayouts.com/v1/prices/calendar?" + q2
  );
  const days = {};
  const raw = data && data.data ? data.data : {};
  for (const date of Object.keys(raw)) {
    const price = raw[date] && raw[date].price;
    if (typeof price === "number" && date.startsWith(month)) {
      if (days[date] == null || price < days[date].price) {
        days[date] = { date, price };
        if (raw[date].return_at) days[date].return_at = raw[date].return_at;
      }
    }
  }
  return Object.keys(days).sort().map((date) => days[date]);
}

// Single cheapest one-way fare for a route across the next 60 days,
// via v3 prices_for_dates (one month at a time). Falls back to
// v1 prices/cheap only if v3 finds nothing; the v1 result can be a
// return fare, so the caller labels it from return_at / one_way.
async function cheapestPrice(origin, destination, token) {
  const today = todayIST();
  const end = new Date(today + "T00:00:00");
  end.setDate(end.getDate() + 60);
  const endISO = isoOf(end);
  // Fetch all months in the 60-day window in parallel: the old code
  // awaited one Travelpayouts call per month in turn, so a cold lookup
  // did up to 3 slow upstream calls back to back (~20s for the slowest
  // routes on /deals). Same queries, same cheapest-pick logic — just
  // concurrent. A month that fails still does not fail the lookup.
  const monthResults = await Promise.all(
    monthsInWindow(60).map(async (month) => {
      const q = new URLSearchParams({
        origin,
        destination,
        departure_at: month,
        currency: "inr",
        one_way: "true",
        sorting: "price",
        limit: "1000",
        token,
      });
      try {
        return await fetchJson(
          "https://api.travelpayouts.com/aviasales/v3/prices_for_dates?" + q
        );
      } catch (e) {
        return null;
      }
    })
  );
  let best = null;
  for (const data of monthResults) {
    for (const item of Array.isArray(data && data.data) ? data.data : []) {
      if (!item || typeof item.price !== "number" || !item.departure_at) continue;
      const depDate = String(item.departure_at).slice(0, 10);
      if (depDate < today || depDate > endISO) continue;
      if (!best || item.price < best.price) {
        best = {
          price: item.price,
          departure_at: item.departure_at,
          return_at: item.return_at || null,
        };
      }
    }
  }
  if (best) return best;
  const q = new URLSearchParams({ origin, destination, currency: "inr", token });
  const data = await fetchJson(
    "https://api.travelpayouts.com/v1/prices/cheap?" + q
  );
  const raw = data && data.data ? data.data : {};
  for (const dest of Object.keys(raw)) {
    for (const key of Object.keys(raw[dest] || {})) {
      const item = raw[dest][key];
      if (!item || typeof item.price !== "number") continue;
      if (!best || item.price < best.price) {
        best = {
          price: item.price,
          departure_at: item.departure_at || null,
          return_at: item.return_at || null,
        };
      }
    }
  }
  return best;
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, "https://www.sjtravel.in");
  const origin = (url.searchParams.get("origin") || "").toUpperCase();
  const destination = (url.searchParams.get("destination") || "").toUpperCase();
  const mode = url.searchParams.get("mode") || "calendar";
  const month = url.searchParams.get("month") || "";

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (!isIata(origin) || !isIata(destination) || origin === destination) {
    res.status(400).json({
      ok: false,
      configured: true,
      error: "origin and destination must be different 3-letter IATA codes",
    });
    return;
  }

  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) {
    // Graceful degradation: no token yet, no fake prices.
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ok: false,
      configured: false,
      origin,
      destination,
      month: month || null,
      message:
        "Live fares are shown on our flight search at flights.sjtravel.in.",
    });
    return;
  }

  try {
    if (mode === "cheap") {
      const key = "cheap:" + origin + "-" + destination;
      const hit = cached(key);
      if (hit) {
        res.setHeader("Cache-Control", "public, s-maxage=21600");
      res.setHeader("CDN-Cache-Control", "public, s-maxage=21600");
        res.status(200).json(hit);
        return;
      }
      const best = await cheapestPrice(origin, destination, token);
      const body = best
        ? {
            ok: true,
            configured: true,
            origin,
            destination,
            currency: "INR",
            price: best.price,
            departure_at: best.departure_at,
            return_at: best.return_at,
            one_way: !best.return_at,
            source: "cached",
          }
        : { ok: false, configured: true, origin, destination, currency: "INR", error: "no_cached_fare" };
      store(key, body);
      res.setHeader("Cache-Control", "public, s-maxage=21600");
      res.setHeader("CDN-Cache-Control", "public, s-maxage=21600");
      res.status(200).json(body);
      return;
    }

    if (!isMonth(month)) {
      res.status(400).json({
        ok: false,
        configured: true,
        error: "month must be YYYY-MM",
      });
      return;
    }
    const key = "cal:" + origin + "-" + destination + "-" + month;
    const hit = cached(key);
    if (hit) {
      res.setHeader("Cache-Control", "public, s-maxage=21600");
      res.setHeader("CDN-Cache-Control", "public, s-maxage=21600");
      res.status(200).json(hit);
      return;
    }
    const days = await calendarPrices(origin, destination, month, token);
    const body = {
      ok: days.length > 0,
      configured: true,
      origin,
      destination,
      month,
      currency: "INR",
      days,
      source: "cached",
      note: "Prices found in the last 48 hours. Final fare is shown live before you pay.",
    };
    store(key, body);
    res.setHeader("Cache-Control", "public, s-maxage=21600");
      res.setHeader("CDN-Cache-Control", "public, s-maxage=21600");
    res.status(200).json(body);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({
      ok: false,
      configured: true,
      origin,
      destination,
      error: "fare_service_unavailable",
    });
  }
};
