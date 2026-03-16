// ============================================================
// 79-funnels.js — TALKO AI Funnel Builder + Chat Widget v1.0
// Конструктор кроків воронки + рендер чату на публічній сторінці
// ============================================================
(function () {
    'use strict';

    let funnelEditorId = null;
    let funnelEditorData = null;
    let funnelSteps = [];

    // ── Funnel Editor Modal ────────────────────────────────
    window.openFunnelEditorModule = async function (funnelId) {
        funnelEditorId = funnelId;

        // Load funnel (FIX: додано try/catch для async помилок)
        try {
            const doc = await window.companyRef()
                .collection(window.DB_COLS?.FUNNELS || 'funnels').doc(funnelId).get();

            if (!doc.exists) {
                if(window.showToast) showToast(window.t('fnnlNF'),'warning');
                else alert(window.t('fnnlNF'));
                return;
            }
            funnelEditorData = { id: doc.id, ...doc.data() };
            funnelSteps = JSON.parse(JSON.stringify(funnelEditorData.steps || []));

            renderFunnelEditorModal();
        } catch (e) {
            console.error('[79-funnels] openFunnelEditorModule error:', e);
            if(window.showToast) showToast('Помилка завантаження: ' + e.message, 'error');
            else alert('Помилка завантаження воронки');
        }
    };

    function renderFunnelEditorModal() {
        document.getElementById('funnelEditorOverlay')?.remove();

        const html = `
            <div id="funnelEditorOverlay"
                style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:stretch;justify-content:flex-end;">
                <div style="background:white;width:100%;max-width:700px;display:flex;flex-direction:column;box-shadow:-8px 0 32px rgba(0,0,0,0.15);overflow:hidden;">

                    <!-- Header -->
                    <div style="padding:1rem 1.25rem;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;background:white;flex-shrink:0;">
                        <div>
                            <div style="font-weight:700;font-size:1rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></span>️ ${escHtml(funnelEditorData.name)}</div>
                            <div style="font-size:0.78rem;color:#6b7280;">${funnelSteps.length} кроків</div>
                        </div>
                        <div style="display:flex;gap:0.5rem;align-items:center;">
                            <button onclick="testFunnelPreview()" style="padding:0.45rem 0.75rem;background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
                                <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span> Тест
                            </button>
                            <button onclick="saveFunnelSteps()" style="padding:0.45rem 0.75rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
                                <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></span> Зберегти
                            </button>
                            <button onclick="closeFunnelEditor()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;padding:0 4px;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                        </div>
                    </div>

                    <!-- Two-panel layout -->
                    <div style="display:flex;flex:1;min-height:0;overflow:hidden;">

                        <!-- Steps list (left) -->
                        <div style="width:260px;flex-shrink:0;border-right:1px solid #f0f0f0;overflow-y:auto;padding:0.75rem;background:#f9fafb;">
                            <div style="font-size:0.75rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">КРОКИ</div>
                            <div id="funnelStepsList"></div>
                            <div style="margin-top:0.75rem;">
                                <div style="font-size:0.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem;">ДОДАТИ КРОК</div>
                                <div style="display:flex;flex-direction:column;gap:0.35rem;">
                                    ${[
                                        ['message',window.t('crmMessage'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>'],
                                        ['buttons','Кнопки вибору','<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="5" r="2" fill="currentColor"/></svg></span>'],
                                        ['text_input','Текстове поле','<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></span>️'],
                                        ['phone',window.t('crmColPhone'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>'],
                                        ['email','Email','<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>'],
                                        ['ai_response',window.t('aiResponse'),'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span>'],
                                        ['calendly','Calendly','<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>'],
                                        ['end','Завершення','<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>'],
                                    ].map(([type, label, icon]) => `
                                        <button onclick="addFunnelStep('${type}')"
                                            style="text-align:left;padding:0.45rem 0.6rem;background:white;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;gap:0.4rem;transition:background 0.15s;"
                                            onmouseenter="this.style.background='#f0fdf4'" onmouseleave="this.style.background='white'">
                                            <span>${icon}</span>${label}
                                        </button>`).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Step editor (right) -->
                        <div style="flex:1;overflow-y:auto;padding:1rem;" id="funnelStepEditor">
                            <div style="text-align:center;padding:2rem;color:#9ca3af;">
                                <div style="font-size:2rem;margin-bottom:0.5rem;">👆</div>
                                Виберіть крок або додайте новий
                            </div>
                        </div>
                    </div>

                    <!-- Calendly URL bar -->
                    <div style="padding:0.75rem 1.25rem;border-top:1px solid #f0f0f0;background:#f9fafb;flex-shrink:0;display:flex;align-items:center;gap:0.75rem;">
                        <span style="font-size:0.8rem;color:#6b7280;white-space:nowrap;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span> Calendly URL:</span>
                        <input id="funnelCalendlyUrl" value="${escHtml(funnelEditorData.calendlyUrl || '')}"
                            placeholder="https://calendly.com/..."
                            style="flex:1;padding:0.4rem 0.6rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;">
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', html);
        renderFunnelStepsList();
        if (window.lucide) lucide.createIcons();
    }

    window.closeFunnelEditor = function () {
        document.getElementById('funnelEditorOverlay')?.remove();
        funnelEditorId = null;
        funnelEditorData = null;
        funnelSteps = [];
        selectedStepId = null;  // FIX: prevent stale highlight on reopen
        // Повертаємо на вкладку Маркетинг
        if (typeof window.switchTab === 'function') window.switchTab('marketing');
    };

    // ── Steps List ─────────────────────────────────────────
    let selectedStepId = null;

    function renderFunnelStepsList() {
        const container = document.getElementById('funnelStepsList');
        if (!container) return;

        if (funnelSteps.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:1rem;color:#9ca3af;font-size:0.8rem;">' + window.t('noSteps2') + '</div>';
            return;
        }

        const stepLabels = { message: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>', buttons: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="5" r="2" fill="currentColor"/></svg></span>', text_input: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></span>️', phone: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>', email: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>', ai_response: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span>', calendly: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>', end: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>' };

        container.innerHTML = funnelSteps.map((step, i) => `
            <div onclick="selectFunnelStep('${step.id}')" data-step-id="${step.id}"
                style="padding:0.5rem 0.6rem;border-radius:8px;cursor:pointer;margin-bottom:0.3rem;background:${selectedStepId === step.id ? '#f0fdf4' : 'white'};border:1px solid ${selectedStepId === step.id ? '#22c55e' : '#e5e7eb'};transition:all 0.15s;display:flex;align-items:center;gap:0.5rem;">
                <span style="font-size:0.85rem;">${stepLabels[step.type] || '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>'}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.8rem;font-weight:600;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(step.name || step.type)}</div>
                    <div style="font-size:0.7rem;color:#9ca3af;">${step.type}</div>
                </div>
                <div style="display:flex;gap:1px;flex-direction:column;">
                    ${i > 0 ? `<button onclick="event.stopPropagation();moveStep('${step.id}',-1)" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.7rem;line-height:1;padding:1px;">▲</button>` : ''}
                    ${i < funnelSteps.length-1 ? `<button onclick="event.stopPropagation();moveStep('${step.id}',1)" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:0.7rem;line-height:1;padding:1px;">▼</button>` : ''}
                </div>
                <button onclick="event.stopPropagation();deleteFunnelStep('${step.id}')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:0.75rem;padding:2px;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
            </div>`).join('');
    }

    window.selectFunnelStep = function (stepId) {
        selectedStepId = stepId;
        renderFunnelStepsList();
        renderStepEditor(stepId);
    };

    window.addFunnelStep = function (type) {
        const id = 'step_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
        const defaultNames = { message: window.t('crmMessage'), buttons: 'Вибір', text_input: 'Введення тексту', phone: window.t('crmColPhone'), email: 'Email', ai_response: window.t('aiResponse'), calendly: 'Запис', end: 'Завершення' };
        const step = { id, type, name: defaultNames[type] || type, message: '', options: [], saveAs: null, systemPrompt: '', nextStep: null };
        funnelSteps.push(step);
        renderFunnelStepsList();
        selectFunnelStep(id);
    };

    window.deleteFunnelStep = async function (stepId) {
        if (!(await (window.showConfirmModal ? showConfirmModal('Видалити крок?',{danger:true}) : Promise.resolve(confirm('Видалити крок?'))))) return;
        funnelSteps = funnelSteps.filter(s => s.id !== stepId);
        if (selectedStepId === stepId) {
            selectedStepId = null;
            const editor = document.getElementById('funnelStepEditor');
            if (editor) editor.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af;">' + window.t('selectStep2') + '</div>';
        }
        renderFunnelStepsList();
    };

    window.moveStep = function (stepId, dir) {
        const idx = funnelSteps.findIndex(s => s.id === stepId);
        if (idx < 0) return;
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= funnelSteps.length) return;
        [funnelSteps[idx], funnelSteps[newIdx]] = [funnelSteps[newIdx], funnelSteps[idx]];
        renderFunnelStepsList();
    };

    // ── Step Editor ────────────────────────────────────────
    function renderStepEditor(stepId) {
        const step = funnelSteps.find(s => s.id === stepId);
        const container = document.getElementById('funnelStepEditor');
        if (!step || !container) return;

        const nextStepOptions = funnelSteps
            .filter(s => s.id !== stepId)
            .map(s => `<option value="${s.id}" ${step.nextStep === s.id ? 'selected' : ''}>${escHtml(s.name || s.type)}</option>`)
            .join('');

        let typeSpecific = '';

        if (step.type === 'message') {
            typeSpecific = `
                <div>
                    <label style="${lbl()}">ТЕКСТ ПОВІДОМЛЕННЯ</label>
                    <textarea onblur="updateStep('${stepId}','message',this.value)" style="width:100%;min-height:100px;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;resize:vertical;font-family:inherit;box-sizing:border-box;">${escHtml(step.message || '')}</textarea>
                </div>`;
        }

        if (step.type === 'buttons') {
            typeSpecific = `
                <div>
                    <label style="${lbl()}">ПИТАННЯ / ТЕКСТ</label>
                    <textarea onblur="updateStep('${stepId}','message',this.value)" style="width:100%;min-height:80px;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;resize:vertical;font-family:inherit;box-sizing:border-box;">${escHtml(step.message || '')}</textarea>
                </div>
                <div>
                    <label style="${lbl()}">КНОПКИ ВІДПОВІДЕЙ</label>
                    <div id="btnOptions_${stepId}" style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:0.5rem;">
                        ${(step.options || []).map((opt, i) => `
                            <div style="display:flex;gap:0.4rem;align-items:center;">
                                <input value="${escHtml(opt.text)}" placeholder="Текст кнопки"
                                    onblur="updateOption('${stepId}',${i},'text',this.value)"
                                    style="flex:1;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;">
                                <select onchange="updateOption('${stepId}',${i},'nextStep',this.value)"
                                    style="flex:1;padding:0.45rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.78rem;background:white;">
                                    <option value="">наступний</option>
                                    ${funnelSteps.filter(s=>s.id!==stepId).map(s=>`<option value="${s.id}" ${opt.nextStep===s.id?'selected':''}>${escHtml(s.name||s.type)}</option>`).join('')}
                                </select>
                                <button onclick="removeOption('${stepId}',${i})" style="background:#fee2e2;border:none;color:#ef4444;border-radius:6px;cursor:pointer;padding:4px 6px;font-size:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                            </div>`).join('')}
                    </div>
                    <button onclick="addOption('${stepId}')" style="width:100%;padding:0.4rem;background:#f0fdf4;color:#16a34a;border:1px dashed #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.82rem;">+ Додати кнопку</button>
                </div>`;
        }

        if (['text_input', 'phone', 'email'].includes(step.type)) {
            const placeholder = { text_input: window.t('enterQuestionPh'), phone: window.t('phonePh'), email: 'Ваш email:' }[step.type];
            typeSpecific = `
                <div>
                    <label style="${lbl()}">ТЕКСТ ЗАПИТАННЯ</label>
                    <textarea onblur="updateStep('${stepId}','message',this.value)" style="width:100%;min-height:80px;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;resize:vertical;font-family:inherit;box-sizing:border-box;" placeholder="${placeholder}">${escHtml(step.message || '')}</textarea>
                </div>
                <div>
                    <label style="${lbl()}">ЗБЕРЕГТИ ЯК (назва поля)</label>
                    <input value="${escHtml(step.saveAs || '')}" placeholder="${{ text_input: 'question', phone: 'phone', email: 'email' }[step.type]}"
                        onblur="updateStep('${stepId}','saveAs',this.value)"
                        style="width:100%;padding:0.55rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;box-sizing:border-box;">
                </div>`;
        }

        if (step.type === 'ai_response') {
            typeSpecific = `
                <div>
                    <label style="${lbl()}">СИСТЕМНИЙ ПРОМПТ ДЛЯ AI</label>
                    <textarea onblur="updateStep('${stepId}','systemPrompt',this.value)" style="width:100%;min-height:120px;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.82rem;resize:vertical;font-family:inherit;box-sizing:border-box;" placeholder="Ти консультант стоматологічної клініки. Відповідай тепло і по суті. Зібрані дані клієнта: {lead.data}">${escHtml(step.systemPrompt || '')}</textarea>
                    <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.3rem;">Використовуй {lead.data} для передачі зібраних відповідей клієнта</div>
                </div>
                <div>
                    <label style="${lbl()}">ПРОВАЙДЕР AI</label>
                    <select onchange="updateStep('${stepId}','aiProvider',this.value)" style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
                        <option value="openai" ${step.aiProvider !== 'anthropic' ? 'selected' : ''}>OpenAI (gpt-4o-mini)</option>
                        <option value="anthropic" ${step.aiProvider === 'anthropic' ? 'selected' : ''}>Anthropic (claude-haiku)</option>
                    </select>
                </div>`;
        }

        if (step.type === 'calendly') {
            typeSpecific = `
                <div>
                    <label style="${lbl()}">ТЕКСТ ПЕРЕД ЗАПИСОМ</label>
                    <textarea onblur="updateStep('${stepId}','message',this.value)" style="width:100%;min-height:80px;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;resize:vertical;font-family:inherit;box-sizing:border-box;" placeholder="Чудово! Оберіть зручний час для консультації 👇">${escHtml(step.message || '')}</textarea>
                </div>
                <div style="background:#f0fdf4;border-radius:8px;padding:0.6rem;font-size:0.78rem;color:#16a34a;">
                    <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span> Посилання Calendly береться з налаштувань воронки (нижня панель)
                </div>`;
        }

        if (step.type === 'end') {
            typeSpecific = `
                <div>
                    <label style="${lbl()}">ТЕКСТ ЗАВЕРШЕННЯ</label>
                    <textarea onblur="updateStep('${stepId}','message',this.value)" style="width:100%;min-height:80px;padding:0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;resize:vertical;font-family:inherit;box-sizing:border-box;" placeholder="Дякуємо! Наш менеджер зв'яжеться з вами найближчим часом.">${escHtml(step.message || '')}</textarea>
                </div>`;
        }

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.85rem;">
                <div>
                    <label style="${lbl()}">НАЗВА КРОКУ (для редактора)</label>
                    <input value="${escHtml(step.name || '')}" onblur="updateStep('${stepId}','name',this.value)"
                        style="width:100%;padding:0.55rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.9rem;font-weight:600;box-sizing:border-box;">
                </div>
                ${typeSpecific}
                ${!['buttons', 'end', 'calendly'].includes(step.type) ? `
                <div>
                    <label style="${lbl()}">НАСТУПНИЙ КРОК</label>
                    <select onchange="updateStep('${stepId}','nextStep',this.value||null)"
                        style="width:100%;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;background:white;">
                        <option value="">— Автоматично (наступний) —</option>
                        ${nextStepOptions}
                    </select>
                </div>` : ''}
            </div>`;
    }

    function lbl() { return 'font-size:0.78rem;color:#6b7280;font-weight:600;display:block;margin-bottom:0.3rem;'; }

    window.updateStep = function (stepId, field, value) {
        const step = funnelSteps.find(s => s.id === stepId);
        if (!step) return;
        step[field] = value;
        renderFunnelStepsList();
    };

    window.addOption = function (stepId) {
        const step = funnelSteps.find(s => s.id === stepId);
        if (!step) return;
        if (!step.options) step.options = [];
        step.options.push({ text: 'Варіант ' + (step.options.length + 1), nextStep: null });
        renderStepEditor(stepId);
        renderFunnelStepsList();
    };

    window.updateOption = function (stepId, idx, field, value) {
        const step = funnelSteps.find(s => s.id === stepId);
        if (!step || !step.options || !step.options[idx]) return;
        step.options[idx][field] = value || null;
    };

    window.removeOption = function (stepId, idx) {
        const step = funnelSteps.find(s => s.id === stepId);
        if (!step || !step.options) return;
        step.options.splice(idx, 1);
        renderStepEditor(stepId);
    };

    // ── Save Funnel ────────────────────────────────────────
    window.saveFunnelSteps = async function () {
        if (!funnelEditorId) return;
        // FIX-7: validate required fields before save
        const invalid = funnelSteps.filter(s => {
            if ((s.type === 'message' || s.type === 'text_input' || s.type === 'phone' || s.type === 'email') && !s.message?.trim()) return true;
            if (s.type === 'ai_response' && !s.systemPrompt?.trim()) return true;
            return false;
        });
        if (invalid.length > 0) {
            const names = invalid.map(s => s.name || s.type).join(', ');
            if (window.showToast) showToast(`Заповніть обов'язкові поля: ${names}`, 'warning');
            else if (typeof showToast === 'function') showToast(`Заповніть обов'язкові поля: ${names}`, 'warning');
            return;
        }
        try {
            await window.companyRef()
                .collection(window.DB_COLS?.FUNNELS || 'funnels').doc(funnelEditorId)
                .update({
                    steps: funnelSteps,
                    calendlyUrl: document.getElementById('funnelCalendlyUrl')?.value.trim() || null,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            if (typeof showToast === 'function') showToast('Воронку збережено ✓', 'success');
        } catch (err) { if(window.showToast)showToast('Помилка збереження: ' + err.message,'error'); else alert('Помилка збереження: ' + err.message); }
    };

    // ── Test Preview ────────────────────────────────────────
    window.testFunnelPreview = function () {
        if (!funnelEditorData) return;
        openChatWidget({ steps: funnelSteps, calendlyUrl: document.getElementById('funnelCalendlyUrl')?.value || '', name: funnelEditorData.name }, null, true);
    };

    // ── Chat Widget (публічна сторінка + тест) ─────────────
    window.openChatWidget = function (funnelData, companyId, isTest) {
        document.getElementById('talkoChatWidget')?.remove();

        let currentStepIdx = 0;
        let leadData = {};
        let chatHistory = [];

        const html = `
            <div id="talkoChatWidget" style="position:fixed;bottom:24px;right:24px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <!-- Chat window -->
                <div id="talkoChatWindow" style="width:340px;max-height:520px;background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.18);display:flex;flex-direction:column;overflow:hidden;margin-bottom:12px;animation:chatSlideIn 0.3s ease;">
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#16a34a,#22c55e);color:white;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                        <div>
                            <div style="font-weight:700;font-size:0.95rem;">${escHtml(funnelData.name || 'Консультант')}</div>
                            <div style="font-size:0.75rem;opacity:0.85;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#22c55e"/></svg></span> Онлайн</div>
                        </div>
                        <button onclick="closeChatWidget()" style="background:rgba(255,255,255,0.2);border:none;color:white;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                    </div>
                    <!-- Messages -->
                    <div id="talkoChatMessages" style="flex:1;overflow-y:auto;padding:0.75rem;display:flex;flex-direction:column;gap:0.6rem;min-height:200px;max-height:320px;background:#f9fafb;"></div>
                    <!-- Input -->
                    <div id="talkoChatInput" style="padding:0.6rem;border-top:1px solid #f0f0f0;background:white;flex-shrink:0;"></div>
                </div>
                <!-- Bubble -->
                <div id="talkoChatBubble" style="display:none;width:56px;height:56px;background:linear-gradient(135deg,#16a34a,#22c55e);border-radius:50%;cursor:pointer;box-shadow:0 4px 20px rgba(34,197,94,0.4);display:flex;align-items:center;justify-content:center;margin-left:auto;" onclick="reopenChatWindow()">
                    <span style="font-size:1.5rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span></span>
                </div>
            </div>
            <style>
                @keyframes chatSlideIn { from { opacity:0;transform:translateY(20px); } to { opacity:1;transform:translateY(0); } }
                .chat-msg-bot { background:white;border-radius:12px 12px 12px 4px;padding:0.6rem 0.75rem;max-width:85%;font-size:0.85rem;color:#1a1a1a;box-shadow:0 1px 4px rgba(0,0,0,0.07);align-self:flex-start; }
                .chat-msg-user { background:#22c55e;color:white;border-radius:12px 12px 4px 12px;padding:0.6rem 0.75rem;max-width:85%;font-size:0.85rem;align-self:flex-end; }
                .chat-btn { background:white;border:2px solid #22c55e;color:#16a34a;padding:0.5rem 0.75rem;border-radius:20px;cursor:pointer;font-size:0.82rem;font-weight:600;transition:all 0.15s;display:inline-block;margin:2px; }
                .chat-btn:hover { background:#22c55e;color:white; }
                .chat-input-field { width:100%;padding:0.55rem 0.75rem;border:1px solid #e5e7eb;border-radius:20px;font-size:0.85rem;outline:none;box-sizing:border-box; }
                .chat-input-field:focus { border-color:#22c55e; }
                .chat-send-btn { background:#22c55e;color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
            </style>`;

        document.body.insertAdjacentHTML('beforeend', html);

        // Start funnel
        const steps = funnelData.steps || [];
        if (steps.length === 0) {
            addBotMessage(window.t('funnelEmpty'));
            return;
        }

        function getStep(idx) { return steps[idx] || null; }

        function addBotMessage(text, delay) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const msgs = document.getElementById('talkoChatMessages');
                    if (!msgs) return resolve();
                    // Typing indicator
                    const typing = document.createElement('div');
                    typing.className = 'chat-msg-bot';
                    typing.innerHTML = '<span style="opacity:0.5;">•••</span>';
                    msgs.appendChild(typing);
                    msgs.scrollTop = msgs.scrollHeight;
                    setTimeout(() => {
                        typing.textContent = text;
                        msgs.scrollTop = msgs.scrollHeight;
                        resolve();
                    }, 600);
                }, delay || 300);
            });
        }

        function addUserMessage(text) {
            const msgs = document.getElementById('talkoChatMessages');
            if (!msgs) return;
            const el = document.createElement('div');
            el.className = 'chat-msg-user';
            el.textContent = text;
            msgs.appendChild(el);
            msgs.scrollTop = msgs.scrollHeight;
        }

        function setInputArea(html) {
            const el = document.getElementById('talkoChatInput');
            if (el) el.innerHTML = html;
        }

        async function executeStep(idx) {
            const step = getStep(idx);
            if (!step) {
                // Funnel complete
                await saveLead();
                return;
            }
            chatHistory.push({ stepId: step.id, type: step.type });
            currentStepIdx = idx;

            if (step.type === 'message') {
                await addBotMessage(step.message || '...');
                setInputArea(`<div style="text-align:center;"><button class="chat-btn" onclick="chatNextStep()">Продовжити →</button></div>`);
                window.chatNextStep = () => executeStep(getNextIdx(idx, step, null));
            }

            else if (step.type === 'buttons') {
                await addBotMessage(step.message || window.t('selectOption'));
                const opts = step.options || [];
                setInputArea(`<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:4px 0;">${opts.map((opt, i) => `<button class="chat-btn" onclick="chatSelectOption(${i})">${escHtml(opt.text)}</button>`).join('')}</div>`);
                window.chatSelectOption = (i) => {
                    const opt = opts[i];
                    addUserMessage(opt.text);
                    leadData['choice_' + step.id] = opt.text;
                    const nextIdx = opt.nextStep ? steps.findIndex(s => s.id === opt.nextStep) : idx + 1;
                    executeStep(nextIdx >= 0 ? nextIdx : idx + 1);
                };
            }

            else if (['text_input', 'phone', 'email'].includes(step.type)) {
                await addBotMessage(step.message || (step.type === 'phone' ? 'Ваш телефон?' : step.type === 'email' ? 'Ваш email?' : window.t('yourAnswer')));
                const inputType = step.type === 'phone' ? 'tel' : step.type === 'email' ? 'email' : 'text';
                setInputArea(`<div style="display:flex;gap:6px;"><input type="${inputType}" class="chat-input-field" id="chatUserInput" placeholder="${step.type === 'phone' ? '+380...' : step.type === 'email' ? 'email@...' : ''}"><button class="chat-send-btn" onclick="chatSubmitInput('${step.id}','${step.saveAs || step.type}',${getNextIdx(idx, step, null)})">→</button></div>`);
                document.getElementById('chatUserInput')?.addEventListener('keydown', e => {
                    if (e.key === 'Enter') chatSubmitInput(step.id, step.saveAs || step.type, getNextIdx(idx, step, null));
                });
                window.chatSubmitInput = (sId, saveAs, nextIdx) => {
                    const val = document.getElementById('chatUserInput')?.value.trim();
                    if (!val) return;
                    addUserMessage(val);
                    leadData[saveAs] = val;
                    setInputArea('');
                    executeStep(nextIdx);
                };
            }

            else if (step.type === 'ai_response') {
                await addBotMessage(window.t('analyzingRequest'));
                const aiResponse = await callFunnelAI(step, leadData, chatHistory, companyId);
                const msgs = document.getElementById('talkoChatMessages');
                if (msgs) {
                    const el = document.createElement('div');
                    el.className = 'chat-msg-bot';
                    el.textContent = aiResponse;
                    msgs.appendChild(el);
                    msgs.scrollTop = msgs.scrollHeight;
                }
                setInputArea(`<div style="text-align:center;"><button class="chat-btn" onclick="chatNextStep()">Продовжити →</button></div>`);
                window.chatNextStep = () => executeStep(getNextIdx(idx, step, null));
            }

            else if (step.type === 'calendly') {
                await addBotMessage(step.message || window.t('selectConvTime'));
                const url = funnelData.calendlyUrl;
                if (url) {
                    setInputArea(`<div style="text-align:center;padding:4px 0;"><a href="${escHtml(url)}" target="_blank" style="display:inline-block;background:#22c55e;color:white;padding:0.6rem 1.25rem;border-radius:20px;text-decoration:none;font-weight:700;font-size:0.88rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span> Записатися</a></div>`);
                } else {
                    setInputArea(`<div style="text-align:center;"><button class="chat-btn" onclick="chatNextStep()">Продовжити →</button></div>`);
                }
                await saveLead();
            }

            else if (step.type === 'end') {
                await addBotMessage(step.message || 'Дякуємо! Наш менеджер зв\'яжеться з вами найближчим часом. 🙏');
                setInputArea('');
                await saveLead();
            }
        }

        function getNextIdx(currentIdx, step, answer) {
            if (step.nextStep) {
                const idx = steps.findIndex(s => s.id === step.nextStep);
                return idx >= 0 ? idx : currentIdx + 1;
            }
            return currentIdx + 1;
        }

        async function callFunnelAI(step, data, history, cId) {
            if (isTest) return window.t('testModeAIHere');
            try {
                const _funnelIdToken = await (firebase.auth().currentUser?.getIdToken().catch(()=>null));
                const _funnelCtrl = new AbortController();
                const _funnelTimer = setTimeout(() => _funnelCtrl.abort(), 30000);
                let response;
                try {
                    response = await fetch('/api/funnel-ai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ..._funnelIdToken ? { 'Authorization': 'Bearer ' + _funnelIdToken } : {},
                        },
                        body: JSON.stringify({ companyId: cId, stepPrompt: step.systemPrompt || '', leadData: data, provider: step.aiProvider || 'openai' }),
                        signal: _funnelCtrl.signal,
                    });
                } finally { clearTimeout(_funnelTimer); }
                if (!response.ok) throw new Error('AI error');
                const json = await response.json();
                return json.response || 'Вибачте, спробуйте ще раз.';
            } catch (e) {
                return 'Вибачте, наразі не можу відповісти. Менеджер зв\'яжеться з вами.';
            }
        }

        async function saveLead() {
            if (isTest) return;
            if (!companyId || !funnelData.id) return;
            try {
                const base = firebase.firestore().collection('companies').doc(companyId);
                // Save to contacts
                let contactId = null;
                if (leadData.phone) {
                    const existing = await base.collection('contacts').where('phone', '==', leadData.phone).limit(1).get();
                    if (!existing.empty) {
                        contactId = existing.docs[0].id;
                        await base.collection('contacts').doc(contactId).update({
                            variables: { ...existing.docs[0].data().variables, ...leadData },
                            lastActivity: firebase.firestore.Timestamp.now()
                        });
                    }
                }
                if (!contactId) {
                    const cRef = await base.collection('contacts').add({
                        name: leadData.name || leadData.text_input || '',
                        phone: leadData.phone || '',
                        email: leadData.email || '',
                        source: 'web',
                        flowId: funnelData.id,
                        variables: leadData,
                        tags: ['лід', window.t('siteWordLc')],
                        status: 'active',
                        lastActivity: firebase.firestore.Timestamp.now(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    contactId = cRef.id;
                }

                // Get default pipeline
                const pipeSnap = await base.collection('crm_pipeline').where('isDefault', '==', true).limit(1).get();
                const pipelineId = pipeSnap.empty ? null : pipeSnap.docs[0].id;

                // Create deal
                if (pipelineId) {
                    await base.collection('crm_deals').add({
                        title: (leadData.name || leadData.phone || window.t('newLeadWord')) + ' — ' + (funnelData.name || window.t('siteWord')),
                        contactId,
                        pipelineId,
                        stage: 'new',
                        source: 'web',
                        funnelId: funnelData.id,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                // Increment leads count
                await base.collection('funnels').doc(funnelData.id).update({
                    leadsCount: firebase.firestore.FieldValue.increment(1)
                });
            } catch (e) {
                console.error('saveLead error:', e);
            }
        }

        window.closeChatWidget = function () {
            document.getElementById('talkoChatWindow').style.display = 'none';
            document.getElementById('talkoChatBubble').style.display = 'flex';
        };

        window.reopenChatWindow = function () {
            document.getElementById('talkoChatWindow').style.display = 'flex';
            document.getElementById('talkoChatBubble').style.display = 'none';
        };

        // Start
        executeStep(0);
    };

    // ── Utilities ──────────────────────────────────────────
    function escHtml(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

})();
