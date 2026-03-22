(function () {
  'use strict';

  // ─── helpers ──────────────────────────────────────────────────────────────
  function compRef() {
    return window.db.collection('companies').doc(window.currentCompanyId);
  }
  function col(name) { return compRef().collection(name); }
  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
  function fmtDate(d) {
    if (!d) return '';
    const dt = (d.toDate) ? d.toDate() : new Date(d);
    return dt.toLocaleDateString('uk-UA');
  }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function el(id) { return document.getElementById(id); }
  function toast(msg, type) { if (typeof showToast === 'function') showToast(msg, type || 'success'); }

  // ─── state ────────────────────────────────────────────────────────────────
  const S = {
    orders: [],
    products: [],
    clients: [],  // CRM clients cache
    staff: [],    // staff cache
    filter: { type: 'all', status: 'all', period: '30', search: '' },
    activeSubTab: 'all',
    editingOrderId: null,
    editingOrder: null,
  };

  // ─── type config ──────────────────────────────────────────────────────────
  const TYPE_LABELS = {
    invoice:    'Рахунок',
    receipt:    'Чек',
    work_order: 'Наряд',
    route:      'Рейс',
  };
  const STATUS_LABELS = {
    draft:     'Чернетка',
    sent:      'Відправлено',
    paid:      'Оплачено',
    partial:   'Частково',
    cancelled: 'Скасовано',
    closed:    'Закрито',
  };
  const STATUS_COLORS = {
    draft:     '#9ca3af',
    sent:      '#3b82f6',
    paid:      '#10b981',
    partial:   '#f59e0b',
    cancelled: '#ef4444',
    closed:    '#6366f1',
  };

  // ─── auto-numbering ───────────────────────────────────────────────────────
  async function generateOrderNumber(type) {
    const prefixes = { invoice: 'INV', receipt: 'RCP', work_order: 'WO', route: 'RTE' };
    const prefix = prefixes[type] || 'DOC';
    const year = new Date().getFullYear();
    try {
      const snap = await col('sales_orders')
        .where('type','==',type)
        .orderBy('createdAt','desc')
        .limit(1).get();
      let seq = 1;
      if (!snap.empty) {
        const last = snap.docs[0].data().number || '';
        const m = last.match(/(\d+)$/);
        if (m) seq = parseInt(m[1]) + 1;
      }
      return `${prefix}-${year}-${String(seq).padStart(4,'0')}`;
    } catch(e) {
      return `${prefix}-${year}-${String(Date.now()).slice(-4)}`;
    }
  }

  // ─── load data ────────────────────────────────────────────────────────────
  async function loadOrders() {
    if (!window.currentCompanyId) return;
    try {
      let q = col('sales_orders').orderBy('createdAt','desc').limit(200);
      const snap = await q.get();
      S.orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderOrdersTable();
      renderKPI();
    } catch(e) { console.warn('sales loadOrders:', e.message); }
  }

  async function loadProducts() {
    if (!window.currentCompanyId) return;
    try {
      const snap = await col('sales_products').where('isActive','==',true).orderBy('name').get();
      S.products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('sales loadProducts:', e); }
  }

  async function loadClients() {
    if (!window.currentCompanyId) return;
    try {
      const snap = await col('crm_clients').limit(300).get();
      S.clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { S.clients = []; }
  }

  async function loadStaff() {
    if (!window.currentCompanyId) return;
    try {
      const snap = await col('staff').limit(100).get();
      S.staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { S.staff = []; }
  }

  // ─── filters ──────────────────────────────────────────────────────────────
  function getFilteredOrders() {
    const f = S.filter;
    const now = new Date();
    const days = parseInt(f.period) || 30;
    const from = new Date(now - days * 86400000);
    return S.orders.filter(o => {
      if (S.activeSubTab !== 'all') {
        if (S.activeSubTab === 'invoice' && o.type !== 'invoice') return false;
        if (S.activeSubTab === 'receipt' && o.type !== 'receipt') return false;
        if (S.activeSubTab === 'work_order' && o.type !== 'work_order') return false;
        if (S.activeSubTab === 'route' && o.type !== 'route') return false;
      }
      if (f.status !== 'all' && o.status !== f.status) return false;
      const oDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.date || 0);
      if (oDate < from) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        const inNum = (o.number||'').toLowerCase().includes(q);
        const inCli = (o.clientName||'').toLowerCase().includes(q);
        if (!inNum && !inCli) return false;
      }
      return true;
    });
  }

  // ─── KPI strip ────────────────────────────────────────────────────────────
  function renderKPI() {
    const kpiEl = el('salesKPI');
    if (!kpiEl) return;
    const today = todayISO();
    const now30 = new Date(Date.now() - 30 * 86400000);
    let todayRev = 0, monthRev = 0, unpaid = 0, count30 = 0;
    S.orders.forEach(o => {
      if (o.status === 'cancelled') return;
      const oDate = o.date || '';
      const oTs = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(oDate || 0);
      if (oDate === today) todayRev += o.total || 0;
      if (oTs >= now30) { monthRev += o.total || 0; count30++; }
      if (o.paymentStatus === 'unpaid' || o.paymentStatus === 'partial') {
        unpaid += (o.total||0) - (o.paidAmount||0);
      }
    });
    const avg = count30 > 0 ? monthRev / count30 : 0;
    kpiEl.innerHTML = `
      <div class="sl-kpi-card">
        <div class="sl-kpi-label">Виручка сьогодні</div>
        <div class="sl-kpi-value">${fmt(todayRev)} ₴</div>
      </div>
      <div class="sl-kpi-card">
        <div class="sl-kpi-label">За місяць</div>
        <div class="sl-kpi-value">${fmt(monthRev)} ₴</div>
      </div>
      <div class="sl-kpi-card">
        <div class="sl-kpi-label">Середній чек</div>
        <div class="sl-kpi-value">${fmt(avg)} ₴</div>
      </div>
      <div class="sl-kpi-card" style="border-color:#fca5a5">
        <div class="sl-kpi-label">Неоплачено</div>
        <div class="sl-kpi-value" style="color:#ef4444">${fmt(unpaid)} ₴</div>
      </div>
    `;
  }

  // ─── orders table ─────────────────────────────────────────────────────────
  function renderOrdersTable() {
    const tbody = el('salesOrdersTbody');
    if (!tbody) return;
    const list = getFilteredOrders();
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9ca3af">Немає документів</td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(o => {
      const statusColor = STATUS_COLORS[o.status] || '#9ca3af';
      const statusLabel = STATUS_LABELS[o.status] || o.status;
      const typeLabel = TYPE_LABELS[o.type] || o.type;
      return `
        <tr class="sl-tr" onclick="window._salesOpenOrder('${esc(o.id)}')">
          <td><span style="font-size:.7rem;color:#9ca3af;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${esc(typeLabel)}</span></td>
          <td><b>${esc(o.number||'—')}</b></td>
          <td>${esc(o.clientName||'—')}</td>
          <td>${esc(o.date ? fmtDate(o.date) : (o.createdAt ? fmtDate(o.createdAt) : '—'))}</td>
          <td style="text-align:right"><b>${fmt(o.total||0)} ₴</b></td>
          <td><span style="color:${statusColor};font-weight:600;font-size:.78rem">${esc(statusLabel)}</span></td>
          <td style="text-align:right">
            <button onclick="event.stopPropagation();window._salesEditOrder('${esc(o.id)}')" style="background:none;border:none;cursor:pointer;color:#6366f1;font-size:.75rem;padding:2px 6px;border-radius:4px;background:#eef2ff" title="Редагувати">✏️</button>
            ${o.type==='invoice'?`<button onclick="event.stopPropagation();window._salesPrintInvoice('${esc(o.id)}')" style="background:none;border:none;cursor:pointer;color:#059669;font-size:.75rem;padding:2px 6px;border-radius:4px;background:#d1fae5;margin-left:4px" title="PDF">📄</button>`:''}
          </td>
        </tr>`;
    }).join('');
  }

  // ─── INVOICE FORM ─────────────────────────────────────────────────────────
  async function openInvoiceForm(orderId) {
    S.editingOrderId = orderId || null;
    S.editingOrder = null;

    let order = null;
    let number = '';
    if (orderId) {
      try {
        const d = await col('sales_orders').doc(orderId).get();
        if (d.exists) { order = { id: d.id, ...d.data() }; S.editingOrder = order; }
      } catch(e) {}
    }

    if (!order) {
      number = await generateOrderNumber('invoice');
    } else {
      number = order.number || '';
    }

    // Prefill items
    const items = order?.items || [{ id: Date.now()+'', name:'', qty:1, unit:'шт', price:0, discount:0, total:0 }];

    const overlay = document.createElement('div');
    overlay.id = 'salesInvoiceOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:2vh;overflow-y:auto;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;width:min(760px,98vw);padding:1.5rem;margin-bottom:2rem;position:relative">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">${order ? 'Редагувати рахунок' : 'Новий рахунок'}</h3>
          <button onclick="document.getElementById('salesInvoiceOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af">✕</button>
        </div>

        <!-- Header fields -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">Клієнт</label>
            <input id="slInvClient" class="sl-inp" placeholder="Пошук клієнта або введіть вручну" value="${esc(order?.clientName||'')}" list="slClientsList" autocomplete="off">
            <datalist id="slClientsList">${S.clients.map(c=>`<option value="${esc(c.name||c.fullName||'')}">`).join('')}</datalist>
          </div>
          <div>
            <label class="sl-label">Телефон</label>
            <input id="slInvPhone" class="sl-inp" placeholder="+380..." value="${esc(order?.clientPhone||'')}">
          </div>
          <div>
            <label class="sl-label">Номер документа</label>
            <input id="slInvNumber" class="sl-inp" value="${esc(number)}">
          </div>
          <div>
            <label class="sl-label">Дата</label>
            <input id="slInvDate" class="sl-inp" type="date" value="${order?.date||todayISO()}">
          </div>
          <div>
            <label class="sl-label">Дата оплати</label>
            <input id="slInvDueDate" class="sl-inp" type="date" value="${order?.dueDate||''}">
          </div>
          <div>
            <label class="sl-label">Статус</label>
            <select id="slInvStatus" class="sl-inp">
              ${['draft','sent','paid','partial','cancelled'].map(s=>`<option value="${s}" ${(order?.status||'draft')===s?'selected':''}>${STATUS_LABELS[s]}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Items -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">Позиції</b>
            <div style="display:flex;gap:.5rem">
              <button onclick="window._salesAddCatalogItem()" class="sl-btn-sm" style="background:#eef2ff;color:#6366f1">📦 З каталогу</button>
              <button onclick="window._salesAddInvoiceItem()" class="sl-btn-sm" style="background:#f0fdf4;color:#16a34a">+ Позиція</button>
            </div>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.83rem" id="slInvItemsTable">
              <thead>
                <tr style="background:#f8fafc">
                  <th style="text-align:left;padding:6px 8px;color:#6b7280;font-weight:600">Назва</th>
                  <th style="width:60px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">Кіл.</th>
                  <th style="width:70px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">Од.</th>
                  <th style="width:90px;text-align:right;padding:6px 4px;color:#6b7280;font-weight:600">Ціна</th>
                  <th style="width:60px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">Зн.%</th>
                  <th style="width:90px;text-align:right;padding:6px 4px;color:#6b7280;font-weight:600">Сума</th>
                  <th style="width:30px"></th>
                </tr>
              </thead>
              <tbody id="slInvItemsTbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:1.25rem">
          <div style="min-width:200px">
            <div style="display:flex;justify-content:space-between;padding:4px 0;color:#6b7280;font-size:.85rem">
              <span>Знижка:</span><span id="slInvDiscountTotal">0 ₴</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:700;font-size:1rem;border-top:2px solid #e5e7eb;margin-top:4px">
              <span>До сплати:</span><span id="slInvTotal" style="color:#6366f1">0 ₴</span>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div style="margin-bottom:1rem">
          <label class="sl-label">Спосіб оплати</label>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            ${[['cash','💵 Готівка'],['terminal','💳 Термінал'],['transfer','📱 Переказ'],['mixed','🔀 Змішана']].map(([v,l])=>`
              <label style="display:flex;align-items:center;gap:4px;padding:5px 12px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;font-size:.83rem">
                <input type="radio" name="slInvPayMethod" value="${v}" ${(order?.paymentMethod||'cash')===v?'checked':''}> ${l}
              </label>`).join('')}
          </div>
        </div>

        <div style="margin-bottom:1.25rem">
          <label class="sl-label">Примітки</label>
          <textarea id="slInvNotes" class="sl-inp" rows="2" placeholder="Коментар...">${esc(order?.notes||'')}</textarea>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="document.getElementById('salesInvoiceOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">Скасувати</button>
          <button onclick="window._salesSaveInvoice(false)" class="sl-btn" style="background:#6366f1;color:#fff">💾 Зберегти</button>
          ${order?.status !== 'paid' ? `<button onclick="window._salesSaveInvoice(true)" class="sl-btn" style="background:#10b981;color:#fff">✓ Зберегти та позначити оплаченим</button>` : ''}
          ${order ? `<button onclick="window._salesPrintInvoice('${esc(order.id)}')" class="sl-btn" style="background:#f59e0b;color:#fff">📄 PDF</button>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Render items
    S._invoiceItems = items.map(i => ({ ...i }));
    renderInvoiceItems();

    // Client autocomplete fill phone
    el('slInvClient').addEventListener('change', function() {
      const name = this.value.toLowerCase();
      const c = S.clients.find(c => (c.name||c.fullName||'').toLowerCase() === name);
      if (c) { el('slInvPhone').value = c.phone || c.phones?.[0] || ''; }
    });
  }

  function renderInvoiceItems() {
    const tbody = el('slInvItemsTbody');
    if (!tbody) return;
    const items = S._invoiceItems || [];
    tbody.innerHTML = items.map((item, idx) => `
      <tr>
        <td style="padding:4px"><input class="sl-inp-sm" value="${esc(item.name)}" onchange="window._salesItemChange(${idx},'name',this.value)" placeholder="Назва послуги/товару" style="width:100%;min-width:120px"></td>
        <td style="padding:4px"><input class="sl-inp-sm" type="number" min="0" step="0.01" value="${item.qty||1}" onchange="window._salesItemChange(${idx},'qty',+this.value)" style="width:100%;text-align:center"></td>
        <td style="padding:4px">
          <select class="sl-inp-sm" onchange="window._salesItemChange(${idx},'unit',this.value)" style="width:100%">
            ${['шт','кг','л','год','км','послуга','м²','м'].map(u=>`<option ${item.unit===u?'selected':''}>${u}</option>`).join('')}
          </select>
        </td>
        <td style="padding:4px"><input class="sl-inp-sm" type="number" min="0" value="${item.price||0}" onchange="window._salesItemChange(${idx},'price',+this.value)" style="width:100%;text-align:right"></td>
        <td style="padding:4px"><input class="sl-inp-sm" type="number" min="0" max="100" value="${item.discount||0}" onchange="window._salesItemChange(${idx},'discount',+this.value)" style="width:100%;text-align:center"></td>
        <td style="padding:4px;text-align:right;font-weight:600;color:#374151">${fmt(item.total||0)} ₴</td>
        <td style="padding:4px;text-align:center"><button onclick="window._salesRemoveItem(${idx})" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:1rem">×</button></td>
      </tr>
    `).join('');
    recalcInvoiceTotals();
  }

  function recalcInvoiceTotals() {
    const items = S._invoiceItems || [];
    let subtotal = 0, discountTotal = 0, total = 0;
    items.forEach(item => {
      const row = item.qty * item.price;
      const disc = row * (item.discount || 0) / 100;
      item.total = Math.round((row - disc) * 100) / 100;
      subtotal += row;
      discountTotal += disc;
      total += item.total;
    });
    const dt = el('slInvDiscountTotal'); if (dt) dt.textContent = fmt(discountTotal) + ' ₴';
    const tt = el('slInvTotal'); if (tt) tt.textContent = fmt(total) + ' ₴';
  }

  window._salesItemChange = function(idx, field, val) {
    if (!S._invoiceItems[idx]) return;
    S._invoiceItems[idx][field] = val;
    const item = S._invoiceItems[idx];
    const row = item.qty * item.price;
    item.total = Math.round((row - row * (item.discount||0)/100) * 100) / 100;
    renderInvoiceItems();
  };

  window._salesRemoveItem = function(idx) {
    S._invoiceItems.splice(idx, 1);
    renderInvoiceItems();
  };

  window._salesAddInvoiceItem = function() {
    S._invoiceItems.push({ id: Date.now()+'', name:'', qty:1, unit:'шт', price:0, discount:0, total:0 });
    renderInvoiceItems();
    // focus last name input
    setTimeout(() => {
      const rows = el('slInvItemsTbody')?.querySelectorAll('tr');
      if (rows?.length) rows[rows.length-1].querySelector('input')?.focus();
    }, 50);
  };

  window._salesAddCatalogItem = function() {
    if (!S.products.length) { toast('Каталог порожній. Додайте товари/послуги в розділ "Каталог".', 'info'); return; }
    const html = `
      <div id="slCatalogOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(440px,95vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>Вибір з каталогу</b>
            <button onclick="document.getElementById('slCatalogOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
          </div>
          <input class="sl-inp" placeholder="Пошук..." oninput="window._salesCatalogSearch(this.value)" style="margin-bottom:.75rem" id="slCatalogSearch">
          <div id="slCatalogList">
            ${S.products.map(p=>`
              <div onclick="window._salesPickProduct('${p.id}')" style="padding:.5rem .75rem;border-radius:6px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border:1px solid #f3f4f6;margin-bottom:4px" class="sl-catalog-row">
                <div>
                  <div style="font-weight:600;font-size:.85rem">${esc(p.name)}</div>
                  <div style="font-size:.75rem;color:#9ca3af">${esc(p.category||'')} · ${esc(p.unit||'шт')}</div>
                </div>
                <div style="font-weight:700;color:#6366f1;font-size:.9rem">${fmt(p.price)} ₴</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window._salesCatalogSearch = function(q) {
    const rows = document.querySelectorAll('.sl-catalog-row');
    rows.forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
    });
  };

  window._salesPickProduct = function(productId) {
    const p = S.products.find(x => x.id === productId);
    if (!p) return;
    S._invoiceItems.push({ id: Date.now()+'', name: p.name, qty:1, unit: p.unit||'шт', price: p.price||0, discount:0, total: p.price||0, productId: p.id });
    renderInvoiceItems();
    document.getElementById('slCatalogOverlay')?.remove();
  };

  // ─── save invoice ─────────────────────────────────────────────────────────
  window._salesSaveInvoice = async function(markPaid) {
    const clientName = el('slInvClient')?.value?.trim();
    const clientPhone = el('slInvPhone')?.value?.trim();
    const number = el('slInvNumber')?.value?.trim();
    const date = el('slInvDate')?.value || todayISO();
    const dueDate = el('slInvDueDate')?.value || '';
    const notes = el('slInvNotes')?.value?.trim();
    const status = markPaid ? 'paid' : (el('slInvStatus')?.value || 'draft');
    const paymentMethod = document.querySelector('input[name="slInvPayMethod"]:checked')?.value || 'cash';

    if (!number) { toast('Вкажіть номер документа', 'warn'); return; }
    const items = (S._invoiceItems || []).filter(i => i.name);
    if (!items.length) { toast('Додайте хоча б одну позицію', 'warn'); return; }

    let subtotal = 0, discountTotal = 0, total = 0;
    items.forEach(i => {
      const row = i.qty * i.price;
      const disc = row * (i.discount||0)/100;
      i.total = Math.round((row - disc)*100)/100;
      subtotal += row; discountTotal += disc; total += i.total;
    });

    // Find clientId from cache
    const clientObj = S.clients.find(c => (c.name||c.fullName||'').toLowerCase() === clientName?.toLowerCase());

    const data = {
      type: 'invoice',
      number,
      status,
      clientId: clientObj?.id || '',
      clientName: clientName || '',
      clientPhone: clientPhone || '',
      date,
      dueDate,
      items,
      subtotal: Math.round(subtotal*100)/100,
      discountTotal: Math.round(discountTotal*100)/100,
      total: Math.round(total*100)/100,
      paymentMethod,
      paymentStatus: markPaid ? 'paid' : (S.editingOrder?.paymentStatus || 'unpaid'),
      paidAmount: markPaid ? total : (S.editingOrder?.paidAmount || 0),
      notes: notes || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      if (S.editingOrderId) {
        await col('sales_orders').doc(S.editingOrderId).update(data);
        if (markPaid) await recordSaleInFinance({ ...data, id: S.editingOrderId, paidAmount: total });
        toast('Рахунок оновлено');
      } else {
        data.isDemo = false;
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.createdBy = window.currentUser?.uid || '';
        const ref = await col('sales_orders').add(data);
        if (markPaid) await recordSaleInFinance({ ...data, id: ref.id, paidAmount: total });
        toast('Рахунок створено');
      }
      document.getElementById('salesInvoiceOverlay')?.remove();
      await loadOrders();
    } catch(e) { toast('Помилка: ' + e.message, 'error'); }
  };

  // ─── finance integration ──────────────────────────────────────────────────
  async function recordSaleInFinance(order) {
    if (!order.paidAmount) return;
    try {
      const txRef = col('finance_transactions').doc();
      const typeMap = { invoice:'Рахунок', receipt:'Чек', work_order:'Наряд', route:'Рейс' };
      await txRef.set({
        type: 'income',
        amount: order.paidAmount,
        categoryName: 'Виручка (реалізація)',
        note: `${typeMap[order.type]||''} ${order.number||''} · ${order.clientName||''}`.trim(),
        date: order.date || todayISO(),
        sourceModule: 'sales',
        sourceId: order.id,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await col('sales_orders').doc(order.id).update({ financeTransactionId: txRef.id });
    } catch(e) { console.warn('recordSaleInFinance:', e); }
  }

  // ─── open/edit order ──────────────────────────────────────────────────────
  window._salesOpenOrder = function(id) {
    window._salesEditOrder(id);
  };

  window._salesEditOrder = async function(id) {
    const o = S.orders.find(x => x.id === id);
    if (!o) return;
    if (o.type === 'invoice') {
      await openInvoiceForm(id);
    } else if (o.type === 'receipt') {
      await openReceiptForm(id);
    } else {
      toast('Редагування цього типу документа буде доступне скоро', 'info');
    }
  };

  // ─── print/PDF invoice ─────────────────────────────────────────────────────
  window._salesPrintInvoice = async function(id) {
    let order = S.orders.find(x => x.id === id);
    if (!order) {
      try { const d = await col('sales_orders').doc(id).get(); if(d.exists) order = {id:d.id,...d.data()}; } catch(e) {}
    }
    if (!order) { toast('Документ не знайдено', 'error'); return; }

    // If PDF module loaded — use it
    if (typeof window._salesGeneratePDF === 'function') {
      window._salesGeneratePDF(order); return;
    }

    // Fallback: print window
    const company = window.currentCompanyData || {};
    const items = order.items || [];
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${order.number}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:30px;max-width:700px;margin:0 auto}
      h2{font-size:1.2rem;margin-bottom:4px}
      .meta{color:#666;font-size:.85rem;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th{background:#f3f4f6;padding:8px;text-align:left;font-size:.8rem}
      td{padding:7px 8px;border-bottom:1px solid #eee}
      .total-row{font-weight:bold;font-size:1.1rem}
      .footer{margin-top:24px;font-size:.8rem;color:#666}
    </style></head><body>
    <h2>РАХУНОК № ${esc(order.number)}</h2>
    <div class="meta">від ${esc(order.date || '')}</div>
    <table style="margin-bottom:8px;border:none"><tr>
      <td style="border:none;vertical-align:top;padding:0 24px 0 0">
        <b>Від кого:</b><br>${esc(company.name || company.companyName || '—')}<br>
        <span style="color:#666">${esc(company.address||'')}</span><br>
        <span style="color:#666">${esc(company.phone||'')}</span>
      </td>
      <td style="border:none;vertical-align:top">
        <b>Кому:</b><br>${esc(order.clientName||'—')}<br>
        <span style="color:#666">${esc(order.clientPhone||'')}</span>
      </td>
    </tr></table>
    <table>
      <thead><tr><th>#</th><th>Назва</th><th>Кіл.</th><th>Ціна</th><th>Зн.%</th><th>Сума</th></tr></thead>
      <tbody>
        ${items.map((item,i)=>`<tr><td>${i+1}</td><td>${esc(item.name)}</td><td>${item.qty} ${esc(item.unit||'')}</td><td>${fmt(item.price)} ₴</td><td>${item.discount||0}%</td><td><b>${fmt(item.total)} ₴</b></td></tr>`).join('')}
      </tbody>
    </table>
    <div style="text-align:right">
      ${order.discountTotal>0 ? `<div style="color:#666">Знижка: −${fmt(order.discountTotal)} ₴</div>` : ''}
      <div class="total-row" style="font-size:1.15rem;color:#6366f1">До сплати: ${fmt(order.total)} ₴</div>
    </div>
    ${company.iban||company.bankDetails ? `<div class="footer"><b>Реквізити:</b> ${esc(company.iban||company.bankDetails||'')}</div>` : ''}
    ${order.notes ? `<div class="footer">${esc(order.notes)}</div>` : ''}
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // ─── RECEIPT FORM (simple POS) ────────────────────────────────────────────
  async function openReceiptForm(orderId) {
    S.editingOrderId = orderId || null;
    S.editingOrder = null;
    let order = null;
    let number = '';
    if (orderId) {
      try {
        const d = await col('sales_orders').doc(orderId).get();
        if (d.exists) { order = { id: d.id, ...d.data() }; S.editingOrder = order; }
      } catch(e) {}
    }
    if (!order) number = await generateOrderNumber('receipt');
    else number = order.number || '';

    const items = order?.items || [{ id: Date.now()+'', name:'', qty:1, unit:'шт', price:0, discount:0, total:0 }];

    const overlay = document.createElement('div');
    overlay.id = 'salesReceiptOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:2vh;overflow-y:auto;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;width:min(560px,98vw);padding:1.5rem;margin-bottom:2rem;position:relative">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">💵 ${order ? 'Редагувати чек' : 'Касовий чек'} ${esc(number)}</h3>
          <button onclick="document.getElementById('salesReceiptOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af">✕</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">Клієнт (необов'язково)</label>
            <input id="slRcpClient" class="sl-inp" placeholder="Ім'я клієнта" value="${esc(order?.clientName||'')}" list="slRcpClientsList">
            <datalist id="slRcpClientsList">${S.clients.map(c=>`<option value="${esc(c.name||c.fullName||'')}">`).join('')}</datalist>
          </div>
          <div>
            <label class="sl-label">Дата</label>
            <input id="slRcpDate" class="sl-inp" type="date" value="${order?.date||todayISO()}">
          </div>
        </div>

        <!-- Items -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">Позиції</b>
            <div style="display:flex;gap:.5rem">
              <button onclick="window._salesAddCatalogItemRcp()" class="sl-btn-sm" style="background:#eef2ff;color:#6366f1">📦 З каталогу</button>
              <button onclick="window._salesAddReceiptItem()" class="sl-btn-sm" style="background:#f0fdf4;color:#16a34a">+ Позиція</button>
            </div>
          </div>
          <div id="slRcpItemsList"></div>
        </div>

        <!-- Total -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:2px solid #e5e7eb;margin-bottom:1rem">
          <b style="font-size:.95rem">Разом:</b>
          <b style="font-size:1.3rem;color:#6366f1" id="slRcpTotal">0 ₴</b>
        </div>

        <!-- Payment method -->
        <div style="margin-bottom:1.25rem">
          <label class="sl-label">Оплата</label>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            ${[['cash','💵 Готівка'],['terminal','💳 Термінал'],['transfer','📱 Переказ']].map(([v,l])=>`
              <label style="display:flex;align-items:center;gap:4px;padding:6px 14px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:600">
                <input type="radio" name="slRcpPayMethod" value="${v}" ${(order?.paymentMethod||'cash')===v?'checked':''}> ${l}
              </label>`).join('')}
          </div>
        </div>

        <div style="display:flex;gap:.75rem;justify-content:flex-end">
          <button onclick="document.getElementById('salesReceiptOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">Скасувати</button>
          <button onclick="window._salesSaveReceipt()" class="sl-btn" style="background:#10b981;color:#fff;font-size:1rem">✓ Провести чек</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    S._receiptItems = items.map(i => ({...i}));
    renderReceiptItems();
  }

  function renderReceiptItems() {
    const cont = el('slRcpItemsList');
    if (!cont) return;
    const items = S._receiptItems || [];
    let total = 0;
    items.forEach(i => {
      i.total = Math.round(i.qty * i.price * (1 - (i.discount||0)/100) * 100)/100;
      total += i.total;
    });
    cont.innerHTML = items.map((item, idx) => `
      <div style="display:grid;grid-template-columns:1fr 60px 80px 36px;gap:6px;align-items:center;margin-bottom:6px">
        <input class="sl-inp-sm" value="${esc(item.name)}" onchange="window._salesRcpItemChange(${idx},'name',this.value)" placeholder="Назва">
        <input class="sl-inp-sm" type="number" min="0.01" step="0.01" value="${item.qty}" onchange="window._salesRcpItemChange(${idx},'qty',+this.value)" style="text-align:center">
        <input class="sl-inp-sm" type="number" min="0" value="${item.price}" onchange="window._salesRcpItemChange(${idx},'price',+this.value)" style="text-align:right">
        <button onclick="window._salesRcpRemoveItem(${idx})" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:1.1rem">×</button>
      </div>
      <div style="text-align:right;font-size:.8rem;color:#6b7280;margin-bottom:8px;padding-right:42px">${fmt(item.total)} ₴</div>
    `).join('') + `<div style="font-size:.75rem;color:#9ca3af;margin-top:4px">qty × price</div>`;
    const tt = el('slRcpTotal'); if (tt) tt.textContent = fmt(total) + ' ₴';
  }

  window._salesRcpItemChange = function(idx, field, val) {
    if (!S._receiptItems[idx]) return;
    S._receiptItems[idx][field] = val;
    renderReceiptItems();
  };
  window._salesRcpRemoveItem = function(idx) {
    S._receiptItems.splice(idx, 1);
    renderReceiptItems();
  };
  window._salesAddReceiptItem = function() {
    S._receiptItems.push({ id:Date.now()+'', name:'', qty:1, unit:'шт', price:0, discount:0, total:0 });
    renderReceiptItems();
  };
  window._salesAddCatalogItemRcp = function() {
    if (!S.products.length) { toast('Каталог порожній', 'info'); return; }
    // reuse same catalog overlay but pick into receipt
    const html = `
      <div id="slCatalogOverlay2" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10001;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(400px,95vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>Вибір з каталогу</b>
            <button onclick="document.getElementById('slCatalogOverlay2').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
          </div>
          ${S.products.map(p=>`
            <div onclick="window._salesPickProductRcp('${p.id}')" style="padding:.5rem .75rem;border-radius:6px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border:1px solid #f3f4f6;margin-bottom:4px">
              <div style="font-weight:600;font-size:.85rem">${esc(p.name)}</div>
              <div style="font-weight:700;color:#6366f1">${fmt(p.price)} ₴</div>
            </div>`).join('')}
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };
  window._salesPickProductRcp = function(pid) {
    const p = S.products.find(x=>x.id===pid);
    if (!p) return;
    S._receiptItems.push({ id:Date.now()+'', name:p.name, qty:1, unit:p.unit||'шт', price:p.price||0, discount:0, total:p.price||0, productId:p.id });
    renderReceiptItems();
    document.getElementById('slCatalogOverlay2')?.remove();
  };

  window._salesSaveReceipt = async function() {
    const items = (S._receiptItems || []).filter(i => i.name && i.price > 0);
    if (!items.length) { toast('Додайте позиції з ціною', 'warn'); return; }
    let total = 0;
    items.forEach(i => { i.total = Math.round(i.qty * i.price * (1-(i.discount||0)/100)*100)/100; total += i.total; });
    const number = S.editingOrder?.number || await generateOrderNumber('receipt');
    const paymentMethod = document.querySelector('input[name="slRcpPayMethod"]:checked')?.value || 'cash';
    const clientName = el('slRcpClient')?.value?.trim() || '';
    const date = el('slRcpDate')?.value || todayISO();
    const data = {
      type: 'receipt', number, status: 'paid',
      clientId: S.clients.find(c=>(c.name||c.fullName||'').toLowerCase()===clientName.toLowerCase())?.id || '',
      clientName, date,
      items, total: Math.round(total*100)/100, subtotal: Math.round(total*100)/100, discountTotal: 0,
      paymentMethod, paymentStatus: 'paid', paidAmount: Math.round(total*100)/100,
      notes: '', updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
      if (S.editingOrderId) {
        await col('sales_orders').doc(S.editingOrderId).update(data);
      } else {
        data.isDemo = false;
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.createdBy = window.currentUser?.uid || '';
        const ref = await col('sales_orders').add(data);
        await recordSaleInFinance({ ...data, id: ref.id });
      }
      toast('Чек проведено');
      document.getElementById('salesReceiptOverlay')?.remove();
      await loadOrders();
    } catch(e) { toast('Помилка: ' + e.message, 'error'); }
  };

  // ─── CATALOG TAB ──────────────────────────────────────────────────────────
  async function renderCatalogTab() {
    const cont = el('salesCatalogContent');
    if (!cont) return;
    await loadProducts();
    cont.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <b>Каталог товарів та послуг</b>
        <button onclick="window._salesOpenProductForm(null)" class="sl-btn" style="background:#6366f1;color:#fff">+ Додати</button>
      </div>
      ${!S.products.length ? '<div style="text-align:center;padding:2rem;color:#9ca3af">Каталог порожній</div>' :
      `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#f8fafc">
          <th style="padding:8px;text-align:left">Назва</th>
          <th style="padding:8px;text-align:left">Категорія</th>
          <th style="padding:8px;text-align:center">Од.</th>
          <th style="padding:8px;text-align:right">Ціна</th>
          <th style="padding:8px;width:60px"></th>
        </tr></thead>
        <tbody>${S.products.map(p=>`
          <tr class="sl-tr">
            <td style="padding:7px 8px;font-weight:600">${esc(p.name)}</td>
            <td style="padding:7px 8px;color:#6b7280">${esc(p.category||'—')}</td>
            <td style="padding:7px 8px;text-align:center">${esc(p.unit||'шт')}</td>
            <td style="padding:7px 8px;text-align:right;font-weight:700;color:#6366f1">${fmt(p.price)} ₴</td>
            <td style="padding:7px 8px;text-align:center">
              <button onclick="window._salesOpenProductForm('${p.id}')" style="background:none;border:none;cursor:pointer;color:#6366f1;font-size:.75rem;padding:2px 8px;background:#eef2ff;border-radius:4px">✏️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>`}
    `;
  }

  window._salesOpenProductForm = function(productId) {
    const p = productId ? S.products.find(x => x.id === productId) : null;
    const overlay = document.createElement('div');
    overlay.id = 'salesProductOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(400px,96vw)">
        <div style="display:flex;justify-content:space-between;margin-bottom:1rem">
          <b>${p ? 'Редагувати' : 'Новий товар/послуга'}</b>
          <button onclick="document.getElementById('salesProductOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:.75rem">
          <div><label class="sl-label">Назва *</label><input id="slProdName" class="sl-inp" value="${esc(p?.name||'')}"></div>
          <div><label class="sl-label">Опис</label><textarea id="slProdDesc" class="sl-inp" rows="2">${esc(p?.description||'')}</textarea></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
            <div><label class="sl-label">Ціна ₴ *</label><input id="slProdPrice" class="sl-inp" type="number" min="0" value="${p?.price||0}"></div>
            <div><label class="sl-label">Одиниця</label>
              <select id="slProdUnit" class="sl-inp">
                ${['шт','кг','л','год','км','послуга','м²','м'].map(u=>`<option ${p?.unit===u?'selected':''}>${u}</option>`).join('')}
              </select>
            </div>
          </div>
          <div><label class="sl-label">Категорія</label><input id="slProdCat" class="sl-inp" value="${esc(p?.category||'')}"></div>
        </div>
        <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem">
          <button onclick="document.getElementById('salesProductOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">Скасувати</button>
          ${p ? `<button onclick="window._salesDeleteProduct('${p.id}')" class="sl-btn" style="background:#fef2f2;color:#ef4444">Видалити</button>` : ''}
          <button onclick="window._salesSaveProduct('${productId||''}');" class="sl-btn" style="background:#6366f1;color:#fff">Зберегти</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window._salesSaveProduct = async function(productId) {
    const name = el('slProdName')?.value?.trim();
    if (!name) { toast('Вкажіть назву', 'warn'); return; }
    const data = {
      name, description: el('slProdDesc')?.value?.trim()||'',
      price: parseFloat(el('slProdPrice')?.value)||0,
      unit: el('slProdUnit')?.value||'шт',
      category: el('slProdCat')?.value?.trim()||'',
      isActive: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
      if (productId) {
        await col('sales_products').doc(productId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await col('sales_products').add(data);
      }
      toast('Збережено');
      document.getElementById('salesProductOverlay')?.remove();
      await loadProducts();
      renderCatalogTab();
    } catch(e) { toast('Помилка: '+e.message,'error'); }
  };

  window._salesDeleteProduct = async function(productId) {
    if (!confirm('Видалити з каталогу?')) return;
    try {
      await col('sales_products').doc(productId).update({ isActive: false });
      toast('Видалено');
      document.getElementById('salesProductOverlay')?.remove();
      await loadProducts();
      renderCatalogTab();
    } catch(e) { toast('Помилка: '+e.message,'error'); }
  };

  // ─── MAIN UI ──────────────────────────────────────────────────────────────
  function buildSalesUI() {
    const container = el('salesTab');
    if (!container) { console.warn('salesTab not found'); return; }

    container.innerHTML = `
      <style>
        .sl-kpi-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 16px;min-width:140px;flex:1}
        .sl-kpi-label{font-size:.72rem;color:#9ca3af;margin-bottom:4px;text-transform:uppercase;letter-spacing:.03em}
        .sl-kpi-value{font-size:1.25rem;font-weight:700;color:#111}
        .sl-label{display:block;font-size:.75rem;color:#6b7280;margin-bottom:3px;font-weight:600}
        .sl-inp{width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:7px 10px;font-size:.85rem;box-sizing:border-box;outline:none}
        .sl-inp:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}
        .sl-inp-sm{border:1px solid #e5e7eb;border-radius:5px;padding:4px 6px;font-size:.8rem;width:100%;box-sizing:border-box;outline:none}
        .sl-inp-sm:focus{border-color:#6366f1}
        .sl-btn{padding:8px 16px;border-radius:7px;border:none;cursor:pointer;font-size:.85rem;font-weight:600;transition:opacity .15s}
        .sl-btn:hover{opacity:.85}
        .sl-btn-sm{padding:4px 10px;border-radius:5px;border:none;cursor:pointer;font-size:.75rem;font-weight:600}
        .sl-tr{cursor:pointer;transition:background .1s}
        .sl-tr:hover{background:#f8fafc}
        .sl-subtab{padding:6px 14px;border-radius:6px;border:none;cursor:pointer;font-size:.8rem;font-weight:600;background:transparent;color:#6b7280;transition:all .15s}
        .sl-subtab.active{background:#6366f1;color:#fff}
        .sl-subtab:hover:not(.active){background:#f3f4f6}
      </style>

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:1rem;padding:1rem 1rem 0">
        <h2 style="margin:0;font-size:1.1rem;font-weight:700">💳 Реалізація</h2>
        <div style="position:relative">
          <button id="slNewDocBtn" onclick="window._salesToggleNewMenu()" class="sl-btn" style="background:#6366f1;color:#fff;display:flex;align-items:center;gap:6px">
            + Новий документ ▾
          </button>
          <div id="slNewDocMenu" style="display:none;position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:100;min-width:180px;padding:6px">
            <button onclick="window._salesNewDoc('invoice')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">📋 Рахунок</button>
            <button onclick="window._salesNewDoc('receipt')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">🧾 Чек</button>
            ${window.hasModule?.('sales_workorder') ? `<button onclick="window._salesNewDoc('work_order')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">🔧 Наряд</button>` : ''}
            ${window.hasModule?.('sales_routes') ? `<button onclick="window._salesNewDoc('route')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">🚛 Рейс</button>` : ''}
          </div>
        </div>
      </div>

      <!-- KPI strip -->
      <div id="salesKPI" style="display:flex;gap:.75rem;flex-wrap:wrap;padding:0 1rem;margin-bottom:1rem"></div>

      <!-- SubTabs -->
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;padding:0 1rem;margin-bottom:.75rem">
        <button class="sl-subtab active" id="slSubAll" onclick="window._salesSubTab('all',this)">Всі</button>
        <button class="sl-subtab" id="slSubInvoice" onclick="window._salesSubTab('invoice',this)">📋 Рахунки</button>
        <button class="sl-subtab" id="slSubReceipt" onclick="window._salesSubTab('receipt',this)">🧾 Каса</button>
        ${window.hasModule?.('sales_workorder') ? `<button class="sl-subtab" id="slSubWO" onclick="window._salesSubTab('work_order',this)">🔧 Наряди</button>` : ''}
        ${window.hasModule?.('sales_routes') ? `<button class="sl-subtab" id="slSubRoute" onclick="window._salesSubTab('route',this)">🚛 Рейси</button>` : ''}
        <button class="sl-subtab" id="slSubCatalog" onclick="window._salesSubTab('catalog',this)">📦 Каталог</button>
        <button class="sl-subtab" id="slSubShifts" onclick="window._salesSubTab('shifts',this)">🔄 Зміни</button>
      </div>

      <!-- Filters -->
      <div id="slFiltersRow" style="display:flex;gap:.5rem;flex-wrap:wrap;padding:0 1rem;margin-bottom:.75rem;align-items:center">
        <input class="sl-inp" placeholder="🔍 Пошук..." style="width:180px;max-width:100%" oninput="window._salesFilter('search',this.value)">
        <select class="sl-inp" style="width:130px" onchange="window._salesFilter('status',this.value)">
          <option value="all">Всі статуси</option>
          ${Object.entries(STATUS_LABELS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
        </select>
        <select class="sl-inp" style="width:130px" onchange="window._salesFilter('period',this.value)">
          <option value="7">7 днів</option>
          <option value="30" selected>30 днів</option>
          <option value="90">90 днів</option>
          <option value="365">Рік</option>
        </select>
      </div>

      <!-- Main content -->
      <div style="padding:0 1rem 1rem">

        <!-- Orders table -->
        <div id="slOrdersTableWrap" style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.84rem">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb">
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600;width:80px">Тип</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">Номер</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">Клієнт</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">Дата</th>
                <th style="padding:9px 8px;text-align:right;color:#6b7280;font-weight:600">Сума</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">Статус</th>
                <th style="padding:9px 8px;width:80px"></th>
              </tr>
            </thead>
            <tbody id="salesOrdersTbody"></tbody>
          </table>
        </div>

        <!-- Catalog content (hidden by default) -->
        <div id="salesCatalogContent" style="display:none"></div>
        <!-- Shifts content (hidden by default) -->
        <div id="salesShiftsContent" style="display:none"></div>
      </div>
    `;

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#slNewDocBtn') && !e.target.closest('#slNewDocMenu')) {
        const m = el('slNewDocMenu'); if (m) m.style.display = 'none';
      }
    });
  }

  window._salesToggleNewMenu = function() {
    const m = el('slNewDocMenu');
    if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
  };

  window._salesNewDoc = function(type) {
    const m = el('slNewDocMenu'); if (m) m.style.display = 'none';
    S.editingOrderId = null; S.editingOrder = null;
    if (type === 'invoice') openInvoiceForm(null);
    else if (type === 'receipt') openReceiptForm(null);
    else if (type === 'work_order') {
      if (typeof window.initSalesWorkOrderModule === 'function') window.initSalesWorkOrderModule();
      else toast('Модуль Нарядів завантажується...', 'info');
    } else if (type === 'route') {
      if (typeof window.initSalesRoutesModule === 'function') window.initSalesRoutesModule();
      else toast('Модуль Рейсів завантажується...', 'info');
    }
  };

  window._salesSubTab = function(tab, btn) {
    document.querySelectorAll('.sl-subtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    S.activeSubTab = tab;
    const tableWrap = el('slOrdersTableWrap');
    const catalogCont = el('salesCatalogContent');
    const filtersRow = el('slFiltersRow');
    const shiftsCont = el('salesShiftsContent');
    if (tab === 'catalog') {
      if (tableWrap) tableWrap.style.display = 'none';
      if (catalogCont) catalogCont.style.display = 'block';
      if (shiftsCont) shiftsCont.style.display = 'none';
      if (filtersRow) filtersRow.style.display = 'none';
      renderCatalogTab();
    } else if (tab === 'shifts') {
      if (tableWrap) tableWrap.style.display = 'none';
      if (catalogCont) catalogCont.style.display = 'none';
      if (shiftsCont) shiftsCont.style.display = 'block';
      if (filtersRow) filtersRow.style.display = 'none';
      if (typeof window.renderShiftsPanel === 'function') window.renderShiftsPanel();
      else { if (shiftsCont) shiftsCont.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af">Модуль змін завантажується...</div>'; }
    } else {
      if (tableWrap) tableWrap.style.display = 'block';
      if (catalogCont) catalogCont.style.display = 'none';
      if (shiftsCont) shiftsCont.style.display = 'none';
      if (filtersRow) filtersRow.style.display = 'flex';
      renderOrdersTable();
    }
  };

  window._salesFilter = function(key, val) {
    S.filter[key] = val;
    renderOrdersTable();
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────
  window.initSalesModule = async function () {
    if (!window.currentCompanyId) {
      console.warn('initSalesModule: no currentCompanyId');
      return;
    }
    buildSalesUI();
    await Promise.all([loadOrders(), loadProducts(), loadClients(), loadStaff()]);
  };

  // Auto-init if tab already active
  if (document.getElementById('salesTab')?.classList.contains('active')) {
    window.initSalesModule();
  }

})();
