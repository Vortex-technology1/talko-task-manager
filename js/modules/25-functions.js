// =====================
        // FUNCTIONS
        // =====================
'use strict';
        function openFunctionModal(id = null) {
            if (!isManagerOrAbove()) {
                showToast(window.t('noPermissionTask'), 'error');
                return;
            }

            document.getElementById('functionModal').style.display = 'block';
            updateFunctionAssignees();
            
            if (id) {
                editingId = id;
                const f = functions.find(x => x.id === id);
                if (f) {
                    document.getElementById('functionModalTitle').textContent = window.t('editTask');
                    document.getElementById('functionName').value = f.name || '';
                    document.getElementById('functionHead').value = f.headId || '';
                    document.getElementById('functionDescription').value = f.description || '';
                    setTimeout(() => {
                        document.querySelectorAll('#functionAssignees input').forEach(cb => {
                            cb.checked = f.assigneeIds?.includes(cb.value);
                        });
                    }, 50);
                }
            } else {
                editingId = null;
                document.getElementById('functionModalTitle').textContent = window.t('newFunction');
                document.getElementById('functionForm').reset();
            }
        }

        function updateFunctionAssignees() {
            const c = document.getElementById('functionAssignees');
            const h = document.getElementById('functionHead');
            c.innerHTML = users.map(u => `<label class="assignee-checkbox"><input type="checkbox" value="${esc(u.id)}">${esc(u.name || u.email)}</label>`).join('');
            h.innerHTML = `<option value="">${window.t('select')}</option>` + users.map(u => `<option value="${esc(u.id)}">${esc(u.name || u.email)}</option>`).join('');
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
                    if (rt.period === 'daily') daysPerWeek = 5;
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
                        <div style="text-align:center;color:#9ca3af;font-size:0.82rem;padding:0.5rem;">Завантаження...</div>
                    </div>`;

                return `
                <div class="function-card" style="cursor:pointer;" onclick="toggleFuncRegular('${escId(f.id)}', event)">
                    <div class="function-header">
                        <div class="function-title"><i data-lucide="settings" class="icon icon-sm"></i> ${esc(f.name)}</div>
                    </div>
                    ${f.description ? `<div class="function-description">${esc(f.description)}</div>` : ''}
                    ${mergedInfo}
                    <div class="function-assignees">
                        ${f.headName ? `<span class="assignee-badge head"><i data-lucide="crown" class="icon icon-sm"></i> ${esc(f.headName)}</span>` : ''}
                        ${f.assigneeNames?.filter(n => n !== f.headName).map(n => `<span class="assignee-badge">${esc(n)}</span>`).join('') || ''}
                    </div>
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
                            <button class="btn btn-small" onclick="openRegularTaskModal(null, '${escId(f.name)}')" title="${window.t('addRegularToFunction') || 'Додати регулярне завдання'}" style="background:#f0f9ff;color:#0369a1;border-color:#bae6fd;">
                                <i data-lucide="repeat" class="icon icon-sm"></i>+
                            </button>
                            <button class="btn btn-small" onclick="openFunctionModal('${escId(f.id)}')"><i data-lucide="pencil" class="icon icon-sm"></i></button>
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
            refreshIcons();
            
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
                refreshIcons();
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
                el.innerHTML = '<div style="color:#ef4444;padding:0.5rem;font-size:0.82rem;">' + window.t('finModuleNotLoaded2') + '</div>';
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
            return `<div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1rem;">

            <div style="background:linear-gradient(135deg,#1e3a5f,#0f2040);border-radius:14px;padding:1.25rem 1.5rem;color:white;position:relative;">
                <button onclick="toggleFunctionsHowto()" style="position:absolute;top:0.75rem;right:0.75rem;background:rgba(255,255,255,0.15);border:none;color:white;border-radius:6px;padding:0.2rem 0.5rem;cursor:pointer;font-size:0.8rem;">✕</button>
                <div style="font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Функції — це ролі, а не люди</div>
                <div style="color:#93c5fd;font-size:0.88rem;line-height:1.5;">Завдання ставляться функції — система сама знає хто її виконує. Змінилась людина — задачі й процеси продовжують працювати.</div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Яку проблему вирішує</div>
                <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                    <thead><tr style="background:#f9fafb;">
                        <th style="padding:0.5rem;text-align:left;color:#ef4444;border-bottom:2px solid #fecaca;">ПРОБЛЕМА</th>
                        <th style="padding:0.5rem;text-align:left;color:#f59e0b;border-bottom:2px solid #fde68a;">НАСЛІДОК</th>
                        <th style="padding:0.5rem;text-align:left;color:#16a34a;border-bottom:2px solid #bbf7d0;">РІШЕННЯ</th>
                    </tr></thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:0.5rem;">Завдання ставиться людині Іванову</td>
                            <td style="padding:0.5rem;color:#6b7280;">Іванов звільнився — 40 задач підвисли</td>
                            <td style="padding:0.5rem;color:#16a34a;font-weight:500;">Завдання ставиться функції — при заміні людини задачі до нового автоматично</td>
                        </tr>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:0.5rem;">Власник не знає хто вільний</td>
                            <td style="padding:0.5rem;color:#6b7280;">Ставить задачі вручну, не рівномірно</td>
                            <td style="padding:0.5rem;color:#16a34a;font-weight:500;">Smart Assign — система вибирає найменш завантаженого</td>
                        </tr>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:0.5rem;">Регулярна робота тримається в голові</td>
                            <td style="padding:0.5rem;color:#6b7280;">Забули → не зробили → проблема</td>
                            <td style="padding:0.5rem;color:#16a34a;font-weight:500;">Регулярне завдання прив'язане до функції → виконавець отримує задачу автоматично</td>
                        </tr>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:0.5rem;">Не видно реальне навантаження</td>
                            <td style="padding:0.5rem;color:#6b7280;">Хтось перевантажений, хтось пустує</td>
                            <td style="padding:0.5rem;color:#16a34a;font-weight:500;">Система рахує год/тиждень і активних задач по кожній людині</td>
                        </tr>
                        <tr>
                            <td style="padding:0.5rem;">Процеси "ламаються" при заміні людей</td>
                            <td style="padding:0.5rem;color:#6b7280;">Новий не знає що робити</td>
                            <td style="padding:0.5rem;color:#16a34a;font-weight:500;">Крок процесу = функція. Змінив людину → процеси продовжують працювати</td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Що таке функція (приклад)</div>
                <pre style="background:#f9fafb;border-radius:8px;padding:0.75rem;font-size:0.75rem;line-height:1.6;overflow-x:auto;white-space:pre-wrap;">Функція "Менеджер з продажів"
├── Керівник: Марія Коваль (приймає рішення по функції)
├── Виконавці: Марія, Іван, Олег (3 людини)
├── Регулярні завдання:
│   ├── Обдзвін лідів — щодня 9:00–10:00 (5 год/тиждень)
│   └── Заповнення CRM — щодня 18:00–18:30 (2.5 год/тиждень)
├── Тижневе навантаження регулярними: 7.5 год
└── Зараз активних задач: 12</pre>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>Що відбувається при заміні виконавця</div>
                ${[
                    ['1','Іванов звільняється','Відкриваєш функцію → прибираєш Іванова, додаєш Сидорова'],
                    ['2','Регулярні завдання','Всі регулярні завдання функції тепер виконує Сидоров автоматично'],
                    ['3','Бізнес-процеси','Всі кроки процесів де була ця функція — автоматично оновлюються'],
                    ['4','Smart Assign','Тепер враховує Сидорова при розподілі задач'],
                ].map(([n,title,desc]) => `<div style="display:flex;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid #f9fafb;align-items:flex-start;">
                    <div style="min-width:24px;height:24px;background:#0284c7;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">${n}</div>
                    <div><div style="font-weight:500;font-size:0.82rem;">${title}</div><div style="font-size:0.78rem;color:#6b7280;">${desc}</div></div>
                </div>`).join('')}
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Взаємозв'язки</div>
                <pre style="background:#f9fafb;border-radius:8px;padding:0.75rem;font-size:0.75rem;line-height:1.6;overflow-x:auto;white-space:pre-wrap;">ФУНКЦІЯ
│
├──→ РЕГУЛЯРНІ ЗАВДАННЯ — щодня/щотижня задача до виконавця автоматично
├──→ ЗАВДАННЯ — task.function = назва; фільтрація, аналітика, Smart Assign
├──→ БІЗНЕС-ПРОЦЕСИ — крок = функція; при запуску Smart Assign з виконавців
├──→ КООРДИНАЦІЇ — фільтр задач "по функціях учасників"
├──→ СТРУКТУРА БІЗНЕСУ — канвас де функції з'єднані стрілками
└──→ ФІНАНСИ — витрати і доходи по функції</pre>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Smart Assign — формула</div>
                <div style="background:#f9fafb;border-radius:8px;padding:0.75rem;font-size:0.8rem;line-height:1.8;">
                    <div style="margin-bottom:0.5rem;">При постановці задачі — система рахує навантаження кожного виконавця функції:</div>
                    <div style="font-family:monospace;background:#1e293b;color:#86efac;padding:0.5rem 0.75rem;border-radius:6px;font-size:0.75rem;">
                        навантаження = активні задачі + прострочені × 2<br>
                        Менеджер А: 5 активних + 1 прострочена = <strong style="color:#fca5a5;">7</strong><br>
                        Менеджер Б: 3 активних + 0 прострочених = <strong style="color:#86efac;">3 ← ОБИРАЄТЬСЯ</strong><br>
                        Менеджер В: 4 активних + 2 прострочених = <strong style="color:#fca5a5;">8</strong>
                    </div>
                    <div style="margin-top:0.5rem;color:#6b7280;font-size:0.75rem;">Прострочені × 2 — бо вони важливіші і займають більше уваги</div>
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Покрокове налаштування</div>
                ${[
                    ['1','+ Функція','Назва ролі в компанії (не посада — роль: "Менеджер продажів", а не "Іванов Іван")'],
                    ['2','Вибери керівника і виконавців','1 або більше людей з команди'],
                    ['3','Кнопка repeat+ на картці функції','Додай регулярну роботу з розкладом і часом виконання'],
                    ['4','Система → Процеси','В кроках шаблонів вибери функції (не людей)'],
                    ['5','При постановці задачі','Вибери функцію → Smart Assign автоматично підбере виконавця'],
                ].map(([n,title,desc]) => `<div style="display:flex;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid #f9fafb;align-items:flex-start;">
                    <div style="min-width:24px;height:24px;background:#22c55e;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">${n}</div>
                    <div><div style="font-weight:500;font-size:0.82rem;">${title}</div><div style="font-size:0.78rem;color:#6b7280;">${desc}</div></div>
                </div>`).join('')}
                <div style="margin-top:1rem;">
                    <button class="btn btn-success" onclick="openFunctionModal(); toggleFunctionsHowto();">
                        <i data-lucide="plus" class="icon icon-sm"></i> Додати функцію
                    </button>
                </div>
            </div>

            </div>`;
        }
