// =====================
        // GOOGLE CALENDAR INTEGRATION (Authorization Code Flow)
        // =====================
        
'use strict';
        window.initGoogleCalendar = function initGoogleCalendar() {
            checkGoogleCalendarStatus();
            // Слухаємо результат OAuth redirect
            const params = new URLSearchParams(window.location.search);
            const oauthResult = params.get('google_oauth');
            if (oauthResult === 'success') {
                const email = params.get('email') || '';
                showCalendarConnected(email);
                history.replaceState({}, '', window.location.pathname);
                if (typeof showToast === 'function') showToast('Google Calendar підключено', 'success');
            } else if (oauthResult === 'error') {
                const reason = params.get('reason') || 'unknown';
                history.replaceState({}, '', window.location.pathname);
                if (typeof showToast === 'function') showToast('Помилка підключення Google: ' + reason, 'error');
            }
        }
        
        function checkGoogleCalendarStatus() {
            if (!currentUser || !currentCompany) return;
            window.companyRef()
                .collection('users').doc(currentUser.uid)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        if (data.googleCalendarConnected && data.googleCalendarEmail) {
                            showCalendarConnected(data.googleCalendarEmail);
                            googleAccessToken = data.googleAccessToken || null;
                            const expiry = data.googleTokenExpiry?.toMillis?.() || 0;
                            const hasRefresh = !!data.googleRefreshToken;
                            if (!hasRefresh && expiry > 0 && Date.now() > expiry) {
                                showCalendarTokenWarning();
                            }
                        } else {
                            showCalendarNotConnected();
                        }
                    }
                })
                .catch(err => console.error('Error checking calendar status:', err));
        }
        
        function showCalendarConnected(email) {
            const connected = document.getElementById('gcalConnected');
            const notConnected = document.getElementById('gcalNotConnected');
            const emailEl = document.getElementById('gcalEmail');
            const warningEl = document.getElementById('gcalTokenWarning');
            if (connected) connected.style.display = 'block';
            if (notConnected) notConnected.style.display = 'none';
            if (warningEl) warningEl.style.display = 'none';
            if (emailEl) emailEl.textContent = (window.t ? window.t('connected') : 'Підключено') + ': ' + email;
        }
        
        function showCalendarNotConnected() {
            const connected = document.getElementById('gcalConnected');
            const notConnected = document.getElementById('gcalNotConnected');
            if (connected) connected.style.display = 'none';
            if (notConnected) notConnected.style.display = 'block';
        }

        function showCalendarTokenWarning() {
            let w = document.getElementById('gcalTokenWarning');
            if (!w) {
                w = document.createElement('div');
                w.id = 'gcalTokenWarning';
                w.style.cssText = 'margin-top:.5rem;padding:.5rem .75rem;background:#fef3c7;border-radius:8px;font-size:.82rem;color:#92400e;';
                w.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Токен Google протух. <a href="#" onclick="connectGoogleCalendar();return false;" style="color:#92400e;font-weight:600;">Оновити підключення</a>';
                const connected = document.getElementById('gcalConnected');
                if (connected) connected.appendChild(w);
            }
            w.style.display = 'block';
        }
        
        function connectGoogleCalendar() {
            if (!currentUser || !window.currentCompanyId) {
                if (typeof showAlertModal === 'function') showAlertModal(window.t('loginFirst'));
                return;
            }
            const uid       = currentUser.uid;
            const companyId = window.currentCompanyId;
            window.location.href = '/api/google-oauth?action=init&uid=' + encodeURIComponent(uid) + '&companyId=' + encodeURIComponent(companyId);
        }
        
        async function disconnectGoogleCalendar() {
            if (typeof showConfirmModal === 'function') {
                const ok = await showConfirmModal(
                    window.t ? window.t('disconnectGoogleCalendar') : 'Відключити Google Calendar?',
                    { danger: true }
                );
                if (!ok) return;
            }
            if (googleAccessToken && typeof google !== 'undefined') {
                try { google.accounts.oauth2.revoke(googleAccessToken, () => {}); } catch(e) {}
            }
            window.companyRef().collection('users').doc(currentUser.uid).get()
                .then(async doc => {
                    const rt = doc.data()?.googleRefreshToken;
                    if (rt) {
                        fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(rt), { method: 'POST' }).catch(() => {});
                    }
                }).catch(() => {});
            window.companyRef()
                .collection('users').doc(currentUser.uid)
                .set({
                    googleCalendarConnected: false,
                    googleCalendarEmail:     firebase.firestore.FieldValue.delete(),
                    googleAccessToken:       firebase.firestore.FieldValue.delete(),
                    googleRefreshToken:      firebase.firestore.FieldValue.delete(),
                    googleTokenExpiry:       firebase.firestore.FieldValue.delete(),
                }, { merge: true })
                .then(() => {
                    googleAccessToken = null;
                    showCalendarNotConnected();
                    if (typeof showAlertModal === 'function')
                        showAlertModal(window.t ? window.t('googleCalendarDisconnected') : 'Google Calendar відключено');
                })
                .catch(err => {
                    if (typeof showAlertModal === 'function')
                        showAlertModal((window.t ? window.t('error') : 'Помилка') + ': ' + err.message);
                });
        }
