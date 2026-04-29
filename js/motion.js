// js/motion.js
// Lightweight scroll-reveal + count-up motion. ~1KB. No external deps.
// Disabled when prefers-reduced-motion or saveData is on.

(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = (navigator.connection && navigator.connection.saveData) || false;
  if (reduce || saveData || !("IntersectionObserver" in window)) {
    document.documentElement.classList.add("rs-motion-off");
    return;
  }
  document.documentElement.classList.add("rs-motion-on");

  var autoSelectors = [
    "[data-rs-reveal]",
    ".rs-section > .rs-container > .rs-section__head",
    ".rs-section .rs-svc-grid > *",
    ".rs-section .rs-promise-grid > *",
    ".rs-section .rs-area-grid > *",
    ".rs-section .rs-tier-grid > *",
    ".rs-section .rs-room-section",
    ".rs-includes-grid__main > section",
    ".rs-cta-band__inner",
    ".rs-page-hero__copy"
  ];

  var nodes = [];
  try {
    nodes = Array.from(document.querySelectorAll(autoSelectors.join(",")));
  } catch (e) { return; }

  var parentMap = new Map();
  nodes.forEach(function (n) {
    n.classList.add("rs-reveal");
    var p = n.parentElement;
    var i = parentMap.get(p) || 0;
    n.style.setProperty("--rs-reveal-delay", (Math.min(i, 6) * 60) + "ms");
    parentMap.set(p, i + 1);
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

  nodes.forEach(function (n) { io.observe(n); });

  var counters = Array.from(document.querySelectorAll("[data-rs-count]"));
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var to = parseFloat(el.getAttribute("data-rs-count")) || 0;
        var dur = parseInt(el.getAttribute("data-rs-count-dur") || "1200", 10);
        var prefix = el.getAttribute("data-rs-count-prefix") || "";
        var suffix = el.getAttribute("data-rs-count-suffix") || "";
        var decimals = parseInt(el.getAttribute("data-rs-count-decimals") || "0", 10);
        var t0 = performance.now();
        function tick(now) {
          var t = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - t, 4);
          var v = (to * eased).toFixed(decimals);
          el.textContent = prefix + Number(v).toLocaleString() + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (n) { cio.observe(n); });
  }
})();
