// main.js — one job: the deal finder's behaviour. It owns the state (search
// text, category, store, discount band, sort, hash route), filters and sorts
// the deals from data.js, and asks views.js to render. No network: every
// deal it shows lives in data.js, and every link out is a plain <a href>.

import { deals, CATEGORIES, STORES, DISCOUNT_BANDS, SORTS, CHECKED_LABEL } from "./data.js";
import { cardHTML, detailHTML, statsLine, discountPct, dealScore } from "./views.js";

const state = {
  q: "",
  category: "All",
  store: "All",
  discount: "any",
  sort: "score",
};

const $ = (id) => document.getElementById(id);
const grid = $("grid");
const detail = $("detail");
const empty = $("empty");
const resultLine = $("result-line");

function filtered() {
  const q = state.q.trim().toLowerCase();
  let list = deals.filter((d) => {
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (state.discount !== "any" && discountPct(d) < Number(state.discount)) return false;
    if (q && !(d.title + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    score: (a, b) => dealScore(b) - dealScore(a) || discountPct(b) - discountPct(a),
    discount: (a, b) => discountPct(b) - discountPct(a) || dealScore(b) - dealScore(a),
    saving: (a, b) => b.was - b.price - (a.was - a.price),
    price: (a, b) => a.price - b.price,
  }[state.sort];
  return list.sort(by);
}

function applyHashParams() {
  // Shareable filtered views: #/?discount=50&sort=saving&store=Amazon sets the
  // initial state (and the controls) from the hash, so a filtered view is a
  // real URL, not a screenshot trick. Unknown values are ignored by the
  // controls' own value lists.
  const m = location.hash.match(/^#\/\?(.*)$/);
  if (!m) return;
  const p = new URLSearchParams(m[1]);
  if (p.has("discount")) state.discount = p.get("discount");
  if (p.has("sort")) state.sort = p.get("sort");
  if (p.has("store")) state.store = p.get("store");
  if (p.has("category")) state.category = p.get("category");
  if (p.has("q")) state.q = p.get("q");
  $("discount").value = state.discount;
  $("sort").value = state.sort;
  $("store").value = state.store;
  $("search").value = state.q;
  document.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.cat === state.category)));
}

function render() {
  const hash = location.hash;
  const match = hash.match(/^#\/deal\/([\w-]+)$/);
  if (match) {
    const d = deals.find((x) => x.id === match[1]);
    if (d) {
      grid.hidden = true;
      resultLine.hidden = true;
      empty.hidden = true;
      detail.hidden = false;
      detail.innerHTML = detailHTML(d, deals);
      document.querySelector(".controls").style.display = "none";
      window.scrollTo(0, 0);
      return;
    }
  }
  document.querySelector(".controls").style.display = "";
  detail.hidden = true;
  grid.hidden = false;
  resultLine.hidden = false;
  const list = filtered();
  grid.innerHTML = list.map(cardHTML).join("");
  empty.hidden = list.length > 0;
  const sortLabel = SORTS.find((s) => s.value === state.sort).label;
  resultLine.textContent =
    list.length === deals.length
      ? `${list.length} deals, sorted by ${sortLabel} — all prices checked ${CHECKED_LABEL}.`
      : `${list.length} of ${deals.length} deals match, sorted by ${sortLabel}.`;
}

function buildControls() {
  const chips = $("category-chips");
  chips.innerHTML = CATEGORIES.map(
    (c) => `<button class="chip" data-cat="${c}" aria-pressed="${c === state.category}">${c}</button>`,
  ).join("");
  chips.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.category = b.dataset.cat;
    chips.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  });

  const fill = (el, items, getValue, getLabel) => {
    el.innerHTML = items.map((it) => `<option value="${getValue(it)}">${getLabel(it)}</option>`).join("");
  };
  fill($("store"), STORES, (s) => s, (s) => (s === "All" ? "All stores" : s));
  fill($("discount"), DISCOUNT_BANDS, (b) => b.value, (b) => b.label);
  fill($("sort"), SORTS, (s) => s.value, (s) => s.label);

  $("store").addEventListener("change", (e) => { state.store = e.target.value; render(); });
  $("discount").addEventListener("change", (e) => { state.discount = e.target.value; render(); });
  $("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  $("search").addEventListener("input", (e) => { state.q = e.target.value; render(); });
}

$("stats").textContent = statsLine(deals);
buildControls();
applyHashParams();
window.addEventListener("hashchange", () => { applyHashParams(); render(); });
render();
