'use strict';
// ═══════════════════════════════════════════════════════════
//  99-warehouse-alerts.js  —  Тривоги мінімальних залишків
// ═══════════════════════════════════════════════════════════

(function () {

  const _alerts = { notified: new Set(), checkInterval: null };

  // ── Перевірка тривог ─────────────────────────────────────
  window.whCheckAlerts = function () {
    const items = window.whGetItems ? window.whGetItems() : [];
    const triggered = [];

    items.forEach(item => {
      if (!item.minStock || item.minStock <= 0) return;
      const s = window.whGetStock(item.id);
      const level = window.whStockLevel(item.id);

      if (level === 'critical' || level === 'low') {
        triggered.push({ item, stock: s, level });

        // Тост тільки якщо ще не нотифіковано в цій сесії
        if (!_alerts.notified.has(item.id) && level === 'critical') {
          _alerts.notified.add(item.id);
          if (window.showToast) {
            showToast(`⚠️ Критичний залишок: ${item.name} (${s.qty} ${item.unit || 'шт'})`, 'warning');
          }
          // Авто-задача при критичному залишку (fire-and-forget)
          if (window.whCreateRestockTask) {
            window.whCreateRestockTask(item).catch(() => {});
          }
        }
      }
    });

    window.dispatchEvent(new CustomEvent('wh:alertsChecked', { detail: { alerts: triggered } }));
    return triggered;
  };

  // ── Автоматична перевірка кожні 5 хв ────────────────────
  window.whStartAlertWatch = function () {
    if (_alerts.checkInterval) clearInterval(_alerts.checkInterval);
    // Перша перевірка — через 3 сек після ініціалізації
    setTimeout(() => window.whCheckAlerts && window.whCheckAlerts(), 3000);
    _alerts.checkInterval = setInterval(() => {
      window.whCheckAlerts && window.whCheckAlerts();
    }, 5 * 60 * 1000);
  };

  window.whStopAlertWatch = function () {
    if (_alerts.checkInterval) clearInterval(_alerts.checkInterval);
  };

  // ── Слухаємо оновлення stock ─────────────────────────────
  // Очищаємо notified при оновленні items (видалений товар)
  window.addEventListener('wh:itemsUpdated', () => {
    const currentIds = new Set((window.whGetItems ? window.whGetItems() : []).map(i => i.id));
    _alerts.notified.forEach(id => {
      if (!currentIds.has(id)) _alerts.notified.delete(id);
    });
  });

  window.addEventListener('wh:stockUpdated', () => {
    window.whCheckAlerts && window.whCheckAlerts();
  });

  // ── Рендер badge в навігації ─────────────────────────────
  window.whUpdateNavBadge = function () {
    const count = window.whAlertsCount ? window.whAlertsCount() : 0;
    const badge = document.getElementById('warehouseNavBadge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  };

  window.addEventListener('wh:alertsChecked', () => {
    window.whUpdateNavBadge && window.whUpdateNavBadge();
    // Оновлюємо UI якщо відкрита вкладка складу
    if (window._whRenderAlerts) window._whRenderAlerts();
  });

  // ── Список тривог для UI ─────────────────────────────────
  window.whGetAlertsList = function () {
    const items = window.whGetItems ? window.whGetItems() : [];
    return items
      .filter(item => item.minStock > 0 && (window.whGetStock(item.id).qty || 0) <= item.minStock)
      .map(item => ({
        item,
        stock: window.whGetStock(item.id),
        level: window.whStockLevel(item.id),
      }))
      .sort((a, b) => a.stock.qty - b.stock.qty);
  };

  console.log('[warehouse-alerts] loaded');
})();
