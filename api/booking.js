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
function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function genToken() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
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
        if (!userData.googleCalendarConnected || !userData.googleAccessToken) return null;

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
                    'Authorization': `Bearer ${userData.googleAccessToken}`,
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

    // Build time range for the date (full day in UTC for freebusy)
    const dayStart = new Date(dateStr + 'T00:00:00Z').toISOString();
    const dayEnd   = new Date(dateStr + 'T23:59:59Z').toISOString();

    // Fetch existing appointments for this calendar on this date
    const apptSnap = await db.collection('companies').doc(companyId)
        .collection('booking_appointments')
        .where('calendarId', '==', calendarId)
        .where('date', '==', dateStr)
        .where('status', 'in', ['confirmed', 'pending'])
        .get();

    const bookedRanges = apptSnap.docs.map(d => {
        const a = d.data();
        const st = a.startTime.toMillis();
        const et = a.endTime.toMillis();
        return { start: st - bufBefore * 60000, end: et + bufAfter * 60000 };
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
          <label>Email <span class="bk-req">*</span></label>
          <input type="email" id="bk-email" placeholder="email@example.com" required>
        </div>
        <div class="bk-field">
          <label>Телефон${cal.phoneRequired !== false ? ' <span class="bk-req">*</span>' : ''}</label>
          <input type="tel" id="bk-phone" placeholder="+380..."${cal.phoneRequired !== false ? ' required' : ''}>
        </div>
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
const BK_COMPANY  = ${JSON.stringify(companyId)};
const BK_CALENDAR = ${JSON.stringify(calendarId)};
const BK_CONFIRM  = ${JSON.stringify(cal.confirmationType || 'auto')};

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
        document.getElementById('bk-tz-display').textContent =
            'Ваш часовий пояс: ' + Intl.DateTimeFormat().resolvedOptions().timeZone;
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
        if (this.slotsCache[ds]) return this.slotsCache[ds];
        try {
            const r = await fetch(
                \`/api/booking?action=slots&companyId=\${BK_COMPANY}&calendarId=\${BK_CALENDAR}&date=\${ds}\`
            );
            const data = await r.json();
            this.slotsCache[ds] = data.slots || [];
            return this.slotsCache[ds];
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
            if (!r.ok) throw new Error(data.error || 'Помилка');
            this.showConfirmation(data, name, email);
        } catch(e) {
            alert('Помилка: ' + e.message);
            btn.disabled = false;
            btn.textContent = 'Підтвердити запис';
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

        el.querySelector('.bk-confirm').innerHTML = \`
            <div class="bk-confirm-icon">\${isPending ? '⏳' : '✅'}</div>
            <h2>\${isPending ? 'Очікує підтвердження' : 'Запис підтверджено!'}</h2>
            <p>\${isPending ? 'Ми зв’яжемося з вами найближчим часом для підтвердження.' : 'Дякуємо! Чекаємо вас.'}</p>
            <div class="bk-confirm-details">
                <dt>Клієнт</dt><dd>\${name}</dd>
                <dt>Email</dt><dd>\${email}</dd>
                <dt>Дата</dt><dd>\${parseInt(d)} \${months[parseInt(m)]}, \${this.selectedDate.split('-')[0]}</dd>
                <dt>Час</dt><dd>\${this.selectedTime}</dd>
            </div>
            \${data.cancelToken ? \`<div>
                <a class="bk-cancel-link" onclick="if(confirm('Скасувати запис?')) bk.cancel('\${data.appointmentId}', '\${data.cancelToken}')">
                    Скасувати запис
                </a>
            </div>\` : ''}
        \`;
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
            const { companyId, calendarId } = req.query;
            if (!companyId || !calendarId)
                return res.status(400).send(errPage('Невірне посилання'));
            return renderBookingPage(companyId, calendarId, res);
        }

        // ── GET: available slots ──────────────────────────
        if (req.method === 'GET' && action === 'slots') {
            const { companyId, calendarId, date } = req.query;
            if (!companyId || !calendarId || !date)
                return res.status(400).json({ error: 'Missing params' });

            const slots = await getAvailableSlots(companyId, calendarId, date);
            return res.status(200).json({ slots });
        }

        // ── GET: admin list of appointments ───────────────
        if (req.method === 'GET' && action === 'list') {
            const { companyId, calendarId, status, limit: lim } = req.query;
            if (!companyId) return res.status(400).json({ error: 'Missing companyId' });

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

            const calDoc = await db.collection('companies').doc(companyId)
                .collection('booking_calendars').doc(calendarId).get();
            if (!calDoc.exists) return res.status(404).json({ error: 'Calendar not found' });
            const cal = calDoc.data();

            if (!cal.isActive) return res.status(400).json({ error: 'Calendar is inactive' });

            const tz       = cal.timezone || 'Europe/Kiev';
            const duration = cal.duration || 60;

            // Verify slot is still available
            const available = await getAvailableSlots(companyId, calendarId, date);
            if (!available.includes(timeSlot))
                return res.status(409).json({ error: 'Slot no longer available' });

            const startTime = slotToDate(date, timeSlot, tz);
            const endTime   = new Date(startTime.getTime() + duration * 60000);

            const status     = cal.confirmationType === 'manual' ? 'pending' : 'confirmed';
            const cancelToken = genToken();

            const apptRef = db.collection('companies').doc(companyId)
                .collection('booking_appointments').doc();

            const apptData = {
                calendarId,
                calendarName: cal.name || '',
                ownerId:      cal.ownerId || '',
                ownerName:    cal.ownerName || '',
                clientName,
                clientEmail,
                clientPhone:  clientPhone || '',
                clientAnswers: answers || {},
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
            };

            await apptRef.set(apptData);

            // Create Google Calendar event (non-blocking)
            if (cal.ownerId) {
                createGoogleEvent(companyId, cal.ownerId, {
                    ...apptData,
                    startTime: admin.firestore.Timestamp.fromDate(startTime),
                    endTime:   admin.firestore.Timestamp.fromDate(endTime),
                }, cal).then(eventId => {
                    if (eventId) apptRef.update({ googleEventId: eventId }).catch(() => {});
                });
            }

            // Telegram notification (non-blocking)
            const compRef = db.collection('companies').doc(companyId);
            tgNotify(compRef,
                `📅 <b>Новий запис!</b>\n` +
                `Календар: ${cal.name || calendarId}\n` +
                `Клієнт: ${clientName}\n` +
                `Email: ${clientEmail}\n` +
                `Телефон: ${clientPhone || '—'}\n` +
                `Дата: ${date} о ${timeSlot}\n` +
                `Статус: ${status === 'pending' ? 'Очікує підтвердження' : 'Підтверджено'}`
            );

            // Auto-create CRM client if doesn't exist
            if (!crmClientId) {
                try {
                    const existingSnap = await db.collection('companies').doc(companyId)
                        .collection('crm_clients')
                        .where('email', '==', clientEmail.toLowerCase())
                        .limit(1).get();

                    let crmId;
                    if (existingSnap.empty) {
                        const newClient = await db.collection('companies').doc(companyId)
                            .collection('crm_clients').add({
                                name:  clientName,
                                email: clientEmail.toLowerCase(),
                                phone: clientPhone || '',
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
            const { companyId, appointmentId } = req.body || {};
            if (!companyId || !appointmentId)
                return res.status(400).json({ error: 'Missing params' });

            await db.collection('companies').doc(companyId)
                .collection('booking_appointments').doc(appointmentId)
                .update({ status: 'confirmed', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

            return res.status(200).json({ ok: true });
        }

        // ── POST: cancel ──────────────────────────────────
        if (req.method === 'POST' && action === 'cancel') {
            const { companyId, appointmentId, cancelToken } = req.body || {};
            if (!companyId || !appointmentId)
                return res.status(400).json({ error: 'Missing params' });

            const apptRef = db.collection('companies').doc(companyId)
                .collection('booking_appointments').doc(appointmentId);
            const apptDoc = await apptRef.get();
            if (!apptDoc.exists) return res.status(404).json({ error: 'Not found' });

            const appt = apptDoc.data();
            // cancelToken check only if provided (admin cancel can omit it)
            if (cancelToken && appt.cancelToken !== cancelToken)
                return res.status(403).json({ error: 'Invalid token' });

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
            tgNotify(compRef,
                `❌ <b>Запис скасовано</b>\n` +
                `Клієнт: ${appt.clientName}\n` +
                `Дата: ${appt.date} о ${appt.timeSlot}`
            );

            return res.status(200).json({ ok: true });
        }

        // ── POST: save/update calendar (admin) ────────────
        if (req.method === 'POST' && action === 'saveCalendar') {
            const { companyId, calendarId, data } = req.body || {};
            if (!companyId || !data)
                return res.status(400).json({ error: 'Missing params' });

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
            const { companyId, calendarId, schedule } = req.body || {};
            if (!companyId || !calendarId || !schedule)
                return res.status(400).json({ error: 'Missing params' });

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
