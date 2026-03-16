// ============================================================
// js/modules/100-booking.js — TALKO Booking Admin UI
// Вкладка "Запис" в меню Бізнес
// ============================================================
(function () {
'use strict';

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
    settings: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
    back:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    qr:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M21 21h-3v-3"/><path d="M18 15v3"/><path d="M15 18h3"/><path d="M15 15h3"/></svg>',
};

// ── State ─────────────────────────────────────────────────
let bk = {
    calendars: [],
    appointments: [],
    view: 'list',       // 'list' | 'form' | 'appointments'
    editCalendar: null, // null = new, object = edit
    activeCalendarId: '',// calendarId поточної вкладки appointments
    filterCalendarId: '',
    filterStatus: '',
    unsubs: [],
    saving: false,
    apptLoading: false,
};

// Default schedule: Mon-Fri 9-18
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
    loadCalendars();
};

function renderBookingShell() {
    const container = document.getElementById('bookingContainer');
    if (!container) return;
    container.innerHTML = `
<div id="bk-admin" style="max-width:900px;margin:0 auto;padding:.5rem 0 2rem">
  <div id="bk-view-root"></div>
</div>`;
    injectBookingStyles();
    // Event delegation для кнопок карток — безпечно обробляє будь-які дані
    document.getElementById('bk-admin').addEventListener('click', function(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const calId  = btn.dataset.calId;
        const calName = btn.dataset.calName || '';
        const url    = btn.dataset.url;
        if (action === 'appointments') window._bkShowAppointments(calId, calName);
        if (action === 'copy-link')    window._bkCopyLink(url);
        if (action === 'open-link')    window.open(url, '_blank');
        if (action === 'edit')         window._bkEditCalendar(calId);
        if (action === 'toggle')       window._bkToggleCalendar(calId, btn.dataset.active === 'true');
    });
}

// ── Load calendars ────────────────────────────────────────
function loadCalendars() {
    if (!window.companyCol) return;
    // Unsubscribe previous
    bk.unsubs.forEach(u => u && u());
    bk.unsubs = [];

    const unsub = window.companyCol('booking_calendars')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
            bk.calendars = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (bk.view === 'list') renderCalendarList();
        }, err => {
            console.error('[booking] loadCalendars error:', err);
        });
    bk.unsubs.push(unsub);
}

// ── View: Calendar list ───────────────────────────────────
function renderCalendarList() {
    bk.view = 'list';
    const root = document.getElementById('bk-view-root');
    if (!root) return;

    const baseUrl = window.location.origin;
    const compId  = window.currentCompanyId;

    const cards = bk.calendars.length === 0
        ? `<div class="bk-empty">
            <div style="font-size:2.5rem;margin-bottom:.75rem">📅</div>
            <div style="font-weight:600;margin-bottom:.25rem">Немає жодного календаря</div>
            <div style="color:#94a3b8;font-size:.88rem">Створіть перший календар для онлайн-запису</div>
           </div>`
        : bk.calendars.map(cal => {
            const bookUrl = `${baseUrl}/api/booking?action=page&companyId=${compId}&calendarId=${cal.id}`;
            const statusColor = cal.isActive ? '#22c55e' : '#94a3b8';
            const statusText  = cal.isActive ? 'Активний' : 'Вимкнено';
            return `
<div class="bk-cal-card" data-id="${cal.id}">
  <div class="bk-cal-card-left">
    <div class="bk-cal-dot" style="background:${cal.color||'#3b82f6'}"></div>
    <div>
      <div class="bk-cal-name">${window.htmlEsc ? window.htmlEsc(cal.name || '') : (cal.name || '')}</div>
      <div class="bk-cal-meta">
        ${I.clock} ${cal.duration||60} хв
        ${cal.location ? ` &nbsp;·&nbsp; 📍 ${window.htmlEsc ? window.htmlEsc(cal.location) : cal.location}` : ''}
        &nbsp;·&nbsp; <span style="color:${statusColor}">${statusText}</span>
      </div>
    </div>
  </div>
  <div class="bk-cal-card-actions">
    <button class="bk-btn-sm" title="Записи"
            data-action="appointments" data-cal-id="${cal.id}" data-cal-name="${window.htmlEsc ? window.htmlEsc(cal.name||'') : (cal.name||'')}">
      ${I.list} Записи
    </button>
    <button class="bk-btn-sm" title=${window.t('copyLink')}
            data-action="copy-link" data-url="${window.htmlEsc ? window.htmlEsc(bookUrl) : bookUrl}">
      ${I.copy} Посилання
    </button>
    <button class="bk-btn-sm" title=${window.t('openWord')}
            data-action="open-link" data-url="${window.htmlEsc ? window.htmlEsc(bookUrl) : bookUrl}">
      ${I.link}
    </button>
    <button class="bk-btn-sm bk-btn-edit" title="Редагувати"
            data-action="edit" data-cal-id="${cal.id}">
      ${I.edit}
    </button>
    <button class="bk-btn-sm bk-btn-toggle" title="${cal.isActive ? window.t('disableWord') : window.t('enableWord')}"
            data-action="toggle" data-cal-id="${cal.id}" data-active="${!cal.isActive}">
      ${cal.isActive ? I.close : I.check}
    </button>
  </div>
</div>`;
        }).join('');

    root.innerHTML = `
<div class="bk-header-row">
  <div>
    <h2 class="bk-page-title">${I.calendar} Онлайн-запис</h2>
    <div class="bk-page-sub">Calendly-аналог для вашого бізнесу</div>
  </div>
  <button class="bk-btn-primary" onclick="window._bkNewCalendar()">
    ${I.plus} Новий календар
  </button>
</div>

<div id="bk-calendars-list">
  ${cards}
</div>`;
}

// ── View: Calendar form (create/edit) ─────────────────────
function renderCalendarForm(cal) {
    bk.view = 'form';
    bk.editCalendar = cal || null;
    const isEdit = !!cal?.id;
    const root = document.getElementById('bk-view-root');
    if (!root) return;

    const d = cal || {};
    const sched = d._schedule || DEFAULT_SCHEDULE;

    const tzOptions = [
        'Europe/Kiev','Europe/Warsaw','Europe/Berlin','Europe/London',
        'America/New_York','America/Chicago','America/Los_Angeles','UTC',
    ].map(tz => `<option value="${tz}" ${(d.timezone||'Europe/Kiev')===tz?'selected':''}>${tz}</option>`).join('');

    const durationOptions = [15,30,45,60,90,120]
        .map(v => `<option value="${v}" ${(d.duration||60)===v?'selected':''}>${v} хв</option>`).join('');

    const typeOptions = [
        ['one_on_one','Один на один'],
        ['group','Групове'],
    ].map(([v,l]) => `<option value="${v}" ${(d.type||'one_on_one')===v?'selected':''}>${l}</option>`).join('');

    const confirmOptions = [
        ['auto','Автоматично'],
        ['manual',window.t('manualConfirm')],
    ].map(([v,l]) => `<option value="${v}" ${(d.confirmationType||'auto')===v?'selected':''}>${l}</option>`).join('');

    const DAYS = [
        ['mon','Пн'],['tue','Вт'],['wed','Ср'],['thu','Чт'],
        ['fri','Пт'],['sat','Сб'],['sun','Нд'],
    ];

    const schedRows = DAYS.map(([day, label]) => {
        const dayHours = (sched.weeklyHours || {})[day] || [];
        const hasHours = dayHours.length > 0;
        const start = hasHours ? dayHours[0].start : '09:00';
        const end   = hasHours ? dayHours[0].end   : '18:00';
        return `
<div class="bk-sched-row" data-day="${day}">
  <label class="bk-sched-toggle">
    <input type="checkbox" data-day="${day}" class="bk-day-check" ${hasHours?'checked':''}
           onchange="window._bkToggleDay('${day}', this.checked)">
    <span class="bk-sched-label">${label}</span>
  </label>
  <div class="bk-sched-times" id="bk-sched-${day}" style="${hasHours?'':'opacity:.35;pointer-events:none'}">
    <input type="time" class="bk-time-input" id="bk-start-${day}" value="${start}">
    <span style="color:#94a3b8">—</span>
    <input type="time" class="bk-time-input" id="bk-end-${day}" value="${end}">
  </div>
</div>`;
    }).join('');

    root.innerHTML = `
<div class="bk-header-row">
  <div style="display:flex;align-items:center;gap:.75rem">
    <button class="bk-btn-back" onclick="window._bkBackToList()">${I.back} Назад</button>
    <h2 class="bk-page-title">${isEdit ? 'Редагувати календар' : 'Новий календар'}</h2>
  </div>
  <button class="bk-btn-primary" id="bk-save-btn" onclick="window._bkSaveCalendar()">
    ${I.check} Зберегти
  </button>
</div>

<div class="bk-form-grid">
  <!-- Основні налаштування -->
  <div class="bk-form-section">
    <div class="bk-section-title">Основне</div>

    <div class="bk-field">
      <label>Назва календаря *</label>
      <input type="text" id="bk-f-name" placeholder=${window.t('bookingEx2')}
             value="${window.htmlEsc ? window.htmlEsc(d.name||'') : (d.name||'')}" maxlength="80">
    </div>

    <div class="bk-field-row">
      <div class="bk-field">
        <label>Slug (URL) *</label>
        <input type="text" id="bk-f-slug" placeholder="consultation"
               value="${window.htmlEsc ? window.htmlEsc(d.slug||'') : (d.slug||'')}"
               oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')">
      </div>
      <div class="bk-field">
        <label>Тривалість</label>
        <select id="bk-f-duration">${durationOptions}</select>
      </div>
    </div>

    <div class="bk-field-row">
      <div class="bk-field">
        <label>Буфер до (хв)</label>
        <input type="number" id="bk-f-buf-before" value="${d.bufferBefore||0}" min="0" max="60" step="5">
      </div>
      <div class="bk-field">
        <label>Буфер після (хв)</label>
        <input type="number" id="bk-f-buf-after" value="${d.bufferAfter||0}" min="0" max="60" step="5">
      </div>
    </div>

    <div class="bk-field-row">
      <div class="bk-field">
        <label>Тип</label>
        <select id="bk-f-type">${typeOptions}</select>
      </div>
      <div class="bk-field">
        <label>Підтвердження</label>
        <select id="bk-f-confirm">${confirmOptions}</select>
      </div>
    </div>

    <div class="bk-field-row">
      <div class="bk-field">
        <label>Часовий пояс</label>
        <select id="bk-f-tz">${tzOptions}</select>
      </div>
      <div class="bk-field">
        <label>Колір</label>
        <input type="color" id="bk-f-color" value="${d.color||'#3b82f6'}" style="height:36px;width:100%;cursor:pointer">
      </div>
    </div>

    <div class="bk-field">
      <label>Місце проведення</label>
      <input type="text" id="bk-f-location" placeholder="Zoom, Google Meet, адреса..."
             value="${window.htmlEsc ? window.htmlEsc(d.location||'') : (d.location||'')}">
    </div>

    <div class="bk-field">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-phone-required" ${d.phoneRequired!==false?'checked':''}>
        Телефон обов'язковий
      </label>
    </div>

    <div class="bk-field">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="bk-f-active" ${d.isActive!==false?'checked':''}>
        Активний (доступний для запису)
      </label>
    </div>
  </div>

  <!-- Розклад -->
  <div class="bk-form-section">
    <div class="bk-section-title">Розклад доступності</div>
    <div class="bk-schedule-grid">
      ${schedRows}
    </div>
  </div>

  <!-- Додаткові питання -->
  <div class="bk-form-section" style="grid-column:1/-1">
    <div class="bk-section-title" style="display:flex;align-items:center;justify-content:space-between">
      Додаткові питання до клієнта
      <button class="bk-btn-sm" onclick="window._bkAddQuestion()" type="button">+ Додати питання</button>
    </div>
    <div id="bk-questions-list" style="display:flex;flex-direction:column;gap:.5rem">
      ${(d.questions||[]).map((q,i) => `
      <div class="bk-q-row" data-idx="${i}" style="display:grid;grid-template-columns:1fr auto auto auto;gap:.5rem;align-items:center">
        <input type="text" class="bk-q-label" placeholder="Текст питання" value="${window.htmlEsc?window.htmlEsc(q.label||''):(q.label||'')}" style="padding:.4rem .6rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.85rem">
        <select class="bk-q-type" style="padding:.4rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.82rem">
          <option value="text" ${q.type==='text'?'selected':''}>Текст</option>
          <option value="phone" ${q.type==='phone'?'selected':''}>Телефон</option>
          <option value="email" ${q.type==='email'?'selected':''}>Email</option>
          <option value="select" ${q.type==='select'?'selected':''}>Список</option>
        </select>
        <label style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;white-space:nowrap">
          <input type="checkbox" class="bk-q-required" ${q.required?'checked':''}> Обов'язк.
        </label>
        <button class="bk-btn-sm" onclick="window._bkRemoveQuestion(${i})" type="button" style="color:#ef4444;padding:.3rem .5rem">✕</button>
      </div>`).join('')}
    </div>
    <div style="font-size:.78rem;color:#94a3b8;margin-top:.5rem">Ім'я та Email — завжди обов'язкові. Тут додайте специфічні питання для вашого бізнесу.</div>
  </div>
</div>

<div style="margin-top:.75rem;padding:.75rem 1rem;background:#f0f9ff;border-radius:10px;font-size:.82rem;color:#0369a1">
  ${I.link} Посилання на бронювання:
  <b id="bk-preview-url">${window.location.origin}/api/booking?action=page&companyId=${window.currentCompanyId}&calendarId=${isEdit ? cal.id : window.t('idAfterSave')}</b>
</div>`;

    // Auto-generate slug from name
    document.getElementById('bk-f-name').addEventListener('input', function() {
        const slugEl = document.getElementById('bk-f-slug');
        if (!isEdit || !slugEl.value) {
            slugEl.value = this.value.toLowerCase()
                .replace(/[іїєґ]/g, c => ({'і':'i','ї':'i','є':'ie','ґ':'g'}[c]||c))
                .replace(/[а-яёА-ЯЁ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 40);
        }
    });
}

// ── View: Appointments ────────────────────────────────────
async function renderAppointments(calendarId, calendarName) {
    bk.view = 'appointments';
    bk.activeCalendarId = calendarId; // зберігаємо для reload після дій
    const root = document.getElementById('bk-view-root');
    if (!root) return;

    root.innerHTML = `
<div class="bk-header-row">
  <div style="display:flex;align-items:center;gap:.75rem">
    <button class="bk-btn-back" onclick="window._bkBackToList()">${I.back} Назад</button>
    <h2 class="bk-page-title">Записи — ${window.htmlEsc ? window.htmlEsc(calendarName||'') : (calendarName||'')}</h2>
  </div>
  <div style="display:flex;gap:.5rem">
    <select class="bk-select-sm" id="bk-appt-status-filter" onchange="window._bkLoadAppointments('${calendarId}')">
      <option value="">${window.t('allStatuses')}</option>
      <option value="pending">Очікує</option>
      <option value="confirmed">Підтверджено</option>
      <option value="cancelled">Скасовано</option>
      <option value="completed">Завершено</option>
    </select>
  </div>
</div>
<div id="bk-appt-table-wrap">
  <div class="bk-loader-row"><div class="bk-spinner"></div></div>
</div>`;

    await loadAppointments(calendarId);
}

async function loadAppointments(calendarId) {
    const wrap = document.getElementById('bk-appt-table-wrap');
    if (!wrap) return;

    const statusFilter = document.getElementById('bk-appt-status-filter')?.value || '';
    // Важливо: status filter перед orderBy щоб уникнути проблем з Firestore
    let q = window.companyCol('booking_appointments')
        .where('calendarId', '==', calendarId);
    if (statusFilter) q = q.where('status', '==', statusFilter);
    q = q.orderBy('startTime', 'desc').limit(100);

    try {
        const snap = await q.get();
        const appts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (appts.length === 0) {
            wrap.innerHTML = '<div class="bk-empty">' + window.t('noRecords4') + '</div>';
            return;
        }

        const STATUS_LABELS = {
            pending:   '<span class="bk-badge bk-badge-yellow">' + window.t('pendingWord3') + '</span>',
            confirmed: '<span class="bk-badge bk-badge-green">' + window.t('confirmedWord3') + '</span>',
            cancelled: '<span class="bk-badge bk-badge-red">Скасовано</span>',
            completed: '<span class="bk-badge bk-badge-gray">Завершено</span>',
            no_show:   '<span class="bk-badge bk-badge-red">Не з\'явився</span>',
        };

        const rows = appts.map(a => {
            const date = a.date || '';
            const time = a.timeSlot || '';
            const st   = STATUS_LABELS[a.status] || a.status;
            const isPending = a.status === 'pending';
            const isCancellable = ['pending','confirmed'].includes(a.status);
            return `
<tr class="bk-appt-row">
  <td><div class="bk-appt-name">${I.user} ${window.htmlEsc ? window.htmlEsc(a.clientName||'') : (a.clientName||'')}</div>
      <div class="bk-appt-contact">${window.htmlEsc ? window.htmlEsc(a.clientEmail||'') : (a.clientEmail||'')}
        ${a.clientPhone ? ` · ${window.htmlEsc ? window.htmlEsc(a.clientPhone) : a.clientPhone}` : ''}
      </div>
  </td>
  <td><div style="font-weight:600">${date}</div><div style="color:#64748b;font-size:.82rem">${time}</div></td>
  <td>${st}</td>
  <td>
    ${isPending ? `<button class="bk-btn-sm bk-btn-confirm" onclick="window._bkConfirmAppt('${a.id}')" title="Підтвердити">${I.check} Підтвердити</button>` : ''}
    ${isCancellable ? `<button class="bk-btn-sm bk-btn-cancel-appt" onclick="window._bkCancelAppt('${a.id}')" title="Скасувати">${I.close}</button>` : ''}
  </td>
</tr>`;
        }).join('');

        wrap.innerHTML = `
<table class="bk-appt-table">
  <thead><tr><th>Клієнт</th><th>Дата / Час</th><th>Статус</th><th>Дії</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;
    } catch(e) {
        wrap.innerHTML = `<div class="bk-error">Помилка завантаження: ${e.message}</div>`;
    }
}

// ── Actions ───────────────────────────────────────────────
window._bkNewCalendar = function() {
    renderCalendarForm(null);
};

window._bkEditCalendar = async function(calId) {
    const cal = bk.calendars.find(c => c.id === calId);
    if (!cal) return;
    // Load schedule
    try {
        const schedDoc = await window.companyDoc('booking_schedules', calId).get();
        cal._schedule = schedDoc.exists ? schedDoc.data() : DEFAULT_SCHEDULE;
    } catch(e) {
        cal._schedule = DEFAULT_SCHEDULE;
    }
    renderCalendarForm(cal);
};

window._bkBackToList = function() {
    renderCalendarList();
};

window._bkToggleDay = function(day, enabled) {
    const times = document.getElementById('bk-sched-' + day);
    if (times) {
        times.style.opacity   = enabled ? '1'    : '.35';
        times.style.pointerEvents = enabled ? 'auto' : 'none';
    }
};

window._bkSaveCalendar = async function() {
    const nameEl  = document.getElementById('bk-f-name');
    const slugEl  = document.getElementById('bk-f-slug');
    if (!nameEl || !slugEl) return;

    const name = nameEl.value.trim();
    const slug = slugEl.value.trim();
    if (!name) { alert('Вкажіть назву'); nameEl.focus(); return; }
    if (!slug) { alert('Вкажіть slug'); slugEl.focus(); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { alert('Slug може містити тільки малі латинські літери, цифри та дефіс'); slugEl.focus(); return; }

    const saveBtn = document.getElementById('bk-save-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Збереження...'; }

    // Collect schedule з валідацією часу
    const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
    const weeklyHours = {};
    for (const day of DAYS) {
        const check = document.querySelector(`.bk-day-check[data-day="${day}"]`);
        if (check && check.checked) {
            const start = document.getElementById('bk-start-' + day)?.value || '09:00';
            const end   = document.getElementById('bk-end-'   + day)?.value || '18:00';
            // Валідація: end має бути після start
            if (start >= end) {
                alert(`${day.toUpperCase()}: час кінця має бути після початку`);
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '✓ Зберегти'; }
                return;
            }
            weeklyHours[day] = [{ start, end }];
        } else {
            weeklyHours[day] = [];
        }
    }

    // Перевірка що хоча б один день активний
    const hasAnyDay = Object.values(weeklyHours).some(h => h.length > 0);
    if (!hasAnyDay) {
        alert('Виберіть хоча б один робочий день');
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '✓ Зберегти'; }
        return;
    }

    // ВАЖЛИВО: window.currentUserName — це DOM елемент (browser quirk: id → window global)
    // Використовуємо тільки currentUserData і String() для захисту від HTMLElement
    const ownerName = String(
        window.currentUserData?.name
        || window.currentUser?.displayName
        || window.currentUser?.email
        || ''
    ).replace(/<[^>]*>/g, '').trim(); // strip HTML якщо потрапить

    const calData = {
        name,
        slug,
        ownerId:          window.currentUser?.uid || '',
        ownerName,
        duration:         parseInt(document.getElementById('bk-f-duration')?.value) || 60,
        bufferBefore:     parseInt(document.getElementById('bk-f-buf-before')?.value) || 0,
        bufferAfter:      parseInt(document.getElementById('bk-f-buf-after')?.value) || 0,
        timezone:         document.getElementById('bk-f-tz')?.value || 'Europe/Kiev',
        type:             document.getElementById('bk-f-type')?.value || 'one_on_one',
        confirmationType: document.getElementById('bk-f-confirm')?.value || 'auto',
        color:            document.getElementById('bk-f-color')?.value || '#3b82f6',
        location:         document.getElementById('bk-f-location')?.value?.trim() || '',
        isActive:         document.getElementById('bk-f-active')?.checked !== false,
        phoneRequired:    document.getElementById('bk-f-phone-required')?.checked !== false,
        questions:        window._bkCollectQuestions(),
        maxBookingsPerSlot: 1,
    };

    // Перевірка унікальності slug (тільки для нового календаря або зміни slug)
    const isEdit = !!bk.editCalendar?.id;
    const slugChanged = !isEdit || bk.editCalendar?.slug !== slug;
    if (slugChanged) {
        try {
            const existing = await window.companyCol('booking_calendars')
                .where('slug', '==', slug).limit(1).get();
            if (!existing.empty && existing.docs[0].id !== bk.editCalendar?.id) {
                alert(`Slug "${slug}" вже використовується. Виберіть інший.`);
                slugEl.focus();
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '✓ Зберегти'; }
                return;
            }
        } catch(e) { /* non-critical */ }
    }

    const scheduleData = { weeklyHours, dateOverrides: bk.editCalendar?._schedule?.dateOverrides || {} };

    try {
        const batch = firebase.firestore().batch();
        const companyId = window.currentCompanyId;

        let calDocRef;
        if (bk.editCalendar?.id) {
            calDocRef = window.companyDoc('booking_calendars', bk.editCalendar.id);
            batch.update(calDocRef, {
                ...calData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            calDocRef = window.companyCol('booking_calendars').doc();
            batch.set(calDocRef, {
                ...calData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Save schedule
        const schedRef = window.companyDoc('booking_schedules', calDocRef.id);
        batch.set(schedRef, {
            ...scheduleData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        await batch.commit();

        if (typeof showToast === 'function') showToast('Збережено', 'success');
        window._bkBackToList();
    } catch(e) {
        console.error('[booking] save error:', e);
        alert('Помилка збереження: ' + e.message);
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = `${I.check} Зберегти`; }
    }
};

window._bkToggleCalendar = async function(calId, isActive) {
    try {
        await window.companyDoc('booking_calendars', calId).update({
            isActive,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        if (typeof showToast === 'function')
            showToast(isActive ? window.t('enabledWord') : 'Вимкнено', 'success');
    } catch(e) {
        alert('Помилка: ' + e.message);
    }
};

window._bkCopyLink = function(url) {
    navigator.clipboard.writeText(url).then(() => {
        if (typeof showToast === 'function') showToast('Посилання скопійовано', 'success');
    }).catch(() => {
        prompt('Скопіюйте посилання:', url);
    });
};

window._bkShowAppointments = function(calId, calName) {
    renderAppointments(calId, calName);
};

window._bkLoadAppointments = function(calId) {
    loadAppointments(calId);
};

window._bkConfirmAppt = async function(apptId) {
    try {
        await window.companyDoc('booking_appointments', apptId).update({
            status: 'confirmed',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        if (typeof showToast === 'function') showToast(window.t('confirmedWord'), 'success');
        if (bk.activeCalendarId) loadAppointments(bk.activeCalendarId);
    } catch(e) { alert('Помилка: ' + e.message); }
};

window._bkCancelAppt = async function(apptId) {
    if (!confirm('Скасувати запис?')) return;
    try {
        const apptDoc = await window.companyDoc('booking_appointments', apptId).get();
        const appt = apptDoc.data() || {};
        await window.companyDoc('booking_appointments', apptId).update({
            status: 'cancelled',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // Видаляємо Google event через API тільки якщо event існує
        if (appt.googleEventId) {
            // Отримуємо ID token для авторизації
            const idToken = await firebase.auth().currentUser?.getIdToken().catch(() => '');
            fetch('/api/booking?action=cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': idToken ? `Bearer ${idToken}` : '',
                },
                body: JSON.stringify({
                    companyId: window.currentCompanyId,
                    appointmentId: apptId,
                }),
            }).catch(() => {});
        }
        if (typeof showToast === 'function') showToast('Скасовано', 'success');
        // Використовуємо activeCalendarId, fallback на поле з запису
        const calId = bk.activeCalendarId || appt.calendarId || '';
        if (calId) loadAppointments(calId);
    } catch(e) { alert('Помилка: ' + e.message); }
};

// ── Questions management ──────────────────────────────────
window._bkCollectQuestions = function() {
    const rows = document.querySelectorAll('#bk-questions-list .bk-q-row');
    const questions = [];
    rows.forEach((row, i) => {
        const label = row.querySelector('.bk-q-label')?.value?.trim();
        if (!label) return;
        questions.push({
            id:       'q' + i,
            label,
            type:     row.querySelector('.bk-q-type')?.value || 'text',
            required: row.querySelector('.bk-q-required')?.checked || false,
        });
    });
    return questions;
};

window._bkAddQuestion = function() {
    const list = document.getElementById('bk-questions-list');
    if (!list) return;
    const idx = list.querySelectorAll('.bk-q-row').length;
    const div = document.createElement('div');
    div.className = 'bk-q-row';
    div.dataset.idx = idx;
    div.style.cssText = 'display:grid;grid-template-columns:1fr auto auto auto;gap:.5rem;align-items:center';
    div.innerHTML = `
        <input type="text" class="bk-q-label" placeholder="Текст питання"
               style="padding:.4rem .6rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.85rem">
        <select class="bk-q-type" style="padding:.4rem;border:1.5px solid #e2e8f0;border-radius:7px;font-size:.82rem">
          <option value="text">Текст</option>
          <option value="phone">Телефон</option>
          <option value="email">Email</option>
          <option value="select">Список</option>
        </select>
        <label style="font-size:.8rem;display:flex;align-items:center;gap:.3rem;white-space:nowrap">
          <input type="checkbox" class="bk-q-required"> Обов'язк.
        </label>
        <button class="bk-btn-sm" onclick="this.closest('.bk-q-row').remove()" type="button"
                style="color:#ef4444;padding:.3rem .5rem">✕</button>`;
    list.appendChild(div);
    div.querySelector('.bk-q-label')?.focus();
};

window._bkRemoveQuestion = function(idx) {
    const row = document.querySelector(`.bk-q-row[data-idx="${idx}"]`);
    if (row) row.remove();
};

// ── CSS injection ─────────────────────────────────────────
function injectBookingStyles() {
    if (document.getElementById('bk-admin-styles')) return;
    const style = document.createElement('style');
    style.id = 'bk-admin-styles';
    style.textContent = `
#bk-admin { font-family: system-ui, sans-serif; }
.bk-header-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; margin-bottom:1.25rem; }
.bk-page-title { font-size:1.15rem; font-weight:700; display:flex; align-items:center; gap:.4rem; margin:0; }
.bk-page-sub { color:#94a3b8; font-size:.82rem; margin-top:.2rem; }

/* Calendar cards */
.bk-cal-card { background:#fff; border-radius:12px; padding:.9rem 1rem; box-shadow:0 1px 6px rgba(0,0,0,.07); margin-bottom:.6rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
.bk-cal-card-left { display:flex; align-items:center; gap:.75rem; }
.bk-cal-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
.bk-cal-name { font-weight:600; font-size:.95rem; }
.bk-cal-meta { font-size:.8rem; color:#64748b; margin-top:.15rem; display:flex; align-items:center; gap:.25rem; flex-wrap:wrap; }
.bk-cal-card-actions { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; }

/* Buttons */
.bk-btn-primary { background:#3b82f6; color:#fff; border:none; border-radius:8px; padding:.5rem 1rem; font-size:.88rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:.35rem; }
.bk-btn-primary:hover { background:#2563eb; }
.bk-btn-sm { background:#f8fafc; border:1px solid #e2e8f0; border-radius:7px; padding:.3rem .6rem; font-size:.8rem; cursor:pointer; display:inline-flex; align-items:center; gap:.25rem; color:#374151; }
.bk-btn-sm:hover { background:#f1f5f9; }
.bk-btn-edit { color:#3b82f6; border-color:#bfdbfe; }
.bk-btn-back { background:none; border:1px solid #e2e8f0; border-radius:8px; padding:.3rem .7rem; font-size:.85rem; cursor:pointer; display:flex; align-items:center; gap:.3rem; }
.bk-btn-back:hover { background:#f8fafc; }
.bk-btn-confirm { color:#16a34a; border-color:#bbf7d0; }
.bk-btn-cancel-appt { color:#ef4444; border-color:#fecaca; }
.bk-select-sm { border:1px solid #e2e8f0; border-radius:7px; padding:.3rem .6rem; font-size:.82rem; }

/* Form */
.bk-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
@media(max-width:640px) { .bk-form-grid { grid-template-columns:1fr; } }
.bk-form-section { background:#fff; border-radius:12px; padding:1.25rem; box-shadow:0 1px 6px rgba(0,0,0,.07); }
.bk-section-title { font-weight:700; font-size:.9rem; color:#374151; margin-bottom:1rem; padding-bottom:.5rem; border-bottom:1px solid #f1f5f9; }
.bk-field { margin-bottom:.85rem; }
.bk-field label { display:block; font-size:.82rem; font-weight:600; color:#374151; margin-bottom:.3rem; }
.bk-field input[type=text],.bk-field input[type=email],.bk-field input[type=tel],.bk-field input[type=number],.bk-field input[type=time],.bk-field select,.bk-field textarea { width:100%; padding:.5rem .75rem; border:1.5px solid #e2e8f0; border-radius:8px; font-size:.88rem; font-family:inherit; }
.bk-field input:focus,.bk-field select:focus { outline:none; border-color:#3b82f6; }
.bk-field-row { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }

/* Schedule */
.bk-schedule-grid { display:flex; flex-direction:column; gap:.5rem; }
.bk-sched-row { display:flex; align-items:center; gap:.75rem; }
.bk-sched-toggle { display:flex; align-items:center; gap:.4rem; font-size:.85rem; font-weight:500; min-width:50px; cursor:pointer; }
.bk-sched-label { font-weight:600; min-width:24px; color:#374151; }
.bk-sched-times { display:flex; align-items:center; gap:.4rem; }
.bk-time-input { width:90px !important; font-size:.82rem !important; padding:.35rem .5rem !important; }

/* Appointments table */
.bk-appt-table { width:100%; border-collapse:collapse; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 6px rgba(0,0,0,.07); font-size:.88rem; }
.bk-appt-table th { background:#f8fafc; padding:.6rem 1rem; text-align:left; font-weight:600; font-size:.8rem; color:#64748b; border-bottom:1px solid #e2e8f0; }
.bk-appt-table td { padding:.7rem 1rem; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
.bk-appt-row:last-child td { border-bottom:none; }
.bk-appt-name { font-weight:600; display:flex; align-items:center; gap:.3rem; }
.bk-appt-contact { font-size:.78rem; color:#94a3b8; margin-top:.1rem; }

/* Badges */
.bk-badge { display:inline-block; padding:.2rem .55rem; border-radius:20px; font-size:.75rem; font-weight:600; }
.bk-badge-green  { background:#dcfce7; color:#16a34a; }
.bk-badge-yellow { background:#fef9c3; color:#a16207; }
.bk-badge-red    { background:#fee2e2; color:#dc2626; }
.bk-badge-gray   { background:#f1f5f9; color:#64748b; }

/* Utils */
.bk-empty { text-align:center; padding:3rem 1rem; color:#94a3b8; background:#fff; border-radius:12px; box-shadow:0 1px 6px rgba(0,0,0,.07); }
.bk-error { color:#dc2626; padding:1rem; }
.bk-loader-row { display:flex; justify-content:center; padding:2.5rem; }
.bk-spinner { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:bk-spin .7s linear infinite; }
@keyframes bk-spin { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(style);
}

})();
