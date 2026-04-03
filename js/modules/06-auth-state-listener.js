// =====================
        // AUTH STATE LISTENER
        // =====================
'use strict';
        auth.onAuthStateChanged(async (user) => {
            try {
            if (user) {
                currentUser = user;
                window.currentUser = user; // аліас для IIFE модулів
                window._wasLoggedIn = true; // Позначаємо що була активна сесія
                
                // Очищаємо попередні listeners перед ініціалізацією нової сесії
                cleanupAllListeners();
                
                // Встановлюємо isSuperAdmin на основі email
                isSuperAdmin = window.isSuperAdmin = (user.email === 'management.talco@gmail.com'); // FIX: sync to window for cross-script access
                window.isDemoUser = (user.email === 'talco.agency@gmail.com');
                
                if (isSuperAdmin) {
                    const superBtn = document.getElementById('superadminBtn');
                    if (superBtn) superBtn.style.display = '';
                    const adminBtn = document.getElementById('adminTabBtn');
                    if (adminBtn) adminBtn.style.display = 'block';
                }
                
                let companyId = await findUserCompany(user.uid, user.email);

                // Якщо offline — показуємо retry екран замість чорного екрану
                if (!companyId && !isSuperAdmin) {
                    if (!navigator.onLine || companyId === '__offline__') { companyId = null;
                        const lp = document.getElementById('loadingPage');
                        if (lp) {
                            lp.style.display = 'flex';
                            lp.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:white;text-align:center;padding:2rem;gap:1.25rem;">' +
                                '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>' +
                                '<div style="font-size:1.1rem;font-weight:700;">Немає з\'єднання з інтернетом</div>' +
                                '<div style="font-size:.85rem;color:#94a3b8;max-width:280px;line-height:1.6;">Перевірте підключення і спробуйте ще раз</div>' +
                                '<button onclick="location.reload()" style="margin-top:.5rem;padding:.65rem 1.5rem;background:#22c55e;color:white;border:none;border-radius:10px;font-size:.9rem;font-weight:700;cursor:pointer;">Оновити сторінку</button>' +
                                '</div>';
                        }
                        return;
                    }
                    document.getElementById('loadingPage').style.display = 'none';
                    document.getElementById('authPage').style.display = 'flex'; document.getElementById('mainHeader') && (document.getElementById('mainHeader').style.display = 'none');
                    document.getElementById('mainInterface').style.display = 'none';
                    showNoAccess();
                    return;
                }
                
                if (!companyId && isSuperAdmin) {
                    currentCompany = null;
                    currentUserData = { id: user.uid, email: user.email, role: 'superadmin', name: 'Super Admin' };
                    document.getElementById('currentUserName').textContent = 'Super Admin';
                    document.getElementById('currentUserRole').textContent = window.t('adminRole');
                    document.getElementById('companyBadge').textContent = 'TALKO System';
                    document.getElementById('companyBadge').style.display = 'inline';
                    showMainInterface();
                    return;
                }
                
                currentCompany = companyId;
                window.currentCompanyId = companyId; // для CRM, Marketing, Bots модулів
                window.currentCompany = companyId;    // аліас для IIFE модулів (76-coordination та ін.)
                
                let userDoc = await db.collection('companies').doc(companyId).collection('users').doc(user.uid).get();
                const hasRole = userDoc.exists && userDoc.data().role;
                if (!userDoc.exists || !hasRole) {
                    console.warn('[Auth] User doc missing or no role — patching', user.uid);
                    try {
                        // Визначаємо роль при патчингу — SuperAdmin або власник компанії отримують owner
                        const _patchCompanyDoc = await db.collection('companies').doc(companyId).get();
                        const _patchOwnerId = _patchCompanyDoc.data()?.ownerId;
                        const _patchRole = isSuperAdmin ? 'owner' : (_patchOwnerId === user.uid ? 'owner' : 'employee');
                        await db.collection('companies').doc(companyId).collection('users').doc(user.uid).set({
                            name: user.displayName || user.email.split('@')[0],
                            email: user.email.toLowerCase(),
                            role: _patchRole,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            autoCreated: true
                        }, { merge: true });
                        userDoc = await db.collection('companies').doc(companyId).collection('users').doc(user.uid).get();
                        console.log('[Auth] Patched user doc, role:', userDoc.data()?.role);
                    } catch(e) {
                        console.error('[Auth] Failed to patch user doc:', e.message);
                    }
                }
                currentUserData = userDoc.exists ? { id: user.uid, ...userDoc.data() } : { id: user.uid, email: user.email, role: 'employee' };
                // SuperAdmin завжди отримує owner-рівень незалежно від запису в Firestore
                if (isSuperAdmin && currentUserData.role !== 'owner') {
                    currentUserData.role = 'owner';
                }
                window.currentUserData = currentUserData; // expose для CRM та інших модулів
                
                const companyDoc = await db.collection('companies').doc(companyId).get();
                const companyData = companyDoc.data();
                
                // Перевірка чи компанія заблокована
                if (companyData?.disabled && !isSuperAdmin) {
                    document.getElementById('authPage').style.display = 'flex'; document.getElementById('mainHeader') && (document.getElementById('mainHeader').style.display = 'none');
                    document.getElementById('mainInterface').style.display = 'none';
                    const authErr = document.getElementById('authError') || document.createElement('p');
                    authErr.id = 'authError';
                    authErr.style.cssText = 'color:#dc2626;text-align:center;padding:1rem;font-weight:600;';
                    authErr.textContent = window.t('companyBlocked');
                    const authBox = document.querySelector('.auth-box');
                    if (authBox && !document.getElementById('authError')) authBox.appendChild(authErr);
                    await auth.signOut();
                    return;
                }
                
                document.getElementById('currentUserName').textContent = currentUserData.name || user.displayName || user.email;
                document.getElementById('companyBadge').textContent = companyData?.name || '';
                document.getElementById('companyBadge').style.display = 'inline';
                
                // ── ВИПРАВЛЕННЯ РОЛІ ────────────────────────────────
                // 1. SuperAdmin завжди owner
                if (isSuperAdmin) {
                    currentUserData.role = 'owner';
                }
                // 2. Власник компанії по ownerId — виправляємо якщо employee
                const _isCompanyOwner = companyData?.ownerId === user.uid;
                if (_isCompanyOwner && currentUserData.role !== 'owner') {
                    currentUserData.role = 'owner';
                    try {
                        await db.collection('companies').doc(companyId).collection('users').doc(user.uid).set(
                            { role: 'owner', updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
                            { merge: true }
                        );
                    } catch(e) { console.warn('[auth] role fix:', e.message); }
                }
                const _effectiveRole = currentUserData.role || 'employee';
                
                // Показуємо роль ПІСЛЯ всіх виправлень
                document.getElementById('currentUserRole').textContent = currentUserData ? '(' + getRoleText(currentUserData.role) + ')' : '';

                if (_effectiveRole === 'employee') {
                    document.getElementById('inviteBtn').style.display = 'none';
                    document.getElementById('demoDataBtn').style.display = 'none';
                    // Ховаємо адмін-вкладки для співробітників
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        const tab = btn.getAttribute('onclick')?.match(/switchTab\('(\w+)'\)/)?.[1];
                        if (['users', 'functions'].includes(tab)) btn.style.display = 'none';
                    });
                }

                // ── GUEST ROLE: підрядник бачить тільки проєкти ──
                if (currentUserData.role === 'guest') {
                    const guestAllowed = ['projects'];
                    window._userAllowedTabs = guestAllowed;
                    window._isGuestUser = true;
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        const match = (btn.getAttribute('onclick') || '').match(/switchTab\('(\w+)'\)/);
                        const tab = match ? match[1] : null;
                        if (tab && !guestAllowed.includes(tab)) btn.style.display = 'none';
                    });
                    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
                        const tab = btn.dataset.tab;
                        if (tab && tab !== 'more' && !guestAllowed.includes(tab)) btn.style.display = 'none';
                    });
                    ['analyticsTabBtn','sysTabBtn','bizNavBtn','tasksTabBtn','inviteBtn','adminTabBtn','ownerAiButtons','aiAssistantsBtnMenu'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.display = 'none';
                    });
                    setTimeout(() => { if (typeof switchTab === 'function') switchTab('projects'); }, 300);
                }

                // ── ALLOWED TABS: обмежений доступ до модулів ──
                // Якщо у юзера є поле allowedTabs: ['warehouse', ...] — показуємо ТІЛЬКИ ці таби
                let _allowedTabs = currentUserData.allowedTabs;

                // АВТОДОПОВНЕННЯ: якщо є tasks — автоматично додаємо myday
                // бо "Мій день" це просто вид задач, без нього tasks недоступний
                if (Array.isArray(_allowedTabs) && _allowedTabs.length > 0) {
                    const _tabsSet = new Set(_allowedTabs);
                    if (_tabsSet.has('tasks') && !_tabsSet.has('myday')) {
                        _tabsSet.add('myday');
                        _allowedTabs = Array.from(_tabsSet);
                    }
                    // Якщо є crm — додаємо sales якщо вони пов'язані
                    window._userAllowedTabs = _allowedTabs;
                } else {
                    window._userAllowedTabs = null;
                }

                // ── Глобальна функція перевірки доступу до табу ──
                // Використовується в UI для показу/приховання кнопок дій.
                // Логіка = дзеркало firestore rules hasTabAccess():
                //   owner/admin/manager → завжди true
                //   employee без allowedTabs → true (бачить все)
                //   employee з allowedTabs → перевіряємо наявність табу
                window._userHasTabAccess = function(tabKey) {
                    const role = window.currentUserData?.role || 'employee';
                    if (['owner', 'admin', 'manager'].includes(role)) return true;
                    if (!window._userAllowedTabs) return true;
                    return window._userAllowedTabs.includes(tabKey);
                };

                if (Array.isArray(_allowedTabs) && _allowedTabs.length > 0) {
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        const match = (btn.getAttribute('onclick') || '').match(/switchTab\('(\w+)'\)/);
                        const tab = match ? match[1] : null;
                        if (tab && !_allowedTabs.includes(tab)) btn.style.display = 'none';
                    });

                    // Ховаємо dropdown-контейнери якщо всі їх _ntab пункти заховані
                    // (щоб не було видимої кнопки з порожнім меню)
                    ['tasksTabDropdown','analyticsTabDropdown'].forEach(dropId => {
                        const drop = document.getElementById(dropId);
                        if (!drop) return;
                        const menuId = dropId.replace('Dropdown','Menu');
                        const menu = document.getElementById(menuId);
                        if (!menu) return;
                        const visibleItems = menu.querySelectorAll('._ntab:not([style*="display: none"]):not([style*="display:none"])');
                        if (visibleItems.length === 0) {
                            drop.style.display = 'none';
                        }
                    });

                    // Ховаємо групові dropdown-кнопки (Система, Бізнес) — вони вже ховаються нижче
                    // Але якщо allowedTabs не містить жодного їх пункту — ховаємо повністю
                    const sysItems = ['functions','users','onboarding','bizstructure'];
                    const bizItems = ['crm','finance','marketing','bots','booking','sales','sites','warehouse','estimate','foodProduction'];
                    const hasSys = sysItems.some(t => _allowedTabs.includes(t));
                    const hasBiz = bizItems.some(t => _allowedTabs.includes(t));
                    if (!hasSys) { const el = document.getElementById('sysTabBtn'); if (el) el.closest('[id$="Dropdown"]')?.style && (el.closest('[id$="Dropdown"]').style.display = 'none') || (el.style.display = 'none'); }
                    if (!hasBiz) { const el = document.getElementById('bizNavBtn'); if (el) el.style.display = 'none'; }

                    // Ховаємо bottom-nav кнопки крім дозволених (+ "Ще" завжди залишаємо)
                    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
                        const tab = btn.dataset.tab;
                        if (tab && tab !== 'more' && !_allowedTabs.includes(tab)) btn.style.display = 'none';
                    });

                    // Групові nav-кнопки — ховаємо тільки якщо немає жодного дозволеного пункту
                    // tasksTabBtn: містить tasks, regular
                    const taskItems = ['tasks','regular'];
                    const hasTask = taskItems.some(t => _allowedTabs.includes(t));
                    if (!hasTask) { const el = document.getElementById('tasksTabBtn'); if (el) el.closest('[id$="Dropdown"]') ? el.closest('[id$="Dropdown"]').style.display = 'none' : el.style.display = 'none'; }

                    // analyticsTabBtn: містить analytics, statistics
                    const analyticsItems = ['analytics','statistics'];
                    const hasAnalytics = analyticsItems.some(t => _allowedTabs.includes(t));
                    if (!hasAnalytics) { const el = document.getElementById('analyticsTabBtn'); if (el) el.closest('[id$="Dropdown"]') ? el.closest('[id$="Dropdown"]').style.display = 'none' : el.style.display = 'none'; }

                    // sysTabBtn і bizNavBtn вже оброблені вище через hasSys/hasBiz

                    // Ховаємо inviteBtn, adminTabBtn, ownerAiButtons
                    ['inviteBtn','adminTabBtn','ownerAiButtons','aiAssistantsBtnMenu'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.display = 'none';
                    });

                    // Відразу переходимо на перший дозволений таб
                    // Пріоритет: myday > tasks > перший зі списку
                    const preferredFirst = ['myday', 'tasks', 'projects', 'crm'].find(t => _allowedTabs.includes(t));
                    const firstTab = preferredFirst || _allowedTabs[0];
                    if (typeof switchTab === 'function') {
                        setTimeout(() => switchTab(firstTab), 300);
                    }

                    // Блокуємо switchTab — не дозволяємо перейти на недозволений таб
                    // ВАЖЛИВО: встановлюємо тільки один раз щоб не створювати ланцюги обгорток
                    if (!window._switchTabRestricted) {
                        window._switchTabRestricted = true;
                        const _origSwitchTab = window.switchTab;
                        window.switchTab = function(tabName) {
                            if (window._userAllowedTabs && !window._userAllowedTabs.includes(tabName)) {
                                console.warn('[TALKO] Tab not allowed:', tabName);
                                return;
                            }
                            if (typeof _origSwitchTab === 'function') _origSwitchTab(tabName);
                        };
                    }
                }
                
                // Кнопка Демо: для superadmin і owner
                const showDemo = isSuperAdmin || currentUserData?.role === 'owner';
                document.getElementById('demoDataBtnDesktop').style.display = showDemo ? 'flex' : 'none';
                document.getElementById('demoDataBtn').style.display = showDemo ? 'flex' : 'none';

                // Кнопка Тур: для всіх залогінених
                const tourBtn = document.getElementById('tourBtnDesktop');
                if (tourBtn) tourBtn.style.display = 'flex';
                
                // AI buttons: Generator + Import = owner only, AI config = admin/superadmin only
                const isOwnerRole = currentUserData?.role === 'owner';
                document.getElementById('ownerAiButtons').style.display = (isOwnerRole || isSuperAdmin) ? 'grid' : 'none';
                // Backup tab — owner only
                const backupNavBtn = document.getElementById('backupNavBtn');
                if (backupNavBtn) backupNavBtn.style.display = (isOwnerRole || isSuperAdmin) ? 'flex' : 'none';
                document.getElementById('aiAssistantsBtnMenu').style.display = isSuperAdmin ? 'flex' : 'none';
                document.getElementById('aiStructureBtnDesktop').style.display = 'none'; // temporarily disabled
                
                showMainInterface();

                // ── SUBSCRIPTION CHECK ───────────────────────────
                window.currentCompanyData = companyData || {};
                _checkAndApplySubscription(companyData, currentUserData, isSuperAdmin);
                // ── END SUBSCRIPTION CHECK ──────────────────────

                if (typeof initCalendar === 'function') initCalendar();
                if (typeof initRegularView === 'function') initRegularView();
                if (typeof initGoogleCalendar === 'function') initGoogleCalendar();
                // Дебаунс — захист від подвійного виклику при auth state change
                if (typeof window._reloadDataDebounced === 'function') {
                    window._reloadDataDebounced();
                } else {
                    loadAllData();
                }
                // Синхронізуємо обидва stats tab buttons (desktop + mobile) одразу після login
                if (typeof showStatsTabIfAllowed === 'function') showStatsTabIfAllowed();
                if (typeof initStatistics === 'function') initStatistics();


                // FIX БАГ 4: event-driven замість setTimeout(500)
                // Гарантує що companyFeatures вже встановлені в loadAllData
                window.addEventListener('talko:featuresLoaded', function _onFeatures() {
                    window.removeEventListener('talko:featuresLoaded', _onFeatures);
                    // Бізнес dropdown — показуємо якщо є хоча б одна feature
                    let hasBizFeature = false;
                    if (window.isFeatureEnabled && window.isFeatureEnabled('crm')) {
                        const crmBtn = document.getElementById('crmNavBtn');
                        if (crmBtn) crmBtn.style.display = '';
                        if (typeof initCRMModule === 'function') initCRMModule();
                        hasBizFeature = true;
                    } else {
                        const crmBtn = document.getElementById('crmNavBtn');
                        if (crmBtn) crmBtn.style.display = 'none';
                    }
                    if (window.isFeatureEnabled && window.isFeatureEnabled('marketing')) {
                        const mktBtn = document.getElementById('marketingNavBtn');
                        if (mktBtn) mktBtn.style.display = '';
                        hasBizFeature = true;
                    } else {
                        const mktBtn = document.getElementById('marketingNavBtn');
                        if (mktBtn) mktBtn.style.display = 'none';
                    }
                    if (window.isFeatureEnabled && window.isFeatureEnabled('bots')) {
                        const botsBtn = document.getElementById('botsNavBtn');
                        if (botsBtn) botsBtn.style.display = '';
                        if (typeof initBotsModule === 'function') initBotsModule();
                        hasBizFeature = true;
                    } else {
                        const botsBtn = document.getElementById('botsNavBtn');
                        if (botsBtn) botsBtn.style.display = 'none';
                    }
                    if (window.isFeatureEnabled && window.isFeatureEnabled('sites')) {
                        const sitesBtn = document.getElementById('sitesNavBtn');
                        if (sitesBtn) sitesBtn.style.display = '';
                        hasBizFeature = true;
                    } else {
                        const sitesBtn = document.getElementById('sitesNavBtn');
                        if (sitesBtn) sitesBtn.style.display = 'none';
                    }

                    // Склад — керується feature flag
                    const fe = window.isFeatureEnabled;
                    const _hideTabIfDisabled = (featureKey, navBtnId, tabBtnSelector) => {
                        if (fe && fe(featureKey) === false) {
                            const btn = navBtnId ? document.getElementById(navBtnId) : null;
                            if (btn) btn.style.display = 'none';
                            if (tabBtnSelector) {
                                document.querySelectorAll(tabBtnSelector).forEach(b => b.style.display = 'none');
                            }
                        }
                    };
                    _hideTabIfDisabled('warehouse',    'warehouseNavBtn',    '[onclick*="switchTab(\'warehouse\')"]');
                    _hideTabIfDisabled('finance',      'financeNavBtn',      '[onclick*="switchTab(\'finance\')"]');
                    _hideTabIfDisabled('booking',      'bookingNavBtn',      '[onclick*="switchTab(\'booking\')"]');
                    _hideTabIfDisabled('coordination', 'coordinationNavBtn', '[onclick*="switchTab(\'coordination\')"]');
                    _hideTabIfDisabled('incidents',    'incidentsNavBtn',    '[onclick*="switchTab(\'incidents\')"]');
                    _hideTabIfDisabled('projects',     'projectsNavBtn',     '[onclick*="switchTab(\'projects\')"]');
                    _hideTabIfDisabled('processes',    'processesNavBtn',    '[onclick*="switchTab(\'processes\')"]');
                    _hideTabIfDisabled('statistics',   'statisticsNavBtn',   '[onclick*="switchTab(\'statistics\')"]');

                    hasBizFeature = true;

                    // Відновлюємо останній активний таб після F5
                    try {
                        const lastTab = sessionStorage.getItem('talko_last_tab');
                        const safeTabs = ['tasks','myDay','projects','processes','statistics',
                            'analytics','ownerDashboard','functions','bizstructure','users',
                            'learning','admin','crm','marketing','bots','sites','coordination',
                            'regular','incidents','warehouse','finance'];
                        if (lastTab && safeTabs.includes(lastTab) && typeof switchTab === 'function') {
                            // Перевіряємо що таб доступний (кнопка є і не прихована)
                            const tabEl = document.getElementById(lastTab + 'Tab');
                            if (tabEl) {
                                switchTab(lastTab);
                            }
                        }
                    } catch(e) { console.error('[06-auth]', e.message); }
                });

                // Show FAB (було окремим onAuthStateChanged — об'єднано)
                const fab = document.getElementById('fabAdd');
                if (fab) fab.style.display = 'flex';
                
                // Real-time listeners для нових завдань і змін
                initTasksListener();
                // Manager real-time listener (після завантаження даних)
                document.addEventListener('companyLoaded', function _onCompanyLoaded() {
                    document.removeEventListener('companyLoaded', _onCompanyLoaded);
                    if (typeof window.initManagerTasksListener === 'function') {
                        window.initManagerTasksListener();
                    }
                    // Function owner notifications (ТЗ пріоритет 12)
                    if (typeof window.initFunctionOwnerNotifications === 'function') {
                        window.initFunctionOwnerNotifications();
                    }
                    if (typeof window._startFunctionOverdueCheck === 'function') {
                        window._startFunctionOverdueCheck();
                    }
                }, { once: true });
            } else {
                window.currentUser = null;    // cleanup аліасів
                window.currentCompany = null;

                // ── LOGOUT CLEANUP ─────────────────────────────
                // Скидаємо стан завантаження щоб re-login міг запустити loadAllData
                try {
                    if (typeof isLoading !== 'undefined') isLoading = false;
                    if (typeof loadingVersion !== 'undefined') loadingVersion = 0;
                } catch(e) {}
                // Очищаємо дані — тільки якщо була активна сесія
                // (захист: onAuthStateChanged(null) спрацьовує і при першому завантаженні
                //  поки Firebase відновлює сесію — не очищаємо якщо ще не логінились)
                if (window._wasLoggedIn) {
                    try {
                        if (typeof tasks !== 'undefined') tasks = [];
                        if (typeof users !== 'undefined') users = [];
                        if (typeof functions !== 'undefined') functions = [];
                        if (typeof processes !== 'undefined') processes = [];
                        if (typeof projects !== 'undefined') projects = [];
                        if (typeof regularTasks !== 'undefined') regularTasks = [];
                        if (typeof processTemplates !== 'undefined') processTemplates = [];
                    } catch(e) {}
                }

                // Закриваємо всі Firestore listeners
                try {
                    if (typeof window.tasksUnsubscribe === 'function') { window.tasksUnsubscribe(); window.tasksUnsubscribe = null; }
                    if (typeof window.completedTasksUnsubscribe === 'function') { window.completedTasksUnsubscribe(); window.completedTasksUnsubscribe = null; }
                    if (typeof window._managerTasksUnsub === 'function') { window._managerTasksUnsub(); window._managerTasksUnsub = null; }
                    if (typeof reviewTasksUnsubscribe === 'function') { reviewTasksUnsubscribe(); reviewTasksUnsubscribe = null; }
                    if (typeof rejectedTasksUnsubscribe === 'function') { rejectedTasksUnsubscribe(); rejectedTasksUnsubscribe = null; }
                    // CRM, warehouse, bots, booking мають власний cleanup при закритті своїх модулів
                    if (window.crm?.dealUnsub) { window.crm.dealUnsub(); window.crm.dealUnsub = null; }
                    if (window._wh?.listeners?.length) { window._wh.listeners.forEach(u => u && u()); window._wh.listeners = []; }
                } catch(e) { console.warn('[Logout] cleanup error:', e.message); }
                // ── END LOGOUT CLEANUP ──────────────────────────

                document.getElementById('loadingPage').style.display = 'none';
                document.getElementById('authPage').style.display = 'flex'; document.getElementById('mainHeader') && (document.getElementById('mainHeader').style.display = 'none');
                document.getElementById('mainInterface').style.display = 'none';
                document.getElementById('logoutBtn').style.display = 'none';
                document.getElementById('adminTabBtn').style.display = 'none';
                // P3 FIX: bell завжди видимий — не ховаємо при логауті
                if (typeof notifications !== 'undefined') notifications = [];
                
                // Hide FAB on logout
                const fab = document.getElementById('fabAdd');
                if (fab) fab.style.display = 'none';
                
                // Перевіряємо чи є інвайт в URL
                const urlParams = new URLSearchParams(window.location.search);
                const inviteId = urlParams.get('invite');
                
                if (inviteId) {
                    // Є invite в URL — перевіряємо валідність і показуємо форму реєстрації
                    checkInviteUrl().then(result => {
                        if (result === true) {
                            showRegisterForm(); // Тепер currentInviteData вже заповнено
                        } else if (result === 'already_used') {
                            showLoginForm();
                            showAuthMessage(window.t('inviteAlreadyUsed'), 'info');
                        } else {
                            showRegisterForm(); // Показуємо форму все одно, нехай вводить email вручну
                            showAuthMessage(window.t('inviteNotFoundEmail'), 'error');
                        }
                    });
                } else {
                    showLoginForm();
                }
            }
            } catch(authErr) { console.error('[Auth] onAuthStateChanged error:', authErr); }
        });

        function showMainInterface() {
            document.getElementById('loadingPage').style.display = 'none';
            document.getElementById('authPage').style.display = 'none';
            document.getElementById('mainHeader').style.display = '';
            document.getElementById('mainInterface').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
            document.getElementById('currentUserInfo').style.display = 'flex';
            document.getElementById('notificationBell').style.display = 'flex';
            // Відновлюємо стан кнопки "Приховати виконані"
            const hideBtn = document.getElementById('hideCompletedBtn');
            if (hideBtn && window.hideCompletedTasks) hideBtn.classList.add('active');
            // Re-apply translations AFTER interface is shown (nav spans now visible)
            // FIX: застосовуємо переклади без reload — setLanguage(lang, false)
            const _authLang = window.currentLang || window.currentLanguage || localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || 'ua';
            // Синхронізуємо мову з Firestore (для Telegram сповіщень)
            // Якщо в Firestore є мова — беремо її; якщо ні — записуємо поточну
            try {
                if (window.currentUser && window.currentCompany && typeof db !== 'undefined') {
                    const _uRef = db.collection('companies').doc(window.currentCompany)
                        .collection('users').doc(window.currentUser.uid);
                    _uRef.get().then(function(_ud) {
                        if (_ud.exists) {
                            const _firestoreLang = _ud.data().language;
                            if (_firestoreLang && _firestoreLang !== _authLang) {
                                // Firestore має іншу мову — застосовуємо її
                                localStorage.setItem('talko_language', _firestoreLang);
                                window.currentLanguage = _firestoreLang;
                                window.currentLang = _firestoreLang;
                                if (typeof window.setLanguage === 'function') {
                                    setTimeout(function() { window.setLanguage(_firestoreLang, false); }, 150);
                                }
                            } else if (!_firestoreLang) {
                                // Немає мови в Firestore — записуємо поточну
                                _uRef.update({ language: _authLang }).catch(function() {});
                            }
                        }
                    }).catch(function() {});
                }
            } catch(e) { /* silent */ }
            if (typeof window.setLanguage === 'function') {
                setTimeout(function() { window.setLanguage(_authLang, false); }, 100);
            }
            // FIX: застосовуємо nav переклади окремо (setLanguage може не покривати dropdown)
            if (_authLang !== 'ua' && typeof window.applyNavTranslations === 'function') {
                setTimeout(function() { window.applyNavTranslations(_authLang); }, 200);
            }
        }

        function getRoleText(role) {
            const roleKeys = { owner: 'roleOwner', manager: 'roleManager', employee: 'roleEmployee', superadmin: 'adminRole' };
            return roleKeys[role] ? window.t(roleKeys[role]) : role;
        }

// ── SUBSCRIPTION ─────────────────────────────────────────────
function _checkAndApplySubscription(companyData, userData, isSuperadmin) {
    try {
        const badge = document.getElementById('subscriptionBadge');

        // SuperAdmin — без обмежень
        if (isSuperadmin) {
            if (badge) badge.style.display = 'none';
            return;
        }

        const subEnd = companyData?.subscriptionEnd?.toDate ? companyData.subscriptionEnd.toDate() : null;
        const plan   = companyData?.subscriptionPlan || 'trial';
        const status = companyData?.subscriptionStatus || 'active';
        const isOwner = userData?.role === 'owner';

        const now = new Date();

        // Якщо немає дати або статус expired або дата прострочена — paywall
        const isExpired = !subEnd || status === 'expired' || subEnd < now;

        if (isExpired) {
            _showPaywall();
            return;
        }

        // Бейдж — тільки для owner
        if (isOwner && badge && subEnd) {
            const daysLeft = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));
            const dd = String(subEnd.getDate()).padStart(2,'0');
            const mm = String(subEnd.getMonth()+1).padStart(2,'0');
            const label = `до ${dd}.${mm}`;

            let bg, color;
            if (daysLeft > 30)     { bg = 'rgba(34,197,94,0.25)';  color = '#16a34a'; }
            else if (daysLeft > 7) { bg = 'rgba(245,158,11,0.25)'; color = '#b45309'; }
            else                   { bg = 'rgba(239,68,68,0.25)';  color = '#dc2626'; }

            badge.textContent = label;
            badge.style.cssText = `display:inline-block;margin-left:6px;font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${bg};color:${color};border:1px solid ${color}33;cursor:default;`;
            badge.title = `Підписка: ${plan} | Залишилось днів: ${daysLeft}`;
        }
    } catch(e) {
        console.warn('[Subscription] check error:', e.message);
    }
}
window._checkAndApplySubscription = _checkAndApplySubscription;

function _showPaywall() {
    // Ховаємо інтерфейс — залишаємо тільки header
    const main = document.getElementById('mainInterface');
    if (!main) return;

    // Видаляємо попередній paywall якщо є
    const existing = document.getElementById('talkoPaywall');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'talkoPaywall';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.92);backdrop-filter:blur(4px);';
    overlay.innerHTML = `
    <div style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:2.5rem 2rem;max-width:380px;width:90%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.5);">
        <div style="width:64px;height:64px;background:rgba(239,68,68,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <div style="font-size:1.3rem;font-weight:800;color:white;margin-bottom:0.5rem;">Підписка закінчилась</div>
        <div style="font-size:0.88rem;color:#94a3b8;line-height:1.6;margin-bottom:1.75rem;">
            Для продовження роботи з TALKO System<br>зверніться до підтримки
        </div>
        <a href="https://t.me/alex_talko" target="_blank"
            style="display:inline-flex;align-items:center;gap:8px;background:#22c55e;color:white;padding:0.75rem 1.75rem;border-radius:12px;font-size:0.95rem;font-weight:700;text-decoration:none;transition:opacity .15s;"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>
            Звернутись до підтримки
        </a>
        <div style="margin-top:1rem;font-size:0.75rem;color:#475569;">@alex_talko</div>
    </div>`;

    document.body.appendChild(overlay);
}
window._showPaywall = _showPaywall;

