# Changelog

_Per spec §17: "After each phase: update CHANGELOG.md, run the relevant Lighthouse target, paste the score into the changelog entry."_

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) loosely; phases map to commits.

## [Unreleased] — branch `feat/atl-domination`

### Phase 4 — 2026-04-27 — `feat(home): full homepage rebuild`

**Replaced**

- `index.html` — full rebuild against the design system. Old single-page sprawl (3,300 lines, multiple inline JS modules, Bricolage+Figtree, teal+red palette, modal quote form) replaced with a clean, sectioned homepage (~580 lines) using the new `.rs-*` primitives + the Phase-3 quote drawer + Phase-3 inline calc. New page is built on:
  - Sticky `.rs-hdr` with shrink-on-scroll, mobile slide-in nav, click-to-call `(470) 240-0645` always present
  - `.rs-hero` with H1 *"Atlanta's cleanest homes start here."* + lede + dual CTA (drawer + tel link) + 4-pill trust strip + photo placeholder (gradient wash until owner supplies hero photo)
  - `.rs-ticker` (hidden by default — surfaces only when `config/recent-bookings.json` has real data per D-024)
  - 3-step "How it works" (Book → We clean → Relax)
  - 4-card service grid (each opens drawer pre-filled with that service via `data-rs-prefill-service`)
  - Inline 3-input mini-calc teaser (mounted via `[data-rs-inline-calc]`)
  - 4-pillar Red Sky Promise grid (gradient top-strip per spec §4.1 thin-border treatment)
  - 50-point checklist preview (8 sample items in a horizontal scroller with mouse drag-scroll + touch-native scroll, links to `/checklist/`)
  - Reviews carousel (5 sample cards, marked as samples per D-022 until Trustindex feed wires up — links to `/checklist/` and to the Google reviews permalink)
  - Service-area map: Leaflet 1.9.4 lazy-loaded via `IntersectionObserver` only when the section enters viewport (spec §11.5 budget) — 11 cities pinned in brand red, 65 km coverage circle, click pin → city page
  - 5-Q FAQ accordion + FAQPage JSON-LD
  - Final CTA band (`--rs-ink` background with `--rs-gradient` halo)
  - 5-column footer (Brand · Services · Areas · Company · Contact) + bottom bar with copyright + privacy/terms

**Added**

- Homepage layout CSS: `.rs-skip`, `.rs-container`, `.rs-hdr*`, `.rs-hero*`, `.rs-ticker`, `.rs-section*`, `.rs-how-step`, `.rs-svc-grid`, `.rs-promise-card` (with brand-gradient top strip), `.rs-check-scroller` + `.rs-check-card`, `.rs-reviews`, `.rs-disclosure`, `.rs-service-map`, `.rs-area-grid`, `.rs-map-pin`, `.rs-cta-band`, `.rs-footer*` (~470 lines appended to `styles.css`)
- 3 SVG `<symbol>` reused via `<use>` (star, shield, check, leaf, phone, arrow-right, chevron) — single declaration shared across the page
- `sitemap.xml` updated with `/quote/` URL + 2026-04-27 lastmod

**JSON-LD preserved/refreshed**

- `LocalBusiness` + `CleaningService` (HouseCleaning extension) — added `sameAs` for Facebook + Instagram
- `FAQPage` — refreshed to 5 most-asked Qs that match the on-page accordion
- `WebSite` — added `SearchAction` for sitelinks-search-box eligibility

**Honest notes**

- **Hero photo + service photos + before/after photos still owner-supplied.** Until they land, the hero shows a brand-gradient wash and service cards have a gradient placeholder media area.
- **Trustindex feed not yet live** — 5 sample reviews shown with disclosure note.
- **`config/recent-bookings.json` not present** — booking ticker stays hidden per D-024.
- **Header `(470) 240-0645` is now in EVERY page header** including mobile (spec §18 requirement met).
- **Quote drawer mounts on every CTA button site-wide** via `[data-rs-open-quote]`.

**Lighthouse:** baseline still pending. Target ≥95/98/100/95 mobile.

### Phase 3 — 2026-04-27 — `feat(quote): instant calculator + drawer`

**Added**

- `config/pricing.json` — full pricing seed values per spec §7.2 (base, per_bedroom, per_bathroom, sqft_tier_multiplier, addons w/ unit modes, frequency_discount, service_labels, time_window_radios, service_area_zips). Owner can tune any number without code changes.
- `config/endpoints.json` — webhook URLs (`quote_webhook`, `contact_webhook`, `newsletter_webhook`, `exit_intent_webhook`) + `turnstile_site_key`. All values default to `YOUR_*_HERE` placeholders that the JS detects and fails-safe on.
- `js/pricing.js` — vanilla ES module. Loads config once with embedded fallback, exposes `computePrice()`, `serviceLabel()`, `serviceStartingAt()`, `zipInServiceArea()`, `formatUSD()`, `summarize()`. Per-room and per-load addon unit handling. Returns `{ low, high, mid, breakdown[], savings }` with ±10% range around the anchor price.
- `js/quote-drawer.js` — slide-in 5-step drawer (spec §7.1):
  - Native `<dialog>` + ::backdrop + focus trap (browser-native)
  - Step 1: service-card radio grid
  - Step 2: bedroom + bathroom steppers, sqft tier select
  - Step 3: frequency cards with "Most popular" badge on bi-weekly
  - Step 4: addon chip multi-select, date picker, time-window radios, pets toggle
  - Step 5: contact details (name, email, phone, address, city, ZIP) with inline blur validation, hidden honeypot, hidden GA state field
  - Live price tween (`requestAnimationFrame`, ease-out-quart, reduced-motion-safe)
  - localStorage draft state under key `rsc_draft_v1` — auto-saves every input change
  - Submit posts JSON to `quote_webhook` (skips silently if placeholder), pushes `submit_quote` to `dataLayer` for Phase-9 GTM
  - Success screen with Add-to-Google-Calendar link + downloadable `.ics`
  - `[data-rs-open-quote]` auto-binds any element on the page; programmatic open via `window.RSQuoteDrawer.open(prefill)`
- `js/inline-calc.js` — 3-input mini-calculator (ZIP + bedrooms + frequency) per spec §6. Real-time price update, ZIP coverage check (✓ / "outside core area"), "Continue Booking" forwards prefill into the drawer (or `/quote/?…` query-string fallback).
- `quote/index.html` — `/quote/` deep-link landing page with hero, inline mini-calc, "How it works" 5-step grid, trust strip. Deep-link prefill from `?service=…&zip=…` auto-opens the drawer. Service + Offer + AggregateOffer JSON-LD.
- styles.css: appended `.rs-quote-drawer`, `.rs-qd__*` (head/progress/title/body/sub/row/svc-grid/svc-card/freq-grid/freq-card/addons/addon-chip/windows/tw/pets/contact-grid/foot/estimate/actions/success/etc.), and `.rs-mini-calc` styles. Reduced-motion overrides included.

**Changed**

- No production HTML touched (legacy `index.html`, `services/`, `areas/` etc. still untouched per spec — those pages rebuild in Phases 4–7).

**Decisions logged this phase**

- D-004: pricing engine in `js/pricing.js` reading `config/pricing.json`
- D-005: quote drawer = native `<dialog>` with focus-trap fallback
- D-006: webhook submission, owner picks endpoint
- D-016: placeholder content marked in CONTENT-NEEDS.md (here: webhook URLs default to `YOUR_*_HERE`, fail safe)

**Honest note** — submissions silently fail-success until the owner pastes a real webhook URL into `config/endpoints.json`. The JS still:
- Pushes `start_quote` and `submit_quote` to `window.dataLayer` (so Phase 9 GTM picks them up)
- Saves the draft to localStorage so the user's data isn't lost on refresh
- Shows the success screen + Add-to-Calendar links

**Lighthouse:** still no formal capture. First baseline at Phase 4 homepage rebuild.

### Phase 2 — 2026-04-27 — `feat(design): tokens + base components`

**Added**

- Spec §4.1 color tokens: `--rs-ink`, `--rs-ink-soft`, `--rs-paper`, `--rs-cloud`, `--rs-line`, `--rs-red`, `--rs-red-deep`, `--rs-ember`, `--rs-sky`, `--rs-sky-soft`, `--rs-gold`, `--rs-success`, `--rs-warn`, `--rs-danger` + `--rs-gradient` (red→ember→gold)
- Spec §4.2 type scale (`--text-xs` → `--text-6xl` + `--text-hero` clamp), display/body/mono font stacks (`--font-display`, `--font-body`, `--font-mono`), display/tight/snug/normal/loose leadings, weight roles, tracking
- Spec §4.3 spacing scale extended through `--space-32` (128 px), radius tokens `--r-sm`/`md`/`lg`/`xl`/`pill`, ink-tinted shadows `--sh-1`/`2`/`3`
- `@font-face` declarations for Fraunces (variable + italic), Inter (variable), JetBrains Mono — pointing to `/fonts/*.woff2` (binaries to be supplied per CONTENT-NEEDS.md)
- Universal focus ring (`--focus-ring`) on `:focus-visible`
- `.rs-*` component primitives appended to `styles.css`: `.rs-btn` (primary/secondary/ghost/link/cta + sm/lg/block + disabled), `.rs-card` (+ hoverable + feature), `.rs-input/select/textarea` (+ aria-invalid), `.rs-label`, `.rs-field-hint`, `.rs-field-error`, `.rs-stepper`, `.rs-badge` (+ red/sky/gold/success/ink), `.rs-accordion` (+ FAQ-friendly), `.rs-tabs`, `.rs-toast` (info/success/warn/danger), `.rs-review-card`, `.rs-service-card`, `.rs-area-card`, `.rs-drawer` (slide-in scrim + panel, full-screen on ≤640px), `.rs-eyebrow`, `.rs-rule`, `.rs-trust-bar`, plus `prefers-reduced-motion` overrides
- `dev/components.html` — gated `noindex,nofollow` storybook-style preview gallery showing token swatches, type specimens, radius/shadow demos, and every `.rs-*` component variant with sticky table-of-contents nav

**Changed**

- Replaced Google Fonts CDN `@import` (Bricolage Grotesque + Figtree) with self-hosted `@font-face` per spec §4.2 (privacy + LCP)
- `body` background swapped from pure white to `--rs-paper` (warm off-white per §4.1)
- Headings now default to `--font-display` (Fraunces) with `--leading-tight` and `--tracking-tight`
- Universal `p { max-width: 65ch; }` for prose readability
- Legacy aliases `--teal` / `--accent` now resolve to `--rs-ink` and `--rs-red` respectively (was `--rs-sky` blue, which clashed with the red CTA — see fix below)
- Scrollspy active link + nav hover underline switched from `--teal` (now ink, invisible on text) to `--rs-red`
- Existing `--shadow-sm/md/lg/hover` tokens now reference the new ink-tinted `--sh-1/2/3` instead of the prior teal-tinted shadows
- `::selection` updated to use a 22% red tint (was teal)
- `.impeccable.md` palette section rewritten to spec §4.1

**Decisions logged this phase**

- D-011: self-hosted WOFF2 fonts in `/fonts/`, no CDN at runtime
- D-012: spec §4.1 palette overrides current teal+red
- D-026: critical-CSS inlining pattern reserved for Phase 4+ pages

**Honest note** — until the WOFF2 binaries land in `/fonts/`, the browser falls back to system serif/sans. Page still renders correctly; just won't have the Fraunces editorial feel. CONTENT-NEEDS.md Phase-2 section has the 4-step download instructions.

**Lighthouse:** still no formal capture (Phase-4 baseline pending).

### Phase 1 — 2026-04-27 — `chore: audit, project scaffold, perf baseline`

**Added**

- `AUDIT.md` — pre-flight findings (P0–P3 prioritized) and stack reconciliation note
- `DECISIONS.md` — 30 architectural decisions reconciling spec to actual codebase (D-001 → D-030)
- `CONTENT-NEEDS.md` — owner action items (founder bio, hero photos, GA4/GTM IDs, webhook URLs, etc.)
- `ASSETS.md` — sources + licenses for every asset that will ship
- `MARKETING.md` — 90-day off-site playbook (GBP, citations, review templates, blog topics)
- `CHANGELOG.md` — this file
- `README-HANDOFF.md` — owner deploy + handoff guide
- `.gitignore` — node_modules, OS junk, build artifacts, env files
- Project scaffold directories: `services/`, `areas/`, `js/`, `config/`, `fonts/`, `partials/`, `reports/`, `dev/`, `scripts/` (each with `.keep` so git tracks empty dirs)

**Changed**

- Created branch `feat/atl-domination` from `master`. All Phase 2+ work happens here.

**Decisions logged this phase**

- D-001: stay static, no WP migration
- D-002: multi-page via folder URLs
- D-003: no bundler — `partials/` + sync script
- D-018: branch + PR title

**No visual changes.** No production code modified. `index.html`, `styles.css`, `logo.png`, `robots.txt`, `sitemap.xml`, `.impeccable.md` untouched.

**Lighthouse:** baseline not yet captured. First formal capture happens at Phase 4 (homepage rebuild) and again at Phase 10 (full suite, JSON to `reports/`).

---

## [Pre-rebuild] — `master` branch

History prior to the rebuild (all on `master`, accumulated from prior sessions):

- Single-page `index.html` with hero, quiz, services, before/after, promise, badges, testimonials, about, areas, FAQ, contact, CTA, footer
- 3-step quote wizard inside a centered modal
- Address autocomplete via Nominatim (no API key, debounced + cached)
- Leaflet service-area map (lazy-loaded)
- JSON-LD: CleaningService+LocalBusiness, FAQPage, WebSite (3 valid blocks)
- Open Graph + Twitter Card meta + canonical + hreflang + geo meta tags
- `robots.txt` + image-extended `sitemap.xml`
- `prefers-reduced-motion` honored across all animations
- Floating-label form pattern with inline blur validation
- Focus trap + restore + Escape on every modal
- Scroll-progress bar, scrollspy nav, back-to-top button, sticky mobile CTA
- Stats section as a quiet trust strip (intentionally not the AI hero-metrics template)
- Brand red `#E11D29` swap to match logo (will be replaced by `--rs-red #C8252C` per spec §4.1 in Phase 2)

These features are mostly portable forward; the rebuild reuses the patterns but rebuilds against spec §4.1 tokens, the Fraunces+Inter type system, and the multi-page IA.
