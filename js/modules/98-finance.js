// ============================================================
// 98-finance.js — TALKO Finance Module v1.0
// Етап 1: Фундамент — структура, навігація, ініціалізація
// ============================================================
(function () {
'use strict';

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
};

// ── Константи ──────────────────────────────────────────────
const FINANCE_VERSION = '1.0.0';
const TABS = ['dashboard', 'income', 'expense', 'functions', 'planning', 'ai'];
const TAB_LABELS = {
  dashboard:  { icon: 'chart',    label: 'Дашборд'   },
  income:     { icon: 'income',   label: 'Доходи'    },
  expense:    { icon: 'expense',  label: 'Витрати'   },
  functions:  { icon: 'func',     label: 'Функції'   },
  planning:   { icon: 'plan',     label: 'Планування'},
  ai:         { icon: 'ai',       label: 'AI'        },
};

// ── Стан модуля ────────────────────────────────────────────
let _state = {
  activeSubTab: 'dashboard',
  companyId: null,
  currentUser: null,
  userRole: null,           // owner | manager | employee
  initialized: false,
  accounts: [],
  categories: { income: [], expense: [] },
  region: 'EU',             // EU | DE | PL | US
  currency: 'EUR',
  niche: null,              // beauty | construction | medical | ...
};

// ── Утиліти ────────────────────────────────────────────────
function fmt(amount, currency) {
  const cur = currency || _state.currency || 'EUR';
  const locale = _state.region === 'US' ? 'en-US' : 'uk-UA';
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
  return d.toLocaleDateString('uk-UA');
}

function isOwnerOrManager() {
  return _state.userRole === 'owner' || _state.userRole === 'manager';
}

function getDb() { return window.db || (window.firebase && firebase.firestore()); }

function colRef(name) {
  const db = getDb();
  if (!db || !_state.companyId) return null;
  return db.collection('companies').doc(_state.companyId).collection(name);
}

// ── Системні категорії (дефолт при ініціалізації) ──────────
const DEFAULT_CATEGORIES = {
  income: [
    { id: 'inc_services',   name: 'Оплата за послуги',    icon: '💼' },
    { id: 'inc_goods',      name: 'Продаж товарів',       icon: '📦' },
    { id: 'inc_prepay',     name: 'Передоплата',          icon: '💳' },
    { id: 'inc_royalty',    name: 'Роялті / Оренда',      icon: '🏢' },
    { id: 'inc_other',      name: 'Інше',                 icon: '➕' },
  ],
  expense: [
    { id: 'exp_materials',  name: 'Матеріали / сировина', icon: '🔧' },
    { id: 'exp_salary',     name: 'ФОП / Зарплата',       icon: '👤' },
    { id: 'exp_rent',       name: 'Оренда',               icon: '🏠' },
    { id: 'exp_transport',  name: 'Транспорт / Паливо',   icon: '🚗' },
    { id: 'exp_marketing',  name: 'Маркетинг / Реклама',  icon: '📢' },
    { id: 'exp_equipment',  name: 'Обладнання',           icon: '⚙️' },
    { id: 'exp_utilities',  name: 'Комунальні послуги',   icon: '💡' },
    { id: 'exp_admin',      name: 'Адміністративні',      icon: '📋' },
    { id: 'exp_subcontract',name: 'Субпідряд',            icon: '🤝' },
    { id: 'exp_tax',        name: 'Податки / ZUS',        icon: '📊' },
    { id: 'exp_reserve',    name: 'Резервний фонд',       icon: '🛡️' },
    { id: 'exp_dividends',  name: 'Дивіденди власника',   icon: '💰' },
    { id: 'exp_other',      name: 'Інше',                 icon: '➕' },
  ],
};

// ── Ініціалізація Firestore колекцій ──────────────────────
async function initFirestoreCollections() {
  const db = getDb();
  if (!db || !_state.companyId) return;

  const settingsRef = db.collection('companies').doc(_state.companyId)
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
    batch.set(ref, { ...cat, type: 'expense', system: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  });

  // 4. Рахунок за замовчуванням
  const accRef = colRef('finance_accounts').doc('acc_main');
  batch.set(accRef, {
    name: _state.region === 'US' ? 'Bank Account' : 'Розрахунковий рахунок',
    type: 'bank',
    currency: _state.currency,
    balance: 0,
    isDefault: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // 5. Готівкова каса
  const cashRef = colRef('finance_accounts').doc('acc_cash');
  batch.set(cashRef, {
    name: _state.region === 'US' ? 'Cash' : 'Готівкова каса',
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
}

// ── Рендер головного контейнера ──────────────────────────
function renderFinanceContainer() {
  const container = document.getElementById('financeContainer');
  if (!container) return;

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
            ${I[TAB_LABELS[t].icon]}
            ${TAB_LABELS[t].label}
          </button>
        `).join('')}

        <div style="flex:1"></div>

        ${isOwnerOrManager() ? `
          <button onclick="window._financeAddTransaction()" style="
            display:flex;align-items:center;gap:0.4rem;
            padding:0.45rem 0.9rem;
            background:var(--primary,#22c55e);color:#fff;
            border:none;border-radius:8px;cursor:pointer;
            font-size:0.82rem;font-weight:600;
            flex-shrink:0;
          ">${I.plus} Додати</button>
        ` : ''}
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
    case 'functions': renderFunctions(inner); break;
    case 'planning':  renderPlanning(inner); break;
    case 'ai':        renderAI(inner); break;
    default:          renderDashboard(inner);
  }
}

// ── Дашборд (заглушка Етап 1) ─────────────────────────────
function renderDashboard(el) {
  const totalBalance = _state.accounts.reduce((s, a) => s + (a.balance || 0), 0);

  el.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">

      <!-- Welcome banner -->
      <div style="
        background:linear-gradient(135deg,#22c55e,#16a34a);
        border-radius:16px;padding:1.5rem 2rem;
        color:#fff;margin-bottom:1.5rem;
        display:flex;align-items:center;justify-content:space-between;
      ">
        <div>
          <div style="font-size:1.15rem;font-weight:700;margin-bottom:0.25rem;">Фінанси TALKO</div>
          <div style="font-size:0.85rem;opacity:0.85;">Управлінський облік вашого бізнесу</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.75rem;opacity:0.8;margin-bottom:0.2rem;">Загальний залишок</div>
          <div style="font-size:1.75rem;font-weight:800;">${fmt(totalBalance)}</div>
        </div>
      </div>

      <!-- KPI картки (порожні, заповняться в Етапі 2) -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;">
        ${[
          { label: 'Дохід (місяць)',   value: '—',  color: '#22c55e', sub: 'даних ще немає' },
          { label: 'Витрати (місяць)', value: '—',  color: '#ef4444', sub: 'даних ще немає' },
          { label: 'Прибуток',         value: '—',  color: '#3b82f6', sub: 'даних ще немає' },
          { label: 'Маржа %',          value: '—%', color: '#f59e0b', sub: 'даних ще немає' },
        ].map(k => `
          <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
            <div style="font-size:0.75rem;color:#6b7280;margin-bottom:0.4rem;">${k.label}</div>
            <div style="font-size:1.5rem;font-weight:700;color:${k.color};">${k.value}</div>
            <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;">${k.sub}</div>
          </div>
        `).join('')}
      </div>

      <!-- Рахунки -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;margin-bottom:1.5rem;">
        <div style="font-size:0.9rem;font-weight:600;margin-bottom:1rem;color:#1a1a1a;">Рахунки та каси</div>
        ${_state.accounts.length === 0
          ? '<div style="color:#9ca3af;font-size:0.85rem;">Рахунки завантажуються...</div>'
          : _state.accounts.map(acc => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid #f3f4f6;">
              <div style="display:flex;align-items:center;gap:0.6rem;">
                <div style="width:32px;height:32px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;">
                  ${acc.type === 'cash' ? '💵' : '🏦'}
                </div>
                <div>
                  <div style="font-size:0.85rem;font-weight:500;">${acc.name}</div>
                  <div style="font-size:0.72rem;color:#9ca3af;">${acc.currency}</div>
                </div>
              </div>
              <div style="font-size:0.95rem;font-weight:700;color:#1a1a1a;">${fmt(acc.balance, acc.currency)}</div>
            </div>
          `).join('')
        }
      </div>

      <!-- Підказка наступного кроку -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:0.75rem;">
        <div style="font-size:1.5rem;">💡</div>
        <div>
          <div style="font-size:0.85rem;font-weight:600;color:#16a34a;">Що далі?</div>
          <div style="font-size:0.8rem;color:#166534;margin-top:0.2rem;">
            Натисніть <strong>«Додати»</strong> щоб внести першу транзакцію, або перейдіть у <strong>«Доходи»</strong> / <strong>«Витрати»</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Транзакції (заглушка Етап 1) ─────────────────────────
function renderTransactions(el, type) {
  const label = type === 'income' ? 'Доходи' : 'Витрати';
  const color  = type === 'income' ? '#22c55e' : '#ef4444';
  el.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${label}</div>
        ${isOwnerOrManager() ? `
          <button onclick="window._financeAddTransaction('${type}')" style="
            display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;
            background:${color};color:#fff;border:none;border-radius:8px;
            cursor:pointer;font-size:0.82rem;font-weight:600;
          ">${I.plus} Додати ${label === 'Доходи' ? 'дохід' : 'витрату'}</button>
        ` : ''}
      </div>
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:2rem;text-align:center;color:#9ca3af;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">${type === 'income' ? '📈' : '📉'}</div>
        <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.35rem;">Транзакцій поки немає</div>
        <div style="font-size:0.8rem;">Натисніть «Додати» щоб внести першу операцію</div>
      </div>
    </div>
  `;
}

// ── Функції (заглушка Етап 1) ────────────────────────────
function renderFunctions(el) {
  el.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">Фінанси по функціях</div>
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:2rem;text-align:center;color:#9ca3af;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">📊</div>
        <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.35rem;">Звіт по функціях</div>
        <div style="font-size:0.8rem;">Буде доступний після внесення перших транзакцій</div>
      </div>
    </div>
  `;
}

// ── Планування (заглушка Етап 1) ─────────────────────────
function renderPlanning(el) {
  el.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">Планування</div>
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:2rem;text-align:center;color:#9ca3af;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">📅</div>
        <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.35rem;">Бюджетування</div>
        <div style="font-size:0.8rem;">Розробляється в наступному етапі</div>
      </div>
    </div>
  `;
}

// ── AI (заглушка Етап 1) ──────────────────────────────────
function renderAI(el) {
  if (!isOwnerOrManager()) {
    el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:2rem;">Доступ лише для Owner та Manager</div>';
    return;
  }
  el.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">AI-аналітик</div>
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:2rem;text-align:center;color:#9ca3af;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">🤖</div>
        <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.35rem;">Claude AI аналітика</div>
        <div style="font-size:0.8rem;">Буде активовано після наповнення даними</div>
      </div>
    </div>
  `;
}

// ── Заглушка форми додавання транзакції ──────────────────
function addTransaction(type) {
  alert('Форма додавання транзакцій — Етап 2');
}

// ── Визначення ролі користувача ──────────────────────────
async function detectUserRole() {
  const db = getDb();
  if (!db || !_state.companyId || !_state.currentUser) return;
  try {
    const snap = await db.collection('companies').doc(_state.companyId)
      .collection('members').doc(_state.currentUser.uid).get();
    if (snap.exists) {
      _state.userRole = snap.data().role || 'employee';
    }
  } catch(e) {
    // fallback — перевіряємо через компанію
    try {
      const cSnap = await db.collection('companies').doc(_state.companyId).get();
      if (cSnap.exists && cSnap.data().ownerId === _state.currentUser.uid) {
        _state.userRole = 'owner';
      } else {
        _state.userRole = 'employee';
      }
    } catch(e2) { _state.userRole = 'employee'; }
  }
}

// ── Визначення регіону та валюти ─────────────────────────
async function detectRegionAndCurrency() {
  const db = getDb();
  if (!db || !_state.companyId) return;
  try {
    const snap = await db.collection('companies').doc(_state.companyId)
      .collection('finance_settings').doc('main').get();
    if (snap.exists) {
      _state.region   = snap.data().region   || 'EU';
      _state.currency = snap.data().currency || 'EUR';
      _state.niche    = snap.data().niche    || null;
    } else {
      // Нова компанія — спробуємо взяти з профілю компанії
      const cSnap = await db.collection('companies').doc(_state.companyId).get();
      if (cSnap.exists) {
        _state.region   = cSnap.data().region   || 'EU';
        _state.currency = cSnap.data().currency || 'EUR';
        _state.niche    = cSnap.data().niche    || null;
      }
    }
  } catch(e) { /* defaults OK */ }
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

window._financeAddTransaction = function(type) {
  addTransaction(type || 'expense');
};

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

})();
