// ============================================================
// MODULE 85 — ESTIMATE (Кошторис та Довідник норм матеріалів)
// ============================================================
// Firestore:
//   companies/{id}/estimate_norms/     — довідник норм
//   companies/{id}/project_estimates/  — кошториси проектів
// ============================================================
'use strict';
  function _tg(ua, ru) { return window.currentLang === 'ru' ? ru : ua; }

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
    window._estimateActiveTab = 'list'; // завжди починаємо з кошторисів
    (window._estimateUnsubs || []).forEach(fn => { try { fn(); } catch(e) {} });
    window._estimateUnsubs = [];

    const cRef = db.collection('companies').doc(currentCompany);

    const unsubNorms = cRef.collection('estimate_norms')
        .orderBy('name')
        .onSnapshot(snap => {
            window._estimateNorms = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(d => d.deleted !== true);
            if (window._estimateActiveTab === 'norms') renderEstimateNormsView();
        }, err => {
            // Fallback без orderBy
            cRef.collection('estimate_norms')
                .get().then(snap2 => {
                    window._estimateNorms = snap2.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(d => d.deleted !== true);
                    if (window._estimateActiveTab === 'norms') renderEstimateNormsView();
                });
        });
    window._estimateUnsubs.push(unsubNorms);

    const unsubEst = cRef.collection('project_estimates')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
            window._projectEstimates = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(d => d.deleted !== true);
            if (window._estimateActiveTab === 'list') renderEstimateListView();
        }, err => {
            cRef.collection('project_estimates')
                .get().then(snap2 => {
                    window._projectEstimates = snap2.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(d => d.deleted !== true);
                    if (window._estimateActiveTab === 'list') renderEstimateListView();
                });
        });
    window._estimateUnsubs.push(unsubEst);

    renderEstimateTab();
};

// ── Головний рендер вкладки ───────────────────────────────────
window._estimateHowtoOpen = false; // panel toggle стан

window.renderEstimateTab = function() {
    const container = document.getElementById('estimateContainer');
    if (!container) return;
    const howtoOpen = window._estimateHowtoOpen || false;

    container.innerHTML = `
    <div style="padding:1rem 1.25rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          ${_estIco.clipboard}
          <div>
            <h2 style="margin:0;font-size:1.1rem;font-weight:700;color:#111827;">${_tg('Кошторис матеріалів','Смета материалов')}</h2>
            <p style="margin:0;font-size:0.78rem;color:#9ca3af;">${_tg('Розрахунок потреби в матеріалах по проектах','Расчёт потребности в материалах по проектам')}</p>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
          <div style="display:flex;background:#f3f4f6;border-radius:8px;padding:3px;">
            <button onclick="estimateSwitchSubTab('list')" id="estTabList"
              style="display:flex;align-items:center;gap:0.35rem;padding:0.35rem 0.85rem;border-radius:6px;font-size:0.82rem;font-weight:600;cursor:pointer;border:none;background:${window._estimateActiveTab==='list'?'white':'transparent'};color:${window._estimateActiveTab==='list'?'#111827':'#6b7280'};box-shadow:${window._estimateActiveTab==='list'?'0 1px 3px rgba(0,0,0,0.1)':'none'};">
              ${_estIco.clipboard} ${_tg('Кошториси','Сметы')}
            </button>
            <button onclick="estimateSwitchSubTab('norms')" id="estTabNorms"
              style="display:flex;align-items:center;gap:0.35rem;padding:0.35rem 0.85rem;border-radius:6px;font-size:0.82rem;font-weight:600;cursor:pointer;border:none;background:${window._estimateActiveTab==='norms'?'white':'transparent'};color:${window._estimateActiveTab==='norms'?'#111827':'#6b7280'};box-shadow:${window._estimateActiveTab==='norms'?'0 1px 3px rgba(0,0,0,0.1)':'none'};">
              ${_estIco.ruler} ${_tg('Довідник норм','Справочник норм')}
            </button>
          </div>
          <button onclick="window._estimateHowtoOpen=!window._estimateHowtoOpen;renderEstimateTab();" title="${_tg('Як це працює','Как это работает')}"
            style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.75rem;border-radius:8px;font-size:0.8rem;font-weight:500;cursor:pointer;border:1px solid ${howtoOpen?'#bae6fd':'#e5e7eb'};background:${howtoOpen?'#eff6ff':'white'};color:${howtoOpen?'#0369a1':'#6b7280'};">
            ${_estIco.info} ${_tg('Як це працює','Как это работает')}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition:transform 0.2s;transform:rotate(${howtoOpen?'180':'0'}deg)"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>
      <!-- Контент завжди зверху -->
      <div id="estimateSubContent"></div>
      <!-- Як це працює — accordion знизу -->
      ${howtoOpen ? `
        <div style="margin-top:1.5rem;border-top:1px solid #e5e7eb;padding-top:1.25rem;" id="estimateHowtoPanel"></div>
      ` : ''}
    </div>`;

    if (window._estimateActiveTab === 'list') renderEstimateListView();
    else if (window._estimateActiveTab === 'norms') renderEstimateNormsView();
    if (howtoOpen) renderEstimateHowtoView('estimateHowtoPanel');
};

window.estimateSwitchSubTab = function(tab) {
    window._estimateActiveTab = tab;
    renderEstimateTab();
};

// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 0 — ЯК ЦЕ ПРАЦЮЄ
// ══════════════════════════════════════════════════════════════
window.renderEstimateHowtoView = function(targetId) {
    const sub = document.getElementById(targetId || 'estimateSubContent');
    if (!sub) return;

    const s = (color, text) => `<span style="background:${color}18;color:${color};padding:1px 7px;border-radius:4px;font-size:0.78rem;font-weight:600;">${text}</span>`;
    const code = (text) => `<span style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-family:monospace;font-size:0.78rem;color:#374151;">${text}</span>`;
    const path = (text) => `<span style="background:#f0f9ff;border:1px solid #bae6fd;padding:2px 8px;border-radius:4px;font-size:0.78rem;color:#0369a1;font-weight:600;">${text}</span>`;

    sub.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">

      <!-- ЗАГОЛОВОК -->
      <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);border-radius:14px;padding:1.5rem;color:white;">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;">${_tg('Модуль Кошторис — що це і навіщо','Модуль Смета — что это и зачем')}</div>
        <div style="font-size:0.85rem;line-height:1.7;opacity:0.92;">
          Кошторис вирішує одну головну проблему: <b>власник не знає заздалегідь скільки матеріалів потрібно і скільки вони коштують.</b>
          Замовили не те або не стільки — об'єкт стоїть, клієнт злий, термінова доплата.
          Цей модуль дозволяє за 5 хвилин отримати точну специфікацію матеріалів для будь-якого об'єкту,
          побачити що є на складі, чого не вистачає і скільки треба докупити в гривнях.
        </div>
      </div>

      <!-- ПРОБЛЕМИ ЯКІ ВИРІШУЄ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
          ${_estIco.warning} ${_tg('Які проблеми вирішує','Какие проблемы решает')}
        </div>
        <div style="display:grid;gap:0.5rem;">
          ${[
            ['Купили не те або не стільки', 'Об\'єкт стоїть, термінова доплата за матеріали', 'Розрахунок до старту робіт — точна специфікація по кожному типу роботи'],
            ['Склад є але ніхто не знає що там', 'Купили матеріал який вже є на складі — гроші заморожені', 'Кошторис показує залишки зі складу і дефіцит в реальному часі'],
            ['Рахують у голові або в Excel', 'Версії розходяться, файл у одного чоловіка, він у відпустці', 'Одна система для всіх, оновлюється автоматично'],
            ['Не знають скільки коштують матеріали по об\'єкту', 'Не можуть порівняти план і факт, не видно де перевитрата', 'Кожен кошторис — це окремий фінансовий запис у системі'],
          ].map(([pain, impact, fix]) => `
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;">
            <div style="padding:0.65rem 0.85rem;background:#fef2f2;">
              <div style="font-size:0.7rem;font-weight:700;color:#dc2626;margin-bottom:0.25rem;">ПРОБЛЕМА</div>
              <div style="font-size:0.8rem;color:#7f1d1d;">${pain}</div>
            </div>
            <div style="padding:0.65rem 0.85rem;background:#fff7ed;">
              <div style="font-size:0.7rem;font-weight:700;color:#ea580c;margin-bottom:0.25rem;">${_tg('НАСЛІДОК','ПОСЛЕДСТВИЕ')}</div>
              <div style="font-size:0.8rem;color:#7c2d12;">${impact}</div>
            </div>
            <div style="padding:0.65rem 0.85rem;background:#f0fdf4;">
              <div style="font-size:0.7rem;font-weight:700;color:#16a34a;margin-bottom:0.25rem;">${_tg('РІШЕННЯ','РЕШЕНИЕ')}</div>
              <div style="font-size:0.8rem;color:#14532d;">${fix}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- ОСНОВНА ЛОГІКА -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
          ${_estIco.gear} ${_tg('Основна логіка — як система рахує','Основная логика — как система считает')}
        </div>
        <div style="font-size:0.85rem;color:#374151;line-height:1.7;margin-bottom:1rem;">
          Система побудована на <b>нормах витрат</b> — скільки матеріалу потрібно на одиницю роботи.
          Ти один раз вказуєш норму, а далі просто вводиш об'єм — система рахує все сама.
        </div>
        <div style="background:#f8fafc;border-radius:10px;padding:1rem;margin-bottom:1rem;border:1px solid #e2e8f0;">
          <div style="font-size:0.78rem;font-weight:700;color:#6b7280;margin-bottom:0.6rem;">ПРИКЛАД НОРМИ:</div>
          <div style="font-family:monospace;font-size:0.8rem;line-height:1.9;color:#1e293b;">
            Тип роботи: <b>Фундаментна плита</b><br>
            Вхідна одиниця: <b>м²</b> (площа фундаменту)<br>
            Доп. параметр: <b>товщина (м)</b><br>
            ──────────────────────────────<br>
            Бетон B25 &nbsp;&nbsp;&nbsp;&nbsp; → <b>0.30 м³</b> на 1 м² при товщині 1 м<br>
            Арматура А500 → <b>120 кг</b> &nbsp;на 1 м² при товщині 1 м<br>
            Опалубка &nbsp;&nbsp;&nbsp;&nbsp; → <b>2.50 м²</b> на 1 м²
          </div>
        </div>
        <div style="background:#f8fafc;border-radius:10px;padding:1rem;border:1px solid #e2e8f0;">
          <div style="font-size:0.78rem;font-weight:700;color:#6b7280;margin-bottom:0.6rem;">ФОРМУЛА РОЗРАХУНКУ:</div>
          <div style="font-family:monospace;font-size:0.8rem;line-height:2;color:#1e293b;">
            Потрібно = Площа × Товщина × Норма<br>
            ──────────────────────────────────────────────<br>
            Об'єкт: <b>200 м²</b>, товщина <b>0.35 м</b><br>
            ──────────────────────────────────────────────<br>
            Бетон: &nbsp;&nbsp; 200 × 0.35 × 0.30 = <b style="color:#2563eb;">21.0 м³</b><br>
            Арматура: 200 × 0.35 × 120 &nbsp;= <b style="color:#2563eb;">8 400 кг</b><br>
            Опалубка: 200 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; × 2.50 &nbsp;= <b style="color:#2563eb;">500 м²</b>
          </div>
        </div>
      </div>

      <!-- ЗВ'ЯЗКИ З ІНШИМИ МОДУЛЯМИ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
          ${_estIco.folder} ${_tg('Зв\'язки з іншими модулями','Связи с другими модулями')}
        </div>
        <div style="display:grid;gap:0.75rem;">

          <div style="border:1px solid #bae6fd;border-radius:10px;overflow:hidden;">
            <div style="background:#f0f9ff;padding:0.6rem 1rem;display:flex;align-items:center;gap:0.5rem;">
              <div style="width:8px;height:8px;border-radius:50%;background:#3b82f6;flex-shrink:0;"></div>
              <span style="font-weight:700;font-size:0.88rem;color:#0369a1;">Склад ${path('Бізнес → Склад')}</span>
            </div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              <b>Що відбувається:</b> кожен матеріал у нормі прив'язується до позиції на складі.
              При відкритті кошторису система автоматично дивиться актуальні залишки і показує дефіцит.<br>
              <b>Кнопка "Оновити залишки"</b> — якщо завезли матеріал поки кошторис відкритий, оновлює дані.<br>
              <b>Кнопка "Списати матеріали"</b> — після завершення робіт залишки на складі зменшуються автоматично,
              у журналі складу з'являється запис: звідки списано, який кошторис, який проект.
            </div>
          </div>

          <div style="border:1px solid #bbf7d0;border-radius:10px;overflow:hidden;">
            <div style="background:#f0fdf4;padding:0.6rem 1rem;display:flex;align-items:center;gap:0.5rem;">
              <div style="width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0;"></div>
              <span style="font-weight:700;font-size:0.88rem;color:#065f46;">Проекти ${path('Проекти → проект → вкладка Кошторис')}</span>
            </div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              При створенні кошторису вибираєш до якого проекту він належить.
              Після цього у вкладці "Кошторис" всередині проекту видно: бюджет матеріалів, дефіцит, статус кошторису.
              Власник бачить стан матеріалів по об'єкту не виходячи з картки проекту.
              При затвердженні — поле "Бюджет матеріалів" в проекті оновлюється автоматично.
            </div>
          </div>

          <div style="border:1px solid #fed7aa;border-radius:10px;overflow:hidden;">
            <div style="background:#fff7ed;padding:0.6rem 1rem;display:flex;align-items:center;gap:0.5rem;">
              <div style="width:8px;height:8px;border-radius:50%;background:#f97316;flex-shrink:0;"></div>
              <span style="font-weight:700;font-size:0.88rem;color:#c2410c;">Фінанси ${path('Бізнес → Фінанси → Транзакції')}</span>
            </div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              <b>Затвердив кошторис</b> → автоматично створюється <b>планова витрата</b> на суму всіх матеріалів.
              Ти ще нічого не купив — але вже бачиш заплановані витрати у фінансовому звіті. Можна планувати грошовий потік.<br><br>
              <b>Списав матеріали зі складу</b> → автоматично створюється <b>фактична витрата</b>.
              У звіті видно план vs факт — де перевитрата і чому.
            </div>
          </div>

          <div style="border:1px solid #ddd6fe;border-radius:10px;overflow:hidden;">
            <div style="background:#f5f3ff;padding:0.6rem 1rem;display:flex;align-items:center;gap:0.5rem;">
              <div style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;flex-shrink:0;"></div>
              <span style="font-weight:700;font-size:0.88rem;color:#5b21b6;">CRM ${path('Бізнес → CRM → картка клієнта')}</span>
            </div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              При створенні кошторису є поле "Угода CRM" — прив'язуєш до клієнта.
              Менеджер з продажу відкриває картку клієнта і бачить кошторис — може коректно озвучити вартість матеріалів.
            </div>
          </div>

        </div>
      </div>

      <!-- СХЕМА ЗВ'ЯЗКІВ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;">${_tg('Схема — як все пов\'язано','Схема — как всё связано')}</div>
        <div style="background:#f8fafc;border-radius:10px;padding:1.25rem;font-family:monospace;font-size:0.78rem;line-height:2;color:#1e293b;">
          ${path('Довідник норм')} &nbsp;← один раз для всього бізнесу<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br>
          ${path('Кошторис')} &nbsp;← окремо на кожен об'єкт<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br>
          ${path('Проект')} &nbsp;${path('Склад')} &nbsp;${path('Фінанси')} &nbsp;${path('CRM')}<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;залишки &nbsp;&nbsp;план/факт<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;дефіцит &nbsp;&nbsp;транзакції
        </div>
      </div>

      <!-- ПОКРОКОВЕ НАЛАШТУВАННЯ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
          ${_estIco.check} ${_tg('Покрокове налаштування з нуля','Пошаговая настройка с нуля')}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">

          ${[
            ['1','#3b82f6','Заповни склад (якщо ще не зроблено)',
              `${path('Бізнес → Склад → + Додати товар')}`,
              'Додай всі матеріали які використовуєш: бетон, арматура, цегла, цемент тощо. Для кожного вкажи: назву, одиницю виміру (м³, кг, шт), поточний залишок і мінімальний запас (система попередить коли менше).',
              'Без позицій на складі система не зможе показати дефіцит — буде рахувати ніби нічого немає.'],
            ['2','#8b5cf6','Заповни Довідник норм — один раз для всього бізнесу',
              `${path('Бізнес → Кошторис → Довідник норм')}`,
              '<b>Швидкий старт:</b> натисни "Завантажити стандартні" → вибери нішу (Будівництво / Ремонт / Металоконструкції) → норми заповняться автоматично.<br><br><b>Власні норми:</b> "+ Додати норму" → вкажи назву, вхідну одиницю, список матеріалів з нормативами.<br><br><b>ОБОВ\'ЯЗКОВО</b> для кожного матеріалу в нормі вибери "Позиція складу" — прив\'яжи до реальної позиції зі складу. Саме звідси береться інформація про залишки.',
              'Після завантаження стандартних норм — відредагуй нормативи під реальні цифри свого бізнесу. У кожного підрядника свої витрати.'],
            ['3','#f59e0b','Створи проект для об\'єкту',
              `${path('Проекти → + Новий проект')}`,
              'Вкажи назву об\'єкту (наприклад адресу або ім\'я клієнта). Проект потрібен щоб прив\'язати кошторис і бачити стан матеріалів прямо в картці об\'єкту.',
              'Якщо проект вже є — цей крок пропускаєш.'],
            ['4','#10b981','Створи кошторис для об\'єкту',
              `${path('Бізнес → Кошторис → Кошториси → + Новий кошторис')}`,
              '1. Введи назву кошторису (адреса або назва об\'єкту)<br>2. Вибери проект зі списку<br>3. Опціонально: вибери угоду CRM (клієнта)<br>4. Натисни "+ Додати тип роботи"<br>5. Вибери норму з довідника<br>6. Введи об\'єм (наприклад 150 м²)<br>7. Якщо є товщина — введи<br>8. Система автоматично рахує таблицю матеріалів<br>9. Введи ціни в колонку "Ціна/од"<br>10. Повтори кроки 4-9 для кожного типу роботи',
              'Можна додати скільки завгодно типів робіт в один кошторис. Підсумок по бюджету рахується по всіх секціях разом.'],
            ['5','#ef4444','Затверди кошторис',
              '',
              'Натисни "Затвердити кошторис".<br>Що відбувається автоматично:<br>• Статус змінюється на "Затверджено"<br>• У Фінансах з\'являється планова витрата на суму матеріалів<br>• У проекті оновлюється поле "Бюджет матеріалів"',
              'До затвердження кошторис — чернетка. Можна редагувати скільки завгодно. Після затвердження — фіксується у фінансах.'],
            ['6','#6b7280','В процесі роботи: оновлюй залишки',
              `${path('Кошторис → Оновити залишки')}`,
              'Якщо завезли матеріали на склад поки об\'єкт в роботі — натисни "Оновити залишки". Дефіцит перерахується з урахуванням нового надходження.',
              ''],
            ['7','#1d4ed8','Після завершення: спиши матеріали',
              `${path('Проекти → проект → Кошторис → Списати матеріали')}`,
              'Натисни "Списати матеріали".<br>Що відбувається автоматично:<br>• Залишки на складі зменшуються<br>• У журналі складу — запис з прив\'язкою до кошторису і проекту<br>• У Фінансах — фактична витрата<br>• Кошторис переходить у статус "Виконано"',
              ''],
          ].map(([num, color, title, pathHtml, desc, tip]) => `
          <div style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;">
            <div style="background:#f9fafb;padding:0.65rem 1rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid #f3f4f6;">
              <div style="width:26px;height:26px;background:${color};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.82rem;flex-shrink:0;">${num}</div>
              <div>
                <div style="font-weight:700;font-size:0.88rem;color:#111827;">${title}</div>
                ${pathHtml ? `<div style="margin-top:2px;">${pathHtml}</div>` : ''}
              </div>
            </div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">${desc}</div>
            ${tip ? `<div style="padding:0.5rem 1rem;background:#fffbeb;border-top:1px solid #fde68a;font-size:0.78rem;color:#92400e;display:flex;gap:0.4rem;align-items:flex-start;">${_estIco.warning} <span>${tip}</span></div>` : ''}
          </div>`).join('')}
        </div>
      </div>

      <!-- ТИПОВІ ПОМИЛКИ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
          ${_estIco.info} ${_tg('Типові помилки і як уникнути','Типичные ошибки и как избежать')}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${[
            ['Матеріал є на складі але дефіцит все одно показує', 'Матеріал не прив\'язаний до позиції складу в нормі', 'Довідник норм → відкрий норму → для кожного матеріалу вибери "Позиція складу"'],
            ['Кошторис не видно у вкладці Кошторис в проекті', 'При створенні кошторису не вибрали проект', 'Відкрий кошторис → редагуй → вибери проект → збережи'],
            ['Фінанси не оновились після затвердження', 'Натиснули "Зберегти" замість "Затвердити"', 'Відкрий кошторис → натисни "Затвердити кошторис" (зелена кнопка)'],
            ['Норми не відповідають реальним витратам', 'Стандартні норми — усереднені, у кожного бізнесу свої цифри', 'Після першого об\'єкту порівняй план і факт, відредагуй нормативи під свої реальні дані'],
            ['Списали матеріали але склад не змінився', 'Матеріал не прив\'язаний до складу або залишок був 0', 'Перевір прив\'язку в Довіднику норм і фактичний залишок на складі'],
          ].map(([problem, cause, fix]) => `
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;font-size:0.79rem;">
            <div style="padding:0.6rem 0.8rem;background:#fef2f2;border-right:1px solid #f3f4f6;">
              <div style="font-size:0.68rem;font-weight:700;color:#dc2626;margin-bottom:2px;">СИМПТОМ</div>
              <div style="color:#7f1d1d;">${problem}</div>
            </div>
            <div style="padding:0.6rem 0.8rem;background:#fff7ed;border-right:1px solid #f3f4f6;">
              <div style="font-size:0.68rem;font-weight:700;color:#ea580c;margin-bottom:2px;">ПРИЧИНА</div>
              <div style="color:#7c2d12;">${cause}</div>
            </div>
            <div style="padding:0.6rem 0.8rem;background:#f0fdf4;">
              <div style="font-size:0.68rem;font-weight:700;color:#16a34a;margin-bottom:2px;">${_tg('ДІЯ','ДЕЙСТВИЕ')}</div>
              <div style="color:#14532d;">${fix}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- РЕЗУЛЬТАТ -->
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#065f46;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem;">
          ${_estIco.check} ${_tg('Що отримуєш через місяць роботи','Что получаешь через месяц работы')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          ${[
            'Знаєш точну собівартість матеріалів по кожному об\'єкту',
            'Бачиш план vs факт — де перевитрата і чому',
            'Склад не пустіє несподівано — дефіцит видно заздалегідь',
            'Менеджери бачать кошторис в CRM — правильно озвучують вартість клієнту',
            'Фінансовий звіт формується автоматично без ручного введення',
            'Прораб не тримає все в голові — норми і розрахунки в системі',
          ].map(r => `
          <div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.5rem 0.75rem;background:white;border-radius:8px;font-size:0.82rem;color:#166534;">
            ${_estIco.ok} <span>${r}</span>
          </div>`).join('')}
        </div>
        <div style="margin-top:1rem;text-align:center;">
          <button onclick="estimateSwitchSubTab('norms')"
            style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.65rem 1.5rem;background:#10b981;color:white;border:none;border-radius:9px;font-size:0.9rem;font-weight:700;cursor:pointer;">
            ${_estIco.ruler} ${_tg('Почати — заповнити Довідник норм','Начать — заполнить Справочник норм')}
          </button>
        </div>
      </div>

    </div>`; // end sub.innerHTML
};

// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 1 — СПИСОК КОШТОРИСІВ
// ══════════════════════════════════════════════════════════════
window.renderEstimateListView = function() {
    const sub = document.getElementById('estimateSubContent');
    if (!sub) return;

    const estimates = window._projectEstimates || [];
    const statusLabel = { draft:_tg('Чернетка','Черновик'), approved:_tg('Затверджено','Утверждено'), in_progress:_tg('В роботі','В работе'), done:_tg('Виконано','Выполнено') };
    const statusColor = { draft:'#f59e0b', approved:'#3b82f6', in_progress:'#8b5cf6', done:'#10b981' };

    const cards = estimates.length === 0
        ? `<div style="text-align:center;padding:3rem 1rem;color:#9ca3af;">
            <div style="display:flex;justify-content:center;margin-bottom:0.75rem;opacity:0.3;">${_estIco.clipboard.replace('16','48')}</div>
            <div style="font-size:1rem;font-weight:600;color:#6b7280;margin-bottom:0.4rem;">${_tg('Кошторисів ще немає','Смет ещё нет')}</div>
            <div style="font-size:0.83rem;">${_tg('Натисніть "+ Новий кошторис" щоб почати','Нажмите "+ Новая смета" чтобы начать')}</div>
           </div>`
        : estimates.map(e => {
            const status = statusLabel[e.status] || e.status;
            const color  = statusColor[e.status] || '#6b7280';
            const budget = e.totals?.totalMaterialsCost || 0;
            const deficit= e.totals?.totalDeficitCost || 0;
            const project= (window.projects||[]).find(p=>p.id===e.projectId);
            return `
            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;"
              onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
              <div onclick="openEstimateModal('${esc(e.id)}')" style="flex:1;min-width:180px;cursor:pointer;">
                <div style="font-weight:600;font-size:0.95rem;color:#111827;">${esc(e.title||'Без назви')}</div>
                ${project?`<div style="font-size:0.78rem;color:#6b7280;margin-top:0.15rem;display:flex;align-items:center;gap:0.3rem;">${_estIco.folder} ${esc(project.title||project.name||'')}</div>`:''}
              </div>
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <span style="padding:0.25rem 0.65rem;border-radius:20px;font-size:0.75rem;font-weight:600;background:${color}18;color:${color};">${status}</span>
              </div>
              <div style="text-align:right;min-width:140px;">
                <div style="font-size:0.78rem;color:#6b7280;">${_tg('Бюджет матеріалів','Бюджет материалов')}</div>
                <div style="font-weight:700;color:#111827;">${formatMoney(budget)}</div>
                ${deficit>0
                    ? `<div style="font-size:0.75rem;color:#ef4444;font-weight:600;display:flex;align-items:center;gap:0.2rem;justify-content:flex-end;">${_estIco.warning} докупити: ${formatMoney(deficit)}</div>`
                    : `<div style="font-size:0.75rem;color:#10b981;display:flex;align-items:center;gap:0.2rem;justify-content:flex-end;">${_estIco.ok} матеріалів достатньо</div>`}
              </div>
              <div style="display:flex;gap:0.4rem;align-items:center;">
                <button onclick="exportEstimatePDF('${esc(e.id)}')" title="Експорт PDF"
                    style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.65rem;border:1px solid #e5e7eb;border-radius:6px;background:white;font-size:0.78rem;cursor:pointer;">
                    ${_estIco.pdf||'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'} PDF
                </button>
                <div style="font-size:0.75rem;color:#9ca3af;">${e.createdAt?.toDate?(new Date(e.createdAt.toDate())).toLocaleDateString('uk-UA'):''}</div>
              </div>
            </div>`;
        }).join('');

    const howtoOpen = window._estimateHowtoOpen || false;

    sub.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
      <button onclick="openEstimateModal(null)"
        style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.1rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">
        ${_estIco.plus} ${_tg('Новий кошторис','Новая смета')}
      </button>
    </div>

    <!-- Список кошторисів — завжди зверху -->
    <div style="display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.5rem;">${cards}</div>

    <!-- Як це працює — collapsible знизу -->
    <div style="border-top:1px solid #e5e7eb;padding-top:1rem;">
      <button onclick="window._estimateHowtoOpen=!window._estimateHowtoOpen;renderEstimateListView();"
        style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.85rem;border:1px solid ${howtoOpen?'#bae6fd':'#e5e7eb'};border-radius:10px;background:${howtoOpen?'#eff6ff':'#f9fafb'};color:${howtoOpen?'#0369a1':'#6b7280'};font-size:0.83rem;font-weight:600;cursor:pointer;width:100%;justify-content:space-between;">
        <span style="display:flex;align-items:center;gap:0.4rem;">${_estIco.info} ${_tg('Як це працює','Как это работает')} — детальна логіка</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform:rotate(${howtoOpen?'180':'0'}deg);transition:transform 0.2s;flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      ${howtoOpen ? `<div id="estimateInlineHowto" style="margin-top:1rem;"></div>` : ''}
    </div>`;
    if (howtoOpen) renderEstimateHowtoView('estimateInlineHowto');
};


// ══════════════════════════════════════════════════════════════
// РОЗДІЛ 2 — ДОВІДНИК НОРМ
// ══════════════════════════════════════════════════════════════
window.renderEstimateNormsView = function() {
    const sub = document.getElementById('estimateSubContent');
    if (!sub) return;

    const norms = window._estimateNorms || [];
    const categoryLabel = {
        foundation:_tg('Фундамент','Фундамент'), walls:_tg('Стіни','Стены'), roof:_tg('Покрівля','Кровля'),
        floor:_tg('Підлога/Стяжка','Пол/Стяжка'), finishing:_tg('Оздоблення','Отделка'), metal:_tg('Металоконструкції','Металлоконструкции'),
        production:_tg('Виробництво','Производство'), repair:_tg('Ремонт','Ремонт'), custom:_tg('Інше','Другое')
    };

    const rows = norms.length === 0
        ? `<div style="text-align:center;padding:3rem 1rem;color:#9ca3af;">
            <div style="display:flex;justify-content:center;margin-bottom:0.75rem;opacity:0.3;">${_estIco.ruler.replace('16','48')}</div>
            <div style="font-size:1rem;font-weight:600;color:#6b7280;margin-bottom:0.4rem;">${_tg('Довідник норм порожній','Справочник норм пуст')}</div>
            <div style="font-size:0.83rem;">${_tg('Завантажте стандартні норми або додайте власні','Загрузите стандартные нормы или добавьте свои')}</div>
           </div>`
        : `<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
            <thead>
              <tr style="border-bottom:2px solid #e5e7eb;">
                <th style="text-align:left;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">${_tg('Назва','Название')}</th>
                <th style="text-align:left;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">${_tg('Категорія','Категория')}</th>
                <th style="text-align:center;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">${_tg('Вх. одиниця','Вх. единица')}</th>
                <th style="text-align:center;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">${_tg('Матеріали','Материалы')}</th>
                <th style="text-align:right;padding:0.6rem 0.75rem;color:#6b7280;font-weight:600;">${_tg('Дії','Действия')}</th>
              </tr>
            </thead>
            <tbody>
              ${norms.map(n=>`
              <tr style="border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:0.65rem 0.75rem;font-weight:500;color:#3b82f6;cursor:pointer;" onclick="openNormModal('${esc(n.id)}')" title="Відкрити норму">${esc(n.name)}</td>
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
        ${_estIco.download} ${_tg('Завантажити стандартні','Загрузить стандартные')}
      </button>
      <button onclick="openNormModal(null)"
        style="display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1.1rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;">
        ${_estIco.plus} ${_tg('Додати норму','Добавить норму')}
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
    <div id="normModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:4rem 1rem 1rem;overflow-y:auto;" onclick="if(event.target===this)closeNormModal()">
      <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:700px;max-height:calc(100vh - 5rem);overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;">${_tg(normId?'Редагувати норму':'Нова норма витрат', normId?'Редактировать норму':'Новая норма расходов')}</h3>
          <button onclick="closeNormModal()" style="background:none;border:none;cursor:pointer;color:#9ca3af;">${_estIco.x}</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
          <div style="grid-column:1/-1;">
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">${_tg('Назва норми *','Название нормы *')}</label>
            <input id="normName" value="${esc(norm.name||'')}" placeholder="напр. Фундаментна плита" style="width:100%;padding:0.55rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.9rem;box-sizing:border-box;"/>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">${_tg('Категорія','Категория')}</label>
            <select id="normCategory" style="width:100%;padding:0.55rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
              ${categories.map(c=>`<option value="${c.v}" ${norm.category===c.v?'selected':''}>${c.l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">${_tg('Ніша','Ниша')}</label>
            <select id="normNiche" style="width:100%;padding:0.55rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
              ${niches.map(n=>`<option value="${n.v}" ${norm.niche===n.v?'selected':''}>${n.l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">${_tg('Вхідна одиниця (обʼєм','Входная единица (объём')} роботи)</label>
            <select id="normInputUnit" style="width:100%;padding:0.55rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
              ${units.map(u=>`<option value="${u}" ${norm.inputUnit===u?'selected':''}>${u}</option>`).join('')}
            </select>
          </div>
          <div style="grid-column:1/-1;display:flex;align-items:center;gap:0.75rem;padding:0.65rem;background:#f0f9ff;border-radius:8px;">
            <input type="checkbox" id="normHasExtra" ${norm.hasExtraParam?'checked':''} style="width:16px;height:16px;cursor:pointer;"/>
            <label for="normHasExtra" style="font-size:0.85rem;color:#374151;cursor:pointer;">${_tg('Додатковий параметр (напр. товщина)','Доп. параметр (напр. толщина)')}</label>
            <input id="normExtraLabel" value="${esc(norm.extraParamLabel||'Товщина (м)')}" placeholder="Назва параметру" style="flex:1;padding:0.4rem 0.6rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.83rem;"/>
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
            <label style="font-size:0.88rem;font-weight:700;color:#374151;">${_tg('Матеріали та норми витрат','Материалы и нормы расхода')}</label>
            <button onclick="window._normEditMaterials.push({name:'',unit:'кг',normPerUnit:0,warehouseItemId:''});document.getElementById('normMaterialsBody').innerHTML=normMaterialsRowsHtml()"
              style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.75rem;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:0.8rem;cursor:pointer;">${_estIco.plus} Додати матеріал</button>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <thead>
                <tr style="border-bottom:2px solid #e5e7eb;">
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:120px;">${_tg('Матеріал','Материал')}</th>
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:80px;">${_tg('Одиниця','Единица')}</th>
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:100px;">${_tg('Норма/1 вх.од.','Норма/1 вх.ед.')}</th>
                  <th style="text-align:left;padding:0.4rem;color:#6b7280;font-weight:600;min-width:120px;">${_tg('Позиція складу','Позиция склада')}</th>
                  <th style="width:30px;"></th>
                </tr>
              </thead>
              <tbody id="normMaterialsBody">${materialsHtml()}</tbody>
            </table>
          </div>
          ${(window._normEditMaterials||[]).length===0?`<div style="text-align:center;padding:1rem;color:#9ca3af;font-size:0.83rem;">Додайте матеріали кнопкою вище</div>`:''}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:0.6rem;margin-top:1.25rem;">
          <button onclick="closeNormModal()" style="padding:0.55rem 1.25rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.88rem;cursor:pointer;">${_tg('Скасувати','Отмена')}</button>
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
    if (!name) { alert(_tg('Введіть назву норми','Введите название нормы')); return; }

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
        if (typeof window.showToast === 'function') window.showToast(_tg('Норму збережено','Норма сохранена'));
    } catch(e) {
        console.error('[saveNorm]', e);
        alert(_tg('Помилка збереження: ','Ошибка сохранения: ') + e.message);
    }
};

window.deleteNorm = async function(normId) {
    if (!confirm('Видалити норму? Це не вплине на існуючі кошториси.')) return;
    try {
        await db.collection('companies').doc(currentCompany)
            .collection('estimate_norms').doc(normId)
            .update({ deleted: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof window.showToast === 'function') window.showToast(_tg('Норму видалено','Норма удалена'));
    } catch(e) { alert(_tg('Помилка: ','Ошибка: ') + e.message); }
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
        <p style="font-size:0.85rem;color:#6b7280;margin-bottom:1.25rem;">${_tg('Оберіть нішу — система додасть типові норми витрат матеріалів для вашої галузі','Выберите нишу — система добавит типовые нормы расходов материалов для вашей отрасли')}<еріалів:</p>
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
          <button onclick="document.getElementById('loadNormsModal').remove()" style="padding:0.5rem 1.1rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.88rem;cursor:pointer;">${_tg('Скасувати','Отмена')}</button>
          <button onclick="loadDefaultNorms(document.querySelector('[name=loadNiche]:checked')?.value)" style="display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1.25rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.download} Завантажити</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.loadDefaultNorms = async function(niche) {
    if (!niche) { alert(_tg('Оберіть нішу','Выберите нишу')); return; }
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
    if (normsToAdd.length === 0) { alert(_tg('Немає стандартних норм для цієї ніші','Нет стандартных норм для этой ниши')); return; }

    try {
        const cRef = db.collection('companies').doc(currentCompany);
        const batch = db.batch();
        const now = firebase.firestore.FieldValue.serverTimestamp();
        normsToAdd.forEach(n => {
            const ref = cRef.collection('estimate_norms').doc();
            batch.set(ref, { ...n, deleted:false, isDefault:true, createdAt:now, updatedAt:now, createdBy: currentUser?.uid||'' });
        });
        await batch.commit();
        if (typeof window.showToast === 'function') window.showToast(_tg(`Додано ${normsToAdd.length} стандартних норм`,`Добавлено ${normsToAdd.length} стандартных норм`));
    } catch(e) {
        console.error('[loadDefaultNorms]', e);
        alert(_tg('Помилка: ','Ошибка: ') + e.message);
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
                ${_tg('Додайте тип роботи кнопкою нижче','Добавьте тип работы кнопкой ниже')}
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
                  <button onclick="recalcSection(${si})" style="display:flex;align-items:center;gap:0.3rem;padding:0.25rem 0.6rem;border:1px solid #e5e7eb;border-radius:6px;background:white;font-size:0.78rem;cursor:pointer;">${_estIco.refresh} ${_tg('Перерахувати','Пересчитать')}</button>
                  <button onclick="window._estEditSections.splice(${si},1);document.getElementById('estSectionsBody').innerHTML=renderEstSectionsHtml()" style="display:flex;align-items:center;padding:0.25rem 0.5rem;border:1px solid #fecaca;border-radius:6px;background:#fef2f2;color:#dc2626;font-size:0.78rem;cursor:pointer;">${_estIco.x}</button>
                </div>
              </div>
              ${mats.length>0?`
              <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                <thead><tr style="border-bottom:1px solid #f3f4f6;">
                  <th style="text-align:left;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">${_tg('Матеріал','Материал')}</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">${_tg('Потрібно','Нужно')}</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">${_tg('На складі','На складе')}</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">${_tg('Дефіцит','Дефицит')}</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">${_tg('Ціна/од','Цена/ед')}</th>
                  <th style="text-align:right;padding:0.3rem 0.4rem;color:#9ca3af;font-weight:500;">${_tg('Сума','Сумма')}</th>
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
              :`<div style="font-size:0.8rem;color:#9ca3af;text-align:center;padding:0.5rem;">${_tg('Натисніть "Перерахувати" щоб побачити матеріали','Нажмите "Пересчитать" чтобы увидеть материалы')}</div>`}
            </div>`;
        }).join('');
    };
    window.renderEstSectionsHtml = renderSections;

    const html = `
    <div id="estimateModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:4rem 1rem 1rem;overflow-y:auto;">
      <div style="background:#f9fafb;border-radius:16px;width:100%;max-width:800px;max-height:calc(100vh - 5rem);overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="background:white;border-radius:16px 16px 0 0;padding:1.25rem 1.5rem;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:1;">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700;">${_tg(estimateId?'Редагувати кошторис':'Новий кошторис',estimateId?'Редактировать смету':'Новая смета')}</h3>
          <button onclick="closeEstimateModal()" style="background:none;border:none;cursor:pointer;color:#9ca3af;">${_estIco.x}</button>
        </div>
        <div style="padding:1.25rem 1.5rem;">

          <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;margin-bottom:1rem;">
            <div style="font-weight:600;font-size:0.88rem;color:#374151;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;">${_estIco.clipboard} ${_tg('Загальна інформація','Общая информация')}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;">
              <div style="grid-column:1/-1;">
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">${_tg('Назва кошторису *','Название сметы *')}</label>
                <input id="estTitle" value="${esc(existing?.title||'')}" placeholder="напр. Об'єкт вул. Шевченка 15" style="width:100%;padding:0.5rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;"/>
              </div>
              <div>
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">${_tg('Прив\'язати до проекту','Привязать к проекту')}<у</label>
                <select id="estProjectId" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                  <option value="">— ${_tg('без проекту','без проекта')} —</option>
                  ${projects.map(p=>`<option value="${p.id}" ${existing?.projectId===p.id?'selected':''}>${esc(p.title||p.name||p.id)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">${_tg('Угода CRM (опціональна)','Сделка CRM (необязательно)')}<но)</label>
                <select id="estDealId" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                  <option value="">— ${_tg('без угоди','без сделки')} —</option>
                  ${deals.slice(0,50).map(d=>`<option value="${d.id}" ${existing?.dealId===d.id?'selected':''}>${esc(d.title||d.name||d.id)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:0.25rem;">${_tg('Функція (ТЗ: кошторис прив\'язаний до функції)','Функция (ТЗ: смета привязана к функции)')}</label>
                <select id="estFunctionId" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.85rem;">
                  <option value="">${_tg('— без функції —','— без функции —')}</option>
                  ${(typeof functions !== 'undefined' ? functions : []).filter(f=>f.status!=='archived').map(f=>`<option value="${esc(f.id)}" ${existing?.functionId===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}
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
            <button onclick="closeEstimateModal()" style="padding:0.55rem 1.1rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.88rem;cursor:pointer;">${_tg('Скасувати','Отмена')}</button>
            ${estimateId ? `<button onclick="exportEstimatePDF('${estimateId}')" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.1rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.88rem;cursor:pointer;">${_estIco.save} PDF</button>` : ''}
            ${estimateId && existing?.status === 'approved' ? `<button onclick="writeOffEstimateMaterials('${estimateId}')" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.1rem;background:#ef4444;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.package} ${_tg('Списати матеріали','Списать материалы')}</button>` : ''}
            <button onclick="saveEstimate('draft')" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.25rem;background:#f59e0b;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.save} ${_tg('Зберегти як чернетку','Сохранить как черновик')}</button>
            <button onclick="saveEstimate('approved')" style="display:flex;align-items:center;gap:0.4rem;padding:0.55rem 1.25rem;background:#10b981;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">${_estIco.check} ${_tg('Затвердити','Утвердить')}</button>
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
        <div style="font-size:0.75rem;color:#6b7280;">${_tg('Бюджет матеріалів','Бюджет материалов')}</div>
        <div style="font-size:1.1rem;font-weight:700;color:#10b981;">${formatMoney(totalCost)}</div>
      </div>
      <div style="padding:0.75rem;background:${totalDeficit>0?'#fef2f2':'#f0fdf4'};border-radius:8px;text-align:center;">
        <div style="font-size:0.75rem;color:#6b7280;">${_tg('Потрібно докупити','Нужно докупить')}</div>
        <div style="font-size:1.1rem;font-weight:700;color:${totalDeficit>0?'#ef4444':'#10b981'};display:flex;align-items:center;justify-content:center;gap:0.3rem;">
          ${totalDeficit>0?`${_estIco.warning} ${formatMoney(totalDeficit)}`:`${_estIco.ok} 0`}
        </div>
      </div>
      <div style="padding:0.75rem;background:#f0f9ff;border-radius:8px;text-align:center;">
        <div style="font-size:0.75rem;color:#6b7280;">${_tg('Типів робіт','Типов работ')}</div>
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
        alert(_tg('Спочатку додайте норми витрат у Довіднику норм (вкладка "Довідник норм")','Сначала добавьте нормы расхода в Справочнике норм (вкладка "Справочник норм")'  ));
        return;
    }
    const html = `
    <div id="addSectionModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10002;display:flex;align-items:center;justify-content:center;padding:1rem;" onclick="if(event.target===this)document.getElementById('addSectionModal').remove()">
      <div style="background:white;border-radius:14px;padding:1.25rem;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <h4 style="margin:0 0 1rem;font-size:1rem;font-weight:700;">${_tg('Додати тип роботи','Добавить тип работы')}</h4>
        <div style="margin-bottom:0.75rem;">
          <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.3rem;">${_tg('Тип роботи','Тип работы')}</label>
          <select id="addSecNormId" onchange="updateAddSectionExtra()" style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.88rem;">
            <option value="">${_tg('— оберіть норму —','— выберите норму —')}</option>
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
          <button onclick="document.getElementById('addSectionModal').remove()" style="padding:0.5rem 1rem;border:1.5px solid #e5e7eb;background:white;border-radius:8px;font-size:0.85rem;cursor:pointer;">${_tg('Скасувати','Отмена')}</button>
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
    if (!normId || !norm) { alert(_tg('Оберіть тип роботи','Выберите тип работы')); return; }

    const inputValue  = parseFloat(document.getElementById('addSecValue')?.value) || 0;
    const extraParam  = norm.hasExtraParam ? (parseFloat(document.getElementById('addSecExtra')?.value) || 1) : 1;

    if (inputValue <= 0) { alert(_tg('Введіть обʼєм роботи','Введите объём работы')); return; }

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
    if (!title) { alert(_tg('Введіть назву кошторису','Введите название сметы')); return; }

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
        functionId: document.getElementById('estFunctionId')?.value || '',
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
            window.showToast(_tg(status === 'approved' ? 'Кошторис затверджено' : 'Кошторис збережено', status === 'approved' ? 'Смета утверждена' : 'Смета сохранена'));
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
        alert(_tg('Помилка збереження: ','Ошибка сохранения: ') + e.message);
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
        if (typeof window.showToast === 'function') window.showToast(_tg('Залишки оновлено зі складу','Остатки обновлены со склада'));
    } catch(e) {
        console.error('[syncEstimate]', e);
        alert(_tg('Помилка синхронізації: ','Ошибка синхронизации: ') + e.message);
    }
};

// Списати матеріали зі складу по кошторису (викликає whDoOperation для кожного матеріалу)
window.writeOffEstimateMaterials = async function(estimateId, sectionId) {
    const estimate = (window._projectEstimates||[]).find(e=>e.id===estimateId);
    if (!estimate) return;
    if (!confirm(_tg('Списати матеріали зі складу по кошторису? Дія незворотна.','Списать материалы со склада по смете? Действие необратимо.'))) return;

    const sections = sectionId
        ? (estimate.sections||[]).filter(s=>s.sectionId===sectionId)
        : (estimate.sections||[]);

    if (!sections.length) { alert(_tg('Немає секцій для списання','Нет секций для списания')); return; }

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

    if (typeof window.showToast === 'function') window.showToast(`${_tg('Списано','Списано')} ${writtenOff} ${_tg('позицій зі складу','позиций со склада')}`);
    await syncEstimateWithWarehouse(estimateId);
};

// ══════════════════════════════════════════════════════════════
// ФАЗА 3 — EXPORT PDF
// ══════════════════════════════════════════════════════════════
window.exportEstimatePDF = function(estimateId) {
    const estimate = estimateId
        ? (window._projectEstimates||[]).find(e=>e.id===estimateId)
        : null;

    if (!estimate) { alert(_tg('Кошторис не знайдено','Смета не найдена')); return; }

    const fmt = n => new Intl.NumberFormat('uk-UA', {style:'currency',currency:'UAH',maximumFractionDigits:0}).format(n||0);
    const fmtNum = n => { const num = parseFloat(n||0); return isNaN(num)?'0':(num%1===0?num.toString():num.toFixed(2)); };
    const statusLabel = { draft:_tg('Чернетка','Черновик'), approved:_tg('Затверджено','Утверждено'), in_progress:_tg('В роботі','В работе'), done:_tg('Виконано','Выполнено') };
    const project = (window.projects||[]).find(p=>p.id===estimate.projectId);

    const sectionsHtml = (estimate.sections||[]).map(sec => `
        <div style="margin-bottom:18px;page-break-inside:avoid;">
            <div style="background:#f3f4f6;padding:8px 12px;border-radius:6px;font-weight:700;font-size:13px;margin-bottom:6px;">
                ${sec.normName||'Секція'}
                <span style="font-weight:400;color:#6b7280;margin-left:8px;">${sec.inputValue||0} ${sec.inputUnit||''} ${sec.extraParam?'× '+sec.extraParam+' '+( sec.extraParamLabel||''):''}</span>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                    <tr style="background:#e5e7eb;">
                        <th style="text-align:left;padding:5px 8px;border:1px solid #d1d5db;">${_tg('Матеріал','Материал')}</th>
                        <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">${_tg('Потрібно','Нужно')}</th>
                        <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">${_tg('На складі','На складе')}</th>
                        <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">${_tg('Дефіцит','Дефицит')}</th>
                        <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">${_tg('Ціна/од','Цена/ед')}</th>
                        <th style="text-align:right;padding:5px 8px;border:1px solid #d1d5db;">${_tg('Сума','Сумма')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${(sec.calculatedMaterials||[]).map(m=>`
                    <tr>
                        <td style="padding:5px 8px;border:1px solid #e5e7eb;">${m.name||''}</td>
                        <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:right;">${fmtNum(m.required)} ${m.unit||''}</td>
                        <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:right;color:#10b981;">${fmtNum(m.inStock)} ${m.unit||''}</td>
                        <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:right;${m.deficit>0?'color:#ef4444;font-weight:600;':''}">
                            ${m.deficit>0?'⚠ '+fmtNum(m.deficit)+' '+(m.unit||''):'—'}
                        </td>
                        <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:right;">${m.pricePerUnit||0}</td>
                        <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:right;font-weight:600;">${fmt((m.required||0)*(m.pricePerUnit||0))}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Кошторис: ${estimate.title||'Без назви'}</title>
<style>
  body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 20px; }
  @media print { body { padding: 0; } }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
  .totals { display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap; }
  .total-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 16px; min-width: 140px; }
  .total-label { font-size: 11px; color: #6b7280; }
  .total-val { font-size: 16px; font-weight: 700; margin-top: 2px; }
  .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
</style>
</head>
<body>
<h1>Кошторис: ${estimate.title||'Без назви'}</h1>
<div class="meta">
    Статус: <b>${statusLabel[estimate.status]||estimate.status||'—'}</b>
    ${project?` &nbsp;|&nbsp; Проект: <b>${project.title||project.name||''}</b>`:''}
    &nbsp;|&nbsp; Дата: <b>${new Date().toLocaleDateString('uk-UA')}</b>
</div>

<div class="totals">
    <div class="total-card">
        <div class="total-label">${_tg('Бюджет матеріалів','Бюджет материалов')}</div>
        <div class="total-val" style="color:#10b981;">${fmt(estimate.totals?.totalMaterialsCost)}</div>
    </div>
    <div class="total-card">
        <div class="total-label">${_tg('Потрібно докупити','Нужно докупить')}</div>
        <div class="total-val" style="color:${(estimate.totals?.totalDeficitCost||0)>0?'#ef4444':'#10b981'};">${fmt(estimate.totals?.totalDeficitCost)}</div>
    </div>
    <div class="total-card">
        <div class="total-label">${_tg('Типів робіт','Типов работ')}</div>
        <div class="total-val" style="color:#3b82f6;">${(estimate.sections||[]).length}</div>
    </div>
</div>

${sectionsHtml}

<div class="footer">
    Сформовано: ${new Date().toLocaleString('uk-UA')} &nbsp;|&nbsp; TALKO System
</div>
</body>
</html>`;

    // Відкриваємо у новому вікні і запускаємо друк
    const win = window.open('', '_blank');
    if (!win) { alert(_tg('Дозвольте pop-ups для цього сайту','Разрешите pop-ups для этого сайта')); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
};
