# Assets — Sources & Licenses

_Per spec §1: "No copyrighted assets. Use the existing logo, photos already on the site, and licensed sources (Unsplash, Pexels) for anything new — record sources in ASSETS.md."_

Every asset that ships in the rebuild is logged here with source, license, and the page it appears on. Asset filenames live under `/assets/` (Phase 4+ creates this directory as photos arrive).

## Currently in repo

| Asset | Path | Source | License | Used on |
|-------|------|--------|---------|---------|
| Logo (color) | `/logo.png` | Owner-supplied | Owner copyright | All pages (header, footer, OG fallback) |

## Fonts (added Phase 2)

| Asset | Path (planned) | Source | License | Notes |
|-------|----------------|--------|---------|-------|
| Fraunces variable | `/fonts/Fraunces[opsz,wght].woff2` | [Google Fonts → Fraunces](https://fonts.google.com/specimen/Fraunces) | OFL 1.1 | Display / headlines / pricing big numbers |
| Fraunces variable italic | `/fonts/Fraunces-Italic[opsz,wght].woff2` | same | OFL 1.1 | Italic + optical-size axis for editorial feel |
| Inter variable | `/fonts/Inter[wght].woff2` | [Google Fonts → Inter](https://fonts.google.com/specimen/Inter) | OFL 1.1 | Body / UI / forms |
| JetBrains Mono | `/fonts/JetBrainsMono-Regular.woff2` | [Google Fonts → JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | OFL 1.1 | Pricing-receipt context only (sparingly per spec §4.2) |

All four fonts are downloaded from Google Fonts (the catalog), then served from `/fonts/` rather than the Google Fonts CDN per spec §4.2 + decision D-011.

## Photography (added Phase 4–6 as owner supplies)

Owner is requested to supply real photos via `CONTENT-NEEDS.md`. Until those arrive, the rebuild ships no copyrighted imagery — only:

- The owner-supplied logo
- CSS-only placeholder treatments (gradients, tints) where photos will eventually go

If the owner explicitly approves a stock-photo gap-fill before launch, the only acceptable sources are:

- [Unsplash](https://unsplash.com/license) — Unsplash License (free for commercial use, attribution appreciated)
- [Pexels](https://www.pexels.com/license/) — Pexels License (free for commercial use, attribution not required)

**Do not** use:

- Shutterstock / Getty / Adobe Stock images without a paid license documented here
- Google Images search results
- AI-generated photos of "people" implying they are real cleaners or customers (spec §1 forbids fabrication)

## SVG / icon assets

Created in this repo (no external source):

| Asset | Path (planned) | Source | Notes |
|-------|----------------|--------|-------|
| Star icon | inline `<symbol id="i-star">` in every page | Authored in repo | Reviews + rating displays |
| Check icon | inline `<symbol id="i-check">` (Phase 2) | Authored in repo | "What's included" lists |
| Shield icon | inline `<symbol id="i-shield">` (Phase 2) | Authored in repo | "Insured & Bonded" trust marker |
| Sun-rise SVG | inline in loading screen (Phase 8) | Authored in repo | Stylized red sun + horizon (spec §11.1) |
| Pin / map icons | injected via Leaflet `divIcon` | Authored in repo | Already integrated |

## Map tiles

| Layer | Source | License |
|-------|--------|---------|
| Tile layer | [CartoDB Voyager](https://carto.com/attributions) on top of [OpenStreetMap data](https://www.openstreetmap.org/copyright) | © OpenStreetMap contributors + © CARTO. **Attribution rendered in every map's bottom-right.** |

## Library budget tracker (spec §11.5)

| Library | Path (planned) | Size | Where loaded |
|---------|----------------|------|--------------|
| Lenis | `/js/vendor/lenis.min.js` (or CDN with SRI) | ~5 KB | All pages |
| GSAP core | `/js/vendor/gsap.min.js` | ~25 KB | All pages |
| CountUp.js | `/js/vendor/countUp.min.js` | ~3 KB | Pages with stat counters (homepage, about) |
| Leaflet | `https://unpkg.com/leaflet@1.9.4/...` (lazy) | ~140 KB | Pages with maps only |
| **Non-lazy total** | | **~33 KB** | comfortably under spec budget |
