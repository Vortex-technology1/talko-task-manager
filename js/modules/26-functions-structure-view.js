// =====================
        // FUNCTIONS STRUCTURE VIEW
        // =====================
'use strict';
        let currentFunctionsView = 'cards';
        const DEFAULT_CATEGORIES = [window.t('funcCatManagement'), 'Люди', window.t('funcCatEngagement'), window.t('funcCatSales'), window.t('funcCatFinance'), window.t('funcCatPrep'), window.t('funcCatExecution'), window.t('funcCatLogistics')];
        
        function setFunctionsView(view) {
            currentFunctionsView = view;
            document.querySelectorAll('[data-fview]').forEach(b => {
                b.style.background = b.dataset.fview === view ? 'white' : 'transparent';
                b.style.fontWeight = b.dataset.fview === view ? '600' : '400';
            });
            document.getElementById('functionsContainer').style.display = view === 'cards' ? '' : 'none';
            document.getElementById('functionsStructureContainer').style.display = view === 'structure' ? '' : 'none';
            if (view === 'structure') renderFunctionsStructure();
            refreshIcons();
        }
        
        function getStructureCategories() {
            // Get categories from functions + defaults
            const fromFunctions = functions.filter(f => f.category).map(f => f.category);
            const saved = JSON.parse(localStorage.getItem('structCategories_' + (currentCompany || '')) || 'null');
            if (saved) return saved;
            // Build from existing + defaults
            const cats = [...new Set([...DEFAULT_CATEGORIES, ...fromFunctions])];
            return cats;
        }
        
        function saveStructureCategories(cats) {
            localStorage.setItem('structCategories_' + (currentCompany || ''), JSON.stringify(cats));
        }
        
        function renderFunctionsStructure() {
            const container = document.getElementById('functionsStructureContainer');
            const categories = getStructureCategories();
            const activeFunctions = functions.filter(f => f.status !== 'archived');
            const todayStr = getLocalDateStr(new Date());
            
            let html = '<div class="struct-board">';
            
            categories.forEach((cat, colIdx) => {
                const colFuncs = activeFunctions.filter(f => f.category === cat);
                const unassigned = colIdx === 0 ? activeFunctions.filter(f => !f.category || !categories.includes(f.category)) : [];
                const allFuncs = [...colFuncs, ...unassigned];
                
                // Aggregate stats
                let totalPeople = 0, totalTasks = 0, totalRegular = 0, totalWeeklyMin = 0;
                allFuncs.forEach(f => {
                    totalPeople += f.assigneeIds?.length || 0;
                    totalTasks += tasks.filter(t => t.function === f.name && t.status !== 'done').length;
                    const fReg = regularTasks.filter(rt => rt.function === f.name);
                    totalRegular += fReg.length;
                    fReg.forEach(rt => {
                        let dur = rt.estimatedTime || 60;
                        if (rt.timeStart && rt.timeEnd) {
                            const [sh,sm] = rt.timeStart.split(':').map(Number);
                            const [eh,em] = rt.timeEnd.split(':').map(Number);
                            dur = (eh*60+em)-(sh*60+sm);
                            if (dur <= 0) dur = 60;
                        }
                        let dpw = 1;
                        if (rt.period === 'daily') dpw = 5;
                        else if (rt.period === 'weekly' && rt.daysOfWeek) dpw = rt.daysOfWeek.length;
                        else if (rt.period === 'monthly') dpw = 0.25;
                        totalWeeklyMin += dur * dpw;
                    });
                });
                const weeklyHrs = Math.round(totalWeeklyMin / 60 * 10) / 10;
                
                html += `
                <div class="struct-column" data-category="${esc(cat)}">
                    <div class="struct-col-header">
                        <span class="struct-col-title" contenteditable="true" onblur="renameCategory(${colIdx}, this.textContent.trim())" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}">${esc(cat)}</span>
                        <button onclick="removeCategory(${colIdx})" style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:2px;" title="${window.t('delete')}"><i data-lucide="x" class="icon icon-sm"></i></button>
                    </div>
                    <div class="struct-col-stats">
                        <span><i data-lucide="users" class="icon icon-sm"></i> ${totalPeople}</span>
                        <span><i data-lucide="file-text" class="icon icon-sm"></i> ${totalTasks}</span>
                        <span><i data-lucide="repeat" class="icon icon-sm"></i> ${totalRegular}</span>
                        ${weeklyHrs > 0 ? `<span style="color:#0284c7;font-weight:600;"><i data-lucide="clock" class="icon icon-sm"></i> ${weeklyHrs}</span>` : ''}
                    </div>
                    <div class="struct-col-body" data-col-idx="${colIdx}" data-cat="${esc(cat)}"
                        ondragover="event.preventDefault();this.classList.add('drag-over');"
                        ondragleave="this.classList.remove('drag-over');"
                        ondrop="dropFunction(event, this);">
                        ${allFuncs.map(f => {
                            const fTasks = tasks.filter(t => t.function === f.name && t.status !== 'done').length;
                            const fReg = regularTasks.filter(rt => rt.function === f.name).length;
                            const overdue = tasks.filter(t => t.function === f.name && t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done' && t.status !== 'review').length;
                            return `
                            <div class="struct-func-card" draggable="true" data-func-id="${escId(f.id)}"
                                ondragstart="dragFunction(event, '${escId(f.id)}')"
                                ondragend="this.classList.remove('dragging');">
                                <div style="font-weight:600;margin-bottom:0.25rem;">${esc(f.name)}</div>
                                <div style="display:flex;gap:0.5rem;font-size:0.72rem;color:#6b7280;">
                                    <span><i data-lucide="users" class="icon icon-sm"></i> ${f.assigneeIds?.length || 0}</span>
                                    <span><i data-lucide="file-text" class="icon icon-sm"></i> ${fTasks}</span>
                                    <span><i data-lucide="repeat" class="icon icon-sm"></i> ${fReg}</span>
                                    ${overdue > 0 ? `<span style="color:#ef4444;font-weight:600;display:inline-flex;align-items:center;gap:2px;"><i data-lucide="alert-triangle" class="icon icon-sm"></i> ${overdue}</span>` : ''}
                                </div>
                                ${f.assigneeNames?.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:0.3rem;">${f.assigneeNames.slice(0,2).map(n => `<span style="font-size:0.65rem;background:#e8f5e9;color:#2e7d32;padding:1px 5px;border-radius:4px;">${esc(n)}</span>`).join('')}${f.assigneeNames.length > 2 ? `<span style="font-size:0.65rem;color:#9ca3af;">+${f.assigneeNames.length-2}</span>` : ''}</div>` : ''}
                            </div>`;
                        }).join('')}
                        ${allFuncs.length === 0 ? `<div style="text-align:center;padding:1rem;color:#d1d5db;font-size:0.78rem;">${window.t('dragHere')}</div>` : ''}
                    </div>
                </div>`;
            });
            
            html += `
                <div class="struct-add-col" onclick="addCategory()">
                    <span><i data-lucide="plus" class="icon icon-sm"></i> ${window.t('addCategory')}</span>
                </div>
            </div>`;
            
            container.innerHTML = html;
            refreshIcons();
        }
        
        let draggedFuncId = null;
        
        function dragFunction(event, funcId) {
            draggedFuncId = funcId;
            event.target.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
        }
        
        async function dropFunction(event, target) {
            event.preventDefault();
            target.classList.remove('drag-over');
            if (!draggedFuncId) return;
            
            const newCategory = target.dataset.cat;
            const func = functions.find(f => f.id === draggedFuncId);
            if (!func || func.category === newCategory) { draggedFuncId = null; return; }
            
            // Optimistic update
            func.category = newCategory;
            renderFunctionsStructure();
            
            // Save to Firestore
            try {
                await db.collection('companies').doc(currentCompany).collection('functions').doc(draggedFuncId).update({ category: newCategory });
            } catch(e) {
                console.error('Error updating category:', e);
                showToast(window.t('saveError'), 'error');
            }
            draggedFuncId = null;
        }
        
        async function addCategory() {
            const name = await (window.showInputModal ? showInputModal(window.t('categoryName'), '', {placeholder: 'Назва категорії'}) : (async()=>prompt(window.t('categoryName')))());
            if (!name || !name.trim()) return;
            const cats = getStructureCategories();
            if (cats.includes(name.trim())) { showToast(window.t('categoryExists'), 'warning'); return; }
            cats.push(name.trim());
            saveStructureCategories(cats);
            renderFunctionsStructure();
        }
        
        async function removeCategory(idx) {
            const cats = getStructureCategories();
            const cat = cats[idx];
            const funcsInCat = functions.filter(f => f.category === cat);
            if (funcsInCat.length > 0) {
                if (!await showConfirmModal((window.t('categoryHasFunctions')), { danger: true })) return;
                funcsInCat.forEach(f => { f.category = ''; });
                // Save to Firestore
                const batch = db.batch();
                funcsInCat.forEach(f => {
                    batch.update(db.collection('companies').doc(currentCompany).collection('functions').doc(f.id), { category: '' });
                });
                batch.commit().catch(e => console.error(e));
            }
            cats.splice(idx, 1);
            saveStructureCategories(cats);
            renderFunctionsStructure();
        }
        
        function renameCategory(idx, newName) {
            if (!newName) return;
            const cats = getStructureCategories();
            const oldName = cats[idx];
            if (oldName === newName) return;
            cats[idx] = newName;
            saveStructureCategories(cats);
            
            // Update functions with old category
            const funcsInCat = functions.filter(f => f.category === oldName);
            if (funcsInCat.length > 0) {
                const batch = db.batch();
                funcsInCat.forEach(f => {
                    f.category = newName;
                    batch.update(db.collection('companies').doc(currentCompany).collection('functions').doc(f.id), { category: newName });
                });
                batch.commit().catch(e => console.error(e));
            }
        }
        function openMergeFunctionsModal() {
            const list = document.getElementById('mergeFunctionsList');
            const activeFunctions = functions.filter(f => f.status !== 'archived');
            
            list.innerHTML = activeFunctions.map(f => {
                const taskCount = tasks.filter(t => t.function === f.name).length;
                const regularCount = regularTasks.filter(rt => rt.function === f.name).length;
                const assigneeCount = f.assigneeIds?.length || 0;
                return `
                    <label style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background 0.2s;" 
                           onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='transparent'">
                        <input type="checkbox" name="mergeFunction" value="${esc(f.id)}" onchange="updateMergePreview()" 
                               style="width:18px;height:18px;accent-color:var(--primary);">
                        <div style="flex:1;">
                            <div style="font-weight:500;">${esc(f.name)}</div>
                            <div style="font-size:0.8rem;color:#6b7280;">
                                ${taskCount} ${window.t('tasksCount')} · ${regularCount} ${window.t('regularTasksCount')} · ${assigneeCount} ${window.t('assigneesCount')}
                            </div>
                        </div>
                    </label>
                `;
            }).join('');
            
            document.getElementById('mergedFunctionName').value = '';
            document.getElementById('mergePreview').style.display = 'none';
            document.getElementById('executeMergeBtn').disabled = true;
            
            document.getElementById('mergeFunctionsModal').style.display = 'block';
            refreshIcons();
        }
        
        function updateMergePreview() {
            const selected = Array.from(document.querySelectorAll('input[name="mergeFunction"]:checked')).map(cb => cb.value);
            const preview = document.getElementById('mergePreview');
            const content = document.getElementById('mergePreviewContent');
            const executeBtn = document.getElementById('executeMergeBtn');
            const nameInput = document.getElementById('mergedFunctionName');
            
            if (selected.length < 2) {
                preview.style.display = 'none';
                executeBtn.disabled = true;
                return;
            }
            
            if (selected.length > 5) {
                showAlertModal(window.t('mergeSelectMaxFive'));
                return;
            }
            
            // Рахуємо статистику
            const selectedFunctions = functions.filter(f => selected.includes(f.id));
            let totalTasks = 0;
            let totalRegular = 0;
            let allAssignees = new Set();
            
            selectedFunctions.forEach(f => {
                totalTasks += tasks.filter(t => t.function === f.name).length;
                totalRegular += regularTasks.filter(rt => rt.function === f.name).length;
                f.assigneeIds?.forEach(id => allAssignees.add(id));
            });
            
            content.innerHTML = `
                <div>• <strong>${totalTasks}</strong> ${window.t('tasksCount')}</div>
                <div>• <strong>${totalRegular}</strong> ${window.t('regularTasksCount')}</div>
                <div>• <strong>${allAssignees.size}</strong> ${window.t('assigneesCount')}</div>
                <div style="margin-top:0.5rem;font-size:0.85rem;color:#059669;">
                    ${window.t('mergedFrom')}: ${selectedFunctions.map(f => f.name).join(', ')}
                </div>
            `;
            
            preview.style.display = 'block';
            executeBtn.disabled = false;
            
            // Автозаповнення назви якщо порожня
            if (!nameInput.value) {
                nameInput.value = selectedFunctions[0]?.name || '';
            }
        }
        
        async function executeMergeFunctions() {
            const selected = Array.from(document.querySelectorAll('input[name="mergeFunction"]:checked')).map(cb => cb.value);
            const newName = document.getElementById('mergedFunctionName').value.trim();
            
            if (selected.length < 2) {
                showAlertModal(window.t('mergeSelectMinTwo'));
                return;
            }
            
            if (!newName) {
                showAlertModal(window.t('mergeEnterName'));
                return;
            }
            
            const executeBtn = document.getElementById('executeMergeBtn');
            executeBtn.disabled = true;
            executeBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span>';
            
            try {
                const selectedFunctions = functions.filter(f => selected.includes(f.id));
                
                // Збираємо всіх виконавців
                let allAssigneeIds = new Set();
                let allAssigneeNames = [];
                let headId = null;
                let headName = null;
                
                selectedFunctions.forEach(f => {
                    f.assigneeIds?.forEach(id => allAssigneeIds.add(id));
                    if (f.headId && !headId) {
                        headId = f.headId;
                        headName = f.headName;
                    }
                });
                
                // Отримуємо імена всіх виконавців
                allAssigneeIds = Array.from(allAssigneeIds);
                allAssigneeNames = allAssigneeIds.map(id => {
                    const user = users.find(u => u.id === id);
                    return user?.name || user?.email || '';
                }).filter(n => n);
                
                // Створюємо нову функцію
                const mergedFunctionData = {
                    name: newName,
                    description: `${window.t('mergedFrom')}: ${selectedFunctions.map(f => f.name).join(', ')}`,
                    headId: headId,
                    headName: headName,
                    assigneeIds: allAssigneeIds,
                    assigneeNames: allAssigneeNames,
                    mergedFrom: selectedFunctions.map(f => ({ id: f.id, name: f.name, mergedAt: new Date().toISOString() })),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'active'
                };
                
                const newFuncRef = await db.collection('companies').doc(currentCompany).collection('functions').add(mergedFunctionData);
                
                // Оновлюємо завдання - переносимо на нову функцію
                let batch = db.batch();
                let batchCount = 0;
                
                for (const f of selectedFunctions) {
                    // Оновлюємо tasks
                    const tasksToUpdate = tasks.filter(t => t.function === f.name);
                    for (const task of tasksToUpdate) {
                        const taskRef = db.collection('companies').doc(currentCompany).collection('tasks').doc(task.id);
                        batch.update(taskRef, { 
                            function: newName,
                            originalFunction: task.originalFunction || f.name
                        });
                        batchCount++;
                        
                        // Firebase batch limit = 500
                        if (batchCount >= 450) {
                            try {
                            await batch.commit();
                            } catch(err) {
                                console.error('[Batch] commit failed:', err);
                                showToast && showToast(window.t('savingError'), 'error');
                            }
                            batch = db.batch();
                            batchCount = 0;
                        }
                    }
                    
                    // Оновлюємо regularTasks
                    const regularToUpdate = regularTasks.filter(rt => rt.function === f.name);
                    for (const rt of regularToUpdate) {
                        const rtRef = db.collection('companies').doc(currentCompany).collection('regularTasks').doc(rt.id);
                        batch.update(rtRef, { 
                            function: newName,
                            originalFunction: rt.originalFunction || f.name
                        });
                        batchCount++;
                        
                        if (batchCount >= 450) {
                            try {
                            await batch.commit();
                            } catch(err) {
                                console.error('[Batch] commit failed:', err);
                                showToast && showToast(window.t('savingError'), 'error');
                            }
                            batch = db.batch();
                            batchCount = 0;
                        }
                    }
                    
                    // Архівуємо стару функцію (не видаляємо)
                    const funcRef = db.collection('companies').doc(currentCompany).collection('functions').doc(f.id);
                    batch.update(funcRef, {
                        status: 'archived',
                        archivedAt: new Date().toISOString(),
                        mergedInto: newFuncRef.id,
                        mergedIntoName: newName
                    });
                    batchCount++;
                }
                
                if (batchCount > 0) {
                    try {
                    await batch.commit();
                    } catch(err) {
                        console.error('[Batch] commit failed:', err);
                        showToast && showToast(window.t('savingError'), 'error');
                    }
                }
                
                closeModal('mergeFunctionsModal');
                
                // Оновлюємо локальні дані
                await loadAllData();
                
                showAlertModal(window.t('mergeSuccess'));
                
            } catch (error) {
                console.error('Merge functions error:', error);
                showAlertModal(window.t('error') + ': ' + error.message);
            } finally {
                executeBtn.disabled = false;
                executeBtn.innerHTML = `<i data-lucide="git-merge" class="icon"></i> <span data-i18n="merge">${window.t('merge')}</span>`;
                refreshIcons();
            }
        }

        // =====================
        // CANVAS VIEW (гібридний канвас по ТЗ пріоритет 4)
        // =====================
        let _canvasMode = 'full';

        // Override setFunctionsView to support canvas tab
        const _origSetFunctionsView = typeof setFunctionsView === 'function' ? setFunctionsView : null;
        function setFunctionsView(view) {
            currentFunctionsView = view;
            document.querySelectorAll('[data-fview]').forEach(b => {
                b.style.background = b.dataset.fview === view ? 'white' : 'transparent';
                b.style.fontWeight = b.dataset.fview === view ? '600' : '400';
            });
            document.getElementById('functionsContainer').style.display = view === 'cards' ? '' : 'none';
            document.getElementById('functionsStructureContainer').style.display = view === 'structure' ? '' : 'none';
            const cv = document.getElementById('functionsCanvasContainer');
            if (cv) cv.style.display = view === 'canvas' ? '' : 'none';
            if (view === 'structure') renderFunctionsStructure();
            if (view === 'canvas') renderFunctionsCanvas();
            refreshIcons();
        }

        window.setCanvasMode = function(mode) {
            _canvasMode = mode;
            document.querySelectorAll('.canvas-mode-btn').forEach(b => {
                const active = b.dataset.cmode === mode;
                b.style.background = active ? '#1e40af' : 'white';
                b.style.color = active ? 'white' : '#374151';
                b.style.borderColor = active ? '#1e40af' : '#d1d5db';
                b.style.fontWeight = active ? '600' : '400';
            });
            renderFunctionsCanvas();
        };

        function _getLoadColor(f, todayStr) {
            if (!f.headId && !f.headName) return { border: '#ef4444', bg: '#fef2f2' };
            const fTasks = tasks.filter(t => t.function === f.name && t.status !== 'done');
            if (fTasks.length === 0) return { border: '#d1d5db', bg: '#f9fafb' };
            const overdue = fTasks.filter(t => t.deadlineDate && t.deadlineDate < todayStr).length;
            const ratio = overdue / fTasks.length;
            if (ratio > 0.3) return { border: '#ef4444', bg: '#fff7f7' };
            if (ratio > 0.1) return { border: '#f59e0b', bg: '#fffbeb' };
            return { border: '#22c55e', bg: '#f0fdf4' };
        }

        window.renderFunctionsCanvas = function() {
            const area = document.getElementById('functionsCanvasArea');
            if (!area) return;
            const activeFunctions = functions.filter(f => f.status !== 'archived');
            if (activeFunctions.length === 0) {
                area.innerHTML = '<div style="text-align:center;padding:3rem;color:#9ca3af;">Немає активних функцій.</div>';
                return;
            }
            const CARD_W = 200, CARD_H = 115, GAP_X = 60, GAP_Y = 50;
            const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];

            const positioned = activeFunctions.map((f, i) => ({
                ...f,
                x: (typeof f.positionX === 'number') ? f.positionX : 30 + (i % 4) * (CARD_W + GAP_X),
                y: (typeof f.positionY === 'number') ? f.positionY : 30 + Math.floor(i / 4) * (CARD_H + GAP_Y)
            }));

            const maxX = Math.max(...positioned.map(f => f.x + CARD_W)) + 60;
            const maxY = Math.max(...positioned.map(f => f.y + CARD_H)) + 80;

            let svgLines = '';
            positioned.forEach(f => {
                if ((_canvasMode === 'hierarchy' || _canvasMode === 'full') && f.reportsTo) {
                    const t = positioned.find(p => p.id === f.reportsTo);
                    if (t) {
                        svgLines += `<line x1="${f.x+CARD_W/2}" y1="${f.y}" x2="${t.x+CARD_W/2}" y2="${t.y+CARD_H}" stroke="#374151" stroke-width="2" marker-end="url(#arrow-solid)"/>`;
                    }
                }
                if ((_canvasMode === 'communications' || _canvasMode === 'full') && f.communicatesWith && f.communicatesWith.length) {
                    f.communicatesWith.forEach(function(cw) {
                        if (cw.direction !== 'incoming' && f.id < cw.functionId) {
                            const t = positioned.find(p => p.id === cw.functionId);
                            if (t) {
                                const x1=f.x+CARD_W, y1=f.y+CARD_H/2, x2=t.x, y2=t.y+CARD_H/2, mx=(x1+x2)/2;
                                svgLines += `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow-comm)"/>`;
                                if (cw.topics && cw.topics.length) {
                                    const label = cw.topics.slice(0,2).join(', ').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                                    svgLines += `<text x="${mx}" y="${(y1+y2)/2-5}" text-anchor="middle" font-size="10" fill="#8b5cf6" opacity="0.85">${label}</text>`;
                                }
                            }
                        }
                    });
                }
            });

            const svg = `<svg style="position:absolute;top:0;left:0;pointer-events:none;" width="${maxX}" height="${maxY}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow-solid" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#374151"/></marker><marker id="arrow-comm" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8b5cf6"/></marker></defs>${svgLines}</svg>`;

            const cards = positioned.map(function(f) {
                const load = _getLoadColor(f, todayStr);
                const fTasks = tasks.filter(t => t.function === f.name && t.status !== 'done').length;
                const overdue = tasks.filter(t => t.function === f.name && t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done').length;
                const topBar = (f.primaryColor && f.primaryColor !== '#ffffff') ? `border-top:3px solid ${f.primaryColor};` : '';
                const resultSnip = f.result ? (f.result.length > 48 ? f.result.slice(0,48)+'...' : f.result) : '';
                const noOwner = !f.headId && !f.headName;
                const safeId = f.id.replace(/[^a-zA-Z0-9_-]/g,'');
                const safeName = (f.name||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                const safeOwner = (f.headName||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                const safeResult = resultSnip.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                return `<div class="func-canvas-card" data-func-id="${safeId}" style="position:absolute;left:${f.x}px;top:${f.y}px;width:${CARD_W}px;background:${load.bg};border:2px solid ${load.border};border-radius:10px;padding:0.55rem 0.65rem;cursor:grab;user-select:none;box-shadow:0 2px 6px rgba(0,0,0,0.07);${topBar}" onmousedown="startCanvasDrag(event,'${safeId}')" ondblclick="openFunctionModal('${safeId}')"><div style="font-weight:700;font-size:0.8rem;color:#111827;line-height:1.3;margin-bottom:2px;">${safeName}</div>${noOwner ? `<div style="font-size:0.7rem;color:#ef4444;margin-bottom:3px;">No owner</div>` : `<div style="font-size:0.7rem;color:#6b7280;margin-bottom:3px;">👤 ${safeOwner}</div>`}${safeResult ? `<div style="font-size:0.68rem;color:#374151;font-style:italic;line-height:1.3;margin-bottom:4px;">${safeResult}</div>` : ''}<div style="display:flex;gap:8px;font-size:0.68rem;color:#6b7280;"><span>📋 ${fTasks}</span>${overdue > 0 ? `<span style="color:#ef4444;font-weight:600;">⚠ ${overdue}</span>` : ''}</div></div>`;
            }).join('');

            area.style.width = maxX + 'px';
            area.style.height = maxY + 'px';
            area.innerHTML = svg + cards;
            setCanvasMode(_canvasMode);
        };

        let _cdDragging = null, _cdOffX = 0, _cdOffY = 0;

        window.startCanvasDrag = function(e, funcId) {
            if (e.button !== 0) return;
            const card = e.currentTarget;
            const area = document.getElementById('functionsCanvasArea');
            _cdDragging = { funcId, card };
            const r = area.getBoundingClientRect();
            _cdOffX = e.clientX - r.left - parseInt(card.style.left);
            _cdOffY = e.clientY - r.top - parseInt(card.style.top);
            card.style.cursor = 'grabbing';
            card.style.zIndex = 100;
            e.preventDefault();
            function onMove(ev) {
                if (!_cdDragging) return;
                const r2 = area.getBoundingClientRect();
                const nx = Math.max(0, ev.clientX - r2.left - _cdOffX);
                const ny = Math.max(0, ev.clientY - r2.top - _cdOffY);
                _cdDragging.card.style.left = nx + 'px';
                _cdDragging.card.style.top = ny + 'px';
                _redrawCanvasArrows(area);
            }
            function onUp(ev) {
                if (!_cdDragging) return;
                const r2 = area.getBoundingClientRect();
                const nx = Math.max(0, ev.clientX - r2.left - _cdOffX);
                const ny = Math.max(0, ev.clientY - r2.top - _cdOffY);
                card.style.cursor = 'grab';
                card.style.zIndex = '';
                const func = functions.find(f => f.id === _cdDragging.funcId);
                if (func) { func.positionX = nx; func.positionY = ny; }
                db.collection('companies').doc(currentCompany).collection('functions').doc(_cdDragging.funcId)
                    .update({ positionX: nx, positionY: ny }).catch(function(er) { console.error(er); });
                _cdDragging = null;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };

        function _redrawCanvasArrows(area) {
            const svg = area.querySelector('svg');
            if (!svg) return;
            const defs = svg.querySelector('defs');
            const posMap = {};
            area.querySelectorAll('.func-canvas-card').forEach(function(c) {
                posMap[c.dataset.funcId] = { x: parseInt(c.style.left), y: parseInt(c.style.top) };
            });
            const CARD_W = 200, CARD_H = 115;
            let lines = '';
            functions.filter(f => f.status !== 'archived').forEach(function(f) {
                const fp = posMap[f.id];
                if (!fp) return;
                if ((_canvasMode === 'hierarchy' || _canvasMode === 'full') && f.reportsTo) {
                    const tp = posMap[f.reportsTo];
                    if (tp) lines += `<line x1="${fp.x+CARD_W/2}" y1="${fp.y}" x2="${tp.x+CARD_W/2}" y2="${tp.y+CARD_H}" stroke="#374151" stroke-width="2" marker-end="url(#arrow-solid)"/>`;
                }
                if ((_canvasMode === 'communications' || _canvasMode === 'full') && f.communicatesWith && f.communicatesWith.length) {
                    f.communicatesWith.forEach(function(cw) {
                        if (cw.direction !== 'incoming' && f.id < cw.functionId) {
                            const tp = posMap[cw.functionId];
                            if (tp) {
                                const x1=fp.x+CARD_W, y1=fp.y+CARD_H/2, x2=tp.x, y2=tp.y+CARD_H/2, mx=(x1+x2)/2;
                                lines += `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow-comm)"/>`;
                            }
                        }
                    });
                }
            });
            svg.innerHTML = (defs ? defs.outerHTML : '') + lines;
        }

        window.autoLayoutCanvas = function() {
            const CARD_W = 200, GAP_X = 60, GAP_Y = 50, CARD_H = 115;
            functions.filter(f => f.status !== 'archived').forEach(function(f, i) {
                f.positionX = 30 + (i % 4) * (CARD_W + GAP_X);
                f.positionY = 30 + Math.floor(i / 4) * (CARD_H + GAP_Y);
                db.collection('companies').doc(currentCompany).collection('functions').doc(f.id)
                    .update({ positionX: f.positionX, positionY: f.positionY }).catch(function(e) { console.error(e); });
            });
            renderFunctionsCanvas();
        };
