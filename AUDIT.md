# Pre-Flight Audit — Red Sky Cleaning

_Date: 2026-04-27. Branch: `feat/atl-domination`. Inputs: spec §3 (Pre-Flight) + accumulated knowledge of this codebase from prior sessions._

## Stack inventory

The project at `c:\Users\bojo1\OneDrive\Desktop\RedSkyCleaning` is **not WordPress**. It is a hand-authored static site:

| Layer | What's there |
|-------|--------------|
| HTML | Single page `index.html` (~174 KB, ~3,300 lines) |
| CSS | Single stylesheet `styles.css` (~115 KB, ~3,900 lines) |
| Image | `logo.png` (9 KB, the only raster asset) |
| Crawl | `robots.txt`, `sitemap.xml` (added in earlier session) |
| Design context | `.impeccable.md` |
| Tooling | none (no `package.json`, no `Gemfile`, no `composer.json`, no build system) |
| Server | none — designed for static hosting (Netlify / Cloudflare Pages / Vercel / S3) |

There is no WordPress, no PHP, no plugins, no Elementor / Divi / Gutenberg, no jQuery dependency, no theme. The "current stack" the spec assumes does not exist in this working tree. **Decision recorded in DECISIONS.md (D-001):** treat the static codebase as the source of truth; spec items that depend on WP-specific tooling (plugin pruning, child theme, PHP migration) are no-ops. Everything else carries forward unchanged.

## Performance baseline

Lighthouse has not yet been run against this codebase. Phase 1 ships the audit; first formal Lighthouse capture happens at Phase 4 (homepage rebuild) and Phase 10 (full suite, JSON dropped to `reports/`). Targets per spec §0:

- Mobile Lighthouse: Performance ≥95, Accessibility ≥98, SEO 100, Best Practices ≥95
- LCP < 1.8s on 4G, CLS < 0.05, INP < 150ms
- Booking flow: ≤60 seconds, ≤6 inputs

**Likely current Lighthouse picture (educated estimate, to be measured):** Performance high-80s to mid-90s mobile (single page, no JS framework, no heavy images, but ~115 KB CSS + ~174 KB HTML render-blocking; Google Fonts CDN currently in use), Accessibility high-90s (focus rings, skip-link, semantic landmarks, aria-live regions all present from prior sessions), SEO 90–100 (meta + JSON-LD shipped earlier; canonical set), BP ~90 (inline `<script>`, no CSP).

## Asset bloat

| Asset | Size | Verdict |
|-------|------|---------|
| `index.html` | 174 KB | over budget for a single page; will be split into ~25 pages with shared partials in Phase 2+ |
| `styles.css` | 115 KB | unused-CSS suspected once tokens are rebuilt; Phase 2 token migration + Phase 10 PurgeCSS pass |
| `logo.png` | 9 KB | fine; keep PNG for the logo (it's already small and has the brand-mark anti-aliasing) |
| Google Fonts CDN call (Bricolage Grotesque + Figtree) | ~50 KB external + render-blocking | **replace** in Phase 2 with self-hosted Fraunces + Inter WOFF2 per spec §4.2 |
| Leaflet 1.9.4 from unpkg.com | ~140 KB JS+CSS, currently lazy-loaded only when `#serviceMap` enters viewport | keep lazy strategy; pin to a specific version |
| Inline JS in `index.html` | ~50 KB | move to `js/*.js` modules in Phase 3+; defer non-critical |

No render-blocking video, no background videos, no auto-playing media. No social-share scripts. No analytics scripts (yet).

## SEO baseline (carried over from earlier `/seo` skill run + prior commits)

| Signal | Status |
|--------|--------|
| `<title>` | Present, 61 chars, leads with `House Cleaning Atlanta GA` |
| Meta description | Present, 148 chars, location keyword + USP |
| Canonical | `https://redskycleaning.com/` (placeholder domain — owner to confirm) |
| Open Graph + Twitter Card | All tags present, og:image is `logo.png` (will become 1200×630 per page in Phase 9) |
| `lang="en"` | Present |
| `<main id="content">` landmark | Present, wraps all sections between header and footer |
| Heading hierarchy | One H1, h2/h3 outline clean (trust badges fixed h4→h3 with sr-only h2 in earlier session) |
| `robots.txt` | `User-agent: * / Allow: / / Sitemap: …` |
| `sitemap.xml` | Present, image-extended, **only the root URL** — needs 14+ entries when service + area pages exist |
| Structured data | 3 valid JSON-LD blocks: `CleaningService`+`LocalBusiness` (multi-type with AggregateRating, OpeningHours, OfferCatalog, areaServed=11 cities), `FAQPage` (6 Qs), `WebSite`. All parse-validated. |
| Geo meta tags | `geo.region`, `geo.placename`, `geo.position`, `ICBM` set to Atlanta |
| `hreflang` | `en-us` + `x-default` set |
| Internal linking | Single page; needs city × service matrix in Phase 6+9 |

## Accessibility baseline

| Signal | Status |
|--------|--------|
| Skip-to-content link | Present |
| `:focus-visible` rings | Site-wide, 2 px teal (will become `--rs-sky` in Phase 2) |
| Form labels | All inputs have associated `<label>` or floating-label; required `*` + `required` attribute |
| Inline error messages | `aria-live="polite"`, `aria-invalid="true"`, blur-validated |
| Modal focus trap + restore + Escape | Present on quote, exit, 4 policy modals |
| `aria-live` regions | ZIP checker result, price estimate, form status |
| Keyboard nav | Hero, quiz, before/after slider (arrow keys + Home/End), FAQ accordion, modal trap, carousel arrows — all working |
| `prefers-reduced-motion` | Honored across hero mesh, scroll-reveal, before/after hint, marker drop, scroll progress |
| Color contrast | Body, secondary, links, buttons all ≥ 4.5:1 (verified during prior `/typeset` and `/clarify` phases) |
| Click-to-call links | `tel:4702400645` present (Phase 4 will normalize to `tel:+14702400645` per spec §13) |

**Outstanding for Phase 8/10:**
- Calculator drawer should use real `<dialog>` element rather than `<div role="dialog">`.
- Re-run axe-core on every page after Phase 6+7 ship (target 0 critical/serious violations).

## Form audit

The current quote form (3-step wizard from earlier session):

- **Step 1:** service (radio cards), home size (select), bedrooms (select), bathrooms (select), frequency (radio cards)
- **Step 2:** 6 add-on checkboxes, 4 preference toggles (pets/allergy/eco/fragrance), free-text details
- **Step 3:** first name, last name, phone, email, street address (Nominatim autocomplete), city, ZIP, preferred date

**Already removed in earlier sessions:** generic country dropdown (spec §3 flagged this as a P0 — confirmed gone), redundant "Pets?" yes/no radio (replaced by the priced "I have pets" toggle).

**Friction items for Phase 3 rebuild as drawer (per spec §7):**
- Currently a centered modal; spec requires slide-in drawer from right on desktop, full-screen sheet on mobile.
- Spec §7.1 step structure differs: 4 steps (service / home / frequency / add-ons+date) → confirm with contact, vs current 3-step (service+home / customize / contact).
- Steppers (not selects) for bedrooms/bathrooms.
- Add-ons missing from current set: Inside cabinets per room, Inside windows per room, Wall scuff per room, Blinds per room, Dishes, Detailed baseboards, Pets toggle.
- Date picker today is a single `<input type="date">`; spec wants 2-week visible range + time-window radios (8–11 / 11–2 / 2–5).
- Live tween of running total (currently updates discrete values).
- localStorage draft state with "pick up where you left off?" toast on return.
- Add-to-calendar links on success screen.

## Content typos & inconsistencies

| Item | Status |
|------|--------|
| "Dawnsonville" → "Dawsonville" | Already correct everywhere — spec was wrong about this codebase. Verified zero occurrences of "Dawnsonville". |
| "afresh" | Not present in codebase. |
| "let's" vs "lets" | Both used in different contexts; will normalize during Phase 4+ copy review. |
| H2/H3 inconsistent capitalization | Mixed sentence case ("How it works") and title case ("Our cleaning services"). Phase 2 design system locks sentence case for headings. |
| `/areas` and `/areas-2` duplicates | N/A — no separate pages exist; current site uses `#areas` anchor. Phase 6 creates `/areas/index.html` cleanly. |

## Image format & dimensions

Only image is `logo.png` (9 KB). All "service photo" / "before-after" placeholders are CSS-only decorative tints — no raster bloat. **Phase 4 hero photo + Phase 5 service photos + Phase 6 area photos all need real WebP/AVIF assets** (logged in CONTENT-NEEDS.md).

`logo.png` already has explicit `width="180" height="68"` and `decoding="async" fetchpriority="high"` attributes set on the homepage instance from a prior session. Re-verify on every new page in Phase 4–7.

## Tracking gaps

- GA4 — not installed.
- Meta Pixel — not installed.
- Google Tag Manager — not installed.
- CallRail / call tracking — not installed.
- Microsoft Clarity / Hotjar — not installed.

All wired in Phase 9 with consent gating. IDs requested via CONTENT-NEEDS.md.

---

## Prioritized fix list

### P0 — Blocking

| # | Issue | Fix phase |
|---|-------|-----------|
| P0-1 | Single-page architecture cannot rank for 10 city × 4 service long-tail queries | 5, 6 |
| P0-2 | Quote form is a centered modal — needs drawer rebuild per spec §7.1 | 3 |
| P0-3 | Pricing logic hard-coded in `index.html` 2300–2354; spec §7.2 demands tunable engine + `config/pricing.json` | 3 |
| P0-4 | Form submissions post to placeholder Zapier URLs; no real lead capture wired | 3 (pending owner-supplied endpoint) |
| P0-5 | No GTM / GA4 / Meta Pixel; no conversion tracking | 9 |
| P0-6 | First-visit loading screen + Lenis smooth scroll absent | 8 |

### P1 — Major

| # | Issue | Fix phase |
|---|-------|-----------|
| P1-7 | Color tokens are teal+red; spec §4.1 mandates `--rs-red #C8252C` palette | 2 |
| P1-8 | Fonts are Bricolage Grotesque + Figtree via Google Fonts CDN; spec §4.2 requires self-hosted Fraunces + Inter | 2 |
| P1-9 | All trust pages absent: `/about/`, `/checklist/`, `/guarantee/`, `/faq/`, `/contact/`, `/book/`, `/quote/`, `/privacy/`, `/terms/` | 7 |
| P1-10 | 50-point Red Sky Checklist not surfaced (spec §10 SEO unlock) | 7 |
| P1-11 | Reviews use 5 hand-coded testimonials with initials avatars; spec wants Trustindex feed of 14 verified Google reviews | 9 (Trustindex restyle) |
| P1-12 | Map is current single-page Leaflet; service-area visuals need pin-per-city with hover→link in Phase 6 | 6 |
| P1-13 | Phone `(470) 240-0645` not pinned in sticky header on scroll on mobile | 4 |
| P1-14 | `sitemap.xml` only has root; needs 14+ entries when service + area pages exist | 6, 9 |
| P1-15 | OG image is square `logo.png`; spec wants 1200×630 branded social cards per page | 9 |
| P1-16 | No `404.html`, no `dev/components.html` preview, no service worker | 1 (scaffold), 2 (preview) |

### P2 — Minor

| # | Issue | Fix phase |
|---|-------|-----------|
| P2-17 | `index.html` is 174 KB unminified; CSS ~115 KB | 9, 10 |
| P2-18 | Several icon shapes still inlined per occurrence (only stars deduped via `<symbol>+<use>`) | 2 |
| P2-19 | `validateField`, `priceConfig`, `addrCombobox`, Leaflet init all inline in `index.html`; spec wants `js/*.js` modules | 3, 4 |
| P2-20 | `priceRange: "$$"` in JSON-LD is generic; spec §9 wants `"$100-$500"` | 9 |
| P2-21 | No CDN configured; Cloudflare free tier recommended in DECISIONS.md | 9 (handoff to owner) |
| P2-22 | No CSP headers configured | 9 (handoff to owner via deploy config) |

### P3 — Polish

- `<picture>` + AVIF/WebP not used (only `logo.png` exists currently).
- Existing Leaflet popup styling will need re-skin to match new `--rs-paper` palette (Phase 2 tokens).
- Minor copy edits queued for Phase 4 review pass.

## What's already in good shape — do not regress

- Skip-to-content link.
- `<main id="content">` landmark wrapping.
- Floating-label form pattern with inline blur validation.
- Focus trap + restore + Escape on every modal.
- Address autocomplete via Nominatim, no key, debounced 500 ms, in-session cache, OSM attribution.
- ZIP→City auto-fill from local zipMap; carries over from coverage checker via sessionStorage.
- Before/after slider keyboard-accessible (arrows + Home/End), starts on "Before" (0%), pulsing "Drag to clean" hint badge fades on first interaction.
- Stats section is a quiet trust strip (intentionally not the AI hero-metrics template).
- JSON-LD: 3 valid blocks.
- `robots.txt` + image-extended `sitemap.xml`.
- Geo meta tags + hreflang + canonical.
- `prefers-reduced-motion` honored throughout.
- Scroll-progress bar, scrollspy nav, back-to-top button, sticky mobile CTA.

---

## Phase 1 commit boundary

This document + scaffold directories + the seven other markdown artifacts (DECISIONS.md, CONTENT-NEEDS.md, ASSETS.md, MARKETING.md, CHANGELOG.md, README-HANDOFF.md, .gitignore) ship in `chore: audit, project scaffold, perf baseline` on branch `feat/atl-domination`. No production code is touched.
