/**
 * 107-sales-realizations.js — Документ реалізації
 * TALKO SaaS — Фаза 1/2
 * Колекція: companies/{cid}/sales_realizations
 */
(function () {
  'use strict';

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
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function el(id) { return document.getElementById(id); }
  function toast(msg, type) { if (typeof window.showToast==='function') window.showToast(msg,type||'success'); }
  function canManage() { const r=window.currentUserData?.role; return r==='owner'||r==='manager'||r==='admin'; }
  function serverTs() { return firebase.firestore.FieldValue.serverTimestamp(); }

  const COL='sales_realizations', COL_ORD='sales_purchase_orders', COL_DEBT='sales_debtors', COL_WS='warehouse_stock', COL_WOP='warehouse_operations';

  const STATUS_CFG = {
    draft:     { label:()=>tg('Чернетка','Draft'),    color:'#6b7280', bg:'#f3f4f6' },
    posted:    { label:()=>tg('Проведено','Posted'),  color:'#059669', bg:'#d1fae5' },
    cancelled: { label:()=>tg('Скасовано','Cancelled'),color:'#dc2626',bg:'#fee2e2' },
  };

  const S = { realizations:[], warehouses:[], stock:{}, clients:[], saving:false, modalItems:[], editingId:null, sourceOrder:null };

  async function loadRealizations() {
    if (!cid()) return;
    try {
      const snap = await col(COL).orderBy('createdAt','desc').limit(300).get();
      S.realizations = snap.docs.map(d=>({id:d.id,...d.data()}));
      renderList(); renderStats();
    } catch(e) { console.warn('107:',e.message); }
  }

  async function loadWarehouseData() {
    if (!cid()) return;
    try {
      const [iS,sS] = await Promise.all([col('warehouse_items').limit(500).get(), col(COL_WS).limit(500).get()]);
      S.warehouses = iS.docs.map(d=>({id:d.id,...d.data()}));
      S.stock={};
      sS.docs.forEach(d=>{S.stock[d.id]=d.data();});
    } catch(e) { console.warn('107 wh:',e.message); }
  }

  async function loadClients() {
    if (!cid()) return;
    try {
      const snap = await col('crm_clients').orderBy('name').limit(500).get();
      S.clients = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) { console.warn('107 cl:',e.message); }
  }

  async function generateNumber() {
    const year=new Date().getFullYear();
    try {
      const snap=await col(COL).orderBy('createdAt','desc').limit(1).get();
      let seq=1;
      if (!snap.empty){const m=(snap.docs[0].data().number||'').match(/(\d+)$/);if(m)seq=parseInt(m[1])+1;}
      return `REA-${year}-${String(seq).padStart(4,'0')}`;
    } catch(e){return `REA-${year}-${String(Date.now()).slice(-4)}`;}
  }

  function deriveType(items){const g=items.some(i=>i.warehouseItemId),s=items.some(i=>!i.warehouseItemId);return g&&s?'mixed':g?'goods':'services';}

  function renderStats(){
    const wrap=el('srStatsWrap'); if(!wrap) return;
    const all=S.realizations, posted=all.filter(r=>r.status==='posted'), rev=posted.reduce((s,r)=>s+Number(r.totalAmount||0),0);
    const drafts=all.filter(r=>r.status==='draft').length, today=todayISO();
    const overdue=all.filter(r=>r.status==='draft'&&r.paymentDueDate&&r.paymentDueDate<today).length;
    wrap.innerHTML=`
      <div class="sr-stat"><div class="sr-stat-lbl">${tg('Проведено','Posted')}</div><div class="sr-stat-val" style="color:#059669">${posted.length}</div></div>
      <div class="sr-stat"><div class="sr-stat-lbl">${tg('Чернетки','Drafts')}</div><div class="sr-stat-val" style="color:#d97706">${drafts}</div></div>
      <div class="sr-stat"><div class="sr-stat-lbl">${tg('Прострочені','Overdue')}</div><div class="sr-stat-val" style="color:#dc2626">${overdue}</div></div>
      <div class="sr-stat"><div class="sr-stat-lbl">${tg('Виручка','Revenue')}</div><div class="sr-stat-val">${fmt(rev)} <span style="font-size:.72rem;color:#9ca3af">UAH</span></div></div>`;
  }

  function renderList(){
    const wrap=el('srListWrap'); if(!wrap) return;
    if(!S.realizations.length){
      wrap.innerHTML=`<div style="text-align:center;padding:3rem;color:#9ca3af"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="margin-bottom:12px;opacity:.4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><div style="font-size:.9rem">${tg('Реалізацій немає','No realizations yet')}</div>${canManage()?`<button onclick="window.openSalesRealizationModal()" style="margin-top:12px;padding:8px 18px;background:#059669;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.85rem;font-weight:600">+ ${tg('Нова реалізація','New realization')}</button>`:''}</div>`;
      return;
    }
    const today=todayISO();
    const typeL={goods:tg('Товари','Goods'),services:tg('Послуги','Services'),mixed:tg('Змішане','Mixed')};
    wrap.innerHTML=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.84rem">
      <thead><tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb">
        <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">№</th>
        <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Клієнт','Client')}</th>
        <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Тип','Type')}</th>
        <th style="padding:10px 12px;text-align:right;font-weight:600;color:#6b7280">${tg('Сума','Amount')}</th>
        <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Статус','Status')}</th>
        <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Дата','Date')}</th>
        <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Оплата до','Due')}</th>
        <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Дії','Actions')}</th>
      </tr></thead>
      <tbody>${S.realizations.map((r,i)=>{
        const sc=STATUS_CFG[r.status]||STATUS_CFG.draft;
        const tc=typeL[r.type]||r.type||'—';
        const dt=r.realizationDate||(r.createdAt?.toDate?r.createdAt.toDate().toLocaleDateString('uk-UA'):'—');
        const due=r.paymentDueDate||'—';
        const isOver=r.status==='draft'&&r.paymentDueDate&&r.paymentDueDate<today;
        const cur=r.currency||'UAH';
        const acts=[];
        if(canManage()){
          if(r.status==='draft'){
            acts.push(`<button onclick="window._srPost('${r.id}')" style="padding:4px 8px;border:none;border-radius:5px;cursor:pointer;font-size:.75rem;font-weight:600;background:#d1fae5;color:#059669">${tg('Провести','Post')}</button>`);
            acts.push(`<button onclick="window.openSalesRealizationModal('${r.id}')" style="padding:4px 6px;border:1px solid #e5e7eb;border-radius:5px;cursor:pointer;background:#fff;color:#6b7280"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`);
          }
          if(r.status==='posted'&&r.pdfUrl) acts.push(`<a href="${esc(r.pdfUrl)}" target="_blank" style="padding:4px 8px;border:none;border-radius:5px;font-size:.75rem;font-weight:600;background:#dbeafe;color:#2563eb;text-decoration:none">PDF</a>`);
        }
        return `<tr style="border-bottom:1px solid #f1f5f9;${i%2?'background:#fafbfc':''}" onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='${i%2?'#fafbfc':''}'">
          <td style="padding:10px 12px;font-weight:600;color:#059669;white-space:nowrap">${esc(r.number||'—')}</td>
          <td style="padding:10px 12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.clientName||'—')}</td>
          <td style="padding:10px 12px;text-align:center;font-size:.78rem;color:#6b7280">${esc(tc)}</td>
          <td style="padding:10px 12px;text-align:right;font-weight:600;white-space:nowrap">${fmt(r.totalAmount)} <span style="font-size:.75rem;color:#9ca3af">${esc(cur)}</span></td>
          <td style="padding:10px 12px;text-align:center"><span style="padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;background:${sc.bg};color:${sc.color}">${sc.label()}</span></td>
          <td style="padding:10px 12px;font-size:.8rem;color:#374151;white-space:nowrap">${esc(typeof dt==='string'?dt:new Date(dt).toLocaleDateString('uk-UA'))}</td>
          <td style="padding:10px 12px;font-size:.8rem;white-space:nowrap;${isOver?'color:#dc2626;font-weight:600':''}">${esc(due)}</td>
          <td style="padding:10px 12px;text-align:center"><div style="display:flex;gap:4px;justify-content:center">${acts.join('')}</div></td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
  }

  function buildUI(){
    const wrap=el('srRootWrap'); if(!wrap) return;
    wrap.innerHTML=`
      <style>
        .sr-stat{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 18px;min-width:130px;flex:1}
        .sr-stat-lbl{font-size:.71rem;color:#9ca3af;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
        .sr-stat-val{font-size:1.3rem;font-weight:700;color:#111}
        .sr-inp{border:1px solid #e5e7eb;border-radius:6px;padding:7px 10px;font-size:.84rem;outline:none;box-sizing:border-box}
        .sr-inp:focus{border-color:#059669;box-shadow:0 0 0 2px rgba(5,150,105,.12)}
      </style>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding:1rem 1rem 0">
        <h3 style="margin:0;font-size:1rem;font-weight:700">${tg('Реалізації','Realizations')}</h3>
        ${canManage()?`<button onclick="window.openSalesRealizationModal()" style="padding:8px 16px;background:#059669;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.84rem;font-weight:600;display:flex;align-items:center;gap:6px"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>${tg('Нова реалізація','New realization')}</button>`:''}
      </div>
      <div id="srStatsWrap" style="display:flex;gap:.75rem;flex-wrap:wrap;padding:.75rem 1rem"></div>
      <div id="srListWrap" style="padding:0 1rem 1rem"></div>`;
    renderStats(); renderList();
  }

  function buildModal(realization, sourceOrder){
    const isEdit=!!realization, r=realization||{}, o=sourceOrder||{};
    const srcItems=r.items||o.items||[];
    S.modalItems=srcItems.map(i=>({...i,_id:Date.now()+Math.random()}));
    if(!S.modalItems.length) S.modalItems=[{_id:Date.now(),name:'',qty:1,price:0,unit:'шт',warehouseItemId:null,discount:0}];
    const paymentCondition=r.paymentCondition||o.paymentCondition||'prepay';
    const payDays=Number(r.paymentDueDays||o.paymentDueDays||0);
    const defaultDueDate=paymentCondition!=='prepay'?new Date(Date.now()+payDays*86400000).toISOString().slice(0,10):'';
    const clientOptions=S.clients.map(c=>`<option value="${c.id}" data-name="${esc(c.name)}" ${(r.clientId||o.clientId)===c.id?'selected':''}>${esc(c.name)}</option>`).join('');
    return `<div id="srModalOverlay" onclick="if(event.target===this)window.closeSalesRealizationModal()" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;">
      <div style="background:#fff;border-radius:14px;width:100%;max-width:860px;box-shadow:0 20px 60px rgba(0,0,0,.2);margin:auto" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #f1f5f9">
          <div>
            <div style="font-size:1rem;font-weight:700">${isEdit?tg('Редагувати реалізацію','Edit realization'):tg('Нова реалізація','New realization')}</div>
            ${isEdit?`<div style="font-size:.78rem;color:#9ca3af;margin-top:2px">${esc(r.number||'')}</div>`:''}
            ${o.number?`<div style="font-size:.78rem;color:#059669;margin-top:2px">${tg('Із замовлення','From order')}: ${esc(o.number)}</div>`:''}
          </div>
          <button onclick="window.closeSalesRealizationModal()" style="border:none;background:none;cursor:pointer;color:#9ca3af"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style="padding:20px 24px">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px">
            <div><label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Клієнт *','Client *')}</label>
              <select id="srFldClient" class="sr-inp" style="width:100%"><option value="">${tg('— оберіть —','— select —')}</option>${clientOptions}</select></div>
            <div><label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Дата реалізації','Date')}</label>
              <input id="srFldDate" type="date" class="sr-inp" style="width:100%" value="${r.realizationDate||todayISO()}"></div>
            <div><label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Дата оплати','Due date')}</label>
              <input id="srFldDueDate" type="date" class="sr-inp" style="width:100%" value="${r.paymentDueDate||defaultDueDate}"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div><label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Валюта','Currency')}</label>
              <select id="srFldCurrency" class="sr-inp" style="width:100%">${['UAH','USD','EUR','PLN'].map(c=>`<option value="${c}" ${(r.currency||o.currency||'UAH')===c?'selected':''}>${c}</option>`).join('')}</select></div>
            <div style="display:flex;align-items:center;padding-top:22px">
              <input type="checkbox" id="srPartialToggle" onchange="window._srRenderItems()" style="width:15px;height:15px;cursor:pointer;margin-right:8px" ${r.isPartial?'checked':''}>
              <label for="srPartialToggle" style="font-size:.82rem;color:#374151;cursor:pointer">${tg('Часткова реалізація','Partial realization')}</label>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div style="font-size:.82rem;font-weight:600;color:#374151">${tg('Позиції','Items')}</div>
            <button onclick="window._srAddItem()" style="padding:5px 12px;border:1px dashed #059669;border-radius:6px;cursor:pointer;background:#f0fdf4;color:#059669;font-size:.78rem;font-weight:600">+ ${tg('Додати','Add')}</button>
          </div>
          <div id="srItemsWrap" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:14px">
            <table style="width:100%;border-collapse:collapse;font-size:.82rem">
              <thead><tr style="background:#f8fafc">
                <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280;width:38%">${tg('Назва / Товар','Name / Item')}</th>
                <th style="padding:8px 6px;text-align:center;font-weight:600;color:#6b7280;width:90px">${tg('К-сть','Qty')}</th>
                <th style="padding:8px 6px;text-align:center;font-weight:600;color:#6b7280;width:58px">${tg('Од.','Unit')}</th>
                <th style="padding:8px 6px;text-align:right;font-weight:600;color:#6b7280;width:110px">${tg('Ціна','Price')}</th>
                <th style="padding:8px 6px;text-align:right;font-weight:600;color:#6b7280;width:110px">${tg('Сума','Total')}</th>
                <th style="padding:8px 6px;width:34px"></th>
              </tr></thead>
              <tbody id="srItemsTbody"></tbody>
            </table>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
            <div style="min-width:240px"><div style="display:flex;justify-content:space-between;padding:8px 0;font-size:1rem;font-weight:700"><span>${tg('Сума:','Total:')}</span><span id="srTotalAmount" style="color:#059669">0.00</span></div></div>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;font-size:.82rem;color:#065f46;margin-bottom:14px">
            ${paymentCondition==='prepay'?'💳 '+tg('Передоплата — дебіторка не відкривається','Prepayment — no receivable will be opened'):`💰 ${tg('Відстрочка','Deferred')} ${payDays} ${tg('дн. — після проведення відкриється дебіторка','days — receivable will be opened after posting')}`}
          </div>
          <div><label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Коментар','Note')}</label>
            <textarea id="srFldNote" class="sr-inp" rows="2" style="width:100%;resize:vertical">${esc(r.note||o.note||'')}</textarea></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid #f1f5f9">
          <button onclick="window.closeSalesRealizationModal()" style="padding:9px 20px;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;background:#fff;font-size:.85rem;font-weight:600;color:#374151">${tg('Скасувати','Cancel')}</button>
          <button onclick="window._srSave(false)" id="srSaveBtn" style="padding:9px 20px;border:1px solid #059669;border-radius:7px;cursor:pointer;background:#fff;color:#059669;font-size:.85rem;font-weight:600">${tg('Зберегти чернетку','Save draft')}</button>
          <button onclick="window._srSave(true)" id="srPostBtn" style="padding:9px 24px;background:#059669;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.85rem;font-weight:700">${tg('Провести','Post')}</button>
        </div>
      </div>
    </div>`;
  }

  function renderModalItems(){
    const tbody=el('srItemsTbody'); if(!tbody) return;
    tbody.innerHTML=S.modalItems.map((item,idx)=>{
      const wOpts=S.warehouses.map(wi=>{const st=S.stock[wi.id];const avail=Math.max(0,Number(st?.quantity||0)-Number(st?.reserved||0));return `<option value="${wi.id}" data-price="${wi.price||wi.sellPrice||0}" data-unit="${esc(wi.unit||'шт')}" ${item.warehouseItemId===wi.id?'selected':''}>${esc(wi.name||wi.title)} (${avail})</option>`;}).join('');
      const lt=Number(item.qty||1)*Number(item.price||0)*(1-Number(item.discount||0)/100);
      return `<tr style="border-bottom:1px solid #f1f5f9" data-idx="${idx}">
        <td style="padding:6px 10px">
          <select class="sr-inp" style="width:100%;font-size:.8rem;margin-bottom:4px" onchange="window._srItemWarehouse(${idx},this)"><option value="">${tg('— послуга —','— service —')}</option>${wOpts}</select>
          <input class="sr-inp" style="width:100%;font-size:.8rem" placeholder="${tg('Назва','Name')}" value="${esc(item.name||'')}" oninput="window._srItemField(${idx},'name',this.value)">
        </td>
        <td style="padding:6px;text-align:center"><input type="number" class="sr-inp" style="width:78px;text-align:center" value="${item.qty||1}" min="0.001" step="0.001" oninput="window._srItemField(${idx},'qty',this.value)">
          ${item._origQty?`<div style="font-size:.65rem;color:#9ca3af;margin-top:2px">${tg('із','of')} ${item._origQty}</div>`:''}</td>
        <td style="padding:6px;text-align:center"><input class="sr-inp" style="width:52px;text-align:center" value="${esc(item.unit||'шт')}" oninput="window._srItemField(${idx},'unit',this.value)"></td>
        <td style="padding:6px"><input type="number" class="sr-inp" style="width:100px;text-align:right" value="${item.price||0}" min="0" step="0.01" oninput="window._srItemField(${idx},'price',this.value)"></td>
        <td style="padding:6px;text-align:right;font-weight:600;white-space:nowrap">${fmt(lt)}</td>
        <td style="padding:6px;text-align:center">${S.modalItems.length>1?`<button onclick="window._srRemoveItem(${idx})" style="border:none;background:none;cursor:pointer;color:#dc2626;padding:2px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>`:''}</td>
      </tr>`;
    }).join('');
    updateModalTotals();
  }

  function updateModalTotals(){
    let t=0; S.modalItems.forEach(i=>{t+=Number(i.qty||1)*Number(i.price||0)*(1-Number(i.discount||0)/100);});
    const cur=el('srFldCurrency')?.value||'UAH';
    if(el('srTotalAmount')) el('srTotalAmount').textContent=fmt(t)+' '+cur;
  }

  window._srRenderItems=function(){renderModalItems();};

  window.openSalesRealizationModal=function(realizationId,sourceOrder){
    const realization=realizationId?S.realizations.find(r=>r.id===realizationId):null;
    S.editingId=realization?.id||null; S.sourceOrder=sourceOrder||null;
    el('srModalOverlay')?.remove();
    const div=document.createElement('div');
    div.innerHTML=buildModal(realization,sourceOrder||{});
    document.body.appendChild(div.firstElementChild);
    renderModalItems();
  };

  window.closeSalesRealizationModal=function(){
    el('srModalOverlay')?.remove(); S.editingId=null; S.sourceOrder=null; S.modalItems=[];
  };

  window._srItemWarehouse=function(idx,sel){
    const item=S.modalItems[idx]; if(!item) return;
    item.warehouseItemId=sel.value||null;
    if(sel.value){const opt=sel.options[sel.selectedIndex];item.price=parseFloat(opt.dataset.price)||0;item.unit=opt.dataset.unit||'шт';const wi=S.warehouses.find(w=>w.id===sel.value);if(wi&&!item.name)item.name=wi.name||wi.title||'';}
    renderModalItems();
  };

  window._srItemField=function(idx,field,value){
    const item=S.modalItems[idx]; if(!item) return;
    if(['qty','price','discount'].includes(field))item[field]=parseFloat(value)||0; else item[field]=value;
    updateModalTotals();
  };

  window._srAddItem=function(){S.modalItems.push({_id:Date.now(),name:'',qty:1,price:0,unit:'шт',warehouseItemId:null,discount:0});renderModalItems();};
  window._srRemoveItem=function(idx){S.modalItems.splice(idx,1);if(!S.modalItems.length)S.modalItems.push({_id:Date.now(),name:'',qty:1,price:0,unit:'шт',warehouseItemId:null,discount:0});renderModalItems();};

  window._srSave=async function(doPost){
    if(S.saving) return;
    const cSel=el('srFldClient'), clientId=cSel?.value||'';
    const clientName=cSel?.options[cSel?.selectedIndex]?.dataset?.name||S.clients.find(c=>c.id===clientId)?.name||'';
    if(!clientId){toast(tg('Оберіть клієнта','Select a client'),'error');return;}
    const valid=S.modalItems.filter(i=>i.name||i.warehouseItemId);
    if(!valid.length){toast(tg('Додайте позиції','Add items'),'error');return;}
    let total=0;
    const items=valid.map(i=>{const l=Number(i.qty||1)*Number(i.price||0)*(1-Number(i.discount||0)/100);total+=l;return{name:i.name||'',qty:Number(i.qty)||1,price:Number(i.price)||0,discount:Number(i.discount)||0,unit:i.unit||'шт',warehouseItemId:i.warehouseItemId||null,lineTotal:Math.round(l*100)/100};});
    total=Math.round(total*100)/100;
    const payload={clientId,clientName,type:deriveType(items),items,totalAmount:total,currency:el('srFldCurrency')?.value||'UAH',realizationDate:el('srFldDate')?.value||todayISO(),paymentDueDate:el('srFldDueDate')?.value||'',note:el('srFldNote')?.value||'',orderId:S.sourceOrder?.id||null,dealId:S.sourceOrder?.dealId||null,status:doPost?'posted':'draft',updatedAt:serverTs()};
    S.saving=true;
    const sBtn=el('srSaveBtn'),pBtn=el('srPostBtn');
    if(sBtn)sBtn.disabled=true; if(pBtn){pBtn.disabled=true;pBtn.textContent=tg('Проводимо...','Posting...');}
    try{
      let rid=S.editingId;
      if(rid){await col(COL).doc(rid).update(payload);}
      else{payload.number=await generateNumber();payload.createdBy=window.currentUserData?.id||'';payload.createdAt=serverTs();const ref=await col(COL).add(payload);rid=ref.id;}
      if(doPost)await _postRealization(rid,{...payload,number:payload.number||S.realizations.find(r=>r.id===rid)?.number||''});
      toast(doPost?tg('Реалізацію проведено','Realization posted'):tg('Чернетку збережено','Draft saved'));
      window.closeSalesRealizationModal();
      await loadRealizations();
    }catch(e){console.error('_srSave:',e);toast(tg('Помилка: ','Error: ')+e.message,'error');}
    finally{S.saving=false;if(sBtn)sBtn.disabled=false;if(pBtn){pBtn.disabled=false;pBtn.textContent=tg('Провести','Post');}}
  };

  async function _postRealization(rid,payload){
    const batch=db().batch(), cRef=db().collection('companies').doc(cid());
    for(const item of payload.items){
      if(!item.warehouseItemId) continue;
      const stockRef=cRef.collection(COL_WS).doc(item.warehouseItemId);
      const st=S.stock[item.warehouseItemId]||{};
      const nq=Math.max(0,Number(st.quantity||0)-Number(item.qty)), nr=Math.max(0,Number(st.reserved||0)-Number(item.qty));
      batch.update(stockRef,{quantity:nq,reserved:nr});
      batch.set(cRef.collection(COL_WOP).doc(),{type:'sale',itemId:item.warehouseItemId,itemName:item.name,qty:Number(item.qty),realizationId:rid,realizationNum:payload.number,clientName:payload.clientName,createdBy:window.currentUserData?.id||'',createdAt:serverTs()});
      if(S.stock[item.warehouseItemId]){S.stock[item.warehouseItemId].quantity=nq;S.stock[item.warehouseItemId].reserved=nr;}
    }
    let debtorEntryId=null;
    if(payload.paymentDueDate&&payload.totalAmount>0){
      const dRef=cRef.collection(COL_DEBT).doc(); debtorEntryId=dRef.id;
      batch.set(dRef,{clientId:payload.clientId,clientName:payload.clientName,realizationId:rid,realizationNum:payload.number,amount:payload.totalAmount,currency:payload.currency,dueDate:payload.paymentDueDate,status:'open',paidAmount:0,paidAt:null,createdAt:serverTs()});
    }
    if(payload.orderId) batch.update(cRef.collection(COL_ORD).doc(payload.orderId),{status:'completed',realizationId:rid,updatedAt:serverTs()});
    await batch.commit();
    await col(COL).doc(rid).update({status:'posted',debtorEntryId:debtorEntryId||null,updatedAt:serverTs()});
    if(typeof window.TALKO?.events?.emit==='function') window.TALKO.events.emit('REALIZATION_POSTED',{realizationId:rid,clientId:payload.clientId,totalAmount:payload.totalAmount,debtorEntryId});
  }

  window._srPost=async function(rid){
    if(!confirm(tg('Провести реалізацію? Товари будуть списані зі складу.','Post realization? Stock will be deducted.'))) return;
    const r=S.realizations.find(x=>x.id===rid); if(!r) return;
    try{await _postRealization(rid,r);toast(tg('Реалізацію проведено','Realization posted'));await loadRealizations();}
    catch(e){console.error('_srPost:',e);toast(tg('Помилка: ','Error: ')+e.message,'error');}
  };

  window.initSalesRealizations=async function(){
    if(!cid()){console.warn('107: no cid');return;}
    buildUI();
    await Promise.all([loadRealizations(),loadWarehouseData(),loadClients()]);
  };

})();
