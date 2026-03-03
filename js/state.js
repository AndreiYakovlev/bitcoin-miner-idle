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
  // ─ Buy mode (session only) ────────────────
  buyMode:        1,   // 1 | 10 | 100 | 0 (= max)
  // ─ Frenzy (session only) ──────────────────
  clickFrenzy:    0,   // 0-100, bonus % to click power
  // ─ Boosts ────────────────────────────────
  boostActive:    false,
  boostEndsAt:    0,   // ms timestamp when boost expires
  // ─ Gems (постоянные, не сбрасываются престижем) ───
  gems:           0,
  gemUpgrades:    {},
  // ─ Stats (lifetime) ──────────────────────
  totalEver:       0,  // sat earned across ALL runs
  totalDevicesEver:0,  // devices bought across ALL runs
  spsRecord:       0,  // highest sps ever reached
  bestPrestigeGain:0,  // most points earned in a single prestige
  // ─ Managers ────────────────────────────────
  managers:       {},  // managerId → count
};

// ── Pure calculations ─────────────────────

/** Next purchase price for a miner (exponential scaling). */
function getMinerPrice(m) {
  const owned = G.miners[m.id] || 0;
  return Math.ceil(m.basePrice * Math.pow(1.15, owned));
}

/** Total sat/sec from all miners × global multiplier × prestige bonus × boost. */
function calcSps() {
  let s = 0;
  for (const m of MINERS) s += m.baseSps * (G.miners[m.id] || 0);
  return s * G.allMult * calcPrestigeBonus();
}

/** Total price for buying `qty` of miner `m` starting from current owned count. */
function calcBulkPrice(m, qty) {
  const owned = G.miners[m.id] || 0;
  let total = 0;
  for (let i = 0; i < qty; i++)
    total += Math.ceil(m.basePrice * Math.pow(1.15, owned + i));
  return total;
}

/** Max affordable quantity of miner `m` with current balance. */
function calcMaxBuy(m) {
  let qty = 0, total = 0;
  const owned = G.miners[m.id] || 0;
  while (qty < 10000) {
    const next = Math.ceil(m.basePrice * Math.pow(1.15, owned + qty));
    if (total + next > G.sat) break;
    total += next;
    qty++;
  }
  return qty;
}

/** Activate boost (×2 for 30/60 s). */
function activateBoost() {
  G.boostActive = true;
  G.boostEndsAt = Date.now() + calcBoostDuration() * 1000;
}

/** Bonus multiplier from prestige points: +2% per point. */
function calcPrestigeBonus() {
  return 1 + G.prestigePoints * 0.02;
}

/** Points earned if prestige is triggered now. */
function calcPrestigeGain() {
  const base = Math.floor(Math.sqrt(G.sps / 100));
  if (base <= 0) return 0;
  return base;
}

/** Max offline earnings seconds based on gem upgrades. */
function calcOfflineMax() {
  if (G.gemUpgrades['offline48h']) return 172800; // 48h
  if (G.gemUpgrades['offline12h']) return 43200;  // 12h
  if (G.gemUpgrades['offline4h'])  return 14400;  // 4h
  return 7200; // default 2h
}

/** Boost duration seconds based on boost_gem. */
function calcBoostDuration() {
  return G.gemUpgrades['boost_gem'] ? 45 : 30;
}

/** Sat earned per click (integer). Includes active boost ×2. */
function calcClickPow() {
  const boost = G.boostActive && Date.now() < G.boostEndsAt ? 2 : 1;
  return Math.max(1, Math.floor(G.clickMult * boost));
}

/** Auto-click sat/sec from managers (applies click power). */
function calcAutoClick() {
  let c = 0;
  for (const m of MANAGERS) c += m.clicksPerSec * (G.managers[m.id] || 0);
  return c * calcClickPow();
}

/** Price for buying `qty` managers starting from current owned. */
function calcManagerBulkPrice(m, qty) {
  const owned = G.managers[m.id] || 0;
  let total = 0;
  for (let i = 0; i < qty; i++)
    total += Math.ceil(m.basePrice * Math.pow(1.15, owned + i));
  return total;
}

/** Max affordable quantity of manager `m`. */
function calcManagerMaxBuy(m) {
  let qty = 0, total = 0;
  const owned = G.managers[m.id] || 0;
  while (qty < 10000) {
    const next = Math.ceil(m.basePrice * Math.pow(1.15, owned + qty));
    if (total + next > G.sat) break;
    total += next;
    qty++;
  }
  return qty;
}

/** Recalculate clickMult and allMult from purchased upgrades + gem upgrades. */
function recalcMults() {
  let cm = 1; // click multiplier 
  let am = 1; // all-miners multiplier
  for (const u of UPGRADES) {
    if (G.upgrades[u.id]) {
      if (u.type === 'click') cm *= u.mult;
      else                    am *= u.mult;
    }
  }
  for (const u of GEM_UPGRADES) {
    if (G.gemUpgrades[u.id] && u.type === 'click') cm *= u.mult;
    if (G.gemUpgrades[u.id] && u.type === 'all')   am *= u.mult;
  }
  G.clickMult = cm;
  G.allMult   = am;
}

/** Reset run but keep prestige + achievements + gems. */
function doPrestige() {
  const gain = calcPrestigeGain();
  if (gain <= 0) return false;

  const savedAchiev         = G.achiev;
  const savedPrestigePoints = G.prestigePoints + gain;
  const savedPrestigeRuns   = G.prestigeRuns   + 1;
  const savedPlaytime       = G.playtime;
  const savedTotalEver      = G.totalEver + G.total;
  const savedDevicesEver    = G.totalDevicesEver + G.devices;
  const savedBestGain       = Math.max(G.bestPrestigeGain, gain);
  const savedSpsRecord      = G.spsRecord;
  const savedGems           = G.gems;
  const savedGemUpgrades    = G.gemUpgrades;

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
  G.managers  = {};
  G.clickMult = 1;
  G.allMult   = 1;

  // restore persisted data
  G.achiev          = savedAchiev;
  G.prestigePoints  = savedPrestigePoints;
  G.prestigeRuns    = savedPrestigeRuns;
  G.playtime        = savedPlaytime;
  G.totalEver       = savedTotalEver;
  G.totalDevicesEver= savedDevicesEver;
  G.bestPrestigeGain= savedBestGain;
  G.spsRecord       = savedSpsRecord;
  G.gems            = savedGems;
  G.gemUpgrades     = savedGemUpgrades;
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
      totalEver:        G.totalEver,
      totalDevicesEver: G.totalDevicesEver,
      spsRecord:        G.spsRecord,
      bestPrestigeGain: G.bestPrestigeGain,
      managers:         G.managers,
      gems:             G.gems,
      gemUpgrades:      G.gemUpgrades,
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
    if (d.totalEver        != null) G.totalEver        = d.totalEver;
    if (d.totalDevicesEver != null) G.totalDevicesEver = d.totalDevicesEver;
    if (d.spsRecord        != null) G.spsRecord        = d.spsRecord;
    if (d.bestPrestigeGain != null) G.bestPrestigeGain = d.bestPrestigeGain;
    if (d.managers         != null) G.managers         = d.managers;
    if (d.gems             != null) G.gems             = d.gems;
    if (d.gemUpgrades      != null) G.gemUpgrades      = d.gemUpgrades;
    // return offline seconds for main.js to handle
    return d.lastSeen ? Math.min((Date.now() - d.lastSeen) / 1000, calcOfflineMax()) : 0;
  } catch (_) { return 0; }
}

// Save on tab close / navigation
window.addEventListener('beforeunload', save);
