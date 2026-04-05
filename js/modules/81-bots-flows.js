// 80-bots-flows.js — TALKO Flow Builder (Telegram Bots) v1.0
// UI для створення і управління ботами / flow-сценаріями
// ============================================================
(function () {
    'use strict';

    let botsFlows = [];
    let botsUnsubscribe = null;
    let botsCurrentFlowId = null;
    let botsCurrentBotId = null; // FIX: track botId for correct Firestore path
    let botsFlowNodes = [];
    let botsSelectedNodeId = null;
    let botsSubTab = 'list'; // list | editor | sessions
    let _loadingFlowId = null; // FIX: race condition guard for openFlowEditor

    // ── Init ───────────────────────────────────────────────
    window.initBotsModule = async function () {
        if (!window.currentCompanyId) return;
        renderBotsShell();
        await loadBotsData();
    };

    function renderBotsShell() {
        const container = document.getElementById('botsContainer');
        if (!container) return;
        container.innerHTML = `
            <div id="botsModule" style="padding:0.75rem;">
                <div style="display:flex;gap:0.5rem;margin-bottom:1rem;background:white;border-radius:12px;padding:0.4rem;box-shadow:var(--shadow);">
                    <button onclick="botsSwitchTab('list')" id="botsTabList"
                        style="flex:1;padding:0.5rem;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;background:#22c55e;color:white;transition:all 0.2s;">
                        <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span> Боти
                    </button>
                    <button onclick="botsSwitchTab('sessions')" id="botsTabSessions"
                        style="flex:1;padding:0.5rem;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;background:transparent;color:#525252;transition:all 0.2s;">
                        <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span> Сесії
                    </button>
                    <button onclick="botsSwitchTab('settings')" id="botsTabSettings"
                        style="flex:1;padding:0.5rem;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;background:transparent;color:#525252;transition:all 0.2s;">
                        <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span>️ Налаштування
                    </button>
                </div>
                <div id="botsListView"></div>
                <div id="botsSessionsView" style="display:none;"></div>
                <div id="botsSettingsView" style="display:none;"></div>
            </div>`;
        if (window.lucide) lucide.createIcons();
    }

    window.botsSwitchTab = function (tab) {
        botsSubTab = tab;
        ['list','sessions','settings'].forEach(t => {
            const btn = document.getElementById('botsTab' + t.charAt(0).toUpperCase() + t.slice(1));
            const view = document.getElementById('bots' + t.charAt(0).toUpperCase() + t.slice(1) + 'View');
            if (btn) { btn.style.background = t === tab ? '#22c55e' : 'transparent'; btn.style.color = t === tab ? 'white' : '#525252'; }
            if (view) view.style.display = t === tab ? '' : 'none';
        });
        if (tab === 'list') renderBotsListView();
        if (tab === 'sessions') renderBotsSessionsView();
        if (tab === 'settings') renderBotsSettingsView();
        if (window.lucide) lucide.createIcons();
    };

    // ── Data ───────────────────────────────────────────────
    async function loadBotsData() {
        if (!window.currentCompanyId) return;
        const base = firebase.firestore().collection('companies').doc(window.currentCompanyId);
        if (botsUnsubscribe) botsUnsubscribe();

        // FIX: спочатку знаходимо бот документ, потім читаємо flows з правильного шляху
        try {
            const botsSnap = await base.collection('bots').limit(5).get();
            if (!botsSnap.empty) {
                botsCurrentBotId = botsSnap.docs[0].id;
                window._currentBotId = botsCurrentBotId;
                botsUnsubscribe = base.collection('bots').doc(botsCurrentBotId).collection('flows')
                    .orderBy('createdAt', 'desc').limit(100)
                    .onSnapshot(snap => {
                        botsFlows = snap.docs.map(d => ({ id: d.id, botId: botsCurrentBotId, ...d.data() }));
                        if (botsSubTab === 'list') renderBotsListView();
                    }, err => {
                        console.error('[Bots] flows onSnapshot error:', err.code, err.message);
                    });
            } else {
                // Fallback: старий плоский шлях
                botsUnsubscribe = base.collection('flows')
                    .orderBy('createdAt', 'desc').limit(100)
                    .onSnapshot(snap => {
                        botsFlows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        if (botsSubTab === 'list') renderBotsListView();
                    });
            }
        } catch(e) {
            console.error('[loadBotsData]', e);
        }
    }

    // ── List View ──────────────────────────────────────────
    function renderBotsListView() {
        const container = document.getElementById('botsListView');
        if (!container || botsSubTab !== 'list') return;

        const channelIcons = { telegram: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-1 1-.1.4.1.9.4 1.2l4 4L4 15l-2 1 1 2 2-1 3.8 1.2 4 4c.3.3.8.5 1.2.4.5-.1.9-.5 1-1z"/></svg></span>', instagram: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="15" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M8 6V4h8v2"/></svg></span>', whatsapp: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>', web: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>' };
        const statusColors = { active: '#22c55e', draft: '#9ca3af', paused: '#f97316' };

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
                <div>
                    <div style="font-weight:700;font-size:1rem;">Чат-боти</div>
                    <div style="font-size:0.78rem;color:#6b7280;">${botsFlows.length} ''</div>
                </div>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button onclick="openFlowTemplatesModal()" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1rem;background:#ede9fe;color:#7c3aed;border:1px solid #c4b5fd;border-radius:10px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                        📋 Шаблони
                    </button>
                    <button onclick="openCreateFlowModal()" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1rem;background:#22c55e;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                        + Новий бот
                    </button>
                </div>
            </div>

            ${botsFlows.length === 0 ? `
                <div style="text-align:center;padding:3rem;background:white;border-radius:12px;box-shadow:var(--shadow);">
                    <div style="font-size:2.5rem;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span></div>
                    <div style="font-weight:600;margin-bottom:0.4rem;">''</div>
                    <div style="font-size:0.85rem;color:#6b7280;margin-bottom:1rem;">''автоматичні сценарії</div>
                    <button onclick="openCreateFlowModal()" style="padding:0.6rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;">+ Створити бота</button>
                </div>` : `
                <div style="display:flex;flex-direction:column;gap:0.75rem;">
                    ${botsFlows.map(flow => `
                        <div style="background:white;border-radius:14px;padding:1.1rem 1.25rem;box-shadow:0 1px 4px rgba(0,0,0,0.08);border-left:4px solid ${statusColors[flow.status] || '#9ca3af'};transition:box-shadow 0.2s;">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
                                <div style="flex:1;min-width:0;">
                                    <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.35rem;flex-wrap:wrap;">
                                        <span style="font-size:1.2rem;">${channelIcons[flow.channel] || '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></span>'}</span>
                                        <span style="font-weight:700;font-size:1rem;color:#111827;">${escH(flow.name)}</span>
                                        <span style="font-size:0.72rem;background:${statusColors[flow.status] || '#9ca3af'}20;color:${statusColors[flow.status] || '#9ca3af'};padding:0.2rem 0.6rem;border-radius:20px;font-weight:700;letter-spacing:0.02em;">
                                            ${flow.status === 'active' ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> active' : flow.status === 'paused' ? '⏸ paused' : '⚫ draft'}
                                        </span>
                                    </div>
                                    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
                                        <span style="font-size:0.78rem;color:#6b7280;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg></span> ${flow.channel || 'telegram'}</span>
                                        <span style="font-size:0.78rem;color:#6b7280;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,1 11,6 6,11 1,6" fill="#3b82f6"/></svg></span> ${(flow.nodes || []).length} вузлів</span>
                                        <span style="font-size:0.78rem;color:#6b7280;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> ${flow.sessionCount || 0} сесій</span>
                                        ${flow.triggerKeyword ? `<span style="font-size:0.78rem;color:#6b7280;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg></span> <code style="background:#f3f4f6;padding:1px 5px;border-radius:4px;font-size:0.75rem;">${escH(flow.triggerKeyword)}</code></span>` : ''}
                                    </div>
                                    ${flow.deepLink || flow.slug ? `<div style="margin-top:0.5rem;display:flex;align-items:center;gap:6px;"><div style="font-size:0.73rem;color:#9ca3af;word-break:break-all;flex:1;">${escH(flow.deepLink || flow.slug)}</div><button onclick="event.stopPropagation();navigator.clipboard.writeText('${escH(flow.deepLink || flow.slug)}').catch(()=>{})" style="font-size:0.7rem;padding:2px 7px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:5px;cursor:pointer;color:#374151;white-space:nowrap;">Копіювати</button></div>` : ''}
                                </div>
                                <div style="display:flex;gap:0.4rem;flex-shrink:0;">
                                    <button onclick="toggleFlowStatus('${flow.id}','${flow.status}')"
                                        title="${flow.status === 'active' ? window.t('botsPauseFlow') : window.t('botsActivateFlow')}"
                                        style="padding:0.45rem 0.75rem;background:${flow.status==='active'?'#fee2e2':'#f0fdf4'};color:${flow.status==='active'?'#ef4444':'#16a34a'};border:1.5px solid ${flow.status==='active'?'#fca5a5':'#86efac'};border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                                        ${flow.status === 'active' ? window.t('botsPauseLabel') : window.t('botsActivateLabel')}
                                    </button>
                                    <button onclick="openFlowEditor('${flow.id}')" title=${window.t('flowEdt2')}
                                        style="padding:0.45rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
                                        Редагувати
                                    </button>
                                    <button onclick="confirmDeleteFlow('${flow.id}')" title=${window.t('flowDel2')}
                                        style="padding:0.45rem 0.6rem;background:#fee2e2;color:#ef4444;border:1px solid #fca5a5;border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:700;letter-spacing:0.05em;">
                                        DEL
                                    </button>
                                </div>
                            </div>
                        </div>`).join('')}
                </div>`}
        `;
        if (window.lucide) lucide.createIcons();
    }

    window.toggleFlowStatus = async function (flowId, currentStatus) {
        try {
            const newStatus = currentStatus === 'active' ? 'paused' : 'active';
            const compRef = firebase.firestore().collection('companies').doc(window.currentCompanyId);
            // FIX: correct path
            const ref = botsCurrentBotId
                ? compRef.collection('bots').doc(botsCurrentBotId).collection('flows').doc(flowId)
                : compRef.collection('flows').doc(flowId);
            await ref.update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (typeof showToast === 'function') showToast(newStatus === 'active' ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span> Бота активовано' : window.t('botsBotPaused'), 'success');
        } catch (e) {
            console.error('[toggleFlowStatus]', e);
            if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
        }
    };

    window.confirmDeleteFlow = async function (flowId) {
        try {
            if (!(await (window.showConfirmModal ? showConfirmModal(window.t('botsDeleteBotConfirm'),{danger:true}) : Promise.resolve(confirm(window.t('botsDeleteBotConfirm')))))) return;
            const compRef = firebase.firestore().collection('companies').doc(window.currentCompanyId);
            // FIX: correct path
            const ref = botsCurrentBotId
                ? compRef.collection('bots').doc(botsCurrentBotId).collection('flows').doc(flowId)
                : compRef.collection('flows').doc(flowId);
            await ref.delete();
            if (typeof showToast === 'function') showToast(window.t('finDeleted'), 'success');
        } catch (e) {
            console.error('[confirmDeleteFlow]', e);
            if (typeof showToast === 'function') showToast('Помилка видалення: ' + e.message, 'error');
        }
    };

    // ── Create Flow Modal ──────────────────────────────────
    window.openCreateFlowModal = function () {
        const html = `
            <div id="botsCreateOverlay" onclick="if(event.target===this)this.remove()"
                style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;">
                <div style="background:white;border-radius:16px;width:100%;max-width:440px;box-shadow:0 24px 64px rgba(0,0,0,0.2);">
                    <div style="padding:1.25rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">
                        <div style="font-weight:700;">Новий бот</div>
                        <button onclick="document.getElementById('botsCreateOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                    </div>
                    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">НАЗВА БОТА *</label>
                            <input id="newFlowName" placeholder=${window.t('botsFlowEx')}
                                style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                        </div>
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">КАНАЛ</label>
                            <select id="newFlowChannel" style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
                                <option value="telegram"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-1 1-.1.4.1.9.4 1.2l4 4L4 15l-2 1 1 2 2-1 3.8 1.2 4 4c.3.3.8.5 1.2.4.5-.1.9-.5 1-1z"/></svg></span> Telegram</option>
                                <option value="instagram"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="15" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M8 6V4h8v2"/></svg></span> Instagram</option>
                                <option value="whatsapp"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span> WhatsApp</option>
                                <option value="web"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span> Web Widget</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">ТРИГЕР (ключове слово або /start)</label>
                            <input id="newFlowTrigger" placeholder=${window.t('botsTrigEx')}
                                style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                        </div>
                    </div>
                    <div style="padding:1rem 1.25rem;border-top:1px solid #f0f0f0;display:flex;gap:0.5rem;justify-content:flex-end;">
                        <button onclick="document.getElementById('botsCreateOverlay').remove()" style="padding:0.55rem 1rem;background:#f9fafb;color:#525252;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;">Скасувати</button>
                        <button onclick="saveNewFlow()" style="padding:0.55rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">✓ Створити</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('newFlowName')?.focus();
    };

    window.saveNewFlow = async function () {
        const name = document.getElementById('newFlowName')?.value.trim();
        if (!name) { if(window.showToast)showToast(window.t('botsEnterBotName'),'warning'); else alert(window.t('botsEnterBotName')); return; }
        try {
            const db = firebase.firestore();
            const compRef = db.collection('companies').doc(window.currentCompanyId);
            const channel = document.getElementById('newFlowChannel')?.value || 'telegram';

            // FIX: якщо немає botId — створюємо бот документ
            if (!botsCurrentBotId) {
                const botDoc = await compRef.collection('bots').add({
                    channel,
                    token: '',
                    status: 'active',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                botsCurrentBotId = botDoc.id;
                window._currentBotId = botsCurrentBotId;
            }

            const ref = await compRef.collection('bots').doc(botsCurrentBotId).collection('flows').add({
                name,
                channel,
                triggerKeyword: document.getElementById('newFlowTrigger')?.value.trim() || '/start',
                status: 'draft',
                nodes: [],
                sessionCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            document.getElementById('botsCreateOverlay')?.remove();
            if (typeof showToast === 'function') showToast(window.t('botsBotCreatedOk'), 'success');
            openFlowEditor(ref.id, botsCurrentBotId);
        } catch (err) { if(window.showToast)showToast(window.t('errPfx2') + err.message,'error'); else alert(window.t('errPfx2') + err.message); }
    };

    // ── Flow Node Editor (slide-in panel) ──────────────────
    window.openFlowEditor = async function (flowId, botId) {
        try {
            // FIX: race condition guard - якщо вже йде завантаження цього flow, skip
            if (_loadingFlowId === flowId) return;
            _loadingFlowId = flowId;

            botsFlowNodes = []; // FIX-4 (mobile): clear before load
            botsCurrentFlowId = flowId;
            botsSelectedNodeId = null;
            const resolvedBotId = botId || botsCurrentBotId || window._currentBotId || null;

            // FIX: читаємо з правильного шляху
            const db = firebase.firestore();
            const compRef = db.collection('companies').doc(window.currentCompanyId);
            let docSnap = null;
            if (resolvedBotId) {
                docSnap = await compRef.collection('bots').doc(resolvedBotId).collection('flows').doc(flowId).get();
            }
            if (!docSnap || !docSnap.exists) {
                // Fallback: плоский шлях
                docSnap = await compRef.collection('flows').doc(flowId).get();
            }
            if (!docSnap.exists) {
                _loadingFlowId = null;
                return;
            }

            // Перевіряємо що flowId не змінився під час async операції
            if (_loadingFlowId !== flowId) return;

            const flowData = { id: docSnap.id, ...docSnap.data() };
            botsFlowNodes = JSON.parse(JSON.stringify(flowData.nodes || []));

            window._currentBotId = resolvedBotId;
            openFlowCanvas(flowData.id, resolvedBotId);
        } catch (e) {
            console.error('[openFlowEditor]', e);
            if (typeof showToast === 'function') showToast('Помилка завантаження: ' + e.message, 'error');
        } finally {
            _loadingFlowId = null;
        }
    };

    function renderFlowEditorPanel(flowData) {
        document.getElementById('botsEditorOverlay')?.remove();
        const nodeTypes = [
            ['message',window.t('botsNodeMessage'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>'],
            ['question',window.t('botsNodeQuestion'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>'],
            ['buttons',window.t('botsNodeButtons'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="5" r="2" fill="currentColor"/></svg></span>'],
            ['condition',window.t('botsNodeCondition'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>'],
            ['ai',window.t('botsNodeAI'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span>'],
            ['photo','📷 Отримати фото','📷'],
            ['image_generate','🎨 AI Генерація','🎨'],
            ['crm_update','📋 Оновити угоду','📋'],
            ['http_request','🌐 HTTP запит','🌐'],
            ['delay',window.t('botsNodeDelay'),'⏳'],
            ['talko_task',window.t('botsNodeTask'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>'],
            ['talko_deal',window.t('botsNodeCRM'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg></span>'],
            ['tag',window.t('botsNodeTag'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>️'],
            ['human',window.t('botsNodeManager'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>'],
            ['end',window.t('botsNodeEnd'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></span>'],
        ];

        const html = `
            <div id="botsEditorOverlay"
                style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:stretch;justify-content:flex-end;">
                <div style="background:white;width:100%;max-width:720px;display:flex;flex-direction:column;overflow:hidden;box-shadow:-8px 0 32px rgba(0,0,0,0.15);">

                    <!-- Header -->
                    <div style="padding:1rem 1.25rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                        <div>
                            <div style="font-weight:700;font-size:1rem;">${escH(flowData.name)} <span style="font-size:0.75rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:2px 8px;color:#6b7280;font-weight:500;">${flowData.channel}</span></div>
                            <div style="font-size:0.78rem;color:#6b7280;margin-top:1px;">${botsFlowNodes.length} '': <code style="background:#f0fdf4;color:#16a34a;padding:1px 5px;border-radius:4px;">${escH(flowData.triggerKeyword || '/start')}</code></div>
                        </div>
                        <div style="display:flex;gap:0.5rem;">
                            <button onclick="saveFlowNodes()" style="padding:0.45rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></span> Зберегти</button>
                            <button onclick="document.getElementById('botsEditorOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                        </div>
                    </div>

                    <!-- Body: nodes list + editor -->
                    <div style="display:flex;flex:1;min-height:0;overflow:hidden;">

                        <!-- Nodes list -->
                        <div style="width:260px;flex-shrink:0;border-right:1px solid #f0f0f0;overflow-y:auto;padding:0.75rem;background:#f9fafb;display:flex;flex-direction:column;gap:0.75rem;">
                            <div>
                                <div style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;">ВУЗЛИ СЦЕНАРІЮ</div>
                                <div id="botsNodesList"></div>
                            </div>
                            <div>
                                <div style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;">ДОДАТИ ВУЗОЛ</div>
                                <div style="display:flex;flex-direction:column;gap:0.3rem;">
                                    ${nodeTypes.map(([type,label,icon]) => `
                                        <button onclick="addFlowNode('${type}')"
                                            style="text-align:left;padding:0.4rem 0.6rem;background:white;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;font-size:0.78rem;display:flex;align-items:center;gap:0.4rem;transition:background 0.15s;"
                                            onmouseenter="this.style.background='#f0fdf4'" onmouseleave="this.style.background='white'">
                                            <span style="font-size:0.85rem;">${icon}</span>${label}
                                        </button>`).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Node editor -->
                        <div style="flex:1;overflow-y:auto;padding:1rem;" id="botsNodeEditor">
                            <div style="text-align:center;padding:3rem 1rem;color:#9ca3af;">
                                <div style="margin-bottom:0.5rem;color:#9ca3af;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></div>
                                <div>''</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', html);
        renderBotsNodesList();
        if (window.lucide) lucide.createIcons();
    }

    // ── Nodes List ─────────────────────────────────────────
    function renderBotsNodesList() {
        const container = document.getElementById('botsNodesList');
        if (!container) return;
        const icons = { message:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>', question:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>', buttons:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="5" r="2" fill="currentColor"/></svg></span>', condition:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>', ai:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span>', delay:'⏳', talko_task:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>', talko_deal:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg></span>', tag:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>️', human:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>', end:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></span>' };

        if (botsFlowNodes.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:1rem;color:#9ca3af;font-size:0.8rem;">'+window.t('botsNoNodes')+'</div>';
            return;
        }

        container.innerHTML = botsFlowNodes.map((node, i) => `
            <div onclick="selectFlowNode('${node.id}')" data-node-id="${node.id}"
                style="padding:0.45rem 0.6rem;border-radius:7px;cursor:pointer;margin-bottom:0.25rem;background:${botsSelectedNodeId===node.id?'#f0fdf4':'white'};border:1px solid ${botsSelectedNodeId===node.id?'#22c55e':'#e5e7eb'};transition:all 0.15s;display:flex;align-items:center;gap:0.4rem;">
                <span style="font-size:0.82rem;">${icons[node.type]||'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>'}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.78rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escH(node.name||node.type)}</div>
                    <div style="font-size:0.68rem;color:#9ca3af;">${node.type}</div>
                </div>
                <div style="display:flex;flex-direction:column;">
                    ${i>0?`<button onclick="event.stopPropagation();moveNode('${node.id}',-1)" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.65rem;padding:1px;">▲</button>`:''}
                    ${i<botsFlowNodes.length-1?`<button onclick="event.stopPropagation();moveNode('${node.id}',1)" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.65rem;padding:1px;">▼</button>`:''}
                </div>
                <button onclick="event.stopPropagation();deleteFlowNode('${node.id}')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:0.72rem;padding:2px;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
            </div>`).join('');
    }

    window.addFlowNode = function (type) {
        const id = 'node_' + Date.now();
        const names = { message:window.t('botsNodeMessage'), question:window.t('botsNodeQuestion'), buttons:window.t('botsChoiceList'), condition:window.t('botsNodeCondition'), ai:'AI', delay:window.t('botsNodeDelay'), talko_task:window.t('botsChoiceTask'), talko_deal:'Угода', tag:window.t('botsChoiceTag'), human:window.t('botsChoiceManager'), end:window.t('botsNodeEnd') };
        botsFlowNodes.push({ id, type, name: names[type]||type, text:'', options:[], saveAs:null, condition:null, delay:0, taskTitle:'', dealTitle:'', tagName:'', aiPrompt:'', nextNode:null });
        renderBotsNodesList();
        selectFlowNode(id);
    };

    window.deleteFlowNode = async function (nodeId) {
        if (!(await (window.showConfirmModal ? showConfirmModal(window.t('botsDeleteNode'),{danger:true}) : Promise.resolve(confirm(window.t('botsDeleteNode')))))) return;
        botsFlowNodes = botsFlowNodes.filter(n => n.id !== nodeId);
        if (botsSelectedNodeId === nodeId) {
            botsSelectedNodeId = null;
            const ed = document.getElementById('botsNodeEditor');
            if (ed) ed.innerHTML = '<div style="text-align:center;padding:3rem;color:#9ca3af;">'+window.t('botsSelectNode')+'</div>';
        }
        renderBotsNodesList();
    };

    window.moveNode = function (nodeId, dir) {
        const idx = botsFlowNodes.findIndex(n => n.id === nodeId);
        if (idx < 0) return;
        const ni = idx + dir;
        if (ni < 0 || ni >= botsFlowNodes.length) return;
        [botsFlowNodes[idx], botsFlowNodes[ni]] = [botsFlowNodes[ni], botsFlowNodes[idx]];
        renderBotsNodesList();
    };

    window.selectFlowNode = function (nodeId) {
        botsSelectedNodeId = nodeId;
        renderBotsNodesList();
        renderNodeEditor(nodeId);
    };

    // ── Node Editor ────────────────────────────────────────
    function renderNodeEditor(nodeId) {
        const node = botsFlowNodes.find(n => n.id === nodeId);
        const container = document.getElementById('botsNodeEditor');
        if (!node || !container) return;

        const allNodes = botsFlowNodes.filter(n => n.id !== nodeId);
        const nextOpts = allNodes.map(n => `<option value="${n.id}" ${node.nextNode===n.id?'selected':''}>${escH(n.name||n.type)}</option>`).join('');

        let specific = '';

        if (node.type === 'message') {
            specific = field(window.t('botsFieldMsgText')) + textarea(node.text, `updateNode('${nodeId}','text',this.value)`);
        }

        if (node.type === 'question') {
            specific = field(window.t('botsFieldQuestion')) + textarea(node.text, `updateNode('${nodeId}','text',this.value)`) +
                field(window.t('botsFieldSaveAs')) + input(node.saveAs||'', `updateNode('${nodeId}','saveAs',this.value)`, 'answer');
        }

        if (node.type === 'buttons') {
            specific = field(window.t('botsFieldBtnText')) + textarea(node.text, `updateNode('${nodeId}','text',this.value)`) +
                `<div><label style="${lbl()}">КНОПКИ</label>
                <div id="nodeOpts_${nodeId}" style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:0.4rem;">
                    ${(node.options||[]).map((o,i) => `
                        <div style="display:flex;gap:0.4rem;align-items:center;">
                            <input value="${escH(o.text)}" placeholder='' onblur="updateNodeOpt('${nodeId}',${i},'text',this.value)"
                                style="flex:1;padding:0.4rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;">
                            <select onchange="updateNodeOpt('${nodeId}',${i},'nextNode',this.value)"
                                style="flex:1;padding:0.4rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.75rem;background:white;">
                                <option value="">→ авто</option>
                                ${allNodes.map(n=>`<option value="${n.id}" ${o.nextNode===n.id?'selected':''}>${escH(n.name||n.type)}</option>`).join('')}
                            </select>
                            <button onclick="removeNodeOpt('${nodeId}',${i})" style="background:#fee2e2;border:none;color:#ef4444;border-radius:5px;cursor:pointer;padding:3px 6px;font-size:0.72rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                        </div>`).join('')}
                </div>
                <button onclick="addNodeOpt('${nodeId}')" style="width:100%;padding:0.4rem;background:#f0fdf4;color:#16a34a;border:1px dashed #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.8rem;">+ Додати кнопку</button>
                </div>`;
        }

        if (node.type === 'condition') {
            specific = field(window.t('botsFieldCheckField')) + input(node.conditionField||'', `updateNode('${nodeId}','conditionField',this.value)`, 'phone') +
                field(window.t('botsFieldOperator')) + `<select onchange="updateNode('${nodeId}','conditionOp',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;margin-bottom:0.75rem;">
                    ${['exists','not_exists','equals','contains','starts_with'].map(op=>`<option value="${op}" ${node.conditionOp===op?'selected':''}>${{exists:window.t('botsOpExists'),not_exists:window.t('botsOpNotExists'),equals:'=',contains:window.t('botsOpContains'),starts_with:window.t('botsOpStartsWith')}[op]||op}</option>`).join('')}
                </select>` +
                field(window.t('condValueLabel')) + input(node.conditionValue||'', `updateNode('${nodeId}','conditionValue',this.value)`, '') +
                `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                    <div><label style="${lbl()}">ЯКЩО ТАК →</label>
                        <select onchange="updateNode('${nodeId}','nextNodeTrue',this.value||null)" style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.8rem;background:white;">
                            <option value="">→ авто</option>${nextOpts}
                        </select>
                    </div>
                    <div><label style="${lbl()}">''</label>
                        <select onchange="updateNode('${nodeId}','nextNodeFalse',this.value||null)" style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.8rem;background:white;">
                            <option value="">→ авто</option>${nextOpts}
                        </select>
                    </div>
                </div>`;
        }

        if (node.type === 'ai') {
            specific = field(window.t('botsFieldSysPrompt')) + textarea(node.aiPrompt||'', `updateNode('${nodeId}','aiPrompt',this.value)`, 'Ти консультант. Дані клієнта: {session.data}') +
                field(window.t('botsFieldProvider')) + `<select onchange="updateNode('${nodeId}','aiProvider',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;margin-bottom:0.75rem;">
                    <option value="openai" ${node.aiProvider!=='anthropic'?'selected':''}>OpenAI GPT-4o-mini</option>
                    <option value="anthropic" ${node.aiProvider==='anthropic'?'selected':''}>Anthropic claude-haiku</option>
                </select>`;
        }

        if (node.type === 'delay') {
            specific =
                field('Затримка (секунди)') +
                input(node.delay||0, `updateNode('${nodeId}','delay',parseInt(this.value)||0)`, '0', 'number') +
                field('Хвилини') +
                input(node.minutes||0, `updateNode('${nodeId}','minutes',parseInt(this.value)||0)`, '0', 'number') +
                field('Години') +
                input(node.hours||0, `updateNode('${nodeId}','hours',parseInt(this.value)||0)`, '0', 'number') +
                field('Дні') +
                input(node.days||0, `updateNode('${nodeId}','days',parseInt(this.value)||0)`, '0', 'number') +
                field('Повідомлення під час очікування (опційно)') +
                input(node.waitMessage||'', `updateNode('${nodeId}','waitMessage',this.value)`, ''яжемось з вами...');
        }

        if (node.type === 'photo' || node.type === 'receive_photo') {
            specific = field('Текст-запит (надіслати клієнту)') +
                input(node.text||'', `updateNode('${nodeId}','text',this.value)`, '') +
                field('Зберегти як змінну') +
                input(node.varName||'photo_url', `updateNode('${nodeId}','varName',this.value)`, 'photo_url');
        }

        if (node.type === 'image_generate' || node.type === 'dalle') {
            specific =
                field('Стиль (modern/classic/scandinavian/loft)') +
                input(node.style||'modern', `updateNode('${nodeId}','style',this.value)`, 'modern') +
                field('Тип приміщення (kitchen/living/bedroom)') +
                input(node.roomType||'kitchen', `updateNode('${nodeId}','roomType',this.value)`, 'kitchen') +
                field('Кольори (з collectedData: {{colors}})') +
                input(node.colors||'{{colors}}', `updateNode('${nodeId}','colors',this.value)`, '{{colors}}') +
                field('Розміри ({{dimensions}})') +
                input(node.dimensions||'{{dimensions}}', `updateNode('${nodeId}','dimensions',this.value)`, '{{dimensions}}') +
                field('Додаткові вимоги') +
                input(node.extra||'', `updateNode('${nodeId}','extra',this.value)`, '{{extra}}') +
                field('Підпис до фото (підтримує {{var}})') +
                input(node.caption||'', `updateNode('${nodeId}','caption',this.value)`, '') +
                field('Зберегти URL як змінну') +
                input(node.saveAs||'generated_image_url', `updateNode('${nodeId}','saveAs',this.value)`, 'generated_image_url');
        }

        if (node.type === 'crm_update' || node.type === 'update_deal') {
            specific = field('Поле угоди') +
                input(node.fieldName||'', `updateNode('${nodeId}','fieldName',this.value)`, '') +
                field('Значення (підтримує {{var}})') +
                input(node.fieldValue||'', `updateNode('${nodeId}','fieldValue',this.value)`, '{{answer}}');
        }

        if (node.type === 'http_request' || node.type === 'api_call') {
            specific = field('URL (підтримує {{var}})') +
                input(node.url||'', `updateNode('${nodeId}','url',this.value)`, 'https://api.example.com/endpoint') +
                field('Метод') +
                `<select onchange="updateNode('${nodeId}','method',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;margin-bottom:0.75rem;">
                    <option value="POST" ${node.method==='POST'?'selected':''}>POST</option>
                    <option value="GET" ${node.method==='GET'?'selected':''}>GET</option>
                </select>` +
                field('Body JSON (підтримує {{var}})') +
                `<textarea onchange="updateNode('${nodeId}','body',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.82rem;font-family:monospace;min-height:80px;box-sizing:border-box;margin-bottom:0.75rem;" placeholder='{"name":"{{name}}","phone":"{{phone}}"}'>${node.body||''}</textarea>` +
                field('Зберегти результат як змінну') +
                input(node.saveAs||'api_result', `updateNode('${nodeId}','saveAs',this.value)`, 'api_result');
        }

        if (node.type === 'talko_task') {
            specific = field(window.t('botsFieldTaskTitle')) + input(node.taskTitle||'', `updateNode('${nodeId}','taskTitle',this.value)`, 'Опрацювати ліда') +
                field(window.t('botsFieldAssignRole')) + `<select onchange="updateNode('${nodeId}','taskAssignRole',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;margin-bottom:0.75rem;">
                    <option value="owner">Власник</option>
                    <option value="manager">Менеджер</option>
                </select>` +
                field(window.t('botsFieldPriority')) + `<select onchange="updateNode('${nodeId}','taskPriority',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
                    <option value="high"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#ef4444"/></svg></span> Високий</option>
                    <option value="medium" selected><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#f59e0b"/></svg></span> Середній</option>
                    <option value="low"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> Низький</option>
                </select>`;
        }

        if (node.type === 'talko_deal') {
            // FIX: підтримуємо обидва формати — pipelines (масив, новий) і pipeline (об'єкт, старий)
            const _activePip = (window.crm?.pipelines || []).find(p => p.isDefault) 
                || (window.crm?.pipelines || [])[0]
                || window.crm?.pipeline;
            const _pipeStages = (_activePip?.stages || [])
                .slice().sort((a,b) => (a.order||0) - (b.order||0))
                .filter(s => s.id !== 'lost' && s.id !== 'won');
            const _stageOpts = _pipeStages.length
                ? _pipeStages.map(s => `<option value="${s.id}" ${(node.dealStage||'new')===s.id?'selected':''}>${s.label || s.name || s.id}</option>`).join('')
                : `<option value="new" selected>${window.t('newLeadStage')}</option>`;
            const _stageHint = _pipeStages.length === 0
                ? `<div style="font-size:0.72rem;color:#f59e0b;margin-top:2px;">${window.t('openCRMForStages')}</div>`
                : `<div style="font-size:0.7rem;color:#9ca3af;margin-top:2px;">${window.t('stagesLoadedN').replace('{V}', _pipeStages.length)}</div>`;
            specific = field(window.t('botsFieldDealName')) + input(node.dealTitle||'', `updateNode('${nodeId}','dealTitle',this.value)`, '{contact.name} — запит з боту') +
                field(window.t('botsFieldStage')) +
                `<select onchange="updateNode('${nodeId}','dealStage',this.value)"
                    style="width:100%;padding:0.4rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;background:white;cursor:pointer;margin-bottom:0.25rem;">
                    ${_stageOpts}
                </select>${_stageHint}`;
        }

        if (node.type === 'tag') {
            specific = field(window.t('botsFieldTagName')) + input(node.tagName||'', `updateNode('${nodeId}','tagName',this.value)`, 'telegram-bot');
        }

        if (node.type === 'human') {
            specific = `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:0.75rem;font-size:0.82rem;color:#9a3412;margin-bottom:0.75rem;">
                <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span> Цей вузол передає розмову живому менеджеру. Бот надішле сповіщення в TALKO і зупинить автоматичні відповіді до вирішення.
            </div>` + field(window.t('botsFieldMgrMsg')) + textarea(node.text||'Дякую! Зараз передам вас до менеджера.', `updateNode('${nodeId}','text',this.value)`);
        }

        if (node.type === 'end') {
            specific = field(window.t('botsFieldEndMsg')) + textarea(node.text||'Дякуємо за звернення! До зустрічі. <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></span>', `updateNode('${nodeId}','text',this.value)`);
        }

        const showNextNode = !['buttons','condition','end'].includes(node.type);

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div>
                    <label style="${lbl()}">НАЗВА ВУЗЛА</label>
                    <input value="${escH(node.name||'')}" onblur="updateNode('${nodeId}','name',this.value)"
                        style="width:100%;padding:0.55rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;font-weight:600;box-sizing:border-box;">
                </div>
                ${specific}
                ${showNextNode ? `<div>
                    <label style="${lbl()}">НАСТУПНИЙ ВУЗОЛ</label>
                    <select onchange="updateNode('${nodeId}','nextNode',this.value||null)"
                        style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
                        <option value="">— Автоматично —</option>${nextOpts}
                    </select>
                </div>` : ''}
            </div>`;
    }

    function lbl() { return 'font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;'; }
    function field(label) { return `<div style="margin-bottom:0.75rem;"><label style="${lbl()}">${label}</label>`; }
    function input(val, onblur, placeholder, type) { return `<input type="${type||'text'}" value="${escH(String(val))}" onblur="${onblur}" placeholder="${placeholder||''}" style="width:100%;padding:0.55rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;"></div>`; }
    function textarea(val, onblur, placeholder) { return `<textarea onblur="${onblur}" style="width:100%;min-height:90px;padding:0.55rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;resize:vertical;font-family:inherit;box-sizing:border-box;" placeholder="${placeholder||''}">${escH(val||'')}</textarea></div>`; }

    window.updateNode = function (nodeId, field, value) {
        const node = botsFlowNodes.find(n => n.id === nodeId);
        if (node) { node[field] = value; renderBotsNodesList(); }
    };
    window.addNodeOpt = function (nodeId) {
        const node = botsFlowNodes.find(n => n.id === nodeId);
        if (!node) return;
        if (!node.options) node.options = [];
        node.options.push({ text: window.t('variantWord3') + ' ' + (node.options.length + 1), nextNode: null });
        renderNodeEditor(nodeId); renderBotsNodesList();
    };
    window.updateNodeOpt = function (nodeId, idx, field, value) {
        const node = botsFlowNodes.find(n => n.id === nodeId);
        if (node?.options?.[idx]) node.options[idx][field] = value || null;
    };
    window.removeNodeOpt = function (nodeId, idx) {
        const node = botsFlowNodes.find(n => n.id === nodeId);
        if (!node?.options) return;
        node.options.splice(idx, 1);
        renderNodeEditor(nodeId);
    };

    // ── Save ───────────────────────────────────────────────
    window.saveFlowNodes = async function () {
        if (!botsCurrentFlowId) return;
        try {
            const compRef = firebase.firestore().collection('companies').doc(window.currentCompanyId);
            // FIX: correct path
            const ref = botsCurrentBotId
                ? compRef.collection('bots').doc(botsCurrentBotId).collection('flows').doc(botsCurrentFlowId)
                : compRef.collection('flows').doc(botsCurrentFlowId);
            await ref.update({ nodes: botsFlowNodes, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (typeof showToast === 'function') showToast(window.t('botsSavedOk'), 'success');
        } catch (e) { if(window.showToast)showToast(window.t('errPfx2') + e.message,'error'); else alert(window.t('errPfx2') + e.message); }
    };

    // ── Sessions View ──────────────────────────────────────
    async function renderBotsSessionsView() {
        const container = document.getElementById('botsSessionsView');
        if (!container || botsSubTab !== 'sessions') return;
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af;">'+window.t('botsLoading')+'</div>';

        try {
            const snap = await firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .collection('sessions').orderBy('updatedAt', 'desc').limit(100).get();
            const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            container.innerHTML = `
                <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;">'' (${sessions.length})</div>
                ${sessions.length === 0 ? '<div style="text-align:center;padding:2rem;color:#9ca3af;background:white;border-radius:12px;box-shadow:var(--shadow);">Сесій поки немає</div>' :
                `<div style="display:flex;flex-direction:column;gap:0.5rem;">
                    ${sessions.map(s => {
                        const statusColor = s.status === 'active' ? '#22c55e' : s.status === 'waiting_human' ? '#f97316' : '#9ca3af';
                        const flow = botsFlows.find(f => f.id === s.flowId);
                        return `<div style="background:white;border-radius:10px;padding:0.75rem;box-shadow:var(--shadow);display:flex;align-items:center;gap:0.75rem;">
                            <div style="width:10px;height:10px;border-radius:50%;background:${statusColor};flex-shrink:0;"></div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-weight:600;font-size:0.85rem;">${escH(s.contactName || s.chatId || window.t('botsAnonymous'))}</div>
                                <div style="font-size:0.75rem;color:#6b7280;">${flow?.name || s.flowId || ''} · ${s.currentNodeId || window.t('botsNode0')}</div>
                            </div>
                            <div style="font-size:0.72rem;color:#9ca3af;">${s.lastActivity?.toDate ? relTime(s.lastActivity.toDate()) : ''}</div>
                            ${s.status === 'waiting_human' ? `<button onclick="resolveHumanSession('${s.id}')" style="padding:0.3rem 0.6rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.75rem;">${window.t('resolveWord2')}</button>` : ''}
                        </div>`;
                    }).join('')}
                </div>`}`;
        } catch (e) {
            container.innerHTML = '<div style="color:#ef4444;padding:1rem;">'+window.t('botsError')+'</div>';
        }
    }

    window.resolveHumanSession = async function (sessionId) {
        try {
            await firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .collection('sessions').doc(sessionId)
                .update({ status: 'resolved', resolvedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (typeof showToast === 'function') showToast(window.t('botsSessionResolved'), 'success');
            renderBotsSessionsView();
        } catch (e) {
            console.error('[resolveHumanSession]', e);
            if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
        }
    };

    // ── Settings View ──────────────────────────────────────
    async function renderBotsSettingsView() {
        const container = document.getElementById('botsSettingsView');
        if (!container || botsSubTab !== 'settings') return;

        try {
            const compDoc = await firebase.firestore().collection('companies').doc(window.currentCompanyId).get();
            const compData = compDoc.data() || {};
            const integrations = compData.integrations || {};
            const webhookBase = `${location.origin}/api/webhook?companyId=${window.currentCompanyId}&channel=`;

            const channelStatus = (ch) => {
                const ok = integrations[ch]?.connected;
                return ok
                    ? `<span style="color:#22c55e;font-size:0.78rem;font-weight:600;">${window.t('dotConn2')}</span>`
                    : `<span style="color:#9ca3af;font-size:0.78rem;">${window.t('dotNotConn2')}</span>`;
            };

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.75rem;">

                <!-- TELEGRAM -->
                <div style="background:white;border-radius:12px;padding:1.25rem;box-shadow:var(--shadow);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 6.75a2.25 2.25 0 0 0 .126 4.238l3.553 1.184 1.184 3.553a2.25 2.25 0 0 0 4.238.126l6.75-16.5a2.242 2.242 0 0 0-.329-2.566z"/></svg>
                            <span style="font-weight:700;font-size:0.95rem;">Telegram</span>
                        </div>
                        ${channelStatus('telegram')}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:0.6rem;">
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">Bot Token (від @BotFather)</label>
                            <div style="display:flex;gap:0.5rem;">
                                <input type="password" id="tgBotToken"
                                    value="${integrations.telegram?.botToken ? '••••••••' + (integrations.telegram.botToken).slice(-6) : ''}"
                                    placeholder="123456789:AAF..."
                                    style="flex:1;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                                <button onclick="botsConnectTelegram()" style="padding:0.55rem 1rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;white-space:nowrap;">Підключити</button>
                            </div>
                        </div>
                        ${integrations.telegram?.connected ? `
                        <div style="background:#f0fdf4;border-radius:8px;padding:0.6rem 0.75rem;font-size:0.78rem;color:#166534;">
                            Вебхук: <code style="word-break:break-all;">${webhookBase}telegram</code>
                        </div>
                        <button onclick="botsDisconnectChannel('telegram')" style="align-self:flex-start;padding:0.35rem 0.75rem;background:#fee2e2;color:#ef4444;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;">Відключити</button>
                        ` : `
                        <div style="font-size:0.78rem;color:#6b7280;">
                            1. Створіть бота через <a href="https://t.me/BotFather" target="_blank" style="color:#22c55e;">@BotFather</a> → скопіюйте токен<br>
                            2. Вставте токен вище → натисніть window.t('flowConn2')<br>
                            3. Система автоматично встановить вебхук
                        </div>
                        `}
                    </div>
                </div>

                <!-- INSTAGRAM -->
                <div style="background:white;border-radius:12px;padding:1.25rem;box-shadow:var(--shadow);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e1306c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            <span style="font-weight:700;font-size:0.95rem;">Instagram</span>
                        </div>
                        ${channelStatus('instagram')}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:0.6rem;">
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">Page Access Token</label>
                            <div style="display:flex;gap:0.5rem;">
                                <input type="password" id="igPageToken"
                                    value="${integrations.instagram?.pageToken ? '••••••' + (integrations.instagram.pageToken).slice(-6) : ''}"
                                    placeholder="EAABwzL..."
                                    style="flex:1;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                                <button onclick="botsConnectMeta('instagram')" style="padding:0.55rem 1rem;background:#e1306c;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;white-space:nowrap;">Підключити</button>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">Verify Token (довільний рядок)</label>
                            <input type="text" id="igVerifyToken"
                                value="${integrations.instagram?.verifyToken || ''}"
                                placeholder="talko_verify_123"
                                style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
                        </div>
                        ${integrations.instagram?.connected ? `
                        <div style="background:#fff0f6;border-radius:8px;padding:0.6rem 0.75rem;font-size:0.78rem;color:#831843;">
                            Вебхук URL: <code style="word-break:break-all;">${webhookBase}instagram</code><br>
                            Додайте цей URL в Meta Developer Console → Webhooks
                        </div>
                        <button onclick="botsDisconnectChannel('instagram')" style="align-self:flex-start;padding:0.35rem 0.75rem;background:#fee2e2;color:#ef4444;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;">Відключити</button>
                        ` : `
                        <div style="font-size:0.78rem;color:#6b7280;">
                            1. Створіть додаток на <a href="https://developers.facebook.com" target="_blank" style="color:#22c55e;">developers.facebook.com</a><br>
                            2. Отримайте Page Access Token<br>
                            3. Вставте токен і Verify Token → window.t('flowConn2')<br>
                            4. Додайте Webhook URL в Meta Console
                        </div>
                        `}
                    </div>
                </div>

                <!-- FACEBOOK -->
                <div style="background:white;border-radius:12px;padding:1.25rem;box-shadow:var(--shadow);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877f2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            <span style="font-weight:700;font-size:0.95rem;">Facebook Messenger</span>
                        </div>
                        ${channelStatus('facebook')}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:0.6rem;">
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">Page Access Token</label>
                            <div style="display:flex;gap:0.5rem;">
                                <input type="password" id="fbPageToken"
                                    value="${integrations.facebook?.pageToken ? '••••••' + (integrations.facebook.pageToken).slice(-6) : ''}"
                                    placeholder="EAABwzL..."
                                    style="flex:1;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                                <button onclick="botsConnectMeta('facebook')" style="padding:0.55rem 1rem;background:#1877f2;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;white-space:nowrap;">Підключити</button>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">Verify Token</label>
                            <input type="text" id="fbVerifyToken"
                                value="${integrations.facebook?.verifyToken || ''}"
                                placeholder="talko_verify_456"
                                style="width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
                        </div>
                        ${integrations.facebook?.connected ? `
                        <div style="background:#eff6ff;border-radius:8px;padding:0.6rem 0.75rem;font-size:0.78rem;color:#1e3a8a;">
                            Вебхук URL: <code style="word-break:break-all;">${webhookBase}facebook</code>
                        </div>
                        <button onclick="botsDisconnectChannel('facebook')" style="align-self:flex-start;padding:0.35rem 0.75rem;background:#fee2e2;color:#ef4444;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;">Відключити</button>
                        ` : `
                        <div style="font-size:0.78rem;color:#6b7280;">
                            1. Той самий Meta Developer додаток<br>
                            2. Підключіть Messenger product<br>
                            3. Отримайте Page Access Token для своєї сторінки
                        </div>
                        `}
                    </div>
                </div>

                <!-- AI KEYS — прибрано, використовується ключ superadmin -->
            </div>`;
        } catch (e) {
            console.error('[renderBotsSettingsView]', e);
            container.innerHTML = '<div style="color:#ef4444;padding:1rem;">Помилка завантаження налаштувань: ' + e.message + '</div>';
        }
    }

    // ── Connect Telegram ──────────────────────────────────────
    window.botsConnectTelegram = async function() {
        const token = document.getElementById('tgBotToken')?.value.trim();
        if (!token || token.includes('•')) {
            if (typeof showToast === 'function') showToast(window.t('botsEnterBotToken'), 'error');
            return;
        }
        try {
            if (typeof showToast === 'function') showToast(window.t('botsConnecting'), 'info');

            // Встановлюємо вебхук через Telegram API
            const webhookUrl = `${location.origin}/api/webhook?companyId=${window.currentCompanyId}&channel=telegram`;
            const tgRes = await _tgFetch(`https://api.telegram.org/bot${token}/setWebhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
            });
            const tgData = await tgRes.json();
            if (!tgData.ok) throw new Error(tgData.description || 'Telegram error');

            // Отримуємо інфо про бота
            const meRes = await _tgFetch(`https://api.telegram.org/bot${token}/getMe`);
            const meData = await meRes.json();
            const botName = meData.result?.username || 'bot';

            // Зберігаємо в Firestore — integrations + bots підколекція
            const compRef = firebase.firestore().collection('companies').doc(window.currentCompanyId);
            await compRef.update({
                'integrations.telegram.botToken': token,
                'integrations.telegram.botName': botName,
                'integrations.telegram.webhookUrl': webhookUrl,
                'integrations.telegram.connected': true,
                'integrations.telegram.connectedAt': firebase.firestore.FieldValue.serverTimestamp(),
            });

            // FIX: створюємо/оновлюємо документ в bots підколекції
            const botsSnap2 = await compRef.collection('bots').where('channel', '==', 'telegram').limit(1).get();
            if (botsSnap2.empty) {
                const newBot = await compRef.collection('bots').add({
                    channel: 'telegram', token, botName,
                    webhookUrl, status: 'active',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                botsCurrentBotId = newBot.id;
                window._currentBotId = newBot.id;
            } else {
                botsCurrentBotId = botsSnap2.docs[0].id;
                window._currentBotId = botsCurrentBotId;
                await compRef.collection('bots').doc(botsCurrentBotId).update({ token, botName, webhookUrl });
            }

            if (typeof showToast === 'function') showToast(`${window.t('telegramConnected').replace('{V}', botName)}`, 'success');
            renderBotsSettingsView();
        } catch(e) {
            if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
        }
    };

    // ── Connect Meta (Instagram/Facebook) ────────────────────
    window.botsConnectMeta = async function(channel) {
        const tokenId = channel === 'instagram' ? 'igPageToken' : 'fbPageToken';
        const verifyId = channel === 'instagram' ? 'igVerifyToken' : 'fbVerifyToken';
        const token = document.getElementById(tokenId)?.value.trim();
        const verifyToken = document.getElementById(verifyId)?.value.trim();
        if (!token || token.includes('•')) {
            if (typeof showToast === 'function') showToast(window.t('botsEnterPageToken'), 'error');
            return;
        }
        try {
            await firebase.firestore().collection('companies').doc(window.currentCompanyId).update({
                [`integrations.${channel}.pageToken`]: token,
                [`integrations.${channel}.verifyToken`]: verifyToken || 'talko_verify',
                [`integrations.${channel}.connected`]: true,
                [`integrations.${channel}.connectedAt`]: firebase.firestore.FieldValue.serverTimestamp(),
            });
            if (typeof showToast === 'function') showToast(`${window.t('connectedAddWebhook').replace('{V}', channel)}`, 'success');
            renderBotsSettingsView();
        } catch(e) {
            if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
        }
    };

    // ── Disconnect Channel ────────────────────────────────────
    window.botsDisconnectChannel = async function(channel) {
        if (!(await (window.showConfirmModal ? showConfirmModal(`${window.t('disconnectQ').replace('{V}', channel)}`,{danger:true}) : Promise.resolve(confirm(`${window.t('disconnectQ').replace('{V}', channel)}`))))) return;
        try {
            await firebase.firestore().collection('companies').doc(window.currentCompanyId).update({
                [`integrations.${channel}.connected`]: false,
            });
            if (typeof showToast === 'function') showToast(`${window.t('disconnectedN').replace('{V}', channel)}`, 'success');
            renderBotsSettingsView();
        } catch(e) {
            if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
        }
    };

    window.saveBotApiKey = async function (provider) {
        const inputMap = { openai: 'botsOpenAIKey', anthropic: 'botsAnthropicKey', google: 'botsGoogleKey' };
        const inputId = inputMap[provider] || 'botsOpenAIKey';
        const key = document.getElementById(inputId)?.value.trim();
        if (!key || key.includes('•')) return;

        // VALIDATE: перевіряємо формат перед збереженням
        const _isEmail  = key.includes('@');
        const _isUrl    = key.startsWith('http');
        const _isDomain = /^[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/.test(key);
        const _tooShort = key.length < 20;
        if (_isEmail || _isUrl || _isDomain || _tooShort) {
            const _hint = _isEmail ? 'Це email' : _isUrl ? 'Це URL' : _isDomain ? 'Це домен' : 'Занадто короткий';
            if (typeof showToast === 'function') showToast('❌ ' + '' + _hint + '', 'error');
            return;
        }

        const fieldMap = { openai: 'openaiApiKey', anthropic: 'anthropicApiKey', google: 'googleApiKey' };
        const field = fieldMap[provider] || 'openaiApiKey';
        try {
            await firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .update({ [field]: key });
            if (typeof showToast === 'function') showToast(window.t('botsKeySaved'), 'success');
            document.getElementById(inputId).value = '••••••••' + key.slice(-4);
        } catch (e) { if(window.showToast)showToast(window.t('errPfx2') + e.message,'error'); else alert(window.t('errPfx2') + e.message); }
    };

    // ── Helpers ────────────────────────────────────────────
    function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function relTime(d) {
        const diff = Date.now() - d.getTime();
        const m = Math.floor(diff/60000);
        if (m<1) return window.t('botsJustNowLabel'); if (m<60) return m+'хв';
        const h = Math.floor(m/60); if (h<24) return h+window.t('botsHourShort');
        return Math.floor(h/24)+'дн';
    }

    // ── Tab hook ───────────────────────────────────────────
    

    window._destroyBotsFlows81 = function () {
        if (typeof botsUnsubscribe === 'function') botsUnsubscribe();
        botsUnsubscribe = null;
    };

})();

// FIX: helper з timeout для Telegram API (10s)
async function _tgFetch(url, opts = {}) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
        return await fetch(url, { ...opts, signal: ctrl.signal });
    } finally { clearTimeout(timer); }
}

// ════════════════════════════════════════════════════════════
// ШАБЛОНИ ФЛОУ — готові воронки під ніші
// ════════════════════════════════════════════════════════════

const FLOW_TEMPLATES = {
    furniture: {
        name:        'Меблі / Кухні',
        icon:        '🪑',
        description: 'Збирає розміри, стиль, фото кімнати → генерує дизайн DALL-E → записує на замір',
        tags:        ['Меблі', 'Кухні', 'Дизайн', 'AI'],
        color:       '#f0fdf4',
        border:      '#bbf7d0',
        nodes: [
            { id: 'start',   type: 'start',    data: {} },
            { id: 'greet',   type: 'message',  data: { text: 'Привіт, {{name}}! 👋\n\nЯ допоможу підібрати кухню вашої мрії. Це займе 2 хвилини 🎨' } },
            { id: 'q_style', type: 'question', data: { text: '🎨 Який стиль вам до вподоби?', varName: 'style', buttons: [
                { text: 'Сучасний', label: 'Сучасний' },
                { text: 'Класика', label: 'Класика' },
                { text: 'Скандинавський', label: 'Скандинавський' },
                { text: 'Loft', label: 'Loft' },
            ]}},
            { id: 'q_size',  type: 'question', data: { text: '📐 Вкажіть розміри кухні (наприклад: 3×4 м або просто площу)', varName: 'dimensions' } },
            { id: 'q_color', type: 'question', data: { text: '🎨 Які кольори фасадів вам подобаються? (наприклад: білий, сірий, дерево)', varName: 'colors' } },
            { id: 'photo',   type: 'photo',    data: { text: '📷 Надішліть фото вашої кімнати (щоб дизайн підходив до простору)', varName: 'room_photo' } },
            { id: 'gen',     type: 'image_generate', data: {
                style:      '{{style}}',
                roomType:   'kitchen',
                colors:     '{{colors}}',
                dimensions: '{{dimensions}}',
                caption:    '✨ Ось концепт вашої кухні!\n\n⚠️ Це орієнтовна візуалізація. Фінальний дизайн уточнюється на заміру.\n\nЦіна залежить від розмірів і матеріалів.',
                saveAs:     'design_url',
            }},
            { id: 'q_like',  type: 'question', data: { text: '❤️ Як вам концепт?', varName: 'reaction', buttons: [
                { text: '👍 Подобається, хочу дізнатись ціну', label: 'like' },
                { text: '🔄 Хочу інший варіант', label: 'retry' },
                { text: '📞 Хочу поговорити з менеджером', label: 'manager' },
            ]}},
            { id: 'cond',    type: 'condition', data: { variable: 'reaction', operator: 'contains', value: 'like' } },
            { id: 'price',   type: 'message',  data: { text: '💰 Орієнтовна вартість кухні {{dimensions}} м: від 45 000 грн\n\nФінальна ціна — після безкоштовного заміру у вас вдома.\n\n📅 Записати замірника?' } },
            { id: 'q_name',  type: 'question', data: { text: "👤 Як вас звати?", varName: 'client_name' } },
            { id: 'q_phone', type: 'question', data: { text: '📱 Ваш номер телефону?', varName: 'phone' } },
            { id: 'crm',     type: 'crm_update', data: { fields: { clientName: '{{client_name}}', phone: '{{phone}}', note: 'Стиль: {{style}}, Розміри: {{dimensions}}, Кольори: {{colors}}' } } },
            { id: 'confirm', type: 'message',  data: { text: '✅ Відмінно, {{client_name}}!\n\nМенеджер зателефонує вам найближчим часом для погодження зручного часу заміру.\n\nДякуємо! 🙏' } },
            { id: 'manager_msg', type: 'message', data: { text: '👍 Зрозуміло! Залиште свій номер — менеджер зв\'яжеться і відповість на всі питання.' } },
            { id: 'end',     type: 'end',      data: {} },
        ],
        edges: [
            { id: 'e1',  source: 'start',   target: 'greet' },
            { id: 'e2',  source: 'greet',   target: 'q_style' },
            { id: 'e3',  source: 'q_style', target: 'q_size' },
            { id: 'e4',  source: 'q_size',  target: 'q_color' },
            { id: 'e5',  source: 'q_color', target: 'photo' },
            { id: 'e6',  source: 'photo',   target: 'gen' },
            { id: 'e7',  source: 'gen',     target: 'q_like' },
            { id: 'e8',  source: 'q_like',  target: 'cond' },
            { id: 'e9',  source: 'cond',    target: 'price',       sourceHandle: 'yes' },
            { id: 'e10', source: 'cond',    target: 'manager_msg', sourceHandle: 'no' },
            { id: 'e11', source: 'price',   target: 'q_name' },
            { id: 'e12', source: 'q_name',  target: 'q_phone' },
            { id: 'e13', source: 'q_phone', target: 'crm' },
            { id: 'e14', source: 'crm',     target: 'confirm' },
            { id: 'e15', source: 'confirm', target: 'end' },
            { id: 'e16', source: 'manager_msg', target: 'q_phone' },
        ],
    },

    medical: {
        name:        'Медицина / Анамнез',
        icon:        '🏥',
        description: 'Збирає скарги, симптоми, тривалість → структурований анамнез лікарю → запис на консультацію',
        tags:        ['Медицина', 'Стоматологія', 'Анамнез', 'Запис'],
        color:       '#eff6ff',
        border:      '#bfdbfe',
        nodes: [
            { id: 'start',    type: 'start',    data: {} },
            { id: 'greet',    type: 'message',  data: { text: 'Вітаємо в нашій клініці! 👨‍⚕️\n\nЩоб лікар міг краще підготуватись до прийому, дайте відповідь на кілька запитань.\n\n⚠️ Ця анкета не замінює консультацію лікаря.' } },
            { id: 'consent',  type: 'question', data: { text: '✅ Ви погоджуєтесь на обробку медичних даних для підготовки до консультації?', varName: 'consent', buttons: [
                { text: '✅ Так, погоджуюсь', label: 'yes' },
                { text: '❌ Ні', label: 'no' },
            ]}},
            { id: 'cond_consent', type: 'condition', data: { variable: 'consent', operator: 'contains', value: 'yes' } },
            { id: 'no_consent', type: 'message', data: { text: 'Зрозуміло. Ви можете записатись на консультацію за телефоном. Дякуємо!' } },
            { id: 'q_name',   type: 'question', data: { text: "👤 Ваше ім'я та прізвище?", varName: 'client_name' } },
            { id: 'q_age',    type: 'question', data: { text: '🎂 Ваш вік?', varName: 'age' } },
            { id: 'q_complaint', type: 'question', data: { text: '💬 Що вас турбує? Опишіть основну скаргу (наприклад: біль у зубі, кровоточивість ясен, чутливість)', varName: 'complaint' } },
            { id: 'q_duration', type: 'question', data: { text: '⏱ Як давно турбує ця проблема?', varName: 'duration', buttons: [
                { text: 'Менше тижня', label: 'less_week' },
                { text: '1-4 тижні', label: 'weeks' },
                { text: '1-6 місяців', label: 'months' },
                { text: 'Більше 6 місяців', label: 'long' },
            ]}},
            { id: 'q_prev',   type: 'question', data: { text: '📋 Чи зверталися раніше з цією проблемою? Якщо так — коротко опишіть', varName: 'prev_treatment' } },
            { id: 'q_allergy', type: 'question', data: { text: '⚠️ Чи є алергія на ліки? (якщо так — напишіть на які, якщо ні — "немає")', varName: 'allergy' } },
            { id: 'crm',      type: 'crm_update', data: { fields: {
                clientName: '{{client_name}}',
                note: 'АНАМНЕЗ:\nСкарга: {{complaint}}\nТривалість: {{duration}}\nПопереднє лікування: {{prev_treatment}}\nАлергія: {{allergy}}\nВік: {{age}}',
                source: 'bot_medical',
            }}},
            { id: 'summary',  type: 'message',  data: { text: '✅ Дякуємо, {{client_name}}!\n\nДані передано лікарю. Хочете записатись на консультацію?' } },
            { id: 'q_book',   type: 'question', data: { text: '📅 Записатись на консультацію?', varName: 'wants_booking', buttons: [
                { text: '✅ Так, записатись', label: 'yes' },
                { text: 'Пізніше зателефоную', label: 'later' },
            ]}},
            { id: 'cond_book', type: 'condition', data: { variable: 'wants_booking', operator: 'contains', value: 'yes' } },
            { id: 'q_phone',  type: 'question', data: { text: '📱 Ваш номер телефону для підтвердження запису?', varName: 'phone' } },
            { id: 'crm2',     type: 'crm_update', data: { fields: { phone: '{{phone}}', stage: 'consultation' } } },
            { id: 'booked',   type: 'message',  data: { text: '✅ Чудово! Адміністратор зателефонує вам найближчим часом для підтвердження зручного часу.\n\nДо зустрічі! 😊' } },
            { id: 'later_msg', type: 'message', data: { text: 'Добре! Телефонуйте нам коли будете готові. До зустрічі! 😊' } },
            { id: 'end',      type: 'end',      data: {} },
        ],
        edges: [
            { id: 'e1',  source: 'start',       target: 'greet' },
            { id: 'e2',  source: 'greet',       target: 'consent' },
            { id: 'e3',  source: 'consent',     target: 'cond_consent' },
            { id: 'e4',  source: 'cond_consent', target: 'q_name',     sourceHandle: 'yes' },
            { id: 'e5',  source: 'cond_consent', target: 'no_consent', sourceHandle: 'no' },
            { id: 'e6',  source: 'no_consent',  target: 'end' },
            { id: 'e7',  source: 'q_name',      target: 'q_age' },
            { id: 'e8',  source: 'q_age',       target: 'q_complaint' },
            { id: 'e9',  source: 'q_complaint', target: 'q_duration' },
            { id: 'e10', source: 'q_duration',  target: 'q_prev' },
            { id: 'e11', source: 'q_prev',      target: 'q_allergy' },
            { id: 'e12', source: 'q_allergy',   target: 'crm' },
            { id: 'e13', source: 'crm',         target: 'summary' },
            { id: 'e14', source: 'summary',     target: 'q_book' },
            { id: 'e15', source: 'q_book',      target: 'cond_book' },
            { id: 'e16', source: 'cond_book',   target: 'q_phone',   sourceHandle: 'yes' },
            { id: 'e17', source: 'cond_book',   target: 'later_msg', sourceHandle: 'no' },
            { id: 'e18', source: 'q_phone',     target: 'crm2' },
            { id: 'e19', source: 'crm2',        target: 'booked' },
            { id: 'e20', source: 'booked',      target: 'end' },
            { id: 'e21', source: 'later_msg',   target: 'end' },
        ],
    },

    construction: {
        name:        'Будівництво / Кошторис',
        icon:        '🏗️',
        description: 'Визначає тип об\'єкту → збирає параметри кнопками → автоматичний кошторис → менеджер підтверджує',
        tags:        ['Будівництво', 'Ремонт', 'Кошторис', 'Замір'],
        color:       '#fefce8',
        border:      '#fef08a',
        nodes: [
            { id: 'start',    type: 'start',    data: {} },
            { id: 'greet',    type: 'message',  data: { text: 'Вітаємо! 🏗️\n\nПодготуємо для вас попередній кошторис за 2 хвилини.\n\n⚠️ Кошторис орієнтовний. Точна вартість після виїзду фахівця.' } },
            { id: 'q_type',   type: 'question', data: { text: '🏠 Тип об\'єкту?', varName: 'object_type', buttons: [
                { text: '🏠 Квартира', label: 'apartment' },
                { text: '🏡 Будинок', label: 'house' },
                { text: '🏢 Комерційне приміщення', label: 'commercial' },
                { text: '🔨 Окремі роботи', label: 'partial' },
            ]}},
            { id: 'q_area',   type: 'question', data: { text: '📐 Загальна площа (м²)?', varName: 'area' } },
            { id: 'q_works',  type: 'question', data: { text: '🔧 Які роботи потрібні?', varName: 'work_type', buttons: [
                { text: '🔨 Капітальний ремонт', label: 'capital' },
                { text: '🖌️ Косметичний ремонт', label: 'cosmetic' },
                { text: '🏗️ Будівництво під ключ', label: 'turnkey' },
                { text: '⚡ Тільки електрика/сантехніка', label: 'engineering' },
            ]}},
            { id: 'q_deadline', type: 'question', data: { text: '📅 Бажаний термін здачі?', varName: 'deadline', buttons: [
                { text: '⚡ До 1 місяця', label: 'urgent' },
                { text: '📅 1-3 місяці', label: 'normal' },
                { text: '🗓️ 3-6 місяців', label: 'standard' },
                { text: '📆 Більше 6 місяців', label: 'long' },
            ]}},
            { id: 'q_budget', type: 'question', data: { text: '💰 Орієнтовний бюджет?', varName: 'budget', buttons: [
                { text: 'До 100 000 грн', label: 'small' },
                { text: '100 000 - 300 000 грн', label: 'medium' },
                { text: '300 000 - 700 000 грн', label: 'large' },
                { text: 'Більше 700 000 грн', label: 'premium' },
            ]}},
            { id: 'q_name',   type: 'question', data: { text: "👤 Ваше ім'я?", varName: 'client_name' } },
            { id: 'q_phone',  type: 'question', data: { text: '📱 Номер телефону для зв\'язку?', varName: 'phone' } },
            { id: 'crm',      type: 'crm_update', data: { fields: {
                clientName: '{{client_name}}',
                phone:      '{{phone}}',
                note:       'КОШТОРИС-ЗАПИТ:\nТип: {{object_type}}\nПлоща: {{area}} м²\nРоботи: {{work_type}}\nТермін: {{deadline}}\nБюджет: {{budget}}',
                source:     'bot_construction',
                amount:     '0',
            }}},
            { id: 'confirm',  type: 'message',  data: { text: '✅ Дякуємо, {{client_name}}!\n\nВаш запит прийнято:\n📍 Об\'єкт: {{object_type}}\n📐 Площа: {{area}} м²\n🔧 Роботи: {{work_type}}\n💰 Бюджет: {{budget}}\n\nКошторисник зателефонує вам протягом 2 годин для уточнення деталей і погодження безкоштовного виїзду.' } },
            { id: 'end',      type: 'end',      data: {} },
        ],
        edges: [
            { id: 'e1',  source: 'start',      target: 'greet' },
            { id: 'e2',  source: 'greet',      target: 'q_type' },
            { id: 'e3',  source: 'q_type',     target: 'q_area' },
            { id: 'e4',  source: 'q_area',     target: 'q_works' },
            { id: 'e5',  source: 'q_works',    target: 'q_deadline' },
            { id: 'e6',  source: 'q_deadline', target: 'q_budget' },
            { id: 'e7',  source: 'q_budget',   target: 'q_name' },
            { id: 'e8',  source: 'q_name',     target: 'q_phone' },
            { id: 'e9',  source: 'q_phone',    target: 'crm' },
            { id: 'e10', source: 'crm',        target: 'confirm' },
            { id: 'e11', source: 'confirm',    target: 'end' },
        ],
    },
};

// ── Модалка вибору шаблону ──────────────────────────────────
window.openFlowTemplatesModal = function() {
    document.getElementById('flowTemplatesModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'flowTemplatesModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1rem;`;

    modal.innerHTML = `
        <div style="background:white;border-radius:16px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <div style="padding:1.25rem 1.5rem;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:white;z-index:1;">
                <div>
                    <div style="font-weight:700;font-size:1.05rem;">📋 Шаблони флоу</div>
                    <div style="font-size:0.78rem;color:#6b7280;margin-top:2px;">Готові воронки під вашу нішу. Встановіть за 1 клік.</div>
                </div>
                <button onclick="document.getElementById('flowTemplatesModal').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;">✕</button>
            </div>
            <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem;">
                ${Object.entries(FLOW_TEMPLATES).map(([key, tpl]) => `
                    <div style="border:2px solid ${tpl.border};border-radius:14px;padding:1.1rem 1.25rem;background:${tpl.color};transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
                            <div style="flex:1;min-width:200px;">
                                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
                                    <span style="font-size:1.4rem;">${tpl.icon}</span>
                                    <span style="font-weight:700;font-size:1rem;">${tpl.name}</span>
                                </div>
                                <div style="font-size:0.82rem;color:#374151;margin-bottom:0.6rem;">${tpl.description}</div>
                                <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
                                    ${tpl.tags.map(tag => `<span style="background:white;border:1px solid #e5e7eb;border-radius:20px;padding:2px 8px;font-size:0.72rem;color:#6b7280;">${tag}</span>`).join('')}
                                </div>
                                <div style="margin-top:0.6rem;font-size:0.75rem;color:#6b7280;">
                                    📊 ${tpl.nodes.length} нод · ${tpl.edges.length} переходів
                                </div>
                            </div>
                            <button onclick="installFlowTemplate('${key}')" style="padding:0.6rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:0.85rem;white-space:nowrap;flex-shrink:0;">
                                ⚡ Встановити
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="padding:0.75rem 1.5rem;border-top:1px solid #f3f4f6;font-size:0.75rem;color:#9ca3af;text-align:center;">
                Після встановлення шаблон з'явиться в списку ботів. Налаштуйте тексти і підключіть до Telegram/Viber.
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

// ── Встановлення шаблону ────────────────────────────────────
window.installFlowTemplate = async function(templateKey) {
    const tpl = FLOW_TEMPLATES[templateKey];
    if (!tpl) return;

    const cid = window.currentCompanyId;
    if (!cid) { if (typeof showToast === 'function') showToast('Компанія не визначена', 'error'); return; }

    const btn = document.querySelector(`button[onclick="installFlowTemplate('${templateKey}')"]`);
    if (btn) { btn.disabled = true; btn.textContent = ''; }

    try {
        const db = window.db ? window.db() : firebase.firestore();
        const compRef = db.collection('companies').doc(cid);

        // Створюємо бота
        const botRef = await compRef.collection('bots').add({
            name:      tpl.name,
            icon:      tpl.icon,
            channel:   'telegram',
            status:    'draft',
            template:  templateKey,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Створюємо флоу
        const flowRef = await compRef.collection('bots').doc(botRef.id).collection('flows').add({
            name:      tpl.name,
            botId:     botRef.id,
            status:    'active',
            nodes:     tpl.nodes,
            edges:     tpl.edges,
            template:  templateKey,
            crmEnabled: true,
            crmTrigger: 'flow_end',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        document.getElementById('flowTemplatesModal')?.remove();
        if (typeof showToast === 'function') showToast(`✅ Шаблон "${tpl.name}" встановлено! Налаштуйте тексти і підключіть до месенджера.`, 'success');

        // Оновлюємо список ботів
        if (typeof window._renderBotsList === 'function') window._renderBotsList();
        else if (typeof window._renderBotsTab === 'function') window._renderBotsTab();

    } catch (e) {
        if (typeof showToast === 'function') showToast('Помилка встановлення: ' + e.message, 'error');
        if (btn) { btn.disabled = false; btn.textContent = ''; }
    }
};
