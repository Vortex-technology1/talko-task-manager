// ============================================================
// MODULE 66 — STATISTICS / METRICS v1.2
// ============================================================
// Fixes: P0-1 function scope aggregation, P0-2 upsert keys,
// P0-3 function selector, P1-1 target scopeId, P1-2 whitelist,
// P2-1 scoped loadEntries
// ============================================================
(function() {
    'use strict';

    // ========================
    //  STATE
    // ========================
    let statsMetrics = [];
    let statsEntries = [];
    let statsTargets = [];
    let statsCurrentScope = 'my';       // my | function | company
    let statsCurrentView = 'dashboard'; // dashboard | table | charts
    let statsPeriodOffset = 0;
    let statsEditingMetricId = null;
    let statsSelectedFunctionId = null; // P0-3: explicit function selection

    // ========================
    //  PERIOD HELPERS
    // ========================
    function getStatsPeriodType() {
        return document.getElementById('statsPeriodType')?.value || 'weekly';
    }

    function toWeekKey(d) {
        const dt = new Date(d);
        dt.setHours(12, 0, 0, 0);
        const dow = dt.getDay() || 7;
        dt.setDate(dt.getDate() - dow + 4);
        const y = dt.getFullYear();
        const j1 = new Date(y, 0, 1);
        const wn = Math.ceil(((dt - j1) / 864e5 + j1.getDay() + 1) / 7);
        return y + '-W' + String(wn).padStart(2, '0');
    }

    function getStatsPeriodKey(off) {
        const now = new Date();
        const tp = getStatsPeriodType();
        if (tp === 'daily') {
            const d = new Date(now);
            d.setDate(d.getDate() + off);
            return d.toISOString().split('T')[0];
        }
        if (tp === 'weekly') {
            const d = new Date(now);
            d.setDate(d.getDate() + off * 7);
            return toWeekKey(d);
        }
        const d = new Date(now.getFullYear(), now.getMonth() + off, 1);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }

    function formatPeriodLabel(k) {
        if (!k) return '';
        if (k.includes('-W')) {
            const [y, w] = k.split('-W');
            return (t('week') || 'Тиждень') + ' ' + parseInt(w) + ', ' + y;
        }
        if (k.length === 7) {
            const ms = ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'];
            const [y, m] = k.split('-');
            return ms[parseInt(m) - 1] + ' ' + y;
        }
        return k;
    }

    function statsNavigatePeriod(dir) {
        statsPeriodOffset += dir;
        renderStatistics();
    }

    // ========================
    //  SCOPE CONTROL
    // ========================
    function setStatsScope(scope) {
        // P1-4: employee cannot see company scope
        if (scope === 'company' && getUserRole() === 'employee') scope = 'my';
        statsCurrentScope = scope;

        document.querySelectorAll('[id^="statsScope"]').forEach(el => el.classList.remove('active'));
        const map = { my: 'My', function: 'Func', company: 'Company' };
        const btn = document.getElementById('statsScope' + map[scope]);
        if (btn) btn.classList.add('active');

        // P0-3: show/hide function selector
        updateFunctionSelector();
        renderStatistics();
    }

    function setStatsView(v) {
        statsCurrentView = v;
        document.querySelectorAll('[data-sview]').forEach(el => {
            el.classList.toggle('active', el.dataset.sview === v);
            el.style.background = el.dataset.sview === v ? 'white' : 'transparent';
        });
        renderStatistics();
    }

    // P0-3: Function selector dropdown for multi-function users
    function updateFunctionSelector() {
        const container = document.getElementById('statsFunctionSelector');
        if (!container) return;

        if (statsCurrentScope !== 'function') {
            container.style.display = 'none';
            return;
        }

        const user = users.find(u => u.id === currentUser?.uid);
        const userFuncIds = user?.functions ? Object.keys(user.functions) : [];
        const funcs = (typeof functions !== 'undefined' ? functions : [])
            .filter(f => getUserRole() === 'owner' || userFuncIds.includes(f.id));

        if (funcs.length === 0) {
            container.style.display = 'none';
            return;
        }

        // Auto-select: restore last or pick first
        if (!statsSelectedFunctionId || !funcs.find(f => f.id === statsSelectedFunctionId)) {
            try { statsSelectedFunctionId = localStorage.getItem('talko_stats_last_func'); } catch(e) {}
            if (!statsSelectedFunctionId || !funcs.find(f => f.id === statsSelectedFunctionId)) {
                statsSelectedFunctionId = funcs[0].id;
            }
        }

        container.style.display = 'flex';
        container.innerHTML = '<select id="statsFuncDropdown" onchange="onStatsFunctionChange(this.value)" ' +
            'style="padding:0.4rem 0.6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:0.85rem;font-weight:500;">' +
            funcs.map(f =>
                '<option value="' + f.id + '"' + (f.id === statsSelectedFunctionId ? ' selected' : '') + '>' +
                esc(f.name || f.title || '') + '</option>'
            ).join('') + '</select>';
    }

    function onStatsFunctionChange(fid) {
        statsSelectedFunctionId = fid;
        try { localStorage.setItem('talko_stats_last_func', fid); } catch(e) {}
        renderStatistics();
    }

    // P0-3: Get user IDs that belong to a specific function
    function getUsersInFunction(functionId) {
        if (!functionId) return [];
        return users
            .filter(u => u.functions && u.functions[functionId])
            .map(u => u.id);
    }

    // ========================
    //  ACCESS CONTROL
    // ========================
    function getUserRole() {
        return (users.find(u => u.id === currentUser?.uid))?.role || 'employee';
    }

    function canViewStats() {
        if (!currentUser || !currentCompany) return false;
        const u = users.find(u => u.id === currentUser.uid);
        return u ? (u.role === 'owner' || u.canViewStatsTab !== false) : false;
    }

    // P1-2: Fixed whitelist logic
    function canViewMetric(m) {
        if (!currentUser) return false;
        const u = users.find(u => u.id === currentUser.uid);
        if (!u) return false;
        if (u.role === 'owner') return true;
        if (m.privacy === 'owner_only') return false;

        // P1-2: If user has useMetricWhitelist flag or allowedMetricIds field exists,
        // treat it as strict whitelist (even if empty = nothing visible)
        if (u.useMetricWhitelist || (u.allowedMetricIds && typeof u.allowedMetricIds === 'object')) {
            return !!(u.allowedMetricIds && u.allowedMetricIds[m.id]);
        }

        // No whitelist → check function bindings
        if (m.boundFunctions && u.functions) {
            for (const fid of Object.keys(u.functions)) {
                if (m.boundFunctions[fid]) return true;
            }
        }
        return m.privacy === 'public';
    }

    function canEditMetrics() {
        const r = getUserRole();
        return r === 'owner' || r === 'manager';
    }

    function showStatsTabIfAllowed() {
        const s = canViewStats();
        const tb = document.getElementById('statisticsTabBtn');
        const mb = document.getElementById('statsMobileBtn');
        if (tb) tb.style.display = s ? '' : 'none';
        if (mb) mb.style.display = s ? '' : 'none';
    }

    let statsAggregates = []; // pre-computed by Cloud Functions

    function aggregatesRef() { return db.collection('companies').doc(currentCompany).collection('metricAggregates'); }

    async function loadAggregates(pk) {
        if (!currentCompany || !pk) return;
        try {
            const s = await aggregatesRef().where('periodKey', '==', pk).get();
            statsAggregates = s.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { console.error('[STATS] loadAggregates:', e); }
    }

    // ========================
    //  FIRESTORE
    // ========================
    function metricsRef() { return db.collection('companies').doc(currentCompany).collection('metrics'); }
    function entriesRef() { return db.collection('companies').doc(currentCompany).collection('metricEntries'); }
    function targetsRef() { return db.collection('companies').doc(currentCompany).collection('metricTargets'); }
    function insightsRef() { return db.collection('companies').doc(currentCompany).collection('metricInsights'); }

    async function loadMetrics() {
        if (!currentCompany) return;
        try {
            const s = await metricsRef().orderBy('createdAt', 'desc').get();
            statsMetrics = s.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { console.error('[STATS] loadMetrics:', e); }
    }

    // P2-1 + P1-2: Scoped loadEntries — minimize data pulled per role/scope
    async function loadEntries(pk) {
        if (!currentCompany || !pk) return;
        try {
            const role = getUserRole();
            let results = [];

            if (role === 'employee' && statsCurrentScope === 'my') {
                // Employee "my" view: only own entries
                const s = await entriesRef()
                    .where('periodKey', '==', pk)
                    .where('createdBy', '==', currentUser.uid)
                    .get();
                results = s.docs.map(d => ({ id: d.id, ...d.data() }));

            } else if (statsCurrentScope === 'function' && statsSelectedFunctionId) {
                // Function view: pull function-scope entries for this function
                const funcSnap = await entriesRef()
                    .where('periodKey', '==', pk)
                    .where('scope', '==', 'function')
                    .where('scopeId', '==', statsSelectedFunctionId)
                    .get();
                results = funcSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Also pull user-scope entries from people in this function
                const usersInFunc = getUsersInFunction(statsSelectedFunctionId);
                if (usersInFunc.length > 0) {
                    // Firestore 'in' supports up to 30 values
                    const chunks = [];
                    for (let i = 0; i < usersInFunc.length; i += 30) {
                        chunks.push(usersInFunc.slice(i, i + 30));
                    }
                    for (const chunk of chunks) {
                        const userSnap = await entriesRef()
                            .where('periodKey', '==', pk)
                            .where('scope', '==', 'user')
                            .where('createdBy', 'in', chunk)
                            .get();
                        results.push(...userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                    }
                }

            } else {
                // Owner/manager company view or fallback: pull all for period
                const s = await entriesRef().where('periodKey', '==', pk).get();
                results = s.docs.map(d => ({ id: d.id, ...d.data() }));
            }

            statsEntries = results;
        } catch (e) { console.error('[STATS] loadEntries:', e); }
    }

    async function loadTargets() {
        if (!currentCompany) return;
        try {
            const s = await targetsRef().get();
            statsTargets = s.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { console.error('[STATS] loadTargets:', e); }
    }

    // ========================
    //  SAVE METRIC
    // ========================
    async function saveMetric() {
        if (!canEditMetrics()) { showToast(t('noPermission') || 'Немає доступу', 'error'); return; }
        const name = document.getElementById('metricName')?.value?.trim();
        if (!name) { showToast(t('enterName') || 'Введіть назву', 'error'); return; }

        // Metric limit: max 50 per company
        if (!statsEditingMetricId && statsMetrics.length >= 50) {
            showToast(t('metricLimit') || 'Максимум 50 метрик на компанію', 'error');
            return;
        }

        const data = {
            name,
            unit: document.getElementById('metricUnit')?.value || 'шт',
            frequency: document.getElementById('metricFrequency')?.value || 'weekly',
            inputType: document.getElementById('metricInputType')?.value || 'manual',
            privacy: document.getElementById('metricPrivacy')?.value || 'public',
            formula: document.getElementById('metricFormula')?.value?.trim() || '',
            alertEnabled: document.getElementById('metricAlertEnabled')?.checked || false,
            alertThreshold: parseInt(document.getElementById('metricAlertThreshold')?.value) || 20,
            boundFunctions: {},
            autoSpec: null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        document.querySelectorAll('#metricFunctionsList input[type="checkbox"]:checked').forEach(cb => {
            data.boundFunctions[cb.value] = true;
        });

        if (data.inputType === 'auto') {
            data.autoSpec = {
                type: document.getElementById('autoSpecType')?.value || 'task_count',
                functionId: document.getElementById('autoSpecFunction')?.value || '',
            };
        }

        try {
            if (statsEditingMetricId) {
                // P0-1: frequency is immutable after creation — don't update it
                delete data.frequency;
                await metricsRef().doc(statsEditingMetricId).update(data);
            } else {
                data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                data.createdBy = currentUser.uid;
                const ref = await metricsRef().add(data);
                const tv = parseFloat(document.getElementById('metricTarget')?.value);
                if (tv > 0) {
                    // Create target per current scope context
                    const targetScope = statsCurrentScope === 'function' && statsSelectedFunctionId
                        ? 'function' : 'company';
                    const targetScopeId = targetScope === 'function'
                        ? statsSelectedFunctionId : currentCompany;

                    await targetsRef().add({
                        metricId: ref.id,
                        periodKey: getStatsPeriodKey(0),
                        periodType: data.frequency,
                        scope: targetScope,
                        scopeId: targetScopeId,
                        targetValue: tv,
                        setBy: currentUser.uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }
            closeModal('metricModal');
            showToast(t('saved') || 'Збережено', 'success');
            await loadMetrics();
            renderStatistics();
        } catch (e) {
            console.error('[STATS] saveMetric:', e);
            showToast(t('error') || 'Помилка', 'error');
        }
    }

    async function deleteMetric(mid) {
        if (!confirm(t('confirmDeleteMetric') || 'Видалити метрику та всі дані?')) return;
        try {
            const batch = db.batch();
            batch.delete(metricsRef().doc(mid));
            for (const coll of [entriesRef(), targetsRef(), insightsRef()]) {
                const s = await coll.where('metricId', '==', mid).get();
                s.docs.forEach(d => batch.delete(d.ref));
            }
            await batch.commit();
            showToast(t('deleted') || 'Видалено', 'success');
            await loadMetrics();
            renderStatistics();
        } catch (e) { console.error('[STATS] deleteMetric:', e); }
    }

    // ========================
    //  SAVE ENTRY (P0-2: correct upsert keys)
    // ========================
    async function saveEntry(metricId, value, dateStr) {
        if (!currentCompany || !metricId) return;

        const metric = statsMetrics.find(m => m.id === metricId);
        const pt = metric?.frequency || getStatsPeriodType();
        const d = new Date(dateStr || new Date());
        const iso = d.toISOString().split('T')[0];

        let pk;
        if (pt === 'daily') pk = iso;
        else if (pt === 'weekly') pk = toWeekKey(d);
        else pk = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');

        // Determine scope+scopeId
        let scope = 'user';
        let scopeId = currentUser.uid;

        if (statsCurrentScope === 'function' && statsSelectedFunctionId) {
            scope = 'function';
            scopeId = statsSelectedFunctionId;
        } else if (statsCurrentScope === 'company') {
            scope = 'company';
            scopeId = currentCompany;
        }

        const data = {
            metricId, periodType: pt, periodKey: pk,
            scope, scopeId, date: iso,
            value: parseFloat(value) || 0,
            source: 'manual',
            // P0-2: function/company entries are explicit overrides
            isOverride: scope !== 'user',
            createdBy: currentUser.uid,
            userName: users.find(u => u.id === currentUser.uid)?.name || currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            // P0-2: Different upsert keys based on scope
            let query = entriesRef()
                .where('metricId', '==', metricId)
                .where('periodKey', '==', pk)
                .where('scope', '==', scope)
                .where('scopeId', '==', scopeId);

            // For user scope: include createdBy (each person has own entry)
            // For function/company: one entry per scope (no createdBy filter)
            if (scope === 'user') {
                query = query.where('createdBy', '==', currentUser.uid);
            }

            const ex = await query.limit(1).get();

            if (!ex.empty) {
                await ex.docs[0].ref.update({
                    value: data.value,
                    date: iso,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await entriesRef().add(data);
            }
        } catch (e) { console.error('[STATS] saveEntry:', e); }
    }

    // ========================
    //  DATA HELPERS
    // ========================

    // P0-1 + P1-1: Use aggregates when available, fallback to raw entries
    function getEntryForMetric(mid, pk) {
        if (statsCurrentScope === 'my') {
            return statsEntries.find(e =>
                e.metricId === mid && e.periodKey === pk && e.createdBy === currentUser.uid
            );
        }

        if (statsCurrentScope === 'function') {
            const fid = statsSelectedFunctionId;
            if (!fid) return null;

            // Try aggregate first (pre-computed by Cloud Function)
            const agg = statsAggregates.find(a =>
                a.metricId === mid && a.periodKey === pk && a.scope === 'function' && a.scopeId === fid
            );
            if (agg) return { value: agg.sum, _agg: true, _fromAggregate: true };

            // Fallback: priority chain from raw entries
            const funcEntry = statsEntries.find(e =>
                e.metricId === mid && e.periodKey === pk &&
                e.scope === 'function' && e.scopeId === fid
            );
            if (funcEntry) return funcEntry;

            const usersInFunc = getUsersInFunction(fid);
            const userEntries = statsEntries.filter(e =>
                e.metricId === mid && e.periodKey === pk &&
                e.scope === 'user' && usersInFunc.includes(e.createdBy)
            );
            if (userEntries.length === 0) return null;
            return { value: userEntries.reduce((s, e) => s + (e.value || 0), 0), _agg: true };
        }

        // Company scope
        const compAgg = statsAggregates.find(a =>
            a.metricId === mid && a.periodKey === pk && a.scope === 'company'
        );
        if (compAgg) return { value: compAgg.sum, _agg: true, _fromAggregate: true };

        // Fallback: strict priority chain
        const compEntry = statsEntries.find(e =>
            e.metricId === mid && e.periodKey === pk && e.scope === 'company'
        );
        if (compEntry) return compEntry;

        const funcEntries = statsEntries.filter(e =>
            e.metricId === mid && e.periodKey === pk && e.scope === 'function'
        );
        if (funcEntries.length > 0) {
            return { value: funcEntries.reduce((s, e) => s + (e.value || 0), 0), _agg: true };
        }

        const userEntries = statsEntries.filter(e =>
            e.metricId === mid && e.periodKey === pk && e.scope === 'user'
        );
        if (userEntries.length === 0) return null;
        return { value: userEntries.reduce((s, e) => s + (e.value || 0), 0), _agg: true };
    }

    // P1-1: Target lookup with scopeId
    function getTargetForMetric(mid, pk) {
        const sc = statsCurrentScope === 'my' ? 'user' : statsCurrentScope === 'function' ? 'function' : 'company';
        const sid = statsCurrentScope === 'my' ? currentUser.uid :
                    statsCurrentScope === 'function' ? statsSelectedFunctionId :
                    currentCompany;

        // Exact match: metricId + periodKey + scope + scopeId
        return statsTargets.find(t2 =>
                t2.metricId === mid && t2.periodKey === pk && t2.scope === sc && t2.scopeId === sid
            ) ||
            // Fallback: metricId + scope + scopeId (any period)
            statsTargets.find(t2 =>
                t2.metricId === mid && t2.scope === sc && t2.scopeId === sid
            ) ||
            // Last fallback: any target for this metric
            statsTargets.find(t2 => t2.metricId === mid);
    }

    // ========================
    //  QUICK INPUT
    // ========================
    function openQuickInputModal() {
        const p = document.getElementById('quickInputDatePicker');
        if (p) p.value = new Date().toISOString().split('T')[0];

        const c = document.getElementById('quickInputList');
        if (!c) return;

        const vis = statsMetrics.filter(m => m.inputType === 'manual' && canViewMetric(m));
        c.innerHTML = vis.map(m =>
            '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem;background:#f9fafb;border-radius:12px;">' +
                '<div style="flex:1;">' +
                    '<div style="font-weight:600;font-size:0.9rem;">' + esc(m.name) + '</div>' +
                    '<div style="font-size:0.75rem;color:var(--gray);">' + esc(m.unit) + ' · ' + (t(m.frequency) || m.frequency) + '</div>' +
                '</div>' +
                '<input type="number" class="input quick-input-value" data-metric-id="' + m.id + '" ' +
                    'placeholder="—" style="width:100px;text-align:center;font-size:1.1rem;font-weight:600;">' +
                '<div style="font-size:0.8rem;color:var(--gray);min-width:30px;">' + esc(m.unit) + '</div>' +
            '</div>'
        ).join('');

        openModal('quickInputModal');
    }

    async function saveQuickInput() {
        const date = document.getElementById('quickInputDatePicker')?.value;
        const inputs = document.querySelectorAll('.quick-input-value');
        let saved = 0;

        for (const inp of inputs) {
            const raw = inp.value.trim();
            if (raw === '') continue; // Not touched = skip. "0" = valid data
            await saveEntry(inp.dataset.metricId, parseFloat(raw) || 0, date);
            saved++;
        }

        closeModal('quickInputModal');
        if (saved > 0) {
            showToast((t('saved') || 'Збережено') + ': ' + saved, 'success');
            await loadEntries(getStatsPeriodKey(statsPeriodOffset));
            renderStatistics();
        }
    }

    // ========================
    //  METRIC MODAL
    // ========================
    function openMetricModal(mid) {
        statsEditingMetricId = mid || null;

        const fl = document.getElementById('metricFunctionsList');
        if (fl) {
            const fs = typeof functions !== 'undefined' ? functions : [];
            fl.innerHTML = fs.map(f =>
                '<label style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.6rem;background:#f3f4f6;border-radius:8px;font-size:0.8rem;cursor:pointer;">' +
                '<input type="checkbox" value="' + f.id + '" class="metric-func-cb"> ' + esc(f.name || f.title || '') +
                '</label>'
            ).join('');
        }

        const af = document.getElementById('autoSpecFunction');
        if (af) {
            const fs = typeof functions !== 'undefined' ? functions : [];
            af.innerHTML = '<option value="">' + (t('allFunctions') || 'Всі функції') + '</option>' +
                fs.map(f => '<option value="' + f.id + '">' + esc(f.name || f.title || '') + '</option>').join('');
        }

        if (mid) {
            const m = statsMetrics.find(x => x.id === mid);
            if (m) {
                document.getElementById('metricModalTitle').textContent = t('editMetric') || 'Редагувати';
                document.getElementById('metricName').value = m.name || '';
                document.getElementById('metricUnit').value = m.unit || 'шт';
                document.getElementById('metricFrequency').value = m.frequency || 'weekly';
                document.getElementById('metricFrequency').disabled = true; // P0-1: immutable
                document.getElementById('metricInputType').value = m.inputType || 'manual';
                document.getElementById('metricPrivacy').value = m.privacy || 'public';
                document.getElementById('metricFormula').value = m.formula || '';
                document.getElementById('metricAlertEnabled').checked = m.alertEnabled || false;
                document.getElementById('metricAlertThreshold').value = m.alertThreshold || 20;
                if (m.boundFunctions) {
                    document.querySelectorAll('.metric-func-cb').forEach(cb => {
                        cb.checked = !!m.boundFunctions[cb.value];
                    });
                }
                toggleAutoSpec();
            }
        } else {
            document.getElementById('metricModalTitle').textContent = t('addMetric') || 'Нова метрика';
            document.getElementById('metricName').value = '';
            document.getElementById('metricUnit').value = 'шт';
            document.getElementById('metricFrequency').value = 'weekly';
            document.getElementById('metricFrequency').disabled = false; // P0-1: editable for new
            document.getElementById('metricInputType').value = 'manual';
            document.getElementById('metricPrivacy').value = 'public';
            document.getElementById('metricFormula').value = '';
            document.getElementById('metricTarget').value = '';
            document.getElementById('metricAlertEnabled').checked = false;
        }
        openModal('metricModal');
    }

    function toggleAutoSpec() {
        const b = document.getElementById('autoSpecBlock');
        if (b) b.style.display = document.getElementById('metricInputType')?.value === 'auto' ? 'block' : 'none';
    }

    // ========================
    //  RENDER: MAIN
    // ========================
    async function renderStatistics() {
        if (!currentCompany) return;
        showStatsTabIfAllowed();

        const c = document.getElementById('statisticsContainer');
        if (!c) return;

        const pk = getStatsPeriodKey(statsPeriodOffset);
        const lb = document.getElementById('statsPeriodLabel');
        if (lb) lb.textContent = formatPeriodLabel(pk);

        const ab = document.getElementById('addMetricBtn');
        const aib = document.getElementById('aiAnalysisBtn');
        if (ab) ab.style.display = canEditMetrics() ? '' : 'none';
        if (aib) aib.style.display = canEditMetrics() ? '' : 'none';

        // Hide company scope for employees
        const cb = document.getElementById('statsScopeCompany');
        if (cb) cb.style.display = getUserRole() === 'employee' ? 'none' : '';

        // P0-3: Update function selector
        updateFunctionSelector();

        await Promise.all([loadMetrics(), loadEntries(pk), loadTargets(), loadAggregates(pk)]);

        const vis = statsMetrics.filter(m => canViewMetric(m));

        if (!vis.length) {
            c.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--gray);">' +
                '<i data-lucide="trending-up" style="width:48px;height:48px;margin:0 auto 1rem;opacity:0.3;display:block;"></i>' +
                '<h3>' + (t('noMetrics') || 'Метрик ще немає') + '</h3>' +
                '<p style="font-size:0.85rem;">' + (t('noMetricsHint') || 'Створіть першу метрику') + '</p>' +
                (canEditMetrics() ? '<button class="btn btn-success" onclick="openMetricModal()" style="margin-top:1rem;">' +
                '<i data-lucide="plus" class="icon"></i> ' + (t('addMetric') || 'Метрика') + '</button>' : '') +
                '</div>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        const flt = filterByScope(vis);
        renderKpiDebts(flt, pk);

        if (statsCurrentView === 'dashboard') renderDashboard(c, flt, pk);
        else if (statsCurrentView === 'table') renderTable(c, flt, pk);
        else renderCharts(c, flt, pk);

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function filterByScope(ms) {
        if (statsCurrentScope === 'function') {
            const fid = statsSelectedFunctionId;
            if (!fid) return [];
            return ms.filter(m => m.boundFunctions && m.boundFunctions[fid]);
        }
        return ms;
    }

    // ========================
    //  RENDER: DASHBOARD
    // ========================
    function renderDashboard(c, ms, pk) {
        c.innerHTML = '<div class="cards-grid">' + ms.map(m => {
            const e = getEntryForMetric(m.id, pk);
            const tg = getTargetForMetric(m.id, pk);
            const v = e?.value || 0;
            const tv = tg?.targetValue || 0;
            const pr = tv > 0 ? Math.round((v / tv) * 100) : null;
            const pc = pr !== null ? Math.min(pr, 100) : null;

            const badges = [];
            if (m.privacy === 'owner_only') badges.push('<span style="font-size:0.65rem;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:4px;">🔒</span>');
            if (m.inputType === 'auto') badges.push('<span style="font-size:0.65rem;background:#dbeafe;color:#2563eb;padding:1px 6px;border-radius:4px;">⚡</span>');
            if (m.formula) badges.push('<span style="font-size:0.65rem;background:#f3e8ff;color:#7c3aed;padding:1px 6px;border-radius:4px;">ƒ</span>');

            const funcTags = m.boundFunctions ? Object.keys(m.boundFunctions).map(fid => {
                const f = (typeof functions !== 'undefined' ? functions : []).find(x => x.id === fid);
                return f ? '<span style="font-size:0.65rem;background:#f0fdf4;color:#16a34a;padding:1px 6px;border-radius:4px;">' + esc(f.name || f.title || '') + '</span>' : '';
            }).join('') : '';

            const color = pc !== null && pc < 50 ? 'var(--danger)' : pc !== null && pc < 80 ? 'var(--warning)' : 'var(--primary)';

            return '<div class="card" style="padding:1rem;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">' +
                    '<div><div style="font-weight:700;font-size:0.95rem;">' + esc(m.name) + '</div>' +
                    '<div style="display:flex;gap:0.3rem;margin-top:0.25rem;flex-wrap:wrap;">' + badges.join('') + '</div></div>' +
                    (canEditMetrics() ? '<button class="btn btn-sm" onclick="openMetricModal(\'' + m.id + '\')" style="padding:0.2rem 0.4rem;"><i data-lucide="settings" class="icon icon-sm"></i></button>' : '') +
                '</div>' +
                '<div style="display:flex;align-items:baseline;gap:0.5rem;">' +
                    '<span style="font-size:1.8rem;font-weight:800;color:' + color + ';">' + v + '</span>' +
                    '<span style="font-size:0.85rem;color:var(--gray);">' + esc(m.unit) + '</span>' +
                    (tv > 0 ? '<span style="font-size:0.8rem;color:var(--gray);">/ ' + tv + '</span>' : '') +
                '</div>' +
                (pc !== null ? '<div style="background:#e5e7eb;border-radius:4px;height:6px;margin:0.5rem 0;overflow:hidden;">' +
                    '<div style="background:' + color + ';height:100%;width:' + pc + '%;border-radius:4px;transition:width 0.5s;"></div></div>' +
                    '<div style="font-size:0.75rem;color:var(--gray);">' + pr + '% ' + (t('ofTarget') || 'від цілі') + '</div>' : '') +
                '<div style="display:flex;gap:0.3rem;margin-top:0.4rem;flex-wrap:wrap;">' + funcTags + '</div>' +
            '</div>';
        }).join('') + '</div>';
    }

    // ========================
    //  RENDER: TABLE
    // ========================
    function renderTable(c, ms, pk) {
        const rows = ms.map(m => {
            const e = getEntryForMetric(m.id, pk);
            const tg = getTargetForMetric(m.id, pk);
            const v = e?.value || 0;
            const tv = tg?.targetValue || 0;
            const pr = tv > 0 ? Math.round((v / tv) * 100) : null;
            const fn = m.boundFunctions ? Object.keys(m.boundFunctions).map(fid => {
                const f = (typeof functions !== 'undefined' ? functions : []).find(x => x.id === fid);
                return f ? (f.name || f.title || '') : '';
            }).filter(Boolean).join(', ') : '—';

            return '<tr>' +
                '<td style="font-weight:600;">' + esc(m.name) + (m.privacy === 'owner_only' ? ' 🔒' : '') + (m.formula ? ' ƒ' : '') + '</td>' +
                '<td style="text-align:center;font-size:0.85rem;">' + esc(fn) + '</td>' +
                '<td style="text-align:center;font-weight:700;font-size:1.1rem;">' + v + '</td>' +
                '<td style="text-align:center;">' + (tv || '—') + '</td>' +
                '<td style="text-align:center;">' + (pr !== null ? '<span style="color:' + (pr < 50 ? 'var(--danger)' : pr < 80 ? 'var(--warning)' : 'var(--primary)') + ';font-weight:600;">' + pr + '%</span>' : '—') + '</td>' +
                '<td style="text-align:center;">' + esc(m.unit) + '</td>' +
                '<td style="text-align:center;">' + (t(m.frequency) || m.frequency) + '</td>' +
                (canEditMetrics() ? '<td style="text-align:center;">' +
                    '<button class="btn btn-sm" onclick="openMetricModal(\'' + m.id + '\')" style="padding:0.2rem 0.4rem;"><i data-lucide="edit-2" class="icon icon-sm"></i></button> ' +
                    '<button class="btn btn-sm" onclick="deleteMetric(\'' + m.id + '\')" style="padding:0.2rem 0.4rem;color:var(--danger);"><i data-lucide="trash-2" class="icon icon-sm"></i></button>' +
                '</td>' : '') +
            '</tr>';
        }).join('');

        c.innerHTML = '<div style="overflow-x:auto;"><table class="data-table" style="width:100%;"><thead><tr>' +
            '<th>' + (t('metricName') || 'Метрика') + '</th>' +
            '<th style="text-align:center;">' + (t('function') || 'Функція') + '</th>' +
            '<th style="text-align:center;">' + (t('fact') || 'Факт') + '</th>' +
            '<th style="text-align:center;">' + (t('target') || 'Ціль') + '</th>' +
            '<th style="text-align:center;">%</th>' +
            '<th style="text-align:center;">' + (t('metricUnit') || 'Од.') + '</th>' +
            '<th style="text-align:center;">' + (t('metricFrequency') || 'Частота') + '</th>' +
            (canEditMetrics() ? '<th style="text-align:center;">' + (t('actions') || 'Дії') + '</th>' : '') +
            '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }

    // ========================
    //  RENDER: CHARTS (honest placeholder)
    // ========================
    function renderCharts(c) {
        c.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--gray);">' +
            '<i data-lucide="line-chart" style="width:48px;height:48px;margin:0 auto 1rem;opacity:0.3;display:block;"></i>' +
            '<h3>' + (t('chartsComingSoon') || 'Графіки') + '</h3>' +
            '<p style="font-size:0.85rem;">' + (t('chartsNeedData') || 'Графіки з\'являться після накопичення даних') + '</p></div>';
    }

    // ========================
    //  KPI DEBTS
    // ========================
    function renderKpiDebts(ms, pk) {
        const c = document.getElementById('statsKpiDebts');
        if (!c) return;

        const debts = ms.filter(m => {
            if (m.inputType !== 'manual') return false;
            return !getEntryForMetric(m.id, pk); // No entry = debt. value=0 is valid.
        });

        if (!debts.length) { c.style.display = 'none'; return; }

        c.style.display = 'block';
        c.innerHTML = '<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:0.75rem;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.75rem;">' +
            '<span style="font-size:1.5rem;">📊</span>' +
            '<div><div style="font-weight:600;font-size:0.9rem;">' + (t('kpiDebts') || 'Незаповнені') + ': ' + debts.length + '</div>' +
            '<div style="font-size:0.8rem;color:#92400e;">' + debts.map(m => m.name).join(', ') + '</div></div>' +
            '<button class="btn btn-sm" onclick="openQuickInputModal()" style="margin-left:auto;background:#f59e0b;color:white;white-space:nowrap;">' +
            (t('fillNow') || 'Заповнити') + '</button></div>';
    }

    // ========================
    //  AI ANALYSIS
    // ========================
    async function runAIAnalysis() {
        const pk = getStatsPeriodKey(statsPeriodOffset);
        const vis = statsMetrics.filter(m => canViewMetric(m));
        if (!vis.length) { showToast(t('noMetrics') || 'Немає метрик', 'error'); return; }

        openModal('aiAnalysisModal');
        const ct = document.getElementById('aiAnalysisContent');
        if (ct) ct.innerHTML = '<div style="text-align:center;padding:2rem;"><div class="spinner"></div></div>';

        const md = vis.map(m => {
            const e = getEntryForMetric(m.id, pk);
            const tg = getTargetForMetric(m.id, pk);
            return { name: m.name, unit: m.unit, value: e?.value || 0, target: tg?.targetValue || 0 };
        });

        const prompt = 'AI-аналітик бізнес-метрик. Період: ' + pk + '\n\n' +
            md.map(m => '- ' + m.name + ': факт=' + m.value + ' ' + m.unit + (m.target > 0 ? ', ціль=' + m.target : '')).join('\n') +
            '\n\nЗадачі: 1) Вузькі місця 2) Причини 3) Рішення з +/- 4) План задач 5) Прогноз';

        if (ct) {
            ct.innerHTML = '<div style="padding:1rem;">' +
                '<div style="background:#f0fdf4;padding:1rem;border-radius:12px;margin-bottom:1rem;">' +
                '<h3 style="margin-bottom:0.5rem;">📊 ' + formatPeriodLabel(pk) + '</h3>' +
                md.map(m =>
                    '<div style="display:flex;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid #e5e7eb;">' +
                    '<span>' + m.name + '</span>' +
                    '<span style="font-weight:700;">' + m.value + ' ' + m.unit +
                    (m.target > 0 ? ' / ' + m.target + ' (' + Math.round(m.value / m.target * 100) + '%)' : '') +
                    '</span></div>'
                ).join('') + '</div>' +
                '<div style="background:#eff6ff;padding:1rem;border-radius:12px;">' +
                '<h3>🤖 ' + (t('aiReady') || 'AI підключення') + '</h3>' +
                '<details style="margin-top:0.5rem;"><summary style="cursor:pointer;font-size:0.8rem;color:var(--info);">' +
                (t('showPrompt') || 'Промпт') + '</summary>' +
                '<pre style="font-size:0.7rem;white-space:pre-wrap;background:#f9fafb;padding:0.5rem;border-radius:8px;margin-top:0.5rem;max-height:200px;overflow-y:auto;">' +
                esc(prompt) + '</pre></details></div></div>';
        }
    }

    // ========================
    //  INIT
    // ========================
    function initStatistics() {
        showStatsTabIfAllowed();
    }

    // ========================
    //  GLOBAL EXPORTS
    // ========================
    window.renderStatistics = renderStatistics;
    window.openMetricModal = openMetricModal;
    window.saveMetric = saveMetric;
    window.deleteMetric = deleteMetric;
    window.openQuickInputModal = openQuickInputModal;
    window.saveQuickInput = saveQuickInput;
    window.runAIAnalysis = runAIAnalysis;
    window.setStatsView = setStatsView;
    window.setStatsScope = setStatsScope;
    window.statsNavigatePeriod = statsNavigatePeriod;
    window.toggleAutoSpec = toggleAutoSpec;
    window.showStatsTabIfAllowed = showStatsTabIfAllowed;
    window.initStatistics = initStatistics;
    window.onStatsFunctionChange = onStatsFunctionChange;
})();
