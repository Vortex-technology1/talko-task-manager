// ============================================================
// 78-crm-todo.js — CRM "Що робити зараз"
// Показує всіх активних лідів відсортованих за пріоритетом:
//   0. Прострочені (nextContactDate < сьогодні) — червоні
//   1. На сьогодні — помаранчеві
//   2. Нові без дати — сірі
//   3. Заплановані на майбутнє — зелені
// ============================================================
(function () {
'use strict';

const TI = {
    phone:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    tg:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    clock:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    check:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    close:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    plus:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    warn:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    arrow:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    refresh: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    sms:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
};

const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function _todayStr() {
    const d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function _tomorrowStr() {
    const d = new Date(); d.setDate(d.getDate()+1);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

// 0=прострочений, 1=сьогодні, 2=без дати, 3=майбутнє
function _priority(d) {
    const today = _todayStr();
    if (!d.nextContactDate) return 2;
    if (d.nextContactDate < today) return 0;
    if (d.nextContactDate === today) return 1;
    return 3;
}

function _getActiveDeals() {
    if (!window.crm || !window.crm.deals) return [];
    return window.crm.deals
        .filter(d => d.stage !== 'lost' && d.stage !== 'won')
        .sort((a, b) => {
            const pa = _priority(a), pb = _priority(b);
            if (pa !== pb) return pa - pb;
            if (pa === 2) { // без дати — новіші першими
                const ua = a.createdAt&&a.createdAt.toDate?a.createdAt.toDate():new Date(a.createdAt||0);
                const ub = b.createdAt&&b.createdAt.toDate?b.createdAt.toDate():new Date(b.createdAt||0);
                return ub - ua;
            }
            return (a.nextContactDate||'') < (b.nextContactDate||'') ? -1 : 1;
        });
}

function _fmtDate(dateStr) {
    if (!dateStr) return null;
    const today = _todayStr();
    if (dateStr < today) {
        const days = Math.round((new Date(today)-new Date(dateStr))/86400000);
        return { label: days===1?'Вчора':days+' дн. тому', overdue:true, today:false };
    }
    if (dateStr === today) return { label:'Сьогодні', overdue:false, today:true };
    if (dateStr === _tomorrowStr()) return { label:'Завтра', overdue:false, today:false };
    const d = new Date(dateStr);
    const locale = window.getLocale?window.getLocale():'uk-UA';
    return { label:d.toLocaleDateString(locale,{day:'numeric',month:'short'}), overdue:false, today:false };
}

// ── ГОЛОВНИЙ РЕНДЕР ────────────────────────────────────────
window.renderCrmTodo = function() {
    const el = document.getElementById('crmViewTodo');
    if (!el) return;

    // Якщо дані ще завантажуються — показуємо spinner і чекаємо
    if (window.crm && window.crm.loading) {
        el.innerHTML = `<div style="padding:3rem;text-align:center;color:#9ca3af;">
            <div style="font-size:0.85rem;">Завантаження лідів...</div></div>`;
        setTimeout(() => { if (document.getElementById('crmViewTodo')) renderCrmTodo(); }, 400);
        return;
    }

    // Якщо crm взагалі не ініціалізовано — чекаємо
    if (!window.crm || !window.crm.deals) {
        el.innerHTML = `<div style="padding:3rem;text-align:center;color:#9ca3af;">
            <div style="font-size:0.85rem;">Ініціалізація CRM...</div></div>`;
        setTimeout(() => { if (document.getElementById('crmViewTodo')) renderCrmTodo(); }, 600);
        return;
    }

    const all    = _getActiveDeals();
    const filter = window._crmTodoFilter || '';
    const deals  = filter ? all.filter(d => d.stage === filter) : all;
    const today  = _todayStr();
    // Debug
    console.log("[CrmTodo] total deals:", window.crm.deals.length, "| active:", all.length, "| pipeline:", window.crm.pipeline&&window.crm.pipeline.id);

    const overdue   = all.filter(d => d.nextContactDate && d.nextContactDate < today);
    const todayList = all.filter(d => d.nextContactDate === today);
    const noDate    = all.filter(d => !d.nextContactDate);
    const stages    = (window.crm&&window.crm.pipeline&&window.crm.pipeline.stages) || [];

    el.innerHTML = `
    <div style="padding:1rem 1.5rem;">

      <!-- Хедер -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <span style="font-size:1rem;font-weight:700;color:#111827;">Що робити зараз</span>
          <span style="background:#374151;color:#fff;border-radius:10px;padding:2px 9px;font-size:0.72rem;font-weight:700;">${all.length}</span>
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button onclick="renderCrmTodo()" style="background:none;border:1px solid #e5e7eb;border-radius:6px;padding:5px 8px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${TI.refresh}</button>
          <button onclick="crmOpenCreateDeal()" style="background:#22c55e;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:0.82rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.35rem;">${TI.plus} Новий лід</button>
        </div>
      </div>

      <!-- Лічильники -->
      <div style="display:flex;gap:0.4rem;margin-bottom:0.85rem;flex-wrap:wrap;">
        ${overdue.length?`<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:4px 12px;font-size:0.75rem;color:#dc2626;font-weight:600;display:flex;align-items:center;gap:4px;">${TI.warn} ${overdue.length} прострочено</div>`:''}
        ${todayList.length?`<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:4px 12px;font-size:0.75rem;color:#ea580c;font-weight:600;display:flex;align-items:center;gap:4px;">${TI.clock} ${todayList.length} на сьогодні</div>`:''}
        ${noDate.length?`<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:20px;padding:4px 12px;font-size:0.75rem;color:#6b7280;display:flex;align-items:center;gap:4px;">+ ${noDate.length} нових</div>`:''}
      </div>

      <!-- Фільтр по стадіях -->
      <div style="display:flex;gap:0.35rem;margin-bottom:0.75rem;overflow-x:auto;padding-bottom:2px;">
        <button onclick="window._crmTodoFilter='';renderCrmTodo()"
          style="padding:4px 12px;border-radius:20px;border:1px solid ${!filter?'#22c55e':'#e5e7eb'};
          background:${!filter?'#f0fdf4':'white'};color:${!filter?'#16a34a':'#6b7280'};
          font-size:0.75rem;font-weight:${!filter?'700':'500'};cursor:pointer;white-space:nowrap;">Всі ${all.length}</button>
        ${stages.filter(s=>s.id!=='lost'&&s.id!=='won').map(s=>{
            const cnt=all.filter(d=>d.stage===s.id).length;
            if(!cnt)return'';
            const a=filter===s.id;
            return `<button onclick="window._crmTodoFilter='${s.id}';renderCrmTodo()"
              style="padding:4px 12px;border-radius:20px;border:1px solid ${a?s.color||'#6b7280':'#e5e7eb'};
              background:${a?(s.color||'#6b7280')+'18':'white'};color:${a?s.color||'#6b7280':'#6b7280'};
              font-size:0.75rem;font-weight:${a?'700':'500'};cursor:pointer;white-space:nowrap;">
              ${_esc(s.label)} ${cnt}</button>`;
        }).join('')}
      </div>

      <!-- Список -->
      <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden;">
        ${deals.length===0
            ?`<div style="padding:3rem;text-align:center;color:#9ca3af;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">✓</div>
                <div style="font-weight:600;color:#374151;">Все зроблено!</div>
                <div style="font-size:0.82rem;margin-top:0.25rem;">Лідів немає або всі у статусі "Виграно/Програно"</div>
                <div style="margin-top:0.75rem;font-size:0.72rem;color:#d1d5db;">Всього в CRM: ${window.crm&&window.crm.deals?window.crm.deals.length:0} лідів</div>
                <button onclick="crmOpenCreateDeal()" style="margin-top:0.75rem;background:#22c55e;color:#fff;border:none;border-radius:7px;padding:8px 16px;font-size:0.82rem;font-weight:600;cursor:pointer;">+ Додати лід</button>
                <button onclick="_crmTodoAddTestDeals()" style="margin-top:0.5rem;margin-left:0.5rem;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:7px;padding:8px 16px;font-size:0.82rem;cursor:pointer;">+ Тестові ліди</button>
              </div>`
            :deals.map((d,i)=>_renderRow(d,i)).join('')
        }
      </div>
    </div>`;
};

function _renderRow(d, i) {
    const p         = _priority(d);
    const fmt       = _fmtDate(d.nextContactDate);
    const borderClr = p===0?'#ef4444':p===1?'#f97316':p===2?'#9ca3af':'#22c55e';
    const dateBg    = p===0?'#fef2f2':p===1?'#fff7ed':p===2?'#f9fafb':'#f0fdf4';
    const dateClr   = p===0?'#dc2626':p===1?'#ea580c':p===2?'#9ca3af':'#16a34a';
    const stages    = (window.crm&&window.crm.pipeline&&window.crm.pipeline.stages)||[];
    const stageObj  = stages.find(s=>s.id===d.stage);
    const stageClr  = stageObj?stageObj.color:'#6b7280';
    const stageLbl  = stageObj?stageObj.label:d.stage;
    const name      = d.clientName||d.title||'(без імені)';
    const phone     = d.phone||'';
    const note      = d.note||d.notes||'';
    const rowBg     = i%2===0?'#fff':'#fafafa';

    let daysInStage='';
    if(d.stageEnteredAt){
        const e=d.stageEnteredAt.toDate?d.stageEnteredAt.toDate():new Date(d.stageEnteredAt);
        const diff=Math.floor((new Date()-e)/86400000);
        if(diff>0)daysInStage=diff+' дн.';
    }

    return `
    <div onclick="crmTodoOpenCard('${d.id}')"
      style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 1rem;
        border-bottom:1px solid #f3f4f6;background:${rowBg};cursor:pointer;
        border-left:3px solid ${borderClr};transition:background 0.1s;"
      onmouseover="this.style.background='#f8fffe'"
      onmouseout="this.style.background='${rowBg}'">

      <!-- Дата/пріоритет -->
      <div style="min-width:70px;text-align:center;flex-shrink:0;">
        <div style="background:${dateBg};border-radius:6px;padding:3px 6px;display:inline-block;">
          <div style="font-size:0.72rem;font-weight:700;color:${dateClr};white-space:nowrap;">
            ${fmt?fmt.label:'Нова'}
          </div>
        </div>
      </div>

      <!-- Ім'я + нотатка -->
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.85rem;font-weight:600;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(name)}</div>
        ${note
            ?`<div style="font-size:0.73rem;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(note)}</div>`
            :`<div style="font-size:0.73rem;color:#d1d5db;font-style:italic;">без нотатки</div>`
        }
      </div>

      <!-- Телефон -->
      ${phone?`
        <a href="tel:${_esc(phone)}" onclick="event.stopPropagation()"
          style="display:flex;align-items:center;gap:3px;color:#374151;font-size:0.75rem;
          text-decoration:none;background:#f3f4f6;border-radius:5px;padding:3px 7px;
          white-space:nowrap;flex-shrink:0;">
          ${TI.phone} ${_esc(phone.replace(/(\+38|38)/,''))}</a>`:''}

      <!-- Стадія -->
      <div style="font-size:0.7rem;font-weight:600;color:${stageClr};
        background:${stageClr}18;border-radius:4px;padding:3px 8px;
        white-space:nowrap;flex-shrink:0;border:1px solid ${stageClr}33;">
        ${_esc(stageLbl)}
      </div>

      ${daysInStage?`<div style="font-size:0.68rem;color:#9ca3af;flex-shrink:0;white-space:nowrap;">${daysInStage}</div>`:''}

      <div style="color:#d1d5db;flex-shrink:0;">${TI.arrow}</div>
    </div>`;
}

// ── Картка ліда ───────────────────────────────────────────
window.crmTodoOpenCard = async function(dealId) {
    const deal = window.crm&&window.crm.deals?window.crm.deals.find(d=>d.id===dealId):null;
    if (!deal) return;

    let history = [];
    try {
        const snap = await window.companyRef().collection(window.DB_COLS.CRM_DEALS)
            .doc(dealId).collection('history').orderBy('at','desc').limit(8).get();
        history = snap.docs.map(d=>({id:d.id,...d.data()}));
    } catch(e) {}

    const stages   = (window.crm&&window.crm.pipeline&&window.crm.pipeline.stages)||[];
    const stageObj = stages.find(s=>s.id===deal.stage);
    const stageClr = stageObj?stageObj.color:'#6b7280';
    const fmt      = _fmtDate(deal.nextContactDate);
    const inp      = 'width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
    const lbl      = 'font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.3rem;letter-spacing:.04em;';

    document.getElementById('crmTodoCardOverlay')&&document.getElementById('crmTodoCardOverlay').remove();

    document.body.insertAdjacentHTML('beforeend',`
    <div id="crmTodoCardOverlay" onclick="if(event.target===this)_crmTodoCloseCard()"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:10050;
      display:flex;align-items:flex-start;justify-content:center;padding:1.5rem 1rem;overflow-y:auto;">
      <div style="background:#fff;border-radius:12px;width:100%;max-width:540px;box-shadow:0 24px 64px rgba(0,0,0,0.18);margin:auto;">

        <!-- Хедер картки -->
        <div style="padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-size:1rem;font-weight:700;color:#111827;margin-bottom:0.25rem;">
                ${_esc(deal.clientName||deal.title||'(без імені)')}</div>
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <span style="font-size:0.72rem;font-weight:600;color:${stageClr};background:${stageClr}18;border-radius:4px;padding:2px 8px;border:1px solid ${stageClr}33;">
                  ${_esc(stageObj?stageObj.label:deal.stage)}</span>
                ${deal.clientNiche?`<span style="font-size:0.72rem;color:#9ca3af;">${_esc(deal.clientNiche)}</span>`:''}
                ${deal.amount?`<span style="font-size:0.72rem;font-weight:600;color:#16a34a;">${Number(deal.amount).toLocaleString()} ₴</span>`:''}
              </div>
            </div>
            <button onclick="_crmTodoCloseCard()" style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:4px;">${TI.close}</button>
          </div>

          <!-- Контакти -->
          <div style="display:flex;gap:0.4rem;margin-top:0.65rem;flex-wrap:wrap;align-items:center;">
            ${deal.phone?`
              <a href="tel:${_esc(deal.phone)}" style="display:flex;align-items:center;gap:4px;background:#f3f4f6;border-radius:6px;padding:4px 10px;font-size:0.78rem;color:#374151;text-decoration:none;font-weight:500;">${TI.phone} ${_esc(deal.phone)}</a>
              <a href="https://wa.me/${deal.phone.replace(/\D/g,'')}" target="_blank" style="background:#f0fdf4;border-radius:6px;padding:4px 8px;font-size:0.72rem;color:#16a34a;text-decoration:none;">WA</a>
              <a href="viber://chat?number=${deal.phone.replace(/\D/g,'')}" target="_blank" style="background:#faf5ff;border-radius:6px;padding:4px 8px;font-size:0.72rem;color:#7c3aed;text-decoration:none;">Viber</a>
            `:''}
            ${deal.telegram?`<a href="https://t.me/${deal.telegram.replace('@','')}" target="_blank" style="display:flex;align-items:center;gap:4px;background:#f0f9ff;border-radius:6px;padding:4px 10px;font-size:0.78rem;color:#0ea5e9;text-decoration:none;font-weight:500;">${TI.tg} ${_esc(deal.telegram)}</a>`:''}
          </div>

          <!-- Поточна дата -->
          ${fmt?`<div style="margin-top:0.5rem;background:${fmt.overdue?'#fef2f2':fmt.today?'#fff7ed':'#f0fdf4'};
            border:1px solid ${fmt.overdue?'#fecaca':fmt.today?'#fed7aa':'#bbf7d0'};border-radius:7px;
            padding:0.4rem 0.75rem;font-size:0.78rem;color:${fmt.overdue?'#dc2626':fmt.today?'#ea580c':'#16a34a'};
            display:flex;align-items:center;gap:0.4rem;">
            ${TI.clock}
            ${fmt.overdue?'Прострочено:':fmt.today?'Сьогодні:':'Заплановано:'}
            <strong style="margin-left:2px;">${deal.nextContactDate}</strong>
            ${fmt.overdue?`<span style="margin-left:auto;">${fmt.label}</span>`:''}
          </div>`:''}

          <!-- Нотатка -->
          ${(deal.note||deal.notes)?`<div style="margin-top:0.5rem;background:#f9fafb;border-radius:6px;padding:0.4rem 0.75rem;font-size:0.78rem;color:#374151;">${_esc(deal.note||deal.notes)}</div>`:''}
        </div>

        <!-- Результат контакту -->
        <div style="padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;">
          <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em;margin-bottom:0.5rem;">Результат контакту</div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
            <button onclick="_crmTodoSelectResult('answered','${dealId}')" id="crmTodoBtn_answered"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;border:1.5px solid #22c55e;background:#f0fdf4;color:#16a34a;font-size:0.8rem;font-weight:600;cursor:pointer;">
              ${TI.check} Взяв трубку</button>
            <button onclick="_crmTodoSelectResult('missed','${dealId}')" id="crmTodoBtn_missed"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;border:1.5px solid #e5e7eb;background:#fff;color:#ef4444;font-size:0.8rem;font-weight:600;cursor:pointer;">
              ${TI.phone} Не взяв</button>
            <button onclick="_crmTodoSelectResult('sms','${dealId}')" id="crmTodoBtn_sms"
              style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:0.8rem;font-weight:500;cursor:pointer;">
              ${TI.sms} Повідомлення</button>
          </div>
        </div>

        <!-- Деталі -->
        <div id="crmTodoDetailForm" style="display:none;padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;"></div>

        <!-- Наступний контакт -->
        <div style="padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;background:#f9fafb;">
          <div style="font-size:0.7rem;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.04em;margin-bottom:0.5rem;">
            Наступний контакт <span style="color:#ef4444;">*</span>
            <span id="crmTodoNextError" style="display:none;color:#ef4444;font-size:0.68rem;font-weight:500;text-transform:none;margin-left:4px;">— вкажіть дату!</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="${lbl}">Дата <span style="color:#ef4444;">*</span></label>
              <input id="crmTodoNextDate" type="date" style="${inp}" oninput="_crmTodoValidate()"
                value="${deal.nextContactDate||_tomorrowStr()}">
            </div>
            <div>
              <label style="${lbl}">Коментар</label>
              <input id="crmTodoNextNote" placeholder="що зробити..." style="${inp}" value="${_esc(deal.note||'')}">
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div style="padding:0.75rem 1.25rem;display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <button onclick="if(window.crmOpenDealDetail)crmOpenDealDetail('${dealId}');else _crmTodoCloseCard()"
            style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:0.8rem;font-weight:500;cursor:pointer;">
            Відкрити угоду ${TI.arrow}</button>
          <div style="display:flex;gap:0.4rem;">
            <button onclick="_crmTodoCloseCard()" style="padding:7px 14px;border-radius:7px;border:1px solid #e5e7eb;background:#fff;color:#374151;font-size:0.82rem;cursor:pointer;">Скасувати</button>
            <button id="crmTodoSaveBtn" onclick="_crmTodoSave('${dealId}')" disabled
              style="padding:7px 18px;border-radius:7px;border:none;background:#d1d5db;color:#9ca3af;font-size:0.82rem;font-weight:600;cursor:not-allowed;">Зберегти</button>
          </div>
        </div>

        <!-- Історія -->
        ${history.length?`
        <div style="padding:0.75rem 1.25rem;border-top:1px solid #f1f5f9;">
          <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em;margin-bottom:0.5rem;">Останні дії</div>
          ${history.slice(0,5).map(h=>{
              const locale=window.getLocale?window.getLocale():'uk-UA';
              const dt=h.at?(h.at.toDate?h.at.toDate():new Date(h.at)):null;
              const dtStr=dt?dt.toLocaleDateString(locale,{day:'numeric',month:'short'})+' '+dt.toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'}):'—';
              return `<div style="display:flex;gap:0.5rem;align-items:flex-start;padding:0.3rem 0;border-bottom:1px solid #f9fafb;">
                <div style="font-size:0.68rem;color:#9ca3af;white-space:nowrap;min-width:80px;">${dtStr}</div>
                <div style="font-size:0.75rem;color:#374151;">${_esc(h.text||h.type||'')}</div>
              </div>`;
          }).join('')}
        </div>`:'' }

      </div>
    </div>`);

    document.getElementById('crmTodoCardOverlay')._dealId = dealId;
    document.getElementById('crmTodoCardOverlay')._result = null;
    _crmTodoValidate();
};

window._crmTodoSelectResult = function(type, dealId) {
    const overlay = document.getElementById('crmTodoCardOverlay');
    if (overlay) overlay._result = type;

    ['answered','missed','sms'].forEach(t => {
        const btn = document.getElementById('crmTodoBtn_'+t);
        if (!btn) return;
        btn.style.borderColor = t===type?'#22c55e':'#e5e7eb';
        btn.style.background  = t===type?'#f0fdf4':'#fff';
        btn.style.color = t===type?'#16a34a':t==='missed'?'#ef4444':'#374151';
    });

    const form  = document.getElementById('crmTodoDetailForm');
    const deal  = window.crm&&window.crm.deals?window.crm.deals.find(d=>d.id===dealId):null;
    const stages= (window.crm&&window.crm.pipeline&&window.crm.pipeline.stages)||[];
    const inp   = 'width:100%;padding:0.45rem 0.6rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
    const lbl   = 'font-size:0.68rem;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.3rem;letter-spacing:.04em;';

    if (!form) return;
    form.style.display = 'block';

    if (type === 'answered') {
        form.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <div>
              <label style="${lbl}">Новий статус</label>
              <select id="crmTodoNewStage" style="${inp}background:white;cursor:pointer;">
                ${stages.filter(s=>s.id!=='lost').map(s=>`<option value="${s.id}" ${deal&&deal.stage===s.id?'selected':''}>${_esc(s.label)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="${lbl}">Що домовились</label>
              <textarea id="crmTodoAgreed" rows="2" placeholder="Коротко що обговорили..." style="${inp}resize:none;"></textarea>
            </div>
          </div>`;
    } else if (type === 'missed') {
        const el = document.getElementById('crmTodoNextDate');
        if (el && !el.value) el.value = _tomorrowStr();
        form.innerHTML = `<div style="background:#fef2f2;border-radius:6px;padding:0.5rem 0.75rem;font-size:0.78rem;color:#dc2626;display:flex;align-items:center;gap:0.4rem;">
            Не взяв. Контакт перенесений на завтра. Змініть дату вище якщо потрібно.</div>`;
    } else if (type === 'sms') {
        form.innerHTML = `<div><label style="${lbl}">Текст повідомлення</label>
            <textarea id="crmTodoSmsText" rows="2" placeholder="Текст..." style="${inp}resize:none;"></textarea></div>`;
    }
    _crmTodoValidate();
};

window._crmTodoValidate = function() {
    const btn   = document.getElementById('crmTodoSaveBtn');
    const date  = (document.getElementById('crmTodoNextDate')&&document.getElementById('crmTodoNextDate').value||'').trim();
    const errEl = document.getElementById('crmTodoNextError');
    const valid = date.length > 0;
    if (errEl) errEl.style.display = valid?'none':'inline';
    if (btn) {
        btn.disabled = !valid;
        btn.style.background = valid?'#22c55e':'#d1d5db';
        btn.style.color      = valid?'#fff':'#9ca3af';
        btn.style.cursor     = valid?'pointer':'not-allowed';
    }
};

window._crmTodoSave = async function(dealId) {
    const nextDate = (document.getElementById('crmTodoNextDate')&&document.getElementById('crmTodoNextDate').value||'').trim();
    const nextNote = (document.getElementById('crmTodoNextNote')&&document.getElementById('crmTodoNextNote').value||'').trim();
    const overlay  = document.getElementById('crmTodoCardOverlay');
    const result   = overlay&&overlay._result;

    if (!nextDate) { _crmTodoValidate(); return; }

    const btn = document.getElementById('crmTodoSaveBtn');
    if (btn) { btn.disabled=true; btn.textContent='Збереження...'; }

    try {
        const ref = window.companyRef().collection(window.DB_COLS.CRM_DEALS).doc(dealId);
        const updates = {
            nextContactDate: nextDate,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        if (nextNote) updates.note = nextNote;

        const hist = { at:firebase.firestore.FieldValue.serverTimestamp(), by:window.currentUser&&window.currentUser.email||'manager' };

        if (result === 'answered') {
            const newStage = document.getElementById('crmTodoNewStage')&&document.getElementById('crmTodoNewStage').value;
            const agreed   = (document.getElementById('crmTodoAgreed')&&document.getElementById('crmTodoAgreed').value||'').trim();
            if (newStage) { updates.stage=newStage; updates.stageEnteredAt=firebase.firestore.FieldValue.serverTimestamp(); }
            hist.type='call_answered'; hist.text=agreed||'Взяв трубку. Наступний контакт: '+nextDate;
        } else if (result === 'missed') {
            hist.type='call_missed'; hist.text='Не взяв трубку. Перенесено на: '+nextDate;
        } else if (result === 'sms') {
            const txt=(document.getElementById('crmTodoSmsText')&&document.getElementById('crmTodoSmsText').value||'').trim();
            hist.type='sms_sent'; hist.text=txt?'Повідомлення: '+txt:'Надіслано повідомлення';
        } else {
            hist.type='contact_updated'; hist.text='Контакт заплановано на: '+nextDate;
        }

        await ref.update(updates);
        await ref.collection('history').add(hist);

        _crmTodoCloseCard();
        if (window.showToast) showToast('Збережено','success');
        setTimeout(()=>{ if(typeof renderCrmTodo==='function')renderCrmTodo(); },300);

    } catch(e) {
        if(btn){btn.disabled=false;btn.textContent='Зберегти';}
        if(window.showToast)showToast('Помилка: '+e.message,'error');
    }
};

window._crmTodoCloseCard = function() {
    const el = document.getElementById('crmTodoCardOverlay');
    if (el) el.remove();
};

document.addEventListener('keydown', function(e) {
    if (e.key==='Escape' && document.getElementById('crmTodoCardOverlay')) {
        e.stopPropagation();
        _crmTodoCloseCard();
    }
});

// Для "Мій день" — тільки прострочені + сьогодні
window._getCrmTodoForMyDay = function() {
    const today = _todayStr();
    return _getActiveDeals()
        .filter(d => d.nextContactDate && d.nextContactDate <= today)
        .map(d => {
            const fmt = _fmtDate(d.nextContactDate);
            return {
                id:'crm_'+d.id, dealId:d.id, type:'crm_action',
                title:d.note||d.notes||'(без нотатки)',
                client:d.clientName||d.title||'',
                phone:d.phone||'', telegram:d.telegram||'',
                date:d.nextContactDate||null, overdue:fmt&&fmt.overdue||false,
                stage:d.stage, onClick:()=>crmTodoOpenCard(d.id),
            };
        });
};

})();

// ── Додати тестові ліди (для демо) ───────────────────────
window._crmTodoAddTestDeals = async function() {
    if (!window.companyRef || !window.DB_COLS || !window.crm || !window.crm.pipeline) {
        alert('CRM не ініціалізовано');
        return;
    }
    const pipelineId = window.crm.pipeline.id;
    const today = _todayStr();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yStr = yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0');
    const tomorrow = _tomorrowStr();

    const testDeals = [
        { clientName:'Іванченко Марія', phone:'+380671234567', stage:'new',         note:'Цікавиться імплантацією',  nextContactDate: yStr,     source:'instagram' },
        { clientName:'Петров Олексій',  phone:'+380502345678', stage:'contact',      note:'Просив передзвонити',      nextContactDate: today,    source:'telegram' },
        { clientName:'Коваль Світлана', phone:'+380931234567', stage:'negotiation',  note:'Обговорити ціну на брекети', nextContactDate: tomorrow, source:'site_form' },
        { clientName:'Мороз Дмитро',    phone:'+380661234567', stage:'new',         note:'',                         nextContactDate: null,     source:'manual' },
        { clientName:'Бойко Наталія',   phone:'+380731234567', stage:'proposal',     note:'Відправити КП по протезуванню', nextContactDate: tomorrow, source:'referral' },
    ];

    const base = window.companyRef().collection(window.DB_COLS.CRM_DEALS);
    let count = 0;
    for (const d of testDeals) {
        try {
            await base.add({
                ...d,
                pipelineId,
                title: d.clientName,
                amount: 0,
                email: '',
                telegram: '',
                clientNiche: 'Стоматологія',
                assigneeId: window.currentUser&&window.currentUser.uid||null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                stageEnteredAt: firebase.firestore.FieldValue.serverTimestamp(),
                tags: [],
            });
            count++;
        } catch(e) { console.error('seed error', e); }
    }
    if (window.showToast) showToast(`Додано ${count} тестових лідів`, 'success');
};
