/* ═══════════════════════════════════════════
   main.js — entry point: init, game loop, tabs
   Depends on: all other modules
   ═══════════════════════════════════════════ */
'use strict';

// ── Offline modal ─────────────────────────

function showOfflineModal(sec, earned) {
  const MAX = 7200;
  const pct = Math.min(sec / MAX * 100, 100).toFixed(1);

  document.getElementById('offline-earned').textContent  = '+' + fmtBalance(earned);
  document.getElementById('offline-bar-fill').style.width = pct + '%';
  document.getElementById('offline-time-val').textContent = fmtTime(sec) +
    ' из ' + fmtTime(MAX);

  document.getElementById('offline-modal').classList.add('show');
}

document.getElementById('offline-close').addEventListener('click', () => {
  document.getElementById('offline-modal').classList.remove('show');
});

// ── Tab navigation ────────────────────────

(function initTabs() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(tab + '-panel').classList.add('active');

      if (tab === 'shop')     renderShop();
      if (tab === 'upgrades') renderUpgrades();
      if (tab === 'ach')      renderAchievements();
    });
  });
})();

// ── Game loop (200 ms tick) ───────────────

let _lastTick             = Date.now();
let _ticksSinceShopRender = 0;

setInterval(() => {
  const now = Date.now();
  const dt  = Math.min((now - _lastTick) / 1000, 1); // cap at 1 s to avoid offline spike
  _lastTick  = now;

  G.sps      = calcSps();
  const earn = G.sps * dt;
  G.sat      += earn;
  G.total    += earn;
  G.playtime += dt;

  renderHeader();
  renderStats();

  // Re-render shop/upgrades only every 5 ticks (1 s) to save CPU
  _ticksSinceShopRender++;
  if (_ticksSinceShopRender >= 5) {
    _ticksSinceShopRender = 0;
    if (document.getElementById('shop-panel').classList.contains('active'))     renderShop();
    if (document.getElementById('upgrades-panel').classList.contains('active')) renderUpgrades();
  }

  checkAchievements();
}, 200);

// ── Playtime clock (1 s tick) ─────────────

setInterval(() => {
  document.getElementById('header-time').textContent = fmtTime(G.playtime);
}, 1000);

// ── Autosave (15 s) ───────────────────────

setInterval(save, 15000);

// ── Initialise ────────────────────────────

(function init() {
  const offlineSec = load();
  recalcMults();
  G.sps = calcSps();

  // ── Offline earnings ────────────────────
  if (offlineSec >= 30 && G.sps > 0) {
    const earned = G.sps * offlineSec;
    G.sat   += earned;
    G.total += earned;
    showOfflineModal(offlineSec, earned);
  }

  renderHeader();
  renderStats();
  renderShop();
  renderUpgrades();
  renderAchievements();
  checkAchievements();
  save();
})();
