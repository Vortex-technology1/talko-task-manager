// ============================================================
// js/modules/100-booking.js — TALKO Booking Admin UI
// v2 — групи календарів (multi-calendar combined view)
// ============================================================
(function () {
'use strict';

const t   = k => (window.t ? window.t(k) : k);
const esc = s => window.htmlEsc ? window.htmlEsc(s||'') : (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ── SVG Icons ────────────────────────────────────────────
const I = {
    calendar: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    plus:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    link:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    copy:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    edit:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
    check:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    close:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    clock:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    user:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    list:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    back:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    group:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="9" height="14" rx="1.5"/><rect x="13" y="3" width="9" height="18" rx="1.5"/></svg>',
    external: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
};

// ── State ─────────────────────────────────────────────────
let bk = {
    calendars:        [],
    groups:           [],
    appointments:     [],
    view:             'list',
    editCalendar:     null,
    editGroup:        null,
    activeCalendarId: '',
    activeGroupId:    '',
    filterStatus:     '',
    unsubs:           [],
    saving:           false,
};

const DEFAULT_SCHEDULE = {
    weeklyHours: {
        mon: [{ start: '09:00', end: '18:00' }],
        tue: [{ start: '09:00', end: '18:00' }],
        wed: [{ start: '09:00', end: '18:00' }],
        thu: [{ start: '09:00', end: '18:00' }],
        fri: [{ start: '09:00', end: '18:00' }],
        sat: [],
        sun: [],
    },
    dateOverrides: {},
};

// ── Init ──────────────────────────────────────────────────
window.initBookingModule = async function () {
    if (!window.currentCompanyId) return;
    renderBookingShell();
    loadData();
};

function renderBookingShell() {
    const container = document.getElementById('bookingContainer');
    if (!container) return;
    container.innerHTML = `
<div id="bk-admin" style="padding:.5rem 0 2rem">
  <div id="bk-view-root"></div>
</div>`;
    injectBookingStyles();
    document.getElementById('bk-admin').addEventListener('click', function(e) {
        const btn = e.target.closest('[data-bk-action]');
        if (!btn) return;
        const action = btn.dataset.bkAction;
        const id     = btn.dataset.id   || '';
        const name   = btn.dataset.name || '';
        const url    = btn.dataset.url  || '';
        const active = btn.dataset.active;
        if (action === 'cal-appointments')  window._bkShowAppointments(id, name);
        if (action === 'cal-copy')          window._bkCopyLink(url);
        if (action === 'cal-open')          window.open(url, '_blank');
        if (action === 'cal-edit')          window._bkEditCalendar(id);
        if (action === 'cal-toggle')        window._bkToggleCalendar(id, active === 'true');
        if (action === 'grp-appointments')  window._bkShowGroupAppointments(id, name);
        if (action === 'grp-copy')          window._bkCopyLink(url);
        if (action === 'grp-open')          window.open(url, '_blank');
        if (action === 'grp-edit')          window._bkEditGroup(id);
        if (action === 'grp-delete')        window._bkDeleteGroup(id, name);
    });
}

// ── Load data (real-time) ─────────────────────────────────
function loadData() {
    if (!window.companyCol) return;
    bk.unsubs.forEach(u => u && u());
    bk.unsubs = [];

    bk.unsubs.push(
        window.companyCol('booking_calendars')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snap => {
                bk.calendars = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (bk.view === 'list') renderCalendarList();
            }, err => console.error('[booking] calendars:', err))
    );

    bk.unsubs.push(
        window.companyCol('booking_groups')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snap => {
                bk.groups = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (bk.view === 'list') renderCalendarList();
            }, err => console.error('[booking] groups:', err))
    );
}

// ── View: List ────────────────────────────────────────────
function renderCalendarList() {
    bk.view = 'list';
    const root = document.getElementById('bk-view-root');
    if (!root) return;
    const base   = window.location.origin;
    const compId = window.currentCompanyId;
    const calCards = bk.calendars.length === 0
        ? `<div class="bk-empty">
            <div style="margin-bottom:0.5rem;color:#9ca3af;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div style="font-weight:600;margin-bottom:.2rem">${t('noCalendarsYet')||'Немає жодного календаря'}</div>
            <div style="color:#94a3b8;font-size:.85rem">${t('createFirstCal')||'Натисніть «+ Новий календар»'}</div>
           </div>`
        : bk.calendars.map(cal => {
            const calUrl = cal.slug
                ? `${base}/book/${compId}/${cal.slug}`
                : `${base}/api/booking?action=page&companyId=${compId}&calendarId=${cal.id}`;
            const url = calUrl;
            const isActive = cal.isActive !== false;
            return `
<div class="bk-cal-card">
  <div class="bk-cal-card-left">
    <div class="bk-cal-dot" style="background:${esc(cal.color||'#3b82f6')}"></div>
    <div>
      <div class="bk-cal-name">${esc(cal.name)}</div>
      <div class="bk-cal-meta">
        ${I.clock} ${cal.duration||60} ${t('minUnit')||'хв'}
        ${cal.location ? ` &nbsp;·&nbsp; \u{1F4CD} ${esc(cal.location)}` : ''}
        &nbsp;·&nbsp; <span style="color:${isActive?'#22c55e':'#94a3b8'}">${isActive?(t('enabledWord')||'Активний'):(t('disabledWord')||'Вимкнено')}</span>
      </div>
    </div>
  </div>
  <div class="bk-cal-card-actions">
    <button class="bk-btn-sm" data-bk-action="cal-appointments" data-id="${cal.id}" data-name="${esc(cal.name)}">
      ${I.list} ${t('appointmentsWord')||'Записи'}
    </button>
    <button class="bk-btn-sm" data-bk-action="cal-copy" data-url="${esc(url)}" title="${t('copyLink')||'Копіювати'}">
      ${I.copy}
    </button>
    <button class="bk-btn-sm" data-bk-action="cal-open" data-url="${esc(url)}" title="${t('openWord')||'Відкрити'}">
      ${I.external}
    </button>
    <button class="bk-btn-sm bk-btn-edit" data-bk-action="cal-edit" data-id="${cal.id}">
      ${I.edit}
    </button>
    <button class="bk-btn-sm bk-btn-toggle"
            data-bk-action="cal-toggle"
            data-id="${cal.id}"
            data-active="${isActive ? 'false' : 'true'}"
            title="${isActive ? (t('disableWord')||'Вимкнути') : (t('enableWord')||'Увімкнути')}">
      ${isActive ? I.close : I.check}
    </button>
  </div>
</div>`;
        }).join('');

    const grpCards = bk.groups.map(grp => {
        const slug = grp.slug || grp.id;
    const url = grp.slug
        ? `${base}/book/${compId}/g/${grp.slug}`
        : `${base}/api/booking?action=page&companyId=${compId}&groupId=${grp.id}`;
        const members = (grp.calendarIds||[])
            .map(cid => bk.calendars.find(c => c.id === cid))
            .filter(Boolean);
        const chips = members.length
            ? members.map(c => `<span class="bk-cal-chip" style="border-left:3px solid ${esc(c.color||'#6366f1')}">${esc(c.name)}</span>`).join('')
            : `<span style="color:#94a3b8;font-size:.75rem">${t('bkNoCalsYet')||'Порожня група'}</span>`;
        return `
<div class="bk-grp-card">
  <div class="bk-grp-card-left">
    <div class="bk-grp-icon">${I.group}</div>
    <div style="min-width:0">
      <div class="bk-cal-name">${esc(grp.name)}</div>
      ${grp.description ? `<div style="font-size:.78rem;color:#6b7280;margin-top:.1rem">${esc(grp.description)}</div>` : ''}
      <div class="bk-cal-meta" style="margin-top:.35rem;flex-wrap:wrap;gap:.3rem">${chips}</div>
    </div>
  </div>
  <div class="bk-cal-card-actions">
    <button class="bk-btn-sm" data-bk-action="grp-appointments" data-id="${grp.id}" data-name="${esc(grp.name)}">
      ${I.list} ${t('appointmentsWord')||'Записи'}
    </button>
    <button class="bk-btn-sm" data-bk-action="grp-copy" data-url="${esc(url)}" title="${t('copyLink')||'Копіювати'}">
      ${I.copy}
    </button>
    <button class="bk-btn-sm" data-bk-action="grp-open" data-url="${esc(url)}" title="${t('openWord')||'Відкрити'}">
      ${I.external}
    </button>
    <button class="bk-btn-sm bk-btn-edit" data-bk-action="grp-edit" data-id="${grp.id}">
      ${I.edit}
    </button>
    <button class="bk-btn-sm" data-bk-action="grp-delete" data-id="${grp.id}" data-name="${esc(grp.name)}"
            title="${t('flowDelete')||'Видалити'}" style="color:#ef4444">
      ${I.trash}
    </button>
  </div>
</div>`;
    }).join('');

    const grpSection = bk.groups.length === 0 ? '' : `
<div class="bk-section-divider">
  <span>${I.group} ${t('bkGroups')||'Групи — об\'єднані розклади'}</span>
  <span class="bk-section-hint">${t('bkGroupsHint')||'Клієнт бачить 1 розклад = слоти з усіх вибраних календарів'}</span>
</div>
${grpCards}`;

    root.innerHTML = `
<div class="bk-header-row">
  <div>
    <h2 class="bk-page-title">${I.calendar} ${t('bizBooking')||'Бронювання'}</h2>
    <div class="bk-page-sub">${t('bookingSubtitle')||'Онлайн-запис для клієнтів'}</div>
  </div>
  <div style="display:flex;gap:.5rem;flex-wrap:wrap">
    <button class="bk-btn-secondary" onclick="window._bkShowWeekView()" title="Тижневий календар">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/></svg>
      Тиждень
    </button>
    <button class="bk-btn-primary" onclick="window._bkNewCalendar()">
      ${I.plus} ${t('newCalService')||'Новий календар'}
    </button>
    <button class="bk-btn-secondary" onclick="window._bkNewGroup()">
      ${I.group} ${t('bkNewGroup')||'Нова група'}
    </button>
  </div>
</div>
<div id="bk-calendars-list">${calCards}</div>
${grpSection}`;
}

// ── View: Calendar form ───────────────────────────────────
function renderCalendarForm(cal) {
    bk.view = 'form';
    bk.editCalendar = cal || null;
    const isEdit = !!(cal && cal.id);
    const root = document.getElementById('bk-view-root');
    if (!root) return;
    const d     = cal || {};
    const sched = d._schedule || DEFAULT_SCHEDULE;

    const tzOpts = ['Europe/Kiev','Europe/Warsaw','Europe/Berlin','Europe/London',
        'America/New_York','America/Chicago','America/Los_Angeles','UTC']
        .map(tz => `<option value="${tz}" ${(d.timezone||'Europe/Kiev')===tz?'selected':''}>${tz}</option>`).join('');
    const durOpts = [15,30,45,60,90,120]
        .map(v => `<option value="${v}" ${(d.duration||60)===v?'selected':''}>${v} ${t('minUnit')||'хв'}</option>`).join('');
    const confirmOpts = [
        ['auto',   t('autoWord')    || 'Автоматично'],
        ['manual', t('manualConfirm')|| 'Вручну'],
    ].map(([v,l]) => `<option value="${v}" ${(d.confirmationType||'auto')===v?'selected':''}>${l}</option>`).join('');

    const DAYS = [['mon','Пн'],['tue','Вт'],['wed','Ср'],['thu','Чт'],['fri','Пт'],['sat','Сб'],['sun','Нд']];
    const schedRows = DAYS.map(([day, lbl]) => {
        const h  = ((sched.weeklyHours)||{})[day] || [];
        const on = h.length > 0;
        return `
<div class="bk-sched-row" data-day="${day}">
  <label class="bk-sched-toggle">
    <input type="checkbox" data-day="${day}" class="bk-day-check" ${on?'checked':''}
           onchange="window._bkToggleDay('${day}',this.checked)">
    <span class="bk-sched-label">${lbl}</span>
  </label>
  <div class="bk-sched-times" id="bk-sched-${day}" style="${on?'':'opacity:.35;pointer-events:none'}">
    <input type="time" class="bk-time-input" id="bk-start-${day}" value="${on?h[0].start:'09:00'}">
    <span style="color:#94a3b8">&#8212;</span>
    <input type="time" class="bk-time-input" id="bk-end-${day}" value="${on?h[0].end:'18:00'}">
  </div>
</div>`; }).join('');

    const qRows = (d.questions||[]).map((q,i) => `
      <div class="bk-q-row" data-idx="${i}" style="display:grid;grid-template-columns:1fr auto auto auto;gap:.5rem;align-items:center">
        <input type="text" class="bk-q-label" placeholder="${t('questionText')||'Текст питання'}"
               value="${esc(q.label||'')}" style="padding:.4rem .6rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.85rem">
        <select class="bk-q-type" style="padding:.4rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.82rem">
          <option value="text"   ${q.type==='text'  ?'selected':''}>Текст</option>
          <option value="phone"  ${q.type==='phone' ?'selected':''}>Телефон</option>
          <option value="email"  ${q.type==='email' ?'selected':''}>Email</option>
          <option value="select" ${q.type==='select'?'selected':''}>Список</option>
        </select>
        <label style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;white-space:nowrap">
          <input type="checkbox" class="bk-q-required" ${q.required?'checked':''}> ${t('requiredShort')||'Обов.'}
        </label>
        <button class="bk-btn-sm" onclick="window._bkRemoveQuestion(${i})" type="button"
                style="color:#ef4444;padding:.3rem .5rem">&#215;</button>
      </div>`).join('');

    root.innerHTML = `
<div class="bk-header-row">
  <div style="display:flex;align-items:center;gap:.75rem">
    <button class="bk-btn-back" onclick="window._bkBackToList()">${I.back} ${t('flowBack')||'Назад'}</button>
    <h2 class="bk-page-title">${isEdit?(t('editCalWord')||'Редагувати'):(t('newCalService')||'Новий')} ${t('calendarWord')||'календар'}</h2>
  </div>
  <button class="bk-btn-primary" id="bk-save-btn" onclick="window._bkSaveCalendar()">
    ${I.check} ${t('saveWord')||'Зберегти'}
  </button>
</div>
<div class="bk-form-grid">
  <div class="bk-form-section">
    <div class="bk-section-title">${t('basicWord')||'Основне'}</div>
    <div class="bk-field">
      <label>${t('calNameLabel')||'Назва'} *</label>
      <input type="text" id="bk-f-name" placeholder=${window.t('bookingEx2')||'напр: Консультація'}
             value="${esc(d.name||'')}" maxlength="80">
    </div>
    <div class="bk-field-row">
      <div class="bk-field">
        <label>Slug (URL) *</label>
        <input type="text" id="bk-f-slug" placeholder="consultation"
               value="${esc(d.slug||'')}"
               oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')">
      </div>
      <div class="bk-field">
        <label>${t('durationMin')||'Тривалість (хв)'}</label>
        <select id="bk-f-duration">${durOpts}</select>
      </div>
    </div>
    <div class="bk-field-row">
      <div class="bk-field">
        <label>${t('bufBeforeLabel')||'Буфер до (хв)'}</label>
        <input type="number" id="bk-f-buf-before" value="${d.bufferBefore||0}" min="0" max="60" step="5">
      </div>
      <div class="bk-field">
        <label>${t('bufAfterLabel')||'Буфер після (хв)'}</label>
        <input type="number" id="bk-f-buf-after" value="${d.bufferAfter||0}" min="0" max="60" step="5">
      </div>
    </div>
    <div class="bk-field-row">
      <div class="bk-field">
        <label>${t('confirmationType')||'Підтвердження'}</label>
        <select id="bk-f-confirm">${confirmOpts}</select>
      </div>
      <div class="bk-field">
        <label>${t('timezoneLabel')||'Часовий пояс'}</label>
        <select id="bk-f-tz">${tzOpts}</select>
      </div>
    </div>
    <div class="bk-field-row">
      <div class="bk-field">
        <label>${t('colorLabel')||'Колір'}</label>
        <input type="color" id="bk-f-color" value="${d.color||'#3b82f6'}" style="height:36px;width:100%;cursor:pointer">
      </div>
      <div class="bk-field">
        <label>${t('locationLabel')||'Місце'}</label>
        <input type="text" id="bk-f-location" placeholder="Zoom, Google Meet..." value="${esc(d.location||'')}">
      </div>
    </div>
    <div class="bk-field" style="display:flex;gap:1.25rem;flex-wrap:wrap;align-items:center">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-phone-show" ${d.phoneShow!==false?'checked':''} onchange="window._bkTogglePhoneRequired(this)">
        Показувати телефон
      </label>
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer" id="bk-f-phone-req-wrap" ${d.phoneShow===false?'style=\"opacity:.4;pointer-events:none\"':''}>
        <input type="checkbox" id="bk-f-phone-required" ${d.phoneRequired!==false?'checked':''}>
        Обов'язковий
      </label>
    </div>
    <div class="bk-field">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-email-required" ${d.emailRequired!==false?'checked':''}>
        Email обов'язковий
      </label>
    </div>
    <div class="bk-field">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-active" ${d.isActive!==false?'checked':''}>
        ${t('activeLabel')||'Активний'}
      </label>
    </div>
    <div class="bk-field">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-require-payment" onchange="window._bkToggleRequirePayment(this)" ${d.requirePayment?'checked':''}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#635bff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        ${t('bkRequirePayment')||'Оплата при записі (Stripe)'}
      </label>
    </div>
    <div class="bk-field" id="bk-f-price-wrap" style="${d.requirePayment?'':'display:none'}">
      <label>${t('bkServicePrice')||'Вартість послуги'}</label>
      <div style="display:flex;gap:.5rem;align-items:center">
        <input type="number" id="bk-f-price" min="0" step="0.01" value="${d.price||''}" placeholder="0.00" style="flex:1">
        <select id="bk-f-price-currency" style="width:80px">
          <option value="EUR" ${(d.priceCurrency||'EUR')==='EUR'?'selected':''}>EUR</option>
          <option value="CZK" ${(d.priceCurrency||'EUR')==='CZK'?'selected':''}>CZK</option>
        </select>
      </div>
    </div>
  </div>
  <div class="bk-form-section">
    <div class="bk-section-title">${t('scheduleLabel')||'Розклад доступності'}</div>
    <div class="bk-schedule-grid">${schedRows}</div>
  </div>
  <div class="bk-form-section" style="grid-column:1/-1">
    <div class="bk-section-title" style="display:flex;align-items:center;justify-content:space-between">
      ${t('extraQuestions')||'Додаткові питання до клієнта'}
      <button class="bk-btn-sm" onclick="window._bkAddQuestion()" type="button">+ ${t('addQuestion')||'Додати'}</button>
    </div>
    <div id="bk-questions-list" style="display:flex;flex-direction:column;gap:.5rem">${qRows}</div>
    <div style="font-size:.78rem;color:#94a3b8;margin-top:.5rem">${t('questionsHint')||'Ім\'я та Email — завжди обов\'язкові'}</div>
  </div>
</div>
<div style="margin-top:.75rem;padding:.85rem 1rem;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">
  <div>
    <div style="font-size:.72rem;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.25rem;">🔗 Посилання для клієнта</div>
    <div id="bk-preview-url" style="font-size:.82rem;color:#0c4a6e;word-break:break-all;">${isEdit && cal.slug
      ? window.location.origin + '/book/' + window.currentCompanyId + '/' + cal.slug
      : '⏳ Збережіть, щоб отримати посилання'}</div>
  </div>
  ${isEdit && cal.slug ? `<button onclick="window._bkCopyLink(window.location.origin+'/book/'+window.currentCompanyId+'/${cal.slug}')" style="padding:.45rem .9rem;background:#0369a1;color:white;border:none;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;">Копіювати</button>` : ''}
</div>`;

    document.getElementById('bk-f-name').addEventListener('input', function() {
        const sl = document.getElementById('bk-f-slug');
        if (!isEdit || !sl.value) {
            sl.value = this.value.toLowerCase()
                .replace(/[іїєґ]/g,c=>({'і':'i','ї':'i','є':'ie','ґ':'g'}[c]||c))
                .replace(/[а-яёА-ЯЁ]/g,'').replace(/[^a-z0-9]+/g,'-')
                .replace(/^-+|-+$/g,'').slice(0,40);
        }
    });
}

// ── View: Group form ──────────────────────────────────────
function renderGroupForm(grp) {
    bk.view = 'group-form';
    const isEdit = !!(grp && grp.id);
    const root = document.getElementById('bk-view-root');
    if (!root) return;
    const base   = window.location.origin;
    const compId = window.currentCompanyId;

    const activeCals = bk.calendars.filter(c => c.isActive !== false);
    const calsHtml = activeCals.length === 0
        ? `<div style="padding:.75rem;border:1.5px dashed #e5e7eb;border-radius:8px;color:#9ca3af;font-size:.85rem">
             ${t('bkNoCalsYet')||'Спочатку створіть активні календарі'}
           </div>`
        : activeCals.map(cal => {
            const checked = isEdit && (grp.calendarIds||[]).includes(cal.id) ? 'checked' : '';
            return `
<label class="bk-cal-check-label ${checked?'bk-cal-check-active':''}" id="bklbl-${cal.id}">
  <input type="checkbox" class="bk-g-cal-check" value="${cal.id}" ${checked}
         onchange="window._bkGrpCalChange(this)">
  <span class="bk-cal-color-dot" style="background:${esc(cal.color||'#6366f1')}"></span>
  <span style="font-weight:600;font-size:.88rem;color:#111827;flex:1">${esc(cal.name)}</span>
  ${cal.location?`<span style="font-size:.72rem;color:#9ca3af">&#x1F4CD; ${esc(cal.location)}</span>`:''}
  <span style="font-size:.72rem;color:#94a3b8">${I.clock} ${cal.duration||60} ${t('minUnit')||'хв'}</span>
</label>`; }).join('');

    const previewUrl = isEdit ? `${base}/api/booking?action=page&companyId=${compId}&groupId=${grp.id}` : '';

    root.innerHTML = `
<div class="bk-header-row">
  <div style="display:flex;align-items:center;gap:.75rem">
    <button class="bk-btn-back" onclick="window._bkBackToList()">${I.back} ${t('flowBack')||'Назад'}</button>
    <h2 class="bk-page-title">
      ${I.group} ${isEdit?(t('bkEditGroup')||'Редагувати групу'):(t('bkNewGroup')||'Нова група')}
    </h2>
  </div>
  <button class="bk-btn-primary" onclick="window._bkSaveGroup()">
    ${I.check} ${t('saveChanges')||'Зберегти'}
  </button>
</div>

<div class="bk-form-section" style="margin-bottom:1rem">
  <div class="bk-section-title">${t('basicWord')||'Основне'}</div>
  <div class="bk-field">
    <label>${t('bkGroupName')||'Назва групи'} <span style="color:#ef4444">*</span></label>
    <input type="text" id="bk-g-name" maxlength="80"
           placeholder="${t('bkGroupNamePh')||'напр: Запис до лікаря'}"
           oninput="window._bkGrpAutoSlug(this)"
           value="${isEdit?esc(grp.name||''):''}">
  </div>
  <div class="bk-field">
    <label>URL (slug) <span style="color:#ef4444">*</span></label>
    <div style="display:flex;align-items:center;gap:.4rem">
      <span style="font-size:.78rem;color:#9ca3af;white-space:nowrap">/book/${esc(window.currentCompanyId||'')}/g/</span>
      <input type="text" id="bk-g-slug" maxlength="50"
             placeholder="zapys-do-likaria"
             value="${isEdit?esc(grp.slug||''):''}"
             oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')"
             style="flex:1">
    </div>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:.25rem">
      ${t('slugHint')||'Тільки латинські літери, цифри та дефіс'}
    </div>
  </div>
  <div class="bk-field">
    <label>${t('serviceDesc')||'Опис'}</label>
    <textarea id="bk-g-desc" rows="2"
              placeholder="${t('bkGroupDescPh')||'Короткий опис для клієнта'}"
              style="width:100%;padding:.5rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.85rem;resize:vertical;box-sizing:border-box">${isEdit?esc(grp.description||''):''}</textarea>
  </div>
</div>

<div class="bk-form-section" style="margin-bottom:1rem">
  <div class="bk-section-title" style="display:flex;align-items:center;justify-content:space-between">
    <span>${t('bkSelectCalendars')||'Оберіть календарі'} <span style="color:#ef4444">*</span></span>
    <span id="bk-g-count" style="font-size:.8rem;font-weight:700;color:#22c55e"></span>
  </div>
  <div style="font-size:.78rem;color:#6b7280;margin-bottom:.75rem;padding:.5rem .75rem;background:#fffbeb;border-radius:8px;border:1px solid #fde68a">
    &#9888;&#65039; ${t('bkGroupMinCalsHint')||'Мінімум 2 — вільні слоти з усіх обраних будуть об\'єднані в один розклад для клієнта'}
  </div>
  <div style="display:flex;flex-direction:column;gap:.4rem">${calsHtml}</div>
</div>

${isEdit ? `
<div class="bk-form-section" style="margin-bottom:1rem">
  <div class="bk-section-title">${t('bkPublicLink')||'Посилання для клієнта'}</div>
  <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:8px;padding:.7rem 1rem;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
    <span style="font-size:.82rem;color:#166534;word-break:break-all;flex:1" id="bk-g-preview-url-text">${previewUrl}</span>
    <button class="bk-btn-sm" onclick="window._bkCopyLink('${previewUrl}')">${I.copy} ${t('copyWord')||'Копіювати'}</button>
    <button class="bk-btn-sm" onclick="window.open('${previewUrl}','_blank')">${I.external} ${t('openWord')||'Відкрити'}</button>
  </div>
  <div style="font-size:.74rem;color:#9ca3af;margin-top:.4rem">
    ${t('bkGroupLinkHint')||'Клієнт бачить один розклад — слоти з усіх обраних календарів автоматично об\'єднуються'}
  </div>
</div>` : `
<div style="padding:.65rem 1rem;background:#f0f9ff;border-radius:10px;font-size:.82rem;color:#0369a1;margin-bottom:1rem">
  ${I.link} ${t('bkGroupLinkAfterSave')||'Посилання з\'явиться після збереження'}
</div>`}`;

    // Init counter
    window._bkGrpUpdateCount();
}

window._bkGrpAutoSlug = function(nameInput) {
    const sl = document.getElementById('bk-g-slug');
    if (!sl || sl.dataset.manual === 'true') return;
    sl.value = nameInput.value.toLowerCase()
        .replace(/[іїєґ]/g,c=>({'і':'i','ї':'i','є':'ie','ґ':'g'}[c]||c))
        .replace(/[а-яёА-ЯЁ]/g,'').replace(/[^a-z0-9]+/g,'-')
        .replace(/^-+|-+$/g,'').slice(0,50);
    window._bkGrpUpdatePreviewUrl();
};

window._bkGrpUpdatePreviewUrl = function() {
    const sl   = (document.getElementById('bk-g-slug')?.value||'').trim();
    const comp = window.currentCompanyId||'';
    const el   = document.getElementById('bk-g-preview-url-text');
    if (el && sl && comp) {
        el.textContent = window.location.origin + '/book/' + comp + '/g/' + sl;
    }
};

window._bkGrpCalChange = function(cb) {
    const lbl = document.getElementById('bklbl-' + cb.value);
    if (lbl) lbl.classList.toggle('bk-cal-check-active', cb.checked);
    window._bkGrpUpdateCount();
};
window._bkGrpUpdateCount = function() {
    const n  = document.querySelectorAll('.bk-g-cal-check:checked').length;
    const el = document.getElementById('bk-g-count');
    if (el) {
        el.textContent = n > 0 ? `${n} ${t('bkCalendarsInGroup')||'обрано'}` : '';
        el.style.color = n >= 2 ? '#22c55e' : '#f59e0b';
    }
};

// ── View: Week Calendar (Cliniccards style) ───────────────
window._bkShowWeekView = function() { renderWeekView(); };

let _bkWeekOffset = 0; // 0 = this week, 1 = next week, etc.

async function renderWeekView() {
    bk.view = 'week';
    const root = document.getElementById('bk-view-root');
    if (!root) return;

    root.innerHTML = `
<div class="bk-header-row">
  <div style="display:flex;align-items:center;gap:.75rem">
    <button class="bk-btn-back" onclick="window._bkBackToList()">${I.back} Назад</button>
    <h2 class="bk-page-title">${I.calendar} Тижневий розклад</h2>
  </div>
  <div style="display:flex;gap:.5rem;align-items:center">
    <button class="bk-btn-sm" onclick="window._bkWeekNav(-1)">&#8592;</button>
    <span id="bk-week-label" style="font-weight:600;font-size:.9rem;white-space:nowrap"></span>
    <button class="bk-btn-sm" onclick="window._bkWeekNav(1)">&#8594;</button>
    <button class="bk-btn-sm" onclick="_bkWeekOffset=0;renderWeekView()" style="font-size:.78rem">Сьогодні</button>
  </div>
</div>
<div id="bk-week-grid-wrap" style="overflow-x:auto">
  <div class="bk-week-loading">Завантаження...</div>
</div>`;

    _bkWeekOffset = _bkWeekOffset || 0;
    await _bkLoadWeekGrid();
}

window._bkWeekNav = function(dir) {
    _bkWeekOffset = (_bkWeekOffset || 0) + dir;
    _bkLoadWeekGrid();
};

async function _bkLoadWeekGrid() {
    const wrap = document.getElementById('bk-week-grid-wrap');
    if (!wrap) return;

    // Визначаємо дати тижня
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (_bkWeekOffset * 7));
    monday.setHours(0,0,0,0);

    const days = Array.from({length:7}, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const DAY_NAMES = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
    const MONTHS_GEN = ['','січня','лютого','березня','квітня','травня','червня',
                        'липня','серпня','вересня','жовтня','листопада','грудня'];

    // Оновлюємо заголовок тижня
    const labelEl = document.getElementById('bk-week-label');
    if (labelEl) {
        const sun = days[6];
        labelEl.textContent = `${days[0].getDate()} — ${sun.getDate()} ${MONTHS_GEN[sun.getMonth()+1]} ${sun.getFullYear()}`;
    }

    // Спеціалісти = активні календарі
    const specialists = bk.calendars.filter(c => c.isActive !== false);

    if (specialists.length === 0) {
        wrap.innerHTML = `<div class="bk-empty">Немає активних спеціалістів. Створіть календар.</div>`;
        return;
    }

    wrap.innerHTML = `<div class="bk-week-loading">Завантаження записів...</div>`;

    // Завантажуємо записи для кожного дня тижня
    const dateStrs = days.map(d => {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    });

    let appointments = [];
    try {
        const snap = await window.companyCol('booking_appointments')
            .where('date', 'in', dateStrs.slice(0,10))
            .where('status', 'in', ['confirmed','pending'])
            .get();
        appointments = snap.docs.map(d => ({id:d.id,...d.data()}));
    } catch(e) { console.warn('[booking week]', e.message); }

    // Кольори по статусу
    const STATUS_COLOR = {
        confirmed: '#22c55e',
        pending:   '#f59e0b',
        cancelled: '#ef4444',
    };

    // Будуємо сітку
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    // Колонки — по спеціалістах, рядки — по днях
    const minCol = Math.max(120, Math.floor(700 / specialists.length));

    // Заголовки спеціалістів
    const specHeaders = specialists.map(sp => {
        const dotColor = sp.color || '#3b82f6';
        return `<th style="min-width:${minCol}px;padding:.5rem .4rem;text-align:center;border-left:1px solid #e5e7eb;">
            <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
                <span style="width:9px;height:9px;border-radius:50%;background:${esc(dotColor)};flex-shrink:0;display:inline-block;"></span>
                <span style="font-size:.78rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px;">${esc(sp.name)}</span>
            </div>
        </th>`;
    }).join('');

    // Рядки — по днях
    const rows = days.map((day, di) => {
        const ds = dateStrs[di];
        const isToday = ds === todayStr;
        const isPast  = day < today && !isToday;

        const dayLabel = `<td style="padding:.5rem .6rem;white-space:nowrap;vertical-align:top;min-width:70px;background:${isToday?'#eff6ff':isPast?'#fafafa':'white'};border-bottom:1px solid #f1f5f9;">
            <div style="font-size:.75rem;font-weight:600;color:${isToday?'#3b82f6':'#6b7280'}">${DAY_NAMES[di]}</div>
            <div style="font-size:1rem;font-weight:700;color:${isToday?'#2563eb':'#111'}">${day.getDate()}</div>
        </td>`;

        const cells = specialists.map(sp => {
            const appts = appointments.filter(a => a.calendarId === sp.id && a.date === ds);
            const cards = appts.length
                ? appts.sort((a,b) => (a.timeSlot||'').localeCompare(b.timeSlot||'')).map(a => {
                    const statusColor = STATUS_COLOR[a.status] || '#94a3b8';
                    const spColor = sp.color || '#3b82f6';
                    return `<div onclick="window._bkOpenApptModal('${a.id}')"
                        style="background:${spColor}18;border-left:3px solid ${spColor};border-radius:6px;padding:.3rem .45rem;margin-bottom:.25rem;cursor:pointer;transition:opacity .15s;"
                        onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
                        <div style="font-size:.72rem;font-weight:700;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(a.clientName)}</div>
                        <div style="display:flex;align-items:center;gap:4px;margin-top:1px;">
                            <span style="font-size:.68rem;color:#6b7280;">${a.timeSlot||''}</span>
                            <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};flex-shrink:0;"></span>
                        </div>
                    </div>`;
                }).join('')
                : `<div style="height:100%;min-height:32px;"></div>`;

            return `<td style="padding:.35rem;vertical-align:top;border-left:1px solid #e5e7eb;border-bottom:1px solid #f1f5f9;background:${isToday?'#f0f9ff':isPast?'#fafafa':'white'};min-height:48px;">${cards}</td>`;
        }).join('');

        return `<tr>${dayLabel}${cells}</tr>`;
    }).join('');

    wrap.innerHTML = `
<div style="font-size:.75rem;color:#6b7280;margin-bottom:.5rem;">
    ● підтверджено &nbsp; ● очікує &nbsp; — клікни на запис для деталей
</div>
<div style="overflow-x:auto;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);background:white;">
<table style="width:100%;border-collapse:collapse;min-width:400px;">
    <thead>
        <tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb;">
            <th style="padding:.5rem .6rem;text-align:left;font-size:.72rem;font-weight:700;color:#6b7280;min-width:70px;">День</th>
            ${specHeaders}
        </tr>
    </thead>
    <tbody>${rows}</tbody>
</table>
</div>`;
}

// Модалка деталей запису
window._bkOpenApptModal = async function(apptId) {
    // Знаходимо запис
    let appt = null;
    try {
        const snap = await window.companyCol('booking_appointments').doc(apptId).get();
        if (snap.exists) appt = { id: snap.id, ...snap.data() };
    } catch(e) {}
    if (!appt) return;

    const cal = bk.calendars.find(c => c.id === appt.calendarId) || {};
    const STATUS_LABELS = { confirmed:'✅ Підтверджено', pending:'⏳ Очікує', cancelled:'❌ Скасовано', completed:'✔ Завершено' };

    const existing = document.getElementById('bk-appt-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'bk-appt-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(2px);';
    modal.innerHTML = `
    <div style="background:white;border-radius:16px;padding:1.5rem;width:90%;max-width:380px;box-shadow:0 20px 50px rgba(0,0,0,.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <div style="font-size:.95rem;font-weight:800;">Запис</div>
            <button onclick="document.getElementById('bk-appt-modal').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:.5rem;font-size:.85rem;">
            <div><span style="color:#6b7280;">Клієнт:</span> <strong>${esc(appt.clientName)}</strong></div>
            <div><span style="color:#6b7280;">Email:</span> ${esc(appt.clientEmail)}</div>
            ${appt.clientPhone ? `<div><span style="color:#6b7280;">Тел:</span> ${esc(appt.clientPhone)}</div>` : ''}
            <div><span style="color:#6b7280;">Дата:</span> ${appt.date} о ${appt.timeSlot}</div>
            <div><span style="color:#6b7280;">Спеціаліст:</span> ${esc(cal.name||appt.calendarId)}</div>
            <div><span style="color:#6b7280;">Статус:</span> ${STATUS_LABELS[appt.status]||appt.status}</div>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:1.25rem;flex-wrap:wrap;">
            ${appt.status==='pending' ? `<button onclick="window._bkConfirmApptDirect('${apptId}');document.getElementById('bk-appt-modal').remove()" style="flex:1;padding:.55rem;background:#22c55e;color:white;border:none;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;">✓ Підтвердити</button>` : ''}
            ${['pending','confirmed'].includes(appt.status) ? `<button onclick="window._bkCancelApptDirect('${apptId}');document.getElementById('bk-appt-modal').remove()" style="flex:1;padding:.55rem;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;">✕ Скасувати</button>` : ''}
        </div>
    </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
};

window._bkConfirmApptDirect = async function(apptId) {
    try {
        await window.companyCol('booking_appointments').doc(apptId).update({ status: 'confirmed', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof showToast === 'function') showToast('Підтверджено ✓', 'success');
        await _bkLoadWeekGrid();
    } catch(e) { if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error'); }
};

window._bkCancelApptDirect = async function(apptId) {
    try {
        await window.companyCol('booking_appointments').doc(apptId).update({ status: 'cancelled', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof showToast === 'function') showToast('Скасовано', 'success');
        await _bkLoadWeekGrid();
    } catch(e) { if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error'); }
};

// ── View: Appointments ────────────────────────────────────
async function renderAppointments(id, name, isGroup) {
    bk.view = isGroup ? 'group-appointments' : 'appointments';
    if (isGroup) bk.activeGroupId = id; else bk.activeCalendarId = id;
    const root = document.getElementById('bk-view-root');
    if (!root) return;

    const badge = isGroup
        ? `<span style="background:#e0e7ff;color:#4f46e5;font-size:.72rem;font-weight:700;padding:.2rem .5rem;border-radius:6px;margin-left:.4rem">
             ${I.group} ${t('bkGroups')||'Група'}</span>`
        : '';

    root.innerHTML = `
<div class="bk-header-row">
  <div style="display:flex;align-items:center;gap:.75rem">
    <button class="bk-btn-back" onclick="window._bkBackToList()">${I.back} ${t('flowBack')||'Назад'}</button>
    <h2 class="bk-page-title">${t('appointmentsWord')||'Записи'} &#8212; ${esc(name)}${badge}</h2>
  </div>
  <select class="bk-select-sm" id="bk-appt-status-filter"
          onchange="window._bkLoadAppointments('${id}',${isGroup})">
    <option value="">${t('allStatuses')||'Всі статуси'}</option>
    <option value="pending">${t('pendingWord3')||'Очікує'}</option>
    <option value="confirmed">${t('confirmedWord3')||'Підтверджено'}</option>
    <option value="cancelled">${t('cancelledWord')||'Скасовано'}</option>
    <option value="completed">${t('completedWord')||'Завершено'}</option>
  </select>
</div>
<div id="bk-appt-table-wrap">
  <div class="bk-loader-row"><div class="bk-spinner"></div></div>
</div>`;

    await loadAppointments(id, isGroup);
}

async function loadAppointments(id, isGroup) {
    const wrap = document.getElementById('bk-appt-table-wrap');
    if (!wrap) return;
    const sf = document.getElementById('bk-appt-status-filter')?.value || '';
    try {
        let q = isGroup
            ? window.companyCol('booking_appointments').where('groupId','==',id)
            : window.companyCol('booking_appointments').where('calendarId','==',id);
        if (sf) q = q.where('status','==',sf);
        q = q.orderBy('startTime','desc').limit(100);
        const snap  = await q.get();
        const appts = snap.docs.map(d => ({id:d.id,...d.data()}));
        if (appts.length === 0) {
            wrap.innerHTML = `<div class="bk-empty">${t('noRecords4')||'Записів немає'}</div>`;
            return;
        }
        const SL = {
            pending:   `<span class="bk-badge bk-badge-yellow">${t('pendingWord3')||'Очікує'}</span>`,
            confirmed: `<span class="bk-badge bk-badge-green">${t('confirmedWord3')||'Підтверджено'}</span>`,
            cancelled: `<span class="bk-badge bk-badge-red">${t('cancelledWord')||'Скасовано'}</span>`,
            completed: `<span class="bk-badge bk-badge-gray">${t('completedWord')||'Завершено'}</span>`,
            no_show:   `<span class="bk-badge bk-badge-red">${t('noShowWord')||'Не з\'явився'}</span>`,
        };
        const rows = appts.map(a => {
            const calName = isGroup
                ? esc((bk.calendars.find(c=>c.id===a.calendarId)||{}).name||a.calendarId||'&#8212;')
                : '';
            return `
<tr class="bk-appt-row">
  <td>
    <div class="bk-appt-name">${I.user} ${esc(a.clientName)}</div>
    <div class="bk-appt-contact">${esc(a.clientEmail)}${a.clientPhone?` &#183; ${esc(a.clientPhone)}`:''}</div>
  </td>
  <td>
    <div style="font-weight:600">${a.date||''}</div>
    <div style="color:#64748b;font-size:.82rem">${a.timeSlot||''}</div>
    ${calName?`<div style="font-size:.72rem;color:#6366f1;margin-top:.1rem">&#128197; ${calName}</div>`:''}
  </td>
  <td>${SL[a.status]||a.status}</td>
  <td>
    ${a.status==='pending'?`<button class="bk-btn-sm bk-btn-confirm" onclick="window._bkConfirmAppt('${a.id}','${id}',${isGroup})">${I.check} ${t('confirmWord')||'Підтвердити'}</button>`:''}
    ${['pending','confirmed'].includes(a.status)?`<button class="bk-btn-sm bk-btn-cancel-appt" onclick="window._bkCancelAppt('${a.id}','${id}',${isGroup})">${I.close}</button>`:''}
  </td>
</tr>`; }).join('');

        const grpTh = isGroup ? `<th>${t('calendarWord')||'Календар'}</th>` : '';
        wrap.innerHTML = `
<table class="bk-appt-table">
  <thead><tr>
    <th>${t('clientWord')||'Клієнт'}</th>
    <th>${t('dateTimeLabel')||'Дата / Час'}</th>
    ${grpTh}
    <th>${t('statusWord')||'Статус'}</th>
    <th>${t('actionsWord')||'Дії'}</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`;
    } catch(e) {
        wrap.innerHTML = `<div class="bk-error">${t('errorWord')||'Помилка'}: ${esc(e.message)}</div>`;
    }
}

// ── Calendar Actions ──────────────────────────────────────
window._bkNewCalendar = function() { renderCalendarForm(null); };

window._bkEditCalendar = async function(calId) {
    const cal = bk.calendars.find(c => c.id === calId);
    if (!cal) return;
    try {
        const s = await window.companyDoc('booking_schedules', calId).get();
        cal._schedule = s.exists ? s.data() : DEFAULT_SCHEDULE;
    } catch(e) { cal._schedule = DEFAULT_SCHEDULE; }
    renderCalendarForm(cal);
};

window._bkBackToList = function() { renderCalendarList(); };

window._bkToggleDay = function(day, enabled) {
    const el = document.getElementById('bk-sched-' + day);
    if (el) { el.style.opacity = enabled?'1':'.35'; el.style.pointerEvents = enabled?'auto':'none'; }
};

window._bkToggleRequirePayment = function(cb) {
    const wrap = document.getElementById('bk-f-price-wrap');
    if (wrap) wrap.style.display = cb.checked ? '' : 'none';
};

window._bkTogglePhoneRequired = function(cb) {
    const reqWrap = document.getElementById('bk-f-phone-req-wrap');
    if (reqWrap) {
        reqWrap.style.opacity = cb.checked ? '1' : '.4';
        reqWrap.style.pointerEvents = cb.checked ? 'auto' : 'none';
        if (!cb.checked) {
            const reqCb = document.getElementById('bk-f-phone-required');
            if (reqCb) reqCb.checked = false;
        }
    }
};

window._bkSaveCalendar = async function() {
    const nameEl = document.getElementById('bk-f-name');
    const slugEl = document.getElementById('bk-f-slug');
    if (!nameEl || !slugEl) return;
    const name = nameEl.value.trim();
    const slug = slugEl.value.trim();
    if (!name) { alert(t('enterName3')||'Вкажіть назву'); nameEl.focus(); return; }
    if (!slug) { alert('Вкажіть slug'); slugEl.focus(); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { alert('Slug: тільки малі літери, цифри, дефіс'); return; }
    const btn = document.getElementById('bk-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = t('savingDots')||'Збереження...'; }

    const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
    const weeklyHours = {};
    for (const day of DAYS) {
        const ck = document.querySelector(`.bk-day-check[data-day="${day}"]`);
        if (ck && ck.checked) {
            const s = document.getElementById('bk-start-'+day)?.value || '09:00';
            const e = document.getElementById('bk-end-'+day)?.value   || '18:00';
            if (s >= e) {
                alert(window.t ? window.t('bkEndAfterStart').replace('{V}',day.toUpperCase()) : day+': кінець має бути після початку');
                if (btn) { btn.disabled=false; btn.innerHTML=I.check+' '+(t('saveWord')||'Зберегти'); }
                return;
            }
            weeklyHours[day] = [{start:s,end:e}];
        } else weeklyHours[day] = [];
    }
    if (!Object.values(weeklyHours).some(h=>h.length>0)) {
        alert(t('selectAtLeastOneDay')||'Оберіть хоча б один день');
        if (btn) { btn.disabled=false; } return;
    }

    const ownerName = String(window.currentUserData?.name||window.currentUser?.displayName||window.currentUser?.email||'').replace(/<[^>]*>/g,'').trim();
    const calData = {
        name, slug, ownerName,
        ownerId:          window.currentUser?.uid||'',
        duration:         parseInt(document.getElementById('bk-f-duration')?.value)||60,
        bufferBefore:     parseInt(document.getElementById('bk-f-buf-before')?.value)||0,
        bufferAfter:      parseInt(document.getElementById('bk-f-buf-after')?.value)||0,
        timezone:         document.getElementById('bk-f-tz')?.value||'Europe/Kiev',
        confirmationType: document.getElementById('bk-f-confirm')?.value||'auto',
        color:            document.getElementById('bk-f-color')?.value||'#3b82f6',
        location:         document.getElementById('bk-f-location')?.value?.trim()||'',
        isActive:         document.getElementById('bk-f-active')?.checked!==false,
        phoneShow:        document.getElementById('bk-f-phone-show')?.checked!==false,
        phoneRequired:    document.getElementById('bk-f-phone-required')?.checked===true,
        emailRequired:    document.getElementById('bk-f-email-required')?.checked!==false,
        questions:        window._bkCollectQuestions(),
        maxBookingsPerSlot: 1,
        requirePayment: document.getElementById('bk-f-require-payment')?.checked || false,
        price:          parseFloat(document.getElementById('bk-f-price')?.value) || 0,
        priceCurrency:  document.getElementById('bk-f-price-currency')?.value || 'EUR',
    };

    const isEdit = !!(bk.editCalendar && bk.editCalendar.id);
    if (!isEdit || bk.editCalendar?.slug !== slug) {
        try {
            const ex = await window.companyCol('booking_calendars').where('slug','==',slug).limit(1).get();
            if (!ex.empty && ex.docs[0].id !== bk.editCalendar?.id) {
                alert(window.t ? window.t('bkSlugUsed').replace('{V}',slug) : 'Slug вже зайнятий');
                if (btn) { btn.disabled=false; } return;
            }
        } catch(e) {}
    }

    try {
        const batch = firebase.firestore().batch();
        let calRef;
        if (isEdit) {
            calRef = window.companyDoc('booking_calendars', bk.editCalendar.id);
            batch.update(calRef, {...calData, updatedAt: firebase.firestore.FieldValue.serverTimestamp()});
        } else {
            calRef = window.companyCol('booking_calendars').doc();
            batch.set(calRef, {...calData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()});
        }
        batch.set(window.companyDoc('booking_schedules', calRef.id),
            {weeklyHours, dateOverrides: bk.editCalendar?._schedule?.dateOverrides||{},
             updatedAt: firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
        await batch.commit();
        if (typeof showToast === 'function') showToast(t('savedOk2')||'Збережено', 'success');
        window._bkBackToList();
    } catch(e) {
        alert((t('errorWord')||'Помилка')+': '+e.message);
        if (btn) { btn.disabled=false; btn.innerHTML=I.check+' '+(t('saveWord')||'Зберегти'); }
    }
};

window._bkToggleCalendar = async function(calId, isActive) {
    try {
        await window.companyDoc('booking_calendars', calId).update({isActive, updatedAt: firebase.firestore.FieldValue.serverTimestamp()});
        if (typeof showToast === 'function') showToast(isActive?(t('enabledWord')||'Увімкнено'):(t('disabledWord')||'Вимкнено'), 'success');
    } catch(e) { alert('Помилка: '+e.message); }
};

window._bkCopyLink = function(url) {
    navigator.clipboard.writeText(url).then(() => {
        if (typeof showToast === 'function') showToast(t('linkCopied')||'Посилання скопійовано', 'success');
    }).catch(() => { prompt(t('copyWord')||'Копіювати:', url); });
};

window._bkShowAppointments      = function(calId, calName) { renderAppointments(calId, calName, false); };
window._bkLoadAppointments      = function(id, isGroup)    { loadAppointments(id, isGroup); };
window._bkShowGroupAppointments = function(grpId, grpName) { renderAppointments(grpId, grpName, true); };

window._bkConfirmAppt = async function(apptId, id, isGroup) {
    try {
        await window.companyDoc('booking_appointments', apptId).update({status:'confirmed', updatedAt: firebase.firestore.FieldValue.serverTimestamp()});
        if (typeof showToast === 'function') showToast(t('confirmedWord3')||'Підтверджено', 'success');
        loadAppointments(id, isGroup);
    } catch(e) { alert('Помилка: '+e.message); }
};

window._bkCancelAppt = async function(apptId, id, isGroup) {
    if (!confirm(t('cancelBooking')||'Скасувати запис?')) return;
    try {
        const doc  = await window.companyDoc('booking_appointments', apptId).get();
        const appt = doc.data()||{};
        await window.companyDoc('booking_appointments', apptId).update({status:'cancelled', updatedAt: firebase.firestore.FieldValue.serverTimestamp()});
        if (appt.googleEventId) {
            const tok = await firebase.auth().currentUser?.getIdToken().catch(()=>'');
            fetch('/api/booking?action=cancel',{method:'POST',
                headers:{'Content-Type':'application/json','Authorization':tok?`Bearer ${tok}`:''},
                body:JSON.stringify({companyId:window.currentCompanyId,appointmentId:apptId})}).catch(()=>{});
        }
        if (typeof showToast === 'function') showToast(t('cancelledWord')||'Скасовано', 'success');
        loadAppointments(id, isGroup);
    } catch(e) { alert('Помилка: '+e.message); }
};

// ── Group Actions ─────────────────────────────────────────
window._bkNewGroup = function() { bk.editGroup = null; renderGroupForm(null); };

window._bkEditGroup = function(groupId) {
    const grp = bk.groups.find(g => g.id === groupId);
    if (!grp) return;
    bk.editGroup = grp;
    renderGroupForm(grp);
};

window._bkDeleteGroup = async function(groupId, name) {
    const msg = `${t('deleteConfirm')||'Видалити'} "${name}"?`;
    const confirmed = window.showConfirmModal
        ? await showConfirmModal(msg, {danger:true})
        : confirm(msg);
    if (!confirmed) return;
    try {
        await window.companyDoc('booking_groups', groupId).delete();
        if (typeof showToast === 'function') showToast(t('deletedOk')||'Видалено', 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast((t('errorWord')||'Помилка')+': '+e.message, 'error');
    }
};

window._bkSaveGroup = async function() {
    const name = (document.getElementById('bk-g-name')?.value||'').trim();
    if (!name) {
        if (typeof showToast === 'function') showToast(t('enterName3')||'Введіть назву','warning');
        return;
    }
    const calendarIds = Array.from(document.querySelectorAll('.bk-g-cal-check:checked')).map(c=>c.value);
    if (calendarIds.length < 2) {
        if (typeof showToast === 'function') showToast(t('bkGroupMinCals')||'Оберіть мінімум 2 календарі','warning');
        return;
    }
    const description = (document.getElementById('bk-g-desc')?.value||'').trim();
    const slug = (document.getElementById('bk-g-slug')?.value||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'-');
    if (!slug) { if(typeof showToast==='function') showToast('Вкажіть URL (slug)','warning'); return; }
    const data = {name, slug, description, calendarIds, updatedAt: firebase.firestore.FieldValue.serverTimestamp()};
    try {
        if (bk.editGroup && bk.editGroup.id) {
            await window.companyDoc('booking_groups', bk.editGroup.id).update(data);
        } else {
            await window.companyCol('booking_groups').add({
                ...data,
                ownerId:   window.currentUser?.uid||'',
                companyId: window.currentCompanyId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        }
        if (typeof showToast === 'function') showToast(t('savedOk2')||'Збережено', 'success');
        window._bkBackToList();
    } catch(e) {
        if (typeof showToast === 'function') showToast((t('errorWord')||'Помилка')+': '+e.message, 'error');
    }
};

// ── Questions ─────────────────────────────────────────────
window._bkCollectQuestions = function() {
    return Array.from(document.querySelectorAll('#bk-questions-list .bk-q-row')).reduce((acc,row,i) => {
        const label = row.querySelector('.bk-q-label')?.value?.trim();
        if (label) acc.push({id:'q'+i,label,type:row.querySelector('.bk-q-type')?.value||'text',required:row.querySelector('.bk-q-required')?.checked||false});
        return acc;
    }, []);
};

window._bkAddQuestion = function() {
    const list = document.getElementById('bk-questions-list');
    if (!list) return;
    const idx = list.querySelectorAll('.bk-q-row').length;
    const div = document.createElement('div');
    div.className = 'bk-q-row'; div.dataset.idx = idx;
    div.style.cssText = 'display:grid;grid-template-columns:1fr auto auto auto;gap:.5rem;align-items:center';
    div.innerHTML = `
      <input type="text" class="bk-q-label" placeholder="${t('questionText')||'Текст питання'}"
             style="padding:.4rem .6rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.85rem">
      <select class="bk-q-type" style="padding:.4rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.82rem">
        <option value="text">Текст</option><option value="phone">Телефон</option>
        <option value="email">Email</option><option value="select">Список</option>
      </select>
      <label style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;white-space:nowrap">
        <input type="checkbox" class="bk-q-required"> ${t('requiredShort')||'Обов.'}
      </label>
      <button class="bk-btn-sm" onclick="this.closest('.bk-q-row').remove()" type="button"
              style="color:#ef4444;padding:.3rem .5rem">&#215;</button>`;
    list.appendChild(div);
    div.querySelector('.bk-q-label')?.focus();
};

window._bkRemoveQuestion = function(idx) {
    document.querySelector(`.bk-q-row[data-idx="${idx}"]`)?.remove();
};

// ── CSS ───────────────────────────────────────────────────
function injectBookingStyles() {
    if (document.getElementById('bk-admin-styles')) return;
    const style = document.createElement('style');
    style.id = 'bk-admin-styles';
    style.textContent = `
#bk-admin{font-family:system-ui,sans-serif}
.bk-header-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:1.25rem}
.bk-page-title{font-size:1.15rem;font-weight:700;display:flex;align-items:center;gap:.4rem;margin:0}
.bk-page-sub{color:#94a3b8;font-size:.82rem;margin-top:.2rem}
.bk-section-divider{display:flex;align-items:center;gap:.75rem;margin:1.5rem 0 .75rem;font-size:.8rem;font-weight:700;color:#374151;flex-wrap:wrap}
.bk-section-hint{font-weight:400;color:#9ca3af;font-size:.75rem}
/* Cards */
.bk-cal-card,.bk-grp-card{background:#fff;border-radius:12px;padding:.9rem 1rem;box-shadow:0 1px 6px rgba(0,0,0,.07);margin-bottom:.6rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.bk-grp-card{border-left:3px solid #6366f1;background:linear-gradient(to right,#fafafe,#fff)}
.bk-cal-card-left,.bk-grp-card-left{display:flex;align-items:flex-start;gap:.75rem;flex:1;min-width:0}
.bk-cal-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:4px}
.bk-grp-icon{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white}
.bk-cal-name{font-weight:600;font-size:.95rem}
.bk-cal-meta{font-size:.8rem;color:#64748b;margin-top:.15rem;display:flex;align-items:center;gap:.25rem;flex-wrap:wrap}
.bk-cal-chip{background:#e0e7ff;color:#4338ca;font-size:.72rem;font-weight:600;padding:.15rem .45rem;border-radius:5px}
.bk-cal-card-actions{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
/* Buttons */
.bk-btn-primary{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:.5rem 1rem;font-size:.88rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.35rem}
.bk-btn-primary:hover{background:#2563eb}
.bk-btn-secondary{background:#f0f4ff;color:#4f46e5;border:1.5px solid #c7d2fe;border-radius:8px;padding:.45rem .9rem;font-size:.86rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.35rem}
.bk-btn-secondary:hover{background:#e0e7ff}
.bk-btn-sm{background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;padding:.3rem .6rem;font-size:.8rem;cursor:pointer;display:inline-flex;align-items:center;gap:.25rem;color:#374151}
.bk-btn-sm:hover{background:#f1f5f9}
.bk-btn-edit{color:#3b82f6;border-color:#bfdbfe}
.bk-btn-back{background:none;border:1px solid #e2e8f0;border-radius:8px;padding:.3rem .7rem;font-size:.85rem;cursor:pointer;display:flex;align-items:center;gap:.3rem}
.bk-btn-back:hover{background:#f8fafc}
.bk-btn-confirm{color:#16a34a;border-color:#bbf7d0}
.bk-btn-cancel-appt{color:#ef4444;border-color:#fecaca}
.bk-select-sm{border:1px solid #e2e8f0;border-radius:7px;padding:.3rem .6rem;font-size:.82rem}
/* Form */
.bk-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
@media(max-width:640px){.bk-form-grid{grid-template-columns:1fr}}
.bk-form-section{background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 6px rgba(0,0,0,.07)}
.bk-section-title{font-weight:700;font-size:.9rem;color:#374151;margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid #f1f5f9}
.bk-field{margin-bottom:.85rem}
.bk-field label{display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.3rem}
.bk-field input[type=text],.bk-field input[type=number],.bk-field input[type=time],.bk-field select,.bk-field textarea{width:100%;padding:.5rem .75rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.88rem;font-family:inherit;box-sizing:border-box}
.bk-field input:focus,.bk-field select:focus{outline:none;border-color:#3b82f6}
.bk-field-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
/* Schedule */
.bk-schedule-grid{display:flex;flex-direction:column;gap:.5rem}
.bk-sched-row{display:flex;align-items:center;gap:.75rem}
.bk-sched-toggle{display:flex;align-items:center;gap:.4rem;font-size:.85rem;min-width:50px;cursor:pointer}
.bk-sched-label{font-weight:600;min-width:24px;color:#374151}
.bk-sched-times{display:flex;align-items:center;gap:.4rem}
.bk-time-input{width:90px!important;font-size:.82rem!important;padding:.35rem .5rem!important}
/* Group calendars selector */
.bk-cal-check-label{display:flex;align-items:center;gap:.55rem;padding:.55rem .75rem;border:1.5px solid #e5e7eb;border-radius:9px;cursor:pointer;background:white;transition:border-color .15s,background .15s}
.bk-cal-check-label:hover{border-color:#a5b4fc}
.bk-cal-check-active{border-color:#6366f1!important;background:#f5f3ff!important}
.bk-cal-color-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
/* Appointments */
.bk-appt-table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.07);font-size:.88rem}
.bk-appt-table th{background:#f8fafc;padding:.6rem 1rem;text-align:left;font-weight:600;font-size:.8rem;color:#64748b;border-bottom:1px solid #e2e8f0}
.bk-appt-table td{padding:.7rem 1rem;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.bk-appt-row:last-child td{border-bottom:none}
.bk-appt-name{font-weight:600;display:flex;align-items:center;gap:.3rem}
.bk-appt-contact{font-size:.78rem;color:#94a3b8;margin-top:.1rem}
/* Badges */
.bk-badge{display:inline-block;padding:.2rem .55rem;border-radius:20px;font-size:.75rem;font-weight:600}
.bk-badge-green{background:#dcfce7;color:#16a34a}
.bk-badge-yellow{background:#fef9c3;color:#a16207}
.bk-badge-red{background:#fee2e2;color:#dc2626}
.bk-badge-gray{background:#f1f5f9;color:#64748b}
/* Utils */
.bk-empty{text-align:center;padding:3rem 1rem;color:#94a3b8;background:#fff;border-radius:12px;box-shadow:0 1px 6px rgba(0,0,0,.07)}
.bk-error{color:#dc2626;padding:1rem}
.bk-loader-row{display:flex;justify-content:center;padding:2.5rem}
.bk-spinner{width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:bk-spin .7s linear infinite}
@keyframes bk-spin{to{transform:rotate(360deg)}}
.bk-week-loading{text-align:center;padding:2rem;color:#94a3b8;font-size:.88rem}
`;
    document.head.appendChild(style);
}

})();

// ════════════════════════════════════════════════════════════
// BEAUTY EXTENSIONS — master choice + slot blocking
// ════════════════════════════════════════════════════════════

// ── Helpers ───────────────────────────────────────────────
function _parseMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h,m] = timeStr.split(':').map(Number);
    return (h||0)*60 + (m||0);
}
function _formatTime(minutes) {
    const h = Math.floor(minutes/60), m = minutes%60;
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
}

// ── Slot availability check (duration + breaks) ───────────
window._bkIsSlotAvailable = async function(date, timeStr, masterId, durationMinutes) {
    if (!masterId || !window.companyCol) return true;
    try {
        const snap = await window.companyCol('booking_appointments')
            .where('masterId','==', masterId)
            .where('date','==', date)
            .get();
        const appts = snap.docs.map(d => d.data()).filter(a => a.status !== 'cancelled');
        const slotStart = _parseMinutes(timeStr);
        const slotEnd   = slotStart + (durationMinutes||60);
        for (const a of appts) {
            const aStart = _parseMinutes(a.timeSlot || a.time);
            const aEnd   = aStart + (a.duration||60);
            if (slotStart < aEnd && slotEnd > aStart) return false;
        }
        return true;
    } catch(e) { return true; }
};

// ── Get available slots for master on a date ──────────────
window._bkGetMasterSlots = async function(date, masterId, durationMinutes) {
    const duration = durationMinutes || 60;
    const schedule = await window.getStaffSchedule?.(masterId);
    if (!schedule) return null; // no schedule = all slots pass through

    const dayMap = ['sun','mon','tue','wed','thu','fri','sat'];
    const dk = dayMap[new Date(date).getDay()];
    const daySchedule = schedule.weeklyHours?.[dk];
    if (!daySchedule?.active) return []; // day off

    const dayStart = _parseMinutes(daySchedule.start || '09:00');
    const dayEnd   = _parseMinutes(daySchedule.end   || '18:00');
    const brkStart = schedule.breakTime ? _parseMinutes(schedule.breakTime.start) : null;
    const brkEnd   = schedule.breakTime ? _parseMinutes(schedule.breakTime.end)   : null;

    // Get existing appointments for conflict check
    let busySlots = [];
    try {
        const snap = await window.companyCol('booking_appointments')
            .where('masterId','==',masterId).where('date','==',date).get();
        busySlots = snap.docs.map(d => d.data())
            .filter(a => a.status !== 'cancelled')
            .map(a => ({ s: _parseMinutes(a.timeSlot||a.time), e: _parseMinutes(a.timeSlot||a.time)+(a.duration||60) }));
    } catch(e) {}

    const slots = [];
    const step = 30; // 30-min grid
    for (let t = dayStart; t + duration <= dayEnd; t += step) {
        const tEnd = t + duration;
        // Skip break
        if (brkStart !== null && t < brkEnd && tEnd > brkStart) continue;
        // Check conflicts
        const conflict = busySlots.some(b => t < b.e && tEnd > b.s);
        if (!conflict) slots.push(_formatTime(t));
    }
    return slots;
};

// ── Complete appointment with master info ─────────────────
window._bkCompleteAppointment = async function(apptId, amount) {
    if (!apptId || !window.companyDoc) return;
    try {
        const doc = await window.companyDoc('booking_appointments', apptId).get();
        if (!doc.exists) return;
        const appt = doc.data();

        // Update appointment status
        await window.companyDoc('booking_appointments', apptId).update({
            status: 'completed',
            amount: amount || 0,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Update client card if phone exists
        if (appt.clientPhone && window.companyCol) {
            const clientSnap = await window.companyCol('crm_clients')
                .where('phone','==', appt.clientPhone).limit(1).get();
            if (!clientSnap.empty) {
                const clientRef = clientSnap.docs[0].ref;
                await clientRef.update({
                    lastVisitDate: appt.date,
                    totalVisits: firebase.firestore.FieldValue.increment(1),
                    totalSpent:  firebase.firestore.FieldValue.increment(amount||0),
                    loyaltyPoints: firebase.firestore.FieldValue.increment(Math.floor((amount||0)/100)),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        window.showToast?.('Запис завершено ✓', 'success');
    } catch(e) { console.error('_bkCompleteAppointment:', e); }
};

// Patch appt table to show master name + complete button
const _origLoadAppts = (typeof loadAppointments !== 'undefined') ? loadAppointments : null;
// Override row rendering to include masterId/masterName columns
window._bkRenderApptRow = function(a, isGroup, calName) {
    const masterBadge = a.masterName
        ? `<div style="font-size:.72rem;color:#8b5cf6;margin-top:.1rem">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" style="vertical-align:-1px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             ${esc(a.masterName)}</div>`
        : '';
    const durationBadge = a.duration
        ? `<div style="font-size:.72rem;color:#64748b;">${a.duration} хв</div>` : '';
    return `<tr class="bk-appt-row">
  <td>
    <div class="bk-appt-name">${I.user} ${esc(a.clientName)}</div>
    <div class="bk-appt-contact">${esc(a.clientEmail)}${a.clientPhone?` &#183; ${esc(a.clientPhone)}`:''}</div>
  </td>
  <td>
    <div style="font-weight:600">${a.date||''}</div>
    <div style="color:#64748b;font-size:.82rem">${a.timeSlot||''}</div>
    ${durationBadge}${masterBadge}
    ${calName?`<div style="font-size:.72rem;color:#6366f1;margin-top:.1rem">&#128197; ${calName}</div>`:''}
  </td>
  <td></td>
  <td>
    ${a.status==='pending'?`<button class="bk-btn-sm bk-btn-confirm" onclick="window._bkConfirmAppt('${a.id}','',false)">${I.check}</button>`:''}
    ${((window.hasModule?.('clientProfile') || window.currentCompanyData?.niche==='beauty_salon')) && ['pending','confirmed'].includes(a.status)?`<button class="bk-btn-sm" onclick="window._bkCompleteAppointment('${a.id}',0)" style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;">✓ Завершити</button>`:''}
    ${['pending','confirmed'].includes(a.status)?`<button class="bk-btn-sm bk-btn-cancel-appt" onclick="window._bkCancelAppt('${a.id}','',false)">${I.close}</button>`:''}
  </td>
</tr>`;
};

console.log('[100-booking] beauty extensions loaded ✓');
