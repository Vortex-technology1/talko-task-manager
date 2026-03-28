// ============================================================
// 77k-crm-tasks-bridge.js — CRM → Tasks Bridge v1.1
// Розширює 77c-crm-tasks.js:
// - додає перевірку isLinkActive('crm','tasks')
// - додає дефолтні шаблони задач при won (якщо немає в pipeline)
// ============================================================
(function () {
'use strict';

// ── i18n хелпер ──────────────────────────────────────────
function _t(ua, ru) {
  return (window.currentLang === 'ru') ? ru : ua;
}

// ── Дефолтні шаблони для won якщо в pipeline немає ────────
const DEFAULT_WON_TASKS = [
  {
    title:    (deal) => _t(
      `Підписати договір з ${deal.clientName || deal.title || 'клієнтом'}`,
      `Подписать договор с ${deal.clientName || deal.title || 'клиентом'}`
    ),
    priority: 'high',
    daysOffset: 1,
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
];

// ── Патчимо crmAutoTasksOnStageChange після завантаження 77c ─
function _patch() {
  const orig = window.crmAutoTasksOnStageChange;

  window.crmAutoTasksOnStageChange = async function(deal, newStage) {
    // 1. Перевірка зв'язку CRM→Завдання
    if (typeof window.isLinkActive === 'function' && !window.isLinkActive('crm', 'tasks')) return;

    // 2. Спочатку викликаємо оригінальну логіку 77c (шаблони з pipeline)
    const pipeline = window.crm?.pipeline;
    const hasPipelineTemplates = pipeline?.taskTemplates?.some(t => t.stageId === newStage && t.title);

    if (hasPipelineTemplates && typeof orig === 'function') {
      await orig.call(this, deal, newStage);
      return;
    }

    // 3. Fallback — дефолтні шаблони для won якщо в pipeline нічого немає
    if (newStage !== 'won') return;

    try {
      const db  = window.db || (window.firebase && firebase.firestore());
      const cid = window.currentCompanyId;
      if (!db || !cid) return;

      const uid    = window.currentUser?.uid || '';
      const today  = new Date().toISOString().slice(0, 10);
      const col    = db.collection('companies').doc(cid).collection(window.DB_COLS?.TASKS || 'tasks');

      for (const tpl of DEFAULT_WON_TASKS) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + (tpl.daysOffset || 1));
        const deadlineStr = deadline.toISOString().slice(0, 10);

        await col.add({
          title:        typeof tpl.title === 'function' ? tpl.title(deal) : tpl.title,
          dueDate:      deadlineStr,
          deadlineDate: deadlineStr,
          deadlineTime: '18:00',
          deadline:     deadlineStr + 'T18:00',
          createdDate:  today,
          assigneeId:   deal.assigneeId || uid,
          assigneeName: '',
          creatorId:    uid,
          status:       'new',
          priority:     tpl.priority || 'medium',
          pinned:       false,
          autoCreated:  true,
          source:       'crm_won',
          crmDealId:    deal.id,
          clientName:   deal.clientName || deal.title || '',
          createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt:    firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      if (typeof showToast === 'function') {
        showToast(_t('Задачі по угоді створено', 'Задачи по сделке созданы'), 'success');
      }
    } catch(e) {
      console.warn('[crmTasksBridge] error:', e.message);
    }
  };

  console.log('[crmTasksBridge] v1.1 patched ✓');
}

// Патчимо після завантаження 77c
setTimeout(_patch, 200);

})();
