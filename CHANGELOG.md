# Changelog

_Per spec §17: "After each phase: update CHANGELOG.md, run the relevant Lighthouse target, paste the score into the changelog entry."_

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) loosely; phases map to commits.

## [Unreleased] — branch `feat/atl-domination`

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
