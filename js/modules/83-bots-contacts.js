// ============================================================
// TALKO Bots Platform v2.0
// Структура: Company <i data-lucide="arrow-right" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> Bots <i data-lucide="arrow-right" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> Flows (ланцюги)
// Модулі: Ланцюги, Контакти, Чат, Розсилка, Налаштування
// ============================================================
(function () {
'use strict';

// ── State ──────────────────────────────────────────────────
let bp = {
    bots: [],           // [{id, name, channel, token, connected, ...}]
    activeBotId: null,  // поточний бот
    flows: [],          // flows поточного бота
    contacts: [],
    subTab: 'bots',     // bots | flows | contacts | chat | broadcast | settings
    botsUnsub: null,
    flowsUnsub: null,
    activeChatContactId: null,
    chatUnsub: null,
    contactsFilter: 'all',
};

// ── Init ───────────────────────────────────────────────────
window.initBotsModule = async function () {
    if (!window.currentCompanyId) return;
    // Guard: не перемальовувати shell якщо вже ініціалізовано для цієї компанії
    if (bp._initializedFor === window.currentCompanyId) {
        if (bp.subTab === 'bots') renderBotsTab();
        return;
    }
    bp._initializedFor = window.currentCompanyId;
    renderShell();
    loadBots();
};

window.destroyBotsModule = function() {
    // CRASH FIX: typeof guard недостатньо — onSnapshot може повертати не-функцію.
    // Централізований safe-unsub щоб один зламаний listener не крашив весь logout.
    const _safeUnsub = (fn, name) => {
        if (!fn) return null;
        try { if (typeof fn === 'function') fn(); }
        catch(e) { console.warn('[destroyBots] unsub error:', name, e.message); }
        return null;
    };
    bp.botsUnsub       = _safeUnsub(bp.botsUnsub,       'botsUnsub');
    bp.flowsUnsub      = _safeUnsub(bp.flowsUnsub,      'flowsUnsub');
    bp.chatUnsub       = _safeUnsub(bp.chatUnsub,       'chatUnsub');
    chat.msgsUnsub     = _safeUnsub(chat.msgsUnsub,     'msgsUnsub');
    chat.contactsUnsub = _safeUnsub(chat.contactsUnsub, 'contactsUnsub');
    cts.unsub          = _safeUnsub(cts.unsub,          'cts.unsub');
    // FIX 3: clear pending search timers
    clearTimeout(_ctsSearchTimer);
    clearTimeout(_chatSearchTimer);
    // FIX 5: reset broadcast state so UI doesn't get stuck
    bcast.running   = false;
    bcast.cancelled = true;
    // Скидаємо guard для re-init при наступному login
    bp._initializedFor      = null;
    bp.activeBotId          = null;
    bp.bots                 = [];
    bp.contacts             = [];
    bp.flows                = [];
    bp.subTab               = 'bots';
    bp.activeChatContactId  = null;
    bp.contactsFilter       = 'all';
    // chat state
    chat.contacts           = [];
    chat.activeId           = null;
    chat.lastContactDoc     = null;
    chat.hasMoreContacts    = false;
    chat.search             = '';
    chat.sendingBotToken    = null;
    // cleanup всіх multi-instance listeners (crm, тощо)
    Object.keys(chat.instances || {}).forEach(id => {
        const inst = chat.instances[id];
        if (inst) _safeUnsub(inst.msgsUnsub, `msgsUnsub_${id}`);
    });
    chat.instances          = {};
    // cts state
    cts.items               = [];
    cts.lastDoc             = null;
    cts.hasMore             = false;
    cts.loading             = false;
    cts.total               = 0;
    cts.search              = '';
    cts.botId               = '';
    cts.flowId              = '';
    cts.dateFrom            = '';
    cts.dateTo              = '';
    cts.activeContactId     = null;
    // bcast counters
    bcast.sent              = 0;
    bcast.failed            = 0;
    bcast.total             = 0;
    // Chain: знищити listener з 81-bots-flows.js (IIFE closure)
    if (typeof window._destroyBotsFlows81 === 'function') window._destroyBotsFlows81();
};

function loadBots() {
    if (typeof bp.botsUnsub === 'function') bp.botsUnsub();
    bp.botsUnsub = null;
    const ref = window.companyRef();
    if (!ref) return;
    bp.botsUnsub = ref
        .collection('bots')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
            bp.bots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (bp.subTab === 'bots') renderBotsTab();
            if (bp.activeBotId && bp.subTab === 'flows') renderFlowsTab();
        }, err => console.error('[bots] bots listener:', err.message));
}

// ── Shell ──────────────────────────────────────────────────
function lcIcons(el) {
    if (window.lucide) {
        try { lucide.createIcons({ nameAttr: 'data-lucide', attrs: { 'stroke-width': 2 }, nodes: el ? [el] : undefined }); } catch(e) { console.error('[83-bots-contacts]', e.message); }
    }
}

function renderShell() {
    const container = document.getElementById('botsContainer');
    if (!container) return;

    container.innerHTML = `
        <div style="padding:0.75rem;">
            <!-- Tab bar -->
            <div id="bpTabBar" style="display:flex;gap:0.3rem;margin-bottom:0.75rem;background:white;
                border-radius:12px;padding:0.3rem;box-shadow:var(--shadow);overflow-x:auto;flex-shrink:0;">
            </div>
            <!-- Views -->
            <div id="bpViewBots"></div>
            <div id="bpViewFlows" style="display:none;"></div>
            <div id="bpViewContacts" style="display:none;"></div>
            <div id="bpViewChat" style="display:none;"></div>
            <div id="bpViewBroadcast" style="display:none;"></div>
            <div id="bpViewSettings" style="display:none;"></div>
        </div>`;
    lcIcons(container);

    renderTabBar(['bots']);
    renderBotsTab();
}

function renderTabBar(visibleTabs) {
    const bar = document.getElementById('bpTabBar');
    if (!bar) return;
    const all = [
        ['bots',      '<i data-lucide="bot" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>', window.t('botsBots')],
        ['flows',     '<i data-lucide="link" style="width:15px;height:15px;display:inline-block;vertical-align:middle;"></i>',  window.t('botsFlows')],
        ['contacts',  '<i data-lucide="users" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>', window.t('botsContacts')],
        ['chat',      '<i data-lucide="message-square" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>', window.t('botsChat')],
        ['broadcast', '<i data-lucide="send" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>', window.t('botsBroadcast')],
        ['settings',  '<i data-lucide="settings" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i>',  window.t('crmTabSettings')],
    ];
    bar.innerHTML = all.filter(([id]) => visibleTabs.includes(id)).map(([id, icon, label]) => `
        <button id="bpTab_${id}" onclick="bpSwitch('${id}')"
            style="flex:1;min-width:60px;padding:0.4rem 0.5rem;border:none;border-radius:8px;
            cursor:pointer;font-size:0.75rem;font-weight:600;white-space:nowrap;
            background:${id===bp.subTab?'#22c55e':'transparent'};
            color:${id===bp.subTab?'white':'#525252'};transition:all 0.2s;">
            ${icon} ${label}
        </button>`).join('');
}

window.bpSwitch = function(tab) {
    bp.subTab = tab;
    const all = ['bots','flows','contacts','chat','broadcast','settings'];
    all.forEach(t => {
        const btn = document.getElementById(`bpTab_${t}`);
        const view = document.getElementById(`bpView${t.charAt(0).toUpperCase()+t.slice(1)}`);
        if (btn) { btn.style.background = t===tab?'#22c55e':'transparent'; btn.style.color = t===tab?'white':'#525252'; }
        if (view) view.style.display = t===tab?'':'none';
    });
    if (tab==='bots')      renderBotsTab();
    if (tab==='flows')     renderFlowsTab();
    if (tab==='contacts')  renderContactsTab();
    if (tab==='chat')      renderChatTab();
    if (tab==='broadcast') renderBroadcastTab();
    if (tab==='settings')  renderSettingsTab();
};

// ══════════════════════════════════════════════════════════
// 1. БОТИ — список всіх ботів компанії
// ══════════════════════════════════════════════════════════
function renderBotsTab() {
    const c = document.getElementById('bpViewBots');
    if (!c) return;

    const channelColors = { telegram:'#3b82f6', instagram:'#e1306c', whatsapp:'#25d366', web:'#6366f1' };
    const channelIcons  = { telegram:'<i data-lucide="send" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>', instagram:'<i data-lucide="camera" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>', whatsapp:'<i data-lucide="message-square" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>', web:'<i data-lucide="globe" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i>' };

    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <div>
                <div style="font-weight:700;font-size:1rem;">Мої боти</div>
                <div style="font-size:0.74rem;color:#6b7280;">${bp.bots.length} ботів</div>
            </div>
            <button onclick="openCreateBotModal()"
                style="padding:0.5rem 1rem;background:#22c55e;color:white;border:none;
                border-radius:10px;cursor:pointer;font-weight:600;font-size:0.84rem;">
                + Новий бот
            </button>
        </div>

        ${bp.bots.length === 0 ? `
        <div style="text-align:center;padding:3rem;background:white;border-radius:16px;box-shadow:var(--shadow);">
            <div style="font-size:3rem;margin-bottom:0.75rem;"><i data-lucide="bot" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i></div>
            <div style="font-weight:700;font-size:1rem;margin-bottom:0.4rem;">Ботів поки немає</div>
            <div style="font-size:0.84rem;color:#6b7280;margin-bottom:1.25rem;">
                Підключіть Telegram бота або інший канал<br>і створіть перший ланцюг сценарію
            </div>
            <button onclick="openCreateBotModal()"
                style="padding:0.65rem 1.5rem;background:#22c55e;color:white;border:none;
                border-radius:10px;cursor:pointer;font-weight:600;">
                + Підключити бота
            </button>
        </div>` : `
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
            ${bp.bots.map(bot => {
                const color = channelColors[bot.channel] || '#6b7280';
                const icon = channelIcons[bot.channel] || '<i data-lucide="bot" style="width:15px;height:15px;display:inline-block;vertical-align:middle;"></i>';
                const statusDot = bot.connected
                    ? '<span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block;flex-shrink:0;"></span>'
                    : '<span style="width:7px;height:7px;border-radius:50%;background:#ef4444;display:inline-block;flex-shrink:0;"></span>';
                return `
                <div style="background:white;border-radius:12px;padding:0.55rem 0.75rem;
                    box-shadow:0 1px 3px rgba(0,0,0,0.07);border:1px solid #f1f5f9;
                    border-left:3px solid ${bot.connected?color:'#e5e7eb'};
                    display:flex;align-items:center;gap:0.6rem;cursor:pointer;
                    transition:background 0.15s;"
                    onmouseenter="this.style.background='#f8fafc'"
                    onmouseleave="this.style.background='white'"
                    onclick="openBot('${bot.id}')">

                    <!-- Іконка каналу -->
                    <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;
                        background:${color}15;display:flex;align-items:center;justify-content:center;">
                        ${icon}
                    </div>

                    <!-- Основна інфо -->
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:5px;">
                            ${statusDot}
                            <span style="font-weight:700;font-size:0.88rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                ${escH(bot.name)}
                            </span>
                        </div>
                        <div style="font-size:0.7rem;color:#9ca3af;margin-top:1px;display:flex;align-items:center;gap:4px;">
                            <span>@${escH(bot.username||'—')}</span>
                            <span style="color:#e5e7eb;">·</span>
                            <span>${bot.flowCount||0} ланц.</span>
                            <span style="color:#e5e7eb;">·</span>
                            <span>${bot.contactCount||0} конт.</span>
                        </div>
                    </div>

                    <!-- Кнопки дій -->
                    <div style="display:flex;gap:0.25rem;flex-shrink:0;" onclick="event.stopPropagation()">
                        <button onclick="openBot('${bot.id}')"
                            title="Відкрити"
                            style="padding:0.35rem 0.65rem;background:#22c55e;color:white;
                            border:none;border-radius:7px;cursor:pointer;font-size:0.75rem;font-weight:600;
                            display:flex;align-items:center;gap:3px;">
                            Відкрити
                        </button>
                        <button onclick="openBotSettings('${bot.id}')"
                            title="Налаштування"
                            style="width:30px;height:30px;background:#f9fafb;border:1px solid #e5e7eb;
                            border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                            <i data-lucide="settings" style="width:13px;height:13px;"></i>
                        </button>
                        <button onclick="confirmDeleteBot('${bot.id}')"
                            title="Видалити"
                            style="width:30px;height:30px;background:#fff0f0;border:1px solid #fecaca;
                            border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                            <i data-lucide="trash-2" style="width:12px;height:12px;color:#ef4444;"></i>
                        </button>
                    </div>
                </div>`;
            }).join('')}
        </div>`}`;
}

// ── Відкрити бота <i data-lucide="arrow-right" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> показати його ланцюги ─────────────────
window.openBot = function(botId) {
    bp.activeBotId = botId;
    const bot = bp.bots.find(b=>b.id===botId);

    // Показуємо всі таби
    renderTabBar(['bots','flows','contacts','chat','broadcast','settings']);
    bpSwitch('flows');

    // Підписуємось на flows цього бота
    if (typeof bp.flowsUnsub === 'function') bp.flowsUnsub(); bp.flowsUnsub = null;
    const _flowsRef = window.companyRef();
    if (!_flowsRef) return;
    bp.flowsUnsub = _flowsRef
        .collection('bots').doc(botId)
        .collection('flows')
        .orderBy('createdAt','desc')
                .limit(100) // BUG FIX: обмеження флоу
.onSnapshot(snap => {
            bp.flows = snap.docs.map(d=>({id:d.id,...d.data()}));
            if (bp.subTab==='flows') renderFlowsTab();
        }, err => console.error('[bots] flows listener:', err.message));
};

// ══════════════════════════════════════════════════════════
// 2. ЛАНЦЮГИ — список flows поточного бота
// ══════════════════════════════════════════════════════════
function renderFlowsTab() {
    const c = document.getElementById('bpViewFlows');
    if (!c) return;

    const bot = bp.bots.find(b=>b.id===bp.activeBotId);
    const statusColors = { active:'#22c55e', draft:'#9ca3af', paused:'#f97316' };
    const botUsername = bot?.username || '';
    const webhookBase = `${location.origin}/api/webhook?companyId=${window.currentCompanyId}&channel=${bot?.channel||'telegram'}&botId=${bp.activeBotId}&flow=`;

    c.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;
            background:white;border-radius:10px;padding:0.6rem 0.75rem;box-shadow:var(--shadow);">
            <button onclick="bpSwitch('bots')"
                style="background:none;border:none;cursor:pointer;color:#6b7280;font-size:0.82rem;padding:0;display:flex;align-items:center;gap:4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Всі боти
            </button>
            <span style="color:#9ca3af;">›</span>
            <span style="font-weight:700;font-size:0.85rem;color:#374151;">${escH(bot?.name||window.t('botsBot'))}</span>
            <span style="background:${bot?.connected?'#f0fdf4':'#fee2e2'};
                color:${bot?.connected?'#22c55e':'#ef4444'};
                font-size:0.68rem;padding:1px 7px;border-radius:10px;font-weight:600;">
                ${bot?.connected?'● Online':'○ Offline'}
            </span>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
            <div style="font-weight:700;font-size:0.95rem;">Ланцюги бота</div>
            <button onclick="openCreateFlowModal()"
                style="padding:0.42rem 0.85rem;background:#22c55e;color:white;border:none;
                border-radius:9px;cursor:pointer;font-weight:600;font-size:0.8rem;
                display:flex;align-items:center;gap:5px;box-shadow:0 1px 4px #22c55e44;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                Новий ланцюг
            </button>
        </div>

        ${bp.flows.length === 0 ? `
        <div style="text-align:center;padding:2.5rem;background:white;border-radius:14px;box-shadow:var(--shadow);">
            <div style="margin-bottom:0.6rem;color:#9ca3af;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>
            </div>
            <div style="font-weight:600;margin-bottom:0.3rem;">Ланцюгів поки немає</div>
            <div style="font-size:0.82rem;color:#6b7280;margin-bottom:1rem;">Ланцюг — це сценарій діалогу з користувачем</div>
            <button onclick="openCreateFlowModal()"
                style="padding:0.55rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:9px;cursor:pointer;font-weight:600;">
                + Створити ланцюг
            </button>
        </div>` : `
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${bp.flows.map(flow => {
                const deepLink = botUsername
                    ? `https://t.me/${botUsername}?start=${flow.id}`
                    : webhookBase + flow.id;
                const statusLabel = flow.status==='active' ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> active' : flow.status==='paused' ? '⏸ paused' : '⚫ draft';
                const statusBg   = flow.status==='active' ? '#f0fdf4' : flow.status==='paused' ? '#fff7ed' : '#f9fafb';
                const statusCol  = statusColors[flow.status]||'#9ca3af';
                const nodeCount  = flow.nodes?.length||0;
                return `
                <div style="background:white;border-radius:14px;
                    box-shadow:0 2px 8px rgba(0,0,0,0.07);border:1.5px solid #f1f5f9;
                    overflow:hidden;transition:box-shadow 0.18s,border-color 0.18s;"
                    onmouseenter="this.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)';this.style.borderColor='#e2e8f0';"
                    onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.07)';this.style.borderColor='#f1f5f9';">
                    <div style="height:3px;background:linear-gradient(90deg,${statusCol},${statusCol}66);"></div>
                    <div style="padding:0.85rem 1rem;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.6rem;">
                            <div style="flex:1;min-width:0;">
                                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;flex-wrap:wrap;">
                                    <span style="font-weight:700;font-size:0.92rem;color:#111827;">${escH(flow.name)}</span>
                                    <span style="font-size:0.68rem;background:${statusBg};color:${statusCol};
                                        padding:2px 8px;border-radius:20px;font-weight:700;border:1px solid ${statusCol}30;">
                                        ${statusLabel}
                                    </span>
                                </div>
                                <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                                    <span style="font-size:0.73rem;color:#6b7280;display:flex;align-items:center;gap:3px;">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>
                                        <code style="background:#f0fdf4;color:#16a34a;padding:1px 5px;border-radius:4px;font-size:0.72rem;">${escH(flow.triggerKeyword||'/start')}</code>
                                    </span>
                                    <span style="font-size:0.73rem;color:#6b7280;display:flex;align-items:center;gap:3px;">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
                                        ${nodeCount} вузл${nodeCount===1?'':nodeCount<5?'и':'ів'}
                                    </span>
                                    <span style="font-size:0.73rem;color:#6b7280;display:flex;align-items:center;gap:3px;">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                        ${flow.sessionCount||0} сесій
                                    </span>
                                </div>
                                <div style="margin-top:0.5rem;display:flex;align-items:center;gap:0.3rem;">
                                    <div style="font-size:0.69rem;color:#9ca3af;flex:1;overflow:hidden;
                                        text-overflow:ellipsis;white-space:nowrap;background:#f8fafc;
                                        border:1px solid #e5e7eb;border-radius:6px;padding:3px 8px;
                                        display:flex;align-items:center;gap:4px;">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                        ${deepLink}
                                    </div>
                                    <button onclick="copyLink('${deepLink}')"
                                        style="padding:3px 8px;background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe;
                                        border-radius:5px;cursor:pointer;font-size:0.68rem;white-space:nowrap;flex-shrink:0;font-weight:600;"
                                        onmouseenter="this.style.background='#dbeafe'" onmouseleave="this.style.background='#eff6ff'">
                                        Копіювати
                                    </button>
                                    <button onclick="showQR('${encodeURIComponent(deepLink)}')"
                                        style="padding:3px 8px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;
                                        border-radius:5px;cursor:pointer;font-size:0.68rem;flex-shrink:0;font-weight:600;"
                                        onmouseenter="this.style.background='#dcfce7'" onmouseleave="this.style.background='#f0fdf4'">
                                        QR
                                    </button>
                                </div>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:0.3rem;flex-shrink:0;min-width:100px;">
                                <button onclick="editFlow('${flow.id}')"
                                    style="padding:0.42rem 0.75rem;background:#22c55e;color:white;border:none;
                                    border-radius:8px;cursor:pointer;font-size:0.76rem;font-weight:600;
                                    display:flex;align-items:center;justify-content:center;gap:5px;
                                    box-shadow:0 1px 4px #22c55e44;transition:background 0.15s;"
                                    onmouseenter="this.style.background='#16a34a'" onmouseleave="this.style.background='#22c55e'">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    Редагувати
                                </button>
                                <div style="display:flex;gap:0.25rem;">
                                    <button onclick="toggleFlowStatus('${flow.id}','${flow.status}')"
                                        title="${flow.status==='active'?window.t('botsPause'):window.t('botsActivate')}"
                                        style="flex:1;padding:0.4rem 0;
                                        background:${flow.status==='active'?'#fff7ed':'#f0fdf4'};
                                        color:${flow.status==='active'?'#f97316':'#16a34a'};
                                        border:1px solid ${flow.status==='active'?'#fed7aa':'#bbf7d0'};
                                        border-radius:7px;cursor:pointer;
                                        display:flex;align-items:center;justify-content:center;">
                                        ${flow.status==='active'
                                            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
                                            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>'}
                                    </button>
                                    <button onclick="deleteFlow('${flow.id}')"
                                        title=window.t('crmDelete')
                                        style="flex:1;padding:0.4rem 0;background:#fff5f5;color:#ef4444;
                                        border:1px solid #fecaca;border-radius:7px;cursor:pointer;
                                        display:flex;align-items:center;justify-content:center;
                                        transition:background 0.15s;"
                                        onmouseenter="this.style.background='#fee2e2'" onmouseleave="this.style.background='#fff5f5'">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M9,6V4h6v2"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`}`;
    lcIcons(c);
}
// ══════════════════════════════════════════════════════════
// 3. CREATE BOT MODAL
// ══════════════════════════════════════════════════════════
window.openCreateBotModal = function() {
    document.getElementById('bpCreateBot')?.remove();
    document.body.insertAdjacentHTML('beforeend', `
        <div id="bpCreateBot" onclick="if(event.target===this)this.remove()"
            style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10020;
            display:flex;align-items:center;justify-content:center;padding:1rem;">
            <div style="background:white;border-radius:16px;width:100%;max-width:440px;">
                <div style="padding:1.25rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">
                    <div style="font-weight:700;font-size:1rem;">Підключити нового бота</div>
                    <button onclick="document.getElementById('bpCreateBot').remove()"
                        style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;"><i data-lucide="x" style="width:13px;height:13px;display:inline-block;vertical-align:middle;"></i></button>
                </div>
                <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
                    <div>
                        <label style="font-size:0.75rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">КАНАЛ</label>
                        <select id="bpNewBotChannel"
                            onchange="updateBotTokenHint(this.value)"
                            style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;background:white;">
                            <option value="telegram"><i data-lucide="send" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i> Telegram</option>
                            <option value="instagram"><i data-lucide="camera" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i> Instagram</option>
                            <option value="whatsapp"><i data-lucide="message-square" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i> WhatsApp Business</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">НАЗВА БОТА</label>
                        <input id="bpNewBotName" placeholder=window.t('botsTokenExample')
                            style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="font-size:0.75rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;" id="bpTokenLabel">BOT TOKEN (від @BotFather)</label>
                        <input id="bpNewBotToken" placeholder="123456789:AAF..."
                            style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                        <div id="bpTokenHint" style="font-size:0.72rem;color:#6b7280;margin-top:0.3rem;">
                            1. Відкрий @BotFather <i data-lucide="arrow-right" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> /newbot <i data-lucide="arrow-right" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> скопіюй токен
                        </div>
                    </div>
                </div>
                <div style="padding:1rem 1.25rem;border-top:1px solid #f0f0f0;display:flex;gap:0.5rem;justify-content:flex-end;">
                    <button onclick="document.getElementById('bpCreateBot').remove()"
                        style="padding:0.55rem 1rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;">Скасувати</button>
                    <button onclick="createAndConnectBot()"
                        style="padding:0.55rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                        <i data-lucide="check" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> Підключити
                    </button>
                </div>
            </div>
        </div>`);
    document.getElementById('bpNewBotName')?.focus();
};

window.updateBotTokenHint = function(channel) {
    const label = document.getElementById('bpTokenLabel');
    const hint = document.getElementById('bpTokenHint');
    if (channel === 'telegram') {
        if (label) label.textContent = window.t('botsBotTokenLabel');
        if (hint) hint.textContent = '1. Відкрий @BotFather → /newbot → скопіюй токен';
    } else if (channel === 'instagram') {
        if (label) label.textContent = 'PAGE ACCESS TOKEN';
        if (hint) hint.textContent = 'Отримай в Meta Developer Console → Instagram → Page Access Token';
    }
};

window.createAndConnectBot = async function() {
    const name = document.getElementById('bpNewBotName')?.value.trim();
    const token = document.getElementById('bpNewBotToken')?.value.trim();
    const channel = document.getElementById('bpNewBotChannel')?.value || 'telegram';
    if (!name) { if(window.showToast)showToast(window.t('botsEnterName'),'warning'); else alert(window.t('botsEnterName')); return; }
    if (!token) { if(window.showToast)showToast(window.t('botsEnterToken'),'warning'); else alert(window.t('botsEnterToken')); return; }

    const btn = document.querySelector('[onclick="createAndConnectBot()"]');
    if (btn) { btn.disabled = true; btn.textContent = window.t('botsLoading'); }

    try {
        let username = '';
        let connected = false;
        const webhookUrl = `${location.origin}/api/webhook?companyId=${window.currentCompanyId}&channel=${channel}`;

        if (channel === 'telegram') {
            // Verify token + set webhook
            const meRes = await _tgFetch(`https://api.telegram.org/bot${token}/getMe`);
            const meData = await meRes.json();
            if (!meData.ok) throw new Error(window.t('botsInvalidToken') + (meData.description||''));
            username = meData.result.username || '';

            const whRes = await _tgFetch(`https://api.telegram.org/bot${token}/setWebhook`, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message','callback_query'] }),
            });
            const whData = await whRes.json();
            connected = whData.ok;
        } else {
            connected = false; // Manual webhook setup for other channels
        }

        // Save bot to Firestore
        const botRef = await             window.companyRef()
            .collection('bots').add({
                name,
                channel,
                token,
                username,
                webhookUrl,
                connected,
                status: connected ? 'active' : 'draft',
                flowCount: 0,
                contactCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

        // Also save token in integrations for webhook.js compatibility
        await window.companyRef().update({
            [`integrations.${channel}.botToken`]: token,
            [`integrations.${channel}.botName`]: username,
            [`integrations.${channel}.webhookUrl`]: webhookUrl,
            [`integrations.${channel}.connected`]: connected,
        });

        document.getElementById('bpCreateBot')?.remove();
        if (typeof showToast === 'function') showToast(connected ? `<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> Бот @${username} підключено!` : window.t('botsBotCreated'), 'success');
        openBot(botRef.id);
    } catch(e) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Підключити'; }
        if(window.showToast)showToast(window.t('errPrefix')+e.message,'error'); else alert(window.t('errPrefix')+e.message);
    }
};

window.openBotSettings = async function(botId) {
    bp.activeBotId = botId;
    renderTabBar(['bots','flows','contacts','chat','broadcast','settings']);
    bpSwitch('settings');
};

window.confirmDeleteBot = async function(botId) {
    if (!(await (window.showConfirmModal ? showConfirmModal(window.t('botsDeleteBot'),{danger:true}) : Promise.resolve(confirm(window.t('botsDeleteBot')))))) return;
    try {
        await window.companyRef().collection('bots').doc(botId).delete();
        if (typeof showToast === 'function') showToast(window.t('botsBotDeleted'), 'success');
    } catch(e) {
        if(window.showToast) showToast(window.t('errPrefix')+e.message,'error');
        console.error('[confirmDeleteBot]', e);
    }
};

// ══════════════════════════════════════════════════════════
// 4. CREATE FLOW MODAL
// ══════════════════════════════════════════════════════════
window.openCreateFlowModal = function() {
    document.getElementById('bpCreateFlow')?.remove();
    document.body.insertAdjacentHTML('beforeend', `
        <div id="bpCreateFlow" onclick="if(event.target===this)this.remove()"
            style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10020;
            display:flex;align-items:center;justify-content:center;padding:1rem;">
            <div style="background:white;border-radius:16px;width:100%;max-width:400px;">
                <div style="padding:1.25rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;">
                    <div style="font-weight:700;">Новий ланцюг</div>
                    <button onclick="document.getElementById('bpCreateFlow').remove()"
                        style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;"><i data-lucide="x" style="width:13px;height:13px;display:inline-block;vertical-align:middle;"></i></button>
                </div>
                <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.6rem;">
                    <div>
                        <label style="font-size:0.75rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">НАЗВА *</label>
                        <input id="bpFlowName" placeholder=window.t('sitesFormExPh')
                            style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="font-size:0.75rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">ТРИГЕР</label>
                        <input id="bpFlowTrigger" placeholder=window.t('botsStartKeyword')
                            style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                    </div>
                </div>
                <div style="padding:1rem 1.25rem;border-top:1px solid #f0f0f0;display:flex;gap:0.5rem;justify-content:flex-end;">
                    <button onclick="document.getElementById('bpCreateFlow').remove()"
                        style="padding:0.55rem 1rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;">Скасувати</button>
                    <button onclick="saveNewFlow()"
                        style="padding:0.55rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;"><i data-lucide="check" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> Створити</button>
                </div>
            </div>
        </div>`);
    document.getElementById('bpFlowName')?.focus();
};

window.saveNewFlow = async function() {
    const name = document.getElementById('bpFlowName')?.value.trim();
    if (!name) { if(window.showToast)showToast(window.t('enterName2'),'warning'); else alert(window.t('enterName2')); return; }
    const saveBtn = document.querySelector('#bpCreateFlow button[onclick*="saveNewFlow"]');
    if (saveBtn) { saveBtn.disabled = true; }
    const bot = bp.bots.find(b=>b.id===bp.activeBotId);
    try {
        const ref = await             window.companyRef()
            .collection('bots').doc(bp.activeBotId)
            .collection('flows').add({
                name,
                channel: bot?.channel || 'telegram',
                triggerKeyword: document.getElementById('bpFlowTrigger')?.value.trim() || '/start',
                status: 'draft',
                nodes: [],
                sessionCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        // Update bot flowCount
        await window.companyRef()
            .collection('bots').doc(bp.activeBotId)
            .update({ flowCount: firebase.firestore.FieldValue.increment(1) });

        document.getElementById('bpCreateFlow')?.remove();
        if (typeof showToast === 'function') showToast(window.t('botsFlowCreated'), 'success');
        editFlow(ref.id);
    } catch(e) {
        if (saveBtn) { saveBtn.disabled = false; }
        if(window.showToast)showToast(window.t('errPrefix') + e.message,'error'); else alert(window.t('errPrefix') + e.message);
    }
};

window.editFlow = function(flowId) {
    // Pass botId context to canvas
    window._currentBotId = bp.activeBotId;
    openFlowCanvas(flowId, bp.activeBotId);
};

window.toggleFlowStatus = async function(flowId, status) {
    const newStatus = status === 'active' ? 'paused' : 'active';
    try {
        await window.companyRef()
            .collection('bots').doc(bp.activeBotId)
            .collection('flows').doc(flowId)
            .update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof showToast === 'function') showToast(newStatus==='active'?window.t('botsContactActivated'):window.t('botsContactPaused'), 'success');
    } catch(e) { console.error('[toggleFlowStatus]', e); if(window.showToast) showToast(window.t('errPrefix')+e.message,'error'); }
};

window.deleteFlow = async function(flowId) {
    if (!(await (window.showConfirmModal ? showConfirmModal(window.t('botsDeleteFlow'),{danger:true}) : Promise.resolve(confirm(window.t('botsDeleteFlow')))))) return;
    window.companyRef()
        .collection('bots').doc(bp.activeBotId)
        .collection('flows').doc(flowId).delete()
        .then(() => { if (typeof showToast === 'function') showToast(window.t('crmDeleted'), 'success'); });
};

// ══════════════════════════════════════════════════════════
// 5. КОНТАКТИ — повна реалізація згідно ТЗ
// Пагінація cursor-based (по 20), фільтри, пошук,
// детальна картка в правій панелі, CSV експорт,
// real-time onSnapshot тільки для лічильника нових
// ══════════════════════════════════════════════════════════

// State контактів
let cts = {
    items: [],           // поточна сторінка
    lastDoc: null,       // cursor для пагінації
    hasMore: false,      // є ще записи
    loading: false,
    total: 0,
    // Фільтри
    search: '',
    botId: '',           // '' = всі боти
    flowId: '',          // '' = всі воронки
    dateFrom: '',
    dateTo: '',
    // Активна картка
    activeContactId: null,
    unsub: null,         // real-time listener для нових контактів
};

const CTS_PAGE = 20;

async function renderContactsTab() {
    const c = document.getElementById('bpViewContacts');
    if (!c) return;

    // Скидаємо стан при кожному відкритті вкладки
    cts.items = [];
    cts.lastDoc = null;
    cts.hasMore = false;
    cts.activeContactId = null;

    c.innerHTML = `
    <div style="display:flex;gap:0.75rem;height:calc(100vh - 180px);min-height:500px;">

        <!-- ЛІВА КОЛОНКА: фільтри + список -->
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:0.5rem;">

            <!-- Верхня панель: пошук + фільтри + експорт -->
            <div style="background:white;border-radius:14px;padding:0.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                <!-- Рядок 1: пошук + кнопка CSV -->
                <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;">
                    <div style="flex:1;position:relative;">
                        <svg style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:#9ca3af;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input id="ctsSearch" type="text" placeholder="Ім'я, телефон, нікнейм..."
                            value="${escH(cts.search)}"
                            oninput="ctsOnSearch(this.value)"
                            style="width:100%;padding:0.45rem 0.5rem 0.45rem 2rem;border:1.5px solid #e5e7eb;
                            border-radius:9px;font-size:0.82rem;box-sizing:border-box;outline:none;
                            transition:border-color 0.2s;"
                            onfocus="this.style.borderColor='#22c55e'"
                            onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    <button onclick="ctsExportCSV()"
                        style="padding:0.45rem 0.75rem;background:#f0fdf4;color:#16a34a;border:1.5px solid #bbf7d0;
                        border-radius:9px;cursor:pointer;font-size:0.78rem;font-weight:600;white-space:nowrap;
                        display:flex;align-items:center;gap:4px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        CSV
                    </button>
                </div>

                <!-- Рядок 2: фільтр бот + воронка + дати -->
                <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                    <select id="ctsFilterBot" onchange="ctsOnFilterBot(this.value)"
                        style="flex:1;min-width:100px;padding:0.38rem 0.5rem;border:1.5px solid #e5e7eb;
                        border-radius:8px;font-size:0.76rem;background:white;cursor:pointer;">
                        <option value="">Всі боти</option>
                        ${bp.bots.map(b=>`<option value="${b.id}" ${cts.botId===b.id?'selected':''}>${escH(b.name)}</option>`).join('')}
                    </select>
                    <select id="ctsFilterFlow" onchange="ctsOnFilterFlow(this.value)"
                        style="flex:1;min-width:100px;padding:0.38rem 0.5rem;border:1.5px solid #e5e7eb;
                        border-radius:8px;font-size:0.76rem;background:white;cursor:pointer;">
                        <option value="">Всі воронки</option>
                        ${bp.flows.map(f=>`<option value="${f.id}" ${cts.flowId===f.id?'selected':''}>${escH(f.name)}</option>`).join('')}
                    </select>
                    <input type="date" id="ctsDateFrom" value="${cts.dateFrom}"
                        onchange="ctsOnDateFrom(this.value)"
                        style="padding:0.38rem 0.4rem;border:1.5px solid #e5e7eb;border-radius:8px;
                        font-size:0.76rem;cursor:pointer;max-width:120px;">
                    <input type="date" id="ctsDateTo" value="${cts.dateTo}"
                        onchange="ctsOnDateTo(this.value)"
                        style="padding:0.38rem 0.4rem;border:1.5px solid #e5e7eb;border-radius:8px;
                        font-size:0.76rem;cursor:pointer;max-width:120px;">
                </div>
            </div>

            <!-- Лічильник + індикатор завантаження -->
            <div id="ctsCounter" style="font-size:0.75rem;color:#6b7280;padding:0 0.25rem;"></div>

            <!-- Список контактів -->
            <div id="ctsList" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0.35rem;"></div>

            <!-- Кнопка window.t('botsLoadMore') -->
            <div id="ctsLoadMore" style="display:none;padding:0.25rem 0;">
                <button onclick="ctsLoadMore()"
                    style="width:100%;padding:0.55rem;background:white;border:1.5px solid #e5e7eb;
                    border-radius:10px;cursor:pointer;font-size:0.8rem;font-weight:600;color:#374151;">
                    Завантажити ще
                </button>
            </div>
        </div>

        <!-- ПРАВА ПАНЕЛЬ: картка контакту -->
        <div id="ctsDetailPanel"
            style="width:320px;flex-shrink:0;background:white;border-radius:14px;
            box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow-y:auto;display:none;">
        </div>

    </div>`;

    // Запускаємо перше завантаження
    await ctsLoad(true);

    // Real-time: нові контакти (тільки лічильник, не весь список)
    _ctsStartRealtimeCounter();
}

// ─────────────────────────────────────────
// ЗАВАНТАЖЕННЯ ДАНИХ
// ─────────────────────────────────────────
async function ctsLoad(reset = false) {
    if (cts.loading) return;
    cts.loading = true;
    _ctsSetLoading(true);

    try {
        const db = firebase.firestore();
        let q = window.companyCol('contacts')
            .orderBy('createdAt', 'desc');

        // Фільтри Firestore (індексовані поля)
        if (cts.botId)   q = q.where('botId', '==', cts.botId);
        if (cts.flowId)  q = q.where('flowId', '==', cts.flowId);
        if (cts.dateFrom) q = q.where('createdAt', '>=', new Date(cts.dateFrom));
        if (cts.dateTo)   q = q.where('createdAt', '<=', new Date(cts.dateTo + 'T23:59:59'));

        // Пагінація cursor
        if (!reset && cts.lastDoc) q = q.startAfter(cts.lastDoc);
        q = q.limit(CTS_PAGE + 1); // +1 щоб знати чи є ще

        const snap = await q.get();
        const docs = snap.docs.slice(0, CTS_PAGE);
        cts.hasMore = snap.docs.length > CTS_PAGE;
        cts.lastDoc = docs[docs.length - 1] || null;

        const newItems = docs.map(d => ({ id: d.id, ...d.data() }));

        // Пошук на клієнті (Firestore не підтримує full-text)
        const filtered = cts.search
            ? newItems.filter(ct => _ctsMatchSearch(ct, cts.search))
            : newItems;

        if (reset) {
            cts.items = filtered;
        } else {
            cts.items = [...cts.items, ...filtered];
        }

        _ctsRenderList();
        _ctsUpdateCounter(snap.size);

    } catch(e) {
        const list = document.getElementById('ctsList');
        if (list) list.innerHTML = `<div style="color:#ef4444;padding:1rem;font-size:0.82rem;">Помилка: ${escH(e.message)}</div>`;
    }

    cts.loading = false;
    _ctsSetLoading(false);
}

function _ctsMatchSearch(ct, q) {
    const s = q.toLowerCase();
    return (ct.senderName||'').toLowerCase().includes(s)
        || (ct.phone||'').includes(s)
        || (ct.senderId||'').includes(s)
        || (ct.username||'').toLowerCase().includes(s);
}

// ─────────────────────────────────────────
// РЕНДЕР СПИСКУ
// ─────────────────────────────────────────
function _ctsRenderList() {
    const list = document.getElementById('ctsList');
    const loadMore = document.getElementById('ctsLoadMore');
    if (!list) return;

    if (cts.items.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;padding:3rem 1rem;background:white;border-radius:12px;">
                <svg style="color:#d1d5db;margin-bottom:0.75rem;" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <div style="font-weight:600;color:#374151;margin-bottom:0.3rem;">Контактів не знайдено</div>
                <div style="font-size:0.78rem;color:#9ca3af;">Спробуйте змінити фільтри або дочекайтесь нових лідів</div>
            </div>`;
        if (loadMore) loadMore.style.display = 'none';
        return;
    }

    list.innerHTML = cts.items.map(ct => _ctsCardHTML(ct)).join('');
    if (loadMore) loadMore.style.display = cts.hasMore ? '' : 'none';

    // Підсвічуємо активну картку
    if (cts.activeContactId) {
        const active = list.querySelector(`[data-cid="${cts.activeContactId}"]`);
        if (active) active.style.borderColor = '#22c55e';
    }
}

function _ctsCardHTML(ct) {
    const name = ct.senderName || ct.name || window.t('crmNoName');
    const initial = name.charAt(0).toUpperCase();
    const avatarColors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
    const avatarColor = avatarColors[ct.senderId ? ct.senderId.charCodeAt(0) % avatarColors.length : 0];

    const date = ct.createdAt?.toDate ? relTime(ct.createdAt.toDate()) : '';
    const phone = ct.phone ? `<span style="color:#374151;">${escH(ct.phone)}</span>` : '<span style="color:#d1d5db;">—</span>';

    // Теги
    const tagsHTML = (ct.tags||[]).slice(0,3).map(tag =>
        `<span style="background:#f0fdf4;color:#16a34a;font-size:0.65rem;padding:1px 6px;
        border-radius:10px;font-weight:600;border:1px solid #bbf7d0;">${escH(tag)}</span>`
    ).join('');

    // Ніша і роль
    const nicheHTML = ct.business_type
        ? `<span style="background:#eff6ff;color:#3b82f6;font-size:0.65rem;padding:1px 6px;border-radius:10px;border:1px solid #bfdbfe;">${escH(ct.business_type)}</span>`
        : '';
    const roleHTML = ct.role
        ? `<span style="background:#faf5ff;color:#7c3aed;font-size:0.65rem;padding:1px 6px;border-radius:10px;border:1px solid #e9d5ff;">${escH(ct.role)}</span>`
        : '';

    const isActive = ct.id === cts.activeContactId;

    return `
    <div data-cid="${ct.id}" onclick="ctsOpenCard('${ct.id}')"
        style="background:white;border-radius:12px;padding:0.75rem;
        box-shadow:0 1px 4px rgba(0,0,0,0.06);
        border:1.5px solid ${isActive ? '#22c55e' : '#f1f5f9'};
        cursor:pointer;transition:all 0.15s;"
        onmouseenter="this.style.borderColor='#bbf7d0';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
        onmouseleave="this.style.borderColor='${isActive ? '#22c55e' : '#f1f5f9'}';this.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'">

        <div style="display:flex;align-items:flex-start;gap:0.6rem;">
            <!-- Аватар -->
            <div style="width:38px;height:38px;border-radius:50%;background:${avatarColor};
                display:flex;align-items:center;justify-content:center;
                font-weight:700;color:white;font-size:0.95rem;flex-shrink:0;">
                ${initial}
            </div>

            <!-- Основна інфо -->
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:2px;">
                    <span style="font-weight:700;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${escH(name)}
                    </span>
                    ${ct.username ? `<span style="font-size:0.72rem;color:#9ca3af;">@${escH(ct.username)}</span>` : ''}
                </div>

                <!-- Канал + телефон -->
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;font-size:0.74rem;color:#6b7280;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6" stroke="none"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>
                    ${phone}
                    <span>·</span>
                    <span>${ct.senderId ? 'ID: '+ct.senderId : '—'}</span>
                </div>

                <!-- Теги + ніша + роль -->
                <div style="display:flex;flex-wrap:wrap;gap:3px;">
                    ${nicheHTML}${roleHTML}${tagsHTML}
                </div>
            </div>

            <!-- Права частина: дата + кнопки -->
            <div style="flex-shrink:0;text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                <span style="font-size:0.68rem;color:#9ca3af;">${date}</span>
                <div style="display:flex;gap:3px;margin-top:2px;">
                    <button onclick="event.stopPropagation();bpOpenChat('${ct.id}')"
                        title=window.t('botsWrite')
                        style="padding:0.3rem 0.45rem;background:#eff6ff;color:#3b82f6;border:none;
                        border-radius:7px;cursor:pointer;font-size:0.7rem;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </button>
                    <button onclick="event.stopPropagation();ctsOpenCard('${ct.id}')"
                        title=window.t('crmCard')
                        style="padding:0.3rem 0.45rem;background:#f9fafb;color:#6b7280;border:1px solid #e5e7eb;
                        border-radius:7px;cursor:pointer;font-size:0.7rem;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Воронка через яку пройшов -->
        ${ct.flowId ? `
        <div style="margin-top:0.45rem;padding-top:0.45rem;border-top:1px solid #f1f5f9;
            font-size:0.7rem;color:#9ca3af;display:flex;align-items:center;gap:4px;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>
            ${escH(ct.flowName || ct.flowId)}
        </div>` : ''}
    </div>`;
}

// ─────────────────────────────────────────
// ДЕТАЛЬНА КАРТКА КОНТАКТУ
// ─────────────────────────────────────────
window.ctsOpenCard = async function(contactId) {
    cts.activeContactId = contactId;
    const ct = cts.items.find(c => c.id === contactId);
    if (!ct) return;

    // Оновлюємо border активної картки в списку
    document.querySelectorAll('[data-cid]').forEach(el => {
        el.style.borderColor = el.dataset.cid === contactId ? '#22c55e' : '#f1f5f9';
    });

    const panel = document.getElementById('ctsDetailPanel');
    if (!panel) return;
    panel.style.display = '';

    const name = ct.senderName || ct.name || window.t('crmNoName');
    const initial = name.charAt(0).toUpperCase();
    const avatarColors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
    const avatarColor = avatarColors[ct.senderId ? ct.senderId.charCodeAt(0) % avatarColors.length : 0];

    const createdAt = ct.createdAt?.toDate ? ct.createdAt.toDate().toLocaleDateString('uk-UA') : '—';
    const updatedAt = ct.updatedAt?.toDate ? ct.updatedAt.toDate().toLocaleDateString('uk-UA') : '—';

    const field = (label, value, icon='') => value
        ? `<div style="margin-bottom:0.6rem;">
            <div style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:2px;">${label}</div>
            <div style="font-size:0.82rem;color:#374151;">${icon}${escH(String(value))}</div>
           </div>`
        : '';

    panel.innerHTML = `
        <div style="padding:1rem;">

            <!-- Хедер картки -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                <div style="font-weight:700;font-size:0.85rem;color:#374151;">Картка контакту</div>
                <button onclick="ctsCloseCard()"
                    style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:2px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Аватар + ім'я -->
            <div style="text-align:center;margin-bottom:1.25rem;">
                <div style="width:60px;height:60px;border-radius:50%;background:${avatarColor};
                    display:flex;align-items:center;justify-content:center;
                    font-weight:700;color:white;font-size:1.5rem;margin:0 auto 0.5rem;">
                    ${initial}
                </div>
                <div style="font-weight:700;font-size:1rem;">${escH(name)}</div>
                ${ct.username ? `<div style="font-size:0.78rem;color:#6b7280;">@${escH(ct.username)}</div>` : ''}
            </div>

            <!-- Кнопки дій -->
            <div style="display:flex;gap:0.4rem;margin-bottom:1.25rem;">
                <button onclick="bpOpenChat('${ct.id}')"
                    style="flex:1;padding:0.5rem;background:#22c55e;color:white;border:none;
                    border-radius:9px;cursor:pointer;font-size:0.78rem;font-weight:700;">
                    <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span> Написати
                </button>
                <button onclick="ctsAddToCRM('${ct.id}')"
                    style="flex:1;padding:0.5rem;background:#f0fdf4;color:#16a34a;border:1.5px solid #bbf7d0;
                    border-radius:9px;cursor:pointer;font-size:0.78rem;font-weight:700;">
                    + CRM
                </button>
            </div>

            <!-- Розділювач -->
            <div style="height:1px;background:#f1f5f9;margin-bottom:1rem;"></div>

            <!-- Основні поля -->
            <div>
                ${field(window.t('crmPhone'), ct.phone, '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span> ')}
                ${field('Telegram ID', ct.senderId, '')}
                ${field(window.t('botsChannel'), ct.channel || 'telegram', '')}
                ${field(window.t('crmRole'), ct.role, '')}
                ${field(window.t('onbBizType'), ct.business_type, '')}
                ${field(window.t('botsContactMainProblem'), ct.main_problem, '')}
                ${field(window.t('crmGoal'), ct.main_goal, '')}
                ${field(window.t('botsSearchTerm'), ct.search_time, '')}
                ${field(window.t('crmTabFunnel'), ct.flowName || ct.flowId, '')}
                ${field(window.t('crmFirstContact'), createdAt, '')}
                ${field(window.t('crmLastContact'), updatedAt, '')}
            </div>

            <!-- AI Summary -->
            ${ct.ai_response ? `
            <div style="margin-bottom:0.75rem;">
                <div style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">AI Summary</div>
                <div style="background:#f8fafc;border-radius:8px;padding:0.6rem;font-size:0.78rem;
                    color:#374151;line-height:1.5;border-left:3px solid #22c55e;">
                    ${escH(ct.ai_response)}
                </div>
            </div>` : ''}

            <!-- Теги -->
            <div style="margin-bottom:0.75rem;">
                <div style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Теги</div>
                <div id="ctsTagsContainer" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
                    ${(ct.tags||[]).map((tag,i) => `
                    <span style="background:#f0fdf4;color:#16a34a;font-size:0.72rem;padding:2px 8px;
                        border-radius:10px;font-weight:600;border:1px solid #bbf7d0;
                        display:flex;align-items:center;gap:3px;">
                        ${escH(tag)}
                        <button onclick="ctsRemoveTag('${ct.id}',${i})"
                            style="background:none;border:none;cursor:pointer;color:#16a34a;padding:0;line-height:1;">×</button>
                    </span>`).join('')}
                </div>
                <div style="display:flex;gap:4px;">
                    <input id="ctsNewTag" placeholder=window.t('botsNewTag')
                        style="flex:1;padding:0.35rem 0.5rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.76rem;"
                        onkeydown="if(event.key==='Enter')ctsAddTag('${ct.id}')">
                    <button onclick="ctsAddTag('${ct.id}')"
                        style="padding:0.35rem 0.6rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.76rem;">+</button>
                </div>
            </div>

            <!-- Примітка -->
            <div style="margin-bottom:1rem;">
                <div style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Примітка менеджера</div>
                <textarea id="ctsNote" rows="3" placeholder="Додати примітку..."
                    style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:8px;
                    font-size:0.78rem;resize:vertical;box-sizing:border-box;font-family:inherit;"
                    >${escH(ct.managerNote||'')}</textarea>
                <button onclick="ctsSaveNote('${ct.id}')"
                    style="margin-top:4px;width:100%;padding:0.4rem;background:#f0fdf4;color:#16a34a;
                    border:1.5px solid #bbf7d0;border-radius:7px;cursor:pointer;font-size:0.76rem;font-weight:600;">
                    Зберегти примітку
                </button>
            </div>

            <!-- Видалити контакт -->
            <button onclick="ctsDeleteContact('${ct.id}')"
                style="width:100%;padding:0.45rem;background:#fff5f5;color:#ef4444;
                border:1.5px solid #fecaca;border-radius:9px;cursor:pointer;font-size:0.76rem;font-weight:600;">
                Видалити контакт
            </button>
        </div>`

    // FIX 9: async lookup CRM deal linked to this contact
    try {
        const dealSnap = await window.companyRef()
            .collection(window.DB_COLS ? window.DB_COLS.CRM_DEALS : 'crm_deals')
            .where('contactId', '==', contactId)
            .limit(1).get();
        if (!dealSnap.empty) {
            const deal = dealSnap.docs[0].data();
            const dealId = dealSnap.docs[0].id;
            const crmBtn = document.createElement('div');
            crmBtn.style.cssText = 'margin:0.75rem 1rem 0;padding:0.5rem 0.75rem;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:9px;cursor:pointer;display:flex;align-items:center;gap:0.5rem;';
            crmBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg><div style="flex:1"><div style="font-size:0.78rem;font-weight:700;color:#16a34a;">CRM угода</div><div style="font-size:0.7rem;color:#374151;">' + (deal.title || deal.clientName || '—') + ' · ' + (deal.stage || '—') + '</div></div>';
            crmBtn.onclick = function() { if (typeof switchTab === 'function') switchTab('crm'); };
            const panelEl = document.getElementById('ctsDetailPanel');
            if (panelEl) panelEl.appendChild(crmBtn);
        }
    } catch(e) { /* silently ignore */ };
};

window.ctsCloseCard = function() {
    cts.activeContactId = null;
    const panel = document.getElementById('ctsDetailPanel');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('[data-cid]').forEach(el => {
        el.style.borderColor = '#f1f5f9';
    });
};

// ─────────────────────────────────────────
// ФІЛЬТРИ + ПОШУК (з debounce)
// ─────────────────────────────────────────
let _ctsSearchTimer = null;
window.ctsOnSearch = function(val) {
    cts.search = val;
    clearTimeout(_ctsSearchTimer);
    _ctsSearchTimer = setTimeout(() => ctsLoad(true), 350);
};
window.ctsOnFilterBot  = function(v) { cts.botId = v;  cts.flowId = ''; ctsLoad(true); };
window.ctsOnFilterFlow = function(v) { cts.flowId = v; ctsLoad(true); };
window.ctsOnDateFrom   = function(v) { cts.dateFrom = v; ctsLoad(true); };
window.ctsOnDateTo     = function(v) { cts.dateTo = v; ctsLoad(true); };

window.ctsLoadMore = function() { ctsLoad(false); };

// ─────────────────────────────────────────
// ТЕГИ
// ─────────────────────────────────────────
window.ctsAddTag = async function(contactId) {
    const input = document.getElementById('ctsNewTag');
    const tag = input?.value.trim();
    if (!tag) return;
    const ct = cts.items.find(c => c.id === contactId);
    if (!ct) return;
    const tags = [...(ct.tags||[]), tag];
    await window.companyRef().collection('contacts').doc(contactId)
        .update({ tags, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    ct.tags = tags;
    if (input) input.value = '';
    ctsOpenCard(contactId);
};

window.ctsRemoveTag = async function(contactId, index) {
    const ct = cts.items.find(c => c.id === contactId);
    if (!ct) return;
    const tags = (ct.tags||[]).filter((_,i) => i !== index);
    await window.companyRef().collection('contacts').doc(contactId)
        .update({ tags, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    ct.tags = tags;
    ctsOpenCard(contactId);
};

// ─────────────────────────────────────────
// ПРИМІТКА
// ─────────────────────────────────────────
window.ctsSaveNote = async function(contactId) {
    const note = document.getElementById('ctsNote')?.value.trim() || '';
    await window.companyRef().collection('contacts').doc(contactId)
        .update({ managerNote: note, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    const ct = cts.items.find(c => c.id === contactId);
    if (ct) ct.managerNote = note;
    if (typeof showToast === 'function') showToast(window.t('botsContactNoteSaved'), 'success');
};

// ─────────────────────────────────────────
// ДОДАТИ В CRM
// ─────────────────────────────────────────
window.ctsAddToCRM = async function(contactId) {
    const ct = cts.items.find(c => c.id === contactId);
    if (!ct) return;
    if (typeof emitTalkoEvent !== 'function') {
        if (typeof showToast === 'function') showToast(window.t('botsEventBusNotLoaded'), 'error');
        return;
    }
    try {
        const result = await emitTalkoEvent(window.TALKO_EVENTS.BOT_FLOW_COMPLETED, {
            contactId: ct.id,
            senderName: ct.senderName || ct.name,
            senderId: ct.senderId,
            username: ct.username,
            phone: ct.phone,
            role: ct.role,
            business_type: ct.business_type,
            main_problem: ct.main_problem,
            main_goal: ct.main_goal,
            search_time: ct.search_time,
            ai_response: ct.ai_response,
            tags: ct.tags,
        }, { triggeredBy: 'user' });
        if (typeof showToast === 'function') showToast('<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> Додано в CRM', 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ─────────────────────────────────────────
// ВИДАЛЕННЯ КОНТАКТУ
// ─────────────────────────────────────────
window.ctsDeleteContact = async function(contactId) {
    if (!(await (window.showConfirmModal ? showConfirmModal(window.t('botsDeleteContact'),{danger:true}) : Promise.resolve(confirm(window.t('botsDeleteContact')))))) return;
    try {
        await window.companyRef().collection('contacts').doc(contactId)
            .delete();
        cts.items = cts.items.filter(c => c.id !== contactId);
        ctsCloseCard();
        _ctsRenderList();
        if (typeof showToast === 'function') showToast(window.t('botsContactDeleted'), 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ─────────────────────────────────────────
// CSV ЕКСПОРТ
// ─────────────────────────────────────────
window.ctsExportCSV = async function() {
    // Завантажуємо всі з поточними фільтрами (без пагінації)
    if (typeof showToast === 'function') showToast(window.t('botsPrepareCSV'), 'info');
    try {
        const db = firebase.firestore();
        let q = window.companyCol('contacts')
            .orderBy('createdAt', 'desc');
        if (cts.botId)   q = q.where('botId', '==', cts.botId);
        if (cts.flowId)  q = q.where('flowId', '==', cts.flowId);
        if (cts.dateFrom) q = q.where('createdAt', '>=', new Date(cts.dateFrom));
        if (cts.dateTo)   q = q.where('createdAt', '<=', new Date(cts.dateTo + 'T23:59:59'));
        q = q.limit(1000);

        const snap = await q.get();
        const rows = snap.docs.map(d => {
            const c = d.data();
            return [
                c.senderName||'', c.username||'', c.senderId||'',
                c.phone||'', c.channel||'telegram', c.role||'',
                c.business_type||'', c.main_problem||'', c.main_goal||'',
                c.search_time||'', (c.tags||[]).join(';'),
                c.flowName||'', c.botId||'',
                c.createdAt?.toDate?.().toLocaleDateString('uk-UA')||'',
                c.managerNote||'',
            ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
        });

        const header = 'Ім\'я,Username,Telegram ID,Телефон,Канал,Роль,Ніша,Проблема,Ціль,Термін,Теги,Воронка,Бот,Дата,Примітка';
        const csv = '\uFEFF' + header + '\n' + rows.join('\n'); // BOM для Excel
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `contacts_${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
        if (typeof showToast === 'function') showToast(`Експортовано ${rows.length} контактів`, 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ─────────────────────────────────────────
// REAL-TIME: лічильник нових контактів
// (тільки metadata — не весь список)
// ─────────────────────────────────────────
function _ctsStartRealtimeCounter() {
    if (typeof cts.unsub === 'function') cts.unsub(); cts.unsub = null;
    // Слухаємо тільки останній документ — дешево
    const _ctsCol = window.companyCol('contacts');
    if (!_ctsCol) return;
    cts.unsub = _ctsCol
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(snap => {
            if (!snap.empty) {
                const latest = snap.docs[0].data();
                const latestTime = latest.createdAt?.toDate?.();
                if (latestTime && cts.items.length > 0) {
                    const firstItem = cts.items[0];
                    const firstTime = firstItem.createdAt?.toDate?.();
                    if (firstTime && latestTime > firstTime) {
                        // Є новий контакт — показуємо кнопку оновлення
                        _ctsShowRefreshBanner();
                    }
                }
            }
        });
}

function _ctsShowRefreshBanner() {
    const counter = document.getElementById('ctsCounter');
    if (!counter || counter.querySelector('.cts-refresh-btn')) return;
    counter.insertAdjacentHTML('beforeend',
        ` <button class="cts-refresh-btn" onclick="ctsLoad(true)"
            style="background:#22c55e;color:white;border:none;padding:2px 8px;
            border-radius:6px;font-size:0.7rem;cursor:pointer;font-weight:600;">
            ↻ Нові ліди
        </button>`
    );
}

// ─────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────
function _ctsSetLoading(on) {
    const list = document.getElementById('ctsList');
    if (!list) return;
    if (on && cts.items.length === 0) {
        list.innerHTML = Array(3).fill(`
            <div style="background:white;border-radius:12px;padding:0.75rem;
                box-shadow:0 1px 4px rgba(0,0,0,0.06);animation:pulse 1.5s infinite;">
                <div style="display:flex;gap:0.6rem;align-items:center;">
                    <div style="width:38px;height:38px;border-radius:50%;background:#f1f5f9;flex-shrink:0;"></div>
                    <div style="flex:1;">
                        <div style="height:12px;background:#f1f5f9;border-radius:4px;width:60%;margin-bottom:6px;"></div>
                        <div style="height:10px;background:#f1f5f9;border-radius:4px;width:40%;"></div>
                    </div>
                </div>
            </div>`).join('');
    }
}

function _ctsUpdateCounter(loaded) {
    const el = document.getElementById('ctsCounter');
    if (el) {
        const total = cts.items.length;
        el.textContent = `Показано: ${total}${cts.hasMore ? '+' : ''} контактів`;
    }
}

window.bpFilterContacts = function(f) {
    cts.search = ''; cts.botId = ''; cts.flowId = '';
    ctsLoad(true);
};

// ═══════════════════════════════════════════════════════
// 6. ЧАТ
// ══════════════════════════════════════════════════════════
// Месенджер-стиль: ліва колонка контактів + права переписка.
// Дані: contacts/{id}/messages/ (не sessions/).
// Відправка через POST /api/webhook?action=send-message
// Непрочитані: unreadCount в контакті + mark-read при відкритті
// ══════════════════════════════════════════════════════════

// State чату
let chat = {
    contacts: [],        // список контактів для лівої колонки
    lastContactDoc: null,
    hasMoreContacts: false,
    activeId: null,      // поточний contactId (main instance)
    msgsUnsub: null,     // onSnapshot на messages (main instance)
    contactsUnsub: null, // onSnapshot на unreadCount
    search: '',
    sendingBotToken: null, // токен бота поточного контакту (main instance)

    // ── Multi-instance: кожен контекст (main, crm, тощо) має свій стейт ──
    // instances[id] = { activeId, msgsUnsub, sendingBotToken, msgsContainerId, inputId, sendBtnId }
    instances: {},
};

// Ініціалізація або отримання інстансу чату
function _chatGetInstance(instanceId) {
    if (!chat.instances[instanceId]) {
        chat.instances[instanceId] = {
            activeId:        null,
            msgsUnsub:       null,
            sendingBotToken: null,
            msgsContainerId: instanceId === 'main' ? 'chatMsgs'    : `chatMsgs_${instanceId}`,
            inputId:         instanceId === 'main' ? 'chatInput'   : `chatInput_${instanceId}`,
            sendBtnId:       instanceId === 'main' ? 'chatSendBtn' : `chatSendBtn_${instanceId}`,
        };
    }
    return chat.instances[instanceId];
}

async function renderChatTab() {
    const c = document.getElementById('bpViewChat');
    if (!c) return;

    c.innerHTML = `
    <div style="display:flex;gap:0;height:calc(100vh - 180px);min-height:500px;
        background:white;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">

        <!-- ЛІВА КОЛОНКА: список контактів -->
        <div style="width:260px;flex-shrink:0;display:flex;flex-direction:column;
            border-right:1px solid #f1f5f9;">

            <!-- Хедер + пошук -->
            <div style="padding:0.75rem;border-bottom:1px solid #f1f5f9;flex-shrink:0;">
                <div style="font-weight:700;font-size:0.88rem;color:#111827;margin-bottom:0.5rem;">
                    Повідомлення
                </div>
                <div style="position:relative;">
                    <svg style="position:absolute;left:8px;top:50%;transform:translateY(-50%);color:#9ca3af;"
                        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input id="chatSearch" type="text" placeholder=window.t('botsSearch')
                        value="${escH(chat.search)}"
                        oninput="chatOnSearch(this.value)"
                        style="width:100%;padding:0.38rem 0.5rem 0.38rem 1.8rem;border:1.5px solid #e5e7eb;
                        border-radius:8px;font-size:0.78rem;box-sizing:border-box;outline:none;"
                        onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
            </div>

            <!-- Список -->
            <div id="chatContactsList" style="flex:1;overflow-y:auto;"></div>
        </div>

        <!-- ПРАВА КОЛОНКА: переписка -->
        <div style="flex:1;display:flex;flex-direction:column;min-width:0;">

            <!-- Хедер контакту -->
            <div id="chatMsgHeader"
                style="padding:0.65rem 1rem;border-bottom:1px solid #f1f5f9;
                flex-shrink:0;display:flex;align-items:center;gap:0.6rem;min-height:54px;">
                <div style="color:#9ca3af;font-size:0.82rem;">Оберіть контакт зліва</div>
            </div>

            <!-- Повідомлення -->
            <div id="chatMsgs"
                style="flex:1;overflow-y:auto;padding:1rem;
                display:flex;flex-direction:column;gap:0.5rem;background:#f8fafc;">
            </div>

            <!-- Поле вводу -->
            <div id="chatInputArea"
                style="padding:0.6rem;border-top:1px solid #f1f5f9;flex-shrink:0;display:none;">
                <div style="display:flex;gap:0.4rem;align-items:flex-end;">
                    <textarea id="chatInput" rows="1" placeholder="Написати повідомлення... (Enter — відправити)"
                        style="flex:1;padding:0.5rem 0.65rem;border:1.5px solid #e5e7eb;
                        border-radius:10px;font-size:0.83rem;resize:none;font-family:inherit;
                        max-height:100px;overflow-y:auto;outline:none;line-height:1.4;"
                        onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();chatSend();}"
                        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'">
                    </textarea>
                    <button onclick="chatSend()" id="chatSendBtn"
                        style="padding:0.5rem 0.75rem;background:#22c55e;color:white;border:none;
                        border-radius:10px;cursor:pointer;flex-shrink:0;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    await chatLoadContacts();

    // Real-time: оновлення unreadCount в лівій колонці
    _chatStartUnreadListener();

    // Якщо є активний контакт — відкриваємо
    if (chat.activeId) bpOpenChat(chat.activeId);
}

// ─────────────────────────────────────────
// ЗАВАНТАЖЕННЯ КОНТАКТІВ (ліва колонка)
// ─────────────────────────────────────────
async function chatLoadContacts(reset = true) {
    if (reset) {
        chat.contacts = [];
        chat.lastContactDoc = null;
    }

    try {
        let q = window.companyCol('contacts')
            .orderBy('lastMessageAt', 'desc');

        if (chat.lastContactDoc) q = q.startAfter(chat.lastContactDoc);
        q = q.limit(31);

        const snap = await q.get();
        const docs = snap.docs.slice(0, 30);
        chat.hasMoreContacts = snap.docs.length > 30;
        chat.lastContactDoc = docs[docs.length - 1] || null;

        const items = docs.map(d => ({ id: d.id, ...d.data() }));
        const filtered = chat.search
            ? items.filter(ct => _chatMatchSearch(ct, chat.search))
            : items;

        if (reset) chat.contacts = filtered;
        else chat.contacts = [...chat.contacts, ...filtered];

        _chatRenderContactsList();
    } catch(e) {
        console.error('[chat] loadContacts:', e);
    }
}

function _chatMatchSearch(ct, q) {
    const s = q.toLowerCase();
    return (ct.senderName||'').toLowerCase().includes(s) || (ct.phone||'').includes(s);
}

function _chatRenderContactsList() {
    const list = document.getElementById('chatContactsList');
    if (!list) return;

    if (!chat.contacts.length) {
        list.innerHTML = `<div style="text-align:center;padding:2rem;color:#9ca3af;font-size:0.78rem;">
            Контактів немає.<br>Очікуйте нових лідів.
        </div>`;
        return;
    }

    list.innerHTML = chat.contacts.map(ct => {
        const name = ct.senderName || ct.name || window.t('botsAnon');
        const initial = name.charAt(0).toUpperCase();
        const avatarColors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
        const avatarColor = avatarColors[ct.senderId ? ct.senderId.charCodeAt(0) % 6 : 0];
        const isActive = ct.id === chat.activeId;
        const unread = ct.unreadCount || 0;
        const lastMsg = ct.lastMessage || '';
        const lastTime = ct.lastMessageAt?.toDate ? relTime(ct.lastMessageAt.toDate()) : '';

        return `
        <div onclick="bpOpenChat('${ct.id}')" data-chatid="${ct.id}"
            style="padding:0.65rem 0.75rem;cursor:pointer;border-bottom:1px solid #f9fafb;
            background:${isActive ? '#f0fdf4' : 'transparent'};
            transition:background 0.15s;"
            onmouseenter="if('${ct.id}'!=='${chat.activeId}')this.style.background='#f8fafc'"
            onmouseleave="this.style.background='${isActive ? '#f0fdf4' : 'transparent'}'">
            <div style="display:flex;align-items:center;gap:0.5rem;">
                <div style="position:relative;flex-shrink:0;">
                    <div style="width:36px;height:36px;border-radius:50%;background:${avatarColor};
                        display:flex;align-items:center;justify-content:center;
                        font-weight:700;color:white;font-size:0.88rem;">
                        ${initial}
                    </div>
                    ${unread > 0 ? `
                    <div style="position:absolute;top:-2px;right:-2px;
                        width:16px;height:16px;border-radius:50%;background:#ef4444;
                        display:flex;align-items:center;justify-content:center;
                        font-size:0.6rem;font-weight:700;color:white;border:2px solid white;">
                        ${unread > 9 ? '9+' : unread}
                    </div>` : ''}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1px;">
                        <span style="font-weight:${unread>0?'700':'600'};font-size:0.82rem;
                            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;">
                            ${escH(name)}
                        </span>
                        <span style="font-size:0.65rem;color:#9ca3af;flex-shrink:0;margin-left:4px;">${lastTime}</span>
                    </div>
                    <div style="font-size:0.72rem;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
                        font-weight:${unread>0?'600':'400'};color:${unread>0?'#374151':'#9ca3af'};">
                        ${escH(lastMsg.slice(0, 45) || window.t('botsNoMessages2'))}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('') + (chat.hasMoreContacts ? `
        <div style="padding:0.5rem;text-align:center;">
            <button onclick="chatLoadContacts(false)"
                style="font-size:0.74rem;color:#6b7280;background:none;border:none;cursor:pointer;">
                Завантажити ще
            </button>
        </div>` : '');
}

// ─────────────────────────────────────────
// ВІДКРИТИ ЧАТ З КОНТАКТОМ
// ─────────────────────────────────────────
window.bpOpenChat = async function(contactId, instanceId = 'main') {
    const inst = _chatGetInstance(instanceId);

    // Якщо main instance і не на вкладці chat — переходимо
    if (instanceId === 'main' && bp.subTab !== 'chat') {
        bpSwitch('chat');
        await new Promise(r => setTimeout(r, 100));
    }

    inst.activeId = contactId;
    // backward compat для main instance
    if (instanceId === 'main') {
        chat.activeId = contactId;
        bp.activeChatContactId = contactId;
    }

    // PERF: якщо контакт не в cache — завантажуємо
    let ct = chat.contacts.find(c => c.id === contactId);
    if (!ct) {
        const doc = await window.companyRef().collection('contacts').doc(contactId).get();
        if (doc.exists) {
            ct = { id: doc.id, ...doc.data() };
            chat.contacts.unshift(ct);
        }
    }

    // Рендеримо UI одразу (не чекаємо токен)
    if (instanceId === 'main') _chatRenderContactsList();
    const headerContainerId = instanceId === 'main' ? 'chatMsgHeader' : `chatMsgHeader_${instanceId}`;
    _chatRenderHeader(ct, headerContainerId);
    const inputAreaId = instanceId === 'main' ? 'chatInputArea' : `chatInputArea_${instanceId}`;
    const inputArea = document.getElementById(inputAreaId);
    if (inputArea) inputArea.style.display = '';

    // Зупиняємо попередній listener
    if (typeof inst.msgsUnsub === 'function') { inst.msgsUnsub(); }
    inst.msgsUnsub = null;
    if (instanceId === 'main') { chat.msgsUnsub = null; }

    // PERF: підписка на messages + завантаження токена паралельно (-40ms)
    const _msgRef = window.companyRef();
    const [, _token] = await Promise.all([
        // Messages onSnapshot (синхронний — повертає unsub функцію)
        Promise.resolve(_msgRef ? (() => {
            inst.msgsUnsub = _msgRef.collection('contacts').doc(contactId).collection('messages')
                .orderBy('timestamp', 'asc')
                .limitToLast(100)
                .onSnapshot(
                    snap => _chatRenderMessages(
                        snap.docs.map(d => ({ id: d.id, ...d.data() })),
                        inst.msgsContainerId
                    ),
                    err => console.error('[chat] messages listener:', err.message)
                );
            if (instanceId === 'main') chat.msgsUnsub = inst.msgsUnsub;
        })() : null),
        // Токен бота — паралельно
        _chatGetBotToken(ct),
    ]);
    inst.sendingBotToken = _token;
    if (instanceId === 'main') chat.sendingBotToken = _token;

    // Позначаємо прочитаними (fire-and-forget)
    _chatMarkRead(contactId);
};

function _chatRenderHeader(ct, containerId = 'chatMsgHeader') {
    const header = document.getElementById(containerId);
    if (!header || !ct) return;
    const name = ct.senderName || ct.name || window.t('botsAnon');
    const initial = name.charAt(0).toUpperCase();
    const avatarColors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
    const avatarColor = avatarColors[ct.senderId ? ct.senderId.charCodeAt(0) % 6 : 0];

    header.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;background:${avatarColor};
            display:flex;align-items:center;justify-content:center;
            font-weight:700;color:white;font-size:0.9rem;flex-shrink:0;">
            ${initial}
        </div>
        <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.88rem;">${escH(name)}</div>
            <div style="font-size:0.7rem;color:#6b7280;">
                ${ct.senderId ? 'ID: '+ct.senderId : ''}
                ${ct.phone ? ' · <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span> '+ct.phone : ''}
                ${ct.business_type ? ' · '+ct.business_type : ''}
            </div>
        </div>
        ${ct.botStatus === 'blocked' ? `
        <span style="font-size:0.7rem;color:#ef4444;background:#fee2e2;
            padding:2px 8px;border-radius:6px;font-weight:600;flex-shrink:0;">
            <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></span> Заблокував
        </span>` : ''}
        <button onclick="ctsOpenCard('${ct.id}')"
            title=window.t('botsContactCard')
            style="padding:0.35rem 0.5rem;background:#f9fafb;border:1px solid #e5e7eb;
            border-radius:8px;cursor:pointer;flex-shrink:0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
        </button>`;
}

function _chatRenderMessages(msgs, containerId = 'chatMsgs') {
    const div = document.getElementById(containerId);
    if (!div) return;

    if (!msgs.length) {
        div.innerHTML = `
            <div style="text-align:center;padding:3rem;color:#9ca3af;font-size:0.82rem;">
                <svg style="margin-bottom:0.5rem;opacity:0.4;" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <div>Повідомлень поки немає</div>
                <div style="font-size:0.74rem;margin-top:4px;">Напишіть першим або дочекайтесь відповіді</div>
            </div>`;
        return;
    }

    const wasAtBottom = div.scrollHeight - div.scrollTop - div.clientHeight < 50;

    div.innerHTML = msgs.map(m => {
        const isBot = m.from === 'bot' || m.direction === 'out';
        const time = m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString('uk-UA', {hour:'2-digit',minute:'2-digit'}) : '';

        // Відображаємо кнопки якщо є (збережені ботом)
        const btnsHtml = (m.buttons?.length && !isBot) ? '' : (m.buttons?.length ? `
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;justify-content:flex-end;">
                ${m.buttons.map(b => `<span style="padding:3px 8px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.4);border-radius:10px;font-size:0.72rem;cursor:default;">${escH(b.label||'')}</span>`).join('')}
            </div>` : '');
        // Оператор vs бот автовідповідь
        const senderLabel = isBot
            ? (m.sentBy === 'operator' ? '<span style="font-size:0.62rem;color:#86efac;font-weight:600;">Оператор · </span>' : '')
            : '';
        return `
        <div style="display:flex;justify-content:${isBot ? 'flex-end' : 'flex-start'};margin-bottom:2px;">
            <div style="max-width:75%;display:flex;flex-direction:column;align-items:${isBot ? 'flex-end' : 'flex-start'};">
                <div style="padding:0.5rem 0.75rem;
                    border-radius:${isBot ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};
                    background:${isBot ? (m.sentBy==='operator' ? '#2563eb' : '#22c55e') : 'white'};
                    color:${isBot ? 'white' : '#1a1a1a'};
                    font-size:0.82rem;line-height:1.45;
                    box-shadow:${isBot ? '0 1px 4px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.08)'};
                    word-break:break-word;">
                    ${senderLabel}${escH(m.text || '')}
                    ${btnsHtml}
                </div>
                <div style="font-size:0.62rem;color:#9ca3af;margin-top:2px;
                    display:flex;align-items:center;gap:3px;">
                    ${time}
                    ${isBot ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${m.read ? '#22c55e' : '#9ca3af'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    if (wasAtBottom) div.scrollTop = div.scrollHeight;
}

// ─────────────────────────────────────────
// ВІДПРАВКА ПОВІДОМЛЕННЯ
// ─────────────────────────────────────────
window.chatSend = window.bpSendMsg = async function(instanceId = 'main') {
    const inst = _chatGetInstance(instanceId);
    const input = document.getElementById(inst.inputId);
    const text = input?.value.trim();
    if (!text || !inst.activeId) return;

    const btn = document.getElementById(inst.sendBtnId);
    if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
    input.value = '';
    if (input.tagName === 'TEXTAREA') { input.style.height = 'auto'; }

    try {
        // CRITICAL FIX: відправляємо через /api/webhook?action=send-message
        // Раніше писали тільки pendingOutMessage в Firestore і чекали Cloud Functions
        // яких немає → повідомлення ніколи не доходили до клієнта в Telegram
        const idToken = await firebase.auth().currentUser?.getIdToken().catch(() => null);
        if (!idToken) throw new Error('Не авторизований');

        const _sendAbort = new AbortController();
        const _sendTimer = setTimeout(() => _sendAbort.abort(), 10000);
        let apiOk = false;
        try {
            const resp = await fetch('/api/webhook?action=send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + idToken,
                },
                signal: _sendAbort.signal,
                body: JSON.stringify({
                    companyId: window.currentCompanyId,
                    contactId: inst.activeId,
                    text,
                }),
            });
            clearTimeout(_sendTimer);
            const data = await resp.json();
            apiOk = data?.ok === true;
            if (!resp.ok || !apiOk) {
                throw new Error(data?.error || 'Помилка API: ' + resp.status);
            }
            // Показуємо статус доставки
            if (data.telegramOk === false) {
                if (typeof showToast === 'function') showToast('⚠️ Повідомлення збережено, але Telegram не відповів (клієнт міг заблокувати бота)', 'warning');
            }
        } finally {
            clearTimeout(_sendTimer);
        }

        // Оновлюємо локальний стан (повідомлення вже збережено через API)
        const ct = chat.contacts.find(c => c.id === inst.activeId);
        if (ct) { ct.lastMessage = text; ct.lastMessageAt = { toDate: () => new Date() }; }
        if (instanceId === 'main') _chatRenderContactsList();

    } catch(e) {
        // Відновлюємо текст в полі щоб юзер міг повторити
        if (input) input.value = text;
        console.error('[chat] send:', e);
        if (typeof showToast === 'function') showToast('Помилка відправки: ' + e.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    }
};

// ─────────────────────────────────────────
// MARK READ
// ─────────────────────────────────────────
async function _chatMarkRead(contactId) {
    try {
        // Обнуляємо лічильник локально одразу
        const ct = chat.contacts.find(c => c.id === contactId);
        if (ct) ct.unreadCount = 0;
        _chatRenderContactsList();

        // Оновлюємо напряму в Firestore (без зовнішнього запиту)
        window.companyRef().collection('contacts').doc(contactId)
            .update({ unreadCount: 0 }).catch(() => {});
    } catch(e) { /* не критично */ }
}

// ─────────────────────────────────────────
// ТОКЕН БОТА
// ─────────────────────────────────────────
async function _chatGetBotToken(ct) {
    if (!ct) return null;
    // Токен зберігається в боті по botId
    const botId = ct.botId || bp.activeBotId;
    if (!botId) return null;
    const bot = bp.bots.find(b => b.id === botId);
    if (bot?.token) return bot.token;
    // Завантажуємо якщо немає в cache
    try {
        const doc = await firebase.firestore()
            .doc(window.currentCompanyId + '/bots/' + botId).get();
        return doc.data()?.token || null;
    } catch { return null; }
}

// ─────────────────────────────────────────
// REAL-TIME: лічильник непрочитаних
// ─────────────────────────────────────────
function _chatStartUnreadListener() {
    if (typeof chat.contactsUnsub === 'function') { chat.contactsUnsub(); } chat.contactsUnsub = null;

    // Слухаємо тільки контакти з unreadCount > 0
    const _unreadCol = window.companyCol('contacts');
    if (!_unreadCol) return;
    chat.contactsUnsub = _unreadCol
        .where('unreadCount', '>', 0)
        .onSnapshot(snap => {
            snap.docs.forEach(doc => {
                const idx = chat.contacts.findIndex(c => c.id === doc.id);
                if (idx >= 0) {
                    chat.contacts[idx].unreadCount = doc.data().unreadCount;
                } else {
                    // Новий контакт з непрочитаними — додаємо на початок
                    chat.contacts.unshift({ id: doc.id, ...doc.data() });
                }
            });
            _chatRenderContactsList();
        });
}

// ─────────────────────────────────────────
// ПОШУК
// ─────────────────────────────────────────
let _chatSearchTimer = null;
window.chatOnSearch = function(val) {
    chat.search = val;
    clearTimeout(_chatSearchTimer);
    _chatSearchTimer = setTimeout(() => chatLoadContacts(true), 300);
};

// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// 7. РОЗСИЛКА — повна реалізація згідно ТЗ
// Сегментація: канал / ніша / тег / воронка
// Rate limiting: 25 msg/sec (Telegram дозволяє до 30)
// Прогрес-бар в реальному часі
// Скасування під час відправки
// Збереження в broadcasts/ з повною статистикою
// ══════════════════════════════════════════════════════════

// State розсилки
let bcast = {
    running: false,
    cancelled: false,
    sent: 0,
    failed: 0,
    total: 0,
};

async function renderBroadcastTab() {
    const c = document.getElementById('bpViewBroadcast');
    if (!c) return;

    // Завантажуємо унікальні теги і ніші для фільтрів
    let allTags = [], allNiches = [];
    try {
        // Беремо теги з поточних contacts в пам'яті якщо є, інакше з Firestore
        const contactsForMeta = cts.items.length > 0 ? cts.items : [];
        contactsForMeta.forEach(ct => {
            (ct.tags || []).forEach(t => { if (t && !allTags.includes(t)) allTags.push(t); });
            if (ct.business_type && !allNiches.includes(ct.business_type)) allNiches.push(ct.business_type);
        });
    } catch(e) { console.error('[83-bots-contacts]', e.message); }

    let history = [];
    try {
        const snap = await window.companyRef().collection(window.DB_COLS.BROADCASTS)
            .orderBy('createdAt', 'desc').limit(20).get();
        history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.error('[83-bots-contacts] broadcasts:', e.message); }

    const sectionStyle = 'background:white;border-radius:14px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);';
    const labelStyle = 'font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.4rem;';
    const inputStyle = 'width:100%;padding:0.5rem 0.6rem;border:1.5px solid #e5e7eb;border-radius:9px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;outline:none;';
    const selectStyle = 'width:100%;padding:0.48rem 0.5rem;border:1.5px solid #e5e7eb;border-radius:9px;font-size:0.8rem;background:white;cursor:pointer;';

    c.innerHTML = `
    <div style="display:flex;gap:0.75rem;max-width:900px;">

        <!-- ЛІВА ЧАСТИНА: форма розсилки -->
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:0.65rem;">

            <!-- Нова розсилка -->
            <div style="${sectionStyle}">
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.85rem;display:flex;align-items:center;gap:0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Нова розсилка
                </div>

                <!-- Аудиторія -->
                <div style="margin-bottom:0.65rem;">
                    <label style="${labelStyle}">СЕГМЕНТ АУДИТОРІЇ</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;">
                        <div>
                            <div style="font-size:0.71rem;color:#6b7280;margin-bottom:3px;">Канал</div>
                            <select id="bcastChannel" onchange="bcastPreview()" style="${selectStyle}">
                                <option value="">Всі канали</option>
                                <option value="telegram">Telegram</option>
                                <option value="instagram">Instagram</option>
                            </select>
                        </div>
                        <div>
                            <div style="font-size:0.71rem;color:#6b7280;margin-bottom:3px;">Воронка</div>
                            <select id="bcastFlow" onchange="bcastPreview()" style="${selectStyle}">
                                <option value="">Всі воронки</option>
                                ${bp.flows.map(f => `<option value="${f.id}">${escH(f.name)}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <div style="font-size:0.71rem;color:#6b7280;margin-bottom:3px;">Ніша</div>
                            <select id="bcastNiche" onchange="bcastPreview()" style="${selectStyle}">
                                <option value="">Всі ніші</option>
                                ${allNiches.map(n => `<option value="${escH(n)}">${escH(n)}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <div style="font-size:0.71rem;color:#6b7280;margin-bottom:3px;">Тег</div>
                            <select id="bcastTag" onchange="bcastPreview()" style="${selectStyle}">
                                <option value="">Всі теги</option>
                                ${allTags.map(t => `<option value="${escH(t)}">${escH(t)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <!-- Preview аудиторії -->
                    <div id="bcastPreviewBox"
                        style="margin-top:0.5rem;padding:0.5rem 0.65rem;background:#f0fdf4;
                        border-radius:8px;border:1px solid #bbf7d0;font-size:0.78rem;color:#16a34a;
                        font-weight:600;display:none;">
                    </div>
                </div>

                <!-- Повідомлення -->
                <div style="margin-bottom:0.65rem;">
                    <label style="${labelStyle}">ТЕКСТ ПОВІДОМЛЕННЯ</label>
                    <textarea id="bcastText" rows="4"
                        placeholder="Текст розсилки...&#10;&#10;Підтримується *жирний* і _курсив_ (Telegram Markdown)"
                        oninput="bcastCountChars(this.value)"
                        style="${inputStyle}resize:vertical;"></textarea>
                    <div style="display:flex;justify-content:space-between;margin-top:3px;">
                        <div style="font-size:0.7rem;color:#9ca3af;">
                            Enter = новий рядок · *bold* · _italic_
                        </div>
                        <div id="bcastCharCount" style="font-size:0.7rem;color:#9ca3af;">0 / 4096</div>
                    </div>
                </div>

                <!-- Або запустити ланцюг -->
                <div style="margin-bottom:0.85rem;">
                    <label style="${labelStyle}">АБО ЗАПУСТИТИ ЛАНЦЮГ</label>
                    <select id="bcastFlowSend" style="${selectStyle}">
                        <option value="">— Тільки текст —</option>
                        ${bp.flows.map(f => `<option value="${f.id}">${escH(f.name)}</option>`).join('')}
                    </select>
                    <div style="font-size:0.71rem;color:#9ca3af;margin-top:3px;">
                        Якщо обрано ланцюг — текст ігнорується. Бот запустить ланцюг для кожного.
                    </div>
                </div>

                <!-- Rate limiting попередження -->
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:9px;
                    padding:0.55rem 0.7rem;margin-bottom:0.75rem;font-size:0.76rem;color:#92400e;">
                    ⚠️ Telegram дозволяє <b>30 повідомлень/сек</b>. Ми відправляємо по <b>25/сек</b> з паузою 40мс між кожним.
                    При великій базі (500+) розсилка може зайняти кілька хвилин.
                </div>

                <!-- Кнопка відправки -->
                <button onclick="bpSendBroadcast()" id="bcastSendBtn"
                    style="width:100%;padding:0.65rem;background:#22c55e;color:white;border:none;
                    border-radius:10px;cursor:pointer;font-weight:700;font-size:0.88rem;
                    display:flex;align-items:center;justify-content:center;gap:6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Надіслати розсилку
                </button>
            </div>

            <!-- Прогрес-бар (прихований поки не запущено) -->
            <div id="bcastProgress" style="display:none;${sectionStyle}">
                <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.6rem;">
                    <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg></span> Відправка в процесі...
                </div>
                <div style="background:#f1f5f9;border-radius:8px;height:10px;overflow:hidden;margin-bottom:0.5rem;">
                    <div id="bcastProgressBar"
                        style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);
                        width:0%;transition:width 0.3s;border-radius:8px;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.76rem;">
                    <span id="bcastProgressText" style="color:#374151;font-weight:600;"></span>
                    <span id="bcastProgressPercent" style="color:#6b7280;"></span>
                </div>
                <div style="display:flex;gap:0.5rem;margin-top:0.6rem;">
                    <div id="bcastStatSent" style="flex:1;text-align:center;padding:0.4rem;background:#f0fdf4;border-radius:8px;">
                        <div style="font-size:1rem;font-weight:700;color:#22c55e;" id="bcastStatSentNum">0</div>
                        <div style="font-size:0.68rem;color:#6b7280;">Надіслано</div>
                    </div>
                    <div id="bcastStatFailed" style="flex:1;text-align:center;padding:0.4rem;background:#fff5f5;border-radius:8px;">
                        <div style="font-size:1rem;font-weight:700;color:#ef4444;" id="bcastStatFailedNum">0</div>
                        <div style="font-size:0.68rem;color:#6b7280;">Помилок</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:0.4rem;background:#f8fafc;border-radius:8px;">
                        <div style="font-size:1rem;font-weight:700;color:#374151;" id="bcastStatTotal">0</div>
                        <div style="font-size:0.68rem;color:#6b7280;">Всього</div>
                    </div>
                </div>
                <button onclick="bcastCancel()"
                    style="margin-top:0.6rem;width:100%;padding:0.45rem;background:#fee2e2;color:#ef4444;
                    border:1.5px solid #fecaca;border-radius:9px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                    ✕ Зупинити розсилку
                </button>
            </div>
        </div>

        <!-- ПРАВА ЧАСТИНА: історія -->
        <div style="width:280px;flex-shrink:0;display:flex;flex-direction:column;gap:0.5rem;">
            <div style="font-weight:700;font-size:0.85rem;color:#374151;padding:0 0.1rem;">
                Історія розсилок
            </div>
            ${history.length === 0
                ? `<div style="text-align:center;padding:2rem;background:white;border-radius:12px;color:#9ca3af;font-size:0.78rem;">
                    Розсилок ще не було
                   </div>`
                : history.map(b => {
                    const rate = b.total > 0 ? Math.round(b.sent / b.total * 100) : 0;
                    const statusColor = b.status === 'cancelled' ? '#f97316' : rate >= 80 ? '#22c55e' : '#ef4444';
                    const date = b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString('uk-UA', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '';
                    return `
                    <div style="background:white;border-radius:12px;padding:0.75rem;
                        box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                        <div style="font-size:0.8rem;font-weight:700;margin-bottom:3px;overflow:hidden;
                            text-overflow:ellipsis;white-space:nowrap;">
                            ${escH(b.text?.slice(0, 45) || b.flowName || window.t('botsBroadcast'))}
                        </div>
                        <div style="font-size:0.7rem;color:#9ca3af;margin-bottom:0.45rem;">
                            ${date}
                            ${b.segment ? ` · ${escH(b.segment)}` : ''}
                        </div>
                        <!-- Мінімальний прогрес-бар -->
                        <div style="background:#f1f5f9;border-radius:4px;height:4px;overflow:hidden;margin-bottom:0.35rem;">
                            <div style="height:100%;background:${statusColor};width:${rate}%;border-radius:4px;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:0.72rem;">
                            <span style="color:#22c55e;font-weight:600;">✓ ${b.sent || 0}</span>
                            <span style="color:#ef4444;">✕ ${b.failed || 0}</span>
                            <span style="color:#6b7280;">${b.total || 0} всього</span>
                            <span style="color:${statusColor};font-weight:600;">${rate}%</span>
                        </div>
                        ${b.status === 'cancelled' ? '<div style="font-size:0.68rem;color:#f97316;margin-top:3px;">⏹ Зупинено вручну</div>' : ''}
                    </div>`;
                }).join('')}
        </div>
    </div>`;

    // Preview одразу після рендеру
    bcastPreview();
}

// ─────────────────────────────────────────
// PREVIEW аудиторії (завантажуємо count з Firestore)
// ─────────────────────────────────────────
window.bcastPreview = async function() {
    const box = document.getElementById('bcastPreviewBox');
    if (!box) return;

    const channel = document.getElementById('bcastChannel')?.value || '';
    const flowId  = document.getElementById('bcastFlow')?.value || '';
    const niche   = document.getElementById('bcastNiche')?.value || '';
    const tag     = document.getElementById('bcastTag')?.value || '';

    try {
        let q = window.companyCol('contacts')
            .where('botStatus', '!=', 'blocked');

        // Firestore дозволяє один inequality filter — решта фільтруємо на клієнті
        // Тому робимо простий count query з основним фільтром
        if (channel) q = q.where('channel', '==', channel);
        if (flowId)  q = q.where('flowId', '==', flowId);

        const snap = await q.limit(1000).get();
        let count = snap.size;

        // Додаткова фільтрація на клієнті
        if (niche || tag) {
            count = snap.docs.filter(d => {
                const data = d.data();
                if (niche && data.business_type !== niche) return false;
                if (tag && !(data.tags || []).includes(tag)) return false;
                return true;
            }).length;
        }

        box.style.display = '';
        const parts = [];
        if (channel) parts.push(channel);
        if (niche) parts.push(niche);
        if (tag) parts.push(`#${tag}`);
        if (flowId) parts.push(bp.flows.find(f => f.id === flowId)?.name || flowId);

        box.innerHTML = `
            <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> <b>${count}</b> контактів отримають розсилку
            ${parts.length ? `· <span style="font-weight:400;color:#16a34a;">${parts.join(' · ')}</span>` : ''}
            ${count === 1000 ? '<span style="color:#f97316;"> (показано перші 1000)</span>' : ''}`;
    } catch(e) {
        box.style.display = '';
        box.innerHTML = `<span style="color:#9ca3af;">Не вдалось порахувати аудиторію</span>`;
    }
};

window.bcastCountChars = function(val) {
    const el = document.getElementById('bcastCharCount');
    if (el) {
        const len = val.length;
        el.textContent = `${len} / 4096`;
        el.style.color = len > 3800 ? '#ef4444' : '#9ca3af';
    }
};

// ─────────────────────────────────────────
// ОСНОВНА ФУНКЦІЯ ВІДПРАВКИ
// ─────────────────────────────────────────
window.bpSendBroadcast = async function() {
    if (bcast.running) return; // prevent double-send
    const text    = document.getElementById('bcastText')?.value.trim();
    const flowSendId = document.getElementById('bcastFlowSend')?.value;
    const channel = document.getElementById('bcastChannel')?.value || '';
    const flowId  = document.getElementById('bcastFlow')?.value || '';
    const niche   = document.getElementById('bcastNiche')?.value || '';
    const tag     = document.getElementById('bcastTag')?.value || '';

    if (!text && !flowSendId) { if(window.showToast)showToast(window.t('botsEnterTextOrFlow'),'warning'); else alert(window.t('botsEnterTextOrFlow')); return; }

    // FIX: Обгорнуто в try/catch для обробки async помилок
    try {
        // BUG FIX: прибрали .where('botStatus','!=','blocked') — потребує composite index
        // Тепер фільтруємо client-side (blocked = мало, не критично для продуктивності)
        // BUG FIX 2: limit підвищено до 3000 + попередження якщо досягнуто
        const BCAST_LIMIT = 3000;
        let q = window.companyCol('contacts');

        // Додаємо server-side фільтри тільки де є прості індекси
        if (channel) q = q.where('channel', '==', channel);
        else if (flowId) q = q.where('flowId', '==', flowId); // не можна поєднувати без index
        q = q.limit(BCAST_LIMIT);

        const snap = await q.get();
        if (snap.size >= BCAST_LIMIT) {
            if (window.showToast) showToast(`⚠️ Показано перші ${BCAST_LIMIT} контактів. Використовуйте фільтри для звуження аудиторії.`, 'warning');
        }

        let targets = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Фільтрація на клієнті
        targets = targets.filter(ct => ct.botStatus !== 'blocked'); // виключаємо заблокованих
        if (channel && flowId) targets = targets.filter(ct => ct.flowId === flowId); // якщо обидва фільтри
        else if (!channel && flowId) { /* вже в query */ }
        if (niche) targets = targets.filter(ct => ct.business_type === niche);
        if (tag)   targets = targets.filter(ct => (ct.tags || []).includes(tag));

        // Тільки Telegram (поки)
        targets = targets.filter(ct => ct.channel === 'telegram' || ct.source === 'telegram');

    if (targets.length === 0) { if(window.showToast)showToast(window.t('botsNoBroadcastContacts'),'warning'); else alert(window.t('botsNoBroadcastContacts')); return; }

    // BUG FIX: попереджаємо про тривалість і необхідність не закривати вкладку
    const _bcastMins = Math.ceil(targets.length / 25 / 60);
    const _bcastMsg = targets.length > 100
        ? `Надіслати розсилку ${targets.length} контактам?\n\n⚠️ Орієнтовний час: ~${_bcastMins} хв.\nНЕ закривайте вкладку до завершення!`
        : `Надіслати розсилку ${targets.length} контактам?`;
    if (!(await (window.showConfirmModal ? showConfirmModal(_bcastMsg) : Promise.resolve(confirm(_bcastMsg))))) return;

    // Отримуємо токен бота
    const compDoc = await         window.companyRef().get();
    const botToken = compDoc.data()?.integrations?.telegram?.botToken
        || bp.bots.find(b => b.channel === 'telegram')?.token;

    if (!botToken) { if(window.showToast)showToast(window.t('botsNoToken'),'warning'); else alert(window.t('botsNoToken')); return; }

    // ── Запускаємо відправку ──
    bcast.running   = true;
    bcast.cancelled = false;
    bcast.sent      = 0;
    bcast.failed    = 0;
    bcast.total     = targets.length;

    // Показуємо прогрес, ховаємо форму
    const sendBtn  = document.getElementById('bcastSendBtn');
    const progress = document.getElementById('bcastProgress');
    if (sendBtn)  sendBtn.style.display = 'none';
    if (progress) progress.style.display = '';

    document.getElementById('bcastStatTotal').textContent = targets.length;

    // Зберігаємо broadcast запис зі статусом 'running'
    const broadcastRef = await         window.companyRef().collection(window.DB_COLS.BROADCASTS)
        .add({
            text: text || '',
            flowSendId: flowSendId || null,
            flowSendName: bp.flows.find(f => f.id === flowSendId)?.name || '',
            segment: [channel, niche, tag ? '#'+tag : '', bp.flows.find(f=>f.id===flowId)?.name||''].filter(Boolean).join(' · ') || window.t('botsBroadcastAll'),
            channel: channel || 'all',
            flowId: flowId || null,
            niche: niche || null,
            tag: tag || null,
            total: targets.length,
            sent: 0, failed: 0,
            status: 'running',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

    // ── Rate-limited loop: 25 msg/sec ──
    // Пакети по 25 з паузою 1000мс між пакетами = рівно 25/сек
    const BATCH_SIZE = 25;
    const BATCH_DELAY = 1000; // ms між пакетами

    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
        if (bcast.cancelled) break;

        const batch = targets.slice(i, i + BATCH_SIZE);

        // Відправляємо пакет паралельно з затримкою 40мс між повідомленнями
        for (let j = 0; j < batch.length; j++) {
            if (bcast.cancelled) break;

            const ct = batch[j];
            const telegramId = ct.senderId || ct.externalId?.replace('telegram_', '');
            if (!telegramId) { bcast.failed++; continue; }

            // Затримка 40мс між кожним (25/сек)
            if (j > 0) await new Promise(r => setTimeout(r, 40));

            try {
                const ctChannel = ct.channel || 'telegram';
                const senderId = ct.senderId || ct.externalId?.replace('telegram_', '');
                if (!senderId) { bcast.failed++; continue; }

                let sendOk = false;

                if (ctChannel === 'telegram') {
                    // Telegram
                    const res = await _tgFetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: senderId,
                            text: text || 'Повідомлення від бота',
                            parse_mode: 'Markdown',
                        }),
                    });
                    const data = await res.json();
                    if (data.ok) {
                        sendOk = true;
                    } else {
                        if (data.error_code === 403) {
                            window.companyRef().collection('contacts').doc(ct.id)
                                .update({ botStatus: 'blocked' }).catch(() => {});
                        }
                        if (data.error_code === 429) {
                            const wait = (data.parameters?.retry_after || 5) * 1000;
                            await new Promise(r => setTimeout(r, wait));
                        }
                    }
                } else if (ctChannel === 'viber') {
                    // Viber — через webhook API
                    const viberToken = bp.bots.find(b => b.channel === 'viber')?.token;
                    if (viberToken) {
                        const res = await _tgFetch('https://chatapi.viber.com/pa/send_message', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-Viber-Auth-Token': viberToken },
                            body: JSON.stringify({
                                receiver: senderId,
                                type: 'text',
                                text: text || 'Повідомлення від бота',
                            }),
                        });
                        const data = await res.json();
                        sendOk = data.status === 0;
                    }
                }
                // Instagram — через Graph API (потребує окремого налаштування)

                if (sendOk) bcast.sent++;
                else bcast.failed++;
            } catch(e) { bcast.failed++; console.warn('[broadcast]', e.message); }

            // Оновлюємо прогрес UI
            const done = bcast.sent + bcast.failed;
            const pct = Math.round(done / bcast.total * 100);
            const bar = document.getElementById('bcastProgressBar');
            const txt = document.getElementById('bcastProgressText');
            const pctEl = document.getElementById('bcastProgressPercent');
            if (bar) bar.style.width = pct + '%';
            if (txt) txt.textContent = `${done} з ${bcast.total}`;
            if (pctEl) pctEl.textContent = pct + '%';
            document.getElementById('bcastStatSentNum').textContent = bcast.sent;
            document.getElementById('bcastStatFailedNum').textContent = bcast.failed;
        }

        // Пауза між пакетами (якщо не останній)
        if (i + BATCH_SIZE < targets.length && !bcast.cancelled) {
            await new Promise(r => setTimeout(r, BATCH_DELAY));
        }
    }

    // ── Завершення ──
    bcast.running = false;
    const finalStatus = bcast.cancelled ? 'cancelled' : 'done';

    // Оновлюємо запис в Firestore
    await broadcastRef.update({
        sent: bcast.sent,
        failed: bcast.failed,
        status: finalStatus,
        finishedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // UI feedback
    const progressDiv = document.getElementById('bcastProgress');
    if (progressDiv) {
        progressDiv.innerHTML = `
            <div style="text-align:center;padding:0.5rem;">
                <div style="font-size:1.5rem;margin-bottom:0.3rem;">${bcast.cancelled ? '⏹' : '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>'}</div>
                <div style="font-weight:700;font-size:0.92rem;">
                    ${bcast.cancelled ? window.t('botsStopped') : window.t('botsBroadcastDone')}
                </div>
                <div style="font-size:0.8rem;color:#6b7280;margin-top:4px;">
                    Надіслано: <b style="color:#22c55e;">${bcast.sent}</b>
                    · Помилок: <b style="color:#ef4444;">${bcast.failed}</b>
                    · Всього: ${bcast.total}
                </div>
                <button onclick="renderBroadcastTab()"
                    style="margin-top:0.75rem;padding:0.45rem 1.25rem;background:#22c55e;color:white;
                    border:none;border-radius:9px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                    Нова розсилка
                </button>
            </div>`;
    }

        if (typeof showToast === 'function') {
            showToast(`${bcast.cancelled ? window.t('botsStopped') : window.t('onbDone')}: ${bcast.sent} надіслано, ${bcast.failed} помилок`, 'success');
        }
    } catch (e) {
        // FIX: Обробка async помилок
        console.error('[83-bots-contacts] bpSendBroadcast error:', e);
        bcast.running = false;
        if (typeof showToast === 'function') {
            showToast('Помилка розсилки: ' + e.message, 'error');
        } else {
            alert('Помилка розсилки: ' + e.message);
        }
        // Повертаємо UI в початковий стан
        const sendBtn = document.getElementById('bcastSendBtn');
        const progress = document.getElementById('bcastProgress');
        if (sendBtn) sendBtn.style.display = '';
        if (progress) progress.style.display = 'none';
    }
};

// ─────────────────────────────────────────
// СКАСУВАННЯ
// ─────────────────────────────────────────
window.bcastCancel = async function() {
    if (!bcast.running) return;
    if (!(await (window.showConfirmModal ? showConfirmModal(window.t('botsStopBroadcast'),{danger:true}) : Promise.resolve(confirm(window.t('botsStopBroadcast')))))) return;
    bcast.cancelled = true;
};

// ══════════════════════════════════════════════════════════
// 8. НАЛАШТУВАННЯ БОТА
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// 8. НАЛАШТУВАННЯ БОТА — повна реалізація
// Секції: Інфо бота → Webhook → Токен → AI ключ → Сповіщення → Danger zone
// ══════════════════════════════════════════════════════════
async function renderSettingsTab() {
    const c = document.getElementById('bpViewSettings');
    if (!c) return;
    const bot = bp.bots.find(b => b.id === bp.activeBotId);
    if (!bot) {
        c.innerHTML = `
            <div style="text-align:center;padding:3rem;background:white;border-radius:14px;">
                <div style="color:#9ca3af;font-size:0.85rem;">Оберіть бота щоб відкрити налаштування</div>
                <button onclick="bpSwitch('bots')"
                    style="margin-top:1rem;padding:0.5rem 1.25rem;background:#22c55e;color:white;
                    border:none;border-radius:9px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                    ← До списку ботів
                </button>
            </div>`;
        return;
    }

    const compDoc = await         window.companyRef().get();
    const compData = compDoc.data() || {};
    const webhookUrl = `https://europe-west1-task-manager-44e84.cloudfunctions.net/telegramWebhook`;

    const sectionStyle = 'background:white;border-radius:14px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);';
    const labelStyle = 'font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.4rem;';
    const inputStyle = 'width:100%;padding:0.5rem 0.6rem;border:1.5px solid #e5e7eb;border-radius:9px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;outline:none;';
    const btnGreenStyle = 'padding:0.48rem 0.85rem;background:#22c55e;color:white;border:none;border-radius:9px;cursor:pointer;font-size:0.8rem;font-weight:700;white-space:nowrap;';
    const btnGrayStyle = 'padding:0.48rem 0.85rem;background:#f9fafb;color:#374151;border:1.5px solid #e5e7eb;border-radius:9px;cursor:pointer;font-size:0.8rem;font-weight:600;white-space:nowrap;';

    const channelIcon = {
        telegram:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" stroke="none"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>',
        instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e1306c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
        whatsapp:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>',
    }[bot.channel] || '';

    const notifyTg = compData.notifyTelegramId || '';
    const notifyEnabled = compData.notifyEnabled !== false;

    c.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.75rem;max-width:560px;">

        <!-- Секція 1: Інформація про бота -->
        <div style="${sectionStyle}">
            <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.85rem;">
                ${channelIcon}
                <div>
                    <div style="font-weight:700;font-size:0.92rem;">${escH(bot.name)}</div>
                    <div style="font-size:0.72rem;color:#6b7280;">
                        @${escH(bot.username || '—')} · ${bot.channel}
                        · <span style="color:${bot.connected?'#22c55e':'#ef4444'};font-weight:600;">
                            ${bot.connected ? window.t('botsConnectedBadge') : window.t('botsNotConnectedBadge')}
                        </span>
                    </div>
                </div>
                <button onclick="bpCheckBotStatus('${bot.id}')" id="btnCheckStatus"
                    style="${btnGrayStyle}margin-left:auto;">
                    Перевірити
                </button>
            </div>
            <div id="settingsStatusResult"></div>
        </div>

        <!-- Секція 2: Webhook URL -->
        <div style="${sectionStyle}">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.75rem;">
                <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span> Webhook URL
            </div>
            <label style="${labelStyle}">URL ДЛЯ TELEGRAM WEBHOOK</label>
            <div style="display:flex;gap:0.4rem;margin-bottom:0.5rem;">
                <input readonly value="${escH(webhookUrl)}"
                    style="${inputStyle}background:#f9fafb;color:#374151;font-size:0.74rem;cursor:text;"
                    onclick="this.select()">
                <button onclick="copyLink('${escH(webhookUrl)}')" style="${btnGrayStyle}">
                    Копіювати
                </button>
            </div>
            <div style="font-size:0.72rem;color:#6b7280;">
                Цей URL вже встановлений автоматично при підключенні бота.
                Якщо webhook перестав працювати — натисніть window.t('botsReinstall').
            </div>
            <button onclick="bpReinstallWebhook('${bot.id}')" id="btnReinstall"
                style="margin-top:0.6rem;${btnGreenStyle}">
                ↺ Перевстановити webhook
            </button>
            <div id="webhookResult" style="margin-top:0.5rem;font-size:0.76rem;"></div>
        </div>

        <!-- Секція 3: Токен бота -->
        <div style="${sectionStyle}">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.75rem;">
                <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg></span> Токен бота
            </div>
            <label style="${labelStyle}">ПОТОЧНИЙ ТОКЕН</label>
            <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.75rem;">
                <div style="flex:1;padding:0.5rem 0.6rem;background:#f9fafb;border:1.5px solid #e5e7eb;
                    border-radius:9px;font-size:0.78rem;color:#6b7280;font-family:monospace;">
                    ${bot.token ? '•••••••••' + bot.token.slice(-8) : window.t('botsNotSet')}
                </div>
            </div>
            <label style="${labelStyle}">ЗАМІНИТИ ТОКЕН</label>
            <div style="display:flex;gap:0.4rem;">
                <input type="password" id="bpSettingsToken"
                    placeholder=window.t('botsNewTokenPh')
                    style="${inputStyle}flex:1;">
                <button onclick="bpReconnectBot('${bot.id}')" style="${btnGreenStyle}">
                    Замінити
                </button>
            </div>
            <div style="font-size:0.71rem;color:#9ca3af;margin-top:0.35rem;">
                Токен не починається з бота — він потрібен тільки серверу. Нікому не передавай.
            </div>
        </div>

        <!-- Секція 4: AI ключ -->
        <div style="${sectionStyle}">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.75rem;">
                <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg></span> OpenAI / Claude API ключ
            </div>
            <label style="${labelStyle}">OPENAI (GPT-4o-mini, GPT-4o)</label>
            <div style="display:flex;gap:0.4rem;margin-bottom:0.75rem;">
                <input type="password" id="settingsOpenAIKey"
                    value="${compData.openaiApiKey ? '•••••' + compData.openaiApiKey.slice(-4) : ''}"
                    placeholder="sk-..."
                    style="${inputStyle}flex:1;">
                <button onclick="settingsSaveApiKey('openai')" style="${btnGreenStyle}">
                    Зберегти
                </button>
            </div>
            <label style="${labelStyle}">ANTHROPIC CLAUDE (claude-3-5-haiku)</label>
            <div style="display:flex;gap:0.4rem;">
                <input type="password" id="settingsAnthropicKey"
                    value="${compData.anthropicApiKey ? '•••••' + compData.anthropicApiKey.slice(-4) : ''}"
                    placeholder="sk-ant-..."
                    style="${inputStyle}flex:1;">
                <button onclick="settingsSaveApiKey('anthropic')" style="${btnGreenStyle}">
                    Зберегти
                </button>
            </div>
            <div id="apiKeyResult" style="margin-top:0.4rem;font-size:0.76rem;"></div>
        </div>

        <!-- Секція 5: Сповіщення менеджеру -->
        <div style="${sectionStyle}">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.75rem;">
                <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span> Сповіщення менеджеру
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
                <div>
                    <div style="font-size:0.82rem;font-weight:600;">Telegram сповіщення</div>
                    <div style="font-size:0.72rem;color:#6b7280;">Отримувати сповіщення при новому ліді</div>
                </div>
                <label style="position:relative;display:inline-block;width:42px;height:24px;cursor:pointer;">
                    <input type="checkbox" id="settingsNotifyEnabled"
                        ${notifyEnabled ? 'checked' : ''}
                        onchange="settingsToggleNotify(this.checked)"
                        style="opacity:0;width:0;height:0;">
                    <span style="position:absolute;inset:0;background:${notifyEnabled?'#22c55e':'#d1d5db'};
                        border-radius:24px;transition:0.2s;" id="settingsNotifyTrack"></span>
                    <span style="position:absolute;left:${notifyEnabled?'20':'2'}px;top:2px;
                        width:20px;height:20px;background:white;border-radius:50%;
                        transition:0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);" id="settingsNotifyThumb"></span>
                </label>
            </div>
            <label style="${labelStyle}">TELEGRAM ID МЕНЕДЖЕРА</label>
            <div style="display:flex;gap:0.4rem;margin-bottom:0.35rem;">
                <input id="settingsNotifyTgId" type="text"
                    value="${escH(notifyTg)}"
                    placeholder=window.t('botsExampleChatId')
                    style="${inputStyle}flex:1;">
                <button onclick="settingsSaveNotify()" style="${btnGreenStyle}">
                    Зберегти
                </button>
            </div>
            <div style="font-size:0.71rem;color:#6b7280;">
                Щоб дізнатись свій Telegram ID — напиши боту @userinfobot
            </div>
            <div id="notifyResult" style="margin-top:0.4rem;font-size:0.76rem;"></div>
        </div>

        <!-- Секція 6: Небезпечна зона -->
        <div style="${sectionStyle}border:1.5px solid #fee2e2;">
            <div style="font-weight:700;font-size:0.85rem;color:#ef4444;margin-bottom:0.6rem;">
                ⚠️ Небезпечна зона
            </div>
            <div style="font-size:0.78rem;color:#6b7280;margin-bottom:0.75rem;">
                Видалення бота видалить також усі його ланцюги. Контакти і переписка збережуться.
            </div>
            <button onclick="confirmDeleteBot('${bot.id}')"
                style="padding:0.5rem 1rem;background:#fee2e2;color:#ef4444;
                border:1.5px solid #fecaca;border-radius:9px;cursor:pointer;
                font-size:0.82rem;font-weight:600;">
                Видалити бота і ланцюги
            </button>
        </div>

    </div>`;
}

// ─────────────────────────────────────────
// Перевірити статус бота
// ─────────────────────────────────────────
window.bpCheckBotStatus = async function(botId) {
    const btn = document.getElementById('btnCheckStatus');
    const result = document.getElementById('settingsStatusResult');
    if (btn) { btn.textContent = '...'; btn.disabled = true; }

    const bot = bp.bots.find(b => b.id === botId);
    if (!bot?.token) {
        if (result) result.innerHTML = `<div style="color:#ef4444;font-size:0.78rem;">Токен не встановлений</div>`;
        if (btn) { btn.textContent = window.t('botsCheck'); btn.disabled = false; }
        return;
    }

    try {
        // Перевіряємо бота через Telegram
        const meRes = await _tgFetch(`https://api.telegram.org/bot${bot.token}/getMe`);
        const me = await meRes.json();

        // Перевіряємо webhook
        const whRes = await _tgFetch(`https://api.telegram.org/bot${bot.token}/getWebhookInfo`);
        const wh = await whRes.json();
        const whInfo = wh.result || {};

        if (result) result.innerHTML = `
            <div style="background:#f0fdf4;border-radius:10px;padding:0.65rem;border:1px solid #bbf7d0;">
                <div style="font-size:0.78rem;display:flex;flex-direction:column;gap:4px;">
                    <div><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> Бот: <b>@${me.result?.username || '—'}</b> (${me.result?.first_name || ''})</div>
                    <div style="color:${whInfo.url ? '#16a34a' : '#ef4444'};">
                        ${whInfo.url ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>' : '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>'} Webhook: ${whInfo.url ? window.t('botsIsSet') : window.t('botsNotSetShort')}
                    </div>
                    ${whInfo.last_error_message ? `<div style="color:#ef4444;">⚠️ Остання помилка: ${escH(whInfo.last_error_message)}</div>` : ''}
                    <div style="color:#6b7280;">Очікуваних оновлень: ${whInfo.pending_update_count || 0}</div>
                </div>
            </div>`;

        // Оновлюємо статус в Firestore якщо змінився
        if (me.ok && !bot.connected) {
            await firebase.firestore()
                .doc(window.currentCompanyId + '/bots/' + botId)
                .update({ connected: true, username: me.result.username });
        }

    } catch(e) {
        if (result) result.innerHTML = `<div style="color:#ef4444;font-size:0.78rem;">Помилка: ${escH(e.message)}</div>`;
    }

    if (btn) { btn.textContent = window.t('botsCheck'); btn.disabled = false; }
};

// ─────────────────────────────────────────
// Перевстановити webhook
// ─────────────────────────────────────────
window.bpReinstallWebhook = async function(botId) {
    const btn = document.getElementById('btnReinstall');
    const result = document.getElementById('webhookResult');
    if (btn) { btn.textContent = '...'; btn.disabled = true; }

    const bot = bp.bots.find(b => b.id === botId);
    if (!bot?.token) {
        if (result) result.innerHTML = `<div style="color:#ef4444;">Спочатку введіть токен</div>`;
        if (btn) { btn.textContent = window.t('botsReinstallWebhook'); btn.disabled = false; }
        return;
    }

    try {
        const webhookUrl = `https://europe-west1-task-manager-44e84.cloudfunctions.net/telegramWebhook`;
        const res = await _tgFetch(`https://api.telegram.org/bot${bot.token}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
        });
        const data = await res.json();

        if (data.ok) {
            await firebase.firestore()
                .doc(window.currentCompanyId + '/bots/' + botId)
                .update({ connected: true, webhookUrl, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (result) result.innerHTML = `<div style="color:#22c55e;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> Webhook встановлено</div>`;
            if (typeof showToast === 'function') showToast(window.t('botsWebhookSet'), 'success');
        } else {
            throw new Error(data.description);
        }
    } catch(e) {
        if (result) result.innerHTML = `<div style="color:#ef4444;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span> ${escH(e.message)}</div>`;
    }

    if (btn) { btn.textContent = window.t('botsReinstallWebhook'); btn.disabled = false; }
};

// ─────────────────────────────────────────
// Замінити токен і перепідключити
// ─────────────────────────────────────────
window.bpReconnectBot = async function(botId) {
    const token = document.getElementById('bpSettingsToken')?.value.trim();
    if (!token || token.includes('•')) { if(window.showToast)showToast(window.t('botsNewToken'),'warning'); else alert(window.t('botsNewToken')); return; }

    try {
        const meRes = await _tgFetch(`https://api.telegram.org/bot${token}/getMe`);
        const me = await meRes.json();
        if (!me.ok) throw new Error(me.description);

        const webhookUrl = `https://europe-west1-task-manager-44e84.cloudfunctions.net/telegramWebhook`;
        const whRes = await _tgFetch(`https://api.telegram.org/bot${token}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
        });
        const wh = await whRes.json();

        await firebase.firestore()
            .doc(window.currentCompanyId + '/bots/' + botId)
            .update({
                token, username: me.result.username,
                connected: wh.ok, webhookUrl,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

        // Оновлюємо в integrations для сумісності з webhook.js
        await window.companyRef().update({
            'integrations.telegram.botToken': token,
            'integrations.telegram.botName': me.result.username,
        });

        if (typeof showToast === 'function') showToast(`<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> Токен оновлено, @${me.result.username} підключено`, 'success');
        document.getElementById('bpSettingsToken').value = '';
        renderSettingsTab();
    } catch(e) { if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error'); }
};

// ─────────────────────────────────────────
// Зберегти API ключ
// ─────────────────────────────────────────
window.settingsSaveApiKey = window.saveBotApiKey = async function(type) {
    const keyEl = type === 'openai'
        ? document.getElementById('settingsOpenAIKey')
        : document.getElementById('settingsAnthropicKey');
    const key = keyEl?.value.trim();
    if (!key || key.includes('•')) { if(window.showToast)showToast(window.t('botsNewKey'),'warning'); else alert(window.t('botsNewKey')); return; }

    const result = document.getElementById('apiKeyResult');
    try {
        const field = type === 'openai' ? 'openaiApiKey' : 'anthropicApiKey';
        await             window.companyRef()
            .update({ [field]: key, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (keyEl) keyEl.value = '•••••' + key.slice(-4);
        if (result) result.innerHTML = `<span style="color:#22c55e;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> Збережено</span>`;
        setTimeout(() => { if (result) result.innerHTML = ''; }, 3000);
    } catch(e) {
        if (result) result.innerHTML = `<span style="color:#ef4444;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span> ${escH(e.message)}</span>`;
    }
};

// ─────────────────────────────────────────
// Сповіщення менеджеру
// ─────────────────────────────────────────
window.settingsToggleNotify = async function(enabled) {
    const track = document.getElementById('settingsNotifyTrack');
    const thumb = document.getElementById('settingsNotifyThumb');
    if (track) track.style.background = enabled ? '#22c55e' : '#d1d5db';
    if (thumb) thumb.style.left = enabled ? '20px' : '2px';
    await         window.companyRef()
        .update({ notifyEnabled: enabled });
};

window.settingsSaveNotify = async function() {
    const tgId = document.getElementById('settingsNotifyTgId')?.value.trim();
    const result = document.getElementById('notifyResult');
    try {
        await             window.companyRef()
            .update({ notifyTelegramId: tgId, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (result) result.innerHTML = `<span style="color:#22c55e;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> Збережено</span>`;
        setTimeout(() => { if (result) result.innerHTML = ''; }, 3000);
    } catch(e) {
        if (result) result.innerHTML = `<span style="color:#ef4444;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span> ${escH(e.message)}</span>`;
    }
};

// ── Helpers ────────────────────────────────────────────────
window.copyLink = function(link) {
    navigator.clipboard.writeText(link).then(()=>{ if(typeof showToast==='function') showToast(window.t('intgCopied'),'success'); });
};
window.showQR = function(encodedLink) {
    const link = decodeURIComponent(encodedLink);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
    document.body.insertAdjacentHTML('beforeend',`
        <div onclick="this.remove()" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10030;
            display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <div style="background:white;border-radius:16px;padding:1.5rem;text-align:center;max-width:260px;" onclick="event.stopPropagation()">
                <div style="font-weight:700;margin-bottom:1rem;">QR-код</div>
                <img src="${qrUrl}" style="width:200px;height:200px;border-radius:8px;">
                <div style="font-size:0.7rem;color:#6b7280;margin-top:0.6rem;word-break:break-all;">${link}</div>
                <button onclick="this.closest('[style*=fixed]').remove()"
                    style="margin-top:0.75rem;padding:0.45rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:600;">
                    Закрити
                </button>
            </div>
        </div>`);
};

function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function relTime(d) {
    const diff = Date.now()-d.getTime(), m=Math.floor(diff/60000);
    if(m<1) return window.t('botsJustNow'); if(m<60) return m+'хв';
    const h=Math.floor(m/60); if(h<24) return h+window.t('botsHour');
    return Math.floor(h/24)+'дн';
}

// ── Tab hook ───────────────────────────────────────────────
window.onSwitchTab && window.onSwitchTab('bots', function() {
    if (window.isFeatureEnabled?.('bots')) window.initBotsModule();
});

    // ── Register in TALKO namespace ──────────────────────────
    if (window.TALKO) {
        window.TALKO.bots = {
            init: window.initBotsModule,
            destroy: window.destroyBotsModule,
            openChat: window.bpOpenChat,
            sendMsg: window.bpSendMsg,
            switchTab: window.botsSwitchTab,
            filterContacts: window.bpFilterContacts,
            sendBroadcast: window.bpSendBroadcast,
        };
    }

})();

// FIX: helper з timeout для Telegram API (10s — публічний API)
async function _tgFetch(url, opts = {}) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
        return await fetch(url, { ...opts, signal: ctrl.signal });
    } finally { clearTimeout(timer); }
}
