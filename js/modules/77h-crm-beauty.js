// ============================================================
// 77h-crm-beauty.js — Beauty профіль клієнта в CRM
// Beauty модуль для TALKO
// ============================================================
'use strict';

// i18n helper
var _tg = _tg || function(ua, ru) {
  return (window.currentLang === 'ru' || (typeof window.getLocale === 'function' && window.getLocale().startsWith('ru'))) ? ru : ua;
};


// ── Render beauty tab in deal modal ───────────────────────
window._renderBeautyTab = async function(deal) {
    const content = document.getElementById('crmDealContent');
    if (!content) return;
    content.innerHTML = `<div style="padding:2rem;text-align:center;color:#9ca3af;font-size:.82rem;">${window.t('завантаження')} beauty профілю...</div>`;

    // Знаходимо клієнта по clientId або phone
    let client = null;
    try {
        if (deal.clientId && window.companyDoc) {
            const snap = await window.companyDoc('crm_clients', deal.clientId).get();
            if (snap.exists) client = { id: snap.id, ...snap.data() };
        }
        if (!client && deal.phone && window.companyCol) {
            const snap = await window.companyCol('crm_clients')
                .where('phone','==', deal.phone).limit(1).get();
            if (!snap.empty) client = { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
    } catch(e) {}

    if (!client) {
        content.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#9ca3af;font-size:.82rem;">
            Клієнтський профіль не знайдено.<br>
            <button onclick="window._createBeautyClientProfile('${deal.id}')" 
                style="margin-top:.75rem;padding:.45rem 1rem;background:#ec4899;color:white;border:none;border-radius:8px;font-size:.8rem;cursor:pointer;">
                Створити Beauty профіль
            </button>
        </div>`;
        return;
    }

    const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const inp = 'width:100%;padding:.45rem .6rem;border:1px solid #e2e8f0;border-radius:7px;font-size:.82rem;box-sizing:border-box;';
    const lbl = 'font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:.2rem;letter-spacing:.03em;';

    // Підтягуємо history записів
    let visitHistory = [];
    try {
        const snap = await window.companyCol('booking_appointments')
            .where('clientPhone','==', client.phone||'')
            .orderBy('startTime','desc').limit(10).get();
        visitHistory = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    } catch(e) {}

    // Loyalty widget
    const loyaltyHtml = window.renderLoyaltyWidget
        ? window.renderLoyaltyWidget(client)
        : '';

    // Visit history
    const historyHtml = visitHistory.length ? visitHistory.map(v => {
        const date = v.date || '';
        const master = v.masterName || '';
        const service = v.calendarName || v.serviceName || '';
        const amount = v.amount ? `${v.amount.toLocaleString()} грн` : '';
        return `<div style="display:flex;align-items:center;gap:.5rem;padding:.45rem 0;border-bottom:1px solid #f8fafc;font-size:.78rem;">
            <span style="color:#374151;min-width:80px;font-weight:500;">${esc(date)}</span>
            <span style="flex:1;color:#525252;">${esc(service)}</span>
            ${master ? `<span style="color:#8b5cf6;font-size:.72rem;">${esc(master)}</span>` : ''}
            ${amount ? `<span style="font-weight:600;color:#1a1a1a;">${esc(amount)}</span>` : ''}
        </div>`;
    }).join('') : `<div style="font-size:.78rem;color:#9ca3af;padding:.5rem 0;">${window.t('записівЩеНемає')}</div>`;

    content.innerHTML = `
    <div style="padding:0 .25rem;">

        <!-- Статистика -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:1rem;">
            <div style="background:#f0fdf4;border-radius:10px;padding:.6rem;text-align:center;">
                <div style="font-size:1.3rem;font-weight:700;color:#16a34a;">${client.totalVisits||0}</div>
                <div style="font-size:.68rem;color:#525252;">${window.t('візитів')}</div>
            </div>
            <div style="background:#eff6ff;border-radius:10px;padding:.6rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:700;color:#2563eb;">${((client.totalSpent||0)/1000).toFixed(1)}к</div>
                <div style="font-size:.68rem;color:#525252;">Витрат грн</div>
            </div>
            <div style="background:#faf5ff;border-radius:10px;padding:.6rem;text-align:center;">
                <div style="font-size:1.1rem;font-weight:700;color:#7c3aed;">${client.loyaltyPoints||0}</div>
                <div style="font-size:.68rem;color:#525252;">${window.t('балів')}</div>
            </div>
        </div>

        <!-- Loyalty -->
        ${loyaltyHtml}

        <!-- Beauty профіль форма -->
        <div style="margin-bottom:1rem;">
            <div style="font-weight:700;font-size:.82rem;color:#374151;margin-bottom:.6rem;display:flex;align-items:center;gap:.4rem;">
                <span>💅</span> ${window.t('beautyПрофіль')}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.5rem;">
                <div>
                    <label style="${lbl}">День народження</label>
                    <input id="bp-birthDate" type="date" value="${esc(client.birthDate||'')}" style="${inp}">
                </div>
                <div>
                    <label style="${lbl}">${window.t('нагадуватиЧерезДнів')}</label>
                    <input id="bp-reminder" type="number" value="${client.nextVisitReminder||21}" min="1" max="90" style="${inp}">
                </div>
            </div>
            <div style="margin-bottom:.5rem;">
                <label style="${lbl}">${window.t('алергіїПротипоказання')}</label>
                <input id="bp-allergies" type="text" value="${esc(client.allergies||'')}" 
                    placeholder="${window.t('напрНікельАкрил')}" style="${inp}">
            </div>
            <div style="margin-bottom:.5rem;">
                <label style="${lbl}">Нотатки майстра</label>
                <textarea id="bp-notes" rows="2" placeholder="${window.t('уподобанняПобажанняОсобливості')}"
                    style="${inp}resize:none;">${esc(client.notes||'')}</textarea>
            </div>
            <div style="margin-bottom:.75rem;">
                <label style="${lbl}">${window.t('улюбленіПослуги')}</label>
                <input id="bp-services" type="text" value="${esc((client.preferredServices||[]).join(', '))}" 
                    placeholder="${window.t('манікюрПедикюр')}" style="${inp}">
            </div>
            <button onclick="window._saveBeautyProfile('${client.id}')"
                style="width:100%;padding:.5rem;background:#ec4899;color:white;border:none;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;">
                Зберегти Beauty профіль
            </button>
        </div>

        <!-- Остання інформація -->
        ${client.lastVisitDate ? `
        <div style="background:#f8fafc;border-radius:8px;padding:.55rem .75rem;margin-bottom:1rem;font-size:.78rem;color:#525252;">
            <span style="font-weight:600;">${window.t('останнійВізит')}</span> ${esc(client.lastVisitDate)}
        </div>` : ''}

        <!-- Абонементи -->
        <div id="beautyClientSubs" style="margin-bottom:1rem;">
            <div style="font-weight:700;font-size:.82rem;color:#374151;margin-bottom:.5rem;">🎟 Абонементи</div>
            <div style="font-size:.75rem;color:#9ca3af;">Завантаження...</div>
        </div>

        <!-- Історія візитів -->
        <div style="margin-bottom:.5rem;">
            <div style="font-weight:700;font-size:.82rem;color:#374151;margin-bottom:.5rem;">📋 ${window.t('історіяВізитів')}</div>
            <div style="border:1px solid #e2e8f0;border-radius:8px;padding:.5rem .75rem;background:white;">
                ${historyHtml}
            </div>
        </div>

    </div>`;

    // Async load subscriptions
    window._loadClientSubsWidget(client.id);
};

// ── Load client subscriptions widget ─────────────────────
window._loadClientSubsWidget = async function(clientId) {
    const el = document.getElementById('beautyClientSubs');
    if (!el) return;
    const subs = await window.getClientSubscriptions?.(clientId) || [];
    if (!subs.length) {
        el.innerHTML = `<div style="font-weight:700;font-size:.82rem;color:#374151;margin-bottom:.5rem;">🎟 Абонементи</div>
            <div style="font-size:.75rem;color:#9ca3af;padding:.5rem 0;">${window.t('активнихАбонементівНемає')}</div>`;
        return;
    }
    const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const rows = subs.map(s => {
        const pct = Math.round(s.usedSessions/s.totalSessions*100);
        return `<div style="padding:.5rem .65rem;border-bottom:1px solid #f8fafc;font-size:.78rem;display:flex;align-items:center;gap:.5rem;">
            <div style="flex:1;">
                <span style="font-weight:600;">${esc(s.serviceName)}</span>
                <div style="background:#e2e8f0;border-radius:3px;height:3px;margin-top:3px;overflow:hidden;">
                    <div style="background:#6366f1;height:100%;width:${pct}%;"></div>
                </div>
            </div>
            <span style="color:#6366f1;font-weight:700;font-size:.8rem;white-space:nowrap;">
                ${s.remainingSessions}/${s.totalSessions}
            </span>
        </div>`;
    }).join('');
    el.innerHTML = `<div style="font-weight:700;font-size:.82rem;color:#374151;margin-bottom:.5rem;">🎟 Абонементи (${subs.length})</div>
        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${rows}</div>`;
};

// ── Save beauty profile ────────────────────────────────────
window._saveBeautyProfile = async function(clientId) {
    if (!window.companyDoc) return;
    const birthDate = document.getElementById('bp-birthDate')?.value || '';
    const allergies = document.getElementById('bp-allergies')?.value?.trim() || '';
    const notes     = document.getElementById('bp-notes')?.value?.trim() || '';
    const reminder  = parseInt(document.getElementById('bp-reminder')?.value) || 21;
    const services  = (document.getElementById('bp-services')?.value || '')
        .split(',').map(s => s.trim()).filter(Boolean);

    try {
        await window.companyDoc('crm_clients', clientId).update({
            birthDate,
            allergies,
            notes,
            nextVisitReminder: reminder,
            preferredServices: services,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.showToast?.(window.t('beautyПрофільЗбережено'), 'success');
    } catch(e) {
        window.showToast?.('Помилка збереження', 'error');
    }
};

// ── Create beauty client profile from deal ────────────────
window._createBeautyClientProfile = async function(dealId) {
    const deal = window.crm?.deals?.find(d => d.id === dealId);
    if (!deal || !window.companyCol) return;
    try {
        const ref = window.companyCol('crm_clients').doc();
        await ref.set({
            name:          deal.clientName || deal.title || '',
            phone:         deal.phone || '',
            email:         deal.email || '',
            totalVisits:   0,
            totalSpent:    0,
            loyaltyPoints: 0,
            loyaltyTier:   'bronze',
            isDemo:        false,
            createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:     firebase.firestore.FieldValue.serverTimestamp(),
        });
        // Link to deal
        await window.companyDoc('crm_deals', dealId).update({
            clientId: ref.id,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.showToast?.(window.t('beautyПрофільСтворено'), 'success');
        window._renderBeautyTab(deal);
    } catch(e) {
        window.showToast?.('Помилка', 'error');
    }
};

// ── Inject schedule tab button in user cards ─────────────
// Runs after 32-users-invites renders — patches toggleUserDetail
window._injectScheduleTabInUserCards = function() {
    if (!window.hasModule?.('scheduling') && window.currentCompanyData?.niche !== 'beauty_salon') return;

    const _orig = window.toggleUserDetail;
    if (!_orig || window._scheduleInjected) return;
    window._scheduleInjected = true;

    window.toggleUserDetail = function(userId, event) {
        _orig.call(this, userId, event);
        // After toggle — check if detail section opened, inject schedule button
        setTimeout(() => {
            const detail = document.getElementById('userDetail_' + userId);
            if (!detail || detail.style.display === 'none') return;
            if (detail.querySelector('[data-schedule-btn]')) return; // already injected

            const btn = document.createElement('div');
            btn.style.cssText = 'margin-top:.6rem;border-top:1px solid #f1f5f9;padding-top:.6rem;';
            btn.innerHTML = `
                <button data-schedule-btn="1" data-schedule-tab="${userId}" data-user-name="${userId}"
                    style="width:100%;padding:.4rem;background:#f0f9ff;color:#0369a1;border:1px solid #bae6fd;
                    border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;">
                    📅 Розклад та відгуки
                </button>
                <div id="schedule-container-${userId}" style="display:none;margin-top:.5rem;"></div>`;
            detail.appendChild(btn);
        }, 50);
    };
};

// Init hook
document.addEventListener('DOMContentLoaded', window._injectScheduleTabInUserCards);
// Also try immediately in case DOM already loaded
setTimeout(window._injectScheduleTabInUserCards, 1000);

console.log('[77h-crm-beauty] loaded ✓');
