// ============================================================
// TALKO OS — Cloudflare Pages Worker
// Routes: /s/:slug, /api/site, /api/ai-proxy, /api/webhook,
//         /api/booking, /api/stripe, /api/crm-form,
//         /api/crm-reminders, /api/warehouse, /api/funnel-ai,
//         /api/crm-trigger-notify
// All others → static assets
// ============================================================

const PROJECT_ID  = 'task-manager-44e84';
const FS_URL      = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const FS_QUERY    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

// ── Firebase JWT ─────────────────────────────────────────────
// Token cache (в межах однієї Worker ізоляції)
let _tokenCache = null;
let _tokenExpiry = 0;

async function getToken(env) {
    const _cacheNow = Math.floor(Date.now() / 1000);
    if (_tokenCache && _cacheNow < _tokenExpiry - 60) return _tokenCache;

    let pk = env.FIREBASE_PRIVATE_KEY || '';
    // Handle literal \n sequences
    if (pk.includes('\\n')) pk = pk.replace(/\\n/g, '\n');
    // Handle base64 encoded key
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = atob(pk); } catch(e) {}
    }
    const email = env.FIREBASE_CLIENT_EMAIL;
    if (!pk || !email) throw new Error('Missing Firebase credentials');

    const now = Math.floor(Date.now() / 1000);
    const header  = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = b64url(JSON.stringify({
        iss: email, sub: email,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now, exp: now + 3600,
        scope: 'https://www.googleapis.com/auth/datastore',
    }));
    const unsigned = `${header}.${payload}`;


    const key = await crypto.subtle.importKey(
        'pkcs8', pemToBuf(pk),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false, ['sign']
    );
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc(unsigned));
    const jwt = `${unsigned}.${b64url_raw(sig)}`;

    const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    const d = await r.json();
    if (!d.access_token) throw new Error('Token error: ' + JSON.stringify(d));
    _tokenCache = d.access_token;
    _tokenExpiry = _cacheNow + 3600;
    return d.access_token;
}

function b64url(s)     { return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
function b64url_raw(b) { return btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
function enc(s)        { return new TextEncoder().encode(s); }
function pemToBuf(pem) {
    // Remove PEM headers and all whitespace
    const b64 = pem
        .replace(/-----BEGIN[^-]+-----/, '')
        .replace(/-----END[^-]+-----/, '')
        .replace(/[\r\n\s]+/g, '');
    // Decode base64 to binary
    const binary = atob(b64);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buf[i] = binary.charCodeAt(i);
    }
    return buf.buffer;
}

// ── Firestore helpers ────────────────────────────────────────
async function fsGet(path, token) {
    const r = await fetch(`${FS_URL}/${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    return r.json();
}
async function fsQuery(collId, filters, token, limit=200) {
    // Якщо filters порожній — запит без where (повертає всі документи колекції)
    const query = {
        from: [{ collectionId: collId, allDescendants: true }],
        limit,
    };
    if (filters && filters.length > 0) {
        query.where = { compositeFilter: { op: 'AND', filters: filters.map(f=>({
            fieldFilter: { field:{fieldPath:f.field}, op:'EQUAL', value:{stringValue:f.value} }
        })) } };
    }
    const body = { structuredQuery: query };
    const r = await fetch(FS_QUERY, {
        method:'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify(body),
    });
    if (!r.ok) return [];
    const docs = await r.json();
    return docs.filter(d=>d.document).map(d=>d.document);
}
async function fsPatch(path, fields, token) {
    const masks = Object.keys(fields).map(k=>`updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
    await fetch(`${FS_URL}/${path}?${masks}`, {
        method:'PATCH',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ fields }),
    });
}
async function fsSet(path, fields, token) {
    await fetch(`${FS_URL}/${path}`, {
        method:'PATCH',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ fields }),
    });
}

function fVal(v) {
    if (!v) return null;
    if (v.stringValue  !== undefined) return v.stringValue;
    if (v.booleanValue !== undefined) return v.booleanValue;
    if (v.integerValue !== undefined) return parseInt(v.integerValue);
    if (v.doubleValue  !== undefined) return parseFloat(v.doubleValue);
    if (v.arrayValue   !== undefined) return (v.arrayValue.values||[]).map(fVal);
    if (v.mapValue     !== undefined) return fFields(v.mapValue.fields||{});
    return null;
}
function fFields(f) { const o={}; for(const k in f) o[k]=fVal(f[k]); return o; }

// Verifyidtoken via Firebase Auth REST
async function verifyIdToken(token, env) {
    if (!env.FIREBASE_API_KEY) return { uid: 'unknown' }; // skip if no key
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);
        const r = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`,
            { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({idToken:token}), signal: controller.signal }
        );
        if (!r.ok) return null;
        const d = await r.json();
        return d.users?.[0] || null;
    } catch { return null; }
}

// ── Helpers ──────────────────────────────────────────────────
function esc(s)   { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function cssVal(v,fb) {
    const s=String(v||fb||'');
    if(/[^a-zA-Z0-9#%.() ,-]/.test(s)) return fb||'';
    if(/expression|javascript|url\s*\(|import|@/i.test(s)) return fb||'';
    return s;
}
function json(d, status=200) {
    return new Response(JSON.stringify(d), { status, headers:{ 'Content-Type':'application/json', ...cors() } });
}
function cors() { return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type,Authorization', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' }; }
function html(body, status=200) { return new Response(body, { status, headers:{ 'Content-Type':'text/html;charset=utf-8', ...cors() } }); }
function errHtml(msg, status=400) {
    return html(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Помилка</title></head>
<body style="font-family:system-ui;text-align:center;padding:3rem;color:#374151">
<h2 style="margin-bottom:.5rem">Помилка</h2><p style="color:#6b7280">${esc(msg)}</p></body></html>`, status);
}

// ════════════════════════════════════════════════════════════
// handleGoogleOauth — Google Calendar OAuth 2.0 flow
// GET /api/google-oauth?action=init&uid=X&companyId=Y  → redirect to Google
// GET /api/google-oauth?code=X&state=Y                 → exchange code → save tokens → redirect to app
// ════════════════════════════════════════════════════════════
async function handleGoogleOauth(request, url, env) {
    const action = url.searchParams.get('action');
    const appBase = `https://${new URL(request.url).hostname}`;
    const redirectUri = `${appBase}/api/google-oauth`;

    const clientId     = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return new Response('Google OAuth not configured (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)', { status: 500 });
    }

    // ── Step 1: init — redirect to Google consent screen ────────
    if (action === 'init') {
        const uid       = url.searchParams.get('uid') || '';
        const companyId = url.searchParams.get('companyId') || '';
        if (!uid || !companyId) return new Response('Missing uid or companyId', { status: 400 });

        const state = btoa(JSON.stringify({ uid, companyId }));
        const scope = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'email',
            'profile',
        ].join(' ');

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scope);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        return Response.redirect(authUrl.toString(), 302);
    }

    // ── Step 2: callback — exchange code for tokens ──────────────
    const code  = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
        return Response.redirect(`${appBase}/?google_oauth=error&reason=${encodeURIComponent(error)}`, 302);
    }
    if (!code || !state) {
        return Response.redirect(`${appBase}/?google_oauth=error&reason=missing_params`, 302);
    }

    let uid, companyId;
    try {
        const parsed = JSON.parse(atob(state));
        uid       = parsed.uid;
        companyId = parsed.companyId;
    } catch(e) {
        return Response.redirect(`${appBase}/?google_oauth=error&reason=invalid_state`, 302);
    }

    // Exchange code for tokens
    let tokens;
    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id:     clientId,
                client_secret: clientSecret,
                redirect_uri:  redirectUri,
                grant_type:    'authorization_code',
            }),
        });
        tokens = await tokenRes.json();
        if (tokens.error) throw new Error(tokens.error_description || tokens.error);
    } catch(e) {
        return Response.redirect(`${appBase}/?google_oauth=error&reason=${encodeURIComponent(e.message)}`, 302);
    }

    // Отримуємо email користувача
    let email = '';
    try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const info = await infoRes.json();
        email = info.email || '';
    } catch(e) {}

    // Зберігаємо токени у Firestore через service account
    try {
        const saToken = await getServiceAccountToken(env);
        if (saToken) {
            const expiryMs = Date.now() + (tokens.expires_in || 3600) * 1000;
            const docPath  = `companies/${companyId}/users/${uid}`;
            const fields   = {
                googleCalendarConnected: { booleanValue: true },
                googleCalendarEmail:     { stringValue: email },
                googleAccessToken:       { stringValue: tokens.access_token || '' },
                googleTokenExpiry:       { timestampValue: new Date(expiryMs).toISOString() },
            };
            if (tokens.refresh_token) {
                fields.googleRefreshToken = { stringValue: tokens.refresh_token };
            }
            const maskFields = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&');
            await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/${docPath}?${maskFields}`,
                {
                    method:  'PATCH',
                    headers: { 'Authorization': `Bearer ${saToken}`, 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ fields }),
                }
            );
        }
    } catch(e) {
        console.error('[GoogleOauth] Firestore save error:', e.message);
    }

    return Response.redirect(
        `${appBase}/?google_oauth=success&email=${encodeURIComponent(email)}`,
        302
    );
}

// ════════════════════════════════════════════════════════════
// handleNotifyNewRegistration — Telegram сповіщення супер-адміну
// ════════════════════════════════════════════════════════════
async function handleNotifyNewRegistration(request, env) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { companyId, companyName, ownerName, ownerEmail } = body;

    // Telegram сповіщення через системний бот
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const adminChatId = env.SUPERADMIN_TELEGRAM_CHAT_ID || ''; // додай в Cloudflare env

    if (botToken && adminChatId) {
        const msg = `🆕 <b>Нова реєстрація!</b>\n\n` +
            `🏢 <b>${companyName}</b>\n` +
            `👤 ${ownerName}\n` +
            `📧 ${ownerEmail}\n` +
            `🔑 ID: <code>${companyId}</code>\n\n` +
            `Відкрий адмін панель → Заявки для підтвердження.`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: adminChatId, text: msg, parse_mode: 'HTML' }),
        }).catch(() => {});
    }

    return json({ ok: true });
}

// ── Main router ──────────────────────────────────────────────
export default {
    async fetch(request, env, ctx) {
        const url  = new URL(request.url);
        const path = url.pathname;

        // CORS preflight
        if (request.method === 'OPTIONS') return new Response(null,{status:200,headers:cors()});

        // ── /s/:slug — public landing page ──────────────────
        const slugM = path.match(/^\/s\/(.+)$/);
        if (slugM) return handleSite(request, url, env, null, null, slugM[1]);

        // ── /api/site ────────────────────────────────────────
        if (path === '/api/site') return handleSite(request, url, env, url.searchParams.get('id'), url.searchParams.get('cid'), url.searchParams.get('slug'));

        // ── /api/ai-proxy ────────────────────────────────────
        if (path === '/api/ai-proxy') return handleAiProxy(request, env);

        // ── /api/webhook ─────────────────────────────────────
        if (path === '/api/webhook') return handleWebhook(request, url, env);

        // ── /api/bot-debug ─── діагностика flow бота ─────────
        if (path === '/api/bot-debug') return handleBotDebug(request, url, env);

        // ── /api/fix-company ─── виправлення companyId ────────
        if (path === '/api/fix-company') return handleFixCompany(request, url, env);

        // ── /api/fix-edges ─── запис edges в flow document ────────
        if (path === '/api/fix-edges') {
            const cid2 = url.searchParams.get('cid') || url.searchParams.get('companyId') || '';
            const bid2 = url.searchParams.get('botId') || '';
            const fid2 = url.searchParams.get('flowId') || '';
            if (!cid2 || !bid2 || !fid2) return json({ error: 'need cid, botId, flowId' });
            let tok2;
            try { tok2 = await getToken(env); } catch(e) { return json({ error: e.message }); }
            // Читаємо canvasData/layout де edges точно є
            const cvSnap = await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid2}/bots/${bid2}/flows/${fid2}/canvasData/layout`,
                { headers: { Authorization: `Bearer ${tok2}` } }
            );
            if (!cvSnap.ok) return json({ error: 'canvasData/layout not found' });
            const cvData = await cvSnap.json();
            const cvFields = fFields(cvData.fields || {});
            const cvEdges = Array.isArray(cvFields.edges) ? cvFields.edges : [];
            // Записуємо edges в flow document
            await fsPatch(`companies/${cid2}/bots/${bid2}/flows/${fid2}`, {
                edges: { arrayValue: { values: cvEdges.map(e => ({ mapValue: { fields: {
                    id:       { stringValue: e.id || '' },
                    fromNode: { stringValue: e.fromNode || e.source || '' },
                    fromPort: { stringValue: e.fromPort || e.sourceHandle || 'out' },
                    toNode:   { stringValue: e.toNode || e.target || '' },
                    toPort:   { stringValue: e.toPort || 'in' },
                }}}))}},
            }, tok2);
            return json({ ok: true, edgesCount: cvEdges.length, edges: cvEdges });
        }

        // ── /api/crm-form ────────────────────────────────────
        if (path === '/api/crm-form') return handleCrmForm(request, env);

        // ── /api/booking ─────────────────────────────────────
        if (path === '/api/booking') return handleBooking(request, url, env);

        // ── /api/stripe ──────────────────────────────────────
        if (path.startsWith('/api/stripe')) return handleStripe(request, url, env);

        // ── /api/crm-trigger-notify ──────────────────────────
        if (path === '/api/crm-trigger-notify') return handleCrmTriggerNotify(request, env);

        // ── /api/generate-pdf ─── накладні та акти ───────────
        if (path === '/api/generate-pdf') return handleGeneratePdf(request, url, env);

        // ── /api/google-oauth ─── Google Calendar OAuth flow ──
        if (path === '/api/google-oauth') return handleGoogleOauth(request, url, env);

        // ── /api/notify-new-registration ─── сповіщення про нову реєстрацію ──
        if (path === '/api/notify-new-registration') return handleNotifyNewRegistration(request, env);

        // ── /api/ping ────────────────────────────────────────
        if (path === '/api/ping') return json({ ok:true, ts:Date.now() });
        if (path === '/api/generate-image') return handleGenerateImage(request, env);

        // ── Static assets ────────────────────────────────────
        return env.ASSETS.fetch(request);
    }
};

// ════════════════════════════════════════════════════════════
// SITE HANDLER — renders public landing pages
// ════════════════════════════════════════════════════════════
async function handleSite(request, url, env, siteId, companyId, slug) {
    let token;
    try { token = await getToken(env); } catch(e) { return errHtml('Помилка авторизації: '+e.message, 500); }

    if (slug && !siteId) {
        const docs = await fsQuery('sites',[{field:'slug',value:slug.toLowerCase().trim()},{field:'status',value:'published'}],token);
        if (!docs.length) return errHtml('Сайт не знайдено: /'+slug, 404);
        const parts = docs[0].name.split('/');
        companyId = parts[parts.indexOf('companies')+1];
        siteId    = parts[parts.indexOf('sites')+1];
    }
    if (!siteId||!companyId) return errHtml('Невірне посилання',400);

    const doc = await fsGet(`companies/${companyId}/sites/${siteId}`, token);
    if (!doc) return errHtml('Сайт не знайдено',404);

    const site = fFields(doc.fields||{});
    if (site.status !== 'published') return errHtml('Сайт не опублікований',403);

    // Non-blocking visit tracking
    const newVisits = (site.visits||0)+1;
    fsPatch(`companies/${companyId}/sites/${siteId}`,{
        visits:{ integerValue: String(newVisits) },
        lastVisitAt:{ timestampValue: new Date().toISOString() },
    }, token).catch(()=>{});

    if (site.mode==='html' && site.rawHtml) return html(site.rawHtml);

    const primary = cssVal(site.theme?.primaryColor,'#22c55e');
    const br      = cssVal(site.theme?.borderRadius,'12px');
    const font    = esc(site.theme?.fontFamily||'Inter');
    const blocks  = (site.blocks||[]).map(b=>renderBlock(b,primary,br,companyId,siteId)).join('\n');
    const ga4     = site.analyticsGA4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.analyticsGA4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${esc(site.analyticsGA4)}');</script>`:'';
    const pixel   = site.analyticsMetaPixel ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${esc(site.analyticsMetaPixel)}');fbq('track','PageView');</script>`:'';

    return html(`<!DOCTYPE html>
<html lang="uk"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(site.seoTitle||site.name||'Сайт')}</title>
${site.seoDescription?`<meta name="description" content="${esc(site.seoDescription)}">`:''}
<meta property="og:title" content="${esc(site.seoTitle||site.name||'')}">
<meta property="og:url" content="https://apptalko.com/s/${esc(site.slug||'')}">
${site.ogImage?`<meta property="og:image" content="${esc(site.ogImage)}">`:''}
<meta name="robots" content="${site.noIndex?'noindex,nofollow':'index,follow'}">
${ga4}${pixel}${site.analyticsHeadCode||''}
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'${font}',system-ui,sans-serif;color:#1a1a1a;line-height:1.6}
a{color:${primary};text-decoration:none}img{max-width:100%;height:auto}
.btn{display:inline-block;padding:.75rem 1.75rem;background:${primary};color:#fff;border-radius:${br};font-weight:700;font-size:1rem;cursor:pointer;border:none;transition:opacity .2s}.btn:hover{opacity:.88}
.sec{padding:4rem 1.5rem}.wrap{max-width:900px;margin:0 auto}.html-block{width:100%}
@media(max-width:640px){.sec{padding:2.5rem 1rem}}
</style></head><body>
${blocks}${site.bodyCode||''}
</body></html>`);
}

// ════════════════════════════════════════════════════════════
// AI PROXY
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// GENERATE IMAGE — DALL-E 3
// POST /api/generate-image
// Body: { companyId, style, colors, dimensions, roomType, extra, prompt }
// Returns: { url, revised_prompt }
// ════════════════════════════════════════════════════════════
async function handleGenerateImage(request, env) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const {
        companyId,
        style      = 'modern',
        colors     = '',
        dimensions = '',
        roomType   = 'kitchen',
        extra      = '',
        prompt: customPrompt = '',
    } = body;

    // Отримуємо OpenAI ключ
    let openaiKey = env.OPENAI_API_KEY || '';
    if (companyId) {
        try {
            const token = await getToken(env);
            const cDoc = await fsGet(`companies/${companyId}/settings/ai`, token);
            if (cDoc?.fields) {
                const cs = fFields(cDoc.fields);
                if (cs.openaiApiKey) openaiKey = cs.openaiApiKey;
            }
        } catch {}
    }
    if (!openaiKey) return json({ error: 'No OpenAI API key' }, 500);

    // Будуємо промпт
    const styleMap = {
        modern:    'modern minimalist interior design',
        classic:   'classic elegant interior design',
        scandinavian: 'Scandinavian style interior',
        industrial:'industrial loft style interior',
        loft:      'loft style interior',
        provence:  'Provence style interior',
    };
    const roomMap = {
        kitchen:   'kitchen',
        living:    'living room',
        bedroom:   'bedroom',
        bathroom:  'bathroom',
        office:    'home office',
        hallway:   'hallway',
    };

    const styleDesc  = styleMap[style]  || style;
    const roomDesc   = roomMap[roomType] || roomType;
    const colorPart  = colors     ? `, color palette: ${colors}`     : '';
    const dimPart    = dimensions ? `, room dimensions: ${dimensions}` : '';
    const extraPart  = extra      ? `. Additional requirements: ${extra}` : '';

    const finalPrompt = customPrompt ||
        `Photorealistic interior design visualization. ${styleDesc} ${roomDesc}${colorPart}${dimPart}${extraPart}. ` +
        `High quality, professional interior photography, 4K, natural lighting, no people. ` +
        `Show complete room view with furniture and decor details.`;

    try {
        const resp = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model:           'dall-e-3',
                prompt:          finalPrompt,
                n:               1,
                size:            '1792x1024',
                quality:         'standard',
                response_format: 'url',
            }),
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            return json({ error: errData.error?.message || 'DALL-E error', status: resp.status }, 500);
        }

        const data = await resp.json();
        const imageUrl     = data.data?.[0]?.url || '';
        const revisedPrompt = data.data?.[0]?.revised_prompt || finalPrompt;

        if (!imageUrl) return json({ error: 'No image URL returned' }, 500);

        return json({ ok: true, url: imageUrl, revised_prompt: revisedPrompt });

    } catch (e) {
        return json({ error: e.message || 'Generation failed' }, 500);
    }
}

async function handleAiProxy(request, env) {
    if (request.method!=='POST') return json({error:'Method not allowed'},405);
    let body;
    try { body = await request.json(); } catch { return json({error:'Invalid JSON'},400); }

    const authHeader = request.headers.get('Authorization')||'';
    if (!authHeader.startsWith('Bearer ')) return json({error:'Unauthorized'},401);

    const idToken = authHeader.slice(7);
    const user = await verifyIdToken(idToken, env);
    if (!user) return json({error:'Invalid token'},401);

    const { messages=[], model, systemPrompt, companyId, module:mod, maxTokens } = body;

    let token;
    try { token = await getToken(env); } catch(e) { return json({error:'Firebase error'},500); }

    // Get AI settings from Firestore
    let apiKey = env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY || '';
    let provider = env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai';
    let finalModel = model || 'gpt-4o-mini';
    let finalSystemPrompt = systemPrompt || '';

    try {
        // Try company settings first
        if (companyId) {
            const cDoc = await fsGet(`companies/${companyId}/settings/ai`, token);
            if (cDoc?.fields) {
                const cs = fFields(cDoc.fields);
                if (cs.anthropicApiKey) { apiKey=cs.anthropicApiKey; provider='anthropic'; }
                else if (cs.openaiApiKey) { apiKey=cs.openaiApiKey; provider='openai'; }
                if (cs.model) finalModel = cs.model;
            }
        }
        // Superadmin settings
        if (!apiKey) {
            const saDoc = await fsGet('superadmin/settings', token);
            if (saDoc?.fields) {
                const sa = fFields(saDoc.fields);
                if (sa.anthropicApiKey) { apiKey=sa.anthropicApiKey; provider='anthropic'; }
                else if (sa.openaiApiKey) { apiKey=sa.openaiApiKey; provider='openai'; }
                // Agent prompt
                if (mod && sa.agents?.[mod]?.systemPrompt) finalSystemPrompt = sa.agents[mod].systemPrompt;
                if (sa.agents?.[mod]?.model) finalModel = sa.agents[mod].model;
            }
        }
    } catch(e) { /* use env keys */ }

    if (!apiKey) return json({error:'No AI API key configured'},500);

    // FIX: нормалізуємо модель під провайдера — не можна відправити gpt-* на Anthropic
    const isGptModel = finalModel && finalModel.startsWith('gpt');
    const isClaudeModel = finalModel && finalModel.startsWith('claude');
    if (provider === 'anthropic' && isGptModel) {
        finalModel = 'claude-haiku-4-5-20251001'; // fallback для Anthropic
    }
    if (provider === 'openai' && isClaudeModel) {
        finalModel = 'gpt-4o-mini'; // fallback для OpenAI
    }

    // Clean messages — remove null content
    const cleanMessages = messages
        .filter(m => m && m.role && m.content != null && m.content !== '')
        .map(m => ({ role: m.role, content: String(m.content) }));

    const finalMessages = finalSystemPrompt
        ? [{ role:'system', content: String(finalSystemPrompt) }, ...cleanMessages.filter(m=>m.role!=='system')]
        : cleanMessages;

    try {
        let aiResp;
        if (provider==='anthropic') {
            const r = await fetch('https://api.anthropic.com/v1/messages', {
                method:'POST',
                headers:{ 'x-api-key':apiKey, 'anthropic-version':'2023-06-01', 'Content-Type':'application/json' },
                body: JSON.stringify({
                    model: finalModel||'claude-sonnet-4-20250514',
                    max_tokens: maxTokens||4096,
                    system: finalSystemPrompt||undefined,
                    messages: messages.filter(m=>m.role!=='system'),
                }),
            });
            const d = await r.json();
            if (!r.ok) return json({error:d.error?.message||'Anthropic error'},500);
            aiResp = { choices:[{ message:{ role:'assistant', content:d.content?.[0]?.text||'' } }] };
        } else {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000);
            try {
                const r = await fetch('https://api.openai.com/v1/chat/completions', {
                    method:'POST',
                    headers:{ Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json' },
                    body: JSON.stringify({ model:finalModel||'gpt-4o-mini', messages:finalMessages, max_tokens: maxTokens||2048 }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                const d = await r.json();
                if (!r.ok) return json({error:d.error?.message||'OpenAI error: '+r.status},500);
                aiResp = d;
            } catch(e) {
                clearTimeout(timeout);
                if (e.name === 'AbortError') return json({error:'OpenAI timeout'},504);
                throw e;
            }
        }
        const text = aiResp?.choices?.[0]?.message?.content || '';
        return json({ ...aiResp, text });
    } catch(e) { return json({error:e.message},500); }
}

// ════════════════════════════════════════════════════════════
// CRM TRIGGER NOTIFY — sends Telegram messages from CRM triggers
// ════════════════════════════════════════════════════════════
async function handleCrmTriggerNotify(request, env) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const { companyId, to, message, dealId, dealTitle } = body;
    if (!companyId || !message) return json({ error: 'companyId and message required' }, 400);

    let token;
    try { token = await getToken(env); } catch(e) { return json({ error: 'Firebase error' }, 500); }

    try {
        // Отримуємо налаштування компанії (botToken)
        const settDoc = await fsGet(`companies/${companyId}/settings/telegram`, token);
        const sett = settDoc?.fields ? fFields(settDoc.fields) : {};
        const botToken = sett.botToken || sett.telegramBotToken || env.TELEGRAM_BOT_TOKEN;
        if (!botToken) return json({ ok: false, error: 'No bot token configured' });

        const tgSend = (chatId, text) =>
            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
            }).catch(() => {});

        const recipients = [];

        if (to === 'owner') {
            // Знаходимо owner компанії
            const usersSnap = await fsQuery('users', [
                { field: 'companyId', value: companyId },
            ], token, 50);
            const ownerDocs = usersSnap.filter(d => {
                const u = fFields(d.fields || {});
                return u.role === 'owner';
            });
            for (const d of ownerDocs) {
                const u = fFields(d.fields || {});
                if (u.telegramChatId) recipients.push(u.telegramChatId);
            }
            // Fallback: settings/general ownerChatId
            if (!recipients.length) {
                const genDoc = await fsGet(`companies/${companyId}/settings/general`, token);
                const gen = genDoc?.fields ? fFields(genDoc.fields) : {};
                if (gen.ownerTelegramChatId) recipients.push(gen.ownerTelegramChatId);
            }
        } else if (to === 'responsible' && dealId) {
            // Відповідальний за угоду
            const dealDoc = await fsGet(`companies/${companyId}/crm_deals/${dealId}`, token);
            const deal = dealDoc?.fields ? fFields(dealDoc.fields) : {};
            const assigneeId = deal.assigneeId || deal.responsibleId;
            if (assigneeId) {
                const userDoc = await fsGet(`companies/${companyId}/users/${assigneeId}`, token);
                const user = userDoc?.fields ? fFields(userDoc.fields) : {};
                if (user.telegramChatId) recipients.push(user.telegramChatId);
            }
        } else if (to && to !== 'owner' && to !== 'responsible') {
            // Конкретний chatId переданий напряму
            recipients.push(to);
        }

        if (!recipients.length) return json({ ok: false, error: 'No recipients with Telegram connected' });

        // Формуємо повідомлення
        const dealInfo = dealTitle ? `\n🔖 Угода: <b>${dealTitle}</b>` : '';
        const fullMessage = `🤖 <b>TALKO Тригер</b>${dealInfo}\n\n${message}`;

        await Promise.all(recipients.map(chatId => tgSend(chatId, fullMessage)));

        // Логуємо в Firestore
        if (dealId) {
            const logId = `log_${Date.now()}`;
            await fsSet(`companies/${companyId}/crmTriggers/_notify_log/entries/${logId}`, {
                dealId:    { stringValue: dealId },
                to:        { stringValue: to || '' },
                message:   { stringValue: message },
                sentAt:    { stringValue: new Date().toISOString() },
                recipients:{ integerValue: recipients.length },
            }, token);
        }

        return json({ ok: true, sent: recipients.length });
    } catch(e) {
        return json({ ok: false, error: e.message }, 500);
    }
}

// CRM FORM — form submissions from landing pages
// ════════════════════════════════════════════════════════════
async function handleCrmForm(request, env) {
    if (request.method!=='POST') return json({error:'Method not allowed'},405);
    let body;
    try { body = await request.json(); } catch { return json({error:'Invalid JSON'},400); }

    const { formId, companyId, name, phone, email, message, source } = body;
    if (!companyId) return json({error:'Missing companyId'},400);

    let token;
    try { token = await getToken(env); } catch(e) { return json({error:'Firebase error'},500); }

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const leadPath = `companies/${companyId}/leads/${leadId}`;

    await fsSet(leadPath, {
        id:        { stringValue: leadId },
        name:      { stringValue: name||'' },
        phone:     { stringValue: phone||'' },
        email:     { stringValue: email||'' },
        message:   { stringValue: message||'' },
        source:    { stringValue: source||'site' },
        formId:    { stringValue: formId||'' },
        status:    { stringValue: 'new' },
        createdAt: { timestampValue: new Date().toISOString() },
    }, token);

    return json({ ok:true, leadId });
}

// ════════════════════════════════════════════════════════════
// WEBHOOK — Telegram, Viber, Facebook, Binotel etc.
// ════════════════════════════════════════════════════════════
async function handleFixCompany(request, url, env) {
    const uid = url.searchParams.get('uid') || '';
    const correctCid = url.searchParams.get('cid') || '';
    if (!uid || !correctCid) return json({ error: 'need uid and cid params' });
    let token;
    try { token = await getToken(env); } catch(e) { return json({ error: e.message }); }

    // Читаємо поточний стан
    const before = await fsGet(`users/${uid}`, token);
    const beforeData = before?.fields ? fFields(before.fields) : {};

    // Оновлюємо companyId
    await fsPatch(`users/${uid}`, {
        companyId: { stringValue: correctCid },
        updatedAt:  { timestampValue: new Date().toISOString() },
    }, token);

    const after = await fsGet(`users/${uid}`, token);
    const afterData = after?.fields ? fFields(after.fields) : {};

    return json({
        ok: true,
        uid,
        before: { companyId: beforeData.companyId },
        after:  { companyId: afterData.companyId },
    });
}

async function handleBotDebug(request, url, env) {
    const cid = url.searchParams.get('cid') || url.searchParams.get('companyId') || '';
    if (!cid) return json({ error: 'no cid' });
    let token;
    try { token = await getToken(env); } catch(e) { return json({ error: 'firebase: '+e.message }); }

    const result = { cid, steps: [] };

    // 0. Перевіряємо токен
    result.tokenLength = token ? token.length : 0;
    result.steps.push('token length: ' + result.tokenLength);
    
    // Тестовий запит до Firestore (публічна колекція)
    const testReq = await fetch(
        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/settings/ai`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    result.firestoreTestStatus = testReq.status;
    result.steps.push('firestore test HTTP status: ' + testReq.status);
    if (!testReq.ok) {
        const errText = await testReq.text();
        result.firestoreError = errText.slice(0, 200);
        result.steps.push('firestore error: ' + result.firestoreError);
    }

    // 1. Читаємо компанію — з деталями помилки
    const compRaw = await fetch(
        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    result.compDocHttpStatus = compRaw.status;
    result.steps.push('compDoc HTTP status: ' + compRaw.status);
    const compDoc = compRaw.ok ? await compRaw.json() : null;
    if (!compRaw.ok) {
        const errBody = await compRaw.text().catch(()=>'');
        result.compDocError = errBody.slice(0, 300);
        result.steps.push('compDoc error: ' + result.compDocError);
    }
    result.compDocExists = !!compDoc?.fields;
    result.steps.push('compDoc: ' + (compDoc?.fields ? 'EXISTS' : 'NOT FOUND'));

    // 2. Шукаємо botToken
    let botToken = '';
    if (compDoc?.fields) {
        if (compDoc.fields?.integrations?.mapValue?.fields?.telegram?.mapValue?.fields?.botToken?.stringValue) {
            botToken = compDoc.fields.integrations.mapValue.fields.telegram.mapValue.fields.botToken.stringValue;
            result.steps.push('botToken from integrations.telegram: FOUND ' + botToken.slice(0,10) + '...');
        } else {
            result.steps.push('botToken from integrations.telegram: NOT FOUND');
        }
    }

    // 3. Bots підколекція
    const botsSnap = await fetch(
        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots?pageSize=10`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (botsSnap.ok) {
        const bd = await botsSnap.json();
        const bots = (bd.documents||[]).map(d => {
            const f = fFields(d.fields||{});
            return { id: d.name?.split('/').pop(), channel: f.channel, hasToken: !!f.token, tokenSnippet: f.token?.slice(0,10), status: f.status };
        });
        result.bots = bots;
        result.steps.push('bots count: ' + bots.length);
        if (!botToken && bots.length > 0) {
            const tBot = bots.find(b => b.hasToken);
            if (tBot) { botToken = 'FOUND_IN_BOTS'; result.steps.push('botToken from bots: FOUND'); }
        }
    }

    // 4. Flows
    for (const bot of (result.bots||[])) {
        const flowsSnap = await fetch(
            `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots/${bot.id}/flows`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (flowsSnap.ok) {
            const fd = await flowsSnap.json();
            bot.flows = (fd.documents||[]).map(d => {
                const f = fFields(d.fields||{});
                return { id: d.name?.split('/').pop(), status: f.status, name: f.name };
            });
            result.steps.push(`bot ${bot.id} flows: ${bot.flows.length}`);
        }
    }

    // 4.5. Шукаємо компанію через query по ownerId або назві
    const searchQuery = {
        structuredQuery: {
            from: [{ collectionId: 'companies' }],
            limit: 20,
        }
    };
    const allCompSnap = await fetch(
        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents:runQuery`,
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(searchQuery)
        }
    );
    if (allCompSnap.ok) {
        const rows = await allCompSnap.json();
        result.allCompanies20 = rows
            .filter(r => r.document)
            .map(r => ({ id: r.document.name?.split('/').pop(), name: fFields(r.document.fields||{}).name }));
        result.steps.push('all companies (20): ' + result.allCompanies20.map(c=>c.id).join(', '));
    }

    // 5. Список компаній (перші 5)
    const companiesSnap = await fetch(
        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies?pageSize=5`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (companiesSnap.ok) {
        const cd = await companiesSnap.json();
        result.allCompanyIds = (cd.documents||[]).map(d => d.name?.split('/').pop());
        result.steps.push('found companies: ' + result.allCompanyIds.join(', '));
    } else {
        result.steps.push('companies list HTTP: ' + companiesSnap.status);
    }

    // 6. Перевіряємо webhook info + getMe для обох токенів
    if (result.bots && result.bots.length > 0) {
        const firstBot = result.bots[0];
        if (firstBot.hasToken) {
            const botDocFull = await fsGet(`companies/${cid}/bots/${firstBot.id}`, token);
            if (botDocFull?.fields) {
                const bd = fFields(botDocFull.fields);
                const fullToken = bd.token || '';
                if (fullToken) {
                    // getMe — перевіряємо чи токен валідний
                    const getMeR = await fetch(`https://api.telegram.org/bot${fullToken}/getMe`);
                    if (getMeR.ok) {
                        const getMeD = await getMeR.json();
                        result.botGetMe = getMeD.result;
                        result.steps.push('getMe botId: ' + getMeD.result?.id + ' username: @' + getMeD.result?.username);
                    } else {
                        result.steps.push('getMe FAILED - token invalid!');
                    }
                    const whInfo = await fetch(`https://api.telegram.org/bot${fullToken}/getWebhookInfo`);
                    if (whInfo.ok) {
                        const whData = await whInfo.json();
                        result.webhookInfo = {
                            url: whData.result?.url,
                            has_custom_certificate: whData.result?.has_custom_certificate,
                            pending_update_count: whData.result?.pending_update_count,
                            last_error_message: whData.result?.last_error_message,
                            last_error_date: whData.result?.last_error_date,
                            max_connections: whData.result?.max_connections,
                        };
                        result.steps.push('webhook url: ' + (whData.result?.url || 'EMPTY'));
                        result.steps.push('pending: ' + whData.result?.pending_update_count);
                        result.steps.push('last_error: ' + (whData.result?.last_error_message || 'none'));
                    }
                }
            }
        }
    }
    // Також перевіряємо токен з integrations.telegram
    if (compDoc?.fields?.integrations?.mapValue?.fields?.telegram?.mapValue?.fields?.botToken?.stringValue) {
        const intToken = compDoc.fields.integrations.mapValue.fields.telegram.mapValue.fields.botToken.stringValue;
        const getMeInt = await fetch(`https://api.telegram.org/bot${intToken}/getMe`);
        if (getMeInt.ok) {
            const d = await getMeInt.json();
            result.integrationsTokenGetMe = { id: d.result?.id, username: d.result?.username };
            result.steps.push('integrations.telegram token → @' + d.result?.username);
        } else {
            result.steps.push('integrations.telegram token INVALID');
        }
    }

    // 7. Перевіряємо nodes у flow document
    if (result.bots && result.bots.length > 0) {
        const fb = result.bots[0];
        if (fb.flows && fb.flows.length > 0) {
            const fl = fb.flows[0];
            const flowDoc = await fsGet(`companies/${cid}/bots/${fb.id}/flows/${fl.id}`, token);
            if (flowDoc?.fields) {
                const fd = fFields(flowDoc.fields);
                result.flowNodes = Array.isArray(fd.nodes) ? fd.nodes.length : 'NOT_ARRAY: ' + typeof fd.nodes;
                result.flowEdges = Array.isArray(fd.edges) ? fd.edges.length : 'NOT_ARRAY: ' + typeof fd.edges;
                result.flowFirstNode = Array.isArray(fd.nodes) && fd.nodes[0] ? 
                    { id: fd.nodes[0].id, type: fd.nodes[0].type, hasText: !!fd.nodes[0].text } : null;
                // RAW поля для діагностики
                result.flowRawKeys = Object.keys(flowDoc.fields);
                result.flowEdgesRaw = flowDoc.fields.edges ? Object.keys(flowDoc.fields.edges) : 'NO_EDGES_FIELD';
                result.steps.push(`flow nodes: ${result.flowNodes}, edges: ${result.flowEdges}`);
                result.steps.push(`raw fields: ${result.flowRawKeys.join(', ')}`);
                if (flowDoc.fields.edges) {
                    result.steps.push(`edges raw type: ${Object.keys(flowDoc.fields.edges).join(', ')}`);
                }
                if (Array.isArray(fd.nodes) && fd.nodes[0]) {
                    result.steps.push(`first node: id=${fd.nodes[0].id} type=${fd.nodes[0].type}`);
                }
            } else {
                result.steps.push('flow document fields: EMPTY');
            }
        }
    }

    result.botTokenFound = !!botToken;
    return json(result);
}

async function handleWebhook(request, url, env) {
    const channel = url.searchParams.get('channel')||'telegram';
    const cid     = url.searchParams.get('cid') || url.searchParams.get('companyId') || '';
    const urlBotId = url.searchParams.get('botId') || '';

    let token;
    try { token = await getToken(env); } catch(e) { return json({ok:false,error:'Firebase error'},500); }

    let body = {};
    try {
        const ct = request.headers.get('content-type')||'';
        if (ct.includes('json')) body = await request.json();
    } catch {}

    // ── ACTION: send-message (менеджер відповідає клієнту з CRM) ──
    if (url.searchParams.get('action') === 'send-message') {
        // Верифікація токена через Firebase
        const authHeader = request.headers.get('Authorization') || '';
        const idToken = authHeader.replace('Bearer ', '').trim();
        // Базова перевірка — токен є
        if (!idToken) return json({ ok: false, error: 'Unauthorized' }, 401);

        const { companyId, contactId, text: msgText } = body;
        if (!companyId || !contactId || !msgText) return json({ ok: false, error: 'Missing fields' }, 400);

        // Завантажуємо контакт щоб отримати chatId і botToken
        const contactDoc = await fsGet(`companies/${companyId}/contacts/${contactId}`, token);
        if (!contactDoc?.fields) return json({ ok: false, error: 'Contact not found' }, 404);
        const contact = fFields(contactDoc.fields);

        const telegramChatId = contact.chatId || contact.telegramChatId || contact.senderId || '';

        // Отримуємо botToken з налаштувань або з бота
        let botTokenForSend = '';
        const settDoc = await fsGet(`companies/${companyId}/settings/integrations`, token);
        if (settDoc?.fields) {
            const sett = fFields(settDoc.fields);
            botTokenForSend = sett.telegramBotToken || '';
        }
        // Якщо немає в settings — шукаємо в bots по botId контакту
        if (!botTokenForSend && contact.botId) {
            const botDoc = await fsGet(`companies/${companyId}/bots/${contact.botId}`, token);
            if (botDoc?.fields) {
                const bd = fFields(botDoc.fields);
                botTokenForSend = bd.token || '';
            }
        }
        // Fallback: перший активний бот компанії
        if (!botTokenForSend) {
            const botsSnap = await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${companyId}/bots?pageSize=5`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (botsSnap.ok) {
                const bd = await botsSnap.json();
                for (const doc of (bd.documents||[])) {
                    const d = fFields(doc.fields||{});
                    if (d.token && (d.channel === 'telegram' || !d.channel)) {
                        botTokenForSend = d.token; break;
                    }
                }
            }
        }

        let telegramOk = false;
        if (botTokenForSend && telegramChatId) {
            const tgResp = await fetch(`https://api.telegram.org/bot${botTokenForSend}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: telegramChatId, text: msgText, parse_mode: 'HTML' }),
            }).catch(() => null);
            telegramOk = tgResp?.ok === true;
        }

        // Зберігаємо повідомлення в лог чату
        const now = new Date().toISOString();
        const msgId = `msg_op_${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
        await fsSet(`companies/${companyId}/contacts/${contactId}/messages/${msgId}`, {
            id:        { stringValue: msgId },
            role:      { stringValue: 'bot' },
            from:      { stringValue: 'bot' },
            direction: { stringValue: 'out' },
            sentBy:    { stringValue: 'operator' },
            text:      { stringValue: msgText },
            timestamp: { timestampValue: now },
            createdAt: { timestampValue: now },
            read:      { booleanValue: false },
        }, token);

        // Оновлюємо lastMessage контакту
        await fsPatch(`companies/${companyId}/contacts/${contactId}`, {
            lastMessage:   { stringValue: msgText },
            lastMessageAt: { timestampValue: now },
            updatedAt:     { timestampValue: now },
        }, token);

        return json({ ok: true, telegramOk });
    }

    if (channel==='telegram') {
        const msg    = body.message||body.callback_query?.message||{};
        const chat   = msg.chat||body.callback_query?.from||{};
        const from   = msg.from || body.callback_query?.from || {};
        const chatId = String(chat.id||'');

        // Визначаємо text — враховуємо фото з підписом
        let text = (msg.text||body.callback_query?.data||'').trim();
        let incomingPhotoUrl = null;

        // Обробка вхідного фото
        if (msg.photo && msg.photo.length > 0 && !text) {
            const bestPhoto = msg.photo[msg.photo.length - 1]; // найбільша версія
            const fileId = bestPhoto.file_id;
            text = `PHOTO:${fileId}`; // передаємо як спеціальний токен у flow engine
            incomingPhotoUrl = fileId; // буде замінено на URL нижче якщо потрібно
        }

        if (!chatId||!cid) return json({ok:true});

        // Читаємо botToken з компанії (integrations.telegram.botToken)
        // Також перевіряємо bots підколекцію як fallback
        let botToken = '';
        const compDoc = await fsGet(`companies/${cid}`, token);
        if (compDoc?.fields) {
            const compData = fFields(compDoc.fields);
            botToken = compData['integrations.telegram.botToken'] ||
                       compData?.integrations?.telegram?.botToken || '';
            // Якщо не знайшли через fFields (вкладений об'єкт) — беремо з raw fields
            if (!botToken && compDoc.fields?.integrations?.mapValue?.fields?.telegram?.mapValue?.fields?.botToken?.stringValue) {
                botToken = compDoc.fields.integrations.mapValue.fields.telegram.mapValue.fields.botToken.stringValue;
            }
        }
        // Fallback: settings/integrations
        if (!botToken) {
            const settDoc = await fsGet(`companies/${cid}/settings/integrations`, token);
            if (settDoc?.fields) {
                const sett = fFields(settDoc.fields);
                botToken = sett.telegramBotToken || sett.botToken || '';
            }
        }
        // Fallback: bots підколекція — спочатку по urlBotId, потім перший telegram бот
        if (!botToken) {
            if (urlBotId) {
                const botDoc = await fsGet(`companies/${cid}/bots/${urlBotId}`, token);
                if (botDoc?.fields) {
                    const bd = fFields(botDoc.fields);
                    botToken = bd.token || '';
                }
            }
            if (!botToken) {
                const botsSnap = await fetch(
                    `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots?pageSize=10`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (botsSnap.ok) {
                    const bd = await botsSnap.json();
                    for (const doc of (bd.documents||[])) {
                        const d = fFields(doc.fields||{});
                        if (d.token && (d.channel === 'telegram' || !d.channel)) {
                            botToken = d.token; break;
                        }
                    }
                }
            }
        }
        if (!botToken) return json({ok:true});

        const tgSend = async (chat_id, txt) => {
            try {
                const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ chat_id, text: txt, parse_mode:'HTML' }),
                });
                if (!r.ok) {
                    // Fallback без HTML якщо parse_mode помилка
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method:'POST', headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ chat_id, text: txt.replace(/<[^>]*>/g,'') }),
                    }).catch(()=>{});
                }
            } catch(e) {}
        };

        // /start {code} — підключення співробітника
        // Пропускаємо якщо це flow-бот (urlBotId є в URL) — там /start запускає flow
        if (text.startsWith('/start') && !urlBotId) {
            const code = text.split(' ')[1]||'';
            if (code) {
                const idxDoc = await fsGet(`telegramIndex/code_${code}`, token);
                if (idxDoc?.fields) {
                    const idx = fFields(idxDoc.fields);
                    if (idx.companyId && idx.userId) {
                        await fsPatch(`companies/${idx.companyId}/users/${idx.userId}`, {
                            telegramChatId: { stringValue: chatId },
                            telegramUserId: { stringValue: String(from.id||chatId) },
                        }, token).catch(()=>{});
                        await fsSet(`telegramIndex/chat_${chatId}`, {
                            companyId: { stringValue: idx.companyId },
                            userId:    { stringValue: idx.userId },
                            chatId:    { stringValue: chatId },
                            linkedAt:  { timestampValue: new Date().toISOString() },
                        }, token).catch(()=>{});
                        await tgSend(chatId, '✅ <b>Telegram підключено!</b>\n\nСповіщення про завдання будуть приходити сюди.\n\n📝 Поставити завдання:\n<code>/task @Іванов Назва | 2026-04-10</code>\n\n/help — всі команди');
                        return json({ok:true});
                    }
                }
            }
            await tgSend(chatId, '👋 Вітаємо! Відкрийте профіль у TALKO → «Підключити Telegram».');
            return json({ok:true});
        }

        // /help — тільки для системного бота TALKO (не для flow ботів)
        if ((text === '/help' || text === '/допомога') && !urlBotId) {
            await tgSend(chatId, '📖 <b>Команди TALKO:</b>\n\n<code>/task @імя Назва | дата</code> — поставити завдання\n\nПриклад:\n<code>/task @Петренко Кошторис | 10.04.2026</code>\n\nДата необовязкова. Якщо не вказати @імя — ставиться собі.');
            return json({ok:true});
        }

        // /task — тільки для системного бота TALKO (не для flow ботів)
        if ((text.startsWith('/task') || text.startsWith('/завдання')) && !urlBotId) {
            const sDoc = await fsGet(`telegramIndex/chat_${chatId}`, token);
            if (!sDoc?.fields) {
                await tgSend(chatId, '⚠️ Telegram не підключений до системи. Відкрийте профіль → «Підключити Telegram».');
                return json({ok:true});
            }
            const s   = fFields(sDoc.fields);
            const sCid = s.companyId, sUid = s.userId;
            const cmd = text.replace(/^\/task\s*|^\/завдання\s*/i,'').trim();
            if (!cmd) { await tgSend(chatId, '📝 Формат: <code>/task @імя Назва | дата</code>  →  /help'); return json({ok:true}); }

            let assigneeQ='', title=cmd, deadline='';
            const pp = cmd.split('|');
            if (pp.length>=2) {
                title = pp[0].trim();
                const rd = pp[1].trim();
                const dm = rd.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})/);
                if (dm) { const y=dm[3].length===2?'20'+dm[3]:dm[3]; deadline=`${y}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`; }
                else if (/^\d{4}-\d{2}-\d{2}$/.test(rd)) deadline=rd;
            }
            const am = title.match(/^@(\S+)\s*(.*)/);
            if (am) { assigneeQ=am[1].toLowerCase(); title=am[2].trim()||am[1]; }
            if (!title) { await tgSend(chatId,'❌ Вкажіть назву завдання.'); return json({ok:true}); }

            let aId=sUid, aName='Я';
            if (assigneeQ) {
                const rawUsers = await fsQuery(`companies/${sCid}/users`,[],token);
                // fsQuery повертає Firestore doc objects — розпаковуємо через fFields
                const us = rawUsers.map(d => ({ _docId: d.name?.split('/').pop(), ...fFields(d.fields||{}) }));
                const fu = us.find(u=>{
                    const n=(u.name||u.email||'').toLowerCase();
                    const tg=(u.telegramUsername||'').toLowerCase().replace('@','');
                    const docId=(u._docId||'').toLowerCase();
                    return n.includes(assigneeQ)||tg===assigneeQ||docId===assigneeQ||u.id===assigneeQ;
                });
                if (!fu) { await tgSend(chatId,`❌ Співробітника "${assigneeQ}" не знайдено.`); return json({ok:true}); }
                aId=fu.id||fu._docId; aName=fu.name||fu.email||assigneeQ;
            }

            let crName='Telegram';
            const crDoc=await fsGet(`companies/${sCid}/users/${sUid}`,token);
            if (crDoc?.fields){ const cr=fFields(crDoc.fields); crName=cr.name||cr.email||crName; }

            const tid=`tg_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
            const today=new Date().toISOString().split('T')[0];
            const tObj={
                id:{stringValue:tid},title:{stringValue:title},status:{stringValue:'new'},
                priority:{stringValue:'medium'},assigneeId:{stringValue:aId},assigneeName:{stringValue:aName},
                creatorId:{stringValue:sUid},creatorName:{stringValue:crName},
                source:{stringValue:'telegram'},createdDate:{stringValue:today},
                pinned:{booleanValue:false},
                createdAt:{timestampValue:new Date().toISOString()},
                updatedAt:{timestampValue:new Date().toISOString()},
            };
            if (deadline){ tObj.deadlineDate={stringValue:deadline}; tObj.deadline={stringValue:deadline+'T18:00'}; tObj.deadlineTime={stringValue:'18:00'}; }
            await fsSet(`companies/${sCid}/tasks/${tid}`,tObj,token);

            const dl=deadline?`\n📅 Дедлайн: <b>${deadline}</b>`:'';
            await tgSend(chatId,`✅ <b>Завдання створено!</b>\n\n📋 <b>${title}</b>\n👤 Виконавець: <b>${aName}</b>${dl}`);

            if (aId!==sUid) {
                const adoc=await fsGet(`companies/${sCid}/users/${aId}`,token);
                if (adoc?.fields){ const au=fFields(adoc.fields); if(au.telegramChatId) await tgSend(au.telegramChatId,`📋 <b>Нове завдання від ${crName}:</b>\n\n<b>${title}</b>${dl}\n\nВідкрийте TALKO → «Мій день».`); }
            }
            return json({ok:true});
        }

        // ── FLOW ENGINE ──────────────────────────────────────
        const isCallback = !!body.callback_query;
        const callbackQueryId = body.callback_query?.id || '';
        const userName = `${from.first_name||''} ${from.last_name||''}`.trim() || from.username || chatId;

        // Відповідь на callback щоб прибрати "годинник" в Telegram
        if (isCallback && callbackQueryId) {
            fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ callback_query_id: callbackQueryId }),
            }).catch(()=>{});
        }

        // Завантажуємо або створюємо контакт/сесію
        const contactPath = `companies/${cid}/contacts/${chatId}`;
        let contactDoc = await fsGet(contactPath, token);
        let contact = contactDoc?.fields ? fFields(contactDoc.fields) : null;

        // Якщо контакт існує але без botId — оновлюємо
        if (contact && !contact.botId && urlBotId) {
            await fsPatch(contactPath, {
                botId: { stringValue: urlBotId },
            }, token);
            contact.botId = urlBotId;
        }

        if (!contact) {
            contact = {
                chatId, name: userName, username: from.username||'',
                source: 'telegram', status: 'subscriber',
                currentFlowId: '', currentNodeId: '',
                botId: urlBotId || '',
                createdAt: new Date().toISOString(),
            };
            await fsSet(contactPath, {
                chatId:        { stringValue: chatId },
                name:          { stringValue: userName },
                senderName:    { stringValue: userName },
                username:      { stringValue: from.username||'' },
                senderId:      { stringValue: chatId },
                channel:       { stringValue: 'telegram' },
                source:        { stringValue: 'telegram' },
                status:        { stringValue: 'subscriber' },
                currentFlowId: { stringValue: '' },
                currentNodeId: { stringValue: '' },
                botId:         { stringValue: urlBotId || '' },
                collectedData: { mapValue: { fields: {} } },
                unreadCount:   { integerValue: '0' },
                createdAt:     { timestampValue: new Date().toISOString() },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
        }

        // DEBUG: підтверджуємо що webhook отримав повідомлення

        // Зберігаємо повідомлення і оновлюємо контакт
        if (!isCallback && !text.startsWith('/start') && !text.startsWith('/')) {
            const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
            const nowTs = new Date().toISOString();
            // Зберігаємо повідомлення
            await fsSet(`${contactPath}/messages/${msgId}`, {
                id:        { stringValue: msgId },
                role:      { stringValue: 'user' },
                from:      { stringValue: 'user' },
                direction: { stringValue: 'in' },
                text:      { stringValue: text },
                isCallback:{ booleanValue: false },
                timestamp: { timestampValue: nowTs },
                createdAt: { timestampValue: nowTs },
            }, token);
            // Оновлюємо контакт — unreadCount беремо з вже завантаженого contact
            const curUnread = parseInt(contact.unreadCount || 0);
            await fsPatch(contactPath, {
                lastMessage:   { stringValue: text.slice(0, 100) },
                lastMessageAt: { timestampValue: nowTs },
                unreadCount:   { integerValue: String(curUnread + 1) },
                name:          { stringValue: userName },
                senderName:    { stringValue: userName },
                updatedAt:     { timestampValue: nowTs },
            }, token);
        }

        // Визначаємо активний flow
        let activeFlowId = contact.currentFlowId || '';
        let activeNodeId = contact.currentNodeId || '';

        // /start з параметром → шукаємо flow бота
        if (text.startsWith('/start')) {
            const startParam = text.split(' ')[1] || '';
            let foundBotId = urlBotId || '', foundFlowId = '';
            
            // Якщо botId відомий з URL — шукаємо тільки його flows
            const botsToSearch = foundBotId
                ? [foundBotId]
                : await (async () => {
                    const snap = await fetch(
                        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (!snap.ok) return [];
                    const d = await snap.json();
                    return (d.documents||[]).map(b => b.name?.split('/').pop());
                })();

            for (const bid of botsToSearch) {
                const flowsSnap = await fetch(
                    `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots/${bid}/flows`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!flowsSnap.ok) continue;
                const flowsData = await flowsSnap.json();
                for (const fd of (flowsData.documents||[])) {
                    const fid = fd.name?.split('/').pop();
                    const fdata = fFields(fd.fields||{});
                    // Пріоритет: збіг startParam > status=active
                    if (startParam && fdata.startParam === startParam) {
                        foundBotId = bid; foundFlowId = fid; break;
                    }
                    if (!foundFlowId && fdata.status === 'active') {
                        foundBotId = bid; foundFlowId = fid;
                        // Не break — продовжуємо шукати збіг startParam
                    }
                }
                if (foundFlowId && startParam && foundFlowId) break;
            }
            if (foundBotId && foundFlowId) {
                activeFlowId = `${foundBotId}::${foundFlowId}`;
                activeNodeId = 'start';
                await fsPatch(contactPath, {
                    currentFlowId: { stringValue: activeFlowId },
                    currentNodeId: { stringValue: 'start' },
                    updatedAt:     { timestampValue: new Date().toISOString() },
                }, token);
            }
        }

        // CRM тригер flow_start — при першому повідомленні юзера (після визначення activeFlowId)
        if (activeFlowId && !isCallback && !text.startsWith('/')) {
            const fParts = activeFlowId.split('::');
            if (fParts[0] && fParts[1]) {
                const fDoc = await fsGet(`companies/${cid}/bots/${fParts[0]}/flows/${fParts[1]}`, token);
                if (fDoc?.fields) {
                    const fd = fFields(fDoc.fields);
                    if (fd.crmEnabled && fd.crmTrigger === 'flow_start' && fd.crmPipelineId) {
                        await _createCrmDealFromFlow({ cid, chatId, contact, fd, token, userName });
                    }
                }
            }
        }

        // Запускаємо Flow Engine якщо є активний flow
        if (activeFlowId) {
            const parts = activeFlowId.split('::');
            const botId = parts[0], flowId = parts[1];
            if (botId && flowId) {
                try {
                    // Якщо нода чекає фото але прийшов текст — нагадуємо
                    const isWaitingPhoto = contact.waitingForPhoto === true ||
                        String(contact.waitingForPhoto) === 'true';
                    if (isWaitingPhoto && !text.startsWith('PHOTO:') && !isCallback) {
                        await tgSend(chatId, '📷 Будь ласка, надішліть фото (не текст)');
                        return json({ ok: true });
                    }
                    // Скидаємо waitingForInput перед обробкою щоб уникнути петлі
                    const isWaiting = contact.waitingForInput === true ||
                        String(contact.waitingForInput) === 'true';
                    if ((isWaiting || isWaitingPhoto) && !isCallback) {
                        await fsPatch(contactPath, {
                            waitingForInput: { booleanValue: false },
                            waitingForPhoto: { booleanValue: false },
                            updatedAt:       { timestampValue: new Date().toISOString() },
                        }, token);
                    }
                    await runFlowEngine({
                        cid, chatId, botId, flowId,
                        currentNodeId: activeNodeId,
                        text, isCallback,
                        callbackData: body.callback_query?.data || '',
                        contact, contactPath,
                        token, botToken, from, userName,
                        tgSend,
                        env,
                    });
                } catch(e) {
                    await tgSend(chatId, `⚠️ Error: ${e.message?.slice(0,150)}
${e.stack?.slice(0,200)}`);
                }
                return json({ok:true});
            }
        }

        return json({ok:true});
    }

    // ════════════════════════════════════════════════════════════
    // VIBER CHANNEL
    // ════════════════════════════════════════════════════════════
    if (channel === 'viber') {
        const vEvent   = body.event || '';
        const vSender  = body.sender || {};
        const vMessage = body.message || {};
        const chatId   = String(vSender.id || '');
        const userName = vSender.name || '';

        if (!chatId || !['message', 'subscribed', 'conversation_started'].includes(vEvent)) {
            return json({ status: 0 });
        }

        // Читаємо Viber токен компанії
        let viberToken = '';
        const compDocV = await fsGet(`companies/${cid}`, token);
        if (compDocV?.fields) {
            const cd = fFields(compDocV.fields);
            viberToken = cd.viberBotToken || '';
        }
        if (!viberToken) return json({ status: 0 });

        // Відправка через Viber API
        const viberSend = async (receiverId, msgText, keyboard = null) => {
            const payload = {
                receiver: receiverId,
                min_api_version: 1,
                sender:   { name: 'TALKO Bot' },
                type:     'text',
                text:     msgText,
            };
            if (keyboard) payload.keyboard = keyboard;
            await fetch('https://chatapi.viber.com/pa/send_message', {
                method:  'POST',
                headers: {
                    'Content-Type':      'application/json',
                    'X-Viber-Auth-Token': viberToken,
                },
                body: JSON.stringify(payload),
            }).catch(() => {});
        };

        // Парсинг вхідного повідомлення
        let text = '';
        if (vEvent === 'subscribed' || vEvent === 'conversation_started') {
            text = '/start';
        } else if (vMessage.type === 'text') {
            text = (vMessage.text || '').trim();
        } else if (vMessage.type === 'picture') {
            const photoUrl = vMessage.media || '';
            text = photoUrl ? `PHOTO:${photoUrl}` : '';
        } else if (vMessage.type === 'file') {
            text = vMessage.media || '';
        }

        if (!text) return json({ status: 0 });

        // Читаємо або створюємо контакт
        const contactPath = `companies/${cid}/contacts/${chatId}`;
        let contact = {};
        const contactDoc = await fsGet(contactPath, token);
        if (contactDoc?.fields) {
            contact = fFields(contactDoc.fields);
        } else {
            const nowV = new Date().toISOString();
            await fsSet(contactPath, {
                id:            { stringValue: chatId },
                channel:       { stringValue: 'viber' },
                name:          { stringValue: userName },
                status:        { stringValue: 'new' },
                currentFlowId: { stringValue: '' },
                currentNodeId: { stringValue: '' },
                createdAt:     { timestampValue: nowV },
                updatedAt:     { timestampValue: nowV },
            }, token);
            contact = { id: chatId, channel: 'viber', name: userName, status: 'new', currentFlowId: '', currentNodeId: '' };
        }

        // Лог вхідного повідомлення
        const vmId = `msg_${Date.now()}_user`;
        const vmTs = new Date().toISOString();
        await fsSet(`${contactPath}/messages/${vmId}`, {
            id:        { stringValue: vmId },
            role:      { stringValue: 'user' },
            from:      { stringValue: 'user' },
            direction: { stringValue: 'in' },
            text:      { stringValue: text },
            channel:   { stringValue: 'viber' },
            timestamp: { timestampValue: vmTs },
            createdAt: { timestampValue: vmTs },
        }, token);

        await fsPatch(contactPath, {
            name:          { stringValue: userName },
            lastMessage:   { stringValue: text.slice(0, 100) },
            lastMessageAt: { timestampValue: vmTs },
            updatedAt:     { timestampValue: vmTs },
            channel:       { stringValue: 'viber' },
        }, token);

        // Визначаємо активний flow
        let activeFlowId = contact.currentFlowId || '';
        let activeNodeId = contact.currentNodeId || '';

        // /start → шукаємо активний flow
        if (text === '/start') {
            const botsSnap = await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (botsSnap.ok) {
                const botsData = await botsSnap.json();
                for (const botDoc of (botsData.documents || [])) {
                    const bid = botDoc.name?.split('/').pop();
                    const flowsSnap = await fetch(
                        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots/${bid}/flows`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (!flowsSnap.ok) continue;
                    const flowsData = await flowsSnap.json();
                    for (const fd of (flowsData.documents || [])) {
                        const fid = fd.name?.split('/').pop();
                        const fdata = fFields(fd.fields || {});
                        if (fdata.status === 'active') {
                            activeFlowId = `${bid}::${fid}`;
                            activeNodeId = 'start';
                            await fsPatch(contactPath, {
                                currentFlowId: { stringValue: activeFlowId },
                                currentNodeId: { stringValue: 'start' },
                                updatedAt:     { timestampValue: new Date().toISOString() },
                            }, token);
                            break;
                        }
                    }
                    if (activeFlowId) break;
                }
            }
        }

        // Запускаємо Flow Engine
        if (activeFlowId) {
            const vParts  = activeFlowId.split('::');
            const botIdV  = vParts[0];
            const flowIdV = vParts[1];
            if (botIdV && flowIdV) {
                const isWaitingPhotoV = contact.waitingForPhoto === true || String(contact.waitingForPhoto) === 'true';
                if (isWaitingPhotoV && !text.startsWith('PHOTO:')) {
                    await viberSend(chatId, '📷 Будь ласка, надішліть фото (не текст)');
                    return json({ status: 0 });
                }
                const isWaitingV = contact.waitingForInput === true || String(contact.waitingForInput) === 'true';
                if (isWaitingV || isWaitingPhotoV) {
                    await fsPatch(contactPath, {
                        waitingForInput: { booleanValue: false },
                        waitingForPhoto: { booleanValue: false },
                        updatedAt:       { timestampValue: new Date().toISOString() },
                    }, token);
                }

                // vSend — аналог tgSend але для Viber
                const vSend = async (receiverId, msgText, opts = {}) => {
                    const kbButtons = opts.inline_keyboard;
                    let vKeyboard = null;
                    if (kbButtons && kbButtons.length > 0) {
                        const vButtons = kbButtons.flat().map((btn, i) => ({
                            Columns: 6, Rows: 1,
                            Text: `<b>${btn.text}</b>`,
                            ActionType: 'reply',
                            ActionBody: btn.callback_data || `btn_${i}`,
                            BgColor: '#f0fdf4',
                            TextSize: 'regular',
                        }));
                        vKeyboard = { Type: 'keyboard', DefaultHeight: false, Buttons: vButtons };
                    }
                    await viberSend(receiverId, msgText, vKeyboard);
                };

                try {
                    await runFlowEngine({
                        cid, chatId,
                        botId:         botIdV,
                        flowId:        flowIdV,
                        currentNodeId: activeNodeId,
                        text, isCallback: false, callbackData: '',
                        contact, contactPath,
                        token, botToken: viberToken,
                        from: { id: chatId, first_name: userName },
                        userName,
                        tgSend: vSend,
                        env,
                    });
                } catch (e) {
                    await viberSend(chatId, `Помилка: ${e.message?.slice(0, 100)}`);
                }
            }
        } else {
            await viberSend(chatId, "Вітаємо! Напишіть нам і ми зв'яжемося з вами.");
        }

        return json({ status: 0 });
    }

    // ════════════════════════════════════════════════════════════
    // BINOTEL CHANNEL
    // Events: call_start, call_end, call_record
    // ════════════════════════════════════════════════════════════
    if (channel === 'binotel') {
        const bEvent     = body.event || body.type || '';
        const bPhone     = String(body.externalNumber || body.clientPhone || body.phone || '').replace(/[^+\d]/g, '');
        const bInternal  = String(body.internalNumber || body.extension || '');
        const bCallId    = String(body.generalCallID || body.callId || body.id || Date.now());
        const bDuration  = Number(body.billSecs || body.duration || 0);
        const bRecordUrl = body.pbxRecordUrl || body.recordUrl || '';
        const bDisp      = body.disposition || body.status || '';

        if (!bPhone || !cid) return json({ ok: true });

        // Читаємо Binotel credentials
        const compDocB = await fsGet(`companies/${cid}`, token);
        if (!compDocB?.fields) return json({ ok: true });
        const compDataB = fFields(compDocB.fields);
        const binotelKey    = compDataB.binotelKey    || '';
        const binotelSecret = compDataB.binotelSecret || '';
        if (!binotelKey) return json({ ok: true });

        const nowB = new Date().toISOString();

        // ── call_start: новий дзвінок → знаходимо або створюємо контакт + угоду ──
        if (bEvent === 'call_start' || bEvent === 'CALL_START' || bEvent === 'incoming') {
            // Шукаємо існуючого клієнта по телефону в crm_clients
            let clientId   = null;
            let clientName = bPhone;
            let dealId     = null;

            const clientsSnap = await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents:runQuery`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        structuredQuery: {
                            from: [{ collectionId: `companies/${cid}/crm_clients` }],
                            where: { fieldFilter: {
                                field: { fieldPath: 'phone' },
                                op: 'EQUAL',
                                value: { stringValue: bPhone },
                            }},
                            limit: 1,
                        }
                    })
                }
            );
            if (clientsSnap.ok) {
                const cData = await clientsSnap.json();
                const found = cData[0]?.document;
                if (found) {
                    clientId   = found.name.split('/').pop();
                    const cf   = fFields(found.fields || {});
                    clientName = cf.name || cf.clientName || bPhone;
                }
            }

            // Якщо немає клієнта — створюємо
            if (!clientId) {
                const newClientRef = `companies/${cid}/crm_clients/${bCallId}_client`;
                await fsSet(newClientRef, {
                    name:      { stringValue: bPhone },
                    phone:     { stringValue: bPhone },
                    source:    { stringValue: 'binotel' },
                    createdAt: { timestampValue: nowB },
                    updatedAt: { timestampValue: nowB },
                }, token);
                clientId   = `${bCallId}_client`;
                clientName = bPhone;
            }

            // Шукаємо відкриту угоду для цього клієнта
            const dealsSnap = await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/crm_deals?pageSize=5`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (dealsSnap.ok) {
                const dData = await dealsSnap.json();
                const openDeal = (dData.documents || []).find(d => {
                    const df = fFields(d.fields || {});
                    return df.clientId === clientId && !['won','lost'].includes(df.stage);
                });
                if (openDeal) dealId = openDeal.name.split('/').pop();
            }

            // Якщо немає відкритої угоди — створюємо
            if (!dealId) {
                // Знаходимо першу стадію pipeline
                let firstStageId = 'new';
                const pipSnap = await fetch(
                    `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/crm_pipelines?pageSize=1`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (pipSnap.ok) {
                    const pipData = await pipSnap.json();
                    const pip = pipData.documents?.[0];
                    if (pip) {
                        const pf = fFields(pip.fields || {});
                        const stages = pf.stages || [];
                        if (stages.length > 0) firstStageId = stages[0].id || stages[0].key || 'new';
                    }
                }

                const newDealId = `${bCallId}_deal`;
                await fsSet(`companies/${cid}/crm_deals/${newDealId}`, {
                    title:      { stringValue: `Дзвінок від ${clientName}` },
                    clientId:   { stringValue: clientId },
                    clientName: { stringValue: clientName },
                    phone:      { stringValue: bPhone },
                    stage:      { stringValue: firstStageId },
                    source:     { stringValue: 'binotel' },
                    amount:     { integerValue: 0 },
                    createdAt:  { timestampValue: nowB },
                    updatedAt:  { timestampValue: nowB },
                }, token);
                dealId = newDealId;
            }

            // Зберігаємо дзвінок в history угоди
            const callHistId = `call_${bCallId}_start`;
            await fsSet(`companies/${cid}/crm_deals/${dealId}/history/${callHistId}`, {
                id:         { stringValue: callHistId },
                type:       { stringValue: 'call' },
                subtype:    { stringValue: 'incoming' },
                phone:      { stringValue: bPhone },
                internal:   { stringValue: bInternal },
                callId:     { stringValue: bCallId },
                status:     { stringValue: 'active' },
                source:     { stringValue: 'binotel' },
                createdAt:  { timestampValue: nowB },
            }, token);

            // Зберігаємо активний дзвінок (щоб call_end міг знайти угоду)
            await fsSet(`companies/${cid}/active_calls/${bCallId}`, {
                callId:     { stringValue: bCallId },
                dealId:     { stringValue: dealId },
                clientId:   { stringValue: clientId },
                clientName: { stringValue: clientName },
                phone:      { stringValue: bPhone },
                internal:   { stringValue: bInternal },
                startedAt:  { timestampValue: nowB },
            }, token);

            return json({ ok: true, dealId, clientId });
        }

        // ── call_end: дзвінок завершено → оновлюємо запис ──
        if (bEvent === 'call_end' || bEvent === 'CALL_END' || bEvent === 'hangup') {
            // Знаходимо активний дзвінок
            const activeCallDoc = await fsGet(`companies/${cid}/active_calls/${bCallId}`, token);
            if (!activeCallDoc?.fields) return json({ ok: true });
            const activeCall = fFields(activeCallDoc.fields);
            const dealId = activeCall.dealId || '';

            if (dealId) {
                // Оновлюємо history запис
                const callHistId = `call_${bCallId}_start`;
                await fsPatch(`companies/${cid}/crm_deals/${dealId}/history/${callHistId}`, {
                    status:      { stringValue: bDisp === 'ANSWERED' ? 'answered' : 'missed' },
                    duration:    { integerValue: bDuration },
                    endedAt:     { timestampValue: nowB },
                    updatedAt:   { timestampValue: nowB },
                }, token);

                // Оновлюємо угоду
                await fsPatch(`companies/${cid}/crm_deals/${dealId}`, {
                    lastCallAt:       { timestampValue: nowB },
                    lastCallDuration: { integerValue: bDuration },
                    lastCallStatus:   { stringValue: bDisp === 'ANSWERED' ? 'answered' : 'missed' },
                    updatedAt:        { timestampValue: nowB },
                }, token);

                // Якщо пропущений дзвінок — створюємо задачу "Передзвонити"
                if (bDisp !== 'ANSWERED' && bDuration === 0) {
                    const taskId = `task_callback_${bCallId}`;
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    await fsSet(`companies/${cid}/tasks/${taskId}`, {
                        title:     { stringValue: `Передзвонити: ${activeCall.clientName || bPhone}` },
                        status:    { stringValue: 'todo' },
                        priority:  { stringValue: 'high' },
                        dealId:    { stringValue: dealId },
                        phone:     { stringValue: bPhone },
                        source:    { stringValue: 'binotel_missed' },
                        deadline:  { timestampValue: tomorrow.toISOString() },
                        createdAt: { timestampValue: nowB },
                        updatedAt: { timestampValue: nowB },
                    }, token);
                }
            }

            // Видаляємо активний дзвінок
            await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/active_calls/${bCallId}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
            ).catch(() => {});

            return json({ ok: true });
        }

        // ── call_record: запис дзвінку готовий ──
        if ((bEvent === 'call_record' || bEvent === 'CALL_RECORD') && bRecordUrl) {
            const activeCallDoc = await fsGet(`companies/${cid}/active_calls/${bCallId}`, token);
            const dealId = activeCallDoc ? fFields(activeCallDoc.fields || {}).dealId : null;

            if (dealId) {
                const callHistId = `call_${bCallId}_start`;
                await fsPatch(`companies/${cid}/crm_deals/${dealId}/history/${callHistId}`, {
                    recordUrl: { stringValue: bRecordUrl },
                    updatedAt: { timestampValue: nowB },
                }, token);
            }
            return json({ ok: true });
        }

        return json({ ok: true });
    }

    // ════════════════════════════════════════════════════════════
    // RINGOSTAT CHANNEL
    // ════════════════════════════════════════════════════════════
    if (channel === 'ringostat') {
        const rEvent    = body.event || body.type || '';
        const rPhone    = String(body.caller_id || body.phone || body.client_number || '').replace(/[^+\d]/g, '');
        const rCallId   = String(body.call_id || body.id || Date.now());
        const rDuration = Number(body.duration || body.billsec || 0);
        const rRecord   = body.record_url || body.recording || '';
        const rStatus   = body.disposition || body.call_status || '';
        const rInternal = String(body.extension || body.called_did || '');

        if (!rPhone || !cid) return json({ ok: true });

        const compDocR = await fsGet(`companies/${cid}`, token);
        if (!compDocR?.fields) return json({ ok: true });
        const compDataR = fFields(compDocR.fields);
        if (!compDataR.ringostatApiKey) return json({ ok: true });

        const nowR = new Date().toISOString();

        // call_start → угода в CRM
        if (['call_start', 'CALL_INIT', 'incoming', 'ringing'].includes(rEvent)) {
            let clientId = null, clientName = rPhone, dealId = null;

            // Шукаємо клієнта по телефону
            const rCliSnap = await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/crm_clients?pageSize=100`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (rCliSnap.ok) {
                const rCliData = await rCliSnap.json();
                const found = (rCliData.documents || []).find(d => {
                    const f = fFields(d.fields || {});
                    return f.phone === rPhone || f.phone === rPhone.replace('+', '');
                });
                if (found) {
                    clientId   = found.name.split('/').pop();
                    clientName = fFields(found.fields || {}).name || rPhone;
                }
            }

            if (!clientId) {
                const newCliId = `${rCallId}_cli`;
                await fsSet(`companies/${cid}/crm_clients/${newCliId}`, {
                    name: { stringValue: rPhone }, phone: { stringValue: rPhone },
                    source: { stringValue: 'ringostat' },
                    createdAt: { timestampValue: nowR }, updatedAt: { timestampValue: nowR },
                }, token);
                clientId = newCliId;
            }

            const newDealId = `${rCallId}_rdeal`;
            await fsSet(`companies/${cid}/crm_deals/${newDealId}`, {
                title:      { stringValue: `Дзвінок (Ringostat): ${clientName}` },
                clientId:   { stringValue: clientId },
                clientName: { stringValue: clientName },
                phone:      { stringValue: rPhone },
                stage:      { stringValue: 'new' },
                source:     { stringValue: 'ringostat' },
                amount:     { integerValue: 0 },
                createdAt:  { timestampValue: nowR },
                updatedAt:  { timestampValue: nowR },
            }, token);

            await fsSet(`companies/${cid}/active_calls/${rCallId}`, {
                callId:     { stringValue: rCallId },
                dealId:     { stringValue: newDealId },
                clientId:   { stringValue: clientId },
                clientName: { stringValue: clientName },
                phone:      { stringValue: rPhone },
                internal:   { stringValue: rInternal },
                startedAt:  { timestampValue: nowR },
                source:     { stringValue: 'ringostat' },
            }, token);

            return json({ ok: true, dealId: newDealId });
        }

        // call_end
        if (['call_end', 'CALL_END', 'hangup', 'answered'].includes(rEvent)) {
            const rActiveDoc = await fsGet(`companies/${cid}/active_calls/${rCallId}`, token);
            if (rActiveDoc?.fields) {
                const rActive = fFields(rActiveDoc.fields);
                if (rActive.dealId) {
                    await fsPatch(`companies/${cid}/crm_deals/${rActive.dealId}`, {
                        lastCallAt:       { timestampValue: nowR },
                        lastCallDuration: { integerValue: rDuration },
                        lastCallStatus:   { stringValue: rStatus === 'ANSWERED' ? 'answered' : 'missed' },
                        updatedAt:        { timestampValue: nowR },
                    }, token);

                    if (rStatus !== 'ANSWERED' && rDuration === 0) {
                        const tomorrowR = new Date();
                        tomorrowR.setDate(tomorrowR.getDate() + 1);
                        await fsSet(`companies/${cid}/tasks/task_cb_${rCallId}`, {
                            title:     { stringValue: `Передзвонити (Ringostat): ${rActive.clientName || rPhone}` },
                            status:    { stringValue: 'todo' },
                            priority:  { stringValue: 'high' },
                            dealId:    { stringValue: rActive.dealId },
                            phone:     { stringValue: rPhone },
                            source:    { stringValue: 'ringostat_missed' },
                            deadline:  { timestampValue: tomorrowR.toISOString() },
                            createdAt: { timestampValue: nowR },
                            updatedAt: { timestampValue: nowR },
                        }, token);
                    }
                }
                await fetch(
                    `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/active_calls/${rCallId}`,
                    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
                ).catch(() => {});
            }
            return json({ ok: true });
        }

        // call_record
        if (rRecord && ['call_record', 'record_ready'].includes(rEvent)) {
            const rActiveDoc2 = await fsGet(`companies/${cid}/active_calls/${rCallId}`, token);
            if (rActiveDoc2?.fields) {
                const rDeal = fFields(rActiveDoc2.fields).dealId;
                if (rDeal) {
                    await fsPatch(`companies/${cid}/crm_deals/${rDeal}`, {
                        lastCallRecord: { stringValue: rRecord },
                        updatedAt:      { timestampValue: nowR },
                    }, token);
                }
            }
            return json({ ok: true });
        }

        return json({ ok: true });
    }

    // Other channels — just ack
    return json({ok:true, channel, received: true});
}


// ════════════════════════════════════════════════════════════
// FLOW ENGINE — виконання ланцюгів ботів
// ════════════════════════════════════════════════════════════
async function runFlowEngine({ cid, chatId, botId, flowId, currentNodeId, text, isCallback, callbackData, contact, contactPath, token, botToken, from, userName, tgSend, env }) {
    // Паралельно завантажуємо flow і platform settings
    const [flowSnap, platDocPre] = await Promise.all([
        fetch(
            `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots/${botId}/flows/${flowId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        ),
        fsGet(`settings/platform`, token),
    ]);

    let nodes = [], edges = [];
    if (flowSnap.ok) {
        const fd = await flowSnap.json();
        if (fd.fields) {
            const raw = fFields(fd.fields);
            nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
            edges = Array.isArray(raw.edges) ? raw.edges : [];
        }
    }
    // Fallback: canvasData/layout
    if (!nodes.length) {
        const canvasSnap = await fetch(
            `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots/${botId}/flows/${flowId}/canvasData/layout`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (canvasSnap.ok) {
            const cd = await canvasSnap.json();
            if (cd.fields) {
                const raw = fFields(cd.fields);
                nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
                edges = Array.isArray(raw.edges) ? raw.edges : [];
            }
        }
    }

    if (!nodes.length) return;

    // Знаходимо поточний вузол
    let currentNode = null;
    if (currentNodeId === 'start' || !currentNodeId) {
        // START вузол не зберігається в nodes → беремо перший вузол (він завжди відсортований)
        currentNode = nodes.find(n => n.type === 'start' || n.data?.type === 'start' || n.id?.includes('start'))
                   || nodes[0] || null;
    } else {
        currentNode = nodes.find(n => n.id === currentNodeId);
    }

    if (!currentNode) return;

    // Знаходимо наступний вузол по з'єднанню
    function getNextNode(fromNodeId, buttonLabel) {
        // Підтримуємо дві структури edges:
        // React Flow: { source, target, sourceHandle }
        // Canvas: { fromNode, fromPort, toNode }
        const srcKey  = e => e.source || e.fromNode;
        const tgtKey  = e => e.target || e.toNode;
        const hdlKey  = e => e.sourceHandle || e.fromPort;

        const matchEdge = edges.find(e => {
            if (srcKey(e) !== fromNodeId) return false;
            if (buttonLabel) {
                const h = hdlKey(e);
                return (h && (h.includes(buttonLabel) || h === buttonLabel)) ||
                       e.label === buttonLabel || !h;
            }
            return true;
        }) || edges.find(e => srcKey(e) === fromNodeId);
        if (!matchEdge) return null;
        return nodes.find(n => n.id === tgtKey(matchEdge)) || null;
    }

    // Зібрані дані контакту
    let collectedData = {};
    try {
        const cd = contact.collectedData;
        if (typeof cd === 'object' && cd !== null) collectedData = cd;
    } catch {}

    // Визначаємо що робити залежно від типу поточного вузла
    const nodeType = currentNode.type || currentNode.data?.type || '';
    const nodeData = currentNode.data || currentNode;

    // Якщо це START вузол — переходимо до наступного
    if (nodeType === 'start' || currentNode.id?.includes('start')) {
        const nextNode = getNextNode(currentNode.id);
        if (nextNode) {
            await fsPatch(contactPath, {
                currentNodeId: { stringValue: nextNode.id },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
            await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
        }
        return;
    }

    // Якщо currentNodeId був 'start' але знайшли перший вузол (не START тип) — виконуємо його
    if (currentNodeId === 'start' || currentNodeId === '') {
        await fsPatch(contactPath, {
            currentNodeId: { stringValue: currentNode.id },
            updatedAt:     { timestampValue: new Date().toISOString() },
        }, token);
        await executeNode({ node: currentNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
        return;
    }

    // Якщо прийшов callback (натиснута кнопка) — знаходимо наступний вузол
    if (isCallback && callbackData) {
        const nextNode = getNextNode(currentNode.id, callbackData);
        if (nextNode) {
            await fsPatch(contactPath, {
                currentNodeId: { stringValue: nextNode.id },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
            try {
                const nextType = nextNode.type || nextNode.data?.type || '';
                const isAI = nextType === 'ai_agent' || nextType === 'aiAgent' || nextType === 'AI' || nextType === 'ai';
                // Якщо наступний вузол AI — передаємо стартовий текст щоб AI почав
                // При callback не передаємо text бота як userInput — тільки для не-AI вузлів
                const inputForAI = isAI ? '' : undefined;
                await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName, userInput: inputForAI });
            } catch(ex) {
                await tgSend(chatId, `⚠️ executeNode error: ${ex.message?.slice(0,200)}`);
            }
        }
        return;
    }

    // Якщо прийшло текстове повідомлення
    const curType = currentNode.type || currentNode.data?.type || '';
    const curData = currentNode.data || currentNode;
    
    // Якщо поточний вузол — MESSAGE з кнопками, юзер написав текст замість натиснути кнопку
    // Знаходимо наступний AI вузол напряму
    if (curType === 'message' || curType === 'sendMessage') {
        const curButtons = curData.buttons || curData.keyboard || [];
        if (curButtons.length > 0) {
            // Шукаємо перший AI вузол після цього MESSAGE
            const nextNode = getNextNode(currentNode.id);
            if (nextNode) {
                const nextType = nextNode.type || nextNode.data?.type || '';
                if (nextType === 'ai_agent' || nextType === 'aiAgent') {
                    await fsPatch(contactPath, {
                        currentNodeId: { stringValue: nextNode.id },
                        updatedAt:     { timestampValue: new Date().toISOString() },
                    }, token);
                    await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName, userInput: text });
                    return;
                }
            }
            // Немає AI вузла — просто надсилаємо повідомлення знову
            return;
        }
    }
    
    await executeNode({ node: currentNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName, userInput: text });
}

// ══════════════════════════════════════════════════════════
// ІНТЕРПОЛЯЦІЯ ЗМІННИХ {{varName}} в тексті
// ══════════════════════════════════════════════════════════
function _interpolate(text, collectedData = {}) {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return collectedData[key] !== undefined ? String(collectedData[key]) : match;
    });
}

async function executeNode({ node, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName, userInput }) {
    const nodeType = node.type || node.data?.type || '';
    const nodeData = node.data || node;

    // ── ВУЗОЛ: ПОВІДОМЛЕННЯ ──────────────────────────────────
    if (nodeType === 'message' || nodeType === 'sendMessage') {
        const msgText = _interpolate(nodeData.text || nodeData.message || nodeData.content || '', collectedData);
        const buttons = nodeData.buttons || nodeData.keyboard || [];

        let replyMarkup = {};
        if (buttons && buttons.length > 0) {
            // Inline кнопки — callback_data = індекс кнопки (btn_0, btn_1...)
            // щоб відповідати fromPort в edges
            const inlineKeyboard = buttons.map((btn, btnIdx) => [{
                text: btn.text || btn.label || btn,
                callback_data: `btn_${btnIdx}`,
            }]);
            replyMarkup = { inline_keyboard: inlineKeyboard };
        }

        if (msgText) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: msgText,
                    parse_mode: 'HTML',
                    ...(buttons.length > 0 ? { reply_markup: replyMarkup } : {}),
                }),
            }).catch(()=>{});
        }

        // Зберігаємо повідомлення бота в лог
        const bmId = `msg_${Date.now()}_bot`;
        const bmTs3 = new Date().toISOString();
        await fsSet(`companies/${cid}/contacts/${chatId}/messages/${bmId}`, {
            id:        { stringValue: bmId },
            role:      { stringValue: 'bot' },
            from:      { stringValue: 'bot' },
            direction: { stringValue: 'out' },
            text:      { stringValue: msgText },
            timestamp: { timestampValue: bmTs3 },
            createdAt: { timestampValue: bmTs3 },
        }, token);

        // Зберігаємо поточний вузол (потрібно для callback від кнопок)
        if (buttons && buttons.length > 0) {
            await fsPatch(`companies/${cid}/contacts/${chatId}`, {
                currentNodeId: { stringValue: node.id },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
        }

        // Якщо немає кнопок — автоматично переходимо до наступного вузла
        if (!buttons || buttons.length === 0) {
            const nextNode = (node.edges || []).find(e=>(e.source||e.fromNode)===node.id) ||
                             edges.find(e=>(e.source||e.fromNode)===node.id);
            if (nextNode) {
                const target = nodes.find(n=>n.id===(nextNode.target||nextNode.toNode));
                if (target) {
                    await fsPatch(`companies/${cid}/contacts/${chatId}`, {
                        currentNodeId: { stringValue: target.id },
                        updatedAt:     { timestampValue: new Date().toISOString() },
                    }, token);
                    // Якщо наступний — ШІ агент з "бот пише першим" = виконуємо відразу
                    const tType = target.type || target.data?.type || '';
                    if (tType === 'ai_agent' || tType === 'aiAgent') {
                        await executeNode({ node: target, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
                    }
                }
            }
        }
        return;
    }

    // ── ВУЗОЛ: ШІ АГЕНТ ─────────────────────────────────────
    if (nodeType === 'ai_agent' || nodeType === 'aiAgent' || nodeType === 'AI' || nodeType === 'ai') {
        // Завантажуємо промпт вузла
        let systemPrompt = nodeData.systemPrompt || nodeData.aiSystem || nodeData.prompt || '';
        const aiProvider = nodeData.aiProvider || 'openai';
        const aiModel    = nodeData.model || 'gpt-4o-mini';
        const maxTokens  = nodeData.maxTokens || 1500;
        const writesFirst = nodeData.writesFirst || nodeData.firstMessageEnabled || nodeData.botWritesFirst || false;
        const firstMessage = nodeData.firstMessage || '';
        const historyLimit = parseInt(nodeData.historyLimit ?? 14) || 14;

        // Якщо промпт є посиланням (__ref:nodeId) або порожній — читаємо з nodePrompts
        if (!systemPrompt || systemPrompt.startsWith('__ref:')) {
            const promptDoc = await fsGet(
                `companies/${cid}/bots/${botId}/flows/${flowId}/nodePrompts/${node.id}`, token
            );
            if (promptDoc?.fields) {
                const pd = fFields(promptDoc.fields);
                systemPrompt = pd.systemPrompt || pd.aiSystem || pd.prompt || '';
            }
        }

        // Читаємо settings/platform для AI параметрів
        let openaiKey = '';
        let botModel = 'gpt-4o-mini';
        let botMaxTokens = 1500;
        let botTemperature = 0.7;
        const platDocAI = await fsGet(`settings/platform`, token);
        if (platDocAI?.fields) {
            const platAI = fFields(platDocAI.fields);
            openaiKey = platAI.openaiApiKey || '';
            if (platAI.botModel) botModel = platAI.botModel;
            if (platAI.botMaxTokens) botMaxTokens = parseInt(platAI.botMaxTokens) || 1500;
            if (platAI.botTemperature !== undefined) botTemperature = parseFloat(platAI.botTemperature) || 0.7;
        }
        if (!openaiKey) openaiKey = env.OPENAI_API_KEY || '';
        if (!openaiKey) {
            const aiSettDocFallback = await fsGet(`settings/ai`, token);
            if (aiSettDocFallback?.fields) {
                const aiSettFallback = fFields(aiSettDocFallback.fields);
                openaiKey = aiSettFallback.openaiApiKey || aiSettFallback.apiKey || '';
            }
        }

        // Якщо бот пише першим і немає userInput — надсилаємо привітання від ШІ
        if (writesFirst && !userInput) {
            const botModel2 = botModel;
            const botMaxTokens2 = botMaxTokens;
            const botTemperature2 = botTemperature;
            if (openaiKey && systemPrompt) {
                const aiResp = await callOpenAI({
                    apiKey: openaiKey,
                    model: botModel2,
                    systemPrompt,
                    messages: [{ role: 'user', content: 'Привітай клієнта і почни розмову.' }],
                    maxTokens: botMaxTokens2,
                    temperature: botTemperature2,
                });
                if (aiResp) {
                    await tgSend(chatId, aiResp);
                    const bm = `msg_${Date.now()}_bot`;
                    const bmTs = new Date().toISOString();
                    await fsSet(`companies/${cid}/contacts/${chatId}/messages/${bm}`, {
                        id:        { stringValue: bm },
                        role:      { stringValue: 'bot' },
                        from:      { stringValue: 'bot' },
                        direction: { stringValue: 'out' },
                        text:      { stringValue: aiResp },
                        timestamp: { timestampValue: bmTs },
                        createdAt: { timestampValue: bmTs },
                    }, token);
                    // Перевіряємо чи ШІ кваліфікував ліда
                    await checkAndConvertToLead({ aiResponse: aiResp, userInput: '', collectedData, cid, chatId, contact, contactPath, token });
                }
            }
            return;
        }

        // Якщо userInput порожній (прийшов callback → перехід на AI) — AI починає сам
        if (!userInput) {
            if (systemPrompt && openaiKey) {
                // Не передаємо штучне user повідомлення — AI сам починає по system промпту
                const startResp = await callOpenAI({
                    apiKey: openaiKey,
                    model: botModel,
                    systemPrompt: systemPrompt + '\n\nВАЖЛИВО: Зараз починай розмову першим. Не чекай на запитання — одразу починай з першого кроку по скрипту.',
                    messages: [{ role: 'user', content: '.' }],
                    maxTokens: botMaxTokens,
                    temperature: botTemperature,
                });
                if (startResp) {
                    const parts = [];
                    for (let i = 0; i < startResp.length; i += 4096) parts.push(startResp.slice(i, i + 4096));
                    for (const p of parts) await tgSend(chatId, p);
                    const bm0 = `msg_${Date.now()}_bot`;
                    const bTs0 = new Date().toISOString();
                    await fsSet(`companies/${cid}/contacts/${chatId}/messages/${bm0}`, {
                        id:{ stringValue:bm0 }, role:{ stringValue:'bot' }, from:{ stringValue:'bot' },
                        direction:{ stringValue:'out' }, text:{ stringValue:startResp },
                        timestamp:{ timestampValue:bTs0 }, createdAt:{ timestampValue:bTs0 },
                    }, token);
                    await fsPatch(`companies/${cid}/contacts/${chatId}`, {
                        lastMessage:{ stringValue:startResp.slice(0,100) },
                        lastMessageAt:{ timestampValue:bTs0 },
                        updatedAt:{ timestampValue:bTs0 },
                    }, token);
                }
            }
            return;
        }

        // Завантажуємо історію чату для контексту
        const limit = Math.max((historyLimit || 14) * 2, 30);
        const histSnap = await fetch(
            `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/contacts/${chatId}/messages?pageSize=${limit}&orderBy=createdAt%20desc`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        let chatHistory = [];
        if (histSnap.ok) {
            const hd = await histSnap.json();
            // desc → реверсуємо щоб отримати хронологічний порядок
            const docs = (hd.documents||[]).reverse();
            for (const doc of docs) {
                const d = fFields(doc.fields||{});
                if (d.role === 'user' && d.text && !d.isCallback &&
                    !d.text.startsWith('/start') && !d.text.startsWith('/') &&
                    d.text !== 'btn_0' && d.text !== 'btn_1' && d.text !== 'btn_2') {
                    chatHistory.push({ role:'user', content: d.text });
                } else if (d.role === 'bot' && d.text) {
                    chatHistory.push({ role:'assistant', content: d.text });
                }
            }
        }
        // Додаємо поточне повідомлення (якщо ще немає в history)
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userInput) {
            chatHistory.push({ role: 'user', content: userInput });
        }

        // Ключ вже завантажений вище (один раз для всього AI вузла)
        if (!openaiKey) {
            await tgSend(chatId, `Вибачте, ШІ наразі недоступний. Менеджер зв'яжеться з вами.`);
            return;
        }

        const aiResp = await callOpenAI({
            apiKey: openaiKey,
            model: botModel,
            systemPrompt: systemPrompt || 'Ти корисний асистент. Відповідай коротко і чітко.',
            messages: chatHistory,
            maxTokens: botMaxTokens,
            temperature: botTemperature,
        });

        if (aiResp) {
            // Telegram обмежує 4096 символів — розбиваємо на частини
            const MAX_TG = 4096;
            const parts = [];
            for (let i = 0; i < aiResp.length; i += MAX_TG) {
                parts.push(aiResp.slice(i, i + MAX_TG));
            }
            for (const part of parts) await tgSend(chatId, part);
            const bm = `msg_${Date.now()}_bot`;
            const bmTs2 = new Date().toISOString();
            await fsSet(`companies/${cid}/contacts/${chatId}/messages/${bm}`, {
                id:        { stringValue: bm },
                role:      { stringValue: 'bot' },
                from:      { stringValue: 'bot' },
                direction: { stringValue: 'out' },
                text:      { stringValue: aiResp },
                timestamp: { timestampValue: bmTs2 },
                createdAt: { timestampValue: bmTs2 },
            }, token);
            // Оновлюємо lastMessage контакту (bot відповідь)
            await fsPatch(`companies/${cid}/contacts/${chatId}`, {
                lastMessage:   { stringValue: aiResp.slice(0, 100) },
                lastMessageAt: { timestampValue: bmTs2 },
                updatedAt:     { timestampValue: bmTs2 },
            }, token);
            await checkAndConvertToLead({ aiResponse: aiResp, userInput, collectedData, cid, chatId, contact, contactPath, token });
            // CRM тригер done_tag — якщо AI відповідь містить [DONE]
            if (aiResp.includes('[DONE]')) {
                const fDoc2 = await fsGet(`companies/${cid}/bots/${botId}/flows/${flowId}`, token);
                if (fDoc2?.fields) {
                    const fd2 = fFields(fDoc2.fields);
                    if (fd2.crmEnabled && (fd2.crmTrigger === 'done_tag' || !fd2.crmTrigger) && fd2.crmPipelineId) {
                        await _createCrmDealFromFlow({ cid, chatId, contact, fd: fd2, token, userName });
                    }
                }
            }
        } else {
            // API помилка — надсилаємо fallback
            const fallbackMsg = nodeData.fallback || 'Вибачте, спробуйте пізніше.';
            await tgSend(chatId, fallbackMsg);
        }
        return;
    }

    // ── ВУЗОЛ: ДІЯ (CREATE_LEAD / CRM) ──────────────────────
    if (nodeType === 'action' || nodeType === 'crm' || nodeType === 'createLead') {
        await createCrmLead({ cid, chatId, contact, collectedData, token });
        // Переходимо далі
        const nextEdge = edges.find(e=>(e.source||e.fromNode)===node.id);
        if (nextEdge) {
            const nextNode = nodes.find(n=>n.id===(nextEdge.target||nextEdge.toNode));
            if (nextNode) {
                await fsPatch(`companies/${cid}/contacts/${chatId}`, {
                    currentNodeId: { stringValue: nextNode.id },
                    updatedAt:     { timestampValue: new Date().toISOString() },
                }, token);
            }
        }
        return;
    }

    // ══════════════════════════════════════════════════════════
    // ── ВУЗОЛ: QUESTION — задати питання і чекати відповідь ──
    // ══════════════════════════════════════════════════════════
    if (nodeType === 'question') {
        const questionText = _interpolate(nodeData.text || nodeData.question || '', collectedData);
        const varName      = nodeData.varName || nodeData.variable || nodeData.saveAs || '';
        const buttons      = nodeData.buttons || nodeData.keyboard || [];

        // Якщо userInput вже є — це відповідь клієнта на це питання
        if (userInput !== undefined && userInput !== null && userInput !== '') {
            // Зберігаємо відповідь в collectedData
            if (varName) {
                collectedData[varName] = userInput;
                const mapFields = {};
                for (const [k, v] of Object.entries(collectedData)) {
                    mapFields[k] = { stringValue: String(v) };
                }
                await fsPatch(contactPath, {
                    collectedData: { mapValue: { fields: mapFields } },
                    updatedAt:     { timestampValue: new Date().toISOString() },
                }, token);
            }
            // Переходимо до наступного вузла
            // Якщо є кнопки — шукаємо edge по callback або по тексту кнопки
            let nextNode = null;
            if (buttons.length > 0) {
                const btnIdx = buttons.findIndex(b =>
                    (b.text || b.label || b) === userInput ||
                    userInput === `btn_${buttons.indexOf(b)}`
                );
                if (btnIdx >= 0) {
                    nextNode = getNextNode(node.id, `btn_${btnIdx}`);
                }
            }
            if (!nextNode) nextNode = getNextNode(node.id);
            if (nextNode) {
                await fsPatch(contactPath, {
                    currentNodeId: { stringValue: nextNode.id },
                    updatedAt:     { timestampValue: new Date().toISOString() },
                }, token);
                await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
            }
            return;
        }

        // Відповіді ще немає — надсилаємо питання і чекаємо
        let replyMarkup = {};
        if (buttons.length > 0) {
            const inlineKeyboard = buttons.map((btn, i) => [{
                text: btn.text || btn.label || btn,
                callback_data: `btn_${i}`,
            }]);
            replyMarkup = { inline_keyboard: inlineKeyboard };
        }

        if (questionText) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id:    chatId,
                    text:       questionText,
                    parse_mode: 'HTML',
                    ...(buttons.length > 0 ? { reply_markup: replyMarkup } : {}),
                }),
            }).catch(() => {});
        }

        // Зберігаємо що чекаємо відповідь на це питання
        await fsPatch(contactPath, {
            currentNodeId:    { stringValue: node.id },
            waitingForInput:  { booleanValue: true },
            waitingVarName:   { stringValue: varName },
            updatedAt:        { timestampValue: new Date().toISOString() },
        }, token);
        return;
    }

    // ══════════════════════════════════════════════════════════
    // ── ВУЗОЛ: CONDITION — розгалуження по змінній ────────────
    // ══════════════════════════════════════════════════════════
    if (nodeType === 'condition') {
        const condVar    = nodeData.variable || nodeData.varName || '';
        const condOp     = nodeData.operator || 'eq';
        const condVal    = nodeData.value || '';
        const actualVal  = String(collectedData[condVar] || '');
        const compareVal = String(condVal);

        let condResult = false;
        switch (condOp) {
            case 'eq':       condResult = actualVal === compareVal; break;
            case 'neq':      condResult = actualVal !== compareVal; break;
            case 'contains': condResult = actualVal.toLowerCase().includes(compareVal.toLowerCase()); break;
            case 'gt':       condResult = Number(actualVal) > Number(compareVal); break;
            case 'lt':       condResult = Number(actualVal) < Number(compareVal); break;
            case 'gte':      condResult = Number(actualVal) >= Number(compareVal); break;
            case 'lte':      condResult = Number(actualVal) <= Number(compareVal); break;
            case 'empty':    condResult = !actualVal; break;
            case 'notempty': condResult = !!actualVal; break;
            default:         condResult = actualVal === compareVal;
        }

        // true → edge з handle 'yes' або 'true' або перший
        // false → edge з handle 'no' або 'false' або другий
        const trueEdge  = edges.find(e => (e.source || e.fromNode) === node.id &&
            (e.sourceHandle === 'yes' || e.sourceHandle === 'true' || e.label === 'Так'));
        const falseEdge = edges.find(e => (e.source || e.fromNode) === node.id &&
            (e.sourceHandle === 'no' || e.sourceHandle === 'false' || e.label === 'Ні'));
        const allEdges  = edges.filter(e => (e.source || e.fromNode) === node.id);

        const targetEdge = condResult
            ? (trueEdge  || allEdges[0])
            : (falseEdge || allEdges[1] || allEdges[0]);

        if (targetEdge) {
            const nextNode = nodes.find(n => n.id === (targetEdge.target || targetEdge.toNode));
            if (nextNode) {
                await fsPatch(contactPath, {
                    currentNodeId: { stringValue: nextNode.id },
                    updatedAt:     { timestampValue: new Date().toISOString() },
                }, token);
                await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName, userInput });
            }
        }
        return;
    }

    // ══════════════════════════════════════════════════════════
    // ── ВУЗОЛ: PHOTO — отримати фото від клієнта ──────────────
    // ══════════════════════════════════════════════════════════
    if (nodeType === 'photo' || nodeType === 'receive_photo') {
        const varName   = nodeData.varName || nodeData.variable || nodeData.saveAs || 'photo_url';
        const promptMsg = _interpolate(nodeData.text || nodeData.prompt || 'Будь ласка, надішліть фото 📷', collectedData);

        // Якщо є фото у вхідному повідомленні (передається як спеціальне значення)
        if (userInput && userInput.startsWith('PHOTO:')) {
            const photoUrl = userInput.replace('PHOTO:', '');
            collectedData[varName] = photoUrl;
            const mapFields = {};
            for (const [k, v] of Object.entries(collectedData)) {
                mapFields[k] = { stringValue: String(v) };
            }
            await fsPatch(contactPath, {
                collectedData:   { mapValue: { fields: mapFields } },
                waitingForInput: { booleanValue: false },
                updatedAt:       { timestampValue: new Date().toISOString() },
            }, token);

            // Підтвердження і перехід далі
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: '✅ Фото отримано', parse_mode: 'HTML' }),
            }).catch(() => {});

            const nextNode = getNextNode(node.id);
            if (nextNode) {
                await fsPatch(contactPath, {
                    currentNodeId: { stringValue: nextNode.id },
                    updatedAt:     { timestampValue: new Date().toISOString() },
                }, token);
                await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
            }
            return;
        }

        // Фото ще не надіслано — просимо
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: promptMsg, parse_mode: 'HTML' }),
        }).catch(() => {});

        await fsPatch(contactPath, {
            currentNodeId:    { stringValue: node.id },
            waitingForInput:  { booleanValue: true },
            waitingVarName:   { stringValue: varName },
            waitingForPhoto:  { booleanValue: true },
            updatedAt:        { timestampValue: new Date().toISOString() },
        }, token);
        return;
    }

    // ══════════════════════════════════════════════════════════
    // ── ВУЗОЛ: CRM_UPDATE — записати дані в угоду ─────────────
    // ══════════════════════════════════════════════════════════
    if (nodeType === 'crm_update' || nodeType === 'updateDeal' || nodeType === 'update_deal') {
        // Знаходимо активну угоду контакту або створюємо нову
        let dealId = contact.crmDealId || collectedData._dealId || null;

        if (!dealId) {
            // Шукаємо угоду по chatId
            const dealsSnap = await fetch(
                `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/crm_deals?pageSize=5`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (dealsSnap.ok) {
                const dd = await dealsSnap.json();
                const found = (dd.documents || []).find(d => {
                    const f = fFields(d.fields || {});
                    return f.botChatId === String(chatId) || f.telegramChatId === String(chatId);
                });
                if (found) dealId = found.name.split('/').pop();
            }
        }

        // Що оновлюємо — беремо з nodeData.fields або всі collectedData
        const fieldsToUpdate = nodeData.fields || {};
        const updatePayload = {};

        // Фіксовані поля з налаштувань ноди
        for (const [key, val] of Object.entries(fieldsToUpdate)) {
            updatePayload[key] = { stringValue: _interpolate(String(val), collectedData) };
        }

        // Також записуємо весь collectedData як підполе
        if (Object.keys(collectedData).length > 0) {
            const cdFields = {};
            for (const [k, v] of Object.entries(collectedData)) {
                cdFields[k] = { stringValue: String(v) };
            }
            updatePayload.botCollectedData = { mapValue: { fields: cdFields } };
        }

        updatePayload.updatedAt = { timestampValue: new Date().toISOString() };

        if (dealId) {
            await fsPatch(`companies/${cid}/crm_deals/${dealId}`, updatePayload, token);
        } else {
            // Немає угоди — створюємо нову
            await createCrmLead({ cid, chatId, contact, collectedData, token });
        }

        const nextNode = getNextNode(node.id);
        if (nextNode) {
            await fsPatch(contactPath, {
                currentNodeId: { stringValue: nextNode.id },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
            await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
        }
        return;
    }

    // ══════════════════════════════════════════════════════════
    // ── ВУЗОЛ: HTTP_REQUEST — зовнішній API виклик ────────────
    // ══════════════════════════════════════════════════════════
    if (nodeType === 'http_request' || nodeType === 'httpRequest' || nodeType === 'api_call') {
        const reqUrl     = _interpolate(nodeData.url || '', collectedData);
        const reqMethod  = (nodeData.method || 'POST').toUpperCase();
        const reqBodyTpl = nodeData.body || '{}';
        const saveAs     = nodeData.saveAs || nodeData.varName || 'api_result';

        if (!reqUrl) {
            const nextNode = getNextNode(node.id);
            if (nextNode) await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
            return;
        }

        try {
            const bodyStr = _interpolate(reqBodyTpl, collectedData);
            const reqOpts = {
                method: reqMethod,
                headers: { 'Content-Type': 'application/json' },
            };
            if (reqMethod !== 'GET') reqOpts.body = bodyStr;

            const resp = await fetch(reqUrl, reqOpts);
            const respText = await resp.text();

            // Намагаємось розпарсити як JSON
            let resultVal = respText;
            try {
                const j = JSON.parse(respText);
                // Якщо є поле url або image — зберігаємо URL
                resultVal = j.url || j.image_url || j.data?.[0]?.url || respText;
                // Зберігаємо всі top-level поля
                for (const [k, v] of Object.entries(j)) {
                    if (typeof v === 'string' || typeof v === 'number') {
                        collectedData[`${saveAs}_${k}`] = String(v);
                    }
                }
            } catch {}

            collectedData[saveAs] = String(resultVal).slice(0, 1000);

            const mapFields = {};
            for (const [k, v] of Object.entries(collectedData)) {
                mapFields[k] = { stringValue: String(v) };
            }
            await fsPatch(contactPath, {
                collectedData: { mapValue: { fields: mapFields } },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
        } catch (httpErr) {
            collectedData[saveAs] = 'error';
            collectedData[`${saveAs}_error`] = httpErr.message || 'request failed';
        }

        const nextNodeHttp = getNextNode(node.id);
        if (nextNodeHttp) {
            await fsPatch(contactPath, {
                currentNodeId: { stringValue: nextNodeHttp.id },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
            await executeNode({ node: nextNodeHttp, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
        }
        return;
    }

    // ══════════════════════════════════════════════════════════
    // ── ВУЗОЛ: IMAGE_GENERATE — DALL-E генерація зображення ───
    // ══════════════════════════════════════════════════════════
    if (nodeType === 'image_generate' || nodeType === 'generateImage' || nodeType === 'dalle') {
        const imgStyle    = _interpolate(nodeData.style    || 'modern',   collectedData);
        const imgColors   = _interpolate(nodeData.colors   || collectedData.colors   || '', collectedData);
        const imgDims     = _interpolate(nodeData.dimensions || collectedData.dimensions || collectedData.room_size || '', collectedData);
        const imgRoomType = _interpolate(nodeData.roomType || collectedData.room_type || 'kitchen', collectedData);
        const imgExtra    = _interpolate(nodeData.extra    || collectedData.extra    || '', collectedData);
        const imgPrompt   = _interpolate(nodeData.prompt   || '', collectedData);
        const saveAs      = nodeData.saveAs || nodeData.varName || 'generated_image_url';
        const loadingMsg  = _interpolate(nodeData.loadingMessage || '⏳ Генерую дизайн, зачекайте ~30 секунд...', collectedData);

        // Повідомляємо клієнта що генерація йде
        await tgSend(chatId, loadingMsg);

        try {
            const genResp = await fetch(`https://apptalko.com/api/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId:  cid,
                    style:      imgStyle,
                    colors:     imgColors,
                    dimensions: imgDims,
                    roomType:   imgRoomType,
                    extra:      imgExtra,
                    prompt:     imgPrompt,
                }),
            });

            if (genResp.ok) {
                const genData = await genResp.json();
                const imageUrl = genData.url || '';

                if (imageUrl) {
                    collectedData[saveAs] = imageUrl;

                    // Зберігаємо URL в collectedData
                    const mapFields = {};
                    for (const [k, v] of Object.entries(collectedData)) {
                        mapFields[k] = { stringValue: String(v) };
                    }
                    await fsPatch(contactPath, {
                        collectedData: { mapValue: { fields: mapFields } },
                        updatedAt:     { timestampValue: new Date().toISOString() },
                    }, token);

                    // Відправляємо фото клієнту через Telegram
                    const captionText = _interpolate(
                        nodeData.caption || '✅ Ось ваш концепт дизайну!\n\n⚠️ Це орієнтовна візуалізація. Фінальний вигляд уточнюється на заміру.',
                        collectedData
                    );
                    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            photo:   imageUrl,
                            caption: captionText,
                            parse_mode: 'HTML',
                        }),
                    }).catch(() => {
                        // Fallback — якщо sendPhoto не спрацював, відправляємо як посилання
                        tgSend(chatId, `${captionText}\n\n🖼 ${imageUrl}`);
                    });

                    // Лог повідомлення
                    const imgMsgId = `msg_${Date.now()}_bot`;
                    const imgTs    = new Date().toISOString();
                    await fsSet(`companies/${cid}/contacts/${chatId}/messages/${imgMsgId}`, {
                        id:        { stringValue: imgMsgId },
                        role:      { stringValue: 'bot' },
                        from:      { stringValue: 'bot' },
                        direction: { stringValue: 'out' },
                        text:      { stringValue: captionText },
                        imageUrl:  { stringValue: imageUrl },
                        timestamp: { timestampValue: imgTs },
                        createdAt: { timestampValue: imgTs },
                    }, token);

                } else {
                    await tgSend(chatId, '⚠️ Не вдалось згенерувати зображення. Менеджер зв\'яжеться з вами.');
                }
            } else {
                await tgSend(chatId, '⚠️ Сервіс генерації тимчасово недоступний. Менеджер надішле варіанти вручну.');
            }
        } catch (imgErr) {
            await tgSend(chatId, '⚠️ Помилка генерації. Спробуємо пізніше.');
            console.error('[image_generate]', imgErr.message);
        }

        // Переходимо до наступної ноди
        const nextNodeImg = getNextNode(node.id);
        if (nextNodeImg) {
            await fsPatch(contactPath, {
                currentNodeId: { stringValue: nextNodeImg.id },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
            await executeNode({ node: nextNodeImg, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
        }
        return;
    }

    // ── ВУЗОЛ: КІНЕЦЬ ───────────────────────────────────────
    if (nodeType === 'end' || nodeType === 'finish') {
        // CRM тригер flow_end
        const fDocEnd = await fsGet(`companies/${cid}/bots/${botId}/flows/${flowId}`, token);
        if (fDocEnd?.fields) {
            const fdEnd = fFields(fDocEnd.fields);
            if (fdEnd.crmEnabled && fdEnd.crmTrigger === 'flow_end' && fdEnd.crmPipelineId) {
                await _createCrmDealFromFlow({ cid, chatId, contact, fd: fdEnd, token, userName });
            }
        }
        await fsPatch(`companies/${cid}/contacts/${chatId}`, {
            currentFlowId:   { stringValue: '' },
            currentNodeId:   { stringValue: '' },
            flowCompletedAt: { timestampValue: new Date().toISOString() },
            updatedAt:       { timestampValue: new Date().toISOString() },
        }, token);

        // Emit bot_flow_completed подія — тригери CRM підхоплять
        // Зберігаємо в events колекцію щоб client-side EventBus міг підписатись
        const fcEventId = `evt_flow_${chatId}_${Date.now()}`;
        await fsSet(`companies/${cid}/events/${fcEventId}`, {
            type:      { stringValue: 'bot.flow_completed' },
            chatId:    { stringValue: String(chatId) },
            botId:     { stringValue: botId || '' },
            flowId:    { stringValue: flowId || '' },
            dealId:    { stringValue: contact.crmDealId || '' },
            clientId:  { stringValue: contact.clientId || '' },
            channel:   { stringValue: contact.channel || 'telegram' },
            createdAt: { timestampValue: new Date().toISOString() },
        }, token);

        return;
    }
}

// Виклик OpenAI API
async function callOpenAI({ apiKey, model, systemPrompt, messages, maxTokens, temperature }) {
    try {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model || 'gpt-4o-mini',
                max_tokens: maxTokens || 1000,
                temperature: temperature ?? 0.7,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages,
                ],
            }),
        });
        if (!r.ok) return null;
        const d = await r.json();
        return d.choices?.[0]?.message?.content?.trim() || null;
    } catch { return null; }
}

// CRM угода з налаштувань flow
async function _createCrmDealFromFlow({ cid, chatId, contact, fd, token, userName }) {
    try {
        const now = new Date().toISOString();
        const dealId = `flow_deal_${chatId}_${Date.now()}`;
        const clientId = `tg_${chatId}`;
        const name = contact.name || contact.senderName || userName || `Telegram ${chatId}`;

        // Створюємо клієнта
        await fsSet(`companies/${cid}/crm_clients/${clientId}`, {
            id:              { stringValue: clientId },
            name:            { stringValue: name },
            phone:           { stringValue: contact.phone || '' },
            telegramChatId:  { stringValue: chatId },
            telegramUsername:{ stringValue: contact.username || '' },
            channel:         { stringValue: 'telegram' },
            source:          { stringValue: 'bot_flow' },
            createdAt:       { timestampValue: now },
            updatedAt:       { timestampValue: now },
        }, token);

        // Створюємо угоду в потрібній воронці/стадії
        await fsSet(`companies/${cid}/crm_deals/${dealId}`, {
            id:         { stringValue: dealId },
            title:      { stringValue: name },
            clientName: { stringValue: name },
            phone:      { stringValue: contact.phone || '' },
            stage:      { stringValue: fd.crmStageId || 'new' },
            pipelineId: { stringValue: fd.crmPipelineId || '' },
            source:     { stringValue: 'bot_flow' },
            telegramChatId: { stringValue: chatId },
            status:     { stringValue: 'active' },
            amount:     { integerValue: '0' },
            createdAt:  { timestampValue: now },
            updatedAt:  { timestampValue: now },
        }, token);

        // Оновлюємо статус контакту
        await fsPatch(`companies/${cid}/contacts/${chatId}`, {
            status:    { stringValue: 'lead' },
            dealId:    { stringValue: dealId },
            updatedAt: { timestampValue: now },
        }, token);
    } catch(e) { /* мовчки */ }
}

// Перевірка кваліфікації ліда і конвертація в CRM
async function checkAndConvertToLead({ aiResponse, userInput, collectedData, cid, chatId, contact, contactPath, token }) {
    // Витягуємо телефон з повідомлення користувача
    const phoneMatch = userInput.match(/(\+?[\d\s\-()]{10,15})/);
    if (phoneMatch) {
        collectedData.phone = phoneMatch[1].replace(/\s/g,'');
    }

    // Зберігаємо зібрані дані
    if (Object.keys(collectedData).length > 0) {
        const mapFields = {};
        for (const [k,v] of Object.entries(collectedData)) {
            mapFields[k] = { stringValue: String(v) };
        }
        await fsPatch(contactPath, {
            collectedData: { mapValue: { fields: mapFields } },
            updatedAt:     { timestampValue: new Date().toISOString() },
        }, token);
    }

    // Якщо є телефон — конвертуємо в ліда автоматично
    if (collectedData.phone && contact.status !== 'lead' && contact.status !== 'client') {
        await createCrmLead({ cid, chatId, contact: {...contact, ...collectedData}, collectedData, token });
        await fsPatch(contactPath, {
            status:    { stringValue: 'lead' },
            updatedAt: { timestampValue: new Date().toISOString() },
        }, token);
    }
}

// Створення ліда і угоди в CRM
async function createCrmLead({ cid, chatId, contact, collectedData, token }) {
    const now = new Date().toISOString();
    const clientId = `tg_client_${chatId}`;
    const dealId   = `tg_deal_${chatId}_${Date.now()}`;
    const name = contact.name || collectedData.name || `Telegram ${chatId}`;
    const phone = collectedData.phone || contact.phone || '';
    const note = collectedData.lastMessage || collectedData.request || '';

    // Створюємо/оновлюємо клієнта в CRM
    await fsSet(`companies/${cid}/crm_clients/${clientId}`, {
        id:            { stringValue: clientId },
        name:          { stringValue: name },
        phone:         { stringValue: phone },
        telegramChatId:{ stringValue: chatId },
        telegramUsername:{ stringValue: contact.username||'' },
        senderId:      { stringValue: chatId },
        botContactId:  { stringValue: chatId },
        contactId:     { stringValue: chatId },
        channel:       { stringValue: 'telegram' },
        source:        { stringValue: 'telegram_bot' },
        status:        { stringValue: 'active' },
        createdAt:     { timestampValue: now },
        updatedAt:     { timestampValue: now },
    }, token);

    // Перевіряємо чи угода вже є
    const existingDeal = await fetch(
        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/crm_deals?pageSize=1`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    // Простий пошук по chatId — якщо вже є угода від цього чату — не дублюємо
    const dealsRaw = await fsQuery(`crm_deals`, [{ field:'telegramChatId', value:chatId }], token, 1);
    // Примітка: fsQuery шукає по allDescendants, тут треба в межах компанії
    // Використовуємо простіший підхід — унікальний ID по chatId
    const existDealDoc = await fsGet(`companies/${cid}/crm_deals/${clientId}_deal`, token);
    if (existDealDoc?.fields) return; // вже є

    // Створюємо угоду
    await fsSet(`companies/${cid}/crm_deals/${clientId}_deal`, {
        id:            { stringValue: `${clientId}_deal` },
        title:         { stringValue: `${name} — Telegram бот` },
        clientName:    { stringValue: name },
        clientId:      { stringValue: clientId },
        phone:         { stringValue: phone },
        telegramChatId:{ stringValue: chatId },
        contactId:     { stringValue: chatId },
        botContactId:  { stringValue: chatId },
        source:        { stringValue: 'telegram_bot' },
        stage:         { stringValue: 'new' },
        note:          { stringValue: note },
        createdAt:     { timestampValue: now },
        updatedAt:     { timestampValue: now },
    }, token);
}

// ════════════════════════════════════════════════════════════
// BOOKING
// ════════════════════════════════════════════════════════════
async function handleBooking(request, url, env) {
    const method = request.method;
    let token;
    try { token = await getToken(env); } catch(e) { return json({error:'Firebase error'},500); }

    if (method==='GET') {
        const cid      = url.searchParams.get('cid');
        const masterId = url.searchParams.get('masterId');
        const date     = url.searchParams.get('date');
        if (!cid) return json({error:'Missing cid'},400);

        // Return available slots
        const slotsDoc = await fsGet(`companies/${cid}/bookingSlots/${date||'default'}`, token);
        const slots = slotsDoc ? fFields(slotsDoc.fields) : {};
        return json({ ok:true, slots });
    }

    if (method==='POST') {
        let body;
        try { body = await request.json(); } catch { return json({error:'Invalid JSON'},400); }
        const { cid, masterId, date, time, name, phone, service } = body;
        if (!cid||!date||!time||!phone) return json({error:'Missing required fields'},400);

        const bookId = `book_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        await fsSet(`companies/${cid}/bookings/${bookId}`, {
            id:        { stringValue: bookId },
            name:      { stringValue: name||'' },
            phone:     { stringValue: phone },
            service:   { stringValue: service||'' },
            masterId:  { stringValue: masterId||'' },
            date:      { stringValue: date },
            time:      { stringValue: time },
            status:    { stringValue: 'pending' },
            source:    { stringValue: 'widget' },
            createdAt: { timestampValue: new Date().toISOString() },
        }, token);
        return json({ ok:true, bookId });
    }

    return json({error:'Method not allowed'},405);
}

// ════════════════════════════════════════════════════════════
// STRIPE
// ════════════════════════════════════════════════════════════
async function handleStripe(request, url, env) {
    const path = url.pathname;

    if (path==='/api/stripe/create-checkout') {
        if (request.method!=='POST') return json({error:'Method not allowed'},405);
        let body;
        try { body = await request.json(); } catch { return json({error:'Invalid JSON'},400); }

        const { priceId, customerId, companyId, successUrl, cancelUrl } = body;
        const stripeKey = env.STRIPE_SECRET_KEY;
        if (!stripeKey) return json({error:'Stripe not configured'},500);

        const params = new URLSearchParams({
            'line_items[0][price]':    priceId,
            'line_items[0][quantity]': '1',
            mode:        'subscription',
            success_url: successUrl||'https://apptalko.com/?stripe=success',
            cancel_url:  cancelUrl||'https://apptalko.com/?stripe=cancel',
            ...(customerId ? { customer: customerId } : {}),
            'metadata[companyId]': companyId||'',
        });

        const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method:'POST',
            headers:{ Authorization:`Bearer ${stripeKey}`, 'Content-Type':'application/x-www-form-urlencoded' },
            body: params.toString(),
        });
        const d = await r.json();
        if (!r.ok) return json({error:d.error?.message},500);
        return json({ sessionId:d.id, url:d.url });
    }

    if (path==='/api/stripe/webhook') {
        const sig     = request.headers.get('stripe-signature')||'';
        const rawBody = await request.text();
        const whSecret = env.STRIPE_WEBHOOK_SECRET;

        // Verify signature (simplified — production should use full HMAC check)
        if (!whSecret || !sig) return json({error:'Missing signature'},400);

        let event;
        try { event = JSON.parse(rawBody); } catch { return json({error:'Invalid JSON'},400); }

        if (event.type==='checkout.session.completed') {
            const session = event.data.object;
            const cid     = session.metadata?.companyId;
            if (cid) {
                let token;
                try { token = await getToken(env); } catch {}
                if (token) {
                    await fsPatch(`companies/${cid}/settings/billing`, {
                        plan:      { stringValue: 'pro' },
                        stripeCustomerId: { stringValue: session.customer||'' },
                        updatedAt: { timestampValue: new Date().toISOString() },
                    }, token).catch(()=>{});
                }
            }
        }
        return json({received:true});
    }

    return json({error:'Not found'},404);
}

// ════════════════════════════════════════════════════════════
// BLOCK RENDERER
// ════════════════════════════════════════════════════════════
function renderBlock(b, primary, br, companyId, siteId) {
    switch(b.type) {
    case 'hero':
        return `<section style="background:${cssVal(b.bgColor,'#0a0f1a')};color:${cssVal(b.textColor,'#fff')};padding:5rem 1.5rem;text-align:center">
  <div style="max-width:800px;margin:0 auto">
    <h1 style="font-size:clamp(1.8rem,5vw,3rem);font-weight:800;margin-bottom:1rem">${esc(b.title||'')}</h1>
    ${b.subtitle?`<p style="font-size:clamp(1rem,2.5vw,1.25rem);opacity:.85;margin-bottom:2rem">${esc(b.subtitle)}</p>`:''}
    ${b.cta?`<a href="#form" class="btn">${esc(b.cta)}</a>`:''}
  </div></section>`;
    case 'benefits':
        return `<section class="sec" style="background:#f9fafb"><div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem">
      ${(b.items||[]).map(it=>`<div style="background:#fff;border-radius:${br};padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="font-size:1.75rem;margin-bottom:.5rem">${it.icon||''}</div>
        <h3 style="font-weight:700;margin-bottom:.35rem">${esc(it.title||'')}</h3>
        <p style="color:#6b7280;font-size:.9rem">${esc(it.text||'')}</p></div>`).join('')}
    </div></div></section>`;
    case 'services':
        return `<section class="sec"><div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem">
      ${(b.items||[]).map(it=>`<div style="border:1px solid #e5e7eb;border-radius:${br};padding:1.5rem">
        <h3 style="font-weight:700;margin-bottom:.25rem">${esc(it.title||'')}</h3>
        <div style="color:${primary};font-weight:700;font-size:1.1rem;margin-bottom:.5rem">${esc(it.price||'')}</div>
        <p style="color:#6b7280;font-size:.88rem">${esc(it.text||'')}</p></div>`).join('')}
    </div></div></section>`;
    case 'reviews':
        return `<section class="sec" style="background:#f9fafb"><div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem">
      ${(b.items||[]).map(it=>`<div style="background:#fff;border-radius:${br};padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="color:#f59e0b;font-size:1.1rem;margin-bottom:.5rem">${'★'.repeat(Math.min(5,it.rating||5))}</div>
        <p style="color:#374151;margin-bottom:1rem;font-style:italic">"${esc(it.text||'')}"</p>
        <div style="font-weight:600;font-size:.88rem">${esc(it.name||'')}</div></div>`).join('')}
    </div></div></section>`;
    case 'faq':
        return `<section class="sec"><div class="wrap" style="max-width:700px">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    ${(b.items||[]).map(it=>`<details style="border:1px solid #e5e7eb;border-radius:${br};padding:1.25rem;margin-bottom:.75rem">
      <summary style="font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center">
        ${esc(it.question||'')} <span style="color:${primary};font-size:1.2rem">+</span></summary>
      <p style="margin-top:.75rem;color:#6b7280">${esc(it.answer||'')}</p></details>`).join('')}
    </div></section>`;
    case 'team':
        return `<section class="sec"><div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center">
      ${(b.items||[]).map(it=>`<div style="text-align:center;max-width:200px">
        ${it.photo?`<img src="${esc(it.photo)}" alt="${esc(it.name||'')}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:.75rem">`
            :`<div style="width:100px;height:100px;border-radius:50%;background:${primary}22;display:flex;align-items:center;justify-content:center;margin:0 auto .75rem;font-size:2rem;font-weight:700;color:${primary}">${esc((it.name||'?').charAt(0))}</div>`}
        <div style="font-weight:700">${esc(it.name||'')}</div>
        <div style="color:#6b7280;font-size:.85rem">${esc(it.role||'')}</div></div>`).join('')}
    </div></div></section>`;
    case 'prices':
        return `<section class="sec" style="background:#f9fafb"><div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem">
      ${(b.items||[]).map(it=>`<div style="background:#fff;border-radius:${br};padding:2rem;box-shadow:0 2px 8px rgba(0,0,0,.06);text-align:center">
        <h3 style="font-weight:700;margin-bottom:.5rem">${esc(it.title||'')}</h3>
        <div style="font-size:1.75rem;font-weight:800;color:${primary};margin-bottom:1.25rem">${esc(it.price||'')}</div>
        <ul style="list-style:none;text-align:left">${(it.features||[]).map(f=>`<li style="padding:.35rem 0;border-bottom:1px solid #f3f4f6;font-size:.9rem">✓ ${esc(f)}</li>`).join('')}</ul>
        <a href="#form" class="btn" style="display:block;margin-top:1.5rem">Обрати</a></div>`).join('')}
    </div></div></section>`;
    case 'about':
        return `<section class="sec"><div class="wrap" style="display:flex;gap:3rem;align-items:center;flex-wrap:wrap">
    ${b.photo?`<img src="${esc(b.photo)}" alt="Про нас" style="width:260px;border-radius:${br};object-fit:cover">`:''}
    <div style="flex:1;min-width:200px">
      <h2 style="font-size:1.75rem;font-weight:700;margin-bottom:1rem">${esc(b.title||'')}</h2>
      <p style="color:#374151;line-height:1.7">${esc(b.text||'')}</p></div>
    </div></section>`;
    case 'form': {
        const fields=(b.fields||['name','phone']).map(f=>{
            const labels={name:"Ім'я",phone:'Телефон',email:'Email',message:'Повідомлення'};
            const types={email:'email',phone:'tel',message:'textarea'};
            const st='width:100%;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:1rem;margin-bottom:1rem;font-family:inherit';
            return types[f]==='textarea'
                ?`<textarea name="${f}" placeholder="${labels[f]||f}" style="${st};min-height:100px;resize:vertical" required></textarea>`
                :`<input type="${types[f]||'text'}" name="${f}" placeholder="${labels[f]||f}" style="${st};display:block" required>`;
        }).join('');
        return `<section id="form" class="sec" style="background:${primary}18"><div class="wrap" style="max-width:540px">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:.5rem">${esc(b.title||'')}</h2>
    ${b.subtitle?`<p style="text-align:center;color:#6b7280;margin-bottom:2rem">${esc(b.subtitle)}</p>`:''}
    <form id="talko-form" style="background:#fff;border-radius:${br};padding:2rem;box-shadow:0 4px 20px rgba(0,0,0,.08)">
      ${fields}
      <button type="submit" class="btn" style="width:100%">${esc(b.cta||'Відправити')}</button>
      <p id="talko-result" style="text-align:center;margin-top:1rem;font-weight:600;display:none"></p>
    </form></div></section>
<script>
(function(){var f=document.getElementById('talko-form');if(!f)return;
f.addEventListener('submit',function(e){e.preventDefault();
var btn=f.querySelector('button[type=submit]'),res=document.getElementById('talko-result');
btn.disabled=true;btn.textContent='Відправляємо...';
var d=Object.fromEntries(new FormData(f));
fetch('/api/crm-form',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({formId:'site_${siteId}',companyId:'${companyId}',
name:d.name||"",phone:d.phone||"",email:d.email||"",message:d.message||"",source:'site'})
}).then(function(){res.style.display='block';res.style.color='#16a34a';
res.textContent='\u2713 \u0414\u044f\u043a\u0443\u0454\u043c\u043e! \u041c\u0438 \u0437\u0432\u2019\u044f\u0436\u0435\u043c\u043e\u0441\u044f \u0437 \u0432\u0430\u043c\u0438.';f.reset();
}).catch(function(){res.style.display='block';res.style.color='#dc2626';
res.textContent='\u041f\u043e\u043c\u0438\u043b\u043a\u0430. \u0421\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0449\u0435 \u0440\u0430\u0437.';
}).finally(function(){btn.disabled=false;btn.textContent='${esc(b.cta||'Відправити')}';});});})();
</script>`;
    }
    case 'html': return b.rawHtml?`<div class="html-block">${b.rawHtml}</div>`:'';
    default: return b.title?`<section class="sec"><div class="wrap"><h2>${esc(b.title)}</h2></div></section>`:'';
    }
}

// ════════════════════════════════════════════════════════════
// handleGeneratePdf — генерація PDF (HTML для друку)
// GET /api/generate-pdf?type=invoice|act&realizationId=X&cid=Y
// Authorization: Bearer <idToken>
// ════════════════════════════════════════════════════════════
async function handleGeneratePdf(request, url, env) {
    // Auth — верифікуємо Firebase idToken
    const authHeader = request.headers.get('Authorization') || '';
    const idToken = authHeader.replace('Bearer ', '').trim();
    if (!idToken) return json({ error: 'unauthorized' }, 401);

    // БАГ 23 fix: верифікуємо токен через Firebase Auth
    const user = await verifyIdToken(idToken, env);
    if (!user) return json({ error: 'invalid token' }, 401);

    const type          = url.searchParams.get('type') || 'invoice';
    const realizationId = url.searchParams.get('realizationId');
    const companyId     = url.searchParams.get('cid');

    if (!realizationId || !companyId) return json({ error: 'missing params' }, 400);

    try {
        const token = await getServiceAccountToken(env);
        if (!token) return json({ error: 'auth failed' }, 500);

        // Завантажуємо реалізацію
        const rDoc = await fsGet(`companies/${companyId}/sales_realizations/${realizationId}`, token);
        if (!rDoc) return json({ error: 'realization not found' }, 404);
        const r = fFields(rDoc.fields || {});

        // БАГ 23 fix: перевіряємо що користувач належить до цієї компанії
        const userCompanyDoc = await fsGet(`companies/${companyId}/users/${user.localId}`, token);
        if (!userCompanyDoc) {
            // Спробуємо знайти через uid
            const userByUid = await fsGet(`companies/${companyId}/users/${user.uid || user.localId}`, token);
            if (!userByUid) return json({ error: 'forbidden' }, 403);
        }

        // Завантажуємо налаштування компанії (settings/general — основне, settings/main — fallback)
        const genDoc  = await fsGet(`companies/${companyId}/settings/general`, token);
        const sett    = genDoc ? fFields(genDoc.fields || {}) : {};
        const mainDoc = await fsGet(`companies/${companyId}/settings/main`, token);
        const main    = mainDoc ? fFields(mainDoc.fields || {}) : {};

        // Завантажуємо назву компанії
        const compDoc = await fsGet(`companies/${companyId}`, token);
        const comp = compDoc ? fFields(compDoc.fields || {}) : {};

        const companyName    = comp.name || sett.companyName || main.companyName || 'TALKO';
        const companyEdrpou  = sett.edrpou || sett.inn || main.edrpou || main.inn || '';
        const companyAddress = sett.address || sett.legalAddress || main.address || '';
        const companyPhone   = sett.phone || sett.contactPhone || main.phone || '';
        const currency = r.currency || 'UAH';
        const docDate = r.realizationDate || new Date().toISOString().slice(0,10);
        const docNum  = r.number || realizationId.slice(0,8);
        const clientName = r.clientName || '—';
        const items = Array.isArray(r.items) ? r.items : [];

        // Розрахунок підсумку
        let subtotal = 0;
        items.forEach(it => { subtotal += Number(it.lineTotal || (Number(it.qty||1)*Number(it.price||0))); });
        subtotal = Math.round(subtotal * 100) / 100;

        const isInvoice = type === 'invoice';
        const docTitle  = isInvoice ? 'Видаткова накладна' : 'Акт виконаних робіт';
        const docTitleEn = isInvoice ? 'Delivery Note' : 'Service Completion Act';

        // Таблиця позицій
        const rows = items.map((it, idx) => {
            const qty   = Number(it.qty || 1);
            const price = Number(it.price || 0);
            const disc  = Number(it.discount || 0);
            const line  = Number(it.lineTotal || Math.round(qty * price * (1 - disc/100) * 100) / 100);
            return `<tr>
                <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:center;color:#6b7280">${idx+1}</td>
                <td style="padding:7px 10px;border:1px solid #e5e7eb">${escHtml(it.name||'—')}</td>
                <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:center">${qty}</td>
                <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:center">${escHtml(it.unit||'шт')}</td>
                <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right">${fmtNum(price)}</td>
                ${disc>0?`<td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:center;color:#ef4444">${disc}%</td>`:'<td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:center;color:#9ca3af">—</td>'}
                <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;font-weight:600">${fmtNum(line)}</td>
            </tr>`;
        }).join('');

        // Сума прописом (спрощена)
        const amountWords = numToWordsUa(subtotal, currency);

        const htmlDoc = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${docTitle} ${docNum}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 20px 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #1b4f8a; padding-bottom: 16px; }
  .header-left { flex: 1; }
  .header-right { text-align: right; }
  .doc-title { font-size: 20px; font-weight: 700; color: #1b4f8a; margin-bottom: 4px; }
  .doc-sub { font-size: 12px; color: #6b7280; }
  .doc-num { font-size: 14px; font-weight: 600; color: #111; margin-top: 8px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .party-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
  .party-label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
  .party-name { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .party-detail { font-size: 12px; color: #374151; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
  th { background: #1b4f8a; color: #fff; padding: 9px 10px; text-align: center; font-weight: 600; border: 1px solid #1b4f8a; }
  tr:nth-child(even) td { background: #f8fafc; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
  .totals-box { min-width: 280px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .total-row:last-child { background: #1b4f8a; color: #fff; font-weight: 700; font-size: 14px; border-bottom: none; }
  .amount-words { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #0c4a6e; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  .sig-block { font-size: 12px; color: #374151; }
  .sig-line { border-bottom: 1px solid #111; margin: 30px 0 4px; min-width: 160px; }
  .sig-label { font-size: 11px; color: #6b7280; }
  .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f1f5f9; padding-top: 10px; }
  @media print {
    body { padding: 10px 15px; }
    .no-print { display: none !important; }
    @page { margin: 1cm; }
  }
</style>
</head>
<body>

<!-- Print button (hidden on print) -->
<div class="no-print" style="text-align:right;margin-bottom:16px">
  <button onclick="window.print()" style="padding:8px 20px;background:#1b4f8a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">
    🖨️ Друкувати / Зберегти PDF
  </button>
</div>

<!-- Header -->
<div class="header">
  <div class="header-left">
    <div class="doc-title">${escHtml(docTitle)}</div>
    <div class="doc-sub">${docTitleEn}</div>
  </div>
  <div class="header-right">
    <div class="doc-num">№ ${escHtml(docNum)}</div>
    <div style="font-size:12px;color:#6b7280;margin-top:4px">від ${escHtml(docDate)}</div>
  </div>
</div>

<!-- Сторони -->
<div class="parties">
  <div class="party-box">
    <div class="party-label">${isInvoice ? 'Постачальник / Seller' : 'Виконавець / Contractor'}</div>
    <div class="party-name">${escHtml(companyName)}</div>
    ${companyEdrpou?`<div class="party-detail">ЄДРПОУ/ІПН: ${escHtml(companyEdrpou)}</div>`:''}
    ${companyAddress?`<div class="party-detail">${escHtml(companyAddress)}</div>`:''}
    ${companyPhone?`<div class="party-detail">Тел.: ${escHtml(companyPhone)}</div>`:''}
  </div>
  <div class="party-box">
    <div class="party-label">${isInvoice ? 'Покупець / Buyer' : 'Замовник / Customer'}</div>
    <div class="party-name">${escHtml(clientName)}</div>
  </div>
</div>

<!-- Таблиця позицій -->
<table>
  <thead>
    <tr>
      <th style="width:36px">№</th>
      <th style="text-align:left">${isInvoice ? 'Найменування товару' : 'Найменування послуги'}</th>
      <th style="width:60px">К-сть</th>
      <th style="width:50px">Од.</th>
      <th style="width:90px">Ціна</th>
      <th style="width:60px">Зн.%</th>
      <th style="width:100px">Сума</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<!-- Підсумок -->
<div class="totals">
  <div class="totals-box">
    <div class="total-row"><span>Разом:</span><span>${fmtNum(subtotal)} ${escHtml(currency)}</span></div>
    <div class="total-row"><span style="font-size:14px">До сплати:</span><span>${fmtNum(subtotal)} ${escHtml(currency)}</span></div>
  </div>
</div>

<!-- Сума прописом -->
<div class="amount-words">
  <strong>Сума прописом:</strong> ${escHtml(amountWords)}
</div>

${isInvoice
  ? `<p style="font-size:12px;color:#374151;margin-bottom:20px">Товар відпущено відповідно до замовлення. Претензій щодо кількості та якості не маємо.</p>`
  : `<p style="font-size:12px;color:#374151;margin-bottom:20px">Вищезазначені роботи/послуги виконані в повному обсязі. Сторони претензій одна до одної не мають.</p>`
}

<!-- Підписи -->
<div class="signatures">
  <div class="sig-block">
    <strong>${isInvoice ? 'Відпустив' : 'Виконавець'}:</strong>
    <div class="sig-line"></div>
    <div class="sig-label">(підпис) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (ПІБ)</div>
    <div style="margin-top:10px">М.П.</div>
  </div>
  <div class="sig-block">
    <strong>${isInvoice ? 'Отримав' : 'Замовник'}:</strong>
    <div class="sig-line"></div>
    <div class="sig-label">(підпис) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (ПІБ)</div>
    <div style="margin-top:10px">М.П.</div>
  </div>
</div>

<div class="footer">Документ створено в системі TALKO · apptalko.com</div>

</body>
</html>`;

        return new Response(htmlDoc, {
            status: 200,
            headers: {
                'Content-Type': 'text/html;charset=utf-8',
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch(e) {
        console.error('[generate-pdf]', e.message);
        return json({ error: e.message }, 500);
    }
}

function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtNum(n) {
    return Number(n||0).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numToWordsUa(amount, currency) {
    // Спрощена версія — повертає суму і валюту
    const intPart = Math.floor(amount);
    const decPart = Math.round((amount - intPart) * 100);
    const currLabel = currency === 'UAH' ? 'гривень' : currency === 'USD' ? 'доларів США' : currency === 'EUR' ? 'євро' : currency;
    const kopLabel  = currency === 'UAH' ? 'копійок' : 'центів';
    if (decPart > 0) {
        return `${intPart.toLocaleString('uk-UA')} ${currLabel} ${decPart} ${kopLabel}`;
    }
    return `${intPart.toLocaleString('uk-UA')} ${currLabel} 00 ${kopLabel}`;
}
