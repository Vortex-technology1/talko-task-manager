// =====================
        // FUNCTIONS
        // =====================
'use strict';
        function openFunctionModal(id = null) {
            if (!isManagerOrAbove()) {
                showToast(window.t('noPermissionTask'), 'error');
                return;
            }

            // Встановлюємо editingId ДО updateFunctionAssignees — щоб reportsTo виключав поточну функцію
            editingId = id || null;

            document.getElementById('functionModal').style.display = 'block';
            updateFunctionAssignees();
            
            if (id) {
                editingId = id;
                const f = functions.find(x => x.id === id);
                if (f) {
                    document.getElementById('functionModalTitle').textContent = window.t('editFunction');
                    document.getElementById('functionName').value = f.name || '';
                    document.getElementById('functionHead').value = f.headId || '';
                    document.getElementById('functionDescription').value = f.description || '';
                    document.getElementById('functionResult').value = f.result || '';
                    document.getElementById('functionContacts').value = f.contacts || '';
                    document.getElementById('functionKeywords').value = f.keywords?.join(', ') || '';
                    document.getElementById('functionStatus').value = f.status || 'active';
                    document.getElementById('functionColor').value = f.primaryColor || '#ffffff';
                    document.getElementById('functionOwnerTempId').value = f.ownerTempId || '';
                    document.getElementById('functionOwnerTempUntil').value = f.ownerTempUntil
                        ? (f.ownerTempUntil.toDate ? f.ownerTempUntil.toDate().toISOString().split('T')[0] : f.ownerTempUntil)
                        : '';
                    setTimeout(() => {
                        document.querySelectorAll('#functionAssignees input').forEach(cb => {
                            cb.checked = f.assigneeIds?.includes(cb.value);
                        });
                        // reportsTo
                        const rtEl = document.getElementById('functionReportsTo');
                        if (rtEl) rtEl.value = f.reportsTo || '';
                        // communicatesWith rows
                        renderCommunicatesWithRows(f.communicatesWith || []);
                    }, 50);
                }
            } else {
                editingId = null;
                document.getElementById('functionModalTitle').textContent = window.t('newFunction');
                document.getElementById('functionForm').reset();
                document.getElementById('functionStatus').value = 'active';
                document.getElementById('functionColor').value = '#ffffff';
                const cwContainer = document.getElementById('communicatesWithRows');
                if (cwContainer) cwContainer.innerHTML = '';
            }
        }

        function updateFunctionAssignees() {
            const c = document.getElementById('functionAssignees');
            const h = document.getElementById('functionHead');
            const t = document.getElementById('functionOwnerTempId');
            const userOptions = users.map(u => `<option value="${esc(u.id)}">${esc(u.name || u.email)}</option>`).join('');
            c.innerHTML = users.map(u => `<label class="assignee-checkbox"><input type="checkbox" value="${esc(u.id)}">${esc(u.name || u.email)}</label>`).join('');
            h.innerHTML = `<option value="">${window.t('select')}</option>` + userOptions;
            if (t) t.innerHTML = `<option value="">— нет —</option>` + userOptions;
            // Populate reportsTo select (all functions except currently editing)
            const rt = document.getElementById('functionReportsTo');
            if (rt) {
                const otherFuncs = functions.filter(f => f.status !== 'archived' && f.id !== editingId);
                rt.innerHTML = `<option value="">— не подчиняется —</option>` +
                    otherFuncs.map(f => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('');
            }
        }

        // --- communicatesWith UI ---
        function renderCommunicatesWithRows(data) {
            const container = document.getElementById('communicatesWithRows');
            if (!container) return;
            container.innerHTML = '';
            (data || []).forEach((row, i) => addCommunicatesWithRow(row, i));
        }

        window.addCommunicatesWithRow = function(existing, idx) {
            const container = document.getElementById('communicatesWithRows');
            if (!container) return;
            const rowId = 'cwRow_' + Date.now() + '_' + Math.random().toString(36).slice(2);
            const funcOptions = functions
                .filter(f => f.status !== 'archived' && f.id !== editingId)
                .map(f => `<option value="${esc(f.id)}" ${existing?.functionId === f.id ? 'selected' : ''}>${esc(f.name)}</option>`)
                .join('');
            const dirOptions = [
                {v:'bidirectional', l:'↔ Двусторонняя'},
                {v:'outgoing', l:'→ Исходящая'},
                {v:'incoming', l:'← Входящая'}
            ].map(d => `<option value="${d.v}" ${existing?.direction === d.v ? 'selected' : ''}>${d.l}</option>`).join('');
            const div = document.createElement('div');
            div.id = rowId;
            div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr auto auto;gap:0.4rem;align-items:center;background:#f9fafb;border-radius:8px;padding:0.5rem;';
            div.innerHTML = `
                <select class="form-select cw-func-select" style="font-size:0.82rem;">
                    <option value="">— выберите функцию —</option>${funcOptions}
                </select>
                <input type="text" class="form-input cw-topics-input" placeholder="теми: рахунки, бюджет" value="${esc(existing?.topics?.join(', ') || '')}" style="font-size:0.82rem;">
                <select class="form-select cw-dir-select" style="font-size:0.82rem;min-width:130px;">${dirOptions}</select>
                <button type="button" onclick="document.getElementById('${rowId}').remove()" style="background:none;border:1px solid #fca5a5;border-radius:6px;color:#ef4444;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.82rem;">✕</button>`;
            container.appendChild(div);
        };

        function collectCommunicatesWith() {
            const rows = document.querySelectorAll('#communicatesWithRows > div');
            const result = [];
            rows.forEach(row => {
                const funcId = row.querySelector('.cw-func-select')?.value;
                if (!funcId) return;
                const topics = (row.querySelector('.cw-topics-input')?.value || '')
                    .split(',').map(t => t.trim()).filter(Boolean);
                const direction = row.querySelector('.cw-dir-select')?.value || 'bidirectional';
                result.push({ functionId: funcId, topics, direction });
            });
            return result;
        }

        async function saveFunction(e) {
            // Role guard: only owner/manager can manage functions
            if (currentUserData?.role === 'employee') {
                showToast(window.t('noPermissionTask'), 'error');
                return;
            }
            e.preventDefault();
            
            if (isSaving) return;
            
            // Rate limiting
            if (!rateLimiter.check('saveFunction')) {
                showAlertModal(window.t('tooManyRequests'));
                return;
            }
            
            // Валідація
            const funcData = {
                name: document.getElementById('functionName').value.trim(),
                headId: document.getElementById('functionHead').value
            };
            
            const errors = validateFunctionData(funcData);
            if (errors.length > 0) {
                showAlertModal(errors.join('\n'));
                return;
            }
            
            isSaving = true;
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            
            // Копіюємо editingId локально
            const currentEditingId = editingId;
            
            try {
                const headId = document.getElementById('functionHead').value;
                const head = users.find(u => u.id === headId);
                const assigneeIds = Array.from(document.querySelectorAll('#functionAssignees input:checked')).map(cb => cb.value);
                if (!assigneeIds.includes(headId)) assigneeIds.push(headId);
                
                const data = {
                    name: document.getElementById('functionName').value.trim(),
                    headId: headId,
                    headName: head?.name || head?.email || '',
                    description: document.getElementById('functionDescription').value.trim(),
                    result: document.getElementById('functionResult').value.trim(),
                    contacts: document.getElementById('functionContacts').value.trim(),
                    keywords: document.getElementById('functionKeywords').value.split(',').map(k => k.trim()).filter(Boolean),
                    status: document.getElementById('functionStatus').value || 'active',
                    primaryColor: document.getElementById('functionColor').value || '#ffffff',
                    ownerTempId: document.getElementById('functionOwnerTempId').value || '',
                    ownerTempUntil: document.getElementById('functionOwnerTempUntil').value || '',
                    reportsTo: document.getElementById('functionReportsTo')?.value || '',
                    communicatesWith: collectCommunicatesWith(),
                    assigneeIds: assigneeIds,
                    assigneeNames: assigneeIds.map(id => users.find(u => u.id === id)?.name || users.find(u => u.id === id)?.email || '').filter(Boolean)
                };
                
                if (currentEditingId) {
                    const oldFunc = functions.find(f => f.id === currentEditingId);
                    const oldName = oldFunc?.name;
                    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    await db.collection('companies').doc(currentCompany).collection('functions').doc(currentEditingId).update(data);
                    // Каскадне оновлення імені функції
                    if (oldName && oldName !== data.name) {
                        const base = db.collection('companies').doc(currentCompany);
                        let batch = db.batch(); let bc = 0;
                        for (const tk of tasks.filter(t => t.function === oldName)) {
                            batch.update(base.collection('tasks').doc(tk.id), { function: data.name }); tk.function = data.name;
                            if (++bc >= 450) { await batch.commit(); batch = db.batch(); bc = 0; }
                        }
                        for (const rt of regularTasks.filter(r => r.function === oldName)) {
                            batch.update(base.collection('regularTasks').doc(rt.id), { function: data.name }); rt.function = data.name;
                            if (++bc >= 450) { await batch.commit(); batch = db.batch(); bc = 0; }
                        }
                        for (const pt of processTemplates) {
                            if (pt.steps?.some(s => s.function === oldName)) {
                                const upSteps = pt.steps.map(s => s.function === oldName ? { ...s, function: data.name } : s);
                                batch.update(base.collection('processTemplates').doc(pt.id), { steps: upSteps }); pt.steps = upSteps;
                                if (++bc >= 450) { await batch.commit(); batch = db.batch(); bc = 0; }
                            }
                        }
                        if (bc > 0) await batch.commit();
                    }
                    const idx = functions.findIndex(f => f.id === currentEditingId);
                    if (idx >= 0) functions[idx] = { ...functions[idx], ...data };
                } else {
                    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    // Canvas defaults for biz-structure sync
                    if (!data.canvas) {
                        const idx = functions.length;
                        const cols = 4;
                        data.canvas = {
                            x: 50 + (idx % cols) * 280,
                            y: 50 + Math.floor(idx / cols) * 200,
                            width: 220,
                            height: 140
                        };
                    }
                    const docRef = await db.collection('companies').doc(currentCompany).collection('functions').add(data);
                    // Локальне додавання
                    functions.unshift({ id: docRef.id, ...data, createdAt: new Date() });
                }
                closeModal('functionModal');
                renderFunctions();
                updateSelects();
                // Sync to biz-structure canvas
                if (typeof sendFunctionsToIframe === 'function') sendFunctionsToIframe();
            } catch (error) {
                console.error('saveFunction error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            } finally {
                isSaving = false;
                if (submitBtn) submitBtn.disabled = false;
            }
        }

        async function deleteFunction(id) {
            if (currentUserData?.role === 'employee') { showToast(window.t('noPermissionTask'), 'error'); return; }
            const func = functions.find(f => f.id === id);
            if (!func) return;
            
            const funcName = func.name || window.t('function');
            const usedInTemplates = processTemplates.filter(pt => pt.steps?.some(s => s.function === funcName));
            if (usedInTemplates.length > 0) {
                if (!await showConfirmModal(funcName + ' → ' + usedInTemplates.map(pt => pt.name).join(', ') + '\n\n' + (window.t('deleteConfirm')), { danger: true })) return;
            }
            
            // Оптимістичне видалення
            const funcCopy = { ...func };
            functions = functions.filter(f => f.id !== id);
            renderFunctions();
            
            // Показуємо toast з можливістю undo
            showUndoToast(funcName, funcCopy, 'function');
            
            try {
                // Batch delete: function + related connections
                const batch = db.batch();
                batch.delete(db.collection('companies').doc(currentCompany).collection('functions').doc(id));
                
                // Delete related functionConnections
                const connSnap1 = await db.collection('companies').doc(currentCompany)
                    .collection('functionConnections').where('from', '==', id).get();
                const connSnap2 = await db.collection('companies').doc(currentCompany)
                    .collection('functionConnections').where('to', '==', id).get();
                connSnap1.docs.forEach(d => batch.delete(d.ref));
                connSnap2.docs.forEach(d => batch.delete(d.ref));
                
                await batch.commit();
                
                // Cascade: очищаємо ownerFunctionId в projectStages
                if (typeof window.projectStages !== 'undefined') {
                    const affectedStages = window.projectStages.filter(s => s.ownerFunctionId === id);
                    if (affectedStages.length > 0) {
                        const stageBatch = db.batch();
                        affectedStages.forEach(s => {
                            s._prevOwnerFunctionId = id; // зберігаємо для Undo
                            s.ownerFunctionId = '';
                            stageBatch.update(
                                db.collection('companies').doc(currentCompany).collection('projectStages').doc(s.id),
                                { ownerFunctionId: '' }
                            );
                        });
                        await stageBatch.commit();
                    }
                }
                
                // Sync to canvas
                if (typeof sendFunctionsToIframe === 'function') sendFunctionsToIframe();
            } catch (error) {
                // Rollback
                if (!functions.find(f => f.id === id)) {
                    functions.unshift(funcCopy);
                }
                deletedItemsStack = deletedItemsStack.filter(d => d.item.id !== id);
                renderFunctions();
                hideUndoToast();
                console.error('deleteFunction error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            }
        }

        function renderFunctions() {
            const c = document.getElementById('functionsContainer');
            const activeFunctions = functions.filter(f => f.status !== 'archived');
            
            if (activeFunctions.length === 0) {
                c.innerHTML = `<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:3rem 1rem;">
                    <div style="margin-bottom:0.75rem;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
                    <h3 style="margin-bottom:0.5rem;">${window.t('noFunctions') || 'Немає функцій'}</h3>
                    <p style="color:#6b7280;margin-bottom:1rem;">${window.t('createFirstFunction') || 'Додайте першу бізнес-функцію для структуризації роботи'}</p>
                    <button class="btn btn-success" onclick="openFunctionModal()">+ ${window.t('addFunction') || 'Додати функцію'}</button>
                </div>`;
                const mergeBtn = document.getElementById('mergeFunctionsBtn');
                if (mergeBtn) mergeBtn.style.display = 'none';
                return;
            }

            const shortDays = getDayNamesShort();
            // JS getDay(): 0=Sun, but shortDays is Mon-first [Пн,Вт,Ср,Чт,Пт,Сб,Нд]
            // Mapping: shortDays[0]=Mon(1), [1]=Tue(2), ..., [5]=Sat(6), [6]=Sun(0)
            const jsDayToIdx = {1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 0:6};

            c.innerHTML = activeFunctions.map(f => {
                const mergedInfo = f.mergedFrom?.length ? `<div style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;"><i data-lucide="git-merge" class="icon icon-sm"></i> ${window.t('mergedFrom')}: ${f.mergedFrom.map(m => m.name).join(', ')}</div>` : '';
                
                const funcTasks = tasks.filter(task => task.function === f.name);
                const funcRegular = regularTasks.filter(rt => rt.function === f.name);
                const activeTasks = funcTasks.filter(t => t.status !== 'done').length;
                const doneTasks = funcTasks.filter(t => t.status === 'done').length;

                // Calculate weekly hours for regular tasks
                let weeklyMinutes = 0;
                funcRegular.forEach(rt => {
                    const start = rt.timeStart || rt.time || '';
                    const end = rt.timeEnd || '';
                    let durMin = rt.estimatedTime || 60;
                    if (start && end) {
                        const [sh,sm] = start.split(':').map(Number);
                        const [eh,em] = end.split(':').map(Number);
                        durMin = (eh*60+em) - (sh*60+sm);
                        if (durMin <= 0) durMin = 60;
                    }
                    let daysPerWeek = 1;
                    if (rt.period === 'daily') daysPerWeek = rt.skipWeekends === false ? 7 : 5;
                    else if (rt.period === 'weekly' && rt.daysOfWeek) daysPerWeek = rt.daysOfWeek.length;
                    else if (rt.period === 'monthly') daysPerWeek = 0.25;
                    weeklyMinutes += durMin * daysPerWeek;
                });
                const weeklyHours = Math.round(weeklyMinutes / 60 * 10) / 10;

                // Regular tasks detail
                let regularHTML = '';
                if (funcRegular.length > 0) {
                    regularHTML = `
                    <div class="func-regular-section" id="funcRegular_${escId(f.id)}" style="display:none;margin-top:0.75rem;border-top:1px solid #e5e7eb;padding-top:0.75rem;">
                        <div style="font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:0.5rem;">
                            <i data-lucide="repeat" class="icon icon-sm"></i> ${window.t('tabRegular')} (${funcRegular.length})
                        </div>
                        ${funcRegular.map(rt => {
                            const status = getRegularTaskStatus(rt);
                            const start = rt.timeStart || rt.time || '—';
                            const end = rt.timeEnd || '';
                            const timeStr = end ? start + '–' + end : start;
                            
                            // Schedule display
                            let scheduleStr = '';
                            if (rt.period === 'daily') {
                                scheduleStr = window.t('daily');
                            } else if (rt.period === 'weekly' && rt.daysOfWeek) {
                                scheduleStr = rt.daysOfWeek
                                    .map(d => parseInt(d))
                                    .sort((a,b) => (jsDayToIdx[a]??7) - (jsDayToIdx[b]??7))
                                    .map(d => `<span style="display:inline-block;width:26px;height:26px;line-height:26px;text-align:center;border-radius:50%;font-size:0.7rem;font-weight:600;${rt.daysOfWeek.includes(d.toString()) ? 'background:#dcfce7;color:#16a34a;' : ''}">${shortDays[jsDayToIdx[d]] || d}</span>`)
                                    .join('');
                            } else if (rt.period === 'monthly') {
                                scheduleStr = (window.t('monthly')) + ' ' + (rt.dayOfMonth || '1') + '-' + (window.t('dayShort'));
                            }

                            return `
                            <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.5rem;margin-bottom:0.3rem;background:#f9fafb;border-radius:8px;font-size:0.82rem;cursor:pointer;" onclick="openRegularTaskModal('${escId(rt.id)}')">
                                <span style="width:8px;height:8px;border-radius:50%;background:${status.color};flex-shrink:0;"></span>
                                <span style="flex:1;font-weight:500;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(rt.title)}</span>
                                <span style="color:#6b7280;font-size:0.75rem;white-space:nowrap;">${timeStr}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.3rem;padding:0 0.5rem 0.4rem;margin-bottom:0.2rem;">
                                <span style="display:flex;gap:2px;">${scheduleStr}</span>
                            </div>`;
                        }).join('')}
                    </div>`;
                }

                const financeHTML = `
                    <div class="func-regular-section" id="funcFinance_${escId(f.id)}" style="display:none;margin-top:0.75rem;border-top:1px solid #e5e7eb;padding-top:0.75rem;">
                        <div style="text-align:center;color:#9ca3af;font-size:0.82rem;padding:0.5rem;">Загрузка...</div>
                    </div>`;

                // Temp owner banner
                const now = new Date();
                const tempOwnerActive = f.ownerTempId && f.ownerTempUntil && new Date(f.ownerTempUntil) >= now;
                const tempOwnerUser = tempOwnerActive ? users.find(u => u.id === f.ownerTempId) : null;
                const tempOwnerBanner = tempOwnerActive && tempOwnerUser
                    ? `<div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:6px;padding:0.35rem 0.6rem;font-size:0.78rem;color:#92400e;margin-bottom:0.5rem;"><i data-lucide="user-check" class="icon icon-sm"></i> Тимч. власник: <strong>${esc(tempOwnerUser.name || tempOwnerUser.email)}</strong> до ${esc(f.ownerTempUntil)}</div>`
                    : '';
                // Status badge (show only non-active)
                const statusBadge = f.status === 'draft'
                    ? `<span style="font-size:0.7rem;background:#f3f4f6;color:#6b7280;border-radius:4px;padding:1px 6px;margin-left:6px;display:inline-flex;align-items:center;gap:2px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Черновик</span>`
                    : '';
                // Border color by primaryColor
                const cardBorderStyle = f.primaryColor && f.primaryColor !== '#ffffff'
                    ? `border-left:4px solid ${esc(f.primaryColor)};`
                    : '';

                return `
                <div class="function-card" style="cursor:pointer;${cardBorderStyle}" onclick="toggleFuncRegular('${escId(f.id)}', event)">
                    ${tempOwnerBanner}
                    <div class="function-header">
                        <div class="function-title"><i data-lucide="settings" class="icon icon-sm"></i> ${esc(f.name)}${statusBadge}</div>
                    </div>
                    ${f.description ? `<div class="function-description">${esc(f.description)}</div>` : ''}
                    ${f.result ? `<div style="font-size:0.8rem;color:#374151;background:#f0fdf4;border-left:3px solid #22c55e;padding:0.35rem 0.6rem;border-radius:0 6px 6px 0;margin:0.4rem 0;"><i data-lucide="target" class="icon icon-sm" style="color:#16a34a;"></i> <em>${esc(f.result)}</em></div>` : ''}
                    ${mergedInfo}
                    <div class="function-assignees">
                        ${f.headName ? `<span class="assignee-badge head"><i data-lucide="crown" class="icon icon-sm"></i> ${esc(f.headName)}</span>` : '<span style="font-size:0.75rem;color:#ef4444;border:1px solid #fca5a5;border-radius:4px;padding:1px 6px;">⚠️ Немає власника</span>'}
                        ${f.assigneeNames?.filter(n => n !== f.headName).map(n => `<span class="assignee-badge">${esc(n)}</span>`).join('') || ''}
                    </div>
                    ${f.contacts ? `<div style="font-size:0.78rem;color:#6b7280;margin:0.3rem 0;"><i data-lucide="message-circle" class="icon icon-sm"></i> ${esc(f.contacts)}</div>` : ''}
                    ${f.keywords?.length ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin:0.3rem 0;">${f.keywords.map(k => `<span style="font-size:0.7rem;background:#eff6ff;color:#1d4ed8;border-radius:4px;padding:1px 6px;">${esc(k)}</span>`).join('')}</div>` : ''}
                    ${(f.communicatesWith?.length) ? `<div style="font-size:0.78rem;color:#6b7280;margin:0.3rem 0;display:flex;flex-wrap:wrap;gap:0.3rem;align-items:center;"><i data-lucide="share-2" class="icon icon-sm"></i>${f.communicatesWith.slice(0,3).map(c => {
                        const cf = functions.find(fn => fn.id === c.functionId);
                        if (!cf) return '';
                        const arrow = c.direction === 'outgoing' ? '→' : c.direction === 'incoming' ? '←' : '↔';
                        return `<span style="background:#f3f0ff;color:#7c3aed;border-radius:4px;padding:1px 6px;">${arrow} ${esc(cf.name)}${c.topics?.length ? ': ' + esc(c.topics.join(', ')) : ''}</span>`;
                    }).filter(Boolean).join('')}${f.communicatesWith.length > 3 ? `<span style="color:#9ca3af;">+${f.communicatesWith.length - 3}</span>` : ''}</div>` : ''}
                    ${(() => {
                        const funcMetrics = (window._metrics || []).filter(m => m.functionId === f.id || (m.boundFunctions && m.boundFunctions[f.id]));
                        if (!funcMetrics.length) return '';
                        const metricItems = funcMetrics.slice(0, 3).map(m => {
                            const target = m.defaultTarget || m.target || 0;
                            const targetPeriod = m.targetPeriod || m.frequency || '';
                            // Try to get latest actual value from window._metricEntries or skip
                            const periodLabel = targetPeriod === 'week' ? '/нед' : targetPeriod === 'quarter' ? '/кв' : '/мес';
                            if (!target) {
                                return `<span style="font-size:0.72rem;background:#f3f4f6;color:#374151;border-radius:4px;padding:1px 7px;display:inline-flex;align-items:center;gap:3px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> ${esc(m.name)}</span>`;
                            }
                            const formatted = target >= 1000 ? Math.round(target/1000)+'к' : target;
                            return `<span style="font-size:0.72rem;background:#f0fdf4;color:#16a34a;border-radius:4px;padding:1px 7px;display:inline-flex;align-items:center;gap:3px;" title="${esc(m.name)}: ціль ${target}${periodLabel}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> ${esc(m.name)}: ${formatted}${m.unit||''}${periodLabel}</span>`;
                        }).join('');
                        return `<div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin:0.3rem 0;">${metricItems}${funcMetrics.length > 3 ? `<span style="font-size:0.72rem;color:#9ca3af;">+${funcMetrics.length-3}</span>` : ''}</div>`;
                    })()}
                    <div class="function-stats" style="flex-wrap:wrap;gap:0.5rem;">
                        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
                            <span style="font-size:0.82rem;color:#525252;"><i data-lucide="file-text" class="icon icon-sm"></i> ${activeTasks} ${window.t('active')} / ${doneTasks} ${window.t('doneLabel')}</span>
                            <span style="font-size:0.82rem;color:#525252;"><i data-lucide="repeat" class="icon icon-sm"></i> ${funcRegular.length} ${window.t('regularTaskLabel')}</span>
                            ${weeklyHours > 0 ? `<span style="font-size:0.82rem;color:#0284c7;font-weight:600;"><i data-lucide="clock" class="icon icon-sm"></i> ${weeklyHours} ${window.t('hoursPerWeek')}</span>` : ''}
                        </div>
                        <div style="display:flex;gap:0.3rem;" onclick="event.stopPropagation();">
                            <button class="btn btn-small" onclick="toggleFuncFinance('${escId(f.id)}')" title=${window.t('financeWord2')} style="color:#22c55e;border-color:#d1fae5;">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </button>
                            <button class="btn btn-small" onclick="openRegularTaskModal(null, null, '${escId(f.id)}')" title="${window.t('addRegularToFunction') || 'Додати регулярне завдання'}" style="background:#f0f9ff;color:#0369a1;border-color:#bae6fd;">
                                <i data-lucide="repeat" class="icon icon-sm"></i>+
                            </button>
                            <button class="btn btn-small" onclick="openFunctionModal('${escId(f.id)}')"><i data-lucide="pencil" class="icon icon-sm"></i></button>
                            <button class="btn btn-small" onclick="openEmployeeOnboarding('${escId(f.id)}')" title="Онбординг нового сотрудника" style="background:#fdf4ff;color:#7c3aed;border-color:#e9d5ff;"><i data-lucide="user-check" class="icon icon-sm"></i></button>
                            <button class="btn btn-small btn-danger" onclick="deleteFunction('${escId(f.id)}')"><i data-lucide="trash-2" class="icon icon-sm"></i></button>
                        </div>
                    </div>
                    ${funcRegular.length > 0 ? `
                    <div style="text-align:center;padding-top:0.3rem;margin-top:0.3rem;border-top:1px dashed #e5e7eb;">
                        <span class="func-toggle-hint" id="funcToggle_${escId(f.id)}" style="font-size:0.75rem;color:#9ca3af;"><i data-lucide="chevron-down" class="icon icon-sm"></i> ${window.t('showRegularTasks')}</span>
                    </div>` : ''}
                    ${regularHTML}
                    ${financeHTML}
                </div>
            `}).join('');
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
            
            const mergeBtn = document.getElementById('mergeFunctionsBtn');
            if (mergeBtn) {
                mergeBtn.style.display = functions.length >= 2 ? 'flex' : 'none';
            }
        }

        function toggleFuncRegular(funcId, event) {
            // Don't toggle if clicking buttons
            if (event.target.closest('button') || event.target.closest('a')) return;
            const section = document.getElementById('funcRegular_' + funcId);
            const toggle = document.getElementById('funcToggle_' + funcId);
            if (!section) return;
            const isOpen = section.style.display !== 'none';
            section.style.display = isOpen ? 'none' : 'block';
            if (toggle) {
                toggle.innerHTML = isOpen 
                    ? `<i data-lucide="chevron-down" class="icon icon-sm"></i> ${window.t('showRegularTasks')}`
                    : `<i data-lucide="chevron-up" class="icon icon-sm"></i> ${window.t('hideRegularTasks')}`;
                if (typeof window.refreshIcons === 'function') window.refreshIcons();
            }
        }

        function toggleFuncFinance(funcId) {
            const el = document.getElementById('funcFinance_' + funcId);
            if (!el) return;
            const isOpen = el.style.display !== 'none';
            if (isOpen) { el.style.display = 'none'; return; }
            el.style.display = 'block';
            // Викликаємо ту саму функцію що і в проектах — просто з mode:'function'
            if (typeof window._renderProjectFinance === 'function') {
                window._renderProjectFinance(null, el, { mode: 'function', id: funcId });
            } else {
                el.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:1rem;font-size:0.82rem;">' + (window.t('finLoading') || 'Завантаження...') + '</div>';
                if (typeof lazyLoad === 'function') {
                    lazyLoad('finance', function() {
                        if (typeof window._renderProjectFinance === 'function') {
                            window._renderProjectFinance(null, el, { mode: 'function', id: funcId });
                        }
                    });
                }
            }
        }

        window.toggleFunctionsHowto = function() {
            const panel = document.getElementById('functionsHowtoPanel');
            if (!panel) return;
            if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
            panel.style.display = 'block';
            panel.innerHTML = _buildFunctionsHowto();
            if (typeof refreshIcons === 'function') refreshIcons();
        };

        function _buildFunctionsHowto() {
            const t = window.t;

            // helper: numbered step row
            function stepRow(n, bgColor, title, desc) {
                return '<div style="display:flex;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid #f9fafb;align-items:flex-start;">'
                    + '<div style="min-width:24px;height:24px;background:' + bgColor + ';color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">' + n + '</div>'
                    + '<div><div style="font-weight:500;font-size:0.82rem;">' + title + '</div><div style="font-size:0.78rem;color:#6b7280;">' + desc + '</div></div>'
                    + '</div>';
            }

            // replace block
            var replaceRows = [
                [t('fnHowtoReplace1t'), t('fnHowtoReplace1d')],
                [t('fnHowtoReplace2t'), t('fnHowtoReplace2d')],
                [t('fnHowtoReplace3t'), t('fnHowtoReplace3d')],
                [t('fnHowtoReplace4t'), t('fnHowtoReplace4d')],
            ].map(function(row, i) { return stepRow(i + 1, '#0284c7', row[0], row[1]); }).join('');

            // setup block
            var setupRows = [
                [t('fnHowtoSetup1t'), t('fnHowtoSetup1d')],
                [t('fnHowtoSetup2t'), t('fnHowtoSetup2d')],
                [t('fnHowtoSetup3t'), t('fnHowtoSetup3d')],
                [t('fnHowtoSetup4t'), t('fnHowtoSetup4d')],
                [t('fnHowtoSetup5t'), t('fnHowtoSetup5d')],
            ].map(function(row, i) { return stepRow(i + 1, '#22c55e', row[0], row[1]); }).join('');

            // glossary block
            var glossaryItems = [
                ['core',   t('fnGlos0name'), t('fnGlos0short'), t('fnGlos0text'), t('fnGlos0ex')],
                ['process',t('fnGlos1name'), t('fnGlos1short'), t('fnGlos1text'), t('fnGlos1ex')],
                ['process',t('fnGlos2name'), t('fnGlos2short'), t('fnGlos2text'), t('fnGlos2ex')],
                ['core',   t('fnGlos3name'), t('fnGlos3short'), t('fnGlos3text'), t('fnGlos3ex')],
                ['core',   t('fnGlos4name'), t('fnGlos4short'), t('fnGlos4text'), t('fnGlos4ex')],
                ['auto',   t('fnGlos5name'), t('fnGlos5short'), t('fnGlos5text'), t('fnGlos5ex')],
                ['auto',   t('fnGlos6name'), t('fnGlos6short'), t('fnGlos6text'), t('fnGlos6ex')],
            ].map(function(item) {
                var type = item[0], name = item[1], short = item[2], analogy = item[3], example = item[4];
                var tagBg  = type === 'core' ? '#dbeafe' : type === 'process' ? '#dcfce7' : '#fef9c3';
                var tagCol = type === 'core' ? '#1d4ed8' : type === 'process' ? '#166534' : '#854d0e';
                var tagLabel = type === 'core' ? t('fnHowtoTagCore') : type === 'process' ? t('fnHowtoTagProcess') : t('fnHowtoTagAuto');
                return '<div style="border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;">'
                    + '<div onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'block\'?\'none\':\'block\';this.querySelector(\'.chv\').style.transform=this.nextElementSibling.style.display===\'block\'?\'rotate(180deg)\':\'rotate(0deg)\'" style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0.75rem;cursor:pointer;background:#fafafa;">'
                    + '<div style="display:flex;align-items:center;gap:8px;">'
                    + '<span style="font-size:0.68rem;font-weight:600;padding:2px 7px;border-radius:4px;background:' + tagBg + ';color:' + tagCol + ';">' + tagLabel + '</span>'
                    + '<span style="font-size:0.82rem;font-weight:600;color:#111;">' + name + '</span>'
                    + '<span style="font-size:0.75rem;color:#6b7280;">' + short + '</span>'
                    + '</div>'
                    + '<span class="chv" style="font-size:10px;color:#9ca3af;transition:transform 0.2s;">▼</span>'
                    + '</div>'
                    + '<div style="display:none;padding:0.75rem;border-top:1px solid #f3f4f6;background:white;">'
                    + '<p style="font-size:0.78rem;color:#374151;line-height:1.6;margin:0 0 0.5rem;">' + analogy + '</p>'
                    + '<div style="background:#f9fafb;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.75rem;color:#6b7280;line-height:1.5;">' + example + '</div>'
                    + '</div>'
                    + '</div>';
            }).join('');

            return `<div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1rem;">

            <div style="background:linear-gradient(135deg,#1e3a5f,#0f2040);border-radius:14px;padding:1.25rem 1.5rem;color:white;position:relative;">
                <button onclick="toggleFunctionsHowto()" style="position:absolute;top:0.75rem;right:0.75rem;background:rgba(255,255,255,0.15);border:none;color:white;border-radius:6px;padding:0.2rem 0.5rem;cursor:pointer;font-size:0.8rem;">✕</button>
                <div style="font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>${t('fnHowtoTitle')}</div>
                <div style="color:#93c5fd;font-size:0.88rem;line-height:1.5;">${t('fnHowtoSubtitle')}</div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>${t('fnHowtoProblem')}</div>
                <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                    <thead><tr style="background:#f9fafb;">
                        <th style="padding:0.5rem;text-align:left;color:#ef4444;border-bottom:2px solid #fecaca;">${t('fnHowtoColProblem')}</th>
                        <th style="padding:0.5rem;text-align:left;color:#f59e0b;border-bottom:2px solid #fde68a;">${t('fnHowtoColConsequence')}</th>
                        <th style="padding:0.5rem;text-align:left;color:#16a34a;border-bottom:2px solid #bbf7d0;">${t('fnHowtoColSolution')}</th>
                    </tr></thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:0.5rem;">${t('fnHowtoRow1p')}</td><td style="padding:0.5rem;color:#6b7280;">${t('fnHowtoRow1c')}</td><td style="padding:0.5rem;color:#16a34a;font-weight:500;">${t('fnHowtoRow1s')}</td></tr>
                        <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:0.5rem;">${t('fnHowtoRow2p')}</td><td style="padding:0.5rem;color:#6b7280;">${t('fnHowtoRow2c')}</td><td style="padding:0.5rem;color:#16a34a;font-weight:500;">${t('fnHowtoRow2s')}</td></tr>
                        <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:0.5rem;">${t('fnHowtoRow3p')}</td><td style="padding:0.5rem;color:#6b7280;">${t('fnHowtoRow3c')}</td><td style="padding:0.5rem;color:#16a34a;font-weight:500;">${t('fnHowtoRow3s')}</td></tr>
                        <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:0.5rem;">${t('fnHowtoRow4p')}</td><td style="padding:0.5rem;color:#6b7280;">${t('fnHowtoRow4c')}</td><td style="padding:0.5rem;color:#16a34a;font-weight:500;">${t('fnHowtoRow4s')}</td></tr>
                        <tr><td style="padding:0.5rem;">${t('fnHowtoRow5p')}</td><td style="padding:0.5rem;color:#6b7280;">${t('fnHowtoRow5c')}</td><td style="padding:0.5rem;color:#16a34a;font-weight:500;">${t('fnHowtoRow5s')}</td></tr>
                    </tbody>
                </table>
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>${t('fnHowtoExample')}</div>
                <pre style="background:#f9fafb;border-radius:8px;padding:0.75rem;font-size:0.75rem;line-height:1.6;overflow-x:auto;white-space:pre-wrap;">Функция "Менеджер по продажам"
├── Руководитель: Мария Коваль (принимает решения по функции)
├── Исполнители: Мария, Иван, Олег (3 человека)
├── Регулярные задачи:
│   ├── Обзвон лидов — ежедневно 9:00–10:00 (5 ч/неделю)
│   └── Заполнение CRM — ежедневно 18:00–18:30 (2.5 ч/неделю)
├── Еженедельная нагрузка регулярными: 7.5 ч
└── Сейчас активных задач: 12</pre>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>${t('fnHowtoReplaceTitle')}</div>
                ${replaceRows}
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>${t('fnHowtoConnections')}</div>
                <div style="background:#f9fafb;border-radius:8px;padding:0.75rem;font-size:0.75rem;line-height:1.6;overflow-x:auto;white-space:pre-wrap;font-family:monospace;">${t('fnHowtoConnPre')}</div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>${t('fnHowtoSmartAssign')}</div>
                <div style="background:#f9fafb;border-radius:8px;padding:0.75rem;font-size:0.8rem;line-height:1.8;">
                    <div style="margin-bottom:0.5rem;">${t('fnHowtoSmartAssignDesc')}</div>
                    <div style="font-family:monospace;background:#1e293b;color:#86efac;padding:0.5rem 0.75rem;border-radius:6px;font-size:0.75rem;">
                        нагрузка = активные задачи + просроченные × 2<br>
                        Менеджер А: 5 активных + 1 просроченная = <strong style="color:#fca5a5;">7</strong><br>
                        Менеджер Б: 3 активных + 0 просроченных = <strong style="color:#86efac;">3 ← ВЫБИРАЕТСЯ</strong><br>
                        Менеджер В: 4 активных + 2 просроченных = <strong style="color:#fca5a5;">8</strong>
                    </div>
                    <div style="margin-top:0.5rem;color:#6b7280;font-size:0.75rem;">Просроченные × 2 — потому что они важнее и занимают больше внимания</div>
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>${t('fnHowtoSetupTitle')}</div>
                ${setupRows}
                <div style="margin-top:1rem;">
                    <button class="btn btn-success" onclick="const p=document.getElementById('functionsHowtoPanel');if(p)p.style.display='none';openFunctionModal();">
                        <i data-lucide="plus" class="icon icon-sm"></i> ${window.t('addFunction') || 'Додати функцію'}
                    </button>
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.25rem;color:#374151;display:flex;align-items:center;gap:6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    ${t('fnHowtoGlossaryTitle')}
                </div>
                <div style="font-size:0.75rem;color:#6b7280;margin-bottom:0.75rem;">${t('fnHowtoGlossaryHint')}</div>
                <div style="display:flex;flex-direction:column;gap:6px;">${glossaryItems}</div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.25rem;color:#374151;display:flex;align-items:center;gap:6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    ${t('fnHowtoConnectionsTitle')}
                </div>
                <div style="font-size:0.75rem;color:#6b7280;margin-bottom:0.75rem;">${t('fnHowtoConnectionsHint')}</div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;flex-direction:column;gap:6px;">
                ${(function() {
                    var t = window.t;
                    function infoRow(label, text) {
                        return '<div style="display:flex;gap:8px;padding:4px 0;font-size:0.75rem;"><span style="min-width:52px;color:#9ca3af;flex-shrink:0;">' + label + '</span><span style="color:#374151;">' + text + '</span></div>';
                    }
                    var rows = [
                        [t('fnConn0title'), t('fnConn0prob'), t('fnConn0how'), t('fnConn0res'), t('fnConn0loss')],
                        [t('fnConn1title'), t('fnConn1prob'), t('fnConn1how'), t('fnConn1res'), t('fnConn1loss')],
                        [t('fnConn2title'), t('fnConn2prob'), t('fnConn2how'), t('fnConn2res'), t('fnConn2loss')],
                        [t('fnConn3title'), t('fnConn3prob'), t('fnConn3how'), t('fnConn3res'), t('fnConn3loss')],
                        [t('fnConn4title'), t('fnConn4prob'), t('fnConn4how'), t('fnConn4res'), t('fnConn4loss')],
                        [t('fnConn5title'), t('fnConn5prob'), t('fnConn5how'), t('fnConn5res'), t('fnConn5loss')],
                    ];
                    return rows.map(function(row) {
                        return '<div style="border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;">'
                            + '<div onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'block\'?\'none\':\'block\';this.querySelector(\'.chv2\').style.transform=this.nextElementSibling.style.display===\'block\'?\'rotate(180deg)\':\'rotate(0deg)\'" style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0.75rem;cursor:pointer;background:#fafafa;gap:8px;">'
                            + '<div><div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;"><span style="font-size:0.8rem;font-weight:600;color:#0369a1;background:#e0f2fe;padding:2px 7px;border-radius:4px;">' + row[0] + '</span></div>'
                            + '<div style="font-size:0.73rem;color:#6b7280;">' + row[1] + '</div></div>'
                            + '<span class="chv2" style="font-size:10px;color:#9ca3af;transition:transform 0.2s;flex-shrink:0;">▼</span>'
                            + '</div>'
                            + '<div style="display:none;padding:0.75rem;border-top:1px solid #f3f4f6;background:white;">'
                            + '<div style="font-size:0.78rem;color:#374151;line-height:1.6;">' + row[2] + '</div>'
                            + '<div style="background:#f0fdf4;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.75rem;color:#166534;line-height:1.5;">' + row[3] + '</div>'
                            + '<div style="background:#fef2f2;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.75rem;color:#991b1b;line-height:1.5;">' + row[4] + '</div>'
                            + '</div></div>';
                    }).join('');
                })()}
                </div>
            </div>

            <!-- МЕХАНІКИ СИСТЕМИ -->
            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;display:flex;align-items:center;gap:6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    ${t('fnHowtoMechanicsTitle')}
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                ${(function() {
                    var t = window.t;
                    function miniRow(minW, label, text) {
                        return '<div style="display:flex;gap:8px;padding:4px 0;font-size:0.75rem;"><span style="min-width:' + minW + ';color:#9ca3af;flex-shrink:0;">' + label + '</span><span style="color:#374151;">' + text + '</span></div>';
                    }
                    var escRows = miniRow('52px', t('fnHowtoTimeLabel0'), t('fnHowtoEsc0'))
                        + miniRow('52px', t('fnHowtoTimeLabel24'), t('fnHowtoEsc24'))
                        + miniRow('52px', t('fnHowtoTimeLabel48'), t('fnHowtoEsc48'))
                        + miniRow('52px', t('fnHowtoTimeLabelSame'), t('fnHowtoEscSame'));
                    var tempRows = miniRow('52px', t('fnHowtoTempLabelStep1'), t('fnHowtoTempStep1'))
                        + miniRow('52px', t('fnHowtoTempLabelActive'), t('fnHowtoTempActive'))
                        + miniRow('52px', t('fnHowtoTempLabelDay'), t('fnHowtoTempDay'))
                        + miniRow('52px', t('fnHowtoTempLabelAuto'), t('fnHowtoTempAuto'));
                    var weeklyRows = miniRow('68px', t('fnHowtoLabelTasks'), t('fnHowtoWeeklyTasks'))
                        + miniRow('68px', t('fnHowtoLabelOverdue'), t('fnHowtoWeeklyOverdue'))
                        + miniRow('68px', t('fnHowtoLabelMetrics'), t('fnHowtoWeeklyMetrics'))
                        + miniRow('68px', t('fnHowtoLabelProcesses'), t('fnHowtoWeeklyProcesses'));
                    return '<div style="border:1px solid #fee2e2;border-radius:8px;padding:0.75rem;background:#fff5f5;">'
                        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem;"><span style="width:8px;height:8px;border-radius:50%;background:#ef4444;flex-shrink:0;"></span><span style="font-size:0.82rem;font-weight:600;color:#111;">' + t('fnHowtoEscTitle') + '</span></div>'
                        + '<p style="font-size:0.75rem;color:#6b7280;line-height:1.5;margin:0 0 0.6rem;">' + t('fnHowtoEscDesc') + '</p>'
                        + escRows + '</div>'
                        + '<div style="border:1px solid #d1fae5;border-radius:8px;padding:0.75rem;background:#f0fdf4;">'
                        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;flex-shrink:0;"></span><span style="font-size:0.82rem;font-weight:600;color:#111;">' + t('fnHowtoTempOwnerTitle') + '</span></div>'
                        + '<p style="font-size:0.75rem;color:#6b7280;line-height:1.5;margin:0 0 0.6rem;">' + t('fnHowtoTempOwnerDesc') + '</p>'
                        + tempRows + '</div>'
                        + '<div style="border:1px solid #bfdbfe;border-radius:8px;padding:0.75rem;background:#eff6ff;">'
                        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem;"><span style="width:8px;height:8px;border-radius:50%;background:#2563eb;flex-shrink:0;"></span><span style="font-size:0.82rem;font-weight:600;color:#111;">' + t('fnHowtoWeeklyTitle') + '</span></div>'
                        + '<p style="font-size:0.75rem;color:#6b7280;line-height:1.5;margin:0 0 0.6rem;">' + t('fnHowtoWeeklyDesc') + '</p>'
                        + weeklyRows + '</div>';
                })()}
                </div>
            </div>

            <div style="margin-top:1rem;">
                <button class="btn btn-success" onclick="const p=document.getElementById('functionsHowtoPanel');if(p)p.style.display='none';openFunctionModal();">
                    <i data-lucide="plus" class="icon icon-sm"></i> ${window.t('addFunction') || 'Додати функцію'}
                </button>
            </div>

            </div>`;
        }


        // =====================
        // EMPLOYEE ONBOARDING (ТЗ пріоритет 10)
        // 9 автоматичних кроків онбордингу з даних функції
        // =====================
        window.openEmployeeOnboarding = function(funcId) {
            const f = functions.find(fn => fn.id === funcId);
            if (!f) return;

            const modal = document.getElementById('employeeOnboardingModal');
            const body = document.getElementById('employeeOnboardingBody');
            if (!modal || !body) return;

            const ownerUser = users.find(u => u.id === f.headId);
            const funcUsers = users.filter(u => f.assigneeIds?.includes(u.id));
            const funcRegularTasks = (typeof regularTasks !== 'undefined') ? regularTasks.filter(rt => rt.function === f.name) : [];
            const funcTasks = (typeof tasks !== 'undefined') ? tasks.filter(t => t.function === f.name && t.status !== 'done').slice(0, 5) : [];
            const funcLessons = (typeof window._learningLessons !== 'undefined') ? window._learningLessons.filter(l => f.lessonIds?.includes(l.id)) : [];

            // Resolve reportsTo function
            const reportsToFunc = f.reportsTo ? functions.find(fn => fn.id === f.reportsTo) : null;

            // Build 9 steps
            const steps = [
                {
                    num: 1, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', title: 'Добро пожаловать',
                    content: `<p style="font-size:0.9rem;margin:0 0 0.5rem;">Твоя функція: <strong>${esc(f.name)}</strong></p>
                    <div style="background:#f0fdf4;border-left:3px solid #22c55e;padding:0.5rem 0.75rem;border-radius:0 8px 8px 0;font-size:0.85rem;font-style:italic;">${esc(f.result || 'ЦКП не заповнений — попроси керівника функції оновити.')}</div>`
                },
                {
                    num: 2, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', title: 'Твой руководитель',
                    content: ownerUser
                        ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:#f8fafc;border-radius:8px;">
                            <div style="width:40px;height:40px;background:#e0e7ff;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4338ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                            <div><div style="font-weight:700;">${esc(ownerUser.name || ownerUser.email)}</div>
                            <div style="font-size:0.8rem;color:#6b7280;">${esc(f.contacts || ownerUser.email || '')}</div></div></div>`
                        : `<p style="color:#ef4444;display:flex;align-items:center;gap:0.4rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Владелец функции не назначен. Обратитесь к администратору.</p>`
                },
                {
                    num: 3, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', title: 'Твоя функция',
                    content: `<p style="font-size:0.85rem;color:#374151;margin:0 0 0.5rem;">${esc(f.description || 'Опис функції не заповнений.')}</p>
                    ${f.keywords?.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">${f.keywords.map(k => `<span style="background:#eff6ff;color:#1d4ed8;border-radius:4px;padding:2px 8px;font-size:0.75rem;">${esc(k)}</span>`).join('')}</div>` : ''}`
                },
                {
                    num: 4, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', title: 'Место в компании',
                    content: reportsToFunc
                        ? `<p style="font-size:0.85rem;">Функція <strong>${esc(f.name)}</strong> підпорядковується: <strong>${esc(reportsToFunc.name)}</strong></p>
                           <p style="font-size:0.82rem;color:#6b7280;">Власник вищої функції: ${esc(users.find(u=>u.id===reportsToFunc.headId)?.name || '—')}</p>`
                        : `<p style="font-size:0.85rem;color:#6b7280;">Функция не имеет явного подчинения. Просмотрите схему в разделе <strong>Система → Структура → Канвас</strong>.</p>`
                },
                {
                    num: 5, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', title: 'С кем взаимодействуешь',
                    content: f.communicatesWith?.length
                        ? `<div style="display:flex;flex-direction:column;gap:0.4rem;">${f.communicatesWith.map(cw => {
                            const cf = functions.find(fn => fn.id === cw.functionId);
                            if (!cf) return '';
                            const cfOwner = users.find(u => u.id === cf.headId);
                            const arrow = cw.direction === 'outgoing' ? '→' : cw.direction === 'incoming' ? '←' : '↔';
                            return `<div style="padding:0.5rem 0.75rem;background:#f3f0ff;border-radius:8px;font-size:0.82rem;">
                                <strong>${arrow} ${esc(cf.name)}</strong>${cfOwner ? ` (${esc(cfOwner.name || cfOwner.email)})` : ''}
                                ${cw.topics?.length ? `<span style="color:#7c3aed;"> — ${esc(cw.topics.join(', '))}</span>` : ''}
                            </div>`;
                        }).filter(Boolean).join('')}</div>`
                        : `<p style="font-size:0.85rem;color:#6b7280;">Коммуникационные линии не настроены. Просмотрите схему в Структуре.</p>`
                },
                {
                    num: 6, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>', title: 'Регулярные задачи',
                    content: funcRegularTasks.length
                        ? `<div style="display:flex;flex-direction:column;gap:0.3rem;">${funcRegularTasks.slice(0,5).map(rt => {
                            const time = (rt.timeStart || rt.time || '') + (rt.timeEnd ? '–'+rt.timeEnd : '');
                            const period = rt.period === 'daily' ? 'ежедневно' : rt.period === 'weekly' ? 'еженедельно' : 'ежемесячно';
                            return `<div style="padding:0.4rem 0.6rem;background:#f0f9ff;border-radius:6px;font-size:0.82rem;">
                                <strong>${esc(rt.title)}</strong> <span style="color:#6b7280;">${period}${time ? ' · '+time : ''}</span></div>`;
                        }).join('')}${funcRegularTasks.length > 5 ? `<p style="font-size:0.75rem;color:#9ca3af;">+${funcRegularTasks.length-5} більше...</p>` : ''}</div>`
                        : `<p style="font-size:0.85rem;color:#6b7280;">Регулярных задач пока нет.</p>`
                },
                {
                    num: 7, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', title: 'Первые задачи',
                    content: funcTasks.length
                        ? `<div style="display:flex;flex-direction:column;gap:0.3rem;">${funcTasks.map(t => `<div style="padding:0.4rem 0.6rem;background:#f9fafb;border-radius:6px;font-size:0.82rem;display:flex;justify-content:space-between;">
                            <span>${esc(t.title)}</span>
                            <span style="color:#6b7280;font-size:0.75rem;">${t.deadlineDate || ''}</span></div>`).join('')}</div>`
                        : `<p style="font-size:0.85rem;color:#6b7280;">Активных задач в этой функции нет.</p>`
                },
                {
                    num: 8, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', title: 'Обучение',
                    content: funcLessons.length
                        ? `<p style="font-size:0.85rem;margin:0 0 0.5rem;">Уроки для твоей функции (${funcLessons.length}):</p>
                           <div style="display:flex;flex-direction:column;gap:0.3rem;">${funcLessons.slice(0,4).map(l => `<div style="padding:0.4rem 0.6rem;background:#fdf4ff;border-radius:6px;font-size:0.82rem;display:flex;align-items:center;gap:0.4rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> ${esc(l.title || l.name || '')}</div>`).join('')}</div>`
                        : `<p style="font-size:0.85rem;color:#6b7280;">Перейди в раздел <strong>Обучение</strong> и пройди уроки, относящиеся к твоей роли.</p>`
                },
                {
                    num: 9, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', title: 'Команда функции',
                    content: funcUsers.length
                        ? `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">${funcUsers.map(u => `<div style="padding:0.4rem 0.75rem;background:#f0fdf4;border-radius:8px;font-size:0.82rem;display:flex;align-items:center;gap:0.4rem;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <span>${esc(u.name || u.email)}</span></div>`).join('')}</div>`
                        : `<p style="font-size:0.85rem;color:#6b7280;">Участников функции не найдено.</p>`
                }
            ];

            // Render checklist
            body.innerHTML = `
                <div style="margin-bottom:1rem;padding:0.75rem;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;color:white;">
                    <div style="font-size:0.75rem;opacity:0.8;margin-bottom:2px;">Функция</div>
                    <div style="font-weight:700;font-size:1rem;">${esc(f.name)}</div>
                    ${f.result ? `<div style="font-size:0.78rem;opacity:0.85;margin-top:4px;font-style:italic;">${esc(f.result)}</div>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:0.75rem;">
                ${steps.map(s => `
                    <details style="background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
                        <summary style="display:flex;align-items:center;gap:0.6rem;padding:0.65rem 0.9rem;cursor:pointer;font-weight:600;font-size:0.88rem;list-style:none;user-select:none;">
                            <span style="min-width:24px;height:24px;background:#e0e7ff;color:#4338ca;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;">${s.num}</span>
                            <span style="font-size:1rem;flex-shrink:0;">${s.icon}</span>
                            <span style="flex:1;">${s.title}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>
                        </summary>
                        <div style="padding:0.6rem 0.9rem 0.75rem;border-top:1px solid #e5e7eb;">
                            ${s.content}
                        </div>
                    </details>
                `).join('')}
                </div>
                ${f.onboardingChecklist?.length ? `
                <div style="margin-top:1rem;padding:0.75rem;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;">
                    <div style="font-weight:600;font-size:0.85rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.4rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Специфический чеклист функции</div>
                    ${f.onboardingChecklist.map(item => `<div style="display:flex;align-items:center;gap:0.5rem;padding:0.3rem 0;font-size:0.82rem;">
                        <input type="checkbox" style="accent-color:#f59e0b;"> <span>${esc(item)}</span>
                    </div>`).join('')}
                </div>` : ''}
            `;

            modal.style.display = 'block';
            if (typeof refreshIcons === 'function') refreshIcons();
        };
