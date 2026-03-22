(function () {
  'use strict';

  function col(name) {
    return window.db.collection('companies').doc(window.currentCompanyId).collection(name);
  }
  function fmt(n) { return Number(n || 0).toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function toast(msg, type) { if (typeof showToast === 'function') showToast(msg, type || 'success'); }

  let _shifts = [];
  let _currentShift = null;

  // ─── load shifts ──────────────────────────────────────────────────────────
  async function loadShifts() {
    if (!window.currentCompanyId) return;
    try {
      const snap = await col('sales_shifts').orderBy('createdAt', 'desc').limit(30).get();
      _shifts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      _currentShift = _shifts.find(s => s.status === 'open') || null;
    } catch (e) { console.warn('loadShifts:', e.message); }
  }

  // ─── open shift ──────────────────────────────────────────────────────────
  window._salesOpenShift = async function () {
    if (_currentShift) { toast('Зміна вже відкрита', 'warn'); return; }

    const cashStr = prompt('Каса на початок зміни (₴):', '0');
    if (cashStr === null) return;
    const cashStart = parseFloat(cashStr) || 0;

    try {
      const ref = col('sales_shifts').doc();
      const data = {
        status: 'open',
        openedAt: firebase.firestore.FieldValue.serverTimestamp(),
        closedAt: null,
        openedBy: window.currentUser?.uid || '',
        openedByName: window.currentUser?.displayName || window.currentUser?.email || '',
        cashStart,
        cashEnd: 0,
        totalCash: 0,
        totalTerminal: 0,
        totalTransfer: 0,
        totalRevenue: 0,
        ordersCount: 0,
        avgCheck: 0,
        notes: '',
        isDemo: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await ref.set(data);
      _currentShift = { id: ref.id, ...data };
      toast('Зміну відкрито');
      renderShiftsPanel();
    } catch (e) { toast('Помилка: ' + e.message, 'error'); }
  };

  // ─── close shift ──────────────────────────────────────────────────────────
  window._salesCloseShift = async function () {
    if (!_currentShift) { toast('Немає відкритої зміни', 'warn'); return; }

    // Calculate totals from today's receipts
    let totalCash = 0, totalTerminal = 0, totalTransfer = 0, ordersCount = 0;
    try {
      const shiftOpenTs = _currentShift.openedAt?.toDate ? _currentShift.openedAt.toDate() : new Date();
      const snap = await col('sales_orders')
        .where('type', '==', 'receipt')
        .where('status', '==', 'paid')
        .get();
      snap.docs.forEach(d => {
        const o = d.data();
        const oTs = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(0);
        if (oTs >= shiftOpenTs) {
          ordersCount++;
          if (o.paymentMethod === 'cash') totalCash += o.total || 0;
          else if (o.paymentMethod === 'terminal') totalTerminal += o.total || 0;
          else if (o.paymentMethod === 'transfer') totalTransfer += o.total || 0;
          else totalCash += o.total || 0; // default
        }
      });
    } catch (e) { console.warn('closeShift calc:', e); }

    const totalRevenue = totalCash + totalTerminal + totalTransfer;
    const avgCheck = ordersCount > 0 ? totalRevenue / ordersCount : 0;

    const cashEndStr = prompt(
      `Підсумок зміни:\n💰 Виручка: ${fmt(totalRevenue)} ₴\n📦 Чеків: ${ordersCount}\n\nКаса на кінець (₴):`,
      String(Math.round((_currentShift.cashStart || 0) + totalCash))
    );
    if (cashEndStr === null) return;
    const cashEnd = parseFloat(cashEndStr) || 0;

    try {
      await col('sales_shifts').doc(_currentShift.id).update({
        status: 'closed',
        closedAt: firebase.firestore.FieldValue.serverTimestamp(),
        cashEnd,
        totalCash: Math.round(totalCash * 100) / 100,
        totalTerminal: Math.round(totalTerminal * 100) / 100,
        totalTransfer: Math.round(totalTransfer * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        ordersCount,
        avgCheck: Math.round(avgCheck * 100) / 100,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      _currentShift = null;
      toast('Зміну закрито');
      await loadShifts();
      renderShiftsPanel();
      showShiftSummary({ totalRevenue, totalCash, totalTerminal, totalTransfer, ordersCount, avgCheck, cashEnd, cashStart: _currentShift?.cashStart || 0 });
    } catch (e) { toast('Помилка: ' + e.message, 'error'); }
  };

  function showShiftSummary(data) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:1.75rem;width:min(380px,95vw);text-align:center">
        <div style="font-size:2rem;margin-bottom:.5rem">📊</div>
        <h3 style="margin:0 0 1.25rem;font-size:1.1rem">Підсумок зміни</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
          <div style="background:#f0fdf4;border-radius:8px;padding:.75rem">
            <div style="font-size:.7rem;color:#6b7280;margin-bottom:2px">Виручка</div>
            <div style="font-size:1.3rem;font-weight:700;color:#10b981">${fmt(data.totalRevenue)} ₴</div>
          </div>
          <div style="background:#eff6ff;border-radius:8px;padding:.75rem">
            <div style="font-size:.7rem;color:#6b7280;margin-bottom:2px">Чеків</div>
            <div style="font-size:1.3rem;font-weight:700;color:#3b82f6">${data.ordersCount}</div>
          </div>
          <div style="background:#fefce8;border-radius:8px;padding:.75rem">
            <div style="font-size:.7rem;color:#6b7280;margin-bottom:2px">Готівка</div>
            <div style="font-size:1rem;font-weight:700">${fmt(data.totalCash)} ₴</div>
          </div>
          <div style="background:#fdf4ff;border-radius:8px;padding:.75rem">
            <div style="font-size:.7rem;color:#6b7280;margin-bottom:2px">Термінал</div>
            <div style="font-size:1rem;font-weight:700">${fmt(data.totalTerminal)} ₴</div>
          </div>
        </div>
        <div style="font-size:.85rem;color:#6b7280;margin-bottom:1rem">Середній чек: <b>${fmt(data.avgCheck)} ₴</b></div>
        <button onclick="this.closest('div[style]').remove()" style="background:#6366f1;color:#fff;border:none;padding:8px 24px;border-radius:7px;cursor:pointer;font-weight:600">OK</button>
      </div>`;
    document.body.appendChild(overlay);
  }

  // ─── render shifts panel ─────────────────────────────────────────────────
  window.renderShiftsPanel = async function () {
    const cont = document.getElementById('salesShiftsContent');
    if (!cont) return;
    await loadShifts();

    const isOpen = !!_currentShift;

    cont.innerHTML = `
      <!-- Current shift status -->
      <div style="background:${isOpen ? '#f0fdf4' : '#f9fafb'};border:1px solid ${isOpen ? '#86efac' : '#e5e7eb'};border-radius:10px;padding:1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem">
        <div>
          <div style="font-weight:700;font-size:.95rem">${isOpen ? '🟢 Зміна відкрита' : '⚪ Зміна закрита'}</div>
          ${isOpen ? `<div style="font-size:.8rem;color:#6b7280;margin-top:2px">Відкрив: ${esc(_currentShift.openedByName||'—')} · Каса на початок: ${fmt(_currentShift.cashStart)} ₴</div>` : '<div style="font-size:.8rem;color:#9ca3af">Відкрийте нову зміну для роботи з касою</div>'}
        </div>
        <div style="display:flex;gap:.5rem">
          ${isOpen
            ? `<button onclick="window._salesCloseShift()" style="background:#ef4444;color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-weight:600;font-size:.85rem">Закрити зміну</button>`
            : `<button onclick="window._salesOpenShift()" style="background:#10b981;color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-weight:600;font-size:.85rem">Відкрити зміну</button>`
          }
        </div>
      </div>

      <!-- Shifts history -->
      <b style="font-size:.85rem;color:#374151">Журнал змін</b>
      <div style="overflow-x:auto;margin-top:.5rem">
        <table style="width:100%;border-collapse:collapse;font-size:.83rem">
          <thead><tr style="background:#f8fafc">
            <th style="padding:8px;text-align:left;color:#6b7280;font-weight:600">Дата</th>
            <th style="padding:8px;text-align:left;color:#6b7280;font-weight:600">Відкрив</th>
            <th style="padding:8px;text-align:right;color:#6b7280;font-weight:600">Виручка</th>
            <th style="padding:8px;text-align:center;color:#6b7280;font-weight:600">Чеків</th>
            <th style="padding:8px;text-align:right;color:#6b7280;font-weight:600">Сер. чек</th>
            <th style="padding:8px;text-align:center;color:#6b7280;font-weight:600">Статус</th>
          </tr></thead>
          <tbody>
            ${!_shifts.length ? `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9ca3af">Немає змін</td></tr>` :
              _shifts.map(s => `
                <tr style="border-bottom:1px solid #f3f4f6;cursor:pointer" onclick="window._salesShiftDetail('${s.id}')">
                  <td style="padding:8px">${s.openedAt?.toDate ? s.openedAt.toDate().toLocaleDateString('uk-UA') : '—'}</td>
                  <td style="padding:8px">${esc(s.openedByName || '—')}</td>
                  <td style="padding:8px;text-align:right;font-weight:700;color:#10b981">${fmt(s.totalRevenue)} ₴</td>
                  <td style="padding:8px;text-align:center">${s.ordersCount || 0}</td>
                  <td style="padding:8px;text-align:right">${fmt(s.avgCheck)} ₴</td>
                  <td style="padding:8px;text-align:center">
                    <span style="padding:2px 8px;border-radius:12px;font-size:.75rem;font-weight:600;background:${s.status === 'open' ? '#d1fae5' : '#f3f4f6'};color:${s.status === 'open' ? '#059669' : '#6b7280'}">
                      ${s.status === 'open' ? 'Відкрита' : 'Закрита'}
                    </span>
                  </td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  window._salesShiftDetail = function (shiftId) {
    const s = _shifts.find(x => x.id === shiftId);
    if (!s) return;
    alert(
      `Зміна ${s.openedAt?.toDate ? s.openedAt.toDate().toLocaleDateString('uk-UA') : ''}\n\n` +
      `Виручка: ${fmt(s.totalRevenue)} ₴\n` +
      `  💵 Готівка: ${fmt(s.totalCash)} ₴\n` +
      `  💳 Термінал: ${fmt(s.totalTerminal)} ₴\n` +
      `  📱 Переказ: ${fmt(s.totalTransfer)} ₴\n\n` +
      `Чеків: ${s.ordersCount || 0}\n` +
      `Середній чек: ${fmt(s.avgCheck)} ₴\n\n` +
      `Каса на початок: ${fmt(s.cashStart)} ₴\n` +
      `Каса на кінець: ${fmt(s.cashEnd)} ₴`
    );
  };

  // ─── expose current shift for receipt form ────────────────────────────────
  window._salesGetCurrentShift = function () { return _currentShift; };

  // Load on init
  if (window.currentCompanyId) loadShifts();

})();
