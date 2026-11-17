#!/usr/bin/env node
/**
 * Tell Bing and the other IndexNow engines about URLs on www.sjtravel.in.
 *
 * The key file is already on the site:
 *   https://www.sjtravel.in/62fc66797298dcaccbce818862a65144.txt
 *
 * Run this AFTER a deploy, when the new pages are live. Pinging before
 * they are published just asks Bing to fetch URLs that still 404.
 *
 *   node scripts/ping-indexnow.mjs
 *   node scripts/ping-indexnow.mjs https://www.sjtravel.in/tirumala-darshan-booking
 *
 * With no arguments, every <loc> in sitemap.xml is sent.
 * IndexNow's api.indexnow.org endpoint shares the list with Bing.
 * Docs: https://www.indexnow.org/documentation
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const HOST = "www.sjtravel.in";
const KEY = "62fc66797298dcaccbce818862a65144";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

function urlsFromSitemap() {
  const xml = readFileSync(resolve(process.cwd(), "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((m) => m[1].trim());
}

const urls = process.argv.slice(2).filter((a) => a.startsWith("http"));
const list = urls.length ? urls : urlsFromSitemap();
if (!list.length) {
  console.error("No URLs to submit.");
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: list
};

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body)
});
const text = await res.text();
console.log(`IndexNow ${res.status} ${res.statusText} — ${list.length} URL(s)`);
if (text) console.log(text.slice(0, 500));
if (res.status !== 200 && res.status !== 202) process.exit(1);
