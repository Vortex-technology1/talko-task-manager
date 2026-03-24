// =====================
        // DATA LOADING
        // =====================
'use strict';

        // Fallback stubs — реальні функції визначаються в 43-pull-to-refresh-mobile.js
        if (typeof window.showSkeletonLoading !== 'function') {
            window.showSkeletonLoading = function() {};
        }
        if (typeof window.hideSkeletonLoading !== 'function') {
            window.hideSkeletonLoading = function() {};
        }
        if (typeof window.checkEscalations !== 'function') {
            window.checkEscalations = function() {};
        }
        if (typeof window.loadManualIncidents !== 'function') {
            window.loadManualIncidents = function() { return Promise.resolve(); };
        }
        // showCompletedProcesses — глобальна змінна, реально керується в 27-processes.js
        if (typeof window.showCompletedProcesses === 'undefined') {
            window.showCompletedProcesses = false;
        }
        async function loadAllData() {

            if (!currentCompany) return;
            if (isLoading) {
                dbg('loadAllData: already loading, skipping...');
                return;
            }
            
            isLoading = true;
            const thisLoadVersion = ++loadingVersion;
            const startTime = performance.now();
            
            // FIX: failsafe timeout — якщо loadAllData завис, скидаємо через 45с
            const _loadFailsafe = setTimeout(() => {
                if (isLoading && thisLoadVersion === loadingVersion) {
                    console.error('[loadAllData] TIMEOUT 45s — force reset isLoading');
                    isLoading = false;
                    hideSkeletonLoading();
                }
            }, 45000);
            
            // Показуємо skeleton якщо контент ще порожній
            showSkeletonLoading();
            
            try {
                // Паралельне завантаження ВСЬОГО для швидкості (6 запитів одночасно замість 6 послідовних)
                const base = db.collection('companies').doc(currentCompany);
                
                let processQuery = base.collection('processes');
                if (!window.showCompletedProcesses) {
                    processQuery = processQuery.where('status', '==', 'active');
                }
                
                const TASKS_LOAD_LIMIT = 2000; // raised from 500
                const isEmployeeRole = currentUserData?.role === 'employee';
                const uid = currentUser.uid;
                
                // Employee: load only THEIR tasks (assigned + created + coExecutor + observer)
                // Owner/Manager: load ALL tasks in parallel batches (up to TASKS_LOAD_LIMIT)
                let tasksPromise;
                if (isEmployeeRole) {
                    tasksPromise = Promise.all([
                        base.collection('tasks').where('assigneeId', '==', uid).orderBy('createdAt', 'desc').limit(1000).get()
                            .catch(() => base.collection('tasks').where('assigneeId', '==', uid).limit(1000).get()),
                        base.collection('tasks').where('creatorId', '==', uid).orderBy('createdAt', 'desc').limit(500).get()
                            .catch(() => base.collection('tasks').where('creatorId', '==', uid).limit(500).get()),
                        base.collection('tasks').where('coExecutorIds', 'array-contains', uid).limit(500).get()
                            .catch(() => ({ docs: [] })), // Fallback if index missing
                        base.collection('tasks').where('observerIds', 'array-contains', uid).limit(500).get()
                            .catch(() => ({ docs: [] }))  // Fallback if index missing
                    ]).then(snaps => {
                        const taskMap = new Map();
                        snaps.forEach(snap => snap.docs.forEach(doc => {
                            if (!taskMap.has(doc.id)) taskMap.set(doc.id, doc);
                        }));
                        return { docs: Array.from(taskMap.values()), size: taskMap.size, _merged: true };
                    });
                } else {
                    // Owner/Manager: load up to TASKS_LOAD_LIMIT using cursor pagination
                    tasksPromise = (async () => {
                        const BATCH = 500;
                        const allDocs = [];
                        let lastDoc = null;
                        let batchNum = 0;
                        while (allDocs.length < TASKS_LOAD_LIMIT) {
                            let q = base.collection('tasks').orderBy('createdAt', 'desc').limit(BATCH);
                            if (lastDoc) q = q.startAfter(lastDoc);
                            const snap = await q.get().catch(() => null);
                            if (!snap || snap.empty) break;
                            allDocs.push(...snap.docs);
                            lastDoc = snap.docs[snap.docs.length - 1];
                            batchNum++;
                            if (snap.docs.length < BATCH) break; // last batch
                            if (batchNum >= 4) break; // safety cap at 4*500=2000
                        }
                        return { docs: allDocs, size: allDocs.length, _merged: true };
                    })();
                }
                
                const [usersSnap, funcsSnap, tasksSnap, regSnap, templatesSnap, processesSnap, projectsSnap] = await Promise.all([
                    base.collection('users').limit(1000).get() // safety limit
                        .catch(() => ({ docs: [] })),
                    base.collection('functions').limit(200).get()
                        .catch(() => ({ docs: [] })),
                    tasksPromise,
                    base.collection('regularTasks').limit(500).get()
                        .catch(() => ({ docs: [] })),
                    base.collection('processTemplates').orderBy('name').get()
                        .catch(() => base.collection('processTemplates').get())
                        .catch(() => ({ docs: [] })),
                    processQuery.get()
                        .catch(() => ({ docs: [] })),
                    base.collection('projects').orderBy('createdAt', 'desc').get()
                        .catch(() => base.collection('projects').get())
                        .catch(() => ({ docs: [] }))
                ]);

                // ─── FEATURE FLAGS ─────────────────────────────
                try {
                    const compDoc = await base.get();
                    if (compDoc.exists) {
                        const cd = compDoc.data();
                        window.companyFeatures    = cd.features || {};
                        // Tier-модель: basic | pro | enterprise (default: pro до впровадження billing)
                        window.currentPlan        = cd.plan || 'pro';
                        window.currentCompanyData = window.currentCompanyData || { id: window.currentCompanyId, ...cd };
                    }
                } catch(e) { console.error('[07-data-loading]', e.message); }

                window.isFeatureEnabled = window.isFeatureEnabled || function(key) {
                    return !window.companyFeatures || window.companyFeatures[key] !== false;
                };

                // isPlanAllowed(feature) — перевірка доступу по плану
                // basic:      операційна ОС без AI-діагностики
                // pro:        basic + AI Diagnostic Agent + тижневі звіти
                // enterprise: pro + кастомний агент + пріоритетна підтримка
                const PLAN_FEATURES = {
                    ai_diagnostic:  ['pro', 'enterprise'],
                    weekly_report:  ['pro', 'enterprise'],
                    custom_agent:   ['enterprise'],
                    event_tracking: ['pro', 'enterprise'],
                    advanced_stats: ['pro', 'enterprise'],
                };
                window.PLAN_FEATURES  = PLAN_FEATURES;
                window.isPlanAllowed  = function(feature) {
                    const plan = window.currentPlan || 'pro';
                    if (plan === 'enterprise') return true;
                    const allowed = PLAN_FEATURES[feature];
                    if (!allowed) return true; // невідома фіча — дозволяємо
                    return allowed.includes(plan);
                };

                
                // BUG-AM FIX: _merged is always true for both employee and manager paths
                // Use task count vs per-query limits to detect truncation
                const taskCount = tasksSnap.size !== undefined ? tasksSnap.size : tasksSnap.docs.length;
                const WARN_THRESHOLD = isEmployeeRole ? 900 : TASKS_LOAD_LIMIT - 100;
                if (taskCount >= WARN_THRESHOLD) {
                    console.warn(`[loadAllData] Task limit reached: ${taskCount}`);
                    showToast(window.t('taskLimitWarning').replace('{n}', taskCount), 'warning');
                    // Показуємо persistent банер в UI якщо є відповідний елемент
                    const banner = document.getElementById('taskLimitBanner');
                    if (banner) {
                        banner.style.display = 'flex';
                        banner.querySelector('.task-limit-count').textContent = taskCount;
                    }
                }
                dbg(`[loadAllData] ${isEmployeeRole ? 'Employee' : 'Manager'} mode: ${taskCount} tasks`);
                
                // Перевіряємо чи це ще актуальний запит
                if (thisLoadVersion !== loadingVersion) {
                    dbg('loadAllData: newer load started, discarding results');
                    // FIX: скидаємо isLoading щоб не застрягти назавжди
                    isLoading = false;
                    hideSkeletonLoading();
                    return;
                }
                
                // Атомарно оновлюємо всі дані
                users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                window.users = users; // FIX CH: keep window.users in sync for event-bus
                functions = funcsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                regularTasks = regSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                window._regularTasks = regularTasks; // global for search
                processTemplates = templatesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                processes = processesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                
                updateSelects();
                updateProcessTemplateFilter();
                updateProjectSelects();
                
                // Sync functions to biz-structure canvas iframe
                if (typeof sendFunctionsToIframe === 'function') sendFunctionsToIframe();
                
                // Авто-генерація регулярних завдань — в фоні після рендеру
                // (не блокує UI — defer to after first render)
                setTimeout(() => {
                    autoGenerateRegularTasks().catch(e =>
                        console.warn('[loadAllData] autoGenerateRegularTasks:', e.message)
                    );
                }, 500);
                
                // Одноразова міграція: задачі з deadline (Timestamp) без deadlineDate
                const migrateKey = `migrated_${currentCompany}`;
                if (!localStorage.getItem(migrateKey)) {
                    try {
                        await migrateDeadlineFields(base);
                        localStorage.setItem(migrateKey, '1');
                    } catch(e) {
                        console.warn('[Migration] failed, will retry next load:', e);
                        // НЕ ставимо localStorage — спробує ще раз
                    }
                }
                
                // Ще раз перевіряємо актуальність
                if (thisLoadVersion !== loadingVersion) {
                    isLoading = false;
                    hideSkeletonLoading();
                    return;
                }
                
                // Employee: автоматично ставимо фільтр "Мої" при завантаженні
                if (currentUserData?.role === 'employee' && currentUser) {
                    const calAf = document.getElementById('calendarAssigneeFilter');
                    if (calAf) calAf.value = currentUser.uid;
                }
                
                // Render My Day (головний екран)
                renderMyDay();
                
                // Show Statistics tab if allowed (after users loaded)
                if (typeof showStatsTabIfAllowed === 'function') showStatsTabIfAllowed();
                
                // Render based on current view
                if (currentCalendarView === 'list') {
                    renderTasks();
        if (typeof restoreActiveTimer === 'function') restoreActiveTimer();
                } else if (currentCalendarView === 'kanban' || currentCalendarView === 'deadlines') {
                    renderKanbanBoard(currentCalendarView);
                } else {
                    renderCalendar();
                }
                
                // Render regular tasks view
                if (currentRegularView === 'list') {
                    renderRegularTasks();
                } else {
                    renderRegularWeekView();
                }
                
                // Показуємо попап "Мій день" при першому завантаженні
                if (!sessionStorage.getItem('myDayShown')) {
                    showMyDayPopup();
                    sessionStorage.setItem('myDayShown', '1');
                }
                
                // Update overdue badges
                updateOverdueBadges();
                
                // Зберігаємо для offline — deferred to idle
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => saveOfflineData(), { timeout: 5000 });
                } else {
                    setTimeout(saveOfflineData, 2000);
                }
                
                // Архівація в фоні (non-blocking) — не чекаємо результату
                autoArchiveDoneTasks().then(() => {
                    // Якщо щось заархівувалось — перерендерити
                    // (tasks[] вже оновлений всередині autoArchiveDoneTasks)
                }).catch(() => {});
                
                dbg(`[loadAllData] Done in ${Math.round(performance.now() - startTime)}ms, tasks: ${tasks.length}`);
                if (currentUserData?.role === 'employee') {
                    const visible = tasks.filter(t => isTaskVisibleToUser(t)).length;
                    dbg(`[Visibility] Employee "${currentUserData.name}" sees ${visible}/${tasks.length} tasks`);
                }
                // BUG #1 fix: ініціалізуємо систему ролей після завантаження даних компанії
                if (typeof window.initRolesPermissions === 'function') {
                    window.initRolesPermissions().catch(e => console.warn('[Roles] init error:', e));
                }
                document.dispatchEvent(new CustomEvent('companyLoaded'));
                
            } catch (error) {
                console.error('loadAllData error:', error);
            } finally {
                clearTimeout(_loadFailsafe); // FIX: завжди чистимо failsafe
                if (thisLoadVersion === loadingVersion) {
                    isLoading = false;
                    // Check escalations after data is loaded
                    if (typeof window.checkEscalations === 'function') window.checkEscalations();
                    if (typeof initUsersTabVisibility === 'function') initUsersTabVisibility();
                if (typeof initOwnerReportOption === 'function') initOwnerReportOption();
                if (typeof initOwnerDashboardVisibility === 'function') initOwnerDashboardVisibility();
                    // Load manual incidents for journal
                    if (typeof window.loadManualIncidents === 'function') window.loadManualIncidents().catch(() => {});
                    // Load project-driven data (stages, materials, QC) for owner dashboard
                    if (currentUserData?.role !== 'employee') {
                        Promise.all([
                            typeof window.loadProjectStages === 'function' ? window.loadProjectStages() : Promise.resolve([]),
                            typeof window.loadProjectMaterials === 'function' ? window.loadProjectMaterials() : Promise.resolve([]),
                            typeof window.loadQualityChecks === 'function' ? window.loadQualityChecks() : Promise.resolve([]),
                            typeof window.loadWorkStandards === 'function' ? window.loadWorkStandards() : Promise.resolve([]),
                        ]).then(() => {
                            if (typeof window.renderOwnerProjectDashboard === 'function') window.renderOwnerProjectDashboard();
                        }).catch(e => console.warn('[loadAllData] project extras:', e));
                    }
                    // Show morning start modal (once per day)
                    setTimeout(() => { checkMorningStart(); startOnboarding(); saveDailySnapshot(); }, 1500);

                    // FIX: Dispatch event so feature-dependent modules initialize
                    // AFTER companyFeatures is guaranteed to be set
                    window.dispatchEvent(new CustomEvent('talko:featuresLoaded'));
                }
                hideSkeletonLoading();
            }
        }
