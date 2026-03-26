// ============================================================
// api/whatsapp-send.js — WhatsApp Business outbound (360dialog)
//
// POST /api/whatsapp-send
// Body: { phone, message, companyId }
// Auth: internal Vercel function — перевіряє companyId
//
// Провайдер: 360dialog (https://www.360dialog.com)
// API docs:  https://docs.360dialog.com/whatsapp-api/whatsapp-api/messaging
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
                projectId:   process.env.FIREBASE_PROJECT_ID   || 'taskmanagerai',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  pk || undefined,
            }),
        });
    } catch(e) {
        console.error('[whatsapp-send] Firebase init error:', e.message);
    }
}

const db = admin.firestore();

// ── Відправка повідомлення через 360dialog API ─────────────
async function sendVia360dialog(apiKey, phone, message) {
    // Очищаємо номер — лише цифри, без +
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) throw new Error('Invalid phone number');

    const body = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: message.slice(0, 4096) },
    };

    const res = await fetch('https://waba.360dialog.io/v1/messages', {
        method: 'POST',
        headers: {
            'D360-API-KEY': apiKey,
            'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
        const errMsg = data.error?.message || data.message || JSON.stringify(data);
        return { ok: false, error: errMsg, raw: data };
    }
    return { ok: true, messageId: data.messages?.[0]?.id, raw: data };
}

// ── Логування відправки в Firestore ───────────────────────
async function logMessage(companyId, phone, message, result, dealId) {
    try {
        await db.collection('companies').doc(companyId)
            .collection('whatsapp_logs').add({
                phone,
                message: message.slice(0, 500),
                ok:      result.ok,
                error:   result.error || null,
                messageId: result.messageId || null,
                dealId:  dealId || null,
                sentAt:  admin.firestore.FieldValue.serverTimestamp(),
            });
    } catch(e) {
        console.warn('[whatsapp-send] log error:', e.message);
    }
}

// ── Основний handler ───────────────────────────────────────
module.exports = async function handler(req, res) {
    // CORS для внутрішніх Vercel функцій
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // ── Auth: Firebase ID token обов'язковий ─────────────────
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

    const { phone, message, companyId, dealId } = req.body || {};

    if (!phone || !message || !companyId) {
        return res.status(400).json({ error: 'phone, message, companyId are required' });
    }

    try {
        // ── Verify: user belongs to this company ──────────────
        const memberSnap = await db.doc(`companies/${companyId}/users/${uid}`).get();
        if (!memberSnap.exists) {
            return res.status(403).json({ error: 'Forbidden: not a company member' });
        }

        // Читаємо API ключ компанії з Firestore
        const settingsDoc = await db.collection('companies').doc(companyId)
            .collection('settings').doc('integrations').get();

        if (!settingsDoc.exists) {
            return res.status(400).json({ ok: false, error: 'WhatsApp не налаштовано для цієї компанії' });
        }

        const apiKey = settingsDoc.data()?.whatsappApiKey;
        // X-WA-KEY override тільки для тест-кнопки — auth вже перевірена вище
        const apiKeyToUse = req.headers['x-wa-key'] || apiKey;
        if (!apiKeyToUse) {
            return res.status(400).json({ ok: false, error: 'WhatsApp API Key відсутній. Налаштуйте в Integrations.' });
        }

        // Відправляємо
        const result = await sendVia360dialog(apiKeyToUse, phone, message);

        // Логуємо
        await logMessage(companyId, phone, message, result, dealId || null);

        return res.status(200).json(result);

    } catch(e) {
        console.error('[whatsapp-send] error:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
    }
};
