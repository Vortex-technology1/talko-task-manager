// ============================================================
// api/ai-proxy.js — TALKO Universal AI Proxy v2.0
// Vercel Serverless Function
//
// Ключ:   superadmin/settings.openaiApiKey  (платформа)
//         companies/{cid}/settings/ai.openaiApiKey (компанія)
// Промпт: superadmin/settings.agents.{module}.systemPrompt
//         fallback → systemPrompt з запиту
//
// Flow: Browser → POST /api/ai-proxy
//   { messages[], model?, systemPrompt?, companyId, module }
//   + Authorization: Bearer <Firebase ID Token>
// ============================================================

const admin = require('firebase-admin');

// ── Firebase Admin (singleton) ──────────────────────────────
if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
    }
    if (pk && pk.includes('\\n')) pk = pk.replace(/\\n/g, '\n');
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId:   process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey:  pk || undefined,
        }),
    });
}
const db = admin.firestore();

// ── CORS ────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'https://taskmanagerai-vert.vercel.app',
    'https://test-talko-task.vercel.app',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
];

// ── Rate limit (per uid, in-memory) ─────────────────────────
const uidRequests = new Map();
const RATE_LIMIT  = 30;
const RATE_WINDOW = 60000;

function checkRateLimit(uid) {
    const now = Date.now();
    const r = uidRequests.get(uid);
    if (!r || now - r.t > RATE_WINDOW) {
        uidRequests.set(uid, { count: 1, t: now });
        return true;
    }
    if (r.count >= RATE_LIMIT) return false;
    r.count++;
    return true;
}

// ── Superadmin settings cache (10 хв) ───────────────────────
let _saCache = null;
let _saCacheAt = 0;
const SA_CACHE_TTL = 10 * 60 * 1000;

async function getSuperadminSettings() {
    const now = Date.now();
    if (_saCache && now - _saCacheAt < SA_CACHE_TTL) return _saCache;
    try {
        const snap = await db.doc('settings/platform').get();
        _saCache = snap.exists ? snap.data() : {};
        _saCacheAt = now;
        return _saCache;
    } catch(_) { return {}; }
}

// ── Get API key ──────────────────────────────────────────────
async function getApiKey(companyId, saSettings) {
    // 1. Ключ компанії — Anthropic пріоритет, потім OpenAI
    try {
        const snap = await db.doc(`companies/${companyId}/settings/ai`).get();
        const d = snap.data() || {};
        if (d.anthropicApiKey) return { key: d.anthropicApiKey, provider: 'anthropic' };
        if (d.openaiApiKey)    return { key: d.openaiApiKey,    provider: 'openai' };
    } catch(_) {}
    // 2. Платформний ключ суперадміна
    if (saSettings.anthropicApiKey) return { key: saSettings.anthropicApiKey, provider: 'anthropic' };
    if (saSettings.openaiApiKey)    return { key: saSettings.openaiApiKey,    provider: 'openai' };
    // 3. Vercel ENV fallback
    if (process.env.ANTHROPIC_API_KEY) return { key: process.env.ANTHROPIC_API_KEY, provider: 'anthropic' };
    return { key: process.env.OPENAI_API_KEY || '', provider: 'openai' };
}

// ── Main handler ─────────────────────────────────────────────
module.exports = async function handler(req, res) {
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    // Auth
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: missing Bearer token' });
    }
    let uid;
    try {
        const decoded = await admin.auth().verifyIdToken(authHeader.slice(7));
        uid = decoded.uid;
    } catch(e) {
        return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }

    // Rate limit
    if (!checkRateLimit(uid)) {
        return res.status(429).json({ error: 'Too many requests. Зачекайте хвилину.' });
    }

    // Params
    const {
        companyId,
        messages,
        systemPrompt: clientSystemPrompt,
        model: clientModel,
        maxTokens,
        module: mod,
    } = req.body || {};

    if (!companyId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'companyId і messages[] обовʼязкові' });
    }

    // Verify company member
    try {
        const memberSnap = await db.doc(`companies/${companyId}/users/${uid}`).get();
        if (!memberSnap.exists) {
            return res.status(403).json({ error: 'Forbidden: not a company member' });
        }
    } catch(e) {
        return res.status(403).json({ error: 'Forbidden: cannot verify membership' });
    }

    // Superadmin settings (ключ + агенти)
    const saSettings = await getSuperadminSettings();

    // Get API key
    const { key: apiKey, provider } = await getApiKey(companyId, saSettings);
    if (!apiKey) {
        return res.status(400).json({
            error: 'API ключ не налаштований. Зверніться до адміністратора платформи.'
        });
    }

    // ── Читаємо профіль компанії ─────────────────────────────
    let companyContext = '';
    try {
        const [compSnap, finSnap] = await Promise.all([
            db.doc(`companies/${companyId}`).get(),
            db.doc(`companies/${companyId}/finance_settings/main`).get(),
        ]);

        const c  = compSnap.exists  ? compSnap.data()  : {};
        const fs = finSnap.exists   ? finSnap.data()   : {};

        const lines = [];
        if (c.name)            lines.push(`Компанія: ${c.name}`);
        if (c.niche)           lines.push(`Ніша: ${c.niche}`);
        if (fs.currency || c.currency) lines.push(`Валюта: ${fs.currency || c.currency}`);
        if (fs.region  || c.region)    lines.push(`Регіон: ${fs.region  || c.region}`);
        if (c.companyGoal)     lines.push(`Мета компанії: ${c.companyGoal}`);
        if (c.companyConcept)  lines.push(`Задум: ${c.companyConcept}`);
        if (c.companyCKP)      lines.push(`ЦКП: ${c.companyCKP}`);
        if (c.companyIdeal)    lines.push(`Ідеальна картина: ${c.companyIdeal}`);

        if (lines.length) {
            companyContext = `КОНТЕКСТ КОМПАНІЇ (використовуй при аналізі):\n${lines.join('\n')}\n`;
        }
    } catch(e) {
        console.warn(`[ai-proxy] company profile read error:`, e.message);
    }

    // Промпт агента: superadmin → fallback на клієнтський
    const agentSettings = saSettings.agents?.[mod] || {};
    const agentPrompt   = agentSettings.systemPrompt || clientSystemPrompt || '';
    const model         = agentSettings.model        || clientModel        || 'gpt-4o-mini';

    // Фінальний системний промпт = контекст компанії + промпт агента
    const systemPrompt = [companyContext, agentPrompt].filter(Boolean).join('\n---\n') || null;

    // Build messages
    const finalMessages = [];
    if (systemPrompt) finalMessages.push({ role: 'system', content: systemPrompt });
    finalMessages.push(...messages);

    // Call AI (Anthropic або OpenAI)
    let text;
    // FIX: _ctrl/_tout поза try — доступні в catch/finally
    const _ctrl = new AbortController();
    const _tout = setTimeout(() => _ctrl.abort(), 55000);
    try {
        let response, data;

        if (provider === 'anthropic') {
            // Anthropic API — system prompt окремим полем
            const anthropicMsgs = finalMessages.filter(m => m.role !== 'system');
            const sysContent = finalMessages.find(m => m.role === 'system')?.content || '';
            const anthropicModel = /^claude/.test(model) ? model : 'claude-haiku-4-5-20251001';
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                signal: _ctrl.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: anthropicModel,
                    max_tokens: maxTokens || 800,
                    ...(sysContent ? { system: sysContent } : {}),
                    messages: anthropicMsgs,
                }),
            });
            data = await response.json();
            if (!response.ok) {
                console.error(`[ai-proxy:${mod}] Anthropic error:`, response.status, JSON.stringify(data).slice(0, 200));
                return res.status(502).json({ error: 'Anthropic API error: ' + (data.error?.message || response.status) });
            }
            text = data.content?.[0]?.text || '';
        } else {
            // OpenAI API
            const isNewModel = /^(o[1-9]|gpt-4\.1|gpt-5)/.test(model);
            const bodyObj = { model, messages: finalMessages };
            bodyObj[isNewModel ? 'max_completion_tokens' : 'max_tokens'] = maxTokens || 800;
            if (!isNewModel) bodyObj.temperature = 0.3;
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                signal: _ctrl.signal,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify(bodyObj),
            });
            data = await response.json();
            if (!response.ok) {
                console.error(`[ai-proxy:${mod}] OpenAI error:`, response.status, JSON.stringify(data).slice(0, 200));
                return res.status(502).json({ error: 'OpenAI API error: ' + (data.error?.message || response.status) });
            }
            text = data.choices?.[0]?.message?.content || '';
        }

        if (!text) return res.status(502).json({ error: 'Порожня відповідь від AI' });

    } catch(e) {
        const isTimeout = e.name === 'AbortError';
        console.error(`[ai-proxy:${mod}]`, isTimeout ? 'TIMEOUT 55s' : 'fetch error: ' + e.message);
        return res.status(isTimeout ? 504 : 500).json({ error: isTimeout ? 'AI timeout. Спробуйте ще раз.' : 'Network error: ' + e.message });
    } finally {
        clearTimeout(_tout); // FIX: завжди чистимо таймер
        // FIX: очищаємо старі записи rate limit (memory leak prevention)
        if (uidRequests.size > 1000) {
            const _now = Date.now();
            for (const [k, v] of uidRequests) {
                if (_now - v.t > RATE_WINDOW) uidRequests.delete(k);
            }
        }
    }

    console.log(`[ai-proxy] module=${mod} uid=${uid} company=${companyId} model=${model}`);
    return res.status(200).json({ text });
};

