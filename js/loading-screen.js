// js/loading-screen.js
// First-visit homepage loading screen: sun rising over horizon (~1.1s).
// Skipped on:
//   - reduced-motion
//   - saveData / 2g / slow-2g
//   - repeat visits within the same tab session (sessionStorage.rsc_loaded === "1")
//   - internal navigation (referrer matches our origin)

(function () {
  "use strict";

  function shouldSkip() {
    try { if (sessionStorage.getItem("rsc_loaded") === "1") return true; } catch (e) {}
    try { if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true; } catch (e) {}
    try {
      var c = navigator.connection;
      if (c && (c.saveData || c.effectiveType === "slow-2g" || c.effectiveType === "2g")) return true;
    } catch (e) {}
    try { if (document.referrer && document.referrer.indexOf(location.origin) === 0) return true; } catch (e) {}
    return false;
  }

  if (shouldSkip()) return;

  var css = [
    "#rs-loader{position:fixed;inset:0;z-index:99999;background:#0B1220;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;transition:opacity .55s ease, transform .55s cubic-bezier(.5,0,.2,1);will-change:transform,opacity}",
    "#rs-loader.is-leaving{opacity:0;transform:translateY(-8%)}",
    "#rs-loader svg{width:min(220px, 40vw);height:auto;display:block}",
    "#rs-loader .rs-loader__sun{transform-origin:50% 100%;animation:rsLoaderSunRise 1100ms cubic-bezier(.2,.8,.2,1) forwards}",
    "#rs-loader .rs-loader__beam{stroke-dasharray:140;stroke-dashoffset:140;animation:rsLoaderBeam 900ms ease-out 200ms forwards}",
    "#rs-loader .rs-loader__horizon{transform-origin:50% 50%;transform:scaleX(.2);opacity:0;animation:rsLoaderHorizon 700ms ease-out 100ms forwards}",
    "#rs-loader .rs-loader__mark{font:700 14px/1 ui-sans-serif,system-ui,Inter,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#FAFAF7;opacity:0;transform:translateY(8px);animation:rsLoaderMark 600ms ease-out 700ms forwards}",
    "@keyframes rsLoaderSunRise{0%{transform:translateY(40px) scale(.6);opacity:0}50%{opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}",
    "@keyframes rsLoaderBeam{to{stroke-dashoffset:0}}",
    "@keyframes rsLoaderHorizon{to{transform:scaleX(1);opacity:1}}",
    "@keyframes rsLoaderMark{to{opacity:1;transform:translateY(0)}}",
    "html.rs-loader-active{overflow:hidden}"
  ].join("\n");

  var style = document.createElement("style");
  style.id = "rs-loader-style";
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
  document.documentElement.classList.add("rs-loader-active");

  function inject() {
    var el = document.createElement("div");
    el.id = "rs-loader";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "Red Sky Cleaning is loading");
    el.innerHTML = [
      '<svg viewBox="0 0 240 140" aria-hidden="true">',
        '<line class="rs-loader__horizon" x1="20" y1="100" x2="220" y2="100" stroke="#C8252C" stroke-width="2" stroke-linecap="round"/>',
        '<g class="rs-loader__sun">',
          '<circle cx="120" cy="100" r="32" fill="#F4B04B"/>',
          '<g stroke="#F4B04B" stroke-width="2.5" stroke-linecap="round">',
            '<path class="rs-loader__beam" d="M120 50 V20"/>',
            '<path class="rs-loader__beam" d="M82 65 L62 50"/>',
            '<path class="rs-loader__beam" d="M158 65 L178 50"/>',
            '<path class="rs-loader__beam" d="M70 95 L40 95"/>',
            '<path class="rs-loader__beam" d="M170 95 L200 95"/>',
          '</g>',
        '</g>',
      '</svg>',
      '<div class="rs-loader__mark">Red Sky Cleaning</div>'
    ].join("");
    document.body.appendChild(el);

    var minDuration = 1100;
    var t0 = performance.now();
    function dismiss() {
      var elapsed = performance.now() - t0;
      var wait = Math.max(0, minDuration - elapsed);
      setTimeout(function () {
        el.classList.add("is-leaving");
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
          document.documentElement.classList.remove("rs-loader-active");
          try { sessionStorage.setItem("rsc_loaded", "1"); } catch (e) {}
        }, 600);
      }, wait);
    }
    if (document.readyState === "complete") dismiss();
    else window.addEventListener("load", dismiss, { once: true });
  }

  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject, { once: true });
})();
