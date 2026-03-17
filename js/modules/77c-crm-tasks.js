// ============================================================
// js/modules/77c-crm-tasks.js — CRM авто-задачі по стадіях
//
// Логіка:
//   - owner налаштовує шаблони задач для кожної стадії воронки
//   - При переході угоди в стадію → автоматично створюються задачі
//   - Задачі зберігаються в crm_deals/{id}/tasks
//   - Також рендеримо таб "Задачі" в картці угоди
//
// Структура шаблону (crm_pipelines/{id}/taskTemplates):
//   { stageId, title, dueDays, assignTo: 'assignee'|'creator'|'me' }
// ============================================================

// ── Авто-задачі при зміні стадії ───────────────────────────
window.crmAutoTasksOnStageChange = async function (deal, newStage) {
    if (!deal?.id || !newStage) return;
    const pipeline = window.crm?.pipeline;
    if (!pipeline?.taskTemplates) return;

    const templates = (pipeline.taskTemplates || []).filter(t => t.stageId === newStage && t.title);
    if (!templates.length) return;

    const compRef = window.companyRef();
    if (!compRef) return; // компанія не завантажена
    const uid     = window.currentUser?.uid || '';
    const email   = window.currentUser?.email || '';

    for (const tpl of templates) {
        const dueDate = _calcDueDate(tpl.dueDays || 1);
        const assigneeId = tpl.assignTo === 'me'      ? uid
                         : tpl.assignTo === 'creator' ? (deal.creatorId  || uid)
                         :                               (deal.assigneeId || uid); // 'assignee' default

        const _assignee = window.currentUserData?.name || email || '';
        const _today = new Date().toISOString().slice(0, 10);
        await compRef.collection(window.DB_COLS?.TASKS || 'tasks').add({
            title:        tpl.title,
            dueDate:      dueDate,
            deadlineDate: dueDate || _today,
            deadlineTime: '18:00',
            deadline:     (dueDate || _today) + 'T18:00',
            createdDate:  _today,
            assigneeId:   assigneeId,
            assigneeName: _assignee,
            creatorId:    uid,
            creatorName:  _assignee,
            status:       'new',
            priority:     tpl.priority || 'medium',
            pinned:       false,
            autoCreated:  true,
            source:       'crm_stage',
            dealId:       deal.id,
            clientName:   deal.clientName || deal.title || '',
            fromStage:    newStage,
            createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:    firebase.firestore.FieldValue.serverTimestamp(),
        }).catch(e => console.warn('[CRM autoTask]', e.message));
    }

    // Оновити таб задач якщо відкритий
    const tasksContainer = document.getElementById('crmDealTasksList');
    if (tasksContainer && window._crmActiveDealId === deal.id) {
        window.crmRenderDealTasks(deal.id);
    }
};

function _calcDueDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + (parseInt(days) || 1));
    return d.toISOString().split('T')[0];
}

// ── Таб "Задачі" в картці угоди ────────────────────────────
window.crmRenderDealTasks = async function (dealId) {
    const c = document.getElementById('crmDealTasksList');
    if (!c) return;
    c.innerHTML = '<div style="text-align:center;padding:1rem;color:#9ca3af;font-size:0.8rem;">Завантаження...</div>';

    try {
        const snap = await window.companyRef()
            .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
            .doc(dealId).collection('tasks')
            .orderBy('createdAt', 'desc').limit(200).get(); // safety limit

        const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        _crmRenderTasksList(c, tasks, dealId);
    } catch (e) {
        c.innerHTML = `<div style="color:#ef4444;font-size:0.78rem;padding:0.5rem;">Помилка: ${e.message}</div>`;
    }
};

function _crmRenderTasksList(container, tasks, dealId) {
    const open   = tasks.filter(t => t.status !== 'done');
    const done   = tasks.filter(t => t.status === 'done');
    const users  = window.users || [];
    const today  = new Date().toISOString().split('T')[0];

    const taskHtml = (t) => {
        const overdue  = t.status !== 'done' && t.dueDate && t.dueDate < today;
        const assignee = users.find(u => u.id === t.assigneeId);
        return `
        <div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.5rem 0.6rem;
            border-radius:7px;background:${t.status==='done'?'#f8fafc':'white'};
            border:1px solid ${overdue?'#fecaca':t.status==='done'?'#f1f5f9':'#e8eaed'};
            margin-bottom:0.3rem;opacity:${t.status==='done'?'0.6':'1'};">
            <input type="checkbox" ${t.status==='done'?'checked':''}
                onchange="crmToggleDealTask('${dealId}','${t.id}',this.checked)"
                style="margin-top:2px;accent-color:#22c55e;flex-shrink:0;">
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.8rem;color:#111827;font-weight:500;
                    text-decoration:${t.status==='done'?'line-through':'none'};
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${(window.htmlEsc ? window.htmlEsc(t.title) : String(t.title||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')) || '—'}
                </div>
                <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:2px;">
                    ${t.dueDate ? `<span style="font-size:0.68rem;color:${overdue?'#ef4444':'#9ca3af'};">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${t.dueDate}${overdue?' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>️':''}</span>` : ''}
                    ${assignee ? `<span style="font-size:0.68rem;color:#6b7280;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${window.htmlEsc ? window.htmlEsc(assignee.name||assignee.email||'') : String(assignee.name||assignee.email||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>` : ''}
                    ${t.autoCreated ? `<span style="font-size:0.65rem;background:#f0fdf4;color:#16a34a;padding:1px 5px;border-radius:3px;">авто</span>` : ''}
                </div>
            </div>
            <button onclick="crmDeleteDealTask('${dealId}','${t.id}')"
                style="background:none;border:none;cursor:pointer;color:#d1d5db;font-size:0.8rem;
                flex-shrink:0;padding:2px;" title="Видалити"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>`;
    };

    container.innerHTML = `
    <!-- Додати задачу -->
    <div style="display:flex;gap:0.4rem;margin-bottom:0.75rem;">
        <input id="crmNewTaskInput_${dealId}" placeholder="Нова задача..."
            onkeydown="if(event.key==='Enter')crmAddDealTask('${dealId}')"
            style="flex:1;padding:0.4rem 0.6rem;border:1px solid #e8eaed;border-radius:7px;
            font-size:0.8rem;outline:none;">
        <input type="date" id="crmNewTaskDue_${dealId}" value="${today}"
            style="padding:0.4rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.78rem;width:130px;">
        <button onclick="crmAddDealTask('${dealId}')"
            style="padding:0.4rem 0.7rem;background:#22c55e;color:white;border:none;
            border-radius:7px;cursor:pointer;font-size:0.8rem;font-weight:600;">+</button>
    </div>

    <!-- Відкриті задачі -->
    ${open.length ? open.map(taskHtml).join('') : '<div style="font-size:0.78rem;color:#9ca3af;padding:0.25rem;">Задач немає</div>'}

    <!-- Виконані -->
    ${done.length ? `
    <div style="margin-top:0.75rem;">
        <div style="font-size:0.72rem;color:#9ca3af;margin-bottom:0.4rem;font-weight:600;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Виконані (${done.length})
        </div>
        ${done.map(taskHtml).join('')}
    </div>` : ''}`;
}

// ── CRUD задач угоди ────────────────────────────────────────
window.crmAddDealTask = async function (dealId) {
    const inp = document.getElementById(`crmNewTaskInput_${dealId}`);
    const due = document.getElementById(`crmNewTaskDue_${dealId}`);
    const title = inp?.value.trim();
    if (!title) return;

    inp.disabled = true;
    try {
        await window.companyRef()
            .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
            .doc(dealId).collection('tasks').add({
                title,
                dueDate:    due?.value || '',
                assigneeId: window.currentUser?.uid || '',
                status:     'open',
                autoCreated: false,
                createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
                createdBy:  window.currentUser?.email || '',
            });
        inp.value = '';
        window.crmRenderDealTasks(dealId);
    } catch (e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    } finally {
        inp.disabled = false;
        inp?.focus();
    }
};

window.crmToggleDealTask = async function (dealId, taskId, done) {
    await window.companyRef()
        .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
        .doc(dealId).collection('tasks').doc(taskId)
        .update({ status: done ? 'done' : 'open', updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch(e => console.warn('[CRM task toggle]', e));
    window.crmRenderDealTasks(dealId);
};

window.crmDeleteDealTask = async function (dealId, taskId) {
    await window.companyRef()
        .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
        .doc(dealId).collection('tasks').doc(taskId).delete()
        .catch(e => console.warn('[CRM task delete]', e));
    window.crmRenderDealTasks(dealId);
};

// ── Налаштування шаблонів задач в Settings ─────────────────
window.crmRenderTaskTemplatesSettings = function () {
    if (!window.crmAccess?.canViewAll()) return '';
    const pipeline = window.crm?.pipeline;
    if (!pipeline) return '';

    const stages    = (pipeline.stages || []).filter(s => !['won','lost'].includes(s.id)).sort((a,b) => a.order - b.order);
    const templates = pipeline.taskTemplates || [];

    const selStyle = 'padding:0.25rem 0.4rem;border:1px solid #e8eaed;border-radius:5px;font-size:0.73rem;';

    return `
    <div style="background:white;border-radius:10px;padding:1.1rem;border:1px solid #e8eaed;">
        <div style="font-weight:700;font-size:0.82rem;color:#111827;margin-bottom:0.3rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Авто-задачі при переході стадії
        </div>
        <div style="font-size:0.71rem;color:#9ca3af;margin-bottom:0.85rem;">
            При переході угоди в стадію — задачі створюються автоматично
        </div>

        <div id="crmTaskTemplatesList" style="display:flex;flex-direction:column;gap:0.4rem;">
            ${templates.map((t, i) => _taskTemplateRow(t, i, stages)).join('')}
        </div>

        <button onclick="crmAddTaskTemplate()"
            style="margin-top:0.6rem;width:100%;padding:0.4rem;background:#f0fdf4;color:#16a34a;
            border:1px solid #bbf7d0;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">
            + Додати шаблон задачі
        </button>
    </div>`;
};

function _taskTemplateRow(t, i, stages) {
    const selStyle = 'padding:0.25rem 0.35rem;border:1px solid #e8eaed;border-radius:5px;font-size:0.72rem;background:white;';
    return `
    <div style="display:flex;align-items:center;gap:0.4rem;padding:0.5rem 0.6rem;
        background:#f8fafc;border:1px solid #e8eaed;border-radius:7px;flex-wrap:wrap;">
        <input value="${t.title||''}" placeholder=${window.t('taskNamePh')}
            onchange="crmUpdateTaskTemplate(${i},'title',this.value)"
            style="flex:2;min-width:120px;padding:0.25rem 0.4rem;border:1px solid #e8eaed;
            border-radius:5px;font-size:0.78rem;">
        <select onchange="crmUpdateTaskTemplate(${i},'stageId',this.value)" style="${selStyle}flex:1;min-width:100px;">
            ${stages.map(s => `<option value="${s.id}" ${t.stageId===s.id?'selected':''}>${s.label}</option>`).join('')}
        </select>
        <div style="display:flex;align-items:center;gap:0.25rem;">
            <input type="number" min="1" max="90" value="${t.dueDays||1}"
                onchange="crmUpdateTaskTemplate(${i},'dueDays',parseInt(this.value)||1)"
                style="${selStyle}width:50px;">
            <span style="font-size:0.7rem;color:#6b7280;">дн.</span>
        </div>
        <select onchange="crmUpdateTaskTemplate(${i},'assignTo',this.value)" style="${selStyle}">
            <option value="assignee" ${t.assignTo==='assignee'?'selected':''}>Відповідальному</option>
            <option value="creator"  ${t.assignTo==='creator'?'selected':''}>Автору угоди</option>
            <option value="me"       ${t.assignTo==='me'?'selected':''}>Мені</option>
        </select>
        <button onclick="crmRemoveTaskTemplate(${i})"
            style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px;font-size:1rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>`;
}

window.crmAddTaskTemplate = function () {
    const pipeline = window.crm?.pipeline;
    if (!pipeline) return;
    if (!pipeline.taskTemplates) pipeline.taskTemplates = [];
    const firstStage = (pipeline.stages||[]).filter(s=>!['won','lost'].includes(s.id)).sort((a,b)=>a.order-b.order)[0];
    pipeline.taskTemplates.push({ title:'', stageId: firstStage?.id||'', dueDays:1, assignTo:'assignee' });
    _crmRefreshTaskTemplatesUI();
};

window.crmUpdateTaskTemplate = function (idx, field, val) {
    const pipeline = window.crm?.pipeline;
    if (!pipeline?.taskTemplates?.[idx]) return;
    pipeline.taskTemplates[idx][field] = val;
};

window.crmRemoveTaskTemplate = function (idx) {
    const pipeline = window.crm?.pipeline;
    if (!pipeline?.taskTemplates) return;
    pipeline.taskTemplates.splice(idx, 1);
    _crmRefreshTaskTemplatesUI();
};

function _crmRefreshTaskTemplatesUI() {
    const container = document.getElementById('crmTaskTemplatesList');
    if (!container) return;
    const pipeline = window.crm?.pipeline;
    const templates = pipeline?.taskTemplates || [];
    const stages = (pipeline?.stages||[]).filter(s=>!['won','lost'].includes(s.id)).sort((a,b)=>a.order-b.order);
    container.innerHTML = templates.map((t,i) => _taskTemplateRow(t,i,stages)).join('');
}

window.crmSaveTaskTemplates = async function () {
    const pipeline = window.crm?.pipeline;
    if (!pipeline?.id) return;
    const comp = window.currentCompanyId || window.companyId;
    if (!comp) return;
    try {
        await firebase.firestore().doc(`companies/${comp}/crm_pipelines/${pipeline.id}`)
            .update({ taskTemplates: pipeline.taskTemplates || [], updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (window.showToast) showToast('Шаблони задач збережено', 'success');
    } catch (e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};
