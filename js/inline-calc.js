// Red Sky Cleaning — Inline mini-calculator (3 inputs)
// Spec §6: "ZIP + bedrooms + frequency → estimated price + Continue Booking CTA."
// Mounts to any element with [data-rs-inline-calc] and renders inputs + a live estimate.
// "Continue Booking" forwards the values into the quote drawer (window.RSQuoteDrawer.open).

import pricing from "./pricing.js";

const SERVICE_DEFAULT = "standard"; // mini-calc anchors to standard so the number is friendly

function svc(s) { return ["standard","deep","move_in","move_out"].includes(s) ? s : SERVICE_DEFAULT; }

async function mountOne(host) {
  await pricing.ready();
  const initialZip = host.dataset.rsZip || "";
  const initialBedrooms = Number(host.dataset.rsBedrooms || 3);
  const initialService = svc(host.dataset.rsService);
  const idSuffix = host.dataset.rsId || "";

  host.innerHTML = `
    <div class="rs-mini-calc__field">
      <label class="rs-mini-calc__label" for="rs-mc-zip-${idSuffix}">ZIP code</label>
      <input class="rs-input" id="rs-mc-zip-${idSuffix}" type="text" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="30309" value="${initialZip}" data-rs-mc-zip>
    </div>
    <div class="rs-mini-calc__field">
      <label class="rs-mini-calc__label" for="rs-mc-bd-${idSuffix}">Bedrooms</label>
      <select class="rs-select" id="rs-mc-bd-${idSuffix}" data-rs-mc-bd>
        ${[1,2,3,4,5,6].map(n => `<option value="${n}"${n === initialBedrooms ? " selected" : ""}>${n}</option>`).join("")}
      </select>
    </div>
    <div class="rs-mini-calc__field">
      <label class="rs-mini-calc__label" for="rs-mc-fr-${idSuffix}">Frequency</label>
      <select class="rs-select" id="rs-mc-fr-${idSuffix}" data-rs-mc-fr>
        <option value="one_time">One-time</option>
        <option value="biweekly" selected>Bi-weekly · save 15%</option>
        <option value="weekly">Weekly · save 20%</option>
        <option value="monthly">Monthly · save 10%</option>
      </select>
    </div>
    <button type="button" class="rs-btn rs-btn--primary rs-mini-calc__cta" data-rs-mc-go>Continue booking →</button>
    <div class="rs-mini-calc__result">
      <span class="rs-mini-calc__label">Estimated</span>
      <strong class="rs-mini-calc__amount" data-rs-mc-amount>${pricing.formatUSD(0)}</strong>
      <span class="rs-mini-calc__label" data-rs-mc-coverage></span>
    </div>
  `;

  const zipEl  = host.querySelector("[data-rs-mc-zip]");
  const bdEl   = host.querySelector("[data-rs-mc-bd]");
  const frEl   = host.querySelector("[data-rs-mc-fr]");
  const amtEl  = host.querySelector("[data-rs-mc-amount]");
  const covEl  = host.querySelector("[data-rs-mc-coverage]");
  const goBtn  = host.querySelector("[data-rs-mc-go]");

  function recompute() {
    const result = pricing.computePrice({
      service: initialService,
      bedrooms: Number(bdEl.value) || 3,
      bathrooms: 2,
      sqftTier: "1500-2000",
      frequency: frEl.value,
      addons: []
    });
    amtEl.textContent = pricing.formatUSD(result.mid);
    const z = (zipEl.value || "").trim();
    if (/^\d{5}$/.test(z)) {
      const inArea = pricing.zipInServiceArea(z);
      covEl.textContent = inArea ? "✓ We serve this ZIP" : "Outside core area — we may still help";
      covEl.style.color = inArea ? "var(--rs-success)" : "var(--rs-warn)";
    } else {
      covEl.textContent = "";
    }
  }

  zipEl.addEventListener("input", () => { zipEl.value = zipEl.value.replace(/\D/g, "").slice(0, 5); recompute(); });
  bdEl.addEventListener("change", recompute);
  frEl.addEventListener("change", recompute);
  recompute();

  goBtn.addEventListener("click", () => {
    const prefill = { service: initialService, zip: zipEl.value };
    if (window.RSQuoteDrawer) {
      window.RSQuoteDrawer.open(prefill);
    } else {
      // Fallback: navigate to /quote with query params (Phase 3 quote/index.html handles them)
      const qs = new URLSearchParams({
        service: initialService,
        bedrooms: String(bdEl.value),
        frequency: frEl.value,
        zip: zipEl.value
      }).toString();
      location.href = "/quote/?" + qs;
    }
  });
}

function mountAll() {
  document.querySelectorAll("[data-rs-inline-calc]").forEach(mountOne);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAll);
} else {
  mountAll();
}

export default { mountAll };
