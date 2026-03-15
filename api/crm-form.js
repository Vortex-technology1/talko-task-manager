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
const _ipPending = new Set(); // Захист від race condition
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
    if (String(name).trim().length > 200) return res.status(400).json({ error: 'Ім\'я занадто довге' });
    if (!phone && !email) return res.status(400).json({ error: 'Вкажіть телефон або email' });
    if (phone  && String(phone).length  > 30)   return res.status(400).json({ error: 'Телефон занадто довгий' });
    if (email  && String(email).length  > 200)  return res.status(400).json({ error: 'Email занадто довгий' });
    if (message && String(message).length > 5000) return res.status(400).json({ error: 'Повідомлення занадто довге' });

    // Rate limit по IP (з захистом від race condition)
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

    // Перевірка паралельних запитів
    if (_ipPending.has(ip)) {
        return res.status(429).json({ error: 'Запит вже обробляється. Зачекайте.' });
    }

    // Перевірка rate limit
    const lastSubmit = _ipLastSubmit.get(ip);
    if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
        return res.status(429).json({ error: 'Зачекайте хвилину перед повторною відправкою' });
    }

    // Додаємо IP до pending (блокуємо паралельні запити)
    _ipPending.add(ip);

    // Перевіряємо що форма існує і активна
    const formRef  = db.doc(`companies/${companyId}/crm_forms/${formId}`);
    const formSnap = await formRef.get().catch(() => null);
    if (!formSnap?.exists) { _ipPending.delete(ip); return res.status(404).json({ error: 'Форму не знайдено' }); }

    const formData = formSnap.data();
    if (formData.disabled) { _ipPending.delete(ip); return res.status(403).json({ error: 'Форма деактивована' }); }

    const pipelineId = formData.pipelineId || null;
    const assigneeId = formData.assigneeId || null;

    // Якщо stageId не вказано в формі — беремо першу стадію з pipeline
    let stageId = formData.stageId || null;
    if (!stageId && pipelineId) {
        const pipSnap = await db.doc(`companies/${companyId}/crm_pipeline/${pipelineId}`).get().catch(() => null);
        const stages = pipSnap?.data()?.stages || [];
        stageId = stages.length ? (stages[0].id || 'new') : 'new';
    }
    if (!stageId) {
        // Fallback: беремо default pipeline
        const defPipSnap = await db.collection(`companies/${companyId}/crm_pipeline`)
            .where('isDefault', '==', true).limit(1).get().catch(() => null);
        if (defPipSnap && !defPipSnap.empty) {
            const stages = defPipSnap.docs[0].data()?.stages || [];
            stageId = stages.length ? (stages[0].id || 'new') : 'new';
        } else {
            stageId = 'new';
        }
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    try {
        // 1. Знаходимо або створюємо клієнта (по телефону)
        const clientsRef = db.collection(`companies/${companyId}/crm_clients`);
        let clientId = null;

        if (phone) {
            const cleanPhone = String(phone).replace(/\D/g, '');
            // FIX CRITICAL: query by phone field directly — не читаємо всю колекцію
            const byPhone = await clientsRef
                .where('phone', '==', phone).limit(1).get().catch(() => null);
            if (byPhone && !byPhone.empty) {
                clientId = byPhone.docs[0].id;
            } else if (cleanPhone.length >= 7) {
                // Fallback: пошук по нормалізованому номеру (без пробілів/дефісів)
                const byClean = await clientsRef
                    .where('phoneNormalized', '==', cleanPhone).limit(1).get().catch(() => null);
                if (byClean && !byClean.empty) clientId = byClean.docs[0].id;
            }
        }

        if (!clientId) {
            const clientDoc = await clientsRef.add({
                name:            String(name).trim().slice(0, 200),
                phone:           phone  ? String(phone).slice(0, 30)  : '',
                phoneNormalized: phone  ? String(phone).replace(/\D/g, '').slice(0, 20) : '',
                email:           email  ? String(email).slice(0, 200) : '',
                source:          source || formData.defaultSource || 'web_form',
                note:            message ? String(message).slice(0, 2000) : '',
                createdAt:       now,
                createdBy:       'form:' + formId,
            });
            clientId = clientDoc.id;
        }

        // 2. Перевіряємо чи є вже відкрита угода для цього клієнта
        let existingDealId = null;
        if (clientId) {
            const openDeal = await db.collection(`companies/${companyId}/crm_deals`)
                .where('clientId', '==', clientId)
                .where('status', '==', 'open')
                .limit(1).get().catch(() => null);
            if (openDeal && !openDeal.empty) {
                existingDealId = openDeal.docs[0].id;
                // Оновлюємо існуючу угоду — додаємо нотатку
                await db.collection(`companies/${companyId}/crm_deals`).doc(existingDealId).update({
                    updatedAt: now,
                    lastFormSubmit: now,
                }).catch(() => {});
                await db.collection(`companies/${companyId}/crm_deals`).doc(existingDealId)
                    .collection('history').add({
                        type: 'note',
                        text: `Повторна заявка з форми: ${formData.name || formId}${message ? '. ' + String(message).slice(0, 500) : ''}`,
                        by: 'form:' + formId,
                        at: now,
                    }).catch(() => {});
            }
        }

        // 3. Створюємо угоду (якщо немає відкритої)
        const dealsRef = db.collection(`companies/${companyId}/crm_deals`);
        let dealDoc = null;
        if (!existingDealId) dealDoc = await dealsRef.add({
            clientId:    clientId,
            clientName:  String(name).trim(),
            phone:       phone  || '',
            email:       email  || '',
            source:      source || formData.defaultSource || 'web_form',
            note:        message ? String(message).slice(0, 2000) : '',
            stage:       stageId,
            stageId:     stageId,
            pipelineId:  pipelineId,
            assigneeId:  assigneeId,
            assignedToId: assigneeId,
            creatorId:   'form:' + formId,
            tags:        [],
            amount:      0,
            createdAt:   now,
            updatedAt:   now,
            stageEnteredAt: now,
            leadFormId:  formId,
        });

        // 4. Лог створення в history (тільки для нової угоди)
        if (!existingDealId && dealDoc) {
        await dealDoc.collection('history').add({
            type: 'created',
            text: `Лід з форми: ${formData.name || formId}`,
            by:   'form:' + formId,
            at:   now,
        });

        } // end if (!existingDealId)

        // 5. Створюємо/оновлюємо contacts document для CRM чату
        try {
            const contactDocId = `form_${clientId}`;
            await db.collection(`companies/${companyId}/contacts`).doc(contactDocId).set({
                name:            String(name).trim(),
                phone:           phone || '',
                email:           email || '',
                source:          source || formData.defaultSource || 'web_form',
                channel:         'web_form',
                crmClientId:     clientId,
                lastMessage:     message ? String(message).slice(0, 500) : `Заявка з форми: ${formData.name || formId}`,
                lastMessageAt:   now,
                lastMessageFrom: 'user',
                unreadCount:     1,
                formId:          formId,
                createdAt:       now,
                updatedAt:       now,
            }, { merge: true });
        } catch(e) { console.warn('[crm-form] contacts doc:', e.message); }

        // 6. Лічильник заявок на формі
        await formRef.update({
            submitCount: admin.firestore.FieldValue.increment(1),
            lastSubmitAt: now,
        }).catch(() => {});

        // 6. Нотифікація власника/менеджера через Telegram
        try {
            const compSnap = await db.doc(`companies/${companyId}`).get().catch(() => null);
            const compData = compSnap?.data() || {};
            const tgToken = compData.adminBotToken || compData.botToken || null;
            const chatIds = [];
            if (compData.managerChatId) chatIds.push(String(compData.managerChatId));
            if (compData.telegramChatId && !chatIds.includes(String(compData.telegramChatId)))
                chatIds.push(String(compData.telegramChatId));

            if (tgToken && chatIds.length > 0) {
                const msgText = `🔔 Новий лід з форми!

Ім'я: ${String(name).trim()}
Телефон: ${phone || '-'}
Email: ${email || '-'}
Форма: ${formData.name || formId}
Повідомлення: ${message ? String(message).slice(0, 200) : '-'}`;
                for (const chatId of chatIds) {
                    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: chatId, text: msgText }),
                        signal: AbortSignal.timeout(8000),
                    }).catch(e => console.warn('[crm-form] tg notify:', e.message));
                }
            }
        } catch(e) { console.warn('[crm-form] notify error:', e.message); }

        return res.status(200).json({
            ok: true,
            dealId:   dealDoc?.id || existingDealId || null, // FIX: dealDoc is null when existing deal found
            clientId: clientId,
            message:  formData.successMessage || 'Дякуємо! Ми зв\'яжемось з вами найближчим часом.',
        });

    } catch (e) {
        console.error('[crm-form]', e.message);
        return res.status(500).json({ error: 'Серверна помилка. Спробуйте пізніше.' });
    } finally {
        // Очищаємо pending і оновлюємо timestamp (тільки якщо запит пройшов валідацію)
        _ipPending.delete(ip);
        _ipLastSubmit.set(ip, Date.now());
    }
};
