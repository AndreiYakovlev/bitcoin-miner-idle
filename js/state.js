/* ═══════════════════════════════════════════
   state.js — game state, save/load, maths
   Depends on: data.js
   ═══════════════════════════════════════════ */
'use strict';

const SAVE_KEY = 'btc_miner_v2';

// ── Game state object ─────────────────────
const G = {
  sat:       0,     // current balance (satoshi)
  total:     0,     // all-time earned
  clicks:    0,     // total clicks
  devices:   0,     // total miners bought (sum of all counts)
  sps:       0,     // cached sat-per-second
  playtime:  0,     // seconds since first start
  upgCount:  0,     // number of upgrades purchased
  miners:    {},    // minerId → count
  upgrades:  {},    // upgradeId → true
  achiev:    {},    // achievId  → true
  clickMult: 1,     // current click multiplier (product of bought click upgrades)
  allMult:   1,     // current miner multiplier (product of bought all upgrades)
};

// ── Pure calculations ─────────────────────

/** Next purchase price for a miner (exponential scaling). */
function getMinerPrice(m) {
  const owned = G.miners[m.id] || 0;
  return Math.ceil(m.basePrice * Math.pow(1.15, owned));
}

/** Total sat/sec from all miners × global multiplier. */
function calcSps() {
  let s = 0;
  for (const m of MINERS) s += m.baseSps * (G.miners[m.id] || 0);
  return s * G.allMult;
}

/** Sat earned per click (integer). */
function calcClickPow() {
  return Math.max(1, Math.floor(G.clickMult));
}

/** Recalculate clickMult and allMult from purchased upgrades. */
function recalcMults() {
  let cm = 1, am = 1;
  for (const u of UPGRADES) {
    if (G.upgrades[u.id]) {
      if (u.type === 'click') cm *= u.mult;
      else                    am *= u.mult;
    }
  }
  G.clickMult = cm;
  G.allMult   = am;
}

// ── Persistence ───────────────────────────

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      sat:      G.sat,
      total:    G.total,
      clicks:   G.clicks,
      devices:  G.devices,
      playtime: G.playtime,
      upgCount: G.upgCount,
      miners:   G.miners,
      upgrades: G.upgrades,
      achiev:   G.achiev,
      lastSeen: Date.now(),
    }));
  } catch (_) {}
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    if (d.sat      != null) G.sat      = d.sat;
    if (d.total    != null) G.total    = d.total;
    if (d.clicks   != null) G.clicks   = d.clicks;
    if (d.devices  != null) G.devices  = d.devices;
    if (d.playtime != null) G.playtime = d.playtime;
    if (d.upgCount != null) G.upgCount = d.upgCount;
    if (d.miners   != null) G.miners   = d.miners;
    if (d.upgrades != null) G.upgrades = d.upgrades;
    if (d.achiev   != null) G.achiev   = d.achiev;
    // return offline seconds for main.js to handle
    return d.lastSeen ? Math.min((Date.now() - d.lastSeen) / 1000, 7200) : 0;
  } catch (_) { return 0; }
}

// Save on tab close / navigation
window.addEventListener('beforeunload', save);
