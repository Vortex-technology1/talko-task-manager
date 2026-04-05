var _tg = typeof _tg !== 'undefined' ? _tg : function(ua,ru){return window.currentLang==='ru'?ru:ua;};
// ============================================================
// 77i-crm-niches.js — Кастомні CRM-вкладки під ніші
// autoservice: Авто / Наряди
// horeca:      Чеки / Замовлення
// logistics:   Рейси клієнта
// ============================================================
'use strict';

function _getDb() { return window.db || (window.firebase && firebase.firestore()); }
function _getCompId() { return window.currentCompanyId || window.currentCompany || null; }
function _col(name) {
    const db = _getDb(); const cid = _getCompId();
    if (!db || !cid) throw new Error('DB or companyId not ready');
    return db.collection('companies').doc(cid).collection(name);
}
function _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
function _fmtDate(d) {
    if (!d) return '—';
    const dt = d.toDate ? d.toDate() : new Date(d);
    return dt.toLocaleDateString('uk-UA');
}
function _statusColor(s) {
    return {draft:'#9ca3af',sent:'#3b82f6',paid:'#10b981',partial:'#f59e0b',cancelled:'#ef4444',closed:'#6366f1'}[s]||'#9ca3af';
}
function _statusLabel(s) {
    return {draft:'',sent:'',paid:'',partial:'',cancelled:'',closed:''}[s]||s;
}

// ── AUTOSERVICE: Авто + Наряди клієнта ────────────────────────────────────
window._renderVehiclesTab = async function(deal) {
    const cont = document.getElementById('crmDealContent');
    if (!cont) return;
    cont.innerHTML = '<div style="padding:2rem;text-align:center;color:#9ca3af;font-size:.82rem;">Завантаження...</div>';

    try {
        const phone = deal.phone || deal.clientPhone || '';
        const clientId = deal.clientId || '';

        // Load vehicles
        let vehicles = [];
        if (clientId) {
            const snap = await _col('sales_vehicles').where('clientId','==',clientId).get();
            vehicles = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>{ const ta=a.createdAt?.toMillis?.()??0; const tb=b.createdAt?.toMillis?.()??0; return tb-ta; });
        }
        if (!vehicles.length && phone) {
            const snap = await _col('sales_vehicles').where('clientPhone','==',phone).get();
            vehicles = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>{ const ta=a.createdAt?.toMillis?.()??0; const tb=b.createdAt?.toMillis?.()??0; return tb-ta; });
        }

        // Load work orders
        let orders = [];
        if (clientId) {
            const snap = await _col('sales_orders')
                .where('type','==','work_order')
                .where('clientId','==',clientId)
                .limit(20).get();
            orders = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>{ const ta=a.createdAt?.toMillis?.()??0; const tb=b.createdAt?.toMillis?.()??0; return tb-ta; });
        }
        if (!orders.length && phone) {
            const snap = await _col('sales_orders')
                .where('type','==','work_order')
                .where('clientPhone','==',phone)
                .limit(20).get();
            orders = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>{ const ta=a.createdAt?.toMillis?.()??0; const tb=b.createdAt?.toMillis?.()??0; return tb-ta; });
        }

        const totalSpent = orders.filter(o=>o.status==='paid'||o.status==='closed').reduce((s,o)=>s+(o.total||0),0);

        cont.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem;">

            <!-- Stats -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;">
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1.2rem;font-weight:700;color:#c2410c">${vehicles.length}</div>
                    <div style="font-size:.7rem;color:#9ca3af">Авто</div>
                </div>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1.2rem;font-weight:700;color:#16a34a">${orders.length}</div>
                    <div style="font-size:.7rem;color:#9ca3af">${window.t('ordersWord')||'Нарядів'}</div>
                </div>
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1rem;font-weight:700;color:#2563eb">${_fmt(totalSpent)} ₴</div>
                    <div style="font-size:.7rem;color:#9ca3af">Витрачено</div>
                </div>
            </div>

            <!-- Vehicles -->
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
                    <b style="font-size:.8rem;color:#374151">🚗 ${window.t('clientCars')||'Автомобілі клієнта'}</b>
                    <button onclick="window._salesOpenVehicleCard && window._salesOpenVehicleCard(null)" style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;padding:3px 10px;border-radius:5px;cursor:pointer;font-size:.72rem;font-weight:600">+ Авто</button>
                </div>
                ${!vehicles.length
                    ? `<div style="font-size:.8rem;color:#9ca3af;padding:.5rem">''</div>`
                    : vehicles.map(v => `
                        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem;margin-bottom:.35rem;display:flex;justify-content:space-between;align-items:center">
                            <div>
                                <div style="font-weight:700;font-size:.85rem">${_esc(v.plate)}</div>
                                <div style="font-size:.75rem;color:#6b7280">${_esc(v.make)} ${_esc(v.model)} ${v.year||''}</div>
                                ${v.mileageHistory?.length ? `<div style="font-size:.7rem;color:#9ca3af">Пробіг: ${(v.mileageHistory.slice(-1)[0].mileage||0).toLocaleString('uk-UA')} км</div>` : ''}
                            </div>
                            <button onclick="window._salesOpenWorkOrder && window._salesOpenWorkOrder(null,'${v.id}')" style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.72rem;font-weight:600">🔧 Наряд</button>
                        </div>`).join('')}
            </div>

            <!-- Work orders -->
            <div>
                <b style="font-size:.8rem;color:#374151;display:block;margin-bottom:.5rem">📋 Наряди</b>
                ${!orders.length
                    ? `<div style="font-size:.8rem;color:#9ca3af;padding:.5rem">''</div>`
                    : orders.map(o => `
                        <div onclick="window._salesEditOrder && window._salesEditOrder('${o.id}')" style="border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem;margin-bottom:.35rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
                            <div>
                                <div style="font-weight:600;font-size:.82rem">${_esc(o.number||'—')} · ${_esc(o.vehicleInfo?.plate||'')}</div>
                                <div style="font-size:.72rem;color:#6b7280">${_fmtDate(o.createdAt)} · ${_esc(o.masterName||'')}</div>
                            </div>
                            <div style="text-align:right">
                                <div style="font-weight:700;font-size:.85rem">${_fmt(o.total)} ₴</div>
                                <div style="font-size:.7rem;color:${_statusColor(o.status)};font-weight:600">${_statusLabel(o.status)}</div>
                            </div>
                        </div>`).join('')}
            </div>
        </div>`;

    } catch(e) {
        cont.innerHTML = `<div style="padding:1rem;color:#ef4444;font-size:.82rem">Помилка: ${_esc(e.message)}</div>`;
        console.warn('_renderVehiclesTab:', e);
    }
};

// ── HORECA: Чеки клієнта ──────────────────────────────────────────────────
window._renderPosHistoryTab = async function(deal) {
    const cont = document.getElementById('crmDealContent');
    if (!cont) return;
    cont.innerHTML = '<div style="padding:2rem;text-align:center;color:#9ca3af;font-size:.82rem;">Завантаження...</div>';

    try {
        const clientName = deal.clientName || deal.title || '';
        const phone = deal.phone || '';

        // Load receipts by clientName or phone
        let orders = [];
        if (clientName) {
            const snap = await _col('sales_orders')
                .where('type','==','receipt')
                .where('clientName','==',clientName)
                .limit(30).get();
            orders = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>{ const ta=a.createdAt?.toMillis?.()??0; const tb=b.createdAt?.toMillis?.()??0; return tb-ta; });
        }

        const totalSpent = orders.reduce((s,o) => s+(o.total||0), 0);
        const visits = orders.length;
        const avg = visits > 0 ? totalSpent / visits : 0;

        cont.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem;">

            <!-- Stats -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;">
                <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1.2rem;font-weight:700;color:#a16207">${visits}</div>
                    <div style="font-size:.7rem;color:#9ca3af">${window.t('visitsWord')||'Відвідувань'}</div>
                </div>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1rem;font-weight:700;color:#16a34a">${_fmt(totalSpent)} ₴</div>
                    <div style="font-size:.7rem;color:#9ca3af">Всього</div>
                </div>
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1rem;font-weight:700;color:#2563eb">${_fmt(avg)} ₴</div>
                    <div style="font-size:.7rem;color:#9ca3af">Сер. чек</div>
                </div>
            </div>

            <!-- Receipts list -->
            <div>
                <b style="font-size:.8rem;color:#374151;display:block;margin-bottom:.5rem">🧾 Чеки</b>
                ${!orders.length
                    ? `<div style="font-size:.8rem;color:#9ca3af;padding:.5rem">
                        ''${clientName ? ` для «${_esc(clientName)}»` : ''}.
                        <br><span style="font-size:.72rem">Чеки прив'язуються до клієнта при проведенні через Реалізацію → Каса</span>
                       </div>`
                    : orders.map(o => {
                        const items = (o.items||[]).slice(0,3).map(i=>_esc(i.name)).join(', ');
                        const more = (o.items||[]).length > 3 ? ` +${(o.items||[]).length-3}` : '';
                        const pmIcon = {cash:'💵',terminal:'💳',transfer:'📱'}[o.paymentMethod]||'💳';
                        return `
                        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem;margin-bottom:.35rem">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start">
                                <div>
                                    <div style="font-weight:600;font-size:.82rem">${_esc(o.number||'—')} ${pmIcon}</div>
                                    <div style="font-size:.72rem;color:#6b7280">${_fmtDate(o.createdAt)}</div>
                                    ${items ? `<div style="font-size:.72rem;color:#9ca3af;margin-top:2px">${items}${more}</div>` : ''}
                                </div>
                                <div style="font-weight:700;color:#10b981">${_fmt(o.total)} ₴</div>
                            </div>
                        </div>`;
                    }).join('')}
            </div>
        </div>`;

    } catch(e) {
        cont.innerHTML = `<div style="padding:1rem;color:#ef4444;font-size:.82rem">Помилка: ${_esc(e.message)}</div>`;
        console.warn('_renderPosHistoryTab:', e);
    }
};

// ── LOGISTICS: Рейси клієнта (вантажовідправника) ─────────────────────────
window._renderRoutesHistoryTab = async function(deal) {
    const cont = document.getElementById('crmDealContent');
    if (!cont) return;
    cont.innerHTML = '<div style="padding:2rem;text-align:center;color:#9ca3af;font-size:.82rem;">Завантаження...</div>';

    try {
        const clientId = deal.clientId || '';
        const clientName = deal.clientName || deal.title || '';

        let routes = [];
        if (clientId) {
            const snap = await _col('sales_orders')
                .where('type','==','route')
                .where('clientId','==',clientId)
                .limit(20).get();
            routes = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>{ const ta=a.createdAt?.toMillis?.()??0; const tb=b.createdAt?.toMillis?.()??0; return tb-ta; });
        }
        if (!routes.length && clientName) {
            const snap = await _col('sales_orders')
                .where('type','==','route')
                .where('clientName','==',clientName)
                .limit(20).get();
            routes = snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>{ const ta=a.createdAt?.toMillis?.()??0; const tb=b.createdAt?.toMillis?.()??0; return tb-ta; });
        }

        const totalRev = routes.reduce((s,r) => s+(r.total||0), 0);
        const paid = routes.filter(r=>r.status==='paid'||r.status==='closed').length;

        cont.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem;">

            <!-- Stats -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;">
                <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1.2rem;font-weight:700;color:#0369a1">${routes.length}</div>
                    <div style="font-size:.7rem;color:#9ca3af">''</div>
                </div>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1rem;font-weight:700;color:#16a34a">${_fmt(totalRev)} ₴</div>
                    <div style="font-size:.7rem;color:#9ca3af">Виручка</div>
                </div>
                <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:.6rem .75rem;text-align:center">
                    <div style="font-size:1.2rem;font-weight:700;color:#a16207">${paid}</div>
                    <div style="font-size:.7rem;color:#9ca3af">Оплачено</div>
                </div>
            </div>

            <!-- Routes list -->
            <div>
                <b style="font-size:.8rem;color:#374151;display:block;margin-bottom:.5rem">🚛 Рейси</b>
                ${!routes.length
                    ? `<div style="font-size:.8rem;color:#9ca3af;padding:.5rem">
                        ''
                        <br><span style="font-size:.72rem">Рейси додаються в Реалізація → Рейси</span>
                       </div>`
                    : routes.map(r => {
                        const expenses = (r.routeExpenses||[]).reduce((s,e)=>s+(e.amount||0),0);
                        const profit = (r.total||0) - expenses;
                        return `
                        <div onclick="window._salesOpenRouteForm && window._salesOpenRouteForm('${r.id}')" style="border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem;margin-bottom:.35rem;cursor:pointer" onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background=''">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start">
                                <div>
                                    <div style="font-weight:600;font-size:.82rem">${_esc(r.number||'—')}</div>
                                    <div style="font-size:.78rem;color:#374151">${_esc(r.routeFrom||'')} → ${_esc(r.routeTo||'')}</div>
                                    <div style="font-size:.7rem;color:#6b7280">${_fmtDate(r.createdAt)} · ${_esc(r.driverName||'')}</div>
                                </div>
                                <div style="text-align:right">
                                    <div style="font-weight:700">${_fmt(r.total)} ₴</div>
                                    <div style="font-size:.7rem;color:${profit>=0?'#10b981':'#ef4444'};font-weight:600">прибуток ${_fmt(profit)} ₴</div>
                                    <div style="font-size:.7rem;color:${_statusColor(r.status)};font-weight:600">${_statusLabel(r.status)}</div>
                                </div>
                            </div>
                            ${r.notes ? `<div style="font-size:.7rem;color:#9ca3af;margin-top:3px">${_esc(r.notes)}</div>` : ''}
                        </div>`;
                    }).join('')}
            </div>

            <!-- New route button -->
            <button onclick="window._salesOpenRouteForm && window._salesOpenRouteForm(null)" style="background:#0369a1;color:white;border:none;padding:.5rem 1rem;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:600;width:100%">
                ''
            </button>
        </div>`;

    } catch(e) {
        cont.innerHTML = `<div style="padding:1rem;color:#ef4444;font-size:.82rem">Помилка: ${_esc(e.message)}</div>`;
        console.warn('_renderRoutesHistoryTab:', e);
    }
};

console.log('[77i] CRM niche extensions loaded');
