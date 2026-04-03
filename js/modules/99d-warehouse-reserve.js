/**
 * 99d-warehouse-reserve.js — Атомарне резервування товарів
 * TALKO SaaS
 *
 * Замінює batch.update в 106-sales-orders.js на Firestore runTransaction
 * щоб уникнути race condition при одночасних замовленнях.
 *
 * Публічне API:
 *   window.warehouseReserve(orderId, items)   — зарезервувати
 *   window.warehouseRelease(orderId, items)   — звільнити резерв
 *   window.warehouseDeduct(items)             — списати (при реалізації)
 */
(function () {
  'use strict';

  function tg(ua, en) { const l=window.currentLang||window.currentUserData?.language||'ua'; return l==='en'?en:ua; }
  function db() { return window.db||(window.firebase&&firebase.firestore()); }
  function cid() { return window.currentCompanyId||null; }
  function toast(msg, type) { if(typeof window.showToast==='function') window.showToast(msg, type||'success'); }

  // ─── Атомарне резервування ────────────────────────────────────────────────
  // Повертає { success: true } або { success: false, conflicts: [{name, needed, available}] }
  window.warehouseReserve = async function(orderId, items) {
    if (!db() || !cid()) return { success: false, error: 'no db/cid' };

    const compRef = db().collection('companies').doc(cid());
    const warehouseItems = items.filter(i => i.warehouseItemId);
    if (!warehouseItems.length) return { success: true };

    const conflicts = [];

    try {
      await db().runTransaction(async (transaction) => {
        // Читаємо всі stock документи в транзакції
        const stockRefs = warehouseItems.map(i =>
          compRef.collection('warehouse_stock').doc(i.warehouseItemId)
        );
        const stockDocs = await Promise.all(stockRefs.map(r => transaction.get(r)));

        // Перевіряємо наявність
        stockDocs.forEach((stockDoc, idx) => {
          const item = warehouseItems[idx];
          const data = stockDoc.exists ? stockDoc.data() : {};
          const qty      = Number(data.quantity || 0);
          const reserved = Number(data.reserved || 0);
          const available = Math.max(0, qty - reserved);
          if (Number(item.qty) > available) {
            conflicts.push({
              name:      item.name || item.warehouseItemId,
              needed:    Number(item.qty),
              available,
            });
          }
        });

        // Якщо є конфлікти — відміняємо транзакцію
        if (conflicts.length) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        // Всі доступні — резервуємо атомарно
        stockDocs.forEach((stockDoc, idx) => {
          const item = warehouseItems[idx];
          const data = stockDoc.exists ? stockDoc.data() : {};
          const qty      = Number(data.quantity || 0);
          const reserved = Number(data.reserved || 0);
          const newReserved = reserved + Number(item.qty);

          if (stockDoc.exists) {
            transaction.update(stockRefs[idx], {
              reserved:  newReserved,
              available: Math.max(0, qty - newReserved),
            });
          } else {
            // Документу stock немає — створюємо
            transaction.set(stockRefs[idx], {
              quantity:  qty,
              reserved:  newReserved,
              available: Math.max(0, qty - newReserved),
            });
          }
        });

        // Логуємо резерв у warehouse_operations
        warehouseItems.forEach(item => {
          const opRef = compRef.collection('warehouse_operations').doc();
          transaction.set(opRef, {
            type:      'reserve',
            itemId:    item.warehouseItemId,
            itemName:  item.name || '',
            qty:       Number(item.qty),
            orderId:   orderId || null,
            createdBy: window.currentUserData?.id || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
      });

      return { success: true };

    } catch(e) {
      if (e.message === 'INSUFFICIENT_STOCK') {
        return { success: false, conflicts };
      }
      console.error('warehouseReserve:', e);
      return { success: false, error: e.message };
    }
  };

  // ─── Звільнення резерву (при скасуванні замовлення) ──────────────────────
  window.warehouseRelease = async function(orderId, items) {
    if (!db() || !cid()) return { success: false };

    const compRef = db().collection('companies').doc(cid());
    const warehouseItems = items.filter(i => i.warehouseItemId);
    if (!warehouseItems.length) return { success: true };

    try {
      await db().runTransaction(async (transaction) => {
        const stockRefs = warehouseItems.map(i =>
          compRef.collection('warehouse_stock').doc(i.warehouseItemId)
        );
        const stockDocs = await Promise.all(stockRefs.map(r => transaction.get(r)));

        stockDocs.forEach((stockDoc, idx) => {
          const item = warehouseItems[idx];
          const data = stockDoc.exists ? stockDoc.data() : {};
          const qty       = Number(data.quantity || 0);
          const reserved  = Number(data.reserved || 0);
          const newReserved = Math.max(0, reserved - Number(item.qty));

          transaction.update(stockRefs[idx], {
            reserved:  newReserved,
            available: Math.max(0, qty - newReserved),
          });

          // Лог
          const opRef = compRef.collection('warehouse_operations').doc();
          transaction.set(opRef, {
            type:      'reserve_release',
            itemId:    item.warehouseItemId,
            itemName:  item.name || '',
            qty:       Number(item.qty),
            orderId:   orderId || null,
            createdBy: window.currentUserData?.id || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
      });

      return { success: true };
    } catch(e) {
      console.error('warehouseRelease:', e);
      return { success: false, error: e.message };
    }
  };

  // ─── Атомарне списання (при проведенні реалізації) ───────────────────────
  window.warehouseDeduct = async function(realizationId, items) {
    if (!db() || !cid()) return { success: false };

    const compRef = db().collection('companies').doc(cid());
    const warehouseItems = items.filter(i => i.warehouseItemId);
    if (!warehouseItems.length) return { success: true };

    try {
      await db().runTransaction(async (transaction) => {
        const stockRefs = warehouseItems.map(i =>
          compRef.collection('warehouse_stock').doc(i.warehouseItemId)
        );
        const stockDocs = await Promise.all(stockRefs.map(r => transaction.get(r)));

        stockDocs.forEach((stockDoc, idx) => {
          const item = warehouseItems[idx];
          const data = stockDoc.exists ? stockDoc.data() : {};
          const qty      = Number(data.quantity || 0);
          const reserved = Number(data.reserved || 0);
          const deduct   = Number(item.qty);

          const newQty      = Math.max(0, qty - deduct);
          const newReserved = Math.max(0, reserved - deduct);

          transaction.update(stockRefs[idx], {
            quantity:  newQty,
            reserved:  newReserved,
            available: Math.max(0, newQty - newReserved),
          });

          // Лог
          const opRef = compRef.collection('warehouse_operations').doc();
          transaction.set(opRef, {
            type:           'sale',
            itemId:         item.warehouseItemId,
            itemName:       item.name || '',
            qty:            deduct,
            realizationId:  realizationId || null,
            createdBy:      window.currentUserData?.id || '',
            createdAt:      firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
      });

      return { success: true };
    } catch(e) {
      console.error('warehouseDeduct:', e);
      return { success: false, error: e.message };
    }
  };

  console.log('99d-warehouse-reserve: loaded');

})();
