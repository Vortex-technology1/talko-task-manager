// ============================================================
// 101-loyalty.js — Програма лояльності (бали)
// Beauty модуль для TALKO
// ============================================================
'use strict';

// ── HTML escape (XSS protection) ───────────────────────────
function _loyaltyEsc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const LOYALTY_RULES = {
    earnRate: 10,       // 10 балів за 100 грн (10%)
    tiers: {
        bronze: { min:     0, discount: 0,    label: 'Bronze', color: '#b45309' },
        silver: { min:  2000, discount: 0.05, label: 'Silver', color: '#6b7280' },
        gold:   { min:  5000, discount: 0.10, label: 'Gold',   color: '#d97706' },
        vip:    { min: 10000, discount: 0.15, label: 'VIP',    color: '#7c3aed' },
    },
    redemptionRate: 1,  // 1 бал = 1 грн
    minRedemption: 100, // мінімум 100 балів
};
window.LOYALTY_RULES = LOYALTY_RULES;

// ── Tier calculation ───────────────────────────────────────
window.getLoyaltyTier = function(points) {
    const tiers = LOYALTY_RULES.tiers;
    if (points >= tiers.vip.min)    return 'vip';
    if (points >= tiers.gold.min)   return 'gold';
    if (points >= tiers.silver.min) return 'silver';
    return 'bronze';
};

window.getLoyaltyTierInfo = function(tier) {
    return LOYALTY_RULES.tiers[tier] || LOYALTY_RULES.tiers.bronze;
};

// ── Add loyalty transaction ────────────────────────────────
window.addLoyaltyTransaction = async function(clientId, points, type, reason, appointmentId) {
    if (!window.companyCol || !clientId) return false;
    try {
        // Log transaction
        const txRef = window.companyCol('loyalty_transactions').doc();
        await txRef.set({
            clientId, points, type, reason,
            appointmentId: appointmentId || null,
            isDemo: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // Update client points
        const clientRef = window.companyDoc('crm_clients', clientId);
        const snap = await clientRef.get();
        if (!snap.exists) return false;
        const current = snap.data().loyaltyPoints || 0;
        const newTotal = Math.max(0, current + points);
        const newTier  = window.getLoyaltyTier(newTotal);
        await clientRef.update({
            loyaltyPoints: newTotal,
            loyaltyTier:   newTier,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return true;
    } catch(e) { console.error('addLoyaltyTransaction:', e); return false; }
};

// ── Earn points after appointment ─────────────────────────
window.earnLoyaltyPoints = async function(clientId, amount, appointmentId, serviceName) {
    const pts = Math.floor((amount||0) / 100 * LOYALTY_RULES.earnRate);
    if (pts <= 0) return;
    await window.addLoyaltyTransaction(
        clientId, pts, 'earned',
        `${serviceName||'Послуга'} — ${amount} грн`,
        appointmentId
    );
};

// ── Redeem points ──────────────────────────────────────────
window.redeemLoyaltyPoints = async function(clientId, points) {
    if (points < LOYALTY_RULES.minRedemption) return false;
    const snap = await window.companyDoc('crm_clients', clientId).get().catch(()=>null);
    if (!snap?.exists) return false;
    const current = snap.data().loyaltyPoints || 0;
    if (current < points) return false;
    await window.addLoyaltyTransaction(clientId, -points, 'redeemed', `Списання ${points} балів`);
    return true;
};

// ── Render loyalty widget for client card ─────────────────
window.renderLoyaltyWidget = function(client) {
    const pts  = client.loyaltyPoints || 0;
    const tier = client.loyaltyTier || window.getLoyaltyTier(pts);
    const info = window.getLoyaltyTierInfo(tier);
    const tiers = LOYALTY_RULES.tiers;

    // Next tier
    const tierKeys = ['bronze','silver','gold','vip'];
    const currentIdx = tierKeys.indexOf(tier);
    const nextTier = tierKeys[currentIdx+1];
    const nextInfo = nextTier ? tiers[nextTier] : null;
    const toNext   = nextInfo ? nextInfo.min - pts : 0;

    const progressPct = nextInfo
        ? Math.min(100, Math.round((pts - info.min) / (nextInfo.min - info.min) * 100))
        : 100;

    return `<div style="background:linear-gradient(135deg,#faf5ff,#f0fdf4);border:1px solid #e9d5ff;border-radius:12px;padding:.85rem 1rem;margin-bottom:.75rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;">
            <div>
                <span style="font-weight:700;color:${info.color};font-size:.9rem;">${info.label}</span>
                <span style="font-size:.75rem;color:#525252;margin-left:.4rem;">${info.discount>0?`знижка ${info.discount*100}%`:''}</span>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:700;font-size:1rem;color:#1a1a1a;">${pts.toLocaleString()} балів</div>
                <div style="font-size:.72rem;color:#525252;">≈ ${pts} грн</div>
            </div>
        </div>
        ${nextInfo ? `
        <div style="background:#e2e8f0;border-radius:4px;height:4px;margin-bottom:.35rem;overflow:hidden;">
            <div style="background:${info.color};height:100%;width:${progressPct}%;transition:width .4s;border-radius:4px;"></div>
        </div>
        <div style="font-size:.72rem;color:#525252;">До ${nextInfo.label}: ще ${toNext} балів</div>` : 
        `<div style="font-size:.72rem;color:#7c3aed;font-weight:600;">✦ Максимальний статус</div>`}
    </div>`;
};

// ── Loyalty admin panel (init) ────────────────────────────
window.initLoyaltyPanel = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.companyCol) return;
    container.innerHTML = '<div style="padding:1rem;text-align:center;color:#9ca3af;">Завантаження...</div>';
    try {
        const snap = await window.companyCol('crm_clients')
            .orderBy('loyaltyPoints','desc').limit(50).get();
        const clients = snap.docs.map(d => ({ id:d.id, ...d.data() }));
        if (!clients.length) {
            container.innerHTML = '<div style="padding:1rem;color:#9ca3af;font-size:.85rem;">Клієнтів із балами ще немає</div>';
            return;
        }
        const rows = clients.filter(c => (c.loyaltyPoints||0) > 0).map(c => {
            const tier = c.loyaltyTier || window.getLoyaltyTier(c.loyaltyPoints||0);
            const info = window.getLoyaltyTierInfo(tier);
            return `<tr>
                <td style="padding:.5rem .75rem;font-weight:500;">${window._esc?window._esc(c.name||c.phone||''):c.name||''}</td>
                <td style="padding:.5rem .75rem;text-align:center;">
                    <span style="font-weight:700;color:${info.color};">${(c.loyaltyPoints||0).toLocaleString()}</span>
                </td>
                <td style="padding:.5rem .75rem;text-align:center;">
                    <span style="font-size:.75rem;background:${info.color}15;color:${info.color};padding:2px 8px;border-radius:20px;font-weight:600;">${info.label}</span>
                </td>
                <td style="padding:.5rem .75rem;text-align:center;">
                    <button onclick="window._loyaltyAdjust('${c.id}','${(c.name||'').replace(/'/g,'')}')" 
                        style="padding:3px 10px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:6px;font-size:.75rem;cursor:pointer;">
                        Нарахувати
                    </button>
                </td>
            </tr>`;
        }).join('');
        container.innerHTML = `
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
                    <thead><tr style="background:#f8fafc;">
                        <th style="padding:.5rem .75rem;text-align:left;font-weight:600;color:#374151;">Клієнт</th>
                        <th style="padding:.5rem .75rem;text-align:center;font-weight:600;color:#374151;">Бали</th>
                        <th style="padding:.5rem .75rem;text-align:center;font-weight:600;color:#374151;">Рівень</th>
                        <th style="padding:.5rem .75rem;"></th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    } catch(e) {
        container.innerHTML = `<div style="color:#ef4444;padding:1rem;font-size:.82rem;">Помилка: ${_loyaltyEsc(e.message)}</div>`;
    }
};

window._loyaltyAdjust = function(clientId, clientName) {
    const pts = parseInt(prompt(`Нарахувати бали клієнту ${clientName}:\n(від'ємне число = списати)`, '100'));
    if (isNaN(pts) || pts === 0) return;
    const type = pts > 0 ? 'earned' : 'redeemed';
    window.addLoyaltyTransaction(clientId, pts, type, 'Ручне коригування').then(ok => {
        if (ok) window.showToast?.(`${pts > 0 ? '+' : ''}${pts} балів ${pts > 0 ? 'нараховано' : 'списано'} ✓`, 'success');
    });
};

console.log('[101-loyalty] loaded ✓');
