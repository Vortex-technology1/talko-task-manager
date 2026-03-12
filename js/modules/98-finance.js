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
};

// ── Константи ──────────────────────────────────────────────
const FINANCE_VERSION = '1.0.0';
const TABS = ['dashboard', 'income', 'expense', 'functions', 'planning', 'ai', 'settings'];
const TAB_LABELS = {
  dashboard:  { icon: 'chart',    label: 'Дашборд'   },
  income:     { icon: 'income',   label: 'Доходи'    },
  expense:    { icon: 'expense',  label: 'Витрати'   },
  functions:  { icon: 'func',     label: 'Функції'   },
  planning:   { icon: 'plan',     label: 'Планування'},
  ai:         { icon: 'ai',       label: 'AI'        },
  settings:   { icon: 'settings', label: 'Налаштування' },
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
    const snap = await colRef('finance_transactions').get();
    const balances = {};
    snap.docs.forEach(d => {
      const tx = d.data();
      if (!tx.accountId) return;
      const delta = tx.type === 'income' ? (tx.amount || 0) : -(tx.amount || 0);
      balances[tx.accountId] = (balances[tx.accountId] || 0) + delta;
    });
    // Оновлюємо локальний стан
    _state.accounts.forEach(acc => {
      if (balances[acc.id] !== undefined) acc.balance = balances[acc.id];
    });
    // Записуємо в Firestore по одному (ігноруємо помилки прав)
    for (const acc of _state.accounts) {
      if (balances[acc.id] !== undefined) {
        try {
          await colRef('finance_accounts').doc(acc.id).update({ balance: balances[acc.id] });
        } catch(e) { /* ігноруємо */ }
      }
    }
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
    <div style="max-width:960px;margin:0 auto;">

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
          <div style="font-size:0.85rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem;">Рахунки</div>
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
      if (tx.type === 'income')  income += (tx.amount || 0);
      if (tx.type === 'expense') {
        expense += (tx.amount || 0);
        const cn = tx.categoryId || 'other';
        expByCat[cn] = (expByCat[cn] || 0) + (tx.amount || 0);
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
      if (tx.type === 'income')  months[mIdx].income  += (tx.amount || 0);
      if (tx.type === 'expense') months[mIdx].expense += (tx.amount || 0);
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
    <div style="max-width:960px;margin:0 auto;">

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
              ${tx.counterparty ? ' &bull; ' + tx.counterparty : ''}
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

// ── Функції (заглушка Етап 1) ────────────────────────────
function renderFunctions(el) {
  el.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">Фінанси по функціях</div>
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:2rem;text-align:center;color:#9ca3af;">
        <div style="margin-bottom:0.75rem;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
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
        <div style="margin-bottom:0.75rem;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.35rem;">Бюджетування</div>
        <div style="font-size:0.8rem;">Розробляється в наступному етапі</div>
      </div>
    </div>
  `;
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
    <div style="max-width:640px;margin:0 auto;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">Налаштування фінансів</div>
      ${renderCatList('income')}
      ${renderCatList('expense')}
      ${renderAccList()}
    </div>
  `;
}

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
function renderAI(el) {
  if (!isOwnerOrManager()) {
    el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:2rem;">Доступ лише для Owner та Manager</div>';
    return;
  }
  el.innerHTML = `
    <div style="max-width:960px;margin:0 auto;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:1.25rem;">AI-аналітик</div>
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:2rem;text-align:center;color:#9ca3af;">
        <div style="margin-bottom:0.75rem;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
        <div style="font-size:0.9rem;font-weight:500;margin-bottom:0.35rem;">Claude AI аналітика</div>
        <div style="font-size:0.8rem;">Буде активовано після наповнення даними</div>
      </div>
    </div>
  `;
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
  if (window._state && window._state.functions) {
    window._state.functions.forEach(f => {
      functionsHtml += `<option value="${f.id}">${f.name}</option>`;
    });
  }

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
          <button onclick="document.getElementById('financeModal').remove()"
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
              onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
          </div>
          <div style="width:90px;">
            <label style="font-size:0.78rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Валюта</label>
            <select id="fmCurrency"
              style="width:100%;padding:0.55rem 0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
              ${['EUR','USD','UAH','PLN','GBP'].map(cur =>
                `<option value="${cur}" ${_state.currency===cur?'selected':''}>${cur}</option>`
              ).join('')}
            </select>
          </div>
        </div>

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
          <button onclick="document.getElementById('financeModal').remove()"
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

    await colRef('finance_transactions').add(txData);

    // Оновлюємо баланс рахунку
    const accRef = colRef('finance_accounts').doc(accId);
    const delta  = type === 'income' ? amount : -amount;
    await accRef.update({ balance: firebase.firestore.FieldValue.increment(delta) });

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

    // Відкатуємо баланс
    if (tx.accountId && tx.amount) {
      const delta = tx.type === 'income' ? -tx.amount : tx.amount;
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
  addTransaction(type || (_state.activeSubTab === 'income' ? 'income' : 'expense'));
};

window._txFilterChange = function(field, value, type) {
  _txFilter[field] = value;
  loadAndRenderTxList(type);
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
