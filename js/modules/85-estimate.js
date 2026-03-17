// ============================================================
// MODULE 85 — ESTIMATE (Кошторис та Довідник норм матеріалів)
// ============================================================
// Firestore:
//   companies/{id}/estimate_norms/     — довідник норм
//   companies/{id}/project_estimates/  — кошториси проектів
// ============================================================
'use strict';

// ── SVG іконки ────────────────────────────────────────────────
const _estIco = {
    clipboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    ruler:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>`,
    package:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-8 4.5v9L12 21l8-4.5v-9L12 3z"/><path d="m12 12 8-4.5"/><path d="M12 12v9"/><path d="M12 12 4 7.5"/><path d="m16 5.5-8 4.5"/></svg>`,
    download:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    edit:      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
    save:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    check:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    warning:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m10.29 3.86-8.47 14.67A2 2 0 0 0 3.54 21h16.92a2 2 0 0 0 1.72-3l-8.47-14.67a2 2 0 0 0-3.42-.47Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    ok:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
    refresh:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    barChart:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    wrench:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    hardhat:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a2 2 0 0 1 4 0v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/></svg>`,
    hammer:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c.54-.78.51-1.87-.09-2.6l-3.56-4.44a2.12 2.12 0 0 0-2.97-.2L12 4 9 7l.17 1.03a2.12 2.12 0 0 0 1.46 1.46l.26.08 1.68 1.68.08.26c.35.92 1.08 1.6 2 1.86"/></svg>`,
    folder:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    info:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    plus:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    x:         `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    gear:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

// ── Глобальний стан ──────────────────────────────────────────
window._estimateNorms      = [];
window._projectEstimates   = [];
window._estimateUnsubs     = [];
window._estimateActiveTab  = 'list'; // 'list' | 'norms'

// ── Ініціалізація підписок ───────────────────────────────────
window.initEstimateModule = function() {
    if (!currentCompany) return;
    (window._estimateUnsubs || []).forEach(fn => { try { fn(); } catch(e) {} });
    window._estimateUnsubs = [];

    const cRef = db.collection('companies').doc(currentCompany);

    const unsubNorms = cRef.collection('estimate_norms')
        .where('deleted', '==', false)
        .orderBy('name')
        .onSnapshot(snap => {
            window._estimateNorms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (window._estimateActiveTab === 'norms') renderEstimateNormsView();
        }, err => {
            cRef.collection('estimate_norms')
                .where('deleted', '==', false)
                .get().then(snap2 => {
                    window._estimateNorms = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
                    if (window._estimateActiveTab === 'norms') renderEstimateNormsView();
                });
        });
    window._estimateUnsubs.push(unsubNorms);

    const unsubEst = cRef.collection('project_estimates')
        .where('deleted', '==', false)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
            window._projectEstimates = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (window._estimateActiveTab === 'list') renderEstimateListView();
        }, err => {
            cRef.collection('project_estimates')
                .where('deleted', '==', false)
                .get().then(snap2 => {
                    window._projectEstimates = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
                    if (window._estimateActiveTab === 'list') renderEstimateListView();
                });
        });
    window._estimateUnsubs.push(unsubEst);

    renderEstimateTab();
};

// ── Головний рендер вкладки ───────────────────────────────────
window.renderEstimateTab = function() {
    const container = document.getElementById('estimateContainer');
    if (!container) return;

    container.innerHTML = `
    <div style="max-width:1200px;margin:0 auto;padding:1rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1.25rem;">
        <div>
          <h2 style="margin:0;font-size:1.3rem;font-weight:700;color:#111827;display:flex;align-items:center;gap:0.5rem;">${_estIco.clipboard} Кошторис матеріалів</h2>
          <p style="margin:0.2rem 0 0;font-size:0.82rem;color:#6b7280;">Розрахунок потреби в матеріалах по проектах</p>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button onclick="estimateSwitchSubTab('list')" id="estTabList"
            style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 1rem;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:${window._estimateActiveTab==='list'?'#3b82f6':'white'};color:${window._estimateActiveTab==='list'?'white':'#374151'};">
            ${_estIco.clipboard} Кошториси
          </button>
          <button onclick="estimateSwitchSubTab('norms')" id="estTabNorms"
            style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 1rem;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;border:1.5px solid #e5e7eb;background:${window._estimateActiveTab==='norms'?'#3b82f6':'white'};color:${window._estimateActiveTab==='norms'?'white':'#374151'};">
            ${_estIco.ruler} Довідник норм
          </button>
        </div>
      </div>
      <div id="estimateSubContent"></div>
    </div>`;

    if (window._estimateActiveTab === 'list') renderEstimateListView();
    else renderEstimateNormsView();
};

window.estimateSwitchSubTab = function(tab) {
    window._estimateActiveTab = tab;
    renderEstimateTab();
};

// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 1 — СПИСОК КОШТОРИСІВ
// ══════════════════════════════════════════════════════════════
window.renderEstimateListView = function() {
    const sub = document.getElementById('estimateSubContent');
    if (!sub) return;

    const estimates = window._projectEstimates || [];
    const statusLabel = { draft:'Чернетка', approved:'Затверджено', in_progress:'В роботі', done:'Виконано' };
    const statusColor = { draft:'#f59e0b', approved:'#3b82f6', in_progress:'#8b5cf6', done:'#10b981' };

    const cards = estimates.length === 0
        ? `<div style="text-align:center;padding:3rem 1rem;color:#9ca3af;">
            <div style="display:flex;justify-content:center;margin-bottom:0.75rem;opacity:0.3;">${_estIco.clipboard.replace('16','48')}</div>
            <div style="font-size:1rem;font-weight:600;color:#6b7280;margin-bottom:0.4rem;">Кошторисів ще немає</div>
            <div style="font-size:0.83rem;">Натисніть "+ Новий кошторис" щоб почати</div>
           </div>`
        : estimates.map(e => {
            const status = statusLabel[e.status] || e.status;
            const color  = statusColor[e.status] || '#6b7280';
            const budget = e.totals?.totalMaterialsCost || 0;
            const deficit= e.totals?.totalDeficitCost || 0;
            const project= (window.projects||[]).find(p=>p.id===e.projectId);
            return `
            <div onclick="openEstimateModal('${esc(e.id)}')"
              style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:1rem 1.25rem;cursor:pointer;transition:box-shadow .15s;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;"
              onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
              <div style="flex:1;min-width:180px;">
                <div style="font-weight:600;font-size:0.95rem;color:#111827;">${esc(e.title||'Без назви')}</div>
                ${project?`<div style="font-size:0.78rem;color:#6b7280;margin-top:0.15rem;display:flex;align-items:center;gap:0.3rem;">${_estIco.folder} ${esc(project.title||project.name||'')}</div>`:''}
              </div>
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <span style="padding:0.25rem 0.65rem;border-radius:20px;font-size:0.75rem;font-weight:600;background:${color}18;color:${color};">${status}</span>
              </div>
              <div style="text-align:right;min-width:140px;">
                <div style="font-size:0.78rem;color:#6b7280;">Бюджет матеріалів</div>
                <div style="font-weight:700;color:#111827;">${formatMoney(budget)}</div>
                ${deficit>0
                    ? `<div style="font-size:0.75rem;color:#ef4444;font-weight:600;display:flex;align-items:center;gap:0.2rem;justify-content:flex-end;">${_estIco.warning} докупити: ${formatMoney(deficit)}</div>`
                    : `<div style="font-size:0.75rem;color:#10b981;display:flex;align-items:center;gap:0.2rem;justify-content:flex-end;">${_estIco.ok} матеріалів достатньо</div>`}
              </div>
              <div style="font-size:0.75rem;color:#9ca3af;">${e.createdAt?.toDate?(new Date(e.createdAt.toDate())).toLocaleDateString('uk-UA'):''}</div>
            </div>`;
        }).join('');

    sub.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
      <button onclick="openEstimateModal(null)"
        style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.1rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">
        ${_estIco.plus} Новий кошторис
      </button>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.6rem;">${cards}</div>`;
};

// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 2 — ДОВІДНИК НОРМ
// ══════════════════════════════════════════════════════════════
window.renderEstimateNormsView = function() {
    const sub = document.getElementById('estimateSubContent');
    if (!sub) return;

    const norms = window._estimateNorms || [];
    const categoryLabel = {
        foundation:'Фундамент', walls:'Стіни', roof:'Покрівля',
        floor:'Підлога/Стяжка', finishing:'Оздоблення', metal:'Металоконструкції',
        production:'Виробництво', repair:'Ремонт', custom:'Інше'
    };

    const rows = norms.length === 0
        ? `<div style="text-align:center;padding:3rem 1rem;color:#9ca3af;">
            <div style="display:flex;justify-content:center;margin-bottom:0.75rem;opacity:0.3;">${_estIco.ruler.replace('16','48')}</div>
            <div style="font-size:1rem;font-weight:600;color:#6b7280;margin-bottom:0.4rem;">Довідник норм порожній</div>
            <div style="font-size:0.83rem;">Завантажте стандартні норми або додайте власні</div>
           </div>`
        : `<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
            <thead>
              <tr style="border-bottom:2px solid #e5e7eb;">
                <th style="text-align:left;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">Назва</th>
                <th style="text-align:left;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">Категорія</th>
                <th style="text-align:center;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">Вх. одиниця</th>
                <th style="text-align:center;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">Матеріали</th>
                <th style="text-align:right;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">Дії</th>
              </tr>
            </thead>
            <tbody>
              ${norms.map(n=>`
              <tr style="border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:0.65rem 0.75rem;font-weight:500;color:#111827;">${esc(n.name)}</td>
                <td style="padding:0.65rem 0.75rem;color:#6b7280;">${categoryLabel[n.category]||n.category||'—'}</td>
                <td style="padding:0.65rem 0.75rem;text-align:center;"><span style="padding:0.2rem 0.5rem;background:#f0f9ff;color:#0ea5e9;border-radius:4px;font-weight:600;">${esc(n.inputUnit||'шт')}</span></td>
                <td style="padding:0.65rem 0.75rem;text-align:center;color:#6b7280;">${(n.materials||[]).length} поз.</td>
                <td style="padding:0.65rem 0.75rem;text-align:right;">
                  <button onclick="openNormModal('${esc(n.id)}')" style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.3rem 0.65rem;border:1px solid #e5e7eb;border-radius:6px;background:white;font-size:0.78rem;cursor:pointer;margin-right:4px;">${_estIco.edit} Редагувати</button>
                  <button onclick="deleteNorm('${esc(n.id)}')" style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.3rem 0.65rem;border:1px solid #fecaca;border-radius:6px;background:#fef2f2;color:#dc2626;font-size:0.78rem;cursor:pointer;">${_estIco.trash}</button>
                </td>
              </tr>`).join('')}
            </tbody>
           </table>`;

    sub.innerHTML = `
    <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">
      <button onclick="openLoadDefaultNormsModal()"
        style="display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;border:1.5px solid #3b82f6;color:#3b82f6;background:white;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;">
        ${_estIco.download} Завантажити стандартні
      </button>
      <button onclick="openNormModal(null)"
        style="display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1.1rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;">
        ${_estIco.plus} Додати норму
      </button>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">${rows}</div>`;
};

// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 3 — МОДАЛКА НОРМИ
// ══════════════════════════════════════════════════════════════
window.openNormModal = function(normId) {
    const existing = normId ? (window._estimateNorms||[]).find(n=>n.id===normId) : null;
    const norm = existing || {
        name:'', category:'foundation', inputUnit:'м²',
        hasExtraParam:false, extraParamLabel:'Товщина (м)',
        materials:[], niche:'construction'
    };

    const categories = [
        {v:'foundation',l:'Фундамент'},{v:'walls',l:'Стіни'},{v:'roof',l:'Покрівля'},
        {v:'floor',l:'Підлога/Стяжка'},{v:'finishing',l:'Оздоблення'},
        {v:'metal',l:'Металоконструкції'},{v:'production',l:'Виробництво'},
        {v:'repair',l:'Ремонт'},{v:'custom',l:'Інше'}
    ];
    const units = ['шт','м²','м³','кг','т','пог.м','л','комплект'];
    const niches = [{v:'construction',l:'Будівництво'},{v:'repair',l:'Ремонт'},{v:'production',l:'Виробництво'},{v:'other',l:'Інше'}];

    window._normEditMaterials = JSON.parse(JSON.stringify(norm.materials||[]));

    const materialsHtml = () => {
        const wh = window._wh?.items || [];
        return (window._normEditMaterials||[]).map((m,i)=>`
        <tr id="normMatRow_${i}">
          <td style="padding:0.4rem;"><input value="${esc(m.name||'')}" onchange="window._normEditMaterials[${i}].name=this.value" style="width:100%;padding:0.35rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.83rem;"/></td>
          <td style="padding:0.4rem;">
            <select onchange="window._normEditMaterials[${i}].unit=this.value" style="width:100%;padding:0.35rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.83rem;">
              ${units.map(u=>`<option value="${u}" ${m.unit===u?'selected':''}>${u}</option>`).join('')}
            </select>
          </td>
          <td style="padding:0.4rem;"><input type="number" step="0.001" min="0" value="${m.normPerUnit||0}" onchange="window._normEditMaterials[${i}].normPerUnit=parseFloat(this.value)||0" style="width:100%;padding:0.35rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.83rem;"/></td>
          <td style="padding:0.4rem;">
            <select onchange="window._normEditMaterials[${i}].warehouseItemId=this.value" style="width:100%;padding:0.35rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.83rem;">
              <option value="">— не прив'язано —</option>
              ${wh.map(w=>`<option value="${w.id}" ${m.warehouseItemId===w.id?'selected':''}>${esc(w.name)}</option>`).join('')}
            </select>
          </td>
          <td style="padding:0.4rem;text-align:center;">
            <button onclick="window._normEditMaterials.splice(${i},1);document.getElementById('normMaterialsBody').innerHTML=normMaterialsRowsHtml()" style="border:none;background:none;color:#ef4444;cursor:pointer;display:flex;align-items:center;">${_estIco.x}</button>
          </td>
        </tr>`).join('');
    };
    window.normMaterialsRowsHtml = materialsHtml;

    const html = `
    <div id="normModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;" onclick="if(event.target===this)closeNormModal()">
      <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;">${normId?'Редагувати норму':'Нова норма витрат'}</h3>
          <button onclick="closeNormModal()" style="background:none;border:none;cursor:pointer;color:#9ca3af;">${_estIco.x}</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
          <div style="grid-column:1/-1;">
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">Назва норми *</label>
            <input id="normName" value="${esc(norm.name||'')}" placeholder="напр. Фундаментна плита" style="width:100%;padding:0.55rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.9rem;box-sizing:border-box;"/>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">Категорія</label>
            <select id="normCategory" style="width:100%;padding:0.55rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
              ${categories.map(c=>`<option value="${c.v}" ${norm.category===c.v?'selected':''}>${c.l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">Ніша</label>
            <select id="normNiche" style="width:100%;padding:0.55rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
              ${niches.map(n=>`<option value="${n.v}" ${norm.niche===n.v?'selected':''}>${n.l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">Вхідна одиниця (об'єм роботи)</label>
            <select id="normInputUnit" style="width:100%;padding:0.55rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
              ${units.map(u=>`<option value="${u}" ${norm.inputUnit===u?'selected':''}>${u}</option>`).join('')}
            </select>
          </div>
          <div style="grid-column:1/-1;display:flex;align-items:center;gap:0.75rem;padding:0.65rem;background:#f0f9ff;border-radius:8px;">
            <input type="checkbox" id="normHasExtra" ${norm.hasExtraParam?'checked':''} style="width:16px;height:16px;cursor:pointer;"/>
            <label for="normHasExtra" style="font-size:0.85rem;color:#374151;cursor:pointer;">Додатковий параметр (напр. товщина)</label>
            <input id="normExtraLabel" value="${esc(norm.extraParamLabel||'Товщина (м)')}" placeholder="Назва параметру" style="flex:1;padding:0.4rem 0.6rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.83rem;"/>
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
            <label style="font-size:0.88rem;font-weight:700;color:#374151;">Матеріали та норми витрат</label>
            <button onclick="window._normEditMaterials.push({name:'',unit:'кг',normPerUnit:0,warehouseItemId:''});document.getElementById('normMaterialsBody').innerHTML=normMaterialsRowsHtml()"
              style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.75rem;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:0.8rem;cursor:pointer;">${_estIco.plus} Додати матеріал</button>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <thead>
                <tr style="border-bottom:2px solid #e5e7eb;">
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:120px;">Матеріал</th>
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:80px;">Одиниця</th>
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:100px;">Норма/1 вх.од.</th>
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:120px;">Позиція складу</th>
                  <th style="width:30px;"></th>
                </tr>
              </thead>
              <tbody id="normMaterialsBody">${materialsHtml()}</tbody>
            </table>
          </div>
          ${(window._normEditMaterials||[]).length===0?`<div style="text-align:center;padding:1rem;color:#9ca3af;font-size:0.83rem;">Додайте матеріали кнопкою вище</div>`:''}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:0.6rem;margin-top:1.25rem;">
          <button onclick="closeNormModal()" style="padding:0.55rem 1.25rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.88rem;cursor:pointer;">Скасувати</button>
          <button onclick="saveNorm('${normId||''}')" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.4rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.save} Зберегти</button>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
};

window.closeNormModal = function() {
    const m = document.getElementById('normModal');
    if (m) m.remove();
};

window.saveNorm = async function(normId) {
    const name = document.getElementById('normName')?.value?.trim();
    if (!name) { alert('Введіть назву норми'); return; }

    const payload = {
        name,
        category:       document.getElementById('normCategory')?.value || 'custom',
        niche:          document.getElementById('normNiche')?.value || 'construction',
        inputUnit:      document.getElementById('normInputUnit')?.value || 'м²',
        hasExtraParam:  document.getElementById('normHasExtra')?.checked || false,
        extraParamLabel:document.getElementById('normExtraLabel')?.value?.trim() || 'Товщина (м)',
        materials:      window._normEditMaterials || [],
        deleted:        false,
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const cRef = db.collection('companies').doc(currentCompany);
        if (normId) {
            await cRef.collection('estimate_norms').doc(normId).update(payload);
        } else {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            payload.createdBy = currentUser?.uid || '';
            payload.isDefault = false;
            await cRef.collection('estimate_norms').add(payload);
        }
        closeNormModal();
        if (typeof window.showToast === 'function') window.showToast('Норму збережено');
    } catch(e) {
        console.error('[saveNorm]', e);
        alert('Помилка збереження: ' + e.message);
    }
};

window.deleteNorm = async function(normId) {
    if (!confirm('Видалити норму? Це не вплине на існуючі кошториси.')) return;
    try {
        await db.collection('companies').doc(currentCompany)
            .collection('estimate_norms').doc(normId)
            .update({ deleted: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof window.showToast === 'function') window.showToast('Норму видалено');
    } catch(e) { alert('Помилка: ' + e.message); }
};

// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 4 — ЗАВАНТАЖЕННЯ СТАНДАРТНИХ НОРМ
// ══════════════════════════════════════════════════════════════
window.openLoadDefaultNormsModal = function() {
    const niches = [
        {v:'construction', l:'Будівництво',    desc:'Фундамент, стіни, перекриття, покрівля', ico: _estIco.hardhat},
        {v:'repair',       l:'Ремонт',          desc:'Штукатурка, плитка, шпаклівка, фарба',  ico: _estIco.wrench},
        {v:'metal',        l:'Металоконструкції',desc:'Метал, електроди, болти, ґрунтовка',   ico: _estIco.gear},
    ];
    const html = `
    <div id="loadNormsModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10001;display:flex;align-items:center;justify-content:center;padding:1rem;" onclick="if(event.target===this)document.getElementById('loadNormsModal').remove()">
      <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <h3 style="margin:0 0 1rem;font-size:1.05rem;font-weight:700;display:flex;align-items:center;gap:0.5rem;">${_estIco.package} Завантажити стандартні норми</h3>
        <p style="font-size:0.85rem;color:#6b7280;margin-bottom:1.25rem;">Оберіть нішу — система додасть типові норми витрат матеріалів:</p>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;">
          ${niches.map(n=>`
            <label style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e5e7eb'">
              <input type="radio" name="loadNiche" value="${n.v}" style="width:16px;height:16px;"/>
              <div style="color:#374151;">${n.ico}</div>
              <div>
                <div style="font-weight:600;font-size:0.9rem;">${n.l}</div>
                <div style="font-size:0.78rem;color:#6b7280;">${n.desc}</div>
              </div>
            </label>`).join('')}
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.6rem;">
          <button onclick="document.getElementById('loadNormsModal').remove()" style="padding:0.5rem 1.1rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.88rem;cursor:pointer;">Скасувати</button>
          <button onclick="loadDefaultNorms(document.querySelector('[name=loadNiche]:checked')?.value)" style="display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1.25rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.download} Завантажити</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.loadDefaultNorms = async function(niche) {
    if (!niche) { alert('Оберіть нішу'); return; }
    document.getElementById('loadNormsModal')?.remove();

    const defaults = {
        construction: [
            { name:'Фундаментна плита', category:'foundation', inputUnit:'м²', hasExtraParam:true, extraParamLabel:'Товщина (м)', niche:'construction',
              materials:[
                {name:'Бетон B25',unit:'м³',normPerUnit:1,warehouseItemId:''},
                {name:'Арматура А500',unit:'кг',normPerUnit:120,warehouseItemId:''},
                {name:'Опалубка',unit:'м²',normPerUnit:2.5,warehouseItemId:''},
              ]},
            { name:'Стіна цегляна (1.5 цегли)', category:'walls', inputUnit:'м²', hasExtraParam:false, extraParamLabel:'', niche:'construction',
              materials:[
                {name:'Цегла',unit:'шт',normPerUnit:105,warehouseItemId:''},
                {name:'Цемент М400',unit:'кг',normPerUnit:9,warehouseItemId:''},
                {name:'Пісок',unit:'м³',normPerUnit:0.025,warehouseItemId:''},
              ]},
            { name:'Перекриття монолітне', category:'floor', inputUnit:'м²', hasExtraParam:true, extraParamLabel:'Товщина (м)', niche:'construction',
              materials:[
                {name:'Бетон B25',unit:'м³',normPerUnit:1,warehouseItemId:''},
                {name:'Арматура А500',unit:'кг',normPerUnit:15,warehouseItemId:''},
              ]},
            { name:'Стяжка підлоги 50мм', category:'floor', inputUnit:'м²', hasExtraParam:false, extraParamLabel:'', niche:'construction',
              materials:[
                {name:'Цемент М400',unit:'кг',normPerUnit:12.5,warehouseItemId:''},
                {name:'Пісок',unit:'м³',normPerUnit:0.05,warehouseItemId:''},
              ]},
        ],
        repair: [
            { name:'Штукатурка стін', category:'finishing', inputUnit:'м²', hasExtraParam:false, extraParamLabel:'', niche:'repair',
              materials:[{name:'Штукатурна суміш',unit:'кг',normPerUnit:12,warehouseItemId:''}]},
            { name:'Укладка плитки (підлога)', category:'floor', inputUnit:'м²', hasExtraParam:false, extraParamLabel:'', niche:'repair',
              materials:[
                {name:'Плитка',unit:'м²',normPerUnit:1.07,warehouseItemId:''},
                {name:'Клей для плитки',unit:'кг',normPerUnit:5,warehouseItemId:''},
              ]},
            { name:'Шпаклівка стін', category:'finishing', inputUnit:'м²', hasExtraParam:false, extraParamLabel:'', niche:'repair',
              materials:[{name:'Шпаклівка',unit:'кг',normPerUnit:1.2,warehouseItemId:''}]},
            { name:'Фарбування (2 шари)', category:'finishing', inputUnit:'м²', hasExtraParam:false, extraParamLabel:'', niche:'repair',
              materials:[{name:'Фарба',unit:'л',normPerUnit:0.25,warehouseItemId:''}]},
        ],
        metal: [
            { name:'Металоконструкції зварні', category:'metal', inputUnit:'т', hasExtraParam:false, extraParamLabel:'', niche:'construction',
              materials:[
                {name:'Метал ст.3',unit:'кг',normPerUnit:1000,warehouseItemId:''},
                {name:'Електроди',unit:'кг',normPerUnit:15,warehouseItemId:''},
                {name:'Ґрунтовка',unit:'л',normPerUnit:2,warehouseItemId:''},
              ]},
        ],
    };

    const normsToAdd = defaults[niche] || [];
    if (normsToAdd.length === 0) { alert('Немає стандартних норм для цієї ніші'); return; }

    try {
        const cRef = db.collection('companies').doc(currentCompany);
        const batch = db.batch();
        const now = firebase.firestore.FieldValue.serverTimestamp();
        normsToAdd.forEach(n => {
            const ref = cRef.collection('estimate_norms').doc();
            batch.set(ref, { ...n, deleted:false, isDefault:true, createdAt:now, updatedAt:now, createdBy: currentUser?.uid||'' });
        });
        await batch.commit();
        if (typeof window.showToast === 'function') window.showToast(`Додано ${normsToAdd.length} стандартних норм`);
    } catch(e) {
        console.error('[loadDefaultNorms]', e);
        alert('Помилка: ' + e.message);
    }
};

// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 5 — МОДАЛКА КОШТОРИСУ
// ══════════════════════════════════════════════════════════════
window.openEstimateModal = function(estimateId) {
    const existing = estimateId ? (window._projectEstimates||[]).find(e=>e.id===estimateId) : null;

    window._estEditSections = existing ? JSON.parse(JSON.stringify(existing.sections||[])) : [];
    window._estEditId = estimateId || null;

    const norms    = window._estimateNorms || [];
    const projects = window.projects || [];
    const deals    = window.crmDeals || window._crmDeals || [];

    const renderSections = () => {
        if ((window._estEditSections||[]).length === 0) {
            return `<div style="text-align:center;padding:1.5rem;color:#9ca3af;border:2px dashed #e5e7eb;border-radius:10px;font-size:0.85rem;">
                Додайте тип роботи кнопкою нижче
            </div>`;
        }
        return (window._estEditSections||[]).map((sec,si) => {
            const mats = sec.calculatedMaterials || [];
            return `
            <div style="border:1.5px solid #e5e7eb;border-radius:10px;padding:1rem;margin-bottom:0.75rem;background:white;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <div>
                  <span style="font-weight:600;font-size:0.92rem;">${esc(sec.normName||'Секція')}</span>
                  <span style="margin-left:0.5rem;font-size:0.8rem;color:#6b7280;">${sec.inputValue||0} ${esc(sec.inputUnit||'')} ${sec.extraParam?'× '+sec.extraParam+' '+esc(sec.extraParamLabel||''):''}</span>
                </div>
                <div style="display:flex;gap:0.4rem;">
                  <button onclick="recalcSection(${si})" style="display:flex;align-items:center;gap:0.3rem;padding:0.25rem 0.6rem;border:1px solid #e5e7eb;border-radius:6px;background:white;font-size:0.78rem;cursor:pointer;">${_estIco.refresh} Перерахувати</button>
                  <button onclick="window._estEditSections.splice(${si},1);document.getElementById('estSectionsBody').innerHTML=renderEstSectionsHtml()" style="display:flex;align-items:center;padding:0.25rem 0.5rem;border:1px solid #fecaca;border-radius:6px;background:#fef2f2;color:#dc2626;font-size:0.78rem;cursor:pointer;">${_estIco.x}</button>
                </div>
              </div>
              ${mats.length>0?`
              <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                <thead><tr style="border-bottom:1px solid #f3f4f6;">
                  <th style="text-align:left;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">Матеріал</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">Потрібно</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">На складі</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">Дефіцит</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">Ціна/од</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">Сума</th>
                </tr></thead>
                <tbody>
                  ${mats.map(m=>`
                  <tr style="border-bottom:1px solid #f9fafb;">
                    <td style="padding:0.35rem 0.4rem;">${esc(m.name)}</td>
                    <td style="padding:0.35rem 0.4rem;text-align:right;font-weight:500;">${fmtNum(m.required)} ${esc(m.unit)}</td>
                    <td style="padding:0.35rem 0.4rem;text-align:right;color:#10b981;">${fmtNum(m.inStock)} ${esc(m.unit)}</td>
                    <td style="padding:0.35rem 0.4rem;text-align:right;${m.deficit>0?'color:#ef4444;font-weight:600;':''}">
                      ${m.deficit>0?`<span style="display:inline-flex;align-items:center;gap:0.2rem;">${_estIco.warning} ${fmtNum(m.deficit)} ${esc(m.unit)}</span>`:'—'}
                    </td>
                    <td style="padding:0.35rem 0.4rem;text-align:right;">
                      <input type="number" min="0" value="${m.pricePerUnit||0}" onchange="window._estEditSections[${si}].calculatedMaterials[${mats.indexOf(m)}].pricePerUnit=parseFloat(this.value)||0;recalcTotalsDisplay()" style="width:70px;padding:0.2rem 0.3rem;border:1px solid #e5e7eb;border-radius:4px;font-size:0.78rem;text-align:right;"/>
                    </td>
                    <td style="padding:0.35rem 0.4rem;text-align:right;font-weight:600;">${formatMoney((m.required||0)*(m.pricePerUnit||0))}</td>
                  </tr>`).join('')}
                </tbody>
              </table>`
              :`<div style="font-size:0.8rem;color:#9ca3af;text-align:center;padding:0.5rem;">Натисніть "Перерахувати" щоб побачити матеріали</div>`}
            </div>`;
        }).join('');
    };
    window.renderEstSectionsHtml = renderSections;

    const html = `
    <div id="estimateModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto;">
      <div style="background:#f9fafb;border-radius:16px;width:100%;max-width:800px;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="background:white;border-radius:16px 16px 0 0;padding:1.25rem 1.5rem;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:1;">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700;">${estimateId?'Редагувати кошторис':'Новий кошторис'}</h3>
          <button onclick="closeEstimateModal()" style="background:none;border:none;cursor:pointer;color:#9ca3af;">${_estIco.x}</button>
        </div>
        <div style="padding:1.25rem 1.5rem;">

          <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;margin-bottom:1rem;">
            <div style="font-weight:600;font-size:0.88rem;color:#374151;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;">${_estIco.clipboard} Загальна інформація</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;">
              <div style="grid-column:1/-1;">
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">Назва кошторису *</label>
                <input id="estTitle" value="${esc(existing?.title||'')}" placeholder="напр. Об'єкт вул. Шевченка 15" style="width:100%;padding:0.5rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;"/>
              </div>
              <div>
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">Прив'язати до проекту</label>
                <select id="estProjectId" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                  <option value="">— без проекту —</option>
                  ${projects.map(p=>`<option value="${p.id}" ${existing?.projectId===p.id?'selected':''}>${esc(p.title||p.name||p.id)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">Угода CRM (опціонально)</label>
                <select id="estDealId" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                  <option value="">— без угоди —</option>
                  ${deals.slice(0,50).map(d=>`<option value="${d.id}" ${existing?.dealId===d.id?'selected':''}>${esc(d.title||d.name||d.id)}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
              <div style="font-weight:600;font-size:0.88rem;color:#374151;display:flex;align-items:center;gap:0.4rem;">${_estIco.hammer} Типи робіт</div>
              <button onclick="openAddSectionModal()" style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.8rem;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;">${_estIco.plus} Додати тип роботи</button>
            </div>
            <div id="estSectionsBody">${renderSections()}</div>
          </div>

          <div id="estTotalsBlock" style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;margin-bottom:1rem;">
            ${renderEstTotals()}
          </div>

          <div style="display:flex;justify-content:flex-end;gap:0.6rem;flex-wrap:wrap;">
            <button onclick="closeEstimateModal()" style="padding:0.55rem 1.1rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.88rem;cursor:pointer;">Скасувати</button>
            <button onclick="saveEstimate('draft')" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.25rem;background:#f59e0b;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.save} Зберегти як чернетку</button>
            <button onclick="saveEstimate('approved')" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.25rem;background:#10b981;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.check} Затвердити</button>
          </div>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
};

window.closeEstimateModal = function() {
    document.getElementById('estimateModal')?.remove();
};

function renderEstTotals() {
    const sections = window._estEditSections || [];
    let totalCost = 0, totalDeficit = 0;
    sections.forEach(sec => {
        (sec.calculatedMaterials||[]).forEach(m => {
            totalCost    += (m.required||0) * (m.pricePerUnit||0);
            if (m.deficit > 0) totalDeficit += m.deficit * (m.pricePerUnit||0);
        });
    });
    return `
    <div style="font-weight:600;font-size:0.88rem;color:#374151;margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">${_estIco.barChart} Підсумок</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;">
      <div style="padding:0.75rem;background:#f0fdf4;border-radius:8px;text-align:center;">
        <div style="font-size:0.75rem;color:#6b7280;">Бюджет матеріалів</div>
        <div style="font-size:1.1rem;font-weight:700;color:#10b981;">${formatMoney(totalCost)}</div>
      </div>
      <div style="padding:0.75rem;background:${totalDeficit>0?'#fef2f2':'#f0fdf4'};border-radius:8px;text-align:center;">
        <div style="font-size:0.75rem;color:#6b7280;">Потрібно докупити</div>
        <div style="font-size:1.1rem;font-weight:700;color:${totalDeficit>0?'#ef4444':'#10b981'};display:flex;align-items:center;justify-content:center;gap:0.3rem;">
          ${totalDeficit>0?`${_estIco.warning} ${formatMoney(totalDeficit)}`:`${_estIco.ok} 0`}
        </div>
      </div>
      <div style="padding:0.75rem;background:#f0f9ff;border-radius:8px;text-align:center;">
        <div style="font-size:0.75rem;color:#6b7280;">Типів робіт</div>
        <div style="font-size:1.1rem;font-weight:700;color:#3b82f6;">${sections.length}</div>
      </div>
    </div>`;
}

window.recalcTotalsDisplay = function() {
    const block = document.getElementById('estTotalsBlock');
    if (block) block.innerHTML = renderEstTotals();
    document.getElementById('estSectionsBody').innerHTML = window.renderEstSectionsHtml?.() || '';
};

window.openAddSectionModal = function() {
    const norms = window._estimateNorms || [];
    if (norms.length === 0) {
        alert('Спочатку додайте норми витрат у Довіднику норм (вкладка "Довідник норм")');
        return;
    }
    const html = `
    <div id="addSectionModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10002;display:flex;align-items:center;justify-content:center;padding:1rem;" onclick="if(event.target===this)document.getElementById('addSectionModal').remove()">
      <div style="background:white;border-radius:14px;padding:1.25rem;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <h4 style="margin:0 0 1rem;font-size:1rem;font-weight:700;">Додати тип роботи</h4>
        <div style="margin-bottom:0.75rem;">
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">Тип роботи</label>
          <select id="addSecNormId" onchange="updateAddSectionExtra()" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
            <option value="">— оберіть норму —</option>
            ${norms.map(n=>`<option value="${n.id}">${esc(n.name)} (/${esc(n.inputUnit)})</option>`).join('')}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;margin-bottom:0.75rem;">
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">Об'єм <span id="addSecInputUnitLabel"></span></label>
            <input id="addSecValue" type="number" min="0" step="0.1" placeholder="100" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;"/>
          </div>
          <div id="addSecExtraBlock" style="display:none;">
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;" id="addSecExtraLabel">Товщина (м)</label>
            <input id="addSecExtra" type="number" min="0" step="0.01" placeholder="0.30" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;"/>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;">
          <button onclick="document.getElementById('addSectionModal').remove()" style="padding:0.5rem 1rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.85rem;cursor:pointer;">Скасувати</button>
          <button onclick="addEstimateSection()" style="display:flex;align-items:center;gap:0.3rem;padding:0.5rem 1.1rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;">${_estIco.plus} Додати та розрахувати</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.updateAddSectionExtra = function() {
    const normId = document.getElementById('addSecNormId')?.value;
    const norm = (window._estimateNorms||[]).find(n=>n.id===normId);
    if (!norm) return;
    document.getElementById('addSecInputUnitLabel').textContent = '(' + norm.inputUnit + ')';
    const extraBlock = document.getElementById('addSecExtraBlock');
    if (norm.hasExtraParam) {
        extraBlock.style.display = '';
        document.getElementById('addSecExtraLabel').textContent = norm.extraParamLabel || 'Параметр';
    } else {
        extraBlock.style.display = 'none';
    }
};

window.addEstimateSection = function() {
    const normId = document.getElementById('addSecNormId')?.value;
    const norm = (window._estimateNorms||[]).find(n=>n.id===normId);
    if (!normId || !norm) { alert('Оберіть тип роботи'); return; }

    const inputValue  = parseFloat(document.getElementById('addSecValue')?.value) || 0;
    const extraParam  = norm.hasExtraParam ? (parseFloat(document.getElementById('addSecExtra')?.value) || 1) : 1;

    if (inputValue <= 0) { alert('Введіть об\'єм роботи'); return; }

    const calculatedMaterials = (norm.materials||[]).map(m => {
        const required = +(inputValue * (norm.hasExtraParam ? extraParam : 1) * m.normPerUnit).toFixed(3);
        const stockData = m.warehouseItemId ? (window._wh?.stock?.[m.warehouseItemId] || {qty:0}) : {qty:0};
        const inStock   = stockData.qty || 0;
        const deficit   = Math.max(0, required - inStock);
        return { name:m.name, unit:m.unit, required, inStock, deficit, pricePerUnit:0, totalCost:0, warehouseItemId:m.warehouseItemId||'' };
    });

    window._estEditSections.push({
        sectionId:   'sec_' + Date.now(),
        normId,
        normName:    norm.name,
        inputValue,
        inputUnit:   norm.inputUnit,
        extraParam:  norm.hasExtraParam ? extraParam : null,
        extraParamLabel: norm.hasExtraParam ? norm.extraParamLabel : null,
        calculatedMaterials,
    });

    document.getElementById('addSectionModal')?.remove();
    document.getElementById('estSectionsBody').innerHTML = window.renderEstSectionsHtml?.() || '';
    window.recalcTotalsDisplay?.();
};

window.recalcSection = function(si) {
    const sec  = window._estEditSections[si];
    if (!sec) return;
    const norm = (window._estimateNorms||[]).find(n=>n.id===sec.normId);
    if (!norm) return;

    sec.calculatedMaterials = (norm.materials||[]).map(m => {
        const oldM    = (sec.calculatedMaterials||[]).find(om=>om.name===m.name) || {};
        const required= +(sec.inputValue * (sec.extraParam||1) * m.normPerUnit).toFixed(3);
        const stockData= m.warehouseItemId ? (window._wh?.stock?.[m.warehouseItemId] || {qty:0}) : {qty:0};
        const inStock  = stockData.qty || 0;
        const deficit  = Math.max(0, required - inStock);
        return { name:m.name, unit:m.unit, required, inStock, deficit, pricePerUnit:oldM.pricePerUnit||0, totalCost:required*(oldM.pricePerUnit||0), warehouseItemId:m.warehouseItemId||'' };
    });
    document.getElementById('estSectionsBody').innerHTML = window.renderEstSectionsHtml?.() || '';
    window.recalcTotalsDisplay?.();
};

window.saveEstimate = async function(status) {
    const title = document.getElementById('estTitle')?.value?.trim();
    if (!title) { alert('Введіть назву кошторису'); return; }

    const sections = window._estEditSections || [];
    let totalMaterialsCost = 0, totalDeficitCost = 0;
    sections.forEach(sec => {
        (sec.calculatedMaterials||[]).forEach(m => {
            totalMaterialsCost += (m.required||0) * (m.pricePerUnit||0);
            if (m.deficit > 0) totalDeficitCost += m.deficit * (m.pricePerUnit||0);
        });
    });

    const payload = {
        title,
        projectId:  document.getElementById('estProjectId')?.value || '',
        dealId:     document.getElementById('estDealId')?.value || '',
        status,
        sections,
        totals: { totalMaterialsCost, totalDeficitCost, currency: 'UAH' },
        deleted: false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const cRef = db.collection('companies').doc(currentCompany);
        if (window._estEditId) {
            await cRef.collection('project_estimates').doc(window._estEditId).update(payload);
        } else {
            payload.createdAt  = firebase.firestore.FieldValue.serverTimestamp();
            payload.createdBy  = currentUser?.uid || '';
            payload.approvedBy = status === 'approved' ? currentUser?.uid : '';
            await cRef.collection('project_estimates').add(payload);
        }

        if (status === 'approved' && payload.projectId) {
            cRef.collection('projects').doc(payload.projectId).update({
                estimateBudget: totalMaterialsCost,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            }).catch(()=>{});
        }

        closeEstimateModal();
        if (typeof window.showToast === 'function') {
            window.showToast(status === 'approved' ? 'Кошторис затверджено' : 'Кошторис збережено');
        }

        // Event Bus: затвердження
        if (status === 'approved' && typeof window.fireEventBus === 'function') {
            window.fireEventBus('estimate.approved', {
                estimateId: window._estEditId || 'new',
                title,
                projectId: payload.projectId,
                totalMaterialsCost,
            });
        }

        // Event Bus: дефіцит матеріалів
        if (totalDeficitCost > 0 && typeof window.fireEventBus === 'function') {
            window.fireEventBus('estimate.deficit_detected', {
                title,
                totalDeficitCost,
                sections: sections.map(s => ({
                    normName: s.normName,
                    deficitItems: (s.calculatedMaterials||[]).filter(m=>m.deficit>0).map(m=>({
                        name: m.name, deficit: m.deficit, unit: m.unit
                    }))
                }))
            });
        }

        // Finance: планова транзакція при затвердженні
        if (status === 'approved' && totalMaterialsCost > 0 && typeof db !== 'undefined') {
            const estId = window._estEditId || 'pending';
            db.collection('companies').doc(currentCompany)
                .collection('finance_transactions').add({
                    type: 'planned_expense',
                    category: 'materials',
                    amount: totalMaterialsCost,
                    description: `Матеріали: ${title}`,
                    estimateId: estId,
                    projectId: payload.projectId || '',
                    date: new Date().toISOString().split('T')[0],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: currentUser?.uid || '',
                }).catch(e => console.warn('[estimate finance]', e));
        }
    } catch(e) {
        console.error('[saveEstimate]', e);
        alert('Помилка збереження: ' + e.message);
    }
};

// ── Допоміжні функції ─────────────────────────────────────────
function fmtNum(n) {
    if (n == null) return '0';
    const num = parseFloat(n);
    return isNaN(num) ? '0' : (num % 1 === 0 ? num.toString() : num.toFixed(2));
}

function formatMoney(n) {
    if (!n) return '0 ₴';
    return new Intl.NumberFormat('uk-UA', { style:'currency', currency:'UAH', maximumFractionDigits:0 }).format(n);
}

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

window.showEstimateTab = window.renderEstimateTab;

// ══════════════════════════════════════════════════════════════
// ФАЗА 3 — SYNC З СКЛАДОМ + СПИСАННЯ
// ══════════════════════════════════════════════════════════════

// Оновити inStock з warehouse_items для всіх матеріалів кошторису
window.syncEstimateWithWarehouse = async function(estimateId) {
    const estimate = (window._projectEstimates||[]).find(e=>e.id===estimateId);
    if (!estimate) return;

    const updatedSections = (estimate.sections||[]).map(sec => {
        const updatedMats = (sec.calculatedMaterials||[]).map(m => {
            const stockData = m.warehouseItemId ? (window._wh?.stock?.[m.warehouseItemId] || {qty:0}) : {qty:0};
            const inStock = stockData.qty || 0;
            const deficit = Math.max(0, m.required - inStock);
            return { ...m, inStock, deficit };
        });
        return { ...sec, calculatedMaterials: updatedMats };
    });

    // Перераховуємо totals
    let totalMaterialsCost = 0, totalDeficitCost = 0;
    updatedSections.forEach(sec => {
        (sec.calculatedMaterials||[]).forEach(m => {
            totalMaterialsCost += (m.required||0) * (m.pricePerUnit||0);
            if (m.deficit > 0) totalDeficitCost += m.deficit * (m.pricePerUnit||0);
        });
    });

    try {
        await db.collection('companies').doc(currentCompany)
            .collection('project_estimates').doc(estimateId)
            .update({
                sections: updatedSections,
                totals: { totalMaterialsCost, totalDeficitCost, currency: 'UAH' },
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        if (typeof window.showToast === 'function') window.showToast('Залишки оновлено зі складу');
    } catch(e) {
        console.error('[syncEstimate]', e);
        alert('Помилка синхронізації: ' + e.message);
    }
};

// Списати матеріали зі складу по кошторису (викликає whDoOperation для кожного матеріалу)
window.writeOffEstimateMaterials = async function(estimateId, sectionId) {
    const estimate = (window._projectEstimates||[]).find(e=>e.id===estimateId);
    if (!estimate) return;
    if (!confirm('Списати матеріали зі складу по кошторису? Дія незворотна.')) return;

    const sections = sectionId
        ? (estimate.sections||[]).filter(s=>s.sectionId===sectionId)
        : (estimate.sections||[]);

    if (!sections.length) { alert('Немає секцій для списання'); return; }

    let writtenOff = 0;
    for (const sec of sections) {
        for (const m of (sec.calculatedMaterials||[])) {
            if (!m.warehouseItemId || m.required <= 0) continue;
            try {
                if (typeof window.whDoOperation === 'function') {
                    await window.whDoOperation({
                        type: 'OUT',
                        itemId: m.warehouseItemId,
                        qty: m.required,
                        note: `Кошторис: ${estimate.title} / ${sec.normName}`,
                        estimateId,
                        sectionId: sec.sectionId,
                        projectId: estimate.projectId || '',
                    });
                    writtenOff++;
                }
            } catch(e) {
                console.warn('[writeOff]', m.name, e.message);
            }
        }
    }

    // Event Bus
    if (typeof window.fireEventBus === 'function') {
        window.fireEventBus('estimate.materials_written_off', {
            estimateId,
            estimateTitle: estimate.title,
            projectId: estimate.projectId,
            sectionsCount: sections.length,
        });
    }

    // Finance: фактична транзакція
    let totalActual = 0;
    sections.forEach(sec => {
        (sec.calculatedMaterials||[]).forEach(m => {
            totalActual += (m.required||0) * (m.pricePerUnit||0);
        });
    });
    if (totalActual > 0 && typeof db !== 'undefined') {
        db.collection('companies').doc(currentCompany)
            .collection('finance_transactions').add({
                type: 'actual_expense',
                category: 'materials',
                amount: totalActual,
                description: `Списання матеріалів: ${estimate.title}`,
                estimateId,
                projectId: estimate.projectId || '',
                date: new Date().toISOString().split('T')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser?.uid || '',
            }).catch(e => console.warn('[writeOff finance]', e));
    }

    if (typeof window.showToast === 'function') window.showToast(`Списано ${writtenOff} позицій зі складу`);
    await syncEstimateWithWarehouse(estimateId);
};
