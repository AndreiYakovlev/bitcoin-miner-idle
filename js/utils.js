/* ═══════════════════════════════════════════
   utils.js — formatting helpers
   No external dependencies.
   ═══════════════════════════════════════════ */
'use strict';

/**
 * Format a large number into a short human-readable string.
 * e.g. 1 500 000 → "1.50M"
 */
function fmt(n) {
  if (!isFinite(n) || n < 0) return '0';
  if (n < 1e3)  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
  if (n < 1e6)  return (n / 1e3).toFixed(2)  + 'K';
  if (n < 1e9)  return (n / 1e6).toFixed(2)  + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2)  + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(2) + 'T';
  if (n < 1e18) return (n / 1e15).toFixed(2) + 'Qa';
  if (n < 1e21) return (n / 1e18).toFixed(2) + 'Qi';
  return (n / 1e21).toFixed(2) + 'Sx';
}

/**
 * Format a satoshi value with unit suffix:
 * sat → K sat → mBTC → BTC → (scientific BTC)
 */
function fmtBalance(n) {
  if (n < 1e4)  return fmt(n) + ' sat';
  if (n < 1e6)  return (n / 1e3).toFixed(1) + 'K sat';
  if (n < 1e8)  return (n / 1e6).toFixed(2) + ' mBTC';
  if (n < 1e16) return (n / 1e8).toFixed(4) + ' BTC';
  return (n / 1e8).toExponential(2) + ' BTC';
}

/** Format sat-per-second value. */
function fmtSps(n) {
  return fmt(n) + ' sat/sec';
}

/**
 * Format elapsed seconds as HH:MM:SS.
 */
function fmtTime(totalSeconds) {
  const s = Math.floor(totalSeconds);
  const h  = Math.floor(s / 3600).toString().padStart(2, '0');
  const m  = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${ss}`;
}
