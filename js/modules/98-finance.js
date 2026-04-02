// ============================================================
// 98-finance.js — TALKO Finance Module v1.0
// Етап 1: Фундамент — структура, навігація, ініціалізація
// ============================================================
(function () {
'use strict';
var _tg = function(ua,ru){return window.currentLang==='ru'?ru:ua;};

// ── SVG Icons ──────────────────────────────────────────────
const I = {
  income:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  expense:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
  wallet:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16v4"/><circle cx="18" cy="12" r="2"/></svg>',
  chart:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  plan:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  ai:       '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  func:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  plus:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  settings: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
  trash:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  edit:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  repeat:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  pause:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
  play:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  check:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  invoice:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
};

// ── Константи ──────────────────────────────────────────────
const FINANCE_VERSION = '1.0.0';
const TABS = ['dashboard', 'income', 'expense', 'recurring', 'invoices', 'functions', 'planning', 'analytics', 'balance', 'ai', 'settings'];

function getTabLabels() {
  return {
    dashboard:  { icon: 'chart',     label: window.t('finTabDashboard') },
    income:     { icon: 'income',    label: window.t('finTabIncome')    },
    expense:    { icon: 'expense',   label: window.t('finTabExpense')   },
    recurring:  { icon: 'repeat',    label: window.t('finTabRecurring') },
    invoices:   { icon: 'invoice',   label: window.t('finTabInvoices')  },
    functions:  { icon: 'func',      label: window.t('finTabFunctions') },
    planning:   { icon: 'plan',      label: window.t('finTabPlanning')  },
    analytics:  { icon: 'chart',     label: window.t('finTabAnalytics') },
    balance:    { icon: 'wallet',    label: window.t('finTabBalance')   },
    ai:         { icon: 'ai',        label: 'AI'                        },
    settings:   { icon: 'settings',  label: window.t('finTabSettings')  },
  };
}

// ── Стан модуля ────────────────────────────────────────────
let _state = {
  activeSubTab: 'dashboard',
  companyId: null,
  currentUser: null,
  userRole: null,           // owner | manager | employee
  initialized: false,
  accounts: [],
  categories: { income: [], expense: [] },
  invoices: [],
  region: 'EU',             // EU | DE | PL | US
  currency: 'EUR',
  niche: null,              // beauty | construction | medical | ...
  functions: [],            // бізнес-функції компанії
};

// ── Утиліти ────────────────────────────────────────────────
function fmt(amount, currency) {
  const cur = currency || _state.currency || 'EUR';
  const locale = _state.region === 'US' ? 'en-US' : (window.getLocale ? window.getLocale() : 'uk-UA');
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(amount || 0);
  } catch(e) {
    return (amount || 0).toLocaleString() + ' ' + cur;
  }
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (_state.region === 'US') return d.toLocaleDateString('en-US');
  return d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA');
}

function isOwnerOrManager() {
  return _state.userRole === 'owner' || _state.userRole === 'manager';
}

function getDb() { return window.db || (window.firebase && firebase.firestore()); }

function colRef(name) {
  const db = getDb();
  if (!db || !_state.companyId) return null;
  // FIX: Перевірка існування window.companyRef перед викликом
  if (!window.companyRef || typeof window.companyRef !== 'function') return null;
  return window.companyRef().collection(name);
}

// ── Системні категорії (дефолт при ініціалізації) ──────────
const DEFAULT_CATEGORIES = {
  // ── ДОХОДИ (верхній рівень) ──────────────────────────────
  income: [
    { id: 'inc_revenue',    name: window.t('finCatRevenue')    || 'Основна виручка',       icon: 'trending-up',    parentId: null },
    { id: 'inc_prepay',     name: window.t('finCatPrepay')     || 'Передоплати',            icon: 'credit-card',    parentId: null },
    { id: 'inc_passive',    name: window.t('finCatPassive')    || 'Пасивний дохід',         icon: 'building-2',     parentId: null },
    { id: 'inc_other',      name: window.t('finCatOtherInc')   || 'Інші надходження',       icon: 'plus-circle',    parentId: null },
  ],
  // ── ВИТРАТИ (верхній рівень + підкатегорії) ─────────────
  expense: [
    // 1. ФОНД ОПЛАТИ ПРАЦІ
    { id: 'exp_fop',         name: window.t('finCatFop')        || 'Фонд оплати праці (FOP)',         icon: 'users',          parentId: null,          costType: 'opex' },
    { id: 'exp_fop_prod',    name: window.t('finCatFopProd')    || 'Зарплата виробничого персоналу',  icon: 'user',           parentId: 'exp_fop',     costType: 'opex' },
    { id: 'exp_fop_admin',   name: window.t('finCatFopAdmin')   || 'Зарплата адміністрації',          icon: 'user',           parentId: 'exp_fop',     costType: 'opex' },
    { id: 'exp_fop_sales',   name: window.t('finCatFopSales')   || 'Зарплата менеджерів продажів',   icon: 'user',           parentId: 'exp_fop',     costType: 'opex' },
    { id: 'exp_fop_mgmt',    name: window.t('finCatFopMgmt')    || 'Зарплата керівників / топів',    icon: 'user',           parentId: 'exp_fop',     costType: 'opex' },
    { id: 'exp_fop_hr',      name: window.t('finCatFopHr')      || 'HR / рекрутинг',                 icon: 'user-plus',      parentId: 'exp_fop',     costType: 'opex' },
    { id: 'exp_fop_bonus',   name: window.t('finCatFopBonus')   || 'Бонуси / % / премії',            icon: 'gift',           parentId: 'exp_fop',     costType: 'opex' },
    { id: 'exp_fop_tax',     name: window.t('finCatFopTax')     || 'Податки на зарплату',            icon: 'file-text',      parentId: 'exp_fop',     costType: 'opex' },
    // 2. МАРКЕТИНГ
    { id: 'exp_mkt',         name: window.t('finCatMkt')        || 'Маркетинг і залучення клієнтів', icon: 'megaphone',      parentId: null,          costType: 'opex' },
    { id: 'exp_mkt_ads',     name: window.t('finCatMktAds')     || 'Реклама (Meta, Google, TikTok)', icon: 'monitor',        parentId: 'exp_mkt',     costType: 'opex' },
    { id: 'exp_mkt_seo',     name: window.t('finCatMktSeo')     || 'SEO / сайт / лендінги',         icon: 'globe',          parentId: 'exp_mkt',     costType: 'opex' },
    { id: 'exp_mkt_agency',  name: window.t('finCatMktAgency')  || 'Підрядники (маркетолог, агентство)', icon: 'briefcase',  parentId: 'exp_mkt',     costType: 'opex' },
    { id: 'exp_mkt_content', name: window.t('finCatMktContent') || 'Контент (відео, дизайн, тексти)',icon: 'video',          parentId: 'exp_mkt',     costType: 'opex' },
    { id: 'exp_mkt_crm',     name: window.t('finCatMktCrm')     || 'CRM / маркетингові сервіси',    icon: 'database',       parentId: 'exp_mkt',     costType: 'opex' },
    { id: 'exp_mkt_leads',   name: window.t('finCatMktLeads')   || 'Лідогенерація (платформи)',      icon: 'target',         parentId: 'exp_mkt',     costType: 'opex' },
    { id: 'exp_mkt_email',   name: window.t('finCatMktEmail')   || 'Email / месенджери',             icon: 'mail',           parentId: 'exp_mkt',     costType: 'opex' },
    // 3. СОБІВАРТІСТЬ
    { id: 'exp_cogs',        name: window.t('finCatCogs')       || 'Собівартість (COGS)',            icon: 'package',        parentId: null,          costType: 'cogs' },
    { id: 'exp_cogs_mat',    name: window.t('finCatCogsMat')    || 'Сировина / матеріали',           icon: 'layers',         parentId: 'exp_cogs',    costType: 'cogs' },
    { id: 'exp_cogs_goods',  name: window.t('finCatCogsGoods')  || 'Закупка товару',                 icon: 'shopping-cart',  parentId: 'exp_cogs',    costType: 'cogs' },
    { id: 'exp_cogs_cons',   name: window.t('finCatCogsCons')   || 'Виробничі витратники',           icon: 'tool',           parentId: 'exp_cogs',    costType: 'cogs' },
    { id: 'exp_cogs_sub',    name: window.t('finCatCogsSub')    || 'Підрядники (частина продукту)',  icon: 'users',          parentId: 'exp_cogs',    costType: 'cogs' },
    { id: 'exp_cogs_log',    name: window.t('finCatCogsLog')    || 'Логістика / доставка',           icon: 'truck',          parentId: 'exp_cogs',    costType: 'cogs' },
    { id: 'exp_cogs_comm',   name: window.t('finCatCogsComm')   || 'Комісії платформ',               icon: 'percent',        parentId: 'exp_cogs',    costType: 'cogs' },
    // 4. ОПЕРАЦІЙНІ ВИТРАТИ
    { id: 'exp_opex',        name: window.t('finCatOpexMain')   || 'Операційні витрати (OPEX)',      icon: 'home',           parentId: null,          costType: 'opex' },
    { id: 'exp_opex_rent',   name: window.t('finCatOpexRent')   || 'Оренда',                         icon: 'key',            parentId: 'exp_opex',    costType: 'opex' },
    { id: 'exp_opex_util',   name: window.t('finCatOpexUtil')   || 'Комунальні послуги',             icon: 'zap',            parentId: 'exp_opex',    costType: 'opex' },
    { id: 'exp_opex_inet',   name: window.t('finCatOpexInet')   || 'Інтернет / телефонія',           icon: 'wifi',           parentId: 'exp_opex',    costType: 'opex' },
    { id: 'exp_opex_equip',  name: window.t('finCatOpexEquip')  || 'Обладнання (обслуговування)',    icon: 'cpu',            parentId: 'exp_opex',    costType: 'opex' },
    { id: 'exp_opex_repair', name: window.t('finCatOpexRepair') || 'Ремонт / утримання',             icon: 'wrench',         parentId: 'exp_opex',    costType: 'opex' },
    { id: 'exp_opex_office', name: window.t('finCatOpexOffice') || 'Канцелярія / господарські',      icon: 'clipboard',      parentId: 'exp_opex',    costType: 'opex' },
    { id: 'exp_opex_clean',  name: window.t('finCatOpexClean')  || 'Прибирання / сервіс',            icon: 'trash-2',        parentId: 'exp_opex',    costType: 'opex' },
    // 5. ФІНАНСИ І АДМІНІСТРУВАННЯ
    { id: 'exp_fin',         name: window.t('finCatFin')        || 'Фінанси і адміністрування',      icon: 'bar-chart-2',    parentId: null,          costType: 'opex' },
    { id: 'exp_fin_tax',     name: window.t('finCatFinTax')     || 'Податки (крім зарплатних)',      icon: 'file-text',      parentId: 'exp_fin',     costType: 'opex' },
    { id: 'exp_fin_bank',    name: window.t('finCatFinBank')    || 'Банківські комісії',              icon: 'credit-card',    parentId: 'exp_fin',     costType: 'opex' },
    { id: 'exp_fin_acq',     name: window.t('finCatFinAcq')     || 'Еквайринг',                      icon: 'credit-card',    parentId: 'exp_fin',     costType: 'opex' },
    { id: 'exp_fin_acc',     name: window.t('finCatFinAcc')     || 'Бухгалтерія',                    icon: 'book-open',      parentId: 'exp_fin',     costType: 'opex' },
    { id: 'exp_fin_legal',   name: window.t('finCatFinLegal')   || 'Юридичні послуги',               icon: 'scale',          parentId: 'exp_fin',     costType: 'opex' },
    // 6. ІНВЕСТИЦІЇ / РОЗВИТОК
    { id: 'exp_inv',         name: window.t('finCatInv')        || 'Інвестиції / розвиток',          icon: 'trending-up',    parentId: null,          costType: 'opex' },
    { id: 'exp_inv_equip',   name: window.t('finCatInvEquip')   || 'Обладнання / активи',            icon: 'server',         parentId: 'exp_inv',     costType: 'opex' },
    { id: 'exp_inv_soft',    name: window.t('finCatInvSoft')    || 'Автоматизація / софт',           icon: 'code',           parentId: 'exp_inv',     costType: 'opex' },
    { id: 'exp_inv_train',   name: window.t('finCatInvTrain')   || 'Навчання персоналу',             icon: 'book-open',      parentId: 'exp_inv',     costType: 'opex' },
    { id: 'exp_inv_cons',    name: window.t('finCatInvCons')    || 'Консалтинг',                     icon: 'message-circle', parentId: 'exp_inv',     costType: 'opex' },
    { id: 'exp_inv_dev',     name: window.t('finCatInvDev')     || 'Розробка продукту',              icon: 'git-branch',     parentId: 'exp_inv',     costType: 'opex' },
    // 7. РЕЗЕРВ / БЕЗПЕКА
    { id: 'exp_reserve',     name: window.t('finCatRes')        || 'Резерв / безпека',               icon: 'shield',         parentId: null,          costType: 'opex' },
    { id: 'exp_res_fund',    name: window.t('finCatResFund')    || 'Резервний фонд',                 icon: 'shield',         parentId: 'exp_reserve', costType: 'opex' },
    { id: 'exp_res_stock',   name: window.t('finCatResStock')   || 'Страхові запаси',                icon: 'archive',        parentId: 'exp_reserve', costType: 'opex' },
    { id: 'exp_res_misc',    name: window.t('finCatResMisc')    || 'Непередбачені витрати',          icon: 'alert-circle',   parentId: 'exp_reserve', costType: 'opex' },
    // 8. ПРИБУТОК / ДИВІДЕНДИ
    { id: 'exp_dividends',   name: window.t('finCatDivMain')    || 'Прибуток / дивіденди',           icon: 'dollar-sign',    parentId: null,          costType: 'opex' },
    { id: 'exp_div_owner',   name: window.t('finCatDivOwner')   || 'Виплати власнику',               icon: 'user-check',     parentId: 'exp_dividends', costType: 'opex' },
    { id: 'exp_div_reinv',   name: window.t('finCatDivReinv')   || 'Реінвестований прибуток',        icon: 'refresh-cw',     parentId: 'exp_dividends', costType: 'opex' },
  ],
};

// ── Ініціалізація Firestore колекцій ──────────────────────
async function initFirestoreCollections() {
  const db = getDb();
  if (!db || !_state.companyId) return;

  const settingsRef = window.companyRef()
    .collection('finance_settings').doc('main');

  const snap = await settingsRef.get();
  if (snap.exists) return; // вже ініціалізовано

  const batch = db.batch();

  // 1. Налаштування модуля
  batch.set(settingsRef, {
    version: FINANCE_VERSION,
    region: _state.region,
    currency: _state.currency,
    niche: _state.niche,
    initializedAt: firebase.firestore.FieldValue.serverTimestamp(),
    initializedBy: _state.currentUser.uid,
  });

  // 2. Дефолтні категорії доходів
  DEFAULT_CATEGORIES.income.forEach(cat => {
    const ref = colRef('finance_categories').doc(cat.id);
    batch.set(ref, { ...cat, type: 'income', system: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  });

  // 3. Дефолтні категорії витрат
  DEFAULT_CATEGORIES.expense.forEach(cat => {
    const ref = colRef('finance_categories').doc(cat.id);
    batch.set(ref, { ...cat, type: 'expense', system: !cat.parentId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  });

  // 4. Рахунок за замовчуванням
  const accRef = colRef('finance_accounts').doc('acc_main');
  batch.set(accRef, {
    name: _state.region === 'US' ? window.t('finBankAccount') : window.t('finBankAccount'),
    type: 'bank',
    currency: _state.currency,
    balance: 0,
    isDefault: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // 5. Готівкова каса
  const cashRef = colRef('finance_accounts').doc('acc_cash');
  batch.set(cashRef, {
    name: _state.region === 'US' ? window.t('finCashAccount') : window.t('finCashAccount'),
    type: 'cash',
    currency: _state.currency,
    balance: 0,
    isDefault: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  console.log('[Finance] Firestore ініціалізовано');
}

// ── Завантаження даних ────────────────────────────────────
async function loadAccounts() {
  const snap = await colRef('finance_accounts').get();
  _state.accounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function loadCategories() {
  const snap = await colRef('finance_categories').get();
  _state.categories.income = [];
  _state.categories.expense = [];
  snap.docs.forEach(d => {
    const cat = { id: d.id, ...d.data() };
    if (cat.type === 'income') _state.categories.income.push(cat);
    else _state.categories.expense.push(cat);
  });

  // Якщо категорії порожні — записуємо дефолтні в Firestore і використовуємо
  if (_state.categories.income.length === 0 && _state.categories.expense.length === 0) {
    console.log('[Finance] Categories empty — writing defaults');
    await writeDefaultCategories();
  }
}

// Перераховує баланс кожного рахунку з усіх транзакцій
async function recalcAccountBalances() {
  try {
    // limit 2000 — захист від quota exceeded при великій кількості транзакцій
    const snap = await colRef('finance_transactions').limit(2000).get();
    const balances = {};
    snap.docs.forEach(d => {
      const tx = d.data();
      if (!tx.accountId) return;
      // txAmt конвертує в базову валюту — баланси завжди в базовій валюті
      const amt = txAmt(tx);
      const delta = tx.type === 'income' ? amt : -amt;
      balances[tx.accountId] = (balances[tx.accountId] || 0) + delta;
    });
    // Оновлюємо тільки локальний стан — Firestore баланс оновлюється при кожній транзакції інкрементально
    _state.accounts.forEach(acc => {
      if (balances[acc.id] !== undefined) acc.balance = balances[acc.id];
    });
  } catch(e) {
    console.warn('[Finance] recalcAccountBalances:', e.message);
  }
}

async function writeDefaultCategories() {
  try {
    const batch = getDb().batch();
    DEFAULT_CATEGORIES.income.forEach(cat => {
      const ref = colRef('finance_categories').doc(cat.id);
      batch.set(ref, { ...cat, type: 'income', system: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    DEFAULT_CATEGORIES.expense.forEach(cat => {
      const ref = colRef('finance_categories').doc(cat.id);
      batch.set(ref, { ...cat, type: 'expense', system: !cat.parentId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
    // Заповнюємо state з дефолтних
    _state.categories.income  = DEFAULT_CATEGORIES.income.map(c => ({ ...c, type: 'income' }));
    _state.categories.expense = DEFAULT_CATEGORIES.expense.map(c => ({ ...c, type: 'expense' }));
    console.log('[Finance] Default categories written');
  } catch(e) {
    // Якщо немає доступу до Firestore — просто використовуємо з пам'яті
    _state.categories.income  = DEFAULT_CATEGORIES.income.map(c => ({ ...c, type: 'income' }));
    _state.categories.expense = DEFAULT_CATEGORIES.expense.map(c => ({ ...c, type: 'expense' }));
    console.warn('[Finance] writeDefaultCategories fallback to memory:', e.message);
  }
}

// ── Рендер головного контейнера ──────────────────────────
function renderFinanceContainer() {
  const container = document.getElementById('financeContainer');
  if (!container) return;

  // Розтягуємо на всю ширину — компенсуємо padding батьківського .container
  container.style.cssText = 'width:100%;box-sizing:border-box;';
  const parentContainer = container.closest('.container');
  if (parentContainer) {
    const pad = parseFloat(getComputedStyle(parentContainer).paddingLeft) || 16;
    container.style.marginLeft = `-${pad}px`;
    container.style.marginRight = `-${pad}px`;
    container.style.width = `calc(100% + ${pad*2}px)`;
  }

  container.innerHTML = `
    <div id="financeModule" style="display:flex;flex-direction:column;height:100%;min-height:0;">

      <!-- Sub-navigation -->
      <div id="financeSubNav" style="
        display:flex;align-items:center;gap:0.25rem;
        padding:0.75rem 1rem 0;
        border-bottom:1px solid #e5e7eb;
        background:#fff;
        flex-shrink:0;
        overflow-x:auto;
      ">
        ${TABS.filter(t => t !== 'ai' || isOwnerOrManager()).map(t => `
          <button
            id="finSubTab_${t}"
            onclick="window._financeTab('${t}')"
            style="
              display:flex;align-items:center;gap:0.4rem;
              padding:0.5rem 0.85rem;
              border:none;border-radius:8px 8px 0 0;
              background:none;cursor:pointer;
              font-size:0.82rem;font-weight:500;
              color:${_state.activeSubTab === t ? 'var(--primary,#22c55e)' : '#6b7280'};
              border-bottom:2px solid ${_state.activeSubTab === t ? 'var(--primary,#22c55e)' : 'transparent'};
              white-space:nowrap;transition:all .15s;
            "
          >
            ${I[getTabLabels()[t].icon]}
            ${getTabLabels()[t].label}
          </button>
        `).join('')}

        <div style="flex:1"></div>

        <button onclick="window._finHowToggle()" id="finHowBtn" style="
          display:flex;align-items:center;gap:0.35rem;
          padding:0.4rem 0.8rem;
          background:#fff;color:#6b7280;
          border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;
          font-size:0.78rem;font-weight:500;flex-shrink:0;margin-right:4px;
        ">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          ${_tg('З чого почати','С чего начать')}
        </button>

        ${isOwnerOrManager() ? `
          <button onclick="window._financeAddTransaction()" style="
            display:flex;align-items:center;gap:0.4rem;
            padding:0.45rem 0.9rem;
            background:var(--primary,#22c55e);color:#fff;
            border:none;border-radius:8px;cursor:pointer;
            font-size:0.82rem;font-weight:600;
            flex-shrink:0;
          ">${I.plus} ${window.t('finAddBtn')}</button>
        ` : ''}
      </div>

      <!-- How It Works panel -->
      <div id="finHowPanel" style="display:none;background:linear-gradient(135deg,#f0fdf4,#eff6ff);border-bottom:2px solid #bbf7d0;padding:0;">
        <div id="finHowContent"></div>
      </div>

      <!-- Sub-tab content -->
      <div id="financeContent" style="flex:1;overflow-y:auto;padding:1.25rem;min-height:0;">
        <div id="financeContentInner"></div>
      </div>
    </div>
  `;

  renderSubTab(_state.activeSubTab);
}

// ── Рендер вкладок ────────────────────────────────────────
function renderSubTab(tab) {
  _state.activeSubTab = tab;

  // Оновити стилі кнопок
  TABS.forEach(t => {
    const btn = document.getElementById(`finSubTab_${t}`);
    if (!btn) return;
    const active = t === tab;
    btn.style.color = active ? 'var(--primary,#22c55e)' : '#6b7280';
    btn.style.borderBottom = `2px solid ${active ? 'var(--primary,#22c55e)' : 'transparent'}`;
  });

  const inner = document.getElementById('financeContentInner');
  if (!inner) return;

  switch (tab) {
    case 'dashboard': renderDashboard(inner); break;
    case 'income':    renderTransactions(inner, 'income'); break;
    case 'expense':   renderTransactions(inner, 'expense'); break;
    case 'recurring': renderRecurring(inner); break;
    case 'invoices':  renderInvoices(inner); break;
    case 'functions': renderFinanceFunctions(inner); break;
    case 'planning':   renderPlanning(inner); break;
    case 'analytics':  renderAnalytics(inner); break;
    case 'balance':    if (typeof window.renderBalanceSheet === 'function') window.renderBalanceSheet(inner); else inner.innerHTML = ('<div style="padding:2rem;text-align:center;color:#9ca3af;">' + _tg('Завантаження...','Загрузка...') + '</div>'); break;
    case 'ai':         renderAI(inner); break;
    case 'settings':  renderSettings(inner); break;
    default:          renderDashboard(inner);
  }
}

// ── Дашборд (заглушка Етап 1) ─────────────────────────────
// ── Дашборд — Етап 3 ──────────────────────────────────────
function renderDashboard(el) {
  const now = new Date();
  const monthLabel = now.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA', { month: 'long', year: 'numeric' });
  const totalBalance = _state.accounts.reduce((s, a) => s + (a.balance || 0), 0);

  el.innerHTML = `
    <div style="width:100%;">

      <!-- Header рядок -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${window.t('finTabDashboard')}</div>
          <div style="font-size:0.78rem;color:#6b7280;margin-top:0.1rem;">${monthLabel}</div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <select id="dashMonthSel" onchange="window._dashMonthChange(this.value)"
            style="padding:0.35rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
            ${Array.from({length:6},(_,i)=>{
              const d=new Date(now.getFullYear(),now.getMonth()-i,1);
              const val=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
              const lbl=d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA', {month:'long',year:'numeric'});
              return `<option value="${val}" ${i===0?'selected':''}>${lbl}</option>`;
            }).join('')}
          </select>
          ${isOwnerOrManager() ? `
            <button onclick="window._financeAddTransaction()"
              style="display:flex;align-items:center;gap:0.35rem;padding:0.35rem 0.8rem;
              background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;">
              ${I.plus} ${window.t('finAddBtn')}
            </button>
          ` : ''}
        </div>
      </div>

      <!-- KPI картки -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:0.75rem;margin-bottom:1.25rem;">
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">${window.t('finIncome')}</div>
          <div id="kpiIncome" style="font-size:1.5rem;font-weight:800;color:#22c55e;">...</div>
          <div id="kpiIncomeSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">${window.t('finExpense')}</div>
          <div id="kpiExpense" style="font-size:1.5rem;font-weight:800;color:#ef4444;">...</div>
          <div id="kpiExpenseSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">${window.t('finProfit')}</div>
          <div id="kpiProfit" style="font-size:1.5rem;font-weight:800;color:#3b82f6;">...</div>
          <div id="kpiProfitSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">${window.t('finMargin')}</div>
          <div id="kpiMargin" style="font-size:1.5rem;font-weight:800;color:#f59e0b;">...</div>
          <div id="kpiMarginSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
      </div>

      <!-- Графік + Рахунки -->
      <div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;flex-wrap:wrap;">

        <!-- Графік доходів/витрат за 6 місяців -->
        <div style="flex:1;min-width:280px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;overflow:hidden;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finIncVsExp')}</div>
          <div id="dashChart" style="width:100%;overflow:hidden;">
            <div style="color:#9ca3af;font-size:0.78rem;">${window.t('finLoading')}</div>
          </div>
          <div style="display:flex;gap:1rem;margin-top:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.35rem;font-size:0.72rem;color:#6b7280;">
              <div style="width:10px;height:10px;border-radius:2px;background:#22c55e;"></div>${window.t('finIncome')}
            </div>
            <div style="display:flex;align-items:center;gap:0.35rem;font-size:0.72rem;color:#6b7280;">
              <div style="width:10px;height:10px;border-radius:2px;background:#ef4444;"></div>${window.t('finExpense')||'Витрати'}
            </div>
          </div>
        </div>

        <!-- Рахунки -->
        <div style="width:240px;flex-shrink:0;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
            <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">${window.t('finAccountsLabel')}</div>
            ${isOwnerOrManager() ? `<button onclick="window._financeTransfer()" style="font-size:0.72rem;padding:3px 8px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;color:#374151;cursor:pointer;font-weight:500;">⇄ ${window.t('finTransfer')}</button>` : ''}
          </div>
          <div style="margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid #f3f4f6;">
            <div style="font-size:0.72rem;color:#6b7280;">${window.t('finTotalBalance')}</div>
            <div id="dashTotalBalance" style="font-size:1.25rem;font-weight:800;color:#1a1a1a;">${fmt(totalBalance)}</div>
          </div>
          <div id="dashAccounts">
          ${_state.accounts.map(acc => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #f9fafb;">
              <div style="font-size:0.8rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${escHtml(acc.name)}</div>
              <div style="font-size:0.82rem;font-weight:600;color:#1a1a1a;">${fmt(acc.balance, acc.currency)}</div>
            </div>
          `).join('')}
          </div>
        </div>
      </div>

      <!-- Сигнали + Топ витрат -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem;">

        <!-- Сигнали -->
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finSignals')}</div>
          <div id="dashAlerts">
            <div style="color:#9ca3af;font-size:0.8rem;">${window.t('checkingStatus')}</div>
          </div>
        </div>

        <!-- Топ витрат по категоріях -->
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finTopExpenses')}</div>
          <div id="dashTopExpense">
            <div style="color:#9ca3af;font-size:0.8rem;">${window.t('finLoading')}</div>
          </div>
        </div>
      </div>

      <!-- Donut + Проекти за маржею -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem;">
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finExpStructure')}</div>
          <div id="dashDonut"><div style="color:#9ca3af;font-size:0.8rem;">${window.t('finLoading')}</div></div>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finProjMargin')}</div>
          <div id="dashProjects"><div style="color:#9ca3af;font-size:0.8rem;">${window.t('finLoading')}</div></div>
        </div>
      </div>

      <!-- План-факт KPI -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;margin-bottom:1.25rem;">
        <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finPlanVsFact')}</div>
        <div id="dashPlanFact"><div style="color:#9ca3af;font-size:0.8rem;">${window.t('finLoading')}</div></div>
      </div>

    </div>
  `;

  // Завантажуємо дані
  const selMonth = document.getElementById('dashMonthSel');
  const monthVal = selMonth ? selMonth.value : (now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0'));
  loadDashboardData(monthVal);
  loadChartData();
}

// ── Зміна місяця на дашборді ─────────────────────────────
window._dashMonthChange = function(monthVal) {
  loadDashboardData(monthVal);
};

// ── Завантаження KPI + сигнали + топ витрат ──────────────
async function loadDashboardData(monthVal) {
  try {
    const [y, m] = monthVal.split('-').map(Number);
    const from = firebase.firestore.Timestamp.fromDate(new Date(y, m-1, 1));
    const to   = firebase.firestore.Timestamp.fromDate(new Date(y, m, 0, 23, 59, 59));

    const snap = await colRef('finance_transactions')
      .where('date', '>=', from)
      .where('date', '<=', to)
      .get();

    let income = 0, expense = 0;
    const expByCat = {};
    const catMap = {};
    (_state.categories.expense || []).forEach(c => { catMap[c.id] = c.name; });

    snap.docs.forEach(d => {
      const tx = d.data();
      if (tx.type === 'income')  income += txAmt(tx);
      if (tx.type === 'expense') {
        expense += txAmt(tx);
        const cn = tx.categoryId || 'other';
        expByCat[cn] = (expByCat[cn] || 0) + txAmt(tx);
      }
    });

    const profit = income - expense;
    const margin = income > 0 ? Math.round(profit / income * 100) : 0;
    const pColor = profit >= 0 ? '#22c55e' : '#ef4444';
    const txCount = snap.docs.length;

    // KPI
    const set = (id, val, sub, color) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = val; if (color) el.style.color = color; }
      const subEl = document.getElementById(id+'Sub');
      if (subEl) subEl.textContent = sub || '';
    };
    const incCount = snap.docs.filter(d=>d.data().type==='income').length;
    const expCount = snap.docs.filter(d=>d.data().type==='expense').length;
    set('kpiIncome',  fmt(income),  incCount + ` ${window.t('finOperations')}`, '#22c55e');
    set('kpiExpense', fmt(expense), expCount + ` ${window.t('finOperations')}`, '#ef4444');
    set('kpiProfit',  fmt(profit),  profit >= 0 ? window.t('finProfitWord') : window.t('finLossWord'), pColor);
    set('kpiMargin',  margin+'%',   income > 0 ? `${window.t('finFromIncome')} ${fmt(income)}` : window.t('finNoRevenue'), profit>=0?'#22c55e':'#ef4444');

    // Сигнали
    const alerts = [];
    if (income === 0 && expense === 0) {
      alerts.push({ type: 'info', text: window.t('finNoOps') });
    }
    _state.accounts.forEach(acc => {
      if ((acc.balance || 0) < 0) {
        alerts.push({ type: 'error', text: `${window.t('finNegBalance')} ${escHtml(acc.name)} (${fmt(acc.balance, acc.currency)})` });
      }
    });
    if (expense > income && income > 0) {
      alerts.push({ type: 'warn', text: `${window.t('finOverspend')} ${fmt(expense - income)}` });
    }
    if (margin < 10 && income > 0) {
      alerts.push({ type: 'warn', text: `${window.t('lowMarginAlert').replace('{V}', margin)}` });
    }
    if (alerts.length === 0) {
      alerts.push({ type: 'ok', text: window.t('finAllOk') });
    }

    const alertColors = { error: '#ef4444', warn: '#f59e0b', ok: '#22c55e', info: '#6b7280' };
    const alertBg     = { error: '#fef2f2', warn: '#fffbeb', ok: '#f0fdf4', info: '#f9fafb' };
    const alertIcon   = {
      error: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
      warn:  '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      ok:    '<polyline points="20 6 9 17 4 12"/>',
      info:  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    };

    const alertsEl = document.getElementById('dashAlerts');
    if (alertsEl) {
      alertsEl.innerHTML = alerts.map(a => `
        <div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.5rem 0.6rem;
          background:${alertBg[a.type]};border-radius:8px;margin-bottom:0.4rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${alertColors[a.type]}"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;">
            ${alertIcon[a.type]}
          </svg>
          <div style="font-size:0.78rem;color:${alertColors[a.type]};font-weight:500;">${a.text}</div>
        </div>
      `).join('');
    }

    // Топ витрат по категоріях
    // Перераховуємо реальний баланс по рахунках з УСІХ транзакцій (не тільки поточного місяця)
    await recalcAccountBalances();
    const totalBal = _state.accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalBalEl = document.getElementById('dashTotalBalance');
    if (totalBalEl) totalBalEl.textContent = fmt(totalBal);
    const accEl = document.getElementById('dashAccounts');
    if (accEl) {
      accEl.innerHTML = _state.accounts.map(acc => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #f9fafb;">
          <div style="font-size:0.8rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${escHtml(acc.name)}</div>
          <div style="font-size:0.82rem;font-weight:600;color:#1a1a1a;">${fmt(acc.balance, acc.currency)}</div>
        </div>
      `).join('');
    }

    const topEl = document.getElementById('dashTopExpense');
    if (topEl) {
      const sorted = Object.entries(expByCat)
        .map(([id, amt]) => ({ name: catMap[id] || id, amt }))
        .sort((a,b) => b.amt - a.amt)
        .slice(0, 5);

      if (sorted.length === 0) {
        topEl.innerHTML = '<div style="color:#9ca3af;font-size:0.8rem;">' + window.t('finNoExpenses2') + '</div>';
      } else {
        const maxAmt = sorted[0].amt;
        topEl.innerHTML = sorted.map(item => `
          <div style="margin-bottom:0.6rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem;">
              <div style="font-size:0.78rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${escHtml(item.name)}</div>
              <div style="font-size:0.78rem;font-weight:600;color:#ef4444;">${fmt(item.amt)}</div>
            </div>
            <div style="height:4px;background:#f3f4f6;border-radius:2px;">
              <div style="height:4px;background:#ef4444;border-radius:2px;width:${Math.round(item.amt/maxAmt*100)}%;"></div>
            </div>
          </div>
        `).join('');
      }
    }

    // ── Donut chart витрат по категоріях ─────────────────
    const donutEl = document.getElementById('dashDonut');
    if (donutEl) {
      const sorted = Object.entries(expByCat)
        .map(([id, amt]) => ({ name: catMap[id] || window.t('finOther'), amt }))
        .sort((a, b) => b.amt - a.amt).slice(0, 6);
      if (sorted.length === 0) {
        donutEl.innerHTML = '<div style="color:#9ca3af;font-size:0.8rem;">' + window.t('finNoExpenses2') + '</div>';
      } else {
        const COLORS = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#22c55e','#6b7280'];
        const total = sorted.reduce((s, x) => s + x.amt, 0);
        let cumAngle = -90;
        const R = 50, CX = 60, CY = 60;
        const paths = sorted.map((item, i) => {
          if (total === 0) return '';
        const pct = item.amt / total;
          const angle = pct * 360;
          const startRad = cumAngle * Math.PI / 180;
          const endRad   = (cumAngle + angle) * Math.PI / 180;
          const x1 = CX + R * Math.cos(startRad);
          const y1 = CY + R * Math.sin(startRad);
          const x2 = CX + R * Math.cos(endRad);
          const y2 = CY + R * Math.sin(endRad);
          const large = angle > 180 ? 1 : 0;
          cumAngle += angle;
          return `<path d="M${CX},${CY} L${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z"
            fill="${COLORS[i]}" opacity="0.85"><title>${escHtml(item.name)}: ${fmt(item.amt)}</title></path>`;
        }).join('');
        // Hole
        const hole = `<circle cx="${CX}" cy="${CY}" r="28" fill="white"/>
          <text x="${CX}" y="${CY}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#6b7280">${fmt(total)}</text>`;
        const legend = sorted.map((item, i) => `
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${COLORS[i]};flex-shrink:0;"></div>
            <div style="font-size:0.72rem;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${escHtml(item.name)}</div>
            <div style="font-size:0.72rem;font-weight:600;color:#374151;flex-shrink:0;">${Math.round(item.amt/total*100)}%</div>
          </div>`).join('');
        donutEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;">
            <svg width="120" height="120" viewBox="0 0 120 120" style="flex-shrink:0;">
              ${paths}${hole}
            </svg>
            <div style="flex:1;overflow:hidden;">${legend}</div>
          </div>`;
      }
    }

    // ── Топ проектів за маржею ────────────────────────────
    const projEl = document.getElementById('dashProjects');
    if (projEl) {
      try {
        const byProj = {};
        snap.docs.forEach(d => {
          const tx = d.data();
          if (!tx.projectId) return;
          if (!byProj[tx.projectId]) byProj[tx.projectId] = { inc: 0, exp: 0 };
          if (tx.type === 'income')  byProj[tx.projectId].inc += txAmt(tx);
          if (tx.type === 'expense') byProj[tx.projectId].exp += txAmt(tx);
        });
        const projRows = Object.entries(byProj).map(([pid, d]) => ({
          pid, profit: d.inc - d.exp,
          margin: d.inc > 0 ? Math.round((d.inc - d.exp) / d.inc * 100) : 0
        })).sort((a, b) => b.margin - a.margin).slice(0, 5);

        if (projRows.length === 0) {
          projEl.innerHTML = `<div style="color:#9ca3af;font-size:0.8rem;">${window.t('finNoProjData')}</div>`;
        } else {
          // Підтягуємо назви проектів
          let projNames = {};
          try {
            const ps = await colRef('projects').get();
            ps.docs.forEach(d => { projNames[d.id] = d.data().name || d.data().title || d.id.slice(0,6); });
          } catch(e) { /* немає */ }

          projEl.innerHTML = projRows.map((r, i) => {
            const mc = r.margin >= 30 ? '#22c55e' : r.margin >= 10 ? '#f59e0b' : '#ef4444';
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f3f4f6;">
                <div style="font-size:0.78rem;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;">
                  ${i+1}. ${escHtml(projNames[r.pid] || r.pid.slice(0,8))}
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="font-size:0.78rem;font-weight:700;color:${mc};">${r.margin}%</div>
                  <div style="font-size:0.75rem;color:#9ca3af;">${fmt(r.profit)}</div>
                </div>
              </div>`;
          }).join('');
        }
      } catch(e) { projEl.innerHTML = ''; }
    }

    // ── Plan-fact KPI ─────────────────────────────────────
    const pfEl = document.getElementById('dashPlanFact');
    if (pfEl) {
      try {
        const budSnap = await colRef('finance_budgets').doc(monthVal).get();
        const bud = budSnap.exists ? budSnap.data() : {};
        const totalBudget = Object.keys(bud).filter(k => k.startsWith('cat_')).reduce((s, k) => s + (bud[k] || 0), 0);
        const goalProfit  = bud['goal'] || 0;

        if (totalBudget === 0 && goalProfit === 0) {
          pfEl.innerHTML = `<div style="color:#9ca3af;font-size:0.8rem;">${window.t('budgetNotSet')}</div>`;
        } else {
          const rows = [
            { label: window.t('finPlanExpense'), plan: totalBudget, fact: expense, inverse: true },
            { label: window.t('finPlanProfit'), plan: goalProfit, fact: profit, inverse: false },
          ].filter(r => r.plan > 0);

          pfEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;">` +
            rows.map(r => {
              const pct = r.plan > 0 ? Math.round(r.fact / r.plan * 100) : 0;
              const ok  = r.inverse ? r.fact <= r.plan : r.fact >= r.plan;
              const barColor = ok ? '#22c55e' : r.inverse ? '#ef4444' : '#f59e0b';
              const barW = Math.min(Math.max(pct, 0), 100);
              return `
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px;">
                    <span style="color:#374151;font-weight:500;">${r.label}</span>
                    <span style="color:${barColor};font-weight:700;">${fmt(r.fact)} / ${fmt(r.plan)} (${pct}%)</span>
                  </div>
                  <div style="height:6px;background:#f3f4f6;border-radius:3px;">
                    <div style="height:6px;background:${barColor};border-radius:3px;width:${barW}%;transition:width .3s;"></div>
                  </div>
                </div>`;
            }).join('') + '</div>';
        }
      } catch(e) { pfEl.innerHTML = ''; }
    }

    // ── Сигнал: дебіторська >30 днів ─────────────────────
    try {
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const invSnap = await colRef('finance_invoices')
        .where('status', 'in', ['sent','overdue']).get();
      const overdue = invSnap.docs.filter(d => {
        const inv = d.data();
        const dt = inv.date?.toDate ? inv.date.toDate() : new Date(inv.date?.seconds * 1000 || 0);
        return dt < thirtyDaysAgo;
      });
      if (overdue.length > 0) {
        const alertsEl = document.getElementById('dashAlerts');
        if (alertsEl) {
          const debtTotal = overdue.reduce((s, d) => s + (d.data().total || 0), 0);
          const debtHtml = `
            <div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.5rem 0.6rem;
              background:#fef2f2;border-radius:8px;margin-bottom:0.4rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444"
                stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:1px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div style="font-size:0.78rem;color:#ef4444;font-weight:500;">
                ${window.t('debtorOverdue')} ${overdue.length} рахунків на ${fmt(debtTotal)}
              </div>
            </div>`;
          alertsEl.innerHTML = debtHtml + alertsEl.innerHTML;
        }
      }
    } catch(e) { /* invoices можуть бути пусті */ }

  } catch(e) {
    console.error('[Finance] loadDashboardData error:', e);
  }
}

// ── Графік 6 місяців (SVG bar chart) ─────────────────────
async function loadChartData() {
  const chartEl = document.getElementById('dashChart');
  if (!chartEl) return;

  try {
    const now = new Date();
    const months = Array.from({length:6}, (_,i) => {
      const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
      return {
        year: d.getFullYear(),
        month: d.getMonth()+1,
        label: d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA', {month:'short'}),
        income: 0,
        expense: 0,
      };
    });

    // Завантажуємо всі транзакції за 6 місяців одним запитом
    const from = firebase.firestore.Timestamp.fromDate(
      new Date(months[0].year, months[0].month-1, 1)
    );
    const to = firebase.firestore.Timestamp.fromDate(
      new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59, 59)
    );

    const snap = await colRef('finance_transactions')
      .where('date', '>=', from)
      .where('date', '<=', to)
      .get();

    snap.docs.forEach(d => {
      const tx = d.data();
      const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date?.seconds*1000 || 0);
      const mIdx = months.findIndex(m => m.year === txDate.getFullYear() && m.month === txDate.getMonth()+1);
      if (mIdx < 0) return;
      if (tx.type === 'income')  months[mIdx].income  += txAmt(tx);
      if (tx.type === 'expense') months[mIdx].expense += txAmt(tx);
    });

    const maxVal = Math.max(...months.map(m => Math.max(m.income, m.expense)), 1);
    // Фіксований viewBox — стовпці рівномірно по всій ширині
    const H  = 120;
    const VW = 480; // ширина viewBox завжди однакова
    const n  = months.length;
    const groupW = VW / n;
    const barW   = Math.floor(groupW * 0.28);
    const gap    = Math.floor(groupW * 0.06);

    const gridLines = [0.25, 0.5, 0.75, 1].map(r =>
      `<line x1="0" y1="${H - r*H}" x2="${VW}" y2="${H - r*H}" stroke="#f3f4f6" stroke-width="1"/>`
    ).join('');

    const bars = months.map((m, i) => {
      const cx  = i * groupW + groupW / 2;
      const incH = Math.round(m.income  / maxVal * H);
      const expH = Math.round(m.expense / maxVal * H);
      return `
        <g>
          <rect x="${cx - barW - gap/2}" y="${H - Math.max(incH,2)}" width="${barW}" height="${Math.max(incH,2)}"
            fill="#22c55e" rx="2" opacity="0.85"/>
          <rect x="${cx + gap/2}"        y="${H - Math.max(expH,2)}" width="${barW}" height="${Math.max(expH,2)}"
            fill="#ef4444" rx="2" opacity="0.85"/>
          <text x="${cx}" y="${H+16}" text-anchor="middle" font-size="11" fill="#9ca3af">${m.label}</text>
          <title>${m.label}: ${window.t('finIncome2')} ${fmt(m.income)} / ${window.t('finExpense2')} ${fmt(m.expense)}</title>
        </g>
      `;
    }).join('');

    chartEl.innerHTML = `
      <svg width="100%" viewBox="0 0 ${VW} ${H+20}"
        preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;">
        ${gridLines}
        ${bars}
      </svg>
    `;

  } catch(e) {
    console.error('[Finance] loadChartData error:', e);
    const chartEl2 = document.getElementById('dashChart');
    if (chartEl2) chartEl2.innerHTML = `<div style="color:#9ca3af;font-size:0.78rem;">${window.t('chartUnavailable')}</div>`;
  }
}

async function loadDashboardKPI() {
  // Тепер використовуємо loadDashboardData
  const now = new Date();
  const monthVal = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  await loadDashboardData(monthVal);
}

// ── Транзакції — Етап 2 ──────────────────────────────────
let _txFilter = { month: '', categoryId: '', accountId: '' };

function renderTransactions(el, type) {
  const label = type === 'income' ? window.t('finIncome') : window.t('finExpense');
  const color  = type === 'income' ? '#22c55e' : '#ef4444';
  const cats   = _state.categories[type] || [];

  // Місяці для фільтра (поточний + 5 попередніх)
  const monthOpts = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const lbl = d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA', { month: 'long', year: 'numeric' });
    monthOpts.push(`<option value="${val}" ${_txFilter.month===val?'selected':''}>${lbl}</option>`);
  }

  el.innerHTML = `
    <div style="width:100%;">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${label}</div>
        ${isOwnerOrManager() ? `
          <button onclick="window._financeAddTransaction('${type}')" style="
            display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;
            background:${color};color:#fff;border:none;border-radius:8px;
            cursor:pointer;font-size:0.82rem;font-weight:600;flex-shrink:0;
          ">${I.plus} ${window.t('finAddBtn')}</button>
        ` : ''}
      </div>

      <!-- Фільтри -->
      <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">
        <select id="txFilterMonth" onchange="window._txFilterChange('month',this.value,'${type}')"
          style="padding:0.4rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">${window.t('finAllMonths')}</option>
          ${monthOpts.join('')}
        </select>
        <select id="txFilterCat" onchange="window._txFilterCatChange(this.value,'${type}')"
          style="padding:0.4rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">${window.t('finAllCategories')}</option>
          ${cats.filter(c => !c.parentId).map(c => `<option value="${c.id}" ${_txFilter.categoryId===c.id?'selected':''}>${escHtml(c.name)}</option>`).join('')}
        </select>
        <select id="txFilterSubCat" onchange="window._txFilterChange('subcategoryId',this.value,'${type}')"
          style="display:none;padding:0.4rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">${_tg('Всі підкатегорії','Все подкатегории')}</option>
        </select>
        <select id="txFilterAcc" onchange="window._txFilterChange('accountId',this.value,'${type}')"
          style="padding:0.4rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">${window.t('finAllAccounts')}</option>
          ${_state.accounts.map(a => `<option value="${a.id}" ${_txFilter.accountId===a.id?'selected':''}>${escHtml(a.name)}</option>`).join('')}
        </select>
        <button onclick="window._exportTx('${type}')"
          style="display:flex;align-items:center;gap:5px;padding:0.4rem 0.75rem;border:1px solid #e5e7eb;
          border-radius:8px;font-size:0.8rem;background:#fff;color:#374151;cursor:pointer;font-weight:500;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          CSV
        </button>
        <button onclick="window._exportTxXlsx('${type}')"
          style="display:flex;align-items:center;gap:5px;padding:0.4rem 0.75rem;border:1px solid #22c55e;
          border-radius:8px;font-size:0.8rem;background:#f0fdf4;color:#16a34a;cursor:pointer;font-weight:500;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Excel
        </button>
      </div>

      <!-- Список транзакцій -->
      <div id="txList_${type}" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="padding:1.5rem;text-align:center;color:#9ca3af;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.5rem;display:block;margin-left:auto;margin-right:auto;">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style="font-size:0.85rem;">${window.t('finLoading')}</div>
        </div>
      </div>

      <!-- Підсумок -->
      <div id="txSummary_${type}" style="margin-top:0.75rem;text-align:right;font-size:0.82rem;color:#6b7280;"></div>
    </div>
  `;

  loadAndRenderTxList(type);
}

async function loadAndRenderTxList(type) {
  const listEl    = document.getElementById(`txList_${type}`);
  const summaryEl = document.getElementById(`txSummary_${type}`);
  if (!listEl) return;

  try {
    // Будуємо query залежно від фільтрів (уникаємо composite index без потреби)
    const hasMonth    = !!_txFilter.month;
    const hasCat      = !!_txFilter.categoryId;
    const hasAcc      = !!_txFilter.accountId;

    let query = colRef('finance_transactions').where('type', '==', type);

    if (hasMonth) {
      const [y, m] = _txFilter.month.split('-').map(Number);
      const from = firebase.firestore.Timestamp.fromDate(new Date(y, m-1, 1));
      const to   = firebase.firestore.Timestamp.fromDate(new Date(y, m, 0, 23, 59, 59));
      query = query.where('date', '>=', from).where('date', '<=', to); // orderBy на клієнті
    } else if (hasCat) {
      query = query.where('categoryId', '==', _txFilter.categoryId);
    } else if (hasAcc) {
      query = query.where('accountId', '==', _txFilter.accountId);
    } else {
      // Без фільтрів — простий запит, сортуємо на клієнті
      query = query.limit(100);
    }

    const snap = await query.get();
    let txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Сортування на клієнті (якщо не було orderBy в query)
    txs.sort((a, b) => {
      const da = a.date?.toMillis ? a.date.toMillis() : (a.date?.seconds || 0) * 1000;
      const db2 = b.date?.toMillis ? b.date.toMillis() : (b.date?.seconds || 0) * 1000;
      return db2 - da;
    });
    if (txs.length > 100) txs = txs.slice(0, 100);

    // Кешуємо для метрик (window._financeTxCache = всі останні транзакції)
    // Замінюємо повністю щоб не накопичувати застарілі дані при зміні фільтра
    window._financeTxCache = (window._financeTxCache || []).filter(c => !txs.find(t => t.id === c.id));
    window._financeTxCache.push(...txs);
    // Обмежуємо розмір кешу
    if (window._financeTxCache.length > 500) window._financeTxCache = window._financeTxCache.slice(-500);

    if (txs.length === 0) {
      listEl.innerHTML = `
        <div style="padding:2rem;text-align:center;color:#9ca3af;">
          <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.25rem;">${window.t('noTransactions')}</div>
          <div style="font-size:0.8rem;">${window.t('filterOrAdd')}</div>
        </div>`;
      if (summaryEl) summaryEl.textContent = '';
      return;
    }

    const color = type === 'income' ? '#22c55e' : '#ef4444';
    const total = txs.reduce((s, t) => s + (t.amount || 0), 0);
    const catMap = {};
    (_state.categories[type] || []).forEach(c => { catMap[c.id] = c.name; });
    const accMap = {};
    _state.accounts.forEach(a => { accMap[a.id] = a.name; });

    listEl.innerHTML = txs.map((tx, i) => {
      const dateStr = fmtDate(tx.date);
      const catName = catMap[tx.categoryId] || tx.categoryId || '—';
      const accName = accMap[tx.accountId]  || '—';
      const bg = i % 2 === 0 ? '#fff' : '#fafafa';
      return `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;background:${bg};border-bottom:1px solid #f3f4f6;" data-txid="${tx.id}">
          <div style="width:36px;height:36px;border-radius:10px;background:${type==='income'?'#f0fdf4':'#fef2f2'};
            display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${type === 'income' ? I.income : I.expense}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.85rem;font-weight:500;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${escHtml(tx.description || catName)}
            </div>
            <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.1rem;">
              ${catName} &bull; ${accName} &bull; ${dateStr}
              ${tx.counterparty ? ' &bull; ' + escHtml(tx.counterparty) : ''}
              ${tx.functionId ? ' &bull; <span style="color:#16a34a;">Ф</span>' : ''}
              ${tx.projectId  ? ' &bull; <span style="color:#3b82f6;">П</span>' : ''}
              ${tx.staffName  ? ' &bull; 👤 <b style="color:#7c3aed;">' + escHtml(tx.staffName) + '</b>' : ''}
              ${tx.workType   ? ' &bull; <span style="color:#6b7280;">' + escHtml(tx.workType) + '</span>' : ''}
              ${tx.paymentType === 'advance' ? ' &bull; <span style="color:#f59e0b;font-weight:600;">аванс</span>' : tx.paymentType === 'salary' ? ' &bull; <span style="color:#16a34a;font-weight:600;">зарплата</span>' : tx.paymentType === 'bonus' ? ' &bull; <span style="color:#8b5cf6;font-weight:600;">бонус</span>' : ''}
            </div>
          </div>
          <div style="font-size:0.95rem;font-weight:700;color:${color};flex-shrink:0;">
            ${type==='income'?'+':'−'}${fmt(tx.amount, tx.currency)}
          </div>
          ${isOwnerOrManager() ? `
            <button onclick="window._financeDeleteTx('${tx.id}','${type}')"
              style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:0.25rem;border-radius:6px;flex-shrink:0;"
              title=${window.t('flowDelete')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          ` : ''}
        </div>
      `;
    }).join('');

    if (summaryEl) {
      summaryEl.innerHTML = `${window.t('finTotal')} <strong style="color:${color};">${fmt(total)}</strong> &bull; ${txs.length} ${window.t('finOperationsCount')}`;
    }

  } catch(e) {
    console.error('[Finance] loadTxList error:', e);
    listEl.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#ef4444;font-size:0.85rem;">${_tg('Помилка завантаження:','Ошибка загрузки:')} ${escHtml(e.message)}</div>`;
  }
}

// ════════════════════════════════════════════════════════════
// ── INVOICES — Рахунки клієнтам ─────────────────────────────
// ════════════════════════════════════════════════════════════

async function _loadFunctionsCache() {
  try {
    const db = getDb();
    if (!db || !_state.companyId) return;
    const snap = await window.companyRef()
      .collection('functions').orderBy('name').get();
    _state.functions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    _state.functions = [];
  }
}

async function _loadInvoices() {
  try {
    const snap = await colRef('finance_invoices').orderBy('createdAt', 'desc').limit(100).get();
    _state.invoices = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    _state.invoices = [];
  }
}

function _nextInvoiceNumber(invoices) {
  if (!invoices || invoices.length === 0) return 'INV-001';
  const nums = invoices
    .map(inv => { const m = (inv.number || '').match(/(\d+)$/); return m ? parseInt(m[1]) : 0; })
    .filter(n => n > 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return 'INV-' + String(max + 1).padStart(3, '0');
}

function _invoiceStatusBadge(status) {
  const map = {
    draft:    { label: window.t('finInvoiceDraft'),  bg: '#f3f4f6', color: '#6b7280' },
    sent:     { label: window.t('finInvoiceSent'), bg: '#eff6ff', color: '#3b82f6' },
    paid:     { label: window.t('finInvoicePaid'),  bg: '#f0fdf4', color: '#16a34a' },
    overdue:  { label: window.t('finInvoiceOverdue'), bg: '#fef2f2', color: '#dc2626' },
    cancelled:{ label: window.t('finInvoiceCancelled'), bg: '#f9fafb', color: '#9ca3af' },
  };
  const s = map[status] || map.draft;
  return `<span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;background:${s.bg};color:${s.color};">${s.label}</span>`;
}

function _invoiceTotals(items, vatPct) {
  const subtotal = (items || []).reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), 0);
  const vat = vatPct > 0 ? subtotal * vatPct / 100 : 0;
  const total = subtotal + vat;
  return { subtotal, vat, total };
}

// ── Експорт транзакцій CSV / Excel ───────────────────────
async function _getTxForExport(type) {
  const [y, m] = _txFilter.month
    ? _txFilter.month.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  const EXPORT_LIMIT = 2000;
  let query = colRef('finance_transactions').where('type', '==', type);
  if (_txFilter.month) {
    const from = firebase.firestore.Timestamp.fromDate(new Date(y, m-1, 1));
    const to   = firebase.firestore.Timestamp.fromDate(new Date(y, m, 0, 23, 59, 59));
    query = query.where('date', '>=', from).where('date', '<=', to); // orderBy на клієнті
  } else {
    query = query.limit(EXPORT_LIMIT);
  }
  if (_txFilter.subcategoryId) {
    query = query.where('subcategoryId', '==', _txFilter.subcategoryId);
  } else if (_txFilter.categoryId) {
    query = query.where('categoryId', '==', _txFilter.categoryId);
  }

  const snap = await query.get();

  // Попередження якщо досягли ліміту — дані можуть бути обрізані
  if (!_txFilter.month && snap.docs.length >= EXPORT_LIMIT) {
    if (typeof showToast === 'function')
      showToast(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${window.t('finExportLimit').replace('{n}', EXPORT_LIMIT)}`, 'warn', 6000);
  }

  const catMap = {};
  [...(_state.categories.income || []), ...(_state.categories.expense || [])].forEach(c => { catMap[c.id] = c.name; });
  const accMap = {};
  (_state.accounts || []).forEach(a => { accMap[a.id] = a.name; });

  return snap.docs.map(d => {
    const tx = d.data();
    const dt = tx.date?.toDate ? tx.date.toDate() : new Date((tx.date?.seconds || 0) * 1000);
    return {
      [_tg('Дата','Дата')]:             dt.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA'),
      Тип:              tx.type === 'income' ? window.t('finTransactionIncome') : window.t('finTransactionExpense'),
      [_tg('Сума','Сумма')]:             tx.amount || 0,
      [_tg('Валюта','Валюта')]:           tx.currency || _state.currency || 'EUR',
      [_tg('Сума (базова)','Сумма (базовая)')]:  tx.amountBase != null ? tx.amountBase : (tx.amount || 0),
      [_tg('Баз. валюта','Баз. валюта')]:    _state.currency || 'EUR',
      [ window.t('finCategoryLbl') ]: catMap[tx.categoryId] || tx.categoryName || '',
      [_tg('Рахунок','Счет')]:          accMap[tx.accountId] || '',
      [ window.t('finCounterpartyLbl') ]: tx.counterparty || '',
      [_tg('Опис','Описание')]:             tx.description || '',
      [_tg('Проект','Проект')]:           tx.projectId || '',
      [ window.t('finFunctionLbl') ]: tx.functionId || '',
    };
  });
}

window._exportTx = async function(type) {
  try {
    const rows = await _getTxForExport(type);
    if (!rows.length) { if (typeof showToast === 'function') showToast(window.t('noExportData'), 'warn'); return; }

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => {
        const v = String(r[h] ?? '').replace(/"/g, '""');
        return v.includes(';') || v.includes('"') || v.includes('\n') ? `"${v}"` : v;
      }).join(';'))
    ];
    const bom = '\uFEFF'; // UTF-8 BOM для Excel
    const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `finance_${type}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast(window.t('exportedRows').replace('{V}', rows.length), 'success');
  } catch(e) { if (typeof showToast === 'function') showToast('Помилка експорту: ' + e.message, 'error'); }
};

window._exportTxXlsx = async function(type) {
  try {
    const rows = await _getTxForExport(type);
    if (!rows.length) { if (typeof showToast === 'function') showToast(window.t('noExportData'), 'warn'); return; }

    // Генеруємо XLSX вручну (без бібліотек) — XML-based Office Open XML
    const headers = Object.keys(rows[0]);
    const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const sharedStrings = [];
    const ssMap = {};
    const si = str => {
      if (ssMap[str] === undefined) { ssMap[str] = sharedStrings.length; sharedStrings.push(str); }
      return ssMap[str];
    };

    const cellRef = (col, row) => {
      let s = '';
      let c = col;
      do { s = String.fromCharCode(65 + (c % 26)) + s; c = Math.floor(c / 26) - 1; } while (c >= 0);
      return s + row;
    };
    let xmlRows = '';

    // Header row
    xmlRows += `<row r="1">${headers.map((h, c) => `<c r="${cellRef(c,1)}" t="s"><v>${si(h)}</v></c>`).join('')}</row>`;

    // Data rows
    rows.forEach((row, ri) => {
      const r = ri + 2;
      const cells = headers.map((h, c) => {
        const v = row[h];
        if (typeof v === 'number') return `<c r="${cellRef(c,r)}"><v>${v}</v></c>`;
        return `<c r="${cellRef(c,r)}" t="s"><v>${si(String(v ?? ''))}</v></c>`;
      }).join('');
      xmlRows += `<row r="${r}">${cells}</row>`;
    });

    const ssXml = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">${sharedStrings.map(s=>`<si><t>${esc(s)}</t></si>`).join('')}</sst>`;
    const sheetXml = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${xmlRows}</sheetData></worksheet>`;
    const wbXml = `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name=${window.t('permFinance')} sheetId="1" r:id="rId1"/></sheets></workbook>`;
    const relsXml = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`;
    const contentTypes = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`;

    // Пакуємо в ZIP через JSZip (якщо доступний) або fallback на CSV
    if (typeof JSZip !== 'undefined') {
      const zip = new JSZip();
      zip.file('[Content_Types].xml', contentTypes);
      zip.file('xl/workbook.xml', wbXml);
      zip.file('xl/worksheets/sheet1.xml', sheetXml);
      zip.file('xl/sharedStrings.xml', ssXml);
      zip.file('xl/_rels/workbook.xml.rels', relsXml);
      zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `finance_${type}_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (typeof showToast === 'function') showToast(window.t('excelExported').replace('{V}', rows.length), 'success');
    } else {
      // Завантажуємо JSZip динамічно
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => window._exportTxXlsx(type);
      document.head.appendChild(script);
      if (typeof showToast === 'function') showToast(window.t('finLibLoading'), 'info', 2000);
    }
  } catch(e) { if (typeof showToast === 'function') showToast('Помилка Excel експорту: ' + e.message, 'error'); }
};

// ── Переказ між рахунками ─────────────────────────────────
window._financeTransfer = function() {
  if (!isOwnerOrManager()) return;
  const accs = _state.accounts || [];
  if (accs.length < 2) {
    if (typeof showToast === 'function') showToast(window.t('minTwoAccounts'), 'warn');
    return;
  }

  const existing = document.getElementById('transferModal');
  if (existing) existing.remove();

  const accOpts = accs.map(a => `<option value="${a.id}">${escHtml(a.name)} (${fmt(a.balance, a.currency)})</option>`).join('');

  const modal = document.createElement('div');
  modal.id = 'transferModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:1.5rem;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${window.t('finTransferTitle')}</div>
        <button onclick="document.getElementById('transferModal')?.remove()"
          style="background:none;border:none;font-size:1.2rem;color:#9ca3af;cursor:pointer;padding:2px;">×</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">${window.t('transferFrom')}</label>
          <select id="trFrom" style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
            ${accOpts}
          </select>
        </div>
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">${_tg('Куди','Куда')}</label>
          <select id="trTo" style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
            ${accOpts}
          </select>
        </div>
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">${_tg('Сума','Сумма')}</label>
          <input id="trAmount" type="number" min="0.01" step="0.01" placeholder="0.00"
            style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">${window.t('transferNote')}</label>
          <input id="trNote" type="text" placeholder="${_tg('напр. Поповнення каси','напр. Пополнение кассы')}"
            style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
        </div>
      </div>

      <div style="display:flex;gap:0.5rem;margin-top:1.25rem;">
        <button onclick="document.getElementById('transferModal')?.remove()"
          style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#374151;cursor:pointer;font-size:0.85rem;">
          ${_tg('Скасувати','Отмена')}
        </button>
        <button onclick="window._doTransfer()"
          style="flex:1;padding:10px;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:0.85rem;font-weight:600;">
          ${_tg('Переказати','Перевести')}
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // Автоматично вибираємо різні рахунки
  const toSel = document.getElementById('trTo');
  if (toSel && accs.length >= 2) toSel.value = accs[1].id;
};

window._doTransfer = async function() {
  if (!_state.companyId || !_state.initialized) { if (typeof showToast === 'function') showToast(window.t('finNotInit'), 'error'); return; }
  const fromId = document.getElementById('trFrom')?.value;
  const toId   = document.getElementById('trTo')?.value;
  const amount = parseFloat(document.getElementById('trAmount')?.value || 0);
  const note   = document.getElementById('trNote')?.value?.trim() || '';

  if (!fromId || !toId) return;
  if (fromId === toId) { if (typeof showToast === 'function') showToast(window.t('finTransferDiff'), 'warn'); return; }
  if (!amount || amount <= 0) { if (typeof showToast === 'function') showToast(window.t('finTransferAmount'), 'warn'); return; }

  const fromAcc = _state.accounts.find(a => a.id === fromId);
  if (fromAcc && (fromAcc.balance || 0) < amount) {
    if (typeof showToast === 'function') showToast(`${window.t('insufficientFunds')} ${fmt(fromAcc.balance)}`, 'error');
    return;
  }

  const btn = document.querySelector('#transferModal button[onclick="window._doTransfer()"]');
  if (btn) { btn.disabled = true; btn.textContent = _tg('Збереження...','Сохранение...'); }

  try {
    const db = getDb();
    const companyId = _state.companyId;
    const ts = firebase.firestore.Timestamp.now();
    const desc = note || `${window.t('finTransferBetween')}`;

    // Два оновлення балансу + запис в finance_transfers
    // Атомарно: batch щоб обидва update або жоден
    const batch = db.batch();
    batch.update(
      db.collection('companies').doc(companyId).collection('finance_accounts').doc(fromId),
      { balance: firebase.firestore.FieldValue.increment(-amount) }
    );
    batch.update(
      db.collection('companies').doc(companyId).collection('finance_accounts').doc(toId),
      { balance: firebase.firestore.FieldValue.increment(amount) }
    );
    await batch.commit();

    await db.collection('companies').doc(companyId)
      .collection('finance_transfers').add({
        fromAccountId: fromId, toAccountId: toId,
        amount, currency: _state.currency || 'EUR',
        description: desc, date: ts,
        createdBy: _state.currentUser?.uid || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    document.getElementById('transferModal')?.remove();

    // Перезавантажуємо рахунки з Firestore — гарантує актуальні баланси
    // навіть якщо інший юзер паралельно зробив транзакцію
    await loadAccounts();

    // Оновлюємо UI дашборду
    const totalBal = _state.accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const tbEl = document.getElementById('dashTotalBalance');
    if (tbEl) tbEl.textContent = fmt(totalBal);
    const accEl = document.getElementById('dashAccounts');
    if (accEl) accEl.innerHTML = _state.accounts.map(acc => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #f9fafb;">
        <div style="font-size:0.8rem;color:#374151;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${escHtml(acc.name)}</div>
        <div style="font-size:0.82rem;font-weight:600;color:#1a1a1a;">${fmt(acc.balance, acc.currency)}</div>
      </div>`).join('');

    if (typeof showToast === 'function') showToast(`${window.t('finTransferDone').replace('{sum}', fmt(amount))}`, 'success');
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = _tg('Переказати','Перевести'); }
    if (typeof showToast === 'function') showToast(_tg('Помилка переказу: ','Ошибка перевода: ') + e.message, 'error');
  }
};

function renderInvoices(el) {
  const currency = _state.currency || 'EUR';
  const invoices = _state.invoices || [];

  const total   = invoices.reduce((s, inv) => s + (inv.total || 0), 0);
  const paid    = invoices.filter(i => i.status === 'paid').reduce((s, inv) => s + (inv.total || 0), 0);
  const pending = invoices.filter(i => i.status === 'sent').reduce((s, inv) => s + (inv.total || 0), 0);

  el.innerHTML = `
    <div style="width:100%;">
      <!-- Статистика -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
        ${[
          { label: window.t('finInvoiceIssued'),   val: fmt(total, currency),   color: '#22c55e' },
          { label: window.t('finInvoicePaid'),     val: fmt(paid, currency),    color: '#16a34a' },
          { label: window.t('finInvoiceAwaiting'),val: fmt(pending, currency), color: '#f59e0b' },
        ].map(s => `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;">
            <div style="font-size:0.75rem;color:#6b7280;margin-bottom:4px;">${s.label}</div>
            <div style="font-size:1.15rem;font-weight:700;color:${s.color};">${s.val}</div>
          </div>`).join('')}
      </div>

      <!-- Кнопка додати -->
      ${isOwnerOrManager() ? `
        <div style="margin-bottom:16px;">
          <button onclick="window._invoiceAdd()"
            style="background:#22c55e;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:0.9rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
            ${I.plus} ${window.t('finNewAccount')}
          </button>
        </div>` : ''}

      <!-- Список -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
        ${invoices.length === 0 ? `
          <div style="text-align:center;padding:40px;color:#9ca3af;">
            <div style="margin-bottom:8px;color:#9ca3af;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
            <div style="font-weight:600;margin-bottom:4px;">${window.t('finNoAccountsYet')}</div>
            <div style="font-size:0.85rem;">${window.t('finNoAccountsHint')}</div>
          </div>` :
          invoices.map(inv => _invoiceRow(inv, currency)).join('<div style="border-top:1px solid #f3f4f6;"></div>')
        }
      </div>
    </div>`;
}

function _invoiceRow(inv, currency) {
  const { total } = _invoiceTotals(inv.items, inv.vatPct || 0);
  const displayTotal = inv.total || total;
  return `
    <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <div style="flex:0 0 90px;font-size:0.85rem;font-weight:700;color:#1a1a1a;">${escHtml(inv.number || '—')}</div>
      <div style="flex:1;min-width:120px;">
        <div style="font-size:0.9rem;font-weight:600;color:#1a1a1a;">${escHtml(inv.clientName || '—')}</div>
        <div style="font-size:0.75rem;color:#9ca3af;">${inv.date ? fmtDate(inv.date) : '—'}</div>
      </div>
      <div style="flex:0 0 100px;text-align:right;font-size:0.9rem;font-weight:700;color:#1a1a1a;">${fmt(displayTotal, currency)}</div>
      <div style="flex:0 0 110px;text-align:center;">${_invoiceStatusBadge(inv.status || 'draft')}</div>
      <div style="flex:0 0 auto;display:flex;gap:6px;">
        <button onclick="window._invoicePdf('${inv.id}')" title="PDF"
          style="border:1px solid #e5e7eb;background:#fff;border-radius:7px;padding:5px 8px;cursor:pointer;font-size:0.75rem;color:#374151;">PDF</button>
        ${inv.status !== 'paid' ? `
          <button onclick="window._invoicePayOnline('${inv.id}')"
            style="border:1px solid #635bff;background:#635bff;border-radius:7px;padding:5px 10px;cursor:pointer;color:white;font-weight:600;font-size:0.75rem;display:flex;align-items:center;gap:4px;"
            title="Stripe">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            ${window.t('stripePayOnline')||'Оплатити онлайн'}
          </button>
        ` : ''}
        ${isOwnerOrManager() ? `
          ${inv.status !== 'paid' ? `<button onclick="window._invoiceMarkPaid('${inv.id}')" title="Оплачено"
            style="border:1px solid #d1fae5;background:#f0fdf4;border-radius:7px;padding:5px 8px;cursor:pointer;color:#16a34a;">${I.check}</button>` : ''}
          <button onclick="window._invoiceEdit('${inv.id}')" title=${window.t('flowEdit')}
            style="border:1px solid #e5e7eb;background:#fff;border-radius:7px;padding:5px 8px;cursor:pointer;color:#6b7280;">${I.edit}</button>
          <button onclick="window._invoiceDelete('${inv.id}')" title=${window.t('flowDelete')}
            style="border:1px solid #fee2e2;background:#fef2f2;border-radius:7px;padding:5px 8px;cursor:pointer;color:#ef4444;">${I.trash}</button>
        ` : ''}
      </div>
    </div>`;
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Модальне вікно рахунку ────────────────────────────────
window._invoiceAdd  = (crmDealId, clientName) => _invoiceModal(null, null, crmDealId, clientName);
window._invoiceEdit = (id) => {
  const inv = (_state.invoices || []).find(i => i.id === id);
  if (inv) _invoiceModal(inv);
};

// FIX CG: crmDealId + prefillClient allow CRM to open invoice form linked to a deal
function _invoiceModal(inv, _unused, crmDealId, prefillClient) {
  const isEdit = !!inv;
  const currency = _state.currency || 'EUR';
  const nextNum  = _nextInvoiceNumber(_state.invoices);

  // Дефолтні рядки позицій
  const defaultItems = inv?.items || [{ desc: '', qty: 1, price: 0 }];
  const itemsJson = JSON.stringify(defaultItems).replace(/'/g, '&#39;');

  const overlay = document.createElement('div');
  overlay.id = 'invoiceModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;';

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:18px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #f3f4f6;">
        <div style="font-size:1.1rem;font-weight:700;color:#1a1a1a;">${isEdit ? window.t('finEditAccount') : window.t('finNewAccount')}</div>
        <button onclick="document.getElementById('invoiceModal')?.remove()" style="border:none;background:#f3f4f6;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.1rem;">×</button>
      </div>

      <!-- Body -->
      <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;">

        <!-- Номер та дата -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('invNumberLbl')}</label>
            <input id="inv_number" value="${escHtml(inv?.number || nextNum)}"
              style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finDateLbl')}</label>
            <input id="inv_date" type="date" value="${inv?.date || new Date().toISOString().split('T')[0]}"
              style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
        </div>

        <!-- Клієнт -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('invoiceClient')}</label>
          <input id="inv_client" value="${escHtml(inv?.clientName || prefillClient || '')}" placeholder=${window.t('finCompanyPh')}
            style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Реквізити клієнта -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('invoiceRequisites')}</label>
          <textarea id="inv_client_details" rows="2" placeholder=${window.t('finDetailsPh')}
            style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.85rem;resize:vertical;box-sizing:border-box;">${escHtml(inv?.clientDetails || '')}</textarea>
        </div>

        <!-- Позиції -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:8px;">${window.t('invoiceItems')}</label>
          <div id="inv_items_list" style="display:flex;flex-direction:column;gap:6px;"></div>
          <button onclick="window._invAddLine()" style="margin-top:8px;border:1px dashed #d1d5db;background:#f9fafb;border-radius:8px;padding:7px 14px;font-size:0.82rem;color:#6b7280;cursor:pointer;width:100%;">${window.t('finAddLine')}</button>
        </div>

        <!-- ПДВ -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:end;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('vatLabel')}</label>
            <input id="inv_vat" type="number" min="0" max="100" value="${inv?.vatPct ?? 0}"
              oninput="window._invRecalc()"
              style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
          <div id="inv_totals_block" style="text-align:right;font-size:0.85rem;color:#374151;"></div>
        </div>

        <!-- Примітки -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('invoiceNotes')}</label>
          <textarea id="inv_notes" rows="3" placeholder="${window.t('ibanPlaceholder')}"
            style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.85rem;resize:vertical;box-sizing:border-box;">${escHtml(inv?.notes || '')}</textarea>
        </div>

        <!-- FIX CG: hidden CRM deal link -->
        <input type="hidden" id="inv_crm_deal_id" value="${escHtml(inv?.crmDealId || crmDealId || '')}">

      </div>

      <!-- Footer -->
      <div style="display:flex;gap:10px;justify-content:flex-end;padding:16px 24px;border-top:1px solid #f3f4f6;">
        <button onclick="document.getElementById('invoiceModal')?.remove()"
          style="border:1px solid #e5e7eb;background:#fff;border-radius:10px;padding:9px 20px;font-size:0.9rem;cursor:pointer;color:#374151;">${window.t('cancel')}</button>
        <button id="inv_save_btn" onclick="window._invoiceSave('${inv?.id || ''}')"
          style="background:#22c55e;color:#fff;border:none;border-radius:10px;padding:9px 20px;font-size:0.9rem;font-weight:600;cursor:pointer;">${isEdit ? window.t('finSave') : window.t('finCreate')}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Ініціалізація рядків позицій
  window._invItems = defaultItems.map(it => ({ ...it }));
  _invRenderLines();
  _invRecalc();
}

// ── Позиції (рядки) ────────────────────────────────────────
window._invItems = [];

window._invAddLine = function() {
  window._invItems.push({ desc: '', qty: 1, price: 0 });
  _invRenderLines();
  _invRecalc();
};

window._invRemoveLine = function(idx) {
  if (window._invItems.length <= 1) return;
  window._invItems.splice(idx, 1);
  _invRenderLines();
  _invRecalc();
};

window._invLineChange = function(idx, field, value) {
  if (!window._invItems[idx]) return;
  window._invItems[idx][field] = (field === 'qty' || field === 'price') ? parseFloat(value) || 0 : value;
  _invRecalc();
};

function _invRenderLines() {
  const container = document.getElementById('inv_items_list');
  if (!container) return;
  container.innerHTML = window._invItems.map((it, idx) => `
    <div style="display:grid;grid-template-columns:1fr 70px 90px 32px;gap:6px;align-items:center;">
      <input value="${escHtml(it.desc)}" placeholder="${window.t('invItemDesc')}"
        oninput="window._invLineChange(${idx},'desc',this.value)"
        style="border:1px solid #e5e7eb;border-radius:7px;padding:6px 10px;font-size:0.82rem;box-sizing:border-box;">
      <input type="number" value="${it.qty}" min="0" placeholder=${window.t('qtyShort')}
        oninput="window._invLineChange(${idx},'qty',this.value)"
        style="border:1px solid #e5e7eb;border-radius:7px;padding:6px 8px;font-size:0.82rem;box-sizing:border-box;text-align:right;">
      <input type="number" value="${it.price}" min="0" placeholder=${window.t('priceWord')}
        oninput="window._invLineChange(${idx},'price',this.value)"
        style="border:1px solid #e5e7eb;border-radius:7px;padding:6px 8px;font-size:0.82rem;box-sizing:border-box;text-align:right;">
      <button onclick="window._invRemoveLine(${idx})"
        style="border:none;background:transparent;cursor:pointer;color:#ef4444;font-size:1rem;padding:0;display:flex;align-items:center;justify-content:center;">×</button>
    </div>`).join('');
}

window._invRecalc = function() {
  const vatPct = parseFloat(document.getElementById('inv_vat')?.value) || 0;
  const { subtotal, vat, total } = _invoiceTotals(window._invItems, vatPct);
  const currency = _state.currency || 'EUR';
  const block = document.getElementById('inv_totals_block');
  if (block) block.innerHTML = `
    <div>${window.t('subtotalLabel')} <strong>${fmt(subtotal, currency)}</strong></div>
    ${vatPct > 0 ? `<div>${window.t('vatLabel')} ${vatPct}%: <strong>${fmt(vat, currency)}</strong></div>` : ''}
    <div style="font-size:1rem;font-weight:700;color:#22c55e;margin-top:2px;">${window.t('finTotal')} ${fmt(total, currency)}</div>`;
};

// ── Збереження ─────────────────────────────────────────────

// ── Stripe — оплата рахунку онлайн ───────────────────────
window._invoicePayOnline = async function(invoiceId) {
  const inv = _state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;
  if (inv.status === 'paid') {
    if (typeof showToast === 'function') showToast(window.t('finAlreadyPaid')||'Вже оплачено', 'info');
    return;
  }
  const btn = document.querySelector(`button[onclick="_invoicePayOnline('${invoiceId}')"]`);
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  try {
    const res = await fetch('/api/stripe?action=create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId:   window.currentCompanyId,
        invoiceId:   invoiceId,
        amount:      inv.total || inv.amount || 0,
        currency:    inv.currency || _state.currency || 'EUR',
        description: `${inv.number || _tg('Рахунок','Счет')} — ${inv.clientName || ''}`.trim(),
        clientEmail: inv.clientEmail || '',
        clientName:  inv.clientName  || '',
        successUrl:  window.location.origin + '/?stripe=success&invoiceId=' + invoiceId,
        cancelUrl:   window.location.origin + '/?stripe=cancelled',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    window.open(data.url, '_blank');
    if (typeof showToast === 'function')
      showToast(window.t('stripeRedirecting')||'Переходимо до оплати...', 'success');
  } catch(e) {
    if (typeof showToast === 'function') showToast('Stripe: ' + e.message, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = window.t('stripePayOnline')||'Оплатити онлайн'; }
  }
};

window._invoiceSave = async function(editId) {
  if (window._invoiceSaving) return; // guard проти подвійного кліку
  window._invoiceSaving = true;
  const btn = document.getElementById('inv_save_btn');
  if (btn) { btn.disabled = true; btn.textContent = window.t('savingDots'); }

  const vatPct = parseFloat(document.getElementById('inv_vat')?.value) || 0;
  const { total } = _invoiceTotals(window._invItems, vatPct);

  // FIX CG: read crmDealId from hidden field if set (links invoice to CRM deal for automation)
  const _crmDealId = document.getElementById('inv_crm_deal_id')?.value.trim() || null;
  const data = {
    number:        document.getElementById('inv_number')?.value.trim() || '',
    date:          document.getElementById('inv_date')?.value || '',
    clientName:    document.getElementById('inv_client')?.value.trim() || '',
    clientDetails: document.getElementById('inv_client_details')?.value.trim() || '',
    items:         window._invItems.map(it => ({ desc: it.desc, qty: it.qty, price: it.price })),
    vatPct,
    total,
    notes:         document.getElementById('inv_notes')?.value.trim() || '',
    status:        editId ? undefined : 'draft',
    crmDealId:     _crmDealId || undefined,    // FIX CG: required for invoice_paid→deal_won automation
    updatedAt:     firebase.firestore.FieldValue.serverTimestamp(),
  };
  if (!editId) data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  if (!data.number) { if (typeof showToast === 'function') showToast(window.t('finEnterInvNum'), 'warning'); if (btn) { btn.disabled = false; btn.textContent = window.t('finSave'); } window._invoiceSaving = false; return; }
  if (!data.clientName) { if (typeof showToast === 'function') showToast(window.t('finEnterClient'), 'warning'); if (btn) { btn.disabled = false; btn.textContent = window.t('finSave'); } window._invoiceSaving = false; return; }

  // Видаляємо undefined
  if (editId) delete data.status;
  Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

  try {
    const col = colRef('finance_invoices');
    if (editId) {
      await col.doc(editId).update(data);
    } else {
      await col.add(data);
    }
    await _loadInvoices();
    document.getElementById('invoiceModal')?.remove();
    renderSubTab('invoices');
  } catch(e) {
    console.error('[Invoice] save error:', e);
    if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = window.t('finSave'); }
  } finally {
    window._invoiceSaving = false;
  }
};

// ── Позначити оплаченим ────────────────────────────────────
window._invoiceMarkPaid = async function(id) {
  // FIX CA: use showConfirmModal instead of native confirm + emit INVOICE_PAID for automation
  const confirmed = typeof showConfirmModal === 'function'
    ? await showConfirmModal(window.t('finMarkPaid'))
    : confirm(window.t('finMarkPaid'));
  if (!confirmed) return;
  try {
    await colRef('finance_invoices').doc(id).update({ status: 'paid', paidAt: firebase.firestore.FieldValue.serverTimestamp() });
    const inv = _state.invoices.find(i => i.id === id);
    if (inv) inv.status = 'paid';
    renderSubTab('invoices');
    // FIX CA: emit INVOICE_PAID so automation can close linked CRM deal
    if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS && inv?.crmDealId) {
      await emitTalkoEvent(window.TALKO_EVENTS.INVOICE_PAID, {
        invoiceId: id,
        dealId: inv.crmDealId,
        amount: inv.total || inv.amount || 0,
        clientName: inv.clientName || inv.client || '',
      }, { triggeredBy: 'user' });
    }
  } catch(e) { if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error'); else alert(window.t('errPfx2') + e.message); }
};

// ── Видалення ─────────────────────────────────────────────
window._invoiceDelete = async function(id) {
  const _delConfirmed = typeof showConfirmModal === 'function'
    ? await showConfirmModal(window.t('finDeleteInvoice'), { danger: true })
    : confirm(window.t('finDeleteInvoice'));
  if (!_delConfirmed) return;
  try {
    await colRef('finance_invoices').doc(id).delete();
    _state.invoices = _state.invoices.filter(i => i.id !== id);
    renderSubTab('invoices');
  } catch(e) { if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error'); }
};

// ── PDF через jsPDF (клієнтський, без API) ─────────────────
window._invoicePdf = async function(id) {
  const inv = (_state.invoices || []).find(i => i.id === id);
  if (!inv) return;

  // Завантажуємо jsPDF якщо ще немає
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const currency = _state.currency || 'EUR';

  const pageW = 210;
  const margin = 18;
  let y = 22;

  // Шапка
  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageW, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TALKO Business Systems', margin, 8.5);

  // Заголовок
  y = 24;
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INVOICE / РАХУНОК', margin, y);

  // Номер і дата
  y += 9;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`No: ${inv.number || '—'}`, margin, y);
  doc.text(`${_tg('Дата:','Дата:')} ${inv.date || '—'}`, pageW - margin - 60, y);

  // Клієнт
  y += 12;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y - 4, pageW - margin * 2, 20, 3, 3, 'F');
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(window.t('pdfClient'), margin + 4, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(inv.clientName || '—', margin + 4, y + 8);
  if (inv.clientDetails) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(inv.clientDetails.substring(0, 80), margin + 4, y + 14);
  }

  // Таблиця позицій
  y += 28;
  doc.setFillColor(22, 163, 74);
  doc.rect(margin, y, pageW - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(_tg('Опис','Описание'), margin + 3, y + 5.5);
  doc.text(window.t('qtyShort'), pageW - margin - 55, y + 5.5);
  doc.text(window.t('priceWord'), pageW - margin - 38, y + 5.5);
  doc.text(window.t('crmColAmount'), pageW - margin - 16, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  (inv.items || []).forEach((it, idx) => {
    const lineTotal = (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0);
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 248);
      doc.rect(margin, y - 1, pageW - margin * 2, 7, 'F');
    }
    doc.setTextColor(26, 26, 26);
    doc.text(String(it.desc || '').substring(0, 50), margin + 3, y + 4.5);
    doc.text(String(it.qty || 0), pageW - margin - 50, y + 4.5, { align: 'right' });
    doc.text(String(it.price || 0), pageW - margin - 30, y + 4.5, { align: 'right' });
    doc.text(String(lineTotal.toFixed(2)), pageW - margin - 3, y + 4.5, { align: 'right' });
    y += 7;
  });

  // Підсумки
  const vatPct = inv.vatPct || 0;
  const { subtotal, vat, total } = _invoiceTotals(inv.items, vatPct);
  y += 4;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  const addRow = (label, val, bold) => {
    if (bold) { doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(22, 163, 74); }
    else { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80, 80, 80); }
    doc.text(label, pageW - margin - 50, y);
    doc.text(val, pageW - margin - 3, y, { align: 'right' });
    y += 6;
  };

  addRow(window.t('summaryLabel'), subtotal.toFixed(2) + ' ' + currency, false);
  if (vatPct > 0) addRow(`${window.t('vatLabel')} ${vatPct}%:`, vat.toFixed(2) + ' ' + currency, false);
  addRow(window.t('finTotal'), total.toFixed(2) + ' ' + currency, true);

  // Примітки
  if (inv.notes) {
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(window.t('pdfRequisites'), margin, y);
    y += 5;
    const lines = doc.splitTextToSize(inv.notes, pageW - margin * 2);
    doc.setTextColor(26, 26, 26);
    doc.text(lines, margin, y);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text('TALKO Business Systems | alextolko.com', pageW / 2, 290, { align: 'center' });

  doc.save(`${inv.number || 'invoice'}.pdf`);
};

// ── Функції (заглушка Етап 1) ────────────────────────────
// ── Фінанси по функціях — Етап 4 ────────────────────────
let _funcFilter = { month: '' };

// ── Регулярні витрати/доходи ───────────────────────────────
function renderRecurring(el) {
  const items = _state.recurring || [];
  const currency = _state.currency || 'UAH';

  el.innerHTML = `
    <div style="width:100%;">

      <!-- Заголовок -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem;">
        <div>
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:#1a1a1a;">${window.t('finTabRecurring')}</h3>
          <p style="margin:0.25rem 0 0;font-size:0.82rem;color:#6b7280;">${window.t('finRecurringHint')||'Автоматичне списання/нарахування в заданий день місяця'}</p>
        </div>
        ${isOwnerOrManager() ? `
          <button onclick="window._finAddRecurring()" style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:0.85rem;font-weight:600;">
            ${I.plus} ${window.t('finAddPayment')}
          </button>
        ` : ''}
      </div>

      <!-- Статистика -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1.5rem;">
        ${_recurringStats(items, currency)}
      </div>

      <!-- Наступні списання (цього місяця) -->
      ${_recurringUpcoming(items, currency)}

      <!-- Список -->
      ${items.length === 0 ? `
        <div style="text-align:center;padding:3rem 1rem;color:#9ca3af;">
          ${I.repeat}
          <p style="margin:0.75rem 0 0;font-size:0.9rem;">${window.t('finNoRecurring')}</p>
          <p style="margin:0.25rem 0 0;font-size:0.8rem;">${window.t('finRecurringEmpty')}</p>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${items.map(item => _recurringCard(item, currency)).join('')}
        </div>
      `}
    </div>
  `;
}

function _recurringStats(items, currency) {
  const active = items.filter(i => i.active !== false);
  const monthlyExpense = active.filter(i => i.type === 'expense').reduce((s, i) => s + (i.amount || 0), 0);
  const monthlyIncome  = active.filter(i => i.type === 'income').reduce((s, i) => s + (i.amount || 0), 0);

  const card = (label, value, color, icon) => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;">
      <div style="font-size:0.75rem;color:#9ca3af;margin-bottom:0.35rem;">${label}</div>
      <div style="font-size:1.25rem;font-weight:700;color:${color};">${fmt(value, currency)}</div>
      <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;">${window.t('finPerMonth')}</div>
    </div>
  `;
  return card(window.t('finRecurringExpenses'), monthlyExpense, '#ef4444', 'expense')
       + card(window.t('finRecurringIncomes'),  monthlyIncome,  '#22c55e', 'income')
       + card(window.t('finNetPerMonth'),         monthlyIncome - monthlyExpense, monthlyIncome >= monthlyExpense ? '#22c55e' : '#ef4444', 'wallet');
}

function _recurringUpcoming(items, currency) {
  const now = new Date();
  const today = now.getDate();
  const active = items.filter(i => i.active !== false && i.dayOfMonth);

  // Платежі до кінця місяця
  const upcoming = active
    .filter(i => i.dayOfMonth >= today)
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
    .slice(0, 5);

  if (!upcoming.length) return '';

  return `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;margin-bottom:1.25rem;">
      <div style="font-size:0.8rem;font-weight:700;color:#16a34a;margin-bottom:0.65rem;">
        ${I.repeat} ${window.t('upcomingPayments')}
      </div>
      <div style="display:flex;flex-direction:column;gap:0.4rem;">
        ${upcoming.map(i => `
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.82rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span style="background:#dcfce7;color:#16a34a;border-radius:6px;padding:2px 7px;font-weight:700;min-width:28px;text-align:center;">${i.dayOfMonth}</span>
              <span style="color:#374151;">${escHtml(i.name)}</span>
            </div>
            <span style="font-weight:600;color:${i.type === 'expense' ? '#ef4444' : '#22c55e'};">
              ${i.type === 'expense' ? '−' : '+'}${fmt(i.amount, currency)}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function _recurringCard(item, currency) {
  const active = item.active !== false;
  const freqLabel = { monthly: window.t('monthlyWord'), quarterly: window.t('quarterlyWord'), yearly: window.t('yearlyWord') }[item.frequency] || window.t('monthlyWord');
  const typeColor = item.type === 'expense' ? '#ef4444' : '#22c55e';
  const typeLabel = item.type === 'expense' ? window.t('finExpense2') : window.t('finIncome2');

  return `
    <div style="background:#fff;border:1px solid ${active ? '#e5e7eb' : '#f3f4f6'};border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem;opacity:${active ? '1' : '0.55'};">
      <!-- Тип -->
      <div style="width:36px;height:36px;border-radius:10px;background:${typeColor}15;color:${typeColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${item.type === 'expense' ? I.expense : I.income}
      </div>

      <!-- Основна інфо -->
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;color:#1a1a1a;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(item.name)}</div>
        <div style="font-size:0.75rem;color:#9ca3af;margin-top:2px;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <span style="background:#f3f4f6;border-radius:5px;padding:1px 6px;">${typeLabel}</span>
          <span>${escHtml(item.category || '—')}</span>
          <span>·</span>
          <span>${freqLabel}, ${item.dayOfMonth || 1}-го числа</span>
          ${item.counterparty ? `<span>· ${escHtml(item.counterparty)}</span>` : ''}
        </div>
      </div>

      <!-- Сума -->
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:1.05rem;font-weight:700;color:${typeColor};">
          ${item.type === 'expense' ? '−' : '+'}${fmt(item.amount, currency)}
        </div>
        <div style="font-size:0.72rem;color:#9ca3af;">${window.t('finPerMonth')||'/ міс'}</div>
      </div>

      <!-- Дії -->
      ${isOwnerOrManager() ? `
        <div style="display:flex;gap:0.4rem;flex-shrink:0;">
          <button onclick="window._finToggleRecurring('${item.id}')" title="${active ? window.t('finPause') : window.t('finActivate')}"
            style="width:30px;height:30px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;">
            ${active ? I.pause : I.play}
          </button>
          <button onclick="window._finEditRecurring('${item.id}')" title=${window.t('flowEdit')}
            style="width:30px;height:30px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;">
            ${I.edit}
          </button>
          <button onclick="window._finDeleteRecurring('${item.id}')" title=${window.t('flowDelete')}
            style="width:30px;height:30px;border:1px solid #fecaca;border-radius:8px;background:#fef2f2;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#ef4444;">
            ${I.trash}
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// Модальне вікно — додати/редагувати регулярний платіж
window._finAddRecurring = function(editId) {
  const existing = editId ? (_state.recurring || []).find(r => r.id === editId) : null;
  const cats = _state.categories;
  const allCats = [...(cats.expense || []), ...(cats.income || [])];
  const currency = _state.currency || 'UAH';

  const freqOptions = [
    { v: 'monthly',     l: window.t('monthlyWord')      },
    { v: 'quarterly',   l: window.t('quarterlyWord') },
    { v: 'yearly',      l: window.t('yearlyWord') },
  ];

  const days = Array.from({length:28}, (_,i) => i+1);

  showInputModal('', '', { skipInput: true }); // закрити якщо відкрито

  const overlay = document.createElement('div');
  overlay.id = 'recurringModal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:15000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:1rem;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f3f4f6;">
        <h3 style="margin:0;font-size:1rem;font-weight:700;">${existing ? window.t('flowEdit') : window.t('incStatusNew')} ${window.t('finRecurring')||'регулярний платіж'}</h3>
        <button onclick="document.getElementById('recurringModal')?.remove()" style="border:none;background:#f3f4f6;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.1rem;">×</button>
      </div>
      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">

        <!-- Назва -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finRecurringName')||'Назва платежу'} *</label>
          <input id="rec_name" value="${escHtml(existing?.name || '')}" placeholder=${window.t('expensesExPh')} 
            style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Тип -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finTypeLbl')||'Тип'}</label>
          <div style="display:flex;gap:0.5rem;">
            <button id="rec_type_expense" onclick="_recSetType('expense')"
              style="flex:1;padding:8px;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;border:2px solid ${!existing || existing.type==='expense' ? '#ef4444' : '#e5e7eb'};background:${!existing || existing.type==='expense' ? '#fef2f2' : '#fff'};color:${!existing || existing.type==='expense' ? '#ef4444' : '#6b7280'};">
              ${window.t('finExpense2')||'Витрата'}
            </button>
            <button id="rec_type_income" onclick="_recSetType('income')"
              style="flex:1;padding:8px;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;border:2px solid ${existing?.type==='income' ? '#22c55e' : '#e5e7eb'};background:${existing?.type==='income' ? '#f0fdf4' : '#fff'};color:${existing?.type==='income' ? '#22c55e' : '#6b7280'};">
              ${window.t('finIncome2')||'Дохід'}
            </button>
          </div>
          <input type="hidden" id="rec_type" value="${existing?.type || 'expense'}">
        </div>

        <!-- Сума + валюта -->
        <div style="display:grid;grid-template-columns:1fr auto;gap:0.5rem;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finAmountLbl')||'Сума'} *</label>
            <input id="rec_amount" type="number" min="0" value="${existing?.amount || ''}" placeholder="0"
              style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finCurrencyLbl')||'Валюта'}</label>
            <select id="rec_currency" style="border:1px solid #d1d5db;border-radius:8px;padding:8px 10px;font-size:0.9rem;height:38px;">
              ${['UAH','EUR','USD','PLN','CZK'].map(c => `<option ${(existing?.currency||currency)===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Категорія -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finCategoryLbl')}</label>
          <select id="rec_category" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
            <option value="">${window.t('finSelectCategory')||'— Оберіть категорію —'}</option>
            ${allCats.map(c => `<option ${existing?.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>

        <!-- Частота + день -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finFrequency')||'Частота'}</label>
            <select id="rec_freq" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
              ${freqOptions.map(f => `<option value="${f.v}" ${existing?.frequency===f.v?'selected':''}>${f.l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finDayOfMonth')||'День місяця'}</label>
            <select id="rec_day" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
              ${days.map(d => `<option ${existing?.dayOfMonth===d?'selected':''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Контрагент -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finCounterpartyLbl')}</label>
          <input id="rec_counterparty" value="${escHtml(existing?.counterparty || '')}" placeholder="${window.t('finRecCounterpart')||'Орендодавець, постачальник...'}"
            style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Коментар -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finCommentLbl')}</label>
          <input id="rec_comment" value="${escHtml(existing?.comment || '')}" placeholder="${window.t('finOptional')||'Необов\'язково'}"
            style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Рахунок -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${window.t('finAccountLbl')||'Рахунок'}</label>
          <select id="rec_account" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
            ${(_state.accounts||[]).map(a => `<option value="${a.id}" ${existing?.accountId===a.id?'selected':''}>${escHtml(a.name)}</option>`).join('')}
          </select>
        </div>

        <!-- Кнопки -->
        <div style="display:flex;gap:0.5rem;padding-top:0.5rem;">
          <button onclick="document.getElementById('recurringModal')?.remove()"
            style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;font-size:0.9rem;color:#6b7280;">
            ${window.t('cancel')||'Скасувати'}
          </button>
          <button onclick="window._finSaveRecurring('${editId || ''}')"
            style="flex:2;padding:10px;background:#22c55e;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:0.9rem;font-weight:700;">
            ${existing ? window.t('finSaveChanges') : window.t('finAddPayment')}
          </button>
        </div>
      </div>
    </div>
  `;

  // FIX: Очищення event listener при закритті (захист від memory leak)
  const handleOverlayClick = (e) => {
    if (e.target === overlay) {
      overlay.removeEventListener('click', handleOverlayClick);
      overlay.remove();
    }
  };

  document.body.appendChild(overlay);
  overlay.addEventListener('click', handleOverlayClick);
};

window._recSetType = function(type) {
  const recTypeEl = document.getElementById('rec_type');
  if (recTypeEl) recTypeEl.value = type;
  const eBtn = document.getElementById('rec_type_expense');
  const iBtn = document.getElementById('rec_type_income');
  if (type === 'expense') {
    eBtn.style.cssText += ';border-color:#ef4444;background:#fef2f2;color:#ef4444;';
    iBtn.style.cssText += ';border-color:#e5e7eb;background:#fff;color:#6b7280;';
  } else {
    iBtn.style.cssText += ';border-color:#22c55e;background:#f0fdf4;color:#22c55e;';
    eBtn.style.cssText += ';border-color:#e5e7eb;background:#fff;color:#6b7280;';
  }
};

window._finSaveRecurring = async function(editId) {
  const name   = document.getElementById('rec_name')?.value?.trim();
  const amount = parseFloat(document.getElementById('rec_amount')?.value);
  if (!name) { showToast(window.t('finEnterPayName'), 'error'); return; }
  if (!amount || amount <= 0) { showToast(window.t('finTransferAmount'), 'error'); return; }

  const data = {
    name,
    type:         document.getElementById('rec_type')?.value || 'expense',
    amount,
    currency:     document.getElementById('rec_currency')?.value || _state.currency,
    category:     document.getElementById('rec_category')?.value || '',
    frequency:    document.getElementById('rec_freq')?.value || 'monthly',
    dayOfMonth:   parseInt(document.getElementById('rec_day')?.value) || 1,
    counterparty: document.getElementById('rec_counterparty')?.value?.trim() || '',
    comment:      document.getElementById('rec_comment')?.value?.trim() || '',
    accountId:    document.getElementById('rec_account')?.value || '',
    active:       true,
    updatedAt:    firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const colRef = window.companyRef().collection('finance_recurring');
    if (editId) {
      await colRef.doc(editId).update(data);
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await colRef.add(data);
    }
    document.getElementById('recurringModal')?.remove();
    await _loadRecurring();
    renderSubTab('recurring');
    showToast(editId ? window.t('finPaymentUpdated') : window.t('finPaymentAdded'), 'success');
  } catch(e) {
    console.error('[Recurring save]', e);
    showToast(window.t('errPfx2') + e.message, 'error');
  }
};

window._finEditRecurring = function(id) {
  window._finAddRecurring(id);
};

window._finToggleRecurring = async function(id) {
  const item = (_state.recurring || []).find(r => r.id === id);
  if (!item) return;
  const newActive = item.active === false ? true : false;
  try {
    await window.companyRef()
      .collection('finance_recurring').doc(id)
      .update({ active: newActive, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    await _loadRecurring();
    renderSubTab('recurring');
    showToast(newActive ? window.t('finPaymentActivated') : window.t('finPaymentPaused'), 'success');
  } catch(e) {
    showToast(window.t('errPfx2') + e.message, 'error');
  }
};

window._finDeleteRecurring = async function(id) {
  if (!await showConfirmModal(window.t('finDeleteRecurring'), { danger: true })) return;
  try {
    await window.companyRef()
      .collection('finance_recurring').doc(id).delete();
    _state.recurring = (_state.recurring || []).filter(r => r.id !== id);
    renderSubTab('recurring');
    showToast(window.t('finDeleted'), 'success');
  } catch(e) {
    showToast(window.t('errPfx2') + e.message, 'error');
  }
};

// Автосписання — запускається при ініціалізації та на 1-е число
async function _processRecurringAutopost() {
  if (!isOwnerOrManager()) return;
  const items = (_state.recurring || []).filter(i => i.active !== false);
  if (!items.length) return;

  const now = new Date();
  const today = now.getDate();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const colRef = window.companyRef().collection('finance_transactions');
  const recurRef = window.companyRef().collection('finance_recurring');

  for (const item of items) {
    if (item.dayOfMonth !== today) continue;
    // Перевіряємо чи вже списували цього місяця
    const lastPosted = item.lastPostedMonth;
    if (lastPosted === monthKey) continue;

    try {
      // Створюємо транзакцію
      await colRef.add({
        type:         item.type,
        amount:       item.amount,
        currency:     item.currency || _state.currency,
        category:     item.category || '',
        accountId:    item.accountId || '',
        accountName:  (_state.accounts||[]).find(a=>a.id===item.accountId)?.name || '',
        counterparty: item.counterparty || '',
        comment:      (item.comment || '') + ` [авто: ${item.name}]`,
        date:         firebase.firestore.Timestamp.fromDate(now),
        recurringId:  item.id,
        isRecurring:  true,
        createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
      });
      // Відмічаємо що списали цього місяця
      await recurRef.doc(item.id).update({ lastPostedMonth: monthKey });
      console.log(`[Recurring] Autoposted: ${item.name} ${item.amount}`);
    } catch(e) {
      console.error('[Recurring autopost]', e);
    }
  }

  // FIX BM: _loadTransactions не існує — оновлюємо поточну вкладку
  if (_state.activeSubTab === 'dashboard' || _state.activeSubTab === 'income' || _state.activeSubTab === 'expense') {
    renderSubTab(_state.activeSubTab);
  }
}

async function _loadRecurring() {
  if (!_state.companyId) return;
  try {
    const snap = await window.companyRef()
      .collection('finance_recurring').orderBy('createdAt','asc').get();
    _state.recurring = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    _state.recurring = [];
  }
}


// ── Функції по бізнес-функціях ─────────────────────────────
function renderFinanceFunctions(el) { // FIX BN: перейменовано щоб не конфліктувати з renderFunctions з 25-functions.js
  const now = new Date();
  const monthOpts = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const val = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    const lbl = d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA', {month:'long',year:'numeric'});
    return `<option value="${val}" ${_funcFilter.month===val?'selected':''}>${lbl}</option>`;
  }).join('');

  el.innerHTML = `
    <div style="width:100%;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${window.t('finByFunction')}</div>
        <select id="funcFilterMonth" onchange="window._funcMonthChange(this.value)"
          style="padding:0.35rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">${window.t('finAllMonths')}</option>
          ${monthOpts}
        </select>
      </div>

      <!-- Зведена таблиця -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:1rem;">
        <div style="display:grid;grid-template-columns:1fr 130px 130px 100px 120px;
          background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;
          padding:0.65rem 1rem;text-transform:uppercase;letter-spacing:.04em;">
          <div>${window.t('finFunctionLbl')}</div>
          <div style="text-align:right;">${window.t('finTransactionIncome')}</div>
          <div style="text-align:right;">${window.t('finExpense')}</div>
          <div style="text-align:right;">${window.t('finMargin')}</div>
          <div style="text-align:right;">${window.t('finPctOfTotal')}</div>
        </div>
        <div id="funcTableBody">
          <div style="padding:2rem;text-align:center;color:#9ca3af;font-size:0.85rem;">${window.t('finLoading')}</div>
        </div>
      </div>

      <!-- Графік по функціях -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
        <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:1rem;">${window.t('finExpByFunction')}</div>
        <div id="funcChart">
          <div style="color:#9ca3af;font-size:0.8rem;">${window.t('finLoading')}</div>
        </div>
      </div>
    </div>
  `;

  loadFunctionsData(_funcFilter.month);
}

window._funcMonthChange = function(val) {
  _funcFilter.month = val;
  loadFunctionsData(val);
};

async function loadFunctionsData(monthVal) {
  try {
    // 1. Завантажуємо функції з Firestore
    const db = getDb();
    const funcsSnap = await window.companyRef()
      .collection('functions').orderBy('name').get();
    const funcs = funcsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 2. Завантажуємо транзакції за обраний період
    let txQuery = colRef('finance_transactions');
    if (monthVal) {
      const [y, m] = monthVal.split('-').map(Number);
      const from = firebase.firestore.Timestamp.fromDate(new Date(y, m-1, 1));
      const to   = firebase.firestore.Timestamp.fromDate(new Date(y, m, 0, 23, 59, 59));
      txQuery = txQuery.where('date','>=',from).where('date','<=',to);
    }
    const txSnap = await txQuery.get();
    const txs = txSnap.docs.map(d => d.data());

    // 3. Групуємо по functionId
    const byFunc = {};
    let totalIncome = 0, totalExpense = 0;

    txs.forEach(tx => {
      const fid = tx.functionId || '__none__';
      if (!byFunc[fid]) byFunc[fid] = { income: 0, expense: 0 };
      if (tx.type === 'income')  { byFunc[fid].income  += tx.amount||0; totalIncome  += tx.amount||0; }
      if (tx.type === 'expense') { byFunc[fid].expense += txAmt(tx); totalExpense += txAmt(tx); }
    });

    // 4. Будуємо рядки таблиці
    const tableEl  = document.getElementById('funcTableBody');
    const chartEl  = document.getElementById('funcChart');
    if (!tableEl) return;

    // Функції що мають транзакції + "Без функції"
    const rows = [];
    funcs.forEach(f => {
      const d = byFunc[f.id] || { income:0, expense:0 };
      if (d.income > 0 || d.expense > 0) {
        rows.push({ name: f.name, ...d });
      }
    });
    if (byFunc['__none__'] && (byFunc['__none__'].income > 0 || byFunc['__none__'].expense > 0)) {
      rows.push({ name: window.t('finNoFunction'), ...byFunc['__none__'] });
    }

    if (rows.length === 0) {
      tableEl.innerHTML = `
        <div style="padding:2rem;text-align:center;color:#9ca3af;font-size:0.85rem;">
          ${window.t('noFunctionTx')}<br>
          <span style="font-size:0.78rem;">${window.t('finFunctionHint')}</span>
        </div>`;
      if (chartEl) chartEl.innerHTML = '';
      return;
    }

    // Сортуємо за витратами
    rows.sort((a,b) => b.expense - a.expense);

    tableEl.innerHTML = rows.map((r, i) => {
      const profit = r.income - r.expense;
      const margin = r.income > 0 ? Math.round(profit/r.income*100) : (r.expense > 0 ? -100 : 0);
      const pctOfTotal = totalExpense > 0 ? Math.round(r.expense/totalExpense*100) : 0;
      const mColor = margin >= 15 ? '#22c55e' : margin >= 0 ? '#f59e0b' : '#ef4444';
      const bg = i%2===0 ? '#fff' : '#fafafa';
      return `
        <div style="display:grid;grid-template-columns:1fr 130px 130px 100px 120px;
          padding:0.65rem 1rem;background:${bg};border-bottom:1px solid #f3f4f6;align-items:center;">
          <div style="font-size:0.85rem;font-weight:500;color:#1a1a1a;">${escHtml(r.name)}</div>
          <div style="text-align:right;font-size:0.85rem;color:#22c55e;font-weight:600;">${fmt(r.income)}</div>
          <div style="text-align:right;font-size:0.85rem;color:#ef4444;font-weight:600;">${fmt(r.expense)}</div>
          <div style="text-align:right;font-size:0.85rem;font-weight:700;color:${mColor};">${margin}%</div>
          <div style="text-align:right;">
            <div style="display:flex;align-items:center;gap:0.4rem;justify-content:flex-end;">
              <div style="flex:1;max-width:60px;height:4px;background:#f3f4f6;border-radius:2px;">
                <div style="height:4px;background:#ef4444;border-radius:2px;width:${pctOfTotal}%;"></div>
              </div>
              <span style="font-size:0.78rem;color:#6b7280;">${pctOfTotal}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('') + `
      <!-- Підсумок -->
      <div style="display:grid;grid-template-columns:1fr 130px 130px 100px 120px;
        padding:0.65rem 1rem;background:#f0fdf4;border-top:2px solid #22c55e;align-items:center;">
        <div style="font-size:0.82rem;font-weight:700;color:#16a34a;">ВСЬОГО</div>
        <div style="text-align:right;font-size:0.85rem;font-weight:700;color:#22c55e;">${fmt(totalIncome)}</div>
        <div style="text-align:right;font-size:0.85rem;font-weight:700;color:#ef4444;">${fmt(totalExpense)}</div>
        <div style="text-align:right;font-size:0.85rem;font-weight:700;color:${totalIncome>0?(totalIncome-totalExpense)/totalIncome>=0.15?'#22c55e':'#f59e0b':'#6b7280'};">
          ${totalIncome>0?Math.round((totalIncome-totalExpense)/totalIncome*100)+'%':'—'}
        </div>
        <div></div>
      </div>
    `;

    // 5. Горизонтальний bar chart витрат по функціях
    if (chartEl && rows.length > 0) {
      const maxExp = Math.max(...rows.map(r => r.expense), 1);
      chartEl.innerHTML = rows.map(r => {
        const pct = Math.round(r.expense / maxExp * 100);
        return `
          <div style="margin-bottom:0.65rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem;">
              <div style="font-size:0.78rem;color:#374151;font-weight:500;">${escHtml(r.name)}</div>
              <div style="font-size:0.78rem;font-weight:600;color:#ef4444;">${fmt(r.expense)}</div>
            </div>
            <div style="height:8px;background:#f3f4f6;border-radius:4px;">
              <div style="height:8px;background:linear-gradient(90deg,#ef4444,#f87171);
                border-radius:4px;width:${pct}%;transition:width 0.3s;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

  } catch(e) {
    console.error('[Finance] loadFunctionsData:', e);
    const tableEl = document.getElementById('funcTableBody');
    if (tableEl) tableEl.innerHTML = `
      <div style="padding:1.5rem;text-align:center;color:#ef4444;font-size:0.82rem;">
        Помилка: ${escHtml(e.message)}
      </div>`;
  }
}

// ── Планування (заглушка Етап 1) ─────────────────────────
// ── Планування — Етап 5 ──────────────────────────────────
let _planMonth = (() => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
// ── Перевірка бюджету при 80% і 100% ─────────────────────
async function _checkBudgetAlert(catId, dateVal) {
  if (!catId || !dateVal) return;
  try {
    // Визначаємо місяць транзакції
    const d = new Date(dateVal);
    const monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');

    // Завантажуємо бюджет місяця
    const budgetSnap = await colRef('finance_budgets').doc(monthKey).get();
    if (!budgetSnap.exists) return;
    const budgetData = budgetSnap.data();
    const budget = budgetData['cat_' + catId] || 0;
    if (budget <= 0) return;

    // Рахуємо фактичні витрати по категорії за місяць
    const from = firebase.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), 1));
    const to   = firebase.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59));
    const snap = await colRef('finance_transactions')
      .where('type', '==', 'expense')
      .where('categoryId', '==', catId)
      .where('date', '>=', from)
      .where('date', '<=', to)
      .get();

    const fact = snap.docs.reduce((s, doc) => s + txAmt(doc.data()), 0);
    const pct  = budget > 0 ? Math.round(fact / budget * 100) : 0;

    // Знаходимо назву категорії
    const cat = (_state.categories.expense || []).find(c => c.id === catId);
    const catName = cat?.name || catId;
    const currency = _state.currency || 'UAH';

    // Ключ щоб не показувати одне сповіщення двічі в одній сесії
    const alertKey = `budgetAlert_${catId}_${monthKey}`;
    const lastAlerted = parseInt(sessionStorage.getItem(alertKey) || '0');

    if (pct >= 100 && lastAlerted < 100) {
      sessionStorage.setItem(alertKey, '100');
      if (typeof showToast === 'function') {
        showToast(
          _tg(`🚨 Бюджет «${catName}» вичерпано! (${fmt(fact, currency)} / ${fmt(budget, currency)})`,`🚨 Бюджет «${catName}» исчерпан! (${fmt(fact, currency)} / ${fmt(budget, currency)})`),
          'error',
          6000
        );
      }
      // Також показуємо більш помітне сповіщення
      _showBudgetWarningBanner(catName, fact, budget, currency, 100);
    } else if (pct >= 80 && lastAlerted < 80) {
      sessionStorage.setItem(alertKey, '80');
      if (typeof showToast === 'function') {
        showToast(
          _tg(`⚠️ Бюджет «${catName}» використано на ${pct}% (${fmt(fact, currency)} / ${fmt(budget, currency)})`,`⚠️ Бюджет «${catName}» использован на ${pct}% (${fmt(fact, currency)} / ${fmt(budget, currency)})`),
          'warning',
          5000
        );
      }
    }
  } catch(e) {
    console.warn('[Finance] _checkBudgetAlert:', e.message);
  }
}

// ── Банер попередження про бюджет ─────────────────────────
function _showBudgetWarningBanner(catName, fact, budget, currency, pct) {
  const old = document.getElementById('finBudgetWarningBanner');
  if (old) old.remove();

  const banner = document.createElement('div');
  banner.id = 'finBudgetWarningBanner';
  banner.style.cssText = [
    'position:fixed;top:70px;right:20px;z-index:99998;',
    'background:#fef2f2;border:2px solid #fecaca;border-radius:12px;',
    'padding:12px 16px;max-width:320px;box-shadow:0 8px 24px rgba(239,68,68,0.2);',
    'animation:slideIn 0.3s ease;',
  ].join('');

  banner.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:10px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.85rem;font-weight:700;color:#dc2626;margin-bottom:4px;">
          ${window.t('budgetExhausted')}
        </div>
        <div style="font-size:0.78rem;color:#374151;margin-bottom:8px;">
          ${window.t('categoryLabel')} <b>${catName}</b>:<br>
          ${window.t('spentOf')} <b style="color:#dc2626;">${fmt(fact, currency)}</b> ${window.t('outOf')} <b>${fmt(budget, currency)}</b>
        </div>
        <div style="height:6px;background:#fee2e2;border-radius:3px;margin-bottom:8px;">
          <div style="height:6px;background:#dc2626;border-radius:3px;width:100%;"></div>
        </div>
        <div style="display:flex;gap:6px;">
          <button onclick="window._planMode&&window._planMode('budget');window._financeTab&&window._financeTab('planning');document.getElementById('finBudgetWarningBanner')?.remove();"
            style="flex:1;padding:5px 8px;background:#dc2626;color:#fff;border:none;border-radius:6px;font-size:0.72rem;font-weight:600;cursor:pointer;">
            ${_tg('Переглянути бюджет','Просмотреть бюджет')}
          </button>
          <button onclick="document.getElementById('finBudgetWarningBanner')?.remove();"
            style="padding:5px 10px;background:#fff;border:1px solid #fecaca;border-radius:6px;font-size:0.72rem;cursor:pointer;color:#6b7280;">
            ×
          </button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(banner);
  // Автоприбирання через 10 секунд
  setTimeout(() => banner.remove(), 10000);
}


})();

function renderPlanning(el) {
  const now = new Date();
  const monthOpts = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-i+1, 1);
    const val = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    const lbl = d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA', {month:'long',year:'numeric'});
    return `<option value="${val}" ${_planMonth===val?'selected':''}>${lbl}</option>`;
  }).join('');

  el.innerHTML = `
    <div style="width:100%;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${window.t('finBudgetPlanning')}</div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <select id="planMonthSel" onchange="window._planMonthChange(this.value)"
            style="padding:0.35rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
            ${monthOpts}
          </select>
          <button onclick="window._savePlanBudget()"
            style="padding:0.35rem 0.9rem;background:#22c55e;color:#fff;border:none;border-radius:8px;font-size:0.8rem;font-weight:600;cursor:pointer;">
            ${window.t('finSave')}
          </button>
        </div>
      </div>

      <!-- Сигнали відхилень -->
      <div id="planAlerts" style="margin-bottom:1rem;"></div>

      <!-- Перемикач режиму -->
      <div style="display:flex;gap:6px;margin-bottom:1rem;">
        <button onclick="window._planMode('budget')" id="planModeBtn_budget"
          style="padding:6px 14px;border-radius:8px;border:2px solid #22c55e;background:#f0fdf4;color:#16a34a;font-size:0.8rem;font-weight:600;cursor:pointer;">
          ${window.t('finBudgetByCategory')}
        </button>
        <button onclick="window._planMode('functions')" id="planModeBtn_functions"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          ${window.t('finBudgetByFunction')}
        </button>
        <button onclick="window._planMode('cashflow')" id="planModeBtn_cashflow"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          ${window.t('finCashflow3060')}
        </button>
        <button onclick="window._planMode('weekly')" id="planModeBtn_weekly"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${_tg('Тижневий план 6M','Недельный план 6M')}
        </button>
        <button onclick="window._planMode('fp1')" id="planModeBtn_fp1"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          ${_tg('ФП №1 Тижневий','ФП №1 Еженедельный')}
        </button>
      </div>

      <!-- 2 колонки: бюджет + cashflow -->
      <div id="planModeView_budget" style="display:grid;grid-template-columns:1fr 320px;gap:1rem;align-items:start;">

        <!-- Бюджет по категоріях -->
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <div style="background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;
            padding:0.65rem 1rem;text-transform:uppercase;letter-spacing:.04em;
            display:grid;grid-template-columns:1fr 110px 110px 90px;">
            <div>${window.t('finCategoryLbl')}</div>
            <div style="text-align:right;">${window.t('finBudgetLbl')}</div>
            <div style="text-align:right;">${window.t('finActual')}</div>
            <div style="text-align:right;">${window.t('finVariance')}</div>
          </div>
          <div id="planBudgetBody">
            <div style="padding:2rem;text-align:center;color:#9ca3af;font-size:0.85rem;">${window.t('finLoading')}</div>
          </div>
        </div>

        <!-- Cashflow + ціль -->
        <div style="display:flex;flex-direction:column;gap:1rem;">

          <!-- Cashflow прогноз -->
          <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
            <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finCashflowMonth')}</div>
            <div id="planCashflow">
              <div style="color:#9ca3af;font-size:0.8rem;">${window.t('finLoading')}</div>
            </div>
          </div>

          <!-- Фінансова ціль -->
          <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
            <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">${window.t('finMonthlyGoal')}</div>
            <div style="margin-bottom:0.5rem;">
              <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:0.2rem;">${window.t('finTargetProfit')}</label>
              <input id="planGoalInput" type="number" min="0" placeholder="напр. 5000"
                style="width:100%;padding:0.4rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
            </div>
            <div id="planGoalProgress" style="margin-top:0.5rem;"></div>
          </div>

        </div>
      </div><!-- /planModeView_budget -->

      <!-- Бюджет по функціях -->
      <div id="planModeView_functions" style="display:none;">
        <div id="planFunctionsBody">
          <div style="text-align:center;color:#9ca3af;padding:2rem;">${window.t('finLoading')}</div>
        </div>
      </div>

      <!-- Cashflow 30/60/90 -->
      <div id="planModeView_cashflow" style="display:none;">
        <div id="planCashflowForecast">
          <div style="text-align:center;color:#9ca3af;padding:2rem;">${window.t('finLoading')}</div>
        </div>
      </div>

      <!-- Тижневий план 6M -->
      <div id="planModeView_weekly" style="display:none;">
        <div id="weeklyPlanRoot">
          <div style="text-align:center;color:#9ca3af;padding:2rem;">${_tg('Завантаження...','Загрузка...')}</div>
        </div>
      </div>
      <!-- ФП №1 Тижневий дашборд -->
      <div id="planModeView_fp1" style="display:none;">
        <div id="fp1WeeklyRoot">
          <div style="text-align:center;color:#9ca3af;padding:2rem;">${_tg('Завантаження...','Загрузка...')}</div>
        </div>
      </div>

    </div>
  `;

  loadPlanningData(_planMonth);
}

window._planMonthChange = function(val) {
  _planMonth = val;
  loadPlanningData(val);
};

// Перемикач режиму планування
let _planCurrentMode = 'budget';
window._planMode = function(mode) {
  _planCurrentMode = mode;
  ['budget','functions','cashflow','weekly','fp1'].forEach(m => {
    const view = document.getElementById('planModeView_' + m);
    const btn  = document.getElementById('planModeBtn_' + m);
    if (view) view.style.display = m === mode ? (m === 'budget' ? 'grid' : 'block') : 'none';
    if (btn) {
      const active = m === mode;
      btn.style.borderColor  = active ? '#22c55e' : '#e5e7eb';
      btn.style.background   = active ? '#f0fdf4' : '#fff';
      btn.style.color        = active ? '#16a34a' : '#6b7280';
    }
  });
  // Завантажуємо дані для вибраного режиму
  if (mode === 'functions') _renderFunctionsBudget(_planMonth);
  if (mode === 'cashflow')  _renderCashflowForecast();
  if (mode === 'weekly' && typeof window.renderWeeklyPlan === 'function') window.renderWeeklyPlan('weeklyPlanRoot');
  if (mode === 'fp1') _renderFP1Weekly();
};

window._savePlanBudget = async function() {
  if (!isOwnerOrManager()) return;
  try {
    const inputs = document.querySelectorAll('[data-plan-cat]');
    const batch = getDb().batch();
    const docRef = colRef('finance_budgets').doc(_planMonth);
    const budgetData = { month: _planMonth, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    inputs.forEach(inp => {
      const catId = inp.dataset.planCat;
      const val = parseFloat(inp.value) || 0;
      budgetData['cat_' + catId] = val;
    });
    // Зберігаємо ціль
    const goalInp = document.getElementById('planGoalInput');
    if (goalInp) budgetData['goal'] = parseFloat(goalInp.value) || 0;
    await docRef.set(budgetData, { merge: true });
    // Оновлюємо прогрес цілі
    loadPlanningData(_planMonth);
    // Короткий feedback
    const btn = document.querySelector('[onclick="window._savePlanBudget()"]');
    if (btn) { btn.textContent = window.t('finSaved'); setTimeout(()=>{ btn.textContent = window.t('finSave'); }, 1500); }
  } catch(e) {
    if (typeof showToast === 'function') showToast(_tg('Помилка збереження: ','Ошибка сохранения: ') + e.message, 'error');
  }
};

async function loadPlanningData(monthVal) {
  try {
    // Факт — транзакції за місяць
    const [y, m] = monthVal.split('-').map(Number);
    const from = firebase.firestore.Timestamp.fromDate(new Date(y, m-1, 1));
    const to   = firebase.firestore.Timestamp.fromDate(new Date(y, m, 0, 23, 59, 59));

    const [txSnap, budgetSnap] = await Promise.all([
      colRef('finance_transactions').where('date','>=',from).where('date','<=',to).get(),
      colRef('finance_budgets').doc(monthVal).get()
    ]);

    const budgetData = budgetSnap.exists ? budgetSnap.data() : {};
    const txs = txSnap.docs.map(d => d.data());

    // Факт по категоріях витрат
    const factByCat = {};
    let totalIncome = 0, totalExpense = 0;
    txs.forEach(tx => {
      if (tx.type === 'expense') {
        factByCat[tx.categoryId] = (factByCat[tx.categoryId] || 0) + txAmt(tx);
        totalExpense += txAmt(tx);
      }
      if (tx.type === 'income') totalIncome += tx.amount||0;
    });

    // Рендер бюджетної таблиці
    const bodyEl = document.getElementById('planBudgetBody');
    if (!bodyEl) return;

    const expCats = (_state.categories.expense || []);
    // Сигнали відхилень
    _renderPlanAlerts(expCats, factByCat, budgetData);

    if (expCats.length === 0) {
      bodyEl.innerHTML = '<div style="padding:1.5rem;text-align:center;color:#9ca3af;font-size:0.82rem;">'+window.t('finNoExpCats2')+'</div>';
    } else {
      let totalBudget = 0;
      bodyEl.innerHTML = expCats.map((cat, i) => {
        const budgetVal = budgetData['cat_' + cat.id] || 0;
        const factVal   = factByCat[cat.id] || 0;
        const diff      = budgetVal - factVal;
        const diffColor = diff >= 0 ? '#22c55e' : '#ef4444';
        const diffSign  = diff >= 0 ? '+' : '';
        totalBudget += budgetVal;
        const bg = i%2===0 ? '#fff' : '#fafafa';
        return `
          <div style="display:grid;grid-template-columns:1fr 110px 110px 90px;
            padding:0.55rem 1rem;background:${bg};border-bottom:1px solid #f3f4f6;align-items:center;">
            <div style="font-size:0.82rem;color:#374151;">${escHtml(cat.name)}</div>
            <div style="text-align:right;">
              <input data-plan-cat="${cat.id}" type="number" min="0" value="${budgetVal||''}"
                placeholder="0"
                style="width:90px;padding:0.25rem 0.4rem;border:1px solid #e5e7eb;border-radius:6px;
                  font-size:0.82rem;text-align:right;box-sizing:border-box;">
            </div>
            <div style="text-align:right;font-size:0.82rem;color:#374151;font-weight:500;">${fmt(factVal)}</div>
            <div style="text-align:right;font-size:0.82rem;font-weight:600;color:${budgetVal>0?diffColor:'#9ca3af'};">
              ${budgetVal > 0 ? diffSign + fmt(Math.abs(diff)) : '—'}
            </div>
          </div>
        `;
      }).join('') + `
        <div style="display:grid;grid-template-columns:1fr 110px 110px 90px;
          padding:0.65rem 1rem;background:#fafafa;border-top:2px solid #e5e7eb;align-items:center;">
          <div style="font-size:0.78rem;font-weight:700;color:#6b7280;">${window.t('finTotalExpenses')}</div>
          <div style="text-align:right;font-size:0.82rem;font-weight:700;color:#374151;">${fmt(totalBudget)}</div>
          <div style="text-align:right;font-size:0.82rem;font-weight:700;color:#ef4444;">${fmt(totalExpense)}</div>
          <div style="text-align:right;font-size:0.82rem;font-weight:700;color:${totalBudget>=totalExpense?'#22c55e':'#ef4444'};">
            ${totalBudget>0?(totalBudget>=totalExpense?'+':'')+fmt(Math.abs(totalBudget-totalExpense)):'—'}
          </div>
        </div>
      `;
    }

    // Cashflow
    const cashEl = document.getElementById('planCashflow');
    if (cashEl) {
      const profit = totalIncome - totalExpense;
      const goalVal = budgetData['goal'] || 0;
      const goalInp = document.getElementById('planGoalInput');
      if (goalInp && goalVal) goalInp.value = goalVal;

      cashEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span style="color:#6b7280;">${window.t('actualIncome')}</span>
            <span style="font-weight:600;color:#22c55e;">${fmt(totalIncome)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span style="color:#6b7280;">${window.t('finExpFact')}</span>
            <span style="font-weight:600;color:#ef4444;">${fmt(totalExpense)}</span>
          </div>
          <div style="border-top:1px solid #f3f4f6;padding-top:0.5rem;display:flex;justify-content:space-between;font-size:0.85rem;">
            <span style="color:#1a1a1a;font-weight:600;">${window.t('finProfit')}</span>
            <span style="font-weight:700;color:${profit>=0?'#22c55e':'#ef4444'};">${profit>=0?'+':''}${fmt(profit)}</span>
          </div>
          ${goalVal > 0 ? `
          <div style="margin-top:0.5rem;">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#6b7280;margin-bottom:0.3rem;">
              <span>${window.t('finGoalExec')}</span>
              <span>${Math.min(Math.round(profit/goalVal*100),100)}%</span>
            </div>
            <div style="height:6px;background:#f3f4f6;border-radius:3px;">
              <div style="height:6px;background:${profit>=goalVal?'#22c55e':'#f59e0b'};border-radius:3px;
                width:${Math.min(Math.max(Math.round(profit/goalVal*100),0),100)}%;transition:width 0.3s;"></div>
            </div>
          </div>` : ''}
        </div>
      `;
    }

    // Прогрес цілі окремо
    const goalEl = document.getElementById('planGoalProgress');
    if (goalEl && budgetData['goal']) {
      const profit = totalIncome - totalExpense;
      const pct = Math.min(Math.max(Math.round(profit / budgetData['goal'] * 100), 0), 100);
      goalEl.innerHTML = `
        <div style="font-size:0.78rem;color:#6b7280;margin-bottom:0.3rem;">
          ${_tg('Факт:','Факт:')} <strong>${fmt(profit)}</strong> ${_tg('з','из')} <strong>${fmt(budgetData['goal'])}</strong>
        </div>
        <div style="height:8px;background:#f3f4f6;border-radius:4px;">
          <div style="height:8px;background:${pct>=100?'#22c55e':pct>=50?'#f59e0b':'#ef4444'};
            border-radius:4px;width:${pct}%;transition:width 0.3s;"></div>
        </div>
        <div style="font-size:0.75rem;color:${pct>=100?'#22c55e':pct>=50?'#f59e0b':'#ef4444'};
          margin-top:0.2rem;font-weight:600;">${pct}% ${window.t('finDone')}</div>
      `;
    }

  } catch(e) {
    console.error('[Finance] loadPlanningData:', e);
    const bodyEl = document.getElementById('planBudgetBody');
    if (bodyEl) bodyEl.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#ef4444;font-size:0.82rem;">${_tg('Помилка:','Ошибка:')} ${escHtml(e.message)}</div>`;
  }
}

// ── Сигнали відхилень бюджету (80% і 100%) ───────────────
// Зберігаємо які toast вже показані в цій сесії
const _budgetToastShown = new Set();

function _renderPlanAlerts(expCats, factByCat, budgetData) {
  const el = document.getElementById('planAlerts');
  if (!el) return;

  const alerts = [];
  const currency = _state.currency || 'EUR';

  expCats.forEach(cat => {
    const budget = budgetData['cat_' + cat.id] || 0;
    if (budget <= 0) return;
    const fact   = factByCat[cat.id] || 0;
    const usedPct = Math.round(fact / budget * 100); // скільки % бюджету витрачено

    // Визначаємо рівень
    let level = null;
    if (usedPct >= 100)     level = 'red';    // 100%+ — перевищення
    else if (usedPct >= 80) level = 'yellow'; // 80-99% — попередження

    if (!level) return;

    const remaining = budget - fact;
    alerts.push({ cat, budget, fact, usedPct, remaining, level });

    // Toast-сповіщення (один раз за сесію для кожної категорії на кожному рівні)
    const toastKey = `${cat.id}_${level}`;
    if (!_budgetToastShown.has(toastKey) && typeof showToast === 'function') {
      _budgetToastShown.add(toastKey);
      const warnSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      if (level === 'red') {
        showToast(`${warnSvg} ${_tg('Бюджет','Бюджет')} «${cat.name}» ${_tg('перевищено! Витрачено','превышен! Потрачено')} ${fmt(fact, currency)} ${_tg('з','из')} ${fmt(budget, currency)}`, 'error');
      } else {
        showToast(`${warnSvg} ${_tg('Бюджет','Бюджет')} «${cat.name}» ${_tg('використано на','использован на')} ${usedPct}% — ${_tg('залишилось','осталось')} ${fmt(remaining, currency)}`, 'warning');
      }
    }
  });

  if (alerts.length === 0) { el.innerHTML = ''; return; }

  const dotSvg = (color) =>
    `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${color}"/></svg>`;

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${alerts.map(a => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:10px;
          background:${a.level==='red'?'#fef2f2':'#fffbeb'};
          border:1px solid ${a.level==='red'?'#fecaca':'#fde68a'};">
          <span style="flex-shrink:0;">${dotSvg(a.level==='red'?'#ef4444':'#f59e0b')}</span>
          <div style="flex:1;">
            <div style="font-size:0.82rem;font-weight:600;color:${a.level==='red'?'#dc2626':'#d97706'};">
              ${escHtml(a.cat.name)}
            </div>
            <div style="font-size:0.72rem;color:${a.level==='red'?'#dc2626':'#d97706'};margin-top:1px;">
              ${a.level==='red'
                ? `${_tg('Перевищено: витрачено','Превышено: потрачено')} ${fmt(a.fact,currency)} ${_tg('з','из')} ${fmt(a.budget,currency)} (${a.usedPct}%)`
                : _tg(`Використано ${a.usedPct}% бюджету — залишилось ${fmt(a.remaining,currency)}`,`Использовано ${a.usedPct}% бюджета — осталось ${fmt(a.remaining,currency)}`)
              }
            </div>
          </div>
          <!-- Прогрес-бар -->
          <div style="width:80px;height:6px;background:#f3f4f6;border-radius:3px;flex-shrink:0;">
            <div style="height:6px;border-radius:3px;background:${a.level==='red'?'#ef4444':'#f59e0b'};
              width:${Math.min(a.usedPct,100)}%;transition:width .3s;"></div>
          </div>
          <div style="font-size:0.72rem;font-weight:700;color:${a.level==='red'?'#dc2626':'#d97706'};
            width:32px;text-align:right;flex-shrink:0;">${a.usedPct}%</div>
        </div>`).join('')}
    </div>`;
}

// ── Бюджет по функціях ────────────────────────────────────
// ── ФП №1 Тижневий дашборд ────────────────────────────────
const _FP1_BENCHMARKS = {
  management: { label: () => _tg('Управління','Управление'), pctMin: 8,  pctMax: 10, color: '#3b82f6', icon: '🔵' },
  hr:         { label: () => _tg('HR','HR'),                  pctMin: 4,  pctMax: 6,  color: '#8b5cf6', icon: '🟣' },
  commercial: { label: () => _tg('Комерція','Коммерция'),     pctMin: 15, pctMax: 18, color: '#f97316', icon: '🟠' },
  finance:    { label: () => _tg('Фінанси','Финансы'),        pctMin: 4,  pctMax: 6,  color: '#22c55e', icon: '🟢' },
  medical:    { label: () => _tg('Медицина','Медицина'),      pctMin: 38, pctMax: 42, color: '#ef4444', icon: '🔴' },
  admin:      { label: () => _tg('АХВ','АХЧ'),               pctMin: 8,  pctMax: 10, color: '#6b7280', icon: '⚫' },
  reserve:    { label: () => _tg('Резерв','Резерв'),         pctMin: 12, pctMax: 15, color: '#f59e0b', icon: '🟡' },
  dividends:  { label: () => _tg('Дивіденди','Дивиденды'),   pctMin: 5,  pctMax: 8,  color: '#a855f7', icon: '🟤' },
};

async function _renderFP1Weekly() {
  const el = document.getElementById('fp1WeeklyRoot');
  if (!el) return;
  el.innerHTML = `<div style="text-align:center;color:#9ca3af;padding:2rem;">${_tg('Завантаження...','Загрузка...')}</div>`;

  try {
    const currency = _state.currency || 'UAH';
    const now = new Date();
    const funcs = _state.functions || [];

    // Завантажуємо FP1 налаштування (яка функція → який бенчмарк)
    const cid = window.currentCompanyId;
    const db = window.db || firebase.firestore();
    let fp1Config = {};
    try {
      const cfgSnap = await db.collection('companies').doc(cid).collection('finance_settings').doc('fp1_config').get();
      if (cfgSnap.exists) fp1Config = cfgSnap.data();
    } catch(e) { /* використаємо дефолт */ }

    // Будуємо 4 тижні назад + поточний
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - w * 7);
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      const label = `${startDate.getDate()}.${String(startDate.getMonth()+1).padStart(2,'0')} – ${endDate.getDate()}.${String(endDate.getMonth()+1).padStart(2,'0')}`;
      weeks.push({ startDate, endDate, label });
    }

    // Завантажуємо транзакції за 4 тижні
    const from4w = firebase.firestore.Timestamp.fromDate(weeks[0].startDate);
    const to4w   = firebase.firestore.Timestamp.fromDate(weeks[3].endDate);
    const txSnap = await db.collection('companies').doc(cid)
      .collection('finance_transactions')
      .where('date', '>=', from4w)
      .where('date', '<=', to4w)
      .get();
    const allTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Розраховуємо дані по кожному тижню
    const weekData = weeks.map(w => {
      const txs = allTxs.filter(tx => {
        const d = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
        return d >= w.startDate && d <= w.endDate;
      });
      const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + txAmt(t), 0);
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + txAmt(t), 0);
      const diff     = income - expenses;

      // По функціях
      const byFunc = {};
      txs.filter(t => t.type === 'expense').forEach(t => {
        const fid = t.functionId || '__none__';
        byFunc[fid] = (byFunc[fid] || 0) + txAmt(t);
      });

      return { ...w, income, expenses, diff, byFunc, txCount: txs.length };
    });

    // Поточний тиждень — останній
    const cur = weekData[weekData.length - 1];

    // Аномалії
    const anomalies = [];
    funcs.forEach(f => {
      const bKey = fp1Config['func_benchmark_' + f.id] || f.benchmarkKey;
      const bench = _FP1_BENCHMARKS[bKey];
      if (!bench || !cur.income) return;
      const fact = cur.byFunc[f.id] || 0;
      const factPct = Math.round(fact / cur.income * 100);
      if (factPct > bench.pctMax + 3) {
        anomalies.push({ type: 'over', func: f.name, fact: factPct, max: bench.pctMax, color: '#ef4444' });
      } else if (bKey === 'reserve' && factPct === 0) {
        anomalies.push({ type: 'zero', func: f.name, color: '#ef4444' });
      } else if (factPct < bench.pctMin - 3 && fact > 0) {
        anomalies.push({ type: 'under', func: f.name, fact: factPct, min: bench.pctMin, color: '#f59e0b' });
      }
    });

    // ─── Рендер ───────────────────────────────────────────────
    el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1rem;">

      <!-- Заголовок з аномаліями -->
      ${anomalies.length > 0 ? `
      <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;padding:.9rem 1rem;">
        <div style="font-size:.75rem;font-weight:700;color:#dc2626;margin-bottom:.4rem;display:flex;align-items:center;gap:.4rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          ${_tg('Аномалії поточного тижня','Аномалии текущей недели')} (${anomalies.length})
        </div>
        ${anomalies.map(a => `
          <div style="font-size:.8rem;color:#374151;padding:.2rem 0;">
            ${a.type === 'over' ? `⚠️ <b>${escHtml(a.func)}</b>: ${_tg('перевитрата','перерасход')} ${a.fact}% (${_tg('норма','норма')}: ${a.max}%)` : ''}
            ${a.type === 'zero' ? `🔴 <b>${escHtml(a.func)}</b>: ${_tg('не відраховано (0%)','не отчислено (0%)')}` : ''}
            ${a.type === 'under' ? `🟡 <b>${escHtml(a.func)}</b>: ${_tg('недовитрата','недорасход')} ${a.fact}% (${_tg('норма','норма')}: ${a.min}%)` : ''}
          </div>
        `).join('')}
      </div>` : `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:.75rem 1rem;font-size:.82rem;color:#166534;display:flex;align-items:center;gap:.5rem;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        ${_tg('Аномалій не виявлено — всі функції в межах бенчмарків','Аномалий не обнаружено — все функции в пределах бенчмарков')}
      </div>`}

      <!-- 4 тижні: прихід / витрати / різниця -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:#1e293b;color:#fff;padding:.65rem 1rem;font-size:.75rem;font-weight:700;display:grid;grid-template-columns:120px repeat(4,1fr);">
          <div>${_tg('Показник','Показатель')}</div>
          ${weekData.map(w => `<div style="text-align:right;">${w.label}</div>`).join('')}
        </div>
        ${[
          { label: _tg('Прихід','Приход'), key: 'income', color: '#22c55e' },
          { label: _tg('Витрати','Расходы'), key: 'expenses', color: '#ef4444' },
          { label: _tg('Різниця','Разница'), key: 'diff', isDiff: true },
        ].map((row, ri) => `
        <div style="display:grid;grid-template-columns:120px repeat(4,1fr);padding:.5rem 1rem;border-bottom:1px solid #f1f5f9;font-size:.8rem;background:${ri%2===0?'#fff':'#fafafa'};">
          <div style="font-weight:600;color:#374151;">${row.label}</div>
          ${weekData.map(w => {
            const val = w[row.key];
            const color = row.isDiff ? (val >= 0 ? '#22c55e' : '#ef4444') : row.color;
            return `<div style="text-align:right;font-weight:600;color:${color};">${val >= 0 ? '' : '−'}${fmt(Math.abs(val), currency)}</div>`;
          }).join('')}
        </div>`).join('')}
      </div>

      <!-- Тижневий розріз по функціях -->
      ${funcs.length > 0 ? `
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:#1e293b;color:#fff;padding:.65rem 1rem;font-size:.75rem;font-weight:700;">
          ${_tg('Витрати по функціях (поточний тиждень)','Расходы по функциям (текущая неделя)')}
          <span style="font-size:.7rem;opacity:.6;margin-left:.5rem;">${_tg('від приходу','от прихода')}: ${fmt(cur.income, currency)}</span>
        </div>
        <!-- Header -->
        <div style="display:grid;grid-template-columns:1fr 90px 90px 70px 90px;padding:.5rem 1rem;background:#f8fafc;font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">
          <div>${_tg('Функція','Функция')}</div>
          <div style="text-align:right;">${_tg('Бенчмарк','Бенчмарк')}</div>
          <div style="text-align:right;">${_tg('Факт грн','Факт грн')}</div>
          <div style="text-align:right;">${_tg('Факт %','Факт %')}</div>
          <div style="text-align:right;">${_tg('Статус','Статус')}</div>
        </div>
        ${funcs.map((f, i) => {
          const bKey = fp1Config['func_benchmark_' + f.id] || f.benchmarkKey;
          const bench = _FP1_BENCHMARKS[bKey];
          const fact = cur.byFunc[f.id] || 0;
          const factPct = cur.income > 0 ? Math.round(fact / cur.income * 100) : 0;
          const benchRange = bench ? `${bench.pctMin}–${bench.pctMax}%` : '—';
          let status = '—', statusColor = '#9ca3af';
          if (bench) {
            if (factPct > bench.pctMax + 3) { status = `+${factPct - bench.pctMax}% ⚠️`; statusColor = '#ef4444'; }
            else if (factPct >= bench.pctMin && factPct <= bench.pctMax) { status = '✓ норма'; statusColor = '#22c55e'; }
            else if (factPct > 0 && factPct < bench.pctMin - 2) { status = '↓ низько'; statusColor = '#f59e0b'; }
            else if (factPct === 0) { status = '—'; statusColor = '#9ca3af'; }
          }
          const barPct = bench ? Math.min(100, Math.round(factPct / bench.pctMax * 100)) : 0;
          const barColor = statusColor;
          return `
          <div style="display:grid;grid-template-columns:1fr 90px 90px 70px 90px;padding:.45rem 1rem;border-bottom:1px solid #f9fafb;align-items:center;font-size:.8rem;background:${i%2===0?'#fff':'#fafafa'};">
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span style="font-weight:500;color:#1f2937;">${bench ? bench.icon+' ' : ''}${escHtml(f.name)}</span>
              <div style="height:3px;background:#f1f5f9;border-radius:2px;width:80px;overflow:hidden;">
                <div style="height:3px;background:${barColor};border-radius:2px;width:${barPct}%;transition:width .3s;"></div>
              </div>
            </div>
            <div style="text-align:right;color:#9ca3af;font-size:.75rem;">${benchRange}</div>
            <div style="text-align:right;font-weight:600;color:#374151;">${fmt(fact, currency)}</div>
            <div style="text-align:right;font-weight:700;color:${barColor};">${factPct}%</div>
            <div style="text-align:right;font-size:.75rem;font-weight:600;color:${statusColor};">${status}</div>
          </div>`;
        }).join('')}
        <!-- Підсумок -->
        <div style="display:grid;grid-template-columns:1fr 90px 90px 70px 90px;padding:.55rem 1rem;background:#f0fdf4;font-size:.8rem;font-weight:700;border-top:2px solid #bbf7d0;">
          <div style="color:#166534;">${_tg('РАЗОМ витрати','ИТОГО расходы')}</div>
          <div style="text-align:right;color:#9ca3af;">100%</div>
          <div style="text-align:right;color:#374151;">${fmt(cur.expenses, currency)}</div>
          <div style="text-align:right;color:${cur.income > 0 ? (Math.round(cur.expenses/cur.income*100) <= 92 ? '#22c55e' : '#ef4444') : '#9ca3af'};">
            ${cur.income > 0 ? Math.round(cur.expenses / cur.income * 100) + '%' : '—'}
          </div>
          <div style="text-align:right;color:${cur.diff >= 0 ? '#22c55e' : '#ef4444'};">
            ${cur.diff >= 0 ? '✓ +' : '✗ −'}${fmt(Math.abs(cur.diff), currency)}
          </div>
        </div>
      </div>` : `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:1.5rem;text-align:center;color:#9ca3af;font-size:.85rem;">
        ${_tg('Функції не налаштовані. Перейдіть в Система → Структура → Функції і створіть 8 функцій.','Функции не настроены. Перейдите в Система → Структура → Функции и создайте 8 функций.')}
      </div>`}

      <!-- Налаштування бенчмарків -->
      <details style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <summary style="padding:.75rem 1rem;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;user-select:none;list-style:none;display:flex;align-items:center;justify-content:space-between;">
          <span>⚙️ ${_tg('Налаштування бенчмарків по функціях','Настройка бенчмарков по функциям')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div style="padding:1rem;border-top:1px solid #f1f5f9;">
          <div style="font-size:.78rem;color:#6b7280;margin-bottom:.75rem;">
            ${_tg('Привяжіть кожну функцію до бенчмарку відповідно до структури вашого бізнесу','Привяжите каждую функцию к бенчмарку согласно структуре вашего бизнеса')}
          </div>
          ${funcs.map(f => `
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem;font-size:.8rem;">
            <div style="flex:1;font-weight:500;color:#374151;">${escHtml(f.name)}</div>
            <select onchange="window._fp1SaveBenchmark('${f.id}', this.value)"
              style="padding:.3rem .6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:.78rem;color:#374151;">
              <option value="">— ${_tg('не вказано','не указано')} —</option>
              ${Object.entries(_FP1_BENCHMARKS).map(([key, b]) =>
                `<option value="${key}" ${(fp1Config['func_benchmark_' + f.id] || f.benchmarkKey) === key ? 'selected' : ''}>${b.label()} (${b.pctMin}–${b.pctMax}%)</option>`
              ).join('')}
            </select>
          </div>`).join('')}
        </div>
      </details>

    </div>`;
  } catch(err) {
    console.error('[FP1Weekly]', err);
    el.innerHTML = `<div style="text-align:center;color:#ef4444;padding:2rem;font-size:.85rem;">${_tg('Помилка завантаження','Ошибка загрузки')}: ${escHtml(err.message)}</div>`;
  }
}

window._fp1SaveBenchmark = async function(funcId, benchKey) {
  if (!window.currentCompanyId) return;
  const db = window.db || firebase.firestore();
  try {
    await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_settings').doc('fp1_config')
      .set({ ['func_benchmark_' + funcId]: benchKey }, { merge: true });
    if (typeof showToast === 'function') showToast(_tg('Бенчмарк збережено','Бенчмарк сохранён'), 'success');
  } catch(e) {
    if (typeof showToast === 'function') showToast(_tg('Помилка збереження','Ошибка сохранения'), 'error');
  }
};

async function _renderFunctionsBudget(monthVal) {
  const el = document.getElementById('planFunctionsBody');
  if (!el) return;
  try {
    const [y, m] = monthVal.split('-').map(Number);
    const from = firebase.firestore.Timestamp.fromDate(new Date(y, m-1, 1));
    const to   = firebase.firestore.Timestamp.fromDate(new Date(y, m, 0, 23, 59, 59));

    const [txSnap, budgSnap] = await Promise.all([
      colRef('finance_transactions').where('date','>=',from).where('date','<=',to).get(),
      colRef('finance_budgets').doc(monthVal).get(),
    ]);

    const txs = txSnap.docs.map(d => d.data());
    const budgData = budgSnap.exists ? budgSnap.data() : {};
    const currency = _state.currency || 'EUR';

    // Загальний бюджет витрат = сума всіх cat_ полів
    let totalBudget = 0;
    Object.keys(budgData).forEach(k => { if (k.startsWith('cat_')) totalBudget += budgData[k] || 0; });

    // Факт по функціях
    const byFunc = {};
    let totalExpense = 0;
    txs.forEach(tx => {
      if (tx.type !== 'expense') return;
      const fid = tx.functionId || '__none__';
      byFunc[fid] = (byFunc[fid] || 0) + txAmt(tx);
      totalExpense += txAmt(tx);
    });

    const funcs = _state.functions || [];
    if (funcs.length === 0) {
      el.innerHTML = '<div style="padding:2rem;text-align:center;color:#9ca3af;">'+window.t('noFunctions2')+'</div>';
      return;
    }

    el.innerHTML = `
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;
          padding:0.65rem 1rem;display:grid;grid-template-columns:1fr 80px 110px 80px 90px;">
          <div>${window.t('functionHeader')}</div>
          <div style="text-align:right;">${_tg('Норма %','Норма %')}</div>
          <div style="text-align:right;">${_tg('Факт сума','Факт сумма')}</div>
          <div style="text-align:right;">${_tg('Факт %','Факт %')}</div>
          <div style="text-align:right;">${window.t('finVariance')}</div>
        </div>
        ${funcs.map((f, i) => {
          const fact = byFunc[f.id] || 0;
          const factPct = totalExpense > 0 ? Math.round(fact / totalExpense * 100) : 0;
          const normPct = budgData['func_norm_' + f.id] || 0;
          const diff = factPct - normPct;
          const diffColor = diff > 5 ? '#ef4444' : diff > 2 ? '#f59e0b' : '#22c55e';
          const bg = i%2===0 ? '#fff' : '#fafafa';
          return `
            <div style="display:grid;grid-template-columns:1fr 80px 110px 80px 90px;
              padding:0.55rem 1rem;background:${bg};border-bottom:1px solid #f3f4f6;align-items:center;">
              <div style="font-size:0.82rem;color:#374151;font-weight:500;">${escHtml(f.name)}</div>
              <div style="text-align:right;">
                <input type="number" min="0" max="100" value="${normPct||''}" placeholder="0"
                  data-func-norm="${f.id}"
                  style="width:55px;padding:3px 5px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.78rem;text-align:right;">%
              </div>
              <div style="text-align:right;font-size:0.82rem;font-weight:600;color:#374151;">${fmt(fact, currency)}</div>
              <div style="text-align:right;font-size:0.82rem;font-weight:600;color:#374151;">${factPct}%</div>
              <div style="text-align:right;font-size:0.82rem;font-weight:700;color:${normPct>0?diffColor:'#9ca3af'};">
                ${normPct > 0 ? (diff > 0 ? '+' : '') + diff + '%' : '—'}
              </div>
            </div>`;
        }).join('')}
        ${byFunc['__none__'] ? `
          <div style="display:grid;grid-template-columns:1fr 80px 110px 80px 90px;
            padding:0.55rem 1rem;background:#fafafa;border-bottom:1px solid #f3f4f6;align-items:center;">
            <div style="font-size:0.78rem;color:#9ca3af;">${window.t('finNoFunction')}</div>
            <div></div>
            <div style="text-align:right;font-size:0.82rem;color:#9ca3af;">${fmt(byFunc['__none__'], currency)}</div>
            <div style="text-align:right;font-size:0.78rem;color:#9ca3af;">
              ${totalExpense > 0 ? Math.round(byFunc['__none__'] / totalExpense * 100) : 0}%
            </div>
            <div></div>
          </div>` : ''}
      </div>
      <div style="margin-top:10px;text-align:right;">
        <button onclick="window._saveFuncNorms()"
          style="background:#22c55e;color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:0.82rem;font-weight:600;cursor:pointer;">
          ${window.t('finSaveNorms')}
        </button>
      </div>`;
  } catch(e) {
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.82rem;">${_tg('Помилка:','Ошибка:')} ${escHtml(e.message)}</div>`;
  }
}

window._saveFuncNorms = async function() {
  const inputs = document.querySelectorAll('[data-func-norm]');
  const data = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
  inputs.forEach(inp => { data['func_norm_' + inp.dataset.funcNorm] = parseFloat(inp.value) || 0; });
  try {
    await colRef('finance_budgets').doc(_planMonth).set(data, { merge: true });
    if (typeof showToast === 'function') showToast(window.t('finNormsSaved'), 'success');
  } catch(e) { if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error'); }
};

// ── Cashflow прогноз 30/60/90 днів ───────────────────────
async function _renderCashflowForecast() {
  const el = document.getElementById('planCashflowForecast');
  if (!el) return;
  el.innerHTML = ('<div style="text-align:center;color:#9ca3af;padding:2rem;">' + _tg('Розраховую прогноз...','Рассчитываю прогноз...') + '</div>');

  try {
    const currency = _state.currency || 'EUR';
    const today = new Date(); today.setHours(0,0,0,0);

    // Поточний баланс
    const totalBalance = _state.accounts.reduce((s, a) => s + (a.balance || 0), 0);

    // Регулярні витрати на наступні 90 днів
    const recurring = _state.recurring || [];
    const outflows = {}; // date → amount

    recurring.filter(r => r.active !== false && r.type === 'expense').forEach(r => { // FIX BO: active замість status
      for (let d = 0; d < 90; d++) {
        const dt = new Date(today); dt.setDate(today.getDate() + d);
        const dayOfMonth = dt.getDate();
        let match = false;
        if (r.period === 'monthly' && r.dayOfMonth == dayOfMonth) match = true;
        if (r.period === 'weekly') {
          const jsDay = dt.getDay(); // 0=Sun
          const days = r.daysOfWeek || [];
          if (days.includes(String(jsDay)) || days.includes(jsDay)) match = true;
        }
        if (r.period === 'daily') match = true;
        if (match) {
          const key = dt.toISOString().split('T')[0];
          outflows[key] = (outflows[key] || 0) + (r.amount || 0);
        }
      }
    });

    // Будуємо cashflow по днях → агрегуємо по 30/60/90
    const points = [30, 60, 90];
    const results = points.map(days => {
      let balance = totalBalance;
      for (let d = 0; d < days; d++) {
        const dt = new Date(today); dt.setDate(today.getDate() + d);
        const key = dt.toISOString().split('T')[0];
        balance -= (outflows[key] || 0);
      }
      return { days, balance };
    });

    const minBalance = Math.min(...results.map(r => r.balance));
    const hasNegative = minBalance < 0;

    el.innerHTML = `
      ${hasNegative ? `
        <div style="padding:10px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin-bottom:16px;font-size:0.82rem;font-weight:600;color:#dc2626;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Прогнозується від'ємний залишок: ${fmt(minBalance, currency)}
        </div>` : ''}

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
        ${results.map(r => `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;text-align:center;">
            <div style="font-size:0.72rem;color:#6b7280;margin-bottom:4px;">${window.t('daysLeft').replace('{V}', r.days)}</div>
            <div style="font-size:1.1rem;font-weight:700;color:${r.balance>=0?'#22c55e':'#ef4444'};">
              ${fmt(r.balance, currency)}
            </div>
          </div>`).join('')}
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
        <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:12px;">${_tg('Поточний стан','Текущее состояние')}</div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:8px;">
          <span style="color:#6b7280;">${_tg('Залишок на рахунках','Остаток на счетах')}</span>
          <span style="font-weight:700;color:#22c55e;">${fmt(totalBalance, currency)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:8px;">
          <span style="color:#6b7280;">${window.t('finRecurringExpensesMonth')}</span>
          <span style="font-weight:600;color:#ef4444;">
            ${fmt(recurring.filter(r=>r.active!==false&&r.frequency==='monthly').reduce((s,r)=>s+(r.amount||0),0), currency)}
          </span>
        </div>
        <div style="border-top:1px solid #f3f4f6;padding-top:8px;font-size:0.75rem;color:#9ca3af;">
          ${window.t('forecastHint')}
        </div>
      </div>`;
  } catch(e) {
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.82rem;">${_tg('Помилка:','Ошибка:')} ${escHtml(e.message)}</div>`;
  }
}

// ── Аналітика (P&L, проекти, тренди) ─────────────────────
let _analyticsMode = 'pnl';
let _analyticsPeriod = 'month'; // month | quarter | year

function renderAnalytics(el) {
  const currency = _state.currency || 'EUR';
  el.innerHTML = `
    <div style="width:100%;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${window.t('finTabAnalytics')}</div>
        <div style="display:flex;gap:6px;">
          <select id="analyticsPeriodSel" onchange="window._analyticsPeriodChange(this.value)"
            style="padding:5px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
            <option value="month">${window.t('finThisMonth')}</option>
            <option value="quarter">${window.t('thisQuarter')}</option>
            <option value="year">${window.t('thisYear')}</option>
          </select>
          <button onclick="window._exportPnlXlsx()"
            title="Експорт P&L в Excel"
            style="padding:5px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.78rem;background:#fff;cursor:pointer;display:flex;align-items:center;gap:4px;color:#374151;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Excel
          </button>
          <button onclick="window._exportPnlPdf()"
            title="Експорт P&L в PDF"
            style="padding:5px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.78rem;background:#fff;cursor:pointer;display:flex;align-items:center;gap:4px;color:#374151;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            PDF
          </button>
        </div>
      </div>

      <!-- Перемикач режиму -->
      <div style="display:flex;gap:6px;margin-bottom:1rem;flex-wrap:wrap;">
        <button onclick="window._analyticsMode('pnl')" id="anlBtn_pnl"
          style="padding:6px 14px;border-radius:8px;border:2px solid #22c55e;background:#f0fdf4;color:#16a34a;font-size:0.8rem;font-weight:600;cursor:pointer;">
          ${window.t('finPLReport')}
        </button>
        <button onclick="window._analyticsMode('projects')" id="anlBtn_projects"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          ${window.t('finMarginByProject')}
        </button>
        <button onclick="window._analyticsMode('trends')" id="anlBtn_trends"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          ${window.t('finExpenseTrend')}
        </button>
        <button onclick="window._analyticsMode('balance')" id="anlBtn_balance"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16v4"/><circle cx="18" cy="12" r="2"/></svg>
          ${window.t('finTabBalance')}
        </button>
      </div>

      <div id="analyticsContent">
        <div style="text-align:center;color:#9ca3af;padding:2rem;">${window.t('finLoading')}</div>
      </div>
    </div>`;

  _loadAnalytics(_analyticsMode, _analyticsPeriod);
}

window._analyticsMode = function(mode) {
  _analyticsMode = mode;
  ['pnl','projects','trends','balance'].forEach(m => {
    const btn = document.getElementById('anlBtn_' + m);
    if (!btn) return;
    const active = m === mode;
    btn.style.borderColor = active ? '#22c55e' : '#e5e7eb';
    btn.style.background  = active ? '#f0fdf4' : '#fff';
    btn.style.color       = active ? '#16a34a' : '#6b7280';
  });
  _loadAnalytics(mode, _analyticsPeriod);
};

window._analyticsPeriodChange = function(val) {
  _analyticsPeriod = val;
  _loadAnalytics(_analyticsMode, val);
};

async function _loadAnalytics(mode, period) {
  const el = document.getElementById('analyticsContent');
  if (!el) return;
  el.innerHTML = `<div style="text-align:center;color:#9ca3af;padding:2rem;">${window.t('finLoading')}</div>`;

  try {
    const currency = _state.currency || 'EUR';

    // Balance mode — не потребує завантаження транзакцій по періоду
    if (mode === 'balance') {
      if (typeof window.renderBalanceSheet === 'function') {
        window.renderBalanceSheet(el);
      } else {
        el.innerHTML = ('<div style="padding:2rem;text-align:center;color:#9ca3af;">' + _tg('Модуль балансу не завантажено','Модуль баланса не загружен') + '</div>');
      }
      return;
    }

    const now = new Date();
    let from, to;

    if (period === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), q * 3, 1);
      to   = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59);
    } else {
      from = new Date(now.getFullYear(), 0, 1);
      to   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    }

    const fromTs = firebase.firestore.Timestamp.fromDate(from);
    const toTs   = firebase.firestore.Timestamp.fromDate(to);

    const snap = await colRef('finance_transactions')
      .where('date', '>=', fromTs).where('date', '<=', toTs).get();
    const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (mode === 'pnl')      _renderPnl(el, txs, currency, from, to);
    if (mode === 'projects')  _renderProjectsMargin(el, txs, currency);
    if (mode === 'trends')    _renderTrends(el, txs, currency, from, to, period);

  } catch(e) {
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.82rem;">${_tg('Помилка:','Ошибка:')} ${escHtml(e.message)}</div>`;
  }
}

// ── P&L звіт (повна структура з нарахувальним методом) ───
function _renderPnl(el, txs, currency, from, to) {
  const incCats = _state.categories.income  || [];
  const expCats = _state.categories.expense || [];

  // Нарахувальний метод: accrualDate якщо є, інакше date
  const getAccrualDate = (tx) => tx.accrualDate || tx.date;

  const byIncCat = {}, byCogsCat = {}, byOpexCat = {};
  let totalInc = 0, totalCogs = 0, totalOpex = 0;

  txs.forEach(tx => {
    const txDate = getAccrualDate(tx);
    if (txDate) {
      const d = txDate.toDate ? txDate.toDate() : new Date(txDate);
      if (d < from || d > to) return;
    }
    const amt = txAmt(tx);
    if (tx.type === 'income') {
      byIncCat[tx.categoryId] = (byIncCat[tx.categoryId] || 0) + amt;
      totalInc += amt;
    } else if (tx.type === 'expense') {
      const cat = expCats.find(c => c.id === tx.categoryId);
      const isCogs = cat && cat.costType === 'cogs';
      if (isCogs) {
        byCogsCat[tx.categoryId] = (byCogsCat[tx.categoryId] || 0) + amt;
        totalCogs += amt;
      } else {
        byOpexCat[tx.categoryId] = (byOpexCat[tx.categoryId] || 0) + amt;
        totalOpex += amt;
      }
    }
  });

  const grossProfit = totalInc - totalCogs;
  const grossMargin = totalInc > 0 ? Math.round(grossProfit / totalInc * 100) : 0;
  const netProfit   = grossProfit - totalOpex;
  const netMargin   = totalInc > 0 ? Math.round(netProfit / totalInc * 100) : 0;

  const pColor = (v) => v >= 0 ? '#22c55e' : '#ef4444';
  const mColor = (v) => v >= 30 ? '#22c55e' : v >= 10 ? '#f59e0b' : '#ef4444';

  const secHdr = (label, total, bg, tc) =>
    `<div style="background:${bg};padding:8px 14px;font-size:0.75rem;font-weight:700;color:${tc};` +
    `text-transform:uppercase;letter-spacing:.04em;display:flex;justify-content:space-between;align-items:center;">` +
    `<span>${label}</span><span>${fmt(total, currency)}</span></div>`;

  const catRow = (cat, amount, base) => {
    const pct = base > 0 ? Math.round(amount / base * 100) : 0;
    return `<div style="display:flex;align-items:center;gap:10px;padding:7px 14px;border-bottom:1px solid #f3f4f6;">` +
      `<div style="flex:1;font-size:0.82rem;color:#374151;">${escHtml(cat.name)}</div>` +
      `<div style="font-size:0.82rem;font-weight:600;color:#ef4444;width:100px;text-align:right;">${fmt(amount, currency)}</div>` +
      `<div style="font-size:0.75rem;color:#9ca3af;width:38px;text-align:right;">${pct}%</div>` +
      `</div>`;
  };

  const incRow = (cat, amount) => {
    const pct = totalInc > 0 ? Math.round(amount / totalInc * 100) : 0;
    return `<div style="display:flex;align-items:center;gap:10px;padding:7px 14px;border-bottom:1px solid #f3f4f6;">` +
      `<div style="flex:1;font-size:0.82rem;color:#374151;">${escHtml(cat.name)}</div>` +
      `<div style="font-size:0.82rem;font-weight:600;color:#22c55e;width:100px;text-align:right;">${fmt(amount, currency)}</div>` +
      `<div style="font-size:0.75rem;color:#9ca3af;width:38px;text-align:right;">${pct}%</div>` +
      `</div>`;
  };

  const subRow = (label, value, bg) => {
    const pct = totalInc > 0 ? Math.round(value / totalInc * 100) : 0;
    return `<div style="display:flex;justify-content:space-between;align-items:center;` +
      `padding:10px 14px;background:${bg};border-bottom:2px solid #e5e7eb;">` +
      `<span style="font-size:0.85rem;font-weight:700;color:#1a1a1a;">${label}</span>` +
      `<div style="display:flex;align-items:center;gap:12px;">` +
      `<span style="font-size:0.78rem;color:${mColor(pct)};">${totalInc > 0 ? pct + '%' : ''}</span>` +
      `<span style="font-size:0.95rem;font-weight:700;color:${pColor(value)};">${value >= 0 ? '+' : ''}${fmt(value, currency)}</span>` +
      `</div></div>`;
  };

  const noData = (msg) => `<div style="padding:10px 14px;font-size:0.82rem;color:#9ca3af;">${msg}</div>`;

  const accrualNote = `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;` +
    `margin-bottom:12px;font-size:0.75rem;color:#1e40af;display:flex;align-items:flex-start;gap:6px;">` +
    `<span style="flex-shrink:0;">ℹ️</span>` +
    `<span>${window.t('pnlVsCashflow')}</span></div>`;

  el.innerHTML = accrualNote +
    `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;">` +
    [
      { label:window.t('revenueLabel'), val: fmt(totalInc, currency), color:'#22c55e', sub:'' },
      { label:window.t('grossProfitLabel'), val: fmt(grossProfit, currency), color:pColor(grossProfit), sub: grossMargin + '% ' + window.t('marginWord') },
      { label:window.t('opexLabel'), val: fmt(totalOpex, currency), color:'#f59e0b', sub:'' },
      { label:window.t('netProfitLabel'), val: fmt(netProfit, currency), color:pColor(netProfit), sub: netMargin + '% ' + window.t('marginWord') },
    ].map(k =>
      `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;">` +
      `<div style="font-size:0.7rem;color:#6b7280;margin-bottom:3px;">${k.label}</div>` +
      `<div style="font-size:1rem;font-weight:700;color:${k.color};">${k.val}</div>` +
      (k.sub ? `<div style="font-size:0.7rem;color:#9ca3af;margin-top:2px;">${k.sub}</div>` : '') +
      `</div>`).join('') +
    `</div>` +
    `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">` +
    secHdr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> ' + window.t('revenueLabel') + ' (Revenue)', totalInc, '#f0fdf4', '#16a34a') +
    (incCats.filter(c => byIncCat[c.id]).map(c => incRow(c, byIncCat[c.id]||0)).join('') ||
      noData(window.t('noIncomeData'))) +
    secHdr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg> ' + window.t('cogsLabel') + ' (COGS)', totalCogs, '#fff7ed', '#c2410c') +
    (expCats.filter(c => byCogsCat[c.id]).map(c => catRow(c, byCogsCat[c.id]||0, totalInc)).join('') ||
      `<div style="padding:8px 14px;font-size:0.78rem;color:#9ca3af;">` +
      `${window.t('noCOGSData')}</div>`) +
    subRow(window.t('grossProfitLabel') + ' (Gross Profit)', grossProfit, '#f8fafc') +
    secHdr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> ' + window.t('opexFullLabel') + ' (OPEX)', totalOpex, '#fef2f2', '#dc2626') +
    (expCats.filter(c => byOpexCat[c.id]).map(c => catRow(c, byOpexCat[c.id]||0, totalInc)).join('') ||
      noData(window.t('noOpexData'))) +
    `<div style="background:#1f2937;color:#fff;padding:14px 14px;display:flex;justify-content:space-between;align-items:center;">` +
    `<div><div style="font-size:0.85rem;font-weight:700;">${window.t('netProfitLabel')} (Net Profit)</div>` +
    `<div style="font-size:0.72rem;color:#9ca3af;margin-top:2px;">${window.t('marginLabel')} ${netMargin}%</div></div>` +
    `<span style="font-size:1.1rem;font-weight:700;color:${pColor(netProfit)};">` +
    `${netProfit >= 0 ? '+' : ''}${fmt(netProfit, currency)}</span></div>` +
    `</div>` +
    (totalCogs === 0 ?
      `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;` +
      `margin-top:12px;font-size:0.78rem;color:#92400e;">` +
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg> <b>${window.t('hintLabel')}:</b> ${window.t('cogsHintFull')} ` +
      `${window.t('cogsHint')}</div>` : '');
}

// ── Маржинальність по проектах ────────────────────────────
async function _renderProjectsMargin(el, txs, currency) {
  // Беремо проекти
  let projects = [];
  try {
    const snap = await colRef('projects').get();
    projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { /* немає колекції */ }

  const byProject = {};
  txs.forEach(tx => {
    if (!tx.projectId) return;
    if (!byProject[tx.projectId]) byProject[tx.projectId] = { income: 0, expense: 0 };
    if (tx.type === 'income')  byProject[tx.projectId].income  += txAmt(tx);
    if (tx.type === 'expense') byProject[tx.projectId].expense += txAmt(tx);
  });

  const rows = Object.entries(byProject).map(([pid, d]) => {
    const proj = projects.find(p => p.id === pid);
    const name = proj?.name || proj?.title || 'Проект ' + pid.slice(0,6);
    const profit = d.income - d.expense;
    const margin = d.income > 0 ? Math.round(profit / d.income * 100) : 0;
    return { name, ...d, profit, margin };
  }).sort((a, b) => b.margin - a.margin);

  if (rows.length === 0) {
    el.innerHTML = `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:2rem;text-align:center;color:#9ca3af;">
        ${window.t('noProjectTxFin')}<br>
        <span style="font-size:0.78rem;">${window.t('finProjectHint')}</span>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;padding:10px 14px;
        display:grid;grid-template-columns:1fr 100px 100px 100px 70px;text-transform:uppercase;">
        <div>${window.t('finProjectLbl')}</div>
        <div style="text-align:right;">${window.t('finTransactionIncome')}</div>
        <div style="text-align:right;">${window.t('finExpense')||'Витрати'}</div>
        <div style="text-align:right;">${window.t('finProfit')}</div>
        <div style="text-align:right;">${window.t('finMargin')}</div>
      </div>
      ${rows.map((r, i) => {
        const profitColor = r.profit >= 0 ? '#22c55e' : '#ef4444';
        const marginColor = r.margin >= 30 ? '#22c55e' : r.margin >= 10 ? '#f59e0b' : '#ef4444';
        return `
          <div style="display:grid;grid-template-columns:1fr 100px 100px 100px 70px;
            padding:9px 14px;background:${i%2===0?'#fff':'#fafafa'};border-bottom:1px solid #f3f4f6;align-items:center;">
            <div style="font-size:0.82rem;font-weight:500;color:#1a1a1a;">${escHtml(r.name)}</div>
            <div style="text-align:right;font-size:0.82rem;color:#22c55e;font-weight:600;">${fmt(r.income, currency)}</div>
            <div style="text-align:right;font-size:0.82rem;color:#ef4444;">${fmt(r.expense, currency)}</div>
            <div style="text-align:right;font-size:0.82rem;font-weight:700;color:${profitColor};">${fmt(r.profit, currency)}</div>
            <div style="text-align:right;font-size:0.82rem;font-weight:700;color:${marginColor};">${r.margin}%</div>
          </div>`;
      }).join('')}
    </div>`;
}

// ── Тренд витрат по категоріях ────────────────────────────
function _renderTrends(el, txs, currency, from, to, period) {
  const expCats = _state.categories.expense || [];

  // Визначаємо buckets (місяці або тижні)
  const buckets = [];
  if (period === 'year') {
    for (let m = 0; m < 12; m++) {
      const d = new Date(from.getFullYear(), m, 1);
      buckets.push({ key: d.getFullYear() + '-' + String(m+1).padStart(2,'0'), label: d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA',{month:'short'}) });
    }
  } else if (period === 'quarter') {
    // 3 місяці
    for (let m = 0; m < 3; m++) {
      const d = new Date(from.getFullYear(), from.getMonth() + m, 1);
      buckets.push({ key: d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'), label: d.toLocaleDateString(window.getLocale ? window.getLocale() : 'uk-UA',{month:'short'}) });
    }
  } else {
    // Місяць — тижні
    const cur = new Date(from);
    while (cur <= to) {
      const wstart = new Date(cur);
      const wend   = new Date(cur); wend.setDate(cur.getDate() + 6);
      buckets.push({
        key: cur.toISOString().split('T')[0],
        label: cur.getDate() + '/' + (cur.getMonth()+1),
        from: new Date(wstart), to: new Date(Math.min(wend, to))
      });
      cur.setDate(cur.getDate() + 7);
    }
  }

  // Агрегація
  const byCatBucket = {}; // catId → { bucketKey → sum }
  txs.filter(t => t.type === 'expense').forEach(tx => {
    const d = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
    const cid = tx.categoryId;
    let bkey;
    if (period === 'month') {
      // Знаходимо тиждень-бакет
      const txDay = d.toISOString().split('T')[0];
      const bk = buckets.find(b => b.from && txDay >= b.from.toISOString().split('T')[0] && txDay <= b.to.toISOString().split('T')[0]);
      bkey = bk ? bk.key : null;
    } else {
      bkey = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    }
    if (!bkey) return;
    if (!byCatBucket[cid]) byCatBucket[cid] = {};
    byCatBucket[cid][bkey] = (byCatBucket[cid][bkey] || 0) + txAmt(tx);
  });

  // Топ-5 категорій за сумою
  const catTotals = expCats.map(c => ({
    cat: c,
    total: buckets.reduce((s, b) => s + (byCatBucket[c.id]?.[b.key] || 0), 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);

  if (catTotals.length === 0) {
    el.innerHTML = '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:2rem;text-align:center;color:#9ca3af;">'+window.t('noDataWord')+'</div>';
    return;
  }

  const maxVal = Math.max(...catTotals.flatMap(({cat}) => buckets.map(b => byCatBucket[cat.id]?.[b.key] || 0)));
  const COLORS = ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];

  el.innerHTML = `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
      <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:16px;">${window.t('top5CatTitle')} ${period === 'year' ? window.t('inMonthsWord') : period === 'quarter' ? window.t('inQuarterMonths') : window.t('inWeeksWord')}</div>

      <!-- Легенда -->
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
        ${catTotals.map(({cat}, i) => `
          <div style="display:flex;align-items:center;gap:5px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${COLORS[i]};flex-shrink:0;"></div>
            <span style="font-size:0.75rem;color:#374151;">${escHtml(cat.name)}</span>
          </div>`).join('')}
      </div>

      <!-- Бар-чарт по periods -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${buckets.map(b => {
          const bucketData = catTotals.map(({cat}) => byCatBucket[cat.id]?.[b.key] || 0);
          const bucketTotal = bucketData.reduce((s, v) => s + v, 0);
          if (bucketTotal === 0 && period === 'month') return '';
          return `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#6b7280;margin-bottom:4px;">
                <span>${b.label}</span>
                <span style="font-weight:600;color:#374151;">${fmt(bucketTotal, currency)}</span>
              </div>
              <div style="height:20px;background:#f3f4f6;border-radius:4px;overflow:hidden;display:flex;">
                ${catTotals.map(({cat}, i) => {
                  const val = byCatBucket[cat.id]?.[b.key] || 0;
                  const pct = maxVal > 0 ? (val / maxVal * 100) : 0;
                  return pct > 0 ? `<div style="height:100%;width:${pct}%;background:${COLORS[i]};opacity:0.85;" title="${escHtml(cat.name)}: ${fmt(val, currency)}"></div>` : '';
                }).join('')}
              </div>
            </div>`;
        }).filter(Boolean).join('')}
      </div>

      <!-- Таблиця-деталі -->
      <div style="margin-top:20px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.78rem;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:6px 10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">${window.t('category')}</th>
              ${buckets.map(b => `<th style="padding:6px 8px;text-align:right;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">${b.label}</th>`).join('')}
              <th style="padding:6px 10px;text-align:right;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">${window.t('total')}</th>
            </tr>
          </thead>
          <tbody>
            ${catTotals.map(({cat, total}, i) => `
              <tr>
                <td style="padding:6px 10px;color:#374151;font-weight:500;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${COLORS[i]};margin-right:5px;"></span>
                  ${escHtml(cat.name)}
                </td>
                ${buckets.map(b => `<td style="padding:6px 8px;text-align:right;color:#374151;">${byCatBucket[cat.id]?.[b.key] ? fmt(byCatBucket[cat.id][b.key], currency) : '—'}</td>`).join('')}
                <td style="padding:6px 10px;text-align:right;font-weight:700;color:#1a1a1a;">${fmt(total, currency)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ── Налаштування ─────────────────────────────────────────
function renderSettings(el) {
  if (!isOwnerOrManager()) {
    el.innerHTML = ('<div style="text-align:center;color:#9ca3af;padding:2rem;">' + _tg('Доступ лише для Owner та Manager','Доступ только для Owner и Manager') + '</div>');
    return;
  }

  const renderCatList = (type) => {
    const cats = _state.categories[type] || [];
    const color = type === 'income' ? '#22c55e' : '#ef4444';
    const label = type === 'income' ? window.t('finIncome') : window.t('finExpense');
    return `
      <div style="margin-bottom:1.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">${window.t('finCategoriesOf')} — ${label}</div>
          <button onclick="window._financeAddCategory('${type}')"
            style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.7rem;
            background:${color};color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;">
            ${I.plus} ${window.t('finAddBtn')}
          </button>
        </div>
        <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
          ${(() => {
            const topCats = cats.filter(c => !c.parentId);
            if (topCats.length === 0) return `<div style="padding:1rem;text-align:center;color:#9ca3af;font-size:0.82rem;">${window.t('finNoCategories')}</div>`;
            return topCats.map((cat, i) => {
              const subcats = cats.filter(c => c.parentId === cat.id);
              const costBadge = type === 'expense' && cat.costType
                ? `<span style="font-size:0.68rem;font-weight:600;padding:2px 7px;border-radius:10px;flex-shrink:0;` +
                  (cat.costType === 'cogs' ? 'background:#fff7ed;color:#c2410c;">COGS' : 'background:#f0fdf4;color:#16a34a;">OPEX') + `</span>`
                : '';
              const subcatRows = subcats.map(sc => `
                <div style="display:flex;align-items:center;gap:0.75rem;padding:0.45rem 0.9rem 0.45rem 2rem;background:#f9fafb;border-bottom:1px solid #f3f4f6;">
                  <span style="color:#9ca3af;font-size:11px;margin-right:2px;">↳</span>
                  <div style="flex:1;font-size:0.82rem;color:#374151;">${escHtml(sc.name)}</div>
                  <button onclick="window._financeDeleteCategory('${sc.id}','${type}')"
                    style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:0.2rem;">${I.trash}</button>
                </div>`).join('');
              return `
              <div style="border-bottom:1px solid #f3f4f6;">
                <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;background:${i%2===0?'#fff':'#fafafa'};">
                  <div style="flex:1;font-size:0.85rem;font-weight:600;color:#1a1a1a;">${escHtml(cat.name)}</div>
                  ${costBadge}
                  <button onclick="window._financeAddCategory('${type}','${cat.id}')"
                    title="${_tg('Додати підкатегорію','Добавить подкатегорию')}"
                    style="display:flex;align-items:center;gap:3px;padding:2px 8px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:5px;cursor:pointer;font-size:0.72rem;font-weight:600;">
                    + ${_tg('Підкат.','Подкат.')}
                  </button>
                  ${!cat.system ? `
                    <button onclick="window._financeDeleteCategory('${cat.id}','${type}')"
                      style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:0.2rem;">${I.trash}</button>
                  ` : `<span style="font-size:0.7rem;color:#9ca3af;">${window.t('finSystem')}</span>`}
                </div>
                ${subcatRows}
              </div>`;
            }).join('');
          })()}
        </div>
      </div>
    `;
  };

  const renderAccList = () => {
    return `
      <div style="margin-bottom:1.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">${window.t('finAccountsAndCash')}</div>
          <button onclick="window._financeAddAccount()"
            style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.7rem;
            background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;">
            ${I.plus} ${window.t('finAddBtn')}
          </button>
        </div>
        <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
          ${_state.accounts.length === 0
            ? '<div style="padding:1rem;text-align:center;color:#9ca3af;font-size:0.82rem;">'+window.t('finNoInvoices2')+'</div>'
            : _state.accounts.map((acc, i) => `
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;
                background:${i%2===0?'#fff':'#fafafa'};border-bottom:1px solid #f3f4f6;">
                <div style="flex:1;">
                  <div style="font-size:0.85rem;color:#1a1a1a;">${escHtml(acc.name)}</div>
                  <div style="font-size:0.72rem;color:#9ca3af;">${acc.type} · ${acc.currency}</div>
                </div>
                <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">${fmt(acc.balance, acc.currency)}</div>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  };

  el.innerHTML = `
    <div style="width:100%;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">${window.t('finSettings')}</div>
      ${renderCatList('income')}
      ${renderCatList('expense')}
      ${renderAccList()}
      ${renderRatesBlock()}
      ${_renderFinModuleLinksBlock()}
    </div>
  `;
}

// ── Блок зв'язків модулів у Finance Settings ──────────────
function _renderFinModuleLinksBlock() {
  // Якщо renderModuleLinksSettings доступна — рендеримо inline
  // Інакше — показуємо кнопку-посилання на системні налаштування
  const hasLinks = typeof window.isLinkActive === 'function';

  const LINKS = [
    { from:'crm',      to:'finance',   label:window.t('mlCrmFinance'),      desc:window.t('mlCrmFinanceDesc') },
    { from:'booking',  to:'finance',   label:window.t('mlBookingFinance'),  desc:window.t('mlBookingFinanceDesc') },
    { from:'warehouse',to:'finance',   label:window.t('mlWarehouseFinance'),desc:window.t('mlWarehouseFinanceDesc') },
    { from:'crm',      to:'tasks',     label:window.t('mlCrmTasks'),        desc:window.t('mlCrmTasksDesc') },
    { from:'booking',  to:'crm',       label:window.t('mlBookingCrm'),      desc:window.t('mlBookingCrmDesc') },
  ];

  const toggles = hasLinks ? LINKS.map((l, i) => {
    const active = window.isLinkActive(l.from, l.to);
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:0.6rem 0.9rem;background:${i%2===0?'#fff':'#fafafa'};border-bottom:1px solid #f3f4f6;">
        <div>
          <div style="font-size:0.82rem;font-weight:600;color:#1a1a1a;">${l.label}</div>
          <div style="font-size:0.72rem;color:#6b7280;">${l.desc}</div>
        </div>
        <label style="position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0;margin-left:1rem;">
          <input type="checkbox" ${active?'checked':''}
            onchange="window.setModuleLink && window.setModuleLink('${l.from}To${l.to.charAt(0).toUpperCase()+l.to.slice(1)}', this.checked).then(()=>{ var s=this.nextElementSibling; if(s){s.style.background=this.checked?'#22c55e':'#d1d5db'; var d=s.querySelector('span');if(d)d.style.left=this.checked?'21px':'3px';} if(typeof showToast==='function')showToast(this.checked?'Зв\\'язок увімкнено':'Зв\\'язок вимкнено',this.checked?'success':'info'); })"
            style="opacity:0;width:0;height:0;position:absolute;">
          <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;border-radius:22px;
            background:${active?'#22c55e':'#d1d5db'};transition:.3s;">
            <span style="position:absolute;height:16px;width:16px;left:${active?'21px':'3px'};bottom:3px;
              background:white;border-radius:50%;transition:.3s;"></span>
          </span>
        </label>
      </div>`;
  }).join('') : '';

  const goToSettings = `
    <div style="padding:10px 12px;font-size:0.75rem;color:#6b7280;background:#f9fafb;
      display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <span>${window.t('allModuleLinks')}</span>
      <button onclick="if(typeof switchTab==='function') switchTab('users'); else { var btn=[...document.querySelectorAll('button')].find(b=>b.getAttribute&&b.getAttribute('onclick')&&b.getAttribute('onclick').includes('users')&&!b.closest('#financeModule')); if(btn) btn.click(); }" style="padding:4px 12px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;
        font-size:0.75rem;cursor:pointer;color:#374151;white-space:nowrap;flex-shrink:0;">
        ${window.t('openArrow')}
      </button>
    </div>`;

  return `
    <div style="margin-bottom:1.5rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
        <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px;">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          ${window.t('moduleLinksTitle')}
        </div>
      </div>
      <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
        ${hasLinks ? toggles : `
          <div style="padding:1rem;text-align:center;color:#9ca3af;font-size:0.82rem;">
            ${window.t('moduleLinksNotLoaded')}
          </div>`}
        ${goToSettings}
      </div>
    </div>`;
}

// ── Блок курсів валют ─────────────────────────────────────
function renderRatesBlock() {
  const base = _state.currency || 'EUR';
  const rates = _state.rates || {};
  const CURRENCIES = ['UAH','USD','EUR','PLN','CZK','GBP'].filter(c => c !== base);

  const rows = CURRENCIES.map(cur => {
    const r = rates[cur] || '';
    return `
      <div style="display:flex;align-items:center;gap:0.75rem;padding:0.55rem 0.9rem;border-bottom:1px solid #f3f4f6;">
        <div style="width:42px;font-size:0.82rem;font-weight:600;color:#374151;">${cur}</div>
        <div style="flex:1;font-size:0.78rem;color:#6b7280;">1 ${cur} =</div>
        <input type="number" min="0" step="0.0001"
          id="rate_${cur}" value="${r}"
          placeholder="${window.t('finRatePlaceholder')}"
          style="width:90px;padding:4px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;text-align:right;">
        <div style="font-size:0.78rem;color:#6b7280;">${base}</div>
      </div>`;
  }).join('');

  return `
    <div style="margin-bottom:1.5rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">${window.t('finExchangeRates')}</div>
          <div style="font-size:0.72rem;color:#6b7280;margin-top:2px;">${window.t('finBaseCurrency')}: <b>${base}</b>. ${window.t('finBaseCurrencyHint').replace('{base}', base)}</div>
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button onclick="window._fetchRates()"
            style="display:flex;align-items:center;gap:4px;padding:0.35rem 0.7rem;border:1px solid #e5e7eb;
            border-radius:7px;background:#fff;color:#374151;cursor:pointer;font-size:0.78rem;font-weight:500;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            ${window.t('finActualRates')}
          </button>
          <button onclick="window._saveRates()"
            style="padding:0.35rem 0.7rem;border:none;border-radius:7px;background:#22c55e;
            color:#fff;cursor:pointer;font-size:0.78rem;font-weight:600;">
            ${window.t('finSave')}
          </button>
        </div>
      </div>
      <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
        ${rows}
      </div>
      <div id="ratesStatus" style="font-size:0.75rem;color:#9ca3af;margin-top:6px;text-align:right;"></div>
    </div>`;
}

window._saveRates = async function() {
  const base = _state.currency || 'EUR';
  const CURRENCIES = ['UAH','USD','EUR','PLN','CZK','GBP'].filter(c => c !== base);
  const rates = {};
  CURRENCIES.forEach(cur => {
    const val = parseFloat(document.getElementById('rate_' + cur)?.value || 0);
    if (val > 0) rates[cur] = val;
  });
  _state.rates = rates;
  try {
    await colRef('finance_settings').doc('main').set({ rates }, { merge: true });
    const st = document.getElementById('ratesStatus');
    if (st) st.textContent = _tg('Збережено','Сохранено') + ' ' + new Date().toLocaleTimeString(window.getLocale ? window.getLocale() : 'uk-UA');
    if (typeof showToast === 'function') showToast(window.t('finRateSaved'), 'success');
  } catch(e) { if (typeof showToast === 'function') showToast(_tg('Помилка збереження: ','Ошибка сохранения: ') + e.message, 'error'); }
};

window._fetchRates = async function() {
  const base = _state.currency || 'EUR';
  const st = document.getElementById('ratesStatus');
  if (st) st.textContent = window.t('finLoading');
  try {
    // Використовуємо відкритий API без ключа
    let resp;
    // FIX: AbortController 8s timeout — публічні API можуть не відповідати
    const _mkFetch = (url) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
    };
    try {
      resp = await _mkFetch(`https://api.frankfurter.app/latest?from=${base}`);
    } catch(netErr) {
      // Fallback — exchangerate-api (без ключа, обмежений)
      resp = await _mkFetch(`https://open.er-api.com/v6/latest/${base}`);
    }
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    // frankfurter повертає rates як { USD: 1.08, UAH: 42.1, ... } — тобто скільки ІНОЗЕМНОЇ за 1 BASE
    // Нам потрібно зворотне: скільки BASE за 1 ІНОЗЕМНУ
    const CURRENCIES = ['UAH','USD','EUR','PLN','CZK','GBP'].filter(c => c !== base);
    CURRENCIES.forEach(cur => {
      const directRate = data.rates?.[cur]; // скільки cur за 1 base
      if (directRate && directRate > 0) {
        const inverseRate = 1 / directRate; // скільки base за 1 cur
        const input = document.getElementById('rate_' + cur);
        if (input) input.value = inverseRate.toFixed(4);
      }
    });
    if (st) st.textContent = `${window.t('ratesFrom')} ${data.date} (frankfurter.app)`;
  } catch(e) {
    if (st) st.textContent = window.t('ratesError') + ' ' + e.message;
    if (typeof showToast === 'function') showToast(window.t('ratesErrorManual'), 'warn');
  }
};

// Додавання категорії (parentId — якщо передано, то це підкатегорія)
window._financeAddCategory = function(type, parentId) {
  // Знімаємо старий модал
  const old = document.getElementById('finCatModal');
  if (old) old.remove();

  const isSubcat = !!parentId;
  const allCats = (window._financeState || window._state)?.categories?.[type] || [];
  const parentCat = parentId ? allCats.find(c => c.id === parentId) : null;
  const topLevelCats = allCats.filter(c => !c.parentId);

  const modal = document.createElement('div');
  modal.id = 'finCatModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';

  const isExpense = type === 'expense';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:14px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
      <div style="padding:1.1rem 1.25rem;border-bottom:1px solid #f3f4f6;font-size:0.95rem;font-weight:700;color:#1a1a1a;">
        ${isExpense ? window.t('newExpenseCategory') : window.t('newIncomeCategory')}
      </div>
      <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem;">

        <!-- Батьківська категорія (опційно) -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">
            ${_tg('Батьківська категорія','Родительская категория')}
          </label>
          <select id="finCatParent"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            <option value="">${_tg('— Верхній рівень (основна категорія)','— Верхний уровень (основная категория)')}</option>
            ${topLevelCats.map(c => `<option value="${c.id}" ${c.id === parentId ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${_tg('Назва *','Название *')}</label>
          <input id="finCatName" type="text" placeholder="${isExpense ? window.t('catPlaceholderExpense') : window.t('catPlaceholderIncome')}"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        ${isExpense ? `
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.5rem;">
            ${window.t('expenseTypeLabel')}
            <span title="${window.t('cogsTooltip')}" style="cursor:help;margin-left:3px;">ⓘ</span>
          </label>
          <div style="display:flex;gap:0.5rem;">
            <label style="flex:1;display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;background:#fff;" id="finCatTypeCogs">
              <input type="radio" name="finCatType" value="cogs" style="accent-color:#f97316;width:15px;height:15px;">
              <div>
                <div style="font-size:0.8rem;font-weight:600;color:#1a1a1a;">${window.t('cogsCategory')}</div>
                <div style="font-size:0.68rem;color:#9ca3af;">${window.t('cogsCategoryDesc')}</div>
              </div>
            </label>
            <label style="flex:1;display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;border:2px solid #22c55e;border-radius:8px;cursor:pointer;background:#f0fdf4;" id="finCatTypeOpex">
              <input type="radio" name="finCatType" value="opex" checked style="accent-color:#22c55e;width:15px;height:15px;">
              <div>
                <div style="font-size:0.8rem;font-weight:600;color:#1a1a1a;">${window.t('opexCategory')}</div>
                <div style="font-size:0.68rem;color:#9ca3af;">${window.t('opexCategoryDesc')}</div>
              </div>
            </label>
          </div>
        </div>` : ''}

        <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
          <button onclick="document.getElementById('finCatModal')?.remove()"
            style="flex:1;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:0.85rem;color:#6b7280;font-weight:500;">
            ${window.t('cancel')||'Скасувати'}
          </button>
          <button onclick="window._finCatSave('${type}')"
            style="flex:2;padding:0.6rem;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:0.85rem;font-weight:700;">
            ${window.t('addFinCategory')}
          </button>
        </div>

      </div>
    </div>`;

  // Підсвічування активного radio
  modal.querySelectorAll('input[name="finCatType"]').forEach(r => {
    r.addEventListener('change', () => {
      modal.querySelectorAll('label[id^="finCatType"]').forEach(l => {
        l.style.borderColor = '#e5e7eb';
        l.style.background = '#fff';
      });
      const active = modal.querySelector(`label[id="finCatType${r.value.charAt(0).toUpperCase()+r.value.slice(1)}"]`);
      if (active) { active.style.borderColor = '#22c55e'; active.style.background = '#f0fdf4'; }
    });
  });

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  setTimeout(() => { const n = document.getElementById('finCatName'); if (n) n.focus(); }, 80);
};

window._finCatSave = async function(type) {
  const name = document.getElementById('finCatName')?.value?.trim();
  if (!name) { if (typeof showToast === 'function') showToast(window.t('enterCategoryName'), 'warning'); return; }
  const costTypeEl = document.querySelector('input[name="finCatType"]:checked');
  const costType = costTypeEl ? costTypeEl.value : 'opex';
  try {
    const parentIdVal = document.getElementById('finCatParent')?.value || null;
    const catData = { name, type, system: false, icon: 'tag', createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    if (type === 'expense') catData.costType = costType;
    if (parentIdVal) catData.parentId = parentIdVal;
    const ref = await colRef('finance_categories').add(catData);
    _state.categories[type].push({ id: ref.id, name, type, system: false, costType: costType, ...(parentIdVal ? { parentId: parentIdVal } : {}) });
    document.getElementById('finCatModal')?.remove();
    renderSubTab('settings');
    if (typeof showToast === 'function') showToast(window.t('categoryAdded'), 'success');
  } catch(e) {
    if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
  }
};

// Видалення категорії
window._financeDeleteCategory = async function(catId, type) {
  const _catConfirmed = typeof showConfirmModal === 'function'
    ? await showConfirmModal(window.t('finDeleteCat'), { danger: true })
    : confirm(window.t('finDeleteCat'));
  if (!_catConfirmed) return;
  try {
    await colRef('finance_categories').doc(catId).delete();
    _state.categories[type] = _state.categories[type].filter(c => c.id !== catId);
    renderSubTab('settings');
  } catch(e) {
    if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
  }
};

// Додавання рахунку — кастомний модал (замість browser prompt)
window._financeAddAccount = function() {
  // Видаляємо старий модал
  const old = document.getElementById('finAddAccountModal');
  if (old) old.remove();

  const currencies = ['UAH','EUR','USD','PLN','GBP','CZK'];
  const accTypes   = ['bank','cash','card'];

  const modal = document.createElement('div');
  modal.id = 'finAddAccountModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.2);padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${_tg('Новий рахунок','Новый счёт')}</div>

      <div>
        <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${_tg('Назва рахунку','Название счёта')} *</label>
        <input id="faaName" type="text" placeholder="${_tg('Напр: Monobank, Готівка USD','Напр: Monobank, Наличные USD')}"
          style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;outline:none;"
          onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
      </div>

      <div style="display:flex;gap:0.75rem;">
        <div style="flex:1;">
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finCurrencyLbl')}</label>
          <select id="faaCurrency" style="width:100%;padding:0.55rem 0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${currencies.map(c => `<option value="${c}" ${(_state.currency||'UAH')===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;">
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${_tg('Тип','Тип')}</label>
          <select id="faaType" style="width:100%;padding:0.55rem 0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            <option value="bank">${_tg('Банк','Банк')}</option>
            <option value="cash">${_tg('Готівка','Наличные')}</option>
            <option value="card">${_tg('Картка','Карта')}</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
        <button onclick="document.getElementById('finAddAccountModal')?.remove()"
          style="flex:1;padding:0.65rem;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:0.85rem;color:#6b7280;font-weight:500;">
          ${window.t('cancel')}
        </button>
        <button id="faaSaveBtn" onclick="window._financeAddAccountSave()"
          style="flex:2;padding:0.65rem;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:0.85rem;font-weight:700;">
          ${window.t('finSave')}
        </button>
      </div>
    </div>
  `;

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  setTimeout(() => { const el = document.getElementById('faaName'); if (el) el.focus(); }, 100);
};

window._financeAddAccountSave = async function() {
  const nameEl = document.getElementById('faaName');
  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) {
    if (nameEl) { nameEl.style.borderColor = '#ef4444'; nameEl.focus(); }
    return;
  }
  const currency = (document.getElementById('faaCurrency')?.value || _state.currency || 'UAH').toUpperCase();
  const typeAcc  = document.getElementById('faaType')?.value || 'bank';

  const btn = document.getElementById('faaSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  try {
    const ref = await colRef('finance_accounts').add({
      name,
      type: typeAcc,
      currency,
      balance: 0,
      isDefault: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    _state.accounts.push({ id: ref.id, name, type: typeAcc, currency, balance: 0 });
    document.getElementById('finAddAccountModal')?.remove();
    renderSubTab('settings');
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = window.t('finSave'); }
    if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
  }
};

// ── AI (заглушка Етап 1) ──────────────────────────────────
// ── AI Аналітик фінансів — Етап 6 ───────────────────────
let _aiFinHistory = []; // локальна історія чату

function renderAI(el) {
  if (!isOwnerOrManager()) {
    el.innerHTML = ('<div style="text-align:center;color:#9ca3af;padding:2rem;">' + _tg('Доступ лише для Owner та Manager','Доступ только для Owner и Manager') + '</div>');
    return;
  }

  const quickBtns = [
    { label: window.t('finAIBtn1'), q: window.t('finAIQ1') },
    { label: window.t('finAIBtn2'), q: window.t('finAIQ2') },
    { label: window.t('finAIBtn3'), q: window.t('finAIQ3') },
    { label: window.t('finAIBtn4'), q: window.t('finAIQ4') },
  ];

  el.innerHTML = `
    <div style="width:100%;display:flex;flex-direction:column;gap:1rem;">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${window.t('finAITitle')}</div>
          <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.1rem;">${window.t('finAISubtitle')}</div>
        </div>
        <button onclick="window._aiFinClear()"
          style="padding:0.3rem 0.7rem;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;font-size:0.75rem;cursor:pointer;color:#6b7280;">
          ${window.t('finAIClear')}
        </button>
      </div>

      <!-- Quick buttons -->
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        ${quickBtns.map(b => `
          <button onclick="window._aiFinAsk(${JSON.stringify(b.q)})"
            style="padding:0.35rem 0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;
              border-radius:20px;font-size:0.78rem;cursor:pointer;font-weight:500;white-space:nowrap;">
            ${b.label}
          </button>
        `).join('')}
      </div>

      <!-- Chat area -->
      <div id="aiFinChat" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;
        min-height:300px;max-height:500px;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;">
        <div style="text-align:center;color:#9ca3af;font-size:0.82rem;margin:auto;">
          ${window.t('finAIEmptyHint')}
        </div>
      </div>

      <!-- Input -->
      <div style="display:flex;gap:0.5rem;">
        <input id="aiFinInput" type="text" placeholder="${window.t('finAIPlaceholder')}"
          onkeydown="if(event.key==='Enter')window._aiFinSend()"
          style="flex:1;padding:0.6rem 0.9rem;border:1px solid #e5e7eb;border-radius:10px;
            font-size:0.85rem;outline:none;">
        <button onclick="window._aiFinSend()"
          style="padding:0.6rem 1.2rem;background:#22c55e;color:#fff;border:none;border-radius:10px;
            font-size:0.85rem;font-weight:600;cursor:pointer;white-space:nowrap;">
          ${window.t('finAISend')}
        </button>
      </div>
    </div>
  `;
}

window._aiFinClear = function() {
  _aiFinHistory = [];
  const chat = document.getElementById('aiFinChat');
  if (chat) chat.innerHTML = '<div style="text-align:center;color:#9ca3af;font-size:0.82rem;margin:auto;">' + _tg('Чат очищено','Чат очищен') + '</div>';
};

window._aiFinAsk = function(question) {
  const inp = document.getElementById('aiFinInput');
  if (inp) inp.value = question;
  window._aiFinSend();
};

window._aiFinSend = async function() {
  const inp = document.getElementById('aiFinInput');
  const chat = document.getElementById('aiFinChat');
  if (!inp || !chat) return;

  const userText = inp.value.trim();
  if (!userText) return;
  inp.value = '';

  // Очищаємо плейсхолдер якщо є
  if (chat.children.length === 1 && chat.children[0].style.textAlign === 'center') {
    chat.innerHTML = '';
  }

  // Додаємо повідомлення юзера
  _appendAiMsg(chat, 'user', userText);
  _aiFinHistory.push({ role: 'user', content: userText });

  // Індикатор завантаження
  const loadEl = document.createElement('div');
  loadEl.id = 'aiFinLoading';
  loadEl.style.cssText = 'display:flex;align-items:center;gap:0.5rem;color:#9ca3af;font-size:0.82rem;';
  loadEl.innerHTML = `<div style="width:8px;height:8px;background:#22c55e;border-radius:50%;animation:pulse 1s infinite;"></div> AI аналізує дані...`;
  chat.appendChild(loadEl);
  chat.scrollTop = chat.scrollHeight;

  try {
    // Збираємо фінансові дані для контексту
    const context = await _buildAiFinContext();

    // Бенчмарки по нішах
    const BENCHMARKS = {
      construction:  { marginMin:12, marginMax:25, labourPct:35, adminPct:10, name:window.t('nicheConstSubc') },
      medical:       { marginMin:20, marginMax:45, labourPct:50, adminPct:12, name:window.t('nicheMedical') },
      dental:        { marginMin:25, marginMax:50, labourPct:45, adminPct:10, name:window.t('nicheDentistry') },
      beauty:        { marginMin:30, marginMax:55, labourPct:40, adminPct:8,  name:window.t('nicheBeauty') },
      furniture:     { marginMin:15, marginMax:35, labourPct:30, adminPct:8,  name:window.t('nicheFurn3') },
      retail:        { marginMin:10, marginMax:25, labourPct:20, adminPct:7,  name:window.t('nicheRetail') },
      it:            { marginMin:30, marginMax:60, labourPct:55, adminPct:10, name:'IT / Послуги' },
      manufacturing: { marginMin:12, marginMax:28, labourPct:32, adminPct:8,  name:_tg('Виробництво','Производство') },
    };
    const niche = _state.niche || 'general';
    const bench = BENCHMARKS[niche] || { marginMin:15, marginMax:35, labourPct:35, adminPct:10, name:window.t('nicheBusinessWord') };

    // FP1 benchmarks context for AI
    const fp1BenchContext = Object.entries(_FP1_BENCHMARKS).map(([k,b]) =>
      `- ${b.label()}: ${b.pctMin}–${b.pctMax}% від приходу`
    ).join('\n');

    const systemPrompt = `Ти стратегічний фінансовий аналітик для малого та середнього бізнесу.
Ніша клієнта: ${bench.name}. Регіон: ${_state.region==='EU'?window.t('europeWord'):window.t('ukraineWord')}. Валюта: ${_state.currency||'EUR'}.

БЕНЧМАРКИ НІШІ "${bench.name}":
- Нормальна маржа: ${bench.marginMin}–${bench.marginMax}%
- ФОП/зарплата від виручки: до ${bench.labourPct}%
- Адміністративні від виручки: до ${bench.adminPct}%

БЕНЧМАРКИ ФП №1 (розподіл витрат по 8 функціях):
${fp1BenchContext}
Якщо якась функція виходить за межі діапазону — це аномалія що потребує уваги.

ПОТОЧНІ ДАНІ КОМПАНІЇ:
${context}

АЛГОРИТМ АНАЛІЗУ (завжди дотримуйся):
1. ДІАГНОЗ — що відбувається з фінансами зараз (цифри)
2. ПРИЧИНА — чому саме так (порівняй з бенчмарками ніші)
3. НАСЛІДОК — до чого це призведе якщо не змінити
4. ДІЯ — конкретний крок власника на наступні 30 днів

ПРАВИЛА ВІДПОВІДІ:
- Завжди порівнюй маржу з бенчмарком ніші
- Якщо маржа нижче норми — шукай причину в конкретних категоріях витрат
- Якщо маржа вище норми — поясни чому і як утримати
- Давай числові прогнози (+/- скільки грошей від конкретної дії)
- Відповідай українською, коротко і по суті
- Формат: емодзі-маркери для кожного блоку (📊 Діагноз, 🔍 Причина, <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Наслідок, <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Дія)
- Максимум 4-5 речень на блок`;

    // Читаємо OpenAI ключ з settings/ai
    const sSnap = await getDb().collection('settings').doc('ai').get();
    const apiKey = sSnap.data()?.openaiApiKey || sSnap.data()?.apiKey || '';

    let aiText;
    try {
      aiText = await window.aiProxy({
        messages:     _aiFinHistory,
        systemPrompt: systemPrompt,
        model:        'gpt-4o-mini',
        maxTokens:    1000,
        module:       'finance',
      });
    } catch(proxyErr) {
      // fallback — пряме звернення якщо є ключ компанії
      if (!apiKey) throw proxyErr;
      const _oaiCtrl = new AbortController();
      const _oaiTimer = setTimeout(() => _oaiCtrl.abort(), 30000); // 30s для LLM
      let response;
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({
            model: 'gpt-4o-mini', max_tokens: 1000,
            messages: [{ role: 'system', content: systemPrompt }, ..._aiFinHistory]
          }),
          signal: _oaiCtrl.signal,
        });
      } finally { clearTimeout(_oaiTimer); }
      const data = await response.json();
      aiText = data.choices?.[0]?.message?.content || data.error?.message || window.t('failedGetResponse');
    }

    // Видаляємо індикатор
    const loadElDone = document.getElementById('aiFinLoading');
    if (loadElDone) loadElDone.remove();

    _appendAiMsg(chat, 'ai', aiText);
    _aiFinHistory.push({ role: 'assistant', content: aiText });

    // Зберігаємо в Firestore
    try {
      await colRef('finance_ai_history').add({
        question: userText,
        answer: aiText,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: _state.userId
      });
    } catch(e) { /* ігноруємо */ }

  } catch(e) {
    const loadElErr = document.getElementById('aiFinLoading');
    if (loadElErr) loadElErr.remove();
    _appendAiMsg(chat, 'error', window.t('errPfx2') + e.message);
  }

  chat.scrollTop = chat.scrollHeight;
};

function _appendAiMsg(chat, role, text) {
  const div = document.createElement('div');
  const isUser = role === 'user';
  const isError = role === 'error';

  div.style.cssText = `
    display:flex;
    justify-content:${isUser ? 'flex-end' : 'flex-start'};
  `;

  const bubble = document.createElement('div');
  bubble.style.cssText = `
    max-width:80%;
    padding:0.65rem 0.9rem;
    border-radius:${isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px'};
    font-size:0.82rem;
    line-height:1.55;
    white-space:pre-wrap;
    background:${isUser ? '#22c55e' : isError ? '#fef2f2' : '#f9fafb'};
    color:${isUser ? '#fff' : isError ? '#dc2626' : '#1a1a1a'};
    border:${isUser ? 'none' : '1px solid #e5e7eb'};
  `;
  bubble.textContent = text;
  div.appendChild(bubble);
  chat.appendChild(div);
}

async function _buildAiFinContext() {
  try {
    const now = new Date();

    // Завантажуємо профіль компанії
    let companyProfile = {};
    try {
      const compSnap = await getDb().collection('companies').doc(_state.companyId).get();
      if (compSnap.exists) companyProfile = compSnap.data();
    } catch(e) {}

    // Оновлюємо niche зі свіжих даних
    if (companyProfile.niche) _state.niche = companyProfile.niche;

    // Останні 3 місяці
    const from3m = firebase.firestore.Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth()-2, 1));
    const txSnap = await colRef('finance_transactions').where('date','>=',from3m).get();
    const txs = txSnap.docs.map(d => d.data());

    // Групуємо по місяцях
    const byMonth = {};
    txs.forEach(tx => {
      const d = tx.date?.toDate ? tx.date.toDate() : new Date();
      const mk = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
      if (!byMonth[mk]) byMonth[mk] = { income:0, expense:0, cats:{} };
      if (tx.type==='income')  byMonth[mk].income  += tx.amount||0;
      if (tx.type==='expense') {
        byMonth[mk].expense += tx.amount||0;
        const cn = tx.categoryName || tx.categoryId || window.t('finOther');
        byMonth[mk].cats[cn] = (byMonth[mk].cats[cn]||0) + (tx.amount||0);
      }
    });

    // Рахунки
    const accTotal = (_state.accounts||[]).reduce((s,a)=>s+(a.balance||0),0);

    // Динаміка маржі
    const months = Object.entries(byMonth).sort();
    const margins = months.map(([mk, d]) => ({
      month: mk,
      income: d.income,
      expense: d.expense,
      profit: d.income - d.expense,
      margin: d.income > 0 ? Math.round((d.income-d.expense)/d.income*100) : 0
    }));

    // Тренд — росте чи падає маржа
    let trendTxt = '—';
    if (margins.length >= 2) {
      const last = margins[margins.length-1].margin;
      const prev = margins[margins.length-2].margin;
      const diff = last - prev;
      trendTxt = diff > 0 ? `↑ +${diff}% vs попередній місяць` : diff < 0 ? `↓ ${diff}% vs попередній місяць` : window.t('noChange');
    }

    // Бюджет поточного місяця
    const curMonth = new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0');
    let budgetCtx = '';
    try {
      const budSnap = await colRef('finance_budgets').doc(curMonth).get();
      if (budSnap.exists) {
        const bd = budSnap.data();
        const expCats = _state.categories.expense || [];
        let totalBudg = 0, totalFact = 0;
        expCats.forEach(cat => {
          const budVal = bd['cat_'+cat.id] || 0;
          const factVal = (byMonth[curMonth]?.cats[cat.name] || 0);
          if (budVal > 0) { totalBudg += budVal; totalFact += factVal; }
        });
        if (totalBudg > 0) {
          const budExec = Math.round(totalFact/totalBudg*100);
          budgetCtx = `
${window.t('finBudgetCtx').replace('{month}',curMonth).replace('{plan}',totalBudg).replace('{fact}',totalFact).replace('{pct}',budExec)}`;
          if (bd.goal) budgetCtx += `, ціль прибутку=${bd.goal}`;
        }
      }
    } catch(e) {}

    let ctx = `ЗАГАЛЬНИЙ БАЛАНС РАХУНКІВ: ${accTotal} ${_state.currency||'EUR'}
`;
    ctx += `ТРЕНД МАРЖІ: ${trendTxt}
${budgetCtx}
`;
    ctx += `
P&L ПО МІСЯЦЯХ (останні 3, від нового до старого):
`;

    margins.reverse().forEach(d => {
      ctx += `
${d.month}: дохід=${d.income}, витрати=${d.expense}, прибуток=${d.profit}, маржа=${d.margin}%
`;
      const topCats = Object.entries(byMonth[d.month]?.cats||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);
      if (topCats.length) ctx += `  Топ витрати: ${topCats.map(([k,v])=>`${k}=${v}`).join(', ')}
`;
    });

    // Рахунки окремо
    if (_state.accounts?.length) {
      ctx += `
РАХУНКИ:
`;
      _state.accounts.forEach(a => { ctx += `  ${a.name}: ${a.balance||0} ${_state.currency||'EUR'}
`; });
    }

    // Стратегічний профіль компанії
    if (companyProfile.companyGoal || companyProfile.companyConcept || companyProfile.companyIdeal) {
      ctx += `\nСТРАТЕГІЧНИЙ ПРОФІЛЬ КОМПАНІЇ:\n`;
      if (companyProfile.companyGoal)    ctx += `Мета: ${companyProfile.companyGoal}\n`;
      if (companyProfile.companyConcept) ctx += `Задум: ${companyProfile.companyConcept}\n`;
      if (companyProfile.companyCKP)     ctx += `ЦКП: ${companyProfile.companyCKP}\n`;
      if (companyProfile.companyIdeal)   ctx += `Ідеальна картина: ${companyProfile.companyIdeal}\n`;
    }

    return ctx;
  } catch(e) {
    return window.t('dataUnavailable') + ' ' + e.message;
  }
}

// ── Форма додавання транзакції — Етап 2 ─────────────────
function addTransaction(forceType) {
  // Видаляємо старий модал якщо є
  const old = document.getElementById('financeModal');
  if (old) old.remove();

  const type     = forceType || (_state.activeSubTab === 'income' ? 'income' : 'expense');
  const cats     = _state.categories[type] || [];
  const today    = new Date().toISOString().split('T')[0];
  const color    = type === 'income' ? '#22c55e' : '#ef4444';
  const label    = type === 'income' ? window.t('incomeWordLc') : window.t('finExpenseWordLc');

  // Функції для прив'язки — глобальний functions[] + fallback до _state.functions
  const _finFunctions = (typeof functions !== 'undefined' && functions.length > 0)
      ? functions
      : (_state.functions || []);
  let functionsHtml = `<option value="">— ${window.t ? window.t('select') || 'не вибрано' : 'не вибрано'} —</option>`;
  _finFunctions.filter(f => f.status !== 'archived').forEach(f => {
    functionsHtml += `<option value="${f.id}">${escHtml(f.name)}</option>`;
  });

  // Проекти для прив'язки — використовуємо глобальний projects[]
  const _finProjects = (typeof projects !== 'undefined' ? projects : (window.projects || []));
  let projectsHtml = `<option value="">— ${window.t ? window.t('select') || 'не вибрано' : 'не вибрано'} —</option>`;
  _finProjects.filter(p => p.status !== 'archived').forEach(p => {
    projectsHtml += `<option value="${p.id}">${escHtml(p.name || p.title || p.id)}</option>`;
  });

  const modal = document.createElement('div');
  modal.id = 'financeModal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;
    display:flex;align-items:center;justify-content:center;padding:1rem;
  `;

  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f3f4f6;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">
          ${window.t('finAddBtn')} ${label}
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button id="fmTabIncome" onclick="window._financeModalSwitchType('income')"
            style="padding:0.3rem 0.75rem;border-radius:6px;border:none;cursor:pointer;font-size:0.8rem;font-weight:600;
            background:${type==='income'?'#22c55e':'#f3f4f6'};color:${type==='income'?'#fff':'#6b7280'};">
            ${window.t('finIncome2')}
          </button>
          <button id="fmTabExpense" onclick="window._financeModalSwitchType('expense')"
            style="padding:0.3rem 0.75rem;border-radius:6px;border:none;cursor:pointer;font-size:0.8rem;font-weight:600;
            background:${type==='expense'?'#ef4444':'#f3f4f6'};color:${type==='expense'?'#fff':'#6b7280'};">
            ${window.t('finExpense2')||'Витрата'}
          </button>
          <button onclick="document.getElementById('financeModal')?.remove()"
            style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:0.25rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <div style="padding:1.25rem 1.5rem;display:flex;flex-direction:column;gap:1rem;">

        <!-- Сума + валюта -->
        <div style="display:flex;gap:0.5rem;">
          <div style="flex:1;">
            <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finAmountLbl')} *</label>
            <input id="fmAmount" type="number" min="0" step="0.01" placeholder="0.00"
              style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;box-sizing:border-box;outline:none;"
              onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'"
              oninput="window._updateCurrencyHint()">
          </div>
          <div style="width:90px;">
            <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finCurrencyLbl')||'Валюта'}</label>
            <select id="fmCurrency" onchange="window._updateCurrencyHint()"
              style="width:100%;padding:0.55rem 0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
              ${['EUR','USD','UAH','PLN','GBP','CZK'].map(cur =>
                `<option value="${cur}" ${_state.currency===cur?'selected':''}>${cur}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <!-- Підказка конвертації -->
        <div id="fmCurrencyHint" style="font-size:0.72rem;color:#6b7280;margin-top:-8px;margin-bottom:4px;min-height:16px;"></div>

        <!-- Категорія + Підкатегорія -->
        <div id="fmCatWrap">
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finCategoryLbl')} *</label>
          <select id="fmCategory"
            onchange="window._finToggleStaffBlock(this.value); window._finUpdateSubcategory(this.value, '${type}')"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            <option value="">${window.t('finSelectCategory')||'— Оберіть категорію —'}</option>
            ${cats.filter(c => !c.parentId).map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('')}
          </select>
        </div>
        <!-- Підкатегорія (з'являється після вибору категорії) -->
        <div id="fmSubCatWrap" style="display:none;">
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finSubcategoryLbl')||'Підкатегорія'}</label>
          <select id="fmSubcategory"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            <option value="">${window.t('finSelectSubcategory')||'— Оберіть підкатегорію —'}</option>
          </select>
        </div>

        <!-- Дата -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finDateLbl')||'Дата'} *</label>
          <input id="fmDate" type="date" value="${today}"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Рахунок -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finAccountLbl')||'Рахунок'}</label>
          <select id="fmAccount"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${_state.accounts.map(a => `<option value="${a.id}" ${a.isDefault?'selected':''}>${escHtml(a.name)} (${a.currency})</option>`).join('')}
          </select>
        </div>

        <!-- Контрагент -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finCounterpartyLbl')||'Контрагент'}</label>
          <input id="fmCounterparty" type="text" placeholder=${window.t('supplierClientPh')}
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Функція -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finFunctionLbl')}</label>
          <select id="fmFunction"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${functionsHtml}
          </select>
        </div>

        <!-- Проект -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finProjectLbl')||'Проект'} / ${window.t('finObjectLbl')||"Об'єкт"}</label>
          <select id="fmProject"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${projectsHtml}
          </select>
        </div>

        <!-- Виплата персоналу — показується тільки для категорій зарплати -->
        <div id="fmStaffBlock" style="display:none;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:0.85rem;gap:0.65rem;flex-direction:column;">
          <div style="font-size:0.75rem;font-weight:700;color:#7c3aed;margin-bottom:0.1rem;">👤 Виплата персоналу</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Працівник</label>
              <select id="fmStaffId" style="width:100%;padding:0.45rem 0.6rem;border:1px solid #ddd6fe;border-radius:7px;font-size:0.82rem;background:#fff;">
                <option value="">— не вказано —</option>
                ${(typeof users !== 'undefined' ? users : []).map(u =>
                  `<option value="${u.id}">${(u.name || u.email || u.id).replace(/</g,'&lt;')}</option>`
                ).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Тип виплати</label>
              <select id="fmPaymentType" style="width:100%;padding:0.45rem 0.6rem;border:1px solid #ddd6fe;border-radius:7px;font-size:0.82rem;background:#fff;">
                <option value="">— не вказано —</option>
                <option value="advance">Аванс</option>
                <option value="salary">Зарплата</option>
                <option value="bonus">Бонус</option>
                <option value="other">Інше</option>
              </select>
            </div>
          </div>
          <div>
            <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Вид робіт</label>
            <input id="fmWorkType" type="text" placeholder="Наприклад: кровля, бетон, фасад, монтаж..."
              style="width:100%;padding:0.45rem 0.6rem;border:1px solid #ddd6fe;border-radius:7px;font-size:0.82rem;box-sizing:border-box;">
          </div>
        </div>

        <!-- Дата нарахування (для P&L) -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">
            ${window.t('finAccrualDateLbl')||'Дата нарахування'} (${window.t('forPnL')||'для P&L'})
            <span title="${window.t('finAccrualDateHint')||'Якщо відрізняється від дати оплати. Cash Flow = дата оплати, P&L = дата нарахування.'}"
              style="cursor:help;margin-left:4px;color:#9ca3af;">ⓘ</span>
          </label>
          <input id="fmAccrualDate" type="date" value=""
            placeholder="${window.t('finAccrualDatePh')||'Залиште порожнім якщо збігається з датою оплати'}"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;color:#6b7280;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
          <div style="font-size:0.7rem;color:#9ca3af;margin-top:3px;">${window.t('finAccrualDatePh')||'Залиште порожнім якщо збігається з датою оплати'}</div>
        </div>

        <!-- Коментар -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">${window.t('finCommentLbl')||'Коментар'}</label>
          <input id="fmDescription" type="text" placeholder="${window.t('finPurposePh')||'Призначення платежу'}"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Кнопки -->
        <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
          <button onclick="document.getElementById('financeModal')?.remove()"
            style="flex:1;padding:0.65rem;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:0.85rem;color:#6b7280;font-weight:500;">
            ${window.t('cancel')||'Скасувати'}
          </button>
          <button id="fmSaveBtn" onclick="window._financeSaveTx()"
            style="flex:2;padding:0.65rem;border:none;border-radius:8px;background:${color};color:#fff;cursor:pointer;font-size:0.85rem;font-weight:700;">
            ${window.t('finSave')}
          </button>
        </div>

      </div>
    </div>
  `;

  // FIX: Очищення event listener при закритті (захист від memory leak)
  const handleModalClick = (e) => {
    if (e.target === modal) {
      modal.removeEventListener('click', handleModalClick);
      modal.remove();
    }
  };

  modal.addEventListener('click', handleModalClick);
  document.body.appendChild(modal);
  setTimeout(() => { const a = document.getElementById('fmAmount'); if (a) a.focus(); }, 100);

  // Зберігаємо поточний тип у data-атрибуті
  modal.dataset.type = type;
}

// Показуємо/приховуємо блок "Виплата персоналу" залежно від категорії
// Оновлення підкатегорій при виборі категорії
window._finUpdateSubcategory = function(catId, type) {
  const wrap = document.getElementById('fmSubCatWrap');
  const sel  = document.getElementById('fmSubcategory');
  if (!wrap || !sel) return;

  if (!catId) { wrap.style.display = 'none'; return; }

  const allCats = (window._financeState || window._state)?.categories?.[type] || [];
  const subcats = allCats.filter(c => c.parentId === catId);

  if (subcats.length === 0) {
    wrap.style.display = 'none';
    sel.value = '';
    return;
  }

  sel.innerHTML = `<option value="">— ${window.t('finSelectSubcategory')||'Оберіть підкатегорію'} —</option>` +
    subcats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  wrap.style.display = 'block';
};

window._finToggleStaffBlock = function(catId) {
  const block = document.getElementById('fmStaffBlock');
  if (!block) return;
  // Показуємо якщо обрана категорія зарплати або виплат
  const cats = (window._financeState || window._state)?.categories?.expense || [];
  const cat = cats.find(c => c.id === catId);
  const isSalaryCat = catId === 'exp_salary' || catId === 'salary'
    || (cat?.name && /зарплат|виплат|salary|payroll|оплат праці/i.test(cat.name));
  block.style.display = isSalaryCat ? 'flex' : 'none';
};

// Перемикання типу в модалі
window._financeModalSwitchType = function(type) {
  const modal = document.getElementById('financeModal');
  if (!modal) return;
  modal.remove();
  addTransaction(type);
};

// Збереження транзакції
window._financeSaveTx = async function() {
  const modal   = document.getElementById('financeModal');
  if (!modal) return;
  const type    = modal.dataset.type || 'expense';

  const amount  = parseFloat(document.getElementById('fmAmount')?.value);
  const catId   = document.getElementById('fmCategory')?.value;
  const dateVal = document.getElementById('fmDate')?.value;

  // Валідація
  if (!amount || amount <= 0) { if (typeof showToast === 'function') showToast(window.t('finTransferAmount'), 'warning'); return; }
  if (!catId)                 { if (typeof showToast === 'function') showToast(window.t('finSelectCategory'), 'warning'); return; }
  if (!dateVal)               { if (typeof showToast === 'function') showToast(window.t('finSelectDate'), 'warning'); return; }

  const btn = document.getElementById('fmSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = _tg('Збереження...','Сохранение...'); }

  try {
    const db = getDb();
    const date = firebase.firestore.Timestamp.fromDate(new Date(dateVal));
    const accId = document.getElementById('fmAccount')?.value || _state.accounts[0]?.id || '';
    const funcId = document.getElementById('fmFunction')?.value || null;
    const projId = document.getElementById('fmProject')?.value  || null;
    const desc   = document.getElementById('fmDescription')?.value?.trim() || '';
    const counter= document.getElementById('fmCounterparty')?.value?.trim() || '';
    const currency = document.getElementById('fmCurrency')?.value || _state.currency;
    const accrualVal = document.getElementById('fmAccrualDate')?.value || '';

    // Виплата персоналу — збираємо тільки якщо блок видимий
    const staffBlock = document.getElementById('fmStaffBlock');
    const isStaffVisible = staffBlock && staffBlock.style.display !== 'none';
    const staffId    = isStaffVisible ? (document.getElementById('fmStaffId')?.value || null) : null;
    const paymentType= isStaffVisible ? (document.getElementById('fmPaymentType')?.value || null) : null;
    const workType   = isStaffVisible ? (document.getElementById('fmWorkType')?.value?.trim() || null) : null;
    // Ім'я працівника для швидкого відображення без join
    const staffName  = staffId
      ? ((typeof users !== 'undefined' ? users : []).find(u => u.id === staffId)?.name || null)
      : null;

    const subcatId = document.getElementById('fmSubcategory')?.value || null;
    const txData = {
      type,
      amount,
      currency,
      amountBase: toBase(amount, currency),
      categoryId:   catId,
      ...(subcatId ? { subcategoryId: subcatId } : {}),
      date,
      accrualDate:  accrualVal
        ? firebase.firestore.Timestamp.fromDate(new Date(accrualVal))
        : date,
      accountId:    accId,
      functionId:   funcId,
      projectId:    projId,
      description:  desc,
      counterparty: counter,
      // Виплата персоналу
      ...(staffId    ? { staffId }    : {}),
      ...(staffName  ? { staffName }  : {}),
      ...(paymentType? { paymentType }: {}),
      ...(workType   ? { workType }   : {}),
      createdBy:    _state.currentUser.uid,
      createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
      recurring:    false,
    };

    // Прибираємо null поля
    Object.keys(txData).forEach(k => { if (txData[k] === null || txData[k] === '') delete txData[k]; });

    // FIX BS: атомарно зберігаємо транзакцію + оновлюємо баланс (batch)
    // Якщо будь-яка операція впаде — жодна не виконається
    const baseAmount = toBase(amount, currency);
    const delta = type === 'income' ? baseAmount : -baseAmount;
    const accRef2 = colRef('finance_accounts').doc(accId);
    const txRef = colRef('finance_transactions').doc(); // генеруємо ID заздалегідь

    const saveBatch = getDb().batch();
    saveBatch.set(txRef, txData);
    saveBatch.update(accRef2, { balance: firebase.firestore.FieldValue.increment(delta) });
    await saveBatch.commit();

    // Оновлюємо локальний стан рахунків
    const acc = _state.accounts.find(a => a.id === accId);
    if (acc) acc.balance = (acc.balance || 0) + delta;

    modal.remove();

    // Перевірка бюджету після запису витрати
    if (type === 'expense' && catId) {
      _checkBudgetAlert(catId, dateVal).catch(() => {});
    }

    // Оновлюємо поточну вкладку
    const inner = document.getElementById('financeContentInner');
    if (inner) renderSubTab(_state.activeSubTab);

  } catch(e) {
    console.error('[Finance] saveTx error:', e);
    if (typeof showToast === 'function') showToast(_tg('Помилка збереження: ','Ошибка сохранения: ') + e.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = window.t('finSave'); }
  }
};

// Видалення транзакції
window._financeDeleteTx = async function(txId, type) {
  const _txConfirmed = typeof showConfirmModal === 'function'
    ? await showConfirmModal(window.t('finDeleteTx'), { danger: true })
    : confirm(window.t('finDeleteTx'));
  if (!_txConfirmed) return;
  try {
    const snap = await colRef('finance_transactions').doc(txId).get();
    if (!snap.exists) return;
    const tx = snap.data();

    // Атомарно: видаляємо транзакцію + відкатуємо баланс через batch
    if (tx.accountId && tx.amount) {
      const baseAmt = txAmt(tx);
      const delta = tx.type === 'income' ? -baseAmt : baseAmt;
      const delBatch = getDb().batch();
      delBatch.delete(colRef('finance_transactions').doc(txId));
      delBatch.update(colRef('finance_accounts').doc(tx.accountId), {
        balance: firebase.firestore.FieldValue.increment(delta)
      });
      await delBatch.commit();
      const acc = _state.accounts.find(a => a.id === tx.accountId);
      if (acc) acc.balance = (acc.balance || 0) + delta;
    } else {
      await colRef('finance_transactions').doc(txId).delete();
    }

    // Оновлюємо список
    const inner = document.getElementById('financeContentInner');
    if (inner) renderSubTab(_state.activeSubTab);

  } catch(e) {
    console.error('[Finance] deleteTx error:', e);
    if (typeof showToast === 'function') showToast(_tg('Помилка видалення: ','Ошибка удаления: ') + e.message, 'error');
  }
};

// ── Визначення ролі користувача ──────────────────────────
async function detectUserRole() {
  // Спочатку — з window.currentUserData (вже є в системі після логіну)
  if (window.currentUserData && window.currentUserData.role) {
    _state.userRole = window.currentUserData.role;
    return;
  }
  // Fallback — читаємо з Firestore
  const db = getDb();
  if (!db || !_state.companyId || !_state.currentUser) return;
  try {
    const snap = await window.companyRef()
      .collection('users').doc(_state.currentUser.uid).get();
    if (snap.exists && snap.data()?.role) {
      _state.userRole = snap.data()?.role;
      return;
    }
    // Перевіряємо чи owner через компанію
    const cSnap = await window.companyRef().get();
    if (cSnap.exists && cSnap.data()?.ownerId === _state.currentUser.uid) {
      _state.userRole = 'owner';
    } else {
      _state.userRole = 'employee';
    }
  } catch(e) {
    // Якщо є currentUserData без role — owner за замовчуванням для безпеки UI
    _state.userRole = window.currentUserData?.role || 'owner';
  }
}

// ── Визначення регіону та валюти ─────────────────────────
async function detectRegionAndCurrency() {
  const db = getDb();
  if (!db || !_state.companyId) return;
  try {
    const snap = await window.companyRef()
      .collection('finance_settings').doc('main').get();
    if (snap.exists) {
      _state.region   = snap.data()?.region   || 'EU';
      _state.currency = snap.data()?.currency || 'EUR';
      _state.niche    = snap.data()?.niche    || null;
      _state.rates    = snap.data()?.rates    || {};
    } else {
      const cSnap = await window.companyRef().get();
      if (cSnap.exists) {
        _state.region   = cSnap.data()?.region   || 'EU';
        _state.currency = cSnap.data()?.currency || 'EUR';
        _state.niche    = cSnap.data()?.niche    || null;
      }
      _state.rates = {};
    }
  } catch(e) { /* defaults OK */ }
}

// ── Конвертація в базову валюту ───────────────────────────
// toBase(amount, fromCurrency) -> сума в базовій валюті (_state.currency)
function toBase(amount, fromCur) {
  const base = _state.currency || 'EUR';
  if (!fromCur || fromCur === base) return amount;
  const rates = _state.rates || {};
  // rates зберігаються як { USD: 1.08, UAH: 0.024, PLN: 0.23 } — ціна 1 одиниці в базовій
  const rate = rates[fromCur];
  if (!rate || rate <= 0) return amount; // якщо курс невідомий — не конвертуємо
  return amount * rate;
}

// txAmt(tx) — повертає суму в базовій валюті для аналітики/дашборду
function txAmt(tx) {
  if (tx.amountBase != null) return tx.amountBase;
  return toBase(tx.amount || 0, tx.currency);
}

// ── Показати кнопку в навігації ──────────────────────────
function showNavButton() {
  const btn = document.getElementById('financeNavBtn');
  if (btn) btn.style.display = '';
}

// ── Головна ініціалізація ─────────────────────────────────
async function initFinance(companyId, currentUser) {
  if (_state.initialized && _state.companyId === companyId) return;

  _state.companyId   = companyId;
  _state.currentUser = currentUser;
  _state.initialized = false;

  try {
    await detectUserRole();
    await detectRegionAndCurrency();
    await initFirestoreCollections();
    await loadAccounts();
    await loadCategories();
    await _loadRecurring();
    await _loadInvoices();
    await _loadFunctionsCache();

    // Автосписання — якщо сьогодні збігається день платежу
    _processRecurringAutopost().catch(e => console.warn('[Recurring autopost]', e));

    showNavButton();
    _state.initialized = true;
    console.log(`[Finance v${FINANCE_VERSION}] Ready | role:${_state.userRole} | region:${_state.region} | currency:${_state.currency}`);
  } catch(e) {
    console.error('[Finance] initFinance error:', e);
  }
}

// ── Публічний API ─────────────────────────────────────────
window._financeTab = function(tab) {
  renderSubTab(tab);
};

// Публічний доступ до транзакцій для метрик — без додаткових запитів до Firestore
window._financeGetTxForPeriod = function(periodKey, freq) {
  // periodKey: 'YYYY-MM' (monthly) | 'YYYY-Www' (weekly) | 'YYYY-MM-DD' (daily)
  if (!window._financeTxCache) return null;
  return window._financeTxCache.filter(tx => {
    const d = tx.date?.toDate ? tx.date.toDate() : tx.date ? new Date(tx.date) : null;
    if (!d) return false;
    if (freq === 'daily') {
      return d.toISOString().split('T')[0] === periodKey;
    }
    if (freq === 'weekly') {
      // periodKey формат 'YYYY-Www'
      const getWeekKey = (dt) => {
        const d2 = new Date(dt); d2.setHours(0,0,0,0);
        d2.setDate(d2.getDate() + 4 - (d2.getDay() || 7));
        const y = d2.getFullYear();
        const w = Math.ceil(((d2 - new Date(y,0,1)) / 86400000 + 1) / 7);
        return y + '-W' + String(w).padStart(2,'0');
      };
      return getWeekKey(d) === periodKey;
    }
    // monthly: YYYY-MM
    return d.toISOString().slice(0, 7) === periodKey;
  });
};

window._updateCurrencyHint = function() {
  const hint = document.getElementById('fmCurrencyHint');
  if (!hint) return;
  const cur = document.getElementById('fmCurrency')?.value;
  const amt = parseFloat(document.getElementById('fmAmount')?.value || 0);
  const base = _state.currency || 'EUR';
  if (!cur || cur === base || !amt) { hint.textContent = ''; return; }
  const converted = toBase(amt, cur);
  const rates = _state.rates || {};
  if (!rates[cur]) {
    hint.innerHTML = `<span style="color:#f59e0b;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${window.t('finRateNotSet').replace('{cur}', cur)}</span>`;
  } else {
    hint.textContent = `≈ ${converted.toFixed(2)} ${base} (курс: 1 ${cur} = ${rates[cur]} ${base})`;
  }
};

// Завантажує транзакції поточного місяця в кеш без відображення UI
// Викликається з 66-statistics.js коли фінанси ще не відкривались
window._financeEnsureLoaded = async function() {
  if (!_state.initialized || !_state.companyId) return;
  if (window._financeTxCache && window._financeTxCache.length > 0) return; // вже є
  // Loading lock — запобігає паралельним Firestore reads при кількох одночасних викликах
  if (window._financeEnsureLoadedInProgress) return;
  window._financeEnsureLoadedInProgress = true;
  try {
    const now = new Date();
    const from = firebase.firestore.Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const to   = firebase.firestore.Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));
    const snap = await colRef('finance_transactions')
      .where('date', '>=', from).where('date', '<=', to).limit(500).get();
    window._financeTxCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { /* тихо — не критично */ }
  finally { window._financeEnsureLoadedInProgress = false; }
};

window._financeAddTransaction = function(type) {
  addTransaction(type || (_state.activeSubTab === 'income' ? 'income' : 'expense'));
};

window._txFilterChange = function(field, value, type) {
  _txFilter[field] = value;
  loadAndRenderTxList(type);
};

// Каскадний фільтр: вибір основної категорії → оновлює підкатегорії
window._txFilterCatChange = function(catId, type) {
  _txFilter.categoryId = catId;
  _txFilter.subcategoryId = ''; // скидаємо підкатегорію

  const subSel = document.getElementById('txFilterSubCat');
  if (!subSel) { loadAndRenderTxList(type); return; }

  const cats = _state.categories[type] || [];
  const subcats = catId ? cats.filter(c => c.parentId === catId) : [];

  if (subcats.length === 0) {
    subSel.style.display = 'none';
    subSel.value = '';
  } else {
    subSel.innerHTML = `<option value="">${_tg('Всі підкатегорії','Все подкатегории')}</option>` +
      subcats.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    subSel.style.display = '';
  }
  loadAndRenderTxList(type);
};

// ── Фінанси в картці проекту ──────────────────────────────
window._renderProjectFinance = async function(projectId, el, opts) {
  // opts: { mode: 'project'|'function', id: string, label: string }
  const mode = opts?.mode || 'project';
  const entityId = opts?.id || projectId;
  const filterField = mode === 'function' ? 'functionId' : 'projectId';

  if (!entityId || !el) return;
  el.innerHTML = `<div style="text-align:center;color:#9ca3af;padding:2rem;">${window.t('finLoading')}</div>`;

  try {
    const db = getDb();
    const companyId = _state.companyId || window.currentCompanyId || window._companyId;
    if (!db || !companyId) { el.innerHTML = `<div style="padding:2rem;color:#ef4444;">${window.t('finModuleNotReady')}</div>`; return; }

    const snap = await db.collection('companies').doc(companyId)
      .collection('finance_transactions')
      .where(filterField, '==', entityId)
      .get(); // orderBy на клієнті нижче

    const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const currency = _state.currency || 'EUR';

    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    const profit  = income - expense;
    const margin  = income > 0 ? Math.round(profit / income * 100) : 0;

    el.innerHTML = `
      <div style="padding:4px 0;">

        <!-- KPI -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;">
          ${[
            { label: window.t('finTransactionIncome'), val: fmt(income, currency), color: '#22c55e' },
            { label: window.t('finTabExpense'),  val: fmt(expense, currency), color: '#ef4444' },
            { label: window.t('finProfit'), val: fmt(profit, currency),  color: profit >= 0 ? '#16a34a' : '#ef4444' },
            { label: window.t('finMargin'),    val: margin + '%',           color: margin >= 20 ? '#22c55e' : margin >= 0 ? '#f59e0b' : '#ef4444' },
          ].map(k => `
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;">
              <div style="font-size:0.72rem;color:#6b7280;margin-bottom:3px;">${k.label}</div>
              <div style="font-size:1.2rem;font-weight:700;color:${k.color};">${k.val}</div>
            </div>`).join('')}
        </div>

        <!-- Кнопки додати -->
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button onclick="window._addEntityTx('${entityId}','${filterField}','income')"
            style="background:#22c55e;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:0.82rem;font-weight:600;cursor:pointer;">${window.t('finAddIncome') || '+ ' + window.t('finTransactionIncome')}</button>
          <button onclick="window._addEntityTx('${entityId}','${filterField}','expense')"
            style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:0.82rem;font-weight:600;cursor:pointer;">${window.t('finAddExpense') || '+ ' + window.t('finTransactionExpense')}</button>
        </div>

        <!-- Список транзакцій -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          ${txs.length === 0
            ? '<div style="text-align:center;padding:32px;color:#9ca3af;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><div>Транзакцій по проекту ще немає</div></div>'
            : txs.map((tx, i) => {
                const isIncome = tx.type === 'income';
                const dateStr = tx.date ? fmtDate(tx.date) : '—';
                return `
                  ${i > 0 ? '<div style="border-top:1px solid #f3f4f6;"></div>' : ''}
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;flex-wrap:wrap;">
                    <div style="width:8px;height:8px;border-radius:50%;background:${isIncome ? '#22c55e' : '#ef4444'};flex-shrink:0;"></div>
                    <div style="flex:1;min-width:100px;">
                      <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">${escHtml(tx.description || tx.counterparty || (isIncome ? window.t('finTransactionIncome') : window.t('finTransactionExpense')))}</div>
                      <div style="font-size:0.72rem;color:#9ca3af;">${dateStr}${tx.categoryName ? ' · ' + escHtml(tx.categoryName) : ''}</div>
                    </div>
                    <div style="font-size:0.95rem;font-weight:700;color:${isIncome ? '#22c55e' : '#ef4444'};">
                      ${isIncome ? '+' : '−'}${fmt(tx.amount, tx.currency || currency)}
                    </div>
                  </div>`;
              }).join('')
          }
        </div>
      </div>`;
  } catch(e) {
    console.error('[ProjectFinance]', e);
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;">${_tg('Помилка:','Ошибка:')} ${escHtml(e.message)}</div>`;
  }
};

// Відкрити форму додавання транзакції з прив'язкою до проекту або функції
window._addProjectTx = function(projectId, type) {
  window._addEntityTx(projectId, 'projectId', type);
};

window._addEntityTx = function(entityId, field, type) {
  addTransaction(type);
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (field === 'projectId') {
        const sel = document.getElementById('fmProject');
        if (sel) sel.value = entityId;
      } else if (field === 'functionId') {
        const sel = document.getElementById('fmFunction');
        if (sel) sel.value = entityId;
      }
    }, 150);
  });
};

// ── CRM інтеграція: угода → авто-транзакція доходу ────────
(function _setupCrmIntegration() {
  // Підписуємось після завантаження event-bus
  function _subscribe() {
    if (typeof window.onTalkoEvent !== 'function' || typeof window.TALKO_EVENTS === 'undefined') return false;

    window.onTalkoEvent(window.TALKO_EVENTS.DEAL_STAGE_CHANGED, async function(event) {
      const p = event.payload || event;
      // Тільки коли угода переходить в 'won' і є сума
      if (p.toStage !== 'won') return;
      if (!p.amount || p.amount <= 0) return;

      const companyId = _state.companyId || window.currentCompanyId || window._companyId;
      const db = getDb();
      if (!db || !companyId) return;

      // Захист від дублювання — перевіряємо чи вже є транзакція по цій угоді
      try {
        const existing = await db.collection('companies').doc(companyId)
          .collection('finance_transactions')
          .where('crmDealId', '==', p.dealId)
          .limit(1).get();
        if (!existing.empty) return; // вже є
      } catch(e) { /* індекс ще не готовий — пропускаємо перевірку */ }

      // Знаходимо категорію "Продаж послуг" або першу income-категорію
      const cats = _state.categories?.income || [];
      const defCat = cats.find(c => /продаж|sale|service|послуг/i.test(c.name)) || cats[0];

      // Знаходимо дефолтний рахунок
      const defAcc = _state.accounts?.find(a => a.isDefault) || _state.accounts?.[0];

      const tx = {
        type:          'income',
        amount:        parseFloat(p.amount) || 0,
        currency:      p.currency || _state.currency || 'EUR', // deal currency priority
        date:          firebase.firestore.Timestamp.now(),
        description:   `CRM: ${p.clientName || _tg('Угода','Сделка')} — ${_tg('оплата','оплата')}`,
        counterparty:  p.clientName || '',
        categoryId:    defCat?.id   || null,
        categoryName:  defCat?.name || _tg('Продаж послуг','Продажа услуг'),
        accountId:     defAcc?.id   || null,
        projectId:     p.projectId  || null,
        crmDealId:     p.dealId     || null,   // для захисту від дублювання
        source:        'crm_auto',             // щоб відрізняти від ручних
        createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
      };

      try {
        // FIX BX2: atomic batch — transaction + balance update together
        const _batch = db.batch();
        const txRef = db.collection('companies').doc(companyId)
          .collection('finance_transactions').doc();
        _batch.set(txRef, tx);
        if (defAcc) {
          const accRef = db.collection('companies').doc(companyId)
            .collection('finance_accounts').doc(defAcc.id);
          _batch.update(accRef, { balance: firebase.firestore.FieldValue.increment(tx.amount) });
        }
        await _batch.commit();
        // Update local state after successful commit
        if (defAcc) {
          const acc = _state.accounts?.find(a => a.id === defAcc.id);
          if (acc) acc.balance = (acc.balance || 0) + tx.amount;
        }

        if (typeof showToast === 'function') {
          showToast(`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Авто-транзакція: +${tx.amount} ${tx.currency} (${p.clientName || 'CRM'})`, 'success');
        }
        console.log('[Finance] CRM auto-tx created:', tx.amount, tx.currency, p.clientName);
      } catch(e) {
        console.error('[Finance] CRM auto-tx error:', e);
      }
    });
    return true;
  }

  // Якщо event-bus ще не завантажено — чекаємо
  if (!_subscribe()) {
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (_subscribe() || attempts >= 20) clearInterval(poll);
    }, 300);
  }
// ── Перевірка бюджету при 80% і 100% ─────────────────────

// ── Банер попередження про бюджет ─────────────────────────


})();

// ── Хук: коли switchTab('finance') викликається ──────────
const _origSwitchTab = window.switchTab;
if (typeof _origSwitchTab === 'function') {
  window.switchTab = function(tab) {
    _origSwitchTab(tab);
    if (tab === 'finance') {
      // Невелика затримка щоб DOM встиг показати вкладку
      setTimeout(() => {
        renderFinanceContainer();
      }, 50);
    }
  };
}

// ── Авто-ініціалізація після логіну ──────────────────────
function tryInit() {
  const user = window.currentUser || (window.firebase && firebase.auth && firebase.auth().currentUser);
  const companyId = window.currentCompanyId || window._companyId;

  if (user && companyId) {
    // Одразу підхоплюємо роль якщо currentUserData вже є
    if (window.currentUserData && window.currentUserData.role) {
      _state.userRole = window.currentUserData.role;
    }
    initFinance(companyId, user);
    return true;
  }
  return false;
}

// Спробуємо одразу
if (!tryInit()) {
  // Чекаємо на подію авторизації
  const unsubscribe = document.addEventListener('talko:company-ready', function handler(e) {
    const { companyId, user } = e.detail || {};
    if (companyId && user) {
      initFinance(companyId, user);
      document.removeEventListener('talko:company-ready', handler);
    }
  });

  // Резервний polling (максимум 30 спроб × 500мс = 15с)
  let attempts = 0;
  const poll = setInterval(() => {
    attempts++;
    if (tryInit() || attempts >= 30) clearInterval(poll);
  }, 500);
}

// ── Перевірка бюджету при 80% і 100% ─────────────────────

// ── Банер попередження про бюджет ─────────────────────────


})();

// ══════════════════════════════════════════════════════════
// «З ЧОГО ПОЧАТИ» — детальна панель для фінансового модуля
// ══════════════════════════════════════════════════════════
window._finHowToggle = function() {
  const panel = document.getElementById('finHowPanel');
  const btn   = document.getElementById('finHowBtn');
  if (!panel) return;

  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';

  if (btn) {
    btn.style.background   = isOpen ? '#fff'    : '#f0fdf4';
    btn.style.borderColor  = isOpen ? '#e5e7eb' : '#22c55e';
    btn.style.color        = isOpen ? '#6b7280' : '#16a34a';
  }

  if (!isOpen) {
    const content = document.getElementById('finHowContent');
    if (content && !content.dataset.built) {
      content.innerHTML = _buildFinHowPanel();
      content.dataset.built = '1';
    }
  }
};


// ── i18n хелпер для функцій поза IIFE ────────────────────
function _tg(ua, ru) {
  return (window.currentLang === 'ru' ||
    (typeof window.getLocale === 'function' && window.getLocale().startsWith('ru')))
    ? ru : ua;
}

function _buildFinHowPanel() {
  const cur = window.currentCompanyData?.currency || (window.financeState?.currency) || 'UAH';

  // Кольори і стилі
  const card  = 'background:#fff;border-radius:12px;border:1.5px solid #e5e7eb;padding:1rem 1.1rem;';
  const title = 'font-weight:700;font-size:0.85rem;color:#1a1a1a;margin-bottom:0.6rem;display:flex;align-items:center;gap:6px;';
  const sub   = 'font-size:0.75rem;color:#6b7280;line-height:1.5;';
  const step  = (n, t, d, c='#22c55e') =>
    `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;">
      <div style="width:22px;height:22px;border-radius:50%;background:${c};color:#fff;
        font-size:0.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${n}</div>
      <div>
        <div style="font-size:0.8rem;font-weight:600;color:#1a1a1a;">${t}</div>
        <div style="font-size:0.72rem;color:#6b7280;margin-top:2px;">${d}</div>
      </div>
    </div>`;

  const badge = (t, c, bg) =>
    `<span style="padding:2px 8px;border-radius:20px;font-size:0.7rem;font-weight:600;
      color:${c};background:${bg};white-space:nowrap;">${t}</span>`;

  const arrow = `<span style="color:#9ca3af;margin:0 4px;">→</span>`;

  return `
    <div style="padding:1rem 1.25rem;">

      <!-- Заголовок -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <div style="font-weight:800;font-size:0.95rem;color:#16a34a;display:flex;align-items:center;gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          ${_tg('Фінанси — з чого почати і як це працює','Финансы — с чего начать и как это работает')}
        </div>
        <button onclick="window._finHowToggle()" style="padding:3px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;font-size:0.75rem;cursor:pointer;color:#6b7280;">${_tg('Закрити ×','Закрыть ×')}</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">

        <!-- БЛОК 1: Три звіти -->
        <div style="${card}">
          <div style="${title}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            ${_tg('Три управлінські звіти','Три управленческих отчёта')}
          </div>
          <div style="display:grid;gap:6px;">
            <div style="background:#eff6ff;border-radius:8px;padding:8px 10px;">
              <div style="font-size:0.75rem;font-weight:700;color:#1e40af;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Cash Flow (Дашборд)</div>
              <div style="${sub}">${_tg('Реальний рух грошей по рахунках. Коли гроші прийшли і пішли. Актуально в реальному часі.','Реальное движение денег по счетам. Когда деньги пришли и ушли. Актуально в реальном времени.')}</div>
            </div>
            <div style="background:#f0fdf4;border-radius:8px;padding:8px 10px;">
              <div style="font-size:0.75rem;font-weight:700;color:#16a34a;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> P&L — Прибутки і збитки (Аналітика)</div>
              <div style="${sub}">${_tg('Реальний прибуток: Виручка → Собівартість → Валовий прибуток → OPEX → Чистий прибуток. По даті нарахування послуги.','Реальная прибыль: Выручка → Себестоимость → Валовая прибыль → OPEX → Чистая прибыль. По дате начисления услуги.')}</div>
            </div>
            <div style="background:#fff7ed;border-radius:8px;padding:8px 10px;">
              <div style="font-size:0.75rem;font-weight:700;color:#c2410c;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v19"/><path d="M5 10l7-7 7 7"/><path d="M3 17l4-8 4 8"/><path d="M13 17l4-8 4 8"/><path d="M3 21h18"/></svg> Баланс (Аналітика → кнопка «Баланс»)</div>
              <div style="${sub}">${_tg('Активи = Пасиви + Капітал. Що є у бізнесу, за чий рахунок, скільки власний капітал.','Активы = Пассивы + Капитал. Что есть у бизнеса, за чей счёт, сколько собственный капитал.')}</div>
            </div>
          </div>
        </div>

        <!-- БЛОК 2: Покроковий старт -->
        <div style="${card}">
          <div style="${title}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            ${_tg('З чого почати — 5 кроків','С чего начать — 5 шагов')}
          </div>
          ${step(1,_tg('Налаштувати рахунки','Настроить счета'),_tg('Фінанси → Налаштування → Рахунки. Каса, банк, картка. Вказати початковий залишок.','Финансы → Настройки → Счета. Касса, банк, карта. Указать начальный остаток.'))}
          ${step(2,_tg('Налаштувати категорії','Настроить категории'),_tg('Доходи: послуги, продажі, абонементи. Витрати: COGS (матеріали, зарплата майстрів) і OPEX (оренда, маркетинг).','Доходы: услуги, продажи, абонементы. Расходы: COGS (материалы, зарплата мастеров) и OPEX (аренда, маркетинг).'))}
          ${step(3,_tg('Внести перші транзакції','Внести первые транзакции'),_tg('«+ Додати» → тип, сума, категорія, рахунок, дата. Мінімум 5-10 реальних за поточний місяць.','«+ Добавить» → тип, сумма, категория, счёт, дата. Минимум 5-10 реальных за текущий месяц.'))}
          ${step(4,_tg('Перевірити P&L','Проверить P&L'),_tg('Аналітика → P&L. Побачите Валовий і Чистий прибуток. Якщо COGS = 0 — налаштуйте категорії витрат.','Аналитика → P&L. Увидите Валовую и Чистую прибыль. Если COGS = 0 — настройте категории расходов.'))}
          ${step(5,_tg('Підключити автоматику','Подключить автоматику'),_tg('Налаштування → Зв\'язки модулів. CRM→Фінанси: угода «Виграно» = автодохід.','Настройки → Связи модулей. CRM→Финансы: сделка «Выиграно» = автодоход.'),'#3b82f6')}
        </div>

        <!-- БЛОК 3: Різниця CF vs P&L -->
        <div style="${card}">
          <div style="${title}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ${_tg('Чому Cash Flow ≠ P&L','Почему Cash Flow ≠ P&L')}
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;margin-bottom:8px;">
            <div style="font-size:0.72rem;color:#92400e;font-weight:600;margin-bottom:4px;">${_tg('Приклад:','Пример:')}</div>
            <div style="${sub}">${_tg('Клієнт заплатив 10,000 передоплати в березні за послугу в квітні.','Клиент заплатил 10,000 предоплаты в марте за услугу в апреле.')}</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
              ${badge(_tg('Cash Flow: Березень +10K','Cash Flow: Март +10K'),'#1d4ed8','#eff6ff')}
              ${badge(_tg('P&L: Квітень +10K','P&L: Апрель +10K'),'#16a34a','#f0fdf4')}
            </div>
          </div>
          <div style="${sub}">${_tg('Тому <b>Cash Flow</b> показує ліквідність (чи є гроші зараз), а <b>P&L</b> — реальну прибутковість (чи заробляє бізнес).','Поэтому <b>Cash Flow</b> показывает ликвидность (есть ли деньги сейчас), а <b>P&L</b> — реальную прибыльность (зарабатывает ли бизнес).')}</div>
          <div style="margin-top:8px;${sub}">${_tg('<b>Дата нарахування</b> у формі транзакції — вкажіть коли надана послуга, якщо вона відрізняється від дати оплати.','<b>Дата начисления</b> в форме транзакции — укажите когда оказана услуга, если она отличается от даты оплаты.')}</div>
        </div>

        <!-- БЛОК 4: COGS vs OPEX -->
        <div style="${card}">
          <div style="${title}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            ${_tg('COGS vs OPEX — навіщо розділяти','COGS vs OPEX — зачем разделять')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
            <div style="background:#fff7ed;border-radius:8px;padding:7px 9px;border:1px solid #fed7aa;">
              <div style="font-size:0.7rem;font-weight:700;color:#c2410c;margin-bottom:3px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg> COGS</div>
              <div style="${sub}">${_tg('Прямі витрати на послугу. Зростають разом з кількістю клієнтів.<br>Матеріали, зарплата майстрів, підрядники.','Прямые затраты на услугу. Растут вместе с количеством клиентов.<br>Материалы, зарплата мастеров, подрядчики.')}</div>
            </div>
            <div style="background:#f0fdf4;border-radius:8px;padding:7px 9px;border:1px solid #bbf7d0;">
              <div style="font-size:0.7rem;font-weight:700;color:#16a34a;margin-bottom:3px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> OPEX</div>
              <div style="${sub}">${_tg('Постійні витрати. Не залежать від кількості клієнтів.<br>Оренда, маркетинг, бухгалтер, програми.','Постоянные расходы. Не зависят от количества клиентов.<br>Аренда, маркетинг, бухгалтер, программы.')}</div>
            </div>
          </div>
          <div style="background:#f9fafb;border-radius:8px;padding:7px 10px;font-size:0.72rem;color:#374151;">
            <div>${_tg('Виручка','Выручка')} 100K − COGS 40K = <b style="color:#16a34a;">${_tg('Валовий','Валовый')} 60K (60%)</b></div>
            <div style="margin-top:2px;">${_tg('Валовий','Валовый')} 60K − OPEX 30K = <b style="color:#22c55e;">${_tg('Чистий','Чистый')} 30K (30%)</b></div>
          </div>
          <div style="margin-top:7px;${sub}">${_tg('Налаштувати: <b>Налаштування → Категорії витрат → «+ Додати» → обрати COGS або OPEX</b>','Настроить: <b>Настройки → Категории расходов → «+ Добавить» → выбрать COGS или OPEX</b>')}</div>
        </div>

        <!-- БЛОК 5: Автоматичні зв'язки -->
        <div style="${card}">
          <div style="${title}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            ${_tg('Автоматичні зв\'язки з іншими модулями','Автоматические связи с другими модулями')}
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${badge(_tg('CRM угода «Виграно»','CRM сделка «Выиграно»'),'#1e40af','#eff6ff')}
              ${arrow}
              ${badge(_tg('Дохід у фінансах','Доход в финансах'),'#16a34a','#f0fdf4')}
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${badge(_tg('Booking завершено','Booking завершён'),'#7c3aed','#f5f3ff')}
              ${arrow}
              ${badge(_tg('Оплата у фінансах','Оплата в финансах'),'#16a34a','#f0fdf4')}
              ${arrow}
              ${badge(_tg('Клієнт у CRM','Клиент в CRM'),'#1e40af','#eff6ff')}
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${badge(_tg('Закупівля на склад','Закупка на склад'),'#92400e','#fff7ed')}
              ${arrow}
              ${badge(_tg('Витрата COGS','Расход COGS'),'#dc2626','#fef2f2')}
            </div>
          </div>
          <div style="margin-top:8px;${sub}">${_tg('Увімкнути: <b>Налаштування → Зв\'язки між модулями</b> (toggles)','Включить: <b>Настройки → Связи между модулями</b> (toggles)')}</div>
        </div>

        <!-- БЛОК 6: Тижневий план -->
        <div style="${card}">
          <div style="${title}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${_tg('Планування і прогнозування','Планирование и прогнозирование')}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="background:#ecfeff;border-radius:8px;padding:7px 10px;border:1px solid #a5f3fc;">
              <div style="font-size:0.72rem;font-weight:700;color:#0e7490;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${_tg('Тижневий план 6M (Планування → «Тижневий план 6M»)','Недельный план 6M (Планирование → «Недельный план 6M»)')}</div>
              <div style="${sub}">${_tg('Планування доходів і витрат по тижнях. Графік + Cashflow лінія. Видно касові розриви заздалегідь.','Планирование доходов и расходов по неделям. График + Cashflow линия. Видны кассовые разрывы заранее.')}</div>
            </div>
            <div style="background:#f0fdf4;border-radius:8px;padding:7px 10px;border:1px solid #bbf7d0;">
              <div style="font-size:0.72rem;font-weight:700;color:#166534;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> ${_tg('Бюджет місяця (Планування → «Бюджет по категоріях»)','Бюджет месяца (Планирование → «Бюджет по категориям»)')}</div>
              <div style="${sub}">${_tg('План vs Факт по кожній категорії. Сповіщення при 80% і 100% витраченого бюджету.','План vs Факт по каждой категории. Уведомления при 80% и 100% использованного бюджета.')}</div>
            </div>
          </div>
          <div style="margin-top:7px;${sub}">
            ${_tg('<b>Швидкий старт:</b> Планування → Тижневий план → «Заповнити з середнього 3M» → коригуйте вручну → Зберегти.','<b>Быстрый старт:</b> Планирование → Недельный план → «Заполнить из среднего 3M» → корректируйте вручную → Сохранить.')}
          </div>
        </div>

      </div>

      <!-- Підсумок: де що знайти -->
      <div style="margin-top:12px;background:#1f2937;border-radius:12px;padding:12px 16px;">
        <div style="font-size:0.75rem;font-weight:700;color:#fff;margin-bottom:8px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg> ${_tg('Де що знаходиться:','Где что находится:')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${[
            {tab:_tg('Дашборд','Дашборд'),   desc:_tg('Cash Flow, рахунки, баланс рахунків','Cash Flow, счета, баланс счетов')},
            {tab:_tg('Доходи','Доходы'),    desc:_tg('всі надходження + фільтри','все поступления + фильтры')},
            {tab:_tg('Витрати','Расходы'),   desc:_tg('всі витрати по категоріях','все расходы по категориям')},
            {tab:_tg('Повторювані','Регулярные'),desc:_tg('щомісячні автовитрати','ежемесячные авторасходы')},
            {tab:_tg('Рахунки','Счета'),   desc:_tg('виставлення рахунків клієнтам','выставление счетов клиентам')},
            {tab:_tg('Планування','Планирование'),desc:_tg('бюджет + тижневий план 6M','бюджет + недельный план 6M')},
            {tab:_tg('Аналітика','Аналитика'), desc:_tg('P&L, маржа по проектах, Баланс','P&L, маржа по проектам, Баланс')},
            {tab:_tg('Налаштування','Настройки'),desc:_tg('рахунки, категорії, курси валют','счета, категории, курсы валют')},
          ].map(i=>`
            <div style="background:rgba(255,255,255,0.08);border-radius:7px;padding:4px 10px;">
              <span style="font-size:0.7rem;font-weight:700;color:#22c55e;">${i.tab}</span>
              <span style="font-size:0.68rem;color:#9ca3af;margin-left:4px;">— ${i.desc}</span>
            </div>`).join('')}
        </div>
      </div>

    </div>`;
}

// ══════════════════════════════════════════════════════════
// P&L EXPORT — Excel і PDF
// ══════════════════════════════════════════════════════════

// ── Збір даних P&L для export ─────────────────────────────
async function _getPnlExportData() {
  const db  = window.db || (window.firebase && firebase.firestore());
  const cid = window.currentCompanyId;
  if (!db || !cid) throw new Error('DB не ініціалізовано');

  const period   = window._analyticsPeriod || 'month';
  const currency = window.currentCompanyData?.currency || 'UAH';
  const now      = new Date();
  let from, to;

  if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    from = new Date(now.getFullYear(), q * 3, 1);
    to   = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59);
  } else {
    from = new Date(now.getFullYear(), 0, 1);
    to   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }

  const fromTs = firebase.firestore.Timestamp.fromDate(from);
  const toTs   = firebase.firestore.Timestamp.fromDate(to);

  const [txSnap, catSnap] = await Promise.all([
    db.collection('companies').doc(cid).collection('finance_transactions')
      .where('date','>=',fromTs).where('date','<=',toTs).get(),
    db.collection('companies').doc(cid).collection('finance_categories').get(),
  ]);

  const txs  = txSnap.docs.map(d=>({id:d.id,...d.data()}));
  const cats = catSnap.docs.map(d=>({id:d.id,...d.data()}));
  const incCats = cats.filter(c=>c.type==='income');
  const expCats = cats.filter(c=>c.type==='expense');

  const byIncCat = {}, byCogsCat = {}, byOpexCat = {};
  let totalInc=0, totalCogs=0, totalOpex=0;

  txs.forEach(tx => {
    const getDate = (t) => t.accrualDate || t.date;
    const d = getDate(tx)?.toDate?.() || new Date();
    if (d < from || d > to) return;
    const amt = tx.amountBase || tx.amount || 0;
    if (tx.type === 'income') {
      byIncCat[tx.categoryId] = (byIncCat[tx.categoryId]||0) + amt;
      totalInc += amt;
    } else {
      const cat = expCats.find(c=>c.id===tx.categoryId);
      if (cat?.costType === 'cogs') {
        byCogsCat[tx.categoryId] = (byCogsCat[tx.categoryId]||0) + amt;
        totalCogs += amt;
      } else {
        byOpexCat[tx.categoryId] = (byOpexCat[tx.categoryId]||0) + amt;
        totalOpex += amt;
      }
    }
  });

  const grossProfit = totalInc - totalCogs;
  const netProfit   = grossProfit - totalOpex;
  const pctOf = (v) => totalInc > 0 ? Math.round(v/totalInc*100) : 0;

  const periodLabel = period === 'month'
    ? from.toLocaleDateString('uk-UA',{month:'long',year:'numeric'})
    : period === 'quarter'
    ? `Q${Math.floor(from.getMonth()/3)+1} ${from.getFullYear()}`
    : String(from.getFullYear());

  return {
    currency, periodLabel, from, to,
    incCats, expCats,
    byIncCat, byCogsCat, byOpexCat,
    totalInc, totalCogs, totalOpex, grossProfit, netProfit,
    pctOf,
  };
}

// ── XLSX export ───────────────────────────────────────────
window._exportPnlXlsx = async function() {
  try {
    if (typeof showToast === 'function') showToast(_tg('Формування Excel...','Формирование Excel...'), 'info');
    const d = await _getPnlExportData();
    const cur = d.currency;
    const fmt = (n) => Number((n||0).toFixed(2));

    // Будуємо рядки
    const rows = [
      [_tg('P&L Звіт — ','P&L Отчёт — ') + d.periodLabel, '', '', ''],
      ['', '', '', ''],
      [_tg('Показник','Показатель'), _tg('Сума','Сумма') + ' (' + cur + ')', _tg('% від виручки','% от выручки'), ''],
      ['', '', '', ''],
      [_tg('ВИРУЧКА (Revenue)','ВЫРУЧКА (Revenue)'), fmt(d.totalInc), '100%', ''],
    ];

    d.incCats.filter(c=>d.byIncCat[c.id]).forEach(c => {
      rows.push(['  ' + c.name, fmt(d.byIncCat[c.id]||0), d.pctOf(d.byIncCat[c.id]||0)+'%', '']);
    });

    rows.push(['', '', '', '']);
    rows.push([_tg('СОБІВАРТІСТЬ (COGS)','СЕБЕСТОИМОСТЬ (COGS)'), fmt(d.totalCogs), d.pctOf(d.totalCogs)+'%', '']);
    d.expCats.filter(c=>d.byCogsCat[c.id]).forEach(c => {
      rows.push(['  ' + c.name, fmt(d.byCogsCat[c.id]||0), d.pctOf(d.byCogsCat[c.id]||0)+'%', '']);
    });

    rows.push(['', '', '', '']);
    rows.push([_tg('ВАЛОВИЙ ПРИБУТОК','ВАЛОВАЯ ПРИБЫЛЬ'), fmt(d.grossProfit), d.pctOf(d.grossProfit)+'%', '']);

    rows.push(['', '', '', '']);
    rows.push([_tg('ОПЕРАЦІЙНІ ВИТРАТИ (OPEX)','ОПЕРАЦИОННЫЕ РАСХОДЫ (OPEX)'), fmt(d.totalOpex), d.pctOf(d.totalOpex)+'%', '']);
    d.expCats.filter(c=>d.byOpexCat[c.id]).forEach(c => {
      rows.push(['  ' + c.name, fmt(d.byOpexCat[c.id]||0), d.pctOf(d.byOpexCat[c.id]||0)+'%', '']);
    });

    rows.push(['', '', '', '']);
    rows.push([_tg('ЧИСТИЙ ПРИБУТОК (Net Profit)','ЧИСТАЯ ПРИБЫЛЬ (Net Profit)'), fmt(d.netProfit), d.pctOf(d.netProfit)+'%', '']);

    // Генеруємо XML-based XLSX без бібліотек
    const xmlRows = rows.map(row =>
      '<Row>' + row.map((cell, ci) => {
        const isNum = typeof cell === 'number';
        return `<Cell><Data ss:Type="${isNum?'Number':'String'}">${String(cell).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Data></Cell>`;
      }).join('') + '</Row>'
    ).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header"><Font ss:Bold="1" ss:Size="12"/></Style>
    <Style ss:ID="total"><Font ss:Bold="1"/><Interior ss:Color="#F0FDF4" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="P&amp;L">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], {type:'application/vnd.ms-excel;charset=utf-8'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `PnL_${d.periodLabel.replace(/\s/g,'_')}_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1000);
    if (typeof showToast === 'function') showToast(_tg('✓ P&L Excel завантажено','✓ P&L Excel загружен'), 'success');
  } catch(e) {
    console.error('[PnL export]', e);
    if (typeof showToast === 'function') showToast(_tg('Помилка: ','Ошибка: ') + e.message, 'error');
  }
};

// ── PDF export ────────────────────────────────────────────
window._exportPnlPdf = async function() {
  try {
    if (typeof showToast === 'function') showToast(_tg('Формування PDF...','Формирование PDF...'), 'info');

    // Завантажуємо jsPDF якщо ще немає
    if (!window.jspdf) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }

    const d = await _getPnlExportData();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4' });
    const cur = d.currency;
    const pageW = 210, margin = 18;
    let y = 0;

    const fmtN = (n) => (n||0).toLocaleString('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2});
    const pct  = (n) => d.pctOf(n) + '%';

    // Шапка
    doc.setFillColor(34,197,94);
    doc.rect(0,0,pageW,14,'F');
    doc.setTextColor(255,255,255);
    doc.setFont('helvetica','bold');
    doc.setFontSize(12);
    doc.text('TALKO Business System', margin, 9.5);
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.text('P&L Report', pageW - margin - 20, 9.5);

    y = 24;
    doc.setTextColor(26,26,26);
    doc.setFont('helvetica','bold');
    doc.setFontSize(16);
    doc.text(_tg('P&L — Звіт про прибутки і збитки','P&L — Отчёт о прибылях и убытках'), margin, y);
    y += 7;
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    doc.setTextColor(100,100,100);
    doc.text(`${_tg('Період','Период')}: ${d.periodLabel}  |  Валюта: ${cur}  |  Дата: ${new Date().toLocaleDateString('uk-UA')}`, margin, y);

    // Функція для рядка таблиці
    const addRow = (label, val, pctStr, bold, bgColor) => {
      if (y > 270) { doc.addPage(); y = 20; }
      if (bgColor) { doc.setFillColor(...bgColor); doc.rect(margin, y-4, pageW-margin*2, 8, 'F'); }
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(26,26,26);
      doc.text(label, margin+2, y);
      if (val !== null) {
        doc.text(fmtN(val), pageW - margin - 42, y, {align:'right'});
        doc.setTextColor(100,100,100);
        doc.text(pctStr||'', pageW - margin - 4, y, {align:'right'});
      }
      y += 7;
    };

    const divider = (color) => {
      doc.setDrawColor(...(color||[229,231,235]));
      doc.line(margin, y-3, pageW-margin, y-3);
    };

    y += 6;
    // Заголовок таблиці
    doc.setFillColor(31,41,55);
    doc.rect(margin, y-5, pageW-margin*2, 9, 'F');
    doc.setTextColor(255,255,255);
    doc.setFont('helvetica','bold');
    doc.setFontSize(8.5);
    doc.text(_tg('Показник','Показатель'), margin+2, y);
    doc.text(`${_tg('Сума','Сумма')} (${cur})`, pageW-margin-42, y, {align:'right'});
    doc.text(_tg('% вир.','% вир.'), pageW-margin-4, y, {align:'right'});
    y += 8;

    // Виручка
    doc.setTextColor(26,26,26);
    addRow(_tg('ВИРУЧКА (Revenue)','ВЫРУЧКА (Revenue)'), d.totalInc, '100%', true, [240,253,244]);
    d.incCats.filter(c=>d.byIncCat[c.id]).forEach(c =>
      addRow('  ' + c.name, d.byIncCat[c.id]||0, pct(d.byIncCat[c.id]||0), false)
    );

    y += 2; divider([187,247,208]);
    // COGS
    addRow(_tg('СОБІВАРТІСТЬ (COGS)','СЕБЕСТОИМОСТЬ (COGS)'), d.totalCogs, pct(d.totalCogs), true, [255,247,237]);
    d.expCats.filter(c=>d.byCogsCat[c.id]).forEach(c =>
      addRow('  ' + c.name, d.byCogsCat[c.id]||0, pct(d.byCogsCat[c.id]||0), false)
    );

    y += 2;
    addRow(_tg('ВАЛОВИЙ ПРИБУТОК','ВАЛОВАЯ ПРИБЫЛЬ'), d.grossProfit, pct(d.grossProfit), true,
      d.grossProfit >= 0 ? [240,253,244] : [254,242,242]);

    y += 2; divider();
    // OPEX
    addRow(_tg('ОПЕРАЦІЙНІ ВИТРАТИ (OPEX)','ОПЕРАЦИОННЫЕ РАСХОДЫ (OPEX)'), d.totalOpex, pct(d.totalOpex), true, [254,242,242]);
    d.expCats.filter(c=>d.byOpexCat[c.id]).forEach(c =>
      addRow('  ' + c.name, d.byOpexCat[c.id]||0, pct(d.byOpexCat[c.id]||0), false)
    );

    y += 3;
    // Чистий прибуток — виділений блок
    doc.setFillColor(31,41,55);
    doc.rect(margin, y-5, pageW-margin*2, 11, 'F');
    doc.setTextColor(255,255,255);
    doc.setFont('helvetica','bold');
    doc.setFontSize(10);
    doc.text(_tg('ЧИСТИЙ ПРИБУТОК (Net Profit)','ЧИСТАЯ ПРИБЫЛЬ (Net Profit)'), margin+2, y+1);
    doc.setTextColor(d.netProfit>=0?34:239, d.netProfit>=0?197:68, d.netProfit>=0?94:68);
    doc.text(fmtN(d.netProfit), pageW-margin-42, y+1, {align:'right'});
    doc.setTextColor(200,200,200);
    doc.setFontSize(9);
    doc.text(pct(d.netProfit), pageW-margin-4, y+1, {align:'right'});

    // Футер
    doc.setTextColor(150,150,150);
    doc.setFont('helvetica','normal');
    doc.setFontSize(7.5);
    doc.text(_tg('Сформовано TALKO Business System · ','Сформировано TALKO Business System · ') + new Date().toLocaleString('uk-UA'), margin, 287);

    doc.save(`PnL_${d.periodLabel.replace(/\s/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`);
    if (typeof showToast === 'function') showToast(_tg('✓ P&L PDF завантажено','✓ P&L PDF загружен'), 'success');
  } catch(e) {
    console.error('[PnL PDF]', e);
    if (typeof showToast === 'function') showToast(_tg('Помилка: ','Ошибка: ') + e.message, 'error');
  }
};
