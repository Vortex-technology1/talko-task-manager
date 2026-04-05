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
        // Формуємо вкладення якщо шаблон має файл
        const attachments = tpl.fileUrl ? [{
            url:  tpl.fileUrl,
            name: tpl.fileName || 'file',
            type: tpl.fileName?.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
            isTemplate: true,
        }] : [];

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
            crmDealId:    deal.id,
            clientName:   deal.clientName || deal.title || '',
            fromStage:    newStage,
            ...(attachments.length ? { attachments } : {}),
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
// crmRenderDealTasks — делегує в _loadTasksTab з 77-crm.js (єдина реалізація)
// Зберігаємо для зворотної сумісності (викликається з crmAutoTasksOnStageChange і crmToggleDealTask)
window.crmRenderDealTasks = function (dealId) {
    // Якщо відкрита картка угоди і активний таб tasks — перезавантажуємо через _loadTasksTab
    const activeDealId = window.crm?.activeDealId;
    if (activeDealId === dealId && typeof window._crmLoadTasksTab === 'function') {
        const deal = window.crm?.deals?.find(d => d.id === dealId);
        if (deal) window._crmLoadTasksTab(deal);
        return;
    }
    // Fallback: якщо картка не відкрита — просто оновлюємо локальний масив tasks
    // (scheduleRender підхопить зміни через onSnapshot в _loadTasksTab)
    if (window.scheduleRender) window.scheduleRender();
};

function _crmRenderTasksList(container, tasks, dealId) {
    const open = tasks.filter(t => t.status !== 'done');
    const done = tasks.filter(t => t.status === 'done');
    const users = window.users || [];
    const today = new Date().toISOString().split('T')[0];
    const _esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const taskHtml = (t) => {
        const dl = t.deadlineDate || t.dueDate || '';
        const overdue = t.status !== 'done' && dl && dl < today;
        const assignee = users.find(u => u.id === t.assigneeId);
        const pc = t.priority === 'high' ? '#ef4444' : t.priority === 'low' ? '#22c55e' : '#f59e0b';
        return `<div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.5rem 0.6rem;border-radius:7px;background:${t.status==='done'?'#f8fafc':'white'};border:1px solid ${overdue?'#fecaca':t.status==='done'?'#f1f5f9':'#e8eaed'};margin-bottom:0.3rem;opacity:${t.status==='done'?'0.65':'1'};">
            <input type="checkbox" ${t.status==='done'?'checked':''} onchange="crmToggleDealTask('${dealId}','${t.id}',this.checked)" style="margin-top:3px;accent-color:#22c55e;flex-shrink:0;">
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.8rem;color:#111827;font-weight:500;text-decoration:${t.status==='done'?'line-through':'none'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(t.title)}</div>
                <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:2px;align-items:center;">
                    ${dl?`<span style="font-size:0.68rem;color:${overdue?'#ef4444':'#9ca3af'};display:flex;align-items:center;gap:2px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${dl}</span>`:''}
                    ${assignee?`<span style="font-size:0.68rem;color:#6b7280;display:flex;align-items:center;gap:2px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${_esc(assignee.name||assignee.email||'')}</span>`:''}
                    ${t.priority?`<span style="font-size:0.62rem;background:${pc}18;color:${pc};padding:1px 5px;border-radius:3px;font-weight:600;">${t.priority==='high'?'Висок.':t.priority==='low'?'Низьк.':'Середн.'}</span>`:''}
                    ${t.autoCreated?`${window.t('spanStylefontsize062rembackgroundf0fdf4c')}`:''}
                    ${t.status==='review'?`${window.t('spanStylefontsize062rembackgroundeef2ffc')}`:''}
                </div>
            </div>
            <div style="display:flex;gap:3px;flex-shrink:0;">
                <button onclick="crmOpenDealTask('${t.id}')" title="Відкрити повну задачу" style="background:none;border:1px solid #e5e7eb;cursor:pointer;color:#6b7280;padding:3px 6px;border-radius:5px;display:flex;align-items:center;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
                <button onclick="crmDeleteDealTask('${dealId}','${t.id}')" style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:3px;" title=window.t('видалити')><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
        </div>`;
    };

    container.innerHTML = `
    <div style="background:#f8fafc;border:1px solid #e8eaed;border-radius:8px;padding:0.6rem;margin-bottom:0.75rem;">
        <input id="crmNewTaskInput_${dealId}" placeholder=window.t('назваЗавдання') onkeydown="if(event.key===\'Enter\')crmAddDealTask(\'${dealId}\')"
            style="width:100%;padding:0.4rem 0.6rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.8rem;outline:none;box-sizing:border-box;margin-bottom:0.4rem;">
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
            <input type="date" id="crmNewTaskDue_${dealId}" value="${today}" style="flex:1;min-width:100px;padding:0.35rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.75rem;">
            <select id="crmNewTaskAssignee_${dealId}" style="flex:1;min-width:100px;padding:0.35rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.75rem;">
                <option value="${window.currentUser?.uid||''}">${_esc(window.currentUserData?.name||'Я')}</option>
                ${(window.users||[]).filter(u=>u.id!==window.currentUser?.uid).map(u=>`<option value="${u.id}">${_esc(u.name||u.email)}</option>`).join('')}
            </select>
            <select id="crmNewTaskPriority_${dealId}" style="padding:0.35rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.75rem;">
                <option value="medium">Середній</option><option value="high">Високий</option><option value="low">Низький</option>
            </select>
            <button onclick="crmAddDealTask(\'${dealId}\')" style="padding:0.35rem 0.75rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.8rem;font-weight:600;">+ Задача</button>
        </div>
    </div>
    ${open.length ? open.map(taskHtml).join('') : '<div style="font-size:0.78rem;color:#9ca3af;padding:0.25rem 0;">Задач немає</div>'}
    ${done.length ? `<div style="margin-top:0.75rem;"><div style="font-size:0.72rem;color:#9ca3af;margin-bottom:0.4rem;font-weight:600;display:flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Виконані (${done.length})</div>${done.map(taskHtml).join('')}</div>` : ''}`;
}

window.crmAddDealTask = async function (dealId) {
    const inp = document.getElementById(`crmNewTaskInput_${dealId}`);
    const due = document.getElementById(`crmNewTaskDue_${dealId}`);
    const assignSel = document.getElementById(`crmNewTaskAssignee_${dealId}`);
    const priorSel = document.getElementById(`crmNewTaskPriority_${dealId}`);
    const title = inp?.value.trim();
    if (!title) { inp?.focus(); return; }
    const assigneeId = assignSel?.value || window.currentUser?.uid || '';
    const assigneeName = (window.users||[]).find(u=>u.id===assigneeId)?.name || window.currentUserData?.name || '';
    const priority = priorSel?.value || 'medium';
    const deadlineDate = due?.value || new Date().toISOString().split('T')[0];
    const deal = window.crm?.deals?.find(d => d.id === dealId);
    inp.disabled = true;
    try {
        const taskRef = await window.companyRef()
            .collection(window.DB_COLS?.TASKS || 'tasks').add({
                title, status: 'new', priority, assigneeId, assigneeName,
                creatorId:   window.currentUser?.uid || '',
                creatorName: window.currentUserData?.name || window.currentUser?.email || '',
                deadlineDate, deadlineTime: '18:00',
                deadline:    deadlineDate + 'T18:00',
                createdDate: new Date().toISOString().split('T')[0],
                description: '',
                function:    '',
                projectId:   '',
                stageId:     '',
                pinned:      false,
                requireReview:    false,
                coExecutorIds:    [],
                observerIds:      [],
                notifyOnComplete: [],
                checklist:        [],
                // CRM-специфіка
                dealId, crmDealId: dealId,
                source:      'crm_manual',
                clientName:  deal?.clientName || deal?.title || '',
                crmClientName: deal?.clientName || deal?.title || '',
                clientPhone: deal?.phone || '',
                autoCreated: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        // Audit log + ET — та сама логіка що і в стандартній формі задачі
        if (typeof logTaskChange === 'function') {
            logTaskChange(taskRef.id, 'created', { title, assigneeId, deadlineDate }, null).catch(() => {});
        }
        if (typeof window.trackTaskCreated === 'function') {
            window.trackTaskCreated(taskRef.id, { title, assigneeId, dealId, crmDealId: dealId, status: 'new' });
        }
        inp.value = '';
        if (window.showToast) showToast('Задачу створено і додано в "Мій день"', 'success');
        if (window.tasks && Array.isArray(window.tasks)) {
            window.tasks.push({ id: taskRef.id, title, status: 'new', priority, assigneeId, assigneeName, deadlineDate, dealId, crmDealId: dealId, source: 'crm_manual', clientName: deal?.clientName || '' });
        }
        window.crmRenderDealTasks(dealId);
    } catch (e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    } finally { inp.disabled = false; inp?.focus(); }
};

window.crmOpenDealTask = function(taskId) {
    if (typeof openTaskModal === 'function') openTaskModal(taskId);
    else if (typeof window.openTaskModal === 'function') window.openTaskModal(taskId);
    else if (window.showToast) showToast('Відкрийте вкладку "Задачі" для деталей', 'info');
};

window.crmToggleDealTask = async function (dealId, taskId, done) {
    try {
        const allTasks = window.tasks || [];
        const taskObj  = allTasks.find(t => t.id === taskId);

        // При завершенні — та сама логіка review що і в таск-менеджері
        const needsReview = done && taskObj && typeof shouldSendForReview === 'function' && shouldSendForReview(taskObj);
        const newStatus = done ? (needsReview ? 'review' : 'done') : 'new';

        const updateData = { status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (newStatus === 'done') {
            updateData.completedAt   = firebase.firestore.FieldValue.serverTimestamp();
            updateData.completedBy   = window.currentUser?.uid || null;
            updateData.completedDate = new Date().toISOString().split('T')[0];
        } else if (newStatus === 'review') {
            updateData.sentForReviewAt = firebase.firestore.FieldValue.serverTimestamp();
            updateData.completedAt = null; updateData.completedDate = null; updateData.completedBy = null;
        } else {
            updateData.completedAt = null; updateData.completedDate = null; updateData.completedBy = null;
        }

        await window.companyRef().collection(window.DB_COLS?.TASKS || 'tasks').doc(taskId).update(updateData);

        if (taskObj) Object.assign(taskObj, updateData);

        // Audit + ET — та сама логіка
        if (typeof logTaskChange === 'function') {
            logTaskChange(taskId, 'status', { status: newStatus }, taskObj).catch(() => {});
        }
        if (newStatus === 'done' && typeof window.trackTaskCompleted === 'function') {
            window.trackTaskCompleted(taskId, updateData, taskObj);
        }
        if (newStatus === 'done' && typeof advanceProcessIfLinked === 'function') {
            advanceProcessIfLinked(taskId);
        }

        window.crmRenderDealTasks(dealId);
    } catch(e) { console.warn('[CRM task toggle]', e); }
};

window.crmDeleteDealTask = async function (dealId, taskId) {
    try {
        await window.companyRef().collection(window.DB_COLS?.TASKS || 'tasks').doc(taskId).delete();
        if (window.tasks) window.tasks = window.tasks.filter(t=>t.id!==taskId);
        window.crmRenderDealTasks(dealId);
    } catch(e) { console.warn('[CRM task delete]', e); }
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Авто-задачи при переходе стадии
        </div>
        <div style="font-size:0.71rem;color:#9ca3af;margin-bottom:0.85rem;">
            При переходе сделки в стадию — задачи создаются автоматически
        </div>

        <div id="crmTaskTemplatesList" style="display:flex;flex-direction:column;gap:0.4rem;">
            ${templates.map((t, i) => _taskTemplateRow(t, i, stages)).join('')}
        </div>

        <button onclick="crmAddTaskTemplate()"
            style="margin-top:0.6rem;width:100%;padding:0.4rem;background:#f0fdf4;color:#16a34a;
            border:1px solid #bbf7d0;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:600;">
            + Добавить шаблон задачи
        </button>
    </div>`;
};

function _taskTemplateRow(t, i, stages) {
    const selStyle = 'padding:0.25rem 0.35rem;border:1px solid #e8eaed;border-radius:5px;font-size:0.72rem;background:white;';
    const fileInfo = t.fileName
        ? `<span style="font-size:0.68rem;color:#16a34a;background:#f0fdf4;border:1px solid #bbf7d0;
            border-radius:4px;padding:1px 6px;display:flex;align-items:center;gap:3px;">
            📎 ${t.fileName.slice(0,18)}${t.fileName.length>18?'…':''}
            <button onclick="crmRemoveTemplateFile(${i})" style="background:none;border:none;cursor:pointer;
                color:#fca5a5;padding:0;font-size:0.75rem;" title="Видалити файл">×</button>
          </span>`
        : `<label title="${window.t('прикріпитиPdfdocДоАвтозадачі')}" style="cursor:pointer;
            font-size:0.68rem;color:#6b7280;background:#f8fafc;border:1px solid #e8eaed;
            border-radius:4px;padding:2px 6px;display:flex;align-items:center;gap:3px;white-space:nowrap;">
            <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls"
                onchange="crmUploadTemplateFile(${i},this.files[0])"
                style="display:none;">
            📎 Файл
          </label>`;
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
            <option value="assignee" ${t.assignTo==='assignee'?'selected':''}>${window.t('toAssignee')||'Відповідальному'}</option>
            <option value="creator"  ${t.assignTo==='creator'?'selected':''}>Автору угоди</option>
            <option value="me"       ${t.assignTo==='me'?'selected':''}>${window.t('toMe')||'Мені'}</option>
        </select>
        ${fileInfo}
        <button onclick="crmRemoveTaskTemplate(${i})"
            style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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

// ── Конвертація угоди в проєкт ──────────────────────────────
window.crmConvertDealToProject = async function(dealId) {
    const deal = crm.deals.find(d => d.id === dealId);
    if (!deal) return;

    // Якщо вже є проєкт — відкриваємо його
    if (deal.linkedProjectId) {
        crmCloseDeal();
        if (typeof window.openProjectDetail === 'function') {
            window.openProjectDetail(deal.linkedProjectId);
        } else if (typeof window.switchTab === 'function') {
            window.switchTab('projects');
        }
        return;
    }

    const confirmed = typeof showConfirmModal === 'function'
        ? await showConfirmModal(`Створити проєкт для «${deal.clientName || deal.title || window.t('угоди1')}»?`)
        : confirm(`Створити проєкт для «${deal.clientName || deal.title || window.t('угоди1')}»?`);
    if (!confirmed) return;

    try {
        const compRef = window.companyRef();
        const uid = window.currentUser?.uid || '';
        const today = new Date().toISOString().split('T')[0];

        const projectData = {
            name:        deal.clientName || deal.title || window.t('новийПроєкт'),
            status:      'active',
            color:       '#22c55e',
            dealId:      dealId,
            clientName:  deal.clientName || '',
            clientPhone: deal.phone || '',
            amount:      deal.amount || 0,
            creatorId:   uid,
            startDate:   today,
            createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:   firebase.firestore.FieldValue.serverTimestamp(),
        };

        const projRef = await compRef.collection('projects').add(projectData);

        // Зберігаємо зворотній зв'язок в угоді
        await compRef.collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
            .doc(dealId).update({
                linkedProjectId: projRef.id,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

        deal.linkedProjectId = projRef.id;

        // Логуємо в history
        await compRef.collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
            .doc(dealId).collection('history').add({
                type: 'project_created',
                projectId: projRef.id,
                by: window.currentUser?.email || '',
                at: firebase.firestore.FieldValue.serverTimestamp(),
            });

        if (window.showToast) showToast('Проєкт створено ✓', 'success');

        // Оновлюємо кнопку в карточці
        const btn = document.getElementById('crmConvertProjectBtn_' + dealId);
        if (btn) {
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> Відкрити проєкт →';
            btn.style.background = '#f0fdf4';
            btn.style.color = '#16a34a';
            btn.style.borderColor = '#bbf7d0';
        }

        // Додаємо проєкт в локальний масив якщо є
        if (typeof window.projects !== 'undefined') {
            window.projects.unshift({ id: projRef.id, ...projectData });
        }

    } catch(e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
        console.error('[CRM convertToProject]', e);
    }
};

// ── Файлові вкладення в карточці угоди ──────────────────────
window.crmRenderDealFiles = async function(dealId) {
    const c = document.getElementById('crmDealFilesList');
    if (!c) return;
    c.innerHTML = '<div style="text-align:center;padding:0.75rem;color:#9ca3af;font-size:0.78rem;">Завантаження...</div>';

    try {
        const snap = await window.companyRef()
            .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
            .doc(dealId).collection('files')
            .orderBy('createdAt', 'desc').limit(100).get();

        const files = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        _crmRenderFilesUI(c, files, dealId);
    } catch(e) {
        c.innerHTML = `<div style="color:#ef4444;font-size:0.78rem;padding:0.5rem;">Помилка: ${e.message}</div>`;
    }
};

function _crmRenderFilesUI(container, files, dealId) {
    const iconForExt = (name) => {
        const ext = (name || '').split('.').pop().toLowerCase();
        if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return '🖼️';
        if (['pdf'].includes(ext)) return '📄';
        if (['doc','docx'].includes(ext)) return '📝';
        if (['xls','xlsx','csv'].includes(ext)) return '📊';
        if (['zip','rar','7z'].includes(ext)) return '📦';
        return '📎';
    };

    const fileRows = files.map(f => `
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.5rem;
            border:1px solid #f1f5f9;border-radius:7px;background:white;margin-bottom:0.3rem;">
            <span style="font-size:1.1rem;flex-shrink:0;">${iconForExt(f.name)}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.78rem;font-weight:500;color:#111827;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.name || 'Файл'}</div>
                <div style="font-size:0.65rem;color:#9ca3af;">${f.sizeTxt || ''} ${f.uploadedByName ? '· ' + f.uploadedByName : ''}</div>
            </div>
            <a href="${f.url}" target="_blank" rel="noopener"
                style="color:#6b7280;padding:3px;display:flex;align-items:center;" title=window.t('завантажити')>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
            <button onclick="crmDeleteDealFile('${dealId}','${f.id}','${(f.storagePath||'').replace(/'/g,"\\'")}')"
                style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:3px;" title="Видалити">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`).join('');

    container.innerHTML = `
        <!-- Upload zone -->
        <div id="crmFileDropZone_${dealId}"
            ondragover="event.preventDefault();this.style.borderColor='#22c55e';"
            ondragleave="this.style.borderColor='#e8eaed';"
            ondrop="event.preventDefault();this.style.borderColor='#e8eaed';crmUploadDealFiles('${dealId}',event.dataTransfer.files);"
            style="border:2px dashed #e8eaed;border-radius:8px;padding:0.6rem;text-align:center;
            margin-bottom:0.6rem;cursor:pointer;transition:border-color 0.15s;"
            onclick="document.getElementById('crmFileInput_${dealId}').click()">
            <input type="file" id="crmFileInput_${dealId}" multiple style="display:none;"
                onchange="crmUploadDealFiles('${dealId}',this.files)">
            <div style="font-size:0.75rem;color:#9ca3af;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                ${window.currentLang==='ru'?'Перетащите файл или нажмите для выбора':'Перетягніть файл або натисніть для вибору'}
            </div>
            <div id="crmFileUploadProgress_${dealId}" style="font-size:0.72rem;color:#16a34a;margin-top:4px;display:none;"></div>
        </div>
        ${files.length ? fileRows : '<div style="font-size:0.75rem;color:#9ca3af;text-align:center;padding:0.4rem;">' + (window.currentLang==='ru'?'Файлов нет':'Файлів немає') + '</div>'}` ;
}

window.crmUploadDealFiles = async function(dealId, fileList) {
    if (!fileList || !fileList.length) return;
    const progressEl = document.getElementById(`crmFileUploadProgress_${dealId}`);
    if (progressEl) { progressEl.style.display = ''; progressEl.textContent = window.currentLang==='ru'?window.t('загрузка'):window.t('завантаження'); }

    const compRef = window.companyRef();
    const uid = window.currentUser?.uid || '';
    const uName = window.currentUserData?.name || window.currentUser?.email || '';
    const compId = window.currentCompanyId || window.companyId;

    const ALLOWED_EXT = ['jpg','jpeg','png','gif','webp','pdf','doc','docx','xls','xlsx','csv','txt','zip','rar'];
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB

    let uploaded = 0;
    for (const file of Array.from(fileList)) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) {
            if (window.showToast) showToast(`Формат .${ext} не підтримується`, 'warning');
            continue;
        }
        if (file.size > MAX_SIZE) {
            if (window.showToast) showToast(`${file.name}: файл більше 20MB`, 'warning');
            continue;
        }
        if (progressEl) progressEl.textContent = `Завантажую ${file.name}...`;
        try {
            const ts = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9._\-а-яА-ЯёЁіІїЇєЄ]/g, '_');
            const storagePath = `companies/${compId}/crm_deals/${dealId}/${ts}_${safeName}`;
            const storageRef = firebase.storage().ref(storagePath);
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();

            const bytes = file.size;
            const sizeTxt = bytes < 1024 ? bytes + ' B'
                : bytes < 1024*1024 ? (bytes/1024).toFixed(1) + ' KB'
                : (bytes/(1024*1024)).toFixed(1) + ' MB';

            await compRef.collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
                .doc(dealId).collection('files').add({
                    name: file.name,
                    url, storagePath,
                    size: file.size,
                    sizeTxt,
                    ext,
                    uploadedBy: uid,
                    uploadedByName: uName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
            uploaded++;
        } catch(e) {
            if (window.showToast) showToast('Помилка завантаження: ' + e.message, 'error');
            console.error('[CRM file upload]', e);
        }
    }

    if (progressEl) { progressEl.textContent = uploaded ? `Завантажено: ${uploaded}` : ''; setTimeout(() => { if(progressEl) progressEl.style.display='none'; }, 2000); }
    if (uploaded) window.crmRenderDealFiles(dealId);
};

window.crmDeleteDealFile = async function(dealId, fileId, storagePath) {
    const confirmed = typeof showConfirmModal === 'function'
        ? await showConfirmModal('Видалити файл?', { danger: true })
        : confirm('Видалити файл?');
    if (!confirmed) return;
    try {
        if (storagePath) await firebase.storage().ref(storagePath).delete().catch(() => {});
        await window.companyRef().collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
            .doc(dealId).collection('files').doc(fileId).delete();
        window.crmRenderDealFiles(dealId);
    } catch(e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};

// ── PDF в шаблонах автозадач ──────────────────────────────
window.crmUploadTemplateFile = async function(idx, file) {
    if (!file) return;
    const pipeline = window.crm?.pipeline;
    if (!pipeline?.taskTemplates?.[idx]) return;

    const MAX = 10 * 1024 * 1024; // 10MB
    const ALLOWED = ['pdf','doc','docx','xlsx','xls'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED.includes(ext)) {
        if (window.showToast) showToast(`Формат .${ext} не підтримується (тільки PDF, DOC, XLSX)`, 'warning');
        return;
    }
    if (file.size > MAX) {
        if (window.showToast) showToast(`${window.t('файлБільше10mb')}`, 'warning');
        return;
    }

    try {
        const compId = window.currentCompanyId || window.companyId;
        const pipelineId = pipeline.id;
        const stageId = pipeline.taskTemplates[idx].stageId || 'common';
        const ts = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._\-а-яА-ЯёЁіІїЇєЄ]/g, '_');
        const storagePath = `companies/${compId}/stage-templates/${pipelineId}/${stageId}/${ts}_${safeName}`;

        if (window.showToast) showToast('Завантажую файл...', 'info');
        const storageRef = firebase.storage().ref(storagePath);
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();

        pipeline.taskTemplates[idx].fileUrl      = url;
        pipeline.taskTemplates[idx].fileName     = file.name;
        pipeline.taskTemplates[idx].storagePath  = storagePath;

        if (window.showToast) showToast(`📎 ${file.name} прикріплено`, 'success');
        _crmRefreshTaskTemplatesUI();
    } catch(e) {
        if (window.showToast) showToast('Помилка завантаження: ' + e.message, 'error');
        console.error('[CRM templateFile]', e);
    }
};

window.crmRemoveTemplateFile = function(idx) {
    const pipeline = window.crm?.pipeline;
    if (!pipeline?.taskTemplates?.[idx]) return;
    const tpl = pipeline.taskTemplates[idx];
    // Видаляємо з Storage асинхронно (не блокуємо UI)
    if (tpl.storagePath) {
        firebase.storage().ref(tpl.storagePath).delete().catch(() => {});
    }
    delete tpl.fileUrl;
    delete tpl.fileName;
    delete tpl.storagePath;
    _crmRefreshTaskTemplatesUI();
};
