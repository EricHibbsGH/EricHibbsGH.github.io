// scripts/build-area-pages.mjs
// Reads areas/_data.json, emits:
//   areas/index.html (hub of all 10 cities)
//   areas/{slug}/index.html × 10
// Run: `node scripts/build-area-pages.mjs`

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const data = JSON.parse(fs.readFileSync(path.join(ROOT, "areas/_data.json"), "utf8"));

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function jsonLd(obj) { return JSON.stringify(obj, null, 2); }

function localBusinessForCity(city) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "CleaningService",
    "name": "Red Sky Cleaning — " + city.name,
    "url": "https://redskycleaning.com/areas/" + city.slug + "/",
    "telephone": "+1-470-240-0645",
    "email": "support@redskycleaning.com",
    "image": "https://redskycleaning.com/logo.png",
    "priceRange": "$100-$500",
    "areaServed": { "@type": "City", "name": city.name + ", GA" },
    "address": { "@type": "PostalAddress", "addressLocality": city.name, "addressRegion": "GA", "addressCountry": "US" },
    "geo": { "@type": "GeoCoordinates", "latitude": city.lat, "longitude": city.lng },
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "07:00",
      "closes": "18:00"
    }],
    "parentOrganization": { "@type": "CleaningService", "@id": "https://redskycleaning.com/#business" }
  });
}

function breadcrumbForCity(city) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",   "item": "https://redskycleaning.com/" },
      { "@type": "ListItem", "position": 2, "name": "Areas",  "item": "https://redskycleaning.com/areas/" },
      { "@type": "ListItem", "position": 3, "name": city.name, "item": "https://redskycleaning.com/areas/" + city.slug + "/" }
    ]
  });
}

function faqForCity(city) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": city.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  });
}

const HEADER = `
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
        <li><a href="/services/">Services</a></li>
        <li><a href="/areas/" aria-current="page">Areas</a></li>
        <li><a href="/checklist/">Checklist</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/#reviews">Reviews</a></li>
      </ul>
      <div class="rs-hdr__cta">
        <a href="tel:+14702400645" class="rs-hdr__phone"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
        <button class="rs-btn rs-btn--cta rs-btn--sm" type="button" data-rs-open-quote>Get instant quote</button>
      </div>
    </nav>
  </div>
</header>`;

const FOOTER = `
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
<script type="module" src="/js/inline-calc.js"></script>`;

function cityMapScript(city) {
  return `
<script>
(function(){
  var mapEl = document.getElementById('city-map');
  if (!mapEl) return;
  var loaded = false;
  function load(){
    if (loaded) return; loaded = true;
    var css = document.createElement('link'); css.rel='stylesheet';
    css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; css.crossOrigin=''; document.head.appendChild(css);
    var js = document.createElement('script');
    js.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; js.crossOrigin=''; js.onload=init; document.head.appendChild(js);
  }
  function init(){
    if (typeof L === 'undefined') return;
    var map = L.map('city-map', { center: [${city.lat}, ${city.lng}], zoom: 12, scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 18
    }).addTo(map);
    var pin = L.divIcon({ className: 'rs-map-pin', html: '<svg viewBox="0 0 24 36" width="32" height="46"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#C8252C"/><circle cx="12" cy="11" r="5" fill="white"/></svg>', iconSize:[32,46], iconAnchor:[16,46] });
    L.marker([${city.lat}, ${city.lng}], { icon: pin }).addTo(map).bindPopup('<strong>${escapeHtml(city.name)}, GA</strong><br>House cleaning · ZIP ${city.zips[0]}').openPopup();
    L.circle([${city.lat}, ${city.lng}], { radius: 8000, color: '#C8252C', weight: 1, opacity: 0.25, fillOpacity: 0.05 }).addTo(map);
    mapEl.addEventListener('click', function(){ map.scrollWheelZoom.enable(); });
    mapEl.addEventListener('mouseleave', function(){ map.scrollWheelZoom.disable(); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ load(); io.unobserve(e.target); }}); }, { rootMargin: '200px' });
    io.observe(mapEl);
  } else { load(); }
})();
</script>`;
}

function neighborsForCity(city) {
  const all = data.cities.filter(c => c.slug !== city.slug);
  all.sort((a, b) => Math.hypot(a.lat - city.lat, a.lng - city.lng) - Math.hypot(b.lat - city.lat, b.lng - city.lng));
  return all.slice(0, 2);
}

function renderCityPage(city) {
  const url = "https://redskycleaning.com/areas/" + city.slug + "/";
  const title = "House Cleaning in " + city.name + ", GA | Red Sky Cleaning";
  const desc = "Professional house cleaning in " + city.name + ", GA — covering " +
               city.neighborhoods.slice(0, 3).join(", ") +
               ". Background-checked, insured. Instant quote in 60 seconds.";

  const neighbors = neighborsForCity(city);
  const neighborhoodList = city.neighborhoods.map(n => `<li>${escapeHtml(n)}</li>`).join("\n          ");
  const zipDisplay = city.zips.join(" · ");

  const faqsHtml = city.faqs.map(f => `<div class="rs-accordion__item">
            <button class="rs-accordion__trigger" type="button" aria-expanded="false"><span>${escapeHtml(f.q)}</span><svg class="rs-accordion__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></button>
            <div class="rs-accordion__panel"><div class="rs-accordion__body"><p>${escapeHtml(f.a)}</p></div></div>
          </div>`).join("\n          ");

  const neighborsHtml = neighbors.map(n => `<a class="rs-area-card" href="/areas/${n.slug}/">
        <span class="rs-area-card__city">${escapeHtml(n.name)}</span>
        <span class="rs-area-card__zips">${n.driveMin} min · ${escapeHtml(n.neighborhoods.slice(0,2).join(" · "))}</span>
        <span class="rs-area-card__cta">House cleaning in ${escapeHtml(n.name)} →</span>
      </a>`).join("\n      ");

  const primaryZip = city.zips[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="theme-color" content="#C8252C">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="geo.region" content="US-GA"><meta name="geo.placename" content="${escapeHtml(city.name)}">
  <meta name="geo.position" content="${city.lat};${city.lng}">
  <meta name="ICBM" content="${city.lat}, ${city.lng}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/png" href="/logo.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://redskycleaning.com/logo.png">
  <link rel="stylesheet" href="/styles.css">

  <script type="application/ld+json">
${localBusinessForCity(city)}
  </script>
  <script type="application/ld+json">
${breadcrumbForCity(city)}
  </script>
  <script type="application/ld+json">
${faqForCity(city)}
  </script>
</head>
<body>
${HEADER}

<main id="main">
  <div class="rs-container">
    <nav class="rs-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/areas/">Areas</a></li>
        <li><span aria-current="page">${escapeHtml(city.name)}</span></li>
      </ol>
    </nav>
  </div>

  <section class="rs-page-hero">
    <div class="rs-container">
      <div class="rs-page-hero__inner">
        <div class="rs-page-hero__copy">
          <p class="rs-eyebrow">${escapeHtml(city.name)}, GA · ${escapeHtml(zipDisplay)}</p>
          <h1>House cleaning in ${escapeHtml(city.name)}, GA</h1>
          <span class="rs-price-chip">From <strong>$100</strong> · ${city.driveMin} min from our Atlanta base</span>
          <p class="rs-page-hero__lede">${escapeHtml(city.intro)}</p>
          <div class="rs-page-hero__ctas">
            <button class="rs-btn rs-btn--cta rs-btn--lg" type="button" data-rs-open-quote data-rs-prefill-zip="${primaryZip}">Get my ${escapeHtml(city.name)} quote</button>
            <a class="rs-btn rs-btn--secondary rs-btn--lg" href="tel:+14702400645"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
          </div>
        </div>
        <div class="rs-page-hero__media" aria-hidden="true"></div>
      </div>
    </div>
  </section>

  <section class="rs-section">
    <div class="rs-container">
      <div class="rs-split">
        <div>
          <p class="rs-eyebrow">Neighborhoods we serve</p>
          <h2 style="font-family:var(--font-display); font-size:var(--text-2xl); letter-spacing:var(--tracking-tight); margin-bottom:var(--space-4);">${escapeHtml(city.name)} coverage</h2>
          <ul class="rs-check-list" style="margin-bottom:var(--space-5);">
          ${neighborhoodList}
          </ul>
          <p style="font-size:var(--text-sm); color:var(--rs-ink-soft); line-height:var(--leading-normal); margin-bottom:var(--space-2);"><strong>Local landmark:</strong> ${escapeHtml(city.landmark)}.</p>
          <p style="font-size:var(--text-sm); color:var(--rs-ink-soft); line-height:var(--leading-normal);"><strong>Typical homes:</strong> ${escapeHtml(city.homeTypes)}.</p>
        </div>
        <div>
          <div id="city-map" class="rs-service-map" style="height:380px;" aria-label="Map of Red Sky Cleaning service area in ${escapeHtml(city.name)}, GA"></div>
        </div>
      </div>
    </div>
  </section>

  <section class="rs-section rs-section--alt">
    <div class="rs-container">
      <header class="rs-section__head">
        <p class="rs-eyebrow">Instant quote · ${escapeHtml(city.name)}</p>
        <h2>Your ${escapeHtml(city.name)} quote, in 3 inputs.</h2>
        <p class="rs-section__sub">Pre-filled with a ${escapeHtml(city.name)} ZIP. Tweak bedrooms or frequency to see how the price moves.</p>
      </header>
      <div class="rs-mini-calc" data-rs-inline-calc data-rs-id="${city.slug}" data-rs-zip="${primaryZip}" data-rs-bedrooms="3" data-rs-service="standard"></div>
    </div>
  </section>

  <section class="rs-section">
    <div class="rs-container">
      <header class="rs-section__head">
        <p class="rs-eyebrow">All 4 services</p>
        <h2>Available in ${escapeHtml(city.name)}.</h2>
      </header>
      <div class="rs-svc-grid">
        <article class="rs-service-card"><div class="rs-service-card__media" aria-hidden="true"></div><div class="rs-service-card__body"><div class="rs-service-card__head"><h3 class="rs-service-card__title">Standard</h3><span class="rs-service-card__price">from <strong>$100</strong></span></div><a class="rs-btn rs-btn--secondary rs-btn--sm rs-service-card__cta" href="/services/standard/">Standard cleaning →</a></div></article>
        <article class="rs-service-card"><div class="rs-service-card__media" aria-hidden="true"></div><div class="rs-service-card__body"><div class="rs-service-card__head"><h3 class="rs-service-card__title">Deep clean</h3><span class="rs-service-card__price">from <strong>$250</strong></span></div><a class="rs-btn rs-btn--secondary rs-btn--sm rs-service-card__cta" href="/services/deep/">Deep clean →</a></div></article>
        <article class="rs-service-card"><div class="rs-service-card__media" aria-hidden="true"></div><div class="rs-service-card__body"><div class="rs-service-card__head"><h3 class="rs-service-card__title">Move-in</h3><span class="rs-service-card__price">from <strong>$250</strong></span></div><a class="rs-btn rs-btn--secondary rs-btn--sm rs-service-card__cta" href="/services/move-in/">Move-in →</a></div></article>
        <article class="rs-service-card"><div class="rs-service-card__media" aria-hidden="true"></div><div class="rs-service-card__body"><div class="rs-service-card__head"><h3 class="rs-service-card__title">Move-out</h3><span class="rs-service-card__price">from <strong>$250</strong></span></div><a class="rs-btn rs-btn--secondary rs-btn--sm rs-service-card__cta" href="/services/move-out/">Move-out →</a></div></article>
      </div>
    </div>
  </section>

  <section class="rs-section rs-section--alt">
    <div class="rs-container rs-container--narrow">
      <header class="rs-section__head">
        <p class="rs-eyebrow">${escapeHtml(city.name)} · FAQ</p>
        <h2>Local questions, local answers.</h2>
      </header>
      <div class="rs-accordion">
          ${faqsHtml}
      </div>
      <p class="rs-section__cta-row"><a class="rs-btn rs-btn--link" href="/faq/">See the full FAQ →</a></p>
    </div>
  </section>

  <section class="rs-section">
    <div class="rs-container">
      <header class="rs-section__head">
        <p class="rs-eyebrow">Nearby cities</p>
        <h2>Also serving the area around ${escapeHtml(city.name)}.</h2>
      </header>
      <div class="rs-svc-grid">
      ${neighborsHtml}
      <a class="rs-area-card" href="/areas/" style="border-style:dashed;">
        <span class="rs-area-card__city">All 10 service areas</span>
        <span class="rs-area-card__zips">Atlanta · Buckhead · Marietta · Alpharetta · Johns Creek + more</span>
        <span class="rs-area-card__cta">See full map →</span>
      </a>
      </div>
    </div>
  </section>

  <section class="rs-cta-band">
    <div class="rs-container rs-cta-band__inner">
      <h2>Ready for a clean home in ${escapeHtml(city.name)}?</h2>
      <p>Get your ${escapeHtml(city.name)} quote in under a minute. We pre-fill your ZIP — you fill in the rest.</p>
      <div class="rs-cta-band__actions">
        <button class="rs-btn rs-btn--cta rs-btn--lg" type="button" data-rs-open-quote data-rs-prefill-zip="${primaryZip}">Get instant quote</button>
        <a class="rs-btn rs-btn--secondary rs-btn--lg" href="tel:+14702400645"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
      </div>
    </div>
  </section>
</main>

${FOOTER}
${cityMapScript(city)}
</body>
</html>
`;
}

function renderHubPage() {
  const cards = data.cities.map(c => `      <a class="rs-area-card" href="/areas/${c.slug}/">
        <span class="rs-area-card__city">${escapeHtml(c.name)}</span>
        <span class="rs-area-card__zips">${c.zips.slice(0,4).join(" · ")}${c.zips.length > 4 ? " +" : ""}</span>
        <span class="rs-area-card__cta">${c.driveMin} min · ${escapeHtml(c.neighborhoods[0])} →</span>
      </a>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Areas — House Cleaning Across North Atlanta | Red Sky Cleaning</title>
  <meta name="description" content="Red Sky Cleaning serves 10 cities across North Atlanta — Alpharetta, Johns Creek, Marietta, Buckhead, Lawrenceville, and more. Find your area + get an instant quote.">
  <meta name="theme-color" content="#C8252C">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://redskycleaning.com/areas/">
  <link rel="icon" type="image/png" href="/logo.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Service Areas | Red Sky Cleaning Atlanta">
  <meta property="og:description" content="10 North Atlanta cities served by background-checked, insured house cleaners.">
  <meta property="og:url" content="https://redskycleaning.com/areas/">
  <meta property="og:image" content="https://redskycleaning.com/logo.png">
  <link rel="stylesheet" href="/styles.css">

  <script type="application/ld+json">
${jsonLd({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://redskycleaning.com/" },
    { "@type": "ListItem", "position": 2, "name": "Areas", "item": "https://redskycleaning.com/areas/" }
  ]
})}
  </script>
  <script type="application/ld+json">
${jsonLd({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Red Sky Cleaning service areas",
  "itemListElement": data.cities.map((c, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": "House cleaning in " + c.name + ", GA",
    "url": "https://redskycleaning.com/areas/" + c.slug + "/"
  }))
})}
  </script>
</head>
<body>
${HEADER}

<main id="main">
  <div class="rs-container">
    <nav class="rs-breadcrumb" aria-label="Breadcrumb">
      <ol><li><a href="/">Home</a></li><li><span aria-current="page">Areas</span></li></ol>
    </nav>
  </div>

  <section class="rs-page-hero">
    <div class="rs-container">
      <p class="rs-eyebrow">Service areas</p>
      <h1>10 cities across North Atlanta.</h1>
      <p class="rs-page-hero__lede">From Buckhead at 10 minutes out to Dawsonville and Gainesville at the far edge — same crew, same checklist, same prices, no upcharge for the drive. Pick your city for local neighborhoods, pricing, and an FAQ that answers what your neighbors actually ask.</p>
      <div class="rs-page-hero__ctas">
        <button class="rs-btn rs-btn--cta rs-btn--lg" type="button" data-rs-open-quote>Get instant quote</button>
        <a class="rs-btn rs-btn--secondary rs-btn--lg" href="/services/">See services</a>
      </div>
    </div>
  </section>

  <section class="rs-section">
    <div class="rs-container">
      <div id="hub-map" class="rs-service-map" aria-label="Red Sky Cleaning service area map across North Atlanta"></div>
    </div>
  </section>

  <section class="rs-section rs-section--alt">
    <div class="rs-container">
      <header class="rs-section__head">
        <p class="rs-eyebrow">All cities</p>
        <h2>Pick your area for local pricing &amp; FAQs.</h2>
      </header>
      <div class="rs-svc-grid">
${cards}
      </div>
    </div>
  </section>

  <section class="rs-cta-band">
    <div class="rs-container rs-cta-band__inner">
      <h2>Don't see your city?</h2>
      <p>We may still serve you — borders are flexible and our service area is growing. Open the quote tool, enter your ZIP, and we'll tell you in 5 seconds.</p>
      <div class="rs-cta-band__actions">
        <button class="rs-btn rs-btn--cta rs-btn--lg" type="button" data-rs-open-quote>Check my ZIP</button>
        <a class="rs-btn rs-btn--secondary rs-btn--lg" href="tel:+14702400645"><svg width="16" height="16" aria-hidden="true"><use href="#i-phone"/></svg>(470) 240-0645</a>
      </div>
    </div>
  </section>
</main>

${FOOTER}

<script>
(function(){
  var mapEl = document.getElementById('hub-map');
  if (!mapEl) return;
  var loaded = false;
  function load(){
    if (loaded) return; loaded = true;
    var css = document.createElement('link'); css.rel='stylesheet';
    css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; css.crossOrigin=''; document.head.appendChild(css);
    var js = document.createElement('script');
    js.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; js.crossOrigin=''; js.onload=init; document.head.appendChild(js);
  }
  function init(){
    if (typeof L === 'undefined') return;
    var map = L.map('hub-map', { center: [34.0, -84.15], zoom: 9, scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 18 }).addTo(map);
    var pin = L.divIcon({ className: 'rs-map-pin', html: '<svg viewBox="0 0 24 36" width="28" height="40"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#C8252C"/><circle cx="12" cy="11" r="5" fill="white"/></svg>', iconSize:[28,40], iconAnchor:[14,40] });
    var cities = ${JSON.stringify(data.cities.map(c => ({ name: c.name, slug: c.slug, lat: c.lat, lng: c.lng })))};
    cities.forEach(function(c){
      L.marker([c.lat, c.lng], { icon: pin }).addTo(map).bindPopup('<strong>' + c.name + ', GA</strong><br><a href="/areas/' + c.slug + '/">House cleaning in ' + c.name + ' →</a>');
    });
    L.circle([33.85, -84.2], { radius: 65000, color: '#C8252C', weight: 1, opacity: 0.2, fillOpacity: 0.04, dashArray: '6 4' }).addTo(map);
    mapEl.addEventListener('click', function(){ map.scrollWheelZoom.enable(); });
    mapEl.addEventListener('mouseleave', function(){ map.scrollWheelZoom.disable(); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ load(); io.unobserve(e.target); }}); }, { rootMargin: '200px' });
    io.observe(mapEl);
  } else { load(); }
})();
</script>
</body>
</html>
`;
}

// ---- Main ----

let count = 0;
fs.writeFileSync(path.join(ROOT, "areas/index.html"), renderHubPage(), "utf8");
console.log("[build] wrote areas/index.html (hub)");
count++;

for (const city of data.cities) {
  const out = renderCityPage(city);
  const dir = path.join(ROOT, "areas", city.slug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, out, "utf8");
  console.log("[build] wrote", path.relative(ROOT, file), "(" + out.length + " bytes)");
  count++;
}
console.log("[build] done — " + count + " area pages.");
