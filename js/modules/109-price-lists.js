/**
 * 109-price-lists.js — Прайс-листи та правила знижок
 * TALKO SaaS — Фаза 3
 * Колекція: companies/{cid}/price_lists
 */
(function () {
  'use strict';

  function tg(ua, en) { const l=window.currentLang||window.currentUserData?.language||'ua'; return l==='en'?en:ua; }
  function db()  { return window.db||(window.firebase&&firebase.firestore()); }
  function cid() { return window.currentCompanyId||null; }
  function col(name) { if(!db()||!cid()) throw new Error('DB/cid not ready'); return db().collection('companies').doc(cid()).collection(name); }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
  function el(id) { return document.getElementById(id); }
  function toast(msg,type) { if(typeof window.showToast==='function') window.showToast(msg,type||'success'); }
  function serverTs() { return firebase.firestore.FieldValue.serverTimestamp(); }
  function isOwner() { return window.currentUserData?.role==='owner'; }

  const COL = 'price_lists';

  const S = { lists:[], warehouseItems:[], saving:false, editingId:null, modalRules:[], modalItems:[] };

  // ─── load ─────────────────────────────────────────────────────────────────
  async function loadPriceLists() {
    if (!cid()) return;
    try {
      const snap = await col(COL).orderBy('createdAt','desc').limit(100).get();
      S.lists = snap.docs.map(d=>({id:d.id,...d.data()}));
      renderList();
    } catch(e) { console.warn('109:',e.message); }
  }

  async function loadWarehouseItems() {
    if (!cid()) return;
    try {
      const snap = await col('warehouse_items').limit(500).get();
      S.warehouseItems = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) { console.warn('109 wh:',e.message); }
  }

  // ─── RENDER LIST ──────────────────────────────────────────────────────────
  function renderList() {
    const wrap = el('plListWrap'); if(!wrap) return;
    if(!S.lists.length) {
      wrap.innerHTML=`<div style="text-align:center;padding:3rem;color:#9ca3af">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="margin-bottom:12px;opacity:.4"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <div style="font-size:.9rem">${tg('Прайс-листів немає','No price lists yet')}</div>
        ${isOwner()?`<button onclick="window.openPriceListModal()" style="margin-top:12px;padding:8px 18px;background:#6366f1;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.85rem;font-weight:600">+ ${tg('Новий прайс','New price list')}</button>`:''}
      </div>`;
      return;
    }
    wrap.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${S.lists.map(pl=>renderCard(pl)).join('')}
    </div>`;
  }

  function renderCard(pl) {
    const itemsCount = (pl.items||[]).length;
    const rulesCount = (pl.discountRules||[]).length;
    return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:.95rem;font-weight:700;color:#111">${esc(pl.name||'—')}</div>
          <div style="font-size:.78rem;color:#9ca3af;margin-top:2px">${pl.currency||'UAH'}${pl.isDefault?` · <span style="color:#059669;font-weight:600">${tg('За замовч.','Default')}</span>`:''}</div>
        </div>
        ${isOwner()?`<div style="display:flex;gap:6px">
          <button onclick="window.openPriceListModal('${pl.id}')" style="padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;background:#fff;color:#6b7280;font-size:.75rem">${tg('Ред.','Edit')}</button>
          <button onclick="window._plDelete('${pl.id}')" style="padding:5px 8px;border:1px solid #fecaca;border-radius:6px;cursor:pointer;background:#fff;color:#dc2626;font-size:.75rem">${tg('Вид.','Del.')}</button>
        </div>`:''}
      </div>
      <div style="display:flex;gap:16px;font-size:.82rem;color:#6b7280">
        <div><span style="font-weight:600;color:#111">${itemsCount}</span> ${tg('позицій','items')}</div>
        <div><span style="font-weight:600;color:#111">${rulesCount}</span> ${tg('правил знижок','discount rules')}</div>
      </div>
      ${rulesCount>0?`<div style="margin-top:10px;padding:8px 10px;background:#f0fdf4;border-radius:6px;font-size:.78rem;color:#065f46">
        ${(pl.discountRules||[]).slice(0,3).map(r=>`від ${fmt(r.minAmount)} → -${r.discountPercent}%`).join(' · ')}
      </div>`:''}
    </div>`;
  }

  // ─── BUILD UI ─────────────────────────────────────────────────────────────
  function buildUI() {
    const wrap = el('plRootWrap'); if(!wrap) return;
    wrap.innerHTML=`
      <style>
        .pl-inp{border:1px solid #e5e7eb;border-radius:6px;padding:7px 10px;font-size:.84rem;outline:none;box-sizing:border-box}
        .pl-inp:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}
      </style>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding:1rem 1rem 0">
        <h3 style="margin:0;font-size:1rem;font-weight:700">${tg('Прайс-листи','Price Lists')}</h3>
        ${isOwner()?`<button onclick="window.openPriceListModal()" style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.84rem;font-weight:600;display:flex;align-items:center;gap:6px">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          ${tg('Новий прайс','New price list')}
        </button>`:''}
      </div>
      <div id="plListWrap" style="padding:1rem"></div>`;
    renderList();
  }

  // ─── MODAL ────────────────────────────────────────────────────────────────
  function buildModal(pl) {
    const isEdit=!!pl, p=pl||{};
    S.modalRules = JSON.parse(JSON.stringify(p.discountRules||[]));
    S.modalItems = JSON.parse(JSON.stringify(p.items||[]));

    const currencies = ['UAH','USD','EUR','PLN'];
    return `<div id="plModalOverlay" onclick="if(event.target===this)window.closePriceListModal()" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto">
      <div style="background:#fff;border-radius:14px;width:100%;max-width:780px;box-shadow:0 20px 60px rgba(0,0,0,.2);margin:auto" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #f1f5f9">
          <div style="font-size:1rem;font-weight:700">${isEdit?tg('Редагувати прайс','Edit price list'):tg('Новий прайс-лист','New price list')}</div>
          <button onclick="window.closePriceListModal()" style="border:none;background:none;cursor:pointer;color:#9ca3af"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style="padding:20px 24px">

          <!-- Основні поля -->
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:14px;margin-bottom:20px;align-items:end">
            <div>
              <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Назва прайсу *','Price list name *')}</label>
              <input id="plFldName" class="pl-inp" style="width:100%" placeholder="${tg('напр. Роздрібна','e.g. Retail')}" value="${esc(p.name||'')}">
            </div>
            <div>
              <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:4px">${tg('Валюта','Currency')}</label>
              <select id="plFldCurrency" class="pl-inp" style="width:100%">
                ${currencies.map(c=>`<option value="${c}" ${(p.currency||'UAH')===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div style="padding-bottom:2px">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:.82rem;color:#374151">
                <input type="checkbox" id="plFldDefault" ${p.isDefault?'checked':''} style="width:15px;height:15px">
                ${tg('За замовчуванням','Default')}
              </label>
            </div>
          </div>

          <!-- Правила знижок -->
          <div style="margin-bottom:20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <div style="font-size:.85rem;font-weight:600;color:#374151">${tg('Автоматичні знижки (по сумі замовлення)','Auto discounts (by order amount)')}</div>
              <button onclick="window._plAddRule()" style="padding:5px 12px;border:1px dashed #6366f1;border-radius:6px;cursor:pointer;background:#f5f3ff;color:#6366f1;font-size:.78rem;font-weight:600">+ ${tg('Додати правило','Add rule')}</button>
            </div>
            <div id="plRulesWrap">
              <div style="font-size:.8rem;color:#9ca3af;padding:8px 0">${tg('Немає правил — знижки застосовуються вручну','No rules — discounts applied manually')}</div>
            </div>
          </div>

          <!-- Ціни на позиції -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <div style="font-size:.85rem;font-weight:600;color:#374151">${tg('Ціни на товари/послуги','Item prices')}</div>
              <button onclick="window._plAddItem()" style="padding:5px 12px;border:1px dashed #059669;border-radius:6px;cursor:pointer;background:#f0fdf4;color:#059669;font-size:.78rem;font-weight:600">+ ${tg('Додати позицію','Add item')}</button>
            </div>
            <div id="plItemsWrap" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <table style="width:100%;border-collapse:collapse;font-size:.82rem">
                <thead><tr style="background:#f8fafc">
                  <th style="padding:8px 10px;text-align:left;font-weight:600;color:#6b7280">${tg('Товар/Послуга','Item/Service')}</th>
                  <th style="padding:8px 10px;text-align:right;font-weight:600;color:#6b7280">${tg('Ціна','Price')}</th>
                  <th style="padding:8px 10px;width:36px"></th>
                </tr></thead>
                <tbody id="plItemsTbody"></tbody>
              </table>
            </div>
          </div>

        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid #f1f5f9">
          <button onclick="window.closePriceListModal()" style="padding:9px 20px;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;background:#fff;font-size:.85rem;font-weight:600;color:#374151">${tg('Скасувати','Cancel')}</button>
          <button onclick="window._plSave()" id="plSaveBtn" style="padding:9px 24px;background:#6366f1;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.85rem;font-weight:700">${tg('Зберегти','Save')}</button>
        </div>
      </div>
    </div>`;
  }

  function renderModalRules() {
    const wrap = el('plRulesWrap'); if(!wrap) return;
    if(!S.modalRules.length) {
      wrap.innerHTML=`<div style="font-size:.8rem;color:#9ca3af;padding:8px 0">${tg('Немає правил — знижки застосовуються вручну','No rules — discounts applied manually')}</div>`;
      return;
    }
    wrap.innerHTML=S.modalRules.map((r,i)=>`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9" data-ridx="${i}">
        <div style="font-size:.8rem;color:#6b7280;white-space:nowrap">${tg('Від суми','From amount')}</div>
        <input type="number" class="pl-inp" style="width:120px" value="${r.minAmount||0}" min="0" step="100" oninput="window._plRuleField(${i},'minAmount',this.value)" placeholder="0">
        <div style="font-size:.8rem;color:#6b7280;white-space:nowrap">${tg('знижка','discount')}</div>
        <input type="number" class="pl-inp" style="width:80px" value="${r.discountPercent||0}" min="0" max="100" step="0.5" oninput="window._plRuleField(${i},'discountPercent',this.value)" placeholder="0">
        <div style="font-size:.8rem;color:#6b7280">%</div>
        <button onclick="window._plRemoveRule(${i})" style="border:none;background:none;cursor:pointer;color:#dc2626;padding:2px;margin-left:auto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
      </div>`).join('');
  }

  function renderModalItems() {
    const tbody = el('plItemsTbody'); if(!tbody) return;
    if(!S.modalItems.length) {
      tbody.innerHTML=`<tr><td colspan="3" style="padding:16px;text-align:center;color:#9ca3af;font-size:.82rem">${tg('Додайте позиції зі складу','Add items from warehouse')}</td></tr>`;
      return;
    }
    tbody.innerHTML=S.modalItems.map((item,i)=>{
      const wi = S.warehouseItems.find(w=>w.id===item.warehouseItemId);
      return `<tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:8px 10px">
          <select class="pl-inp" style="width:100%;font-size:.8rem" onchange="window._plItemWh(${i},this)">
            <option value="">${tg('— оберіть товар —','— select item —')}</option>
            ${S.warehouseItems.map(w=>`<option value="${w.id}" ${item.warehouseItemId===w.id?'selected':''}>${esc(w.name||w.title)}</option>`).join('')}
          </select>
        </td>
        <td style="padding:8px 10px">
          <input type="number" class="pl-inp" style="width:110px;text-align:right" value="${item.price||0}" min="0" step="0.01" oninput="window._plItemPrice(${i},this.value)">
        </td>
        <td style="padding:8px 10px;text-align:center">
          <button onclick="window._plRemoveItem(${i})" style="border:none;background:none;cursor:pointer;color:#dc2626;padding:2px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
        </td>
      </tr>`;
    }).join('');
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────
  window.openPriceListModal = function(plId) {
    const pl = plId ? S.lists.find(p=>p.id===plId) : null;
    S.editingId = pl?.id || null;
    el('plModalOverlay')?.remove();
    const div = document.createElement('div');
    div.innerHTML = buildModal(pl);
    document.body.appendChild(div.firstElementChild);
    renderModalRules();
    renderModalItems();
  };

  window.closePriceListModal = function() {
    el('plModalOverlay')?.remove();
    S.editingId = null; S.modalRules = []; S.modalItems = [];
  };

  window._plAddRule = function() {
    S.modalRules.push({ minAmount:0, discountPercent:0 });
    renderModalRules();
  };
  window._plRemoveRule = function(i) { S.modalRules.splice(i,1); renderModalRules(); };
  window._plRuleField = function(i,field,val) { if(S.modalRules[i]) S.modalRules[i][field]=parseFloat(val)||0; };

  window._plAddItem = function() {
    S.modalItems.push({ warehouseItemId:null, price:0 });
    renderModalItems();
  };
  window._plRemoveItem = function(i) { S.modalItems.splice(i,1); renderModalItems(); };
  window._plItemWh = function(i,sel) {
    if(!S.modalItems[i]) return;
    S.modalItems[i].warehouseItemId = sel.value || null;
    const wi = S.warehouseItems.find(w=>w.id===sel.value);
    if(wi && !S.modalItems[i].price) S.modalItems[i].price = Number(wi.price||wi.sellPrice||0);
    renderModalItems();
  };
  window._plItemPrice = function(i,val) { if(S.modalItems[i]) S.modalItems[i].price = parseFloat(val)||0; };

  window._plSave = async function() {
    if(S.saving) return;
    const name = el('plFldName')?.value?.trim();
    if(!name) { toast(tg('Введіть назву прайсу','Enter price list name'),'error'); return; }

    const payload = {
      name,
      currency:      el('plFldCurrency')?.value || 'UAH',
      isDefault:     el('plFldDefault')?.checked || false,
      discountRules: S.modalRules.filter(r=>r.minAmount>0&&r.discountPercent>0).sort((a,b)=>a.minAmount-b.minAmount),
      items:         S.modalItems.filter(i=>i.warehouseItemId),
      updatedAt:     serverTs(),
    };

    S.saving = true;
    const btn = el('plSaveBtn');
    if(btn) { btn.disabled=true; btn.textContent=tg('Збереження...','Saving...'); }

    try {
      if(S.editingId) {
        await col(COL).doc(S.editingId).update(payload);
        toast(tg('Прайс оновлено','Price list updated'));
      } else {
        payload.createdBy = window.currentUserData?.id||'';
        payload.createdAt = serverTs();
        await col(COL).add(payload);
        toast(tg('Прайс створено','Price list created'));
      }
      // Якщо isDefault — знімаємо з інших після отримання ID нового
      if (payload.isDefault) {
        await loadPriceLists(); // спочатку оновлюємо список
        const newId = S.editingId || S.lists.find(p => p.name === payload.name)?.id;
        const others = S.lists.filter(p => p.id !== newId && p.isDefault);
        for (const p of others) {
          await col(COL).doc(p.id).update({ isDefault: false }).catch(() => {});
        }
        await loadPriceLists(); // перезавантажуємо ще раз після скидання
      } else {
        await loadPriceLists();
      }
      window.closePriceListModal();
    } catch(e) {
      console.error('_plSave:',e);
      toast(tg('Помилка: ','Error: ')+e.message,'error');
    } finally {
      S.saving=false;
      if(btn) { btn.disabled=false; btn.textContent=tg('Зберегти','Save'); }
    }
  };

  window._plDelete = async function(plId) {
    if(!confirm(tg('Видалити прайс-лист?','Delete this price list?'))) return;
    try {
      await col(COL).doc(plId).delete();
      toast(tg('Прайс видалено','Price list deleted'),'info');
      await loadPriceLists();
    } catch(e) { toast(tg('Помилка: ','Error: ')+e.message,'error'); }
  };

  // ─── Публічна утиліта — отримати ціну товару з прайсу клієнта ────────────
  // Використовується в 106/107 при виборі товару
  window.getPriceForItem = function(warehouseItemId, priceListId) {
    const lists = S.lists;
    const pl = priceListId
      ? lists.find(p=>p.id===priceListId)
      : lists.find(p=>p.isDefault);
    if(!pl) return null;
    const item = (pl.items||[]).find(i=>i.warehouseItemId===warehouseItemId);
    return item ? item.price : null;
  };

  // ─── Утиліта — розрахувати знижку по сумі ───────────────────────────────
  window.getAutoDiscount = function(amount, priceListId) {
    const lists = S.lists;
    const pl = priceListId
      ? lists.find(p=>p.id===priceListId)
      : lists.find(p=>p.isDefault);
    if(!pl || !pl.discountRules?.length) return 0;
    // Беремо найвищу знижку яка підходить
    const rules = pl.discountRules.filter(r=>amount>=r.minAmount).sort((a,b)=>b.discountPercent-a.discountPercent);
    return rules[0]?.discountPercent || 0;
  };

  window.initPriceLists = async function() {
    if(!cid()) { console.warn('109: no cid'); return; }
    buildUI();
    await Promise.all([loadPriceLists(), loadWarehouseItems()]);
  };

})();
