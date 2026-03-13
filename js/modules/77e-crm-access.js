// ============================================================
// js/modules/77e-crm-access.js — CRM права доступу
//
// Ролі:
//   owner    — бачить все, може все
//   manager  — бачить тільки свої угоди (assigneeId === uid)
//   employee — немає доступу до CRM взагалі
//   superadmin — бачить все
//
// API:
//   crmAccess.canViewAll()    — owner / superadmin
//   crmAccess.canEdit(deal)   — чи може юзер редагувати угоду
//   crmAccess.canDelete(deal) — тільки owner / superadmin
//   crmAccess.filterDeals(deals) — фільтрує список угод по правах
//   crmAccess.myUid()         — uid поточного юзера
// ============================================================

window.crmAccess = (function () {

    function _role() {
        return window.currentUserData?.role || 'employee';
    }

    function myUid() {
        return window.currentUser?.uid || window.currentUserData?.id || null;
    }

    // owner і superadmin бачать всі угоди
    function canViewAll() {
        const r = _role();
        return r === 'owner' || r === 'superadmin' || window.isSuperAdmin;
    }

    // Менеджер може редагувати тільки свої угоди; owner — будь-які
    function canEdit(deal) {
        if (canViewAll()) return true;
        if (_role() === 'manager') return deal?.assigneeId === myUid() || deal?.creatorId === myUid();
        return false;
    }

    // Видаляти можуть тільки owner / superadmin
    function canDelete(deal) {
        return canViewAll();
    }

    // Фільтрує масив угод — менеджер бачить тільки свої
    function filterDeals(deals) {
        if (canViewAll()) return deals;
        const uid = myUid();
        if (_role() === 'manager') return deals.filter(d => d.assigneeId === uid || d.creatorId === uid);
        return []; // employee — нічого
    }

    // CRM взагалі доступна?
    function hasCrmAccess() {
        return _role() !== 'employee' || window.isSuperAdmin;
    }

    return { canViewAll, canEdit, canDelete, filterDeals, myUid, hasCrmAccess };
})();


// ── Патч _filteredDeals у 77-crm.js ─────────────────────────
// Перевизначаємо після завантаження обох модулів.
// Оригінальна _filteredDeals не є window-функцією, тому патчимо
// через хук на crmApplyFilters і _renderKanban.
// Замість прямого патчу — використовуємо window.crmAccessFilter
// який викликається всередині _filteredDeals (якщо є).

window.crmAccessFilter = function (deals) {
    return window.crmAccess.filterDeals(deals);
};


// ── Налаштування прав в Settings ────────────────────────────
window.crmRenderAccessSettings = function () {
    const role = window.currentUserData?.role || 'employee';
    if (!window.crmAccess.canViewAll()) return ''; // тільки owner бачить налаштування

    const cur = window.crm?.pipeline?.accessMode || 'all';

    return `
    <div style="background:white;border-radius:10px;padding:1.1rem;border:1px solid #e8eaed;">
        <div style="font-weight:700;font-size:0.82rem;color:#111827;margin-bottom:0.5rem;">
            Права доступу менеджерів
        </div>
        <div style="font-size:0.72rem;color:#9ca3af;margin-bottom:0.75rem;">
            Визначає які угоди бачить кожен менеджер у воронці
        </div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
            ${[
                ['all',  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Всі угоди',       'Кожен менеджер бачить всі угоди компанії'],
                ['own',  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Тільки свої',      'Менеджер бачить тільки угоди де він відповідальний або автор'],
            ].map(([val, label, desc]) => `
            <label style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.6rem 0.75rem;
                border:1px solid ${cur===val ? '#bbf7d0' : '#e8eaed'};border-radius:8px;
                background:${cur===val ? '#f0fdf4' : '#f8fafc'};cursor:pointer;">
                <input type="radio" name="crmAccessMode" value="${val}" ${cur===val?'checked':''}
                    onchange="crmSaveAccessMode('${val}')"
                    style="margin-top:2px;accent-color:#22c55e;">
                <div>
                    <div style="font-size:0.8rem;font-weight:600;color:#111827;">${label}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">${desc}</div>
                </div>
            </label>`).join('')}
        </div>
    </div>`;
};

window.crmSaveAccessMode = async function (mode) {
    if (!window.crmAccess.canViewAll()) return;
    const db   = window.db || firebase.firestore();
    const comp = window.currentCompanyId || window.companyId;
    if (!comp || !window.crm?.pipeline?.id) return;
    try {
        await db.doc(`companies/${comp}/crm_pipelines/${window.crm.pipeline.id}`)
                .update({ accessMode: mode });
        if (window.crm.pipeline) window.crm.pipeline.accessMode = mode;
        if (window.showToast) showToast('Права збережено', 'success');
    } catch (e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};
