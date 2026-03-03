/* ═══════════════════════════════════════════
   data.js — game constants: miners, upgrades, achievements
   ═══════════════════════════════════════════ */
'use strict';

/**
 * @param {string} id
 * @param {string} name
 * @param {string} emoji
 * @param {number} price
 * @param {number} sps
 * @param {string} desc
 */
// prettier-ignore
const MINERS = (() => {
  const m = (id, name, emoji, price, sps, desc) => ({
    id, name, emoji, desc,
    basePrice: price,
    baseSps: sps,
  });
  return [
    m('calculator', 'Калькулятор', '🧮', 18, 0.1, 'Считает биткоины со скоростью мысли'),
    m('smartphone', 'Смартфон', '📱', 130, 1, 'Батарея 3%, майнинг 100%'),
    m('tablet', 'Планшет', '📟', 1400, 6, 'Мама не разрешает, но он майнит'),
    m('laptop', 'Игровой ноутбук', '💻', 15000, 35, 'Работает от розетки 24/7'),
    m('pc', 'Игровой ПК', '🖥️', 170_000, 190, 'RGB есть — значит быстрее'),
    m('rig', 'Mega Rig 16x', '🏗️', 1_900_000, 1000, '16 карт — настоящая ферма'),
    m('asic', 'Antminer', '📦', 26_000_000, 5200, 'Первое поколение ASIC'),
    m('garage', 'Мини-ферма', '🏚️', 150_000_000, 26000, '10 ASIC в гараже'),
    m('container', 'Контейнер', '🚢', 3.4e9, 125_000, 'Промышленный контейнер'),
    m('datacenter', 'Дата-центр', '🏢', 4.6e10, 560_000, 'Серверный зал'),
    m('hydro', 'Гидро-ферма', '💧', 4e11, 2_400_000, 'Ферма у гидростанции'),
    m('orbit', 'Орбитальная ферма', '🪐', 2e12, 10_300_000, 'Ферма на орбите'),
    m('quantum', 'Кванто-ферма', '🔮', 6e13, 41_900_000, 'Квантовые вычисления'),
    m('dyson', 'Сфера Дайсона', '🌟', 1e15, 164_000_000, 'Мощность целой звезды'),
  ];
})();

const UPGRADES = [
  // ── Click upgrades ────────────────────────
  { id: 'sw1', name: 'Mining Software', desc: 'Лучший майнинг-софт', price: 300, mult: 2, type: 'click', icon: '💾' },
  { id: 'sw2', name: 'AI Optimizer', desc: 'ИИ ускоряет каждый клик', price: 6000, mult: 2, type: 'click', icon: '🤖' },
  { id: 'mem', name: 'Больше ОЗУ', desc: 'Быстрее — больше sat', price: 60000, mult: 3, type: 'click', icon: '🧠' },
  { id: 'oc', name: 'Overclock+', desc: 'Разгон CPU до максимума', price: 500000, mult: 5, type: 'click', icon: '🔥' },
  { id: 'asicclk', name: 'ASIC-кликер', desc: 'Спец. чип для клика', price: 6000000, mult: 8, type: 'click', icon: '⚙️' },
  { id: 'qclk', name: 'Квантовый клик', desc: 'Квантовое ускорение', price: 1.5e8, mult: 15, type: 'click', icon: '🔮' },
  { id: 'ultra', name: 'Ultra Click', desc: 'Предел возможностей', price: 5e9, mult: 25, type: 'click', icon: '💥' },
];

// ── Постоянные кристальные апгрейды (не сбрасываются престижем) ──────────
const GEM_UPGRADES = [
  // Оффлайн время
  { id: 'offline4h', name: 'Оффлайн 4ч', desc: 'Макс. оффлайн время: 4 часа', icon: '⏰', cost: 5 },
  { id: 'offline12h', name: 'Оффлайн 12ч', desc: 'Макс. оффлайн время: 12 часов', icon: '⌚', cost: 20, requires: 'offline4h' },
  { id: 'offline48h', name: 'Оффлайн 48ч', desc: 'Макс. оффлайн время: 48 часов', icon: '📅', cost: 60, requires: 'offline12h' },
  // Сила клика
  { id: 'click_gem', name: 'Алмазный клик', desc: 'Постоянный x2 к силе каждого клика', icon: '💎', cost: 15, type: 'click', mult: 2 },
  { id: 'click_gem2', name: 'Платиновый клик', desc: 'Ещё x3 к силе клика', icon: '👑', cost: 45, requires: 'click_gem', type: 'click', mult: 3 },
  // Буст
  { id: 'boost_gem', name: 'Суперзаряд', desc: 'Буст x2 длится 45с вместо 30с', icon: '⚡', cost: 12 },
  // Падающие монеты
  { id: 'coin_gem', name: 'Золотые монеты', desc: 'Падающие монеты дают x2 sat', icon: '🤑', cost: 10 },
];

// NOTE: check functions are defined as strings and compiled in state.js
//       to keep data.js fully serialisable-friendly.
//       Here we define them directly since we don't need serialisation.
const ACHIEVEMENTS = [
  { id: 'sat1k', name: '1 000 Satoshi', desc: 'Накопи 1K sat', icon: '💰', check: s => s.total >= 1000 },
  { id: 'sat100k', name: '100K Satoshi', desc: 'Накопи 100K sat', icon: '💵', check: s => s.total >= 100000 },
  { id: 'sat1m', name: '1M Satoshi', desc: '0.01 BTC — уже что-то', icon: '💎', check: s => s.total >= 1000000 },
  { id: 'sat10m', name: '10M Satoshi', desc: '0.1 BTC в копилке', icon: '🥈', check: s => s.total >= 10000000 },
  { id: 'btc1', name: '1 Bitcoin!', desc: 'Целый BTC — 100M sat', icon: '₿', check: s => s.total >= 100000000 },
  { id: 'btc10', name: '10 BTC', desc: 'Ты серьёзный ходлер', icon: '🦅', check: s => s.total >= 1e9 },
  { id: 'btc100', name: '100 BTC', desc: 'Биткоин-кит', icon: '🐋', check: s => s.total >= 1e10 },
  { id: 'btc1k', name: '1 000 BTC', desc: 'Биткоин-акула', icon: '🦈', check: s => s.total >= 1e11 },
  { id: 'btc1m', name: '1 000 000 BTC', desc: 'Финансовый бог', icon: '👑', check: s => s.total >= 1e14 },
  { id: 'clk100', name: '100 кликов', desc: 'Палец уже греется', icon: '👊', check: s => s.clicks >= 100 },
  { id: 'clk1k', name: '1 000 кликов', desc: 'Фанатичный кликер', icon: '🤜', check: s => s.clicks >= 1000 },
  { id: 'clk10k', name: '10 000 кликов', desc: 'Легенда кликера', icon: '🦾', check: s => s.clicks >= 10000 },
  { id: 'clk100k', name: '100K кликов', desc: 'Ты одержим', icon: '🤖', check: s => s.clicks >= 100000 },
  { id: 'dev5', name: '5 устройств', desc: 'Маленькое начало', icon: '💻', check: s => s.devices >= 5 },
  { id: 'dev10', name: '10 устройств', desc: 'Маленькая ферма', icon: '🏚️', check: s => s.devices >= 10 },
  { id: 'dev25', name: '25 устройств', desc: 'Уже чувствуется тепло', icon: '🔌', check: s => s.devices >= 25 },
  { id: 'dev50', name: '50 устройств', desc: 'Серьёзная установка', icon: '🏭', check: s => s.devices >= 50 },
  { id: 'dev100', name: '100 устройств', desc: 'Настоящая мегаферма', icon: '🏙️', check: s => s.devices >= 100 },
  { id: 'dev250', name: '250 устройств', desc: 'Промышленный масштаб', icon: '🗼', check: s => s.devices >= 250 },
  { id: 'dev500', name: '500 устройств', desc: 'Датацентр уровня', icon: '🏗️', check: s => s.devices >= 500 },
  { id: 'dev1000', name: '1000 устройств', desc: 'Целый округ перегрелся', icon: '🌋', check: s => s.devices >= 1000 },
  { id: 'dev2500', name: '2500 устройств', desc: 'Ты — это сеть', icon: '🌐', check: s => s.devices >= 2500 },
  { id: 'sps100', name: '100 sat/sec', desc: 'Автозаработок пошёл', icon: '⚡', check: s => s.sps >= 100 },
  { id: 'sps10k', name: '10K sat/sec', desc: 'Быстрый майнинг', icon: '🚀', check: s => s.sps >= 10000 },
  { id: 'sps1m', name: '1M sat/sec', desc: 'Мощная машина добычи', icon: '🌊', check: s => s.sps >= 1000000 },
  { id: 'sps1b', name: '1B sat/sec', desc: 'Промышленный уровень', icon: '🏆', check: s => s.sps >= 1e9 },
  { id: 'sps1t', name: '1T sat/sec', desc: 'За пределами реального', icon: '🌠', check: s => s.sps >= 1e12 },
  { id: 'time1m', name: 'Первая минута', desc: 'Ты остался', icon: '⏱️', check: s => s.playtime >= 60 },
  { id: 'hodl', name: 'HODL!', desc: 'Играй 10 минут', icon: '💪', check: s => s.playtime >= 600 },
  { id: 'time30m', name: 'Полчаса в деле', desc: 'Не отвлёкся ни разу', icon: '☕', check: s => s.playtime >= 1800 },
  { id: 'moon', name: 'To the Moon! 🌕', desc: 'Играй 1 час', icon: '🌕', check: s => s.playtime >= 3600 },
  { id: 'time3h', name: '3 часа майнинга', desc: 'Серьёзная сессия', icon: '🔥', check: s => s.playtime >= 10800 },
  { id: 'time6h', name: '6 часов подряд', desc: 'Кулер уже плачет', icon: '🌡️', check: s => s.playtime >= 21600 },
  { id: 'time24h', name: 'Всё воскресенье', desc: '24 часа игрового времени', icon: '🛌', check: s => s.playtime >= 86400 },
  { id: 'time7d', name: 'Неделя в сети', desc: '7 дней суммарно', icon: '📅', check: s => s.playtime >= 604800 },
  { id: 'allup', name: 'Всё прокачано', desc: 'Купи все апгрейды', icon: '⭐', check: s => s.upgCount >= UPGRADES.length },
  // ─ Prestige ─
  { id: 'pres1', name: 'Первый сброс', desc: 'Сделай престиж', icon: '♻️', check: s => s.prestigeRuns >= 1 },
  { id: 'pres5', name: '5 сбросов', desc: 'Настойчивый майнер', icon: '🔄', check: s => s.prestigeRuns >= 5 },
  { id: 'pres25', name: '25 сбросов', desc: 'Аддикт престижа', icon: '🌀', check: s => s.prestigeRuns >= 25 },
  { id: 'prespts', name: '100 очков', desc: 'Накопи 100 очков престижа', icon: '📈', check: s => s.prestigePoints >= 100 },
  { id: 'prespts1k', name: '1000 очков', desc: 'Накопи 1000 очков престижа', icon: '📊', check: s => s.prestigePoints >= 1000 },
  // ─ Managers ─
  { id: 'mgr1', name: 'Первый менеджер', desc: 'Нанять стажёра', icon: '👤', check: s => (s.managers || {})['intern'] >= 1 },
  { id: 'mgr5', name: '5 менеджеров', desc: 'Нанять 5 любых менеджеров', icon: '👥', check: s => Object.values(s.managers || {}).reduce((a, b) => a + b, 0) >= 5 },
];

const MANAGERS = [
  { id: 'intern', name: 'Стажёр', emoji: '👶', basePrice: 5000, clicksPerSec: 1, desc: 'Щёлкает мышью за вас' },
  { id: 'trader', name: 'Трейдер', emoji: '👨‍💼', basePrice: 60000, clicksPerSec: 3, desc: 'Торгует быстрее вас' },
  { id: 'quant', name: 'Квант', emoji: '🧑‍🔬', basePrice: 700000, clicksPerSec: 15, desc: 'Алгоритмы и цифры' },
  { id: 'aibot', name: 'ИИ-бот', emoji: '🤖', basePrice: 8000000, clicksPerSec: 80, desc: 'Автоматический трейдинг' },
  { id: 'quantum', name: 'Квантовый компьютер', emoji: '🔮', basePrice: 1e8, clicksPerSec: 500, desc: 'Квантовые клики' },
];

const NEWS_TICKER = [
  // Хомяки
  '🐹 Хомяк купил на $60k, продал на $16k и ждёт отскока с 2022',
  '😭 «Я подожду пока упадёт до $5k» — сказал хомяк в 2019 году',
  '📊 Технический анализ хомяка: вверх не пойдёт, вниз тоже, жду сигнал',
  '🎯 Стратегия хомяка: покупай дорого, продавай дёшево, жалуйся',
  // NFT-бро
  '🖼️ NFT-бро продал квартиру ради картинки обезьяны. Картинка стоит $4',
  '💸 NFT — это покупка ссылки. Ссылка 404. Деньги тоже 404',
  '🎨 «Это искусство, а не скам» — владелец 47 NFT-котиков в минусе 99%',
  // Альткоин-максималисты
  '📉 Купил альткоин «по совету друга». Друг больше не берёт трубку',
  // Крипто-инфлюенсеры
  '📢 Инфлюенсер: «покупайте X» — через час сам продал X. Совпадение?',
  '🤑 Telegram-гуру продаёт сигналы за $99/мес. Сам в минусе на 80%',
  '🎙️ «Это не финансовый совет» — человек, дающий финансовые советы',
  // Биржи и хранение
  '🏦 FTX: «ваши средства в безопасности» — за день до банкротства',
  '💾 Парень выбросил диск с 7 500 BTC. Роется на свалке с 2013 года',
  // Общее
  '🚀 Bitcoin достиг $1 000 000 — ходлеры плачут от счастья',
  '🐋 Кит входит тишиной. Хомяк выходит криком в Telegram',
  '🕰️ Лучшее время купить BTC — 10 лет назад. Второе лучшее — сейчас',
  '🍕 Pizza Day: 10 000 BTC за две пиццы. Самая дорогая доставка в истории',
  '💬 «Этот пузырь скоро лопнет» — говорили на $1, $10, $100, $1k, $10k, $100k...',
  '🔐 Blockchain помнит всё. Включая твою несчастную продажу на дне',
  '💯 Престиж — рестарт с бонусом, а не паника с убытком',
  '🌍 Сатоши исчез в 2011 году. Видимо, просто холдит',
  '⛏️ Майнинг — это не труд, это диагноз. Приятный',
  '🔮 Квантовый компьютер взломает SHA-256 примерно когда хомяк решится купить',
  '😤 «Биткоин — скам» — человек, купивший на хаях и продавший на лоу',
];

