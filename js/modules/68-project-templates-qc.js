// =============================================
// MODULE 68: PROJECT TEMPLATES + STANDARDS + QC + EVENTS
// Phase 2 — Systemization layer
// =============================================
(function() {
    'use strict';

    // ========================
    //  FIRESTORE REFS
    // ========================
    function templatesRef() { return db.collection('companies').doc(currentCompany).collection('projectTemplates'); }
    function standardsRef() { return db.collection('companies').doc(currentCompany).collection('workStandards'); }
    function qcRef() { return db.collection('companies').doc(currentCompany).collection('qualityChecks'); }
    function eventsRef() { return db.collection('companies').doc(currentCompany).collection('events'); }

    // ========================
    //  STATE
    // ========================
    let projectTemplatesData = [];
    let workStandards = [];
    let qualityChecks = [];

    // ========================
    //  EVENTS — єдина подієва модель
    // ========================
    async function createEvent(type, meta) {
        if (!currentCompany || !currentUser) return;
        try {
            await eventsRef().add({
                type, // task_done|stage_blocked|material_delayed|qc_rejected|cost_overrun|stage_done
                ts: firebase.firestore.FieldValue.serverTimestamp(),
                projectId: meta.projectId || '',
                stageId: meta.stageId || '',
                taskId: meta.taskId || '',
                functionId: meta.functionId || '',
                userId: currentUser.uid,
                meta: meta.extra || {},
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch (e) {
            console.error('[EVENTS] createEvent:', e);
        }
    }
    window.createProjectEvent = createEvent;

    // ========================
    //  WORK STANDARDS (Стандарти робіт)
    // ========================
    async function loadStandards() {
        if (!currentCompany) return [];
        try {
            const snap = await standardsRef().get();
            workStandards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return workStandards;
        } catch (e) { console.error('[STD] load:', e); return []; }
    }

    window.openStandardModal = function(standardId) {
        const std = standardId ? workStandards.find(s => s.id === standardId) : null;
        const funcs = typeof functions !== 'undefined' ? functions : [];

        const html = `
        <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;">
            <h2 style="font-size:1.1rem;font-weight:700;">${std ? 'Редагувати стандарт' : 'Новий стандарт'}</h2>
            <span class="close" onclick="closeModal('standardModal')" style="font-size:1.5rem;cursor:pointer;">&times;</span>
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Назва стандарту</label>
            <input type="text" id="stdName" value="${std ? esc(std.name || '') : ''}" placeholder="Укладка плитки, Штукатурка стін..." class="input" style="border-radius:14px;padding:0.7rem 1rem;">
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Функція</label>
            <select id="stdFunctionId" class="input" style="border-radius:14px;">
                <option value="">—</option>
                ${funcs.map(f => `<option value="${f.id}" ${std?.functionId === f.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Чек-лист (по рядку на пункт)</label>
            <textarea id="stdChecklist" rows="6" class="input" style="border-radius:14px;padding:0.7rem 1rem;font-size:0.85rem;">${std?.checklist ? std.checklist.join('\n') : ''}</textarea>
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Інструкція</label>
            <textarea id="stdInstructions" rows="4" class="input" style="border-radius:14px;padding:0.7rem 1rem;font-size:0.85rem;">${std ? esc(std.instructionsHtml || '') : ''}</textarea>
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Критерії прийомки (по рядку)</label>
            <textarea id="stdAcceptance" rows="3" class="input" style="border-radius:14px;padding:0.7rem 1rem;font-size:0.85rem;">${std?.acceptanceCriteria ? std.acceptanceCriteria.join('\n') : ''}</textarea>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
            ${std ? `<button class="btn" onclick="deleteStandardUI('${std.id}')" style="width:48px;background:#fee2e2;color:#ef4444;border-radius:14px;padding:0;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>` : ''}
            <button class="btn" onclick="closeModal('standardModal')" style="flex:1;padding:0.6rem;border-radius:14px;">Скасувати</button>
            <button class="btn btn-success" onclick="saveStandardFromModal('${standardId || ''}')" style="flex:1;padding:0.6rem;border-radius:14px;">Зберегти</button>
        </div>`;

        let modal = document.getElementById('standardModal');
        if (!modal) {
            modal = document.createElement('div'); modal.id = 'standardModal'; modal.className = 'modal';
            modal.innerHTML = '<div class="modal-content" style="max-width:520px;"></div>';
            document.body.appendChild(modal);
        }
        modal.querySelector('.modal-content').innerHTML = html;
        modal.style.display = 'flex';
    };

    window.saveStandardFromModal = async function(standardId) {
        const name = document.getElementById('stdName')?.value?.trim();
        if (!name) { showToast('Введіть назву', 'error'); return; }

        const data = {
            name,
            functionId: document.getElementById('stdFunctionId')?.value || '',
            checklist: (document.getElementById('stdChecklist')?.value || '').split('\n').map(s => s.trim()).filter(Boolean),
            instructionsHtml: document.getElementById('stdInstructions')?.value?.trim() || '',
            acceptanceCriteria: (document.getElementById('stdAcceptance')?.value || '').split('\n').map(s => s.trim()).filter(Boolean),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            if (standardId) {
                await standardsRef().doc(standardId).update(data);
            } else {
                data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                data.createdBy = currentUser.uid;
                await standardsRef().add(data);
            }
            closeModal('standardModal');
            showToast('Стандарт збережено', 'success');
            await loadStandards();
            renderStandardsList();
        } catch (e) { showToast('Помилка: ' + e.message, 'error'); }
    };

    window.deleteStandardUI = async function(id) {
        if (!confirm('Видалити стандарт?')) return;
        try {
            await standardsRef().doc(id).delete();
            closeModal('standardModal');
            await loadStandards();
            renderStandardsList();
            showToast('Видалено', 'success');
        } catch (e) { showToast('Помилка: ' + e.message, 'error'); }
    };

    function renderStandardsList() {
        const container = document.getElementById('standardsListContainer');
        if (!container) return;
        const funcs = typeof functions !== 'undefined' ? functions : [];

        if (workStandards.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:2rem;color:#9ca3af;">
                <p>Стандартів ще немає</p>
                <button class="btn btn-success btn-small" onclick="openStandardModal()" style="margin-top:0.5rem;">+ Новий стандарт</button>
            </div>`;
            return;
        }

        container.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-weight:700;">Стандарти робіт (${workStandards.length})</span>
            <button class="btn btn-success btn-small" onclick="openStandardModal()">+ Стандарт</button>
        </div>` +
        workStandards.map(s => {
            const func = funcs.find(f => f.id === s.functionId);
            return `<div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:0.65rem 1rem;margin-bottom:0.4rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;" onclick="openStandardModal('${s.id}')">
                <div>
                    <div style="font-weight:600;font-size:0.88rem;">${esc(s.name)}</div>
                    <div style="font-size:0.72rem;color:#9ca3af;">${func ? esc(func.name) : ''} · ${(s.checklist || []).length} пунктів</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>`;
        }).join('');
    }

    // ========================
    //  QUALITY CONTROL (QC)
    // ========================
    async function loadQualityChecks(projectId) {
        if (!currentCompany) return [];
        try {
            let q = qcRef();
            if (projectId) q = q.where('projectId', '==', projectId);
            const snap = await q.get();
            qualityChecks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return qualityChecks;
        } catch (e) { console.error('[QC] load:', e); return []; }
    }

    window.createQualityCheck = async function(projectId, stageId, opts) {
        if (!currentCompany) return null;
        const data = {
            projectId,
            stageId,
            taskId: opts.taskId || '',
            standardId: opts.standardId || '',
            status: 'pending', // pending|approved|rejected
            notes: '',
            photos: [],
            inspectorUserId: opts.inspectorUserId || '',
            ownerFunctionId: opts.ownerFunctionId || '',
            checklist: opts.checklist || [],
            checklistResults: {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        try {
            const ref = await qcRef().add(data);
            return ref.id;
        } catch (e) { console.error('[QC] create:', e); return null; }
    };

    window.updateQCStatus = async function(qcId, status, notes) {
        if (!qcId) return;
        const qc = qualityChecks.find(q => q.id === qcId);
        try {
            await qcRef().doc(qcId).update({
                status,
                notes: notes || '',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            if (status === 'rejected' && qc) {
                // Event
                await createEvent('qc_rejected', {
                    projectId: qc.projectId, stageId: qc.stageId,
                    taskId: qc.taskId, functionId: qc.ownerFunctionId,
                    extra: { notes }
                });

                // Block stage
                if (qc.stageId && typeof window.projectStages !== 'undefined') {
                    const stage = window.projectStages.find(s => s.id === qc.stageId);
                    if (stage) {
                        const stRef = db.collection('companies').doc(currentCompany).collection('projectStages');
                        await stRef.doc(qc.stageId).update({
                            status: 'blocked',
                            blockedReason: 'rework',
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }

                // Auto-create rework task
                if (qc.projectId && qc.stageId) {
                    const std = qc.standardId ? workStandards.find(s => s.id === qc.standardId) : null;
                    const taskData = {
                        title: 'Переробка: ' + (std?.name || 'QC rejected'),
                        function: qc.ownerFunctionId || '',
                        projectId: qc.projectId,
                        stageId: qc.stageId,
                        status: 'new',
                        priority: 'high',
                        description: 'QC відхилено. ' + (notes || ''),
                        deadlineDate: getLocalDateStr(new Date(Date.now() + 86400000 * 2)), // +2 days
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        creatorId: currentUser.uid,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    };
                    try {
                        await db.collection('companies').doc(currentCompany).collection('tasks').add(taskData);
                    } catch (e) { console.error('[QC] create rework task:', e); }
                }
            }

            showToast(status === 'approved' ? 'QC прийнято' : 'QC відхилено — створена задача на переробку', status === 'approved' ? 'success' : 'error');
        } catch (e) { showToast('Помилка: ' + e.message, 'error'); }
    };

    function renderQCList(projectId, stageId) {
        const checks = qualityChecks.filter(q =>
            q.projectId === projectId && (!stageId || q.stageId === stageId)
        );

        if (checks.length === 0) return '';

        const statusColors = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };
        const statusLabels = { pending: 'Очікує', approved: 'Прийнято', rejected: 'Відхилено' };

        return `<div style="margin-top:8px;border-top:1px solid #f3f4f6;padding-top:6px;">
            <span style="font-size:0.7rem;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Контроль якості</span>
            ${checks.map(q => {
                const color = statusColors[q.status] || '#9ca3af';
                const label = statusLabels[q.status] || q.status;
                const std = q.standardId ? workStandards.find(s => s.id === q.standardId) : null;
                return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:0.75rem;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
                    <span style="flex:1;">${std ? esc(std.name) : 'QC'} — ${label}</span>
                    ${q.status === 'pending' ? `
                        <button onclick="event.stopPropagation();updateQCStatus('${q.id}','approved','')" style="border:none;background:#dcfce7;color:#16a34a;font-size:0.68rem;padding:2px 8px;border-radius:6px;cursor:pointer;">✓</button>
                        <button onclick="event.stopPropagation();updateQCStatus('${q.id}','rejected',prompt('Причина відхилення:'))" style="border:none;background:#fee2e2;color:#dc2626;font-size:0.68rem;padding:2px 8px;border-radius:6px;cursor:pointer;">✕</button>
                    ` : ''}
                </div>`;
            }).join('')}
        </div>`;
    }

    // ========================
    //  PROJECT TEMPLATES
    // ========================
    async function loadProjectTemplates() {
        if (!currentCompany) return [];
        try {
            const snap = await templatesRef().get();
            projectTemplatesData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return projectTemplatesData;
        } catch (e) { console.error('[TPL] load:', e); return []; }
    }

    window.openProjectTemplateModal = function(templateId) {
        const tpl = templateId ? projectTemplatesData.find(t => t.id === templateId) : null;

        const html = `
        <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;">
            <h2 style="font-size:1.1rem;font-weight:700;">${tpl ? 'Редагувати шаблон' : 'Новий шаблон проєкту'}</h2>
            <span class="close" onclick="closeModal('projectTemplateModal')" style="font-size:1.5rem;cursor:pointer;">&times;</span>
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Назва шаблону</label>
            <input type="text" id="tplName" value="${tpl ? esc(tpl.name || '') : ''}" placeholder="Ремонт квартири, Будівництво будинку..." class="input" style="border-radius:14px;padding:0.7rem 1rem;">
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Етапи (по рядку: Назва | Функція | Дні)</label>
            <textarea id="tplStages" rows="8" class="input" style="border-radius:14px;padding:0.7rem 1rem;font-family:monospace;font-size:0.8rem;" placeholder="Демонтаж | Демонтаж | 3\nЕлектрика | Електрика | 5\nШтукатурка | Мокрі роботи | 7\nПлитка | Плиточник | 5\nФарбування | Маляр | 3\nМонтаж сантехніки | Сантехнік | 2\nПрибирання | Клінінг | 1">${tpl?.stages ? tpl.stages.map(s => `${s.name} | ${s.defaultFunctionName || ''} | ${s.defaultDurationDays || ''}`).join('\n') : ''}</textarea>
            <small style="color:#9ca3af;font-size:0.7rem;">Формат: Назва етапу | Назва функції | Тривалість днів</small>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
            ${tpl ? `<button class="btn" onclick="deleteProjectTemplateUI('${tpl.id}')" style="width:48px;background:#fee2e2;color:#ef4444;border-radius:14px;padding:0;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>` : ''}
            <button class="btn" onclick="closeModal('projectTemplateModal')" style="flex:1;padding:0.6rem;border-radius:14px;">Скасувати</button>
            <button class="btn btn-success" onclick="saveProjectTemplateFromModal('${templateId || ''}')" style="flex:1;padding:0.6rem;border-radius:14px;">Зберегти</button>
        </div>`;

        let modal = document.getElementById('projectTemplateModal');
        if (!modal) {
            modal = document.createElement('div'); modal.id = 'projectTemplateModal'; modal.className = 'modal';
            modal.innerHTML = '<div class="modal-content" style="max-width:560px;"></div>';
            document.body.appendChild(modal);
        }
        modal.querySelector('.modal-content').innerHTML = html;
        modal.style.display = 'flex';
    };

    window.saveProjectTemplateFromModal = async function(templateId) {
        const name = document.getElementById('tplName')?.value?.trim();
        if (!name) { showToast('Введіть назву', 'error'); return; }

        const stageLines = (document.getElementById('tplStages')?.value || '').split('\n').filter(l => l.trim());
        const stages = stageLines.map((line, i) => {
            const parts = line.split('|').map(s => s.trim());
            return {
                name: parts[0] || `Етап ${i + 1}`,
                order: i + 1,
                defaultFunctionName: parts[1] || '',
                defaultDurationDays: parseInt(parts[2]) || 0,
            };
        });

        const data = {
            name,
            stages,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            if (templateId) {
                await templatesRef().doc(templateId).update(data);
            } else {
                data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                data.createdBy = currentUser.uid;
                await templatesRef().add(data);
            }
            closeModal('projectTemplateModal');
            showToast('Шаблон збережено', 'success');
            await loadProjectTemplates();
        } catch (e) { showToast('Помилка: ' + e.message, 'error'); }
    };

    window.deleteProjectTemplateUI = async function(id) {
        if (!confirm('Видалити шаблон?')) return;
        try {
            await templatesRef().doc(id).delete();
            closeModal('projectTemplateModal');
            await loadProjectTemplates();
            showToast('Видалено', 'success');
        } catch (e) { showToast('Помилка: ' + e.message, 'error'); }
    };

    // Create project FROM template — stages + QC points
    window.createProjectFromTemplate = async function(templateId) {
        const tpl = projectTemplatesData.find(t => t.id === templateId);
        if (!tpl) { showToast('Шаблон не знайдено', 'error'); return; }

        const projectName = prompt('Назва проєкту:', tpl.name + ' — ' + new Date().toLocaleDateString('uk'));
        if (!projectName) return;

        const funcs = typeof functions !== 'undefined' ? functions : [];

        try {
            // 1. Create project
            const projRef = await db.collection('companies').doc(currentCompany).collection('projects').add({
                name: projectName,
                status: 'active',
                startDate: getLocalDateStr(),
                color: '#22c55e',
                description: 'Створено з шаблону: ' + tpl.name,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                creatorId: currentUser.uid,
            });
            const projectId = projRef.id;
            projects.unshift({ id: projectId, name: projectName, status: 'active', startDate: getLocalDateStr(), color: '#22c55e' });

            // 2. Create stages
            const stagesRef = db.collection('companies').doc(currentCompany).collection('projectStages');
            let dayOffset = 0;
            const startDate = new Date();

            for (const s of (tpl.stages || [])) {
                const funcMatch = funcs.find(f =>
                    f.name && s.defaultFunctionName &&
                    f.name.toLowerCase().includes(s.defaultFunctionName.toLowerCase())
                );

                const stageStart = new Date(startDate);
                stageStart.setDate(stageStart.getDate() + dayOffset);
                const stageEnd = new Date(stageStart);
                stageEnd.setDate(stageEnd.getDate() + (s.defaultDurationDays || 0));

                await stagesRef.add({
                    projectId,
                    name: s.name,
                    order: s.order || 1,
                    status: 'planned',
                    plannedStartDate: stageStart.toISOString().split('T')[0],
                    plannedEndDate: stageEnd.toISOString().split('T')[0],
                    ownerFunctionId: funcMatch?.id || '',
                    responsibleUserId: '',
                    progressPct: 0,
                    blockedReason: null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                });

                dayOffset += s.defaultDurationDays || 0;
            }

            showToast('Проєкт "' + projectName + '" створено з ' + (tpl.stages || []).length + ' етапами', 'success');

            // Refresh
            if (typeof renderProjects === 'function') renderProjects();
            if (typeof updateProjectSelects === 'function') updateProjectSelects();
            if (typeof window.openProjectDetail === 'function') window.openProjectDetail(projectId);

        } catch (e) {
            console.error('[TPL] createFromTemplate:', e);
            showToast('Помилка: ' + e.message, 'error');
        }
    };

    // Template picker for project creation
    window.openProjectTemplatePicker = async function() {
        await loadProjectTemplates();
        const funcs = typeof functions !== 'undefined' ? functions : [];

        let html = `
        <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;">
            <h2 style="font-size:1.1rem;font-weight:700;">Створити з шаблону</h2>
            <span class="close" onclick="closeModal('projectTemplatePicker')" style="font-size:1.5rem;cursor:pointer;">&times;</span>
        </div>`;

        if (projectTemplatesData.length === 0) {
            html += `<div style="text-align:center;padding:2rem;color:#9ca3af;">
                <p>Шаблонів немає</p>
                <button class="btn btn-success btn-small" onclick="closeModal('projectTemplatePicker');openProjectTemplateModal();" style="margin-top:0.5rem;">+ Створити шаблон</button>
            </div>`;
        } else {
            html += projectTemplatesData.map(tpl => {
                const stageCount = (tpl.stages || []).length;
                const totalDays = (tpl.stages || []).reduce((s, st) => s + (st.defaultDurationDays || 0), 0);
                return `<div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:0.75rem 1rem;margin-bottom:0.5rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;" onclick="closeModal('projectTemplatePicker');createProjectFromTemplate('${tpl.id}');">
                    <div>
                        <div style="font-weight:700;font-size:0.9rem;">${esc(tpl.name)}</div>
                        <div style="font-size:0.72rem;color:#9ca3af;">${stageCount} етапів · ~${totalDays} днів</div>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button onclick="event.stopPropagation();closeModal('projectTemplatePicker');openProjectTemplateModal('${tpl.id}');" style="border:none;background:#f3f4f6;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:0.7rem;">✏️</button>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                </div>`;
            }).join('');
            html += `<div style="text-align:center;margin-top:0.5rem;">
                <button class="btn btn-small" onclick="closeModal('projectTemplatePicker');openProjectTemplateModal();" style="font-size:0.78rem;">+ Новий шаблон</button>
            </div>`;
        }

        let modal = document.getElementById('projectTemplatePicker');
        if (!modal) {
            modal = document.createElement('div'); modal.id = 'projectTemplatePicker'; modal.className = 'modal';
            modal.innerHTML = '<div class="modal-content" style="max-width:480px;"></div>';
            document.body.appendChild(modal);
        }
        modal.querySelector('.modal-content').innerHTML = html;
        modal.style.display = 'flex';
    };

    // ========================
    //  HOOK INTO EXISTING EVENTS
    // ========================
    // Override task completion to emit events
    const _origAutoUpdateStageProgress = window.autoUpdateStageProgress;
    if (_origAutoUpdateStageProgress) {
        window.autoUpdateStageProgress = async function(stageId) {
            await _origAutoUpdateStageProgress(stageId);
            // Check if stage just became done
            if (typeof window.projectStages !== 'undefined') {
                const stage = window.projectStages.find(s => s.id === stageId);
                if (stage?.status === 'done') {
                    await createEvent('stage_done', {
                        projectId: stage.projectId, stageId,
                        functionId: stage.ownerFunctionId
                    });
                }
            }
        };
    }

    // ========================
    //  INIT
    // ========================
    window.loadWorkStandards = loadStandards;
    window.loadQualityChecks = loadQualityChecks;
    window.loadProjectTemplates = loadProjectTemplates;
    window.renderStandardsList = renderStandardsList;
    window.renderQCList = renderQCList;
    window.workStandards = workStandards;
    window.qualityChecks = qualityChecks;

    Object.defineProperty(window, 'workStandards', { get: () => workStandards, set: v => { workStandards = v; } });
    Object.defineProperty(window, 'qualityChecks', { get: () => qualityChecks, set: v => { qualityChecks = v; } });

})();
