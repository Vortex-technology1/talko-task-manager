// ============================================================
// api/ai-proxy.js — TALKO Universal AI Proxy v1.0
// Vercel Serverless Function
//
// Ключ НІКОЛИ не йде в браузер:
//   1. companies/{cid}/settings/ai → openaiApiKey  (компанія)
//   2. superadmin/settings         → openaiApiKey  (платформа)
//
// Flow: Browser → POST /api/ai-proxy
//   { messages[], model?, systemPrompt?, companyId, module }
//   + Authorization: Bearer <Firebase ID Token>
//   → verifyIdToken → verify member → get key → call OpenAI
//   → return { text }
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
const RATE_LIMIT  = 30;      // max requests per window
const RATE_WINDOW = 60000;   // 1 хвилина

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

// ── Get API key (company → superadmin → env fallback) ───────
async function getApiKey(companyId) {
    // 1. Ключ компанії
    try {
        const snap = await db
            .doc(`companies/${companyId}/settings/ai`)
            .get();
        const key = snap.data()?.openaiApiKey;
        if (key) return key;
    } catch(_) {}

    // 2. Платформний ключ суперадміна
    try {
        const snap = await db.doc('superadmin/settings').get();
        const key = snap.data()?.openaiApiKey;
        if (key) return key;
    } catch(_) {}

    // 3. Vercel ENV fallback
    return process.env.OPENAI_API_KEY || '';
}

// ── Main handler ─────────────────────────────────────────────
module.exports = async function handler(req, res) {
    // CORS
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
        messages,       // [{ role, content }]
        systemPrompt,   // опційно — додається як system message
        model,          // default: gpt-4o-mini
        maxTokens,      // default: 800
        module: mod,    // для логування: 'incidents'|'finance'|'coordination'|'flow'
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

    // Get key
    const apiKey = await getApiKey(companyId);
    if (!apiKey) {
        return res.status(400).json({
            error: 'OpenAI ключ не налаштований. Зверніться до адміністратора платформи.'
        });
    }

    // Build messages
    const finalMessages = [];
    if (systemPrompt) {
        finalMessages.push({ role: 'system', content: systemPrompt });
    }
    finalMessages.push(...messages);

    // Call OpenAI
    let text;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model:      model      || 'gpt-4o-mini',
                max_tokens: maxTokens  || 800,
                temperature: 0.3,
                messages: finalMessages,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[ai-proxy:${mod}] OpenAI error:`, response.status, JSON.stringify(data).slice(0, 200));
            return res.status(502).json({
                error: 'OpenAI API error: ' + (data.error?.message || response.status)
            });
        }

        text = data.choices?.[0]?.message?.content || '';
        if (!text) return res.status(502).json({ error: 'Порожня відповідь від OpenAI' });

    } catch(e) {
        console.error(`[ai-proxy:${mod}] fetch error:`, e.message);
        return res.status(500).json({ error: 'Network error: ' + e.message });
    }

    // Log usage (опційно)
    console.log(`[ai-proxy] module=${mod} uid=${uid} company=${companyId} model=${model||'gpt-4o-mini'}`);

    return res.status(200).json({ text });
};
