// GET /api/airports?term=lond
//   -> worldwide city/airport suggestions from Travelpayouts' public
//      Autocomplete API (places2). No token needed — this endpoint is
//      public and needs no secret. The frontend calls it while the
//      visitor types, so the search box covers every airport in the
//      world (~10k airports / ~9.6k cities) instead of a short
//      hardcoded list. The local popular-airports list in the page is
//      only the fallback shown on focus and when this API fails.
//
// Results are normalised to {code, name, city, country, type}.
// A city result (e.g. LON London) and its airports (LHR, LGW) are
// both returned; the White Label search accepts city codes too.
// If the upstream fails, we answer {ok:false, results:[]} and the
// frontend falls back to its local list — no results are invented.

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours per term
const cache = new Map(); // term -> { at, body }

function cached(term) {
  const hit = cache.get(term);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.body;
  cache.delete(term);
  return null;
}
function store(term, body) {
  cache.set(term, { at: Date.now(), body });
  if (cache.size > 500) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, "https://www.sjtravel.in");
  const term = (url.searchParams.get("term") || "").trim();

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (term.length < 2 || term.length > 60) {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ok: false, results: [], error: "term_too_short" });
    return;
  }

  const key = term.toLowerCase();
  const hit = cached(key);
  if (hit) {
    res.setHeader("Cache-Control", "public, s-maxage=86400");
    res.status(200).json(hit);
    return;
  }

  try {
    const q = new URLSearchParams({
      term,
      locale: "en",
    });
    q.append("types[]", "airport");
    q.append("types[]", "city");
    const upstream = await fetch(
      "https://autocomplete.travelpayouts.com/places2?" + q,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) }
    );
    if (!upstream.ok) throw new Error("upstream " + upstream.status);
    const data = await upstream.json();
    const results = [];
    const seen = new Set();
    for (const item of Array.isArray(data) ? data : []) {
      if (!item || typeof item.code !== "string") continue;
      const code = item.code.toUpperCase();
      if (!/^[A-Z]{3}$/.test(code) || seen.has(code)) continue;
      seen.add(code);
      const isAirport = item.type === "airport";
      results.push({
        code,
        // Airport: its own name; city: the city name.
        name: item.name || item.city_name || code,
        city: item.city_name || item.name || "",
        country: item.country_name || "",
        type: isAirport ? "airport" : "city",
      });
      if (results.length >= 20) break;
    }
    const body = { ok: true, results };
    store(key, body);
    res.setHeader("Cache-Control", "public, s-maxage=86400");
    res.status(200).json(body);
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ok: false, results: [], error: "autocomplete_unavailable" });
  }
};
