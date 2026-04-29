# Red Sky Cleaning

This is the repository for the [redskycleaning.com](https://redskycleaning.com) website &mdash; a residential cleaning company serving the greater Atlanta, Georgia area.

It's a static HTML / CSS / JavaScript site. No build step or framework required to run it &mdash; open `index.html` in a browser, or serve the folder with any static server.

## Local preview

```bash
npx http-server -p 3000
# then open http://localhost:3000/
```

## What's in here

- `index.html` &mdash; homepage
- `services/` &mdash; service pages (standard, deep, move-in, move-out, recurring)
- `areas/` &mdash; city pages (Alpharetta, Johns Creek, Marietta, Buckhead, and others)
- `about/`, `checklist/`, `guarantee/`, `faq/`, `contact/`, `privacy/`, `terms/` &mdash; trust + legal pages
- `quote/` &mdash; instant-quote drawer page
- `js/` &mdash; vanilla JS (pricing engine, quote drawer, scroll reveals, loading screen, analytics)
- `styles.css` &mdash; the entire design system
- `config/` &mdash; pricing, webhook endpoints, and analytics IDs (placeholders by default)
- `scripts/` &mdash; Node generators that emit the service / area / trust pages from JSON data

## Generating pages

```bash
node scripts/build-service-pages.mjs
node scripts/build-area-pages.mjs
node scripts/build-trust-pages.mjs
```

See `README-HANDOFF.md` for the full developer handoff guide.
