// ============================================================
// ACTIVITY REGISTRY — Реєстр дій співробітників
// Колекція: companies/{id}/activity_log
// Кожен запис: { userId, userName, type, category, meta, at }
// ============================================================
'use strict';

// ── Типи дій ───────────────────────────────────────────────
const AR = {
    // Завдання
    TASK_CREATED:     'task_created',
    TASK_DONE:        'task_done',
    TASK_TO_REVIEW:   'task_to_review',
    TASK_REOPENED:    'task_reopened',
    TASK_EDITED:      'task_edited',
    TASK_COMMENT:     'task_comment',
    TASK_CHECKLIST:   'task_checklist',
    // CRM
    CRM_CALL:         'crm_call',
    CRM_CALL_DONE:    'crm_call_done',
    CRM_SMS:          'crm_sms',
    CRM_EMAIL:        'crm_email',
    CRM_MEETING:      'crm_meeting',
    CRM_NOTE:         'crm_note',
    CRM_STAGE:        'crm_stage',
    CRM_DEAL_CREATED: 'crm_deal_created',
    CRM_DEAL_DELETED: 'crm_deal_deleted',
    // Система
    LOGIN:            'login',
    REPORT_SUBMITTED: 'report_submitted',
};

// SVG іконки для типів (без емодзі)
const AR_ICONS = {
    task_created:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8h6M5 5h6M5 11h4"/></svg>`,
    task_done:        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l3.5 3.5L13 5"/></svg>`,
    task_to_review:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>`,
    task_reopened:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8a4 4 0 1 1 1 2.6M4 11V8h3"/></svg>`,
    task_edited:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 2l3 3-8 8H3v-3L11 2z"/></svg>`,
    task_comment:     `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h12v9H9l-3 3v-3H2z"/></svg>`,
    task_checklist:   `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h2M7 5h6M3 8h2M7 8h6M3 11h2M7 11h4"/></svg>`,
    crm_call:         `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l2.5 2.5-1.5 2 4.5 4.5 2-1.5L13 13l-2 1C7 14 2 9 2 5l1-2z"/></svg>`,
    crm_call_done:    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l2.5 2.5-1.5 2 4.5 4.5 2-1.5L13 13l-2 1C7 14 2 9 2 5l1-2z"/><path d="M10 2l2 2-4 4" stroke="#16a34a"/></svg>`,
    crm_sms:          `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="14" height="9" rx="2"/><path d="M4 7h8M4 10h5"/></svg>`,
    crm_email:        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="14" height="10" rx="1"/><path d="M1 5l7 5 7-5"/></svg>`,
    crm_meeting:      `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="14" height="11" rx="1"/><path d="M1 7h14M5 1v4M11 1v4"/></svg>`,
    crm_note:         `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="1" width="9" height="13" rx="1"/><path d="M11 4l3 3v7h-3V4z"/><path d="M5 5h4M5 8h4M5 11h2"/></svg>`,
    crm_stage:        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8h12M9 4l5 4-5 4"/></svg>`,
    crm_deal_created: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v12M2 8h12"/></svg>`,
    crm_deal_deleted: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l10 10M13 3L3 13"/></svg>`,
    login:            `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3H3v10h3M10 5l4 3-4 3M6 8h8"/></svg>`,
    report_submitted: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 1h7l3 3v11H3z"/><path d="M10 1v3h3"/><path d="M5 8l2 2 4-4"/></svg>`,
};

const AR_COLORS = {
    task_done:        '#16a34a', task_to_review: '#7c3aed',
    task_created:     '#2563eb', task_reopened:  '#b45309',
    task_edited:      '#6b7280', task_comment:   '#0891b2',
    task_checklist:   '#0891b2',
    crm_call:         '#ea580c', crm_call_done:  '#16a34a',
    crm_sms:          '#0891b2', crm_email:      '#6d28d9',
    crm_meeting:      '#be185d', crm_note:       '#6b7280',
    crm_stage:        '#2563eb', crm_deal_created:'#16a34a',
    crm_deal_deleted: '#dc2626',
    login:            '#9ca3af', report_submitted:'#16a34a',
};

const AR_LABELS = {
    task_created:     'Створив задачу',
    task_done:        'Виконав задачу',
    task_to_review:   'Здав на перевірку',
    task_reopened:    'Повернув задачу',
    task_edited:      'Редагував задачу',
    task_comment:     'Додав коментар',
    task_checklist:   'Позначив пункт чекліста',
    crm_call:         'Дзвінок',
    crm_call_done:    'Дзвінок (дозвон)',
    crm_sms:          'SMS',
    crm_email:        'Email',
    crm_meeting:      'Зустріч',
    crm_note:         'Нотатка в CRM',
    crm_stage:        'Зміна стадії угоди',
    crm_deal_created: 'Створив угоду',
    crm_deal_deleted: 'Видалив угоду',
    login:            'Вхід в систему',
    report_submitted: 'Подав звіт',
};

// ── Запис дії ──────────────────────────────────────────────
window.trackAction = async function(type, meta = {}) {
    if (!window.currentCompany || !window.currentUserData) return;
    try {
        await window.companyRef().collection('activity_log').add({
            userId:   window.currentUserData.id || window.currentUserData.uid || '',
            userName: window.currentUserData.name || window.currentUserData.email || 'Unknown',
            userEmail:window.currentUserData.email || '',
            type,
            category: type.startsWith('crm_') ? 'crm' : type.startsWith('task_') ? 'task' : 'system',
            meta,
            at: firebase.firestore.FieldValue.serverTimestamp(),
            date: (new Date()).toISOString().slice(0, 10),
        });
    } catch(e) {
        console.warn('[ActivityRegistry] write error:', e.message);
    }
};

// ── Завантаження і рендер ──────────────────────────────────
let _arListener = null;
let _arFilters  = { userId: '', category: '', date: '', limit: 100 };

window.openActivityRegistry = async function() {
    // Якщо вкладка Контроль вже відкрита — рендеримо туди
    // Інакше відкриваємо модальне вікно
    _renderARModal();
};

function _renderARModal() {
    let modal = document.getElementById('activityRegistryModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'activityRegistryModal';
        modal.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:flex-start;justify-content:center;padding:2rem 1rem;overflow-y:auto;`;
        modal.onclick = e => { if (e.target === modal) closeActivityRegistry(); };
        document.body.appendChild(modal);
    }

    const usersOpts = (window.users || []).map(u =>
        `<option value="${_arEsc(u.id)}">${_arEsc(u.name || u.email)}</option>`
    ).join('');

    modal.innerHTML = `
    <div style="background:white;border-radius:16px;width:100%;max-width:820px;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden;">
        <!-- Шапка -->
        <div style="background:#1f2937;padding:1rem 1.25rem;display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:0.5rem;color:white;">
                <span style="width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;">${AR_ICONS.report_submitted}</span>
                <span style="font-weight:700;font-size:1rem;">Реєстр дій</span>
            </div>
            <button onclick="closeActivityRegistry()" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:1.2rem;line-height:1;">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M3 3l10 10M13 3L3 13"/></svg>
            </button>
        </div>
        <!-- Фільтри -->
        <div style="padding:0.75rem 1.25rem;background:#f8fafc;border-bottom:1px solid #e8eaed;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;">
            <select id="arFilterUser" onchange="applyARFilters()" style="padding:0.3rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.78rem;background:white;min-width:140px;">
                <option value="">Всі співробітники</option>
                ${usersOpts}
            </select>
            <select id="arFilterCat" onchange="applyARFilters()" style="padding:0.3rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.78rem;background:white;">
                <option value="">Всі категорії</option>
                <option value="task">Задачі</option>
                <option value="crm">CRM</option>
                <option value="system">Система</option>
            </select>
            <input type="date" id="arFilterDate" onchange="applyARFilters()"
                style="padding:0.3rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.78rem;background:white;">
            <button onclick="arFilterToday()" style="padding:0.3rem 0.6rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.76rem;background:white;cursor:pointer;font-weight:600;">Сьогодні</button>
            <button onclick="arResetFilters()" style="padding:0.3rem 0.6rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.76rem;background:white;cursor:pointer;color:#6b7280;">Скинути</button>
            <!-- Зведення -->
            <div id="arSummary" style="margin-left:auto;font-size:0.72rem;color:#6b7280;"></div>
        </div>
        <!-- Контент -->
        <div id="arContent" style="padding:1rem 1.25rem;max-height:65vh;overflow-y:auto;">
            <div style="text-align:center;padding:2rem;color:#9ca3af;">Завантаження...</div>
        </div>
    </div>`;

    // Відновлюємо значення фільтрів
    if (_arFilters.userId) document.getElementById('arFilterUser').value = _arFilters.userId;
    if (_arFilters.category) document.getElementById('arFilterCat').value = _arFilters.category;
    if (_arFilters.date) document.getElementById('arFilterDate').value = _arFilters.date;

    loadARData();
}

window.closeActivityRegistry = function() {
    if (_arListener) { _arListener(); _arListener = null; }
    document.getElementById('activityRegistryModal')?.remove();
};

window.applyARFilters = function() {
    _arFilters.userId   = document.getElementById('arFilterUser')?.value || '';
    _arFilters.category = document.getElementById('arFilterCat')?.value  || '';
    _arFilters.date     = document.getElementById('arFilterDate')?.value || '';
    loadARData();
};

window.arFilterToday = function() {
    _arFilters.date = new Date().toISOString().slice(0, 10);
    if (document.getElementById('arFilterDate')) document.getElementById('arFilterDate').value = _arFilters.date;
    loadARData();
};

window.arResetFilters = function() {
    _arFilters = { userId: '', category: '', date: '', limit: 100 };
    ['arFilterUser','arFilterCat','arFilterDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    loadARData();
};

async function loadARData() {
    const content = document.getElementById('arContent');
    if (!content) return;
    content.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af;">Завантаження...</div>';

    try {
        let q = window.companyRef().collection('activity_log')
            .orderBy('at', 'desc').limit(_arFilters.limit || 100);

        if (_arFilters.userId)   q = q.where('userId', '==', _arFilters.userId);
        if (_arFilters.category) q = q.where('category', '==', _arFilters.category);
        if (_arFilters.date)     q = q.where('date', '==', _arFilters.date);

        const snap = await q.get();
        const entries = [];
        snap.forEach(doc => entries.push({ id: doc.id, ...doc.data() }));

        renderAREntries(entries, content);
    } catch(e) {
        content.innerHTML = `<div style="text-align:center;padding:2rem;color:#ef4444;font-size:0.85rem;">Помилка: ${e.message}</div>`;
    }
}

function renderAREntries(entries, content) {
    if (entries.length === 0) {
        content.innerHTML = `
            <div style="text-align:center;padding:3rem;color:#9ca3af;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin:0 auto 0.75rem;display:block;color:#d1d5db;"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M8 8h5M8 16h6"/></svg>
                <div style="font-weight:600;margin-bottom:0.3rem;">Дій не знайдено</div>
                <div style="font-size:0.78rem;">Спробуйте змінити фільтри</div>
            </div>`;
        return;
    }

    // Зведення по людині
    const byUser = {};
    const typeCounts = {};
    entries.forEach(e => {
        byUser[e.userId] = byUser[e.userId] || { name: e.userName, count: 0, done: 0, calls: 0, callsDone: 0, sms: 0, reviews: 0 };
        byUser[e.userId].count++;
        if (e.type === 'task_done')      byUser[e.userId].done++;
        if (e.type === 'crm_call')       byUser[e.userId].calls++;
        if (e.type === 'crm_call_done')  byUser[e.userId].callsDone++;
        if (e.type === 'crm_sms')        byUser[e.userId].sms++;
        if (e.type === 'task_to_review') byUser[e.userId].reviews++;
        typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });

    // Оновлюємо summary
    const sumEl = document.getElementById('arSummary');
    if (sumEl) sumEl.textContent = `${entries.length} дій · ${Object.keys(byUser).length} людей`;

    // Якщо фільтр не по конкретній людині — показуємо зведену таблицю
    const showSummary = !_arFilters.userId;
    let html = '';

    if (showSummary) {
        html += `
        <div style="background:#f8fafc;border-radius:10px;padding:0.75rem;margin-bottom:1rem;overflow-x:auto;">
            <div style="font-size:0.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem;">Зведення по людях</div>
            <table style="width:100%;border-collapse:collapse;font-size:0.78rem;min-width:480px;">
                <thead>
                    <tr style="color:#9ca3af;font-size:0.7rem;">
                        <th style="text-align:left;padding:0.25rem 0.5rem;font-weight:600;">Людина</th>
                        <th style="text-align:center;padding:0.25rem 0.5rem;font-weight:600;">Дій</th>
                        <th style="text-align:center;padding:0.25rem 0.5rem;font-weight:600;">
                            <span style="display:inline-flex;align-items:center;gap:2px;" title="Виконано задач">
                                <span style="width:12px;height:12px;color:#16a34a;">${AR_ICONS.task_done}</span>
                            </span>
                        </th>
                        <th style="text-align:center;padding:0.25rem 0.5rem;font-weight:600;">
                            <span style="display:inline-flex;align-items:center;gap:2px;" title="На перевірку">
                                <span style="width:12px;height:12px;color:#7c3aed;">${AR_ICONS.task_to_review}</span>
                            </span>
                        </th>
                        <th style="text-align:center;padding:0.25rem 0.5rem;font-weight:600;">
                            <span style="display:inline-flex;align-items:center;gap:2px;" title="Дзвінки / Дозвони">
                                <span style="width:12px;height:12px;color:#ea580c;">${AR_ICONS.crm_call}</span>
                            </span>
                        </th>
                        <th style="text-align:center;padding:0.25rem 0.5rem;font-weight:600;">
                            <span style="display:inline-flex;align-items:center;gap:2px;" title="SMS">
                                <span style="width:12px;height:12px;color:#0891b2;">${AR_ICONS.crm_sms}</span>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(byUser).sort((a,b) => b[1].count - a[1].count).map(([uid, d]) => `
                    <tr style="border-top:1px solid #f1f5f9;cursor:pointer;" onclick="arDrillDown('${_arEsc(uid)}')">
                        <td style="padding:0.3rem 0.5rem;font-weight:600;color:#111827;">${_arEsc(d.name)}</td>
                        <td style="text-align:center;padding:0.3rem;color:#6b7280;">${d.count}</td>
                        <td style="text-align:center;padding:0.3rem;color:#16a34a;font-weight:700;">${d.done || '—'}</td>
                        <td style="text-align:center;padding:0.3rem;color:#7c3aed;">${d.reviews || '—'}</td>
                        <td style="text-align:center;padding:0.3rem;color:#ea580c;">
                            ${d.calls > 0 || d.callsDone > 0 ? `${d.calls + d.callsDone} <span style="font-size:0.65rem;color:#16a34a;">(${d.callsDone} ✓)</span>` : '—'}
                        </td>
                        <td style="text-align:center;padding:0.3rem;color:#0891b2;">${d.sms || '—'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <div style="font-size:0.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem;">
            Стрічка дій <span style="font-weight:400;color:#9ca3af;">(натисни рядок в таблиці — фільтр по людині)</span>
        </div>`;
    }

    // Стрічка дій
    let prevDate = '';
    entries.forEach(e => {
        const dateStr = e.date || '';
        if (dateStr !== prevDate) {
            const label = dateStr === new Date().toISOString().slice(0,10) ? 'Сьогодні'
                : dateStr === new Date(Date.now()-86400000).toISOString().slice(0,10) ? 'Вчора'
                : dateStr;
            html += `<div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;padding:0.5rem 0 0.25rem;">${label}</div>`;
            prevDate = dateStr;
        }

        const icon   = AR_ICONS[e.type]  || AR_ICONS.task_edited;
        const color  = AR_COLORS[e.type] || '#6b7280';
        const label  = AR_LABELS[e.type] || e.type;
        const time   = e.at?.toDate?.()
            ? e.at.toDate().toLocaleTimeString('uk-UA', { hour:'2-digit', minute:'2-digit' })
            : '';
        const meta   = e.meta || {};

        // Деталі в залежності від типу
        let detail = '';
        if (meta.taskTitle)  detail = meta.taskTitle;
        if (meta.dealTitle)  detail = meta.dealTitle;
        if (meta.text)       detail = meta.text.slice(0, 60) + (meta.text.length > 60 ? '…' : '');
        if (meta.stageFrom && meta.stageTo) detail = `${_arEsc(meta.stageFrom)} → ${_arEsc(meta.stageTo)}`;

        html += `
        <div style="display:flex;align-items:flex-start;gap:0.6rem;padding:0.45rem 0;border-bottom:1px solid #f1f5f9;">
            <div style="width:28px;height:28px;border-radius:7px;background:${color}18;color:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:4px;">
                ${icon}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                    <span style="font-weight:700;font-size:0.82rem;color:#111827;">${_arEsc(e.userName)}</span>
                    <span style="font-size:0.8rem;color:#374151;">${label}</span>
                    ${detail ? `<span style="font-size:0.76rem;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;" title="${_arEsc(detail)}">${_arEsc(detail)}</span>` : ''}
                </div>
                ${meta.clientName ? `<div style="font-size:0.7rem;color:#9ca3af;margin-top:1px;">Клієнт: ${_arEsc(meta.clientName)}</div>` : ''}
            </div>
            <span style="font-size:0.68rem;color:#9ca3af;flex-shrink:0;padding-top:2px;">${time}</span>
        </div>`;
    });

    content.innerHTML = html;
}

window.arDrillDown = function(userId) {
    _arFilters.userId = userId;
    const sel = document.getElementById('arFilterUser');
    if (sel) sel.value = userId;
    loadARData();
};

function _arEsc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Хуки в існуючий код ────────────────────────────────────
// Патчимо після завантаження всіх модулів
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(_patchExistingFunctions, 3000);
});

function _patchExistingFunctions() {
    // 1. Задачі — статус done
    const origUpdate = window.updateTaskStatus;
    if (origUpdate) {
        window.updateTaskStatus = async function(taskId, newStatus, ...args) {
            const res = await origUpdate(taskId, newStatus, ...args);
            const task = (window.tasks||[]).find(t=>t.id===taskId);
            if (newStatus === 'done')    window.trackAction(AR.TASK_DONE,      { taskId, taskTitle: task?.title });
            if (newStatus === 'review')  window.trackAction(AR.TASK_TO_REVIEW, { taskId, taskTitle: task?.title });
            return res;
        };
    }

    // 2. CRM — додавання активності
    const origCrmAct = window.crmAddActivity;
    if (origCrmAct) {
        window.crmAddActivity = async function(dealId, ...args) {
            const type   = document.getElementById('actType')?.value || 'note';
            const text   = document.getElementById('actText')?.value?.trim() || '';
            const deal   = (window.crm?.deals||[]).find(d=>d.id===dealId);
            const typeMap = {
                call:    AR.CRM_CALL,
                sms:     AR.CRM_SMS,
                email:   AR.CRM_EMAIL,
                meeting: AR.CRM_MEETING,
                note:    AR.CRM_NOTE,
            };
            const arType = typeMap[type] || AR.CRM_NOTE;
            window.trackAction(arType, {
                dealId, dealTitle: deal?.title,
                clientName: deal?.clientName,
                text,
            });
            return origCrmAct(dealId, ...args);
        };
    }

    // 3. CRM — зміна стадії
    const origStage = window.crmQuickSetStage;
    if (origStage) {
        window.crmQuickSetStage = async function(dealId, newStage, ...args) {
            const deal = (window.crm?.deals||[]).find(d=>d.id===dealId);
            window.trackAction(AR.CRM_STAGE, {
                dealId, dealTitle: deal?.title,
                stageFrom: deal?.stage, stageTo: newStage,
            });
            return origStage(dealId, newStage, ...args);
        };
    }

    // 4. CRM — нова угода
    const origNewDeal = window.crmSaveDeal;
    if (origNewDeal) {
        window.crmSaveDeal = async function(...args) {
            const isNew = !window.crm?.editingDealId;
            const res = await origNewDeal(...args);
            if (isNew) window.trackAction(AR.CRM_DEAL_CREATED, {});
            return res;
        };
    }

    // 5. Коментарі до задачі
    const origComment = window.addComment;
    if (origComment) {
        window.addComment = async function(taskId, ...args) {
            const task = (window.tasks||[]).find(t=>t.id===taskId);
            window.trackAction(AR.TASK_COMMENT, { taskId, taskTitle: task?.title });
            return origComment(taskId, ...args);
        };
    }

    console.log('[ActivityRegistry] hooks patched');
}

// Експортуємо типи для використання в інших модулях
window.AR_TYPES = AR;
