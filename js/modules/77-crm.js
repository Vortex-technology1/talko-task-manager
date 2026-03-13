// ============================================================
// 77-crm.js — TALKO CRM v3.0 (AmoCRM style)
// Clean UI: no emojis, SVG icons, minimal design
// ============================================================
(function () {
'use strict';

// ── SVG Icons ──────────────────────────────────────────────
const I = {
    deal:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    user:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    phone:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    money:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>',
    chart:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    plus:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    close:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    edit:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
    note:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    call:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    meet:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    ai:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    arrow:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    tg:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    web:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    ig:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    check:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
    funnel:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    users:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    list:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    kanban:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="12" rx="1"/></svg>',
    filter:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    tag:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    task:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    copy:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    search:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    clock:    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    hot:      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
};

// ── State ──────────────────────────────────────────────────
let crm = {
    deals: [], clients: [], pipeline: null, pipelines: [],
    stats: null, unsubs: [], subTab: 'kanban',
    activeDealId: null, dragDealId: null, loading: true,
    saving: false,
    dealUnsub: null, clientUnsub: null,
    // Фільтри для kanban/list
    filters: { assignee: '', stage: '', tag: '', search: '' },
    // Режим перегляду: kanban | list
    viewMode: 'kanban',
    // Сортування list view
    listSort: { field: 'updatedAt', dir: 'desc' },
    // Bulk selection
    selectedIds: new Set(),
};

// ── Init ───────────────────────────────────────────────────
window.initCRMModule = async function () {
    if (!window.currentCompanyId) return;
    // FIX: guard порівнює companyId — при logout/login скидається
    if (crm._initializingFor === window.currentCompanyId && crm.pipeline) return;
    crm._initializingFor = window.currentCompanyId;
    crm.saving = false; // FIX: скидаємо saving guard при реініціалізації
    crm._remindersChecked = false;
    // FIX: очищаємо попередній інтервал нагадувань
    if (crm._remindersInterval) { clearInterval(crm._remindersInterval); crm._remindersInterval = null; }
    _renderShell();
    try {
        await _loadAll();
    } catch(e) {
        console.error('[CRM]', e.message);
        crm._initializingFor = null; // FIX: дозволяємо повторну ініціалізацію
        const c = document.getElementById('crmViewKanban');
        if (c) c.innerHTML = `<div style="padding:2rem;text-align:center;color:#ef4444;font-size:0.82rem;">
            Помилка: ${window.htmlEsc ? window.htmlEsc(e.message) : e.message}<br>
            <button onclick="crm._initializingFor=null;window.initCRMModule()" style="margin-top:0.75rem;padding:0.4rem 1rem;
            background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;">Повторити</button></div>`;
        crm.loading = false;
    }
    _listenEventBus();
};

// ── Shell ──────────────────────────────────────────────────
function _renderShell() {
    const container = document.getElementById('crmContainer');
    if (!container) return;

    const tabs = [
        ['todo',       I.task,      window.t('crmTabTodo')],
        ['kanban',     I.funnel,    window.t('crmTabFunnel')],
        ['clients',    I.users,     window.t('crmTabClients')],
        ['activities', I.calendar,  window.t('crmTabActivities')],
        ['analytics',  I.chart,     window.t('crmTabAnalytics')],
        ['settings',   I.settings,  window.t('crmTabSettings')],
    ];

    container.innerHTML = `
    <div style="height:calc(100vh - 56px);display:flex;flex-direction:column;background:#f4f5f7;">

        <!-- Top bar -->
        <div style="background:white;border-bottom:1px solid #e8eaed;padding:0 1rem;
            display:flex;align-items:center;justify-content:space-between;height:48px;flex-shrink:0;">
            <div style="display:flex;gap:0;height:100%;">
                ${tabs.map(([id, icon, label]) => `
                <button onclick="crmSwitchTab('${id}')" id="crmTab_${id}"
                    style="display:flex;align-items:center;gap:0.4rem;padding:0 1rem;
                    height:100%;background:none;border:none;border-bottom:2px solid transparent;
                    cursor:pointer;font-size:0.82rem;font-weight:500;color:#6b7280;
                    transition:all 0.15s;">
                    ${icon} ${label}
                </button>`).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
                <!-- Пошук -->
                <div id="crmSearchWrap" style="display:none;align-items:center;gap:0.3rem;
                    background:#f4f5f7;border-radius:7px;padding:0.3rem 0.6rem;">
                    ${I.search}
                    <input id="crmSearchInput" placeholder="Пошук угод..."
                        oninput="crmApplyFilters()"
                        style="border:none;background:none;outline:none;font-size:0.8rem;width:160px;">
                    <button onclick="document.getElementById('crmSearchInput').value='';crmApplyFilters()"
                        style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.9rem;line-height:1;">×</button>
                </div>
                <!-- Toggle kanban/list -->
                <div id="crmViewToggle" style="display:none;gap:2px;">
                    <button id="crmToggleKanban" onclick="crmSetViewMode('kanban')"
                        title="Kanban" style="padding:0.3rem 0.5rem;border:1px solid #e8eaed;border-radius:6px 0 0 6px;
                        background:white;cursor:pointer;display:flex;align-items:center;color:#6b7280;">
                        ${I.kanban}
                    </button>
                    <button id="crmToggleList" onclick="crmSetViewMode('list')"
                        title="Список" style="padding:0.3rem 0.5rem;border:1px solid #e8eaed;border-radius:0 6px 6px 0;
                        background:white;cursor:pointer;display:flex;align-items:center;color:#6b7280;">
                        ${I.list}
                    </button>
                </div>
                <button onclick="crmOpenCreateDeal()"
                    style="display:flex;align-items:center;gap:0.35rem;padding:0.4rem 0.9rem;
                    background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;
                    font-size:0.81rem;font-weight:600;">
                    ${I.plus} Угода
                </button>
            </div>
        </div>

        <!-- Content -->
        <div style="flex:1;overflow:hidden;">
            <div id="crmViewTodo" style="height:100%;overflow:auto;display:none;"></div>
            <div id="crmViewKanban" style="height:100%;overflow:auto;"></div>
            <div id="crmViewClients" style="height:100%;overflow:auto;display:none;padding:1rem;"></div>
            <div id="crmViewActivities" style="height:100%;overflow:auto;display:none;padding:1rem;"></div>
            <div id="crmViewAnalytics" style="height:100%;overflow:auto;display:none;padding:1rem;"></div>
            <div id="crmViewSettings" style="height:100%;overflow:auto;display:none;padding:1rem;"></div>
        </div>
    </div>`;

    crmSwitchTab('kanban');
}

// Фільтрація угод з урахуванням filters state
function _filteredDeals() {
    let deals = crm.deals;
    const f = crm.filters;
    if (f.search) {
        const q = f.search.toLowerCase();
        deals = deals.filter(d =>
            (d.title||'').toLowerCase().includes(q) ||
            (d.clientName||'').toLowerCase().includes(q) ||
            (d.clientNiche||'').toLowerCase().includes(q) ||
            (d.note||'').toLowerCase().includes(q)
        );
    }
    if (f.assignee) deals = deals.filter(d => d.assigneeId === f.assignee);
    if (f.stage)    deals = deals.filter(d => d.stage === f.stage);
    if (f.tag)      deals = deals.filter(d => (d.tags||[]).includes(f.tag));
    return deals;
}

window.crmApplyFilters = function() {
    const q = document.getElementById('crmSearchInput')?.value || '';
    crm.filters.search = q;
    if (crm.viewMode === 'kanban') _renderKanban();
    else _renderListView();
};

window.crmSetViewMode = function(mode) {
    crm.viewMode = mode;
    document.getElementById('crmToggleKanban').style.background = mode==='kanban' ? '#f0fdf4' : 'white';
    document.getElementById('crmToggleKanban').style.color = mode==='kanban' ? '#16a34a' : '#6b7280';
    document.getElementById('crmToggleList').style.background = mode==='list' ? '#f0fdf4' : 'white';
    document.getElementById('crmToggleList').style.color = mode==='list' ? '#16a34a' : '#6b7280';
    const kanbanView = document.getElementById('crmViewKanban');
    if (!kanbanView) return;
    if (mode === 'kanban') {
        kanbanView.style.display = '';
        document.getElementById('crmListView')?.remove();
        _renderKanban();
    } else {
        kanbanView.style.display = 'none';
        _renderListView();
    }
};

window.crmSwitchTab = function(tab) {
    crm.subTab = tab;
    ['todo','kanban','clients','activities','analytics','settings'].forEach(t => {
        const view = document.getElementById('crmView' + t.charAt(0).toUpperCase() + t.slice(1));
        const btn  = document.getElementById('crmTab_' + t);
        if (view) view.style.display = t === tab ? '' : 'none';
        if (btn) {
            btn.style.borderBottomColor = t === tab ? '#22c55e' : 'transparent';
            btn.style.color = t === tab ? '#22c55e' : '#6b7280';
            btn.style.fontWeight = t === tab ? '600' : '500';
        }
    });
    if (tab === 'todo')       { if (typeof renderCrmTodo === 'function') renderCrmTodo(); }
    if (tab === 'kanban')     _renderKanban();
    if (tab === 'clients')    _renderClients();
    if (tab === 'activities') _renderActivitiesTab();
    if (tab === 'analytics')  _renderAnalytics();
    if (tab === 'settings')   _renderCRMSettings();
};

// ── Load ───────────────────────────────────────────────────
async function _loadAll() {
    const base = window.companyRef();
    if (!base) throw new Error('companyRef not ready');
    // FIX: очищуємо окремо deals і clients unsubs
    if (crm.dealUnsub)   { crm.dealUnsub();   crm.dealUnsub   = null; }
    if (crm.clientUnsub) { crm.clientUnsub(); crm.clientUnsub = null; }

    const pipSnap = await base.collection('crm_pipeline').get();
    crm.pipelines = pipSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    window.crm = crm; // expose після завантаження pipelines
    if (!crm.pipelines.length) await _createDefaultPipeline();
    crm.pipeline = crm.pipelines.find(p => p.isDefault) || crm.pipelines[0];

    _subscribeDeals();

    crm.clientUnsub = base.collection('crm_clients').orderBy('createdAt', 'desc').limit(500)
        .onSnapshot(snap => {
            crm.clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (crm.subTab === 'clients') _renderClients();
            if (!crm._remindersChecked) {
                crm._remindersChecked = true;
                setTimeout(() => { _checkContactReminders(); _startRemindersScheduler(); }, 1000);
            }
        }, err => console.error('[CRM clients]', err));
}

async function _createDefaultPipeline() {
    const stages = [
        { id:'new',         label:window.t('crmStageNew'),        color:'#6b7280', order:0 },
        { id:'contact',     label:window.t('crmStageContact'),      color:'#3b82f6', order:1 },
        { id:'negotiation', label:window.t('crmStageNegotiation'),   color:'#8b5cf6', order:2 },
        { id:'proposal',    label:window.t('crmStageProposal'),   color:'#f59e0b', order:3 },
        { id:'closing',     label:window.t('crmStageClosing'),     color:'#f97316', order:4 },
        { id:'won',         label:window.t('crmStageWon'),      color:'#22c55e', order:5 },
        { id:'lost',        label:window.t('crmStageLost'),     color:'#ef4444', order:6 },
    ];
    const ref = await window.companyRef()
        .collection(window.DB_COLS.CRM_PIPELINE).add({
            name:window.t('crmDefaultPipeline'), isDefault:true, stages,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    crm.pipelines = [{ id: ref.id, name:window.t('crmDefaultPipeline'), isDefault:true, stages }];
    crm.pipeline  = crm.pipelines[0];
}

// ── Event Bus ──────────────────────────────────────────────
function _listenEventBus() {
    if (typeof window.TALKO_EVENTS === 'undefined') return;
    if (crm._eventBusBound) return; // guard — один listener
    crm._eventBusBound = true;
    window.addEventListener('talko:event', function(e) {
        const ev = e.detail;
        if (ev && ev.type === window.TALKO_EVENTS?.DEAL_CREATED) {
            if (typeof showToast === 'function') showToast(window.t('crmNewLeadEvent'), 'success');
        }
    });
}

// ══════════════════════════════════════════════════════════
// KANBAN
// ══════════════════════════════════════════════════════════
function _renderKanban() {
    const c = document.getElementById('crmViewKanban');
    if (!c) return;
    if (crm.viewMode === 'list') { _renderListView(); return; }

    if (crm.loading) {
        c.innerHTML = '<div style="text-align:center;padding:4rem;color:#9ca3af;font-size:0.85rem;">Завантаження...</div>';
        return;
    }

    // FIX B: попередження якщо угод >= ліміт (500)
    const limitBanner = crm._dealsLimitReached
        ? `<div style="background:#fffbeb;border-bottom:1px solid #fde68a;padding:0.4rem 1rem;font-size:0.72rem;color:#92400e;display:flex;align-items:center;gap:0.5rem;">
            ⚠️ Показано перші 500 угод. Виграні/програні угоди краще архівувати для покращення продуктивності.
           </div>` : '';

    const stages    = (crm.pipeline?.stages || []).slice().sort((a,b) => a.order - b.order);
    const mainStages = stages.filter(s => s.id !== 'lost');
    const lostStage  = stages.find(s => s.id === 'lost');

    const total    = crm.deals.length;
    const active   = crm.deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
    const won      = crm.deals.filter(d => d.stage === 'won').length;
    const revenue  = crm.deals.filter(d => d.stage === 'won').reduce((s,d) => s+(d.amount||0), 0);
    const pipeline = crm.deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s,d) => s+(d.amount||0), 0);

    // Висота kanban board залежить від наявності switcher рядка
    const switcherHeight = crm.pipelines.length > 1 ? 89 : 57;

    c.innerHTML = `
    ${limitBanner}
    <!-- Pipeline switcher + Stats row -->
    <div style="background:white;border-bottom:1px solid #e8eaed;">
        ${crm.pipelines.length > 1 ? `
        <div style="display:flex;gap:0.3rem;padding:0.4rem 0.75rem;background:#f8fafc;border-bottom:1px solid #f1f5f9;overflow-x:auto;flex-wrap:nowrap;">
            ${crm.pipelines.map(p => `
            <button onclick="crmSelectPipeline('${p.id}')"
                style="padding:0.2rem 0.65rem;border-radius:5px;border:1px solid ${p.id === crm.pipeline?.id ? '#22c55e' : '#e8eaed'};
                background:${p.id === crm.pipeline?.id ? '#f0fdf4' : 'white'};
                color:${p.id === crm.pipeline?.id ? '#16a34a' : '#6b7280'};
                font-size:0.72rem;font-weight:${p.id === crm.pipeline?.id ? '700' : '500'};
                cursor:pointer;white-space:nowrap;flex-shrink:0;">
                ${_esc(p.name)}
            </button>`).join('')}
        </div>` : ''}
        <div style="display:flex;gap:1px;background:#e8eaed;">
            ${[
                [window.t('crmDealsCount'), total],
                [window.t('crmActiveCount'), active],
                [window.t('crmStageWon'), won],
                ['Revenue', _fmt(revenue)],
                ['Pipeline', _fmt(pipeline)],
            ].map(([l,v]) => `
            <div style="flex:1;background:white;padding:0.65rem 1rem;">
                <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${v}</div>
                <div style="font-size:0.68rem;color:#9ca3af;margin-top:1px;">${l}</div>
            </div>`).join('')}
        </div>
    </div>

    <!-- Kanban board -->
    <div style="display:flex;gap:0;height:calc(100% - ${switcherHeight}px);overflow-x:auto;">
        ${mainStages.map(s => _kanbanCol(s)).join('')}
        ${lostStage ? _kanbanColLost(lostStage) : ''}
    </div>`;
}

function _kanbanCol(stage) {
    const deals = _filteredDeals().filter(d => d.stage === stage.id);
    const amt   = deals.reduce((s,d) => s+(d.amount||0), 0);

    return `
    <div data-stage="${stage.id}"
        style="min-width:220px;flex:1;background:#f4f5f7;border-right:1px solid #e8eaed;
        display:flex;flex-direction:column;max-height:100%;"
        ondragover="crmDragOver(event)" ondragleave="crmDragLeave(event)" ondrop="crmDrop(event,'${stage.id}')">

        <!-- Col header -->
        <div style="padding:0.65rem 0.75rem;background:white;border-bottom:1px solid #e8eaed;
            border-top:3px solid ${stage.color};flex-shrink:0;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.78rem;font-weight:700;color:#374151;">${_esc(stage.label)}</span>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span style="font-size:0.68rem;color:#9ca3af;">${deals.length}</span>
                    <button onclick="crmOpenCreateDeal('${stage.id}')"
                        style="width:20px;height:20px;background:#f4f5f7;border:none;border-radius:4px;
                        cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;"
                        title="${window.t('crmAddDeal')}">${I.plus}</button>
                </div>
            </div>
            ${amt > 0 ? `<div style="font-size:0.68rem;color:#9ca3af;margin-top:2px;">${_fmt(amt)}</div>` : ''}
        </div>

        <!-- Cards -->
        <div style="flex:1;overflow-y:auto;padding:0.5rem;display:flex;flex-direction:column;gap:0.4rem;"
            id="crmCol_${stage.id}">
            ${deals.length ? deals.map(d => _dealCard(d)).join('') : `
            <div style="margin-top:0.5rem;border:2px dashed #dde1e7;border-radius:8px;
                padding:1.5rem 0.5rem;text-align:center;color:#c4c9d4;font-size:0.72rem;">
                Перетягни сюди
            </div>`}
        </div>
    </div>`;
}

function _kanbanColLost(stage) {
    const deals = _filteredDeals().filter(d => d.stage === 'lost');
    return `
    <div data-stage="lost"
        style="width:160px;flex-shrink:0;background:#fef2f2;border-left:1px solid #e8eaed;
        display:flex;flex-direction:column;max-height:100%;"
        ondragover="crmDragOver(event)" ondragleave="crmDragLeave(event)" ondrop="crmDrop(event,'lost')">
        <div style="padding:0.65rem 0.75rem;border-bottom:1px solid #fecaca;border-top:3px solid #ef4444;flex-shrink:0;">
            <span style="font-size:0.78rem;font-weight:700;color:#ef4444;">${_esc(stage.label)}</span>
            <span style="font-size:0.68rem;color:#fca5a5;margin-left:0.35rem;">${deals.length}</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:0.5rem;display:flex;flex-direction:column;gap:0.3rem;">
            ${deals.slice(0,8).map(d => `
            <div onclick="crmOpenDeal('${d.id}')"
                style="background:white;border-radius:6px;padding:0.4rem 0.5rem;cursor:pointer;
                border-left:2px solid #ef4444;font-size:0.72rem;color:#6b7280;
                overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                title="${_esc(d.clientName||d.title||'')}">
                ${_esc((d.clientName||d.title||window.t('crmDeal')).slice(0,24))}
            </div>`).join('')}
            ${deals.length > 8 ? `<div style="font-size:0.68rem;color:#fca5a5;text-align:center;padding:0.25rem;">+${deals.length-8}</div>` : ''}
        </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════
// LIST VIEW (таблиця угод — альтернатива kanban)
// ══════════════════════════════════════════════════════════
function _renderListView() {
    // Прибираємо kanban з поля зору
    const kanbanEl = document.getElementById('crmViewKanban');
    if (kanbanEl) kanbanEl.style.display = 'none';
    // Або render в existing container
    const container = document.getElementById('crmContainer');
    if (!container) return;
    let listEl = document.getElementById('crmListView');
    if (!listEl) {
        listEl = document.createElement('div');
        listEl.id = 'crmListView';
        listEl.style.cssText = 'flex:1;overflow-y:auto;background:#f4f5f7;';
        // Вставляємо після kanban view
        const kanban = document.getElementById('crmViewKanban');
        if (kanban && kanban.parentNode) kanban.parentNode.insertBefore(listEl, kanban.nextSibling);
        else container.appendChild(listEl);
    }
    listEl.style.display = '';

    const deals = _filteredDeals();
    // Сортування
    const { field, dir } = crm.listSort;
    deals.sort((a,b) => {
        let av = a[field], bv = b[field];
        if (field === 'updatedAt' || field === 'createdAt') {
            av = av?.toMillis ? av.toMillis() : (av ? new Date(av).getTime() : 0);
            bv = bv?.toMillis ? bv.toMillis() : (bv ? new Date(bv).getTime() : 0);
        }
        if (av == null) av = dir === 'asc' ? Infinity : -Infinity;
        if (bv == null) bv = dir === 'asc' ? Infinity : -Infinity;
        return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    // Скидаємо вибір при кожному ре-рендері якщо не в bulk режимі
    if (!crm._bulkMode) crm.selectedIds = new Set();

    const colHdr = (label, f) => {
        const active = crm.listSort.field === f;
        const arrow = active ? (crm.listSort.dir === 'asc' ? '↑' : '↓') : '';
        return `<th onclick="crmListSort('${f}')" style="padding:0.5rem 0.75rem;font-size:0.72rem;
            font-weight:600;color:${active?'#22c55e':'#6b7280'};cursor:pointer;text-align:left;
            white-space:nowrap;user-select:none;border-bottom:2px solid #e8eaed;background:white;">
            ${label} ${arrow}
        </th>`;
    };

    const bulkBar = crm.selectedIds.size > 0 ? `
    <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;
        background:#1f2937;border-radius:8px;margin-bottom:0.5rem;flex-wrap:wrap;">
        <span style="font-size:0.8rem;font-weight:600;color:white;">
            Обрано: ${crm.selectedIds.size}
        </span>
        <div style="display:flex;gap:0.35rem;margin-left:0.5rem;flex-wrap:wrap;">
            <button onclick="crmBulkStage()" style="padding:0.3rem 0.7rem;background:#374151;color:white;border:1px solid #4b5563;border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:600;">
                Змінити стадію
            </button>
            <button onclick="crmBulkAssign()" style="padding:0.3rem 0.7rem;background:#374151;color:white;border:1px solid #4b5563;border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:600;">
                Призначити
            </button>
            <button onclick="crmBulkTag()" style="padding:0.3rem 0.7rem;background:#374151;color:white;border:1px solid #4b5563;border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:600;">
                Додати тег
            </button>
            <button onclick="crmBulkDelete()" style="padding:0.3rem 0.7rem;background:#7f1d1d;color:#fca5a5;border:1px solid #991b1b;border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:600;">
                Видалити
            </button>
        </div>
        <button onclick="crm.selectedIds=new Set();crm._bulkMode=false;crmSetViewMode('list')"
            style="margin-left:auto;padding:0.3rem 0.6rem;background:none;color:#9ca3af;border:1px solid #4b5563;border-radius:6px;cursor:pointer;font-size:0.72rem;">
            Скасувати
        </button>
    </div>` : '';

    const stages = crm.pipeline?.stages || [];
    const today = new Date().toISOString().split('T')[0];

    listEl.innerHTML = `
    <div style="padding:0.75rem 1rem;">
        <!-- Фільтр-бар -->
        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;align-items:center;">
            <select onchange="crm.filters.assignee=this.value;crmSetViewMode('list')"
                style="padding:0.35rem 0.5rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.78rem;background:white;cursor:pointer;">
                <option value="">Всі відповідальні</option>
                ${(typeof users!=='undefined'?users:[]).map(u=>`<option value="${u.id}" ${crm.filters.assignee===u.id?'selected':''}>${_esc(u.name||u.email)}</option>`).join('')}
            </select>
            <select onchange="crm.filters.stage=this.value;crmSetViewMode('list')"
                style="padding:0.35rem 0.5rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.78rem;background:white;cursor:pointer;">
                <option value="">Всі стадії</option>
                ${stages.map(s=>`<option value="${s.id}" ${crm.filters.stage===s.id?'selected':''}>${_esc(s.label)}</option>`).join('')}
            </select>
            ${crm.filters.assignee || crm.filters.stage || crm.filters.search ? `
            <button onclick="crm.filters={assignee:'',stage:'',tag:'',search:''};document.getElementById('crmSearchInput').value='';crmSetViewMode('list')"
                style="padding:0.35rem 0.65rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.75rem;background:white;cursor:pointer;color:#6b7280;">
                × Скинути
            </button>` : ''}
            <div style="margin-left:auto;font-size:0.78rem;color:#9ca3af;">${deals.length} угод</div>
        </div>

        ${bulkBar}

        <!-- Таблиця -->
        <div style="background:white;border-radius:10px;border:1px solid #e8eaed;overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="width:36px;padding:0.5rem 0.5rem 0.5rem 0.75rem;border-bottom:2px solid #e8eaed;background:white;">
                            <input type="checkbox" id="crmBulkAll" onchange="crmBulkSelectAll(this.checked)"
                                style="cursor:pointer;width:14px;height:14px;accent-color:#22c55e;">
                        </th>
                        ${colHdr(window.t('crmDealCol'),'title')}
                        ${colHdr(window.t('crmClientCol'),'clientName')}
                        ${colHdr(window.t('crmStageCol'),'stage')}
                        ${colHdr(window.t('crmAmountCol'),'amount')}
                        ${colHdr(window.t('crmAssigneeCol'),'assigneeId')}
                        ${colHdr(window.t('crmNextContactCol'),'nextContactDate')}
                        ${colHdr(window.t('crmUpdatedCol'),'updatedAt')}
                        <th style="width:80px;border-bottom:2px solid #e8eaed;background:white;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${deals.length === 0 ? `
                    <tr><td colspan="9" style="text-align:center;padding:3rem;color:#9ca3af;font-size:0.82rem;">
                        Угод не знайдено
                    </td></tr>` :
                    deals.map((d,i) => {
                        const stage = stages.find(s=>s.id===d.stage);
                        const assignee = (typeof users!=='undefined'?users:[]).find(u=>u.id===d.assigneeId);
                        const isOverdue = d.nextContactDate && d.nextContactDate < today && d.stage!=='won' && d.stage!=='lost';
                        const upd = d.updatedAt?.toDate ? _relTime(d.updatedAt.toDate()) : '—';
                        const isSelected = crm.selectedIds.has(d.id);
                        return `
                        <tr style="cursor:pointer;background:${isSelected?'#f0fdf4':i%2===0?'white':'#fafafa'};
                            transition:background 0.1s;border-left:3px solid ${isSelected?'#22c55e':'transparent'};"
                            onmouseenter="if(!crm.selectedIds.has('${d.id}'))this.style.background='#f0fdf4'"
                            onmouseleave="if(!crm.selectedIds.has('${d.id}'))this.style.background='${i%2===0?'white':'#fafafa'}'">
                            <td style="padding:0.6rem 0.5rem 0.6rem 0.75rem;border-bottom:1px solid #f3f4f6;" onclick="event.stopPropagation()">
                                <input type="checkbox" data-id="${d.id}" onchange="crmBulkToggle('${d.id}',this.checked)"
                                    ${isSelected?'checked':''} style="cursor:pointer;width:14px;height:14px;accent-color:#22c55e;">
                            </td>
                            <td onclick="crmOpenDeal('${d.id}')" style="padding:0.6rem 0.75rem;font-size:0.8rem;font-weight:600;color:#111827;
                                max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:1px solid #f3f4f6;">
                                ${d.isHot ? `<span style="color:#f97316;margin-right:4px;">${I.hot}</span>` : ''}
                                ${_esc(d.title||d.clientName||'—')}
                            </td>
                            <td onclick="crmOpenDeal('${d.id}')" style="padding:0.6rem 0.75rem;font-size:0.78rem;color:#6b7280;border-bottom:1px solid #f3f4f6;
                                max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                ${_esc(d.clientName||'—')}
                            </td>
                            <td onclick="crmOpenDeal('${d.id}')" style="padding:0.6rem 0.75rem;border-bottom:1px solid #f3f4f6;">
                                ${stage ? `<span style="font-size:0.72rem;font-weight:600;padding:2px 8px;border-radius:20px;
                                    background:${stage.color}18;color:${stage.color};">${_esc(stage.label)}</span>` : '—'}
                            </td>
                            <td onclick="crmOpenDeal('${d.id}')" style="padding:0.6rem 0.75rem;font-size:0.8rem;font-weight:700;
                                color:${d.amount?'#16a34a':'#d1d5db'};border-bottom:1px solid #f3f4f6;white-space:nowrap;">
                                ${d.amount ? _fmt(d.amount) : '—'}
                            </td>
                            <td onclick="crmOpenDeal('${d.id}')" style="padding:0.6rem 0.75rem;font-size:0.75rem;color:#6b7280;border-bottom:1px solid #f3f4f6;">
                                ${_esc(assignee?.name || assignee?.email || '—')}
                            </td>
                            <td onclick="crmOpenDeal('${d.id}')" style="padding:0.6rem 0.75rem;border-bottom:1px solid #f3f4f6;">
                                ${d.nextContactDate ? `<span style="font-size:0.72rem;padding:2px 7px;border-radius:10px;font-weight:600;
                                    background:${isOverdue?'#fef2f2':'#eff6ff'};color:${isOverdue?'#ef4444':'#3b82f6'};">
                                    ${d.nextContactDate}</span>` : '—'}
                            </td>
                            <td onclick="crmOpenDeal('${d.id}')" style="padding:0.6rem 0.75rem;font-size:0.72rem;color:#9ca3af;border-bottom:1px solid #f3f4f6;white-space:nowrap;">
                                ${upd}
                            </td>
                            <td style="padding:0.6rem 0.75rem;border-bottom:1px solid #f3f4f6;" onclick="event.stopPropagation()">
                                <div style="display:flex;gap:4px;">
                                    <button onclick="crmOpenDeal('${d.id}')" title="Відкрити"
                                        style="padding:3px 6px;border:1px solid #e8eaed;border-radius:5px;background:white;cursor:pointer;
                                        font-size:0.68rem;color:#6b7280;display:flex;align-items:center;">${I.edit}</button>
                                    <button onclick="crmDuplicateDeal('${d.id}')" title="Дублювати"
                                        style="padding:3px 6px;border:1px solid #e8eaed;border-radius:5px;background:white;cursor:pointer;
                                        font-size:0.68rem;color:#6b7280;display:flex;align-items:center;">${I.copy}</button>
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
}

window.crmListSort = function(field) {
    if (crm.listSort.field === field) {
        crm.listSort.dir = crm.listSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        crm.listSort = { field, dir: 'desc' };
    }
    _renderListView();
};

// ── Bulk Actions ───────────────────────────────────────────
window.crmBulkSelectAll = function(checked) {
    crm._bulkMode = true;
    if (checked) {
        _filteredDeals().forEach(function(d) { crm.selectedIds.add(d.id); });
    } else {
        crm.selectedIds = new Set();
        crm._bulkMode = false;
    }
    _renderListView();
};

window.crmBulkToggle = function(dealId, checked) {
    crm._bulkMode = true;
    if (checked) {
        crm.selectedIds.add(dealId);
    } else {
        crm.selectedIds.delete(dealId);
        if (crm.selectedIds.size === 0) crm._bulkMode = false;
    }
    // Оновлюємо bulk bar без повного ре-рендеру
    _renderListView();
};

window.crmBulkStage = function() {
    if (crm.selectedIds.size === 0) return;
    document.getElementById('crmBulkActionMenu')?.remove();
    const stages = (crm.pipeline?.stages || []).slice().sort(function(a,b){ return a.order-b.order; });
    const menu = document.createElement('div');
    menu.id = 'crmBulkActionMenu';
    menu.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10060;display:flex;align-items:center;justify-content:center;padding:1rem;';
    menu.innerHTML = '<div style="background:white;border-radius:12px;padding:1.25rem;width:320px;max-width:95vw;">' +
        '<div style="font-weight:700;font-size:0.9rem;color:#111827;margin-bottom:0.75rem;">Змінити стадію (' + crm.selectedIds.size + ' угод)</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.3rem;" id="bulkStageList">' +
        stages.map(function(s) {
            return '<button data-sid="' + s.id + '" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.65rem;' +
                'border:1px solid #e8eaed;border-radius:7px;background:white;cursor:pointer;font-size:0.8rem;text-align:left;">' +
                '<span style="width:8px;height:8px;border-radius:50%;background:' + s.color + ';flex-shrink:0;"></span>' +
                s.label + '</button>';
        }).join('') +
        '</div>' +
        '<button id="bulkStageCancelBtn" style="margin-top:0.75rem;width:100%;padding:0.45rem;background:#f3f4f6;color:#374151;border:none;border-radius:7px;cursor:pointer;font-size:0.8rem;">Скасувати</button>' +
        '</div>';
    document.body.appendChild(menu);
    menu.querySelector('#bulkStageList').addEventListener('click', async function(e) {
        const btn = e.target.closest('button[data-sid]');
        if (!btn) return;
        menu.remove();
        const newStage = btn.dataset.sid;
        if (newStage === 'lost') {
            if (typeof showToast === 'function') showToast('Для стадії "Програно" використовуйте індивідуальну зміну', 'error');
            return;
        }
        await _bulkUpdateDeals({ stage: newStage });
    });
    menu.querySelector('#bulkStageCancelBtn').addEventListener('click', function() { menu.remove(); });
};

window.crmBulkAssign = function() {
    if (crm.selectedIds.size === 0) return;
    document.getElementById('crmBulkActionMenu')?.remove();
    const userList = typeof users !== 'undefined' ? users : [];
    if (userList.length === 0) {
        if (typeof showToast === 'function') showToast(window.t('crmNoUsers'), 'error');
        return;
    }
    const menu = document.createElement('div');
    menu.id = 'crmBulkActionMenu';
    menu.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10060;display:flex;align-items:center;justify-content:center;padding:1rem;';
    menu.innerHTML = '<div style="background:white;border-radius:12px;padding:1.25rem;width:300px;max-width:95vw;">' +
        '<div style="font-weight:700;font-size:0.9rem;color:#111827;margin-bottom:0.75rem;">Призначити відповідального (' + crm.selectedIds.size + ')</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.3rem;" id="bulkAssignList">' +
        userList.map(function(u) {
            return '<button data-uid="' + u.id + '" style="padding:0.5rem 0.65rem;border:1px solid #e8eaed;border-radius:7px;background:white;cursor:pointer;font-size:0.8rem;text-align:left;">' +
                (u.name || u.email) + '</button>';
        }).join('') +
        '</div>' +
        '<button id="bulkAssignCancel" style="margin-top:0.75rem;width:100%;padding:0.45rem;background:#f3f4f6;color:#374151;border:none;border-radius:7px;cursor:pointer;font-size:0.8rem;">Скасувати</button>' +
        '</div>';
    document.body.appendChild(menu);
    menu.querySelector('#bulkAssignList').addEventListener('click', async function(e) {
        const btn = e.target.closest('button[data-uid]');
        if (!btn) return;
        menu.remove();
        await _bulkUpdateDeals({ assigneeId: btn.dataset.uid });
    });
    menu.querySelector('#bulkAssignCancel').addEventListener('click', function() { menu.remove(); });
};

window.crmBulkTag = function() {
    if (crm.selectedIds.size === 0) return;
    document.getElementById('crmBulkActionMenu')?.remove();
    const menu = document.createElement('div');
    menu.id = 'crmBulkActionMenu';
    menu.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10060;display:flex;align-items:center;justify-content:center;padding:1rem;';
    menu.innerHTML = '<div style="background:white;border-radius:12px;padding:1.25rem;width:300px;max-width:95vw;">' +
        '<div style="font-weight:700;font-size:0.9rem;color:#111827;margin-bottom:0.75rem;">Додати тег (' + crm.selectedIds.size + ' угод)</div>' +
        '<input id="bulkTagInput" placeholder="Введіть тег..." autofocus ' +
        'style="width:100%;padding:0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;box-sizing:border-box;margin-bottom:0.5rem;">' +
        '<div style="display:flex;gap:0.5rem;">' +
        '<button id="bulkTagCancel" style="flex:1;padding:0.45rem;background:#f3f4f6;color:#374151;border:none;border-radius:7px;cursor:pointer;font-size:0.8rem;">Скасувати</button>' +
        '<button id="bulkTagConfirm" style="flex:1;padding:0.45rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.8rem;font-weight:600;">Додати</button>' +
        '</div>' +
        '</div>';
    document.body.appendChild(menu);
    menu.querySelector('#bulkTagCancel').addEventListener('click', function() { menu.remove(); });
    menu.querySelector('#bulkTagConfirm').addEventListener('click', async function() {
        const tag = menu.querySelector('#bulkTagInput').value.trim();
        if (!tag) return;
        menu.remove();
        const ids = Array.from(crm.selectedIds);
        let done = 0;
        for (const dealId of ids) {
            const deal = crm.deals.find(function(d){ return d.id === dealId; });
            if (!deal) continue;
            const tags = [...new Set([...(deal.tags||[]), tag])];
            try {
                await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId)
                    .update({ tags, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
                deal.tags = tags;
                done++;
            } catch(e) { console.error('[Bulk tag]', e); }
        }
        if (typeof showToast === 'function') showToast('Тег додано до ' + done + ' угод', 'success');
        crm.selectedIds = new Set();
        crm._bulkMode = false;
        _renderListView();
    });
    menu.querySelector('#bulkTagInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') menu.querySelector('#bulkTagConfirm').click();
    });
};

window.crmBulkDelete = async function() {
    if (crm.selectedIds.size === 0) return;
    const count = crm.selectedIds.size;
    const confirmed = await (window.showConfirmModal
        ? showConfirmModal('Видалити ' + count + ' угод? Цю дію не можна скасувати.', { danger: true })
        : Promise.resolve(confirm('Видалити ' + count + ' угод?')));
    if (!confirmed) return;
    const ids = Array.from(crm.selectedIds);
    let done = 0;
    for (const dealId of ids) {
        try {
            const dealRef = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId);
            // FIX A: видаляємо history субколекцію перед видаленням угоди
            try {
                const histSnap = await dealRef.collection('history').limit(100).get();
                if (!histSnap.empty) {
                    const batch = firebase.firestore().batch();
                    histSnap.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
            } catch(he) { console.warn('[Bulk delete] history cleanup:', he.message); }
            await dealRef.delete();
            crm.deals = crm.deals.filter(function(d){ return d.id !== dealId; });
            done++;
        } catch(e) { console.error('[Bulk delete]', e); }
    }
    if (typeof showToast === 'function') showToast('Видалено ' + done + ' угод', 'success');
    crm.selectedIds = new Set();
    crm._bulkMode = false;
    _renderKanban();
};

async function _bulkUpdateDeals(updates) {
    const ids = Array.from(crm.selectedIds);
    updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    let done = 0;
    for (const dealId of ids) {
        const deal = crm.deals.find(function(d){ return d.id === dealId; });
        if (!deal) continue;
        try {
            await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId).update(updates);
            Object.assign(deal, updates);
            done++;
        } catch(e) { console.error('[Bulk update]', dealId, e); }
    }
    if (typeof showToast === 'function') showToast('Оновлено ' + done + ' угод', 'success');
    crm.selectedIds = new Set();
    crm._bulkMode = false;
    // FIX: рендеримо поточний режим, не завжди list
    if (crm.viewMode === 'kanban') _renderKanban();
    else _renderListView();
}

// ── Дублювання угоди ──
window.crmDuplicateDeal = async function(dealId) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    try {
        const copy = {
            title:           (deal.title || deal.clientName || '') + window.t('crmCopySuffix'),
            clientName:      deal.clientName || '',
            clientNiche:     deal.clientNiche || '',
            clientId:        deal.clientId || null,
            stage:           'new',
            pipelineId:      deal.pipelineId || crm.pipeline?.id || '',
            amount:          deal.amount || 0,
            source:          deal.source || 'manual',
            tags:            deal.tags || [],
            note:            deal.note || '',
            assigneeId:      window.currentUser?.uid || null,
            creatorId:       window.currentUser?.uid || null,
            stageEnteredAt:  firebase.firestore.FieldValue.serverTimestamp(), // FIX
            createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:       firebase.firestore.FieldValue.serverTimestamp(),
        };
        const ref = await window.companyRef().collection(window.DB_COLS.CRM_DEALS).add(copy);
        await ref.collection('history').add({ type:'created', text:'Дублікат угоди #'+dealId.slice(-6), by: window.currentUser?.email||'manager', at: firebase.firestore.FieldValue.serverTimestamp() });
        if (window.showToast) showToast(window.t('crmDuplicated'), 'success');
    } catch(e) {
        if (window.showToast) showToast('Помилка: '+e.message, 'error');
    }
};

function _dealCard(deal) {
    const colors  = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899'];
    const color   = colors[(deal.clientName||'a').charCodeAt(0) % colors.length];
    const initial = (deal.clientName || deal.title || '?').charAt(0).toUpperCase();
    const date    = deal.updatedAt?.toDate ? _relTime(deal.updatedAt.toDate()) : '';
    const srcIcon = { telegram: I.tg, instagram: I.ig, site_form: I.web, manual: I.user }[deal.source] || I.deal;

    // Stale detection: не активна 7+ днів (не won/lost)
    const isActive = deal.stage !== 'won' && deal.stage !== 'lost';
    const updMs = deal.updatedAt?.toMillis ? deal.updatedAt.toMillis() : (deal.updatedAt ? new Date(deal.updatedAt).getTime() : 0);
    const daysSinceUpdate = updMs ? Math.floor((Date.now() - updMs) / 86400000) : 999;
    const isStale = isActive && daysSinceUpdate >= 7;
    const staleDays = isStale ? daysSinceUpdate : 0;

    // Час в поточній стадії
    const stageMs = deal.stageEnteredAt?.toMillis ? deal.stageEnteredAt.toMillis() : (deal.stageEnteredAt ? new Date(deal.stageEnteredAt).getTime() : (updMs || 0));
    const daysInStage = stageMs ? Math.floor((Date.now() - stageMs) / 86400000) : 0;
    const stageTimeLabel = daysInStage > 0 ? (daysInStage === 1 ? '1 день' : daysInStage < 5 ? daysInStage + ' дні' : daysInStage + ' днів') : window.t('crmDayToday');
    const stageTimeColor = daysInStage >= 14 ? '#ef4444' : daysInStage >= 7 ? '#f59e0b' : '#9ca3af';

    return `
    <div draggable="true" data-deal-id="${deal.id}"
        ondragstart="crmDragStart(event,'${deal.id}')"
        onclick="crmOpenDeal('${deal.id}')"
        style="background:white;border-radius:7px;padding:0.65rem;cursor:pointer;
        border:1px solid ${deal.isHot ? '#f97316' : isStale ? '#d1d5db' : '#e8eaed'};transition:box-shadow 0.15s,border-color 0.15s;position:relative;opacity:${isStale ? '0.82' : '1'};"
        onmouseenter="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.1)'"
        onmouseleave="this.style.boxShadow='none'">

        <!-- Title -->
        <div style="font-size:0.8rem;font-weight:600;color:#1f2937;margin-bottom:0.45rem;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${_esc(deal.title || deal.clientName || window.t('crmDeal'))}
        </div>

        <!-- Client row -->
        <div style="display:flex;align-items:center;gap:0.35rem;margin-bottom:0.4rem;">
            <div style="width:18px;height:18px;border-radius:50%;background:${color};
                display:flex;align-items:center;justify-content:center;
                font-size:0.6rem;font-weight:700;color:white;flex-shrink:0;">${initial}</div>
            <span style="font-size:0.72rem;color:#6b7280;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${_esc(deal.clientName || '—')}
            </span>
            <span style="color:#9ca3af;">${srcIcon}</span>
        </div>

        ${deal.clientNiche ? `
        <div style="font-size:0.65rem;background:#f0fdf4;color:#16a34a;padding:1px 6px;
            border-radius:4px;display:inline-block;margin-bottom:0.4rem;font-weight:500;">
            ${_esc(deal.clientNiche)}
        </div>` : ''}

        <!-- Amount + date -->
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.78rem;font-weight:700;color:${deal.amount ? '#16a34a' : '#d1d5db'};">
                ${deal.amount ? _fmt(deal.amount) : '—'}
            </span>
            <span style="font-size:0.62rem;color:${stageTimeColor};font-weight:${daysInStage>=7?'600':'400'};" title="Час в стадії">${isActive ? '⏱ '+stageTimeLabel : date}</span>
        </div>
        ${deal.nextContactDate ? `<div style="margin-top:0.35rem;font-size:0.65rem;padding:2px 6px;border-radius:4px;display:inline-block;font-weight:600;background:${deal.nextContactDate < new Date().toISOString().split('T')[0] ? '#fef2f2' : '#eff6ff'};color:${deal.nextContactDate < new Date().toISOString().split('T')[0] ? '#ef4444' : '#3b82f6'};">📅 ${deal.nextContactDate}</div>` : ''}
        ${(deal.tags||[]).length ? `<div style="margin-top:0.3rem;display:flex;flex-wrap:wrap;gap:2px;">${(deal.tags||[]).map(tag=>`<span style="font-size:0.6rem;padding:1px 5px;background:#f3f4f6;color:#6b7280;border-radius:3px;">${_esc(tag)}</span>`).join('')}</div>` : ''}
        ${deal.isHot ? `<div style="position:absolute;top:6px;right:6px;color:#f97316;">${I.hot}</div>` : ''}
        ${isStale ? `<div style="position:absolute;top:6px;right:${deal.isHot?'22px':'6px'};color:#9ca3af;" title="${staleDays} днів без активності">${I.clock}</div>` : ''}

        <!-- Quick stage bar -->
        <div style="margin-top:0.4rem;display:flex;gap:2px;align-items:center;" onclick="event.stopPropagation()">
            <button onclick="crmQuickStage(event,'${deal.id}')"
                title="Змінити стадію"
                style="flex:1;padding:2px 0;background:#f4f5f7;border:1px solid #e8eaed;border-radius:4px;
                cursor:pointer;font-size:0.65rem;color:#6b7280;display:flex;align-items:center;justify-content:center;gap:3px;">
                ${I.arrow} <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:90px;">${_stageLabel(deal.stage)}</span>
            </button>
            ${crm.pipelines && crm.pipelines.length > 1 ? `
            <div style="position:relative;" onclick="event.stopPropagation()">
                <button onclick="crmTogglePipelineMenu(event,'${deal.id}')"
                    title="Перемістити у іншу воронку"
                    style="padding:2px 5px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:4px;
                    cursor:pointer;font-size:0.65rem;color:#7c3aed;display:flex;align-items:center;gap:2px;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                </button>
                <div id="kanbanPipelineMenu_${deal.id}" style="display:none;position:absolute;bottom:calc(100% + 4px);right:0;
                    background:white;border:1px solid #e5e7eb;border-radius:10px;
                    box-shadow:0 8px 24px rgba(0,0,0,0.14);min-width:160px;z-index:1000;padding:0.3rem;">
                    ${crm.pipelines.filter(p => p.id !== crm.pipeline?.id).map(p => `
                    <button onclick="crmMoveDealToPipeline('${deal.id}','${p.id}','${_esc(p.name)}')"
                        style="width:100%;text-align:left;padding:0.45rem 0.65rem;border:none;background:none;
                        font-size:0.78rem;color:#374151;cursor:pointer;border-radius:7px;display:flex;align-items:center;gap:6px;"
                        onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        ${_esc(p.name)}
                    </button>`).join('')}
                </div>
            </div>` : ''}
        </div>
    </div>`;
}

// ── Drag & Drop ────────────────────────────────────────────
window.crmDragStart = function(e, dealId) {
    crm.dragDealId = dealId;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { if(e.currentTarget) e.currentTarget.style.opacity = '0.4'; }, 0);
};
window.crmDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.currentTarget;
    col.style.background = col.dataset.stage === 'lost' ? '#fee2e2' : '#eef2ff';
};
window.crmDragLeave = function(e) {
    const col = e.currentTarget;
    col.style.background = col.dataset.stage === 'lost' ? '#fef2f2' : '#f4f5f7';
};
window.crmDrop = async function(e, newStage) {
    e.preventDefault();
    const col = e.currentTarget;
    col.style.background = col.dataset.stage === 'lost' ? '#fef2f2' : '#f4f5f7';
    if (!crm.dragDealId) return;
    const deal = crm.deals.find(d => d.id === crm.dragDealId);
    crm.dragDealId = null;
    if (!deal || deal.stage === newStage) return;

    // Якщо drag в "lost" — показуємо причину програшу
    if (newStage === 'lost') {
        _showLostReasonModal(deal.id, newStage, deal.stage);
        return;
    }

    const oldStage = deal.stage;
    deal.stage = newStage;
    _renderKanban();
    try {
        // Перевірка обов'язкових полів
        const ok = await _checkRequiredFields(deal, newStage);
        if (!ok) { deal.stage = oldStage; _renderKanban(); return; }

        const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(deal.id);
        const stageUpdate = { stage: newStage, stageEnteredAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (newStage === 'won') stageUpdate.wonAt = firebase.firestore.FieldValue.serverTimestamp(); // FIX
        await ref.update(stageUpdate);
        deal.stageEnteredAt = { toMillis: () => Date.now() };
        await ref.collection('history').add({
            type:'stage_changed', from:oldStage, to:newStage,
            by: window.currentUser?.email || 'manager',
            at: firebase.firestore.FieldValue.serverTimestamp(),
        });
        if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS) {
            await emitTalkoEvent(window.TALKO_EVENTS.DEAL_STAGE_CHANGED, {
                dealId:deal.id, clientName:deal.clientName,
                fromStage:oldStage, toStage:newStage,
                pipelineId:deal.pipelineId, amount:deal.amount,
                clientId: deal.clientId || null,          // FIX CF: required for task creation
                assignedToId: deal.assignedToId || deal.assigneeId || null, // FIX CF
            });
        }
        if (typeof showToast === 'function') showToast(_stageLabel(newStage), 'success');
        if (crm.subTab === 'todo' && typeof renderCrmTodo === 'function') renderCrmTodo();
        if (typeof window.trackAction === 'function') {
            window.trackAction('crm_stage', {
                dealId: deal.id,
                clientName: deal.clientName || deal.title || '',
                from: oldStage, to: newStage,
                fromLabel: _stageLabel(oldStage), toLabel: _stageLabel(newStage),
            });
        }
    } catch(err) {
        console.error('[CRM drop]', err);
        deal.stage = oldStage;
        _renderKanban();
    }
};

// ── Швидка зміна стадії з картки ──────────────────────────
window.crmQuickStage = function(e, dealId) {
    e.stopPropagation();
    // Прибираємо попередній dropdown якщо є
    document.getElementById('crmQuickStageMenu')?.remove();

    const deal = crm.deals.find(function(d){ return d.id === dealId; });
    if (!deal) return;
    const stages = (crm.pipeline?.stages || []).slice().sort(function(a,b){ return a.order - b.order; });

    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    const menu = document.createElement('div');
    menu.id = 'crmQuickStageMenu';
    menu.style.cssText = 'position:fixed;z-index:10050;background:white;border:1px solid #e8eaed;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:4px;min-width:180px;';
    menu.style.left = Math.min(rect.left, window.innerWidth - 200) + 'px';
    menu.style.top = (rect.bottom + 4) + 'px';

    menu.innerHTML = '<div style="font-size:0.65rem;font-weight:700;color:#9ca3af;text-transform:uppercase;padding:4px 8px 2px;">Змінити стадію</div>' +
        stages.map(function(s) {
            const isActive = s.id === deal.stage;
            return '<button data-did="' + dealId + '" data-sid="' + s.id + '" ' +
                'style="display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;background:' + (isActive ? '#f0fdf4' : 'transparent') + ';' +
                'border:none;border-radius:5px;cursor:pointer;font-size:0.78rem;text-align:left;color:' + (isActive ? '#16a34a' : '#374151') + ';">' +
                '<span style="width:8px;height:8px;border-radius:50%;background:' + s.color + ';flex-shrink:0;"></span>' +
                s.label +
                (isActive ? ' <span style="margin-left:auto;font-size:0.7rem;">✓</span>' : '') +
                '</button>';
        }).join('');
    // Event delegation для кнопок стадій
    menu.addEventListener('click', function(ev) {
        const btn = ev.target.closest('button[data-did]');
        if (btn) { crmQuickSetStage(btn.dataset.did, btn.dataset.sid); }
    });

    document.body.appendChild(menu);

    // Закриваємо при кліку зовні
    function closeMenu(ev) {
        if (!menu.contains(ev.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    }
    setTimeout(function(){ document.addEventListener('click', closeMenu); }, 0);
};

window.crmQuickSetStage = async function(dealId, newStage) {
    document.getElementById('crmQuickStageMenu')?.remove();
    const deal = crm.deals.find(function(d){ return d.id === dealId; });
    if (!deal || deal.stage === newStage) return;

    // Якщо переходимо в "lost" — показуємо причину програшу
    if (newStage === 'lost') {
        _showLostReasonModal(dealId, newStage, deal.stage);
        return;
    }

    const oldStage = deal.stage;
    deal.stage = newStage;
    _renderKanban();

    try {
        // Перевірка обов'язкових полів
        const ok = await _checkRequiredFields(deal, newStage);
        if (!ok) { deal.stage = oldStage; _renderKanban(); return; }

        const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(deal.id);
        const stageUpdate2 = { stage: newStage, stageEnteredAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (newStage === 'won') stageUpdate2.wonAt = firebase.firestore.FieldValue.serverTimestamp(); // FIX
        await ref.update(stageUpdate2);
        deal.stageEnteredAt = { toMillis: () => Date.now() };
        await ref.collection('history').add({
            type: 'stage_changed', from: oldStage, to: newStage,
            by: window.currentUser?.email || 'manager',
            at: firebase.firestore.FieldValue.serverTimestamp(),
        });
        if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS) {
            emitTalkoEvent(window.TALKO_EVENTS.DEAL_STAGE_CHANGED, {
                dealId: deal.id, clientName: deal.clientName,
                fromStage: oldStage, toStage: newStage,
                pipelineId: deal.pipelineId, amount: deal.amount,
                clientId: deal.clientId || null,          // FIX CF
                assignedToId: deal.assignedToId || deal.assigneeId || null, // FIX CF
            });
        }
        if (typeof showToast === 'function') showToast(_stageLabel(newStage), 'success');
    } catch(err) {
        console.error('[CRM quickStage]', err);
        deal.stage = oldStage;
        _renderKanban();
        if (typeof showToast === 'function') showToast('Помилка: ' + err.message, 'error');
    }
};

// ── Причина програшу угоди ────────────────────────────────
const LOST_REASONS = [
    { id: 'price',       label: window.t('crmLostPrice') },
    { id: 'competitor',  label: window.t('crmLostCompetitor') },
    { id: 'not_target',  label: window.t('crmLostNotTarget') },
    { id: 'no_response', label: window.t('crmLostNoResponse') },
    { id: 'postponed',   label: window.t('crmLostPostponed') },
    { id: 'budget',      label: window.t('crmLostNoBudget') },
    { id: 'other',       label: window.t('crmLostOther') },
];

function _showLostReasonModal(dealId, newStage, oldStage) {
    document.getElementById('crmLostModal')?.remove();
    const deal = crm.deals.find(function(d){ return d.id === dealId; });
    if (!deal) return;

    const modal = document.createElement('div');
    modal.id = 'crmLostModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10060;display:flex;align-items:center;justify-content:center;padding:1rem;';

    modal.innerHTML =
        '<div style="background:white;border-radius:12px;padding:1.5rem;width:380px;max-width:95vw;">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">' +
                '<div style="width:32px;height:32px;background:#fef2f2;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#ef4444;flex-shrink:0;">' + I.trash + '</div>' +
                '<div>' +
                    '<div style="font-weight:700;font-size:0.92rem;color:#111827;">Причина програшу</div>' +
                    '<div style="font-size:0.72rem;color:#9ca3af;">' + _esc(deal.clientName || deal.title || '') + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.75rem;" id="lostReasonList">' +
                LOST_REASONS.map(function(r) {
                    return '<button data-rid="' + r.id + '" id="lr_' + r.id + '" ' +
                        'style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.65rem;border:1.5px solid #e8eaed;' +
                        'border-radius:7px;background:white;cursor:pointer;font-size:0.8rem;text-align:left;color:#374151;transition:all 0.1s;">' +
                        '<span style="width:8px;height:8px;border-radius:50%;background:#e8eaed;flex-shrink:0;" id="lrd_' + r.id + '"></span>' +
                        r.label + '</button>';
                }).join('') +
            '</div>' +
            '<div style="margin-bottom:0.75rem;">' +
                '<input id="lostReasonNote" placeholder="Коментар (необов\'язково)..." ' +
                'style="width:100%;padding:0.45rem 0.55rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.8rem;box-sizing:border-box;">' +
            '</div>' +
            '<div style="display:flex;gap:0.5rem;justify-content:flex-end;">' +
                '<button id="lostCancelBtn" style="padding:0.5rem 1rem;background:#f3f4f6;color:#374151;border:none;border-radius:7px;cursor:pointer;font-size:0.82rem;">Скасувати</button>' +
                '<button id="lostConfirmBtn" style="padding:0.5rem 1.25rem;background:#ef4444;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:600;font-size:0.82rem;">Програно</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);
    window._selectedLostReason = null;
    // Event delegation для reason buttons
    var reasonList = modal.querySelector('#lostReasonList');
    if (reasonList) {
        reasonList.addEventListener('click', function(ev) {
            var btn = ev.target.closest('button[data-rid]');
            if (btn) crmSelectLostReason(btn.dataset.rid);
        });
    }
    // Cancel button
    var cancelBtn = modal.querySelector('#lostCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.remove();
            if (oldStage) {
                var d = crm.deals.find(function(x){ return x.id === dealId; });
                if (d) { d.stage = oldStage; _renderKanban(); }
            }
        });
    }
    // Confirm button
    var confirmBtn = modal.querySelector('#lostConfirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            crmConfirmLost(dealId, newStage, oldStage || '');
        });
    }
}

window.crmSelectLostReason = function(reasonId) {
    window._selectedLostReason = reasonId;
    LOST_REASONS.forEach(function(r) {
        const btn = document.getElementById('lr_' + r.id);
        const dot = document.getElementById('lrd_' + r.id);
        if (btn) {
            const active = r.id === reasonId;
            btn.style.borderColor = active ? '#ef4444' : '#e8eaed';
            btn.style.background = active ? '#fef2f2' : 'white';
            btn.style.color = active ? '#ef4444' : '#374151';
            if (dot) dot.style.background = active ? '#ef4444' : '#e8eaed';
        }
    });
};

window.crmConfirmLost = async function(dealId, newStage, oldStage) {
    const reason = window._selectedLostReason;
    const note = document.getElementById('lostReasonNote')?.value.trim() || '';
    const reasonLabel = reason ? (LOST_REASONS.find(function(r){ return r.id === reason; })?.label || reason) : '';

    document.getElementById('crmLostModal')?.remove();

    const deal = crm.deals.find(function(d){ return d.id === dealId; });
    if (!deal) return;

    deal.stage = newStage;
    _renderKanban();

    try {
        const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(deal.id);
        await ref.update({
            stage: newStage,
            lostReason: reason || null,
            lostReasonLabel: reasonLabel || null,
            lostNote: note || null,
            lostAt: firebase.firestore.FieldValue.serverTimestamp(),
            stageEnteredAt: firebase.firestore.FieldValue.serverTimestamp(), // FIX D
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await ref.collection('history').add({
            type: 'stage_changed', from: oldStage, to: newStage,
            lostReason: reasonLabel || null, note: note || null,
            by: window.currentUser?.email || 'manager',
            at: firebase.firestore.FieldValue.serverTimestamp(),
        });
        if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS) {
            emitTalkoEvent(window.TALKO_EVENTS.DEAL_STAGE_CHANGED, {
                dealId: deal.id, clientName: deal.clientName,
                fromStage: oldStage, toStage: newStage,
                lostReason: reason, amount: deal.amount,
                clientId: deal.clientId || null,          // FIX CF
                assignedToId: deal.assignedToId || deal.assigneeId || null, // FIX CF
            });
        }
        if (typeof window.trackAction === 'function') {
            window.trackAction('crm_stage', {
                dealId: deal.id,
                clientName: deal.clientName || deal.title || '',
                from: oldStage, to: newStage,
                fromLabel: _stageLabel(oldStage), toLabel: 'Програно',
                lostReason: reasonLabel || '',
            });
        }
        if (typeof showToast === 'function') showToast('Угоду закрито: ' + (reasonLabel || window.t('crmLostBtn')), 'error');
    } catch(err) {
        console.error('[CRM lost]', err);
        deal.stage = oldStage || 'new';
        _renderKanban();
        if (typeof showToast === 'function') showToast('Помилка: ' + err.message, 'error');
    }
};

// ══════════════════════════════════════════════════════════
// КАРТКА УГОДИ
// ══════════════════════════════════════════════════════════
window.crmOpenDeal = function(dealId) {
    crm.activeDealId = dealId;
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    document.getElementById('crmDealOverlay')?.remove();

    const stages = crm.pipeline?.stages || [];
    const inp = 'width:100%;padding:0.45rem 0.55rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;background:white;';
    const lbl = 'font-size:0.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.25rem;letter-spacing:0.03em;';

    document.body.insertAdjacentHTML('beforeend', `
    <div id="crmDealOverlay" onclick="if(event.target===this)crmCloseDeal()"
        style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10020;
        display:flex;align-items:stretch;justify-content:flex-end;">
        <div style="background:white;width:100%;max-width:520px;display:flex;flex-direction:column;
            box-shadow:-8px 0 32px rgba(0,0,0,0.12);">

            <!-- Header -->
            <div style="padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9;
                display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <div>
                    <div style="font-weight:700;font-size:0.95rem;color:#111827;">
                        ${_esc(deal.title || deal.clientName || window.t('crmDeal'))}
                    </div>
                    <div style="font-size:0.72rem;color:#9ca3af;margin-top:2px;">
                        ${_esc(deal.clientName || '')}
                        ${deal.clientNiche ? ` · ${_esc(deal.clientNiche)}` : ''}
                        ${deal.nextContactDate ? `<span style="margin-left:6px;padding:1px 7px;border-radius:8px;font-size:0.68rem;font-weight:600;background:${deal.nextContactDate < new Date().toISOString().split('T')[0] ? '#fef2f2' : '#f0fdf4'};color:${deal.nextContactDate < new Date().toISOString().split('T')[0] ? '#ef4444' : '#16a34a'};">📅 ${deal.nextContactDate}</span>` : ''}
                    </div>
                </div>
                <div style="display:flex;gap:0.4rem;align-items:center;">
                    <button onclick="crmDeleteDeal('${deal.id}')"
                        style="padding:0.35rem;background:none;border:1px solid #e8eaed;border-radius:6px;
                        cursor:pointer;color:#9ca3af;display:flex;align-items:center;"
                        title="${window.t('crmDelete')}">${I.trash}</button>
                    <button onclick="crmCloseDeal()"
                        style="padding:0.35rem;background:none;border:1px solid #e8eaed;border-radius:6px;
                        cursor:pointer;color:#9ca3af;display:flex;align-items:center;">${I.close}</button>
                </div>
            </div>

            <!-- Sub-tabs -->
            <div style="display:flex;border-bottom:1px solid #f1f5f9;flex-shrink:0;">
                ${[['details',window.t('crmDetails')],['activity',window.t('crmTabActivities')],['tasks','Задачі'],['ai','AI']].map(([id,label]) => `
                <button onclick="crmDealTab('${deal.id}','${id}')" id="cdt_${id}"
                    style="flex:1;padding:0.6rem;background:none;border:none;border-bottom:2px solid transparent;
                    cursor:pointer;font-size:0.8rem;font-weight:500;color:#6b7280;transition:all 0.15s;">
                    ${label}
                </button>`).join('')}
            </div>

            <!-- Content -->
            <div id="crmDealContent" style="flex:1;overflow-y:auto;padding:1.25rem;"></div>

            <!-- Footer -->
            <div style="padding:0.75rem 1.25rem;border-top:1px solid #f1f5f9;flex-shrink:0;
                display:flex;gap:0.5rem;justify-content:flex-end;">
                <button onclick="crmCreateTaskFromDeal('${deal.id}')"
                    style="padding:0.5rem 1rem;background:white;color:#374151;border:1px solid #e8eaed;
                    border-radius:7px;cursor:pointer;font-size:0.82rem;display:flex;align-items:center;gap:0.35rem;"
                    title="Створити задачу в Task Manager">
                    ${I.check} Задача
                </button>
                <button onclick="window.crmCreateInvoiceForDeal('${deal.id}')"
                    style="padding:0.5rem 1rem;background:white;color:#374151;border:1px solid #e8eaed;
                    border-radius:7px;cursor:pointer;font-size:0.82rem;display:flex;align-items:center;gap:0.35rem;"
                    title="Виставити рахунок для угоди">
                    💰 Рахунок
                </button>
                <button onclick="crmSaveDeal('${deal.id}')"
                    style="padding:0.5rem 1.25rem;background:#22c55e;color:white;border:none;
                    border-radius:7px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                    Зберегти
                </button>
            </div>
        </div>
    </div>`);

    crmDealTab(deal.id, 'details');
};

window.crmDealTab = function(dealId, tab) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    ['details','activity','tasks','ai'].forEach(t => {
        const btn = document.getElementById('cdt_' + t);
        if (btn) {
            btn.style.borderBottomColor = t === tab ? '#22c55e' : 'transparent';
            btn.style.color = t === tab ? '#22c55e' : '#6b7280';
            btn.style.fontWeight = t === tab ? '600' : '500';
        }
    });
    if (tab === 'details')  _renderDealDetails(deal);
    if (tab === 'activity') _loadActivityTab(deal);
    if (tab === 'tasks')    _loadTasksTab(deal);
    if (tab === 'ai')       _loadAITab(deal);
};

function _renderDealDetails(deal) {
    const content = document.getElementById('crmDealContent');
    if (!content) return;
    const stages = crm.pipeline?.stages || [];
    const inp = 'width:100%;padding:0.45rem 0.55rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
    const lbl = 'font-size:0.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.25rem;letter-spacing:0.03em;';
    const row = 'margin-bottom:0.9rem;';

    content.innerHTML = `
    <div style="${row}">
        <label style="${lbl}">Назва угоди</label>
        <input id="dd_title" value="${_esc(deal.title||deal.clientName||'')}" style="${inp}">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.9rem;">
        <div>
            <label style="${lbl}">Стадія</label>
            <select id="dd_stage" style="${inp}background:white;cursor:pointer;">
                ${stages.map(s => `<option value="${s.id}" ${s.id===deal.stage?'selected':''}>${_esc(s.label)}</option>`).join('')}
            </select>
        </div>
        <div>
            <label style="${lbl}">Сума</label>
            <input id="dd_amount" type="number" value="${deal.amount||''}" placeholder="0" style="${inp}">
        </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.9rem;">
        <div>
            <label style="${lbl}">Клієнт</label>
            <input id="dd_client" value="${_esc(deal.clientName||'')}" style="${inp}">
        </div>
        <div>
            <label style="${lbl}">Ніша</label>
            <input id="dd_niche" value="${_esc(deal.clientNiche||'')}" style="${inp}">
        </div>
    </div>
    <!-- Омніканал — швидкі дії по контакту -->
    ${(deal.phone||deal.email||deal.telegram||deal.instagram) ? `
    <div style="margin-bottom:0.75rem;">
        <label style="${lbl}">Зв'язатись</label>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.3rem;">
            ${deal.phone ? `
            <a href="tel:${_esc(deal.phone)}" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:7px;color:#16a34a;font-size:0.78rem;font-weight:600;text-decoration:none;">
                📞 Дзвінок
            </a>
            <a href="https://wa.me/${(deal.phone||'').replace(/[^0-9]/g,'')}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:7px;color:#16a34a;font-size:0.78rem;font-weight:600;text-decoration:none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18a7.96 7.96 0 0 1-4.073-1.114l-.292-.174-3.012.79.803-2.927-.19-.3A7.96 7.96 0 0 1 4 12c0-4.411 3.588-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                WhatsApp
            </a>
            <a href="viber://chat?number=${(deal.phone||'').replace(/[^0-9]/g,'')}" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#f5f0ff;border:1px solid #ddd6fe;border-radius:7px;color:#7c3aed;font-size:0.78rem;font-weight:600;text-decoration:none;">
                📱 Viber
            </a>` : ''}
            ${deal.telegram ? `
            <a href="https://t.me/${(deal.telegram||'').replace('@','')}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;color:#2563eb;font-size:0.78rem;font-weight:600;text-decoration:none;">
                ✈️ Telegram
            </a>` : ''}
            ${deal.instagram ? `
            <a href="https://instagram.com/${(deal.instagram||'').replace('@','')}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#fdf4ff;border:1px solid #f0abfc;border-radius:7px;color:#a21caf;font-size:0.78rem;font-weight:600;text-decoration:none;">
                📸 Instagram
            </a>` : ''}
            ${deal.email ? `
            <a href="mailto:${_esc(deal.email)}" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:7px;color:#ea580c;font-size:0.78rem;font-weight:600;text-decoration:none;">
                ✉️ Email
            </a>` : ''}
        </div>
    </div>` : ''}
    <!-- Контакти + Джерело -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
        <div>
            <label style="${lbl}">${window.t('crmPhone')}</label>
            <input id="dd_phone" value="${_esc(deal.phone||'')}" placeholder="+38 (___) ___-__-__" style="${inp}">
        </div>
        <div>
            <label style="${lbl}">Email</label>
            <input id="dd_email" type="email" value="${_esc(deal.email||'')}" placeholder="name@company.com" style="${inp}">
        </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.9rem;">
        <div>
            <label style="${lbl}">Telegram</label>
            <input id="dd_telegram" value="${_esc(deal.telegram||'')}" placeholder="@username" style="${inp}">
        </div>
        <div>
            <label style="${lbl}">Instagram</label>
            <input id="dd_instagram" value="${_esc(deal.instagram||'')}" placeholder="@username" style="${inp}">
        </div>
    </div>
    <div style="margin-bottom:0.9rem;">
        <label style="${lbl}">${window.t('crmSource')}</label>
        <select id="dd_source" style="${inp}background:white;cursor:pointer;">
            <option value="manual" ${(deal.source||'manual')==='manual'?'selected':''}>${window.t('crmSourceManual')}</option>
            <option value="telegram" ${deal.source==='telegram'?'selected':''}>Telegram</option>
            <option value="instagram" ${deal.source==='instagram'?'selected':''}>Instagram</option>
            <option value="site_form" ${deal.source==='site_form'?'selected':''}>${window.t('crmSourceSite')}</option>
            <option value="referral" ${deal.source==='referral'?'selected':''}>${window.t('crmSourceReferral')}</option>
            <option value="ads" ${deal.source==='ads'?'selected':''}>${window.t('crmSourceAds')}</option>
            <option value="phone_call" ${deal.source==='phone_call'?'selected':''}>${window.t('crmSourcePhone')}</option>
        </select>
    </div>
    <!-- Конвертація: Лід → Клієнт (показуємо якщо стадія new або contact) -->
    ${['new','contact'].includes(deal.stage) ? `
    <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.9rem;display:flex;align-items:center;gap:0.75rem;">
        <div style="flex:1;">
            <div style="font-size:0.78rem;font-weight:700;color:#16a34a;margin-bottom:0.15rem;">${window.t('crmLeadConvertTitle')}</div>
            <div style="font-size:0.72rem;color:#6b7280;">${window.t('crmLeadConvertHint')}</div>
        </div>
        <button onclick="crmConvertLead('${deal.id}')"
            style="padding:0.4rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:700;white-space:nowrap;">
            ${window.t('crmLeadConvertBtn')}
        </button>
    </div>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.9rem;">
        <div>
            <label style="${lbl}">Дата закриття</label>
            <input id="dd_close" type="date" value="${deal.expectedClose||''}" style="${inp}">
        </div>
        <div>
            <label style="${lbl}">Наступний контакт</label>
            <input id="dd_nextContact" type="date" value="${deal.nextContactDate||''}" style="${inp}${deal.nextContactDate && deal.nextContactDate < new Date().toISOString().split('T')[0] ? 'border-color:#ef4444;' : ''}">
        </div>
    </div>
    <div style="${row}">
        <label style="${lbl}">Відповідальний</label>
        <select id="dd_assignee" style="${inp}background:white;cursor:pointer;">
            <option value="">— не призначено —</option>
            ${(typeof users !== 'undefined' ? users : []).map(u => '<option value="' + u.id + '" ' + (deal.assigneeId===u.id?'selected':'') + '>' + _esc(u.name||u.email||u.id) + '</option>').join('')}
        </select>
    </div>
    <div style="${row}">
        <label style="${lbl}">Нотатка</label>
        <textarea id="dd_note" rows="3" style="${inp}resize:vertical;">${_esc(deal.note||'')}</textarea>
    </div>
    ${deal.leadData && Object.keys(deal.leadData).some(k => deal.leadData[k]) ? `
    <div style="background:#f8fafc;border-radius:8px;padding:0.75rem;border:1px solid #e8eaed;margin-bottom:0.9rem;">
        <div style="font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:0.5rem;">Дані з боту</div>
        ${[[window.t('crmRole'),'role'],[window.t('crmProblem'),'mainProblem'],[window.t('crmGoal'),'mainGoal']].map(([l,k]) =>
            deal.leadData[k] ? `<div style="font-size:0.78rem;margin-bottom:0.25rem;"><span style="color:#9ca3af;">${l}: </span>${_esc(deal.leadData[k])}</div>` : ''
        ).join('')}
    </div>` : ''}

    <!-- Теги -->
    <div style="margin-bottom:0.9rem;">
        <label style="${lbl}">Теги</label>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.3rem;" id="dealTagsList">
            ${(deal.tags||[]).map(tag =>
            `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:#f3f4f6;border-radius:20px;font-size:0.72rem;color:#374151;">
                ${_esc(tag)}
                <button data-tag="${tag.replace(/"/g,'&quot;')}" data-dealid="${deal.id}"
                class="crm-tag-remove" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.9rem;line-height:1;padding:0;">×</button>
            </span>`).join('')}
        </div>
        <div style="display:flex;gap:0.3rem;">
            <input id="dd_tagInput" placeholder="Новий тег..." onkeydown="if(event.key==='Enter'){event.preventDefault();crmAddTag('${deal.id}')}"
                style="${inp}flex:1;">
            <button onclick="crmAddTag('${deal.id}')"
                style="padding:0.45rem 0.7rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">+ Тег</button>
        </div>
    </div>

    <!-- Hot toggle -->
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;padding:0.6rem 0.75rem;
        background:${deal.isHot?'#fff7ed':'#f8fafc'};border-radius:8px;border:1px solid ${deal.isHot?'#fed7aa':'#e8eaed'};cursor:pointer;"
        onclick="crmToggleHot('${deal.id}')">
        <span style="color:#f97316;">${I.hot}</span>
        <span style="font-size:0.8rem;font-weight:600;color:${deal.isHot?'#f97316':'#6b7280'};">${deal.isHot?window.t('crmHotDeal'):window.t('crmMarkHot')}</span>
        <div style="margin-left:auto;width:32px;height:18px;border-radius:9px;background:${deal.isHot?'#f97316':'#e5e7eb'};position:relative;">
            <div style="width:14px;height:14px;border-radius:50%;background:white;position:absolute;top:2px;left:${deal.isHot?'16px':'2px'};"></div>
        </div>
    </div>`;
    // FIX: event delegation для кнопок видалення тегів (XSS safe)
    const tagsList = content.querySelector('#dealTagsList');
    if (tagsList) {
        tagsList.onclick = function(e) {
            const btn = e.target.closest('.crm-tag-remove');
            if (btn) window.crmRemoveTag(btn.dataset.dealid, btn.dataset.tag);
        };
    }
}

window.crmCloseDeal = function() {
    document.getElementById('crmDealOverlay')?.remove();
    crm.activeDealId = null;
};

window.crmSaveDeal = async function(dealId) {
    if (crm.saving) return;
    crm.saving = true;
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) { crm.saving = false; return; } // FIX: скидаємо guard при early return
    const title  = document.getElementById('dd_title')?.value.trim();
    const stage  = document.getElementById('dd_stage')?.value;
    const amount = parseFloat(document.getElementById('dd_amount')?.value) || 0;
    const client = document.getElementById('dd_client')?.value.trim();
    const niche  = document.getElementById('dd_niche')?.value.trim();
    const note   = document.getElementById('dd_note')?.value.trim();
    const expClose    = document.getElementById('dd_close')?.value || null;
    const nextContact = document.getElementById('dd_nextContact')?.value || null;
    const assigneeId  = document.getElementById('dd_assignee')?.value || null;
    const phone    = document.getElementById('dd_phone')?.value.trim() || deal.phone || '';
    const email    = document.getElementById('dd_email')?.value.trim() || deal.email || '';
    const telegram = document.getElementById('dd_telegram')?.value.trim() || deal.telegram || '';
    const instagram= document.getElementById('dd_instagram')?.value.trim() || deal.instagram || '';
    const source   = document.getElementById('dd_source')?.value || deal.source || 'manual';

    try {
        const stageChanged = stage && stage !== deal.stage;
        const updates = {
            title: title||deal.title, stage: stage||deal.stage, amount,
            clientName: client||deal.clientName, clientNiche: niche, note,
            phone, email, telegram, instagram, source,
            expectedClose: expClose||null, nextContactDate: nextContact||null,
            assigneeId: assigneeId||deal.assigneeId||null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        // FIX: оновлюємо stageEnteredAt при зміні стадії через форму
        if (stageChanged) {
            updates.stageEnteredAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId);
        await ref.update(updates);
        // FIX: записуємо history при зміні стадії через форму
        if (stageChanged) {
            await ref.collection('history').add({
                type: 'stage_changed', from: deal.stage, to: stage,
                by: window.currentUser?.email || 'manager',
                at: firebase.firestore.FieldValue.serverTimestamp(),
            });
            if (typeof window.trackAction === 'function') {
                window.trackAction('crm_stage', {
                    dealId, clientName: deal.clientName || deal.title || '',
                    from: deal.stage, to: stage,
                    fromLabel: _stageLabel(deal.stage), toLabel: _stageLabel(stage),
                });
            }
            if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS) {
                await emitTalkoEvent(window.TALKO_EVENTS.DEAL_STAGE_CHANGED, {
                    dealId, fromStage:deal.stage, toStage:stage,
                    clientName:deal.clientName, amount,
                    clientId: deal.clientId || null,          // FIX CF
                    assignedToId: deal.assignedToId || deal.assigneeId || null, // FIX CF
                });
            }
        }
        Object.assign(deal, updates);
        if (stageChanged) deal.stageEnteredAt = { toMillis: () => Date.now() };
        crmCloseDeal();
        if (typeof showToast === 'function') showToast(window.t('crmSaved'), 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
        console.error('[CRM] crmSaveDeal error:', e.message);
    } finally {
        crm.saving = false;  // завжди скидаємо guard
    }
};


window.crmConvertLead = async function(dealId) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    // Переводимо лід у стадію "negotiation" (переговори)
    const targetStage = 'negotiation';
    try {
        const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId);
        await ref.update({
            stage: targetStage,
            isConverted: true,
            convertedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            stageEnteredAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await ref.collection('history').add({
            type: 'lead_converted', from: deal.stage, to: targetStage,
            by: window.currentUser?.email || 'manager',
            at: firebase.firestore.FieldValue.serverTimestamp(),
        });
        Object.assign(deal, { stage: targetStage, isConverted: true });
        crmCloseDeal();
        if (typeof showToast === 'function') showToast(window.t('crmLeadConverted'), 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.crmDeleteDeal = async function(dealId) {
    if (!(await (window.showConfirmModal ? showConfirmModal(window.t('crmDeleteDeal'),{danger:true}) : Promise.resolve(confirm(window.t('crmDeleteDeal')))))) return;
    try {
        const dealRef = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId);
        // FIX: видаляємо history субколекцію перед видаленням угоди
        try {
            const histSnap = await dealRef.collection('history').limit(100).get();
            if (!histSnap.empty) {
                const batch = firebase.firestore().batch();
                histSnap.docs.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
        } catch(he) { console.warn('[CRM] history cleanup:', he.message); }
        await dealRef.delete();
        crmCloseDeal();
        if (typeof showToast === 'function') showToast(window.t('crmDeleted'), 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ── Теги ───────────────────────────────────────────────────
// FIX: безпечний рендер тегів — event delegation, без inline onclick (XSS fix)
function _renderTagsList(dealId, tags, listEl) {
    if (!listEl) return;
    listEl.innerHTML = tags.map(t =>
        '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:#f3f4f6;border-radius:20px;font-size:0.72rem;color:#374151;">' +
        _esc(t) + '<button data-tag="' + t.replace(/"/g,'&quot;') + '" data-dealid="' + dealId + '" ' +
        'style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.9rem;line-height:1;padding:0;" ' +
        'class="crm-tag-remove">×</button></span>'
    ).join('');
    listEl.onclick = function(e) {
        const btn = e.target.closest('.crm-tag-remove');
        if (btn) window.crmRemoveTag(btn.dataset.dealid, btn.dataset.tag);
    };
}

window.crmAddTag = async function(dealId) {
    const inp = document.getElementById('dd_tagInput');
    const tag = inp?.value.trim();
    if (!tag || !dealId) return;
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    const tags = [...new Set([...(deal.tags||[]), tag])];
    try {
        await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId)
            .update({ tags, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        deal.tags = tags;
        if (inp) inp.value = '';
        _renderTagsList(dealId, tags, document.getElementById('dealTagsList'));
    } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
};

window.crmRemoveTag = async function(dealId, tag) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    const tags = (deal.tags||[]).filter(t => t !== tag);
    try {
        await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId)
            .update({ tags, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        deal.tags = tags;
        _renderTagsList(dealId, tags, document.getElementById('dealTagsList'));
    } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
};
window.crmToggleHot = async function(dealId) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    const isHot = !deal.isHot;
    try {
        await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId)
            .update({ isHot, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        deal.isHot = isHot;
        if(window.showToast) showToast(isHot ? window.t('crmHotDealEmoji') : window.t('crmUnmarked'), 'success');
        crmDealTab(dealId, 'details'); // ре-рендер деталей
    } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
};

// ── Задачі по угоді ────────────────────────────────────────
async function _loadTasksTab(deal) {
    const cnt = document.getElementById('crmDealContent');
    if (!cnt) return;
    cnt.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:0.82rem;">Завантаження...</div>';
    try {
        let dealTasks = [];
        try {
            const snap = await window.companyRef().collection('tasks')
                .where('crmDealId','==', deal.id).orderBy('createdAt','desc').get();
            dealTasks = snap.docs.map(d => ({ id:d.id, ...d.data() }));
        } catch(qErr) {
            if (typeof tasks !== 'undefined') dealTasks = tasks.filter(t => t.crmDealId === deal.id);
        }
        const statusColors = { new:'#6b7280', in_progress:'#3b82f6', done:'#22c55e', overdue:'#ef4444' };
        const statusLabels = { new:window.t('crmTaskStatusNew'), in_progress:window.t('crmTaskStatusWork'), done:window.t('crmTaskStatusDone'), overdue:window.t('crmTaskStatusOver') };
        const today = new Date().toISOString().split('T')[0];
        const usersArr = (typeof users !== 'undefined') ? users : [];

        let rows = '';
        if (!dealTasks.length) {
            rows = '<div style="text-align:center;padding:2rem;background:#f8fafc;border-radius:10px;border:2px dashed #e8eaed;"><div style="color:#9ca3af;font-size:0.82rem;">Задач ще немає</div></div>';
        } else {
            rows = dealTasks.map(function(task) {
                const isOverdue = task.deadlineDate && task.deadlineDate < today && task.status !== 'done' && task.status !== 'review';
                const eff = isOverdue ? 'overdue' : (task.status || 'new');
                const col = statusColors[eff] || '#6b7280';
                const asgn = usersArr.find(function(u){return u.id===task.assigneeId;});
                const deadlinePart = task.deadlineDate ? '<span style="font-size:0.68rem;color:' + (isOverdue?'#ef4444':'#6b7280') + ';">' + task.deadlineDate + '</span>' : '';
                const asgnPart = asgn ? '<span style="font-size:0.68rem;color:#9ca3af;">' + _esc(asgn.name||asgn.email) + '</span>' : '';
                // FIX H: data-taskid замість inline onclick
                const donePart = task.status !== 'done' ? '<button data-taskid="' + task.id + '" class="crm-task-done-btn" style="padding:4px 8px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.72rem;font-weight:600;">✓ Готово</button>' : '';
                const notePart = task.note ? '<div style="font-size:0.74rem;color:#9ca3af;margin-top:4px;">' + _esc((task.note||'').slice(0,100)) + '</div>' : '';
                return '<div style="background:white;border:1px solid #e8eaed;border-left:3px solid ' + col + ';border-radius:8px;padding:0.65rem 0.75rem;margin-bottom:0.5rem;">' +
                    '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;">' +
                        '<div style="flex:1;">' +
                            '<div style="font-size:0.8rem;font-weight:600;color:' + (task.status==='done'?'#9ca3af':'#111827') + ';text-decoration:' + (task.status==='done'?'line-through':'none') + ';">' + _esc(task.title||'') + '</div>' +
                            '<div style="display:flex;gap:0.5rem;margin-top:4px;flex-wrap:wrap;">' +
                                '<span style="font-size:0.68rem;padding:1px 6px;border-radius:8px;font-weight:600;background:' + col + '18;color:' + col + ';">' + (statusLabels[eff]||eff) + '</span>' +
                                deadlinePart + asgnPart +
                            '</div>' +
                        '</div>' +
                        donePart +
                    '</div>' + notePart + '</div>';
            }).join('');
        }

        cnt.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">' +
            '<div style="font-size:0.78rem;color:#6b7280;">' + dealTasks.length + ' задач по угоді</div>' +
            '<button onclick="crmCreateTaskFromDeal(\'' + deal.id + '\')" style="display:flex;align-items:center;gap:0.3rem;padding:0.4rem 0.75rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">' +
                I.plus + ' Нова задача</button></div>' + rows;
        // FIX H: event delegation для .crm-task-done-btn
        cnt.onclick = function(e) { const b = e.target.closest('.crm-task-done-btn'); if (b) crmMarkTaskDone(b.dataset.taskid); };
    } catch(e) {
        if (cnt) cnt.innerHTML = '<div style="color:#ef4444;padding:1rem;font-size:0.8rem;">Помилка: ' + _esc(e.message) + '</div>';
    }
}

window.crmMarkTaskDone = async function(taskId) {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        await window.companyRef().collection('tasks').doc(taskId).update({
            status: 'done',
            completedDate: todayStr, // FIX BH: потрібен для статистики, owner dashboard, аналітики
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            doneAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        if(window.showToast) showToast(window.t('crmTaskDone'), 'success');
        if (crm.activeDealId) {
            const deal = crm.deals.find(function(d){return d.id === crm.activeDealId;});
            if (deal) _loadTasksTab(deal);
        }
    } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
};


// ── Активності ─────────────────────────────────────────────
async function _loadActivityTab(deal) {
    const content = document.getElementById('crmDealContent');
    if (!content) return;
    content.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:0.82rem;">Завантаження...</div>';
    try {
        const snap = await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(deal.id).collection('history')
            .orderBy('at','desc').limit(30).get();
        const events = snap.docs.map(d => ({ id:d.id, ...d.data() }));

        const actIcons = { stage_changed:I.arrow, note:I.note, call:I.call, meeting:I.meet, email:I.mail, created:I.check };

        content.innerHTML = `
        <!-- Add activity -->
        <div style="background:#f8fafc;border-radius:8px;padding:0.75rem;margin-bottom:1rem;border:1px solid #e8eaed;">
            <div style="display:flex;gap:0.4rem;">
                <select id="actType" style="padding:0.4rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.78rem;background:white;">
                    <option value="note">Нотатка</option>
                    <option value="call">Дзвінок</option>
                    <option value="meeting">Зустріч</option>
                    <option value="email">Email</option>
                </select>
                <input id="actText" placeholder="${window.t('crmActivityDescPh')}"
                    onkeydown="if(event.key==='Enter')crmAddActivity('${deal.id}')"
                    style="flex:1;padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.78rem;">
                <button onclick="crmAddActivity('${deal.id}')"
                    style="padding:0.4rem 0.65rem;background:#22c55e;color:white;border:none;
                    border-radius:6px;cursor:pointer;font-size:0.78rem;display:flex;align-items:center;">
                    ${I.plus}
                </button>
            </div>
        </div>

        <!-- Timeline -->
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
            ${events.length === 0 ? '<div style="text-align:center;padding:2rem;color:#9ca3af;font-size:0.8rem;">Активностей ще немає</div>' :
            events.map(ev => {
                const icon = actIcons[ev.type] || I.note;
                const time = ev.at?.toDate ? ev.at.toDate().toLocaleString('uk-UA',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '';
                let text = ev.text || '';
                if (ev.type === 'stage_changed') text = _stageLabel(ev.from) + ' → ' + _stageLabel(ev.to);
                if (ev.type === 'created') text = window.t('crmDealCreated');
                return `
                <div style="display:flex;gap:0.65rem;align-items:flex-start;">
                    <div style="width:28px;height:28px;border-radius:50%;background:#f0fdf4;
                        display:flex;align-items:center;justify-content:center;color:#22c55e;flex-shrink:0;">
                        ${icon}
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:0.8rem;color:#374151;">${_esc(text)}</div>
                        <div style="font-size:0.68rem;color:#9ca3af;margin-top:2px;">${_esc(ev.by||'')} · ${time}</div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    } catch(e) {
        if (content) content.innerHTML = `<div style="color:#ef4444;padding:1rem;font-size:0.8rem;">Помилка: ${_esc(e.message)}</div>`;
    }
}

window.crmAddActivity = async function(dealId) {
    const type   = document.getElementById('actType')?.value || 'note';
    const textEl = document.getElementById('actText');
    const text   = textEl?.value.trim();
    if (!text) return;
    if (textEl) textEl.value = '';
    try {
        await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId).collection('history')
            .add({ type, text, by: window.currentUser?.email||'manager', at: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof window.trackAction === 'function') {
            const arDeal = crm.deals.find(d=>d.id===dealId);
            const arType = type==='call'?'crm_call': type==='meeting'?'crm_meeting': type==='email'?'crm_email': 'crm_note';
            window.trackAction(arType, { dealId, clientName: arDeal?.clientName||arDeal?.title||'', note: text||'' });
        }
        const deal = crm.deals.find(d => d.id === dealId);
        if (deal) _loadActivityTab(deal);
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ── AI Аналіз ──────────────────────────────────────────────
async function _loadAITab(deal) {
    const content = document.getElementById('crmDealContent');
    if (!content) return;

    const analyzedAt = deal.aiAnalyzedAt
        ? (deal.aiAnalyzedAt.toDate ? deal.aiAnalyzedAt.toDate() : new Date(deal.aiAnalyzedAt)).toLocaleDateString('uk-UA',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})
        : '';

    if (deal.aiAnalysis) {
        content.innerHTML = `
        <div style="margin-bottom:0.75rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.65rem;">
                <div style="display:flex;align-items:center;gap:0.4rem;">
                    <div style="width:28px;height:28px;background:#f0fdf4;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#22c55e;">${I.ai}</div>
                    <div style="font-weight:700;font-size:0.88rem;color:#111827;">AI Аналіз</div>
                </div>
                ${analyzedAt ? `<div style="font-size:0.68rem;color:#9ca3af;">${analyzedAt}</div>` : ''}
            </div>
            <div style="background:white;border:1px solid #e8eaed;border-radius:10px;padding:1rem;font-size:0.82rem;color:#374151;line-height:1.7;white-space:pre-wrap;">${_esc(deal.aiAnalysis)}</div>
        </div>
        <button onclick="crmRunAI('${deal.id}')"
            style="width:100%;padding:0.5rem;background:#f0fdf4;color:#16a34a;
            border:1px solid #bbf7d0;border-radius:7px;cursor:pointer;font-size:0.8rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:0.35rem;">
            ${I.refresh} Оновити аналіз
        </button>`;
        return;
    }

    // Збираємо контекст угоди для preview
    const ctx = [
        deal.clientName ? `👤 ${deal.clientName}` : null,
        deal.amount ? `💰 ${Number(deal.amount).toLocaleString('uk-UA')} грн` : null,
        deal.note ? `📝 ${deal.note.slice(0,60)}${deal.note.length>60?'...':''}` : null,
    ].filter(Boolean);

    content.innerHTML = `
    <div style="text-align:center;padding:1.5rem 1rem;">
        <div style="width:52px;height:52px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:14px;
            margin:0 auto 0.75rem;display:flex;align-items:center;justify-content:center;color:#22c55e;font-size:1.4rem;">
            🤖
        </div>
        <div style="font-weight:700;font-size:0.92rem;margin-bottom:0.35rem;color:#111827;">AI Аналіз угоди</div>
        <div style="font-size:0.78rem;color:#6b7280;margin-bottom:1rem;line-height:1.5;">
            Ймовірність закриття • Ризики • Наступний крок • Текст повідомлення
        </div>
        ${ctx.length ? `<div style="background:#f8fafc;border-radius:8px;padding:0.65rem;margin-bottom:1rem;text-align:left;">
            ${ctx.map(c=>`<div style="font-size:0.75rem;color:#6b7280;margin-bottom:3px;">${_esc(c)}</div>`).join('')}
        </div>` : ''}
        <button onclick="crmRunAI('${deal.id}')"
            style="padding:0.65rem 1.75rem;background:#22c55e;color:white;border:none;
            border-radius:8px;cursor:pointer;font-weight:600;font-size:0.84rem;display:inline-flex;align-items:center;gap:0.4rem;">
            🤖 Запустити аналіз
        </button>
        <div style="font-size:0.68rem;color:#d1d5db;margin-top:0.5rem;">~5 секунд</div>
    </div>`;
}

window.crmRunAI = async function(dealId) {
    const deal    = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    const contentEl = document.getElementById('crmDealContent');
    if (contentEl) contentEl.innerHTML = '<div style="text-align:center;padding:2rem;color:#6b7280;font-size:0.82rem;">Аналізую угоду...</div>';
    try {
        // ── Отримуємо Firebase ID token (ніколи не передаємо API key у браузері) ──
        const idToken = await firebase.auth().currentUser?.getIdToken();
        if (!idToken) throw new Error(window.t('crmNotAuthorized'));

        const response = await fetch('/api/ai-crm', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': 'Bearer ' + idToken,
            },
            body: JSON.stringify({
                dealId:    dealId,
                companyId: window.currentCompanyId,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || window.t('errServer') + response.status);
        }

        const analysis = data.analysis || window.t('crmAnalysisFailed');
        // deal в Firestore вже оновлено сервером — тільки local state
        deal.aiAnalysis   = analysis;
        deal.aiAnalyzedAt = new Date();
        _loadAITab(deal);
    } catch(e) {
        if (contentEl) contentEl.innerHTML = `<div style="color:#ef4444;padding:1rem;font-size:0.8rem;">Помилка: ${_esc(e.message)}</div>`;
        console.error('[CRM] crmRunAI error:', e.message);
    }
};

// ══════════════════════════════════════════════════════════
// СТВОРЕННЯ УГОДИ
// ══════════════════════════════════════════════════════════
window.crmOpenCreateDeal = function(defaultStage) {
    document.getElementById('crmCreateDealOverlay')?.remove();
    const stages = crm.pipeline?.stages || [];
    const inp = 'width:100%;padding:0.45rem 0.55rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
    const lbl = 'font-size:0.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.25rem;';

    document.body.insertAdjacentHTML('beforeend', `
    <div id="crmCreateDealOverlay" onclick="if(event.target===this)this.remove()"
        style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10025;
        display:flex;align-items:center;justify-content:center;padding:1rem;">
        <div style="background:white;border-radius:10px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9;
                display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:700;font-size:0.9rem;color:#111827;">Нова угода</span>
                <button onclick="document.getElementById('crmCreateDealOverlay').remove()"
                    style="background:none;border:none;cursor:pointer;color:#9ca3af;
                    display:flex;align-items:center;">${I.close}</button>
            </div>
            <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
                <div>
                    <label style="${lbl}">Назва угоди</label>
                    <input id="nd_title" placeholder="${window.t('crmDealTitlePh')}" style="${inp}" autofocus>
                </div>
                <div>
                    <label style="${lbl}">Клієнт</label>
                    <input id="nd_client" placeholder="${window.t('crmClientNamePh')}" style="${inp}">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                    <div>
                        <label style="${lbl}">Стадія</label>
                        <select id="nd_stage" style="${inp}background:white;cursor:pointer;">
                            ${stages.map(s => `<option value="${s.id}" ${(defaultStage||'new')===s.id?'selected':''}>${_esc(s.label)}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="${lbl}">Сума</label>
                        <input id="nd_amount" type="number" placeholder="0" style="${inp}">
                    </div>
                </div>
                <div>
                    <label style="${lbl}">Ніша</label>
                    <input id="nd_niche" placeholder="${window.t('crmNichePh')}" style="${inp}">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                    <div>
                        <label style="${lbl}">${window.t('crmPhone')}</label>
                        <input id="nd_phone" type="tel" placeholder="+38 (___) ___-__-__" style="${inp}">
                    </div>
                    <div>
                        <label style="${lbl}">Email</label>
                        <input id="nd_email" type="email" placeholder="name@company.com" style="${inp}">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                    <div>
                        <label style="${lbl}">Telegram</label>
                        <input id="nd_telegram" placeholder="@username" style="${inp}">
                    </div>
                    <div>
                        <label style="${lbl}">${window.t('crmSource')}</label>
                        <select id="nd_source" style="${inp}background:white;cursor:pointer;">
                            <option value="manual">${window.t('crmSourceManual')}</option>
                            <option value="telegram">Telegram</option>
                            <option value="instagram">Instagram</option>
                            <option value="site_form">${window.t('crmSourceSite')}</option>
                            <option value="referral">${window.t('crmSourceReferral')}</option>
                            <option value="ads">${window.t('crmSourceAds')}</option>
                            <option value="phone_call">${window.t('crmSourcePhone')}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div style="padding:0.75rem 1.25rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:0.4rem;">
                <button onclick="document.getElementById('crmCreateDealOverlay').remove()"
                    style="padding:0.45rem 1rem;background:white;border:1px solid #e8eaed;
                    border-radius:6px;cursor:pointer;font-size:0.82rem;color:#374151;">
                    Скасувати
                </button>
                <button onclick="crmCreateDeal()"
                    style="padding:0.45rem 1.25rem;background:#22c55e;color:white;border:none;
                    border-radius:6px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                    Створити
                </button>
            </div>
        </div>
    </div>`);
    document.getElementById('nd_title')?.focus();
};

window.crmCreateDeal = async function() {
    const title    = document.getElementById('nd_title')?.value.trim();
    const client   = document.getElementById('nd_client')?.value.trim();
    const stage    = document.getElementById('nd_stage')?.value || 'new';
    const amount   = parseFloat(document.getElementById('nd_amount')?.value) || 0;
    const niche    = document.getElementById('nd_niche')?.value.trim();
    const phone    = document.getElementById('nd_phone')?.value.trim() || '';
    const email    = document.getElementById('nd_email')?.value.trim() || '';
    const telegram = document.getElementById('nd_telegram')?.value.trim() || '';
    const source   = document.getElementById('nd_source')?.value || 'manual';
    const clientId = document.getElementById('crmCreateDealOverlay')?.dataset?.clientId || null;
    if (!title && !client) { if(window.showToast)showToast(window.t('crmEnterNameOrClient'),'warning'); else alert(window.t('crmEnterNameOrClient')); return; }
    try {
        const nowTs = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await window.companyRef().collection(window.DB_COLS.CRM_DEALS).add({
                title: title||client, clientName: client||title, clientNiche: niche||'',
                phone: phone||'', email: email||'', telegram: telegram||'',
                clientId: clientId || null,
                stage, pipelineId: crm.pipeline?.id || '',
                amount, source: source||'manual',
                assigneeId: window.currentUser?.uid || null,
                creatorId:  window.currentUser?.uid || null,
                stageEnteredAt: firebase.firestore.FieldValue.serverTimestamp(), // FIX
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        await ref.collection('history').add({ type:'created', by: window.currentUser?.email||'manager', at: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('crmCreateDealOverlay')?.remove();
        if (typeof showToast === 'function') showToast(window.t('crmDealCreated'), 'success');
        if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS) {
            emitTalkoEvent(window.TALKO_EVENTS.DEAL_CREATED, { dealId:ref.id, clientName:client||title, stage, amount });
        }
        if (typeof window.trackAction === 'function') {
            window.trackAction('crm_deal_created', {
                dealId: ref.id,
                clientName: client || title || '',
                stage, amount,
            });
        }
    } catch(e) { if(window.showToast)showToast(window.t('errPrefix') + e.message,'error'); else alert(window.t('errPrefix') + e.message); }
};

// ══════════════════════════════════════════════════════════
// КЛІЄНТИ — список + slide-in картка
// ══════════════════════════════════════════════════════════
function _renderClients() {
    const c = document.getElementById('crmViewClients');
    if (!c) return;
    c.innerHTML = `
    <div style="display:flex;gap:1rem;height:calc(100vh - 104px);overflow:hidden;">
        <!-- Список -->
        <div style="flex:1;min-width:0;overflow-y:auto;">
            <div style="padding:0 0.5rem;">
                <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;align-items:center;">
                    <input id="crmClientSearch" type="text" placeholder="${window.t('crmSearchPh')}"
                        oninput="crmFilterClients(this.value)"
                        style="flex:1;padding:0.5rem 0.75rem;border:1px solid #e8eaed;
                        border-radius:8px;font-size:0.82rem;background:white;">
                    <button onclick="crmOpenCreateClient()"
                        style="padding:0.5rem 1rem;background:#22c55e;color:white;border:none;
                        border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;white-space:nowrap;">
                        + Клієнт
                    </button>
                </div>
                <div id="crmClientList">${_clientListHTML(crm.clients)}</div>
            </div>
        </div>
        <!-- Slide-in картка -->
        <div id="crmClientCard" style="width:320px;flex-shrink:0;display:none;
            background:white;border-radius:12px;border:1px solid #e8eaed;
            overflow-y:auto;align-self:flex-start;max-height:100%;"></div>
    </div>`;
}

window.crmFilterClients = function(q) {
    const list = document.getElementById('crmClientList');
    if (!list) return;
    // FIX J: пошук по name, phone, email, niche, telegram
    const filtered = q ? crm.clients.filter(c => {
        const ql = q.toLowerCase();
        return (c.name||'').toLowerCase().includes(ql) ||
               (c.phone||'').includes(q) ||
               (c.email||'').toLowerCase().includes(ql) ||
               (c.niche||'').toLowerCase().includes(ql) ||
               (c.telegram||'').toLowerCase().includes(ql);
    }) : crm.clients;
    list.innerHTML = _clientListHTML(filtered);
};

function _clientListHTML(clients) {
    if (!clients.length) return '<div style="text-align:center;padding:3rem;color:#9ca3af;font-size:0.82rem;">Клієнтів не знайдено</div>';
    const colors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b'];
    return clients.map(cl => {
        // FIX K: рахуємо угоди строго по clientId; name-fallback тільки якщо немає clientId
        const deals = crm.deals.filter(d => d.clientId ? d.clientId === cl.id : d.clientName === cl.name).length;
        const color = colors[(cl.name||'').charCodeAt(0) % 4];
        return `
        <div onclick="crmOpenClient('${cl.id}')"
            style="background:white;border-radius:8px;padding:0.75rem;
            border:1px solid #e8eaed;margin-bottom:0.4rem;display:flex;align-items:center;gap:0.65rem;
            cursor:pointer;transition:border-color 0.15s;"
            onmouseover="this.style.borderColor='#22c55e'" onmouseout="this.style.borderColor='#e8eaed'">
            <div style="width:36px;height:36px;border-radius:50%;background:${color};
                display:flex;align-items:center;justify-content:center;
                font-weight:700;color:white;font-size:0.88rem;flex-shrink:0;">
                ${(cl.name||'?').charAt(0).toUpperCase()}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;font-size:0.85rem;color:#111827;">${_esc(cl.name||window.t('crmNoName'))}</div>
                <div style="font-size:0.72rem;color:#9ca3af;">
                    ${cl.phone ? _esc(cl.phone) + (cl.niche ? ' · ' : '') : ''}${cl.niche ? _esc(cl.niche) : ''}
                    ${cl.source === 'telegram' ? '<span style="background:#e0f2fe;color:#0284c7;font-size:0.65rem;padding:1px 5px;border-radius:8px;margin-left:4px;">TG</span>' : ''}
                </div>
            </div>
            ${deals > 0 ? `<span style="background:#f0fdf4;color:#16a34a;font-size:0.7rem;
                padding:2px 8px;border-radius:12px;font-weight:600;">${deals} угод</span>` : ''}
        </div>`;
    }).join('');
}

window.crmOpenClient = function(clientId) {
    const cl = crm.clients.find(c => c.id === clientId);
    if (!cl) return;
    const card = document.getElementById('crmClientCard');
    if (!card) return;
    card.style.display = 'block';

    const clientDeals = crm.deals.filter(d => d.clientId===cl.id || d.clientName===cl.name);
    const colors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b'];
    const color = colors[(cl.name||'').charCodeAt(0) % 4];

    card.innerHTML = `
    <div style="padding:1.25rem;">
        <!-- Заголовок -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem;">
            <div style="display:flex;align-items:center;gap:0.65rem;">
                <div style="width:44px;height:44px;border-radius:50%;background:${color};
                    display:flex;align-items:center;justify-content:center;
                    font-weight:700;color:white;font-size:1rem;">
                    ${(cl.name||'?').charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style="font-weight:700;font-size:0.92rem;color:#111827;">${_esc(cl.name||window.t('crmNoName'))}</div>
                    ${cl.niche ? `<div style="font-size:0.72rem;color:#9ca3af;">${_esc(cl.niche)}</div>` : ''}
                </div>
            </div>
            <button onclick="document.getElementById('crmClientCard').style.display='none'"
                style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:2px;font-size:1rem;">✕</button>
        </div>

        <!-- Контакти -->
        <div style="background:#f8fafc;border-radius:8px;padding:0.75rem;margin-bottom:0.75rem;">
            <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.5rem;">Контакти</div>
            ${cl.phone ? `<div style="font-size:0.82rem;color:#374151;margin-bottom:0.25rem;">
                <span style="color:#9ca3af;">Тел:</span> ${_esc(cl.phone)}</div>` : ''}
            ${cl.email ? `<div style="font-size:0.82rem;color:#374151;margin-bottom:0.25rem;">
                <span style="color:#9ca3af;">Email:</span> ${_esc(cl.email)}</div>` : ''}
            ${cl.telegram ? `<div style="font-size:0.82rem;color:#374151;">
                <span style="color:#9ca3af;">TG:</span> @${_esc(cl.telegram)}</div>` : ''}
            ${!cl.phone && !cl.email && !cl.telegram ? '<div style="font-size:0.78rem;color:#d1d5db;">Немає контактних даних</div>' : ''}
        </div>

        <!-- Теги -->
        ${(cl.tags||[]).length ? `
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:0.75rem;">
            ${(cl.tags||[]).map(t => `<span style="background:#f0fdf4;color:#16a34a;font-size:0.7rem;
                padding:2px 8px;border-radius:12px;">${_esc(t)}</span>`).join('')}
        </div>` : ''}

        <!-- Примітка -->
        ${cl.note ? `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;
            padding:0.6rem 0.75rem;margin-bottom:0.75rem;font-size:0.8rem;color:#374151;line-height:1.5;">
            ${_esc(cl.note)}
        </div>` : ''}

        <!-- Угоди клієнта -->
        <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.4rem;">
            Угоди (${clientDeals.length})
        </div>
        ${clientDeals.length ? clientDeals.slice(0,5).map(d => {
            const stage = (crm.pipeline?.stages||[]).find(s=>s.id===d.stage);
            return `<div onclick="crmOpenDeal('${d.id}')" style="background:white;border:1px solid #e8eaed;border-radius:7px;
                padding:0.5rem 0.65rem;margin-bottom:0.3rem;cursor:pointer;display:flex;align-items:center;gap:0.5rem;"
                onmouseover="this.style.borderColor='#22c55e'" onmouseout="this.style.borderColor='#e8eaed'">
                <div style="width:6px;height:6px;border-radius:50%;background:${stage?.color||'#6b7280'};flex-shrink:0;"></div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.8rem;font-weight:500;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(d.title||d.clientName||window.t('crmDeal'))}</div>
                    <div style="font-size:0.68rem;color:#9ca3af;">${stage?.label||d.stage}</div>
                </div>
                ${d.amount ? `<span style="font-size:0.75rem;font-weight:600;color:#374151;">${Number(d.amount).toLocaleString()}</span>` : ''}
            </div>`;
        }).join('') : '<div style="font-size:0.78rem;color:#d1d5db;text-align:center;padding:0.75rem;">Угод немає</div>'}

        <!-- Кнопки дій -->
        <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
            <button onclick="crmNewDealFromClient('${_esc(cl.name||'')}','${cl.id}')"
                style="flex:1;padding:0.45rem;background:#22c55e;color:white;border:none;
                border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">
                + Угода
            </button>
            <button onclick="crmDeleteClient('${cl.id}')"
                style="padding:0.45rem 0.65rem;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;
                border-radius:7px;cursor:pointer;font-size:0.78rem;">
                Видалити
            </button>
        </div>
    </div>`;
};

window.crmNewDealFromClient = function(clientName, clientId) {
    crmOpenCreateDeal();
    setTimeout(() => {
        const inp = document.getElementById('nd_client');
        if (inp) { inp.value = clientName; inp.focus(); }
        if (clientId) {
            const ov = document.getElementById('crmCreateDealOverlay');
            if (ov) ov.dataset.clientId = clientId;
        }
    }, 50);
};

window.crmDeleteClient = async function(clientId) {
    if (!confirm(window.t('crmDeleteClient'))) return;
    try {
        await window.companyRef().collection('crm_clients').doc(clientId).delete();
        crm.clients = crm.clients.filter(c => c.id !== clientId);
        document.getElementById('crmClientCard').style.display = 'none';
        _renderClients();
        if (window.showToast) showToast(window.t('crmClientDeleted'), 'success');
    } catch(e) { if (window.showToast) showToast(window.t('errPrefix') + e.message, 'error'); }
};

window.crmOpenCreateClient = function() {
    const overlay = document.createElement('div');
    overlay.id = 'crmCreateClientOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const inp = (id, label, ph, type='text') => `
        <div style="margin-bottom:0.6rem;">
            <label style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:3px;">${label}</label>
            <input id="ccc_${id}" type="${type}" placeholder="${ph}"
                style="width:100%;padding:0.5rem 0.6rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.82rem;box-sizing:border-box;">
        </div>`;
    overlay.innerHTML = `
    <div style="background:white;border-radius:14px;padding:1.5rem;width:380px;max-width:95vw;">
        <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;">Новий клієнт</div>
        ${inp('name',"Ім'я",window.t('crmClientName'))}
        ${inp('phone',window.t('crmPhone'),'+380...')}
        ${inp('email','Email','email@example.com','email')}
        ${inp('niche',window.t('crmNiche'),window.t('crmNichePh'))}
        ${inp('telegram','Telegram','username')}
        <div style="margin-bottom:0.6rem;">
            <label style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:3px;">Примітка</label>
            <textarea id="ccc_note" rows="2" placeholder="Довільна нотатка"
                style="width:100%;padding:0.5rem 0.6rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.82rem;box-sizing:border-box;resize:vertical;"></textarea>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
            <button onclick="crmSaveNewClient()"
                style="flex:1;padding:0.55rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                Зберегти
            </button>
            <button onclick="document.getElementById('crmCreateClientOverlay').remove()"
                style="padding:0.55rem 1rem;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">
                Скасувати
            </button>
        </div>
    </div>`;
    document.body.appendChild(overlay);
};

window.crmSaveNewClient = async function() {
    const v = id => document.getElementById('ccc_' + id)?.value?.trim() || '';
    const name = v('name');
    if (!name) { if(window.showToast) showToast('Вкажіть ім\'я','error'); return; }
    try {
        const ref = await window.companyRef().collection('crm_clients').add({
            name, phone: v('phone'), email: v('email'), niche: v('niche'),
            telegram: v('telegram'), note: v('note'), source: 'manual',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        crm.clients.unshift({ id: ref.id, name, phone: v('phone'), email: v('email'),
            niche: v('niche'), telegram: v('telegram'), note: v('note'), source: 'manual' });
        document.getElementById('crmCreateClientOverlay')?.remove();
        _renderClients();
        if (window.showToast) showToast(window.t('crmClientAdded'), 'success');
    } catch(e) { if(window.showToast) showToast(window.t('errPrefix') + e.message, 'error'); }
};

// ══════════════════════════════════════════════════════════
// АКТИВНОСТІ — глобальний лог всіх дій по угодах
// ══════════════════════════════════════════════════════════
const ACT_ICONS = {
    call: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    meeting: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    email: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    note: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    task: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14l2 2 4-4"/></svg>',
    stage_changed: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    created: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    call_answered: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    call_missed: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    sms_sent: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    contact_updated: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
};
const ACT_COLORS = { call:'#3b82f6', meeting:'#8b5cf6', email:'#f59e0b', note:'#6b7280', task:'#22c55e', stage_changed:'#8b5cf6', created:'#22c55e', call_answered:'#22c55e', call_missed:'#ef4444', sms_sent:'#3b82f6', contact_updated:'#f59e0b' };
const ACT_LABELS = { call:window.t('crmActivityCall'), meeting:window.t('crmActivityMeet'), email:window.t('crmActivityLetter'), note:window.t('crmActivityNote'), task:window.t('crmActivityTask'), stage_changed:'Зміна стадії', created:'Створено', call_answered:'Взяв трубку', call_missed:'Не взяв', sms_sent:'Повідомлення', contact_updated:'Контакт оновлено' };

async function _renderActivitiesTab() {
    const c = document.getElementById('crmViewActivities');
    if (!c) return;
    c.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af;font-size:0.82rem;">Завантаження...</div>';

    // FIX: використовуємо crm.deals (вже завантажені по поточній pipeline) замість повного get()
    let allActivities = [];
    try {
        const deals = crm.deals; // вже відфільтровані по pipelineId через _subscribeDeals
        const histResults = await Promise.all(
            deals.map(deal =>
                window.companyRef().collection('crm_deals').doc(deal.id)
                    .collection('history').orderBy('at','desc').limit(30).get()
                    .then(hs => hs.docs.map(h => ({
                        ...h.data(), id: h.id, dealId: deal.id,
                        dealTitle: deal.title || deal.clientName || window.t('crmDeal')
                    })))
                    .catch(() => [])
            )
        );
        allActivities = histResults.flat();
    } catch(e) { console.warn('[CRM activities]', e.message); }

    allActivities.sort((a,b) => {
        const ta = a.at?.seconds || 0, tb = b.at?.seconds || 0;
        return tb - ta;
    });

    const filterTypes = ['all','call','meeting','email','note','task','created','stage_changed'];
    let activeFilter = 'all';

    const render = (filter) => {
        const filtered = filter === 'all' ? allActivities : allActivities.filter(a => a.type === filter);
        const addForm = `
        <div style="background:white;border:1px solid #e8eaed;border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
            <div style="font-weight:600;font-size:0.85rem;color:#111827;margin-bottom:0.65rem;">Нова активність</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;">
                ${Object.entries(ACT_LABELS).map(([k,v]) => `
                <button onclick="actSetType('${k}')" id="actType_${k}"
                    style="padding:0.4rem;border:1.5px solid #e8eaed;border-radius:7px;
                    background:white;cursor:pointer;font-size:0.75rem;display:flex;align-items:center;
                    gap:4px;justify-content:center;color:#374151;">
                    ${ACT_ICONS[k]} ${v}
                </button>`).join('')}
            </div>
            <select id="actDealSelect" style="width:100%;padding:0.4rem 0.5rem;border:1.5px solid #e8eaed;
                border-radius:7px;font-size:0.8rem;margin-bottom:0.4rem;background:white;">
                <option value="">Оберіть угоду...</option>
                ${crm.deals.filter(d=>d.stage!=='won'&&d.stage!=='lost').map(d =>
                    `<option value="${d.id}">${_esc(d.title||d.clientName||window.t('crmDeal'))}</option>`).join('')}
            </select>
            <textarea id="actNoteText" rows="2" placeholder="Нотатка / деталі..."
                style="width:100%;padding:0.4rem 0.5rem;border:1.5px solid #e8eaed;border-radius:7px;
                font-size:0.8rem;box-sizing:border-box;resize:vertical;"></textarea>
            <button id="actSaveBtn"
                style="margin-top:0.4rem;padding:0.45rem 1rem;background:#22c55e;color:white;
                border:none;border-radius:7px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                Зберегти активність
            </button>
        </div>`;

        const filterBar = `
        <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.75rem;">
            ${[['all',window.t('crmAll')],['call',ACT_LABELS.call],['meeting',ACT_LABELS.meeting],['email',ACT_LABELS.email],['note',ACT_LABELS.note],['task',ACT_LABELS.task],['stage_changed',ACT_LABELS.stage_changed]].map(([k,v]) => `
            <button data-actfilter="${k}"
                style="padding:0.3rem 0.65rem;border-radius:999px;border:1.5px solid ${k===filter?'#22c55e':'#e8eaed'};
                background:${k===filter?'#f0fdf4':'white'};color:${k===filter?'#16a34a':'#6b7280'};
                font-size:0.72rem;cursor:pointer;font-weight:${k===filter?'700':'400'};">
                ${v}
            </button>`).join('')}
        </div>`;

        const timeline = filtered.length ? filtered.slice(0, 100).map(a => {
            const ts = a.at?.toDate ? a.at.toDate().toLocaleDateString('uk-UA',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
            const type = a.type || 'note';
            const icon = ACT_ICONS[type] || ACT_ICONS.note;
            const color = ACT_COLORS[type] || '#6b7280';
            const label = ACT_LABELS[type] || type;
            return `
            <div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;align-items:flex-start;">
                <div style="width:30px;height:30px;border-radius:50%;background:${color}18;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${color};margin-top:2px;">
                    ${icon}
                </div>
                <div style="flex:1;background:white;border:1px solid #e8eaed;border-radius:8px;padding:0.6rem 0.75rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                        <div style="display:flex;align-items:center;gap:0.4rem;">
                            <span style="font-size:0.72rem;font-weight:700;color:${color};
                                background:${color}12;padding:1px 7px;border-radius:10px;">${label}</span>
                            <span style="font-size:0.75rem;font-weight:600;color:#374151;">
                                ${_esc(a.dealTitle||window.t('crmDeal'))}
                            </span>
                        </div>
                        <span style="font-size:0.68rem;color:#9ca3af;">${ts}</span>
                    </div>
                    ${(()=>{
                        if (a.type==='stage_changed' && a.from && a.to) {
                            const sl = (crm.pipeline?.stages||[]);
                            const fromL = sl.find(s=>s.id===a.from)?.label || a.from;
                            const toL   = sl.find(s=>s.id===a.to)?.label   || a.to;
                            return `<div style="font-size:0.78rem;color:#6b7280;margin-top:3px;">📍 ${_esc(fromL)} → ${_esc(toL)}</div>`;
                        }
                        if (a.note || a.text) return `<div style="font-size:0.8rem;color:#6b7280;margin-top:3px;">${_esc(a.note||a.text)}</div>`;
                        return '';
                    })()}
                    ${a.by ? `<div style="font-size:0.68rem;color:#9ca3af;margin-top:2px;">${_esc(a.by)}</div>` : ''}
                </div>
            </div>`;
        }).join('') : '<div style="text-align:center;padding:2rem;color:#9ca3af;font-size:0.82rem;">Активностей не знайдено</div>';

        c.innerHTML = `<div>${addForm}${filterBar}${timeline}</div>`;

        // FIX I: скидаємо тип до 'note' після кожного ре-рендеру
        crm._actCurrentType = 'note';
    };

    render(activeFilter);

    // FIX I: event delegation на контейнер — не перезаписуємо window функції при кожному ре-рендері
    c.onclick = function(e) {
        // Тип активності
        const typeBtn = e.target.closest('button[id^="actType_"]');
        if (typeBtn) {
            const t = typeBtn.id.replace('actType_', '');
            crm._actCurrentType = t;
            Object.keys(ACT_LABELS).forEach(k => {
                const btn = document.getElementById('actType_' + k);
                if (btn) {
                    btn.style.borderColor = k === t ? ACT_COLORS[k] : '#e8eaed';
                    btn.style.background  = k === t ? ACT_COLORS[k] + '12' : 'white';
                    btn.style.color       = k === t ? ACT_COLORS[k] : '#374151';
                }
            });
            return;
        }
        // Фільтр
        const filterBtn = e.target.closest('button[data-actfilter]');
        if (filterBtn) { activeFilter = filterBtn.dataset.actfilter; render(activeFilter); return; }
    };

    // actSave через delegation на кнопку — FIX BF: guard щоб не накопичувати listeners
    // Завжди скидаємо listener — вкладка може перерендеритись
    c._actSaveListenerSet = false;
    if (!c._actSaveListenerSet) {
        c._actSaveListenerSet = true;
        c.addEventListener('click', async function actSaveDelegate(e) {
            if (!e.target.matches && !e.target.closest) return;
            const saveBtn = e.target.id === 'actSaveBtn' ? e.target : e.target.closest('#actSaveBtn');
            if (!saveBtn) return;
            const dealId = document.getElementById('actDealSelect')?.value;
            const note   = document.getElementById('actNoteText')?.value?.trim();
            const type   = crm._actCurrentType || 'note';
            if (!dealId) { if(window.showToast) showToast(window.t('crmSelectDeal'),'error'); return; }
            try {
                await window.companyRef().collection('crm_deals').doc(dealId)
                    .collection('history').add({
                        type, note: note || '',
                        by: window.currentUser?.email || 'manager',
                        at: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                if (typeof window.trackAction === 'function') {
                    const aDeal = crm.deals.find(x=>x.id===dealId);
                    const arType = type==='call'?'crm_call': type==='meeting'?'crm_meeting': type==='email'?'crm_email': 'crm_note';
                    window.trackAction(arType, { dealId, clientName: aDeal?.clientName||aDeal?.title||'', note: note||'' });
                }
                if (window.showToast) showToast(window.t('crmActivitySaved'), 'success');
                await _renderActivitiesTab();
            } catch(e2) { if(window.showToast) showToast(window.t('errPrefix') + e2.message, 'error'); }
        });
    }
}


// ══════════════════════════════════════════════════════════
function _renderAnalytics() {
    const c = document.getElementById('crmViewAnalytics');
    if (!c) return;
    const stages   = crm.pipeline?.stages || [];
    const total    = crm.deals.length;
    const won      = crm.deals.filter(d => d.stage==='won').length;
    const lost     = crm.deals.filter(d => d.stage==='lost').length;
    const revenue  = crm.deals.filter(d => d.stage==='won').reduce((s,d) => s+(d.amount||0), 0);
    const avgDeal  = won > 0 ? Math.round(revenue/won) : 0;
    const closed   = won + lost;
    const conv     = closed > 0 ? Math.round(won/closed*100) : 0; // FIX: конверсія = won/(won+lost)

    // KPI картки
    const kpis = [
        [window.t('crmConversion'), conv+'%', '#22c55e'],
        ['Revenue', _fmt(revenue, true), '#16a34a'],
        ['Avg Deal', _fmt(avgDeal, true), '#3b82f6'],
        [window.t('crmStageLost'), lost, '#ef4444'],
    ];

    // По місяцях (останні 6)
    // FIX: використовуємо lostAt/wonAt для точної дати закриття, createdAt для нових
    const _dealDate = (dl, field) => {
        const ts = dl[field];
        return ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
    };
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const label = d.toLocaleString('uk-UA', {month:'short'});
        const newDeals  = crm.deals.filter(dl => (_dealDate(dl,'createdAt')||new Date(0)).toISOString().startsWith(key)).length;
        // FIX: won/lost — по lostAt або wonAt якщо є, fallback на updatedAt
        const wonDeals  = crm.deals.filter(dl => dl.stage==='won'  && (_dealDate(dl,'wonAt')  || _dealDate(dl,'lostAt') || _dealDate(dl,'updatedAt') || new Date(0)).toISOString().startsWith(key)).length;
        const lostDeals = crm.deals.filter(dl => dl.stage==='lost' && (_dealDate(dl,'lostAt') || _dealDate(dl,'updatedAt') || new Date(0)).toISOString().startsWith(key)).length;
        const wonRevenue = crm.deals.filter(dl => dl.stage==='won' && (_dealDate(dl,'wonAt') || _dealDate(dl,'lostAt') || _dealDate(dl,'updatedAt') || new Date(0)).toISOString().startsWith(key)).reduce((s,dl)=>s+(dl.amount||0),0);
        months.push({ label, newDeals, wonDeals, lostDeals, wonRevenue });
    }
    const maxBar = Math.max(...months.map(m => Math.max(m.newDeals, m.wonDeals, m.lostDeals)), 1);
    const maxRev = Math.max(...months.map(m => m.wonRevenue), 1);

    // По стадіях
    const byStage = stages.map(s => ({
        ...s,
        count: crm.deals.filter(d => d.stage===s.id).length,
        amount: crm.deals.filter(d => d.stage===s.id).reduce((sm,d) => sm+(d.amount||0), 0),
    }));

    // Джерела лідів — для пай-чарту
    const sources = crm.deals.reduce((acc, d) => { const src=d.source||'manual'; acc[src]=(acc[src]||0)+1; return acc; }, {});
    const srcColors = { telegram:'#3b82f6', instagram:'#e879f9', site_form:'#22c55e', manual:'#f59e0b' };
    const srcLabels = { telegram:'Telegram', instagram:'Instagram', site_form:window.t('sitesSite'), manual:window.t('crmManual') };
    const totalSrc = Object.values(sources).reduce((s,v)=>s+v, 0) || 1;

    // KPI менеджерів — won, lost, active, conversion, revenue
    const byUser = {};
    crm.deals.forEach(d => {
        const uid = d.assigneeId || d.creatorId || 'unknown';
        if (!byUser[uid]) byUser[uid] = { uid, amount:0, won:0, lost:0, active:0 };
        if (d.stage==='won')  { byUser[uid].amount += d.amount||0; byUser[uid].won++; }
        else if (d.stage==='lost') { byUser[uid].lost++; }
        else { byUser[uid].active++; }
    });
    const topManagers = Object.values(byUser)
        .filter(u => u.won > 0 || u.active > 0)
        .sort((a,b) => b.amount - a.amount)
        .slice(0, 7)
        .map(u => {
            const closed = u.won + u.lost;
            return { ...u,
                conv: closed>0 ? Math.round(u.won/closed*100) : null,
                name: (window.users||[]).find(x=>x.id===u.uid)?.name || (window.users||[]).find(x=>x.uid===u.uid)?.name || u.uid.slice(0,8) || window.t('crmUnknown')
            };
        });
    const maxMgr = topManagers[0]?.amount || 1;

    // Причини програшу
    const lostDealsAll = crm.deals.filter(function(d){ return d.stage === 'lost'; });
    const lostByReason = {};
    lostDealsAll.forEach(function(d) {
        const r = d.lostReasonLabel || d.lostReason || window.t('notSpecified');
        lostByReason[r] = (lostByReason[r] || 0) + 1;
    });
    const lostReasonEntries = Object.entries(lostByReason).sort(function(a,b){ return b[1]-a[1]; });
    const totalLost = lostDealsAll.length || 1;
    const lostColors = ['#ef4444','#f97316','#f59e0b','#6b7280','#8b5cf6','#3b82f6','#22c55e'];

    c.innerHTML = `
    <div style="padding-bottom:2rem;display:flex;flex-direction:column;gap:0.75rem;">

        <!-- KPI картки -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0.5rem;">
            ${kpis.map(([l,v,col]) => `
            <div style="background:white;border-radius:10px;padding:0.9rem;border:1px solid #e8eaed;border-top:3px solid ${col};text-align:center;">
                <div style="font-size:1.3rem;font-weight:800;color:${col};">${v}</div>
                <div style="font-size:0.69rem;color:#9ca3af;margin-top:2px;">${l}</div>
            </div>`).join('')}
        </div>

        <!-- Барчарт: Нових / Виграно / Програно по місяцях -->
        <div style="background:white;border-radius:10px;padding:1rem;border:1px solid #e8eaed;">
            <div style="font-weight:700;font-size:0.85rem;color:#111827;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> Угоди по місяцях</div>
            <div style="display:flex;align-items:flex-end;gap:0.5rem;height:120px;padding-bottom:24px;position:relative;">
                ${months.map(m => `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%;justify-content:flex-end;position:relative;">
                    <div style="width:100%;display:flex;gap:1px;align-items:flex-end;height:96px;">
                        <div style="flex:1;background:#3b82f6;border-radius:3px 3px 0 0;height:${Math.round(m.newDeals/maxBar*96)}px;min-height:${m.newDeals?2:0}px;" title="Нових: ${m.newDeals}"></div>
                        <div style="flex:1;background:#22c55e;border-radius:3px 3px 0 0;height:${Math.round(m.wonDeals/maxBar*96)}px;min-height:${m.wonDeals?2:0}px;" title="Виграно: ${m.wonDeals}"></div>
                        <div style="flex:1;background:#ef4444;border-radius:3px 3px 0 0;height:${Math.round(m.lostDeals/maxBar*96)}px;min-height:${m.lostDeals?2:0}px;" title="Програно: ${m.lostDeals}"></div>
                    </div>
                    <div style="position:absolute;bottom:-20px;font-size:0.65rem;color:#9ca3af;white-space:nowrap;">${m.label}</div>
                </div>`).join('')}
            </div>
            <div style="display:flex;gap:1rem;margin-top:0.5rem;">
                <span style="font-size:0.7rem;color:#6b7280;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#3b82f6;border-radius:2px;display:inline-block;"></span>Нових</span>
                <span style="font-size:0.7rem;color:#6b7280;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#22c55e;border-radius:2px;display:inline-block;"></span>Виграно</span>
                <span style="font-size:0.7rem;color:#6b7280;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#ef4444;border-radius:2px;display:inline-block;"></span>Програно</span>
            </div>
        </div>

        <!-- Лінійний: Revenue тренд -->
        <div style="background:white;border-radius:10px;padding:1rem;border:1px solid #e8eaed;">
            <div style="font-weight:700;font-size:0.85rem;color:#111827;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span> Revenue тренд (виграні угоди)</div>
            <div style="position:relative;height:80px;margin-bottom:20px;">
                <svg width="100%" height="80" viewBox="0 0 600 80" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#22c55e" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#22c55e" stop-opacity="0.02"/>
                        </linearGradient>
                    </defs>
                    ${(() => {
                        const pts = months.map((m,i) => ({
                            x: Math.round(i * 600/5),
                            y: Math.round(80 - (m.wonRevenue/maxRev)*72)
                        }));
                        const path = pts.map((p,i) => (i===0?'M':'L')+p.x+','+p.y).join(' ');
                        const fill = path + ' L600,80 L0,80 Z';
                        return `<path d="${fill}" fill="url(#revGrad)"/>
                                <path d="${path}" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                ${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#22c55e"/>`).join('')}`;
                    })()}
                </svg>
                <div style="display:flex;justify-content:space-between;margin-top:4px;">
                    ${months.map(m=>`<div style="font-size:0.62rem;color:#9ca3af;flex:1;text-align:center;">${m.label}</div>`).join('')}
                </div>
            </div>
        </div>

        <!-- 2 колонки: Пай-чарт + Воронка конверсії -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">

            <!-- Пай-чарт: джерела -->
            <div style="background:white;border-radius:10px;padding:1rem;border:1px solid #e8eaed;">
                <div style="font-weight:700;font-size:0.85rem;color:#111827;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg></span> Джерела лідів</div>
                ${Object.keys(sources).length ? `
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <svg width="80" height="80" viewBox="-1 -1 2 2" style="transform:rotate(-90deg);flex-shrink:0;">
                        ${(() => {
                            let offset = 0;
                            return Object.entries(sources).map(([src, cnt]) => {
                                const pct = cnt / totalSrc;
                                const color = srcColors[src] || '#6b7280';
                                const x1 = Math.cos(2*Math.PI*offset);
                                const y1 = Math.sin(2*Math.PI*offset);
                                offset += pct;
                                const x2 = Math.cos(2*Math.PI*offset);
                                const y2 = Math.sin(2*Math.PI*offset);
                                const large = pct > 0.5 ? 1 : 0;
                                return pct > 0.001 ? `<path d="M0,0 L${x1},${y1} A1,1,0,${large},1,${x2},${y2} Z" fill="${color}" stroke="white" stroke-width="0.03"/>` : '';
                            }).join('');
                        })()}
                    </svg>
                    <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
                        ${Object.entries(sources).map(([src,cnt]) => `
                        <div style="display:flex;align-items:center;gap:5px;">
                            <span style="width:8px;height:8px;border-radius:2px;background:${srcColors[src]||'#6b7280'};flex-shrink:0;"></span>
                            <span style="font-size:0.72rem;color:#374151;flex:1;">${srcLabels[src]||src}</span>
                            <span style="font-size:0.72rem;font-weight:700;color:#111;">${Math.round(cnt/totalSrc*100)}%</span>
                        </div>`).join('')}
                    </div>
                </div>` : '<div style="color:#9ca3af;font-size:0.8rem;">Немає даних</div>'}
            </div>

            <!-- Воронка конверсій між стадіями -->
            <div style="background:white;border-radius:10px;padding:1rem;border:1px solid #e8eaed;">
                <div style="font-weight:700;font-size:0.85rem;color:#111827;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span> Конверсія між стадіями</div>
                ${(() => {
                    const funnelStages = (crm.pipeline?.stages || [])
                        .filter(s => !['lost'].includes(s.id))
                        .sort((a,b) => a.order - b.order);
                    const won = crm.deals.filter(d => d.stage === 'won').length;
                    let html = '';
                    funnelStages.forEach((s, i) => {
                        const cnt = s.id === 'won' ? won : crm.deals.filter(d => {
                            if (d.stage === s.id) return true;
                            // також рахуємо тих, хто пройшов через цю стадію (по history не доступно тут, тому рахуємо всіх з stage >= поточної)
                            const sIdx = funnelStages.findIndex(x => x.id === d.stage);
                            return sIdx > i;
                        }).length;
                        const prevCnt = i === 0 ? (total || 1) : (() => {
                            const prevS = funnelStages[i-1];
                            return crm.deals.filter(d => {
                                const sIdx = funnelStages.findIndex(x => x.id === d.stage);
                                return sIdx >= i-1;
                            }).length || 1;
                        })();
                        const pct = total > 0 ? Math.round(cnt / total * 100) : 0;
                        const convPct = prevCnt > 0 ? Math.round(cnt / prevCnt * 100) : 0;
                        const barW = pct;
                        html += `<div style="margin-bottom:0.5rem;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                                <div style="display:flex;align-items:center;gap:5px;">
                                    <span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0;"></span>
                                    <span style="font-size:0.74rem;color:#374151;font-weight:500;">${_esc(s.label)}</span>
                                </div>
                                <div style="display:flex;align-items:center;gap:6px;">
                                    ${i > 0 ? `<span style="font-size:0.65rem;color:${convPct>=50?'#22c55e':convPct>=25?'#f59e0b':'#ef4444'};font-weight:700;background:${convPct>=50?'#f0fdf4':convPct>=25?'#fffbeb':'#fef2f2'};padding:1px 5px;border-radius:3px;">↓${convPct}%</span>` : ''}
                                    <span style="font-size:0.7rem;color:#9ca3af;">${cnt}</span>
                                </div>
                            </div>
                            <div style="background:#f1f5f9;border-radius:3px;height:6px;">
                                <div style="height:100%;background:${s.color};width:${barW}%;border-radius:3px;transition:width 0.3s;"></div>
                            </div>
                        </div>`;
                    });
                    return html || '<div style="color:#9ca3af;font-size:0.8rem;">Немає даних</div>';
                })()}
            </div>
        </div>

        <!-- Причини програшу — повний блок -->
        <div style="background:white;border-radius:10px;padding:1rem;border:1px solid #e8eaed;margin-bottom:0.75rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
                <div style="font-weight:700;font-size:0.85rem;color:#111827;">❌ Причини програшу</div>
                <div style="display:flex;gap:0.5rem;align-items:center;">
                    <span style="font-size:0.72rem;color:#9ca3af;">${lostDealsAll.length} угод</span>
                    ${lostDealsAll.length>0 ? `<span style="font-size:0.72rem;font-weight:700;color:#ef4444;">${_fmt(lostDealsAll.reduce((s,d)=>s+(d.amount||0),0))} грн втрачено</span>` : ''}
                </div>
            </div>
            ${lostReasonEntries.length ? (function(){
            var html = '';
            lostReasonEntries.forEach(function(entry, i){
                var reason = entry[0]; var count = entry[1];
                var col = lostColors[i % lostColors.length];
                var pct = Math.round(count/totalLost*100);
                html += '<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.6rem;">' +
                    '<div style="width:10px;height:10px;border-radius:50%;background:' + col + ';flex-shrink:0;"></div>' +
                    '<div style="flex:1;">' +
                        '<div style="display:flex;justify-content:space-between;margin-bottom:3px;">' +
                            '<span style="font-size:0.78rem;color:#374151;font-weight:500;">' + _esc(reason) + '</span>' +
                            '<span style="font-size:0.72rem;font-weight:700;color:' + col + ';margin-left:0.5rem;">' + count + ' (' + pct + '%)</span>' +
                        '</div>' +
                        '<div style="background:#f1f5f9;border-radius:3px;height:6px;">' +
                            '<div style="height:100%;background:' + col + ';width:' + pct + '%;border-radius:3px;"></div>' +
                        '</div></div></div>';
            });
            return html;
        })() : '<div style="color:#9ca3af;font-size:0.82rem;text-align:center;padding:1rem;">Програних угод ще немає</div>'}
            ${lostDealsAll.filter(d=>!d.lostReason&&!d.lostReasonLabel).length>0 ? `
            <div style="margin-top:0.5rem;padding:0.5rem 0.65rem;background:#fffbeb;border:1px solid #fde68a;border-radius:7px;font-size:0.72rem;color:#92400e;">
                ⚠️ ${lostDealsAll.filter(d=>!d.lostReason&&!d.lostReasonLabel).length} угод без причини — попросіть менеджерів вказувати причину при закритті
            </div>` : ''}
        </div>

        <!-- Топ-5 менеджерів -->
        <div style="background:white;border-radius:10px;padding:1rem;border:1px solid #e8eaed;">
            <div style="font-weight:700;font-size:0.85rem;color:#111827;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg></span> Топ менеджери (виграні угоди)</div>
            ${topManagers.length ? topManagers.map((u,i) => `
            <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.65rem;">
                <div style="width:24px;height:24px;border-radius:50%;background:${['#f59e0b','#9ca3af','#cd7c2b','#22c55e','#3b82f6','#8b5cf6','#ef4444'][i]};
                    display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:800;color:white;flex-shrink:0;">${i+1}</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
                        <div style="font-size:0.8rem;font-weight:600;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(u.name)}</div>
                        <div style="display:flex;gap:0.35rem;flex-shrink:0;margin-left:0.5rem;">
                            ${u.conv!==null ? `<span style="font-size:0.68rem;padding:1px 5px;border-radius:8px;background:#f0fdf4;color:#16a34a;font-weight:700;">${u.conv}%</span>` : ''}
                            ${u.active>0 ? `<span style="font-size:0.68rem;padding:1px 5px;border-radius:8px;background:#eff6ff;color:#2563eb;">${u.active} акт.</span>` : ''}
                        </div>
                    </div>
                    <div style="background:#f1f5f9;border-radius:3px;height:5px;">
                        <div style="height:100%;background:#22c55e;width:${Math.round(u.amount/maxMgr*100)}%;border-radius:3px;"></div>
                    </div>
                    <div style="display:flex;gap:0.5rem;margin-top:3px;">
                        <span style="font-size:0.65rem;color:#9ca3af;">${u.won} виграно</span>
                        ${u.lost>0 ? `<span style="font-size:0.65rem;color:#fca5a5;">${u.lost} програно</span>` : ''}
                    </div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.78rem;font-weight:700;color:#22c55e;">${_fmt(u.amount)}</div>
                </div>
            </div>`).join('') : '<div style="color:#9ca3af;font-size:0.8rem;">Ще немає угод з відповідальними</div>'}
        </div>

    </div>`;
}


// ══════════════════════════════════════════════════════════
// НАЛАШТУВАННЯ CRM

// ══════════════════════════════════════════════════════════
// НАЛАШТУВАННЯ CRM — воронки, стадії, кольори
// ══════════════════════════════════════════════════════════
function _renderCRMSettings() {
    const c = document.getElementById('crmViewSettings');
    if (!c) return;

    const pipeline = crm.pipeline;
    const stages   = (pipeline?.stages || []).slice().sort((a,b) => a.order - b.order);

    const inp = 'padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.8rem;font-family:inherit;';
    const sectionTitle = 'font-weight:700;font-size:0.82rem;color:#111827;margin-bottom:0.65rem;';

    c.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1rem;">

        <!-- Воронки -->
        <div style="background:white;border-radius:10px;padding:1.1rem;border:1px solid #e8eaed;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <div style="${sectionTitle}margin-bottom:0;">Воронки продажів</div>
                <button onclick="crmCreatePipeline()"
                    style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.75rem;
                    background:#22c55e;color:white;border:none;border-radius:6px;
                    cursor:pointer;font-size:0.78rem;font-weight:600;">
                    ${I.plus} Нова воронка
                </button>
            </div>
            <div id="crmPipelineList">
                ${crm.pipelines.map(p => `
                <div style="display:flex;align-items:center;gap:0.5rem;padding:0.55rem 0.65rem;
                    background:${p.id === crm.pipeline?.id ? '#f0fdf4' : '#f8fafc'};
                    border:1px solid ${p.id === crm.pipeline?.id ? '#bbf7d0' : '#e8eaed'};
                    border-radius:7px;margin-bottom:0.35rem;cursor:pointer;"
                    onclick="crmSelectPipeline('${p.id}')">
                    <div style="flex:1;">
                        <span style="font-size:0.82rem;font-weight:600;color:#111827;">${_esc(p.name)}</span>
                        ${p.isDefault ? '<span style="font-size:0.65rem;background:#f0fdf4;color:#16a34a;padding:1px 6px;border-radius:4px;margin-left:0.4rem;font-weight:600;">основна</span>' : ''}
                    </div>
                    <span style="font-size:0.72rem;color:#9ca3af;">${(p.stages||[]).length} стадій</span>
                    ${!p.isDefault ? `<button onclick="event.stopPropagation();crmDeletePipeline('${p.id}','${_esc(p.name)}')"
                        style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px;
                        display:flex;align-items:center;" title="${window.t('crmDelete')}">${I.trash}</button>` : ''}
                </div>`).join('')}
            </div>
        </div>

        <!-- Стадії поточної воронки -->
        <div style="background:white;border-radius:10px;padding:1.1rem;border:1px solid #e8eaed;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <div>
                    <div style="${sectionTitle}margin-bottom:0;">Стадії: ${_esc(pipeline?.name || '')}</div>
                    <div style="font-size:0.7rem;color:#9ca3af;">Перетягуй щоб змінити порядок</div>
                </div>
                <button onclick="crmAddStage()"
                    style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.75rem;
                    background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;
                    cursor:pointer;font-size:0.78rem;font-weight:600;">
                    ${I.plus} Стадія
                </button>
            </div>
            <div id="crmStageList" style="display:flex;flex-direction:column;gap:0.35rem;">
                ${stages.map((s, i) => `
                <div id="crmStage_${s.id}" draggable="true"
                    ondragstart="crmStageDragStart(event,'${s.id}')"
                    ondragover="crmStageDragOver(event)"
                    ondrop="crmStageDrop(event,'${s.id}')"
                    style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.65rem;
                    background:#f8fafc;border:1px solid #e8eaed;border-radius:7px;cursor:grab;
                    border-left:4px solid ${s.color};">
                    <span style="color:#d1d5db;font-size:0.75rem;cursor:grab;">⠿</span>
                    <input value="${_esc(s.label)}" onchange="crmUpdateStageLabel('${s.id}',this.value)"
                        style="${inp}flex:1;background:transparent;border:none;padding:0;font-weight:500;color:#111827;"
                        onclick="event.stopPropagation()">
                    <input type="color" value="${s.color}"
                        onchange="crmUpdateStageColor('${s.id}',this.value)"
                        style="width:26px;height:26px;border:none;border-radius:4px;cursor:pointer;padding:0;background:none;"
                        title="${window.t('crmStageColor')}">
                    ${!['won','lost'].includes(s.id) ? `
                    <button onclick="crmRemoveStage('${s.id}')"
                        style="background:none;border:none;cursor:pointer;color:#fca5a5;
                        display:flex;align-items:center;padding:2px;" title="${window.t('crmDelete')}">${I.trash}</button>` : ''}
                </div>`).join('')}
            </div>
            <button onclick="crmSaveStages()"
                style="margin-top:0.75rem;width:100%;padding:0.5rem;background:#22c55e;color:white;
                border:none;border-radius:7px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                Зберегти стадії
            </button>
        </div>

        <!-- Обов'язкові поля при зміні стадії -->
        <div style="background:white;border-radius:10px;padding:1.1rem;border:1px solid #e8eaed;">
            <div style="${sectionTitle}">Обов'язкові поля при переході в стадію</div>
            <div style="font-size:0.72rem;color:#9ca3af;margin-bottom:0.75rem;">При переході в стадію буде запит відсутніх даних</div>
            ${stages.filter(s => !['won','lost'].includes(s.id)).map(s => {
                const req = (pipeline?.stageRequiredFields || {})[s.id] || [];
                const fields = [
                    { id:'amount',          label:window.t('crmDealAmount') },
                    { id:'nextContactDate', label:window.t('crmContactDate') },
                    { id:'assigneeId',      label:window.t('crmAssigneeCol') },
                    { id:'phone',           label:window.t('crmClientPhone') },
                    { id:'clientNiche',     label:window.t('crmClientNiche') },
                ];
                return `<div style="margin-bottom:0.65rem;padding:0.55rem 0.65rem;background:#f8fafc;border-radius:7px;border-left:4px solid ${s.color};">
                    <div style="font-size:0.78rem;font-weight:600;color:#374151;margin-bottom:0.4rem;">${_esc(s.label)}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                        ${fields.map(f => `
                        <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:0.72rem;color:#374151;
                            background:${req.includes(f.id)?'#f0fdf4':'white'};border:1px solid ${req.includes(f.id)?'#bbf7d0':'#e8eaed'};
                            border-radius:5px;padding:3px 8px;">
                            <input type="checkbox" ${req.includes(f.id)?'checked':''} value="${f.id}"
                                onchange="crmToggleRequiredField('${s.id}','${f.id}',this.checked)"
                                style="margin:0;accent-color:#22c55e;">
                            ${f.label}
                        </label>`).join('')}
                    </div>
                </div>`;
            }).join('')}
        </div>

    </div>`;
}

// ── Pipeline CRUD ──────────────────────────────────────────
// ── Переміщення угоди між воронками ──────────────────────
window.crmTogglePipelineMenu = function(e, dealId) {
    e.stopPropagation();
    const menu = document.getElementById('kanbanPipelineMenu_' + dealId);
    if (!menu) return;
    const isOpen = menu.style.display !== 'none';
    document.querySelectorAll('[id^="kanbanPipelineMenu_"]').forEach(m => m.style.display = 'none');
    if (!isOpen) {
        menu.style.display = 'block';
        setTimeout(() => {
            const handler = (ev) => {
                if (!menu.contains(ev.target)) {
                    menu.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            };
            document.addEventListener('click', handler);
        }, 10);
    }
};

window.crmMoveDealToPipeline = async function(dealId, targetPipelineId, targetPipelineName) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    const targetPipeline = crm.pipelines.find(p => p.id === targetPipelineId);
    if (!targetPipeline) return;
    const firstStage = targetPipeline.stages?.[0]?.id || 'new';

    const confirmed = confirm(
        `Перемістити "${deal.clientName || deal.title || 'лід'}" у воронку "${targetPipelineName}"?\n→ Стадія: "${targetPipeline.stages?.[0]?.label || firstStage}"`
    );
    if (!confirmed) return;

    try {
        await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId).update({
            pipelineId: targetPipelineId,
            stage: firstStage,
            movedToPipelineAt: firebase.firestore.FieldValue.serverTimestamp(),
            movedFromPipelineId: crm.pipeline?.id || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // Запис в history
        try {
            await window.companyRef().collection(window.DB_COLS.CRM_DEALS)
                .doc(dealId).collection('history').add({
                    type: 'pipeline_move',
                    text: `Переміщено у воронку "${targetPipelineName}"`,
                    from: crm.pipeline?.name || '',
                    to: targetPipelineName,
                    at: firebase.firestore.FieldValue.serverTimestamp(),
                    by: window.currentUser?.email || '',
                });
        } catch(e) { /* history не критично */ }

        if (typeof showToast === 'function') showToast(`→ ${targetPipelineName}`, 'success');
        // onSnapshot автоматично оновить kanban (лід зникне з поточної воронки)
    } catch(err) {
        console.error('[CRM movePipeline]', err);
        if (typeof showToast === 'function') showToast('Помилка: ' + err.message, 'error');
    }
};

window.crmSelectPipeline = async function(pipelineId) {
    // FIX: при кліку на активну — не відкриваємо Settings, просто ігноруємо
    if (crm.pipeline?.id === pipelineId) return;
    crm.pipeline = crm.pipelines.find(p => p.id === pipelineId) || crm.pipeline;
    _subscribeDeals(); // subscribe запустить _renderKanban або _renderListView через onSnapshot
    // FIX: рендеримо поточний subTab, не Settings
    if (crm.subTab === 'settings') _renderCRMSettings();
    if (typeof showToast === 'function') showToast(window.t('crmFunnelLabel') + ': ' + crm.pipeline.name, 'success');
};

// Єдина точка підписки на deals — викликати звідусіль
function _subscribeDeals() {
    // FIX: скасовуємо ТІЛЬКИ deals-підписку, не торкаємо clientUnsub
    if (crm.dealUnsub) { crm.dealUnsub(); crm.dealUnsub = null; }
    crm.loading = true;
    if (!crm.pipeline) return;
    const DEALS_LIMIT = 500; // FIX B: збільшено з 200 до 500
    crm.dealUnsub = window.companyRef().collection(window.DB_COLS.CRM_DEALS)
        .where('pipelineId','==', crm.pipeline.id).limit(DEALS_LIMIT)
        .onSnapshot(snap => {
            crm.deals = snap.docs.map(d => ({id:d.id,...d.data()}))
                .sort((a,b) => (b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));
            crm.loading = false;
            window.crm = crm; // expose для 78-crm-todo і інших модулів
            // FIX B: індикатор якщо досягнуто ліміт
            crm._dealsLimitReached = snap.docs.length >= DEALS_LIMIT;
            // FIX G: ре-рендеримо поточний subTab при оновленні deals
            if (crm.subTab === 'kanban')     _renderKanban();
            else if (crm.subTab === 'list')  _renderListView();
            else if (crm.subTab === 'analytics')  _renderAnalytics();
            else if (crm.subTab === 'todo' && typeof renderCrmTodo === 'function') renderCrmTodo();
            // activities і settings не ре-рендеримо автоматично — вони мають власне завантаження
        }, err => { console.error('[CRM deals]', err); crm.loading = false; });
}

window.crmCreatePipeline = async function() {
    const name = await (window.showInputModal ? showInputModal(window.t('crmNewPipelineName'), '', {placeholder: window.t('enterName2')}) : (async()=>prompt(window.t('crmNewPipelineName')))());
    if (!name?.trim()) return;
    _doCreatePipeline(name.trim());
};

async function _doCreatePipeline(name) {
    // FIX E: унікальні IDs через Date.now() + випадковий суфікс — без race condition
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const stages = [
        {id:'new_'+uid(),      label:window.t('crmStageNew'),      color:'#6b7280', order:0},
        {id:'contact_'+uid(),  label:window.t('crmStageContact'),   color:'#3b82f6', order:1},
        {id:'proposal_'+uid(), label:window.t('crmStageProposal'),  color:'#f59e0b', order:2},
        {id:'won',             label:window.t('crmStageWon'),       color:'#22c55e', order:3},
        {id:'lost',            label:window.t('crmStageLost'),      color:'#ef4444', order:4},
    ];
    try {
        const ref = await window.companyRef().collection(window.DB_COLS.CRM_PIPELINE)
            .add({ name, isDefault:false, stages, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        crm.pipelines.push({ id:ref.id, name, isDefault:false, stages });
        if (typeof showToast === 'function') showToast(window.t('crmPipelineCreated'), 'success');
        _renderCRMSettings();
    } catch(e) { if(window.showToast)showToast(window.t('errPrefix') + e.message,'error'); else alert(window.t('errPrefix') + e.message); }
}

window.crmDeletePipeline = async function(pipelineId, name) {
    // FIX F+C: перевіряємо скільки угод в pipeline
    const dealsInPipeline = crm.deals.filter(d => d.pipelineId === pipelineId).length;
    const dealsWarn = dealsInPipeline > 0 ? `\nУ воронці є ${dealsInPipeline} угод — вони залишаться в базі, але зникнуть з UI.` : '\nУгод у воронці немає.';
    const msg = `Видалити воронку "${name}"?${dealsWarn}`;
    if (!(await (window.showConfirmModal ? showConfirmModal(msg, {danger:true}) : Promise.resolve(confirm(msg))))) return;
    try {
        await window.companyRef().collection(window.DB_COLS.CRM_PIPELINE).doc(pipelineId).delete();
        crm.pipelines = crm.pipelines.filter(p => p.id !== pipelineId);
        if (crm.pipeline?.id === pipelineId) {
            crm.pipeline = crm.pipelines[0] || null;
            // FIX C: підписуємось на deals нової pipeline
            if (crm.pipeline) _subscribeDeals();
            else { crm.deals = []; crm.loading = false; }
        }
        if (typeof showToast === 'function') showToast(window.t('crmDeleted'), 'success');
        _renderCRMSettings();
    } catch(e) { if(window.showToast)showToast(window.t('errPrefix') + e.message,'error'); else alert(window.t('errPrefix') + e.message); }
};

// ── Stage CRUD ─────────────────────────────────────────────
window.crmAddStage = function() {
    if (!crm.pipeline) return;
    const id    = 'stage_' + Date.now();
    const order = (crm.pipeline.stages || []).length;
    const stage = { id, label:window.t('crmNewStage'), color:'#8b5cf6', order };
    crm.pipeline.stages = [...(crm.pipeline.stages || []), stage];
    _renderCRMSettings();
};

window.crmUpdateStageLabel = function(stageId, label) {
    const s = crm.pipeline?.stages?.find(s => s.id === stageId);
    if (s) s.label = label;
};

window.crmUpdateStageColor = function(stageId, color) {
    const s = crm.pipeline?.stages?.find(s => s.id === stageId);
    if (s) { s.color = color; _renderCRMSettings(); }
};

window.crmRemoveStage = async function(stageId) {
    if (!crm.pipeline) return;
    // FIX: перевіряємо чи є угоди в цій стадії
    const dealsInStage = crm.deals.filter(d => d.stage === stageId);
    let confirmMsg = window.t('crmDeleteStage');
    if (dealsInStage.length > 0) {
        confirmMsg = `В стадії "${_stageLabel(stageId)}" є ${dealsInStage.length} угод(и). Вони будуть переміщені в "Новий". Продовжити?`;
    }
    if (!(await (window.showConfirmModal ? showConfirmModal(confirmMsg, {danger:true}) : Promise.resolve(confirm(confirmMsg))))) return;
    // FIX: переміщуємо угоди в 'new' перед видаленням стадії
    if (dealsInStage.length > 0) {
        const fallbackStage = crm.pipeline.stages.find(s => s.id !== stageId && s.id !== 'lost' && s.id !== 'won')?.id || 'new';
        try {
            const batch = firebase.firestore().batch();
            dealsInStage.forEach(d => {
                const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(d.id);
                batch.update(ref, { stage: fallbackStage, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
                d.stage = fallbackStage; // локально
            });
            await batch.commit();
        } catch(e) { console.error('[CRM removeStage] move deals:', e); }
    }
    crm.pipeline.stages = crm.pipeline.stages.filter(s => s.id !== stageId);
    _renderCRMSettings();
};

window.crmSaveStages = async function() {
    if (!crm.pipeline) return;
    // Оновлюємо order
    crm.pipeline.stages.forEach((s,i) => s.order = i);
    try {
        await window.companyRef().collection(window.DB_COLS.CRM_PIPELINE).doc(crm.pipeline.id)
            .update({ stages: crm.pipeline.stages, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        // Sync в pipelines array
        const idx = crm.pipelines.findIndex(p => p.id === crm.pipeline.id);
        if (idx >= 0) crm.pipelines[idx].stages = crm.pipeline.stages;
        if (typeof showToast === 'function') showToast(window.t('crmStagesSaved'), 'success');
        // FIX L: рендеримо поточний subTab, не завжди kanban
        if (crm.subTab === 'kanban' || crm.subTab === 'list') {
            if (crm.viewMode === 'list') _renderListView(); else _renderKanban();
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// Обов'язкові поля при зміні стадії
window.crmToggleRequiredField = async function(stageId, fieldId, checked) {
    if (!crm.pipeline) return;
    if (!crm.pipeline.stageRequiredFields) crm.pipeline.stageRequiredFields = {};
    const cur = crm.pipeline.stageRequiredFields[stageId] || [];
    crm.pipeline.stageRequiredFields[stageId] = checked
        ? [...new Set([...cur, fieldId])]
        : cur.filter(f => f !== fieldId);
    try {
        await window.companyRef().collection(window.DB_COLS.CRM_PIPELINE).doc(crm.pipeline.id)
            .update({ stageRequiredFields: crm.pipeline.stageRequiredFields, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    } catch(e) {
        console.error('[CRM reqFields]', e);
    }
};

// Перевірка обов'язкових полів перед зміною стадії
// Повертає true якщо все ок, false якщо показано popup
async function _checkRequiredFields(deal, newStage) {
    const req = (crm.pipeline?.stageRequiredFields || {})[newStage] || [];
    if (!req.length) return true;

    const FIELD_LABELS = {
        amount: window.t('crmDealAmount'),
        nextContactDate: window.t('crmNextContactDate'),
        assigneeId: window.t('crmResponsibleMgr'),
        phone: window.t('crmClientPhone'),
        clientNiche: window.t('crmClientNicheField'),
    };

    // FIX M: phone зберігається в crm_clients, а не в deal — шукаємо в клієнті
    const clientPhone = (() => {
        if (!req.includes('phone')) return null;
        if (deal.phone) return deal.phone; // якщо раптом є напряму
        const cl = crm.clients.find(c => c.id === deal.clientId || c.name === deal.clientName);
        return cl?.phone || null;
    })();

    const missing = req.filter(f => {
        if (f === 'phone') return !clientPhone;
        return !deal[f];
    });
    if (!missing.length) return true;

    // Показуємо popup для заповнення
    const stageName = _stageLabel(newStage);
    const overlay = document.createElement('div');
    overlay.id = 'crmRequiredFieldsModal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10200;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:1rem;';

    const inp = 'width:100%;padding:0.45rem 0.6rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';

    overlay.innerHTML = `
    <div style="background:white;border-radius:12px;padding:1.25rem;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:0.3rem;">Обов'язкові поля</div>
        <div style="font-size:0.78rem;color:#6b7280;margin-bottom:1rem;">Для переходу в <b style="color:#374151;">${_esc(stageName)}</b> заповніть:</div>
        <div id="crmReqFieldsList" style="display:flex;flex-direction:column;gap:0.65rem;">
            ${missing.map(f => `
            <div>
                <label style="font-size:0.72rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">${FIELD_LABELS[f] || f}</label>
                ${f === 'assigneeId' ? `
                <select id="crmReqField_${f}" style="${inp}">
                    <option value="">— оберіть —</option>
                    ${(typeof users !== 'undefined' ? users : []).map(u => `<option value="${u.id}">${_esc(u.name)}</option>`).join('')}
                </select>` :
                f === 'nextContactDate' ? `<input type="date" id="crmReqField_${f}" style="${inp}" value="${deal[f]||''}">` :
                f === 'amount' ? `<input type="number" id="crmReqField_${f}" style="${inp}" placeholder="0" min="0" value="${deal[f]||''}">` :
                `<input type="text" id="crmReqField_${f}" style="${inp}" placeholder="${FIELD_LABELS[f]||f}" value="${_esc(deal[f]||'')}">`
                }
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:0.6rem;margin-top:1rem;">
            <button onclick="document.getElementById('crmRequiredFieldsModal').remove()"
                style="flex:1;padding:0.5rem;background:#f3f4f6;color:#374151;border:none;border-radius:7px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                Скасувати
            </button>
            <button id="crmReqFieldsConfirm"
                style="flex:2;padding:0.5rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                Зберегти і продовжити
            </button>
        </div>
    </div>`;

    document.body.appendChild(overlay);

    return new Promise(resolve => {
        document.getElementById('crmReqFieldsConfirm').onclick = async () => {
            const updates = {};
            let valid = true;
            missing.forEach(f => {
                const el = document.getElementById('crmReqField_' + f);
                const val = el?.value?.trim();
                if (!val) { el?.style && (el.style.borderColor='#ef4444'); valid = false; return; }
                // FIX M: phone зберігаємо в клієнта, не в deal
                if (f === 'phone') return; // обробимо окремо
                updates[f] = f === 'amount' ? Number(val) : val;
                Object.assign(deal, updates);
            });
            if (!valid) { if (typeof showToast === 'function') showToast(window.t('crmFillAllFields'), 'error'); return; }
            // Зберігаємо deal поля в Firestore
            try {
                if (Object.keys(updates).length) {
                    await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(deal.id).update(updates);
                }
                // FIX M: phone → crm_clients якщо є clientId
                if (missing.includes('phone')) {
                    const phoneVal = document.getElementById('crmReqField_phone')?.value?.trim();
                    if (phoneVal && deal.clientId) {
                        try {
                            await window.companyRef().collection('crm_clients').doc(deal.clientId)
                                .update({ phone: phoneVal, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
                            const cl = crm.clients.find(c => c.id === deal.clientId);
                            if (cl) cl.phone = phoneVal;
                        } catch(pe) { console.warn('[CRM reqFields phone]', pe); }
                    } else if (phoneVal) {
                        // немає clientId — зберігаємо як clientPhone прямо в deal
                        await window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(deal.id)
                            .update({ phone: phoneVal });
                        deal.phone = phoneVal;
                    }
                }
            } catch(e) { console.error('[CRM reqFields save]', e); }
            overlay.remove();
            resolve(true);
        };
        overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); }});
    });
}

// Stage drag-and-drop reorder
let _stageDragId = null;
window.crmStageDragStart = function(e, stageId) {
    _stageDragId = stageId;
    e.dataTransfer.effectAllowed = 'move';
};
window.crmStageDragOver = function(e) {
    e.preventDefault();
    e.currentTarget.style.background = '#eef2ff';
};
window.crmStageDrop = function(e, targetId) {
    e.preventDefault();
    e.currentTarget.style.background = '#f8fafc';
    if (!_stageDragId || _stageDragId === targetId || !crm.pipeline) return;
    const stages = crm.pipeline.stages;
    const fromIdx = stages.findIndex(s => s.id === _stageDragId);
    const toIdx   = stages.findIndex(s => s.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = stages.splice(fromIdx, 1);
    stages.splice(toIdx, 0, moved);
    stages.forEach((s,i) => s.order = i);
    _stageDragId = null;
    _renderCRMSettings();
};

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
function _esc(s) {
    // Shared via TALKO.utils.esc — local fallback for load order safety
    if (window.TALKO?.utils?.esc) return window.TALKO.utils.esc(s);
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function _fmt(n, zeroDash) {
    const num = parseFloat(n) || 0;
    if (!num) return zeroDash ? '—' : '0';
    if (num >= 1000000) return (num/1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num/1000).toFixed(0) + 'k';
    return num.toLocaleString('uk-UA');
}
function _relTime(d) {
    const diff = Date.now() - d.getTime(), m = Math.floor(diff/60000);
    if (m < 1)  return window.t('botsJustNow');
    if (m < 60) return m + 'хв';
    const h = Math.floor(m/60);
    if (h < 24) return h + window.t('botsHour');
    return Math.floor(h/24) + 'дн';
}
function _stageLabel(id) {
    if (!id) return '—';
    // Шукаємо в поточній pipeline
    const inCurrent = crm.pipeline?.stages?.find(s => s.id === id)?.label;
    if (inCurrent) return inCurrent;
    // FIX: fallback — шукаємо в усіх pipeline
    for (const p of (crm.pipelines || [])) {
        const found = (p.stages || []).find(s => s.id === id)?.label;
        if (found) return found;
    }
    // FIX: якщо це технічний id типу 'stage_1710000000' — показуємо window.t('crmStageCol') замість сирого id
    if (/^stage_\d+/.test(id)) return window.t('crmStageCol');
    return id;
}

// ── Tab hook (через централізований registry) ──────────────
window.onSwitchTab && window.onSwitchTab('crm', function() {
    if (!crm.pipeline) window.initCRMModule();
    else if (crm.subTab === 'kanban') _renderKanban();
});

// ══════════════════════════════════════════════════════════
// ЗАДАЧА З УГОДИ → TASK MANAGER
// ══════════════════════════════════════════════════════════
// FIX CG: create invoice from deal card — links invoice to deal via crmDealId
window.crmCreateInvoiceForDeal = function(dealId) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;
    // Open finance tab and launch invoice modal with dealId + prefilled client
    if (typeof window._invoiceAdd === 'function') {
        window._invoiceAdd(dealId, deal.clientName || '');
    } else {
        if (typeof showToast === 'function') showToast(window.t('crmFinanceNotLoaded'), 'warning');
    }
};

window.crmCreateTaskFromDeal = function(dealId) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;

    // Відкриваємо стандартну модалку таск-менеджера якщо вона є
    if (typeof openAddTask === 'function') {
        crmCloseDeal();
        // Передаємо контекст угоди через глобальний стейт
        window._crmTaskContext = {
            dealId:     deal.id,
            dealTitle:  deal.title || deal.clientName || '',
            clientName: deal.clientName || '',
        };
        openAddTask();
        // Заповнюємо поля через setTimeout після рендеру модалки
        setTimeout(() => {
            const titleEl = document.getElementById('taskTitle') || document.getElementById('newTaskTitle');
            if (titleEl && !titleEl.value) {
                titleEl.value = `[CRM] ${deal.clientName || deal.title || ''} — ${(crm.pipeline?.stages||[]).find(s=>s.id===deal.stage)?.label||deal.stage}`;
            }
            const noteEl = document.getElementById('taskNote') || document.getElementById('taskDescription');
            if (noteEl && !noteEl.value && deal.note) noteEl.value = deal.note;
        }, 200);
        return;
    }

    // Fallback: створюємо задачу напряму в Firestore
    const modal = document.createElement('div');
    modal.id = 'crmTaskModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10030;display:flex;align-items:center;justify-content:center;padding:1rem;';
    const inp = 'width:100%;padding:0.5rem 0.6rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
    modal.innerHTML = `
    <div style="background:white;border-radius:12px;padding:1.5rem;width:420px;max-width:95vw;">
        <div style="font-weight:700;font-size:0.95rem;margin-bottom:1rem;color:#111827;">
            Нова задача по угоді: <span style="color:#22c55e;">${_esc(deal.clientName||deal.title||'')}</span>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:4px;">Назва задачі</label>
            <input id="crmT_title" style="${inp}" value="${_esc('[CRM] ' + (deal.clientName||deal.title||''))}">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">
            <div>
                <label style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:4px;">Виконавець</label>
                <select id="crmT_assignee" style="${inp}background:white;cursor:pointer;">
                    <option value="${window.currentUser?.uid||''}">${_esc((typeof users!=='undefined'?users.find(u=>u.id===window.currentUser?.uid):null)?.name||'Я')}</option>
                    ${(typeof users!=='undefined'?users:[]).filter(u=>u.id!==window.currentUser?.uid).map(u=>`<option value="${u.id}">${_esc(u.name||u.email||u.id)}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:4px;">Дедлайн</label>
                <input id="crmT_deadline" type="date" style="${inp}" value="${deal.nextContactDate||deal.expectedClose||''}">
            </div>
        </div>
        <div style="margin-bottom:1rem;">
            <label style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:4px;">Опис</label>
            <textarea id="crmT_note" rows="2" style="${inp}resize:vertical;">${_esc(deal.note||'')}</textarea>
        </div>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
            <button onclick="document.getElementById('crmTaskModal').remove()"
                style="padding:0.5rem 1rem;background:#f3f4f6;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;">
                Скасувати
            </button>
            <button onclick="crmSaveTaskFromDeal('${deal.id}')"
                style="padding:0.5rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                Створити задачу
            </button>
        </div>
    </div>`;
    document.body.appendChild(modal);
};

window.crmSaveTaskFromDeal = async function(dealId) {
    const title    = document.getElementById('crmT_title')?.value.trim();
    const assignee = document.getElementById('crmT_assignee')?.value;
    const deadline = document.getElementById('crmT_deadline')?.value || null;
    const note     = document.getElementById('crmT_note')?.value.trim();
    const deal     = crm.deals.find(d => d.id === dealId);

    if (!title) { if(window.showToast) showToast(window.t('crmEnterTaskTitle'),'error'); return; }
    try {
        const usersArr = typeof users !== 'undefined' ? users : [];
        const assigneeUser = usersArr.find(u => u.id === (assignee || window.currentUser?.uid));
        const creatorUser  = usersArr.find(u => u.id === window.currentUser?.uid);
        const taskData = {
            title, note: note||'',
            assigneeId:   assignee || window.currentUser?.uid || '',
            assigneeName: assigneeUser ? (assigneeUser.name || assigneeUser.email || '') : '',
            creatorId:    window.currentUser?.uid || '',
            creatorName:  creatorUser  ? (creatorUser.name  || creatorUser.email  || '') : '',
            status:     'new',
            deadlineDate: deadline || null,
            deadlineTime: null,
            crmDealId:  dealId,
            crmClientName: deal?.clientName || '',
            createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
        };
        const ref = await window.companyRef().collection('tasks').add(taskData);

        // Логуємо в history угоди
        await window.companyRef().collection('crm_deals').doc(dealId)
            .collection('history').add({
                type: 'task', text: title, taskId: ref.id,
                by: window.currentUser?.email || 'manager',
                at: firebase.firestore.FieldValue.serverTimestamp(),
            });

        document.getElementById('crmTaskModal')?.remove();
        if(window.showToast) showToast(window.t('crmTaskCreated'), 'success');

        // Оновлюємо локальний tasks масив якщо доступний
        if (typeof tasks !== 'undefined') {
            tasks.unshift({ id: ref.id, ...taskData, createdAt: new Date() });
            if (typeof scheduleRender === 'function') scheduleRender();
        }
    } catch(e) {
        if(window.showToast) showToast('Помилка: ' + e.message, 'error');
        console.error('[CRM] crmSaveTaskFromDeal:', e.message);
    }
};

// ══════════════════════════════════════════════════════════
// НАГАДУВАННЯ ПО nextContactDate — перевірка при відкритті CRM
// ══════════════════════════════════════════════════════════
function _checkContactReminders() {
    const today = new Date().toISOString().split('T')[0];
    const overdue = crm.deals.filter(d =>
        d.nextContactDate && d.nextContactDate <= today &&
        d.stage !== 'won' && d.stage !== 'lost'
    );
    if (!overdue.length) return;

    const count = overdue.length;
    const label = overdue[0].clientName || overdue[0].title || window.t('crmDeal');
    const msg = count === 1
        ? `📅 Потрібен контакт: ${label}`
        : `📅 ${count} угод потребують контакту сьогодні`;

    if (typeof showToast === 'function') showToast(msg, 'warning');
}

// FIX: запускаємо нагадування при завантаженні і кожні 30 хв (не тільки раз за сесію)
function _startRemindersScheduler() {
    if (crm._remindersInterval) clearInterval(crm._remindersInterval);
    crm._remindersInterval = setInterval(() => {
        if (crm.deals.length) _checkContactReminders();
    }, 30 * 60 * 1000); // кожні 30 хвилин
}

    // ── Register in TALKO namespace ──────────────────────────
    if (window.TALKO) {
        window.TALKO.crm = {
            init:           window.initCRMModule,
            selectPipeline: window.crmSelectPipeline,
            createPipeline: window.crmCreatePipeline,
            deletePipeline: window.crmDeletePipeline,
            openDeal:       window.crmOpenDeal,
            createDeal:     window.crmOpenCreateDeal,
            saveDeal:       window.crmSaveDeal,
            deleteDeal:     window.crmDeleteDeal,
            runAI:          window.crmRunAI,
            switchTab:      window.crmSwitchTab,
            saveStages:     window.crmSaveStages,
            addStage:       window.crmAddStage,
            removeStage:    window.crmRemoveStage,
            filterClients:  window.crmFilterClients,
            createTask:     window.crmCreateTaskFromDeal,
        };
    }

    // Cleanup для logout — відписуємо всі CRM listeners
    window.destroyCRMListeners = function() {
        if (typeof crm.clientUnsub === 'function') { crm.clientUnsub(); crm.clientUnsub = null; }
        if (typeof crm.dealUnsub   === 'function') { crm.dealUnsub();   crm.dealUnsub   = null; }
        crm._initializingFor = null;
        if (window.TALKO && window.TALKO.crm) window.TALKO.crm._initialized = false;
        // Скидаємо стан щоб при наступному login завантажились свіжі дані
        crm.deals   = [];
        crm.clients = [];
        crm.pipelines = [];
        crm.pipeline  = null;
    };

})();
