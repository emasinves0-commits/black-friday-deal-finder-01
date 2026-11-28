# DealSleuth — Black Friday Deal Finder 2026

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/emasinves0-commits/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/emasinves0-commits/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

A Black Friday deal finder with **69 real deals, every price checked Nov 27–28, 2026** — Black Friday week — and every deal scored honestly. **$16,591 total savings across 9 stores and 12 categories, including 9 lowest-ever prices.**

## What makes it a finder, not a list

- **Deal Score + verdict on every card.** Score = discount % + 10 when a source calls the price a lowest-ever, capped at 99. Verdicts: LOWEST EVER, DEEP CUT (50%+), STRONG DROP (40–49%), SOLID DEAL (30–39%), TYPICAL SALE (under 30%). A small discount on a big ticket can still save more — sort by “Biggest saving ($)” to see those first.
- **Same product, compared across stores.** AirPods Pro 3: $149 at Amazon and Walmart, $149.99 at Target, $170 at Best Buy. Bose QuietComfort: $167 at Amazon, $169 at Best Buy, $169.99 at Target. Switch 2 bundle: $499 at Amazon and Walmart, $499.99 at Best Buy. Dyson V9: $270 at Best Buy and Walmart. The cheapest store is marked on the detail page.
- **Search + filters that work.** Full-text search, 12 category chips with deal counts, store and discount filters, a “Lowest-ever only” toggle, four sorts (Deal Score, biggest discount, biggest saving, lowest price).
- **Biggest savings first.** The top of the page ranks the ten deals that save the most dollars (LG C6 OLED: $1,300 off, Samsung S84H: $1,200 off…), so the largest cuts are the first thing a shopper sees.
- **Checked, with a time and a source.** Every card shows “Checked Nov 27, 2026, 06:20 UTC · Source: …” or “Checked Nov 28, 2026, 02:00 UTC · Source: …”. No deal without a source; no price without a check.
- **Phone layout.** Single-column grid, sticky search, same filters — the third screenshot is the phone view.

## The deals

69 deals across Audio, TV, Computing, Wearables, Fitness, Fashion, Smart home, Home & Kitchen, Cleaning, Gaming, Streaming and Toys — from a $18 AirTag (2nd Gen) to a $1,399.99 LG C6 OLED ($1,300 off). Deepest cuts first by default. Sources: Kart Deals, CNN Underscored, DealNews, Mashable, TechRadar, The Verge, Tom's Guide, Product Bible, NeighborHaus, Yahoo Shopping, Medium, SoapCentral and TradingView / Benzinga — all read Nov 27–28, 2026.

## Run it

```sh
node serve.ts          # app/ on http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand in to out/
```

`main.ts` (Node 22, stdlib only) copies `app/` + `screenshots/` to the output directory and writes `dossier.json` via the vendored `vendor/makefun-frontend.ts`, then verifies the dossier and the screenshot caps before reporting success.

## Layout

- `app/index.html` — the shell: masthead, controls, grid, detail view, methodology footer
- `app/style.css` — the look (no webfonts, no images, no network loads)
- `app/data.js` — the 69 deals, each with product, store, sale/usual price, store link, check time and source
- `app/views.js` — cards and the detail page (discounts are computed from price/was, so they always add up)
- `app/main.js` — state, filters, sorting and hash routing
- `main.ts` — the hand-in program
- `screenshots/` — 4 real renders of this site (see `shots.json`)

## License

MIT — see `LICENSE`.
