// ============================================================
// 103-notifications.js — Черга нагадувань клієнтам
// Beauty модуль для TALKO
// ============================================================
'use strict';

// ── HTML escape (XSS protection) ───────────────────────────
function _notifEsc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Schedule reminder for appointment ─────────────────────
window.scheduleAppointmentReminders = async function(appointmentId, appointmentData) {
    if (!window.companyCol || !appointmentData) return;
    const { date, timeSlot, clientPhone, clientName, calendarName } = appointmentData;
    if (!date || !timeSlot || !clientPhone) return;

    const apptDateTime = new Date(`${date}T${timeSlot}:00`);
    if (isNaN(apptDateTime.getTime())) return;

    const reminders = [
        {
            type:        'appointment_reminder_24h',
            scheduledAt: new Date(apptDateTime.getTime() - 24*3600*1000),
            message:     `Нагадуємо! Завтра о ${timeSlot} — ${calendarName||'запис'}. Чекаємо на вас!`,
        },
        {
            type:        'appointment_reminder_2h',
            scheduledAt: new Date(apptDateTime.getTime() - 2*3600*1000),
            message:     `Нагадування: через 2 години о ${timeSlot} — ${calendarName||'запис'}. Будемо чекати!`,
        },
    ];

    const now = new Date();
    for (const r of reminders) {
        if (r.scheduledAt <= now) continue; // already past
        try {
            await window.companyCol('notification_queue').doc().set({
                type:          r.type,
                channel:       'telegram',
                phone:         clientPhone,
                clientName:    clientName || '',
                message:       r.message,
                scheduledAt:   firebase.firestore.Timestamp.fromDate(r.scheduledAt),
                status:        'pending',
                appointmentId,
                isDemo:        false,
                createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch(e) { console.warn('scheduleReminder:', e.message); }
    }
};

// ── Schedule win-back notification ────────────────────────
window.scheduleWinBackNotification = async function(clientId, clientPhone, clientName, daysSince) {
    if (!window.companyCol || !clientPhone) return;
    try {
        // Check if already scheduled
        const existing = await window.companyCol('notification_queue')
            .where('clientId','==',clientId)
            .where('type','==','winback')
            .where('status','==','pending')
            .limit(1).get();
        if (!existing.empty) return; // already in queue

        await window.companyCol('notification_queue').doc().set({
            type:       'winback',
            channel:    'telegram',
            phone:      clientPhone,
            clientId,
            clientName: clientName || '',
            message:    `${clientName||'Клієнте'}, вітаємо! Вже ${daysSince} днів не бачились. Запишіться — для вас особлива пропозиція 🌸`,
            scheduledAt: firebase.firestore.FieldValue.serverTimestamp(),
            status:      'pending',
            isDemo:      false,
            createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch(e) { console.warn('scheduleWinBack:', e.message); }
};

// ── Notification queue admin panel ────────────────────────
window.initNotificationsPanel = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.companyCol) return;
    container.innerHTML = '<div style="padding:1rem;text-align:center;color:#9ca3af;font-size:.82rem;">Завантаження...</div>';

    try {
        const snap = await window.companyCol('notification_queue')
            .orderBy('scheduledAt','desc').limit(50).get();
        const items = snap.docs.map(d => ({ id:d.id, ...d.data() }));

        if (!items.length) {
            container.innerHTML = '<div style="padding:1rem;color:#9ca3af;font-size:.82rem;text-align:center;">Черга нагадувань порожня</div>';
            return;
        }

        const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const fmtDt = ts => ts?.toDate ? ts.toDate().toLocaleString('uk-UA') : '';
        const TYPE_LABELS = {
            'appointment_reminder_24h': '24г до запису',
            'appointment_reminder_2h':  '2г до запису',
            'winback':                  'Win-back',
        };
        const STATUS_COLORS = {
            pending: '#f59e0b',
            sent:    '#22c55e',
            failed:  '#ef4444',
        };

        const rows = items.map(n => `
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:.5rem .75rem;font-size:.8rem;">
                    <span style="background:#f0f9ff;color:#0369a1;padding:2px 7px;border-radius:5px;font-size:.72rem;">
                        ${TYPE_LABELS[n.type]||n.type}
                    </span>
                </td>
                <td style="padding:.5rem .75rem;font-size:.8rem;font-weight:500;">${esc(n.clientName||n.phone||'')}</td>
                <td style="padding:.5rem .75rem;font-size:.75rem;color:#525252;">${fmtDt(n.scheduledAt)}</td>
                <td style="padding:.5rem .75rem;">
                    <span style="color:${STATUS_COLORS[n.status]||'#525252'};font-size:.78rem;font-weight:600;">
                        ${n.status === 'pending' ? '⏳ Очікує' : n.status === 'sent' ? '✓ Надіслано' : '✗ Помилка'}
                    </span>
                </td>
                <td style="padding:.5rem .75rem;">
                    ${n.status === 'pending' ? `
                    <button onclick="window._cancelNotification('${n.id}')" 
                        style="padding:2px 8px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:5px;font-size:.72rem;cursor:pointer;">
                        Скасувати
                    </button>` : ''}
                </td>
            </tr>`).join('');

        const pending = items.filter(n => n.status === 'pending').length;
        const sent    = items.filter(n => n.status === 'sent').length;

        container.innerHTML = `
            <div style="display:flex;gap:.75rem;margin-bottom:.75rem;flex-wrap:wrap;">
                <div style="padding:.5rem .85rem;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:.8rem;">
                    <span style="font-weight:700;color:#d97706;">${pending}</span>
                    <span style="color:#92400e;margin-left:.3rem;">В черзі</span>
                </div>
                <div style="padding:.5rem .85rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:.8rem;">
                    <span style="font-weight:700;color:#16a34a;">${sent}</span>
                    <span style="color:#15803d;margin-left:.3rem;">Надіслано</span>
                </div>
                <div style="padding:.5rem .85rem;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:.75rem;color:#0369a1;flex:1;">
                    💡 Інтеграція: Telegram Bot / TurboSMS / Infobip
                </div>
            </div>
            <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
                    <thead><tr style="background:#f8fafc;">
                        <th style="padding:.5rem .75rem;text-align:left;font-weight:600;color:#374151;">Тип</th>
                        <th style="padding:.5rem .75rem;text-align:left;font-weight:600;color:#374151;">Клієнт</th>
                        <th style="padding:.5rem .75rem;text-align:left;font-weight:600;color:#374151;">Час відправки</th>
                        <th style="padding:.5rem .75rem;text-align:left;font-weight:600;color:#374151;">Статус</th>
                        <th style="padding:.5rem .75rem;"></th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    } catch(e) {
        container.innerHTML = `<div style="color:#ef4444;padding:1rem;font-size:.82rem;">Помилка: ${_notifEsc(e.message)}</div>`;
    }
};

window._cancelNotification = async function(notifId) {
    if (!confirm('Скасувати нагадування?')) return;
    try {
        await window.companyDoc('notification_queue', notifId).update({
            status: 'cancelled',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.showToast?.('Нагадування скасовано', 'info');
    } catch(e) { window.showToast?.('Помилка', 'error'); }
};

console.log('[103-notifications] loaded ✓');
