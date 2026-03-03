// =====================
        // USERS & INVITES
        // =====================
        function openInviteModal() {
            document.getElementById('inviteModal').style.display = 'block';
            document.getElementById('inviteForm').reset();
            document.getElementById('inviteLink').style.display = 'none';
        }

        async function sendInvite(e) {
            e.preventDefault();
            if (currentUserData?.role === 'employee') { showToast(t('noPermissionTask'), 'error'); return; }
            const email = document.getElementById('inviteEmail').value.trim().toLowerCase();
            const role = document.getElementById('inviteRole').value;
            
            try {
                const inviteRef = await db.collection('invites').add({
                    email: email,
                    companyId: currentCompany,
                    role: role,
                    invitedBy: currentUser.uid,
                    accepted: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Унікальне посилання з ID інвайту
                const link = window.location.origin + window.location.pathname + '?invite=' + inviteRef.id;
                document.getElementById('inviteLinkText').value = link;
                document.getElementById('inviteLink').style.display = 'block';
                
                alert(t('inviteCreated'));
            } catch (e) {
                alert(t('error') + ': ' + e.message);
            }
        }

        function copyInviteLink() {
            const input = document.getElementById('inviteLinkText');
            input.select();
            document.execCommand('copy');
            alert(t('copied'));
        }

        async function deleteUser(id) {
            const u = users.find(x => x.id === id);
            if (u?.role === 'owner') { alert(t('cannotDeleteOwner')); return; }
            if (!confirm(t('deleteConfirm'))) return;
            
            const base = db.collection('companies').doc(currentCompany);
            await base.collection('users').doc(id).delete();
            
            // Cascade cleanup (batch for atomicity)
            try {
                const cascadeBatch = db.batch();
                let batchOps = 0;
                
                functions.forEach(f => {
                    if (f.assigneeIds?.includes(id) || f.headId === id) {
                        const upd = {};
                        if (f.assigneeIds?.includes(id)) { f.assigneeIds = f.assigneeIds.filter(uid => uid !== id); upd.assigneeIds = f.assigneeIds; }
                        if (f.headId === id) { f.headId = f.assigneeIds?.[0] || ''; upd.headId = f.headId; }
                        cascadeBatch.update(base.collection('functions').doc(f.id), upd);
                        batchOps++;
                    }
                });
                // FIX: Reassign tasks assigned to deleted user → fallback assignee
                const fallbackAssignee = users.find(u => u.role === 'owner' && u.id !== id) 
                    || users.find(u => u.role === 'manager' && u.id !== id);
                const fallbackId = fallbackAssignee?.id || '';
                const fallbackName = fallbackAssignee?.name || fallbackAssignee?.email || '';
                
                tasks.forEach(tk => {
                    const upd = {}; let need = false;
                    // Reassign primary assignee
                    if (tk.assigneeId === id) {
                        tk.assigneeId = fallbackId;
                        tk.assigneeName = fallbackName;
                        upd.assigneeId = fallbackId;
                        upd.assigneeName = fallbackName;
                        need = true;
                    }
                    // Clean up array fields
                    ['coExecutorIds','observerIds','notifyOnComplete'].forEach(fld => {
                        if (tk[fld]?.includes(id)) { tk[fld] = tk[fld].filter(uid => uid !== id); upd[fld] = tk[fld]; need = true; }
                    });
                    if (need) { cascadeBatch.update(base.collection('tasks').doc(tk.id), upd); batchOps++; }
                });
                
                // FIX: Firestore batch limit = 500 ops — use chunked writes
                if (batchOps > 0) {
                    if (batchOps <= 450) {
                        await cascadeBatch.commit();
                    } else {
                        // Rebuild in chunks of 450
                        let chunkBatch = db.batch(); let chunkCount = 0;
                        const allUpdates = [];
                        tasks.forEach(tk => {
                            const upd = {};
                            if (tk.assigneeId === fallbackId && tk._justReassigned) { upd.assigneeId = fallbackId; upd.assigneeName = fallbackName; }
                            ['coExecutorIds','observerIds','notifyOnComplete'].forEach(fld => {
                                if (tk[fld] && !tk[fld].includes(id) && tk['_cleaned_' + fld]) upd[fld] = tk[fld];
                            });
                            if (Object.keys(upd).length > 0) allUpdates.push({ id: tk.id, upd });
                        });
                        for (const item of allUpdates) {
                            chunkBatch.update(base.collection('tasks').doc(item.id), item.upd);
                            if (++chunkCount >= 450) { await chunkBatch.commit(); chunkBatch = db.batch(); chunkCount = 0; }
                        }
                        if (chunkCount > 0) await chunkBatch.commit();
                    }
                }
            } catch (e) { console.warn('[deleteUser] cascade:', e); }
            
            const idx = users.findIndex(x => x.id === id);
            if (idx >= 0) users.splice(idx, 1);
            renderUsers();
            updateSelects();
        }

        function renderUsers() {
            const c = document.getElementById('usersContainer');
            if (users.length === 0) {
                c.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>${t('noUsers')}</h3></div>`;
                return;
            }
            
            const canEdit = currentUserData?.role === 'owner' || currentUserData?.role === 'manager';
            const todayStr = getLocalDateStr(new Date());
            const shortDays = getDayNamesShort();
            const jsDayToIdx = {1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 0:6};

            c.innerHTML = users.map(u => {
                const userFunctions = functions.filter(f => f.assigneeIds?.includes(u.id));
                const isOwner = u.role === 'owner';
                
                // Task stats
                const userTasks = tasks.filter(tk => tk.assigneeId === u.id);
                const activeTasks = userTasks.filter(tk => tk.status !== 'done');
                const doneTasks = userTasks.filter(tk => tk.status === 'done');
                const newTasks = userTasks.filter(tk => tk.status === 'new');
                const inProgress = userTasks.filter(tk => tk.status === 'progress');
                const onReview = userTasks.filter(tk => tk.status === 'review');
                const overdue = activeTasks.filter(tk => tk.deadlineDate && t.deadlineDate < todayStr);
                const returned = userTasks.filter(tk => tk.reviewRejectedAt);
                
                // Autonomy index: % done without returns (from all done tasks)
                const doneWithoutReturn = doneTasks.filter(tk => !tk.reviewRejectedAt).length;
                const autonomyPct = doneTasks.length > 0 ? Math.round(doneWithoutReturn / doneTasks.length * 100) : 0;
                const autonomyColor = autonomyPct >= 80 ? '#16a34a' : autonomyPct >= 50 ? '#f59e0b' : '#ef4444';
                
                // Regular tasks & weekly hours
                const userRegular = regularTasks.filter(rt => {
                    const func = functions.find(f => f.name === rt.function);
                    return func?.assigneeIds?.includes(u.id);
                });
                let weeklyMin = 0;
                userRegular.forEach(rt => {
                    const start = rt.timeStart || rt.time || '';
                    const end = rt.timeEnd || '';
                    let dur = rt.estimatedTime || 60;
                    if (start && end) {
                        const [sh,sm] = start.split(':').map(Number);
                        const [eh,em] = end.split(':').map(Number);
                        dur = (eh*60+em) - (sh*60+sm);
                        if (dur <= 0) dur = 60;
                    }
                    let dpw = 1;
                    if (rt.period === 'daily') dpw = 5;
                    else if (rt.period === 'weekly' && rt.daysOfWeek) dpw = rt.daysOfWeek.length;
                    else if (rt.period === 'monthly') dpw = 0.25;
                    weeklyMin += dur * dpw;
                });
                const weeklyHrs = Math.round(weeklyMin / 60 * 10) / 10;
                const overloadFlag = weeklyHrs > 35;
                
                // Delegation pipeline
                const pipelineHTML = `
                <div style="display:flex;gap:2px;align-items:center;margin:0.5rem 0;">
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#eff6ff;border-radius:6px 0 0 6px;">
                        <div style="font-size:1.1rem;font-weight:700;color:#2563eb;">${newTasks.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${t('statusNew')}</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#fefce8;">
                        <div style="font-size:1.1rem;font-weight:700;color:#ca8a04;">${inProgress.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${t('inProgressStatus')}</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#f3e8ff;">
                        <div style="font-size:1.1rem;font-weight:700;color:#9333ea;">${onReview.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${t('statusOnReview')}</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#dcfce7;border-radius:0 6px 6px 0;">
                        <div style="font-size:1.1rem;font-weight:700;color:#16a34a;">${doneTasks.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${t('statusDone')}</div>
                    </div>
                </div>`;
                
                // Expanded detail panel
                const detailHTML = `
                <div id="userDetail_${u.id}" style="display:none;margin-top:0.5rem;border-top:1px solid #e5e7eb;padding-top:0.75rem;">
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">
                        <div style="background:#f0fdf4;border-radius:8px;padding:0.5rem;text-align:center;">
                            <div style="font-size:0.7rem;color:#6b7280;">${t('autonomyIndex') || 'Індекс автономності'}</div>
                            <div style="font-size:1.3rem;font-weight:700;color:${autonomyColor};">${autonomyPct}%</div>
                        </div>
                        <div style="background:${overloadFlag ? '#fef2f2' : '#f0f9ff'};border-radius:8px;padding:0.5rem;text-align:center;">
                            <div style="font-size:0.7rem;color:#6b7280;">${t('hoursPerWeek')}</div>
                            <div style="font-size:1.3rem;font-weight:700;color:${overloadFlag ? '#ef4444' : '#0284c7'};">${weeklyHrs}</div>
                        </div>
                    </div>
                    
                    ${overdue.length > 0 ? `
                    <div style="background:#fef2f2;border-radius:8px;padding:0.5rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.8rem;font-weight:600;color:#dc2626;"><i data-lucide="alert-triangle" class="icon icon-sm"></i> ${t('overdueStatus')} (${overdue.length})</div>
                        ${overdue.slice(0,3).map(t => `<div style="font-size:0.78rem;color:#374151;padding:0.2rem 0;">&bull; ${esc(t.title)} <span style="color:#ef4444;">${t.deadlineDate || ''}</span></div>`).join('')}
                        ${overdue.length > 3 ? `<div style="font-size:0.72rem;color:#9ca3af;">+${overdue.length - 3} ${t('more') || 'ще'}...</div>` : ''}
                    </div>` : ''}
                    
                    ${returned.length > 0 ? `
                    <div style="background:#fffbeb;border-radius:8px;padding:0.5rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.8rem;font-weight:600;color:#b45309;"><i data-lucide="rotate-ccw" class="icon icon-sm"></i> ${t('returnedFromReview') || 'Повернуто з ревью'} (${returned.length})</div>
                    </div>` : ''}
                    
                    ${userRegular.length > 0 ? `
                    <div style="margin-bottom:0.5rem;">
                        <div style="font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:0.4rem;">
                            <i data-lucide="repeat" class="icon icon-sm"></i> ${t('tabRegular')} (${userRegular.length})
                        </div>
                        ${userRegular.map(rt => {
                            const status = getRegularTaskStatus(rt);
                            const start = rt.timeStart || rt.time || '—';
                            const end = rt.timeEnd || '';
                            const timeStr = end ? start + '–' + end : start;
                            let scheduleStr = '';
                            if (rt.period === 'daily') {
                                scheduleStr = '';
                            } else if (rt.period === 'weekly' && rt.daysOfWeek) {
                                scheduleStr = rt.daysOfWeek
                                    .map(d => parseInt(d))
                                    .sort((a,b) => (jsDayToIdx[a]??7) - (jsDayToIdx[b]??7))
                                    .map(d => `<span style="display:inline-block;min-width:16px;height:16px;line-height:16px;text-align:center;border-radius:50%;font-size:0.58rem;font-weight:700;background:#dcfce7;color:#16a34a;">${shortDays[jsDayToIdx[d]] || d}</span>`)
                                    .join('');
                            } else if (rt.period === 'monthly') {
                                scheduleStr = `<span style="font-size:0.62rem;background:#e0e7ff;color:#4338ca;padding:0 4px;border-radius:3px;line-height:16px;">${rt.dayOfMonth || '1'}/${t('month') || 'міс'}</span>`;
                            }
                            return `
                            <div style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.5rem;margin-bottom:0.15rem;background:#f9fafb;border-radius:6px;font-size:0.78rem;cursor:pointer;" onclick="openRegularTaskModal('${escId(rt.id)}')">
                                <span style="width:6px;height:6px;border-radius:50%;background:${status.color};flex-shrink:0;"></span>
                                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;">${esc(rt.title)}</span>
                                ${scheduleStr ? `<span style="display:flex;gap:1px;flex-shrink:0;">${scheduleStr}</span>` : ''}
                                <span style="color:#9ca3af;font-size:0.68rem;white-space:nowrap;flex-shrink:0;">${timeStr}</span>
                            </div>`;
                        }).join('')}
                    </div>` : ''}
                    
                    ${userFunctions.length > 0 ? `
                    <div>
                        <div style="font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:0.3rem;">
                            <i data-lucide="settings" class="icon icon-sm"></i> ${t('tabFunctions')}
                        </div>
                        ${userFunctions.map(f => {
                            const fTasks = tasks.filter(tk => tk.function === f.name && tk.assigneeId === u.id);
                            const fActive = fTasks.filter(tk => tk.status !== 'done').length;
                            const fDone = fTasks.filter(tk => tk.status === 'done').length;
                            return `<div style="display:flex;justify-content:space-between;padding:0.25rem 0.5rem;font-size:0.8rem;">
                                <span style="font-weight:500;">${esc(f.name)}</span>
                                <span style="color:#6b7280;">${fActive} ${t('active')} / ${fDone} ${t('doneLabel')}</span>
                            </div>`;
                        }).join('')}
                    </div>` : ''}
                </div>`;

                return `
                <div class="user-card" style="cursor:pointer;" onclick="toggleUserDetail('${u.id}', event)">
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;">
                        <div style="flex:1;">
                            <div class="user-name" style="margin-bottom:2px;">${esc(u.name || u.email)}</div>
                            <div style="font-size:0.75rem;color:#6b7280;">${esc(u.email)}${u.position ? ` · ${esc(u.position)}` : ''}</div>
                        </div>
                        <span class="role-badge ${u.role}" style="flex-shrink:0;">${getRoleText(u.role)}</span>
                    </div>
                    ${userFunctions.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:0.4rem;">${userFunctions.map(f => `<span style="font-size:0.65rem;background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:4px;">${esc(f.name)}</span>`).join('')}</div>` : ''}
                    <div style="display:flex;gap:2px;margin-bottom:0.4rem;">
                        <div style="flex:1;text-align:center;padding:2px 0;background:#eff6ff;border-radius:4px 0 0 4px;font-size:0.78rem;font-weight:600;color:#2563eb;" title="${t('statusNew')}">${newTasks.length}</div>
                        <div style="flex:1;text-align:center;padding:2px 0;background:#fefce8;font-size:0.78rem;font-weight:600;color:#ca8a04;" title="${t('inProgressStatus')}">${inProgress.length}</div>
                        <div style="flex:1;text-align:center;padding:2px 0;background:#f3e8ff;font-size:0.78rem;font-weight:600;color:#9333ea;" title="${t('statusOnReview')}">${onReview.length}</div>
                        <div style="flex:1;text-align:center;padding:2px 0;background:#dcfce7;border-radius:0 4px 4px 0;font-size:0.78rem;font-weight:600;color:#16a34a;" title="${t('statusDone')}">${doneTasks.length}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;gap:0.6rem;font-size:0.75rem;color:#6b7280;align-items:center;">
                            <span style="font-weight:600;color:${autonomyColor};">${autonomyPct}%</span>
                            <span>${weeklyHrs} ${t('hoursPerWeek')}</span>
                            ${overdue.length > 0 ? `<span style="color:#ef4444;font-weight:600;"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>${overdue.length}</span>` : ''}
                            ${returned.length > 0 ? `<span style="color:#f59e0b;"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>${returned.length}</span>` : ''}
                        </div>
                        <div style="display:flex;gap:0.25rem;align-items:center;" onclick="event.stopPropagation();">
                            ${canEdit && !isOwner ? `<button class="btn btn-small" onclick="openUserModal('${u.id}')" title="${t('edit')}"><i data-lucide="pencil" class="icon icon-sm"></i></button>` : ''}
                            ${canEdit && !isOwner ? `<button class="btn btn-small btn-danger" onclick="deleteUser('${u.id}')" title="${t('delete')}"><i data-lucide="trash-2" class="icon icon-sm"></i></button>` : ''}
                            <i data-lucide="chevron-down" class="icon icon-sm" style="color:#d1d5db;" id="userToggle_${u.id}"></i>
                        </div>
                    </div>
                    ${detailHTML}
                </div>
            `}).join('');
            refreshIcons();
        }
        
        function toggleUserDetail(userId, event) {
            if (event.target.closest('button') || event.target.closest('a')) return;
            const section = document.getElementById('userDetail_' + userId);
            const toggle = document.getElementById('userToggle_' + userId);
            if (!section) return;
            const isOpen = section.style.display !== 'none';
            section.style.display = isOpen ? 'none' : 'block';
            if (toggle) {
                toggle.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-up');
                refreshIcons();
            }
        }
        
        let editingUserId = null;
        
        function openUserModal(userId = null) {
            editingUserId = userId;
            const modal = document.getElementById('userModal');
            
            // Заповнюємо список функцій
            const userFunctionsDiv = document.getElementById('userFunctions');
            userFunctionsDiv.innerHTML = functions.map(f => `
                <label class="assignee-checkbox">
                    <input type="checkbox" value="${f.id}" data-fname="${esc(f.name)}">
                    ${esc(f.name)}
                </label>
            `).join('') || `<p style="color:#7f8c8d;">${t('noFunctions')}</p>`;
            
            if (userId) {
                const user = users.find(u => u.id === userId);
                if (user) {
                    document.getElementById('userName').value = user.name || '';
                    document.getElementById('userEmail').value = user.email || '';
                    document.getElementById('userRole').value = user.role || 'employee';
                    document.getElementById('userPosition').value = user.position || '';
                    document.getElementById('userModalTitle').textContent = t('editEmployee');
                    
                    // Відмічаємо функції користувача
                    const userFunctions = functions.filter(f => f.assigneeIds?.includes(userId));
                    userFunctions.forEach(f => {
                        const checkbox = userFunctionsDiv.querySelector(`input[value="${f.id}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            } else {
                document.getElementById('userForm').reset();
                document.getElementById('userModalTitle').textContent = t('addEmployee');
            }
            
            modal.style.display = 'block';
        }
        
        async function saveUser(e) {
            e.preventDefault();
            
            if (!editingUserId) return;
            
            const name = document.getElementById('userName').value.trim();
            const role = document.getElementById('userRole').value;
            const position = document.getElementById('userPosition').value.trim();
            
            try {
                // Оновлюємо дані користувача
                await db.collection('companies').doc(currentCompany).collection('users').doc(editingUserId).update({
                    name: name,
                    role: role,
                    position: position
                });
                
                // Оновлюємо функції
                const selectedFunctions = Array.from(document.querySelectorAll('#userFunctions input:checked')).map(cb => cb.value);
                
                // Для кожної функції перевіряємо чи потрібно додати/видалити користувача
                for (const func of functions) {
                    const funcRef = db.collection('companies').doc(currentCompany).collection('functions').doc(func.id);
                    const isSelected = selectedFunctions.includes(func.id);
                    const isCurrentlyAssigned = func.assigneeIds?.includes(editingUserId);
                    
                    if (isSelected && !isCurrentlyAssigned) {
                        await funcRef.update({
                            assigneeIds: firebase.firestore.FieldValue.arrayUnion(editingUserId)
                        });
                    } else if (!isSelected && isCurrentlyAssigned) {
                        await funcRef.update({
                            assigneeIds: firebase.firestore.FieldValue.arrayRemove(editingUserId)
                        });
                    }
                }
                
                closeModal('userModal');
                
                // Локальне оновлення користувача
                const userIdx = users.findIndex(u => u.id === editingUserId);
                if (userIdx >= 0) {
                    users[userIdx] = { 
                        ...users[userIdx], 
                        name: document.getElementById('userName').value.trim(),
                        role: document.getElementById('userRole').value,
                        position: document.getElementById('userPosition').value.trim()
                    };
                }
                
                // Локальне оновлення функцій (використовуємо selectedFunctions з рядка вище)
                functions.forEach(func => {
                    const isSelected = selectedFunctions.includes(func.id);
                    const isCurrentlyAssigned = func.assigneeIds?.includes(editingUserId);
                    if (isSelected && !isCurrentlyAssigned) {
                        func.assigneeIds = [...(func.assigneeIds || []), editingUserId];
                    } else if (!isSelected && isCurrentlyAssigned) {
                        func.assigneeIds = (func.assigneeIds || []).filter(id => id !== editingUserId);
                    }
                });
                
                renderUsers();
                renderFunctions();
                updateSelects();
            } catch (e) {
                alert(t('error') + ': ' + e.message);
            }
        }
