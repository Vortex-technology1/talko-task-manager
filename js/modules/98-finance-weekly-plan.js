// ============================================================
// 98-finance-weekly-plan.js — Weekly Plan 6M v1.0
// Тижневе планування доходів і витрат на 6-8 місяців
// Комбо: таблиця зверху (план/факт) + Ганта знизу
// ============================================================
(function () {
'use strict';

// ── Стан ──────────────────────────────────────────────────
const WP = {
  weeks:    [],      // [{key:'2026-W01', label:'1-7 січ', from:Date, to:Date}]
  plan:     {},      // { weekKey: { income: N, expense: N } }
  actual:   {},      // { weekKey: { income: N, expense: N } } — з транзакцій
  horizon:  26,      // кількість тижнів (26 = 6M, 32 = 8M)
  currency: 'UAH',
  loaded:   false,
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
  WP.loaded = true;

  _render(root);
};

// ── Головний рендер ────────────────────────────────────────
function _render(root) {
  const currency = WP.currency;
  const weeks    = WP.weeks;

  // Підрахунки
  const totals = weeks.map(w => {
    const p = WP.plan[w.key]   || { income:0, expense:0 };
    const a = WP.actual[w.key] || { income:0, expense:0 };
    return {
      ...w,
      planInc:  p.income,  planExp:  p.expense,
      actInc:   a.income,  actExp:   a.expense,
      planProfit: p.income - p.expense,
      actProfit:  a.income - a.expense,
      isPast: w.to < new Date(),
      isCurrent: w.from <= new Date() && w.to >= new Date(),
    };
  });

  const totalPlanInc = totals.reduce((s,w) => s + w.planInc, 0);
  const totalPlanExp = totals.reduce((s,w) => s + w.planExp, 0);
  const totalActInc  = totals.reduce((s,w) => s + w.actInc,  0);
  const totalActExp  = totals.reduce((s,w) => s + w.actExp,  0);
  const maxVal = Math.max(...totals.map(w => Math.max(w.planInc, w.planExp, w.actInc, w.actExp, 1)));

  // ── KPI рядок ──
  const kpiHtml = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
      ${[
        {l:'Плановий дохід (6M)',   v:_fmt(totalPlanInc,currency), c:'#22c55e'},
        {l:'Планові витрати (6M)',  v:_fmt(totalPlanExp,currency), c:'#ef4444'},
        {l:'Плановий прибуток',     v:_fmt(totalPlanInc-totalPlanExp,currency), c:(totalPlanInc>=totalPlanExp?'#22c55e':'#ef4444')},
        {l:'Факт доходів (минулі)', v:_fmt(totalActInc,currency),  c:'#3b82f6'},
      ].map(k=>`
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 14px;">
          <div style="font-size:0.68rem;color:#6b7280;">${k.l}</div>
          <div style="font-size:0.95rem;font-weight:700;color:${k.c};margin-top:2px;">${k.v}</div>
        </div>`).join('')}
    </div>`;

  // ── Таблиця зверху ──
  const colW = 88;
  const tableHtml = `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;min-width:${120 + weeks.length * colW}px;">
          <thead>
            <tr style="background:#1f2937;color:#fff;">
              <th style="text-align:left;padding:8px 12px;font-size:0.72rem;font-weight:600;position:sticky;left:0;background:#1f2937;min-width:120px;z-index:2;">Показник</th>
              ${weeks.map(w=>`
                <th style="text-align:center;padding:6px 4px;font-size:0.65rem;font-weight:600;min-width:${colW}px;
                  ${w.isCurrent?'background:#22c55e;':''}${w.isPast&&!w.isCurrent?'opacity:0.7;':''}"
                  title="${w.label}">
                  ${w.shortLabel}
                </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${_tableRow('📈 Дохід план', totals, 'planInc', '#22c55e', currency, true)}
            ${_tableRow('✅ Дохід факт', totals, 'actInc',  '#16a34a', currency, false)}
            ${_tableRow('📉 Витрати план', totals, 'planExp', '#ef4444', currency, true)}
            ${_tableRow('❌ Витрати факт', totals, 'actExp',  '#dc2626', currency, false)}
            ${_profitRow(totals, currency)}
          </tbody>
        </table>
      </div>
      <div style="padding:8px 12px;background:#f9fafb;font-size:0.72rem;color:#9ca3af;display:flex;align-items:center;gap:16px;">
        <span>💡 Клікніть на планову суму щоб відредагувати</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block;"></span> Поточний тиждень</span>
      </div>
    </div>`;

  // ── Ганта знизу ──
  const ganttHtml = `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <div style="padding:10px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;">
        <div style="font-size:0.85rem;font-weight:700;color:#1a1a1a;">📊 Діаграма Ганта — доходи / витрати по тижнях</div>
        <div style="display:flex;gap:10px;font-size:0.72rem;">
          <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:8px;border-radius:2px;background:#22c55e;display:inline-block;"></span> Дохід план</span>
          <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:8px;border-radius:2px;background:#86efac;display:inline-block;"></span> Дохід факт</span>
          <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:8px;border-radius:2px;background:#ef4444;display:inline-block;"></span> Витрати план</span>
          <span style="display:flex;align-items:center;gap:4px;"><span style="width:12px;height:8px;border-radius:2px;background:#fca5a5;display:inline-block;"></span> Витрати факт</span>
        </div>
      </div>
      <div style="overflow-x:auto;padding:12px;">
        <div style="min-width:${120 + weeks.length * colW}px;">
          ${_ganttRows(totals, maxVal, colW)}
        </div>
      </div>
    </div>`;

  // ── Кнопки дій ──
  const actionsHtml = `
    <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:16px;">
      <button onclick="window._wpSave()"
        style="padding:0.5rem 1.2rem;background:#22c55e;color:#fff;border:none;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Зберегти план
      </button>
      <select id="wpHorizonSel" onchange="window._wpChangeHorizon(this.value)"
        style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.83rem;background:#fff;cursor:pointer;">
        <option value="26" ${WP.horizon===26?'selected':''}>6 місяців (26 тижнів)</option>
        <option value="32" ${WP.horizon===32?'selected':''}>8 місяців (32 тижні)</option>
        <option value="20" ${WP.horizon===20?'selected':''}>5 місяців (20 тижнів)</option>
      </select>
      <button onclick="window._wpFillFromAvg()"
        style="padding:0.5rem 1rem;border:1px solid #e5e7eb;border-radius:8px;background:#fff;font-size:0.83rem;color:#374151;cursor:pointer;">
        🤖 Заповнити з середнього за 3M
      </button>
      <button onclick="window._wpClearAll()"
        style="padding:0.5rem 1rem;border:1px solid #fecaca;border-radius:8px;background:#fff;font-size:0.83rem;color:#ef4444;cursor:pointer;">
        Очистити план
      </button>
    </div>`;

  root.innerHTML = kpiHtml + actionsHtml + tableHtml + ganttHtml;
}

// ── Рядок таблиці ──────────────────────────────────────────
function _tableRow(label, totals, field, color, currency, editable) {
  return `
    <tr>
      <td style="padding:7px 12px;font-size:0.78rem;color:#374151;font-weight:600;
        position:sticky;left:0;background:#fff;border-bottom:1px solid #f3f4f6;z-index:1;">${label}</td>
      ${totals.map(w => {
        const val = w[field] || 0;
        const key = w.key;
        const fld = field.startsWith('plan') ? (field==='planInc'?'income':'expense') : null;
        if (editable && fld) {
          return `<td style="padding:4px;border-bottom:1px solid #f3f4f6;${w.isCurrent?'background:#f0fdf4;':''}">
            <input type="number" value="${val||''}" min="0" step="100"
              data-wp-key="${key}" data-wp-field="${fld}"
              onchange="window._wpCellChange(this)"
              style="width:100%;padding:3px 5px;border:1px solid #e5e7eb;border-radius:5px;
                font-size:0.75rem;text-align:right;outline:none;background:transparent;box-sizing:border-box;"
              onfocus="this.style.borderColor='#22c55e';this.style.background='#fff';"
              onblur="this.style.borderColor='#e5e7eb';this.style.background='transparent';">
          </td>`;
        }
        return `<td style="padding:5px 4px;text-align:right;font-size:0.72rem;color:${val>0?color:'#d1d5db'};
          border-bottom:1px solid #f3f4f6;${w.isCurrent?'background:#f0fdf4;':''}">
          ${val > 0 ? _fmtShort(val) : '—'}
        </td>`;
      }).join('')}
    </tr>`;
}

function _profitRow(totals, currency) {
  return `
    <tr style="background:#f8fafc;">
      <td style="padding:7px 12px;font-size:0.78rem;color:#1a1a1a;font-weight:700;
        position:sticky;left:0;background:#f8fafc;border-top:2px solid #e5e7eb;z-index:1;">💰 Прибуток план</td>
      ${totals.map(w => {
        const v = w.planProfit;
        const c = v >= 0 ? '#22c55e' : '#ef4444';
        return `<td style="padding:5px 4px;text-align:right;font-size:0.72rem;font-weight:700;color:${v!==0?c:'#d1d5db'};
          border-top:2px solid #e5e7eb;${w.isCurrent?'background:#f0fdf4;':''}">
          ${v !== 0 ? (v>0?'+':'')+_fmtShort(v) : '—'}
        </td>`;
      }).join('')}
    </tr>`;
}

// ── Ганта ──────────────────────────────────────────────────
function _ganttRows(totals, maxVal, colW) {
  const BAR_H = 18;

  // Місячні групи для заголовків
  const months = {};
  totals.forEach((w,i) => {
    const mo = w.from.toLocaleDateString(_getLocale(), {month:'short',year:'numeric'});
    if (!months[mo]) months[mo] = { start:i, count:0 };
    months[mo].count++;
  });

  const monthHeader = Object.entries(months).map(([mo, {start, count}]) =>
    `<div style="position:absolute;left:${120+start*colW}px;width:${count*colW}px;
      font-size:0.68rem;font-weight:600;color:#6b7280;text-align:center;padding:2px 0;
      border-right:1px solid #e5e7eb;">${mo}</div>`
  ).join('');

  const bars = totals.map((w, i) => {
    const x = 120 + i * colW;
    const pInc = maxVal > 0 ? (w.planInc / maxVal * 120) : 0;
    const aInc = maxVal > 0 ? (w.actInc  / maxVal * 120) : 0;
    const pExp = maxVal > 0 ? (w.planExp / maxVal * 120) : 0;
    const aExp = maxVal > 0 ? (w.actExp  / maxVal * 120) : 0;

    const barW = colW - 4;
    const halfW = Math.floor(barW / 2) - 1;

    return `
      <!-- Тиждень ${w.shortLabel} -->
      <!-- Дохід план -->
      <div style="position:absolute;left:${x+1}px;bottom:${BAR_H*2+4}px;width:${halfW}px;height:${Math.max(1,pInc)}px;
        background:#22c55e;border-radius:2px 2px 0 0;opacity:0.9;"
        title="Дохід план: ${_fmt(w.planInc,WP.currency)}"></div>
      <!-- Дохід факт -->
      ${w.isPast || w.isCurrent ? `<div style="position:absolute;left:${x+1}px;bottom:${BAR_H*2+4}px;width:${halfW}px;height:${Math.max(1,aInc)}px;
        background:#86efac;border-radius:2px 2px 0 0;border:1.5px solid #22c55e;"
        title="Дохід факт: ${_fmt(w.actInc,WP.currency)}"></div>` : ''}
      <!-- Витрати план -->
      <div style="position:absolute;left:${x+halfW+3}px;bottom:${BAR_H*2+4}px;width:${halfW}px;height:${Math.max(1,pExp)}px;
        background:#ef4444;border-radius:2px 2px 0 0;opacity:0.9;"
        title="Витрати план: ${_fmt(w.planExp,WP.currency)}"></div>
      <!-- Витрати факт -->
      ${w.isPast || w.isCurrent ? `<div style="position:absolute;left:${x+halfW+3}px;bottom:${BAR_H*2+4}px;width:${halfW}px;height:${Math.max(1,aExp)}px;
        background:#fca5a5;border-radius:2px 2px 0 0;border:1.5px solid #ef4444;"
        title="Витрати факт: ${_fmt(w.actExp,WP.currency)}"></div>` : ''}
      <!-- Поточний тиждень маркер -->
      ${w.isCurrent ? `<div style="position:absolute;left:${x}px;top:0;bottom:0;width:${colW}px;
        background:rgba(34,197,94,0.06);border-left:2px solid #22c55e;pointer-events:none;"></div>` : ''}`;
  }).join('');

  const totalH = 160; // висота діаграми
  const labelH = 24;

  const weekLabels = totals.map((w,i) => `
    <div style="position:absolute;left:${120+i*colW}px;bottom:0;width:${colW}px;
      font-size:0.6rem;color:${w.isCurrent?'#22c55e':'#9ca3af'};text-align:center;
      overflow:hidden;white-space:nowrap;padding:0 2px;">
      ${w.shortLabel}
    </div>`).join('');

  // Y-axis мітки
  const yLabels = [0,25,50,75,100].map(pct => `
    <div style="position:absolute;left:0;width:115px;bottom:${labelH + BAR_H*2 + 4 + pct*1.2}px;
      font-size:0.62rem;color:#d1d5db;text-align:right;padding-right:4px;">
      ${pct > 0 ? _fmtShort(maxVal * pct/100) : '0'}
    </div>`).join('');

  return `
    <div style="position:relative;height:${totalH}px;width:100%;">
      <!-- Місяці заголовок -->
      <div style="position:absolute;top:0;left:0;right:0;height:18px;">${monthHeader}</div>
      <!-- Базова лінія -->
      <div style="position:absolute;left:120px;right:0;bottom:${labelH + BAR_H*2 + 4}px;height:1px;background:#e5e7eb;"></div>
      <!-- Y labels -->
      ${yLabels}
      <!-- Bars -->
      ${bars}
      <!-- Week labels -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${labelH}px;">${weekLabels}</div>
    </div>`;
}

// ── Інтерактивні дії ───────────────────────────────────────
window._wpCellChange = function(input) {
  const key   = input.dataset.wpKey;
  const field = input.dataset.wpField; // 'income' | 'expense'
  const val   = parseFloat(input.value) || 0;
  if (!WP.plan[key]) WP.plan[key] = { income:0, expense:0 };
  WP.plan[key][field] = val;

  // Оновлюємо лише підсумкові KPI без повного перерендеру
  _refreshKpi();
};

window._wpSave = async function() {
  if (WP.saving) return;
  WP.saving = true;
  const btn = document.querySelector('[onclick="_wpSave()"]') ||
    [...document.querySelectorAll('button')].find(b => b.textContent.includes('Зберегти план'));
  if (btn) { btn.disabled = true; btn.textContent = 'Збереження...'; }
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) throw new Error('DB не готова');
    await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_settings').doc('weekly_plan')
      .set({ plan: WP.plan, horizon: WP.horizon, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    if (typeof showToast === 'function') showToast('✅ Тижневий план збережено', 'success');
  } catch(e) {
    if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
  } finally {
    WP.saving = false;
    if (btn) { btn.disabled = false; btn.textContent = '✓ Зберегти план'; }
  }
};

window._wpChangeHorizon = function(val) {
  WP.horizon = parseInt(val);
  WP.weeks   = _buildWeeks(WP.horizon);
  const root = document.getElementById('weeklyPlanRoot');
  if (root) _render(root);
};

window._wpFillFromAvg = async function() {
  // Рахуємо середній тиждень за останні 3 місяці
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return;
    const from3M = new Date(); from3M.setMonth(from3M.getMonth()-3);
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_transactions')
      .where('date', '>=', firebase.firestore.Timestamp.fromDate(from3M)).get();
    const txs = snap.docs.map(d => d.data());
    const weeks3 = _buildWeeks(13, from3M); // 13 тижнів = 3M
    let totalInc = 0, totalExp = 0, count = 0;
    weeks3.forEach(w => {
      const wInc = txs.filter(t => t.type==='income' && _txInWeek(t, w)).reduce((s,t) => s+_txAmt(t),0);
      const wExp = txs.filter(t => t.type==='expense' && _txInWeek(t, w)).reduce((s,t) => s+_txAmt(t),0);
      if (wInc > 0 || wExp > 0) { totalInc += wInc; totalExp += wExp; count++; }
    });
    const avgInc = count > 0 ? Math.round(totalInc / count / 100) * 100 : 0;
    const avgExp = count > 0 ? Math.round(totalExp / count / 100) * 100 : 0;
    if (avgInc === 0 && avgExp === 0) {
      if (typeof showToast === 'function') showToast('Недостатньо даних за 3 місяці', 'warning');
      return;
    }
    // Заповнюємо тільки майбутні тижні
    const now = new Date();
    WP.weeks.forEach(w => {
      if (w.from >= now) {
        if (!WP.plan[w.key]) WP.plan[w.key] = { income:0, expense:0 };
        if (WP.plan[w.key].income === 0) WP.plan[w.key].income = avgInc;
        if (WP.plan[w.key].expense === 0) WP.plan[w.key].expense = avgExp;
      }
    });
    const root = document.getElementById('weeklyPlanRoot');
    if (root) _render(root);
    if (typeof showToast === 'function') showToast(`Заповнено: дохід ~${_fmt(avgInc,WP.currency)}/тиж, витрати ~${_fmt(avgExp,WP.currency)}/тиж`, 'success');
  } catch(e) {
    if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
  }
};

window._wpClearAll = async function() {
  const ok = typeof showConfirmModal === 'function'
    ? await showConfirmModal('Очистити весь тижневий план?', { danger:true })
    : confirm('Очистити весь тижневий план?');
  if (!ok) return;
  WP.plan = {};
  const root = document.getElementById('weeklyPlanRoot');
  if (root) _render(root);
};

// ── KPI оновлення (без повного перерендеру) ───────────────
function _refreshKpi() {
  const weeks = WP.weeks;
  const totalPlanInc = weeks.reduce((s,w) => s + (WP.plan[w.key]?.income||0), 0);
  const totalPlanExp = weeks.reduce((s,w) => s + (WP.plan[w.key]?.expense||0), 0);
  // Знаходимо KPI картки і оновлюємо
  const cards = document.querySelectorAll('#weeklyPlanRoot [style*="border-radius:10px"]');
  if (cards[0]) cards[0].querySelector('[style*="font-weight:700"]').textContent = _fmt(totalPlanInc,WP.currency);
  if (cards[1]) cards[1].querySelector('[style*="font-weight:700"]').textContent = _fmt(totalPlanExp,WP.currency);
  if (cards[2]) {
    const prof = totalPlanInc - totalPlanExp;
    const el = cards[2].querySelector('[style*="font-weight:700"]');
    if (el) { el.textContent = _fmt(prof,WP.currency); el.style.color = prof>=0?'#22c55e':'#ef4444'; }
  }
}

// ── Завантаження даних ─────────────────────────────────────
async function _loadPlan() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return;
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_settings').doc('weekly_plan').get();
    if (snap.exists) {
      const d = snap.data();
      WP.plan    = d.plan    || {};
      WP.horizon = d.horizon || WP.horizon;
      WP.weeks   = _buildWeeks(WP.horizon);
    }
  } catch(e) { console.warn('[weeklyPlan] loadPlan:', e.message); }
}

async function _loadActual() {
  try {
    const db = window.db || (window.firebase && firebase.firestore());
    if (!db || !window.currentCompanyId) return;
    // Беремо транзакції за горизонт (минулі + поточний тиждень)
    const now  = new Date();
    const from = WP.weeks[0]?.from || now;
    const snap = await db.collection('companies').doc(window.currentCompanyId)
      .collection('finance_transactions')
      .where('date','>=', firebase.firestore.Timestamp.fromDate(from))
      .where('date','<=', firebase.firestore.Timestamp.fromDate(now))
      .get();
    const txs = snap.docs.map(d => d.data());
    WP.actual = {};
    WP.weeks.forEach(w => {
      const wTxs = txs.filter(t => _txInWeek(t, w));
      WP.actual[w.key] = {
        income:  wTxs.filter(t=>t.type==='income').reduce((s,t)=>s+_txAmt(t),0),
        expense: wTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+_txAmt(t),0),
      };
    });
  } catch(e) { console.warn('[weeklyPlan] loadActual:', e.message); }
}

// ── Хелпери ────────────────────────────────────────────────
function _buildWeeks(count, startFrom) {
  const weeks = [];
  const now   = startFrom || new Date();
  // Починаємо з поточного/стартового понеділка
  const start = new Date(now);
  const day   = start.getDay();
  const diff  = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0,0,0,0);

  for (let i = 0; i < count; i++) {
    const from = new Date(start);
    from.setDate(from.getDate() + i*7);
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    to.setHours(23,59,59,999);

    const yr  = from.getFullYear();
    const wn  = _weekNum(from);
    const key = `${yr}-W${String(wn).padStart(2,'0')}`;

    const locale = _getLocale();
    const label  = from.toLocaleDateString(locale,{day:'numeric',month:'short'}) + '–' +
                   to.toLocaleDateString(locale,{day:'numeric',month:'short'});
    const shortLabel = from.toLocaleDateString(locale,{day:'numeric',month:'numeric'});

    weeks.push({ key, label, shortLabel, from, to });
  }
  return weeks;
}

function _weekNum(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}

function _txInWeek(tx, w) {
  const d = tx.date?.toDate ? tx.date.toDate() : (tx.date ? new Date(tx.date) : null);
  if (!d) return false;
  return d >= w.from && d <= w.to;
}

function _txAmt(tx) {
  return tx.amountBase || tx.amount || 0;
}

function _getCurrency() {
  return window.currentCompanyData?.currency || window.financeState?.currency || 'UAH';
}

function _getLocale() {
  return window.getLocale ? window.getLocale() : 'uk-UA';
}

function _fmt(n, currency) {
  try {
    return new Intl.NumberFormat(_getLocale(), {style:'currency',currency:currency||'UAH',maximumFractionDigits:0}).format(n||0);
  } catch(e) { return (n||0).toLocaleString(); }
}

function _fmtShort(n) {
  if (Math.abs(n) >= 1000000) return (n/1000000).toFixed(1)+'M';
  if (Math.abs(n) >= 1000) return (n/1000).toFixed(0)+'K';
  return String(Math.round(n));
}

function _skeleton() {
  return `<div style="display:flex;align-items:center;justify-content:center;padding:3rem;color:#9ca3af;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;margin-right:8px;">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
    Завантаження тижневого плану...
  </div>`;
}

console.log('[weeklyPlan] Module loaded v1.0');

})();
