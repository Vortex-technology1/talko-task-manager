// =============================================
// MODULE 67: PROJECT STAGES + MATERIALS
// Phase 1 MVP — project-driven, function-centric
// =============================================
(function() {
    'use strict';

    // ========================
    //  STATE
    // ========================
    let projectStages = [];
    let projectMaterials = [];

    // ========================
    //  FIRESTORE REFS
    // ========================
    function stagesRef() {
        return db.collection('companies').doc(currentCompany).collection('projectStages');
    }
    function materialsRef() {
        return db.collection('companies').doc(currentCompany).collection('projectMaterials');
    }

    // ========================
    //  DATA LOADING
    // ========================
    async function loadStages(projectId) {
        if (!currentCompany) return [];
        try {
            let q = stagesRef().orderBy('order', 'asc');
            if (projectId) q = q.where('projectId', '==', projectId);
            const snap = await q.get();
            const result = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (!projectId) projectStages = result;
            return result;
        } catch (e) {
            console.error('[STAGES] loadStages:', e);
            return [];
        }
    }

    async function loadMaterials(projectId) {
        if (!currentCompany) return [];
        try {
            let q = materialsRef();
            if (projectId) q = q.where('projectId', '==', projectId);
            const snap = await q.get();
            const result = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (!projectId) projectMaterials = result;
            return result;
        } catch (e) {
            console.error('[STAGES] loadMaterials:', e);
            return [];
        }
    }

    // ========================
    //  STAGE CRUD
    // ========================
    async function createStage(projectId, data) {
        if (!currentCompany || !projectId) return null;
        const stages = await loadStages(projectId);
        const order = stages.length + 1;

        const stage = {
            projectId,
            name: data.name || 'Новий етап',
            order,
            status: 'planned', // planned|in_progress|blocked|done
            plannedStartDate: data.plannedStartDate || null,
            plannedEndDate: data.plannedEndDate || null,
            actualStartDate: null,
            actualEndDate: null,
            ownerFunctionId: data.ownerFunctionId || '',
            responsibleUserId: data.responsibleUserId || '',
            progressPct: 0,
            blockedReason: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            const ref = await stagesRef().add(stage);
            console.log('[STAGES] Created stage:', ref.id);
            return ref.id;
        } catch (e) {
            console.error('[STAGES] createStage:', e);
            showToast('Помилка: ' + e.message, 'error');
            return null;
        }
    }

    async function updateStage(stageId, data) {
        if (!currentCompany || !stageId) return;
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        try {
            await stagesRef().doc(stageId).update(data);
        } catch (e) {
            console.error('[STAGES] updateStage:', e);
            showToast('Помилка: ' + e.message, 'error');
        }
    }

    async function deleteStage(stageId) {
        if (!currentCompany || !stageId) return;
        if (!confirm('Видалити етап? Задачі та матеріали будуть відєднані.')) return;
        try {
            // Unlink tasks
            const linkedTasks = tasks.filter(t => t.stageId === stageId);
            for (const t of linkedTasks) {
                t.stageId = '';
                db.collection('companies').doc(currentCompany).collection('tasks').doc(t.id)
                    .update({ stageId: '' }).catch(() => {});
            }
            // Delete materials
            const mats = projectMaterials.filter(m => m.stageId === stageId);
            for (const m of mats) {
                await materialsRef().doc(m.id).delete();
            }
            await stagesRef().doc(stageId).delete();
            showToast('Етап видалено', 'success');
        } catch (e) {
            console.error('[STAGES] deleteStage:', e);
            showToast('Помилка: ' + e.message, 'error');
        }
    }

    // ========================
    //  STAGE STATUS + BLOCKED LOGIC
    // ========================
    async function updateStageStatus(stageId, newStatus) {
        const stage = projectStages.find(s => s.id === stageId);
        if (!stage) return;

        const updates = { status: newStatus };

        if (newStatus === 'in_progress' && !stage.actualStartDate) {
            updates.actualStartDate = new Date().toISOString().split('T')[0];
        }
        if (newStatus === 'done') {
            updates.actualEndDate = new Date().toISOString().split('T')[0];
            updates.progressPct = 100;
        }
        if (newStatus === 'blocked') {
            // Check if materials are the reason
            const mats = projectMaterials.filter(m => m.stageId === stageId);
            const undelivered = mats.filter(m => m.status !== 'delivered' && m.status !== 'used');
            updates.blockedReason = undelivered.length > 0 ? 'materials' : 'unknown';
        }
        if (newStatus !== 'blocked') {
            updates.blockedReason = null;
        }

        await updateStage(stageId, updates);
    }

    // Auto-check if stage should be blocked (materials not delivered)
    async function checkStageBlocked(stageId) {
        const stage = projectStages.find(s => s.id === stageId);
        if (!stage || stage.status === 'done') return;

        const mats = projectMaterials.filter(m => m.stageId === stageId);
        const requiredNotDelivered = mats.filter(m =>
            m.status !== 'delivered' && m.status !== 'used' &&
            m.plannedDeliveryDate && new Date(m.plannedDeliveryDate) < new Date()
        );

        if (requiredNotDelivered.length > 0 && stage.status !== 'blocked') {
            await updateStageStatus(stageId, 'blocked');
        }
    }

    // Auto-calculate stage progress from tasks
    function calculateStageProgress(stageId) {
        const stageTasks = tasks.filter(t => t.stageId === stageId);
        if (stageTasks.length === 0) return 0;
        const done = stageTasks.filter(t => t.status === 'done').length;
        return Math.round((done / stageTasks.length) * 100);
    }

    // ========================
    //  MATERIAL CRUD
    // ========================
    async function createMaterial(projectId, stageId, data) {
        if (!currentCompany) return null;
        const mat = {
            projectId,
            stageId,
            name: data.name || '',
            qty: data.qty || 0,
            unit: data.unit || 'шт',
            supplierName: data.supplierName || '',
            supplierPhone: data.supplierPhone || '',
            status: 'needed', // needed|ordered|delivering|delivered|used|missing
            plannedDeliveryDate: data.plannedDeliveryDate || null,
            actualDeliveryDate: null,
            costPlanned: data.costPlanned || 0,
            costActual: 0,
            ownerFunctionId: data.ownerFunctionId || '',
            responsibleUserId: data.responsibleUserId || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        try {
            const ref = await materialsRef().add(mat);
            return ref.id;
        } catch (e) {
            console.error('[STAGES] createMaterial:', e);
            return null;
        }
    }

    async function updateMaterial(materialId, data) {
        if (!currentCompany || !materialId) return;
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        try {
            await materialsRef().doc(materialId).update(data);
            // If delivered — check if stage can be unblocked
            if (data.status === 'delivered') {
                const mat = projectMaterials.find(m => m.id === materialId);
                if (mat?.stageId) await checkStageBlocked(mat.stageId);
            }
        } catch (e) {
            console.error('[STAGES] updateMaterial:', e);
        }
    }

    async function deleteMaterial(materialId) {
        if (!currentCompany || !materialId) return;
        try {
            await materialsRef().doc(materialId).delete();
        } catch (e) {
            console.error('[STAGES] deleteMaterial:', e);
        }
    }

    // ========================
    //  RENDER: STAGES LIST (for project detail)
    // ========================
    function renderStagesList(projectId) {
        const stages = projectStages.filter(s => s.projectId === projectId).sort((a, b) => a.order - b.order);
        const funcs = typeof functions !== 'undefined' ? functions : [];
        const us = typeof users !== 'undefined' ? users : [];

        const statusColors = {
            planned: '#9ca3af', in_progress: '#3b82f6', blocked: '#ef4444', done: '#22c55e'
        };
        const statusLabels = {
            planned: 'Заплановано', in_progress: 'В роботі', blocked: 'Заблоковано', done: 'Завершено'
        };

        if (stages.length === 0) {
            return `<div style="text-align:center;padding:2rem;color:#9ca3af;">
                <p style="font-size:0.85rem;">Етапів ще немає</p>
                <button class="btn btn-success btn-small" onclick="openStageModal('${projectId}')" style="margin-top:0.5rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Додати етап
                </button>
            </div>`;
        }

        let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-weight:700;font-size:0.9rem;">Етапи (${stages.length})</span>
            <button class="btn btn-success btn-small" onclick="openStageModal('${projectId}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Етап
            </button>
        </div>`;

        stages.forEach((stage, i) => {
            const color = statusColors[stage.status] || '#9ca3af';
            const label = statusLabels[stage.status] || stage.status;
            const func = funcs.find(f => f.id === stage.ownerFunctionId);
            const resp = us.find(u => u.id === stage.responsibleUserId);
            const progress = stage.progressPct || calculateStageProgress(stage.id);
            const mats = projectMaterials.filter(m => m.stageId === stage.id);
            const matsDelivered = mats.filter(m => m.status === 'delivered' || m.status === 'used').length;
            const stageTasks = tasks.filter(t => t.stageId === stage.id);

            html += `
            <div style="background:white;border:1px solid #e5e7eb;border-left:4px solid ${color};border-radius:12px;padding:0.75rem 1rem;margin-bottom:0.5rem;${stage.status === 'blocked' ? 'background:#fef2f2;border-color:#fecaca;' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
                    <div style="flex:1;">
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <span style="font-weight:700;font-size:0.88rem;">${i + 1}. ${esc(stage.name)}</span>
                            <span style="font-size:0.68rem;padding:2px 8px;border-radius:6px;background:${color}20;color:${color};font-weight:600;">${label}</span>
                            ${stage.blockedReason === 'materials' ? '<span style="font-size:0.65rem;padding:2px 6px;border-radius:6px;background:#fee2e2;color:#dc2626;">Матеріали!</span>' : ''}
                        </div>
                        <div style="display:flex;gap:0.75rem;font-size:0.72rem;color:#9ca3af;margin-top:4px;">
                            ${func ? `<span>Функція: <strong style="color:#6b7280;">${esc(func.name)}</strong></span>` : ''}
                            ${resp ? `<span>Відп.: <strong style="color:#6b7280;">${esc(resp.name || resp.email)}</strong></span>` : ''}
                            <span>Задачі: ${stageTasks.length}</span>
                            ${mats.length > 0 ? `<span>Матеріали: ${matsDelivered}/${mats.length}</span>` : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:2px;">
                        <select onchange="updateStageStatusUI('${stage.id}', this.value)" style="font-size:0.72rem;padding:2px 4px;border:1px solid #e5e7eb;border-radius:6px;">
                            ${Object.entries(statusLabels).map(([k, v]) => `<option value="${k}" ${stage.status === k ? 'selected' : ''}>${v}</option>`).join('')}
                        </select>
                        <button onclick="openStageModal('${stage.projectId}','${stage.id}')" style="border:none;background:transparent;cursor:pointer;padding:4px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        </button>
                        <button onclick="deleteStageUI('${stage.id}')" style="border:none;background:transparent;cursor:pointer;padding:4px;color:#ef4444;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
                <div style="margin-top:6px;">
                    <div style="height:5px;background:#f3f4f6;border-radius:3px;overflow:hidden;">
                        <div style="height:100%;width:${progress}%;background:${color};border-radius:3px;transition:width 0.3s;"></div>
                    </div>
                </div>
                <!-- Tasks in this stage -->
                <div style="margin-top:8px;border-top:1px solid #f3f4f6;padding-top:6px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:0.7rem;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Задачі</span>
                        <button onclick="openTaskForProjectStage('${stage.projectId}','${stage.id}')" style="border:none;background:#f0fdf4;color:#16a34a;font-size:0.68rem;padding:2px 8px;border-radius:6px;cursor:pointer;font-weight:600;">+ Задача</button>
                    </div>
                    ${stageTasks.length === 0
                        ? '<div style="font-size:0.72rem;color:#d1d5db;text-align:center;padding:4px;">—</div>'
                        : stageTasks.slice(0, 5).map(t => {
                            const stColor = t.status === 'done' ? '#22c55e' : t.status === 'progress' ? '#f59e0b' : t.status === 'review' ? '#8b5cf6' : '#9ca3af';
                            return `<div style="display:flex;align-items:center;gap:4px;font-size:0.75rem;padding:2px 0;cursor:pointer;" onclick="openTaskModal('${t.id}')">
                                <span style="width:6px;height:6px;border-radius:50%;background:${stColor};flex-shrink:0;"></span>
                                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(t.title)}</span>
                                <span style="font-size:0.65rem;color:${stColor};">${t.status === 'done' ? '✓' : t.status}</span>
                            </div>`;
                        }).join('') + (stageTasks.length > 5 ? `<div style="font-size:0.68rem;color:#9ca3af;text-align:center;">...і ще ${stageTasks.length - 5}</div>` : '')
                    }
                </div>
                <!-- Materials in this stage -->
                ${mats.length > 0 || true ? `
                <div style="margin-top:6px;border-top:1px solid #f3f4f6;padding-top:6px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:0.7rem;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Матеріали</span>
                        <button onclick="addMaterialQuick('${stage.projectId}','${stage.id}')" style="border:none;background:#eff6ff;color:#3b82f6;font-size:0.68rem;padding:2px 8px;border-radius:6px;cursor:pointer;font-weight:600;">+ Матеріал</button>
                    </div>
                    ${renderMaterialsList(stage.projectId, stage.id)}
                </div>` : ''}
                <!-- QC -->
                ${typeof window.renderQCList === 'function' ? window.renderQCList(stage.projectId, stage.id) : ''}
                <div style="margin-top:6px;display:flex;gap:4px;">
                    <button onclick="createQualityCheck('${stage.projectId}','${stage.id}',{ownerFunctionId:'${stage.ownerFunctionId || ''}'})" style="border:none;background:#fefce8;color:#a16207;font-size:0.68rem;padding:3px 8px;border-radius:6px;cursor:pointer;font-weight:500;">+ QC перевірка</button>
                </div>
            </div>`;
        });

        return html;
    }

    // ========================
    //  RENDER: MATERIALS LIST
    // ========================
    function renderMaterialsList(projectId, stageId) {
        const mats = projectMaterials.filter(m =>
            m.projectId === projectId && (!stageId || m.stageId === stageId)
        );

        const statusLabels = {
            needed: 'Потрібно', ordered: 'Замовлено', delivering: 'Доставляється',
            delivered: 'Доставлено', used: 'Використано', missing: 'Відсутній'
        };
        const statusColors = {
            needed: '#f59e0b', ordered: '#3b82f6', delivering: '#8b5cf6',
            delivered: '#22c55e', used: '#9ca3af', missing: '#ef4444'
        };

        if (mats.length === 0) {
            return '<div style="text-align:center;color:#d1d5db;font-size:0.8rem;padding:1rem;">Матеріалів немає</div>';
        }

        return mats.map(m => {
            const color = statusColors[m.status] || '#9ca3af';
            const label = statusLabels[m.status] || m.status;
            return `
            <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0;border-bottom:1px solid #f3f4f6;font-size:0.8rem;">
                <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
                <span style="flex:1;font-weight:500;">${esc(m.name)}</span>
                <span style="color:#9ca3af;">${m.qty} ${esc(m.unit || '')}</span>
                <select onchange="updateMaterialStatusUI('${m.id}', this.value)" style="font-size:0.7rem;padding:1px 4px;border:1px solid #e5e7eb;border-radius:4px;background:${color}10;color:${color};">
                    ${Object.entries(statusLabels).map(([k, v]) => `<option value="${k}" ${m.status === k ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
                <button onclick="deleteMaterialUI('${m.id}')" style="border:none;background:transparent;cursor:pointer;color:#d1d5db;padding:2px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>`;
        }).join('');
    }

    // ========================
    //  STAGE MODAL (Create/Edit)
    // ========================
    window.openStageModal = function(projectId, stageId) {
        const stage = stageId ? projectStages.find(s => s.id === stageId) : null;
        const funcs = typeof functions !== 'undefined' ? functions : [];
        const us = typeof users !== 'undefined' ? users : [];

        const html = `
        <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;">
            <h2 style="font-size:1.1rem;font-weight:700;">${stage ? 'Редагувати етап' : 'Новий етап'}</h2>
            <span class="close" onclick="closeModal('stageModal')" style="font-size:1.5rem;cursor:pointer;">&times;</span>
        </div>
        <div class="form-group">
            <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Назва етапу</label>
            <input type="text" id="stageName" value="${stage ? esc(stage.name) : ''}" placeholder="Електрика, Плитка, Фарбування..." class="input" style="border-radius:14px;padding:0.7rem 1rem;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div class="form-group">
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Функція</label>
                <select id="stageFunctionId" class="input" style="border-radius:14px;">
                    <option value="">—</option>
                    ${funcs.map(f => `<option value="${f.id}" ${stage?.ownerFunctionId === f.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Відповідальний</label>
                <select id="stageResponsible" class="input" style="border-radius:14px;">
                    <option value="">—</option>
                    ${us.map(u => `<option value="${u.id}" ${stage?.responsibleUserId === u.id ? 'selected' : ''}>${esc(u.name || u.email)}</option>`).join('')}
                </select>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div class="form-group">
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Початок (план)</label>
                <input type="date" id="stageStartDate" value="${stage?.plannedStartDate || ''}" class="input" style="border-radius:14px;">
            </div>
            <div class="form-group">
                <label style="font-size:0.78rem;font-weight:600;color:#6b7280;">Завершення (план)</label>
                <input type="date" id="stageEndDate" value="${stage?.plannedEndDate || ''}" class="input" style="border-radius:14px;">
            </div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
            <button class="btn" onclick="closeModal('stageModal')" style="flex:1;padding:0.6rem;border-radius:14px;">Скасувати</button>
            <button class="btn btn-success" onclick="saveStageFromModal('${projectId}','${stageId || ''}')" style="flex:1;padding:0.6rem;border-radius:14px;">Зберегти</button>
        </div>`;

        // Use dynamic modal
        let modal = document.getElementById('stageModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'stageModal';
            modal.className = 'modal';
            modal.innerHTML = '<div class="modal-content" style="max-width:480px;"></div>';
            document.body.appendChild(modal);
        }
        modal.querySelector('.modal-content').innerHTML = html;
        modal.style.display = 'flex';
    };

    window.saveStageFromModal = async function(projectId, stageId) {
        const name = document.getElementById('stageName')?.value?.trim();
        if (!name) { showToast('Введіть назву', 'error'); return; }

        const data = {
            name,
            ownerFunctionId: document.getElementById('stageFunctionId')?.value || '',
            responsibleUserId: document.getElementById('stageResponsible')?.value || '',
            plannedStartDate: document.getElementById('stageStartDate')?.value || null,
            plannedEndDate: document.getElementById('stageEndDate')?.value || null,
        };

        if (stageId) {
            await updateStage(stageId, data);
        } else {
            await createStage(projectId, data);
        }

        closeModal('stageModal');
        // Reload and re-render
        await loadStages(projectId);
        if (typeof renderProjectDetail === 'function' || typeof window.renderProjectDetail === 'function') {
            (window.renderProjectDetail || renderProjectDetail)(projectId);
        }
        showToast('Збережено', 'success');
    };

    // ========================
    //  UI HANDLERS
    // ========================
    window.updateStageStatusUI = async function(stageId, newStatus) {
        const stage = projectStages.find(s => s.id === stageId);
        if (!stage) return;
        await updateStageStatus(stageId, newStatus);
        await loadStages(stage.projectId);
        if (typeof window.renderProjectDetail === 'function') {
            window.renderProjectDetail(stage.projectId);
        }
    };

    window.deleteStageUI = async function(stageId) {
        const stage = projectStages.find(s => s.id === stageId);
        if (!stage) return;
        const pid = stage.projectId;
        await deleteStage(stageId);
        await loadStages(pid);
        if (typeof window.renderProjectDetail === 'function') {
            window.renderProjectDetail(pid);
        }
    };

    window.updateMaterialStatusUI = async function(materialId, newStatus) {
        await updateMaterial(materialId, { status: newStatus });
        // Refresh
        const mat = projectMaterials.find(m => m.id === materialId);
        if (mat) {
            await loadMaterials(mat.projectId);
            await loadStages(mat.projectId);
            if (typeof window.renderProjectDetail === 'function') {
                window.renderProjectDetail(mat.projectId);
            }
        }
    };

    window.deleteMaterialUI = async function(materialId) {
        if (!confirm('Видалити матеріал?')) return;
        const mat = projectMaterials.find(m => m.id === materialId);
        await deleteMaterial(materialId);
        if (mat) {
            await loadMaterials(mat.projectId);
            if (typeof window.renderProjectDetail === 'function') {
                window.renderProjectDetail(mat.projectId);
            }
        }
    };

    // Quick add material
    window.addMaterialQuick = async function(projectId, stageId) {
        const name = prompt('Назва матеріалу:');
        if (!name) return;
        const qty = parseFloat(prompt('Кількість:', '1') || '1');
        const unit = prompt('Одиниця (шт, м2, кг):', 'шт') || 'шт';

        await createMaterial(projectId, stageId, { name, qty, unit });
        await loadMaterials(projectId);
        if (typeof window.renderProjectDetail === 'function') {
            window.renderProjectDetail(projectId);
        }
        showToast('Матеріал додано', 'success');
    };

    // Auto-update stage progress + auto-advance to done
    window.autoUpdateStageProgress = async function(stageId) {
        if (!stageId || !currentCompany) return;
        const stageTasks = tasks.filter(t => t.stageId === stageId);
        if (stageTasks.length === 0) return;
        
        const done = stageTasks.filter(t => t.status === 'done').length;
        const pct = Math.round((done / stageTasks.length) * 100);
        
        const updates = { progressPct: pct };
        
        // Auto-advance: all tasks done → check materials → mark stage done
        if (done === stageTasks.length) {
            const mats = projectMaterials.filter(m => m.stageId === stageId);
            const allMatsDelivered = mats.length === 0 || mats.every(m => m.status === 'delivered' || m.status === 'used');
            if (allMatsDelivered) {
                updates.status = 'done';
                updates.actualEndDate = new Date().toISOString().split('T')[0];
            }
        }
        
        try {
            await stagesRef().doc(stageId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error('[STAGES] autoUpdateProgress:', e);
        }
    };

    // ========================
    //  EXPORTS
    // ========================
    window.loadProjectStages = loadStages;
    window.loadProjectMaterials = loadMaterials;
    window.renderStagesList = renderStagesList;
    window.renderMaterialsList = renderMaterialsList;
    window.projectStages = projectStages;
    window.projectMaterials = projectMaterials;

    // Make arrays accessible for other modules
    Object.defineProperty(window, 'projectStages', {
        get: () => projectStages,
        set: (v) => { projectStages = v; }
    });
    Object.defineProperty(window, 'projectMaterials', {
        get: () => projectMaterials,
        set: (v) => { projectMaterials = v; }
    });

})();
