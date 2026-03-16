// ============================================================
// api/google-oauth.js — Google OAuth2 Authorization Code Flow
//
// НАВІЩО: GIS (Google Identity Services) implicit flow дає тільки
// access_token на 1 год. Для постійного freebusy потрібен refresh_token.
// Authorization Code Flow: клієнт → Google → redirect → цей endpoint
// → обмін code на tokens → зберігаємо refresh_token в Firestore.
//
// GET  /api/google-oauth?action=init&uid=X&companyId=Y
//      → redirect на Google consent screen
//
// GET  /api/google-oauth?action=callback&code=X&state=Y
//      → обмін code на tokens → зберігає в Firestore → redirect на SPA
//
// POST /api/google-oauth?action=refresh
//      → body: { companyId, uid }
//      → оновлює access_token через refresh_token
// ============================================================

const admin = require('firebase-admin');

if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
    }
    pk = pk.replace(/\\n/g, '\n');
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId:   process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  pk || undefined,
            }),
        });
    } catch(e) {
        console.error('[google-oauth] Firebase init error:', e.message);
    }
}

const db = admin.firestore();

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const BASE_URL      = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://taskmanagerai-vert.vercel.app';
const REDIRECT_URI  = `${BASE_URL}/api/google-oauth?action=callback`;

const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

// ── Main handler ──────────────────────────────────────────
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', BASE_URL);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || '';

    try {
        // ── GET: init — перенаправляємо на Google consent screen ──
        if (req.method === 'GET' && action === 'init') {
            const { uid, companyId } = req.query;
            if (!uid || !companyId) return res.status(400).send('Missing uid or companyId');
            if (!CLIENT_ID) return res.status(500).send('GOOGLE_CLIENT_ID not configured');

            // Зберігаємо state щоб після callback знати uid+companyId
            const state = Buffer.from(JSON.stringify({ uid, companyId })).toString('base64url');

            const params = new URLSearchParams({
                client_id:     CLIENT_ID,
                redirect_uri:  REDIRECT_URI,
                response_type: 'code',
                scope:         SCOPES,
                access_type:   'offline',   // ← ключове: отримуємо refresh_token
                prompt:        'consent',   // ← завжди показуємо consent, щоб отримати refresh_token
                state,
            });

            return res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
        }

        // ── GET: callback — отримуємо code від Google ─────────
        if (req.method === 'GET' && action === 'callback') {
            const { code, state, error } = req.query;

            if (error) {
                return res.redirect(302, `/?google_oauth=error&reason=${encodeURIComponent(error)}`);
            }

            if (!code || !state) {
                return res.status(400).send('Missing code or state');
            }

            // Декодуємо state
            let uid, companyId;
            try {
                const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
                uid       = decoded.uid;
                companyId = decoded.companyId;
            } catch(e) {
                return res.status(400).send('Invalid state parameter');
            }

            if (!uid || !companyId) return res.status(400).send('Invalid state data');

            // Обмінюємо code на tokens
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id:     CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri:  REDIRECT_URI,
                    grant_type:    'authorization_code',
                }),
            });

            if (!tokenRes.ok) {
                const errBody = await tokenRes.text();
                console.error('[google-oauth] token exchange failed:', errBody);
                return res.redirect(302, '/?google_oauth=error&reason=token_exchange_failed');
            }

            const tokens = await tokenRes.json();
            // tokens: { access_token, refresh_token, expires_in, token_type, scope }

            if (!tokens.access_token) {
                return res.redirect(302, '/?google_oauth=error&reason=no_access_token');
            }

            // Отримуємо email користувача
            let email = '';
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { 'Authorization': `Bearer ${tokens.access_token}` },
                });
                if (userInfoRes.ok) {
                    const userInfo = await userInfoRes.json();
                    email = userInfo.email || '';
                }
            } catch(e) { /* non-critical */ }

            // Зберігаємо tokens у Firestore
            const updateData = {
                googleCalendarConnected: true,
                googleCalendarEmail:     email,
                googleAccessToken:       tokens.access_token,
                googleTokenExpiry:       admin.firestore.Timestamp.fromMillis(
                    Date.now() + (tokens.expires_in || 3600) * 1000
                ),
                googleCalendarUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // refresh_token приходить тільки при першому consent або prompt=consent
            if (tokens.refresh_token) {
                updateData.googleRefreshToken = tokens.refresh_token;
            }

            await db.collection('companies').doc(companyId)
                .collection('users').doc(uid)
                .set(updateData, { merge: true });

            // Повертаємо юзера на SPA з успіхом
            return res.redirect(302, `/?google_oauth=success&email=${encodeURIComponent(email)}`);
        }

        // ── POST: refresh — оновлюємо access_token ────────────
        if (req.method === 'POST' && action === 'refresh') {
            const { companyId, uid } = req.body || {};
            if (!companyId || !uid) return res.status(400).json({ error: 'Missing companyId or uid' });
            if (!CLIENT_SECRET) return res.status(500).json({ error: 'GOOGLE_CLIENT_SECRET not configured' });

            const userDoc = await db.collection('companies').doc(companyId)
                .collection('users').doc(uid).get();

            if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

            const userData = userDoc.data();
            const refreshToken = userData.googleRefreshToken;

            if (!refreshToken) {
                return res.status(400).json({
                    error: 'no_refresh_token',
                    message: 'Потрібно повторно підключити Google Calendar',
                });
            }

            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id:     CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type:    'refresh_token',
                }),
            });

            if (!tokenRes.ok) {
                const errBody = await tokenRes.text();
                console.error('[google-oauth] refresh failed:', errBody);
                // refresh_token протух або відкликаний — треба повторно підключити
                if (tokenRes.status === 400) {
                    await db.collection('companies').doc(companyId)
                        .collection('users').doc(uid)
                        .update({ googleTokenExpiry: admin.firestore.Timestamp.fromMillis(0) })
                        .catch(() => {});
                    return res.status(400).json({ error: 'refresh_token_invalid', reconnect: true });
                }
                return res.status(500).json({ error: 'refresh_failed' });
            }

            const tokens = await tokenRes.json();

            await db.collection('companies').doc(companyId)
                .collection('users').doc(uid)
                .update({
                    googleAccessToken: tokens.access_token,
                    googleTokenExpiry: admin.firestore.Timestamp.fromMillis(
                        Date.now() + (tokens.expires_in || 3600) * 1000
                    ),
                    googleCalendarUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

            return res.status(200).json({
                ok: true,
                expires_in: tokens.expires_in || 3600,
            });
        }

        return res.status(400).json({ error: 'Unknown action' });

    } catch(e) {
        console.error('[google-oauth] error:', e.message);
        return res.status(500).json({ error: e.message });
    }
};
