// =============================================
// MODULE 75 — SUPERADMIN PANEL
// AI limits + feature flags per company
// =============================================
'use strict';
const FEATURES = [
    // ── Основні вкладки ──────────────────────────────────
    { key: 'crm',              label: '🎯 CRM (Бізнес → CRM)',         group: 'tabs' },
    { key: 'warehouse',        label: '📦 Склад',                       group: 'tabs' },
    { key: 'booking',          label: '📅 Бронювання',                  group: 'tabs' },
    { key: 'finance',          label: '💰 Фінанси',                     group: 'tabs' },
    { key: 'marketing',        label: '📣 Маркетинг',                   group: 'tabs' },
    { key: 'bots',             label: '🤖 Боти',                        group: 'tabs' },
    { key: 'sites',            label: '🌐 Сайти',                       group: 'tabs' },
    { key: 'coordination',     label: '🔗 Координація',                 group: 'tabs' },
    { key: 'incidents',        label: '⚠️ Інциденти/Контроль',          group: 'tabs' },
    // ── Додаткові модулі ─────────────────────────────────
    { key: 'statistics',       label: '📊 Статистика / Метрики',        group: 'modules' },
    { key: 'processes',        label: '⚙️ Бізнес-процеси',              group: 'modules' },
    { key: 'projects',         label: '📁 Проєкти',                     group: 'modules' },
    { key: 'bizStructure',     label: '🏗 Структура бізнесу',           group: 'modules' },
    { key: 'aiAssistants',     label: '🧠 AI Асистенти',                group: 'modules' },
    { key: 'regularTasks',     label: '🔄 Регулярні задачі',            group: 'modules' },
    { key: 'kanban',           label: '📋 Kanban дошка',                group: 'modules' },
    { key: 'controlDashboard', label: '🎛 Дашборд контролю',            group: 'modules' },
    { key: 'ownerDashboard',   label: '👑 Дашборд власника',            group: 'modules' },
    { key: 'fileAttachments',  label: '📎 Файлові вкладення',           group: 'modules' },
    { key: 'timeTracking',     label: '⏱ Трекер часу',                 group: 'modules' },
    { key: 'eveningDigest',    label: '🌙 Вечірній дайджест (TG)',      group: 'modules' },
    { key: 'weeklyReport',     label: '📬 Тижневий звіт (TG)',          group: 'modules' },
];

window.deleteEmptyCompanies = async function() {
    if (!window.isSuperAdmin) return;

    const confirmed = window.showConfirmModal
        ? await window.showConfirmModal('Видалити всі компанії без юзерів і задач?', { danger: true })
        : confirm('Видалити всі порожні компанії?');
    if (!confirmed) return;

    const db = firebase.firestore();
    if (typeof showToast === 'function') showToast('Перевіряємо компанії...', 'info');

    try {
        const snap = await db.collection('companies').get();
        let deleted = 0;
        const toDelete = [];

        for (const doc of snap.docs) {
            const [usersSnap, tasksSnap] = await Promise.all([
                db.collection('companies').doc(doc.id).collection('users').limit(1).get(),
                db.collection('companies').doc(doc.id).collection('tasks').limit(1).get(),
            ]);
            if (usersSnap.empty && tasksSnap.empty) {
                toDelete.push(doc);
            }
        }

        if (toDelete.length === 0) {
            if (typeof showToast === 'function') showToast('Порожніх компаній не знайдено', 'info');
            return;
        }

        // Show what will be deleted
        const names = toDelete.map(d => d.data().name || d.id).join(', ');
        const confirmed2 = window.showConfirmModal
            ? await window.showConfirmModal(`Буде видалено ${toDelete.length} компаній: ${names}`, { danger: true })
            : confirm(`Видалити ${toDelete.length} компаній: ${names}?`);
        if (!confirmed2) return;

        for (const doc of toDelete) {
            await db.collection('companies').doc(doc.id).delete();
            deleted++;
        }

        if (typeof showToast === 'function') showToast(`Видалено ${deleted} порожніх компаній ✓`, 'success');
        loadSuperadminData();
    } catch(e) {
        if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
    }
};

window.openSuperadminPanel = async function() {
    if (!window.isSuperAdmin) return;
    // Відкриваємо модальне вікно напряму (openModal — локальна в statistics.js)
    const modal = document.getElementById('superadminModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    await loadSuperadminData();
};

// ── НОВА loadSuperadminData — збирає дані для всіх табів ──────────────────
// ══════════════════════════════════════════════════════════
// SUPERADMIN PANEL v4.0 — Full Control Center
// Tabs: Overview | Companies | Users | Activity | AI | Health | Alerts | System
// ══════════════════════════════════════════════════════════

// ── loadSuperadminData ──────────────────────────────────────
async function loadSuperadminData() {
    const container = document.getElementById('superadminContent');
    if (!container) return;
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;gap:0.75rem;color:#6b7280;"><div class="spinner"></div> Завантаження даних...</div>';

    try {
        const today    = new Date().toISOString().split('T')[0];
        const monthKey = today.slice(0, 7);
        const db       = firebase.firestore();

        const companiesSnap = await db.collection('companies').limit(500).get();
        const compDocs = companiesSnap.docs;

        const perCompany = await Promise.all(compDocs.map(async doc => {
            const cid = doc.id;
            const c   = doc.data();
            try {
                const [
                    usersSnap, tasksSnap, eventsSnap,
                    aiRecSnap, snapshotSnap, weeklyLogSnap,
                    aiUsageTodaySnap, aiUsageMonthSnap,
                    notesSnap,
                    crmDealsSnap, _unused, crmClientsSnap,
                    bookingSnap, financeSnap, metricsSnap, metricEntriesSnap
                ] = await Promise.all([
                    db.collection('companies').doc(cid).collection('users').get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('tasks')
                        .where('status','!=','done').get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('events')
                        .where('_localTs','>=', Date.now() - 7*86400000).limit(200).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('ai_recommendations')
                        .where('dismissed','==',false).limit(10).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('snapshots').doc(today).get().catch(()=>null),
                    db.collection('companies').doc(cid).collection('weekly_report_log').doc(today).get().catch(()=>null),
                    db.collection('companies').doc(cid).collection('aiUsageLog')
                        .where('date','==',today).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('aiUsageLog')
                        .where('month','==',monthKey).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('sa_notes').orderBy('createdAt','desc').limit(5).get().catch(()=>({docs:[]})),
                    // Doc counts (lightweight — count only, limit 1000)
                    // Note: tasks reuse tasksSnap below — skip separate read
                    db.collection('companies').doc(cid).collection('crm_deals').limit(1000).get().catch(()=>({docs:[]})),
                    // placeholder to keep array indices — resolved immediately
                    Promise.resolve({docs:[]}),
                    db.collection('companies').doc(cid).collection('crm_clients').limit(1000).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('booking_appointments').limit(500).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('finance_transactions').limit(1000).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('metrics').limit(200).get().catch(()=>({docs:[]})),
                    db.collection('companies').doc(cid).collection('metricEntries').limit(2000).get().catch(()=>({docs:[]})),
                ]);

                const eventCounts = {};
                eventsSnap.docs.forEach(d => {
                    const n = d.data()?.event_name || d.data()?.type || '?';
                    eventCounts[n] = (eventCounts[n] || 0) + 1;
                });

                const users = usersSnap.docs.map(d => ({id:d.id,...d.data()}));
                const activeTasks  = tasksSnap.docs.length;
                const overdueTasks = tasksSnap.docs.filter(d => d.data()?.deadlineDate && d.data()?.deadlineDate < today).length;
                const todayTokens  = aiUsageTodaySnap.docs.reduce((s,d)=>s+(d.data()?.tokens||0),0);
                const monthTokens  = aiUsageMonthSnap.docs.reduce((s,d)=>s+(d.data()?.tokens||0),0);
                const snap         = snapshotSnap?.exists ? snapshotSnap.data() : null;

                // ── Health Score (0–100) ─────────────────────────────
                // Компосит: активність + задачі + AI + TG + відсутність просроченого
                const tgLinked = users.filter(u=>u.telegramChatId).length;
                const hasEvents = eventsSnap.docs.length > 0;
                const overdueRatio = activeTasks > 0 ? overdueTasks / activeTasks : 0;
                const ownerRatio = snap?.signals?.ownerTaskRatio || 0;

                let health = 100;
                // Активність (30 балів)
                if (!hasEvents) health -= 30;
                else if (eventsSnap.docs.length < 10) health -= 15;
                else if (eventsSnap.docs.length < 30) health -= 5;
                // Прострочені задачі (20 балів)
                if (overdueRatio > 0.3) health -= 20;
                else if (overdueRatio > 0.1) health -= 10;
                else if (overdueRatio === 0 && activeTasks > 0) health += 5; // бонус: все вчасно
                // Власник перевантажений (15 балів)
                if (ownerRatio > 0.4) health -= 15;
                else if (ownerRatio > 0.25) health -= 7;
                // TG підключення (10 балів)
                if (users.length > 0 && tgLinked === 0) health -= 10;
                else if (tgLinked >= users.length * 0.5) health += 3; // бонус: >50% з TG
                // AI вимкнено (5 балів)
                if (c.aiEnabled === false) health -= 5;
                // Нова компанія (< 3 події — не карати сильно)
                if (eventsSnap.docs.length < 3 && users.length <= 1) health = Math.max(health, 50);
                health = Math.max(0, Math.min(100, health));

                // ── Feature adoption (які вкладки відкривали) ────────
                const usedModules = new Set(eventsSnap.docs.map(d => d.data()?.module || d.data()?.tab || '').filter(Boolean));

                // ── Last activity ────────────────────────────────────
                const lastEvent = eventsSnap.docs.length > 0
                    ? Math.max(...eventsSnap.docs.map(d => d.data()?._localTs || 0))
                    : (c.createdAt?.toMillis?.() || 0);
                const daysSinceActivity = lastEvent > 0
                    ? Math.floor((Date.now() - lastEvent) / 86400000)
                    : 999;

                // ── Doc counts → Firestore usage estimate ───────────────
                const docCounts = {
                    tasks:       tasksSnap.docs.length, // reuse existing snap
                    deals:       crmDealsSnap.docs.length,
                    clients:     crmClientsSnap.docs.length,
                    bookings:    bookingSnap.docs.length,
                    finance:     financeSnap.docs.length,
                    metrics:     metricsSnap.docs.length,
                    metricEntries: metricEntriesSnap.docs.length,
                    users:       usersSnap.docs.length,
                    events:      eventsSnap.docs.length,
                };
                const totalDocs = Object.values(docCounts).reduce((s,v)=>s+v, 0);
                // Firestore pricing: $0.06 per 100k docs read/written/deleted
                // Avg doc size estimate ~1KB → storage $0.18/GB/month
                // Conservative: each doc ~1.5KB avg, reads ~3x per session
                const estStorageKB   = totalDocs * 1.5;
                const estMonthlyReads = totalDocs * 90; // ~3 reads/day × 30 days
                const estCostUSD     = (estMonthlyReads / 100000) * 0.06 + (estStorageKB / 1024 / 1024) * 0.18;

                return {
                    id: cid, data: c,
                    users,
                    ownerCount:    users.filter(u=>u.role==='owner').length,
                    managerCount:  users.filter(u=>u.role==='manager').length,
                    telegramCount: tgLinked,
                    activeTasks, overdueTasks,
                    eventCounts, totalEvents7d: eventsSnap.docs.length,
                    aiRecs:     aiRecSnap.docs.map(d=>({id:d.id,...d.data()})),
                    snapshot:   snap,
                    weeklyLog:  weeklyLogSnap?.exists ? weeklyLogSnap.data() : null,
                    todayTokens, monthTokens,
                    health, usedModules, daysSinceActivity,
                    notes: notesSnap.docs.map(d=>({id:d.id,...d.data()})),
                    createdAt: c.createdAt?.toMillis?.() || 0,
                    docCounts, totalDocs, estStorageKB, estCostUSD,
                };
            } catch(e) {
                return {
                    id:cid, data:c, users:[], ownerCount:0, managerCount:0, telegramCount:0,
                    activeTasks:0, overdueTasks:0, eventCounts:{}, totalEvents7d:0,
                    aiRecs:[], snapshot:null, weeklyLog:null, todayTokens:0, monthTokens:0,
                    health:0, usedModules:new Set(), daysSinceActivity:999, notes:[], createdAt:0,
                    docCounts:{}, totalDocs:0, estStorageKB:0, estCostUSD:0,
                };
            }
        }));

        window._saData = { compDocs, perCompany, today, monthKey };
        renderSuperadminPanel(compDocs, {}, perCompany);

    } catch(e) {
        if (container) container.innerHTML = `<p style="color:red;padding:1rem;">Помилка: ${_saEsc(e.message)}</p>`;
    }
}
window.loadSuperadminData = loadSuperadminData;

// ── renderSuperadminPanel ────────────────────────────────────
function renderSuperadminPanel(compDocs, usageMap, perCompany) {
    const container = document.getElementById('superadminContent');
    if (!container) return;

    const pc = perCompany || window._saData?.perCompany || [];
    const totalUsers    = pc.reduce((s,c)=>s+c.users.length, 0);
    const totalActive   = pc.reduce((s,c)=>s+c.activeTasks, 0);
    const totalOverdue  = pc.reduce((s,c)=>s+c.overdueTasks, 0);
    const totalEvents   = pc.reduce((s,c)=>s+c.totalEvents7d, 0);
    const totalTg       = pc.reduce((s,c)=>s+c.telegramCount, 0);
    const avgHealth     = pc.length ? Math.round(pc.reduce((s,c)=>s+c.health,0)/pc.length) : 0;
    const alertCount    = pc.filter(c=>c.health < 50 || c.daysSinceActivity > 3).length;
    const planCounts    = {basic:0,pro:0,enterprise:0};
    pc.forEach(c=>{const p=c.data.plan||'pro'; planCounts[p]=(planCounts[p]||0)+1;});

    const TABS = [
        {id:'overview',   label:'Огляд',      icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'},
        {id:'requests',   label:'🆕 Заявки',   icon:'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'},
        {id:'companies',  label:'Компанії',   icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'},
        {id:'users',      label:'Юзери',      icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'},
        {id:'activity',   label:'Активність', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'},
        {id:'ai',         label:'AI',         icon:'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1'},
        {id:'health',     label:'Health',     icon:'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'},
        {id:'alerts',     label:`Алерти${alertCount>0?` <span style="background:#ef4444;color:white;border-radius:9px;padding:0 5px;font-size:0.65rem;">${alertCount}</span>`:''}`, icon:'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'},
        {id:'system',     label:'Система',    icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'},
        {id:'firestore',  label:'Firestore',  icon:'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 4h16M4 20h16'},
        {id:'subscriptions', label:'Підписки', icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'},
    ];

    const svgIcon = (path, size=13) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-flex;vertical-align:middle;flex-shrink:0;"><path d="${path}"/></svg>`;

    container.innerHTML = `
<!-- KPI Strip -->
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:0.5rem;margin-bottom:1rem;">
    ${_saKpi('Компаній',   compDocs.length,          '#3b82f6', 'Загальна кількість компаній на платформі')}
    ${_saKpi('Юзерів',     totalUsers,               '#8b5cf6', 'Сума всіх співробітників у всіх компаніях')}
    ${_saKpi('Задач',      totalActive,              '#f59e0b', 'Активні задачі (не виконані) по всіх компаніях')}
    ${_saKpi('Простроч.',  totalOverdue, totalOverdue>0?'#ef4444':'#22c55e', 'Задачі з дедлайном у минулому — показник дисципліни')}
    ${_saKpi('Health avg', avgHealth+'%', avgHealth>=70?'#22c55e':avgHealth>=40?'#f59e0b':'#ef4444', 'Середній Health Score: 100% = активна компанія без проблем. Знижується за відсутність активності, прострочені задачі, відсутність TG')}
    ${_saKpi('Events 7д',  totalEvents,              '#06b6d4', 'Кількість дій (кліків, відкриттів вкладок) за останні 7 днів — показник реального використання')}
    ${_saKpi('TG підкл.',  totalTg,                  '#22c55e', 'Кількість юзерів з підключеним Telegram — отримують нотифікації і тижневий звіт')}
    ${_saKpi('Алертів',    alertCount, alertCount>0?'#ef4444':'#22c55e', 'Компанії з Health < 50% або без активності 3+ днів — потребують уваги')}
</div>

<!-- Tab Bar -->
<div style="display:flex;gap:1px;background:#f3f4f6;border-radius:10px;padding:3px;margin-bottom:1rem;overflow-x:auto;">
    ${TABS.map((t,i)=>`
    <button id="saTab_${t.id}" onclick="saSwitchTab('${t.id}')"
        style="display:flex;align-items:center;gap:5px;padding:0.45rem 0.7rem;border:none;border-radius:7px;cursor:pointer;
        font-size:0.78rem;font-weight:600;white-space:nowrap;transition:all .15s;
        background:${i===0?'white':'transparent'};color:${i===0?'#111':'#6b7280'};
        box-shadow:${i===0?'0 1px 3px rgba(0,0,0,0.1)':'none'};">
        ${svgIcon(t.icon, 12)} ${t.label}
    </button>`).join('')}
    <button onclick="loadSuperadminData()" title="Оновити"
        style="margin-left:auto;padding:0.45rem 0.6rem;border:none;border-radius:7px;cursor:pointer;background:transparent;color:#6b7280;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
    </button>
</div>

<!-- Tab Contents -->
<div id="saTabContent_overview">${_saRenderOverview(pc, planCounts)}</div>
<div id="saTabContent_requests" style="display:none;">
    <div style="margin-bottom:0.75rem;font-weight:700;font-size:0.95rem;">🆕 Нові заявки на реєстрацію</div>
    <div id="saPendingRegs"><div style="color:#9ca3af;font-size:0.82rem;">Завантаження...</div></div>
</div>
<div id="saTabContent_companies" style="display:none;">${_saRenderCompanies(pc)}</div>
<div id="saTabContent_users"     style="display:none;">${_saRenderUsers(pc)}</div>
<div id="saTabContent_activity"  style="display:none;">${_saRenderActivity(pc)}</div>
<div id="saTabContent_ai"        style="display:none;">${_saRenderAI(pc)}</div>
<div id="saTabContent_health"    style="display:none;">${_saRenderHealth(pc)}</div>
<div id="saTabContent_alerts"    style="display:none;">${_saRenderAlerts(pc)}</div>
<div id="saTabContent_system"    style="display:none;">${_saRenderSystem()}</div>
<div id="saTabContent_firestore" style="display:none;">${_saRenderFirestore(pc)}</div>
<div id="saTabContent_subscriptions" style="display:none;">${_saRenderSubscriptions(pc)}</div>
`;
}

window.saSwitchTab = function(tab) {
    const tabs = ['overview','requests','companies','users','activity','ai','health','alerts','system','firestore','subscriptions'];
    tabs.forEach(t => {
        const btn   = document.getElementById(`saTab_${t}`);
        const panel = document.getElementById(`saTabContent_${t}`);
        const active = t === tab;
        if (btn) {
            btn.style.background  = active ? 'white' : 'transparent';
            btn.style.color       = active ? '#111' : '#6b7280';
            btn.style.boxShadow   = active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
        }
        if (panel) panel.style.display = active ? '' : 'none';
    });
    if (tab === 'requests') renderPendingRegistrations();
};

// ── TAB 1: OVERVIEW ─────────────────────────────────────────
function _saRenderOverview(pc, planCounts) {
    // Top 5 by health (lowest = need attention)
    const needAttention = [...pc].sort((a,b)=>a.health-b.health).slice(0,5);
    // Top 5 by activity
    const mostActive = [...pc].sort((a,b)=>b.totalEvents7d-a.totalEvents7d).slice(0,5);
    // Silent (no activity 3+ days)
    const silent = pc.filter(c=>c.daysSinceActivity >= 3 && c.users.length > 0);
    // AI usage top
    const aiTop = [...pc].sort((a,b)=>b.monthTokens-a.monthTokens).slice(0,5);

    const planBar = `
    <div style="margin-bottom:1rem;">
        <div style="font-size:0.7rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:0.4rem;">Плани</div>
        <div style="display:flex;gap:0.5rem;">
            ${Object.entries(planCounts).map(([p,n])=>{
                const colors={basic:'#6b7280',pro:'#22c55e',enterprise:'#8b5cf6'};
                return `<div style="flex:${n||0.1};background:${colors[p]||'#e5e7eb'};height:8px;border-radius:4px;" title="${p}: ${n}"></div>`;
            }).join('')}
        </div>
        <div style="display:flex;gap:1rem;margin-top:0.35rem;">
            ${Object.entries(planCounts).map(([p,n])=>`<span style="font-size:0.72rem;color:#6b7280;"><strong style="color:#111;">${n}</strong> ${p}</span>`).join('')}
        </div>
    </div>`;

    const attentionCards = needAttention.map(c=>_saCompanyMiniCard(c,'#ef4444')).join('');
    const activeCards    = mostActive.map(c=>_saCompanyMiniCard(c,'#22c55e')).join('');
    const silentList     = silent.slice(0,5).map(c=>`
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;border-bottom:1px solid #f3f4f6;">
            <span style="font-size:0.78rem;flex:1;">${_saEsc(c.data.name||c.id)}</span>
            <span style="font-size:0.7rem;color:#9ca3af;">${c.daysSinceActivity===999?'ніколи':c.daysSinceActivity+'д тому'}</span>
            <span style="font-size:0.7rem;background:#fef9c3;color:#92400e;padding:1px 6px;border-radius:4px;">${c.users.length} юз.</span>
        </div>`).join('') || '<div style="color:#9ca3af;font-size:0.78rem;padding:0.5rem 0;">Всі активні</div>';

    return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div style="grid-column:1/-1;">${planBar}</div>
        <div>
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                Потребують уваги
            </div>
            ${attentionCards}
        </div>
        <div>
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                Найактивніші (7д)
            </div>
            ${activeCards}
        </div>
        <div>
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Мовчать 3+ дні (${silent.length})
            </div>
            ${silentList}
        </div>
        <div>
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/></svg>
                AI топ (місяць)
            </div>
            ${aiTop.map(c=>`
            <div style="display:flex;align-items:center;gap:0.5rem;padding:0.3rem 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:0.78rem;flex:1;">${_saEsc(c.data.name||c.id)}</span>
                <span style="font-size:0.72rem;font-weight:700;color:#8b5cf6;">${c.monthTokens.toLocaleString()}</span>
            </div>`).join('')}
        </div>
    </div>`;
}

function _saCompanyMiniCard(c, accentColor) {
    const healthColor = c.health>=70?'#22c55e':c.health>=40?'#f59e0b':'#ef4444';
    return `
    <div onclick="saOpenCompanyDetail('${c.id}')" style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.5rem;
        border:1px solid #f3f4f6;border-radius:8px;margin-bottom:0.3rem;cursor:pointer;
        transition:all .15s;" onmouseenter="this.style.background='#f9fafb'" onmouseleave="this.style.background=''">
        <div style="width:6px;height:28px;background:${accentColor};border-radius:3px;flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
            <div style="font-size:0.78rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_saEsc(c.data.name||c.id)}</div>
            <div style="font-size:0.68rem;color:#9ca3af;">${c.users.length} юз. · ${c.totalEvents7d} events</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:0.82rem;font-weight:800;color:${healthColor};">${c.health}%</div>
            <div style="font-size:0.65rem;color:#9ca3af;">health</div>
        </div>
    </div>`;
}

// ── TAB 2: COMPANIES ────────────────────────────────────────
function _saRenderCompanies(pc) {
    const rows = pc.map(c => {
        const d = c.data;
        const plan = d.plan || 'pro';
        const planBadge = {
            basic:      '<span style="background:#f3f4f6;color:#6b7280;padding:1px 6px;border-radius:4px;font-size:0.7rem;">Basic</span>',
            pro:        '<span style="background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:4px;font-size:0.7rem;">Pro</span>',
            enterprise: '<span style="background:#ede9fe;color:#7c3aed;padding:1px 6px;border-radius:4px;font-size:0.7rem;">★ Ent</span>',
        }[plan] || plan;
        const safeId   = c.id.replace(/['"]/g,'');
        const safeName = (d.name||c.id).replace(/'/g,"\\'");
        const overdueColor = c.overdueTasks>5?'#ef4444':c.overdueTasks>0?'#f97316':'#22c55e';
        const healthColor  = c.health>=70?'#22c55e':c.health>=40?'#f59e0b':'#ef4444';
        const snap = c.snapshot;
        const ownerRatio = snap?.signals?.ownerTaskRatio ? Math.round(snap.signals.ownerTaskRatio*100)+'%' : '—';
        const actBadge = c.daysSinceActivity >= 7
            ? `<span style="background:#fee2e2;color:#dc2626;padding:1px 5px;border-radius:4px;font-size:0.65rem;">${c.daysSinceActivity===999?'ніколи':c.daysSinceActivity+'д'}</span>`
            : c.daysSinceActivity >= 3
            ? `<span style="background:#fef9c3;color:#92400e;padding:1px 5px;border-radius:4px;font-size:0.65rem;">${c.daysSinceActivity}д</span>`
            : `<span style="background:#dcfce7;color:#16a34a;padding:1px 5px;border-radius:4px;font-size:0.65rem;">today</span>`;

        return `<tr data-name="${(d.name||c.id).toLowerCase()}"
            style="border-bottom:1px solid #f3f4f6;cursor:pointer;${d.disabled && !d.pendingApproval ? 'background:#fff5f5;' : d.pendingApproval ? 'background:#fffbeb;' : ''}"
            onmouseenter="this.style.background='${d.disabled && !d.pendingApproval ? '#fee2e2' : d.pendingApproval ? '#fef3c7' : '#fafafa'}'"
            onmouseleave="this.style.background='${d.disabled && !d.pendingApproval ? '#fff5f5' : d.pendingApproval ? '#fffbeb' : ''}'">
            <td style="padding:0.4rem 0.5rem;font-weight:600;font-size:0.8rem;cursor:pointer;" onclick="saOpenCompanyDetail('${c.id}')">
                ${d.pendingApproval ? '<span title="Очікує підтвердження" style="color:#f59e0b;">⏳ </span>' : d.disabled ? '<span title="Заблоковано" style="color:#ef4444;">🔒 </span>' : ''}${_saEsc(d.name||c.id)}
            </td>
            <td style="padding:0.4rem 0.5rem;">${planBadge}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;">${c.users.length}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;">${c.activeTasks}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;font-weight:600;color:${overdueColor};">${c.overdueTasks||'—'}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;">${ownerRatio}</td>
            <td style="padding:0.4rem 0.5rem;">${actBadge}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;font-weight:700;color:${healthColor};">${c.health}%</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;">${c.telegramCount}</td>
            <td style="padding:0.4rem 0.5rem;">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <select onchange="updateCompanyPlan('${safeId}',this.value)"
                        style="padding:2px 4px;border:1px solid #e5e7eb;border-radius:5px;font-size:0.7rem;cursor:pointer;">
                        <option value="basic"      ${plan==='basic'?'selected':''}>Basic</option>
                        <option value="pro"        ${plan==='pro'?'selected':''}>Pro</option>
                        <option value="enterprise" ${plan==='enterprise'?'selected':''}>Ent</option>
                    </select>
                    <button onclick="openFeatureFlags('${safeId}','${safeName}')"
                        style="padding:2px 5px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:5px;cursor:pointer;font-size:0.7rem;">Модулі</button>
                    <button onclick="saAddNote('${safeId}')"
                        style="padding:2px 5px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:5px;cursor:pointer;font-size:0.7rem;">Нотатка</button>
                    <button onclick="toggleCompanyAI('${safeId}',${d.aiEnabled!==false?'false':'true'})"
                        style="padding:2px 5px;background:${d.aiEnabled!==false?'#fef2f2':'#f0fdf4'};color:${d.aiEnabled!==false?'#ef4444':'#16a34a'};border:1px solid ${d.aiEnabled!==false?'#fecaca':'#bbf7d0'};border-radius:5px;cursor:pointer;font-size:0.7rem;">
                        AI ${d.aiEnabled!==false?'вимк':'увімк'}</button>
                    <button onclick="toggleCompanyBlock('${safeId}','${safeName}',${!!d.disabled})"
                        style="padding:2px 5px;background:${d.disabled?'#f0fdf4':'#fef2f2'};color:${d.disabled?'#16a34a':'#dc2626'};border:1px solid ${d.disabled?'#bbf7d0':'#fecaca'};border-radius:5px;cursor:pointer;font-size:0.7rem;font-weight:700;">
                        ${d.disabled?'🔓':'🔒'}</button>
                </div>
            </td>
        </tr>`;
    }).join('');

    return `
    <div style="margin-bottom:0.6rem;display:flex;gap:0.5rem;">
        <input id="saCompanySearch" placeholder="Пошук по назві..." oninput="saFilterCompanies(this.value)"
            style="flex:1;padding:0.4rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.82rem;">
        <button onclick="deleteEmptyCompanies()"
            style="padding:0.4rem 0.75rem;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:600;white-space:nowrap;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-flex;vertical-align:middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg> Видалити пусті
        </button>
        <button onclick="saExportCsv()"
            style="padding:0.4rem 0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:600;white-space:nowrap;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-flex;vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV
        </button>
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
        <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:0.68rem;color:#6b7280;text-transform:uppercase;">
            <th style="padding:0.4rem 0.5rem;text-align:left;">Компанія</th>
            <th style="padding:0.4rem 0.5rem;">План</th>
            <th style="padding:0.4rem 0.5rem;">Юзери</th>
            <th style="padding:0.4rem 0.5rem;">Задачі</th>
            <th style="padding:0.4rem 0.5rem;">Прост.</th>
            <th style="padding:0.4rem 0.5rem;">Owner%</th>
            <th style="padding:0.4rem 0.5rem;">Акт.</th>
            <th style="padding:0.4rem 0.5rem;">Health</th>
            <th style="padding:0.4rem 0.5rem;">TG</th>
            <th style="padding:0.4rem 0.5rem;text-align:left;">Дії</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

// ── TAB 3: USERS (без змін структури, покращений) ───────────
function _saRenderUsers(pc) {
    const allUsers = [];
    pc.forEach(c => c.users.forEach(u => allUsers.push({...u, companyName:c.data.name||c.id, companyId:c.id})));
    allUsers.sort((a,b)=>(a.companyName||'').localeCompare(b.companyName||''));

    const roleColors = {owner:'#7c3aed',manager:'#2563eb',employee:'#374151',admin:'#dc2626'};
    const byRole = {};
    allUsers.forEach(u=>{byRole[u.role||'?']=(byRole[u.role||'?']||0)+1;});

    const rows = allUsers.map(u=>`
        <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:0.35rem 0.5rem;font-size:0.78rem;">${_saEsc(u.companyName)}</td>
            <td style="padding:0.35rem 0.5rem;font-size:0.78rem;font-weight:500;">${_saEsc(u.name||'—')}</td>
            <td style="padding:0.35rem 0.5rem;font-size:0.72rem;color:#6b7280;">${_saEsc(u.email||'—')}</td>
            <td style="padding:0.35rem 0.5rem;">
                <span style="font-size:0.68rem;font-weight:600;color:${roleColors[u.role]||'#374151'};background:${roleColors[u.role]||'#374151'}15;padding:1px 5px;border-radius:4px;">${u.role||'—'}</span>
            </td>
            <td style="padding:0.35rem 0.5rem;">${u.telegramChatId
                ? '<span style="background:#dcfce7;color:#16a34a;padding:1px 5px;border-radius:4px;font-size:0.68rem;">TG ✓</span>'
                : '<span style="color:#d1d5db;font-size:0.7rem;">—</span>'}</td>
            <td style="padding:0.35rem 0.5rem;font-size:0.7rem;color:#9ca3af;">${u.language||'ua'}</td>
        </tr>`).join('');

    return `
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem;">
        ${Object.entries(byRole).map(([r,n])=>`<span style="background:#f3f4f6;padding:3px 10px;border-radius:6px;font-size:0.78rem;"><strong>${n}</strong> ${r}</span>`).join('')}
        <span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:6px;font-size:0.78rem;"><strong>${allUsers.filter(u=>u.telegramChatId).length}</strong> TG підкл.</span>
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:0.68rem;color:#6b7280;text-transform:uppercase;">
            <th style="padding:0.35rem 0.5rem;text-align:left;">Компанія</th>
            <th style="padding:0.35rem 0.5rem;text-align:left;">Ім'я</th>
            <th style="padding:0.35rem 0.5rem;text-align:left;">Email</th>
            <th style="padding:0.35rem 0.5rem;text-align:left;">Роль</th>
            <th style="padding:0.35rem 0.5rem;">TG</th>
            <th style="padding:0.35rem 0.5rem;">Мова</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

// ── TAB 4: ACTIVITY ─────────────────────────────────────────
const EVENT_LABELS = {
    page_view:        'Відкрито сторінку',
    tab_switch:       'Перемикання вкладки',
    task_create:      'Створено задачу',
    task_complete:    'Виконано задачу',
    task_update:      'Оновлено задачу',
    task_delete:      'Видалено задачу',
    login:            'Вхід в систему',
    crm_deal_create:  'Новий лід/угода',
    crm_deal_update:  'Оновлено угоду',
    metric_entry:     'Додано метрику',
    finance_tx:       'Фінансова операція',
    booking_created:  'Новий запис',
    process_start:    'Запущено процес',
    coordination:     'Координація',
    ai_request:       'AI запит',
    user_invite:      'Запрошено юзера',
    regular_task:     'Регулярна задача',
};

function _saRenderActivity(pc) {
    const eventTotals = {};
    pc.forEach(c=>Object.entries(c.eventCounts||{}).forEach(([k,v])=>{eventTotals[k]=(eventTotals[k]||0)+v;}));
    const sorted  = Object.entries(eventTotals).sort((a,b)=>b[1]-a[1]).slice(0,20);
    const maxVal  = sorted[0]?.[1] || 1;
    const maxComp = Math.max(1,...pc.map(x=>x.totalEvents7d));

    const evRows = sorted.map(([name,cnt])=>`
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.3rem 0;border-bottom:1px solid #f3f4f6;">
            <span style="font-size:0.75rem;min-width:190px;color:#374151;" title="${name}">${_saEsc(EVENT_LABELS[name] || name)}</span>
            <div style="flex:1;background:#f3f4f6;border-radius:3px;height:6px;overflow:hidden;">
                <div style="width:${Math.round(cnt/maxVal*100)}%;background:#3b82f6;height:100%;border-radius:3px;"></div>
            </div>
            <span style="font-size:0.78rem;font-weight:700;min-width:36px;text-align:right;">${cnt}</span>
        </div>`).join('');

    const compAct = [...pc].filter(c=>c.totalEvents7d>0).sort((a,b)=>b.totalEvents7d-a.totalEvents7d).map(c=>`
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.3rem 0;border-bottom:1px solid #f3f4f6;">
            <span style="font-size:0.75rem;min-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_saEsc(c.data.name||c.id)}</span>
            <div style="flex:1;background:#f3f4f6;border-radius:3px;height:6px;overflow:hidden;">
                <div style="width:${Math.round(c.totalEvents7d/maxComp*100)}%;background:#22c55e;height:100%;border-radius:3px;"></div>
            </div>
            <span style="font-size:0.78rem;font-weight:700;">${c.totalEvents7d}</span>
        </div>`).join('');

    return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div>
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem;">Топ-20 подій (7 днів)</div>
            <div style="max-height:400px;overflow-y:auto;">${evRows||'<div style="color:#9ca3af;padding:1rem;text-align:center;">Немає даних</div>'}</div>
        </div>
        <div>
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem;">Активність по компаніях</div>
            <div style="max-height:400px;overflow-y:auto;">${compAct||'<div style="color:#9ca3af;padding:1rem;text-align:center;">Немає даних</div>'}</div>
        </div>
    </div>`;
}

// ── TAB 5: AI ───────────────────────────────────────────────
function _saRenderAI(pc) {
    const totalToday = pc.reduce((s,c)=>s+c.todayTokens,0);
    const totalMonth = pc.reduce((s,c)=>s+c.monthTokens,0);

    const rows = [...pc].sort((a,b)=>b.monthTokens-a.monthTokens).map(c=>{
        const d = c.data;
        const safeId = c.id.replace(/['"]/g,'');
        const pctDay = d.aiDailyTokenLimit>0 ? Math.min(100,Math.round(c.todayTokens/d.aiDailyTokenLimit*100)) : 0;
        return `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:0.4rem 0.5rem;font-size:0.8rem;font-weight:500;">${_saEsc(d.name||c.id)}</td>
            <td style="padding:0.4rem 0.5rem;">
                <span style="font-size:0.7rem;padding:1px 6px;border-radius:4px;background:${d.aiEnabled!==false?'#dcfce7':'#fee2e2'};color:${d.aiEnabled!==false?'#16a34a':'#dc2626'};">
                    ${d.aiEnabled!==false?'ON':'OFF'}</span>
            </td>
            <td style="padding:0.4rem 0.5rem;font-size:0.8rem;">${c.todayTokens.toLocaleString()}
                ${pctDay>0?`<div style="height:3px;background:#f3f4f6;border-radius:2px;width:60px;margin-top:2px;"><div style="height:100%;width:${pctDay}%;background:${pctDay>90?'#ef4444':'#3b82f6'};border-radius:2px;"></div></div>`:''}
            </td>
            <td style="padding:0.4rem 0.5rem;font-size:0.8rem;font-weight:600;">${c.monthTokens.toLocaleString()}</td>
            <td style="padding:0.4rem 0.5rem;">
                <input type="number" value="${d.aiDailyTokenLimit||''}" placeholder="∞" min="0" step="1000"
                    style="width:80px;padding:2px 4px;border:1px solid #e5e7eb;border-radius:5px;font-size:0.72rem;"
                    onchange="updateAILimit('${safeId}','aiDailyTokenLimit',this.value)">
            </td>
            <td style="padding:0.4rem 0.5rem;">
                <input type="number" value="${d.aiMonthlyTokenLimit||''}" placeholder="∞" min="0" step="10000"
                    style="width:90px;padding:2px 4px;border:1px solid #e5e7eb;border-radius:5px;font-size:0.72rem;"
                    onchange="updateAILimit('${safeId}','aiMonthlyTokenLimit',this.value)">
            </td>
        </tr>`;
    }).join('');

    return `
    <div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;align-items:center;">
        ${_saKpi('Сьогодні токенів', totalToday.toLocaleString(), '#3b82f6')}
        ${_saKpi('Місяць токенів', totalMonth.toLocaleString(), '#8b5cf6')}
        <div style="flex:1;text-align:right;">
            <button onclick="openGlobalAISettings()" style="padding:0.4rem 0.9rem;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:7px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                Глобальні налаштування AI
            </button>
        </div>
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:0.68rem;color:#6b7280;text-transform:uppercase;">
            <th style="padding:0.4rem 0.5rem;text-align:left;">Компанія</th>
            <th style="padding:0.4rem 0.5rem;">AI</th>
            <th style="padding:0.4rem 0.5rem;">Сьогодні</th>
            <th style="padding:0.4rem 0.5rem;">Місяць</th>
            <th style="padding:0.4rem 0.5rem;">Ліміт/день</th>
            <th style="padding:0.4rem 0.5rem;">Ліміт/міс</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

// ── TAB 6: HEALTH SCORE ─────────────────────────────────────
function _saRenderHealth(pc) {
    const sorted = [...pc].sort((a,b)=>a.health-b.health);

    const rows = sorted.map(c=>{
        const h = c.health;
        const healthColor = h>=70?'#22c55e':h>=40?'#f59e0b':'#ef4444';
        const healthBg    = h>=70?'#dcfce7':h>=40?'#fef9c3':'#fee2e2';
        const snap = c.snapshot?.signals || {};

        // Причини низького health
        const reasons = [];
        if (c.totalEvents7d === 0)    reasons.push('Немає активності');
        else if (c.totalEvents7d < 10) reasons.push('Мало активності');
        if (c.overdueTasks > 0)        reasons.push(`${c.overdueTasks} прострочених задач`);
        if ((snap.ownerTaskRatio||0) > 0.4) reasons.push('Власник перевантажений');
        if (c.telegramCount === 0 && c.users.length > 0) reasons.push('TG не підключено');
        if (c.data.aiEnabled === false) reasons.push('AI вимкнено');

        return `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:0.4rem 0.5rem;font-size:0.8rem;font-weight:600;cursor:pointer;" onclick="saOpenCompanyDetail('${c.id}')">${_saEsc(c.data.name||c.id)}</td>
            <td style="padding:0.4rem 0.5rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <div style="flex:1;background:#f3f4f6;border-radius:4px;height:8px;overflow:hidden;max-width:80px;">
                        <div style="width:${h}%;background:${healthColor};height:100%;border-radius:4px;transition:width .3s;"></div>
                    </div>
                    <span style="font-size:0.82rem;font-weight:800;color:${healthColor};min-width:35px;">${h}%</span>
                </div>
            </td>
            <td style="padding:0.4rem 0.5rem;font-size:0.72rem;color:#6b7280;">${reasons.slice(0,2).join(' · ')||'—'}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.75rem;">${c.totalEvents7d}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.75rem;color:${c.overdueTasks>0?'#ef4444':'#374151'};">${c.overdueTasks||'—'}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.75rem;">${c.telegramCount}</td>
            <td style="padding:0.4rem 0.5rem;">
                <span style="font-size:0.68rem;padding:1px 6px;border-radius:4px;background:${healthBg};color:${healthColor};">
                    ${h>=70?'Добре':h>=40?'Увага':'Критично'}
                </span>
            </td>
        </tr>`;
    }).join('');

    const distribution = {good:0,warn:0,crit:0};
    pc.forEach(c=>{if(c.health>=70)distribution.good++;else if(c.health>=40)distribution.warn++;else distribution.crit++;});

    return `
    <div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;">
        ${_saKpi('Добре (70%+)',     distribution.good, '#22c55e')}
        ${_saKpi('Увага (40-70%)',   distribution.warn, '#f59e0b')}
        ${_saKpi('Критично (<40%)',  distribution.crit, '#ef4444')}
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:0.68rem;color:#6b7280;text-transform:uppercase;">
            <th style="padding:0.4rem 0.5rem;text-align:left;">Компанія</th>
            <th style="padding:0.4rem 0.5rem;text-align:left;min-width:140px;">Health Score</th>
            <th style="padding:0.4rem 0.5rem;text-align:left;">Причини</th>
            <th style="padding:0.4rem 0.5rem;">Events</th>
            <th style="padding:0.4rem 0.5rem;">Прострочені</th>
            <th style="padding:0.4rem 0.5rem;">TG</th>
            <th style="padding:0.4rem 0.5rem;">Статус</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table></div>`;
}

// ── TAB 7: ALERTS ───────────────────────────────────────────
function _saRenderAlerts(pc) {
    const alerts = [];

    pc.forEach(c => {
        // Тиша 3+ днів
        if (c.daysSinceActivity >= 3 && c.users.length > 0) {
            alerts.push({
                company: c.data.name||c.id, id: c.id,
                severity: c.daysSinceActivity >= 7 ? 'critical' : 'warning',
                type: 'silence',
                text: `Немає активності ${c.daysSinceActivity === 999 ? '(ніколи)' : c.daysSinceActivity + ' днів'}`,
                action: null,
            });
        }
        // Багато прострочених
        if (c.overdueTasks > 0) {
            const pct = c.activeTasks > 0 ? Math.round(c.overdueTasks/c.activeTasks*100) : 100;
            alerts.push({
                company: c.data.name||c.id, id: c.id,
                severity: pct > 30 ? 'critical' : 'warning',
                type: 'overdue',
                text: `${c.overdueTasks} прострочених задач (${pct}%)`,
                action: null,
            });
        }
        // Власник перевантажений
        const ownerR = c.snapshot?.signals?.ownerTaskRatio || 0;
        if (ownerR > 0.5) {
            alerts.push({
                company: c.data.name||c.id, id: c.id,
                severity: 'warning',
                type: 'owner_overload',
                text: `Власник на ${Math.round(ownerR*100)}% задач — потрібна делегація`,
                action: null,
            });
        }
        // AI limit майже вичерпано
        if (c.data.aiDailyTokenLimit > 0) {
            const pct = c.todayTokens / c.data.aiDailyTokenLimit;
            if (pct > 0.85) {
                alerts.push({
                    company: c.data.name||c.id, id: c.id,
                    severity: pct > 0.95 ? 'critical' : 'warning',
                    type: 'ai_limit',
                    text: `AI токени ${Math.round(pct*100)}% денного ліміту`,
                    action: null,
                });
            }
        }
        // Health критично низький
        if (c.health < 30) {
            alerts.push({
                company: c.data.name||c.id, id: c.id,
                severity: 'critical',
                type: 'low_health',
                text: `Health Score критично низький: ${c.health}%`,
                action: null,
            });
        }
    });

    alerts.sort((a,b)=>{
        if(a.severity==='critical'&&b.severity!=='critical') return -1;
        if(b.severity==='critical'&&a.severity!=='critical') return 1;
        return a.company.localeCompare(b.company);
    });

    if (alerts.length === 0) {
        return `<div style="text-align:center;padding:3rem;color:#22c55e;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 1rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div style="font-weight:700;font-size:1rem;margin-bottom:0.35rem;">Все добре</div>
            <div style="font-size:0.82rem;color:#6b7280;">Критичних алертів немає</div>
        </div>`;
    }

    const typeIcons = {
        silence:       'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        overdue:       'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        owner_overload:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        ai_limit:      'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1',
        low_health:    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    };

    const rows = alerts.map(a=>`
        <div style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.65rem;
            border:1px solid ${a.severity==='critical'?'#fecaca':'#fef9c3'};
            background:${a.severity==='critical'?'#fff5f5':'#fffdf0'};
            border-radius:8px;margin-bottom:0.4rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${a.severity==='critical'?'#dc2626':'#ca8a04'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><path d="${typeIcons[a.type]||typeIcons.silence}"/></svg>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.78rem;font-weight:700;color:#111;cursor:pointer;" onclick="saOpenCompanyDetail('${a.id}')">${_saEsc(a.company)}</div>
                <div style="font-size:0.73rem;color:#6b7280;margin-top:1px;">${_saEsc(a.text)}</div>
            </div>
            <span style="font-size:0.65rem;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap;
                background:${a.severity==='critical'?'#dc2626':'#f59e0b'};color:white;">
                ${a.severity==='critical'?'Критично':'Увага'}</span>
        </div>`).join('');

    const critCount = alerts.filter(a=>a.severity==='critical').length;
    const warnCount = alerts.filter(a=>a.severity==='warning').length;

    return `
    <div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;">
        ${_saKpi('Критично', critCount, '#ef4444')}
        ${_saKpi('Увага',    warnCount, '#f59e0b')}
        ${_saKpi('Всього',   alerts.length, '#374151')}
    </div>
    <div style="max-height:600px;overflow-y:auto;">${rows}</div>`;
}

// ── TAB 8: SYSTEM ───────────────────────────────────────────
function _saRenderFirestore(pc) {
    const esc = _saEsc;

    // Firestore free tier limits
    const FREE_READS   = 50000;   // reads/day
    const FREE_WRITES  = 20000;   // writes/day
    const FREE_STORAGE = 1024;    // MB
    const PRICE_READ   = 0.06;    // per 100k
    const PRICE_WRITE  = 0.18;    // per 100k
    const PRICE_STORAGE = 0.18;   // per GB/month

    // Totals
    const totalDocs   = pc.reduce((s,c) => s + (c.totalDocs||0), 0);
    const totalStorKB = pc.reduce((s,c) => s + (c.estStorageKB||0), 0);
    const totalStorMB = totalStorKB / 1024;
    const totalStorGB = totalStorMB / 1024;

    // Daily reads estimate: totalDocs × active companies factor
    const activeCompanies = pc.filter(c => c.daysSinceActivity < 7).length;
    const estDailyReads   = totalDocs * 3 * (activeCompanies / Math.max(pc.length,1));
    const estDailyWrites  = totalDocs * 0.1;

    // Monthly cost
    const readCostMonth  = Math.max(0, (estDailyReads  * 30 - FREE_READS  * 30) / 100000) * PRICE_READ;
    const writeCostMonth = Math.max(0, (estDailyWrites * 30 - FREE_WRITES * 30) / 100000) * PRICE_WRITE;
    const storCostMonth  = Math.max(0, totalStorGB - FREE_STORAGE/1024) * PRICE_STORAGE;
    const totalCostMonth = readCostMonth + writeCostMonth + storCostMonth;

    // Free tier usage %
    const readPct    = Math.min(100, Math.round(estDailyReads  / FREE_READS  * 100));
    const writePct   = Math.min(100, Math.round(estDailyWrites / FREE_WRITES * 100));
    const storPct    = Math.min(100, Math.round(totalStorMB    / FREE_STORAGE * 100));

    const pctBar = (pct, color) => `
        <div style="background:#f3f4f6;border-radius:4px;height:6px;overflow:hidden;margin-top:3px;">
            <div style="background:${color};height:100%;width:${pct}%;transition:width .4s;border-radius:4px;"></div>
        </div>`;

    const statusColor = pct => pct >= 80 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#22c55e';

    // Per-company table sorted by totalDocs desc
    const sorted = [...pc].sort((a,b) => (b.totalDocs||0) - (a.totalDocs||0));

    const rows = sorted.map(c => {
        const docs = c.totalDocs || 0;
        const storMB = (c.estStorageKB||0) / 1024;
        const costUSD = c.estCostUSD || 0;
        const dc = c.docCounts || {};
        return `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;font-weight:600;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(c.data.name||c.id)}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;text-align:right;font-weight:700;">${docs.toLocaleString()}</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.75rem;color:#6b7280;text-align:right;">${storMB.toFixed(1)} MB</td>
            <td style="padding:0.4rem 0.5rem;font-size:0.75rem;text-align:right;">
                <span style="font-size:0.68rem;color:#525252;">
                    T:${dc.tasks||0} D:${dc.deals||0} C:${dc.clients||0} F:${dc.finance||0}
                </span>
            </td>
            <td style="padding:0.4rem 0.5rem;font-size:0.78rem;text-align:right;color:${costUSD>1?'#ef4444':costUSD>0.5?'#f59e0b':'#16a34a'};font-weight:600;">
                ~$${costUSD.toFixed(2)}/міс
            </td>
        </tr>`;
    }).join('');

    return `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:0.85rem;border-top:3px solid ${statusColor(readPct)};">
            <div style="font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:0.25rem;">Reads / день</div>
            <div style="font-size:1.3rem;font-weight:800;color:${statusColor(readPct)};">${Math.round(estDailyReads).toLocaleString()}</div>
            <div style="font-size:0.7rem;color:#9ca3af;">ліміт: ${FREE_READS.toLocaleString()}/день</div>
            ${pctBar(readPct, statusColor(readPct))}
            <div style="font-size:0.68rem;color:#9ca3af;margin-top:2px;">${readPct}% free tier</div>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:0.85rem;border-top:3px solid ${statusColor(writePct)};">
            <div style="font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:0.25rem;">Writes / день</div>
            <div style="font-size:1.3rem;font-weight:800;color:${statusColor(writePct)};">${Math.round(estDailyWrites).toLocaleString()}</div>
            <div style="font-size:0.7rem;color:#9ca3af;">ліміт: ${FREE_WRITES.toLocaleString()}/день</div>
            ${pctBar(writePct, statusColor(writePct))}
            <div style="font-size:0.68rem;color:#9ca3af;margin-top:2px;">${writePct}% free tier</div>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:0.85rem;border-top:3px solid ${statusColor(storPct)};">
            <div style="font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:0.25rem;">Storage</div>
            <div style="font-size:1.3rem;font-weight:800;color:${statusColor(storPct)};">${totalStorMB.toFixed(0)} MB</div>
            <div style="font-size:0.7rem;color:#9ca3af;">ліміт: ${FREE_STORAGE} MB</div>
            ${pctBar(storPct, statusColor(storPct))}
            <div style="font-size:0.68rem;color:#9ca3af;margin-top:2px;">${storPct}% free tier</div>
        </div>
    </div>

    <!-- Cost summary -->
    <div style="background:${totalCostMonth>5?'#fef2f2':totalCostMonth>1?'#fffbeb':'#f0fdf4'};border:1px solid ${totalCostMonth>5?'#fecaca':totalCostMonth>1?'#fde68a':'#bbf7d0'};border-radius:12px;padding:0.85rem 1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
        <div>
            <div style="font-weight:700;font-size:0.9rem;color:#1a1a1a;">Орієнтовна вартість Firebase/місяць</div>
            <div style="font-size:0.75rem;color:#525252;margin-top:2px;">
                ${totalDocs.toLocaleString()} документів · ${totalStorMB.toFixed(0)} MB · ${pc.length} компаній
            </div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:1.8rem;font-weight:800;color:${totalCostMonth>5?'#dc2626':totalCostMonth>1?'#d97706':'#16a34a'};">~$${totalCostMonth.toFixed(2)}</div>
            <div style="font-size:0.68rem;color:#9ca3af;">Spark (free): $0 / Blaze: за споживання</div>
        </div>
    </div>

    <!-- Pricing breakdown -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:1rem;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.6rem 0.75rem;">
            <div style="font-size:0.68rem;color:#9ca3af;">Reads (місяць)</div>
            <div style="font-weight:700;font-size:0.85rem;">~$${readCostMonth.toFixed(2)}</div>
            <div style="font-size:0.65rem;color:#9ca3af;">$0.06 / 100k</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.6rem 0.75rem;">
            <div style="font-size:0.68rem;color:#9ca3af;">Writes (місяць)</div>
            <div style="font-weight:700;font-size:0.85rem;">~$${writeCostMonth.toFixed(2)}</div>
            <div style="font-size:0.65rem;color:#9ca3af;">$0.18 / 100k</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.6rem 0.75rem;">
            <div style="font-size:0.68rem;color:#9ca3af;">Storage (місяць)</div>
            <div style="font-weight:700;font-size:0.85rem;">~$${storCostMonth.toFixed(2)}</div>
            <div style="font-size:0.65rem;color:#9ca3af;">$0.18 / GB</div>
        </div>
    </div>

    <!-- Per company table -->
    <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="padding:0.6rem 0.75rem;background:#f8fafc;border-bottom:1px solid #e5e7eb;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:space-between;">
            <span>По компаніях (топ за документами)</span>
            <span style="font-size:0.7rem;color:#9ca3af;font-weight:400;">T=Tasks D=Deals C=Clients F=Finance</span>
        </div>
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f8fafc;">
                        <th style="padding:0.4rem 0.5rem;text-align:left;font-size:0.72rem;font-weight:600;color:#6b7280;">Компанія</th>
                        <th style="padding:0.4rem 0.5rem;text-align:right;font-size:0.72rem;font-weight:600;color:#6b7280;">Документів</th>
                        <th style="padding:0.4rem 0.5rem;text-align:right;font-size:0.72rem;font-weight:600;color:#6b7280;">Storage</th>
                        <th style="padding:0.4rem 0.5rem;text-align:right;font-size:0.72rem;font-weight:600;color:#6b7280;">Розбивка</th>
                        <th style="padding:0.4rem 0.5rem;text-align:right;font-size:0.72rem;font-weight:600;color:#6b7280;">Вартість</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    </div>

    <div style="margin-top:0.75rem;padding:0.6rem 0.85rem;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:0.72rem;color:#0369a1;line-height:1.5;">
        <strong>Примітка:</strong> Оцінка наближена. Реальні reads залежать від активності юзерів. Ціни Firebase Blaze: Reads $0.06/100k · Writes $0.18/100k · Deletes $0.02/100k · Storage $0.18/GB. Spark plan безкоштовний до 50k reads/day.
    </div>`;
}

function _saRenderSystem() {
    return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem;">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" style="vertical-align:-2px;margin-right:5px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                AI Налаштування
            </div>
            <button onclick="openGlobalAISettings()"
                style="width:100%;padding:0.55rem;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;">
                Глобальні налаштування (ключі, агенти, моделі)
            </button>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem;">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" style="vertical-align:-2px;margin-right:5px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Комунікації
            </div>
            <button onclick="saBroadcastTelegram()"
                style="width:100%;padding:0.55rem;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;">
                Broadcast в Telegram (власники)
            </button>
            <div style="font-size:0.7rem;color:#9ca3af;margin-top:0.4rem;padding:0 0.25rem;">
                Надіслати повідомлення всім власникам з підключеним TG. Перед відправкою буде показано список отримувачів.
            </div>
        </div>
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:1rem;grid-column:1/-1;">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" style="vertical-align:-2px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Швидкі посилання
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <a href="https://console.firebase.google.com" target="_blank"
                    style="padding:0.4rem 0.85rem;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;border-radius:7px;font-size:0.8rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Firebase Console
                </a>
                <a href="https://dash.cloudflare.com/12d5ceff4d93e06ad7f00aceb903447d/pages/view/talko-task-manager" target="_blank"
                    style="padding:0.4rem 0.85rem;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;border-radius:7px;font-size:0.8rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Cloudflare Dashboard
                </a>
                <a href="https://github.com/Vortex-technology1/talko-task-manager" target="_blank"
                    style="padding:0.4rem 0.85rem;background:#f8fafc;border:1px solid #e2e8f0;color:#374151;border-radius:7px;font-size:0.8rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                    GitHub Repo
                </a>
                <a href="https://apptalko.com" target="_blank"
                    style="padding:0.4rem 0.85rem;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;border-radius:7px;font-size:0.8rem;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Відкрити Prod
                </a>
            </div>
        </div>
    </div>`;
}

// ── HELPERS ──────────────────────────────────────────────────
function _saKpi(label, value, color, tooltip) {
    const tip = tooltip ? ` title="${tooltip.replace(/"/g,"'")}"` : '';
    const infoIcon = tooltip ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-left:3px;cursor:help;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` : '';
    return `<div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:0.65rem 0.85rem;border-top:3px solid ${color};"${tip}>
        <div style="font-size:0.65rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">${_saEsc(label)}${infoIcon}</div>
        <div style="font-size:1.4rem;font-weight:800;color:${color};line-height:1.2;margin-top:2px;">${value}</div>
    </div>`;
}
function _saEsc(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


window.saOpenCompanyDetail = function(companyId) {
    const pc  = window._saData?.perCompany || [];
    const c   = pc.find(x => x.id === companyId);
    if (!c) return;
    const d   = c.data;
    const snap = c.snapshot;
    const sig  = snap?.signals || {};
    const tot  = snap?.totals  || {};

    const healthColor = c.health>=70?'#22c55e':c.health>=40?'#f59e0b':'#ef4444';

    // ── Users ──────────────────────────────────────────────
    const roleColors = {owner:'#7c3aed',manager:'#2563eb',employee:'#374151',admin:'#dc2626'};
    const userRows = c.users.map(u=>`
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;border-bottom:1px solid #f3f4f6;">
            <span style="font-size:0.75rem;font-weight:600;min-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_saEsc(u.name||u.email||'—')}</span>
            <span style="font-size:0.68rem;background:${roleColors[u.role]||'#374151'}15;color:${roleColors[u.role]||'#374151'};padding:1px 5px;border-radius:4px;">${u.role||'—'}</span>
            <span style="font-size:0.68rem;color:#9ca3af;margin-left:auto;">${u.telegramChatId?'TG ✓':''} ${u.language||'ua'}</span>
        </div>`).join('') || '<div style="color:#9ca3af;font-size:0.78rem;">Немає юзерів</div>';

    // ── Events top-10 ──────────────────────────────────────
    const evRows = Object.entries(c.eventCounts||{})
        .sort((a,b)=>b[1]-a[1]).slice(0,10)
        .map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;padding:2px 0;font-size:0.73rem;border-bottom:1px solid #f9f9f9;">
            <span style="font-family:monospace;color:#374151;">${_saEsc(k)}</span>
            <strong>${v}</strong>
        </div>`).join('') || '<div style="color:#9ca3af;font-size:0.75rem;">Немає подій</div>';

    // ── AI Recs ────────────────────────────────────────────
    const recRows = (c.aiRecs||[]).map(r=>`
        <div style="padding:0.35rem 0;border-bottom:1px solid #f3f4f6;font-size:0.73rem;">
            <span style="color:${r.severity==='critical'?'#dc2626':'#ca8a04'};">${r.severity==='critical'?'●':'◐'}</span>
            ${_saEsc(r.signalText||r.signal||'—')}
        </div>`).join('') || '<div style="color:#9ca3af;font-size:0.73rem;">Немає рекомендацій</div>';

    // ── Notes ──────────────────────────────────────────────
    const noteRows = (c.notes||[]).slice(0,5).map(n=>`
        <div style="padding:0.35rem 0;border-bottom:1px solid #f3f4f6;font-size:0.73rem;">
            <div style="color:#374151;">${_saEsc(n.text||'')}</div>
            <div style="color:#9ca3af;font-size:0.68rem;margin-top:1px;">${_saEsc(n.by||'')}</div>
        </div>`).join('') || '<div style="color:#9ca3af;font-size:0.73rem;">Немає нотаток</div>';

    // ── Snapshot metrics ───────────────────────────────────
    const snapGrid = snap ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.73rem;">
            <div>Активних: <strong>${tot.active||0}</strong></div>
            <div>Прострочених: <strong style="color:${(tot.overdue||0)>0?'#ef4444':'#22c55e'}">${tot.overdue||0}</strong></div>
            <div>Owner%: <strong>${sig.ownerTaskRatio?Math.round(sig.ownerTaskRatio*100)+'%':'—'}</strong></div>
            <div>SLA: <strong>${tot.slaBreaches||0}</strong></div>
            <div>Bottlenecks: <strong>${(sig.processBottlenecks||[]).length||'—'}</strong></div>
            <div>High return: <strong>${(sig.functionsWithHighReturn||[]).length||'—'}</strong></div>
        </div>` : '<div style="color:#9ca3af;font-size:0.73rem;">Немає snapshot</div>';

    document.getElementById('saDetailOverlay')?.remove();
    const ov = document.createElement('div');
    ov.id = 'saDetailOverlay';
    ov.onclick = e => { if(e.target===ov) ov.remove(); };
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:10030;display:flex;align-items:center;justify-content:center;padding:1rem;';

    const safeId = companyId.replace(/['"]/g,'');

    ov.innerHTML = `
    <div style="background:white;border-radius:14px;width:100%;max-width:1100px;max-height:96vh;
        display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.25);">

        <!-- Header -->
        <div style="padding:1rem 1.25rem;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
            <div>
                <div style="font-weight:800;font-size:1.05rem;">${_saEsc(d.name||companyId)}</div>
                <div style="display:flex;gap:0.5rem;align-items:center;margin-top:3px;flex-wrap:wrap;">
                    <span style="font-size:0.7rem;color:#9ca3af;">${companyId}</span>
                    <span style="font-size:0.72rem;font-weight:700;color:${healthColor};">Health ${c.health}%</span>
                    <span style="font-size:0.7rem;background:${d.aiEnabled!==false?'#dcfce7':'#fee2e2'};color:${d.aiEnabled!==false?'#16a34a':'#dc2626'};padding:1px 6px;border-radius:4px;">AI ${d.aiEnabled!==false?'ON':'OFF'}</span>
                    <span style="font-size:0.7rem;background:#f3f4f6;padding:1px 6px;border-radius:4px;">${d.plan||'pro'}</span>
                    <span style="font-size:0.7rem;color:#9ca3af;">${c.daysSinceActivity===0?'активний сьогодні':c.daysSinceActivity===999?'ніколи':c.daysSinceActivity+'д тому'}</span>
                </div>
            </div>
            <button onclick="document.getElementById('saDetailOverlay').remove()"
                style="background:none;border:none;cursor:pointer;font-size:1.4rem;color:#9ca3af;line-height:1;padding:0.25rem;">×</button>
        </div>

        <!-- Quick actions -->
        <div style="padding:0.6rem 1.25rem;border-bottom:1px solid #f3f4f6;display:flex;gap:0.4rem;flex-wrap:wrap;flex-shrink:0;background:#fafafa;">
            <select onchange="updateCompanyPlan('${safeId}',this.value)"
                style="padding:0.3rem 0.5rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.78rem;cursor:pointer;background:white;">
                <option value="basic"      ${(d.plan||'pro')==='basic'?'selected':''}>Basic</option>
                <option value="pro"        ${(d.plan||'pro')==='pro'?'selected':''}>Pro</option>
                <option value="enterprise" ${(d.plan||'pro')==='enterprise'?'selected':''}>Enterprise</option>
            </select>
            <button onclick="openFeatureFlags('${safeId}','${_saEsc(d.name||companyId)}')"
                style="padding:0.3rem 0.7rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">Модулі</button>
            <button onclick="toggleCompanyAI('${safeId}',${d.aiEnabled!==false?'false':'true'})"
                style="padding:0.3rem 0.7rem;background:${d.aiEnabled!==false?'#fef2f2':'#f0fdf4'};color:${d.aiEnabled!==false?'#ef4444':'#16a34a'};border:1px solid ${d.aiEnabled!==false?'#fecaca':'#bbf7d0'};border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">
                AI ${d.aiEnabled!==false?'вимкнути':'увімкнути'}</button>
            <button onclick="saAddNote('${safeId}')"
                style="padding:0.3rem 0.7rem;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">+ Нотатка</button>
            <div style="display:flex;align-items:center;gap:4px;margin-left:auto;">
                <label style="font-size:0.72rem;color:#6b7280;">Ліміт/день:</label>
                <input type="number" value="${d.aiDailyTokenLimit||''}" placeholder="∞" min="0" step="1000"
                    style="width:80px;padding:0.25rem 0.4rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.72rem;"
                    onchange="updateAILimit('${safeId}','aiDailyTokenLimit',this.value)">
                <label style="font-size:0.72rem;color:#6b7280;">міс:</label>
                <input type="number" value="${d.aiMonthlyTokenLimit||''}" placeholder="∞" min="0" step="10000"
                    style="width:90px;padding:0.25rem 0.4rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.72rem;"
                    onchange="updateAILimit('${safeId}','aiMonthlyTokenLimit',this.value)">
            </div>
        </div>

        <!-- Body -->
        <div style="flex:1;overflow-y:auto;padding:1rem 1.25rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem;">
                ${_saKpi('Юзерів',      c.users.length,            '#8b5cf6')}
                ${_saKpi('AI токени/д', c.todayTokens.toLocaleString(), '#3b82f6')}
                ${_saKpi('AI токени/міс',c.monthTokens.toLocaleString(),'#06b6d4')}
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div>
                    <div style="font-weight:700;font-size:0.82rem;margin-bottom:0.4rem;color:#374151;">
                        Користувачі (${c.users.length})
                    </div>
                    <div style="max-height:280px;overflow-y:auto;">${userRows}</div>
                </div>
                <div>
                    <div style="font-weight:700;font-size:0.82rem;margin-bottom:0.4rem;color:#374151;">
                        Events 7д (${c.totalEvents7d})
                    </div>
                    <div style="max-height:280px;overflow-y:auto;">${evRows}</div>
                </div>
                <div>
                    <div style="font-weight:700;font-size:0.82rem;margin-bottom:0.4rem;color:#374151;">
                        Snapshot сьогодні
                    </div>
                    ${snapGrid}
                    <div style="margin-top:0.5rem;font-size:0.72rem;color:#6b7280;">
                        Тижневий звіт: <strong>${c.weeklyLog?'✓ надіслано':'не надіслано'}</strong>
                    </div>
                </div>
                <div>
                    <div style="font-weight:700;font-size:0.82rem;margin-bottom:0.4rem;color:#374151;">
                        AI рекомендації (${(c.aiRecs||[]).length})
                    </div>
                    <div style="max-height:200px;overflow-y:auto;">${recRows}</div>
                </div>
                <div style="grid-column:1/-1;">
                    <div style="font-weight:700;font-size:0.82rem;margin-bottom:0.4rem;color:#374151;">
                        Нотатки суперадміна
                    </div>
                    <div style="max-height:180px;overflow-y:auto;" id="saNotesFor_${safeId}">${noteRows}</div>
                </div>
            </div>
        </div>
    </div>`;
    document.body.appendChild(ov);
};

window.saFilterCompanies = function(query) {
    const q = (query||'').toLowerCase().trim();
    document.querySelectorAll('#saTabContent_companies table tbody tr').forEach(tr=>{
        tr.style.display = (!q || (tr.dataset.name||'').includes(q)) ? '' : 'none';
    });
};

// ── Нотатки суперадміна ──────────────────────────────────────
window.saAddNote = async function(companyId) {
    const text = await (window.showInputModal
        ? showInputModal('Нотатка для компанії', '', {placeholder:'Введіть нотатку...', multiline:true})
        : (async()=>prompt('Нотатка:'))());
    if (!text?.trim()) return;
    try {
        await firebase.firestore().collection('companies').doc(companyId)
            .collection('sa_notes').add({
                text: text.trim(),
                by:   window.currentUser?.email || 'superadmin',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        if (typeof showToast === 'function') showToast('Нотатку збережено ✓', 'success');
        // Оновлюємо дані цієї компанії в _saData
        const pc = window._saData?.perCompany?.find(c=>c.id===companyId);
        if (pc) pc.notes.unshift({text:text.trim(), by:window.currentUser?.email||'superadmin'});
    } catch(e) {
        if (typeof showToast === 'function') showToast('Помилка: '+e.message, 'error');
    }
};



// ── Export CSV ───────────────────────────────────────────────
window.saExportCsv = function() {
    const pc = window._saData?.perCompany || [];
    const headers = ['ID','Назва','План','Юзерів','Власників','Менеджерів','TG підкл.','Активних задач','Прострочених','Health%','Events 7д','AI ON','Токени/день','Токени/міс','Активність'];
    const rows = pc.map(c => [
        c.id,
        c.data.name || c.id,
        c.data.plan || 'pro',
        c.users.length,
        c.ownerCount,
        c.managerCount,
        c.telegramCount,
        c.activeTasks,
        c.overdueTasks,
        c.health,
        c.totalEvents7d,
        c.data.aiEnabled !== false ? 'Так' : 'Ні',
        c.todayTokens,
        c.monthTokens,
        c.daysSinceActivity === 999 ? 'ніколи' : c.daysSinceActivity === 0 ? 'сьогодні' : c.daysSinceActivity + 'д тому',
    ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','));

    const csv = '﻿' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'talko_companies_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('CSV завантажено ✓', 'success');
};

// ── Broadcast повідомлення через Telegram ────────────────────
window.saBroadcastTelegram = async function() {
    const text = await (window.showInputModal
        ? showInputModal('Broadcast в Telegram', '', {
            placeholder: 'Повідомлення для всіх власників з TG...',
            multiline: true,
          })
        : (async()=>prompt('Повідомлення:'))());
    if (!text?.trim()) return;

    const pc = window._saData?.perCompany || [];
    const recipients = [];
    pc.forEach(c => {
        c.users.filter(u => u.role === 'owner' && u.telegramChatId).forEach(u => {
            recipients.push({ chatId: u.telegramChatId, name: u.name || u.email, company: c.data.name || c.id });
        });
    });

    if (recipients.length === 0) {
        if (typeof showToast === 'function') showToast('Немає власників з Telegram', 'warning');
        return;
    }

    // Show preview of recipients
    const previewList = recipients.slice(0, 10).map(r => `• ${r.name || r.chatId} (${r.company})`).join('\n');
    const moreCount   = recipients.length > 10 ? `\n... і ще ${recipients.length - 10}` : '';
    const confirmed = window.showConfirmModal
        ? await showConfirmModal(`Надіслати ${recipients.length} власникам:\n${previewList}${moreCount}`)
        : confirm(`Надіслати ${recipients.length} власникам?\n\n${previewList}${moreCount}`);
    if (!confirmed) return;

    let sent = 0;
    for (const r of recipients) {
        try {
            await firebase.firestore().collection('telegramBroadcast').add({
                chatId:    r.chatId,
                text:      `📢 Від платформи TALKO:

${text.trim()}`,
                company:   r.company,
                userName:  r.name,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status:    'pending',
            });
            sent++;
        } catch(e) { console.warn('[Broadcast]', e.message); }
    }
    if (typeof showToast === 'function') showToast(`Broadcast надіслано ${sent}/${recipients.length} ✓`, 'success');
};

window.updateCompanyPlan = async function(companyId, plan) {
    const validPlans = ['basic', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) return;
    try {
        await firebase.firestore().collection('companies').doc(companyId).update({ plan });
        const planLabel = { basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise' };
        showToast && showToast('План змінено → ' + (planLabel[plan] || plan), 'success');
        // Refresh row without full reload
        await loadSuperadminData();
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

window.toggleCompanyAI = async function(companyId, enabled) {
    try {
        await firebase.firestore().collection('companies').doc(companyId).update({ aiEnabled: enabled });
        showToast && showToast(`AI ${enabled ? 'увімкнено' : 'вимкнено'} ✓`, 'success');
        await loadSuperadminData();
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

// ── Блокування/розблокування компанії ────────────────────────
window.toggleCompanyBlock = async function(companyId, companyName, isBlocked) {
    const action = isBlocked ? 'розблокувати' : 'заблокувати';
    const confirmed = typeof showConfirmModal === 'function'
        ? await showConfirmModal(`${isBlocked?'Розблокувати':'Заблокувати'} компанію "${companyName}"?`, { danger: !isBlocked })
        : confirm(`${action} компанію "${companyName}"?`);
    if (!confirmed) return;
    try {
        await firebase.firestore().collection('companies').doc(companyId).update({
            disabled: !isBlocked,
            disabledAt: !isBlocked ? firebase.firestore.FieldValue.serverTimestamp() : null,
        });
        showToast && showToast(`Компанію ${isBlocked ? '🔓 розблоковано' : '🔒 заблоковано'} ✓`, 'success');
        await loadSuperadminData();
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

// ── Підтвердження/відхилення реєстрації ──────────────────────
window.approveRegistration = async function(companyId, companyName) {
    const confirmed = typeof showConfirmModal === 'function'
        ? await showConfirmModal(`Надати доступ компанії "${companyName}"?`)
        : confirm(`Надати доступ "${companyName}"?`);
    if (!confirmed) return;
    try {
        const batch = firebase.firestore().batch();
        batch.update(firebase.firestore().collection('companies').doc(companyId), {
            disabled: false,
            pendingApproval: false,
            subscriptionStatus: 'active',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        batch.update(firebase.firestore().collection('registration_requests').doc(companyId), {
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await batch.commit();
        showToast && showToast(`✅ Компанію "${companyName}" підтверджено`, 'success');
        await loadSuperadminData();
        renderPendingRegistrations();
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

window.rejectRegistration = async function(companyId, companyName) {
    const confirmed = typeof showConfirmModal === 'function'
        ? await showConfirmModal(`Відхилити реєстрацію "${companyName}"?`, { danger: true })
        : confirm(`Відхилити "${companyName}"?`);
    if (!confirmed) return;
    try {
        await firebase.firestore().collection('registration_requests').doc(companyId).update({
            status: 'rejected',
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await firebase.firestore().collection('companies').doc(companyId).update({ disabled: true, pendingApproval: false });
        showToast && showToast(`❌ Реєстрацію "${companyName}" відхилено`, 'info');
        renderPendingRegistrations();
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

// ── Рендер панелі нових реєстрацій ───────────────────────────
async function renderPendingRegistrations() {
    const wrap = document.getElementById('saPendingRegs');
    if (!wrap) return;
    try {
        const snap = await firebase.firestore().collection('registration_requests')
            .where('status', '==', 'pending').orderBy('createdAt', 'desc').limit(50).get();
        if (snap.empty) {
            wrap.innerHTML = '<div style="color:#9ca3af;font-size:0.82rem;padding:0.5rem 0;">Нових заявок немає ✓</div>';
            return;
        }
        wrap.innerHTML = snap.docs.map(doc => {
            const r = doc.data();
            const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('uk-UA') : '—';
            return `
            <div style="background:white;border:1px solid #fde68a;border-radius:10px;padding:0.75rem 1rem;
                display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.4rem;">
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:0.88rem;color:#111827;">${r.companyName}</div>
                    <div style="font-size:0.75rem;color:#6b7280;">${r.ownerName} · ${r.ownerEmail} · ${date}</div>
                </div>
                <button onclick="approveRegistration('${doc.id}','${(r.companyName||'').replace(/'/g,"\\'")}')"
                    style="padding:0.35rem 0.85rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:700;">
                    ✅ Підтвердити
                </button>
                <button onclick="rejectRegistration('${doc.id}','${(r.companyName||'').replace(/'/g,"\\'")}')"
                    style="padding:0.35rem 0.85rem;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">
                    ❌ Відхилити
                </button>
            </div>`;
        }).join('');
    } catch(e) { wrap.innerHTML = '<div style="color:#ef4444;font-size:0.8rem;">Помилка завантаження</div>'; }
}

window.updateAILimit = async function(companyId, field, value) {
    const num = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
    try {
        await firebase.firestore().collection('companies').doc(companyId).update({ [field]: num });
        showToast && showToast('Ліміт збережено ✓', 'success');
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

window.openFeatureFlags = async function(companyId, companyName) {
    try {
        const doc = await firebase.firestore().collection('companies').doc(companyId).get();
        const features = doc.data()?.features || {};

        const renderGroup = (groupKey, groupLabel) => {
            const items = FEATURES.filter(f => f.group === groupKey);
            const checks = items.map(f => `
            <label style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.6rem;border-radius:8px;cursor:pointer;transition:background .1s;"
                onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <input type="checkbox" ${features[f.key] !== false ? 'checked' : ''}
                    data-feature="${f.key}" style="width:16px;height:16px;accent-color:#22c55e;cursor:pointer;flex-shrink:0;">
                <span style="font-size:0.85rem;">${f.label}</span>
            </label>`).join('');
            return `
            <div style="margin-bottom:1rem;">
                <div style="font-size:0.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.35rem;padding:0 0.6rem;">${groupLabel}</div>
                <div style="background:#f8fafc;border-radius:10px;padding:0.25rem 0.25rem;">${checks}</div>
            </div>`;
        };

        document.getElementById('featureFlagsOverlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'featureFlagsOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10030;display:flex;align-items:center;justify-content:center;padding:1rem;';
        overlay.innerHTML = `
            <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <div>
                        <div style="font-size:1rem;font-weight:800;color:#111;">⚙️ Доступний функціонал</div>
                        <div style="font-size:0.78rem;color:#6b7280;margin-top:2px;">${_saEsc(companyName)}</div>
                    </div>
                    <button onclick="document.getElementById('featureFlagsOverlay').remove()" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9ca3af;">✕</button>
                </div>
                <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
                    <button onclick="toggleAllFeatures(true)" style="padding:0.3rem 0.8rem;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;">✓ Всі</button>
                    <button onclick="toggleAllFeatures(false)" style="padding:0.3rem 0.8rem;background:#fef2f2;border:1px solid #fecaca;color:#ef4444;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;">✕ Жодного</button>
                </div>
                <div id="featureChecksList">
                    ${renderGroup('tabs', 'Основні вкладки')}
                    ${renderGroup('modules', 'Додаткові модулі')}
                </div>
                <div style="display:flex;gap:0.5rem;margin-top:1rem;">
                    <button onclick="document.getElementById('featureFlagsOverlay').remove()" style="flex:1;padding:0.6rem;border:1px solid #e5e7eb;background:white;border-radius:8px;cursor:pointer;">Скасувати</button>
                    <button onclick="saveFeatureFlags('${companyId}')" style="flex:2;padding:0.6rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">✓ Зберегти</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};


window.toggleAllFeatures = function(val) {
    document.querySelectorAll('#featureChecksList input[type=checkbox]').forEach(cb => cb.checked = val);
};

window.saveFeatureFlags = async function(companyId) {
    const features = {};
    document.querySelectorAll('#featureChecksList input[type=checkbox]').forEach(cb => {
        features[cb.dataset.feature] = cb.checked;
    });
    try {
        await firebase.firestore().collection('companies').doc(companyId).update({ features });
        document.getElementById('featureFlagsOverlay')?.remove();
        showToast && showToast('Модулі збережено ✓', 'success');
        await loadSuperadminData();
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

window.openGlobalAISettings = async function() {
    try {
        const [aiDoc, modelsDoc, saDoc] = await Promise.all([
            firebase.firestore().collection('settings').doc('ai').get(),
            firebase.firestore().collection('settings').doc('aiModels').get(),
            firebase.firestore().collection('settings').doc('platform').get(),
        ]);
        const s = aiDoc.exists ? aiDoc.data() : {};
        const saSettings = saDoc.exists ? saDoc.data() : {};
        const platformKeyStored = !!saSettings.openaiApiKey;

        // Дефолтні моделі — реальні назви API (не маркетингові)
        const defaultModels = {
            openai: [
                ['gpt-4o-mini',  'GPT-4o mini — рекомендовано <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'],
                ['gpt-4o',       'GPT-4o'],
                ['gpt-4.1-mini', 'GPT-4.1 mini'],
                ['gpt-4.1',      'GPT-4.1'],
                ['gpt-4.1-nano', 'GPT-4.1 nano'],
                ['o1-mini',      'o1-mini'],
                ['o1',           'o1'],
                ['o3-mini',      'o3-mini'],
                ['gpt-3.5-turbo','GPT-3.5 Turbo — найдешевший'],
                ['gpt-4o-mini',  'GPT-4o mini'],
            ],
            anthropic: [
                ['claude-opus-4-5',          'Claude Opus 4.5'],
                ['claude-sonnet-4-5',         'Claude Sonnet 4.5'],
                ['claude-haiku-4-5-20251001', 'Claude Haiku 4.5'],
            ],
            google: [
                ['gemini-2.5-pro',   'Gemini 2.5 Pro'],
                ['gemini-2.0-flash', 'Gemini 2.0 Flash'],
                ['gemini-1.5-pro',   'Gemini 1.5 Pro'],
                ['gemini-1.5-flash', 'Gemini 1.5 Flash'],
            ]
        };
        // Firestore не підтримує nested arrays — конвертуємо {id,name} → [id,name] для роботи в UI
        const _fromFirestore = (data) => {
            const result = {};
            ["openai","anthropic","google"].forEach(p => {
                if (!data[p]) return;
                result[p] = data[p].map(m => Array.isArray(m) ? m : [m.id||m[0]||"", m.name||m[1]||""]);
            });
            return result;
        };
        const rawModels = modelsDoc.exists ? modelsDoc.data() : defaultModels;
        const _mConverted = _fromFirestore(rawModels);
        const _mFinal = Object.keys(_mConverted).length ? _mConverted : defaultModels;
        // Зберігаємо в глобальну змінну для доступу з функцій
        window._editingModels = JSON.parse(JSON.stringify(_mFinal));

        document.getElementById('globalAIOverlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'globalAIOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10030;display:flex;align-items:center;justify-content:center;padding:1rem;';

        const renderModelsTab = (provider) => {
            const list = (window._editingModels[provider] || []);
            return `<div id="modelsTabContent">
                <div style="display:flex;gap:6px;margin-bottom:10px;">
                    ${['openai','anthropic','google'].map(p => `
                        <button onclick="window._switchModelsProvider('${p}')"
                            id="mtp_${p}"
                            style="flex:1;padding:6px 4px;border:1px solid ${provider===p?'#22c55e':'#e5e7eb'};
                            border-radius:8px;background:${provider===p?'#f0fdf4':'white'};
                            color:${provider===p?'#16a34a':'#374151'};font-size:11px;font-weight:600;cursor:pointer;">
                            ${p==='openai'?'OpenAI':p==='anthropic'?'Anthropic':'Google'}
                        </button>`).join('')}
                </div>
                <div id="modelsList" style="max-height:320px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:8px;padding:6px;">
                    ${list.map((m,i) => `
                        <div style="display:flex;gap:6px;align-items:center;margin-bottom:5px;">
                            <input value="${m[0]}" placeholder="model-id"
                                onchange="window._editingModels[window._currentModelProvider][${i}][0]=this.value"
                                style="flex:1;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;font-family:monospace;">
                            <input value="${m[1]}" placeholder="Назва"
                                onchange="window._editingModels[window._currentModelProvider][${i}][1]=this.value"
                                style="flex:1.5;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;">
                            <button onclick="window._removeModel(${i})"
                                style="padding:4px 8px;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-size:12px;">✕</button>
                        </div>`).join('')}
                </div>
                <button onclick="window._addModel()"
                    style="width:100%;margin-top:8px;padding:6px;background:#f0fdf4;color:#16a34a;
                    border:1px solid #bbf7d0;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">
                    + Додати модель
                </button>
            </div>`;
        };

        window._currentModelProvider = 'openai';
        const _rerenderModels = (p) => {
            const tab = document.getElementById('aiTab_models');
            if (tab) tab.innerHTML = `<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                    Редагуй список моделей — зміни одразу видні всім клієнтам без деплою коду.
                </div>` + renderModelsTab(p);
        };
        window._switchModelsProvider = (p) => {
            window._currentModelProvider = p;
            _rerenderModels(p);
        };
        window._addModel = () => {
            if (!window._editingModels[window._currentModelProvider]) window._editingModels[window._currentModelProvider] = [];
            window._editingModels[window._currentModelProvider].push(['', 'Нова модель']);
            _rerenderModels(window._currentModelProvider);
        };
        window._removeModel = (i) => {
            window._editingModels[window._currentModelProvider].splice(i, 1);
            _rerenderModels(window._currentModelProvider);
        };

        overlay.innerHTML = `
            <div style="background:white;border-radius:16px;width:100%;max-width:1000px;max-height:96vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);display:flex;flex-direction:column;">
            <div style="padding:1.5rem 1.5rem 0;overflow-y:auto;flex:1;">
                <h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;"><span style="display:inline-flex;align-items:center;gap:6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 1 21 12a10 10 0 0 1-1.93 7.07M4.93 4.93A10 10 0 0 0 3 12a10 10 0 0 0 1.93 7.07M12 2v2M12 20v2M2 12h2M20 12h2"/></svg> Глобальні AI налаштування</span></h3>

                <!-- TABS -->
                <div style="display:flex;gap:4px;background:#f3f4f6;border-radius:10px;padding:3px;margin-bottom:1rem;">
                    <button onclick="window._switchAiTab('general')" id="aiTabBtn_general"
                        style="flex:1;padding:6px;background:white;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        Загальні
                    </button>
                    <button onclick="window._switchAiTab('agents')" id="aiTabBtn_agents"
                        style="flex:1;padding:6px;background:transparent;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;color:#6b7280;">
                        <span style="display:inline-flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg> AI Агенти</span>
                    </button>
                    <button onclick="window._switchAiTab('models')" id="aiTabBtn_models"
                        style="flex:1;padding:6px;background:transparent;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;color:#6b7280;">
                        Моделі
                    </button>
                </div>

                <!-- TAB: GENERAL -->
                <div id="aiTab_general">
                    <!-- Платформний OpenAI ключ -->
                    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:0.75rem;margin-bottom:1rem;">
                        <div style="font-size:0.78rem;font-weight:700;color:#1d4ed8;margin-bottom:6px;">
                            🔑 Платформний OpenAI API Key
                        </div>
                        <div style="font-size:0.72rem;color:#1e40af;margin-bottom:8px;">
                            Діє на всі компанії платформи. Компанія може перевизначити власним ключем.
                            ${platformKeyStored ? '<span style="background:#dcfce7;color:#16a34a;padding:2px 6px;border-radius:4px;font-weight:600;">✓ Ключ збережено</span>' : '<span style="background:#fef2f2;color:#dc2626;padding:2px 6px;border-radius:4px;font-weight:600;">⚠ Не встановлено</span>'}
                        </div>
                        <div style="display:flex;gap:6px;">
                            <input type="password" id="platformOpenAiKey" placeholder="${platformKeyStored ? '••••••••••••••••' : 'sk-...'}"
                                style="flex:1;padding:0.45rem 0.6rem;border:1px solid #bfdbfe;border-radius:8px;font-size:0.85rem;font-family:monospace;box-sizing:border-box;">
                            ${platformKeyStored ? `<button onclick="clearPlatformKey()" style="padding:0.45rem 0.7rem;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;cursor:pointer;font-size:0.8rem;white-space:nowrap;">✕ Очистити</button>` : ''}
                        </div>
                        <div style="font-size:0.7rem;color:#6b7280;margin-top:4px;">Залиш порожнім щоб не змінювати поточний ключ</div>
                    </div>

                    <label style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;cursor:pointer;">
                        <input type="checkbox" id="globalAiEnabled" ${s.globalAiEnabled !== false ? 'checked' : ''} style="width:16px;height:16px;accent-color:#22c55e;">
                        <span style="font-weight:600;">AI увімкнено глобально</span>
                    </label>
                    <div style="margin-bottom:0.75rem;">
                        <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Ліміт/день по замовчуванню (токени)</label>
                        <input type="number" id="globalDailyLimit" value="${s.defaultDailyLimit || ''}" placeholder="Без ліміту" min="0" step="1000"
                            style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom:1rem;">
                        <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Ліміт/місяць по замовчуванню (токени)</label>
                        <input type="number" id="globalMonthlyLimit" value="${s.defaultMonthlyLimit || ''}" placeholder="Без ліміту" min="0" step="10000"
                            style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                    </div>

                    <!-- Налаштування ботів -->
                    <div style="border-top:1px solid #f3f4f6;padding-top:1rem;margin-top:0.5rem;">
                        <div style="font-size:0.78rem;font-weight:700;color:#374151;margin-bottom:0.75rem;">🤖 Глобальні налаштування ботів</div>
                        <div style="margin-bottom:0.75rem;">
                            <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Модель AI для ботів</label>
                            <select id="botModelSelect" style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                                ${[['gpt-4o-mini','GPT-4o mini — рекомендовано'],['gpt-4o','GPT-4o'],['gpt-4.1-mini','GPT-4.1 mini'],['gpt-4.1','GPT-4.1'],['gpt-4.1-nano','GPT-4.1 nano — найдешевший']].map(([v,n]) =>
                                    `<option value="${v}" ${(saSettings.botModel||'gpt-4o-mini')===v?'selected':''}>${n}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div style="margin-bottom:0.75rem;">
                            <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Точність відповіді (0.0 — точно, 1.0 — творчо)</label>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <input type="range" id="botTempRange" min="0" max="1" step="0.05"
                                    value="${saSettings.botTemperature ?? 0.7}"
                                    oninput="document.getElementById('botTempVal').textContent=parseFloat(this.value).toFixed(2);"
                                    style="flex:1;accent-color:#22c55e;">
                                <span id="botTempVal" style="font-size:0.88rem;font-weight:700;color:#22c55e;min-width:32px;">${(saSettings.botTemperature ?? 0.7).toFixed(2)}</span>
                            </div>
                        </div>
                        <div style="margin-bottom:0.75rem;">
                            <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Макс. токени відповіді</label>
                            <input type="number" id="botMaxTokens" value="${saSettings.botMaxTokens || 1500}" min="100" max="8000" step="100"
                                style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                        </div>
                    </div>
                </div>

                <!-- TAB: AGENTS -->
                <div id="aiTab_agents" style="display:none;">
                    <div style="font-size:11px;color:#6b7280;margin-bottom:12px;">
                        Налаштуй промпт і модель для кожного AI агента платформи.<br>
                        Якщо промпт порожній — використовується вбудований дефолт.
                    </div>
                    ${window._renderAgentsTab(saSettings.agents || {})}
                </div>

                <!-- TAB: MODELS -->
                <div id="aiTab_models" style="display:none;">
                    <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                        Редагуй список моделей — зміни одразу видні всім клієнтам без деплою коду.
                    </div>
                    ${renderModelsTab('openai')}
                </div>

            </div>
                <div style="display:flex;gap:0.5rem;padding:1rem 1.5rem 1.5rem;border-top:1px solid #f3f4f6;flex-shrink:0;">
                    <button onclick="document.getElementById('globalAIOverlay').remove()" style="flex:1;padding:0.55rem;border:1px solid #e5e7eb;background:white;border-radius:8px;cursor:pointer;">Скасувати</button>
                    <button onclick="saveGlobalAISettings()" style="flex:2;padding:0.55rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;"><span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Зберегти все</span></button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

window.saveGlobalAISettings = async function() {
    const enabled  = document.getElementById('globalAiEnabled')?.checked ?? true;
    const daily    = parseInt(document.getElementById('globalDailyLimit')?.value) || 0;
    const monthly  = parseInt(document.getElementById('globalMonthlyLimit')?.value) || 0;
    const newKey   = document.getElementById('platformOpenAiKey')?.value?.trim() || '';
    const botModel = document.getElementById('botModelSelect')?.value || 'gpt-4o-mini';
    const botTemperature = parseFloat(document.getElementById('botTempRange')?.value) || 0.7;
    const botMaxTokens = parseInt(document.getElementById('botMaxTokens')?.value) || 1500;

    // Збираємо агентів
    const agents = {};
    Object.keys(DEFAULT_AGENTS).forEach(key => {
        const prompt = document.getElementById(`agent_prompt_${key}`)?.value?.trim() || '';
        const model  = document.getElementById(`agent_model_${key}`)?.value?.trim() || 'gpt-4o-mini';
        agents[key] = { systemPrompt: prompt, model };
    });

    // Зберігаємо input-значення моделей перед збереженням (onchange може не спрацювати)
    const provider = window._currentModelProvider || 'openai';
    const modelInputs = document.querySelectorAll('#modelsList [id^="mId_"], #modelsList input');
    // Синхронізуємо моделі з DOM якщо є відкрита вкладка
    try {
        const rows = document.querySelectorAll('#modelsList > div');
        if (rows.length && window._editingModels && window._currentModelProvider) {
            const prov = window._currentModelProvider;
            if (!window._editingModels[prov]) window._editingModels[prov] = [];
            rows.forEach((row, i) => {
                const inputs = row.querySelectorAll('input');
                if (inputs[0] && inputs[1] && window._editingModels[prov][i]) {
                    window._editingModels[prov][i][0] = inputs[0].value;
                    window._editingModels[prov][i][1] = inputs[1].value;
                }
            });
        }
    } catch(_) {}

    const saveBtn = document.querySelector('#globalAIOverlay button[onclick="saveGlobalAISettings()"]');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Збереження...'; }

    try {
        const batch = firebase.firestore().batch();
        // Загальні налаштування
        batch.set(
            firebase.firestore().collection('settings').doc('ai'),
            { globalAiEnabled: enabled, defaultDailyLimit: daily, defaultMonthlyLimit: monthly },
            { merge: true }
        );
        // Платформний ключ + агенти → superadmin/settings
        const saUpdate = { agents, botModel, botTemperature, botMaxTokens, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (newKey) {
            saUpdate.openaiApiKey = newKey;
            saUpdate.keyUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        batch.set(
            firebase.firestore().collection('settings').doc('platform'),
            saUpdate,
            { merge: true }
        );
        // Моделі — конвертуємо [id,name] → {id,name} бо Firestore не підтримує nested arrays
        if (window._editingModels) {
            const _toFirestore = (data) => {
                const result = {};
                Object.keys(data).forEach(p => {
                    result[p] = (data[p] || []).map(m => Array.isArray(m) ? {id: m[0], name: m[1]} : m);
                });
                return result;
            };
            batch.set(
                firebase.firestore().collection('settings').doc('aiModels'),
                _toFirestore(window._editingModels)
            );
        }
        await batch.commit();
        document.getElementById('globalAIOverlay')?.remove();
        window._cachedAiModels = window._editingModels || null;
        showToast && showToast('Збережено ✓', 'success');
    } catch(e) {
        console.error('[saveGlobalAISettings] error:', e);
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Зберегти все</span>'; }
        const msg = e.code === 'permission-denied'
            ? 'Немає прав для збереження. Переконайся що залогінений як SuperAdmin (management.talco@gmail.com)'
            : 'Помилка: ' + e.message;
        showToast && showToast(msg, 'error');
        if (typeof showToast==='function') showToast(msg, 'success'); else console.log(msg);
    }
};

// ── AI Агенти — дефолтні промпти ────────────────────────
const DEFAULT_AGENTS = {
    statistics: {
        label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Аналіз статистики</span>',
        where:       'Статистика → кнопка AI',
        defaultPrompt: `Ти жорсткий бізнес-аналітик з 10+ роками досвіду в МСБ. Отримуєш метрики компанії і повинен дати власнику конкретну відповідь — що відбувається і що робити прямо зараз.

КОНТЕКСТ: Ти бачиш профіль компанії вище (ніша, мета, ЦКП). Враховуй його при аналізі — рекомендації мають бути специфічними для цієї ніші, не загальними.

ПРАВИЛА:
- Жодної води і загальних фраз типу "важливо приділити увагу"
- Кожна рекомендація = конкретна дія + очікуваний результат у цифрах
- Якщо метрика виконана 100%+ — поясни як утримати і де ризик переростання
- Якщо метрика провалена — назви конкретну причину (не "можливо через...")
- Порівнюй з бенчмарками ніші де можливо

СТРУКТУРА:

ДІАГНОЗ (2-3 речення)
Що зараз відбувається з бізнесом. Тренд вгору/вниз/стагнація.

КРИТИЧНІ ТОЧКИ (топ-2 проблеми)
Яка метрика найбільше шкодить прямо зараз і скільки грошей це коштує.

ДІЇ ПРЯМО ЗАРАЗ
1. [Конкретна дія] → результат: +/- N грн або % через X днів
2. [Конкретна дія] → результат: +/- N грн або % через X днів
3. [Конкретна дія] → результат: +/- N грн або % через X днів

ПРОГНОЗ
Що зміниться через 30 днів якщо впровадити — у конкретних цифрах.

Відповідай українською. Максимум 4 речення на блок. Без вступів і кінцевих фраз.

МОВА: Відповідай ЗАВЖДИ мовою користувача. Якщо пише українською — українською. Англійською — англійською. Російською — російською. Будь-якою іншою — тією ж мовою. Не перемикайся на іншу мову навіть якщо промпт написаний інакше.`,
    },
    incidents: {
        label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Журнал збоїв</span>',
        where:       'Контроль → Збої → AI режим',
        defaultPrompt: `Ти аналітик операційних збоїв малого бізнесу. Твоя задача — не просто зафіксувати інцидент, а знайти системну причину і дати рішення щоб це не повторилось.

КОНТЕКСТ: Ти бачиш профіль компанії вище. Враховуй специфіку ніші — збої в медицині, beauty, будівництві і клінінгу мають різну природу.

РЕЖИМ: Якщо власник описує збій нечітко — задай максимум 2 уточнюючих питання, потім аналіз. Якщо даних достатньо — одразу до структури.

СТРУКТУРА:

ЩО СТАЛОСЯ (1 речення — суть без деталей)

СИСТЕМНА ПРИЧИНА
Не симптом, а корінь. Де відсутній контроль, стандарт або відповідальна особа?

ЦІНА ЗБОЮ
Скільки коштував: час + гроші + репутація. Оцінка в цифрах.

РІШЕННЯ (щоб не повторилось)
Який конкретний регламент/перевірку/правило додати в систему.

ПРІОРИТЕТ
Критично (сьогодні) / Важливо (цього тижня) / Планово (цього місяця)

Потім JSON для збереження:
{"title":"...","category":"process|people|client|finance|technical","severity":"critical|high|medium|low","responsible":"...","description":"...","failedProcess":"...","cause":"...","consequences":"...","toChange":"..."}

Українська мова. Коротко і по-діловому.

МОВА: Відповідай ЗАВЖДИ мовою користувача. Якщо пише українською — українською. Англійською — англійською. Російською — російською. Будь-якою іншою — тією ж мовою. Не перемикайся на іншу мову навіть якщо промпт написаний інакше.`,
    },
    finance: {
        label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінансовий аналіз</span>',
        where:       'Фінанси → AI чат',
        defaultPrompt: `Ти фінансовий директор на аутсорсі для малого бізнесу. Перетворюєш цифри на управлінські рішення. Знаєш бенчмарки маржинальності по нішах.

КОНТЕКСТ: Ти бачиш профіль компанії вище (ніша, регіон, валюта, мета). Це критично для оцінки норм.

БЕНЧМАРКИ ЧИСТОЇ МАРЖІ (орієнтири для МСБ):
- Beauty / салони: 20-35%
- Медицина / стоматологія: 25-40%
- Будівництво / ремонти: 12-22%
- Меблевий бізнес: 18-30%
- Клінінг: 15-25%
- Консалтинг / послуги: 35-55%

ПРАВИЛА:
- Завжди порівнюй маржу з бенчмарком ніші — назви відхилення у %
- Якщо маржа нижче норми — знайди де "витікають" гроші (конкретна категорія)
- Якщо в нормі — покажи як підняти ще на 3-5% без збільшення виручки
- Числовий прогноз обов'язковий: "якщо скоротити X на Y% → +Z грн/міс"
- Виявляй сезонність і аномалії в динаміці

СТРУКТУРА:

ФІНАНСОВИЙ СТАН (2 речення)
Маржа X% — це [вище/нижче/в нормі] для ніші (норма Y-Z%). Тренд: росте/падає/стабільно.

ГОЛОВНА ПРОБЛЕМА АБО МОЖЛИВІСТЬ
Де найбільше грошей витікає або де можна заробити більше без додаткових витрат.

3 КОНКРЕТНІ ДІЇ
1. [що зробити] → +/- [сума] грн на місяць
2. [що зробити] → +/- [сума] грн на місяць
3. [що зробити] → +/- [сума] грн на місяць

ПРОГНОЗ 90 ДНІВ
Якщо впровадити — виручка/прибуток зміниться на X грн/%.

Відповідай українською. Без вступів. Якщо питають — відповідай прямо.

МОВА: Відповідай ЗАВЖДИ мовою користувача. Якщо пише українською — українською. Англійською — англійською. Російською — російською. Будь-якою іншою — тією ж мовою. Не перемикайся на іншу мову навіть якщо промпт написаний інакше.`,
    },
    coordination: {
        label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Координація</span>',
        where:       'Координація → AI аналіз патернів',
        defaultPrompt: `Ти операційний директор на аутсорсі. Аналізуєш ефективність управлінських зустрічей і виявляєш де система дає збій.

КОНТЕКСТ: Ти бачиш профіль компанії вище. Враховуй розмір команди і нішу — для команди з 5 осіб і для 20 осіб норми різні.

ЩО АНАЛІЗУЄШ:
- Повторювані рішення → немає регламенту або не виконується
- Питання без виконавця → нечітка відповідальність
- Хронічно незакриті задачі → неправильне делегування або перевантаження
- Частота і тривалість → чи є сенс у такій кількості зустрічей

СТРУКТУРА:

ДІАГНОЗ УПРАВЛІННЯ (2 речення)
Загальна оцінка: як зараз функціонує система координації.

СИСТЕМНІ ПАТЕРНИ (топ-3 проблеми)
Що повторюється і чому це симптом системної проблеми, а не разового збою.

ВТРАТИ У ЦИФРАХ
Скільки годин/тиждень команда витрачає неефективно. У грошах: X осіб × Y годин × Z грн/год = сума.

3 КОНКРЕТНІ ЗМІНИ
1. [що змінити в системі] → -X годин/тиждень або +Y% виконання задач
2. [що змінити] → [результат]
3. [що змінити] → [результат]

ПРІОРИТЕТ №1
Одна найважливіша зміна яку зробити цього тижня.

Українська мова. Коротко. Власник хоче рішення — не опис проблеми.

МОВА: Відповідай ЗАВЖДИ мовою користувача. Якщо пише українською — українською. Англійською — англійською. Російською — російською. Будь-якою іншою — тією ж мовою. Не перемикайся на іншу мову навіть якщо промпт написаний інакше.`,
    },
};

// ── Рендер вкладки Агенти ───────────────────────────────
window._renderAgentsTab = function(savedAgents) {
    const cards = Object.entries(DEFAULT_AGENTS).map(([key, agent]) => {
        const saved  = savedAgents[key] || {};
        const prompt = saved.systemPrompt || '';
        const model  = saved.model || 'gpt-4o-mini';
        const hasPrompt = !!prompt;
        return `
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:1rem;display:flex;flex-direction:column;gap:0.5rem;background:${hasPrompt?'white':'#fafafa'};">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;">
                <div>
                    <div style="font-weight:700;font-size:0.88rem;margin-bottom:2px;">${agent.label}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="vertical-align:-1px;margin-right:2px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${agent.where}
                    </div>
                </div>
                <span style="font-size:0.68rem;padding:2px 8px;border-radius:20px;white-space:nowrap;
                    background:${hasPrompt?'#f0fdf4':'#f3f4f6'};
                    color:${hasPrompt?'#16a34a':'#9ca3af'};
                    border:1px solid ${hasPrompt?'#bbf7d0':'#e5e7eb'};">
                    ${hasPrompt?'✓ Налаштовано':'Дефолт з коду'}
                </span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
                <label style="font-size:0.72rem;font-weight:600;color:#374151;white-space:nowrap;">Модель:</label>
                <input id="agent_model_${key}" value="${model}" placeholder="gpt-4o-mini"
                    style="flex:1;padding:4px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.78rem;font-family:monospace;max-width:200px;">
            </div>
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <label style="font-size:0.72rem;font-weight:600;color:#374151;">Системний промпт:</label>
                    <div style="display:flex;gap:6px;align-items:center;">
                        ${hasPrompt ? `<button onclick="document.getElementById('agent_prompt_${key}').value='';window._saveModuleInline && window._saveModuleInline()" style="font-size:0.68rem;color:#ef4444;background:none;border:none;cursor:pointer;">✕ Очистити</button>` : ''}
                        <button onclick="window._resetAgentPrompt('${key}')"
                            style="font-size:0.68rem;color:#6366f1;background:#f0f0ff;border:1px solid #e0e0ff;border-radius:5px;padding:2px 8px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg> Дефолт
                        </button>
                    </div>
                </div>
                <textarea id="agent_prompt_${key}" rows="12"
                    placeholder="Порожньо = використовується вбудований дефолт з коду..."
                    style="width:100%;padding:8px 10px;border:1px solid ${hasPrompt?'#6366f1':'#e5e7eb'};border-radius:8px;font-size:0.78rem;line-height:1.55;resize:vertical;box-sizing:border-box;font-family:inherit;transition:border-color .2s;"
                    onfocus="this.style.borderColor='#6366f1'"
                    onblur="this.style.borderColor=this.value?'#6366f1':'#e5e7eb'"
                    >${prompt}</textarea>
                <div style="font-size:0.68rem;color:#9ca3af;margin-top:3px;">
                    Рядків: <span id="agent_lines_${key}">${prompt ? prompt.split('\n').length : 0}</span> · 
                    Символів: <span id="agent_chars_${key}">${prompt.length}</span>
                    <script>document.getElementById('agent_prompt_${key}').addEventListener('input',function(){document.getElementById('agent_lines_${key}').textContent=this.value.split('\\n').length;document.getElementById('agent_chars_${key}').textContent=this.value.length;});<\/script>
                </div>
            </div>
        </div>`;
    }).join('');

    return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">${cards}</div>`;
};

window._resetAgentPrompt = function(key) {
    const el = document.getElementById(`agent_prompt_${key}`);
    if (el) {
        el.value = DEFAULT_AGENTS[key]?.defaultPrompt || '';
        showToast && showToast('Промпт відновлено', 'success');
    }
};

// ── Перемикання табів ────────────────────────────────────
window._switchAiTab = function(tab) {
    ['general', 'agents', 'models'].forEach(t => {
        const btn = document.getElementById(`aiTabBtn_${t}`);
        const panel = document.getElementById(`aiTab_${t}`);
        const active = t === tab;
        if (btn) {
            btn.style.background = active ? 'white' : 'transparent';
            btn.style.color = active ? '#111' : '#6b7280';
            btn.style.boxShadow = active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
        }
        if (panel) panel.style.display = active ? '' : 'none';
    });
};

window.clearPlatformKey = async function() {
    const _delOk = window.showConfirmModal
        ? await showConfirmModal('Видалити платформний OpenAI ключ?\nКомпанії без власного ключа втратять доступ до AI.',{danger:true})
        : confirm('Видалити платформний OpenAI ключ?');
    if (!_delOk) return;
    try {
        await firebase.firestore().collection('settings').doc('platform').update({
            openaiApiKey: firebase.firestore.FieldValue.delete(),
        });
        showToast && showToast('Ключ видалено', 'success');
        document.getElementById('globalAIOverlay')?.remove();
    } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
};

// ── TAB: ПІДПИСКИ ────────────────────────────────────────────
function _saRenderSubscriptions(pc) {
    const now = new Date();

    const rows = pc.map(c => {
        const data   = c.data || {};
        const subEnd = data.subscriptionEnd?.toDate ? data.subscriptionEnd.toDate() : null;
        const plan   = data.subscriptionPlan || '—';

        // Дата реєстрації компанії
        let regStr = '—';
        if (c.createdAt) {
            const reg = new Date(c.createdAt);
            regStr = `${String(reg.getDate()).padStart(2,'0')}.${String(reg.getMonth()+1).padStart(2,'0')}.${reg.getFullYear()}`;
        } else if (data.createdAt?.toDate) {
            const reg = data.createdAt.toDate();
            regStr = `${String(reg.getDate()).padStart(2,'0')}.${String(reg.getMonth()+1).padStart(2,'0')}.${reg.getFullYear()}`;
        }

        // Owner — з масиву users
        const ownerUser     = (c.users || []).find(u => u.role === 'owner');
        const ownerEmail    = ownerUser?.email || '';
        const ownerPhone    = ownerUser?.phone || '';
        const ownerName     = ownerUser?.name  || ownerUser?.email || '';

        const ownerEmailSafe = _saEsc(ownerEmail);
        const ownerNameSafe  = _saEsc(ownerName);
        const ownerPhoneSafe = _saEsc(ownerPhone);
        const ownerTgSafe    = _saEsc(ownerUser?.telegram || ownerUser?.telegramUsername || '');

        // Контакти власника в таблиці
        const contactCell = `
            ${ownerEmail ? `<div style="font-size:0.78rem;color:#111;">${ownerEmailSafe}</div>` : '<div style="font-size:0.75rem;color:#9ca3af;">—</div>'}
            ${ownerPhone ? `<div style="font-size:0.73rem;color:#6b7280;margin-top:1px;">${ownerPhoneSafe}</div>` : ''}`;

        // Статус підписки
        let statusBadge = `<span style="background:#f3f4f6;color:#6b7280;padding:2px 7px;border-radius:10px;font-size:0.71rem;">без підписки</span>`;
        let dateStr = '<span style="color:#9ca3af;font-size:0.75rem;">—</span>';

        if (subEnd) {
            const daysLeft = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));
            dateStr = `${String(subEnd.getDate()).padStart(2,'0')}.${String(subEnd.getMonth()+1).padStart(2,'0')}.${subEnd.getFullYear()}`;
            if (daysLeft > 30)     statusBadge = `<span style="background:#dcfce7;color:#16a34a;padding:2px 7px;border-radius:10px;font-size:0.71rem;font-weight:700;">✓ активна</span>`;
            else if (daysLeft > 7) statusBadge = `<span style="background:#fef9c3;color:#b45309;padding:2px 7px;border-radius:10px;font-size:0.71rem;font-weight:700;">⚠ ${daysLeft}д</span>`;
            else if (daysLeft > 0) statusBadge = `<span style="background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:10px;font-size:0.71rem;font-weight:700;">🔴 ${daysLeft}д</span>`;
            else                   statusBadge = `<span style="background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:10px;font-size:0.71rem;font-weight:700;">✗ прострочена</span>`;
        }

        return `<tr onclick="saOpenSubModal('${_saEsc(c.id)}','${_saEsc(data.name||c.id)}','${ownerEmailSafe}','${ownerNameSafe}','${ownerPhoneSafe}','${ownerTgSafe}')"
            style="cursor:pointer;border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
            <td style="padding:0.6rem 0.75rem;">
                <div style="font-size:0.82rem;font-weight:600;color:#111;">${_saEsc(data.name||c.id)}</div>
                <div style="font-size:0.7rem;color:#9ca3af;margin-top:1px;">${plan}</div>
            </td>
            <td style="padding:0.6rem 0.75rem;font-size:0.78rem;color:#6b7280;white-space:nowrap;">${regStr}</td>
            <td style="padding:0.6rem 0.75rem;">${contactCell}</td>
            <td style="padding:0.6rem 0.75rem;font-size:0.78rem;color:#374151;white-space:nowrap;">${dateStr}</td>
            <td style="padding:0.6rem 0.75rem;">${statusBadge}</td>
        </tr>`;
    }).join('');

    return `
<div style="overflow-x:auto;">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
    <div style="font-size:0.85rem;font-weight:700;color:#374151;">Управління підписками (${pc.length} компаній)</div>
    <div style="font-size:0.75rem;color:#9ca3af;">Клікни на рядок → редагувати</div>
</div>
<table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
    <thead>
        <tr style="background:#f8fafc;border-bottom:1px solid #e5e7eb;">
            <th style="padding:0.6rem 0.75rem;text-align:left;font-size:0.71rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Компанія / план</th>
            <th style="padding:0.6rem 0.75rem;text-align:left;font-size:0.71rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;">Дата реєстрації</th>
            <th style="padding:0.6rem 0.75rem;text-align:left;font-size:0.71rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Власник (email / тел)</th>
            <th style="padding:0.6rem 0.75rem;text-align:left;font-size:0.71rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;">До дати</th>
            <th style="padding:0.6rem 0.75rem;text-align:left;font-size:0.71rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Статус</th>
        </tr>
    </thead>
    <tbody>${rows}</tbody>
</table>
</div>`;
}

// ── МОДАЛКА ПІДПИСКИ ─────────────────────────────────────────
window.saOpenSubModal = async function(companyId, companyName, ownerEmail, ownerName, ownerPhone, ownerTg) {
    let subEnd = null, plan = 'basic';

    // Показуємо модалку одразу зі скелетоном, потім підвантажуємо
    document.getElementById('saSubModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'saSubModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(2px);';

    const renderModal = (subEnd, plan, ownerEmail, ownerName, ownerPhone, ownerTg) => {
        const toInputDate = (dt) => {
            if (!dt) return '';
            return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
        };

        // Блок контактів власника
        const contactItems = [];
        if (ownerEmail) contactItems.push(`
            <div style="display:flex;align-items:center;gap:8px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href="mailto:${ownerEmail}" style="font-size:0.82rem;color:#2563eb;text-decoration:none;">${ownerEmail}</a>
            </div>`);
        if (ownerPhone) contactItems.push(`
            <div style="display:flex;align-items:center;gap:8px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.18 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <a href="tel:${ownerPhone}" style="font-size:0.82rem;color:#2563eb;text-decoration:none;">${ownerPhone}</a>
            </div>`);
        if (ownerTg) contactItems.push(`
            <div style="display:flex;align-items:center;gap:8px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#6b7280"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>
                <a href="https://t.me/${ownerTg.replace('@','')}" target="_blank" style="font-size:0.82rem;color:#2563eb;text-decoration:none;">${ownerTg.startsWith('@')?ownerTg:'@'+ownerTg}</a>
            </div>`);

        const ownerBlock = (ownerName || ownerEmail) ? `
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:0.85rem 1rem;margin-bottom:1rem;">
            <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">Власник</div>
            ${ownerName ? `<div style="font-size:0.88rem;font-weight:700;color:#111;margin-bottom:0.4rem;">${ownerName}</div>` : ''}
            <div style="display:flex;flex-direction:column;gap:0.3rem;">
                ${contactItems.join('') || '<span style="font-size:0.78rem;color:#9ca3af;">контакти не вказані</span>'}
            </div>
        </div>` : '';

        return `
        <div style="background:white;border-radius:16px;padding:1.75rem;width:90%;max-width:420px;box-shadow:0 20px 50px rgba(0,0,0,0.3);max-height:90vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
                <div>
                    <div style="font-size:1rem;font-weight:800;color:#111;">Підписка</div>
                    <div style="font-size:0.78rem;color:#6b7280;margin-top:2px;">${_saEsc(companyName)}</div>
                </div>
                <button onclick="document.getElementById('saSubModal').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;line-height:1;padding:4px;">✕</button>
            </div>

            ${ownerBlock}

            <div style="display:grid;gap:0.75rem;margin-bottom:1rem;">
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">План</label>
                    <select id="saSubPlan" style="width:100%;padding:0.5rem 0.75rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:0.85rem;outline:none;">
                        <option value="trial" ${plan==='trial'?'selected':''}>Trial</option>
                        <option value="basic" ${plan==='basic'?'selected':''}>Basic</option>
                        <option value="pro"   ${plan==='pro'?'selected':''}>Pro</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Дата закінчення</label>
                    <input id="saSubEndDate" type="date" value="${toInputDate(subEnd)}"
                        style="width:100%;padding:0.5rem 0.75rem;border:1.5px solid #d1d5db;border-radius:8px;font-size:0.85rem;outline:none;box-sizing:border-box;">
                </div>
            </div>

            <div style="display:flex;gap:0.4rem;margin-bottom:1rem;flex-wrap:wrap;">
                <button onclick="saSubAddDays('${companyId}',30)"  style="flex:1;min-width:60px;padding:0.5rem;background:#eff6ff;color:#1d4ed8;border:1.5px solid #bfdbfe;border-radius:8px;font-size:0.78rem;font-weight:700;cursor:pointer;">+30д</button>
                <button onclick="saSubAddDays('${companyId}',90)"  style="flex:1;min-width:60px;padding:0.5rem;background:#f0fdf4;color:#15803d;border:1.5px solid #bbf7d0;border-radius:8px;font-size:0.78rem;font-weight:700;cursor:pointer;">+90д</button>
                <button onclick="saSubAddDays('${companyId}',365)" style="flex:1;min-width:60px;padding:0.5rem;background:#faf5ff;color:#7c3aed;border:1.5px solid #ddd6fe;border-radius:8px;font-size:0.78rem;font-weight:700;cursor:pointer;">+365д</button>
                <button onclick="saSubSetForever('${companyId}')"  style="flex:1;min-width:60px;padding:0.5rem;background:#fefce8;color:#a16207;border:1.5px solid #fde68a;border-radius:8px;font-size:0.78rem;font-weight:700;cursor:pointer;">∞ Вічна</button>
            </div>

            <button onclick="saSubSave('${companyId}')"
                style="width:100%;padding:0.7rem;background:#111;color:white;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;">
                Зберегти
            </button>
        </div>`;
    };

    // Показуємо з даними що вже є (з таблиці), потім підтягуємо свіжі з Firestore
    modal.innerHTML = renderModal(null, 'basic', ownerEmail, ownerName, ownerPhone, ownerTg);
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    // Підвантажуємо актуальні дані підписки
    try {
        const doc = await window.db.collection('companies').doc(companyId).get();
        const d = doc.data() || {};
        subEnd = d.subscriptionEnd?.toDate ? d.subscriptionEnd.toDate() : null;
        plan   = d.subscriptionPlan || 'basic';

        // Якщо власник не знайдений через pc (дані могли бути неповні) — підтягуємо з Firestore
        let fOwnerEmail = ownerEmail, fOwnerName = ownerName, fOwnerPhone = ownerPhone, fOwnerTg = ownerTg;
        if (!fOwnerEmail && d.ownerId) {
            try {
                const ownerDoc = await window.db.collection('companies').doc(companyId).collection('users').doc(d.ownerId).get();
                if (ownerDoc.exists) {
                    const od = ownerDoc.data();
                    fOwnerEmail = od.email || '';
                    fOwnerName  = od.name  || od.email || '';
                    fOwnerPhone = od.phone || '';
                    fOwnerTg    = od.telegram || od.telegramUsername || '';
                }
            } catch(e2) {}
        }

        // Перерендерюємо модалку зі свіжими даними
        const inner = modal.querySelector('div');
        if (inner) inner.outerHTML = renderModal(subEnd, plan, fOwnerEmail, fOwnerName, fOwnerPhone, fOwnerTg);
    } catch(e) { console.warn('[SA Sub]', e.message); }
};

window.saSubAddDays = function(companyId, days) {
    const input = document.getElementById('saSubEndDate');
    if (!input) return;
    const current = input.value ? new Date(input.value + 'T00:00:00') : new Date();
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth()+1).padStart(2,'0');
    const d = String(current.getDate()).padStart(2,'0');
    input.value = `${y}-${m}-${d}`;
};

window.saSubSetForever = function(companyId) {
    const input = document.getElementById('saSubEndDate');
    if (!input) return;
    input.value = '2099-12-31';
};

window.saSubSave = async function(companyId) {
    const plan    = document.getElementById('saSubPlan')?.value || 'basic';
    const dateVal = document.getElementById('saSubEndDate')?.value;

    if (!dateVal) {
        if (typeof showToast === 'function') showToast('Вкажіть дату закінчення', 'error');
        return;
    }

    try {
        const endDate = new Date(dateVal + 'T23:59:59');
        const now = new Date();
        const isActive = endDate > now;

        await window.db.collection('companies').doc(companyId).update({
            subscriptionEnd:    firebase.firestore.Timestamp.fromDate(endDate),
            subscriptionPlan:   plan,
            subscriptionStatus: isActive ? 'active' : 'expired',
        });

        document.getElementById('saSubModal')?.remove();
        if (typeof showToast === 'function') showToast('Підписку збережено ✓', 'success');
        // Оновлюємо панель
        if (typeof loadSuperadminData === 'function') loadSuperadminData();
    } catch(e) {
        if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
    }
};
