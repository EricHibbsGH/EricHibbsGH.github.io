// js/page-load.js
// Top page progress bar — fires on every navigation, including instant
// cache hits. Self-injects so it doesn't need any markup. Skipped under
// prefers-reduced-motion (the CSS handles that too as a belt-and-braces).

(function () {
  "use strict";

  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) {}

  // Only fire on the first navigation of the session. After the bar plays
  // once we set a sessionStorage flag so subsequent in-site clicks skip it.
  // Each new tab/window starts a fresh session, so the bar plays again on
  // a deliberate new entry to the site but never spams within one tab.
  try {
    if (sessionStorage.getItem("rsc_pagebar_shown") === "1") return;
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
      try { sessionStorage.setItem("rsc_pagebar_shown", "1"); } catch (e) {}
    }

    if (document.readyState === "complete") {
      // Cache-hit / instant load — give the bar a longer play-through so
      // the user actually sees the animation finish.
      setTimeout(done, 700);
    } else {
      window.addEventListener("load", function () {
        setTimeout(done, 200);
      }, { once: true });
    }
  }

  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject, { once: true });
})();
