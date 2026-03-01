/* ═══════════════════════════════════════════
   main.js — entry point: init, game loop, tabs
   Depends on: all other modules
   ═══════════════════════════════════════════ */
'use strict';

// ── Ticker ───────────────────────────────────

(function initTicker() {
  const wrap = document.getElementById('ticker-wrap');
  const icon = document.getElementById('ticker-icon');
  const el   = document.getElementById('ticker-text');
  let idx = Math.floor(Math.random() * NEWS_TICKER.length);
  let nextTimer;

  function showNext() {
    el.classList.remove('ticker-visible', 'ticker-scroll');
    el.style.removeProperty('--ticker-offset');
    el.style.removeProperty('--ticker-dur');
    el.style.removeProperty('--ticker-delay');

    setTimeout(() => {
      el.textContent = NEWS_TICKER[idx % NEWS_TICKER.length];
      idx++;
      el.classList.add('ticker-visible');

      // measure after paint
      requestAnimationFrame(() => {
        const available = wrap.clientWidth - (icon ? icon.offsetWidth + 18 : 22);
        const textW     = el.offsetWidth;
        const overflow  = textW - available;

        clearTimeout(nextTimer);
        if (overflow > 8) {
          const scrollPx = overflow + 32;          // scroll past the cut-off + small buffer
          const dur      = scrollPx / 75;          // 75 px/s — comfortable reading speed
          const delay    = 1.0;                    // pause before moving
          el.style.setProperty('--ticker-offset', `-${scrollPx}px`);
          el.style.setProperty('--ticker-dur',    `${dur.toFixed(1)}s`);
          el.style.setProperty('--ticker-delay',  `${delay}s`);
          el.classList.add('ticker-scroll');
          nextTimer = setTimeout(showNext, (delay + dur + 1.5) * 1000);
        } else {
          nextTimer = setTimeout(showNext, 9000);
        }
      });
    }, 350);
  }

  showNext();
})();

// ── Live BTC price ────────────────────────

(function initBtcPrice() {
  const el = document.getElementById('btc-price');
  if (!el) return;

  let prevPrice = null;

  function fmtUsd(n) {
    return '₿ $' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function fetchPrice() {
    try {
      const res  = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
                               { cache: 'no-store' });
      const data = await res.json();
      const price = parseFloat(data.price);

      let arrow = '';
      if (prevPrice !== null && price !== prevPrice) {
        arrow = price > prevPrice
          ? '<span class="price-up">▲</span>'
          : '<span class="price-down">▼</span>';
      }
      prevPrice = price;
      el.innerHTML = fmtUsd(price) + (arrow ? '\u00a0' + arrow : '');
    } catch {
      /* network unavailable — keep last value */
    }
  }

  fetchPrice();
  setInterval(fetchPrice, 10_000);
})();

// ── Theme toggle ───────────────────────────

(function initTheme() {
  const app = document.getElementById('app');
  const btn = document.getElementById('theme-btn');
  const saved = localStorage.getItem('btc_theme') || 'dark';
  if (saved === 'light') { app.dataset.theme = 'light'; btn.textContent = '🌙'; }
  btn.addEventListener('click', () => {
    const isLight = app.dataset.theme === 'light';
    app.dataset.theme = isLight ? 'dark' : 'light';
    btn.textContent   = isLight ? '☀️' : '🌙';
    localStorage.setItem('btc_theme', app.dataset.theme);
  });
})();

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

document.getElementById('prestige-open-btn').addEventListener('click', () => {
  const gain     = calcPrestigeGain();
  const newTotal = G.prestigePoints + gain;
  const newBonus = (newTotal * 2).toFixed(0);

  document.getElementById('pconf-gain').textContent  = gain > 0 ? '+' + gain + ' очков' : '—';
  document.getElementById('pconf-total').textContent = gain > 0 ? newTotal + ' очков' : G.prestigePoints + ' очков';
  document.getElementById('pconf-bonus').textContent = '+' + (G.prestigePoints * 2).toFixed(0) + '% к sat/sec';
  document.getElementById('prestige-confirm').disabled = gain <= 0;

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

// ── Falling coins ──────────────────────────

(function initDropCoins() {
  const app = document.getElementById('app');
  let activeCoins = 0;
  const MAX_COINS = 3;

  function coinReward() {
    // 15 секунд SPS или 50 кликов — что больше
    return Math.max(Math.ceil(G.sps * 15), calcClickPow() * 50);
  }

  function spawnCoin() {
    if (activeCoins >= MAX_COINS) { scheduleNext(); return; }

    const reward   = coinReward();
    const fallDur  = (4.5 + Math.random() * 3).toFixed(2); // 4.5–7.5s
    const leftPct  = 8 + Math.random() * 72; // 8%–80%

    const el = document.createElement('div');
    el.className = 'drop-coin';
    el.style.left = leftPct + '%';
    el.style.setProperty('--fall-dur', fallDur + 's');

    el.innerHTML =
      '<div class="drop-coin-icon">🪙</div>' +
      '<div class="drop-coin-val">' + fmt(reward) + ' sat</div>';

    activeCoins++;

    // Collect on tap
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();

      // Reward
      G.sat   += reward;
      G.total += reward;
      renderHeader();
      renderStats();
      checkAchievements();
      save();

      // Burst effect
      const burst = document.createElement('div');
      burst.className = 'drop-collect-burst';
      const r = app.getBoundingClientRect();
      burst.style.left = (e.clientX - r.left) + 'px';
      burst.style.top  = (e.clientY - r.top)  + 'px';
      app.appendChild(burst);
      setTimeout(() => burst.remove(), 480);

      // Float text
      spawnFloat(e.clientX, e.clientY, '+' + fmt(reward) + ' sat');

      el.remove();
      activeCoins--;
    });

    // Auto-remove when animation ends
    el.addEventListener('animationend', () => {
      if (el.parentNode) { el.remove(); activeCoins--; }
    });

    app.appendChild(el);
    scheduleNext();
  }

  function scheduleNext() {
    const delay = (15 + Math.random() * 25) * 1000; // 15–40 сек
    setTimeout(spawnCoin, delay);
  }

  // First coin after 20–35 seconds
  setTimeout(spawnCoin, (20 + Math.random() * 15) * 1000);
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
  const autoEarn = calcAutoClick() * dt;
  G.sat      += earn + autoEarn;
  G.total    += earn + autoEarn;
  G.playtime += dt;

  renderHeader();
  renderStats();
  renderBoost();
  updateFrenzy(dt);

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
