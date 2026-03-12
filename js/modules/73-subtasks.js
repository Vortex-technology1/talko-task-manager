// =============================================
// MODULE 73 — SUBTASKS (Підзавдання)
// =============================================

(function() {
    'use strict';
    const safeEsc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // ---- РЕНДЕР підзавдань у модальному вікні ----
    window.renderSubtasks = async function(parentTaskId) {
        if (!parentTaskId || !currentUser) return;
        const list = document.getElementById('subtasksList');
        const empty = document.getElementById('subtasksEmpty');
        const badge = document.getElementById('subtasksBadge');
        if (!list) return;

        list.innerHTML = '<div style="color:#9ca3af;font-size:0.8rem;padding:0.5rem;">Завантаження...</div>';

        try {
            const cid = currentUserData?.companyId || currentCompany;
            const snap = await firebase.firestore()
                .collection('companies').doc(cid)
                .collection('tasks')
                .where('parentId', '==', parentTaskId)
                .orderBy('createdAt', 'asc')
                .get();

            const subtasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            renderSubtasksList(subtasks, parentTaskId);
        } catch(e) {
            // Якщо немає індексу — fallback через tasks масив
            const cid = currentUserData?.companyId || currentCompany;
            const subtasks = (typeof tasks !== 'undefined')
                ? tasks.filter(t => t.parentId === parentTaskId)
                : [];
            renderSubtasksList(subtasks, parentTaskId);
        }
    };

    function renderSubtasksList(subtasks, parentTaskId) {
        const list = document.getElementById('subtasksList');
        const empty = document.getElementById('subtasksEmpty');
        const badge = document.getElementById('subtasksBadge');
        if (!list) return;

        list.innerHTML = '';

        if (subtasks.length === 0) {
            if (empty) empty.style.display = 'block';
            if (badge) badge.style.display = 'none';
            return;
        }

        if (empty) empty.style.display = 'none';
        const done = subtasks.filter(t => t.status === 'done').length;
        if (badge) {
            badge.style.display = '';
            badge.textContent = `${done}/${subtasks.length}`;
            badge.style.background = done === subtasks.length ? '#22c55e' : '#6b7280';
        }

        // Прогрес бар
        const pct = subtasks.length ? Math.round(done / subtasks.length * 100) : 0;
        list.innerHTML = `<div style="margin-bottom:0.6rem;">
            <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#6b7280;margin-bottom:3px;">
                <span>${done} з ${subtasks.length} виконано</span><span>${pct}%</span>
            </div>
            <div style="height:5px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${pct===100?'#22c55e':'#3b82f6'};border-radius:3px;transition:width 0.3s;"></div>
            </div>
        </div>`;

        subtasks.forEach(st => {
            const statusColor = st.status==='done'?'#22c55e':st.status==='progress'?'#3b82f6':st.status==='review'?'#f97316':'#9ca3af';
            const statusIcon = st.status==='done'?'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>':st.status==='progress'?'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#3b82f6"/></svg></span>':st.status==='review'?'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>':'⬜';
            const isOverdue = st.deadlineDate && st.deadlineDate < (typeof getLocalDateStr==='function'?getLocalDateStr(new Date()):new Date().toISOString().split('T')[0]) && st.status !== 'done';
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;padding:0.55rem 0.65rem;background:white;border-radius:8px;border:1px solid #e5e7eb;cursor:pointer;transition:box-shadow 0.15s;';
            row.onmouseover = () => row.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            row.onmouseout = () => row.style.boxShadow = '';
            row.innerHTML = `
                <span style="font-size:1rem;flex-shrink:0;">${statusIcon}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.83rem;font-weight:600;color:${st.status==='done'?'#9ca3af':'#1a1a1a'};text-decoration:${st.status==='done'?'line-through':'none'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${isOverdue?'<span style="color:#ef4444;">⚠ </span>':''}${safeEsc(st.title)}
                    </div>
                    <div style="font-size:0.72rem;color:#9ca3af;display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1px;">
                        ${st.assigneeName?`<span><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span> ${safeEsc(st.assigneeName)}</span>`:''}
                        ${st.deadlineDate?`<span style="color:${isOverdue?'#ef4444':'#6b7280'};"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span> ${st.deadlineDate}</span>`:''}
                    </div>
                </div>
                <button type="button" onclick="event.stopPropagation();deleteSubtask('${st.id}','${parentTaskId}')" 
                    style="background:none;border:none;color:#d1d5db;cursor:pointer;padding:2px 4px;border-radius:4px;font-size:0.9rem;flex-shrink:0;"
                    onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#d1d5db'"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>`;
            row.onclick = () => {
                closeModal('taskModal');
                setTimeout(() => openTaskModal(st.id), 150);
            };
            list.appendChild(row);
        });
    }

    // ---- ФОРМА НОВОГО ПІДЗАВДАННЯ ----
    window.addSubtaskRow = function() {
        const parentId = window.currentEditingId;
        if (!parentId) return;

        // Будуємо список виконавців
        const userOptions = (typeof users !== 'undefined')
            ? users.map(u => `<option value="${u.id}">${safeEsc(u.name||u.email)}</option>`).join('')
            : '';

        // Дефолтний дедлайн — батьківське завдання
        const parentTask = (typeof tasks !== 'undefined') ? tasks.find(t => t.id === parentId) : null;
        const defaultDeadline = parentTask?.deadlineDate || '';

        const modal = document.createElement('div');
        modal.id = 'subtaskFormOverlay';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <h3 style="margin:0;font-size:1rem;font-weight:700;display:flex;align-items:center;gap:0.4rem;">
                        <span style="color:#22c55e;">⊕</span> Нове підзавдання
                    </h3>
                    <button onclick="document.getElementById('subtaskFormOverlay').remove()" 
                        style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9ca3af;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                </div>
                <div style="display:flex;flex-direction:column;gap:0.75rem;">
                    <div>
                        <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Назва *</label>
                        <input id="stTitle" type="text" placeholder="Що потрібно зробити?" autofocus
                            style="width:100%;padding:0.5rem 0.65rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();saveSubtask('${parentId}');}">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                        <div>
                            <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Виконавець</label>
                            <select id="stAssignee" style="width:100%;padding:0.5rem 0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.82rem;">
                                <option value="">— Оберіть —</option>
                                ${userOptions}
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Дедлайн</label>
                            <input id="stDeadline" type="date" value="${defaultDeadline}"
                                style="width:100%;padding:0.5rem 0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.82rem;box-sizing:border-box;">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Пріоритет</label>
                        <select id="stPriority" style="width:100%;padding:0.5rem 0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.82rem;">
                            <option value="medium"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#f59e0b"/></svg></span> Середній</option>
                            <option value="high"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#ef4444"/></svg></span> Високий</option>
                            <option value="low"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> Низький</option>
                        </select>
                    </div>
                    <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
                        <button type="button" onclick="document.getElementById('subtaskFormOverlay').remove()"
                            style="flex:1;padding:0.55rem;border:1px solid #e5e7eb;background:white;border-radius:8px;cursor:pointer;font-size:0.85rem;">
                            Скасувати
                        </button>
                        <button type="button" onclick="saveSubtask('${parentId}')"
                            style="flex:2;padding:0.55rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;">
                            ✓ Створити підзавдання
                        </button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
        setTimeout(() => document.getElementById('stTitle')?.focus(), 100);
    };

    // ---- ЗБЕРЕЖЕННЯ підзавдання ----
    window.saveSubtask = async function(parentId) {
        const title = document.getElementById('stTitle')?.value?.trim();
        if (!title) {
            document.getElementById('stTitle')?.focus();
            return;
        }
        // Блокуємо кнопку від подвійного кліку
        const _saveBtn = document.querySelector('#subtaskFormOverlay button[onclick*="saveSubtask"]');
        if (_saveBtn) { if (_saveBtn.disabled) return; _saveBtn.disabled = true; }
        const assigneeId = document.getElementById('stAssignee')?.value || '';
        const deadlineDate = document.getElementById('stDeadline')?.value || '';
        const priority = document.getElementById('stPriority')?.value || 'medium';

        const assigneeUser = (typeof users !== 'undefined') ? users.find(u => u.id === assigneeId) : null;
        const assigneeName = assigneeUser ? (assigneeUser.name || assigneeUser.email) : '';

        const parentTask = (typeof tasks !== 'undefined') ? tasks.find(t => t.id === parentId) : null;
        const cid = currentUserData?.companyId || currentCompany;

        const subtaskData = {
            title,
            parentId,
            parentTitle: parentTask?.title || '',
            assigneeId: assigneeId || (parentTask?.assigneeId || ''),
            assigneeName: assigneeName || (parentTask?.assigneeName || ''),
            deadlineDate,
            deadline: deadlineDate ? deadlineDate + 'T23:59' : '',
            priority,
            status: 'new',
            function: parentTask?.function || '',
            projectId: parentTask?.projectId || '',
            description: '',
            checklist: [],
            coExecutorIds: [],
            observerIds: [],
            requireReview: false,
            notifyOnComplete: [currentUser?.uid || ''],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdDate: (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0],
            creatorId: currentUser?.uid || '',
            creatorName: currentUserData?.name || currentUser.email,
            source: 'subtask',
            pinned: false,
        };

        try {
            const ref = await firebase.firestore()
                .collection('companies').doc(cid)
                .collection('tasks').add(subtaskData);

            // Закриваємо форму
            document.getElementById('subtaskFormOverlay')?.remove();

            // Додаємо в локальний масив tasks (renderTasks побачить підзавдання одразу)
            if (typeof tasks !== 'undefined') {
                tasks.unshift({ id: ref.id, ...subtaskData, createdAt: new Date() });
            }

            // Оновлюємо список
            renderSubtasks(parentId);
            if (typeof refreshCurrentView === 'function') refreshCurrentView();

            // Показуємо toast
            if (typeof showToast === 'function') showToast('Підзавдання створено ✓');

            // Нотифікація виконавцю
            if (assigneeId && assigneeId !== currentUser?.uid && typeof notifyUser === 'function') {
                notifyUser(cid, assigneeId, 'new_task', { taskTitle: title, creatorName: subtaskData.creatorName });
            }
        } catch(err) {
            console.error('saveSubtask error:', err);
            if(window.showToast)showToast('Помилка збереження: '+err.message,'error'); else alert('Помилка збереження: '+err.message);
        } finally {
            // Розблоковуємо кнопку
            const _saveBtnF = document.querySelector('#subtaskFormOverlay button[onclick*="saveSubtask"]');
            if (_saveBtnF) _saveBtnF.disabled = false;
        }
    };

    // ---- ВИДАЛЕННЯ підзавдання ----
    window.deleteSubtask = async function(subtaskId, parentId) {
        if (!(await (window.showConfirmModal ? showConfirmModal('Видалити підзавдання?',{danger:true}) : Promise.resolve(confirm('Видалити підзавдання?'))))) return;
        const cid = currentUserData?.companyId || currentCompany;
        try {
            await firebase.firestore()
                .collection('companies').doc(cid)
                .collection('tasks').doc(subtaskId).delete();
            // BUG2 FIX: remove from local tasks[] so refreshCurrentView doesn't ghost it back
            if (typeof tasks !== 'undefined') {
                const _idx = tasks.findIndex(t => t.id === subtaskId);
                if (_idx >= 0) tasks.splice(_idx, 1);
            }
            renderSubtasks(parentId);
            if (typeof refreshCurrentView === 'function') refreshCurrentView();
            if (typeof showToast === 'function') showToast('Підзавдання видалено');
        } catch(err) {
            console.error('deleteSubtask error:', err);
        }
    };

    // ---- ВІДОБРАЖЕННЯ в списку завдань — іконка якщо є підзавдання ----
    window.getSubtasksBadgeHTML = function(task) {
        if (!task.parentId) return '';
        return `<span title="Підзавдання" style="font-size:0.68rem;background:#f0fdf4;color:#16a34a;border-radius:4px;padding:1px 5px;border:1px solid #bbf7d0;">↳ підзавдання</span>`;
    };

})();
