// Red Sky Cleaning — pricing engine (spec §7.2)
// Vanilla ES module. No dependencies. Consumed by quote-drawer.js + inline-calc.js.
//
// Public API:
//   await pricing.ready()         → resolves when config is loaded (or fallback)
//   pricing.config                → the loaded config object (read-only after ready)
//   pricing.computePrice(input)   → { low, high, mid, breakdown[], savings, error? }
//   pricing.serviceLabel(key)     → display name for a service key
//   pricing.zipInServiceArea(zip) → boolean
//   pricing.formatUSD(n)          → "$1,234"
//
// The engine is intentionally pure (no DOM access, no fetch except for config).

const CONFIG_URL = "/config/pricing.json";

/** Embedded fallback used when the JSON cannot be fetched (offline, file:// preview, etc.).
 *  Mirrors spec §7.2 verbatim so behavior matches even if the network blob fails. */
const FALLBACK_CONFIG = Object.freeze({
  version: "1.0.0",
  currency: "USD",
  base: { standard: 100, deep: 250, move_in: 250, move_out: 250 },
  per_bedroom: { standard: 25, deep: 45, move_in: 45, move_out: 45 },
  per_bathroom: { standard: 20, deep: 40, move_in: 40, move_out: 40 },
  sqft_tier_multiplier: {
    "<1500": 1.0, "1500-2000": 1.1, "2000-2500": 1.2,
    "2500-3000": 1.32, "3000-3500": 1.45, "3500-4000": 1.58, "4000+": 1.72
  },
  addons: {
    inside_fridge:            { label: "Inside fridge",       price: 35, unit: "flat" },
    inside_oven:              { label: "Inside oven",         price: 35, unit: "flat" },
    inside_cabinets_per_room: { label: "Inside cabinets",     price: 25, unit: "per_room" },
    inside_windows_per_room:  { label: "Inside windows",      price: 20, unit: "per_room" },
    laundry_load:             { label: "Laundry load",        price: 15, unit: "per_load" },
    wall_scuff_per_room:      { label: "Wall scuff removal",  price: 20, unit: "per_room" },
    blinds_per_room:          { label: "Blinds",              price: 15, unit: "per_room" },
    dishes:                   { label: "Dishes",              price: 20, unit: "flat" },
    baseboards_detailed:      { label: "Detailed baseboards", price: 40, unit: "flat" }
  },
  frequency_discount: { one_time: 0, weekly: 0.20, biweekly: 0.15, monthly: 0.10 },
  service_labels: {
    standard: "Standard cleaning",
    deep:     "Deep clean",
    move_in:  "Move-in cleaning",
    move_out: "Move-out cleaning"
  },
  service_starting_at: { standard: 100, deep: 250, move_in: 250, move_out: 250 },
  time_window_radios: [
    { value: "8-11", label: "8 am – 11 am" },
    { value: "11-2", label: "11 am – 2 pm" },
    { value: "2-5",  label: "2 pm – 5 pm" }
  ],
  service_area_zips: [
    "30004","30005","30009","30022","30023","30024","30097",
    "30043","30044","30045","30046",
    "30060","30061","30062","30063","30064","30066","30067","30068",
    "30518","30519",
    "30501","30503","30504","30506","30507",
    "30114","30115",
    "30534",
    "30680",
    "30305","30309","30326","30327"
  ]
});

let _config = null;
let _ready = null;

/** Load config exactly once. Subsequent calls return the cached promise. */
function ready() {
  if (_ready) return _ready;
  _ready = (async () => {
    try {
      const res = await fetch(CONFIG_URL, { cache: "default" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      _config = Object.freeze(await res.json());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[pricing] config fetch failed; using embedded fallback.", err);
      _config = FALLBACK_CONFIG;
    }
    return _config;
  })();
  return _ready;
}

/** Resolve a sqft tier from a raw number. */
function sqftTierFromNumber(n) {
  if (typeof n !== "number" || !isFinite(n) || n <= 0) return "<1500";
  if (n < 1500) return "<1500";
  if (n < 2000) return "1500-2000";
  if (n < 2500) return "2000-2500";
  if (n < 3000) return "2500-3000";
  if (n < 3500) return "3000-3500";
  if (n < 4000) return "3500-4000";
  return "4000+";
}

/** Compute a price quote.
 *  @param {object} input
 *    service          – "standard" | "deep" | "move_in" | "move_out"
 *    bedrooms         – integer ≥ 0
 *    bathrooms        – integer ≥ 0
 *    sqftTier         – string key from config.sqft_tier_multiplier (optional)
 *    sqft             – numeric square footage; used if sqftTier omitted
 *    addons           – array of addon keys, e.g. ["inside_fridge", "blinds_per_room"]
 *    addonRoomCounts  – object map { addonKey → number-of-rooms } for per_room/per_load addons
 *    frequency        – "one_time" | "weekly" | "biweekly" | "monthly"
 *  @returns {object}
 *    low, high, mid    – integer dollars (high = mid * 1.10, low = mid * 0.90)
 *    breakdown[]       – itemized list of { label, amount }
 *    savings           – { dollars, percent } if frequency discount applies
 *    error             – string if input invalid; other fields zeroed
 */
function computePrice(input) {
  if (!_config) {
    return { low: 0, high: 0, mid: 0, breakdown: [], savings: null, error: "config-not-ready" };
  }
  const cfg = _config;
  const svc = String(input?.service || "").toLowerCase();
  if (!cfg.base[svc]) {
    return { low: 0, high: 0, mid: 0, breakdown: [], savings: null, error: "unknown-service" };
  }

  const bedrooms  = Math.max(0, Math.floor(Number(input.bedrooms)  || 0));
  const bathrooms = Math.max(0, Math.floor(Number(input.bathrooms) || 0));
  const tier = input.sqftTier || sqftTierFromNumber(Number(input.sqft));
  const tierMult = cfg.sqft_tier_multiplier[tier] ?? 1.0;
  const freq = (input.frequency || "one_time").toLowerCase().replace("-", "_");
  const discount = cfg.frequency_discount[freq] ?? 0;
  const addonKeys = Array.isArray(input.addons) ? input.addons : [];
  const addonCounts = input.addonRoomCounts || {};

  const breakdown = [];

  // Base
  const basePart = cfg.base[svc];
  breakdown.push({ label: cfg.service_labels[svc] + " — base", amount: basePart });

  // Bedroom + bathroom premiums
  const bedPart  = bedrooms  * (cfg.per_bedroom[svc]  || 0);
  const bathPart = bathrooms * (cfg.per_bathroom[svc] || 0);
  if (bedPart)  breakdown.push({ label: bedrooms  + " × bedroom",  amount: bedPart  });
  if (bathPart) breakdown.push({ label: bathrooms + " × bathroom", amount: bathPart });

  // Subtotal before sqft + discount
  const interior = basePart + bedPart + bathPart;
  const sqftScaled = interior * tierMult;
  const sqftDelta = Math.round(sqftScaled - interior);
  if (tierMult !== 1.0) {
    breakdown.push({
      label: "Home size adjustment (" + tier + " sq ft × " + tierMult.toFixed(2) + ")",
      amount: sqftDelta
    });
  }

  // Add-ons (with per_room / per_load handling)
  let addonsTotal = 0;
  for (const key of addonKeys) {
    const a = cfg.addons[key];
    if (!a) continue;
    const count = (a.unit === "per_room" || a.unit === "per_load")
      ? Math.max(1, Number(addonCounts[key]) || 1)
      : 1;
    const amt = a.price * count;
    breakdown.push({
      label: a.label + (count > 1 ? " × " + count : ""),
      amount: amt
    });
    addonsTotal += amt;
  }

  // Pre-discount subtotal
  const subtotal = sqftScaled + addonsTotal;

  // Discount (frequency)
  let savings = null;
  let final = subtotal;
  if (discount > 0) {
    const saved = Math.round(subtotal * discount);
    final = subtotal - saved;
    savings = { dollars: saved, percent: Math.round(discount * 100) };
    breakdown.push({
      label: "Recurring discount (" + savings.percent + "% off " + freq.replace("_", "-") + ")",
      amount: -saved
    });
  }

  const mid = Math.round(final);
  // Show a tight range (±10%) so customers see a single anchor with realistic variance
  const low  = Math.round(mid * 0.90);
  const high = Math.round(mid * 1.10);

  return { low, high, mid, breakdown, savings };
}

function serviceLabel(key) {
  return _config?.service_labels?.[key] || key;
}

function serviceStartingAt(key) {
  return _config?.service_starting_at?.[key] || _config?.base?.[key] || 0;
}

function zipInServiceArea(zip) {
  const z = String(zip || "").trim();
  if (!/^\d{5}$/.test(z)) return false;
  return Boolean(_config?.service_area_zips?.includes(z));
}

const _usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});
function formatUSD(n) {
  if (typeof n !== "number" || !isFinite(n)) return "$0";
  return _usdFormatter.format(n);
}

/** Snapshot summary suitable for tracking events + Zapier payloads. */
function summarize(input, result) {
  return {
    service: input.service,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    sqft_tier: input.sqftTier || sqftTierFromNumber(Number(input.sqft)),
    addons: (input.addons || []).join("+"),
    frequency: input.frequency,
    estimate_low: result.low,
    estimate_high: result.high,
    estimate_mid: result.mid,
    discount_percent: result.savings?.percent || 0,
    discount_dollars: result.savings?.dollars || 0
  };
}

const pricing = {
  ready,
  get config() { return _config; },
  computePrice,
  sqftTierFromNumber,
  serviceLabel,
  serviceStartingAt,
  zipInServiceArea,
  formatUSD,
  summarize
};

// Expose globally for non-module callers (e.g., legacy inline scripts) and as default ES module
if (typeof window !== "undefined") window.RSPricing = pricing;
export default pricing;
