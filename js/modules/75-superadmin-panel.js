// =============================================
// MODULE 75 — SUPERADMIN PANEL
// AI limits + feature flags per company
// =============================================
(function() {
    'use strict';
    const FEATURES = [
        { key: 'statistics',       label: 'Статистика / Метрики' },
        { key: 'processes',        label: 'Бізнес-процеси' },
        { key: 'projects',         label: 'Проєкти' },
        { key: 'bizStructure',     label: 'Структура бізнесу' },
        { key: 'aiAssistants',     label: 'AI Асистенти' },
        { key: 'fileAttachments',  label: 'Файлові вкладення' },
        { key: 'timeTracking',     label: 'Трекер часу' },
        { key: 'regularTasks',     label: 'Регулярні задачі' },
        { key: 'kanban',           label: 'Kanban дошка' },
        { key: 'controlDashboard', label: 'Дашборд контролю' },
        { key: 'ownerDashboard',   label: 'Дашборд власника' },
        { key: 'eveningDigest',    label: 'Вечірній дайджест (Telegram)' },
        { key: 'weeklyReport',     label: 'Тижневий звіт (Telegram)' },
    ];

    window.deleteEmptyCompanies = async function() {
        if (!isSuperAdmin) return;
        const confirmed = confirm('Видалити всі компанії з 0 юзерів і 0 завдань?');
        if (!confirmed) return;

        try {
            const snap = await db.collection('companies').get();
            let deleted = 0;
            for (const doc of snap.docs) {
                const data = doc.data();
                // Пропускаємо компанії з власником або назвою що містить реальні дані
                const usersSnap = await db.collection('companies').doc(doc.id).collection('users').limit(1).get();
                const tasksSnap = await db.collection('companies').doc(doc.id).collection('tasks').limit(1).get();
                
                if (usersSnap.empty && tasksSnap.empty) {
                    await db.collection('companies').doc(doc.id).delete();
                    deleted++;
                    console.log('[Admin] Deleted empty company:', doc.id, data.name || '—');
                }
            }
            alert(`Видалено ${deleted} пустих компаній.`);
            loadSuperadminData();
        } catch(e) {
            alert('Помилка: ' + e.message);
        }
    };

    window.openSuperadminPanel = async function() {
        if (!isSuperAdmin) return;
        // Відкриваємо модальне вікно напряму (openModal — локальна в statistics.js)
        const modal = document.getElementById('superadminModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        await loadSuperadminData();
    };

    async function loadSuperadminData() {
        const container = document.getElementById('superadminContent');
        if (!container) return;
        container.innerHTML = '<div class="spinner"></div>';
        try {
            const today = new Date().toISOString().split('T')[0];
            const monthKey = today.slice(0, 7);
            const companiesSnap = await firebase.firestore().collection('companies').limit(500).get();

            const usagePromises = companiesSnap.docs.map(async doc => {
                try {
                    const [todaySnap, monthSnap] = await Promise.all([
                        firebase.firestore().collection('companies').doc(doc.id)
                            .collection('aiUsageLog').where('date', '==', today).get(),
                        firebase.firestore().collection('companies').doc(doc.id)
                            .collection('aiUsageLog').where('month', '==', monthKey).get()
                    ]);
                    return {
                        id: doc.id,
                        todayTokens: todaySnap.docs.reduce((s, d) => s + (d.data().tokens || 0), 0),
                        monthTokens: monthSnap.docs.reduce((s, d) => s + (d.data().tokens || 0), 0)
                    };
                } catch(e) { return { id: doc.id, todayTokens: 0, monthTokens: 0 }; }
            });

            const usageData = await Promise.all(usagePromises);
            const usageMap = {};
            usageData.forEach(u => { usageMap[u.id] = u; });
            renderSuperadminPanel(companiesSnap.docs, usageMap);
        } catch(e) {
            if (container) container.innerHTML = `<p style="color:red;padding:1rem;">Помилка: ${e.message}</p>`;
        }
    }
    window.loadSuperadminData = loadSuperadminData;

    function renderSuperadminPanel(companyDocs, usageMap) {
        const container = document.getElementById('superadminContent');
        if (!container) return;

        const rows = companyDocs.map(doc => {
            const c = doc.data();
            const usage = usageMap[doc.id] || { todayTokens: 0, monthTokens: 0 };
            const dailyLimit = c.aiDailyTokenLimit || 0;
            const pct = dailyLimit > 0 ? Math.min(100, Math.round(usage.todayTokens / dailyLimit * 100)) : 0;
            const pctColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f97316' : '#22c55e';
            const safeId = doc.id.replace(/['"]/g, '');
            const safeName = (c.name || doc.id).replace(/'/g, "\\'");

            return `<tr data-company-id="${safeId}" style="border-bottom:1px solid #f3f4f6;">
                <td style="font-weight:600;padding:0.55rem 0.5rem;font-size:0.85rem;">${c.name || doc.id}</td>
                <td style="padding:0.4rem 0.5rem;">
                    <label class="toggle-switch" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
                        <input type="checkbox" ${c.aiEnabled !== false ? 'checked' : ''}
                            onchange="toggleCompanyAI('${safeId}', this.checked)"
                            style="width:16px;height:16px;accent-color:#22c55e;cursor:pointer;">
                    </label>
                </td>
                <td style="padding:0.4rem 0.5rem;">
                    <input type="number" value="${c.aiDailyTokenLimit || ''}" placeholder="∞"
                        min="0" step="1000"
                        style="width:90px;padding:0.3rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;"
                        onchange="updateAILimit('${safeId}', 'aiDailyTokenLimit', this.value)">
                </td>
                <td style="padding:0.4rem 0.5rem;">
                    <input type="number" value="${c.aiMonthlyTokenLimit || ''}" placeholder="∞"
                        min="0" step="10000"
                        style="width:100px;padding:0.3rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.82rem;"
                        onchange="updateAILimit('${safeId}', 'aiMonthlyTokenLimit', this.value)">
                </td>
                <td style="padding:0.4rem 0.5rem;">
                    <div style="font-size:0.82rem;font-weight:600;">${usage.todayTokens.toLocaleString()}</div>
                    ${dailyLimit > 0 ? `<div style="height:4px;background:#e5e7eb;border-radius:2px;width:80px;margin-top:3px;">
                        <div style="height:100%;width:${pct}%;background:${pctColor};border-radius:2px;"></div></div>` : ''}
                </td>
                <td style="padding:0.4rem 0.5rem;font-size:0.82rem;">${usage.monthTokens.toLocaleString()}</td>
                <td style="padding:0.4rem 0.5rem;">
                    <button onclick="openFeatureFlags('${safeId}', '${safeName}')"
                        style="padding:0.3rem 0.7rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;white-space:nowrap;">
                        <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span> Модулі
                    </button>
                </td>
            </tr>`;
        }).join('');

        container.innerHTML = `
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem;">
            <span style="font-size:0.85rem;color:#6b7280;">Компаній: <strong>${companyDocs.length}</strong></span>
            <button onclick="loadSuperadminData()" style="margin-left:auto;padding:0.35rem 0.8rem;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:0.8rem;">↻ Оновити</button>
            <button onclick="deleteEmptyCompanies()" style="padding:0.35rem 0.8rem;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;">🗑 Видалити пусті (0 юзерів)</button>
            <button onclick="openGlobalAISettings()" style="padding:0.35rem 0.8rem;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span> Глобальні налаштування</button>
        </div>
        <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
            <thead><tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
                <th style="padding:0.5rem;text-align:left;font-size:0.8rem;">Компанія</th>
                <th style="padding:0.5rem;text-align:left;font-size:0.8rem;">AI</th>
                <th style="padding:0.5rem;text-align:left;font-size:0.8rem;">Ліміт/день</th>
                <th style="padding:0.5rem;text-align:left;font-size:0.8rem;">Ліміт/міс</th>
                <th style="padding:0.5rem;text-align:left;font-size:0.8rem;">Сьогодні</th>
                <th style="padding:0.5rem;text-align:left;font-size:0.8rem;">Цей місяць</th>
                <th style="padding:0.5rem;text-align:left;font-size:0.8rem;">Доступ</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table></div>`;
    }

    window.toggleCompanyAI = async function(companyId, enabled) {
        try {
            await firebase.firestore().collection('companies').doc(companyId).update({ aiEnabled: enabled });
            showToast && showToast(`AI ${enabled ? 'увімкнено' : 'вимкнено'}`, 'success');
        } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
    };

    window.updateAILimit = async function(companyId, field, value) {
        const num = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
        try {
            await firebase.firestore().collection('companies').doc(companyId).update({ [field]: num });
            showToast && showToast('Ліміт збережено ✓', 'success');
        } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
    };

    window.openFeatureFlags = async function(companyId, companyName) {
        try {
            const doc = await firebase.firestore().collection('companies').doc(companyId).get();
            const features = doc.data().features || {};
            const checks = FEATURES.map(f => `
                <label style="display:flex;align-items:center;gap:0.75rem;padding:0.55rem 0;border-bottom:1px solid #f3f4f6;cursor:pointer;">
                    <input type="checkbox" ${features[f.key] !== false ? 'checked' : ''}
                        data-feature="${f.key}" style="width:16px;height:16px;accent-color:#22c55e;cursor:pointer;">
                    <span style="font-size:0.88rem;">${f.label}</span>
                </label>`).join('');

            document.getElementById('featureFlagsOverlay')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'featureFlagsOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10030;display:flex;align-items:center;justify-content:center;padding:1rem;';
            overlay.innerHTML = `
                <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:440px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                        <h3 style="margin:0;font-size:1rem;font-weight:700;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span> Модулі: ${companyName}</h3>
                        <button onclick="document.getElementById('featureFlagsOverlay').remove()" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9ca3af;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
                    </div>
                    <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
                        <button onclick="toggleAllFeatures(true)" style="padding:0.3rem 0.7rem;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;border-radius:6px;cursor:pointer;font-size:0.78rem;">✓ Всі</button>
                        <button onclick="toggleAllFeatures(false)" style="padding:0.3rem 0.7rem;background:#fef2f2;border:1px solid #fecaca;color:#ef4444;border-radius:6px;cursor:pointer;font-size:0.78rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span> Жодного</button>
                    </div>
                    <div id="featureChecksList">${checks}</div>
                    <div style="display:flex;gap:0.5rem;margin-top:1rem;">
                        <button onclick="document.getElementById('featureFlagsOverlay').remove()" style="flex:1;padding:0.55rem;border:1px solid #e5e7eb;background:white;border-radius:8px;cursor:pointer;">Скасувати</button>
                        <button onclick="saveFeatureFlags('${companyId}')" style="flex:2;padding:0.55rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">✓ Зберегти</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
        } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
    };

    window.toggleAllFeatures = function(val) {
        document.querySelectorAll('#featureChecksList input[type=checkbox]').forEach(cb => cb.checked = val);
    };

    window.saveFeatureFlags = async function(companyId) {
        const features = {};
        document.querySelectorAll('#featureChecksList input[type=checkbox]').forEach(cb => {
            features[cb.dataset.feature] = cb.checked;
        });
        try {
            await firebase.firestore().collection('companies').doc(companyId).update({ features });
            document.getElementById('featureFlagsOverlay')?.remove();
            showToast && showToast('Модулі збережено ✓', 'success');
            await loadSuperadminData();
        } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
    };

    window.openGlobalAISettings = async function() {
        try {
            const [aiDoc, modelsDoc, saDoc] = await Promise.all([
                firebase.firestore().collection('settings').doc('ai').get(),
                firebase.firestore().collection('settings').doc('aiModels').get(),
                firebase.firestore().collection('settings').doc('platform').get(),
            ]);
            const s = aiDoc.exists ? aiDoc.data() : {};
            const saSettings = saDoc.exists ? saDoc.data() : {};
            const platformKeyStored = !!saSettings.openaiApiKey;

            // Дефолтні моделі якщо ще немає в Firebase
            const defaultModels = {
                openai: [
                    ['gpt-5.4',      'GPT-5.4 (флагман)'],
                    ['gpt-5.2',      'GPT-5.2'],
                    ['gpt-5',        'GPT-5'],
                    ['gpt-5-mini',   'GPT-5 mini'],
                    ['gpt-4.1',      'GPT-4.1'],
                    ['gpt-4.1-mini', 'GPT-4.1 mini'],
                    ['gpt-4.1-nano', 'GPT-4.1 nano'],
                    ['o4-mini',      'o4-mini'],
                    ['o3',           'o3'],
                    ['gpt-4o',       'GPT-4o'],
                    ['gpt-4o-mini',  'GPT-4o mini'],
                ],
                anthropic: [
                    ['claude-opus-4-5',          'Claude Opus 4.5'],
                    ['claude-sonnet-4-5',         'Claude Sonnet 4.5'],
                    ['claude-haiku-4-5-20251001', 'Claude Haiku 4.5'],
                ],
                google: [
                    ['gemini-2.5-pro',   'Gemini 2.5 Pro'],
                    ['gemini-2.0-flash', 'Gemini 2.0 Flash'],
                    ['gemini-1.5-pro',   'Gemini 1.5 Pro'],
                    ['gemini-1.5-flash', 'Gemini 1.5 Flash'],
                ]
            };
            // Firestore не підтримує nested arrays — конвертуємо {id,name} → [id,name] для роботи в UI
            const _fromFirestore = (data) => {
                const result = {};
                ["openai","anthropic","google"].forEach(p => {
                    if (!data[p]) return;
                    result[p] = data[p].map(m => Array.isArray(m) ? m : [m.id||m[0]||"", m.name||m[1]||""]);
                });
                return result;
            };
            const rawModels = modelsDoc.exists ? modelsDoc.data() : defaultModels;
            const _mConverted = _fromFirestore(rawModels);
            const _mFinal = Object.keys(_mConverted).length ? _mConverted : defaultModels;
            // Зберігаємо в глобальну змінну для доступу з функцій
            window._editingModels = JSON.parse(JSON.stringify(_mFinal));

            document.getElementById('globalAIOverlay')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'globalAIOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10030;display:flex;align-items:center;justify-content:center;padding:1rem;';

            const renderModelsTab = (provider) => {
                const list = (window._editingModels[provider] || []);
                return `<div id="modelsTabContent">
                    <div style="display:flex;gap:6px;margin-bottom:10px;">
                        ${['openai','anthropic','google'].map(p => `
                            <button onclick="window._switchModelsProvider('${p}')"
                                id="mtp_${p}"
                                style="flex:1;padding:6px 4px;border:1px solid ${provider===p?'#22c55e':'#e5e7eb'};
                                border-radius:8px;background:${provider===p?'#f0fdf4':'white'};
                                color:${provider===p?'#16a34a':'#374151'};font-size:11px;font-weight:600;cursor:pointer;">
                                ${p==='openai'?'OpenAI':p==='anthropic'?'Anthropic':'Google'}
                            </button>`).join('')}
                    </div>
                    <div id="modelsList" style="max-height:220px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:8px;padding:6px;">
                        ${list.map((m,i) => `
                            <div style="display:flex;gap:6px;align-items:center;margin-bottom:5px;">
                                <input value="${m[0]}" placeholder="model-id"
                                    onchange="window._editingModels[window._currentModelProvider][${i}][0]=this.value"
                                    style="flex:1;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;font-family:monospace;">
                                <input value="${m[1]}" placeholder="Назва"
                                    onchange="window._editingModels[window._currentModelProvider][${i}][1]=this.value"
                                    style="flex:1.5;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;">
                                <button onclick="window._removeModel(${i})"
                                    style="padding:4px 8px;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-size:12px;">✕</button>
                            </div>`).join('')}
                    </div>
                    <button onclick="window._addModel()"
                        style="width:100%;margin-top:8px;padding:6px;background:#f0fdf4;color:#16a34a;
                        border:1px solid #bbf7d0;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">
                        + Додати модель
                    </button>
                </div>`;
            };

            window._currentModelProvider = 'openai';
            const _rerenderModels = (p) => {
                const tab = document.getElementById('aiTab_models');
                if (tab) tab.innerHTML = `<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                        Редагуй список моделей — зміни одразу видні всім клієнтам без деплою коду.
                    </div>` + renderModelsTab(p);
            };
            window._switchModelsProvider = (p) => {
                window._currentModelProvider = p;
                _rerenderModels(p);
            };
            window._addModel = () => {
                if (!window._editingModels[window._currentModelProvider]) window._editingModels[window._currentModelProvider] = [];
                window._editingModels[window._currentModelProvider].push(['', 'Нова модель']);
                _rerenderModels(window._currentModelProvider);
            };
            window._removeModel = (i) => {
                window._editingModels[window._currentModelProvider].splice(i, 1);
                _rerenderModels(window._currentModelProvider);
            };

            overlay.innerHTML = `
                <div style="background:white;border-radius:16px;width:100%;max-width:520px;max-height:90vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);display:flex;flex-direction:column;">
                <div style="padding:1.5rem 1.5rem 0;overflow-y:auto;flex:1;">
                    <h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;"><span style="display:inline-flex;align-items:center;gap:6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 1 21 12a10 10 0 0 1-1.93 7.07M4.93 4.93A10 10 0 0 0 3 12a10 10 0 0 0 1.93 7.07M12 2v2M12 20v2M2 12h2M20 12h2"/></svg> Глобальні AI налаштування</span></h3>

                    <!-- TABS -->
                    <div style="display:flex;gap:4px;background:#f3f4f6;border-radius:10px;padding:3px;margin-bottom:1rem;">
                        <button onclick="window._switchAiTab('general')" id="aiTabBtn_general"
                            style="flex:1;padding:6px;background:white;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            Загальні
                        </button>
                        <button onclick="window._switchAiTab('agents')" id="aiTabBtn_agents"
                            style="flex:1;padding:6px;background:transparent;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;color:#6b7280;">
                            <span style="display:inline-flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg> AI Агенти</span>
                        </button>
                        <button onclick="window._switchAiTab('models')" id="aiTabBtn_models"
                            style="flex:1;padding:6px;background:transparent;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;color:#6b7280;">
                            Моделі
                        </button>
                    </div>

                    <!-- TAB: GENERAL -->
                    <div id="aiTab_general">
                        <!-- Платформний OpenAI ключ -->
                        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:0.75rem;margin-bottom:1rem;">
                            <div style="font-size:0.78rem;font-weight:700;color:#1d4ed8;margin-bottom:6px;">
                                🔑 Платформний OpenAI API Key
                            </div>
                            <div style="font-size:0.72rem;color:#1e40af;margin-bottom:8px;">
                                Діє на всі компанії платформи. Компанія може перевизначити власним ключем.
                                ${platformKeyStored ? '<span style="background:#dcfce7;color:#16a34a;padding:2px 6px;border-radius:4px;font-weight:600;">✓ Ключ збережено</span>' : '<span style="background:#fef2f2;color:#dc2626;padding:2px 6px;border-radius:4px;font-weight:600;">⚠ Не встановлено</span>'}
                            </div>
                            <div style="display:flex;gap:6px;">
                                <input type="password" id="platformOpenAiKey" placeholder="${platformKeyStored ? '••••••••••••••••' : 'sk-...'}"
                                    style="flex:1;padding:0.45rem 0.6rem;border:1px solid #bfdbfe;border-radius:8px;font-size:0.85rem;font-family:monospace;box-sizing:border-box;">
                                ${platformKeyStored ? `<button onclick="clearPlatformKey()" style="padding:0.45rem 0.7rem;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;cursor:pointer;font-size:0.8rem;white-space:nowrap;">✕ Очистити</button>` : ''}
                            </div>
                            <div style="font-size:0.7rem;color:#6b7280;margin-top:4px;">Залиш порожнім щоб не змінювати поточний ключ</div>
                        </div>

                        <label style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;cursor:pointer;">
                            <input type="checkbox" id="globalAiEnabled" ${s.globalAiEnabled !== false ? 'checked' : ''} style="width:16px;height:16px;accent-color:#22c55e;">
                            <span style="font-weight:600;">AI увімкнено глобально</span>
                        </label>
                        <div style="margin-bottom:0.75rem;">
                            <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Ліміт/день по замовчуванню (токени)</label>
                            <input type="number" id="globalDailyLimit" value="${s.defaultDailyLimit || ''}" placeholder="Без ліміту" min="0" step="1000"
                                style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                        </div>
                        <div style="margin-bottom:1rem;">
                            <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">Ліміт/місяць по замовчуванню (токени)</label>
                            <input type="number" id="globalMonthlyLimit" value="${s.defaultMonthlyLimit || ''}" placeholder="Без ліміту" min="0" step="10000"
                                style="width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.88rem;box-sizing:border-box;">
                        </div>
                    </div>

                    <!-- TAB: AGENTS -->
                    <div id="aiTab_agents" style="display:none;">
                        <div style="font-size:11px;color:#6b7280;margin-bottom:12px;">
                            Налаштуй промпт і модель для кожного AI агента платформи.<br>
                            Якщо промпт порожній — використовується вбудований дефолт.
                        </div>
                        ${window._renderAgentsTab(saSettings.agents || {})}
                    </div>

                    <!-- TAB: MODELS -->
                    <div id="aiTab_models" style="display:none;">
                        <div style="font-size:11px;color:#6b7280;margin-bottom:8px;">
                            Редагуй список моделей — зміни одразу видні всім клієнтам без деплою коду.
                        </div>
                        ${renderModelsTab('openai')}
                    </div>

                </div>
                    <div style="display:flex;gap:0.5rem;padding:1rem 1.5rem 1.5rem;border-top:1px solid #f3f4f6;flex-shrink:0;">
                        <button onclick="document.getElementById('globalAIOverlay').remove()" style="flex:1;padding:0.55rem;border:1px solid #e5e7eb;background:white;border-radius:8px;cursor:pointer;">Скасувати</button>
                        <button onclick="saveGlobalAISettings()" style="flex:2;padding:0.55rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;"><span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Зберегти все</span></button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
        } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
    };

    window.saveGlobalAISettings = async function() {
        const enabled  = document.getElementById('globalAiEnabled')?.checked ?? true;
        const daily    = parseInt(document.getElementById('globalDailyLimit')?.value) || 0;
        const monthly  = parseInt(document.getElementById('globalMonthlyLimit')?.value) || 0;
        const newKey   = document.getElementById('platformOpenAiKey')?.value?.trim() || '';

        // Збираємо агентів
        const agents = {};
        Object.keys(DEFAULT_AGENTS).forEach(key => {
            const prompt = document.getElementById(`agent_prompt_${key}`)?.value?.trim() || '';
            const model  = document.getElementById(`agent_model_${key}`)?.value?.trim() || 'gpt-4o-mini';
            agents[key] = { systemPrompt: prompt, model };
        });

        // Зберігаємо input-значення моделей перед збереженням (onchange може не спрацювати)
        const provider = window._currentModelProvider || 'openai';
        const modelInputs = document.querySelectorAll('#modelsList [id^="mId_"], #modelsList input');
        // Синхронізуємо моделі з DOM якщо є відкрита вкладка
        try {
            const rows = document.querySelectorAll('#modelsList > div');
            if (rows.length && window._editingModels && window._currentModelProvider) {
                const prov = window._currentModelProvider;
                if (!window._editingModels[prov]) window._editingModels[prov] = [];
                rows.forEach((row, i) => {
                    const inputs = row.querySelectorAll('input');
                    if (inputs[0] && inputs[1] && window._editingModels[prov][i]) {
                        window._editingModels[prov][i][0] = inputs[0].value;
                        window._editingModels[prov][i][1] = inputs[1].value;
                    }
                });
            }
        } catch(_) {}

        const saveBtn = document.querySelector('#globalAIOverlay button[onclick="saveGlobalAISettings()"]');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Збереження...'; }

        try {
            const batch = firebase.firestore().batch();
            // Загальні налаштування
            batch.set(
                firebase.firestore().collection('settings').doc('ai'),
                { globalAiEnabled: enabled, defaultDailyLimit: daily, defaultMonthlyLimit: monthly },
                { merge: true }
            );
            // Платформний ключ + агенти → superadmin/settings
            const saUpdate = { agents, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
            if (newKey) {
                saUpdate.openaiApiKey = newKey;
                saUpdate.keyUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
            }
            batch.set(
                firebase.firestore().collection('settings').doc('platform'),
                saUpdate,
                { merge: true }
            );
            // Моделі — конвертуємо [id,name] → {id,name} бо Firestore не підтримує nested arrays
            if (window._editingModels) {
                const _toFirestore = (data) => {
                    const result = {};
                    Object.keys(data).forEach(p => {
                        result[p] = (data[p] || []).map(m => Array.isArray(m) ? {id: m[0], name: m[1]} : m);
                    });
                    return result;
                };
                batch.set(
                    firebase.firestore().collection('settings').doc('aiModels'),
                    _toFirestore(window._editingModels)
                );
            }
            await batch.commit();
            document.getElementById('globalAIOverlay')?.remove();
            window._cachedAiModels = window._editingModels || null;
            showToast && showToast('Збережено ✓', 'success');
        } catch(e) {
            console.error('[saveGlobalAISettings] error:', e);
            if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Зберегти все</span>'; }
            const msg = e.code === 'permission-denied'
                ? 'Немає прав для збереження. Переконайся що залогінений як SuperAdmin (management.talco@gmail.com)'
                : 'Помилка: ' + e.message;
            showToast && showToast(msg, 'error');
            alert(msg);
        }
    };

    // ── AI Агенти — дефолтні промпти ────────────────────────
    const DEFAULT_AGENTS = {
        statistics: {
            label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Аналіз статистики</span>',
            where:       'Статистика → кнопка AI',
            defaultPrompt: `Ти бізнес-аналітик. Проаналізуй метрики компанії за вказаний період.
Дай відповідь структуровано:
📊 Діагноз — що відбувається з ключовими показниками
🔍 Причини — чому метрики відхиляються від цілей
⚠️ Ризики — що станеться якщо не змінити
✅ Дії — 3 конкретні кроки з очікуваним результатом (+/- сума або %)
📈 Прогноз — що буде через місяць якщо впровадити рекомендації
Відповідай українською, коротко і по суті. Максимум 5 речень на блок.`,
        },
        incidents: {
            label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Журнал збоїв</span>',
            where:       'Контроль → Збої → AI режим',
            defaultPrompt: `Ти бізнес-аналітик систем і процесів. Допомагаєш фіксувати збої в роботі компанії.
Твоя задача — поставити уточнюючі питання і зібрати структурований опис інциденту.
Збери: що сталося, хто учасники, який процес провалився, причина, наслідки, що потрібно змінити.
Коли зібрав достатньо — поверни JSON з полями: title, category, severity, responsible, description, participants, failedProcess, cause, consequences, toChange.
Спілкуйся коротко, по-діловому, українською мовою.`,
        },
        finance: {
            label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінансовий аналіз</span>',
            where:       'Фінанси → AI чат',
            defaultPrompt: `Ти фінансовий аналітик малого бізнесу. Аналізуєш P&L, маржинальність, cashflow.
Принципи роботи:
- Завжди порівнюй маржу з бенчмарком ніші
- Якщо маржа нижче норми — шукай причину в конкретних категоріях витрат
- Якщо маржа вище норми — поясни чому і як утримати
- Давай числові прогнози (+/- скільки грошей від конкретної дії)
Відповідай українською, коротко і по суті.
Формат: 📊 Діагноз → 🔍 Причина → ⚠️ Наслідок → ✅ Дія. Максимум 4-5 речень на блок.`,
        },
        coordination: {
            label:       '<span style="display:inline-flex;align-items:center;gap:5px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Координація</span>',
            where:       'Координація → AI аналіз патернів',
            defaultPrompt: `Ти AI-аналітик TALKO. Аналізуєш патерни координаційних зустрічей компанії.
Дай конкретні рекомендації на основі даних:
- Які рішення повторюються — чому процес не закріплено
- Які питання хронічно не вирішуються — де системна проблема
- Скільки часу витрачається на зустрічі — чи ефективно
Відповідь: 3-5 конкретних рекомендацій з очікуваним результатом.
Мова — українська, коротко.`,
        },
    };

    // ── Рендер вкладки Агенти ───────────────────────────────
    window._renderAgentsTab = function(savedAgents) {
        return Object.entries(DEFAULT_AGENTS).map(([key, agent]) => {
            const saved = savedAgents[key] || {};
            const prompt = saved.systemPrompt || '';
            const model  = saved.model || 'gpt-4o-mini';
            return `
            <div style="border:1px solid #e5e7eb;border-radius:10px;padding:0.75rem;margin-bottom:0.75rem;">
                <div style="font-weight:700;font-size:0.85rem;margin-bottom:2px;">${agent.label}</div>
                <div style="font-size:0.7rem;color:#6b7280;margin-bottom:8px;">
                    Використовується: <span style="background:#f3f4f6;padding:1px 6px;border-radius:4px;">${agent.where}</span>
                </div>
                <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center;">
                    <label style="font-size:0.72rem;font-weight:600;color:#374151;white-space:nowrap;">Модель:</label>
                    <input id="agent_model_${key}" value="${model}"
                        placeholder="gpt-4o-mini"
                        style="flex:1;padding:4px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.78rem;font-family:monospace;">
                </div>
                <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <label style="font-size:0.72rem;font-weight:600;color:#374151;">Системний промпт:</label>
                        <button onclick="window._resetAgentPrompt('${key}')"
                            style="font-size:0.68rem;color:#6b7280;background:none;border:none;cursor:pointer;text-decoration:underline;">
                            <span style="display:inline-flex;align-items:center;gap:3px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg> Дефолт</span>
                        </button>
                    </div>
                    <textarea id="agent_prompt_${key}" rows="4"
                        placeholder="${agent.defaultPrompt.slice(0, 80)}..."
                        style="width:100%;padding:6px 8px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.75rem;line-height:1.4;resize:vertical;box-sizing:border-box;font-family:inherit;">${prompt}</textarea>
                    ${!prompt ? `<div style="font-size:0.68rem;color:#9ca3af;">Порожньо = використовується вбудований дефолт</div>` : ''}
                </div>
            </div>`;
        }).join('');
    };

    window._resetAgentPrompt = function(key) {
        const el = document.getElementById(`agent_prompt_${key}`);
        if (el) {
            el.value = DEFAULT_AGENTS[key]?.defaultPrompt || '';
            showToast && showToast('Промпт відновлено', 'success');
        }
    };

    // ── Перемикання табів ────────────────────────────────────
    window._switchAiTab = function(tab) {
        ['general', 'agents', 'models'].forEach(t => {
            const btn = document.getElementById(`aiTabBtn_${t}`);
            const panel = document.getElementById(`aiTab_${t}`);
            const active = t === tab;
            if (btn) {
                btn.style.background = active ? 'white' : 'transparent';
                btn.style.color = active ? '#111' : '#6b7280';
                btn.style.boxShadow = active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
            }
            if (panel) panel.style.display = active ? '' : 'none';
        });
    };

    window.clearPlatformKey = async function() {
        if (!confirm('Видалити платформний OpenAI ключ? Компанії без власного ключа втратять доступ до AI.')) return;
        try {
            await firebase.firestore().collection('settings').doc('platform').update({
                openaiApiKey: firebase.firestore.FieldValue.delete(),
            });
            showToast && showToast('Ключ видалено', 'success');
            document.getElementById('globalAIOverlay')?.remove();
        } catch(e) { showToast && showToast('Помилка: ' + e.message, 'error'); }
    };

})();
