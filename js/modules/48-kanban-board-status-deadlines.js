// =====================
        // KANBAN BOARD (Status + Deadlines)
        // =====================
        
'use strict';
        function refreshCurrentView() {
            if (currentCalendarView === 'list') renderTasks();
            else if (currentCalendarView === 'kanban' || currentCalendarView === 'deadlines') renderKanbanBoard(currentCalendarView);
            else renderCalendar();
            // Оновлюємо Control і Projects якщо активні
            const controlTab = document.getElementById('controlTab');
            if (controlTab && controlTab.classList.contains('active') && typeof renderControl === 'function') {
                renderControl();
            }
            const projectsTab = document.getElementById('projectsTab');
            if (projectsTab && projectsTab.classList.contains('active') && !openProjectId && typeof renderProjects === 'function') {
                renderProjects();
            }
        }
        
        function renderKanbanBoard(mode) {
            const container = document.getElementById('kanbanContainer');
            if (!container) return;
            _visibleTaskIds = null; // Invalidate visibility cache
            
// console.log(`[Kanban] Rendering mode=${mode}, total tasks=${tasks.length}`);
            
            // Apply same filters as list view
            const selectedStatuses = getSelectedStatuses();
            const funcF = document.getElementById('functionFilter')?.value;
            const assigneeF = document.getElementById('assigneeFilter')?.value;
            const df = document.getElementById('dateFilter')?.value;
            const tf = document.getElementById('taskTypeFilter')?.value;
            const searchQuery = (document.getElementById('taskSearchInput')?.value || '').toLowerCase().trim();
            const today = getLocalDateStr();
            
            let filtered = tasks.filter(task => {
                if (!isTaskVisibleToUser(task)) return false;
                if (hideCompletedTasks && task.status === 'done' && mode !== 'kanban') return false;
                if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) return false;
                if (funcF && task.function !== funcF) return false;
                if (assigneeF && task.assigneeId !== assigneeF) return false;
                if (tf === 'my' && task.assigneeId !== currentUser?.uid && !(task.coExecutorIds && task.coExecutorIds.includes(currentUser?.uid))) return false; // BUG-Y FIX: was missing coExecutors
                if (tf === 'created' && task.creatorId !== currentUser?.uid) return false;
                if (searchQuery && !(task.title || '').toLowerCase().includes(searchQuery) && 
                    !(task.assigneeName || '').toLowerCase().includes(searchQuery)) return false;
                return true;
            });
            
// console.log(`[Kanban] Filtered: ${filtered.length}, ...`);
            
            let columns;
            
            if (mode === 'kanban') {
                // STATUS KANBAN
                columns = [
                    { id: 'new', title: window.t('statusNew'), color: '#3b82f6', bg: '#eff6ff', tasks: [] },
                    { id: 'progress', title: window.t('statusProgress'), color: '#f59e0b', bg: '#fffbeb', tasks: [] },
                    { id: 'review', title: window.t('statusReview'), color: '#8b5cf6', bg: '#f5f3ff', tasks: [] },
                    { id: 'done', title: window.t('statusDone'), color: '#22c55e', bg: '#f0fdf4', tasks: [] }
                ];
                filtered.forEach(tk => {
                    const col = columns.find(c => c.id === (tk.status || 'new'));
                    if (col) col.tasks.push(tk);
                    else columns[0].tasks.push(tk);
                });
            } else {
                // DEADLINE KANBAN
                const today = getLocalDateStr();
                const todayD = new Date(today + 'T12:00:00');
                // End of this week = next Sunday (Ukrainian week: Mon-Sun)
                const dayOfWeek = todayD.getDay(); // 0=Sun
                const daysToSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
                const endOfWeek = new Date(todayD);
                endOfWeek.setDate(endOfWeek.getDate() + daysToSunday);
                const endOfNextWeek = new Date(endOfWeek);
                endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
                const endWeekStr = endOfWeek.toISOString().split('T')[0];
                const endNextWeekStr = endOfNextWeek.toISOString().split('T')[0];
                
                columns = [
                    { id: 'overdue', title: window.t('overdueGroup'), color: '#ef4444', bg: '#fef2f2', tasks: [] },
                    { id: 'today', title: window.t('forToday'), color: '#f59e0b', bg: '#fffbeb', tasks: [] },
                    { id: 'this_week', title: window.t('thisWeek'), color: '#3b82f6', bg: '#eff6ff', tasks: [] },
                    { id: 'next_week', title: window.t('nextWeek'), color: '#8b5cf6', bg: '#f5f3ff', tasks: [] },
                    { id: 'later', title: window.t('later'), color: '#06b6d4', bg: '#ecfeff', tasks: [] },
                    { id: 'no_deadline', title: window.t('noDeadline'), color: '#6b7280', bg: '#f9fafb', tasks: [] }
                ];
                
                filtered.filter(tk => tk.status !== 'done').forEach(tk => {
                    const dl = tk.deadlineDate;
                    if (!dl) { columns[5].tasks.push(tk); return; }
                    if (dl < today) columns[0].tasks.push(tk);
                    else if (dl === today) columns[1].tasks.push(tk);
                    else if (dl <= endWeekStr) columns[2].tasks.push(tk);
                    else if (dl <= endNextWeekStr) columns[3].tasks.push(tk);
                    else columns[4].tasks.push(tk);
                });
            }
            
            let html = '<div class="kanban-board">';
            
            columns.forEach(col => {
                html += `<div class="kanban-column" data-col="${col.id}">
                    <div class="kanban-column-header" style="background:${col.bg};color:${col.color};border-bottom:2px solid ${col.color}">
                        <span>${col.title}</span>
                        <span class="kanban-column-count" style="color:${col.color}">${col.tasks.length}</span>
                    </div>
                    <div class="kanban-column-body" data-col="${col.id}" 
                         ondragover="kanbanDragOver(event)" ondragleave="kanbanDragLeave(event)" ondrop="kanbanDrop(event,'${mode}')">
                        <div class="kanban-add-btn" onclick="openTaskModalForKanban('${col.id}','${mode}')" 
                             style="text-align:center;padding:0.4rem;color:#9ca3af;cursor:pointer;font-size:0.8rem;border:1px dashed #d1d5db;border-radius:8px;">+ ${window.t('add')}</div>`;
                
                // Sort tasks: overdue first, then by deadline
                col.tasks.sort((a, b) => {
                    if (a.deadlineDate && b.deadlineDate) return a.deadlineDate.localeCompare(b.deadlineDate);
                    if (a.deadlineDate) return -1;
                    return 1;
                });
                
                const todayStr = getLocalDateStr();
                col.tasks.forEach(tk => {
                    const assignee = users.find(u => u.id === tk.assigneeId);
                    const assigneeName = assignee ? (assignee.name || assignee.email || '').split(' ')[0] : (tk.assigneeName || '').split(' ')[0];
                    const funcName = tk.function || '';
                    const isOverdue = tk.deadlineDate && tk.deadlineDate < todayStr && tk.status !== 'done' && tk.status !== 'review';
                    const isToday = tk.deadlineDate === todayStr;
                    const escalation = getEscalationLevel(tk);
                    
                    let deadlineHtml = '';
                    if (tk.deadlineDate) {
                        const d = new Date(tk.deadlineDate + 'T12:00:00');
                        const dayMonth = d.toLocaleDateString(getLocale(), {day:'numeric', month:'short'});
                        const color = isOverdue ? '#ef4444' : isToday ? '#f59e0b' : '#6b7280';
                        deadlineHtml = `<span style="color:${color}">${dayMonth}</span>`;
                    }
                    
                    let checkHtml = '';
                    if (tk.checklist?.length) {
                        const done = tk.checklist.filter(c => c.done).length;
                        checkHtml = `<span> ${done}/${tk.checklist.length}</span>`;
                    }
                    
                    let imgHtml = '';
                    if (tk.attachments?.length) {
                        const img = tk.attachments.find(a => a.type?.startsWith('image/'));
                        if (img && img.url && (img.url.startsWith('https://') || img.url.startsWith('data:image/'))) {
                            imgHtml = `<img src="${escapeHtml(img.url)}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:0.3rem;" onerror="this.remove()">`;
                        }
                    }
                    
                    let prioHtml = '';
                    if (tk.priority === 'high') prioHtml = '<span class="kanban-card-badge" style="background:#fef2f2;color:#ef4444"></span>';
                    else if (tk.priority === 'medium') prioHtml = '<span class="kanban-card-badge" style="background:#fffbeb;color:#f59e0b"><i data-lucide="minus-circle" class="icon icon-sm"></i></span>';
                    
                    let escalBadge = '';
                    if (escalation) {
                        const escColors = {1:'#fef3c7;color:#92400e',2:'#fed7aa;color:#9a3412',3:'#fee2e2;color:#dc2626'};
                        escalBadge = `<span class="kanban-card-badge" style="background:${escColors[escalation.level]}; font-size:0.65rem">${escalation.label}</span>`;
                    }
                    
                    let statusBadge = '';
                    if (mode === 'deadlines') {
                        const stColors = {new:'#eff6ff;color:#3b82f6', progress:'#fffbeb;color:#f59e0b', review:'#f5f3ff;color:#8b5cf6'};
                        const stLabels = {new:window.t('statusNewLabel'), progress:window.t('statusProgressLabel'), review:window.t('statusReviewLabel')};
                        if (stColors[tk.status]) statusBadge = `<span class="kanban-card-badge" style="background:${stColors[tk.status]};font-size:0.65rem">${stLabels[tk.status]}</span>`;
                    }
                    
                    html += `<div class="kanban-card ${isOverdue?'overdue':''} ${isToday?'today':''}" 
                                  draggable="true" data-task-id="${tk.id}"
                                  ondragstart="kanbanDragStart(event)" ondragend="kanbanDragEnd(event)"
                                  onclick="kanbanCardClick(event,'${tk.id}')">
                        ${imgHtml}
                        <div class="kanban-card-title">${escapeHtml(tk.title)}</div>
                        <div class="kanban-card-meta">
                            ${prioHtml}${escalBadge}${statusBadge}
                            ${deadlineHtml}${checkHtml}
                            ${funcName ? `<span style="background:#f0fdf4;color:#16a34a;padding:0.1rem 0.3rem;border-radius:4px">${escapeHtml(funcName)}</span>` : ''}
                            ${assigneeName ? `<span>${escapeHtml(assigneeName)}</span>` : ''}
                        </div>
                    </div>`;
                });
                
                html += '</div></div>';
            });
            
            html += '</div>';
            container.innerHTML = html;
            
            // Attach touch events for mobile drag
            const board = container.querySelector('.kanban-board');
            if (board) {
                board.addEventListener('touchstart', kanbanTouchStart, { passive: true });
                board.addEventListener('touchmove', kanbanTouchMove, { passive: false });
                board.addEventListener('touchend', kanbanTouchEnd, { passive: true });
            }
        }
        
        // Kanban Drag & Drop
        let kanbanDraggedId = null;
        let kanbanWasDragged = false;
        
        function kanbanDragStart(e) {
            kanbanDraggedId = e.target.closest('.kanban-card')?.dataset.taskId;
            if (!kanbanDraggedId) return;
            kanbanWasDragged = false;
            e.target.closest('.kanban-card').classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', kanbanDraggedId);
        }
        function kanbanDragEnd(e) {
            kanbanWasDragged = true;
            e.target.classList.remove('dragging');
            document.querySelectorAll('.kanban-column-body').forEach(b => b.classList.remove('drag-over'));
            // Reset flag after click event would fire
            setTimeout(() => { kanbanWasDragged = false; }, 50);
        }
        function kanbanCardClick(e, taskId) {
            if (kanbanWasDragged) { e.stopPropagation(); return; }
            if (kanbanTouchMoved) { e.stopPropagation(); return; }
            window.openTaskModal ? window.openTaskModal(taskId) : null;
        }
        function kanbanDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        }
        function kanbanDragLeave(e) {
            e.currentTarget.classList.remove('drag-over');
        }
        
        // Mobile touch drag & drop
        let kanbanTouchCard = null;
        let kanbanTouchClone = null;
        let kanbanTouchStartY = 0;
        let kanbanTouchMoved = false;
        
        function kanbanTouchStart(e) {
            const card = e.target.closest('.kanban-card');
            if (!card) return;
            kanbanTouchCard = card;
            kanbanTouchStartY = e.touches[0].clientY;
            kanbanTouchMoved = false;
            kanbanDraggedId = card.dataset.taskId;
        }
        
        function kanbanTouchMove(e) {
            if (!kanbanTouchCard) return;
            const dy = Math.abs(e.touches[0].clientY - kanbanTouchStartY);
            if (dy < 10 && !kanbanTouchMoved) return; // threshold
            kanbanTouchMoved = true;
            e.preventDefault();
            
            if (!kanbanTouchClone) {
                kanbanTouchClone = kanbanTouchCard.cloneNode(true);
                kanbanTouchClone.style.cssText = 'position:fixed;z-index:9999;opacity:0.8;pointer-events:none;width:250px;transform:rotate(2deg);';
                document.body.appendChild(kanbanTouchClone);
                kanbanTouchCard.classList.add('dragging');
            }
            kanbanTouchClone.style.left = (e.touches[0].clientX - 125) + 'px';
            kanbanTouchClone.style.top = (e.touches[0].clientY - 30) + 'px';
            
            // Highlight column under touch
            document.querySelectorAll('.kanban-column-body').forEach(b => b.classList.remove('drag-over'));
            const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
            const colBody = el?.closest('.kanban-column-body');
            if (colBody) colBody.classList.add('drag-over');
        }
        
        function kanbanTouchEnd(e) {
            if (!kanbanTouchCard) return;
            if (kanbanTouchClone) {
                kanbanTouchClone.remove();
                kanbanTouchClone = null;
            }
            kanbanTouchCard.classList.remove('dragging');
            document.querySelectorAll('.kanban-column-body').forEach(b => b.classList.remove('drag-over'));
            
            if (kanbanTouchMoved && kanbanDraggedId) {
                const touch = e.changedTouches[0];
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                const colBody = el?.closest('.kanban-column-body');
                if (colBody) {
                    const mode = currentCalendarView;
                    kanbanDrop({ preventDefault(){}, currentTarget: colBody }, mode);
                }
            }
            kanbanTouchCard = null;
            // FIX D: delay reset so click event (300ms after touchend on iOS) is still blocked
            const _wasMoved = kanbanTouchMoved;
            if (_wasMoved) {
                setTimeout(() => { kanbanTouchMoved = false; }, 350);
            } else {
                kanbanTouchMoved = false;
            }
        }
        let kanbanDropLock = false;
        async function kanbanDrop(e, mode) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            if (!kanbanDraggedId || kanbanDropLock) return;
            kanbanDropLock = true;
            
            const targetCol = e.currentTarget.dataset.col;
            const task = tasks.find(t => t.id === kanbanDraggedId);
            if (!task) { kanbanDropLock = false; return; }
            
            // Permission check: owner/admin/manager can move any, employee only own
            const role = currentUserData?.role;
            const canMove = (typeof hasPermission === 'function' && hasPermission('editAnyTask')) || role === 'owner' || role === 'admin' || role === 'manager' 
                || task.assigneeId === currentUser?.uid || task.creatorId === currentUser?.uid;
            if (!canMove) {
                showToast(window.t('noPermissionTask'), 'error');
                kanbanDropLock = false; return;
            }
            
            // FEAT-007: deadline drag перевіряє allowDeadlineChange
            if (mode === 'deadlines' && typeof canEditDeadline === 'function') {
                const isPrivileged = (typeof hasPermission === 'function' && hasPermission('assignTasks')) || role === 'owner' || role === 'admin' || role === 'manager';
                if (!isPrivileged && !canEditDeadline(task)) {
                    showToast(window.t('noPermissionDeadline') || 'Зміна строків заборонена власником', 'error');
                    kanbanDropLock = false; return;
                }
            }
            
            if (mode === 'kanban') {
                // STATUS DRAG: change status
                const oldStatus = task.status;
                if (targetCol === oldStatus) { kanbanDropLock = false; return; }
                
                // Якщо тягнуть в done, але задача потребує review — перенаправляємо в review
                let effectiveTarget = targetCol;
                if (targetCol === 'done' && shouldSendForReview(task)) {
                    effectiveTarget = 'review';
                }
                
                try {
                    const ref = db.collection(`companies/${currentCompany}/tasks`).doc(task.id);
                    const _today = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];
                    const upd = { status: effectiveTarget, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
                    if (effectiveTarget === 'done') {
                        upd.completedAt = firebase.firestore.FieldValue.serverTimestamp();
                        upd.completedBy = currentUser?.uid || '';
                        upd.completedDate = _today; // FIX: needed for analytics
                    } else {
                        upd.completedAt = null;
                        upd.completedDate = null; // FIX: clear when moved away from done
                        upd.completedBy = null;
                    }
                    if (effectiveTarget === 'review') {
                        upd.sentForReviewAt = firebase.firestore.FieldValue.serverTimestamp();
                    }
                    await ref.update(upd);
                    await logTaskChange(task.id, 'status', { from: oldStatus, to: effectiveTarget });
                    task.status = effectiveTarget;
                    if (effectiveTarget === 'done') {
                        task.completedAt = new Date();
                        task.completedDate = _today;
                        task.completedBy = currentUser?.uid || '';
                        advanceProcessIfLinked(task.id);
                        if (task.projectId) autoUpdateProjectStatus(task.projectId);
                    } else {
                        task.completedDate = null;
                        task.completedBy = null;
                    }
                    if (effectiveTarget === 'review') {
                        task.sentForReviewAt = new Date().toISOString();
                        showToast(window.t('taskSentForReview'), 'info'); // FIX: only one toast for review redirect
                    } else {
                        if (effectiveTarget === 'progress' && task.projectId) autoUpdateProjectStatus(task.projectId);
                        showToast(`${window.t('statusesLabel')} → ${effectiveTarget === 'done' ? window.t('statusDone') : effectiveTarget === 'progress' ? window.t('statusProgress') : window.t('statusNew')}`, 'success');
                    }
                } catch(err) {
                    console.error('Kanban status drop error:', err);
                    showToast(window.t('error'), 'error');
                    kanbanDropLock = false; return;
                }
            } else {
                // DEADLINE DRAG: change deadline
                const today = getLocalDateStr();
                const todayD = new Date(today);
                let newDeadline = null;
                
                if (targetCol === 'today') {
                    newDeadline = today;
                } else if (targetCol === 'this_week') {
                    const fri = new Date(todayD);
                    fri.setDate(fri.getDate() + (5 - fri.getDay() + 7) % 7);
                    if (fri <= todayD) fri.setDate(fri.getDate() + 7);
                    newDeadline = fri.toISOString().split('T')[0];
                } else if (targetCol === 'next_week') {
                    const nextMon = new Date(todayD);
                    nextMon.setDate(nextMon.getDate() + (8 - nextMon.getDay()) % 7);
                    if (nextMon <= todayD) nextMon.setDate(nextMon.getDate() + 7);
                    const nextFri = new Date(nextMon);
                    nextFri.setDate(nextFri.getDate() + 4);
                    newDeadline = nextFri.toISOString().split('T')[0];
                } else if (targetCol === 'later') {
                    // Set to 2 weeks from today (Friday)
                    const laterDate = new Date(todayD);
                    laterDate.setDate(laterDate.getDate() + 14);
                    newDeadline = laterDate.toISOString().split('T')[0];
                } else if (targetCol === 'no_deadline') {
                    newDeadline = null;
                } else if (targetCol === 'overdue') {
                    kanbanDropLock = false; return; // cant drag TO overdue
                }
                
                const oldDl = task.deadlineDate || null;
                try {
                    const ref = db.collection(`companies/${currentCompany}/tasks`).doc(task.id);
                    // FIX: оновлюємо deadline як Timestamp (для checkOverdueTasks/sendReminders)
                    // + скидаємо overdueNotified і sentReminders якщо дедлайн змінився
                    const deadlineTs = newDeadline
                        ? firebase.firestore.Timestamp.fromDate(
                            new Date(newDeadline + 'T' + (task.deadlineTime || '23:59') + ':00')
                          )
                        : null;
                    const deadlineUpdate = {
                        deadlineDate: newDeadline || firebase.firestore.FieldValue.delete(),
                        deadline: deadlineTs || firebase.firestore.FieldValue.delete(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    // Скидаємо якщо дедлайн змінився
                    if (oldDl !== newDeadline) {
                        deadlineUpdate.overdueNotified = false;
                        deadlineUpdate.sentReminders = [];
                    }
                    await ref.update(deadlineUpdate);
                    await logTaskChange(task.id, 'edit', { field: 'deadlineDate', from: oldDl, to: newDeadline });
                    task.deadlineDate = newDeadline;
                    task.deadline = deadlineTs;
                    showToast(newDeadline ? `${window.t('deadlineChanged')} → ${newDeadline}` : window.t('deadlineRemoved'), 'success');
                } catch(err) {
                    console.error('Kanban deadline drop error:', err);
                    showToast(window.t('deadlineChangeError'), 'error');
                    kanbanDropLock = false; return;
                }
            }
            
            try {
                renderKanbanBoard(mode);
                // Оновлюємо MyDay і Control — вони залежать від task.status/deadlineDate
                if (typeof renderMyDay === 'function') renderMyDay();
                const controlTab = document.getElementById('controlTab');
                if (controlTab?.classList.contains('active') && typeof renderControl === 'function') renderControl();
            } finally {
                kanbanDropLock = false; // FIX: always release lock even if render throws
            }
        }
        
        function openTaskModalForKanban(colId, mode) {
            openTaskModal(); // відкриває форму нового завдання
            // Pre-set deadline based on column (deadline mode only)
            // BUG-Z FIX: was setTimeout(100) race condition → use rAF double-frame like task templates fix
            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (mode !== 'deadlines') return;
                const today = getLocalDateStr();
                const todayD = new Date(today);
                let dl = '';
                if (colId === 'today') {
                    dl = today;
                } else if (colId === 'this_week') {
                    const fri = new Date(todayD);
                    const delta = (5 - fri.getDay() + 7) % 7 || 7;
                    fri.setDate(fri.getDate() + delta);
                    dl = fri.toISOString().split('T')[0];
                } else if (colId === 'next_week') {
                    const nextMon = new Date(todayD);
                    const daysToMon = (8 - nextMon.getDay()) % 7 || 7;
                    nextMon.setDate(nextMon.getDate() + daysToMon);
                    const nextFri = new Date(nextMon);
                    nextFri.setDate(nextFri.getDate() + 4);
                    dl = nextFri.toISOString().split('T')[0];
                } else if (colId === 'later') {
                    const later = new Date(todayD);
                    later.setDate(later.getDate() + 14);
                    dl = later.toISOString().split('T')[0];
                }
                if (dl) {
                    const deadlineInput = document.getElementById('taskDeadlineDate');
                    if (deadlineInput) deadlineInput.value = dl;
                }
            }));
        }
        
        // Escape HTML for security
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
