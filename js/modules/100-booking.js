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
<div id="bk-admin" style="max-width:900px;margin:0 auto;padding:.5rem 0 2rem">
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
            <div style="font-size:2rem;margin-bottom:.5rem">📅</div>
            <div style="font-weight:600;margin-bottom:.2rem">${t('noCalendarsYet')||'Немає жодного календаря'}</div>
            <div style="color:#94a3b8;font-size:.85rem">${t('createFirstCal')||'Натисніть «+ Новий календар»'}</div>
           </div>`
        : bk.calendars.map(cal => {
            const url = `${base}/api/booking?action=page&companyId=${compId}&calendarId=${cal.id}`;
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
        const url = `${base}/api/booking?action=page&companyId=${compId}&groupId=${grp.id}`;
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
    <div class="bk-field">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-phone-required" ${d.phoneRequired!==false?'checked':''}>
        ${t('phoneRequiredLabel')||'Телефон обов\'язковий'}
      </label>
    </div>
    <div class="bk-field">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-active" ${d.isActive!==false?'checked':''}>
        ${t('activeLabel')||'Активний (доступний для запису)'}
      </label>
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
<div style="margin-top:.75rem;padding:.75rem 1rem;background:#f0f9ff;border-radius:10px;font-size:.82rem;color:#0369a1">
  ${I.link} ${t('bookingLinkLabel')||'Посилання'}:
  <b id="bk-preview-url">${window.location.origin}/api/booking?action=page&companyId=${window.currentCompanyId}&calendarId=${isEdit?cal.id:t('idAfterSave')}</b>
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
           value="${isEdit?esc(grp.name||''):''}">
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
    <span style="font-size:.82rem;color:#166534;word-break:break-all;flex:1">${previewUrl}</span>
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
        phoneRequired:    document.getElementById('bk-f-phone-required')?.checked!==false,
        questions:        window._bkCollectQuestions(),
        maxBookingsPerSlot: 1,
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
    const data = {name, description, calendarIds, updatedAt: firebase.firestore.FieldValue.serverTimestamp()};
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
`;
    document.head.appendChild(style);
}

})();
