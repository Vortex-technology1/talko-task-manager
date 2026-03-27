// ============================================================
// 77j-crm-finance-bridge.js — CRM → Finance Bridge v1.0
// При закритті угоди (stage=won) → запитує підтвердження
// та автоматично записує дохід у фінанси
// Умова активації: window.isLinkActive('crm','finance') === true
// ============================================================
(function () {
'use strict';

// ── i18n хелпер (локальний) ──────────────────────────────
function _t(ua, ru) {
  return (window.currentLang === 'ru' || (typeof window.getLocale === 'function' && window.getLocale().startsWith('ru'))) ? ru : ua;
}


// ── Реєструємо hook whDealWon (викликається з 77-crm.js) ──
window.whDealWon = async function(deal) {
  // 1. Перевіряємо чи зв'язок увімкнено
  if (typeof window.isLinkActive === 'function' && !window.isLinkActive('crm', 'finance')) return;

  // 2. Якщо сума = 0 або не вказана — не показуємо модал
  if (!deal.amount || deal.amount <= 0) return;

  // 3. Показуємо модал підтвердження
  await _showFinanceConfirmModal(deal);
};

// ── Модал підтвердження запису доходу ─────────────────────
async function _showFinanceConfirmModal(deal) {
  // Знімаємо попередній якщо є
  const old = document.getElementById('crmFinBridgeModal');
  if (old) old.remove();

  // Отримуємо рахунки та категорії з фінансів
  const accounts   = await _getFinanceAccounts();
  const categories = await _getFinanceIncomeCategories();
  const today      = new Date().toISOString().split('T')[0];
  const currency   = _getCompanyCurrency();
  const amount     = deal.amount || 0;
  const clientName = deal.clientName || deal.title || '';

  const modal = document.createElement('div');
  modal.id = 'crmFinBridgeModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';

  const accOptions = accounts.map(a =>
    `<option value="${_esc(a.id)}">${_esc(a.name)} (${a.currency})</option>`
  ).join('');

  const catOptions = categories.map(c =>
    `<option value="${_esc(c.id)}">${_esc(c.name)}</option>`
  ).join('');

  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.25);">

      <!-- Header -->
      <div style="padding:1.1rem 1.25rem;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:0.75rem;">
        <div style="width:36px;height:36px;background:#f0fdf4;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style="font-size:0.95rem;font-weight:700;color:#1a1a1a;">Угода закрита — записати дохід?</div>
          <div style="font-size:0.78rem;color:#6b7280;margin-top:1px;">${_esc(clientName)}</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:1.1rem 1.25rem;display:flex;flex-direction:column;gap:0.9rem;">

        <!-- Сума -->
        <div style="display:grid;grid-template-columns:1fr 100px;gap:0.5rem;">
          <div>
            <label style="font-size:0.75rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Сума *</label>
            <input id="cfbAmount" type="number" value="${amount}" min="0" step="0.01"
              style="width:100%;padding:0.5rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;font-weight:600;box-sizing:border-box;outline:none;"
              onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
          </div>
          <div>
            <label style="font-size:0.75rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Валюта</label>
            <input id="cfbCurrency" value="${_esc(currency)}"
              style="width:100%;padding:0.5rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;background:#f9fafb;"
              readonly>
          </div>
        </div>

        <!-- Дата оплати -->
        <div>
          <label style="font-size:0.75rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Дата оплати *</label>
          <input id="cfbDate" type="date" value="${today}"
            style="width:100%;padding:0.5rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Рахунок -->
        <div>
          <label style="font-size:0.75rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Рахунок</label>
          <select id="cfbAccount"
            style="width:100%;padding:0.5rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            ${accOptions || '<option value="">— рахунки не налаштовані —</option>'}
          </select>
        </div>

        <!-- Категорія доходу -->
        <div>
          <label style="font-size:0.75rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Категорія доходу</label>
          <select id="cfbCategory"
            style="width:100%;padding:0.5rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:#fff;">
            <option value="">— оберіть категорію —</option>
            ${catOptions}
          </select>
        </div>

        <!-- Коментар (автозаповнення) -->
        <div>
          <label style="font-size:0.75rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.3rem;">Коментар</label>
          <input id="cfbDesc" type="text" value="CRM: ${_esc(clientName)}"
            style="width:100%;padding:0.5rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <!-- Кнопки -->
        <div style="display:flex;gap:0.5rem;margin-top:0.1rem;">
          <button onclick="document.getElementById('crmFinBridgeModal')?.remove()"
            style="flex:1;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:0.83rem;color:#6b7280;font-weight:500;">
            Пропустити
          </button>
          <button id="cfbSaveBtn" onclick="window._cfbSave('${_esc(deal.id)}')"
            style="flex:2;padding:0.6rem;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:0.85rem;font-weight:700;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Записати дохід у фінанси
          </button>
        </div>

      </div>
    </div>`;

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

// ── Збереження доходу ──────────────────────────────────────
window._cfbSave = async function(dealId) {
  const amountVal = parseFloat(document.getElementById('cfbAmount')?.value);
  const dateVal   = document.getElementById('cfbDate')?.value;
  const accId     = document.getElementById('cfbAccount')?.value;
  const catId     = document.getElementById('cfbCategory')?.value;
  const desc      = document.getElementById('cfbDesc')?.value?.trim() || '';
  const currency  = document.getElementById('cfbCurrency')?.value || _getCompanyCurrency();

  if (!amountVal || amountVal <= 0) {
    if (typeof showToast === 'function') showToast(_t(_t('Введіть суму','Введите сумму'),'Введите сумму'), 'warning');
    return;
  }
  if (!dateVal) {
    if (typeof showToast === 'function') showToast(_t(_t('Вкажіть дату оплати','Укажите дату оплаты'),'Укажите дату оплаты'), 'warning');
    return;
  }

  const btn = document.getElementById('cfbSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = _t(_t('Збереження...','Сохранение...'),'Сохранение...'); }

  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) throw new Error('DB не ініціалізовано');

    const col = db.collection('companies').doc(window.currentCompanyId).collection('finance_transactions');
    const accCol = db.collection('companies').doc(window.currentCompanyId).collection('finance_accounts');

    const date = firebase.firestore.Timestamp.fromDate(new Date(dateVal));

    // Конвертуємо в базову валюту якщо потрібно
    const baseAmount = _toBase(amountVal, currency);
    const delta = baseAmount; // дохід = позитивний

    const txData = {
      type:         'income',
      amount:       amountVal,
      currency,
      amountBase:   baseAmount,
      categoryId:   catId || null,
      date,
      accrualDate:  date, // для CRM угод дата нарахування = дата оплати
      accountId:    accId || null,
      description:  desc,
      counterparty: '',
      crmDealId:    dealId,   // зворотній зв'язок з угодою
      source:       'crm',    // маркер звідки прийшов запис
      createdBy:    window.currentUser?.uid || 'system',
      createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
      recurring:    false,
    };

    // Видаляємо null
    Object.keys(txData).forEach(k => { if (txData[k] === null) delete txData[k]; });

    // Атомарно: транзакція + оновлення балансу рахунку
    const txRef  = col.doc();
    const batch  = db.batch();
    batch.set(txRef, txData);

    if (accId) {
      const accRef = accCol.doc(accId);
      batch.update(accRef, { balance: firebase.firestore.FieldValue.increment(delta) });
    }

    await batch.commit();

    // Позначаємо угоду як "фінанси записано"
    try {
      await db.collection('companies').doc(window.currentCompanyId)
        .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals').doc(dealId)
        .update({ financeLinked: true, financeTransactionId: txRef.id });
    } catch(e2) { /* не критично */ }

    document.getElementById('crmFinBridgeModal')?.remove();
    if (typeof showToast === 'function') showToast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Дохід записано у фінанси', 'success');
    console.log('[crmFinBridge] Saved transaction:', txRef.id);

  } catch(e) {
    console.error('[crmFinBridge] Save error:', e);
    if (typeof showToast === 'function') showToast('Помилка збереження: ' + e.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Записати дохід у фінанси'; }
  }
};

// ── Хелпери ────────────────────────────────────────────────

async function _getFinanceAccounts() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return [];
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_accounts').orderBy('createdAt').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}

async function _getFinanceIncomeCategories() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return [];
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_categories').where('type','==','income').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}

function _getCompanyCurrency() {
  return window.currentCompanyData?.currency
    || window.financeState?.currency
    || 'UAH';
}

function _toBase(amount, currency) {
  // Спрощена конвертація — якщо є rates в finance state
  try {
    const rates = window.financeState?.rates || {};
    const base  = _getCompanyCurrency();
    if (currency === base) return amount;
    const rate = rates[currency];
    if (rate && rate > 0) return Math.round(amount * rate * 100) / 100;
  } catch(e) {}
  return amount;
}

function _esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

console.log('[crmFinBridge] Module loaded v1.0');

})();
