/**
 * 77m-crm-orders-bridge.js — Бридж CRM угода → Замовлення покупця
 * TALKO SaaS — Фаза 1
 *
 * Логіка:
 *   - При зміні стадії угоди на стадію з позначкою createOrder:true
 *     автоматично створюється sales_purchase_orders
 *   - Кнопка «Створити замовлення» в картці угоди (якщо ще немає)
 *   - Кнопка «Перейти до замовлення» якщо orderId вже є
 *
 * Підключення:
 *   Викликається з 77-crm.js після зміни стадії (window.crmOnStageChange)
 */
(function () {
  'use strict';

  function tg(ua, en) { const l=window.currentLang||window.currentUserData?.language||'ua'; return l==='en'?en:ua; }
  function db()  { return window.db||(window.firebase&&firebase.firestore()); }
  function cid() { return window.currentCompanyId||null; }
  function col(name) { if(!db()||!cid()) throw new Error('DB/cid not ready'); return db().collection('companies').doc(cid()).collection(name); }
  function toast(msg,type) { if(typeof window.showToast==='function') window.showToast(msg,type||'success'); }
  function serverTs() { return firebase.firestore.FieldValue.serverTimestamp(); }

  const COL_ORD = 'sales_purchase_orders';

  // ─── Генерація номера замовлення ─────────────────────────────────────────
  async function generateOrderNumber() {
    const year = new Date().getFullYear();
    try {
      // Атомарний лічильник — той самий що в 106-sales-orders.js
      const counterRef = db().collection('companies').doc(cid()).collection('settings').doc('sales_counters');
      let seq = 1;
      await db().runTransaction(async (tx) => {
        const doc = await tx.get(counterRef);
        const data = doc.exists ? doc.data() : {};
        seq = Number(data[`order_${year}`] || 0) + 1;
        tx.set(counterRef, { [`order_${year}`]: seq }, { merge: true });
      });
      return `ORD-${year}-${String(seq).padStart(4,'0')}`;
    } catch(e) {
      return `ORD-${year}-${String(Date.now()).slice(-6)}`;
    }
  }

  // ─── Перевірка: чи стадія має createOrder ────────────────────────────────
  async function stageHasCreateOrder(stageId) {
    if (!stageId || !cid()) return false;
    try {
      // Шукаємо в crm_pipeline
      const pipeSnap = await col('crm_pipeline').limit(1).get();
      if (pipeSnap.empty) return false;
      const pipe = pipeSnap.docs[0].data();
      const stages = pipe.stages || [];
      const stage = stages.find(s => s.id === stageId);
      return !!(stage && stage.createOrder);
    } catch(e) {
      // Спробуємо crm_pipelines
      try {
        const snap = await col('crm_pipelines').limit(5).get();
        for (const doc of snap.docs) {
          const stages = doc.data().stages || [];
          const stage = stages.find(s => s.id === stageId);
          if (stage) return !!(stage.createOrder);
        }
      } catch(e2) { /* ignore */ }
      return false;
    }
  }

  // ─── Створити замовлення з угоди ─────────────────────────────────────────
  async function createOrderFromDeal(deal) {
    if (!deal || !cid()) return null;

    if (deal.orderId) {
      toast(tg('Замовлення вже існує: ','Order already exists: ') + deal.orderId, 'info');
      return deal.orderId;
    }

    try {
      // БАГ 21 fix: підтягуємо умови клієнта з crm_clients
      let paymentCondition = 'prepay';
      let paymentDueDays   = 0;
      let priceTypeId      = null;
      let currency         = 'UAH';

      if (deal.clientId) {
        try {
          const clientSnap = await col('crm_clients').doc(deal.clientId).get();
          if (clientSnap.exists) {
            const cl = clientSnap.data();
            paymentCondition = cl.paymentCondition || 'prepay';
            paymentDueDays   = Number(cl.paymentDueDays || 0);
            priceTypeId      = cl.priceTypeId || null;
            currency         = cl.currency || 'UAH';
          }
        } catch(e) { /* fallback to defaults */ }
      }

      const number = await generateOrderNumber();
      const payload = {
        number,
        status:           'new',
        dealId:           deal.id,
        clientId:         deal.clientId || null,
        clientName:       deal.clientName || deal.title || '',
        assigneeId:       deal.assigneeId || deal.responsibleId || window.currentUserData?.id || '',
        paymentCondition,
        paymentDueDays,
        priceTypeId,
        currency,
        items:            [],
        totalAmount:      Number(deal.amount || 0),
        discountAmount:   0,
        note:             '',
        source:           'crm_deal',
        createdBy:        window.currentUserData?.id || '',
        createdAt:        serverTs(),
        updatedAt:        serverTs(),
      };

      const ref = await col(COL_ORD).add(payload);

      await col('crm_deals').doc(deal.id).update({
        orderId:   ref.id,
        updatedAt: serverTs(),
      });

      toast(tg('Замовлення створено: ','Order created: ') + number);

      if (window.crm && Array.isArray(window.crm.deals)) {
        const d = window.crm.deals.find(x => x.id === deal.id);
        if (d) d.orderId = ref.id;
      }

      return ref.id;
    } catch(e) {
      console.error('77m createOrderFromDeal:', e);
      toast(tg('Помилка створення замовлення: ','Order creation error: ') + e.message, 'error');
      return null;
    }
  }

  // ─── Хук на зміну стадії ─────────────────────────────────────────────────
  window.crmOrdersBridgeOnStageChange = async function (deal, newStageId) {
    if (!deal || !newStageId) return;
    // Автоматично створюємо замовлення при переході на Won (якщо ще немає)
    if (newStageId === 'won' && !deal.orderId) {
      try {
        await createOrderFromDeal(deal);
      } catch(e) {
        console.warn('77m onStageChange won:', e.message);
      }
    }
  };

  // ─── Рендер кнопки в картці угоди ────────────────────────────────────────
  // Викликається з 77-crm.js при рендері картки угоди
  // window.crmRenderOrderButton(deal, containerEl)
  window.crmRenderOrderButton = function (deal, containerEl) {
    if (!deal || !containerEl) return;

    const existing = containerEl.querySelector('.crm-order-btn-wrap');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.className = 'crm-order-btn-wrap';
    wrap.style.cssText = 'margin-top:8px';

    if (deal.orderId) {
      wrap.innerHTML = `<button onclick="window._crmGoToOrder('${deal.orderId}')"
        style="width:100%;padding:8px 14px;background:#ede9fe;color:#6366f1;border:1px solid #c4b5fd;border-radius:7px;cursor:pointer;font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:6px;justify-content:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        ${tg('Перейти до замовлення','Go to order')}
      </button>`;
    } else {
      wrap.innerHTML = `<button onclick="window._crmCreateOrderFromDeal('${deal.id}')"
        style="width:100%;padding:8px 14px;background:#f0fdf4;color:#059669;border:1px solid #bbf7d0;border-radius:7px;cursor:pointer;font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:6px;justify-content:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        ${tg('Створити замовлення','Create order')}
      </button>`;
    }

    containerEl.appendChild(wrap);
  };

  // ─── Перейти до замовлення (відкрити Sales таб) ───────────────────────────
  window._crmGoToOrder = function (orderId) {
    // Перемикаємо на таб Sales → підвкладка Замовлення
    if (typeof window.switchTab === 'function') {
      window.switchTab('sales');
    } else {
      const salesBtn = document.querySelector('[data-tab="sales"]') ||
                       document.getElementById('salesNavBtn');
      if (salesBtn) salesBtn.click();
    }
    // Невелика затримка для завантаження lazy групи
    setTimeout(() => {
      const ordersBtn = document.getElementById('slSubOrders');
      if (ordersBtn) ordersBtn.click();
      // Підсвічуємо потрібне замовлення (якщо список вже завантажено)
      setTimeout(() => {
        const rows = document.querySelectorAll('#soListWrap tbody tr');
        rows.forEach(row => {
          if (row.textContent.includes(orderId)) {
            row.style.background = '#fef3c7';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => { row.style.background = ''; }, 2000);
          }
        });
      }, 800);
    }, 300);
  };

  // ─── Створити замовлення з картки угоди (кнопка) ─────────────────────────
  window._crmCreateOrderFromDeal = async function (dealId) {
    // Перевірка доступу через allowedTabs (дзеркало firestore rules)
    if (!window._userHasTabAccess('sales')) {
      toast(tg('Немає доступу до модуля Продажі', 'No access to Sales module'), 'error');
      return;
    }
    const deal = window.crm?.deals?.find(d => d.id === dealId);
    if (!deal) {
      // Завантажуємо угоду з Firestore
      try {
        const snap = await col('crm_deals').doc(dealId).get();
        if (!snap.exists) { toast(tg('Угоду не знайдено','Deal not found'), 'error'); return; }
        const freshDeal = { id: snap.id, ...snap.data() };
        const orderId = await createOrderFromDeal(freshDeal);
        if (orderId) {
          // Оновлюємо кнопку в картці
          const btn = document.querySelector(`.crm-order-btn-wrap button[onclick*="${dealId}"]`);
          if (btn) {
            const wrap = btn.closest('.crm-order-btn-wrap');
            if (wrap) {
              wrap.innerHTML = `<button onclick="window._crmGoToOrder('${orderId}')"
                style="width:100%;padding:8px 14px;background:#ede9fe;color:#6366f1;border:1px solid #c4b5fd;border-radius:7px;cursor:pointer;font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:6px;justify-content:center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                ${tg('Перейти до замовлення','Go to order')}
              </button>`;
            }
          }
        }
      } catch(e) {
        toast(tg('Помилка: ','Error: ') + e.message, 'error');
      }
      return;
    }
    const orderId = await createOrderFromDeal(deal);
    if (orderId) {
      // Оновлюємо кнопку у footer картки угоди (нова структура через crmOpenDeal)
      _refreshOrderButton(dealId, orderId);
    }
  };

  // Оновлюємо кнопку замовлення у footer без перезавантаження картки
  function _refreshOrderButton(dealId, orderId) {
    // Шукаємо кнопку «Замовлення» у footer crmDealOverlay
    const footer = document.querySelector('#crmDealOverlay .crm-order-footer-btn');
    if (footer) {
      footer.style.background = '#ede9fe';
      footer.style.color = '#6366f1';
      footer.style.borderColor = '#c4b5fd';
      footer.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> ${tg('Замовлення →','Order →')}`;
      footer.setAttribute('onclick', `window._crmGoToOrder('${orderId}')`);
      return;
    }
    // Fallback — перезавантажуємо картку
    if (typeof window.crmOpenDeal === 'function' && window.crm?.activeDealId === dealId) {
      setTimeout(() => window.crmOpenDeal(dealId), 300);
    }
  }

  // ─── Публічне API ─────────────────────────────────────────────────────────
  window.crmCreateOrderFromDeal = createOrderFromDeal;

  console.log('77m-crm-orders-bridge: loaded');

})();
