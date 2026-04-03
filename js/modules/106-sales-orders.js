/**
 * 106-sales-orders.js — Замовлення покупця
 * TALKO SaaS — Фаза 1 реалізації ТЗ
 *
 * Колекція: companies/{cid}/sales_purchase_orders
 * (окремо від 104-sales.js sales_orders щоб не конфліктувати)
 *
 * Публічне API:
 *   window.initSalesOrders()          — ініціалізація підвкладки
 *   window.openSalesOrderModal(id?)   — відкрити модал (новий або редагувати)
 *   window.createOrderFromDeal(deal)  — створити замовлення з CRM угоди
 */
(function () {
  'use strict';

  // ─── helpers ─────────────────────────────────────────────────────────────
  function t(k) { return (window.t && window.t(k)) || k; }
  function tg(ua, en) {
    const l = window.currentLang || window.currentUserData?.language || 'ua';
    return l === 'en' ? en : ua;
  }
  function db()  { return window.db || (window.firebase && firebase.firestore()); }
  function cid() { return window.currentCompanyId || null; }
  function col(name) {
    if (!db() || !cid()) throw new Error('DB/cid not ready');
    return db().collection('companies').doc(cid()).collection(name);
  }
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
  function today() { return new Date().toISOString().slice(0,10); }
  function el(id)  { return document.getElementById(id); }
  function showToast(msg, type) { if (typeof window.showToast === 'function') window.showToast(msg, type||'success'); }
  function canManage() {
    const r = window.currentUserData?.role;
    return r === 'owner' || r === 'manager' || r === 'admin';
  }

  // ─── constants ────────────────────────────────────────────────────────────
  const COL = 'sales_purchase_orders';

  const STATUS_CFG = {
    new:       { label: () => tg('Нове','New'),            color: '#6b7280', bg: '#f3f4f6' },
    confirmed: { label: () => tg('Підтверджено','Confirmed'), color: '#2563eb', bg: '#dbeafe' },
    partial:   { label: () => tg('Часткове','Partial'),    color: '#d97706', bg: '#fef3c7' },
    completed: { label: () => tg('Виконано','Completed'),  color: '#059669', bg: '#d1fae5' },
    cancelled: { label: () => tg('Скасовано','Cancelled'), color: '#dc2626', bg: '#fee2e2' },
  };

  const PAY_COND = {
    prepay:  () => tg('Передоплата','Prepayment'),
    postpay: () => tg('Відстрочка','Deferred'),
    partial: () => tg('Часткова оплата','Partial payment'),
  };

  // ─── state ────────────────────────────────────────────────────────────────
  const S = {
    orders:   [],
    clients:  [],
    staff:    [],
    items:    [],   // warehouse_items cache
    stock:    {},   // {itemId: {quantity, reserved}}
    priceLists: [], // price_lists cache
    currentPriceListId: null, // активний прайс для поточного модалу
    filter:   { status: 'all', search: '', assignee: '' },
    editing:  null,
    modalItems: [],
    saving:   false,
  };

  // ─── data loading ─────────────────────────────────────────────────────────
  async function loadOrders() {
    if (!cid()) return;
    try {
      const snap = await col(COL).orderBy('createdAt','desc').limit(300).get();
      S.orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderList();
      renderStats();
    } catch(e) { console.warn('106 loadOrders:', e.message); }
  }

  async function loadClients() {
    if (!cid()) return;
    try {
      const snap = await col('crm_clients').orderBy('name').limit(500).get();
      S.clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('106 loadClients:', e.message); }
  }

  async function loadWarehouseItems() {
    if (!cid()) return;
    try {
      const [itemsSnap, stockSnap] = await Promise.all([
        col('warehouse_items').where('status','!=','archived').limit(500).get().catch(() =>
          col('warehouse_items').limit(500).get()
        ),
        col('warehouse_stock').limit(500).get(),
      ]);
      S.items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      S.stock = {};
      stockSnap.docs.forEach(d => { S.stock[d.id] = d.data(); });
    } catch(e) { console.warn('106 loadWarehouseItems:', e.message); }
  }

  async function loadPriceLists() {
    if (!cid()) return;
    try {
      const snap = await col('price_lists').limit(100).get();
      S.priceLists = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('106 priceLists:', e.message); }
  }

  // ─── helpers: прайс і автознижка ─────────────────────────────────────────
  function getPriceFromList(warehouseItemId) {
    if (!warehouseItemId || !S.currentPriceListId) return null;
    const pl = S.priceLists.find(p => p.id === S.currentPriceListId);
    if (!pl) return null;
    const entry = (pl.items || []).find(i => i.warehouseItemId === warehouseItemId);
    return entry != null ? Number(entry.price) : null;
  }

  function getDefaultPriceListForClient(clientId) {
    const client = S.clients.find(c => c.id === clientId);
    if (client?.priceTypeId) {
      if (S.priceLists.find(p => p.id === client.priceTypeId)) return client.priceTypeId;
    }
    return S.priceLists.find(p => p.isDefault)?.id || null;
  }

  function calcAutoDiscount(totalAmount) {
    if (!S.currentPriceListId) return 0;
    const pl = S.priceLists.find(p => p.id === S.currentPriceListId);
    if (!pl?.discountRules?.length) return 0;
    const rules = pl.discountRules
      .filter(r => totalAmount >= Number(r.minAmount || 0))
      .sort((a, b) => b.discountPercent - a.discountPercent);
    return rules[0]?.discountPercent || 0;
  }

  async function loadStaff() {
    if (!cid() || (window.users && window.users.length)) {
      S.staff = window.users || [];
      return;
    }
    try {
      const snap = await col('users').get();
      S.staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('106 loadStaff:', e.message); }
  }

  // ─── order number ─────────────────────────────────────────────────────────
  async function generateOrderNumber() {
    const year = new Date().getFullYear();
    try {
      // Атомарний лічильник через Firestore transaction — захист від дублікатів
      const counterRef = db().collection('companies').doc(cid()).collection('settings').doc('sales_counters');
      let seq = 1;
      await db().runTransaction(async (tx) => {
        const doc = await tx.get(counterRef);
        const data = doc.exists ? doc.data() : {};
        seq = Number(data[`order_${year}`] || 0) + 1;
        tx.set(counterRef, { [`order_${year}`]: seq }, { merge: true });
      });
      return `ORD-${year}-${String(seq).padStart(4,'0')}`;
    } catch(e) {
      // Fallback — час як унікальний суфікс
      return `ORD-${year}-${String(Date.now()).slice(-6)}`;
    }
  }

  // ─── available stock helper ───────────────────────────────────────────────
  function getAvailable(itemId) {
    const st = S.stock[itemId];
    if (!st) return 0;
    const qty      = Number(st.quantity || 0);
    const reserved = Number(st.reserved || 0);
    return Math.max(0, qty - reserved);
  }

  // ─── RENDER LIST ──────────────────────────────────────────────────────────
  function renderList() {
    const wrap = el('soListWrap');
    if (!wrap) return;

    let orders = S.orders;

    // filter
    if (S.filter.status !== 'all') {
      orders = orders.filter(o => o.status === S.filter.status);
    }
    if (S.filter.search) {
      const q = S.filter.search.toLowerCase();
      orders = orders.filter(o =>
        (o.number||'').toLowerCase().includes(q) ||
        (o.clientName||'').toLowerCase().includes(q)
      );
    }
    if (S.filter.assignee) {
      orders = orders.filter(o => o.assigneeId === S.filter.assignee);
    }

    if (!orders.length) {
      wrap.innerHTML = `<div style="text-align:center;padding:3rem;color:#9ca3af;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="margin-bottom:12px;opacity:.4"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
        <div style="font-size:.9rem">${tg('Замовлень не знайдено','No orders found')}</div>
        ${canManage() ? `<button onclick="window.openSalesOrderModal()" style="margin-top:12px;padding:8px 18px;background:#6366f1;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.85rem;font-weight:600">${tg('+ Нове замовлення','+ New order')}</button>` : ''}
      </div>`;
      return;
    }

    wrap.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:.84rem;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb;">
              <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280;white-space:nowrap">${tg('№ Замовлення','Order #')}</th>
              <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Клієнт','Client')}</th>
              <th style="padding:10px 12px;text-align:right;font-weight:600;color:#6b7280">${tg('Сума','Amount')}</th>
              <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Оплата','Payment')}</th>
              <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Статус','Status')}</th>
              <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Менеджер','Manager')}</th>
              <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Дата','Date')}</th>
              <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Дії','Actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((o, i) => renderOrderRow(o, i)).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function renderOrderRow(o, i) {
    const sc = STATUS_CFG[o.status] || STATUS_CFG.new;
    const dt = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('uk-UA') : (o.createdAt ? new Date(o.createdAt).toLocaleDateString('uk-UA') : '—');
    const pc = PAY_COND[o.paymentCondition] ? PAY_COND[o.paymentCondition]() : '—';
    const assignee = S.staff.find(u => u.id === o.assigneeId);
    const currency = o.currency || 'UAH';

    const actions = [];
    if (canManage()) {
      if (o.status === 'new') {
        actions.push(`<button onclick="window._soConfirm('${o.id}')" title="${tg('Підтвердити','Confirm')}" style="padding:4px 8px;border:none;border-radius:5px;cursor:pointer;font-size:.75rem;font-weight:600;background:#dbeafe;color:#2563eb">${tg('Підтвердити','Confirm')}</button>`);
      }
      if (o.status === 'new' || o.status === 'confirmed') {
        actions.push(`<button onclick="window._soCreateRealization('${o.id}')" title="${tg('Реалізація','Realization')}" style="padding:4px 8px;border:none;border-radius:5px;cursor:pointer;font-size:.75rem;font-weight:600;background:#d1fae5;color:#059669">${tg('Реалізація','Realize')}</button>`);
      }
      actions.push(`<button onclick="window.openSalesOrderModal('${o.id}')" title="${tg('Редагувати','Edit')}" style="padding:4px 6px;border:1px solid #e5e7eb;border-radius:5px;cursor:pointer;background:#fff;color:#6b7280"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`);
      if (o.status === 'new') {
        actions.push(`<button onclick="window._soCancel('${o.id}')" title="${tg('Скасувати','Cancel')}" style="padding:4px 6px;border:1px solid #fecaca;border-radius:5px;cursor:pointer;background:#fff;color:#dc2626"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`);
      }
    }

    return `<tr style="border-bottom:1px solid #f1f5f9;${i%2===0?'':'background:#fafbfc'}" onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background='${i%2===0?'':'#fafbfc'}'">
      <td style="padding:10px 12px;font-weight:600;color:#6366f1;white-space:nowrap">${esc(o.number||'—')}</td>
      <td style="padding:10px 12px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(o.clientName||'—')}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:600;white-space:nowrap">${fmt(o.totalAmount)} <span style="font-size:.75rem;color:#9ca3af">${esc(currency)}</span></td>
      <td style="padding:10px 12px;text-align:center;font-size:.78rem;color:#6b7280">${esc(pc)}</td>
      <td style="padding:10px 12px;text-align:center">
        <span style="padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;background:${sc.bg};color:${sc.color}">${sc.label()}</span>
      </td>
      <td style="padding:10px 12px;font-size:.8rem;color:#374151">${esc(assignee?.name||'—')}</td>
      <td style="padding:10px 12px;font-size:.8rem;color:#6b7280;white-space:nowrap">${esc(dt)}</td>
      <td style="padding:10px 12px;text-align:center">
        <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap">${actions.join('')}</div>
      </td>
    </tr>`;
  }

  // ─── STATS STRIP ─────────────────────────────────────────────────────────
  function renderStats() {
    const wrap = el('soStatsWrap');
    if (!wrap) return;

    const all       = S.orders;
    const totalSum  = all.reduce((s, o) => s + Number(o.totalAmount||0), 0);
    const newCount  = all.filter(o => o.status === 'new').length;
    const confCount = all.filter(o => o.status === 'confirmed').length;
    const doneCount = all.filter(o => o.status === 'completed').length;

    wrap.innerHTML = `
      <div class="so-stat-card">
        <div class="so-stat-label">${tg('Всього замовлень','Total orders')}</div>
        <div class="so-stat-value">${all.length}</div>
      </div>
      <div class="so-stat-card">
        <div class="so-stat-label">${tg('Нові','New')}</div>
        <div class="so-stat-value" style="color:#2563eb">${newCount}</div>
      </div>
      <div class="so-stat-card">
        <div class="so-stat-label">${tg('Підтверджені','Confirmed')}</div>
        <div class="so-stat-value" style="color:#d97706">${confCount}</div>
      </div>
      <div class="so-stat-card">
        <div class="so-stat-label">${tg('Виконані','Completed')}</div>
        <div class="so-stat-value" style="color:#059669">${doneCount}</div>
      </div>
      <div class="so-stat-card">
        <div class="so-stat-label">${tg('Загальна сума','Total amount')}</div>
        <div class="so-stat-value">${fmt(totalSum)} <span style="font-size:.75rem;color:#9ca3af">UAH</span></div>
      </div>`;
  }

  // ─── RENDER FILTERS ───────────────────────────────────────────────────────
  function renderFilters() {
    const wrap = el('soFiltersWrap');
    if (!wrap) return;

    const statusOptions = Object.entries(STATUS_CFG).map(([v, c]) =>
      `<option value="${v}" ${S.filter.status===v?'selected':''}>${c.label()}</option>`
    ).join('');

    const staffOptions = (window.users || S.staff).map(u =>
      `<option value="${u.id}" ${S.filter.assignee===u.id?'selected':''}>${esc(u.name)}</option>`
    ).join('');

    wrap.innerHTML = `
      <input id="soSearchInput" class="so-inp" placeholder="${tg('Пошук за номером або клієнтом...','Search by number or client...')}"
        value="${esc(S.filter.search)}" oninput="window._soFilter('search',this.value)" style="width:240px;max-width:100%">
      <select class="so-inp" onchange="window._soFilter('status',this.value)" style="width:150px">
        <option value="all">${tg('Всі статуси','All statuses')}</option>
        ${statusOptions}
      </select>
      <select class="so-inp" onchange="window._soFilter('assignee',this.value)" style="width:160px">
        <option value="">${tg('Всі менеджери','All managers')}</option>
        ${staffOptions}
      </select>
      <button onclick="window._soResetFilters()" style="padding:7px 14px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;background:#fff;font-size:.8rem;color:#6b7280">
        ${tg('Скинути','Reset')}
      </button>`;
  }

  // ─── BUILD UI ─────────────────────────────────────────────────────────────
  function buildUI() {
    const wrap = el('soRootWrap');
    if (!wrap) return;

    wrap.innerHTML = `
      <style>
        .so-inp{border:1px solid #e5e7eb;border-radius:6px;padding:7px 10px;font-size:.84rem;outline:none;box-sizing:border-box}
        .so-inp:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}
        .so-stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 18px;min-width:130px;flex:1}
        .so-stat-label{font-size:.71rem;color:#9ca3af;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
        .so-stat-value{font-size:1.3rem;font-weight:700;color:#111}
        .so-item-row:hover{background:#f0f9ff}
      </style>

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding:1rem 1rem 0">
        <h3 style="margin:0;font-size:1rem;font-weight:700;color:#111">${tg('Замовлення покупців','Purchase Orders')}</h3>
        ${canManage() ? `<button onclick="window.openSalesOrderModal()" style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.84rem;font-weight:600;display:flex;align-items:center;gap:6px">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          ${tg('Нове замовлення','New order')}
        </button>` : ''}
      </div>

      <!-- Stats -->
      <div id="soStatsWrap" style="display:flex;gap:.75rem;flex-wrap:wrap;padding:.75rem 1rem"></div>

      <!-- Filters -->
      <div id="soFiltersWrap" style="display:flex;gap:.5rem;flex-wrap:wrap;padding:0 1rem .75rem;align-items:center"></div>

      <!-- List -->
      <div id="soListWrap" style="padding:0 1rem 1rem"></div>
    `;

    renderStats();
    renderFilters();
    renderList();
  }

  // ─── MODAL ────────────────────────────────────────────────────────────────
  function buildModalHTML(order) {
    const isEdit = !!order;
    const o = order || {};
    S.modalItems = JSON.parse(JSON.stringify(o.items || [{ id: Date.now(), name: '', qty: 1, price: 0, unit: 'шт', warehouseItemId: null, discount: 0 }]));

    // Встановлюємо поточний прайс — з замовлення або з клієнта
    S.currentPriceListId = o.priceTypeId || getDefaultPriceListForClient(o.clientId) || null;

    const clientOptions = S.clients.map(c =>
      `<option value="${c.id}" data-name="${esc(c.name)}" ${o.clientId===c.id?'selected':''}>${esc(c.name)}</option>`
    ).join('');

    const staffOptions = (window.users || S.staff).filter(u => u.role !== 'guest').map(u =>
      `<option value="${u.id}" ${o.assigneeId===u.id?'selected':''}>${esc(u.name)}</option>`
    ).join('');

    // Dropdown вибору прайс-листа
    const priceListOptions = S.priceLists.map(pl =>
      `<option value="${pl.id}" ${S.currentPriceListId===pl.id?'selected':''}>${esc(pl.name)} (${pl.currency||'UAH'})${pl.isDefault?' ✓':''}</option>`
    ).join('');

    return `
      <div id="soModalOverlay" onclick="if(event.target===this)window.closeSalesOrderModal()" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;">
        <div style="background:#fff;border-radius:14px;width:100%;max-width:820px;box-shadow:0 20px 60px rgba(0,0,0,.2);margin:auto;" onclick="event.stopPropagation()">

          <!-- Modal Header -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #f1f5f9;">
            <div>
              <div style="font-size:1rem;font-weight:700;color:#111">${isEdit ? tg('Редагувати замовлення','Edit order') : tg('Нове замовлення','New order')}</div>
              ${isEdit ? `<div style="font-size:.78rem;color:#9ca3af;margin-top:2px">${esc(o.number||'')}</div>` : ''}
            </div>
            <button onclick="window.closeSalesOrderModal()" style="border:none;background:none;cursor:pointer;color:#9ca3af;padding:4px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div style="padding:20px 24px;">

            <!-- Row 1: client + manager -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
              <div>
                <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Клієнт *','Client *')}</label>
                <select id="soFldClient" class="so-inp" style="width:100%" onchange="window._soClientChange(this)">
                  <option value="">${tg('— оберіть клієнта —','— select client —')}</option>
                  ${clientOptions}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Менеджер','Manager')}</label>
                <select id="soFldAssignee" class="so-inp" style="width:100%">
                  <option value="">${tg('— оберіть —','— select —')}</option>
                  ${staffOptions}
                </select>
              </div>
            </div>

            <!-- Row 1b: прайс-лист + індикатор -->
            ${S.priceLists.length ? `<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;margin-bottom:14px">
              <div>
                <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Прайс-лист','Price list')}</label>
                <select id="soFldPriceList" class="so-inp" style="width:100%" onchange="window._soPriceListChange(this)">
                  <option value="">${tg('— базові ціни товарів —','— base item prices —')}</option>
                  ${priceListOptions}
                </select>
              </div>
              <div id="soPriceListIndicator" style="display:none;align-items:center;gap:6px;padding:6px 10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:.78rem;color:#065f46;white-space:nowrap;margin-top:20px"></div>
            </div>
            <div id="soAutoDiscountHint" style="display:none;padding:8px 12px;background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;font-size:.78rem;color:#92400e;margin-bottom:14px"></div>` : ''}

            <!-- Row 2: payment condition + days -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px">
              <div>
                <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Умова оплати','Payment terms')}</label>
                <select id="soFldPayCond" class="so-inp" style="width:100%" onchange="window._soPayCondChange(this)">
                  ${Object.entries(PAY_COND).map(([v,l]) => `<option value="${v}" ${(o.paymentCondition||'prepay')===v?'selected':''}>${l()}</option>`).join('')}
                </select>
              </div>
              <div id="soFldDaysWrap" style="display:${(o.paymentCondition||'prepay')==='prepay'?'none':'block'}">
                <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Відстрочка (днів)','Deferred (days)')}</label>
                <input id="soFldDays" type="number" class="so-inp" style="width:100%" min="0" max="365" value="${o.paymentDueDays||30}">
              </div>
              <div>
                <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Валюта','Currency')}</label>
                <select id="soFldCurrency" class="so-inp" style="width:100%">
                  ${['UAH','USD','EUR','PLN'].map(c => `<option value="${c}" ${(o.currency||'UAH')===c?'selected':''}>${c}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Items header -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="font-size:.82rem;font-weight:600;color:#374151">${tg('Позиції замовлення','Order items')}</div>
              <button onclick="window._soAddItem()" style="padding:5px 12px;border:1px dashed #6366f1;border-radius:6px;cursor:pointer;background:#fafaf9;color:#6366f1;font-size:.78rem;font-weight:600">
                + ${tg('Додати позицію','Add item')}
              </button>
            </div>

            <!-- Items table -->
            <div id="soItemsWrap" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:14px">
              <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
                <thead>
                  <tr style="background:#f8fafc">
                    <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;width:35%">${tg('Назва','Name')}</th>
                    <th style="padding:8px 6px;text-align:center;font-weight:600;color:#6b7280;width:80px">${tg('К-сть','Qty')}</th>
                    <th style="padding:8px 6px;text-align:center;font-weight:600;color:#6b7280;width:60px">${tg('Од.','Unit')}</th>
                    <th style="padding:8px 6px;text-align:right;font-weight:600;color:#6b7280;width:110px">${tg('Ціна','Price')}</th>
                    <th style="padding:8px 6px;text-align:center;font-weight:600;color:#6b7280;width:70px">${tg('Зн.%','Dis.%')}</th>
                    <th style="padding:8px 6px;text-align:right;font-weight:600;color:#6b7280;width:110px">${tg('Сума','Total')}</th>
                    <th style="padding:8px 6px;width:36px"></th>
                  </tr>
                </thead>
                <tbody id="soItemsTbody"></tbody>
              </table>
            </div>

            <!-- Totals -->
            <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
              <div style="min-width:280px;">
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:.84rem">
                  <span style="color:#6b7280">${tg('Разом без знижки:','Subtotal:')}</span>
                  <span id="soTotalGross" style="font-weight:600">0.00</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:.84rem">
                  <span style="color:#6b7280">${tg('Знижка:','Discount:')}</span>
                  <span id="soTotalDiscount" style="color:#ef4444">-0.00</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:1rem;font-weight:700">
                  <span>${tg('До сплати:','Total due:')}</span>
                  <span id="soTotalNet" style="color:#6366f1">0.00</span>
                </div>
              </div>
            </div>

            <!-- Note -->
            <div>
              <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Коментар','Note')}</label>
              <textarea id="soFldNote" class="so-inp" rows="2" style="width:100%;resize:vertical" placeholder="${tg('Додаткова інформація...','Additional info...')}">${esc(o.note||'')}</textarea>
            </div>

          </div>

          <!-- Modal Footer -->
          <div style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid #f1f5f9;">
            <button onclick="window.closeSalesOrderModal()" style="padding:9px 20px;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;background:#fff;font-size:.85rem;font-weight:600;color:#374151">
              ${tg('Скасувати','Cancel')}
            </button>
            <button onclick="window._soSave()" id="soSaveBtn" style="padding:9px 24px;background:#6366f1;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.85rem;font-weight:700">
              ${tg('Зберегти','Save')}
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderModalItems() {
    const tbody = el('soItemsTbody');
    if (!tbody) return;

    tbody.innerHTML = S.modalItems.map((item, idx) => {
      const warehouseOptions = S.items.map(wi => {
        const avail = getAvailable(wi.id);
        return `<option value="${wi.id}" data-price="${wi.price||wi.sellPrice||0}" data-unit="${esc(wi.unit||'шт')}" ${item.warehouseItemId===wi.id?'selected':''}>${esc(wi.name||wi.title)} (${tg('дост.','avail.')}: ${avail})</option>`;
      }).join('');

      const gross = Number(item.qty||1) * Number(item.price||0);
      const disc  = gross * (Number(item.discount||0) / 100);
      const net   = gross - disc;

      const availableQty = item.warehouseItemId ? getAvailable(item.warehouseItemId) : null;
      const qtyWarn = availableQty !== null && Number(item.qty||0) > availableQty;

      return `<tr class="so-item-row" style="border-bottom:1px solid #f1f5f9" data-idx="${idx}">
        <td style="padding:6px 10px">
          <select class="so-inp" style="width:100%;font-size:.8rem" onchange="window._soItemWarehouse(${idx},this)">
            <option value="">${tg('— або введіть вручну —','— or enter manually —')}</option>
            ${warehouseOptions}
          </select>
          <input class="so-inp" style="width:100%;margin-top:4px;font-size:.8rem" placeholder="${tg('Назва позиції','Item name')}" value="${esc(item.name||'')}" oninput="window._soItemField(${idx},'name',this.value)">
        </td>
        <td style="padding:6px">
          <input type="number" class="so-inp${qtyWarn?' so-qty-warn':''}" style="width:72px;text-align:center;${qtyWarn?'border-color:#f59e0b;background:#fffbeb':''}" value="${item.qty||1}" min="0.001" step="0.001" oninput="window._soItemField(${idx},'qty',this.value)">
          ${qtyWarn ? `<div style="font-size:.65rem;color:#d97706;margin-top:2px;white-space:nowrap">${tg('Дост.:','Avail.:')} ${availableQty}</div>` : ''}
        </td>
        <td style="padding:6px">
          <input class="so-inp" style="width:52px;text-align:center" value="${esc(item.unit||'шт')}" oninput="window._soItemField(${idx},'unit',this.value)">
        </td>
        <td style="padding:6px">
          <input type="number" class="so-inp" style="width:98px;text-align:right" value="${item.price||0}" min="0" step="0.01" oninput="window._soItemField(${idx},'price',this.value)">
        </td>
        <td style="padding:6px">
          <input type="number" class="so-inp" style="width:58px;text-align:center" value="${item.discount||0}" min="0" max="100" step="1" oninput="window._soItemField(${idx},'discount',this.value)">
        </td>
        <td style="padding:6px;text-align:right;font-weight:600;color:#111;white-space:nowrap">${fmt(net)}</td>
        <td style="padding:6px;text-align:center">
          ${S.modalItems.length > 1 ? `<button onclick="window._soRemoveItem(${idx})" style="border:none;background:none;cursor:pointer;color:#dc2626;padding:2px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>` : ''}
        </td>
      </tr>`;
    }).join('');

    updateTotals();
  }

  function updateTotals() {
    let gross = 0, discount = 0;
    S.modalItems.forEach(item => {
      const g = Number(item.qty||1) * Number(item.price||0);
      const d = g * (Number(item.discount||0) / 100);
      gross    += g;
      discount += d;
    });
    const net = gross - discount;
    const cur = el('soFldCurrency')?.value || 'UAH';

    if (el('soTotalGross'))    el('soTotalGross').textContent    = fmt(gross) + ' ' + cur;
    if (el('soTotalDiscount')) el('soTotalDiscount').textContent = '-' + fmt(discount) + ' ' + cur;
    if (el('soTotalNet'))      el('soTotalNet').textContent      = fmt(net) + ' ' + cur;

    // Показуємо підказку автознижки якщо є прайс з правилами
    const autoDisc = calcAutoDiscount(gross);
    const hint = el('soAutoDiscountHint');
    if (hint) {
      if (autoDisc > 0 && discount === 0) {
        hint.style.display = 'block';
        hint.textContent = `💡 ${tg('Автознижка','Auto discount')} ${autoDisc}% ${tg('доступна при поточній сумі','available at current amount')} — ${tg('застосуйте до позицій','apply to items')}`;
      } else if (autoDisc > 0) {
        hint.style.display = 'block';
        hint.textContent = `✅ ${tg('Знижка','Discount')} ${autoDisc}% ${tg('застосована','applied')}`;
        hint.style.color = '#059669';
      } else {
        hint.style.display = 'none';
      }
    }
  }

  // Перераховуємо автознижку — застосовуємо ТІЛЬКИ якщо ще немає ручної
  function _soRecalcAutoDiscount() {
    let gross = 0;
    S.modalItems.forEach(item => {
      gross += Number(item.qty||1) * Number(item.price||0);
    });
    const autoDisc = calcAutoDiscount(gross);
    if (autoDisc > 0) {
      // Застосовуємо тільки до позицій без знижки (не перезаписуємо ручну)
      S.modalItems.forEach(item => {
        if (!item.discount || item.discount === 0) item.discount = autoDisc;
      });
    }
  }

  // Оновлюємо індикатор поточного прайсу
  function _soUpdatePriceIndicator() {
    const ind = el('soPriceListIndicator');
    if (!ind) return;
    if (!S.currentPriceListId) {
      ind.style.display = 'none';
      return;
    }
    const pl = S.priceLists.find(p => p.id === S.currentPriceListId);
    if (!pl) { ind.style.display = 'none'; return; }
    ind.style.display = 'flex';
    ind.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" style="flex-shrink:0"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      ${tg('Прайс','Price list')}: <strong>${esc(pl.name)}</strong>
      ${pl.discountRules?.length ? `· ${pl.discountRules.length} ${tg('правил знижок','discount rules')}` : ''}`;
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────
  window.openSalesOrderModal = function (orderId) {
    const order = orderId ? S.orders.find(o => o.id === orderId) : null;

    // БАГ 7 fix: попередження для confirmed замовлень
    if (order?.status === 'confirmed') {
      showToast(
        tg('Замовлення підтверджено — позиції заблоковані. Скасуйте і створіть нове для зміни кількості.',
           'Order confirmed — items locked. Cancel and create new to change quantities.'),
        'info'
      );
      // Дозволяємо редагувати тільки нотатку і менеджера, не позиції
    }
    if (order?.status === 'completed' || order?.status === 'cancelled') {
      showToast(tg('Редагування закритого замовлення неможливе','Cannot edit closed order'), 'error');
      return;
    }

    S.editing = order || null;

    const existing = el('soModalOverlay');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.innerHTML = buildModalHTML(order);
    document.body.appendChild(div.firstElementChild);

    // Блокуємо таблицю позицій для confirmed
    if (order?.status === 'confirmed') {
      setTimeout(() => {
        const itemsWrap = el('soItemsWrap');
        if (itemsWrap) {
          itemsWrap.style.opacity = '0.6';
          itemsWrap.style.pointerEvents = 'none';
          itemsWrap.insertAdjacentHTML('beforebegin',
            `<div style="padding:8px 12px;background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;font-size:.78rem;color:#92400e;margin-bottom:8px">
              ⚠️ ${tg('Позиції заблоковані — замовлення підтверджено і товари зарезервовані','Items locked — order confirmed and stock reserved')}
            </div>`
          );
        }
        // Ховаємо кнопку Додати позицію
        const addBtn = document.querySelector('#soModalOverlay button[onclick*="_soAddItem"]');
        if (addBtn) addBtn.style.display = 'none';
      }, 0);
    }

    renderModalItems();

    setTimeout(() => _soUpdatePriceIndicator(), 0);

    if (!order && window.currentUserData?.id) {
      const sel = el('soFldAssignee');
      if (sel && !sel.value) sel.value = window.currentUserData.id;
    }
  };

  window.closeSalesOrderModal = function () {
    const m = el('soModalOverlay');
    if (m) m.remove();
    S.editing = null;
    S.modalItems = [];
  };

  // ─── MODAL ITEM HANDLERS ──────────────────────────────────────────────────
  window._soItemWarehouse = function (idx, sel) {
    const val = sel.value;
    const item = S.modalItems[idx];
    if (!item) return;
    item.warehouseItemId = val || null;
    if (val) {
      const wi = S.items.find(w => w.id === val);
      if (wi) {
        // Спочатку ціна з прайсу клієнта, потім базова ціна товару
        const priceFromList = getPriceFromList(val);
        item.price = priceFromList !== null ? priceFromList : Number(wi.price || wi.sellPrice || 0);
        item.unit  = wi.unit || 'шт';
        item.name  = wi.name || wi.title || '';
      }
    }
    // Перераховуємо автознижку після зміни позиції
    _soRecalcAutoDiscount();
    renderModalItems();
  };

  window._soItemField = function (idx, field, value) {
    const item = S.modalItems[idx];
    if (!item) return;
    if (field === 'qty' || field === 'price' || field === 'discount') {
      item[field] = parseFloat(value) || 0;
    } else {
      item[field] = value;
    }
    updateTotals();
    // re-render row only for qty change (to update warning)
    if (field === 'qty' && item.warehouseItemId) renderModalItems();
  };

  window._soAddItem = function () {
    S.modalItems.push({ id: Date.now(), name: '', qty: 1, price: 0, unit: 'шт', warehouseItemId: null, discount: 0 });
    renderModalItems();
  };

  window._soRemoveItem = function (idx) {
    S.modalItems.splice(idx, 1);
    if (!S.modalItems.length) {
      S.modalItems.push({ id: Date.now(), name: '', qty: 1, price: 0, unit: 'шт', warehouseItemId: null, discount: 0 });
    }
    renderModalItems();
  };

  window._soClientChange = function (sel) {
    const clientId = sel.value;
    if (!clientId) { S.currentPriceListId = null; _soUpdatePriceIndicator(); return; }

    const newPriceListId = getDefaultPriceListForClient(clientId);
    const changed = newPriceListId !== S.currentPriceListId;
    S.currentPriceListId = newPriceListId;

    // Якщо прайс змінився — перераховуємо ціни для всіх позицій зі складу
    if (changed && S.modalItems.length) {
      S.modalItems.forEach(item => {
        if (!item.warehouseItemId) return;
        const priceFromList = getPriceFromList(item.warehouseItemId);
        if (priceFromList !== null) item.price = priceFromList;
      });
      renderModalItems();
    }
    _soUpdatePriceIndicator();
  };

  window._soPayCondChange = function (sel) {
    const daysWrap = el('soFldDaysWrap');
    if (daysWrap) daysWrap.style.display = sel.value === 'prepay' ? 'none' : 'block';
  };

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  window._soSave = async function () {
    if (S.saving) return;

    const clientSel  = el('soFldClient');
    const clientId   = clientSel?.value || '';
    const clientName = clientSel?.options[clientSel.selectedIndex]?.dataset?.name ||
                       S.clients.find(c => c.id === clientId)?.name || '';

    if (!clientId) { showToast(tg('Оберіть клієнта','Select a client'), 'error'); return; }

    const validItems = S.modalItems.filter(i => i.name || i.warehouseItemId);
    if (!validItems.length) { showToast(tg('Додайте хоча б одну позицію','Add at least one item'), 'error'); return; }

    let gross = 0, discTotal = 0;
    const items = validItems.map(item => {
      const g = Number(item.qty||1) * Number(item.price||0);
      const d = g * (Number(item.discount||0) / 100);
      gross    += g;
      discTotal += d;
      return {
        name:            item.name || '',
        qty:             Number(item.qty) || 1,
        qtyShipped:      0,
        price:           Number(item.price) || 0,
        unit:            item.unit || 'шт',
        discount:        Number(item.discount) || 0,
        warehouseItemId: item.warehouseItemId || null,
        lineTotal:       Math.round((g - d) * 100) / 100,
      };
    });

    const totalAmount = Math.round((gross - discTotal) * 100) / 100;

    const payload = {
      clientId,
      clientName,
      assigneeId:       el('soFldAssignee')?.value || '',
      paymentCondition: el('soFldPayCond')?.value  || 'prepay',
      paymentDueDays:   Number(el('soFldDays')?.value) || 0,
      currency:         el('soFldCurrency')?.value || 'UAH',
      priceTypeId:      S.currentPriceListId || null,
      note:             el('soFldNote')?.value || '',
      items,
      totalAmount,
      discountAmount:   Math.round(discTotal * 100) / 100,
      updatedAt:        firebase.firestore.FieldValue.serverTimestamp(),
    };

    S.saving = true;
    const btn = el('soSaveBtn');
    if (btn) { btn.disabled = true; btn.textContent = tg('Збереження...','Saving...'); }

    try {
      if (S.editing) {
        // БАГ 13 fix: для confirmed не оновлюємо items — тільки note, assignee, paymentCondition
        const editingOrder = S.orders.find(o => o.id === S.editing.id);
        if (editingOrder?.status === 'confirmed') {
          const safePayload = {
            assigneeId:       payload.assigneeId,
            paymentCondition: payload.paymentCondition,
            paymentDueDays:   payload.paymentDueDays,
            note:             payload.note,
            updatedAt:        firebase.firestore.FieldValue.serverTimestamp(),
          };
          await col(COL).doc(S.editing.id).update(safePayload);
        } else {
          await col(COL).doc(S.editing.id).update(payload);
        }
        showToast(tg('Замовлення оновлено','Order updated'));
      } else {
        payload.number    = await generateOrderNumber();
        payload.status    = 'new';
        payload.createdBy = window.currentUserData?.id || '';
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await col(COL).add(payload);
        showToast(tg('Замовлення створено','Order created'));
      }
      window.closeSalesOrderModal();
      await loadOrders();
    } catch(e) {
      console.error('_soSave:', e);
      showToast(tg('Помилка збереження: ','Save error: ') + e.message, 'error');
    } finally {
      S.saving = false;
      if (btn) { btn.disabled = false; btn.textContent = tg('Зберегти','Save'); }
    }
  };

  // ─── CONFIRM ORDER ────────────────────────────────────────────────────────
  window._soConfirm = async function (orderId) {
    if (!confirm(tg('Підтвердити замовлення? Товари будуть зарезервовані на складі.','Confirm order? Items will be reserved in warehouse.'))) return;

    const order = S.orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      // Атомарне резервування через 99d-warehouse-reserve.js
      if (typeof window.warehouseReserve === 'function') {
        const result = await window.warehouseReserve(orderId, order.items || []);

        if (!result.success) {
          if (result.conflicts?.length) {
            const conflictText = result.conflicts
              .map(c => `${c.name}: ${tg('потрібно','needed')} ${c.needed}, ${tg('доступно','available')} ${c.available}`)
              .join('\n');
            const proceed = confirm(
              tg('Недостатньо товарів на складі:\n','Insufficient stock:\n') +
              conflictText +
              tg('\n\nВсе одно підтвердити (без резервування)?','\n\nConfirm anyway (without reservation)?')
            );
            if (!proceed) return;
          } else {
            showToast(tg('Помилка резервування: ','Reservation error: ') + (result.error || ''), 'error');
            return;
          }
        }

        // Оновлюємо локальний кеш після транзакції
        for (const item of (order.items || [])) {
          if (!item.warehouseItemId || !S.stock[item.warehouseItemId]) continue;
          const st = S.stock[item.warehouseItemId];
          st.reserved = Number(st.reserved || 0) + Number(item.qty || 0);
        }

      } else {
        // Fallback — simple batch (якщо 99d ще не завантажений)
        const batch = db().batch();
        for (const item of (order.items || [])) {
          if (!item.warehouseItemId) continue;
          const stockRef = db().collection('companies').doc(cid()).collection('warehouse_stock').doc(item.warehouseItemId);
          const st = S.stock[item.warehouseItemId];
          const cur = Number(st?.reserved || 0);
          batch.update(stockRef, { reserved: cur + Number(item.qty || 0) });
          if (S.stock[item.warehouseItemId]) S.stock[item.warehouseItemId].reserved = cur + Number(item.qty || 0);
        }
        await batch.commit();
      }

      await col(COL).doc(orderId).update({ status: 'confirmed', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      showToast(tg('Замовлення підтверджено, товари зарезервовані','Order confirmed, items reserved'));
      await loadOrders();
    } catch(e) {
      console.error('_soConfirm:', e);
      showToast(tg('Помилка: ','Error: ') + e.message, 'error');
    }
  };

  // ─── CANCEL ORDER ─────────────────────────────────────────────────────────
  window._soCancel = async function (orderId) {
    if (!confirm(tg('Скасувати замовлення?','Cancel this order?'))) return;
    const order = S.orders.find(o => o.id === orderId);
    try {
      // Якщо замовлення підтверджено — звільняємо резерв
      if (order?.status === 'confirmed' && typeof window.warehouseRelease === 'function') {
        await window.warehouseRelease(orderId, order.items || []);
      }
      await col(COL).doc(orderId).update({ status: 'cancelled', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      showToast(tg('Замовлення скасовано','Order cancelled'), 'info');
      await loadOrders();
    } catch(e) {
      showToast(tg('Помилка: ','Error: ') + e.message, 'error');
    }
  };

  // ─── CREATE REALIZATION (placeholder — module 107 handles it) ─────────────
  window._soCreateRealization = function (orderId) {
    const order = S.orders.find(o => o.id === orderId);
    if (!order) return;
    if (typeof window.openSalesRealizationModal === 'function') {
      window.openSalesRealizationModal(null, order);
    } else {
      showToast(tg('Модуль реалізації завантажується...','Realization module loading...'), 'info');
      if (typeof window.lazyLoad === 'function') {
        window.lazyLoad('sales', () => {
          if (typeof window.openSalesRealizationModal === 'function') {
            window.openSalesRealizationModal(null, order);
          }
        });
      }
    }
  };

  // ─── FILTER HANDLERS ──────────────────────────────────────────────────────
  window._soFilter = function (field, value) {
    S.filter[field] = value;
    renderList();
  };

  window._soResetFilters = function () {
    S.filter = { status: 'all', search: '', assignee: '' };
    renderFilters();
    renderList();
  };

  // ─── CREATE FROM CRM DEAL ─────────────────────────────────────────────────
  window.createOrderFromDeal = async function (deal) {
    if (!deal) return null;
    try {
      const number = await generateOrderNumber();
      const payload = {
        number,
        status:           'new',
        dealId:           deal.id || null,
        clientId:         deal.clientId || null,
        clientName:       deal.clientName || deal.title || '',
        assigneeId:       deal.assigneeId || deal.responsibleId || '',
        paymentCondition: 'prepay',
        paymentDueDays:   0,
        currency:         'UAH',
        items:            [],
        totalAmount:      Number(deal.amount || 0),
        discountAmount:   0,
        note:             '',
        createdBy:        window.currentUserData?.id || '',
        createdAt:        firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:        firebase.firestore.FieldValue.serverTimestamp(),
      };
      const ref = await col(COL).add(payload);
      // update deal with orderId
      if (deal.id) {
        await db().collection('companies').doc(cid()).collection('crm_deals').doc(deal.id).update({
          orderId: ref.id,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      showToast(tg('Замовлення створено з угоди: ','Order created from deal: ') + number);
      await loadOrders();
      return { id: ref.id, number };
    } catch(e) {
      console.error('createOrderFromDeal:', e);
      showToast(tg('Помилка: ','Error: ') + e.message, 'error');
      return null;
    }
  };

  // ─── PRICE LIST CHANGE HANDLER ────────────────────────────────────────────
  window._soPriceListChange = function (sel) {
    const newId = sel.value || null;
    const changed = newId !== S.currentPriceListId;
    S.currentPriceListId = newId;

    if (changed && S.modalItems.length) {
      // Перераховуємо ціни всіх складських позицій
      S.modalItems.forEach(item => {
        if (!item.warehouseItemId) return;
        if (newId) {
          const priceFromList = getPriceFromList(item.warehouseItemId);
          if (priceFromList !== null) item.price = priceFromList;
        } else {
          // Повертаємо базову ціну товару
          const wi = S.items.find(w => w.id === item.warehouseItemId);
          if (wi) item.price = Number(wi.price || wi.sellPrice || 0);
        }
      });
      _soRecalcAutoDiscount();
      renderModalItems();
    }
    _soUpdatePriceIndicator();
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────
  window.initSalesOrders = async function () {
    if (!cid()) { console.warn('106: no cid'); return; }
    buildUI();
    await Promise.all([loadOrders(), loadClients(), loadWarehouseItems(), loadStaff(), loadPriceLists()]);
  };

})();
