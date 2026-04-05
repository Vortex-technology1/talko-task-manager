// ============================================================
// 23-welcome-banner.js — Welcome banner for new employees
//
// Показується один раз при першому вході:
//   1. Підключи Telegram
//   2. Підключи Google Calendar
//   3. Мій день — тут твої завдання
//
// Логіка:
//   - Перевіряємо Firestore: users/{uid}.welcomeBannerShown
//   - Якщо false/відсутнє → показуємо
//   - Після закриття → пишемо welcomeBannerShown: true → більше не показується
// ============================================================

(function () {

const BANNER_ID = 'talkoWelcomeBanner';

// ── Перевірка чи потрібно показувати ────────────────────────
async function shouldShowBanner() {
    const uid = window.currentUser?.uid;
    const cid = window.currentCompanyId;
    if (!uid || !cid) return false;

    const userData = window.currentUserData;
    if (!userData) return false;

    // Owner вже бачить повний онбординг — не показуємо
    if (userData.role === 'owner') return false;

    // Вже показували
    if (userData.welcomeBannerShown === true) return false;

    // Telegram вже підключений і Google вже підключений — нічого показувати
    const tgConnected = !!userData.telegramChatId;
    const gcalConnected = !!userData.googleRefreshToken;
    if (tgConnected && gcalConnected) {
        // Позначаємо як показаний щоб не перевіряти знову
        await markShown();
        return false;
    }

    return true;
}

// ── Позначити як показаний ───────────────────────────────────
async function markShown() {
    const uid = window.currentUser?.uid;
    const cid = window.currentCompanyId;
    if (!uid || !cid) return;
    try {
        await firebase.firestore()
            .collection('companies').doc(cid)
            .collection('users').doc(uid)
            .update({ welcomeBannerShown: true });
        if (window.currentUserData) window.currentUserData.welcomeBannerShown = true;
    } catch (e) {
        console.warn('[WelcomeBanner] markShown error:', e.message);
    }
}

// ── Закрити банер ────────────────────────────────────────────
window.closeWelcomeBanner = async function () {
    const el = document.getElementById(BANNER_ID);
    if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-12px)';
        setTimeout(() => el.remove(), 300);
    }
    await markShown();
};

// ── Рендер ──────────────────────────────────────────────────
function renderBanner() {
    if (document.getElementById(BANNER_ID)) return;

    const userData = window.currentUserData || {};
    const tgConnected = !!userData.telegramChatId;
    const gcalConnected = !!userData.googleRefreshToken;

    const lang = window.currentUserData?.interfaceLang || window.currentUserData?.language || 'ua';

    const i18n = {
        ua: {
            title: '',
            subtitle: '',
            tg_title: '',
            tg_desc: 'Отримуй сповіщення про завдання, дедлайни та нагадування прямо в месенджер.',
            tg_btn: 'Підключити',
            tg_done: 'Підключено',
            gcal_title: '',
            gcal_desc: 'Дедлайни завдань автоматично з\'являться у твоєму календарі.',
            gcal_btn: 'Підключити',
            gcal_done: 'Підключено',
            myday_title: '',
            myday_desc: 'Тут зібрані всі завдання на сьогодні. Відмічай виконані, переносьте дедлайни, стартуй таймер.',
            myday_btn: 'Зрозуміло',
            close: 'Закрити',
            step: 'Крок',
        },
        en: {
            title: '👋 Welcome to TALKO!',
            subtitle: 'Complete 3 steps to get the most out of the system',
            tg_title: 'Connect Telegram',
            tg_desc: 'Get task notifications, deadlines and reminders directly in the messenger.',
            tg_btn: 'Connect',
            tg_done: 'Connected',
            gcal_title: 'Connect Google Calendar',
            gcal_desc: 'Task deadlines will automatically appear in your calendar.',
            gcal_btn: 'Connect',
            gcal_done: 'Connected',
            myday_title: 'My Day — your work hub',
            myday_desc: 'All today\'s tasks are here. Mark done, reschedule, start timer.',
            myday_btn: 'Got it',
            close: 'Close',
            step: 'Step',
        },
        ru: {
            title: '',
            subtitle: '',
            tg_title: '',
            tg_desc: 'Получай уведомления о задачах, дедлайнах и напоминаниях прямо в мессенджер.',
            tg_btn: 'Подключить',
            tg_done: 'Подключено',
            gcal_title: '',
            gcal_desc: 'Дедлайны задач автоматически появятся в твоём календаре.',
            gcal_btn: 'Подключить',
            gcal_done: 'Подключено',
            myday_title: '',
            myday_desc: 'Здесь собраны все задачи на сегодня. Отмечай выполненные, переносите дедлайны, запускай таймер.',
            myday_btn: 'Понятно',
            close: window.t('closeAction'),
            step: 'Шаг',
        },
        de: {
            title: '👋 Willkommen bei TALKO!',
            subtitle: 'Führe 3 Schritte aus um das Beste aus dem System herauszuholen',
            tg_title: 'Telegram verbinden',
            tg_desc: 'Erhalte Aufgaben-Benachrichtigungen, Fristen und Erinnerungen direkt im Messenger.',
            tg_btn: 'Verbinden',
            tg_done: 'Verbunden',
            gcal_title: 'Google Calendar verbinden',
            gcal_desc: 'Aufgabenfristen erscheinen automatisch in deinem Kalender.',
            gcal_btn: 'Verbinden',
            gcal_done: 'Verbunden',
            myday_title: 'Mein Tag — dein Arbeitszentrum',
            myday_desc: 'Hier sind alle heutigen Aufgaben. Erledige, verschiebe, starte Timer.',
            myday_btn: 'Verstanden',
            close: 'Schließen',
            step: 'Schritt',
        },
        pl: {
            title: '👋 Witaj w TALKO!',
            subtitle: 'Wykonaj 3 kroki aby system działał pełną parą',
            tg_title: 'Połącz Telegram',
            tg_desc: 'Otrzymuj powiadomienia o zadaniach, terminach i przypomnieniach bezpośrednio w komunikatorze.',
            tg_btn: 'Połącz',
            tg_done: 'Połączono',
            gcal_title: 'Połącz Google Calendar',
            gcal_desc: 'Terminy zadań pojawią się automatycznie w Twoim kalendarzu.',
            gcal_btn: 'Połącz',
            gcal_done: 'Połączono',
            myday_title: 'Mój dzień — twoje centrum pracy',
            myday_desc: 'Tu są wszystkie dzisiejsze zadania. Oznaczaj wykonane, przenoś terminy, uruchamiaj timer.',
            myday_btn: 'Rozumiem',
            close: 'Zamknij',
            step: 'Krok',
        },
    };

    const t = i18n[lang] || i18n.en;

    const stepCard = (num, icon, title, desc, btnHtml, done) => `
        <div style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:${done ? '#f0fdf4' : 'white'};border:1.5px solid ${done ? '#86efac' : '#e5e7eb'};border-radius:12px;transition:all .2s;">
            <div style="width:36px;height:36px;border-radius:50%;background:${done ? '#22c55e' : '#f3f4f6'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">
                ${done ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : icon}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
                    <span style="font-size:0.7rem;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;">${t.step} ${num}</span>
                    ${done ? '<span style="font-size:0.7rem;font-weight:600;color:#22c55e;">✓ ' + (t.tg_done) + '</span>' : ''}
                </div>
                <div style="font-weight:600;color:#111827;font-size:0.9rem;margin-bottom:4px;">${title}</div>
                <div style="color:#6b7280;font-size:0.82rem;line-height:1.4;margin-bottom:${btnHtml && !done ? '10px' : '0'}">${desc}</div>
                ${!done && btnHtml ? btnHtml : ''}
            </div>
        </div>`;

    // Кнопки дій
    const tgBtn = tgConnected ? '' : `<button onclick="window.closeWelcomeBanner();setTimeout(()=>{ const p=document.querySelector('[data-tab=myday]'); if(p)p.click(); setTimeout(()=>{ const btn=document.querySelector('[data-action=connect-telegram],[onclick*=connectTelegram],[onclick*=telegram]'); if(btn)btn.click(); },300); },300);" style="padding:6px 14px;background:#22c55e;color:white;border:none;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;">${t.tg_btn} →</button>`;

    const gcalBtn = gcalConnected ? '' : `<button onclick="window.closeWelcomeBanner();setTimeout(()=>{ if(typeof window.connectGoogleCalendar==='function')window.connectGoogleCalendar(); else{ const p=document.querySelector('[data-tab=myday]'); if(p)p.click(); } },300);" style="padding:6px 14px;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;">${t.gcal_btn} →</button>`;

    const mydayBtn = `<button onclick="window.closeWelcomeBanner();" style="padding:6px 14px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;">${t.myday_btn}</button>`;

    const icons = {
        tg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>',
        gcal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        myday: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></svg>',
    };

    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.style.cssText = `
        position:fixed;top:70px;right:20px;width:360px;
        background:white;border:1.5px solid #e5e7eb;border-radius:16px;
        box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:9999;
        padding:20px;opacity:0;transform:translateY(-12px);
        transition:opacity .3s,transform .3s;
    `;

    banner.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
            <div>
                <div style="font-size:1.05rem;font-weight:700;color:#111827;">${t.title}</div>
                <div style="font-size:0.8rem;color:#6b7280;margin-top:3px;">${t.subtitle}</div>
            </div>
            <button onclick="window.closeWelcomeBanner()" style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:2px;line-height:1;font-size:18px;" title="${t.close}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${stepCard(1, icons.tg,    t.tg_title,    t.tg_desc,    tgBtn,    tgConnected)}
            ${stepCard(2, icons.gcal,  t.gcal_title,  t.gcal_desc,  gcalBtn,  gcalConnected)}
            ${stepCard(3, icons.myday, t.myday_title, t.myday_desc, mydayBtn, false)}
        </div>
    `;

    document.body.appendChild(banner);
    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        });
    });
}

// ── Init ─────────────────────────────────────────────────────
async function initWelcomeBanner() {
    // Чекаємо поки currentUserData завантажиться
    let attempts = 0;
    const wait = setInterval(async () => {
        attempts++;
        if (attempts > 30) { clearInterval(wait); return; } // 15 сек timeout
        if (!window.currentUserData || !window.currentUser || !window.currentCompanyId) return;
        clearInterval(wait);

        const show = await shouldShowBanner();
        if (show) renderBanner();
    }, 500);
}

// Запускаємо після завантаження
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWelcomeBanner);
} else {
    // DOM вже готовий — чекаємо auth
    setTimeout(initWelcomeBanner, 1000);
}

})();
