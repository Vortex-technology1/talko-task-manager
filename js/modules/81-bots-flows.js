// ============================================================
// 80-bots-flows.js — TALKO Flow Builder (Telegram Bots) v1.0
// UI для створення і управління ботами / flow-сценаріями
// ============================================================
(function () {
    'use strict';

    let botsFlows = [];
    let botsUnsubscribe = null;
    let botsCurrentFlowId = null;
    let botsFlowNodes = [];
    let botsSelectedNodeId = null;
    let botsSubTab = 'list'; // list | editor | sessions

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
                        🤖 Боти
                    </button>
                    <button onclick="botsSwitchTab('sessions')" id="botsTabSessions"
                        style="flex:1;padding:0.5rem;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;background:transparent;color:#525252;transition:all 0.2s;">
                        💬 Сесії
                    </button>
                    <button onclick="botsSwitchTab('settings')" id="botsTabSettings"
                        style="flex:1;padding:0.5rem;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;background:transparent;color:#525252;transition:all 0.2s;">
                        ⚙️ Налаштування
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
        botsUnsubscribe = base.collection('flows')
            .orderBy('createdAt', 'desc').limit(100)
            .onSnapshot(snap => {
                botsFlows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (botsSubTab === 'list') renderBotsListView();
            });
    }

    // ── List View ──────────────────────────────────────────
    function renderBotsListView() {
        const container = document.getElementById('botsListView');
        if (!container || botsSubTab !== 'list') return;

        const channelIcons = { telegram: '✈️', instagram: '📸', whatsapp: '💬', web: '🌐' };
        const statusColors = { active: '#22c55e', draft: '#9ca3af', paused: '#f97316' };

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
                <div>
                    <div style="font-weight:700;font-size:1rem;">Чат-боти</div>
                    <div style="font-size:0.78rem;color:#6b7280;">${botsFlows.length} ботів</div>
                </div>
                <button onclick="openCreateFlowModal()" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1rem;background:#22c55e;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                    + Новий бот
                </button>
            </div>

            ${botsFlows.length === 0 ? `
                <div style="text-align:center;padding:3rem;background:white;border-radius:12px;box-shadow:var(--shadow);">
                    <div style="font-size:2.5rem;margin-bottom:0.75rem;">🤖</div>
                    <div style="font-weight:600;margin-bottom:0.4rem;">Ботів поки немає</div>
                    <div style="font-size:0.85rem;color:#6b7280;margin-bottom:1rem;">Створіть першого бота і налаштуйте автоматичні сценарії</div>
                    <button onclick="openCreateFlowModal()" style="padding:0.6rem 1.25rem;background:#22c55e;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;">+ Створити бота</button>
                </div>` : `
                <div style="display:flex;flex-direction:column;gap:0.75rem;">
                    ${botsFlows.map(flow => `
                        <div style="background:white;border-radius:12px;padding:1rem;box-shadow:var(--shadow);border-left:3px solid ${statusColors[flow.status] || '#9ca3af'};">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
                                <div>
                                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;">
                                        <span style="font-size:1.1rem;">${channelIcons[flow.channel] || '🤖'}</span>
                                        <span style="font-weight:700;font-size:0.95rem;">${escH(flow.name)}</span>
                                        <span style="font-size:0.7rem;background:${statusColors[flow.status] || '#9ca3af'}22;color:${statusColors[flow.status] || '#9ca3af'};padding:0.15rem 0.5rem;border-radius:20px;font-weight:600;">${flow.status || 'draft'}</span>
                                    </div>
                                    <div style="font-size:0.78rem;color:#6b7280;">
                                        ${flow.channel || 'telegram'} · ${(flow.nodes || []).length} вузлів · ${flow.sessionCount || 0} сесій
                                    </div>
                                </div>
                                <div style="display:flex;gap:0.4rem;">
                                    <button onclick="openFlowEditor('${flow.id}')" style="padding:0.4rem 0.75rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
                                        ✏️ Редагувати
                                    </button>
                                    <button onclick="toggleFlowStatus('${flow.id}','${flow.status}')"
                                        style="padding:0.4rem 0.65rem;background:${flow.status==='active'?'#fee2e2':'#f0fdf4'};color:${flow.status==='active'?'#ef4444':'#16a34a'};border:none;border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:600;">
                                        ${flow.status === 'active' ? 'Пауза' : 'Активувати'}
                                    </button>
                                    <button onclick="confirmDeleteFlow('${flow.id}')" style="padding:0.4rem 0.5rem;background:#fee2e2;color:#ef4444;border:none;border-radius:8px;cursor:pointer;">
                                        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                                    </button>
                                </div>
                            </div>
                            ${flow.triggerKeyword ? `<div style="margin-top:0.5rem;font-size:0.75rem;color:#6b7280;">🔑 Тригер: <code style="background:#f9fafb;padding:1px 5px;border-radius:4px;">${escH(flow.triggerKeyword)}</code></div>` : ''}
                        </div>`).join('')}
                </div>`}
        `;
        if (window.lucide) lucide.createIcons();
    }

    window.toggleFlowStatus = async function (flowId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        await firebase.firestore().collection('companies').doc(window.currentCompanyId)
            .collection('flows').doc(flowId)
            .update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof showToast === 'function') showToast(newStatus === 'active' ? '✅ Бота активовано' : '⏸ Бота на паузі', 'success');
    };

    window.confirmDeleteFlow = function (flowId) {
        if (!confirm('Видалити бота? Активні сесії будуть зупинені.')) return;
        firebase.firestore().collection('companies').doc(window.currentCompanyId)
            .collection('flows').doc(flowId).delete()
            .then(() => { if (typeof showToast === 'function') showToast('Видалено', 'success'); });
    };

    // ── Create Flow Modal ──────────────────────────────────
    window.openCreateFlowModal = function () {
        const html = `
            <div id="botsCreateOverlay" onclick="if(event.target===this)this.remove()"
                style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;">
                <div style="background:white;border-radius:16px;width:100%;max-width:440px;box-shadow:0 24px 64px rgba(0,0,0,0.2);">
                    <div style="padding:1.25rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">
                        <div style="font-weight:700;">Новий бот</div>
                        <button onclick="document.getElementById('botsCreateOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;">✕</button>
                    </div>
                    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">НАЗВА БОТА *</label>
                            <input id="newFlowName" placeholder="Наприклад: Запис на прийом"
                                style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;box-sizing:border-box;">
                        </div>
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">КАНАЛ</label>
                            <select id="newFlowChannel" style="width:100%;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
                                <option value="telegram">✈️ Telegram</option>
                                <option value="instagram">📸 Instagram</option>
                                <option value="whatsapp">💬 WhatsApp</option>
                                <option value="web">🌐 Web Widget</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">ТРИГЕР (ключове слово або /start)</label>
                            <input id="newFlowTrigger" placeholder="/start або записатись"
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
        if (!name) { alert('Введіть назву'); return; }
        try {
            const ref = await firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .collection('flows').add({
                    name,
                    channel: document.getElementById('newFlowChannel')?.value || 'telegram',
                    triggerKeyword: document.getElementById('newFlowTrigger')?.value.trim() || '/start',
                    status: 'draft',
                    nodes: [],
                    sessionCount: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            document.getElementById('botsCreateOverlay')?.remove();
            if (typeof showToast === 'function') showToast('Бота створено ✓', 'success');
            openFlowEditor(ref.id);
        } catch (err) { alert('Помилка: ' + err.message); }
    };

    // ── Flow Node Editor (slide-in panel) ──────────────────
    window.openFlowEditor = async function (flowId) {
        botsCurrentFlowId = flowId;
        botsSelectedNodeId = null;

        const doc = await firebase.firestore().collection('companies').doc(window.currentCompanyId)
            .collection('flows').doc(flowId).get();
        if (!doc.exists) return;
        const flowData = { id: doc.id, ...doc.data() };
        botsFlowNodes = JSON.parse(JSON.stringify(flowData.nodes || []));

        renderFlowEditorPanel(flowData);
    };

    function renderFlowEditorPanel(flowData) {
        document.getElementById('botsEditorOverlay')?.remove();
        const nodeTypes = [
            ['message','Повідомлення','💬'],
            ['question','Питання','❓'],
            ['buttons','Кнопки','🔘'],
            ['condition','Умова','⚡'],
            ['ai','AI відповідь','🤖'],
            ['delay','Затримка','⏳'],
            ['talko_task','Задача TALKO','✅'],
            ['talko_deal','Угода CRM','💼'],
            ['tag','Тег контакту','🏷️'],
            ['human','Передати менеджеру','👤'],
            ['end','Завершення','🏁'],
        ];

        const html = `
            <div id="botsEditorOverlay"
                style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:stretch;justify-content:flex-end;">
                <div style="background:white;width:100%;max-width:720px;display:flex;flex-direction:column;overflow:hidden;box-shadow:-8px 0 32px rgba(0,0,0,0.15);">

                    <!-- Header -->
                    <div style="padding:1rem 1.25rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                        <div>
                            <div style="font-weight:700;font-size:1rem;">${escH(flowData.name)} <span style="font-size:0.75rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:2px 8px;color:#6b7280;font-weight:500;">${flowData.channel}</span></div>
                            <div style="font-size:0.78rem;color:#6b7280;margin-top:1px;">${botsFlowNodes.length} вузлів · тригер: <code style="background:#f0fdf4;color:#16a34a;padding:1px 5px;border-radius:4px;">${escH(flowData.triggerKeyword || '/start')}</code></div>
                        </div>
                        <div style="display:flex;gap:0.5rem;">
                            <button onclick="saveFlowNodes()" style="padding:0.45rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">💾 Зберегти</button>
                            <button onclick="document.getElementById('botsEditorOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;">✕</button>
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
                                <div style="font-size:2rem;margin-bottom:0.5rem;">👈</div>
                                <div>Виберіть вузол або додайте новий</div>
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
        const icons = { message:'💬', question:'❓', buttons:'🔘', condition:'⚡', ai:'🤖', delay:'⏳', talko_task:'✅', talko_deal:'💼', tag:'🏷️', human:'👤', end:'🏁' };

        if (botsFlowNodes.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:1rem;color:#9ca3af;font-size:0.8rem;">Вузлів немає</div>';
            return;
        }

        container.innerHTML = botsFlowNodes.map((node, i) => `
            <div onclick="selectFlowNode('${node.id}')" data-node-id="${node.id}"
                style="padding:0.45rem 0.6rem;border-radius:7px;cursor:pointer;margin-bottom:0.25rem;background:${botsSelectedNodeId===node.id?'#f0fdf4':'white'};border:1px solid ${botsSelectedNodeId===node.id?'#22c55e':'#e5e7eb'};transition:all 0.15s;display:flex;align-items:center;gap:0.4rem;">
                <span style="font-size:0.82rem;">${icons[node.type]||'📋'}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.78rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escH(node.name||node.type)}</div>
                    <div style="font-size:0.68rem;color:#9ca3af;">${node.type}</div>
                </div>
                <div style="display:flex;flex-direction:column;">
                    ${i>0?`<button onclick="event.stopPropagation();moveNode('${node.id}',-1)" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.65rem;padding:1px;">▲</button>`:''}
                    ${i<botsFlowNodes.length-1?`<button onclick="event.stopPropagation();moveNode('${node.id}',1)" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.65rem;padding:1px;">▼</button>`:''}
                </div>
                <button onclick="event.stopPropagation();deleteFlowNode('${node.id}')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:0.72rem;padding:2px;">✕</button>
            </div>`).join('');
    }

    window.addFlowNode = function (type) {
        const id = 'node_' + Date.now();
        const names = { message:'Повідомлення', question:'Питання', buttons:'Вибір', condition:'Умова', ai:'AI', delay:'Затримка', talko_task:'Задача', talko_deal:'Угода', tag:'Тег', human:'Менеджер', end:'Завершення' };
        botsFlowNodes.push({ id, type, name: names[type]||type, text:'', options:[], saveAs:null, condition:null, delay:0, taskTitle:'', dealTitle:'', tagName:'', aiPrompt:'', nextNode:null });
        renderBotsNodesList();
        selectFlowNode(id);
    };

    window.deleteFlowNode = function (nodeId) {
        if (!confirm('Видалити вузол?')) return;
        botsFlowNodes = botsFlowNodes.filter(n => n.id !== nodeId);
        if (botsSelectedNodeId === nodeId) {
            botsSelectedNodeId = null;
            const ed = document.getElementById('botsNodeEditor');
            if (ed) ed.innerHTML = '<div style="text-align:center;padding:3rem;color:#9ca3af;">Виберіть вузол</div>';
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
            specific = field('ТЕКСТ ПОВІДОМЛЕННЯ') + textarea(node.text, `updateNode('${nodeId}','text',this.value)`);
        }

        if (node.type === 'question') {
            specific = field('ПИТАННЯ') + textarea(node.text, `updateNode('${nodeId}','text',this.value)`) +
                field('ЗБЕРЕГТИ ВІДПОВІДЬ ЯК') + input(node.saveAs||'', `updateNode('${nodeId}','saveAs',this.value)`, 'answer');
        }

        if (node.type === 'buttons') {
            specific = field('ТЕКСТ ПЕРЕД КНОПКАМИ') + textarea(node.text, `updateNode('${nodeId}','text',this.value)`) +
                `<div><label style="${lbl()}">КНОПКИ</label>
                <div id="nodeOpts_${nodeId}" style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:0.4rem;">
                    ${(node.options||[]).map((o,i) => `
                        <div style="display:flex;gap:0.4rem;align-items:center;">
                            <input value="${escH(o.text)}" placeholder="Текст" onblur="updateNodeOpt('${nodeId}',${i},'text',this.value)"
                                style="flex:1;padding:0.4rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;">
                            <select onchange="updateNodeOpt('${nodeId}',${i},'nextNode',this.value)"
                                style="flex:1;padding:0.4rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.75rem;background:white;">
                                <option value="">→ авто</option>
                                ${allNodes.map(n=>`<option value="${n.id}" ${o.nextNode===n.id?'selected':''}>${escH(n.name||n.type)}</option>`).join('')}
                            </select>
                            <button onclick="removeNodeOpt('${nodeId}',${i})" style="background:#fee2e2;border:none;color:#ef4444;border-radius:5px;cursor:pointer;padding:3px 6px;font-size:0.72rem;">✕</button>
                        </div>`).join('')}
                </div>
                <button onclick="addNodeOpt('${nodeId}')" style="width:100%;padding:0.4rem;background:#f0fdf4;color:#16a34a;border:1px dashed #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.8rem;">+ Додати кнопку</button>
                </div>`;
        }

        if (node.type === 'condition') {
            specific = field('ПОЛЕ ДЛЯ ПЕРЕВІРКИ') + input(node.conditionField||'', `updateNode('${nodeId}','conditionField',this.value)`, 'phone') +
                field('ОПЕРАТОР') + `<select onchange="updateNode('${nodeId}','conditionOp',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;margin-bottom:0.75rem;">
                    ${['exists','not_exists','equals','contains','starts_with'].map(op=>`<option value="${op}" ${node.conditionOp===op?'selected':''}>${{exists:'існує',not_exists:'не існує',equals:'=',contains:'містить',starts_with:'починається з'}[op]||op}</option>`).join('')}
                </select>` +
                field('ЗНАЧЕННЯ (для =, містить, починається з)') + input(node.conditionValue||'', `updateNode('${nodeId}','conditionValue',this.value)`, '') +
                `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                    <div><label style="${lbl()}">ЯКЩО ТАК →</label>
                        <select onchange="updateNode('${nodeId}','nextNodeTrue',this.value||null)" style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.8rem;background:white;">
                            <option value="">→ авто</option>${nextOpts}
                        </select>
                    </div>
                    <div><label style="${lbl()}">ЯКЩО НІ →</label>
                        <select onchange="updateNode('${nodeId}','nextNodeFalse',this.value||null)" style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.8rem;background:white;">
                            <option value="">→ авто</option>${nextOpts}
                        </select>
                    </div>
                </div>`;
        }

        if (node.type === 'ai') {
            specific = field('СИСТЕМНИЙ ПРОМПТ') + textarea(node.aiPrompt||'', `updateNode('${nodeId}','aiPrompt',this.value)`, 'Ти консультант. Дані клієнта: {session.data}') +
                field('ПРОВАЙДЕР') + `<select onchange="updateNode('${nodeId}','aiProvider',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;margin-bottom:0.75rem;">
                    <option value="openai" ${node.aiProvider!=='anthropic'?'selected':''}>OpenAI GPT-4o-mini</option>
                    <option value="anthropic" ${node.aiProvider==='anthropic'?'selected':''}>Anthropic claude-haiku</option>
                </select>`;
        }

        if (node.type === 'delay') {
            specific = field('ЗАТРИМКА (хвилин)') + input(node.delay||0, `updateNode('${nodeId}','delay',parseInt(this.value)||0)`, '60', 'number');
        }

        if (node.type === 'talko_task') {
            specific = field('ЗАГОЛОВОК ЗАДАЧІ') + input(node.taskTitle||'', `updateNode('${nodeId}','taskTitle',this.value)`, 'Опрацювати ліда') +
                field('ВІДПОВІДАЛЬНИЙ (роль)') + `<select onchange="updateNode('${nodeId}','taskAssignRole',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;margin-bottom:0.75rem;">
                    <option value="owner">Власник</option>
                    <option value="manager">Менеджер</option>
                </select>` +
                field('ПРІОРИТЕТ') + `<select onchange="updateNode('${nodeId}','taskPriority',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
                    <option value="high">🔴 Високий</option>
                    <option value="medium" selected>🟡 Середній</option>
                    <option value="low">🟢 Низький</option>
                </select>`;
        }

        if (node.type === 'talko_deal') {
            specific = field('НАЗВА УГОДИ') + input(node.dealTitle||'', `updateNode('${nodeId}','dealTitle',this.value)`, '{contact.name} — запит з боту') +
                field('СТАДІЯ') + input(node.dealStage||'new', `updateNode('${nodeId}','dealStage',this.value)`, 'new');
        }

        if (node.type === 'tag') {
            specific = field('ТЕГ') + input(node.tagName||'', `updateNode('${nodeId}','tagName',this.value)`, 'telegram-bot');
        }

        if (node.type === 'human') {
            specific = `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:0.75rem;font-size:0.82rem;color:#9a3412;margin-bottom:0.75rem;">
                👤 Цей вузол передає розмову живому менеджеру. Бот надішле сповіщення в TALKO і зупинить автоматичні відповіді до вирішення.
            </div>` + field('ПОВІДОМЛЕННЯ ДЛЯ КЛІЄНТА') + textarea(node.text||'Дякую! Зараз передам вас до менеджера.', `updateNode('${nodeId}','text',this.value)`);
        }

        if (node.type === 'end') {
            specific = field('ФІНАЛЬНЕ ПОВІДОМЛЕННЯ') + textarea(node.text||'Дякуємо за звернення! До зустрічі. 👋', `updateNode('${nodeId}','text',this.value)`);
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
        node.options.push({ text: 'Варіант ' + (node.options.length + 1), nextNode: null });
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
            await firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .collection('flows').doc(botsCurrentFlowId)
                .update({ nodes: botsFlowNodes, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (typeof showToast === 'function') showToast('Збережено ✓', 'success');
        } catch (e) { alert('Помилка: ' + e.message); }
    };

    // ── Sessions View ──────────────────────────────────────
    async function renderBotsSessionsView() {
        const container = document.getElementById('botsSessionsView');
        if (!container || botsSubTab !== 'sessions') return;
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af;">Завантаження...</div>';

        try {
            const snap = await firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .collection('sessions').orderBy('lastActivity', 'desc').limit(100).get();
            const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            container.innerHTML = `
                <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;">Активні сесії (${sessions.length})</div>
                ${sessions.length === 0 ? '<div style="text-align:center;padding:2rem;color:#9ca3af;background:white;border-radius:12px;box-shadow:var(--shadow);">Сесій поки немає</div>' :
                `<div style="display:flex;flex-direction:column;gap:0.5rem;">
                    ${sessions.map(s => {
                        const statusColor = s.status === 'active' ? '#22c55e' : s.status === 'waiting_human' ? '#f97316' : '#9ca3af';
                        const flow = botsFlows.find(f => f.id === s.flowId);
                        return `<div style="background:white;border-radius:10px;padding:0.75rem;box-shadow:var(--shadow);display:flex;align-items:center;gap:0.75rem;">
                            <div style="width:10px;height:10px;border-radius:50%;background:${statusColor};flex-shrink:0;"></div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-weight:600;font-size:0.85rem;">${escH(s.contactName || s.chatId || 'Анонім')}</div>
                                <div style="font-size:0.75rem;color:#6b7280;">${flow?.name || s.flowId || ''} · ${s.currentNodeId || 'вузол 0'}</div>
                            </div>
                            <div style="font-size:0.72rem;color:#9ca3af;">${s.lastActivity?.toDate ? relTime(s.lastActivity.toDate()) : ''}</div>
                            ${s.status === 'waiting_human' ? `<button onclick="resolveHumanSession('${s.id}')" style="padding:0.3rem 0.6rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.75rem;">Вирішити</button>` : ''}
                        </div>`;
                    }).join('')}
                </div>`}`;
        } catch (e) {
            container.innerHTML = '<div style="color:#ef4444;padding:1rem;">Помилка завантаження</div>';
        }
    }

    window.resolveHumanSession = async function (sessionId) {
        await firebase.firestore().collection('companies').doc(window.currentCompanyId)
            .collection('sessions').doc(sessionId)
            .update({ status: 'resolved', resolvedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof showToast === 'function') showToast('Сесію вирішено', 'success');
        renderBotsSessionsView();
    };

    // ── Settings View ──────────────────────────────────────
    async function renderBotsSettingsView() {
        const container = document.getElementById('botsSettingsView');
        if (!container || botsSubTab !== 'settings') return;

        const compDoc = await firebase.firestore().collection('companies').doc(window.currentCompanyId).get();
        const compData = compDoc.data() || {};

        container.innerHTML = `
            <div style="background:white;border-radius:12px;padding:1.25rem;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:1rem;">
                <h3 style="font-weight:700;font-size:0.95rem;margin-bottom:0.25rem;">🔑 API Ключі (BYOK)</h3>

                <div>
                    <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">OPENAI API KEY</label>
                    <div style="display:flex;gap:0.5rem;">
                        <input type="password" id="botsOpenAIKey" value="${compData.openaiApiKey ? '••••••••' + compData.openaiApiKey.slice(-4) : ''}"
                            placeholder="sk-..."
                            style="flex:1;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                        <button onclick="saveBotApiKey('openai')" style="padding:0.55rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">Зберегти</button>
                    </div>
                </div>

                <div>
                    <label style="font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;">ANTHROPIC API KEY</label>
                    <div style="display:flex;gap:0.5rem;">
                        <input type="password" id="botsAnthropicKey" value="${compData.anthropicApiKey ? '••••••••' + compData.anthropicApiKey.slice(-4) : ''}"
                            placeholder="sk-ant-..."
                            style="flex:1;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                        <button onclick="saveBotApiKey('anthropic')" style="padding:0.55rem 0.9rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">Зберегти</button>
                    </div>
                </div>

                <div style="background:#f0fdf4;border-radius:10px;padding:0.75rem;font-size:0.82rem;color:#166534;">
                    <strong>Як підключити Telegram бота:</strong><br>
                    1. Створіть бота через @BotFather → отримайте токен<br>
                    2. Встановіть у Firebase Functions: <code style="background:white;padding:1px 4px;border-radius:3px;">firebase functions:secrets:set TELEGRAM_BOT_TOKEN</code><br>
                    3. Встановіть вебхук: <code style="background:white;padding:1px 4px;border-radius:3px;">https://api.telegram.org/bot{TOKEN}/setWebhook?url={FUNCTIONS_URL}/telegramWebhook</code>
                </div>
            </div>`;
    }

    window.saveBotApiKey = async function (provider) {
        const inputId = provider === 'openai' ? 'botsOpenAIKey' : 'botsAnthropicKey';
        const key = document.getElementById(inputId)?.value.trim();
        if (!key || key.includes('•')) return;
        const field = provider === 'openai' ? 'openaiApiKey' : 'anthropicApiKey';
        try {
            await firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .update({ [field]: key });
            if (typeof showToast === 'function') showToast('Ключ збережено ✓', 'success');
            document.getElementById(inputId).value = '••••••••' + key.slice(-4);
        } catch (e) { alert('Помилка: ' + e.message); }
    };

    // ── Helpers ────────────────────────────────────────────
    function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function relTime(d) {
        const diff = Date.now() - d.getTime();
        const m = Math.floor(diff/60000);
        if (m<1) return 'щойно'; if (m<60) return m+'хв';
        const h = Math.floor(m/60); if (h<24) return h+'год';
        return Math.floor(h/24)+'дн';
    }

    // ── Tab hook ───────────────────────────────────────────
    const _origST = window.switchTab;
    window.switchTab = function (tab) {
        if (_origST) _origST(tab);
        if (tab === 'bots') {
            if (window.isFeatureEnabled && window.isFeatureEnabled('bots')) {
                if (typeof initBotsModule === 'function' && botsFlows.length === 0) {
                    initBotsModule();
                } else {
                    renderBotsListView();
                }
            }
        }
    };

    window.destroyBotsModule = function () {
        if (botsUnsubscribe) botsUnsubscribe();
        botsUnsubscribe = null;
    };

})();
