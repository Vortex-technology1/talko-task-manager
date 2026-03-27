// ============================================================
// 100b-booking-bridge.js — Booking → CRM + Finance Bridge v1.0
// Підключається після 100-booking.js
// Умови: isLinkActive('booking','crm') / isLinkActive('booking','finance')
// ============================================================
(function () {
'use strict';

// ── i18n хелпер (локальний) ──────────────────────────────
function _t(ua, ru) {
  return (window.currentLang === 'ru' || (typeof window.getLocale === 'function' && window.getLocale().startsWith('ru'))) ? ru : ua;
}


// ── Патчимо _bkCompleteAppointment після завантаження ──────
function _patchBooking() {
  const orig = window._bkCompleteAppointment;
  if (typeof orig !== 'function') {
    // Модуль ще не завантажено — спробуємо пізніше
    setTimeout(_patchBooking, 800);
    return;
  }

  window._bkCompleteAppointment = async function(apptId, amount) {
    // Викликаємо оригінальну функцію
    await orig.call(this, apptId, amount);

    // Після успішного завершення — bridge логіка
    try {
      const db = window.db || (window.firebase && firebase.firestore());
      if (!db || !window.currentCompanyId) return;

      const snap = await db.collection('companies').doc(window.currentCompanyId)
        .collection('booking_appointments').doc(apptId).get();
      if (!snap.exists) return;
      const appt = { id: apptId, ...snap.data() };

      // Паралельно запускаємо CRM і Finance bridge
      const tasks = [];
      if (typeof window.isLinkActive === 'function' && window.isLinkActive('booking', 'crm')) {
        tasks.push(_syncToCrm(appt));
      }
      if (typeof window.isLinkActive === 'function' && window.isLinkActive('booking', 'finance')) {
        if (amount && amount > 0) {
          tasks.push(_showFinanceModal(appt, amount));
        }
      }
      await Promise.allSettled(tasks);
    } catch(e) {
      console.warn('[bookingBridge] post-complete error:', e.message);
    }
  };

  console.log('[bookingBridge] _bkCompleteAppointment patched ✓');
}

// ── CRM sync: створюємо або оновлюємо клієнта ─────────────
async function _syncToCrm(appt) {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    const col = (name) => db.collection('companies').doc(window.currentCompanyId).collection(name);

    const phone = appt.clientPhone || '';
    const email = appt.clientEmail || '';
    if (!phone && !email) return; // немає ідентифікатора

    // Шукаємо існуючого клієнта
    let clientRef = null;
    let isNew = false;

    if (phone) {
      const s = await col('crm_clients').where('phone','==',phone).limit(1).get();
      if (!s.empty) clientRef = s.docs[0].ref;
    }
    if (!clientRef && email) {
      const s = await col('crm_clients').where('email','==',email).limit(1).get();
      if (!s.empty) clientRef = s.docs[0].ref;
    }

    if (clientRef) {
      // Оновлюємо існуючого
      await clientRef.update({
        lastVisitDate:  appt.date || null,
        totalVisits:    firebase.firestore.FieldValue.increment(1),
        totalSpent:     firebase.firestore.FieldValue.increment(appt.amount || 0),
        lastService:    appt.serviceName || appt.calendarName || '',
        source:         clientRef._source || 'booking',
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
      });
      // Позначаємо запис як прив'язаний до CRM клієнта
      await db.collection('companies').doc(window.currentCompanyId)
        .collection('booking_appointments').doc(appt.id)
        .update({ crmClientId: clientRef.id });
    } else {
      // Створюємо нового клієнта
      isNew = true;
      const newClient = {
        name:          appt.clientName || '',
        phone:         phone,
        email:         email,
        source:        'booking',
        totalVisits:   1,
        totalSpent:    appt.amount || 0,
        lastVisitDate: appt.date || null,
        lastService:   appt.serviceName || appt.calendarName || '',
        createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:     firebase.firestore.FieldValue.serverTimestamp(),
      };
      const ref = await col('crm_clients').add(newClient);
      await db.collection('companies').doc(window.currentCompanyId)
        .collection('booking_appointments').doc(appt.id)
        .update({ crmClientId: ref.id });

      if (typeof showToast === 'function') {
        showToast(`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Новий клієнт «${appt.clientName || email}» додано в CRM`, 'info');
      }
    }
  } catch(e) {
    console.warn('[bookingBridge] CRM sync error:', e.message);
  }
}

// ── Finance modal: підтвердження оплати ───────────────────
async function _showFinanceModal(appt, amount) {
  const old = document.getElementById('bkFinBridgeModal');
  if (old) old.remove();

  const accounts   = await _getAccounts();
  const categories = await _getIncomeCategories();
  const today      = new Date().toISOString().split('T')[0];
  const currency   = _getCurrency();

  const modal = document.createElement('div');
  modal.id = 'bkFinBridgeModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:14px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
      <div style="padding:1rem 1.2rem;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:0.75rem;">
        <div style="width:34px;height:34px;background:#f0fdf4;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style="font-size:0.9rem;font-weight:700;color:#1a1a1a;">Запис завершено — зафіксувати оплату?</div>
          <div style="font-size:0.75rem;color:#6b7280;">${_esc(appt.clientName || '')} · ${_esc(appt.serviceName || appt.calendarName || '')}</div>
        </div>
      </div>
      <div style="padding:1rem 1.2rem;display:flex;flex-direction:column;gap:0.85rem;">

        <div style="display:grid;grid-template-columns:1fr 90px;gap:0.5rem;">
          <div>
            <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Сума *</label>
            <input id="bkfbAmount" type="number" value="${amount || ''}" min="0" step="10"
              style="width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.88rem;font-weight:600;box-sizing:border-box;outline:none;"
              onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
          </div>
          <div>
            <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Валюта</label>
            <input value="${_esc(currency)}" readonly
              style="width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;background:#f9fafb;box-sizing:border-box;">
          </div>
        </div>

        <div>
          <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Дата оплати *</label>
          <input id="bkfbDate" type="date" value="${today}"
            style="width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;box-sizing:border-box;outline:none;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
        </div>

        <div>
          <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Рахунок</label>
          <select id="bkfbAccount" style="width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;background:#fff;">
            ${accounts.map(a=>`<option value="${_esc(a.id)}">${_esc(a.name)} (${a.currency})</option>`).join('') || '<option value="">— рахунки не налаштовані —</option>'}
          </select>
        </div>

        <div>
          <label style="font-size:0.72rem;color:#6b7280;font-weight:500;display:block;margin-bottom:0.25rem;">Категорія доходу</label>
          <select id="bkfbCategory" style="width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;background:#fff;">
            <option value="">— оберіть категорію —</option>
            ${categories.map(c=>`<option value="${_esc(c.id)}">${_esc(c.name)}</option>`).join('')}
          </select>
        </div>

        <div style="display:flex;gap:0.5rem;margin-top:0.1rem;">
          <button onclick="document.getElementById('bkFinBridgeModal')?.remove()"
            style="flex:1;padding:0.55rem;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:pointer;font-size:0.82rem;color:#6b7280;font-weight:500;">
            Пропустити
          </button>
          <button id="bkfbSaveBtn" onclick="window._bkfbSave('${_esc(appt.id)}')"
            style="flex:2;padding:0.55rem;border:none;border-radius:7px;background:#22c55e;color:#fff;cursor:pointer;font-size:0.82rem;font-weight:700;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Зафіксувати оплату
          </button>
        </div>
      </div>
    </div>`;

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

// ── Збереження оплати у фінанси ────────────────────────────
window._bkfbSave = async function(apptId) {
  const amount   = parseFloat(document.getElementById('bkfbAmount')?.value);
  const dateVal  = document.getElementById('bkfbDate')?.value;
  const accId    = document.getElementById('bkfbAccount')?.value;
  const catId    = document.getElementById('bkfbCategory')?.value;
  const currency = _getCurrency();

  if (!amount || amount <= 0) { if (typeof showToast==='function') showToast(_t(_t('Введіть суму','Введите сумму'),'Введите сумму'),'warning'); return; }
  if (!dateVal) { if (typeof showToast==='function') showToast(_t(_t('Вкажіть дату','Укажите дату'),'Укажите дату'),'warning'); return; }

  const btn = document.getElementById('bkfbSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = _t(_t('Збереження...','Сохранение...'),'Сохранение...'); }

  try {
    const db  = window.db || (window.firebase && firebase.firestore());
    const cid = window.currentCompanyId;
    if (!db || !cid) throw new Error('DB не ініціалізовано');

    const txCol  = db.collection('companies').doc(cid).collection('finance_transactions');
    const accCol = db.collection('companies').doc(cid).collection('finance_accounts');
    const apptCol= db.collection('companies').doc(cid).collection('booking_appointments');

    const date = firebase.firestore.Timestamp.fromDate(new Date(dateVal));
    const base = amount; // TODO: конвертація якщо різні валюти

    const txData = {
      type:        'income',
      amount,
      currency,
      amountBase:  base,
      categoryId:  catId || null,
      date,
      accrualDate: date,
      accountId:   accId || null,
      description: 'Booking: ' + (apptId || ''),
      source:      'booking',
      bookingId:   apptId,
      createdBy:   window.currentUser?.uid || 'system',
      createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
      recurring:   false,
    };
    Object.keys(txData).forEach(k => { if (txData[k] === null) delete txData[k]; });

    const txRef  = txCol.doc();
    const batch  = db.batch();
    batch.set(txRef, txData);
    if (accId) batch.update(accCol.doc(accId), { balance: firebase.firestore.FieldValue.increment(base) });
    batch.update(apptCol.doc(apptId), { financeLinked: true, financeTransactionId: txRef.id });
    await batch.commit();

    document.getElementById('bkFinBridgeModal')?.remove();
    if (typeof showToast==='function') showToast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Оплату зафіксовано у фінансах', 'success');
  } catch(e) {
    console.error('[bookingBridge] save error:', e);
    if (typeof showToast==='function') showToast('Помилка: ' + e.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Зафіксувати оплату'; }
  }
};

// ── Хелпери ────────────────────────────────────────────────
async function _getAccounts() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return [];
    const s = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_accounts').get();
    return s.docs.map(d => ({ id:d.id, ...d.data() }));
  } catch(e) { return []; }
}

async function _getIncomeCategories() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return [];
    const s = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_categories').where('type','==','income').get();
    return s.docs.map(d => ({ id:d.id, ...d.data() }));
  } catch(e) { return []; }
}

function _getCurrency() {
  return window.currentCompanyData?.currency || 'UAH';
}

function _esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Старт ──────────────────────────────────────────────────
_patchBooking();
console.log('[bookingBridge] v1.0 loaded');

})();
