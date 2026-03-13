// ============================================================
// api/crm-form.js — Публічна форма ліда → угода в CRM
//
// POST /api/crm-form
// Body: { formId, companyId, name, phone, email, message, source }
//
// Без авторизації — публічний ендпоінт.
// Захист: formId перевіряється в Firestore (companies/{id}/crm_forms/{formId})
// Rate limit: по IP через заголовок x-forwarded-for
// ============================================================

const admin = require('firebase-admin');

if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    pk = pk.replace(/\\n/g, '\n');
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId:   process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey:  pk || undefined,
        }),
    });
}

const db = admin.firestore();

// Простий in-memory rate limit (1 submit / IP / 60s)
const _ipLastSubmit = new Map();
const RATE_LIMIT_MS = 60 * 1000;

const ALLOWED_ORIGINS_RE = /^https?:\/\//; // будь-який сайт (публічна форма)

module.exports = async function handler(req, res) {
    // CORS — дозволяємо будь-який origin (форма вставляється на клієнтський сайт)
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    const { formId, companyId, name, phone, email, message, source } = req.body || {};

    // Валідація обов'язкових полів
    if (!formId || !companyId) return res.status(400).json({ error: 'formId і companyId обовʼязкові' });
    if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'Вкажіть ім\'я' });
    if (!phone && !email) return res.status(400).json({ error: 'Вкажіть телефон або email' });

    // Rate limit по IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const lastSubmit = _ipLastSubmit.get(ip);
    if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
        return res.status(429).json({ error: 'Зачекайте хвилину перед повторною відправкою' });
    }
    _ipLastSubmit.set(ip, Date.now());

    // Перевіряємо що форма існує і активна
    const formRef  = db.doc(`companies/${companyId}/crm_forms/${formId}`);
    const formSnap = await formRef.get().catch(() => null);
    if (!formSnap?.exists) return res.status(404).json({ error: 'Форму не знайдено' });

    const formData = formSnap.data();
    if (formData.disabled) return res.status(403).json({ error: 'Форма деактивована' });

    const pipelineId = formData.pipelineId || null;
    const stageId    = formData.stageId    || 'new';
    const assigneeId = formData.assigneeId || null;

    const now = admin.firestore.FieldValue.serverTimestamp();

    try {
        // 1. Знаходимо або створюємо клієнта (по телефону)
        const clientsRef = db.collection(`companies/${companyId}/crm_clients`);
        let clientId = null;

        if (phone) {
            const cleanPhone = String(phone).replace(/\D/g, '');
            const existSnap = await clientsRef.get().catch(() => null);
            if (existSnap) {
                const existing = existSnap.docs.find(d => (d.data().phone||'').replace(/\D/g,'') === cleanPhone);
                if (existing) clientId = existing.id;
            }
        }

        if (!clientId) {
            const clientDoc = await clientsRef.add({
                name:      String(name).trim(),
                phone:     phone  || '',
                email:     email  || '',
                source:    source || formData.defaultSource || 'web_form',
                note:      message || '',
                createdAt: now,
                createdBy: 'form:' + formId,
            });
            clientId = clientDoc.id;
        }

        // 2. Створюємо угоду
        const dealsRef = db.collection(`companies/${companyId}/crm_deals`);
        const dealDoc  = await dealsRef.add({
            clientId:    clientId,
            clientName:  String(name).trim(),
            phone:       phone  || '',
            email:       email  || '',
            source:      source || formData.defaultSource || 'web_form',
            note:        message || '',
            stage:       stageId,
            pipelineId:  pipelineId,
            assigneeId:  assigneeId,
            creatorId:   'form:' + formId,
            tags:        [],
            amount:      0,
            createdAt:   now,
            updatedAt:   now,
            stageEnteredAt: now,
            leadFormId:  formId,
        });

        // 3. Лог створення в history
        await dealDoc.collection('history').add({
            type: 'created',
            text: `Лід з форми: ${formData.name || formId}`,
            by:   'form:' + formId,
            at:   now,
        });

        // 4. Лічильник заявок на формі
        await formRef.update({
            submitCount: admin.firestore.FieldValue.increment(1),
            lastSubmitAt: now,
        }).catch(() => {});

        return res.status(200).json({
            ok: true,
            dealId:   dealDoc.id,
            clientId: clientId,
            message:  formData.successMessage || 'Дякуємо! Ми зв\'яжемось з вами найближчим часом.',
        });

    } catch (e) {
        console.error('[crm-form]', e.message);
        return res.status(500).json({ error: 'Серверна помилка. Спробуйте пізніше.' });
    }
};
