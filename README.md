# sjtravel — SJ Tours and Travels

Website for **SJ Tours and Travels, Ambur, Tamil Nadu, India** — live at
https://www.sjtravel.in/

Holiday packages, flights, visa help and travel kits (launch price ₹999 each) for Indian
travellers. Enquiries come in through the Plan My Trip forms on the site,
which hand off to WhatsApp.

- Website: https://www.sjtravel.in/
- WhatsApp / phone: +91 95669 77211
- Email: jainshenick@gmail.com
- Hours: Monday to Saturday, 10:00 AM to 8:00 PM IST. Closed Sunday.

## Files

- `index.html` — the whole site (single page)
- `sitemap.xml` — sitemap for search engines (12 URLs)
- `robots.txt` — allows all crawlers, points to the sitemap
- `content-calendar.md` — 12-week content calendar (WhatsApp / Instagram posts)
- `90-day-roadmap.md` — 90-day action plan, with what is already DONE

## Deployment

Deployed to Vercel (project `sjtravel`), connected to this repo on GitHub
(`Shenick7/Sjtravel`, branch `main`, root `./`). Every push to `main`
deploys automatically and rollbacks are one click in Vercel.

## Analytics

Vercel Web Analytics + Speed Insights scripts are in `index.html` (head).
They only collect data once Web Analytics / Speed Insights are enabled for
the `sjtravel` project in the Vercel dashboard (Analytics tab → Enable).
Click tracking for WhatsApp / call / email links and Plan My Trip form
submissions is wired to `window.va` events — no personal data is sent, and
custom events need a Vercel Pro plan; page views work on the free plan.
