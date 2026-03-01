/* ═══════════════════════════════════════════
   actions.js — player interactions (buy, click)
   Depends on: data.js, state.js, utils.js, render.js, achievements.js
   ═══════════════════════════════════════════ */
'use strict';

// ── Frenzy config ─────────────────────────
const FRENZY_THRESHOLD  = 500;  // ms between clicks to keep frenzy growing
const FRENZY_RATE_UP    = 1;   // points gained per second while clicking fast
const FRENZY_RATE_DOWN  = 25;   // points lost per second when idle

let _frenzyLastClick = 0;

/** Called each game-loop tick to evolve the frenzy multiplier. */
function updateFrenzy(dt) {
  const now = Date.now();
  if (_frenzyLastClick > 0 && (now - _frenzyLastClick) < FRENZY_THRESHOLD) {
    G.clickFrenzy = Math.min(100, G.clickFrenzy + FRENZY_RATE_UP * dt);
  } else {
    G.clickFrenzy = Math.max(0, G.clickFrenzy - FRENZY_RATE_DOWN * dt);
  }
  renderFrenzy();
}

// ── Buy a miner ───────────────────────────

function buyMiner(m) {
  const qty   = G.buyMode === 0 ? calcMaxBuy(m) : G.buyMode;
  if (qty <= 0) return;
  const price = calcBulkPrice(m, qty);
  if (G.sat < price) return;

  G.sat -= price;
  G.miners[m.id] = (G.miners[m.id] || 0) + qty;
  G.devices += qty;

  renderShop();
  renderHeader();
  renderStats();
  checkAchievements();
  save();
}

// ── Buy a manager ──────────────────────

function buyManager(m) {
  const qty   = G.buyMode === 0 ? calcManagerMaxBuy(m) : G.buyMode;
  if (qty <= 0) return;
  const price = calcManagerBulkPrice(m, qty);
  if (G.sat < price) return;

  G.sat -= price;
  G.managers[m.id] = (G.managers[m.id] || 0) + qty;

  renderShop();
  renderHeader();
  renderStats();
  checkAchievements();
  save();
}

// ── Buy an upgrade ────────────────────────

function buyUpgrade(u) {
  if (G.upgrades[u.id] || G.sat < u.price) return;

  G.sat -= u.price;
  G.upgrades[u.id] = true;
  G.upgCount++;

  recalcMults();
  renderUpgrades();
  renderHeader();
  renderStats();
  checkAchievements();
  save();
}

// ── Coin click ────────────────────────────

function doClick(cx, cy) {
  _frenzyLastClick  = Date.now();
  const base  = calcClickPow();
  const power = Math.round(base * (1 + G.clickFrenzy / 100));
  G.sat    += power;
  G.total  += power;
  G.clicks++;

  renderHeader();
  renderStats();
  checkAchievements();
  spawnFloat(cx, cy, '+' + fmt(power) + ' sat');
  save();
}

// ── Coin element events ───────────────────

(function initCoinEvents() {
  const coinEl = document.getElementById('coin');

  coinEl.addEventListener('pointerdown', e => {
    e.preventDefault();
    coinEl.classList.add('clicked');
    doClick(e.clientX, e.clientY);
  });
  coinEl.addEventListener('pointerup',    () => coinEl.classList.remove('clicked'));
  coinEl.addEventListener('pointerleave', () => coinEl.classList.remove('clicked'));
})();
