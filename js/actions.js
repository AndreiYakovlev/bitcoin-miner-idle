/* ═══════════════════════════════════════════
   actions.js — player interactions (buy, click)
   Depends on: data.js, state.js, utils.js, render.js, achievements.js
   ═══════════════════════════════════════════ */
'use strict';

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
  const power = calcClickPow();
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
