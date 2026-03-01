/* ═══════════════════════════════════════════
   render.js — all DOM rendering functions
   Depends on: data.js, state.js, utils.js
   ═══════════════════════════════════════════ */
'use strict';

// ── Header / stats HUD ───────────────────

function renderHeader() {
  document.getElementById('balance-display').textContent = fmtBalance(G.sat);
  document.getElementById('sps-display').textContent     = '+' + fmtSps(G.sps);
}

function renderStats() {
  document.getElementById('stat-total').textContent   = fmtBalance(G.total);
  document.getElementById('stat-clicks').textContent  = fmt(G.clicks);
  document.getElementById('stat-devices').textContent = G.devices;
  document.getElementById('click-power').textContent  = fmt(calcClickPow());

  // Prestige button state
  const gain    = calcPrestigeGain();
  const canPres = gain > 0;
  const btn     = document.getElementById('prestige-btn');
  if (btn) {
    btn.disabled        = !canPres;
    btn.classList.toggle('ready', canPres);
    document.getElementById('prestige-gain-preview').textContent =
      canPres ? '+' + gain + ' очков' : 'нужно больше sat/s';
    document.getElementById('prestige-pts-total').textContent =
      G.prestigePoints + ' очков × 2% = +' +
      (G.prestigePoints * 2).toFixed(0) + '% к добыче';
    document.getElementById('prestige-run-val').textContent = G.prestigeRuns;

    // Progress bar toward next gain tier
    const curGain   = gain;
    const nextGain  = curGain + 1;
    const tLow      = curGain  * curGain  * 100;   // sps threshold for current gain
    const tHigh     = nextGain * nextGain * 100;   // sps threshold for next gain
    const span      = tHigh - tLow;
    const pct       = span > 0 ? Math.min(100, (G.sps - tLow) / span * 100) : 100;

    document.getElementById('prestige-bar-fill').style.width = pct.toFixed(1) + '%';

    let barLabel;
    if (canPres) {
      const needed = tHigh - G.sps;
      barLabel = 'Готово (+' + curGain + ' очков)  |  до +' + nextGain + ': ещё ' + fmtSps(needed);
    } else {
      const needed = tHigh - G.sps;
      barLabel = 'до +1 очка: ещё ' + fmtSps(Math.max(0, needed));
    }
    document.getElementById('prestige-bar-label').textContent = barLabel;
  }
}

// ── Shop ─────────────────────────────────

function renderShop() {
  const list = document.getElementById('shop-list');
  if (!list) return;
  list.innerHTML = '';

  const mode = G.buyMode;
  let affordCount = 0;

  for (const m of MINERS) {
    const owned    = G.miners[m.id] || 0;
    const qty      = mode === 0 ? calcMaxBuy(m) : mode;
    const price    = qty > 0 ? calcBulkPrice(m, qty) : getMinerPrice(m);
    const afford   = qty > 0 && G.sat >= price;
    if (afford) affordCount++;
    const qtyLabel = mode === 0 ? 'Макс×' + qty : '×' + mode;
    const spsEach  = m.baseSps * G.allMult;
    const spsText  = spsEach >= 1
      ? fmt(spsEach) + ' sat/sec каждый'
      : spsEach.toFixed(2) + ' sat/sec каждый';

    const card = document.createElement('div');
    card.className = 'item-card' + (afford ? ' affordable' : '');
    card.innerHTML =
      `<div class="item-emoji">${m.emoji}</div>` +
      `<div class="item-info">` +
        `<div class="item-name">${m.name}</div>` +
        `<div class="item-desc">${m.desc}</div>` +
        `<div class="item-sps">+${spsText}</div>` +
      `</div>` +
      `<div class="item-right">` +
        `<div class="item-price">${fmt(price)} sat</div>` +
        `<div class="item-buy-qty">${qtyLabel}</div>` +
        `<div class="item-count">${owned}</div>` +
      `</div>`;
    card.addEventListener('click', () => buyMiner(m));
    list.appendChild(card);
  }

  // ── Managers section ───────────────────
  const mgrdiv = document.createElement('div');
  mgrdiv.className = 'section-title manager-title';
  mgrdiv.textContent = '👤 Менеджеры (автоклик)';
  list.appendChild(mgrdiv);

  for (const m of MANAGERS) {
    const owned    = G.managers[m.id] || 0;
    const qty      = mode === 0 ? calcManagerMaxBuy(m) : mode;
    const price    = qty > 0 ? calcManagerBulkPrice(m, qty) : Math.ceil(m.basePrice);
    const afford   = qty > 0 && G.sat >= price;
    if (afford) affordCount++;
    const qtyLabel = mode === 0 ? 'Макс×' + qty : '×' + mode;
    const cps      = (m.clicksPerSec * calcClickPow()).toFixed(1);

    const card = document.createElement('div');
    card.className = 'item-card manager-card' + (afford ? ' affordable' : '');
    card.innerHTML =
      `<div class="item-emoji">${m.emoji}</div>` +
      `<div class="item-info">` +
        `<div class="item-name">${m.name}</div>` +
        `<div class="item-desc">${m.desc}</div>` +
        `<div class="item-sps">+${cps} sat/click·s</div>` +
      `</div>` +
      `<div class="item-right">` +
        `<div class="item-price">${fmt(price)} sat</div>` +
        `<div class="item-buy-qty">${qtyLabel}</div>` +
        `<div class="item-count">${owned}</div>` +
      `</div>`;
    card.addEventListener('click', () => buyManager(m));
    list.appendChild(card);
  }

  // update shop badge
  const shopBadge = document.getElementById('shop-badge');
  if (shopBadge) {
    shopBadge.textContent = affordCount > 99 ? '99+' : affordCount;
    shopBadge.style.display = affordCount > 0 ? 'block' : 'none';
  }
}

/** Lightweight badge-only update — called every game tick. */
function updateShopBadge() {
  const badge = document.getElementById('shop-badge');
  if (!badge) return;
  const mode = G.buyMode;
  let count = 0;
  for (const m of MINERS) {
    const qty   = mode === 0 ? calcMaxBuy(m) : mode;
    const price = qty > 0 ? calcBulkPrice(m, qty) : getMinerPrice(m);
    if (qty > 0 && G.sat >= price) count++;
  }
  for (const m of MANAGERS) {
    const qty   = mode === 0 ? calcManagerMaxBuy(m) : mode;
    const price = qty > 0 ? calcManagerBulkPrice(m, qty) : Math.ceil(m.basePrice);
    if (qty > 0 && G.sat >= price) count++;
  }
  badge.textContent    = count > 99 ? '99+' : count;
  badge.style.display  = count > 0 ? 'block' : 'none';
}

// ── Boost ─────────────────────────────────

function renderBoost() {
  const btn      = document.getElementById('boost-btn');
  const info     = document.getElementById('boost-info');
  const coinWrap = document.getElementById('coin-wrap');
  if (!btn) return;
  const now    = Date.now();
  const active = G.boostActive && now < G.boostEndsAt;
  if (coinWrap) coinWrap.classList.toggle('boost-active', active);
  if (active) {
    const rem = Math.ceil((G.boostEndsAt - now) / 1000);
    btn.disabled = true;
    btn.classList.add('running');
    btn.querySelector('.boost-label').textContent = '⚡ Активен: ' + rem + 'с';
  } else {
    if (G.boostActive) G.boostActive = false;
    btn.disabled = G.boostCharges <= 0;
    btn.classList.remove('running');
    btn.querySelector('.boost-label').textContent = '⚡ Буст ×2 на 30с';
  }
  btn.querySelector('.boost-charges').textContent = G.boostCharges + '/3';
  if (G.boostCharges < 3 && G.boostChargeAt > 0) {
    const rem = Math.max(0, Math.ceil((G.boostChargeAt - now) / 1000));
    info.textContent = rem > 0 ? 'след. заряд через ' + fmtTime(rem) : '';
  } else {
    info.textContent = G.boostCharges >= 3 ? 'Все заряды готовы' : '';
  }
}

// ── Upgrades ─────────────────────────────

function renderUpgrades() {
  const list = document.getElementById('upgrades-list');
  list.innerHTML = '';

  const clickUpgrades = UPGRADES.filter(u => u.type === 'click');
  const allUpgrades   = UPGRADES.filter(u => u.type === 'all');

  _appendSectionTitle(list, '⛏️ Улучшения кликера');
  clickUpgrades.forEach(u => list.appendChild(_makeUpgradeCard(u)));

  _appendSectionTitle(list, '⚙️ Улучшения добычи');
  allUpgrades.forEach(u => list.appendChild(_makeUpgradeCard(u)));

  // Update badge
  const avail = UPGRADES.filter(u => !G.upgrades[u.id] && G.sat >= u.price).length;
  const badge = document.getElementById('upg-badge');
  badge.textContent    = avail;
  badge.style.display  = avail > 0 ? 'block' : 'none';
}

/** Lightweight upgrades badge update — called every game tick. */
function updateUpgBadge() {
  const badge = document.getElementById('upg-badge');
  if (!badge) return;
  const avail = UPGRADES.filter(u => !G.upgrades[u.id] && G.sat >= u.price).length;
  badge.textContent   = avail;
  badge.style.display = avail > 0 ? 'block' : 'none';
}

function _appendSectionTitle(parent, text) {
  const d = document.createElement('div');
  d.className   = 'section-title';
  d.textContent = text;
  parent.appendChild(d);
}

function _makeUpgradeCard(u) {
  const bought  = !!G.upgrades[u.id];
  const afford  = !bought && G.sat >= u.price;
  const card    = document.createElement('div');
  const tagText = u.type === 'click' ? `×${u.mult} к клику` : `×${u.mult} к добыче`;
  const tagCls  = u.type === 'all'   ? 'upgrade-tag type-all' : 'upgrade-tag';

  card.className = 'item-card upgrade-card' +
    (bought ? ' bought' : afford ? ' affordable' : '');

  card.innerHTML =
    `<div class="item-emoji">${u.icon}</div>` +
    `<div class="item-info">` +
      `<div class="item-name">${u.name}</div>` +
      `<div class="item-desc">${u.desc}</div>` +
      `<span class="${tagCls}">${tagText}</span>` +
    `</div>` +
    `<div class="item-right">` +
      (bought
        ? `<div class="item-price done">✓</div>`
        : `<div class="item-price">${fmt(u.price)} sat</div>`) +
    `</div>`;

  if (!bought) card.addEventListener('click', () => buyUpgrade(u));
  return card;
}

// ── Achievements ─────────────────────────

function renderAchievements() {
  const grid = document.getElementById('ach-grid');
  grid.innerHTML = '';

  let unlocked = 0;
  for (const a of ACHIEVEMENTS) {
    const done = !!G.achiev[a.id];
    if (done) unlocked++;

    const card = document.createElement('div');
    card.className = 'ach-card' + (done ? ' unlocked' : '');
    card.innerHTML =
      `<div class="ach-icon">${a.icon}</div>` +
      `<div class="ach-name">${a.name}</div>` +
      `<div class="ach-desc">${done ? a.desc : '???'}</div>`;
    grid.appendChild(card);
  }

  const total = ACHIEVEMENTS.length;
  const pct   = total > 0 ? (unlocked / total * 100).toFixed(0) : 0;
  document.getElementById('ach-bar').style.width       = pct + '%';
  document.getElementById('ach-bar-label').textContent = unlocked + ' / ' + total;

  const badge = document.getElementById('ach-badge');
  badge.textContent   = unlocked;
  badge.style.display = unlocked > 0 ? 'block' : 'none';
}

// ── Statistics ─────────────────────────────────

function renderStatPanel() {
  const list = document.getElementById('stats-list');
  if (!list) return;

  const achCount = Object.keys(G.achiev).length;
  const topMiner = MINERS.reduce((best, m) => {
    const contrib = m.baseSps * (G.miners[m.id] || 0);
    return contrib > best.val ? { val: contrib, name: m.name, emoji: m.emoji } : best;
  }, { val: 0, name: '—', emoji: '' });

  const sections = [
    {
      title: '💰 Прогресс',
      rows: [
        ['Всего добыто (все ранды)',  fmtBalance(G.totalEver + G.total)],
        ['Текущий sat/sec',          fmtSps(G.sps)],
        ['Рекордный sat/sec',         fmtSps(G.spsRecord)],
        ['Всего кликов',            fmt(G.clicks)],
        ['Авто-клик sat/sec',       fmt(Math.round(calcAutoClick()))],
      ]
    },
    {
      title: '♻️ Престиж',
      rows: [
        ['Количество сбросов',       G.prestigeRuns],
        ['Накоплено очков',         G.prestigePoints],
        ['Бонус к sat/sec',          '+' + (G.prestigePoints * 2).toFixed(0) + '%'],
        ['Лучший сброс (очков)',     G.bestPrestigeGain > 0 ? '+' + G.bestPrestigeGain : '—'],
      ]
    },
    {
      title: '⛏️ Майнинг',
      rows: [
        ['Устройств сейчас',        G.devices],
        ['Устройств за всё время',  G.totalDevicesEver + G.devices],
        ['Апгрейдов куплено',      G.upgCount],
        ['Лучший майнер',        topMiner.val > 0 ? topMiner.emoji + ' ' + topMiner.name : '—'],
      ]
    },
    {
      title: '🏅 Достижения и время',
      rows: [
        ['Достижений получено',   achCount + ' / ' + ACHIEVEMENTS.length],
        ['Время в игре',          fmtTime(G.playtime)],
      ]
    },
  ];

  list.innerHTML = sections.map(sec => `
    <div class="stat-section">
      <div class="section-title">${sec.title}</div>
      ${sec.rows.map(([k, v]) =>
        `<div class="stat-row"><span class="stat-key">${k}</span><span class="stat-val">${v}</span></div>`
      ).join('')}
    </div>
  `).join('');
}

// ── Frenzy multiplier display ───────────────────

function renderFrenzy() {
  const pct  = Math.round(G.clickFrenzy);
  const chip = document.getElementById('frenzy-chip');
  if (!chip) return;
  if (pct > 0) {
    chip.textContent = '🔥 +' + pct + '%';
    chip.style.display = 'inline-block';
  } else {
    chip.style.display = 'none';
  }
}

// ── Float text (click sparks) ─────────────────

function spawnFloat(cx, cy, text) {
  const app  = document.getElementById('app');
  const rect = app.getBoundingClientRect();
  const lx   = cx - rect.left;
  const ly   = cy - rect.top;

  // Color by frenzy level
  const pct = Math.round(G.clickFrenzy);
  const color = pct >= 80 ? '#ff6a00'
              : pct >= 50 ? '#f7931a'
              : pct >= 20 ? '#ffc15e'
              : 'var(--green)';

  // Floating text
  const el = document.createElement('div');
  el.className   = 'float-text';
  el.textContent = text;
  el.style.color = color;
  const ox = (Math.random() * 40) - 20;
  el.style.left = (lx + ox - 20) + 'px';
  el.style.top  = (ly - 16) + 'px';
  app.appendChild(el);
  setTimeout(() => el.remove(), 950);

  // Spark particles
  const sparkCount = 5 + Math.floor(pct / 25); // 5-9 sparks
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 / sparkCount) * i + Math.random() * 0.6;
    const dist  = 28 + Math.random() * 22;
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.background = color;
    s.style.boxShadow  = '0 0 4px ' + color;
    s.style.left = (lx - 3) + 'px';
    s.style.top  = (ly - 3) + 'px';
    s.style.setProperty('--tx', (Math.cos(angle) * dist).toFixed(1) + 'px');
    s.style.setProperty('--ty', (Math.sin(angle) * dist).toFixed(1) + 'px');
    s.style.setProperty('--dur', (0.4 + Math.random() * 0.25) + 's');
    app.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }

  // Ripple on coin
  const coinWrap = document.getElementById('coin-wrap');
  if (coinWrap) {
    const ripple = document.createElement('div');
    ripple.className = 'coin-ripple';
    coinWrap.appendChild(ripple);
    setTimeout(() => ripple.remove(), 580);
  }
}
