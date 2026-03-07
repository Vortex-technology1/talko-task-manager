// ============================================================
// TALKO Flow Canvas Builder v2.0
// Visual drag&drop flow editor (SVG canvas, SendPulse style)
// Вбудовується в 81-bots-flows.js
// ============================================================

(function() {
'use strict';

// ── Canvas State ───────────────────────────────────────────
let fcNodes = [];       // [{id, type, x, y, data, outputs:[{id,label,targetId}]}]
let fcEdges = [];       // [{id, fromNode, fromPort, toNode}]
let fcDragging = null;  // {nodeId, startX, startY, origX, origY}
let fcConnecting = null;// {fromNode, fromPort, x, y}
let fcSelected = null;  // nodeId
let fcPan = {x: 0, y: 0};
let fcPanning = false;
let fcPanStart = null;
let fcFlowId = null;
let fcFlowData = null;
let fcScale = 1;
let fcSVG = null;
let fcCanvas = null;

const FC_NODE_WIDTH = 220;
const FC_NODE_MIN_H = 80;

const NODE_TYPES = {
    start:      { label: 'Старт',           color: '#22c55e', dark: '#16a34a', icon: 'play' },
    message:    { label: 'Повідомлення',    color: '#3b82f6', dark: '#2563eb', icon: 'message' },
    question:   { label: 'Питання',         color: '#8b5cf6', dark: '#7c3aed', icon: 'help' },
    buttons:    { label: 'Кнопки',          color: '#f59e0b', dark: '#d97706', icon: 'grid' },
    condition:  { label: 'Умова',           color: '#ef4444', dark: '#dc2626', icon: 'split' },
    ai:         { label: 'AI відповідь',    color: '#06b6d4', dark: '#0891b2', icon: 'bot' },
    delay:      { label: 'Затримка',        color: '#6b7280', dark: '#4b5563', icon: 'clock' },
    talko_task: { label: 'Задача TALKO',    color: '#22c55e', dark: '#16a34a', icon: 'check' },
    talko_deal: { label: 'Угода CRM',       color: '#10b981', dark: '#059669', icon: 'briefcase' },
    tag:        { label: 'Тег контакту',    color: '#f97316', dark: '#ea580c', icon: 'tag' },
    human:      { label: 'Менеджер',        color: '#ec4899', dark: '#db2777', icon: 'user' },
    end:        { label: 'Завершення',      color: '#64748b', dark: '#475569', icon: 'flag' },
};

const SVG_ICONS = {
    play:      '<polygon points="5,3 19,12 5,21" fill="currentColor"/>',
    message:   '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    help:      '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 9a3 3 0 1 1 6 0c0 2-3 3-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/>',
    grid:      '<rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity=".8"/><rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity=".8"/><rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity=".8"/><rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity=".5"/>',
    split:     '<path d="M16 3l4 4-4 4M8 21l-4-4 4-4M20 7H9a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    bot:       '<rect x="3" y="11" width="18" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="5" r="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    clock:     '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="12,6 12,12 16,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    check:     '<polyline points="20,6 9,17 4,12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" fill="none" stroke="currentColor" stroke-width="2"/>',
    tag:       '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/>',
    user:      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>',
    flag:      '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    trash:     '<polyline points="3,6 5,6 21,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke="currentColor" stroke-width="2"/>',
    plus:      '<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
    save:      '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="17,21 17,13 7,13 7,21" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="7,3 7,8 15,8" fill="none" stroke="currentColor" stroke-width="2"/>',
    zoomin:    '<circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    zoomout:   '<circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    fit:       '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    back:      '<polyline points="15,18 9,12 15,6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    edit:      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};

function icon(name, size=16, color='currentColor') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;color:${color}">${SVG_ICONS[name]||''}</svg>`;
}

// ── Open Canvas Editor ─────────────────────────────────────
window.openFlowCanvas = async function(flowId) {
    fcFlowId = flowId;
    const db = firebase.firestore();
    const doc = await db.collection('companies').doc(window.currentCompanyId)
        .collection('flows').doc(flowId).get();
    if (!doc.exists) return;
    fcFlowData = { id: doc.id, ...doc.data() };

    // Convert stored nodes → canvas nodes
    const stored = fcFlowData.nodes || [];
    fcNodes = [];
    fcEdges = [];

    if (stored.length === 0) {
        // Fresh flow — add start node
        fcNodes = [{ id: 'start_0', type: 'start', x: 80, y: 180,
            data: { label: 'Старт' }, outputs: [{ id: 'out_0', label: '', targetId: null }] }];
    } else {
        // Restore positions or auto-layout
        stored.forEach((n, i) => {
            const cfg = NODE_TYPES[n.type] || NODE_TYPES.message;
            fcNodes.push({
                id: n.id,
                type: n.type,
                x: n._x !== undefined ? n._x : 80 + i * 280,
                y: n._y !== undefined ? n._y : 180,
                data: n,
                outputs: buildOutputPorts(n),
            });
        });
        // Rebuild edges from nextNode / branches
        stored.forEach(n => {
            if (n.nextNode) {
                fcEdges.push({ id: `e_${n.id}_next`, fromNode: n.id, fromPort: 'out_0', toNode: n.nextNode });
            }
            if (n.options) {
                n.options.forEach((opt, i) => {
                    if (opt.nextNode) {
                        fcEdges.push({ id: `e_${n.id}_opt${i}`, fromNode: n.id, fromPort: `opt_${i}`, toNode: opt.nextNode });
                    }
                });
            }
        });
    }

    fcSelected = null;
    fcPan = { x: 0, y: 0 };
    fcScale = 1;

    renderCanvasOverlay();
};

function buildOutputPorts(node) {
    if (node.type === 'buttons' && node.options?.length) {
        return node.options.map((o, i) => ({ id: `opt_${i}`, label: o.label || `Варіант ${i+1}`, targetId: o.nextNode || null }));
    }
    if (node.type === 'condition') {
        return [
            { id: 'yes', label: 'Так', targetId: node.trueNode || null },
            { id: 'no',  label: 'Ні',  targetId: node.falseNode || null },
        ];
    }
    if (node.type === 'end') return [];
    return [{ id: 'out_0', label: '', targetId: node.nextNode || null }];
}

// ── Render Overlay ─────────────────────────────────────────
function renderCanvasOverlay() {
    document.getElementById('fcOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'fcOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10002;display:flex;flex-direction:column;background:#0f172a;';

    overlay.innerHTML = `
        <!-- Toolbar -->
        <div style="height:52px;background:#1e293b;border-bottom:1px solid #334155;display:flex;align-items:center;gap:0.5rem;padding:0 1rem;flex-shrink:0;">
            <button id="fcBtnBack" style="padding:0.35rem 0.65rem;background:#334155;border:none;border-radius:8px;color:white;cursor:pointer;display:flex;align-items:center;gap:0.35rem;font-size:0.82rem;">
                ${icon('back',16,'white')} Назад
            </button>
            <div style="width:1px;height:24px;background:#334155;margin:0 0.25rem;"></div>
            <div style="color:white;font-weight:700;font-size:0.9rem;">${escH(fcFlowData.name)}</div>
            <span style="background:#334155;color:#94a3b8;font-size:0.72rem;padding:2px 8px;border-radius:4px;">${fcFlowData.channel}</span>
            <div style="flex:1;"></div>
            <!-- Node palette -->
            <div style="display:flex;gap:0.3rem;flex-wrap:wrap;justify-content:center;">
                ${Object.entries(NODE_TYPES).filter(([k])=>k!=='start').map(([type, cfg]) => `
                    <button onclick="fcAddNode('${type}')" title="${cfg.label}"
                        style="padding:0.3rem 0.55rem;background:${cfg.color}22;border:1px solid ${cfg.color}44;border-radius:6px;color:${cfg.color};cursor:pointer;font-size:0.72rem;font-weight:600;display:flex;align-items:center;gap:0.25rem;white-space:nowrap;transition:all 0.15s;"
                        onmouseenter="this.style.background='${cfg.color}44'" onmouseleave="this.style.background='${cfg.color}22'">
                        ${icon(cfg.icon,13,cfg.color)} ${cfg.label}
                    </button>`).join('')}
            </div>
            <div style="flex:1;"></div>
            <!-- Zoom controls -->
            <div style="display:flex;gap:0.25rem;margin-right:0.5rem;">
                <button id="fcBtnZoomOut" style="padding:0.35rem;background:#334155;border:none;border-radius:6px;color:white;cursor:pointer;">${icon('zoomout',16,'white')}</button>
                <span id="fcZoomLabel" style="color:#94a3b8;font-size:0.78rem;min-width:38px;text-align:center;padding-top:0.35rem;">100%</span>
                <button id="fcBtnZoomIn" style="padding:0.35rem;background:#334155;border:none;border-radius:6px;color:white;cursor:pointer;">${icon('zoomin',16,'white')}</button>
                <button id="fcBtnFit" style="padding:0.35rem;background:#334155;border:none;border-radius:6px;color:white;cursor:pointer;">${icon('fit',16,'white')}</button>
            </div>
            <button id="fcBtnSave" style="padding:0.4rem 1rem;background:#22c55e;border:none;border-radius:8px;color:white;cursor:pointer;font-weight:700;font-size:0.85rem;display:flex;align-items:center;gap:0.35rem;">
                ${icon('save',16,'white')} Зберегти
            </button>
        </div>

        <!-- Main area -->
        <div style="flex:1;display:flex;min-height:0;overflow:hidden;">
            <!-- Canvas -->
            <div id="fcCanvasWrap" style="flex:1;position:relative;overflow:hidden;cursor:grab;">
                <svg id="fcSVG" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="fcGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="#1e293b"/>
                        </pattern>
                        <marker id="fcArrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L8,3 z" fill="#64748b"/>
                        </marker>
                        <marker id="fcArrowActive" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L8,3 z" fill="#22c55e"/>
                        </marker>
                    </defs>
                    <!-- Background dots -->
                    <rect width="10000" height="10000" x="-5000" y="-5000" fill="url(#fcGrid)"/>
                    <!-- Edges group -->
                    <g id="fcEdgesGroup"></g>
                    <!-- Connecting line -->
                    <path id="fcConnectingLine" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="6,3" style="display:none;pointer-events:none;"/>
                    <!-- Nodes group (HTML foreignObject per node) -->
                    <g id="fcNodesGroup"></g>
                </svg>
            </div>

            <!-- Right panel: node editor -->
            <div id="fcRightPanel" style="width:320px;flex-shrink:0;background:#1e293b;border-left:1px solid #334155;overflow-y:auto;display:flex;flex-direction:column;">
                <div id="fcNodeEditorInner" style="padding:1rem;flex:1;">
                    <div style="text-align:center;padding:3rem 1rem;color:#475569;">
                        <div style="margin-bottom:0.75rem;">${icon('edit',32,'#475569')}</div>
                        <div style="font-size:0.85rem;">Клікніть на вузол для редагування</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    fcSVG = document.getElementById('fcSVG');
    fcCanvas = document.getElementById('fcCanvasWrap');

    // Initial render
    renderAllNodes();
    renderAllEdges();
    fcFitView();

    // Events
    bindCanvasEvents();
    document.getElementById('fcBtnBack').onclick = () => { overlay.remove(); };
    document.getElementById('fcBtnSave').onclick = fcSave;
    document.getElementById('fcBtnZoomIn').onclick = () => fcZoom(0.15);
    document.getElementById('fcBtnZoomOut').onclick = () => fcZoom(-0.15);
    document.getElementById('fcBtnFit').onclick = fcFitView;
}

// ── Render All Nodes ───────────────────────────────────────
function renderAllNodes() {
    const g = document.getElementById('fcNodesGroup');
    if (!g) return;
    g.innerHTML = '';
    fcNodes.forEach(n => renderNode(n, g));
    applyTransform();
}

function renderNode(node, group) {
    const cfg = NODE_TYPES[node.type] || NODE_TYPES.message;
    const isSelected = fcSelected === node.id;
    const nodeH = getNodeHeight(node);

    const fo = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
    fo.setAttribute('x', node.x);
    fo.setAttribute('y', node.y);
    fo.setAttribute('width', FC_NODE_WIDTH);
    fo.setAttribute('height', nodeH);
    fo.setAttribute('data-nid', node.id);
    fo.style.cursor = 'pointer';
    fo.style.userSelect = 'none';

    const div = document.createElement('div');
    div.style.cssText = `width:${FC_NODE_WIDTH}px;font-family:system-ui,sans-serif;`;
    div.innerHTML = buildNodeHTML(node, cfg, isSelected, nodeH);
    fo.appendChild(div);

    // Drag
    fo.addEventListener('mousedown', (e) => {
        if (e.target.closest('[data-port]') || e.target.closest('[data-del]')) return;
        e.stopPropagation();
        fcSelected = node.id;
        renderNodeEditor(node.id);
        // re-render all to update selection
        renderAllNodes();
        renderAllEdges();

        const rect = fcCanvas.getBoundingClientRect();
        fcDragging = {
            nodeId: node.id,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            origX: node.x,
            origY: node.y,
        };
    });

    group.appendChild(fo);

    // Port click events (after DOM insertion)
    setTimeout(() => {
        div.querySelectorAll('[data-port]').forEach(portEl => {
            portEl.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                const portId = portEl.dataset.port;
                const portPos = getPortPos(node, portId, 'out');
                fcConnecting = { fromNode: node.id, fromPort: portId, x: portPos.x, y: portPos.y };
            });
        });
        div.querySelectorAll('[data-del]').forEach(delEl => {
            delEl.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (confirm('Видалити вузол?')) {
                    fcNodes = fcNodes.filter(n => n.id !== node.id);
                    fcEdges = fcEdges.filter(e => e.fromNode !== node.id && e.toNode !== node.id);
                    if (fcSelected === node.id) { fcSelected = null; renderNodeEditorEmpty(); }
                    renderAllNodes(); renderAllEdges();
                }
            });
        });
        // Input port click — disconnect incoming edge
        div.querySelectorAll('[data-inport]').forEach(portEl => {
            portEl.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
        });
    }, 0);
}

function buildNodeHTML(node, cfg, isSelected, nodeH) {
    const border = isSelected ? `2px solid ${cfg.color}` : '2px solid #334155';
    const shadow = isSelected ? `0 0 0 3px ${cfg.color}33, 0 4px 24px rgba(0,0,0,0.5)` : '0 4px 16px rgba(0,0,0,0.4)';
    const preview = getNodePreview(node);
    const hasOutPorts = node.outputs && node.outputs.length > 0;

    let portsHTML = '';
    if (hasOutPorts) {
        portsHTML = node.outputs.map((out, i) => {
            const isConnected = fcEdges.some(e => e.fromNode === node.id && e.fromPort === out.id);
            return `<div style="display:flex;align-items:center;justify-content:space-between;margin-top:${i===0?'0.5rem':'0.25rem'};">
                ${out.label ? `<span style="font-size:0.68rem;color:#94a3b8;flex:1;">${escH(out.label)}</span>` : '<span style="flex:1;"></span>'}
                <div data-port="${out.id}" title="З\'єднати" style="width:14px;height:14px;border-radius:50%;background:${isConnected?cfg.color:'#475569'};border:2px solid ${isConnected?cfg.dark:'#64748b'};cursor:crosshair;flex-shrink:0;transition:all 0.15s;"
                    onmouseenter="this.style.background='${cfg.color}';this.style.transform='scale(1.3)'" onmouseleave="this.style.background='${isConnected?cfg.color:'#475569'}';this.style.transform='scale(1)'">
                </div>
            </div>`;
        }).join('');
    }

    return `
    <div style="background:#1e293b;border-radius:12px;border:${border};box-shadow:${shadow};overflow:hidden;position:relative;">
        <!-- Input port (top center) -->
        ${node.type !== 'start' ? `
        <div data-inport="in" style="position:absolute;top:-7px;left:50%;transform:translateX(-50%);width:14px;height:14px;border-radius:50%;background:#334155;border:2px solid #64748b;z-index:1;cursor:default;"></div>
        ` : ''}
        <!-- Header -->
        <div style="background:${cfg.color};padding:0.5rem 0.75rem;display:flex;align-items:center;gap:0.4rem;position:relative;">
            <svg width="14" height="14" viewBox="0 0 24 24" style="flex-shrink:0;color:white;">${SVG_ICONS[cfg.icon]||''}</svg>
            <span style="font-size:0.75rem;font-weight:700;color:white;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${cfg.label}</span>
            ${node.type !== 'start' ? `<div data-del="1" style="width:18px;height:18px;background:rgba(0,0,0,0.25);border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;" title="Видалити" onmouseenter="this.style.background='rgba(239,68,68,0.8)'" onmouseleave="this.style.background='rgba(0,0,0,0.25)'">
                <svg width="10" height="10" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
            </div>` : ''}
        </div>
        <!-- Body -->
        <div style="padding:0.6rem 0.75rem;">
            ${preview ? `<div style="font-size:0.75rem;color:#94a3b8;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${escH(preview)}</div>` : `<div style="font-size:0.72rem;color:#475569;font-style:italic;">Натисніть для редагування</div>`}
            <!-- Output ports -->
            ${portsHTML}
        </div>
    </div>`;
}

function getNodeHeight(node) {
    const hasPreview = !!getNodePreview(node);
    const portCount = node.outputs?.length || 0;
    return FC_NODE_MIN_H + (hasPreview ? 20 : 0) + portCount * 22;
}

function getNodePreview(node) {
    const d = node.data;
    if (!d) return '';
    if (d.text) return d.text.slice(0, 80);
    if (d.label) return d.label.slice(0, 80);
    if (d.taskTitle) return d.taskTitle.slice(0, 60);
    if (d.dealTitle) return d.dealTitle.slice(0, 60);
    if (d.aiPrompt) return 'AI: ' + d.aiPrompt.slice(0, 60);
    if (d.delay) return `Затримка: ${d.delay}с`;
    return '';
}

// ── Render Edges ───────────────────────────────────────────
function renderAllEdges() {
    const g = document.getElementById('fcEdgesGroup');
    if (!g) return;
    g.innerHTML = '';
    fcEdges.forEach(edge => renderEdge(edge, g));
    applyTransform();
}

function renderEdge(edge, group) {
    const fromNode = fcNodes.find(n => n.id === edge.fromNode);
    const toNode   = fcNodes.find(n => n.id === edge.toNode);
    if (!fromNode || !toNode) return;

    const from = getPortPos(fromNode, edge.fromPort, 'out');
    const to   = getNodeInPos(toNode);

    const path = bezierPath(from.x, from.y, to.x, to.y);
    const isActive = fcSelected === edge.fromNode || fcSelected === edge.toNode;

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg','path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', isActive ? '#22c55e' : '#475569');
    pathEl.setAttribute('stroke-width', '2');
    pathEl.setAttribute('marker-end', isActive ? 'url(#fcArrowActive)' : 'url(#fcArrow)');
    pathEl.style.transition = 'stroke 0.2s';

    // Click to delete edge
    const hitPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    hitPath.setAttribute('d', path);
    hitPath.setAttribute('fill', 'none');
    hitPath.setAttribute('stroke', 'transparent');
    hitPath.setAttribute('stroke-width', '12');
    hitPath.style.cursor = 'pointer';
    hitPath.addEventListener('click', () => {
        if (confirm('Видалити з\'єднання?')) {
            fcEdges = fcEdges.filter(e => e.id !== edge.id);
            renderAllEdges();
        }
    });

    group.appendChild(pathEl);
    group.appendChild(hitPath);
}

function bezierPath(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const cp = Math.max(60, dx * 0.5);
    return `M${x1},${y1} C${x1+cp},${y1} ${x2-cp},${y2} ${x2},${y2}`;
}

function getPortPos(node, portId, dir) {
    const h = getNodeHeight(node);
    if (dir === 'in') return { x: node.x + FC_NODE_WIDTH/2, y: node.y };
    // Output ports: right side
    const idx = node.outputs?.findIndex(o => o.id === portId) ?? 0;
    const portCount = node.outputs?.length || 1;
    const bodyStart = 36; // header height
    const portAreaH = h - bodyStart;
    const spacing = portAreaH / (portCount + 1);
    return {
        x: node.x + FC_NODE_WIDTH,
        y: node.y + bodyStart + spacing * (idx + 1),
    };
}

function getNodeInPos(node) {
    return { x: node.x, y: node.y + getNodeHeight(node)/2 };
}

// ── Transform (pan + zoom) ─────────────────────────────────
function applyTransform() {
    const g1 = document.getElementById('fcEdgesGroup');
    const g2 = document.getElementById('fcNodesGroup');
    const bg = fcSVG?.querySelector('rect[fill="url(#fcGrid)"]');
    const transform = `translate(${fcPan.x},${fcPan.y}) scale(${fcScale})`;
    if (g1) g1.setAttribute('transform', transform);
    if (g2) g2.setAttribute('transform', transform);
    if (bg) bg.setAttribute('transform', `translate(${fcPan.x % 24 - 24},${fcPan.y % 24 - 24})`);
    const label = document.getElementById('fcZoomLabel');
    if (label) label.textContent = Math.round(fcScale*100) + '%';
}

function fcZoom(delta) {
    const rect = fcCanvas.getBoundingClientRect();
    const cx = rect.width/2, cy = rect.height/2;
    const oldScale = fcScale;
    fcScale = Math.max(0.3, Math.min(2, fcScale + delta));
    const ds = fcScale/oldScale - 1;
    fcPan.x -= (cx - fcPan.x) * ds;
    fcPan.y -= (cy - fcPan.y) * ds;
    applyTransform();
}

function fcFitView() {
    if (fcNodes.length === 0) return;
    const rect = fcCanvas.getBoundingClientRect();
    const minX = Math.min(...fcNodes.map(n=>n.x)) - 40;
    const minY = Math.min(...fcNodes.map(n=>n.y)) - 40;
    const maxX = Math.max(...fcNodes.map(n=>n.x+FC_NODE_WIDTH)) + 40;
    const maxY = Math.max(...fcNodes.map(n=>n.y+getNodeHeight(n))) + 40;
    const scaleX = rect.width / (maxX - minX);
    const scaleY = rect.height / (maxY - minY);
    fcScale = Math.min(scaleX, scaleY, 1.2);
    fcPan.x = -minX * fcScale + (rect.width - (maxX-minX)*fcScale)/2;
    fcPan.y = -minY * fcScale + (rect.height - (maxY-minY)*fcScale)/2;
    applyTransform();
}

// ── Canvas Mouse Events ────────────────────────────────────
function bindCanvasEvents() {
    fcCanvas.addEventListener('mousedown', onCanvasMouseDown);
    window.addEventListener('mousemove', onCanvasMouseMove);
    window.addEventListener('mouseup', onCanvasMouseUp);
    fcCanvas.addEventListener('wheel', onCanvasWheel, { passive: false });
}

function onCanvasMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && !e.target.closest('[data-nid]') && !e.target.closest('[data-port]'))) {
        if (!e.target.closest('[data-nid]')) {
            fcPanning = true;
            fcPanStart = { x: e.clientX - fcPan.x, y: e.clientY - fcPan.y };
            fcCanvas.style.cursor = 'grabbing';
            if (fcSelected) { fcSelected = null; renderAllNodes(); renderAllEdges(); renderNodeEditorEmpty(); }
        }
    }
}

function onCanvasMouseMove(e) {
    if (fcPanning && fcPanStart) {
        fcPan.x = e.clientX - fcPanStart.x;
        fcPan.y = e.clientY - fcPanStart.y;
        applyTransform();
        return;
    }
    if (fcDragging) {
        const dx = (e.clientX - fcDragging.startMouseX) / fcScale;
        const dy = (e.clientY - fcDragging.startMouseY) / fcScale;
        const node = fcNodes.find(n => n.id === fcDragging.nodeId);
        if (node) {
            node.x = Math.round((fcDragging.origX + dx) / 20) * 20;
            node.y = Math.round((fcDragging.origY + dy) / 20) * 20;
            renderAllNodes();
            renderAllEdges();
        }
        return;
    }
    if (fcConnecting) {
        // Convert mouse to SVG coords
        const rect = fcCanvas.getBoundingClientRect();
        const svgX = (e.clientX - rect.left - fcPan.x) / fcScale;
        const svgY = (e.clientY - rect.top - fcPan.y) / fcScale;
        const from = fcConnecting;
        const fromNode = fcNodes.find(n => n.id === from.fromNode);
        if (fromNode) {
            const fp = getPortPos(fromNode, from.fromPort, 'out');
            const line = document.getElementById('fcConnectingLine');
            if (line) {
                line.style.display = '';
                line.setAttribute('d', bezierPath(fp.x, fp.y, svgX, svgY));
                line.setAttribute('transform', `translate(${fcPan.x},${fcPan.y}) scale(${fcScale})`);
            }
        }
        return;
    }
}

function onCanvasMouseUp(e) {
    fcCanvas.style.cursor = 'grab';
    if (fcPanning) { fcPanning = false; fcPanStart = null; return; }
    if (fcDragging) { fcDragging = null; return; }
    if (fcConnecting) {
        const line = document.getElementById('fcConnectingLine');
        if (line) line.style.display = 'none';
        // Check if dropped on input port
        const rect = fcCanvas.getBoundingClientRect();
        const svgX = (e.clientX - rect.left - fcPan.x) / fcScale;
        const svgY = (e.clientY - rect.top - fcPan.y) / fcScale;
        const targetNode = fcNodes.find(n => {
            const inp = getNodeInPos(n);
            return n.id !== fcConnecting.fromNode && Math.abs(inp.x - svgX) < 30 && Math.abs(inp.y - svgY) < 30;
        });
        if (targetNode) {
            // Remove existing edge from same port
            fcEdges = fcEdges.filter(e => !(e.fromNode === fcConnecting.fromNode && e.fromPort === fcConnecting.fromPort));
            fcEdges.push({
                id: `e_${fcConnecting.fromNode}_${fcConnecting.fromPort}_${Date.now()}`,
                fromNode: fcConnecting.fromNode,
                fromPort: fcConnecting.fromPort,
                toNode: targetNode.id,
            });
            renderAllEdges();
        }
        fcConnecting = null;
    }
}

function onCanvasWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const rect = fcCanvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const oldScale = fcScale;
    fcScale = Math.max(0.3, Math.min(2, fcScale + delta));
    const ds = fcScale/oldScale - 1;
    fcPan.x -= (cx - fcPan.x) * ds;
    fcPan.y -= (cy - fcPan.y) * ds;
    applyTransform();
}

// ── Add Node ───────────────────────────────────────────────
window.fcAddNode = function(type) {
    const id = 'node_' + Date.now();
    const cfg = NODE_TYPES[type];
    const names = { message:'Повідомлення', question:'Питання', buttons:'Кнопки', condition:'Умова', ai:'AI відповідь', delay:'Затримка', talko_task:'Задача', talko_deal:'Угода', tag:'Тег', human:'Менеджер', end:'Завершення' };
    // Place in visible center
    const rect = fcCanvas?.getBoundingClientRect() || {width:800,height:600};
    const cx = (rect.width/2 - fcPan.x) / fcScale;
    const cy = (rect.height/2 - fcPan.y) / fcScale;
    const snap = v => Math.round(v/20)*20;
    const newNode = {
        id, type,
        x: snap(cx - FC_NODE_WIDTH/2),
        y: snap(cy - 40),
        data: { id, type, name: names[type]||type, text:'', options:[] },
        outputs: buildOutputPorts({ type, options: [] }),
    };
    fcNodes.push(newNode);
    fcSelected = id;
    renderAllNodes();
    renderAllEdges();
    renderNodeEditor(id);
};

// ── Node Editor Panel ──────────────────────────────────────
function renderNodeEditor(nodeId) {
    const node = fcNodes.find(n => n.id === nodeId);
    if (!node) return;
    const cfg = NODE_TYPES[node.type] || NODE_TYPES.message;
    const d = node.data || {};
    const panel = document.getElementById('fcNodeEditorInner');
    if (!panel) return;

    const fields = buildEditorFields(node, cfg, d);

    panel.innerHTML = `
        <div>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #334155;">
                <div style="width:32px;height:32px;border-radius:8px;background:${cfg.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="color:white;">${SVG_ICONS[cfg.icon]||''}</svg>
                </div>
                <div>
                    <div style="color:white;font-weight:700;font-size:0.9rem;">${cfg.label}</div>
                    <div style="color:#64748b;font-size:0.72rem;">${node.id}</div>
                </div>
            </div>
            ${fields}
            <button onclick="fcSaveNodeData('${node.id}')"
                style="width:100%;margin-top:1rem;padding:0.6rem;background:#22c55e;border:none;border-radius:8px;color:white;cursor:pointer;font-weight:700;font-size:0.85rem;">
                Застосувати
            </button>
        </div>`;
}

function buildEditorFields(node, cfg, d) {
    const inp = (id, val, ph) => `<input id="fc_${id}" value="${escAttr(val||'')}" placeholder="${ph||''}" style="width:100%;padding:0.5rem 0.65rem;background:#0f172a;border:1px solid #334155;border-radius:7px;color:white;font-size:0.82rem;box-sizing:border-box;margin-bottom:0.5rem;">`;
    const ta = (id, val, ph, rows=3) => `<textarea id="fc_${id}" placeholder="${ph||''}" rows="${rows}" style="width:100%;padding:0.5rem 0.65rem;background:#0f172a;border:1px solid #334155;border-radius:7px;color:white;font-size:0.82rem;box-sizing:border-box;resize:vertical;margin-bottom:0.5rem;">${escH(val||'')}</textarea>`;
    const lbl = (t) => `<div style="font-size:0.72rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.3rem;">${t}</div>`;

    switch(node.type) {
        case 'start':
            return `${lbl('Тригер (ключове слово)')}${inp('triggerKeyword', d.triggerKeyword||fcFlowData.triggerKeyword, '/start або слово')}`;
        case 'message':
            return `${lbl('Текст повідомлення')}${ta('text', d.text, 'Введіть текст...')}${lbl('Зберегти відповідь як')}${inp('saveAs', d.saveAs, 'змінна (необов\'язково)')}`;
        case 'question':
            return `${lbl('Питання')}${ta('text', d.text, 'Введіть питання...')}${lbl('Зберегти відповідь у змінну')}${inp('saveAs', d.saveAs, 'напр: phone, name, email')}`;
        case 'buttons': {
            const opts = d.options || [{ label: 'Варіант 1' }, { label: 'Варіант 2' }];
            return `${lbl('Текст перед кнопками')}${ta('text', d.text, 'Виберіть варіант...')}
                ${lbl('Кнопки')}
                <div id="fc_optsList">${opts.map((o,i)=>`
                    <div style="display:flex;gap:0.4rem;margin-bottom:0.35rem;">
                        <input id="fc_opt_${i}" value="${escAttr(o.label||'')}" placeholder="Кнопка ${i+1}"
                            style="flex:1;padding:0.45rem;background:#0f172a;border:1px solid #334155;border-radius:6px;color:white;font-size:0.8rem;">
                        <button onclick="fcRemoveOption(${i})" style="padding:0.4rem;background:#334155;border:none;border-radius:6px;color:#ef4444;cursor:pointer;font-size:0.8rem;">✕</button>
                    </div>`).join('')}
                </div>
                <button onclick="fcAddOption()" style="width:100%;padding:0.4rem;background:#334155;border:none;border-radius:7px;color:#22c55e;cursor:pointer;font-size:0.8rem;margin-top:0.25rem;">+ Додати кнопку</button>`;
        }
        case 'ai':
            return `${lbl('Системний промпт')}${ta('aiPrompt', d.aiPrompt, 'Ти — помічник компанії...', 5)}${lbl('Зберегти відповідь як')}${inp('saveAs', d.saveAs, 'ai_response')}${lbl('Запасна відповідь (якщо немає ключа)')}${ta('fallback', d.fallback, 'Вибачте, сталась помилка...')}`;
        case 'delay':
            return `${lbl('Затримка (секунди)')}${inp('delay', d.delay||5, '5')}`;
        case 'talko_task':
            return `${lbl('Назва завдання')}${inp('taskTitle', d.taskTitle, 'Зв\'язатись з клієнтом...')}${lbl('Відповідальний (email)')}${inp('assignee', d.assignee, 'manager@company.com')}`;
        case 'talko_deal':
            return `${lbl('Назва угоди')}${inp('dealTitle', d.dealTitle, 'Новий лід з бота')}${lbl('Сума')}${inp('amount', d.amount||0, '0')}`;
        case 'tag':
            return `${lbl('Тег')}${inp('tagName', d.tagName, 'новий-клієнт')}`;
        case 'condition':
            return `${lbl('Умова (змінна)')}${inp('condVar', d.condVar, 'name')}${lbl('Оператор')}
                <select id="fc_condOp" style="width:100%;padding:0.5rem;background:#0f172a;border:1px solid #334155;border-radius:7px;color:white;margin-bottom:0.5rem;">
                    ${['=','!=','contains','>','<'].map(op=>`<option value="${op}" ${d.condOp===op?'selected':''}>${op}</option>`).join('')}
                </select>
                ${lbl('Значення')}${inp('condVal', d.condVal, 'очікуване значення')}
                <div style="font-size:0.72rem;color:#64748b;margin-top:0.25rem;">Вихід "Так" → якщо умова виконується<br>Вихід "Ні" → якщо ні</div>`;
        case 'human':
            return `${lbl('Повідомлення менеджеру')}${ta('text', d.text, 'Клієнт очікує відповіді...')}`;
        case 'end':
            return `${lbl('Фінальне повідомлення (опц.)')}${ta('text', d.text, 'Дякуємо! Ми зв\'яжемось з вами.')}`;
        default:
            return `${lbl('Текст')}${ta('text', d.text, '')}`;
    }
}

window.fcSaveNodeData = function(nodeId) {
    const node = fcNodes.find(n => n.id === nodeId);
    if (!node) return;
    const get = id => document.getElementById(`fc_${id}`)?.value?.trim() || '';

    switch(node.type) {
        case 'start':    node.data.triggerKeyword = get('triggerKeyword'); break;
        case 'message':  node.data.text = get('text'); node.data.saveAs = get('saveAs')||null; break;
        case 'question': node.data.text = get('text'); node.data.saveAs = get('saveAs')||null; break;
        case 'buttons': {
            const opts = [];
            let i = 0;
            while(document.getElementById(`fc_opt_${i}`)) {
                const v = document.getElementById(`fc_opt_${i}`).value.trim();
                if (v) opts.push({ label: v, nextNode: (node.data.options?.[i]?.nextNode)||null });
                i++;
            }
            node.data.text = get('text');
            node.data.options = opts;
            node.outputs = opts.map((o,i2)=>({ id:`opt_${i2}`, label: o.label, targetId: o.nextNode||null }));
            break;
        }
        case 'ai':       node.data.aiPrompt = get('aiPrompt'); node.data.saveAs = get('saveAs')||null; node.data.fallback = get('fallback'); break;
        case 'delay':    node.data.delay = parseInt(get('delay'))||5; break;
        case 'talko_task': node.data.taskTitle = get('taskTitle'); node.data.assignee = get('assignee'); break;
        case 'talko_deal': node.data.dealTitle = get('dealTitle'); node.data.amount = parseFloat(get('amount'))||0; break;
        case 'tag':      node.data.tagName = get('tagName'); break;
        case 'condition': node.data.condVar = get('condVar'); node.data.condOp = get('condOp'); node.data.condVal = get('condVal'); break;
        case 'human':    node.data.text = get('text'); break;
        case 'end':      node.data.text = get('text'); break;
    }

    renderAllNodes();
    renderAllEdges();
    if (typeof showToast === 'function') showToast('Вузол збережено', 'success');
};

window.fcAddOption = function() {
    const node = fcNodes.find(n => n.id === fcSelected);
    if (!node) return;
    if (!node.data.options) node.data.options = [];
    node.data.options.push({ label: `Варіант ${node.data.options.length+1}` });
    renderNodeEditor(fcSelected);
};

window.fcRemoveOption = function(idx) {
    const node = fcNodes.find(n => n.id === fcSelected);
    if (!node?.data?.options) return;
    node.data.options.splice(idx, 1);
    renderNodeEditor(fcSelected);
};

function renderNodeEditorEmpty() {
    const panel = document.getElementById('fcNodeEditorInner');
    if (!panel) return;
    panel.innerHTML = `<div style="text-align:center;padding:3rem 1rem;color:#475569;"><div style="margin-bottom:0.75rem;">${icon('edit',32,'#475569')}</div><div style="font-size:0.85rem;">Клікніть на вузол для редагування</div></div>`;
}

// ── Save ───────────────────────────────────────────────────
window.fcSave = async function() {
    // Build edges map
    const edgeMap = {};
    fcEdges.forEach(e => {
        if (!edgeMap[e.fromNode]) edgeMap[e.fromNode] = {};
        edgeMap[e.fromNode][e.fromPort] = e.toNode;
    });

    // Build nodes array for Firestore (skip 'start' pseudo-node)
    const nodes = fcNodes
        .filter(n => n.type !== 'start')
        .map(n => {
            const d = { ...n.data };
            d._x = n.x;
            d._y = n.y;
            // Resolve next nodes
            const ports = edgeMap[n.id] || {};
            if (n.type === 'buttons' && d.options) {
                d.options = d.options.map((o, i) => ({ ...o, nextNode: ports[`opt_${i}`]||null }));
            } else if (n.type === 'condition') {
                d.trueNode = ports['yes']||null;
                d.falseNode = ports['no']||null;
            } else {
                d.nextNode = ports['out_0']||null;
            }
            return d;
        });

    // Start node: set trigger keyword
    const startNode = fcNodes.find(n=>n.type==='start');
    const triggerKeyword = startNode?.data?.triggerKeyword || fcFlowData.triggerKeyword || '/start';
    const firstRealNode = edgeMap[startNode?.id]?.['out_0'] || null;
    // Reorder so first node is the one connected to start
    const ordered = firstRealNode ? [
        ...nodes.filter(n=>n.id===firstRealNode),
        ...nodes.filter(n=>n.id!==firstRealNode)
    ] : nodes;

    try {
        await firebase.firestore().collection('companies').doc(window.currentCompanyId)
            .collection('flows').doc(fcFlowId).update({
                nodes: ordered,
                triggerKeyword,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        if (typeof showToast === 'function') showToast('Флоу збережено ✓', 'success');
    } catch(e) {
        alert('Помилка збереження: ' + e.message);
    }
};

// ── Helpers ────────────────────────────────────────────────
function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { return String(s||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

})();
