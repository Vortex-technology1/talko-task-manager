// ============================================================
// 77k-crm-tasks-bridge.js — CRM → Tasks Bridge v1.0
// При зміні стадії угоди → автоматичне створення задач
// Умова: isLinkActive('crm','tasks') === true
// ============================================================
(function () {
'use strict';

// ── i18n хелпер ──────────────────────────────────────────
function _t(ua, ru) {
  return (window.currentLang === 'ru') ? ru : ua;
}

// ── Конфігурація: які задачі створювати при якій стадії ───
// Власник може редагувати в Налаштуваннях CRM (TODO)
// Зараз — дефолтна конфігурація для стадії 'won'
const STAGE_TASK_TEMPLATES = {
  won: [
    {
      title:    (deal) => _t(
        `Підписати договір з ${deal.clientName || deal.title || 'клієнтом'}`,
        `Подписать договор с ${deal.clientName || deal.title || 'клиентом'}`
      ),
      priority: 'high',
      daysOffset: 1,  // дедлайн: сьогодні + N днів
    },
    {
      title:    (deal) => _t(
        `Надіслати рахунок: ${deal.clientName || ''} — ${deal.amount ? deal.amount + ' ' + (deal.currency || '') : ''}`,
        `Выставить счёт: ${deal.clientName || ''} — ${deal.amount ? deal.amount + ' ' + (deal.currency || '') : ''}`
      ),
      priority: 'high',
      daysOffset: 1,
    },
    {
      title:    (deal) => _t(
        `Передзвонити після оплати: ${deal.clientName || ''}`,
        `Перезвонить после оплаты: ${deal.clientName || ''}`
      ),
      priority: 'medium',
      daysOffset: 3,
    },
  ],
  // Можна додати інші стадії
  // negotiation: [...],
  // proposal: [...],
};

// ── Реєструємо hook ────────────────────────────────────────
window.crmAutoTasksOnStageChange = async function(deal, newStage) {
  // Перевірка зв'язку
  if (typeof window.isLinkActive === 'function' && !window.isLinkActive('crm', 'tasks')) return;

  const templates = STAGE_TASK_TEMPLATES[newStage];
  if (!templates || templates.length === 0) return;

  try {
    const db  = window.db || (window.firebase && firebase.firestore());
    const cid = window.currentCompanyId;
    if (!db || !cid) return;

    const now     = new Date();
    const uid     = window.currentUser?.uid || null;
    const batch   = db.batch();
    const tasksCol = db.collection('companies').doc(cid).collection('tasks');

    templates.forEach(tpl => {
      const deadline = new Date(now);
      deadline.setDate(deadline.getDate() + (tpl.daysOffset || 1));
      const deadlineStr = deadline.toISOString().split('T')[0];

      const taskRef  = tasksCol.doc();
      const taskData = {
        title:       tpl.title(deal),
        status:      'new',
        priority:    tpl.priority || 'medium',
        deadline:    deadlineStr,
        creatorId:   uid,
        assigneeId:  deal.assigneeId || deal.assignedToId || uid,
        source:      'crm_stage_change',
        crmDealId:   deal.id,
        crmDealTitle: deal.title || deal.clientName || '',
        clientName:  deal.clientName || '',
        note:        _t(
          `Автозадача при переході угоди в стадію «${newStage}»`,
          `Автозадача при переходе сделки в стадию «${newStage}»`
        ),
        createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:   firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Прибираємо null/undefined
      Object.keys(taskData).forEach(k => {
        if (taskData[k] === null || taskData[k] === undefined) delete taskData[k];
      });

      batch.set(taskRef, taskData);
    });

    await batch.commit();

    const count = templates.length;
    if (typeof showToast === 'function') {
      showToast(
        _t(
          `📋 Створено ${count} задач${count === 1 ? 'у' : 'и'} по угоді «${deal.clientName || deal.title || ''}»`,
          `📋 Создано ${count} задач${count === 1 ? 'у' : 'и'} по сделке «${deal.clientName || deal.title || ''}»`
        ),
        'success',
        4000
      );
    }

    console.log(`[crmTasksBridge] Created ${count} tasks for deal ${deal.id} → stage ${newStage}`);

  } catch(e) {
    console.warn('[crmTasksBridge] Error creating tasks:', e.message);
  }
};

// ── Функція для перегляду автозадач по угоді ──────────────
// Відображається в картці угоди (якщо CRM підтримує)
window.crmGetAutoTasks = async function(dealId) {
  try {
    const db  = window.db || (window.firebase && firebase.firestore());
    const cid = window.currentCompanyId;
    if (!db || !cid || !dealId) return [];
    const snap = await db.collection('companies').doc(cid).collection('tasks')
      .where('crmDealId', '==', dealId)
      .where('source', '==', 'crm_stage_change')
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    return [];
  }
};

console.log('[crmTasksBridge] v1.0 loaded');

})();
