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
const TABS = ['dashboard', 'income', 'expense', 'recurring', 'invoices', 'functions', 'planning', 'analytics', 'ai', 'settings'];
const TAB_LABELS = {
  dashboard:  { icon: 'chart',     label: 'Дашборд'      },
  income:     { icon: 'income',    label: 'Доходи'       },
  expense:    { icon: 'expense',   label: 'Витрати'      },
  recurring:  { icon: 'repeat',    label: 'Регулярні'    },
  invoices:   { icon: 'invoice',   label: 'Рахунки'      },
  functions:  { icon: 'func',      label: 'Функції'      },
  planning:   { icon: 'plan',      label: 'Планування'   },
  analytics:  { icon: 'chart',     label: 'Аналітика'    },
  ai:         { icon: 'ai',        label: 'AI'           },
  settings:   { icon: 'settings',  label: 'Налаштування' },
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
  invoices: [],
  region: 'EU',             // EU | DE | PL | US
  currency: 'EUR',
  niche: null,              // beauty | construction | medical | ...
  functions: [],            // бізнес-функції компанії
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
    { id: 'inc_services',   name: 'Оплата за послуги',    icon: 'briefcase' },
    { id: 'inc_goods',      name: 'Продаж товарів',       icon: 'package' },
    { id: 'inc_prepay',     name: 'Передоплата',          icon: 'credit-card' },
    { id: 'inc_royalty',    name: 'Роялті / Оренда',      icon: 'building-2' },
    { id: 'inc_other',      name: 'Інше',                 icon: 'plus-circle' },
  ],
  expense: [
    { id: 'exp_materials',  name: 'Матеріали / сировина', icon: 'wrench' },
    { id: 'exp_salary',     name: 'ФОП / Зарплата',       icon: 'user' },
    { id: 'exp_rent',       name: 'Оренда',               icon: 'home' },
    { id: 'exp_transport',  name: 'Транспорт / Паливо',   icon: 'car' },
    { id: 'exp_marketing',  name: 'Маркетинг / Реклама',  icon: 'megaphone' },
    { id: 'exp_equipment',  name: 'Обладнання',           icon: 'settings' },
    { id: 'exp_utilities',  name: 'Комунальні послуги',   icon: 'lightbulb' },
    { id: 'exp_admin',      name: 'Адміністративні',      icon: 'clipboard-list' },
    { id: 'exp_subcontract',name: 'Субпідряд',            icon: 'handshake' },
    { id: 'exp_tax',        name: 'Податки / ZUS',        icon: 'bar-chart-2' },
    { id: 'exp_reserve',    name: 'Резервний фонд',       icon: 'shield' },
    { id: 'exp_dividends',  name: 'Дивіденди власника',   icon: 'coins' },
    { id: 'exp_other',      name: 'Інше',                 icon: 'plus-circle' },
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
      batch.set(ref, { ...cat, type: 'expense', system: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
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
    case 'recurring': renderRecurring(inner); break;
    case 'invoices':  renderInvoices(inner); break;
    case 'functions': renderFinanceFunctions(inner); break;
    case 'planning':   renderPlanning(inner); break;
    case 'analytics':  renderAnalytics(inner); break;
    case 'ai':         renderAI(inner); break;
    case 'settings':  renderSettings(inner); break;
    default:          renderDashboard(inner);
  }
}

// ── Дашборд (заглушка Етап 1) ─────────────────────────────
// ── Дашборд — Етап 3 ──────────────────────────────────────
function renderDashboard(el) {
  const now = new Date();
  const monthLabel = now.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  const totalBalance = _state.accounts.reduce((s, a) => s + (a.balance || 0), 0);

  el.innerHTML = `
    <div style="width:100%;">

      <!-- Header рядок -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">Дашборд</div>
          <div style="font-size:0.78rem;color:#6b7280;margin-top:0.1rem;">${monthLabel}</div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <select id="dashMonthSel" onchange="window._dashMonthChange(this.value)"
            style="padding:0.35rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
            ${Array.from({length:6},(_,i)=>{
              const d=new Date(now.getFullYear(),now.getMonth()-i,1);
              const val=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
              const lbl=d.toLocaleDateString('uk-UA',{month:'long',year:'numeric'});
              return `<option value="${val}" ${i===0?'selected':''}>${lbl}</option>`;
            }).join('')}
          </select>
          ${isOwnerOrManager() ? `
            <button onclick="window._financeAddTransaction()"
              style="display:flex;align-items:center;gap:0.35rem;padding:0.35rem 0.8rem;
              background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;">
              ${I.plus} Додати
            </button>
          ` : ''}
        </div>
      </div>

      <!-- KPI картки -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:0.75rem;margin-bottom:1.25rem;">
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">Дохід</div>
          <div id="kpiIncome" style="font-size:1.5rem;font-weight:800;color:#22c55e;">...</div>
          <div id="kpiIncomeSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">Витрати</div>
          <div id="kpiExpense" style="font-size:1.5rem;font-weight:800;color:#ef4444;">...</div>
          <div id="kpiExpenseSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">Прибуток</div>
          <div id="kpiProfit" style="font-size:1.5rem;font-weight:800;color:#3b82f6;">...</div>
          <div id="kpiProfitSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e5e7eb;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.35rem;text-transform:uppercase;letter-spacing:.04em;">Маржа</div>
          <div id="kpiMargin" style="font-size:1.5rem;font-weight:800;color:#f59e0b;">...</div>
          <div id="kpiMarginSub" style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;"></div>
        </div>
      </div>

      <!-- Графік + Рахунки -->
      <div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;flex-wrap:wrap;">

        <!-- Графік доходів/витрат за 6 місяців -->
        <div style="flex:1;min-width:280px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;overflow:hidden;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Доходи vs Витрати (6 міс.)</div>
          <div id="dashChart" style="width:100%;overflow:hidden;">
            <div style="color:#9ca3af;font-size:0.78rem;">Завантаження...</div>
          </div>
          <div style="display:flex;gap:1rem;margin-top:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.35rem;font-size:0.72rem;color:#6b7280;">
              <div style="width:10px;height:10px;border-radius:2px;background:#22c55e;"></div>Доходи
            </div>
            <div style="display:flex;align-items:center;gap:0.35rem;font-size:0.72rem;color:#6b7280;">
              <div style="width:10px;height:10px;border-radius:2px;background:#ef4444;"></div>Витрати
            </div>
          </div>
        </div>

        <!-- Рахунки -->
        <div style="width:240px;flex-shrink:0;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
            <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">Рахунки</div>
            ${isOwnerOrManager() ? `<button onclick="window._financeTransfer()" style="font-size:0.72rem;padding:3px 8px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;color:#374151;cursor:pointer;font-weight:500;">⇄ Переказ</button>` : ''}
          </div>
          <div style="margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid #f3f4f6;">
            <div style="font-size:0.72rem;color:#6b7280;">Загальний залишок</div>
            <div id="dashTotalBalance" style="font-size:1.25rem;font-weight:800;color:#1a1a1a;">${fmt(totalBalance)}</div>
          </div>
          <div id="dashAccounts">
          ${_state.accounts.map(acc => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #f9fafb;">
              <div style="font-size:0.8rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${acc.name}</div>
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
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Сигнали</div>
          <div id="dashAlerts">
            <div style="color:#9ca3af;font-size:0.8rem;">Перевірка...</div>
          </div>
        </div>

        <!-- Топ витрат по категоріях -->
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Топ витрат</div>
          <div id="dashTopExpense">
            <div style="color:#9ca3af;font-size:0.8rem;">Завантаження...</div>
          </div>
        </div>
      </div>

      <!-- Donut + Проекти за маржею -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem;">
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Структура витрат</div>
          <div id="dashDonut"><div style="color:#9ca3af;font-size:0.8rem;">Завантаження...</div></div>
        </div>
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Проекти за маржею</div>
          <div id="dashProjects"><div style="color:#9ca3af;font-size:0.8rem;">Завантаження...</div></div>
        </div>
      </div>

      <!-- План-факт KPI -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;margin-bottom:1.25rem;">
        <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">План vs Факт</div>
        <div id="dashPlanFact"><div style="color:#9ca3af;font-size:0.8rem;">Завантаження...</div></div>
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
    set('kpiIncome',  fmt(income),  incCount + ' операцій', '#22c55e');
    set('kpiExpense', fmt(expense), expCount + ' операцій', '#ef4444');
    set('kpiProfit',  fmt(profit),  profit >= 0 ? 'прибуток' : 'збиток', pColor);
    set('kpiMargin',  margin+'%',   income > 0 ? `від доходу ${fmt(income)}` : 'немає доходів', profit>=0?'#22c55e':'#ef4444');

    // Сигнали
    const alerts = [];
    if (income === 0 && expense === 0) {
      alerts.push({ type: 'info', text: 'Немає операцій за цей місяць' });
    }
    _state.accounts.forEach(acc => {
      if ((acc.balance || 0) < 0) {
        alerts.push({ type: 'error', text: `Від'ємний баланс: ${acc.name} (${fmt(acc.balance, acc.currency)})` });
      }
    });
    if (expense > income && income > 0) {
      alerts.push({ type: 'warn', text: `Витрати перевищують доходи на ${fmt(expense - income)}` });
    }
    if (margin < 10 && income > 0) {
      alerts.push({ type: 'warn', text: `Низька маржа: ${margin}% (норма > 15%)` });
    }
    if (alerts.length === 0) {
      alerts.push({ type: 'ok', text: 'Все в нормі — сигналів немає' });
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
          <div style="font-size:0.8rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${acc.name}</div>
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
        topEl.innerHTML = '<div style="color:#9ca3af;font-size:0.8rem;">Витрат немає</div>';
      } else {
        const maxAmt = sorted[0].amt;
        topEl.innerHTML = sorted.map(item => `
          <div style="margin-bottom:0.6rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem;">
              <div style="font-size:0.78rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${item.name}</div>
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
        .map(([id, amt]) => ({ name: catMap[id] || 'Інше', amt }))
        .sort((a, b) => b.amt - a.amt).slice(0, 6);
      if (sorted.length === 0) {
        donutEl.innerHTML = '<div style="color:#9ca3af;font-size:0.8rem;">Витрат немає</div>';
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
            fill="${COLORS[i]}" opacity="0.85"><title>${item.name}: ${fmt(item.amt)}</title></path>`;
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
          projEl.innerHTML = '<div style="color:#9ca3af;font-size:0.8rem;">Транзакцій по проектах немає</div>';
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
          pfEl.innerHTML = '<div style="color:#9ca3af;font-size:0.8rem;">Бюджет не встановлено. Перейдіть у «Планування».</div>';
        } else {
          const rows = [
            { label: 'Витрати (план/факт)', plan: totalBudget, fact: expense, inverse: true },
            { label: 'Прибуток (ціль/факт)', plan: goalProfit, fact: profit, inverse: false },
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
                Дебіторська >30 днів: ${overdue.length} рахунків на ${fmt(debtTotal)}
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
        label: d.toLocaleDateString('uk-UA', {month:'short'}),
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
          <title>${m.label}: дохід ${fmt(m.income)} / витрати ${fmt(m.expense)}</title>
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
    if (chartEl2) chartEl2.innerHTML = '<div style="color:#9ca3af;font-size:0.78rem;">Графік недоступний</div>';
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
  const label = type === 'income' ? 'Доходи' : 'Витрати';
  const color  = type === 'income' ? '#22c55e' : '#ef4444';
  const cats   = _state.categories[type] || [];

  // Місяці для фільтра (поточний + 5 попередніх)
  const monthOpts = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const lbl = d.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
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
          ">${I.plus} Додати</button>
        ` : ''}
      </div>

      <!-- Фільтри -->
      <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">
        <select id="txFilterMonth" onchange="window._txFilterChange('month',this.value,'${type}')"
          style="padding:0.4rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">Всі місяці</option>
          ${monthOpts.join('')}
        </select>
        <select id="txFilterCat" onchange="window._txFilterChange('categoryId',this.value,'${type}')"
          style="padding:0.4rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">Всі категорії</option>
          ${cats.map(c => `<option value="${c.id}" ${_txFilter.categoryId===c.id?'selected':''}>${c.name}</option>`).join('')}
        </select>
        <select id="txFilterAcc" onchange="window._txFilterChange('accountId',this.value,'${type}')"
          style="padding:0.4rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">Всі рахунки</option>
          ${_state.accounts.map(a => `<option value="${a.id}" ${_txFilter.accountId===a.id?'selected':''}>${a.name}</option>`).join('')}
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
          <div style="font-size:0.85rem;">Завантаження...</div>
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
      query = query.where('date', '>=', from).where('date', '<=', to).orderBy('date', 'desc');
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
          <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.25rem;">Транзакцій немає</div>
          <div style="font-size:0.8rem;">Змініть фільтри або додайте нову операцію</div>
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
              ${tx.description || catName}
            </div>
            <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.1rem;">
              ${catName} &bull; ${accName} &bull; ${dateStr}
              ${tx.counterparty ? ' &bull; ' + escHtml(tx.counterparty) : ''}
              ${tx.functionId ? ' &bull; <span style="color:#16a34a;">Ф</span>' : ''}
              ${tx.projectId  ? ' &bull; <span style="color:#3b82f6;">П</span>' : ''}
            </div>
          </div>
          <div style="font-size:0.95rem;font-weight:700;color:${color};flex-shrink:0;">
            ${type==='income'?'+':'−'}${fmt(tx.amount, tx.currency)}
          </div>
          ${isOwnerOrManager() ? `
            <button onclick="window._financeDeleteTx('${tx.id}','${type}')"
              style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:0.25rem;border-radius:6px;flex-shrink:0;"
              title="Видалити">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          ` : ''}
        </div>
      `;
    }).join('');

    if (summaryEl) {
      summaryEl.innerHTML = `Всього: <strong style="color:${color};">${fmt(total)}</strong> &bull; ${txs.length} операцій`;
    }

  } catch(e) {
    console.error('[Finance] loadTxList error:', e);
    listEl.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#ef4444;font-size:0.85rem;">Помилка завантаження: ${e.message}</div>`;
  }
}

// ════════════════════════════════════════════════════════════
// ── INVOICES — Рахунки клієнтам ─────────────────────────────
// ════════════════════════════════════════════════════════════

async function _loadFunctionsCache() {
  try {
    const db = getDb();
    if (!db || !_state.companyId) return;
    const snap = await db.collection('companies').doc(_state.companyId)
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
    draft:    { label: 'Чернетка',  bg: '#f3f4f6', color: '#6b7280' },
    sent:     { label: 'Надіслано', bg: '#eff6ff', color: '#3b82f6' },
    paid:     { label: 'Оплачено',  bg: '#f0fdf4', color: '#16a34a' },
    overdue:  { label: 'Прострочено', bg: '#fef2f2', color: '#dc2626' },
    cancelled:{ label: 'Скасовано', bg: '#f9fafb', color: '#9ca3af' },
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
    query = query.where('date', '>=', from).where('date', '<=', to).orderBy('date', 'desc');
  } else {
    query = query.limit(EXPORT_LIMIT);
  }
  if (_txFilter.categoryId) query = query.where('categoryId', '==', _txFilter.categoryId);

  const snap = await query.get();

  // Попередження якщо досягли ліміту — дані можуть бути обрізані
  if (!_txFilter.month && snap.docs.length >= EXPORT_LIMIT) {
    if (typeof showToast === 'function')
      showToast(`⚠ Показано перші ${EXPORT_LIMIT} записів. Для повного експорту виберіть конкретний місяць.`, 'warn', 6000);
  }

  const catMap = {};
  [...(_state.categories.income || []), ...(_state.categories.expense || [])].forEach(c => { catMap[c.id] = c.name; });
  const accMap = {};
  (_state.accounts || []).forEach(a => { accMap[a.id] = a.name; });

  return snap.docs.map(d => {
    const tx = d.data();
    const dt = tx.date?.toDate ? tx.date.toDate() : new Date((tx.date?.seconds || 0) * 1000);
    return {
      Дата:             dt.toLocaleDateString('uk-UA'),
      Тип:              tx.type === 'income' ? 'Дохід' : 'Витрата',
      Сума:             tx.amount || 0,
      Валюта:           tx.currency || _state.currency || 'EUR',
      'Сума (базова)':  tx.amountBase != null ? tx.amountBase : (tx.amount || 0),
      'Баз. валюта':    _state.currency || 'EUR',
      Категорія:        catMap[tx.categoryId] || tx.categoryName || '',
      Рахунок:          accMap[tx.accountId] || '',
      Контрагент:       tx.counterparty || '',
      Опис:             tx.description || '',
      Проект:           tx.projectId || '',
      Функція:          tx.functionId || '',
    };
  });
}

window._exportTx = async function(type) {
  try {
    const rows = await _getTxForExport(type);
    if (!rows.length) { if (typeof showToast === 'function') showToast('Немає даних для експорту', 'warn'); return; }

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
    if (typeof showToast === 'function') showToast(`Експортовано ${rows.length} записів`, 'success');
  } catch(e) { alert('Помилка експорту: ' + e.message); }
};

window._exportTxXlsx = async function(type) {
  try {
    const rows = await _getTxForExport(type);
    if (!rows.length) { if (typeof showToast === 'function') showToast('Немає даних для експорту', 'warn'); return; }

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
    const wbXml = `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Фінанси" sheetId="1" r:id="rId1"/></sheets></workbook>`;
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
      if (typeof showToast === 'function') showToast(`Excel: експортовано ${rows.length} записів`, 'success');
    } else {
      // Завантажуємо JSZip динамічно
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => window._exportTxXlsx(type);
      document.head.appendChild(script);
      if (typeof showToast === 'function') showToast('Завантаження бібліотеки...', 'info', 2000);
    }
  } catch(e) { alert('Помилка Excel експорту: ' + e.message); }
};

// ── Переказ між рахунками ─────────────────────────────────
window._financeTransfer = function() {
  if (!isOwnerOrManager()) return;
  const accs = _state.accounts || [];
  if (accs.length < 2) {
    if (typeof showToast === 'function') showToast('Потрібно мінімум 2 рахунки для переказу', 'warn');
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
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">⇄ Переказ між рахунками</div>
        <button onclick="document.getElementById('transferModal')?.remove()"
          style="background:none;border:none;font-size:1.2rem;color:#9ca3af;cursor:pointer;padding:2px;">✕</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">Звідки</label>
          <select id="trFrom" style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
            ${accOpts}
          </select>
        </div>
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">Куди</label>
          <select id="trTo" style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
            ${accOpts}
          </select>
        </div>
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">Сума</label>
          <input id="trAmount" type="number" min="0.01" step="0.01" placeholder="0.00"
            style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:4px;">Примітка (необов'язково)</label>
          <input id="trNote" type="text" placeholder="напр. Поповнення каси"
            style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
        </div>
      </div>

      <div style="display:flex;gap:0.5rem;margin-top:1.25rem;">
        <button onclick="document.getElementById('transferModal')?.remove()"
          style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#374151;cursor:pointer;font-size:0.85rem;">
          Скасувати
        </button>
        <button onclick="window._doTransfer()"
          style="flex:1;padding:10px;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:0.85rem;font-weight:600;">
          Переказати
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // Автоматично вибираємо різні рахунки
  const toSel = document.getElementById('trTo');
  if (toSel && accs.length >= 2) toSel.value = accs[1].id;
};

window._doTransfer = async function() {
  if (!_state.companyId || !_state.initialized) { if (typeof showToast === 'function') showToast('Фінанси не ініціалізовані', 'error'); return; }
  const fromId = document.getElementById('trFrom')?.value;
  const toId   = document.getElementById('trTo')?.value;
  const amount = parseFloat(document.getElementById('trAmount')?.value || 0);
  const note   = document.getElementById('trNote')?.value?.trim() || '';

  if (!fromId || !toId) return;
  if (fromId === toId) { if (typeof showToast === 'function') showToast('Оберіть різні рахунки', 'warn'); return; }
  if (!amount || amount <= 0) { if (typeof showToast === 'function') showToast('Введіть суму', 'warn'); return; }

  const fromAcc = _state.accounts.find(a => a.id === fromId);
  if (fromAcc && (fromAcc.balance || 0) < amount) {
    if (typeof showToast === 'function') showToast(`Недостатньо коштів: ${fmt(fromAcc.balance)}`, 'error');
    return;
  }

  const btn = document.querySelector('#transferModal button[onclick="window._doTransfer()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Збереження...'; }

  try {
    const db = getDb();
    const companyId = _state.companyId;
    const ts = firebase.firestore.Timestamp.now();
    const desc = note || `Переказ між рахунками`;

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
        <div style="font-size:0.8rem;color:#374151;overflow:hidden;text-overflow:ellipsis;max-width:55%;">${acc.name}</div>
        <div style="font-size:0.82rem;font-weight:600;color:#1a1a1a;">${fmt(acc.balance, acc.currency)}</div>
      </div>`).join('');

    if (typeof showToast === 'function') showToast(`Переказ ${fmt(amount)} виконано`, 'success');
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Переказати'; }
    alert('Помилка переказу: ' + e.message);
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
          { label: 'Виставлено',   val: fmt(total, currency),   color: '#22c55e' },
          { label: 'Оплачено',     val: fmt(paid, currency),    color: '#16a34a' },
          { label: 'Очікує оплати',val: fmt(pending, currency), color: '#f59e0b' },
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
            ${I.plus} Новий рахунок
          </button>
        </div>` : ''}

      <!-- Список -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
        ${invoices.length === 0 ? `
          <div style="text-align:center;padding:40px;color:#9ca3af;">
            <div style="font-size:2rem;margin-bottom:8px;">📄</div>
            <div style="font-weight:600;margin-bottom:4px;">Рахунків ще немає</div>
            <div style="font-size:0.85rem;">Натисніть «Новий рахунок» щоб створити перший</div>
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
        ${isOwnerOrManager() ? `
          ${inv.status !== 'paid' ? `<button onclick="window._invoiceMarkPaid('${inv.id}')" title="Оплачено"
            style="border:1px solid #d1fae5;background:#f0fdf4;border-radius:7px;padding:5px 8px;cursor:pointer;color:#16a34a;">${I.check}</button>` : ''}
          <button onclick="window._invoiceEdit('${inv.id}')" title="Редагувати"
            style="border:1px solid #e5e7eb;background:#fff;border-radius:7px;padding:5px 8px;cursor:pointer;color:#6b7280;">${I.edit}</button>
          <button onclick="window._invoiceDelete('${inv.id}')" title="Видалити"
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
        <div style="font-size:1.1rem;font-weight:700;color:#1a1a1a;">${isEdit ? 'Редагувати рахунок' : 'Новий рахунок'}</div>
        <button onclick="document.getElementById('invoiceModal')?.remove()" style="border:none;background:#f3f4f6;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.1rem;">×</button>
      </div>

      <!-- Body -->
      <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;">

        <!-- Номер та дата -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Номер рахунку</label>
            <input id="inv_number" value="${escHtml(inv?.number || nextNum)}"
              style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Дата</label>
            <input id="inv_date" type="date" value="${inv?.date || new Date().toISOString().split('T')[0]}"
              style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
        </div>

        <!-- Клієнт -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Клієнт (назва / ПІБ)</label>
          <input id="inv_client" value="${escHtml(inv?.clientName || prefillClient || '')}" placeholder="ТОВ «Назва» або Іваненко І.І."
            style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Реквізити клієнта -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Реквізити клієнта</label>
          <textarea id="inv_client_details" rows="2" placeholder="ЄДРПОУ, адреса, IBAN..."
            style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.85rem;resize:vertical;box-sizing:border-box;">${escHtml(inv?.clientDetails || '')}</textarea>
        </div>

        <!-- Позиції -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:8px;">Позиції</label>
          <div id="inv_items_list" style="display:flex;flex-direction:column;gap:6px;"></div>
          <button onclick="window._invAddLine()" style="margin-top:8px;border:1px dashed #d1d5db;background:#f9fafb;border-radius:8px;padding:7px 14px;font-size:0.82rem;color:#6b7280;cursor:pointer;width:100%;">+ Додати рядок</button>
        </div>

        <!-- ПДВ -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:end;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">ПДВ (%)</label>
            <input id="inv_vat" type="number" min="0" max="100" value="${inv?.vatPct ?? 0}"
              oninput="window._invRecalc()"
              style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
          <div id="inv_totals_block" style="text-align:right;font-size:0.85rem;color:#374151;"></div>
        </div>

        <!-- Примітки -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Примітки / реквізити для оплати</label>
          <textarea id="inv_notes" rows="3" placeholder="IBAN, банк, призначення платежу..."
            style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:0.85rem;resize:vertical;box-sizing:border-box;">${escHtml(inv?.notes || '')}</textarea>
        </div>

        <!-- FIX CG: hidden CRM deal link -->
        <input type="hidden" id="inv_crm_deal_id" value="${escHtml(inv?.crmDealId || crmDealId || '')}">

      </div>

      <!-- Footer -->
      <div style="display:flex;gap:10px;justify-content:flex-end;padding:16px 24px;border-top:1px solid #f3f4f6;">
        <button onclick="document.getElementById('invoiceModal')?.remove()"
          style="border:1px solid #e5e7eb;background:#fff;border-radius:10px;padding:9px 20px;font-size:0.9rem;cursor:pointer;color:#374151;">Скасувати</button>
        <button id="inv_save_btn" onclick="window._invoiceSave('${inv?.id || ''}')"
          style="background:#22c55e;color:#fff;border:none;border-radius:10px;padding:9px 20px;font-size:0.9rem;font-weight:600;cursor:pointer;">${isEdit ? 'Зберегти' : 'Створити'}</button>
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
      <input value="${escHtml(it.desc)}" placeholder="Опис послуги/товару"
        oninput="window._invLineChange(${idx},'desc',this.value)"
        style="border:1px solid #e5e7eb;border-radius:7px;padding:6px 10px;font-size:0.82rem;box-sizing:border-box;">
      <input type="number" value="${it.qty}" min="0" placeholder="Кіл."
        oninput="window._invLineChange(${idx},'qty',this.value)"
        style="border:1px solid #e5e7eb;border-radius:7px;padding:6px 8px;font-size:0.82rem;box-sizing:border-box;text-align:right;">
      <input type="number" value="${it.price}" min="0" placeholder="Ціна"
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
    <div>Підсумок: <strong>${fmt(subtotal, currency)}</strong></div>
    ${vatPct > 0 ? `<div>ПДВ ${vatPct}%: <strong>${fmt(vat, currency)}</strong></div>` : ''}
    <div style="font-size:1rem;font-weight:700;color:#22c55e;margin-top:2px;">До сплати: ${fmt(total, currency)}</div>`;
};

// ── Збереження ─────────────────────────────────────────────
window._invoiceSave = async function(editId) {
  const btn = document.getElementById('inv_save_btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Зберігаємо...'; }

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
  if (!data.number) { alert('Вкажіть номер рахунку'); if (btn) { btn.disabled = false; btn.textContent = 'Зберегти'; } return; }
  if (!data.clientName) { alert('Вкажіть клієнта'); if (btn) { btn.disabled = false; btn.textContent = 'Зберегти'; } return; }

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
    alert('Помилка: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Зберегти'; }
  }
};

// ── Позначити оплаченим ────────────────────────────────────
window._invoiceMarkPaid = async function(id) {
  // FIX CA: use showConfirmModal instead of native confirm + emit INVOICE_PAID for automation
  const confirmed = typeof showConfirmModal === 'function'
    ? await showConfirmModal('Позначити рахунок як оплачений?')
    : confirm('Позначити рахунок як оплачений?');
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
  } catch(e) { if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error'); else alert('Помилка: ' + e.message); }
};

// ── Видалення ─────────────────────────────────────────────
window._invoiceDelete = async function(id) {
  if (!confirm('Видалити рахунок? Це незворотно.')) return;
  try {
    await colRef('finance_invoices').doc(id).delete();
    _state.invoices = _state.invoices.filter(i => i.id !== id);
    renderSubTab('invoices');
  } catch(e) { alert('Помилка: ' + e.message); }
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
  doc.text(`Дата: ${inv.date || '—'}`, pageW - margin - 60, y);

  // Клієнт
  y += 12;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y - 4, pageW - margin * 2, 20, 3, 3, 'F');
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('КЛІЄНТ:', margin + 4, y + 2);
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
  doc.text('Опис', margin + 3, y + 5.5);
  doc.text('Кіл.', pageW - margin - 55, y + 5.5);
  doc.text('Ціна', pageW - margin - 38, y + 5.5);
  doc.text('Сума', pageW - margin - 16, y + 5.5);

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

  addRow('Підсумок:', subtotal.toFixed(2) + ' ' + currency, false);
  if (vatPct > 0) addRow(`ПДВ ${vatPct}%:`, vat.toFixed(2) + ' ' + currency, false);
  addRow('ДО СПЛАТИ:', total.toFixed(2) + ' ' + currency, true);

  // Примітки
  if (inv.notes) {
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Реквізити для оплати:', margin, y);
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
    <div style="max-width:860px;margin:0 auto;">

      <!-- Заголовок -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem;">
        <div>
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:#1a1a1a;">Регулярні платежі</h3>
          <p style="margin:0.25rem 0 0;font-size:0.82rem;color:#6b7280;">Автоматичне списання/нарахування в заданий день місяця</p>
        </div>
        ${isOwnerOrManager() ? `
          <button onclick="window._finAddRecurring()" style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:0.85rem;font-weight:600;">
            ${I.plus} Додати платіж
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
          <p style="margin:0.75rem 0 0;font-size:0.9rem;">Регулярних платежів ще немає</p>
          <p style="margin:0.25rem 0 0;font-size:0.8rem;">Додайте оренду, зарплату, підписки — вони будуть списуватись автоматично</p>
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
      <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.2rem;">щомісяця</div>
    </div>
  `;
  return card('Регулярні витрати', monthlyExpense, '#ef4444', 'expense')
       + card('Регулярні доходи',  monthlyIncome,  '#22c55e', 'income')
       + card('Чисто/міс',         monthlyIncome - monthlyExpense, monthlyIncome >= monthlyExpense ? '#22c55e' : '#ef4444', 'wallet');
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
        ${I.repeat} Найближчі платежі цього місяця
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
  const freqLabel = { monthly: 'Щомісяця', quarterly: 'Щоквартально', yearly: 'Щороку' }[item.frequency] || 'Щомісяця';
  const typeColor = item.type === 'expense' ? '#ef4444' : '#22c55e';
  const typeLabel = item.type === 'expense' ? 'Витрата' : 'Дохід';

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
        <div style="font-size:0.72rem;color:#9ca3af;">/міс</div>
      </div>

      <!-- Дії -->
      ${isOwnerOrManager() ? `
        <div style="display:flex;gap:0.4rem;flex-shrink:0;">
          <button onclick="window._finToggleRecurring('${item.id}')" title="${active ? 'Призупинити' : 'Активувати'}"
            style="width:30px;height:30px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;">
            ${active ? I.pause : I.play}
          </button>
          <button onclick="window._finEditRecurring('${item.id}')" title="Редагувати"
            style="width:30px;height:30px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;">
            ${I.edit}
          </button>
          <button onclick="window._finDeleteRecurring('${item.id}')" title="Видалити"
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
    { v: 'monthly',     l: 'Щомісяця'      },
    { v: 'quarterly',   l: 'Щоквартально'  },
    { v: 'yearly',      l: 'Щороку'        },
  ];

  const days = Array.from({length:28}, (_,i) => i+1);

  showInputModal('', '', { skipInput: true }); // закрити якщо відкрито

  const overlay = document.createElement('div');
  overlay.id = 'recurringModal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:15000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:1rem;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;border-bottom:1px solid #f3f4f6;">
        <h3 style="margin:0;font-size:1rem;font-weight:700;">${existing ? 'Редагувати' : 'Новий'} регулярний платіж</h3>
        <button onclick="document.getElementById('recurringModal')?.remove()" style="border:none;background:#f3f4f6;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.1rem;">×</button>
      </div>
      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">

        <!-- Назва -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Назва платежу *</label>
          <input id="rec_name" value="${escHtml(existing?.name || '')}" placeholder="Оренда офісу, Зарплата, Netflix..." 
            style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Тип -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Тип</label>
          <div style="display:flex;gap:0.5rem;">
            <button id="rec_type_expense" onclick="_recSetType('expense')"
              style="flex:1;padding:8px;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;border:2px solid ${!existing || existing.type==='expense' ? '#ef4444' : '#e5e7eb'};background:${!existing || existing.type==='expense' ? '#fef2f2' : '#fff'};color:${!existing || existing.type==='expense' ? '#ef4444' : '#6b7280'};">
              Витрата
            </button>
            <button id="rec_type_income" onclick="_recSetType('income')"
              style="flex:1;padding:8px;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;border:2px solid ${existing?.type==='income' ? '#22c55e' : '#e5e7eb'};background:${existing?.type==='income' ? '#f0fdf4' : '#fff'};color:${existing?.type==='income' ? '#22c55e' : '#6b7280'};">
              Дохід
            </button>
          </div>
          <input type="hidden" id="rec_type" value="${existing?.type || 'expense'}">
        </div>

        <!-- Сума + валюта -->
        <div style="display:grid;grid-template-columns:1fr auto;gap:0.5rem;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Сума *</label>
            <input id="rec_amount" type="number" min="0" value="${existing?.amount || ''}" placeholder="0"
              style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Валюта</label>
            <select id="rec_currency" style="border:1px solid #d1d5db;border-radius:8px;padding:8px 10px;font-size:0.9rem;height:38px;">
              ${['UAH','EUR','USD','PLN','CZK'].map(c => `<option ${(existing?.currency||currency)===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Категорія -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Категорія</label>
          <select id="rec_category" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
            <option value="">— Оберіть категорію —</option>
            ${allCats.map(c => `<option ${existing?.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>

        <!-- Частота + день -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Частота</label>
            <select id="rec_freq" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
              ${freqOptions.map(f => `<option value="${f.v}" ${existing?.frequency===f.v?'selected':''}>${f.l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">День місяця</label>
            <select id="rec_day" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
              ${days.map(d => `<option ${existing?.dayOfMonth===d?'selected':''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Контрагент -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Контрагент</label>
          <input id="rec_counterparty" value="${escHtml(existing?.counterparty || '')}" placeholder="Орендодавець, постачальник..."
            style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Коментар -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Коментар</label>
          <input id="rec_comment" value="${escHtml(existing?.comment || '')}" placeholder="Необов'язково"
            style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;box-sizing:border-box;">
        </div>

        <!-- Рахунок -->
        <div>
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Рахунок</label>
          <select id="rec_account" style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;">
            ${(_state.accounts||[]).map(a => `<option value="${a.id}" ${existing?.accountId===a.id?'selected':''}>${escHtml(a.name)}</option>`).join('')}
          </select>
        </div>

        <!-- Кнопки -->
        <div style="display:flex;gap:0.5rem;padding-top:0.5rem;">
          <button onclick="document.getElementById('recurringModal')?.remove()"
            style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;font-size:0.9rem;color:#6b7280;">
            Скасувати
          </button>
          <button onclick="window._finSaveRecurring('${editId || ''}')"
            style="flex:2;padding:10px;background:#22c55e;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:0.9rem;font-weight:700;">
            ${existing ? 'Зберегти зміни' : 'Додати платіж'}
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
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
  if (!name) { showToast('Введіть назву платежу', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Введіть суму', 'error'); return; }

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
    const colRef = db.collection('companies').doc(_state.companyId).collection('finance_recurring');
    if (editId) {
      await colRef.doc(editId).update(data);
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await colRef.add(data);
    }
    document.getElementById('recurringModal')?.remove();
    await _loadRecurring();
    renderSubTab('recurring');
    showToast(editId ? 'Платіж оновлено' : 'Платіж додано', 'success');
  } catch(e) {
    console.error('[Recurring save]', e);
    showToast('Помилка: ' + e.message, 'error');
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
    await db.collection('companies').doc(_state.companyId)
      .collection('finance_recurring').doc(id)
      .update({ active: newActive, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    await _loadRecurring();
    renderSubTab('recurring');
    showToast(newActive ? 'Платіж активовано' : 'Платіж призупинено', 'success');
  } catch(e) {
    showToast('Помилка: ' + e.message, 'error');
  }
};

window._finDeleteRecurring = async function(id) {
  if (!await showConfirmModal('Видалити регулярний платіж? Минулі транзакції залишаться.', { danger: true })) return;
  try {
    await db.collection('companies').doc(_state.companyId)
      .collection('finance_recurring').doc(id).delete();
    _state.recurring = (_state.recurring || []).filter(r => r.id !== id);
    renderSubTab('recurring');
    showToast('Видалено', 'success');
  } catch(e) {
    showToast('Помилка: ' + e.message, 'error');
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

  const colRef = db.collection('companies').doc(_state.companyId).collection('finance_transactions');
  const recurRef = db.collection('companies').doc(_state.companyId).collection('finance_recurring');

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
    const snap = await db.collection('companies').doc(_state.companyId)
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
    const lbl = d.toLocaleDateString('uk-UA',{month:'long',year:'numeric'});
    return `<option value="${val}" ${_funcFilter.month===val?'selected':''}>${lbl}</option>`;
  }).join('');

  el.innerHTML = `
    <div style="width:100%;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">Фінанси по функціях</div>
        <select id="funcFilterMonth" onchange="window._funcMonthChange(this.value)"
          style="padding:0.35rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
          <option value="">Всі місяці</option>
          ${monthOpts}
        </select>
      </div>

      <!-- Зведена таблиця -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:1rem;">
        <div style="display:grid;grid-template-columns:1fr 130px 130px 100px 120px;
          background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;
          padding:0.65rem 1rem;text-transform:uppercase;letter-spacing:.04em;">
          <div>Функція</div>
          <div style="text-align:right;">Дохід</div>
          <div style="text-align:right;">Витрати</div>
          <div style="text-align:right;">Маржа</div>
          <div style="text-align:right;">% від загальних</div>
        </div>
        <div id="funcTableBody">
          <div style="padding:2rem;text-align:center;color:#9ca3af;font-size:0.85rem;">Завантаження...</div>
        </div>
      </div>

      <!-- Графік по функціях -->
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
        <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:1rem;">Витрати по функціях</div>
        <div id="funcChart">
          <div style="color:#9ca3af;font-size:0.8rem;">Завантаження...</div>
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
    const funcsSnap = await db.collection('companies').doc(_state.companyId)
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
      rows.push({ name: 'Без функції', ...byFunc['__none__'] });
    }

    if (rows.length === 0) {
      tableEl.innerHTML = `
        <div style="padding:2rem;text-align:center;color:#9ca3af;font-size:0.85rem;">
          Транзакцій з прив'язкою до функцій немає.<br>
          <span style="font-size:0.78rem;">При додаванні транзакцій вибирайте поле «Функція»</span>
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
          <div style="font-size:0.85rem;font-weight:500;color:#1a1a1a;">${r.name}</div>
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
              <div style="font-size:0.78rem;color:#374151;font-weight:500;">${r.name}</div>
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
        Помилка: ${e.message}
      </div>`;
  }
}

// ── Планування (заглушка Етап 1) ─────────────────────────
// ── Планування — Етап 5 ──────────────────────────────────
let _planMonth = (() => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
})();

function renderPlanning(el) {
  const now = new Date();
  const monthOpts = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-i+1, 1);
    const val = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    const lbl = d.toLocaleDateString('uk-UA',{month:'long',year:'numeric'});
    return `<option value="${val}" ${_planMonth===val?'selected':''}>${lbl}</option>`;
  }).join('');

  el.innerHTML = `
    <div style="width:100%;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">Планування бюджету</div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <select id="planMonthSel" onchange="window._planMonthChange(this.value)"
            style="padding:0.35rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
            ${monthOpts}
          </select>
          <button onclick="window._savePlanBudget()"
            style="padding:0.35rem 0.9rem;background:#22c55e;color:#fff;border:none;border-radius:8px;font-size:0.8rem;font-weight:600;cursor:pointer;">
            Зберегти
          </button>
        </div>
      </div>

      <!-- Сигнали відхилень -->
      <div id="planAlerts" style="margin-bottom:1rem;"></div>

      <!-- Перемикач режиму -->
      <div style="display:flex;gap:6px;margin-bottom:1rem;">
        <button onclick="window._planMode('budget')" id="planModeBtn_budget"
          style="padding:6px 14px;border-radius:8px;border:2px solid #22c55e;background:#f0fdf4;color:#16a34a;font-size:0.8rem;font-weight:600;cursor:pointer;">
          Бюджет по категоріях
        </button>
        <button onclick="window._planMode('functions')" id="planModeBtn_functions"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          Бюджет по функціях
        </button>
        <button onclick="window._planMode('cashflow')" id="planModeBtn_cashflow"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          Cashflow 30/60/90 днів
        </button>
      </div>

      <!-- 2 колонки: бюджет + cashflow -->
      <div id="planModeView_budget" style="display:grid;grid-template-columns:1fr 320px;gap:1rem;align-items:start;">

        <!-- Бюджет по категоріях -->
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <div style="background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;
            padding:0.65rem 1rem;text-transform:uppercase;letter-spacing:.04em;
            display:grid;grid-template-columns:1fr 110px 110px 90px;">
            <div>Категорія</div>
            <div style="text-align:right;">Бюджет</div>
            <div style="text-align:right;">Факт</div>
            <div style="text-align:right;">Відхилення</div>
          </div>
          <div id="planBudgetBody">
            <div style="padding:2rem;text-align:center;color:#9ca3af;font-size:0.85rem;">Завантаження...</div>
          </div>
        </div>

        <!-- Cashflow + ціль -->
        <div style="display:flex;flex-direction:column;gap:1rem;">

          <!-- Cashflow прогноз -->
          <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
            <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Cashflow місяця</div>
            <div id="planCashflow">
              <div style="color:#9ca3af;font-size:0.8rem;">Завантаження...</div>
            </div>
          </div>

          <!-- Фінансова ціль -->
          <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:1.25rem;">
            <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Фінансова ціль місяця</div>
            <div style="margin-bottom:0.5rem;">
              <label style="font-size:0.75rem;color:#6b7280;display:block;margin-bottom:0.2rem;">Цільовий прибуток (EUR)</label>
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
          <div style="text-align:center;color:#9ca3af;padding:2rem;">Завантаження...</div>
        </div>
      </div>

      <!-- Cashflow 30/60/90 -->
      <div id="planModeView_cashflow" style="display:none;">
        <div id="planCashflowForecast">
          <div style="text-align:center;color:#9ca3af;padding:2rem;">Завантаження...</div>
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
  ['budget','functions','cashflow'].forEach(m => {
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
    if (btn) { btn.textContent = '✓ Збережено'; setTimeout(()=>{ btn.textContent = 'Зберегти'; }, 1500); }
  } catch(e) {
    alert('Помилка збереження: ' + e.message);
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
      bodyEl.innerHTML = '<div style="padding:1.5rem;text-align:center;color:#9ca3af;font-size:0.82rem;">Немає категорій витрат</div>';
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
            <div style="font-size:0.82rem;color:#374151;">${cat.name}</div>
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
          <div style="font-size:0.78rem;font-weight:700;color:#6b7280;">РАЗОМ ВИТРАТИ</div>
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
            <span style="color:#6b7280;">Дохід факт</span>
            <span style="font-weight:600;color:#22c55e;">${fmt(totalIncome)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span style="color:#6b7280;">Витрати факт</span>
            <span style="font-weight:600;color:#ef4444;">${fmt(totalExpense)}</span>
          </div>
          <div style="border-top:1px solid #f3f4f6;padding-top:0.5rem;display:flex;justify-content:space-between;font-size:0.85rem;">
            <span style="color:#1a1a1a;font-weight:600;">Прибуток</span>
            <span style="font-weight:700;color:${profit>=0?'#22c55e':'#ef4444'};">${profit>=0?'+':''}${fmt(profit)}</span>
          </div>
          ${goalVal > 0 ? `
          <div style="margin-top:0.5rem;">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#6b7280;margin-bottom:0.3rem;">
              <span>Виконання цілі</span>
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
          Факт: <strong>${fmt(profit)}</strong> з <strong>${fmt(budgetData['goal'])}</strong>
        </div>
        <div style="height:8px;background:#f3f4f6;border-radius:4px;">
          <div style="height:8px;background:${pct>=100?'#22c55e':pct>=50?'#f59e0b':'#ef4444'};
            border-radius:4px;width:${pct}%;transition:width 0.3s;"></div>
        </div>
        <div style="font-size:0.75rem;color:${pct>=100?'#22c55e':pct>=50?'#f59e0b':'#ef4444'};
          margin-top:0.2rem;font-weight:600;">${pct}% виконано</div>
      `;
    }

  } catch(e) {
    console.error('[Finance] loadPlanningData:', e);
    const bodyEl = document.getElementById('planBudgetBody');
    if (bodyEl) bodyEl.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#ef4444;font-size:0.82rem;">Помилка: ${e.message}</div>`;
  }
}

// ── Сигнали відхилень бюджету ─────────────────────────────
function _renderPlanAlerts(expCats, factByCat, budgetData) {
  const el = document.getElementById('planAlerts');
  if (!el) return;
  const alerts = [];
  expCats.forEach(cat => {
    const budget = budgetData['cat_' + cat.id] || 0;
    if (budget <= 0) return;
    const fact = factByCat[cat.id] || 0;
    const overPct = Math.round((fact - budget) / budget * 100);
    if (overPct >= 25) alerts.push({ label: cat.name, pct: overPct, level: 'red' });
    else if (overPct >= 10) alerts.push({ label: cat.name, pct: overPct, level: 'yellow' });
  });
  if (alerts.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${alerts.map(a => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:10px;
          background:${a.level==='red'?'#fef2f2':'#fffbeb'};border:1px solid ${a.level==='red'?'#fecaca':'#fde68a'};">
          <span style="font-size:1rem;">${a.level==='red'?'🔴':'🟡'}</span>
          <span style="font-size:0.82rem;font-weight:600;color:${a.level==='red'?'#dc2626':'#d97706'};">
            ${escHtml(a.label)}: перевищення бюджету на +${a.pct}%
          </span>
        </div>`).join('')}
    </div>`;
}

// ── Бюджет по функціях ────────────────────────────────────
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
      el.innerHTML = '<div style="padding:2rem;text-align:center;color:#9ca3af;">Функції не знайдено. Створіть їх у розділі «Процеси».</div>';
      return;
    }

    el.innerHTML = `
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;
          padding:0.65rem 1rem;display:grid;grid-template-columns:1fr 80px 110px 80px 90px;">
          <div>Функція</div>
          <div style="text-align:right;">Норма %</div>
          <div style="text-align:right;">Факт сума</div>
          <div style="text-align:right;">Факт %</div>
          <div style="text-align:right;">Відхилення</div>
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
            <div style="font-size:0.78rem;color:#9ca3af;">Без функції</div>
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
          Зберегти норми
        </button>
      </div>`;
  } catch(e) {
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.82rem;">Помилка: ${e.message}</div>`;
  }
}

window._saveFuncNorms = async function() {
  const inputs = document.querySelectorAll('[data-func-norm]');
  const data = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
  inputs.forEach(inp => { data['func_norm_' + inp.dataset.funcNorm] = parseFloat(inp.value) || 0; });
  try {
    await colRef('finance_budgets').doc(_planMonth).set(data, { merge: true });
    if (typeof showToast === 'function') showToast('Норми збережено', 'success');
  } catch(e) { alert('Помилка: ' + e.message); }
};

// ── Cashflow прогноз 30/60/90 днів ───────────────────────
async function _renderCashflowForecast() {
  const el = document.getElementById('planCashflowForecast');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:2rem;">Розраховую прогноз...</div>';

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
          ⚠️ Прогнозується від'ємний залишок: ${fmt(minBalance, currency)}
        </div>` : ''}

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
        ${results.map(r => `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;text-align:center;">
            <div style="font-size:0.72rem;color:#6b7280;margin-bottom:4px;">Через ${r.days} днів</div>
            <div style="font-size:1.1rem;font-weight:700;color:${r.balance>=0?'#22c55e':'#ef4444'};">
              ${fmt(r.balance, currency)}
            </div>
          </div>`).join('')}
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
        <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:12px;">Поточний стан</div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:8px;">
          <span style="color:#6b7280;">Залишок на рахунках</span>
          <span style="font-weight:700;color:#22c55e;">${fmt(totalBalance, currency)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:8px;">
          <span style="color:#6b7280;">Регулярні витрати / міс.</span>
          <span style="font-weight:600;color:#ef4444;">
            ${fmt(recurring.filter(r=>r.active!==false&&r.frequency==='monthly').reduce((s,r)=>s+(r.amount||0),0), currency)}
          </span>
        </div>
        <div style="border-top:1px solid #f3f4f6;padding-top:8px;font-size:0.75rem;color:#9ca3af;">
          Прогноз базується на поточному залишку та регулярних витратах
        </div>
      </div>`;
  } catch(e) {
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.82rem;">Помилка: ${e.message}</div>`;
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
        <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">Аналітика</div>
        <div style="display:flex;gap:6px;">
          <select id="analyticsPeriodSel" onchange="window._analyticsPeriodChange(this.value)"
            style="padding:5px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
            <option value="month">Цей місяць</option>
            <option value="quarter">Цей квартал</option>
            <option value="year">Цей рік</option>
          </select>
        </div>
      </div>

      <!-- Перемикач режиму -->
      <div style="display:flex;gap:6px;margin-bottom:1rem;flex-wrap:wrap;">
        <button onclick="window._analyticsMode('pnl')" id="anlBtn_pnl"
          style="padding:6px 14px;border-radius:8px;border:2px solid #22c55e;background:#f0fdf4;color:#16a34a;font-size:0.8rem;font-weight:600;cursor:pointer;">
          P&L звіт
        </button>
        <button onclick="window._analyticsMode('projects')" id="anlBtn_projects"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          Маржа по проектах
        </button>
        <button onclick="window._analyticsMode('trends')" id="anlBtn_trends"
          style="padding:6px 14px;border-radius:8px;border:2px solid #e5e7eb;background:#fff;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;">
          Тренд витрат
        </button>
      </div>

      <div id="analyticsContent">
        <div style="text-align:center;color:#9ca3af;padding:2rem;">Завантаження...</div>
      </div>
    </div>`;

  _loadAnalytics(_analyticsMode, _analyticsPeriod);
}

window._analyticsMode = function(mode) {
  _analyticsMode = mode;
  ['pnl','projects','trends'].forEach(m => {
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
  el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:2rem;">Завантаження...</div>';

  try {
    const currency = _state.currency || 'EUR';
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
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.82rem;">Помилка: ${e.message}</div>`;
  }
}

// ── P&L звіт ─────────────────────────────────────────────
function _renderPnl(el, txs, currency, from, to) {
  const incCats = _state.categories.income  || [];
  const expCats = _state.categories.expense || [];

  const byIncCat = {}, byExpCat = {};
  let totalInc = 0, totalExp = 0;

  txs.forEach(tx => {
    if (tx.type === 'income') {
      byIncCat[tx.categoryId] = (byIncCat[tx.categoryId] || 0) + txAmt(tx);
      totalInc += txAmt(tx);
    } else {
      byExpCat[tx.categoryId] = (byExpCat[tx.categoryId] || 0) + txAmt(tx);
      totalExp += txAmt(tx);
    }
  });

  const profit = totalInc - totalExp;
  const margin = totalInc > 0 ? Math.round(profit / totalInc * 100) : 0;
  const profitColor = profit >= 0 ? '#22c55e' : '#ef4444';

  const catRow = (cat, amount, color) => {
    const pct = totalInc > 0 ? Math.round(amount / totalInc * 100) : 0;
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 14px;border-bottom:1px solid #f3f4f6;">
        <div style="flex:1;font-size:0.82rem;color:#374151;">${escHtml(cat.name)}</div>
        <div style="font-size:0.82rem;font-weight:600;color:${color};width:90px;text-align:right;">${fmt(amount, currency)}</div>
        <div style="font-size:0.75rem;color:#9ca3af;width:40px;text-align:right;">${pct}%</div>
      </div>`;
  };

  el.innerHTML = `
    <!-- KPI рядок -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
      ${[
        { label: 'Дохід',    val: fmt(totalInc, currency),  color: '#22c55e' },
        { label: 'Витрати',  val: fmt(totalExp, currency),  color: '#ef4444' },
        { label: 'Прибуток', val: fmt(profit, currency),    color: profitColor },
        { label: 'Маржа',    val: margin + '%',             color: profitColor },
      ].map(k => `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;text-align:center;">
          <div style="font-size:0.72rem;color:#6b7280;margin-bottom:4px;">${k.label}</div>
          <div style="font-size:1.1rem;font-weight:700;color:${k.color};">${k.val}</div>
        </div>`).join('')}
    </div>

    <!-- Таблиця P&L -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

      <!-- Доходи -->
      <div style="background:#f0fdf4;padding:8px 14px;font-size:0.75rem;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.04em;display:flex;justify-content:space-between;">
        <span>ДОХОДИ</span><span>${fmt(totalInc, currency)}</span>
      </div>
      ${incCats.filter(c => byIncCat[c.id]).map(c => catRow(c, byIncCat[c.id] || 0, '#22c55e')).join('')}
      ${!incCats.filter(c => byIncCat[c.id]).length ? '<div style="padding:10px 14px;font-size:0.82rem;color:#9ca3af;">Немає доходів</div>' : ''}

      <!-- Витрати -->
      <div style="background:#fef2f2;padding:8px 14px;font-size:0.75rem;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.04em;display:flex;justify-content:space-between;margin-top:4px;">
        <span>ВИТРАТИ</span><span>${fmt(totalExp, currency)}</span>
      </div>
      ${expCats.filter(c => byExpCat[c.id]).map(c => catRow(c, byExpCat[c.id] || 0, '#ef4444')).join('')}
      ${!expCats.filter(c => byExpCat[c.id]).length ? '<div style="padding:10px 14px;font-size:0.82rem;color:#9ca3af;">Немає витрат</div>' : ''}

      <!-- Підсумок -->
      <div style="background:#1f2937;color:#fff;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.85rem;font-weight:700;">ПРИБУТОК / ЗБИТОК</span>
        <span style="font-size:1rem;font-weight:700;color:${profitColor};">${profit >= 0 ? '+' : ''}${fmt(profit, currency)}</span>
      </div>
    </div>`;
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
        Немає транзакцій прив'язаних до проектів.<br>
        <span style="font-size:0.78rem;">При додаванні транзакції вкажіть «Проект».</span>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#1f2937;color:#fff;font-size:0.75rem;font-weight:600;padding:10px 14px;
        display:grid;grid-template-columns:1fr 100px 100px 100px 70px;text-transform:uppercase;">
        <div>Проект</div>
        <div style="text-align:right;">Дохід</div>
        <div style="text-align:right;">Витрати</div>
        <div style="text-align:right;">Прибуток</div>
        <div style="text-align:right;">Маржа</div>
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
      buckets.push({ key: d.getFullYear() + '-' + String(m+1).padStart(2,'0'), label: d.toLocaleDateString('uk-UA',{month:'short'}) });
    }
  } else if (period === 'quarter') {
    // 3 місяці
    for (let m = 0; m < 3; m++) {
      const d = new Date(from.getFullYear(), from.getMonth() + m, 1);
      buckets.push({ key: d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'), label: d.toLocaleDateString('uk-UA',{month:'short'}) });
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
    el.innerHTML = '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:2rem;text-align:center;color:#9ca3af;">Немає даних для відображення</div>';
    return;
  }

  const maxVal = Math.max(...catTotals.flatMap(({cat}) => buckets.map(b => byCatBucket[cat.id]?.[b.key] || 0)));
  const COLORS = ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];

  el.innerHTML = `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
      <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:16px;">Топ-5 категорій витрат по ${period === 'year' ? 'місяцях' : period === 'quarter' ? 'місяцях кварталу' : 'тижнях'}</div>

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
                  return pct > 0 ? `<div style="height:100%;width:${pct}%;background:${COLORS[i]};opacity:0.85;" title="${cat.name}: ${fmt(val, currency)}"></div>` : '';
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
              <th style="padding:6px 10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">Категорія</th>
              ${buckets.map(b => `<th style="padding:6px 8px;text-align:right;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">${b.label}</th>`).join('')}
              <th style="padding:6px 10px;text-align:right;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">Разом</th>
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
    el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:2rem;">Доступ лише для Owner та Manager</div>';
    return;
  }

  const renderCatList = (type) => {
    const cats = _state.categories[type] || [];
    const color = type === 'income' ? '#22c55e' : '#ef4444';
    const label = type === 'income' ? 'Доходи' : 'Витрати';
    return `
      <div style="margin-bottom:1.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">Категорії — ${label}</div>
          <button onclick="window._financeAddCategory('${type}')"
            style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.7rem;
            background:${color};color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;">
            ${I.plus} Додати
          </button>
        </div>
        <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
          ${cats.length === 0
            ? '<div style="padding:1rem;text-align:center;color:#9ca3af;font-size:0.82rem;">Немає категорій</div>'
            : cats.map((cat, i) => `
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;
                background:${i%2===0?'#fff':'#fafafa'};border-bottom:1px solid #f3f4f6;">
                <div style="flex:1;font-size:0.85rem;color:#1a1a1a;">${cat.name}</div>
                ${!cat.system ? `
                  <button onclick="window._financeDeleteCategory('${cat.id}','${type}')"
                    style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:0.2rem;">
                    ${I.trash}
                  </button>
                ` : '<span style="font-size:0.7rem;color:#9ca3af;">системна</span>'}
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  };

  const renderAccList = () => {
    return `
      <div style="margin-bottom:1.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">Рахунки та каси</div>
          <button onclick="window._financeAddAccount()"
            style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.7rem;
            background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;">
            ${I.plus} Додати
          </button>
        </div>
        <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
          ${_state.accounts.length === 0
            ? '<div style="padding:1rem;text-align:center;color:#9ca3af;font-size:0.82rem;">Немає рахунків</div>'
            : _state.accounts.map((acc, i) => `
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;
                background:${i%2===0?'#fff':'#fafafa'};border-bottom:1px solid #f3f4f6;">
                <div style="flex:1;">
                  <div style="font-size:0.85rem;color:#1a1a1a;">${acc.name}</div>
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
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">Налаштування фінансів</div>
      ${renderCatList('income')}
      ${renderCatList('expense')}
      ${renderAccList()}
      ${renderRatesBlock()}
    </div>
  `;
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
          placeholder="курс"
          style="width:90px;padding:4px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;text-align:right;">
        <div style="font-size:0.78rem;color:#6b7280;">${base}</div>
      </div>`;
  }).join('');

  return `
    <div style="margin-bottom:1.5rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">Курси валют</div>
          <div style="font-size:0.72rem;color:#6b7280;margin-top:2px;">Базова валюта: <b>${base}</b>. Скільки ${base} за 1 одиницю іноземної валюти.</div>
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button onclick="window._fetchRates()"
            style="display:flex;align-items:center;gap:4px;padding:0.35rem 0.7rem;border:1px solid #e5e7eb;
            border-radius:7px;background:#fff;color:#374151;cursor:pointer;font-size:0.78rem;font-weight:500;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Актуальні курси
          </button>
          <button onclick="window._saveRates()"
            style="padding:0.35rem 0.7rem;border:none;border-radius:7px;background:#22c55e;
            color:#fff;cursor:pointer;font-size:0.78rem;font-weight:600;">
            Зберегти
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
    if (st) st.textContent = 'Збережено ' + new Date().toLocaleTimeString('uk-UA');
    if (typeof showToast === 'function') showToast('Курси збережено', 'success');
  } catch(e) { alert('Помилка збереження: ' + e.message); }
};

window._fetchRates = async function() {
  const base = _state.currency || 'EUR';
  const st = document.getElementById('ratesStatus');
  if (st) st.textContent = 'Завантаження...';
  try {
    // Використовуємо відкритий API без ключа
    let resp;
    try {
      resp = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    } catch(netErr) {
      // Fallback — exchangerate-api (без ключа, обмежений)
      resp = await fetch(`https://open.er-api.com/v6/latest/${base}`);
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
    if (st) st.textContent = `Курси від ${data.date} (frankfurter.app)`;
  } catch(e) {
    if (st) st.textContent = 'Помилка отримання курсів: ' + e.message;
    if (typeof showToast === 'function') showToast('Не вдалося отримати курси. Введіть вручну.', 'warn');
  }
};

// Додавання категорії
window._financeAddCategory = async function(type) {
  const name = prompt(`Назва нової категорії (${type === 'income' ? 'дохід' : 'витрата'}):`);
  if (!name || !name.trim()) return;
  try {
    const ref = await colRef('finance_categories').add({
      name: name.trim(),
      type,
      system: false,
      icon: 'tag',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    _state.categories[type].push({ id: ref.id, name: name.trim(), type, system: false });
    renderSubTab('settings');
  } catch(e) {
    alert('Помилка: ' + e.message);
  }
};

// Видалення категорії
window._financeDeleteCategory = async function(catId, type) {
  if (!confirm('Видалити категорію?')) return;
  try {
    await colRef('finance_categories').doc(catId).delete();
    _state.categories[type] = _state.categories[type].filter(c => c.id !== catId);
    renderSubTab('settings');
  } catch(e) {
    alert('Помилка: ' + e.message);
  }
};

// Додавання рахунку
window._financeAddAccount = async function() {
  const name = prompt('Назва рахунку (напр. Monobank, Готівка USD):');
  if (!name || !name.trim()) return;
  const currency = prompt('Валюта (EUR / USD / UAH / PLN):', _state.currency) || _state.currency;
  const typeAcc  = prompt('Тип (bank / cash / card):', 'bank') || 'bank';
  try {
    const ref = await colRef('finance_accounts').add({
      name: name.trim(),
      type: typeAcc,
      currency: currency.toUpperCase(),
      balance: 0,
      isDefault: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    _state.accounts.push({ id: ref.id, name: name.trim(), type: typeAcc, currency: currency.toUpperCase(), balance: 0 });
    renderSubTab('settings');
  } catch(e) {
    alert('Помилка: ' + e.message);
  }
};

// ── AI (заглушка Етап 1) ──────────────────────────────────
// ── AI Аналітик фінансів — Етап 6 ───────────────────────
let _aiFinHistory = []; // локальна історія чату

function renderAI(el) {
  if (!isOwnerOrManager()) {
    el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:2rem;">Доступ лише для Owner та Manager</div>';
    return;
  }

  const quickBtns = [
    { label: 'Аналіз поточного місяця', q: 'Зроби детальний аналіз фінансів за поточний місяць: доходи, витрати, маржа, тренди.' },
    { label: 'Де витікають гроші?', q: 'Знайди категорії з найбільшими витратами і порівняй з попередніми місяцями. Де найбільший перевитрат?' },
    { label: 'Прогноз на наступний місяць', q: 'На основі поточних даних зроби прогноз доходів і витрат на наступний місяць.' },
    { label: 'Рекомендації по оптимізації', q: 'Дай конкретні рекомендації як збільшити прибуток і скоротити витрати на основі моїх даних.' },
  ];

  el.innerHTML = `
    <div style="width:100%;display:flex;flex-direction:column;gap:1rem;">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">AI-аналітик фінансів</div>
          <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.1rem;">Аналізує ваші реальні фінансові дані</div>
        </div>
        <button onclick="window._aiFinClear()"
          style="padding:0.3rem 0.7rem;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;font-size:0.75rem;cursor:pointer;color:#6b7280;">
          Очистити чат
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
          Задайте питання або оберіть швидкий аналіз вище
        </div>
      </div>

      <!-- Input -->
      <div style="display:flex;gap:0.5rem;">
        <input id="aiFinInput" type="text" placeholder="Задайте питання про ваші фінанси..."
          onkeydown="if(event.key==='Enter')window._aiFinSend()"
          style="flex:1;padding:0.6rem 0.9rem;border:1px solid #e5e7eb;border-radius:10px;
            font-size:0.85rem;outline:none;">
        <button onclick="window._aiFinSend()"
          style="padding:0.6rem 1.2rem;background:#22c55e;color:#fff;border:none;border-radius:10px;
            font-size:0.85rem;font-weight:600;cursor:pointer;white-space:nowrap;">
          Надіслати
        </button>
      </div>
    </div>
  `;
}

window._aiFinClear = function() {
  _aiFinHistory = [];
  const chat = document.getElementById('aiFinChat');
  if (chat) chat.innerHTML = '<div style="text-align:center;color:#9ca3af;font-size:0.82rem;margin:auto;">Чат очищено</div>';
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
      construction:  { marginMin:12, marginMax:25, labourPct:35, adminPct:10, name:'Будівництво/підряд' },
      medical:       { marginMin:20, marginMax:45, labourPct:50, adminPct:12, name:'Медичний бізнес' },
      dental:        { marginMin:25, marginMax:50, labourPct:45, adminPct:10, name:'Стоматологія' },
      beauty:        { marginMin:30, marginMax:55, labourPct:40, adminPct:8,  name:'Бьюті бізнес' },
      furniture:     { marginMin:15, marginMax:35, labourPct:30, adminPct:8,  name:'Меблевий бізнес' },
      retail:        { marginMin:10, marginMax:25, labourPct:20, adminPct:7,  name:'Роздрібна торгівля' },
      it:            { marginMin:30, marginMax:60, labourPct:55, adminPct:10, name:'IT / Послуги' },
      manufacturing: { marginMin:12, marginMax:28, labourPct:32, adminPct:8,  name:'Виробництво' },
    };
    const niche = _state.niche || 'general';
    const bench = BENCHMARKS[niche] || { marginMin:15, marginMax:35, labourPct:35, adminPct:10, name:'Бізнес' };

    const systemPrompt = `Ти стратегічний фінансовий аналітик для малого та середнього бізнесу.
Ніша клієнта: ${bench.name}. Регіон: ${_state.region==='EU'?'Європа':'Україна'}. Валюта: ${_state.currency||'EUR'}.

БЕНЧМАРКИ НІШІ "${bench.name}":
- Нормальна маржа: ${bench.marginMin}–${bench.marginMax}%
- ФОП/зарплата від виручки: до ${bench.labourPct}%
- Адміністративні від виручки: до ${bench.adminPct}%

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
- Формат: емодзі-маркери для кожного блоку (📊 Діагноз, 🔍 Причина, ⚠️ Наслідок, ✅ Дія)
- Максимум 4-5 речень на блок`;

    // Читаємо OpenAI ключ з settings/ai
    const sSnap = await getDb().collection('settings').doc('ai').get();
    const apiKey = sSnap.data()?.openaiApiKey || sSnap.data()?.apiKey || '';
    if (!apiKey) {
      const loadElNoKey = document.getElementById('aiFinLoading');
      if (loadElNoKey) loadElNoKey.remove();
      _appendAiMsg(chat, 'error', 'API ключ не налаштований. Перейдіть в Налаштування → AI і введіть OpenAI ключ.');
      chat.scrollTop = chat.scrollHeight;
      return;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ..._aiFinHistory
        ]
      })
    });

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || data.error?.message || 'Не вдалося отримати відповідь.';

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
    _appendAiMsg(chat, 'error', 'Помилка: ' + e.message);
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
    const txSnap = await colRef('finance_transactions').where('date','>=',from3m).orderBy('date','desc').get();
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
        const cn = tx.categoryName || tx.categoryId || 'Інше';
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
      trendTxt = diff > 0 ? `↑ +${diff}% vs попередній місяць` : diff < 0 ? `↓ ${diff}% vs попередній місяць` : '→ без змін';
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
БЮДЖЕТ ${curMonth}: план=${totalBudg}, факт=${totalFact}, виконання=${budExec}%`;
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
    return 'Дані недоступні: ' + e.message;
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
  const label    = type === 'income' ? 'дохід' : 'витрату';

  // Функції для прив'язки
  let functionsHtml = '<option value="">— не вибрано —</option>';
  (_state.functions || []).forEach(f => {
    functionsHtml += `<option value="${f.id}">${escHtml(f.name)}</option>`;
  });

  // Проекти для прив'язки
  let projectsHtml = '<option value="">— не вибрано —</option>';
  if (window._projectsCache) {
    window._projectsCache.forEach(p => {
      projectsHtml += `<option value="${p.id}">${p.name || p.title || p.id}</option>`;
    });
  }

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
          Додати ${label}
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button id="fmTabIncome" onclick="window._financeModalSwitchType('income')"
            style="padding:0.3rem 0.75rem;border-radius:6px;border:none;cursor:pointer;font-size:0.8rem;font-weight:600;
            background:${type==='income'?'#22c55e':'#f3f4f6'};color:${type==='income'?'#fff':'#6b7280'};">
            Дохід
          </button>
          <button id="fmTabExpense" onclick="window._financeModalSwitchType('expense')"
            style="padding:0.3rem 0.75rem;border-radius:6px;border:none;cursor:pointer;font-size:0.8rem;font-weight:600;
            background:${type==='expense'?'#ef4444':'#f3f4f6'};color:${type==='expense'?'#fff':'#6b7280'};">
            Витрата
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
            <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Сума *</label>
            <input id="fmAmount" type="number" min="0" step="0.01" placeholder="0.00"
              style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;box-sizing:border-box;outline:none;"
              onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'"
              oninput="window._updateCurrencyHint()">
          </div>
          <div style="width:90px;">
            <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Валюта</label>
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

        <!-- Категорія -->
        <div id="fmCatWrap">
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Категорія *</label>
          <select id="fmCategory"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            <option value="">— оберіть категорію —</option>
            ${cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>

        <!-- Дата -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Дата *</label>
          <input id="fmDate" type="date" value="${today}"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Рахунок -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Рахунок</label>
          <select id="fmAccount"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${_state.accounts.map(a => `<option value="${a.id}" ${a.isDefault?'selected':''}>${a.name} (${a.currency})</option>`).join('')}
          </select>
        </div>

        <!-- Контрагент -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Контрагент</label>
          <input id="fmCounterparty" type="text" placeholder="Постачальник / клієнт / підрядник"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Функція -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Функція</label>
          <select id="fmFunction"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${functionsHtml}
          </select>
        </div>

        <!-- Проект -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Проект / Об'єкт</label>
          <select id="fmProject"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${projectsHtml}
          </select>
        </div>

        <!-- Коментар -->
        <div>
          <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Коментар</label>
          <input id="fmDescription" type="text" placeholder="Призначення платежу"
            style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Кнопки -->
        <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
          <button onclick="document.getElementById('financeModal')?.remove()"
            style="flex:1;padding:0.65rem;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:0.85rem;color:#6b7280;font-weight:500;">
            Скасувати
          </button>
          <button id="fmSaveBtn" onclick="window._financeSaveTx()"
            style="flex:2;padding:0.65rem;border:none;border-radius:8px;background:${color};color:#fff;cursor:pointer;font-size:0.85rem;font-weight:700;">
            Зберегти
          </button>
        </div>

      </div>
    </div>
  `;

  // Закриття по кліку на overlay
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  setTimeout(() => { const a = document.getElementById('fmAmount'); if (a) a.focus(); }, 100);

  // Зберігаємо поточний тип у data-атрибуті
  modal.dataset.type = type;
}

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
  if (!amount || amount <= 0) { alert('Введіть суму'); return; }
  if (!catId)                 { alert('Оберіть категорію'); return; }
  if (!dateVal)               { alert('Вкажіть дату'); return; }

  const btn = document.getElementById('fmSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Збереження...'; }

  try {
    const db = getDb();
    const date = firebase.firestore.Timestamp.fromDate(new Date(dateVal));
    const accId = document.getElementById('fmAccount')?.value || _state.accounts[0]?.id || '';
    const funcId = document.getElementById('fmFunction')?.value || null;
    const projId = document.getElementById('fmProject')?.value  || null;
    const desc   = document.getElementById('fmDescription')?.value?.trim() || '';
    const counter= document.getElementById('fmCounterparty')?.value?.trim() || '';
    const currency = document.getElementById('fmCurrency')?.value || _state.currency;

    const txData = {
      type,
      amount,
      currency,
      amountBase: toBase(amount, currency), // сума в базовій валюті для аналітики
      categoryId:   catId,
      date,
      accountId:    accId,
      functionId:   funcId,
      projectId:    projId,
      description:  desc,
      counterparty: counter,
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

    // Оновлюємо поточну вкладку
    const inner = document.getElementById('financeContentInner');
    if (inner) renderSubTab(_state.activeSubTab);

  } catch(e) {
    console.error('[Finance] saveTx error:', e);
    alert('Помилка збереження: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Зберегти'; }
  }
};

// Видалення транзакції
window._financeDeleteTx = async function(txId, type) {
  if (!confirm('Видалити цю транзакцію?')) return;
  try {
    const snap = await colRef('finance_transactions').doc(txId).get();
    if (!snap.exists) return;
    const tx = snap.data();

    await colRef('finance_transactions').doc(txId).delete();

    // Відкатуємо баланс — використовуємо amountBase (базова валюта) як і при збереженні
    // FIX BP: tx.amount — оригінальна валюта; баланс рахунку в базовій → потрібно txAmt
    if (tx.accountId && tx.amount) {
      const baseAmt = txAmt(tx); // враховує amountBase або конвертує через курс
      const delta = tx.type === 'income' ? -baseAmt : baseAmt;
      await colRef('finance_accounts').doc(tx.accountId).update({
        balance: firebase.firestore.FieldValue.increment(delta)
      });
      const acc = _state.accounts.find(a => a.id === tx.accountId);
      if (acc) acc.balance = (acc.balance || 0) + delta;
    }

    // Оновлюємо список
    const inner = document.getElementById('financeContentInner');
    if (inner) renderSubTab(_state.activeSubTab);

  } catch(e) {
    console.error('[Finance] deleteTx error:', e);
    alert('Помилка видалення: ' + e.message);
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
    const snap = await db.collection('companies').doc(_state.companyId)
      .collection('users').doc(_state.currentUser.uid).get();
    if (snap.exists && snap.data().role) {
      _state.userRole = snap.data().role;
      return;
    }
    // Перевіряємо чи owner через компанію
    const cSnap = await db.collection('companies').doc(_state.companyId).get();
    if (cSnap.exists && cSnap.data().ownerId === _state.currentUser.uid) {
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
    const snap = await db.collection('companies').doc(_state.companyId)
      .collection('finance_settings').doc('main').get();
    if (snap.exists) {
      _state.region   = snap.data().region   || 'EU';
      _state.currency = snap.data().currency || 'EUR';
      _state.niche    = snap.data().niche    || null;
      _state.rates    = snap.data().rates    || {};
    } else {
      const cSnap = await db.collection('companies').doc(_state.companyId).get();
      if (cSnap.exists) {
        _state.region   = cSnap.data().region   || 'EU';
        _state.currency = cSnap.data().currency || 'EUR';
        _state.niche    = cSnap.data().niche    || null;
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
    hint.innerHTML = `<span style="color:#f59e0b;">⚠ Курс для ${cur} не встановлено. Перейдіть у Налаштування → Курси валют.</span>`;
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

// ── Фінанси в картці проекту ──────────────────────────────
window._renderProjectFinance = async function(projectId, el, opts) {
  // opts: { mode: 'project'|'function', id: string, label: string }
  const mode = opts?.mode || 'project';
  const entityId = opts?.id || projectId;
  const filterField = mode === 'function' ? 'functionId' : 'projectId';

  if (!entityId || !el) return;
  el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:2rem;">Завантаження...</div>';

  try {
    const db = getDb();
    const companyId = _state.companyId || window.currentCompanyId || window._companyId;
    if (!db || !companyId) { el.innerHTML = '<div style="padding:2rem;color:#ef4444;">Фінансовий модуль не ініціалізовано</div>'; return; }

    const snap = await db.collection('companies').doc(companyId)
      .collection('finance_transactions')
      .where(filterField, '==', entityId)
      .orderBy('date', 'desc')
      .get();

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
            { label: 'Дохід',    val: fmt(income, currency),  color: '#22c55e' },
            { label: 'Витрати',  val: fmt(expense, currency), color: '#ef4444' },
            { label: 'Прибуток', val: fmt(profit, currency),  color: profit >= 0 ? '#16a34a' : '#ef4444' },
            { label: 'Маржа',    val: margin + '%',           color: margin >= 20 ? '#22c55e' : margin >= 0 ? '#f59e0b' : '#ef4444' },
          ].map(k => `
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;">
              <div style="font-size:0.72rem;color:#6b7280;margin-bottom:3px;">${k.label}</div>
              <div style="font-size:1.2rem;font-weight:700;color:${k.color};">${k.val}</div>
            </div>`).join('')}
        </div>

        <!-- Кнопки додати -->
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button onclick="window._addEntityTx('${entityId}','${filterField}','income')"
            style="background:#22c55e;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:0.82rem;font-weight:600;cursor:pointer;">+ Дохід</button>
          <button onclick="window._addEntityTx('${entityId}','${filterField}','expense')"
            style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:0.82rem;font-weight:600;cursor:pointer;">+ Витрата</button>
        </div>

        <!-- Список транзакцій -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          ${txs.length === 0
            ? '<div style="text-align:center;padding:32px;color:#9ca3af;"><div style="font-size:1.8rem;margin-bottom:6px;">💰</div><div>Транзакцій по проекту ще немає</div></div>'
            : txs.map((tx, i) => {
                const isIncome = tx.type === 'income';
                const dateStr = tx.date ? fmtDate(tx.date) : '—';
                return `
                  ${i > 0 ? '<div style="border-top:1px solid #f3f4f6;"></div>' : ''}
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;flex-wrap:wrap;">
                    <div style="width:8px;height:8px;border-radius:50%;background:${isIncome ? '#22c55e' : '#ef4444'};flex-shrink:0;"></div>
                    <div style="flex:1;min-width:100px;">
                      <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;">${escHtml(tx.description || tx.counterparty || (isIncome ? 'Дохід' : 'Витрата'))}</div>
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
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;">Помилка: ${e.message}</div>`;
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
        currency:      _state.currency || 'EUR',
        date:          firebase.firestore.Timestamp.now(),
        description:   `CRM: ${p.clientName || 'Угода'} — оплата`,
        counterparty:  p.clientName || '',
        categoryId:    defCat?.id   || null,
        categoryName:  defCat?.name || 'Продаж послуг',
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
          showToast(`💰 Авто-транзакція: +${tx.amount} ${tx.currency} (${p.clientName || 'CRM'})`, 'success');
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

})();
