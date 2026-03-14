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
        return handleSendMessage(req, res);
    }

    // ── POST /api/webhook?action=mark-read ──────────────────
    // Позначити повідомлення як прочитані
    if (req.query.action === 'mark-read') {
        return handleMarkRead(req, res);
    }

    const { companyId, channel } = req.query;
    if (!companyId || !channel) return res.status(400).json({ error: 'Missing params' });

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
                senderId: String(from.id),
                senderName: [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || '',
                text: msg?.text || cb?.data || '',
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
                        const fbRes = await fetch(
                            `https://graph.facebook.com/v19.0/${leadId}?access_token=${fbToken}`
                        );
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
                        await compRef.collection(DB_COLS.CRM_DEALS).add({
                            title:      `FB Lead: ${fields.full_name || fields.name || leadId}`,
                            clientName: fields.full_name || fields.name || '',
                            phone:      fields.phone_number || fields.phone || '',
                            email:      fields.email || '',
                            source:     'facebook_lead',
                            stage:      fbFirstStage,
                            stageId:    fbFirstStage,
                            pipelineId: fbPipelineId,
                            fbLeadId:   leadId,
                            fbFormId:   formId || '',
                            fbPageId:   pageId || '',
                            leadData:   fields,
                            status:     'active',
                            createdBy:  'system',
                            createdAt:  admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt:  admin.firestore.FieldValue.serverTimestamp(),
                            stageEnteredAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        console.debug(`[webhook] FB Lead created: ${leadId}`);
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
                    const dstClean = dstRaw.replace(/\D/g, '');
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
                    const lockDoc = await lockRef.get();
                    if (lockDoc.exists) {
                        res.status(200).json({ ok: true, skipped: 'duplicate callId' });
                        return;
                    }
                    // expiresAt = 30 днів — для cleanup через Cloud Scheduler або вручну
                    const exp = new Date(); exp.setDate(exp.getDate() + 30);
                    await lockRef.set({ channel, callId, createdAt: ts, expiresAt: exp });
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
                    clientName = cl.data().name || normalPhone;
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
                    const active = allDeals.docs.find(d => d.data().status === 'active');
                    openDealSnap = active ? { empty: false, docs: [active] } : { empty: true };
                }

                if (!openDealSnap.empty) {
                    dealId = openDealSnap.docs[0].id;
                    await compRef.collection('crm_deals').doc(dealId).update({ updatedAt: ts });
                } else {
                    const pipelineSnap = await compRef.collection('crm_pipeline')
                        .where('isDefault','==',true).limit(1).get();
                    const pipelineId   = pipelineSnap.empty ? '' : pipelineSnap.docs[0].id;
                    const stages       = pipelineSnap.empty ? [] : (pipelineSnap.docs[0].data().stages || []);
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
                        status:       'active',
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



        console.debug(`[webhook] ${channel} from ${normalized.senderId}: "${normalized.text}"`);

        const compRef = db.collection('companies').doc(companyId);

        // FIX 5: читаємо compData один раз для всього запиту
        const _compDoc = await compRef.get();
        const _compData = _compDoc.data() || {};

        // ── Знаходимо бот токен ──────────────────────────────
        let botToken = null, botDocId = null;
        let botsSnap = await compRef.collection('bots').where('channel', '==', channel).limit(5).get();
        if (!botsSnap.empty) {
            const bd = botsSnap.docs[0];
            botDocId = bd.id;
            botToken = bd.data().token || bd.data().botToken;
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
        if (normalized.text && !normalized.text.startsWith('/start') && normalized.text !== 'start') {
            try {
                await db.collection('companies').doc(companyId)
                    .collection('contacts').doc(contactId)
                    .collection('messages').add({
                        text:      normalized.text,
                        from:      'user',
                        direction: 'in',
                        read:      false,
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    });
                // lastMessage + unreadCount (тільки якщо не в активному флоу — перевіримо пізніше)
                // unreadCount оновлюється в saveIncomingMessage якщо флоу завершений
            } catch(e) { console.error('[saveMsg]', e.message); }
        }

        // Підтверджуємо callback_query одразу (прибирає "годинник" на кнопці)
        if (callbackQueryId && botToken) {
            fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: callbackQueryId })
            }).catch(() => {});
        }

        // ── Сесія ─────────────────────────────────────────────
        const sessionId = `${channel}_${normalized.senderId}`;
        const sessionRef = compRef.collection('sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        let session = sessionDoc.exists ? sessionDoc.data() : {
            senderId: normalized.senderId, senderName: normalized.senderName || '',
            channel, currentFlowId: null, currentBotId: null,
            currentNodeId: null, waitingForInput: null,
            data: {}, tags: [],
        };
        // FIX CE: refresh senderName on every message (user may rename in Telegram)
        if (normalized.senderName) session.senderName = normalized.senderName;

        // FIX 1: Deduplication — ігноруємо повторний update_id від Telegram
        const updateId = body?.update_id || body?.entry?.[0]?.id || null;
        if (updateId && session.lastUpdateId === updateId) {
            console.debug('[webhook] Duplicate update_id, skipping:', updateId);
            return res.status(200).json({ ok: true, skipped: 'duplicate' });
        }
        if (updateId) session.lastUpdateId = updateId;

        const isStart = /^\/start/.test(normalized.text) || normalized.text === 'start';
        if (isStart) {
            Object.assign(session, { currentFlowId: null, currentNodeId: null, waitingForInput: null, data: {}, aiHistory: [] });
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
                    const trigger = fd.data().triggerKeyword || '/start';
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
            if (isStart) await sendMsg(channel, botToken, normalized.senderId, 'Вітаємо! Бот активний ✅');
            // Немає активного флоу — зберігаємо як вхідне повідомлення для ручного чату
            await saveIncomingMessage(compRef, channel, normalized, botDocId);
            return res.status(200).json({ ok: true, saved: 'no-flow-incoming' });
        }

        // ── Підвантажуємо canvasData + nodePrompts з підколекцій ──
        const flowDocRef = compRef.collection('bots').doc(currentBotId).collection('flows').doc(flow.id);

        // FIX 1: canvasData зберігається в підколекції, не в основному документі
        if (!flow.canvasData?.nodes?.length) {
            try {
                const canvasDoc = await flowDocRef.collection('canvasData').doc('layout').get();
                if (canvasDoc.exists) flow.canvasData = canvasDoc.data();
            } catch(e) { console.warn('[webhook] canvasData load error:', e.message); }
        }

        const promptsSnap = await flowDocRef.collection('nodePrompts').get();
        const nodePromptsMap = {};
        promptsSnap.forEach(doc => { nodePromptsMap[doc.id] = doc.data().aiSystem || ''; });

        const restorePrompts = (nodesList) => nodesList.map(n => {
            // FIX 2+3: перевіряємо обидва місця де може бути __ref
            const sysConfig = n.config?.aiSystem || '';
            const sysTop = n.aiSystem || '';
            const hasRef = sysConfig.startsWith('__ref:') || sysTop.startsWith('__ref:');
            if (hasRef) {
                const refId = (sysConfig.startsWith('__ref:') ? sysConfig : sysTop).replace('__ref:', '');
                const realPrompt = nodePromptsMap[refId] || '';
                const restored = JSON.parse(JSON.stringify(n));
                // Відновлюємо в обох місцях
                if (restored.config) restored.config.aiSystem = realPrompt;
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
            runtimeNodes.forEach(n => {
                const outEdge = edges.find(e => e.fromNode === n.id && e.fromPort === 'out');
                if (outEdge && !n.nextNode) n.nextNode = outEdge.toNode;
                if (n.buttons?.length) {
                    n.buttons = n.buttons.map((b, i) => {
                        if (b.nextNode) return b;
                        const btnEdge = edges.find(e => e.fromNode === n.id && e.fromPort === `btn_${i}`);
                        return btnEdge ? { ...b, nextNode: btnEdge.toNode } : b;
                    });
                    n.options = n.buttons.map(b => ({ label: b.label, nextNode: b.nextNode }));
                }
            });
        }

        console.debug(`[webhook] Flow: ${flow.id}, nodes: ${runtimeNodes.length}`);
        console.debug(`[webhook] Nodes:`, runtimeNodes.map(n => `${n.id}:${n.type}`).join(', '));

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
                    if (waitNode.saveAs) session.data[waitNode.saveAs] = userInput;
                    normalized.text = userInput;
                    nodeId = resolveNext(waitNode, normalized.text);
                    session.waitingForInput = null;
                }
            } else {
                nodeId = session.currentNodeId || firstNode?.id;
            }
        }

        if (!nodeId) {
            await sessionRef.set(session, { merge: true });
            return res.status(200).json({ ok: true });
        }

        // ── Виконуємо ланцюг вузлів ──────────────────────────
        // FIX 3: _botToken НЕ зберігаємо в сесії (security) — передаємо через env
        // session._botToken = botToken; — ВИДАЛЕНО
        let safety = 0;
        while (nodeId && safety++ < 30) {
            const n = nodeMap[nodeId];
            if (!n) { console.debug(`[webhook] Node not found: ${nodeId}`); break; }
            console.debug(`[webhook] Executing node ${nodeId} type=${n.type}`);

            if (n.type === 'message') {
                const text = interp(n.text || '', session.data);
                if (!text.trim()) { nodeId = n.nextNode || null; continue; }
                await sendTyping(botToken, normalized.senderId);
                const btns = n.buttons?.length ? n.buttons : (n.options?.length ? n.options : null);
                await sendMsg(channel, botToken, normalized.senderId, text, btns);
                await saveBotMessage(compRef, contactId, text);
                if (btns?.length) {
                    Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId,
                        currentNodeId: nodeId, waitingForInput: nodeId });
                    await sessionRef.set(session, { merge: true });
                    return res.status(200).json({ ok: true });
                }
                nodeId = n.nextNode || null;

            } else if (n.type === 'ai' || n.type === 'ai_response') {
                // AI вузол з пам'яттю
                if (!session.aiHistory) session.aiHistory = [];
                session.aiHistory.push({ role: 'user', content: normalized.text });
                if (session.aiHistory.length > 20) session.aiHistory = session.aiHistory.slice(-20);

                // Typing індикатор — шле кожні 4 сек поки AI думає (Telegram показує max 5 сек)
                let typingActive = true;
                const typingLoop = (async () => {
                    while (typingActive) {
                        await sendTyping(botToken, normalized.senderId);
                        await new Promise(r => setTimeout(r, 4000));
                    }
                })();

                // FIX 6: відправляємо ⏳ і зберігаємо message_id щоб потім відредагувати
                const isFirstAiMsg = !session.aiHistory || session.aiHistory.length <= 1;
                let thinkingMsgId = null;
                if (isFirstAiMsg) {
                    thinkingMsgId = await sendTgGetId(botToken, normalized.senderId, '⏳ Секунду, готую відповідь...');
                }

                const rawReply = await callAI(n, normalized.text, session, compRef, _compData);
                typingActive = false; // зупиняємо typing loop

                // Парсимо спеціальні теги з відповіді AI:
                // [BTN:текст] — динамічна кнопка
                // [DONE] — AI завершив збір даних, іти до наступного вузла
                // [SAVE:змінна=значення] — зберегти дані в сесію
                const btnMatches = [...rawReply.matchAll(/\[BTN:([^\]]+)\]/g)];
                const aiBtns = btnMatches.map((m, i) => ({ label: m[1], nextNode: null }));
                const isDone = rawReply.includes('[DONE]');

                // Парсимо [SAVE:key=value] теги
                const saveMatches = [...rawReply.matchAll(/\[SAVE:([^=\]]+)=([^\]]+)\]/g)];
                saveMatches.forEach(m => { session.data[m[1].trim()] = m[2].trim(); });

                // Чистимо відповідь від службових тегів
                const cleanReply = rawReply
                    .replace(/\[BTN:[^\]]+\]/g, '')
                    .replace(/\[DONE\]/g, '')
                    .replace(/\[SAVE:[^\]]+\]/g, '')
                    .trim();

                session.aiHistory.push({ role: 'assistant', content: cleanReply });
                // Зберігаємо останню AI відповідь для {{ai_response}} в наступних вузлах
                session.data.ai_response = cleanReply;

                if (cleanReply) {
                    // FIX 6: редагуємо ⏳ повідомлення якщо є message_id, інакше новим
                    if (thinkingMsgId) {
                        await editTg(botToken, normalized.senderId, thinkingMsgId, cleanReply, aiBtns.length ? aiBtns : null);
                    } else {
                        await sendMsg(channel, botToken, normalized.senderId, cleanReply, aiBtns.length ? aiBtns : null);
                        await saveBotMessage(compRef, contactId, cleanReply);
                    }
                }

                if (isDone && n.nextNode) {
                    // AI завершив — іти до наступного вузла в ланцюгу
                    console.debug('[webhook] AI DONE → next node:', n.nextNode);
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
                    await sessionRef.set(session, { merge: true });
                    return res.status(200).json({ ok: true });
                }

            } else if (n.type === 'pause') {
                Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId,
                    currentNodeId: n.nextNode || null, waitingForInput: nodeId });
                await sessionRef.set(session, { merge: true });
                return res.status(200).json({ ok: true });

            } else if (n.type === 'filter') {
                nodeId = evalFilter(n, session.data) ? n.trueNode : n.falseNode;

            } else if (n.type === 'action') {
                // Зберігаємо останню AI відповідь в session.data для {{ai_response}}
                if (session.aiHistory?.length) {
                    const lastAI = [...session.aiHistory].reverse().find(m => m.role === 'assistant');
                    if (lastAI) session.data.ai_response = lastAI.content;
                }
                await doAction(n, session, flow, botToken);
                nodeId = n.nextNode || null;

            } else if (n.type === 'api') {
                try {
                    const r = await fetch(n.url, { method: n.method || 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        ...(n.body ? { body: interp(n.body, session.data) } : {}) });
                    session.data._apiResponse = await r.text();
                } catch(e) { session.data._apiError = e.message; }
                nodeId = n.nextNode || null;

            } else if (n.type === 'talko_task') {
                // FIX BX: create TALKO task from bot flow node
                try {
                    const taskTitle = interp(n.taskTitle || n.text || 'Задача з боту', session.data);
                    // Знаходимо assignee по ролі: owner/manager → беремо з compData
                    const assignRole = n.taskAssignRole || 'owner';
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
                        senderId:     session.senderId || '',
                        channel:      session.channel || '',
                        contactData:  session.data || {},
                        createdAt:    admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt:    admin.firestore.FieldValue.serverTimestamp(),
                    };
                    await compRef.collection('tasks').add(taskData);
                    console.debug('[webhook] talko_task created:', taskTitle);
                } catch(e) { console.error('[webhook] talko_task error:', e.message); }
                nodeId = n.nextNode || null;

            } else if (n.type === 'talko_deal') {
                // FIX BX: create/update CRM deal from bot flow node
                try {
                    const dealTitle = interp(n.dealTitle || ('{contact.name} — запит з боту'), session.data)
                        .replace('{contact.name}', session.senderName || session.senderId || 'Лід');
                    const targetStage = n.dealStage || 'new';
                    // Перевіряємо чи вже є deal з цим контактом + флоу
                    const existingDeals = await compRef.collection('crm_deals')
                        .where('botContactId', '==', session.channel + '_' + session.senderId)
                        .where('flowId', '==', flow?.id || '')
                        .limit(1).get();
                    if (existingDeals.empty) {
                        // FIX CC: fetch pipeline to get pipelineId (required for CRM kanban query)
                        let ccPipelineId = 'default', ccStageColor = '#6b7280', ccProbability = 10;
                        try {
                            const ccPipSnap = await compRef.collection('crm_pipeline').where('isDefault','==',true).limit(1).get();
                            if (!ccPipSnap.empty) {
                                ccPipelineId = ccPipSnap.docs[0].id;
                                const ccStages = ccPipSnap.docs[0].data().stages || [];
                                const ccStage = ccStages.find(s => s.id === targetStage) || ccStages[0];
                                ccStageColor = ccStage?.color || '#6b7280';
                                ccProbability = ccStage?.probability || 10;
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
                        console.debug('[webhook] talko_deal created:', dealTitle);
                        // FIX: increment leadsCount on the funnel
                        if (flow?.id) {
                            await compRef.collection('funnels').doc(flow.id)
                                .update({ leadsCount: admin.firestore.FieldValue.increment(1) })
                                .catch(e => console.warn('[talko_deal] leadsCount:', e.message));
                        }
                    } else {
                        // Оновлюємо стадію якщо угода вже є
                        await existingDeals.docs[0].ref.update({
                            stage: targetStage,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }
                } catch(e) { console.error('[webhook] talko_deal error:', e.message); }
                nodeId = n.nextNode || null;

            } else if (n.type === 'end' || n.type === 'finish') {
                if (n.text) {
                    const endText = interp(n.text, session.data);
                    await sendMsg(channel, botToken, normalized.senderId, endText);
                    await saveBotMessage(compRef, contactId, endText);
                }
                await finish(session, flow, compRef, channel, _compData);
                nodeId = null;
                break;

            } else {
                nodeId = n.nextNode || null;
            }
        }

        // ── Зберігаємо сесію ─────────────────────────────────
        if (!nodeId) {
            // FIX 5: очищаємо дані сесії після завершення флоу
            Object.assign(session, {
                currentFlowId: null, currentNodeId: null, waitingForInput: null,
                data: {}, aiHistory: [], tags: [],
            });
        } else {
            Object.assign(session, { currentFlowId: flow.id, currentBotId: flow.botId, currentNodeId: nodeId });
        }
        session.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        // FIX 3: видаляємо технічні поля перед збереженням
        const { _botToken, ...sessionToSave } = session;
        await sessionRef.set(sessionToSave, { merge: true });

        // Якщо повідомлення прийшло коли флоу вже завершений (не /start, не кнопка)
        // і воно не було оброблено флоу — зберігаємо для ручного чату менеджера
        if (!isStart && !session.waitingForInput && sessionToSave.currentFlowId === null) {
            const wasFlowMessage = session._handledByFlow;
            if (!wasFlowMessage) {
                await saveIncomingMessage(compRef, channel, normalized, botDocId || session.currentBotId);
            }
        }
        return res.status(200).json({ ok: true });

    } catch(err) {
        console.error('[webhook] ERROR:', err.message, err.stack);
        return res.status(200).json({ ok: true }); // завжди 200 щоб Telegram не ретраїв
    }
};

// ── Helpers ───────────────────────────────────────────────

function resolveNext(node, userText) {
    // Пошук по btn_N індексу (формат callback_data)
    const btnMatch = String(userText || '').match(/^btn_(\d+)/);
    const idx = btnMatch ? parseInt(btnMatch[1]) : -1;

    if (node.buttons?.length) {
        if (idx >= 0 && node.buttons[idx]?.nextNode) return node.buttons[idx].nextNode;
        const b = node.buttons.find(b => b.label === userText || b.value === userText);
        if (b?.nextNode) return b.nextNode;
    }
    if (node.options?.length) {
        if (idx >= 0 && node.options[idx]?.nextNode) return node.options[idx].nextNode;
        const o = node.options.find(o => o.label === userText || o.value === userText);
        if (o?.nextNode) return o.nextNode;
    }
    return node.nextNode || null;
}

function interp(text, data) {
    // FIX 6: замінюємо змінні але екрануємо щоб не ламати HTML в sendTg
    return (text || '').replace(/\{\{(\w+)\}\}/g, (_, k) => {
        const val = data[k] || '';
        // Якщо значення вже містить HTML теги — не чіпаємо (наприклад ai_response)
        return String(val);
    });
}

function evalFilter(node, data) {
    // Підтримуємо обидва формати полів: condVar/condOp/condVal і variable/operator/value
    const varName = node.condVar || node.variable || node.conditionField || '';
    const op = node.condOp || node.operator || node.conditionOp || 'exists';
    const expected = node.condVal || node.value || node.conditionValue || '';
    const val = data[varName] || '';
    switch(op) {
        case 'eq': case 'equals': return String(val) === String(expected);
        case 'neq': return String(val) !== String(expected);
        case 'contains': return String(val).toLowerCase().includes(String(expected).toLowerCase());
        case 'gt': return parseFloat(val) > parseFloat(expected);
        case 'lt': return parseFloat(val) < parseFloat(expected);
        case 'exists': return !!val;
        case 'not_exists': return !val;
        case 'starts_with': return String(val).startsWith(String(expected));
        default: return !!val;
    }
}

async function doAction(node, session, flow, botToken) {
    if (node.actionType === 'set_var') {
        try {
            const p = typeof node.actionPayload === 'string' ? JSON.parse(node.actionPayload) : node.actionPayload;
            if (p?.variable) session.data[p.variable] = p.value || '';
        } catch {}
    } else if (node.actionType === 'set_tag' || node.actionType === 'add_tag') {
        if (!session.tags) session.tags = [];
        if (node.actionPayload) session.tags.push(node.actionPayload);
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
            await sendTg(adminToken, chatId, text).catch(() => {});
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
            || compData.openaiApiKey
            || process.env.OPENAI_API_KEY;

        console.debug('[callAI] provider:', provider, 'model:', model, 'apiKey exists:', !!apiKey);
        if (!apiKey) return node.config?.fallback || node.fallback || 'Вибачте, AI недоступний.';

        const sysPrompt = (node.config?.aiSystem || node.aiSystem || node.systemPrompt || 'You are helpful.')
            + '\n\nВАЖЛИВО: Завжди відповідай ТІЛЬКИ українською мовою.';
        const messages = [
            { role: 'system', content: sysPrompt },
            ...(session.aiHistory || []),
            { role: 'user', content: userText }
        ];

        let responseText = null;

        // BUG H FIX: aiAbort/aiTimeout оголошені ПЕРЕД try щоб catch мав до них доступ.
        // Раніше — якщо provider невідомий, aiTimeout не оголошувався → ReferenceError у catch.
        const aiAbort = new AbortController();
        let aiTimeout = setTimeout(() => aiAbort.abort(), 25000);

        // ── OpenAI / Deepseek (same API format) ──────────────
        if (provider === 'openai' || provider === 'deepseek' || model.startsWith('gpt-') || model.startsWith('o3') || model.startsWith('o4') || model.startsWith('o1') || model.startsWith('deepseek')) {
            const baseUrl = (provider === 'deepseek' || model.startsWith('deepseek'))
                ? 'https://api.deepseek.com/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions';
            const r = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                signal: aiAbort.signal,
                body: JSON.stringify({
                    model,
                    ...(model.startsWith('o3') || model.startsWith('o4') || model.startsWith('gpt-5')
                        ? { max_completion_tokens: 1500 }
                        : { max_tokens: 1500 }),
                    messages
                })
            });
            clearTimeout(aiTimeout);
            const d = await r.json();
            console.debug('[callAI] status:', r.status, 'error:', d.error?.message || 'none');
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
                    model, max_tokens: 1500,
                    system: sysPrompt,
                    messages: (session.aiHistory || []).concat([{ role: 'user', content: userText }])
                })
            });
            clearTimeout(aiTimeout);
            const d = await r.json();
            console.debug('[callAI] Anthropic status:', r.status, 'error:', d.error?.message || 'none');
            responseText = d.content?.[0]?.text || null;

        // ── Google Gemini ─────────────────────────────────────
        } else if (provider === 'google' || model.startsWith('gemini')) {
            const geminiModel = model || 'gemini-2.0-flash';
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: sysPrompt + '\n\n' + userText }] }]
                })
            });
            const d = await r.json();
            console.debug('[callAI] Google status:', r.status, 'error:', d.error?.message || 'none');
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
async function saveBotMessage(compRef, contactId, text) {
    if (!compRef || !contactId || !text) return;
    try {
        const clean = (text||'').replace(/<[^>]+>/g, '').trim(); // strip HTML теги
        await compRef.collection('contacts').doc(contactId)
            .collection('messages').add({
                text:      clean.slice(0, 2000),
                from:      'bot',
                direction: 'out',
                read:      true,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        await compRef.collection('contacts').doc(contactId).set({
            lastMessage:     clean.slice(0, 100),
            lastMessageAt:   admin.firestore.FieldValue.serverTimestamp(),
            lastMessageFrom: 'bot',
        }, { merge: true });
    } catch(e) { console.error('[saveBotMsg]', e.message); }
}

async function sendTg(token, chatId, text, buttons) {
    if (!token || !chatId) return;
    // Конвертуємо markdown bold/italic в HTML для Telegram
    let safeText = (text || ' ').trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // Відновлюємо тільки базові теги які Telegram підтримує
    safeText = safeText
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
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
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const result = await r.json();
        if (!result.ok) console.error('[sendTg] Error:', result.description, JSON.stringify(payload).slice(0, 200));
    } catch(e) { console.error('[sendTg] fetch error:', e.message); }
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
        const r = await fetch('https://chatapi.viber.com/pa/send_message', {
            method: 'POST',
            headers: { 'X-Viber-Auth-Token': token, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await r.json();
        if (result.status !== 0) console.error('[sendViber] Error:', result.status_message, result.status);
    } catch(e) { console.error('[sendViber] fetch error:', e.message); }
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
    try {
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: safeText, parse_mode: 'HTML' })
        });
        const result = await r.json();
        return result.ok ? result.result?.message_id : null;
    } catch(e) { return null; }
}

// Редагує існуюче повідомлення
async function editTg(token, chatId, messageId, text, buttons) {
    if (!token || !chatId || !messageId) return;
    let safeText = (text || ' ').trim()
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
        .replace(/\*(.*?)\*/g,'<i>$1</i>')
        .replace(/`(.*?)`/g,'<code>$1</code>');
    const payload = { chat_id: chatId, message_id: messageId, text: safeText, parse_mode: 'HTML' };
    if (buttons?.length) {
        payload.reply_markup = { inline_keyboard: buttons.map((b,i) => [
            b.url ? { text: b.label||b.text||'?', url: b.url }
                  : { text: b.label||b.text||'?', callback_data: `btn_${i}` }
        ])};
    }
    try {
        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
    } catch(e) { console.error('[editTg]', e.message); }
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
            senderId:        normalized.senderId,
            senderName:      normalized.senderName || '',
            channel,
            botId:           botId || null,
            lastMessage:     normalized.text.slice(0, 100),
            lastMessageAt:   admin.firestore.FieldValue.serverTimestamp(),
            lastMessageFrom: 'user',
            unreadCount:     admin.firestore.FieldValue.increment(1),
            updatedAt:       admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.debug(`[saveIncoming] ${contactId}: "${normalized.text.slice(0, 50)}"`);
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
        const lockResult = await db.runTransaction(async (tx) => {
            const lockDoc = await tx.get(lockRef);
            if (lockDoc.exists) return false; // вже виконується або виконано
            tx.set(lockRef, { at: admin.firestore.FieldValue.serverTimestamp() });
            return true;
        });
        if (!lockResult) {
            console.log('[finish] skipped (idempotency lock):', finishLockId);
            return;
        }
        // Автоматично видаляємо lock через 60 секунд (не блокуємо повторний запуск назавжди)
        setTimeout(() => lockRef.delete().catch(() => {}), 60000);

        // Зберігаємо лід (audit trail)
        await compRef.collection('leads').add({
            senderId: session.senderId, senderName: session.senderName || '',
            channel, flowId: flow?.id || null, flowName: flow?.name || '',
            data: d, tags: session.tags || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Upsert контакт по senderId — всі поля по ТЗ
        const contactId = `${channel}_${session.senderId}`;
        const contactData = {
            senderId:      session.senderId,
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
        await contactRef.set(
            { ...contactData, createdAt: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );

        // ── AUTO CRM: записуємо в crm_clients + crm_deals ───
        try {
            const clientName = session.senderName || d.name || d.phone || 'Лід з бота';

            // Перевіряємо чи вже є клієнт з таким senderId
            const existingClients = await compRef.collection('crm_clients')
                .where('senderId', '==', String(session.senderId)).limit(1).get();

            let clientId;
            if (!existingClients.empty) {
                clientId = existingClients.docs[0].id;
                // Оновлюємо поля якщо з'явились нові дані
                await compRef.collection('crm_clients').doc(clientId).set({
                    phone:       d.phone || '',
                    niche:       d.business_type || d.niche || '',
                    mainProblem: d.main_problem || '',
                    mainGoal:    d.main_goal || '',
                    aiSummary:   d.ai_response || '',
                    updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
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

            // Перевіряємо чи вже є відкрита угода з цим клієнтом з цієї воронки
            const existingDeals = await compRef.collection('crm_deals')
                .where('botContactId', '==', contactId)
                .where('flowId', '==', flow?.id || '')
                .limit(1).get();

            if (existingDeals.empty) {
                // Отримуємо першу стадію воронки
                const pipSnap = await compRef.collection('crm_pipeline')
                    .where('isDefault', '==', true).limit(1).get();
                const pipeline = !pipSnap.empty ? pipSnap.docs[0].data() : null;
                const firstStage = pipeline?.stages?.[0] || { id: 'new', label: 'Новий', color: '#6b7280' };

                const dealRef = compRef.collection('crm_deals').doc();
                // FIX CB: pipelineId is required — CRM _subscribeDeals filters .where('pipelineId','==',...)
                // Without it deal is created but NEVER appears on CRM kanban board
                const pipelineId = !pipSnap.empty ? pipSnap.docs[0].id : 'default';
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
                // FIX: increment leadsCount on the funnel
                if (flow?.id) {
                    await compRef.collection('funnels').doc(flow.id)
                        .update({ leadsCount: admin.firestore.FieldValue.increment(1) })
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
async function handleSendMessage(req, res) {
    const { companyId, contactId, text, botToken } = req.body || {};
    if (!companyId || !contactId || !text) {
        return res.status(400).json({ error: 'Missing: companyId, contactId, text' });
    }
    if (!db) return res.status(500).json({ error: 'DB not initialized' });

    try {
        const compRef = db.collection('companies').doc(companyId);

        // Отримуємо контакт щоб дізнатись senderId і канал
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
        const token = botToken || contact.botToken;
        const senderId = contact.senderId;

        if (token && senderId && contact.channel === 'telegram') {
            try {
                const tgRes = await fetch(
                    `https://api.telegram.org/bot${token}/sendMessage`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: senderId, text, parse_mode: 'HTML' }),
                    }
                );
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
    if (!db) return res.status(500).json({ error: 'DB not initialized' });

    try {
        const compRef = db.collection('companies').doc(companyId);

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
