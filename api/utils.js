// api/utils.js — Об'єднані утилітарні endpoints
// Роутинг по query param: ?action=ping|track|crm-form|whatsapp

const admin = require('firebase-admin');
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || 'ping';

    // ── PING ──────────────────────────────────────────────
    if (action === 'ping') {
        return res.status(200).json({ ok: true, ts: Date.now() });
    }

    // ── TRACK VISIT ───────────────────────────────────────
    if (action === 'track') {
        try {
            const { siteId, companyId, page, referrer, ua } = req.body || req.query;
            if (!siteId || !companyId) return res.status(400).json({ error: 'Missing params' });
            await db.collection('companies').doc(companyId)
                .collection('site_visits').add({
                    siteId, page: page || '/', referrer: referrer || '',
                    ua: ua || req.headers['user-agent'] || '',
                    ip: req.headers['x-forwarded-for'] || '',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            return res.status(200).json({ ok: true });
        } catch(e) { return res.status(500).json({ error: e.message }); }
    }

    // ── CRM FORM ──────────────────────────────────────────
    if (action === 'crm-form') {
        // Forward to crm-form logic
        return require('./crm-form')(req, res);
    }

    // ── WHATSAPP SEND ─────────────────────────────────────
    if (action === 'whatsapp') {
        return require('./whatsapp-send')(req, res);
    }

    return res.status(400).json({ error: 'Unknown action' });
};
