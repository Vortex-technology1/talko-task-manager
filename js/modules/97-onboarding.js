// ============================================================
// 97-onboarding.js — TALKO OS Onboarding
// Вкладка: Система → Онбординг
// Прогрес зберігається в Firestore: companies/{id}/settings/onboarding
// ============================================================

(function() {

const OB_STEPS = [
    {
        id: 'company',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        color: '#22c55e',
        title: window.t('onbStep1Title'),
        subtitle: window.t('onbStep1Sub'),
        est: '5 хв',
        description: 'Перше що потрібно зробити — заповнити профіль компанії. Це назва, сфера діяльності та базові дані які будуть відображатись по всій системі.',
        tasks: [
            { id: 'company_name', text: window.t('onbStep1T1'), detail: 'Перейдіть в Система → Налаштування та заповніть поле "Назва компанії"' },
            { id: 'company_niche', text: window.t('onbStep1T2'), detail: 'Оберіть сферу діяльності — це впливає на шаблони процесів і автоматизацій' },
            { id: 'company_logo', text: window.t('onbStep1T3'), detail: window.t('onbStep1T3Detail') },
        ],
        action: { label: window.t('onbStep1Action'), tab: 'admin' },
        tip: '💡 Правильна назва і ніша допомагають AI-аналітику давати релевантні рекомендації саме для вашої сфери.'
    },
    {
        id: 'structure',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="6" height="4" rx="1"/><rect x="9" y="3" width="6" height="4" rx="1"/><rect x="16" y="3" width="6" height="4" rx="1"/><path d="M5 7v3"/><path d="M12 7v3"/><path d="M19 7v3"/><path d="M5 10h14"/><path d="M12 10v4"/><rect x="9" y="14" width="6" height="4" rx="1"/></svg>',
        color: '#3b82f6',
        title: window.t('onbStep2Title'),
        subtitle: window.t('onbStep2Sub'),
        est: '10 хв',
        description: 'Структура — це основа управління. Без неї система не знає хто кому підпорядковується і хто несе відповідальність. Потрібно описати відділи та посади.',
        tasks: [
            { id: 'struct_dept', text: window.t('onbStep2T1'), detail: 'Система → Структура. Приклад: Продажі, Виробництво, Адміністрація' },
            { id: 'struct_roles', text: window.t('onbStep2T2'), detail: 'Кожна роль має різні права доступу. Owner — все, Manager — управління командою, Employee — свої завдання' },
            { id: 'struct_view', text: window.t('onbStep2T3'), detail: 'Система → Структура → вкладка "Схема". Перевірте що все виглядає правильно' },
        ],
        action: { label: window.t('onbStep2Action'), tab: 'bizstructure' },
        tip: '💡 Рекомендація: починайте зі спрощеної структури — 2-3 рівні. Можна ускладнити пізніше коли система запрацює.'
    },
    {
        id: 'users',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        color: '#8b5cf6',
        title: window.t('onbStep3Title'),
        subtitle: window.t('onbStep3Sub'),
        est: '10 хв',
        description: 'Система працює тільки коли в ній є люди. Запросіть співробітників — вони отримають email з посиланням для реєстрації і одразу зможуть приступити до роботи.',
        tasks: [
            { id: 'users_invite', text: window.t('onbStep3T1'), detail: 'Система → Співробітники → кнопка "Запросити". Введіть email — прийде лист з посиланням' },
            { id: 'users_roles', text: window.t('onbStep3T4'), detail: window.t('onbStep3T2') },
            { id: 'users_check', text: window.t('onbStep3T3'), detail: 'Система → Співробітники — статус "Активний" означає що людина вже увійшла' },
        ],
        action: { label: window.t('onbStep3Action'), tab: 'users' },
        tip: '💡 Не чекайте поки всі приєднаються одночасно. Почніть з 1-2 ключових людей і протестуйте систему разом.'
    },
    {
        id: 'functions',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
        color: '#f59e0b',
        title: window.t('onbStep4Title'),
        subtitle: window.t('onbStep4Sub'),
        est: '15 хв',
        description: 'Функції — це зони відповідальності. Кожна функція закріплюється за конкретною людиною. Завдяки цьому система знає кому що ставити і хто за що звітує.',
        tasks: [
            { id: 'func_create', text: 'Створити 3-5 ключових функцій', detail: 'Система → Функції → "Додати функцію". Приклади: "Продажі", "Виробництво", "Бухгалтерія", "Маркетинг"' },
            { id: 'func_assign', text: window.t('onbStep4T2'), detail: 'У картці функції вкажіть хто відповідає — це буде виконавець всіх завдань цієї функції за замовчуванням' },
            { id: 'func_kpi', text: window.t('onbStep4T3'), detail: 'У функції вкажіть 1-3 ключових показники. Приклад для продажів: "Кількість нових клієнтів на місяць = 20"' },
        ],
        action: { label: window.t('onbStep4Action'), tab: 'functions' },
        tip: '💡 Функції — це не посади, а зони відповідальності. Одна людина може відповідати за кілька функцій.'
    },
    {
        id: 'tasks',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14l2 2 4-4"/></svg>',
        color: '#22c55e',
        title: window.t('onbStep5Title'),
        subtitle: window.t('onbStep5Sub'),
        est: '10 хв',
        description: 'Завдання — основа щоденної роботи в TALKO. Кожне завдання має виконавця, дедлайн і функцію. Система контролює виконання і нагадує про прострочені.',
        tasks: [
            { id: 'task_create', text: window.t('onbStep5T1'), detail: 'Натисніть + у правому нижньому куті або Завдання → кнопка "Нове завдання". Вкажіть назву, виконавця, дедлайн і функцію' },
            { id: 'task_assign', text: window.t('onbStep5T2'), detail: 'У модалці завдання оберіть виконавця зі списку запрошених співробітників' },
            { id: 'task_deadline', text: window.t('onbStep5T3'), detail: 'Вкажіть конкретну дату — система автоматично нагадає виконавцю за 1 день до дедлайну в Telegram' },
            { id: 'task_control', text: window.t('onbStep10T3'), detail: 'Вкладка Контроль показує всі завдання команди з фільтрами по статусу, дедлайну і виконавцю. Це ваш головний інструмент контролю' },
        ],
        action: { label: window.t('onbStep5Action'), tab: 'tasks' },
        tip: '💡 Поставте собі тестове завдання і виконайте його — так ви зрозумієте як система виглядає з боку виконавця.'
    },
    {
        id: 'processes',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>',
        color: '#06b6d4',
        title: window.t('onbStep6Title'),
        subtitle: window.t('onbStep6Sub'),
        est: '20 хв',
        description: 'Процес — це повторювана послідовність завдань. Наприклад: "Прийом нового клієнта" або "Закриття місяця". Запустив процес — система автоматично створює всі завдання в правильному порядку.',
        tasks: [
            { id: 'proc_template', text: window.t('onbStep6T1'), detail: 'Процеси → "Новий процес". Дайте назву. Приклад: "Обробка нового замовлення"' },
            { id: 'proc_stages', text: window.t('onbStep6T2'), detail: 'Кожен етап — це завдання яке потрібно виконати. Вкажіть: хто відповідальний, скільки днів дається, який результат очікується' },
            { id: 'proc_launch', text: window.t('onbStep6T3'), detail: 'Натисніть "Запустити" — система автоматично створить всі завдання і призначить їх виконавцям. Відстежуйте прогрес у вкладці Процеси' },
        ],
        action: { label: window.t('onbStep6Action'), tab: 'processes' },
        tip: '💡 Почніть з одного найважливішого процесу. Наприклад: "Обробка нового клієнта від першого контакту до оплати".'
    },
    {
        id: 'telegram',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>',
        color: '#3b82f6',
        title: window.t('onbStep7Title'),
        subtitle: window.t('onbStep7Sub'),
        est: '15 хв',
        description: 'Telegram бот — це міст між системою і командою. Виконавці отримують нотифікації про нові завдання прямо в Telegram. Також бот може автоматично збирати ліди з клієнтів.',
        tasks: [
            { id: 'tg_botfather', text: window.t('botsCreateBot'), detail: 'Відкрийте Telegram, знайдіть @BotFather, напишіть /newbot, дайте назву і username. Отримаєте токен вигляду: 123456789:AAF...' },
            { id: 'tg_token', text: window.t('botsInsertToken'), detail: 'Бізнес → Інтеграції → секція Telegram → поле "Bot Token". Вставте токен і натисніть "Зберегти"' },
            { id: 'tg_webhook', text: window.t('botsSetupWebhook2'), detail: 'Після збереження токену натисніть "Налаштувати Webhook". Система автоматично зв\'яже бота з TALKO. Статус зміниться на "Підключено"' },
            { id: 'tg_test', text: 'Протестувати: створити завдання і перевірити нотифікацію', detail: 'Створіть будь-яке завдання і призначте собі. Відкрийте Telegram — повинно прийти повідомлення від бота' },
            { id: 'tg_funnel', text: 'Налаштувати першу воронку (необов\'язково)', detail: 'Бізнес → Боти → Ланцюги → "Новий ланцюг". Створіть автоматичну воронку для збору лідів або онбордингу нових клієнтів' },
        ],
        action: { label: window.t('onbOpenIntg'), tab: 'integrations' },
        tip: '💡 Виконавці в 3 рази частіше бачать завдання якщо отримують нотифікацію в Telegram. Це критично для дисципліни команди.'
    },
    {
        id: 'gcalendar',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>',
        color: '#ef4444',
        title: window.t('onbStep8Title'),
        subtitle: window.t('onbStep8Sub'),
        est: '20 хв',
        description: 'Синхронізація дозволяє бачити дедлайни завдань прямо в Google Calendar і навпаки — події з Calendar відображаються в розкладі TALKO. Налаштовується один раз для всієї компанії.',
        tasks: [
            {
                id: 'gcal_project',
                text: 'Крок 1: Створити проєкт в Google Cloud Console',
                detail: `<div style="line-height:1.7;font-size:0.82rem;">
<b>1.</b> Відкрийте <a href="https://console.cloud.google.com" target="_blank" style="color:#3b82f6;">console.cloud.google.com</a><br>
<b>2.</b> Натисніть window.t('sitesSelectProject') → "Новий проєкт"<br>
<b>3.</b> Назва: <code style="background:#f1f5f9;padding:1px 5px;border-radius:3px;">TALKO Sync</code> → Створити<br>
<b>4.</b> Переконайтесь що активний саме цей проєкт
</div>`
            },
            {
                id: 'gcal_api',
                text: 'Крок 2: Увімкнути Google Calendar API',
                detail: `<div style="line-height:1.7;font-size:0.82rem;">
<b>1.</b> В Google Cloud Console: Меню → "APIs & Services" → "Library"<br>
<b>2.</b> Знайдіть <b>"Google Calendar API"</b> → натисніть "Enable"<br>
<b>3.</b> Зачекайте 30 секунд поки активується
</div>`
            },
            {
                id: 'gcal_oauth',
                text: 'Крок 3: Налаштувати OAuth 2.0 credentials',
                detail: `<div style="line-height:1.7;font-size:0.82rem;">
<b>1.</b> APIs & Services → "Credentials" → "+ Create Credentials" → "OAuth client ID"<br>
<b>2.</b> Application type: <b>Web application</b><br>
<b>3.</b> Authorized redirect URIs додайте:<br>
<code style="background:#f1f5f9;padding:2px 6px;border-radius:3px;font-size:0.78rem;display:block;margin:4px 0;">https://YOUR-RAILWAY-DOMAIN/auth/google/callback</code>
<b>4.</b> Збережіть — отримаєте <b>Client ID</b> та <b>Client Secret</b>
</div>`
            },
            {
                id: 'gcal_consent',
                text: 'Крок 4: Налаштувати OAuth consent screen',
                detail: `<div style="line-height:1.7;font-size:0.82rem;">
<b>1.</b> APIs & Services → "OAuth consent screen"<br>
<b>2.</b> User Type: <b>External</b> → Create<br>
<b>3.</b> App name: <b>TALKO</b>, підтримуючий email: ваш email<br>
<b>4.</b> Scopes → Add: <code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;">calendar.events</code> та <code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;">calendar.readonly</code><br>
<b>5.</b> Test users → додайте свій email та email команди
</div>`
            },
            {
                id: 'gcal_talko',
                text: 'Крок 5: Вставити credentials в TALKO',
                detail: `<div style="line-height:1.7;font-size:0.82rem;">
<b>1.</b> TALKO → Бізнес → Інтеграції → секція "Google Calendar"<br>
<b>2.</b> Вставте <b>Client ID</b> та <b>Client Secret</b><br>
<b>3.</b> Натисніть <b>window.t('onbStep8Action')</b><br>
<b>4.</b> Відкриється вікно авторизації Google → дайте дозволи<br>
<b>5.</b> Статус зміниться на <span style="color:#22c55e;font-weight:700;">✓ Підключено</span>
</div>`
            },
            {
                id: 'gcal_sync',
                text: 'Крок 6: Перевірити синхронізацію',
                detail: `<div style="line-height:1.7;font-size:0.82rem;">
<b>1.</b> Створіть завдання з дедлайном на завтра<br>
<b>2.</b> Відкрийте Google Calendar — через 1-2 хвилини має з'явитись подія<br>
<b>3.</b> Перемістіть подію в Calendar на інший день → в TALKO дедлайн оновиться автоматично
</div>`
            },
        ],
        action: { label: window.t('onbOpenIntg'), tab: 'integrations' },
        tip: '💡 Синхронізація працює через webhook — зміни в обидва боки відображаються протягом 1-2 хвилин.'
    },
    {
        id: 'crm',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        color: '#f97316',
        title: window.t('crmOnboardingTitle'),
        subtitle: window.t('onbStep9Sub'),
        est: '15 хв',
        description: 'CRM в TALKO пов\'язаний із завданнями і ботами. Нові ліди з Telegram воронки автоматично потрапляють в CRM. Ви ведете угоди по стадіях до закриття.',
        tasks: [
            { id: 'crm_pipeline', text: window.t('onbStep9T2'), detail: 'CRM → Налаштування → Воронки. Стандартні стадії: Лід → Переговори → Пропозиція → Рахунок → Оплата. Перейменуйте під свою нішу' },
            { id: 'crm_deal', text: window.t('crmCreateFirstDeal'), detail: 'CRM → кнопка "+ Угода". Вкажіть назву, суму, клієнта і стадію. Спробуйте перетягнути картку між стадіями' },
            { id: 'crm_activity', text: window.t('crmAddActivity'), detail: window.t('crmActivitiesHint') },
            { id: 'crm_client', text: window.t('crmCheckClients'), detail: 'CRM → Клієнти. Клієнти автоматично додаються при створенні угоди або з Telegram боту. Тут зберігається вся база контактів' },
        ],
        action: { label: window.t('crmOpen'), tab: 'crm' },
        tip: '💡 Підключіть Telegram бота і воронку — нові ліди будуть автоматично з\'являтись в CRM без ручного введення.'
    },
    {
        id: 'analytics',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        color: '#8b5cf6',
        title: window.t('onbStep10Title'),
        subtitle: window.t('onbStep10Sub'),
        est: '10 хв',
        description: 'Аналітика показує де бізнес "тече". Статистика по завданнях, KPI по функціях, метрики продажів і ефективності команди — все в одному місці. Перегляньте дашборди після першого тижня роботи.',
        tasks: [
            { id: 'stats_metrics', text: 'Додати ключові метрики бізнесу', detail: 'Аналітика → Статистика → "+ Метрика". Приклади: "Виручка", "Кількість нових клієнтів", "Завдань виконано вчасно %"' },
            { id: 'stats_kpi', text: window.t('onbStep10T2'), detail: 'Аналітика → Ефективність. Тут видно виконання по кожній функції і кожному співробітнику' },
            { id: 'stats_control', text: 'Налаштувати вкладку Контроль для себе', detail: 'Вкладка Контроль → фільтри. Збережіть зручне налаштування — це ваш щоденний дашборд керівника' },
            { id: 'stats_radar', text: window.t('onbStep10T1'), detail: 'Аналітика → Ефективність → RADAR. Показує "вузькі місця" в команді — де найбільше прострочень і де падає продуктивність' },
        ],
        action: { label: window.t('onbStep10Action'), tab: 'analytics' },
        tip: '💡 Дивіться аналітику раз на тиждень, не рідше. Без регулярного аналізу цифр система перетворюється на ще один таск-менеджер.'
    },
];

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
let ob = {
    progress: {},   // { stepId: { done: true, tasks: {taskId: true} } }
    activeStep: 0,
    loaded: false,
};

// ─────────────────────────────────────────────────────────
// FIRESTORE
// ─────────────────────────────────────────────────────────
async function obLoad() {
    if (!window.currentCompany) return;
    try {
        const doc = await window.companyRef().collection('settings').doc('onboarding').get();
        if (doc.exists) ob.progress = doc.data().progress || {};
    } catch(e) { /* тихо */ }
    ob.loaded = true;
}

async function obSave() {
    if (!window.currentCompany) return;
    try {
        await window.companyRef().collection('settings').doc('onboarding').set(
            { progress: ob.progress, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );
    } catch(e) { /* тихо */ }
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function stepDoneCount(step) {
    const p = ob.progress[step.id];
    if (!p) return 0;
    return step.tasks.filter(t => p.tasks && p.tasks[t.id]).length;
}
function stepComplete(step) {
    return stepDoneCount(step) === step.tasks.length;
}
function totalProgress() {
    const done = OB_STEPS.filter(s => stepComplete(s)).length;
    return Math.round(done / OB_STEPS.length * 100);
}

// ─────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────
function renderOnboarding() {
    const c = document.getElementById('onboardingTab');
    if (!c) return;

    const pct = totalProgress();
    const completedSteps = OB_STEPS.filter(s => stepComplete(s)).length;
    const step = OB_STEPS[ob.activeStep];

    c.innerHTML = `
    <div style="display:flex;height:calc(100vh - 56px);background:#f8fafc;overflow:hidden;">

        <!-- ЛІВА ПАНЕЛЬ: список кроків -->
        <div style="width:280px;flex-shrink:0;background:white;border-right:1px solid #e8eaed;
            display:flex;flex-direction:column;overflow:hidden;">

            <!-- Заголовок + прогрес -->
            <div style="padding:1.25rem 1rem 1rem;border-bottom:1px solid #f1f5f9;">
                <div style="font-weight:800;font-size:1rem;color:#111827;margin-bottom:0.15rem;">
                    TALKO OS Онбординг
                </div>
                <div style="font-size:0.72rem;color:#9ca3af;margin-bottom:0.75rem;">
                    ${completedSteps} з ${OB_STEPS.length} кроків виконано
                </div>
                <!-- Загальний прогрес бар -->
                <div style="background:#f1f5f9;border-radius:999px;height:8px;">
                    <div style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);
                        width:${pct}%;border-radius:999px;transition:width 0.4s;"></div>
                </div>
                <div style="text-align:right;font-size:0.7rem;font-weight:700;color:#22c55e;margin-top:3px;">${pct}%</div>
            </div>

            <!-- Список кроків -->
            <div style="flex:1;overflow-y:auto;padding:0.5rem;">
                ${OB_STEPS.map((s, i) => {
                    const done = stepComplete(s);
                    const active = i === ob.activeStep;
                    const cnt = stepDoneCount(s);
                    return `
                    <div onclick="obSelectStep(${i})"
                        style="display:flex;align-items:center;gap:0.65rem;padding:0.6rem 0.65rem;
                        border-radius:10px;cursor:pointer;margin-bottom:2px;
                        background:${active ? '#f0fdf4' : 'transparent'};
                        border:1px solid ${active ? '#bbf7d0' : 'transparent'};
                        transition:all 0.15s;"
                        onmouseover="if(${!active})this.style.background='#f9fafb'"
                        onmouseout="if(${!active})this.style.background='transparent'">
                        <!-- Іконка статусу -->
                        <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                            background:${done ? '#22c55e' : active ? s.color+'18' : '#f1f5f9'};
                            display:flex;align-items:center;justify-content:center;">
                            ${done
                                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
                                : `<span style="font-size:0.7rem;font-weight:800;color:${active ? s.color : '#9ca3af'};">${i+1}</span>`
                            }
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:0.8rem;font-weight:${active?'700':'500'};
                                color:${done?'#22c55e':active?'#111827':'#374151'};
                                overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                ${s.title}
                            </div>
                            <div style="font-size:0.68rem;color:#9ca3af;">${s.est} · ${cnt}/${s.tasks.length}</div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <!-- ПРАВА ПАНЕЛЬ: деталі кроку -->
        <div style="flex:1;overflow-y:auto;padding:1.5rem 2rem;">
            <div style="max-width:680px;margin:0 auto;">

                <!-- Хедер кроку -->
                <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.5rem;">
                    <div style="width:52px;height:52px;border-radius:14px;flex-shrink:0;
                        background:${step.color}18;
                        display:flex;align-items:center;justify-content:center;color:${step.color};">
                        ${step.icon}
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:0.72rem;font-weight:700;color:${step.color};
                            text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">
                            ${step.subtitle}
                        </div>
                        <div style="font-size:1.25rem;font-weight:800;color:#111827;line-height:1.3;">
                            ${step.title}
                        </div>
                        <div style="font-size:0.75rem;color:#9ca3af;margin-top:3px;">
                            Орієнтовний час: <b>${step.est}</b>
                        </div>
                    </div>
                    <!-- Кнопка переходу -->
                    <button onclick="obGoToTab('${step.action.tab}')"
                        style="padding:0.5rem 1rem;background:${step.color};color:white;border:none;
                        border-radius:9px;cursor:pointer;font-size:0.8rem;font-weight:700;
                        white-space:nowrap;display:flex;align-items:center;gap:6px;flex-shrink:0;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        ${step.action.label}
                    </button>
                </div>

                <!-- Опис -->
                <div style="background:white;border-radius:12px;padding:1rem 1.25rem;
                    border:1px solid #e8eaed;margin-bottom:1.25rem;
                    font-size:0.85rem;color:#374151;line-height:1.65;">
                    ${step.description}
                </div>

                <!-- Завдання чекліст -->
                <div style="background:white;border-radius:12px;border:1px solid #e8eaed;
                    margin-bottom:1.25rem;overflow:hidden;">
                    <div style="padding:0.75rem 1.25rem;border-bottom:1px solid #f1f5f9;
                        display:flex;align-items:center;justify-content:space-between;">
                        <div style="font-weight:700;font-size:0.85rem;color:#111827;">Кроки виконання</div>
                        <div style="font-size:0.72rem;color:#9ca3af;">
                            ${stepDoneCount(step)}/${step.tasks.length} виконано
                        </div>
                    </div>
                    ${step.tasks.map((task, ti) => {
                        const checked = ob.progress[step.id]?.tasks?.[task.id] || false;
                        return `
                        <div style="padding:0.85rem 1.25rem;border-bottom:${ti < step.tasks.length-1 ? '1px solid #f9fafb' : 'none'};">
                            <div style="display:flex;align-items:flex-start;gap:0.75rem;">
                                <!-- Checkbox -->
                                <div onclick="obToggleTask('${step.id}','${task.id}')"
                                    style="width:20px;height:20px;border-radius:6px;flex-shrink:0;margin-top:1px;
                                    cursor:pointer;border:2px solid ${checked ? '#22c55e' : '#d1d5db'};
                                    background:${checked ? '#22c55e' : 'white'};
                                    display:flex;align-items:center;justify-content:center;
                                    transition:all 0.15s;">
                                    ${checked ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
                                </div>
                                <div style="flex:1;">
                                    <div style="font-size:0.85rem;font-weight:600;
                                        color:${checked ? '#9ca3af' : '#111827'};
                                        text-decoration:${checked ? 'line-through' : 'none'};
                                        margin-bottom:${task.detail ? '0.35rem' : '0'};">
                                        ${task.text}
                                    </div>
                                    ${task.detail ? `
                                    <div style="font-size:0.78rem;color:#6b7280;line-height:1.6;
                                        background:#f8fafc;border-radius:7px;padding:0.5rem 0.75rem;
                                        border-left:3px solid ${step.color}40;">
                                        ${task.detail}
                                    </div>` : ''}
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>

                <!-- Підказка -->
                <div style="background:${step.color}08;border:1px solid ${step.color}25;
                    border-radius:10px;padding:0.85rem 1.1rem;margin-bottom:1.5rem;
                    font-size:0.82rem;color:#374151;line-height:1.6;">
                    ${step.tip}
                </div>

                <!-- Навігація між кроками -->
                <div style="display:flex;gap:0.75rem;justify-content:space-between;">
                    <button onclick="obPrevStep()"
                        ${ob.activeStep === 0 ? 'disabled' : ''}
                        style="padding:0.6rem 1.25rem;background:white;color:#374151;
                        border:1.5px solid #e8eaed;border-radius:9px;cursor:pointer;
                        font-size:0.82rem;font-weight:600;opacity:${ob.activeStep===0?'0.4':'1'};">
                        ← Попередній
                    </button>
                    ${stepComplete(step) && ob.activeStep < OB_STEPS.length - 1 ? `
                    <button onclick="obNextStep()"
                        style="padding:0.6rem 1.5rem;background:#22c55e;color:white;border:none;
                        border-radius:9px;cursor:pointer;font-size:0.82rem;font-weight:700;">
                        Наступний крок →
                    </button>` : ob.activeStep < OB_STEPS.length - 1 ? `
                    <button onclick="obNextStep()"
                        style="padding:0.6rem 1.5rem;background:white;color:#9ca3af;
                        border:1.5px solid #e8eaed;border-radius:9px;cursor:pointer;font-size:0.82rem;font-weight:600;">
                        Пропустити →
                    </button>` : `
                    <div style="padding:0.6rem 1.25rem;background:#f0fdf4;color:#22c55e;
                        border:1.5px solid #bbf7d0;border-radius:9px;font-size:0.82rem;font-weight:700;">
                        🎉 Онбординг завершено!
                    </div>`}
                </div>

            </div>
        </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────
window.obSelectStep = function(i) {
    ob.activeStep = i;
    renderOnboarding();
};

window.obToggleTask = async function(stepId, taskId) {
    if (!ob.progress[stepId]) ob.progress[stepId] = { tasks: {} };
    if (!ob.progress[stepId].tasks) ob.progress[stepId].tasks = {};
    ob.progress[stepId].tasks[taskId] = !ob.progress[stepId].tasks[taskId];

    // Якщо всі завдання кроку виконані — позначаємо крок як done
    const step = OB_STEPS.find(s => s.id === stepId);
    if (step && stepComplete(step)) {
        ob.progress[stepId].done = true;
        if (window.showToast) showToast(`✓ Крок "${step.title}" виконано!`, 'success');
    }

    renderOnboarding();
    await obSave();
};

window.obNextStep = function() {
    if (ob.activeStep < OB_STEPS.length - 1) {
        ob.activeStep++;
        renderOnboarding();
    }
};

window.obPrevStep = function() {
    if (ob.activeStep > 0) {
        ob.activeStep--;
        renderOnboarding();
    }
};

window.obGoToTab = function(tab) {
    if (typeof switchTab === 'function') switchTab(tab);
    if (tab === 'coordination' && window._initCoordTab) setTimeout(window._initCoordTab, 100);
};

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
async function initOnboarding() {
    await obLoad();
    renderOnboarding();
}

window.initOnboarding = initOnboarding;

// Реєструємо в switchTab
if (window.onSwitchTab) {
    window.onSwitchTab('onboarding', initOnboarding);
} else {
    let t = 0;
    const iv = setInterval(() => {
        if (window.onSwitchTab) { window.onSwitchTab('onboarding', initOnboarding); clearInterval(iv); }
        else if (++t > 30) clearInterval(iv);
    }, 100);
}

// Додаємо case в switchTab
const _origSwitchTab = window.switchTab;

})();
