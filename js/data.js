/* ═══════════════════════════════════════════
   data.js — game constants: miners, upgrades, achievements
   ═══════════════════════════════════════════ */
'use strict';

const MINERS = [
  { id: 'gtx1060',   name: 'GTX 1060',         emoji: '💻', basePrice: 50,         baseSps: 0.1,       desc: 'Старенькая видеокарта' },
  { id: 'rtx2060',   name: 'RTX 2060',          emoji: '🖱️', basePrice: 280,        baseSps: 0.6,       desc: 'Бюджетный вариант' },
  { id: 'rtx3060',   name: 'RTX 3060',          emoji: '🖥️', basePrice: 1500,       baseSps: 4,         desc: 'Современная карта' },
  { id: 'rtx4070',   name: 'RTX 4070',          emoji: '🎮', basePrice: 8000,       baseSps: 22,        desc: 'Мощная карта' },
  { id: 'rtx4090',   name: 'RTX 4090',          emoji: '⚡', basePrice: 40000,      baseSps: 130,       desc: 'Топовая карта 2024' },
  { id: 'rx7900',    name: 'RX 7900 XTX',       emoji: '🔴', basePrice: 200000,     baseSps: 750,       desc: 'AMD флагман' },
  { id: 'rig4',      name: 'Rig 4× GPU',        emoji: '🔧', basePrice: 1000000,    baseSps: 4500,      desc: '4 карты в стойке' },
  { id: 'rig8',      name: 'Rig 8× GPU',        emoji: '🔩', basePrice: 6000000,    baseSps: 30000,     desc: '8 карт, серьёзная сборка' },
  { id: 'rig16',     name: 'Mega Rig 16×',      emoji: '🏗️', basePrice: 35000000,   baseSps: 200000,    desc: '16 карт — настоящая ферма' },
  { id: 'asic_s9',   name: 'Antminer S9',       emoji: '📦', basePrice: 200000000,  baseSps: 1300000,   desc: 'Первое поколение ASIC' },
  { id: 'asic_s17',  name: 'Antminer S17',      emoji: '📫', basePrice: 1200000000, baseSps: 9000000,   desc: 'Мощный ASIC 2019' },
  { id: 'asic_s19',  name: 'Antminer S19 Pro',  emoji: '🚗', basePrice: 7000000000, baseSps: 60000000,  desc: 'Профессиональный ASIC' },
  { id: 'asic_s21',  name: 'Antminer S21 XP',   emoji: '🚀', basePrice: 4e10,       baseSps: 420000000, desc: 'Новейший ASIC 2025' },
  { id: 'asic_next', name: 'Whatsminer M66S',   emoji: '💎', basePrice: 2.5e11,     baseSps: 3e9,       desc: 'Следующее поколение' },
  { id: 'microfarm', name: 'Мини-ферма',        emoji: '🏚️', basePrice: 1.5e12,     baseSps: 2.2e10,    desc: '10 ASIC в гараже' },
  { id: 'container', name: 'Контейнер',         emoji: '🚢', basePrice: 1e13,       baseSps: 1.6e11,    desc: 'Промышленный контейнер' },
  { id: 'datacenter',name: 'Дата-центр',        emoji: '🏢', basePrice: 7e13,       baseSps: 1.2e12,    desc: 'Серверный зал' },
  { id: 'hydro',     name: 'Гидро-ферма',       emoji: '💧', basePrice: 5e14,       baseSps: 9e12,      desc: 'Ферма у гидростанции' },
  { id: 'solar',     name: 'Солнечная ферма',   emoji: '☀️', basePrice: 4e15,       baseSps: 7.5e13,    desc: 'Солнечные панели' },
  { id: 'nuclear',   name: 'АЭС-Ферма',         emoji: '☢️', basePrice: 3e16,       baseSps: 6e14,      desc: 'Атомная электростанция' },
  { id: 'quantum',   name: 'Квантовый майнер',  emoji: '🔮', basePrice: 2.5e17,     baseSps: 5e15,      desc: 'Квантовые вычисления' },
  { id: 'dyson',     name: 'Сфера Дайсона',     emoji: '🌟', basePrice: 2e18,       baseSps: 4.5e16,    desc: 'Мощность целой звезды' },
];

const UPGRADES = [
  // ── Click upgrades ────────────────────────
  { id: 'sw1',     name: 'Mining Software',   desc: 'Лучший майнинг-софт',       price: 300,     mult: 2,   type: 'click', icon: '💾' },
  { id: 'sw2',     name: 'AI Optimizer',      desc: 'ИИ ускоряет каждый клик',   price: 6000,    mult: 2,   type: 'click', icon: '🤖' },
  { id: 'mem',     name: 'Больше ОЗУ',        desc: 'Быстрее — больше sat',      price: 60000,   mult: 3,   type: 'click', icon: '🧠' },
  { id: 'oc',      name: 'Overclock+',        desc: 'Разгон CPU до максимума',   price: 500000,  mult: 5,   type: 'click', icon: '🔥' },
  { id: 'asicclk', name: 'ASIC-кликер',       desc: 'Спец. чип для клика',       price: 6000000, mult: 8,   type: 'click', icon: '⚙️' },
  { id: 'qclk',    name: 'Квантовый клик',    desc: 'Квантовое ускорение',       price: 1.5e8,   mult: 15,  type: 'click', icon: '🔮' },
  { id: 'ultra',   name: 'Ultra Click',       desc: 'Предел возможностей',       price: 5e9,     mult: 25,  type: 'click', icon: '💥' },
  // ── All-miners upgrades ───────────────────
  { id: 'cool1',   name: 'Лучшее охлаждение', desc: '×1.5 ко всей добыче',      price: 2000,    mult: 1.5, type: 'all',   icon: '❄️' },
  { id: 'pow1',    name: 'Дешёвый ток',       desc: '×2 ко всей добыче',        price: 40000,   mult: 2,   type: 'all',   icon: '⚡' },
  { id: 'pool1',   name: 'Mining Pool',       desc: '×2 — майнинг пул',         price: 600000,  mult: 2,   type: 'all',   icon: '🌐' },
  { id: 'green',   name: 'Зелёная энергия',   desc: '×2 ко всей добыче',        price: 8000000, mult: 2,   type: 'all',   icon: '🌱' },
  { id: 'ai2',     name: 'ИИ-управление',     desc: '×3 ко всей добыче',        price: 1.5e8,   mult: 3,   type: 'all',   icon: '🧬' },
  { id: 'liquid',  name: 'Жидкостное охл.',   desc: '×3 ко всей добыче',        price: 4e9,     mult: 3,   type: 'all',   icon: '💦' },
  { id: 'fusion',  name: 'Ядерный синтез',    desc: '×5 ко всей добыче',        price: 2e11,    mult: 5,   type: 'all',   icon: '🔆' },
  { id: 'darke',   name: 'Тёмная энергия',    desc: '×8 ко всей добыче',        price: 1e13,    mult: 8,   type: 'all',   icon: '🌌' },
];

// NOTE: check functions are defined as strings and compiled in state.js
//       to keep data.js fully serialisable-friendly.
//       Here we define them directly since we don't need serialisation.
const ACHIEVEMENTS = [
  { id: 'sat1',    name: 'Первый Сатоши',    desc: 'Заработай 1 sat',          icon: '🌱', check: s => s.total >= 1 },
  { id: 'sat1k',   name: '1 000 Satoshi',    desc: 'Накопи 1K sat',            icon: '💰', check: s => s.total >= 1000 },
  { id: 'sat100k', name: '100K Satoshi',     desc: 'Накопи 100K sat',          icon: '💵', check: s => s.total >= 100000 },
  { id: 'sat1m',   name: '1M Satoshi',       desc: '0.01 BTC — уже что-то',    icon: '💎', check: s => s.total >= 1000000 },
  { id: 'sat10m',  name: '10M Satoshi',      desc: '0.1 BTC в копилке',        icon: '🥈', check: s => s.total >= 10000000 },
  { id: 'btc1',    name: '1 Bitcoin!',       desc: 'Целый BTC — 100M sat',     icon: '₿',  check: s => s.total >= 100000000 },
  { id: 'btc10',   name: '10 BTC',           desc: 'Ты серьёзный ходлер',      icon: '🦅', check: s => s.total >= 1e9 },
  { id: 'btc100',  name: '100 BTC',          desc: 'Биткоин-кит',              icon: '🐋', check: s => s.total >= 1e10 },
  { id: 'btc1k',   name: '1 000 BTC',        desc: 'Биткоин-акула',            icon: '🦈', check: s => s.total >= 1e11 },
  { id: 'btc1m',   name: '1 000 000 BTC',    desc: 'Финансовый бог',           icon: '👑', check: s => s.total >= 1e14 },
  { id: 'clk1',    name: 'Первый клик',      desc: 'Начни путь майнера',       icon: '👆', check: s => s.clicks >= 1 },
  { id: 'clk100',  name: '100 кликов',       desc: 'Палец уже греется',        icon: '👊', check: s => s.clicks >= 100 },
  { id: 'clk1k',   name: '1 000 кликов',     desc: 'Фанатичный кликер',        icon: '🤜', check: s => s.clicks >= 1000 },
  { id: 'clk10k',  name: '10 000 кликов',    desc: 'Легенда кликера',          icon: '🦾', check: s => s.clicks >= 10000 },
  { id: 'clk100k', name: '100K кликов',      desc: 'Ты одержим',               icon: '🤖', check: s => s.clicks >= 100000 },
  { id: 'dev1',    name: 'Первое устройство',desc: 'Купи первый майнер',       icon: '🖥️', check: s => s.devices >= 1 },
  { id: 'dev10',   name: '10 устройств',     desc: 'Маленькая ферма',          icon: '🏚️', check: s => s.devices >= 10 },
  { id: 'dev50',   name: '50 устройств',     desc: 'Серьёзная установка',      icon: '🏭', check: s => s.devices >= 50 },
  { id: 'dev100',  name: '100 устройств',    desc: 'Настоящая мегаферма',      icon: '🏙️', check: s => s.devices >= 100 },
  { id: 'dev250',  name: '250 устройств',    desc: 'Промышленный масштаб',     icon: '🗼', check: s => s.devices >= 250 },
  { id: 'sps100',  name: '100 sat/sec',      desc: 'Автозаработок пошёл',      icon: '⚡', check: s => s.sps >= 100 },
  { id: 'sps10k',  name: '10K sat/sec',      desc: 'Быстрый майнинг',          icon: '🚀', check: s => s.sps >= 10000 },
  { id: 'sps1m',   name: '1M sat/sec',       desc: 'Мощная машина добычи',     icon: '🌊', check: s => s.sps >= 1000000 },
  { id: 'sps1b',   name: '1B sat/sec',       desc: 'Промышленный уровень',     icon: '🏆', check: s => s.sps >= 1e9 },
  { id: 'sps1t',   name: '1T sat/sec',       desc: 'За пределами реального',   icon: '🌠', check: s => s.sps >= 1e12 },
  { id: 'hodl',    name: 'HODL!',            desc: 'Играй 10 минут',           icon: '💪', check: s => s.playtime >= 600 },
  { id: 'moon',    name: 'To the Moon! 🌕',  desc: 'Играй 1 час',              icon: '🌕', check: s => s.playtime >= 3600 },
  { id: 'allup',    name: 'Всё прокачано',   desc: 'Купи все апгрейды',      icon: '⭐', check: s => s.upgCount >= UPGRADES.length },
  // ─ Prestige ─
  { id: 'pres1',    name: 'Первый сброс',    desc: 'Сделай престиж',           icon: '♻️', check: s => s.prestigeRuns >= 1 },
  { id: 'pres5',    name: '5 сбросов',       desc: 'Настойчивый майнер',     icon: '🔄', check: s => s.prestigeRuns >= 5 },
  { id: 'pres25',   name: '25 сбросов',      desc: 'Аддикт престижа',         icon: '🌀', check: s => s.prestigeRuns >= 25 },
  { id: 'prespts',  name: '100 очков',      desc: 'Накопи 100 очков престижа', icon: '📈', check: s => s.prestigePoints >= 100 },
  { id: 'prespts1k',name: '1000 очков',     desc: 'Накопи 1000 очков престижа',icon: '📊', check: s => s.prestigePoints >= 1000 },
  // ─ Managers ─
  { id: 'mgr1',     name: 'Первый менеджер',  desc: 'Нанять стажёра',          icon: '👤', check: s => (s.managers || {})['intern'] >= 1 },
  { id: 'mgr5',     name: '5 менеджеров',     desc: 'Нанять 5 любых менеджеров',  icon: '👥', check: s => Object.values(s.managers||{}).reduce((a,b)=>a+b,0) >= 5 },
];

const MANAGERS = [
  { id: 'intern',   name: 'Стажёр',         emoji: '👶', basePrice: 5000,    clicksPerSec: 0.5,  desc: 'Щёлкает мышью за вас' },
  { id: 'trader',   name: 'Трейдер',        emoji: '👨‍💼', basePrice: 60000,   clicksPerSec: 3,    desc: 'Торгует быстрее вас' },
  { id: 'quant',    name: 'Квант',          emoji: '🧑‍🔬', basePrice: 700000,  clicksPerSec: 15,   desc: 'Алгоритмы и цифры' },
  { id: 'aibot',    name: 'ИИ-бот',         emoji: '🤖', basePrice: 8000000, clicksPerSec: 80,   desc: 'Автоматический трейдинг' },
  { id: 'quantum',  name: 'Квант.комп.',    emoji: '🔮', basePrice: 1e8,     clicksPerSec: 500,  desc: 'Квантовые клики' },
];

const NEWS_TICKER = [
  '🚀 Bitcoin достиг $1 000 000 — ходлеры плачут от радости',
  '⚡ Сатоши хашратя: 1 BTC = 100 000 000 sat',
  '📈 HODL — не продавай, даже если очень хочется',
  '🔥 Новый хэлвингсократил награду майнера вдвое',
  '🤯 Один сатоши является 0.00000001 BTC. Береги!',
  '🌍 Сатоши Накамото создал BTC в 2009 — где он сейчас?',
  '🏦 21 млн Биткоинов когда-нибудь будут добыты. Работай!',
  '👳 Antminer S21 XP: самый эффективный ASIC планеты',
  '⚠️ Внимание: медвежьий рынок! продолжай майнить',
  '📡 Lightning Network: платежи за секунды, а не за дни',
  '💯 Престиж — это не поражение, это рестарт с бонусом',
  '🤖 ИИ не заменит майнеров. ИИ тоже майнит',
  '🌟 Hodling — лучшая стратегия с 2009 года',
  '💸 1 sat/sec × 86400s = 86400 sat в день. Считай!',
  '🔐 Blockchain — неизменяемый реестр всех транзакций',
  '☔ Гидроферма — зелёная энергия плюс бесплатная вода',
  '💎 Сфера Дайсона: когда звезда — ваша алектростанция',
  '🔮 Квантовый майнер взломает SHA-256 за миллисекунды',
  '🍝 Bitcoin Pizza Day: 22 мая 10 000 BTC за две пиццы',
  '⛏️ Майнинг — это не труд, это призвание',
];
