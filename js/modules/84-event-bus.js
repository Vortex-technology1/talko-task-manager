// =====================
// EVENT BUS — TALKO
// Центральна шина причинно-наслідкових зв'язків між модулями.
//
// АРХІТЕКТУРА:
//   Будь-який модуль може:
//     1. emit(event)   — опублікувати подію
//     2. on(type, fn)  — підписатись на подію
//
//   Події зберігаються в Firestore з TTL 7 днів.
//   Automation Engine читає непроцесовані події і виконує правила.
//
// ТИПИ ПОДІЙ:
//   bot.*         — боти і воронки
//   deal.*        — CRM угоди
//   client.*      — CRM клієнти
//   task.*        — завдання TALKO
//   invoice.*     — фінанси
//   form.*        — форми сайтів
//   contact.*     — контакти ботів
// =====================

// ─────────────────────────────────────────
// КОНСТАНТИ — типи подій
// ─────────────────────────────────────────
'use strict';
// i18n helper
var _tg = typeof _tg !== 'undefined' ? _tg : function(ua,ru){return window.currentLang==='ru'?ru:ua;};


const TALKO_EVENTS = {

    // БОТ
    BOT_FLOW_COMPLETED:      'bot.flow_completed',      // лід пройшов воронку
    BOT_MESSAGE_RECEIVED:    'bot.message_received',    // нове повідомлення від юзера
    BOT_SUBSCRIBED:          'bot.subscribed',          // /start
    BOT_UNSUBSCRIBED:        'bot.unsubscribed',        // заблокував бота

    // CONTACT
    CONTACT_CREATED:         'contact.created',         // новий контакт з боту
    CONTACT_UPDATED:         'contact.updated',         // оновлення даних
    CONTACT_MESSAGE_SENT:    'contact.message_sent',    // менеджер написав вручну

    // DEAL
    DEAL_CREATED:            'deal.created',            // нова угода
    DEAL_STAGE_CHANGED:      'deal.stage_changed',      // переміщення по Kanban
    DEAL_WON:                'deal.won',                // угода виграна
    DEAL_LOST:               'deal.lost',               // угода програна
    DEAL_AMOUNT_CHANGED:     'deal.amount_changed',     // змінилась сума
    DEAL_ASSIGNED:           'deal.assigned',           // змінився відповідальний

    // CLIENT
    CLIENT_CREATED:          'client.created',          // новий клієнт
    CLIENT_UPDATED:          'client.updated',

    // TASK
    TASK_CREATED:            'task.created',            // нова задача
    TASK_COMPLETED:          'task.completed',          // задача виконана
    TASK_OVERDUE:            'task.overdue',            // прострочена
    TASK_LINKED_TO_DEAL:     'task.linked_to_deal',     // задача прив'язана до угоди

    // INVOICE / FINANCE
    INVOICE_CREATED:         'invoice.created',
    INVOICE_PAID:            'invoice.paid',            // → deal.won автоматично
    BUDGET_EXCEEDED:         'budget.exceeded',         // витрати > бюджет → задача

    // FORM / SITE
    FORM_SUBMITTED:          'form.submitted',          // заявка з сайту → лід у CRM
    SITE_VISITED:            'site.visited',            // відвідування сайту

    // BROADCAST
    BROADCAST_SENT:          'broadcast.sent',
    BROADCAST_FAILED:        'broadcast.failed',

    // ── ЗАМОВЛЕННЯ ШТОРИ (Ярослав) ──────────────────────────────
    MEASUREMENT_ASSIGNED:    'deal.measurement_assigned',   // замірник + дата призначені
    INSTALLATION_ASSIGNED:   'deal.installation_assigned',  // монтажник + дата призначені
    PREPAYMENT_RECEIVED:     'deal.prepayment_received',    // передоплата зафіксована

    // ESTIMATE / КОШТОРИС
    ESTIMATE_APPROVED:       'estimate.approved',           // кошторис затверджено
    ESTIMATE_DEFICIT:        'estimate.deficit_detected',   // виявлено дефіцит матеріалів
    MATERIALS_WRITTEN_OFF:   'estimate.materials_written_off', // матеріали списані зі складу
};

// ─────────────────────────────────────────
// ВНУТРІШНІЙ РЕЄСТР ОБРОБНИКІВ
// ─────────────────────────────────────────
const _handlers = {};  // { 'event.type': [fn1, fn2, ...] }
const _eventQueue = []; // буфер для batch запису в Firestore

// ─────────────────────────────────────────
// ПІДПИСКА НА ПОДІЮ
// ─────────────────────────────────────────
function onTalkoEvent(eventType, handler) {
    if (!_handlers[eventType]) _handlers[eventType] = [];
    _handlers[eventType].push(handler);
}

// ─────────────────────────────────────────
// ПУБЛІКАЦІЯ ПОДІЇ
// ─────────────────────────────────────────
async function emitTalkoEvent(eventType, payload = {}, options = {}) {
    if (!currentUser || !window.currentCompanyId) return;

    const event = {
        type: eventType,
        payload,
        triggeredBy: options.triggeredBy || 'user',   // 'user' | 'bot' | 'system'
        triggeredByUserId: currentUser.uid,
        companyId: window.currentCompanyId,
        processed: false,
        // TTL: автоматичне видалення через 7 днів (Cloud Function або ручний cleanup)
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // 1. Виконуємо локальних обробників синхронно (UI реагує миттєво)
    _dispatchLocally(eventType, event);

    // 2. Зберігаємо в Firestore (для automation engine і аудиту)
    try {
        const ref = db.collection(`companies/${window.currentCompanyId}/events`);
        await ref.add(event);
    } catch (err) {
        console.warn('[EventBus] Failed to persist event:', eventType, err);
        // Не кидаємо помилку — локальна обробка вже відбулась
    }

    // 3. Запускаємо automation engine
    _runAutomationRules(event);
}

// ─────────────────────────────────────────
// ЛОКАЛЬНА ДИСПЕТЧЕРИЗАЦІЯ
// ─────────────────────────────────────────
function _dispatchLocally(eventType, event) {
    const handlers = _handlers[eventType] || [];
    const wildcardHandlers = _handlers['*'] || [];

    [...handlers, ...wildcardHandlers].forEach(fn => {
        try {
            fn(event);
        } catch (err) {
            console.error('[EventBus] Handler error for', eventType, err);
        }
    });
}

// ─────────────────────────────────────────
// AUTOMATION ENGINE — вбудована логіка
// ─────────────────────────────────────────
// Виконується в браузері для MVP.
// В майбутньому переїде в Cloud Functions.
// ─────────────────────────────────────────

const _defaultAutomationRules = [
    // БОТ → CRM: лід завершив воронку → створити клієнта + угоду
    {
        id: 'bot_flow_to_crm',
        triggerEvent: TALKO_EVENTS.BOT_FLOW_COMPLETED,
        condition: null, // завжди
        action: _actionCreateClientAndDeal,
        description: () => window.t('eventBotLead'),
    },

    // DEAL: угода перейшла в window.t('proposalWord') → задача "Підготувати КП"
    {
        id: 'deal_proposal_task',
        triggerEvent: TALKO_EVENTS.DEAL_STAGE_CHANGED,
        condition: (e) => ['proposal',window.t('proposalWord')].includes(e.payload.toStage), // FIX BY: match by id OR label
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `${window.t('prepareCP').replace('{V}', e.payload.clientName || e.payload.dealTitle)}`,
            deadlineOffset: '+2d',
            dealId: e.payload.dealId,
            clientId: e.payload.clientId,
            assigneeId: e.payload.assignedToId,
        }),
        description: () => window.t('eventDealProposal'),
    },

    // DEAL: угода перейшла в "Закриття" → задача "Фінальний дзвінок"
    {
        id: 'deal_closing_task',
        triggerEvent: TALKO_EVENTS.DEAL_STAGE_CHANGED,
        condition: (e) => ['closing','Закриття'].includes(e.payload.toStage), // FIX BY: match by id OR label
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `${window.t('finalCall').replace('{V}', e.payload.clientName || e.payload.dealTitle)}`,
            deadlineOffset: '+1d',
            dealId: e.payload.dealId,
            clientId: e.payload.clientId,
            assigneeId: e.payload.assignedToId,
        }),
        description: () => window.t('eventDealClosing'),
    },

    // DEAL WON → задача "Виставити рахунок"
    // FIX BZ: also trigger on DEAL_STAGE_CHANGED toStage=won (CRM never emits DEAL_WON directly)
    {
        id: 'deal_won_invoice_task',
        triggerEvent: TALKO_EVENTS.DEAL_STAGE_CHANGED,
        condition: (e) => ['won','Виграно'].includes(e.payload.toStage),
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `Виставити рахунок: ${e.payload.clientName || e.payload.dealTitle}`,
            deadlineOffset: '+0d',
            dealId: e.payload.dealId,
            clientId: e.payload.clientId,
            assigneeId: e.payload.assignedToId,
            priority: 'high',
        }),
        description: 'Угода виграна → задача виставити рахунок',
    },

    // INVOICE PAID → deal.won автоматично
    {
        id: 'invoice_paid_deal_won',
        triggerEvent: TALKO_EVENTS.INVOICE_PAID,
        condition: (e) => !!e.payload.dealId,
        action: _actionMarkDealWon,
        description: () => window.t('invoicePaidWon'),
    },

    // FORM SUBMITTED → лід у CRM
    {
        id: 'form_to_crm',
        triggerEvent: TALKO_EVENTS.FORM_SUBMITTED,
        condition: (e) => e.payload.crmIntegration === true,
        action: _actionCreateClientAndDeal,
        description: () => window.t('siteFormCRM'),
    },

    // BUDGET EXCEEDED → задача попередження
    {
        id: 'budget_exceeded_task',
        triggerEvent: TALKO_EVENTS.BUDGET_EXCEEDED,
        condition: null,
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `[!] Перевищення бюджету: ${e.payload.taskTitle}`,
            deadlineOffset: '+0d',
            dealId: e.payload.dealId,
            assigneeId: e.payload.managerId,
            priority: 'high',
        }),
        description: 'Бюджет перевищено → задача-попередження менеджеру',
    },

    // ═══════════════════════════════════════════════════════════════
    // ПРАВИЛА ДЛЯ ЗАМОВЛЕННЯ ШТОР (Ярослав, Чехія)
    // ═══════════════════════════════════════════════════════════════

    // КП ПОГОДЖЕНО → задача для цеху (пошив)
    {
        id: 'cp_approved_workshop_task',
        triggerEvent: TALKO_EVENTS.DEAL_STAGE_CHANGED,
        condition: (e) => ['approved', 'Погоджено', 'won'].includes(e.payload.toStage),
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `[ТЗ] Пошив: ${e.payload.clientName || e.payload.dealTitle || ''}`,
            description: `${_tg('Замовлення підтверджено. Деталізація по кімнатах і вікнах — у вкладці КП картки угоди CRM.','Заказ подтверждён. Детализация по комнатам и окнам — во вкладке КП карточки сделки CRM.')}\nФіліал: ${e.payload.branch || '—'}`,
            deadlineOffset: '+3d',
            dealId: e.payload.dealId,
            clientId: e.payload.clientId || null,
            assigneeId: e.payload.assignedToId || null,
            priority: 'high',
        }),
        description: 'КП погоджено → задача цеху на пошив',
    },

    // КП ПОГОДЖЕНО → задача закупнику (матеріали)
    {
        id: 'cp_approved_purchase_task',
        triggerEvent: TALKO_EVENTS.DEAL_STAGE_CHANGED,
        condition: (e) => ['approved', 'Погоджено', 'won'].includes(e.payload.toStage),
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `[Закупка]: ${e.payload.clientName || e.payload.dealTitle || ''}`,
            description: `${_tg('Перевір позиції КП у картці угоди CRM і сформуй список матеріалів для закупівлі.','Проверь позиции КП в карточке сделки CRM и сформируй список материалов для закупки.')}\nФіліал: ${e.payload.branch || '—'}`,
            deadlineOffset: '+2d',
            dealId: e.payload.dealId,
            clientId: e.payload.clientId || null,
            assigneeId: e.payload.assignedToId || null,
            priority: 'high',
        }),
        description: _tg('КП погоджено → задача закупнику на матеріали','КП согласовано → задача закупщику на материалы'),
    },

    // КП ПОГОДЖЕНО → задача логісту (планування монтажу)
    {
        id: 'cp_approved_logistics_task',
        triggerEvent: TALKO_EVENTS.DEAL_STAGE_CHANGED,
        condition: (e) => ['approved', 'Погоджено', 'won'].includes(e.payload.toStage),
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `[Монтаж]: ${e.payload.clientName || e.payload.dealTitle || ''}`,
            description: `${_tg('Запланувати виїзд монтажників.','Запланировать выезд монтажников.')}\nАдреса: ${e.payload.objectAddress || _tg('уточни в CRM','уточни в CRM')}\nФіліал: ${e.payload.branch || '—'}`,
            deadlineOffset: '+5d',
            dealId: e.payload.dealId,
            clientId: e.payload.clientId || null,
            assigneeId: e.payload.assignedToId || null,
            priority: 'normal',
        }),
        description: _tg('КП погоджено → задача логісту на планування монтажу','КП согласовано → задача логисту на планирование монтажа'),
    },

    // ПЕРЕДОПЛАТА → старт виробництва
    {
        id: 'prepayment_start_production',
        triggerEvent: TALKO_EVENTS.PREPAYMENT_RECEIVED,
        condition: null,
        action: _actionCreateTask,
        actionParams: (e) => ({
            title: `[Старт] Виробництво: ${e.payload.clientName || ''}`,
            description: `${_tg('Передоплата','Предоплата')} ${e.payload.prepayment || ''}€ ${_tg('отримана. Починаємо пошив.','получена. Начинаем пошив.')}\nФіліал: ${e.payload.branch || '—'}`,
            deadlineOffset: '+0d',
            dealId: e.payload.dealId,
            priority: 'high',
        }),
        description: _tg('Передоплата зафіксована → задача старт виробництва','Предоплата зафиксирована → задача старт производства'),
    },

    // ЗАМІР ПРИЗНАЧЕНО → Google Calendar (якщо підключено)
    {
        id: 'measurement_calendar_event',
        triggerEvent: TALKO_EVENTS.MEASUREMENT_ASSIGNED,
        condition: (e) => !!(e.payload.measurerId && e.payload.measurementDate),
        action: async (event) => {
            try {
                if (!window.currentCompanyId) return;
                const { measurerId, measurementDate, objectAddress, clientName, dealId } = event.payload;
                // Читаємо Google token замірника
                const userDoc = await window.companyRef().collection('users').doc(measurerId).get();
                if (!userDoc.exists) return;
                const userData = userDoc.data();
                if (!userData.googleCalendarConnected || !userData.googleAccessToken) return;
                // Формуємо подію
                const startDt = new Date(measurementDate);
                const endDt   = new Date(startDt.getTime() + 60 * 60 * 1000); // +1 год
                const calEvent = {
                    summary:     `${_tg('Замір','Замер')}: ${clientName || ''}`,
                    description: `${_tg('Замовлення','Заказ')} ID: ${dealId}\n${_tg('Відкрити CRM','Открыть CRM')}: ${window.location.origin}`,
                    location:    objectAddress || '',
                    start: { dateTime: startDt.toISOString(), timeZone: 'Europe/Prague' },
                    end:   { dateTime: endDt.toISOString(),   timeZone: 'Europe/Prague' },
                };
                // Відправляємо через Google Calendar API
                const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userData.googleAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(calEvent),
                });
                if (!resp.ok) {
                    const err = await resp.json();
                    console.warn('[Calendar] measurement event error:', err?.error?.message);
                } else {
                    console.log('[Calendar] measurement event created for', measurerId);
                }
            } catch(e) {
                console.error('[Calendar] measurement_calendar_event error:', e.message);
            }
        },
        description: _tg('Замір призначено → подія в Google Calendar замірника','Замер назначен → событие в Google Calendar замерщика'),
    },

    // МОНТАЖ ПРИЗНАЧЕНО → Google Calendar (якщо підключено)
    {
        id: 'installation_calendar_event',
        triggerEvent: TALKO_EVENTS.INSTALLATION_ASSIGNED,
        condition: (e) => !!(e.payload.installerId && e.payload.installationDate),
        action: async (event) => {
            try {
                if (!window.currentCompanyId) return;
                const { installerId, installationDate, objectAddress, clientName, dealId } = event.payload;
                const userDoc = await window.companyRef().collection('users').doc(installerId).get();
                if (!userDoc.exists) return;
                const userData = userDoc.data();
                if (!userData.googleCalendarConnected || !userData.googleAccessToken) return;
                const startDt = new Date(installationDate);
                const endDt   = new Date(startDt.getTime() + 2 * 60 * 60 * 1000); // +2 год
                const calEvent = {
                    summary:     `Монтаж: ${clientName || ''}`,
                    description: `${_tg('Замовлення','Заказ')} ID: ${dealId}\n${_tg('Відкрити CRM','Открыть CRM')}: ${window.location.origin}`,
                    location:    objectAddress || '',
                    start: { dateTime: startDt.toISOString(), timeZone: 'Europe/Prague' },
                    end:   { dateTime: endDt.toISOString(),   timeZone: 'Europe/Prague' },
                };
                const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userData.googleAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(calEvent),
                });
                if (!resp.ok) {
                    const err = await resp.json();
                    console.warn('[Calendar] installation event error:', err?.error?.message);
                } else {
                    console.log('[Calendar] installation event created for', installerId);
                }
            } catch(e) {
                console.error('[Calendar] installation_calendar_event error:', e.message);
            }
        },
        description: _tg('Монтаж призначено → подія в Google Calendar монтажника','Монтаж назначен → событие в Google Calendar монтажника'),
    },
];

async function _runAutomationRules(event) {
    // Завантажуємо кастомні правила компанії + default
    const customRules = await _loadCustomRules();
    const allRules = [..._defaultAutomationRules, ...customRules];

    for (const rule of allRules) {
        if (rule.triggerEvent !== event.type) continue;
        if (rule.condition && !rule.condition(event)) continue;

        try {
            const params = rule.actionParams ? rule.actionParams(event) : {};
            await rule.action(event, params);
            window.dbg&&dbg(`[Automation] Rule fired: ${rule.id}`);
        } catch (err) {
            console.error(`[Automation] Rule failed: ${rule.id}`, err);
        }
    }
}

// ─────────────────────────────────────────
// ACTIONS — конкретні дії автоматизації
// ─────────────────────────────────────────

// Дія: створити клієнта + угоду в CRM
async function _actionCreateClientAndDeal(event, params = {}) {
    const p = event.payload;
    const companyId = window.currentCompanyId;
    const batch = db.batch();
    const now = firebase.firestore.FieldValue.serverTimestamp();

    // 1. Перевіряємо чи клієнт вже є (по senderId або phone)
    let clientId = null;
    if (p.senderId || p.phone) {
        const existing = await _findExistingClient(companyId, p.senderId, p.phone);
        if (existing) {
            clientId = existing.id;
            // Оновлюємо дані клієнта якщо прийшли нові
            batch.update(
                db.doc(`companies/${companyId}/crm_clients/${clientId}`),
                { updatedAt: now, ...( p.phone ? { phone: p.phone } : {} ) }
            );
        }
    }

    // 2. Якщо клієнта немає — створюємо
    if (!clientId) {
        const clientRef = db.collection(`companies/${companyId}/crm_clients`).doc();
        clientId = clientRef.id;
        batch.set(clientRef, {
            id: clientId,
            name: p.senderName || p.name || window.t('unknownWord'),
            type: 'person',
            phone: p.phone || '',
            telegram: p.username ? `@${p.username}` : '',
            niche: p.business_type || '',
            source: event.type === TALKO_EVENTS.FORM_SUBMITTED ? 'site_form' : 'bot',
            // Дані з воронки
            role: p.role || '',
            mainProblem: p.main_problem || '',
            mainGoal: p.main_goal || '',
            searchTime: p.search_time || '',
            aiSummary: p.ai_response || '',
            // Зв'язок з контактом боту
            botContactId: p.contactId || null,
            senderId: p.senderId || null,
            deals: [],
            tags: p.tags || [],
            createdAt: now,
            updatedAt: now,
        });
    }

    // 3. Завантажуємо дефолтну воронку
    const pipeline = await _getDefaultPipeline(companyId);
    // stage зберігаємо як ID (не label) — CRM v2.0 очікує id ('new', 'contact', etc.)
    const firstStageId    = pipeline?.stages?.[0]?.id    || 'new';
    const firstStageColor = pipeline?.stages?.[0]?.color || '#6b7280';

    // 4. Створюємо угоду
    const dealRef = db.collection(`companies/${companyId}/crm_deals`).doc();
    const dealId = dealRef.id;

    batch.set(dealRef, {
        id: dealId,
        title: p.dealTitle || `Лід: ${p.senderName || p.name || window.t('unknownWord')}`,
        clientId,
        clientName: p.senderName || p.name || '',
        clientNiche: p.business_type || '',
        stage: firstStageId,
        stageColor: firstStageColor,
        status: 'open',
        result: null,
        amount: 0,
        currency: 'UAH',
        probability: pipeline?.stages?.[0]?.probability || 10,
        assignedToId: p.assignedToId || currentUser?.uid || null,
        assignedToName: p.assignedToName || '',
        source: event.type === TALKO_EVENTS.FORM_SUBMITTED ? 'site_form' : 'bot',
        sourceId: p.contactId || p.submissionId || null,
        botContactId: p.contactId || null,
        // Дані з воронки для контексту менеджера
        leadData: {
            role: p.role || '',
            mainProblem: p.main_problem || '',
            mainGoal: p.main_goal || '',
            searchTime: p.search_time || '',
            aiSummary: p.ai_response || '',
        },
        taskIds: [],
        tags: p.tags || [],
        notes: [],
        expectedClose: null,
        closedAt: null,
        paidAt: null,
        invoiceId: null,
        pipelineId: pipeline?.id || 'default',
        createdAt: now,
        updatedAt: now,
    });

    // 5. Перший запис в history угоди
    const histRef = db.doc(`companies/${companyId}/crm_deals/${dealId}/history/created`);
    batch.set(histRef, {
        type: 'created',
        stage: firstStageId,
        note: event.type === TALKO_EVENTS.FORM_SUBMITTED
            ? window.t('dealAutoSiteForm')
            : window.t('dealAutoTgFunnel'),
        by: 'system',
        byName: 'TALKO System',
        at: now,
    });

    // 6. Оновлюємо агрегат crm_stats
    const statsRef = db.doc(`companies/${companyId}/crm_stats/main`);
    batch.set(statsRef, {
        totalDeals: firebase.firestore.FieldValue.increment(1),
        updatedAt: now,
    }, { merge: true });

    await batch.commit();

    // 7. Emit нових подій (ланцюгова реакція)
    await emitTalkoEvent(TALKO_EVENTS.CLIENT_CREATED, { clientId, companyId }, { triggeredBy: 'system' });
    await emitTalkoEvent(TALKO_EVENTS.DEAL_CREATED, {
        dealId,
        clientId,
        clientName: p.senderName || p.name || '',
        dealTitle: `${window.t('leadN').replace('{V}', p.senderName || p.name || '')}`,
        stage: firstStageId,
        assignedToId: p.assignedToId || currentUser?.uid,
        assignedToName: p.assignedToName || '',
    }, { triggeredBy: 'system' });

    // 8. Нотифікація менеджеру
    _notifyManager(companyId, {
        title: window.t('newLeadEvent'),
        body: `${p.senderName || window.t('unknownWord')} — ${p.business_type || 'без ніші'}`,
        dealId,
        clientId,
    });

    return { clientId, dealId };
}

// Дія: створити задачу TALKO прив'язану до угоди
async function _actionCreateTask(event, params = {}) {
    if (!params.title) return;
    const companyId = window.currentCompanyId;

    const deadline = _calcDeadline(params.deadlineOffset || '+1d');

    const taskRef = db.collection(`companies/${companyId}/tasks`).doc();
    const taskId = taskRef.id;
    const now = firebase.firestore.FieldValue.serverTimestamp();

    // FIX BB: add missing fields for task rendering (assigneeName, creatorName, createdDate)
    const _assignee = users?.find(u => u.id === (params.assigneeId || currentUser?.uid));
    const _deadline = deadline || ((typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0]);
    await taskRef.set({
        id: taskId,
        title: params.title,
        status: 'new',
        priority: params.priority || 'medium',
        assigneeId: params.assigneeId || currentUser?.uid || null,
        assigneeName: _assignee?.name || currentUser?.displayName || currentUser?.email || '',
        creatorId: currentUser?.uid || 'system',
        creatorName: currentUser?.displayName || currentUserData?.name || currentUser?.email || '',
        deadlineDate: _deadline,
        createdDate: (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0],
        // Зв'язок з CRM
        dealId: params.dealId || null,
        clientId: params.clientId || null,
        // Автоматично створена
        autoCreated: true,
        autoRuleId: params.ruleId || null,
        createdAt: now,
        updatedAt: now,
    });

    // Оновлюємо список taskIds в угоді
    if (params.dealId) {
        await db.doc(`companies/${companyId}/crm_deals/${params.dealId}`).update({
            taskIds: firebase.firestore.FieldValue.arrayUnion(taskId),
            updatedAt: now,
        });
    }

    await emitTalkoEvent(TALKO_EVENTS.TASK_CREATED, {
        taskId,
        title: params.title,
        dealId: params.dealId,
        autoCreated: true,
    }, { triggeredBy: 'system' });

    return taskId;
}

// Дія: угода → Виграно
async function _actionMarkDealWon(event) {
    const { dealId, invoiceId, amount } = event.payload;
    if (!dealId) return;
    const companyId = window.currentCompanyId;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();

    batch.update(db.doc(`companies/${companyId}/crm_deals/${dealId}`), {
        status: 'closed',
        result: 'won',
        closedAt: now,
        paidAt: now,
        invoiceId: invoiceId || null,
        ...(amount ? { amount } : {}),
        updatedAt: now,
    });

    // Запис в history
    batch.set(
        db.collection(`companies/${companyId}/crm_deals/${dealId}/history`).doc(),
        {
            type: 'won',
            note: invoiceId ? `${window.t('invoicePaidN').replace('{V}', invoiceId)}` : 'Угода позначена як виграна',
            by: event.triggeredBy || 'system',
            byName: event.triggeredBy === 'user' ? currentUser?.displayName : 'TALKO System',
            at: now,
        }
    );

    // Оновлюємо агрегат
    batch.set(db.doc(`companies/${companyId}/crm_stats/main`), {
        totalWon: firebase.firestore.FieldValue.increment(1),
        wonAmount: firebase.firestore.FieldValue.increment(amount || 0),
        updatedAt: now,
    }, { merge: true });

    await batch.commit();

    // Читаємо deal для повного payload (clientPhone, clientName потрібні для WA)
    let dealData = {};
    try {
        const dealDoc = await db.doc(`companies/${companyId}/crm_deals/${dealId}`).get();
        if (dealDoc.exists) dealData = dealDoc.data();
    } catch(e) {
        console.warn('[EventBus] _actionMarkDealWon: could not read deal:', e.message);
    }

    await emitTalkoEvent(TALKO_EVENTS.DEAL_WON, {
        dealId,
        amount:      amount || dealData.amount || 0,
        clientName:  dealData.clientName  || dealData.title || '',
        clientPhone: dealData.phone       || null,
        branch:      dealData.branch      || null,
    }, { triggeredBy: 'system' });
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// Знаходимо існуючого клієнта по senderId або phone
async function _findExistingClient(companyId, senderId, phone) {
    const col = db.collection(`companies/${companyId}/crm_clients`);

    if (senderId) {
        const snap = await col.where('senderId', '==', senderId).limit(1).get();
        if (!snap.empty) return snap.docs[0];
    }
    if (phone) {
        const snap = await col.where('phone', '==', phone).limit(1).get();
        if (!snap.empty) return snap.docs[0];
    }
    return null;
}

// Завантажуємо дефолтну воронку компанії
async function _getDefaultPipeline(companyId) {
    // Кешуємо щоб не читати при кожній події
    if (window._talko_pipeline_cache?.[companyId]) {
        return window._talko_pipeline_cache[companyId];
    }

    const snap = await db.collection(`companies/${companyId}/crm_pipeline`)
        .limit(1).get();

    if (!snap.empty) {
        const pipeline = { id: snap.docs[0].id, ...snap.docs[0].data() };
        if (!window._talko_pipeline_cache) window._talko_pipeline_cache = {};
        window._talko_pipeline_cache[companyId] = pipeline;
        return pipeline;
    }

    // Якщо воронки ще немає — створюємо дефолтну
    return _createDefaultPipeline(companyId);
}

// Створюємо дефолтну воронку при першому запуску
async function _createDefaultPipeline(companyId) {
    const pipeline = {
        name: 'Основна воронка',
        stages: [
            { id: 'new_lead',     name: window.t('newLeadWord'),    color: '#3b82f6', probability: 10 },
            { id: 'contact',      name: 'Контакт',      color: '#8b5cf6', probability: 25 },
            { id: 'negotiation',  name: 'Переговори',   color: '#f59e0b', probability: 50 },
            { id: 'proposal',     name: window.t('proposalWord'),   color: '#f97316', probability: 70 },
            { id: 'closing',      name: 'Закриття',     color: '#ef4444', probability: 85 },
            { id: 'won',          name: 'Виграно',      color: '#22c55e', probability: 100 },
        ],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection(`companies/${companyId}/crm_pipeline`).add(pipeline);
    return { id: ref.id, ...pipeline };
}

// Розраховуємо дедлайн задачі
function _calcDeadline(offset) {
    const now = new Date();
    const match = offset.match(/^([+-])(\d+)([dhm])$/);
    if (!match) return null;

    const [, sign, num, unit] = match;
    const ms = { d: 86400000, h: 3600000, m: 60000 }[unit] * parseInt(num);
    const result = new Date(now.getTime() + (sign === '+' ? ms : -ms));
    return result.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Нотифікація менеджеру (через Telegram якщо підключений, або UI toast)
function _notifyManager(companyId, { title, body, dealId }) {
    // UI нотифікація
    if (typeof showToast === 'function') {
        showToast(`${title}: ${body}`, 'success');
    }

    // TODO: push нотифікація через Firebase Cloud Messaging
    // TODO: Telegram нотифікація через webhook
}

// Безпечний wrapper для condition strings з Firestore
// Тільки manager може писати automation_rules (Firestore rules: isManagerOrOwner)
function _safeMakeCondition(conditionStr) {
    if (!conditionStr || typeof conditionStr !== 'string') return null;
    if (conditionStr.length > 500) {
        console.warn('[EventBus] condition too long, rejected'); return null;
    }
    const blocked = /fetch\(|XMLHttpRequest|eval\(|Function\(|import\(|require\(|process\.|document\.cookie/i;
    if (blocked.test(conditionStr)) {
        console.warn('[EventBus] condition blocked'); return null;
    }
    try {
        // eslint-disable-next-line no-new-func
        return new Function('e', conditionStr);
    } catch(err) {
        console.warn('[EventBus] condition parse error:', err.message); return null;
    }
}

// Завантаження кастомних правил з Firestore
async function _loadCustomRules() {
    if (!window.currentCompanyId) return [];

    // Кеш на 5 хвилин
    const CACHE_KEY = '_talko_rules_cache';
    const cache = window[CACHE_KEY];
    if (cache && Date.now() - cache.ts < 5 * 60 * 1000) return cache.rules;

    try {
        const snap = await db
            .collection(`companies/${window.currentCompanyId}/automation_rules`)
            .where('active', '==', true)
            .get();

        const rules = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                triggerEvent: d.triggerEvent,
                // Безпечний eval: замість new Function використовуємо JSON-based умови
                // d.condition — рядок JS тільки для legacy правил (manager-only write)
                condition: d.condition ? _safeMakeCondition(d.condition) : null,
                action: _getActionByType(d.actionType),
                actionParams: d.actionParams ? (e) => ({
                    ...d.actionParams,
                    ...( d.actionParams.titleTemplate
                        ? { title: _interpolate(d.actionParams.titleTemplate, e.payload) }
                        : {}
                    )
                }) : null,
                description: d.description || '',
            };
        }).filter(r => r.action); // тільки якщо action відомий

        window[CACHE_KEY] = { rules, ts: Date.now() };
        return rules;
    } catch {
        return [];
    }
}

// Маппінг типу дії → функція
function _getActionByType(type) {
    const map = {
        'create_task':             _actionCreateTask,
        'create_client_and_deal':  _actionCreateClientAndDeal,
        'mark_deal_won':           _actionMarkDealWon,
    };
    return map[type] || null;
}

// Інтерполяція рядків: "Завдання для {clientName}" → "Завдання для Іван"
function _interpolate(template, data) {
    return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || '');
}

// ─────────────────────────────────────────
// ПУБЛІЧНЕ API
// ─────────────────────────────────────────
window.TALKO_EVENTS = TALKO_EVENTS;
window.emitTalkoEvent = emitTalkoEvent;
window.onTalkoEvent = onTalkoEvent;

// Очищення кешу воронки при зміні компанії
onTalkoEvent('*', (e) => {
    if (e.type === 'company.changed') {
        window._talko_pipeline_cache = {};
        window._talko_rules_cache = null;
    }
});

// ══════════════════════════════════════════════════════════
// WhatsApp Business — helper waSend
// Відправляє повідомлення через api/whatsapp-send
// ══════════════════════════════════════════════════════════
window.waSend = async function(phone, message, apiKeyOverride) {
    if (!phone || !message) return { ok: false, error: 'phone or message missing' };
    if (!window.currentCompanyId) return { ok: false, error: 'no companyId' };

    // Отримуємо Firebase ID token для авторизації
    let idToken = '';
    try {
        const user = firebase.auth().currentUser;
        if (user) idToken = await user.getIdToken();
    } catch(e) {
        console.warn('[waSend] getIdToken failed:', e.message);
    }

    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers['Authorization'] = 'Bearer ' + idToken;
    // Якщо передали apiKey напряму (тест) — передаємо його через X-WA-KEY
    if (apiKeyOverride) headers['X-WA-KEY'] = apiKeyOverride;

    try {
        const res = await fetch('/api/whatsapp-send', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                phone,
                message,
                companyId: window.currentCompanyId,
            }),
        });
        return await res.json();
    } catch(e) {
        console.error('[waSend] error:', e.message);
        return { ok: false, error: e.message };
    }
};

// ── WhatsApp automation listeners ─────────────────────────
// Підписуємось на події і відправляємо повідомлення клієнту

// 1. ЗАМІР ПРИЗНАЧЕНО → клієнту
onTalkoEvent(TALKO_EVENTS.MEASUREMENT_ASSIGNED, async (event) => {
    const { clientPhone, clientName, measurementDate, measurerId } = event.payload;
    if (!clientPhone) return;
    try {
        // Отримуємо ім'я замірника
        let measurerName = _tg('наш спеціаліст','наш специалист');
        if (measurerId && window.companyRef) {
            const uDoc = await window.companyRef().collection('users').doc(measurerId).get();
            if (uDoc.exists) measurerName = uDoc.data()?.name || uDoc.data()?.email || measurerName;
        }
        const dt = measurementDate ? new Date(measurementDate).toLocaleString('cs-CZ', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }) : '—';
        const msg = `Dobrý den, ${clientName || ''}!\n\nPotvrzen termín měření: ${dt}\nNaší specialista: ${measurerName}\n\nPro dotazy nás kontaktujte.\nS pozdravem, Talko Curtains`;
        await window.waSend(clientPhone, msg);
    } catch(e) {
        console.warn('[WA] measurement_assigned handler:', e.message);
    }
});

// 2. КП ПОГОДЖЕНО → клієнту рахунок на передоплату
onTalkoEvent(TALKO_EVENTS.DEAL_STAGE_CHANGED, async (event) => {
    if (!['approved', 'Погоджено'].includes(event.payload.toStage)) return;
    const deal = event.payload;
    try {
        // Отримуємо phone з payload або читаємо з Firestore як fallback
        let phone      = deal.clientPhone || null;
        let clientName = deal.clientName  || '';
        let amount     = deal.amount      || 0;

        if (!phone && deal.dealId && window.companyRef) {
            const d = await window.companyRef()
                .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
                .doc(deal.dealId).get();
            if (d.exists) {
                const data = d.data();
                phone      = data.phone       || null;
                clientName = clientName || data.clientName || data.title || '';
                amount     = amount     || data.amount     || 0;
            }
        }
        if (!phone) return;

        const prepayAmt = amount ? (amount / 2).toFixed(0) : '—';
        const msg = `Dobrý den, ${clientName}!\n\nVaše objednávka závěsů byla potvrzena ✓\n\nZáloha (50%): ${prepayAmt} €\nPo přijetí zálohy zahájíme výrobu.\n\nDěkujeme za důvěru!\nTalko Curtains`;
        await window.waSend(phone, msg);
    } catch(e) {
        console.warn('[WA] cp_approved handler:', e.message);
    }
});

// 3. ПЕРЕДОПЛАТА → клієнту підтвердження старту
onTalkoEvent(TALKO_EVENTS.PREPAYMENT_RECEIVED, async (event) => {
    const { clientPhone, clientName, prepayment } = event.payload;
    if (!clientPhone) return;
    try {
        const msg = `Dobrý den, ${clientName || ''}!\n\nObdrželi jsme zálohu ${prepayment || ''}€ ✓\nZahajujeme výrobu Vašich závěsů.\n\nO termínu montáže Vás budeme informovat.\nTalko Curtains`;
        await window.waSend(clientPhone, msg);
    } catch(e) {
        console.warn('[WA] prepayment handler:', e.message);
    }
});

// 4. МОНТАЖ ПРИЗНАЧЕНО → клієнту
onTalkoEvent(TALKO_EVENTS.INSTALLATION_ASSIGNED, async (event) => {
    const { clientPhone, clientName, installationDate, installerId } = event.payload;
    if (!clientPhone) return;
    try {
        let installerName = 'náš technik';
        if (installerId && window.companyRef) {
            const uDoc = await window.companyRef().collection('users').doc(installerId).get();
            if (uDoc.exists) installerName = uDoc.data()?.name || uDoc.data()?.email || installerName;
        }
        const dt = installationDate ? new Date(installationDate).toLocaleString('cs-CZ', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }) : '—';
        const msg = `Dobrý den, ${clientName || ''}!\n\nTermín montáže potvrzen: ${dt}\nNáš technik: ${installerName}\n\nProsíme o zajištění přístupu.\nTalko Curtains`;
        await window.waSend(clientPhone, msg);
    } catch(e) {
        console.warn('[WA] installation_assigned handler:', e.message);
    }
});

// 5. УГОДА ЗАКРИТА (WON) → подяка + нагадування про 6 міс
onTalkoEvent(TALKO_EVENTS.DEAL_WON, async (event) => {
    const deal = event.payload;
    try {
        let phone      = deal.clientPhone || null;
        let clientName = deal.clientName  || '';

        if (!phone && deal.dealId && window.companyRef) {
            const d = await window.companyRef()
                .collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
                .doc(deal.dealId).get();
            if (d.exists) {
                phone      = d.data()?.phone      || null;
                clientName = clientName || d.data()?.clientName || d.data()?.title || '';
            }
        }
        if (!phone) return;

        const msg = `Dobrý den, ${clientName}!\n\nDěkujeme za Vaši objednávku ✓\nTěšíme se na případnou spolupráci.\n\nPS: Za 6 měsíců Vám připomeneme čištění závěsů 😊\nTalko Curtains`;
        await window.waSend(phone, msg);
    } catch(e) {
        console.warn('[WA] deal_won handler:', e.message);
    }
});

// ─────────────────────────────────────────
// CLEANUP: видалення старих подій (TTL)
// Запускається раз при старті, якщо є права
// ─────────────────────────────────────────
async function _cleanupExpiredEvents() {
    if (!window.currentCompanyId) return;
    try {
        const snap = await db
            .collection(`companies/${window.currentCompanyId}/events`)
            .where('expiresAt', '<', new Date())
            .limit(50) // batch по 50 щоб не перевантажити
            .get();

        if (snap.empty) return;

        const batch = db.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        window.dbg&&dbg(`[EventBus] Cleaned ${snap.size} expired events`);
    } catch {
        // Ігноруємо помилки cleanup — не критично
    }
}

// Запускаємо cleanup через 30 сек після старту (не блокуємо UI)
setTimeout(_cleanupExpiredEvents, 30000);

// ── TALKO namespace registration ───────────────────────────
if (window.TALKO) {
    window.TALKO.events = {
        emit: typeof emitTalkoEvent !== 'undefined' ? emitTalkoEvent : window.emitTalkoEvent,
        on:   typeof onTalkoEvent   !== 'undefined' ? onTalkoEvent   : window.onTalkoEvent,
    };
}
