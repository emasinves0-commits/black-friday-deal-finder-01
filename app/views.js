// views.js — one job: turn deal data into HTML. No fetching, no state, no
// routing here; main.js owns state and hands this file the deals to show.
// Prices are formatted from the numbers in data.js, and the discount is
// always computed from price/was so the % on screen matches the two prices.

import { CHECKED_LABEL } from "./data.js";

export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

export function discountPct(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function dealScore(d) {
  return Math.min(99, discountPct(d) + (d.lowestEver ? 10 : 0));
}

export function verdictOf(d) {
  if (d.lowestEver) return { label: "LOWEST EVER", cls: "lowest" };
  const p = discountPct(d);
  if (p >= 50) return { label: "DEEP CUT", cls: "deep" };
  if (p >= 40) return { label: "STRONG DROP", cls: "strong" };
  if (p >= 30) return { label: "SOLID DEAL", cls: "solid" };
  return { label: "TYPICAL SALE", cls: "typical" };
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function compareLine(d) {
  if (!d.also || d.also.length === 0) return "";
  const parts = d.also.map((a) => {
    const cheaper = a.price < d.price;
    const same = a.price === d.price;
    const mark = cheaper ? "cheapest" : same ? "same price" : "";
    return `${esc(a.store)} ${money(a.price)}${mark ? ` <b>(${mark})</b>` : ""}`;
  });
  return `<p class="compare">Also: ${parts.join(" · ")}</p>`;
}

export function cardHTML(d) {
  const v = verdictOf(d);
  const pct = discountPct(d);
  const per = d.per ? `<span class="per">/${esc(d.per)}</span>` : "";
  const cond = d.condition ? ` · ${esc(d.condition)}` : "";
  return `<article class="card">
  <h2><a href="#/deal/${esc(d.id)}">${esc(d.title)}</a></h2>
  <div class="store-row"><span class="store-badge">${esc(d.store)}</span><span class="category">${esc(d.category)}</span></div>
  <div class="price-row">
    <span class="price">${money(d.price)}${per}</span>
    <span class="was">${money(d.was)}${per}</span>
    <span class="off">−${pct}%</span>
  </div>
  <div class="saving">You save ${money(d.was - d.price)}${d.per ? `/${esc(d.per)}` : ""}${cond}</div>
  <div class="score-row">
    <span class="score">Deal Score ${dealScore(d)}</span>
    <span class="verdict ${v.cls}">${v.label}</span>
  </div>
  ${compareLine(d)}
  <p class="checked">Checked ${CHECKED_LABEL} · Source: ${esc(d.source)}</p>
  <a class="store-link" href="${esc(d.url)}" target="_blank" rel="noopener">View at ${esc(d.store)} ↗</a>
</article>`;
}

export function detailHTML(d, all) {
  const v = verdictOf(d);
  const pct = discountPct(d);
  const per = d.per ? `<span class="per">/${esc(d.per)}</span>` : "";
  const rows = [{ store: d.store, price: d.price, main: true }]
    .concat((d.also || []).map((a) => ({ store: a.store, price: a.price, main: false })))
    .sort((a, b) => a.price - b.price);
  const cheapest = rows[0].price;
  const table = rows
    .map(
      (r) =>
        `<tr><td>${esc(r.store)}${r.main ? " (this listing)" : ""}</td><td>${money(r.price)}${per}</td><td>${r.price === cheapest ? '<span class="cheapest">Cheapest</span>' : ""}</td></tr>`,
    )
    .join("");
  const cond = d.condition ? `<p><strong>Condition:</strong> ${esc(d.condition)}.</p>` : "";
  return `<p class="back"><a href="#/">← Back to all deals</a></p>
  <h2>${esc(d.title)}</h2>
  <div class="store-row"><span class="store-badge">${esc(d.store)}</span><span class="category">${esc(d.category)}</span></div>
  <div class="price-row">
    <span class="price">${money(d.price)}${per}</span>
    <span class="was">${money(d.was)}${per}</span>
    <span class="off">−${pct}%</span>
  </div>
  <div class="saving">You save ${money(d.was - d.price)}${d.per ? `/${esc(d.per)}` : ""}</div>
  <p class="note">${esc(d.note)}</p>
  ${cond}
  <div class="score-box">
    <h3>Deal Score ${dealScore(d)} — ${v.label}</h3>
    <p>Score = ${pct}% discount${d.lowestEver ? " + 10 because a source calls this a lowest-ever price" : ""}, capped at 99.
    ${v.label === "LOWEST EVER" ? "A source names this the lowest price it has seen." : v.label === "DEEP CUT" ? "At least half off the usual price." : v.label === "STRONG DROP" ? "A steep cut, just short of half price." : v.label === "SOLID DEAL" ? "A real cut, not a routine sale." : "A small cut — check the saving in dollars before you buy."}</p>
  </div>
  <h3>Same product, other stores</h3>
  <table class="store-table">
    <tr><th>Store</th><th>Price</th><th></th></tr>
    ${table}
  </table>
  <p class="checked">Checked ${CHECKED_LABEL} · Source: ${esc(d.source)} · “Was” price is the retailer’s previous price as shown by the source.</p>
  <a class="store-link" href="${esc(d.url)}" target="_blank" rel="noopener">View at ${esc(d.store)} ↗</a>`;
}

export function statsLine(all) {
  const saving = all.reduce((s, d) => s + (d.was - d.price), 0);
  const stores = new Set(all.map((d) => d.store)).size;
  const cats = new Set(all.map((d) => d.category)).size;
  return `${all.length} deals · ${stores} stores · ${cats} categories · ${money(Math.round(saving))} total savings`;
}
