'use strict';
// ═══════════════════════════════════════════════════════════
//  99-warehouse-core.js  —  TALKO Склад: ядро
//  Каталог товарів, залишки, операції IN/OUT/WRITE_OFF
// ═══════════════════════════════════════════════════════════

(function () {

  // ── Стан модуля ──────────────────────────────────────────
  const _wh = {
    items:           [],   // каталог
    stock:           {},   // { itemId: { qty, reserved, minStock } } — загальний
    stockByLocation: {},   // { locationId: { itemId: { qty } } } — по локаціях
    locations:       [],   // локації
    operations:      [],   // журнал (останні 100)
    suppliers:       [],   // постачальники
    listeners:       [],   // unsubscribe functions
    initialized: false,
    companyId: null,
  };
  window._whState = _wh;

  // ── DB helpers ───────────────────────────────────────────
  function compRef()  { return window.companyRef ? window.companyRef() : window.db.collection('companies').doc(window.currentCompanyId); }
  function col(name)  { return compRef().collection(name); }

  // ── Ініціалізація ────────────────────────────────────────
  window.initWarehouseCore = async function () {
    const cid = window.currentCompanyId;
    if (_wh.initialized && _wh.companyId === cid) return;
    _wh.companyId = cid;
    _wh.initialized = true;

    _whUnsubAll();
    await Promise.all([
      _whListenItems(),
      _whListenStock(),
      _whListenLocations(),
      _whListenSuppliers(),
      _whListenStockByLocation(),
    ]);
    _whListenOperations();
  };

  function _whUnsubAll() {
    _wh.listeners.forEach(fn => { try { fn(); } catch (e) {} });
    _wh.listeners = [];
  }

  // ── Listeners ────────────────────────────────────────────
  function _whListenItems() {
    return new Promise(resolve => {
      const unsub = col('warehouse_items')
        .onSnapshot(snap => {
          _wh.items = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(i => i.deleted !== true);
          _wh.items.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'uk'));
          window.dispatchEvent(new CustomEvent('wh:itemsUpdated'));
          resolve();
        }, err => { console.error('[wh] items', err); resolve(); });
      _wh.listeners.push(unsub);
    });
  }

  function _whListenStock() {
    return new Promise(resolve => {
      const unsub = col('warehouse_stock')
        .onSnapshot(snap => {
          _wh.stock = {};
          snap.docs.forEach(d => {
            const data = d.data();
            if (data.deleted !== true) _wh.stock[d.id] = data;
          });
          window.dispatchEvent(new CustomEvent('wh:stockUpdated'));
          resolve();
        }, err => { console.error('[wh] stock', err); resolve(); });
      _wh.listeners.push(unsub);
    });
  }

  let _defaultLocationCreating = false;
  function _whListenLocations() {
    return new Promise(resolve => {
      const unsub = col('warehouse_locations')
        .onSnapshot(snap => {
          _wh.locations = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(l => l.deleted !== true);
          if (_wh.locations.length === 0 && !_defaultLocationCreating) {
            _defaultLocationCreating = true;
            _whEnsureDefaultLocation().finally(() => { _defaultLocationCreating = false; });
          }
          resolve();
        }, err => { console.error('[wh] locations', err); resolve(); });
      _wh.listeners.push(unsub);
    });
  }

  function _whListenSuppliers() {
    return new Promise(resolve => {
      const unsub = col('warehouse_suppliers')
        .onSnapshot(snap => {
          _wh.suppliers = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(s => s.deleted !== true);
          resolve();
        }, err => { console.error('[wh] suppliers', err); resolve(); });
      _wh.listeners.push(unsub);
    });
  }

  function _whListenStockByLocation() {
    return new Promise(resolve => {
      const unsub = col('warehouse_stock_locations')
        .onSnapshot(snap => {
          _wh.stockByLocation = {};
          snap.docs.forEach(d => {
            const data = d.data();
            if (data.deleted === true) return;
            const locId  = data.locationId;
            const itemId = data.itemId;
            if (!locId || !itemId) return;
            if (!_wh.stockByLocation[locId]) _wh.stockByLocation[locId] = {};
            _wh.stockByLocation[locId][itemId] = data;
          });
          window.dispatchEvent(new CustomEvent('wh:locationStockUpdated'));
          resolve();
        }, err => { console.error('[wh] stock_locations', err); resolve(); });
      _wh.listeners.push(unsub);
    });
  }

  function _whListenOperations() {
    const unsub = col('warehouse_operations')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(snap => {
        _wh.operations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        window.dispatchEvent(new CustomEvent('wh:operationsUpdated'));
      }, err => {
        // Якщо index не готовий — fallback без orderBy
        console.warn('[wh] operations orderBy failed, using fallback', err.message);
        const unsub2 = col('warehouse_operations')
          .limit(100)
          .onSnapshot(snap => {
            _wh.operations = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() || 0;
                const tb = b.createdAt?.toMillis?.() || 0;
                return tb - ta;
              });
            window.dispatchEvent(new CustomEvent('wh:operationsUpdated'));
          }, e2 => console.error('[wh] operations fallback', e2));
        _wh.listeners.push(unsub2);
      });
    _wh.listeners.push(unsub);
  }

  async function _whEnsureDefaultLocation() {
    await col('warehouse_locations').add({
      name: 'Головний склад',
      type: 'warehouse',
      isDefault: true,
      deleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  // ── CRUD: Items ──────────────────────────────────────────
  window.whSaveItem = async function (data, id) {
    const payload = {
      name:        data.name || '',
      sku:         data.sku || '',
      category:    data.category || '',
      unit:        data.unit || 'шт',
      costPrice:   Number(data.costPrice) || 0,
      salePrice:   Number(data.salePrice) || 0,
      minStock:    Number(data.minStock) || 0,
      orderPoint:  Number(data.orderPoint) || 0,
      supplierId:  data.supplierId || null,
      description: data.description || '',
      barcode:     data.barcode || '',
      tags:        data.tags || [],
      niche:       data.niche || '',
      costMethod:  data.costMethod || 'avg', // avg | fifo
      deleted:     false,
      updatedAt:   firebase.firestore.FieldValue.serverTimestamp(),
    };
    const db2  = firebase.firestore();
    const cRef = compRef();
    const batch = db2.batch();
    if (id) {
      batch.update(cRef.collection('warehouse_items').doc(id), payload);
      batch.set(cRef.collection('warehouse_stock').doc(id), {
        name: payload.name, unit: payload.unit, minStock: payload.minStock,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      await batch.commit();
      return id;
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const newRef = cRef.collection('warehouse_items').doc();
      batch.set(newRef, payload);
      batch.set(cRef.collection('warehouse_stock').doc(newRef.id), {
        itemId: newRef.id, qty: 0, reserved: 0,
        minStock: payload.minStock,
        name: payload.name, unit: payload.unit,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await batch.commit();
      return newRef.id;
    }
  };

  window.whDeleteItem = async function (id) {
    const db2  = firebase.firestore();
    const cRef = compRef();
    const batch = db2.batch();
    batch.update(cRef.collection('warehouse_items').doc(id), {
      deleted: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    batch.set(cRef.collection('warehouse_stock').doc(id), {
      qty: 0, reserved: 0, deleted: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await batch.commit();
  };

  // ── CRUD: Locations ──────────────────────────────────────
  window.whSaveLocation = async function (data, id) {
    const payload = {
      name:    data.name || '',
      type:    data.type || 'warehouse',
      deleted: data.deleted === true ? true : false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (id) {
      await col('warehouse_locations').doc(id).update(payload);
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await col('warehouse_locations').add(payload);
    }
  };

  // ── CRUD: Suppliers ──────────────────────────────────────
  window.whSaveSupplier = async function (data, id) {
    const payload = {
      name:    data.name || '',
      phone:   data.phone || '',
      email:   data.email || '',
      note:    data.note || '',
      deleted: data.deleted === true ? true : false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (id) {
      await col('warehouse_suppliers').doc(id).update(payload);
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await col('warehouse_suppliers').add(payload);
    }
  };

  // ── Операції складу ──────────────────────────────────────
  window.whDoOperation = async function ({ itemId, type, qty, locationId, toLocationId, price, note, dealId, functionId }) {
    if (!itemId || !type || qty == null) throw new Error('whDoOperation: missing params');
    qty = Number(qty);
    if (isNaN(qty) || qty <= 0) throw new Error(window.t('qtyMustBePos'));

    // TRANSFER — окрема логіка: OUT з fromLocation + IN на toLocation
    if (type === 'TRANSFER') {
      if (!locationId || !toLocationId) throw new Error('TRANSFER потребує locationId і toLocationId');
      return _whDoTransfer({ itemId, qty, fromLocationId: locationId, toLocationId, note });
    }

    // Refs визначаємо ДО транзакції — col() не можна викликати всередині tx
    const db2      = firebase.firestore();
    const cRef     = compRef();
    const itemRef  = cRef.collection('warehouse_items').doc(itemId);
    const stockRef = cRef.collection('warehouse_stock').doc(itemId);
    const opRef    = cRef.collection('warehouse_operations').doc();

    // Ref для stock по локації (якщо вказана)
    const locId       = locationId || null;
    const locStockRef = locId
      ? cRef.collection('warehouse_stock_locations').doc(`${locId}_${itemId}`)
      : null;

    return db2.runTransaction(async tx => {
      const gets = [tx.get(itemRef), tx.get(stockRef)];
      if (locStockRef) gets.push(tx.get(locStockRef));
      const [itemDoc, stockDoc, locStockDoc] = await Promise.all(gets);

      if (!itemDoc.exists) throw new Error('Товар не знайдено');

      const item     = itemDoc.data();
      const stock    = stockDoc.exists ? stockDoc.data() : { qty: 0, reserved: 0 };
      const locStock = locStockDoc?.exists ? locStockDoc.data() : { qty: 0 };

      const prevQty    = stock.qty || 0;
      const prevLocQty = locStock.qty || 0;
      let newQty    = prevQty;
      let newLocQty = prevLocQty;

      if (type === 'IN') {
        newQty    = prevQty + qty;
        newLocQty = prevLocQty + qty;
      } else if (type === 'OUT' || type === 'WRITE_OFF') {
        newQty    = prevQty - qty;
        newLocQty = prevLocQty - qty;
      } else if (type === 'ADJUST') {
        // ADJUST: встановлює залишок на локації, коригує загальний на різницю
        const diff = qty - prevLocQty;
        newLocQty = qty;
        newQty    = prevQty + diff;
      }

      if (newQty < 0) throw new Error(`${window.t('notEnoughStock2').replace('{V}',item.name).replace('{V}',prevQty).replace('{V}',qty)}`);
      if (locStockRef && newLocQty < 0) throw new Error(`Недостатньо на локації: ${item.name} (є ${prevLocQty} ${item.unit||'шт'})`);

      // Оновлюємо загальний stock
      tx.set(stockRef, {
        itemId, qty: newQty,
        reserved: stock.reserved || 0,
        minStock: item.minStock || 0,
        name: item.name, unit: item.unit || 'шт',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Оновлюємо stock по локації
      if (locStockRef) {
        tx.set(locStockRef, {
          itemId, locationId: locId,
          qty: newLocQty,
          unit: item.unit || 'шт',
          name: item.name,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      // Запис операції
      tx.set(opRef, {
        itemId, itemName: item.name,
        type, qty, prevQty, newQty,
        locationId: locId || 'main',
        toLocationId: null,
        price: price != null ? Number(price) : (item.costPrice || 0),
        note: note || '',
        dealId: dealId || null,
        functionId: functionId || null,
        userId: window.currentUser?.uid || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      return { newQty, prevQty, opId: opRef.id, item };
    });
  };

  // ── TRANSFER: переміщення між локаціями ──────────────────
  async function _whDoTransfer({ itemId, qty, fromLocationId, toLocationId, note }) {
    const db2      = firebase.firestore();
    const cRef     = compRef();
    const itemRef  = cRef.collection('warehouse_items').doc(itemId);
    const stockRef = cRef.collection('warehouse_stock').doc(itemId);
    const fromRef  = cRef.collection('warehouse_stock_locations').doc(`${fromLocationId}_${itemId}`);
    const toRef    = cRef.collection('warehouse_stock_locations').doc(`${toLocationId}_${itemId}`);
    const opRef    = cRef.collection('warehouse_operations').doc();

    return db2.runTransaction(async tx => {
      const [itemDoc, stockDoc, fromDoc, toDoc] = await Promise.all([
        tx.get(itemRef), tx.get(stockRef), tx.get(fromRef), tx.get(toRef),
      ]);

      if (!itemDoc.exists) throw new Error('Товар не знайдено');
      const item     = itemDoc.data();
      const fromQty  = fromDoc.exists ? (fromDoc.data().qty || 0) : 0;
      const toQty    = toDoc.exists   ? (toDoc.data().qty   || 0) : 0;
      const totalQty = stockDoc.exists ? (stockDoc.data().qty || 0) : 0;

      if (fromQty < qty) throw new Error(`Недостатньо на локації відправника: ${item.name} (є ${fromQty} ${item.unit||'шт'})`);

      // Загальний stock не змінюється при переміщенні
      tx.set(fromRef, {
        itemId, locationId: fromLocationId,
        qty: fromQty - qty,
        unit: item.unit || 'шт', name: item.name,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      tx.set(toRef, {
        itemId, locationId: toLocationId,
        qty: toQty + qty,
        unit: item.unit || 'шт', name: item.name,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      tx.set(opRef, {
        itemId, itemName: item.name,
        type: 'TRANSFER', qty,
        prevQty: totalQty, newQty: totalQty, // загальний не змінюється
        locationId: fromLocationId,
        toLocationId: toLocationId,
        price: item.costPrice || 0,
        note: note || '',
        dealId: null, functionId: null,
        userId: window.currentUser?.uid || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      return { fromQty: fromQty - qty, toQty: toQty + qty, opId: opRef.id, item };
    });
  }

  // ── Масове списання при угоді Won ────────────────────────
  window.whDealWon = async function (deal) {
    const items = deal.warehouseItems;
    if (!items || !items.length) return;
    for (const it of items) {
      try {
        await window.whDoOperation({
          itemId: it.itemId,
          type: 'OUT',
          qty: Number(it.qty) > 0 ? Number(it.qty) : 1,
          price: it.price,
          note: window.t('угода1') + (deal.title || deal.clientName || deal.id),
          dealId: deal.id,
        });
      } catch (e) {
        console.error('[wh] deal_won write-off failed', it.itemId, e.message);
        if (window.showToast) showToast('Склад: ' + e.message, 'error');
      }
    }
    // Перевіряємо тривоги після списання
    setTimeout(() => window.whCheckAlerts && window.whCheckAlerts(), 1000);
  };

  // ── Резервування ─────────────────────────────────────────
  window.whReserve = async function (itemId, qty, reserve = true) {
    const stockRef = compRef().collection('warehouse_stock').doc(itemId);
    return firebase.firestore().runTransaction(async tx => {
      const doc = await tx.get(stockRef);
      const s = doc.exists ? doc.data() : { qty: 0, reserved: 0 };
      const delta = reserve ? Number(qty) : -Number(qty);
      const newReserved = Math.max(0, (s.reserved || 0) + delta);
      tx.set(stockRef, { reserved: newReserved, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return newReserved;
    });
  };

  // ── Хелпери ──────────────────────────────────────────────
  window.whGetStock = function (itemId) {
    const s = _wh.stock[itemId] || { qty: 0, reserved: 0 };
    return {
      qty: s.qty || 0,
      reserved: s.reserved || 0,
      available: Math.max(0, (s.qty || 0) - (s.reserved || 0)),
      minStock: s.minStock || 0,
    };
  };

  window.whStockLevel = function (itemId) {
    const s = window.whGetStock(itemId);
    if (s.minStock <= 0) return 'ok'; // без мінімуму — завжди ок
    if (s.qty === 0) return 'critical';
    if (s.qty <= s.minStock * 0.5) return 'critical';
    if (s.qty <= s.minStock) return 'low';
    return 'ok';
  };

  window.whTotalValue = function () {
    return _wh.items.reduce((sum, item) => {
      const s = _wh.stock[item.id];
      return sum + ((s?.qty || 0) * (item.costPrice || 0));
    }, 0);
  };

  window.whAlertsCount = function () {
    return _wh.items.filter(item => {
      const level = window.whStockLevel(item.id);
      return level === 'critical' || level === 'low';
    }).length;
  };

  window.whGetItems      = () => _wh.items;
  window.whGetLocations  = () => _wh.locations;
  window.whGetSuppliers  = () => _wh.suppliers;
  window.whGetOperations = () => _wh.operations;

  // Залишок товару на конкретній локації
  window.whGetStockByLocation = function (itemId, locationId) {
    const s = _wh.stockByLocation[locationId]?.[itemId];
    return { qty: s?.qty || 0, unit: s?.unit || 'шт' };
  };

  // Всі локації з залишком для конкретного товару
  window.whGetAllLocationStocks = function (itemId) {
    return _wh.locations.map(loc => ({
      locationId: loc.id,
      locationName: loc.name,
      locationType: loc.type || 'warehouse',
      qty: _wh.stockByLocation[loc.id]?.[itemId]?.qty || 0,
    }));
  };

  // Загальний залишок по всіх локаціях для товару (сума)
  window.whGetTotalLocationStock = function (itemId) {
    return Object.values(_wh.stockByLocation).reduce((sum, locStock) => {
      return sum + (locStock[itemId]?.qty || 0);
    }, 0);
  };

  // ── Фінансова транзакція при надходженні ─────────────────
  window.whFinanceOnIn = async function (item, qty, price) {
    if (!price || !qty) return;
    const total = qty * price;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const txData = {
        type:        'expense',
        amount:      total,
        currency:    window._financeState?.currency || 'UAH',
        category:    'exp_materials',
        comment:     `Надходження: ${item.name} × ${qty} ${item.unit || 'шт'}`,
        description: `Надходження: ${item.name} × ${qty} ${item.unit || 'шт'}`,
        counterparty: '',
        date:        firebase.firestore.Timestamp.fromDate(new Date()),
        source:      'warehouse',
        createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
        userId:      window.currentUser?.uid || null,
      };
      await col('finance_transactions').add(txData);
    } catch (e) {
      console.warn('[wh] finance tx failed', e.message);
    }
  };

  // ── Задача при мінімальному залишку ──────────────────────
  window.whCreateRestockTask = async function (item) {
    try {
      // Перевіряємо дублі — не створювати якщо вже є відкрита задача для цього товару
      const existing = await col(window.DB_COLS?.TASKS || 'tasks')
        .where('source', '==', 'warehouse_alert')
        .where('itemId', '==', item.id)
        .where('status', '==', 'new')
        .limit(1)
        .get();
      if (!existing.empty) return; // вже є — не дублюємо

      const now   = new Date();
      const today = now.toISOString().slice(0, 10);
      const taskData = {
        title: `Замовити: ${item.name}`,
        description: `${window.t('stockBalance2').replace('{V}',window.whGetStock(item.id).qty).replace('{V}',item.unit||'шт').replace('{V}',item.minStock)}`,
        status: 'new',
        priority: 'high',
        source: 'warehouse_alert',
        itemId: item.id,
        // Обов'язкові поля для відображення в системі задач
        creatorId:    window.currentUser?.uid || null,
        creatorName:  window.currentUserData?.name || window.currentUser?.email || 'Система',
        assigneeId:   window.currentUser?.uid || null,
        assigneeName: window.currentUserData?.name || window.currentUser?.email || '',
        deadlineDate: today,
        deadlineTime: '18:00',
        deadline:     today + 'T18:00',
        createdDate:  today,
        pinned: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await col(window.DB_COLS?.TASKS || 'tasks').add(taskData);
      if (window.showToast) showToast(`Задача: Замовити ${item.name}`, 'info');
    } catch (e) {
      console.warn('[wh] createRestockTask failed', e.message);
    }
  };

  console.log('[warehouse-core] loaded');
})();
