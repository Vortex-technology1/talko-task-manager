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
async function getToken(env) {
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

        // ── /api/ping ────────────────────────────────────────
        if (path === '/api/ping') return json({ ok:true, ts:Date.now() });

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
        // Якщо немає в settings — шукаємо в bots
        if (!botTokenForSend && contact.botId) {
            const botDoc = await fsGet(`companies/${companyId}/bots/${contact.botId}`, token);
            if (botDoc?.fields) {
                const bd = fFields(botDoc.fields);
                botTokenForSend = bd.token || '';
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
        const text   = (msg.text||body.callback_query?.data||'').trim();
        const chatId = String(chat.id||'');
        const from   = msg.from || body.callback_query?.from || {};

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

        if (!contact) {
            contact = {
                chatId, name: userName, username: from.username||'',
                source: 'telegram', status: 'subscriber',
                currentFlowId: '', currentNodeId: '',
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
                collectedData: { mapValue: { fields: {} } },
                unreadCount:   { integerValue: '0' },
                createdAt:     { timestampValue: new Date().toISOString() },
                updatedAt:     { timestampValue: new Date().toISOString() },
            }, token);
        }

        // DEBUG: підтверджуємо що webhook отримав повідомлення

        // Зберігаємо повідомлення в лог чату
        const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
        await fsSet(`${contactPath}/messages/${msgId}`, {
            id:        { stringValue: msgId },
            role:      { stringValue: 'user' },
            text:      { stringValue: text },
            isCallback:{ booleanValue: isCallback },
            createdAt: { timestampValue: new Date().toISOString() },
        }, token);

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

        // Запускаємо Flow Engine якщо є активний flow
        if (activeFlowId) {
            const parts = activeFlowId.split('::');
            const botId = parts[0], flowId = parts[1];
            if (botId && flowId) {
                try {
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

    // Other channels — just ack
    return json({ok:true, channel, received: true});
}


// ════════════════════════════════════════════════════════════
// FLOW ENGINE — виконання ланцюгів ботів
// ════════════════════════════════════════════════════════════
async function runFlowEngine({ cid, chatId, botId, flowId, currentNodeId, text, isCallback, callbackData, contact, contactPath, token, botToken, from, userName, tgSend, env }) {
    // Завантажуємо вузли з flow document (nodes зберігаються як Firestore array)
    const flowSnap = await fetch(
        `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/bots/${botId}/flows/${flowId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    let nodes = [], edges = [];
    if (flowSnap.ok) {
        const fd = await flowSnap.json();
        if (fd.fields) {
            const raw = fFields(fd.fields);
            nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
            edges = Array.isArray(raw.edges) ? raw.edges : [];
        }
    }
    await tgSend(chatId, `📊 nodes:${nodes.length} edges:${edges.length} nodeId:${currentNodeId||'none'}`);
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

    await tgSend(chatId, `🔍 currentNode: ${currentNode?.id} type:${currentNode?.type}`);
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
    await tgSend(chatId, `🔍 nodeType:${nodeType} id:${currentNode.id}`);
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
            await executeNode({ node: nextNode, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName });
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

async function executeNode({ node, nodes, edges, cid, chatId, botId, flowId, contact, contactPath, collectedData, token, botToken, tgSend, env, userName, userInput }) {
    const nodeType = node.type || node.data?.type || '';
    const nodeData = node.data || node;

    // ── ВУЗОЛ: ПОВІДОМЛЕННЯ ──────────────────────────────────
    if (nodeType === 'message' || nodeType === 'sendMessage') {
        const msgText = nodeData.text || nodeData.message || nodeData.content || '';
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
        await fsSet(`companies/${cid}/contacts/${chatId}/messages/${bmId}`, {
            id:        { stringValue: bmId },
            role:      { stringValue: 'bot' },
            text:      { stringValue: msgText },
            createdAt: { timestampValue: new Date().toISOString() },
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
    if (nodeType === 'ai_agent' || nodeType === 'aiAgent' || nodeType === 'AI') {
        // Завантажуємо промпт вузла
        let systemPrompt = nodeData.systemPrompt || nodeData.aiSystem || nodeData.prompt || '';
        const aiProvider = nodeData.aiProvider || 'openai';
        const aiModel    = nodeData.model || 'gpt-4o-mini';
        const maxTokens  = nodeData.maxTokens || 1500;
        const writesFirst = nodeData.writesFirst || nodeData.firstMessageEnabled || nodeData.botWritesFirst || false;
        const firstMessage = nodeData.firstMessage || '';
        const historyLimit = nodeData.historyLimit ?? 14;

        // Якщо є окремий документ з промптом
        if (!systemPrompt) {
            const promptDoc = await fsGet(
                `companies/${cid}/bots/${botId}/flows/${flowId}/nodePrompts/${node.id}`, token
            );
            if (promptDoc?.fields) {
                const pd = fFields(promptDoc.fields);
                systemPrompt = pd.systemPrompt || pd.aiSystem || pd.prompt || '';
            }
        }

        // Якщо бот пише першим і немає userInput — надсилаємо привітання від ШІ
        if (writesFirst && !userInput) {
            let openaiKey = '';
            let botModel2 = 'gpt-4o-mini';
            let botMaxTokens2 = 1500;
            let botTemperature2 = 0.7;
            const platDoc2 = await fsGet(`settings/platform`, token);
            if (platDoc2?.fields) {
                const plat2 = fFields(platDoc2.fields);
                openaiKey = plat2.openaiApiKey || '';
                if (plat2.botModel) botModel2 = plat2.botModel;
                if (plat2.botMaxTokens) botMaxTokens2 = parseInt(plat2.botMaxTokens) || 1500;
                if (plat2.botTemperature !== undefined) botTemperature2 = parseFloat(plat2.botTemperature) || 0.7;
            }
            if (!openaiKey) openaiKey = env.OPENAI_API_KEY || '';
            if (!openaiKey) {
                const aiSettDoc2 = await fsGet(`settings/ai`, token);
                if (aiSettDoc2?.fields) {
                    const aiSett2 = fFields(aiSettDoc2.fields);
                    openaiKey = aiSett2.openaiApiKey || aiSett2.apiKey || '';
                }
            }
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
                    await fsSet(`companies/${cid}/contacts/${chatId}/messages/${bm}`, {
                        id:{ stringValue:bm }, role:{ stringValue:'bot' },
                        text:{ stringValue:aiResp },
                        createdAt:{ timestampValue:new Date().toISOString() },
                    }, token);
                    // Перевіряємо чи ШІ кваліфікував ліда
                    await checkAndConvertToLead({ aiResponse: aiResp, userInput: '', collectedData, cid, chatId, contact, contactPath, token });
                }
            }
            return;
        }

        if (!userInput) return;

        // Завантажуємо історію чату для контексту
        const histSnap = await fetch(
            `https://firestore.googleapis.com/v1/projects/task-manager-44e84/databases/(default)/documents/companies/${cid}/contacts/${chatId}/messages?pageSize=20&orderBy=createdAt`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        let chatHistory = [];
        if (histSnap.ok) {
            const hd = await histSnap.json();
            for (const doc of (hd.documents||[]).slice(-(historyLimit * 2 || 24))) {
                const d = fFields(doc.fields||{});
                if (d.role === 'user') chatHistory.push({ role:'user', content: d.text||'' });
                else if (d.role === 'bot') chatHistory.push({ role:'assistant', content: d.text||'' });
            }
        }
        // Додаємо поточне повідомлення
        chatHistory.push({ role: 'user', content: userInput });

        // Ключ і параметри від superadmin: завжди читаємо settings/platform
        let openaiKey = '';
        let botModel = 'gpt-4o-mini';
        let botMaxTokens = 1500;
        let botTemperature = 0.7;

        const platDoc = await fsGet(`settings/platform`, token);
        if (platDoc?.fields) {
            const plat = fFields(platDoc.fields);
            openaiKey = plat.openaiApiKey || '';
            if (plat.botModel) botModel = plat.botModel;
            if (plat.botMaxTokens) botMaxTokens = parseInt(plat.botMaxTokens) || 1500;
            if (plat.botTemperature !== undefined) botTemperature = parseFloat(plat.botTemperature) || 0.7;
        }
        // Fallback: env var
        if (!openaiKey) openaiKey = env.OPENAI_API_KEY || '';
        // Fallback: settings/ai (старе місце)
        if (!openaiKey) {
            const aiSettDoc = await fsGet(`settings/ai`, token);
            if (aiSettDoc?.fields) {
                const aiSett = fFields(aiSettDoc.fields);
                openaiKey = aiSett.openaiApiKey || aiSett.apiKey || '';
            }
        }
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
            await tgSend(chatId, aiResp);
            const bm = `msg_${Date.now()}_bot`;
            await fsSet(`companies/${cid}/contacts/${chatId}/messages/${bm}`, {
                id:{ stringValue:bm }, role:{ stringValue:'bot' },
                text:{ stringValue:aiResp },
                createdAt:{ timestampValue:new Date().toISOString() },
            }, token);
            await checkAndConvertToLead({ aiResponse: aiResp, userInput, collectedData, cid, chatId, contact, contactPath, token });
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

    // ── ВУЗОЛ: КІНЕЦЬ ───────────────────────────────────────
    if (nodeType === 'end' || nodeType === 'finish') {
        await fsPatch(`companies/${cid}/contacts/${chatId}`, {
            currentFlowId: { stringValue: '' },
            currentNodeId: { stringValue: '' },
            updatedAt:     { timestampValue: new Date().toISOString() },
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
