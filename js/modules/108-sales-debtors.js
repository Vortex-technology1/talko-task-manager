/**
 * 108-sales-debtors.js — Дебіторська заборгованість
 * TALKO SaaS — Фаза 2
 * Колекція: companies/{cid}/sales_debtors
 */
(function () {
  'use strict';

  function tg(ua, en) { const l=window.currentLang||window.currentUserData?.language||'ua'; return l==='en'?en:ua; }
  function db()  { return window.db||(window.firebase&&firebase.firestore()); }
  function cid() { return window.currentCompanyId||null; }
  function col(name) { if(!db()||!cid()) throw new Error('DB/cid not ready'); return db().collection('companies').doc(cid()).collection(name); }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n) { return Number(n||0).toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function el(id) { return document.getElementById(id); }
  function toast(msg,type) { if(typeof window.showToast==='function') window.showToast(msg,type||'success'); }
  function serverTs() { return firebase.firestore.FieldValue.serverTimestamp(); }
  function canManage() { const r=window.currentUserData?.role; return r==='owner'||r==='manager'||r==='admin'; }

  const S={debtors:[],filter:'open',savingId:null};

  async function loadDebtors(){
    if(!cid()) return;
    try{
      const snap=await col('sales_debtors').orderBy('createdAt','desc').limit(500).get();
      S.debtors=snap.docs.map(d=>({id:d.id,...d.data()}));
      const today=todayISO();

      // БАГ 27 fix: синхронізуємо overdue в Firestore (batch, не більше 10 за раз щоб не блокувати UI)
      const toUpdate = S.debtors.filter(d =>
        (d.status==='open'||d.status==='partial') && d.dueDate && d.dueDate < today
      );
      // Локально оновлюємо одразу
      toUpdate.forEach(d => { d.status = 'overdue'; });
      // Асинхронно пишемо в Firestore (не чекаємо — щоб не затримувати UI)
      if (toUpdate.length) {
        const batch = db().batch();
        toUpdate.slice(0, 20).forEach(d => {
          batch.update(db().collection('companies').doc(cid()).collection('sales_debtors').doc(d.id), {
            status: 'overdue', updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
        batch.commit().catch(e => console.warn('108 overdue sync:', e.message));
      }

      renderList(); renderSummary();
    }catch(e){console.warn('108:',e.message);}
  }

  function renderSummary(){
    const wrap=el('sdSummaryWrap'); if(!wrap) return;
    const open=S.debtors.filter(d=>d.status==='open'||d.status==='partial');
    const overdue=S.debtors.filter(d=>d.status==='overdue');
    const paid=S.debtors.filter(d=>d.status==='paid');
    const tOpen=open.reduce((s,d)=>s+Number(d.amount||0)-Number(d.paidAmount||0),0);
    const tOver=overdue.reduce((s,d)=>s+Number(d.amount||0)-Number(d.paidAmount||0),0);
    const tPaid=paid.reduce((s,d)=>s+Number(d.paidAmount||d.amount||0),0);
    const today=todayISO();
    let avg=0;
    if(overdue.length) avg=Math.round(overdue.reduce((s,d)=>s+(d.dueDate?Math.floor((new Date(today)-new Date(d.dueDate))/86400000):0),0)/overdue.length);
    wrap.innerHTML=`
      <div class="sd-card" onclick="window._sdSetFilter('open')" style="cursor:pointer"><div class="sd-card-lbl">${tg('Відкрита','Open receivables')}</div><div class="sd-card-val" style="color:#2563eb">${fmt(tOpen)}</div><div class="sd-card-sub">${open.length} ${tg('рах.','inv.')}</div></div>
      <div class="sd-card" onclick="window._sdSetFilter('overdue')" style="cursor:pointer"><div class="sd-card-lbl">${tg('Прострочена','Overdue')}</div><div class="sd-card-val" style="color:#dc2626">${fmt(tOver)}</div><div class="sd-card-sub">${overdue.length} ${tg('рах.','inv.')}${avg?` · ${tg('сер.','avg.')} ${avg} ${tg('дн.','d.')}`:''}</div></div>
      <div class="sd-card" onclick="window._sdSetFilter('paid')" style="cursor:pointer"><div class="sd-card-lbl">${tg('Оплачено','Paid')}</div><div class="sd-card-val" style="color:#059669">${fmt(tPaid)}</div><div class="sd-card-sub">${paid.length} ${tg('закр.','closed')}</div></div>
      <div class="sd-card"><div class="sd-card-lbl">${tg('Клієнтів з боргом','Clients with debt')}</div><div class="sd-card-val">${new Set(open.concat(overdue).map(d=>d.clientId)).size}</div><div class="sd-card-sub">&nbsp;</div></div>`;
  }

  function renderList(){
    const wrap=el('sdListWrap'); if(!wrap) return;
    let items=S.debtors;
    if(S.filter==='open')    items=items.filter(d=>d.status==='open'||d.status==='partial');
    if(S.filter==='overdue') items=items.filter(d=>d.status==='overdue');
    if(S.filter==='paid')    items=items.filter(d=>d.status==='paid');
    if(!items.length){wrap.innerHTML=`<div style="text-align:center;padding:2.5rem;color:#9ca3af;font-size:.9rem">${S.filter==='overdue'?'✅ '+tg('Прострочених немає','No overdue'):tg('Немає записів','No records')}</div>`;return;}
    const today=todayISO();
    const sm={open:{label:tg('Відкрита','Open'),color:'#2563eb',bg:'#dbeafe'},partial:{label:tg('Часткова','Partial'),color:'#d97706',bg:'#fef3c7'},paid:{label:tg('Оплачено','Paid'),color:'#059669',bg:'#d1fae5'},overdue:{label:tg('Прострочена','Overdue'),color:'#dc2626',bg:'#fee2e2'}};
    wrap.innerHTML=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.84rem">
      <thead><tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb">
        <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Клієнт','Client')}</th>
        <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6b7280">${tg('Реалізація','Realization')}</th>
        <th style="padding:10px 12px;text-align:right;font-weight:600;color:#6b7280">${tg('Сума','Amount')}</th>
        <th style="padding:10px 12px;text-align:right;font-weight:600;color:#6b7280">${tg('Оплачено','Paid')}</th>
        <th style="padding:10px 12px;text-align:right;font-weight:600;color:#6b7280">${tg('Залишок','Balance')}</th>
        <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Дата оплати','Due date')}</th>
        <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Статус','Status')}</th>
        <th style="padding:10px 12px;text-align:center;font-weight:600;color:#6b7280">${tg('Дії','Actions')}</th>
      </tr></thead>
      <tbody>${items.map((d,i)=>{
        const bal=Math.max(0,Number(d.amount||0)-Number(d.paidAmount||0));
        const isOver=d.status==='overdue'||(d.dueDate&&d.dueDate<today&&d.status!=='paid');
        const od=isOver&&d.dueDate?Math.floor((new Date(today)-new Date(d.dueDate))/86400000):0;
        const cur=d.currency||'UAH';
        const sc=sm[isOver&&d.status!=='paid'?'overdue':d.status]||sm.open;
        const rb=isOver?'#fff5f5':(i%2?'#fafbfc':'');
        return `<tr style="border-bottom:1px solid #f1f5f9;background:${rb}" onmouseover="this.style.background='${isOver?'#fee2e2':'#f0f9ff'}'" onmouseout="this.style.background='${rb}'">
          <td style="padding:10px 12px;font-weight:500">${esc(d.clientName||'—')}</td>
          <td style="padding:10px 12px;font-size:.8rem;color:#6366f1">${esc(d.realizationNum||d.realizationId||'—')}</td>
          <td style="padding:10px 12px;text-align:right;font-weight:600;white-space:nowrap">${fmt(d.amount)} <span style="font-size:.72rem;color:#9ca3af">${esc(cur)}</span></td>
          <td style="padding:10px 12px;text-align:right;color:#059669;white-space:nowrap">${fmt(d.paidAmount||0)}</td>
          <td style="padding:10px 12px;text-align:right;font-weight:700;white-space:nowrap;${bal>0?'color:#dc2626':'color:#059669'}">${fmt(bal)}</td>
          <td style="padding:10px 12px;text-align:center;font-size:.8rem;${isOver?'color:#dc2626;font-weight:600':''}">${esc(d.dueDate||'—')}${isOver&&od>0?`<div style="font-size:.7rem;color:#dc2626">+${od} ${tg('дн.','d.')}</div>`:''}</td>
          <td style="padding:10px 12px;text-align:center"><span style="padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;background:${sc.bg};color:${sc.color}">${sc.label}</span></td>
          <td style="padding:10px 12px;text-align:center">${d.status!=='paid'&&canManage()?`<button onclick="window.openRegisterPaymentModal('${d.id}')" style="padding:5px 10px;background:#d1fae5;color:#059669;border:none;border-radius:5px;cursor:pointer;font-size:.75rem;font-weight:600">${tg('Оплата','Payment')}</button>`:''}</td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
  }

  function renderFilters(){
    const wrap=el('sdFiltersWrap'); if(!wrap) return;
    const fs=[{key:'all',label:tg('Всі','All')},{key:'open',label:tg('Відкриті','Open')},{key:'overdue',label:tg('Прострочені','Overdue')},{key:'paid',label:tg('Оплачені','Paid')}];
    wrap.innerHTML=fs.map(f=>`<button onclick="window._sdSetFilter('${f.key}')" class="sd-fb ${S.filter===f.key?'active':''}" data-f="${f.key}">${f.label}</button>`).join('');
  }

  function buildUI(){
    const wrap=el('sdRootWrap'); if(!wrap) return;
    wrap.innerHTML=`
      <style>
        .sd-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px 18px;min-width:150px;flex:1;transition:box-shadow .15s}
        .sd-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .sd-card-lbl{font-size:.71rem;color:#9ca3af;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
        .sd-card-val{font-size:1.25rem;font-weight:700;color:#111;margin-bottom:2px}
        .sd-card-sub{font-size:.75rem;color:#9ca3af}
        .sd-fb{padding:6px 14px;border-radius:6px;border:1px solid #e5e7eb;cursor:pointer;font-size:.8rem;font-weight:600;background:#fff;color:#6b7280;transition:all .15s}
        .sd-fb:hover{background:#f3f4f6}
        .sd-fb.active{background:#111;color:#fff;border-color:#111}
      </style>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding:1rem 1rem 0">
        <h3 style="margin:0;font-size:1rem;font-weight:700">${tg('Дебіторська заборгованість','Accounts Receivable')}</h3>
        <button onclick="window.initSalesDebtors()" style="padding:6px 14px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;background:#fff;font-size:.8rem;color:#6b7280">↻ ${tg('Оновити','Refresh')}</button>
      </div>
      <div id="sdSummaryWrap" style="display:flex;gap:.75rem;flex-wrap:wrap;padding:.75rem 1rem"></div>
      <div id="sdFiltersWrap" style="display:flex;gap:.4rem;flex-wrap:wrap;padding:0 1rem .75rem"></div>
      <div id="sdListWrap" style="padding:0 1rem 1rem"></div>`;
    renderFilters(); renderSummary(); renderList();
  }

  window._sdSetFilter=function(filter){
    S.filter=filter;
    document.querySelectorAll('.sd-fb').forEach(b=>b.classList.toggle('active',b.dataset.f===filter));
    renderList();
  };

  window.openRegisterPaymentModal=function(debtorId){
    const d=S.debtors.find(x=>x.id===debtorId); if(!d) return;
    const bal=Math.max(0,Number(d.amount||0)-Number(d.paidAmount||0));
    el('sdPayModalOverlay')?.remove();
    const div=document.createElement('div');
    div.innerHTML=`<div id="sdPayModalOverlay" onclick="if(event.target===this)this.remove()" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9100;display:flex;align-items:center;justify-content:center;padding:20px">
      <div style="background:#fff;border-radius:14px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,.2);padding:24px" onclick="event.stopPropagation()">
        <div style="font-size:1rem;font-weight:700;margin-bottom:4px">${tg('Реєстрація оплати','Register payment')}</div>
        <div style="font-size:.82rem;color:#6b7280;margin-bottom:18px">${esc(d.clientName)} · ${esc(d.realizationNum||d.realizationId||'')}</div>
        <div style="background:#f8fafc;border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:.84rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#6b7280">${tg('Загальна сума:','Total:')}</span><span style="font-weight:600">${fmt(d.amount)} ${d.currency||'UAH'}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#6b7280">${tg('Оплачено:','Paid:')}</span><span style="color:#059669;font-weight:600">${fmt(d.paidAmount||0)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#6b7280">${tg('Залишок:','Balance:')}</span><span style="color:#dc2626;font-weight:700">${fmt(bal)} ${d.currency||'UAH'}</span></div>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:5px">${tg('Сума *','Amount *')}</label>
          <input id="sdPayAmount" type="number" min="0.01" step="0.01" value="${bal.toFixed(2)}" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:9px 12px;font-size:.95rem;font-weight:600;outline:none;box-sizing:border-box">
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:5px">${tg('Дата','Date')}</label>
          <input id="sdPayDate" type="date" value="${todayISO()}" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:.84rem;outline:none;box-sizing:border-box">
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:.75rem;font-weight:600;color:#374151;margin-bottom:5px">${tg('Коментар','Note')}</label>
          <input id="sdPayNote" type="text" placeholder="${tg('Необов\'язково','Optional')}" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:.84rem;outline:none;box-sizing:border-box">
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px">
          <button onclick="document.getElementById('sdPayModalOverlay').remove()" style="padding:9px 20px;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;background:#fff;font-size:.85rem;font-weight:600;color:#374151">${tg('Скасувати','Cancel')}</button>
          <button onclick="window._sdSavePayment('${debtorId}')" id="sdPaySaveBtn" style="padding:9px 24px;background:#059669;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:.85rem;font-weight:700">${tg('Зберегти','Save')}</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(div.firstElementChild);
    el('sdPayAmount')?.focus();
  };

  window._sdSavePayment=async function(debtorId){
    if(S.savingId===debtorId) return;
    const d=S.debtors.find(x=>x.id===debtorId); if(!d) return;
    const amount=parseFloat(el('sdPayAmount')?.value)||0;
    const payDate=el('sdPayDate')?.value||todayISO();
    if(amount<=0){toast(tg('Введіть суму','Enter amount'),'error');return;}
    const maxBal=Math.max(0,Number(d.amount||0)-Number(d.paidAmount||0));
    if(amount>maxBal+0.01){toast(tg('Сума більша за залишок','Amount exceeds balance'),'error');return;}
    S.savingId=debtorId;
    const modal=document.getElementById('sdPayModalOverlay');
    const btn=modal?.querySelector('#sdPaySaveBtn')||el('sdPaySaveBtn');
    if(btn){btn.disabled=true;btn.textContent=tg('Збереження...','Saving...');}
    try{
      const newPaid=Number(d.paidAmount||0)+amount, isPaid=newPaid>=Number(d.amount||0)-0.01;
      await col('sales_debtors').doc(debtorId).update({paidAmount:newPaid,status:isPaid?'paid':'partial',paidAt:isPaid?serverTs():null,updatedAt:serverTs()});
      try{
        await db().collection('companies').doc(cid()).collection('finance_transactions').add({
          type:'income',amount,currency:d.currency||'UAH',amountBase:amount,
          description:`${tg('Оплата','Payment')} ${d.realizationNum||''} · ${d.clientName}`,
          counterparty:d.clientName||'',date:firebase.firestore.Timestamp.fromDate(new Date(payDate)),
          realizationId:d.realizationId||null,createdBy:window.currentUserData?.id||'',createdAt:serverTs(),
        });
      }catch(fe){console.warn('108 fin:',fe.message);}
      toast(isPaid?tg('Борг повністю закрито 🎉','Debt fully paid 🎉'):tg('Оплату зареєстровано','Payment registered'));
      el('sdPayModalOverlay')?.remove();
      if(isPaid&&typeof window.TALKO?.events?.emit==='function') window.TALKO.events.emit('DEBTOR_PAID',{debtorId,clientId:d.clientId,amount});
      await loadDebtors();
    }catch(e){console.error('_sdSavePayment:',e);toast(tg('Помилка: ','Error: ')+e.message,'error');}
    finally{S.savingId=null;if(btn){btn.disabled=false;btn.textContent=tg('Зберегти','Save');}}
  };

  window.initSalesDebtors=async function(){
    if(!cid()){console.warn('108: no cid');return;}
    buildUI();
    await loadDebtors();
  };

})();
