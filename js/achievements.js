/* ═══════════════════════════════════════════
   achievements.js — check & popup logic
   Depends on: data.js, state.js, render.js
   ═══════════════════════════════════════════ */
'use strict';

let _achQueue   = [];
let _achShowing = false;

// ── Check all achievements ────────────────

function checkAchievements() {
  let changed = false;
  for (const a of ACHIEVEMENTS) {
    if (!G.achiev[a.id] && a.check(G)) {
      G.achiev[a.id] = true;
      _achQueue.push(a);
      changed = true;
    }
  }
  if (changed) {
    renderAchievements();
    if (!_achShowing) _showNextAch();
  }
}

// ── Show popup queue ──────────────────────
/** Generic popup — reuses the achievement popup. */
function showPopup(icon, name, desc) {
  _achQueue.push({ icon, name, desc });
  if (!_achShowing) _showNextAch();
}

// ── Generic notice popup (non-achievement) ─
let _noticeTimer = null;
function showNotice(icon, name, desc) {
  document.getElementById('notice-icon').textContent = icon;
  document.getElementById('notice-name').textContent = name;
  document.getElementById('notice-desc').textContent = desc;
  const el = document.getElementById('notice-popup');
  el.classList.remove('show');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('show');
  clearTimeout(_noticeTimer);
  _noticeTimer = setTimeout(() => el.classList.remove('show'), 2800);
}
function _showNextAch() {
  if (_achQueue.length === 0) { _achShowing = false; return; }
  _achShowing = true;

  const a = _achQueue.shift();
  document.getElementById('pop-icon').textContent = a.icon;
  document.getElementById('pop-name').textContent = a.name;
  document.getElementById('pop-desc').textContent = a.desc;

  const popup = document.getElementById('ach-popup');
  popup.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(_showNextAch, 380);
  }, 2600);
}
