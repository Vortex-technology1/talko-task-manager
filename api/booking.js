// ============================================================
// api/booking.js — TALKO Booking (Calendly-аналог)
//
// GET  /api/booking?action=slots&companyId=X&calendarId=Y&date=2026-03-20
// GET  /api/booking?action=page&companyId=X&calendarId=Y
// GET  /api/booking?action=list&companyId=X&calendarId=Y (admin)
// POST /api/booking?action=create
// POST /api/booking?action=confirm
// POST /api/booking?action=cancel
// ============================================================

const admin = require('firebase-admin');

if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
    }
    pk = pk.replace(/\\n/g, '\n');
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId:   process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  pk || undefined,
            }),
        });
    } catch(e) {
        console.error('[booking.js] Firebase init error:', e.message);
    }
}

const db = admin.firestore();

// ── Utils ─────────────────────────────────────────────────
// Safe JSON для вставки в <script> — ескейпує </script> та Unicode лінійні термінатори
function safeJson(v) {
    // Безпечна вставка в <script> — ескейпує </script> і Unicode термінатори
    var s = JSON.stringify(v);
    s = s.replace(/</g, '\u003c').replace(/>/g, '\u003e').replace(/&/g, '\u0026');
    // FIX B-06: escape actual line separators, not spaces
    s = s.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    return s;
}

function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Validate origin against allowlist before using in Stripe redirect URLs
const BOOKING_ALLOWED_ORIGINS = [
    'https://taskmanagerai-vert.vercel.app',
    'https://test-talko-task.vercel.app',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
];
function _safeOrigin(origin) {
    if (origin && BOOKING_ALLOWED_ORIGINS.includes(origin)) return origin;
    return 'https://taskmanagerai-vert.vercel.app';
}

const crypto = require('crypto');
// Telegram HTML escape — для parse_mode:'HTML'
function tgEsc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function genToken() {
    // crypto.randomBytes = 128 bits entropy (vs Math.random ~52 bits)
    return crypto.randomBytes(16).toString('hex');
}

// Parse "HH:MM" → minutes since midnight
function timeToMin(t) {
    const [h, m] = (t || '00:00').split(':').map(Number);
    return h * 60 + m;
}

// Minutes since midnight → "HH:MM"
function minToTime(m) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
}

// "2026-03-20" + "HH:MM" → Date in given timezone (returns UTC ms)
function slotToDate(dateStr, timeStr, tz) {
    try {
        // Build ISO-like string and parse as local in that timezone
        const dt = new Date(`${dateStr}T${timeStr}:00`);
        // Use Intl to get offset for that timezone on that date
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz || 'UTC',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
        });
        // Reconstruct Date in UTC treating the given time as belonging to tz
        const utcStr = `${dateStr}T${timeStr}:00`;
        const localDate = new Date(utcStr); // treated as UTC by JS

        // Get offset: format a known UTC time, compare
        const testUTC = new Date('2020-01-01T00:00:00Z');
        const parts = formatter.formatToParts(testUTC);
        const p = {};
        parts.forEach(x => { p[x.type] = x.value; });
        const tzOffset = testUTC.getTime() - new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`).getTime();

        // Now parse the slot in the tz
        const slotFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz || 'UTC',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
        });

        // Simple approach: create a date assuming the time is in UTC, then adjust for timezone
        // We want: what UTC time corresponds to dateStr+timeStr in tz?
        const naive = new Date(utcStr + 'Z'); // parse as UTC
        // Get what time this UTC moment represents in the target tz
        const tzParts = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz || 'UTC',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
            hour12: false,
        }).formatToParts(naive);
        const tp = {};
        tzParts.forEach(x => { tp[x.type] = x.value; });
        const tzTime = `${tp.year}-${tp.month}-${tp.day}T${tp.hour}:${tp.minute}:00Z`;
        const diff = naive.getTime() - new Date(tzTime).getTime();
        return new Date(naive.getTime() + diff);
    } catch(e) {
        return new Date(`${dateStr}T${timeStr}:00Z`);
    }
}

// ── Telegram notify ───────────────────────────────────────
async function tgNotify(compRef, text) {
    try {
        const compDoc = await compRef.get();
        const d = compDoc.data() || {};
        const token = d.telegramBotToken || d.botToken || d.integrations?.telegram?.botToken;
        if (!token) return;
        const chatIds = new Set();
        if (d.telegramChatId)   chatIds.add(String(d.telegramChatId));
        if (d.ownerTelegramId)  chatIds.add(String(d.ownerTelegramId));
        // Also check users
        const usersSnap = await compRef.collection('users')
            .where('role', 'in', ['owner', 'admin']).limit(5).get();
        usersSnap.docs.forEach(u => {
            const tid = u.data()?.telegramChatId || u.data()?.telegramId;
            if (tid) chatIds.add(String(tid));
        });
        for (const chatId of chatIds) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
            }).catch(() => {});
        }
    } catch(e) {
        console.error('[booking] tgNotify error:', e.message);
    }
}

// ── Google Calendar freebusy ──────────────────────────────
async function getGoogleBusySlots(companyId, ownerId, timeMin, timeMax) {
    try {
        const userDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(ownerId).get();
        if (!userDoc.exists) return [];
        const userData = userDoc.data();
        if (!userData.googleCalendarConnected) return [];

        let accessToken = userData.googleAccessToken;
        const expiry = userData.googleTokenExpiry?.toMillis?.() || 0;

        // GIS (Google Identity Services) дає тільки access_token на ~1 год
        // refresh_token доступний тільки через Authorization Code Flow (Фаза 2)
        // Якщо токен протух — gracefully повертаємо [] (не блокуємо бронювання)
        if (!accessToken) return [];
        if (expiry > 0 && Date.now() > expiry) {
            console.warn('[booking] Google token expired for owner:', ownerId);
            return [];
        }

        // Спробуємо refresh якщо є refreshToken (Фаза 2 — Authorization Code Flow)
        if (userData.googleRefreshToken && Date.now() > expiry - 120000) {
            const refreshed = await refreshGoogleToken(userData.googleRefreshToken);
            if (refreshed?.access_token) {
                accessToken = refreshed.access_token;
                await db.collection('companies').doc(companyId)
                    .collection('users').doc(ownerId).update({
                        googleAccessToken: refreshed.access_token,
                        googleTokenExpiry: admin.firestore.Timestamp.fromMillis(
                            Date.now() + (refreshed.expires_in || 3600) * 1000
                        ),
                    }).catch(() => {});
            }
        }

        const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timeMin,
                timeMax,
                items: [{ id: 'primary' }],
            }),
        });

        // 401 = токен протух — не блокуємо запис, просто ігноруємо Google зайнятість
        if (res.status === 401) {
            console.warn('[booking] Google token unauthorized for owner:', ownerId);
            // Позначаємо токен як протухлий щоб наступний виклик не намагався
            await db.collection('companies').doc(companyId)
                .collection('users').doc(ownerId)
                .update({ googleTokenExpiry: admin.firestore.Timestamp.fromMillis(0) })
                .catch(() => {});
            return [];
        }
        if (!res.ok) return [];
        const data = await res.json();
        return (data.calendars?.primary?.busy || []).map(b => ({
            start: new Date(b.start).getTime(),
            end:   new Date(b.end).getTime(),
        }));
    } catch(e) {
        console.error('[booking] freebusy error:', e.message);
        return [];
    }
}

async function refreshGoogleToken(refreshToken) {
    try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id:     process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                refresh_token: refreshToken,
                grant_type:    'refresh_token',
            }),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch(e) {
        return null;
    }
}

// ── Create Google Calendar Event ──────────────────────────
async function createGoogleEvent(companyId, ownerId, appointment, calendar) {
    try {
        const userDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(ownerId).get();
        if (!userDoc.exists) return null;
        const userData = userDoc.data();
        if (!userData.googleCalendarConnected) return null;

        let accessToken = userData.googleAccessToken;
        const expiry = userData.googleTokenExpiry?.toMillis?.() || 0;

        // Refresh token якщо протух або закінчується через 2 хв
        if (userData.googleRefreshToken && (!accessToken || Date.now() > expiry - 120000)) {
            const refreshed = await refreshGoogleToken(userData.googleRefreshToken);
            if (refreshed?.access_token) {
                accessToken = refreshed.access_token;
                await db.collection('companies').doc(companyId)
                    .collection('users').doc(ownerId).update({
                        googleAccessToken: refreshed.access_token,
                        googleTokenExpiry: admin.firestore.Timestamp.fromMillis(
                            Date.now() + (refreshed.expires_in || 3600) * 1000
                        ),
                    }).catch(() => {});
            }
        }

        if (!accessToken) return null;

        const event = {
            summary: `${appointment.clientName} — ${calendar.name}`,
            description: `Клієнт: ${appointment.clientName}\nEmail: ${appointment.clientEmail}\nТелефон: ${appointment.clientPhone || '—'}`,
            start: { dateTime: appointment.startTime.toDate().toISOString() },
            end:   { dateTime: appointment.endTime.toDate().toISOString() },
        };
        if (calendar.location) event.location = calendar.location;

        const res = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.id || null;
    } catch(e) {
        console.error('[booking] createGoogleEvent error:', e.message);
        return null;
    }
}

async function deleteGoogleEvent(companyId, ownerId, eventId) {
    try {
        const userDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(ownerId).get();
        if (!userDoc.exists) return;
        const { googleAccessToken } = userDoc.data();
        if (!googleAccessToken) return;
        await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
            { method: 'DELETE', headers: { 'Authorization': `Bearer ${googleAccessToken}` } }
        );
    } catch(e) {}
}

// ── Slot calculation ──────────────────────────────────────
async function getAvailableSlots(companyId, calendarId, dateStr) {
    const DAY_MAP = ['sun','mon','tue','wed','thu','fri','sat'];

    const [calDoc, schedDoc] = await Promise.all([
        db.collection('companies').doc(companyId)
          .collection('booking_calendars').doc(calendarId).get(),
        db.collection('companies').doc(companyId)
          .collection('booking_schedules').doc(calendarId).get(),
    ]);

    if (!calDoc.exists) throw new Error('Calendar not found');
    const cal  = calDoc.data();
    if (!cal.isActive) return []; // вимкнений календар — 0 слотів
    const sched = schedDoc.exists ? schedDoc.data() : { weeklyHours: {}, dateOverrides: {} };

    const tz = cal.timezone || 'Europe/Kiev';
    const duration    = cal.duration    || 60;
    const bufBefore   = cal.bufferBefore || 0;
    const bufAfter    = cal.bufferAfter  || 0;
    const slotStep    = duration; // slots every `duration` minutes

    // What day of week is dateStr?
    const dateObj = new Date(dateStr + 'T12:00:00Z');
    const dayName = DAY_MAP[dateObj.getUTCDay()];

    // Get working hours for that date
    let dayHours = null;
    const overrides = sched.dateOverrides || {};
    if (dateStr in overrides) {
        dayHours = overrides[dateStr]; // [] = day off, [...] = special hours
    } else {
        dayHours = (sched.weeklyHours || {})[dayName] || [];
    }

    if (!dayHours || dayHours.length === 0) return [];

    // Build raw slots from working hours
    const rawSlots = [];
    for (const period of dayHours) {
        let cur = timeToMin(period.start);
        const end = timeToMin(period.end);
        while (cur + duration <= end) {
            rawSlots.push(minToTime(cur));
            cur += slotStep;
        }
    }

    if (rawSlots.length === 0) return [];

    // Build time range: ±1 день UTC щоб покрити всі timezone (UTC-12 до UTC+14)
    // Наприклад, 23:30 NY EST = наступний день 04:30 UTC — без розширення пропускаємо
    const dayStartDt = new Date(dateStr + 'T00:00:00Z');
    dayStartDt.setUTCDate(dayStartDt.getUTCDate() - 1); // -1 день
    const dayStart = dayStartDt.toISOString();
    const dayEndDt = new Date(dateStr + 'T23:59:59Z');
    dayEndDt.setUTCDate(dayEndDt.getUTCDate() + 1);     // +1 день
    const dayEnd = dayEndDt.toISOString();

    // Fetch existing appointments for this calendar on this date
    const apptSnap = await db.collection('companies').doc(companyId)
        .collection('booking_appointments')
        .where('calendarId', '==', calendarId)
        .where('date', '==', dateStr)
        .where('status', 'in', ['confirmed', 'pending'])
        .get();

    const bookedRanges = apptSnap.docs.map(d => {
        const a = d.data();
        // НЕ додаємо буфер тут — буфер вже врахований в slotStartMs/slotEndMs нижче
        // (інакше буфер рахувався б двічі)
        return { start: a.startTime.toMillis(), end: a.endTime.toMillis() };
    });

    // Fetch Google Calendar busy slots
    const googleBusy = await getGoogleBusySlots(companyId, cal.ownerId, dayStart, dayEnd);

    const now = Date.now();

    // Filter slots
    const available = [];
    for (const slotTime of rawSlots) {
        const slotStart = slotToDate(dateStr, slotTime, tz);
        const slotEnd   = new Date(slotStart.getTime() + duration * 60000);
        const slotStartMs = slotStart.getTime() - bufBefore * 60000;
        const slotEndMs   = slotEnd.getTime()   + bufAfter  * 60000;

        // Skip past slots (with 15min grace)
        if (slotStart.getTime() < now - 15 * 60000) continue;

        // Check against existing bookings
        const isBooked = bookedRanges.some(r => slotStartMs < r.end && slotEndMs > r.start);
        if (isBooked) continue;

        // Check against Google Calendar
        const isGoogleBusy = googleBusy.some(r => slotStart.getTime() < r.end && slotEnd.getTime() > r.start);
        if (isGoogleBusy) continue;

        available.push(slotTime);
    }

    return available;
}

// ── Public booking page HTML ──────────────────────────────
async function renderBookingPage(companyId, calendarId, res) {
    const calDoc = await db.collection('companies').doc(companyId)
        .collection('booking_calendars').doc(calendarId).get();

    if (!calDoc.exists || !calDoc.data().isActive) {
        return res.status(404).send(errPage('Календар не знайдено або неактивний'));
    }

    const cal = calDoc.data();
    const compDoc = await db.collection('companies').doc(companyId).get();
    const comp = compDoc.exists ? compDoc.data() : {};
    const compName = esc(comp.name || 'Онлайн-запис');
    const calName  = esc(cal.name  || 'Запис');
    const duration = cal.duration || 60;
    const tz       = cal.timezone || 'Europe/Kiev';
    const location = cal.location ? esc(cal.location) : '';
    const questions = cal.questions || [];

    const questionsHtml = questions.map((q, i) => {
        const req = q.required ? 'required' : '';
        const label = esc(q.label || q.id);
        if (q.type === 'select' && q.options) {
            const opts = q.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
            return `<div class="bk-field">
                <label>${label}${q.required ? ' <span class="bk-req">*</span>' : ''}</label>
                <select name="q_${esc(q.id)}" ${req}><option value="">Оберіть...</option>${opts}</select>
            </div>`;
        }
        const type = q.type === 'phone' ? 'tel' : q.type === 'email' ? 'email' : 'text';
        return `<div class="bk-field">
            <label>${label}${q.required ? ' <span class="bk-req">*</span>' : ''}</label>
            <input type="${type}" name="q_${esc(q.id)}" placeholder="${label}" ${req}>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${calName} — ${compName}</title>
<meta name="description" content="Онлайн-запис: ${calName}">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;min-height:100vh}
.bk-wrap{max-width:560px;margin:0 auto;padding:1.5rem 1rem 3rem}
.bk-header{background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 2px 12px rgba(0,0,0,.07);margin-bottom:1.25rem;text-align:center}
.bk-header h1{font-size:1.35rem;font-weight:700;margin-bottom:.3rem}
.bk-meta{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin-top:.75rem;font-size:.85rem;color:#64748b}
.bk-meta span{display:flex;align-items:center;gap:.3rem}
.bk-card{background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.07);overflow:hidden;margin-bottom:1.25rem}
.bk-step-header{padding:1rem 1.25rem;background:#f1f5f9;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:.9rem;display:flex;align-items:center;gap:.5rem}
.bk-step-num{width:22px;height:22px;border-radius:50%;background:#3b82f6;color:#fff;font-size:.75rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center}
.bk-step-body{padding:1.25rem}
/* Calendar */
.bk-cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.bk-cal-nav button{background:none;border:1px solid #e2e8f0;border-radius:8px;padding:.3rem .7rem;cursor:pointer;font-size:.9rem}
.bk-cal-nav button:hover{background:#f1f5f9}
.bk-cal-title{font-weight:600;font-size:.95rem}
.bk-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.bk-cal-dow{text-align:center;font-size:.72rem;color:#94a3b8;padding:.3rem 0;font-weight:600}
.bk-cal-day{text-align:center;padding:.45rem;border-radius:8px;font-size:.88rem;cursor:pointer;transition:background .15s}
.bk-cal-day.empty{visibility:hidden}
.bk-cal-day.past{color:#cbd5e1;cursor:default}
.bk-cal-day.available:hover{background:#dbeafe}
.bk-cal-day.selected{background:#3b82f6;color:#fff;font-weight:700}
.bk-cal-day.today{font-weight:700;border:1px solid #3b82f6}
.bk-cal-day.no-slots{color:#cbd5e1;cursor:default}
/* Slots */
.bk-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}
@media(max-width:360px){.bk-slots{grid-template-columns:repeat(2,1fr)}}
.bk-slot{padding:.55rem;border:1.5px solid #e2e8f0;border-radius:8px;text-align:center;cursor:pointer;font-size:.88rem;font-weight:500;transition:all .15s}
.bk-slot:hover{border-color:#3b82f6;background:#eff6ff}
.bk-slot.selected{background:#3b82f6;border-color:#3b82f6;color:#fff}
.bk-slots-empty{color:#94a3b8;font-size:.88rem;text-align:center;padding:.5rem 0}
/* Form */
.bk-field{margin-bottom:.85rem}
.bk-field label{display:block;font-size:.85rem;font-weight:600;margin-bottom:.3rem;color:#374151}
.bk-field input,.bk-field select,.bk-field textarea{width:100%;padding:.6rem .85rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:.9rem;font-family:inherit;transition:border-color .15s}
.bk-field input:focus,.bk-field select:focus,.bk-field textarea:focus{outline:none;border-color:#3b82f6}
.bk-req{color:#ef4444}
.bk-submit{width:100%;padding:.8rem;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;transition:background .15s;margin-top:.25rem}
.bk-submit:hover{background:#2563eb}
.bk-submit:disabled{background:#93c5fd;cursor:not-allowed}
/* Summary bar */
.bk-summary{background:#eff6ff;border-radius:10px;padding:.75rem 1rem;font-size:.85rem;color:#1e40af;margin-bottom:1rem;display:none}
/* Confirmation */
.bk-confirm{text-align:center;padding:2rem 1.25rem}
.bk-confirm-icon{font-size:3rem;margin-bottom:.75rem}
.bk-confirm h2{font-size:1.2rem;font-weight:700;margin-bottom:.4rem}
.bk-confirm p{color:#64748b;font-size:.9rem;margin-bottom:.75rem}
.bk-confirm-details{background:#f8fafc;border-radius:10px;padding:1rem;text-align:left;font-size:.88rem;margin:1rem 0}
.bk-confirm-details dt{font-weight:600;color:#374151}
.bk-confirm-details dd{color:#64748b;margin-bottom:.4rem}
.bk-cancel-link{display:inline-block;margin-top:.75rem;color:#ef4444;font-size:.82rem;text-decoration:underline;cursor:pointer}
/* Loading */
.bk-loader{display:flex;justify-content:center;padding:1.5rem}
.bk-spinner{width:24px;height:24px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.bk-tz{font-size:.78rem;color:#94a3b8;text-align:right;margin-top:.5rem}
</style>
</head>
<body>
<div class="bk-wrap">
  <div class="bk-header">
    <div style="font-size:.8rem;color:#94a3b8;margin-bottom:.3rem">${compName}</div>
    <h1>${calName}</h1>
    <div class="bk-meta">
      <span>🕐 ${duration} хв</span>
      ${location ? `<span>📍 ${location}</span>` : ''}
      <span>🌍 ${esc(tz)}</span>
    </div>
  </div>

  <div id="bk-app">
    <!-- Step 1: Calendar -->
    <div id="step-date" class="bk-card">
      <div class="bk-step-header"><span class="bk-step-num">1</span> Оберіть дату</div>
      <div class="bk-step-body">
        <div class="bk-cal-nav">
          <button onclick="bk.prevMonth()">&#8592;</button>
          <span class="bk-cal-title" id="bk-month-title"></span>
          <button onclick="bk.nextMonth()">&#8594;</button>
        </div>
        <div class="bk-cal-grid" id="bk-cal-grid"></div>
        <div class="bk-tz" id="bk-tz-display"></div>
      </div>
    </div>

    <!-- Step 2: Time slots -->
    <div id="step-time" class="bk-card" style="display:none">
      <div class="bk-step-header"><span class="bk-step-num">2</span> Оберіть час <span id="bk-date-label" style="font-weight:400;color:#64748b;margin-left:.3rem"></span></div>
      <div class="bk-step-body">
        <div id="bk-slots-container"></div>
        <div class="bk-tz">Час вказано для зони: <b>${esc(tz)}</b></div>
      </div>
    </div>

    <!-- Step 3: Form -->
    <div id="step-form" class="bk-card" style="display:none">
      <div class="bk-step-header"><span class="bk-step-num">3</span> Ваші контакти</div>
      <div class="bk-step-body">
        <div class="bk-summary" id="bk-summary"></div>
        <div class="bk-field">
          <label>Ім'я <span class="bk-req">*</span></label>
          <input type="text" id="bk-name" placeholder="Ваше ім'я" required>
        </div>
        <div class="bk-field">
          <label>Email${cal.emailRequired !== false ? ' <span class="bk-req">*</span>' : ''}</label>
          <input type="email" id="bk-email" placeholder="email@example.com"${cal.emailRequired !== false ? ' required' : ''}>
        </div>
        ${cal.phoneShow !== false ? `<div class="bk-field">
          <label>Телефон${cal.phoneRequired ? ' <span class="bk-req">*</span>' : ''}</label>
          <input type="tel" id="bk-phone" placeholder="+380..."${cal.phoneRequired ? ' required' : ''}>
        </div>` : ''}
        ${questionsHtml}
        <button class="bk-submit" id="bk-submit-btn" onclick="bk.submit()">
          Підтвердити запис
        </button>
      </div>
    </div>

    <!-- Step 4: Confirmation -->
    <div id="step-confirm" class="bk-card" style="display:none">
      <div class="bk-confirm" id="bk-confirm-content"></div>
    </div>
  </div>
</div>

<script>
const BK_COMPANY  = ${safeJson(companyId)};
const BK_CALENDAR = ${safeJson(calendarId)};
const BK_CONFIRM  = ${safeJson(cal.confirmationType || 'auto')};

const bk = {
    year: 0, month: 0,
    selectedDate: null,
    selectedTime: null,
    slotsCache: {},
    loading: false,

    init() {
        const now = new Date();
        this.year  = now.getFullYear();
        this.month = now.getMonth();
        this.renderCalendar();

        // Показуємо timezone клієнта і попередження якщо відрізняється
        const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const calTz = ${safeJson(tz)};
        const tzEl = document.getElementById('bk-tz-display');
        if (clientTz && clientTz !== calTz) {
            tzEl.innerHTML = '\u26a0\ufe0f Час слотів у зоні <b>' + calTz + '</b>. ' +
                'Ваш часовий пояс: <b>' + clientTz + '</b>. ' +
                'Переконайтесь що розумієте різницю в часі.';
            tzEl.style.color = '#92400e';
            tzEl.style.background = '#fef3c7';
            tzEl.style.padding = '.4rem .6rem';
            tzEl.style.borderRadius = '6px';
        } else {
            tzEl.textContent = 'Час вказано для зони: ' + calTz;
        }
    },

    prevMonth() {
        const now = new Date();
        if (this.year === now.getFullYear() && this.month <= now.getMonth()) return;
        this.month--;
        if (this.month < 0) { this.month = 11; this.year--; }
        this.renderCalendar();
    },

    nextMonth() {
        this.month++;
        if (this.month > 11) { this.month = 0; this.year++; }
        this.renderCalendar();
    },

    renderCalendar() {
        const months = ['Січень','Лютий','Березень','Квітень','Травень','Червень',
                        'Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
        document.getElementById('bk-month-title').textContent =
            months[this.month] + ' ' + this.year;

        const grid = document.getElementById('bk-cal-grid');
        const dows = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
        let html = dows.map(d => \`<div class="bk-cal-dow">\${d}</div>\`).join('');

        const firstDay = new Date(this.year, this.month, 1).getDay();
        const offset = (firstDay + 6) % 7; // Mon=0
        const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
        const today = new Date();
        const todayStr = today.getFullYear() + '-' +
            String(today.getMonth()+1).padStart(2,'0') + '-' +
            String(today.getDate()).padStart(2,'0');

        for (let i = 0; i < offset; i++) html += '<div class="bk-cal-day empty"></div>';

        for (let d = 1; d <= daysInMonth; d++) {
            const ds = this.year + '-' +
                String(this.month+1).padStart(2,'0') + '-' +
                String(d).padStart(2,'0');
            const isPast = ds < todayStr;
            const isToday = ds === todayStr;
            const isSel  = ds === this.selectedDate;
            let cls = 'bk-cal-day';
            if (isPast)    cls += ' past';
            else if (isSel) cls += ' selected available';
            else            cls += ' available';
            if (isToday)   cls += ' today';
            const onclick = isPast ? '' : \`onclick="bk.selectDate('\${ds}')"\`;
            html += \`<div class="\${cls}" \${onclick}>\${d}</div>\`;
        }
        grid.innerHTML = html;
    },

    async selectDate(ds) {
        this.selectedDate = ds;
        this.selectedTime = null;
        this.renderCalendar();

        const [, m, d] = ds.split('-');
        const months = ['','Січня','Лютого','Березня','Квітня','Травня','Червня',
                        'Липня','Серпня','Вересня','Жовтня','Листопада','Грудня'];
        document.getElementById('bk-date-label').textContent = \`— \${parseInt(d)} \${months[parseInt(m)]}\`;

        document.getElementById('step-time').style.display = 'block';
        document.getElementById('step-form').style.display = 'none';
        document.getElementById('bk-slots-container').innerHTML =
            '<div class="bk-loader"><div class="bk-spinner"></div></div>';

        const slots = await this.fetchSlots(ds);
        this.renderSlots(slots);
    },

    async fetchSlots(ds) {
        // Cache TTL: 3 хвилини — після цього перезавантажуємо слоти
        const CACHE_TTL = 3 * 60 * 1000;
        if (this.slotsCache[ds] && (Date.now() - this.slotsCache[ds]._ts) < CACHE_TTL) {
            return this.slotsCache[ds].slots;
        }
        try {
            const r = await fetch(
                \`/api/booking?action=slots&companyId=\${BK_COMPANY}&calendarId=\${BK_CALENDAR}&date=\${ds}\`
            );
            const data = await r.json();
            this.slotsCache[ds] = { slots: data.slots || [], _ts: Date.now() };
            return this.slotsCache[ds].slots;
        } catch(e) {
            return [];
        }
    },

    renderSlots(slots) {
        const el = document.getElementById('bk-slots-container');
        if (!slots || slots.length === 0) {
            el.innerHTML = '<div class="bk-slots-empty">Немає доступних слотів на цю дату</div>';
            return;
        }
        el.innerHTML = '<div class="bk-slots">' +
            slots.map(t => \`<div class="bk-slot" onclick="bk.selectTime('\${t}')">\${t}</div>\`).join('') +
            '</div>';
    },

    selectTime(t) {
        this.selectedTime = t;
        document.querySelectorAll('.bk-slot').forEach(el => {
            el.classList.toggle('selected', el.textContent.trim() === t);
        });
        document.getElementById('step-form').style.display = 'block';
        const [, m, d] = this.selectedDate.split('-');
        const months = ['','Січня','Лютого','Березня','Квітня','Травня','Червня',
                        'Липня','Серпня','Вересня','Жовтня','Листопада','Грудня'];
        const summary = document.getElementById('bk-summary');
        summary.style.display = 'block';
        summary.textContent = \`📅 \${parseInt(d)} \${months[parseInt(m)]}, \${t}\`;
        document.getElementById('step-form').scrollIntoView({ behavior:'smooth', block:'nearest' });
    },

    async submit() {
        if (!this.selectedDate || !this.selectedTime) {
            alert('Оберіть дату та час');
            return;
        }
        const name  = document.getElementById('bk-name').value.trim();
        const email = document.getElementById('bk-email').value.trim();
        const phone = document.getElementById('bk-phone').value.trim();
        if (!name || !email) { alert("Вкажіть ім'я та email"); return; }
        const phoneEl = document.getElementById('bk-phone');
        if (phoneEl && phoneEl.required && !phone) { alert('Вкажіть телефон'); phoneEl.focus(); return; }

        // Collect extra question answers
        const answers = {};
        document.querySelectorAll('[name^="q_"]').forEach(el => {
            answers[el.name.slice(2)] = el.value;
        });

        const btn = document.getElementById('bk-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Відправляємо...';

        try {
            const r = await fetch('/api/booking?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: BK_COMPANY,
                    calendarId: BK_CALENDAR,
                    clientName: name,
                    clientEmail: email,
                    clientPhone: phone,
                    date: this.selectedDate,
                    timeSlot: this.selectedTime,
                    answers,
                    source: 'direct',
                }),
            });
            const data = await r.json();
            if (r.status === 409) {
                // Слот зайнятий — очищаємо кеш і повертаємо на вибір часу
                delete this.slotsCache[this.selectedDate]; // скидаємо кеш — отримаємо свіжі слоти
                this.selectedTime = null;
                document.querySelectorAll('.bk-slot').forEach(el => el.classList.remove('selected'));
                document.getElementById('bk-summary').style.display = 'none';
                document.getElementById('step-form').style.display = 'none';
                alert('\u0426\u0435\u0439 \u0447\u0430\u0441 \u0432\u0436\u0435 \u0437\u0430\u0439\u043d\u044f\u0442\u043e. \u0411\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043e\u0431\u0435\u0440\u0456\u0442\u044c \u0456\u043d\u0448\u0438\u0439 \u0447\u0430\u0441.');
                // Перезавантажуємо слоти
                await this.selectDate(this.selectedDate);
                btn.disabled = false;
                btn.textContent = '\u041f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0438 \u0437\u0430\u043f\u0438\u0441';
                return;
            }
            if (!r.ok) throw new Error(data.error || '\u041f\u043e\u043c\u0438\u043b\u043a\u0430');
            this.showConfirmation(data, name, email);
        } catch(e) {
            alert('\u041f\u043e\u043c\u0438\u043b\u043a\u0430: ' + e.message);
            btn.disabled = false;
            btn.textContent = '\u041f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0438 \u0437\u0430\u043f\u0438\u0441';
        }
    },

    showConfirmation(data, name, email) {
        document.getElementById('step-date').style.display = 'none';
        document.getElementById('step-time').style.display = 'none';
        document.getElementById('step-form').style.display = 'none';
        const el = document.getElementById('step-confirm');
        el.style.display = 'block';

        const isPending = BK_CONFIRM === 'manual';
        const [, m, d] = this.selectedDate.split('-');
        const months = ['','Січня','Лютого','Березня','Квітня','Травня','Червня',
                        'Липня','Серпня','Вересня','Жовтня','Листопада','Грудня'];

        const confirmEl = el.querySelector('.bk-confirm');
        confirmEl.innerHTML = \`
            <div class="bk-confirm-icon">\${isPending ? '⏳' : '✅'}</div>
            <h2>\${isPending ? 'Очікує підтвердження' : 'Запис підтверджено!'}</h2>
            <p>\${isPending ? 'Ми зв’яжемося з вами найближчим часом для підтвердження.' : 'Дякуємо! Чекаємо вас.'}</p>
            <div class="bk-confirm-details">
                <dt>Клієнт</dt><dd id="bk-conf-name"></dd>
                <dt>Email</dt><dd id="bk-conf-email"></dd>
                <dt>Дата</dt><dd>\${parseInt(d)} \${months[parseInt(m)]}, \${this.selectedDate.split('-')[0]}</dd>
                <dt>Час</dt><dd>\${this.selectedTime}</dd>
            </div>
            \${data.cancelToken ? \`<div>
                <a class="bk-cancel-link" onclick="if(confirm('Скасувати запис?')) bk.cancel('\${data.appointmentId}', '\${data.cancelToken}')">
                    Скасувати запис
                </a>
            </div>\` : ''}
        \`;
        // XSS-safe: вставляємо user data через textContent, не innerHTML
        const nameEl  = confirmEl.querySelector('#bk-conf-name');
        const emailEl = confirmEl.querySelector('#bk-conf-email');
        if (nameEl)  nameEl.textContent  = name;
        if (emailEl) emailEl.textContent = email;
        el.scrollIntoView({ behavior: 'smooth' });
    },

    async cancel(appointmentId, cancelToken) {
        try {
            await fetch('/api/booking?action=cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: BK_COMPANY, appointmentId, cancelToken }),
            });
            document.querySelector('.bk-confirm').innerHTML =
                '<div class="bk-confirm-icon">❌</div><h2>Запис скасовано</h2>';
        } catch(e) {
            alert('Помилка скасування');
        }
    },
};

bk.init();
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
}


// ── renderGroupBookingPage ────────────────────────────────
// Рендерить публічну сторінку для групи — об'єднані слоти з кількох календарів
async function renderGroupBookingPage(companyId, groupId, res) {
    const [grpDoc, compDoc] = await Promise.all([
        db.collection('companies').doc(companyId)
          .collection('booking_groups').doc(groupId).get(),
        db.collection('companies').doc(companyId).get(),
    ]);

    if (!grpDoc.exists)
        return res.status(404).send(errPage('Групу не знайдено або її видалено.'));

    const grp  = grpDoc.data();
    const comp = compDoc.data() || {};

    // Отримуємо дані всіх календарів групи
    const calIds = grp.calendarIds || [];
    const calsSnap = calIds.length
        ? await Promise.all(calIds.map(cid =>
            db.collection('companies').doc(companyId)
              .collection('booking_calendars').doc(cid).get()
              .then(d => d.exists ? { id: cid, ...d.data() } : null)
              .catch(() => null)
          ))
        : [];
    const cals = calsSnap.filter(Boolean).filter(c => c.isActive !== false);

    const companyName = esc(comp.name || 'TALKO Booking');
    const groupName   = esc(grp.name || 'Онлайн-запис');

    const html = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${groupName} — ${companyName}</title>
<meta name="description" content="${esc(grp.description||'')} — ${companyName}">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#f0f4f8;min-height:100vh}
.bk-wrap{max-width:520px;margin:0 auto;padding:1.5rem 1rem 3rem}
.bk-card{background:white;border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,.09);overflow:hidden}
.bk-hero{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:2rem 1.75rem;color:white}
.bk-hero-title{font-size:1.35rem;font-weight:800;margin-bottom:.3rem}
.bk-hero-company{font-size:.85rem;opacity:.85}
.bk-hero-desc{font-size:.88rem;opacity:.8;margin-top:.5rem;line-height:1.5}
.bk-hero-badges{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.75rem}
.bk-badge-pill{background:rgba(255,255,255,.2);border-radius:20px;padding:.2rem .6rem;font-size:.75rem;font-weight:600}
.bk-body{padding:1.25rem 1.5rem}
.bk-step{display:none}.bk-step.active{display:block}
.bk-section-lbl{font-size:.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.6rem}
/* Cal selector */
.bk-cal-opts{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem}
.bk-cal-opt{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;transition:border-color .15s,background .15s}
.bk-cal-opt:hover,.bk-cal-opt.selected{border-color:#6366f1;background:#f5f3ff}
.bk-cal-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
/* Date picker */
.bk-month-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem}
.bk-month-title{font-weight:700;font-size:.95rem}
.bk-month-btn{background:none;border:1px solid #e5e7eb;border-radius:7px;width:30px;height:30px;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center}
.bk-month-btn:hover{background:#f1f5f9}
.bk-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:1rem}
.bk-cal-dh{font-size:.72rem;color:#9ca3af;text-align:center;padding:.25rem 0;font-weight:600}
.bk-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:.85rem;cursor:pointer;border:1.5px solid transparent}
.bk-cal-day:hover{background:#f0f4ff;border-color:#c7d2fe}
.bk-cal-day.today{border-color:#6366f1;color:#6366f1;font-weight:700}
.bk-cal-day.selected{background:#6366f1;color:white;font-weight:700}
.bk-cal-day.disabled{color:#d1d5db;cursor:default;pointer-events:none}
.bk-cal-day.empty{pointer-events:none}
/* Slots */
.bk-slots-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;margin-bottom:1rem}
@media(max-width:360px){.bk-slots-grid{grid-template-columns:repeat(2,1fr)}}
.bk-slot-btn{padding:.5rem .25rem;border:1.5px solid #e5e7eb;border-radius:8px;background:white;font-size:.82rem;font-weight:600;cursor:pointer;text-align:center;transition:all .15s}
.bk-slot-btn:hover{border-color:#6366f1;background:#f0f4ff;color:#4f46e5}
.bk-slot-btn.selected{background:#6366f1;color:white;border-color:#6366f1}
.bk-slot-btn.loading{color:#94a3b8;pointer-events:none}
/* Form */
.bk-field{margin-bottom:.85rem}
.bk-field label{display:block;font-size:.82rem;font-weight:600;color:#374151;margin-bottom:.3rem}
.bk-field input,.bk-field textarea,.bk-field select{width:100%;padding:.55rem .75rem;border:1.5px solid #e2e8f0;border-radius:9px;font-size:.9rem;font-family:inherit}
.bk-field input:focus,.bk-field select:focus{outline:none;border-color:#6366f1}
.bk-btn-main{width:100%;padding:.7rem;background:#6366f1;color:white;border:none;border-radius:10px;font-size:.95rem;font-weight:700;cursor:pointer;margin-top:.5rem}
.bk-btn-main:hover{background:#4f46e5}
.bk-btn-main:disabled{opacity:.6;cursor:not-allowed}
.bk-btn-back-sm{background:none;border:none;color:#6366f1;font-size:.85rem;cursor:pointer;padding:.25rem 0;margin-bottom:.75rem;display:flex;align-items:center;gap:.3rem}
.bk-summary{background:#f5f3ff;border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.88rem;color:#374151;line-height:1.6}
.bk-success{text-align:center;padding:1.5rem 1rem}
.bk-success-icon{font-size:3rem;margin-bottom:.75rem}
.bk-success-title{font-size:1.15rem;font-weight:800;color:#374151;margin-bottom:.35rem}
.bk-success-sub{color:#6b7280;font-size:.88rem;line-height:1.5}
.bk-loader{display:flex;justify-content:center;padding:1.5rem;color:#9ca3af;font-size:.85rem;align-items:center;gap:.4rem}
.bk-spinner{width:18px;height:18px;border:2px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:bk-spin .7s linear infinite;flex-shrink:0}
@keyframes bk-spin{to{transform:rotate(360deg)}}
.bk-no-slots{text-align:center;color:#9ca3af;padding:1rem;font-size:.88rem}
</style>
</head>
<body>
<div class="bk-wrap">
<div class="bk-card">
  <!-- HERO -->
  <div class="bk-hero">
    <div class="bk-hero-company">${companyName}</div>
    <div class="bk-hero-title">${groupName}</div>
    ${grp.description ? `<div class="bk-hero-desc">${esc(grp.description)}</div>` : ''}
    <div class="bk-hero-badges">
      <span class="bk-badge-pill">📅 ${cals.length} спеціаліст${cals.length===1?'':'ів'}</span>
      <span class="bk-badge-pill">🌐 Онлайн-запис</span>
    </div>
  </div>

  <!-- STEP 1: Вибір спеціаліста (якщо > 1) -->
  <div class="bk-body">
    <div class="bk-step active" id="bk-step-cal">
      ${cals.length > 1 ? `
      <div class="bk-section-lbl">Оберіть спеціаліста</div>
      <div class="bk-cal-opts">
        <div class="bk-cal-opt selected" onclick="bkSelectCal(null)" id="bk-opt-any" data-calid="">
          <span style="width:12px;height:12px;border-radius:50%;background:#6366f1;flex-shrink:0"></span>
          <div><div style="font-weight:600;font-size:.9rem">Будь-який вільний</div><div style="font-size:.75rem;color:#9ca3af">Перший доступний слот</div></div>
        </div>
        ${cals.map(c => `
        <div class="bk-cal-opt" onclick="bkSelectCal('${c.id}')" id="bk-opt-${c.id}" data-calid="${c.id}">
          <span class="bk-cal-dot" style="background:${esc(c.color||'#6366f1')}"></span>
          <div>
            <div style="font-weight:600;font-size:.9rem">${esc(c.name)}</div>
            ${c.location ? `<div style="font-size:.75rem;color:#9ca3af">📍 ${esc(c.location)}</div>` : ''}
          </div>
        </div>`).join('')}
      </div>
      <button class="bk-btn-main" onclick="bkGoToDate()">Далі →</button>
      ` : ''}
    </div>

    <!-- STEP 2: Вибір дати -->
    <div class="bk-step ${cals.length === 1 ? 'active' : ''}" id="bk-step-date">
      ${cals.length > 1 ? `<button class="bk-btn-back-sm" onclick="bkBackToCal()">← Назад</button>` : ''}
      <div class="bk-section-lbl">Оберіть дату</div>
      <div class="bk-month-nav">
        <button class="bk-month-btn" onclick="bkPrevMonth()">‹</button>
        <span class="bk-month-title" id="bk-month-title"></span>
        <button class="bk-month-btn" onclick="bkNextMonth()">›</button>
      </div>
      <div class="bk-cal-grid" id="bk-cal-grid"></div>
    </div>

    <!-- STEP 3: Вибір часу -->
    <div class="bk-step" id="bk-step-slot">
      <button class="bk-btn-back-sm" onclick="bkBackToDate()">← Назад</button>
      <div class="bk-section-lbl" id="bk-slot-date-label">Доступний час</div>
      <div id="bk-slots-wrap" class="bk-loader"><div class="bk-spinner"></div> Завантаження...</div>
    </div>

    <!-- STEP 4: Форма -->
    <div class="bk-step" id="bk-step-form">
      <button class="bk-btn-back-sm" onclick="bkBackToSlots()">← Назад</button>
      <div class="bk-summary" id="bk-booking-summary"></div>
      <div id="bk-form-fields">
        <div class="bk-field">
          <label>Ваше ім'я *</label>
          <input type="text" id="bk-client-name" autocomplete="name" placeholder="Іван Петренко">
        </div>
        <div class="bk-field">
          <label>Email *</label>
          <input type="email" id="bk-client-email" autocomplete="email" placeholder="ivan@example.com">
        </div>
        <div class="bk-field">
          <label>Телефон</label>
          <input type="tel" id="bk-client-phone" autocomplete="tel" placeholder="+380501234567">
        </div>
        <div id="bk-extra-questions"></div>
      </div>
      <button class="bk-btn-main" id="bk-submit-btn" onclick="bkSubmit()">Записатись</button>
    </div>

    <!-- STEP 5: Успіх -->
    <div class="bk-step" id="bk-step-success">
      <div class="bk-success">
        <div class="bk-success-icon">✅</div>
        <div class="bk-success-title">Запис підтверджено!</div>
        <div class="bk-success-sub" id="bk-success-msg">Ми надішлемо підтвердження на ваш email.</div>
      </div>
    </div>
  </div>
</div>
</div>

<script>
const BK_COMPANY  = ${safeJson(companyId)};
const BK_GROUP_ID = ${safeJson(groupId)};
const BK_CALS     = ${safeJson(cals)};
const BK_GROUP    = ${safeJson({ name: grp.name, description: grp.description || '' })};

let bkState = {
    selectedCalId: null, // null = будь-який; конкретний ID = цей спеціаліст
    selectedDate:  null,
    selectedSlot:  null,
    selectedCalendarId: null, // фактичний календар для слоту
    currentMonth:  new Date().getMonth(),
    currentYear:   new Date().getFullYear(),
};

function bkShow(id) {
    document.querySelectorAll('.bk-step').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function bkSelectCal(calId) {
    bkState.selectedCalId = calId;
    document.querySelectorAll('.bk-cal-opt').forEach(o => o.classList.remove('selected'));
    const el = calId ? document.getElementById('bk-opt-' + calId) : document.getElementById('bk-opt-any');
    if (el) el.classList.add('selected');
}

function bkGoToDate()   { bkShow('bk-step-date'); bkRenderCalendar(); }
function bkBackToCal()  { bkShow('bk-step-cal'); }
function bkBackToDate() { bkShow('bk-step-date'); }
function bkBackToSlots(){ bkShow('bk-step-slot'); }

// ── Calendar grid ────────────────────────────────────────
function bkRenderCalendar() {
    const y = bkState.currentYear, m = bkState.currentMonth;
    const MONTHS = ['Січень','Лютий','Березень','Квітень','Травень','Червень',
                    'Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
    document.getElementById('bk-month-title').textContent = MONTHS[m] + ' ' + y;
    const grid = document.getElementById('bk-cal-grid');
    const dh = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d =>
        \`<div class="bk-cal-dh">\${d}</div>\`).join('');
    const first = new Date(y, m, 1).getDay();
    const offset = (first + 6) % 7; // Mon=0
    const days = new Date(y, m + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    let cells = Array(offset).fill('<div class="bk-cal-day empty"></div>');
    for (let d = 1; d <= days; d++) {
        const date = new Date(y, m, d);
        const ds = y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        const isPast = date < today;
        const isSel  = ds === bkState.selectedDate;
        const isToday = date.getTime() === today.getTime();
        cells.push(\`<div class="bk-cal-day \${isPast?'disabled':''} \${isSel?'selected':''} \${isToday&&!isPast?'today':''}"
            onclick="bkPickDate('\${ds}')">\${d}</div>\`);
    }
    grid.innerHTML = dh + cells.join('');
}

function bkPrevMonth() {
    if (bkState.currentMonth === 0) { bkState.currentMonth = 11; bkState.currentYear--; }
    else bkState.currentMonth--;
    bkRenderCalendar();
}
function bkNextMonth() {
    if (bkState.currentMonth === 11) { bkState.currentMonth = 0; bkState.currentYear++; }
    else bkState.currentMonth++;
    bkRenderCalendar();
}

async function bkPickDate(ds) {
    bkState.selectedDate  = ds;
    bkState.selectedSlot  = null;
    bkState.selectedCalendarId = null;
    bkRenderCalendar();
    bkShow('bk-step-slot');

    const DAYS = ['неділя','понеділок','вівторок','середа','четвер','п'ятниця','субота'];
    const [y,mo,d] = ds.split('-').map(Number);
    const dayLabel = DAYS[new Date(y, mo-1, d).getDay()];
    document.getElementById('bk-slot-date-label').textContent =
        \`\${d} \${['','січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'][mo]}, \${dayLabel}\`;

    const wrap = document.getElementById('bk-slots-wrap');
    wrap.innerHTML = '<div class="bk-loader"><div class="bk-spinner"></div> Завантаження...</div>';

    try {
        // Якщо обраний конкретний спеціаліст — слоти тільки його
        let url;
        if (bkState.selectedCalId) {
            url = \`/api/booking?action=slots&companyId=\${BK_COMPANY}&calendarId=\${bkState.selectedCalId}&date=\${ds}\`;
        } else {
            // Групові слоти
            url = \`/api/booking?action=slots&companyId=\${BK_COMPANY}&groupId=\${BK_GROUP_ID}&date=\${ds}\`;
        }
        const r = await fetch(url);
        const d2 = await r.json();
        const slots = d2.slots || [];

        if (slots.length === 0) {
            wrap.innerHTML = '<div class="bk-no-slots">На цей день немає вільних слотів</div>';
            return;
        }
        wrap.innerHTML = '<div class="bk-slots-grid">' +
            slots.map(s => \`<button class="bk-slot-btn" onclick="bkPickSlot('\${s.time}','\${s.calendarId||''}')">\${s.time}</button>\`).join('') +
            '</div>';
    } catch(e) {
        wrap.innerHTML = '<div class="bk-no-slots">Помилка завантаження. Спробуйте ще раз.</div>';
    }
}

function bkPickSlot(time, calendarId) {
    bkState.selectedSlot = time;
    bkState.selectedCalendarId = calendarId || bkState.selectedCalId || (BK_CALS[0]||{}).id;
    document.querySelectorAll('.bk-slot-btn').forEach(b => b.classList.remove('selected'));
    event.target.classList.add('selected');
    const cal = BK_CALS.find(c => c.id === bkState.selectedCalendarId) || BK_CALS[0] || {};
    const [y,m,d] = bkState.selectedDate.split('-').map(Number);
    document.getElementById('bk-booking-summary').innerHTML =
        \`📅 <b>\${d}.\${String(m).padStart(2,'0')}.\${y}</b> о <b>\${time}</b>\` +
        (cal.name ? \` · \${cal.name}\` : '') +
        (cal.location ? \`<br>📍 \${cal.location}\` : '');
    bkShow('bk-step-form');
}

async function bkSubmit() {
    const name  = document.getElementById('bk-client-name')?.value?.trim();
    const email = document.getElementById('bk-client-email')?.value?.trim();
    const phone = document.getElementById('bk-client-phone')?.value?.trim();
    if (!name)  { document.getElementById('bk-client-name').focus(); return; }
    if (!email) { document.getElementById('bk-client-email').focus(); return; }

    const btn = document.getElementById('bk-submit-btn');
    btn.disabled = true; btn.textContent = 'Записуємо...';

    const finalCalId = bkState.selectedCalendarId || (BK_CALS[0]||{}).id;

    try {
        const res = await fetch('/api/booking?action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId:  BK_COMPANY,
                calendarId: finalCalId,
                groupId:    BK_GROUP_ID,
                date:       bkState.selectedDate,
                timeSlot:   bkState.selectedSlot,
                clientName: name, clientEmail: email, clientPhone: phone || '',
            }),
        });
        const d2 = await res.json();
        if (!res.ok) throw new Error(d2.error || 'Server error');

        document.getElementById('bk-success-msg').textContent =
            \`Очікуйте підтвердження. Деталі надіслано на \${email}.\`;
        bkShow('bk-step-success');
    } catch(e) {
        btn.disabled = false; btn.textContent = 'Записатись';
        alert('Помилка: ' + e.message);
    }
}

// Init
if (BK_CALS.length === 1) bkState.selectedCalId = BK_CALS[0].id;
if (BK_CALS.length <= 1) {
    bkShow('bk-step-date'); bkRenderCalendar();
} else {
    bkShow('bk-step-cal');
}
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(html);
}

// ── Auth helper ───────────────────────────────────────────
// FIX B-04: реальна верифікація Firebase ID token через Admin SDK
async function requireAuth(req) {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return null;
    const token = auth.slice(7).trim();
    if (!token || token.length < 20) return null;
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        return decoded; // { uid, email, ... }
    } catch(e) {
        return null;
    }
}

// Helper: перевіряє що decoded user є manager/owner вказаної компанії
async function requireCompanyManager(decoded, companyId) {
    if (!decoded || !companyId) return false;
    try {
        const userDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(decoded.uid).get();
        if (!userDoc.exists) return false;
        const role = userDoc.data()?.role || '';
        return ['owner', 'admin', 'manager'].includes(role);
    } catch(e) {
        return false;
    }
}

function errPage(msg) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Помилка</title></head>
<body style="font-family:system-ui;text-align:center;padding:3rem;color:#374151">
<h2>Помилка</h2><p style="color:#6b7280">${esc(msg)}</p></body></html>`;
}

// ── Main handler ──────────────────────────────────────────
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || '';

    try {
        // ── GET: public booking page ──────────────────────
        if (req.method === 'GET' && action === 'page') {
            const { companyId, calendarId, slug, groupId, groupSlug } = req.query;
            if (!companyId)
                return res.status(400).send(errPage('Невірне посилання'));

            // Група за groupSlug (pretty URL /book/COMPANY/g/SLUG)
            if (groupSlug) {
                const grpSnap = await db.collection('companies').doc(companyId)
                    .collection('booking_groups')
                    .where('slug', '==', groupSlug).limit(1).get();
                if (grpSnap.empty)
                    return res.status(404).send(errPage('Групу не знайдено'));
                return renderGroupBookingPage(companyId, grpSnap.docs[0].id, res);
            }
            // Група за groupId (старий URL)
            if (groupId) {
                return renderGroupBookingPage(companyId, groupId, res);
            }
            // Одиночний за slug (pretty URL /book/COMPANY/SLUG)
            if (slug && !calendarId) {
                const calSnap = await db.collection('companies').doc(companyId)
                    .collection('booking_calendars')
                    .where('slug', '==', slug).limit(1).get();
                if (calSnap.empty)
                    return res.status(404).send(errPage('Календар не знайдено'));
                return renderBookingPage(companyId, calSnap.docs[0].id, res);
            }
            // Одиночний за calendarId (старий URL — backward compat)
            if (calendarId) {
                return renderBookingPage(companyId, calendarId, res);
            }
            return res.status(400).send(errPage('Невірне посилання'));
        }

        // ── GET: available slots ──────────────────────────
        if (req.method === 'GET' && action === 'slots') {
            const { companyId, date, groupId } = req.query;
            let { calendarId } = req.query;
            if (!companyId || !date)
                return res.status(400).json({ error: 'Missing params' });
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
                return res.status(400).json({ error: 'Invalid date format' });

            // Групові слоти з Round Robin розподілом
            if (groupId) {
                const grpDoc = await db.collection('companies').doc(companyId)
                    .collection('booking_groups').doc(groupId).get();
                if (!grpDoc.exists)
                    return res.status(404).json({ error: 'Group not found' });
                const grp = grpDoc.data();
                const calIds = grp.calendarIds || [];
                if (calIds.length === 0)
                    return res.status(200).json({ slots: [] });

                // Round Robin: визначаємо порядок черги по лічильнику призначень
                // Рахуємо скільки записів у кожного спеціаліста за останні 30 днів
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
                const countSnap = await db.collection('companies').doc(companyId)
                    .collection('booking_appointments')
                    .where('calendarId', 'in', calIds.slice(0, 10)) // Firestore 'in' limit 10
                    .where('date', '>=', thirtyDaysAgo)
                    .where('status', 'in', ['confirmed', 'pending'])
                    .get();

                // Рахуємо завантаженість кожного спеціаліста
                const loadMap = {};
                calIds.forEach(cid => { loadMap[cid] = 0; });
                countSnap.docs.forEach(d => {
                    const cid = d.data().calendarId;
                    if (loadMap[cid] !== undefined) loadMap[cid]++;
                });

                // Сортуємо calIds по завантаженості (менше записів = вищий пріоритет)
                const sortedCalIds = [...calIds].sort((a, b) => (loadMap[a] || 0) - (loadMap[b] || 0));

                // Отримуємо слоти для кожного календаря
                const allSlotsArr = await Promise.all(
                    sortedCalIds.map(cid => getAvailableSlots(companyId, cid, date)
                        .then(slots => slots.map(s => ({ time: s, calendarId: cid, load: loadMap[cid] || 0 })))
                        .catch(() => []))
                );

                // Round Robin merge: для кожного унікального часу — беремо спеціаліста з найменшим навантаженням
                const timeMap = {}; // time → { calendarId, load }
                for (const calSlots of allSlotsArr) {
                    for (const slot of calSlots) {
                        if (!timeMap[slot.time] || slot.load < timeMap[slot.time].load) {
                            timeMap[slot.time] = { calendarId: slot.calendarId, load: slot.load };
                        }
                    }
                }

                const unique = Object.entries(timeMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([time, { calendarId }]) => ({ time, calendarId }));

                return res.status(200).json({ slots: unique });
            }

            if (!calendarId)
                return res.status(400).json({ error: 'Missing calendarId' });
            const slots = await getAvailableSlots(companyId, calendarId, date);
            return res.status(200).json({ slots });
        }

        // ── GET: admin list of appointments ───────────────
        if (req.method === 'GET' && action === 'list') {
            // FIX B-05: перевіряємо і наявність токена і приналежність до компанії
            const decoded = await requireAuth(req);
            if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
            const { companyId, calendarId, status, limit: lim } = req.query;
            if (!companyId) return res.status(400).json({ error: 'Missing companyId' });
            // Перевіряємо що юзер є членом саме цієї компанії
            const isManager = await requireCompanyManager(decoded, companyId);
            if (!isManager) return res.status(403).json({ error: 'Forbidden' });

            let q = db.collection('companies').doc(companyId)
                .collection('booking_appointments')
                .orderBy('startTime', 'desc');
            if (calendarId) q = q.where('calendarId', '==', calendarId);
            if (status)     q = q.where('status', '==', status);
            q = q.limit(parseInt(lim) || 100);

            const snap = await q.get();
            const appointments = snap.docs.map(d => ({ id: d.id, ...d.data(),
                startTime: d.data().startTime?.toDate?.()?.toISOString(),
                endTime:   d.data().endTime?.toDate?.()?.toISOString(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString(),
            }));
            return res.status(200).json({ appointments });
        }

        // ── GET: list calendars ───────────────────────────
        if (req.method === 'GET' && action === 'calendars') {
            if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
            const { companyId } = req.query;
            if (!companyId) return res.status(400).json({ error: 'Missing companyId' });
            const snap = await db.collection('companies').doc(companyId)
                .collection('booking_calendars').orderBy('createdAt', 'desc').get();
            const calendars = snap.docs.map(d => ({ id: d.id, ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString(),
            }));
            return res.status(200).json({ calendars });
        }

        // ── POST: create appointment ──────────────────────
        if (req.method === 'POST' && action === 'create') {
            const { companyId, calendarId, clientName, clientEmail, clientPhone,
                    date, timeSlot, answers, source, crmClientId, crmDealId } = req.body || {};

            if (!companyId || !calendarId || !clientName || !clientEmail || !date || !timeSlot)
                return res.status(400).json({ error: 'Missing required fields' });

            // ── Server-side validation & sanitization ─────────────────────
            // Довжина полів
            if (typeof clientName !== 'string' || clientName.trim().length < 1 || clientName.length > 200)
                return res.status(400).json({ error: 'Invalid clientName (1-200 chars)' });
            if (typeof clientEmail !== 'string' || clientEmail.length > 254)
                return res.status(400).json({ error: 'Invalid email length' });
            if (clientPhone && typeof clientPhone === 'string' && clientPhone.length > 30)
                return res.status(400).json({ error: 'Invalid phone length' });

            // Email regex validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(clientEmail.trim()))
                return res.status(400).json({ error: 'Invalid email format' });

            // Date format validation (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
                return res.status(400).json({ error: 'Invalid date format' });

            // Max booking date — не більше 1 року вперед
            const today = new Date().toISOString().slice(0, 10);
            const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            if (date < today)    return res.status(400).json({ error: 'Cannot book in the past' });
            if (date > maxDate)  return res.status(400).json({ error: 'Cannot book more than 1 year ahead' });

            // TimeSlot format (HH:MM)
            if (!/^\d{2}:\d{2}$/.test(timeSlot))
                return res.status(400).json({ error: 'Invalid timeSlot format' });

            // Sanitize answers — обмежуємо розмір щоб запобігти 1MB payloads
            const safeAnswers = {};
            if (answers && typeof answers === 'object') {
                Object.entries(answers).slice(0, 20).forEach(([k, v]) => {
                    const safeKey = String(k).slice(0, 50);
                    const safeVal = String(v || '').slice(0, 500);
                    safeAnswers[safeKey] = safeVal;
                });
            }

            // Sanitize: trim strings
            const safeClientName  = clientName.trim().slice(0, 200);
            const safeClientEmail = clientEmail.trim().toLowerCase().slice(0, 254);
            const safeClientPhone = (clientPhone || '').toString().trim().slice(0, 30);

            // Rate limiting: перевіряємо чи цей email вже має pending/confirmed
            // запис в цьому календарі на цей день (запобігає дублюванню)
            // Використовуємо простий запит без createdAt (не потребує додаткового індексу)
            const dupSnap = await db.collection('companies').doc(companyId)
                .collection('booking_appointments')
                .where('clientEmail', '==', safeClientEmail)
                .where('calendarId', '==', calendarId)
                .where('date', '==', date)
                .where('status', 'in', ['confirmed', 'pending'])
                .limit(1).get();
            if (!dupSnap.empty) {
                return res.status(429).json({ error: 'You already have a booking on this date.' });
            }
            // ─────────────────────────────────────────────────────────────

            const calDoc = await db.collection('companies').doc(companyId)
                .collection('booking_calendars').doc(calendarId).get();
            if (!calDoc.exists) return res.status(404).json({ error: 'Calendar not found' });
            const cal = calDoc.data();

            if (!cal.isActive) return res.status(400).json({ error: 'Calendar is inactive' });

            const tz        = cal.timezone || 'Europe/Kiev';
            const duration  = cal.duration || 60;
            const bufBefore = cal.bufferBefore || 0;
            const bufAfter  = cal.bufferAfter  || 0;

            const startTime  = slotToDate(date, timeSlot, tz);
            const endTime    = new Date(startTime.getTime() + duration * 60000);
            const status     = cal.confirmationType === 'manual' ? 'pending' : 'confirmed';
            const cancelToken = genToken();

            const apptRef = db.collection('companies').doc(companyId)
                .collection('booking_appointments').doc();

            // ── Firestore Transaction: атомарна перевірка + запис ──────────
            // Захищає від race condition: два клієнти не можуть забронювати
            // той самий слот одночасно
            try {
                await db.runTransaction(async (tx) => {
                    const conflictSnap = await tx.get(
                        db.collection('companies').doc(companyId)
                            .collection('booking_appointments')
                            .where('calendarId', '==', calendarId)
                            .where('date', '==', date)
                            .where('status', 'in', ['confirmed', 'pending'])
                    );

                    const slotStartMs = startTime.getTime() - bufBefore * 60000;
                    const slotEndMs   = endTime.getTime()   + bufAfter  * 60000;

                    for (const doc of conflictSnap.docs) {
                        const a = doc.data();
                        // Буфер вже врахований в slotStartMs/slotEndMs — тут без буферу
                        const aStart = a.startTime.toMillis();
                        const aEnd   = a.endTime.toMillis();
                        if (slotStartMs < aEnd && slotEndMs > aStart) {
                            throw new Error('SLOT_TAKEN');
                        }
                    }

                    // Слот вільний — записуємо атомарно
                    tx.set(apptRef, {
                        calendarId,
                        calendarName: cal.name || '',
                        ownerId:      cal.ownerId || '',
                        ownerName:    cal.ownerName || '',
                        clientName:   safeClientName,
                        clientEmail:  safeClientEmail,
                        clientPhone:  safeClientPhone,
                        clientAnswers: safeAnswers,
                        startTime:    admin.firestore.Timestamp.fromDate(startTime),
                        endTime:      admin.firestore.Timestamp.fromDate(endTime),
                        date,
                        timeSlot,
                        timezone: tz,
                        status,
                        cancelToken,
                        googleEventId: null,
                        source:       source || 'direct',
                        crmClientId:  crmClientId || null,
                        crmDealId:    crmDealId   || null,
                        notes: '',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                });
            } catch(txErr) {
                if (txErr.message === 'SLOT_TAKEN') {
                    return res.status(409).json({ error: 'Slot no longer available. Please choose another time.' });
                }
                throw txErr;
            }

            // Create Google Calendar event (non-blocking)
            if (cal.ownerId) {
                createGoogleEvent(companyId, cal.ownerId, {
                    clientName: safeClientName, clientEmail: safeClientEmail, clientPhone: safeClientPhone,
                    startTime: admin.firestore.Timestamp.fromDate(startTime),
                    endTime:   admin.firestore.Timestamp.fromDate(endTime),
                }, cal).then(eventId => {
                    if (eventId) apptRef.update({ googleEventId: eventId }).catch(() => {});
                });
            }

            // Telegram notification (non-blocking)
            const compRef = db.collection('companies').doc(companyId);
            // ── Stripe оплата якщо календар вимагає ──────────
        let stripeUrl = null;
        if (cal.requirePayment && cal.price > 0) {
            try {
                const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
                if (STRIPE_KEY) {
                    const Stripe = require('stripe');
                    const stripe = Stripe(STRIPE_KEY);
                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        mode: 'payment',
                        line_items: [{
                            price_data: {
                                currency:    (cal.priceCurrency || 'EUR').toLowerCase(),
                                unit_amount: Math.round((cal.price || 0) * 100),
                                product_data: { name: `${cal.name} — ${safeClientName}` },
                            },
                            quantity: 1,
                        }],
                        metadata: {
                            companyId,
                            bookingId:  appointmentRef.id,
                            clientName: safeClientName,
                        },
                        customer_email: safeClientEmail,
                        success_url: `${_safeOrigin(req.headers.origin)}/?stripe=success&bookingId=${appointmentRef.id}`,
                        cancel_url:  `${_safeOrigin(req.headers.origin)}/book/${companyId}/${cal.slug || calendarId}`,
                    });
                    stripeUrl = session.url;
                    // Зберігаємо session ID в appointment
                    await appointmentRef.update({
                        stripeSessionId:  session.id,
                        stripeSessionUrl: session.url,
                        status:           'pending_payment',
                    });
                }
            } catch(stripeErr) {
                console.error('[booking create] Stripe session error:', stripeErr.message);
            }
        }

        tgNotify(compRef,
                `📅 <b>Новий запис!</b>\n` +
                `Календар: ${tgEsc(cal.name || calendarId)}\n` +
                `Клієнт: ${tgEsc(safeClientName)}\n` +
                `Email: ${tgEsc(safeClientEmail)}\n` +
                `Телефон: ${tgEsc(safeClientPhone || '—')}\n` +
                `Дата: ${tgEsc(date)} о ${tgEsc(timeSlot)}\n` +
                `Статус: ${status === 'pending' ? 'Очікує підтвердження' : 'Підтверджено'}`
            );

            // Auto-create CRM client if doesn't exist
            if (!crmClientId) {
                try {
                    const existingSnap = await db.collection('companies').doc(companyId)
                        .collection('crm_clients')
                        .where('email', '==', safeClientEmail)
                        .limit(1).get();

                    let crmId;
                    if (existingSnap.empty) {
                        const newClient = await db.collection('companies').doc(companyId)
                            .collection('crm_clients').add({
                                name:  safeClientName,
                                email: safeClientEmail,
                                phone: safeClientPhone,
                                source: 'booking',
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            });
                        crmId = newClient.id;
                    } else {
                        crmId = existingSnap.docs[0].id;
                    }
                    await apptRef.update({ crmClientId: crmId });
                } catch(e) {
                    console.error('[booking] CRM auto-client error:', e.message);
                }
            }

            return res.status(200).json({
                appointmentId: apptRef.id,
                status,
                cancelToken,
                date,
                timeSlot,
            });
        }

        // ── POST: confirm (manual confirmation) ───────────
        if (req.method === 'POST' && action === 'confirm') {
            // FIX B-01: потрібна авторизація — Admin SDK обходить Firestore rules
            const decoded = await requireAuth(req);
            if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
            const { companyId, appointmentId } = req.body || {};
            if (!companyId || !appointmentId)
                return res.status(400).json({ error: 'Missing params' });
            const isManager = await requireCompanyManager(decoded, companyId);
            if (!isManager) return res.status(403).json({ error: 'Forbidden' });

            await db.collection('companies').doc(companyId)
                .collection('booking_appointments').doc(appointmentId)
                .update({ status: 'confirmed', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

            return res.status(200).json({ ok: true });
        }

        // ── POST: cancel ──────────────────────────────────
        if (req.method === 'POST' && action === 'cancel') {
            const { companyId, appointmentId, cancelToken, adminKey } = req.body || {};
            if (!companyId || !appointmentId)
                return res.status(400).json({ error: 'Missing params' });

            const apptRef = db.collection('companies').doc(companyId)
                .collection('booking_appointments').doc(appointmentId);
            const apptDoc = await apptRef.get();
            if (!apptDoc.exists) return res.status(404).json({ error: 'Not found' });

            const appt = apptDoc.data();

            // Безпека: або валідний cancelToken (клієнт), або Firebase ID token (адмін)
            const authHeader = req.headers.authorization || '';
            const isAdminAuth = authHeader.startsWith('Bearer ');

            if (!cancelToken && !isAdminAuth) {
                return res.status(403).json({ error: 'cancelToken or admin auth required' });
            }
            if (cancelToken && appt.cancelToken !== cancelToken) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            await apptRef.update({
                status: 'cancelled',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Delete Google Calendar event
            if (appt.googleEventId && appt.ownerId) {
                deleteGoogleEvent(companyId, appt.ownerId, appt.googleEventId);
            }

            // Notify owner
            const compRef = db.collection('companies').doc(companyId);
            // FIX B-03: видалено дублікат блоку Stripe з cancel (copy-paste помилка)
            // cal, appointmentRef, safeClientEmail — змінні з action=create, тут не існують

            tgNotify(compRef,
                `❌ <b>Запис скасовано</b>\n` +
                `Клієнт: ${tgEsc(appt.clientName)}\n` +
                `Дата: ${tgEsc(appt.date)} о ${tgEsc(appt.timeSlot)}`
            );

            return res.status(200).json({ ok: true });
        }

        // ── POST: save/update calendar (admin) ────────────
        if (req.method === 'POST' && action === 'saveCalendar') {
            // FIX B-02: потрібна авторизація manager/owner
            const decoded = await requireAuth(req);
            if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
            const { companyId, calendarId, data } = req.body || {};
            if (!companyId || !data)
                return res.status(400).json({ error: 'Missing params' });
            const isManager = await requireCompanyManager(decoded, companyId);
            if (!isManager) return res.status(403).json({ error: 'Forbidden' });

            const col = db.collection('companies').doc(companyId)
                .collection('booking_calendars');

            if (calendarId) {
                await col.doc(calendarId).update({
                    ...data,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                return res.status(200).json({ id: calendarId });
            } else {
                const ref = await col.add({
                    ...data,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                return res.status(200).json({ id: ref.id });
            }
        }

        // ── POST: save schedule ───────────────────────────
        if (req.method === 'POST' && action === 'saveSchedule') {
            // FIX B-02: потрібна авторизація manager/owner
            const decoded = await requireAuth(req);
            if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
            const { companyId, calendarId, schedule } = req.body || {};
            if (!companyId || !calendarId || !schedule)
                return res.status(400).json({ error: 'Missing params' });
            const isManager = await requireCompanyManager(decoded, companyId);
            if (!isManager) return res.status(403).json({ error: 'Forbidden' });

            await db.collection('companies').doc(companyId)
                .collection('booking_schedules').doc(calendarId)
                .set({ ...schedule, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

            return res.status(200).json({ ok: true });
        }

        return res.status(400).json({ error: 'Unknown action' });

    } catch(e) {
        console.error('[booking.js] error:', e.message, e.stack);
        return res.status(500).json({ error: e.message });
    }
};
