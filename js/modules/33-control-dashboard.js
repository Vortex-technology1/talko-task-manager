// =====================
        // CONTROL DASHBOARD
        // =====================
'use strict';
        function renderControl() {
            _visibleTaskIds = null; // Invalidate visibility cache
            const af = document.getElementById('controlAssigneeFilter')?.value;
            const ff = document.getElementById('controlFunctionFilter')?.value;
            const pf = document.getElementById('controlPeriodFilter')?.value;
            
            // Завжди оновлюємо селекти — але зберігаємо поточне значення
            const assigneeSelect = document.getElementById('controlAssigneeFilter');
            const functionSelect = document.getElementById('controlFunctionFilter');
            const activeFunctions = functions.filter(f => f.status !== 'archived');
            if (assigneeSelect) {
                assigneeSelect.innerHTML = `<option value="">${t('allAssignees')}</option>` + users.map(u => `<option value="${esc(u.id)}">${esc(u.name || u.email)}</option>`).join('');
                if (af) assigneeSelect.value = af; // відновлюємо вибір
            }
            if (functionSelect) {
                functionSelect.innerHTML = `<option value="">${t('allFunctions')}</option>` + activeFunctions.map(f => `<option value="${esc(f.name)}">${esc(f.name)}</option>`).join('');
                if (ff) functionSelect.value = ff; // відновлюємо вибір
            }
            
            const now = new Date();
            const today = getLocalDateStr(now);
            const tm = new Date(now); tm.setDate(tm.getDate() + 1);
            const tomorrow = getLocalDateStr(tm);
            
            // Фільтруємо завдання
            let filteredTasks = tasks.filter(task => {
                if (!isTaskVisibleToUser(task)) return false;
                if (af && task.assigneeId !== af) return false;
                if (ff && task.function !== ff) return false;
                if (pf === 'today') {
                    const taskDate = parseDeadline(task).date;
                    if (taskDate !== today) return false;
                }
                if (pf === 'week') {
                    const taskDate = parseDeadline(task).date;
                    const weekLater = new Date();
                    weekLater.setDate(weekLater.getDate() + 7);
                    if (taskDate > getLocalDateStr(weekLater) || taskDate < today) return false;
                }
                if (pf === 'month') {
                    const taskDate = parseDeadline(task).date;
                    const monthLater = new Date();
                    monthLater.setMonth(monthLater.getMonth() + 1);
                    if (taskDate > getLocalDateStr(monthLater) || taskDate < today) return false;
                }
                return true;
            });
            
            const urgent = filteredTasks.filter(task => {
                const taskDate = parseDeadline(task).date;
                return taskDate && taskDate < today && task.status !== 'done' && task.status !== 'review';
            }).length;
            
            const warning = filteredTasks.filter(task => {
                const taskDate = parseDeadline(task).date;
                return (taskDate === today || taskDate === tomorrow) && task.status !== 'done' && task.status !== 'review';
            }).length;
            
            const active = filteredTasks.filter(task => task.status === 'progress').length;
            const completed = filteredTasks.filter(task => task.status === 'done').length;
            
            document.getElementById('urgentCount').textContent = urgent;
            document.getElementById('warningCount').textContent = warning;
            document.getElementById('activeCount').textContent = active;
            document.getElementById('completedCount').textContent = completed;
            
            renderControlContent();
            renderTeamDashboard();
        }
        
        // Клік по картці — показати відповідний список
        window.filterControlByCard = function(type) {
            const content = document.getElementById('controlContent');
            if (!content) return;

            const now = new Date();
            const today = getLocalDateStr(now);
            const tm = new Date(now); tm.setDate(tm.getDate() + 1);
            const tomorrow = getLocalDateStr(tm);
            const af = document.getElementById('controlAssigneeFilter')?.value || '';
            const ff = document.getElementById('controlFunctionFilter')?.value || '';

            let filtered = tasks.filter(task => {
                if (!isTaskVisibleToUser(task)) return false;
                if (af && task.assigneeId !== af) return false;
                if (ff && task.function !== ff) return false;
                return true;
            });

            let title = '';
            if (type === 'urgent') {
                filtered = filtered.filter(t => {
                    const d = parseDeadline(t).date;
                    return d && d < today && t.status !== 'done' && t.status !== 'review';
                });
                title = t('dashOverdue');
            } else if (type === 'warning') {
                filtered = filtered.filter(t => {
                    const d = parseDeadline(t).date;
                    return (d === today || d === tomorrow) && t.status !== 'done' && t.status !== 'review';
                });
                title = t('dashTodayTomorrow');
            } else if (type === 'active') {
                filtered = filtered.filter(t => t.status === 'progress');
                title = t('dashInProgress');
            } else if (type === 'completed') {
                filtered = filtered.filter(t => t.status === 'done');
                title = t('dashDone');
            }

            // Підсвічуємо активну картку
            document.querySelectorAll('.dashboard-card').forEach(el => {
                el.style.outline = '';
                el.style.outlineOffset = '';
            });
            const cardMap = {urgent:'.dashboard-card.urgent',warning:'.dashboard-card.warning',active:'.dashboard-card.active',completed:'.dashboard-card.completed'};
            const activeCard = document.querySelector(cardMap[type]);
            if (activeCard) { activeCard.style.outline = '3px solid rgba(255,255,255,0.7)'; activeCard.style.outlineOffset = '-3px'; }

            if (filtered.length === 0) {
                content.innerHTML = `<div style="padding:2rem;text-align:center;color:#9ca3af;">${title} — завдань немає</div>`;
                return;
            }

            const rows = filtered.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const name = assignee ? (assignee.name || assignee.email).split(' ')[0] : '—';
                const d = parseDeadline(task).date || '';
                const isOverdue = d && d < today && task.status !== 'done';
                const dateColor = isOverdue ? '#ef4444' : '#6b7280';
                return `<tr style="cursor:pointer;" onclick="openTaskModal('${task.id}')">
                    <td style="padding:0.6rem 0.75rem;font-weight:500;color:#1a1a1a;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(task.title||'')}</td>
                    <td style="padding:0.6rem 0.75rem;color:#6b7280;font-size:0.85rem;white-space:nowrap;">${esc(name)}</td>
                    <td style="padding:0.6rem 0.75rem;color:${dateColor};font-size:0.85rem;white-space:nowrap;">${d || '—'}</td>
                    <td style="padding:0.6rem 0.75rem;font-size:0.82rem;">${task.function ? `<span style="background:#f3f4f6;border-radius:4px;padding:1px 6px;">${esc(task.function)}</span>` : ''}</td>
                </tr>`;
            }).join('');

            content.innerHTML = `
                <div style="background:white;border-radius:8px;overflow:hidden;border:1px solid #f3f4f6;">
                    <div style="padding:0.75rem 1rem;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;">
                        <span style="font-weight:600;font-size:0.95rem;">${title}</span>
                        <span style="font-size:0.82rem;color:#9ca3af;">${filtered.length} завдань</span>
                    </div>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#fafafa;font-size:0.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:0.04em;">
                                <th style="padding:0.5rem 0.75rem;text-align:left;font-weight:600;">Завдання</th>
                                <th style="padding:0.5rem 0.75rem;text-align:left;font-weight:600;">Виконавець</th>
                                <th style="padding:0.5rem 0.75rem;text-align:left;font-weight:600;">Дедлайн</th>
                                <th style="padding:0.5rem 0.75rem;text-align:left;font-weight:600;">Функція</th>
                            </tr>
                        </thead>
                        <tbody style="divide-y:#f9fafb;">
                            ${rows}
                        </tbody>
                    </table>
                </div>`;

            // Скролимо до списку
            content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        function renderControlContent() {
            const viewType = document.getElementById('controlViewType')?.value || 'briefing';
            const af = document.getElementById('controlAssigneeFilter')?.value;
            const ff = document.getElementById('controlFunctionFilter')?.value;
            
            let filteredTasks = tasks.filter(task => {
                if (!isTaskVisibleToUser(task)) return false;
                if (af && task.assigneeId !== af) return false;
                if (ff && task.function !== ff) return false;
                return task.status !== 'done';
            });
            
            const content = document.getElementById('controlContent');
            
            if (viewType === 'briefing') {
                // MORNING BRIEFING — one-page "what's burning"
                const todayStr = getLocalDateStr(new Date());
                // allTasks = all tasks with filters (including done for people stats)
                const allTasksWithDone = tasks.filter(task => {
                    if (!isTaskVisibleToUser(task)) return false;
                    if (af && task.assigneeId !== af) return false;
                    if (ff && task.function !== ff) return false;
                    return true;
                });
                const allTasks = allTasksWithDone.filter(t => t.status !== 'done');
                
                // 1. CRITICAL: overdue tasks (exclude review - they're awaiting approval, not stuck)
                const overdue = allTasks.filter(t => t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done' && t.status !== 'review');
                const critical = overdue.filter(t => {
                    const d = Math.floor((new Date() - new Date(t.deadlineDate + 'T23:59:59')) / 86400000);
                    return d >= 7;
                });
                const warning = overdue.filter(t => {
                    const d = Math.floor((new Date() - new Date(t.deadlineDate + 'T23:59:59')) / 86400000);
                    return d >= 3 && d < 7;
                });
                const fresh = overdue.filter(t => {
                    const d = Math.floor((new Date() - new Date(t.deadlineDate + 'T23:59:59')) / 86400000);
                    return d < 3;
                });
                
                // Set of overdue task IDs to avoid duplication in stuck
                const overdueIds = new Set(overdue.map(t => t.id));
                
                // 2. STUCK: tasks in 'new' status for >3 days (exclude already overdue - shown above)
                const stuck = allTasks.filter(t => {
                    if (t.status !== 'new') return false;
                    if (overdueIds.has(t.id)) return false; // already shown in overdue section
                    const created = t.createdAt?.toDate ? t.createdAt.toDate() : (t.createdAt ? new Date(t.createdAt) : null);
                    return created && (new Date() - created) / 86400000 > 3;
                });
                
                // 3. TODAY: tasks due today
                const todayTasks = allTasks.filter(t => t.deadlineDate === todayStr && t.status !== 'done' && t.status !== 'review');
                
                // 4. ON REVIEW: waiting for approval
                const onReview = allTasks.filter(t => t.status === 'review');
                
                // 5. PEOPLE STATUS
                const peopleStats = users.map(u => {
                    const ut = allTasksWithDone.filter(t => t.assigneeId === u.id);
                    const uOverdue = ut.filter(t => t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done' && t.status !== 'review').length;
                    const uActive = ut.filter(t => t.status !== 'done').length;
                    const uDone = ut.filter(t => t.status === 'done').length;
                    const uToday = ut.filter(t => t.deadlineDate === todayStr && t.status !== 'done').length;
                    return { ...u, overdue: uOverdue, active: uActive, done: uDone, today: uToday };
                }).filter(u => u.active > 0 || u.overdue > 0).sort((a,b) => b.overdue - a.overdue);
                
                // 6. REGULAR TASKS completion rate (today)
                // BUG-AC FIX: use isRegularTaskDay — was missing quarterly, skipWeekends, disabled tasks
                const _todayDate = new Date();
                const todaysRegular = regularTasks.filter(rt => {
                    if (rt.disabled || rt.paused || rt.status === 'paused' || rt.status === 'disabled') return false;
                    return typeof isRegularTaskDay === 'function' ? isRegularTaskDay(rt, _todayDate) : (() => {
                        const dow = _todayDate.getDay().toString();
                        if (rt.period === 'daily') return true;
                        if (rt.period === 'weekly' && rt.daysOfWeek?.includes(dow)) return true;
                        if (rt.period === 'monthly' && parseInt(rt.dayOfMonth) === _todayDate.getDate()) return true;
                        return false;
                    })();
                });
                const regDone = todaysRegular.filter(rt => {
                    return tasks.some(t => t.regularTaskId === rt.id && t.deadlineDate === todayStr && t.status === 'done');
                }).length;
                
                // Overall health score
                const healthScore = overdue.length === 0 && stuck.length === 0 ? 'green' : 
                    critical.length > 0 ? 'red' : 'yellow';
                const healthIcon = healthScore === 'green' ? 'check-circle' : healthScore === 'red' ? 'alert-octagon' : 'alert-triangle';
                const healthColor = healthScore === 'green' ? '#16a34a' : healthScore === 'red' ? '#ef4444' : '#f59e0b';
                const healthText = healthScore === 'green' ? (t('allGood')) : 
                    healthScore === 'red' ? (t('attentionRequired')) : (t('warningIssues'));

                content.innerHTML = `
                    <div style="margin-bottom:1rem;">
                        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.75rem;background:${healthColor}15;border-radius:10px;border-left:4px solid ${healthColor};">
                            <i data-lucide="${healthIcon}" class="icon" style="color:${healthColor};width:28px;height:28px;flex-shrink:0;"></i>
                            <div>
                                <div style="font-weight:700;font-size:1rem;color:${healthColor};">${healthText}</div>
                                <div style="font-size:0.78rem;color:#6b7280;">${overdue.length} ${t('overdueStatus')} · ${todayTasks.length} ${t('forToday')} · ${onReview.length} ${t('statusOnReview')}</div>
                            </div>
                        </div>
                    </div>
                    
                    ${critical.length > 0 ? `
                    <div style="background:#fef2f2;border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;">
                        <div style="font-weight:700;color:#dc2626;margin-bottom:0.4rem;"><i data-lucide="alert-octagon" class="icon icon-sm"></i> ${t('criticalOverdue')} (7+ ${t('daysAgo')})</div>
                        ${critical.slice(0,5).map(tk => `<div style="display:flex;justify-content:space-between;padding:0.3rem 0;font-size:0.82rem;border-bottom:1px solid #fecaca;cursor:pointer;" onclick="openTaskModal('${escId(tk.id)}')">
                            <span style="font-weight:500;">${esc(tk.title)}</span>
                            <span style="color:#9ca3af;white-space:nowrap;margin-left:0.5rem;">${esc(tk.assigneeName || '')} · ${tk.deadlineDate}</span>
                        </div>`).join('')}
                        ${critical.length > 5 ? `<div style="font-size:0.75rem;color:#9ca3af;padding-top:0.3rem;">+${critical.length-5}...</div>` : ''}
                    </div>` : ''}
                    
                    ${warning.length > 0 ? `
                    <div style="background:#fffbeb;border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;">
                        <div style="font-weight:700;color:#b45309;margin-bottom:0.4rem;"><i data-lucide="alert-triangle" class="icon icon-sm"></i> ${t('overdueStatus')} (3-7 ${t('daysAgo')})</div>
                        ${warning.slice(0,5).map(tk => `<div style="display:flex;justify-content:space-between;padding:0.3rem 0;font-size:0.82rem;border-bottom:1px solid #fde68a;cursor:pointer;" onclick="openTaskModal('${escId(tk.id)}')">
                            <span style="font-weight:500;">${esc(tk.title)}</span>
                            <span style="color:#9ca3af;white-space:nowrap;margin-left:0.5rem;">${esc(tk.assigneeName || '')} · ${tk.deadlineDate}</span>
                        </div>`).join('')}
                    </div>` : ''}
                    
                    ${stuck.length > 0 ? `
                    <div style="background:#eef2ff;border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;">
                        <div style="font-weight:700;color:#4338ca;margin-bottom:0.4rem;"><i data-lucide="pause-circle" class="icon icon-sm"></i> ${t('notStarted')} (3+ ${t('daysAgo')})</div>
                        ${stuck.slice(0,5).map(tk => `<div style="display:flex;justify-content:space-between;padding:0.3rem 0;font-size:0.82rem;border-bottom:1px solid #c7d2fe;cursor:pointer;" onclick="openTaskModal('${escId(tk.id)}')">
                            <span style="font-weight:500;">${esc(tk.title)}</span>
                            <span style="color:#9ca3af;white-space:nowrap;margin-left:0.5rem;">${esc(tk.assigneeName || '')}</span>
                        </div>`).join('')}
                    </div>` : ''}
                    
                    ${onReview.length > 0 ? `
                    <div style="background:#f5f3ff;border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;">
                        <div style="font-weight:700;color:#7c3aed;margin-bottom:0.4rem;"><i data-lucide="eye" class="icon icon-sm"></i> ${t('statusOnReview')} (${onReview.length})</div>
                        ${onReview.slice(0,5).map(tk => `<div style="display:flex;justify-content:space-between;padding:0.3rem 0;font-size:0.82rem;border-bottom:1px solid #ddd6fe;cursor:pointer;" onclick="openTaskModal('${escId(tk.id)}')">
                            <span style="font-weight:500;">${esc(tk.title)}</span>
                            <span style="color:#9ca3af;white-space:nowrap;margin-left:0.5rem;">${esc(tk.assigneeName || '')}</span>
                        </div>`).join('')}
                    </div>` : ''}
                    
                    <div style="background:#f9fafb;border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;">
                        <div style="font-weight:700;color:#374151;margin-bottom:0.5rem;"><i data-lucide="users" class="icon icon-sm"></i> ${t('teamStatus')}</div>
                        ${peopleStats.map(p => `
                        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;font-size:0.82rem;border-bottom:1px solid #e5e7eb;">
                            <span style="width:6px;height:6px;border-radius:50%;background:${p.overdue > 0 ? '#ef4444' : '#16a34a'};flex-shrink:0;"></span>
                            <span style="flex:1;font-weight:500;">${esc(p.name || p.email)}</span>
                            <span style="color:#6b7280;">${p.today} ${t('forToday')}</span>
                            ${p.overdue > 0 ? `<span style="color:#ef4444;font-weight:600;">${p.overdue} !</span>` : ''}
                        </div>`).join('')}
                    </div>
                    
                    ${todaysRegular.length > 0 ? `
                    <div style="background:#f0fdf4;border-radius:10px;padding:0.75rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                            <span style="font-weight:700;color:#374151;"><i data-lucide="repeat" class="icon icon-sm"></i> ${t('tabRegular')} ${t('forToday')}</span>
                            <span style="font-size:0.85rem;font-weight:600;color:${regDone === todaysRegular.length ? '#16a34a' : '#f59e0b'};">${regDone}/${todaysRegular.length}</span>
                        </div>
                        <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
                            <div style="height:100%;width:${todaysRegular.length > 0 ? Math.round(regDone/todaysRegular.length*100) : 0}%;background:#16a34a;border-radius:3px;transition:width 0.3s;"></div>
                        </div>
                    </div>` : ''}
                `;
            } else if (viewType === 'workload' || viewType === 'people') {
                // ── ПО ЛЮДЯХ: навантаження + статуси + якість делегування ──
                const todayStr = getLocalDateStr(new Date());
                const allVisible = tasks.filter(task => {
                    if (!isTaskVisibleToUser(task)) return false;
                    if (af && task.assigneeId !== af) return false;
                    if (ff && task.function !== ff) return false;
                    return true;
                });
                const statuses = [
                    { key: 'new',      label: t('statusNew'),       color: '#3b82f6', bg: '#eff6ff' },
                    { key: 'progress', label: t('inProgressStatus'),color: '#f59e0b', bg: '#fefce8' },
                    { key: 'review',   label: t('statusOnReview'),  color: '#8b5cf6', bg: '#f5f3ff' },
                    { key: 'done',     label: t('statusDone'),      color: '#16a34a', bg: '#f0fdf4' },
                ];
                const byPerson = {};
                // BUG-AG FIX: include coExecutor tasks in workload — was assigneeId only
                allVisible.forEach(task => {
                    const participants = [task.assigneeId || 'unassigned'];
                    if (task.coExecutorIds?.length) task.coExecutorIds.forEach(cid => { if (!participants.includes(cid)) participants.push(cid); });
                    participants.forEach(uid => {
                        const user = users.find(u => u.id === uid);
                        const name = user ? (user.name || user.email) : (task.assigneeName || t('notAssigned'));
                        if (!byPerson[uid]) byPerson[uid] = { name, new:[], progress:[], review:[], done:[] };
                        if (byPerson[uid][task.status]) byPerson[uid][task.status].push(task);
                    });
                });

                // Загальні лічильники
                const totalActive = allVisible.filter(t => t.status !== 'done').length;
                const totalOverdue = allVisible.filter(t => t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done' && t.status !== 'review').length;
                const totalReturned = allVisible.filter(t => t.reviewRejectedAt).length;

                content.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.4rem;">
                        <h3 style="margin:0;">По людях</h3>
                        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                            <span style="background:#eff6ff;color:#3b82f6;padding:3px 10px;border-radius:10px;font-size:0.74rem;font-weight:600;">${totalActive} активних</span>
                            ${totalOverdue > 0 ? `<span style="background:#fef2f2;color:#ef4444;padding:3px 10px;border-radius:10px;font-size:0.74rem;font-weight:600;">⚠ ${totalOverdue} прострочено</span>` : ''}
                            ${totalReturned > 0 ? `<span style="background:#fffbeb;color:#b45309;padding:3px 10px;border-radius:10px;font-size:0.74rem;font-weight:600;">↩ ${totalReturned} повернуто</span>` : ''}
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:1rem;text-align:center;">
                        ${statuses.map(s => {
                            const cnt = allVisible.filter(tk => tk.status === s.key).length;
                            return `<div style="background:${s.bg};padding:0.5rem;border-radius:8px;">
                                <div style="font-size:1.2rem;font-weight:700;color:${s.color};">${cnt}</div>
                                <div style="font-size:0.68rem;color:#6b7280;">${s.label}</div>
                            </div>`;
                        }).join('')}
                    </div>
                    ${Object.entries(byPerson)
                        .sort((a,b) => {
                            const aAct = a[1].new.length + a[1].progress.length + a[1].review.length;
                            const bAct = b[1].new.length + b[1].progress.length + b[1].review.length;
                            return bAct - aAct;
                        })
                        .map(([uid, data]) => {
                            const active = data.new.length + data.progress.length + data.review.length;
                            const doneCount  = data.done.length;
                            const doneClean  = data.done.filter(tk => !tk.reviewRejectedAt).length;
                            const autonomy   = doneCount > 0 ? Math.round(doneClean / doneCount * 100) : null;
                            const autoColor  = autonomy === null ? '#9ca3af' : autonomy >= 80 ? '#16a34a' : autonomy >= 50 ? '#f59e0b' : '#ef4444';
                            const overdue    = [...data.new, ...data.progress].filter(tk => tk.deadlineDate && tk.deadlineDate < todayStr).length;
                            const returned   = [...data.progress, ...data.done].filter(tk => tk.reviewRejectedAt).length;
                            const allTasks   = [...data.new, ...data.progress, ...data.review, ...data.done];

                            return `
                            <div class="control-row" onclick="this.classList.toggle('expanded')" style="margin-bottom:0.5rem;">
                                <div class="control-row-header" style="flex-wrap:wrap;gap:0.35rem;">
                                    <span style="font-weight:600;"><i data-lucide="user" class="icon icon-sm"></i> ${esc(data.name)}</span>
                                    <div style="display:flex;gap:0.35rem;align-items:center;flex-wrap:wrap;margin-left:auto;">
                                        <span style="font-size:0.72rem;color:#6b7280;">${active} активних</span>
                                        ${overdue > 0 ? `<span style="background:#fef2f2;color:#ef4444;padding:1px 7px;border-radius:8px;font-size:0.7rem;font-weight:600;">⚠ ${overdue}</span>` : ''}
                                        ${returned > 0 ? `<span style="background:#fffbeb;color:#b45309;padding:1px 7px;border-radius:8px;font-size:0.7rem;">↩ ${returned}</span>` : ''}
                                        ${autonomy !== null ? `<span style="font-weight:700;color:${autoColor};font-size:0.78rem;" title="% виконаних без повернення">${autonomy}% авт.</span>` : ''}
                                        <i data-lucide="chevron-down" class="icon icon-sm expand-icon"></i>
                                    </div>
                                </div>
                                <!-- Мінібар статусів -->
                                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:0.25rem 0.5rem;border-top:1px solid #f1f5f9;">
                                    ${statuses.map(s => `<div style="text-align:center;font-size:0.82rem;font-weight:600;color:${s.color};" title="${s.label}">${data[s.key].length}</div>`).join('')}
                                    ${statuses.map(s => `<div style="text-align:center;font-size:0.6rem;color:#9ca3af;">${s.label}</div>`).join('')}
                                </div>
                                <div class="control-row-tasks">
                                    ${statuses.filter(s => data[s.key].length > 0).map(s => `
                                        <div style="margin-bottom:0.5rem;">
                                            <div style="font-size:0.72rem;font-weight:700;color:${s.color};padding:0.25rem 0;border-bottom:2px solid ${s.color};margin-bottom:0.25rem;">${s.label} (${data[s.key].length})</div>
                                            ${data[s.key].slice(0,10).map(tk => {
                                                const isOv = tk.deadlineDate && tk.deadlineDate < todayStr && s.key !== 'done';
                                                return `<div class="control-task-item ${isOv ? 'overdue' : ''}" onclick="event.stopPropagation();openTaskModal('${escId(tk.id)}')" style="display:flex;align-items:center;gap:0.3rem;">
                                                    ${tk.reviewRejectedAt ? '<span style="color:#f59e0b;font-size:0.7rem;">↩</span>' : ''}
                                                    <span class="task-title" style="flex:1;">${esc(tk.title)}</span>
                                                    ${tk.function ? `<span style="font-size:0.65rem;color:#9ca3af;background:#f3f4f6;padding:1px 5px;border-radius:3px;">${esc(tk.function)}</span>` : ''}
                                                    <span style="font-size:0.68rem;color:${isOv?'#ef4444':'#9ca3af'};">${tk.deadlineDate || ''}</span>
                                                </div>`;
                                            }).join('')}
                                            ${data[s.key].length > 10 ? `<div style="font-size:0.7rem;color:#9ca3af;padding:0.2rem;">+${data[s.key].length - 10} ще...</div>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>`;
                    }).join('') || `<p style="color:#7f8c8d;">${t('noActiveTasks')}</p>`}
                `;
            } else if (viewType === 'functions') {
                const byFunc = {};
                filteredTasks.forEach(task => { 
                    const fn = task.function || t('noFunction');
                    if (!byFunc[fn]) byFunc[fn] = [];
                    byFunc[fn].push(task);
                });
                
                content.innerHTML = `
                    <h3 style="margin-bottom:1rem;">${t('byFunctions')}</h3>
                    ${Object.entries(byFunc).sort((a,b) => b[1].length - a[1].length).map(([fn, taskList]) => {
                        const c = taskList.length;
                        const tasksHTML = taskList.map(t => {
                            const deadline = t.deadlineDate || '';
                            const isOverdue = deadline && deadline < getLocalDateStr();
                            return `
                                <div class="control-task-item ${isOverdue ? 'overdue' : ''}" onclick="event.stopPropagation(); openTaskModal('${escId(t.id)}')">
                                    <span class="task-title">${esc(t.title)} ${getEscalationBadgeHtml(t)}</span>
                                    <span class="task-meta">
                                        ${t.assigneeName ? `<span class="task-assignee">${esc(t.assigneeName)}</span>` : ''}
                                        ${deadline ? `<span class="task-date ${isOverdue ? 'overdue' : ''}">${deadline}</span>` : ''}
                                    </span>
                                </div>
                            `;
                        }).join('');
                        
                        return `
                            <div class="control-row" onclick="this.classList.toggle('expanded')">
                                <div class="control-row-header">
                                    <span><i data-lucide="settings" class="icon icon-sm"></i> ${esc(fn)}</span>
                                    <span class="control-row-count" style="color:#3498db;">${c} ${t('tasks')} <i data-lucide="chevron-down" class="icon icon-sm expand-icon"></i></span>
                                </div>
                                <div class="control-row-tasks">${tasksHTML}</div>
                            </div>
                        `;
                    }).join('') || `<p style="color:#7f8c8d;">${t('noActiveTasks')}</p>`}
                `;
            } else if (viewType === 'pipeline') {
                // Delegation Pipeline
                const todayStr = getLocalDateStr(new Date());
                const allVisible = tasks.filter(task => {
                    if (!isTaskVisibleToUser(task)) return false;
                    if (af && task.assigneeId !== af) return false;
                    if (ff && task.function !== ff) return false;
                    return true;
                });

                const statuses = [
                    { key: 'new', label: t('statusNew'), color: '#3b82f6', bg: '#eff6ff' },
                    { key: 'progress', label: t('inProgressStatus'), color: '#f59e0b', bg: '#fefce8' },
                    { key: 'review', label: t('statusOnReview'), color: '#8b5cf6', bg: '#f5f3ff' },
                    { key: 'done', label: t('statusDone'), color: '#16a34a', bg: '#f0fdf4' }
                ];

                const byPerson = {};
                allVisible.forEach(task => {
                    const uid = task.assigneeId || 'unassigned';
                    const name = task.assigneeName || t('notAssigned');
                    if (!byPerson[uid]) byPerson[uid] = { name, new: [], progress: [], review: [], done: [] };
                    if (byPerson[uid][task.status]) byPerson[uid][task.status].push(task);
                });

                content.innerHTML = `
                    <h3 style="margin-bottom:1rem;">${t('delegationPipeline')}</h3>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:1.5rem;text-align:center;">
                        ${statuses.map(s => {
                            const cnt = allVisible.filter(t => t.status === s.key).length;
                            return `<div style="background:${s.bg};padding:0.6rem;border-radius:8px;">
                                <div style="font-size:1.4rem;font-weight:700;color:${s.color};">${cnt}</div>
                                <div style="font-size:0.72rem;color:#6b7280;">${s.label}</div>
                            </div>`;
                        }).join('')}
                    </div>
                    ${Object.entries(byPerson).sort((a,b) => {
                        const aAct = a[1].new.length + a[1].progress.length + a[1].review.length;
                        const bAct = b[1].new.length + b[1].progress.length + b[1].review.length;
                        return bAct - aAct;
                    }).map(([uid, data]) => {
                        const doneCount = data.done.length;
                        const doneClean = data.done.filter(t => !t.reviewRejectedAt).length;
                        const autonomy = doneCount > 0 ? Math.round(doneClean / doneCount * 100) : 0;
                        const autoColor = autonomy >= 80 ? '#16a34a' : autonomy >= 50 ? '#f59e0b' : '#ef4444';
                        const overdue = [...data.new, ...data.progress].filter(t => t.deadlineDate && t.deadlineDate < todayStr).length;
                        const returned = [...data.progress, ...data.done].filter(t => t.reviewRejectedAt).length;

                        return `
                        <div class="control-row" onclick="this.classList.toggle('expanded')" style="margin-bottom:0.5rem;">
                            <div class="control-row-header" style="flex-wrap:wrap;gap:0.4rem;">
                                <span><i data-lucide="user" class="icon icon-sm"></i> ${esc(data.name)}</span>
                                <div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;">
                                    ${overdue > 0 ? `<span style="background:#fef2f2;color:#ef4444;padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:600;display:inline-flex;align-items:center;gap:2px;"><i data-lucide="alert-triangle" class="icon icon-sm"></i> ${overdue}</span>` : ''}
                                    ${returned > 0 ? `<span style="background:#fffbeb;color:#b45309;padding:2px 8px;border-radius:10px;font-size:0.72rem;display:inline-flex;align-items:center;gap:2px;"><i data-lucide="rotate-ccw" class="icon icon-sm"></i> ${returned}</span>` : ''}
                                    <span style="font-weight:600;color:${autoColor};font-size:0.78rem;">${autonomy}%</span>
                                    <i data-lucide="chevron-down" class="icon icon-sm expand-icon"></i>
                                </div>
                            </div>
                            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:0.3rem 0.5rem;">
                                ${statuses.map(s => `<div style="text-align:center;font-size:0.85rem;font-weight:600;color:${s.color};">${data[s.key].length}</div>`).join('')}
                            </div>
                            <div class="control-row-tasks">
                                ${statuses.filter(s => data[s.key].length > 0).map(s => `
                                    <div style="margin-bottom:0.5rem;">
                                        <div style="font-size:0.75rem;font-weight:600;color:${s.color};padding:0.3rem 0;border-bottom:2px solid ${s.color};">${s.label} (${data[s.key].length})</div>
                                        ${data[s.key].slice(0, 10).map(t => {
                                            const isOverdue = t.deadlineDate && t.deadlineDate < todayStr && s.key !== 'done';
                                            return `<div class="control-task-item ${isOverdue ? 'overdue' : ''}" onclick="event.stopPropagation();openTaskModal('${escId(t.id)}')" style="display:flex;align-items:center;gap:0.3rem;">
                                                ${t.reviewRejectedAt ? '<i data-lucide="rotate-ccw" class="icon icon-sm" style="color:#f59e0b;width:12px;height:12px;"></i>' : ''}
                                                <span class="task-title" style="flex:1;">${esc(t.title)}</span>
                                                <span style="font-size:0.7rem;color:#9ca3af;">${t.deadlineDate || ''}</span>
                                            </div>`;
                                        }).join('')}
                                        ${data[s.key].length > 10 ? `<div style="font-size:0.72rem;color:#9ca3af;padding:0.2rem;">+${data[s.key].length - 10} ${t('more')}...</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>`;
                    }).join('')}
                `;
            } else if (viewType === 'journal') {
                // ── ЖУРНАЛ ЗБОЇВ: ручні записи власника + авто-сигнали як контекст ──
                const todayStr = getLocalDateStr(new Date());
                const allVisible = tasks.filter(task => isTaskVisibleToUser(task));

                // Ручні записи власника
                const manualIncidents = (window._manualIncidents || []);
                const active = manualIncidents.filter(mi => !mi.resolved);
                const resolved = manualIncidents.filter(mi => mi.resolved);

                const catConfig = {
                    people:  { icon: 'users',         color: '#dc2626', bg: '#fef2f2', label: 'Люди' },
                    process: { icon: 'git-branch',    color: '#ea580c', bg: '#fff7ed', label: 'Процес' },
                    finance: { icon: 'dollar-sign',   color: '#b45309', bg: '#fffbeb', label: '💰 Фінанси' },
                    clients: { icon: 'user-x',        color: '#9333ea', bg: '#faf5ff', label: '😤 Клієнти' },
                    quality: { icon: 'alert-octagon', color: '#dc2626', bg: '#fef2f2', label: '🎯 Якість' },
                    other:   { icon: 'flag',          color: '#6b7280', bg: '#f9fafb', label: '📌 Інше' },
                };

                // Авто-сигнали (для контексту внизу, коротко)
                const autoSignals = [];
                allVisible.filter(tk => tk.deadlineDate && tk.deadlineDate < todayStr && tk.status !== 'done' && tk.status !== 'review').forEach(tk => {
                    const d = Math.floor((new Date() - new Date(tk.deadlineDate)) / 86400000);
                    if (d >= 3) autoSignals.push({ icon: '🔴', text: `Прострочено ${d}д: ${tk.title}`, person: tk.assigneeName || '', taskId: tk.id });
                });
                allVisible.filter(tk => tk.reviewRejectedAt).forEach(tk => {
                    autoSignals.push({ icon: '↩', text: `Повернуто: ${tk.title}`, person: tk.assigneeName || '', taskId: tk.id });
                });

                content.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.4rem;">
                        <div>
                            <h3 style="margin:0;">Журнал збоїв</h3>
                            <div style="font-size:0.72rem;color:#9ca3af;margin-top:2px;">Тут фіксується те, що пішло не так — факт, причина, відповідальний, рішення</div>
                        </div>
                        <button class="btn btn-success btn-small" onclick="if(typeof showIncidentModal==='function')showIncidentModal();else toggleAddIncidentForm();" style="display:flex;align-items:center;gap:0.3rem;">
                            + Записати збій
                        </button>
                    </div>

                    <div id="addIncidentFormArea" style="display:none;margin-bottom:1rem;"></div>

                    <!-- Активні записи -->
                    <!-- Онбординг: як працює AI агент -->
                    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;display:flex;align-items:flex-start;gap:0.75rem;">
                        <div style="flex-shrink:0;color:#0369a1;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg></div>
                        <div>
                            <div style="font-size:0.8rem;font-weight:700;color:#0369a1;margin-bottom:0.2rem;">Як записати збій через AI</div>
                            <div style="font-size:0.75rem;color:#0c4a6e;line-height:1.5;">
                                Натисни <b>+ Записати збій</b> → вибери <b>AI режим</b> → опиши своїми словами що сталося → AI задасть 1-3 уточнюючих питання → сформує структурований запис → ти переглянеш і збережеш.<br>
                                <span style="color:#0284c7;">Або одразу <b>Ручний режим</b> — заповнити форму самостійно.</span>
                            </div>
                        </div>
                        <button onclick="this.parentElement.style.display='none'" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1rem;flex-shrink:0;padding:0;">✕</button>
                    </div>

                    ${active.length === 0 ? `
                    <div style="text-align:center;padding:1.5rem;background:#f0fdf4;border-radius:10px;border:1px dashed #bbf7d0;margin-bottom:0.75rem;">
                        <div style="display:flex;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                        <div style="font-size:0.82rem;color:#16a34a;font-weight:600;margin-top:0.25rem;">Немає відкритих збоїв</div>
                        <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.25rem;">Якщо щось пішло не так — зафіксуй тут</div>
                    </div>` : `
                    <div style="margin-bottom:0.75rem;">
                        ${active.sort((a,b) => (b.severity||1)-(a.severity||1)).map(mi => {
                            const cat = catConfig[mi.category] || catConfig.other;
                            const sev = mi.severity || 1;
                            const sevLabel = sev === 3 ? '🔴 Критично' : sev === 2 ? '🟡 Важливо' : '🟢 Норма';
                            return `
                            <div style="background:${cat.bg};border-radius:10px;border-left:4px solid ${cat.color};padding:0.75rem;margin-bottom:0.4rem;">
                                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
                                    <div style="flex:1;">
                                        <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.25rem;">
                                            <span style="font-size:0.68rem;background:${cat.color};color:white;padding:1px 6px;border-radius:4px;font-weight:600;">${cat.label}</span>
                                            <span style="font-size:0.68rem;color:#6b7280;">${sevLabel}</span>
                                            <span style="font-size:0.68rem;color:#9ca3af;margin-left:auto;">${mi.date || ''}</span>
                                        </div>
                                        <div style="font-weight:700;font-size:0.88rem;color:#111827;">${esc(mi.title)}</div>
                                        ${mi.description ? `<div style="font-size:0.78rem;color:#374151;margin-top:0.25rem;">${esc(mi.description)}</div>` : ''}
                                        ${mi.responsible ? `<div style="font-size:0.72rem;color:#6b7280;margin-top:0.2rem;">👤 ${esc(mi.responsible)}</div>` : ''}
                                    </div>
                                    <button onclick="resolveIncident('${escId(mi.id)}')"
                                        style="background:#16a34a;color:white;border:none;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;font-weight:600;white-space:nowrap;flex-shrink:0;">
                                        ✓ Вирішено
                                    </button>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>`}

                    <!-- Авто-сигнали (контекст) -->
                    ${autoSignals.length > 0 ? `
                    <div style="background:#f8fafc;border-radius:8px;padding:0.75rem;margin-bottom:0.75rem;">
                        <div style="font-size:0.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;">
                            ⚡ Авто-сигнали з задач (${autoSignals.length})
                            <span style="font-weight:400;font-style:italic;"> — для контексту, детально дивись у Брифінгу</span>
                        </div>
                        ${autoSignals.slice(0,5).map(s => `
                        <div style="display:flex;align-items:center;gap:0.4rem;padding:0.25rem 0;border-bottom:1px solid #e8eaed;cursor:pointer;"
                            onclick="openTaskModal('${escId(s.taskId)}')">
                            <span style="font-size:0.78rem;">${s.icon}</span>
                            <span style="font-size:0.76rem;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(s.text)}</span>
                            ${s.person ? `<span style="font-size:0.68rem;color:#9ca3af;flex-shrink:0;">${esc(s.person)}</span>` : ''}
                        </div>`).join('')}
                        ${autoSignals.length > 5 ? `<div style="font-size:0.7rem;color:#9ca3af;padding:0.25rem 0;">+${autoSignals.length - 5} ще — відкрий Брифінг</div>` : ''}
                    </div>` : ''}

                    <!-- Архів вирішених -->
                    ${resolved.length > 0 ? `
                    <details style="margin-top:0.25rem;">
                        <summary style="font-size:0.76rem;color:#9ca3af;cursor:pointer;padding:0.3rem 0;">
                            📁 Вирішені збої (${resolved.length})
                        </summary>
                        <div style="margin-top:0.4rem;">
                        ${resolved.slice(-10).reverse().map(mi => {
                            const cat = catConfig[mi.category] || catConfig.other;
                            return `<div style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0.5rem;background:#f8fafc;border-radius:6px;margin-bottom:0.25rem;opacity:0.7;">
                                <span style="font-size:0.68rem;background:#e5e7eb;color:#6b7280;padding:1px 5px;border-radius:3px;">${cat.label}</span>
                                <span style="font-size:0.78rem;color:#374151;flex:1;">${esc(mi.title)}</span>
                                <span style="font-size:0.68rem;color:#9ca3af;">${mi.date||''}</span>
                            </div>`;
                        }).join('')}
                        </div>
                    </details>` : ''}
                `;

                
            } else if (viewType === 'ownerreport') {
                // ЗВІТ ВЛАСНИКА — тижневий/місячний зріз
                if (typeof renderOwnerDashboard === 'function') {
                    // Рендеримо в controlContent
                    const origEl = document.getElementById('ownerDashboardContent');
                    content.innerHTML = '';
                    renderOwnerReportInto(content);
                } else {
                    content.innerHTML = '<div style="padding:2rem;text-align:center;color:#9ca3af;">Завантаження...</div>';
                }
            }
            
            refreshIcons();
        }
        
        function clearControlFilters() {
            document.getElementById('controlAssigneeFilter').value = '';
            document.getElementById('controlFunctionFilter').value = '';
            document.getElementById('controlPeriodFilter').value = '';
            renderControl();
        }
        
        function clearRegularFilters() {
            document.getElementById('regularAssigneeFilter').value = '';
            document.getElementById('regularFunctionFilter').value = '';
            document.getElementById('regularDayFilter').value = '';
            applyRegularFilters();
        }

// ── Кнопки режимів Контролю ────────────────────────────────
window.setControlView = function(viewType) {
    // Оновлюємо прихований select
    const sel = document.getElementById('controlViewType');
    if (sel) sel.value = viewType;
    // Оновлюємо активну кнопку
    document.querySelectorAll('.ctrl-view-btn').forEach(btn => {
        const isActive = btn.dataset.view === viewType;
        btn.style.background = isActive ? '#22c55e' : 'white';
        btn.style.color      = isActive ? 'white'   : '#374151';
        btn.style.borderColor= isActive ? '#22c55e' : '#e8eaed';
    });
    // Рендеримо контент
    if (typeof renderControlContent === 'function') renderControlContent();
};

// ── Tooltip підказки ──────────────────────────────────────
const CTRL_TOOLTIPS = {
    briefing: {
        title: 'Брифінг — щоранковий огляд',
        text: 'Показує тільки те що горить: прострочені задачі (3 рівні критичності), застряглі без старту >3 днів, задачі на сьогодні. Відкривай першим — 2 хвилини і картина дня зрозуміла.',
        when: 'Щоранку перед початком роботи'
    },
    people: {
        title: 'По людях — навантаження + якість делегування',
        text: 'Показує скільки задач у кожного (нові / в роботі / перевірка / виконано) + % автономності (виконав без повернень). Червоний % — людина не вміє здавати роботу з першого разу або перевантажена.',
        when: 'На планьорці, коли є питання "хто чим зайнятий"'
    },
    functions: {
        title: 'По функціях — де бізнес буксує',
        text: 'Групує задачі по напрямках (маркетинг, продажі, виробництво). Якщо функція переповнена — це системна проблема, не людська. Відповідь на "чому не виконується план по відділу".',
        when: 'Щотижневий аналіз — де системний затор'
    },
    journal: {
        title: 'Журнал збоїв — хронологія факапів',
        text: 'Тут ти сам фіксуєш що пішло не так: факт, причина, хто відповідальний, що вирішено. Не дублює Брифінг — там поточне, тут — записи для аналізу і розбору на планьорці.',
        when: 'Після будь-якого значущого збою — зафіксуй одразу'
    },
    ownerreport: {
        title: 'Звіт власника — тижневий/місячний підсумок',
        text: 'Зведені KPI бізнесу: виконання планів, динаміка, відхилення. Не для щоденного використання — для стратегічного аналізу раз на тиждень чи місяць.',
        when: 'П\'ятниця/кінець місяця — стратегічний огляд'
    },
    registry: {
        title: 'Реєстр дій — хронологія активності команди',
        text: 'Всі дії кожного співробітника: виконані задачі, дзвінки в CRM, SMS, зміни стадій угод, коментарі. Бачиш хто що робив і скільки дзвінків зробив за день.',
        when: 'Коли хочеш зрозуміти що реально робила людина за день'
    },
};

window.showCtrlTooltip = function(btn, viewType) {
    const tip = document.getElementById('ctrlTooltip');
    const txt = document.getElementById('ctrlTooltipText');
    if (!tip || !txt) return;
    const data = CTRL_TOOLTIPS[viewType];
    if (!data) return;
    txt.innerHTML = `
        <div style="font-weight:700;margin-bottom:0.3rem;">${data.title}</div>
        <div style="color:#d1d5db;line-height:1.4;">${data.text}</div>
        <div style="margin-top:0.4rem;font-size:0.7rem;background:#374151;border-radius:4px;padding:2px 6px;display:inline-block;color:#9ca3af;">
            ${data.when}
        </div>
    `;
    tip.style.display = 'block';
};

window.hideCtrlTooltip = function() {
    const tip = document.getElementById('ctrlTooltip');
    if (tip) tip.style.display = 'none';
};
