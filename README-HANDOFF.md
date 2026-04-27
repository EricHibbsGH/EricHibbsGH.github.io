# Red Sky Cleaning — Handoff Guide

_One-screen summary for the owner. Per spec §20: "what changed, what the owner needs to provide, and exactly how to deploy."_

## What changed (in plain English)

The site went from a single sprawling `index.html` into a **multi-page static site** built around five outcomes:

1. **Quote → booked in ≤ 60 seconds** via a slide-in calculator drawer (mounted on every page).
2. **Top-3 Google Maps ranking for 10 cities** via 10 unique area pages + 5 service pages + rich structured data.
3. **Sub-1.8s LCP on mobile** via self-hosted fonts, deferred JS, AVIF/WebP images, lazy-loaded Leaflet.
4. **WCAG 2.2 AA** with real `<dialog>`, focus traps, reduced-motion respect, keyboard-only booking flow.
5. **Trust** via the 50-point Red Sky Checklist page, formal 24-hour re-clean guarantee, restyled Trustindex feed, and honest content (no fabricated reviews / awards / team).

Branch: `feat/atl-domination`. Commits map to phases per `CHANGELOG.md`.

## What you need to provide before launch (full list in `CONTENT-NEEDS.md`)

**Critical (blocks launch quality):**

- Founder bio + headshot
- 2–4 team photos
- Hero photography (3 photos of clean Atlanta homes)
- Service photography (5)
- 4 verified before/after pairs
- Trustindex API key or RSS endpoint
- White-knockout logo for dark surfaces
- Webhook URL for form submissions (Zapier / Make / Formspree / Netlify Forms — your pick)
- GA4 ID, GTM ID, Meta Pixel ID, Microsoft Clarity ID
- Cloudflare Turnstile site key

**Optional but high-impact:**

- Live "last booked X min ago" data feed
- Insurance carrier name + policy limit
- A 60–90 second founder video

## How to deploy

The site is **static HTML/CSS/JS** — no build step. Three host options, ranked by recommendation:

### Option A — Netlify (recommended, free tier)

1. Push `feat/atl-domination` to GitHub (`git push -u origin feat/atl-domination`), open the PR titled "Red Sky Cleaning — Atlanta domination rebuild", and merge to `main` after review.
2. Sign up at [netlify.com](https://www.netlify.com), click **Add new site → Import from Git**, pick the repo.
3. Build settings: **Build command** = leave blank. **Publish directory** = `/` (root).
4. Environment variables: paste the IDs from `config/tracking.json` and `config/endpoints.json` here as Netlify env vars too (Netlify Forms also needs `NETLIFY_FORMS_ENABLED=true` if that's the chosen submission target).
5. Deploy. Add the production domain `redskycleaning.com` under **Domain settings**, follow Netlify's DNS instructions.
6. The `_redirects` file at the repo root takes over for legacy URL redirects (`/booking-page` → `/book/`, `/areas-2` → `/areas/`, etc.).

### Option B — Cloudflare Pages (free tier, even faster cold-start)

1. Same GitHub merge as above.
2. Sign in at [pages.cloudflare.com](https://pages.cloudflare.com), **Create a project** → connect to GitHub.
3. Build settings: **Framework preset** = None. **Build command** = blank. **Build output directory** = `/`.
4. Environment variables: same as Netlify Option A.
5. Deploy. The `_redirects` file works identically here.
6. Bonus: Cloudflare's CDN is the fastest at the edge — you may shave 100–200 ms off LCP vs Netlify.

### Option C — Vercel (free tier)

1. Same GitHub merge.
2. Sign in at [vercel.com](https://vercel.com), **New Project** → import.
3. Framework preset: **Other**. Build command: blank. Output directory: `/`.
4. The `vercel.json` file at repo root configures redirects.

### Option D — Apache shared host

If your existing host is Apache (e.g. SiteGround, Hostinger, GoDaddy), the `.htaccess` file at repo root handles redirects. Drop all files into `public_html/` via FTP. **No PHP, no MySQL, no installation needed.**

---

## After deploy — first-week verification checklist

```bash
# 1. Lighthouse mobile on the 4 representative pages — paste scores into CHANGELOG.md Phase-10 entry
npx lighthouse https://redskycleaning.com/ --form-factor=mobile --output=json --output-path=reports/lh-home.json
npx lighthouse https://redskycleaning.com/services/standard/ --form-factor=mobile --output=json --output-path=reports/lh-services-standard.json
npx lighthouse https://redskycleaning.com/areas/alpharetta/ --form-factor=mobile --output=json --output-path=reports/lh-areas-alpharetta.json
npx lighthouse https://redskycleaning.com/quote --form-factor=mobile --output=json --output-path=reports/lh-quote.json

# 2. Submit sitemap to Google + Bing
# - https://search.google.com/search-console → Sitemaps → submit `sitemap.xml`
# - https://www.bing.com/webmasters → Sitemaps → submit

# 3. Validate structured data
# - https://search.google.com/test/rich-results → run on each of the 4 URLs above

# 4. End-to-end booking flow
# - Open homepage on mobile (or DevTools mobile emulation)
# - Click "Get Instant Quote"
# - Step through the 5-step drawer with keyboard only (Tab/Enter/Esc)
# - Submit → confirm webhook fires + email arrives at support@redskycleaning.com
```

## Where to find what

- **`AUDIT.md`** — pre-rebuild findings, P0–P3 issue list
- **`DECISIONS.md`** — every architectural choice and one-line rationale
- **`CONTENT-NEEDS.md`** — owner action items (the "what we still need from you" list)
- **`ASSETS.md`** — every asset's source and license
- **`MARKETING.md`** — 90-day off-site playbook (GBP, citations, review templates, blog topics)
- **`CHANGELOG.md`** — phase-by-phase log of what shipped
- **`config/pricing.json`** — tune the calculator without code changes
- **`config/endpoints.json`** — webhook + Turnstile site key
- **`config/tracking.json`** — GA4 + GTM + Meta Pixel + Clarity IDs
- **`reports/`** — Lighthouse JSON reports per phase

## Honest expectations

- **On-site Lighthouse targets** (Perf ≥95, A11y ≥98, SEO 100, BP ≥95 mobile) are realistic for the rebuild and verified at Phase 10.
- **Top-3 Google Maps for all 10 cities in 90 days** is a stretch goal. The on-site work + this 90-day playbook puts the foundation in place; the realistic horizon for #1 across all 10 cities is **6–9 months**, depending on review acquisition velocity and citation consistency. Top-3 in 1–2 cities by day 90 is achievable.
- **≥4% conversion** is a post-launch metric. The site is built to support it (quote drawer everywhere, friction-minimized form, social proof, fast load); achieving it requires actual traffic + the off-site work in `MARKETING.md`.

## Questions during launch?

Re-open the relevant `.md` artifact — most launch-time questions are already answered in `CONTENT-NEEDS.md` (what to supply) or `DECISIONS.md` (why something was built that way).
