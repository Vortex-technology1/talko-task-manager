// =============================================
// MODULE 70 — ROLES & PERMISSIONS SYSTEM
// =============================================

(function() {
    'use strict';

// ---- DEFAULT PERMISSIONS PER ROLE ----
const DEFAULT_ROLE_PERMISSIONS = {
    owner: {
        // Статистика
        viewStats: true,
        editMetrics: true,
        deleteMetricRows: true,
        viewAllMetrics: true,
        viewOwnerMetrics: true,
        // Завдання
        viewAllTasks: true,
        editAnyTask: true,
        deleteAnyTask: true,
        assignTasks: true,
        // Контроль
        viewControl: true,
        viewAiAnalysis: true,
        // Співробітники
        viewTeamList: true,
        viewColleagueEmails: true,
        editUserCards: true,
        inviteUsers: true,
        changeRoles: true,
        removeUsers: true,
        // Система
        viewAdminPanel: true,
        editRoles: true,
        viewFinance: true,
        // Проекти/Процеси
        viewAllProjects: true,
        manageProjects: true,
    },
    admin: {
        viewStats: true,
        editMetrics: true,
        deleteMetricRows: true,
        viewAllMetrics: true,
        viewOwnerMetrics: false,
        viewAllTasks: true,
        editAnyTask: true,
        deleteAnyTask: true,
        assignTasks: true,
        viewControl: true,
        viewAiAnalysis: true,
        viewTeamList: true,
        viewColleagueEmails: true,
        editUserCards: true,
        inviteUsers: true,
        changeRoles: true,
        removeUsers: false,
        viewAdminPanel: true,
        editRoles: false,
        viewFinance: false,
        viewAllProjects: true,
        manageProjects: true,
    },
    manager: {
        viewStats: true,
        editMetrics: false,
        deleteMetricRows: false,
        viewAllMetrics: true,
        viewOwnerMetrics: false,
        viewAllTasks: true,
        editAnyTask: false,
        deleteAnyTask: false,
        assignTasks: true,
        viewControl: true,
        viewAiAnalysis: true,
        viewTeamList: true,
        viewColleagueEmails: false,
        editUserCards: false,
        inviteUsers: false,
        changeRoles: false,
        removeUsers: false,
        viewAdminPanel: false,
        editRoles: false,
        viewFinance: false,
        viewAllProjects: true,
        manageProjects: false,
    },
    employee: {
        viewStats: false,
        editMetrics: false,
        deleteMetricRows: false,
        viewAllMetrics: false,
        viewOwnerMetrics: false,
        viewAllTasks: false,
        editAnyTask: false,
        deleteAnyTask: false,
        assignTasks: false,
        viewControl: false,
        viewAiAnalysis: false,
        viewTeamList: true,
        viewColleagueEmails: false,
        editUserCards: false,
        inviteUsers: false,
        changeRoles: false,
        removeUsers: false,
        viewAdminPanel: false,
        editRoles: false,
        viewFinance: false,
        viewAllProjects: false,
        manageProjects: false,
    }
};

// ---- PERMISSION LABELS (для UI) ----
const PERMISSION_GROUPS = [
    {
        group: window.t('permStats'),
        items: [
            { key: 'viewStats',         label: 'Переглядати статистику' },
            { key: 'viewAllMetrics',    label: window.t('permViewAllMetrics') },
            { key: 'viewOwnerMetrics',  label: window.t('permViewFinMetrics') },
            { key: 'editMetrics',       label: 'Додавати / редагувати метрики' },
            { key: 'deleteMetricRows',  label: 'Видаляти рядки статистики' },
        ]
    },
    {
        group: window.t('actTask'),
        items: [
            { key: 'viewAllTasks',  label: window.t('permViewAllTasks') },
            { key: 'assignTasks',   label: window.t('permAssignTasks') },
            { key: 'editAnyTask',   label: 'Редагувати будь-яке завдання' },
            { key: 'deleteAnyTask', label: 'Видаляти будь-яке завдання' },
        ]
    },
    {
        group: window.t('permControlAnalytics'),
        items: [
            { key: 'viewControl',    label: 'Панель контролю' },
            { key: 'viewAiAnalysis', label: window.t('aiAnalysis2') },
            { key: 'viewFinance',    label: window.t('finIndicators') },
        ]
    },
    {
        group: 'Проекти та процеси',
        items: [
            { key: 'viewAllProjects', label: window.t('permViewAllProjects') },
            { key: 'manageProjects',  label: 'Керувати проектами' },
        ]
    },
    {
        group: window.t('teamWord'),
        items: [
            { key: 'viewTeamList',         label: 'Бачити список команди' },
            { key: 'viewColleagueEmails',  label: 'Бачити email колег' },
            { key: 'editUserCards',        label: window.t('permEditStaff') },
            { key: 'inviteUsers',          label: window.t('permInviteStaff') },
            { key: 'changeRoles',          label: window.t('permChangeRoles') },
            { key: 'removeUsers',          label: window.t('permDeleteStaff') },
        ]
    },
    {
        group: window.t('permSystem'),
        items: [
            { key: 'viewAdminPanel', label: window.t('permAdminPanel') },
            { key: 'editRoles',      label: window.t('permEditRoles') },
        ]
    }
];

// ---- STATE ----
let rolePermissions = {}; // завантажені з Firestore або дефолтні
let permissionsLoaded = false;

// ---- LOAD PERMISSIONS ----
async function loadRolePermissions() {
    if (!currentCompany) return;
    try {
        const snap = await db.collection('companies').doc(currentCompany)
            .collection('rolePermissions').get();
        
        if (snap.empty) {
            // Перший запуск — зберігаємо дефолтні
            rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
            await saveAllRolePermissions();
        } else {
            rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
            snap.forEach(doc => {
                rolePermissions[doc.id] = { ...rolePermissions[doc.id], ...doc.data() };
            });
        }
        permissionsLoaded = true;
    } catch(e) {
        console.warn('[ROLES] Failed to load, using defaults:', e);
        rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
        permissionsLoaded = true;
    }
}

async function saveAllRolePermissions() {
    if (!currentCompany) return;
    const batch = db.batch();
    Object.entries(rolePermissions).forEach(([role, perms]) => {
        if (role === 'owner') return; // owner не зберігаємо — завжди all true
        const ref = db.collection('companies').doc(currentCompany)
            .collection('rolePermissions').doc(role);
        batch.set(ref, perms);
    });
    try {
    await batch.commit();
    } catch(err) {
        console.error('[Batch] commit failed:', err);
        showToast && showToast('Помилка збереження. Спробуйте ще раз.', 'error');
    }
}

async function saveRolePermission(role, key, value) {
    if (role === 'owner') return; // owner незмінний
    if (!currentCompany) return;
    await db.collection('companies').doc(currentCompany)
        .collection('rolePermissions').doc(role)
        .set({ [key]: value }, { merge: true });
    if (!rolePermissions[role]) rolePermissions[role] = {};
    rolePermissions[role][key] = value;
}

// ---- MAIN hasPermission FUNCTION ----
window.DEFAULT_ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;

    window.hasPermission = function(permKey) {
    if (!currentUser) return false;
    const u = (typeof users !== 'undefined' ? users : []).find(u => u.id === currentUser.uid);
    if (!u) return false;
    const role = u.role || 'employee';
    
    // Owner — завжди все дозволено
    if (role === 'owner') return true;
    
    // isSuperAdmin — теж все
    if (typeof isSuperAdmin !== 'undefined' && isSuperAdmin) return true;

    // Кастомний override на рівні юзера
    if (u.customPermissions && u.customPermissions[permKey] !== undefined) {
        return !!u.customPermissions[permKey];
    }

    // Роль з завантажених дозволів
    if (permissionsLoaded && rolePermissions[role]) {
        return !!rolePermissions[role][permKey];
    }

    // Fallback до дефолтних
    return !!(DEFAULT_ROLE_PERMISSIONS[role]?.[permKey]);
};

// ---- RENDER ROLES TAB ----
window.renderRolesTab = async function() {
    const c = document.getElementById('rolesPermissionsContainer');
    if (!c) return;

    c.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af;">Завантаження...</div>';

    if (!permissionsLoaded) await loadRolePermissions();

    const canEdit = hasPermission('editRoles');
    const roles = ['admin', 'manager', 'employee'];
    const roleLabels = { admin: window.t('adminWord'), manager: 'Менеджер', employee: window.t('employeeWord') };
    const roleColors = { admin: '#ef4444', manager: '#f97316', employee: '#6b7280' };

    let html = `
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <thead>
            <tr style="background:#f9fafb;">
                <th style="padding:0.75rem 1rem;text-align:left;border-bottom:2px solid #e5e7eb;min-width:220px;">Дозвіл</th>
                <th style="padding:0.75rem;text-align:center;border-bottom:2px solid #e5e7eb;width:80px;">
                    <span style="background:#22c55e;color:white;padding:2px 8px;border-radius:6px;font-size:0.75rem;">Owner</span>
                </th>`;
    
    roles.forEach(r => {
        html += `<th style="padding:0.75rem;text-align:center;border-bottom:2px solid #e5e7eb;width:100px;">
            <span style="background:${roleColors[r]};color:white;padding:2px 8px;border-radius:6px;font-size:0.75rem;">${roleLabels[r]}</span>
        </th>`;
    });
    html += `</tr></thead><tbody>`;

    PERMISSION_GROUPS.forEach((group, gi) => {
        html += `<tr>
            <td colspan="${2 + roles.length}" style="padding:0.6rem 1rem;background:#f0fdf4;font-weight:600;font-size:0.78rem;color:#16a34a;border-top:${gi > 0 ? '2px solid #e5e7eb' : 'none'};">
                ${group.group}
            </td>
        </tr>`;
        
        group.items.forEach(item => {
            html += `<tr style="border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:0.6rem 1rem;color:#374151;">${item.label}</td>
                <td style="text-align:center;padding:0.6rem;">
                    <span style="color:#22c55e;font-size:1rem;">✓</span>
                </td>`;
            
            roles.forEach(role => {
                const val = rolePermissions[role]?.[item.key] ?? DEFAULT_ROLE_PERMISSIONS[role]?.[item.key] ?? false;
                if (canEdit) {
                    html += `<td style="text-align:center;padding:0.6rem;">
                        <label style="cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:100%;">
                            <input type="checkbox" 
                                ${val ? 'checked' : ''} 
                                onchange="updateRolePermission('${role}','${item.key}',this.checked)"
                                style="width:16px;height:16px;cursor:pointer;accent-color:#22c55e;">
                        </label>
                    </td>`;
                } else {
                    html += `<td style="text-align:center;padding:0.6rem;">
                        <span style="color:${val ? '#22c55e' : '#d1d5db'};font-size:1rem;">${val ? '✓' : '✗'}</span>
                    </td>`;
                }
            });
            html += `</tr>`;
        });
    });

    html += `</tbody></table></div>`;

    if (canEdit) {
        html += `<div style="padding:1rem;background:#f0fdf4;border-radius:0 0 12px 12px;border-top:1px solid #bbf7d0;">
            <p style="font-size:0.8rem;color:#16a34a;margin:0;">
                ✓ Зміни зберігаються автоматично. Owner завжди має всі права.
            </p>
        </div>`;
    }

    c.innerHTML = html;
};

// ---- UPDATE PERMISSION ----
window.updateRolePermission = async function(role, key, value) {
    if (!hasPermission('editRoles')) {
        showToast('Недостатньо прав', 'error');
        return;
    }
    try {
        await saveRolePermission(role, key, value);
        showToast(window.t('savedOk2'), 'success');
    } catch(e) {
        showToast('Помилка збереження: ' + e.message, 'error');
    }
};

// ---- INIT ----
window.initRolesPermissions = async function() {
    await loadRolePermissions();
};

// Ініціалізуємо при завантаженні компанії
const _origLoadCompany = window.onCompanyLoaded;
document.addEventListener('companyLoaded', function() {
    loadRolePermissions();
});

})();
