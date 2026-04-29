// scripts/build-trust-pages.mjs
// Emits 8 trust pages: about, checklist, guarantee, faq, contact, privacy, terms, 404.
// Run: `node scripts/build-trust-pages.mjs`
//
// Content is inline (these pages are not data-driven the way services/areas are).
// Schema.org blocks: AboutPage, HowTo (50-point checklist), Offer (guarantee),
// FAQPage (faq), ContactPage (contact). 404/privacy/terms are noindex stubs.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---------- Shared chrome ----------

function svgDefs() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <symbol id="i-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
  </defs>
</svg>`;
}

function header(active) {
  const cur = (k) => (active === k ? ' aria-current="page"' : "");
  return `
<a href="#main" class="rs-skip">Skip to content</a>
<header class="rs-hdr" id="header">
  <div class="rs-hdr__inner">
    <a href="/" class="rs-hdr__logo" aria-label="Red Sky Cleaning home"><img src="/logo.png" alt="Red Sky Cleaning" width="160" height="60"></a>
    <button class="rs-hdr__toggle" id="hdrToggle" aria-label="Open menu" aria-expanded="false" aria-controls="hdrNav"><span></span><span></span><span></span></button>
    <nav class="rs-hdr__nav" id="hdrNav" aria-label="Main">
      <ul>
        <li><a href="/services/"${cur("services")}>Services</a></li>
        <li><a href="/areas/"${cur("areas")}>Areas</a></li>
        <li><a href="/checklist/"${cur("checklist")}>Checklist</a></li>
        <li><a href="/about/"${cur("about")}>About</a></li>
        <li><a href="/#reviews">Reviews</a></li>
      </ul>
      <div class="rs-hdr__cta">
        <a href="tel:+14702400645" class="rs-hdr__phone"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
        <button class="rs-btn rs-btn--cta rs-btn--sm" type="button" data-rs-open-quote>Get instant quote</button>
      </div>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `
<footer class="rs-footer">
  <div class="rs-container rs-footer__inner">
    <div class="rs-footer__brand">
      <img src="/logo.png" alt="Red Sky Cleaning" width="140" height="52" class="rs-footer__logo">
      <p>Professional house cleaning in the greater Atlanta area. Background-checked, insured, satisfaction guaranteed.</p>
    </div>
    <div class="rs-footer__col"><h4>Services</h4><ul>
      <li><a href="/services/standard/">Standard cleaning</a></li>
      <li><a href="/services/deep/">Deep clean</a></li>
      <li><a href="/services/move-in/">Move-in</a></li>
      <li><a href="/services/move-out/">Move-out</a></li>
      <li><a href="/services/recurring/">Recurring plans</a></li>
    </ul></div>
    <div class="rs-footer__col"><h4>Areas</h4><ul>
      <li><a href="/areas/alpharetta/">Alpharetta</a></li>
      <li><a href="/areas/johns-creek/">Johns Creek</a></li>
      <li><a href="/areas/marietta/">Marietta</a></li>
      <li><a href="/areas/buckhead/">Buckhead</a></li>
      <li><a href="/areas/">All 10 cities →</a></li>
    </ul></div>
    <div class="rs-footer__col"><h4>Company</h4><ul>
      <li><a href="/about/">About</a></li>
      <li><a href="/checklist/">50-point checklist</a></li>
      <li><a href="/guarantee/">Guarantee</a></li>
      <li><a href="/faq/">FAQ</a></li>
      <li><a href="/contact/">Contact</a></li>
    </ul></div>
    <div class="rs-footer__col"><h4>Contact</h4><ul class="rs-footer__contact">
      <li><a href="tel:+14702400645">(470) 240-0645</a></li>
      <li><a href="mailto:support@redskycleaning.com">support@redskycleaning.com</a></li>
      <li>Mon–Fri · 7 am – 6 pm</li>
      <li>Atlanta, GA</li>
    </ul></div>
  </div>
  <div class="rs-footer__bottom"><div class="rs-container rs-footer__bottom-inner">
    <p>&copy; 2026 Red Sky Cleaning &middot; All rights reserved.</p>
    <p><a href="/privacy/">Privacy</a> &middot; <a href="/terms/">Terms</a></p>
  </div></div>
</footer>
<script>
(function(){var hdr=document.getElementById('header');var ticking=false;window.addEventListener('scroll',function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){hdr.classList.toggle('is-scrolled',window.scrollY>16);ticking=false;});},{passive:true});var tg=document.getElementById('hdrToggle'),nv=document.getElementById('hdrNav');tg.addEventListener('click',function(){var open=nv.classList.toggle('is-open');tg.setAttribute('aria-expanded',open?'true':'false');tg.classList.toggle('is-active',open);document.body.style.overflow=open?'hidden':'';});document.querySelectorAll('.rs-accordion__trigger').forEach(function(b){b.addEventListener('click',function(){var i=b.parentElement;var o=i.classList.contains('is-open');i.classList.toggle('is-open');b.setAttribute('aria-expanded',o?'false':'true');});});})();
</script>
<script type="module" src="/js/quote-drawer.js"></script>
<script src="/js/motion.js" defer></script>
<script src="/js/tracking.js" defer></script>
<script src="/js/page-load.js" defer></script>`;
}

// ---------- Page shell ----------

function pageShell({ title, description, canonical, h1, navActive, jsonLdBlocks = [], breadcrumb, body, noindex = false, headExtras = "" }) {
  const robots = noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large";
  const ldScripts = jsonLdBlocks
    .map((b) => `  <script type="application/ld+json">\n${JSON.stringify(b, null, 2)}\n  </script>`)
    .join("\n");
  const breadcrumbHtml = breadcrumb
    ? `<div class="rs-container">
    <nav class="rs-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><span aria-current="page">${escapeHtml(breadcrumb)}</span></li>
      </ol>
    </nav>
  </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#C8252C">
  <meta name="robots" content="${robots}">
  <meta name="geo.region" content="US-GA"><meta name="geo.placename" content="Atlanta">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="/logo.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://redskycleaning.com/logo.png">
  <link rel="stylesheet" href="/styles.css">${headExtras}
${ldScripts}
</head>
<body>
${svgDefs()}
${header(navActive)}

<main id="main">
  ${breadcrumbHtml}
  <section class="rs-page-hero">
    <div class="rs-container">
      <div class="rs-page-hero__inner">
        <div class="rs-page-hero__copy" style="max-width:none;">
          <p class="rs-eyebrow">${escapeHtml(h1)}</p>
          <h1>${escapeHtml(h1)}</h1>
        </div>
      </div>
    </div>
  </section>

${body}

  <section class="rs-cta-band">
    <div class="rs-container rs-cta-band__inner">
      <h2>Ready when you are.</h2>
      <p>Atlanta-trusted, fully insured, background-checked. Get your home priced in under a minute.</p>
      <div class="rs-cta-band__actions">
        <button class="rs-btn rs-btn--cta rs-btn--lg" type="button" data-rs-open-quote>Get instant quote</button>
        <a class="rs-btn rs-btn--secondary rs-btn--lg" href="tel:+14702400645"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
      </div>
    </div>
  </section>
</main>

${footer()}
</body>
</html>
`;
}

// ---------- About ----------

function aboutPage() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Red Sky Cleaning",
      "url": "https://redskycleaning.com/about/",
      "description": "Atlanta-based, family-owned residential cleaning company. Background-checked cleaners, eco-friendly products, satisfaction guaranteed.",
      "mainEntity": {
        "@type": "CleaningService",
        "@id": "https://redskycleaning.com/#business",
        "name": "Red Sky Cleaning",
        "telephone": "+1-470-240-0645",
        "email": "support@redskycleaning.com",
        "areaServed": "Atlanta metro, GA"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://redskycleaning.com/" },
        { "@type": "ListItem", "position": 2, "name": "About", "item": "https://redskycleaning.com/about/" }
      ]
    }
  ];

  const body = `
<section class="rs-section">
  <div class="rs-container rs-container--narrow">
    <header class="rs-section__head" style="text-align:left;">
      <p class="rs-eyebrow">Why Red Sky</p>
      <h2>Cleaning that earns your trust the first time, and every time after.</h2>
      <p class="rs-section__sub">We&rsquo;re an Atlanta-based residential cleaning company built around three boring promises: show up when we said, follow the same checklist every visit, and leave the home spotless &mdash; or come back the next day and fix it.</p>
    </header>

    <div class="rs-includes-grid">
      <div class="rs-includes-grid__main">
        <section class="rs-room-section">
          <h4>Our story</h4>
          <p>Red Sky was started in Atlanta by a small team that had grown tired of cleaning companies that ghosted, overcharged, or sent a different stranger every visit. We built the company we wanted to hire: transparent flat pricing, the same vetted crew on recurring visits, eco-friendly products by default, and a 24-hour re-clean guarantee in writing.</p>
          <p style="margin-top:var(--space-3);font-style:italic;color:var(--rs-ink-soft);">[PLACEHOLDER &mdash; founder bio + photo to be supplied by owner.]</p>
        </section>

        <section class="rs-room-section">
          <h4>How we vet our team</h4>
          <ul class="rs-check-list">
            <li>Multi-step interview &mdash; experience, references, and a paid in-home trial clean</li>
            <li>Nationwide background check + Georgia driving record review</li>
            <li>Two weeks of paired training before any solo visit</li>
            <li>Quarterly retraining on new products + checklist updates</li>
            <li>Every cleaner is a W-2 employee, not a contractor &mdash; fully insured, fully bonded</li>
          </ul>
        </section>

        <section class="rs-room-section">
          <h4>Products we use</h4>
          <ul class="rs-check-list">
            <li>EPA Safer Choice certified all-purpose cleaners as the default for every clean</li>
            <li>Plant-based degreasers for kitchens; oxygen bleach (no chlorine) for bathrooms</li>
            <li>Microfiber color-coded by zone (kitchen / bath / glass / dust) to prevent cross-contamination</li>
            <li>HEPA-filtered vacuums on every truck</li>
            <li>Pet-, kid-, and asthma-safe formulations available on request at no extra charge</li>
          </ul>
        </section>

        <section class="rs-room-section">
          <h4>Insurance &amp; bonding</h4>
          <p>Red Sky carries $2M general liability, workers&rsquo; compensation on every cleaner, and a janitorial bond covering theft and damage. A certificate of insurance can be issued to your HOA, building, or property manager on request &mdash; just email <a href="mailto:support@redskycleaning.com">support@redskycleaning.com</a>.</p>
        </section>

        <section class="rs-room-section">
          <h4>Our service area</h4>
          <p>We clean homes across the Atlanta metro: <a href="/areas/alpharetta/">Alpharetta</a>, <a href="/areas/johns-creek/">Johns Creek</a>, <a href="/areas/marietta/">Marietta</a>, <a href="/areas/buckhead/">Buckhead</a>, <a href="/areas/lawrenceville/">Lawrenceville</a>, <a href="/areas/buford/">Buford</a>, <a href="/areas/canton/">Canton</a>, <a href="/areas/gainesville/">Gainesville</a>, <a href="/areas/dawsonville/">Dawsonville</a>, and <a href="/areas/winder/">Winder</a>. Not sure if we&rsquo;re in your ZIP? <a href="/quote/">Check coverage in 5 seconds</a>.</p>
        </section>
      </div>

      <aside class="rs-not-included" aria-labelledby="about-side">
        <h3 id="about-side" style="font-family:var(--font-display);font-size:var(--text-md);margin-bottom:var(--space-3);">Quick facts</h3>
        <ul class="rs-x-list" style="list-style:none;padding:0;">
          <li style="padding-left:0;">&middot; Family-owned, Atlanta-based</li>
          <li style="padding-left:0;">&middot; W-2 employees (no contractors)</li>
          <li style="padding-left:0;">&middot; $2M general liability + bonded</li>
          <li style="padding-left:0;">&middot; EPA Safer Choice products</li>
          <li style="padding-left:0;">&middot; 24-hour re-clean guarantee</li>
          <li style="padding-left:0;">&middot; Same crew on recurring visits</li>
        </ul>
        <button class="rs-btn rs-btn--cta rs-btn--block" type="button" data-rs-open-quote style="margin-top:var(--space-4);">Get instant quote</button>
        <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);margin-top:var(--space-2);">Or call <a href="tel:+14702400645">(470) 240-0645</a></p>
      </aside>
    </div>
  </div>
</section>`;

  return pageShell({
    title: "About Red Sky Cleaning | Atlanta House Cleaning Company",
    description: "Family-owned Atlanta cleaning company. Background-checked W-2 employees, EPA Safer Choice products, $2M insured, 24-hour re-clean guarantee.",
    canonical: "https://redskycleaning.com/about/",
    h1: "Atlanta cleaners you can actually trust.",
    navActive: "about",
    jsonLdBlocks: ld,
    breadcrumb: "About",
    body
  });
}

// ---------- Checklist (50-point) ----------

const CHECKLIST_GROUPS = [
  {
    room: "Kitchen (12)",
    items: [
      "Countertops cleaned, disinfected, and dried streak-free",
      "Sink + faucet scrubbed, descaled, and polished",
      "Stovetop, knobs, and drip pans degreased",
      "Microwave wiped inside and out",
      "Outside of oven, dishwasher, and refrigerator wiped",
      "Cabinet fronts spot-cleaned (full wipe on deep clean)",
      "Backsplash de-greased and shined",
      "Small appliances (toaster, kettle, coffee maker) wiped",
      "Floor swept, vacuumed, and mopped",
      "Trash and recycling emptied; liners replaced",
      "Light switches and door handles disinfected",
      "Baseboards dusted (full wipe on deep clean)"
    ]
  },
  {
    room: "Bathrooms (10)",
    items: [
      "Tub + shower scrubbed; tile and grout treated",
      "Glass doors squeegeed; shower head descaled",
      "Toilet bowl, seat, base, and behind-the-tank disinfected",
      "Vanity countertop and sink scrubbed and polished",
      "Mirror and chrome polished streak-free",
      "Cabinet exteriors spot-cleaned",
      "Floor swept and mopped along edges and behind toilet",
      "Trash emptied; liner replaced",
      "Towels neatly folded or replaced (if left out)",
      "Exhaust fan grille dusted (full clean on deep clean)"
    ]
  },
  {
    room: "Bedrooms (8)",
    items: [
      "Beds made or linens changed (linens left on the bed)",
      "Nightstands and dressers wiped and dust-free",
      "Mirrors polished",
      "Headboards and bed frames dusted",
      "Lamps and lampshades dusted",
      "Floors vacuumed (rugs included) and edges detailed",
      "Hard floors mopped",
      "Trash emptied"
    ]
  },
  {
    room: "Living &amp; common areas (10)",
    items: [
      "All horizontal surfaces dusted, including shelves and decor",
      "TVs and electronics dusted with microfiber (no spray)",
      "Cushions fluffed; under-cushion debris vacuumed",
      "Throw pillows and blankets straightened",
      "Glass tables and mirrors polished streak-free",
      "Light switches, remotes, and door handles disinfected",
      "Baseboards dusted along walkways",
      "Cobwebs removed from corners and ceilings",
      "Floors vacuumed; rugs detailed",
      "Hard floors mopped"
    ]
  },
  {
    room: "Whole-home essentials (10)",
    items: [
      "All accessible light fixtures and ceiling fans dusted",
      "Window sills and ledges wiped",
      "Interior doors and door frames spot-cleaned",
      "Stair treads and railings dusted and wiped",
      "Air vents and returns dusted",
      "Trash emptied throughout; bins relined",
      "Entry mats shaken and vacuumed",
      "Final walkthrough by lead cleaner before leaving",
      "Photo report sent within 1 hour (recurring clients)",
      "Re-clean dispatched within 24 hours if anything was missed"
    ]
  }
];

function checklistPage() {
  const allSteps = [];
  let pos = 1;
  for (const g of CHECKLIST_GROUPS) {
    for (const item of g.items) {
      allSteps.push({
        "@type": "HowToStep",
        "position": pos++,
        "name": item.replace(/&[a-z]+;/g, ""),
        "text": item.replace(/&[a-z]+;/g, "")
      });
    }
  }

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Red Sky Cleaning 50-point checklist",
      "description": "The complete 50-point room-by-room checklist that every Red Sky standard cleaning visit follows.",
      "totalTime": "PT2H30M",
      "step": allSteps
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://redskycleaning.com/" },
        { "@type": "ListItem", "position": 2, "name": "Checklist", "item": "https://redskycleaning.com/checklist/" }
      ]
    }
  ];

  const groupsHtml = CHECKLIST_GROUPS.map((g) => `
        <section class="rs-room-section">
          <h4>${g.room}</h4>
          <ul class="rs-check-list">
            ${g.items.map((it) => `<li>${it}</li>`).join("\n            ")}
          </ul>
        </section>`).join("\n");

  const body = `
<section class="rs-section">
  <div class="rs-container">
    <header class="rs-section__head" style="text-align:left;">
      <p class="rs-eyebrow">50 points, every visit</p>
      <h2>The same checklist your home gets, in writing.</h2>
      <p class="rs-section__sub">Every standard clean follows this exact list. Deep cleans add cabinet interiors, baseboards, and behind-furniture detail. Move-in/out cleans add appliance interiors and inside windows. Print this for your records or save the page.</p>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-top:var(--space-4);">
        <button class="rs-btn rs-btn--cta" type="button" data-rs-open-quote>Book this clean</button>
        <button class="rs-btn rs-btn--secondary" type="button" onclick="window.print()">Print checklist</button>
      </div>
    </header>

    <div class="rs-includes-grid">
      <div class="rs-includes-grid__main">${groupsHtml}
      </div>
      <aside class="rs-not-included" aria-labelledby="cl-side">
        <h3 id="cl-side" style="font-family:var(--font-display);font-size:var(--text-md);margin-bottom:var(--space-3);">Add-ons</h3>
        <p>Need something this list doesn&rsquo;t cover? Inside oven, inside fridge, interior windows, laundry, dish wash, blinds &mdash; all available as add-ons in the quote tool.</p>
        <ul class="rs-x-list">
          <li>Carpet shampooing (separate vendor)</li>
          <li>Exterior windows above 2 stories</li>
          <li>Biohazard / construction debris</li>
          <li>Mold remediation</li>
        </ul>
      </aside>
    </div>
  </div>
</section>

<style media="print">
  .rs-hdr, .rs-footer, .rs-cta-band, .rs-skip, .rs-page-hero { display:none !important; }
  .rs-not-included { display:none !important; }
  body { background:#fff; color:#000; }
  .rs-section { padding:0 !important; }
  .rs-room-section { page-break-inside:avoid; }
</style>`;

  return pageShell({
    title: "50-Point Cleaning Checklist | Red Sky Cleaning Atlanta",
    description: "The complete 50-point room-by-room checklist every Red Sky cleaning visit follows. Print or save for your records.",
    canonical: "https://redskycleaning.com/checklist/",
    h1: "Our 50-point cleaning checklist.",
    navActive: "checklist",
    jsonLdBlocks: ld,
    breadcrumb: "Checklist",
    body
  });
}

// ---------- Guarantee ----------

function guaranteePage() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Offer",
      "name": "24-Hour Re-Clean Guarantee",
      "description": "If anything on the 50-point checklist is missed or unsatisfactory, Red Sky returns within 24 hours and re-cleans the affected areas at no charge.",
      "category": "Service guarantee",
      "seller": {
        "@type": "CleaningService",
        "@id": "https://redskycleaning.com/#business",
        "name": "Red Sky Cleaning"
      },
      "validFrom": "2025-01-01",
      "areaServed": "Atlanta metro, GA"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://redskycleaning.com/" },
        { "@type": "ListItem", "position": 2, "name": "Guarantee", "item": "https://redskycleaning.com/guarantee/" }
      ]
    }
  ];

  const body = `
<section class="rs-section">
  <div class="rs-container rs-container--narrow">
    <header class="rs-section__head" style="text-align:left;">
      <p class="rs-eyebrow">In writing</p>
      <h2>The 24-hour re-clean guarantee.</h2>
      <p class="rs-section__sub">If we miss anything on the 50-point checklist, tell us within 24 hours and we&rsquo;ll be back the next day to re-clean the affected areas &mdash; at no charge, no questions asked.</p>
    </header>

    <article class="rs-room-section" style="background:var(--rs-paper-soft);padding:var(--space-6);border:1px solid var(--rs-line);border-radius:var(--radius-lg);">
      <h4 style="display:flex;align-items:center;gap:var(--space-2);"><svg width="22" height="22" aria-hidden="true"><use href="#i-shield"/></svg> What you get, in writing</h4>
      <ul class="rs-check-list">
        <li>Re-clean of any missed area within 24 hours of your original appointment</li>
        <li>No charge, no deductible, no &ldquo;maintenance fee&rdquo;</li>
        <li>If the re-clean still doesn&rsquo;t hit the mark, the original visit is refunded in full</li>
        <li>Applies to every clean we do &mdash; standard, deep, move-in, move-out, recurring</li>
        <li>Available 7 days a week including the day of, the next morning, or any time within the 24-hour window</li>
      </ul>
    </article>

    <section class="rs-room-section">
      <h4>How to use it</h4>
      <ol class="rs-check-list" style="list-style:decimal inside;">
        <li>Walk through your home after the cleaners leave.</li>
        <li>If anything was missed, text or email <a href="mailto:support@redskycleaning.com">support@redskycleaning.com</a> within 24 hours with a quick photo.</li>
        <li>We&rsquo;ll confirm a return visit within 1 business hour. The cleaner is back the next day, usually sooner.</li>
        <li>The same crew returns, fixes the area, and confirms with you before leaving.</li>
      </ol>
    </section>

    <section class="rs-room-section">
      <h4>What&rsquo;s not covered</h4>
      <ul class="rs-x-list">
        <li>Items that aren&rsquo;t on the 50-point checklist (these need to be booked as add-ons up front)</li>
        <li>Areas that were inaccessible at the time of the visit (locked rooms, blocked floors)</li>
        <li>Pre-existing damage, stains, or wear &mdash; we document these on arrival when found</li>
        <li>Issues reported more than 24 hours after the original visit</li>
      </ul>
    </section>

    <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);font-style:italic;margin-top:var(--space-4);">Last updated: April 2026. Policy applies to all bookings made after this date. Terms summarized for clarity; full policy in our <a href="/terms/">Terms of Service</a>.</p>
  </div>
</section>`;

  return pageShell({
    title: "24-Hour Re-Clean Guarantee | Red Sky Cleaning Atlanta",
    description: "Our 24-hour re-clean guarantee in writing. If we miss anything on the 50-point checklist, we return within 24 hours at no charge.",
    canonical: "https://redskycleaning.com/guarantee/",
    h1: "The 24-hour re-clean guarantee.",
    navActive: null,
    jsonLdBlocks: ld,
    breadcrumb: "Guarantee",
    body
  });
}

// ---------- FAQ ----------

const FAQ_GROUPS = [
  {
    name: "Booking &amp; pricing",
    items: [
      { q: "How does flat pricing work?", a: "You tell us the home size, frequency, and any add-ons; the calculator returns a flat all-in price. That&rsquo;s what you pay &mdash; no upcharges on the day of, no surprise fees, no tip required." },
      { q: "Can I book online without talking to anyone?", a: "Yes. The instant quote tool prices your clean and books a real time slot in under 60 seconds. We confirm with a text within minutes; no phone call required unless you want one." },
      { q: "How far in advance should I book?", a: "Most homes book 3&ndash;5 days out. Same-day and next-day slots are sometimes available; the calendar in the quote tool shows live openings." }
    ]
  },
  {
    name: "Cleaners &amp; team",
    items: [
      { q: "Are your cleaners background-checked?", a: "Every cleaner passes a nationwide criminal background check, a Georgia driving record review, and an in-home trial clean before they touch a paying client&rsquo;s home." },
      { q: "Will I get the same cleaner each visit?", a: "On recurring plans, yes &mdash; the same lead cleaner is assigned to your home every visit. If they&rsquo;re ever out, you&rsquo;ll be notified before the visit and a vetted backup is sent with a copy of your home&rsquo;s preferences." },
      { q: "Are cleaners employees or contractors?", a: "Employees, on a W-2 with workers&rsquo; comp, payroll taxes, and benefits. We don&rsquo;t use 1099 contractors. It costs us more but it&rsquo;s the right way to run a cleaning business in 2026." }
    ]
  },
  {
    name: "Day of the clean",
    items: [
      { q: "Do I need to be home?", a: "Not at all. Most clients give us a code, lockbox combo, or hide-a-key. We send you a photo when the team arrives and another when they finish." },
      { q: "What about pets?", a: "Pets are welcome. Tell us in the quote tool if your pet is anxious or shouldn&rsquo;t be in the same room as cleaners and we&rsquo;ll plan accordingly. We use pet-safe products by default." },
      { q: "What time will the cleaners arrive?", a: "You pick a 2-hour window when booking (8&ndash;10 a.m., 10 a.m.&ndash;noon, noon&ndash;2 p.m., 2&ndash;4 p.m.). We&rsquo;ll text 30 minutes before arrival." }
    ]
  },
  {
    name: "Cancellations &amp; rescheduling",
    items: [
      { q: "Can I reschedule a visit?", a: "Yes &mdash; reschedule any time more than 24 hours before the visit at no charge, right from the confirmation text. Inside 24 hours we charge a $30 short-notice fee to cover the cleaner&rsquo;s lost shift." },
      { q: "How do I cancel a recurring plan?", a: "No contracts, no cancellation fees. Email or text us before your next scheduled visit; the plan ends immediately. You only pay the recurring discount on visits already completed." },
      { q: "What if I need to skip one visit?", a: "Skip individual visits without losing your recurring discount, as long as you don&rsquo;t skip more than two in a row. After that we move you to a longer cadence to keep the price honest." }
    ]
  },
  {
    name: "Insurance &amp; safety",
    items: [
      { q: "Are you insured?", a: "Yes. $2M general liability, workers&rsquo; comp on every cleaner, and a janitorial bond covering theft and damage. A certificate of insurance is available for your HOA or building on request." },
      { q: "What if something gets broken?", a: "Tell us within 24 hours with a photo. For damage clearly caused by us, we replace the item or reimburse you at the verified replacement value. We document any pre-existing wear we find on arrival." },
      { q: "Do you carry workers&rsquo; comp?", a: "Yes &mdash; on every cleaner, every visit. If a cleaner is injured in your home, you&rsquo;re fully protected from liability." }
    ]
  },
  {
    name: "Eco &amp; products",
    items: [
      { q: "Are your products safe for kids and pets?", a: "Our default lineup is EPA Safer Choice certified and safe for kids, pets, and people with asthma. Tell us in the quote tool if anyone in the home has a sensitivity and we&rsquo;ll switch to fragrance-free." },
      { q: "Do you use bleach?", a: "Only on request. Our default is oxygen bleach (sodium percarbonate) for whitening &mdash; effective, but no chlorine fumes and safe to use around fabric and grout." },
      { q: "Can I provide my own products?", a: "Yes, just leave them out and let us know in the booking notes. There&rsquo;s no price discount for self-provided supplies; we still bring backups in case something runs out." }
    ]
  },
  {
    name: "Quality &amp; the guarantee",
    items: [
      { q: "What&rsquo;s the 24-hour re-clean guarantee?", a: "If anything on the 50-point checklist is missed, we return within 24 hours and re-clean the affected areas at no charge. <a href='/guarantee/'>Read the full guarantee policy</a>." },
      { q: "Do you take before/after photos?", a: "On move-in/out cleans and on first visits for recurring clients, yes &mdash; the lead cleaner sends you a photo report within 1 hour of finishing." },
      { q: "How do I leave feedback?", a: "Every visit ends with a 1-tap rating link in the closeout text. Anything below 5 stars triggers a callback from the owner within 1 business hour." }
    ]
  }
];

function faqPage() {
  const allFaqs = FAQ_GROUPS.flatMap((g) => g.items);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allFaqs.map((f) => ({
        "@type": "Question",
        "name": f.q.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, ""),
        "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "") }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://redskycleaning.com/" },
        { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://redskycleaning.com/faq/" }
      ]
    }
  ];

  const groupsHtml = FAQ_GROUPS.map((g, gi) => `
    <section class="rs-room-section" id="faq-g${gi}">
      <h4>${g.name}</h4>
      <ul class="rs-accordion" style="list-style:none;padding:0;margin:0;">
        ${g.items.map((f, i) => `
        <li class="rs-accordion__item">
          <button class="rs-accordion__trigger" type="button" aria-expanded="false" aria-controls="ans-${gi}-${i}">${f.q}</button>
          <div class="rs-accordion__panel" id="ans-${gi}-${i}" role="region"><p>${f.a}</p></div>
        </li>`).join("")}
      </ul>
    </section>`).join("\n");

  const body = `
<section class="rs-section">
  <div class="rs-container rs-container--narrow">
    <header class="rs-section__head" style="text-align:left;">
      <p class="rs-eyebrow">21 questions, plain answers</p>
      <h2>Everything people ask before they book.</h2>
      <p class="rs-section__sub">If your question isn&rsquo;t here, text us at <a href="tel:+14702400645">(470) 240-0645</a> or email <a href="mailto:support@redskycleaning.com">support@redskycleaning.com</a>. We answer within 1 business hour, every time.</p>
    </header>
${groupsHtml}
  </div>
</section>`;

  return pageShell({
    title: "FAQ | Red Sky Cleaning Atlanta",
    description: "21 plain answers to the questions Atlanta homeowners ask before booking a cleaner: pricing, vetting, insurance, eco products, and the re-clean guarantee.",
    canonical: "https://redskycleaning.com/faq/",
    h1: "Frequently asked questions.",
    navActive: "faq",
    jsonLdBlocks: ld,
    breadcrumb: "FAQ",
    body
  });
}

// ---------- Contact ----------

function contactPage() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Red Sky Cleaning",
      "url": "https://redskycleaning.com/contact/",
      "mainEntity": {
        "@type": "CleaningService",
        "@id": "https://redskycleaning.com/#business",
        "name": "Red Sky Cleaning",
        "telephone": "+1-470-240-0645",
        "email": "support@redskycleaning.com",
        "address": { "@type": "PostalAddress", "addressLocality": "Atlanta", "addressRegion": "GA", "addressCountry": "US" },
        "openingHoursSpecification": [
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "07:00", "closes": "18:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "08:00", "closes": "16:00" }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://redskycleaning.com/" },
        { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://redskycleaning.com/contact/" }
      ]
    }
  ];

  const body = `
<section class="rs-section">
  <div class="rs-container">
    <div class="rs-includes-grid">
      <div class="rs-includes-grid__main">
        <header class="rs-section__head" style="text-align:left;">
          <p class="rs-eyebrow">Get in touch</p>
          <h2>Talk to a real Atlantan, fast.</h2>
          <p class="rs-section__sub">Text or call <a href="tel:+14702400645">(470) 240-0645</a> &mdash; the fastest way to reach us. Or use the form below; we reply within 1 business hour, Mon&ndash;Sat.</p>
        </header>

        <form class="rs-contact-form" id="rscContactForm" action="#" method="post" novalidate>
          <div class="rs-form-row">
            <label for="rsc-name">Name <span aria-hidden="true">*</span><span class="rs-sr-only">required</span>
              <input id="rsc-name" name="name" type="text" autocomplete="name" required>
            </label>
            <label for="rsc-email">Email <span aria-hidden="true">*</span><span class="rs-sr-only">required</span>
              <input id="rsc-email" name="email" type="email" autocomplete="email" inputmode="email" required>
            </label>
          </div>
          <div class="rs-form-row">
            <label for="rsc-phone">Phone (optional)
              <input id="rsc-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel">
            </label>
            <label for="rsc-zip">ZIP (optional)
              <input id="rsc-zip" name="zip" type="text" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="postal-code">
            </label>
          </div>
          <label for="rsc-msg">How can we help? <span aria-hidden="true">*</span><span class="rs-sr-only">required</span>
            <textarea id="rsc-msg" name="message" rows="5" required></textarea>
          </label>
          <label class="rs-honeypot" aria-hidden="true">
            Leave this field empty <input type="text" name="company" tabindex="-1" autocomplete="off">
          </label>
          <div class="rs-form-actions">
            <button class="rs-btn rs-btn--cta rs-btn--lg" type="submit">Send message</button>
            <p class="rs-form-fine">We never share your info. Replies usually inside 1 business hour.</p>
          </div>
          <p class="rs-form-status" id="rscContactStatus" role="status" aria-live="polite"></p>
        </form>
      </div>

      <aside class="rs-not-included" aria-labelledby="contact-side">
        <h3 id="contact-side" style="font-family:var(--font-display);font-size:var(--text-md);margin-bottom:var(--space-3);">Reach us directly</h3>
        <p style="margin:0 0 var(--space-2);"><strong>Phone &middot; text</strong><br><a href="tel:+14702400645">(470) 240-0645</a></p>
        <p style="margin:0 0 var(--space-2);"><strong>Email</strong><br><a href="mailto:support@redskycleaning.com">support@redskycleaning.com</a></p>
        <p style="margin:0 0 var(--space-2);"><strong>Hours</strong><br>Mon&ndash;Fri 7 a.m.&ndash;6 p.m.<br>Sat 8 a.m.&ndash;4 p.m.<br>Closed Sunday</p>
        <p style="margin:0 0 var(--space-3);"><strong>Service area</strong><br>Atlanta metro &mdash; <a href="/areas/">all 10 cities</a></p>
        <button class="rs-btn rs-btn--cta rs-btn--block" type="button" data-rs-open-quote>Get instant quote instead</button>
      </aside>
    </div>
  </div>
</section>

<script>
(function(){
  var form = document.getElementById('rscContactForm');
  var status = document.getElementById('rscContactStatus');
  if (!form) return;
  form.addEventListener('submit', async function(ev){
    ev.preventDefault();
    if (form.company && form.company.value) { return; } // honeypot
    var fd = new FormData(form);
    var payload = Object.fromEntries(fd.entries());
    payload._page = location.pathname;
    payload._submitted_at = new Date().toISOString();
    status.textContent = 'Sending...';
    var endpoint = null;
    try {
      var r = await fetch('/config/endpoints.json', { cache: 'no-store' });
      if (r.ok) { var cfg = await r.json(); endpoint = cfg.contact_webhook; }
    } catch(e){}
    if (!endpoint || /YOUR_.*_HERE/.test(endpoint)) {
      status.innerHTML = "Form not yet wired to a webhook. <a href='mailto:support@redskycleaning.com'>Email us</a> or call <a href='tel:+14702400645'>(470) 240-0645</a> &mdash; we reply within an hour.";
      status.classList.add('is-warn');
      return;
    }
    try {
      var rr = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!rr.ok) throw new Error('bad status ' + rr.status);
      status.textContent = "Got it &mdash; we'll reply within 1 business hour.";
      status.classList.add('is-ok');
      form.reset();
      if (window.dataLayer) window.dataLayer.push({ event:'submit_contact' });
    } catch(err) {
      status.innerHTML = "Couldn't send. <a href='mailto:support@redskycleaning.com'>Email us</a> or call <a href='tel:+14702400645'>(470) 240-0645</a>.";
      status.classList.add('is-err');
    }
  });
})();
</script>`;

  return pageShell({
    title: "Contact Red Sky Cleaning | Atlanta House Cleaning",
    description: "Text, call, or message Red Sky Cleaning. (470) 240-0645 or support@redskycleaning.com. Replies within 1 business hour, Mon-Sat.",
    canonical: "https://redskycleaning.com/contact/",
    h1: "Contact Red Sky Cleaning.",
    navActive: null,
    jsonLdBlocks: ld,
    breadcrumb: "Contact",
    body
  });
}

// ---------- 404 ----------

function notFoundPage() {
  const body = `
<section class="rs-section">
  <div class="rs-container rs-container--narrow" style="text-align:center;">
    <p class="rs-eyebrow">404</p>
    <h2>That page wandered off.</h2>
    <p class="rs-section__sub">The link you followed may be broken or the page may have moved. Try one of these instead:</p>
    <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);justify-content:center;margin:var(--space-6) 0;">
      <a class="rs-btn rs-btn--cta" href="/">Home</a>
      <a class="rs-btn rs-btn--secondary" href="/services/">All services</a>
      <a class="rs-btn rs-btn--secondary" href="/areas/">Service areas</a>
      <a class="rs-btn rs-btn--secondary" href="/faq/">FAQ</a>
      <button class="rs-btn rs-btn--secondary" type="button" data-rs-open-quote>Get a quote</button>
    </div>
    <p style="font-size:var(--text-sm);color:var(--rs-ink-soft);">Still stuck? Call <a href="tel:+14702400645">(470) 240-0645</a> &mdash; a real person picks up.</p>
  </div>
</section>`;

  return pageShell({
    title: "Page not found | Red Sky Cleaning",
    description: "The page you requested could not be found.",
    canonical: "https://redskycleaning.com/404",
    h1: "Page not found.",
    navActive: null,
    jsonLdBlocks: [],
    breadcrumb: null,
    body,
    noindex: true
  });
}

// ---------- Privacy ----------

function privacyPage() {
  const body = `
<section class="rs-section">
  <div class="rs-container rs-container--narrow">
    <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);">Last updated: April 2026</p>

    <section class="rs-room-section"><h4>What we collect</h4><p>When you book a cleaning, we collect your name, address, email, phone, home details (size, layout, pets, parking notes), and payment information through our payment processor. We collect nothing more than what&rsquo;s needed to clean your home and bill you.</p></section>

    <section class="rs-room-section"><h4>How we use it</h4><p>To schedule and perform your cleaning, send confirmations and reminders, process payment, send a closeout report, and respond to questions. With your consent, we may also send occasional service updates &mdash; you can unsubscribe from any email at the bottom of the message.</p></section>

    <section class="rs-room-section"><h4>How we share it</h4><p>We don&rsquo;t sell your personal information. We share it only with the cleaning team assigned to your home, our payment processor (Stripe), our scheduling and email tools, and law enforcement if legally required. Each vendor is contractually bound to use your data only for the purpose we hired them for.</p></section>

    <section class="rs-room-section"><h4>Your rights</h4><p>You can request a copy of the data we have about you, ask us to correct it, or ask us to delete it &mdash; just email <a href="mailto:support@redskycleaning.com">support@redskycleaning.com</a> from the address on file. We respond within 30 days.</p></section>

    <section class="rs-room-section"><h4>Cookies &amp; analytics</h4><p>We use Google Analytics 4 and Microsoft Clarity to understand how the site is used, and Google Tag Manager to manage these. Analytics cookies are off until you accept the cookie banner; required cookies (booking session, CSRF) are always on because the site can&rsquo;t function without them.</p></section>

    <section class="rs-room-section"><h4>Children</h4><p>This site is not intended for anyone under 13 and we do not knowingly collect data from children.</p></section>

    <section class="rs-room-section"><h4>Contact</h4><p>Questions about this policy: <a href="mailto:support@redskycleaning.com">support@redskycleaning.com</a> or (470) 240-0645.</p></section>

    <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);font-style:italic;margin-top:var(--space-4);">[PLACEHOLDER &mdash; this is a starter privacy policy. Owner should have it reviewed by a Georgia attorney before launch and replace this notice with the final reviewed version.]</p>
  </div>
</section>`;

  return pageShell({
    title: "Privacy Policy | Red Sky Cleaning",
    description: "How Red Sky Cleaning collects, uses, and protects your personal information.",
    canonical: "https://redskycleaning.com/privacy/",
    h1: "Privacy policy.",
    navActive: null,
    jsonLdBlocks: [],
    breadcrumb: "Privacy",
    body,
    noindex: true
  });
}

// ---------- Terms ----------

function termsPage() {
  const body = `
<section class="rs-section">
  <div class="rs-container rs-container--narrow">
    <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);">Last updated: April 2026</p>

    <section class="rs-room-section"><h4>Acceptance</h4><p>By booking a cleaning with Red Sky Cleaning (&ldquo;Red Sky,&rdquo; &ldquo;we&rdquo;) you agree to these Terms.</p></section>

    <section class="rs-room-section"><h4>Pricing &amp; payment</h4><p>The price quoted in the calculator is the price you pay, provided the home matches the details you entered. If the home is materially larger than booked, or has conditions that weren&rsquo;t disclosed (heavy mold, biohazard, hoarding), we&rsquo;ll call before starting and either adjust the price or reschedule. Payment is captured on the day of service.</p></section>

    <section class="rs-room-section"><h4>Rescheduling &amp; cancellations</h4><p>Reschedule any time more than 24 hours before the visit at no charge. Inside 24 hours, a $30 short-notice fee applies. No-shows (we arrive and can&rsquo;t access the home) are charged at 50% of the booking. Recurring plans can be cancelled at any time by email or text &mdash; no contract.</p></section>

    <section class="rs-room-section"><h4>The 24-hour re-clean guarantee</h4><p>If anything on our 50-point checklist is missed, tell us within 24 hours and we&rsquo;ll re-clean the affected areas at no charge. Full policy at <a href="/guarantee/">/guarantee/</a>.</p></section>

    <section class="rs-room-section"><h4>Damage &amp; liability</h4><p>Our cleaners are W-2 employees covered by $2M general liability and workers&rsquo; comp. For damage clearly caused by us, we replace or reimburse at the verified replacement value. We don&rsquo;t move heavy furniture or appliances unless explicitly requested in writing; pre-existing damage we find on arrival is photographed and noted.</p></section>

    <section class="rs-room-section"><h4>Items left out</h4><p>Please secure cash, jewelry, prescription medication, firearms, and irreplaceable items before the visit.</p></section>

    <section class="rs-room-section"><h4>Eligibility &amp; access</h4><p>You must be 18 or older to book. You agree the address is yours or you have permission to authorize cleaning at that address. Access (key, code, lockbox) you provide is used solely for the visit.</p></section>

    <section class="rs-room-section"><h4>Disputes</h4><p>Any dispute is governed by the laws of the State of Georgia and resolved in the state or federal courts located in Fulton County, Georgia.</p></section>

    <section class="rs-room-section"><h4>Changes</h4><p>We may update these Terms; the &ldquo;Last updated&rdquo; date will reflect the change. Material changes are emailed to active recurring clients.</p></section>

    <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);font-style:italic;margin-top:var(--space-4);">[PLACEHOLDER &mdash; this is a starter terms document. Owner should have it reviewed by a Georgia attorney before launch and replace this notice with the final reviewed version.]</p>
  </div>
</section>`;

  return pageShell({
    title: "Terms of Service | Red Sky Cleaning",
    description: "The terms governing Red Sky Cleaning bookings and recurring plans.",
    canonical: "https://redskycleaning.com/terms/",
    h1: "Terms of service.",
    navActive: null,
    jsonLdBlocks: [],
    breadcrumb: "Terms",
    body,
    noindex: true
  });
}

// ---------- Main ----------

const pages = [
  { dir: "about",     html: aboutPage() },
  { dir: "checklist", html: checklistPage() },
  { dir: "guarantee", html: guaranteePage() },
  { dir: "faq",       html: faqPage() },
  { dir: "contact",   html: contactPage() },
  { dir: "privacy",   html: privacyPage() },
  { dir: "terms",     html: termsPage() },
];

let count = 0;
for (const p of pages) {
  const dir = path.join(ROOT, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, p.html, "utf8");
  console.log("[build] wrote", path.relative(ROOT, file), "(" + p.html.length + " bytes)");
  count++;
}

// 404 lives at root, not under /404/
const fourOhFourPath = path.join(ROOT, "404.html");
fs.writeFileSync(fourOhFourPath, notFoundPage(), "utf8");
console.log("[build] wrote 404.html");
count++;

console.log("[build] done — " + count + " trust pages.");
