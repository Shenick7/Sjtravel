#!/usr/bin/env python3
"""Generate the traffic guides, tools, visa data, sitemap rows and hub links.

Facts in the pages were checked on 17 Nov 2026. Re-run only after the MEA
HTML snapshot at /tmp/mea-visa.html is refreshed, or the committed
data/visa-india.json is left as-is when that snapshot is missing.
"""
from __future__ import annotations

import html
import json
import re
from html import unescape
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
MEA_URL = "https://www.mea.gov.in/VFFIN.htm"
CHECKED = "17 Nov 2026"
CHECKED_ISO = "2026-11-17"

YESIM = "https://yesim.tpo.lu/KeDtVkgT"
KLOOK = "https://klook.tpo.lu/bVJ75JDU"
KKDAY = "https://kkday.tpo.lu/tCKIFN4b"
COMPENSAIR = "https://compensair.tpo.lu/xx7hY7Yo"
MARKER = "600744"


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def inline(text: str) -> str:
    """Escape text, then turn [label](url) into links."""
    out = []
    pos = 0
    for m in re.finditer(r"\[([^\]]+)\]\(([^)\s]+)\)", text):
        out.append(esc(text[pos:m.start()]))
        out.append(f'<a href="{esc(m.group(2))}">{esc(m.group(1))}</a>')
        pos = m.end()
    out.append(esc(text[pos:]))
    return "".join(out)


def wa(msg: str) -> str:
    return "https://wa.me/919566977211?text=" + quote(msg)


def flights(sub: str) -> str:
    return f"https://flights.sjtravel.in/?marker={MARKER}&sub_id={sub}"


def meta_ok(slug: str, meta: str) -> None:
    n = len(meta)
    if not 150 <= n <= 160:
        raise SystemExit(f"meta length {n} for {slug}: {meta}")


def blocks_html(blocks: list[dict]) -> str:
    parts = []
    for b in blocks:
        chunks = ["<section class=\"block\"><div class=\"wrap prose\">"]
        if b.get("h2"):
            chunks.append(f"<div class=\"sec-head\"><h2>{inline(b['h2'])}</h2></div>")
        for para in b.get("p", []):
            chunks.append(f"<p>{inline(para)}</p>")
        if b.get("ul"):
            lis = "".join(f"<li>{inline(item)}</li>" for item in b["ul"])
            chunks.append(f"<ul class=\"page-list\">{lis}</ul>")
        if b.get("table"):
            headers, rows = b["table"]
            th = "".join(f"<th>{esc(h)}</th>" for h in headers)
            body = []
            for row in rows:
                body.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>")
            chunks.append(f"<table class=\"guide-table\"><thead><tr>{th}</tr></thead><tbody>{''.join(body)}</tbody></table>")
        if b.get("html"):
            chunks.append(b["html"])
        chunks.append("</div></section>")
        parts.append("".join(chunks))
    return "\n".join(parts)


def faq_html(faqs: list[tuple[str, str]]) -> str:
    items = []
    for q, a in faqs:
        items.append(f"<details><summary>{esc(q)}</summary><p>{inline(a)}</p></details>")
    return (
        "<section class=\"block\" id=\"faq\"><div class=\"wrap\">"
        "<div class=\"sec-head\"><h2>Questions, answered</h2></div>"
        f"<div class=\"faq\">{''.join(items)}</div></div></section>"
    )


def related_html(links: list[tuple[str, str, str]]) -> str:
    cards = []
    for href, title, blurb in links:
        cards.append(f'<a href="{esc(href)}">{esc(title)}<span>{esc(blurb)}</span></a>')
    return (
        "<section class=\"block\"><div class=\"wrap\">"
        "<div class=\"sec-head\"><h2>Keep going</h2></div>"
        f"<div class=\"related\">{''.join(cards)}</div></div></section>"
    )


def sources_html(sources: list[tuple[str, str]]) -> str:
    lis = "".join(f'<li><a href="{esc(url)}">{esc(title)}</a></li>' for title, url in sources)
    return (
        "<section class=\"block\"><div class=\"wrap prose\">"
        "<div class=\"sec-head\"><h2>Sources</h2></div>"
        f"<p class=\"checked\">Last checked {CHECKED}. If this page and an official site disagree, follow the official site.</p>"
        f"<ul class=\"sources\">{lis}</ul></div></section>"
    )


def aff_html(sub: str, kinds: list[str]) -> str:
    if not kinds:
        return ""
    links = []
    notes = []
    if "flights" in kinds:
        links.append(
            f'<a class="btn btn-accent" data-track="affiliate_click" data-subid="{esc(sub)}_flight" rel="sponsored noopener" target="_blank" href="{esc(flights(sub + "_flight"))}">Search flights</a>'
        )
        notes.append("Flight search uses our Travelpayouts marker 600744.")
    if "yesim" in kinds:
        links.append(
            f'<a class="btn btn-ghost" data-track="affiliate_click" data-subid="{esc(sub)}_esim" rel="sponsored noopener" target="_blank" href="{YESIM}">Yesim travel eSIM</a>'
        )
        notes.append("Yesim is a travel eSIM.")
    if "klook" in kinds:
        links.append(
            f'<a class="btn btn-ghost" data-track="affiliate_click" data-subid="{esc(sub)}_klook" rel="sponsored noopener" target="_blank" href="{KLOOK}">Klook tours, hotels and trains</a>'
        )
        notes.append("Klook sells tours, activities, hotels and trains.")
    if "kkday" in kinds:
        links.append(
            f'<a class="btn btn-ghost" data-track="affiliate_click" data-subid="{esc(sub)}_kkday" rel="sponsored noopener" target="_blank" href="{KKDAY}">KKday tours and hotels</a>'
        )
        notes.append("KKday sells tours, packages and hotels.")
    if "compensair" in kinds:
        links.append(
            f'<a class="btn btn-ghost" data-track="affiliate_click" data-subid="{esc(sub)}_delay" rel="sponsored noopener" target="_blank" href="{COMPENSAIR}">Compensair flight-delay help</a>'
        )
        notes.append("Compensair helps claim compensation for a flight delay or cancellation. It is not travel insurance, and it does not cover medical bills.")
    blurb = " ".join(notes)
    brands = []
    if "yesim" in kinds:
        brands.append("Yesim")
    if "klook" in kinds:
        brands.append("Klook")
    if "kkday" in kinds:
        brands.append("KKday")
    if "compensair" in kinds:
        brands.append("Compensair")
    tail = ""
    if brands:
        tail += " The " + ", ".join(brands) + f" buttons are the short links from our Travelpayouts project (marker {MARKER})."
    if "flights" in kinds:
        tail += " The flight button uses marker 600744 and a sub_id for this page."
    return (
        "<section class=\"block\"><div class=\"wrap prose\">"
        "<div class=\"sec-head\"><h2>Book the pieces yourself</h2></div>"
        f"<p class=\"aff-note\">Affiliate links: {esc(blurb)} If you buy through a link, SJ Tours may earn a commission. You pay the company you book with. The price is not higher because of the link.{esc(tail)}</p>"
        f"<div class=\"buy-row\">{''.join(links)}</div></div></section>"
    )


def cta_html(page: dict) -> str:
    bits = ["<section class=\"block\"><div class=\"wrap prose\"><div class=\"buy-row\">"]
    if page.get("lead"):
        label, msg = page["lead"]
        bits.append(
            f'<a class="btn btn-wa" data-track="whatsapp_click" href="{esc(wa(msg))}" target="_blank" rel="noopener">{esc(label)}</a>'
        )
    if page.get("kit"):
        name, path, msg = page["kit"]
        bits.append(
            f'<a class="btn btn-wa" data-track="kit_cta_click" data-kit="{esc(name)}" href="{esc(wa(msg))}" target="_blank" rel="noopener">WhatsApp for the {esc(name)} kit — ₹999</a>'
        )
    label, msg = page["wa"]
    bits.append(
        f'<a class="btn btn-ghost" data-track="whatsapp_click" href="{esc(wa(msg))}" target="_blank" rel="noopener">{esc(label)}</a>'
    )
    bits.append("</div></div></section>")
    return "".join(bits)


def json_ld(page: dict) -> str:
    url = f"https://www.sjtravel.in/{page['slug']}"
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.sjtravel.in/"},
            {"@type": "ListItem", "position": 2, "name": "Guides", "item": "https://www.sjtravel.in/guides"},
            {"@type": "ListItem", "position": 3, "name": page["h1"], "item": url},
        ],
    }
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"\[[^\]]+\]\([^)]+\)", lambda m: m.group(0).split("]")[0][1:], a)},
            }
            for q, a in page["faqs"]
        ],
    }
    # FAQ answer text: strip markdown links to the label only, already done above roughly.
    # Fix properly:
    def plain(a: str) -> str:
        return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", a)

    faq["mainEntity"] = [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": plain(a)}}
        for q, a in page["faqs"]
    ]
    article = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": page["h1"],
        "description": page["meta"],
        "dateModified": f"{CHECKED_ISO}T00:00:00+05:30",
        "datePublished": f"{CHECKED_ISO}T00:00:00+05:30",
        "author": {"@type": "Person", "name": "Shenick Jain", "url": "https://www.sjtravel.in/about/shenick-jain"},
        "publisher": {"@type": "Organization", "name": "SJ Tours and Travels", "url": "https://www.sjtravel.in/"},
        "mainEntityOfPage": url,
    }
    return (
        f'<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False)}</script>'
        f'<script type="application/ld+json">{json.dumps(faq, ensure_ascii=False)}</script>'
        f'<script type="application/ld+json">{json.dumps(article, ensure_ascii=False)}</script>'
    )


HEADER = """<header class="site" id="top">
      <div class="wrap masthead">
        <a class="brand" href="/" aria-label="SJ Tours and Travels — Journeys Made Simple — home">
          <span class="bname">SJ Tours and Travels</span>
          <span class="btag">Journeys Made Simple.</span>
          <span class="bsub"><b>sjtravel.in</b></span>
          <span class="bnote">No S at the end — sjtravels.in is a different company</span>
        </a>
      </div>
      <nav class="title-bar" aria-label="Quick links"><a href="/" class="home-link" aria-label="Home"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></a><span class="sep">·</span><a href="/holiday-packages">Holiday Packages</a><span class="sep">·</span><a href="/flights">Flights</a><span class="sep">·</span><a href="/visa-help">Visa Help</a><span class="sep">·</span><a href="/guides">Guides</a><span class="sep">·</span><a href="/#kits">Travel Kits</a><span class="sep">·</span><a href="/about">About</a><span class="sep">·</span><a class="wa-link" data-track="whatsapp_click" href="__PAGEWA__" target="_blank" rel="noopener">WhatsApp</a><button class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="mobileMenu" aria-label="Menu">☰</button></nav>
      <div class="mobile-menu" id="mobileMenu" hidden>
        <a href="/holiday-packages">Holiday Packages</a>
        <a href="/flights">Flights</a>
        <a href="/visa-help">Visa Help</a>
        <a href="/guides">Guides</a>
        <a href="/#kits">Travel Kits</a>
        <a href="/about">About</a>
        <a data-track="whatsapp_click" href="__PAGEWA__" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </header>"""

FOOTER = """<footer class="site">
      <div class="wrap">
        <div>
          <h3>SJ Tours and Travels</h3>
          <p>Travel kits, holiday packages, flight finding, visa help and RTI drafts — from Ambur, for travellers everywhere in India.</p>
          <p><strong>sjtravel.in</strong> — no S at the end. sjtravels.in (with an S) is a different company.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <ul>
            <li><a href="/#kits">Travel Kits — ₹999 each</a></li>
            <li><a href="/#bundles">Bundles — 3 for ₹1,999 · All 6 for ₹3,999</a></li>
            <li><a href="/holiday-packages">Holiday Packages</a></li>
            <li><a href="/flight-finder">Flight Finder — ₹199</a></li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <ul>
            <li><a href="https://wa.me/919566977211" target="_blank" rel="noopener">WhatsApp: +91 95669 77211</a></li>
            <li>WhatsApp replies 10am–8pm</li>
            <li><a href="mailto:hello@sjtravel.in">Email: hello@sjtravel.in</a></li>
            <li>Ambur, Tirupattur District, Tamil Nadu, India</li>
          </ul>
        </div>
        <div>
          <h3>Policies</h3>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/cancellation">Cancellation &amp; Refunds</a></li>
          </ul>
        </div>
        <p class="foot-note">Kit prices are one-time, per kit or bundle, in INR. Kit budgets are planning estimates for land costs and exclude flights unless stated. Airfares are live and subject to change until ticketed.</p>
      </div>
    </footer>"""


def render(page: dict) -> str:
    meta_ok(page["slug"], page["meta"])
    url = f"https://www.sjtravel.in/{page['slug']}"
    wa_msg = page["wa"][1]
    float_href = wa(wa_msg)
    header = HEADER.replace("__PAGEWA__", esc(float_href))
    tool = page.get("tool_html", "")
    body = "\n".join([
        "<main>",
        "<section class=\"block\"><div class=\"wrap\">",
        "<nav class=\"crumbs\" aria-label=\"Breadcrumb\"><a href=\"/\">Home</a> <span aria-hidden=\"true\">/</span> <a href=\"/guides\">Guides</a> <span aria-hidden=\"true\">/</span> <span aria-current=\"page\">" + esc(page["h1"]) + "</span></nav>",
        "<div class=\"page-head\">",
        f"<p class=\"kicker\">{esc(page['kicker'])}</p>",
        f"<h1>{esc(page['h1'])}</h1>",
        f"<p class=\"lede\">{inline(page['lede'])}</p>",
        "</div></div></section>",
        blocks_html(page.get("blocks", [])),
        tool,
        cta_html(page),
        aff_html(page.get("aff_sub", page["slug"].replace("-", "_")), page.get("aff", [])),
        faq_html(page["faqs"]),
        related_html(page["related"]),
        sources_html(page["sources"]),
        "</main>",
    ])
    return f"""<!doctype html>
<html lang="en">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-YPM6XLXTVQ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-YPM6XLXTVQ');
    </script>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light" />
    <title>{esc(page['title'])}</title>
    <meta name="description" content="{esc(page['meta'])}" />
    <link rel="canonical" href="{url}" />
    <meta property="og:title" content="{esc(page['title'])}" />
    <meta property="og:description" content="{esc(page['meta'])}" />
    <meta property="og:url" content="{url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="SJ Tours and Travels" />
    <meta property="og:image" content="https://www.sjtravel.in/assets/IMG_1542.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="{esc(page['title'])}" />
    <meta name="twitter:description" content="{esc(page['meta'])}" />
    {json_ld(page)}
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23034694'/%3E%3Ctext x='32' y='44' font-family='Georgia, serif' font-size='30' fill='%23ffffff' text-anchor='middle'%3ESJ%3C/text%3E%3C/svg%3E" />
    <link rel="manifest" href="/assets/manifest.webmanifest" />
    <meta name="theme-color" content="#034694" />
    <link rel="apple-touch-icon" href="/assets/IMG_1541.png" />
    <link rel="stylesheet" href="/assets/guide.css" />
    <script>
    (function(c,l,a,r,i,t,y){{c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);}})(window, document, "clarity", "script", "zee487ap4w");
    </script>
  </head>
  <body>
    {header}
    {body}
    {FOOTER}
    <a class="wa-float" data-track="whatsapp_click" href="{esc(float_href)}" target="_blank" rel="noopener" aria-label="WhatsApp SJ Tours"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg><span>WhatsApp Us</span></a>
    <script src="/assets/site.js?v=20261117-1"></script>
    {page.get("extra_js", "")}
  </body>
</html>
"""


def build_visa_json() -> dict:
    snapshot = Path("/tmp/mea-visa.html")
    if not snapshot.exists():
        existing = ROOT / "data" / "visa-india.json"
        if existing.exists():
            return json.loads(existing.read_text())
        raise SystemExit("MEA snapshot missing and data/visa-india.json missing")
    raw = snapshot.read_text(errors="replace")
    tables = re.findall(r"<table[\s\S]*?</table>", raw, flags=re.I)

    def cells(tr: str) -> list[str]:
        out = []
        for td in re.findall(r"<t[dh][\s\S]*?</t[dh]>", tr, flags=re.I):
            t = re.sub(r"<[^>]+>", " ", td)
            out.append(unescape(re.sub(r"\s+", " ", t)).strip())
        return out

    parsed = []
    for table in tables:
        cap_m = re.search(r"<caption[\s\S]*?</caption>", table, flags=re.I)
        cap = unescape(re.sub(r"<[^>]+>", " ", cap_m.group(0))) if cap_m else ""
        cap = re.sub(r"\s+", " ", cap).strip()
        rows = []
        for tr in re.findall(r"<tr[\s\S]*?</tr>", table, flags=re.I):
            cs = cells(tr)
            if cs and cs[0].isdigit():
                rows.append(cs)
        parsed.append((cap, rows))

    countries = []
    corrections = []
    mea_source = {"title": "Ministry of External Affairs — visa facility for Indian nationals (ordinary passport)", "url": MEA_URL}

    for cap, rows in parsed:
        if "Visa free" in cap:
            kind = "visa-free"
        elif "Visa on Arrival" in cap:
            kind = "visa-on-arrival"
        else:
            continue
        for row in rows:
            name = row[1]
            if kind == "visa-free":
                stay, notes = row[2], row[3] if len(row) > 3 else ""
            else:
                stay, notes = "", row[2] if len(row) > 2 else ""
            if name.lower() == "thailand" and kind == "visa-on-arrival":
                corrections.append({
                    "country": "Thailand",
                    "dropped": "visa-on-arrival",
                    "why": "MEA's visa-on-arrival table lists Thailand with an empty remarks cell. The Royal Thai Embassy in New Delhi says that from 15 September 2026 visa on arrival is not the rule for Indian ordinary passports; the 30-day tourist exemption is. The row is left out of the finder so it is not offered as a way in."
                })
                continue
            entry = {
                "name": name,
                "kind": kind,
                "stay": stay,
                "notes": notes,
                "sources": [mea_source],
            }
            if name.lower() == "thailand" and kind == "visa-free":
                entry["stay"] = "30 days"
                entry["notes"] = (
                    "Tourism only, for an ordinary Indian passport, from 15 September 2026. "
                    "Register on the Thailand Digital Arrival Card (https://tdac.immigration.go.th), preferably 3 days before arrival. "
                    "The published exemption scheme also says travellers should carry the equivalent of 20,000 baht per person or 40,000 baht per family. "
                    "India's MEA page still showed 60 days for tourism and short business when we read it on 17 Nov 2026. The Thai government's later announcement is the one to follow. "
                    "Visa on arrival is not the Indian-passport rule under that announcement."
                )
                entry["sources"] = [
                    {"title": "Royal Thai Embassy, New Delhi — exemption revised from 15 September 2026", "url": "https://newdelhi.thaiembassy.org/en/content/the-revision-of-thailand-s-visa-exemption-and-voa?cate=614489aad04d1e09fa498c92&menu=614493e28d99e8319f20bc93"},
                    {"title": "Thailand Government PRD — Royal Gazette publication of the revision", "url": "https://thailand.prd.go.th/en/content/category/detail/id/48/iid/538547"},
                    {"title": "Royal Thai Embassy, Doha — 30-day list, including India, and the cash condition", "url": "https://doha.thaiembassy.org/en/publicservice/tourist-visa-exemption-visa-on-arrival"},
                    mea_source,
                ]
                corrections.append({
                    "country": "Thailand",
                    "change": "MEA visa-free stay of 60 days replaced with 30 days tourism, from the Thai revision effective 15 September 2026."
                })
            if name.lower() == "malaysia" and kind == "visa-free":
                entry["notes"] = (
                    (notes + " " if notes else "")
                    + "Malaysia's Ministry of Foreign Affairs in New Delhi says the waiver runs until 31 December 2026, for up to 30 days, for business, tourism, social visits or transit — not for taking a job. "
                    + "They ask for a passport valid at least six months, a confirmed return ticket, a confirmed hotel booking, and the Malaysia Digital Arrival Card submitted online within three days before arrival at https://imigresen-online.imi.gov.my/mdac/main. "
                    + "Immigration's own country list marks India as visa-exempt until 31 December 2026."
                )
                entry["sources"] = [
                    mea_source,
                    {"title": "Ministry of Foreign Affairs, Malaysia (New Delhi) — Indian passport holders", "url": "https://www.kln.gov.my/web/ind_new-delhi/requirement_foreigner"},
                    {"title": "Immigration Department of Malaysia — visa requirement by country", "url": "https://www.imi.gov.my/index.php/en/main-services/visa/visa-requirement-by-country/"},
                ]
            countries.append(entry)

    countries.sort(key=lambda c: (c["kind"], c["name"].lower()))
    return {
        "checked": CHECKED_ISO,
        "audience": "Indian ordinary passport",
        "mea": MEA_URL,
        "note": "Rows are copied from the Ministry of External Affairs visa-free and visa-on-arrival tables, then corrected where a destination government page checked the same day said something newer. The MEA e-visa table is not included. Empty cells are left empty.",
        "corrections": corrections,
        "countries": countries,
    }


# Page bodies live in pages_data.py so this file stays the builder.
def load_pages():
    ns: dict = {}
    for name in ("pages_data.py", "pages_more.py"):
        code = (ROOT / "scripts" / name).read_text(encoding="utf-8")
        exec(compile(code, name, "exec"), ns)
    return ns["PAGES"]


def upi_box(product: str, amount: int, page: str, dynamic: bool = False) -> str:
    shot = wa(f"Hi, I paid by UPI for the {product} (₹{amount}, from {page}). Sending the payment screenshot.")
    # Indian grouping without relying on locale in the static fallback message:
    shown = f"{amount:,}".replace(",", ",")
    # format en-IN style simply for 199, 999, 1999, 3999
    pretty = {199: "199", 999: "999", 1999: "1,999", 3999: "3,999"}.get(amount, str(amount))
    href = (
        "upi://pay?pa=9566977211%40upi&pn=SJ%20Tours%20and%20Travels&am="
        + f"{amount}.00&cu=INR&tn=" + quote(product)
    )
    dyn = ' data-dynamic="1" hidden' if dynamic else ""
    return f"""<div class="upi-box"{dyn} data-product="{esc(product)}" data-amount="{amount}" data-page="{esc(page)}">
      <p class="upi-kicker">Pay by UPI</p>
      <p><b data-upi-amt>₹{pretty}</b> to <span data-upi-name>SJ Tours and Travels</span> · <span data-upi-id>9566977211@upi</span></p>
      <p>Payment note: <b data-upi-note>{esc(product)}</b></p>
      <div class="upi-actions">
        <a class="btn btn-accent" data-upi-link data-track="kit_cta_click" data-kit="{esc(product)}" href="{esc(href)}">Pay ₹{pretty} by UPI</a>
        <a class="btn btn-wa" data-upi-shot data-track="whatsapp_click" data-kit="{esc(product)}" target="_blank" rel="noopener" href="{esc(shot)}">I've paid — send the screenshot on WhatsApp</a>
      </div>
      <div class="upi-qr" data-upi-qr></div>
      <p>Scan the QR or tap Pay by UPI. Then send the payment screenshot on WhatsApp so we can match it to this product and send what you bought.</p>
    </div>"""


def page_url_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return "/"
    if rel.startswith("read/") and rel.endswith(".html"):
        return "/" + rel[:-5]
    return "/" + path.stem


def patch_whatsapp_and_upi() -> None:
    kit_files = list(ROOT.glob("*.html")) + list((ROOT / "read").glob("*.html"))
    shop = {
        "dubai-travel-kit.html", "thailand-travel-kit.html", "singapore-travel-kit.html",
        "malaysia-travel-kit.html", "sri-lanka-travel-kit.html", "vietnam-travel-kit.html",
        "index.html", "flight-finder.html",
    }
    pay_tag = '<script src="assets/payment-config.js" defer></script>\n    <script src="assets/qrcode.js" defer></script>\n    <script src="assets/pay.js" defer></script>\n    '
    for path in kit_files:
        text = path.read_text(encoding="utf-8")
        original = text
        url = page_url_for(path)

        def repl_kit(m: re.Match) -> str:
            kit = m.group(1)
            msg = quote("Hi, I want the " + kit + " kit (from " + url + ")")
            return 'data-kit="' + kit + '"' + m.group(2) + 'href="https://wa.me/919566977211?text=' + msg + '"'

        text = re.sub(
            r'data-kit="([^"]+)"([^>]*?)href="https://wa\.me/919566977211\?text=[^"]*"',
            repl_kit,
            text,
        )
        text = text.replace(
            "https://wa.me/919566977211?text=Hi%20SJ%20Tours%2C%20I%20want%20Flight%20Finder%20(%E2%82%B9199).",
            "https://wa.me/919566977211?text=" + quote(f"Hi, I want Flight Finder (from {url})"),
        )
        if path.name in shop and "upi-box" not in text:
            # Kit buy buttons
            def add_upi(m: re.Match) -> str:
                kit = m.group(1)
                product = f"{kit} Travel Kit"
                return m.group(0) + upi_box(product, 999, url)
            text = re.sub(
                r'<a data-track="kit_buy_click" data-kit="([^"]+)"[\s\S]*?</a>',
                add_upi,
                text,
                count=20,
            )
            if "Find my flights" in text and "Flight Finder" not in text[text.find("Find my flights")-200:text.find("Find my flights")]:
                pass
            text = text.replace(
                ">Find my flights</a>",
                '>Find my flights</a>' + upi_box("Flight Finder", 199, url if path.name == "flight-finder.html" else "/flight-finder"),
                1,
            )
            if path.name == "index.html" and 'id="bundleUpi"' not in text:
                box = upi_box("Travel kits", 999, "/#bundles", dynamic=True).replace(
                    'class="upi-box"', 'class="upi-box" id="bundleUpi"', 1
                )
                text = text.replace(
                    'id="bundleOrder"',
                    'id="bundleOrder"',
                    1,
                )
                text = text.replace(
                    ">Order on WhatsApp</a>",
                    ">Order on WhatsApp</a>" + box,
                    1,
                )
            if "payment-config.js" not in text and "upi-box" in text:
                text = text.replace(
                    '<script src="assets/site.js',
                    pay_tag + '<script src="assets/site.js',
                    1,
                )
        if text != original:
            path.write_text(text, encoding="utf-8")
            print("patched", path.relative_to(ROOT))


def patch_bundle_script() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    old = '''          orderBtn.removeAttribute("aria-disabled");
          var msg = "Hi SJ Tours, I want to order these travel kits: " + chosen.join(", ") +
                    " (" + n + (n === 1 ? " kit" : " kits") + " — ₹" + price.toLocaleString("en-IN") + ").";
          orderBtn.href = WA + encodeURIComponent(msg);
        }'''
    new = '''          orderBtn.removeAttribute("aria-disabled");
          var msg = "Hi, I want the " + chosen.join(", ") + " kit" + (n === 1 ? "" : "s") + " (from /#bundles)";
          orderBtn.href = WA + encodeURIComponent(msg);
          var upi = document.getElementById("bundleUpi");
          if (upi) {
            var note = chosen.join(", ") + (n === 1 ? " Travel Kit" : " travel kits");
            upi.setAttribute("data-product", note);
            upi.setAttribute("data-amount", String(price));
            upi.setAttribute("data-page", "/#bundles");
            if (window.SJPay) window.SJPay.fill(upi);
          }
        }'''
    if old not in text:
        raise SystemExit("bundle script anchor not found")
    text = text.replace(old, new, 1)
    old0 = '''          if (n === 0) {
            displayedPrice = 0;
            totalEl.textContent = "Select at least 1 kit to see your price";
            orderBtn.setAttribute("aria-disabled", "true");
            orderBtn.href = WA + encodeURIComponent("Hi SJ Tours, I want to order travel kits.");
            return;
          }'''
    new0 = '''          if (n === 0) {
            displayedPrice = 0;
            totalEl.textContent = "Select at least 1 kit to see your price";
            orderBtn.setAttribute("aria-disabled", "true");
            orderBtn.href = WA + encodeURIComponent("Hi, I want travel kits (from /#bundles)");
            var upi0 = document.getElementById("bundleUpi");
            if (upi0) upi0.hidden = true;
            return;
          }'''
    if old0 not in text:
        raise SystemExit("bundle empty state not found")
    text = text.replace(old0, new0, 1)
    text = text.replace("assets/site.js?v=20261116-1", "assets/site.js?v=20261117-1")
    path.write_text(text, encoding="utf-8")
    flights = ROOT / "flights.html"
    ft = flights.read_text(encoding="utf-8").replace("assets/site.js?v=20261116-1", "assets/site.js?v=20261117-1")
    flights.write_text(ft, encoding="utf-8")


def update_guides(pages: list[dict]) -> None:
    path = ROOT / "guides.html"
    text = path.read_text(encoding="utf-8")
    cards = []
    for p in pages:
        if p.get("hub") == "tool":
            continue
        cards.append(f'<a href="/{p["slug"]}">{esc(p["hub_title"])}<span>{esc(p["hub_blurb"])}</span></a>')
    tools = []
    for p in pages:
        if p.get("hub") == "tool":
            tools.append(f'<a href="/{p["slug"]}">{esc(p["hub_title"])}<span>{esc(p["hub_blurb"])}</span></a>')
    needle = '<div class="related">\n            <a href="/jain-food-dubai">'
    insert = '<div class="related">\n            ' + "\n            ".join(cards) + '\n            <a href="/jain-food-dubai">'
    if needle not in text:
        raise SystemExit("guides list anchor missing")
    if pages[0]["slug"] not in text:
        text = text.replace(needle, insert, 1)
    tool_block = (
        '<section class="block"><div class="wrap"><div class="sec-head"><h2>Free tools</h2></div>'
        '<p>These run in your browser. Nothing is sent to a server.</p>'
        f'<div class="related">{"".join(tools)}</div></div></section>'
    )
    faq_anchor = '<section class="block">\n        <div class="wrap">\n          <div class="sec-head">\n            <h2>Questions, answered</h2>'
    if "Free tools" not in text:
        if faq_anchor not in text:
            raise SystemExit("guides faq anchor missing")
        text = text.replace(faq_anchor, tool_block + "\n      " + faq_anchor, 1)
    text = text.replace(
        "Free guides from our kits — the parts travellers ask us about most. Each guide ends with the full kit for that trip (₹999) if you want the complete plan.",
        "Free guides for Indian families — Tirumala and Tirupati, IRCTC Tatkal and waitlists, Jain food abroad, visa rules, and budgets in rupees. The country kits (₹999) are linked where a kit exists.",
    )
    path.write_text(text, encoding="utf-8")


def update_sitemap(slugs: list[str], edited: list[str]) -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text(encoding="utf-8")
    for loc in edited:
        text = re.sub(
            rf"(<loc>{re.escape(loc)}</loc>\s*<lastmod>)[^<]+(</lastmod>)",
            rf"\g<1>{CHECKED_ISO}\g<2>",
            text,
            count=1,
        )
    block = []
    for slug in slugs:
        loc = f"https://www.sjtravel.in/{slug}"
        if loc in text:
            continue
        block.append(
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{CHECKED_ISO}</lastmod>\n"
            "    <changefreq>weekly</changefreq>\n"
            "    <priority>0.7</priority>\n"
            "  </url>\n"
        )
    if block:
        text = text.replace("</urlset>", "".join(block) + "</urlset>")
    path.write_text(text, encoding="utf-8")


def update_vercel(slugs: list[str]) -> None:
    path = ROOT / "vercel.json"
    data = json.loads(path.read_text())
    have = {r["source"] for r in data["rewrites"]}
    for slug in slugs:
        src = "/" + slug
        if src in have:
            continue
        data["rewrites"].append({"destination": f"/{slug}.html", "source": src})
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def write_llms(pages: list[dict]) -> None:
    lines = [
        "# SJ Tours and Travels",
        "",
        "> Travel kits, flight finding and plain-language guides for Indian families, from Ambur, Tamil Nadu. Orders and payment are handled on WhatsApp at +91 95669 77211. Shenick Jain runs the company.",
        "",
        "The public site is https://www.sjtravel.in/. Prices on the site: travel kits ₹999 each, any 3 for ₹1,999, all 6 for ₹3,999, Flight Finder ₹199. Kit budgets are the company's own planning bands for land costs and exclude flights unless a page says otherwise.",
        "",
        "## Guides",
    ]
    for p in pages:
        kind = "Tool" if p.get("hub") == "tool" else "Guide"
        lines.append(f"- [{p['h1']}](https://www.sjtravel.in/{p['slug']}): {p['hub_blurb']}")
    lines += [
        "",
        "## Shop",
        "- [Home](https://www.sjtravel.in/): kits, bundles, Flight Finder, visa help.",
        "- [Guides](https://www.sjtravel.in/guides): the hub for the pages above.",
        "- [Flights](https://www.sjtravel.in/flights): flight search. Links carry Travelpayouts marker 600744.",
        "",
        "## Notes for assistants",
        "- Do not invent prices, visa rules or train times. The guide pages cite the source and the date they were checked.",
        "- WhatsApp is the order desk. UPI pay buttons, where shown, use the ID in assets/payment-config.js.",
        "- Affiliate buttons for Yesim, Klook, KKday and Compensair are Travelpayouts short links. Compensair is flight-delay compensation, not travel insurance.",
        "",
    ]
    (ROOT / "llms.txt").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    visa = build_visa_json()
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "visa-india.json").write_text(json.dumps(visa, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"visa rows {len(visa['countries'])} corrections {len(visa['corrections'])}")
    pages = load_pages()
    for page in pages:
        html_out = render(page)
        dest = ROOT / f"{page['slug']}.html"
        dest.write_text(html_out, encoding="utf-8")
        print("wrote", dest.name, "bytes", dest.stat().st_size)
    patch_whatsapp_and_upi()
    patch_bundle_script()
    update_guides(pages)
    slugs = [p["slug"] for p in pages]
    edited = [
        "https://www.sjtravel.in/",
        "https://www.sjtravel.in/guides",
        "https://www.sjtravel.in/flights",
        "https://www.sjtravel.in/flight-finder",
        "https://www.sjtravel.in/dubai-travel-kit",
        "https://www.sjtravel.in/thailand-travel-kit",
        "https://www.sjtravel.in/singapore-travel-kit",
        "https://www.sjtravel.in/malaysia-travel-kit",
        "https://www.sjtravel.in/sri-lanka-travel-kit",
        "https://www.sjtravel.in/vietnam-travel-kit",
        "https://www.sjtravel.in/jain-food-dubai",
        "https://www.sjtravel.in/thailand-30-day-visa-free",
        "https://www.sjtravel.in/cheapest-months-chennai-dubai",
        "https://www.sjtravel.in/singapore-5-days-family",
        "https://www.sjtravel.in/sri-lanka-entry-steps",
        "https://www.sjtravel.in/read/best-time-to-visit-thailand-family",
        "https://www.sjtravel.in/read/dubai-visa-for-indians-documents-cost",
    ]
    update_sitemap(slugs, edited)
    update_vercel(slugs)
    write_llms(pages)
    link_home()


def link_home() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    needle = '<p style="margin-top:24px"><a href="/read">Read all articles →</a></p>'
    extra = (
        needle
        + '\n          <p style="margin-top:12px">Free guides: '
        + '<a href="/tirumala-darshan-booking">Tirumala darshan tickets</a>, '
        + '<a href="/tirupati-from-chennai-bengaluru-vellore">Tirupati by train and road</a>, '
        + '<a href="/irctc-tatkal-booking">Tatkal timings</a>, '
        + '<a href="/irctc-waitlist-confirmation">waitlist codes</a>, '
        + '<a href="/jain-food-bangkok">Jain food abroad</a>, '
        + '<a href="/visa-free-finder">visa-free finder</a>, '
        + '<a href="/family-trip-budget">family budget calculator</a>. '
        + '<a href="/guides">All guides</a>.</p>'
    )
    if needle in text and "/tirumala-darshan-booking" not in text:
        path.write_text(text.replace(needle, extra, 1), encoding="utf-8")


if __name__ == "__main__":
    main()
