/* ═══════════════════════════════════════════
   main.js — entry point: init, game loop, tabs
   Depends on: all other modules
   ═══════════════════════════════════════════ */
'use strict';

// ── Currency info modal ────────────────────

(function () {
  const modal = document.getElementById('currency-modal');
  const note  = document.getElementById('currency-sat-eq');

  function openCurrencyModal() {
    note.textContent = 'Сейчас у тебя: ' + fmtBalance(G.sat) +
      ' (ровно ' + fmt(G.sat) + ' sat)';
    modal.classList.add('show');
  }

  document.getElementById('balance-display').addEventListener('click', openCurrencyModal);
  document.getElementById('balance-hint').addEventListener('click', openCurrencyModal);
  document.getElementById('currency-close').addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
})();

// ── Hard reset ───────────────────────────

/** Вызови из консоли браузера: resetGame() */
window.resetGame = function () {
  document.getElementById('reset-modal').classList.add('show');
};

/** Добавить сатоши: addSat(1e9) */
window.addSat = function (amount) {
  amount = Number(amount) || 0;
  G.sat   += amount;
  G.total += amount;
  renderHeader();
  renderStats();
};

document.getElementById('reset-cancel').addEventListener('click', () => {
  document.getElementById('reset-modal').classList.remove('show');
});

document.getElementById('reset-confirm').addEventListener('click', () => {
  window.removeEventListener('beforeunload', save); // prevent save() on unload
  localStorage.removeItem(SAVE_KEY);
  location.reload();
});

// ── Prestige modal ───────────────────────

document.getElementById('prestige-btn').addEventListener('click', () => {
  const gain     = calcPrestigeGain();
  if (gain <= 0) return;
  const newTotal = G.prestigePoints + gain;
  const newBonus = (newTotal * 2).toFixed(0);

  document.getElementById('pconf-gain').textContent  = '+' + gain + ' очков';
  document.getElementById('pconf-total').textContent = newTotal + ' очков';
  document.getElementById('pconf-bonus').textContent = '+' + newBonus + '% к sat/sec';

  document.getElementById('prestige-modal').classList.add('show');
});

document.getElementById('prestige-cancel').addEventListener('click', () => {
  document.getElementById('prestige-modal').classList.remove('show');
});

document.getElementById('prestige-confirm').addEventListener('click', () => {
  document.getElementById('prestige-modal').classList.remove('show');

  doPrestige();
  recalcMults();
  G.sps = calcSps();

  renderHeader();
  renderStats();
  renderShop();
  renderUpgrades();
  renderAchievements();
  checkAchievements();
  save();
});

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

// ── Buy mode FAB ────────────────────────

(function initBuyMode() {
  const MODES  = [1, 10, 100, 0];
  const LABELS = ['×1', '×10', '×100', 'Макс'];
  const fab = document.getElementById('buy-mode-fab');

  fab.addEventListener('click', () => {
    const idx  = MODES.indexOf(G.buyMode);
    const next = (idx + 1) % MODES.length;
    G.buyMode  = MODES[next];
    fab.textContent = LABELS[next];
    fab.dataset.mode = G.buyMode;
    renderShop();
  });
})();

// ── Boost ─────────────────────────────────

document.getElementById('boost-btn').addEventListener('click', () => {
  if (G.boostCharges <= 0 || G.boostActive) return;
  activateBoost();
  renderBoost();
  showPopup('⚡', 'Буст активирован!', '×2 к sat/sec на 30 секунд');
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
      if (tab === 'stats')    renderStatPanel();
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
  if (G.sps > G.spsRecord) G.spsRecord = G.sps;
  const earn = G.sps * dt;
  G.sat      += earn;
  G.total    += earn;
  G.playtime += dt;

  renderHeader();
  renderStats();
  renderBoost();

  // Boost tick
  if (G.boostActive && Date.now() >= G.boostEndsAt) G.boostActive = false;
  if (G.boostCharges < 3 && G.boostChargeAt > 0 && Date.now() >= G.boostChargeAt) {
    G.boostCharges++;
    G.boostChargeAt = G.boostCharges < 3 ? G.boostChargeAt + 300000 : 0;
  }

  // Re-render shop/upgrades only every 5 ticks (1 s) to save CPU
  _ticksSinceShopRender++;
  if (_ticksSinceShopRender >= 5) {
    _ticksSinceShopRender = 0;
    if (document.getElementById('shop-panel').classList.contains('active'))     renderShop();
    if (document.getElementById('upgrades-panel').classList.contains('active')) renderUpgrades();
    if (document.getElementById('stats-panel').classList.contains('active'))    renderStatPanel();
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
  renderBoost();
  checkAchievements();
  save();
})();
