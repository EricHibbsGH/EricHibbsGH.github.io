# Changelog

_Per spec §17: "After each phase: update CHANGELOG.md, run the relevant Lighthouse target, paste the score into the changelog entry."_

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) loosely; phases map to commits.

## [Unreleased] — branch `feat/atl-domination`

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
