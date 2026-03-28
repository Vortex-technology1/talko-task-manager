// ============================================================
// 99c-warehouse-finance-bridge.js — Warehouse → Finance Bridge v1.0
// Патчить whFinanceOnIn і додає whFinanceOnOut/WhFinanceOnWriteOff
// Умова: isLinkActive('warehouse','finance') === true
// ============================================================
(function () {
'use strict';

// ── i18n хелпер (локальний) ──────────────────────────────
function _t(ua, ru) {
  return (window.currentLang === 'ru' || (typeof window.getLocale === 'function' && window.getLocale().startsWith('ru'))) ? ru : ua;
}


function _patch() {
  // Чекаємо поки core завантажиться
  if (typeof window.whFinanceOnIn !== 'function' || typeof window.whDoOperation !== 'function') {
    setTimeout(_patch, 600);
    return;
  }

  // ── Патч whFinanceOnIn — закупівля = витрата ──────────
  window.whFinanceOnIn = async function(item, qty, price) {
    if (!price || !qty || price <= 0 || qty <= 0) return;

    // Перевірка зв'язку
    if (typeof window.isLinkActive === 'function' && !window.isLinkActive('warehouse', 'finance')) return;

    const total    = qty * price;
    const currency = window.currentCompanyData?.currency || 'UAH';
    const desc     = `${_t('Закупівля: ','Закупка: ')}${item.name} × ${qty} ${item.unit || 'шт'} по ${price}`;

    try {
      await _saveTx({
        type:        'expense',
        amount:      total,
        currency,
        amountBase:  total,
        categoryId:  await _getCogsCategory(),  // шукаємо категорію COGS або exp_materials
        date:        firebase.firestore.Timestamp.fromDate(new Date()),
        accrualDate: firebase.firestore.Timestamp.fromDate(new Date()),
        description: desc,
        source:      'warehouse',
        warehouseOp: 'IN',
        itemId:      item.id,
        itemName:    item.name,
        qty,
        pricePerUnit: price,
      });
      console.log('[whBridge] IN recorded:', desc, total, currency);
    } catch(e) {
      console.warn('[whBridge] IN error:', e.message);
    }
  };

  // ── Нова функція: видача на виробництво = собівартість у P&L ──
  window.whFinanceOnOut = async function(item, qty, costPerUnit) {
    if (!costPerUnit || !qty) return;
    if (typeof window.isLinkActive === 'function' && !window.isLinkActive('warehouse', 'finance')) return;

    const total    = qty * costPerUnit;
    const currency = window.currentCompanyData?.currency || 'UAH';
    const desc     = `${_t('Видача: ','Выдача: ')}${item.name} × ${qty} ${item.unit || 'шт'} ${_t('(собівартість)','(себестоимость)')}`;

    try {
      await _saveTx({
        type:        'expense',
        amount:      total,
        currency,
        amountBase:  total,
        categoryId:  await _getCogsCategory(),
        date:        firebase.firestore.Timestamp.fromDate(new Date()),
        accrualDate: firebase.firestore.Timestamp.fromDate(new Date()),
        description: desc,
        source:      'warehouse',
        warehouseOp: 'OUT',
        itemId:      item.id,
        itemName:    item.name,
        qty,
        pricePerUnit: costPerUnit,
      });
    } catch(e) {
      console.warn('[whBridge] OUT error:', e.message);
    }
  };

  // ── Нова функція: списання браку ──────────────────────
  window.whFinanceOnWriteOff = async function(item, qty, costPerUnit, reason) {
    if (!costPerUnit || !qty) return;
    if (typeof window.isLinkActive === 'function' && !window.isLinkActive('warehouse', 'finance')) return;

    const total    = qty * costPerUnit;
    const currency = window.currentCompanyData?.currency || 'UAH';
    const desc     = `${_t('Списання: ','Списание: ')}${item.name} × ${qty} ${reason ? '(' + reason + ')' : ''}`;

    try {
      await _saveTx({
        type:        'expense',
        amount:      total,
        currency,
        amountBase:  total,
        categoryId:  await _getCogsCategory(),
        date:        firebase.firestore.Timestamp.fromDate(new Date()),
        accrualDate: firebase.firestore.Timestamp.fromDate(new Date()),
        description: desc,
        source:      'warehouse',
        warehouseOp: 'WRITE_OFF',
        itemId:      item.id,
        itemName:    item.name,
        qty,
        pricePerUnit: costPerUnit,
        writeOffReason: reason || '',
      });
    } catch(e) {
      console.warn('[whBridge] WRITE_OFF error:', e.message);
    }
  };

  // ── Патч whDoOperation — додаємо виклик bridge після операції ──
  const _origDo = window.whDoOperation;
  window.whDoOperation = async function(params) {
    const result = await _origDo.call(this, params);

    // Тільки якщо зв'язок увімкнено
    if (typeof window.isLinkActive === 'function' && !window.isLinkActive('warehouse', 'finance')) {
      return result;
    }

    try {
      const { itemId, type, qty, price } = params;
      const items = typeof window.whGetItems === 'function' ? window.whGetItems() : [];
      const item  = items.find(i => i.id === itemId);
      if (!item) return result;

      // Середня собівартість для OUT і WRITE_OFF
      const costPerUnit = item.costPrice || item.avgPrice || item.price || price || 0;

      if (type === 'OUT' && costPerUnit > 0) {
        window.whFinanceOnOut(item, qty, costPerUnit).catch(()=>{});
      } else if (type === 'WRITE_OFF' && costPerUnit > 0) {
        window.whFinanceOnWriteOff(item, qty, costPerUnit, params.note || '').catch(()=>{});
      }
      // IN вже обробляється в 99-warehouse-ui.js через виклик whFinanceOnIn
    } catch(e) {
      console.warn('[whBridge] whDoOperation hook error:', e.message);
    }

    return result;
  };

  console.log('[whBridge] Patched: whFinanceOnIn, whFinanceOnOut, whFinanceOnWriteOff, whDoOperation ✓');
}

// ── Збереження транзакції ─────────────────────────────────
async function _saveTx(data) {
  const db  = window.db || (window.firebase && firebase.firestore());
  const cid = window.currentCompanyId;
  if (!db || !cid) throw new Error('DB не готова');

  const txData = { ...data, createdBy: window.currentUser?.uid || 'system', createdAt: firebase.firestore.FieldValue.serverTimestamp(), recurring: false };
  Object.keys(txData).forEach(k => { if (txData[k] === null || txData[k] === undefined) delete txData[k]; });

  await db.collection('companies').doc(cid).collection('finance_transactions').add(txData);
}

// ── Пошук або створення COGS категорії ───────────────────
let _cogsCatId = null;
async function _getCogsCategory() {
  if (_cogsCatId) return _cogsCatId;
  try {
    const db  = window.db || (window.firebase && firebase.firestore());
    const cid = window.currentCompanyId;
    if (!db || !cid) return 'exp_materials';

    // Спочатку шукаємо кастомну категорію з costType=cogs
    const snap = await db.collection('companies').doc(cid)
      .collection('finance_categories')
      .where('type','==','expense')
      .where('costType','==','cogs')
      .limit(1).get();

    if (!snap.empty) {
      _cogsCatId = snap.docs[0].id;
      return _cogsCatId;
    }
    // Fallback: системна категорія матеріалів
    return 'exp_materials';
  } catch(e) {
    return 'exp_materials';
  }
}

// ── Старт ─────────────────────────────────────────────────
_patch();
console.log('[whBridge] v1.0 loaded');

})();
