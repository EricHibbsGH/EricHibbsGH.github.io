# Content Needs — Owner Action Items

_Per spec §1: "If a placeholder is unavoidable, prefix with `[PLACEHOLDER]` and list it here." Per spec §1: "Real content only. Do not invent fake testimonials, fake awards, fake stats, or fake team members."_

This list captures everything the rebuild needs that **only the owner can supply**. Each item references the page that depends on it. Until provided, those pages either hide the affected element or show `[PLACEHOLDER]`-marked copy that ships with the rebuild but must be replaced before launch.

## Critical (blocks launch quality)

- [ ] **Founder bio + headshot** — `/about/`. Until provided, the page shows a `[PLACEHOLDER]` 80-word bio and a generic outline silhouette.
- [ ] **Team photos + first names + roles** (2–4 staff) — `/about/`. Until provided, team grid hides.
- [ ] **Hero photography** — homepage hero. Need 3 photos of clean Atlanta homes (kitchen, living, bath). Spec §4.4: "Real homes, not stock-cliché 'blonde woman with mop.' Atlanta context where possible." Until provided, hero uses a CSS gradient + the existing logo as visual anchor.
- [ ] **Service photography** — `/services/{standard,deep,move-in,move-out,recurring}/`. One hero photo per service (5 total). Until provided, service hero uses the same gradient treatment as homepage.
- [ ] **Before/after pairs** — homepage gallery. Need at least 4 verifiable before/after pairs (kitchen, bath, bedroom, living). The current placeholders are decorative tints; they read as decoration but cannot make the "real results" claim until real photos arrive.
- [ ] **Trustindex API key OR RSS endpoint URL** — homepage reviews carousel + service pages. With this we can render the live 14-review feed; without it, we ship the 5 sample reviews under a "Sample reviews until live feed wires up" disclosure (decision D-022).
- [ ] **White-knockout logo** — footer + dark CTA bands. Need a version of the logo with white "RED SKY CLEANING" lettering for use on dark surfaces. Until provided, those areas show the existing logo on a paper-tone background.
- [ ] **Webhook URL for form submissions** — quote drawer + contact form. Owner picks the endpoint (Zapier, Make.com, Formspree, Netlify Forms, etc.) and pastes it into `config/endpoints.json`. Until provided, forms post nowhere and show "Thank you" but no real lead capture happens.
- [ ] **GA4 measurement ID** — `config/tracking.json` `ga4_id`. Without this, no analytics events fire.
- [ ] **GTM container ID** — `config/tracking.json` `gtm_id`. Required if GTM orchestration is preferred over direct GA4 install.
- [ ] **Meta Pixel ID** — `config/tracking.json` `meta_pixel_id`.
- [ ] **Microsoft Clarity project ID** — `config/tracking.json` `clarity_id`. Free; recommended for session replay.
- [ ] **Cloudflare Turnstile site key** — `config/endpoints.json` `turnstile_site_key`. Spam protection on contact form.

## Optional (nice-to-haves that elevate)

- [ ] **Live "last booked X min ago in Y" feed** — homepage ticker. Format: `config/recent-bookings.json` array of `{ city: "Alpharetta", minutes_ago: 23, anonymized_first_name: "Sarah M." }`. Updated by Zapier or a Google Sheet → JSON proxy. Without this, ticker stays hidden (D-024).
- [ ] **Founder's Atlanta-specific story bites** — for area pages. Even one sentence per city ("We've been serving Buckhead since 2019" or "Our crew lives in East Cobb") materially boosts local relevance. Without these, area-page intros lean on objective facts (neighborhoods, drive time, home types).
- [ ] **Awards / certifications / partnerships** — homepage trust strip + `/about/`. BBB rating, eco-product certifications, charity affiliations, chamber memberships. Without these, the trust strip uses "Insured & Bonded · Background-Checked · Eco-Safe · Re-Clean Guarantee" only.
- [ ] **Cleaning supply brand list** — `/about/` eco-product section + `/services/standard/` "what's included" trust hooks. E.g., "We use Method, Mrs. Meyer's, Seventh Generation, and microfiber cloths from [vendor]."
- [ ] **Insurance carrier name + policy limit** — `/guarantee/` insurance & bonding statement. E.g., "Insured to $1M general liability via Hiscox." Without this, the page says "fully insured and bonded" without specifics.
- [ ] **A 60–90 second founder video** — homepage about section. Big trust unlock if available.

## Phase 9 — social card images

Phase 9 will render 1200×630 OG images per page using a simple Sharp/Resvg script that overlays the page H1 + logo on a brand-gradient background. **Owner can override any of these** by dropping a manually-designed PNG into `assets/og/` with the matching slug filename — the script skips pages where a custom OG already exists.

## Phase 10 — verification artifacts

- [ ] Owner Google Search Console access (sitemap submission)
- [ ] Owner Bing Webmaster Tools access (sitemap submission)
- [ ] Final approved domain confirmed (`redskycleaning.com` assumed throughout — find/replace will retarget the rebuild if different)
