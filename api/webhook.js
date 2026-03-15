// ============================================================
// TALKO Universal Webhook — Vercel Serverless v4 FINAL
// ============================================================

const admin = require('firebase-admin');

let initError = null;
if (!admin.apps.length) {
    try {
        let pk = process.env.FIREBASE_PRIVATE_KEY || '';
        pk = pk.replace(/\\n/g, '\n');
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: pk || undefined,
            }),
        });
    } catch(e) { initError = e.message; }
}
const db = initError ? null : admin.firestore();

// ── Auth helper ─────────────────────────────────────────
async function _verifyAuth(req) {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return null;
    try {
        return await admin.auth().verifyIdToken(h.slice(7));
    } catch { return null; }
}

module.exports = async (req, res) => {
    // ── GET: діагностика ─────────────────────────────────────
    if (req.method === 'GET') {
        // Diagnostic endpoint — захищений токеном (DIAG_TOKEN в env)
        const diagToken = process.env.DIAG_TOKEN;
        const reqToken  = req.headers['x-diag-token'] || req.query?.token;
        if (!diagToken || reqToken !== diagToken) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const diag = { ok: true, initError: initError || null, env: {
            hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        }};
        try {
            if (!db) throw new Error('DB not initialized');
            await db.collection('companies').limit(1).get();
            diag.firebase = 'connected';
        } catch(e) { diag.firebase = 'ERROR: ' + e.message; }
        return res.status(200).json(diag);
    }

    if (req.method !== 'POST') return res.status(405).end();

    // ── POST /api/webhook?action=send-message ────────────────
    // Відправка повідомлення від менеджера через бота
    if (req.query.action === 'send-message') {
        const _authUser = await _verifyAuth(req);
        if (!_authUser) return res.status(401).json({ error: 'Unauthorized' });
        return handleSendMessage(req, res, _authUser);
    }

    // ── POST /api/webhook?action=mark-read ──────────────────
    // Позначити повідомлення як прочитані
    if (req.query.action === 'mark-read') {
        const _authUser2 = await _verifyAuth(req);
        if (!_authUser2) return res.status(401).json({ error: 'Unauthorized' });
        req._authUid = _authUser2.uid;
        return handleMarkRead(req, res);
    }

    const { companyId, channel } = req.query;
    if (!companyId || !channel) return res.status(400).json({ error: 'Missing params' });
    // Basic sanitization — Firestore doc IDs не можуть містити / або бути порожніми
    if (typeof companyId !== 'string' || companyId.includes('/') || companyId.length > 128)
        return res.status(400).json({ error: 'Invalid companyId' });

    try {
        const body = req.body;

        // ── Нормалізація повідомлення ────────────────────────
        let normalized = null;
        let callbackQueryId = null; // для answerCallbackQuery

        if (channel === 'telegram') {
            const msg = body?.message;
            const cb = body?.callback_query;
            if (!msg && !cb) return res.status(200).json({ ok: true, skipped: 'no message' });
            const from = msg?.from || cb?.from;
            if (!from) return res.status(200).json({ ok: true, skipped: 'no from' });
            normalized = {
                senderId:   String(from.id),
                senderName: ([from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || '')
                    .replace(/[<>"']/g, '').slice(0, 100),
                username:   (from.username || '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 50),
                text: msg?.text || cb?.data || msg?.caption || (msg?.photo ? '[фото]' : '') || (msg?.voice ? '[голос]' : '') || (msg?.document ? '[файл]' : '') || (msg?.sticker ? '[стікер]' : '') || '',
            };
            if (cb) callbackQueryId = cb.id;
        } else if (channel === 'viber') {
            // Viber webhook payload
            const evType = body?.event;
            if (evType === 'webhook') return res.status(200).json({ status: 0, status_message: 'ok' });
            const sender = body?.sender;
            const msgObj = body?.message;
            if (!sender || !msgObj) return res.status(200).json({ ok: true, skipped: 'no sender/message' });
            normalized = {
                senderId:   sender.id || '',
                senderName: sender.name || '',
                text:       msgObj.text || '',
            };
        } else if (channel === 'facebook' || channel === 'instagram') {
            // GET — верифікація webhook від Meta
            if (req.method === 'GET') {
                const mode      = req.query['hub.mode'];
                const challenge = req.query['hub.challenge'];
                const verify    = req.query['hub.verify_token'];
                // PROB 4 FIX: перевіряємо verify_token з Firestore.
                // Без перевірки — будь-хто може зареєструвати наш URL як свій FB webhook.
                if (mode === 'subscribe' && challenge) {
                    try {
                        const vDoc = await db.collection('companies').doc(companyId).get();
                        const stored = vDoc.data()?.fbVerifyToken || vDoc.data()?.integrations?.facebook?.verifyToken;
                        if (stored && verify !== stored) {
                            console.warn(`[webhook] FB verify_token mismatch for ${companyId}`);
                            return res.status(403).send('Forbidden');
                        }
                    } catch(e) { console.warn('[webhook] FB token check:', e.message); }
                    return res.status(200).send(challenge);
                }
                return res.status(400).send('Bad Request');
            }
            const entry = body?.entry?.[0];

            // FIX 6: Instagram / Facebook Messenger DM (messaging event)
            const _messaging = entry?.messaging?.[0];
            if (_messaging?.message && _messaging?.sender?.id) {
                const _igSenderId = String(_messaging.sender.id);
                const _igText = _messaging.message.text || (_messaging.message.attachments ? '[медіа]' : '');
                if (_igText) {
                    normalized = {
                        senderId:   _igSenderId,
                        senderName: '',
                        username:   '',
                        text:       _igText.slice(0, 1000),
                    };
                    // Переходимо до основної обробки боту нижче
                }
            }

            // Leadgen подія (Facebook Lead Ads)
            if (entry?.changes?.[0]?.field === 'leadgen') {
                const change   = entry.changes[0].value;
                const leadId   = change.leadid;
                const pageId   = change.page_id;
                const formId   = change.form_id;
                // Завантажуємо дані ліда через Graph API
                const compDoc = await db.collection('companies').doc(companyId).get();
                const fbToken = compDoc.data()?.fbPageAccessToken;
                if (fbToken && leadId) {
                    try {
                        const _fbAbort = new AbortController();
                        const _fbTimer = setTimeout(() => _fbAbort.abort(), 10000);
                        const fbRes = await fetch(
                            `https://graph.facebook.com/v19.0/${leadId}?access_token=${fbToken}`,
                            { signal: _fbAbort.signal }
                        );
                        clearTimeout(_fbTimer);
                        const fbData = await fbRes.json();
                        const fields = {};
                        (fbData.field_data || []).forEach(f => { fields[f.name] = f.values?.[0] || ''; });
                        const compRef = db.collection('companies').doc(companyId);
                        const DB_COLS = { CRM_DEALS: 'crm_deals' };
                        // FIX: підтягуємо default pipeline щоб угода потрапила в kanban
                        const fbPipSnap = await compRef.collection('crm_pipeline')
                            .where('isDefault', '==', true).limit(1).get();
                        const fbPipeline    = fbPipSnap.empty ? null : fbPipSnap.docs[0].data();
                        const fbPipelineId  = fbPipSnap.empty ? '' : fbPipSnap.docs[0].id;
                        const fbFirstStage  = fbPipeline?.stages?.[0]?.id || 'new';
                        // Створюємо клієнта
                        const _fbName = fields.full_name || fields.name || 'FB Lead';
                        const _fbClientRef = compRef.collection('crm_clients').doc();
                        await _fbClientRef.set({
                            id:     _fbClientRef.id,
                            name:   _fbName,
                            type:   'person',
                            phone:  fields.phone_number || fields.phone || '',
                            email:  fields.email || '',
                            source: 'facebook_lead',
                            fbLeadId: leadId,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        // Створюємо угоду
                        await compRef.collection(DB_COLS.CRM_DEALS).add({
                            title:      `FB Lead: ${_fbName}`,
                            clientId:   _fbClientRef.id,
                            clientName: _fbName,
                            phone:      fields.phone_number || fields.phone || '',
                            email:      fields.email || '',
                            source:     'facebook_lead',
                            stage:      fbFirstStage,
                            stageId:    fbFirstStage,
                            stageColor: fbPipeline?.stages?.[0]?.color || '#6b7280',
                            probability: fbPipeline?.stages?.[0]?.probability || 10,
                            pipelineId: fbPipelineId,
                            fbLeadId:   leadId,
                            fbFormId:   formId || '',
                            fbPageId:   pageId || '',
                            leadData:   fields,
                            status:     'open',
                            amount:     0,
                            currency:   'UAH',
                            createdBy:  'system',
                            createdAt:  admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt:  admin.firestore.FieldValue.serverTimestamp(),
                            stageEnteredAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        process.env.WEBHOOK_DEBUG && console.debug(`[webhook] FB Lead created: ${leadId}`);
                    } catch(fbErr) {
                        console.error('[webhook] FB Lead fetch error:', fbErr.message);
                    }
                }
                return res.status(200).json({ ok: true });
            }
            // Звичайне messaging
            const messaging = body?.entry?.[0]?.messaging?.[0];
            if (!messaging) return res.status(200).json({ ok: true, skipped: 'no messaging' });
            normalized = { senderId: messaging.sender?.id || '', senderName: '', text: messaging.message?.text || '' };
        }

        // ── Telephony channels ─────────────────────────────────────────────
        // Binotel, Ringostat, Stream Telecom
        if (channel === 'binotel' || channel === 'ringostat' || channel === 'stream_telecom') {

            try {
                const compRef  = db.collection('companies').doc(companyId);
                const ts       = admin.firestore.FieldValue.serverTimestamp();
                const providerLabel = channel === 'binotel' ? 'Binotel'
                    : channel === 'ringostat' ? 'Ringostat' : 'Stream Telecom';

                // 1. Нормалізуємо payload провайдера
                let phone       = '';
                let callType    = 'incoming';
                let duration    = 0;
                let callId      = '';
                let internalNum = '';

                if (channel === 'binotel') {
                    // FIX CRITICAL: якщо body.event відсутній — не блокуємо обробку
                    // Деякі версії Binotel не надсилають event поле
                    if (body.event && body.event.toUpperCase() !== 'HANGUP') {
                        res.status(200).json({ ok: true, skipped: 'not HANGUP' });
                        return;
                    }
                    phone       = body.externalNumber || body.callerIdNum || '';
                    internalNum = body.internalNumber
                        || (Array.isArray(body.internalNumbers) ? body.internalNumbers[0] : '')
                        || '';
                    const billsec = parseInt(body.billsec || 0);
                    const ct      = String(body.callType || '').toUpperCase();
                    callType = !billsec ? 'missed' : (ct === 'OUTGOING' || ct === '1') ? 'outgoing' : 'incoming';
                    duration = billsec;
                    callId   = body.uniqueId || body.generalCallID || '';

                } else if (channel === 'ringostat') {
                    // FIX: якщо event відсутній — це CDR запис (теж обробляємо)
                    // якщо event є але не hangup — пропускаємо
                    if (body.event && !['call_hangup','hangup','finish','HANGUP','cdr'].includes(body.event)) {
                        res.status(200).json({ ok: true, skipped: 'not hangup' });
                        return;
                    }
                    internalNum = body.internal_number || body.extension || '';
                    const ct    = String(body.call_type || '').toLowerCase();
                    duration    = parseInt(body.duration || 0);
                    // FIX HIGH: duration=0 + disposition=ANSWERED → incoming (не missed)
                    // Ringostat надсилає status поле: 'answered' | 'missed' | 'busy'
                    const status = String(body.status || body.disposition || '').toLowerCase();
                    const explicitMissed = status === 'missed' || status === 'busy' || status === 'no_answer';
                    callType    = explicitMissed ? 'missed' : ct === 'out' ? 'outgoing' : 'incoming';
                    phone       = callType === 'outgoing'
                        ? (body.called_number || body.caller_number || '')
                        : (body.caller_number || body.called_number || '');
                    callId      = body.call_id || body.uid || '';

                } else if (channel === 'stream_telecom') {
                    const billsec  = parseInt(body.billsec || 0);
                    const srcRaw   = String(body.src || '');
                    const dstRaw   = String(body.dst || '');
                    const srcClean = srcRaw.replace(/\D/g, '');
                    // FIX MEDIUM: внутрішній тільки якщо < 7 цифр І не починається з 380/0 (не міжнародний)
                    const srcIsInternal = srcClean.length >= 2 && srcClean.length <= 6
                        && !srcClean.startsWith('380') && !srcClean.startsWith('0');
                    const answered = body.disposition === 'ANSWERED' || billsec > 0;
                    callType    = !answered ? 'missed' : srcIsInternal ? 'outgoing' : 'incoming';
                    phone       = srcIsInternal ? dstRaw : srcRaw || dstRaw;
                    internalNum = srcIsInternal ? srcClean : '';
                    duration    = parseInt(body.duration || billsec || 0);
                    callId      = body.uniqueid || '';
                }

                if (!phone) {
                    res.status(200).json({ ok: true, skipped: 'no phone' });
                    return;
                }

                // Нормалізація номера
                const cleanPhone = String(phone).replace(/\D/g, '');
                let normalPhone;
                if (cleanPhone.startsWith('380') && cleanPhone.length >= 12) {
                    normalPhone = '+' + cleanPhone;
                } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
                    normalPhone = '+38' + cleanPhone;
                } else if (cleanPhone.length >= 10) {
                    normalPhone = '+' + cleanPhone;
                } else {
                    console.warn(`[webhook:${channel}] invalid phone: "${phone}" clean="${cleanPhone}"`);
                    res.status(200).json({ ok: true, skipped: 'invalid phone' });
                    return;
                }

                // FIX CRITICAL: idempotency — перевіряємо callId щоб уникнути дублів при retry
                if (callId) {
                    // FIX: sub-collection per company (ізоляція) + expiresAt для cleanup + ':' в ID
                    const lockId  = `${channel}:${callId}`;
                    const lockRef = compRef.collection('_tlocks').doc(lockId);
                    // Transaction для атомарного check-and-set (race condition protection)
                    const _lockAcquired = await db.runTransaction(async tx => {
                        const existing = await tx.get(lockRef);
                        if (existing.exists) return false;
                        const exp = new Date(); exp.setDate(exp.getDate() + 30);
                        tx.set(lockRef, { channel, callId, createdAt: ts, expiresAt: exp });
                        return true;
                    }).catch(() => false);
                    if (!_lockAcquired) {
                        res.status(200).json({ ok: true, skipped: 'duplicate callId' });
                        return;
                    }
                }

                // Відповідаємо 200 — після idempotency check, перед важкими операціями
                res.status(200).json({ ok: true, received: channel, phone: normalPhone, callType });

                // FIX MEDIUM: читаємо compData ДО res (щоб catch міг відповісти 500)
                // Але res вже надіслано — тому просто логуємо помилку далі без res.status
                const compDoc  = await compRef.get();
                const compData = compDoc.data() || {};
                const tgToken  = compData.telegramBotToken || compData.botToken || '';

                // Менеджер по extension
                // FIX HIGH: без orderBy щоб не потребувати composite index
                let assigneeId   = '';
                let assigneeName = '';
                let assigneeTgId = '';
                if (internalNum) {
                    try {
                        const usersSnap = await compRef.collection('users')
                            .where('extension', '==', String(internalNum))
                            .limit(1).get();
                        if (!usersSnap.empty) {
                            const u      = usersSnap.docs[0].data();
                            assigneeId   = usersSnap.docs[0].id;
                            assigneeName = u.name || u.displayName || '';
                            assigneeTgId = u.telegramChatId || u.tgChatId || '';
                        }
                    } catch(e) {
                        console.warn(`[webhook:${channel}] extension lookup:`, e.message);
                    }
                }

                // Контакт — знайти або створити
                const contactsSnap = await compRef.collection('crm_clients')
                    .where('phone', '==', normalPhone).limit(1).get();

                let clientId    = '';
                let clientName  = normalPhone;
                let isNewClient = false;

                if (!contactsSnap.empty) {
                    const cl = contactsSnap.docs[0];
                    clientId   = cl.id;
                    clientName = cl.data()?.name || normalPhone;
                } else {
                    isNewClient = true;
                    const ref = await compRef.collection('crm_clients').add({
                        name:      normalPhone,
                        phone:     normalPhone,
                        source:    providerLabel,
                        createdAt: ts,
                        updatedAt: ts,
                    });
                    clientId = ref.id;
                }

                // Угода — знайти відкриту або створити
                let dealId = '';
                let openDealSnap;
                try {
                    openDealSnap = await compRef.collection('crm_deals')
                        .where('clientId', '==', clientId)
                        .where('status', '==', 'active')
                        .limit(1).get();
                } catch(e) {
                    // Composite index ще не створено — fallback in-memory
                    console.warn(`[webhook:${channel}] composite index missing:`, e.message);
                    const allDeals = await compRef.collection('crm_deals')
                        .where('clientId', '==', clientId).limit(10).get();
                    const active = allDeals.docs.find(d => d.data()?.status === 'active');
                    openDealSnap = active ? { empty: false, docs: [active] } : { empty: true };
                }

                if (!openDealSnap.empty) {
                    dealId = openDealSnap.docs[0].id;
                    await compRef.collection('crm_deals').doc(dealId).update({ updatedAt: ts });
                } else {
                    const pipelineSnap = await compRef.collection('crm_pipeline')
                        .where('isDefault','==',true).limit(1).get();
                    const pipelineId   = pipelineSnap.empty ? '' : pipelineSnap.docs[0].id;
                    const stages       = pipelineSnap.empty ? [] : (pipelineSnap.docs[0].data()?.stages || []);
                    const firstStageId = stages.length > 0 ? (stages[0].id || '') : '';
                    const dealTitle    = callType === 'missed'
                        ? `Пропущений дзвінок — ${clientName}`
                        : `Дзвінок — ${clientName}`;

                    const dealRef = await compRef.collection('crm_deals').add({
                        title:        dealTitle,
                        clientId:     clientId,
                        clientName:   clientName,
                        phone:        normalPhone,
                        pipelineId:   pipelineId,
                        stageId:      firstStageId,
                        stage:        firstStageId, // FIX CRITICAL: CRM kanban читає d.stage, не stageId
                        source:       providerLabel,
                        status:       'open',  // FIX: kanban шукає status='open'
                        assigneeId:   assigneeId,
                        assigneeName: assigneeName,
                        createdBy:    'system',
                        isMissed:     callType === 'missed',
                        createdAt:    ts,
                        updatedAt:    ts,
                    });
                    dealId = dealRef.id;
                }

                // Лог дзвінка в crm_activities
                // FIX HIGH: callIcon прибрано (мертвий код)
                const callLabel   = callType === 'incoming' ? 'Вхідний' : callType === 'outgoing' ? 'Вихідний' : 'Пропущений';
                const durationStr = duration > 0
                    ? ` (${Math.floor(duration/60)}:${String(duration%60).padStart(2,'0')})`
                    : '';

                await compRef.collection('crm_activities').add({
                    type:         'call',
                    clientId:     clientId,
                    clientName:   clientName,
                    dealId:       dealId,
                    note:         `${callLabel} дзвінок${durationStr} — ${providerLabel}`,
                    phone:        normalPhone,
                    callType:     callType,
                    duration:     duration,
                    callId:       callId,
                    provider:     channel,
                    assigneeId:   assigneeId,
                    createdAt:    ts,
                    userId:       assigneeId || 'system',
                });

                // Telegram сповіщення
                if (tgToken && (callType === 'missed' || isNewClient)) {
                    const chatIds = [];
                    if (assigneeTgId) chatIds.push(String(assigneeTgId));
                    const companyChatId = String(compData.managerChatId || compData.telegramChatId || '');
                    if (companyChatId && !chatIds.includes(companyChatId)) chatIds.push(companyChatId);

                    if (chatIds.length > 0) {
                        const isMissed = callType === 'missed';
                        const header   = isMissed ? 'ПРОПУЩЕНИЙ ДЗВIНОК!' : 'Новий клiєнт';
                        const msgText  = `${header}\n\nНомер: ${normalPhone}\nКлiєнт: ${clientName}${assigneeName ? '\nМенеджер: ' + assigneeName : ''}\nДжерело: ${providerLabel}${isMissed ? '\n\nПередзвонiть якомога швидше!' : ''}`;

                        for (const chatId of chatIds) {
                            // FIX MEDIUM: clearTimeout завжди, навіть при помилці
                            const ctrl  = new AbortController();
                            const timer = setTimeout(() => ctrl.abort(), 8000);
                            try {
                                await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ chat_id: chatId, text: msgText }),
                                    signal: ctrl.signal,
                                });
                            } catch(e) {
                                console.warn('[webhook:telephony] tg notify:', e.message);
                            } finally {
                                clearTimeout(timer);
                            }
                        }
                    }
                }

                console.log(`[webhook:${channel}] OK ${callLabel} ${normalPhone} dur=${duration}s deal=${dealId}`);
            } catch(err) {
                console.error(`[webhook:${channel}] error:`, err.message);
                // res вже може бути надіслано — не намагаємось відповісти знову
                if (!res.headersSent) res.status(500).json({ error: err.message });
            }
            return;
        }



        process.env.WEBHOOK_DEBUG && console.debug(`[webhook] ${channel} from ${normalized.senderId}: "${normalized.text}"`);

        const compRef = db.collection('companies').doc(companyId);

        // PERF: читаємо compData + bots паралельно (~20ms замість ~40ms)
        const [_compDoc, botsSnap] = await Promise.all([
            compRef.get(),
            compRef.collection('bots').where('channel', '==', channel).limit(10).get(),
        ]);
        const _compData = _compDoc.data() || {};

        // ── Знаходимо бот токен ──────────────────────────────
        let botToken = null, botDocId = null;
        if (!botsSnap.empty) {
            const bd = botsSnap.docs[0];
            botDocId = bd.id;
            botToken = bd.data()?.token || bd.data()?.botToken;
        }
        if (!botToken) {
            botToken = channel === 'viber'
                ? _compData?.viberBotToken
                : _compData?.integrations?.telegram?.botToken;
        }
        if (!botToken) return res.status(200).json({ ok: true, skipped: 'no token' });

        // ── Зберігаємо ВСІ вхідні повідомлення від юзера ───
        // Це робить повну переписку в contacts/{id}/messages/
        // для перегляду в чаті менеджером (незалежно від стану флоу)
        const contactId = `${channel}_${normalized.senderId}`;
        // Не зберігаємо /start і технічні команди
        // FIX: capture /start deep link payload (e.g. /start ref_abc)
        if (normalized.text && normalized.text.startsWith('/start') && normalized.text !== '/start') {
            const startPayload = normalized.text.split(' ')[1] || null;
            if (startPayload) session.data._startRef = startPayload;
        }
        if (normalized.text && !normalized.text.startsWith('/start') && normalized.text !== 'start') {
            // PERF: fire-and-forget — запис повідомлення не блокує обробку (-15ms)
            compRef
                .collection('contacts').doc(contactId)
                .collection('messages').add({
                    text:      normalized.text,
                    from:      'user',
                    direction: 'in',
                    read:      false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }).catch(e => console.error('[saveMsg]', e.message));
        }

        // Підтверджуємо callback_query одразу (прибирає "годинник" на кнопці)
        if (callbackQueryId && botToken) {
            // fire-and-forget з timeout
            const _aqAbort = new AbortController();
            setTimeout(() => _aqAbort.abort(), 5000);
            fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: callbackQueryId }),
                signal: _aqAbort.signal,
            }).catch(() => {});
        }

        // ── Сесія + Rate limit (об'єднано в 1 transaction = -80ms) ──
        // PERF 1: rate_limit і session lock читаємо в ОДНІЙ транзакції
        // Було: 2 окремих round-trip до Firestore (~80ms extra)
        // Стало: 1 transaction з 3 reads паралельно (lockRef + sessionRef + rlRef)
        const sessionId = `${channel}_${normalized.senderId}`;
        const sessionRef = compRef.collection('sessions').doc(sessionId);
        const lockKey = `lock_${sessionId}`;
        const lockRef = compRef.collection('_session_locks').doc(lockKey);
        const lockTs = Date.now();
        const _rlKey = `rl_${channel}_${normalized.senderId}`;
        const _rlRef = compRef.collection('_rate_limits').doc(_rlKey);

        let sessionDoc;
        const lockAcquired = await db.runTransaction(async tx => {
            // Читаємо lock + session + rate_limit паралельно в 1 transaction
            const [existingLock, session, rlDoc] = await Promise.all([
                tx.get(lockRef),
                tx.get(sessionRef),
                tx.get(_rlRef),
            ]);

            // Rate limit check (10 msg / 10s)
            const _rlNow = Date.now();
            const _rlData = rlDoc.exists ? rlDoc.data() : null;
            if (_rlData && _rlNow - (_rlData.windowStart || 0) < 10000) {
                if ((_rlData.count || 0) >= 10) {
                    console.warn('[webhook] rate limit exceeded for', _rlKey);
                    return { acquired: false, sessionDoc: null, rateLimited: true };
                }
                tx.update(_rlRef, { count: admin.firestore.FieldValue.increment(1) });
            } else {
                tx.set(_rlRef, { windowStart: _rlNow, count: 1 });
            }

            // Session lock check — динамічний TTL
            // 30s якщо сесія чекала input (AI вузол міг виконуватись довго)
            // 8s для звичайних вузлів
            const _prevSessData = session.exists ? session.data() : null;
            const _lockTtl = (_prevSessData?.waitingForInput && _prevSessData?.currentFlowId) ? 30000 : 8000;
            if (existingLock.exists) {
                const lockData = existingLock.data();
                if (lockTs - (lockData?.ts || 0) < _lockTtl) {
                    return { acquired: false, sessionDoc: null };
                }
            }

            tx.set(lockRef, {
                ts: lockTs,
                pid: Math.random(),
                expiresAt: lockTs + 35000, // 35s TTL — більше за max AI час
            }, { merge: false });
            return { acquired: true, sessionDoc: session };
        }).catch(e => {
            console.error('[webhook] lock transaction failed:', e.message);
            return { acquired: false, sessionDoc: null };
        });

        if (lockAcquired.rateLimited) {
            return res.status(200).json({ ok: true, skipped: 'rate_limit' });
        }

        if (!lockAcquired.acquired) {
            // callback_query — підтверджуємо щоб Telegram прибрав loader на кнопці
            if (callbackQueryId && botToken) {
                fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callback_query_id: callbackQueryId }),
                }).catch(() => {});
            }
            // Показуємо typing indicator — юзер бачить що бот ще думає
            if (botToken && normalized?.senderId && channel === 'telegram' && !callbackQueryId) {
                fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: String(normalized.senderId), action: 'typing' }),
                }).catch(() => {});
            }
            return res.status(200).json({ ok: true, skipped: 'session_locked' });
        }

        sessionDoc = lockAcquired.sessionDoc;
        const _isNewContact = !sessionDoc.exists;
        let session = sessionDoc.exists ? sessionDoc.data() : {
            senderId: String(normalized.senderId), senderName: normalized.senderName || '',
            channel, currentFlowId: null, currentBotId: null,
            currentNodeId: null, waitingForInput: null,
            data: {}, aiHistory: [], tags: [],
        };
        // FIX: guard для session.data — завжди має бути об'єктом
        if (!session.data || typeof session.data !== 'object') session.data = {};
        if (!Array.isArray(session.aiHistory)) session.aiHistory = [];
        if (!Array.isArray(session.tags)) session.tags = [];
        // Завжди оновлюємо botId (може змінитись якщо компанія має кілька ботів)
        if (botDocId) session.botId = botDocId;
        // FIX CE: refresh senderName/username (user may rename in Telegram)
        if (normalized.senderName) session.senderName = normalized.senderName;
        if (normalized.username)   session.username   = normalized.username;

        // ── Авто-лід при першому повідомленні ──────────────────
        // PERF 2: fire-and-forget — не блокує першу відповідь бота (-200-380ms)
        // _autoClientId/_autoDealId встановлюються async і зберігаються в наступному session.set
        // finish() читає їх з session на наступному кроці
        if (_isNewContact) {
            (async () => { try {
                const _ts = admin.firestore.FieldValue.serverTimestamp();
                const _name = normalized.senderName || normalized.senderId || 'Новий контакт';
                const _source = channel === 'telegram' ? 'telegram_bot'
                    : channel === 'instagram' ? 'instagram_bot' : 'bot';

                // Перевіряємо чи вже є клієнт з таким contactId (захист від race)
                const _existingClient = await compRef.collection('crm_clients')
                    .where('botContactId', '==', contactId).limit(1).get().catch(() => null);

                if (!_existingClient || _existingClient.empty) {
                    // PERF: client.add + pipeline.get паралельно
                    const _newClientRef = compRef.collection('crm_clients').doc();
                    const [, _pipSnap] = await Promise.all([
                        _newClientRef.set({
                            id:           _newClientRef.id,
                            name:         _name,
                            type:         'person',
                            phone:        '',
                            email:        '',
                            telegram:     normalized.username ? `@${normalized.username}` : '',
                            source:       _source,
                            botContactId: contactId,
                            senderId:     String(normalized.senderId),
                            channel:      channel,
                            telegramId:   channel === 'telegram' ? String(normalized.senderId) : '',
                            tags:         [],
                            createdAt:    _ts,
                            updatedAt:    _ts,
                        }),
                        compRef.collection('crm_pipeline')
                            .where('isDefault', '==', true).limit(1).get().catch(() => null),
                    ]);
                    const _clientRef = _newClientRef;
                    const _pip = _pipSnap && !_pipSnap.empty ? _pipSnap.docs[0] : null;
                    const _pipId = _pip ? _pip.id : '';
                    const _stages = _pip ? (_pip.data()?.stages || []) : [];
                    // FIX: якщо немає стадій — перевіряємо pipeline ще раз і беремо першу стадію
                    const _stageId = _stages.length ? (_stages[0].id || 'new') : 'new';

                    // Створюємо угоду
                    const _dealRef = compRef.collection('crm_deals').doc();
                    // Беремо stageColor/probability з першої стадії pipeline
                    const _firstStage = _stages[0] || {};
                    const _stageColor = _firstStage.color || '#6b7280';
                    const _probability = _firstStage.probability || 10;

                    await _dealRef.set({
                        id:              _dealRef.id,
                        title:           `${_name} — ${_source}`,
                        clientId:        _clientRef.id,
                        clientName:      _name,
                        botContactId:    contactId,
                        contactId:       contactId,
                        phone:           '',
                        pipelineId:      _pipId,
                        stage:           _stageId,
                        stageId:         _stageId,
                        stageColor:      _stageColor,
                        probability:     _probability,
                        source:          _source,
                        status:          'open',
                        amount:          0,
                        currency:        'UAH',
                        channel:         channel,
                        tags:            [],
                        assignedToId:    _compData?.ownerId || null,
                        assignedToName:  _compData?.ownerName || '',
                        stageEnteredAt:  _ts,
                        autoCreated:     true,
                        createdBy:       'system:auto_lead',
                        createdAt:       _ts,
                        updatedAt:       _ts,
                    });

                    // Створюємо contacts document — щоб CRM chat відкривався одразу
                    await compRef.collection('contacts').doc(contactId).set({
                        senderId:        String(normalized.senderId),
                        senderName:      normalized.senderName || '',
                        username:        normalized.username || '',
                        channel,
                        botId:           botDocId || null,
                        crmClientId:     _clientRef.id,
                        lastMessage:     normalized.text || '',
                        lastMessageAt:   _ts,
                        lastMessageFrom: 'user',
                        unreadCount:     normalized.text && !normalized.text.startsWith('/start') ? 1 : 0,
                        createdAt:       _ts,
                        updatedAt:       _ts,
                    }, { merge: true });

                    // Кешуємо pipeline в session — finish() не буде робити зайвий read
                    // Зберігаємо в root сесії (не в data{}) — щоб не губились при reset
                    session._autoClientId = _clientRef.id;
                    session._autoDealId   = _dealRef.id;
                    session._autoPipId    = _pipId;
                    session._autoStageId  = _stageId;
                    // Також в data для зворотної сумісності
                    session.data._autoClientId = _clientRef.id;
                    session.data._autoDealId   = _dealRef.id;
                    console.log(`[auto_lead] Created client=${_clientRef.id} deal=${_dealRef.id} contact=${contactId}`);
                }
            } catch(e) {
                console.error('[auto_lead]', e.message);
            }})(); // fire-and-forget — не чекаємо
        }

        // FIX 1: Deduplication — ігноруємо повторний update_id від Telegram
        const updateId = body?.update_id || body?.entry?.[0]?.id || null;
        if (updateId && session.lastUpdateId === updateId) {
            process.env.WEBHOOK_DEBUG && console.debug('[webhook] Duplicate update_id, skipping:', updateId);
            lockRef.delete().catch(()=>{});
            return res.status(200).json({ ok: true, skipped: 'duplicate' });
        }
        if (updateId) session.lastUpdateId = updateId;

        const isStart = /^\/start/.test(normalized.text) || normalized.text === 'start';
        if (isStart) {
            // FIX 11: /start скидає ВСЕ включно з кешем флоу
            Object.assign(session, {
                currentFlowId: null, currentNodeId: null, waitingForInput: null,
                data: {}, aiHistory: [], humanMode: false, humanModeAt: null,
                _cachedFlow: null, // FIX: скидаємо кеш флоу
            });
        }

        // BUG 2 FIX: humanMode guard — коли менеджер взяв розмову, бот мовчить
        if (session.humanMode && !isStart) {
            await saveIncomingMessage(compRef, channel, normalized, botDocId);
            lockRef.delete().catch(()=>{});
            return res.status(200).json({ ok: true, skipped: 'human_mode' });
        }

        // ── Знаходимо флоу ───────────────────────────────────
        const currentBotId = botDocId || session.currentBotId;
        let flow = null;

        if (currentBotId) {
            const flowsRef = compRef.collection('bots').doc(currentBotId).collection('flows');

            // Якщо є активна сесія — продовжуємо той самий флоу
            if (session.currentFlowId && !isStart) {
                const fd = await flowsRef.doc(session.currentFlowId).get();
                if (fd.exists) flow = { id: fd.id, botId: currentBotId, ...fd.data() };
            }

            // Шукаємо по тригеру
            if (!flow) {
                const allFlows = await flowsRef.where('status', '==', 'active').limit(20).get();
                for (const fd of allFlows.docs) {
                    const trigger = fd.data()?.triggerKeyword || '/start';
                    if (isStart || normalized.text === trigger) {
                        flow = { id: fd.id, botId: currentBotId, ...fd.data() };
                        break;
                    }
                }
                // Fallback — перший активний флоу
                if (!flow && !allFlows.empty) {
                    flow = { id: allFlows.docs[0].id, botId: currentBotId, ...allFlows.docs[0].data() };
                }
            }
        }

        if (!flow) {
            // PERF: sendMsg + saveIncoming + session паралельно
            const _noFlowOps = [
                saveIncomingMessage(compRef, channel, normalized, botDocId),
            ];
            if (isStart) _noFlowOps.push(sendMsg(channel, botToken, normalized.senderId, 'Вітаємо! Бот активний ✅'));
            if (updateId) { session.lastUpdateId = updateId; _noFlowOps.push(sessionRef.set(session, { merge: true }).catch(()=>{})); }
            await Promise.all(_noFlowOps);
            lockRef.delete().catch(()=>{});
            return res.status(200).json({ ok: true, saved: 'no-flow-incoming' });
        }

        // ── Підвантажуємо canvasData + nodePrompts з підколекцій ──
        // PERF 5: перевіряємо кеш флоу в сесії — якщо flowId і версія збігаються, не читаємо Firestore
        const _cachedFlow = session._cachedFlow;
        if (_cachedFlow?.id === flow.id && _cachedFlow?.nodes?.length && !isStart) {
            // Відновлюємо ноди з кешу — экономимо 1-2 Firestore reads (~40-80ms)
            if (!flow.nodes?.length) flow.nodes = _cachedFlow.nodes;
            if (!flow.canvasData?.nodes?.length) flow.canvasData = { nodes: _cachedFlow.nodes, edges: _cachedFlow.edges || [] };
        }

        const flowDocRef = compRef.collection('bots').doc(currentBotId).collection('flows').doc(flow.id);

        // PERF: canvasData + nodePrompts паралельно (економимо ~150ms)
        // Перевіряємо чи є AI вузли — якщо немає, не читаємо nodePrompts (економимо read)
        const _nodes = flow.canvasData?.nodes || flow.nodes || [];
        const _hasAiNodes = _nodes.some(n => n.type === 'ai' || n.type === 'ai_response'
            || n.config?.aiSystem || n.aiSystem);
        const _hasRefNodes = _nodes.some(n => {
            const s = n.config?.aiSystem || n.aiSystem || '';
            return s.startsWith('__ref:');
        });

        const [_canvasDoc, promptsSnap] = await Promise.all([
            flow.canvasData?.nodes?.length
                ? Promise.resolve(null)
                : flowDocRef.collection('canvasData').doc('layout').get().catch(() => null),
            (_hasAiNodes && _hasRefNodes)
                ? flowDocRef.collection('nodePrompts').get().catch(() => ({ forEach: () => {} }))
                : Promise.resolve({ forEach: () => {} }),
        ]);
        if (_canvasDoc?.exists) flow.canvasData = _canvasDoc.data();
        const nodePromptsMap = {};
        promptsSnap.forEach(doc => { nodePromptsMap[doc.id] = doc.data()?.aiSystem || ''; });
        // Оновлюємо _nodes після можливого завантаження canvasData
        const restorePrompts = (nodesList) => nodesList.map(n => {
            // FIX 2+3: перевіряємо обидва місця де може бути __ref
            const sysConfig = n.config?.aiSystem || '';
            const sysTop = n.aiSystem || '';
            const hasRef = sysConfig.startsWith('__ref:') || sysTop.startsWith('__ref:');
            if (hasRef) {
                const refId = (sysConfig.startsWith('__ref:') ? sysConfig : sysTop).replace('__ref:', '');
                const realPrompt = nodePromptsMap[refId] || '';
                // Shallow clone + deep clone тільки config (менш витратно ніж JSON.parse/stringify)
                const restored = { ...n };
                if (restored.config) restored.config = { ...restored.config, aiSystem: realPrompt };
                restored.aiSystem = realPrompt;
                return restored;
            }
            return n;
        });

        // ── Будуємо runtime nodes ─────────────────────────────
        // flow.nodes — лінійний масив (зберігається при saveFlow)
        // flow.canvasData.edges — з'єднання між вузлами
        let runtimeNodes = (flow.nodes || []).filter(n => n.id && n.type !== 'start' && n.type !== 'trigger');
        runtimeNodes = restorePrompts(runtimeNodes);

        // Fallback: якщо flow.nodes порожній — беремо з canvasData
        if (runtimeNodes.length === 0 && flow.canvasData?.nodes?.length) {
            runtimeNodes = restorePrompts(flow.canvasData.nodes
                .filter(n => n.id && n.type !== 'start'))
                .map(n => ({
                    id: n.id, type: n.type || 'message',
                    text: n.text || '',
                    nextNode: n.nextNode || null,
                    buttons: n.buttons || [],
                    options: n.options || [],
                    config: n.config || n,
                    aiSystem: n.config?.aiSystem || n.aiSystem || n.systemPrompt || '',
                    aiApiKey: n.config?.aiApiKey || n.aiApiKey || n.apiKey || null,
                    aiModel: n.config?.aiModel || n.aiModel || n.model || 'gpt-4o-mini',
                    saveAs: n.config?.saveAs || n.saveAs || null,
                    fallback: n.config?.fallback || n.fallback || null,
                }));
        }

        // Патчимо nextNode з canvasData.edges
        const edges = flow.canvasData?.edges || [];
        if (edges.length > 0) {
            // O(1) lookup замість O(n²) edges.find()
            const edgeMap = {};
            edges.forEach(e => { edgeMap[`${e.fromNode}::${e.fromPort}`] = e.toNode; });

            runtimeNodes.forEach(n => {
                const outTarget = edgeMap[`${n.id}::out`];
                if (outTarget && !n.nextNode) n.nextNode = outTarget;
                if (n.buttons?.length) {
                    n.buttons = n.buttons.map((b, i) => {
                        if (b.nextNode) return b;
                        const target = edgeMap[`${n.id}::btn_${i}`];
                        return target ? { ...b, nextNode: target } : b;
                    });
                    n.options = n.buttons.map(b => ({ label: b.label, nextNode: b.nextNode }));
                }
            });
        }

        process.env.WEBHOOK_DEBUG && console.debug(`[webhook] Flow: ${flow.id}, nodes: ${runtimeNodes.length}`);
        process.env.WEBHOOK_DEBUG && console.debug(`[webhook] Nodes:`, runtimeNodes.map(n => `${n.id}:${n.type}`).join(', '));

        // PERF 5: кешуємо ноди в сесії — тільки структура, без промптів
        // BUG FIX: обмежуємо до 20 нод щоб не перевищити 1MB Firestore ліміт
        const _cacheNodes = runtimeNodes.slice(0, 20).map(n => ({
            id: n.id, type: n.type,
            text: (n.text || '').slice(0, 100), // тільки початок для preview
            nextNode: n.nextNode || null,
            buttons: (n.buttons || []).map(b => ({ label: b.label || '', nextNode: b.nextNode || null })),
            saveAs: n.saveAs || null,
            conditionField: n.conditionField, conditionOp: n.conditionOp, conditionValue: n.conditionValue,
            trueNode: n.trueNode, falseNode: n.falseNode,
        }));
        // Кешуємо тільки якщо не надто великий флоу
        if (runtimeNodes.length <= 20) {
            session._cachedFlow = { id: flow.id, nodes: _cacheNodes, edges: [] }; // edges не кешуємо — вже вбудовані в nextNode
        } else {
            session._cachedFlow = null; // великий флоу — завжди читаємо з Firestore
        }

        const nodeMap = {};
        runtimeNodes.forEach(n => { if (n.id) nodeMap[n.id] = n; });

        // ── Визначаємо стартовий вузол ───────────────────────
        const firstNode = runtimeNodes[0];
        let nodeId = (isStart || !session.currentNodeId) ? firstNode?.id : null;

        // ── Обробка кнопки або вводу ─────────────────────────
        if (!isStart && session.waitingForInput) {
            const waitNode = nodeMap[session.waitingForInput];
            if (waitNode) {
                if (waitNode.type === 'ai' || waitNode.type === 'ai_response') {
                    // AI вузол — просто продовжуємо, текст вже нормалізований
                    nodeId = waitNode.id;
                    session.waitingForInput = null;
                } else {
                    // Якщо прийшов btn_N — знаходимо реальний текст кнопки
                    let userInput = normalized.text;
                    const btnMatch = userInput.match(/^btn_(\d+)/);
                    if (btnMatch) {
                        const btnIdx = parseInt(btnMatch[1]);
                        const btn = waitNode.buttons?.[btnIdx] || waitNode.options?.[btnIdx];
                        if (btn) userInput = btn.label || btn.text || userInput;
                    }
                    if (waitNode.saveAs) {
                        const _sk = String(waitNode.saveAs).slice(0, 50);
                        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(_sk) && !['__proto__','constructor','prototype'].includes(_sk)) {
                            session.data[_sk] = String(userInput).slice(0, 500);
                        }
                    }
                    normalized.text = userInput;
                    nodeId = resolveNext(waitNode, normalized.text);
                    session.waitingForInput = null;
                }
            } else {
                nodeId = session.currentNodeId || firstNode?.id;
            }
        }

        if (!nodeId) {
            // PERF: fire-and-forget — немає вузла для обробки
            Promise.all([
                sessionRef.set(session, { merge: true }),
                lockRef.delete().catch(()=>{}),
            ]).catch(e => console.error('[webhook] session no-node:', e.message));
            return res.status(200).json({ ok: true });
        }

        // ── Виконуємо ланцюг вузлів ──────────────────────────
        // FIX 3: _botToken НЕ зберігаємо в сесії (security) — передаємо через env
        // session._botToken = botToken; — ВИДАЛЕНО
        let safety = 0;
        while (nodeId && safety++ < 50) {  // 50 вузлів max
            const n = nodeMap[nodeId];
            if (!n) { process.env.WEBHOOK_DEBUG && console.debug(`[webhook] Node not found: ${nodeId}`); break; }
            process.env.WEBHOOK_DEBUG && console.debug(`[webhook] Executing node ${nodeId} type=${n.type}`);

            if (n.type === 'message') {
                const text = interp(n.text || '', session.data);
                if (!text.trim()) { nodeId = n.nextNode || null; continue; }
                // PERF: sendTyping fire-and-forget — UX ефект, не чекаємо підтвердження
                sendTyping(botToken, normalized.senderId).catch(()=>{});
                const btns = n.buttons?.length ? n.buttons : (n.options?.length ? n.options : null);
                await Promise.all([
                    sendMsg(channel, botToken, normalized.senderId, text, btns),
                    saveBotMessage(compRef, contactId, text, btns), // FIX 4: pass buttons
                ]);
                if (btns?.length) {
                    Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId,
                        currentNodeId: nodeId, waitingForInput: nodeId });
                    // PERF: session.set + lockRef.delete паралельно, res відразу
                    Promise.all([
                        sessionRef.set(session, { merge: true }),
                        lockRef.delete().catch(()=>{}),
                    ]).catch(e => console.error('[webhook] session save after btns:', e.message));
                    return res.status(200).json({ ok: true });
                }
                nodeId = n.nextNode || null;

            } else if (n.type === 'ai' || n.type === 'ai_response') {
                // AI вузол з пам'яттю
                if (!session.aiHistory) session.aiHistory = [];
                session.aiHistory.push({ role: 'user', content: normalized.text });
                if (session.aiHistory.length > 20) session.aiHistory = session.aiHistory.slice(-20);
                // FIX: also limit by total chars to avoid token overflow
                const _histChars = session.aiHistory.reduce((s,m)=>s+(m.content||'').length,0);
                if (_histChars > 15000) session.aiHistory = session.aiHistory.slice(-10);

                // PERF 6: typing відправляємо ОДРАЗУ (до Promise.all з AI)
                // Раніше перший sendTyping стартував всередині loop (async) з затримкою
                sendTyping(botToken, normalized.senderId).catch(()=>{});
                let typingActive = true;
                let typingTimeoutId = null;
                const typingLoop = (async () => {
                    // Чекаємо 4s перед наступним (перший вже відправлено вище)
                    await new Promise(r => { typingTimeoutId = setTimeout(() => { typingTimeoutId = null; r(); }, 4000); });
                    while (typingActive) {
                        await sendTyping(botToken, normalized.senderId);
                        if (!typingActive) break;
                        await new Promise(r => {
                            typingTimeoutId = setTimeout(() => {
                                typingTimeoutId = null;
                                r();
                            }, 4000);
                        });
                    }
                })();

                // PERF: sendTgGetId і callAI завжди паралельно
                // ⏳ показуємо при кожному AI повідомленні — діалог може займати 5-15s
                let thinkingMsgId = null;
                let rawReply;
                try {
                    // Запускаємо обидва одночасно — AI не чекає TG API
                    const [_msgId, _reply] = await Promise.all([
                        channel === 'telegram'
                            ? sendTgGetId(botToken, normalized.senderId, '⏳ Секунду, готую відповідь...')
                            : Promise.resolve(null),
                        callAI(n, normalized.text, session, compRef, _compData),
                    ]);
                    thinkingMsgId = _msgId;
                    rawReply = _reply;
                } finally {
                    typingActive = false;
                    if (typingTimeoutId) {
                        clearTimeout(typingTimeoutId);
                        typingTimeoutId = null;
                    }
                }
                if (!rawReply) rawReply = n.config?.fallback || n.fallback || '';

                // Парсимо спеціальні теги з відповіді AI:
                // [BTN:текст] — динамічна кнопка
                // [DONE] — AI завершив збір даних, іти до наступного вузла
                // [SAVE:змінна=значення] — зберегти дані в сесію
                const btnMatches = [...rawReply.matchAll(/\[BTN:([^\]]+)\]/g)];
                const aiBtns = btnMatches.map((m, i) => ({ label: m[1], nextNode: null }));
                const isDone = rawReply.includes('[DONE]');

                // Парсимо [SAVE:key=value] теги
                const saveMatches = [...rawReply.matchAll(/\[SAVE:([^=\]]{1,50})=([^\]]{0,500})\]/g)];
                const _SAFE_KEYS = /^[a-zA-Z_][a-zA-Z0-9_]{0,49}$/;
                saveMatches.forEach(m => {
                    const k = m[1].trim();
                    // Sanitize: тільки безпечні ключі, без __proto__/constructor тощо
                    if (_SAFE_KEYS.test(k) && !['__proto__','constructor','prototype'].includes(k)) {
                        // BUG FIX: очищаємо значення від можливих вкладених тегів
                        const v = m[2].trim()
                            .replace(/\[DONE\]/g, '')
                            .replace(/\[BTN:[^\]]+\]/g, '')
                            .replace(/\[SAVE:[^\]]+\]/g, '')
                            .slice(0, 500);
                        if (v) session.data[k] = v;
                    }
                });

                // Чистимо відповідь від службових тегів
                const cleanReply = rawReply
                    .replace(/\[BTN:[^\]]+\]/g, '')
                    .replace(/\[DONE\]/g, '')
                    .replace(/\[SAVE:[^\]]+\]/g, '')
                    .trim();

                if (cleanReply) session.aiHistory.push({ role: 'assistant', content: cleanReply });
                // Зберігаємо останню AI відповідь для {{ai_response}} в наступних вузлах
                session.data.ai_response = cleanReply;

                // Якщо cleanReply порожній (тільки [DONE]/[BTN]/[SAVE]) — беремо fallback
                const _replyText = cleanReply || (isDone ? '' : (n.config?.fallback || n.fallback || ''));
                if (_replyText || thinkingMsgId) {
                    // PERF: editTg/sendMsg + saveBotMessage паралельно (-15ms)
                    const _sendText = _replyText || '...';
                    await Promise.all([
                        thinkingMsgId
                            ? editTg(botToken, normalized.senderId, thinkingMsgId, _sendText, aiBtns.length ? aiBtns : null)
                            : sendMsg(channel, botToken, normalized.senderId, _sendText, aiBtns.length ? aiBtns : null),
                        _replyText ? saveBotMessage(compRef, contactId, _replyText) : Promise.resolve(),
                    ]);
                }

                if (isDone && n.nextNode) {
                    // AI завершив — іти до наступного вузла в ланцюгу
                    process.env.WEBHOOK_DEBUG && console.debug('[webhook] AI DONE → next node:', n.nextNode);
                    nodeId = n.nextNode;
                    // FIX 4: явно очищаємо waitingForInput щоб не застрягти в AI вузлі
                    session.waitingForInput = null;
                    session.currentNodeId = n.nextNode;
                    session.aiHistory = []; // очищаємо історію діалогу
                } else {
                    // AI продовжує діалог — залишаємось у вузлі
                    Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId,
                        currentNodeId: nodeId, waitingForInput: nodeId,
                        aiHistory: session.aiHistory });
                    // PERF: fire-and-forget — Telegram вже отримав відповідь
                    Promise.all([
                        sessionRef.set(session, { merge: true }),
                        lockRef.delete().catch(()=>{}),
                    ]).catch(e => console.error('[webhook] session save AI cont:', e.message));
                    return res.status(200).json({ ok: true });
                }

            } else if (n.type === 'pause') {
                Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId,
                    currentNodeId: n.nextNode || null, waitingForInput: nodeId });
                // PERF: fire-and-forget — pause не потребує синхронного збереження
                Promise.all([
                    sessionRef.set(session, { merge: true }),
                    lockRef.delete().catch(()=>{}),
                ]).catch(e => console.error('[webhook] session save pause:', e.message));
                return res.status(200).json({ ok: true });

            } else if (n.type === 'filter') {
                nodeId = evalFilter(n, session.data) ? n.trueNode : n.falseNode;

            } else if (n.type === 'action') {
                // Зберігаємо останню AI відповідь в session.data для {{ai_response}}
                if (session.aiHistory?.length) {
                    let lastAI = null;
                    for (let _hi = session.aiHistory.length - 1; _hi >= 0; _hi--) {
                        if (session.aiHistory[_hi].role === 'assistant') { lastAI = session.aiHistory[_hi]; break; }
                    }
                    if (lastAI) session.data.ai_response = lastAI.content;
                }
                await doAction(n, session, flow, botToken);
                nodeId = n.nextNode || null;

            } else if (n.type === 'api') {
                try {
                    if (!n.url || !/^https?:\/\//.test(n.url)) throw new Error('Invalid URL');
                    const _apiAbort = new AbortController();
                    const _apiTimer = setTimeout(() => _apiAbort.abort(), 10000);
                    // BUG FIX: валідуємо body як JSON перед відправкою
                    let _apiBody;
                    if (n.body) {
                        const _bodyInterped = interp(n.body, session.data);
                        try { JSON.parse(_bodyInterped); _apiBody = _bodyInterped; }
                        catch { _apiBody = JSON.stringify({ text: _bodyInterped }); } // fallback
                    }
                    // Підтримка custom headers з ноди (наприклад Authorization)
                    const _apiHeaders = { 'Content-Type': 'application/json' };
                    if (n.headers && typeof n.headers === 'object') {
                        Object.assign(_apiHeaders, n.headers);
                    }
                    if (n.authToken) _apiHeaders['Authorization'] = `Bearer ${n.authToken}`;
                    const r = await fetch(n.url, {
                        method: n.method || 'GET',
                        headers: _apiHeaders,
                        signal: _apiAbort.signal,
                        ...(_apiBody ? { body: _apiBody } : {})
                    });
                    clearTimeout(_apiTimer);
                    const _apiText = (await r.text()).slice(0, 2000);
                    session.data._apiResponse = _apiText;
                    session.data._apiStatus = r.status;
                    // Якщо відповідь JSON — розпаковуємо першу пару ключів в session.data
                    try {
                        const _apiJson = JSON.parse(_apiText);
                        if (_apiJson && typeof _apiJson === 'object' && !Array.isArray(_apiJson)) {
                            // Беремо тільки прості значення (рядки/числа), не рекурсивно
                            Object.entries(_apiJson).slice(0, 10).forEach(([k, v]) => {
                                if (typeof v !== 'object' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) {
                                    session.data[`api_${k}`] = String(v).slice(0, 500);
                                }
                            });
                        }
                    } catch { /* не JSON — ок */ }
                } catch(e) {
                    session.data._apiError = e.message;
                    console.warn('[webhook] api node error:', e.message);
                }
                nodeId = n.nextNode || null;

            } else if (n.type === 'talko_task') {
                // FIX BX: create TALKO task from bot flow node
                try {
                    const taskTitle = interp(n.taskTitle || n.text || 'Задача з боту', session.data);
                    const ownerId = _compData.ownerId || null;
                    // FIX CD: add required rendering fields: assigneeName, creatorName, deadlineDate, createdDate
                    const _today = new Date().toISOString().split('T')[0];
                    const taskData = {
                        title:        taskTitle,
                        status:       'new',
                        priority:     n.taskPriority || 'medium',
                        assigneeId:   ownerId,
                        assigneeName: _compData.ownerName || '',         // FIX CD
                        creatorId:    'system',
                        creatorName:  'TALKO Bot',                        // FIX CD
                        deadlineDate: _today,                             // FIX CD: default today
                        createdDate:  _today,                             // FIX CD
                        autoCreated:  true,
                        autoSource:   'bot_flow',
                        flowId:       flow?.id || null,
                        senderName:   session.senderName || '',
                        senderId:     String(session.senderId || ''),
                        channel:      session.channel || '',
                        contactData:  {
                            name:     session.data?.name || '',
                            phone:    session.data?.phone || '',
                            email:    session.data?.email || '',
                            message:  (session.data?.message || session.data?.main_problem || '').slice(0, 500),
                        },
                        createdAt:    admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt:    admin.firestore.FieldValue.serverTimestamp(),
                    };
                    await compRef.collection('tasks').add(taskData);
                    process.env.WEBHOOK_DEBUG && console.debug('[webhook] talko_task created:', taskTitle);
                } catch(e) { console.error('[webhook] talko_task error:', e.message); }
                nodeId = n.nextNode || null;

            } else if (n.type === 'talko_deal') {
                // FIX BX: create/update CRM deal from bot flow node
                try {
                    // {contact.name} → interp шукає data.name або data (через contact.* alias)
                    const _dealData = { ...session.data, name: session.data.name || session.senderName || session.senderId || 'Лід' };
                    const dealTitle = interp(n.dealTitle || '{contact.name} — запит з боту', _dealData);
                    const targetStage = n.dealStage || 'new';
                    const _tdContactId = session.channel + '_' + session.senderId;
                    // Спочатку шукаємо авто-лід (autoCreated=true, flowId=null)
                    // щоб оновити його замість створення дубля
                    let _tdAutoLid = null;
                    const _tdDealId = session._autoDealId || session.data?._autoDealId;
                    if (_tdDealId) {
                        const _tdDoc = await compRef.collection('crm_deals')
                            .doc(_tdDealId).get().catch(() => null);
                        if (_tdDoc?.exists && !_tdDoc.data()?.flowId) _tdAutoLid = _tdDoc;
                    }
                    // Потім шукаємо по botContactId + flowId
                    const existingDeals = _tdAutoLid
                        ? { empty: false, docs: [_tdAutoLid] }
                        : await compRef.collection('crm_deals')
                            .where('botContactId', '==', _tdContactId)
                            .where('flowId', '==', flow?.id || '')
                            .limit(1).get();
                    if (existingDeals.empty) {
                        // FIX CC: fetch pipeline to get pipelineId (required for CRM kanban query)
                        let ccPipelineId = 'default', ccStageColor = '#6b7280', ccProbability = 10;
                        try {
                            // Кеш pipeline з авто-ліду (якщо є) — уникаємо зайвого read
                            let _tdPipSnap = null;
                            const _hasPipCache = (session._autoPipId || session.data?._autoPipId);
                            if (_hasPipCache) {
                                ccPipelineId = session._autoPipId || session.data._autoPipId;
                                ccStageColor  = '#6b7280';
                                ccProbability = 10;
                            } else {
                                _tdPipSnap = await compRef.collection('crm_pipeline')
                                    .where('isDefault','==',true).limit(1).get();
                                if (_tdPipSnap && !_tdPipSnap.empty) {
                                    ccPipelineId = _tdPipSnap.docs[0].id;
                                    const ccStages = _tdPipSnap.docs[0].data()?.stages || [];
                                    const ccStage = ccStages.find(s => s.id === targetStage) || ccStages[0];
                                    ccStageColor = ccStage?.color || '#6b7280';
                                    ccProbability = ccStage?.probability || 10;
                                    // Кешуємо для наступних вузлів
                                    session.data._autoPipId = ccPipelineId;
                                }
                            }
                        } catch(e) { console.warn('[talko_deal] pipeline fetch error:', e.message); }
                        const dealRef = compRef.collection('crm_deals').doc();
                        const _botContactId = session.channel + '_' + session.senderId;
                        await dealRef.set({
                            id:            dealRef.id,
                            title:         dealTitle,
                            stage:         targetStage,
                            stageColor:    ccStageColor,
                            status:        'open',
                            amount:        0,
                            currency:      'UAH',
                            source:        'telegram_bot',
                            flowId:        flow?.id || null,
                            botContactId:  _botContactId,
                            contactId:     _botContactId,   // FIX: direct link for crmToggleDealChat
                            clientName:    session.senderName || '',
                            phone:         session.data?.phone || '',
                            description:   session.data?.ai_response || session.data?.main_problem || '',
                            pipelineId:    ccPipelineId,
                            probability:   ccProbability,
                            stageEnteredAt: admin.firestore.FieldValue.serverTimestamp(),
                            assignedToId:  _compData.ownerId || null,
                            assignedToName: _compData.ownerName || '',
                            createdAt:     admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
                        });
                        process.env.WEBHOOK_DEBUG && console.debug('[webhook] talko_deal created:', dealTitle);
                        // FIX: increment leadsCount on the funnel
                        if (flow?.id) {
                            await compRef.collection('funnels').doc(flow.id)
                                .update({ leadsCount: admin.firestore.FieldValue.increment(1) })
                                .catch(e => console.warn('[talko_deal] leadsCount:', e.message));
                        }
                    } else {
                        // Оновлюємо угоду (авто-лід або існуючу)
                        const _tdData = { ...session.data, name: session.data.name || session.senderName || session.senderId || 'Лід' };
                        const _tdTitle = interp(n.dealTitle || '{contact.name} — запит з боту', _tdData);
                        await existingDeals.docs[0].ref.update({
                            title:     _tdTitle,
                            stage:     targetStage,
                            flowId:    flow?.id || null,
                            clientName: session.senderName || '',
                            phone:     session.data?.phone || existingDeals.docs[0].data()?.phone || '',
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        // Кешуємо dealId для finish()
                        if (!session._autoDealId && !session.data._autoDealId) {
                            session._autoDealId = existingDeals.docs[0].id;
                            session.data._autoDealId = existingDeals.docs[0].id;
                        }
                    }
                } catch(e) { console.error('[webhook] talko_deal error:', e.message); }
                nodeId = n.nextNode || null;

            } else if (n.type === 'end' || n.type === 'finish') {
                if (n.text) {
                    const endText = interp(n.text, session.data);
                    await Promise.all([
                        sendMsg(channel, botToken, normalized.senderId, endText),
                        saveBotMessage(compRef, contactId, endText),
                    ]);
                }
                // PERF: finish() fire-and-forget — CRM запис не блокує відповідь
                finish(session, flow, compRef, channel, _compData)
                    .catch(e => console.error('[webhook] finish error:', e.message));
                nodeId = null;
                break;

            } else if (n.type === 'question') {
                // Питання — надсилаємо текст і чекаємо відповіді
                const qText = interp(n.text || n.question || '', session.data);
                if (qText.trim()) {
                    sendTyping(botToken, normalized.senderId).catch(()=>{});
                    await Promise.all([
                        sendMsg(channel, botToken, normalized.senderId, qText),
                        saveBotMessage(compRef, contactId, qText, null),
                    ]);
                }
                // Зберігаємо який ключ чекаємо (куди записати відповідь)
                // BUG 1 FIX: зберігаємо saveAs у вузлі сесії, не в _waitingKey (яке ніколи не читається)
                // waitNode.saveAs читається в блоці "Обробка вводу" (рядок ~892) — потрібен в nodeMap
                Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId,
                    currentNodeId: n.nextNode || null, waitingForInput: nodeId });
                Promise.all([
                    sessionRef.set(session, { merge: true }),
                    lockRef.delete().catch(()=>{}),
                ]).catch(e => console.error('[webhook] session save question:', e.message));
                return res.status(200).json({ ok: true });

            } else if (n.type === 'buttons') {
                // Кнопки — надсилаємо текст з кнопками і чекаємо вибору
                const bText = interp(n.text || '', session.data);
                const btns = n.buttons || n.options || [];
                if (bText.trim() || btns.length) {
                    sendTyping(botToken, normalized.senderId).catch(()=>{});
                    await Promise.all([
                        sendMsg(channel, botToken, normalized.senderId, bText || '...', btns.length ? btns : null),
                        saveBotMessage(compRef, contactId, bText || '...', btns.length ? btns : null), // FIX 4
                    ]);
                }
                Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId,
                    currentNodeId: nodeId, waitingForInput: nodeId });
                Promise.all([
                    sessionRef.set(session, { merge: true }),
                    lockRef.delete().catch(()=>{}),
                ]).catch(e => console.error('[webhook] session save buttons:', e.message));
                return res.status(200).json({ ok: true });

            } else if (n.type === 'condition') {
                // FIX 1: уніфіковано з evalFilter — однакова логіка, більше операторів
                // Підтримує: eq, neq, contains, exists, not_exists, empty, gt, lt, starts_with, regex
                const condResult = evalFilter(n, session.data);
                nodeId = condResult ? (n.trueNode || n.nextNode || null) : (n.falseNode || n.nextNode || null);
                continue;

            } else if (n.type === 'delay') {
                // Затримка — чекаємо вказану кількість секунд (max 30s для serverless)
                // BUG 3 FIX: Vercel serverless timeout ~10-30s — cap delay at 5s max
                // Великі затримки (>5s) потребують окремого scheduler/job (не serverless)
                const _delayReq = (n.delaySeconds || n.seconds || 1) * 1000;
                const delayMs = Math.min(_delayReq, 5000);
                if (_delayReq > 5000) console.warn('[webhook] delay node: requested', _delayReq, 'ms, capped to 5000ms (serverless limit)');
                await new Promise(r => setTimeout(r, delayMs));
                nodeId = n.nextNode || null;

            } else if (n.type === 'human') {
                // Передача менеджеру — встановлюємо флаг human mode і нотифікуємо
                session.humanMode = true;
                session.humanModeAt = Date.now();
                const humanText = interp(n.text || 'Зʼєднуємо вас з менеджером...', session.data);
                await Promise.all([
                    sendMsg(channel, botToken, normalized.senderId, humanText),
                    saveBotMessage(compRef, contactId, humanText),
                ]);
                // Нотифікуємо адміна з деталями контакту
                if (_compData?.managerChatId || _compData?.telegramChatId) {
                    const adminChatId = String(_compData.managerChatId || _compData.telegramChatId);
                    const _ctName = session.senderName || session.senderId;
                    const _ctPhone = session.data?.phone || '';
                    // FIX 9: додаємо contactId для швидкого переходу в чат
                    const _ctId = contactId;
                    let adminMsg = `🙋 <b>${_ctName}</b> просить менеджера`;
                    if (_ctPhone) adminMsg += `
📞 ${_ctPhone}`;
                    if (session.data?.name) adminMsg += `
👤 ${session.data.name}`;
                    adminMsg += `
🔗 ID: <code>${_ctId}</code>`;
                    sendTg(botToken, adminChatId, adminMsg).catch(()=>{});
                }
                nodeId = n.nextNode || null;

            } else if (n.type === 'tag') {
                // Тегування контакту
                try {
                    const tagValue = interp(n.tagValue || n.tag || '', session.data).trim().slice(0, 50);
                    if (tagValue && contactId) {
                        // Зберігаємо в session.tags для finish()
                        if (!session.tags) session.tags = [];
                        if (!session.tags.includes(tagValue)) session.tags.push(tagValue);

                        // PERF: оновлюємо contacts + crm_clients паралельно
                        const _tagOps = [
                            compRef.collection('contacts').doc(contactId).update({
                                tags: admin.firestore.FieldValue.arrayUnion(tagValue),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            }).catch(()=>{}),
                        ];
                        if (session._autoClientId) {
                            _tagOps.push(
                                compRef.collection('crm_clients').doc(session._autoClientId).update({
                                    tags: admin.firestore.FieldValue.arrayUnion(tagValue),
                                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                                }).catch(()=>{})
                            );
                        }
                        await Promise.all(_tagOps);
                    }
                } catch(e) { console.error('[webhook] tag node:', e.message); }
                nodeId = n.nextNode || null;

            } else {
                nodeId = n.nextNode || null;
            }
        }

        // ── Зберігаємо сесію ─────────────────────────────────
        if (!nodeId) {
            // FIX 5: очищаємо дані сесії після завершення флоу
            // Зберігаємо _auto* — потрібні для наступного finish()
            const _savedAutoClientId = session._autoClientId || session.data?._autoClientId;
            const _savedAutoDealId   = session._autoDealId   || session.data?._autoDealId;
            Object.assign(session, {
                currentFlowId: null, currentNodeId: null, waitingForInput: null,
                data: {}, aiHistory: [], tags: [],
                _autoClientId: _savedAutoClientId || null,
                _autoDealId:   _savedAutoDealId   || null,
            });
        } else {
            Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId, currentNodeId: nodeId });
        }
        // FIX-6: release session lock
        lockRef.delete().catch(()=>{});
        session.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        // Обмежуємо розмір session.data — видаляємо великі поля
        if (session.data) {
            const _dataKeys = Object.keys(session.data);
            if (_dataKeys.length > 50) {
                // Зберігаємо тільки останні 50 ключів
                const _keep = new Set(_dataKeys.slice(-50));
                session.data = Object.fromEntries(
                    Object.entries(session.data).filter(([k]) => _keep.has(k))
                );
            }
            // Обрізаємо значення що перевищують 2000 символів
            for (const k of Object.keys(session.data)) {
                if (typeof session.data[k] === 'string' && session.data[k].length > 2000) {
                    session.data[k] = session.data[k].slice(0, 2000);
                }
            }
        }
        // Обмежуємо aiHistory перед збереженням (Firestore 1MB limit)
        if (Array.isArray(session.aiHistory)) {
            const _ahChars = session.aiHistory.reduce((s,m) => s + (m.content||'').length, 0);
            if (_ahChars > 30000) session.aiHistory = session.aiHistory.slice(-6);
        }
        // FIX 3: видаляємо технічні поля перед збереженням
        // BUG FIX: обмежуємо розмір сесії — не зберігаємо великі технічні поля
        // PERF 8: session.set fire-and-forget — відповідь вже надіслана юзеру
        const { _botToken, _cachedFlow: _cf, ...sessionToSave } = session;
        // Повертаємо _cachedFlow тільки якщо він невеликий (< 20 нод)
        if (_cf && _cf.nodes?.length <= 20) sessionToSave._cachedFlow = _cf;
        sessionRef.set(sessionToSave, { merge: true }).catch(e => console.error('[webhook] final session.set:', e.message));

        // Safety limit warning
        if (safety > 50) console.error('[webhook] SAFETY LIMIT reached for session:', sessionId, 'last nodeId:', nodeId);

        // Якщо повідомлення прийшло коли флоу вже завершений (не /start, не кнопка)
        // і воно не було оброблено флоу — зберігаємо для ручного чату менеджера
        if (!isStart && !session.waitingForInput && sessionToSave.currentFlowId === null) {
            // Зберігаємо для ручного чату менеджера
            await saveIncomingMessage(compRef, channel, normalized, botDocId || session.currentBotId);
        }
        lockRef.delete().catch(()=>{});
        return res.status(200).json({ ok: true });

    } catch(err) {
        console.error('[webhook] ERROR:', err.message, err.stack);
        if (typeof lockRef !== 'undefined') lockRef.delete().catch(()=>{});
        return res.status(200).json({ ok: true }); // завжди 200 щоб Telegram не ретраїв
    }
};

// ── Helpers ───────────────────────────────────────────────

function resolveNext(node, userText) {
    if (!node) return null;
    // Пошук по btn_N індексу (формат callback_data)
    const btnMatch = String(userText || '').match(/^btn_(\d+)/);
    const idx = btnMatch ? parseInt(btnMatch[1]) : -1;

    if (node.buttons?.length) {
        // FIX 3: перевіряємо nextNode !== undefined (не null) щоб уникнути циклу
        if (idx >= 0 && node.buttons[idx] !== undefined) {
            const btnNext = node.buttons[idx]?.nextNode;
            if (btnNext) return btnNext; // є конкретний nextNode
        }
        const b = node.buttons.find(b => b.label === userText || b.value === userText || b.text === userText);
        if (b?.nextNode) return b.nextNode;
    }
    if (node.options?.length) {
        if (idx >= 0 && node.options[idx] !== undefined) {
            const optNext = node.options[idx]?.nextNode;
            if (optNext) return optNext;
        }
        const o = node.options.find(o => o.label === userText || o.value === userText || o.text === userText);
        if (o?.nextNode) return o.nextNode;
    }
    // FIX 3: nextNode може бути той самий вузол — захист від циклу
    const fallback = node.nextNode || null;
    return (fallback && fallback !== node.id) ? fallback : null;
}

function interp(text, data) {
    if (!text) return '';
    if (!data || typeof data !== 'object') return String(text);
    // Sanitize helper — очищаємо HTML теги з підставлюваних значень
    // щоб не зламати Telegram HTML parse_mode при підстановці AI відповіді
    const _sanitize = (val) => {
        if (val == null) return '';
        return String(val)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .slice(0, 1000); // обмежуємо довжину одного значення
    };
    return (text || '')
        .replace(/\{\{contact\.(\w+)\}\}/g, (_, k) => _sanitize(data[k] ?? data.name ?? ''))
        .replace(/\{\{(\w+)\}\}/g,            (_, k) => _sanitize(data[k] ?? ''))
        .replace(/\{contact\.(\w+)\}/g,      (_, k) => _sanitize(data[k] ?? data.name ?? ''))
        .replace(/\{(\w+)\}/g,                (_, k) => (data[k] != null ? _sanitize(data[k]) : `{${k}}`));
}

function evalFilter(node, data) {
    if (!node || !data) return false;
    // Підтримуємо обидва формати полів: condVar/condOp/condVal і variable/operator/value
    const varName = node.condVar || node.variable || node.conditionField || node.field || '';
    const op = node.condOp || node.operator || node.conditionOp || 'exists';
    const expected = String(node.condVal ?? node.value ?? node.conditionValue ?? '');
    const rawVal = data[varName];
    // FIX: exists/not_exists — число 0 і false мають вважатись existing values
    const hasVal = rawVal !== undefined && rawVal !== null && rawVal !== '';
    const val = hasVal ? String(rawVal) : '';
    switch(op) {
        case 'eq': case 'equals':
            // Case-insensitive порівняння
            return val.toLowerCase() === expected.toLowerCase();
        case 'neq': case 'not_equals':
            return val.toLowerCase() !== expected.toLowerCase();
        case 'contains':
            return val.toLowerCase().includes(expected.toLowerCase());
        case 'not_contains':
            return !val.toLowerCase().includes(expected.toLowerCase());
        case 'gt': return parseFloat(val) > parseFloat(expected);
        case 'lt': return parseFloat(val) < parseFloat(expected);
        case 'gte': return parseFloat(val) >= parseFloat(expected);
        case 'lte': return parseFloat(val) <= parseFloat(expected);
        case 'exists': return hasVal;
        case 'not_exists': case 'empty': return !hasVal;
        case 'starts_with': return val.toLowerCase().startsWith(expected.toLowerCase());
        case 'ends_with': return val.toLowerCase().endsWith(expected.toLowerCase());
        case 'regex': {
            try { return new RegExp(expected, 'i').test(val); }
            catch { return false; }
        }
        default: return hasVal;
    }
}

async function doAction(node, session, flow, botToken) {
    if (node.actionType === 'set_var') {
        try {
            const p = typeof node.actionPayload === 'string' ? JSON.parse(node.actionPayload) : node.actionPayload;
            if (p?.variable) {
                const _k = String(p.variable).slice(0, 50);
                if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(_k) && !['__proto__','constructor','prototype'].includes(_k)) {
                    session.data[_k] = String(p.value || '').slice(0, 500);
                }
            }
        } catch {}
    } else if (node.actionType === 'set_tag' || node.actionType === 'add_tag') {
        if (!session.tags) session.tags = [];
        if (node.actionPayload) {
            const _tag = String(node.actionPayload).trim().slice(0, 50);
            if (_tag && !session.tags.includes(_tag)) session.tags.push(_tag);
            if (session.tags.length > 20) session.tags = session.tags.slice(-20);
        }
    } else if (node.actionType === 'notify_admin') {
        const chatId = node.config?.notifyChatId || node.notifyChatId;
        // Використовуємо окремий адмін бот для сповіщень
        const adminToken = process.env.ADMIN_BOT_TOKEN || botToken;
        if (chatId && adminToken) {
            const flowDisplayName = node.config?.notifyFlowName || flow?.name || flow?.title || '';
            let text = node.config?.notifyText || node.notifyText || '🔔 Новий лід: {{senderName}}';
            text = text
                .replace(/\{\{senderName\}\}/g, session.senderName || '')
                .replace(/\{\{senderId\}\}/g, session.senderId || '')
                .replace(/\{\{channel\}\}/g, session.channel || '')
                .replace(/\{\{flowName\}\}/g, flowDisplayName || session.currentFlowId || '')
                .replace(/\{\{flowId\}\}/g, session.currentFlowId || '')
                .replace(/\{\{(\w+)\}\}/g, (_, k) => {
                    const val = session.data?.[k] || '';
                    // FIX 8: truncate великі значення щоб не перевищити ліміт Telegram 4096 символів
                    return String(val).slice(0, 800);
                });
            // Загальний truncate повідомлення
            if (text.length > 4000) text = text.slice(0, 4000) + '...';
            // PERF: notify_admin fire-and-forget — не блокує наступний вузол
            sendTg(adminToken, chatId, text).catch(e => console.warn('[notify_admin]', e.message));
        }
    }
}

async function callAI(node, userText, session, compRef, compData) {
    try {
        // FIX 5: compData передається зовні щоб уникнути зайвого Firestore read
        if (!compData) {
            const compDoc = await compRef.get();
            compData = compDoc.data() || {};
        }
        const provider = node.config?.aiProvider || node.aiProvider || 'openai';
        const model = node.config?.aiModel || node.aiModel || node.model || 'gpt-4o-mini';
        const apiKey = node.config?.aiApiKey || node.aiApiKey
            || compData[provider + 'ApiKey']
            || (provider === 'openai' || provider === 'deepseek' ? compData.openaiApiKey : null)
            || (provider === 'openai' || provider === 'deepseek' ? process.env.OPENAI_API_KEY : null);

        process.env.WEBHOOK_DEBUG && console.debug('[callAI] provider:', provider, 'model:', model, 'apiKey exists:', !!apiKey);
        if (!apiKey) return node.config?.fallback || node.fallback || 'Вибачте, AI недоступний.';

        const _rawSys = node.config?.aiSystem || node.aiSystem || node.systemPrompt || 'You are helpful.';
        const sysPrompt = _rawSys + '\n\nВАЖЛИВО: Завжди відповідай ТІЛЬКИ українською мовою.';

        // PERF 3: адаптивний max_tokens — коротші відповіді = швидше
        // Якщо промпт короткий (<500 chars) і немає інструкцій "детально/повністю/список" → 600 tokens
        const _longKeywords = /детально|докладно|повністю|список|перерахуй|опиши|розкажи|поясни/i;
        const _maxTok = (_rawSys.length > 500 || _longKeywords.test(_rawSys) || _longKeywords.test(userText))
            ? 1500 : 600;

        // PERF 4: обрізаємо aiHistory до 6 останніх (3 пари) для швидкості
        // Повний контекст важливий тільки для довгих діалогів — 6 повідомлень достатньо для більшості
        const _histLimit = node.config?.historyLimit || 6;
        const _trimmedHistory = (session.aiHistory || []).slice(-_histLimit);

        const messages = [
            { role: 'system', content: sysPrompt },
            ..._trimmedHistory,
            { role: 'user', content: userText }
        ];

        let responseText = null;

        // BUG H FIX: aiAbort/aiTimeout оголошені ПЕРЕД try щоб catch мав до них доступ.
        const aiAbort = new AbortController();
        let aiTimeout = setTimeout(() => aiAbort.abort(), 25000);

        // ── OpenAI / Deepseek (same API format) ──────────────
        if (provider === 'openai' || provider === 'deepseek' || model.startsWith('gpt-') || model.startsWith('o3') || model.startsWith('o4') || model.startsWith('o1') || model.startsWith('deepseek')) {
            const baseUrl = (provider === 'deepseek' || model.startsWith('deepseek'))
                ? 'https://api.deepseek.com/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions';
            const _oaBody = JSON.stringify({
                model,
                ...(model.startsWith('o3') || model.startsWith('o4') || model.startsWith('gpt-5')
                    ? { max_completion_tokens: _maxTok }
                    : { max_tokens: _maxTok }),
                temperature: node.config?.temperature ?? 0.7,
                messages
            });
            let r = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                signal: aiAbort.signal,
                body: _oaBody,
            });
            // BUG FIX: retry при 429 (rate limit) — чекаємо retry-after
            if (r.status === 429) {
                const _retryAfter = parseInt(r.headers.get('retry-after') || '3') * 1000;
                console.warn('[callAI] OpenAI 429, retry after', _retryAfter, 'ms');
                await new Promise(res => setTimeout(res, Math.min(_retryAfter, 10000)));
                r = await fetch(baseUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: _oaBody,
                });
            }
            const d = await r.json();
            clearTimeout(aiTimeout);
            if (!r.ok) console.error('[callAI] OpenAI error', r.status, d.error?.message || d.error || '');
            else process.env.WEBHOOK_DEBUG && console.debug('[callAI] status:', r.status, 'tokens:', d.usage?.total_tokens);
            responseText = d.choices?.[0]?.message?.content || null;

        // ── Anthropic Claude ──────────────────────────────────
        } else if (provider === 'anthropic' || model.startsWith('claude')) {
            const r = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                signal: aiAbort.signal,
                body: JSON.stringify({
                    model,
                    max_tokens: _maxTok,
                    temperature: node.config?.temperature ?? 0.7, // FIX 12: temperature for Anthropic
                    system: sysPrompt,
                    messages: [..._trimmedHistory, { role: 'user', content: userText }]
                })
            });
            const d = await r.json();
            clearTimeout(aiTimeout);
            process.env.WEBHOOK_DEBUG && console.debug('[callAI] Anthropic status:', r.status, 'error:', d.error?.message || 'none');
            responseText = d.content?.[0]?.text || null;

        // ── Google Gemini ─────────────────────────────────────
        } else if (provider === 'google' || model.startsWith('gemini')) {
            const geminiModel = model || 'gemini-2.0-flash-lite'; // FIX 10: flash-lite швидший для чат-ботів
            // Gemini: конвертуємо aiHistory в Gemini contents format
            // FIX 10b: фільтруємо порожні повідомлення — Gemini відхиляє їх
            const _geminiHistory = (session.aiHistory || [])
                .filter(m => m.content && m.content.trim())
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content.slice(0, 8000) }], // Gemini має менший контекст
                }));
            const _geminiContents = [
                ..._geminiHistory,
                { role: 'user', parts: [{ text: userText }] },
            ];
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: aiAbort.signal,
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: sysPrompt }] },
                    contents: _geminiContents,
                    generationConfig: {
                        maxOutputTokens: _maxTok, // PERF 3: adaptive
                        temperature: node.config?.temperature ?? 0.7,
                    },
                })
            });
            const d = await r.json();
            clearTimeout(aiTimeout);
            process.env.WEBHOOK_DEBUG && console.debug('[callAI] Google status:', r.status, 'error:', d.error?.message || 'none');
            responseText = d.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }

        clearTimeout(aiTimeout); // BUG H FIX: завжди чистимо таймер перед поверненням
        return responseText || node.config?.fallback || node.fallback || 'Дякуємо!';
    } catch(e) {
        if (typeof aiTimeout !== 'undefined') clearTimeout(aiTimeout);
        if (e.name === 'AbortError') {
            console.error('[callAI] TIMEOUT after 25s');
            return node.config?.fallback || node.fallback || 'Вибачте, відповідь зайняла надто довго. Спробуйте ще раз.';
        }
        console.error('[callAI]', e.message);
        return node.config?.fallback || node.fallback || 'Виникла помилка.';
    }
}

// Зберегти повідомлення бота в contacts/{id}/messages/
async function saveBotMessage(compRef, contactId, text, buttons) {
    if (!compRef || !contactId || !text) return;
    try {
        const clean = (text||'').replace(/<[^>]+>/g, '').trim(); // strip HTML теги
        const msgData = {
            text:      clean.slice(0, 2000),
            from:      'bot',
            direction: 'out',
            read:      true,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };
        // FIX 4: зберігаємо кнопки щоб менеджер бачив їх в чаті
        if (buttons?.length) {
            msgData.buttons = buttons.slice(0, 10).map(b => ({
                label: (b.label || b.text || '').slice(0, 100),
                nextNode: b.nextNode || null,
            }));
        }
        // PERF: messages.add + contacts.set паралельно
        await Promise.all([
            compRef.collection('contacts').doc(contactId)
                .collection('messages').add(msgData),
            compRef.collection('contacts').doc(contactId).set({
                lastMessage:     clean.slice(0, 100),
                lastMessageAt:   admin.firestore.FieldValue.serverTimestamp(),
                lastMessageFrom: 'bot',
            }, { merge: true }),
        ]);
    } catch(e) { console.error('[saveBotMsg]', e.message); }
}

async function sendTg(token, chatId, text, buttons) {
    if (!token || !chatId) return;
    // Конвертуємо markdown → HTML для Telegram
    // Якщо текст вже містить HTML теги — не escapeємо (AI міг відповісти в HTML)
    const _hasHtml = /<(b|i|code|pre|a|s|u|tg-spoiler)[\s>]/.test(text || '');
    let safeText;
    if (_hasHtml) {
        // Текст вже в HTML — тільки обрізаємо до 4096
        safeText = (text || ' ').trim();
    } else {
        // Plain text або markdown — конвертуємо
        safeText = (text || ' ').trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\*(.*?)\*/g, '<i>$1</i>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }
    // Telegram limit: 4096 chars. Обрізаємо з позначкою
    if (safeText.length > 4096) safeText = safeText.slice(0, 4090) + '...';
    const payload = { chat_id: chatId, text: safeText, parse_mode: 'HTML' };
    if (buttons?.length) {
        // Кожна кнопка на окремому рядку (Telegram обрізає довгі рядки)
        payload.reply_markup = { inline_keyboard: buttons.map((b, i) => [
            b.url
                ? { text: b.label || b.text || '?', url: b.url }
                : { text: b.label || b.text || '?', callback_data: `btn_${i}` }
        ])};
    }
    try {
        const _tgAbort = new AbortController();
        const _tgTimer = setTimeout(() => _tgAbort.abort(), 8000);
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload), signal: _tgAbort.signal
        });
        clearTimeout(_tgTimer);
        const result = await r.json();
        if (!result.ok) {
            if (result.error_code === 429) {
                // Rate limit — чекаємо і повторюємо один раз
                const retryAfter = (result.parameters?.retry_after || 3) * 1000;
                await new Promise(res => setTimeout(res, Math.min(retryAfter, 10000)));
                const r2 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }).catch(() => null);
                return r2 ? await r2.json().catch(() => null) : null;
            }
            console.error('[sendTg] Error:', result.description, JSON.stringify(payload).slice(0, 200));
        }
        return result;
    } catch(e) {
        if (e.name === 'AbortError') console.error('[sendTg] TIMEOUT 8s');
        else console.error('[sendTg] fetch error:', e.message);
    }
}

async function sendViber(token, receiverId, text, buttons) {
    if (!token || !receiverId) return;
    const payload = {
        receiver: receiverId,
        min_api_version: 1,
        sender: { name: 'TALKO CRM' },
        type: 'text',
        text: (text || ' ').trim().slice(0, 7000),
    };
    if (buttons?.length) {
        // Viber keyboard
        payload.keyboard = {
            Type: 'keyboard',
            DefaultHeight: false,
            Buttons: buttons.slice(0, 6).map(b => ({
                ActionType: b.url ? 'open-url' : 'reply',
                ActionBody: b.url || b.label || b.text || '?',
                Text: b.label || b.text || '?',
                TextSize: 'regular',
            })),
        };
    }
    try {
        const _vAbort = new AbortController();
        const _vTimer = setTimeout(() => _vAbort.abort(), 8000);
        const r = await fetch('https://chatapi.viber.com/pa/send_message', {
            method: 'POST',
            headers: { 'X-Viber-Auth-Token': token, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: _vAbort.signal,
        });
        clearTimeout(_vTimer);
        const result = await r.json();
        if (result.status !== 0) console.error('[sendViber] Error:', result.status_message, result.status);
    } catch(e) {
        if (e.name === 'AbortError') console.error('[sendViber] TIMEOUT 8s');
        else console.error('[sendViber] fetch error:', e.message);
    }
}

// Єдина точка відправки — вибирає канал автоматично
async function sendMsg(channel, token, chatId, text, buttons) {
    if (channel === 'viber') return sendViber(token, chatId, text, buttons);
    return sendTg(token, chatId, text, buttons);
}

// Показує індикатор "бот друкує..." в Telegram
async function sendTyping(token, chatId) {
    if (!token || !chatId) return;
    try {
        fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, action: 'typing' })
        }).catch(() => {});
    } catch(e) {}
}

// Відправляє повідомлення і повертає message_id
async function sendTgGetId(token, chatId, text) {
    if (!token || !chatId) return null;
    let safeText = (text || ' ').trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    if (safeText.length > 4096) safeText = safeText.slice(0, 4090) + '...';
    try {
        const _ctrl = new AbortController();
        const _t = setTimeout(() => _ctrl.abort(), 8000);
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: safeText, parse_mode: 'HTML' }),
            signal: _ctrl.signal,
        });
        clearTimeout(_t);
        const result = await r.json();
        return result.ok ? result.result?.message_id : null;
    } catch(e) { return null; }
}

// Редагує існуюче повідомлення
async function editTg(token, chatId, messageId, text, buttons) {
    if (!token || !chatId || !messageId) return;
    const _eHasHtml = /<(b|i|code|pre|a|s|u)[\s>]/.test(text || '');
    let safeText = _eHasHtml
        ? (text || ' ').trim()
        : (text || ' ').trim()
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
            .replace(/\*(.*?)\*/g,'<i>$1</i>')
            .replace(/`(.*?)`/g,'<code>$1</code>');
    if (safeText.length > 4096) safeText = safeText.slice(0, 4090) + '...';
    const payload = { chat_id: chatId, message_id: messageId, text: safeText, parse_mode: 'HTML' };
    if (buttons?.length) {
        payload.reply_markup = { inline_keyboard: buttons.map((b,i) => [
            b.url ? { text: b.label||b.text||'?', url: b.url }
                  : { text: b.label||b.text||'?', callback_data: `btn_${i}` }
        ])};
    }
    try {
        const _eAbort = new AbortController();
        const _eTimer = setTimeout(() => _eAbort.abort(), 8000);
        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload), signal: _eAbort.signal,
        });
        clearTimeout(_eTimer);
    } catch(e) {
        if (e.name !== 'AbortError') console.error('[editTg]', e.message);
    }
}

// ─────────────────────────────────────────
// Зберегти вхідне повідомлення юзера для ручного чату
// Викликається коли флоу завершений або відсутній
// ─────────────────────────────────────────
async function saveIncomingMessage(compRef, channel, normalized, botId) {
    try {
        const contactId = `${channel}_${normalized.senderId}`;

        // BUG G FIX: повідомлення вже записане в ранньому блоці (рядок ~181).
        // Тут тільки оновлюємо метадані контакту — без дублів в messages.
        await compRef.collection('contacts').doc(contactId).set({
            senderId:        String(normalized.senderId),
            senderName:      normalized.senderName || '',
            channel,
            botId:           botId || null,
            lastMessage:     (normalized.text || '').slice(0, 100),
            lastMessageAt:   admin.firestore.FieldValue.serverTimestamp(),
            lastMessageFrom: 'user',
            unreadCount:     admin.firestore.FieldValue.increment(1),
            updatedAt:       admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        process.env.WEBHOOK_DEBUG && console.debug(`[saveIncoming] ${contactId}: "${normalized.text.slice(0, 50)}"`);
    } catch(e) {
        console.error('[saveIncoming]', e.message);
    }
}

async function finish(session, flow, compRef, channel, compData = {}) {
    try {
        const d = session.data || {};

        // BUG B FIX: idempotency guard — якщо finish вже запущено для цієї сесії/флоу, виходимо
        // Захищає від race condition коли два Telegram updates приходять одночасно і обидва тригерять finish()
        const finishLockId = `finish_${channel}_${session.senderId}_${flow?.id || 'noflow'}`;
        const lockRef = compRef.collection('_finish_locks').doc(finishLockId);
        // BUG FIX: setTimeout скидається при cold start → lock ніколи не видалявся
        // Тепер зберігаємо expiresAt в документ — перевіряємо при read (TTL = 5 хв)
        const _finishNow = Date.now();
        const lockResult = await db.runTransaction(async (tx) => {
            const lockDoc = await tx.get(lockRef);
            if (lockDoc.exists) {
                // Перевіряємо чи lock не протух (TTL 5 хв)
                const _lockExp = lockDoc.data()?.expiresAt || 0;
                if (_finishNow < _lockExp) return false; // ще живий — пропускаємо
                // Lock протух — перезаписуємо
            }
            tx.set(lockRef, {
                at: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: _finishNow + 300000, // 5 хв TTL
            });
            return true;
        });
        if (!lockResult) {
            console.log('[finish] skipped (idempotency lock):', finishLockId);
            return;
        }
        // Видаляємо lock після завершення (fire-and-forget)
        // Навіть якщо не видалиться — expiresAt гарантує повторний запуск через 5 хв
        setTimeout(() => lockRef.delete().catch(() => {}), 10000);

        // Зберігаємо лід (audit trail) — обрізаємо великі поля
        const _leadData = {};
        for (const [k, v] of Object.entries(d)) {
            if (typeof v === 'string' && v.length > 500) _leadData[k] = v.slice(0, 500);
            else if (typeof v !== 'object') _leadData[k] = v;
        }
        // Upsert контакт по senderId — всі поля по ТЗ
        const contactId = `${channel}_${session.senderId}`;
        const contactData = {
            senderId:      String(session.senderId),
            senderName:    session.senderName || '',
            username:      session.username   || '',
            channel,
            botId:         session.botId      || null,
            flowId:        flow?.id           || null,
            flowName:      flow?.name         || '',
            // Поля зібрані через [SAVE:key=value] в флоу
            phone:         d.phone            || '',
            role:          d.role             || '',
            business_type: d.business_type    || d.niche || '',
            main_problem:  d.main_problem     || '',
            main_goal:     d.main_goal        || '',
            search_time:   d.search_time      || '',
            ai_response:   d.ai_response      || session.aiSummary || '',
            tags:          session.tags       || [],
            unreadCount:   0,
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
        };

        // BUG B FIX: один set() замість двох — Firestore merge не перезаписує існуюче createdAt
        const contactRef = compRef.collection('contacts').doc(contactId);
        // PERF: leads.add і contactRef.set паралельно — незалежні операції
        await Promise.all([
            contactRef.set(
                { ...contactData, createdAt: admin.firestore.FieldValue.serverTimestamp() },
                { merge: true }
            ),
            compRef.collection('leads').add({
                senderId: String(session.senderId), senderName: session.senderName || '',
                channel, flowId: flow?.id || null, flowName: flow?.name || '',
                data: _leadData, tags: session.tags || [],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(e => console.warn('[finish] leads.add:', e.message)),
        ]);

        // ── AUTO CRM: записуємо в crm_clients + crm_deals ───
        try {
            const clientName = session.senderName || d.name || d.phone || 'Лід з бота';

            // Якщо авто-лід створив клієнта — використовуємо його ID без зайвого query
            let existingClients = null;
            if (session._autoClientId || session.data?._autoClientId) {
                // Fast path: клієнт вже є, беремо напряму
                existingClients = { empty: false, docs: [{ id: session.data._autoClientId, data: () => ({}) }] };
            } else {
                // Fallback: шукаємо по botContactId або senderId
                existingClients = await compRef.collection('crm_clients')
                    .where('botContactId', '==', contactId).limit(1).get().catch(() => null);
                if (!existingClients || existingClients.empty) {
                    existingClients = await compRef.collection('crm_clients')
                        .where('senderId', '==', String(session.senderId)).limit(1).get()
                        .catch(() => ({ empty: true, docs: [] }));
                }
            }

            let clientId;
            if (!existingClients.empty) {
                clientId = existingClients.docs[0].id;
                // Оновлюємо поля якщо з'явились нові дані
                await compRef.collection('crm_clients').doc(clientId).set({
                    name:        clientName,
                    phone:       d.phone || '',
                    niche:       d.business_type || d.niche || '',
                    mainProblem: d.main_problem || '',
                    mainGoal:    d.main_goal || '',
                    searchTime:  d.search_time || '',
                    role:        d.role || '',
                    aiSummary:   d.ai_response || '',
                    telegram:    session.username ? `@${session.username}` : '',
                    senderId:    String(session.senderId),
                    tags:        session.tags?.length ? session.tags : undefined,
                    updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
                // Також оновлюємо авто-deal якщо він був
                const _adId = session._autoDealId || session.data?._autoDealId;
                if (_adId) {
                    await compRef.collection('crm_deals').doc(_adId).set({
                        clientName:  clientName,
                        phone:       d.phone || '',
                        description: d.ai_response || d.main_problem || '',
                        tags:        session.tags || [],
                        updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true }).catch(e => console.warn('[finish:autoLidUpdate]', e.message));
                }
            } else {
                // Новий клієнт
                const clientRef = compRef.collection('crm_clients').doc();
                clientId = clientRef.id;
                await clientRef.set({
                    id:          clientId,
                    name:        clientName,
                    type:        'person',
                    phone:       d.phone || '',
                    telegram:    session.username ? `@${session.username}` : '',
                    niche:       d.business_type || d.niche || '',
                    source:      'telegram',
                    role:        d.role || '',
                    mainProblem: d.main_problem || '',
                    mainGoal:    d.main_goal || '',
                    searchTime:  d.search_time || '',
                    aiSummary:   d.ai_response || '',
                    botContactId: contactId,
                    senderId:    String(session.senderId),
                    tags:        session.tags || [],
                    createdAt:   admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            // Спочатку шукаємо авто-лід угоду (autoCreated=true) для цього контакту
            // щоб оновити її замість дублювання
            const _adIdLocal = session._autoDealId || session.data?._autoDealId;
            const _autoLidDeal = _adIdLocal
                ? await compRef.collection('crm_deals').doc(_adIdLocal).get().catch(() => null)
                : null;
            // Якщо є авто-лід deal — оновлюємо його flowId і вважаємо 'existing'
            let existingDeals;
            if (_autoLidDeal?.exists && !_autoLidDeal.data()?.flowId) {
                await compRef.collection('crm_deals').doc(_adIdLocal)
                    .update({ flowId: flow?.id || null, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
                    .catch(e => console.warn('[finish:flowId]', e.message));
                existingDeals = { empty: false, docs: [_autoLidDeal] };
            } else {
                existingDeals = await compRef.collection('crm_deals')
                    .where('botContactId', '==', contactId)
                    .where('flowId', '==', flow?.id || '')
                    .limit(1).get();
            }

            if (existingDeals.empty) {
                // Кешований pipeline з авто-ліду — уникаємо дублювання reads
                let pipelineId = session._autoPipId    || session.data?._autoPipId || 'default';
                let firstStage = { id: session._autoStageId  || session.data?._autoStageId || 'new', label: 'Новий', color: '#6b7280' };
                if (!session._autoPipId && !session.data?._autoPipId) { // зчитуємо pipeline тільки якщо кешу нема
                    const pipSnap = await compRef.collection('crm_pipeline')
                        .where('isDefault', '==', true).limit(1).get().catch(() => null);
                    if (pipSnap && !pipSnap.empty) {
                        pipelineId = pipSnap.docs[0].id;
                        firstStage = pipSnap.docs[0].data()?.stages?.[0] || firstStage;
                    }
                }

                const dealRef = compRef.collection('crm_deals').doc();
                // pipelineId вже оголошено вище (з кешу або з query)
                // Without it deal is created but NEVER appears on CRM kanban board
                await dealRef.set({
                    id:              dealRef.id,
                    title:           `Лід: ${clientName}`,
                    clientId,
                    clientName,
                    clientNiche:     d.business_type || d.niche || '',
                    stage:           firstStage.id,
                    stageColor:      firstStage.color || '#6b7280',
                    status:          'open',
                    amount:          0,
                    currency:        'UAH',
                    source:          'telegram_bot',
                    flowId:          flow?.id || null,
                    flowName:        flow?.name || '',
                    botContactId:    contactId,
                    contactId:       contactId,     // FIX: direct link for chat
                    phone:           d.phone || '',
                    description:     d.ai_response || d.main_problem || '',
                    tags:            session.tags || [],
                    pipelineId,                                          // FIX CB: critical for kanban query
                    probability:     firstStage.probability || 10,
                    stageEnteredAt:  admin.firestore.FieldValue.serverTimestamp(),
                    assignedToId:    compData.ownerId || null,          // FIX B: compData passed as param (was race condition with outer _compData)
                    assignedToName:  compData.ownerName || '',
                    createdAt:       admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt:       admin.firestore.FieldValue.serverTimestamp(),
                });

                await dealRef.collection('history').add({
                    type: 'created',
                    note: `Автоматично створено з воронки "${flow?.name || 'bot'}"`,
                    by:   'system',
                    at:   admin.firestore.FieldValue.serverTimestamp(),
                });
                // FIX: increment leadsCount + leadsToday on the funnel
                if (flow?.id) {
                    const today = new Date().toISOString().slice(0,10);
                    await compRef.collection('funnels').doc(flow.id)
                        .update({
                            leadsCount: admin.firestore.FieldValue.increment(1),
                            leadsToday: admin.firestore.FieldValue.increment(1),
                            leadsLastDate: today,
                        })
                        .catch(e => console.warn('[finish] leadsCount increment:', e.message));
                }
            }
        } catch(crmErr) {
            console.error('[finish][auto-crm]', crmErr.message);
        }
        // ── END AUTO CRM ─────────────────────────────────────

    } catch(e) { console.error('[finish]', e.message); }
}

// ─────────────────────────────────────────
// HANDLER: відправка повідомлення від менеджера
// POST /api/webhook?action=send-message
// Body: { companyId, contactId, text, botToken }
// ─────────────────────────────────────────
async function handleSendMessage(req, res, _authUser) {
    const { companyId, contactId, text, botToken } = req.body || {};
    if (!companyId || !contactId || !text) {
        return res.status(400).json({ error: 'Missing: companyId, contactId, text' });
    }
    if (typeof text !== 'string' || text.length > 4000) {
        return res.status(400).json({ error: 'text: max 4000 chars' });
    }
    // Sanitize IDs — Firestore doc IDs не можуть містити / або бути порожніми
    if (typeof companyId !== 'string' || companyId.includes('/') || companyId.length > 128)
        return res.status(400).json({ error: 'Invalid companyId' });
    if (typeof contactId !== 'string' || contactId.includes('/') || contactId.length > 200)
        return res.status(400).json({ error: 'Invalid contactId' });
    if (!db) return res.status(500).json({ error: 'DB not initialized' });

    try {
        const compRef = db.collection('companies').doc(companyId);

        // Отримуємо контакт щоб дізнатись senderId і канал
        // Перевіряємо чи юзер є членом компанії
        const memberDoc = await compRef.collection('users').doc(_authUser?.uid || '').get();
        if (!memberDoc.exists) return res.status(403).json({ error: 'Not a company member' });
        const memberRole = memberDoc.data()?.role || 'employee';
        if (!['owner','admin','manager'].includes(memberRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const contactDoc = await compRef.collection('contacts').doc(contactId).get();
        if (!contactDoc.exists) return res.status(404).json({ error: 'Contact not found' });
        const contact = contactDoc.data();

        // Зберігаємо повідомлення в messages підколекцію
        const msgRef = await compRef.collection('contacts').doc(contactId)
            .collection('messages').add({
                text,
                from: 'bot',       // від менеджера/бота
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                read: true,        // менеджер бачить одразу
                sentBy: 'operator',
            });

        // Оновлюємо lastMessage в контакті
        await compRef.collection('contacts').doc(contactId).update({
            lastMessage: text.slice(0, 100),
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessageFrom: 'bot',
        });

        // Відправляємо в Telegram
        let telegramOk = false;
        // SECURITY: ігноруємо botToken з req.body — завжди беремо з Firestore
        // FIX: шукаємо токен в 3 місцях: contact.botToken → bots/{botId} → companyData
        let token = contact.botToken || contact.integrations?.telegram?.botToken || null;
        if (!token && contact.botId) {
            try {
                const botDoc = await compRef.collection('bots').doc(contact.botId).get();
                token = botDoc.data()?.token || botDoc.data()?.botToken || null;
            } catch(e) { console.warn('[send-message] bot token lookup:', e.message); }
        }
        if (!token) {
            // Fallback: перший активний Telegram бот компанії
            try {
                const botsSnap = await compRef.collection('bots')
                    .where('channel', '==', 'telegram').limit(1).get();
                if (!botsSnap.empty) token = botsSnap.docs[0].data()?.token || null;
            } catch(e) { /* не критично */ }
        }
        if (!token) {
            // Last resort: companyData.integrations.telegram
            const compDoc2 = await compRef.get().catch(() => null);
            token = compDoc2?.data()?.integrations?.telegram?.botToken || null;
        }
        const senderId = contact.senderId;

        if (token && senderId && contact.channel === 'telegram') {
            try {
                const _smAbort = new AbortController();
                const _smTimer = setTimeout(() => _smAbort.abort(), 8000);
                const tgRes = await fetch(
                    `https://api.telegram.org/bot${token}/sendMessage`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: senderId, text, parse_mode: 'HTML' }),
                        signal: _smAbort.signal,
                    }
                );
                clearTimeout(_smTimer);
                const tgData = await tgRes.json();
                telegramOk = tgData.ok;
                if (!tgData.ok) {
                    console.error('[send-message] Telegram error:', tgData.description);
                    // Якщо заблокував — позначаємо
                    if (tgData.error_code === 403) {
                        await compRef.collection('contacts').doc(contactId).update({
                            botStatus: 'blocked',
                        });
                    }
                }
            } catch(e) {
                console.error('[send-message] fetch error:', e.message);
            }
        }

        return res.status(200).json({ ok: true, msgId: msgRef.id, telegramOk });

    } catch(e) {
        console.error('[send-message]', e.message);
        return res.status(500).json({ error: e.message });
    }
}

// ─────────────────────────────────────────
// HANDLER: позначити повідомлення як прочитані
// POST /api/webhook?action=mark-read
// Body: { companyId, contactId }
// ─────────────────────────────────────────
async function handleMarkRead(req, res) {
    const { companyId, contactId } = req.body || {};
    if (!companyId || !contactId) return res.status(400).json({ error: 'Missing params' });
    if (typeof companyId !== 'string' || companyId.includes('/') || companyId.length > 128)
        return res.status(400).json({ error: 'Invalid companyId' });
    if (typeof contactId !== 'string' || contactId.includes('/') || contactId.length > 200)
        return res.status(400).json({ error: 'Invalid contactId' });
    if (!db) return res.status(500).json({ error: 'DB not initialized' });

    // Перевіряємо _authUser переданий через req
    const _uid = req._authUid;
    try {
        const compRef = db.collection('companies').doc(companyId);

        // SECURITY: перевіряємо що юзер є членом цієї компанії
        if (_uid) {
            const memberDoc = await compRef.collection('users').doc(_uid).get();
            if (!memberDoc.exists) return res.status(403).json({ error: 'Not a member' });
        }

        // Скидаємо лічильник непрочитаних
        await compRef.collection('contacts').doc(contactId).update({
            unreadCount: 0,
        });

        // Позначаємо непрочитані повідомлення від юзера
        const unread = await compRef.collection('contacts').doc(contactId)
            .collection('messages')
            .where('read', '==', false)
            .where('from', '==', 'user')
            .limit(50).get();

        if (!unread.empty) {
            const batch = db.batch();
            unread.docs.forEach(doc => batch.update(doc.ref, { read: true }));
            await batch.commit();
        }

        return res.status(200).json({ ok: true, marked: unread.size });

    } catch(e) {
        return res.status(500).json({ error: e.message });
    }
}
