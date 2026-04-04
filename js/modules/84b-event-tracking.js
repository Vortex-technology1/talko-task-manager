// =====================
// 84b-EVENT-TRACKING — TALKO
// Операційний event tracking для AI-діагностики.
//
// АРХІТЕКТУРА:
//   trackEvent(eventName, entityType, entityId, metadata)
//     → накопичує в _batch (до BATCH_SIZE або FLUSH_INTERVAL)
//     → флашить батчем в Firestore: companies/{id}/events
//     → при offline → localStorage queue → sync при reconnect
//
// СХЕМА події в Firestore:
//   {
//     company_id, user_id, user_role,
//     event_name, module, entity_type, entity_id,
//     timestamp (ServerTimestamp), metadata {}
//   }
//
// ЗАЛЕЖНОСТІ:
//   84-event-bus.js завантажено раніше (window.emitTalkoEvent)
//   03-app-state.js (currentUser, currentCompanyId, currentUserData)
// =====================
'use strict';

// ─────────────────────────────────────────
// КОНСТАНТИ
// ─────────────────────────────────────────
const ET_BATCH_SIZE    = 20;       // флашити при накопиченні N подій
const ET_FLUSH_INTERVAL = 30000;  // флашити кожні 30 сек
const ET_OFFLINE_KEY   = 'talko_et_offline_queue'; // localStorage key
const ET_MAX_OFFLINE   = 200;     // максимум подій в offline queue

// ─────────────────────────────────────────
// ТИПИ ОПЕРАЦІЙНИХ ПОДІЙ
// ─────────────────────────────────────────
const ET_EVENTS = {
    // Задачі
    TASK_CREATED:          'task_created',
    TASK_COMPLETED:        'task_completed',
    TASK_OVERDUE:          'task_overdue',
    TASK_RETURNED:         'task_returned',          // повернуто на доопрацювання
    TASK_REASSIGNED:       'task_reassigned',
    TASK_DEADLINE_CHANGED: 'task_deadline_changed',

    // Процеси
    PROCESS_STARTED:       'process_started',
    PROCESS_STEP_DONE:     'process_step_done',
    PROCESS_STALLED:       'process_stalled',
    PROCESS_SLA_BREACHED:  'process_sla_breached',
    PROCESS_COMPLETED:     'process_completed',

    // Управлінські сигнали (генеруються при snapshot/dashboard)
    OWNER_TASK_OVERLOAD:   'owner_task_count',
    FUNCTION_OVERLOAD:     'function_overload',
    NO_STATISTICS:         'no_statistics_recorded',

    // AI рекомендації
    AI_REC_SHOWN:          'ai_recommendation_shown',
    AI_REC_ACCEPTED:       'ai_recommendation_accepted',
    AI_REC_IGNORED:        'ai_recommendation_ignored',

    // UX / поведінкові
    MODULE_OPENED:         'module_opened',
    DASHBOARD_VIEWED:      'dashboard_viewed',
    REPORT_SUBMITTED:      'report_submitted',
};

// ─────────────────────────────────────────
// ВНУТРІШНІЙ БУФЕР
// ─────────────────────────────────────────
let _batch = [];
let _flushTimer = null;
let _isOnline = navigator.onLine;
let _isFlushing = false;

// ─────────────────────────────────────────
// ГОЛОВНА ФУНКЦІЯ: trackEvent
// ─────────────────────────────────────────
/**
 * Записати операційну подію.
 *
 * @param {string} eventName   — константа з ET_EVENTS
 * @param {string} entityType  — 'task' | 'process' | 'crm' | 'user' | 'function' | 'project'
 * @param {string} entityId    — ID сутності (або '' якщо не застосовно)
 * @param {Object} metadata    — додаткові поля (без PII: тільки IDs, числа, рядки-категорії)
 * @param {string} [module]    — назва модуля-джерела (автодетект якщо не вказано)
 */
function trackEvent(eventName, entityType, entityId, metadata = {}, module = '') {
    if (!eventName) return;

    // Безпека: не відправляємо якщо немає контексту
    const userId    = window.currentUser?.uid;
    const companyId = window.currentCompanyId;
    if (!userId || !companyId) return;

    // Роль з глобального стану
    const userRole = window.currentUserData?.role || 'employee';

    // Privacy: видаляємо PII з metadata (email, phone, name)
    const safeMeta = _sanitizeMetadata(metadata);

    const event = {
        company_id:  companyId,
        user_id:     userId,
        user_role:   userRole,
        event_name:  eventName,
        module:      module || _detectModule(),
        entity_type: entityType || '',
        entity_id:   entityId   || '',
        metadata:    safeMeta,
        // timestamp проставляється при флаші (ServerTimestamp)
        _localTs:    Date.now(), // для сортування в offline queue
    };

    _batch.push(event);

    // Автофлаш при накопиченні
    if (_batch.length >= ET_BATCH_SIZE) {
        _flush();
        return;
    }

    // Запускаємо таймер якщо ще не запущений
    if (!_flushTimer) {
        _flushTimer = setTimeout(_flush, ET_FLUSH_INTERVAL);
    }
}

// ─────────────────────────────────────────
// FLUSH — запис батчу в Firestore
// ─────────────────────────────────────────
async function _flush() {
    // Очищаємо таймер
    if (_flushTimer) {
        clearTimeout(_flushTimer);
        _flushTimer = null;
    }

    if (_isFlushing) return; // захист від паралельних флашів

    // Забираємо поточний батч (і перший offline queue якщо є)
    const offlineQueue = _loadOfflineQueue();
    const toWrite = [...offlineQueue, ..._batch];
    _batch = [];

    if (toWrite.length === 0) return;

    if (!_isOnline) {
        // Offline: зберігаємо в localStorage
        _saveOfflineQueue(toWrite);
        return;
    }

    const companyId = window.currentCompanyId;
    if (!companyId || typeof db === 'undefined') {
        _saveOfflineQueue(toWrite);
        return;
    }

    _isFlushing = true;

    try {
        // Firestore batch write (max 500 ops, ми обмежені ET_BATCH_SIZE + offline)
        const writeBatch = db.batch();
        const colRef = db.collection(`companies/${companyId}/events`);
        const serverTs = firebase.firestore.FieldValue.serverTimestamp();

        toWrite.forEach(evt => {
            const docRef = colRef.doc(); // auto-id
            const { _localTs, ...evtData } = evt; // прибираємо внутрішнє поле
            writeBatch.set(docRef, {
                ...evtData,
                timestamp: serverTs,
                // TTL: 90 днів для операційних подій (довше ніж 7 днів у event-bus)
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            });
        });

        await writeBatch.commit();

        // Успішно — очищаємо offline queue
        _clearOfflineQueue();

        window.dbg && dbg(`[EventTracking] Flushed ${toWrite.length} events`);

    } catch (err) {
        console.warn('[EventTracking] Flush failed, saving to offline queue:', err.message);
        // Повертаємо в offline queue якщо не вдалось
        _saveOfflineQueue(toWrite);
    } finally {
        _isFlushing = false;
    }
}

// ─────────────────────────────────────────
// OFFLINE QUEUE (localStorage)
// ─────────────────────────────────────────
function _loadOfflineQueue() {
    try {
        const raw = localStorage.getItem(ET_OFFLINE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function _saveOfflineQueue(events) {
    try {
        const existing = _loadOfflineQueue();
        const merged   = [...existing, ...events];
        // Обрізаємо до максимуму (видаляємо найстаріші)
        const trimmed  = merged.slice(-ET_MAX_OFFLINE);
        localStorage.setItem(ET_OFFLINE_KEY, JSON.stringify(trimmed));
    } catch {
        // localStorage може бути заблокований — ігноруємо
    }
}

function _clearOfflineQueue() {
    try {
        localStorage.removeItem(ET_OFFLINE_KEY);
    } catch {}
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// Видаляємо PII з metadata (тільки IDs та метрики)
function _sanitizeMetadata(meta) {
    if (!meta || typeof meta !== 'object') return {};
    const safe = {};
    const PII_KEYS = ['email', 'phone', 'name', 'senderName', 'clientName', 'firstName', 'lastName'];
    for (const [k, v] of Object.entries(meta)) {
        if (PII_KEYS.includes(k)) continue;
        // Зберігаємо тільки примітиви та невеликі вкладені об'єкти
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            safe[k] = v;
        } else if (Array.isArray(v) && v.length <= 10) {
            safe[k] = v.filter(i => typeof i === 'string' || typeof i === 'number');
        }
    }
    return safe;
}

// Автодетект модуля по активній вкладці
function _detectModule() {
    try {
        const activeTab = document.querySelector('.tab-btn.active, [data-tab].active');
        return activeTab?.dataset?.tab || activeTab?.id || 'unknown';
    } catch {
        return 'unknown';
    }
}

// ─────────────────────────────────────────
// ONLINE/OFFLINE LISTENERS
// ─────────────────────────────────────────
window.addEventListener('online', () => {
    _isOnline = true;
    // При відновленні зв'язку — флашимо offline queue
    const queue = _loadOfflineQueue();
    if (queue.length > 0) {
        window.dbg && dbg(`[EventTracking] Back online, flushing ${queue.length} queued events`);
        _flush();
    }
});

window.addEventListener('offline', () => {
    _isOnline = false;
});

// Флаш при виході зі сторінки (best-effort)
window.addEventListener('beforeunload', () => {
    if (_batch.length > 0) {
        _saveOfflineQueue(_batch);
        _batch = [];
    }
});

// ─────────────────────────────────────────
// ЗРУЧНІ ОБГОРТКИ (для читабельного коду у модулях)
// ─────────────────────────────────────────

/**
 * Задача створена
 * @param {string} taskId
 * @param {Object} task — об'єкт задачі
 */
function trackTaskCreated(taskId, task) {
    trackEvent(ET_EVENTS.TASK_CREATED, 'task', taskId, {
        function:    task.function   || '',
        assigneeId:  task.assigneeId || '',
        hasDeadline: !!(task.deadlineDate),
        priority:    task.priority   || 'medium',
        isOwner:     window.currentUserData?.role === 'owner',
    }, 'tasks');
}

/**
 * Задача виконана
 * @param {string} taskId
 * @param {Object} task       — поточний стан
 * @param {Object} prevTask   — стан до зміни
 */
function trackTaskCompleted(taskId, task, prevTask) {
    const today = new Date();
    const deadline = task.deadlineDate ? new Date(task.deadlineDate + 'T23:59') : null;
    const daysToDeadline = deadline
        ? Math.floor((deadline - today) / 86400000)
        : null;

    const createdAt = prevTask?.createdAt?.toMillis
        ? prevTask.createdAt.toMillis()
        : (prevTask?.createdAt ? new Date(prevTask.createdAt).getTime() : Date.now());
    const hoursToComplete = Math.round((Date.now() - createdAt) / 3600000);

    trackEvent(ET_EVENTS.TASK_COMPLETED, 'task', taskId, {
        function:       task.function   || '',
        assigneeId:     task.assigneeId || '',
        daysToDeadline: daysToDeadline,
        hoursToComplete: hoursToComplete,
        priority:       task.priority   || 'medium',
        wasOverdue:     !!(deadline && deadline < today),
    }, 'tasks');

    // Емітуємо в Event Bus → CRM тригери по пов'язаній угоді (77l-crm-triggers.js)
    // Раніше: тригер task_completed ніколи не спрацьовував — event не емітувався
    if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS?.TASK_COMPLETED) {
        const dealId = task.crmDealId || task.dealId || null;
        emitTalkoEvent(window.TALKO_EVENTS.TASK_COMPLETED, {
            taskId,
            dealId,
            title:      task.title      || '',
            assigneeId: task.assigneeId || '',
            function:   task.function   || '',
            crmDealId:  dealId,
        }).catch(e => console.warn('[ET] task.completed emit:', e.message));
    }
}

/**
 * Задача повернута на доопрацювання (review rejected)
 * @param {string} taskId
 * @param {Object} task
 * @param {string} reason
 */
function trackTaskReturned(taskId, task, reason) {
    // Підраховуємо скільки разів задача поверталась
    const returnCount = (task.returnCount || 0) + 1;

    trackEvent(ET_EVENTS.TASK_RETURNED, 'task', taskId, {
        function:    task.function   || '',
        assigneeId:  task.assigneeId || '',
        returnCount: returnCount,
        hasReason:   !!(reason),
    }, 'tasks');
}

/**
 * Задача перепризначена
 * @param {string} taskId
 * @param {string} fromUserId
 * @param {string} toUserId
 * @param {Object} task
 */
function trackTaskReassigned(taskId, fromUserId, toUserId, task) {
    trackEvent(ET_EVENTS.TASK_REASSIGNED, 'task', taskId, {
        function:   task.function || '',
        fromUserId: fromUserId   || '',
        toUserId:   toUserId     || '',
    }, 'tasks');
}

/**
 * Дедлайн задачі змінено
 * @param {string} taskId
 * @param {string} fromDate — YYYY-MM-DD
 * @param {string} toDate   — YYYY-MM-DD
 * @param {Object} task
 */
function trackTaskDeadlineChanged(taskId, fromDate, toDate, task) {
    if (!fromDate || !toDate) return;
    const fromMs  = new Date(fromDate).getTime();
    const toMs    = new Date(toDate).getTime();
    const daysDiff = Math.round((toMs - fromMs) / 86400000);

    trackEvent(ET_EVENTS.TASK_DEADLINE_CHANGED, 'task', taskId, {
        function:  task.function   || '',
        assigneeId: task.assigneeId || '',
        daysDiff:  daysDiff,
        direction: daysDiff > 0 ? 'extended' : 'shortened',
    }, 'tasks');
}

/**
 * Процес запущено
 * @param {string} processId
 * @param {Object} process
 */
function trackProcessStarted(processId, process) {
    trackEvent(ET_EVENTS.PROCESS_STARTED, 'process', processId, {
        templateId:   process.templateId   || '',
        templateName: process.templateName || process.name || '',
        function:     process.function     || '',
        totalSteps:   process.totalSteps   || 0,
    }, 'processes');
}

/**
 * Крок процесу виконано
 * @param {string} processId
 * @param {number} stepIndex
 * @param {string} stepFunction
 */
function trackProcessStepDone(processId, stepIndex, stepFunction) {
    trackEvent(ET_EVENTS.PROCESS_STEP_DONE, 'process', processId, {
        stepIndex:    stepIndex,
        stepFunction: stepFunction || '',
    }, 'processes');
}

/**
 * Процес завершено
 * @param {string} processId
 * @param {Object} process
 */
function trackProcessCompleted(processId, process) {
    trackEvent(ET_EVENTS.PROCESS_COMPLETED, 'process', processId, {
        templateId: process.templateId || '',
        totalSteps: process.totalSteps || 0,
    }, 'processes');
}

/**
 * Процес "завис" (не рухався N годин)
 * Викликається з daily-snapshot або owner-dashboard
 * @param {string} processId
 * @param {number} stepIndex
 * @param {string} stepFunction
 * @param {number} hoursStalled
 */
function trackProcessStalled(processId, stepIndex, stepFunction, hoursStalled) {
    trackEvent(ET_EVENTS.PROCESS_STALLED, 'process', processId, {
        stepIndex:    stepIndex,
        stepFunction: stepFunction || '',
        hoursStalled: hoursStalled || 0,
    }, 'processes');
}

/**
 * SLA процесу порушено
 * @param {string} processId
 * @param {string} stepName
 * @param {number} slaMinutes — ліміт
 * @param {number} actualMinutes — фактично витрачено
 */
function trackProcessSLABreached(processId, stepName, slaMinutes, actualMinutes) {
    trackEvent(ET_EVENTS.PROCESS_SLA_BREACHED, 'process', processId, {
        stepName:      stepName      || '',
        slaMinutes:    slaMinutes    || 0,
        actualMinutes: actualMinutes || 0,
        overdueBy:     (actualMinutes || 0) - (slaMinutes || 0),
    }, 'processes');
}

/**
 * Відкрито модуль (UX tracking)
 * @param {string} moduleName
 */
function trackModuleOpened(moduleName) {
    trackEvent(ET_EVENTS.MODULE_OPENED, 'module', '', {
        module_name: moduleName || '',
    }, moduleName);
}

/**
 * AI рекомендація показана / прийнята / ігнорована
 * @param {'shown'|'accepted'|'ignored'} action
 * @param {string} signal — тип сигналу (наприклад 'owner_task_overload')
 * @param {string} severity — 'critical' | 'warning'
 */
function trackAIRecommendation(action, signal, severity) {
    const eventMap = {
        shown:    ET_EVENTS.AI_REC_SHOWN,
        accepted: ET_EVENTS.AI_REC_ACCEPTED,
        ignored:  ET_EVENTS.AI_REC_IGNORED,
    };
    const eventName = eventMap[action];
    if (!eventName) return;

    trackEvent(eventName, 'ai_rec', '', {
        signal:   signal   || '',
        severity: severity || 'warning',
    }, 'owner-dashboard');
}

/**
 * Управлінський сигнал: власник перевантажений
 * Викликається з owner-dashboard при рендері
 * @param {number} ownerTaskCount
 * @param {number} totalActiveTasks
 */
function trackOwnerTaskOverload(ownerTaskCount, totalActiveTasks) {
    const ratio = totalActiveTasks > 0
        ? Math.round((ownerTaskCount / totalActiveTasks) * 100)
        : 0;
    trackEvent(ET_EVENTS.OWNER_TASK_OVERLOAD, 'user', window.currentUser?.uid || '', {
        ownerTaskCount,
        totalActiveTasks,
        ownerRatio: ratio,
    }, 'owner-dashboard');
}

/**
 * Управлінський сигнал: функція перевантажена (overdue > поріг)
 * @param {string} functionName
 * @param {number} overdueCount
 * @param {number} activeCount
 */
function trackFunctionOverload(functionName, overdueCount, activeCount) {
    trackEvent(ET_EVENTS.FUNCTION_OVERLOAD, 'function', functionName, {
        functionName,
        overdueCount,
        activeCount,
        overdueRatio: activeCount > 0 ? Math.round((overdueCount / activeCount) * 100) : 0,
    }, 'owner-dashboard');
}

// ─────────────────────────────────────────
// ПУБЛІЧНЕ API
// ─────────────────────────────────────────
window.ET_EVENTS               = ET_EVENTS;
window.trackEvent              = trackEvent;

// Обгортки для модулів
window.trackTaskCreated         = trackTaskCreated;
window.trackTaskCompleted       = trackTaskCompleted;
window.trackTaskReturned        = trackTaskReturned;
window.trackTaskReassigned      = trackTaskReassigned;
window.trackTaskDeadlineChanged = trackTaskDeadlineChanged;
window.trackProcessStarted      = trackProcessStarted;
window.trackProcessStepDone     = trackProcessStepDone;
window.trackProcessCompleted    = trackProcessCompleted;
window.trackProcessStalled      = trackProcessStalled;
window.trackProcessSLABreached  = trackProcessSLABreached;
window.trackModuleOpened        = trackModuleOpened;
window.trackAIRecommendation    = trackAIRecommendation;
window.trackOwnerTaskOverload   = trackOwnerTaskOverload;
window.trackFunctionOverload    = trackFunctionOverload;

// Примусовий флаш (для тестування або при logout)
window.etFlush = _flush;

window.dbg && dbg('[EventTracking] Module 84b loaded');
