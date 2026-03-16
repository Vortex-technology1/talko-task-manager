'use strict';
// ═══════════════════════════════════════════════════════════
//  99-warehouse-ui.js  —  TALKO Склад: UI
//  Дашборд, каталог, операції, постачальники, локації
// ═══════════════════════════════════════════════════════════

(function () {

  let _currentView = 'dashboard'; // dashboard | catalog | operations | suppliers | locations
  let _searchQuery = '';
  let _categoryFilter = '';
  let _opTypeFilter = '';

  // ── Форматування ─────────────────────────────────────────
  function fmt(n) {
    return Number(n || 0).toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function fmtMoney(n) {
    return fmt(n) + ' ₴';
  }
  function fmtDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // ── Колір рівня залишку ──────────────────────────────────
  function levelColor(level) {
    if (level === 'critical') return '#ef4444';
    if (level === 'low')      return '#f59e0b';
    return '#22c55e';
  }
  function levelBg(level) {
    if (level === 'critical') return '#fef2f2';
    if (level === 'low')      return '#fffbeb';
    return '#f0fdf4';
  }

  let _listenersAttached = false;

  // ── Головна точка входу ──────────────────────────────────
  window.initWarehouseUI = async function () {
    await window.initWarehouseCore();
    window.whStartAlertWatch();

    if (!_listenersAttached) {
      window.addEventListener('wh:itemsUpdated', _rerender);
      window.addEventListener('wh:stockUpdated', _rerender);
      window.addEventListener('wh:operationsUpdated', _rerender);
      _listenersAttached = true;
    }

    _render();
  };

  function _rerender() {
    if (document.getElementById('warehouseContainer')) _render();
  }

  // ── Головний рендер ──────────────────────────────────────
  function _render() {
    const container = document.getElementById('warehouseContainer');
    if (!container) return;
    container.innerHTML = `
      <div style="height:100%;display:flex;flex-direction:column;background:#f4f5f7;overflow:hidden;">
        ${_renderHeader()}
        <div style="flex:1;overflow:auto;padding:1rem;">
          ${_renderView()}
        </div>
      </div>
    `;
    if (window.lucide) setTimeout(() => lucide.createIcons(), 0);
  }

  // ── Шапка ────────────────────────────────────────────────
  function _renderHeader() {
    const alertsCount = window.whAlertsCount ? window.whAlertsCount() : 0;
    const tabs = [
      { id: 'dashboard',  icon: 'layout-dashboard', label: 'Дашборд' },
      { id: 'catalog',    icon: 'package',           label: 'Каталог' },
      { id: 'operations', icon: 'arrow-left-right',  label: 'Операції' },
      { id: 'suppliers',  icon: 'truck',             label: 'Постачальники' },
      { id: 'locations',  icon: 'map-pin',           label: 'Локації' },
    ];
    return `
      <div style="background:white;border-bottom:1px solid #e5e7eb;padding:0 1rem;display:flex;align-items:center;gap:0;height:48px;flex-shrink:0;overflow-x:auto;scrollbar-width:none;">
        ${tabs.map(t => `
          <button onclick="window._whSetView('${t.id}')" style="
            display:flex;align-items:center;gap:0.4rem;padding:0 1rem;height:100%;
            border:none;background:none;cursor:pointer;white-space:nowrap;
            border-bottom:2px solid ${_currentView === t.id ? '#6366f1' : 'transparent'};
            color:${_currentView === t.id ? '#6366f1' : '#6b7280'};
            font-weight:${_currentView === t.id ? '600' : '400'};font-size:0.88rem;">
            <i data-lucide="${t.icon}" style="width:15px;height:15px;"></i>
            ${t.label}
            ${t.id === 'dashboard' && alertsCount > 0 ? `<span style="background:#ef4444;color:white;border-radius:10px;padding:1px 6px;font-size:0.7rem;">${alertsCount}</span>` : ''}
          </button>
        `).join('')}
        <div style="flex:1;"></div>
        ${_currentView === 'catalog' ? `
          <button onclick="window.whOpenItemForm()" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;white-space:nowrap;">
            <i data-lucide="plus" style="width:15px;height:15px;"></i> Додати товар
          </button>
        ` : ''}
        ${_currentView === 'operations' ? `
          <button onclick="window.whOpenOpForm('IN')" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;margin-right:0.5rem;white-space:nowrap;">
            <i data-lucide="arrow-down-circle" style="width:15px;height:15px;"></i> Прихід
          </button>
          <button onclick="window.whOpenOpForm('OUT')" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;white-space:nowrap;">
            <i data-lucide="arrow-up-circle" style="width:15px;height:15px;"></i> Видача
          </button>
        ` : ''}
        ${_currentView === 'suppliers' ? `
          <button onclick="window.whOpenSupplierForm()" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;white-space:nowrap;">
            <i data-lucide="plus" style="width:15px;height:15px;"></i> Додати
          </button>
        ` : ''}
      </div>
    `;
  }

  window._whSetView = function (view) {
    _currentView = view;
    _searchQuery = '';
    _categoryFilter = '';
    _opTypeFilter = '';
    _render();
  };

  // ── View router ──────────────────────────────────────────
  function _renderView() {
    if (_currentView === 'dashboard')  return _renderDashboard();
    if (_currentView === 'catalog')    return _renderCatalog();
    if (_currentView === 'operations') return _renderOperations();
    if (_currentView === 'suppliers')  return _renderSuppliers();
    if (_currentView === 'locations')  return _renderLocations();
    return '';
  }

  // ══════════════════════════════════════════════════════════
  //  ДАШБОРД
  // ══════════════════════════════════════════════════════════
  function _renderDashboard() {
    const items   = window.whGetItems ? window.whGetItems() : [];
    const totalVal = window.whTotalValue ? window.whTotalValue() : 0;
    const alertsList = window.whGetAlertsList ? window.whGetAlertsList() : [];
    const ops     = window.whGetOperations ? window.whGetOperations() : [];

    // KPI
    const kpis = [
      { icon: 'package',      label: 'Позицій',          value: items.length,             color: '#6366f1' },
      { icon: 'dollar-sign',  label: 'Вартість складу',  value: fmtMoney(totalVal),       color: '#22c55e' },
      { icon: 'alert-triangle', label: 'Потребують замовлення', value: alertsList.length, color: alertsList.length > 0 ? '#ef4444' : '#22c55e' },
    ];

    return `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <!-- KPI -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;">
          ${kpis.map(k => `
            <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                <i data-lucide="${k.icon}" style="width:18px;height:18px;color:${k.color};"></i>
                <span style="font-size:0.8rem;color:#6b7280;">${k.label}</span>
              </div>
              <div style="font-size:1.4rem;font-weight:700;color:#1f2937;">${k.value}</div>
            </div>
          `).join('')}
        </div>

        <!-- Тривоги -->
        ${alertsList.length > 0 ? `
          <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
            <div style="font-size:0.9rem;font-weight:600;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem;">
              <i data-lucide="alert-triangle" style="width:16px;height:16px;color:#ef4444;"></i>
              Потребують замовлення
            </div>
            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              ${alertsList.slice(0, 10).map(a => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.75rem;border-radius:8px;background:${levelBg(a.level)};">
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${levelColor(a.level)};flex-shrink:0;"></span>
                    <span style="font-size:0.85rem;font-weight:500;">${a.item.name}</span>
                    <span style="font-size:0.75rem;color:#9ca3af;">${a.item.sku || ''}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:1rem;font-size:0.82rem;">
                    <span style="color:${levelColor(a.level)};font-weight:600;">${a.stock.qty} / ${a.item.minStock} ${a.item.unit || 'шт'}</span>
                    <button onclick="window.whOpenOpForm('IN','${a.item.id}')" style="padding:0.25rem 0.6rem;background:#6366f1;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.75rem;">Прийняти</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Останні операції -->
        <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
          <div style="font-size:0.9rem;font-weight:600;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem;">
            <i data-lucide="clock" style="width:16px;height:16px;color:#6b7280;"></i>
            Останні операції
          </div>
          ${ops.length === 0 ? `<p style="color:#9ca3af;font-size:0.85rem;text-align:center;padding:1rem;">Операцій ще немає</p>` : `
            <div style="display:flex;flex-direction:column;gap:0.3rem;">
              ${ops.slice(0, 8).map(op => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #f9fafb;font-size:0.83rem;">
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span style="padding:2px 7px;border-radius:5px;font-size:0.72rem;font-weight:600;
                      background:${op.type==='IN'?'#dcfce7':op.type==='OUT'?'#fee2e2':'#fef3c7'};
                      color:${op.type==='IN'?'#166534':op.type==='OUT'?'#991b1b':'#92400e'};">
                      ${op.type==='IN'?'ПРИХІД':op.type==='OUT'?'ВИДАЧА':'СПИСАННЯ'}
                    </span>
                    <span style="font-weight:500;">${op.itemName}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.75rem;color:#6b7280;">
                    <span>${op.type==='IN'?'+':'−'}${op.qty}</span>
                    <span style="color:#9ca3af;font-size:0.75rem;">${fmtDate(op.createdAt)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════
  //  КАТАЛОГ
  // ══════════════════════════════════════════════════════════
  function _renderCatalog() {
    const items = window.whGetItems ? window.whGetItems() : [];
    const categories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();

    let filtered = items;
    if (_searchQuery) {
      const q = _searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.sku || '').toLowerCase().includes(q)
      );
    }
    if (_categoryFilter) {
      filtered = filtered.filter(i => i.category === _categoryFilter);
    }

    return `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <!-- Фільтри -->
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <div style="position:relative;flex:1;min-width:180px;">
            <i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:#9ca3af;pointer-events:none;"></i>
            <input type="text" placeholder="Пошук..." value="${_searchQuery}"
              oninput="window._whSearchCatalog(this.value)"
              style="width:100%;box-sizing:border-box;padding:0.45rem 0.5rem 0.45rem 2rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;outline:none;">
          </div>
          <select onchange="window._whFilterCategory(this.value)"
            style="padding:0.45rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
            <option value="">Всі категорії</option>
            ${categories.map(c => `<option value="${c}" ${_categoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>

        <!-- Таблиця -->
        ${filtered.length === 0 ? `
          <div style="background:white;border-radius:12px;padding:3rem;text-align:center;">
            <i data-lucide="package" style="width:40px;height:40px;color:#d1d5db;margin-bottom:0.75rem;"></i>
            <p style="color:#9ca3af;margin:0;">${items.length === 0 ? 'Каталог порожній. Додайте перший товар.' : 'Нічого не знайдено'}</p>
          </div>
        ` : `
          <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
            <!-- Заголовок таблиці — тільки для десктоп -->
            <div class="hide-mobile" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 80px;gap:0.5rem;padding:0.6rem 1rem;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:0.75rem;color:#6b7280;font-weight:600;text-transform:uppercase;">
              <span>Назва / SKU</span>
              <span>Залишок</span>
              <span>Мін. запас</span>
              <span>Собівартість</span>
              <span>Вартість</span>
              <span></span>
            </div>
            ${filtered.map(item => {
              const s = window.whGetStock(item.id);
              const level = window.whStockLevel(item.id);
              const totalVal2 = s.qty * (item.costPrice || 0);
              return `
                <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:0.75rem 1rem;border-bottom:1px solid #f9fafb;gap:0.5rem;font-size:0.85rem;">
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
                    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:2px;">
                      ${item.sku ? `<span style="font-size:0.72rem;color:#9ca3af;">${item.sku}</span>` : ''}
                      ${item.category ? `<span style="font-size:0.72rem;color:#6b7280;background:#f3f4f6;padding:1px 6px;border-radius:4px;">${item.category}</span>` : ''}
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
                    <div style="text-align:right;">
                      <div style="font-weight:600;color:${levelColor(level)};">${s.qty} <span style="font-size:0.75rem;color:#9ca3af;">${item.unit || 'шт'}</span></div>
                      ${s.reserved > 0 ? `<div style="font-size:0.7rem;color:#f59e0b;">резерв:${s.reserved}</div>` : ''}
                      ${item.costPrice ? `<div style="font-size:0.75rem;color:#6b7280;">${fmtMoney(item.costPrice)}/од</div>` : ''}
                    </div>
                    <div style="display:flex;gap:0.3rem;">
                      <button onclick="window.whOpenOpForm('IN','${item.id}')" title="Прийняти" style="padding:5px;border:none;background:#dcfce7;border-radius:6px;cursor:pointer;">
                        <i data-lucide="arrow-down-circle" style="width:14px;height:14px;color:#16a34a;display:block;"></i>
                      </button>
                      <button onclick="window.whOpenOpForm('OUT','${item.id}')" title="Видати" style="padding:5px;border:none;background:#fee2e2;border-radius:6px;cursor:pointer;">
                        <i data-lucide="arrow-up-circle" style="width:14px;height:14px;color:#dc2626;display:block;"></i>
                      </button>
                      <button onclick="window.whOpenItemForm('${item.id}')" title="Редагувати" style="padding:5px;border:none;background:#f3f4f6;border-radius:6px;cursor:pointer;">
                        <i data-lucide="pencil" style="width:14px;height:14px;color:#6b7280;display:block;"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  window._whSearchCatalog = function (q) { _searchQuery = q; _render(); };
  window._whFilterCategory = function (c) { _categoryFilter = c; _render(); };

  // ══════════════════════════════════════════════════════════
  //  ОПЕРАЦІЇ
  // ══════════════════════════════════════════════════════════
  function _renderOperations() {
    const ops = window.whGetOperations ? window.whGetOperations() : [];
    let filtered = ops;
    if (_opTypeFilter) filtered = filtered.filter(o => o.type === _opTypeFilter);
    if (_searchQuery) {
      const q = _searchQuery.toLowerCase();
      filtered = filtered.filter(o => (o.itemName || '').toLowerCase().includes(q) || (o.note || '').toLowerCase().includes(q));
    }

    const typeLabel = { IN: 'ПРИХІД', OUT: 'ВИДАЧА', WRITE_OFF: 'СПИСАННЯ', ADJUST: 'КОРИГУВАННЯ' };
    const typeColor = { IN: { bg: '#dcfce7', color: '#166534' }, OUT: { bg: '#fee2e2', color: '#991b1b' }, WRITE_OFF: { bg: '#fef3c7', color: '#92400e' }, ADJUST: { bg: '#ede9fe', color: '#5b21b6' } };

    return `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <div style="position:relative;flex:1;min-width:180px;">
            <i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:#9ca3af;pointer-events:none;"></i>
            <input type="text" placeholder="Пошук..." value="${_searchQuery}"
              oninput="window._whOpSearch(this.value)"
              style="width:100%;box-sizing:border-box;padding:0.45rem 0.5rem 0.45rem 2rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;outline:none;">
          </div>
          <select onchange="window._whOpFilter(this.value)"
            style="padding:0.45rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
            <option value="">Всі типи</option>
            <option value="IN" ${_opTypeFilter==='IN'?'selected':''}>Прихід</option>
            <option value="OUT" ${_opTypeFilter==='OUT'?'selected':''}>Видача</option>
            <option value="WRITE_OFF" ${_opTypeFilter==='WRITE_OFF'?'selected':''}>Списання</option>
          </select>
        </div>

        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
          ${filtered.length === 0 ? `
            <p style="text-align:center;padding:2rem;color:#9ca3af;">Операцій немає</p>
          ` : filtered.map(op => {
            const tc = typeColor[op.type] || typeColor.ADJUST;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;border-bottom:1px solid #f9fafb;gap:0.5rem;">
                <div style="display:flex;align-items:center;gap:0.75rem;min-width:0;">
                  <span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;font-weight:600;background:${tc.bg};color:${tc.color};white-space:nowrap;">${typeLabel[op.type] || op.type}</span>
                  <div style="min-width:0;">
                    <div style="font-weight:500;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${op.itemName}</div>
                    ${op.note ? `<div style="font-size:0.75rem;color:#9ca3af;">${op.note}</div>` : ''}
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:1rem;flex-shrink:0;font-size:0.83rem;">
                  <span style="font-weight:600;color:${op.type==='IN'?'#22c55e':'#ef4444'};">${op.type==='IN'?'+':'−'}${op.qty}</span>
                  <span style="color:#6b7280;">${op.newQty}</span>
                  <span style="color:#9ca3af;font-size:0.75rem;">${fmtDate(op.createdAt)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  window._whOpSearch = function (q) { _searchQuery = q; _render(); };
  window._whOpFilter = function (v) { _opTypeFilter = v; _render(); };

  // ══════════════════════════════════════════════════════════
  //  ПОСТАЧАЛЬНИКИ
  // ══════════════════════════════════════════════════════════
  function _renderSuppliers() {
    const suppliers = window.whGetSuppliers ? window.whGetSuppliers() : [];
    return `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        ${suppliers.length === 0 ? `
          <div style="background:white;border-radius:12px;padding:3rem;text-align:center;">
            <p style="color:#9ca3af;">Постачальників немає. Додайте першого.</p>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0.75rem;">
            ${suppliers.map(s => `
              <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div style="font-weight:600;font-size:0.9rem;">${s.name}</div>
                  <button onclick="window.whOpenSupplierForm('${s.id}')" style="padding:4px;border:none;background:#f3f4f6;border-radius:6px;cursor:pointer;">
                    <i data-lucide="pencil" style="width:13px;height:13px;color:#6b7280;"></i>
                  </button>
                </div>
                ${s.phone ? `<div style="font-size:0.82rem;color:#6b7280;margin-top:0.3rem;"><i data-lucide="phone" style="width:12px;height:12px;display:inline;"></i> ${s.phone}</div>` : ''}
                ${s.email ? `<div style="font-size:0.82rem;color:#6b7280;"><i data-lucide="mail" style="width:12px;height:12px;display:inline;"></i> ${s.email}</div>` : ''}
                ${s.note ? `<div style="font-size:0.78rem;color:#9ca3af;margin-top:0.4rem;">${s.note}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════
  //  ЛОКАЦІЇ
  // ══════════════════════════════════════════════════════════
  function _renderLocations() {
    const locs = window.whGetLocations ? window.whGetLocations() : [];
    const typeIcons = { warehouse: 'warehouse', room: 'home', car: 'truck', object: 'map-pin' };
    const typeLabels = { warehouse: 'Склад', room: 'Кімната', car: 'Авто', object: "Об'єкт" };
    return `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div style="display:flex;justify-content:flex-end;">
          <button onclick="window.whOpenLocationForm()" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">
            <i data-lucide="plus" style="width:15px;height:15px;"></i> Додати локацію
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;">
          ${locs.map(l => `
            <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);display:flex;align-items:center;gap:0.75rem;">
              <i data-lucide="${typeIcons[l.type] || 'map-pin'}" style="width:20px;height:20px;color:#6366f1;flex-shrink:0;"></i>
              <div>
                <div style="font-weight:500;font-size:0.88rem;">${l.name}</div>
                <div style="font-size:0.75rem;color:#9ca3af;">${typeLabels[l.type] || l.type}</div>
              </div>
              ${l.isDefault ? `<span style="margin-left:auto;font-size:0.7rem;background:#ede9fe;color:#7c3aed;padding:1px 6px;border-radius:4px;">за замовч.</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════
  //  МОДАЛЬНІ ФОРМИ
  // ══════════════════════════════════════════════════════════

  // ── Форма товару ─────────────────────────────────────────
  window.whOpenItemForm = function (itemId) {
    const item = itemId ? (window.whGetItems().find(i => i.id === itemId) || {}) : {};
    const units = ['шт', 'кг', 'г', 'л', 'мл', 'м', 'м²', 'м³', 'уп', 'пар'];
    const niches = ['', 'beauty', 'medical', 'kitchen', 'construction', 'production', 'other'];
    const nicheLabels = { '': 'Загальне', beauty: "Б'юті", medical: 'Медицина', kitchen: 'Кухня', construction: 'Будівництво', production: 'Виробництво', other: 'Інше' };

    _showModal(`
      <div style="padding:1.25rem;">
        <h3 style="margin:0 0 1rem;font-size:1rem;">${itemId ? 'Редагувати товар' : 'Новий товар'}</h3>
        <div style="display:flex;flex-direction:column;gap:0.65rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Назва *</label>
              <input id="wh_name" value="${item.name || ''}" style="${_inp()}" placeholder="Назва товару">
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">SKU / Артикул</label>
              <input id="wh_sku" value="${item.sku || ''}" style="${_inp()}" placeholder="SKU-001">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Категорія</label>
              <input id="wh_cat" value="${item.category || ''}" style="${_inp()}" placeholder="Матеріали, Хімія...">
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Одиниця</label>
              <select id="wh_unit" style="${_inp()}">
                ${units.map(u => `<option value="${u}" ${item.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Собівартість ₴</label>
              <input id="wh_cost" type="number" value="${item.costPrice || ''}" style="${_inp()}" placeholder="0">
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Ціна продажу ₴</label>
              <input id="wh_sale" type="number" value="${item.salePrice || ''}" style="${_inp()}" placeholder="0">
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Мінімум на складі</label>
              <input id="wh_min" type="number" value="${item.minStock || ''}" style="${_inp()}" placeholder="0">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Ніша</label>
              <select id="wh_niche" style="${_inp()}">
                ${niches.map(n => `<option value="${n}" ${item.niche === n ? 'selected' : ''}>${nicheLabels[n]}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Штрих-код</label>
              <input id="wh_barcode" value="${item.barcode || ''}" style="${_inp()}" placeholder="1234567890">
            </div>
          </div>
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Опис</label>
            <textarea id="wh_desc" style="${_inp()}height:56px;resize:none;" placeholder="Додатковий опис...">${item.description || ''}</textarea>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem;">
          ${itemId ? `<button onclick="window._whConfirmDelete('${itemId}')" style="padding:0.45rem 0.9rem;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Видалити</button>` : ''}
          <button onclick="window._whCloseModal()" style="padding:0.45rem 0.9rem;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Скасувати</button>
          <button onclick="window._whSubmitItem('${itemId || ''}')" style="padding:0.45rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Зберегти</button>
        </div>
      </div>
    `);
  };

  window._whSubmitItem = async function (id) {
    const name = document.getElementById('wh_name')?.value?.trim();
    if (!name) { if (window.showToast) showToast('Введіть назву товару', 'error'); return; }
    try {
      await window.whSaveItem({
        name,
        sku: document.getElementById('wh_sku')?.value?.trim(),
        category: document.getElementById('wh_cat')?.value?.trim(),
        unit: document.getElementById('wh_unit')?.value,
        costPrice: document.getElementById('wh_cost')?.value,
        salePrice: document.getElementById('wh_sale')?.value,
        minStock: document.getElementById('wh_min')?.value,
        niche: document.getElementById('wh_niche')?.value,
        barcode: document.getElementById('wh_barcode')?.value?.trim(),
        description: document.getElementById('wh_desc')?.value?.trim(),
      }, id || null);
      window._whCloseModal();
      if (window.showToast) showToast('Товар збережено ✓', 'success');
    } catch (e) {
      if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
  };

  window._whConfirmDelete = function (id) {
    if (!confirm('Видалити товар?')) return;
    window.whDeleteItem(id).then(() => {
      window._whCloseModal();
      if (window.showToast) showToast('Товар видалено', 'info');
    });
  };

  // ── Форма операції ───────────────────────────────────────
  window.whOpenOpForm = function (type, preItemId) {
    const items = window.whGetItems ? window.whGetItems() : [];
    const locs  = window.whGetLocations ? window.whGetLocations() : [];
    const typeLabels = { IN: 'Прихід товару', OUT: 'Видача / Продаж', WRITE_OFF: 'Списання' };
    const typeColors = { IN: '#22c55e', OUT: '#ef4444', WRITE_OFF: '#f59e0b' };

    _showModal(`
      <div style="padding:1.25rem;">
        <h3 style="margin:0 0 1rem;font-size:1rem;color:${typeColors[type] || '#374151'};">${typeLabels[type] || type}</h3>
        <div style="display:flex;flex-direction:column;gap:0.65rem;">
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Товар *</label>
            <select id="wh_op_item" style="${_inp()}" onchange="window._whOpItemChange(this.value,'${type}')">
              <option value="">— Оберіть товар —</option>
              ${items.map(i => {
                const s = window.whGetStock(i.id);
                return `<option value="${i.id}" ${preItemId === i.id ? 'selected' : ''}>${i.name} (${s.qty} ${i.unit || 'шт'})</option>`;
              }).join('')}
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Кількість *</label>
              <input id="wh_op_qty" type="number" min="0.001" step="any" style="${_inp()}" placeholder="1">
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">${type === 'IN' ? 'Ціна за од. ₴' : 'Собівартість за од. ₴'}</label>
              <input id="wh_op_price" type="number" min="0" style="${_inp()}" placeholder="0">
            </div>
          </div>
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Локація</label>
            <select id="wh_op_loc" style="${_inp()}">
              ${locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Примітка</label>
            <input id="wh_op_note" style="${_inp()}" placeholder="Від постачальника / Угода / ...">
          </div>
          <div id="wh_op_stock_info" style="font-size:0.8rem;color:#6b7280;background:#f9fafb;padding:0.5rem;border-radius:6px;display:none;"></div>
        </div>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem;">
          <button onclick="window._whCloseModal()" style="padding:0.45rem 0.9rem;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Скасувати</button>
          <button onclick="window._whSubmitOp('${type}')" style="padding:0.45rem 0.9rem;background:${typeColors[type]||'#6366f1'};color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Підтвердити</button>
        </div>
      </div>
    `);
    if (preItemId) window._whOpItemChange(preItemId, type);
  };

  window._whOpItemChange = function (itemId, type) {
    if (!itemId) return;
    const item = window.whGetItems().find(i => i.id === itemId);
    const s = window.whGetStock(itemId);
    const info = document.getElementById('wh_op_stock_info');
    if (info) {
      info.style.display = 'block';
      info.innerHTML = `Поточний залишок: <b>${s.qty}</b> ${item?.unit || 'шт'} | Доступно: <b>${s.available}</b>`;
    }
    const priceInput = document.getElementById('wh_op_price');
    if (priceInput && item && type === 'IN' && item.costPrice) priceInput.value = item.costPrice;
  };

  window._whSubmitOp = async function (type) {
    const itemId = document.getElementById('wh_op_item')?.value;
    const qty    = parseFloat(document.getElementById('wh_op_qty')?.value);
    const price  = parseFloat(document.getElementById('wh_op_price')?.value) || 0;
    const locId  = document.getElementById('wh_op_loc')?.value;
    const note   = document.getElementById('wh_op_note')?.value?.trim();
    if (!itemId || !qty || qty <= 0) {
      if (window.showToast) showToast('Оберіть товар і вкажіть кількість', 'error');
      return;
    }
    try {
      const result = await window.whDoOperation({ itemId, type, qty, locationId: locId, price, note });
      // Фінансова транзакція при надходженні
      if (type === 'IN' && price > 0) {
        const item = window.whGetItems().find(i => i.id === itemId);
        if (item) window.whFinanceOnIn(item, qty, price).catch(() => {});
      }
      window._whCloseModal();
      if (window.showToast) showToast(`Операцію виконано. Залишок: ${result.newQty}`, 'success');
    } catch (e) {
      if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
  };

  // ── Форма постачальника ──────────────────────────────────
  window.whOpenSupplierForm = function (supplierId) {
    const s = supplierId ? (window.whGetSuppliers().find(x => x.id === supplierId) || {}) : {};
    _showModal(`
      <div style="padding:1.25rem;">
        <h3 style="margin:0 0 1rem;font-size:1rem;">${supplierId ? 'Редагувати постачальника' : 'Новий постачальник'}</h3>
        <div style="display:flex;flex-direction:column;gap:0.65rem;">
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Назва *</label>
            <input id="wh_sup_name" value="${s.name || ''}" style="${_inp()}" placeholder="ТОВ «Постачальник»">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Телефон</label>
              <input id="wh_sup_phone" value="${s.phone || ''}" style="${_inp()}" placeholder="+380...">
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Email</label>
              <input id="wh_sup_email" value="${s.email || ''}" style="${_inp()}" placeholder="info@...">
            </div>
          </div>
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Примітка</label>
            <textarea id="wh_sup_note" style="${_inp()}height:56px;resize:none;">${s.note || ''}</textarea>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem;">
          <button onclick="window._whCloseModal()" style="padding:0.45rem 0.9rem;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Скасувати</button>
          <button onclick="window._whSubmitSupplier('${supplierId || ''}')" style="padding:0.45rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Зберегти</button>
        </div>
      </div>
    `);
  };

  window._whSubmitSupplier = async function (id) {
    const name = document.getElementById('wh_sup_name')?.value?.trim();
    if (!name) { if (window.showToast) showToast('Введіть назву', 'error'); return; }
    try {
      await window.whSaveSupplier({
        name,
        phone: document.getElementById('wh_sup_phone')?.value?.trim(),
        email: document.getElementById('wh_sup_email')?.value?.trim(),
        note:  document.getElementById('wh_sup_note')?.value?.trim(),
      }, id || null);
      window._whCloseModal();
      if (window.showToast) showToast('Збережено ✓', 'success');
    } catch (e) {
      if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
  };

  // ── Форма локації ─────────────────────────────────────────
  window.whOpenLocationForm = function (locId) {
    const l = locId ? (window.whGetLocations().find(x => x.id === locId) || {}) : {};
    _showModal(`
      <div style="padding:1.25rem;">
        <h3 style="margin:0 0 1rem;font-size:1rem;">Локація</h3>
        <div style="display:flex;flex-direction:column;gap:0.65rem;">
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Назва *</label>
            <input id="wh_loc_name" value="${l.name || ''}" style="${_inp()}" placeholder="Головний склад">
          </div>
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Тип</label>
            <select id="wh_loc_type" style="${_inp()}">
              <option value="warehouse" ${l.type==='warehouse'?'selected':''}>Склад</option>
              <option value="room" ${l.type==='room'?'selected':''}>Кімната</option>
              <option value="car" ${l.type==='car'?'selected':''}>Авто</option>
              <option value="object" ${l.type==='object'?'selected':''}>Об'єкт</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem;">
          <button onclick="window._whCloseModal()" style="padding:0.45rem 0.9rem;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Скасувати</button>
          <button onclick="window._whSubmitLocation('${locId || ''}')" style="padding:0.45rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Зберегти</button>
        </div>
      </div>
    `);
  };

  window._whSubmitLocation = async function (id) {
    const name = document.getElementById('wh_loc_name')?.value?.trim();
    if (!name) { if (window.showToast) showToast('Введіть назву', 'error'); return; }
    try {
      await window.whSaveLocation({ name, type: document.getElementById('wh_loc_type')?.value }, id || null);
      window._whCloseModal();
      if (window.showToast) showToast('Збережено ✓', 'success');
    } catch (e) {
      if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
  };

  // ── Modal helpers ────────────────────────────────────────
  function _inp() {
    return 'width:100%;box-sizing:border-box;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;outline:none;background:white;';
  }

  function _showModal(html) {
    let overlay = document.getElementById('whModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'whModalOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
      overlay.onclick = function (e) { if (e.target === overlay) window._whCloseModal(); };
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    overlay.innerHTML = `<div style="background:white;border-radius:16px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">${html}</div>`;
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
  }

  window._whCloseModal = function () {
    const overlay = document.getElementById('whModalOverlay');
    if (overlay) overlay.style.display = 'none';
  };

  // ── Публічний рендер alerts (для 99-warehouse-alerts.js) ─
  window._whRenderAlerts = function () {
    if (_currentView === 'dashboard') _render();
  };

  // ── Показати nav кнопку ──────────────────────────────────
  function showNavButton() {
    const btn = document.getElementById('warehouseNavBtn');
    if (btn) btn.style.display = '';
  }

  // ── Ініціалізація складу ─────────────────────────────────
  window.initWarehouse = function () {
    showNavButton();
  };

  console.log('[warehouse-ui] loaded');
})();
