// ============================================================
// 98-finance-balance.js — Balance Sheet (Управлінський Баланс) v1.0
// Вкладка Фінанси → Баланс
// Активи = Пасиви + Капітал (подвійний запис)
// ============================================================
(function () {
'use strict';

// ── i18n хелпер (локальний) ──────────────────────────────
function _t(ua, ru) {
  return (window.currentLang === 'ru' || (typeof window.getLocale === 'function' && window.getLocale().startsWith('ru'))) ? ru : ua;
}


// ── Точка входу (викликається з 98-finance.js) ─────────────
window.renderBalanceSheet = async function(el) {
  if (!el) return;
  el.innerHTML = _skeleton();

  try {
    const data = await _buildBalanceData();
    _render(el, data);
  } catch(e) {
    el.innerHTML = `<div style="padding:2rem;color:#ef4444;font-size:0.82rem;">Помилка: ${e.message}</div>`;
    console.error('[balance] render error:', e);
  }
};

// ── Збір даних балансу ─────────────────────────────────────
async function _buildBalanceData() {
  const db  = window.db || (window.firebase && firebase.firestore());
  const cid = window.currentCompanyId;
  if (!db || !cid) throw new Error('DB не ініціалізовано');

  const col = (name) => db.collection('companies').doc(cid).collection(name);

  // Паралельно завантажуємо всі дані
  const [
    accountsSnap,
    txSnap,
    crmDealsSnap,
    warehouseSnap,
    settingsSnap,
  ] = await Promise.all([
    col('finance_accounts').get(),
    col('finance_transactions').orderBy('date','desc').limit(500).get(),
    col('crm_deals').where('stage','==','won').get().catch(()=>null),
    col('warehouse_items').get().catch(()=>null),
    col('finance_settings').doc('balance_settings').get().catch(()=>null),
  ]);

  const accounts  = accountsSnap.docs.map(d=>({id:d.id,...d.data()}));
  const txs       = txSnap.docs.map(d=>({id:d.id,...d.data()}));
  const deals     = crmDealsSnap?.docs?.map(d=>({id:d.id,...d.data()})) || [];
  const items     = warehouseSnap?.docs?.map(d=>({id:d.id,...d.data()})) || [];
  const settings  = settingsSnap?.exists ? settingsSnap.data() : {};

  const currency  = window.currentCompanyData?.currency || 'UAH';
  const now       = new Date();

  // ── АКТИВИ ──────────────────────────────────────────────
  // 1. Поточні активи: залишки на рахунках
  const cashTotal = accounts.reduce((s,a)=>s+(a.balance||0),0);
  const cashItems = accounts.map(a=>({ name: a.name, value: a.balance||0, sub: a.type+' · '+a.currency }));

  // 2. Дебіторська заборгованість (з CRM — виграні угоди без financeLinked)
  // Дебіторка: виграні угоди без прив'язки до фінансів
  // Виключаємо угоди закриті більше 90 днів тому (вважаємо що вже оплачено або не актуально)
  const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const debtors = deals.filter(d => {
    if (d.financeLinked) return false;
    if ((d.amount||0) <= 0) return false;
    // Якщо є дата закриття і вона старша 90 днів — не рахуємо
    const wonAt = d.wonAt?.toDate?.() || (d.wonAt ? new Date(d.wonAt) : null);
    if (wonAt && wonAt < ninetyDaysAgo) return false;
    return true;
  });
  const debtorTotal = debtors.reduce((s,d)=>s+(d.amount||0),0);
  const debtorItems = debtors.slice(0,5).map(d=>({
    name: d.clientName||d.title||'—',
    value: d.amount||0,
    sub: 'CRM угода · ' + (d.wonAt?.toDate?.()?.toLocaleDateString('uk-UA')||'')
  }));
  if (debtors.length > 5) debtorItems.push({name:`+ще ${debtors.length-5} угод`, value: debtors.slice(5).reduce((s,d)=>s+(d.amount||0),0), sub:''});

  // 3. Запаси (зі складу)
  const stockTotal = items.reduce((s,i)=>s+((i.qty||0)*(i.costPrice||i.avgPrice||i.price||0)),0);
  const stockItems = items.filter(i=>(i.qty||0)>0).slice(0,5).map(i=>({
    name: i.name||'—',
    value: (i.qty||0)*(i.costPrice||i.avgPrice||i.price||0),
    sub: `${i.qty} ${i.unit||'шт'} × ${i.avgPrice||i.price||0}`
  }));

  // 4. Необоротні активи (введені вручну у налаштуваннях балансу)
  const fixedAssets = settings.fixedAssets || [];
  const fixedTotal  = fixedAssets.reduce((s,a)=>s+(a.value||0),0);

  const totalAssets = cashTotal + debtorTotal + stockTotal + fixedTotal;

  // ── ПАСИВИ ──────────────────────────────────────────────
  // 1. Кредиторська заборгованість (транзакції з майбутньою датою нарахування)
  const futureExpenses = txs.filter(t=>{
    if (t.type!=='expense') return false;
    const accDate = t.accrualDate?.toDate?.() || (t.accrualDate ? new Date(t.accrualDate) : null);
    return accDate && accDate > now;
  });
  const creditorTotal = futureExpenses.reduce((s,t)=>s+(t.amountBase||t.amount||0),0);

  // 2. Поточні зобов'язання з налаштувань
  const currentLiab    = settings.currentLiabilities    || [];
  const longTermLiab   = settings.longTermLiabilities    || [];
  const currentLiabTotal  = currentLiab.reduce((s,l)=>s+(l.value||0),0);
  const longTermLiabTotal = longTermLiab.reduce((s,l)=>s+(l.value||0),0);

  const totalLiabilities = creditorTotal + currentLiabTotal + longTermLiabTotal;

  // ── КАПІТАЛ ─────────────────────────────────────────────
  // Капітал = Активи − Пасиви (за принципом подвійного запису)
  // Статутний капітал + накопичений прибуток (з P&L)
  const registeredCapital = settings.registeredCapital || 0;

  // Накопичений прибуток = сума всіх транзакцій за весь час
  const allIncome  = txs.filter(t=>t.type==='income').reduce((s,t)=>s+(t.amountBase||t.amount||0),0);
  const allExpense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+(t.amountBase||t.amount||0),0);
  const retainedEarnings = allIncome - allExpense;

  const totalCapital  = totalAssets - totalLiabilities;
  const isBalanced    = Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 1;

  return {
    currency, now, isBalanced,
    assets: {
      cash:      { total: cashTotal,    items: cashItems },
      debtors:   { total: debtorTotal,  items: debtorItems },
      stock:     { total: stockTotal,   items: stockItems },
      fixed:     { total: fixedTotal,   items: fixedAssets },
      total:     totalAssets,
    },
    liabilities: {
      creditors:   { total: creditorTotal,    items: [] },
      current:     { total: currentLiabTotal, items: currentLiab },
      longTerm:    { total: longTermLiabTotal,items: longTermLiab },
      total:       totalLiabilities,
    },
    capital: {
      registered:  registeredCapital,
      retained:    retainedEarnings,
      total:       totalCapital,
    },
    meta: { allIncome, allExpense, txCount: txs.length },
  };
}

// ── Рендер ─────────────────────────────────────────────────
function _render(el, d) {
  const cur = d.currency;
  const f   = (v) => _fmt(v, cur);
  const pColor = (v) => v >= 0 ? '#22c55e' : '#ef4444';

  // Баланс рівняння
  const balanceOk = d.isBalanced;

  const header = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <div style="font-size:1rem;font-weight:700;color:#1a1a1a;">${_t('Управлінський Баланс','Управленческий Баланс')}</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span style="font-size:0.75rem;color:#6b7280;">
          ${_t('Станом на','По состоянию на')} ${d.now.toLocaleDateString(_t('uk-UA','ru-RU'),{day:'numeric',month:'long',year:'numeric'})}
        </span>
        <span style="padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:600;
          background:${balanceOk?'#f0fdf4':'#fef2f2'};color:${balanceOk?'#16a34a':'#dc2626'};">
          ${balanceOk ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${_t('Баланс зведений','Баланс сведён')}` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${_t('Перевірте дані','Проверьте данные')}`}
        </span>
        <button onclick="window.renderBalanceSheet(this.closest('[id]'))"
          style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;
            font-size:0.75rem;cursor:pointer;color:#374151;">
          ↻ ${_t('Оновити','Обновить')}
        </button>
        <button onclick="window._showBalanceSettings()"
          style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;
            font-size:0.75rem;cursor:pointer;color:#374151;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M2 12h2M20 12h2M12 2v2M12 20v2"/></svg> ${_t('Налаштування','Настройки')}
        </button>
      </div>
    </div>`;

  // KPI рівняння балансу
  const equation = `
    <div style="background:#1f2937;border-radius:12px;padding:14px 20px;margin-bottom:14px;
      display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;">
      ${[
        {l:_t('АКТИВИ','АКТИВЫ'),  v:f(d.assets.total),      c:'#22c55e'},
        {l:'=',       v:'',                       c:'#9ca3af', eq:true},
        {l:_t('ПАСИВИ','ПАССИВЫ'),  v:f(d.liabilities.total),  c:'#ef4444'},
        {l:'+',       v:'',                       c:'#9ca3af', eq:true},
        {l:_t(_t('КАПІТАЛ','КАПИТАЛ'),'КАПИТАЛ'), v:f(d.capital.total),       c:'#3b82f6'},
      ].map(k=>k.eq
        ? `<span style="font-size:1.2rem;color:${k.c};font-weight:700;">${k.l}</span>`
        : `<div style="text-align:center;">
            <div style="font-size:0.65rem;color:#9ca3af;letter-spacing:.05em;">${k.l}</div>
            <div style="font-size:1.1rem;font-weight:700;color:${k.c};">${k.v}</div>
           </div>`
      ).join('')}
    </div>`;

  // Двоколонкова таблиця
  const colStyle = 'background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;';

  const sectionHdr = (emoji, label, total, color, bg) => `
    <div style="background:${bg};padding:8px 14px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:0.78rem;font-weight:700;color:${color};">${emoji} ${label}</span>
      <span style="font-size:0.85rem;font-weight:700;color:${color};">${f(total)}</span>
    </div>`;

  const subHdr = (label, total) => `
    <div style="background:#f9fafb;padding:6px 14px;display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;">
      <span style="font-size:0.73rem;font-weight:600;color:#374151;">${label}</span>
      <span style="font-size:0.73rem;font-weight:600;color:#374151;">${f(total)}</span>
    </div>`;

  const row = (name, value, sub, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 14px;
      background:${i%2===0?'#fff':'#fafafa'};border-bottom:1px solid #f9f9f9;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.78rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
        ${sub?`<div style="font-size:0.65rem;color:#9ca3af;">${sub}</div>`:''}
      </div>
      <div style="font-size:0.78rem;font-weight:600;color:#1a1a1a;white-space:nowrap;">${f(value)}</div>
    </div>`;

  const emptyRow = (msg) =>
    `<div style="padding:10px 14px;font-size:0.75rem;color:#9ca3af;text-align:center;">${msg}</div>`;

  // АКТИВИ
  const assetsHtml = `
    <div style="${colStyle}">
      ${sectionHdr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',_t('АКТИВИ','АКТИВЫ'), d.assets.total, '#16a34a', '#f0fdf4')}

      ${subHdr(_t('Грошові кошти (рахунки)','Денежные средства (счета)'), d.assets.cash.total)}
      ${d.assets.cash.items.length
        ? d.assets.cash.items.map((it,i)=>row(it.name,it.value,it.sub,i)).join('')
        : emptyRow(_t(_t('Рахунки не налаштовані','Счета не настроены'),'Счета не настроены'))}

      ${subHdr(_t('Дебіторська заборгованість','Дебиторская задолженность'), d.assets.debtors.total)}
      ${d.assets.debtors.total > 0
        ? d.assets.debtors.items.map((it,i)=>row(it.name,it.value,it.sub,i)).join('')
        : emptyRow(_t('Немає відкритої дебіторки','Нет открытой дебиторки'))}
      ${d.assets.debtors.total === 0
        ? ''
        : `<div style="padding:4px 14px;font-size:0.68rem;color:#9ca3af;">
            ${_t('← Закриті угоди CRM без фіксації у фінансах','← Закрытые сделки CRM без фиксации в финансах')}</div>`}

      ${subHdr(_t('Запаси (склад)','Запасы (склад)'), d.assets.stock.total)}
      ${d.assets.stock.total > 0
        ? d.assets.stock.items.map((it,i)=>row(it.name,it.value,it.sub,i)).join('')
        : emptyRow(_t('Склад порожній або не підключений','Склад пуст или не подключён'))}

      ${subHdr(_t('Необоротні активи','Внеоборотные активы'), d.assets.fixed.total)}
      ${d.assets.fixed.items.length
        ? d.assets.fixed.items.map((it,i)=>row(it.name||'',it.value||0,it.sub||'',i)).join('')
        : `<div style="padding:8px 14px;font-size:0.75rem;color:#9ca3af;">
            ${_t('Обладнання, авто, нерухомість.','Оборудование, авто, недвижимость.')}
            <a href="#" onclick="window._showBalanceSettings();return false;" style="color:#3b82f6;">${_t('Додати →','Добавить →')}</a>
          </div>`}

      <div style="background:#f0fdf4;padding:10px 14px;display:flex;justify-content:space-between;border-top:2px solid #22c55e;">
        <span style="font-size:0.82rem;font-weight:700;color:#16a34a;">${_t('РАЗОМ АКТИВИ','ИТОГО АКТИВЫ')}</span>
        <span style="font-size:0.95rem;font-weight:700;color:#16a34a;">${f(d.assets.total)}</span>
      </div>
    </div>`;

  // ПАСИВИ + КАПІТАЛ
  const liabCapHtml = `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <!-- Пасиви -->
      <div style="${colStyle}">
        ${sectionHdr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',_t('ПАСИВИ','ПАССИВЫ'), d.liabilities.total, '#dc2626', '#fef2f2')}

        ${subHdr(_t('Поточні зобов\'язання','Текущие обязательства'), d.liabilities.current.total + d.liabilities.creditors.total)}
        ${d.liabilities.creditors.total > 0
          ? row(_t('Нараховані але не сплачені витрати','Начисленные, но не выплаченные расходы'), d.liabilities.creditors.total, _t('транзакції з майбутньою датою нарахування','транзакции с будущей датой начисления'), 0)
          : ''}
        ${d.liabilities.current.items.length
          ? d.liabilities.current.items.map((it,i)=>row(it.name||'',it.value||0,it.sub||'',i)).join('')
          : emptyRow(_t('Немає поточних зобов\'язань','Нет текущих обязательств'))}

        ${subHdr(_t('Довгострокові зобов\'язання','Долгосрочные обязательства'), d.liabilities.longTerm.total)}
        ${d.liabilities.longTerm.items.length
          ? d.liabilities.longTerm.items.map((it,i)=>row(it.name||'',it.value||0,it.sub||'',i)).join('')
          : `<div style="padding:8px 14px;font-size:0.75rem;color:#9ca3af;">
              ${_t('Кредити, позики.','Кредиты, займы.')}
              <a href="#" onclick="window._showBalanceSettings();return false;" style="color:#3b82f6;">${_t('Додати →','Добавить →')}</a>
             </div>`}

        <div style="background:#fef2f2;padding:10px 14px;display:flex;justify-content:space-between;border-top:2px solid #ef4444;">
          <span style="font-size:0.82rem;font-weight:700;color:#dc2626;">${_t('РАЗОМ ПАСИВИ','ИТОГО ПАССИВЫ')}</span>
          <span style="font-size:0.95rem;font-weight:700;color:#dc2626;">${f(d.liabilities.total)}</span>
        </div>
      </div>

      <!-- Капітал -->
      <div style="${colStyle}">
        ${sectionHdr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',_t('ВЛАСНИЙ КАПІТАЛ','СОБСТВЕННЫЙ КАПИТАЛ'), d.capital.total, '#2563eb', '#eff6ff')}

        ${row(_t('Статутний капітал','Уставной капитал'), d.capital.registered, _t('налаштування балансу','настройки баланса'), 0)}
        ${row(_t('Накопичений прибуток','Накопленная прибыль'), d.capital.retained,
          `${f(d.meta.allIncome)} ${_t("доходів","доходов")} − ${f(d.meta.allExpense)} ${_t("витрат за весь час","расходов за всё время")}`, 1)}

        <div style="background:#eff6ff;padding:10px 14px;display:flex;justify-content:space-between;border-top:2px solid #3b82f6;">
          <span style="font-size:0.82rem;font-weight:700;color:#2563eb;">${_t('РАЗОМ КАПІТАЛ','ИТОГО КАПИТАЛ')}</span>
          <span style="font-size:0.95rem;font-weight:700;color:${pColor(d.capital.total)};">${f(d.capital.total)}</span>
        </div>
      </div>
    </div>`;

  // Підказки
  const hints = `
    <div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px;font-size:0.75rem;color:#1e40af;">
        ${_t('<b>Дебіторка</b> формується автоматично з CRM (угоди «Виграно» без оплати). Щоб дебіторка зникла — зафіксуйте оплату в CRM або в транзакції.','<b>Дебиторка</b> формируется автоматически из CRM (сделки «Выиграно» без оплаты). Чтобы дебиторка исчезла — зафиксируйте оплату в CRM или в транзакции.')}
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;font-size:0.75rem;color:#166534;">
        ${_t('<b>Запаси</b> підтягуються автоматично зі Складу (кількість × середня ціна). Для точності — регулярно оновлюйте ціни у картках товарів.','<b>Запасы</b> подтягиваются автоматически со Склада (количество × средняя цена). Для точности — регулярно обновляйте цены в карточках товаров.')}
      </div>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:10px 14px;font-size:0.75rem;color:#c2410c;">
        ${_t('<b>Необоротні активи і зобов\'язання</b> вводяться вручну. Натисніть ⚙ Налаштування щоб додати авто, обладнання, кредити.','<b>Внеоборотные активы и обязательства</b> вводятся вручную. Нажмите ⚙ Настройки чтобы добавить авто, оборудование, кредиты.')}
      </div>
    </div>`;

  el.innerHTML = header + equation + `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;">
      ${assetsHtml}
      ${liabCapHtml}
    </div>` + hints;
}

// ── Модал налаштувань балансу ──────────────────────────────
window._showBalanceSettings = function() {
  const old = document.getElementById('balanceSettingsModal');
  if (old) old.remove();

  const settings = window._balanceSettingsCache || {};
  const regCap   = settings.registeredCapital || 0;
  const fixed    = settings.fixedAssets       || [];
  const currLiab = settings.currentLiabilities|| [];
  const ltLiab   = settings.longTermLiabilities || [];

  const listHtml = (items, prefix) => items.map((it,i)=>`
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
      <input type="text" value="${_esc(it.name||'')}" placeholder="${_t('Назва','Название')}"
        id="${prefix}_name_${i}"
        style="flex:2;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.8rem;">
      <input type="number" value="${it.value||''}" placeholder="${_t('Сума','Сумма')}" min="0"
        id="${prefix}_val_${i}"
        style="flex:1;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.8rem;">
      <button onclick="this.closest('div').remove()" style="padding:4px 8px;border:none;background:#fef2f2;color:#ef4444;border-radius:5px;cursor:pointer;font-size:0.75rem;">×</button>
    </div>`).join('');

  const modal = document.createElement('div');
  modal.id = 'balanceSettingsModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:14px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
      <div style="padding:1rem 1.25rem;border-bottom:1px solid #f3f4f6;font-size:0.95rem;font-weight:700;color:#1a1a1a;display:flex;justify-content:space-between;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M2 12h2M20 12h2M12 2v2M12 20v2"/></svg> ${_t('Налаштування Балансу','Настройки Баланса')}
        <button onclick="document.getElementById('balanceSettingsModal')?.remove()" style="border:none;background:none;cursor:pointer;color:#9ca3af;font-size:1.1rem;">×</button>
      </div>
      <div style="padding:1.1rem 1.25rem;display:flex;flex-direction:column;gap:1rem;">

        <div>
          <label style="font-size:0.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px;">${_t('Статутний капітал','Уставной капитал')}</label>
          <input id="bs_reg_cap" type="number" value="${regCap}" min="0" placeholder="0"
            style="width:100%;padding:6px 10px;border:1px solid #e5e7eb;border-radius:7px;font-size:0.85rem;box-sizing:border-box;">
        </div>

        <div>
          <div style="font-size:0.78rem;font-weight:600;color:#374151;margin-bottom:6px;">
            ${_t('Необоротні активи (обладнання, авто, нерухомість)','Внеоборотные активы (оборудование, авто, недвижимость)')}
            <button onclick="window._bsAddRow('fixed')" style="margin-left:8px;padding:2px 8px;border:1px solid #22c55e;border-radius:5px;background:#f0fdf4;color:#16a34a;font-size:0.72rem;cursor:pointer;">+ Додати</button>
          </div>
          <div id="bs_fixed_list">${listHtml(fixed,'fixed')}</div>
        </div>

        <div>
          <div style="font-size:0.78rem;font-weight:600;color:#374151;margin-bottom:6px;">
            ${_t('Поточні зобов\'язання (заборгованість постачальникам)','Текущие обязательства (задолженность поставщикам)')}
            <button onclick="window._bsAddRow('currLiab')" style="margin-left:8px;padding:2px 8px;border:1px solid #ef4444;border-radius:5px;background:#fef2f2;color:#dc2626;font-size:0.72rem;cursor:pointer;">+ Додати</button>
          </div>
          <div id="bs_currLiab_list">${listHtml(currLiab,'currLiab')}</div>
        </div>

        <div>
          <div style="font-size:0.78rem;font-weight:600;color:#374151;margin-bottom:6px;">
            ${_t('Довгострокові зобов\'язання (кредити, позики)','Долгосрочные обязательства (кредиты, займы)')}
            <button onclick="window._bsAddRow('ltLiab')" style="margin-left:8px;padding:2px 8px;border:1px solid #ef4444;border-radius:5px;background:#fef2f2;color:#dc2626;font-size:0.72rem;cursor:pointer;">+ Додати</button>
          </div>
          <div id="bs_ltLiab_list">${listHtml(ltLiab,'ltLiab')}</div>
        </div>

        <div style="display:flex;gap:8px;margin-top:4px;">
          <button onclick="document.getElementById('balanceSettingsModal')?.remove()"
            style="flex:1;padding:0.55rem;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:0.83rem;color:#6b7280;">${_t('Скасувати','Отменить')}</button>
          <button onclick="window._bsSave()" id="bsSaveBtn"
            style="flex:2;padding:0.55rem;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:0.83rem;font-weight:700;">${_t('Зберегти','Сохранить')}</button>
        </div>
      </div>
    </div>`;

  modal.addEventListener('click', e=>{if(e.target===modal)modal.remove();});
  document.body.appendChild(modal);
};

window._bsAddRow = function(prefix) {
  const list = document.getElementById(`bs_${prefix}_list`);
  if (!list) return;
  const i = list.children.length;
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
  div.innerHTML = `
    <input type="text" placeholder="${_t('Назва','Название')}" id="${prefix}_name_${i}"
      style="flex:2;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.8rem;">
    <input type="number" placeholder="${_t('Сума','Сумма')}" min="0" id="${prefix}_val_${i}"
      style="flex:1;padding:5px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.8rem;">
    <button onclick="this.closest('div').remove()" style="padding:4px 8px;border:none;background:#fef2f2;color:#ef4444;border-radius:5px;cursor:pointer;font-size:0.75rem;">×</button>`;
  list.appendChild(div);
};

window._bsSave = async function() {
  const btn = document.getElementById('bsSaveBtn');
  if (btn) { btn.disabled=true; btn.textContent='Збереження...'; }

  const _readList = (prefix) => {
    const list = document.getElementById(`bs_${prefix}_list`);
    if (!list) return [];
    return [...list.querySelectorAll('div')].map((row,i)=>{
      const name = row.querySelector(`input[type=text]`)?.value?.trim();
      const val  = parseFloat(row.querySelector(`input[type=number]`)?.value) || 0;
      return name ? { name, value: val } : null;
    }).filter(Boolean);
  };

  const data = {
    registeredCapital:    parseFloat(document.getElementById('bs_reg_cap')?.value)||0,
    fixedAssets:          _readList('fixed'),
    currentLiabilities:   _readList('currLiab'),
    longTermLiabilities:  _readList('ltLiab'),
    updatedAt:            firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const db  = window.db || (window.firebase && firebase.firestore());
    const cid = window.currentCompanyId;
    await db.collection('companies').doc(cid).collection('finance_settings')
      .doc('balance_settings').set(data, { merge:true });
    window._balanceSettingsCache = data;
    document.getElementById('balanceSettingsModal')?.remove();
    if (typeof showToast==='function') showToast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Налаштування балансу збережено','success');
    // Оновлюємо баланс
    const inner = document.getElementById('financeContentInner');
    if (inner) window.renderBalanceSheet(inner);
  } catch(e) {
    if (typeof showToast==='function') showToast(_t('Помилка: ','Ошибка: ')+e.message,'error');
    if (btn) { btn.disabled=false; btn.textContent=_t(_t('Зберегти','Сохранить'),'Сохранить'); }
  }
};

// ── Хелпери ────────────────────────────────────────────────
function _fmt(n, currency) {
  try {
    return new Intl.NumberFormat('uk-UA',{style:'currency',currency:currency||'UAH',maximumFractionDigits:0}).format(n||0);
  } catch(e) { return (n||0).toLocaleString(); }
}

function _esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function _skeleton() {
  return `<div style="display:flex;align-items:center;justify-content:center;padding:3rem;color:#9ca3af;gap:8px;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
    Формування балансу...
  </div>`;
}

console.log('[balanceSheet] v1.0 loaded');

})();
