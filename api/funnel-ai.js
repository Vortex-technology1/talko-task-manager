// ============================================================
// api/funnel-ai.js — TALKO AI Funnel Proxy v1.0
// Vercel Serverless Function — проксі до OpenAI/Anthropic
// Ключ читається з Firebase Admin (ніколи не в браузері)
// ============================================================

const admin = require('firebase-admin');

// Firebase Admin init (singleton)
if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch (e) {}
    }
    if (pk && pk.includes('\\n')) pk = pk.replace(/\\n/g, '\n');

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: pk || undefined,
        }),
    });
}

const db = admin.firestore();

// Simple in-memory rate limiter (per IP, resets on cold start)
const ipRequests = new Map();
const RATE_LIMIT = 10;    // max requests
const RATE_WINDOW = 600000; // 10 minutes in ms

function checkRateLimit(ip) {
    const now = Date.now();
    const record = ipRequests.get(ip);
    if (!record || now - record.windowStart > RATE_WINDOW) {
        ipRequests.set(ip, { count: 1, windowStart: now });
        return true;
    }
    if (record.count >= RATE_LIMIT) return false;
    record.count++;
    return true;
}

module.exports = async function handler(req, res) {
    // ── CORS — тільки наш домен ─────────────────────────────
    const ALLOWED_ORIGINS = [
        'https://taskmanagerai-vert.vercel.app', // BUG 1 FIX: production domain was missing!
        'https://test-talko-task.vercel.app',
        'http://localhost:5500',
        'http://localhost:3000',
        'http://127.0.0.1:5500',
    ];
    // Also allow company custom domains (subdomain pattern)
    const _originOk = ALLOWED_ORIGINS.includes(origin)
        || /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)
        || /^https:\/\/[a-zA-Z0-9-]+\.talko\.biz$/.test(origin);
    const origin = req.headers.origin || '';
    if (_originOk) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // ── Firebase Auth: опціональний для публічних воронок ───
    // BUG 2 FIX: воронка публічна — анонімні відвідувачі не мають Firebase token
    // Перевіряємо token тільки якщо він є (захист від зловживань через rate limit)
    const authHeader = req.headers.authorization || '';
    let decodedToken = null;
    if (authHeader.startsWith('Bearer ')) {
        try {
            decodedToken = await admin.auth().verifyIdToken(authHeader.slice(7));
        } catch(e) {
            // Невалідний токен — продовжуємо без авторизації (rate limit захистить)
            console.warn('[funnel-ai] invalid token, continuing anonymously');
        }
    }

    // Rate limit
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ error: 'Забагато запитів. Спробуйте через 10 хвилин.' });
    }

    try {
        const { companyId, stepPrompt, leadData, provider, history, userMessage, model: reqModel } = req.body;

        if (!companyId) {
            return res.status(400).json({ error: 'companyId is required' });
        }

        // Get API key from Firebase (server-side only, never exposed to browser)
        let apiKey = null;
        let resolvedProvider = provider || 'openai';

        // First try company-level BYOK key
        const companyDoc = await db.collection('companies').doc(companyId).get();
        if (companyDoc.exists) {
            const compData = companyDoc.data();
            if (resolvedProvider === 'anthropic' && compData.anthropicApiKey) {
                apiKey = compData.anthropicApiKey;
            } else if (compData.openaiApiKey) {
                apiKey = compData.openaiApiKey;
                resolvedProvider = 'openai';
            }
        }

        // Fallback to global key
        if (!apiKey) {
            const globalDoc = await db.collection('settings').doc('ai').get();
            if (globalDoc.exists) {
                apiKey = globalDoc.data()?.openaiApiKey;
                resolvedProvider = 'openai';
            }
        }

        if (!apiKey) {
            return res.status(402).json({ error: 'API ключ не налаштований. Зверніться до адміністратора.' });
        }

        // BUG 3 FIX + BUG 4 FIX: build messages with real history + proper abort cleanup
        const leadSummary = leadData
            ? Object.entries(leadData)
                .filter(([k, v]) => v && !k.startsWith('_'))
                .map(([k, v]) => `${k}: ${String(v).slice(0, 200)}`)
                .join('\n')
            : '';

        const systemPrompt = [
            '[TALKO FUNNEL SYSTEM]',
            'Ти AI асистент воронки продажів. Відповідай коротко, тепло, по суті. Не більше 3-4 речень.',
            leadSummary ? `\nЗібрані дані клієнта:\n${leadSummary}` : '',
            '\n---',
            stepPrompt || 'Допоможи клієнту і запропонуй записатися на консультацію.',
        ].filter(Boolean).join('\n');

        // BUG 4 FIX: передаємо реальну історію чату (не пусту)
        // history = [{role:'user'|'assistant', content:'...'}]
        const safeHistory = Array.isArray(history) ? history.slice(-10) : [];
        // userMessage — останнє повідомлення юзера (якщо є), fallback для сумісності
        const lastUserMsg = userMessage || 'Допоможи мені з вибором.';

        // Timeout 45s — LLM може відповідати довго
        const _ctrl = new AbortController();
        const _tout = setTimeout(() => _ctrl.abort(), 45000);
        let responseText = '';

        if (resolvedProvider === 'anthropic') {
            // Anthropic Claude — BUG 4 FIX: real history + userMessage, BUG 3 FIX: clearTimeout
            const _clModel = reqModel || 'claude-haiku-4-5-20251001';
            const _clMessages = [
                ...safeHistory,
                { role: 'user', content: lastUserMsg },
            ];
            let _clResponse;
            try {
                _clResponse = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    signal: _ctrl.signal,
                    body: JSON.stringify({
                        model: _clModel,
                        max_tokens: 600,
                        system: systemPrompt,
                        messages: _clMessages,
                    })
                });
            } finally { clearTimeout(_tout); } // BUG 3 FIX

            if (!_clResponse.ok) {
                const err = await _clResponse.text();
                console.error('[funnel-ai] Anthropic error:', err.slice(0, 200));
                return res.status(502).json({ error: 'Помилка AI сервісу' });
            }
            const _clData = await _clResponse.json();
            responseText = _clData.content?.[0]?.text || 'Вибачте, спробуйте ще раз.';

        } else {
            // OpenAI / DeepSeek
            // BUG 3 FIX: clearTimeout в finally
            // BUG 4 FIX: передаємо реальну історію + userMessage
            const _oaModel = reqModel || 'gpt-4o-mini';
            const _oaMessages = [
                { role: 'system', content: systemPrompt },
                ...safeHistory,
                { role: 'user', content: lastUserMsg },
            ];
            let _oaResponse;
            try {
                _oaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    signal: _ctrl.signal,
                    body: JSON.stringify({
                        model: _oaModel,
                        max_tokens: 600,
                        temperature: 0.7,
                        messages: _oaMessages,
                    })
                });
            } finally { clearTimeout(_tout); } // BUG 3 FIX

            if (!_oaResponse.ok) {
                const err = await _oaResponse.text();
                console.error('[funnel-ai] OpenAI error:', err.slice(0, 200));
                return res.status(502).json({ error: 'Помилка AI сервісу' });
            }
            const _oaData = await _oaResponse.json();
            responseText = _oaData.choices?.[0]?.message?.content || 'Вибачте, спробуйте ще раз.';
        }

        return res.status(200).json({ response: responseText });

    } catch (error) {
        clearTimeout(_tout); // BUG 3 FIX: cleanup on any error path
        if (error.name === 'AbortError') {
            console.error('[funnel-ai] AI timeout 45s');
            return res.status(504).json({ error: 'AI відповідає надто довго. Спробуйте ще раз.' });
        }
        console.error('[funnel-ai] error:', error.message);
        return res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
};
