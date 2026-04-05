// =====================
        // PROJECTS
        // =====================
'use strict';
        let currentProjectView = 'grid';
        let openProjectId = null;
        
        function openProjectModal(projectId = null) {
            const project = projectId ? projects.find(p => p.id === projectId) : null;
            document.getElementById('projectEditId').value = projectId || '';
            document.getElementById('projectName').value = project?.name || '';
            document.getElementById('projectStartDate').value = project?.startDate || getLocalDateStr();
            document.getElementById('projectDeadline').value = project?.deadline || '';
            document.getElementById('projectDescription').value = project?.description || '';
            document.getElementById('projectPlannedRevenue').value = project?.plannedRevenue || '';
            document.getElementById('projectPlannedMaterialCost').value = project?.plannedMaterialCost || '';
            document.getElementById('projectPlannedLaborCost').value = project?.plannedLaborCost || '';
            document.getElementById('projectClientName').value = project?.clientName || '';

            // Приватний проєкт
            const isPrivate = !!project?.isPrivate;
            const privCb = document.getElementById('projectIsPrivate');
            if (privCb) {
                privCb.checked = isPrivate;
                toggleProjectPrivateUI(isPrivate, project?.members || []);
            }

            // Populate functionIds checkboxes
            const funcContainer = document.getElementById('projectFunctionIds');
            if (funcContainer) {
                const activeFuncs = (typeof functions !== 'undefined' ? functions : []).filter(f => f.status !== 'archived');
                const selectedIds = project?.functionIds || [];
                funcContainer.innerHTML = activeFuncs.length
                    ? activeFuncs.map(f => `<label class="assignee-checkbox"><input type="checkbox" value="${esc(f.id)}" ${selectedIds.includes(f.id) ? 'checked' : ''}> ${esc(f.name)}</label>`).join('')
                    : `${window.t('spanStylecolor9ca3affontsize082remнетФун')}`;
            }
            
            const color = project?.color || '#22c55e';
            document.querySelectorAll('input[name="projectColor"]').forEach(r => r.checked = false);
            const colorInput = document.querySelector(`input[name="projectColor"][value="${color}"]`);
            if (colorInput) colorInput.checked = true;
            else document.querySelector('input[name="projectColor"]').checked = true;
            
            document.getElementById('projectModalTitle').textContent = project ? window.t('editProject') : window.t('newProject');
            document.getElementById('projectModal').style.display = 'block';
            refreshIconsNow();
        }
        
        let isSavingProject = false;
        async function saveProject(e) {
            e.preventDefault();
            if (isSavingProject) return;
            isSavingProject = true;
            const submitBtn = document.querySelector('#projectForm button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            const id = document.getElementById('projectEditId').value;
            const data = {
                name: document.getElementById('projectName').value.trim(),
                startDate: document.getElementById('projectStartDate').value,
                deadline: document.getElementById('projectDeadline').value,
                description: document.getElementById('projectDescription').value.trim(),
                color: document.querySelector('input[name="projectColor"]:checked')?.value || '#22c55e',
                plannedRevenue: parseFloat(document.getElementById('projectPlannedRevenue')?.value) || 0,
                plannedMaterialCost: parseFloat(document.getElementById('projectPlannedMaterialCost')?.value) || 0,
                plannedLaborCost: parseFloat(document.getElementById('projectPlannedLaborCost')?.value) || 0,
                clientName: document.getElementById('projectClientName')?.value?.trim() || '',
                functionIds: Array.from(document.querySelectorAll('#projectFunctionIds input:checked')).map(cb => cb.value),
                // Приватний проєкт
                isPrivate: document.getElementById('projectIsPrivate')?.checked || false,
                members: document.getElementById('projectIsPrivate')?.checked
                    ? [
                        currentUser.uid,
                        ...Array.from(document.querySelectorAll('#projectMembersList input:checked')).map(cb => cb.value)
                      ].filter((v, i, a) => a.indexOf(v) === i) // uniq
                    : [],
            };
            if (!data.name) { isSavingProject = false; if (submitBtn) submitBtn.disabled = false; return; }
            
            try {
                const base = window.companyRef().collection('projects');
                if (id) {
                    // Не перезаписуємо status при редагуванні
                    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    await base.doc(id).update(data);
                    const idx = projects.findIndex(p => p.id === id);
                    if (idx >= 0) projects[idx] = { ...projects[idx], ...data };
                } else {
                    data.status = 'active';
                    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    data.creatorId = currentUser.uid;
                    const ref = await base.add(data);
                    projects.unshift({ id: ref.id, ...data });
                }
                closeModal('projectModal');
                renderProjects();
                updateProjectSelects();
            } catch (err) {
                console.error('[Projects] Save error:', err);
                showToast(window.t('error') + ': ' + window.t('save'), 'error');
            } finally {
                isSavingProject = false;
                if (submitBtn) submitBtn.disabled = false;
            }
        }
        
        // Показуємо/приховуємо блок учасників при зміні чекбоксу "Приватний"
        window.toggleProjectPrivateUI = function(checked, existingMembers) {
            const block = document.getElementById('projectMembersBlock');
            if (!block) return;
            block.style.display = checked ? 'block' : 'none';
            if (!checked) return;

            const list = document.getElementById('projectMembersList');
            if (!list) return;
            const usersArr = (typeof users !== 'undefined' ? users : [])
                .filter(u => u.id !== currentUser?.uid); // власника не показуємо — він завжди включений
            const selectedMembers = existingMembers || [];

            list.innerHTML = usersArr.length
                ? usersArr.map(u => `
                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer;
                        font-size:0.78rem;color:#374151;background:white;border:1px solid #e5e7eb;
                        border-radius:6px;padding:3px 8px;">
                        <input type="checkbox" value="${u.id}"
                            ${selectedMembers.includes(u.id) ? 'checked' : ''}
                            style="accent-color:#8b5cf6;">
                        ${u.name || u.email || u.id}
                    </label>`).join('')
                : '<span style="font-size:0.75rem;color:#9ca3af;">Немає інших співробітників</span>';
        };

        async function deleteProject(projectId) {
            if (currentUserData?.role === 'employee') { showToast(window.t('noPermissionTask'), 'error'); return; }
            const s = getProjectStats(projectId);
            const stageCount = (typeof window.projectStages !== 'undefined' ? window.projectStages : []).filter(st => st.projectId === projectId).length;
            let msg = s.total > 0 
                ? (window.t('deleteProjectWithTasks')).replace('{total}', s.total).replace('{undone}', s.total - s.done)
                : (window.t('deleteEmptyProject'));
            if (stageCount > 0) msg += `\n\n${window.t('deleteStagesAlso2').replace('{V}', stageCount)}`;
            if (!await showConfirmModal(msg, { danger: true })) return;
            try {
                const base = window.companyRef();
                const orphaned = tasks.filter(t => t.projectId === projectId);
                const pStages = (typeof window.projectStages !== 'undefined' ? window.projectStages : []).filter(st => st.projectId === projectId);
                const pMats = (typeof window.projectMaterials !== 'undefined' ? window.projectMaterials : []).filter(m => m.projectId === projectId);
                
                // Збираємо всі ops: delete project + unlink tasks + delete stages + delete materials
                const ops = [];
                ops.push({ type: 'delete', ref: base.collection('projects').doc(projectId) });
                orphaned.forEach(t => ops.push({ type: 'update', ref: base.collection('tasks').doc(t.id), data: { projectId: '', stageId: '' } }));
                pStages.forEach(st => ops.push({ type: 'delete', ref: base.collection('projectStages').doc(st.id) }));
                pMats.forEach(m => ops.push({ type: 'delete', ref: base.collection('projectMaterials').doc(m.id) }));
                
                // Chunked commit — Firestore limit 500 ops/batch
                const CHUNK = 450;
                for (let i = 0; i < ops.length; i += CHUNK) {
                    const chunk = ops.slice(i, i + CHUNK);
                    const batch = db.batch();
                    chunk.forEach(op => {
                        if (op.type === 'delete') batch.delete(op.ref);
                        else batch.update(op.ref, op.data);
                    });
                    try {
                    await batch.commit();
                    } catch(err) {
                        console.error('[Batch] commit failed:', err);
                        showToast && showToast(window.t('savingError'), 'error');
                    }
                }
                
                // Оновлюємо локальний стан
                orphaned.forEach(t => { t.projectId = ''; t.stageId = ''; });
                projects = projects.filter(p => p.id !== projectId);
                if (typeof window.projectStages !== 'undefined') window.projectStages = window.projectStages.filter(s => s.projectId !== projectId);
                if (typeof window.projectMaterials !== 'undefined') window.projectMaterials = window.projectMaterials.filter(m => m.projectId !== projectId);
                
                if (openProjectId === projectId) closeProjectDetail();
                renderProjects();
                updateProjectSelects();
                let msg2 = '';
                if (orphaned.length > 0) msg2 += orphaned.length + ' ' + (window.t('tasksUnlinked2')||'задач відвязано.') + ' ';
                if (pStages.length > 0) msg2 += pStages.length + ' ' + (window.t('stagesDeleted2')||'етапів видалено.') + ' ';
                if (msg2) showToast(msg2, 'info');
            } catch (err) {
                console.error('[Projects] Delete error:', err);
                showToast('Помилка видалення: ' + err.message, 'error');
            }
        }
        
        function getProjectStats(projectId) {
            const projectTasks = tasks.filter(t => t.projectId === projectId && isTaskVisibleToUser(t));
            const total = projectTasks.length;
            const done = projectTasks.filter(t => t.status === 'done').length;
            const inProgress = projectTasks.filter(t => t.status === 'progress').length;
            const review = projectTasks.filter(t => t.status === 'review').length;
            const overdue = projectTasks.filter(t => t.deadlineDate && t.deadlineDate < getLocalDateStr() && t.status !== 'done' && t.status !== 'review').length;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            
            // FIX 3: Конфлікт дедлайнів
            const project = projects.find(p => p.id === projectId);
            const deadlineConflicts = [];
            if (project?.deadline) {
                projectTasks.forEach(t => {
                    if (t.deadlineDate && t.deadlineDate > project.deadline && t.status !== 'done') {
                        deadlineConflicts.push(t);
                    }
                });
            }
            
            return { total, done, inProgress, review, overdue, percent, tasks: projectTasks, deadlineConflicts };
        }
        
        // FIX 4: Автооновлення статусу проекту
        const _projectStatusTimers = {};
        
        async function autoUpdateProjectStatus(projectId) {
            if (!projectId) return;
            const project = projects.find(p => p.id === projectId);
            if (!project || project.status === 'paused') return;
            
            // Debounce: coalesce rapid updates (batch complete etc)
            if (_projectStatusTimers[projectId]) clearTimeout(_projectStatusTimers[projectId]);
            _projectStatusTimers[projectId] = setTimeout(() => {
                delete _projectStatusTimers[projectId];
                _doProjectStatusUpdate(projectId);
            }, 500);
        }
        
        async function _doProjectStatusUpdate(projectId) {
            const project = projects.find(p => p.id === projectId);
            if (!project || project.status === 'paused') return;
            
            const allProjectTasks = tasks.filter(t => t.projectId === projectId);
            const total = allProjectTasks.length;
            if (total === 0) return;
            
            const doneCount = allProjectTasks.filter(t => t.status === 'done').length;
            const activeCount = allProjectTasks.filter(t => t.status === 'progress' || t.status === 'review').length;
            
            let newStatus = project.status;
            if (doneCount === total) newStatus = 'completed';
            else if (project.status === 'completed' && doneCount < total) newStatus = 'active';
            else if (doneCount > 0 || activeCount > 0) newStatus = 'active';
            
            if (newStatus !== project.status) {
                const oldStatus = project.status;
                project.status = newStatus;
                try {
                    const projRef = window.companyRef().collection('projects').doc(projectId);
                    await db.runTransaction(async (tx) => {
                        const doc = await tx.get(projRef);
                        if (!doc.exists) return;
                        const serverStatus = doc.data().status;
                        // Only update if no one else changed it
                        if (serverStatus === oldStatus) {
                            tx.update(projRef, { status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
                        } else {
                            project.status = serverStatus; // sync from server
                        }
                    });
                    if (project.status === newStatus) {
                        const label = newStatus === 'completed' ? window.t('projectCompleted') : window.t('projectActive');
                        showToast(window.t('projectStatusChanged').replace('{name}', project.name).replace('{status}', label), 'success');
                    }
                } catch(e) {
                    project.status = oldStatus;
                    console.warn('autoUpdateProjectStatus error:', e);
                }
                renderProjects();
                if (openProjectId === projectId) renderProjectDetail(projectId);
            }
        }
        
        function setProjectView(view) {
            currentProjectView = view;
            const tab = document.getElementById('projectsTab');
            if (tab) tab.querySelectorAll('.calendar-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
            renderProjects();
        }
        
        function renderProjects() {
            const container = document.getElementById('projectsContent');
            const emptyState = document.getElementById('projectsEmptyState');
            const detailView = document.getElementById('projectDetailView');
            const header = document.getElementById('projectsHeader');
            
            if (openProjectId) {
                container.style.display = 'none';
                emptyState.style.display = 'none';
                header.style.display = 'none';
                detailView.style.display = 'block';
                renderProjectDetail(openProjectId);
                return;
            }
            
            detailView.style.display = 'none';
            header.style.display = 'flex';
            
            const statusFilter = document.getElementById('projectStatusFilter')?.value || '';
            let filtered = projects;
            if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);

            // Фільтр приватних проєктів — показуємо тільки якщо поточний user є учасником або власником
            const uid = currentUser?.uid;
            filtered = filtered.filter(p => {
                if (!p.isPrivate) return true;                      // публічний — всім видно
                if (p.creatorId === uid) return true;               // власник — завжди видить
                if (Array.isArray(p.members) && p.members.includes(uid)) return true; // учасник
                return false;
            });
            
            const counter = document.getElementById('projectsCounter');
            const activeCount = projects.filter(p => p.status === 'active').length;
            if (counter) { counter.textContent = activeCount || ''; counter.style.display = activeCount ? 'inline' : 'none'; }
            
            if (filtered.length === 0) {
                container.style.display = 'none';
                emptyState.style.display = 'block';
                // Show different message if projects exist but filter hides them
                if (projects.length > 0 && statusFilter) {
                    emptyState.innerHTML = `<div style="text-align:center;padding:2rem;">
                        <div style="margin-bottom:0.5rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                        <div style="font-weight:600;">Нет проектов со статусом "${statusFilter === 'active' ? window.t('activeLabel') : statusFilter === 'completed' ? window.t('completedLabel') : 'Пауза'}"</div>
                        <div style="color:#9ca3af;font-size:0.85rem;margin:0.5rem 0;">Всего проектов: ${projects.length}</div>
                        <button class="btn btn-small" onclick="document.getElementById('projectStatusFilter').value='';renderProjects();" style="margin-top:0.5rem;">Показать все</button>
                    </div>`;
                }
                return;
            }
            
            container.style.display = 'block';
            emptyState.style.display = 'none';
            
            // Sync view switcher buttons
            const tab = document.getElementById('projectsTab');
            if (tab) tab.querySelectorAll('.calendar-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === currentProjectView));
            
            if (currentProjectView === 'grid') renderProjectsGrid(container, filtered);
            else if (currentProjectView === 'list') renderProjectsList(container, filtered);
            else if (currentProjectView === 'timeline') renderProjectsTimeline(container, filtered);
            
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        function renderProjectsGrid(container, filtered) {
            const todayStr = getLocalDateStr();
            container.innerHTML = `<div class="projects-grid">${filtered.map(p => {
                const s = getProjectStats(p.id);
                const isOverdue = p.deadline && p.deadline < todayStr && p.status === 'active';
                const statusColor = p.status === 'active' ? '#34c759' : p.status === 'completed' ? '#007aff' : '#ff9500';
                const statusLabel = p.status === 'active' ? window.t('projectActive') : p.status === 'completed' ? window.t('projectCompleted') : window.t('projectPaused');
                const lockSvg = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
                return `
                <div class="project-card" style="--pc:${safeColor(p.color)};" onclick="openProjectDetail('${escId(p.id)}')">
                    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${safeColor(p.color)};border-radius:12px 12px 0 0;"></div>
                    <div class="project-card-header" style="margin-bottom:0.25rem;">
                        <div class="project-card-title" style="font-size:0.88rem;font-weight:600;color:#1c1c1e;line-height:1.3;">${p.isPrivate ? lockSvg + ' ' : ''}${esc(p.name)}</div>
                        <span style="font-size:0.62rem;font-weight:600;color:${statusColor};background:${statusColor}18;padding:2px 6px;border-radius:8px;flex-shrink:0;">${statusLabel}</span>
                    </div>
                    ${p.description ? `<div style="font-size:0.72rem;color:#8e8e93;margin-bottom:0.35rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;">${esc(p.description)}</div>` : ''}
                    <div style="display:flex;gap:0.6rem;margin-bottom:0.4rem;flex-wrap:wrap;">
                        <span style="font-size:0.7rem;color:#8e8e93;display:flex;align-items:center;gap:2px;"><i data-lucide="clipboard-list" class="icon icon-sm"></i> ${s.total}</span>
                        <span style="font-size:0.7rem;color:#34c759;display:flex;align-items:center;gap:2px;"><i data-lucide="check-circle" class="icon icon-sm"></i> ${s.done}</span>
                        ${s.overdue > 0 ? `<span style="font-size:0.7rem;color:#ff3b30;font-weight:600;display:flex;align-items:center;gap:2px;"><i data-lucide="alert-circle" class="icon icon-sm"></i> ${s.overdue}</span>` : ''}
                    </div>
                    <div style="height:3px;border-radius:2px;background:#f2f2f7;margin-bottom:0.2rem;"><div style="width:${s.percent}%;height:100%;background:${safeColor(p.color)};border-radius:2px;transition:width 0.3s;"></div></div>
                    <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:#8e8e93;">
                        <span>${s.done}/${s.total}</span>
                        ${p.deadline ? `<span style="color:${isOverdue ? '#ff3b30' : '#8e8e93'};">${formatDateShort(p.deadline)}</span>` : `<span>${s.percent}%</span>`}
                    </div>
                </div>`;
            }).join('')}</div>`;
        }
        function renderProjectsList(container, filtered) {
            const todayStr = getLocalDateStr();
            container.innerHTML = `<table class="projects-list-table"><thead><tr>
                <th>${window.t('nameLabel')}</th><th>${window.t('statusLabel')}</th><th>${window.t('tasksWord')}</th><th>${window.t('progressLabel')}</th><th>${window.t('deadline')}</th><th></th>
            </tr></thead><tbody>${filtered.map(p => {
                const s = getProjectStats(p.id);
                const isOverdue = p.deadline && p.deadline < todayStr && p.status === 'active';
                return `<tr onclick="openProjectDetail('${escId(p.id)}')">
                    <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${safeColor(p.color)};margin-right:0.5rem;vertical-align:middle;"></span><strong>${esc(p.name)}</strong></td>
                    <td><span class="project-card-status ${['active','paused','completed'].includes(p.status) ? p.status : 'active'}">${p.status === 'active' ? window.t('projectActive') : p.status === 'completed' ? window.t('projectCompleted') : window.t('projectPaused')}</span></td>
                    <td>${s.done}/${s.total}</td>
                    <td><div class="project-progress-bar" style="width:100px;display:inline-block;vertical-align:middle;"><div class="project-progress-fill" style="width:${s.percent}%;background:${safeColor(p.color)};"></div></div> ${s.percent}%</td>
                    <td class="${isOverdue ? 'project-card-deadline overdue' : ''}">${p.deadline ? formatDateShort(p.deadline) : '—'}</td>
                    <td><button class="action-btn" onclick="event.stopPropagation();openProjectModal('${escId(p.id)}')" title="Edit"><i data-lucide="pencil" class="icon icon-sm"></i></button></td>
                </tr>`;
            }).join('')}</tbody></table>`;
        }
        
        function renderProjectsTimeline(container, filtered) {
            const todayStr = getLocalDateStr();
            const today = new Date();
            
            // Визначаємо діапазон: мін startDate — макс deadline (+30 днів)
            let minDate = new Date();
            let maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 60);
            
            filtered.forEach(p => {
                if (p.startDate) { const d = new Date(p.startDate); if (d < minDate) minDate = d; }
                if (p.deadline) { const d = new Date(p.deadline); if (d > maxDate) maxDate = d; }
            });
            
            minDate.setDate(minDate.getDate() - 7);
            maxDate.setDate(maxDate.getDate() + 7);
            
            const totalDays = Math.ceil((maxDate - minDate) / 86400000);
            
            // Генеруємо header тижнів
            const weeks = [];
            const d = new Date(minDate);
            while (d <= maxDate) {
                const weekNum = getWeekNumber(d);
                if (!weeks.length || weeks[weeks.length - 1].num !== weekNum) {
                    weeks.push({ num: weekNum, start: new Date(d), days: 0 });
                }
                weeks[weeks.length - 1].days++;
                d.setDate(d.getDate() + 1);
            }
            
            const headerHTML = weeks.map(w => {
                const pct = (w.days / totalDays * 100).toFixed(2);
                const monthShort = (typeof getMonthNames === 'function' ? getMonthNames() : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[w.start.getMonth()];
                return `<div class="timeline-header-label" style="flex:${pct};">${monthShort} T${w.num}</div>`;
            }).join('');
            
            const rowsHTML = filtered.map(p => {
                const s = getProjectStats(p.id);
                const start = p.startDate ? new Date(p.startDate) : today;
                const end = p.deadline ? new Date(p.deadline) : new Date(start.getTime() + 30 * 86400000);
                
                const leftPct = Math.max(0, (start - minDate) / (maxDate - minDate) * 100);
                const widthPct = Math.min(100 - leftPct, Math.max(2, (end - start) / (maxDate - minDate) * 100));
                
                return `
                <div class="timeline-row">
                    <div class="timeline-row-label" onclick="openProjectDetail('${escId(p.id)}')" style="color:${safeColor(p.color)};">${esc(p.name)}</div>
                    <div class="timeline-row-bar-area">
                        <div class="timeline-bar" title="${esc(p.name)}: ${s.percent}% (${s.done}/${s.total})" style="left:${leftPct}%;width:${widthPct}%;background:${safeColor(p.color)};" onclick="openProjectDetail('${escId(p.id)}')">
                            <div class="timeline-bar-progress" style="width:${s.percent}%;"></div>
                            ${s.percent}% (${s.done}/${s.total})
                        </div>
                    </div>
                </div>`;
            }).join('');
            
            // Лінія window.t('todayWord') — рахуємо в JS
            const todayPctNum = ((today - minDate) / (maxDate - minDate) * 100);
            
            container.innerHTML = `
                <div class="project-timeline" style="overflow-x:auto;">
                    <div style="min-width:800px;">
                        <div class="hide-desktop" style="text-align:center;font-size:0.7rem;color:#9ca3af;padding:4px;">← Прокрутите вправо →</div>
                        <div class="timeline-header">${headerHTML}</div>
                        <div style="position:relative;">
                            <div style="position:absolute;left:calc(180px + (100% - 180px) * ${todayPctNum / 100});top:0;bottom:0;width:2px;background:#ef4444;opacity:0.5;z-index:1;"></div>
                            ${rowsHTML}
                        </div>
                    </div>
                </div>`;
        }
        
        function getWeekNumber(d) {
            const oneJan = new Date(d.getFullYear(), 0, 1);
            return Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
        }
        
        // === PROJECT DETAIL VIEW ===
        function openProjectDetail(projectId) {
            openProjectId = projectId;
            renderProjects();
        }
        
        function openTaskForProject(projectId) {
            // BUG-AI FIX: double rAF instead of rAF+setTimeout(0) to avoid race condition
            openTaskModal();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                updateProjectSelects(projectId);
                const sel = document.getElementById('taskProject');
                if (sel) sel.value = projectId;
                updateTaskStageSelect(projectId, '');
            }));
        }
        
        window.openTaskForProjectStage = function(projectId, stageId) {
            // BUG-AI FIX: double rAF instead of rAF+setTimeout(50)
            openTaskModal();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                updateProjectSelects(projectId);
                const sel = document.getElementById('taskProject');
                if (sel) sel.value = projectId;
                updateTaskStageSelect(projectId, stageId);
            }));
        };
        
        function closeProjectDetail() {
            openProjectId = null;
            document.getElementById('projectDetailView').style.display = 'none';
            document.getElementById('projectsContent').style.display = 'block';
            document.getElementById('projectsHeader').style.display = 'flex';
            renderProjects();
        }
        
        // Повертає роль поточного юзера в проєкті: 'member'|'assignee'|'viewer'|'owner'|null
        function _getMyProjectRole(project) {
            const uid = currentUser?.uid;
            if (!uid) return null;
            const ownerRole = currentUserData?.role;
            if (ownerRole === 'owner' || ownerRole === 'manager') return 'owner';
            const members = project.projectMembers || [];
            const me = members.find(m => m.uid === uid);
            return me ? me.role : null;
        }

        function renderProjectDetail(projectId) {
            const project = projects.find(p => p.id === projectId);
            if (!project) { closeProjectDetail(); return; }
            const myProjectRole = _getMyProjectRole(project);
            const isViewer = myProjectRole === 'viewer';
            
            // Load stages and materials async
            if (typeof window.loadProjectStages === 'function') {
                Promise.all([
                    window.loadProjectStages(projectId),
                    window.loadProjectMaterials(projectId),
                    typeof window.loadQualityChecks === 'function' ? window.loadQualityChecks(projectId) : Promise.resolve([]),
                ]).then(() => {
                    // Re-render stages section
                    const sv = document.getElementById('projectStagesView');
                    if (sv && typeof window.renderStagesList === 'function') {
                        sv.innerHTML = window.renderStagesList(projectId);
                    }
                });
            }
            
            const s = getProjectStats(projectId);
            const container = document.getElementById('projectDetailContent');
            if (container) container.dataset.projectId = projectId;
            
            const statusOptions = ['active', 'paused', 'completed'].map(st => 
                `<option value="${st}" ${project.status === st ? 'selected' : ''}>${st === 'active' ? window.t('projectActive') : st === 'completed' ? window.t('projectCompleted') : window.t('projectPaused')}</option>`
            ).join('');
            
            // Board columns
            const columns = [
                { key: 'new', label: window.t('statusNew'), color: '#3b82f6' },
                { key: 'progress', label: window.t('statusProgress'), color: '#f59e0b' },
                { key: 'review', label: window.t('statusReview'), color: '#8b5cf6' },
                { key: 'done', label: window.t('statusDone'), color: '#22c55e' }
            ];
            
            const boardHTML = columns.map(col => {
                const colTasks = s.tasks.filter(t => t.status === col.key);
                return `
                <div class="project-board-col">
                    <div class="project-board-col-header" style="border-bottom-color:${col.color};">
                        <span>${col.label}</span>
                        <span style="background:${col.color};color:white;font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:8px;">${colTasks.length}</span>
                    </div>
                    <div class="project-board-col-cards">
                        ${colTasks.length === 0 ? '<div style="text-align:center;color:#ccc;font-size:0.8rem;padding:1rem;">—</div>' : ''}
                        ${colTasks.map(t => {
                            const assignee = t.assigneeName || '';
                            const clickHandler = isViewer
                                ? `${window.t('ifwindowshowtoastShowtoastспостерігачТіл')}`
                                : `openTaskModal('${escId(t.id)}')`;
                            return `
                            <div class="project-task-card priority-${t.priority || 'medium'}" onclick="${clickHandler}" style="${isViewer ? 'opacity:0.85;cursor:default;' : ''}">
                                <div class="project-task-card-title">${esc(t.title)}</div>
                                <div class="project-task-card-meta">
                                    ${assignee ? `<span><i data-lucide="user" class="icon icon-sm"></i> ${esc(assignee)}</span>` : ''}
                                    ${t.deadlineDate ? `<span><i data-lucide="calendar" class="icon icon-sm"></i> ${formatDateShort(t.deadlineDate)}</span>` : ''}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
            }).join('');
            
            container.innerHTML = `
                <div class="project-detail-header">
                    <div class="project-detail-back" onclick="closeProjectDetail()">
                        <i data-lucide="arrow-left" class="icon"></i>
                        <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${safeColor(project.color)};"></span>
                        ${esc(project.name)}
                    </div>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        ${!isViewer ? `<button class="btn btn-success btn-small" onclick="openTaskForProject('${escId(projectId)}')" style="min-height:36px;"><i data-lucide="plus" class="icon icon-sm"></i> ${window.t('addTask') || window.t('permTsk2')}</button>` : ''}
                        <button class="btn btn-small" onclick="openProjectMembers('${escId(projectId)}')" style="min-height:36px;display:flex;align-items:center;gap:4px;" title="Учасники проєкту"><i data-lucide="users" class="icon icon-sm"></i> Учасники</button>
                        <button class="btn btn-small" onclick="toggleProjectMembersHelp('${escId(projectId)}')" style="min-height:36px;width:36px;padding:0;color:#9ca3af;font-size:0.85rem;font-weight:600;border-radius:8px;" title="Як це працює?"><i data-lucide="help-circle" class="icon icon-sm"></i></button>
                        <select class="filter-select" onchange="updateProjectStatus('${escId(projectId)}', this.value)" style="font-size:0.8rem;padding:0.3rem;min-height:36px;">${statusOptions}</select>
                        ${!isViewer ? `<button class="btn btn-small" onclick="openProjectModal('${escId(projectId)}')" style="min-height:36px;" title="${window.t('edit') || window.t('flowEdt2')}" aria-label="${window.t('edit') || window.t('flowEdt2')}"><i data-lucide="pencil" class="icon icon-sm"></i></button>
                        <div style="width:1px;height:24px;background:#e5e7eb;margin:0 12px;"></div>
                        <button class="btn btn-small" onclick="deleteProject('${escId(projectId)}')" title="${window.t('deleteProject') || 'Видалити проєкт'} — незворотна дія" aria-label="${window.t('deleteProject') || 'Видалити проєкт'} — незворотна дія" style="background:#fee2e2;color:#dc2626;border-color:#fecaca;min-height:36px;margin-left:auto;"><i data-lucide="trash-2" class="icon icon-sm"></i></button>` : `<span style="font-size:0.75rem;color:#9ca3af;background:#f3f4f6;padding:0.3rem 0.75rem;border-radius:8px;margin-left:auto;">👁 Спостерігач</span>`}
                    </div>
                </div>
                
                <div style="display:flex;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap;">
                    <div style="background:white;border-radius:10px;padding:0.75rem 1.25rem;border:1px solid #e5e7eb;flex:1;min-width:120px;">
                        <div style="font-size:0.75rem;color:var(--gray);">${window.t('totalTasks')}</div>
                        <div style="font-size:1.5rem;font-weight:700;">${s.total}</div>
                    </div>
                    <div style="background:white;border-radius:10px;padding:0.75rem 1.25rem;border:1px solid #e5e7eb;flex:1;min-width:120px;">
                        <div style="font-size:0.75rem;color:var(--gray);">${window.t('statusDone')}</div>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--primary);">${s.done}</div>
                    </div>
                    <div style="background:white;border-radius:10px;padding:0.75rem 1.25rem;border:1px solid #e5e7eb;flex:1;min-width:120px;">
                        <div style="font-size:0.75rem;color:var(--gray);">${window.t('completionRate')}</div>
                        <div style="font-size:1.5rem;font-weight:700;color:${safeColor(project.color)};">${s.percent}%</div>
                    </div>
                    ${s.overdue > 0 ? `<div style="background:#fef2f2;border-radius:10px;padding:0.75rem 1.25rem;border:1px solid #fecaca;flex:1;min-width:120px;">
                        <div style="font-size:0.75rem;color:var(--danger);">${window.t('overdueLabel2')}</div>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--danger);">${s.overdue}</div>
                    </div>` : ''}
                    ${project.plannedRevenue ? `<div style="background:white;border-radius:10px;padding:0.75rem 1.25rem;border:1px solid #e5e7eb;flex:1;min-width:120px;">
                        <div style="font-size:0.75rem;color:var(--gray);">${window.t('finBudgetLbl') || 'Бюджет'}</div>
                        <div style="font-size:1.1rem;font-weight:700;">${Number(project.plannedRevenue).toLocaleString()} ₴</div>
                        ${project.plannedMaterialCost || project.plannedLaborCost ? `<div style="font-size:0.68rem;color:#9ca3af;">${window.t('budgetMatShort') || 'Мат'}: ${Number(project.plannedMaterialCost || 0).toLocaleString()} | ${window.t('budgetLaborShort') || 'Робота'}: ${Number(project.plannedLaborCost || 0).toLocaleString()}</div>` : ''}
                    </div>` : ''}
                    ${project.clientName ? `<div style="background:white;border-radius:10px;padding:0.75rem 1.25rem;border:1px solid #e5e7eb;flex:1;min-width:120px;">
                        <div style="font-size:0.75rem;color:var(--gray);">${window.t('clientWord') || 'Клієнт'}</div>
                        <div style="font-size:0.95rem;font-weight:600;">${esc(project.clientName)}</div>
                    </div>` : ''}
                </div>
                
                <div class="project-progress-bar" style="height:8px;margin-bottom:1rem;">
                    <div class="project-progress-fill" style="width:${s.percent}%;background:${safeColor(project.color)};"></div>
                </div>
                
                <div id="projectMembersHelp_${escId(projectId)}" style="display:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:1rem;margin-bottom:1rem;font-size:0.82rem;color:#1e40af;line-height:1.6;">
                    <div style="font-weight:700;margin-bottom:0.5rem;">Як працюють учасники проєкту</div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.5rem;margin-bottom:0.5rem;">
                        <div style="background:white;border-radius:7px;padding:0.5rem 0.75rem;">
                            <div style="font-weight:600;">Учасник</div>
                            <div style="color:#374151;font-size:0.78rem;">Бачить всі завдання проєкту. Для штатних співробітників.</div>
                        </div>
                        <div style="background:white;border-radius:7px;padding:0.5rem 0.75rem;">
                            <div style="font-weight:600;">Виконавець</div>
                            <div style="color:#374151;font-size:0.78rem;">Бачить тільки свої завдання. Для підрядників з обмеженим доступом.</div>
                        </div>
                        <div style="background:white;border-radius:7px;padding:0.5rem 0.75rem;">
                            <div style="font-weight:600;">Спостерігач</div>
                            <div style="color:#374151;font-size:0.78rem;">Бачить всі завдання тільки для читання. Для клієнтів.</div>
                        </div>
                    </div>
                    <div style="font-size:0.75rem;color:#3b82f6;">Підрядник отримає запрошення на email і зайде тільки в цей проєкт.</div>
                </div>
                
                <div id="projectMembersList_${escId(projectId)}" style="margin-bottom:0.75rem;"></div>
                
                ${s.deadlineConflicts.length > 0 ? `
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:0.75rem 1rem;margin-bottom:1rem;display:flex;gap:0.5rem;align-items:flex-start;">
                    <i data-lucide="alert-triangle" class="icon" style="width:18px;height:18px;color:#ea580c;flex-shrink:0;margin-top:2px;"></i>
                    <div>
                        <div style="font-weight:600;font-size:0.85rem;color:#c2410c;margin-bottom:0.25rem;">
                            ${s.deadlineConflicts.length} ${window.t('tasksExceedDeadline')} (${formatDateShort(project.deadline)})
                        </div>
                        <div style="font-size:0.8rem;color:#9a3412;">
                            ${s.deadlineConflicts.slice(0, 3).map(t => `• ${esc(t.title)} — ${formatDateShort(t.deadlineDate)}`).join('<br>')}
                            ${s.deadlineConflicts.length > 3 ? `<br>...${window.t('andMore') || 'і ще'} ${s.deadlineConflicts.length - 3}` : ''}
                        </div>
                    </div>
                </div>` : ''}
                
                <!-- View Switcher -->
                <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
                    <button class="calendar-view-btn active" onclick="switchProjectView('board', this)" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                        Kanban
                    </button>
                    <button class="calendar-view-btn" onclick="switchProjectView('stages', this)" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        ${window.t('projectStages') || 'Етапи'}
                    </button>
                    <button class="calendar-view-btn" onclick="switchProjectView('gantt', this)" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;"><line x1="4" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>
                        ${window.t('gantt') || 'Gantt'}
                    </button>
                    <button class="calendar-view-btn" onclick="switchProjectView('standards', this)" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        ${window.t('standards') || 'Стандарти'}
                    </button>
                    <button class="calendar-view-btn" onclick="switchProjectView('finance', this)" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        ${window.t('finFinances') || 'Фінанси'}
                    </button>
                    <button class="calendar-view-btn" onclick="switchProjectView('estimate', this)" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                        ${window.t('estimates') || 'Кошторис'}
                    </button>
                </div>
                
                <div id="projectBoardView" class="project-board-columns">${boardHTML}</div>
                <div id="projectStagesView" style="display:none;">${typeof renderStagesList === 'function' ? renderStagesList(projectId) : '<div>Loading stages...</div>'}</div>
                <div id="projectGanttView" style="display:none;">${renderProjectGantt(s.tasks, project)}</div>
                <div id="projectStandardsView" style="display:none;"><div id="standardsListContainer"></div></div>
                <div id="projectFinanceView" style="display:none;"><div style="text-align:center;color:#9ca3af;padding:2rem;">${window.t('finLoading') || 'Завантаження...'}</div></div>
                <div id="projectEstimateView" style="display:none;"><div id="projectEstimateContent"></div></div>
            `;
            
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        function switchProjectView(view, btn) {
            document.getElementById('projectBoardView').style.display = view === 'board' ? '' : 'none';
            const stagesView = document.getElementById('projectStagesView');
            if (stagesView) stagesView.style.display = view === 'stages' ? '' : 'none';
            document.getElementById('projectGanttView').style.display = view === 'gantt' ? '' : 'none';
            const stdView = document.getElementById('projectStandardsView');
            if (stdView) {
                stdView.style.display = view === 'standards' ? '' : 'none';
                if (view === 'standards' && typeof window.loadWorkStandards === 'function') {
                    window.loadWorkStandards().then(() => {
                        if (typeof window.renderStandardsList === 'function') window.renderStandardsList();
                    });
                }
            }
            const finView = document.getElementById('projectFinanceView');
            if (finView) {
                finView.style.display = view === 'finance' ? '' : 'none';
                if (view === 'finance') {
                    const pid = document.getElementById('projectDetailContent')?.dataset?.projectId;
                    if (pid) {
                        if (typeof window._renderProjectFinance === 'function') {
                            window._renderProjectFinance(pid, finView);
                        } else {
                            // 98-finance.js ще не завантажений — завантажуємо і рендеримо
                            finView.innerHTML = `<div style="text-align:center;color:#9ca3af;padding:2rem;">${window.t('finLoading') || 'Загрузка финансов...'}</div>`;
                            if (typeof lazyLoad === 'function') {
                                lazyLoad('finance', function() {
                                    // Перевіряємо що вкладка ще активна після lazy load
                                    if (typeof window._renderProjectFinance === 'function'
                                        && finView.style.display !== 'none') {
                                        window._renderProjectFinance(pid, finView);
                                    }
                                });
                            }
                        }
                    }
                }
            }
            const estView = document.getElementById('projectEstimateView');
            if (estView) {
                estView.style.display = view === 'estimate' ? '' : 'none';
                if (view === 'estimate') {
                    const pid = document.getElementById('projectDetailContent')?.dataset?.projectId;
                    if (pid) _renderProjectEstimateTab(pid);
                }
            }
            btn.parentElement.querySelectorAll('.calendar-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        
        function renderProjectGantt(projectTasks, project) {
            if (!projectTasks.length) return '<div style="text-align:center;color:#999;padding:2rem;">' + window.t('noTasksForGantt') + '</div>';
            
            const today = new Date();
            const todayStr = getLocalDateStr(today);
            
            // Find date range
            const dates = projectTasks
                .filter(t => t.deadlineDate)
                .map(t => new Date(t.deadlineDate));
            
            if (dates.length === 0) return '<div style="text-align:center;color:#999;padding:2rem;">' + (window.t('noTasksForGantt') || 'Задачі без дат — Gantt недоступний') + '</div>';
            
            // Включаємо startDate задач в діапазон — інакше смужки вилізуть за ліву межу
            projectTasks.forEach(t => {
                if (t.startDate) dates.push(new Date(t.startDate));
            });

            // Add today to range
            dates.push(today);
            
            let minDate = new Date(Math.min(...dates));
            let maxDate = new Date(Math.max(...dates));
            
            // Pad range: 2 days before, 3 days after
            minDate.setDate(minDate.getDate() - 2);
            maxDate.setDate(maxDate.getDate() + 3);
            
            // Generate day columns
            const days = [];
            const d = new Date(minDate);
            while (d <= maxDate) {
                days.push(new Date(d));
                d.setDate(d.getDate() + 1);
            }
            
            const totalDays = days.length;
            const dayWidth = Math.max(36, Math.floor(800 / totalDays));
            const chartWidth = dayWidth * totalDays;
            
            // Status colors
            const statusColors = {
                new: { bg: '#dbeafe', border: '#3b82f6' },
                progress: { bg: '#fef3c7', border: '#f59e0b' },
                review: { bg: '#e0e7ff', border: '#6366f1' },
                done: { bg: '#d1fae5', border: '#10b981' }
            };
            
            const statusLabels = { new: window.t('statusNew'), progress: window.t('statusProgress'), review: window.t('statusReview'), done: window.t('statusDone') };
            
            // Sort tasks: спочатку по startDate, потім по deadlineDate
            const sorted = [...projectTasks].sort((a, b) => {
                const da = a.startDate || a.deadlineDate || '9999';
                const db = b.startDate || b.deadlineDate || '9999';
                return da.localeCompare(db);
            });
            
            // Day headers
            const months = typeof getMonthNames === 'function' ? getMonthNames() : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const dayNames = [window.t('daySun'), window.t('dayMon'), window.t('dayTue'), window.t('dayWed'), window.t('dayThu'), window.t('dayFri'), window.t('daySat')];
            
            let headerHTML = days.map((day, i) => {
                const isToday = getLocalDateStr(day) === todayStr;
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return `<div style="width:${dayWidth}px;min-width:${dayWidth}px;text-align:center;font-size:0.65rem;padding:4px 0;${isToday ? 'background:#f0fdf4;font-weight:700;color:#16a34a;' : isWeekend ? 'color:#d1d5db;' : 'color:#9ca3af;'}">
                    <div>${day.getDate() === 1 || i === 0 ? months[day.getMonth()] : ''}</div>
                    <div style="font-size:0.75rem;font-weight:${isToday ? '700' : '500'};">${day.getDate()}</div>
                    <div>${dayNames[day.getDay()]}</div>
                </div>`;
            }).join('');
            
            // Task rows
            let rowsHTML = sorted.map(task => {
                const color = statusColors[task.status] || statusColors.new;
                const assignee = task.assigneeName ? esc(task.assigneeName).split(' ')[0] : '';
                
                if (!task.deadlineDate) {
                    return `<div style="display:flex;align-items:center;height:36px;border-bottom:1px solid #f3f4f6;">
                        <div style="width:100%;padding:0 8px;font-size:0.75rem;color:#d1d5db;font-style:italic;">
                            ${esc(task.title)} — без дати
                        </div>
                    </div>`;
                }

                // ── ВИПРАВЛЕНИЙ розрахунок smуги ──────────────────
                const deadlineDate = new Date(task.deadlineDate);
                let barStartDate;

                if (task.startDate && task.startDate !== task.deadlineDate) {
                    // Пріоритет 1: явна дата початку задачі
                    barStartDate = new Date(task.startDate);
                } else if (task.estimatedTime && parseInt(task.estimatedTime) > 0) {
                    // Пріоритет 2: розраховуємо з estimatedTime (хвилини → дні, 480хв = 8год)
                    const mins = parseInt(task.estimatedTime);
                    const durationDays = Math.max(1, Math.ceil(mins / 480));
                    barStartDate = new Date(deadlineDate);
                    barStartDate.setDate(barStartDate.getDate() - durationDays + 1);
                } else if (task.duration && parseInt(task.duration) > 0) {
                    // Пріоритет 3: поле duration
                    const durationDays = Math.max(1, Math.ceil(parseInt(task.duration) / 480));
                    barStartDate = new Date(deadlineDate);
                    barStartDate.setDate(barStartDate.getDate() - durationDays + 1);
                } else {
                    // Fallback: мінімум 1 день (сьогодні = початок = кінець, але видно смужку)
                    barStartDate = new Date(deadlineDate);
                }

                // Кількість днів смужки (мінімум 1)
                const durationDays = Math.max(1, Math.round((deadlineDate - barStartDate) / 86400000) + 1);

                // Позиція і ширина в пікселях
                const startOffset = Math.max(0, Math.round((barStartDate - minDate) / 86400000));
                const leftPx = startOffset * dayWidth;
                const widthPx = Math.max(dayWidth - 4, durationDays * dayWidth - 4);
                
                const isOverdue = task.deadlineDate < todayStr && task.status !== 'done' && task.status !== 'review';
                const hasStartDate = !!task.startDate;
                
                return `<div style="display:flex;align-items:center;height:36px;border-bottom:1px solid #f3f4f6;position:relative;">
                    <div style="position:absolute;left:${leftPx + 2}px;width:${widthPx}px;height:24px;background:${color.bg};border:1.5px solid ${color.border};border-radius:4px;display:flex;align-items:center;padding:0 6px;cursor:pointer;overflow:hidden;${isOverdue ? 'border-color:#ef4444;background:#fef2f2;' : ''}" onclick="openTaskModal('${escId(task.id)}')" title="${esc(task.title)} — ${statusLabels[task.status] || task.status}${assignee ? ' (' + assignee + ')' : ''}${hasStartDate ? ' | ' + task.startDate + ' → ' + task.deadlineDate : ''}">
                        <span style="font-size:0.65rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${isOverdue ? '#ef4444' : '#374151'};">${esc(task.title)}</span>
                    </div>
                </div>`;
            }).join('');
            
            // Today marker
            const todayOffset = Math.round((today - minDate) / 86400000);
            const todayPx = todayOffset * dayWidth + Math.floor(dayWidth / 2);
            
            // Left labels
            let labelsHTML = sorted.map(task => {
                const color = statusColors[task.status] || statusColors.new;
                const assignee = task.assigneeName ? esc(task.assigneeName).split(' ')[0] : '';
                return `<div style="height:36px;display:flex;align-items:center;border-bottom:1px solid #f3f4f6;padding:0 8px;gap:6px;">
                    <div style="width:6px;height:6px;border-radius:50%;background:${color.border};flex-shrink:0;"></div>
                    <span style="font-size:0.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;color:#374151;" title="${esc(task.title)}">${esc(task.title)}</span>
                    ${assignee ? `<span style="font-size:0.6rem;color:#9ca3af;">${assignee}</span>` : ''}
                </div>`;
            }).join('');
            
            return `
                <div style="background:white;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
                    <div style="display:flex;">
                        <!-- Labels column -->
                        <div style="width:200px;min-width:200px;border-right:1px solid #e5e7eb;flex-shrink:0;">
                            <div style="height:54px;display:flex;align-items:center;padding:0 8px;font-size:0.75rem;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Задачи</div>
                            ${labelsHTML}
                        </div>
                        <!-- Chart area -->
                        <div style="flex:1;overflow-x:auto;">
                            <div style="min-width:${chartWidth}px;position:relative;">
                                <!-- Day headers -->
                                <div style="display:flex;border-bottom:1px solid #e5e7eb;">${headerHTML}</div>
                                <!-- Bars -->
                                <div style="position:relative;">
                                    <!-- Today line -->
                                    <div style="position:absolute;top:0;bottom:0;left:${todayPx}px;width:2px;background:#22c55e;z-index:2;opacity:0.6;"></div>
                                    ${rowsHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
        
        async function updateProjectStatus(projectId, status) {
            // Попередження при ручному завершенні з незавершеними задачами
            if (status === 'completed') {
                const s = getProjectStats(projectId);
                const undone = s.total - s.done;
                if (undone > 0 && !await showConfirmModal(window.t('confirmProjectComplete').replace('{n}', undone), { danger: false })) {
                    // Повернути select назад
                    renderProjectDetail(projectId);
                    return;
                }
            }
            try {
                await window.companyRef().collection('projects').doc(projectId).update({ status });
                const proj = projects.find(x => x.id === projectId);
                if (proj) proj.status = status;
                renderProjectDetail(projectId);
                renderProjects();
                updateProjectSelects();
            } catch (e) { console.error(e); }
        }
        
        function updateProjectSelects(forceIncludeId) {
            const sel = document.getElementById('taskProject');
            if (!sel) return;
            const current = forceIncludeId || sel.value;
            const activeProjects = projects.filter(p => p.status === 'active');
            const currentProject = current ? projects.find(p => p.id === current) : null;
            const showProjects = [...activeProjects];
            if (currentProject && !showProjects.find(p => p.id === currentProject.id)) {
                showProjects.push(currentProject);
            }
            sel.innerHTML = '<option value="">Без проекта</option>' + 
                showProjects.map(p => {
                    const suffix = p.status !== 'active' ? ` (${p.status === 'completed' ? window.t('completedProjectStatus') : window.t('pausedProjectStatus')})` : '';
                    return `<option value="${esc(p.id)}">${esc(p.name)}${suffix}</option>`;
                }).join('');
            sel.value = current;
        }
        
        // Stage select — loads stages for selected project
        function updateTaskStageSelect(projectId, selectedStageId) {
            const sel = document.getElementById('taskStage');
            if (!sel) return;
            if (!projectId) {
                sel.innerHTML = '<option value="">Без этапа</option>';
                sel.disabled = true;
                return;
            }
            sel.disabled = false;
            // Load stages async
            if (typeof window.loadProjectStages === 'function') {
                window.loadProjectStages(projectId).then(stages => {
                    sel.innerHTML = '<option value="">Без этапа</option>' +
                        stages.sort((a,b) => (a.order||0)-(b.order||0)).map(s => {
                            const statusIcon = s.status === 'done' ? '&check;' : s.status === 'blocked' ? '!' : s.status === 'in_progress' ? '&rsaquo;' : '&circ;';
                            return `<option value="${s.id}" ${s.id === selectedStageId ? 'selected' : ''}>${statusIcon} ${s.order}. ${esc(s.name)}</option>`;
                        }).join('');
                    if (selectedStageId) sel.value = selectedStageId;
                });
            }
        }
        
        window.onTaskProjectChange = function() {
            const projectId = document.getElementById('taskProject')?.value || '';
            updateTaskStageSelect(projectId, '');
        };
        
        // Sanitize color for style attribute — only allow hex colors
        function safeColor(color, fallback = '#22c55e') {
            if (!color) return fallback;
            return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : fallback;
        }
        

        // === ШАБЛОНИ ===
        function openProcessTemplatesModal() {
            renderTemplatesList();
            document.getElementById('processTemplatesModal').style.display = 'block';
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        function renderTemplatesList() {
            const container = document.getElementById('processTemplatesList');
            
            if (processTemplates.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="padding:2rem;">
                        <i data-lucide="file-cog" class="icon icon-lg" style="color:var(--gray);"></i>
                        <p>${window.t('noTemplates')}</p>
                    </div>
                `;
                if (typeof window.refreshIcons === 'function') window.refreshIcons();
                return;
            }
            
            container.innerHTML = processTemplates.map(template => {
                const stepsPreview = template.steps?.map(s => esc(s.function)).join(' → ') || '';
                const activeCount = processes.filter(p => p.templateId === template.id).length;
                
                return `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid #e5e7eb;">
                        <div style="flex:1;">
                            <div style="font-weight:600;margin-bottom:0.25rem;">${esc(template.name)}</div>
                            <div style="font-size:0.8rem;color:var(--gray);">
                                ${stepsPreview}
                                ${activeCount > 0 ? `<span style="margin-left:0.5rem;background:#dbeafe;color:#1d4ed8;padding:0.15rem 0.5rem;border-radius:10px;font-size:0.75rem;">${activeCount} ${window.t('activeProcesses')}</span>` : ''}
                            </div>
                        </div>
                        <div style="display:flex;gap:0.5rem;">
                            <button class="btn btn-small" onclick="event.stopPropagation(); openEditTemplateModal('${escId(template.id)}')">
                                <i data-lucide="pencil" class="icon icon-sm"></i>
                            </button>
                            <button class="btn btn-small btn-danger" onclick="event.stopPropagation(); deleteProcessTemplate('${escId(template.id)}')">
                                <i data-lucide="trash-2" class="icon icon-sm"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        function openEditTemplateModal(templateId = null) {
            const template = templateId ? processTemplates.find(t => t.id === templateId) : null;
            
            document.getElementById('processTemplateId').value = templateId || '';
            document.getElementById('processTemplateName').value = template?.name || '';
            document.getElementById('processTemplateDescription').value = template?.description || '';
            
            // Рендеримо етапи
            const stepsContainer = document.getElementById('templateStepsContainer');
            if (template?.steps?.length) {
                stepsContainer.innerHTML = template.steps.map((step, i) => renderTemplateStepEditor(step, i)).join('');
            } else {
                stepsContainer.innerHTML = '<p style="color:var(--gray);text-align:center;padding:1rem;">' + window.t('addStep') + '</p>';
            }
            
            document.getElementById('editTemplateTitle').innerHTML = `<i data-lucide="file-cog" class="icon"></i> ${template ? window.t('editTemplate') : window.t('newTemplate')}`;
            
            closeModal('processTemplatesModal');
            document.getElementById('editProcessTemplateModal').style.display = 'block';
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        function renderTemplateStepEditor(step, index) {
            const activeFunctions = functions.filter(f => f.status !== 'archived');
            const funcOptions = activeFunctions.map(f => 
                `<option value="${esc(f.name)}" data-fid="${esc(f.id)}" ${f.name === step.function ? 'selected' : ''}>${esc(f.name)}</option>`
            ).join('');
            // Resolve existing functionId from step (may be stored or derived from name)
            const resolvedFuncId = step.functionId || activeFunctions.find(f => f.name === step.function)?.id || '';
            
            const expanded = step.expectedResult || step.controlQuestion || step.instruction || step.slaMinutes;
            
            return `
                <div class="process-template-step" data-index="${index}" data-function-id="${esc(resolvedFuncId)}">
                    <span class="step-number">${index + 1}</span>
                    <div style="flex:1;">
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.3rem;">
                            <select class="form-select step-function" style="flex:1;min-width:120px;" onchange="updateStepFunction(${index}, this.value, this.options[this.selectedIndex].dataset.fid)">
                                <option value="">${window.t('stepFunction')}</option>
                                ${funcOptions}
                            </select>
                            <input type="text" class="form-input step-title" placeholder="${window.t('stepTitle')}" value="${esc(step.title || '')}" style="flex:1;min-width:120px;">
                        </div>
                        <div style="display:flex;gap:0.3rem;align-items:center;">
                            <select class="form-select step-sla" style="width:90px;font-size:0.75rem;padding:0.25rem;">
                                <option value="" ${!step.slaMinutes ? 'selected' : ''}>${window.t('noSLA')}</option>
                                <option value="30" ${step.slaMinutes == 30 ? 'selected' : ''}>30 ${window.t('min')}</option>
                                <option value="60" ${step.slaMinutes == 60 ? 'selected' : ''}>1 ${window.t('hour')}</option>
                                <option value="120" ${step.slaMinutes == 120 ? 'selected' : ''}>2 ${window.t('hour')}</option>
                                <option value="240" ${step.slaMinutes == 240 ? 'selected' : ''}>4 ${window.t('hour')}</option>
                                <option value="480" ${step.slaMinutes == 480 ? 'selected' : ''}>8 ${window.t('hour')}</option>
                                <option value="1440" ${step.slaMinutes == 1440 ? 'selected' : ''}>1 ${window.t('day')}</option>
                                <option value="2880" ${step.slaMinutes == 2880 ? 'selected' : ''}>2 ${window.t('days')}</option>
                                <option value="4320" ${step.slaMinutes == 4320 ? 'selected' : ''}>3 ${window.t('days')}</option>
                            </select>
                            <label style="font-size:0.7rem;color:#6b7280;display:flex;align-items:center;gap:3px;">
                                <input type="checkbox" class="step-checkpoint" ${step.checkpoint ? 'checked' : ''}> ${window.t('checkpoint')}
                            </label>
                            <label style="font-size:0.7rem;color:#6b7280;display:flex;align-items:center;gap:3px;">
                                <input type="checkbox" class="step-smartassign" ${step.smartAssign !== false ? 'checked' : ''}> ${window.t('smartAssign')}
                            </label>
                            <button type="button" onclick="toggleStepDetails(${index})" style="background:none;border:none;cursor:pointer;font-size:0.7rem;color:#3b82f6;">${window.t('details')}</button>
                        </div>
                        <div class="step-details" id="stepDetails_${index}" style="display:${expanded ? 'block' : 'none'};margin-top:0.3rem;">
                            <input type="text" class="form-input step-expectedResult" placeholder="${window.t('expectedResult')}" value="${esc(step.expectedResult || '')}" style="font-size:0.8rem;margin-bottom:0.25rem;">
                            <input type="text" class="form-input step-controlQuestion" placeholder="${window.t('controlQuestion')}" value="${esc(step.controlQuestion || '')}" style="font-size:0.8rem;margin-bottom:0.25rem;">
                            <textarea class="form-textarea step-instruction" placeholder="${window.t('instruction')}" style="font-size:0.8rem;min-height:40px;">${esc(step.instruction || '')}</textarea>
                        </div>
                    </div>
                    <button type="button" class="btn btn-small btn-danger" onclick="removeTemplateStep(${index})" style="padding:0.3rem 0.5rem;align-self:start;">
                        <i data-lucide="x" class="icon icon-sm"></i>
                    </button>
                </div>
            `;
        }
        
        function addTemplateStep() {
            const container = document.getElementById('templateStepsContainer');
            const steps = container.querySelectorAll('.process-template-step');
            const newIndex = steps.length;
            
            // Видаляємо placeholder якщо є
            if (steps.length === 0) {
                container.innerHTML = '';
            }
            
            container.insertAdjacentHTML('beforeend', renderTemplateStepEditor({ function: '', title: '' }, newIndex));
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        function removeTemplateStep(index) {
            const container = document.getElementById('templateStepsContainer');
            const steps = Array.from(container.querySelectorAll('.process-template-step'));
            
            if (steps[index]) {
                steps[index].remove();
            }
            
            // Перенумеровуємо
            container.querySelectorAll('.process-template-step').forEach((step, i) => {
                step.dataset.index = i;
                step.querySelector('.step-number').textContent = i + 1;
            });
            
            if (container.querySelectorAll('.process-template-step').length === 0) {
                container.innerHTML = '<p style="color:var(--gray);text-align:center;padding:1rem;">' + window.t('addStep') + '</p>';
            }
        }
        
        function updateStepFunction(index, value, funcId) {
            // Зберігаємо functionId в data-атрибут батьківського елементу
            const container = document.getElementById('templateStepsContainer');
            const steps = Array.from(container.querySelectorAll('.process-template-step'));
            if (steps[index]) {
                steps[index].dataset.functionId = funcId || '';
            }
        }
        
        function updateStepTitle(index, value) {
            // Зберігаємо в data атрибут
        }
        
        function toggleStepDetails(index) {
            const el = document.getElementById('stepDetails_' + index);
            if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
        }
        
        function getTemplateStepsFromEditor() {
            const container = document.getElementById('templateStepsContainer');
            const steps = [];
            
            container.querySelectorAll('.process-template-step').forEach(stepEl => {
                const funcSelect = stepEl.querySelector('.step-function');
                const titleInput = stepEl.querySelector('.step-title');
                
                if (funcSelect?.value) {
                    steps.push({
                        function: funcSelect.value,
                        functionId: stepEl.dataset.functionId || functions.find(f => f.name === funcSelect.value)?.id || '',
                        title: titleInput?.value || '',
                        expectedResult: stepEl.querySelector('.step-expectedResult')?.value || '',
                        controlQuestion: stepEl.querySelector('.step-controlQuestion')?.value || '',
                        instruction: stepEl.querySelector('.step-instruction')?.value || '',
                        slaMinutes: parseInt(stepEl.querySelector('.step-sla')?.value) || 0,
                        checkpoint: stepEl.querySelector('.step-checkpoint')?.checked || false,
                        smartAssign: stepEl.querySelector('.step-smartassign')?.checked !== false
                    });
                }
            });
            
            return steps;
        }
        
        async function saveProcessTemplate(e) {
            e.preventDefault();
            
            const templateId = document.getElementById('processTemplateId').value;
            const name = document.getElementById('processTemplateName').value.trim();
            const description = document.getElementById('processTemplateDescription').value.trim();
            const steps = getTemplateStepsFromEditor();
            
            if (!name) {
                showAlertModal(window.t('templateName'));
                return;
            }
            
            if (steps.length < 2) {
                showAlertModal(window.t('minTwoSteps'));
                return;
            }
            
            // Валідація: перевіряємо що всі функції існують
            const activeFunctions = functions.filter(f => f.status !== 'archived');
            const missingFunctions = steps.filter(s => !activeFunctions.find(f => f.name === s.function));
            if (missingFunctions.length > 0) {
                showAlertModal(window.t('functionsNotFound') + ': ' + missingFunctions.map(s => s.function).join(', '));
                return;
            }
            
            try {
                const data = {
                    name,
                    description,
                    steps,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                if (templateId) {
                    await window.companyRef().collection('processTemplates').doc(templateId).update(data);
                } else {
                    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    data.createdBy = currentUser.uid;
                    await window.companyRef().collection('processTemplates').add(data);
                }
                
                closeModal('editProcessTemplateModal');
                await loadProcessData();
                renderProcessBoard();
                showAlertModal(window.t('templateSaved'));
                
            } catch (error) {
                console.error('saveProcessTemplate error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            }
        }
        
        async function deleteProcessTemplate(templateId) {
            if (!await showConfirmModal(window.t('deleteTemplateConfirm'), { danger: true })) {
                return;
            }
            
            try {
                await window.companyRef().collection('processTemplates').doc(templateId).delete();
                await loadProcessData();
                renderTemplatesList();
                renderProcessBoard();
            } catch (error) {
                console.error('deleteProcessTemplate error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            }
        }
        
        // === ЗАПУСК ПРОЦЕСУ ===
        function openStartProcessModal() {
            const select = document.getElementById('startProcessTemplate');
            select.innerHTML = `<option value="">${window.t('select')}</option>` + 
                processTemplates.map(pt => `<option value="${esc(pt.id)}">${esc(pt.name)}</option>`).join('');
            
            document.getElementById('startProcessName').value = '';
            document.getElementById('startProcessDeadline').value = '';
            document.getElementById('startProcessPreview').style.display = 'none';
            
            document.getElementById('startProcessModal').style.display = 'block';
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        function updateStartProcessPreview() {
            const templateId = document.getElementById('startProcessTemplate').value;
            const preview = document.getElementById('startProcessPreview');
            const stepsContainer = document.getElementById('startProcessSteps');
            
            if (!templateId) {
                preview.style.display = 'none';
                return;
            }
            
            const template = processTemplates.find(t => t.id === templateId);
            if (!template?.steps) {
                preview.style.display = 'none';
                return;
            }
            
            stepsContainer.innerHTML = template.steps.map((step, i) => `
                <span style="display:flex;align-items:center;gap:0.25rem;padding:0.4rem 0.75rem;background:white;border-radius:20px;font-size:0.85rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <span style="width:20px;height:20px;background:var(--primary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;">${i + 1}</span>
                    ${esc(step.function)}
                </span>
                ${i < template.steps.length - 1 ? '<i data-lucide="arrow-right" class="icon icon-sm" style="color:var(--gray);"></i>' : ''}
            `).join('');
            
            preview.style.display = 'block';
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        // === SMART ASSIGN — find least loaded person in function ===
        function getSmartAssignee(func) {
            if (!func?.assigneeIds?.length) return null;
            if (func.assigneeIds.length === 1) return func.assigneeIds[0];
            
            // Count active tasks per person in this function
            const todayStr = getLocalDateStr();
            const loads = func.assigneeIds.map(uid => {
                const activeTasks = tasks.filter(t => 
                    t.assigneeId === uid && t.status !== 'done' && 
                    t.function === func.name
                ).length;
                const overdue = tasks.filter(t =>
                    t.assigneeId === uid && t.status !== 'done' &&
                    t.deadlineDate && t.deadlineDate < todayStr
                ).length;
                return { uid, load: activeTasks + overdue * 2 }; // overdue weighs double
            });
            
            loads.sort((a, b) => a.load - b.load);
            return loads[0].uid;
        }
        
        async function startProcess(e) {
            e.preventDefault();
            
            const templateId = document.getElementById('startProcessTemplate').value;
            const name = document.getElementById('startProcessName').value.trim();
            const deadline = document.getElementById('startProcessDeadline').value;
            const processObject = document.getElementById('startProcessObject')?.value?.trim() || '';
            
            if (!templateId || !name) return;
            
            const template = processTemplates.find(t => t.id === templateId);
            if (!template?.steps?.length) return;
            
            const firstStep = template.steps[0];
            const firstFunc = functions.find(f => f.name === firstStep.function);
            
            if (!firstFunc) {
                showAlertModal(window.t('functionNotExists').replace('{name}', firstStep.function));
                return;
            }
            
            if (!firstFunc.assigneeIds?.length) {
                showAlertModal(window.t('functionNoExecutors').replace('{name}', firstStep.function));
                return;
            }
            
            try {
                const processData = {
                    templateId,
                    name,
                    objectName: processObject,
                    deadline: deadline || null,
                    status: 'active',
                    currentStep: 0,
                    stepResults: [],
                    history: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: currentUser.uid
                };
                
                const processRef = await window.companyRef().collection('processes').add(processData);
                
                // Smart assign or head
                const assigneeId = firstStep.smartAssign !== false
                    ? getSmartAssignee(firstFunc)
                    : (firstFunc.headId || firstFunc.assigneeIds[0]);
                const assignee = users.find(u => u.id === assigneeId);
                
                // Smart deadline
                let firstDeadlineDate = new Date().toISOString().split('T')[0];
                if (deadline) {
                    const pdl = new Date(deadline + 'T18:00:00');
                    const remAfter = template.steps.slice(1).reduce((s, st) => s + parseInt(st.slaMinutes || st.estimatedTime || 60), 0);
                    const sdl = new Date(pdl.getTime() - remAfter * 60000);
                    const tmw = new Date(); tmw.setDate(tmw.getDate() + 1);
                    firstDeadlineDate = sdl > tmw ? sdl.toISOString().split('T')[0] : tmw.toISOString().split('T')[0];
                } else if (firstStep.slaMinutes) {
                    // SLA-based deadline
                    const slaDl = new Date(Date.now() + firstStep.slaMinutes * 60000);
                    firstDeadlineDate = getLocalDateStr(slaDl);
                }
                
                // Build instruction with context
                let fullInstruction = firstStep.instruction || '';
                if (processObject) {
                    fullInstruction = (processObject ? `[${processObject}]\n` : '') + fullInstruction;
                }
                if (firstStep.expectedResult) {
                    fullInstruction += `\n\n${window.t('expectedResult')}: ${firstStep.expectedResult}`;
                }
                if (firstStep.controlQuestion) {
                    fullInstruction += `\n${window.t('controlQuestion')}: ${firstStep.controlQuestion}`;
                }
                
                const taskData = {
                    title: `[${name}] ${firstStep.title || firstStep.name || firstStep.function}`,
                    function: firstStep.function,
                    assigneeId: assigneeId,
                    assigneeName: assignee?.name || assignee?.email || '',
                    instruction: fullInstruction,
                    description: fullInstruction,
                    expectedResult: firstStep.expectedResult || '',
                    estimatedTime: String(firstStep.slaMinutes || firstStep.estimatedTime || 60),
                    deadlineDate: firstDeadlineDate,
                    deadlineTime: '18:00',
                    status: 'new',
                    priority: 'high',
                    processId: processRef.id,
                    processStep: 0,
                    processObject: processObject,
                    requireReview: firstStep.checkpoint || false,
                    createdBy: currentUser.uid,
                    creatorId: currentUser.uid,
                    createdDate: getLocalDateStr(),
                    deadline: firstDeadlineDate + 'T18:00',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    creatorName: currentUserData?.name || currentUser?.email || '' // BUG-AK FIX: was window.t('systemUser')
                };
                
                await window.companyRef().collection('tasks').add(taskData);
                
                closeModal('startProcessModal');
                await loadProcessData();
                renderProcessBoard();
                renderMyDay();
                refreshCurrentView();
                
                // ET: процес запущено
                if (typeof window.trackProcessStarted === 'function') {
                    window.trackProcessStarted(processRef.id, {
                        templateId:   templateId,
                        templateName: template.name || name,
                        function:     firstStep.function || '',
                        totalSteps:   template.steps.length,
                    });
                }
                
                showToast(window.t('processStarted'), 'success');
                
            } catch (error) {
                console.error('startProcess error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            }
        }
        
        // === ПЕРЕГЛЯД ПРОЦЕСУ ===
        function openViewProcessModal(processId) {
            const process = processes.find(p => p.id === processId);
            if (!process) return;
            
            const template = processTemplates.find(t => t.id === process.templateId);
            
            if (!template) {
                document.getElementById('viewProcessTitle').innerHTML = `<i data-lucide="git-branch" class="icon"></i> ${esc(process.name)}`;
                document.getElementById('viewProcessContent').innerHTML = `
                    <div style="text-align:center;padding:2rem;color:var(--gray);">
                        <i data-lucide="alert-triangle" class="icon icon-lg" style="margin-bottom:1rem;"></i>
                        <p>${window.t('templateDeleted')}</p>
                    </div>`;
                document.getElementById('viewProcessModal').style.display = 'block';
                if (typeof window.refreshIcons === 'function') window.refreshIcons();
                return;
            }
            
            const safeCurrentStep = Math.min(process.currentStep || 0, template.steps.length - 1);
            const stepResults = process.stepResults || [];
            
            document.getElementById('viewProcessTitle').innerHTML = `<i data-lucide="git-branch" class="icon"></i> ${esc(process.name)}`;
            
            const content = document.getElementById('viewProcessContent');
            content.innerHTML = `
                ${process.objectName ? `
                <div style="margin-bottom:1rem;padding:0.6rem 1rem;background:#f0f9ff;border-radius:8px;display:flex;align-items:center;gap:0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    <span style="font-weight:600;color:#0369a1;">${esc(process.objectName)}</span>
                </div>` : ''}
                
                <div style="margin-bottom:1.5rem;">
                    <div style="font-size:0.85rem;color:var(--gray);margin-bottom:0.5rem;">${window.t('processFlow')}</div>
                    <div style="display:flex;flex-direction:column;gap:0.5rem;">
                        ${(template?.steps || []).map((step, i) => {
                            let statusColor = 'var(--gray)';
                            let statusIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>';
                            let bgColor = '#f9fafb';
                            
                            const isCompleted = process.status === 'completed' || i < safeCurrentStep;
                            const isCurrent = i === safeCurrentStep && process.status !== 'completed';
                            
                            if (isCompleted) {
                                statusIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align:-2px;"><polyline points="20 6 9 17 4 12"/></svg>';
                                statusColor = 'var(--primary)';
                            } else if (isCurrent) {
                                statusIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="8"/></svg>';
                                statusColor = 'var(--info)';
                                bgColor = '#eff6ff';
                            }
                            
                            // Find step result
                            const result = stepResults.find(r => r.step === i);
                            
                            // SLA info
                            let slaHtml = '';
                            if (step.slaMinutes) {
                                const slaH = step.slaMinutes >= 60 ? Math.round(step.slaMinutes / 60) + 'h' : step.slaMinutes + 'm';
                                if (result?.actualMinutes && result.actualMinutes > step.slaMinutes) {
                                    slaHtml = `<span style="font-size:0.68rem;background:#fef2f2;color:#ef4444;padding:1px 5px;border-radius:3px;">SLA ${slaH} / ${Math.round(result.actualMinutes)}m</span>`;
                                } else if (result?.actualMinutes) {
                                    slaHtml = `<span style="font-size:0.68rem;background:#f0fdf4;color:#16a34a;padding:1px 5px;border-radius:3px;">SLA ${slaH}</span>`;
                                } else {
                                    slaHtml = `<span style="font-size:0.68rem;background:#f3f4f6;color:#6b7280;padding:1px 5px;border-radius:3px;">SLA ${slaH}</span>`;
                                }
                            }
                            
                            // Checkpoint badge
                            const checkpointBadge = step.checkpoint ? '<span style="font-size:0.68rem;background:#fef3c7;color:#b45309;padding:1px 5px;border-radius:3px;">Checkpoint</span>' : '';
                            
                            return `
                                <div style="padding:0.75rem;background:${bgColor};border-radius:8px;border-left:3px solid ${statusColor};">
                                    <div style="display:flex;align-items:center;gap:0.75rem;">
                                        <span style="color:${statusColor};font-weight:600;width:20px;">${statusIcon}</span>
                                        <div style="flex:1;">
                                            <div style="font-weight:500;">${esc(step.name || step.title || step.function || "")} ${slaHtml} ${checkpointBadge}</div>
                                            <div style="font-size:0.78rem;color:var(--gray);">${esc(step.function)}${step.expectedResult ? ` — ${esc(step.expectedResult)}` : ''}</div>
                                        </div>
                                        ${isCurrent ? `
                                            <button class="btn btn-small btn-success" onclick="completeProcessStep('${escId(processId)}')">
                                                <i data-lucide="check" class="icon icon-sm"></i> ${window.t('completeStep')}
                                            </button>
                                        ` : ''}
                                    </div>
                                    ${result ? `
                                        <div style="margin-top:0.4rem;padding-top:0.4rem;border-top:1px solid #e5e7eb;font-size:0.78rem;">
                                            <span style="color:var(--primary);font-weight:500;">${esc(result.completedByName || '')}</span>
                                            <span style="color:var(--gray);">${result.completedAt ? new Date(result.completedAt).toLocaleDateString() : ''}</span>
                                            ${result.result ? `<div style="margin-top:2px;color:#374151;background:white;padding:4px 8px;border-radius:4px;">${esc(result.result)}</div>` : ''}
                                        </div>` : ''}
                                </div>
                            `;
                        }).join('') || ''}
                    </div>
                </div>
                
                ${process.deadline ? `
                <div style="font-size:0.82rem;color:var(--gray);margin-bottom:0.5rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    ${window.t('deadline')}: <strong>${process.deadline}</strong>
                </div>` : ''}
                
                <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;">
                    <button class="btn btn-danger btn-small" onclick="deleteProcess('${escId(processId)}')" style="opacity:0.7;">
                        <i data-lucide="trash-2" class="icon icon-sm"></i> ${window.t('deleteProcess')}
                    </button>
                </div>
            `;
            
            document.getElementById('viewProcessModal').style.display = 'block';
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }
        
        async function deleteProcess(processId) {
            if (!await showConfirmModal(window.t('deleteProcessConfirm'), { danger: true })) return;
            
            try {
                await window.companyRef().collection('processes').doc(processId).delete();
                
                // Cleanup: знімаємо processId з пов'язаних задач
                const linkedTasks = tasks.filter(tk => tk.processId === processId);
                for (const tk of linkedTasks) {
                    tk.processId = '';
                    tk.processStep = null;
                    window.companyRef().collection('tasks').doc(tk.id)
                        .update({ processId: '', processStep: null }).catch(() => {});
                }
                
                closeModal('viewProcessModal');
                await loadProcessData();
                renderProcessBoard();
            } catch (error) {
                console.error('deleteProcess error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            }
        }

// ── Кошторис всередині проекту ────────────────────────────────
function _renderProjectEstimateTab(projectId) {
    const container = document.getElementById('projectEstimateContent');
    if (!container) return;

    // Перевіряємо чи ініціалізований модуль кошторису
    if (typeof window.initEstimateModule === 'undefined') {
        container.innerHTML = `<div style="text-align:center;padding:2rem;color:#9ca3af;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin-bottom:0.75rem;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            <div>Загрузка модуля сметы...</div>
        </div>`;
        lazyLoad('estimate', function() {
            window.initEstimateModule?.();
            setTimeout(() => _renderProjectEstimateTab(projectId), 500);
        });
        return;
    }

    const estimates = (window._projectEstimates || []).filter(e => e.projectId === projectId);
    const statusLabel = { draft:window.t('estDraft')||'Чернетка', approved:window.t('estApproved')||'Затверджено', in_progress:window.t('estInProgress')||'В роботі', done:window.t('estDone')||'Виконано' };
    const statusColor = { draft:'#f59e0b', approved:'#3b82f6', in_progress:'#8b5cf6', done:'#10b981' };

    const icoClipboard = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`;
    const icoWarning  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m10.29 3.86-8.47 14.67A2 2 0 0 0 3.54 21h16.92a2 2 0 0 0 1.72-3l-8.47-14.67a2 2 0 0 0-3.42-.47Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const icoCheck    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`;
    const icoPlus     = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    const icoPDF      = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;

    if (estimates.length === 0) {
        container.innerHTML = `
        <div style="padding:1.5rem;">
            <div style="text-align:center;padding:2.5rem 1rem;border:2px dashed #e5e7eb;border-radius:12px;">
                <div style="display:flex;justify-content:center;margin-bottom:0.75rem;opacity:0.3;">${icoClipboard.replace('16','40')}</div>
                <div style="font-size:0.95rem;font-weight:600;color:#374151;margin-bottom:0.4rem;">${window.t('estimateNotLinked')||'Кошторис не прив\'язаний'}</div>
                <div style="font-size:0.83rem;color:#9ca3af;margin-bottom:1.25rem;">Создайте смету и привяжите к этому проекту</div>
                <button onclick="window._openEstimateForProject('${projectId}')"
                    style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.55rem 1.25rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;">
                    ${icoPlus} Создать смету
                </button>
            </div>
        </div>`;
        return;
    }

    const cards = estimates.map(e => {
        const status = statusLabel[e.status] || e.status;
        const color  = statusColor[e.status] || '#6b7280';
        const budget = e.totals?.totalMaterialsCost || 0;
        const deficit= e.totals?.totalDeficitCost || 0;
        const fmt = n => new Intl.NumberFormat('uk-UA', {style:'currency',currency:'UAH',maximumFractionDigits:0}).format(n||0);
        return `
        <div onclick="openEstimateModal('${e.id}')"
            style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:1rem 1.25rem;cursor:pointer;margin-bottom:0.6rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;"
            onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
            <div style="flex:1;min-width:160px;">
                <div style="font-weight:600;font-size:0.92rem;color:#111827;">${e.title||window.t('безНазвания')}</div>
                <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.15rem;">${e.sections?.length||0} ${window.t('estWorkTypes')||'типів робіт'}</div>
            </div>
            <span style="padding:0.2rem 0.6rem;border-radius:20px;font-size:0.73rem;font-weight:600;background:${color}18;color:${color};">${status}</span>
            <div style="text-align:right;">
                <div style="font-size:0.75rem;color:#6b7280;">${window.t('totalMaterialsCost')||'Бюджет матеріалів'}</div>
                <div style="font-weight:700;color:#111827;font-size:0.95rem;">${fmt(budget)}</div>
                ${deficit>0
                    ? `<div style="font-size:0.73rem;color:#ef4444;display:flex;align-items:center;gap:0.2rem;justify-content:flex-end;">${icoWarning} ${window.t('totalDeficitCost')||'Докупити'}: ${fmt(deficit)}</div>`
                    : `<div style="font-size:0.73rem;color:#10b981;display:flex;align-items:center;gap:0.2rem;justify-content:flex-end;">${icoCheck} ${window.t('estMatsOk')||'Матеріалів достатньо'}</div>`}
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
    <div style="padding:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <div style="font-weight:600;font-size:0.95rem;color:#374151;display:flex;align-items:center;gap:0.4rem;">${icoClipboard} ${window.t('projectEstimates')} (${estimates.length})</div>
            <button onclick="window._openEstimateForProject('${projectId}')"
                style="display:flex;align-items:center;gap:0.35rem;padding:0.4rem 0.9rem;background:#3b82f6;color:white;border:none;border-radius:7px;font-size:0.82rem;font-weight:600;cursor:pointer;">
                ${icoPlus} ${window.t('newEstimate')||'Новий кошторис'}
            </button>
        </div>
        ${cards.replace(/onclick="openEstimateModal/g, `onclick="event.stopPropagation();return false;" data-eid="`).replace(/'\)"\s+style=/g, `'" style=`)}
        ${estimates.map(e=>`
        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
            <button onclick="openEstimateModal('${e.id}')" style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.8rem;border:1px solid #e5e7eb;border-radius:7px;background:white;font-size:0.8rem;cursor:pointer;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                ${e.title||window.t('estimates')||'Кошторис'}
            </button>
            <button onclick="exportEstimatePDF('${e.id}')" style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.8rem;border:1px solid #e5e7eb;border-radius:7px;background:white;font-size:0.8rem;cursor:pointer;">
                ${icoPDF} PDF
            </button>
            <button onclick="syncEstimateWithWarehouse('${e.id}')" style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.8rem;border:1px solid #e5e7eb;border-radius:7px;background:white;font-size:0.8rem;cursor:pointer;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                ${window.t('updateStock') || 'Оновити склад'}
            </button>
            ${e.status === 'approved' ? `<button onclick="writeOffEstimateMaterials('${e.id}')" style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.8rem;border:1px solid #fecaca;border-radius:7px;background:#fef2f2;color:#dc2626;font-size:0.8rem;cursor:pointer;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M22 8.5V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.5"/><path d="M22 8.5H2"/><path d="M10 12h4"/><rect x="2" y="2" width="20" height="6.5" rx="1"/></svg>
                ${window.t('writeOffMaterials') || 'Списати матеріали'}
            </button>` : ''}
        </div>`).join('')}
    </div>`;
}

// Відкрити модалку нового кошторису з прив'язкою до проекту
window._openEstimateForProject = function(projectId) {
    // Переконуємось що estimate модуль завантажений
    if (typeof window.openEstimateModal !== 'function') {
        lazyLoad('estimate', function() {
            window.initEstimateModule?.();
            setTimeout(() => window._openEstimateForProject(projectId), 300);
        });
        return;
    }
    // Відкриваємо модалку і після рендеру встановлюємо projectId
    window.openEstimateModal(null);
    setTimeout(() => {
        const sel = document.getElementById('estProjectId');
        if (sel) sel.value = projectId;
    }, 100);
};

// ══════════════════════════════════════════════════════════════
// ПРОЦЕСИ — ЯК ЦЕ ПРАЦЮЄ
// ══════════════════════════════════════════════════════════════
window.toggleProcessHowto = function() {
    const panel = document.getElementById('processHowtoPanel');
    if (!panel) return;
    if (panel.style.display !== 'none') {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';
    panel.innerHTML = _buildProcessHowto();
    if (typeof refreshIcons === 'function') refreshIcons();
};

function _buildProcessHowto() {
    const path = t => `<span style="background:#f0f9ff;border:1px solid #bae6fd;padding:2px 8px;border-radius:4px;font-size:0.78rem;color:#0369a1;font-weight:600;">${t}</span>`;
    const mono = t => `<span style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-family:monospace;font-size:0.78rem;color:#374151;">${t}</span>`;
    const badge = (c,t) => `<span style="background:${c}18;color:${c};padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;">${t}</span>`;

    return `<div style="display:flex;flex-direction:column;gap:1.25rem;">

      <!-- ЗАКРИТИ -->
      <div style="display:flex;justify-content:flex-end;">
        <button onclick="toggleProcessHowto()"
          style="padding:0.35rem 0.85rem;border:1px solid #e5e7eb;border-radius:7px;background:white;font-size:0.82rem;cursor:pointer;color:#6b7280;">
          &times; Закрыть
        </button>
      </div>

      <!-- ЗАГОЛОВОК -->
      <div style="background:linear-gradient(135deg,#1a1f3c,#4f46e5);border-radius:14px;padding:1.5rem;color:white;">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;">Модуль Процессы — что это и зачем</div>
        <div style="font-size:0.85rem;line-height:1.7;opacity:0.92;">
          Процессы решают одну главную проблему: <b>владелец объясняет одно и то же «с нуля» каждый раз.</b>
          Новый клиент — снова объясняешь каждому кто что делает. Новый сотрудник — снова показываешь каждый шаг.
          Регулярная задача — снова кто-то что-то забывает. Процессы — это шаблоны последовательности действий.
          Один раз настроил → запускаешь кликом → все задачи создаются автоматически с исполнителями и дедлайнами.
        </div>
      </div>

      <!-- ПРОБЛЕМИ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;">Какие проблемы решает</div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${[
            [window.t('explainFromScratch'), 'Время владельца тратится на объяснения вместо развития', 'Шаблон процесса описывает каждый шаг один раз — дальше система сама распределяет задачи'],
            ['Менеджер что-то забыл или перепутал порядок', 'Клиент получил неполную услугу, ошибка в процессе', 'Система не даёт перейти на следующий шаг пока предыдущий не выполнен'],
            ['Не знают кто сейчас что делает по каждому клиенту', 'Владелец спрашивает всех по очереди — теряет время', 'Dashboard процессов — видишь статус каждого клиента на одном экране'],
            ['Регулярные процессы выполняются по-разному разными людьми', 'Качество непредсказуемо, клиент получает разный сервис', 'Один шаблон для всех — одинаковый результат независимо от исполнителя'],
            ['Не знают сколько времени занимает каждый шаг', window.t('cantPlanTeamLoad'), 'SLA на каждый шаг — система считает дедлайны автоматически'],
            ['При увольнении сотрудника процессы «исчезают»', 'Новый не знает как правильно — начинаем с нуля', 'Шаблон остаётся в системе — новый берёт и выполняет по инструкции'],
          ].map(([pain, impact, fix]) => `
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;font-size:0.8rem;">
            <div style="padding:0.65rem 0.85rem;background:#fef2f2;border-right:1px solid #f3f4f6;">
              <div style="font-size:0.68rem;font-weight:700;color:#dc2626;margin-bottom:2px;">ПРОБЛЕМА</div>
              <div style="color:#7f1d1d;line-height:1.5;">${pain}</div>
            </div>
            <div style="padding:0.65rem 0.85rem;background:#fff7ed;border-right:1px solid #f3f4f6;">
              <div style="font-size:0.68rem;font-weight:700;color:#ea580c;margin-bottom:2px;">ПОСЛЕДСТВИЕ</div>
              <div style="color:#7c2d12;line-height:1.5;">${impact}</div>
            </div>
            <div style="padding:0.65rem 0.85rem;background:#f0fdf4;">
              <div style="font-size:0.68rem;font-weight:700;color:#16a34a;margin-bottom:2px;">РЕШЕНИЕ</div>
              <div style="color:#14532d;line-height:1.5;">${fix}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- ОСНОВНА ЛОГІКА -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;">Основная логика — как это работает</div>
        <div style="background:#f8fafc;border-radius:10px;padding:1rem;margin-bottom:1rem;font-family:monospace;font-size:0.8rem;line-height:2;color:#1e293b;">
          ШАБЛОН (один раз) → ЗАПУСК (каждый клиент) → АВТОМАТИЧЕСКОЕ ВЫПОЛНЕНИЕ<br>
          ─────────────────────────────────────────────────────────────<br>
          Шаблон: Приём нового клиента<br>
          Шаг 1: Менеджер → Первичный звонок (SLA: 2 часа)<br>
          Шаг 2: Юрист → Подписание договора (SLA: 1 день)<br>
          Шаг 3: Бухгалтер → Выставление счёта (SLA: 4 часа)<br>
          Шаг 4: Технический отдел → Настройка доступа (SLA: 8 часов)<br>
          ─────────────────────────────────────────────────────────────<br>
          Нажал «Запустить» → Шаг 1 → задача Менеджеру автоматически<br>
          Менеджер отметил «Выполнено» → Шаг 2 → задача Юристу автоматически<br>
          Юрист выполнил → Шаг 3 → задача Бухгалтеру автоматически<br>
          и так далее...
        </div>
        <div style="font-size:0.82rem;color:#374151;line-height:1.7;">
          <b>Ключевая идея:</b> ты не создаёшь задачи вручную. Ты один раз описываешь последовательность — и система сама распределяет работу по нужным людям в нужное время.
        </div>
      </div>

      <!-- ШАБЛОН ДЕТАЛЬНО -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:0.75rem;">Шаблон процесса — что можно настроить</div>
        <div style="font-size:0.82rem;color:#374151;line-height:1.7;margin-bottom:0.75rem;">
          ${path(window.t('processesNewTemplate'))}
        </div>
        <div style="font-size:0.82rem;font-weight:700;color:#6b7280;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.05em;">Каждый шаг шаблона содержит:</div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem;">
          ${[
            ['Функция','Кто выполняет этот шаг — выбираешь из функциональной структуры компании (Менеджер, Юрист, Бухгалтер и т.д.). Система сама знает кто закреплён за этой функцией'],
            ['Название шага','Что конкретно нужно сделать: «Подписать договор», «Выставить счёт», «Настроить доступ»'],
            [window.t('slaTime'),'30 мин / 1 час / 2 часа / 4 часа / 8 часов / 1 день / 2 дня / 3 дня. Система автоматически считает дедлайн каждого шага'],
            [window.t('expectedResultTitle'),'Что должно быть сделано по факту: «Договор подписан и отсканирован», «Счёт выставлен в 1С». Исполнитель видит это в задаче'],
            [window.t('controlQuestion'),'Вопрос для самопроверки исполнителя перед закрытием шага: «Подтвердил ли клиент получение?»'],
            ['Инструкция','Подробное описание как выполнить шаг. Новый человек может выполнить без дополнительных объяснений'],
            ['Checkpoint (контрольная точка)','Если включено — задача сначала идёт на проверку руководителю и только после его подтверждения переходит дальше'],
            ['Smart Assign','Если в функции несколько исполнителей — система автоматически выбирает наименее загруженного. Считает активные задачи + просроченные × 2'],
          ].map(([field, desc]) => `
          <div style="display:flex;gap:0.75rem;align-items:flex-start;padding:0.5rem 0.75rem;background:#f9fafb;border-radius:7px;font-size:0.8rem;">
            <div style="font-weight:700;color:#111827;min-width:180px;flex-shrink:0;">${field}</div>
            <div style="color:#6b7280;line-height:1.5;">${desc}</div>
          </div>`).join('')}
        </div>

        <div style="font-size:0.82rem;font-weight:700;color:#6b7280;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.05em;">Примеры шаблонов:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          ${[
            [window.t('newClientProcess'),'Звонок → Договор → Счёт → Доступ → Приветствие'],
            ['Обработка заказа','Приём → Подтверждение → Производство → Контроль → Доставка'],
            ['Onboarding сотрудника','Документы → Оборудование → Доступы → Обучение → Первая неделя'],
            [window.t('monthClose'),'Отчёт продаж → Отчёт расходов → Сверка → Начисление → Выплата'],
            ['Рекламная кампания','Бриф → Дизайн → Согласование → Запуск → Отчёт'],
            ['Претензия клиента','Регистрация → Расследование → Решение → Ответ клиенту → Закрытие'],
          ].map(([name, steps]) => `
          <div style="padding:0.6rem 0.85rem;background:#f0f4ff;border-radius:8px;font-size:0.8rem;">
            <div style="font-weight:700;color:#3730a3;margin-bottom:0.2rem;">${name}</div>
            <div style="color:#6b7280;font-size:0.75rem;">${steps}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- ЗАПУСК ПРОЦЕСУ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:0.75rem;">Запуск процесса — что происходит</div>
        <div style="font-size:0.82rem;color:#374151;line-height:1.7;margin-bottom:0.75rem;">
          ${path(window.t('processesRunLabel'))} → выбираешь шаблон → вводишь название (например «Клиент Иваненко») → объект (адрес, артикул и т.д.) → дедлайн процесса.
        </div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
          ${[
            ['Автоматически создаётся задача для первого шага','Исполнитель первого шага получает задачу в Моём Дне и уведомление в Telegram'],
            ['Smart Deadline','Если указал конечный дедлайн — система считает дедлайн каждого шага от конца: конец − SLA последнего − SLA предпоследнего − ... Каждый получает реалистичный дедлайн'],
            [window.t('objectContext'),'Если указал «объект» (например «Кв. Шевченко 15, кв 24») — он будет отображаться в каждой задаче и в dashboard процессов'],
            ['Исполнитель выбирается автоматически','Smart Assign выбирает наименее загруженного из функции. Никто не перегружен'],
            ['Процесс появляется в Dashboard','Горизонтальная шкала прогресса — видно на каком шаге каждый процесс прямо сейчас'],
          ].map(([title, desc]) => `
          <div style="border-left:3px solid #4f46e5;padding:0.6rem 0.85rem;background:#f9fafb;border-radius:0 8px 8px 0;font-size:0.82rem;">
            <div style="font-weight:700;color:#111827;margin-bottom:0.2rem;">${title}</div>
            <div style="color:#6b7280;line-height:1.55;">${desc}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- АВТОМАТИЧНЕ ВИКОНАННЯ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:0.75rem;">Автоматичне просування — що відбувається коли крок виконано</div>
        <div style="background:#f8fafc;border-radius:10px;padding:1rem;margin-bottom:0.75rem;font-size:0.82rem;line-height:1.8;color:#1e293b;">
          <b>Виконавець позначає задачу "Виконано" → Google Cloud Functions (сервер) автоматично:</b><br><br>
          1. Фіксує результат кроку (хто виконав, коли, скільки хвилин зайняло, коментар)<br>
          2. Оновлює прогрес процесу (+1 крок)<br>
          3. Визначає виконавця наступного кроку (Smart Assign)<br>
          4. Рахує дедлайн наступного кроку (SLA або від загального дедлайну)<br>
          5. Створює задачу наступного кроку з повним контекстом попередніх результатів<br>
          6. Надсилає виконавцю наступного кроку сповіщення в Telegram<br>
          7. Надсилає власнику / менеджеру сповіщення про прогрес процесу<br><br>
          <b>Якщо це був останній крок:</b><br>
          → Процес отримує статус "Завершено"<br>
          → Всі власники і менеджери отримують Telegram сповіщення "✅ Процес завершено!"<br>
          → Процес іде в архів (видно при фільтрі "Архів")
        </div>
        <div style="padding:0.65rem 0.9rem;background:#fef3c7;border-radius:8px;font-size:0.82rem;color:#92400e;">
          <b>Важливо:</b> весь ланцюжок запускається на сервері (Google Cloud Functions) — не в браузері. Навіть якщо всі вийшли з системи — процес продовжує працювати.
        </div>
      </div>

      <!-- CHECKPOINT -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:0.75rem;">Checkpoint — крок на перевірку керівника</div>
        <div style="font-size:0.82rem;color:#374151;line-height:1.7;margin-bottom:0.75rem;">
          Якщо для кроку увімкнено <b>Checkpoint</b> — виконавець не може просто закрити задачу. Задача спочатку іде на статус "На перевірці" і тільки після того як керівник підтверджує — процес іде далі.
        </div>
        <div style="background:#f8fafc;border-radius:10px;padding:1rem;font-family:monospace;font-size:0.79rem;line-height:2;color:#1e293b;">
          Без Checkpoint: Виконавець → "Виконано" → Наступний крок<br>
          З Checkpoint: &nbsp;Виконавець → "Виконано" → "На перевірці" → Керівник підтверджує → Наступний крок
        </div>
        <div style="margin-top:0.75rem;font-size:0.82rem;color:#374151;line-height:1.7;">
          <b>Коли використовувати:</b> для критичних кроків де помилка дорого коштує — підписання договору, відправка клієнту, фінансові операції, юридичні документи.
        </div>
      </div>

      <!-- SMART ASSIGN -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:0.75rem;">Smart Assign — автоматичний вибір виконавця</div>
        <div style="font-size:0.82rem;color:#374151;line-height:1.7;margin-bottom:0.75rem;">
          Якщо в функції кілька виконавців (наприклад 3 менеджери) — система не завжди призначає першого по списку. Вона вибирає <b>найменш завантаженого</b>.
        </div>
        <div style="background:#f8fafc;border-radius:10px;padding:1rem;font-family:monospace;font-size:0.79rem;line-height:2;color:#1e293b;">
          Менеджер А: 5 активних задач + 1 прострочена → навантаження = 5 + 1×2 = 7<br>
          Менеджер Б: 3 активних задачі + 0 прострочених → навантаження = 3<br>
          Менеджер В: 4 активних задачі + 2 прострочених → навантаження = 4 + 2×2 = 8<br>
          ──────────────────────────────────────────────────────────<br>
          Smart Assign вибере: Менеджер Б (навантаження 3 — найменше)
        </div>
        <div style="margin-top:0.75rem;font-size:0.82rem;color:#374151;line-height:1.7;">
          Прострочені задачі рахуються з коефіцієнтом ×2 — вони важливіші. Це забезпечує рівномірне завантаження команди без ручного розподілу.
        </div>
      </div>

      <!-- DASHBOARD -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:0.75rem;">Dashboard процесів — що бачить власник</div>
        <div style="font-size:0.82rem;color:#374151;line-height:1.7;margin-bottom:0.75rem;">
          Кожен запущений процес відображається рядком з горизонтальною шкалою прогресу:
        </div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:0.75rem;">
          ${[
            ['Назва процесу','Наприклад "[Кошторис Іваненко] Прийом клієнта"'],
            ['Назва шаблону','Який шаблон використовується'],
            ['Об\'єкт процесу','Якщо вказано при запуску — "Кв. Шевченка 15", "Замовлення №123"'],
            ['Поточний виконавець','Хто зараз виконує активний крок'],
            ['Дедлайн','Дата завершення. Червоний = прострочений'],
            ['Прогрес %','Скільки кроків виконано з загальної кількості'],
            ['Горизонтальна шкала кроків','Кожен крок: сірий = очікує, синій = активний, зелений = виконано'],
          ].map(([field, desc]) => `
          <div style="display:flex;gap:0.75rem;padding:0.45rem 0.75rem;background:#f9fafb;border-radius:7px;font-size:0.8rem;">
            <div style="font-weight:600;color:#111827;min-width:180px;flex-shrink:0;">${field}</div>
            <div style="color:#6b7280;">${desc}</div>
          </div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          ${[
            ['Сортування','Прострочені → Активні (менший % вгорі) → Завершені. Найгостріші проблеми завжди вгорі'],
            ['Фільтр по шаблону','Показати тільки процеси одного типу: наприклад всі "Прийоми клієнтів"'],
            ['Фільтр по виконавцю','Показати тільки процеси де активний крок призначений на конкретну людину'],
            ['Архів','Кнопка "Архів" показує завершені процеси — повна історія'],
          ].map(([title, desc]) => `
          <div style="padding:0.55rem 0.75rem;background:#f0f4ff;border-radius:8px;font-size:0.79rem;">
            <div style="font-weight:700;color:#3730a3;margin-bottom:0.2rem;">${title}</div>
            <div style="color:#6b7280;line-height:1.45;">${desc}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- ЗВ'ЯЗКИ -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;">Зв'язки з іншими модулями</div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">

          <div style="border:1px solid #bfdbfe;border-radius:10px;overflow:hidden;">
            <div style="background:#eff6ff;padding:0.6rem 1rem;"><span style="font-weight:700;font-size:0.88rem;color:#1d4ed8;">Завдання ${path('Мій день / Всі завдання')}</span></div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              Кожен крок процесу — це звичайна задача в системі завдань. Виконавець бачить її в "Моєму Дні", в загальному списку завдань.
              Задача має назву у форматі <b>[Назва процесу] Крок</b> — одразу зрозуміло до якого процесу належить.
              В задачі є весь контекст: інструкція, очікуваний результат, контрольне питання, результати попередніх кроків.
              Виконавець не бачить "зробити щось" — він бачить конкретний крок з повним контекстом.
            </div>
          </div>

          <div style="border:1px solid #bbf7d0;border-radius:10px;overflow:hidden;">
            <div style="background:#f0fdf4;padding:0.6rem 1rem;"><span style="font-weight:700;font-size:0.88rem;color:#065f46;">Функціональна структура ${path('Система → Функції')}</span></div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              Кожен крок прив'язується до <b>функції</b> (ролі в компанії), а не до конкретної людини.
              Функція "Менеджер" → всі хто є менеджерами. Функція "Юрист" → всі юристи.
              Якщо менеджер звільнився → призначаєш нову людину на функцію → всі процеси автоматично йдуть до неї.
              Не треба переробляти жоден шаблон.
            </div>
          </div>

          <div style="border:1px solid #fde68a;border-radius:10px;overflow:hidden;">
            <div style="background:#fffbeb;padding:0.6rem 1rem;"><span style="font-weight:700;font-size:0.88rem;color:#b45309;">Telegram сповіщення</span></div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              <b>Виконавець наступного кроку</b> отримує Telegram сповіщення: назва процесу, номер кроку, що треба зробити, дедлайн, очікуваний результат.<br>
              <b>Власник і менеджери</b> отримують сповіщення про прогрес: "Крок 2 завершено → Крок 3: Юрист Іваненко".<br>
              <b>При завершенні всього процесу</b>: "✅ Процес завершено! Всі 5 кроків виконано!"<br>
              Сповіщення надсилаються сервером — навіть якщо всі вийшли з системи.
            </div>
          </div>

          <div style="border:1px solid #e9d5ff;border-radius:10px;overflow:hidden;">
            <div style="background:#faf5ff;padding:0.6rem 1rem;"><span style="font-weight:700;font-size:0.88rem;color:#7e22ce;">CRM ${path('Бізнес → CRM')}</span></div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              Процес можна запустити автоматично через Event Bus коли угода переходить в певну стадію CRM.
              Наприклад: угода → "Виграно" → автоматично запускається процес "Onboarding клієнта".
              Ім'я клієнта передається як "об'єкт процесу" — видно в кожному кроці.
            </div>
          </div>

          <div style="border:1px solid #fed7aa;border-radius:10px;overflow:hidden;">
            <div style="background:#fff7ed;padding:0.6rem 1rem;"><span style="font-weight:700;font-size:0.88rem;color:#c2410c;">Аналітика ${path('Аналітика → Процеси')}</span></div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">
              Кожен крок зберігає: хто виконав, коли, скільки хвилин зайняло, результат.
              Ці дані дозволяють аналізувати де процес "гальмує", хто виконує швидше, де постійно перевищується SLA.
            </div>
          </div>

        </div>
      </div>

      <!-- ПОКРОКОВО -->
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#111827;margin-bottom:1rem;">Покрокове налаштування з нуля</div>
        <div style="display:flex;flex-direction:column;gap:0.6rem;">
          ${[
            ['1','#4f46e5','Перевір функціональну структуру',`${path('Система → Функції')}`,
              'Переконайся що всі функції компанії налаштовані і до кожної прив\'язані виконавці. Саме з функцій беруться виконавці кроків. Якщо функції не налаштовані — процес не запуститься.',
              'Функція = роль в компанії: Менеджер, Юрист, Бухгалтер, Технічний відділ тощо. Не посада — роль.'],
            ['2','#3b82f6','Визнач процес для автоматизації','',
              'Обери один повторюваний процес який виконується найчастіше або де найбільше помилок. Наприклад: "Обробка замовлення" або "Прийом нового клієнта". Починай з одного — не намагайся автоматизувати все одразу.',
              'Критерії вибору: виконується мінімум 2-3 рази на тиждень, має чіткі кроки, страждає від помилок або забування.'],
            ['3','#8b5cf6','Створи шаблон',`${path(window.t('processesNewTemplate'))}`,
              'Назви шаблон. Додай мінімум 2 кроки (система вимагає від 2). Для кожного кроку: вибери функцію, напиши назву кроку, встанови SLA, додай інструкцію і очікуваний результат. Для критичних кроків увімкни Checkpoint.',
              'Починай просто — 3-5 кроків. Потім розширюй. Краще запустити простий шаблон сьогодні ніж ідеальний через місяць.'],
            ['4','#10b981','Запусти перший процес',`${path('Процеси → Запустити')}`,
              'Вибери шаблон → введи назву (ім\'я клієнта або номер замовлення) → вкажи об\'єкт якщо є → встанови дедлайн → підтвердж. Система автоматично створить задачу першого кроку.',
              ''],
            ['5','#f59e0b','Спостерігай і коригуй','',
              'Відкривай Dashboard процесів щодня. Де прострочено? Де затримка? Де постійно один і той же крок "застрягає"? Це сигнали для покращення шаблону — або SLA занадто короткий, або інструкція незрозуміла, або виконавець перевантажений.',
              ''],
          ].map(([num, color, title, pathHtml, desc, tip]) => `
          <div style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;">
            <div style="background:#f9fafb;padding:0.65rem 1rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid #f3f4f6;">
              <div style="width:26px;height:26px;background:${color};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.82rem;flex-shrink:0;">${num}</div>
              <div>
                <div style="font-weight:700;font-size:0.88rem;color:#111827;">${title}</div>
                ${pathHtml ? `<div style="margin-top:2px;">${pathHtml}</div>` : ''}
              </div>
            </div>
            <div style="padding:0.75rem 1rem;font-size:0.82rem;color:#374151;line-height:1.7;">${desc}</div>
            ${tip ? `<div style="padding:0.5rem 1rem;background:#fffbeb;border-top:1px solid #fde68a;font-size:0.78rem;color:#92400e;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${tip}</div>` : ''}
          </div>`).join('')}
        </div>
      </div>

      <!-- РЕЗУЛЬТАТ -->
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:14px;padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;color:#065f46;margin-bottom:0.75rem;">Що отримуєш через місяць роботи з процесами</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          ${[
            'Власник не пояснює одне і те ж постійно — шаблон робить це замість нього',
            'Кожен крок виконується в правильному порядку — помилки зникають',
            'Новий співробітник може виконати процес з першого дня без додаткового навчання',
            'Власник бачить стан кожного клієнта в реальному часі без нарад',
            'Прострочені процеси одразу видно — можна реагувати до того як стане проблемою',
            'Команда рівномірно завантажена — Smart Assign розподіляє без перевантаження',
            'При звільненні співробітника — змінюєш виконавця функції і все продовжує працювати',
            '1 налаштований процес = сотні годин зекономлених за рік',
          ].map(r => `
          <div style="display:flex;align-items:flex-start;gap:0.4rem;padding:0.5rem 0.75rem;background:white;border-radius:8px;font-size:0.8rem;color:#166534;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${r}</span>
          </div>`).join('')}
        </div>
        <div style="margin-top:1rem;text-align:center;">
          <button onclick="openProcessTemplatesModal();toggleProcessHowto();"
            style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.65rem 1.5rem;background:#4f46e5;color:white;border:none;border-radius:9px;font-size:0.9rem;font-weight:700;cursor:pointer;">
            Створити перший шаблон →
          </button>
        </div>
      </div>

    </div>`;
}

// ══════════════════════════════════════════════════════════
// PROJECT MEMBERS — учасники та підрядники
// ══════════════════════════════════════════════════════════

window.toggleProjectMembersHelp = function(projectId) {
    const el = document.getElementById('projectMembersHelp_' + projectId);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.openProjectMembers = async function(projectId) {
    const db = window.db || firebase.firestore();
    const cid = window.currentCompanyId;
    const project = (typeof projects !== 'undefined' ? projects : []).find(p => p.id === projectId);
    if (!project) return;

    // Завантажуємо поточних учасників
    const snap = await db.collection('companies').doc(cid).collection('projects').doc(projectId).get();
    const members = snap.data()?.projectMembers || [];

    // Список співробітників компанії
    const compUsers = (window.companyUsers || window.users || []).filter(u => u.role !== 'guest');

    const roleLabel = { member: 'Учасник', assignee: 'Виконавець', viewer: 'Спостерігач' };
    const roleColor = { member: '#3b82f6', assignee: '#22c55e', viewer: '#9ca3af' };

    const membersHTML = members.length ? members.map(m => `
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.6rem;background:white;border:1px solid #e8eaed;border-radius:7px;margin-bottom:0.3rem;">
            <div style="width:28px;height:28px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:#16a34a;flex-shrink:0;">${(m.name||'?').charAt(0).toUpperCase()}</div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.82rem;font-weight:600;color:#111827;">${m.name||m.email||'—'}</div>
                <div style="font-size:0.68rem;color:#9ca3af;">${m.email||''} ${m.isGuest ? '· підрядник' : ''}</div>
            </div>
            <span style="font-size:0.7rem;font-weight:600;color:${roleColor[m.role]||'#6b7280'};background:#f8fafc;padding:2px 8px;border-radius:8px;">${roleLabel[m.role]||m.role}</span>
            <button onclick="removeProjectMember('${projectId}','${m.uid}')" style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px 4px;font-size:1rem;" title="Видалити">✕</button>
        </div>`).join('') : '<div style="font-size:0.8rem;color:#9ca3af;padding:0.5rem;">Учасників ще немає</div>';

    const usersOptions = compUsers.map(u => `<option value="${u.id}">${u.name||u.email}</option>`).join('');
    const roleOptions = `${window.t('optionValuememberучасникБачитьВсі')}`;

    const overlay = document.createElement('div');
    overlay.id = 'projectMembersOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10020;display:flex;align-items:center;justify-content:center;padding:1rem;';
    overlay.innerHTML = `
    <div style="background:white;border-radius:14px;padding:1.5rem;width:100%;max-width:480px;max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <div style="font-weight:700;font-size:1rem;color:#111827;">Учасники проєкту</div>
            <button onclick="document.getElementById('projectMembersOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;">✕</button>
        </div>
        
        <!-- Поточні учасники -->
        <div style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.5rem;">Поточні учасники</div>
        <div id="pmCurrentList">${membersHTML}</div>
        
        <!-- Додати співробітника -->
        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid #f1f5f9;">
            <div style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.5rem;">Додати співробітника</div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <select id="pmAddUser" style="flex:1;min-width:140px;padding:0.4rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;">
                    <option value="">— оберіть співробітника —</option>
                    ${usersOptions}
                </select>
                <select id="pmAddRole" style="flex:1;min-width:140px;padding:0.4rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;">${roleOptions}</select>
                <button onclick="addProjectMember('${projectId}')" style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.82rem;font-weight:600;">Додати</button>
            </div>
        </div>
        
        <!-- Запросити підрядника -->
        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid #f1f5f9;">
            <div style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.5rem;">Запросити підрядника</div>
            <div style="display:grid;gap:0.4rem;">
                <input id="pmGuestEmail" type="email" placeholder=window.t('emailПідрядника') style="padding:0.4rem 0.55rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;">
                <input id="pmGuestName" type="text" placeholder="Ім'я підрядника" style="padding:0.4rem 0.55rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;">
                <select id="pmGuestRole" style="padding:0.4rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;">${roleOptions}</select>
                <button onclick="inviteGuestToProject('${projectId}')" style="padding:0.45rem;background:#3b82f6;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.82rem;font-weight:600;">Надіслати запрошення</button>
            </div>
            <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.4rem;">Підрядник отримає email і матиме доступ тільки до цього проєкту</div>
        </div>
    </div>`;
    document.body.appendChild(overlay);
};

window.addProjectMember = async function(projectId) {
    const uid = document.getElementById('pmAddUser')?.value;
    const role = document.getElementById('pmAddRole')?.value || 'member';
    if (!uid) { if(window.showToast) showToast('Оберіть співробітника', 'error'); return; }

    const db = window.db || firebase.firestore();
    const cid = window.currentCompanyId;
    const user = (window.companyUsers || window.users || []).find(u => u.id === uid);
    if (!user) return;

    const member = { uid, name: user.name||user.email||'', email: user.email||'', role, isGuest: false, addedAt: new Date().toISOString() };

    try {
        const ref = db.collection('companies').doc(cid).collection('projects').doc(projectId);
        await ref.update({ projectMembers: firebase.firestore.FieldValue.arrayUnion(member) });
        if(window.showToast) showToast(`${user.name||user.email} додано як ${role}`, 'success');
        document.getElementById('projectMembersOverlay')?.remove();
        window.openProjectMembers(projectId);
        window._renderProjectMembersBadge(projectId);
    } catch(e) {
        if(window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};

window.removeProjectMember = async function(projectId, uid) {
    const db = window.db || firebase.firestore();
    const cid = window.currentCompanyId;
    try {
        const snap = await db.collection('companies').doc(cid).collection('projects').doc(projectId).get();
        const members = (snap.data()?.projectMembers || []).filter(m => m.uid !== uid);
        await db.collection('companies').doc(cid).collection('projects').doc(projectId).update({ projectMembers: members });
        if(window.showToast) showToast('Учасника видалено', 'success');
        document.getElementById('projectMembersOverlay')?.remove();
        window.openProjectMembers(projectId);
        window._renderProjectMembersBadge(projectId);
    } catch(e) {
        if(window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};

window.inviteGuestToProject = async function(projectId) {
    const email = document.getElementById('pmGuestEmail')?.value.trim();
    const name  = document.getElementById('pmGuestName')?.value.trim();
    const role  = document.getElementById('pmGuestRole')?.value || 'assignee';
    if (!email) { if(window.showToast) showToast('Введіть email підрядника', 'error'); return; }

    const db = window.db || firebase.firestore();
    const cid = window.currentCompanyId;

    try {
        // Перевіряємо чи є такий user вже
        const usersSnap = await db.collection('companies').doc(cid).collection('users').where('email','==',email).limit(1).get();

        if (!usersSnap.empty) {
            // Вже є — просто додаємо в projectMembers
            const existingUser = usersSnap.docs[0];
            const member = { uid: existingUser.id, name: name||existingUser.data().name||email, email, role, isGuest: true, addedAt: new Date().toISOString() };
            await db.collection('companies').doc(cid).collection('projects').doc(projectId).update({
                projectMembers: firebase.firestore.FieldValue.arrayUnion(member)
            });
            await existingUser.ref.update({
                guestProjects: firebase.firestore.FieldValue.arrayUnion(projectId)
            });
            if(window.showToast) showToast(`${email} додано до проєкту`, 'success');
        } else {
            // Новий — створюємо invite
            await db.collection('invites').add({
                email, name: name||email, role: 'guest',
                projectId, projectRole: role,
                companyId: cid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending',
                type: 'guest_project',
            });
            if(window.showToast) showToast(`Запрошення надіслано на ${email}`, 'success');
        }
        document.getElementById('projectMembersOverlay')?.remove();
        window._renderProjectMembersBadge(projectId);
    } catch(e) {
        if(window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};

window._renderProjectMembersBadge = async function(projectId) {
    const listEl = document.getElementById('projectMembersList_' + projectId);
    if (!listEl) return;
    const db = window.db || firebase.firestore();
    const cid = window.currentCompanyId;
    try {
        const snap = await db.collection('companies').doc(cid).collection('projects').doc(projectId).get();
        const members = snap.data()?.projectMembers || [];
        if (!members.length) { listEl.innerHTML = ''; return; }
        const roleColor = { member: '#3b82f6', assignee: '#22c55e', viewer: '#9ca3af' };
        const roleLabel = { member: 'Учасник', assignee: 'Виконавець', viewer: 'Спостерігач' };
        listEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.5rem;">
            <span style="font-size:0.72rem;color:#9ca3af;font-weight:600;">УЧАСНИКИ:</span>
            ${members.map(m => `
            <span style="font-size:0.72rem;background:white;border:1px solid #e8eaed;border-radius:10px;padding:2px 8px;display:flex;align-items:center;gap:4px;">
                <span style="width:6px;height:6px;border-radius:50%;background:${roleColor[m.role]||'#6b7280'};display:inline-block;"></span>
                ${m.name||m.email} <span style="color:${roleColor[m.role]||'#6b7280'}">${roleLabel[m.role]||m.role}</span>
            </span>`).join('')}
            <button onclick="openProjectMembers('${projectId}')" style="font-size:0.7rem;background:none;border:1px dashed #d1d5db;border-radius:10px;padding:2px 8px;cursor:pointer;color:#9ca3af;">+ додати</button>
        </div>`;
    } catch(e) { listEl.innerHTML = ''; }
};
