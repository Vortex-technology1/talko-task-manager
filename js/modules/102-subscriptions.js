// ============================================================
// 102-subscriptions.js — Абонементи та Сертифікати
// Beauty модуль для TALKO
// ============================================================
'use strict';

// ── Gift certificate code generator ───────────────────────
function _genCertCode() {
    const prefix = 'GLOW';
    const year   = new Date().getFullYear();
    const rand   = Math.random().toString(36).toUpperCase().slice(2,6);
    return `${prefix}-${year}-${rand}`;
}

// ════════════════════════════════════════════════════════════
// АБОНЕМЕНТИ
// ════════════════════════════════════════════════════════════

window.createSubscription = async function(data) {
    if (!window.companyCol) return null;
    try {
        const ref = window.companyCol('subscriptions').doc();
        const now = firebase.firestore.FieldValue.serverTimestamp();
        const expiresAt = firebase.firestore.Timestamp.fromDate(
            new Date(Date.now() + 180 * 86400000) // 6 місяців
        );
        await ref.set({
            clientId:           data.clientId || '',
            clientName:         data.clientName || '',
            clientPhone:        data.clientPhone || '',
            serviceId:          data.serviceId || '',
            serviceName:        data.serviceName || '',
            totalSessions:      data.totalSessions || 10,
            usedSessions:       0,
            remainingSessions:  data.totalSessions || 10,
            pricePerSession:    data.pricePerSession || 0,
            totalPaid:          (data.totalSessions || 10) * (data.pricePerSession || 0),
            expiresAt,
            status:             'active',
            isDemo:             false,
            createdAt:          now,
            updatedAt:          now,
        });
        return ref.id;
    } catch(e) { console.error('createSubscription:', e); return null; }
};

window.useSubscriptionSession = async function(subscriptionId, appointmentId) {
    if (!window.companyDoc) return false;
    try {
        const snap = await window.companyDoc('subscriptions', subscriptionId).get();
        if (!snap.exists) return false;
        const sub = snap.data();
        if (sub.status !== 'active' || sub.remainingSessions <= 0) return false;
        const newUsed = (sub.usedSessions||0) + 1;
        const newRemaining = sub.remainingSessions - 1;
        await window.companyDoc('subscriptions', subscriptionId).update({
            usedSessions:      newUsed,
            remainingSessions: newRemaining,
            status:            newRemaining <= 0 ? 'used' : 'active',
            lastUsedAt:        firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:         firebase.firestore.FieldValue.serverTimestamp(),
        });
        return true;
    } catch(e) { return false; }
};

window.getClientSubscriptions = async function(clientId) {
    if (!window.companyCol) return [];
    try {
        const snap = await window.companyCol('subscriptions')
            .where('clientId','==',clientId)
            .where('status','==','active')
            .get();
        return snap.docs.map(d => ({ id:d.id, ...d.data() }));
    } catch(e) { return []; }
};

// ════════════════════════════════════════════════════════════
// СЕРТИФІКАТИ
// ════════════════════════════════════════════════════════════

window.createGiftCertificate = async function(data) {
    if (!window.companyCol) return null;
    try {
        const ref  = window.companyCol('gift_certificates').doc();
        const code = _genCertCode();
        const now  = firebase.firestore.FieldValue.serverTimestamp();
        const expiresAt = firebase.firestore.Timestamp.fromDate(
            new Date(Date.now() + 365 * 86400000) // 1 рік
        );
        await ref.set({
            code,
            amount:       data.amount || 0,
            balance:      data.amount || 0,
            purchasedBy:  data.purchasedBy || '',
            purchasedFor: data.purchasedFor || '',
            expiresAt,
            status:       'active',
            transactions: [],
            isDemo:       false,
            createdAt:    now,
            updatedAt:    now,
        });
        return { id: ref.id, code };
    } catch(e) { console.error('createGiftCertificate:', e); return null; }
};

window.useCertificate = async function(certCode, amount, serviceName) {
    if (!window.companyCol) return false;
    try {
        const snap = await window.companyCol('gift_certificates')
            .where('code','==',certCode).where('status','==','active').limit(1).get();
        if (snap.empty) return false;
        const doc  = snap.docs[0];
        const cert = doc.data();
        if (cert.balance < amount) return false;
        const newBalance = cert.balance - amount;
        const tx = {
            date:    new Date().toISOString().slice(0,10),
            amount,
            service: serviceName || '',
        };
        await doc.ref.update({
            balance:      newBalance,
            status:       newBalance <= 0 ? 'used' : 'active',
            transactions: firebase.firestore.FieldValue.arrayUnion(tx),
            updatedAt:    firebase.firestore.FieldValue.serverTimestamp(),
        });
        return true;
    } catch(e) { return false; }
};

window.getCertificateByCode = async function(code) {
    if (!window.companyCol) return null;
    try {
        const snap = await window.companyCol('gift_certificates')
            .where('code','==',code).limit(1).get();
        return snap.empty ? null : { id:snap.docs[0].id, ...snap.docs[0].data() };
    } catch(e) { return null; }
};

// ════════════════════════════════════════════════════════════
// ADMIN UI
// ════════════════════════════════════════════════════════════

window.initSubscriptionsPanel = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.companyCol) return;
    container.innerHTML = '<div style="padding:1rem;text-align:center;color:#9ca3af;font-size:.82rem;">Завантаження...</div>';

    try {
        const [subSnap, certSnap] = await Promise.all([
            window.companyCol('subscriptions').where('status','==','active')
                .orderBy('createdAt','desc').limit(50).get(),
            window.companyCol('gift_certificates').where('status','==','active')
                .orderBy('createdAt','desc').limit(50).get(),
        ]);
        const subs  = subSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        const certs = certSnap.docs.map(d => ({ id:d.id, ...d.data() }));

        const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const fmtDate = ts => ts?.toDate ? ts.toDate().toLocaleDateString('uk-UA') : '';

        const subsHtml = subs.length ? subs.map(s => {
            const pct = Math.round(s.usedSessions/s.totalSessions*100);
            return `<div style="padding:.65rem .75rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:.75rem;">
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:.85rem;color:#1a1a1a;">${esc(s.clientName)}</div>
                    <div style="font-size:.75rem;color:#525252;">${esc(s.serviceName)}</div>
                </div>
                <div style="text-align:center;min-width:90px;">
                    <div style="font-size:.75rem;font-weight:700;color:#6366f1;">${s.usedSessions}/${s.totalSessions} сеансів</div>
                    <div style="background:#e2e8f0;border-radius:4px;height:4px;margin-top:3px;overflow:hidden;">
                        <div style="background:#6366f1;height:100%;width:${pct}%;"></div>
                    </div>
                    <div style="font-size:.68rem;color:#9ca3af;margin-top:2px;">до ${fmtDate(s.expiresAt)}</div>
                </div>
                <button onclick="window._useSubSession('${s.id}')" 
                    style="padding:4px 10px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;font-size:.75rem;cursor:pointer;white-space:nowrap;">
                    Використати
                </button>
            </div>`;
        }).join('') : '<div style="padding:1rem;color:#9ca3af;font-size:.82rem;text-align:center;">Активних абонементів немає</div>';

        const certsHtml = certs.length ? certs.map(c => {
            const pct = Math.round((1 - c.balance/c.amount)*100);
            return `<div style="padding:.65rem .75rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:.75rem;">
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:.82rem;color:#1a1a1a;font-family:monospace;">${esc(c.code)}</div>
                    <div style="font-size:.72rem;color:#525252;">від ${esc(c.purchasedBy)}${c.purchasedFor?' → '+esc(c.purchasedFor):''}</div>
                </div>
                <div style="text-align:center;min-width:80px;">
                    <div style="font-weight:700;font-size:.9rem;color:#d97706;">${(c.balance||0).toLocaleString()} грн</div>
                    <div style="font-size:.68rem;color:#9ca3af;">з ${(c.amount||0).toLocaleString()}</div>
                </div>
                <div style="font-size:.68rem;color:#9ca3af;">до ${fmtDate(c.expiresAt)}</div>
            </div>`;
        }).join('') : '<div style="padding:1rem;color:#9ca3af;font-size:.82rem;text-align:center;">Активних сертифікатів немає</div>';

        container.innerHTML = `
            <div style="display:flex;gap:.5rem;margin-bottom:.75rem;flex-wrap:wrap;">
                <button onclick="window._openNewSubModal()" 
                    style="padding:.45rem .85rem;background:#6366f1;color:white;border:none;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;">
                    + Новий абонемент
                </button>
                <button onclick="window._openNewCertModal()" 
                    style="padding:.45rem .85rem;background:#f59e0b;color:white;border:none;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;">
                    + Сертифікат
                </button>
            </div>

            <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:1rem;">
                <div style="padding:.6rem .75rem;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:.82rem;color:#374151;">
                    Абонементи (${subs.length})
                </div>
                ${subsHtml}
            </div>

            <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <div style="padding:.6rem .75rem;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:.82rem;color:#374151;">
                    Сертифікати (${certs.length})
                </div>
                ${certsHtml}
            </div>`;
    } catch(e) {
        container.innerHTML = `<div style="color:#ef4444;padding:1rem;font-size:.82rem;">Помилка: ${e.message}</div>`;
    }
};

window._useSubSession = async function(subId) {
    if (!confirm('Відмітити використання сеансу?')) return;
    const ok = await window.useSubscriptionSession(subId);
    if (ok) window.showToast?.('Сеанс відмічено ✓', 'success');
    else window.showToast?.('Помилка або сеансів не залишилось', 'error');
};

window._openNewSubModal = function() {
    const modal = document.createElement('div');
    modal.id = 'newSubModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:10050;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:400px;">
            <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;">Новий абонемент</div>
            <input id="ns-client" placeholder="Ім'я клієнта" style="width:100%;margin-bottom:.5rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            <input id="ns-phone" placeholder=window.t('телефон') style="width:100%;margin-bottom:.5rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            <input id="ns-service" placeholder=window.t('послугаНапрМанікюрГельлак') style="width:100%;margin-bottom:.5rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            <div style="display:flex;gap:.5rem;margin-bottom:.5rem;">
                <div style="flex:1;">
                    <label style="font-size:.75rem;color:#525252;">Кількість сеансів</label>
                    <input id="ns-sessions" type="number" value="10" min="1" style="width:100%;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:.75rem;color:#525252;">Ціна за сеанс (грн)</label>
                    <input id="ns-price" type="number" value="600" min="0" style="width:100%;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
                </div>
            </div>
            <div style="display:flex;gap:.5rem;margin-top:.75rem;">
                <button onclick="document.getElementById('newSubModal').remove()" 
                    style="flex:1;padding:.55rem;border:1px solid #e2e8f0;background:white;border-radius:8px;cursor:pointer;font-size:.82rem;">Скасувати</button>
                <button onclick="window._saveNewSub()" 
                    style="flex:2;padding:.55rem;background:#6366f1;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.82rem;">Створити</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

window._saveNewSub = async function() {
    const data = {
        clientName:     document.getElementById('ns-client')?.value?.trim() || '',
        clientPhone:    document.getElementById('ns-phone')?.value?.trim() || '',
        serviceName:    document.getElementById('ns-service')?.value?.trim() || '',
        totalSessions:  parseInt(document.getElementById('ns-sessions')?.value) || 10,
        pricePerSession: parseFloat(document.getElementById('ns-price')?.value) || 0,
    };
    if (!data.clientName) { alert('Вкажіть клієнта'); return; }
    const id = await window.createSubscription(data);
    if (id) {
        document.getElementById('newSubModal')?.remove();
        window.showToast?.('Абонемент створено ✓', 'success');
    }
};

window._openNewCertModal = function() {
    const modal = document.createElement('div');
    modal.id = 'newCertModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:10050;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:380px;">
            <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;">Подарунковий сертифікат</div>
            <input id="nc-by" placeholder=window.t('хтоКупує') style="width:100%;margin-bottom:.5rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            <input id="nc-for" placeholder="Для кого (не обов'язково)" style="width:100%;margin-bottom:.5rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            <input id="nc-amount" type="number" value="1000" placeholder=window.t('сумаГрн') style="width:100%;margin-bottom:.5rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            <div style="display:flex;gap:.5rem;margin-top:.75rem;">
                <button onclick="document.getElementById('newCertModal').remove()" 
                    style="flex:1;padding:.55rem;border:1px solid #e2e8f0;background:white;border-radius:8px;cursor:pointer;font-size:.82rem;">Скасувати</button>
                <button onclick="window._saveNewCert()" 
                    style="flex:2;padding:.55rem;background:#f59e0b;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.82rem;">Створити</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

window._saveNewCert = async function() {
    const data = {
        purchasedBy:  document.getElementById('nc-by')?.value?.trim()     || '',
        purchasedFor: document.getElementById('nc-for')?.value?.trim()    || '',
        amount:       parseFloat(document.getElementById('nc-amount')?.value) || 0,
    };
    if (!data.purchasedBy || !data.amount) { alert('Заповніть обов\'язкові поля'); return; }
    const result = await window.createGiftCertificate(data);
    if (result) {
        document.getElementById('newCertModal')?.remove();
        window.showToast?.(`Сертифікат ${result.code} створено ✓`, 'success');
    }
};

console.log('[102-subscriptions] loaded ✓');
