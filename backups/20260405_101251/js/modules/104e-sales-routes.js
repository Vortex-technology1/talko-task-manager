(function () {
  'use strict';

  function getDb() { return window.db || (window.firebase && firebase.firestore()); }
  function getCompanyId() { return window.currentCompanyId || window.currentCompany || null; }
  function col(name) {
    const db = getDb(); const cid = getCompanyId();
    if (!db || !cid) throw new Error('DB or companyId not ready');
    return db.collection('companies').doc(cid).collection(name);
  }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function toast(msg, type) { if (typeof showToast==='function') showToast(msg, type||'success'); }

  // ─── state ────────────────────────────────────────────────────────────────
  let _staff = [];
  let _clients = [];
  let _routeExpenses = [];

  async function loadRouteDeps() {
    if (!getCompanyId()) return;
    try {
      const [sSnap, cSnap] = await Promise.all([
        col('staff').where('isActive','==',true).get(),
        col('crm_clients').limit(300).get(),
      ]);
      _staff   = sSnap.docs.map(d=>({id:d.id,...d.data()}));
      _clients = cSnap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) { console.warn('loadRouteDeps:', e); }
  }

  async function generateRouteNumber() {
    const year = new Date().getFullYear();
    try {
      const snap = await col('sales_orders').where('type','==','route').orderBy('createdAt','desc').limit(1).get();
      let seq = 1;
      if (!snap.empty) { const m=(snap.docs[0].data().number||'').match(/(\d+)$/); if(m) seq=parseInt(m[1])+1; }
      return `RTE-${year}-${String(seq).padStart(4,'0')}`;
    } catch(e) { return `RTE-${year}-${String(Date.now()).slice(-4)}`; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTE FORM
  // ══════════════════════════════════════════════════════════════════════════
  window._salesOpenRouteForm = async function(orderId) {
    await loadRouteDeps();

    let order = null;
    if (orderId) {
      try {
        const d = await col('sales_orders').doc(orderId).get();
        if (d.exists) order = {id:d.id,...d.data()};
      } catch(e) {}
    }

    const num = order?.number || await generateRouteNumber();
    _routeExpenses = (order?.routeExpenses || [
      { type:'fuel',   amount:0, note:'Паливо' },
      { type:'road',   amount:0, note:'Дорога/платні' },
      { type:'driver', amount:0, note:'Оплата водія' },
    ]).map(e=>({...e}));

    const overlay = document.createElement('div');
    overlay.id = 'salesRouteOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:1vh;overflow-y:auto;';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;width:min(720px,98vw);padding:1.5rem;margin-bottom:2rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">🚛 ${order?'Редагувати рейс':'Новий рейс'} <span id="slRteNumDisplay">${esc(num)}</span></h3>
          <button onclick="document.getElementById('salesRouteOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af">✕</button>
        </div>

        <!-- Route info -->
        <div style="background:#f0f9ff;border-radius:8px;padding:1rem;margin-bottom:1rem">
          <b style="font-size:.85rem;color:#0369a1">🗺 Маршрут</b>
          <div style="display:grid;grid-template-columns:1fr 40px 1fr;gap:.5rem;align-items:center;margin-top:.75rem">
            <div>
              <label class="sl-label">Звідки</label>
              <input id="slRteFrom" class="sl-inp" placeholder="Київ" value="${esc(order?.routeFrom||'')}">
            </div>
            <div style="text-align:center;font-size:1.2rem;margin-top:1rem">→</div>
            <div>
              <label class="sl-label">Куди</label>
              <input id="slRteTo" class="sl-inp" placeholder="Львів" value="${esc(order?.routeTo||'')}">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:.5rem;margin-top:.75rem">
            <div>
              <label class="sl-label">Дата відправки</label>
              <input id="slRteDate" class="sl-inp" type="date" value="${order?.date||todayISO()}">
            </div>
            <div>
              <label class="sl-label">Вантаж</label>
              <input id="slRteCargo" class="sl-inp" placeholder="Будматеріали" value="${esc(order?.notes?.match(/Вантаж:\s*([^·]+)/)?.[1]?.trim()||'')}">
            </div>
            <div>
              <label class="sl-label">Вага (т)</label>
              <input id="slRteWeight" class="sl-inp" type="number" min="0" step="0.1" value="${order?.cargoWeight||''}" placeholder="5">
            </div>
            <div>
              <label class="sl-label">Об'єм (м³)</label>
              <input id="slRteVolume" class="sl-inp" type="number" min="0" step="0.1" value="${order?.cargoVolume||''}" placeholder="20">
            </div>
          </div>
        </div>

        <!-- Driver + vehicle -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">Водій</label>
            <select id="slRteDriver" class="sl-inp">
              <option value="">— вибрати водія —</option>
              ${_staff.map(s=>`<option value="${s.id}" ${order?.driverId===s.id?'selected':''}>${esc(s.name)} ${esc(s.role?'('+s.role+')':'')}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="sl-label">Держ. номер авто</label>
            <input id="slRteVehiclePlate" class="sl-inp" placeholder="AA1234BC" value="${esc(order?.vehiclePlate||'')}">
          </div>
        </div>

        <!-- Client + tariff -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div style="grid-column:1/3">
            <label class="sl-label">Клієнт (вантажовідправник)</label>
            <input id="slRteClient" class="sl-inp" placeholder="ТОВ БудМайстер" value="${esc(order?.clientName||'')}" list="slRteClientList">
            <datalist id="slRteClientList">${_clients.map(c=>`<option value="${esc(c.name||c.fullName||'')}">`).join('')}</datalist>
          </div>
          <div>
            <label class="sl-label">Тариф перевезення ₴</label>
            <input id="slRteTariff" class="sl-inp" type="number" min="0" value="${order?.total||''}" placeholder="8500" oninput="window._salesRteRecalc()">
          </div>
        </div>

        <!-- Expenses -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">💸 Витрати рейсу</b>
            <button onclick="window._salesRteAddExpense()" class="sl-btn-sm" style="background:#fef2f2;color:#dc2626">+ Витрата</button>
          </div>
          <div id="slRteExpensesList"></div>
        </div>

        <!-- P&L summary -->
        <div style="background:#f8fafc;border-radius:8px;padding:1rem;margin-bottom:1rem">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;text-align:center">
            <div>
              <div style="font-size:.7rem;color:#6b7280;margin-bottom:3px">ДОХІД</div>
              <div style="font-size:1.1rem;font-weight:700;color:#10b981" id="slRteRevDisplay">0 ₴</div>
            </div>
            <div>
              <div style="font-size:.7rem;color:#6b7280;margin-bottom:3px">ВИТРАТИ</div>
              <div style="font-size:1.1rem;font-weight:700;color:#ef4444" id="slRteExpDisplay">0 ₴</div>
            </div>
            <div>
              <div style="font-size:.7rem;color:#6b7280;margin-bottom:3px">ПРИБУТОК</div>
              <div style="font-size:1.1rem;font-weight:700" id="slRteProfitDisplay">0 ₴</div>
            </div>
          </div>
          <div style="text-align:center;margin-top:.5rem;font-size:.78rem;color:#9ca3af">Маржа: <span id="slRteMarginDisplay" style="font-weight:600">0%</span></div>
        </div>

        <!-- Status -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
          <div>
            <label class="sl-label">Статус</label>
            <select id="slRteStatus" class="sl-inp">
              ${[['draft',window.t('чернетка')],['sent',window.t('підтверджено')],['paid',window.t('оплаченоКлієнтом')],['closed',window.t('рейсЗакрито')]].map(([v,l])=>`<option value="${v}" ${(order?.status||'draft')===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="sl-label">Оплата</label>
            <select id="slRtePayMethod" class="sl-inp">
              ${[['transfer',window.t('безготівка')],['cash',window.t('готівка1')],['terminal',window.t('термінал1')]].map(([v,l])=>`<option value="${v}" ${(order?.paymentMethod||'transfer')===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="document.getElementById('salesRouteOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">Скасувати</button>
          <button onclick="window._salesSaveRoute('${orderId||''}',false)" class="sl-btn" style="background:#6366f1;color:#fff">💾 Зберегти</button>
          <button onclick="window._salesSaveRoute('${orderId||''}',true)" class="sl-btn" style="background:#10b981;color:#fff">✓ Закрити рейс</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    renderRouteExpenses();
    window._salesRteRecalc();
  };

  // ── expenses list ──────────────────────────────────────────────────────────
  function renderRouteExpenses() {
    const cont = document.getElementById('slRteExpensesList');
    if (!cont) return;
    const typeLabels = { fuel:'⛽ Паливо', road:'🛣 Дорога/платні', driver:'👤 Водій', other:'📝 Інше' };
    cont.innerHTML = _routeExpenses.map((exp, idx) => `
      <div style="display:grid;grid-template-columns:130px 1fr 110px 30px;gap:.5rem;align-items:center;margin-bottom:.4rem">
        <select class="sl-inp-sm" onchange="window._salesRteExpChange(${idx},'type',this.value)">
          ${Object.entries(typeLabels).map(([v,l])=>`<option value="${v}" ${exp.type===v?'selected':''}>${l}</option>`).join('')}
        </select>
        <input class="sl-inp-sm" value="${esc(exp.note||'')}" onchange="window._salesRteExpChange(${idx},'note',this.value)" placeholder="Коментар">
        <input class="sl-inp-sm" type="number" min="0" value="${exp.amount||0}" onchange="window._salesRteExpChange(${idx},'amount',+this.value)" style="text-align:right" placeholder="0">
        <button onclick="window._salesRteRemoveExp(${idx})" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:1.1rem">×</button>
      </div>
    `).join('') || '<div style="color:#9ca3af;font-size:.8rem">Немає витрат</div>';
  }

  window._salesRteExpChange = function(idx, field, val) {
    if (_routeExpenses[idx]) { _routeExpenses[idx][field] = val; renderRouteExpenses(); window._salesRteRecalc(); }
  };
  window._salesRteRemoveExp = function(idx) {
    _routeExpenses.splice(idx,1); renderRouteExpenses(); window._salesRteRecalc();
  };
  window._salesRteAddExpense = function() {
    _routeExpenses.push({ type:'other', amount:0, note:'' });
    renderRouteExpenses(); window._salesRteRecalc();
  };

  window._salesRteRecalc = function() {
    const tariff  = parseFloat(document.getElementById('slRteTariff')?.value)||0;
    const expTotal = _routeExpenses.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    const profit   = tariff - expTotal;
    const margin   = tariff > 0 ? Math.round(profit/tariff*100) : 0;

    const revEl = document.getElementById('slRteRevDisplay');
    const expEl = document.getElementById('slRteExpDisplay');
    const profEl= document.getElementById('slRteProfitDisplay');
    const marEl = document.getElementById('slRteMarginDisplay');

    if (revEl) revEl.textContent = fmt(tariff)+' ₴';
    if (expEl) expEl.textContent = fmt(expTotal)+' ₴';
    if (profEl) {
      profEl.textContent = fmt(profit)+' ₴';
      profEl.style.color = profit >= 0 ? '#10b981' : '#ef4444';
    }
    if (marEl) {
      marEl.textContent = margin+'%';
      marEl.style.color = margin >= 30 ? '#10b981' : margin >= 0 ? '#f59e0b' : '#ef4444';
    }
  };

  // ── save route ────────────────────────────────────────────────────────────
  window._salesSaveRoute = async function(orderId, markClosed) {
    const from    = document.getElementById('slRteFrom')?.value?.trim()||'';
    const to      = document.getElementById('slRteTo')?.value?.trim()||'';
    const tariff  = parseFloat(document.getElementById('slRteTariff')?.value)||0;

    if (!from || !to) { toast('Вкажіть маршрут (звідки/куди)', 'warn'); return; }
    if (!tariff)      { toast('Вкажіть тариф перевезення', 'warn'); return; }

    const driverId = document.getElementById('slRteDriver')?.value||'';
    const driver   = _staff.find(s=>s.id===driverId);
    const clientName = document.getElementById('slRteClient')?.value?.trim()||'';
    const clientObj  = _clients.find(c=>(c.name||c.fullName||'').toLowerCase()===clientName.toLowerCase());
    const date       = document.getElementById('slRteDate')?.value||todayISO();
    const cargo      = document.getElementById('slRteCargo')?.value?.trim()||'';
    const weight     = parseFloat(document.getElementById('slRteWeight')?.value)||0;
    const volume     = parseFloat(document.getElementById('slRteVolume')?.value)||0;
    const vehiclePlate= document.getElementById('slRteVehiclePlate')?.value?.trim()||'';
    const status     = markClosed ? 'closed' : (document.getElementById('slRteStatus')?.value||'draft');
    const payMethod  = document.getElementById('slRtePayMethod')?.value||'transfer';

    const expenses   = _routeExpenses.filter(e=>e.amount>0);
    const expTotal   = expenses.reduce((s,e)=>s+e.amount,0);
    const profit     = tariff - expTotal;
    const numEl      = document.getElementById('slRteNumDisplay');
    const num        = numEl?.textContent || await generateRouteNumber();

    const isPaid = markClosed || status==='paid' || status==='closed';

    const data = {
      type: 'route', number: num, status,
      clientId:    clientObj?.id||'',
      clientName,  clientPhone: clientObj?.phone||'',
      date,
      routeFrom: from, routeTo: to,
      cargoWeight: weight, cargoVolume: volume,
      items: [{
        id: '1', name: `Перевезення ${from}–${to}`,
        qty: 1, unit: 'рейс', price: tariff, discount: 0, total: tariff,
      }],
      subtotal: tariff, discountTotal: 0, total: tariff,
      paymentMethod: payMethod,
      paymentStatus: isPaid ? 'paid' : 'unpaid',
      paidAmount:    isPaid ? tariff : 0,
      driverId,
      driverName:    driver?.name||'',
      vehiclePlate,
      routeExpenses: expenses,
      routeProfit:   Math.round(profit*100)/100,
      notes: cargo ? `Вантаж: ${cargo} · ${weight}т · ${volume}м³` : '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      let savedId = orderId;
      if (orderId) {
        await col('sales_orders').doc(orderId).update(data);
      } else {
        data.isDemo = false;
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.createdBy = window.currentUser?.uid||'';
        const ref = await col('sales_orders').add(data);
        savedId = ref.id;
      }

      if (isPaid) {
        try {
          const txRef = col('finance_transactions').doc();
          await txRef.set({
            type: 'income', amount: tariff,
            categoryName: 'Виручка (реалізація)',
            note: `Рейс ${num} ${from}–${to} · ${clientName}`.trim(),
            date, sourceModule:'sales', sourceId: savedId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          // Log driver expenses too
          if (expenses.length) {
            const expTxRef = col('finance_transactions').doc();
            await expTxRef.set({
              type: 'expense', amount: expTotal,
              categoryName: 'Витрати на рейс',
              note: `Рейс ${num} витрати: ${expenses.map(e=>e.note||e.type).join(', ')}`,
              date, sourceModule:'sales', sourceId: savedId,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
          }
          await col('sales_orders').doc(savedId).update({ financeTransactionId: txRef.id });
        } catch(e) { console.warn('route finance:', e); }
      }

      toast(markClosed ? 'Рейс закрито' : 'Рейс збережено');
      document.getElementById('salesRouteOverlay')?.remove();
      if (typeof window._salesLoadOrdersExternal === 'function') window._salesLoadOrdersExternal();
    } catch(e) { toast('Помилка: '+e.message,'error'); }
  };

  // ── routes panel (subtab view) ────────────────────────────────────────────
  window.renderRoutesPanel = async function() {
    const cont = document.getElementById('salesRoutesContent');
    if (!cont) return;
    try {
      const snap = await col('sales_orders').where('type','==','route').orderBy('createdAt','desc').limit(50).get();
      const routes = snap.docs.map(d=>({id:d.id,...d.data()}));

      const statusColors = { draft:'#9ca3af', sent:'#3b82f6', paid:'#10b981', closed:'#6366f1', cancelled:'#ef4444' };
      const statusLabels = { draft:'Чернетка', sent:'Підтверджено', paid:'Оплачено', closed:'Закрито', cancelled:'Скасовано' };

      cont.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <b>Журнал рейсів</b>
          <button onclick="window._salesOpenRouteForm(null)" class="sl-btn" style="background:#0369a1;color:#fff">+ Новий рейс</button>
        </div>
        ${!routes.length ? '<div style="text-align:center;padding:2rem;color:#9ca3af">Немає рейсів</div>' : `
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:.83rem">
            <thead><tr style="background:#f0f9ff">
              <th style="padding:8px;text-align:left;color:#0369a1;font-weight:600">Номер</th>
              <th style="padding:8px;text-align:left;color:#0369a1;font-weight:600">Маршрут</th>
              <th style="padding:8px;text-align:left;color:#0369a1;font-weight:600">Клієнт</th>
              <th style="padding:8px;text-align:left;color:#0369a1;font-weight:600">Водій</th>
              <th style="padding:8px;text-align:right;color:#0369a1;font-weight:600">Тариф</th>
              <th style="padding:8px;text-align:right;color:#0369a1;font-weight:600">Витрати</th>
              <th style="padding:8px;text-align:right;color:#0369a1;font-weight:600">Прибуток</th>
              <th style="padding:8px;text-align:center;color:#0369a1;font-weight:600">Статус</th>
              <th style="padding:8px;width:40px"></th>
            </tr></thead>
            <tbody>
              ${routes.map(r => {
                const expTotal = (r.routeExpenses||[]).reduce((s,e)=>s+(e.amount||0),0);
                const profit   = r.routeProfit !== undefined ? r.routeProfit : (r.total||0) - expTotal;
                const sc = statusColors[r.status]||'#9ca3af';
                return `
                  <tr style="border-bottom:1px solid #f3f4f6;cursor:pointer" onclick="window._salesOpenRouteForm('${r.id}')">
                    <td style="padding:8px;font-weight:600">${esc(r.number||'—')}</td>
                    <td style="padding:8px">${esc(r.routeFrom||'')} → ${esc(r.routeTo||'')}</td>
                    <td style="padding:8px;color:#6b7280">${esc(r.clientName||'—')}</td>
                    <td style="padding:8px;color:#6b7280">${esc(r.driverName||'—')}</td>
                    <td style="padding:8px;text-align:right;font-weight:600">${fmt(r.total)} ₴</td>
                    <td style="padding:8px;text-align:right;color:#ef4444">${fmt(expTotal)} ₴</td>
                    <td style="padding:8px;text-align:right;font-weight:700;color:${profit>=0?'#10b981':'#ef4444'}">${fmt(profit)} ₴</td>
                    <td style="padding:8px;text-align:center"><span style="color:${sc};font-weight:600;font-size:.75rem">${statusLabels[r.status]||r.status}</span></td>
                    <td style="padding:8px;text-align:center"><button onclick="event.stopPropagation();window._salesOpenRouteForm('${r.id}')" style="background:#eef2ff;border:none;color:#6366f1;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:.75rem">✏️</button></td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`}
      `;
    } catch(e) { console.warn('renderRoutesPanel:', e); }
  };

  console.log('[104e] sales-routes module loaded');
})();
