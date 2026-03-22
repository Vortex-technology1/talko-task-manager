(function () {
  'use strict';

  // ─── helpers ──────────────────────────────────────────────────────────────
  function col(name) {
    return window.db.collection('companies').doc(window.currentCompanyId).collection(name);
  }
  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function toast(msg, type) { if (typeof showToast === 'function') showToast(msg, type||'success'); }

  // ─── cache ─────────────────────────────────────────────────────────────────
  let _vehicles = [];
  let _staff = [];
  let _products = [];
  let _warehouseItems = [];
  let _clients = [];

  async function loadVehicleDeps() {
    if (!window.currentCompanyId) return;
    try {
      const [vSnap, sSnap, pSnap, wSnap, cSnap] = await Promise.all([
        col('sales_vehicles').orderBy('createdAt','desc').limit(200).get(),
        col('staff').where('isActive','==',true).get(),
        col('sales_products').where('isActive','==',true).get(),
        col('warehouse_items').where('isActive','==',true).get(),
        col('crm_clients').limit(300).get(),
      ]);
      _vehicles = vSnap.docs.map(d=>({id:d.id,...d.data()}));
      _staff    = sSnap.docs.map(d=>({id:d.id,...d.data()}));
      _products = pSnap.docs.map(d=>({id:d.id,...d.data()}));
      _warehouseItems = wSnap.docs.map(d=>({id:d.id,...d.data()}));
      _clients  = cSnap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) { console.warn('loadVehicleDeps:', e.message); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VEHICLE CARD
  // ══════════════════════════════════════════════════════════════════════════
  window._salesOpenVehicleCard = async function(vehicleId) {
    await loadVehicleDeps();
    const v = vehicleId ? _vehicles.find(x=>x.id===vehicleId) : null;

    const overlay = document.createElement('div');
    overlay.id = 'salesVehicleOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:2vh;overflow-y:auto;';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;width:min(600px,98vw);padding:1.5rem;margin-bottom:2rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">🚗 ${v ? v.plate+' — '+v.make+' '+v.model : 'Нове авто'}</h3>
          <button onclick="document.getElementById('salesVehicleOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af">✕</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">Держ. номер *</label>
            <input id="slVehPlate" class="sl-inp" placeholder="AA1234BC" value="${esc(v?.plate||'')}" style="text-transform:uppercase">
          </div>
          <div>
            <label class="sl-label">VIN</label>
            <input id="slVehVin" class="sl-inp" placeholder="WVWZZZ..." value="${esc(v?.vin||'')}">
          </div>
          <div>
            <label class="sl-label">Марка</label>
            <input id="slVehMake" class="sl-inp" placeholder="Toyota" value="${esc(v?.make||'')}">
          </div>
          <div>
            <label class="sl-label">Модель</label>
            <input id="slVehModel" class="sl-inp" placeholder="Camry" value="${esc(v?.model||'')}">
          </div>
          <div>
            <label class="sl-label">Рік</label>
            <input id="slVehYear" class="sl-inp" type="number" min="1990" max="2030" value="${v?.year||new Date().getFullYear()}">
          </div>
          <div>
            <label class="sl-label">Колір</label>
            <input id="slVehColor" class="sl-inp" placeholder="Білий" value="${esc(v?.color||'')}">
          </div>
          <div>
            <label class="sl-label">Власник</label>
            <input id="slVehClient" class="sl-inp" placeholder="Ім'я клієнта" value="${esc(v?.clientName||'')}" list="slVehClientList">
            <datalist id="slVehClientList">${_clients.map(c=>`<option value="${esc(c.name||c.fullName||'')}">`).join('')}</datalist>
          </div>
          <div>
            <label class="sl-label">Телефон</label>
            <input id="slVehPhone" class="sl-inp" placeholder="+380..." value="${esc(v?.clientPhone||'')}">
          </div>
        </div>

        <div style="margin-bottom:1rem">
          <label class="sl-label">Примітки</label>
          <textarea id="slVehNotes" class="sl-inp" rows="2">${esc(v?.notes||'')}</textarea>
        </div>

        ${v && v.mileageHistory?.length ? `
          <div style="margin-bottom:1rem">
            <label class="sl-label">Пробіг (остання відмітка)</label>
            <div style="font-size:.85rem;color:#374151;padding:6px 10px;background:#f8fafc;border-radius:6px">
              ${v.mileageHistory.slice(-1)[0].mileage.toLocaleString('uk-UA')} км · ${esc(v.mileageHistory.slice(-1)[0].date)}
            </div>
          </div>` : ''}

        <div style="display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap">
          <button onclick="document.getElementById('salesVehicleOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">Скасувати</button>
          ${v ? `<button onclick="window._salesOpenWorkOrder(null,'${v.id}')" class="sl-btn" style="background:#f59e0b;color:#fff">🔧 Новий наряд</button>` : ''}
          <button onclick="window._salesSaveVehicle('${vehicleId||''}')" class="sl-btn" style="background:#6366f1;color:#fff">Зберегти</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Fill phone from client cache
    document.getElementById('slVehClient').addEventListener('change', function() {
      const c = _clients.find(x=>(x.name||x.fullName||'').toLowerCase()===this.value.toLowerCase());
      if (c) document.getElementById('slVehPhone').value = c.phone||c.phones?.[0]||'';
    });
  };

  window._salesSaveVehicle = async function(vehicleId) {
    const plate = document.getElementById('slVehPlate')?.value?.trim().toUpperCase();
    if (!plate) { toast('Вкажіть держ. номер', 'warn'); return; }
    const clientName = document.getElementById('slVehClient')?.value?.trim()||'';
    const client = _clients.find(c=>(c.name||c.fullName||'').toLowerCase()===clientName.toLowerCase());
    const data = {
      plate,
      vin:   document.getElementById('slVehVin')?.value?.trim()||'',
      make:  document.getElementById('slVehMake')?.value?.trim()||'',
      model: document.getElementById('slVehModel')?.value?.trim()||'',
      year:  parseInt(document.getElementById('slVehYear')?.value)||0,
      color: document.getElementById('slVehColor')?.value?.trim()||'',
      clientId:    client?.id||'',
      clientName,
      clientPhone: document.getElementById('slVehPhone')?.value?.trim()||'',
      notes: document.getElementById('slVehNotes')?.value?.trim()||'',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
      if (vehicleId) {
        await col('sales_vehicles').doc(vehicleId).update(data);
      } else {
        data.mileageHistory = [];
        data.isDemo = false;
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await col('sales_vehicles').add(data);
        vehicleId = ref.id;
      }
      toast('Авто збережено');
      document.getElementById('salesVehicleOverlay')?.remove();
      await loadVehicleDeps();
    } catch(e) { toast('Помилка: '+e.message,'error'); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // WORK ORDER FORM
  // ══════════════════════════════════════════════════════════════════════════
  let _woItems = [];   // work items (services)
  let _woParts = [];   // parts items

  window._salesOpenWorkOrder = async function(orderId, presetVehicleId) {
    await loadVehicleDeps();

    let order = null;
    if (orderId) {
      try {
        const d = await col('sales_orders').doc(orderId).get();
        if (d.exists) order = {id:d.id,...d.data()};
      } catch(e) {}
    }

    const num = order?.number || await generateWONumber();
    const vId = order?.vehicleId || presetVehicleId || '';
    const vehicle = _vehicles.find(v=>v.id===vId) || null;

    // Split existing items into services vs parts
    const existingItems = order?.items || [];
    _woItems = existingItems.filter(i=>!i.warehouseItemId).map(i=>({...i}));
    _woParts = existingItems.filter(i=> i.warehouseItemId).map(i=>({...i}));
    if (!_woItems.length) _woItems = [{id:Date.now()+'', name:'', qty:1, unit:'послуга', price:0, discount:0, total:0}];

    const overlay = document.createElement('div');
    overlay.id = 'salesWorkOrderOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:1vh;overflow-y:auto;';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;width:min(800px,98vw);padding:1.5rem;margin-bottom:2rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700">🔧 ${order?'Редагувати наряд':'Новий наряд-замовлення'} ${esc(num)}</h3>
          <button onclick="document.getElementById('salesWorkOrderOverlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af">✕</button>
        </div>

        <!-- Vehicle -->
        <div style="background:#f8fafc;border-radius:8px;padding:1rem;margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
            <b style="font-size:.85rem">🚗 Автомобіль</b>
            <button onclick="window._salesWOPickVehicle()" class="sl-btn-sm" style="background:#eef2ff;color:#6366f1">Змінити авто</button>
          </div>
          <div id="slWOVehicleInfo">
            ${vehicle ? renderVehicleInfo(vehicle, order?.vehicleInfo) : `<div style="color:#9ca3af;font-size:.85rem">Авто не вибрано — <button onclick="window._salesWOPickVehicle()" style="background:none;border:none;color:#6366f1;cursor:pointer;text-decoration:underline;font-size:.85rem">вибрати</button> або <button onclick="window._salesOpenVehicleCard(null)" style="background:none;border:none;color:#6366f1;cursor:pointer;text-decoration:underline;font-size:.85rem">додати нове</button></div>`}
          </div>
          <input type="hidden" id="slWOVehicleId" value="${esc(vId)}">
          <div style="margin-top:.75rem;display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem">
            <div>
              <label class="sl-label">Пробіг прийому (км)</label>
              <input id="slWOMileage" class="sl-inp" type="number" min="0" value="${order?.vehicleInfo?.mileage||''}" placeholder="85420">
            </div>
            <div>
              <label class="sl-label">Майстер</label>
              <select id="slWOMaster" class="sl-inp">
                <option value="">— вибрати —</option>
                ${_staff.map(s=>`<option value="${s.id}" ${order?.masterId===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="sl-label">Дата</label>
              <input id="slWODate" class="sl-inp" type="date" value="${order?.date||todayISO()}">
            </div>
          </div>
        </div>

        <!-- Client -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">Клієнт</label>
            <input id="slWOClient" class="sl-inp" value="${esc(order?.clientName||vehicle?.clientName||'')}" list="slWOClientList" placeholder="Ім'я клієнта">
            <datalist id="slWOClientList">${_clients.map(c=>`<option value="${esc(c.name||c.fullName||'')}">`).join('')}</datalist>
          </div>
          <div>
            <label class="sl-label">Телефон</label>
            <input id="slWOPhone" class="sl-inp" value="${esc(order?.clientPhone||vehicle?.clientPhone||'')}" placeholder="+380...">
          </div>
        </div>

        <!-- Work items (services) -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">🔨 Роботи</b>
            <div style="display:flex;gap:.5rem">
              <button onclick="window._salesWOAddFromCatalog('work')" class="sl-btn-sm" style="background:#eef2ff;color:#6366f1">📋 З каталогу</button>
              <button onclick="window._salesWOAddItem('work')" class="sl-btn-sm" style="background:#f0fdf4;color:#16a34a">+ Додати</button>
            </div>
          </div>
          <div id="slWOWorkItems"></div>
        </div>

        <!-- Parts -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <b style="font-size:.85rem">🔩 Запчастини</b>
            <div style="display:flex;gap:.5rem">
              <button onclick="window._salesWOAddFromWarehouse()" class="sl-btn-sm" style="background:#fff7ed;color:#c2410c">📦 Зі складу</button>
              <button onclick="window._salesWOAddItem('part')" class="sl-btn-sm" style="background:#f0fdf4;color:#16a34a">+ Вручну</button>
            </div>
          </div>
          <div id="slWOPartItems"></div>
        </div>

        <!-- Totals -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:1rem">
          <div style="min-width:220px;border-top:2px solid #e5e7eb;padding-top:.75rem">
            <div style="display:flex;justify-content:space-between;font-size:.83rem;color:#6b7280;margin-bottom:4px">
              <span>Роботи:</span><span id="slWOWorkTotal">0 ₴</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:.83rem;color:#6b7280;margin-bottom:4px">
              <span>Запчастини:</span><span id="slWOPartsTotal">0 ₴</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1rem;border-top:1px solid #e5e7eb;padding-top:6px">
              <span>Разом:</span><span id="slWOTotal" style="color:#6366f1">0 ₴</span>
            </div>
          </div>
        </div>

        <!-- Status + Payment -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
          <div>
            <label class="sl-label">Статус</label>
            <select id="slWOStatus" class="sl-inp">
              ${[['draft','Чернетка'],['sent','Відправлено клієнту'],['paid','Оплачено'],['closed','Закрито']].map(([v,l])=>`<option value="${v}" ${(order?.status||'draft')===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="sl-label">Спосіб оплати</label>
            <select id="slWOPayMethod" class="sl-inp">
              ${[['cash','💵 Готівка'],['terminal','💳 Термінал'],['transfer','📱 Переказ']].map(([v,l])=>`<option value="${v}" ${(order?.paymentMethod||'cash')===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="margin-bottom:1.25rem">
          <label class="sl-label">Примітки</label>
          <textarea id="slWONotes" class="sl-inp" rows="2">${esc(order?.notes||'')}</textarea>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="document.getElementById('salesWorkOrderOverlay').remove()" class="sl-btn" style="background:#f3f4f6;color:#374151">Скасувати</button>
          <button onclick="window._salesSaveWorkOrder('${orderId||''}',false)" class="sl-btn" style="background:#6366f1;color:#fff">💾 Зберегти наряд</button>
          <button onclick="window._salesSaveWorkOrder('${orderId||''}',true)" class="sl-btn" style="background:#10b981;color:#fff">✓ Закрити + Оплачено</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    renderWOItems();
  };

  function renderVehicleInfo(v, vehicleInfo) {
    const vv = vehicleInfo || v;
    return `<div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:.85rem">
      <span><b>${esc(v.plate||vv.plate)}</b></span>
      <span style="color:#6b7280">${esc(v.make||vv.make)} ${esc(v.model||vv.model)} · ${v.year||vv.year||''}</span>
      ${v.vin||vv.vin ? `<span style="color:#9ca3af;font-size:.75rem">VIN: ${esc(v.vin||vv.vin)}</span>` : ''}
      ${v.color ? `<span style="color:#9ca3af">${esc(v.color)}</span>` : ''}
    </div>`;
  }

  async function generateWONumber() {
    const year = new Date().getFullYear();
    try {
      const snap = await col('sales_orders').where('type','==','work_order').orderBy('createdAt','desc').limit(1).get();
      let seq = 1;
      if (!snap.empty) { const m = (snap.docs[0].data().number||'').match(/(\d+)$/); if(m) seq=parseInt(m[1])+1; }
      return `WO-${year}-${String(seq).padStart(4,'0')}`;
    } catch(e) { return `WO-${year}-${String(Date.now()).slice(-4)}`; }
  }

  // ── item pickers ──────────────────────────────────────────────────────────
  window._salesWOPickVehicle = function() {
    if (!_vehicles.length) {
      if (confirm('Список авто порожній. Додати нове авто?')) window._salesOpenVehicleCard(null);
      return;
    }
    const html = `
      <div id="slWOVehiclePicker" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10001;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(480px,96vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>Вибір автомобіля</b>
            <button onclick="document.getElementById('slWOVehiclePicker').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
          </div>
          <input class="sl-inp" placeholder="Пошук за номером, маркою..." oninput="window._salesWOVehicleSearch(this.value)" style="margin-bottom:.75rem">
          <div id="slWOVehicleList">
            ${_vehicles.map(v=>`
              <div onclick="window._salesWOSetVehicle('${v.id}')" style="padding:.6rem .75rem;border-radius:7px;cursor:pointer;border:1px solid #f3f4f6;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center" class="sl-wo-vrow">
                <div>
                  <div style="font-weight:700;font-size:.9rem">${esc(v.plate)}</div>
                  <div style="font-size:.78rem;color:#6b7280">${esc(v.make)} ${esc(v.model)} ${v.year||''} · ${esc(v.clientName||'')}</div>
                </div>
                <div style="font-size:.75rem;color:#9ca3af">${esc(v.color||'')}</div>
              </div>`).join('')}
          </div>
          <button onclick="document.getElementById('slWOVehiclePicker').remove();window._salesOpenVehicleCard(null);" class="sl-btn" style="margin-top:.75rem;background:#f3f4f6;color:#374151;width:100%">+ Додати нове авто</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window._salesWOVehicleSearch = function(q) {
    document.querySelectorAll('.sl-wo-vrow').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
    });
  };

  window._salesWOSetVehicle = function(vehicleId) {
    const v = _vehicles.find(x=>x.id===vehicleId);
    if (!v) return;
    document.getElementById('slWOVehicleId').value = vehicleId;
    document.getElementById('slWOVehicleInfo').innerHTML = renderVehicleInfo(v, null);
    if (!document.getElementById('slWOClient').value) document.getElementById('slWOClient').value = v.clientName||'';
    if (!document.getElementById('slWOPhone').value) document.getElementById('slWOPhone').value = v.clientPhone||'';
    const lastMileage = v.mileageHistory?.slice(-1)[0]?.mileage;
    if (lastMileage && !document.getElementById('slWOMileage').value) document.getElementById('slWOMileage').value = lastMileage;
    document.getElementById('slWOVehiclePicker')?.remove();
  };

  window._salesWOAddFromCatalog = function(type) {
    if (!_products.length) { toast('Каталог порожній', 'info'); return; }
    const html = `
      <div id="slWOCatalogPicker" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10001;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(420px,96vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>Вибір з каталогу послуг</b>
            <button onclick="document.getElementById('slWOCatalogPicker').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
          </div>
          <input class="sl-inp" placeholder="Пошук..." oninput="window._salesWOCatSearch(this.value,this)" style="margin-bottom:.75rem">
          <div id="slWOCatList">
            ${_products.map(p=>`
              <div onclick="window._salesWOPickCatalogItem('${p.id}','${type}')" style="padding:.5rem .75rem;border-radius:6px;cursor:pointer;border:1px solid #f3f4f6;margin-bottom:4px;display:flex;justify-content:space-between" class="sl-woc-row">
                <div style="font-size:.85rem;font-weight:600">${esc(p.name)}</div>
                <div style="font-weight:700;color:#6366f1">${fmt(p.price)} ₴</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window._salesWOCatSearch = function(q) {
    document.querySelectorAll('.sl-woc-row').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
    });
  };

  window._salesWOPickCatalogItem = function(productId, type) {
    const p = _products.find(x=>x.id===productId);
    if (!p) return;
    _woItems.push({ id:Date.now()+'', name:p.name, qty:1, unit:p.unit||'послуга', price:p.price||0, discount:0, total:p.price||0 });
    renderWOItems();
    document.getElementById('slWOCatalogPicker')?.remove();
  };

  window._salesWOAddFromWarehouse = function() {
    if (!_warehouseItems.length) { toast('Склад порожній', 'info'); return; }
    const html = `
      <div id="slWOWarehousePicker" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10001;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:10px;padding:1.25rem;width:min(440px,96vw);max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;margin-bottom:.75rem">
            <b>Вибір зі складу</b>
            <button onclick="document.getElementById('slWOWarehousePicker').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem">✕</button>
          </div>
          <input class="sl-inp" placeholder="Пошук запчастини..." oninput="window._salesWOWhSearch(this.value)" style="margin-bottom:.75rem">
          <div id="slWOWhList">
            ${_warehouseItems.map(w=>`
              <div onclick="window._salesWOPickWarehouseItem('${w.id}')" style="padding:.5rem .75rem;border-radius:6px;cursor:pointer;border:1px solid #f3f4f6;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center" class="sl-wowh-row">
                <div>
                  <div style="font-size:.85rem;font-weight:600">${esc(w.name)}</div>
                  <div style="font-size:.75rem;color:#9ca3af">Залишок: ${w.quantity||0} ${esc(w.unit||'шт')}</div>
                </div>
                <div style="font-weight:700;color:#c2410c">${fmt(w.price)} ₴</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window._salesWOWhSearch = function(q) {
    document.querySelectorAll('.sl-wowh-row').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
    });
  };

  window._salesWOPickWarehouseItem = function(itemId) {
    const w = _warehouseItems.find(x=>x.id===itemId);
    if (!w) return;
    _woParts.push({ id:Date.now()+'', name:w.name, qty:1, unit:w.unit||'шт', price:w.price||0, discount:0, total:w.price||0, warehouseItemId:w.id });
    renderWOItems();
    document.getElementById('slWOWarehousePicker')?.remove();
  };

  window._salesWOAddItem = function(type) {
    const item = { id:Date.now()+'', name:'', qty:1, unit: type==='work'?'послуга':'шт', price:0, discount:0, total:0 };
    if (type === 'work') _woItems.push(item);
    else _woParts.push(item);
    renderWOItems();
  };

  // ── render items ──────────────────────────────────────────────────────────
  function renderWOItems() {
    renderWOSection('slWOWorkItems', _woItems, 'work');
    renderWOSection('slWOPartItems', _woParts, 'part');
    recalcWOTotals();
  }

  function renderWOSection(containerId, items, type) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    if (!items.length) {
      cont.innerHTML = `<div style="color:#9ca3af;font-size:.8rem;padding:6px 0">Немає позицій</div>`;
      return;
    }
    cont.innerHTML = items.map((item, idx) => `
      <div style="display:grid;grid-template-columns:1fr 55px 85px 55px 30px;gap:5px;align-items:center;margin-bottom:5px">
        <input class="sl-inp-sm" value="${esc(item.name)}" onchange="window._salesWOItemChange('${type}',${idx},'name',this.value)" placeholder="${type==='work'?'Назва роботи':'Назва запчастини'}">
        <input class="sl-inp-sm" type="number" min="0.01" step="0.01" value="${item.qty}" onchange="window._salesWOItemChange('${type}',${idx},'qty',+this.value)" style="text-align:center">
        <input class="sl-inp-sm" type="number" min="0" value="${item.price}" onchange="window._salesWOItemChange('${type}',${idx},'price',+this.value)" style="text-align:right">
        <div style="text-align:right;font-size:.8rem;font-weight:600;color:#374151">${fmt(item.total)} ₴</div>
        <button onclick="window._salesWORemoveItem('${type}',${idx})" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:1.1rem;padding:0">×</button>
      </div>
      ${item.warehouseItemId ? `<div style="font-size:.7rem;color:#f59e0b;margin:-2px 0 4px;padding-left:2px">⚠ Буде списано зі складу</div>` : ''}
    `).join('');
  }

  window._salesWOItemChange = function(type, idx, field, val) {
    const arr = type==='work' ? _woItems : _woParts;
    if (!arr[idx]) return;
    arr[idx][field] = val;
    arr[idx].total = Math.round(arr[idx].qty * arr[idx].price * 100)/100;
    renderWOItems();
  };

  window._salesWORemoveItem = function(type, idx) {
    if (type==='work') _woItems.splice(idx,1);
    else _woParts.splice(idx,1);
    renderWOItems();
  };

  function recalcWOTotals() {
    const wt = _woItems.reduce((s,i)=>s+i.total,0);
    const pt = _woParts.reduce((s,i)=>s+i.total,0);
    const tt = wt+pt;
    const wEl=document.getElementById('slWOWorkTotal'); if(wEl) wEl.textContent=fmt(wt)+' ₴';
    const pEl=document.getElementById('slWOPartsTotal'); if(pEl) pEl.textContent=fmt(pt)+' ₴';
    const tEl=document.getElementById('slWOTotal'); if(tEl) tEl.textContent=fmt(tt)+' ₴';
  }

  // ── save work order ───────────────────────────────────────────────────────
  window._salesSaveWorkOrder = async function(orderId, markClosed) {
    const vehicleId = document.getElementById('slWOVehicleId')?.value||'';
    const vehicle   = _vehicles.find(v=>v.id===vehicleId)||null;
    const mileage   = parseInt(document.getElementById('slWOMileage')?.value)||0;
    const masterId  = document.getElementById('slWOMaster')?.value||'';
    const master    = _staff.find(s=>s.id===masterId);
    const clientName= document.getElementById('slWOClient')?.value?.trim()||'';
    const clientPhone=document.getElementById('slWOPhone')?.value?.trim()||'';
    const date      = document.getElementById('slWODate')?.value||todayISO();
    const status    = markClosed ? 'closed' : (document.getElementById('slWOStatus')?.value||'draft');
    const payMethod = document.getElementById('slWOPayMethod')?.value||'cash';
    const notes     = document.getElementById('slWONotes')?.value?.trim()||'';
    const num       = document.querySelector('#salesWorkOrderOverlay h3')?.textContent?.match(/WO-\d+-\d+/)?.[0] || await generateWONumber();

    const allItems  = [..._woItems, ..._woParts].filter(i=>i.name);
    if (!allItems.length) { toast('Додайте хоча б одну роботу', 'warn'); return; }

    allItems.forEach(i => { i.total = Math.round(i.qty*i.price*100)/100; });
    const total = allItems.reduce((s,i)=>s+i.total,0);

    const clientObj = _clients.find(c=>(c.name||c.fullName||'').toLowerCase()===clientName.toLowerCase());

    const vehicleInfo = vehicle ? {
      plate:   vehicle.plate, vin: vehicle.vin,
      make:    vehicle.make,  model: vehicle.model,
      year:    vehicle.year,  mileage,
    } : { mileage };

    const data = {
      type: 'work_order',
      number: num,
      status,
      clientId:    clientObj?.id||'',
      clientName,  clientPhone,
      vehicleId,   vehicleInfo,
      masterId,    masterName: master?.name||'',
      date,
      items: allItems,
      subtotal: Math.round(total*100)/100,
      discountTotal: 0,
      total:   Math.round(total*100)/100,
      paymentMethod: payMethod,
      paymentStatus: markClosed ? 'paid' : 'unpaid',
      paidAmount:    markClosed ? Math.round(total*100)/100 : 0,
      notes,
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

      // Auto write-off from warehouse
      if (markClosed) {
        await writeOffParts(allItems, num);
        // Record in finance
        await recordFinance({ ...data, id: savedId });
      }

      // Update vehicle mileage
      if (vehicleId && mileage > 0) {
        try {
          await col('sales_vehicles').doc(vehicleId).update({
            mileageHistory: firebase.firestore.FieldValue.arrayUnion({ date, mileage, orderId: savedId }),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        } catch(e) { console.warn('mileage update:', e); }
      }

      toast(markClosed ? 'Наряд закрито та оплачено' : 'Наряд збережено');
      document.getElementById('salesWorkOrderOverlay')?.remove();

      // Refresh orders table
      if (typeof window._salesReloadOrders === 'function') window._salesReloadOrders();
    } catch(e) { toast('Помилка: '+e.message,'error'); }
  };

  async function writeOffParts(items, orderNum) {
    for (const item of items) {
      if (!item.warehouseItemId) continue;
      try {
        const wRef = col('warehouse_items').doc(item.warehouseItemId);
        const wDoc = await wRef.get();
        if (!wDoc.exists) continue;
        const current = wDoc.data().quantity || 0;
        const newQty  = Math.max(0, current - item.qty);
        await wRef.update({ quantity: newQty, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        // Write operation record
        const opRef = col('warehouse_operations').doc();
        await opRef.set({
          type: 'writeoff', itemId: item.warehouseItemId, itemName: item.name,
          quantity: item.qty, note: `Реалізація ${orderNum}`,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } catch(e) { console.warn('writeOffParts:', e); }
    }
  }

  async function recordFinance(order) {
    if (!order.paidAmount) return;
    try {
      const txRef = col('finance_transactions').doc();
      await txRef.set({
        type: 'income', amount: order.paidAmount,
        categoryName: 'Виручка (реалізація)',
        note: `Наряд ${order.number} · ${order.clientName}`.trim(),
        date: order.date || todayISO(),
        sourceModule: 'sales', sourceId: order.id,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await col('sales_orders').doc(order.id).update({ financeTransactionId: txRef.id });
    } catch(e) { console.warn('recordFinance WO:', e); }
  }

  // ── reload hook ───────────────────────────────────────────────────────────
  // Register so main 104-sales.js can call it
  window._salesReloadOrders = async function() {
    if (typeof window._salesLoadOrdersExternal === 'function') window._salesLoadOrdersExternal();
  };

  // ── expose vehicle list render for vehicles subtab ────────────────────────
  window.renderVehiclesPanel = async function() {
    const cont = document.getElementById('salesVehiclesContent');
    if (!cont) return;
    await loadVehicleDeps();
    cont.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <b>Картки автомобілів (${_vehicles.length})</b>
        <button onclick="window._salesOpenVehicleCard(null)" class="sl-btn" style="background:#6366f1;color:#fff">+ Нове авто</button>
      </div>
      ${!_vehicles.length ? '<div style="text-align:center;padding:2rem;color:#9ca3af">Жодного авто не додано</div>' :
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem">
        ${_vehicles.map(v=>`
          <div onclick="window._salesOpenVehicleCard('${v.id}')" style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1rem;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
              <div>
                <div style="font-weight:700;font-size:.95rem">${esc(v.plate)}</div>
                <div style="font-size:.82rem;color:#6b7280">${esc(v.make)} ${esc(v.model)} ${v.year||''}</div>
              </div>
              <button onclick="event.stopPropagation();window._salesOpenWorkOrder(null,'${v.id}')" style="background:#fff7ed;border:none;color:#c2410c;padding:4px 8px;border-radius:5px;cursor:pointer;font-size:.75rem;font-weight:600">🔧 Наряд</button>
            </div>
            <div style="font-size:.8rem;color:#9ca3af">${esc(v.clientName||'Власник невідомий')}</div>
            ${v.mileageHistory?.length ? `<div style="font-size:.75rem;color:#9ca3af;margin-top:3px">Пробіг: ${v.mileageHistory.slice(-1)[0].mileage?.toLocaleString('uk-UA')} км</div>` : ''}
          </div>`).join('')}
      </div>`}
    `;
  };

  console.log('[104d] sales-vehicles module loaded');
})();
