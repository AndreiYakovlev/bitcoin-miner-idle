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
}

// ── Shop ─────────────────────────────────

function renderShop() {
  const list = document.getElementById('shop-list');
  list.innerHTML = '<div class="section-title">🛒 Майнинговые устройства</div>';

  for (const m of MINERS) {
    const owned   = G.miners[m.id] || 0;
    const price   = getMinerPrice(m);
    const afford  = G.sat >= price;
    const spsEach = m.baseSps * G.allMult;
    const spsText = spsEach >= 1
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
        `<div class="item-count">${owned}</div>` +
      `</div>`;
    card.addEventListener('click', () => buyMiner(m));
    list.appendChild(card);
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

// ── Float text (click sparks) ─────────────

function spawnFloat(cx, cy, text) {
  const app  = document.getElementById('app');
  const rect = app.getBoundingClientRect();
  const el   = document.createElement('div');
  el.className   = 'float-text';
  el.textContent = text;
  const ox  = (Math.random() * 50) - 25;
  el.style.left  = (cx - rect.left + ox - 15) + 'px';
  el.style.top   = (cy - rect.top  - 10)      + 'px';
  app.appendChild(el);
  setTimeout(() => el.remove(), 870);
}
