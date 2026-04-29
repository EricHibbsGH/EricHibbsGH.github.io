// scripts/build-service-pages.mjs
// Reads services/_data.json + config/pricing.json, emits 5 service pages:
//   services/{standard,deep,move-in,move-out,recurring}/index.html
// Run: `node scripts/build-service-pages.mjs`

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const data = JSON.parse(fs.readFileSync(path.join(ROOT, "services/_data.json"), "utf8"));
const pricing = JSON.parse(fs.readFileSync(path.join(ROOT, "config/pricing.json"), "utf8"));

const slugs = ["standard", "deep", "move-in", "move-out", "recurring"];

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function jsonLdServiceBlock(svc) {
  const block = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": svc.schemaServiceName,
    "serviceType": svc.schemaServiceType,
    "description": svc.schemaDescription,
    "provider": { "@type": "CleaningService", "@id": "https://redskycleaning.com/#business", "name": "Red Sky Cleaning" },
    "areaServed": [
      { "@type": "City", "name": "Atlanta, GA" },
      { "@type": "City", "name": "Alpharetta, GA" },
      { "@type": "City", "name": "Johns Creek, GA" },
      { "@type": "City", "name": "Marietta, GA" },
      { "@type": "City", "name": "Lawrenceville, GA" },
      { "@type": "City", "name": "Buckhead, GA" },
      { "@type": "City", "name": "Buford, GA" },
      { "@type": "City", "name": "Canton, GA" },
      { "@type": "City", "name": "Gainesville, GA" },
      { "@type": "City", "name": "Dawsonville, GA" },
      { "@type": "City", "name": "Winder, GA" }
    ],
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": String(svc.priceFrom),
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "minPrice": svc.priceFrom
      }
    }
  };
  return JSON.stringify(block, null, 2);
}

function jsonLdBreadcrumb(svc) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",     "item": "https://redskycleaning.com/" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://redskycleaning.com/services/" },
      { "@type": "ListItem", "position": 3, "name": svc.h1,     "item": "https://redskycleaning.com/services/" + svc.slug + "/" }
    ]
  }, null, 2);
}

function jsonLdFaqPage(svc) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": svc.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  }, null, 2);
}

function renderHeader(svc) {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <symbol id="i-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
  </defs>
</svg>
<a href="#main" class="rs-skip">Skip to content</a>
<header class="rs-hdr" id="header">
  <div class="rs-hdr__inner">
    <a href="/" class="rs-hdr__logo" aria-label="Red Sky Cleaning home"><img src="/logo.png" alt="Red Sky Cleaning" width="160" height="60"></a>
    <button class="rs-hdr__toggle" id="hdrToggle" aria-label="Open menu" aria-expanded="false" aria-controls="hdrNav"><span></span><span></span><span></span></button>
    <nav class="rs-hdr__nav" id="hdrNav" aria-label="Main">
      <ul>
        <li><a href="/services/" aria-current="page">Services</a></li>
        <li><a href="/areas/">Areas</a></li>
        <li><a href="/checklist/">Checklist</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/#reviews">Reviews</a></li>
      </ul>
      <div class="rs-hdr__cta">
        <a href="tel:+14702400645" class="rs-hdr__phone"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
        <button class="rs-btn rs-btn--cta rs-btn--sm" type="button" data-rs-open-quote data-rs-prefill-service="${svc.drawerService}">Get instant quote</button>
      </div>
    </nav>
  </div>
</header>`;
}

function renderFooter() {
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
    <p>© 2026 Red Sky Cleaning · All rights reserved.</p>
    <p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p>
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

function renderRecurring(svc) {
  const tiers = svc.tiers.map(t => `
    <article class="rs-tier-card${t.popular ? " is-popular" : ""}">
      <h3 class="rs-tier-card__name">${t.name}</h3>
      <div class="rs-tier-card__discount">−${t.discount}%<span> off one-time</span></div>
      <p style="font-size:var(--text-sm);color:var(--rs-ink-soft);margin:0;">For ${escapeHtml(t.for)}.</p>
      <ul class="rs-tier-card__features">
        ${t.features.map(f => `<li>· ${escapeHtml(f)}</li>`).join("\n        ")}
      </ul>
      <button class="rs-btn rs-btn--cta rs-btn--block" type="button" data-rs-open-quote data-rs-prefill-service="standard">Start ${t.name.toLowerCase()} →</button>
    </article>`).join("\n");
  const ex = svc.savingsExample;
  return `
<section class="rs-section rs-section--alt">
  <div class="rs-container">
    <header class="rs-section__head">
      <p class="rs-eyebrow">Compare plans</p>
      <h2>Pick the rhythm that fits your life.</h2>
      <p class="rs-section__sub">More frequency, more savings. Same crew, same checklist, every visit. Cancel any time — no contract, no fee.</p>
    </header>
    <div class="rs-tier-grid">${tiers}</div>
  </div>
</section>

<section class="rs-section">
  <div class="rs-container rs-container--narrow">
    <header class="rs-section__head">
      <p class="rs-eyebrow">Annual savings illustration</p>
      <h2>Same home. Same checklist. Big difference.</h2>
      <p class="rs-section__sub">Sample 3-bed / 2-bath home @ $${ex.oneTimePrice}/clean one-time. Weekly cleans cost more in absolute dollars but the per-visit price is the lowest.</p>
    </header>
    <table class="rs-time-table" style="margin:0 auto;">
      <thead><tr><th>Plan</th><th>Per visit</th><th>Annual cost</th><th>vs one-time</th></tr></thead>
      <tbody>
        <tr><td>One-time (×13/yr)</td><td>$${ex.oneTimePrice}</td><td>$${ex.oneTimeAnnualEquivalent.toLocaleString()}</td><td>—</td></tr>
        <tr><td>Monthly (12)</td><td>$${ex.monthlyPrice}</td><td>$${ex.monthlyAnnual.toLocaleString()}</td><td style="color:var(--rs-success);font-weight:600;">save $${(ex.oneTimeAnnualEquivalent-ex.monthlyAnnual).toLocaleString()}</td></tr>
        <tr><td>Bi-weekly (26)</td><td>$${ex.biweeklyPrice}</td><td>$${ex.biweeklyAnnual.toLocaleString()}</td><td style="color:var(--rs-success);font-weight:600;">save $${(ex.oneTimeAnnualEquivalent-ex.biweeklyAnnual).toLocaleString()}/yr · 12% off</td></tr>
        <tr><td>Weekly (52)</td><td>$${ex.weeklyPrice}</td><td>$${ex.weeklyAnnual.toLocaleString()}</td><td style="color:var(--rs-success);font-weight:600;">save $${(ex.oneTimeAnnualEquivalent-ex.weeklyAnnual).toLocaleString()}/yr · 20% off</td></tr>
      </tbody>
    </table>
    <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);margin-top:var(--space-3);text-align:center;font-style:italic;">Numbers are illustrative. Your real price depends on home size + add-ons; the calculator shows it live.</p>
  </div>
</section>`;
}

function renderStandardSections(svc) {
  const includesByRoom = svc.includes.map(group => `
      <section class="rs-room-section">
        <h4>${escapeHtml(group.room)}</h4>
        <ul class="rs-check-list">
          ${group.items.map(it => `<li>${escapeHtml(it)}</li>`).join("\n          ")}
        </ul>
      </section>`).join("\n");

  const notIncluded = svc.notIncluded.map(it => `<li>${escapeHtml(it)}</li>`).join("\n          ");

  const addons = svc.addons.map(key => {
    const a = pricing.addons[key];
    if (!a) return "";
    const unitSuffix = a.unit === "per_room" ? " /rm" : a.unit === "per_load" ? " /load" : "";
    return `<li><span>${escapeHtml(a.label)}</span><strong>+$${a.price}${unitSuffix}</strong></li>`;
  }).join("\n        ");

  const timeRows = svc.timeEstimate.map(t => `<tr><td>${escapeHtml(t.size)}</td><td>${escapeHtml(t.time)}</td></tr>`).join("\n          ");

  return `
<section class="rs-section">
  <div class="rs-container">
    <header class="rs-section__head" style="text-align:left;margin-bottom:var(--space-8);">
      <p class="rs-eyebrow">What's included</p>
      <h2 style="font-size:var(--text-2xl);">Every clean follows the same checklist.</h2>
    </header>
    <div class="rs-includes-grid">
      <div class="rs-includes-grid__main">
        ${includesByRoom}
      </div>
      <aside class="rs-not-included" aria-labelledby="not-inc-head">
        <h3 id="not-inc-head" style="font-family:var(--font-display);font-size:var(--text-md);margin-bottom:var(--space-3);">What's not included</h3>
        <ul class="rs-x-list">
          ${notIncluded}
        </ul>
        <p>Need any of these? They're available as add-ons in the quote tool — you'll see the price live before you book.</p>
      </aside>
    </div>
  </div>
</section>

<section class="rs-section rs-section--alt">
  <div class="rs-container rs-container--narrow">
    <header class="rs-section__head" style="text-align:left;">
      <p class="rs-eyebrow">Available add-ons</p>
      <h2 style="font-size:var(--text-2xl);">Customize your clean.</h2>
    </header>
    <ul class="rs-addon-list">
        ${addons}
    </ul>
  </div>
</section>

<section class="rs-section">
  <div class="rs-container rs-container--narrow">
    <header class="rs-section__head" style="text-align:left;">
      <p class="rs-eyebrow">Time estimate</p>
      <h2 style="font-size:var(--text-2xl);">Plan around your day.</h2>
    </header>
    <table class="rs-time-table">
      <thead><tr><th>Home size</th><th>Estimated time</th></tr></thead>
      <tbody>
          ${timeRows}
      </tbody>
    </table>
    <p style="font-size:var(--text-xs);color:var(--rs-ink-soft);margin-top:var(--space-3);font-style:italic;">Times are approximate per cleaner. Larger homes get a 2-cleaner crew and finish in roughly half the time.</p>
  </div>
</section>`;
}

function renderFaqs(svc) {
  return `
<section class="rs-section rs-section--alt">
  <div class="rs-container rs-container--narrow">
    <header class="rs-section__head">
      <p class="rs-eyebrow">${escapeHtml(svc.h1)} · FAQ</p>
      <h2>Quick answers.</h2>
    </header>
    <div class="rs-accordion">
        ${svc.faqs.map(f => `<div class="rs-accordion__item">
          <button class="rs-accordion__trigger" type="button" aria-expanded="false"><span>${escapeHtml(f.q)}</span><svg class="rs-accordion__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></button>
          <div class="rs-accordion__panel"><div class="rs-accordion__body"><p>${escapeHtml(f.a)}</p></div></div>
        </div>`).join("\n        ")}
    </div>
    <p class="rs-section__cta-row"><a class="rs-btn rs-btn--link" href="/faq/">See the full FAQ →</a></p>
  </div>
</section>`;
}

function renderPage(svc) {
  const url = "https://redskycleaning.com/services/" + svc.slug + "/";
  const middleSections = svc.isRecurring ? renderRecurring(svc) : renderStandardSections(svc);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(svc.title)}</title>
  <meta name="description" content="${escapeHtml(svc.metaDescription)}">
  <meta name="theme-color" content="#C8252C">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="geo.region" content="US-GA"><meta name="geo.placename" content="Atlanta">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/png" href="/logo.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(svc.h1)} | Red Sky Cleaning Atlanta">
  <meta property="og:description" content="${escapeHtml(svc.metaDescription)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://redskycleaning.com/logo.png">
  <link rel="stylesheet" href="/styles.css">

  <script type="application/ld+json">
${jsonLdServiceBlock(svc)}
  </script>
  <script type="application/ld+json">
${jsonLdBreadcrumb(svc)}
  </script>
  <script type="application/ld+json">
${jsonLdFaqPage(svc)}
  </script>
</head>
<body>
${renderHeader(svc)}

<main id="main">
  <div class="rs-container">
    <nav class="rs-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/services/">Services</a></li>
        <li><span aria-current="page">${escapeHtml(svc.h1)}</span></li>
      </ol>
    </nav>
  </div>

  <section class="rs-page-hero">
    <div class="rs-container">
      <div class="rs-page-hero__inner">
        <div class="rs-page-hero__copy">
          <p class="rs-eyebrow">${escapeHtml(svc.h1)}</p>
          <h1>${escapeHtml(svc.h1)}</h1>
          <span class="rs-price-chip">From <strong>$${svc.priceFrom}</strong> · flat pricing, no surprises</span>
          <p class="rs-page-hero__lede">${escapeHtml(svc.lede)}</p>
          <div class="rs-page-hero__ctas">
            <button class="rs-btn rs-btn--cta rs-btn--lg" type="button" data-rs-open-quote data-rs-prefill-service="${svc.drawerService}">Book this clean →</button>
            <a class="rs-btn rs-btn--secondary rs-btn--lg" href="tel:+14702400645"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
          </div>
        </div>
        <div class="rs-page-hero__media" aria-hidden="true"></div>
      </div>
    </div>
  </section>

${middleSections}

${renderFaqs(svc)}

  <section class="rs-cta-band">
    <div class="rs-container rs-cta-band__inner">
      <h2>Ready when you are.</h2>
      <p>Get your ${escapeHtml(svc.h1.toLowerCase())} priced in under a minute. No spam calls. No upsell.</p>
      <div class="rs-cta-band__actions">
        <button class="rs-btn rs-btn--cta rs-btn--lg" type="button" data-rs-open-quote data-rs-prefill-service="${svc.drawerService}">Get instant quote</button>
        <a class="rs-btn rs-btn--secondary rs-btn--lg" href="tel:+14702400645"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
      </div>
    </div>
  </section>
</main>

${renderFooter()}
</body>
</html>
`;
}

// ---- Main ----

let count = 0;
for (const slug of slugs) {
  const svc = data[slug];
  if (!svc) { console.warn("[build] missing data for slug:", slug); continue; }
  const out = renderPage(svc);
  const dir = path.join(ROOT, "services", slug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, out, "utf8");
  console.log("[build] wrote", path.relative(ROOT, file), "(" + out.length + " bytes)");
  count++;
}
console.log("[build] done — " + count + " service pages.");
