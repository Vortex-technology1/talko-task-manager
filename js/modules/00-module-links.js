// ============================================================
// 00-module-links.js — TALKO OS Module Links v1.0
// Управління зв'язками між модулями
// Завантажується першим після translations + firebase
// ============================================================
(function () {
'use strict';

// ── Дефолтні значення зв'язків ─────────────────────────────
const DEFAULTS = {
  crmToFinance:      true,
  crmToTasks:        true,
  crmToWarehouse:    false,
  bookingToCrm:      true,
  bookingToFinance:  true,
  warehouseToFinance:true,
  projectsToFinance: true,
};

// ── Внутрішній стан ────────────────────────────────────────
let _links = { ...DEFAULTS };
let _loaded = false;
let _listeners = [];

// ── Публічне API ───────────────────────────────────────────

/**
 * Перевірити чи активний зв'язок між двома модулями
 * @param {string} from  — 'crm' | 'booking' | 'warehouse' | 'projects'
 * @param {string} to    — 'finance' | 'tasks' | 'warehouse' | 'crm'
 * @returns {boolean}
 */
window.isLinkActive = function(from, to) {
  const key = _buildKey(from, to);
  if (!key) return false;
  return !!_links[key];
};

/**
 * Отримати весь стан зв'язків
 */
window.getModuleLinks = function() {
  return { ..._links };
};

/**
 * Оновити один зв'язок (тільки Owner)
 * @param {string} key   — ключ зв'язку, напр. 'crmToFinance'
 * @param {boolean} val
 */
window.setModuleLink = async function(key, val) {
  if (!(key in DEFAULTS)) {
    console.warn('[moduleLinks] Unknown key:', key);
    return;
  }
  _links[key] = !!val;
  _notifyListeners(key, !!val);

  // Зберегти у Firestore
  try {
    const ref = _getRef();
    if (!ref) return;
    await ref.set({ [key]: !!val }, { merge: true });
  } catch (e) {
    console.warn('[moduleLinks] Save error:', e.message);
  }
};

/**
 * Підписатись на зміни зв'язків
 * @param {function} fn — fn(key, value)
 * @returns {function} unsubscribe
 */
window.onModuleLinkChange = function(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
};

// ── Ініціалізація ──────────────────────────────────────────

window.initModuleLinks = async function(companyId) {
  if (_loaded) return;
  try {
    const ref = _getRef(companyId);
    if (!ref) return;
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data() || {};
      // Мержимо з дефолтами — нові ключі отримають дефолтне значення
      _links = { ...DEFAULTS, ...data };
    } else {
      // Перший запуск — зберегти дефолти
      await ref.set(DEFAULTS);
    }
    _loaded = true;
    console.log('[moduleLinks] Loaded:', _links);
  } catch (e) {
    console.warn('[moduleLinks] Load error:', e.message);
    _links = { ...DEFAULTS };
    _loaded = true;
  }
};

// ── Рендер UI в Налаштуваннях ──────────────────────────────

window.renderModuleLinksSettings = function(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Визначаємо які модулі увімкнені в компанії
  const enabled = _getEnabledModules();

  const rows = [
    { key: 'crmToFinance',      reqA: 'crm',      reqB: 'finance',   labelKey: 'mlCrmToFinance',      descKey: 'mlCrmToFinanceDesc'      },
    { key: 'crmToTasks',        reqA: 'crm',      reqB: 'tasks',     labelKey: 'mlCrmToTasks',        descKey: 'mlCrmToTasksDesc'        },
    { key: 'crmToWarehouse',    reqA: 'crm',      reqB: 'warehouse', labelKey: 'mlCrmToWarehouse',    descKey: 'mlCrmToWarehouseDesc'    },
    { key: 'bookingToCrm',      reqA: 'booking',  reqB: 'crm',       labelKey: 'mlBookingToCrm',      descKey: 'mlBookingToCrmDesc'      },
    { key: 'bookingToFinance',  reqA: 'booking',  reqB: 'finance',   labelKey: 'mlBookingToFinance',  descKey: 'mlBookingToFinanceDesc'  },
    { key: 'warehouseToFinance',reqA: 'warehouse',reqB: 'finance',   labelKey: 'mlWarehouseToFinance',descKey: 'mlWarehouseToFinanceDesc'},
    { key: 'projectsToFinance', reqA: 'projects', reqB: 'finance',   labelKey: 'mlProjectsToFinance', descKey: 'mlProjectsToFinanceDesc' },
  ];

  const rowsHtml = rows.map(r => {
    const isAvailable = enabled[r.reqA] && enabled[r.reqB];
    const isOn = isAvailable && !!_links[r.key];
    const label   = window.t ? window.t(r.labelKey)  : r.key;
    const desc    = window.t ? window.t(r.descKey)   : '';
    const tooltip = isAvailable ? '' : _buildTooltip(r.reqA, r.reqB, enabled);

    return `
    <div class="ml-row" style="
      display:flex;align-items:center;justify-content:space-between;
      padding:0.75rem 1rem;border-bottom:1px solid #f3f4f6;
      opacity:${isAvailable ? '1' : '0.5'};
    ">
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.88rem;font-weight:600;color:#111827;">${label}</div>
        <div style="font-size:0.78rem;color:#6b7280;margin-top:2px;">${desc}</div>
        ${!isAvailable ? `<div style="font-size:0.75rem;color:#f59e0b;margin-top:3px;">⚠️ ${tooltip}</div>` : ''}
      </div>
      <label class="ml-toggle" style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;margin-left:1rem;">
        <input type="checkbox"
          ${isOn ? 'checked' : ''}
          ${!isAvailable ? 'disabled' : ''}
          data-ml-key="${r.key}"
          onchange="window._mlToggle(this)"
          style="opacity:0;width:0;height:0;position:absolute;"
        >
        <span style="
          position:absolute;cursor:${isAvailable ? 'pointer' : 'not-allowed'};
          top:0;left:0;right:0;bottom:0;border-radius:24px;
          transition:.3s;
          background:${isOn ? '#22c55e' : (isAvailable ? '#d1d5db' : '#e5e7eb')};
        ">
          <span style="
            position:absolute;height:18px;width:18px;left:${isOn ? '23px' : '3px'};bottom:3px;
            background:white;border-radius:50%;transition:.3s;
          "></span>
        </span>
      </label>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div style="background:white;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-top:0.5rem;">
      <div style="padding:0.75rem 1rem;background:#f9fafb;border-bottom:1px solid #e5e7eb;">
        <div style="font-size:0.85rem;font-weight:700;color:#374151;">
          🔗 ${window.t ? window.t('mlSectionTitle') : "Зв'язки між модулями"}
        </div>
        <div style="font-size:0.78rem;color:#6b7280;margin-top:2px;">
          ${window.t ? window.t('mlSectionDesc') : 'Увімкніть автоматичний обмін даними між модулями які ви використовуєте'}
        </div>
      </div>
      ${rowsHtml}
    </div>`;
};

// ── Обробник зміни toggle ──────────────────────────────────
window._mlToggle = async function(input) {
  const key = input.dataset.mlKey;
  const val = input.checked;
  await window.setModuleLink(key, val);

  // Оновити стиль слайдера без перерендеру
  const span = input.nextElementSibling;
  if (span) {
    span.style.background = val ? '#22c55e' : '#d1d5db';
    const dot = span.querySelector('span');
    if (dot) dot.style.left = val ? '23px' : '3px';
  }

  const msg = val
    ? (window.t ? window.t('mlEnabled') : 'Зв\'язок увімкнено')
    : (window.t ? window.t('mlDisabled') : 'Зв\'язок вимкнено');
  if (typeof showToast === 'function') showToast(msg, val ? 'success' : 'info');
};

// ── Хелпери ────────────────────────────────────────────────

function _buildKey(from, to) {
  const map = {
    'crm-finance':       'crmToFinance',
    'crm-tasks':         'crmToTasks',
    'crm-warehouse':     'crmToWarehouse',
    'booking-crm':       'bookingToCrm',
    'booking-finance':   'bookingToFinance',
    'warehouse-finance': 'warehouseToFinance',
    'projects-finance':  'projectsToFinance',
  };
  return map[`${from}-${to}`] || null;
}

function _getRef(companyId) {
  try {
    const id = companyId || window.currentCompanyId;
    if (!id) return null;
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db) return null;
    return db.collection('companies').doc(id).collection('settings').doc('moduleLinks');
  } catch (e) {
    return null;
  }
}

function _notifyListeners(key, val) {
  _listeners.forEach(fn => { try { fn(key, val); } catch(e) {} });
}

function _getEnabledModules() {
  // Перевіряємо які lazy модулі завантажені або увімкнені
  // Використовуємо window._loadedModules якщо є, або перевіряємо наявність глобальних об'єктів
  return {
    crm:       typeof window.crmInit === 'function' || typeof window.crm !== 'undefined' || !!document.getElementById('crmSection'),
    finance:   typeof window._financeInit === 'function' || typeof window.financeState !== 'undefined' || !!document.getElementById('financeSection'),
    tasks:     typeof openAddTask === 'function' || !!document.getElementById('tasksSection'),
    warehouse: typeof window.warehouseInit === 'function' || !!document.getElementById('warehouseSection'),
    booking:   typeof window.bookingInit === 'function' || !!document.getElementById('bookingSection'),
    projects:  typeof window.projectsInit === 'function' || !!document.getElementById('projectsSection'),
  };
}

function _buildTooltip(reqA, reqB, enabled) {
  const missing = [];
  if (!enabled[reqA]) missing.push(reqA);
  if (!enabled[reqB]) missing.push(reqB);
  const base = window.t ? window.t('mlRequiresModules') : 'Потрібно увімкнути модулі';
  return `${base}: ${missing.join(', ')}`;
}

// ── Авто-ініціалізація коли компанія готова ────────────────
(function _autoInit() {
  let _attempts = 0;
  const _try = () => {
    if (window.currentCompanyId) {
      window.initModuleLinks(window.currentCompanyId);
      return;
    }
    if (_attempts++ < 30) setTimeout(_try, 500);
  };
  // Чекаємо після DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _try);
  } else {
    setTimeout(_try, 300);
  }
})();

console.log('[moduleLinks] Module loaded v1.0');

})();
