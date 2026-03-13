// ============================================================
// 78-crm-todo.js — CRM "Що робити зараз" (Todo / Action List)
// AmoCRM-style task list with mandatory next action
// ============================================================
(function () {
'use strict';

// ── SVG Icons (local) ──────────────────────────────────────
const TI = {
    phone:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    tg:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    clock:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    check:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    close:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    plus:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    warn:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    note:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    arrow:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    refresh: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    sms:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    user:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
};

const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const _t   = k => (window.t && window.t(k)) || k;

// ── Helpers ────────────────────────────────────────────────
function _todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function _tomorrowStr() {
    const d = new Date(); d.setDate(d.getDate()+1);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function _fmtDate(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const today = new Date(); today.setHours(0,0,0,0);
    const dd = new Date(d); dd.setHours(0,0,0,0);
    const diff = Math.round((dd - today) / 86400000);
    const time = d.toLocaleTimeString(window.getLocale ? window.getLocale() : 'uk-UA', {hour:'2-digit',minute:'2-digit'});
    if (diff < 0)  return { label: Math.abs(diff) + ' дн. тому', time, overdue: true, today: false };
    if (diff === 0) return { label: 'Сьогодні', time, overdue: false, today: true };
    if (diff === 1) return { label: 'Завтра', time, overdue: false, today: false };
    const locale = window.getLocale ? window.getLocale() : 'uk-UA';
    return { label: d.toLocaleDateString(locale, {day:'numeric',month:'short'}), time, overdue: false, today: false };
}

function _fmtDateShort(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const locale = window.getLocale ? window.getLocale() : 'uk-UA';
    return d.toLocaleDateString(locale, {day:'numeric',month:'short'}) + ' ' +
           d.toLocaleTimeString(locale, {hour:'2-digit',minute:'2-digit'});
}

// Отримує угоди для "Що робити зараз"
// Критерії: nextActionDate <= now + 1 день  АБО  немає nextActionDate і updatedAt > 3 днів тому
function _getTodayDeals() {
    if (!window.crm || !window.crm.deals) return [];
    const crm = window.crm;
    const now   = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1); tomorrow.setHours(23,59,59,999);
    const active = ['new','contact','negotiation','proposal','won'].includes;

    return window.crm.deals.filter(d => {
        if (d.stage === 'lost') return false; // втрачені не показуємо
        if (d.nextActionDate) {
            const nad = d.nextActionDate.toDate ? d.nextActionDate.toDate() : new Date(d.nextActionDate);
            return nad <= tomorrow;
        }
        // Немає nextActionDate — показуємо всі активні (не won/lost)
        return d.stage !== 'won';
    });
}

// Сортування: прострочені (від найстаріших) → сьогодні → завтра
function _sortDeals(deals) {
    const now = new Date();
    return [...deals].sort((a, b) => {
        const toTs = d => d.nextActionDate ? (d.nextActionDate.toDate ? d.nextActionDate.toDate() : new Date(d.nextActionDate)) : new Date(0);
        return toTs(a) - toTs(b);
    });
}

// ── Helper: pipeline move button (уникаємо nested template literals) ──
function _crmTodoPipelineBtnHtml(dealId) {
    const crmObj = window.crm;
    if (!crmObj || !crmObj.pipelines || crmObj.pipelines.length <= 1) return '';
    const otherPipelines = crmObj.pipelines.filter(p => p.id !== crmObj.pipeline?.id);
    if (!otherPipelines.length) return '';
    const items = otherPipelines.map(p =>
        '<button onclick="_crmTodoMoveToPipeline(\'' + dealId + '\',\'' + p.id + '\',\'' + _esc(p.name) + '\')"' +
        ' style="width:100%;text-align:left;padding:0.5rem 0.75rem;border:none;background:none;' +
        'font-size:0.82rem;color:#374151;cursor:pointer;border-radius:7px;display:flex;align-items:center;gap:6px;"' +
        ' onmouseover="this.style.background=\'#f3f4f6\'" onmouseout="this.style.background=\'none\'">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        _esc(p.name) + '</button>'
    ).join('');
    return '<div style="position:relative;display:inline-block;">' +
        '<button onclick="_crmTodoTogglePipelineMenu(\'' + dealId + '\',this)"' +
        ' style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;' +
        'border:1.5px solid #8b5cf6;background:#faf5ff;color:#7c3aed;' +
        'font-size:0.8rem;font-weight:600;cursor:pointer;">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>' +
        '→ Воронка</button>' +
        '<div id="pipelineMenu_' + dealId + '" style="display:none;position:absolute;bottom:calc(100% + 4px);left:0;' +
        'background:white;border:1px solid #e5e7eb;border-radius:10px;' +
        'box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:180px;z-index:10100;padding:0.3rem;">' +
        items +
        '</div></div>';
}

// ── Render ─────────────────────────────────────────────────
window.renderCrmTodo = function() {
    const el = document.getElementById('crmViewTodo');
    if (!el) return;

    const all     = _getTodayDeals();
    const sorted  = _sortDeals(all);
    const filter  = window._crmTodoFilter || '';

    // Визначаємо стадії для фільтра
    const stages  = (window.crm?.pipeline?.stages) || [];

    // Застосовуємо фільтр
    const deals   = filter ? sorted.filter(d => d.stage === filter) : sorted;

    // Підрахунок по групах
    const now = new Date(); now.setHours(0,0,0,0);
    const overdue = sorted.filter(d => {
        if (!d.nextActionDate) return false;
        const ts = d.nextActionDate.toDate ? d.nextActionDate.toDate() : new Date(d.nextActionDate);
        return ts < now;
    });
    const today = sorted.filter(d => {
        if (!d.nextActionDate) return false;
        const ts = d.nextActionDate.toDate ? d.nextActionDate.toDate() : new Date(d.nextActionDate);
        const dd = new Date(ts); dd.setHours(0,0,0,0);
        return dd.getTime() === now.getTime();
    });
    const noAction = sorted.filter(d => !d.nextActionDate);

    el.innerHTML = `
    <div style="padding:1rem;max-width:1100px;margin:0 auto;">

      <!-- Хедер -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <span style="font-size:1rem;font-weight:700;color:#1a1a1a;">${_t('crmTodoTitle')}</span>
          <span style="background:#ef4444;color:#fff;border-radius:10px;padding:2px 8px;font-size:0.72rem;font-weight:700;">${sorted.length}</span>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <button onclick="renderCrmTodo()" title="Оновити"
            style="background:none;border:1px solid #e5e7eb;border-radius:6px;padding:5px 8px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">
            ${TI.refresh}
          </button>
          <button onclick="crmOpenCreateDeal()"
            style="background:#22c55e;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:0.82rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.35rem;">
            ${TI.plus} ${_t('crmTodoNewLead')}
          </button>
        </div>
      </div>

      <!-- Лічильники -->
      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
        ${overdue.length ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:4px 10px;font-size:0.75rem;color:#dc2626;font-weight:600;">
          ${TI.warn} <span style="margin-left:3px;">${overdue.length} прострочено</span></div>` : ''}
        ${today.length ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:4px 10px;font-size:0.75rem;color:#ea580c;font-weight:600;">
          ${TI.clock} <span style="margin-left:3px;">${today.length} на сьогодні</span></div>` : ''}
        ${noAction.length ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:4px 10px;font-size:0.75rem;color:#6b7280;">
          ${noAction.length} без дії</div>` : ''}
      </div>

      <!-- Фільтр по стадіях -->
      <div style="display:flex;gap:0.35rem;margin-bottom:0.75rem;overflow-x:auto;padding-bottom:2px;flex-wrap:wrap;">
        <button onclick="window._crmTodoFilter='';renderCrmTodo()"
          style="padding:4px 12px;border-radius:20px;border:1px solid ${!filter?'#22c55e':'#e5e7eb'};
          background:${!filter?'#f0fdf4':'white'};color:${!filter?'#16a34a':'#6b7280'};
          font-size:0.75rem;font-weight:${!filter?'700':'500'};cursor:pointer;white-space:nowrap;">
          Всі <span style="margin-left:3px;">${sorted.length}</span>
        </button>
        ${stages.filter(s => s.id !== 'lost').map(s => {
            const cnt = sorted.filter(d => d.stage === s.id).length;
            if (!cnt) return '';
            const active = filter === s.id;
            return `<button onclick="window._crmTodoFilter='${s.id}';renderCrmTodo()"
              style="padding:4px 12px;border-radius:20px;border:1px solid ${active ? s.color||'#22c55e' : '#e5e7eb'};
              background:${active ? (s.color||'#22c55e')+'18' : 'white'};
              color:${active ? s.color||'#22c55e' : '#6b7280'};
              font-size:0.75rem;font-weight:${active?'700':'500'};cursor:pointer;white-space:nowrap;">
              ${_esc(s.label)} <span style="margin-left:3px;">${cnt}</span>
            </button>`;
        }).join('')}
      </div>

      <!-- Список угод -->
      <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
        ${deals.length === 0 ? `
          <div style="padding:3rem;text-align:center;color:#9ca3af;">
            <div style="font-size:2rem;margin-bottom:0.5rem;">✓</div>
            <div style="font-weight:600;color:#374151;">${_t('crmTodoEmpty')}</div>
            <div style="font-size:0.82rem;margin-top:0.25rem;">${_t('crmTodoEmptyHint')}</div>
          </div>` : deals.map((d, i) => _renderTodoRow(d, i)).join('')}
      </div>
    </div>`;
};

function _renderTodoRow(d, i) {
    const hasNext  = d.nextActionDate;
    const fmt      = hasNext ? _fmtDate(d.nextActionDate) : null;
    const isOvd    = fmt?.overdue;
    const isToday  = fmt?.today;

    // Стадія
    const stages   = (window.crm?.pipeline?.stages) || [];
    const stageObj = stages.find(s => s.id === d.stage);
    const stageColor = stageObj?.color || '#6b7280';
    const stageLabel = stageObj?.label || d.stage;

    // Контакт
    const phone    = d.phone || '';
    const tg       = d.telegram || '';
    const name     = d.clientName || d.title || '(без імені)';
    const niche    = d.clientNiche || d.niche || '';
    const score    = d.dealScore || d.score || '';

    // Наступна дія
    const nextText = d.nextActionText || '';
    const noAction = !hasNext;

    const rowBg = i % 2 === 0 ? '#fff' : '#fafafa';
    const leftBorder = isOvd ? '#ef4444' : isToday ? '#f97316' : noAction ? '#9ca3af' : '#22c55e';

    return `
    <div onclick="crmTodoOpenCard('${d.id}')"
      style="display:flex;align-items:center;gap:0.75rem;padding:0.7rem 1rem;
        border-bottom:1px solid #f3f4f6;background:${rowBg};cursor:pointer;
        border-left:3px solid ${leftBorder};transition:background 0.1s;"
      onmouseover="this.style.background='#f0fdf4'"
      onmouseout="this.style.background='${rowBg}'">

      <!-- Час/дата -->
      <div style="min-width:72px;text-align:center;">
        ${hasNext ? `
          <div style="font-size:0.82rem;font-weight:700;color:${isOvd?'#ef4444':isToday?'#f97316':'#374151'};">${fmt.time}</div>
          <div style="font-size:0.68rem;color:${isOvd?'#ef4444':'#9ca3af'};white-space:nowrap;">${fmt.label}</div>
        ` : `<div style="font-size:0.68rem;color:#9ca3af;">—</div>`}
      </div>

      <!-- Ім'я + наступна дія -->
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.85rem;font-weight:600;color:#111827;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(name)}</div>
        ${nextText ? `<div style="font-size:0.75rem;color:#6b7280;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(nextText)}</div>` :
          `<div style="font-size:0.75rem;color:#ef4444;font-style:italic;">Дія не заповнена!</div>`}
      </div>

      <!-- Контакти -->
      <div style="display:flex;gap:0.35rem;align-items:center;min-width:0;flex-shrink:0;">
        ${phone ? `<a href="tel:${_esc(phone)}" onclick="event.stopPropagation()"
          style="color:#374151;font-size:0.75rem;display:flex;align-items:center;gap:2px;
          text-decoration:none;background:#f3f4f6;border-radius:4px;padding:2px 6px;white-space:nowrap;">
          ${TI.phone} ${_esc(phone.replace(/(\+38|38)/, ''))}</a>` : ''}
        ${tg ? `<span style="color:#374151;font-size:0.75rem;display:flex;align-items:center;gap:2px;
          background:#f0f9ff;border-radius:4px;padding:2px 6px;white-space:nowrap;">
          ${TI.tg} ${_esc(tg)}</span>` : ''}
      </div>

      <!-- Ніша -->
      ${niche ? `<div style="font-size:0.72rem;color:#9ca3af;max-width:100px;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0;">${_esc(niche)}</div>` : ''}

      <!-- Бал -->
      ${score ? `<div style="font-size:0.75rem;font-weight:600;color:#374151;
        background:#f3f4f6;border-radius:4px;padding:2px 7px;flex-shrink:0;">${score}</div>` : ''}

      <!-- Стадія -->
      <div style="font-size:0.7rem;font-weight:600;color:${stageColor};
        background:${stageColor}18;border-radius:4px;padding:3px 8px;
        white-space:nowrap;flex-shrink:0;border:1px solid ${stageColor}33;">
        ${_esc(stageLabel)}
      </div>

      <!-- Стрілка -->
      <div style="color:#d1d5db;flex-shrink:0;">${TI.arrow}</div>
    </div>`;
}

// ── Модальне "Що сталось?" ─────────────────────────────────
window.crmTodoOpenCard = async function(dealId) {
    // Знаходимо угоду
    const deal = window.crm?.deals.find(d => d.id === dealId) ?? null;
    if (!deal) return;

    // Завантажуємо history
    let history = [];
    try {
        const snap = await window.companyRef().collection(window.DB_COLS.CRM_DEALS)
            .doc(dealId).collection('history').orderBy('at','desc').limit(10).get();
        history = snap.docs.map(d => ({id:d.id,...d.data()}));
    } catch(e) { /* no history */ }

    const stages    = (window.crm?.pipeline?.stages) || [];
    const stageObj  = stages.find(s => s.id === deal.stage);
    const stageColor = stageObj?.color || '#6b7280';
    const inp = 'width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
    const lbl = 'font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.3rem;letter-spacing:.04em;';
    const requiredMark = '<span style="color:#ef4444;margin-left:2px;">*</span>';

    // Наступна дія за замовчуванням — завтра 10:00
    const defaultNextDate = _tomorrowStr();

    document.getElementById('crmTodoCardOverlay')?.remove();

    document.body.insertAdjacentHTML('beforeend', `
    <div id="crmTodoCardOverlay" onclick="if(event.target===this)_crmTodoCloseCard()"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10050;
      display:flex;align-items:flex-start;justify-content:center;padding:1.5rem 1rem;overflow-y:auto;">
      <div style="background:#fff;border-radius:12px;width:100%;max-width:560px;
        box-shadow:0 24px 64px rgba(0,0,0,0.18);margin:auto;">

        <!-- Хедер картки -->
        <div style="padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-size:1rem;font-weight:700;color:#111827;margin-bottom:0.1rem;">
                ${_esc(deal.clientName || deal.title || '(без імені)')}
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <span style="font-size:0.72rem;font-weight:600;color:${stageColor};
                  background:${stageColor}18;border-radius:4px;padding:2px 8px;border:1px solid ${stageColor}33;">
                  ${_esc(stageObj?.label || deal.stage)}
                </span>
                ${deal.clientNiche ? `<span style="font-size:0.72rem;color:#9ca3af;">${_esc(deal.clientNiche)}</span>` : ''}
                ${deal.dealScore ? `<span style="font-size:0.72rem;font-weight:600;color:#374151;background:#f3f4f6;border-radius:4px;padding:2px 7px;">${deal.dealScore}</span>` : ''}
              </div>
            </div>
            <button onclick="_crmTodoCloseCard()"
              style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:4px;">
              ${TI.close}
            </button>
          </div>

          <!-- Контакти -->
          <div style="display:flex;gap:0.5rem;margin-top:0.65rem;flex-wrap:wrap;align-items:center;">
            ${deal.telegram ? `<a href="https://t.me/${deal.telegram.replace('@','')}" target="_blank"
              style="display:flex;align-items:center;gap:4px;background:#f0f9ff;border-radius:6px;
              padding:4px 10px;font-size:0.78rem;color:#0ea5e9;text-decoration:none;font-weight:500;">
              ${TI.tg} ${_esc(deal.telegram)}</a>` : ''}
            ${deal.phone ? `<a href="tel:${_esc(deal.phone)}"
              style="display:flex;align-items:center;gap:4px;background:#f3f4f6;border-radius:6px;
              padding:4px 10px;font-size:0.78rem;color:#374151;text-decoration:none;font-weight:500;">
              ${TI.phone} ${_esc(deal.phone)}</a>` : ''}
            ${deal.phone ? `
              <a href="https://wa.me/${deal.phone.replace(/\D/g,'')}" target="_blank"
                style="display:flex;align-items:center;gap:3px;background:#f0fdf4;border-radius:6px;
                padding:4px 8px;font-size:0.72rem;color:#16a34a;text-decoration:none;">
                WA</a>
              <a href="viber://chat?number=${deal.phone.replace(/\D/g,'')}" target="_blank"
                style="display:flex;align-items:center;gap:3px;background:#faf5ff;border-radius:6px;
                padding:4px 8px;font-size:0.72rem;color:#7c3aed;text-decoration:none;">
                Viber</a>` : ''}
          </div>

          <!-- Поточне завдання -->
          ${deal.nextActionText ? `
          <div style="margin-top:0.65rem;background:#fffbeb;border:1px solid #fde68a;border-radius:7px;
            padding:0.5rem 0.75rem;font-size:0.82rem;color:#92400e;display:flex;align-items:center;gap:0.4rem;">
            ${TI.clock}
            <span>${_esc(deal.nextActionText)}</span>
            ${deal.nextActionDate ? `<span style="margin-left:auto;font-size:0.72rem;color:#b45309;">
              ${_fmtDateShort(deal.nextActionDate)}</span>` : ''}
          </div>` : ''}
        </div>

        <!-- Примітки / Звіт -->
        ${deal.notes ? `
        <div style="padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;">
          <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;
            letter-spacing:.04em;margin-bottom:0.35rem;display:flex;align-items:center;gap:4px;cursor:pointer;"
            onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'':'none'">
            ${TI.note} Примітки/Звіт <span style="margin-left:auto;font-size:0.68rem;">▼</span>
          </div>
          <div style="font-size:0.8rem;color:#374151;line-height:1.5;max-height:120px;overflow-y:auto;
            background:#f9fafb;border-radius:6px;padding:0.5rem 0.75rem;">${_esc(deal.notes)}</div>
        </div>` : ''}

        <!-- Результат дзвінка -->
        <div style="padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;">
          <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;
            letter-spacing:.04em;margin-bottom:0.5rem;">Результат дзвінка</div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
            <button onclick="_crmTodoSelectResult('answered','${dealId}')"
              id="crmTodoBtn_answered"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;
              border:1.5px solid #22c55e;background:#f0fdf4;color:#16a34a;
              font-size:0.8rem;font-weight:600;cursor:pointer;">
              ${TI.check} Взяв трубку
            </button>
            <button onclick="_crmTodoSelectResult('missed','${dealId}')"
              id="crmTodoBtn_missed"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;
              border:1.5px solid #e5e7eb;background:#fff;color:#ef4444;
              font-size:0.8rem;font-weight:600;cursor:pointer;">
              ${TI.phone} Не взяв
            </button>
            <button onclick="_crmTodoSelectResult('sms','${dealId}')"
              id="crmTodoBtn_sms"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;
              border:1.5px solid #e5e7eb;background:#fff;color:#374151;
              font-size:0.8rem;font-weight:500;cursor:pointer;">
              ${TI.sms} SMS
            </button>
            <button onclick="_crmTodoSelectResult('callback','${dealId}')"
              id="crmTodoBtn_callback"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;
              border:1.5px solid #e5e7eb;background:#fff;color:#374151;
              font-size:0.8rem;font-weight:500;cursor:pointer;">
              ${TI.refresh} Передзвонити
            </button>
          </div>
        </div>

        <!-- Динамічна форма деталей (з'являється після вибору результату) -->
        <div id="crmTodoDetailForm" style="display:none;padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;"></div>

        <!-- БЛОК НАСТУПНОЇ ДІЇ — завжди видимий, ОБОВ'ЯЗКОВИЙ -->
        <div style="padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;background:#f9fafb;">
          <div style="font-size:0.7rem;font-weight:700;color:#1a1a1a;text-transform:uppercase;
            letter-spacing:.04em;margin-bottom:0.5rem;display:flex;align-items:center;gap:4px;">
            ${TI.arrow}
            Наступна дія ${requiredMark}
            <span id="crmTodoNextActionError" style="display:none;color:#ef4444;font-size:0.68rem;
              font-weight:500;text-transform:none;margin-left:4px;">— обов'язково заповніть!</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <div>
              <label style="${lbl}">Що зробити${requiredMark}</label>
              <input id="crmTodoNextText" placeholder="напр. Уточнити рішення після консультації"
                style="${inp}" oninput="_crmTodoValidate()"
                value="${_esc(deal.nextActionText||'')}">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
              <div>
                <label style="${lbl}">Дата${requiredMark}</label>
                <input id="crmTodoNextDate" type="date" style="${inp}" oninput="_crmTodoValidate()"
                  value="${deal.nextActionDate ? (deal.nextActionDate.toDate ? deal.nextActionDate.toDate() : new Date(deal.nextActionDate)).toISOString().split('T')[0] : defaultNextDate}">
              </div>
              <div>
                <label style="${lbl}">Час</label>
                <input id="crmTodoNextTime" type="time" style="${inp}"
                  value="${deal.nextActionDate ? (deal.nextActionDate.toDate ? deal.nextActionDate.toDate() : new Date(deal.nextActionDate)).toTimeString().slice(0,5) : '10:00'}">
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки дій -->
        <div style="padding:0.75rem 1.25rem;display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <!-- Ліва група дій -->
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
            <button onclick="_crmTodoCreateLead('${dealId}')"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;
              border:1.5px solid #3b82f6;background:#eff6ff;color:#1d4ed8;
              font-size:0.8rem;font-weight:600;cursor:pointer;">
              ${TI.plus} ${TI.user} Новий лід
            </button>
            ${_crmTodoPipelineBtnHtml(dealId)}
          </div>

          <div style="display:flex;gap:0.4rem;">
            <button onclick="_crmTodoCloseCard()"
              style="padding:7px 14px;border-radius:7px;border:1px solid #e5e7eb;
              background:#fff;color:#374151;font-size:0.82rem;cursor:pointer;">
              Скасувати
            </button>
            <button id="crmTodoSaveBtn" onclick="_crmTodoSave('${dealId}')"
              disabled
              style="padding:7px 18px;border-radius:7px;border:none;
              background:#d1d5db;color:#9ca3af;font-size:0.82rem;font-weight:600;cursor:not-allowed;
              transition:all 0.15s;">
              Зберегти
            </button>
          </div>
        </div>

        <!-- Історія -->
        ${history.length ? `
        <div style="padding:0.75rem 1.25rem;border-top:1px solid #f1f5f9;">
          <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;
            letter-spacing:.04em;margin-bottom:0.5rem;">Історія</div>
          ${history.slice(0,5).map(h => `
            <div style="display:flex;gap:0.5rem;align-items:flex-start;padding:0.3rem 0;border-bottom:1px solid #f9fafb;">
              <div style="font-size:0.7rem;color:#9ca3af;white-space:nowrap;min-width:80px;">
                ${h.at ? _fmtDateShort(h.at) : '—'}</div>
              <div style="font-size:0.75rem;color:#374151;">${_esc(h.text||h.type||'')}</div>
              ${h.by ? `<div style="font-size:0.68rem;color:#9ca3af;margin-left:auto;">${_esc(h.by)}</div>` : ''}
            </div>`).join('')}
        </div>` : ''}

      </div>
    </div>`);

    // Зберігаємо поточний стан в overlay
    document.getElementById('crmTodoCardOverlay')._dealId = dealId;
    document.getElementById('crmTodoCardOverlay')._result = null;

    // Запускаємо валідацію — якщо nextText вже заповнений, активуємо кнопку
    _crmTodoValidate();
};

// ── Вибір результату дзвінка ──────────────────────────────
window._crmTodoSelectResult = function(type, dealId) {
    const overlay = document.getElementById('crmTodoCardOverlay');
    if (overlay) overlay._result = type;

    // Підсвічуємо активну кнопку
    ['answered','missed','sms','callback'].forEach(t => {
        const btn = document.getElementById('crmTodoBtn_' + t);
        if (!btn) return;
        const isActive = t === type;
        btn.style.borderColor = isActive ? '#22c55e' : '#e5e7eb';
        btn.style.background  = isActive ? '#f0fdf4' : '#fff';
        btn.style.color = isActive ? '#16a34a' : (t === 'missed' ? '#ef4444' : '#374151');
    });

    const form = document.getElementById('crmTodoDetailForm');
    if (!form) return;
    const deal = window.crm?.deals.find(d => d.id === dealId) ?? null;
    const stages = (window.crm?.pipeline?.stages) || [];
    const inp = 'width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
    const lbl = 'font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.3rem;letter-spacing:.04em;';

    form.style.display = 'block';

    if (type === 'answered') {
        form.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <div>
              <label style="${lbl}">Новий статус воронки</label>
              <select id="crmTodoNewStage" style="${inp}background:white;cursor:pointer;" onchange="_crmTodoValidate()">
                ${stages.filter(s=>s.id!=='lost').map(s =>
                    `<option value="${s.id}" ${deal?.stage===s.id?'selected':''}>${_esc(s.label)}</option>`
                ).join('')}
              </select>
            </div>
            <div>
              <label style="${lbl}">Що домовились?</label>
              <textarea id="crmTodoAgreed" rows="2" placeholder="Коротко що обговорили і домовились..."
                style="${inp}resize:none;"></textarea>
            </div>
            <div>
              <label style="${lbl}">Нотатки/Звіт (оновити)</label>
              <textarea id="crmTodoNotes" rows="2" placeholder="Деталі розмови..."
                style="${inp}resize:none;">${_esc(deal?.notes||'')}</textarea>
            </div>
          </div>`;
    } else if (type === 'missed') {
        // Авто: наступна дія = завтра, передзвонити
        const nextDateEl = document.getElementById('crmTodoNextDate');
        const nextTextEl = document.getElementById('crmTodoNextText');
        if (nextDateEl && !nextDateEl.value) nextDateEl.value = _tomorrowStr();
        if (nextTextEl && !nextTextEl.value) nextTextEl.value = 'Передзвонити';
        form.innerHTML = `
          <div style="background:#fef2f2;border-radius:6px;padding:0.5rem 0.75rem;
            font-size:0.78rem;color:#dc2626;display:flex;align-items:center;gap:0.4rem;">
            ${TI.warn} Дата наступного контакту встановлена на завтра. Можете змінити вище.
          </div>`;
    } else if (type === 'sms') {
        form.innerHTML = `
          <div>
            <label style="${lbl}">Текст SMS</label>
            <textarea id="crmTodoSmsText" rows="2" placeholder="Текст повідомлення..."
              style="${inp}resize:none;"></textarea>
          </div>`;
    } else if (type === 'callback') {
        form.innerHTML = `
          <div>
            <label style="${lbl}">Причина / коментар</label>
            <input id="crmTodoCallbackNote" placeholder="напр. Попросив передзвонити ввечері"
              style="${inp}">
          </div>`;
    }

    _crmTodoValidate();
};

// ── Валідація — кнопка Зберегти ──────────────────────────
window._crmTodoValidate = function() {
    const btn       = document.getElementById('crmTodoSaveBtn');
    const nextText  = (document.getElementById('crmTodoNextText')?.value || '').trim();
    const nextDate  = (document.getElementById('crmTodoNextDate')?.value || '').trim();
    const errEl     = document.getElementById('crmTodoNextActionError');
    const overlay   = document.getElementById('crmTodoCardOverlay');
    const result    = overlay?._result;

    const valid = nextText.length > 0 && nextDate.length > 0;

    if (errEl) errEl.style.display = valid ? 'none' : 'inline';

    if (btn) {
        btn.disabled = !valid;
        btn.style.background   = valid ? '#22c55e' : '#d1d5db';
        btn.style.color        = valid ? '#fff'    : '#9ca3af';
        btn.style.cursor       = valid ? 'pointer' : 'not-allowed';
    }

    // Підсвічуємо поля якщо порожні
    const nextTextEl = document.getElementById('crmTodoNextText');
    const nextDateEl = document.getElementById('crmTodoNextDate');
    if (nextTextEl) nextTextEl.style.borderColor = nextText ? '#e5e7eb' : '#fca5a5';
    if (nextDateEl) nextDateEl.style.borderColor = nextDate ? '#e5e7eb' : '#fca5a5';
};

// ── Збереження ────────────────────────────────────────────
window._crmTodoSave = async function(dealId) {
    const nextText = (document.getElementById('crmTodoNextText')?.value || '').trim();
    const nextDate = (document.getElementById('crmTodoNextDate')?.value || '').trim();
    const nextTime = (document.getElementById('crmTodoNextTime')?.value || '10:00');
    const overlay  = document.getElementById('crmTodoCardOverlay');
    const result   = overlay?._result;

    // Подвійна перевірка
    if (!nextText || !nextDate) {
        _crmTodoValidate();
        if (window.showToast) showToast('Заповніть наступну дію та дату!', 'warning');
        return;
    }

    const btn = document.getElementById('crmTodoSaveBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Збереження...'; }

    try {
        const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId);

        // Формуємо дату наступної дії
        const [y,m,d] = nextDate.split('-').map(Number);
        const [hh,mm] = nextTime.split(':').map(Number);
        const nextActionDate = new Date(y, m-1, d, hh, mm, 0);

        // Базові оновлення
        const updates = {
            nextActionText: nextText,
            nextActionDate: nextActionDate,
            lastActivityDate: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        // Доп. поля залежно від результату
        const histEntry = {
            at: firebase.firestore.FieldValue.serverTimestamp(),
            by: window.currentUser?.email || 'manager',
            nextActionText: nextText,
            nextActionDate: nextActionDate,
        };

        if (result === 'answered') {
            const newStage = document.getElementById('crmTodoNewStage')?.value;
            const agreed   = (document.getElementById('crmTodoAgreed')?.value || '').trim();
            const notes    = document.getElementById('crmTodoNotes')?.value || '';
            if (newStage) updates.stage = newStage;
            if (notes)    updates.notes = notes;
            histEntry.type = 'call_answered';
            histEntry.text = agreed || 'Взяв трубку';
            if (agreed) histEntry.agreed = agreed;

        } else if (result === 'missed') {
            histEntry.type = 'call_missed';
            histEntry.text = 'Не взяв трубку';

        } else if (result === 'sms') {
            const smsText = (document.getElementById('crmTodoSmsText')?.value || '').trim();
            histEntry.type = 'sms_sent';
            histEntry.text = smsText ? 'SMS: ' + smsText : 'SMS відправлено';

        } else if (result === 'callback') {
            const note = (document.getElementById('crmTodoCallbackNote')?.value || '').trim();
            histEntry.type = 'callback_scheduled';
            histEntry.text = note || 'Передзвонити';

        } else {
            // Просто оновлення наступної дії без результату дзвінка
            histEntry.type = 'next_action_updated';
            histEntry.text = 'Оновлено наступну дію: ' + nextText;
        }

        await ref.update(updates);
        await ref.collection('history').add(histEntry);

        _crmTodoCloseCard();
        if (window.showToast) showToast('Збережено', 'success');

        // Оновлюємо список
        setTimeout(() => {
            if (typeof renderCrmTodo === 'function') renderCrmTodo();
        }, 300);

    } catch(e) {
        if (btn) { btn.disabled = false; btn.textContent = 'Зберегти'; }
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};

// ── Закрити картку ────────────────────────────────────────
window._crmTodoCloseCard = function() {
    document.getElementById('crmTodoCardOverlay')?.remove();
};

// ── Переміщення ліда між воронками ────────────────────────
window._crmTodoTogglePipelineMenu = function(dealId, btn) {
    const menu = document.getElementById('pipelineMenu_' + dealId);
    if (!menu) return;
    const isOpen = menu.style.display !== 'none';
    // Закриваємо всі відкриті меню
    document.querySelectorAll('[id^="pipelineMenu_"]').forEach(m => m.style.display = 'none');
    if (!isOpen) {
        menu.style.display = 'block';
        // Закриваємо при кліку поза меню
        setTimeout(() => {
            const handler = (e) => {
                if (!menu.contains(e.target) && e.target !== btn) {
                    menu.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            };
            document.addEventListener('click', handler);
        }, 10);
    }
};

window._crmTodoMoveToPipeline = async function(dealId, targetPipelineId, targetPipelineName) {
    const crmObj = window.crm;
    if (!crmObj) return;

    const deal = crmObj.deals.find(d => d.id === dealId);
    if (!deal) return;

    const targetPipeline = (crmObj.pipelines || []).find(p => p.id === targetPipelineId);
    if (!targetPipeline) return;

    // Беремо першу стадію цільової воронки
    const firstStage = targetPipeline.stages?.[0]?.id || 'new';

    const confirmed = confirm(
        `Перемістити "${deal.clientName || deal.title || 'лід'}" у воронку "${targetPipelineName}"?\n\nЛід буде переміщено на стадію: "${targetPipeline.stages?.[0]?.label || firstStage}"`
    );
    if (!confirmed) return;

    try {
        // Закриваємо картку
        _crmTodoCloseCard();

        // Оновлюємо в Firebase
        await window.companyRef()
            .collection(window.DB_COLS.CRM_DEALS)
            .doc(dealId)
            .update({
                pipelineId: targetPipelineId,
                stage: firstStage,
                movedToPipelineAt: firebase.firestore.FieldValue.serverTimestamp(),
                movedFromPipelineId: crmObj.pipeline?.id || '',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

        // Додаємо запис в history
        try {
            await window.companyRef()
                .collection(window.DB_COLS.CRM_DEALS)
                .doc(dealId).collection('history').add({
                    type: 'pipeline_move',
                    text: `Переміщено у воронку "${targetPipelineName}"`,
                    from: crmObj.pipeline?.name || '',
                    to: targetPipelineName,
                    at: firebase.firestore.FieldValue.serverTimestamp(),
                    by: window.currentUser?.email || '',
                });
        } catch(e) { /* history не критично */ }

        if (window.showToast) showToast(`Лід переміщено → ${targetPipelineName}`, 'success');

        // Оновлюємо todo — лід більше не в поточній воронці
        if (typeof renderCrmTodo === 'function') renderCrmTodo();

    } catch(e) {
        console.error('[CRM move pipeline]', e);
        if (window.showToast) showToast('Помилка переміщення: ' + e.message, 'error');
    }
};

// ── Швидке створення ліда ─────────────────────────────────
window._crmTodoCreateLead = function(sourceDealId) {
    const deal = window.crm?.deals.find(d => d.id === sourceDealId) ?? null;
    _crmTodoCloseCard();

    // Відкриваємо стандартну форму і префіллаємо
    if (typeof crmOpenCreateDeal === 'function') {
        crmOpenCreateDeal('new');
        // Після рендеру форми — заповнюємо поля з поточного клієнта
        setTimeout(() => {
            const phoneEl  = document.getElementById('nd_phone');
            const clientEl = document.getElementById('nd_client');
            const nicheEl  = document.getElementById('nd_niche');
            if (deal?.phone  && phoneEl)  phoneEl.value  = deal.phone;
            if (deal?.clientName && clientEl) clientEl.value = deal.clientName + ' (новий лід)';
            if (deal?.clientNiche && nicheEl) nicheEl.value = deal.clientNiche;
            // Фокус на назву
            document.getElementById('nd_title')?.focus();
        }, 100);
    }
};

// ── Ключова подія: ESC закриває картку ───────────────────
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('crmTodoCardOverlay')) {
        e.stopPropagation();
        _crmTodoCloseCard();
    }
});

// ── Інтеграція з "Мій день" ──────────────────────────────
// Додаємо CRM-завдання в window._myday_crm_items для модуля мого дня
window._getCrmTodoForMyDay = function() {
    const deals = _getTodayDeals();
    return _sortDeals(deals).map(d => {
        const fmt = d.nextActionDate ? _fmtDate(d.nextActionDate) : null;
        return {
            id:       'crm_' + d.id,
            dealId:   d.id,
            type:     'crm_action',
            title:    d.nextActionText || '(без завдання)',
            client:   d.clientName || d.title || '',
            phone:    d.phone || '',
            telegram: d.telegram || '',
            date:     d.nextActionDate || null,
            overdue:  fmt?.overdue || false,
            stage:    d.stage,
            onClick:  () => crmTodoOpenCard(d.id),
        };
    });
};

})();
