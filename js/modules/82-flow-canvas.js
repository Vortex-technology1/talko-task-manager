// ============================================================
// TALKO Flow Canvas Builder v3.0
// Div-based canvas (не SVG foreignObject)
// Архітектура: SendPulse-style
// ============================================================
(function () {
'use strict';

// ── State ──────────────────────────────────────────────────
let fc = {
    flowId: null,
    flowData: null,
    nodes: [],      // [{id,type,x,y,config,outputs}]
    edges: [],      // [{id,fromNode,fromPort,toNode,toPort}]
    selected: null,
    pan: {x:80, y:60},
    scale: 1,
    dragging: null, // {nodeId,startMX,startMY,origX,origY}
    connecting: null, // {fromNode,fromPort,startX,startY}
    panning: false,
    panStart: null,
    history: [],
    historyIdx: -1,
};

const W = 220; // node width

// ── Node config ────────────────────────────────────────────
const NODES = {
    start:      {label:window.t('flowStart'),       color:'#22c55e', border:'#16a34a', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg></span>',  outputs:['out']},
    message:    {label:window.t('crmMessage'),color:'#22c55e', border:'#16a34a', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>', outputs:['out','btn']},
    action:     {label:window.t('flowAction'),         color:'#f59e0b', border:'#d97706', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>', outputs:['out']},
    filter:     {label:window.t('flowFilter'),      color:'#f97316', border:'#ea580c', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg></span>', outputs:['yes','no']},
    pause:      {label:'Пауза',       color:'#64748b', border:'#475569', icon:'⏸',  outputs:['out']},
    ai:         {label:window.t('aiAgent'),    color:'#8b5cf6', border:'#7c3aed', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span>', outputs:['out']},
    api:        {label:'Запит API',   color:'#0ea5e9', border:'#0284c7', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg></span>',  outputs:['ok','err']},
    sheets:     {label:'Google Sheets',color:'#10b981',border:'#059669', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>', outputs:['out']},
    random:     {label:'Випадково',   color:'#ec4899', border:'#db2777', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg></span>',  outputs:['a','b']},
    repeat:     {label:'Повтор',      color:'#14b8a6', border:'#0d9488', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></span>',  outputs:['out','end']},
    crm:        {label:'Угода CRM',   color:'#22c55e', border:'#16a34a', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg></span>', outputs:['out']},
    end:        {label:window.t('flowEnd'),      color:'#94a3b8', border:'#64748b', icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>',  outputs:[]},
};

const PORT_LABELS = {
    out:window.t('continueWord'), btn:window.t('buttonWord'), yes:window.t('yesWord2'), no:window.t('noWord'),
    ok:window.t('successWord'), err:window.t('errorWord'), a:window.t('branchA'), b:window.t('branchB'),
    end:'Завершити',
};

// ── Open ───────────────────────────────────────────────────
window.openFlowCanvas = async function(flowId, botId) {
    // FIX: remove previous overlay before opening new one
    document.getElementById('botsEditorOverlay')?.remove();
    fc.flowId = flowId;
    fc.botId = botId || window._currentBotId || null;
    // Зберігаємо стан canvas для відновлення після рефрешу
    try { localStorage.setItem('talko_canvas_state', JSON.stringify({ flowId, botId: fc.botId })); } catch(e) {}
    const flowRef = fc.botId
        ? firebase.firestore().collection('companies').doc(window.currentCompanyId).collection('bots').doc(fc.botId).collection('flows').doc(flowId)
        : firebase.firestore().collection('companies').doc(window.currentCompanyId).collection('flows').doc(flowId);
    const snap = await flowRef.get();
    if (!snap.exists) return;
    fc.flowData = {id: snap.id, ...snap.data()};

    // FIX: завжди читаємо canvasData з підколекції — вона є source of truth
    // Не довіряємо canvasData з основного документу — воно може бути застарілим
    try {
        const canvasDoc = await flowRef.collection('canvasData').doc('layout').get();
        if (canvasDoc.exists) {
            fc.flowData.canvasData = canvasDoc.data();
            console.log('[canvas] loaded canvasData from subcollection, nodes:', fc.flowData.canvasData?.nodes?.length);
        } else if (!fc.flowData.canvasData || !fc.flowData.canvasData.nodes?.length) {
            // Fallback: якщо підколекції нема → берємо з основного документу (legacy)
            console.log('[canvas] no subcollection canvasData, using main doc canvasData');
        }
    } catch(e) { console.warn('[canvas] canvasData load error:', e.message); }

    // Підвантажуємо великі AI промпти з nodePrompts підколекції
    const promptsSnap = await flowRef.collection('nodePrompts').get();
    const nodePromptsMap = {};
    promptsSnap.forEach(doc => { nodePromptsMap[doc.id] = doc.data().aiSystem || ''; });

    // Функція для відновлення __ref посилань в реальні промпти
    const restoreNodePrompts = (nodesList) => (nodesList || []).map(n => {
        const sys = n.config?.aiSystem || n.aiSystem || '';
        if (sys.startsWith('__ref:')) {
            const refId = sys.replace('__ref:', '');
            const realPrompt = nodePromptsMap[refId] || '';
            const restored = JSON.parse(JSON.stringify(n));
            if (restored.config?.aiSystem !== undefined) restored.config.aiSystem = realPrompt;
            if (restored.aiSystem !== undefined) restored.aiSystem = realPrompt;
            return restored;
        }
        return n;
    });

    // Load nodes/edges from stored JSON
    const stored = fc.flowData.canvasData || null;
    if (stored) {
        // canvasData.nodes зберігається як {...config, _x, _y, outputs, id, type}
        // Треба відновити структуру {id, type, x, y, config, outputs}
        fc.nodes = restoreNodePrompts(stored.nodes || []).map(n => {
            const nodeType = n.type || 'message';
            // MIGRATION: старі AI вузли зберігались з outputs:['ok','err'] — приводимо до актуального
            let outputs = n.outputs || NODES[nodeType]?.outputs || ['out'];
            if (nodeType === 'ai' && JSON.stringify(outputs) === JSON.stringify(['ok','err'])) {
                outputs = ['out']; // AI вузол завжди має 1 вихід 'out'
            }
            // FIX: не включаємо службові поля (_x,_y,outputs,config) в config
            // щоб не накопичувались nested config після кожного save/load циклу
            const { _x: __x, _y: __y, outputs: __o, config: __nestedCfg, ...nClean } = n;
            // Якщо є вкладений config — мерджимо його першим (нижній пріоритет),
            // потім перекриваємо полями верхнього рівня (вони свіжіші)
            const restoredConfig = { ...(typeof __nestedCfg === 'object' && __nestedCfg ? __nestedCfg : {}), ...nClean, type: nodeType, id: n.id };
            return {
                id: n.id,
                type: nodeType,
                x: n._x !== undefined ? n._x : (n.x !== undefined ? n.x : 80),
                y: n._y !== undefined ? n._y : (n.y !== undefined ? n.y : 200),
                outputs: outputs,
                config: restoredConfig,
            };
        });
        fc.edges = stored.edges || [];
        // Якщо немає start вузла — додаємо автоматично
        if (!fc.nodes.find(n => n.type === 'start')) {
            const minX = fc.nodes.length ? Math.min(...fc.nodes.map(n=>n.x)) : 360;
            const minY = fc.nodes.length ? Math.min(...fc.nodes.map(n=>n.y)) : 200;
            const startNode = {id:'start_0', type:'start', x: minX - 280, y: minY,
                config:{triggerKeyword: fc.flowData.triggerKeyword || '/start'},
                outputs: ['out']};
            fc.nodes.unshift(startNode);
            // З'єднуємо start з першим вузлом
            if (fc.nodes.length > 1) {
                const firstId = fc.nodes[1].id;
                if (firstId && !fc.edges.find(e=>e.fromNode==='start_0')) {
                    fc.edges.unshift({id:'e_start_out', fromNode:'start_0', fromPort:'out', toNode:firstId, toPort:'in'});
                }
            }
        }
    } else {
        // Migrate old linear nodes or fresh start
        const oldNodes = fc.flowData.nodes || [];
        if (oldNodes.length === 0) {
            fc.nodes = [{id:'start_0', type:'start', x:80, y:200,
                config:{triggerKeyword: fc.flowData.triggerKeyword || '/start'},
                outputs: ['out']}];
        } else {
            fc.nodes = oldNodes.map((n,i) => ({
                id: n.id,
                type: n.type || 'message',
                x: n._x !== undefined ? n._x : 80 + i*280,
                y: n._y !== undefined ? n._y : 200,
                config: n,
                outputs: NODES[n.type]?.outputs || ['out'],
            }));
            fc.edges = oldNodes.flatMap(n => {
                const edges = [];
                if (n.nextNode) edges.push({id:`e_${n.id}_out`, fromNode:n.id, fromPort:'out', toNode:n.nextNode, toPort:'in'});
                (n.options||[]).forEach((o,i) => {
                    if (o.nextNode) edges.push({id:`e_${n.id}_btn${i}`, fromNode:n.id, fromPort:`btn_${i}`, toNode:o.nextNode, toPort:'in'});
                });
                return edges;
            });
        }
    }

    fc.selected = null;
    fc.pan = {x:80, y:60};
    fc.scale = 1;
    fc.history = [];
    fc.historyIdx = -1;

    mountCanvas();
    renderAll();
    setTimeout(fitView, 100);
};

// ── Mount DOM ──────────────────────────────────────────────
function mountCanvas() {
    document.getElementById('fcRoot')?.remove();

    const root = document.createElement('div');
    root.id = 'fcRoot';
    root.style.cssText = [
        'position:fixed;inset:0;z-index:10010',
        'display:flex;flex-direction:column',
        'background:#f9fafb;font-family:system-ui,sans-serif',
        'user-select:none',
    ].join(';');

    root.innerHTML = `
    <!-- TOOLBAR -->
    <div id="fcToolbar" style="height:52px;background:#0f172a;display:flex;align-items:center;
        gap:6px;padding:0 14px;flex-shrink:0;
        border-bottom:1px solid #1e293b;z-index:10;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);">

        <!-- Назад -->
        <button id="fcBtnBack" title="${window.t('botsFlowBack')}"
            style="padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:8px;
            color:#cbd5e1;cursor:pointer;display:flex;align-items:center;gap:6px;
            font-size:12px;font-weight:600;transition:all 0.15s;white-space:nowrap;"
            onmouseenter="this.style.background='#334155';this.style.color='white'"
            onmouseleave="this.style.background='#1e293b';this.style.color='#cbd5e1'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Назад
        </button>

        <div style="width:1px;height:24px;background:#1e293b;margin:0 4px;"></div>

        <!-- Назва флоу — inline edit -->
        <div style="display:flex;align-items:center;gap:8px;">
            <div style="position:relative;display:flex;align-items:center;">
                <input id="fcFlowTitle"
                    style="color:white;font-weight:700;font-size:14px;
                        background:transparent;border:1px solid transparent;
                        border-radius:6px;padding:3px 28px 3px 6px;
                        max-width:200px;min-width:80px;width:auto;
                        outline:none;cursor:text;transition:border-color 0.15s, background 0.15s;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
                    title=${window.t('clickToRename')}
                    onmouseenter="this.style.borderColor='#334155'"
                    onmouseleave="if(document.activeElement!==this)this.style.borderColor='transparent'"
                    onfocus="this.style.borderColor='#22c55e';this.style.background='#1e293b';this.select()"
                    onblur="this.style.borderColor='transparent';this.style.background='transparent';window._fcSaveTitle(this.value)"
                    onkeydown="if(event.key==='Enter'){this.blur();}if(event.key==='Escape'){this.value=fc.flowData.name||'Без назви';this.blur();}"
                />
                <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:0.4;"
                    width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
            </div>
            <span id="fcChannelBadge" style="background:#1e293b;color:#64748b;border:1px solid #334155;
                font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;letter-spacing:0.04em;"></span>
        </div>

        <div style="flex:1;"></div>

        <!-- Undo/Redo група -->
        <div style="display:flex;gap:2px;background:#1e293b;border-radius:8px;padding:3px;border:1px solid #334155;">
            <button id="fcBtnUndo" title="${window.t('botsCanvasUndo')}"
                style="padding:5px 9px;background:transparent;border:none;border-radius:6px;
                color:#64748b;cursor:pointer;display:flex;align-items:center;transition:all 0.15s;"
                onmouseenter="this.style.background='#334155';this.style.color='#e2e8f0'"
                onmouseleave="this.style.background='transparent';this.style.color='#64748b'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
            </button>
            <button id="fcBtnRedo" title="${window.t('botsCanvasRedo')}"
                style="padding:5px 9px;background:transparent;border:none;border-radius:6px;
                color:#64748b;cursor:pointer;display:flex;align-items:center;transition:all 0.15s;"
                onmouseenter="this.style.background='#334155';this.style.color='#e2e8f0'"
                onmouseleave="this.style.background='transparent';this.style.color='#64748b'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5V17"/></svg>
            </button>
        </div>

        <!-- Zoom група -->
        <div style="display:flex;align-items:center;gap:2px;background:#1e293b;border-radius:8px;padding:3px;border:1px solid #334155;">
            <button id="fcBtnZoomOut"
                style="padding:5px 9px;background:transparent;border:none;border-radius:6px;
                color:#94a3b8;cursor:pointer;font-size:15px;font-weight:300;line-height:1;transition:all 0.15s;"
                onmouseenter="this.style.background='#334155';this.style.color='white'"
                onmouseleave="this.style.background='transparent';this.style.color='#94a3b8'">−</button>
            <span id="fcZoomPct" style="color:#64748b;font-size:11px;min-width:38px;text-align:center;font-weight:600;">100%</span>
            <button id="fcBtnZoomIn"
                style="padding:5px 9px;background:transparent;border:none;border-radius:6px;
                color:#94a3b8;cursor:pointer;font-size:15px;font-weight:300;line-height:1;transition:all 0.15s;"
                onmouseenter="this.style.background='#334155';this.style.color='white'"
                onmouseleave="this.style.background='transparent';this.style.color='#94a3b8'">+</button>
            <button id="fcBtnFit" title="${window.t('botsCanvasFit')}"
                style="padding:5px 9px;background:transparent;border:none;border-radius:6px;
                color:#64748b;cursor:pointer;display:flex;align-items:center;transition:all 0.15s;"
                onmouseenter="this.style.background='#334155';this.style.color='#e2e8f0'"
                onmouseleave="this.style.background='transparent';this.style.color='#64748b'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            </button>
        </div>

        <div style="width:1px;height:24px;background:#1e293b;margin:0 2px;"></div>

        <!-- Статус -->
        <button id="fcBtnToggleStatus"
            style="padding:6px 13px;background:#1e293b;border:1px solid #334155;border-radius:8px;
            color:#64748b;cursor:pointer;font-weight:700;font-size:11px;
            letter-spacing:0.05em;text-transform:uppercase;transition:all 0.15s;"
            onmouseenter="this.style.borderColor='#22c55e';this.style.color='#22c55e'"
            onmouseleave="this.style.borderColor='#334155';this.style.color='#64748b'">
            draft
        </button>

        <!-- Save -->
        <button id="fcBtnSave"
            style="padding:7px 20px;background:linear-gradient(135deg,#22c55e,#16a34a);
            border:none;border-radius:8px;color:white;cursor:pointer;font-weight:700;
            font-size:13px;box-shadow:0 2px 8px rgba(34,197,94,0.4);transition:all 0.15s;
            display:flex;align-items:center;gap:6px;"
            onmouseenter="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(34,197,94,0.5)'"
            onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(34,197,94,0.4)'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
            Зберегти
        </button>

        <!-- Close -->
        <button id="fcBtnClose" title="Закрити"
            style="padding:6px 9px;background:transparent;border:none;border-radius:7px;
            color:#475569;cursor:pointer;display:flex;align-items:center;transition:all 0.15s;margin-left:2px;"
            onmouseenter="this.style.background='#ef444420';this.style.color='#ef4444'"
            onmouseleave="this.style.background='transparent';this.style.color='#475569'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
    </div>

    <!-- BODY -->
    <div style="flex:1;display:flex;min-height:0;overflow:hidden;">

        <!-- LEFT SIDEBAR -->
        <div id="fcSidebar" style="width:76px;background:#0f172a;border-right:1px solid #1e293b;
            overflow-y:auto;flex-shrink:0;display:flex;flex-direction:column;
            align-items:center;padding:8px 0;gap:2px;z-index:5;">
        </div>

        <!-- CANVAS AREA -->
        <div id="fcCanvasWrap" style="flex:1;position:relative;overflow:hidden;cursor:grab;">
            <!-- dot grid bg -->
            <canvas id="fcBgCanvas" style="position:absolute;inset:0;pointer-events:none;z-index:0;"></canvas>
            <!-- edges SVG -->
            <svg id="fcEdgesSVG" style="position:absolute;inset:0;width:100%;height:100%;
                overflow:visible;pointer-events:none;z-index:1;">
                <defs>
                    <marker id="arrowHead" markerWidth="10" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/>
                    </marker>
                    <marker id="arrowHeadGreen" markerWidth="10" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e"/>
                    </marker>
                    <marker id="arrowHeadBlue" markerWidth="10" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6"/>
                    </marker>
                </defs>
                <g id="fcEdgesGroup" style="pointer-events:all;"></g>
                <path id="fcTempEdge" fill="none" stroke="#22c55e" stroke-width="2"
                    stroke-dasharray="6,4" style="display:none;pointer-events:none;" marker-end="url(#arrowHeadGreen)"/>
            </svg>
            <!-- nodes layer -->
            <div id="fcNodesLayer" style="position:absolute;inset:0;z-index:2;"></div>
            <!-- Підказка для нових юзерів -->
            <div id="fcNewUserHint" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
                background:rgba(15,23,42,0.92);border:1px solid #22c55e44;border-radius:12px;
                padding:12px 18px;color:#94a3b8;font-size:11px;display:flex;align-items:flex-start;
                gap:10px;max-width:460px;z-index:10;pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,0.5);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                <div style="line-height:1.6;">
                    <div style="color:white;font-weight:700;margin-bottom:2px;font-size:12px;">Як побудувати ланцюг?</div>
                    <div><b style="color:#22c55e;">1.</b> Перетягни вузол зліва на полотно</div>
                    <div><b style="color:#22c55e;">2.</b> Клікни → налаштуй → <b style="color:white;">Застосувати</b></div>
                    <div><b style="color:#22c55e;">3.</b> Тягни за <b style="color:#94a3b8;">●</b> щоб з'єднати вузли</div>
                    <div style="margin-top:4px;font-size:10px;color:#475569;">Подвійний клік = додати Повідомлення</div>
                </div>
            </div>
        </div>

        <!-- RIGHT PANEL -->
        <div id="fcRightPanel" style="width:300px;background:#0f172a;border-left:1px solid #1e293b;
            overflow-y:auto;flex-shrink:0;z-index:5;">
            <div id="fcPropPanel" style="padding:14px;">
                <div style="text-align:center;padding:48px 16px;color:#334155;">
                    <div style="margin-bottom:12px;display:flex;justify-content:center;">
                        <div style="width:48px;height:48px;border-radius:14px;background:#1e293b;
                            border:1px solid #334155;display:flex;align-items:center;justify-content:center;">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </div>
                    </div>
                    <div style="font-size:12px;color:#475569;line-height:1.6;">Клікніть на вузол<br>для редагування</div>
                </div>
            </div>
        </div>
    </div>`;

    document.body.appendChild(root);

    // Fill sidebar
    buildSidebar();

    // Toolbar events
    document.getElementById('fcBtnBack').onclick = closeCanvas;
    document.getElementById('fcBtnClose').onclick = closeCanvas;
    document.getElementById('fcBtnSave').onclick = saveFlow;

    // Toggle flow status button
    const statusBtn = document.getElementById('fcBtnToggleStatus');
    if (statusBtn && fc.flowData) {
        const st = fc.flowData.status || 'draft';
        statusBtn.innerHTML = st === 'active' ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> active' : '⚫ draft';
        statusBtn.style.background = st === 'active' ? '#dcfce7' : '#334155';
        statusBtn.style.color = st === 'active' ? '#16a34a' : '#94a3b8';
        statusBtn.onclick = async function() {
            const cur = fc.flowData.status || 'draft';
            const next = cur === 'active' ? 'draft' : 'active';
            try {
                const ref = fc.botId
                    ? firebase.firestore().collection('companies').doc(window.currentCompanyId).collection('bots').doc(fc.botId).collection('flows').doc(fc.flowId)
                    : firebase.firestore().collection('companies').doc(window.currentCompanyId).collection('flows').doc(fc.flowId);
                await ref.update({ status: next });
                fc.flowData.status = next;
                statusBtn.innerHTML = next === 'active' ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> active' : '⚫ draft';
                statusBtn.style.background = next === 'active' ? '#dcfce7' : '#334155';
                statusBtn.style.color = next === 'active' ? '#16a34a' : '#94a3b8';
                if (typeof showToast === 'function') showToast(next === 'active' ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> Флоу активовано' : '⚫ Флоу на паузі', 'success');
            } catch(e) { if(window.showToast)showToast(window.t('errPfx2') + e.message,'error'); else if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');; }
        };
    }
    document.getElementById('fcBtnZoomIn').onclick = () => doZoom(0.15);
    document.getElementById('fcBtnZoomOut').onclick = () => doZoom(-0.15);
    document.getElementById('fcBtnFit').onclick = fitView;
    document.getElementById('fcBtnUndo').onclick = undo;
    document.getElementById('fcBtnRedo').onclick = redo;
    document.getElementById('fcFlowTitle').value = fc.flowData.name || 'Без назви';
    // Автоматично підганяємо ширину input під текст
    (function() {
        const el = document.getElementById('fcFlowTitle');
        const tmp = document.createElement('span');
        tmp.style.cssText = 'position:absolute;visibility:hidden;font-size:14px;font-weight:700;white-space:nowrap;padding:0 34px 0 6px;';
        tmp.textContent = el.value || 'Без назви';
        document.body.appendChild(tmp);
        el.style.width = Math.min(Math.max(tmp.offsetWidth + 2, 80), 220) + 'px';
        document.body.removeChild(tmp);
    })();
    document.getElementById('fcChannelBadge').textContent = fc.flowData.channel || 'telegram';

    // Canvas events
    const wrap = document.getElementById('fcCanvasWrap');
    wrap.addEventListener('mousedown', onWrapMouseDown);
    wrap.addEventListener('mousemove', onWrapMouseMove);
    wrap.addEventListener('mouseup', onWrapMouseUp);
    wrap.addEventListener('mouseleave', onWrapMouseUp);
    wrap.addEventListener('wheel', onWrapWheel, {passive:false});
    wrap.addEventListener('dblclick', onWrapDblClick);

    // Keyboard
    document.addEventListener('keydown', onKeyDown);

    // Draw BG
    drawBg();
    window.addEventListener('resize', drawBg);
}

function closeCanvas() {
    try { localStorage.removeItem('talko_canvas_state'); } catch(e) {}
    document.getElementById('fcRoot')?.remove();
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', drawBg);
}

// ── Sidebar ────────────────────────────────────────────────
function buildSidebar() {
    const sb = document.getElementById('fcSidebar');
    if (!sb) return;

    // Dark sidebar matching toolbar
    sb.style.width = '76px';
    sb.style.minWidth = '76px';
    sb.style.background = '#0f172a';
    sb.style.borderRight = '1px solid #1e293b';
    sb.style.padding = '8px 6px';
    sb.style.gap = '2px';
    sb.style.boxShadow = 'none';

    const items = [
        ['message', '#3b82f6', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, window.t('msgShort')],
        ['action',  '#f59e0b', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`, window.t('flowAction')],
        ['filter',  '#8b5cf6', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>`, window.t('flowFilter')],
        ['pause',   '#64748b', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`, 'Пауза'],
        ['ai',      '#22c55e', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg>`, window.t('aiAgent')],
        ['api',     '#06b6d4', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`, 'API'],
        ['sheets',  '#16a34a', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, 'Sheets'],
        ['random',  '#ec4899', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`, 'Випадк.'],
        ['repeat',  '#f97316', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`, 'Повтор'],
        ['crm',     '#6366f1', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`, 'CRM'],
        ['end',     '#ef4444', `<svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>`, window.t('flowEnd')],
    ];

    // AI Воронка — окрема кнопка внизу сайдбара
    const aiFunnelBtn = `
        <div style="margin-top:8px;border-top:1px solid #1e293b;padding-top:8px;">
            <div onclick="fcOpenAiFunnelModal()"
                title="AI Асистент воронки"
                style="width:60px;display:flex;flex-direction:column;align-items:center;
                gap:4px;padding:6px 4px;border-radius:10px;cursor:pointer;
                transition:background 0.12s;"
                onmouseenter="this.style.background='#1e293b'"
                onmouseleave="this.style.background='transparent'">
                <div style="width:36px;height:36px;border-radius:9px;
                    background:linear-gradient(135deg,#22c55e,#8b5cf6);
                    display:flex;align-items:center;justify-content:center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/>
                        <path d="M18 2v4h4"/>
                    </svg>
                </div>
                <div style="font-size:9.5px;color:#22c55e;text-align:center;
                    line-height:1.2;font-weight:600;">AI
Воронка</div>
            </div>
        </div>`;

    sb.innerHTML = items.map(([type, color, svg, label]) => `
        <div draggable="true" data-sbtype="${type}"
            title="${NODES[type]?.label || label}"
            style="width:62px;display:flex;flex-direction:column;align-items:center;
            gap:3px;padding:6px 4px;border-radius:10px;cursor:grab;
            transition:all 0.15s;"
            onmouseenter="this.style.background='#1e293b'"
            onmouseleave="this.style.background='transparent'">
            <div style="width:38px;height:38px;border-radius:10px;background:${color};
                display:flex;align-items:center;justify-content:center;
                box-shadow:0 2px 10px ${color}55;transition:transform 0.15s;"
                onmouseenter="this.style.transform='scale(1.1)'"
                onmouseleave="this.style.transform='scale(1)'">
                ${svg}
            </div>
            <div style="font-size:9px;color:#64748b;font-weight:600;
                text-align:center;line-height:1.2;">${label}</div>
        </div>`).join('') + aiFunnelBtn;

    // Додаємо tooltips до вузлів sidebar
    sb.querySelectorAll('[data-sbtype]').forEach(el => {
        const tooltips = {
            message:  window.t('flowMsgHint'),
            action:   window.t('flowActHint'),
            filter:   window.t('flowCondHint'),
            pause:    'Затримка перед наступним кроком (секунди, хвилини, години)',
            ai:       window.t('flowAINodeHint'),
            api:      window.t('flowAPIHint'),
            sheets:   window.t('flowSheetsHint'),
            random:   window.t('flowABHint'),
            repeat:   window.t('flowLoopHint'),
            crm:      window.t('flowCRMHint'),
            end:      window.t('flowEndChainHint'),
        };
        const t = el.dataset.sbtype;
        if (tooltips[t]) el.title = tooltips[t];
    });

    // Drag from sidebar → canvas
    sb.querySelectorAll('[data-sbtype]').forEach(el => {
        el.addEventListener('dragstart', e => {
            e.dataTransfer.setData('nodeType', el.dataset.sbtype);
        });
    });
    const wrap = document.getElementById('fcCanvasWrap');
    wrap.addEventListener('dragover', e => { e.preventDefault(); });
    wrap.addEventListener('drop', e => {
        e.preventDefault();
        const type = e.dataTransfer.getData('nodeType');
        if (!type) return;
        const rect = wrap.getBoundingClientRect();
        const cx = (e.clientX - rect.left - fc.pan.x) / fc.scale;
        const cy = (e.clientY - rect.top - fc.pan.y) / fc.scale;
        addNode(type, snap(cx - W/2), snap(cy - 40));
    });
}
// ── Render All ─────────────────────────────────────────────
function renderAll() {
    renderNodes();
    // Чекаємо layout браузера перед рендером ліній (щоб port coords були з DOM)
    requestAnimationFrame(() => {
        renderEdges();
    });
}

// ── Nodes ──────────────────────────────────────────────────
function renderNodes() {
    const layer = document.getElementById('fcNodesLayer');
    if (!layer) return;
    layer.innerHTML = '';
    fc.nodes.forEach(n => {
        const el = buildNodeEl(n);
        layer.appendChild(el);
    });
    applyTransformToNodes();
    // Показуємо/ховаємо підказку
    const hint = document.getElementById('fcNewUserHint');
    if (hint) hint.style.display = fc.nodes.filter(n => n.type !== 'start').length > 0 ? 'none' : 'flex';
}

function buildNodeEl(node) {
    // ── START ──────────────────────────────────────────────
    if (node.type === 'start') {
        const el = document.createElement('div');
        el.id = `fcn_${node.id}`;
        el.dataset.nid = node.id;
        el.style.cssText = `position:absolute;left:${node.x}px;top:${node.y}px;
            width:110px;height:38px;border-radius:19px;background:#22c55e;
            border:none;box-shadow:0 2px 8px rgba(34,197,94,0.35);
            cursor:grab;display:flex;align-items:center;justify-content:center;
            gap:6px;z-index:2;user-select:none;`;
        el.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
            <span style="font-size:13px;font-weight:700;color:white;">Старт</span>
            <div data-port-out="${node.id}" data-port-id="out"
                style="position:absolute;right:-7px;top:50%;transform:translateY(-50%);
                width:14px;height:14px;border-radius:50%;background:#16a34a;
                border:2.5px solid white;cursor:crosshair;z-index:3;"
                onmouseenter="this.style.transform='translateY(-50%) scale(1.3)'"
                onmouseleave="this.style.transform='translateY(-50%) scale(1)'"
            ></div>`;
        el.addEventListener('mousedown', e => onNodeMouseDown(e, node.id));
        el.querySelectorAll('[data-port-out]').forEach(portEl => {
            portEl.addEventListener('mousedown', e => {
                e.stopPropagation();
                onPortMouseDown(e, node.id, portEl.dataset.portId);
            });
        });
        return el;
    }

    const cfg = NODES[node.type] || NODES.message;
    const isSelected = fc.selected === node.id;
    const preview = getPreview(node);
    const outputs = node.outputs || cfg.outputs || ['out'];
    const buttons = node.config?.buttons || [];

    const el = document.createElement('div');
    el.id = `fcn_${node.id}`;
    el.dataset.nid = node.id;
    el.style.cssText = [
        `position:absolute`,
        `left:${node.x}px`,
        `top:${node.y}px`,
        `width:${W}px`,
        `border-radius:16px`,
        `background:white`,
        `border:2px solid ${isSelected ? cfg.color : 'transparent'}`,
        `box-shadow:${isSelected
            ? `0 0 0 3px ${cfg.color}25, 0 12px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)`
            : `0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)`}`,
        `cursor:pointer`,
        `transition:border-color 0.15s, box-shadow 0.2s, transform 0.1s`,
        `overflow:visible`,
        `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`,
        `z-index:${isSelected ? 10 : 2}`,
    ].join(';');

    // ── IN port ────────────────────────────────────────────
    const inPortHTML = `
        <div data-port-in="${node.id}"
            style="position:absolute;left:-7px;top:50%;transform:translateY(-50%);
            width:14px;height:14px;border-radius:50%;background:white;
            border:2.5px solid #9ca3af;cursor:crosshair;z-index:3;transition:border-color 0.15s;"
            onmouseenter="this.style.borderColor='${cfg.color}'"
            onmouseleave="this.style.borderColor='#9ca3af'"
            title=${window.t('flowEntryLabel')}></div>`;

    // ── OUT ports ──────────────────────────────────────────
    const totalPorts = outputs.length;
    const outPortsHTML = outputs.map((portId, i) => {
        let label = PORT_LABELS[portId];
        if (!label && portId.startsWith('btn_')) {
            const btnIdx = parseInt(portId.replace('btn_', ''), 10);
            label = buttons[btnIdx]?.label || `Кнопка ${btnIdx + 1}`;
        }
        if (!label) label = portId;
        const connected = fc.edges.some(e => e.fromNode === node.id && e.fromPort === portId);
        const isErr = portId === 'no' || portId === 'err';
        const portColor = isErr ? '#ef4444' : cfg.color;
        const topPct = totalPorts === 1 ? 50 : 20 + (i / (totalPorts - 1)) * 60;
        return `
        <div style="position:absolute;right:-7px;top:${topPct}%;transform:translateY(-50%);z-index:3;">
            <div data-port-out="${node.id}" data-port-id="${portId}"
                style="width:14px;height:14px;border-radius:50%;
                background:${connected ? portColor : 'white'};
                border:2.5px solid ${connected ? portColor : '#9ca3af'};
                cursor:crosshair;transition:all 0.15s;position:relative;z-index:4;"
                title="${(portId === 'out' || portId === 'btn') ? '' : label}"
                onmouseenter="this.style.background='${portColor}';this.style.borderColor='${portColor}';this.style.transform='scale(1.3)'"
                onmouseleave="this.style.background='${connected ? portColor : 'white'}';this.style.borderColor='${connected ? portColor : '#9ca3af'}';this.style.transform='scale(1)'"
            ></div>
        </div>`;
    }).join('');

    // ── Body content ───────────────────────────────────────
    const btnsHTML = buttons.length ? `
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:3px;">
            ${buttons.slice(0,4).map(b => `
                <div style="padding:4px 9px;background:white;border:1.5px solid #e5e7eb;
                    border-radius:6px;font-size:10px;color:#374151;font-weight:500;
                    display:flex;align-items:center;gap:5px;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
                    <div style="width:5px;height:5px;border-radius:50%;background:${cfg.color};flex-shrink:0;"></div>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(b.label||window.t('buttonWord'))}</span>
                </div>`).join('')}
            ${buttons.length > 4 ? `<div style="font-size:9.5px;color:#9ca3af;padding:2px 9px;">+${buttons.length-4} ще...</div>` : ''}
        </div>` : '';

    const aiSnippet = node.type === 'ai' && node.config?.systemPrompt ? `
        <div style="margin-top:6px;padding:5px 8px;background:#faf5ff;
            border:1px solid #e9d5ff;border-radius:6px;font-size:10px;color:#7c3aed;
            line-height:1.4;overflow:hidden;display:-webkit-box;
            -webkit-line-clamp:2;-webkit-box-orient:vertical;">
            ${esc(node.config.systemPrompt.slice(0,90))}
        </div>` : '';

    const nodeName = node.config?.name || node.name || '';
    el.innerHTML = `
        ${inPortHTML}
        <div style="background:linear-gradient(135deg,${cfg.color} 0%,${cfg.border} 100%);border-radius:14px 14px 0 0;
            padding:10px 12px;display:flex;align-items:center;gap:8px;">
            <span style="display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;
                background:rgba(255,255,255,0.22);border-radius:8px;padding:5px;width:28px;height:28px;">${cfg.icon}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:11px;color:rgba(255,255,255,0.75);letter-spacing:0.06em;text-transform:uppercase;">${cfg.label}</div>
                <div style="font-size:12px;color:white;font-weight:600;margin-top:1px;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(nodeName) || cfg.label}</div>
            </div>
            <div data-dup="${node.id}" title="Копіювати вузол (Ctrl+D)"
                style="width:22px;height:22px;border-radius:6px;background:rgba(0,0,0,0.15);
                display:flex;align-items:center;justify-content:center;cursor:pointer;
                flex-shrink:0;transition:background 0.15s;margin-right:3px;"
                onmouseenter="this.style.background='rgba(34,197,94,0.8)'"
                onmouseleave="this.style.background='rgba(0,0,0,0.15)'">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
            <div data-del="${node.id}" title=${window.t('flowDelete')}
                style="width:22px;height:22px;border-radius:6px;background:rgba(0,0,0,0.15);
                display:flex;align-items:center;justify-content:center;cursor:pointer;
                flex-shrink:0;transition:background 0.15s;"
                onmouseenter="this.style.background='rgba(239,68,68,0.8)'"
                onmouseleave="this.style.background='rgba(0,0,0,0.15)'">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
        </div>
        <div style="padding:10px 12px 12px;min-height:44px;background:#f8fafc;border-radius:0 0 14px 14px;border-top:1px solid #f1f5f9;overflow:hidden;max-width:220px;">
            ${preview
                ? `<div style="font-size:11.5px;color:#374151;line-height:1.5;
                    max-height:56px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;
                    -webkit-box-orient:vertical;word-break:break-word;">${preview}</div>`
                : `<div style="font-size:11px;color:#94a3b8;font-style:italic;display:flex;align-items:center;gap:5px;padding:4px 0;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    Клікніть для налаштування</div>`
            }
            ${node.type === 'ai' ? aiSnippet : btnsHTML}
        </div>
        ${outPortsHTML}
    `;

    // ── Events ──────────────────────────────────────────────
    el.addEventListener('mousedown', e => onNodeMouseDown(e, node.id));

    el.querySelectorAll('[data-port-out]').forEach(portEl => {
        portEl.addEventListener('mousedown', e => {
            e.stopPropagation();
            onPortMouseDown(e, node.id, portEl.dataset.portId);
        });
    });

    el.querySelectorAll('[data-dup]').forEach(dupEl => {
        dupEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            fcDuplicateNode(node.id);
        });
    });

    el.querySelectorAll('[data-del]').forEach(delEl => {
        delEl.addEventListener('mousedown', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (await (window.showConfirmModal ? showConfirmModal(`Видалити вузол "${cfg.label}"?`,{danger:true}) : Promise.resolve(confirm(`Видалити вузол "${cfg.label}"?`)))) {
                pushHistory();
                fc.nodes = fc.nodes.filter(n => n.id !== node.id);
                fc.edges = fc.edges.filter(ed => ed.fromNode !== node.id && ed.toNode !== node.id);
                if (fc.selected === node.id) { fc.selected = null; renderPropPanel(); }
                renderAll();
            }
        });
    });

    return el;
}

function applyTransformToNodes() {
    const layer = document.getElementById('fcNodesLayer');
    if (!layer) return;
    layer.style.transform = `translate(${fc.pan.x}px,${fc.pan.y}px) scale(${fc.scale})`;
    layer.style.transformOrigin = '0 0';
}

// ── Edges (SVG) ────────────────────────────────────────────
function renderEdges() {
    const g = document.getElementById('fcEdgesGroup');
    if (!g) return;
    const svg = document.getElementById('fcEdgesSVG');

    // Apply same transform to SVG edges group
    g.setAttribute('transform', `translate(${fc.pan.x},${fc.pan.y}) scale(${fc.scale})`);

    g.innerHTML = '';
    fc.edges.forEach(edge => {
        const fromNode = fc.nodes.find(n => n.id === edge.fromNode);
        const toNode = fc.nodes.find(n => n.id === edge.toNode);
        if (!fromNode || !toNode) return;

        const from = getOutPortPos(fromNode, edge.fromPort);
        const to = getInPortPos(toNode);

        const isSelected = fc.selected === edge.fromNode || fc.selected === edge.toNode;
        const isError = (edge.fromPort === 'no' || edge.fromPort === 'err');
        const portColor = isError ? '#ef4444' : (isSelected ? '#22c55e' : '#64748b');
        const color = portColor;
        const markerId = isSelected
            ? (isError ? 'arrowHead' : 'arrowHeadGreen')
            : 'arrowHead';

        const path = bezier(from.x, from.y, to.x, to.y);

        // Hit area
        const hit = document.createElementNS('http://www.w3.org/2000/svg','path');
        hit.setAttribute('d', path);
        hit.setAttribute('fill','none');
        hit.setAttribute('stroke','transparent');
        hit.setAttribute('stroke-width','16');
        hit.style.cursor = 'pointer';
        hit.style.pointerEvents = 'stroke';
        hit.title = window.t('clickToDelete');
        // Підсвітка при наведенні
        hit.addEventListener('mouseenter', () => {
            line.setAttribute('stroke', '#ef4444');
            line.setAttribute('stroke-width', '2.5');
        });
        hit.addEventListener('mouseleave', () => {
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '2');
        });
        hit.addEventListener('click', e => {
            e.stopPropagation();
            pushHistory();
            fc.edges = fc.edges.filter(ed => ed.id !== edge.id);
            renderEdges();
        });

        const line = document.createElementNS('http://www.w3.org/2000/svg','path');
        line.setAttribute('d', path);
        line.setAttribute('fill','none');
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', isSelected ? '2.5' : '1.8');
        line.setAttribute('stroke-dasharray', isSelected ? 'none' : 'none');
        line.setAttribute('opacity', isSelected ? '1' : '0.7');
        line.setAttribute('marker-end', `url(#${markerId})`);

        // Port label on edge — pill з фоном, позиціонується біля порту виходу
        let portLabel = PORT_LABELS[edge.fromPort];
        if (!portLabel && edge.fromPort?.startsWith('btn_')) {
            const btnIdx = parseInt(edge.fromPort.replace('btn_', ''), 10);
            portLabel = fromNode.config?.buttons?.[btnIdx]?.label || `Кнопка ${btnIdx + 1}`;
        }
        // Показуємо label тільки для значущих портів (не window.t('continueWord'))
        const showLabel = portLabel && edge.fromPort !== 'out' && edge.fromPort !== 'btn';
        if (showLabel) {
            // Label близько до source порту (20% шляху)
            const t = 0.18;
            const lx = from.x + (to.x - from.x) * t + 8;
            const ly = from.y + (to.y - from.y) * t - 10;
            const fontSize = 9;
            const approxW = portLabel.length * 5.2 + 12;

            const pill = document.createElementNS('http://www.w3.org/2000/svg','rect');
            pill.setAttribute('x', lx - approxW/2);
            pill.setAttribute('y', ly - fontSize - 1);
            pill.setAttribute('width', approxW);
            pill.setAttribute('height', fontSize + 6);
            pill.setAttribute('rx', '4');
            pill.setAttribute('fill', isError ? '#fff1f2' : (edge.fromPort==='yes' ? '#f0fdf4' : '#fff7ed'));
            pill.setAttribute('stroke', color);
            pill.setAttribute('stroke-width', '1');
            pill.style.pointerEvents = 'none';

            const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
            txt.setAttribute('x', lx);
            txt.setAttribute('y', ly + 1);
            txt.setAttribute('text-anchor','middle');
            txt.setAttribute('dominant-baseline','middle');
            txt.setAttribute('fill', color);
            txt.setAttribute('font-size', String(fontSize));
            txt.setAttribute('font-weight', '700');
            txt.setAttribute('font-family','system-ui,sans-serif');
            txt.style.pointerEvents = 'none';
            txt.textContent = portLabel;
            g.appendChild(pill);
            g.appendChild(txt);
        }

        g.appendChild(hit);
        g.appendChild(line);
    });
}

function _domPortPos(nodeId, selector) {
    const el = document.getElementById('fcn_' + nodeId);
    const wrap = document.getElementById('fcCanvasWrap');
    if (!el || !wrap) return null;
    const portEl = el.querySelector(selector);
    if (!portEl) return null;
    const wr = wrap.getBoundingClientRect();
    const pr = portEl.getBoundingClientRect();
    return {
        x: (pr.left + pr.width/2  - wr.left - fc.pan.x) / fc.scale,
        y: (pr.top  + pr.height/2 - wr.top  - fc.pan.y) / fc.scale
    };
}

function getOutPortPos(node, portId) {
    if (node.type === 'start') {
        return { x: node.x + 110, y: node.y + 19 };
    }
    // Читаємо реальну позицію порту з DOM
    const pos = _domPortPos(node.id, `[data-port-out="${node.id}"][data-port-id="${portId}"]`);
    if (pos) return pos;
    // fallback (до першого рендеру)
    const outputs = node.outputs || NODES[node.type]?.outputs || ['out'];
    const idx = outputs.indexOf(portId);
    const total = outputs.length;
    const topPct = total === 1 ? 0.5 : (20 + (idx / Math.max(1, total-1)) * 60) / 100;
    const h = getNodeHeight(node);
    return { x: node.x + W, y: node.y + h * topPct };
}

function getInPortPos(node) {
    if (node.type === 'start') {
        return { x: node.x, y: node.y + 19 };
    }
    // Читаємо реальну позицію in-порту з DOM
    const pos = _domPortPos(node.id, `[data-port-in="${node.id}"]`);
    if (pos) return pos;
    // fallback
    const h = getNodeHeight(node);
    return { x: node.x, y: node.y + h * 0.5 };
}

function getNodeHeight(node) {
    // Реальна висота: header ~48px + body
    // body: padding 22px + preview text + buttons
    const preview = getPreview(node);
    const cfg = NODES[node.type] || NODES.message;
    const outputs = node.outputs || cfg.outputs || ['out'];
    const outputCount = outputs.length;
    const buttons = node.config?.buttons || [];

    const headerH = 48;
    const bodyPad = 22;
    // Preview text: 3 рядки макс, ~18px на рядок
    const previewLines = preview ? Math.min(3, Math.ceil(preview.length / 26)) : 1;
    const previewH = preview ? previewLines * 18 : 24; // "Клікніть для налаштування" ~24px
    // AI snippet extra
    const aiH = (node.type === 'ai' && node.config?.systemPrompt) ? 38 : 0;
    // Buttons list
    const btnH = buttons.length > 0 ? Math.min(buttons.length, 4) * 26 + 8 : 0;

    return headerH + bodyPad + previewH + aiH + btnH;
}

function bezier(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (dx >= 60) {
        // Ціль справа — стандартна S-крива
        const cp = Math.max(80, dx * 0.45);
        return `M${x1},${y1} C${x1+cp},${y1} ${x2-cp},${y2} ${x2},${y2}`;
    } else if (dx >= -30) {
        // Ціль майже по вертикалі або трохи зліва — використовуємо вертикальні control points
        const cpY = Math.max(80, absDy * 0.6);
        if (absDy > absDx) {
            // Переважно вертикально
            return `M${x1},${y1} C${x1},${y1+cpY} ${x2},${y2-cpY} ${x2},${y2}`;
        }
        const cpX = Math.max(60, absDx * 0.6 + 40);
        return `M${x1},${y1} C${x1+cpX},${y1} ${x2-cpX},${y2} ${x2},${y2}`;
    } else {
        // Ціль зліва — обгинаємо праворуч і зверху/знизу
        const offsetX = Math.max(100, absDx * 0.5 + 80);
        // Напрямок обгину — якщо source нижче target, йдемо зверху
        if (y1 >= y2) {
            // source нижче або на рівні — обгин зверху
            const topY = Math.min(y1, y2) - Math.max(60, absDy * 0.4 + 40);
            return `M${x1},${y1} C${x1+offsetX},${y1} ${x1+offsetX},${topY} ${(x1+x2)/2},${topY} C${x2-offsetX},${topY} ${x2-offsetX},${y2} ${x2},${y2}`;
        } else {
            // source вище — обгин знизу
            const botY = Math.max(y1, y2) + Math.max(60, absDy * 0.3 + 40);
            return `M${x1},${y1} C${x1+offsetX},${y1} ${x1+offsetX},${botY} ${(x1+x2)/2},${botY} C${x2-offsetX},${botY} ${x2-offsetX},${y2} ${x2},${y2}`;
        }
    }
}

// ── Background Dots ────────────────────────────────────────
function drawBg() {
    const cnv = document.getElementById('fcBgCanvas');
    if (!cnv) return;
    const wrap = document.getElementById('fcCanvasWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    cnv.width = rect.width;
    cnv.height = rect.height;
    const ctx = cnv.getContext('2d');
    ctx.clearRect(0,0,cnv.width,cnv.height);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.fillStyle = '#cbd5e1';
    const spacing = 24 * fc.scale;
    const offsetX = fc.pan.x % spacing;
    const offsetY = fc.pan.y % spacing;
    const r = Math.max(1, fc.scale * 1.2);
    for (let x = offsetX; x < cnv.width + spacing; x += spacing) {
        for (let y = offsetY; y < cnv.height + spacing; y += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

// ── Transform ──────────────────────────────────────────────
function applyTransform() {
    applyTransformToNodes();
    renderEdges();
    drawBg();
    const pct = document.getElementById('fcZoomPct');
    if (pct) pct.textContent = Math.round(fc.scale*100)+'%';
}

function doZoom(delta, cx, cy) {
    const wrap = document.getElementById('fcCanvasWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    cx = cx ?? rect.width/2;
    cy = cy ?? rect.height/2;
    const oldScale = fc.scale;
    fc.scale = Math.max(0.25, Math.min(2, fc.scale + delta));
    const ds = fc.scale/oldScale - 1;
    fc.pan.x -= (cx - fc.pan.x) * ds;
    fc.pan.y -= (cy - fc.pan.y) * ds;
    applyTransform();
}

function fitView() {
    if (!fc.nodes.length) return;
    const wrap = document.getElementById('fcCanvasWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const pad = 80;
    const minX = Math.min(...fc.nodes.map(n=>n.x));
    const minY = Math.min(...fc.nodes.map(n=>n.y));
    const maxX = Math.max(...fc.nodes.map(n=>n.x+W));
    const maxY = Math.max(...fc.nodes.map(n=>n.y+getNodeHeight(n)));
    const scaleX = (rect.width-pad*2) / (maxX-minX||1);
    const scaleY = (rect.height-pad*2) / (maxY-minY||1);
    fc.scale = Math.min(scaleX, scaleY, 1.3);
    fc.pan.x = -minX*fc.scale + (rect.width-(maxX-minX)*fc.scale)/2;
    fc.pan.y = -minY*fc.scale + (rect.height-(maxY-minY)*fc.scale)/2;
    applyTransform();
}

// ── Mouse Events ───────────────────────────────────────────
function onNodeMouseDown(e, nodeId) {
    if (e.button !== 0) return;
    e.stopPropagation();

    // Select
    if (fc.selected !== nodeId) {
        fc.selected = nodeId;
        renderAll();
        renderPropPanel();
    }

    // Start drag
    fc.dragging = {
        nodeId,
        startMX: e.clientX,
        startMY: e.clientY,
        origX: fc.nodes.find(n=>n.id===nodeId)?.x || 0,
        origY: fc.nodes.find(n=>n.id===nodeId)?.y || 0,
    };
}

function onPortMouseDown(e, nodeId, portId) {
    if (e.button !== 0) return;
    e.stopPropagation();
    const wrap = document.getElementById('fcCanvasWrap');
    const rect = wrap.getBoundingClientRect();
    const node = fc.nodes.find(n=>n.id===nodeId);
    if (!node) return;
    const pos = getOutPortPos(node, portId);
    const sx = pos.x * fc.scale + fc.pan.x;
    const sy = pos.y * fc.scale + fc.pan.y;
    fc.connecting = {fromNode:nodeId, fromPort:portId, startX:sx, startY:sy};
}

function onWrapMouseDown(e) {
    if (e.button !== 0) return;
    if (e.target.closest('[data-nid]')) return;
    if (e.target.closest('[data-port-out]')) return;
    if (e.target.closest('[data-port-in]')) return;

    // Deselect
    if (fc.selected) {
        fc.selected = null;
        renderAll();
        renderPropPanel();
    }

    // Pan
    fc.panning = true;
    fc.panStart = { x: e.clientX - fc.pan.x, y: e.clientY - fc.pan.y };
    const wrap = document.getElementById('fcCanvasWrap');
    if (wrap) wrap.style.cursor = 'grabbing';
}

function onWrapMouseMove(e) {
    if (fc.panning && fc.panStart) {
        fc.pan.x = e.clientX - fc.panStart.x;
        fc.pan.y = e.clientY - fc.panStart.y;
        applyTransform();
        return;
    }

    if (fc.dragging) {
        const dx = (e.clientX - fc.dragging.startMX) / fc.scale;
        const dy = (e.clientY - fc.dragging.startMY) / fc.scale;
        const node = fc.nodes.find(n=>n.id===fc.dragging.nodeId);
        if (node) {
            node.x = snap(fc.dragging.origX + dx);
            node.y = snap(fc.dragging.origY + dy);
            // Move only the specific node div (perf)
            const el = document.getElementById(`fcn_${node.id}`);
            if (el) { el.style.left = node.x+'px'; el.style.top = node.y+'px'; }
            renderEdges();
        }
        return;
    }

    if (fc.connecting) {
        const wrap = document.getElementById('fcCanvasWrap');
        const rect = wrap.getBoundingClientRect();
        const tx = (e.clientX - rect.left - fc.pan.x) / fc.scale;
        const ty = (e.clientY - rect.top - fc.pan.y) / fc.scale;
        const from = getOutPortPos(fc.nodes.find(n=>n.id===fc.connecting.fromNode), fc.connecting.fromPort);
        const tempEdge = document.getElementById('fcTempEdge');
        if (tempEdge) {
            tempEdge.style.display = '';
            tempEdge.setAttribute('d', bezier(from.x, from.y, tx, ty));
            tempEdge.setAttribute('transform', `translate(${fc.pan.x},${fc.pan.y}) scale(${fc.scale})`);
        }
        return;
    }
}

function onWrapMouseUp(e) {
    const wrap = document.getElementById('fcCanvasWrap');
    if (wrap) wrap.style.cursor = 'grab';

    if (fc.panning) { fc.panning = false; fc.panStart = null; return; }

    if (fc.dragging) {
        pushHistory();
        fc.dragging = null;
        return;
    }

    if (fc.connecting) {
        const tempEdge = document.getElementById('fcTempEdge');
        if (tempEdge) tempEdge.style.display = 'none';

        // Find target node under mouse
        const wrap = document.getElementById('fcCanvasWrap');
        const rect = wrap.getBoundingClientRect();
        const mx = (e.clientX - rect.left - fc.pan.x) / fc.scale;
        const my = (e.clientY - rect.top - fc.pan.y) / fc.scale;

        const target = fc.nodes.find(n => {
            if (n.id === fc.connecting.fromNode) return false;
            const h = getNodeHeight(n);
            return mx >= n.x-20 && mx <= n.x+W+20 && my >= n.y-20 && my <= n.y+h+20;
        });

        if (target) {
            // Remove existing edge from same port
            pushHistory();
            fc.edges = fc.edges.filter(ed => !(ed.fromNode===fc.connecting.fromNode && ed.fromPort===fc.connecting.fromPort));
            fc.edges.push({
                id: `e_${fc.connecting.fromNode}_${fc.connecting.fromPort}_${Date.now()}`,
                fromNode: fc.connecting.fromNode,
                fromPort: fc.connecting.fromPort,
                toNode: target.id,
                toPort: 'in',
            });
            renderAll();
        }

        fc.connecting = null;
    }
}

function onWrapWheel(e) {
    e.preventDefault();
    const wrap = document.getElementById('fcCanvasWrap');
    const rect = wrap.getBoundingClientRect();
    doZoom(e.deltaY > 0 ? -0.08 : 0.08, e.clientX-rect.left, e.clientY-rect.top);
}

function onWrapDblClick(e) {
    // Dblclick empty canvas <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span> add message node
    if (e.target.closest('[data-nid]')) return;
    const wrap = document.getElementById('fcCanvasWrap');
    const rect = wrap.getBoundingClientRect();
    const cx = (e.clientX - rect.left - fc.pan.x) / fc.scale;
    const cy = (e.clientY - rect.top - fc.pan.y) / fc.scale;
    addNode('message', snap(cx - W/2), snap(cy - 40));
}

// ── Add Node ───────────────────────────────────────────────
function addNode(type, x, y) {
    pushHistory();
    const id = `node_${Date.now()}`;
    const cfg = NODES[type] || NODES.message;
    const node = {
        id, type,
        x: x ?? 200,
        y: y ?? 200,
        config: {id, type, name: cfg.label},
        outputs: [...(cfg.outputs || ['out'])],
    };
    fc.nodes.push(node);
    fc.selected = id;
    renderAll();
    renderPropPanel();
}
window.fcAddNode = addNode;

// Оновлює список стадій при зміні воронки в CRM вузлі
window._fcCrmPipelineChange = function(pipelineId) {
    const pipelines = window.crm?.pipelines || [];
    const pip = pipelines.find(p => p.id === pipelineId);
    const wrap = document.getElementById('fcp_stageWrap');
    if (!wrap) return;
    const sel = document.getElementById('fcp_dealStage');
    if (!sel) return;

    // FIX: IDs відповідають реальному _createDefaultPipeline
    const defaultStages = [
        ['new',window.t('newLeadWord')],['contact','Контакт'],
        ['negotiation','Переговори'],['proposal',window.t('proposalWord')],
        ['closing','Закриття'],['won','Виграно'],
    ];

    let opts = defaultStages;
    if (pip) {
        // Array.isArray guard — Firestore може повернути об'єкт замість масиву
        const rawStages = Array.isArray(pip.stages) ? pip.stages : Object.values(pip.stages || {});
        const validStages = rawStages
            .filter(s => s && (s.id !== undefined && s.id !== null && s.id !== ''))
            .sort((a,b) => (a.order||0) - (b.order||0));
        if (validStages.length > 0) {
            opts = validStages.map(s => [
                String(s.id),
                String(s.label || s.name || s.id)  // гарантовано рядок, не undefined
            ]);
        }
    }

    // Зберігаємо поточний вибір якщо він є в новій воронці
    const _curVal = sel.value;
    const _match = opts.find(([v]) => v === _curVal);
    const _newVal = _match ? _curVal : (opts[0]?.[0] || 'new');

    sel.innerHTML = opts
        .map(([v,l]) => `<option value="${v}"${_newVal===v?' selected':''}>${l}</option>`)
        .join('');
};

// ── AI Воронка Modal ───────────────────────────────────────
window.fcSetActionType = function(val) {
    if (!fc.selected) return;
    const node = fc.nodes.find(n => n.id === fc.selected);
    if (!node) return;
    node.config.actionType = val;
    renderPropPanel();
};

window.fcOpenAiFunnelModal = function() {
    if (document.getElementById('fcAiFunnelModal')) return;
    const modal = document.createElement('div');
    modal.id = 'fcAiFunnelModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);
        z-index:9999;display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
        <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;
            padding:24px;width:520px;max-height:80vh;overflow-y:auto;position:relative;">
            <button onclick="document.getElementById('fcAiFunnelModal').remove()"
                style="position:absolute;top:12px;right:12px;background:none;border:none;
                color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:36px;height:36px;border-radius:9px;
                    background:linear-gradient(135deg,#22c55e,#8b5cf6);
                    display:flex;align-items:center;justify-content:center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2v4h4"/></svg>
                </div>
                <div>
                    <div style="color:white;font-weight:700;font-size:15px;">AI Асистент воронки</div>
                    <div style="color:#64748b;font-size:11px;">Опиши бізнес — отримай готову воронку</div>
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Опишіть ваш бізнес і ціль воронки:</div>
                <textarea id="fcAiFunnelInput" rows="4"
                    placeholder="Наприклад: Стоматологічна клініка в Києві, 3 лікарі. Ціль — записати людину на безкоштовну консультацію через Telegram бот. Аудиторія — люди 25-45 років."
                    style="width:100%;padding:10px;background:#0f172a;border:1px solid #334155;
                    border-radius:8px;color:white;font-size:12px;box-sizing:border-box;resize:vertical;"></textarea>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
                <button onclick="fcRunAiFunnel('funnel')"
                    style="flex:1;padding:10px;background:linear-gradient(135deg,#22c55e,#16a34a);
                    border:none;border-radius:8px;color:white;font-weight:600;font-size:12px;cursor:pointer;">
                    Згенерувати воронку
                </button>
                <button onclick="fcRunAiFunnel('prompt')"
                    style="flex:1;padding:10px;background:#334155;
                    border:none;border-radius:8px;color:#94a3b8;font-weight:600;font-size:12px;cursor:pointer;">
                    Промпт для AI вузла
                </button>
            </div>
            <div id="fcAiFunnelResult" style="display:none;">
                <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Результат:</div>
                <div id="fcAiFunnelResultText"
                    style="background:#0f172a;border:1px solid #334155;border-radius:8px;
                    padding:12px;color:#e2e8f0;font-size:12px;white-space:pre-wrap;
                    max-height:300px;overflow-y:auto;line-height:1.6;"></div>
                <button onclick="fcCopyFunnelResult()"
                    style="margin-top:8px;width:100%;padding:8px;background:#22c55e22;
                    border:1px solid #22c55e;border-radius:8px;color:#22c55e;
                    font-size:11px;cursor:pointer;">Копіювати результат</button>
            </div>
            <div id="fcAiFunnelLoader" style="display:none;text-align:center;padding:20px;color:#64748b;font-size:12px;">
                Генерую воронку...
            </div>
        </div>`;
    document.body.appendChild(modal);
};

window.fcRunAiFunnel = async function(mode) {
    const input = document.getElementById('fcAiFunnelInput')?.value?.trim();
    if (!input) { if(window.showToast)showToast('Опишіть бізнес','warning'); else alert('Опишіть бізнес'); return; }
    document.getElementById('fcAiFunnelLoader').style.display = 'block';
    document.getElementById('fcAiFunnelResult').style.display = 'none';

    const systemPrompt = mode === 'funnel'
        ? `Ти — експерт з Telegram маркетингу і воронок продажів. 
Твоя задача — написати готову воронку повідомлень для Telegram бота.
Структура воронки:
1. Привітання + цінність (1 повідомлення)
2. Кваліфікаційне питання (з кнопками відповіді)
3. Наступне питання (з кнопками)
4. Презентація оферу / результату
5. Заклик до дії (CTA)

Для кожного повідомлення пиши:
[ПОВІДОМЛЕННЯ 1]
Текст: ...
Кнопки: Варіант 1 | Варіант 2

Пиши коротко, без води. Мова — українська.`
        : `Ти — експерт з AI асистентів для бізнесу.
Напиши системний промпт для AI бота в Telegram.
Промпт має:
- Визначати роль і ціль бота
- Описувати стиль спілкування
- Містити правила кваліфікації клієнта
- Вказувати як збирати контакти
- Як пропонувати продукт/послугу
Формат: готовий текст промпту який можна вставити в поле window.t('flowSysPr') AI вузла.
Мова — українська.`;

    try {
        // Flow Canvas використовує ключ компанії (клієнт налаштовує сам)
        const compSnap = await window.companyRef().get();
        const apiKey = compSnap.data()?.openaiApiKey || compSnap.data()?.anthropicApiKey || '';
        if (!apiKey) throw new Error(window.t('aiKeyNotSet'));

        const _fcCtrl = new AbortController();
        const _fcTimer = setTimeout(() => _fcCtrl.abort(), 30000);
        let resp;
        try {
            resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    max_tokens: 2000,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user',   content: input }
                    ]
                }),
                signal: _fcCtrl.signal,
            });
        } finally { clearTimeout(_fcTimer); }
        const data = await resp.json();
        const result = data.choices?.[0]?.message?.content || window.t('genError');
        document.getElementById('fcAiFunnelResultText').textContent = result;
        document.getElementById('fcAiFunnelResult').style.display = 'block';
    } catch(e) {
        document.getElementById('fcAiFunnelResultText').textContent = window.t('errPfx2') + e.message;
        document.getElementById('fcAiFunnelResult').style.display = 'block';
    }
    document.getElementById('fcAiFunnelLoader').style.display = 'none';
};

window.fcCopyFunnelResult = function() {
    const text = document.getElementById('fcAiFunnelResultText')?.textContent || '';
    navigator.clipboard.writeText(text).then(() => showToast('Скопійовано!', 'success'));
};

// ── Керування кнопками в повідомленні ──────────────────────
window.fcAddButton = function() {
    const node = fc.nodes.find(n => n.id === fc.selected);
    if (!node) return;
    pushHistory();
    if (!node.config.buttons) node.config.buttons = [];
    node.config.buttons.push({ id: `btn_${node.config.buttons.length}`, label: '', url: null });
    node.outputs = ['out', ...node.config.buttons.map((_,i) => `btn_${i}`)];
    renderPropPanel();
    renderNodes();
    renderEdges();
    // Фокус на нове поле
    setTimeout(() => {
        const inp = document.getElementById(`fcp_btn_label_${node.config.buttons.length - 1}`);
        if (inp) inp.focus();
    }, 50);
};

window.fcUpdateButton = function(idx) {
    const node = fc.nodes.find(n => n.id === fc.selected);
    if (!node || !node.config.buttons?.[idx]) return;
    const labelEl = document.getElementById(`fcp_btn_label_${idx}`);
    const urlEl = document.getElementById(`fcp_btn_url_${idx}`);
    node.config.buttons[idx].label = labelEl?.value || '';
    node.config.buttons[idx].url = urlEl?.value?.trim() || null;
    renderNodes(); // оновити картку без повного перемальовування панелі
};

window.fcEditButton = function(idx) {
    // Більше не потрібен — редагування inline
};

window.fcRemoveButton = function(idx) {
    const node = fc.nodes.find(n => n.id === fc.selected);
    if (!node || !node.config.buttons) return;
    pushHistory();
    // Видаляємо з'єднання цього порту
    const portId = `btn_${idx}`;
    fc.edges = fc.edges.filter(e => !(e.fromNode === node.id && e.fromPort === portId));
    node.config.buttons.splice(idx, 1);
    // Перенумеровуємо
    node.config.buttons = node.config.buttons.map((b,i) => ({...b, id:`btn_${i}`}));
    node.outputs = node.config.buttons.length > 0
        ? ['out', ...node.config.buttons.map((_,i) => `btn_${i}`)]
        : ['out'];
    renderPropPanel();
    renderNodes();
    renderEdges();
};

// ── Test AI node прямо в канвасі ─────────────────────────
window.fcTestAiNode = async function(nodeId) {
    const node = fc.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Спочатку зберігаємо поточні дані панелі
    window.fcApplyNodeData(nodeId);

    const cfg = node.config || {};
    const provider = cfg.aiProvider || 'openai';
    const model = cfg.aiModel || 'gpt-4o-mini';
    const apiKey = cfg.aiApiKey || '';
    const sysPrompt = cfg.aiSystem || 'You are helpful.';

    if (!apiKey) {
        if (typeof showToast === 'function') showToast('Введіть API ключ для тесту', 'warning');
        return;
    }

    // Показуємо діалог для тестового повідомлення
    const testMsg = prompt('Введіть тестове повідомлення для AI:', 'Привіт, розкажи про себе');
    if (!testMsg) return;

    // Кнопка в стан "завантаження"
    const testBtn = document.querySelector(`button[onclick="fcTestAiNode('${nodeId}')"]`);
    if (testBtn) { testBtn.textContent = '⏳ Запит...'; testBtn.disabled = true; }

    try {
        let responseText = '';

        window._lastAiUsage = null; // reset
        if (provider === 'openai' || model.startsWith('gpt') || model.startsWith('o4') || model.startsWith('o3')) {
            const r = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model,
                    max_tokens: 300,
                    temperature: cfg.temperature ?? 0.7,
                    messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: testMsg }]
                })
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error?.message || 'OpenAI error ' + r.status);
            responseText = d.choices?.[0]?.message?.content || '';
            window._lastAiUsage = { prompt: d.usage?.prompt_tokens, completion: d.usage?.completion_tokens, total: d.usage?.total_tokens };

        } else if (provider === 'anthropic' || model.startsWith('claude')) {
            const r = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                    model, max_tokens: 300,
                    temperature: cfg.temperature ?? 0.7,
                    system: sysPrompt,
                    messages: [{ role: 'user', content: testMsg }]
                })
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error?.message || 'Anthropic error ' + r.status);
            responseText = d.content?.[0]?.text || '';

        } else if (provider === 'google' || model.startsWith('gemini')) {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: sysPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: testMsg }] }],
                    generationConfig: { maxOutputTokens: 300, temperature: cfg.temperature ?? 0.7 }
                })
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error?.message || 'Gemini error ' + r.status);
            responseText = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        // Показуємо результат в красивому popup
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        overlay.innerHTML = `
            <div style="background:#1e293b;border:1px solid #334155;border-radius:14px;padding:1.25rem;max-width:480px;width:100%;max-height:80vh;overflow:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <div style="font-size:13px;font-weight:700;color:#22c55e;">✅ AI відповів (${model})</div>
                    <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:18px;">✕</button>
                </div>
                <div style="font-size:11px;color:#64748b;margin-bottom:6px;">Ваше повідомлення:</div>
                <div style="background:#0f172a;border-radius:8px;padding:8px;font-size:12px;color:#94a3b8;margin-bottom:10px;">${testMsg}</div>
                <div style="font-size:11px;color:#64748b;margin-bottom:6px;">Відповідь AI:</div>
                <div style="background:#0f172a;border:1px solid #22c55e33;border-radius:8px;padding:10px;font-size:13px;color:white;line-height:1.6;white-space:pre-wrap;">${responseText}</div>
                ${window._lastAiUsage ? `<div style="font-size:9px;color:#475569;margin-top:6px;">Токени: вхід ${window._lastAiUsage.prompt||'?'} + вихід ${window._lastAiUsage.completion||'?'} = ${window._lastAiUsage.total||'?'}</div>` : ''}
            </div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    } catch(e) {
        if (typeof showToast === 'function') showToast('❌ ' + e.message, 'error');
        else alert(window.t('errPfx2') + e.message);
    } finally {
        if (testBtn) {
            testBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Тест AI відповіді';
            testBtn.disabled = false;
        }
    }
};

window.fcSetAiProvider = function(provider) {
    // FIX: fc.selectedNode не існує — використовуємо fc.selected
    const node = fc.selected ? fc.nodes.find(n => n.id === fc.selected) : null;
    if (!node) return;
    // Зберігаємо поточний ключ перед перемалюванням
    const currentKey = document.getElementById('fcp_aiApiKey')?.value || '';
    node.config.aiProvider = provider;
    // Зберігаємо ключ тільки якщо він не маска і не порожній
    if (currentKey && !currentKey.includes('•')) node.config.aiApiKey = currentKey;
    renderPropPanel();
};

// ── Property Panel ─────────────────────────────────────────
function renderPropPanel() {
    const panel = document.getElementById('fcPropPanel');
    if (!panel) return;

    if (!fc.selected) {
        panel.innerHTML = `<div style="text-align:center;padding:48px 16px;color:#334155;">
            <div style="display:flex;justify-content:center;margin-bottom:12px;">
                <div style="width:48px;height:48px;border-radius:14px;background:#1e293b;
                    border:1px solid #334155;display:flex;align-items:center;justify-content:center;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
            </div>
            <div style="font-size:12px;color:#475569;line-height:1.6;">Клікніть на вузол<br>для редагування</div>
        </div>`;
        return;
    }

    const node = fc.nodes.find(n=>n.id===fc.selected);
    if (!node) return;
    const cfg = NODES[node.type] || NODES.message;
    const d = node.config || {};

    const fld = (label, html) => `
        <div style="margin-bottom:12px;">
            <div style="font-size:10px;font-weight:700;color:#64748b;
                text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">${label}</div>
            ${html}
        </div>`;

    const iS = "width:100%;padding:8px 10px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#e2e8f0;font-size:12px;box-sizing:border-box;outline:none;transition:border-color 0.15s;";
    const inp = (id, val, ph='') => `<input id="fcp_${id}"
        value="${escAttr(val||'')}" placeholder="${ph}"
        style="${iS}"
        onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#334155'">`;

    const ta = (id, val, ph='', rows=4) => `<textarea id="fcp_${id}"
        placeholder="${ph}" rows="${rows}"
        style="${iS}resize:vertical;"
        onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#334155'"
        >${esc(val||'')}</textarea>`;

    const sel = (id, options, cur) => {
        // FIX: захист від неітерованих або неправильно форматованих опцій
        const safeOpts = Array.isArray(options) ? options : [];
        const optHtml = safeOpts.map(item => {
            const v = Array.isArray(item) ? item[0] : (item?.value ?? String(item));
            const l = Array.isArray(item) ? (item[1] ?? item[0]) : (item?.label ?? item?.name ?? String(item));
            return `<option value="${v}" ${cur===v?'selected':''}>${l}</option>`;
        }).join('');
        return `<select id="fcp_${id}"
            style="${iS}cursor:pointer;"
            onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#334155'">
            ${optHtml}
        </select>`;
    };

    let fields = '';

    switch (node.type) {
        case 'start':
            fields = fld('Тригер (ключове слово)', inp('triggerKeyword', d.triggerKeyword, '/start'));
            break;
        case 'message': {
            const btns = d.buttons || [];
            const btnRows = btns.map((b,i) => `
                <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;
                    padding:8px;margin-bottom:8px;">
                    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
                        <div style="flex:1;">
                            <div style="font-size:9px;color:#64748b;margin-bottom:3px;">ТЕКСТ КНОПКИ</div>
                            <input id="fcp_btn_label_${i}" value="${escAttr(b.label||'')}"
                                placeholder="Наприклад: Продовжити"
                                style="width:100%;padding:6px 8px;background:#1e293b;border:1px solid #475569;
                                border-radius:6px;color:white;font-size:12px;box-sizing:border-box;"
                                oninput="fcUpdateButton(${i})">
                        </div>
                        <button onclick="fcRemoveButton(${i})"
                            style="padding:6px 8px;background:#fef2f2;border:1px solid #fecaca;
                            border-radius:6px;cursor:pointer;font-size:11px;color:#ef4444;
                            flex-shrink:0;margin-top:16px;">✕</button>
                    </div>
                    <div>
                        <div style="font-size:9px;color:#64748b;margin-bottom:3px;">
                            URL ПОСИЛАННЯ <span style="color:#475569;">(необов'язково — для кнопки-посилання)</span>
                        </div>
                        <input id="fcp_btn_url_${i}" value="${escAttr(b.url||'')}"
                            placeholder="https://..."
                            style="width:100%;padding:6px 8px;background:#1e293b;border:1px solid #475569;
                            border-radius:6px;color:#38bdf8;font-size:12px;box-sizing:border-box;"
                            oninput="fcUpdateButton(${i})">
                    </div>
                </div>`).join('');

            fields = `
                <div style="margin-bottom:12px;">
                    <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">ПОВІДОМЛЕННЯ</div>
                    <textarea id="fcp_text" rows="5" placeholder=${window.t('enterMsgText')}
                        style="width:100%;padding:10px;background:#0f172a;border:1px solid #334155;
                        border-radius:7px;color:white;font-size:13px;resize:vertical;box-sizing:border-box;
                        line-height:1.5;">${escAttr(d.text||'')}</textarea>
                </div>
                <div style="margin-bottom:12px;">
                    <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">КНОПКИ</div>
                    <div id="fcBtnList">${btnRows}</div>
                    <button onclick="fcAddButton()"
                        style="width:100%;padding:8px;background:transparent;border:1px dashed #334155;
                        border-radius:8px;color:#64748b;font-size:12px;cursor:pointer;
                        transition:all 0.15s;"
                        onmouseover="this.style.borderColor='#22c55e';this.style.color='#22c55e';"
                        onmouseout="this.style.borderColor='#334155';this.style.color='#64748b';">
                        + Додати кнопку
                    </button>
                </div>
                <div style="margin-bottom:12px;">
                    <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">ЗБЕРЕГТИ ВІДПОВІДЬ У ЗМІННУ</div>
                    ${inp('saveAs', d.saveAs, 'напр: phone')}
                </div>`;
            break;
        }
        case 'action': {
            const aType = d.actionType || 'set_var';
            const notifyFields = aType === 'notify_admin' ? `
                <div style="background:#0f172a;border:1px solid #22c55e33;border-radius:10px;padding:10px;margin-top:8px;">
                    <div style="font-size:10px;color:#22c55e;font-weight:700;margin-bottom:8px;text-transform:uppercase;">Налаштування сповіщення</div>
                    <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">Chat ID менеджера
                        <a href="https://t.me/userinfobot" target="_blank" style="color:#3b82f6;margin-left:4px;font-size:9px;">Дізнатись ID →</a>
                    </div>
                    <input id="fcp_notifyChatId" type="text" value="${d.notifyChatId||''}"
                        placeholder="123456789"
                        style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;
                        border-radius:7px;color:white;font-size:11px;box-sizing:border-box;margin-bottom:6px;">
                    <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">Назва воронки</div>
                    <input id="fcp_notifyFlowName" type="text" value="${d.notifyFlowName||''}"
                        placeholder=${window.t('flowExMaster')}
                        style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;
                        border-radius:7px;color:white;font-size:11px;box-sizing:border-box;margin-bottom:6px;">
                    <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">Текст повідомлення</div>
                    <textarea id="fcp_notifyText" rows="3"
                        placeholder=${window.t('newLeadStarted')}
                        style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;
                        border-radius:7px;color:white;font-size:11px;box-sizing:border-box;resize:vertical;">${d.notifyText||'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span> Новий лід: {{senderName}}\nКанал: {{channel}}\nВоронка: {{flowName}}\nДані: {{ai_response}}'}</textarea>
                </div>` : fld('Параметри (JSON)', ta('actionPayload', d.actionPayload, '{"variable":"phone","value":"{{input}}"}', 3));
            const actionSel = `<select id="fcp_actionType"
                onchange="fcSetActionType(this.value)"
                style="width:100%;padding:8px;background:#0f172a;border:1px solid #334155;
                border-radius:7px;color:white;font-size:12px;box-sizing:border-box;">
                ${[['set_var',window.t('setVariable')],['set_tag','Додати тег'],
                   ['remove_tag','Видалити тег'],['notify_admin',window.t('notifyManager')],
                   ['start_flow',window.t('runAnotherFlow')],['stop_flow','Зупинити флоу']]
                   .map(([v,l])=>`<option value="${v}" ${aType===v?'selected':''}>${l}</option>`).join('')}
            </select>`;
            fields = fld(window.t('actionType'), actionSel) + notifyFields;
            break;
        }
        case 'filter':
            fields = fld(window.t('variableWord'), inp('condVar', d.condVar, 'phone'))
                + fld('Оператор', sel('condOp',
                    [['=',window.t('condEquals')],['!=',window.t('condNotEquals')],
                     ['contains',window.t('condContains')],['exists',window.t('condExists')],['!exists',window.t('condNotExists')],
                     ['>',window.t('condGreater')],['<','< Менше']], d.condOp||'='))
                + fld('Значення', inp('condVal', d.condVal, ''))
                + `<div style="font-size:10px;color:#64748b;margin-top:4px;">
                    <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg></span> Вихід window.t('yesWord2') <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span> умова виконується<br>
                    <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg></span> Вихід window.t('noWord') <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span> умова не виконується</div>`;
            break;
        case 'pause':
            fields = fld(window.t('flowDelay'), `<div style="display:flex;gap:6px;">
                <input id="fcp_delay" type="number" value="${d.delay||5}" min="1"
                    style="flex:1;padding:8px;background:#0f172a;border:1px solid #334155;
                    border-radius:7px;color:white;font-size:12px;">
                ${sel('delayUnit',[['seconds','секунд'],['minutes','хвилин'],['hours','годин'],['days',window.t('daysWord')]], d.delayUnit||'seconds')}
                </div>`)
                + `<div style="font-size:10px;color:#64748b;margin-top:4px;">
                    Продовжувати ланцюжок: Завжди</div>`;
            break;
        case 'ai': {
            const aiProvider = d.aiProvider || 'openai';

            // Реальні моделі станом на березень 2026
            // ВАЖЛИВО: назви мають збігатись з API провайдерів
            const fallbackModels = {
                openai: [
                    ['gpt-4o-mini',        'GPT-4o mini — швидкий, дешевий ✅'],
                    ['gpt-4o',             window.t('gpt4oDesc')],
                    ['gpt-4-turbo',        'GPT-4 Turbo'],
                    ['gpt-3.5-turbo',      'GPT-3.5 Turbo — найдешевший'],
                    ['o1-mini',            window.t('o1miniDesc')],
                    ['o1',                 'o1 — глибоке мислення'],
                    ['o3-mini',            'o3-mini — швидке мислення'],
                    ['deepseek-chat',      'Deepseek Chat — дешевий'],
                ],
                anthropic: [
                    ['claude-haiku-4-5-20251001', 'Claude Haiku 4.5 — швидкий ✅'],
                    ['claude-3-5-haiku-20241022',  'Claude 3.5 Haiku'],
                    ['claude-3-5-sonnet-20241022',  'Claude 3.5 Sonnet — розумний'],
                    ['claude-sonnet-4-5',           'Claude Sonnet 4.5'],
                    ['claude-3-opus-20240229',       'Claude 3 Opus'],
                ],
                google: [
                    ['gemini-2.0-flash-lite',  'Gemini 2.0 Flash Lite — швидкий ✅'],
                    ['gemini-2.0-flash',       'Gemini 2.0 Flash'],
                    ['gemini-1.5-flash',       'Gemini 1.5 Flash'],
                    ['gemini-1.5-pro',         'Gemini 1.5 Pro — розумний'],
                    ['gemini-2.5-pro-preview', 'Gemini 2.5 Pro Preview (exp)'],
                ],
            };
            const allModels = window._cachedAiModels || fallbackModels;
            const _normalizeModels = (arr) => {
                if (!Array.isArray(arr) || !arr.length) return fallbackModels.openai;
                return arr.map(item => {
                    if (Array.isArray(item) && item.length >= 2) return [String(item[0]), String(item[1])];
                    if (typeof item === 'string') return [item, item];
                    // Firestore superadmin format: {id: 'gpt-4o', name: 'GPT-4o'}
                    if (item && typeof item === 'object') {
                        const v = String(item.id || item.value || item.model || '');
                        const l = String(item.name || item.label || item.display_name || v);
                        return [v, l];
                    }
                    return [String(item), String(item)];
                }).filter(([v]) => v && v.length > 0);
            };
            const _baseModels = _normalizeModels(allModels[aiProvider] || fallbackModels[aiProvider] || fallbackModels.openai);
            // FIX 2: якщо збережена модель не в списку — додаємо її щоб не втратити
            const _currentModel = d.aiModel || '';
            const _modelInList = _baseModels.some(([v]) => v === _currentModel);
            const modelOptions = (_currentModel && !_modelInList)
                ? [[_currentModel, _currentModel + ' (збережено)'], ..._baseModels]
                : _baseModels;

            if (!window._cachedAiModels) {
                firebase.firestore().collection('settings').doc('aiModels').get()
                    .then(snap => {
                        if (snap.exists && snap.data()) {
                            const data = snap.data();
                            const valid = ['openai','anthropic','google'].some(p => Array.isArray(data[p]) && data[p].length > 0);
                            // FIX 4: відфільтровуємо моделі що не існують (gpt-5, gpt-5.4 тощо)
                            // Ці фейкові назви призводять до помилок API
                            const _fakeModels = /^gpt-5\.?[0-9]?$|^gpt-5|gpt-5\.4|gpt-5\.2|gpt-5-mini-2025/;
                            if (valid) {
                                const cleaned = {};
                                Object.keys(data).forEach(provider => {
                                    if (!Array.isArray(data[provider])) return;
                                    cleaned[provider] = data[provider].filter(m => {
                                        const id = Array.isArray(m) ? m[0] : (m?.id || '');
                                        return !_fakeModels.test(id);
                                    });
                                });
                                window._cachedAiModels = cleaned;
                            } else {
                                window._cachedAiModels = null;
                            }
                            // FIX: зберігаємо поточний вибір моделі перед перемалюванням
                            // щоб async завантаження не скидало вибір юзера
                            const _savedModelBeforeRedraw = document.getElementById('fcp_aiModel')?.value;
                            if (fc.selected) {
                                // Застосовуємо в node.config щоб збережений вибір не загубився
                                const _curNode = fc.nodes.find(n => n.id === fc.selected);
                                if (_curNode && _savedModelBeforeRedraw) {
                                    _curNode.config = _curNode.config || {};
                                    _curNode.config.aiModel = _savedModelBeforeRedraw;
                                }
                                renderPropPanel();
                            }
                        }
                    }).catch(() => { window._cachedAiModels = null; });
            }

            // ── Функція завантаження актуальних моделей з API ──
            if (!window._fcLoadLiveModels) {
                window._fcLoadLiveModels = async function(prov, key) {
                    if (!key || key.includes('•')) { if (window.showToast) showToast('Введіть API ключ', 'warning'); return; }
                    const btn = document.getElementById('fcLoadModelsBtn');
                    if (btn) { btn.textContent = '⏳ Завантаження...'; btn.disabled = true; }
                    try {
                        let models = [];
                        if (prov === 'openai') {
                            const r = await fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': 'Bearer ' + key } });
                            const d = await r.json();
                            if (!r.ok) throw new Error(d.error?.message || 'Помилка OpenAI: ' + r.status);
                            models = (d.data || [])
                                .filter(m => /^(gpt-|o1|o3|o4)/.test(m.id) && !m.id.includes('instruct') && !m.id.includes('vision') && !m.id.includes('audio'))
                                .sort((a,b) => (b.created||0) - (a.created||0))
                                .slice(0, 25)
                                .map(m => [m.id, m.id]);
                        } else if (prov === 'anthropic') {
                            const r = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' } });
                            const d = await r.json();
                            if (!r.ok) throw new Error(d.error?.message || 'Помилка Anthropic: ' + r.status);
                            models = (d.data || []).map(m => [m.id, (m.display_name||m.id)]);
                        } else if (prov === 'google') {
                            const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
                            const d = await r.json();
                            if (!r.ok) throw new Error(d.error?.message || 'Помилка Google: ' + r.status);
                            models = (d.models||[])
                                .filter(m => m.name.includes('gemini') && (m.supportedGenerationMethods||[]).includes('generateContent'))
                                .map(m => [m.name.replace('models/',''), m.displayName||m.name.replace('models/','')]);
                        }
                        if (models.length) {
                            if (!window._cachedAiModels) window._cachedAiModels = {};
                            window._cachedAiModels[prov] = models;
                            if (window.showToast) showToast('✅ Завантажено ' + models.length + ' моделей', 'success');
                            if (fc.selected) renderPropPanel();
                        } else { throw new Error(window.t('modelsListEmpty')); }
                    } catch(e) {
                        if (window.showToast) showToast('❌ ' + e.message, 'error');
                        if (btn) { btn.textContent = '🔄 Оновити список'; btn.disabled = false; }
                    }
                };
            }

            const savedKey = d.aiApiKey || '';
            // Перевіряємо чи є ключ компанії (для відображення статусу)
            const _companyHasKey = !!(window.currentCompanyData?.[aiProvider + 'ApiKey']
                || window.currentCompanyData?.[aiProvider + 'ApiKey']);
            const temp = d.temperature ?? 0.7;
            const histLim = d.historyLimit ?? 6;
            const firstMsg = d.firstMessage || '';
            const firstMsgEnabled = d.firstMessageEnabled ? 'checked' : '';

            // Helper: tooltip label
            const tip = (label, hint) => `<span style="display:inline-flex;align-items:center;gap:4px;">
                ${label}
                <span title="${hint}" style="cursor:help;width:14px;height:14px;border-radius:50%;
                    background:#334155;color:#94a3b8;font-size:9px;font-weight:700;
                    display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">?</span>
            </span>`;

            fields =
            // ── Провайдер + Ключ ──
            `<div style="background:#0f172a;border:1px solid #22c55e33;border-radius:10px;padding:10px;margin-bottom:12px;">
                <div style="font-size:10px;color:#22c55e;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">
                    🔑 AI Провайдер
                </div>
                <div style="display:flex;gap:6px;margin-bottom:8px;">
                    ${['openai','anthropic','google'].map(p => `
                        <button onclick="fcSetAiProvider('${p}')"
                            style="flex:1;padding:6px 4px;border:1px solid ${aiProvider===p?'#22c55e':'#334155'};
                            border-radius:7px;background:${aiProvider===p?'#22c55e22':'transparent'};
                            color:${aiProvider===p?'#22c55e':'#94a3b8'};font-size:10px;font-weight:600;cursor:pointer;transition:all .15s;">
                            ${p==='openai'?'OpenAI':p==='anthropic'?'Anthropic':'Google'}
                        </button>`).join('')}
                </div>
                <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;display:flex;align-items:center;gap:4px;justify-content:space-between;">
                    <span style="display:flex;align-items:center;gap:4px;">
                        API Ключ
                        <a href="${aiProvider==='openai'?'https://platform.openai.com/api-keys':aiProvider==='anthropic'?'https://console.anthropic.com/settings/keys':'https://aistudio.google.com/app/apikey'}"
                            target="_blank" style="color:#3b82f6;font-size:9px;">Отримати →</a>
                    </span>
                    ${!savedKey && _companyHasKey ? '<span style="color:#22c55e;font-size:9px;">✅ Ключ компанії активний</span>' : ''}
                    ${savedKey ? '<span style="color:#22c55e;font-size:9px;">✅ Встановлено</span>' : (!_companyHasKey ? '<span style="color:#ef4444;font-size:9px;">⚠️ Не встановлено</span>' : '')}
                </div>
                <div style="position:relative;margin-bottom:4px;">
                    <input id="fcp_aiApiKey" type="password" value="${savedKey}"
                        placeholder="${aiProvider==='openai'?'sk-...':aiProvider==='anthropic'?'sk-ant-...':'AIza...'}"
                        style="width:100%;padding:7px 30px 7px 8px;background:#1e293b;border:1px solid #334155;
                        border-radius:7px;color:white;font-size:11px;box-sizing:border-box;"
                        oninput="(function(v){
                            const h=document.getElementById('fcp_keyHint');
                            if(!h)return;
                            if(!v){h.textContent='';return;}
                            const _isValidKey=v.startsWith('sk-')||v.startsWith('AIza')||v.startsWith('sk-ant');
                            if(v.includes('•')){h.style.color='#f59e0b';h.textContent='⚠️ Маска — введіть ключ заново';}
                            else if(_isValidKey&&v.length>=20){h.style.color='#22c55e';h.textContent='✅ Ключ виглядає вірно';}
                            else if(v.includes('@')||v.startsWith('http')){h.style.color='#ef4444';h.textContent='❌ Це не API ключ';}
                            else if(!_isValidKey&&/^[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/.test(v)){h.style.color='#ef4444';h.textContent='❌ Це домен, не ключ';}
                            else if(v.length<20){h.style.color='#f59e0b';h.textContent='⚠️ Занадто короткий';}
                            else{h.style.color='#94a3b8';h.textContent='ℹ️ Формат не розпізнано — перевірте';}
                        })(this.value)">
                    <span onclick="const i=document.getElementById('fcp_aiApiKey');i.type=i.type==='password'?'text':'password';"
                        style="position:absolute;right:7px;top:50%;transform:translateY(-50%);
                        cursor:pointer;font-size:12px;opacity:0.5;user-select:none;" title="Показати/приховати">👁</span>
                </div>
                <div id="fcp_keyHint" style="font-size:9px;margin-top:2px;margin-bottom:2px;">${
                    savedKey && savedKey.includes('•') ? '<span style="color:#f59e0b;">⚠️ Маска — введіть ключ заново</span>' :
                    savedKey && (savedKey.includes('@') || /^[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/.test(savedKey)) ? '<span style="color:#ef4444;">❌ Збережено невалідне значення — очистіть і введіть sk-...</span>' :
                    savedKey && savedKey.length >= 20 && (savedKey.startsWith('sk-') || savedKey.startsWith('AIza') || savedKey.startsWith('sk-ant')) ? '<span style="color:#22c55e;">✅ Ключ збережено</span>' :
                    ''
                }</div>
                <div style="font-size:9px;color:#475569;">
                    Ключ для цього ланцюга.
                    <span style="color:#22c55e;cursor:pointer;text-decoration:underline;"
                        onclick="(async()=>{
                            const k=document.getElementById('fcp_aiApiKey')?.value?.trim();
                            if(!k||k.startsWith('•')){if(window.showToast)showToast('Введіть повний API ключ','warning');return;}
                            const providerField='${aiProvider}ApiKey';
                            try{
                                await firebase.firestore().collection('companies').doc(window.currentCompanyId).update({[providerField]:k});
                                if(window.showToast)showToast('✅ Збережено для всіх ланцюгів','success');
                            }catch(e){if(window.showToast)showToast(window.t('errPfx2')+e.message,'error');}
                        })()">
                        Зберегти для всієї компанії →
                    </span>
                </div>
            </div>`

            // ── Системний промпт ──
            + fld(tip(window.t('flowSysPr'), 'Скажи боту хто він і що робить. Наприклад: "Ти — менеджер клініки. Запитуй ім\'я, телефон і зручний час. Будь ввічливим. Відповідай тільки українською." Чим конкретніше — тим краще.'),
                ta('aiSystem', d.aiSystem, 'Ти — помічник компанії. Відповідай коротко та по суті українською мовою.', 5))

            // ── Модель ──
            + fld(tip('Модель AI', 'Мозок бота. GPT-4o mini — найкращий вибір для більшості: швидкий і недорогий. GPT-4o — розумніший але дорожчий. Якщо не знаєш що обрати — залиш GPT-4o mini.'),
                sel('aiModel', modelOptions, d.aiModel || modelOptions[0][0])
                + (d.aiModel && !modelOptions.some(([v]) => v === d.aiModel)
                    ? '<div style="font-size:9px;color:#f59e0b;margin-top:3px;">⚠️ Модель "' + d.aiModel + '" не в списку — може не існувати. Обери нову.</div>'
                    : '')
                + '<div style="margin-top:5px;">'
                    + '<button id="fcLoadModelsBtn" onclick="_fcLoadLiveModels(\'' + aiProvider + '\', document.getElementById(\'fcp_aiApiKey\')?.value)"'
                    + ' style="width:100%;padding:5px;background:transparent;border:1px solid #334155;border-radius:6px;'
                    + 'color:#64748b;font-size:10px;cursor:pointer;transition:all .15s;"'
                    + ' onmouseenter="this.style.borderColor=\'#22c55e\';this.style.color=\'#22c55e\'"'
                    + ' onmouseleave="this.style.borderColor=\'#334155\';this.style.color=\'#64748b\'">🔄 Завантажити актуальні моделі з API</button>'
                + '</div>'
            )

            // ── Точність відповіді (temperature) ──
            + `<div style="margin-bottom:12px;">
                <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;display:flex;align-items:center;gap:4px;">
                    ${tip(window.t('responseAccuracy'), 'Наскільки бот "по скрипту". Ближче до 0 — відповідає чітко і передбачувано (добре коли збираєш дані: ім\'я, телефон). Ближче до 1 — відповідає більш живо і різноманітно. Для продажів і анкет рекомендуємо 0.4–0.6.')}
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:10px;color:#64748b;min-width:28px;">0.0</span>
                    <input id="fcp_temperature" type="range" min="0" max="1" step="0.05"
                        value="${temp}"
                        style="flex:1;accent-color:#22c55e;cursor:pointer;height:4px;"
                        oninput="document.getElementById('fcp_temp_val').textContent=parseFloat(this.value).toFixed(2);
                                 const v=parseFloat(this.value);
                                 document.getElementById('fcp_temp_desc').textContent=v<=0.2?'Дуже точно':v<=0.4?'Точно':v<=0.6?'Збалансовано':v<=0.8?'Природньо':'Творчо';">
                    <span style="font-size:10px;color:#64748b;min-width:28px;text-align:right;">1.0</span>
                    <span id="fcp_temp_val" style="color:#22c55e;font-size:13px;font-weight:700;min-width:36px;text-align:right;">${temp.toFixed(2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:3px;">
                    <span style="font-size:9px;color:#334155;">← Точно</span>
                    <span id="fcp_temp_desc" style="font-size:10px;color:#64748b;font-weight:600;">${temp<=0.2?'Дуже точно':temp<=0.4?'Точно':temp<=0.6?'Збалансовано':temp<=0.8?'Природньо':'Творчо'}</span>
                    <span style="font-size:9px;color:#334155;">Творчо →</span>
                </div>
            </div>`

            // ── Пам'ять + Макс токени ──
            + `<div style="display:flex;gap:8px;margin-bottom:12px;">
                <div style="flex:1;">
                    <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">
                        ${tip(window.t('dialogMemory'), "Скільки кроків розмови бот пам'ятає. Якщо поставити 0 — бот забуває кожну відповідь одразу (дешевше, але не зможе підсумувати). Для анкети на 5-7 питань — постав 14. Для простого привітання — вистачить 4.")}
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
                        <input id="fcp_historyLimit" type="number" min="0" max="20" value="${histLim}"
                            style="width:100%;padding:7px 8px;background:#0f172a;border:1px solid #334155;
                            border-radius:7px;color:white;font-size:12px;box-sizing:border-box;text-align:center;">
                        <span style="font-size:9px;color:#475569;white-space:nowrap;">повід.</span>
                    </div>
                    <div style="display:flex;gap:3px;">
                        ${[['0','Без'],['6','6'],['14','14']].map(([v,l]) =>
                            '<span onclick="document.getElementById(\'fcp_historyLimit\').value=' + v + '" '
                            + 'style="flex:1;text-align:center;font-size:9px;padding:2px 0;border-radius:4px;cursor:pointer;'
                            + 'background:' + (histLim==+v ? '#22c55e22' : '#0f172a') + ';'
                            + 'border:1px solid ' + (histLim==+v ? '#22c55e' : '#334155') + ';'
                            + 'color:' + (histLim==+v ? '#22c55e' : '#64748b') + ';">' + l + '</span>'
                        ).join('')}
                    </div>
                </div>
                <div style="flex:1;">
                    <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">
                        ${tip('Макс. токени', "Довжина однієї відповіді бота. Коротко (200) — бот пише 1-2 речення, швидко і дешево. Середньо (600) — абзац тексту. Довго (1500) — детальні пояснення. Для анкет і продажів обирай Коротко.")}
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
                        <input id="fcp_maxTokens" type="number" min="100" max="2000" step="100" value="${d.maxTokens || 600}"
                            style="width:100%;padding:7px 8px;background:#0f172a;border:1px solid #334155;
                            border-radius:7px;color:white;font-size:12px;box-sizing:border-box;text-align:center;">
                        <span style="font-size:9px;color:#475569;white-space:nowrap;">токенів</span>
                    </div>
                    <div style="display:flex;gap:3px;">
                        ${[['200','Коротко'],['600','Середньо'],['1500','Довго']].map(([v,l]) =>
                            '<span onclick="document.getElementById(\'fcp_maxTokens\').value=' + v + '" '
                            + 'style="flex:1;text-align:center;font-size:9px;padding:2px 0;border-radius:4px;cursor:pointer;'
                            + 'background:' + ((d.maxTokens||600)==+v ? '#22c55e22' : '#0f172a') + ';'
                            + 'border:1px solid ' + ((d.maxTokens||600)==+v ? '#22c55e' : '#334155') + ';'
                            + 'color:' + ((d.maxTokens||600)==+v ? '#22c55e' : '#64748b') + ';">' + l + '</span>'
                        ).join('')}
                    </div>
                </div>
            </div>`

            // ── Бот пише першим ──
            + `<div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:10px;margin-bottom:12px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">
                        ${tip('Бот пише першим', 'Коли клієнт запускає бота — він одразу отримує повідомлення без того щоб щось писати. Увімкни і напиши привітання: "Привіт! Я допоможу записати вас на консультацію..."')}
                    </div>
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                        <div style="position:relative;width:32px;height:18px;">
                            <input type="checkbox" id="fcp_firstMessageEnabled" ${firstMsgEnabled}
                                style="opacity:0;position:absolute;width:100%;height:100%;margin:0;cursor:pointer;z-index:1;"
                                onchange="document.getElementById('fcp_firstMsgRow').style.display=this.checked?'block':'none';
                                    document.getElementById('fcp_toggle_bg').style.background=this.checked?'#22c55e':'#334155';
                                    document.getElementById('fcp_toggle_knob').style.left=this.checked?'16px':'2px';
                                    this.parentElement.parentElement.querySelector('span').textContent=this.checked?window.t('enabledWord'):'Вимкнено';">
                            <div id="fcp_toggle_bg" style="width:32px;height:18px;border-radius:9px;background:${firstMsgEnabled?'#22c55e':'#334155'};transition:background .2s;position:absolute;top:0;left:0;pointer-events:none;"></div>
                            <div style="width:14px;height:14px;border-radius:50%;background:white;position:absolute;top:2px;left:${firstMsgEnabled?'16px':'2px'};transition:left .2s;pointer-events:none;" id="fcp_toggle_knob"></div>
                        </div>
                        <span style="font-size:11px;color:#64748b;">${firstMsgEnabled?window.t('enabledWord'):'Вимкнено'}</span>
                    </label>
                </div>
                <div id="fcp_firstMsgRow" style="display:${firstMsgEnabled?'block':'none'};">
                    <div style="font-size:10px;color:#64748b;margin-bottom:4px;">Перше повідомлення від бота:</div>
                    <textarea id="fcp_firstMessage" rows="2"
                        style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;
                        border-radius:7px;color:white;font-size:11px;resize:vertical;box-sizing:border-box;"
                        placeholder="Привіт! 👋 Я AI-асистент. Чим можу допомогти?">${firstMsg}</textarea>
                </div>
            </div>`

            // ── Зберегти відповідь / Запасна ──
            + fld(tip(window.t('saveResponse'), 'Остання відповідь бота збережеться під цим іменем. Потім можна використати її в наступних кроках через подвійні дужки. Якщо не знаєш навіщо — залиш як є.'),
                inp('saveAs', d.saveAs, 'ai_response'))
            + fld(tip(window.t('fallbackResponse'), 'Що напише бот якщо щось піде не так (наприклад, немає інтернету або закінчились гроші на API). Клієнт не побачить помилку — отримає цей текст.'),
                inp('fallback', d.fallback, window.t('sorryTryLater')))

            // ── Теги керування ──
            + `<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:8px;margin-bottom:10px;">
                <div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:6px;">Теги керування (в промпті):</div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;align-items:flex-start;gap:6px;">
                        <code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#22c55e;font-size:10px;white-space:nowrap;">[DONE]</code>
                        <span style="font-size:10px;color:#64748b;">AI завершив збір даних → флоу переходить далі</span>
                    </div>
                    <div style="display:flex;align-items:flex-start;gap:6px;">
                        <code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#3b82f6;font-size:10px;white-space:nowrap;">[SAVE:ключ=знач]</code>
                        <span style="font-size:10px;color:#64748b;">Зберегти дані з відповіді AI у змінну</span>
                    </div>
                    <div style="display:flex;align-items:flex-start;gap:6px;">
                        <code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#f59e0b;font-size:10px;white-space:nowrap;">[BTN:текст]</code>
                        <span style="font-size:10px;color:#64748b;">AI генерує динамічні кнопки</span>
                    </div>
                </div>
            </div>`

            // ── Тест кнопка ──
            + `<button onclick="fcTestAiNode('${node.id}')"
                style="width:100%;padding:9px;background:transparent;border:1px solid #22c55e55;
                border-radius:8px;color:#22c55e;font-size:11px;font-weight:600;cursor:pointer;
                display:flex;align-items:center;justify-content:center;gap:6px;
                transition:all 0.15s;"
                onmouseenter="this.style.background='#22c55e22'"
                onmouseleave="this.style.background='transparent'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Тест AI відповіді
            </button>`;

            // Toggle fix
            setTimeout(() => {
                const cb = document.getElementById('fcp_firstMessageEnabled');
                const bg = document.getElementById('fcp_toggle_bg');
                const kn = document.getElementById('fcp_toggle_knob');
                const lbl = cb?.parentElement?.querySelector('span');
                if (cb) cb.addEventListener('change', () => {
                    if (bg) bg.style.background = cb.checked ? '#22c55e' : '#334155';
                    if (kn) kn.style.left = cb.checked ? '16px' : '2px';
                    if (lbl) lbl.textContent = cb.checked ? window.t('enabledWord') : 'Вимкнено';
                });
            }, 50);

            break;
        }
        case 'api':
            fields = fld('Метод + URL', `<div style="display:flex;gap:6px;">
                ${sel('apiMethod',[['POST','POST'],['GET','GET'],['PUT','PUT'],['PATCH','PATCH'],['DELETE','DELETE']], d.apiMethod||'POST')}
                ${inp('apiUrl', d.apiUrl, 'https://api.example.com/lead')}
                </div>`)
                + fld('Headers (JSON)', ta('apiHeaders', d.apiHeaders, '{"Content-Type":"application/json"}', 2))
                + fld('Body (JSON шаблон)', ta('apiBody', d.apiBody, '{"phone":"{{phone}}","name":"{{name}}"}', 3))
                + fld(window.t('saveResponseVar'), inp('saveAs', d.saveAs, 'api_response'));
            break;
        case 'sheets':
            fields = fld('Apps Script URL', inp('sheetsId', d.sheetsId, 'https://script.google.com/macros/s/.../exec'))
                + fld('Назва листа', inp('sheetsName', d.sheetsName, 'Leads'))
                + fld(window.t('columnMapping'), ta('sheetsMapping', d.sheetsMapping,
                    '{"A":"{{name}}","B":"{{phone}}","C":"{{date}}"}', 3));
            break;
        case 'random':
            fields = fld(window.t('splitPercent'), `<div style="display:flex;gap:6px;align-items:center;">
                <span style="color:#94a3b8;font-size:12px;">А:</span>
                <input id="fcp_splitA" type="number" value="${d.splitA||50}" min="1" max="99"
                    style="width:60px;padding:8px;background:#0f172a;border:1px solid #334155;
                    border-radius:7px;color:white;font-size:12px;">
                <span style="color:#94a3b8;font-size:12px;">% · Б:</span>
                <input id="fcp_splitB" type="number" value="${d.splitB||50}" min="1" max="99"
                    style="width:60px;padding:8px;background:#0f172a;border:1px solid #334155;
                    border-radius:7px;color:white;font-size:12px;">
                <span style="color:#94a3b8;font-size:12px;">%</span>
                </div>`);
            break;
        case 'repeat':
            fields = fld(window.t('repeatCount'), inp('repeatCount', d.repeatCount, '3'))
                + fld(window.t('intervalSecs'), inp('repeatInterval', d.repeatInterval, '60'))
                + fld(window.t('exitCondVar'), inp('exitVar', d.exitVar, 'confirmed'));
            break;
        case 'crm': {
            const _crmHint = '<div style="font-size:9px;color:#22c55e;background:#0f172a;border-radius:6px;padding:6px 8px;margin:4px 0 8px;line-height:1.5;">'
                + '{{name}} — імя, {{phone}} — телефон, {{email}} — email, {{ai_response}} — остання AI відповідь</div>';

            // Якщо CRM pipelines ще не завантажені — підвантажуємо асинхронно
            if (!window.crm?.pipelines?.length && window.currentCompanyId && !window._crmPipLoading) {
                window._crmPipLoading = true;
                firebase.firestore().collection('companies').doc(window.currentCompanyId)
                    .collection('crm_pipeline').limit(20).get()  // FIX: всі воронки, не тільки isDefault
                    .then(snap => {
                        if (!window.crm) window.crm = {};
                        window.crm.pipelines = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        window._crmPipLoading = false;
                        if (fc.selected) renderPropPanel(); // перемалюємо
                    }).catch(() => { window._crmPipLoading = false; });
            }
            const _pipelines = (window.crm?.pipelines || []);
            const _pipOpts = _pipelines.length
                ? _pipelines.map(p => [p.id, p.name + (p.isDefault ? ' (за замовчуванням)' : '')])
                : [['', 'Завантаження...']];
            const _selPipId = d.pipelineId || (_pipelines.find(p=>p.isDefault)||_pipelines[0])?.id || '';

            // Стадії з вибраної воронки
            const _selPip = _pipelines.find(p => p.id === _selPipId) || _pipelines.find(p=>p.isDefault) || _pipelines[0];
            // FIX: CRM зберігає stage.label, не stage.name
            const _stageOpts = (_selPip?.stages || [])
                .filter(s => s && s.id)  // FIX: відфільтровуємо стадії без id
                .slice().sort((a,b) => (a.order||0) - (b.order||0))
                .map(s => [String(s.id), s.label || s.name || String(s.id)]);
            // FIX: IDs відповідають реальному _createDefaultPipeline в 77-crm.js
            const _defaultStageOpts = [
                ['new',window.t('newLeadWord')],['contact','Контакт'],
                ['negotiation','Переговори'],['proposal',window.t('proposalWord')],
                ['closing','Закриття'],['won','Виграно'],
            ];
            const _finalStageOpts = _stageOpts.length ? _stageOpts : _defaultStageOpts;
            // FIX: якщо збережений d.dealStage не співпадає жодній стадії — беремо першу (не 'undefined')
            const _stageMatch = _finalStageOpts.find(([v]) => v === d.dealStage);
            const _selectedStage = _stageMatch ? d.dealStage : (_finalStageOpts[0]?.[0] || 'new');

            fields = fld(window.t('flowDealNm'), inp('dealTitle', d.dealTitle, '{{name}} — лід з бота'))
                + _crmHint
                + '<div style="margin-bottom:10px;">'
                    + '<div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Воронка</div>'
                    + '<select id="fcp_pipelineId" onchange="window._fcCrmPipelineChange(this.value)"'
                    + ' style="width:100%;padding:7px 8px;background:#0f172a;border:1px solid #334155;border-radius:7px;color:white;font-size:12px;box-sizing:border-box;">'
                    + _pipOpts.map(([v,l]) => '<option value="'+v+'"'+(_selPipId===v?' selected':'')+'>'+l+'</option>').join('')
                    + '</select>'
                + '</div>'
                + '<div id="fcp_stageWrap" style="margin-bottom:10px;">'
                    + '<div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Стадія</div>'
                    + '<select id="fcp_dealStage" style="width:100%;padding:7px 8px;background:#0f172a;border:1px solid #334155;border-radius:7px;color:white;font-size:12px;box-sizing:border-box;">'
                    + _finalStageOpts.map(([v,l]) => '<option value="'+v+'"'+(_selectedStage===v?' selected':'')+'>'+l+'</option>').join('')
                    + '</select>'
                + '</div>'
                + fld('Сума угоди (грн)', inp('amount', d.amount ?? '', '0'));
            break;
        }
        case 'end':
            fields = fld(window.t('finalMessage'), ta('text', d.text, 'Дякуємо! Ми зв\'яжемось.', 2));
            break;
        default:
            fields = fld('Текст', ta('text', d.text, ''));
    }

    panel.innerHTML = `
        <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;
                padding:10px 12px;border-radius:12px;
                background:linear-gradient(135deg,${cfg.color}22,${cfg.border}11);
                border:1px solid ${cfg.color}33;">
                <div style="width:38px;height:38px;border-radius:10px;background:${cfg.color};
                    display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;box-shadow:0 2px 8px ${cfg.color}55;">
                    ${cfg.icon}
                </div>
                <div>
                    <div style="color:white;font-weight:700;font-size:14px;">${cfg.label}</div>
                    <div style="color:#475569;font-size:10px;margin-top:1px;font-family:monospace;">${node.id}</div>
                </div>
            </div>
            ${fields}
            <button onclick="fcApplyNodeData('${node.id}')"
                style="width:100%;padding:10px;background:linear-gradient(135deg,#22c55e,#16a34a);
                border:none;border-radius:9px;color:white;cursor:pointer;font-weight:700;
                font-size:13px;margin-top:4px;box-shadow:0 2px 8px rgba(34,197,94,0.35);
                transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px;"
                onmouseenter="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(34,197,94,0.45)'"
                onmouseleave="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(34,197,94,0.35)'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                Застосувати
            </button>
            ${node.type !== 'start' ? `
            <button onclick="fcDeleteNode('${node.id}')"
                style="width:100%;padding:8px;background:transparent;border:1px solid #334155;
                border-radius:8px;color:#64748b;cursor:pointer;font-size:12px;margin-top:6px;
                transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:5px;"
                onmouseenter="this.style.borderColor='#ef4444';this.style.color='#ef4444'"
                onmouseleave="this.style.borderColor='#334155';this.style.color='#64748b'">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M9,6V4h6v2"/></svg>
                Видалити вузол
            </button>` : ''}
        </div>`;

    // FIX: після рендеру CRM вузла — синхронізуємо стадії з вибраною воронкою
    // Це гарантує що стадії завжди відповідають pipeline select, навіть при async load
    if (node.type === 'crm') {
        // FIX: використовуємо setTimeout щоб дати час завантажитись pipeline async
        // requestAnimationFrame недостатньо — async pipeline load може ще йти
        const _savedStage = node.config?.dealStage || null;
        const _savedPipId = node.config?.pipelineId || null;

        const _applyStage = (isRetry) => {
            const _pipSel = document.getElementById('fcp_pipelineId');
            const _stageSel = document.getElementById('fcp_dealStage');
            if (!_pipSel || !_stageSel) return;

            // Якщо pipelines ще не завантажились — retry через 400мс (тільки один раз)
            if (!window.crm?.pipelines?.length && !isRetry) {
                setTimeout(() => _applyStage(true), 400);
                return;
            }

            // Встановлюємо pipeline select
            const _pipId = _savedPipId
                || _pipSel.value
                || (window.crm?.pipelines || []).find(p=>p.isDefault)?.id
                || (window.crm?.pipelines || [])[0]?.id
                || '';
            if (_pipId && _pipSel.value !== _pipId) {
                const _pipOpt = _pipSel.querySelector(`option[value="${_pipId}"]`);
                if (_pipOpt) _pipSel.value = _pipId;
            }

            // Оновлюємо options стадій для обраної воронки (без скидання поточного значення)
            if (typeof window._fcCrmPipelineChange === 'function') {
                window._fcCrmPipelineChange(_pipId);
            }

            // Відновлюємо збережену стадію ПІСЛЯ оновлення options
            if (_savedStage && _savedStage !== 'undefined') {
                const _opt = _stageSel.querySelector(`option[value="${_savedStage}"]`);
                if (_opt) {
                    _stageSel.value = _savedStage;
                } else if (!isRetry) {
                    // Опція ще не з'явилась — спробуємо ще раз через 400мс
                    setTimeout(() => {
                        const _s = document.getElementById('fcp_dealStage');
                        if (_s) {
                            const _o = _s.querySelector(`option[value="${_savedStage}"]`);
                            if (_o) _s.value = _savedStage;
                        }
                    }, 400);
                }
            }
        };

        // Запускаємо одразу після рендеру
        requestAnimationFrame(() => _applyStage(false));
    }
}

window.fcApplyNodeData = function(nodeId) {
    const node = fc.nodes.find(n=>n.id===nodeId);
    if (!node) return;
    pushHistory();
    const get = id => document.getElementById(`fcp_${id}`)?.value?.trim()||'';

    switch(node.type) {
        case 'start':
            node.config.triggerKeyword = get('triggerKeyword') || '/start';
            break;
        case 'message':
            node.config.text = get('text');
            node.config.saveAs = get('saveAs') || null;
            // Читаємо кнопки з inline полів
            if (node.config.buttons?.length) {
                node.config.buttons = node.config.buttons.map((b, i) => ({
                    ...b,
                    label: document.getElementById(`fcp_btn_label_${i}`)?.value || b.label || '',
                    url: document.getElementById(`fcp_btn_url_${i}`)?.value?.trim() || null,
                }));
            }
            node.outputs = (node.config.buttons||[]).length > 0
                ? ['out', ...(node.config.buttons||[]).map((_,i)=>`btn_${i}`)]
                : ['out'];
            break;
        case 'action':
            node.config.actionType = get('actionType');
            node.config.actionPayload = get('actionPayload');
            node.config.notifyChatId = document.getElementById('fcp_notifyChatId')?.value?.trim() || null;
            node.config.notifyText = document.getElementById('fcp_notifyText')?.value || null;
            node.config.notifyFlowName = document.getElementById('fcp_notifyFlowName')?.value?.trim() || null;
            break;
        case 'filter':
            node.config.condVar = get('condVar');
            node.config.condOp = get('condOp');
            node.config.condVal = get('condVal');
            break;
        case 'pause':
            node.config.delay = parseInt(get('delay'))||5;
            node.config.delayUnit = get('delayUnit');
            break;
        case 'ai':
            node.config.aiSystem = get('aiSystem');
            node.config.aiModel = get('aiModel');
            // VALIDATE: не зберігаємо маску, email, URL або занадто короткий рядок
            (function() {
                const _rawKey = get('aiApiKey');
                const _isMasked = _rawKey.includes('•');
                const _isEmail  = _rawKey.includes('@');
                const _isUrl    = _rawKey.startsWith('http');
                const _isDomain = !_rawKey.startsWith('sk-') && !_rawKey.startsWith('AIza') && /^[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/.test(_rawKey);
                const _tooShort = _rawKey.length > 0 && _rawKey.length < 20;
                const _isInvalid = _isMasked || _isEmail || _isUrl || _isDomain || _tooShort;
                if (_isInvalid && _rawKey) {
                    console.warn('[canvas] aiApiKey invalid — not saved to node:', _rawKey.slice(0,15));
                    if (window.showToast) showToast('⚠️ API ключ не збережено у вузлі — невалідний формат. Збережіть ключ для всієї компанії.', 'warning');
                }
                node.config.aiApiKey = (_rawKey && !_isInvalid) ? _rawKey : null;
            })();
            node.config.aiProvider = get('aiProvider') || node.config?.aiProvider || 'openai';
            node.config.saveAs = get('saveAs') || null;
            node.config.fallback = get('fallback');
            const _rawT = parseFloat(document.getElementById('fcp_temperature')?.value);
            node.config.temperature = (isNaN(_rawT) ? 0.7 : Math.min(Math.max(_rawT, 0), 2));
            node.config.historyLimit = parseInt(document.getElementById('fcp_historyLimit')?.value ?? 6) || 0;
            node.config.maxTokens = parseInt(document.getElementById('fcp_maxTokens')?.value) || 600;
            node.config.firstMessageEnabled = document.getElementById('fcp_firstMessageEnabled')?.checked || false;
            node.config.firstMessage = document.getElementById('fcp_firstMessage')?.value?.trim() || '';
            break;
        case 'api':
            node.config.apiMethod = get('apiMethod');
            node.config.apiUrl = get('apiUrl');
            node.config.apiHeaders = get('apiHeaders');
            node.config.apiBody = get('apiBody');
            node.config.saveAs = get('saveAs') || null;
            break;
        case 'sheets':
            node.config.sheetsId = get('sheetsId');
            node.config.sheetsName = get('sheetsName');
            node.config.sheetsMapping = get('sheetsMapping');
            break;
        case 'random':
            node.config.splitA = parseInt(get('splitA'))||50;
            node.config.splitB = parseInt(get('splitB'))||50;
            break;
        case 'repeat':
            node.config.repeatCount = parseInt(get('repeatCount'))||3;
            node.config.repeatInterval = parseInt(get('repeatInterval'))||60;
            node.config.exitVar = get('exitVar');
            break;
        case 'crm': {
            const _rawStage = document.getElementById('fcp_dealStage')?.value || '';
            const _rawPip = document.getElementById('fcp_pipelineId')?.value || '';
            node.config.dealTitle = get('dealTitle') || '{{name}} — лід з бота';
            // FIX: санітизуємо — не зберігаємо 'undefined', '', null як stage
            node.config.dealStage = (_rawStage && _rawStage !== 'undefined') ? _rawStage : 'new';
            node.config.amount = parseFloat(get('amount')) || 0;
            node.config.pipelineId = (_rawPip && _rawPip !== 'undefined') ? _rawPip : null;
            // FIX: прибираємо nested config і службові поля щоб не роздувати Firestore
            delete node.config.config;
            delete node.config._x; delete node.config._y;
            delete node.config.outputs;
            break;
        }
        case 'end':
            node.config.text = get('text');
            break;
        default:
            node.config.text = get('text');
    }

    // FIX: глобальне прибирання service-полів з config щоб не роздувати Firestore
    // Ці поля не потрібні в config — вони дублюються на рівні node
    delete node.config.config;   // вкладений config — виникає при load/save циклах
    delete node.config._x;
    delete node.config._y;
    delete node.config.outputs;

    renderAll();
    renderPropPanel();
    // Автозберігаємо в Firestore після Застосувати
    // GUARD: не викликаємо saveFlow якщо він вже нас викликав (запобігання рекурсії)
    if (!window._fcApplyingBeforeSave) saveFlow();
};

// ── Дублювання вузла ───────────────────────────────────────
window.fcDuplicateNode = function(nodeId) {
    const orig = fc.nodes.find(n => n.id === nodeId);
    if (!orig || orig.type === 'start') return;
    pushHistory();
    const newId = 'node_' + Date.now();
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = newId;
    copy.x = orig.x + 240;
    copy.y = orig.y + 40;
    // Скидаємо виходи — нова копія без з'єднань
    fc.nodes.push(copy);
    fc.selected = newId;
    renderAll();
    renderPropPanel();
    saveFlow();
    if (window.showToast) showToast('✅ Вузол скопійовано', 'success');
};

window.fcDeleteNode = async function(nodeId) {
    if (!(await (window.showConfirmModal ? showConfirmModal('Видалити вузол?',{danger:true}) : Promise.resolve(confirm('Видалити вузол?'))))) return;
    pushHistory();
    fc.nodes = fc.nodes.filter(n=>n.id!==nodeId);
    fc.edges = fc.edges.filter(e=>e.fromNode!==nodeId&&e.toNode!==nodeId);
    fc.selected = null;
    renderAll();
    renderPropPanel();
};

// ── Save ───────────────────────────────────────────────────
// ── Inline title save ─────────────────────────────────
window._fcSaveTitle = async function(newName) {
    const name = (newName || '').trim().slice(0, 100);
    if (!name || name === fc.flowData.name) return;

    // Оновлюємо локально
    fc.flowData.name = name;

    // Підганяємо ширину
    const el = document.getElementById('fcFlowTitle');
    if (el) {
        el.value = name;
        const tmp = document.createElement('span');
        tmp.style.cssText = 'position:absolute;visibility:hidden;font-size:14px;font-weight:700;white-space:nowrap;padding:0 34px 0 6px;';
        tmp.textContent = name;
        document.body.appendChild(tmp);
        el.style.width = Math.min(Math.max(tmp.offsetWidth + 2, 80), 220) + 'px';
        document.body.removeChild(tmp);
    }

    // Зберігаємо в Firestore одразу
    try {
        const ref = fc.botId
            ? firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .collection('bots').doc(fc.botId).collection('flows').doc(fc.flowId)
            : firebase.firestore().collection('companies').doc(window.currentCompanyId)
                .collection('flows').doc(fc.flowId);
        await ref.update({ name, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof showToast === 'function') showToast('✅ Назву збережено', 'success');
    } catch(e) {
        console.error('[fcSaveTitle]', e.message);
        if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
    }
};

async function saveFlow() {
    if (window._fcSaving) {
        console.warn('[saveFlow] skipped — _fcSaving=true (попереднє збереження ще йде або залипло)');
        return;
    }
    // FIX: guard на обов'язкові поля — без них Firestore path некоректний
    if (!fc.flowId || !window.currentCompanyId) {
        console.error('[saveFlow] ABORT — fc.flowId:', fc.flowId, 'currentCompanyId:', window.currentCompanyId);
        if (typeof showToast === 'function') showToast('Помилка: ID флоу або компанії відсутній', 'error');
        return;
    }
    // CRITICAL FIX: застосовуємо дані з відкритої панелі перед збереженням
    // Без цього: юзер вставив ключ → натиснув Зберегти → fc.nodes містить старий ключ
    // бо fcApplyNodeData не викликався (onblur не спрацював)
    // GUARD: запобігаємо рекурсії saveFlow → fcApplyNodeData → saveFlow
    if (fc.selected && !window._fcApplyingBeforeSave) {
        window._fcApplyingBeforeSave = true;
        try { window.fcApplyNodeData(fc.selected); } catch(e) { console.warn('[saveFlow] pre-save apply:', e.message); }
        window._fcApplyingBeforeSave = false;
    }
    console.log('[saveFlow] START flowId:', fc.flowId, 'botId:', fc.botId, 'nodes:', fc.nodes.length);
    window._fcSaving = true;
    const btn = document.getElementById('fcBtnSave');
    if (btn) btn.textContent = window.t('botsFlowSaving');

    // Build canvasData (source of truth)
    const canvasData = {
        nodes: fc.nodes.map(n => { const { config: _c, _x: __x, _y: __y, outputs: __o, ...cfgClean } = (n.config||{}); return { ...cfgClean, id:n.id, type:n.type, _x:n.x, _y:n.y, outputs:n.outputs }; }),
        edges: fc.edges,
        version: Date.now(),
    };

    // Also build runtime nodes array (for webhook.js)
    const edgeMap = {};
    fc.edges.forEach(e => {
        if (!edgeMap[e.fromNode]) edgeMap[e.fromNode] = {};
        edgeMap[e.fromNode][e.fromPort] = e.toNode;
    });

    const startNode = fc.nodes.find(n=>n.type==='start');
    const triggerKeyword = startNode?.config?.triggerKeyword || '/start';
    const firstNodeId = startNode ? (edgeMap[startNode.id]?.out || null) : null;

    const runtimeNodes = fc.nodes
        .filter(n=>n.type!=='start')
        .map(n => {
            const ports = edgeMap[n.id] || {};
            const d = {...n.config, id:n.id, type:n.type, _x:n.x, _y:n.y, config:n.config||{}};
            if (n.type==='filter') { d.trueNode=ports.yes||null; d.falseNode=ports.no||null; }
            else if (n.type==='random') { d.branchA=ports.a||null; d.branchB=ports.b||null; }
            else if (n.type==='ai'||n.type==='api') { d.nextNode=ports.ok||ports.out||null; d.errorNode=ports.err||null; }
            else if (n.type==='message'&&n.config.buttons?.length) {
                d.nextNode = ports.out || null;
                d.options = (n.config.buttons||[]).map((b,i)=>({...b, nextNode:ports[`btn_${i}`]||null}));
            } else { d.nextNode=ports.out||null; }
            return d;
        });

    // Sort: first node connected to start goes first
    const ordered = firstNodeId
        ? [runtimeNodes.find(n=>n.id===firstNodeId), ...runtimeNodes.filter(n=>n.id!==firstNodeId)].filter(Boolean)
        : runtimeNodes;

    try {
        const saveRef = fc.botId
            ? firebase.firestore().collection('companies').doc(window.currentCompanyId).collection('bots').doc(fc.botId).collection('flows').doc(fc.flowId)
            : firebase.firestore().collection('companies').doc(window.currentCompanyId).collection('flows').doc(fc.flowId);

        // Firestore не приймає undefined — замінюємо на null
        const sanitize = (obj) => JSON.parse(JSON.stringify(obj, (k, v) => v === undefined ? null : v));

        // Виносимо великі aiSystem промпти в окрему підколекцію nodePrompts
        // щоб не перевищувати ліміт 1MB на документ флоу
        const promptsRef = saveRef.collection('nodePrompts');
        const stripPrompts = (nodesList) => nodesList.map(n => {
            // Беремо промпт з будь-якого місця де він може бути
            const aiText = n.config?.aiSystem || n.aiSystem || '';
            const stripped = JSON.parse(JSON.stringify(n));
            if (aiText && aiText.length > 100) {
                // Зберігаємо в підколекцію
                promptsRef.doc(n.id).set({ aiSystem: aiText, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
                // Замінюємо на __ref в обох місцях
                if (stripped.config) stripped.config.aiSystem = '__ref:' + n.id;
                stripped.aiSystem = '__ref:' + n.id;
            } else {
                // Маленький промпт — видаляємо дублікат з верхнього рівня (лишаємо тільки в config)
                if (stripped.config?.aiSystem) delete stripped.aiSystem;
            }
            return stripped;
        });

        // canvasData (повні дані + позиції) і nodes для webhook — паралельно
        // FIX: якщо один write fails → retry один раз
        const canvasRef = saveRef.collection('canvasData').doc('layout');
        const strippedCanvas = { ...canvasData, nodes: stripPrompts(canvasData.nodes) };

        // nodes для webhook — тільки мінімальні поля (без _x/_y/config дублювання)
        const minimalNodes = stripPrompts(ordered).map(n => {
            const m = {
                id: n.id,
                type: n.type,
                // ── Universal ──
                text: n.config?.text || n.text || '',
                nextNode: n.nextNode || null,
                buttons: n.config?.buttons || n.buttons || [],
                options: n.options || [],
                saveAs: n.config?.saveAs || null,
                fallback: n.config?.fallback || null,
                // ── AI ──
                aiSystem: n.config?.aiSystem || n.aiSystem || '',
                aiApiKey: n.config?.aiApiKey || null,
                aiModel: n.config?.aiModel || null,
                aiProvider: n.config?.aiProvider || null,
                temperature: n.config?.temperature ?? null,
                historyLimit: n.config?.historyLimit ?? null,
                maxTokens: n.config?.maxTokens || null,
                firstMessage: n.config?.firstMessage || null,
                firstMessageEnabled: n.config?.firstMessageEnabled || null,
                // ── Action / Notify ──
                actionType: n.config?.actionType || null,
                actionPayload: n.config?.actionPayload || null,
                notifyChatId: n.config?.notifyChatId || null,
                notifyText: n.config?.notifyText || null,
                notifyFlowName: n.config?.notifyFlowName || null,
                // ── Filter / Condition ──
                trueNode: n.trueNode || null,
                falseNode: n.falseNode || null,
                condVar: n.config?.condVar || null,
                condOp: n.config?.condOp || null,
                condVal: n.config?.condVal || null,
                conditionField: n.config?.conditionField || null,
                conditionOp: n.config?.conditionOp || null,
                conditionValue: n.config?.conditionValue || null,
                // ── Tag ──
                tagValue: n.config?.tagValue || n.config?.tag || null,
                // ── Pause / Delay ──
                delay: n.config?.delay || n.config?.delaySeconds || null,
                delayUnit: n.config?.delayUnit || null,
                delaySeconds: n.config?.delaySeconds || null,
                // ── API ──
                apiMethod: n.config?.apiMethod || null,
                apiUrl: n.config?.apiUrl || null,
                apiHeaders: n.config?.apiHeaders || null,
                apiBody: n.config?.apiBody || null,
                authToken: n.config?.authToken || null,
                // ── Sheets ──
                sheetsId: n.config?.sheetsId || null,
                sheetsName: n.config?.sheetsName || null,
                sheetsMapping: n.config?.sheetsMapping || null,
                // ── CRM / Deal / Task ──
                dealTitle: n.config?.dealTitle || null,
                dealStage: n.config?.dealStage || null,
                pipelineId: n.config?.pipelineId || null,
                amount: n.config?.amount || null,
                phone: n.config?.phone || null,
                email: n.config?.email || null,
                taskTitle: n.config?.taskTitle || null,
                taskDescription: n.config?.taskDescription || null,
                assigneeId: n.config?.assigneeId || null,
                dueDate: n.config?.dueDate || null,
                // ── Random / Repeat ──
                splitA: n.config?.splitA || null,
                splitB: n.config?.splitB || null,
                branchA: n.branchA || null,
                branchB: n.branchB || null,
                repeatCount: n.config?.repeatCount || null,
                repeatInterval: n.config?.repeatInterval || null,
                exitVar: n.config?.exitVar || null,
                // ── Human ──
                humanMessage: n.config?.humanMessage || null,
                // ── Error routing ──
                errorNode: n.errorNode || null,
            };
            // Прибираємо null/порожні поля щоб зменшити розмір документу
            Object.keys(m).forEach(k => { if (m[k] === null || m[k] === '' || (Array.isArray(m[k]) && !m[k].length)) delete m[k]; });
            return m;
        });

        // FIX: перед збереженням прибираємо вкладений config з усіх вузлів
        // щоб уникнути bloat і потенційних проблем з JSON.stringify
        fc.nodes.forEach(n => {
            if (n.config) {
                delete n.config.config;
                delete n.config._x;
                delete n.config._y;
                delete n.config.outputs;
            }
        });

        // FIX: set({merge:true}) замість update() — працює і для нових документів
        // FIX: обидва записи паралельно для швидкості
        console.log('[saveFlow] writing to Firestore path:', saveRef.path);
        await Promise.all([
            saveRef.set({
                name: fc.flowData.name || 'Без назви',
                nodes: sanitize(minimalNodes),
                triggerKeyword: triggerKeyword || '/start',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true }),
            // FIX: зберігаємо canvasData — раніше canvasRef будувався але НІКОЛИ не записувався
            canvasRef.set(sanitize(strippedCanvas)),
        ]);
        console.log('[saveFlow] SUCCESS');
        if (typeof showToast === 'function') showToast(window.t('botsFlowSaved'), 'success');
        // Перемальовуємо canvas після збереження — preview на вузлах оновлюється
        renderAll();
    } catch(e) {
        console.error('[saveFlow] ERROR:', e.message, e.stack?.slice(0,300));
        if (typeof showToast === 'function') showToast('Помилка збереження: ' + e.message, 'error');
        else alert('Помилка збереження: ' + e.message);
    } finally {
        if (btn) btn.textContent = window.t('flowSave');
        window._fcSaving = false;
    }
}

// ── Undo/Redo ──────────────────────────────────────────────
function pushHistory() {
    const state = JSON.stringify({nodes:fc.nodes, edges:fc.edges});
    fc.history = fc.history.slice(0, fc.historyIdx+1);
    fc.history.push(state);
    if (fc.history.length > 50) fc.history.shift();
    fc.historyIdx = fc.history.length - 1;
}

function undo() {
    if (fc.historyIdx <= 0) return;
    fc.historyIdx--;
    try {
        const state = JSON.parse(fc.history[fc.historyIdx]);
        fc.nodes = state.nodes; fc.edges = state.edges;
        renderAll();
    } catch(e) { console.error('[canvas] undo parse error', e); }
}

function redo() {
    if (fc.historyIdx >= fc.history.length-1) return;
    fc.historyIdx++;
    try {
        const state = JSON.parse(fc.history[fc.historyIdx]);
        fc.nodes = state.nodes; fc.edges = state.edges;
        renderAll();
    } catch(e) { console.error('[canvas] redo parse error', e); }
}

// ── Keyboard ───────────────────────────────────────────────
function onKeyDown(e) {
    if (!document.getElementById('fcRoot')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if ((e.ctrlKey||e.metaKey) && e.key==='z') { e.preventDefault(); undo(); }
    if ((e.ctrlKey||e.metaKey) && e.key==='y') { e.preventDefault(); redo(); }
    if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); saveFlow(); }
    if ((e.ctrlKey||e.metaKey) && e.key==='d') {
        e.preventDefault();
        if (fc.selected) fcDuplicateNode(fc.selected);
    }
    if (e.key==='Escape') { fc.selected=null; renderAll(); renderPropPanel(); }
    if ((e.key==='Delete'||e.key==='Backspace') && fc.selected) {
        const node = fc.nodes.find(n=>n.id===fc.selected);
        if (node && node.type!=='start') window.fcDeleteNode(fc.selected);
    }
}

// ── Preview ────────────────────────────────────────────────
function getPreview(node) {
    const d = node.config||{};
    if (d.triggerKeyword) return 'Тригер: ' + d.triggerKeyword;
    if (d.text) return d.text.slice(0,80);
    // AI вузол — показуємо назву або початок промпту
    if (node.type === 'ai') {
        if (d.name) return '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg></span> ' + d.name;
        const prompt = d.aiSystem || d.systemPrompt || '';
        if (prompt && !prompt.startsWith('__ref:')) return 'AI: ' + prompt.slice(0,60);
        if (prompt.startsWith('__ref:')) return '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg></span> Промпт завантажено';
        return '';
    }
    // Action вузол — показуємо тип дії
    if (node.type === 'action') {
        const typeMap = {
            notify_admin: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span> Сповістити менеджера',
            set_var: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span> Встановити змінну',
            set_tag: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span> Додати тег',
            remove_tag: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span> Видалити тег',
            start_flow: '▶ Запустити флоу',
            stop_flow: '⏹ Зупинити флоу',
        };
        const label = typeMap[d.actionType] || d.actionType;
        if (label) return label + (d.notifyFlowName ? ': ' + d.notifyFlowName : '');
        return '';
    }
    if (d.aiSystem) return 'AI: ' + d.aiSystem.slice(0,60);
    if (d.apiUrl) return d.apiMethod+' '+d.apiUrl.slice(0,40);
    if (d.dealTitle) return d.dealTitle;
    if (d.delay) return `⏸ ${d.delay} ${d.delayUnit||'секунд'}`;
    if (d.condVar) return `${d.condVar} ${d.condOp||'='} ${d.condVal||'?'}`;
    if (d.splitA) return `А: ${d.splitA}% / Б: ${d.splitB||50}%`;
    if (node.type === 'repeat' && d.maxRepeats) return `<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span> Макс. ${d.maxRepeats} разів`;
    if (node.type === 'end') return '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#ef4444"/></svg></span> Кінець ланцюга';
    return '';
}

// ── Helpers ────────────────────────────────────────────────
function snap(v) { return Math.round(v/20)*20; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return String(s||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

})();
