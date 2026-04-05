(function () {
  'use strict';
  function _tg(ua,ru){return window.currentLang==='ru'?ru:ua;}

  // ─── helpers ──────────────────────────────────────────────────────────────
  function getDb() {
    return window.db || (window.firebase && firebase.firestore());
  }
  function getCompanyId() {
    return window.currentCompanyId || window.currentCompany || null;
  }
  function compRef() {
    const db = getDb();
    const cid = getCompanyId();
    if (!db || !cid) throw new Error('DB or companyId not ready');
    return db.collection('companies').doc(cid);
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
    get invoice(){return window.t('рахунок')},
    get receipt(){return window.t('чек')},
    get work_order(){return window.t('наряд')},
    get route(){return window.t('рейс')},
  };
  const STATUS_LABELS = {
    get draft(){return window.t('чернетка')},
    sent:      window.t('відправлено'),
    get paid(){return window.t('оплачено')},
    get partial(){return window.t('частково')},
    get cancelled(){return window.t('скасовано')},
    get closed(){return window.t('закрито')},
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
    if (!getCompanyId()) return;
    try {
      let q = col('sales_orders').orderBy('createdAt','desc').limit(200);
      const snap = await q.get();
      S.orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderOrdersTable();
      renderKPI();
    } catch(e) { console.warn('sales loadOrders:', e.message); }
  }

  async function loadProducts() {
    if (!getCompanyId()) return;
    try {
      const snap = await col('sales_products').where('isActive','==',true).orderBy('name').get();
      S.products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('sales loadProducts:', e); }
  }

  async function loadClients() {
    if (!getCompanyId()) return;
    try {
      const snap = await col('crm_clients').limit(300).get();
      S.clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { S.clients = []; }
  }

  async function loadStaff() {
    if (!getCompanyId()) return;
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
        const inNote = (o.note||'').toLowerCase().includes(q);
        const inItems = Array.isArray(o.items) && o.items.some(i => (i.name||'').toLowerCase().includes(q));
        if (!inNum && !inCli && !inNote && !inItems) return false;
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
        <div class="sl-kpi-label">${window.t('виручкаСьогодні')}</div>
        <div class="sl-kpi-value">${fmt(todayRev)} ₴</div>
      </div>
      <div class="sl-kpi-card">
        <div class="sl-kpi-label">${window.t('заМісяць')}</div>
        <div class="sl-kpi-value">${fmt(monthRev)} ₴</div>
      </div>
      <div class="sl-kpi-card">
        <div class="sl-kpi-label">${window.t('середнійЧек')}</div>
        <div class="sl-kpi-value">${fmt(avg)} ₴</div>
      </div>
      <div class="sl-kpi-card" style="border-color:#fca5a5">
        <div class="sl-kpi-label">${window.t('неоплачено')}</div>
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
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9ca3af">${window.t('немаєДокументів')}</td></tr>`;
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
            <button onclick="event.stopPropagation();window._salesEditOrder('${esc(o.id)}')" style="background:none;border:none;cursor:pointer;color:#6366f1;font-size:.75rem;padding:2px 6px;border-radius:4px;background:#eef2ff" title="Редагувати"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            ${o.type==='invoice'?`<button onclick="event.stopPropagation();window._salesPrintInvoice('${esc(o.id)}')" style="background:none;border:none;cursor:pointer;color:#059669;font-size:.75rem;padding:2px 6px;border-radius:4px;background:#d1fae5;margin-left:4px" title="PDF"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>`:''}
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
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10050;display:flex;align-items:flex-start;justify-content:center;padding-top:2vh;overflow-y:auto;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;width:min(760px,98vw);padding:1.5rem;margin-bottom:2rem;position:relative">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">${_tg(order ? 'Редагувати рахунок' : 'Новий рахунок', order ? 'Редактировать счет' : 'Новый счет')}</h3>
          <button onclick="document.getElementById('salesInvoiceOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <!-- Header fields -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">${window.t('клієнт')}</label>
            <input id="slInvClient" class="sl-inp" placeholder="Пошук клієнта або введіть вручну" value="${esc(order?.clientName||'')}" list="slClientsList" autocomplete="off">
            <datalist id="slClientsList">${S.clients.map(c=>`<option value="${esc(c.name||c.fullName||'')}">`).join('')}</datalist>
          </div>
          <div>
            <label class="sl-label">${window.t('телефон')}</label>
            <input id="slInvPhone" class="sl-inp" placeholder="+380..." value="${esc(order?.clientPhone||'')}">
          </div>
          <div>
            <label class="sl-label">${window.t('номерДокумента')}</label>
            <input id="slInvNumber" class="sl-inp" value="${esc(number)}">
          </div>
          <div>
            <label class="sl-label">${window.t('дата1')}</label>
            <input id="slInvDate" class="sl-inp" type="date" value="${order?.date||todayISO()}">
          </div>
          <div>
            <label class="sl-label">${window.t('датаОплати')}</label>
            <input id="slInvDueDate" class="sl-inp" type="date" value="${order?.dueDate||''}">
          </div>
          <div>
            <label class="sl-label">${window.t('статус1')}</label>
            <select id="slInvStatus" class="sl-inp">
              ${['draft','sent','paid','partial','cancelled'].map(s=>`<option value="${s}" ${(order?.status||'draft')===s?'selected':''}>${STATUS_LABELS[s]}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Items -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">${window.t('позиції')}</b>
            <div style="display:flex;gap:.5rem">
              <button onclick="window._salesAddCatalogItem()" class="sl-btn-sm" style="background:#eef2ff;color:#6366f1">З каталогу</button>
              <button onclick="window._salesAddInvoiceItem()" class="sl-btn-sm" style="background:#f0fdf4;color:#16a34a">${window.t('позиція')}</button>
            </div>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.83rem" id="slInvItemsTable">
              <thead>
                <tr style="background:#f8fafc">
                  <th style="text-align:left;padding:6px 8px;color:#6b7280;font-weight:600">${window.t('назва')}</th>
                  <th style="width:60px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('кіл')}</th>
                  <th style="width:70px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('од')}</th>
                  <th style="width:90px;text-align:right;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('ціна')}</th>
                  <th style="width:60px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('зн')}</th>
                  <th style="width:90px;text-align:right;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('сума')}</th>
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
              <span>${window.t('знижка')}</span><span id="slInvDiscountTotal">0 ₴</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:700;font-size:1rem;border-top:2px solid #e5e7eb;margin-top:4px">
              <span>${window.t('доСплати')}</span><span id="slInvTotal" style="color:#6366f1">0 ₴</span>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div style="margin-bottom:1rem">
          <label class="sl-label">${window.t('спосібОплати')}</label>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            ${[[  'cash',window.t('готівка')],['terminal',window.t('термінал')],['transfer',window.t('переказ')],['mixed',window.t('змішана')]].map(([v,l])=>`
              <label style="display:flex;align-items:center;gap:4px;padding:5px 12px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;font-size:.83rem">
                <input type="radio" name="slInvPayMethod" value="${v}" ${(order?.paymentMethod||'cash')===v?'checked':''}> ${l}
              </label>`).join('')}
          </div>
        </div>

        <div style="margin-bottom:1.25rem">
          <label class="sl-label">${window.t('примітки')}</label>
          <textarea id="slInvNotes" class="sl-inp" rows="2" placeholder="Коментар...">${esc(order?.notes||'')}</textarea>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="document.getElementById('salesInvoiceOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">${window.t('скасувати1')}</button>
          <button onclick="window._salesSaveInvoice(false)" class="sl-btn" style="background:#6366f1;color:#fff">${window.t('зберегти')}</button>
          ${order?.status !== 'paid' ? `<button onclick="window._salesSaveInvoice(true)" class="sl-btn" style="background:#10b981;color:#fff">${window.t('зберегтиТаПозначитиОплаченим')}</button>` : ''}
          ${order ? `<button onclick="window._salesPrintInvoice('${esc(order.id)}')" class="sl-btn" style="background:#f59e0b;color:#fff">PDF</button>` : ''}
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
        <td style="padding:4px"><input class="sl-inp-sm" value="${esc(item.name)}" onchange="window._salesItemChange(${idx},'name',this.value)" placeholder="${window.t('назваПослугитовару')}" style="width:100%;min-width:120px"></td>
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
    if (!S.products.length) { toast(_tg('Каталог порожній. Додайте товари/послуги в розділ "Каталог".', 'Каталог пуст. Добавьте товары/услуги в раздел "Каталог".'), 'info'); return; }
    const html = `
      <div id="slCatalogOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10050;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(440px,95vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>${window.t('вибірЗКаталогу')}</b>
            <button onclick="document.getElementById('slCatalogOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <input class="sl-inp" placeholder="${window.t('пошук')}" oninput="window._salesCatalogSearch(this.value)" style="margin-bottom:.75rem" id="slCatalogSearch">
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

    if (!number) { toast(window.t('вкажітьНомерДокумента'), 'warn'); return; }
    const items = (S._invoiceItems || []).filter(i => i.name);
    if (!items.length) { toast(window.t('додайтеХочаБОдну'), 'warn'); return; }

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
        toast(window.t('рахунокОновлено'));
      } else {
        data.isDemo = false;
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.createdBy = window.currentUser?.uid || '';
        const ref = await col('sales_orders').add(data);
        if (markPaid) await recordSaleInFinance({ ...data, id: ref.id, paidAmount: total });
        toast(window.t('рахунокСтворено'));
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
      const typeMap = { invoice:window.t('рахунок'), receipt:window.t('чек'), work_order:window.t('наряд'), route:window.t('рейс') };
      await txRef.set({
        type: 'income',
        amount: order.paidAmount,
        categoryName: window.t('виручкаРеалізація'),
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
    } else if (o.type === 'work_order') {
      if (typeof window._salesOpenWorkOrder === 'function') await window._salesOpenWorkOrder(id, null);
      else toast(window.t('модульНарядівЗавантажується'), 'info');
    } else if (o.type === 'route') {
      if (typeof window._salesOpenRouteForm === 'function') await window._salesOpenRouteForm(id);
      else toast(window.t('модульРейсівЗавантажується'), 'info');
    }
  };

  // ─── print/PDF invoice ─────────────────────────────────────────────────────
  window._salesPrintInvoice = async function(id) {
    let order = S.orders.find(x => x.id === id);
    if (!order) {
      try { const d = await col('sales_orders').doc(id).get(); if(d.exists) order = {id:d.id,...d.data()}; } catch(e) {}
    }
    if (!order) { toast(window.t('документНеЗнайдено'), 'error'); return; }

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
    <div class="meta">${window.t('від')} ${esc(order.date || '')}</div>
    <table style="margin-bottom:8px;border:none"><tr>
      <td style="border:none;vertical-align:top;padding:0 24px 0 0">
        <b>${window.t('відКого')}</b><br>${esc(company.name || company.companyName || '—')}<br>
        <span style="color:#666">${esc(company.address||'')}</span><br>
        <span style="color:#666">${esc(company.phone||'')}</span>
      </td>
      <td style="border:none;vertical-align:top">
        <b>Кому:</b><br>${esc(order.clientName||'—')}<br>
        <span style="color:#666">${esc(order.clientPhone||'')}</span>
      </td>
    </tr></table>
    <table>
      <thead><tr><th>#</th><th>${window.t('назва')}</th><th>${window.t('кіл')}</th><th>${window.t('ціна')}</th><th>${window.t('зн')}</th><th>${window.t('сума')}</th></tr></thead>
      <tbody>
        ${items.map((item,i)=>`<tr><td>${i+1}</td><td>${esc(item.name)}</td><td>${item.qty} ${esc(item.unit||'')}</td><td>${fmt(item.price)} ₴</td><td>${item.discount||0}%</td><td><b>${fmt(item.total)} ₴</b></td></tr>`).join('')}
      </tbody>
    </table>
    <div style="text-align:right">
      ${order.discountTotal>0 ? `<div style="color:#666">${window.t('знижка')} −${fmt(order.discountTotal)} ₴</div>` : ''}
      <div class="total-row" style="font-size:1.15rem;color:#6366f1">${window.t('доСплати')} ${fmt(order.total)} ₴</div>
    </div>
    ${company.iban||company.bankDetails ? `<div class="footer"><b>${window.t('реквізити')}</b> ${esc(company.iban||company.bankDetails||'')}</div>` : ''}
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
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10050;display:flex;align-items:flex-start;justify-content:center;padding-top:2vh;overflow-y:auto;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;width:min(560px,98vw);padding:1.5rem;margin-bottom:2rem;position:relative">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">${_tg(order ? 'Редагувати чек' : 'Касовий чек', order ? 'Редактировать чек' : 'Кассовый чек')} ${esc(number)}</h3>
          <button onclick="document.getElementById('salesReceiptOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">${_tg("Клієнт (необов'язково)", 'Клиент (необязательно)')}</label>
            <input id="slRcpClient" class="sl-inp" placeholder="${_tg("Ім'я клієнта", 'Имя клиента')}" value="${esc(order?.clientName||'')}" list="slRcpClientsList">
            <datalist id="slRcpClientsList">${S.clients.map(c=>`<option value="${esc(c.name||c.fullName||'')}">`).join('')}</datalist>
          </div>
          <div>
            <label class="sl-label">${window.t('дата1')}</label>
            <input id="slRcpDate" class="sl-inp" type="date" value="${order?.date||todayISO()}">
          </div>
        </div>

        <!-- Items -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">${window.t('позиції')}</b>
            <div style="display:flex;gap:.5rem">
              <button onclick="window._salesAddCatalogItemRcp()" class="sl-btn-sm" style="background:#eef2ff;color:#6366f1">З каталогу</button>
              <button onclick="window._salesAddReceiptItem()" class="sl-btn-sm" style="background:#f0fdf4;color:#16a34a">${window.t('позиція')}</button>
            </div>
          </div>
          <div id="slRcpItemsList"></div>
        </div>

        <!-- Total -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:2px solid #e5e7eb;margin-bottom:1rem">
          <b style="font-size:.95rem">${window.t('разом')}</b>
          <b style="font-size:1.3rem;color:#6366f1" id="slRcpTotal">0 ₴</b>
        </div>

        <!-- Payment method -->
        <div style="margin-bottom:1.25rem">
          <label class="sl-label">${window.t('оплата')}</label>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            ${[['cash',window.t('готівка')],['terminal',window.t('термінал')],['transfer',window.t('переказ')]].map(([v,l])=>`
              <label style="display:flex;align-items:center;gap:4px;padding:6px 14px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:600">
                <input type="radio" name="slRcpPayMethod" value="${v}" ${(order?.paymentMethod||'cash')===v?'checked':''}> ${l}
              </label>`).join('')}
          </div>
        </div>

        <div style="display:flex;gap:.75rem;justify-content:flex-end">
          <button onclick="document.getElementById('salesReceiptOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">${window.t('скасувати1')}</button>
          <button onclick="window._salesSaveReceipt()" class="sl-btn" style="background:#10b981;color:#fff;font-size:1rem">${window.t('провести')}<и чек</button>
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
        <input class="sl-inp-sm" value="${esc(item.name)}" onchange="window._salesRcpItemChange(${idx},'name',this.value)" placeholder="${window.t('назва')}">
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
    if (!S.products.length) { toast(window.t('каталогПорожній'), 'info'); return; }
    // reuse same catalog overlay but pick into receipt
    const html = `
      <div id="slCatalogOverlay2" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10001;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(400px,95vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>${window.t('вибірЗКаталогу')}</b>
            <button onclick="document.getElementById('slCatalogOverlay2').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
    if (!items.length) { toast(window.t('додайтеПозиціїЗЦіною'), 'warn'); return; }
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
      toast(window.t('чекПроведено'));
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
        <b>${window.t('каталогТоварівТаПослуг')}</b>
        <button onclick="window._salesOpenProductForm(null)" class="sl-btn" style="background:#6366f1;color:#fff">${window.t('додати')}</button>
      </div>
      ${!S.products.length ? `<div style="text-align:center;padding:2rem;color:#9ca3af">${window.t('каталогПорожній')}</div>` :
      `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:#f8fafc">
          <th style="padding:8px;text-align:left">${window.t('назва')}</th>
          <th style="padding:8px;text-align:left">${window.t('категорія')}</th>
          <th style="padding:8px;text-align:center">${window.t('од')}</th>
          <th style="padding:8px;text-align:right">${window.t('ціна')}</th>
          <th style="padding:8px;width:60px"></th>
        </tr></thead>
        <tbody>${S.products.map(p=>`
          <tr class="sl-tr">
            <td style="padding:7px 8px;font-weight:600">${esc(p.name)}</td>
            <td style="padding:7px 8px;color:#6b7280">${esc(p.category||'—')}</td>
            <td style="padding:7px 8px;text-align:center">${esc(p.unit||'шт')}</td>
            <td style="padding:7px 8px;text-align:right;font-weight:700;color:#6366f1">${fmt(p.price)} ₴</td>
            <td style="padding:7px 8px;text-align:center">
              <button onclick="window._salesOpenProductForm('${p.id}')" style="background:none;border:none;cursor:pointer;color:#6366f1;font-size:.75rem;padding:2px 8px;background:#eef2ff;border-radius:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
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
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10050;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(400px,96vw)">
        <div style="display:flex;justify-content:space-between;margin-bottom:1rem">
          <b>${_tg(p ? 'Редагувати' : 'Новий товар/послуга', p ? 'Редактировать' : 'Новый товар/услуга')}</b>
          <button onclick="document.getElementById('salesProductOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style="display:flex;flex-direction:column;gap:.75rem">
          <div><label class="sl-label">Назва *</label><input id="slProdName" class="sl-inp" value="${esc(p?.name||'')}"></div>
          <div><label class="sl-label">Опис</label><textarea id="slProdDesc" class="sl-inp" rows="2">${esc(p?.description||'')}</textarea></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
            <div><label class="sl-label">${window.t('ціна1')}</label><input id="slProdPrice" class="sl-inp" type="number" min="0" value="${p?.price||0}"></div>
            <div><label class="sl-label">${window.t('одиниця')}</label>
              <select id="slProdUnit" class="sl-inp">
                ${['шт','кг','л','год','км','послуга','м²','м'].map(u=>`<option ${p?.unit===u?'selected':''}>${u}</option>`).join('')}
              </select>
            </div>
          </div>
          <div><label class="sl-label">Категорія</label><input id="slProdCat" class="sl-inp" value="${esc(p?.category||'')}"></div>
        </div>
        <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem">
          <button onclick="document.getElementById('salesProductOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">${window.t('скасувати1')}</button>
          ${p ? `<button onclick="window._salesDeleteProduct('${p.id}')" class="sl-btn" style="background:#fef2f2;color:#ef4444">${window.t('видалити')}</button>` : ''}
          <button onclick="window._salesSaveProduct('${productId||''}');" class="sl-btn" style="background:#6366f1;color:#fff">${window.t('зберегти')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window._salesSaveProduct = async function(productId) {
    const name = el('slProdName')?.value?.trim();
    if (!name) { toast(window.t('вкажітьНазву'), 'warn'); return; }
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
      toast(window.t('збережено'));
      document.getElementById('salesProductOverlay')?.remove();
      await loadProducts();
      renderCatalogTab();
    } catch(e) { toast('Помилка: '+e.message,'error'); }
  };

  window._salesDeleteProduct = async function(productId) {
    if (!confirm(window.t('видалитиЗКаталогу'))) return;
    try {
      await col('sales_products').doc(productId).update({ isActive: false });
      toast(window.t('видалено'));
      document.getElementById('salesProductOverlay')?.remove();
      await loadProducts();
      renderCatalogTab();
    } catch(e) { toast('Помилка: '+e.message,'error'); }
  };

  // ─── module visibility helpers ────────────────────────────────────────────
  function showWorkOrders() {
    return window.hasModule?.('sales_workorder') ||
           (window.currentCompanyData?.niche === 'autoservice');
  }
  function showRoutes() {
    return window.hasModule?.('sales_routes') ||
           (window.currentCompanyData?.niche === 'logistics');
  }

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
        <h2 style="margin:0;font-size:1.1rem;font-weight:700">${window.t('реалізація')}</h2>
        <div style="position:relative">
          <button id="slNewDocBtn" onclick="window._salesToggleNewMenu()" class="sl-btn" style="background:#6366f1;color:#fff;display:flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            ${window.t('новаРеалізація')}
          </button>
          <div id="slNewDocMenu" style="display:none;position:absolute;right:0;top:calc(100% + 4px);background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:100;min-width:200px;padding:6px">
            <div style="font-size:.7rem;color:#9ca3af;padding:4px 12px 2px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Тип документа</div>
            <button onclick="window._salesNewDoc('invoice')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="14" height="14" style="flex-shrink:0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Рахунок-фактура</button>
            <button onclick="window._salesNewDoc('receipt')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="14" height="14" style="flex-shrink:0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Касовий чек / оплата</button>
            ${showWorkOrders() ? `<button onclick="window._salesNewDoc('work_order')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="14" height="14" style="flex-shrink:0"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> Наряд-замовлення</button>` : ''}
            ${showRoutes() ? `<button onclick="window._salesNewDoc('route')" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:none;border:none;cursor:pointer;border-radius:5px;font-size:.85rem" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="14" height="14" style="flex-shrink:0"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Рейс</button>` : ''}
          </div>
        </div>
      </div>

      <!-- KPI strip -->
      <div id="salesKPI" style="display:flex;gap:.75rem;flex-wrap:wrap;padding:0 1rem;margin-bottom:1rem"></div>

      <!-- SubTabs -->
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;padding:0 1rem;margin-bottom:.75rem">
        <button class="sl-subtab active" id="slSubAll" onclick="window._salesSubTab('all',this)">${window.t('всі')}</button>
        <button class="sl-subtab" id="slSubOrders" onclick="window._salesSubTab('orders',this)" style="background:transparent;border:1px dashed #6366f1;color:#6366f1">${window.t('замовлення')}</button>
        <button class="sl-subtab" id="slSubRealizations" onclick="window._salesSubTab('realizations',this)" style="background:transparent;border:1px dashed #059669;color:#059669">${window.t('реалізації')}</button>
        <button class="sl-subtab" id="slSubDebtors" onclick="window._salesSubTab('debtors',this)" style="background:transparent;border:1px dashed #dc2626;color:#dc2626">${window.t('дебіторка')}</button>
        <button class="sl-subtab" id="slSubPrices" onclick="window._salesSubTab('prices',this)" style="background:transparent;border:1px dashed #d97706;color:#d97706">${window.t('прайси')}</button>
        <button class="sl-subtab" id="slSubInvoice" onclick="window._salesSubTab('invoice',this)">${window.t('рахунки')}</button>
        <button class="sl-subtab" id="slSubReceipt" onclick="window._salesSubTab('receipt',this)">${window.t('каса')}</button>
        ${showWorkOrders() ? `<button class="sl-subtab" id="slSubWO" onclick="window._salesSubTab('work_order',this)">${window.t('наряди')}</button>` : ''}
        ${showRoutes() ? `<button class="sl-subtab" id="slSubRoute" onclick="window._salesSubTab('route',this)">${window.t('рейси')}</button>` : ''}
        <button class="sl-subtab" id="slSubCatalog" onclick="window._salesSubTab('catalog',this)">${window.t('каталог')}</button>
        <button class="sl-subtab" id="slSubShifts" onclick="window._salesSubTab('shifts',this)">${window.t('зміни')}</button>
        <button class="sl-subtab" id="slSubVehicles" onclick="window._salesSubTab('vehicles',this)" style="display:${showWorkOrders()?'':'none'}">Авто</button>
        <button class="sl-subtab" id="slSubRoutesPanel" onclick="window._salesSubTab('routes_panel',this)" style="display:${showRoutes()?'':'none'}">Маршрути</button>
      </div>

      <!-- Filters -->
      <div id="slFiltersRow" style="display:flex;gap:.5rem;flex-wrap:wrap;padding:0 1rem;margin-bottom:.75rem;align-items:center">
        <input class="sl-inp" placeholder="${window.t('пошукЗаНомеромКлієнтом')}" style="width:260px;max-width:100%" oninput="window._salesFilter('search',this.value)">
        <select class="sl-inp" style="width:130px" onchange="window._salesFilter('status',this.value)">
          <option value="all">${window.t('всіСтатуси')}</option>
          ${Object.entries(STATUS_LABELS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
        </select>
        <select class="sl-inp" style="width:130px" onchange="window._salesFilter('period',this.value)">
          <option value="7">${window.t('7Днів')}</option>
          <option value="30" selected>${window.t('30Днів')}</option>
          <option value="90">${window.t('90Днів')}</option>
          <option value="365">${window.t('рік')}</option>
        </select>
      </div>

      <!-- Main content -->
      <div style="padding:0 1rem 1rem">

        <!-- Orders table -->
        <div id="slOrdersTableWrap" style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.84rem">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb">
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600;width:80px">${window.t('тип')}</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">${window.t('номер')}</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">${window.t('клієнт')}</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">${window.t('дата1')}</th>
                <th style="padding:9px 8px;text-align:right;color:#6b7280;font-weight:600">${window.t('сума')}</th>
                <th style="padding:9px 8px;text-align:left;color:#6b7280;font-weight:600">${window.t('статус1')}</th>
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
        <!-- Vehicles content (hidden by default) -->
        <div id="salesVehiclesContent" style="display:none"></div>
        <!-- Routes panel (hidden by default) -->
        <div id="salesRoutesContent" style="display:none"></div>
        <!-- Orders (106-sales-orders.js) -->
        <div id="salesOrdersContent" style="display:none"><div id="soRootWrap"></div></div>
        <div id="salesRealizationsContent" style="display:none"><div id="srRootWrap"></div></div>
        <div id="salesDebtorsContent" style="display:none"><div id="sdRootWrap"></div></div>
        <div id="salesPricesContent" style="display:none"><div id="plRootWrap"></div></div>
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
      if (typeof window._salesOpenWorkOrder === 'function') window._salesOpenWorkOrder(null, null);
      else toast(window.t('модульНарядівЗавантажується'), 'info');
    } else if (type === 'route') {
      if (typeof window._salesOpenRouteForm === 'function') window._salesOpenRouteForm(null);
      else toast(window.t('модульРейсівЗавантажується'), 'info');
    }
  };

  window._salesSubTab = function(tab, btn) {
    document.querySelectorAll('.sl-subtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    S.activeSubTab = tab;
    const tableWrap = el('slOrdersTableWrap');
    const catalogCont = el('salesCatalogContent');
    const filtersRow = el('slFiltersRow');
    const shiftsCont   = el('salesShiftsContent');
    const vehiclesCont = el('salesVehiclesContent');
    const routesCont   = el('salesRoutesContent');
    const ordersCont       = el('salesOrdersContent');
    const realizationsCont = el('salesRealizationsContent');
    const debtorsCont      = el('salesDebtorsContent');
    const pricesCont       = el('salesPricesContent');
    const allSecondary = [catalogCont, shiftsCont, vehiclesCont, routesCont, ordersCont, realizationsCont, debtorsCont, pricesCont];

    function hideAll() {
      if (tableWrap) tableWrap.style.display = 'none';
      allSecondary.forEach(c => { if(c) c.style.display='none'; });
      if (filtersRow) filtersRow.style.display = 'none';
    }

    if (tab === 'orders') {
      hideAll();
      if (ordersCont) ordersCont.style.display = 'block';
      if (typeof window.initSalesOrders === 'function') {
        if (!ordersCont._soInited) { ordersCont._soInited = true; window.initSalesOrders(); }
      } else {
        if (ordersCont) ordersCont.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af">' + window.t('завантаження') + '</div>';
      }
    } else if (tab === 'realizations') {
      hideAll();
      if (realizationsCont) realizationsCont.style.display = 'block';
      if (typeof window.initSalesRealizations === 'function') {
        if (!realizationsCont._srInited) { realizationsCont._srInited = true; window.initSalesRealizations(); }
      } else {
        if (realizationsCont) realizationsCont.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af">' + window.t('завантаження') + '</div>';
      }
    } else if (tab === 'debtors') {
      hideAll();
      if (debtorsCont) debtorsCont.style.display = 'block';
      if (typeof window.initSalesDebtors === 'function') {
        if (!debtorsCont._sdInited) { debtorsCont._sdInited = true; window.initSalesDebtors(); }
      } else {
        if (debtorsCont) debtorsCont.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af">' + window.t('завантаження') + '</div>';
      }
    } else if (tab === 'prices') {
      hideAll();
      if (pricesCont) pricesCont.style.display = 'block';
      if (typeof window.initPriceLists === 'function') {
        if (!pricesCont._plInited) { pricesCont._plInited = true; window.initPriceLists(); }
      } else {
        if (pricesCont) pricesCont.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af">' + window.t('завантаження') + '</div>';
      }
    } else if (tab === 'catalog') {
      hideAll();
      if (catalogCont) catalogCont.style.display = 'block';
      renderCatalogTab();
    } else if (tab === 'shifts') {
      hideAll();
      if (shiftsCont) shiftsCont.style.display = 'block';
      if (typeof window.renderShiftsPanel === 'function') window.renderShiftsPanel();
      else if (shiftsCont) shiftsCont.innerHTML = ('<div style="text-align:center;padding:2rem;color:#9ca3af">' + window.t('завантаження') + '</div>');
    } else if (tab === 'vehicles') {
      hideAll();
      if (vehiclesCont) vehiclesCont.style.display = 'block';
      if (typeof window.renderVehiclesPanel === 'function') window.renderVehiclesPanel();
      else if (vehiclesCont) vehiclesCont.innerHTML = ('<div style="text-align:center;padding:2rem;color:#9ca3af">' + window.t('завантаження') + '</div>');
    } else if (tab === 'routes_panel') {
      hideAll();
      if (routesCont) routesCont.style.display = 'block';
      if (typeof window.renderRoutesPanel === 'function') window.renderRoutesPanel();
      else if (routesCont) routesCont.innerHTML = ('<div style="text-align:center;padding:2rem;color:#9ca3af">' + window.t('завантаження') + '</div>');
    } else {
      if (tableWrap) tableWrap.style.display = 'block';
      allSecondary.forEach(c => { if(c) c.style.display='none'; });
      if (filtersRow) filtersRow.style.display = 'flex';
      renderOrdersTable();
    }
  };

  window._salesFilter = function(key, val) {
    S.filter[key] = val;
    renderOrdersTable();
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────
  // External reload hook used by 104d/104e
  window._salesLoadOrdersExternal = async function() { await loadOrders(); };

  window.initSalesModule = async function () {
    if (!getCompanyId()) {
      console.warn('initSalesModule: no companyId (currentCompanyId or currentCompany)');
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
