// =====================
        // AUTH STATE LISTENER
        // =====================
'use strict';
        auth.onAuthStateChanged(async (user) => {
            try {
            if (user) {
                currentUser = user;
                window.currentUser = user; // аліас для IIFE модулів
                
                // Очищаємо попередні listeners перед ініціалізацією нової сесії
                cleanupAllListeners();
                
                // Встановлюємо isSuperAdmin на основі email
                isSuperAdmin = window.isSuperAdmin = (user.email === 'management.talco@gmail.com'); // FIX: sync to window for cross-script access
                
                if (isSuperAdmin) {
                    const superBtn = document.getElementById('superadminBtn');
                    if (superBtn) superBtn.style.display = '';
                    const adminBtn = document.getElementById('adminTabBtn');
                    if (adminBtn) adminBtn.style.display = 'block';
                }
                
                const companyId = await findUserCompany(user.uid, user.email);
                
                if (!companyId && !isSuperAdmin) {
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
                        await db.collection('companies').doc(companyId).collection('users').doc(user.uid).set({
                            name: user.displayName || user.email.split('@')[0],
                            email: user.email.toLowerCase(),
                            role: 'employee',
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
                document.getElementById('currentUserRole').textContent = currentUserData ? `(${getRoleText(currentUserData.role)})` : '';
                document.getElementById('companyBadge').textContent = companyData?.name || '';
                document.getElementById('companyBadge').style.display = 'inline';
                
                if (currentUserData.role === 'employee') {
                    document.getElementById('inviteBtn').style.display = 'none';
                    document.getElementById('demoDataBtn').style.display = 'none';
                    // Ховаємо адмін-вкладки для співробітників
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        const tab = btn.getAttribute('onclick')?.match(/switchTab\('(\w+)'\)/)?.[1];
                        if (['users', 'functions'].includes(tab)) btn.style.display = 'none';
                    });
                }
                
                // Кнопка Демо: для superadmin і owner
                const showDemo = isSuperAdmin || currentUserData?.role === 'owner';
                document.getElementById('demoDataBtnDesktop').style.display = showDemo ? 'flex' : 'none';
                document.getElementById('demoDataBtn').style.display = showDemo ? 'flex' : 'none';
                
                // AI buttons: Generator + Import = owner only, AI config = admin/superadmin only
                const isOwnerRole = currentUserData?.role === 'owner';
                document.getElementById('ownerAiButtons').style.display = (isOwnerRole || isSuperAdmin) ? 'grid' : 'none';
                document.getElementById('aiAssistantsBtnMenu').style.display = isSuperAdmin ? 'flex' : 'none';
                document.getElementById('aiStructureBtnDesktop').style.display = 'none'; // temporarily disabled
                
                showMainInterface();
                initCalendar();
                initRegularView();
                initGoogleCalendar();
                loadAllData();
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
                    }
                    if (window.isFeatureEnabled && window.isFeatureEnabled('marketing')) {
                        const mktBtn = document.getElementById('marketingNavBtn');
                        if (mktBtn) mktBtn.style.display = '';
                        hasBizFeature = true;
                    }
                    if (window.isFeatureEnabled && window.isFeatureEnabled('bots')) {
                        const botsBtn = document.getElementById('botsNavBtn');
                        if (botsBtn) botsBtn.style.display = '';
                        if (typeof initBotsModule === 'function') initBotsModule();
                        hasBizFeature = true;
                    }
                    if (window.isFeatureEnabled && window.isFeatureEnabled('sites')) {
                        const sitesBtn = document.getElementById('sitesNavBtn');
                        if (sitesBtn) sitesBtn.style.display = '';
                        hasBizFeature = true;
                    }
                    // Склад — завжди доступний (display:none прибрано в HTML)
                    hasBizFeature = true;
                    // bizNavBtn та всі biz кнопки видимі за замовчуванням (display:none прибрано в HTML)

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
                // Очищаємо дані щоб не показувати чужі дані при re-login
                try {
                    if (typeof tasks !== 'undefined') tasks = [];
                    if (typeof users !== 'undefined') users = [];
                    if (typeof functions !== 'undefined') functions = [];
                    if (typeof processes !== 'undefined') processes = [];
                    if (typeof projects !== 'undefined') projects = [];
                    if (typeof regularTasks !== 'undefined') regularTasks = [];
                    if (typeof processTemplates !== 'undefined') processTemplates = [];
                } catch(e) {}

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
