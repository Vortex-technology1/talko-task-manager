'use strict';
// ─────────────────────────────────────────────────────────────
// 95-backup.js — Backup UI для Owner
// ─────────────────────────────────────────────────────────────

const MANUAL_BACKUP_URL = 'https://us-central1-task-manager-44e84.cloudfunctions.net/manualBackup';
const BACKUP_SECRET     = 'talko-backup-2026';

// ── Показати вкладку бекапу тільки для owner ─────────────────
function initBackupTab() {
    const role = window.currentUserData?.role;
    const btn  = document.getElementById('backupNavBtn');
    if (btn) btn.style.display = (role === 'owner' || role === 'superadmin') ? 'flex' : 'none';
}

// ── Рендер вкладки ────────────────────────────────────────────
async function renderBackupTab() {
    const el = document.getElementById('backupTab');
    if (!el) return;

    const companyId = window.currentCompanyId || window.companyId;
    if (!companyId) {
        el.innerHTML = '<div style="padding:2rem;color:#9ca3af;">Компания не определена</div>';
        return;
    }

    el.innerHTML = `
    <div style="max-width:700px;margin:0 auto;padding:1.5rem 1rem;">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem;">
            <div style="width:42px;height:42px;background:#eff6ff;border-radius:12px;
                display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i data-lucide="database" style="width:22px;height:22px;color:#3b82f6;"></i>
            </div>
            <div>
                <div style="font-size:1.1rem;font-weight:700;color:#111827;">Резервное копирование</div>
                <div style="font-size:0.78rem;color:#9ca3af;">Автоматически ежедневно в 02:00 · Хранится 90 дней</div>
            </div>
        </div>

        <!-- Manual backup -->
        <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;margin-bottom:1rem;">
            <div style="font-size:0.85rem;font-weight:600;color:#374151;margin-bottom:0.5rem;">
                Создать резервную копию сейчас
            </div>
            <div style="font-size:0.78rem;color:#6b7280;margin-bottom:1rem;">
                Сохранит все данные компании в облачное хранилище. Занимает 10–30 секунд.
            </div>
            <button id="backupNowBtn" onclick="runManualBackup()"
                style="padding:0.55rem 1.25rem;background:#3b82f6;color:white;border:none;
                border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;
                display:flex;align-items:center;gap:0.5rem;">
                <i data-lucide="save" style="width:15px;height:15px;"></i>
                Создать бекап
            </button>
            <div id="backupStatus" style="margin-top:0.75rem;font-size:0.78rem;display:none;"></div>
        </div>

        <!-- Backup list -->
        <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                <div style="font-size:0.85rem;font-weight:600;color:#374151;">Доступные резервные копии</div>
                <button onclick="loadBackupList()" style="background:none;border:none;cursor:pointer;
                    color:#6b7280;font-size:0.75rem;display:flex;align-items:center;gap:4px;">
                    <i data-lucide="refresh-cw" style="width:13px;height:13px;"></i> Обновить
                </button>
            </div>
            <div id="backupList">
                <div style="color:#9ca3af;font-size:0.82rem;text-align:center;padding:1.5rem 0;">
                    Загрузка...
                </div>
            </div>
        </div>

    </div>`;

    if (typeof window.refreshIcons === 'function') window.refreshIcons();
    await loadBackupList();
}

// ── Завантажити список бекапів з Firestore ────────────────────
async function loadBackupList() {
    const listEl = document.getElementById('backupList');
    if (!listEl) return;

    const companyId = window.currentCompanyId || window.companyId;

    try {
        // Беремо метадані бекапів зі спеціальної колекції
        const snap = await db.collection('companies').doc(companyId)
            .collection('backupMeta')
            .orderBy('createdAt', 'desc')
            .limit(30)
            .get();

        if (snap.empty) {
            listEl.innerHTML = `
                <div style="color:#9ca3af;font-size:0.82rem;text-align:center;padding:1.5rem 0;">
                    Резервных копий ещё нет. Первая автоматическая копия будет сегодня в 02:00,
                    или нажмите «Создать бекап сейчас».
                </div>`;
            return;
        }

        listEl.innerHTML = snap.docs.map(doc => {
            const d = doc.data();
            const date = d.date || doc.id;
            const sizeKb = d.sizeKb ? `${d.sizeKb} KB` : '—';
            const type = d.type === 'auto' ? '🕐 Авто' : '👤 Ручной';
            const createdAt = d.createdAt?.toDate
                ? d.createdAt.toDate().toLocaleString('uk-UA')
                : date;

            return `
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0;
                border-bottom:1px solid #f3f4f6;">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.85rem;font-weight:600;color:#111827;">${date}</div>
                    <div style="font-size:0.72rem;color:#9ca3af;">${type} · ${createdAt} · ${sizeKb}</div>
                </div>
                <button onclick="confirmRestore('${date}', '${companyId}')"
                    style="padding:0.35rem 0.75rem;background:#f0fdf4;color:#16a34a;
                    border:1px solid #bbf7d0;border-radius:7px;cursor:pointer;
                    font-size:0.75rem;font-weight:600;white-space:nowrap;">
                    Восстановить
                </button>
            </div>`;
        }).join('');

    } catch(e) {
        listEl.innerHTML = `<div style="color:#ef4444;font-size:0.82rem;">Ошибка загрузки: ${e.message}</div>`;
    }
}

// ── Ручний бекап ──────────────────────────────────────────────
async function runManualBackup() {
    const btn    = document.getElementById('backupNowBtn');
    const status = document.getElementById('backupStatus');
    const companyId = window.currentCompanyId || window.companyId;

    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" style="width:15px;height:15px;animation:spin 1s linear infinite;"></i> Создаём бекап...';
    status.style.display = 'none';

    try {
        const res = await fetch(MANUAL_BACKUP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-backup-secret': BACKUP_SECRET,
            },
            body: JSON.stringify({ companyId })
        });

        const data = await res.json();

        if (data.ok) {
            // Зберігаємо метадані в Firestore для відображення у списку
            await db.collection('companies').doc(companyId)
                .collection('backupMeta').doc(data.date).set({
                    date: data.date,
                    sizeKb: data.sizeKb,
                    type: 'manual',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            status.style.display = 'block';
            status.style.color = '#16a34a';
            status.innerHTML = `✅ Резервна копія створена: ${String(data.date||'').replace(/</g,'&lt;')} · ${parseInt(data.sizeKb)||0} KB`;
            await loadBackupList();
        } else {
            throw new Error(data.error || 'Неизвестная ошибка');
        }
    } catch(e) {
        status.style.display = 'block';
        status.style.color = '#dc2626';
        status.innerHTML = `❌ Ошибка: ${e.message}`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save" style="width:15px;height:15px;"></i> Создать бекап';
        if (typeof window.refreshIcons === 'function') window.refreshIcons();
    }
}

// ── Підтвердження відновлення ─────────────────────────────────
function confirmRestore(date, companyId) {
    const ok = confirm(
        `⚠️ ВНИМАНИЕ!\n\nВосстановление перезапишет ТЕКУЩИЕ данные данными из бекапа ${date}.\n\nЭто действие нельзя отменить.\n\nПродолжить?`
    );
    if (!ok) return;
    restoreBackup(date, companyId);
}

async function restoreBackup(date, companyId) {
    if (typeof showToast === 'function') {
        showToast('🔄 Відновлення запущено. Це може зайняти 1-2 хвилини...', 'info', 8000);
    }

    try {
        const res = await fetch(
            'https://us-central1-task-manager-44e84.cloudfunctions.net/restoreBackup',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-backup-secret': BACKUP_SECRET,
                },
                body: JSON.stringify({ companyId, date })
            }
        );

        const data = await res.json();

        if (data.ok) {
            if (typeof showToast === 'function') {
                showToast(`✅ Восстановлено из бекапа ${date}. Перезагрузите страницу.`, 'success', 10000);
            }
        } else {
            throw new Error(data.error || 'Ошибка восстановления');
        }
    } catch(e) {
        if (typeof showToast === 'function') {
            showToast(`❌ Ошибка восстановления: ${e.message}`, 'error', 8000);
        }
    }
}

// ── Ініціалізація при перемиканні на вкладку ─────────────────
if (typeof window !== 'undefined') {
    window.renderBackupTab   = renderBackupTab;
    window.runManualBackup   = runManualBackup;
    window.loadBackupList    = loadBackupList;
    window.confirmRestore    = confirmRestore;
    window.initBackupTab     = initBackupTab;

    // Кнопка показується через 06-auth-state-listener.js
}

console.log('[95-backup] loaded ✓');
