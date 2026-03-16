'use strict';
// ═══════════════════════════════════════════════════════════
//  99-warehouse-ui.js  —  TALKO Склад: UI
//  Дашборд, каталог, операції, постачальники, локації
// ═══════════════════════════════════════════════════════════

(function () {

  let _currentView = 'dashboard';
  let _searchQuery = '';
  let _searchTimer = null;
  let _categoryFilter = '';
  let _opTypeFilter = '';
  let _opDateFilter = '';

  // ── Форматування ─────────────────────────────────────────
  function fmt(n) {
    return Number(n || 0).toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function fmtMoney(n) {
    return fmt(n) + ' ₴';
  }
  function fmtDate(ts) {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      const diffH   = Math.floor(diffMs / 3600000);
      const diffD   = Math.floor(diffMs / 86400000);
      if (diffMin < 1)  return 'щойно';
      if (diffMin < 60) return `${diffMin} хв тому`;
      if (diffH   < 24) return `${diffH} год тому`;
      if (diffD   < 7)  return `${diffD} дн тому`;
      return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return '—'; }
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
    const tab = document.getElementById('warehouseTab');
    if (tab && tab.classList.contains('active')) _render();
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
      { id: 'operations', icon: 'arrow-left-right',  label: window.t('operationsWord') },
      { id: 'suppliers',  icon: 'truck',             label: 'Постачальники' },
      { id: 'locations',  icon: 'map-pin',           label: window.t('locationsWord') },
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
          <button onclick="window.whOpenOpForm('IN')" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;margin-right:0.4rem;white-space:nowrap;">
            <i data-lucide="arrow-down-circle" style="width:15px;height:15px;"></i> Прихід
          </button>
          <button onclick="window.whOpenOpForm('OUT')" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;margin-right:0.4rem;white-space:nowrap;">
            <i data-lucide="arrow-up-circle" style="width:15px;height:15px;"></i> Видача
          </button>
          <button onclick="window.whOpenOpForm('WRITE_OFF')" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#f59e0b;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;white-space:nowrap;">
            <i data-lucide="trash-2" style="width:15px;height:15px;"></i> Списання
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

  window._whSetView = function (view, cb) {
    _currentView = view;
    _searchQuery = '';
    _categoryFilter = '';
    _opTypeFilter = '';
    _opDateFilter = '';
    _render();
    if (cb) setTimeout(cb, 50);
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
    const items      = window.whGetItems ? window.whGetItems() : [];
    const totalVal   = window.whTotalValue ? window.whTotalValue() : 0;
    const alertsList = window.whGetAlertsList ? window.whGetAlertsList() : [];
    const ops        = window.whGetOperations ? window.whGetOperations() : [];

    // Загальна кількість одиниць на складі
    const totalUnits = items.reduce((s, item) => {
      const st = window.whGetStock(item.id);
      return s + (st.qty || 0);
    }, 0);

    // Top-5 по вартості
    const top5 = [...items]
      .map(item => {
        const s = window.whGetStock(item.id);
        return { item, qty: s.qty, val: s.qty * (item.costPrice || 0) };
      })
      .filter(x => x.val > 0)
      .sort((a, b) => b.val - a.val)
      .slice(0, 5);

    const kpis = [
      { icon: 'package',        label: window.t('whItemsCount'), value: items.length,      color: '#6366f1', click: "window._whSetView('catalog')" },
      { icon: 'layers',         label: window.t('whUnitsInStock'),  value: fmt(totalUnits),   color: '#3b82f6', click: '' },
      { icon: 'dollar-sign',    label: window.t('whStockValue'),    value: fmtMoney(totalVal),color: '#22c55e', click: '' },
      { icon: 'alert-triangle', label: 'Потреб. замовлення', value: alertsList.length, color: alertsList.length > 0 ? '#ef4444' : '#9ca3af', click: '' },
    ];

    return `
      <div style="display:flex;flex-direction:column;gap:1rem;">

        <!-- KPI картки -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;">
          ${kpis.map(k => `
            <div ${k.click ? `onclick="${k.click}" style="cursor:pointer;"` : 'style=""'}
              style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);transition:box-shadow 0.15s;" 
              onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.07)'">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                <i data-lucide="${k.icon}" style="width:16px;height:16px;color:${k.color};flex-shrink:0;"></i>
                <span style="font-size:0.75rem;color:#6b7280;">${k.label}</span>
              </div>
              <div style="font-size:1.5rem;font-weight:700;color:#1f2937;">${k.value}</div>
            </div>
          `).join('')}
        </div>

        <!-- Швидкі дії -->
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button onclick="window._whSetView('catalog',()=>window.whOpenItemForm())" style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;background:#ede9fe;color:#7c3aed;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:500;">
            <i data-lucide="plus-circle" style="width:14px;height:14px;"></i> Новий товар
          </button>
          <button onclick="window._whSetView('operations',()=>window.whOpenOpForm('IN'))" style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;background:#dcfce7;color:#166534;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:500;">
            <i data-lucide="arrow-down-circle" style="width:14px;height:14px;"></i> Прийняти товар
          </button>
          <button onclick="window._whSetView('operations',()=>window.whOpenOpForm('OUT'))" style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;background:#fee2e2;color:#991b1b;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:500;">
            <i data-lucide="arrow-up-circle" style="width:14px;height:14px;"></i> Видати товар
          </button>
          <button onclick="window._whSetView('operations',()=>window.whOpenOpForm('WRITE_OFF'))" style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;background:#fef3c7;color:#92400e;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:500;">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Списати
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0.75rem;">

          <!-- Тривоги -->
          <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
            <div style="font-size:0.88rem;font-weight:600;margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between;">
              <span style="display:flex;align-items:center;gap:0.4rem;">
                <i data-lucide="alert-triangle" style="width:15px;height:15px;color:#ef4444;"></i>
                Потребують замовлення
              </span>
              ${alertsList.length > 0 ? `<span style="font-size:0.75rem;color:#ef4444;font-weight:700;">${alertsList.length}</span>` : ''}
            </div>
            ${alertsList.length === 0
              ? `<p style="color:#9ca3af;font-size:0.82rem;text-align:center;padding:0.75rem;">${window.t('allStockOk3')}</p>`
              : alertsList.slice(0, 8).map(a => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #f9fafb;font-size:0.82rem;">
                  <div style="display:flex;align-items:center;gap:0.4rem;min-width:0;">
                    <span style="width:7px;height:7px;border-radius:50%;background:${levelColor(a.level)};flex-shrink:0;"></span>
                    <span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.item.name}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
                    <span style="color:${levelColor(a.level)};font-weight:600;">${a.stock.qty}/${a.item.minStock}</span>
                    <button onclick="window.whOpenOpForm('IN','${a.item.id}')" style="padding:2px 8px;background:#6366f1;color:white;border:none;border-radius:5px;cursor:pointer;font-size:0.72rem;">+</button>
                  </div>
                </div>
              `).join('')
            }
          </div>

          <!-- Top-5 по вартості -->
          <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
            <div style="font-size:0.88rem;font-weight:600;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;">
              <i data-lucide="trending-up" style="width:15px;height:15px;color:#6b7280;"></i>
              Топ-5 по вартості
            </div>
            ${top5.length === 0
              ? `<p style="color:#9ca3af;font-size:0.82rem;text-align:center;padding:0.75rem;">${window.t('noDataWord')}</p>`
              : top5.map((x, i) => {
                  const pct = top5[0].val > 0 ? Math.round(x.val / top5[0].val * 100) : 0;
                  return `
                    <div style="margin-bottom:0.5rem;">
                      <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:2px;">
                        <span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;">${x.item.name}</span>
                        <span style="color:#6b7280;flex-shrink:0;">${fmtMoney(x.val)}</span>
                      </div>
                      <div style="height:4px;background:#f3f4f6;border-radius:2px;">
                        <div style="height:4px;background:#6366f1;border-radius:2px;width:${pct}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')
            }
          </div>

        </div>

        <!-- Останні операції -->
        <div style="background:white;border-radius:12px;padding:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);">
          <div style="font-size:0.88rem;font-weight:600;margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between;">
            <span style="display:flex;align-items:center;gap:0.4rem;">
              <i data-lucide="clock" style="width:15px;height:15px;color:#6b7280;"></i>
              Останні операції
            </span>
            <button onclick="window._whSetView('operations')" style="font-size:0.75rem;color:#6366f1;background:none;border:none;cursor:pointer;padding:0;">Всі →</button>
          </div>
          ${ops.length === 0
            ? `<p style="color:#9ca3af;font-size:0.85rem;text-align:center;padding:1rem;">${window.t('noOpsYet2')}</p>`
            : `<div style="display:flex;flex-direction:column;gap:0.25rem;">
                ${ops.slice(0, 6).map(op => `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:0.45rem 0;border-bottom:1px solid #f9fafb;font-size:0.82rem;">
                    <div style="display:flex;align-items:center;gap:0.5rem;min-width:0;">
                      <span style="padding:1px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;flex-shrink:0;
                        background:${op.type==='IN'?'#dcfce7':op.type==='OUT'?'#fee2e2':'#fef3c7'};
                        color:${op.type==='IN'?'#166534':op.type==='OUT'?'#991b1b':'#92400e'};">
                        ${op.type==='IN'?'IN':op.type==='OUT'?'OUT':'OFF'}
                      </span>
                      <span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${op.itemName}</span>
                      ${op.note ? `<span style="color:#9ca3af;font-size:0.75rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${op.note}</span>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
                      <span style="font-weight:600;color:${op.type==='IN'?'#22c55e':'#ef4444'};">${op.type==='IN'?'+':'−'}${op.qty}</span>
                      <span style="color:#9ca3af;font-size:0.72rem;">${fmtDate(op.createdAt)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>`
          }
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
            ${items.length === 0 ? `
              <p style="color:#9ca3af;margin:0 0 0.75rem;">Каталог порожній.</p>
              <button onclick="window.whOpenItemForm()" style="padding:0.45rem 1rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">
                + Додати перший товар
              </button>
            ` : '<p style="color:#9ca3af;margin:0;">' + window.t('nothingFound2') + '</p>'}
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
                <div onclick="window._whShowItemDetail('${item.id}')" style="display:flex;align-items:flex-start;justify-content:space-between;padding:0.75rem 1rem;border-bottom:1px solid #f9fafb;gap:0.5rem;font-size:0.85rem;cursor:pointer;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''"  >
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
                    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:2px;">
                      ${item.sku ? `<span style="font-size:0.72rem;color:#9ca3af;">${item.sku}</span>` : ''}
                      ${item.category ? `<span style="font-size:0.72rem;color:#6b7280;background:#f3f4f6;padding:1px 6px;border-radius:4px;">${item.category}</span>` : ''}
                      ${item.supplierId ? window._whSupBadge(item.supplierId) : ''}
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
                    <div style="text-align:right;">
                      <div style="font-weight:600;color:${levelColor(level)};">${s.qty} <span style="font-size:0.75rem;color:#9ca3af;">${item.unit || 'шт'}</span></div>
                      ${s.reserved > 0 ? `<div style="font-size:0.7rem;color:#f59e0b;">резерв:${s.reserved}</div>` : ''}
                      ${item.costPrice ? `<div style="font-size:0.75rem;color:#6b7280;">${fmtMoney(item.costPrice)}/од</div>` : ''}
                    </div>
                    <div style="display:flex;gap:0.3rem;">
                      <button onclick="event.stopPropagation();window.whOpenOpForm('IN','${item.id}')" title="Прийняти" style="padding:5px;border:none;background:#dcfce7;border-radius:6px;cursor:pointer;">
                        <i data-lucide="arrow-down-circle" style="width:14px;height:14px;color:#16a34a;display:block;"></i>
                      </button>
                      <button onclick="event.stopPropagation();window.whOpenOpForm('OUT','${item.id}')" title="Видати" style="padding:5px;border:none;background:#fee2e2;border-radius:6px;cursor:pointer;">
                        <i data-lucide="arrow-up-circle" style="width:14px;height:14px;color:#dc2626;display:block;"></i>
                      </button>
                      <button onclick="event.stopPropagation();window.whOpenItemForm('${item.id}')" title="Редагувати" style="padding:5px;border:none;background:#f3f4f6;border-radius:6px;cursor:pointer;">
                        <i data-lucide="pencil" style="width:14px;height:14px;color:#6b7280;display:block;"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
        ${filtered.length > 0 ? `
          <div style="padding:0.6rem 1rem;background:#f9fafb;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:0.8rem;color:#6b7280;">
            <span>Показано: <b>${filtered.length}</b> з ${items.length} позицій</span>
            <span>Загальна вартість: <b style="color:#1f2937;">${fmtMoney(filtered.reduce((s,i)=>{ const st=window.whGetStock(i.id); return s+(st.qty*(i.costPrice||0)); },0))}</b></span>
          </div>
        ` : ''}
      </div>
    `;
  }

  window._whSupBadge = function (supplierId) {
    try {
      const sup = window.whGetSuppliers().find(s => s.id === supplierId);
      return sup ? `<span style="font-size:0.72rem;color:#6366f1;background:#ede9fe;padding:1px 6px;border-radius:4px;">${sup.name}</span>` : '';
    } catch (e) { return ''; }
  };

  window._whSearchCatalog = function (q) {
    _searchQuery = q;
    if (_searchTimer) clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => _render(), 200);
  };
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

    // Date filter
    if (_opDateFilter) {
      const now = Date.now();
      const cutoffs = { today: 86400000, week: 7*86400000, month: 30*86400000 };
      const ms = cutoffs[_opDateFilter] || 0;
      if (ms) filtered = filtered.filter(o => {
        const ts = o.createdAt?.toMillis?.() || 0;
        return (now - ts) <= ms;
      });
    }

    // Підсумки по відфільтрованих операціях
    const totals = filtered.reduce((acc, op) => {
      if (op.type === 'IN')             { acc.inQty += op.qty || 0; acc.inSum += (op.qty || 0) * (op.price || 0); }
      else if (op.type === 'OUT')       { acc.outQty += op.qty || 0; }
      else if (op.type === 'WRITE_OFF') { acc.offQty += op.qty || 0; }
      return acc;
    }, { inQty: 0, inSum: 0, outQty: 0, offQty: 0 });

    const typeLabel = { IN: window.t('whIncomingCaps'), OUT: 'ВИДАЧА', WRITE_OFF: 'СПИСАННЯ', ADJUST: 'КОРИГУВАННЯ' };
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
          <select onchange="window._whOpDateFilter(this.value)"
            style="padding:0.45rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
            <option value="">Весь час</option>
            <option value="today" ${_opDateFilter==='today'?'selected':''}>Сьогодні</option>
            <option value="week" ${_opDateFilter==='week'?'selected':''}>Тиждень</option>
            <option value="month" ${_opDateFilter==='month'?'selected':''}>Місяць</option>
          </select>
        </div>
        ${filtered.length > 0 ? `
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            ${totals.inQty > 0 ? `<span style="padding:0.3rem 0.75rem;background:#dcfce7;color:#166534;border-radius:8px;font-size:0.8rem;font-weight:600;">↓ Прихід: ${fmt(totals.inQty)} од · ${fmtMoney(totals.inSum)}</span>` : ''}
            ${totals.outQty > 0 ? `<span style="padding:0.3rem 0.75rem;background:#fee2e2;color:#991b1b;border-radius:8px;font-size:0.8rem;font-weight:600;">↑ Видача: ${fmt(totals.outQty)} од</span>` : ''}
            ${totals.offQty > 0 ? `<span style="padding:0.3rem 0.75rem;background:#fef3c7;color:#92400e;border-radius:8px;font-size:0.8rem;font-weight:600;">✕ Списано: ${fmt(totals.offQty)} од</span>` : ''}
            <span style="padding:0.3rem 0.75rem;background:#f3f4f6;color:#6b7280;border-radius:8px;font-size:0.8rem;">${filtered.length} записів</span>
          </div>
        ` : ''}

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

  window._whOpSearch = function (q) {
    _searchQuery = q;
    if (_searchTimer) clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => _render(), 200);
  };
  window._whOpFilter = function (v) { _opTypeFilter = v; _render(); };
  window._whOpDateFilter = function (v) { _opDateFilter = v; _render(); };

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
    const typeLabels = { warehouse: 'Склад', room: window.t('roomWord'), car: 'Авто', object: window.t('objectWord') };
    return `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <div style="display:flex;justify-content:flex-end;">
          <button onclick="window.whOpenLocationForm()" style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">
            <i data-lucide="plus" style="width:15px;height:15px;"></i> Додати локацію
          </button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;">
          ${locs.map(l => `
            <div style="background:white;border-radius:12px;padding:0.85rem 1rem;box-shadow:0 1px 3px rgba(0,0,0,0.07);display:flex;align-items:center;gap:0.75rem;">
              <i data-lucide="${typeIcons[l.type] || 'map-pin'}" style="width:20px;height:20px;color:#6366f1;flex-shrink:0;"></i>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:500;font-size:0.88rem;">${l.name}</div>
                <div style="font-size:0.75rem;color:#9ca3af;">${typeLabels[l.type] || l.type}</div>
              </div>
              ${l.isDefault ? `<span style="font-size:0.7rem;background:#ede9fe;color:#7c3aed;padding:1px 6px;border-radius:4px;">за замовч.</span>` : ''}
              <div style="display:flex;gap:0.3rem;flex-shrink:0;">
                <button onclick="window.whOpenLocationForm('${l.id}')" style="padding:4px;border:none;background:#f3f4f6;border-radius:6px;cursor:pointer;">
                  <i data-lucide="pencil" style="width:13px;height:13px;color:#6b7280;display:block;"></i>
                </button>
                ${!l.isDefault ? `<button onclick="window._whDeleteLocation('${l.id}')" style="padding:4px;border:none;background:#fee2e2;border-radius:6px;cursor:pointer;">
                  <i data-lucide="trash-2" style="width:13px;height:13px;color:#dc2626;display:block;"></i>
                </button>` : ''}
              </div>
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
    const nicheLabels = { '': 'Загальне', beauty: "Б'юті", medical: 'Медицина', kitchen: 'Кухня', construction: window.t('constructionWord'), production: 'Виробництво', other: 'Інше' };
    const existingCats = [...new Set((window.whGetItems() || []).map(i => i.category).filter(Boolean))].sort();

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
              <datalist id="wh_cat_dl">${existingCats.map(c => `<option value="${c}">`).join('')}</datalist>
              <input id="wh_cat" value="${item.category || ''}" list="wh_cat_dl" style="${_inp()}" placeholder=window.t('materialsChemPh')>
            </div>
            <div>
              <label style="font-size:0.78rem;color:#6b7280;">Одиниця</label>
              <select id="wh_unit" style="${_inp()}">
                ${units.map(u => `<option value="${u}" ${item.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:0.5rem;">
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
          ${!itemId ? `<button onclick="window._whSubmitItem('',true)" style="padding:0.45rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Зберегти і прийняти</button>` : ''}
          <button onclick="window._whSubmitItem('${itemId || ''}')" style="padding:0.45rem 0.9rem;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Зберегти</button>
        </div>
      </div>
    `);
  };

  window._whSubmitItem = async function (id, openOp) {
    const name = document.getElementById('wh_name')?.value?.trim();
    if (!name) { if (window.showToast) showToast('Введіть назву товару', 'error'); return; }
    try {
      const savedId = await window.whSaveItem({
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
      // "Зберегти і прийняти" — одразу відкриваємо форму прийому
      if (openOp && savedId) {
        setTimeout(() => window.whOpenOpForm('IN', savedId), 200);
      }
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
    const typeLabels = { IN: window.t('goodsIncoming'), OUT: 'Видача / Продаж', WRITE_OFF: 'Списання' };
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
              <label style="font-size:0.78rem;color:#6b7280;">${type === 'IN' ? window.t('pricePerUnitUAH') : window.t('costPerUnitUAH')}</label>
              <input id="wh_op_price" type="number" min="0" style="${_inp()}" placeholder="0">
            </div>
          </div>
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Локація</label>
            <select id="wh_op_loc" style="${_inp()}">
              ${locs.length > 0 ? locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('') : '<option value="main">Головний склад</option>'}
            </select>
          </div>
          <div>
            <label style="font-size:0.78rem;color:#6b7280;">Примітка</label>
            <input id="wh_op_note" style="${_inp()}" placeholder=window.t('fromSupplierPh')>
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
    if (!itemId || !qty || isNaN(qty) || qty <= 0) {
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
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1rem;flex-wrap:wrap;">
          ${supplierId ? `<button onclick="window._whDeleteSupplier('${supplierId}')" style="padding:0.45rem 0.9rem;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">Видалити</button>` : ''}
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

  window._whDeleteSupplier = async function (id) {
    if (!confirm('Видалити постачальника?')) return;
    try {
      await window.whSaveSupplier({ deleted: true }, id);
      window._whCloseModal();
      if (window.showToast) showToast('Постачальника видалено', 'info');
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
      // ESC key close
      document.addEventListener('keydown', function _whEsc(e) {
        if (e.key === 'Escape') {
          const ov = document.getElementById('whModalOverlay');
          if (ov && ov.style.display !== 'none') window._whCloseModal();
        }
      });
    }
    overlay.style.display = 'flex';
    overlay.innerHTML = `<div style="background:white;border-radius:16px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">${html}</div>`;
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
    // Autofocus first input
    setTimeout(() => {
      const first = overlay.querySelector('input:not([type=hidden]), select');
      if (first) first.focus();
    }, 60);
  }

  window._whCloseModal = function () {
    const overlay = document.getElementById('whModalOverlay');
    if (overlay) overlay.style.display = 'none';
  };

  // ── Публічний рендер alerts (для 99-warehouse-alerts.js) ─
  window._whRenderAlerts = function () {
    if (_currentView === 'dashboard') _render();
  };

  // ── Delete location ──────────────────────────────────────
  window._whDeleteLocation = async function (id) {
    if (!confirm(window.t('deleteLocation'))) return;
    try {
      const ref = (window.companyRef ? window.companyRef() : window.db.collection('companies').doc(window.currentCompanyId))
        .collection('warehouse_locations').doc(id);
      await ref.update({ deleted: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      if (window.showToast) showToast('Локацію видалено', 'info');
    } catch (e) {
      if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
  };

  // ── Деталі товару ────────────────────────────────────────
  window._whShowItemDetail = function (itemId) {
    const item = window.whGetItems().find(i => i.id === itemId);
    if (!item) return;
    const s    = window.whGetStock(itemId);
    const level = window.whStockLevel(itemId);
    const ops  = (window.whGetOperations() || []).filter(o => o.itemId === itemId).slice(0, 10);
    const sup  = item.supplierId ? window.whGetSuppliers().find(x => x.id === item.supplierId) : null;

    _showModal(`
      <div style="padding:1.25rem;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem;gap:0.5rem;">
          <div>
            <h3 style="margin:0 0 0.25rem;font-size:1.05rem;">${item.name}</h3>
            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
              ${item.sku ? `<span style="font-size:0.72rem;color:#9ca3af;background:#f3f4f6;padding:1px 7px;border-radius:4px;">${item.sku}</span>` : ''}
              ${item.category ? `<span style="font-size:0.72rem;color:#6b7280;background:#f3f4f6;padding:1px 7px;border-radius:4px;">${item.category}</span>` : ''}
            </div>
          </div>
          <button onclick="window.whOpenItemForm('${itemId}');window._whCloseModal()" style="padding:4px 8px;background:#f3f4f6;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;color:#6b7280;white-space:nowrap;">
            ✏️ Редагувати
          </button>
        </div>

        <!-- Залишки -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:1rem;">
          <div style="background:${s.qty===0 && item.minStock>0?'#fef2f2':item.minStock>0&&s.qty<=item.minStock?'#fffbeb':'#f0fdf4'};border-radius:8px;padding:0.6rem;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:${levelColor(level)};">${s.qty}</div>
            <div style="font-size:0.72rem;color:#6b7280;">залишок</div>
          </div>
          <div style="background:#f9fafb;border-radius:8px;padding:0.6rem;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:#f59e0b;">${s.reserved}</div>
            <div style="font-size:0.72rem;color:#6b7280;">резерв</div>
          </div>
          <div style="background:#f9fafb;border-radius:8px;padding:0.6rem;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:#6366f1;">${s.available}</div>
            <div style="font-size:0.72rem;color:#6b7280;">доступно</div>
          </div>
        </div>

        <!-- Фінанси -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem;font-size:0.82rem;">
          <div style="background:#f9fafb;border-radius:8px;padding:0.6rem;">
            <div style="color:#6b7280;margin-bottom:2px;">Собівартість</div>
            <div style="font-weight:600;">${item.costPrice ? fmtMoney(item.costPrice) + ' / ' + (item.unit||'шт') : '—'}</div>
          </div>
          <div style="background:#f9fafb;border-radius:8px;padding:0.6rem;">
            <div style="color:#6b7280;margin-bottom:2px;">Вартість запасу</div>
            <div style="font-weight:600;">${item.costPrice ? fmtMoney(s.qty * item.costPrice) : '—'}</div>
          </div>
          ${item.minStock ? `
          <div style="background:#f9fafb;border-radius:8px;padding:0.6rem;">
            <div style="color:#6b7280;margin-bottom:2px;">Мін. залишок</div>
            <div style="font-weight:600;">${item.minStock} ${item.unit||'шт'}</div>
          </div>` : ''}
          ${sup ? `
          <div style="background:#ede9fe;border-radius:8px;padding:0.6rem;">
            <div style="color:#7c3aed;margin-bottom:2px;">Постачальник</div>
            <div style="font-weight:600;color:#5b21b6;">${sup.name}</div>
          </div>` : ''}
        </div>

        <!-- Останні операції -->
        <div style="font-size:0.82rem;font-weight:600;color:#6b7280;margin-bottom:0.4rem;">Останні операції</div>
        ${ops.length === 0
          ? `<p style="color:#9ca3af;font-size:0.8rem;text-align:center;padding:0.5rem;">${window.t('noOps2')}</p>`
          : `<div style="max-height:180px;overflow-y:auto;">
              ${ops.map(op => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.35rem 0;border-bottom:1px solid #f3f4f6;font-size:0.8rem;">
                  <div style="display:flex;align-items:center;gap:0.4rem;">
                    <span style="padding:1px 6px;border-radius:4px;font-size:0.68rem;font-weight:700;
                      background:${op.type==='IN'?'#dcfce7':op.type==='OUT'?'#fee2e2':'#fef3c7'};
                      color:${op.type==='IN'?'#166534':op.type==='OUT'?'#991b1b':'#92400e'};">
                      ${op.type==='IN'?'IN':'OUT'}
                    </span>
                    <span>${op.type==='IN'?'+':'−'}${op.qty} ${item.unit||'шт'}</span>
                    ${op.note ? `<span style="color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px;">${op.note}</span>` : ''}
                  </div>
                  <span style="color:#9ca3af;">${fmtDate(op.createdAt)}</span>
                </div>
              `).join('')}
            </div>`
        }

        <!-- Кнопки операцій -->
        <div style="display:flex;gap:0.4rem;margin-top:1rem;flex-wrap:wrap;">
          <button onclick="window._whCloseModal();setTimeout(()=>window.whOpenOpForm('IN','${itemId}'),50)" style="flex:1;padding:0.45rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;min-width:80px;">↓ Прийняти</button>
          <button onclick="window._whCloseModal();setTimeout(()=>window.whOpenOpForm('OUT','${itemId}'),50)" style="flex:1;padding:0.45rem;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;min-width:80px;">↑ Видати</button>
          <button onclick="window._whCloseModal();setTimeout(()=>window.whOpenOpForm('WRITE_OFF','${itemId}'),50)" style="flex:1;padding:0.45rem;background:#f59e0b;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;min-width:80px;">✕ Списати</button>
          <button onclick="window._whCloseModal()" style="padding:0.45rem 0.75rem;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;">Закрити</button>
        </div>
      </div>
    `);
  };

  // ── Показати nav кнопку ──────────────────────────────────
  function showNavButton() {
    const btn = document.getElementById('warehouseNavBtn');
    if (btn) btn.style.display = '';
    // Також показуємо bizNavBtn якщо він ще прихований
    const biz = document.getElementById('bizNavBtn');
    if (biz) biz.style.display = '';
  }

  // ── Ініціалізація складу ─────────────────────────────────
  window.initWarehouse = function () {
    showNavButton();
  };

  // ── Auto-init: показуємо кнопку одразу при завантаженні модуля ──
  // (аналогічно 98-finance.js — не чекаємо featuresLoaded)
  (function _whAutoShow() {
    if (window.currentCompanyId) {
      showNavButton();
    } else {
      // Чекаємо company-ready
      const _h = function(e) {
        showNavButton();
        document.removeEventListener('talko:company-ready', _h);
      };
      document.addEventListener('talko:company-ready', _h);
      // Fallback polling — якщо event вже пройшов
      let _tries = 0;
      const _t = setInterval(function() {
        if (window.currentCompanyId || _tries++ > 20) {
          clearInterval(_t);
          showNavButton();
        }
      }, 300);
    }
  })();

  console.log('[warehouse-ui] loaded');
})();
