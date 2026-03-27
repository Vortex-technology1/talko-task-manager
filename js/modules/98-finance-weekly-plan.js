// ============================================================
// 98-finance-weekly-plan.js — Weekly Plan 6M v2.0
// Тижневий план: Timeline + Стовпчиковий графік + Cashflow
// ============================================================
(function () {
'use strict';

const WP = {
  weeks:    [],
  plan:     {},   // { weekKey: { income:N, expense:N } }
  actual:   {},   // { weekKey: { income:N, expense:N } }
  horizon:  26,
  currency: 'UAH',
  startBalance: 0,
  saving:   false,
};

// ── Точка входу ────────────────────────────────────────────
window.renderWeeklyPlan = async function(containerId) {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.innerHTML = _skeleton();
  WP.currency = _getCurrency();
  WP.weeks    = _buildWeeks(WP.horizon);
  await Promise.all([_loadPlan(), _loadActual()]);
  _render(root);
};

// ── Головний рендер ────────────────────────────────────────
function _render(root) {
  const now   = new Date();
  const weeks = WP.weeks;
  const cur   = _getCurrency();

  // Збагачуємо тижні даними
  const enriched = weeks.map(w => {
    const p = WP.plan[w.key]   || {income:0, expense:0};
    const a = WP.actual[w.key] || {income:0, expense:0};
    return {
      ...w,
      pInc: p.income,  pExp: p.expense,
      aInc: a.income,  aExp: a.expense,
      pProfit: p.income - p.expense,
      aProfit: a.income - a.expense,
      isPast:    w.to   < now,
      isCurrent: w.from <= now && w.to >= now,
      isFuture:  w.from > now,
    };
  });

  // Cashflow з накопиченням (залишок рахується наростаючим підсумком)
  let cfBal = WP.startBalance;
  enriched.forEach(w => {
    w.cfStart = cfBal;
    const inc = w.isPast || w.isCurrent ? w.aInc : w.pInc;
    const exp = w.isPast || w.isCurrent ? w.aExp : w.pExp;
    cfBal = cfBal + inc - exp;
    w.cfEnd   = cfBal;
    w.cfInc   = inc;
    w.cfExp   = exp;
    w.cfIsNeg = cfBal < 0;
  });

  // Максимуми для масштабування
  const maxBar = Math.max(...enriched.map(w => Math.max(w.pInc, w.pExp, w.aInc, w.aExp, 1)));
  const maxCf  = Math.max(...enriched.map(w => Math.abs(w.cfEnd)), 1);
  const minCf  = Math.min(...enriched.map(w => w.cfEnd), 0);

  // KPI
  const tPlanInc = enriched.reduce((s,w)=>s+w.pInc,0);
  const tPlanExp = enriched.reduce((s,w)=>s+w.pExp,0);
  const tActInc  = enriched.reduce((s,w)=>s+w.aInc,0);
  const tActExp  = enriched.reduce((s,w)=>s+w.aExp,0);
  const cfFinal  = cfBal;
  const hasNeg   = enriched.some(w=>w.cfIsNeg);

  const kpi = `
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px;">
      ${[
        {l:'Дохід план',   v:_fmt(tPlanInc,cur), c:'#22c55e', sub:'за горизонт'},
        {l:'Витрати план', v:_fmt(tPlanExp,cur), c:'#ef4444', sub:'за горизонт'},
        {l:'Плановий прибуток', v:_fmt(tPlanInc-tPlanExp,cur), c:tPlanInc>=tPlanExp?'#22c55e':'#ef4444', sub:''},
        {l:'Факт доходів', v:_fmt(tActInc,cur),  c:'#3b82f6', sub:'минулі тижні'},
        {l:'Залишок наприкінці', v:_fmt(cfFinal,cur), c:cfFinal>=0?'#22c55e':'#ef4444',
          sub: hasNeg ? '⚠️ є касовий розрив' : 'очікуваний'},
      ].map(k=>`
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
          <div style="font-size:0.67rem;color:#6b7280;margin-bottom:2px;">${k.l}</div>
          <div style="font-size:0.88rem;font-weight:700;color:${k.c};">${k.v}</div>
          ${k.sub?`<div style="font-size:0.65rem;color:#9ca3af;margin-top:1px;">${k.sub}</div>`:''}
        </div>`).join('')}
    </div>`;

  // Панель управління
  const controls = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
      <button onclick="window._wpSave()" id="wpSaveBtn"
        style="padding:0.45rem 1rem;background:#22c55e;color:#fff;border:none;border-radius:8px;
          font-size:0.82rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Зберегти план
      </button>
      <select id="wpHorizonSel" onchange="window._wpChangeHorizon(this.value)"
        style="padding:0.45rem 0.7rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.8rem;background:#fff;cursor:pointer;">
        <option value="20" ${WP.horizon===20?'selected':''}>5 місяців (20 тижнів)</option>
        <option value="26" ${WP.horizon===26?'selected':''}>6 місяців (26 тижнів)</option>
        <option value="32" ${WP.horizon===32?'selected':''}>8 місяців (32 тижні)</option>
      </select>
      <div style="display:flex;align-items:center;gap:5px;">
        <span style="font-size:0.78rem;color:#6b7280;">Початковий залишок:</span>
        <input id="wpStartBal" type="number" value="${WP.startBalance}" min="0" step="100"
          onchange="window._wpStartBalChange(this.value)"
          style="width:110px;padding:0.4rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;
            font-size:0.8rem;outline:none;"
          onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
      </div>
      <button onclick="window._wpFillFromAvg()"
        style="padding:0.45rem 0.9rem;border:1px solid #e5e7eb;border-radius:8px;
          background:#fff;font-size:0.8rem;color:#374151;cursor:pointer;">
        🤖 Заповнити з середнього 3M
      </button>
      <button onclick="window._wpClearAll()"
        style="padding:0.45rem 0.8rem;border:1px solid #fecaca;border-radius:8px;
          background:#fff;font-size:0.8rem;color:#ef4444;cursor:pointer;">Очистити</button>
    </div>`;

  // Основний графік — стовпчиковий з cashflow лінією
  const chart = _renderChart(enriched, maxBar, maxCf, minCf, cur);

  // Деталізована таблиця
  const table = _renderTable(enriched, cur);

  root.innerHTML = kpi + controls + chart + table;
}

// ── Стовпчиковий графік + Cashflow лінія ──────────────────
function _renderChart(weeks, maxBar, maxCf, minCf, currency) {
  const COL_W   = 38;   // ширина колонки тижня
  const LABEL_W = 90;   // ширина лівої колонки
  const BAR_H   = 110;  // висота зони барів
  const CF_H    = 60;   // висота зони cashflow
  const TOTAL_W = LABEL_W + weeks.length * COL_W;
  const TOTAL_H = BAR_H + CF_H + 48; // +48 для підписів

  // Місячні групи для заголовка
  const months = {};
  weeks.forEach((w,i) => {
    const mo = w.from.toLocaleDateString(_getLocale(),{month:'short',year:'2-digit'});
    if (!months[mo]) months[mo] = {start:i, count:0};
    months[mo].count++;
  });

  const monthLabels = Object.entries(months).map(([mo,{start,count}]) =>
    `<div style="position:absolute;left:${LABEL_W+start*COL_W}px;width:${count*COL_W}px;
      top:0;height:18px;font-size:0.65rem;font-weight:600;color:#6b7280;
      text-align:center;border-right:1px dashed #f0f0f0;overflow:hidden;">${mo}</div>`
  ).join('');

  // Бари та cashflow лінія
  const cfRange = maxCf - minCf || 1;
  const cfZeroY = minCf < 0
    ? CF_H - Math.round((-minCf / cfRange) * CF_H)
    : CF_H; // Y де нуль в зоні cashflow (від верху CF зони)

  let cfPolyline = '';
  const cfPoints = [];

  const bars = weeks.map((w, i) => {
    const x     = LABEL_W + i * COL_W;
    const halfW = Math.floor(COL_W / 2) - 2;
    const bw    = halfW - 1;

    // Бари доходів (ліва половина)
    const pIncH = Math.round((w.pInc / maxBar) * (BAR_H - 8));
    const aIncH = Math.round((w.aInc / maxBar) * (BAR_H - 8));
    // Бари витрат (права половина)
    const pExpH = Math.round((w.pExp / maxBar) * (BAR_H - 8));
    const aExpH = Math.round((w.aExp / maxBar) * (BAR_H - 8));

    // Cashflow точка (центр колонки)
    const cfY = CF_H - Math.round(((w.cfEnd - minCf) / cfRange) * CF_H);
    cfPoints.push({x: x + COL_W/2, y: cfY + BAR_H + 20});

    const bgColor = w.isCurrent ? 'rgba(34,197,94,0.06)' : 'transparent';
    const borderL = w.isCurrent ? `border-left:2px solid #22c55e;` : '';

    const showFact = !w.isFuture;

    return `
      <div style="position:absolute;left:${x}px;top:20px;width:${COL_W}px;height:${TOTAL_H-20}px;
        background:${bgColor};${borderL}">

        <!-- Бари (від низу BAR_H зони) -->
        <!-- Дохід план -->
        <div style="position:absolute;bottom:${CF_H+28}px;left:2px;width:${bw}px;height:${Math.max(1,pIncH)}px;
          background:#22c55e;border-radius:2px 2px 0 0;opacity:0.85;"
          title="Дохід план: ${_fmt(w.pInc,currency)}"></div>

        ${showFact && w.aInc > 0 ? `
        <!-- Дохід факт (накладений) -->
        <div style="position:absolute;bottom:${CF_H+28}px;left:2px;width:${bw}px;height:${Math.max(1,aIncH)}px;
          background:#86efac;border-radius:2px 2px 0 0;border:1.5px solid #22c55e;box-sizing:border-box;"
          title="Дохід факт: ${_fmt(w.aInc,currency)}"></div>` : ''}

        <!-- Витрати план -->
        <div style="position:absolute;bottom:${CF_H+28}px;left:${halfW+2}px;width:${bw}px;height:${Math.max(1,pExpH)}px;
          background:#ef4444;border-radius:2px 2px 0 0;opacity:0.85;"
          title="Витрати план: ${_fmt(w.pExp,currency)}"></div>

        ${showFact && w.aExp > 0 ? `
        <!-- Витрати факт -->
        <div style="position:absolute;bottom:${CF_H+28}px;left:${halfW+2}px;width:${bw}px;height:${Math.max(1,aExpH)}px;
          background:#fca5a5;border-radius:2px 2px 0 0;border:1.5px solid #ef4444;box-sizing:border-box;"
          title="Витрати факт: ${_fmt(w.aExp,currency)}"></div>` : ''}

        <!-- Розділювач між зонами -->
        <div style="position:absolute;bottom:${CF_H+26}px;left:0;right:0;height:2px;background:#f3f4f6;"></div>

        <!-- Cashflow крапка -->
        <div style="position:absolute;bottom:${26 + cfZeroY - cfY - 4}px;left:50%;transform:translateX(-50%);
          width:8px;height:8px;border-radius:50%;background:${w.cfEnd<0?'#ef4444':'#3b82f6'};
          border:2px solid white;box-shadow:0 0 0 1px ${w.cfEnd<0?'#ef4444':'#3b82f6'};z-index:3;"
          title="Залишок: ${_fmt(w.cfEnd,currency)}"></div>

        <!-- Нульова лінія CF якщо є мінус -->
        ${minCf < 0 ? `<div style="position:absolute;bottom:${26 + cfZeroY}px;left:0;right:0;height:1px;
          background:#fca5a5;opacity:0.5;"></div>` : ''}

        <!-- Тижень підпис -->
        <div style="position:absolute;bottom:8px;left:0;right:0;text-align:center;
          font-size:0.58rem;color:${w.isCurrent?'#22c55e':'#9ca3af'};overflow:hidden;">
          ${w.shortLabel}
        </div>

        <!-- Поточний тиждень мітка -->
        ${w.isCurrent ? `<div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);
          background:#22c55e;color:white;font-size:0.55rem;font-weight:700;padding:1px 5px;
          border-radius:8px;white-space:nowrap;">Зараз</div>` : ''}
      </div>`;
  }).join('');

  // SVG лінія cashflow
  if (cfPoints.length > 1) {
    const pts = cfPoints.map(p=>`${p.x},${p.y}`).join(' ');
    cfPolyline = `
      <svg style="position:absolute;top:20px;left:0;width:${TOTAL_W}px;height:${TOTAL_H-20}px;pointer-events:none;overflow:visible;">
        <polyline points="${pts}"
          fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round"
          stroke-dasharray="${cfPoints.some((_,i)=>i>0 && weeks[i]?.isFuture)?'4,3':'none'}"/>
        <!-- Заливка під лінією -->
        <polygon points="${cfPoints[0].x},${cfPoints[0].y} ${pts} ${cfPoints[cfPoints.length-1].x},${cfPoints[cfPoints.length-1].y}"
          fill="rgba(59,130,246,0.07)"/>
      </svg>`;
  }

  // Ліва вісь підписи
  const yLabels = [0, 25, 50, 75, 100].map(pct => `
    <div style="position:absolute;right:4px;bottom:${CF_H+28+Math.round(pct*(BAR_H-8)/100)}px;
      font-size:0.6rem;color:#d1d5db;text-align:right;">${_fmtShort(maxBar*pct/100)}</div>`).join('');

  const cfLabels = [0, 50, 100].map(pct => {
    const val = minCf + (maxCf-minCf)*pct/100;
    return `<div style="position:absolute;right:4px;bottom:${28+Math.round(pct*CF_H/100)}px;
      font-size:0.6rem;color:#bfdbfe;text-align:right;">${_fmtShort(val)}</div>`;
  }).join('');

  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:14px;">
      <!-- Легенда -->
      <div style="padding:8px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;
        display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="font-size:0.82rem;font-weight:700;color:#1a1a1a;">
          📊 Тижневий план — доходи, витрати, cashflow
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${[
            {c:'#22c55e', l:'Дохід план'},
            {c:'#86efac', l:'Дохід факт', border:'#22c55e'},
            {c:'#ef4444', l:'Витрати план'},
            {c:'#fca5a5', l:'Витрати факт', border:'#ef4444'},
            {c:'#3b82f6', l:'Залишок CF', round:true},
          ].map(i=>`
            <div style="display:flex;align-items:center;gap:4px;font-size:0.71rem;color:#374151;">
              <div style="width:${i.round?8:12}px;height:${i.round?8:7}px;
                ${i.round?'border-radius:50%;':'border-radius:2px;'}
                background:${i.c};${i.border?`border:1.5px solid ${i.border};`:''}
                flex-shrink:0;"></div>
              ${i.l}
            </div>`).join('')}
        </div>
      </div>
      <!-- Графік -->
      <div style="overflow-x:auto;padding:8px 0 0 0;">
        <div style="position:relative;height:${TOTAL_H+20}px;min-width:${TOTAL_W}px;">
          <!-- Зона барів підпис -->
          <div style="position:absolute;left:2px;top:20px;width:${LABEL_W-8}px;
            font-size:0.62rem;color:#9ca3af;font-weight:600;text-align:right;padding-right:6px;">
            Доходи / Витрати
          </div>
          <!-- Зона CF підпис -->
          <div style="position:absolute;left:2px;top:${BAR_H+28}px;width:${LABEL_W-8}px;
            font-size:0.62rem;color:#3b82f6;font-weight:600;text-align:right;padding-right:6px;">
            Cashflow
          </div>
          <!-- Y вісь бари -->
          <div style="position:absolute;left:0;top:20px;width:${LABEL_W}px;height:${BAR_H}px;">
            ${yLabels}
          </div>
          <!-- Y вісь CF -->
          <div style="position:absolute;left:0;top:${BAR_H+28}px;width:${LABEL_W}px;height:${CF_H}px;">
            ${cfLabels}
          </div>
          <!-- Базова лінія барів -->
          <div style="position:absolute;left:${LABEL_W}px;right:0;bottom:${CF_H+28}px;
            height:2px;background:#e5e7eb;z-index:1;"></div>
          <!-- Місячні підписи -->
          <div style="position:absolute;left:0;top:0;right:0;height:20px;">${monthLabels}</div>
          <!-- Бари -->
          ${bars}
          <!-- CF лінія SVG -->
          ${cfPolyline}
        </div>
      </div>
      <!-- Попередження про касовий розрив -->
      ${weeks.some(w=>w.cfIsNeg) ? `
      <div style="margin:8px 14px;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;
        border-radius:8px;font-size:0.75rem;color:#dc2626;display:flex;align-items:center;gap:6px;">
        ⚠️ <b>Касовий розрив</b> — у деяких тижнях прогнозується від'ємний залишок.
        Перевірте план витрат або скоригуйте продажі.
      </div>` : ''}
      <div style="padding:6px 14px 10px;font-size:0.7rem;color:#9ca3af;">
        💡 Відредагуйте планові суми в таблиці нижче — графік оновиться після збереження
      </div>
    </div>`;
}

// ── Деталізована таблиця ───────────────────────────────────
function _renderTable(weeks, currency) {
  const visibleMonths = {};
  weeks.forEach(w => {
    const mo = w.from.toLocaleDateString(_getLocale(), {month:'long', year:'numeric'});
    if (!visibleMonths[mo]) visibleMonths[mo] = [];
    visibleMonths[mo].push(w);
  });

  const monthBlocks = Object.entries(visibleMonths).map(([mo, mWeeks]) => {
    const rows = mWeeks.map(w => {
      const showFact = !w.isFuture;
      const varInc = showFact ? w.aInc - w.pInc : null;
      const varExp = showFact ? w.aExp - w.pExp : null;
      const cfColor = w.cfEnd < 0 ? '#ef4444' : w.cfEnd < w.cfStart * 0.7 ? '#f59e0b' : '#22c55e';

      return `
        <tr style="${w.isCurrent?'background:#f0fdf4;font-weight:600;':''}${w.isPast&&!w.isCurrent?'opacity:0.75;':''}">
          <td style="padding:6px 10px;font-size:0.78rem;color:#374151;white-space:nowrap;border-bottom:1px solid #f3f4f6;">
            ${w.isCurrent?'<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;margin-right:4px;vertical-align:middle;"></span>':''}
            ${w.label}
          </td>
          <!-- Дохід план (редагується) -->
          <td style="padding:4px 6px;border-bottom:1px solid #f3f4f6;">
            <input type="number" value="${w.pInc||''}" min="0" step="100"
              data-wp-key="${w.key}" data-wp-field="income"
              onchange="window._wpCellChange(this)"
              placeholder="0"
              style="width:90px;padding:3px 6px;border:1px solid #e5e7eb;border-radius:5px;
                font-size:0.78rem;text-align:right;outline:none;box-sizing:border-box;
                background:${w.isFuture?'#fafffe':'#fff'};"
              onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
          </td>
          <!-- Дохід факт -->
          <td style="padding:6px;text-align:right;font-size:0.78rem;color:${showFact&&w.aInc>0?'#16a34a':'#d1d5db'};border-bottom:1px solid #f3f4f6;">
            ${showFact ? (w.aInc > 0 ? _fmt(w.aInc,currency) : '—') : ''}
          </td>
          <!-- Відхилення доходу -->
          <td style="padding:6px;text-align:right;font-size:0.75rem;border-bottom:1px solid #f3f4f6;
            color:${varInc===null?'transparent':varInc>=0?'#22c55e':'#ef4444'};">
            ${varInc !== null && w.pInc > 0 ? (varInc>=0?'+':'')+_fmtShort(varInc) : ''}
          </td>
          <!-- Витрати план (редагується) -->
          <td style="padding:4px 6px;border-bottom:1px solid #f3f4f6;">
            <input type="number" value="${w.pExp||''}" min="0" step="100"
              data-wp-key="${w.key}" data-wp-field="expense"
              onchange="window._wpCellChange(this)"
              placeholder="0"
              style="width:90px;padding:3px 6px;border:1px solid #e5e7eb;border-radius:5px;
                font-size:0.78rem;text-align:right;outline:none;box-sizing:border-box;
                background:${w.isFuture?'#fff9f9':'#fff'};"
              onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#e5e7eb'">
          </td>
          <!-- Витрати факт -->
          <td style="padding:6px;text-align:right;font-size:0.78rem;color:${showFact&&w.aExp>0?'#dc2626':'#d1d5db'};border-bottom:1px solid #f3f4f6;">
            ${showFact ? (w.aExp > 0 ? _fmt(w.aExp,currency) : '—') : ''}
          </td>
          <!-- Відхилення витрат -->
          <td style="padding:6px;text-align:right;font-size:0.75rem;border-bottom:1px solid #f3f4f6;
            color:${varExp===null?'transparent':varExp<=0?'#22c55e':'#ef4444'};">
            ${varExp !== null && w.pExp > 0 ? (varExp>0?'+':'')+_fmtShort(varExp) : ''}
          </td>
          <!-- Залишок CF -->
          <td style="padding:6px;text-align:right;font-size:0.78rem;font-weight:600;
            color:${cfColor};border-bottom:1px solid #f3f4f6;white-space:nowrap;">
            ${_fmt(w.cfEnd, currency)}
            ${w.cfIsNeg?'<span style="font-size:0.65rem;margin-left:2px;">⚠️</span>':''}
          </td>
        </tr>`;
    }).join('');

    // Місячний підсумок
    const mPlanInc = mWeeks.reduce((s,w)=>s+w.pInc,0);
    const mPlanExp = mWeeks.reduce((s,w)=>s+w.pExp,0);
    const mActInc  = mWeeks.reduce((s,w)=>s+w.aInc,0);
    const mActExp  = mWeeks.reduce((s,w)=>s+w.aExp,0);
    const mProfit  = mPlanInc - mPlanExp;

    return `
      <tbody>
        <tr style="background:#1f2937;color:#fff;">
          <td colspan="8" style="padding:6px 10px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">
            📅 ${mo}
            <span style="float:right;font-weight:400;opacity:0.7;">
              план: +${_fmtShort(mPlanInc)} / −${_fmtShort(mPlanExp)} = ${mProfit>=0?'+':''}${_fmtShort(mProfit)}
            </span>
          </td>
        </tr>
        ${rows}
      </tbody>`;
  }).join('');

  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;min-width:650px;">
          <thead>
            <tr style="background:#374151;color:#fff;">
              <th style="padding:8px 10px;text-align:left;font-size:0.72rem;font-weight:600;min-width:130px;">Тиждень</th>
              <th style="padding:8px 6px;text-align:right;font-size:0.72rem;font-weight:600;background:#14532d;">Дохід план</th>
              <th style="padding:8px 6px;text-align:right;font-size:0.72rem;font-weight:600;background:#14532d;">Факт</th>
              <th style="padding:8px 6px;text-align:right;font-size:0.72rem;font-weight:600;background:#14532d;">Δ</th>
              <th style="padding:8px 6px;text-align:right;font-size:0.72rem;font-weight:600;background:#7f1d1d;">Витрати план</th>
              <th style="padding:8px 6px;text-align:right;font-size:0.72rem;font-weight:600;background:#7f1d1d;">Факт</th>
              <th style="padding:8px 6px;text-align:right;font-size:0.72rem;font-weight:600;background:#7f1d1d;">Δ</th>
              <th style="padding:8px 6px;text-align:right;font-size:0.72rem;font-weight:600;background:#1e3a5f;">Залишок CF</th>
            </tr>
          </thead>
          ${monthBlocks}
        </table>
      </div>
    </div>`;
}

// ── Інтерактивні дії ───────────────────────────────────────
window._wpCellChange = function(input) {
  const key   = input.dataset.wpKey;
  const field = input.dataset.wpField;
  if (!WP.plan[key]) WP.plan[key] = {income:0, expense:0};
  WP.plan[key][field] = parseFloat(input.value) || 0;
};

window._wpStartBalChange = function(val) {
  WP.startBalance = parseFloat(val) || 0;
  const root = document.getElementById('weeklyPlanRoot');
  if (root) _render(root);
};

window._wpSave = async function() {
  if (WP.saving) return;
  WP.saving = true;
  const btn = document.getElementById('wpSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Збереження...'; }
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) throw new Error('DB не готова');
    await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_settings').doc('weekly_plan')
      .set({
        plan: WP.plan,
        horizon: WP.horizon,
        startBalance: WP.startBalance,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    if (typeof showToast === 'function') showToast('✅ Тижневий план збережено', 'success');
    // Перерендер з оновленими даними
    const root = document.getElementById('weeklyPlanRoot');
    if (root) _render(root);
  } catch(e) {
    if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
  } finally {
    WP.saving = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Зберегти план'; }
  }
};

window._wpChangeHorizon = function(val) {
  WP.horizon = parseInt(val);
  WP.weeks   = _buildWeeks(WP.horizon);
  const root = document.getElementById('weeklyPlanRoot');
  if (root) _render(root);
};

window._wpFillFromAvg = async function() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return;
    const from3M = new Date(); from3M.setMonth(from3M.getMonth() - 3);
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_transactions')
      .where('date', '>=', firebase.firestore.Timestamp.fromDate(from3M)).get();
    const txs = snap.docs.map(d => d.data());
    const past = _buildWeeks(13, from3M);
    let sumInc=0, sumExp=0, cnt=0;
    past.forEach(w => {
      const inc = txs.filter(t=>t.type==='income'  && _txInWeek(t,w)).reduce((s,t)=>s+_txAmt(t),0);
      const exp = txs.filter(t=>t.type==='expense' && _txInWeek(t,w)).reduce((s,t)=>s+_txAmt(t),0);
      if (inc>0||exp>0){sumInc+=inc;sumExp+=exp;cnt++;}
    });
    if (!cnt) { if (typeof showToast==='function') showToast('Недостатньо даних за 3 місяці','warning'); return; }
    const avgInc = Math.round(sumInc/cnt/100)*100;
    const avgExp = Math.round(sumExp/cnt/100)*100;
    const now = new Date();
    WP.weeks.forEach(w => {
      if (w.from >= now) {
        if (!WP.plan[w.key]) WP.plan[w.key] = {income:0,expense:0};
        if (!WP.plan[w.key].income)  WP.plan[w.key].income  = avgInc;
        if (!WP.plan[w.key].expense) WP.plan[w.key].expense = avgExp;
      }
    });
    const root = document.getElementById('weeklyPlanRoot');
    if (root) _render(root);
    if (typeof showToast==='function') showToast(`Заповнено: ~${_fmt(avgInc,WP.currency)}/тиж доходу, ~${_fmt(avgExp,WP.currency)}/тиж витрат`,'success');
  } catch(e) {
    if (typeof showToast==='function') showToast('Помилка: '+e.message,'error');
  }
};

window._wpClearAll = async function() {
  const ok = typeof showConfirmModal==='function'
    ? await showConfirmModal('Очистити весь тижневий план?',{danger:true})
    : confirm('Очистити весь тижневий план?');
  if (!ok) return;
  WP.plan = {};
  const root = document.getElementById('weeklyPlanRoot');
  if (root) _render(root);
};

// ── Дані ──────────────────────────────────────────────────
async function _loadPlan() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return;
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_settings').doc('weekly_plan').get();
    if (snap.exists) {
      const d = snap.data();
      WP.plan         = d.plan         || {};
      WP.horizon      = d.horizon      || WP.horizon;
      WP.startBalance = d.startBalance || 0;
      WP.weeks        = _buildWeeks(WP.horizon);
    }
  } catch(e) { console.warn('[weeklyPlan] load:', e.message); }
}

async function _loadActual() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return;
    const now  = new Date();
    const from = WP.weeks[0]?.from || now;
    if (from >= now) return; // все майбутнє — факту немає
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_transactions')
      .where('date','>=',firebase.firestore.Timestamp.fromDate(from))
      .where('date','<=',firebase.firestore.Timestamp.fromDate(now)).get();
    const txs = snap.docs.map(d=>d.data());
    WP.actual = {};
    WP.weeks.forEach(w => {
      if (w.isFuture) return;
      const wt = txs.filter(t=>_txInWeek(t,w));
      WP.actual[w.key] = {
        income:  wt.filter(t=>t.type==='income').reduce((s,t)=>s+_txAmt(t),0),
        expense: wt.filter(t=>t.type==='expense').reduce((s,t)=>s+_txAmt(t),0),
      };
    });
  } catch(e) { console.warn('[weeklyPlan] actual:', e.message); }
}

// ── Утиліти ────────────────────────────────────────────────
function _buildWeeks(count, startFrom) {
  const weeks = [];
  const base  = new Date(startFrom || new Date());
  const day   = base.getDay();
  const diff  = day===0 ? -6 : 1-day;
  base.setDate(base.getDate()+diff);
  base.setHours(0,0,0,0);
  for (let i=0;i<count;i++) {
    const from = new Date(base); from.setDate(from.getDate()+i*7);
    const to   = new Date(from); to.setDate(to.getDate()+6); to.setHours(23,59,59,999);
    const yr = from.getFullYear();
    const wn = _weekNum(from);
    const key = `${yr}-W${String(wn).padStart(2,'0')}`;
    const loc = _getLocale();
    const label = from.toLocaleDateString(loc,{day:'numeric',month:'short'})+
                  '–'+to.toLocaleDateString(loc,{day:'numeric',month:'short'});
    const shortLabel = from.toLocaleDateString(loc,{day:'numeric',month:'numeric'});
    weeks.push({key,label,shortLabel,from,to});
  }
  return weeks;
}

function _weekNum(d) {
  const dt = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  dt.setUTCDate(dt.getUTCDate()+4-(dt.getUTCDay()||7));
  const y1 = new Date(Date.UTC(dt.getUTCFullYear(),0,1));
  return Math.ceil((((dt-y1)/86400000)+1)/7);
}

function _txInWeek(tx,w) {
  const d = tx.date?.toDate ? tx.date.toDate() : (tx.date?new Date(tx.date):null);
  return d && d>=w.from && d<=w.to;
}

function _txAmt(tx) { return tx.amountBase||tx.amount||0; }

function _getCurrency() {
  return window.currentCompanyData?.currency||window.financeState?.currency||'UAH';
}

function _getLocale() { return window.getLocale?window.getLocale():'uk-UA'; }

function _fmt(n,currency) {
  try {
    return new Intl.NumberFormat(_getLocale(),{style:'currency',currency:currency||'UAH',maximumFractionDigits:0}).format(n||0);
  } catch(e){return (n||0).toLocaleString();}
}

function _fmtShort(n) {
  const abs = Math.abs(n);
  if (abs>=1000000) return (n/1000000).toFixed(1)+'M';
  if (abs>=1000)    return (n/1000).toFixed(0)+'K';
  return String(Math.round(n));
}

function _skeleton() {
  return `<div style="display:flex;align-items:center;justify-content:center;padding:3rem;color:#9ca3af;gap:8px;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" class="spin">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
    Завантаження тижневого плану...
  </div>`;
}

console.log('[weeklyPlan] v2.0 loaded');

})();
