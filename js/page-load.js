// js/page-load.js
// Top page progress bar — fires on every navigation, including instant
// cache hits. Self-injects so it doesn't need any markup. Skipped under
// prefers-reduced-motion (the CSS handles that too as a belt-and-braces).

(function () {
  "use strict";

  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) {}

  function inject() {
    if (document.getElementById("rs-page-bar")) return;
    var bar = document.createElement("div");
    bar.id = "rs-page-bar";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    requestAnimationFrame(function () {
      bar.classList.add("is-loading");
    });

    function done() {
      requestAnimationFrame(function () {
        bar.classList.remove("is-loading");
        bar.classList.add("is-done");
      });
      setTimeout(function () {
        if (bar.parentNode) bar.parentNode.removeChild(bar);
      }, 650);
    }

    if (document.readyState === "complete") {
      // Cache-hit / instant load — give the bar a quick play-through anyway.
      setTimeout(done, 320);
    } else {
      window.addEventListener("load", function () {
        setTimeout(done, 60);
      }, { once: true });
    }
  }

  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject, { once: true });
})();
