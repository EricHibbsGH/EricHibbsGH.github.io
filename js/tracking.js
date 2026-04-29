// js/tracking.js
// Google Tag Manager + GA4 + Meta Pixel + Microsoft Clarity, consent-gated.
// Default consent: DENIED (Google Consent Mode v2). User opts in via banner.
// All loaders are no-op until /config/tracking.json has real (non-placeholder) IDs.

(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag("consent", "default", {
    "ad_storage": "denied",
    "ad_user_data": "denied",
    "ad_personalization": "denied",
    "analytics_storage": "denied",
    "functionality_storage": "granted",
    "security_storage": "granted",
    "wait_for_update": 500
  });

  var STATE = { cfg: null, loaded: { gtm:false, ga4:false, fbq:false, clarity:false } };

  function placeholder(s) { return !s || /YOUR_.*_HERE/.test(s); }
  function getStoredConsent(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function setStoredConsent(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  function applyConsent(decision) {
    var grant = decision === "granted";
    gtag("consent", "update", {
      "ad_storage": grant ? "granted" : "denied",
      "ad_user_data": grant ? "granted" : "denied",
      "ad_personalization": grant ? "granted" : "denied",
      "analytics_storage": grant ? "granted" : "denied"
    });
    if (grant) loadVendors();
  }

  function loadGTM(id) {
    if (STATE.loaded.gtm || placeholder(id)) return;
    STATE.loaded.gtm = true;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", id);
  }

  function loadGA4(id) {
    if (STATE.loaded.ga4 || placeholder(id)) return;
    STATE.loaded.ga4 = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", id, { "anonymize_ip": true });
  }

  function loadMetaPixel(id) {
    if (STATE.loaded.fbq || placeholder(id)) return;
    STATE.loaded.fbq = true;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", id);
    window.fbq("track", "PageView");
  }

  function loadClarity(id) {
    if (STATE.loaded.clarity || placeholder(id)) return;
    STATE.loaded.clarity = true;
    /* eslint-disable */
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", id);
    /* eslint-enable */
  }

  function loadVendors() {
    if (!STATE.cfg) return;
    loadGTM(STATE.cfg.gtm_id);
    loadGA4(STATE.cfg.ga4_id);
    loadMetaPixel(STATE.cfg.meta_pixel_id);
    loadClarity(STATE.cfg.clarity_project_id);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function injectBanner(cfg) {
    if (!cfg.cookie_banner || !cfg.cookie_banner.enabled) return;
    if (document.getElementById("rs-consent")) return;

    var styleEl = document.createElement("style");
    styleEl.textContent = [
      "#rs-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9000;background:#0B1220;color:#FAFAF7;padding:18px 20px;border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:12px;max-width:760px;margin:0 auto;font:500 14px/1.5 ui-sans-serif,system-ui,Inter,Arial,sans-serif;transform:translateY(180%);transition:transform .45s cubic-bezier(.2,.8,.2,1)}",
      "#rs-consent.is-shown{transform:translateY(0)}",
      "#rs-consent h3{margin:0;font:700 15px/1.3 ui-sans-serif,system-ui,Inter,Arial,sans-serif;letter-spacing:0;color:#FAFAF7}",
      "#rs-consent p{margin:0;color:#cdd2d8;font-size:13.5px}",
      "#rs-consent a{color:#F4B04B;text-decoration:underline}",
      "#rs-consent .rs-consent__row{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px}",
      "#rs-consent button{appearance:none;border:0;cursor:pointer;font:600 13px/1 ui-sans-serif,system-ui,Inter,Arial,sans-serif;padding:11px 16px;border-radius:10px;letter-spacing:.01em}",
      "#rs-consent .rs-consent__accept{background:#C8252C;color:#fff}",
      "#rs-consent .rs-consent__accept:hover{background:#a91d23}",
      "#rs-consent .rs-consent__deny{background:transparent;color:#FAFAF7;border:1px solid rgba(250,250,247,.32)}",
      "#rs-consent .rs-consent__deny:hover{background:rgba(250,250,247,.08)}",
      "@media(max-width:520px){#rs-consent{padding:14px}}"
    ].join("\n");
    document.head.appendChild(styleEl);

    var b = cfg.cookie_banner;
    var el = document.createElement("aside");
    el.id = "rs-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cookie preferences");
    el.innerHTML =
      '<h3>' + esc(b.title) + '</h3>' +
      '<p>' + esc(b.body) + ' <a href="' + esc(b.policy_url) + '">' + esc(b.policy_label) + '</a></p>' +
      '<div class="rs-consent__row">' +
        '<button type="button" class="rs-consent__accept">' + esc(b.accept_label) + '</button>' +
        '<button type="button" class="rs-consent__deny">' + esc(b.deny_label) + '</button>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-shown"); });

    el.querySelector(".rs-consent__accept").addEventListener("click", function () {
      setStoredConsent(cfg.consent_storage_key, "granted");
      applyConsent("granted");
      el.classList.remove("is-shown");
      setTimeout(function () { el.remove(); }, 500);
    });
    el.querySelector(".rs-consent__deny").addEventListener("click", function () {
      setStoredConsent(cfg.consent_storage_key, "denied");
      applyConsent("denied");
      el.classList.remove("is-shown");
      setTimeout(function () { el.remove(); }, 500);
    });
  }

  function wirePassiveEvents() {
    document.addEventListener("click", function (ev) {
      var a = ev.target && ev.target.closest && ev.target.closest("a[href^='tel:'], a[href^='mailto:']");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      window.dataLayer.push({
        event: href.indexOf("tel:") === 0 ? "click_phone" : "click_email",
        link: href
      });
    }, true);

    var p = location.pathname;
    if (/^\/services\/[^/]+\//.test(p)) window.dataLayer.push({ event: "view_service", path: p });
    else if (/^\/areas\/[^/]+\//.test(p)) window.dataLayer.push({ event: "view_area_page", path: p });
  }

  function boot(cfg) {
    STATE.cfg = cfg || {};
    var key = (cfg && cfg.consent_storage_key) || "rsc_consent_v1";
    var prior = getStoredConsent(key);

    wirePassiveEvents();

    var anyConfigured =
      !placeholder(cfg.ga4_id) || !placeholder(cfg.gtm_id) ||
      !placeholder(cfg.meta_pixel_id) || !placeholder(cfg.clarity_project_id);

    if (!anyConfigured) return;

    if (prior === "granted") applyConsent("granted");
    else if (prior === "denied") applyConsent("denied");
    else {
      if (document.body) injectBanner(cfg);
      else document.addEventListener("DOMContentLoaded", function () { injectBanner(cfg); }, { once: true });
    }
  }

  fetch("/config/tracking.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(boot)
    .catch(function () { /* placeholder mode */ });
})();
