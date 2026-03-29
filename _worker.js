// ============================================================
// TALKO OS — Cloudflare Pages Worker
// Routes: /s/:slug, /api/site, /api/ai-proxy, /api/webhook,
//         /api/booking, /api/stripe, /api/crm-form,
//         /api/crm-reminders, /api/warehouse, /api/funnel-ai
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
async function fsQuery(collId, filters, token, limit=1) {
    const body = { structuredQuery: {
        from: [{ collectionId: collId, allDescendants: true }],
        where: { compositeFilter: { op: 'AND', filters: filters.map(f=>({
            fieldFilter: { field:{fieldPath:f.field}, op:'EQUAL', value:{stringValue:f.value} }
        })) } },
        limit,
    }};
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
    const r = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({idToken:token}) }
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d.users?.[0] || null;
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

        // ── /api/crm-form ────────────────────────────────────
        if (path === '/api/crm-form') return handleCrmForm(request, env);

        // ── /api/booking ─────────────────────────────────────
        if (path === '/api/booking') return handleBooking(request, url, env);

        // ── /api/stripe ──────────────────────────────────────
        if (path.startsWith('/api/stripe')) return handleStripe(request, url, env);

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

    const { messages=[], model, systemPrompt, companyId, module:mod } = body;

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
                    max_tokens: 4096,
                    system: finalSystemPrompt||undefined,
                    messages: messages.filter(m=>m.role!=='system'),
                }),
            });
            const d = await r.json();
            if (!r.ok) return json({error:d.error?.message||'Anthropic error'},500);
            aiResp = { choices:[{ message:{ role:'assistant', content:d.content?.[0]?.text||'' } }] };
        } else {
            const r = await fetch('https://api.openai.com/v1/chat/completions', {
                method:'POST',
                headers:{ Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json' },
                body: JSON.stringify({ model:finalModel||'gpt-4o-mini', messages:finalMessages, max_tokens:4096 }),
            });
            const d = await r.json();
            if (!r.ok) return json({error:d.error?.message||'OpenAI error'},500);
            aiResp = d;
        }
        return json(aiResp);
    } catch(e) { return json({error:e.message},500); }
}

// ════════════════════════════════════════════════════════════
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
async function handleWebhook(request, url, env) {
    const channel = url.searchParams.get('channel')||'telegram';
    const cid     = url.searchParams.get('cid')||'';

    let token;
    try { token = await getToken(env); } catch(e) { return json({ok:false,error:'Firebase error'},500); }

    let body = {};
    try {
        const ct = request.headers.get('content-type')||'';
        if (ct.includes('json')) body = await request.json();
    } catch {}

    if (channel==='telegram') {
        const msg   = body.message||body.callback_query?.message||{};
        const chat  = msg.chat||body.callback_query?.from||{};
        const text  = msg.text||body.callback_query?.data||'';
        const chatId = String(chat.id||'');

        if (!chatId||!cid) return json({ok:true});

        // Get bot settings
        const settDoc = await fsGet(`companies/${cid}/settings/integrations`, token);
        if (!settDoc?.fields) return json({ok:true});
        const sett = fFields(settDoc.fields);
        const botToken = sett.telegramBotToken;
        if (!botToken) return json({ok:true});

        // Simple echo / CRM save
        const leadId  = `tg_${Date.now()}`;
        const name    = `${chat.first_name||''} ${chat.last_name||''}`.trim() || chat.username || chatId;

        await fsSet(`companies/${cid}/leads/${leadId}`, {
            id:        { stringValue: leadId },
            name:      { stringValue: name },
            phone:     { stringValue: '' },
            source:    { stringValue: 'telegram' },
            telegramChatId: { stringValue: chatId },
            message:   { stringValue: text },
            status:    { stringValue: 'new' },
            createdAt: { timestampValue: new Date().toISOString() },
        }, token);

        // Send ack
        if (botToken && text) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ chat_id: chatId, text: '✅ Дякуємо! Ваша заявка прийнята. Ми зв\'яжемося з вами найближчим часом.' }),
            }).catch(()=>{});
        }
        return json({ok:true});
    }

    // Other channels — just ack
    return json({ok:true, channel, received: true});
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
