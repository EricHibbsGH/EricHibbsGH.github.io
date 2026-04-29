// Red Sky Cleaning — Quote Drawer (spec §7)
// Slide-in 5-step wizard. Native <dialog> + focus trap. localStorage draft state.
// Live price tween. Submission to webhook. Add-to-calendar success screen.
//
// Mount:
//   <button data-rs-open-quote data-rs-prefill-service="standard">Get instant quote</button>
//   <script type="module" src="/js/quote-drawer.js"></script>

import pricing from "./pricing.js";

const STATE_KEY = "rsc_draft_v1";
const ENDPOINTS_URL = "/config/endpoints.json";

let _endpoints = null;
let _drawer = null;
let _state = null;
let _step = 1;
const TOTAL_STEPS = 5;

// -------- state --------

const DEFAULT_STATE = () => ({
  step: 1,
  service: null,
  bedrooms: 3,
  bathrooms: 2,
  sqftTier: "1500-2000",
  frequency: "one_time",
  addons: [],
  addonRoomCounts: {},
  date: "",
  timeWindow: "",
  pets: false,
  contact: { first_name:"", last_name:"", email:"", phone:"", address:"", city:"", zip:"" },
  updated_at: 0
});

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return DEFAULT_STATE();
    return Object.assign(DEFAULT_STATE(), JSON.parse(raw));
  } catch { return DEFAULT_STATE(); }
}
function saveState() {
  try { _state.updated_at = Date.now(); localStorage.setItem(STATE_KEY, JSON.stringify(_state)); } catch {}
}
function clearState() { try { localStorage.removeItem(STATE_KEY); } catch {} }

// -------- endpoints --------

async function loadEndpoints() {
  if (_endpoints) return _endpoints;
  try {
    const res = await fetch(ENDPOINTS_URL, { cache: "default" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    _endpoints = await res.json();
  } catch {
    _endpoints = { quote_webhook: "", owner_email: "support@redskycleaning.com" };
  }
  return _endpoints;
}

const isPlaceholderUrl = s => !s || /^YOUR_.+_HERE$/.test(s);

// -------- DOM helpers --------

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// -------- price tween --------

let _priceTweenAF = null;
function tweenNumber(el, from, to, durationMs = 300) {
  cancelAnimationFrame(_priceTweenAF);
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = pricing.formatUSD(to); return;
  }
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 4);
    const val = Math.round(from + (to - from) * eased);
    el.textContent = pricing.formatUSD(val);
    if (t < 1) _priceTweenAF = requestAnimationFrame(step);
  }
  _priceTweenAF = requestAnimationFrame(step);
}

// -------- markup --------

function buildShell() {
  const drawer = h("dialog", { class: "rs-quote-drawer", "aria-labelledby": "rs-qd-title" });
  drawer.innerHTML = `
    <form class="rs-qd" novalidate>
      <header class="rs-qd__head">
        <div class="rs-qd__progress" aria-hidden="true">
          <div class="rs-qd__progress-fill" style="width:20%"></div>
        </div>
        <div class="rs-qd__head-row">
          <span class="rs-qd__step-label">Step <strong data-rs-qd-step>1</strong> of ${TOTAL_STEPS}</span>
          <button type="button" class="rs-btn rs-btn--ghost rs-btn--sm" data-rs-qd-close aria-label="Close">×</button>
        </div>
        <h2 id="rs-qd-title" class="rs-qd__title">Get an instant quote</h2>
      </header>

      <div class="rs-qd__body">
        <section class="rs-qd__step" data-step="1" hidden>
          <p class="rs-qd__sub">What kind of clean?</p>
          <div class="rs-qd__svc-grid" role="radiogroup" aria-label="Service type"></div>
        </section>

        <section class="rs-qd__step" data-step="2" hidden>
          <p class="rs-qd__sub">Tell us about your home.</p>
          <div class="rs-qd__row">
            <span class="rs-label">Bedrooms</span>
            <div class="rs-stepper" data-rs-qd-bedrooms></div>
          </div>
          <div class="rs-qd__row">
            <span class="rs-label">Bathrooms</span>
            <div class="rs-stepper" data-rs-qd-bathrooms></div>
          </div>
          <div class="rs-qd__row">
            <label class="rs-label" for="rs-qd-sqft">Square footage</label>
            <select id="rs-qd-sqft" class="rs-select" data-rs-qd-sqft></select>
          </div>
        </section>

        <section class="rs-qd__step" data-step="3" hidden>
          <p class="rs-qd__sub">How often?</p>
          <div class="rs-qd__freq-grid" role="radiogroup" aria-label="Frequency"></div>
        </section>

        <section class="rs-qd__step" data-step="4" hidden>
          <p class="rs-qd__sub">Add-ons (optional) and your preferred date.</p>
          <div class="rs-qd__addons" role="group" aria-label="Add-on services"></div>
          <div class="rs-qd__row">
            <label class="rs-label" for="rs-qd-date">Preferred date</label>
            <input id="rs-qd-date" class="rs-input" type="date" data-rs-qd-date>
          </div>
          <div class="rs-qd__row">
            <span class="rs-label">Preferred window</span>
            <div class="rs-qd__windows" role="radiogroup" aria-label="Time window"></div>
          </div>
          <label class="rs-qd__pets">
            <input type="checkbox" data-rs-qd-pets>
            <span>I have pets — use pet-safe products</span>
          </label>
        </section>

        <section class="rs-qd__step" data-step="5" hidden>
          <p class="rs-qd__sub">Almost done — where should we send the confirmation?</p>
          <div class="rs-qd__contact-grid">
            <div><label class="rs-label" for="rs-qd-fn">First name</label><input id="rs-qd-fn" class="rs-input" type="text" autocomplete="given-name" required data-rs-qd-fn></div>
            <div><label class="rs-label" for="rs-qd-ln">Last name</label><input id="rs-qd-ln" class="rs-input" type="text" autocomplete="family-name" required data-rs-qd-ln></div>
            <div><label class="rs-label" for="rs-qd-em">Email</label><input id="rs-qd-em" class="rs-input" type="email" autocomplete="email" required data-rs-qd-em></div>
            <div><label class="rs-label" for="rs-qd-ph">Phone</label><input id="rs-qd-ph" class="rs-input" type="tel" autocomplete="tel" inputmode="tel" required data-rs-qd-ph></div>
            <div class="rs-qd__contact-full"><label class="rs-label" for="rs-qd-ad">Street address</label><input id="rs-qd-ad" class="rs-input" type="text" autocomplete="street-address" required data-rs-qd-ad></div>
            <div><label class="rs-label" for="rs-qd-ci">City</label><input id="rs-qd-ci" class="rs-input" type="text" autocomplete="address-level2" required data-rs-qd-ci></div>
            <div><label class="rs-label" for="rs-qd-zp">ZIP</label><input id="rs-qd-zp" class="rs-input" type="text" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" required data-rs-qd-zp></div>
          </div>
          <input type="hidden" data-rs-qd-state value="GA">
          <div style="position:absolute;left:-9999px;" aria-hidden="true"><label>Don't fill this<input type="text" tabindex="-1" autocomplete="off" data-rs-qd-honey></label></div>
          <p class="rs-qd__legal">By submitting, you agree to receive a confirmation email or SMS. We never share your info.</p>
        </section>

        <section class="rs-qd__step rs-qd__step--success" data-step="success" hidden>
          <div class="rs-qd__success-icon" aria-hidden="true"></div>
          <h3 class="rs-qd__success-title">We've got it.</h3>
          <p class="rs-qd__success-body">Expect a confirmation text or email within 5 minutes. If your preferred slot is unavailable, we'll suggest the next one.</p>
          <div class="rs-qd__success-actions">
            <a class="rs-btn rs-btn--secondary rs-btn--sm" data-rs-qd-cal-google target="_blank" rel="noopener">Add to Google Calendar</a>
            <a class="rs-btn rs-btn--secondary rs-btn--sm" data-rs-qd-cal-ics download="redsky-cleaning.ics">Download .ics</a>
          </div>
        </section>
      </div>

      <footer class="rs-qd__foot">
        <div class="rs-qd__estimate" role="status" aria-live="polite">
          <span class="rs-qd__estimate-label">Your estimate</span>
          <strong class="rs-qd__estimate-amount" data-rs-qd-amount>$0</strong>
          <span class="rs-qd__estimate-savings" data-rs-qd-savings hidden></span>
        </div>
        <div class="rs-qd__actions">
          <button type="button" class="rs-btn rs-btn--ghost rs-btn--sm" data-rs-qd-back hidden>← Back</button>
          <button type="button" class="rs-btn rs-btn--primary" data-rs-qd-next>Continue →</button>
          <button type="submit" class="rs-btn rs-btn--cta" data-rs-qd-submit hidden>Send my quote</button>
        </div>
      </footer>
    </form>
  `;
  return drawer;
}

// -------- step renderers --------

function renderServiceCards(container) {
  const services = [
    { key: "standard", label: "Standard",   desc: "Routine upkeep" },
    { key: "deep",     label: "Deep clean", desc: "Top-to-bottom" },
    { key: "move_in",  label: "Move-in",    desc: "Spotless start" },
    { key: "move_out", label: "Move-out",   desc: "Inspection-ready" }
  ];
  container.innerHTML = "";
  services.forEach(s => {
    const start = pricing.serviceStartingAt(s.key);
    const card = h("label", { class: "rs-qd__svc-card" });
    card.innerHTML = `
      <input type="radio" name="rs-qd-service" value="${s.key}"${_state.service === s.key ? " checked" : ""}>
      <span class="rs-qd__svc-card-body">
        <span class="rs-qd__svc-title">${s.label}</span>
        <span class="rs-qd__svc-desc">${s.desc}</span>
        <span class="rs-qd__svc-price">From <strong>${pricing.formatUSD(start)}</strong></span>
      </span>
    `;
    card.querySelector("input").addEventListener("change", () => {
      _state.service = s.key; saveState(); recompute(); updateNextEnabled();
    });
    container.appendChild(card);
  });
}

function renderStepper(container, key, min, max) {
  container.innerHTML = `
    <button type="button" class="rs-stepper__btn" data-act="dec" aria-label="Decrease">−</button>
    <span class="rs-stepper__value" data-val>${_state[key]}</span>
    <button type="button" class="rs-stepper__btn" data-act="inc" aria-label="Increase">+</button>
  `;
  const valEl = container.querySelector("[data-val]");
  const decBtn = container.querySelector('[data-act="dec"]');
  const incBtn = container.querySelector('[data-act="inc"]');
  function refresh() {
    valEl.textContent = _state[key];
    decBtn.disabled = _state[key] <= min;
    incBtn.disabled = _state[key] >= max;
  }
  decBtn.addEventListener("click", () => { _state[key] = Math.max(min, _state[key] - 1); refresh(); saveState(); recompute(); });
  incBtn.addEventListener("click", () => { _state[key] = Math.min(max, _state[key] + 1); refresh(); saveState(); recompute(); });
  refresh();
}

function renderSqftSelect(select) {
  const tiers = ["<1500","1500-2000","2000-2500","2500-3000","3000-3500","3500-4000","4000+"];
  const labels = {
    "<1500":"Under 1,500 sq ft","1500-2000":"1,500 – 2,000 sq ft","2000-2500":"2,000 – 2,500 sq ft",
    "2500-3000":"2,500 – 3,000 sq ft","3000-3500":"3,000 – 3,500 sq ft","3500-4000":"3,500 – 4,000 sq ft","4000+":"4,000+ sq ft"
  };
  select.innerHTML = tiers.map(t => `<option value="${t}"${_state.sqftTier === t ? " selected" : ""}>${labels[t]}</option>`).join("");
  select.addEventListener("change", () => { _state.sqftTier = select.value; saveState(); recompute(); });
}

function renderFrequencyGrid(container) {
  const opts = [
    { key: "one_time", label: "One-time",   desc: "No commitment" },
    { key: "weekly",   label: "Weekly",     desc: "Save 20%" },
    { key: "biweekly", label: "Bi-weekly",  desc: "Save 15%", popular: true },
    { key: "monthly",  label: "Monthly",    desc: "Save 10%" }
  ];
  container.innerHTML = "";
  opts.forEach(o => {
    const card = h("label", { class: "rs-qd__freq-card" + (o.popular ? " is-popular" : "") });
    card.innerHTML = `
      <input type="radio" name="rs-qd-freq" value="${o.key}"${_state.frequency === o.key ? " checked" : ""}>
      ${o.popular ? '<span class="rs-badge rs-badge--red rs-qd__freq-tag">Most popular</span>' : ""}
      <span class="rs-qd__freq-title">${o.label}</span>
      <span class="rs-qd__freq-desc">${o.desc}</span>
    `;
    card.querySelector("input").addEventListener("change", () => { _state.frequency = o.key; saveState(); recompute(); });
    container.appendChild(card);
  });
}

function renderAddons(container) {
  const cfg = pricing.config;
  if (!cfg) return;
  container.innerHTML = "";
  Object.entries(cfg.addons).forEach(([key, a]) => {
    const id = "rs-qd-ad-" + key;
    const isOn = _state.addons.includes(key);
    const wrap = h("label", { class: "rs-qd__addon-chip" + (isOn ? " is-on" : "") });
    wrap.innerHTML = `
      <input type="checkbox" id="${id}"${isOn ? " checked" : ""}>
      <span class="rs-qd__addon-label">${a.label}</span>
      <span class="rs-qd__addon-price">+${pricing.formatUSD(a.price)}${a.unit === "per_room" ? "/rm" : a.unit === "per_load" ? "/load" : ""}</span>
    `;
    wrap.querySelector("input").addEventListener("change", e => {
      const on = e.target.checked;
      const i = _state.addons.indexOf(key);
      if (on && i < 0) _state.addons.push(key);
      if (!on && i >= 0) _state.addons.splice(i, 1);
      wrap.classList.toggle("is-on", on);
      saveState(); recompute();
    });
    container.appendChild(wrap);
  });
}

function renderTimeWindows(container) {
  const cfg = pricing.config;
  if (!cfg) return;
  container.innerHTML = "";
  cfg.time_window_radios.forEach(w => {
    const lbl = h("label", { class: "rs-qd__tw" });
    lbl.innerHTML = `<input type="radio" name="rs-qd-tw" value="${w.value}"${_state.timeWindow === w.value ? " checked" : ""}><span>${w.label}</span>`;
    lbl.querySelector("input").addEventListener("change", () => { _state.timeWindow = w.value; saveState(); });
    container.appendChild(lbl);
  });
}

function bindContact(form) {
  const fields = [
    ["fn","first_name"],["ln","last_name"],["em","email"],["ph","phone"],
    ["ad","address"],["ci","city"],["zp","zip"]
  ];
  for (const [key, prop] of fields) {
    const el = form.querySelector(`[data-rs-qd-${key}]`);
    if (!el) continue;
    el.value = _state.contact[prop] || "";
    el.addEventListener("input", () => { _state.contact[prop] = el.value; saveState(); });
    el.addEventListener("blur", () => validateContactField(el, prop));
  }
}

function validateContactField(el, prop) {
  const v = (el.value || "").trim();
  let ok = true; let msg = "";
  if (el.hasAttribute("required") && !v) { ok = false; msg = "Required."; }
  else if (prop === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { ok = false; msg = "Enter a valid email."; }
  else if (prop === "phone" && v && v.replace(/\D/g, "").length < 10) { ok = false; msg = "10 digits, please."; }
  else if (prop === "zip"   && v && !/^\d{5}$/.test(v)) { ok = false; msg = "5 digits."; }
  el.setAttribute("aria-invalid", ok ? "false" : "true");
  let err = el.parentElement.querySelector(".rs-field-error");
  if (!ok) {
    if (!err) { err = h("span", { class: "rs-field-error" }); el.parentElement.appendChild(err); }
    err.textContent = msg;
  } else if (err) err.remove();
  return ok;
}

// -------- recompute --------

let _lastMid = 0;
function recompute() {
  if (!pricing.config || !_state.service) {
    const el = _drawer.querySelector("[data-rs-qd-amount]");
    if (el) el.textContent = pricing.formatUSD(0);
    return;
  }
  const result = pricing.computePrice(_state);
  const amountEl = _drawer.querySelector("[data-rs-qd-amount]");
  const savingsEl = _drawer.querySelector("[data-rs-qd-savings]");
  if (amountEl) tweenNumber(amountEl, _lastMid, result.mid);
  _lastMid = result.mid;
  if (savingsEl) {
    if (result.savings && result.savings.dollars > 0) {
      savingsEl.textContent = `Save ${pricing.formatUSD(result.savings.dollars)} per visit`;
      savingsEl.hidden = false;
    } else { savingsEl.hidden = true; }
  }
}

// -------- step navigation --------

function showStep(n) {
  _step = Math.max(1, Math.min(TOTAL_STEPS, n));
  _state.step = _step; saveState();
  _drawer.querySelectorAll(".rs-qd__step").forEach(s => { s.hidden = s.dataset.step !== String(_step); });
  _drawer.querySelector("[data-rs-qd-step]").textContent = _step;
  _drawer.querySelector(".rs-qd__progress-fill").style.width = (_step / TOTAL_STEPS * 100) + "%";
  _drawer.querySelector("[data-rs-qd-back]").hidden = _step === 1;
  _drawer.querySelector("[data-rs-qd-next]").hidden = _step === TOTAL_STEPS;
  _drawer.querySelector("[data-rs-qd-submit]").hidden = _step !== TOTAL_STEPS;
  updateNextEnabled();

  const active = _drawer.querySelector(`.rs-qd__step[data-step="${_step}"]`);
  const focusable = active && active.querySelector("input:not([type='hidden']):not([disabled]), select:not([disabled]), button:not([disabled]), textarea:not([disabled])");
  if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 80);
}

function updateNextEnabled() {
  const next = _drawer.querySelector("[data-rs-qd-next]");
  next.disabled = (_step === 1 && !_state.service);
}

function showSuccess() {
  _drawer.querySelectorAll(".rs-qd__step").forEach(s => { s.hidden = s.dataset.step !== "success"; });

  // Keep the close button accessible — only hide the progress / step label / title.
  const head = _drawer.querySelector(".rs-qd__head");
  if (head) {
    const progress  = head.querySelector(".rs-qd__progress");
    const stepLabel = head.querySelector(".rs-qd__step-label");
    const title     = head.querySelector(".rs-qd__title");
    if (progress)  progress.style.display = "none";
    if (stepLabel) stepLabel.style.display = "none";
    if (title)     title.style.display = "none";
    head.style.borderBottom = "0";
    // The close button (data-rs-qd-close) intentionally stays visible.
  }
  const foot = _drawer.querySelector(".rs-qd__foot");
  if (foot) foot.style.display = "none";

  // Build calendar links — fall back to tomorrow 9 AM if user didn't pick
  // a date, and tolerate any timeWindow value via a lookup with default.
  const contact = _state.contact || {};
  const fallbackDate = (function () {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10); // YYYY-MM-DD
  })();
  const dateStr = (_state.date && /^\d{4}-\d{2}-\d{2}$/.test(_state.date)) ? _state.date : fallbackDate;

  const winMap = {
    "8-11":      ["T080000", "T110000"],
    "11-2":      ["T110000", "T140000"],
    "2-5":       ["T140000", "T170000"],
    "morning":   ["T080000", "T110000"],
    "midday":    ["T110000", "T140000"],
    "afternoon": ["T140000", "T170000"]
  };
  const times = winMap[_state.timeWindow] || ["T090000", "T120000"];
  const startISO = dateStr.replace(/-/g, "") + times[0];
  const endISO   = dateStr.replace(/-/g, "") + times[1];

  const serviceLabelSafe =
    (pricing && typeof pricing.serviceLabel === "function" && _state.service)
      ? pricing.serviceLabel(_state.service)
      : (_state.service || "House Cleaning");
  const calTitle = "Red Sky Cleaning — " + serviceLabelSafe;
  const addrParts = [contact.address, contact.city, contact.zip ? "GA " + contact.zip : ""].filter(Boolean);
  const details = addrParts.length
    ? "Address: " + addrParts.join(", ")
    : "We will text/email you to confirm the address.";

  const gurl = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent(calTitle)
    + "&dates=" + startISO + "/" + endISO
    + "&details=" + encodeURIComponent(details)
    + (addrParts.length ? "&location=" + encodeURIComponent(addrParts.join(", ")) : "");

  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Red Sky Cleaning//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + Date.now() + "@redskycleaning.com",
    "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
    "DTSTART:" + startISO,
    "DTEND:" + endISO,
    "SUMMARY:" + calTitle,
    "DESCRIPTION:" + details.replace(/\n/g, "\\n"),
    addrParts.length ? "LOCATION:" + addrParts.join(", ") : "",
    "END:VEVENT", "END:VCALENDAR"
  ].filter(Boolean).join("\r\n");

  const gBtn = _drawer.querySelector("[data-rs-qd-cal-google]");
  const iBtn = _drawer.querySelector("[data-rs-qd-cal-ics]");
  if (gBtn) {
    gBtn.href = gurl;
    gBtn.removeAttribute("hidden");
  }
  if (iBtn) {
    // Use a Blob URL so the browser reliably honors the download attribute
    // (data: URIs are blocked for downloads under some browser configs).
    try {
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      iBtn.href = URL.createObjectURL(blob);
    } catch (e) {
      iBtn.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    }
    iBtn.setAttribute("download", "redsky-cleaning.ics");
    iBtn.removeAttribute("hidden");
  }
  const actions = _drawer.querySelector(".rs-qd__success-actions");
  if (actions) actions.hidden = false;
}

// -------- submit --------

async function submit() {
  const propMap = { fn:"first_name", ln:"last_name", em:"email", ph:"phone", ad:"address", ci:"city", zp:"zip" };
  let allOk = true;
  for (const [key, prop] of Object.entries(propMap)) {
    const el = _drawer.querySelector(`[data-rs-qd-${key}]`);
    if (el && !validateContactField(el, prop)) allOk = false;
  }
  const honey = _drawer.querySelector("[data-rs-qd-honey]");
  if (honey && honey.value) { allOk = true; /* silently fail-success on bot */ }
  if (!allOk) {
    const firstBad = _drawer.querySelector("[aria-invalid='true']");
    if (firstBad) firstBad.focus();
    return;
  }

  await loadEndpoints();
  const result = pricing.computePrice(_state);
  const summary = pricing.summarize(_state, result);

  const payload = Object.assign({
    form_type: "quote",
    submitted_at: new Date().toISOString(),
    page_url: location.href,
    referrer: document.referrer || null
  }, _state.contact, summary, {
    pets: _state.pets,
    preferred_date: _state.date,
    preferred_window: _state.timeWindow,
    addons_list: _state.addons.join(", ") || "None"
  });

  const submitBtn = _drawer.querySelector("[data-rs-qd-submit]");
  submitBtn.disabled = true;
  const origText = submitBtn.textContent;
  submitBtn.textContent = "Sending…";

  try {
    if (_endpoints.quote_webhook && !isPlaceholderUrl(_endpoints.quote_webhook) && !(honey && honey.value)) {
      await fetch(_endpoints.quote_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors"
      });
    }
    if (window.dataLayer) window.dataLayer.push({ event: "submit_quote", ...summary });
    showSuccess();
    clearState();
  } catch {
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
    alert("Something went wrong sending your quote. Please call (470) 240-0645 or try again.");
  }
}

// -------- public API + bootstrap --------

async function ensureMounted() {
  if (_drawer) return _drawer;
  await pricing.ready();
  _state = loadState();
  _drawer = buildShell();
  document.body.appendChild(_drawer);

  renderServiceCards(_drawer.querySelector(".rs-qd__svc-grid"));
  renderStepper(_drawer.querySelector("[data-rs-qd-bedrooms]"), "bedrooms", 0, 6);
  renderStepper(_drawer.querySelector("[data-rs-qd-bathrooms]"), "bathrooms", 0, 6);
  renderSqftSelect(_drawer.querySelector("[data-rs-qd-sqft]"));
  renderFrequencyGrid(_drawer.querySelector(".rs-qd__freq-grid"));
  renderAddons(_drawer.querySelector(".rs-qd__addons"));
  renderTimeWindows(_drawer.querySelector(".rs-qd__windows"));
  bindContact(_drawer);

  const dateEl = _drawer.querySelector("[data-rs-qd-date]");
  dateEl.value = _state.date || "";
  dateEl.min = new Date().toISOString().split("T")[0];
  dateEl.addEventListener("change", () => { _state.date = dateEl.value; saveState(); });

  const petsEl = _drawer.querySelector("[data-rs-qd-pets]");
  petsEl.checked = !!_state.pets;
  petsEl.addEventListener("change", () => { _state.pets = petsEl.checked; saveState(); });

  _drawer.querySelector("[data-rs-qd-close]").addEventListener("click", close);
  _drawer.querySelector("[data-rs-qd-back]").addEventListener("click", () => showStep(_step - 1));
  _drawer.querySelector("[data-rs-qd-next]").addEventListener("click", () => showStep(_step + 1));
  _drawer.addEventListener("submit", e => { e.preventDefault(); submit(); });
  _drawer.addEventListener("cancel", e => { e.preventDefault(); close(); });

  showStep(_state.step || 1);
  recompute();
  return _drawer;
}

async function open(prefill) {
  await ensureMounted();
  if (prefill && typeof prefill === "object") {
    if (prefill.service && pricing.config?.base?.[prefill.service]) {
      _state.service = prefill.service;
      const radio = _drawer.querySelector(`input[name="rs-qd-service"][value="${prefill.service}"]`);
      if (radio) radio.checked = true;
    }
    if (prefill.zip) _state.contact.zip = prefill.zip;
    saveState(); recompute();
  }
  if (typeof _drawer.showModal === "function") _drawer.showModal();
  else _drawer.setAttribute("open", "");
  document.body.classList.add("rs-drawer-open");
  if (window.dataLayer) window.dataLayer.push({ event: "start_quote" });
}

function close() {
  if (!_drawer) return;
  if (typeof _drawer.close === "function") _drawer.close();
  else _drawer.removeAttribute("open");
  document.body.classList.remove("rs-drawer-open");
}

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-rs-open-quote]");
  if (!btn) return;
  e.preventDefault();
  const prefill = {};
  if (btn.dataset.rsPrefillService) prefill.service = btn.dataset.rsPrefillService;
  if (btn.dataset.rsPrefillZip) prefill.zip = btn.dataset.rsPrefillZip;
  open(prefill);
});

const RSQuoteDrawer = { open, close };
if (typeof window !== "undefined") window.RSQuoteDrawer = RSQuoteDrawer;
export default RSQuoteDrawer;
