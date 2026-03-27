// =====================
        // AUTH FUNCTIONS
        // =====================
'use strict';
        function showAuthMessage(msg, type = 'info') {
            const el = document.getElementById('authMessage');
            el.textContent = msg;
            el.className = 'auth-message ' + type;
            el.style.display = 'block';
        }

        function hideAuthMessage() {
            document.getElementById('authMessage').style.display = 'none';
        }

        function togglePassword(inputId, btn) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<i data-lucide="eye-off" class="icon icon-sm"></i>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<i data-lucide="eye" class="icon icon-sm"></i>';
            }
            if (typeof window.refreshIcons === 'function') window.refreshIcons();
        }

        async function selfRegisterCompany() {
            const user = auth.currentUser;
            if (!user) { showAlertModal(window.t('signInFirst')); return; }
            
            const companyName = document.getElementById('selfRegCompanyName')?.value?.trim();
            const ownerName = document.getElementById('selfRegOwnerName')?.value?.trim();
            
            if (!companyName || !ownerName) {
                showAlertModal(window.t('fillAllFields'));
                return;
            }
            
            const btn = document.getElementById('selfRegBtn');
            if (btn) { btn.disabled = true; btn.textContent = window.t('loading'); }
            
            try {
                const companyId = companyName.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/g, '_').substring(0, 30) + '_' + Date.now().toString(36);
                
                const batch = db.batch();
                
                // 1. Company doc
                batch.set(db.collection('companies').doc(companyId), {
                    name: companyName,
                    ownerName: ownerName,
                    ownerEmail: user.email.toLowerCase(),
                    ownerId: user.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    disabled: false
                });
                
                // 2. User in company
                batch.set(db.collection('companies').doc(companyId).collection('users').doc(user.uid), {
                    name: ownerName,
                    email: user.email.toLowerCase(),
                    role: 'owner',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // 3. Global user mapping
                batch.set(db.collection('users').doc(user.uid), {
                    email: user.email.toLowerCase(),
                    companyId: companyId,
                    role: 'owner'
                });
                
                try {
                await batch.commit();
                } catch(err) {
                    console.error('[Batch] commit failed:', err);
                    showToast && showToast(window.t('savingError'), 'error');
                }
                
                // Reload — onAuthStateChanged знайде companyId і зайде
                window.location.reload();
                
            } catch (error) {
                console.error('Self registration error:', error);
                showAlertModal(window.t('createError') + ': ' + error.message);
                if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="rocket" class="icon"></i> Створити компанію'; }
            }
        }
        
        function showNoAccess() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('noAccessCard').style.display = 'block';
        }

        let currentInviteData = null; // Дані поточного інвайту з URL
        
        // Перевірка інвайту в URL
        async function checkInviteUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            const inviteId = urlParams.get('invite');
            
            if (!inviteId) {
                currentInviteData = null;
                return false;
            }
            
            try {
                const inviteDoc = await db.collection('invites').doc(inviteId).get();
                
                if (!inviteDoc.exists) {
                    showAuthMessage(window.t('inviteNotFound'), 'error');
                    currentInviteData = null;
                    return false;
                }
                
                const invite = inviteDoc.data();
                
                if (invite.accepted) {
                    currentInviteData = null;
                    // Не показуємо помилку тут - покажемо форму входу з підказкою
                    return 'already_used';
                }

                // Перевірка терміну дії
                if (invite.expiresAt) {
                    const expires = invite.expiresAt.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
                    if (new Date() > expires) {
                        showAuthMessage && showAuthMessage(window.t('inviteLinkExpired'), 'error');
                        currentInviteData = null;
                        return false;
                    }
                }
                
                currentInviteData = { id: inviteId, ...invite };
                return true;
            } catch (e) {
                console.error('Error checking invite:', e);
                currentInviteData = null;
                return false;
            }
        }
        
        function showLoginForm() {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('noAccessCard').style.display = 'none';
            hideAuthMessage();
            
            // Скидаємо поля реєстрації
            const emailField = document.getElementById('registerEmail');
            emailField.value = '';
            emailField.readOnly = false;
            emailField.style.background = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerPasswordConfirm').value = '';
        }
        
        function toggleAuthHelp() {
            const content = document.getElementById('authHelpContent');
            const arrow = document.getElementById('authHelpArrow');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            } else {
                content.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }
        
        function showRegisterForm() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('noAccessCard').style.display = 'none';
            hideAuthMessage();
            
            // Скидаємо поля входу
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            
            const emailField = document.getElementById('registerEmail');
            
            // Якщо є інвайт в URL — автозаповнюємо email
            if (currentInviteData && currentInviteData.email) {
                emailField.value = currentInviteData.email;
                emailField.readOnly = true;
                emailField.style.background = '#f0f0f0';
            } else {
                emailField.value = '';
                emailField.readOnly = false;
                emailField.style.background = '';
            }
        }
        
        // Реєстрація за запрошенням
        async function registerWithInvite() {
            const email = document.getElementById('registerEmail').value.trim().toLowerCase();
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            
            // Валідація
            if (!email) {
                showAuthMessage(window.t('enterEmail'), 'error');
                return;
            }
            
            if (!password || password.length < 6) {
                showAuthMessage(window.t('passwordMinLength'), 'error');
                return;
            }
            
            if (password !== passwordConfirm) {
                showAuthMessage(window.t('passwordsMismatch'), 'error');
                return;
            }
            
            try {
                showAuthMessage(window.t('registering'), 'info');
                
                // КРОК 1: Спочатку створюємо Auth акаунт
                // (потрібен для доступу до Firestore — invites вимагають авторизацію)
                dbg('[Register] Creating auth account...');
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                dbg('[Register] Auth account created.');
                
                // КРОК 2: Тепер авторизовані — шукаємо invite
                // (onAuthStateChanged спрацює автоматично і викличе findUserCompany,
                //  який знайде invite і прив'яже юзера до компанії)
                
                // Якщо є currentInviteData з URL — перевіряємо відповідність
                if (currentInviteData && currentInviteData.email.toLowerCase() !== email.toLowerCase()) {
                    showAuthMessage(window.t('emailMismatchInvite'), 'error');
                    return;
                }
                
                // Очищаємо URL від параметра invite
                window.history.replaceState({}, document.title, window.location.pathname);
                currentInviteData = null;
                
                dbg('[Register] Success! Waiting for onAuthStateChanged...');
                showAuthMessage(window.t('registerSuccess'), 'success');
                
            } catch (e) {
                console.error('[Register] Error:', e.code, e.message);
                let msg = window.t('registerError');
                if (e.code === 'auth/email-already-in-use') {
                    msg = window.t('emailAlreadyRegistered');
                }
                if (e.code === 'auth/invalid-email') {
                    msg = window.t('invalidEmail');
                }
                if (e.code === 'auth/weak-password') {
                    msg = window.t('weakPassword');
                }
                showAuthMessage(msg, 'error');
            }
        }

        // Google Sign-In
        async function signInWithGoogle() {
            try {
                // На мобільних використовуємо redirect замість popup
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                    await auth.signInWithRedirect(googleProvider);
                } else {
                    await auth.signInWithPopup(googleProvider);
                }
            } catch (e) {
                showAuthMessage(window.t('error') + ': ' + e.message, 'error');
            }
        }
        
        // Обробка результату redirect
        auth.getRedirectResult().then((result) => {
            if (result.user) {
                // Користувач увійшов через redirect
                dbg('Redirect login success');
            }
        }).catch((e) => {
            if (e.code) {
                showAuthMessage(window.t('error') + ': ' + e.message, 'error');
            }
        });

        // Email + Password Sign In
        async function signInWithEmail() {
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showAuthMessage(window.t('enterEmailAndPassword'), 'error');
                return;
            }
            
            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (e) {
                let msg = window.t('loginError');
                if (e.code === 'auth/user-not-found') msg = window.t('userNotFound');
                if (e.code === 'auth/wrong-password') msg = window.t('wrongPassword');
                if (e.code === 'auth/invalid-email') msg = window.t('invalidEmail');
                if (e.code === 'auth/invalid-credential') msg = window.t('invalidCredentials');
                showAuthMessage(msg, 'error');
            }
        }

        // Password Reset
        async function resetPassword() {
            const email = document.getElementById('loginEmail').value.trim();
            if (!email) {
                showAuthMessage(window.t('enterEmailForReset'), 'error');
                return;
            }
            
            try {
                await auth.sendPasswordResetEmail(email);
                showAuthMessage(window.t('resetLinkSentTo') + email, 'success');
            } catch (e) {
                showAuthMessage(window.t('error') + ': ' + e.message, 'error');
            }
        }

        async function findUserCompany(userId, email) {
            try {
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    return userDoc.data().companyId;
                }
                
                const invitesQuery = await db.collection('invites')
                    .where('email', '==', email.toLowerCase())
                    .where('accepted', '==', false)
                    .limit(1)
                    .get();
                
                if (!invitesQuery.empty) {
                    const invite = invitesQuery.docs[0];
                    const inviteData = invite.data();
                    const companyId = inviteData.companyId;
                    const isOwnerInvite = inviteData.role === 'owner';
                    
                    // Batch write — все або нічого (атомарно)
                    const batch = db.batch();
                    
                    // 1. Додаємо юзера в компанію
                    const companyUserRef = db.collection('companies').doc(companyId).collection('users').doc(userId);
                    batch.set(companyUserRef, {
                        name: inviteData.ownerName || inviteData.name || email.split('@')[0],
                        email: email.toLowerCase(),
                        role: inviteData.role || 'employee',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // 2. Глобальний маппінг userId → companyId
                    const globalUserRef = db.collection('users').doc(userId);
                    batch.set(globalUserRef, {
                        email: email.toLowerCase(),
                        companyId: companyId,
                        role: inviteData.role || 'employee'
                    });
                    
                    // 3. Якщо Owner — оновлюємо компанію
                    if (isOwnerInvite) {
                        const companyRef = db.collection('companies').doc(companyId);
                        batch.update(companyRef, { ownerId: userId });
                    }
                    
                    // 4. Позначаємо invite як використаний
                    batch.update(invite.ref, { 
                        accepted: true, 
                        acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        acceptedBy: userId
                    });
                    
                    // Один запит — все атомарно
                    try {
                    await batch.commit();
                    } catch(err) {
                        console.error('[Batch] commit failed:', err);
                        showToast && showToast(window.t('savingError'), 'error');
                    }
                    dbg('[findUserCompany] Batch commit success, role:', inviteData.role);
                    
                    return companyId;
                }
                
                return null;
            } catch (error) {
                console.error('[findUserCompany] Error:', error);
                // Якщо offline/network помилка — повертаємо спеціальний маркер
                if (error.code === 'unavailable' || (error.message && error.message.includes('offline'))) {
                    return '__offline__';
                }
                return null;
            }
        }

        // Централізована очистка всіх listeners та intervals
        function cleanupAllListeners() {
            if (window.tasksUnsubscribe) {
                window.tasksUnsubscribe();
                window.tasksUnsubscribe = null;
            }
            if (window.completedTasksUnsubscribe) {
                window.completedTasksUnsubscribe();
                window.completedTasksUnsubscribe = null;
            }
            if (window.reviewTasksUnsubscribe) {
                window.reviewTasksUnsubscribe();
                window.reviewTasksUnsubscribe = null;
            }
            if (window.rejectedTasksUnsubscribe) {
                window.rejectedTasksUnsubscribe();
                window.rejectedTasksUnsubscribe = null;
            }
            try {
                if (window.commentsUnsubscribe) {
                    window.commentsUnsubscribe();
                    window.commentsUnsubscribe = null;
                }
            } catch(e) { console.error('[05-auth-functions]', e.message); }
            if (window.timeTrackerInterval) {
                clearInterval(window.timeTrackerInterval);
                window.timeTrackerInterval = null;
                window.timeTrackerStart = null;
            }
            if (typeof notificationCheckInterval !== 'undefined' && notificationCheckInterval) {
                clearInterval(notificationCheckInterval);
                notificationCheckInterval = null;
            }
            if (typeof infiniteScrollObserver !== 'undefined' && infiniteScrollObserver) {
                infiniteScrollObserver.disconnect();
                infiniteScrollObserver = null;
            }
            // Clear page title interval
            if (typeof _pageTitleInterval !== 'undefined' && _pageTitleInterval) {
                clearInterval(_pageTitleInterval);
                _pageTitleInterval = null;
            }
            // FIX: cleanup offline save interval
            if (window._offlineSaveInterval) {
                clearInterval(window._offlineSaveInterval);
                window._offlineSaveInterval = null;
            }
            // FIX: cleanup calendar time line interval
            if (window._calendarTimeLineInterval) {
                clearInterval(window._calendarTimeLineInterval);
                window._calendarTimeLineInterval = null;
            }
            // Clear undo timers
            if (typeof undoTimerInterval !== 'undefined' && undoTimerInterval) {
                clearInterval(undoTimerInterval);
                undoTimerInterval = null;
            }
            if (typeof undoTimeout !== 'undefined' && undoTimeout) {
                clearTimeout(undoTimeout);
                undoTimeout = null;
            }
            // ── Очищаємо switchTab handlers (memory leak prevention) ───
            if (typeof window.clearSwitchTabHandlers === 'function') {
                window.clearSwitchTabHandlers();
            }
            // ── Скидаємо модулі при logout (для re-login іншого юзера) ────
            if (typeof window.destroyBotsModule === 'function') {
                window.destroyBotsModule();
            }
            // CRM listeners cleanup on logout
            if (typeof window.destroyCRMListeners === 'function') {
                window.destroyCRMListeners();
            }
            // Coordination listeners cleanup on logout
            if (typeof window.destroyCoordListeners === 'function') {
                window.destroyCoordListeners();
            }
            // Finance cache reset on logout (щоб наступний юзер не бачив чужі дані)
            window._financeTxCache = null;
            // FIX: CRM listeners cleanup on logout (legacy TALKO.crm.unsubs path)
            if (window.TALKO && window.TALKO.crm && window.TALKO.crm.unsubs) {
                window.TALKO.crm.unsubs.forEach(u => u && u());
                window.TALKO.crm.unsubs = [];
            }
            if (window.TALKO && window.TALKO.crm) {
                window.TALKO.crm._initializingFor = null;
            }
            // FIX: Landing pages listener cleanup on logout
            if (typeof window.destroyLandingPagesModule === 'function') {
                window.destroyLandingPagesModule();
            }
            // Reset TALKO domain caches
            if (window.TALKO) {
                if (window.TALKO.crm)   window.TALKO.crm._initialized   = false;
                if (window.TALKO.bots)  window.TALKO.bots._initialized  = false;
                if (window.TALKO.sites) window.TALKO.sites._initialized = false;
                if (window.TALKO.learn) window.TALKO.learn._initialized = false;
            }
        }
        
        function logout() {
            if (window._cleanupNotifications) window._cleanupNotifications();
            cleanupAllListeners();
            
            // Очищаємо стан
            currentCompany = null;
            currentUserData = null;
            tasks = [];
            regularTasks = [];
            functions = [];
            users = [];
            processes = [];
            processTemplates = [];
            projects = [];
            openProjectId = null;
            
            auth.signOut().then(() => {
                showLoginForm();
                hideAuthMessage();
            });
        }
