(function () {
  'use strict';

  // ─── helpers ────────────────────────────────────────────────────────────────
  var _tg = function(ua,ru){return window.currentLang==='ru'?ru:ua;};
  function getDb() { return window.db || (window.firebase && firebase.firestore()); }
  function getCid() { return window.currentCompanyId || window.currentCompany || null; }
  function col(name) {
    const db = getDb(), cid = getCid();
    if (!db || !cid) throw new Error('DB not ready');
    return db.collection('companies').doc(cid).collection(name);
  }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function fmtQty(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:3}); }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function el(id) { return document.getElementById(id); }
  function toast(msg, type) { if (typeof showToast === 'function') showToast(msg, type||'success'); }

  // ─── state ──────────────────────────────────────────────────────────────────
  const FP = {
    recipes: [],
    warehouseItems: [],
    activeTab: 'recipes',
    editingRecipe: null,
    editingIngredients: [],
    productionPlan: [],
  };

  // ─── load data ───────────────────────────────────────────────────────────────
  async function loadRecipes() {
    if (!getCid()) return;
    try {
      const snap = await col('fp_recipes').orderBy('name').get();
      FP.recipes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('loadRecipes:', e.message); }
  }

  async function loadWarehouseItems() {
    if (!getCid()) return;
    try {
      const snap = await col('warehouse_items').where('isActive','==',true).orderBy('name').get();
      FP.warehouseItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      // fallback without filter
      try {
        const snap = await col('warehouse_items').get();
        FP.warehouseItems = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.isActive !== false);
      } catch(e2) { FP.warehouseItems = []; }
    }
  }

  async function loadProductionPlan() {
    if (!getCid()) return;
    try {
      const today = todayISO();
      const snap = await col('fp_production_plan')
        .where('date','==',today)
        .orderBy('createdAt','desc').get();
      FP.productionPlan = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { FP.productionPlan = []; }
  }

  // ─── RECIPE FORM ─────────────────────────────────────────────────────────────
  async function openRecipeForm(recipeId) {
    await loadWarehouseItems();
    let recipe = null;
    if (recipeId) {
      recipe = FP.recipes.find(r => r.id === recipeId);
      if (!recipe) {
        try {
          const d = await col('fp_recipes').doc(recipeId).get();
          if (d.exists) recipe = { id: d.id, ...d.data() };
        } catch(e) {}
      }
    }
    FP.editingRecipe = recipe;
    FP.editingIngredients = recipe?.ingredients ? recipe.ingredients.map(i => ({...i})) : [];

    const overlay = document.createElement('div');
    overlay.id = 'fpRecipeOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10050;display:flex;align-items:flex-start;justify-content:center;padding-top:60px;padding-bottom:1rem;overflow-y:auto;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;width:min(780px,98vw);padding:1.5rem;margin-bottom:2rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">🍽️ ${_tg(recipe ? 'Редагувати рецептуру' : 'Нова рецептура', recipe ? 'Редактировать рецептуру' : 'Новая рецептура')}</h3>
          <button onclick="document.getElementById('fpRecipeOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af">✕</button>
        </div>

        <!-- Header fields -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div style="grid-column:1/3">
            <label class="fp-label">${window.t('назваСтравиПродукту')}</label>
            <input id="fpRecipeName" class="fp-inp" value="${esc(recipe?.name||'')}" placeholder="${window.t('борщУкраїнський')}">
          </div>
          <div>
            <label class="fp-label">${window.t('категорія')}</label>
            <input id="fpRecipeCat" class="fp-inp" value="${esc(recipe?.category||'')}" placeholder="${window.t('першіСтрави')}" list="fpCatList">
            <datalist id="fpCatList">
              ${[...new Set(FP.recipes.map(r=>r.category).filter(Boolean))].map(c=>`<option value="${esc(c)}">`).join('')}
            </datalist>
          </div>
          <div>
            <label class="fp-label">${window.t('вихідГМлШт')}</label>
            <input id="fpRecipeYield" class="fp-inp" type="number" min="0" value="${recipe?.yield||100}" placeholder="1000">
          </div>
          <div>
            <label class="fp-label">${window.t('кількістьПорцій')}</label>
            <input id="fpRecipePortions" class="fp-inp" type="number" min="1" value="${recipe?.portions||1}" oninput="window._fpRecalc()">
          </div>
          <div>
            <label class="fp-label">${window.t('цінаПродажу')}</label>
            <input id="fpRecipeSalePrice" class="fp-inp" type="number" min="0" value="${recipe?.salePrice||''}" placeholder="0.00" oninput="window._fpRecalc()">
          </div>
        </div>

        <!-- Ingredients table -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">${window.t('інгредієнтиТехнологічнаКарта')}</b>
            <div style="display:flex;gap:.5rem">
              <button onclick="window._fpAddIngredientFromWarehouse()" class="fp-btn-sm" style="background:#eef2ff;color:#6366f1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>Зі складу</button>
              <button onclick="window._fpAddIngredient()" class="fp-btn-sm" style="background:#f0fdf4;color:#16a34a">${window.t('вручну')}</button>
            </div>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:.82rem">
              <thead><tr style="background:#f8fafc">
                <th style="padding:6px 8px;text-align:left;color:#6b7280;font-weight:600">${window.t('інгредієнт')}</th>
                <th style="width:80px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('брутто')}</th>
                <th style="width:80px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('нетто')}</th>
                <th style="width:60px;text-align:center;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('од')}</th>
                <th style="width:90px;text-align:right;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('цінаод')}</th>
                <th style="width:90px;text-align:right;padding:6px 4px;color:#6b7280;font-weight:600">${window.t('вартість')}</th>
                <th style="width:30px"></th>
              </tr></thead>
              <tbody id="fpIngrTbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Cost summary -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:1.25rem">
          <div style="min-width:260px;background:#f8fafc;border-radius:10px;padding:.85rem 1rem">
            <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.35rem">
              <span style="color:#6b7280">${window.t('собівартістьЗагальна')}</span>
              <span id="fpTotalCost" style="font-weight:600">0.00 ₴</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.35rem">
              <span style="color:#6b7280">${window.t('собівартістьПорції')}</span>
              <span id="fpCostPerPortion" style="font-weight:600">0.00 ₴</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.35rem">
              <span style="color:#6b7280">${window.t('цінаПродажу1')}</span>
              <span id="fpSalePriceDisplay" style="font-weight:600">0.00 ₴</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:.5rem;border-top:2px solid #e5e7eb;font-size:.9rem">
              <span style="font-weight:700">${window.t('маржа')}</span>
              <span id="fpMarginDisplay" style="font-weight:700;color:#10b981">— %</span>
            </div>
          </div>
        </div>

        <div style="margin-bottom:1rem">
          <label class="fp-label">${window.t('технологіяПриготування')}</label>
          <textarea id="fpRecipeTech" class="fp-inp" rows="3" placeholder="${window.t('описПроцесуПриготування')}">${esc(recipe?.technology||'')}</textarea>
        </div>

        <div style="display:flex;gap:.75rem;justify-content:flex-end;flex-wrap:wrap">
          <button onclick="document.getElementById('fpRecipeOverlay').remove()" class="fp-btn" style="background:#f3f4f6;color:#374151">${window.t('скасувати1')}</button>
          ${recipe ? `<button onclick="window._fpPrintOP1('${recipe.id}')" class="fp-btn" style="background:#f59e0b;color:#fff"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>ОП-1</button>` : ''}
          <button onclick="window._fpSaveRecipe('${recipeId||''}')" class="fp-btn" style="background:#6366f1;color:#fff"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Зберегти</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    renderIngredients();
    window._fpRecalc();
  }

  function renderIngredients() {
    const tbody = el('fpIngrTbody');
    if (!tbody) return;
    const items = FP.editingIngredients;
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1rem;color:#9ca3af;font-size:.82rem">${window.t('додайтеІнгредієнтиЗіСкладу')}</td></tr>`;
      window._fpRecalc();
      return;
    }
    tbody.innerHTML = items.map((ing, idx) => `
      <tr style="border-bottom:1px solid #f3f4f6">
        <td style="padding:4px 6px">
          <input class="fp-inp-sm" value="${esc(ing.name)}" onchange="window._fpIngChange(${idx},'name',this.value)" placeholder="${window.t('назва')}" style="min-width:120px">
        </td>
        <td style="padding:4px">
          <input class="fp-inp-sm" type="number" min="0" step="0.001" value="${fmtQty(ing.grossQty)}" onchange="window._fpIngChange(${idx},'grossQty',+this.value)" style="width:100%;text-align:center">
        </td>
        <td style="padding:4px">
          <input class="fp-inp-sm" type="number" min="0" step="0.001" value="${fmtQty(ing.netQty)}" onchange="window._fpIngChange(${idx},'netQty',+this.value)" style="width:100%;text-align:center">
        </td>
        <td style="padding:4px">
          <select class="fp-inp-sm" onchange="window._fpIngChange(${idx},'unit',this.value)">
            ${['г','кг','мл','л','шт','ст.л','ч.л'].map(u=>`<option ${ing.unit===u?'selected':''}>${u}</option>`).join('')}
          </select>
        </td>
        <td style="padding:4px">
          <input class="fp-inp-sm" type="number" min="0" step="0.01" value="${ing.pricePerUnit||0}" onchange="window._fpIngChange(${idx},'pricePerUnit',+this.value)" style="width:100%;text-align:right">
        </td>
        <td style="padding:4px;text-align:right;font-weight:600;color:#374151">${fmt(ing.cost||0)} ₴</td>
        <td style="padding:4px;text-align:center">
          <button onclick="window._fpRemoveIng(${idx})" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:1rem">×</button>
        </td>
      </tr>`).join('');
    window._fpRecalc();
  }

  window._fpIngChange = function(idx, field, val) {
    if (!FP.editingIngredients[idx]) return;
    FP.editingIngredients[idx][field] = val;
    const ing = FP.editingIngredients[idx];
    // recalc cost for this ingredient
    const qty = ing.grossQty || 0;
    const price = ing.pricePerUnit || 0;
    // convert to kg/l if unit is г/мл
    let costQty = qty;
    if (ing.unit === 'г' || ing.unit === 'мл') costQty = qty / 1000;
    ing.cost = Math.round(costQty * price * 100) / 100;
    renderIngredients();
  };

  window._fpRemoveIng = function(idx) {
    FP.editingIngredients.splice(idx, 1);
    renderIngredients();
  };

  window._fpAddIngredient = function() {
    FP.editingIngredients.push({ name:'', grossQty:0, netQty:0, unit:'г', pricePerUnit:0, cost:0, warehouseItemId:'' });
    renderIngredients();
    // focus last
    setTimeout(() => {
      const rows = el('fpIngrTbody')?.querySelectorAll('tr');
      if (rows?.length) rows[rows.length-1].querySelector('input')?.focus();
    }, 50);
  };

  window._fpAddIngredientFromWarehouse = function() {
    if (!FP.warehouseItems.length) { toast(window.t('складПорожнійДодайтеТовари'), 'info'); return; }
    const html = `
      <div id="fpWhPicker" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10051;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:12px;padding:1.25rem;width:min(440px,95vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
            <b>${window.t('вибірЗіСкладу')}</b>
            <button onclick="document.getElementById('fpWhPicker').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
          </div>
          <input class="fp-inp" placeholder="${window.t('пошук')}" oninput="window._fpWhSearch(this.value)" style="margin-bottom:.75rem">
          <div id="fpWhList">
            ${FP.warehouseItems.map(w=>`
              <div onclick="window._fpPickWarehouseItem('${w.id}')" class="fp-wh-row" style="padding:.5rem .75rem;border:1px solid #f3f4f6;border-radius:7px;cursor:pointer;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-weight:600;font-size:.85rem">${esc(w.name)}</div>
                  <div style="font-size:.72rem;color:#9ca3af">${esc(w.category||'')} · залишок: ${fmtQty(w.quantity||0)} ${esc(w.unit||'')}</div>
                </div>
                <div style="font-size:.82rem;font-weight:600;color:#6366f1">${fmt(w.price||0)} ₴/${esc(w.unit||'')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window._fpWhSearch = function(q) {
    document.querySelectorAll('.fp-wh-row').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
    });
  };

  window._fpPickWarehouseItem = function(itemId) {
    const item = FP.warehouseItems.find(w => w.id === itemId);
    if (!item) return;
    // Determine unit and price per base unit
    const unit = item.unit === 'кг' ? 'г' : item.unit === 'л' ? 'мл' : item.unit || 'г';
    let pricePerUnit = item.price || 0;
    // If warehouse price is per kg, convert to per gram
    if (item.unit === 'кг') pricePerUnit = (item.price || 0) / 1000;
    else if (item.unit === 'л') pricePerUnit = (item.price || 0) / 1000;

    FP.editingIngredients.push({
      name: item.name,
      grossQty: 0,
      netQty: 0,
      unit,
      pricePerUnit: Math.round(pricePerUnit * 10000) / 10000,
      cost: 0,
      warehouseItemId: item.id,
      warehouseUnit: item.unit,
    });
    renderIngredients();
    document.getElementById('fpWhPicker')?.remove();
  };

  window._fpRecalc = function() {
    const items = FP.editingIngredients;
    let totalCost = 0;
    items.forEach(ing => {
      let qty = ing.grossQty || 0;
      let price = ing.pricePerUnit || 0;
      if (ing.unit === 'г' || ing.unit === 'мл') qty = qty / 1000;
      ing.cost = Math.round(qty * price * 100) / 100;
      totalCost += ing.cost;
    });
    const portions = parseInt(el('fpRecipePortions')?.value) || 1;
    const salePrice = parseFloat(el('fpRecipeSalePrice')?.value) || 0;
    const costPerPortion = portions > 0 ? totalCost / portions : 0;
    const margin = salePrice > 0 ? Math.round((salePrice - costPerPortion) / salePrice * 100) : null;

    const tc = el('fpTotalCost'); if(tc) tc.textContent = fmt(totalCost) + ' ₴';
    const cp = el('fpCostPerPortion'); if(cp) cp.textContent = fmt(costPerPortion) + ' ₴';
    const sp = el('fpSalePriceDisplay'); if(sp) sp.textContent = fmt(salePrice) + ' ₴';
    const md = el('fpMarginDisplay');
    if (md) {
      md.textContent = margin !== null ? margin + '%' : '—';
      md.style.color = margin === null ? '#9ca3af' : margin >= 60 ? '#10b981' : margin >= 30 ? '#f59e0b' : '#ef4444';
    }
  };

  // ─── save recipe ──────────────────────────────────────────────────────────────
  window._fpSaveRecipe = async function(recipeId) {
    const name = el('fpRecipeName')?.value?.trim();
    if (!name) { toast(window.t('вкажітьНазву'), 'warn'); return; }

    const portions = parseInt(el('fpRecipePortions')?.value) || 1;
    const salePrice = parseFloat(el('fpRecipeSalePrice')?.value) || 0;
    const ingredients = FP.editingIngredients.filter(i => i.name);

    let totalCost = 0;
    ingredients.forEach(ing => {
      let qty = ing.grossQty || 0;
      if (ing.unit === 'г' || ing.unit === 'мл') qty /= 1000;
      ing.cost = Math.round(qty * (ing.pricePerUnit||0) * 100) / 100;
      totalCost += ing.cost;
    });
    const costPerPortion = portions > 0 ? Math.round(totalCost / portions * 100) / 100 : 0;
    const margin = salePrice > 0 ? Math.round((salePrice - costPerPortion) / salePrice * 100) : null;

    const data = {
      name,
      category: el('fpRecipeCat')?.value?.trim() || '',
      yield: parseFloat(el('fpRecipeYield')?.value) || 0,
      portions,
      salePrice,
      technology: el('fpRecipeTech')?.value?.trim() || '',
      ingredients,
      totalCost: Math.round(totalCost * 100) / 100,
      costPerPortion,
      margin,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      if (recipeId) {
        await col('fp_recipes').doc(recipeId).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.createdBy = window.currentUser?.uid || '';
        await col('fp_recipes').add(data);
      }
      toast(window.t('рецептуруЗбережено'));
      document.getElementById('fpRecipeOverlay')?.remove();
      await loadRecipes();
      renderRecipesList();
    } catch(e) { toast('Помилка: ' + e.message, 'error'); }
  };

  // ─── OP-1 PRINT ──────────────────────────────────────────────────────────────
  window._fpPrintOP1 = async function(recipeId) {
    let recipe = FP.recipes.find(r => r.id === recipeId);
    if (!recipe) {
      try {
        const d = await col('fp_recipes').doc(recipeId).get();
        if (d.exists) recipe = { id: d.id, ...d.data() };
      } catch(e) {}
    }
    if (!recipe) { toast(window.t('рецептуруНеЗнайдено'), 'error'); return; }

    const company = window.currentCompanyData || {};
    const today = new Date().toLocaleDateString('uk-UA');
    const ingredients = recipe.ingredients || [];

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>ОП-1 ${esc(recipe.name)}</title>
    <style>
      body{font-family:'Times New Roman',serif;font-size:12px;margin:20px;color:#000}
      h2{text-align:center;font-size:14px;margin:4px 0}
      .center{text-align:center}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      th,td{border:1px solid #000;padding:4px 6px;font-size:11px}
      th{background:#f0f0f0;font-weight:bold;text-align:center}
      .right{text-align:right}
      .bold{font-weight:bold}
      .org-line{margin:4px 0;font-size:11px}
      .sign-block{display:flex;justify-content:space-between;margin-top:20px;font-size:11px}
    </style></head><body>
    <div class="org-line">Організація: <b>${esc(company.name||company.companyName||'')}</b></div>
    <div class="org-line">${window.t('підрозділ')} ___________________</div>
    <br>
    <h2>${window.t('калькуляційнаКарта___')}</h2>
    <h2>${window.t('формаОп1')}</h2>
    <br>
    <table style="border:none">
      <tr style="border:none">
        <td style="border:none">${window.t('найменуванняСтрави')} <b>${esc(recipe.name)}</b></td>
        <td style="border:none;text-align:right">${window.t('датаСкладання')} ${today}</td>
      </tr>
      <tr style="border:none">
        <td style="border:none">Категорія: ${esc(recipe.category||'—')}</td>
        <td style="border:none;text-align:right">${window.t('вихід')} ${recipe.yield||0} ${window.t('гмлшт')}</td>
      </tr>
    </table>

    <table>
      <thead>
        <tr>
          <th style="width:5%">№</th>
          <th>${window.t('найменуванняПродуктів')}</th>
          <th style="width:10%">${window.t('од')}</th>
          <th style="width:12%">${window.t('брутто')}</th>
          <th style="width:12%">${window.t('нетто')}</th>
          <th style="width:12%">${window.t('ціна2')}</th>
          <th style="width:12%">${window.t('сума1')}</th>
        </tr>
      </thead>
      <tbody>
        ${ingredients.map((ing, i) => `
        <tr>
          <td class="center">${i+1}</td>
          <td>${esc(ing.name)}</td>
          <td class="center">${esc(ing.unit||'г')}</td>
          <td class="center">${fmtQty(ing.grossQty)}</td>
          <td class="center">${fmtQty(ing.netQty||ing.grossQty)}</td>
          <td class="right">${fmt(ing.pricePerUnit||0)}</td>
          <td class="right bold">${fmt(ing.cost||0)}</td>
        </tr>`).join('')}
        <tr>
          <td colspan="5" style="text-align:right;font-weight:bold">РАЗОМ на ${recipe.portions||1} порц.:</td>
          <td></td>
          <td class="right bold">${fmt(recipe.totalCost||0)}</td>
        </tr>
        <tr>
          <td colspan="5" style="text-align:right;font-weight:bold">${window.t('собівартість1Порції')}</td>
          <td></td>
          <td class="right bold">${fmt(recipe.costPerPortion||0)}</td>
        </tr>
      </tbody>
    </table>

    <table style="border:none;margin-top:4px">
      <tr style="border:none">
        <td style="border:none">${window.t('цінаПродажу1Порції')} <b>${fmt(recipe.salePrice||0)} ₴</b></td>
        <td style="border:none;text-align:right">${window.t('торговаНадбавка')} <b>${recipe.margin !== null && recipe.margin !== undefined ? recipe.margin + '%' : '—'}</b></td>
      </tr>
    </table>

    ${recipe.technology ? `<div style="margin-top:10px;font-size:11px"><b>Технологія приготування:</b><br>${esc(recipe.technology).replace(/\n/g,'<br>')}</div>` : ''}

    <div class="sign-block">
      <div>${window.t('завідувачВиробництвом')} _______________/______________</div>
      <div>${window.t('калькулятор')} _______________/______________</div>
    </div>
    <div class="sign-block" style="margin-top:10px">
      <div>${window.t('керівникЗакладу')} _______________/______________</div>
      <div>${window.t('датаЗатвердження')} _______________</div>
    </div>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // ─── PRODUCTION PLAN ─────────────────────────────────────────────────────────
  async function renderProductionPlanTab() {
    const cont = el('fpPlanContent');
    if (!cont) return;
    await Promise.all([loadRecipes(), loadWarehouseItems(), loadProductionPlan()]);

    // check stop-list
    const stopList = checkStopList();

    cont.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
        <div>
          <b>${window.t('плануванняВиробництва')}</b>
          <span style="font-size:.78rem;color:#9ca3af;margin-left:.5rem">${new Date().toLocaleDateString('uk-UA')}</span>
        </div>
        <button onclick="window._fpAddToPlan()" class="fp-btn" style="background:#6366f1;color:#fff">${window.t('додатиВПлан')}</button>
      </div>

      ${stopList.length ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem">
          <b style="color:#dc2626;font-size:.85rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg><b style="color:#dc2626;font-size:.85rem">Стоп-лист — нестача інгредієнтів:</b> — нестача інгредієнтів:</b>
          <div style="margin-top:.35rem">${stopList.map(s=>`
            <div style="font-size:.8rem;color:#374151;margin-top:.2rem">
              <b>${esc(s.recipe)}</b> — не вистачає: ${s.missing.map(m=>`${esc(m.name)} (є ${fmtQty(m.inStock)} ${esc(m.unit)}, треба ${fmtQty(m.needed)} ${esc(m.unit)})`).join(', ')}
            </div>`).join('')}
          </div>
        </div>` : ''}

      ${!FP.productionPlan.length ? `
        <div style="text-align:center;padding:2rem;color:#9ca3af">
          <div style="margin-bottom:.5rem"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div>${window.t('планНаСьогодніПорожній')}</div>
          <div style="font-size:.78rem;margin-top:.25rem">${_tg('Натисніть "+ Додати в план" щоб запланувати виробництво','Нажмите "+ Добавить в план" чтобы запланировать производство')}</div>
        </div>` :
      `<div style="display:flex;flex-direction:column;gap:.5rem">
        ${FP.productionPlan.map(p => {
          const recipe = FP.recipes.find(r => r.id === p.recipeId);
          const status = p.status || 'planned';
          const statusColors = { planned:'#3b82f6', in_progress:'#f59e0b', done:'#10b981', cancelled:'#ef4444' };
          const statusLabels = { planned:window.t('заплановано'), in_progress:window.t('виробляється'), done:window.t('готово'), cancelled:window.t('скасовано') };
          return `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
            <div style="flex:1;min-width:180px">
              <div style="font-weight:700;font-size:.9rem">${esc(p.recipeName||recipe?.name||'—')}</div>
              <div style="font-size:.75rem;color:#6b7280">${p.portions} порц. · ${window.t('собівартість')} ${fmt((recipe?.costPerPortion||0)*p.portions)} ₴</div>
            </div>
            <div style="display:flex;gap:.5rem;align-items:center">
              <span style="color:${statusColors[status]};font-size:.78rem;font-weight:600;background:${statusColors[status]}20;padding:2px 8px;border-radius:12px">${statusLabels[status]}</span>
              ${status === 'planned' ? `
                <button onclick="window._fpStartProduction('${p.id}')" style="background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.75rem;font-weight:600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><polygon points="5 3 19 12 5 21 5 3"/></svg>${window.t('почати')}</button>
                <button onclick="window._fpCompleteProduction('${p.id}')" style="background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.75rem;font-weight:600">${window.t('готовоСписати')}</button>` : ''}
              ${status === 'in_progress' ? `
                <button onclick="window._fpCompleteProduction('${p.id}')" style="background:#10b981;border:none;color:#fff;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:.75rem;font-weight:600">${window.t('готовоСписати')}</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>`}
    `;
  }

  function checkStopList() {
    const stopList = [];
    FP.productionPlan.filter(p => p.status === 'planned' || p.status === 'in_progress').forEach(plan => {
      const recipe = FP.recipes.find(r => r.id === plan.recipeId);
      if (!recipe) return;
      const missing = [];
      (recipe.ingredients || []).forEach(ing => {
        if (!ing.warehouseItemId) return;
        const wItem = FP.warehouseItems.find(w => w.id === ing.warehouseItemId);
        if (!wItem) return;
        // Calculate needed quantity
        let needed = (ing.grossQty || 0) * plan.portions / (recipe.portions || 1);
        if (ing.unit === 'г' || ing.unit === 'мл') needed /= 1000;
        const inStock = wItem.quantity || 0;
        if (inStock < needed) {
          missing.push({ name: ing.name, inStock, needed: Math.round(needed*1000)/1000, unit: wItem.unit || ing.unit });
        }
      });
      if (missing.length) stopList.push({ recipe: recipe.name, missing });
    });
    return stopList;
  }

  window._fpAddToPlan = async function() {
    await loadRecipes();
    if (!FP.recipes.length) { toast(window.t('немаєРецептурСпочаткуСтворіть'), 'info'); return; }

    const html = `
      <div id="fpPlanPicker" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10052;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:12px;padding:1.25rem;width:min(420px,96vw)">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>${window.t('додатиВПланВиробництва')}</b>
            <button onclick="document.getElementById('fpPlanPicker').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
          </div>
          <div style="margin-bottom:.75rem">
            <label class="fp-label">${window.t('страваПродукт')}</label>
            <select id="fpPlanRecipe" class="fp-inp" onchange="window._fpUpdatePlanCost()">
              <option value="">${window.t('оберітьРецептуру')}</option>
              ${FP.recipes.map(r=>`<option value="${r.id}" data-cost="${r.costPerPortion||0}" data-portions="${r.portions||1}">${esc(r.name)} (${esc(r.category||'')})</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom:.75rem">
            <label class="fp-label">${window.t('кількістьПорційДляВиробництва')}</label>
            <input id="fpPlanPortions" class="fp-inp" type="number" min="1" value="10" oninput="window._fpUpdatePlanCost()">
          </div>
          <div id="fpPlanCostPreview" style="background:#f8fafc;border-radius:8px;padding:.6rem .75rem;font-size:.82rem;margin-bottom:1rem;display:none">
            ${window.t('собівартість')} <b id="fpPlanTotalCost">—</b>
          </div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end">
            <button onclick="document.getElementById('fpPlanPicker').remove()" class="fp-btn" style="background:#f3f4f6;color:#374151">Скасувати</button>
            <button onclick="window._fpConfirmAddToPlan()" class="fp-btn" style="background:#6366f1;color:#fff">${window.t('додатиВПлан1')}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window._fpUpdatePlanCost = function() {
    const sel = el('fpPlanRecipe');
    const opt = sel?.options[sel.selectedIndex];
    const portions = parseInt(el('fpPlanPortions')?.value) || 0;
    const costPer = parseFloat(opt?.dataset?.cost) || 0;
    const preview = el('fpPlanCostPreview');
    const total = el('fpPlanTotalCost');
    if (opt?.value && portions > 0) {
      if (preview) preview.style.display = 'block';
      if (total) total.textContent = fmt(costPer * portions) + ' ₴';
    } else {
      if (preview) preview.style.display = 'none';
    }
  };

  window._fpConfirmAddToPlan = async function() {
    const recipeId = el('fpPlanRecipe')?.value;
    const portions = parseInt(el('fpPlanPortions')?.value) || 1;
    if (!recipeId) { toast(window.t('оберітьРецептуру1'), 'warn'); return; }
    const recipe = FP.recipes.find(r => r.id === recipeId);
    try {
      await col('fp_production_plan').add({
        recipeId,
        recipeName: recipe?.name || '',
        portions,
        date: todayISO(),
        status: 'planned',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: window.currentUser?.uid || '',
      });
      toast(window.t('доданоВПлан'));
      document.getElementById('fpPlanPicker')?.remove();
      await loadProductionPlan();
      renderProductionPlanTab();
    } catch(e) { toast('Помилка: ' + e.message, 'error'); }
  };

  window._fpStartProduction = async function(planId) {
    try {
      await col('fp_production_plan').doc(planId).update({
        status: 'in_progress',
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      toast(window.t('виробництвоРозпочато'));
      await loadProductionPlan();
      renderProductionPlanTab();
    } catch(e) { toast('Помилка: ' + e.message, 'error'); }
  };

  window._fpCompleteProduction = async function(planId) {
    const plan = FP.productionPlan.find(p => p.id === planId);
    if (!plan) return;
    const recipe = FP.recipes.find(r => r.id === plan.recipeId);
    if (!recipe) { toast(window.t('рецептуруНеЗнайдено'), 'error'); return; }

    // Write off ingredients from warehouse
    const errors = [];
    for (const ing of (recipe.ingredients || [])) {
      if (!ing.warehouseItemId) continue;
      let qty = (ing.grossQty || 0) * plan.portions / (recipe.portions || 1);
      if (ing.unit === 'г' || ing.unit === 'мл') qty /= 1000;
      qty = Math.round(qty * 1000) / 1000;
      if (qty <= 0) continue;
      try {
        if (typeof window.whDoOperation === 'function') {
          await window.whDoOperation({
            itemId: ing.warehouseItemId,
            type: 'out',
            qty,
            note: `${window.t('виробництво')} ${recipe.name} (${plan.portions} ${window.t('порц')})`,
          });
        }
      } catch(e) {
        errors.push(`${ing.name}: ${e.message}`);
      }
    }

    if (errors.length) {
      toast(window.t('частковоСписаноПомилки') + errors.join('; '), 'warn');
    } else {
      toast(_tg(`✓ Виробництво завершено. Зі складу списано інгредієнти для ${plan.portions} порц.`, `✓ Производство завершено. Со склада списаны ингредиенты для ${plan.portions} порц.`));
    }

    await col('fp_production_plan').doc(planId).update({
      status: 'done',
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await loadProductionPlan();
    await loadWarehouseItems();
    renderProductionPlanTab();
  };

  // ─── RECIPES LIST ─────────────────────────────────────────────────────────────
  function renderRecipesList() {
    const cont = el('fpRecipesContent');
    if (!cont) return;

    // Group by category
    const categories = {};
    FP.recipes.forEach(r => {
      const cat = r.category || window.t('безКатегорії');
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(r);
    });

    cont.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
        <div>
          <b>${window.t('рецептури')} (${FP.recipes.length})</b>
        </div>
        <button onclick="window._fpOpenRecipe(null)" class="fp-btn" style="background:#6366f1;color:#fff">${window.t('новаРецептура')}</button>
      </div>

      ${!FP.recipes.length ?
        `<div style="text-align:center;padding:3rem;color:#9ca3af">
          <div style="margin-bottom:.75rem"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
          <div style="font-weight:600;margin-bottom:.35rem">${window.t('рецептурЩеНемає')}</div>
          <div style="font-size:.82rem">${window.t('створітьПершуРецептуруЗ')}</div>
        </div>` :
        Object.entries(categories).map(([cat, recipes]) => `
          <div style="margin-bottom:1.25rem">
            <div style="font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem">${esc(cat)}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.6rem">
              ${recipes.map(r => {
                const margin = r.margin;
                const marginColor = margin === null || margin === undefined ? '#9ca3af' : margin >= 60 ? '#10b981' : margin >= 30 ? '#f59e0b' : '#ef4444';
                return `
                <div onclick="window._fpOpenRecipe('${r.id}')" style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.4rem">
                    <div style="font-weight:700;font-size:.9rem;flex:1">${esc(r.name)}</div>
                    ${margin !== null && margin !== undefined ? `<span style="color:${marginColor};font-size:.75rem;font-weight:700;background:${marginColor}15;padding:2px 7px;border-radius:10px;margin-left:.5rem">${margin}%</span>` : ''}
                  </div>
                  <div style="display:flex;gap:1rem;font-size:.75rem;color:#6b7280">
                    <span>${window.t('вихід1')} ${r.yield||0} г</span>
                    <span>🍽️ ${r.portions||1} порц.</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-top:.5rem;font-size:.78rem">
                    <span style="color:#9ca3af">${window.t('собівартістьпорц')}</span>
                    <span style="font-weight:700;color:#6366f1">${fmt(r.costPerPortion||0)} ₴</span>
                  </div>
                  ${r.salePrice ? `
                  <div style="display:flex;justify-content:space-between;font-size:.78rem">
                    <span style="color:#9ca3af">${window.t('цінаПродажу1')}</span>
                    <span style="font-weight:600">${fmt(r.salePrice)} ₴</span>
                  </div>` : ''}
                  <div style="display:flex;gap:.35rem;margin-top:.65rem;flex-wrap:wrap">
                    <button onclick="event.stopPropagation();window._fpPrintOP1('${r.id}')" style="background:#fef3c7;border:none;color:#b45309;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:.7rem;font-weight:600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>ОП-1</button>
                    <button onclick="event.stopPropagation();window._fpPlanFromRecipe('${r.id}')" style="background:#f0fdf4;border:none;color:#16a34a;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:.7rem;font-weight:600"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:3px"><polygon points="5 3 19 12 5 21 5 3"/></svg>В план</button>
                    <button onclick="event.stopPropagation();window._fpDeleteRecipe('${r.id}')" style="background:#fef2f2;border:none;color:#ef4444;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:.7rem;font-weight:600"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>`).join('')}
    `;
  }

  window._fpOpenRecipe = function(recipeId) { openRecipeForm(recipeId); };

  window._fpDeleteRecipe = async function(recipeId) {
    if (!confirm(window.t('видалитиРецептуру'))) return;
    try {
      await col('fp_recipes').doc(recipeId).delete();
      toast(window.t('рецептуруВидалено'));
      await loadRecipes();
      renderRecipesList();
    } catch(e) { toast('Помилка: ' + e.message, 'error'); }
  };

  window._fpPlanFromRecipe = async function(recipeId) {
    const recipe = FP.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const portionsStr = prompt(_tg(`Скільки порцій "${recipe.name}" виробити?`, `Сколько порций "${recipe.name}" произвести?`), '10');
    if (!portionsStr) return;
    const portions = parseInt(portionsStr);
    if (!portions || portions < 1) { toast(window.t('вкажітьКількістьПорцій'), 'warn'); return; }
    try {
      await col('fp_production_plan').add({
        recipeId, recipeName: recipe.name, portions,
        date: todayISO(), status: 'planned',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: window.currentUser?.uid || '',
      });
      toast(_tg(`${recipe.name}: ${portions} порц. додано в план`, `${recipe.name}: ${portions} порц. добавлено в план`));
    } catch(e) { toast('Помилка: ' + e.message, 'error'); }
  };

  // ─── MAIN UI ─────────────────────────────────────────────────────────────────
  function buildFoodProductionUI() {
    const container = el('foodProductionTab');
    if (!container) return;

    container.innerHTML = `
      <style>
        .fp-label{display:block;font-size:.75rem;color:#6b7280;margin-bottom:3px;font-weight:600}
        .fp-inp{width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:7px 10px;font-size:.85rem;box-sizing:border-box;outline:none}
        .fp-inp:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.12)}
        .fp-inp-sm{border:1px solid #e5e7eb;border-radius:5px;padding:4px 6px;font-size:.8rem;width:100%;box-sizing:border-box;outline:none}
        .fp-inp-sm:focus{border-color:#6366f1}
        .fp-btn{padding:8px 16px;border-radius:7px;border:none;cursor:pointer;font-size:.85rem;font-weight:600;transition:opacity .15s}
        .fp-btn:hover{opacity:.85}
        .fp-btn-sm{padding:4px 10px;border-radius:5px;border:none;cursor:pointer;font-size:.75rem;font-weight:600}
        .fp-subtab{padding:6px 14px;border-radius:6px;border:none;cursor:pointer;font-size:.82rem;font-weight:600;background:transparent;color:#6b7280;transition:all .15s}
        .fp-subtab.active{background:#6366f1;color:#fff}
        .fp-subtab:hover:not(.active){background:#f3f4f6}
      </style>

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:1rem;padding:1rem 1rem 0">
        <h2 style="margin:0;font-size:1.1rem;font-weight:700"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M6 2v6a6 6 0 0 0 12 0V2"/><line x1="12" y1="14" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>${window.t('виробництвоКухня')}</h2>
      </div>

      <!-- Subtabs -->
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;padding:0 1rem;margin-bottom:1rem">
        <button class="fp-subtab active" onclick="window._fpSubTab('recipes',this)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>${window.t('рецептури')}</button>
        <button class="fp-subtab" onclick="window._fpSubTab('plan',this)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/></svg>${window.t('планування')}</button>
      </div>

      <!-- Content -->
      <div style="padding:0 1rem 1.5rem">
        <div id="fpRecipesContent"></div>
        <div id="fpPlanContent" style="display:none"></div>
      </div>
    `;
  }

  window._fpSubTab = function(tab, btn) {
    document.querySelectorAll('.fp-subtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    FP.activeTab = tab;
    const recipes = el('fpRecipesContent');
    const plan = el('fpPlanContent');
    if (tab === 'recipes') {
      if (recipes) recipes.style.display = 'block';
      if (plan) plan.style.display = 'none';
      renderRecipesList();
    } else {
      if (recipes) recipes.style.display = 'none';
      if (plan) plan.style.display = 'block';
      renderProductionPlanTab();
    }
  };

  // ─── INIT ────────────────────────────────────────────────────────────────────
  window.initFoodProductionModule = async function() {
    if (!getCid()) { console.warn('initFoodProductionModule: no companyId'); return; }
    buildFoodProductionUI();
    await Promise.all([loadRecipes(), loadWarehouseItems()]);
    renderRecipesList();
  };

  console.log('[105] food-production module loaded');
})();
