/* ═══════════════════════════════════════════
   state.js — game state, save/load, maths
   Depends on: data.js
   ═══════════════════════════════════════════ */
'use strict';

const SAVE_KEY = 'btc_miner_v2';

// ── Game state object ─────────────────────
const G = {
  sat:            0,
  total:          0,
  clicks:         0,
  devices:        0,
  sps:            0,
  playtime:       0,
  upgCount:       0,
  miners:         {},
  upgrades:       {},
  achiev:         {},
  clickMult:      1,
  allMult:        1,
  // ─ Prestige ───────────────────────────────
  prestigePoints: 0,   // total accumulated points across all runs
  prestigeRuns:   0,   // number of times prestiged
};

// ── Pure calculations ─────────────────────

/** Next purchase price for a miner (exponential scaling). */
function getMinerPrice(m) {
  const owned = G.miners[m.id] || 0;
  return Math.ceil(m.basePrice * Math.pow(1.15, owned));
}

/** Total sat/sec from all miners × global multiplier × prestige bonus. */
function calcSps() {
  let s = 0;
  for (const m of MINERS) s += m.baseSps * (G.miners[m.id] || 0);
  return s * G.allMult * calcPrestigeBonus();
}

/** Bonus multiplier from prestige points: +2% per point. */
function calcPrestigeBonus() {
  return 1 + G.prestigePoints * 0.02;
}

/** Points earned if prestige is triggered now. */
function calcPrestigeGain() {
  return Math.floor(Math.sqrt(G.sps / 100));
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

/** Reset run but keep prestige + achievements. */
function doPrestige() {
  const gain = calcPrestigeGain();
  if (gain <= 0) return false;

  const savedAchiev         = G.achiev;
  const savedPrestigePoints = G.prestigePoints + gain;
  const savedPrestigeRuns   = G.prestigeRuns   + 1;

  // reset all run data
  G.sat       = 0;
  G.total     = 0;
  G.clicks    = 0;
  G.devices   = 0;
  G.sps       = 0;
  G.playtime  = 0;
  G.upgCount  = 0;
  G.miners    = {};
  G.upgrades  = {};
  G.clickMult = 1;
  G.allMult   = 1;

  // restore persisted data
  G.achiev         = savedAchiev;
  G.prestigePoints = savedPrestigePoints;
  G.prestigeRuns   = savedPrestigeRuns;

  return true;
}

// ── Persistence ───────────────────────────

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      sat:            G.sat,
      total:          G.total,
      clicks:         G.clicks,
      devices:        G.devices,
      playtime:       G.playtime,
      upgCount:       G.upgCount,
      miners:         G.miners,
      upgrades:       G.upgrades,
      achiev:         G.achiev,
      prestigePoints: G.prestigePoints,
      prestigeRuns:   G.prestigeRuns,
      lastSeen:       Date.now(),
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
    if (d.miners          != null) G.miners         = d.miners;
    if (d.upgrades        != null) G.upgrades        = d.upgrades;
    if (d.achiev          != null) G.achiev          = d.achiev;
    if (d.prestigePoints  != null) G.prestigePoints  = d.prestigePoints;
    if (d.prestigeRuns    != null) G.prestigeRuns    = d.prestigeRuns;
    // return offline seconds for main.js to handle
    return d.lastSeen ? Math.min((Date.now() - d.lastSeen) / 1000, 7200) : 0;
  } catch (_) { return 0; }
}

// Save on tab close / navigation
window.addEventListener('beforeunload', save);
