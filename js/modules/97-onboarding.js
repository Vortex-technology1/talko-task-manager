// ============================================================
// 97-onboarding.js — TALKO OS Onboarding v2
// welcome screen + block progress + learning & settings steps
// ============================================================

(function() {

// ─── BLOCKS ────────────────────────────────────────────────
const OB_BLOCKS = [
    { id: 'start',        label: 'Старт',        color: '#6366f1', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2l9-9a3.5 3.5 0 0 0-5-5l-7 11z"/><path d="M10 14l4-4"/></svg>' },
    { id: 'tasks',        label: 'Завдання',      color: '#22c55e', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
    { id: 'myday',        label: 'Мій день',      color: '#f59e0b', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2m-4.93-7.07-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>' },
    { id: 'system',       label: 'Система',       color: '#8b5cf6', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M2 12h2M20 12h2M12 2v2M12 20v2"/></svg>' },
    { id: 'projects',     label: 'Проєкти',       color: '#3b82f6', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' },
    { id: 'coordination', label: 'Координації',   color: '#f59e0b', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    { id: 'analytics',    label: 'Аналітика',     color: '#8b5cf6', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
    { id: 'finance',      label: 'Фінанси',       color: '#10b981', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
    { id: 'business',     label: 'Бізнес',        color: '#f97316', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>' },
    { id: 'learning',     label: 'Навчання',      color: '#0ea5e9', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' },
];

// ─── STEPS ─────────────────────────────────────────────────
const INFO_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" style="flex-shrink:0;vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
const WARN_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="flex-shrink:0;vertical-align:middle;margin-right:4px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
const AI_BTN = '<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#10b981;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;margin-top:4px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>';

const OB_STEPS = [

// ══ БЛОК 0 — СТАРТ ══════════════════════════════════════════
{
    id: 'setup_company', block: 'start', color: '#6366f1',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    title: 'Налаштування компанії', subtitle: 'Блок 0 · Старт', est: '5 хв',
    description: '<b>Перший крок перед усім.</b> Без базових налаштувань система працює некоректно — неправильний час у дедлайнах, безіменна компанія, відсутність нотифікацій.<br><br><b>Назва компанії</b> — відображається скрізь: в запрошеннях, звітах, протоколах координацій.<br><b>Часовий пояс</b> — критично для дедлайнів і нагадувань.<br><b>Щотижневий звіт</b> — власник отримує зведення по виконанню завдань кожного тижня автоматично.<br><br><b>Де знайти:</b> Система → Співробітники → вкладка «Компанія» (видна тільки Owner).<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#6366f1;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'sc1', text:'Відкрити Система → Співробітники → вкладка «Компанія»', detail:'Вкладка видима тільки для власника (Owner).' },
        { id:'sc2', text:'Ввести назву компанії і зберегти', detail:'Назва відображається в запрошеннях і заголовку системи.' },
        { id:'sc3', text:'Перевірити часовий пояс — встановити правильний', detail:'За замовчуванням Київ (UTC+2/+3). Якщо команда в іншому поясі — змінити.' },
        { id:'sc4', text:'Увімкнути щотижневий звіт власнику', detail:'Щопонеділка отримуєте зведення по виконанню.' },
    ],
    action: { label:'Відкрити налаштування', tab:'users' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Налаштування компанії — 5 хвилин один раз. Без правильного часового поясу всі нагадування будуть зміщені.'
},
{
    id: 'setup_telegram', block: 'start', color: '#6366f1',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>',
    title: 'Підключення Telegram', subtitle: 'Блок 0 · Старт', est: '5 хв',
    description: '<b>Біль без цього:</b> завдання поставлено — виконавець не знає. Дедлайн прийшов — нічого не нагадало.<br><br>Без Telegram нотифікацій:<br>— Нові завдання не повідомляються<br>— Дедлайни не нагадуються<br>— Прострочення нікуди не сигналять<br>— Рішення координацій не надходять<br><br><b>Як підключити:</b> відкрийте свій профіль (кнопка з іменем вгорі праворуч) → розділ «Telegram сповіщення» → «Підключити Telegram» → бот → /start.<br><br><b>Кожен співробітник підключає самостійно</b> після реєстрації.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#6366f1;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'tg1', text:'Відкрити профіль → знайти розділ «Telegram сповіщення»', detail:'Клікніть на своє ім\'я або аватар вгорі праворуч.' },
        { id:'tg2', text:'Натиснути «Підключити Telegram» і пройти процес', detail:'Відкриється бот TALKO. Натисніть /start → система підтвердить підключення.' },
        { id:'tg3', text:'Перевірити — надіслати тестове завдання собі', detail:'Завдання де ви виконавець → через 10-20 секунд має прийти повідомлення.' },
        { id:'tg4', text:'Попросити кожного співробітника підключити Telegram після реєстрації', detail:'Без цього нотифікації не працюють. Зробіть це обов\'язковою умовою.' },
    ],
    action: { label:'Відкрити профіль', tab:'myday' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"/><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/></svg> Telegram — не бонус, це обов\'язок. Якщо хтось не підключив — вони поза системою.'
},
{
    id: 'setup_invite', block: 'start', color: '#6366f1',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
    title: 'Запрошення команди', subtitle: 'Блок 0 · Старт', est: '10 хв',
    description: '<b>Біль без цього:</b> система налаштована — але в ній тільки власник. Вся цінність TALKO — в тому що команда в системі.<br><br><b>Процес:</b> Система → Співробітники → «Запросити» → Email → роль → надіслати.<br><br><b>Ролі:</b><br>— <b>Owner</b> — бачить і може все<br>— <b>Manager</b> — бачить свою команду і аналітику<br>— <b>Employee</b> — бачить тільки свої завдання<br><br><b>Правило:</b> починайте з мінімально необхідних прав.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#6366f1;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'inv1', text:'Скласти список співробітників яких потрібно запросити', detail:'Починайте з 3-5 ключових людей. Не всі одразу.' },
        { id:'inv2', text:'Запросити першого співробітника через Система → Співробітники', detail:'Кнопка «Запросити» → email → роль → надіслати. Людина отримає лист протягом хвилини.' },
        { id:'inv3', text:'Переконатись що запрошений зареєструвався і з\'явився в списку', detail:'Оновіть список. Новий член команди має з\'явитись зі статусом «Активний».' },
        { id:'inv4', text:'Призначити новому співробітнику перше тестове завдання', detail:'Це закріпить навичку і покаже що система живе.' },
    ],
    action: { label:'Відкрити співробітники', tab:'users' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"/><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/></svg> Помилка: запрошувати всіх одразу. Краще 3-5 ключових → налагодити процес → решта.'
},

// ══ БЛОК 1 — ЗАВДАННЯ ════════════════════════════════════════
{
    id: 'tasks_views', block: 'tasks', color: '#22c55e',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14l2 2 4-4"/></svg>',
    title: 'Завдання: види відображення та фільтри', subtitle: 'Блок 1 · Завдання', est: '10 хв',
    description: '<b>Біль без цього:</b> керівник не розуміє що відбувається, команда тримає завдання в месенджерах.<br><br><b>6 видів відображення:</b><br>— <b>День</b> — що зробити сьогодні<br>— <b>Тиждень</b> — картина на 7 днів<br>— <b>Місяць</b> — стратегічний вид<br>— <b>Список</b> — всі завдання рядком<br>— <b>Канбан</b> — по стовпцях статусів<br>— <b>Терміни</b> — Gantt-схема<br><br><b>Фільтри:</b> по виконавцю, статусу, функції, дедлайну, пріоритету.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'v1', text:'Відкрити «Всі завдання» і переключити всі 6 видів', detail:'Кожен вид — інша задача управління. Канбан і Список — для щоденної роботи.' },
        { id:'v2', text:'Застосувати фільтр: обрати конкретного виконавця', detail:'Вгорі над списком — панель фільтрів. Оберіть ім\'я — одразу бачите лише їхні завдання.' },
        { id:'v3', text:'Застосувати фільтр по статусу «Прострочено»', detail:'Критичний фільтр для керівника. Одразу видно що «горить» і в кого.' },
        { id:'v4', text:'Знайти завдання через глобальний пошук', detail:'Рядок пошуку зверху. Шукає по назві, коментарях, іменах. Працює миттєво.' },
    ],
    action: { label:'Відкрити завдання', tab:'tasks' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Канбан-вид — ідеальний для щотижневого огляду з командою. Видно де стопор і чому не рухається.'
},
{
    id: 'tasks_anatomy', block: 'tasks', color: '#22c55e',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    title: 'Завдання: анатомія і правильна постановка', subtitle: 'Блок 1 · Завдання', est: '15 хв',
    description: '<b>Біль без цього:</b> виконавець зробив «своє», керівник чекав «інше». Перероблення, втрата часу.<br><br>Правильне завдання відповідає: <i>хто, що, до коли, що є результатом, хто перевіряє.</i><br><br>— <b>Назва</b> — конкретна дія (не «Реклама», а «Запустити Facebook рекламу до п\'ятниці»)<br>— <b>Виконавець</b> — одна людина<br>— <b>Дедлайн</b> — конкретна дата і час<br>— <b>Пріоритет</b> — Критичний / Високий / Середній / Низький<br>— <b>Очікуваний результат</b> — ЩО має бути зроблено<br>— <b>Формат звіту</b> — ЯК звітує виконавець<br>— <b>Чекліст, нагадування, перевірка, коментарі та файли</b><br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'a1', text:'Створити тестове завдання з повним заповненням всіх полів', detail:'Назва, виконавець, дедлайн, пріоритет, очікуваний результат, формат звіту.' },
        { id:'a2', text:'Додати до завдання чекліст з 3 підпунктів', detail:'Всередині завдання — розділ «Чекліст» → «Додати пункт».' },
        { id:'a3', text:'Поставити нагадування на завтра о 9:00', detail:'Виконавець отримає повідомлення в Telegram у вказаний час.' },
        { id:'a4', text:'Включити «Перевірку після виконання»', detail:'Після відмітки done — статус «На перевірці». Контролер отримує сигнал.' },
        { id:'a5', text:'Написати коментар і прикріпити файл', detail:'Вся переписка залишається всередині завдання назавжди.' },
    ],
    action: { label:'Відкрити завдання', tab:'tasks' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Правило: якщо виконавець може зробити завдання без жодного додаткового питання — поставлено правильно.'
},
{
    id: 'regular_tasks', block: 'tasks', color: '#22c55e',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
    title: 'Регулярні завдання: автоматизація рутини', subtitle: 'Блок 1 · Завдання', est: '10 хв',
    description: '<b>Біль без цього:</b> щотижня вручну ставите одні й ті ж завдання. Це 2-3 години на місяць тільки на постановку.<br><br>Налаштовуєте один раз → система ставить автоматично → виконавець отримує нотифікацію в Telegram.<br><br>— <b>Щоденні</b> — з\'являються кожного ранку<br>— <b>Щотижневі</b> — у визначений день тижня<br>— <b>Щомісячні</b> — у визначену дату місяця<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'reg1', text:'Відкрити вкладку «Регулярні завдання»', detail:'Завдання → «Регулярні» або через меню «Всі завдання».' },
        { id:'reg2', text:'Визначити 3 завдання що ви ставите вручну щотижня', detail:'Наприклад: звіт, планерка, перевірка показників.' },
        { id:'reg3', text:'Створити щотижневе регулярне завдання з нагадуванням', detail:'Кнопка «+ Регулярне» → виконавець, день тижня, час нагадування, результат.' },
        { id:'reg4', text:'Перевірити що завдання автоматично з\'явилось у виконавця', detail:'Фільтр по виконавцю → регулярне завдання вже там з дедлайном.' },
    ],
    action: { label:'Відкрити регулярні', tab:'tasks' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Золоте правило: будь-яке завдання що ви ставите більше 2 разів — автоматизуйте.'
},

// ══ БЛОК 2 — МІЙ ДЕНЬ ════════════════════════════════════════
{
    id: 'myday', block: 'myday', color: '#f59e0b',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2m-4.93-7.07-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>',
    title: 'Мій день: фокус і планування', subtitle: 'Блок 2 · Мій день', est: '5 хв',
    description: '<b>Біль без цього:</b> людина приходить на роботу і не знає з чого почати. Або хапається за все і нічого не доробляє до кінця.<br><br><b>«Мій день»</b> — персональний екран. Показує тільки те що потрібно зробити СЬОГОДНІ.<br><br>— <b>Звичайний вид</b> — всі завдання на сьогодні з дедлайнами по пріоритету<br>— <b>Режим «Фокус»</b> — одне завдання на весь екран. Виконав → «Готово» → наступне. Без відволікань.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'m1', text:'Відкрити «Мій день» і переглянути завдання на сьогодні', detail:'Якщо завдань немає — створіть тестове з дедлайном сьогодні.' },
        { id:'m2', text:'Перемкнути в режим «Фокус» і виконати одне завдання', detail:'Кнопка «Фокус» вгорі вкладки. Натисніть «Готово» — система переходить до наступного.' },
    ],
    action: { label:'Відкрити Мій день', tab:'myday' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Попросіть команду починати день з «Мого дня». 5 хвилин зранку — і кожен знає свій план.'
},

// ══ БЛОК 3 — СИСТЕМА ══════════════════════════════════════════
{
    id: 'functions', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>',
    title: 'Функції: відділи і KPI бізнесу', subtitle: 'Блок 3 · Система', est: '15 хв',
    description: '<b>Біль без цього:</b> завдання висять «у повітрі» без прив\'язки до відділу. Аналітика не показує де навантаження і де прогалини.<br><br><b>Функції</b> — це відділи вашого бізнесу. Кожна функція має:<br>— <b>Відповідального</b> — хто керує цим напрямком<br>— <b>KPI</b> — конкретні цифри результату<br>— <b>Завдання</b> — все що виконується в цьому відділі<br><br><b>Приклади функцій:</b> Продажі, Маркетинг, Фінанси, HR, Операційна, Клієнтський сервіс.<br><br><b>KPI — це числа, не побажання:</b><br>— Правильно: «20 нових клієнтів на місяць»<br>— Неправильно: «Збільшити продажі»<br><br><b>Два режими перегляду:</b><br>— <b>Картки</b> — детальна інформація по кожній функції<br>— <b>Структура</b> — схема зв\'язків між відділами<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'f1', text:'Відкрити Система → Функції', detail:'Якщо функцій немає — аналітика по відділах не працює. Без цього кроку завдання не прив\'язуються до напрямків бізнесу.' },
        { id:'f2', text:'Визначити і створити мінімум 3 ключові функції свого бізнесу', detail:'Кнопка «+ Функція» → назва відділу → призначити відповідального. Починайте з найважливіших: Продажі, Операційна, Фінанси.' },
        { id:'f3', text:'До кожної функції додати мінімум 1 KPI з конкретним числом', detail:'Всередині функції → розділ «KPI» → «+ Додати KPI». Формат: «Назва — ціль — одиниця виміру». Приклад: Нові угоди — 20 — шт/місяць.' },
        { id:'f4', text:'Переключитись в режим «Структура» і перевірити схему', detail:'Кнопка «Структура» вгорі вкладки. Видно ієрархію відділів і зв\'язки між ними. Якщо щось не так — поверніться в картки і виправте.' },
        { id:'f5', text:'Прив\'язати існуючі завдання до відповідних функцій', detail:'Відкрийте будь-яке завдання → поле «Функція» → оберіть відділ. Без цього завдання «висять» поза структурою.' },
    ],
    action: { label:'Відкрити функції', tab:'functions' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Мінімум: 3–5 функцій з KPI. Це фундамент аналітики. Без функцій звіт по відділах порожній — ви не бачите де реально губиться час і гроші.'
},
{
    id: 'bizstructure', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><rect x="1" y="18" width="6" height="4" rx="1"/><rect x="9" y="18" width="6" height="4" rx="1"/><rect x="17" y="18" width="6" height="4" rx="1"/><path d="M4 18v-3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"/><line x1="12" y1="6" x2="12" y2="14"/></svg>',
    title: 'Структура: організаційна схема компанії', subtitle: 'Блок 3 · Система', est: '10 хв',
    description: '<b>Біль без цього:</b> команда не розуміє хто кому підпорядковується. Новий співробітник не знає до кого звертатись. Керівник не бачить всю картину одразу.<br><br><b>Структура</b> — це інтерактивна організаційна схема вашої компанії:<br>— Відділи і підрозділи<br>— Ієрархія підпорядкування<br>— Кожен співробітник на своєму місці<br>— Кількість завдань і навантаження по кожному<br><br><b>Структура будується автоматично</b> на основі функцій і співробітників. Якщо функції заповнені — структура вже є.<br><br><b>Що видно в картці співробітника:</b><br>— Роль і відділ<br>— Активні завдання і статуси<br>— Навантаження і ефективність<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'bs1', text:'Відкрити Система → Структура', detail:'Відображається організаційна схема. Якщо порожня — спочатку заповніть Функції (попередній крок).' },
        { id:'bs2', text:'Перевірити що всі відділи і підрозділи відображаються коректно', detail:'Порівняйте з реальною структурою бізнесу. Відділи мають відповідати вашим функціям.' },
        { id:'bs3', text:'Клікнути на картку будь-якого співробітника і переглянути деталі', detail:'Бачите: роль, відділ, активні завдання, навантаження. Звідси можна одразу перейти до завдань цієї людини.' },
        { id:'bs4', text:'Перевірити що кожен співробітник прив\'язаний до свого відділу', detail:'Якщо хтось «без відділу» — відкрийте його картку → змініть функцію/відділ.' },
    ],
    action: { label:'Відкрити структуру', tab:'bizstructure' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Структура — перше що показуйте новому менеджеру. Людина одразу розуміє де вона, хто поряд, хто вище. Економить 2–3 тижні адаптації.'
},
{
    id: 'team_management', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    title: 'Співробітники: ролі, доступи і запрошення', subtitle: 'Блок 3 · Система', est: '15 хв',
    description: '<b>Біль без цього:</b> всі бачать все — або навпаки, хтось не бачить потрібне. Доступи «на підозрі», а не на логіці.<br><br><b>Вкладка Співробітники</b> має 4 підрозділи:<br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">СПИСОК</b><br>Всі співробітники з роллю, відділом, статусом і навантаженням. Звідси — в картку кожного.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ЗАПРОСИТИ</b><br>Відправити email-запрошення → людина реєструється → одразу в системі з потрібною роллю.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">РОЛІ</b><br><b>Owner</b> — повний доступ до всього. <b>Manager</b> — свій відділ і аналітика. <b>Employee</b> — тільки свої завдання. Встановлюйте мінімально необхідне.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">КОМПАНІЯ</b><br>Назва, часовий пояс, щотижневий звіт власнику. Видно тільки Owner.</div></div><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'tm1', text:'Відкрити Система → Співробітники → вкладка «Список»', detail:'Перевірте всіх активних. Кожна картка — роль, відділ, кількість завдань.' },
        { id:'tm2', text:'Перевірити ролі кожного: чи відповідають реальним обов\'язкам', detail:'Клік на співробітника → «Змінити роль». Правило: мінімально необхідний доступ. Manager не потребує Owner.' },
        { id:'tm3', text:'Перейти на вкладку «Ролі» і вивчити матрицю доступів', detail:'Таблиця: хто що бачить. Owner — все. Manager — свій відділ + аналітика. Employee — тільки свої завдання і проєкти.' },
        { id:'tm4', text:'Запросити нового співробітника через вкладку «Запросити»', detail:'Email → роль → функція → «Надіслати». Людина отримає лист з інструкцією. Після реєстрації — одразу в списку.' },
        { id:'tm5', text:'Відкрити вкладку «Компанія» і перевірити налаштування (тільки Owner)', detail:'Назва компанії, часовий пояс, щотижневий звіт. Якщо часовий пояс неправильний — всі нагадування зміщені.' },
    ],
    action: { label:'Відкрити співробітників', tab:'users' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Помилка №1: всім дають Owner. Потім дивуються чому рядовий співробітник бачить фінанси і зарплати колег. Ролі — налаштуйте один раз правильно.'
},
{
    id: 'system_integrations', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    title: 'Інтеграції: підключення зовнішніх сервісів', subtitle: 'Блок 3 · Система', est: '15 хв',
    description: '<b>Біль без цього:</b> дані розкидані по різних сервісах. Дзвінок в телефонії — окремо. Подія в календарі — окремо. TALKO не знає що відбувається поза системою.<br><br><b>Доступні інтеграції:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">TELEGRAM</b><br>Нотифікації про нові завдання, дедлайни, рішення координацій. Підключає кожен співробітник самостійно в своєму профілі.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">GOOGLE CALENDAR</b><br>Синхронізація дедлайнів завдань з календарем. Всі дедлайни — автоматично в Google Calendar.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">ТЕЛЕФОНІЯ: BINOTEL / RINGOSTAT / STREAM</b><br>Дзвінки автоматично фіксуються. Пропущений дзвінок → завдання «Передзвонити» → виконавець → дедлайн. Нуль ручної роботи.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.55rem .85rem;"><b style="color:#7c3aed;font-size:.72rem;">WEBHOOK API</b><br>Підключення будь-яких зовнішніх систем: власний сайт, форми, інші CRM. Ліди і події — автоматично в TALKO.</div></div><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'int1', text:'Відкрити Бізнес → Інтеграції і переглянути всі доступні', detail:'Побачите список сервісів зі статусом «Підключено» або «Не підключено».' },
        { id:'int2', text:'Перевірити що Telegram підключений у вашому профілі', detail:'Клік на своє ім\'я вгорі праворуч → «Telegram сповіщення» → має бути «Підключено». Якщо ні — підключити прямо зараз.' },
        { id:'int3', text:'Підключити Google Calendar або переглянути інструкцію підключення', detail:'Інтеграції → Google Calendar → «Підключити» → авторизація Google. Після цього дедлайни синхронізуються автоматично.' },
        { id:'int4', text:'Якщо використовуєте Binotel, Ringostat або Stream — підключити телефонію', detail:'Інтеграції → оберіть провайдера → API ключ (в особистому кабінеті провайдера) → зберегти. Тестовий дзвінок → перевірити чи з\'явилось завдання.' },
        { id:'int5', text:'Попросити кожного співробітника підключити Telegram після реєстрації', detail:'Без цього нотифікації не приходять. Зробіть обов\'язковою умовою при онбордингу нового члена команди.' },
    ],
    action: { label:'Відкрити інтеграції', tab:'integrations' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Телефонія — найбільша точка втрат для бізнесів з вхідними дзвінками. Без інтеграції: пропущений дзвінок = втрачений клієнт. З інтеграцією: пропущений дзвінок → автозавдання → передзвін за 5 хвилин.'
},

// ══ БЛОК 3 — СИСТЕМА: CRM ═════════════════════════════════════
{
    id: 'crm_capabilities', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    title: 'CRM: управління угодами і клієнтами', subtitle: 'Блок 3 · Система', est: '30 хв',
    description: '<b>Без CRM:</b> менеджери тримають клієнтів в голові або в таблицях Excel. Угоди губляться. Ніхто не знає хто де і на якому етапі. Нові менеджери не знають передісторії.<br><br><div style="display:grid;gap:6px;margin:8px 0;">'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">KANBAN-ДОШКА УГОД</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> не знаєте на якому етапі яка угода. Менеджер тримає в голові 20 клієнтів і забуває передзвонити.<br>'
+'<b>Рішення:</b> всі угоди видно на одному екрані по стадіях. Перетягнули картку — стадія змінилась. Система фіксує хто куди і коли перейшов.<br>'
+'Стадії налаштовуються: Новий → Замір → КП відправлено → Погоджено → Виробництво → Монтаж → Закрито.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">КАРТКА УГОДИ — 4 ВКЛАДКИ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> інформація про клієнта розкидана по телефону, листуванню в WhatsApp і нотатках на папері. Новий менеджер не знає передісторії.<br>'
+'<b>Рішення:</b> вся інформація в одному місці. Деталі — всі поля. Активності — хронологія дзвінків і змін. Задачі — що треба зробити. AI — аналіз і рекомендації по угоді.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ПОЛЕ «ФІЛІАЛ»</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> при кількох офісах не розумієте звідки їхати на замір і хто відповідає за клієнта.<br>'
+'<b>Рішення:</b> поле Філіал (Прага / Брно / Братислава або ваші назви) визначає звідки їде замірник і монтажник, яка бригада, які розцінки.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ПОЛЕ «АДРЕСА ОБ\'ЄКТУ»</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> менеджер дзвонить замірнику і диктує адресу усно. Той записує на папері, плутається і приїжджає не туди.<br>'
+'<b>Рішення:</b> адреса зберігається в картці угоди. Замірник відкриває телефон — адреса вже там. Автоматично відображається на карті логістики для монтажників.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ПОЛЕ «ЗАМІРНИК + ДАТА ЗАМІРУ»</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> призначили замір усно або в WhatsApp. Замірник забув. Клієнт чекав — ніхто не приїхав. Репутація втрачена.<br>'
+'<b>Рішення:</b> вибрали замірника і вказали дату — система автоматично створює подію в його Google Calendar. Він отримує нагадування як на звичайну зустріч. Клієнту йде WhatsApp: «Замір призначено на [дата], замірник [ім\'я]».</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ПОЛЕ «МОНТАЖНИК + ДАТА МОНТАЖУ»</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> монтажник не знає куди їхати завтра. Телефонуєте вранці, він запитує адресу, ви шукаєте в переписці — втрачається час.<br>'
+'<b>Рішення:</b> призначили монтажника і вказали дату → подія в його Google Calendar з адресою, клієнтом і описом замовлення. Клієнту WhatsApp: «Монтаж [дата], майстер [ім\'я], телефон [номер]».</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ПОЛЕ «ПЕРЕДОПЛАТА І ЗАЛИШОК»</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> фінменеджер запитує «чи оплатили?» — менеджер лізе в WhatsApp, шукає скрін переказу. Ніхто не веде облік хто скільки заборгував.<br>'
+'<b>Рішення:</b> вводите суму передоплати → система автоматично рахує залишок (загальна сума мінус передоплата). При введенні передоплати — запускається задача «Старт виробництва» для цеху.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ФІЛЬТРИ І ПОШУК УГОД</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> 50 угод в таблиці, потрібно знайти всіх клієнтів з Instagram у Брно, у яких замір цього тижня. Доводиться гортати вручну.<br>'
+'<b>Рішення:</b> фільтрація по будь-якій комбінації — стадія + відповідальний + джерело + тег + сума. Результат — секунда.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">BULK-ОПЕРАЦІЇ (МАСОВІ ДІЇ)</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> потрібно перевести 15 угод на нового менеджера бо попередній звільнився. Переходите в кожну вручну — 15 відкриттів, 15 змін, 15 збережень.<br>'
+'<b>Рішення:</b> виділяєте всі 15 → «Змінити відповідального» → один клік. Те саме з тегами, стадіями, видаленням.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ЛОГ ДЗВІНКІВ І АКТИВНОСТІ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> клієнт каже «я вам дзвонив тиждень тому і ми домовились на знижку». Ніхто не пам\'ятає. Виникає конфлікт.<br>'
+'<b>Рішення:</b> кожен дзвінок логується — дата, тривалість, результат, нотатка. Всі зміни стадій в хронології. Новий менеджер бачить всю передісторію за 30 секунд.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">БАЗА КЛІЄНТІВ З АВТО-ДЕДУБЛІКАЦІЄЮ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> той самий клієнт є двічі в базі — один раз менеджер Іра додала, другий — менеджер Петро. Дзвонять двічі, клієнт злиться.<br>'
+'<b>Рішення:</b> при додаванні нового клієнта система автоматично перевіряє чи є вже такий телефон. Якщо є — показує попередження перед збереженням.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">АНАЛІТИКА CRM: КОНВЕРСІЯ І ДЖЕРЕЛА</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> витрачаєте гроші на рекламу в Instagram але не знаєте звідки насправді приходять клієнти які платять. Маркетинговий бюджет йде навмання.<br>'
+'<b>Рішення:</b> по кожному джерелу (Instagram / Facebook / сайт / рекомендація / дизайнер) — скільки лідів, скільки дійшли до оплати, яка конверсія і яка виручка. Видно де реально гроші.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">KPI МЕНЕДЖЕРІВ В CRM</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> не знаєте хто з менеджерів реально продає, а хто просто веде переговори місяцями. Платите однаково всім.<br>'
+'<b>Рішення:</b> по кожному менеджеру — кількість won, lost, active угод, конверсія, сума виручки. Рейтинг команди оновлюється автоматично.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ДЕКІЛЬКА PIPELINE</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> два різні процеси продажів — роздріб і B2B (дизайнери, забудовники). Всі угоди в одному списку — хаос.<br>'
+'<b>Рішення:</b> окремий pipeline для кожного типу зі своїми стадіями. Кожна воронка — окремий Kanban зі своєю логікою.</div>'
+'</div>'

+'<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#7c3aed;margin-bottom:.25rem;">ACCESS MODE — МЕНЕДЖЕР БАЧИТЬ ТІЛЬКИ СВОЇ УГОДИ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> менеджери бачать угоди один одного і можуть переманювати клієнтів або підглядати в чужі комісії.<br>'
+'<b>Рішення:</b> режим «own» — кожен менеджер бачить тільки свої угоди. Власник і адміністратор бачать все.</div>'
+'</div>'

+'</div>'
+'<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;margin-top:.5rem;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'crm1', text:'Відкрити CRM → Kanban і налаштувати стадії pipeline', detail:'Стадії мають відповідати реальному процесу. CRM → Settings → Pipeline. Приклад: Новий → Замір → КП відправлено → Погоджено → Виробництво → Монтаж → Закрито.' },
        { id:'crm2', text:'Відкрити угоду і заповнити поле «Філіал»', detail:'Прага / Брно / Братислава або ваші назви. Визначає хто відповідає за угоду і яка бригада їде.' },
        { id:'crm3', text:'Призначити Замірника і вказати дату заміру', detail:'Після збереження — перевірте Google Calendar замірника: подія має з\'явитись автоматично. Якщо Calendar не підключений — зробіть це в Інтеграціях.' },
        { id:'crm4', text:'Призначити Монтажника і дату монтажу', detail:'Перевірте Calendar монтажника і WhatsApp клієнта — обидва мають отримати автоматичне сповіщення.' },
        { id:'crm5', text:'Ввести передоплату і перевірити залишок', detail:'Після збереження — залишок рахується автоматично. Перевірте чи з\'явилась задача «Старт виробництва» в таск-менеджері.' },
        { id:'crm6', text:'Відкрити вкладку Analytics в CRM', detail:'Видно: конверсія, звідки приходять клієнти що платять, KPI менеджерів. Оновлюється автоматично.' },
    ],
    action: { label:'Відкрити CRM', tab:'crm' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Ключова помилка: заповнити тільки назву і телефон. Для роботи автоматизацій потрібні всі поля замовлення: Філіал + Адреса + Замірник + Дата заміру + Монтажник + Дата монтажу + Передоплата. Без них тригери не спрацьовують.'
},

// ══ БЛОК 3 — СИСТЕМА: ТРИГЕРИ І WHATSAPP ═════════════════════
{
    id: 'triggers_whatsapp', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    title: 'Тригери і WhatsApp: система що працює замість вас', subtitle: 'Блок 3 · Система', est: '20 хв',
    description: '<b>Без тригерів:</b> менеджер повинен пам\'ятати що відправити клієнту, кого сповістити, яку задачу поставити. При 30 замовленнях на місяць — 200+ ручних дій. Щось завжди забувається.<br><br><b>Тригер — це правило:</b> якщо відбулась подія X → система автоматично виконує дію Y. Без вашої участі. Без нагадувань менеджеру. Без людського фактору.<br><br><div style="display:grid;gap:6px;margin:8px 0;">'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: КП ПОГОДЖЕНО</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: менеджер змінив статус КП на «Погоджено»<br>'
+'→ Задача цеху «ТЗ на пошив [клієнт]» (дедлайн +3 дні)<br>'
+'→ Задача закупнику «Закупівля матеріалів» (дедлайн +2 дні)<br>'
+'→ Задача логісту «Планування монтажу» (дедлайн +5 днів)<br>'
+'→ Клієнт отримує WhatsApp з сумою передоплати (50%)<br>'
+'<b>Без тригера:</b> менеджер забуває повідомити цех. Цех не знає що почалось нове замовлення. Закупник не замовив тканину. Монтаж зривається.</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: ПЕРЕДОПЛАТА ЗАФІКСОВАНА</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: менеджер вніс суму передоплати в картку угоди<br>'
+'→ Задача «Старт виробництва» для цеху (дедлайн сьогодні, високий пріоритет)<br>'
+'→ Клієнт отримує WhatsApp: «Передоплату отримано, починаємо виробництво»<br>'
+'<b>Без тригера:</b> гроші надійшли, але цех не знає. Виробництво починається з затримкою 1-2 дні бо ніхто не сказав.</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: ЗАМІР ПРИЗНАЧЕНО</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: в картці угоди вибрано замірника і вказано дату/час<br>'
+'→ Подія автоматично з\'являється в Google Calendar замірника<br>'
+'→ Клієнт отримує WhatsApp: «Замір призначено на [дата/час], замірник [ім\'я]»<br>'
+'<b>Без тригера:</b> замірник дізнається про замір з дзвінка менеджера вранці. Клієнт не впевнений що хтось приїде.</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: МОНТАЖ ПРИЗНАЧЕНО</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: вибрано монтажника і вказано дату/час монтажу<br>'
+'→ Подія в Google Calendar монтажника з адресою об\'єкту і описом замовлення<br>'
+'→ Клієнт отримує WhatsApp: «Монтаж [дата/час], майстер [ім\'я], телефон [номер]»</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: УГОДА ЗАКРИТА (ВИГРАНА)</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: угода переведена в стадію «Виграно»<br>'
+'→ Клієнт отримує WhatsApp з подякою за замовлення<br>'
+'→ Авто-задача «Виставити рахунок» для менеджера<br>'
+'→ Якщо є товари зі складу — вони автоматично списуються</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: +180 ДНІВ ПІСЛЯ ЗАКРИТТЯ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: пройшло 180 днів від дати закриття угоди (cron щодня о 8:00)<br>'
+'→ Клієнт автоматично отримує WhatsApp: пропозиція чищення штор<br>'
+'→ Менеджеру ставиться задача «Зателефонувати клієнту»<br>'
+'<b>Без тригера:</b> повторні продажі відбуваються випадково. Ви залишаєте гроші на столі.</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: УГОДА В СТАДІЇ «ПРОПОЗИЦІЯ»</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: угода перемістилась в стадію proposal<br>'
+'→ Задача менеджеру «Підготувати КП» (дедлайн +2 дні)</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: ЗАЯВКА З САЙТУ АБО БОТУ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: клієнт заповнив форму на сайті або пройшов сценарій в боті<br>'
+'→ Автоматично створюється клієнт в базі CRM<br>'
+'→ Автоматично створюється угода в першій стадії pipeline<br>'
+'→ Менеджер бачить новий лід у Kanban без жодних ручних дій</div>'
+'</div>'

+'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#15803d;margin-bottom:.25rem;">ТРИГЕР: БЮДЖЕТ ПЕРЕВИЩЕНО</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;">Коли: витрати по задачі або функції перевищили заплановану суму<br>'
+'→ Задача-попередження менеджеру (високий пріоритет, дедлайн сьогодні)</div>'
+'</div>'

+'</div>'
+'<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.65rem .9rem;margin-top:8px;">'
+'<div style="font-size:.72rem;font-weight:700;color:#374151;margin-bottom:.35rem;">WHATSAPP BUSINESS API: 6 АВТОМАТИЧНИХ ПОВІДОМЛЕНЬ НА КОЖНЕ ЗАМОВЛЕННЯ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.8;">'
+'<b>Біль:</b> менеджер відправляє 6-8 WhatsApp вручну на кожне замовлення. При 30 замовленнях — 180-240 ручних дій. Якесь повідомлення забувається, клієнт не знає що відбувається і починає дзвонити.<br>'
+'<b>Рішення:</b> підключіть WhatsApp Business API (провайдер 360dialog для ЄС) — і всі повідомлення відправляються автоматично при відповідних подіях.<br>'
+'1. Замір призначено → дата, час, ім\'я замірника<br>'
+'2. КП погоджено → сума передоплати (50%)<br>'
+'3. Передоплата отримана → старт виробництва<br>'
+'4. Монтаж призначено → дата, час, ім\'я монтажника<br>'
+'5. Угода закрита → подяка + анонс нагадування через 6 місяців<br>'
+'6. +180 днів → пропозиція чищення штор<br>'
+'<b>Налаштування:</b> Інтеграції → WhatsApp Business API → вставити ключ 360dialog → зберегти → Тест.</div>'
+'</div>'
+'<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;margin-top:.75rem;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'trig1', text:'Підключити WhatsApp Business API через 360dialog', detail:'Інтеграції → WhatsApp Business API → отримати ключ на hub.360dialog.com → вставити → зберегти → натиснути «Тест». Без цього 6 автоматичних повідомлень клієнтам не відправляються.' },
        { id:'trig2', text:'Переконатись що замірники і монтажники підключили Google Calendar', detail:'Інтеграції → Google Calendar → кожен входить під своїм Google-аккаунтом і натискає «Підключити». Після цього при призначенні заміру/монтажу — подія з\'являється автоматично.' },
        { id:'trig3', text:'Протестувати тригер заміру: призначте замір в тестовій угоді', detail:'Відкрийте угоду → оберіть замірника → вкажіть дату/час → збережіть. Перевірте Calendar замірника і WhatsApp клієнта (через 10-20 сек).' },
        { id:'trig4', text:'Протестувати тригер КП: змініть стадію угоди на «Погоджено»', detail:'Після зміни стадії — в таск-менеджері мають з\'явитись 3 задачі: для цеху, закупника і логіста. Перевірте «Всі завдання».' },
        { id:'trig5', text:'Протестувати тригер передоплати: введіть суму передоплати', detail:'Після збереження — має з\'явитись задача «Старт виробництва» для цеху і WhatsApp клієнту.' },
    ],
    action: { label:'Відкрити інтеграції', tab:'integrations' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Тригери «КП погоджено» і «Передоплата» прибирають 80% ручних дій менеджера. WhatsApp API — ще 20%. Налаштуйте ці три в першу чергу і ви одразу відчуєте різницю.'
},

// ══ БЛОК 3 — СИСТЕМА: ФІНАНСИ ════════════════════════════════
{
    id: 'finance_capabilities', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    title: 'Фінанси: повний контроль грошей компанії', subtitle: 'Блок 3 · Система', est: '20 хв',
    description: '<div style="display:grid;gap:6px;margin:4px 0;">'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">ДАШБОРД: KPI В РЕАЛЬНОМУ ЧАСІ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> щоб дізнатись скільки заробили цього місяця — потрібно 2 години і бухгалтер. Дані застарілі на 2 тижні.<br>'
+'<b>Рішення:</b> відкриваєте Фінанси → 4 картки: Дохід / Витрати / Прибуток / Маржа за поточний місяць. З порівнянням до попереднього (↑↓%). Оновлюється при кожній новій транзакції.</div>'
+'</div>'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">ТРАНЗАКЦІЇ: ДОХОДИ І ВИТРАТИ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> гроші є на рахунку але не знаєте куди вони йдуть. «Щось витрачаємо, а прибутку не видно».<br>'
+'<b>Рішення:</b> кожна транзакція з категорією (матеріали / оренда / зарплата / реклама). По кожній категорії видно скільки пішло. Транзакцію можна прив\'язати до угоди — видно маржинальність кожного замовлення.</div>'
+'</div>'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">РАХУНКИ КЛІЄНТАМ (INVOICES)</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> рахунки формуєте вручну в Word або Excel. 20 хвилин на рахунок. При 30 замовленнях — 10 годин на місяць.<br>'
+'<b>Рішення:</b> кнопка «Рахунок» прямо в картці угоди → клієнт і сума підставляються автоматично → PDF готовий за 2 хвилини. При оплаті — статус змінюється і транзакція доходу створюється автоматично. Онлайн-оплата через Stripe.</div>'
+'</div>'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">РЕГУЛЯРНІ ПЛАТЕЖІ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> оренда, зарплата, підписки — щомісяця одні й ті ж витрати. Кожен раз вносите вручну або забуваєте.<br>'
+'<b>Рішення:</b> налаштовуєте регулярний платіж один раз → система сама створює транзакцію в потрібний день. Оренда 15-го кожного місяця — вказуєте один раз і забуваєте.</div>'
+'</div>'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">ПЛАНУВАННЯ І БЮДЖЕТ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> не знаєте заздалегідь чи вистачить грошей через 2 місяці. Несподівані касові розриви застають зненацька.<br>'
+'<b>Рішення:</b> вносите плановий бюджет по місяцях і відділах. Система порівнює план і факт в реальному часі. Cashflow-прогноз на 30/60/90 днів показує де може виникнути розрив.</div>'
+'</div>'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">P&L ЗВІТ І АНАЛІТИКА МАРЖІ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> не знаєте які замовлення прибуткові, а які ні. Берете все підряд і дивуєтесь що грошей немає.<br>'
+'<b>Рішення:</b> P&L звіт за будь-який період. Маржинальність по кожному проекту/угоді: дохід мінус прив\'язані витрати. Видно які клієнти або типи замовлень реально дають прибуток.</div>'
+'</div>'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">AI ФІНАНСОВИЙ АНАЛІТИК</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> бачите цифри але не знаєте що з ними робити. Звернутись до бухгалтера — дорого і довго.<br>'
+'<b>Рішення:</b> вкладка «AI» у фінансах — запитуєте будь-яке питання і отримуєте аналіз на основі ваших реальних даних. «Чому цього місяця прибуток менший?» або «Які категорії витрат ростуть швидше за доходи?»</div>'
+'</div>'

+'<div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#92400e;margin-bottom:.25rem;">МУЛЬТИВАЛЮТНІСТЬ І КУРСИ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> працюєте в кількох країнах або з постачальниками в різних валютах. Рахувати вручну — помилки і плутанина.<br>'
+'<b>Рішення:</b> кожна транзакція у своїй валюті, курс підтягується автоматично або вводиться вручну. Всі звіти в базовій валюті компанії.</div>'
+'</div>'

+'</div>'
+'<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;margin-top:.75rem;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'fin1', text:'Відкрити Фінанси → Дашборд і переглянути KPI', detail:'Якщо дашборд порожній — потрібно внести перші транзакції. Почніть з 3-5 реальних доходів і витрат цього місяця. KPI одразу з\'являться.' },
        { id:'fin2', text:'Налаштувати категорії доходів і витрат під свій бізнес', detail:'Фінанси → Settings → Категорії. Приклад: Доходи — Пошив і установка, Чищення, Карнизи. Витрати — Тканини, Зарплата, Оренда, Реклама.' },
        { id:'fin3', text:'Додати 3-5 реальних транзакцій цього місяця', detail:'Фінанси → Доходи або Витрати → «+ Транзакція». Вкажіть суму, категорію, рахунок, дату.' },
        { id:'fin4', text:'Створити тестовий рахунок клієнту (Invoice) прямо з угоди', detail:'Картка CRM-угоди → кнопка «Рахунок» внизу → заповніть позиції → PDF → відправте клієнту.' },
        { id:'fin5', text:'Відкрити вкладку AI і задати фінансове питання', detail:'«Які категорії витрат виросли цього місяця?» або «На що йде найбільше грошей?». AI відповідає на основі ваших реальних даних.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Найшвидший результат: налаштуйте категорії + внесіть 10 транзакцій → дашборд одразу показує де гроші губляться. Більшість власників вперше бачать реальну картину витрат саме на цьому кроці.'
},

// ══ БЛОК 3 — СИСТЕМА: СКЛАД І КАЛЕНДАР ══════════════════════
{
    id: 'warehouse_calendar', block: 'system', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
    title: 'Склад і Календар: облік матеріалів і розклад', subtitle: 'Блок 3 · Система', est: '20 хв',
    description: '<div style="font-size:.82rem;font-weight:700;color:#1a1a1a;margin-bottom:.5rem;">СКЛАД</div>'
+'<div style="display:grid;gap:6px;margin-bottom:1rem;">'

+'<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#5b21b6;margin-bottom:.25rem;">КАТАЛОГ ТОВАРІВ З ЗАЛИШКАМИ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> закупник купив тканину «на очей». Потім виявляється — одного артикулу два рулони, іншого немає зовсім. Гроші заморожені в непотрібних залишках.<br>'
+'<b>Рішення:</b> кожен матеріал в системі — артикул, назва, поточний залишок, мінімальний залишок, ціна закупівлі. Видно скільки є, скільки зарезервовано під угоди і скільки реально доступно.</div>'
+'</div>'

+'<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#5b21b6;margin-bottom:.25rem;">ТРИ РІВНІ ТРИВОГИ: ok / low / critical</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> тканина закінчилась в момент коли треба шити. Виробництво зупиняється, клієнт чекає, бригада простоює.<br>'
+'<b>Рішення:</b> коли залишок опускається нижче мінімуму — бейдж-лічильник в навігації і автоматична задача закупнику «Замовити [назва товару]». Закупник не чекає поки хтось скаже.</div>'
+'</div>'

+'<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#5b21b6;margin-bottom:.25rem;">ОПЕРАЦІЇ: НАДХОДЖЕННЯ, ВИДАЧА, СПИСАННЯ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> ніхто не знає скільки метрів тканини пішло на замовлення. Неможливо порахувати собівартість виробу.<br>'
+'<b>Рішення:</b> кожна операція фіксується — надходження від постачальника (IN), видача на виробництво з прив\'язкою до угоди (OUT), списання браку (WRITE_OFF). По кожній угоді видно скільки матеріалів витрачено. При надходженні — авто-транзакція витрати у Фінансах.</div>'
+'</div>'

+'<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#5b21b6;margin-bottom:.25rem;">АВТО-СПИСАННЯ ПРИ ЗАКРИТТІ УГОДИ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> замовлення виконано, але залишки на складі не оновились. Через місяць бачите «є 10 метрів» — а їх давно немає.<br>'
+'<b>Рішення:</b> при переведенні угоди в «Виграно» — всі прив\'язані матеріали автоматично списуються зі складу. Нічого не треба робити вручну.</div>'
+'</div>'

+'<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#5b21b6;margin-bottom:.25rem;">ПОСТАЧАЛЬНИКИ І ЛОКАЦІЇ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> всі знають що «тканину купуємо у Карела» але ніхто не знає його телефон і умови. Коли Карела немає — процес зупиняється.<br>'
+'<b>Рішення:</b> база постачальників з контактами, прив\'язана до товарів. Кожне місце зберігання — окрема локація (Склад 1, Шоурум Прага, Шоурум Брно). Видно де що лежить.</div>'
+'</div>'

+'</div>'
+'<div style="font-size:.82rem;font-weight:700;color:#1a1a1a;margin-bottom:.5rem;">КАЛЕНДАР І BOOKING</div>'
+'<div style="display:grid;gap:6px;">'

+'<div style="background:#fce7f3;border:1px solid #fbcfe8;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#9d174d;margin-bottom:.25rem;">6 ВИДІВ КАЛЕНДАРЯ ЗАДАЧ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> задачі є, але ніхто не знає що робити сьогодні. Хтось перевантажений, хтось сидить без роботи.<br>'
+'<b>Рішення:</b> календар показує всі задачі в обраному форматі — День (погодинно), Тиждень, Місяць, Список, Kanban або тільки Дедлайни. Кожен співробітник відкриває «Мій день» і одразу бачить що робити зараз.</div>'
+'</div>'

+'<div style="background:#fce7f3;border:1px solid #fbcfe8;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#9d174d;margin-bottom:.25rem;">GOOGLE CALENDAR ІНТЕГРАЦІЯ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> замірники і монтажники не сидять за комп\'ютером. Їхній робочий інструмент — телефон і Google Calendar.<br>'
+'<b>Рішення:</b> підключіть Google Calendar кожного замірника → при призначенні заміру в CRM → подія автоматично в їхньому Calendar → стандартне нагадування на телефоні. Нічого нового вчити не треба.<br>'
+'Налаштування: Інтеграції → Google Calendar → кожен підключає свій аккаунт одним кліком.</div>'
+'</div>'

+'<div style="background:#fce7f3;border:1px solid #fbcfe8;border-radius:8px;padding:.6rem .9rem;">'
+'<div style="font-size:.72rem;font-weight:700;color:#9d174d;margin-bottom:.25rem;">BOOKING — ОНЛАЙН-ЗАПИС КЛІЄНТІВ</div>'
+'<div style="font-size:.78rem;color:#374151;line-height:1.6;"><b>Біль:</b> клієнт хоче записатись на замір. «Коли вам зручно?» — «А в п\'ятницю можна?» — «П\'ятниця зайнята» — і так 10 повідомлень в WhatsApp щоб вибрати один слот.<br>'
+'<b>Рішення:</b> відправляєте клієнту посилання → він бачить вільні слоти (зайняті витягуються з Google Calendar) і сам обирає зручний час. Ви нічого не узгоджуєте вручну. При бронюванні — клієнт автоматично в базі CRM. Можна налаштувати вимогу передоплати через Stripe.</div>'
+'</div>'

+'</div>'
+'<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#8b5cf6;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;margin-top:.75rem;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'wh1', text:'Відкрити Склад → Каталог і додати перший матеріал', detail:'Заповніть: назва, артикул, одиниця (м, шт), мінімальний залишок, ціна закупівлі. Мінімальний залишок — критично: від нього залежить коли спрацює тривога.' },
        { id:'wh2', text:'Зробити операцію «Надходження» для першого матеріалу', detail:'Склад → «Надходження» → оберіть товар → кількість → ціна → зберегти. Перевірте Дашборд — загальна вартість складу збільшилась.' },
        { id:'wh3', text:'Перевірити що авто-задача спрацьовує при нестачі', detail:'Зменшіть залишок нижче мінімуму → в таск-менеджері має з\'явитись задача «Замовити [назва товару]».' },
        { id:'wh4', text:'Відкрити Календар і переключити між видами', detail:'День → Тиждень → Місяць → Дедлайни. Знайдіть задачі з дедлайнами — вони відображаються у відповідних днях.' },
        { id:'wh5', text:'Налаштувати Booking: перший онлайн-calendar для запису на замір', detail:'Бізнес → Booking → «+ Новий calendar» → вкажіть назву, тривалість слоту (60 хв), робочі дні і час. Скопіюйте посилання і відправте тестовому клієнту.' },
    ],
    action: { label:'Відкрити склад', tab:'warehouse' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Склад: найважливіше — правильний мінімальний залишок. Занизьте — тривоги надто пізно. Завищте — система кричить постійно. Ставте реальний 2-тижневий запас.'
},



// ══ БЛОК 4 — ПРОЄКТИ ══════════════════════════════════════════
{
    id: 'projects', block: 'projects', color: '#3b82f6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    title: 'Проєкти: складні завдання з таймлайном', subtitle: 'Блок 4 · Проєкти і процеси', est: '10 хв',
    description: '<b>Біль без цього:</b> складний проєкт на 20 завдань «розсипається» в загальному списку. Незрозуміло що зроблено, де затримка.<br><br><b>Три вида:</b> Карти (канбан), Список, Таймлайн (Gantt).<br><b>Прогрес</b> — рахується автоматично з виконаних завдань.<br><br>Приклади: «Відкриття нової точки», «Запуск продукту», «Впровадження CRM».<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'pr1', text:'Відкрити вкладку «Проєкти» і переглянути наявні', detail:'Якщо немає — створіть тестовий. Назва + дедлайн + кілька завдань.' },
        { id:'pr2', text:'Переключити вид: Карти → Список → Таймлайн', detail:'Таймлайн — найінформативніший вид для контролю.' },
        { id:'pr3', text:'Додати кілька завдань і перевірити прогрес', detail:'Додайте 3-4 завдання → перевірте таймлайн.' },
    ],
    action: { label:'Відкрити проєкти', tab:'projects' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Таймлайн — відразу видно де «вузьке місце» і хто блокує решту команди.'
},
{
    id: 'processes', block: 'projects', color: '#3b82f6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
    title: 'Процеси: шаблони для повторюваних ситуацій', subtitle: 'Блок 4 · Проєкти і процеси', est: '15 хв',
    description: '<b>Біль без цього:</b> кожного разу коли приходить новий клієнт — пояснюєте «з нуля», або щось забувається.<br><br><b>Процеси</b> — шаблони послідовності дій. Одноразово налаштовуєте → запускаєте кліком → всі завдання створюються автоматично з виконавцями і дедлайнами.<br><br>Приклади: прийом клієнта, онбординг співробітника, закриття місяця.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'proc1', text:'Відкрити вкладку «Процеси» і переглянути логіку', detail:'Знайдіть демо-шаблони. Зверніть увагу: шаблон → запуск → активний процес.' },
        { id:'proc2', text:'Визначити 1 повторюваний процес у своєму бізнесі', detail:'Що ви робите кілька разів на місяць однаково? Це кандидат.' },
        { id:'proc3', text:'Створити шаблон процесу з 3-4 етапами', detail:'Процеси → «Новий шаблон» → додайте етапи. Кожен: хто + скільки днів + результат.' },
        { id:'proc4', text:'Запустити процес і перевірити що завдання створились', detail:'Перейдіть в «Всі завдання» — завдання вже там з виконавцями і дедлайнами.' },
    ],
    action: { label:'Відкрити процеси', tab:'processes' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> 1 налаштований процес = сотні годин зекономлених за рік.'
},
{
    id: 'project_estimate_link', block: 'projects', color: '#3b82f6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    title: 'Матеріали і кошторис в проекті', subtitle: 'Блок 4 · Проєкти і процеси', est: '8 хв',
    description: '<b>Біль без цього:</b> проект є, задачі є, а де матеріали? Скільки вже витрачено? Що ще потрібно купити? — власник не знає.<br><br><b>Відкрив проект → вкладка «Кошторис»</b> → бачиш потребу, залишки, дефіцит, бюджет. Списав матеріали — одразу відображається у фінансах.<br><br>Проект + Кошторис + Склад = повний контроль об\'єкту в одному місці.<br><br>' + '<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'pel1', text:'Відкрити проект і перейти у вкладку «Кошторис»', detail:'Проекти → відкрити проект → кнопка «Кошторис» у view switcher.' },
        { id:'pel2', text:'Створити або прив\'язати кошторис до проекту', detail:'«Створити кошторис» → або в Бізнес → Кошторис обрати проект у списку.' },
        { id:'pel3', text:'Переглянути дефіцит матеріалів і бюджет', detail:'У вкладці Кошторис проекту видно загальний бюджет і сума докупівлі.' },
    ],
    action: { label:'Відкрити проекти', tab:'projects' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Проект + Кошторис + Склад = повний контроль об\'єкту в одному місці.',
},

// ══ БЛОК 5 — КООРДИНАЦІЇ ═════════════════════════════════════
{
    id: 'coordination_types', block: 'coordination', color: '#f59e0b',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    title: 'Координації: типи і коли використовувати', subtitle: 'Блок 5 · Координації', est: '10 хв',
    description: '<b>Біль без цього:</b> нарада проходить — через тиждень нічого не зроблено. Рішення «загубились в месенджері».<br><br><b>8 типів координацій:</b> Щоденна · Щотижнева · Місячна · Рекомендаційна рада · Рада директора · Виконавча рада · Рада засновників · Разова.<br><br>Кожне рішення → одразу стає завданням з виконавцем і дедлайном.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'ct1', text:'Відкрити вкладку «Координації» і переглянути всі 8 типів', detail:'Кожен тип — окремий шаблон порядку денного і тривалість.' },
        { id:'ct2', text:'Визначити які типи потрібні вашому бізнесу', detail:'Мінімум: Щотижнева + Місячна. Для керівників — Виконавча рада.' },
        { id:'ct3', text:'Налаштувати регулярну щотижневу координацію', detail:'Кнопка «Нова координація» → тип → день → час → учасники.' },
    ],
    action: { label:'Відкрити координації', tab:'coordination' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Щотижнева планерка — базовий ритм бізнесу. Без неї команда «розсипається» на острівці.'
},
{
    id: 'coordination_process', block: 'coordination', color: '#f59e0b',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    title: 'Координації: як провести і зафіксувати результат', subtitle: 'Блок 5 · Координації', est: '15 хв',
    description: '<b>Біль без цього:</b> навіть якщо нарада проведена — рішення «загубились». Немає протоколу, немає відповідальних.<br><br><b>Порядок щотижневої координації:</b><br>1. Статистики учасників<br>2. Виконання попередніх завдань<br>3. Звіти учасників<br>4. Питання<br>5. Рішення — фіксуємо кожне прямо в системі<br>6. Нові завдання — кожне рішення одразу стає завданням<br><br><b>Таймер, протокол (PDF), ескалація</b> — все вбудовано.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'cp1', text:'Створити координацію «Щотижнева» і додати учасників', detail:'«Нова координація» → тип → назва → учасники.' },
        { id:'cp2', text:'Запустити координацію і пройти порядок денний до кінця', detail:'Кнопка «Почати» → порядок денний → зафіксуйте мінімум 1 рішення.' },
        { id:'cp3', text:'Зафіксувати рішення і призначити виконавця з дедлайном', detail:'«+ Додати рішення» → текст → виконавець → дедлайн. Одразу стає завданням.' },
        { id:'cp4', text:'Завершити координацію і перевірити що завдання з\'явились', detail:'Перейдіть у «Всі завдання» — всі рішення вже там.' },
        { id:'cp5', text:'Відкрити автоматично сформований протокол', detail:'В архіві → завершена координація → кнопка «Протокол». Готовий PDF.' },
    ],
    action: { label:'Відкрити координації', tab:'coordination' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Правило: кожна нарада закінчується протоколом із завданнями.'
},
{
    id: 'control', block: 'coordination', color: '#f59e0b',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    title: 'Контроль: пульс бізнесу щодня за 5 хвилин', subtitle: 'Блок 5 · Контроль', est: '15 хв',
    description: '<b>Біль без цього:</b> керівник дізнається про проблему коли вже «пожежа».<br><br><b>Критична увага</b> — дашборд: прострочені завдання, без виконавця, без дедлайну. 2 хвилини — знаєш де «пожежа».<br><b>Навантаження</b> — хто і скільки завдань веде.<br><b>Воронка делегування</b> — де завдання «застрягають».<br><b>Журнал управлінських збоїв</b> — реєстр системних проблем.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'ctrl1', text:'Відкрити «Контроль» → натиснути «Критична увага»', detail:'Це ваш щоранковий ритуал. 2 хвилини — і ви знаєте де «пожежа».' },
        { id:'ctrl2', text:'Переглянути «Навантаження» — побачити розподіл по команді', detail:'Хто має 15 завдань а хто 2? Дисбаланс — ознака неправильного делегування.' },
        { id:'ctrl3', text:'Відкрити «Воронку делегування» і зрозуміти логіку', detail:'Якщо більшість на першому етапі — виконавці не беруть в роботу.' },
        { id:'ctrl4', text:'Додати перший запис в «Журнал управлінських збоїв»', detail:'Факт → причина → рішення. Через 3 місяці видно системні патерни.' },
    ],
    action: { label:'Відкрити контроль', tab:'control' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Щоранковий ритуал: 5 хвилин в «Критичній увазі» — стан бізнесу без єдиної наради.'
},

// ══ БЛОК 6 — АНАЛІТИКА ════════════════════════════════════════
{
    id: 'analytics', block: 'analytics', color: '#8b5cf6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    title: 'Ефективність та Статистика: цифри замість відчуттів', subtitle: 'Блок 6 · Аналітика', est: '10 хв',
    description: '<b>Біль без цього:</b> власник управляє «по відчуттях». Проблема виникла — незрозуміло де і коли почалась.<br><br><b>Ефективність</b> — KPI по кожному співробітнику: скільки виконано вчасно, скільки прострочено, динаміка по тижнях.<br><b>Статистика</b> — ваші бізнес-метрики які ви самі додаєте (виручка, клієнти, дзвінки тощо).<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'an1', text:'Відкрити «Ефективність» — переглянути статистику по завданнях', detail:'Хто виконує вчасно а хто постійно переносить. Об\'єктивні дані без емоцій.' },
        { id:'an2', text:'Відкрити «Статистика» і додати 3 ключові метрики свого бізнесу', detail:'Приклади: «Виручка за день», «Нових клієнтів», «Виконаних замовлень».' },
        { id:'an3', text:'Переключити метрики між День / Тиждень / Місяць', detail:'Місяць показує тренд, день — поточний пульс.' },
    ],
    action: { label:'Відкрити аналітику', tab:'analytics' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Якщо метрика не вимірюється — нею неможливо управляти. 3 цифри щодня — мінімум.'
},

// ══ БЛОК 7 — ФІНАНСИ ══════════════════════════════════════════
{
    id: 'finance_full_overview', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    title: 'Фінанси: повний огляд можливостей', subtitle: 'Блок 7 · Фінанси', est: '15 хв',
    description: '<b>Прочитайте перед початком.</b> Фінансовий модуль — це не бухгалтерська програма. Це управлінський інструмент власника: бачити де гроші, куди йдуть, коли буде розрив, і що заважає росту прибутку.<br><br>'

      + '<div style="background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:10px;padding:10px 14px;margin:8px 0;">'
      + '<div style="font-size:.72rem;font-weight:700;color:#065f46;letter-spacing:.07em;margin-bottom:6px;">11 ВКЛАДОК — КОЖНА ЗА СВОЄ</div>'

      + '<div style="display:grid;gap:5px;">'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">1. ДАШБОРД</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Головний екран. Показує: <b>Дохід / Витрати / Прибуток / Маржа</b> за вибраний місяць з порівнянням до попереднього (↑↓%). '
      + 'SVG-графік доходів і витрат за останні 6 місяців — видно тренд і сезонність. '
      + 'Donut-діаграма топ витрат по категоріях. '
      + 'Топ проектів за маржею — бачите які угоди насправді прибуткові. '
      + 'Блок план/факт: виконання бюджету поточного місяця в %. '
      + '<b>Автоматичні сигнали:</b> від\'ємний залишок рахунку, дебіторка понад 30 днів, перевищення бюджету категорії.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">2. ДОХОДИ</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Список всіх транзакцій доходу. Фільтри: по рахунку, категорії, датах. '
      + 'Кожна транзакція: сума, рахунок, категорія, дата оплати, дата нарахування (для P&L), коментар, прив\'язка до угоди CRM або проекту. '
      + '<b>Переказ між рахунками</b> — не вважається доходом, тільки переміщує гроші. '
      + 'Експорт в CSV та Excel одним кліком.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">3. ВИТРАТИ</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Список витрат з тими ж полями що і доходи. '
      + 'Важливо: категорія має тип <b>COGS</b> (собівартість — пряма витрата на послугу) або <b>OPEX</b> (операційна — незалежно від обсягу). '
      + 'Це визначає структуру P&L: Виручка − COGS = Валовий прибуток − OPEX = Чистий прибуток. '
      + 'Сигнал при 80% і 100% використання місячного бюджету по категорії.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">4. РЕГУЛЯРНІ ПЛАТЕЖІ</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Шаблони для транзакцій що повторюються: оренда, зарплати, підписки, кредити. '
      + 'Налаштування: сума, рахунок, категорія, день місяця або тижня, дата завершення. '
      + 'В призначений день система <b>автоматично створює транзакцію</b> — не потрібно вносити вручну щомісяця. '
      + 'Можна поставити на паузу без видалення.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">5. РАХУНКИ КЛІЄНТАМ (INVOICES)</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Виставляєте рахунок прямо з картки угоди CRM — клієнт і сума підставляються автоматично. '
      + 'Позиції з кількістю і ціною, знижка, ПДВ, примітки. '
      + 'PDF-рахунок з реквізитами компанії за 2 хвилини. '
      + 'Статуси: Чернетка → Відправлений → Частково оплачений → Оплачений → Прострочений. '
      + 'При статусі «Оплачений» → <b>транзакція доходу створюється автоматично</b>. '
      + 'Онлайн-оплата через Stripe прямо з рахунку. '
      + 'Список несплачених рахунків = ваша поточна дебіторська заборгованість.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">6. ФІНАНСИ ПО ФУНКЦІЯХ</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Прив\'язка витрат і доходів до бізнес-функцій (департаментів). '
      + 'Бачите скільки коштує кожна функція: маркетинг, виробництво, адміністрація, HR. '
      + 'Бюджет по кожній функції окремо — контроль де перевитрата. '
      + 'Це реалізація системи 7 департаментів: кожна гривня прив\'язана до функції.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">7. ПЛАНУВАННЯ</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Чотири режими: <b>Бюджет</b> — план/факт по категоріях; <b>По функціях</b> — бюджет кожного департаменту; '
      + '<b>Cashflow прогноз</b> — прогноз залишку на 30/60/90 днів на основі регулярних платежів і поточних надходжень; '
      + '<b>Тижневий план 6M</b> — стовпчиковий графік план/факт по кожному тижні на пів року, синя лінія cashflow, '
      + 'таблиця з відхиленнями, кнопка «Заповнити з середнього 3M». Видно де буде касовий розрив до того як він станеться.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">8. АНАЛІТИКА</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + '<b>P&L звіт:</b> повна структура з нарахувальним методом — Виручка / Собівартість / Валовий прибуток / OPEX / Чистий прибуток з % маржі по кожному рядку. '
      + 'Порівняння місяців, фільтр по рахунках. '
      + '<b>Cash Flow:</b> реальний рух грошей по місяцях. '
      + '<b>Маржинальність по проектах:</b> яка угода скільки принесла чистого. '
      + '<b>Тренд витрат по категоріях:</b> як змінювались витрати за 6 місяців — видно де зростання. '
      + 'Експорт P&L в XLSX і PDF.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">9. БАЛАНС</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Класична структура: <b>Активи</b> (гроші на рахунках + дебіторка + запаси зі складу + основні засоби) / '
      + '<b>Пасиви</b> (кредиторка + кредити + інші зобов\'язання) / <b>Капітал</b> (власний капітал бізнесу). '
      + 'Автоматично розраховується на основі транзакцій. '
      + 'Налаштування: можна додати власні рядки (обладнання, нерухомість). '
      + 'Відповідає на питання: скільки насправді коштує бізнес.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">10. AI-АНАЛІТИК</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + 'Задаєте питання текстом — AI відповідає на основі ваших реальних фінансових даних. '
      + 'Приклади: «Які категорії витрат зросли цього місяця?», «Порівняй прибуток з минулим місяцем», '
      + '«Чи вистачить грошей на зарплату наступного тижня?», «Що з\'їдає найбільше маржі?». '
      + 'Не загальні поради — конкретні відповіді по вашим цифрам.</div>'
      + '</div>'

      + '<div style="background:white;border-radius:7px;padding:7px 10px;border:1px solid #d1fae5;">'
      + '<div style="font-size:.8rem;font-weight:700;color:#059669;">11. НАЛАШТУВАННЯ</div>'
      + '<div style="font-size:.78rem;color:#374151;line-height:1.5;margin-top:2px;">'
      + '<b>Рахунки</b> — додаєте свої (банк, каса, картка, Stripe), початкові залишки, валюта. '
      + '<b>Категорії доходів і витрат</b> — з типом COGS/OPEX. '
      + '<b>Зв\'язки з модулями</b> — toggles: CRM → Фінанси (угода «Виграно» → авто-транзакція), '
      + 'Booking → Фінанси (оплачений запис → авто-транзакція), Склад → Фінанси (закупка/списання → витрата). '
      + '<b>Курси валют</b> — якщо є транзакції в різних валютах. '
      + '<b>Реквізити компанії</b> для рахунків (Invoice). '
      + '<b>Права доступу</b> — хто бачить фінанси (лише власник або й менеджери).</div>'
      + '</div>'

      + '</div></div>'

      + '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 12px;margin-top:8px;font-size:.8rem;color:#92400e;">'
      + '<b>З чого починати:</b> Налаштування → Рахунки (початкові залишки) → Категорії → перші 5 транзакцій → дашборд оживе. Все інше налаштовується поступово.'
      + '</div>'
      + AI_BTN,
    tasks: [
        { id:'fov1', text:'Відкрити Фінанси і пройти по всіх 11 вкладках', detail:'Витратьте 5 хвилин щоб зрозуміти де що знаходиться перед тим як починати вносити дані.' },
        { id:'fov2', text:'Відкрити Налаштування → Рахунки і додати свої рахунки з початковими залишками', detail:'Мінімум 2: готівка і банківський рахунок. Введіть реальні залишки на сьогодні.' },
        { id:'fov3', text:'Відкрити Налаштування → Категорії і налаштувати категорії під свій бізнес', detail:'Доходи: послуги, товари, абонементи. Витрати: матеріали (COGS), оренда (OPEX), зарплата (OPEX).' },
        { id:'fov4', text:'Включити зв\'язки: CRM → Фінанси і Booking → Фінанси (якщо використовуєте)', detail:'Налаштування → розділ «Зв\'язки між модулями» → увімкніть потрібні toggles.' },
        { id:'fov5', text:'Внести 5 реальних транзакцій (доходи + витрати) і переглянути дашборд', detail:'Після перших транзакцій дашборд покаже KPI, графік і топ витрат — це буде перше реальне фінансове фото бізнесу.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: INFO_ICON + ' Ціль цього кроку — розуміння можливостей. Не намагайтесь одразу все налаштувати. Рахунки + категорії + 5 транзакцій = вже цінність.',
},
{
    id: 'finance_dashboard', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    title: 'Фінанси: дашборд і загальна картина', subtitle: 'Блок 7 · Фінанси', est: '10 хв',
    description: '<b>Біль без цього:</b> власник не знає скільки реально заробляє бізнес. Гроші є — але це не прибуток.<br><br><b>Дашборд</b> показує: Дохід, Витрати, Прибуток, Маржа за місяць.<br>Графік доходів/витрат за 6 місяців — тренд і сезонність.<br>Топ витрат по категоріях. Автоматичні сигнали.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'fin1', text:'Відкрити Бізнес → Фінанси і переглянути дашборд', detail:'Оберіть поточний місяць.' },
        { id:'fin2', text:'Переглянути всі підвкладки: Доходи, Витрати, Рахунки, Планування', detail:'Пройдіть по кожній — зрозумійте логіку перед тим як вносити дані.' },
        { id:'fin3', text:'Налаштувати рахунки (каса, банк, картка)', detail:'Фінанси → Налаштування → Рахунки. Додайте мінімум 2: готівка і поточний рахунок.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Фінанси без даних — красивий але порожній дашборд. Починайте вносити транзакції з сьогодні.'
},
{
    id: 'finance_transactions', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    title: 'Фінанси: доходи, витрати і категорії', subtitle: 'Блок 7 · Фінанси', est: '15 хв',
    description: '<b>Біль без цього:</b> в кінці місяця незрозуміло куди пішли гроші. Категорій немає — всі витрати в одну купу.<br><br><b>Доходи і витрати</b> по категоріях. <b>Повторювані транзакції</b> (оренда, зарплата, підписки) — налаштовуєте один раз, списуються автоматично.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'fin4', text:'Внести 3 тестові доходи по різних категоріях', detail:'Фінанси → Доходи → «+ Дохід». Категорія, сума, рахунок, дата.' },
        { id:'fin5', text:'Внести 3 тестові витрати по різних категоріях', detail:'Прив\'яжіть до функції — тоді аналітика по відділах працює.' },
        { id:'fin6', text:'Налаштувати повторювану транзакцію (наприклад оренда)', detail:'Фінанси → Повторювані → «+ Повторювана» → щомісячно, суму, категорію.' },
        { id:'fin7', text:'Перевірити дашборд після внесення даних', detail:'Тепер графіки і топ витрат заповнені реальними даними.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Стандарт: вносити транзакції щодня або мінімум раз на 2-3 дні.'
},
{
    id: 'finance_planning', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    title: 'Фінанси: бюджетування, рахунки і P&L', subtitle: 'Блок 7 · Фінанси', est: '15 хв',
    description: '<b>Біль без цього:</b> в кінці місяця — витрат більше ніж планувалось. Бюджет існує «в голові».<br><br><b>Планування</b> — бюджет Plan vs Fact з відхиленнями.<br><b>Рахунки (Invoices)</b> — виставлення клієнтам. Оплачений → автоматично транзакція доходу.<br><b>P&L</b> — звіт про прибутки і збитки. Формується автоматично.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'fin11', text:'Відкрити Фінанси → Планування і внести план доходів на місяць', detail:'Очікуваний дохід по кожній категорії.' },
        { id:'fin12', text:'Внести план витрат по категоріях', detail:'Зарплата, оренда, маркетинг, матеріали — деталізуйте.' },
        { id:'fin13', text:'Створити тестовий рахунок клієнту і перевірити статуси', detail:'Фінанси → Рахунки → «+ Рахунок». Позиції → дедлайн → відмітити «Оплачено».' },
        { id:'fin14', text:'Переглянути P&L звіт за поточний місяць', detail:'Якщо є транзакції — P&L заповниться автоматично.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> P&L — перший документ при розмові з інвестором або банком. Тепер формується автоматично.'
},

// ══ НОВІ КРОКИ: ФІНАНСИ — розширений функціонал ══════════

{
    id: 'finance_pl_accrual', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    title: 'P&L звіт і нарахувальний метод', subtitle: 'Блок 7 · Фінанси', est: '15 хв',
    description: '<b>Біль без цього:</b> гроші на рахунку є — а P&L показує збиток. Або навпаки: дохід є — а грошей немає. Власник не розуміє чому.<br><br>'
      + '<b>Відмінність Cash Flow від P&L:</b><br>'
      + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;margin:8px 0;font-size:0.82rem;">'
      + '📌 <b>Cash Flow</b> = реальний рух грошей (коли прийшла/пішла оплата)<br>'
      + '📌 <b>P&L</b> = реальний прибуток (коли надана послуга або виникла витрата)<br><br>'
      + 'Приклад: клієнт заплатив 10,000 передоплати в березні за роботу в квітні.<br>'
      + 'Cash Flow — березень (+10,000). P&L — квітень (+10,000).<br>'
      + 'Саме тому CF і P&L можуть показувати різні цифри в один місяць.</div>'
      + '<b>Повна структура P&L:</b><br>'
      + 'Виручка → Собівартість → <b>Валовий прибуток</b> → Операційні витрати → <b>Чистий прибуток</b><br><br>'
      + '<b>Дата нарахування</b> — нове поле у формі транзакції. Якщо послуга надана в одному місяці, а оплата в іншому — вкажіть дату нарахування і система правильно розбере їх між CF і P&L.<br><br>'
      + AI_BTN,
    tasks: [
        { id:'pl1', text:'Відкрити Фінанси → Аналітика → P&L звіт', detail:'Перейдіть на вкладку Аналітика → кнопка «P&L Звіт». Якщо є транзакції — побачите структуру: Виручка, Валовий прибуток, Чистий прибуток.' },
        { id:'pl2', text:'Порівняти суму в Cash Flow та P&L за поточний місяць', detail:'Якщо цифри однакові — всі оплати збігаються з датою нарахування. Якщо різні — є транзакції де оплата і послуга в різних місяцях.' },
        { id:'pl3', text:'Внести транзакцію з датою нарахування, відмінною від дати оплати', detail:'«+ Транзакція» → заповніть «Дата оплати» і «Дата нарахування» різними датами. Перевірте що в CF і P&L транзакція потрапляє в правильні місяці.' },
        { id:'pl4', text:'Переглянути маржинальність (%) по категоріях в P&L', detail:'В P&L є колонка %. Наприклад: виручка 100K, собівартість 40K → валова маржа 60%. Це ваш KPI рентабельності.' },
    ],
    action: { label:'Відкрити аналітику', tab:'finance' },
    tip: INFO_ICON + ' Норма чистої маржі для сервісного бізнесу: 20-35%. Якщо нижче 15% — або занизька ціна або завеликі операційні витрати.',
},
{
    id: 'finance_cogs_opex', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    title: 'Налаштування категорій: COGS vs OPEX', subtitle: 'Блок 7 · Фінанси', est: '10 хв',
    description: '<b>Навіщо це потрібно:</b> P&L без поділу витрат — це просто «доходи мінус витрати». Справжній P&L показує де втрачається маржа.<br><br>'
      + '<div style="display:grid;gap:8px;margin:8px 0;">'
      + '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 12px;">'
      + '<b style="color:#c2410c;">COGS (Собівартість)</b> — прямі витрати на виробництво або надання послуги.<br>'
      + '<span style="font-size:0.8rem;color:#6b7280;">Приклади: матеріали, зарплата майстрів, підрядники, компоненти.</span></div>'
      + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;">'
      + '<b style="color:#16a34a;">OPEX (Операційні)</b> — витрати на утримання бізнесу незалежно від обсягу.<br>'
      + '<span style="font-size:0.8rem;color:#6b7280;">Приклади: оренда, маркетинг, зарплата адмін, програми, податки.</span></div>'
      + '</div>'
      + '<b>Як це впливає на P&L:</b><br>'
      + 'Виручка 100K − COGS 40K = <b>Валовий прибуток 60K (60%)</b><br>'
      + 'Валовий 60K − OPEX 30K = <b>Чистий прибуток 30K (30%)</b><br><br>'
      + 'Якщо валова маржа нормальна (60%), але чистий прибуток малий (5%) — проблема в OPEX. Якщо валова маржа мала — проблема в собівартості.<br><br>'
      + AI_BTN,
    tasks: [
        { id:'cogs1', text:'Відкрити Фінанси → Налаштування → Категорії витрат', detail:'Бачите список категорій. Поруч з кожною — бейдж COGS або OPEX (якщо встановлено).' },
        { id:'cogs2', text:'Натиснути «+ Додати категорію» витрат — обрати тип COGS', detail:'Наприклад, додайте «Матеріали» або «Зарплата майстрів» з типом COGS (Собівартість).' },
        { id:'cogs3', text:'Для існуючих системних категорій — перевірити логіку розподілу', detail:'Категорії з позначкою «system» не редагуються. Для своїх категорій — тип встановлюється при додаванні.' },
        { id:'cogs4', text:'Внести 2 транзакції витрат: одну COGS і одну OPEX', detail:'Потім відкрийте P&L — побачите розбивку: Собівартість окремо, Операційні витрати окремо.' },
    ],
    action: { label:'Відкрити налаштування', tab:'finance' },
    tip: INFO_ICON + ' Правило: якщо завтра у вас вдвічі більше клієнтів — ця витрата зросте? Якщо так — COGS. Якщо ні (оренда та ж) — OPEX.',
},
{
    id: 'finance_module_links', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    title: 'Автоматичні зв\'язки: CRM і Booking → Фінанси', subtitle: 'Блок 7 · Фінанси', est: '10 хв',
    description: '<b>Біль без цього:</b> угода в CRM закрита — але у фінансах нічого. Доводиться вручну дублювати кожну операцію. Через 2 тижні дані розходяться.<br><br>'
      + '<b>Що дають зв\'язки між модулями:</b><br>'
      + '<div style="display:grid;gap:6px;margin:8px 0;">'
      + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;">'
      + '<b>CRM → Фінанси:</b> угода переходить у статус «Виграно» → система запитує підтвердження → дохід автоматично записується у фінанси з правильною категорією і рахунком.</div>'
      + '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;font-size:0.82rem;">'
      + '<b>Booking → Фінанси:</b> запис завершено і оплачено → оплата автоматично йде у фінанси.</div>'
      + '<div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;font-size:0.82rem;">'
      + '<b>Склад → Фінанси:</b> закупівля товару → витрата у фінансах. Списання → собівартість у P&L.</div>'
      + '</div>'
      + '<b>Де налаштувати:</b> Система → Налаштування → Зв\'язки між модулями (toggles).<br><br>'
      + AI_BTN,
    tasks: [
        { id:'ml1', text:'Відкрити Система → Налаштування → розділ «Зв\'язки між модулями»', detail:'Знайдіть секцію після галочок модулів. Там toggles для кожного зв\'язку.' },
        { id:'ml2', text:'Увімкнути зв\'язок CRM → Фінанси (якщо CRM використовуєте)', detail:'Toggle «CRM → Фінанси» → зелений. В картці угоди CRM з\'являться поля: Сума, Дата оплати, Рахунок, Категорія доходу.' },
        { id:'ml3', text:'Протестувати: створити тестову угоду і закрити її (статус «Виграно»)', detail:'При зміні статусу на «Виграно» — з\'явиться модал «Записати дохід у фінанси?» з передзаповненою сумою. Підтвердіть → перевірте що транзакція з\'явилась у Фінансах.' },
        { id:'ml4', text:'Увімкнути зв\'язок Booking → Фінанси (якщо Booking використовуєте)', detail:'Toggle «Booking → Фінанси». Тепер завершений запис автоматично пропонує зафіксувати оплату.' },
        { id:'ml5', text:'Перевірити права доступу до фінансів для різних ролей', detail:'Налаштування → Ролі та дозволи. Менеджери не повинні бачити повний P&L і Баланс — тільки суми своїх угод.' },
    ],
    action: { label:'Відкрити налаштування', tab:'users' },
    tip: WARN_ICON + ' Важливо: не давайте всім доступ до фінансів. Менеджер повинен бачити суму своєї угоди — але не загальний P&L компанії.',
},
{
    id: 'finance_weekly_plan', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    title: 'Тижневий план доходів і витрат на 6 місяців', subtitle: 'Блок 7 · Фінанси', est: '20 хв',
    description: '<b>Навіщо:</b> місячний бюджет — це грубо. Якщо знаєте що в тижні 3 і 4 буде провал по продажах — можна підготуватися заздалегідь. Саме для цього тижневий план.<br><br>'
      + '<b>Що показує тижневий план:</b><br>'
      + '<div style="display:grid;gap:6px;margin:8px 0;">'
      + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;">'
      + '<b>Стовпчиковий графік:</b> зелені бари = дохід, червоні = витрати по кожному тижню. Факт накладається поверх плану де вже є дані.</div>'
      + '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;font-size:0.82rem;">'
      + '<b>Cashflow лінія (синя):</b> накопичувальний залишок грошей. Якщо лінія йде нижче нуля — касовий розрив.</div>'
      + '<div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;font-size:0.82rem;">'
      + '<b>Таблиця по місяцях:</b> кожен тиждень — план/факт доходів, план/факт витрат, відхилення Δ, залишок CF. Планові суми редагуються прямо в таблиці.</div>'
      + '</div>'
      + '<b>Де знайти:</b> Фінанси → Планування → кнопка «Тижневий план 6M».<br><br>'
      + AI_BTN,
    tasks: [
        { id:'wp1', text:'Відкрити Фінанси → Планування → «Тижневий план 6M»', detail:'Відкриється графік з поточним і майбутніми тижнями. Якщо є транзакції — минулі тижні вже заповнені фактом.' },
        { id:'wp2', text:'Вказати початковий залишок рахунків (поле «Початковий залишок»)', detail:'Вкажіть поточний залишок грошей на всіх рахунках. Це стартова точка для розрахунку cashflow лінії.' },
        { id:'wp3', text:'Натиснути «Заповнити з середнього 3M» щоб отримати базовий план', detail:'Система розраховує середній тиждень за останні 3 місяці і заповнює майбутні тижні. Потім можна коригувати вручну.' },
        { id:'wp4', text:'Скоригувати тижні де очікується більше або менше продажів', detail:'В таблиці клікніть на будь-яке планове поле → введіть потрібну суму. Графік оновиться після збереження.' },
        { id:'wp5', text:'Знайти тижні де cashflow лінія йде вниз — і скоригувати план', detail:'Якщо синя лінія падає нижче нуля — це касовий розрив. Збільшіть плановий дохід або зменшіть витрати в цьому тижні.' },
        { id:'wp6', text:'Зберегти план і переглянути підсумкові KPI', detail:'«Зберегти план» → KPI картки вгорі показують: плановий дохід 6M, витрати, прибуток, очікуваний залишок наприкінці.' },
    ],
    action: { label:'Відкрити планування', tab:'finance' },
    tip: INFO_ICON + ' Тижневий план — це не прогноз погоди. Це ваш намір. Навіть якщо факт відрізняється від плану на 30% — це вже краще ніж планувати «в голові».',
},



{
    id: 'finance_intro_what', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    title: 'Фінанси: з чого почати', subtitle: 'Блок 7 · Фінанси', est: '10 хв',
    description: '<b>Фінансовий модуль — це не бухгалтерія.</b> Це інструмент управлінського контролю для власника.<br><br>Головний принцип: <b>дані вносяться один раз → автоматично з\'являються у звітах, P&L, Cash Flow і дашборді.</b><br><br><div style="display:grid;gap:6px;margin:8px 0;"><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Дашборд</b> — 4 KPI: Дохід / Витрати / Прибуток / Маржа. Оновлюється при кожній транзакції.</div><div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Транзакції</b> — основа всього. Кожен дохід і витрата з категорією.</div><div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Рахунки клієнтам</b> — створюєте з CRM, PDF за 2 хвилини, при оплаті автоматично йде в доходи.</div><div style="background:#fce7f3;border:1px solid #fbcfe8;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Аналітика</b> — P&L, Cash Flow, Баланс, тижневий план 6M.</div><div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Регулярні платежі</b> — оренда, зарплати, підписки — налаштовуєте один раз.</div></div><b>З чого почати:</b> налаштуйте рахунки → додайте категорії → внесіть перші транзакції → дашборд одразу оживе.'
      + AI_BTN,
    tasks: [
        { id:'fi0', text:'Відкрити розділ Фінанси в головному меню', detail:'Фінанси — вкладка у верхньому меню. На мобільному — в нижньому меню.' },
        { id:'fi1', text:'Переглянути дашборд — зрозуміти структуру розділів', detail:'Дашборд → Транзакції → Рахунки → Планування → Аналітика. Витратьте 5 хвилин щоб зрозуміти де що знаходиться.' },
        { id:'fi2', text:'Відкрити Налаштування → Рахунки і перевірити список рахунків', detail:'За замовчуванням є «Основний рахунок». Додайте свої: готівка, розрахунковий рахунок, каса.' },
        { id:'fi3', text:'Відкрити Налаштування → Категорії і додати основні категорії доходів', detail:'Наприклад: «Послуги», «Товари», «Абонементи». Без категорій аналітика не працює.' },
        { id:'fi4', text:'Внести першу транзакцію доходу', detail:'Фінанси → Транзакції → «+ Транзакція» → тип «Дохід» → сума, категорія, рахунок, дата → зберегти. Дашборд оновиться.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: INFO_ICON + ' Найшвидший старт: 5 реальних транзакцій цього місяця — і дашборд вже показує картину. Не чекайте «ідеального моменту».',
},
{
    id: 'finance_accounts', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    title: 'Рахунки: налаштування і структура', subtitle: 'Блок 7 · Фінанси', est: '10 хв',
    description: '<b>Рахунки</b> — це гаманці вашого бізнесу. Кожна транзакція прив\'язана до конкретного рахунку.<br><br><b>Навіщо розділяти рахунки:</b><br><div style="display:grid;gap:6px;margin:8px 0;"><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;">Бачите скільки грошей на кожному рахунку в реальному часі</div><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;">Cashflow рахується по всіх рахунках разом — реальний залишок бізнесу</div><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;">Перекази між рахунками не впливають на прибуток — тільки на розподіл</div></div><b>Типова структура:</b><br>Розрахунковий рахунок (банк) + Каса (готівка) + Картка (корпоративна) + Stripe/LiqPay (онлайн-оплати)<br><br><b>Початковий залишок</b> — введіть реальну суму на кожному рахунку на дату початку роботи з системою.'
      + AI_BTN,
    tasks: [
        { id:'fa1', text:'Відкрити Фінанси → Налаштування → Рахунки', detail:'Бачите список рахунків. За замовчуванням є «Основний рахунок».' },
        { id:'fa2', text:'Додати рахунки які реально використовуєте', detail:'Готівка, розрахунковий рахунок, картка, онлайн-каса. Вкажіть назву і валюту.' },
        { id:'fa3', text:'Внести початковий залишок для кожного рахунку', detail:'Редагуйте рахунок → поле «Початковий залишок» → реальна сума на сьогодні.' },
        { id:'fa4', text:'Перевірити що сума всіх початкових залишків = реальні гроші бізнесу', detail:'Дашборд → блок «Залишок по рахунках» має співпадати з реальністю.' },
    ],
    action: { label:'Відкрити налаштування', tab:'finance' },
    tip: INFO_ICON + ' Не створюйте забагато рахунків. 2-4 рахунки — оптимально. Важливо щоб ви реально вносили транзакції на правильний рахунок.',
},
{
    id: 'finance_transactions', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    title: 'Транзакції: як правильно вносити', subtitle: 'Блок 7 · Фінанси', est: '15 хв',
    description: '<b>Транзакція</b> — основний елемент фінансового обліку. Кожен дохід і витрата = одна транзакція.<br><br><b>Поля транзакції:</b><br><div style="display:grid;gap:6px;margin:8px 0;"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Тип</b> — Дохід / Витрата / Переказ між рахунками</div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Сума і рахунок</b> — скільки і на якому рахунку</div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Категорія</b> — для групування в P&L і аналітиці</div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Дата оплати</b> — коли реально пройшли гроші (для Cash Flow)</div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Дата нарахування</b> — коли надана послуга (для P&L). Можна не заповнювати якщо збігається з датою оплати</div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Прив\'язка до угоди</b> — з CRM. Тоді видно маржу кожного замовлення</div></div><b>Регулярні платежі</b> — оренда, зарплата, підписки — налаштовуйте один раз.'
      + AI_BTN,
    tasks: [
        { id:'ft1', text:'Внести 3 реальних доходи цього місяця', detail:'Фінанси → Транзакції → «+ Транзакція» → Дохід → заповніть всі поля → зберегти.' },
        { id:'ft2', text:'Внести 3 реальних витрати з правильними категоріями', detail:'Витрати → вкажіть тип COGS або OPEX якщо налаштували категорії.' },
        { id:'ft3', text:'Налаштувати 1 регулярний платіж (наприклад оренда)', detail:'Фінанси → Налаштування → Регулярні платежі → «+ Новий» → сума, категорія, день місяця, рахунок.' },
        { id:'ft4', text:'Перевірити дашборд після внесення транзакцій', detail:'Дашборд має показати зміни в KPI: Дохід, Витрати, Прибуток, Маржа.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: INFO_ICON + ' Головне правило: вносити транзакції регулярно — хоча б раз на тиждень. 15 хвилин на тиждень = повна фінансова картина місяця.',
},
{
    id: 'finance_invoices', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    title: 'Рахунки клієнтам (Invoices)', subtitle: 'Блок 7 · Фінанси', est: '10 хв',
    description: '<b>Біль без цього:</b> рахунок вручну в Word. 20 хвилин на один рахунок. 30 клієнтів = 10 годин на місяць.<br><br><b>Як працює Invoice в TALKO:</b><br><div style="display:grid;gap:6px;margin:8px 0;"><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Створення з угоди CRM:</b> кнопка «Рахунок» в картці угоди → клієнт і сума підставляються автоматично → додаєте позиції → PDF за 2 хвилини</div><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Статуси:</b> Чернетка → Відправлений → Оплачений. При статусі «Оплачений» → транзакція доходу створюється автоматично</div><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;font-size:0.82rem;"><b>Відстеження:</b> бачите які рахунки очікують оплати і на яку суму — дебіторська заборгованість</div></div><b>Реквізити компанії</b> для рахунків: Система → Налаштування → Реквізити компанії. Заповніть один раз — підставляються в кожен рахунок.'
      + AI_BTN,
    tasks: [
        { id:'inv1', text:'Заповнити реквізити компанії для рахунків', detail:'Система → Налаштування → Реквізити компанії: назва, адреса, ЄДРПОУ, банківські реквізити.' },
        { id:'inv2', text:'Створити тестовий рахунок з картки CRM-угоди', detail:'Відкрийте будь-яку угоду → кнопка «Рахунок» → додайте 1-2 позиції → перегляд PDF → зберегти.' },
        { id:'inv3', text:'Відмітити рахунок як «Оплачений» і перевірити що транзакція створилась', detail:'Фінанси → Рахунки → знайдіть тестовий рахунок → статус «Оплачений» → перевірте Транзакції — має з\'явитись дохід.' },
        { id:'inv4', text:'Перевірити список несплачених рахунків (дебіторка)', detail:'Фінанси → Рахунки → фільтр «Відправлений». Це ваша поточна дебіторська заборгованість.' },
    ],
    action: { label:'Відкрити фінанси', tab:'finance' },
    tip: INFO_ICON + ' Рахунок з системи = автоматична транзакція при оплаті. Жодного подвійного введення. Це економить 3-5 годин на місяць.',
},
{
    id: 'finance_analytics', block: 'finance', color: '#10b981',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    title: 'Аналітика: P&L, Cash Flow і прогноз', subtitle: 'Блок 7 · Фінанси', est: '15 хв',
    description: '<b>Три звіти які має знати кожен власник:</b><br><br><div style="display:grid;gap:8px;margin:8px 0;"><div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;"><b style="color:#1d4ed8;">P&L (Прибутки і збитки)</b><br><span style="font-size:0.82rem;color:#374151;">Показує: чи заробляєте ви. Виручка − Собівартість = Валовий прибуток − OPEX = Чистий прибуток. Відповідає на питання: «Чи прибутковий мій бізнес?»</span></div><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 12px;"><b style="color:#15803d;">Cash Flow (Рух грошей)</b><br><span style="font-size:0.82rem;color:#374151;">Показує: де гроші зараз і коли вони прийдуть. Бізнес може бути прибутковим але без грошей на рахунку. Відповідає на питання: «Чи є гроші прямо зараз?»</span></div><div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:10px 12px;"><b style="color:#7c3aed;">Баланс</b><br><span style="font-size:0.82rem;color:#374151;">Показує: що у вас є і скільки ви винні. Активи, зобов\'язання, капітал. Відповідає на питання: «Скільки коштує мій бізнес?»</span></div></div><b>Тижневий план 6M</b> — прогноз cashflow на півроку вперед. Видно коли буде касовий розрив — до того як він станеться.'
      + AI_BTN,
    tasks: [
        { id:'fan1', text:'Відкрити Фінанси → Аналітика → Cash Flow', detail:'Графік руху грошей по місяцях. Якщо даних немає — спочатку внесіть транзакції.' },
        { id:'fan2', text:'Відкрити P&L звіт за поточний місяць', detail:'Аналітика → P&L → поточний місяць. Перевірте валову маржу і чистий прибуток.' },
        { id:'fan3', text:'Відкрити Баланс і перевірити поточні активи', detail:'Аналітика → Баланс. Дебіторка (несплачені рахунки) + гроші на рахунках = ваші активи.' },
        { id:'fan4', text:'Задати питання AI-аналітику в розділі Аналітика', detail:'«Які категорії витрат зросли цього місяця?» або «Порівняй прибуток з минулим місяцем». AI відповідає на основі ваших реальних даних.' },
    ],
    action: { label:'Відкрити аналітику', tab:'finance' },
    tip: INFO_ICON + ' Дивіться P&L раз на тиждень. 10 хвилин — і ви розумієте стан бізнесу краще ніж більшість власників.',
},


// ══ БЛОК 8 — БІЗНЕС ══════════════════════════════════════════
{
    id: 'crm', block: 'business', color: '#f97316',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.93 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.68 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    title: 'CRM: клієнти, угоди, продажі', subtitle: 'Блок 8 · Бізнес', est: '15 хв',
    description: '<b>Біль без цього:</b> клієнти в Excel або голові продавця. Він звільняється — бізнес втрачає всю базу.<br><br><b>Канбан угод:</b> Лід → Переговори → Пропозиція → Рахунок → Оплата.<br><b>Клієнти</b> — база контактів з усіма угодами, перепискою, наступним контактом.<br><b>Угода → рахунок → автоматично у Фінанси.</b><br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'crm1', text:'Відкрити CRM і переглянути канбан угод', detail:'Налаштуйте назви стадій під свій бізнес: CRM → Налаштування → Воронки.' },
        { id:'crm2', text:'Створити тестову угоду і перетягнути між стадіями', detail:'«+ Угода». Назва, сума, клієнт, стадія. Спробуйте drag & drop.' },
        { id:'crm3', text:'Додати клієнта і прив\'язати до нього угоду', detail:'CRM → Клієнти → «+ Клієнт».' },
        { id:'crm4', text:'З угоди створити завдання «Передзвонити» з дедлайном', detail:'Відкрийте угоду → «Задача». З\'являється в системі.' },
    ],
    action: { label:'Відкрити CRM', tab:'crm' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Головне правило CRM: будь-яка взаємодія з клієнтом — фіксується. Через 6 місяців цей журнал стає найціннішим активом.'
},
{
    id: 'bots_sites', block: 'business', color: '#3b82f6',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    title: 'Маркетинг, Боти та Мої сайти', subtitle: 'Блок 8 · Бізнес', est: '10 хв',
    description: '<b>Боти</b> — конструктор Telegram-ботів без коду. Ліди автоматично в CRM.<br><b>Мої сайти</b> — конструктор лендингів. Форми → автоматично в CRM.<br><b>Маркетинг</b> — шаблони, статистика по каналах.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'b1', text:'Відкрити «Боти» і переглянути як підключається Telegram-бот', detail:'Боти → «+ Новий бот» → токен від @BotFather → привітальне повідомлення.' },
        { id:'b2', text:'Переглянути конструктор ланцюжків повідомлень', detail:'В боті → «Ланцюги» → «+ Новий ланцюжок». Drag & drop: Повідомлення, Запитання, Умова.' },
        { id:'b3', text:'Відкрити «Мої сайти» і переглянути конструктор', detail:'Сайти → «+ Новий сайт». Шаблон → редагувати → опублікувати. Форма → в CRM.' },
    ],
    action: { label:'Відкрити боти', tab:'bots' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Навіть простий бот що відповідає і передає контакт в CRM — вже краще ніж нічого.'
},


{
    id: 'warehouse', block: 'business', color: '#6366f1',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.5V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.5"/><path d="M22 8.5H2"/><path d="M10 12h4"/><rect x="2" y="2" width="20" height="6.5" rx="1"/></svg>',
    title: 'Склад: облік товарів і матеріалів', subtitle: 'Блок 8 · Бізнес', est: '10 хв',
    description: '<b>Біль без цього:</b> матеріали списуються «на глаз», склад з\'являється в голові одного менеджера, інвентаризація — раз на рік.<br><br><b>Каталог товарів</b> — кожна позиція з артикулом, одиницею виміру, мінімальним запасом.<br><b>Рух матеріалів:</b> Прихід, Видача, Списання, Коригування.<br><b>Алерти</b> — система сповіщає коли залишок нижче мінімуму.<br><br><b>Де знайти:</b> Бізнес → Склад.<br><br>' + '<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'wh1', text:'Відкрити Бізнес → Склад', detail:'Вкладка «Склад» доступна в меню Бізнес.' },
        { id:'wh2', text:'Додати 2-3 товари в каталог', detail:'«+ Додати товар» → назва, SKU, одиниця, мінімальний запас.' },
        { id:'wh3', text:'Зробити операцію «Прихід» для одного товару', detail:'Операції → «Прихід» → обрати товар → вказати кількість і постачальника.' },
        { id:'wh4', text:'Переглянути дашборд складу — алерти і залишки', detail:'Дашборд → перевірте чи є алерти по мінімальному запасу.' },
    ],
    action: { label:'Відкрити склад', tab:'warehouse' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Встановіть мінімальний запас для критичних матеріалів — система буде попереджати автоматично.',
},
{
    id: 'warehouse_multiloc', block: 'business', color: '#6366f1',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>',
    title: 'Склад: точки, переміщення, інвентаризація', subtitle: 'Блок 8 · Бізнес', est: '15 хв',
    description: '<b>Біль без цього:</b> є головний склад і кілька точок — але невідомо де що лежить, скільки витратив кожен салон, і куди зникають матеріали між інвентаризаціями.<br><br>'
      + '<div style="display:grid;gap:6px;margin:8px 0;">'
      + '<div style="background:#eef6ff;border:1px solid #bfdbfe;border-radius:8px;padding:.6rem .9rem;"><b style="color:#1e3a5f;font-size:.72rem;">ПО ТОЧКАХ</b><br>Таблиця: товар → скільки є на складі і кожному салоні одночасно. Фільтр по одній точці.</div>'
      + '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.6rem .9rem;"><b style="color:#166534;font-size:.72rem;">ПЕРЕМІЩЕННЯ</b><br>Передати товар зі складу в салон або між салонами. Система фіксує хто, коли, скільки і куди.</div>'
      + '<div style="background:#fff8e1;border:1px solid #fde68a;border-radius:8px;padding:.6rem .9rem;"><b style="color:#92400e;font-size:.72rem;">ІНВЕНТАРИЗАЦІЯ</b><br>Щомісяця по кожній точці: вводите фактичну кількість → система порівнює з очікуваним → показує відхилення → коригує залишки автоматично.</div>'
      + '<div style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;padding:.6rem .9rem;"><b style="color:#6b21a8;font-size:.72rem;">ЗВІТИ</b><br>По місяцях · Порівняння салонів · Річний огляд. Бачите де витрати вищі і як змінюється динаміка.</div>'
      + '</div>'
      + '<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'wml1', text:'Перевірити локації: Склад → Локації', detail:'Переконайтесь що кожна точка створена з правильною назвою. Якщо потрібно — додайте або перейменуйте.' },
        { id:'wml2', text:'Відкрити «По точках» — переглянути таблицю залишків', detail:'Склад → вкладка «По точках». Після першої інвентаризації тут з\'являться реальні залишки по кожній точці.' },
        { id:'wml3', text:'Зробити перше переміщення товару між локаціями', detail:'«Переміщення» → «Нове переміщення» → оберіть товар, звідки, куди, кількість. Перевірте що залишки оновились у «По точках».' },
        { id:'wml4', text:'Провести першу інвентаризацію по одній точці', detail:'«Інвентаризація» → «Нова інвентаризація» → оберіть локацію і місяць → введіть фактичну кількість → «Підтвердити і скоригувати». Це перенесе реальні залишки в систему.' },
        { id:'wml5', text:'Переглянути звіт по місяцях', detail:'«Звіти» → «По місяцях» → оберіть рік. Після кількох операцій тут з\'являться дані по витратах кожної точки.' },
    ],
    action: { label:'Відкрити склад', tab:'warehouse' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Перша інвентаризація — найважливіший крок. Саме вона заповнює реальні залишки по точках. Без неї вкладка «По точках» буде порожньою.',
},
{
    id: 'estimate_norms', block: 'business', color: '#f97316',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>',
    title: 'Довідник норм матеріалів', subtitle: 'Блок 8 · Бізнес', est: '10 хв',
    description: '<b>Біль без цього:</b> скільки матеріалів потрібно на проект? Власник рахує вручну або на пальцях — помиляється, переплачує або матеріалів не вистачає на об\'єкті.<br><br><b>Довідник норм</b> — один раз налаштував норми витрат → система сама рахує по будь-якому проекту. Вибрав тип роботи, ввів площу — отримав специфікацію.<br><br><b>Де знайти:</b> Бізнес → Кошторис → Довідник норм.<br><br>' + '<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'en1', text:'Відкрити Довідник норм', detail:'Бізнес → Кошторис → вкладка «Довідник норм».' },
        { id:'en2', text:'Завантажити стандартні норми для вашої ніші', detail:'«Завантажити стандартні» → оберіть нішу (Будівництво / Ремонт / Металоконструкції) → підтвердити.' },
        { id:'en3', text:'Відредагувати або додати свою норму', detail:'«Редагувати» → змінити нормативи під реалії вашого бізнесу, або «+ Додати норму» для власного типу робіт.' },
    ],
    action: { label:'Відкрити Довідник норм', tab:'estimate' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Без довідника норм система не може рахувати матеріали автоматично. Це фундамент модуля кошторису.',
},
{
    id: 'estimate_project', block: 'business', color: '#f97316',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    title: 'Кошторис проекту', subtitle: 'Блок 8 · Бізнес', est: '15 хв',
    description: '<b>Біль без цього:</b> матеріали замовили — не те або не стільки. Проект стоїть. Гроші витрачено, а об\'єкт не здали в термін.<br><br><b>Кошторис</b> = специфікація + склад + фінанси в одному екрані. Бачиш одразу: є матеріал, дефіцит, скільки докупити і за скільки.<br><br><b>Прив\'язаний до проекту</b> — кошторис видно у вкладці «Кошторис» всередині проекту.<br><br>При затвердженні → автоматична транзакція у фінансах. При дефіциті → автоматична задача «Закупити матеріали».<br><br>' + '<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'ep1', text:'Створити перший кошторис', detail:'Бізнес → Кошторис → «+ Новий кошторис» → введіть назву і прив\'яжіть до проекту.' },
        { id:'ep2', text:'Додати тип роботи та ввести об\'єми', detail:'«+ Додати тип роботи» → оберіть норму → введіть площу або об\'єм. Система розрахує матеріали.' },
        { id:'ep3', text:'Перевірити дефіцит матеріалів по складу', detail:'У таблиці матеріалів помаранчевим відображається дефіцит — скільки треба докупити.' },
        { id:'ep4', text:'Затвердити кошторис', detail:'«Затвердити кошторис» → створюється планова транзакція у фінансах.' },
    ],
    action: { label:'Відкрити Кошториси', tab:'estimate' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Кошторис прив\'язаний до проекту, угоди в CRM і складу одночасно. Дефіцит матеріалів → автоматична задача на закупівлю.',
},
{
    id: 'booking', block: 'business', color: '#0ea5e9',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
    title: 'Бронювання: онлайн-запис клієнтів', subtitle: 'Блок 8 · Бізнес', est: '10 хв',
    description: '<b>Біль без цього:</b> клієнти пишуть в Direct щоб записатись, менеджер переносить в таблицю, конфлікти часу, ручне підтвердження.<br><br><b>Бронювання</b> — власний Calendly всередині TALKO:<br>• Налаштуйте послуги і тривалість<br>• Вкажіть робочі дні і години<br>• Отримайте публічне посилання для запису<br>• Заявки автоматично в системі<br><br><b>Де знайти:</b> Бізнес → Бронювання.<br><br>' + '<a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Запитати AI-асистента</a>',
    tasks: [
        { id:'bk1', text:'Відкрити Бізнес → Бронювання', detail:'Вкладка «Бронювання» в меню Бізнес.' },
        { id:'bk2', text:'Додати послугу з тривалістю і назвою', detail:'«+ Послуга» → назва, тривалість (хв), опис. Можна додати кілька послуг.' },
        { id:'bk3', text:'Налаштувати робочі дні і години', detail:'Оберіть дні тижня і вкажіть початок/кінець робочого дня.' },
        { id:'bk4', text:'Скопіювати посилання і відкрити в браузері', detail:'«Копіювати посилання» → відкрити в новій вкладці → перевірити як виглядає для клієнта.' },
    ],
    action: { label:'Відкрити бронювання', tab:'booking' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Поставте посилання в Instagram bio або в Telegram-бота — клієнти самі записуватимуться без менеджера.',
},

// ══ БЛОК 9 — НАВЧАННЯ (НОВІ) ══════════════════════════════════
{
    id: 'learning_start', block: 'learning', color: '#0ea5e9',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    title: 'Навчання: маршрут програми і перші модулі', subtitle: 'Блок 9 · Навчання', est: '20 хв',
    description: '<b>Навчання — не бонус, це база.</b> Без методології власник буде «клікати кнопки» не розуміючи навіщо.<br><br>Вкладка <b>«Навчання»</b> тепер в головному меню зверху. Там 15 модулів.<br><br><b>З чого почати — перші 5 модулів:</b><br><br><div style="display:grid;gap:6px;margin:6px 0;"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 0</b><br><b>Маршрут програми</b> — покрокова карта впровадження. <b>Починати звідси.</b></div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 4</b><br><b>Система розпоряджень</b> — як ставити завдання щоб виконували.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 5</b><br><b>Система РАДАР</b> — як перестати бути «пожежником» для команди.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 9</b><br><b>Ціль, задум, функціональна структура</b> — фундамент системного бізнесу.</div><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.6rem .9rem;"><b style="color:#0284c7;font-size:.72rem;">МОДУЛЬ 13</b><br><b>Система статистик</b> — як бачити бізнес у цифрах.</div></div>',
    tasks: [
        { id:'lr1', text:'Відкрити вкладку «Навчання» в головному меню (між Аналітика і Система)', detail:'Нова кнопка в десктопному меню. На мобільному — в нижньому меню.' },
        { id:'lr2', text:'Переглянути Модуль 0 «Маршрут програми»', detail:'Це карта всього шляху. Після перегляду стане зрозуміло в якій послідовності рухатись.' },
        { id:'lr3', text:'Переглянути Модуль 4 «Система розпоряджень»', detail:'Після цього модуля якість делегування зростає одразу.' },
        { id:'lr4', text:'Запланувати проходження решти модулів — по 1 на тиждень', detail:'Не намагайтесь пройти все одразу. 1 модуль на тиждень = засвоєно і впроваджено.' },
    ],
    action: { label:'Відкрити навчання', tab:'learning' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Навчання і впровадження — паралельно. Пройшли модуль → одразу налаштували в системі → закріпилось.'
},
{
    id: 'learning_ai', block: 'learning', color: '#0ea5e9',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>',
    title: 'AI-асистент і інтеграції', subtitle: 'Блок 9 · Навчання', est: '5 хв',
    description: '<b>Зелена кнопка вгорі</b> — AI-асистент який знає всю систему TALKO. Може:<br>— Відповісти на будь-яке питання про функціонал<br>— Допомогти правильно поставити завдання<br>— Підказати як налаштувати процес або бота<br><br>Це не загальний ChatGPT — це консультант по TALKO.<br><br><b>Інтеграції:</b> Google Calendar (синхронізація дедлайнів), Telegram (нотифікації), Webhook API.<br><br><a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#22c55e;color:white;border-radius:8px;font-size:.82rem;font-weight:700;text-decoration:none;"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 2-7 20-4-9-9-4 20-7z\"/><path d=\"M22 2 11 13\"/></svg> Відкрити AI-асистента</a>',
    tasks: [
        { id:'ai1', text:'Натиснути зелену кнопку і задати питання про платформу', detail:'Наприклад: «Як налаштувати повторювану задачу?»' },
        { id:'ai2', text:'Відкрити «Інтеграції» і переглянути доступні підключення', detail:'Google Calendar, Telegram, Webhook.' },
        { id:'ai3', text:'Підключити Google Calendar або переконатись що Telegram підключений', detail:'Обрати інтеграцію → дотримуватись інструкції. 3-5 хвилин.' },
    ],
    action: { label:'Відкрити інтеграції', tab:'integrations' },
    tip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> AI-асистент 24/7 — перша точка допомоги. Перш ніж писати розробнику — запитайте асистента.'
},

]; // end OB_STEPS

// ─── STATE ─────────────────────────────────────────────────
let ob = { progress: {}, activeStep: -1, loaded: false };

// ─── FIRESTORE ─────────────────────────────────────────────
async function obLoad() {
    if (!window.currentCompany) return;
    try {
        const doc = await window.companyRef().collection('settings').doc('onboarding').get();
        if (doc.exists) {
            const d = doc.data();
            ob.progress = d.progress || {};
            if (typeof d.activeStep === 'number' && d.activeStep >= 0) ob.activeStep = d.activeStep;
        }
    } catch(e) {}
    ob.loaded = true;
}
async function obSave() {
    if (!window.currentCompany) return;
    try {
        await window.companyRef().collection('settings').doc('onboarding').set(
            { progress: ob.progress, activeStep: ob.activeStep, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );
    } catch(e) {}
}

// ─── HELPERS ───────────────────────────────────────────────

// Overlay i18n translations onto a step object
function getLocalizedStep(step) {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : null)
               || localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || 'ua';
    if (lang === 'ua') return step; // UA is base language — no overlay needed
    const i18n = window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang][step.id];
    if (!i18n) return step; // no translation — show UA fallback
    const localized = Object.assign({}, step);
    if (i18n.title)       localized.title       = i18n.title;
    if (i18n.subtitle)    localized.subtitle     = i18n.subtitle;
    if (i18n.est)         localized.est          = i18n.est;
    if (i18n.description) localized.description  = i18n.description;
    if (i18n.tipText)     localized.tip          = i18n.tipText;
    if (i18n.actionLabel) localized.action       = Object.assign({}, step.action || {}, { label: i18n.actionLabel });
    if (i18n.tasks && i18n.tasks.length) {
        localized.tasks = step.tasks.map(function(t, idx) {
            const tr = i18n.tasks[idx];
            if (!tr) return t;
            return Object.assign({}, t, {
                text:   tr.text   || t.text,
                detail: tr.detail || t.detail,
            });
        });
    }
    return localized;
}

function stepDoneCount(step) {
    const p = ob.progress[step.id];
    if (!p) return 0;
    return step.tasks.filter(t => p.tasks && p.tasks[t.id]).length;
}
function stepComplete(step) { return stepDoneCount(step) === step.tasks.length; }
function totalProgress() {
    const done = OB_STEPS.filter(s => stepComplete(s)).length;
    return Math.round(done / OB_STEPS.length * 100);
}
function blockProgress(blockId) {
    const steps = OB_STEPS.filter(s => s.block === blockId);
    if (!steps.length) return null;
    const done = steps.filter(s => stepComplete(s)).length;
    return { done, total: steps.length, pct: Math.round(done / steps.length * 100) };
}

// ─── WELCOME SCREEN ────────────────────────────────────────
function renderWelcome() {
    const c = document.getElementById('onboardingTab');
    if (!c) return;
    const pct = totalProgress();
    const doneTasks = OB_STEPS.reduce((s,st) => s + stepDoneCount(st), 0);
    const allTasks  = OB_STEPS.reduce((s,st) => s + st.tasks.length, 0);
    const alreadyStarted = doneTasks > 0;
    const totalMins = OB_STEPS.reduce((s,st) => s + (parseInt(st.est)||0), 0);
    const ui = typeof getOBUI === 'function' ? getOBUI : () => '';
    const lang = (typeof currentLang !== 'undefined' ? currentLang : null) || localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || 'ua';
    const timeLabel = lang === 'en'
        ? `~${Math.floor(totalMins/60)}h ${totalMins%60}min`
        : lang === 'ru'
        ? `~${Math.floor(totalMins/60)} ч ${totalMins%60} мин`
        : `~${Math.floor(totalMins/60)} год ${totalMins%60} хв`;
    const txt = {
        title:    lang==='en' ? 'TALKO OS Onboarding' : lang==='ru' ? 'TALKO OS Онбординг' : lang==='pl' ? 'TALKO OS Onboarding' : lang==='de' ? 'TALKO OS Onboarding' : lang==='cs' ? 'TALKO OS Onboarding' : 'TALKO OS Онбординг',
        subtitle: lang==='en' ? 'Step-by-step system setup. From first login to business on autopilot.'
                              : lang==='ru' ? 'Пошаговая настройка системы. От первого входа до бизнеса на автопилоте.'
                              : 'Покрокове налаштування системи. Від першого входу до бізнесу на автопілоті.',
        steps:    lang==='en' ? 'steps'    : lang==='ru' ? 'шагов'    : 'кроків',
        totalTime:lang==='en' ? 'total time': lang==='ru' ? 'общее время': 'загальний час',
        progress: lang==='en' ? 'Your progress' : lang==='ru' ? 'Ваш прогресс' : 'Ваш прогрес',
        ofTasks:  lang==='en' ? 'of tasks'  : lang==='ru' ? 'из заданий' : 'з завдань',
        whats:    lang==='en' ? 'What\'s included in onboarding' : lang==='ru' ? 'Что входит в онбординг' : 'Що входить в онбординг',
        start:    lang==='en' ? 'Start setup'    : lang==='ru' ? 'Начать настройку'    : 'Почати налаштування',
        resume:   lang==='en' ? 'Continue setup' : lang==='ru' ? 'Продолжить настройку': 'Продовжити налаштування',
        fromStart:lang==='en' ? 'view from beginning' : lang==='ru' ? 'просмотреть с начала' : 'переглянути з початку',
        or:       lang==='en' ? 'or' : lang==='ru' ? 'или' : 'або',
        completed: ui('completed') || (lang==='en'?'completed':lang==='ru'?'выполнено':'виконано'),
        stepsOf:   ui('stepsOf')   || (lang==='en'?'steps':lang==='ru'?'шаги':'кроки'),
    };

    c.innerHTML = `
<div style="min-height:calc(100vh - 56px);background:linear-gradient(135deg,#f0f9ff,#f8fafc 50%,#f0fdf4);display:flex;align-items:center;justify-content:center;padding:2rem 1rem;">
<div style="max-width:700px;width:100%;">
  <div style="text-align:center;margin-bottom:1.75rem;">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:68px;height:68px;background:linear-gradient(135deg,#22c55e,#0ea5e9);border-radius:18px;margin-bottom:1rem;box-shadow:0 8px 24px rgba(34,197,94,.3);">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
    <h1 style="font-size:1.8rem;font-weight:900;color:#0c1a2e;margin:0 0 .4rem;line-height:1.2;">${txt.title}</h1>
    <p style="font-size:.95rem;color:#6b7280;max-width:460px;margin:0 auto;line-height:1.6;">${txt.subtitle}</p>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem;margin-bottom:1.25rem;">
    <div style="background:white;border-radius:12px;padding:1rem;text-align:center;border:1px solid #e8eaed;box-shadow:0 2px 8px rgba(0,0,0,.05);">
      <div style="font-size:1.7rem;font-weight:900;color:#22c55e;">${OB_STEPS.length}</div>
      <div style="font-size:.75rem;color:#9ca3af;">${txt.steps}</div>
    </div>
    <div style="background:white;border-radius:12px;padding:1rem;text-align:center;border:1px solid #e8eaed;box-shadow:0 2px 8px rgba(0,0,0,.05);">
      <div style="font-size:1.7rem;font-weight:900;color:#0ea5e9;">${timeLabel}</div>
      <div style="font-size:.75rem;color:#9ca3af;">${txt.totalTime}</div>
    </div>
    <div style="background:white;border-radius:12px;padding:1rem;text-align:center;border:1px solid #e8eaed;box-shadow:0 2px 8px rgba(0,0,0,.05);">
      <div style="font-size:1.7rem;font-weight:900;color:#8b5cf6;">${pct}%</div>
      <div style="font-size:.75rem;color:#9ca3af;">${txt.completed}</div>
    </div>
  </div>
  ${alreadyStarted ? `<div style="background:white;border-radius:12px;padding:1rem 1.1rem;margin-bottom:1.25rem;border:1px solid #bbf7d0;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;">
      <div style="font-weight:700;font-size:.85rem;color:#15803d;">${txt.progress}</div>
      <div style="font-size:.75rem;color:#6b7280;">${doneTasks} ${txt.ofTasks} ${allTasks}</div>
    </div>
    <div style="background:#f1f5f9;border-radius:999px;height:8px;margin-bottom:.75rem;">
      <div style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);width:${Math.round(doneTasks/allTasks*100)}%;border-radius:999px;"></div>
    </div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;">
      ${OB_BLOCKS.map(b => { const bp = blockProgress(b.id); if(!bp) return ''; const done = bp.done===bp.total&&bp.done>0; const lbl = (typeof getOBBlockLabel==='function'?getOBBlockLabel(b.id):b.label); return `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:999px;font-size:.7rem;font-weight:600;background:${done?b.color+'18':'#f1f5f9'};color:${done?b.color:'#9ca3af'};border:1px solid ${done?b.color+'40':'#e5e7eb'};">${b.icon} ${lbl} ${bp.done}/${bp.total}</span>`; }).join('')}
    </div>
  </div>` : ''}
  <div style="background:white;border-radius:12px;padding:1rem 1.1rem;margin-bottom:1.25rem;border:1px solid #e8eaed;">
    <div style="font-weight:700;font-size:.85rem;color:#111827;margin-bottom:.75rem;">${txt.whats}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;">
      ${OB_BLOCKS.map(b => { const bp = blockProgress(b.id); if(!bp) return ''; const done = bp.done===bp.total&&bp.done>0; const lbl = (typeof getOBBlockLabel==='function'?getOBBlockLabel(b.id):b.label); return `<div style="display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;border-radius:9px;background:${done?b.color+'0d':'#f8fafc'};border:1px solid ${done?b.color+'30':'#f1f5f9'};"><span style="font-size:.9rem;">${b.icon}</span><div style="flex:1;min-width:0;"><div style="font-size:.78rem;font-weight:600;color:${done?b.color:'#374151'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${lbl}</div><div style="font-size:.65rem;color:#9ca3af;">${bp.total} ${txt.stepsOf}</div></div>${done?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="'+b.color+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':''}</div>`; }).join('')}
    </div>
  </div>
  <div style="text-align:center;">
    <button onclick="obStartOnboarding()" style="display:inline-flex;align-items:center;gap:.65rem;padding:.9rem 2.25rem;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;border-radius:12px;cursor:pointer;font-size:.95rem;font-weight:800;box-shadow:0 8px 24px rgba(34,197,94,.4);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      ${alreadyStarted ? txt.resume : txt.start}
    </button>
    ${alreadyStarted ? `<div style="margin-top:.6rem;font-size:.75rem;color:#9ca3af;">${txt.or} <span onclick="obSelectStep(0)" style="color:#22c55e;cursor:pointer;font-weight:600;text-decoration:underline;">${txt.fromStart}</span></div>` : ''}
  </div>
</div>
</div>`;
}

// ─── MAIN RENDER ───────────────────────────────────────────
function renderOnboarding() {
    if (ob.activeStep < 0) { renderWelcome(); return; }
    const c = document.getElementById('onboardingTab');
    if (!c) return;
    const pct = totalProgress();
    const completedSteps = OB_STEPS.filter(s => stepComplete(s)).length;
    const step = (typeof getLocalizedStep === 'function') ? getLocalizedStep(OB_STEPS[ob.activeStep]) : OB_STEPS[ob.activeStep];
    const blockGroups = OB_BLOCKS.map(b => ({
        ...b,
        steps: OB_STEPS.map((s,i) => ({...s,_idx:i})).filter(s => s.block===b.id),
        progress: blockProgress(b.id)
    })).filter(bg => bg.steps.length > 0);

    const isMobile = window.innerWidth < 768;

    // ─── MOBILE: single-panel (list OR content) ───────────────
    if (isMobile) {
        // ob._mobilePanel: 'list' | 'content'  (default 'content')
        if (!ob._mobilePanel) ob._mobilePanel = 'content';

        if (ob._mobilePanel === 'list') {
            // ── LIST PANEL ──────────────────────────────────────
            c.innerHTML = `
<div style="display:flex;flex-direction:column;height:calc(100vh - 56px);background:#f8fafc;overflow:hidden;">
  <div style="background:white;border-bottom:1px solid #e8eaed;padding:.65rem .85rem;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;">
      <button onclick="ob.activeStep=-1;ob._mobilePanel='content';renderOnboarding();" style="display:flex;align-items:center;gap:4px;padding:.25rem .55rem;border:1px solid #e8eaed;border-radius:7px;background:white;cursor:pointer;font-size:.72rem;color:#6b7280;font-weight:600;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> ${(typeof getOBUI==='function'&&getOBUI('overview'))||'Огляд'}
      </button>
      <div style="flex:1;text-align:right;font-size:.68rem;color:#9ca3af;">${completedSteps}/${OB_STEPS.length} · ${pct}%</div>
      <button onclick="ob._mobilePanel='content';renderOnboarding();" style="padding:.25rem .7rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:.72rem;font-weight:700;">✕</button>
    </div>
    <div style="background:#f1f5f9;border-radius:999px;height:5px;">
      <div style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);width:${pct}%;border-radius:999px;transition:width .4s;"></div>
    </div>
  </div>
  <div style="flex:1;overflow-y:auto;padding:.4rem .5rem;">
    ${blockGroups.map(bg => {
      const bp = bg.progress;
      return `<div style="margin-bottom:.15rem;">
        <div style="display:flex;align-items:center;gap:.4rem;padding:.35rem .5rem;margin-bottom:1px;">
          <span style="font-size:.8rem;">${bg.icon}</span>
          <div style="flex:1;font-size:.68rem;font-weight:800;color:${bg.color};text-transform:uppercase;letter-spacing:.05em;">${(typeof getOBBlockLabel==='function'?getOBBlockLabel(bg.id):bg.label)}</div>
          <span style="font-size:.62rem;color:#9ca3af;">${bp?bp.done:0}/${bp?bp.total:0}</span>
        </div>
        ${bg.steps.map(s => {
          const done = stepComplete(s); const active = s._idx===ob.activeStep;
          return `<div onclick="ob.activeStep=${s._idx};ob._mobilePanel='content';renderOnboarding();obSave();" style="display:flex;align-items:center;gap:.45rem;padding:.5rem .55rem;border-radius:8px;cursor:pointer;margin-bottom:1px;background:${active?bg.color+'12':'transparent'};border:1px solid ${active?bg.color+'35':'transparent'};">
            <div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;background:${done?'#22c55e':active?bg.color+'20':'#f1f5f9'};display:flex;align-items:center;justify-content:center;">
              ${done?'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':`<span style="font-size:.6rem;font-weight:800;color:${active?bg.color:'#9ca3af'};">${s._idx+1}</span>`}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:.78rem;font-weight:${active?'700':'500'};color:${done?'#22c55e':active?'#111827':'#374151'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${(typeof getLocalizedStep==='function'?getLocalizedStep(s):s).title}</div>
              <div style="font-size:.62rem;color:#9ca3af;">${s.est} · ${stepDoneCount(s)}/${s.tasks.length}</div>
            </div>
            ${active?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${bg.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`:''}
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}
  </div>
</div>`;
            return;
        }

        // ── CONTENT PANEL (mobile) ──────────────────────────────
        c.innerHTML = `
<div style="display:flex;flex-direction:column;height:calc(100vh - 56px);background:#f8fafc;overflow:hidden;">
  <!-- mobile top bar -->
  <div style="background:white;border-bottom:1px solid #e8eaed;padding:.5rem .75rem;flex-shrink:0;display:flex;align-items:center;gap:.5rem;">
    <button onclick="ob._mobilePanel='list';renderOnboarding();" style="display:flex;align-items:center;gap:4px;padding:.3rem .6rem;border:1px solid #e8eaed;border-radius:7px;background:white;cursor:pointer;font-size:.72rem;color:#6b7280;font-weight:600;flex-shrink:0;">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      ${ob.activeStep+1}/${OB_STEPS.length}
    </button>
    <div style="flex:1;min-width:0;">
      <div style="font-size:.68rem;font-weight:700;color:${step.color};text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${step.subtitle}</div>
      <div style="font-size:.82rem;font-weight:800;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${step.title}</div>
    </div>
    <button onclick="obGoToTab('${step.action.tab}')" style="padding:.3rem .65rem;background:${step.color};color:white;border:none;border-radius:7px;cursor:pointer;font-size:.72rem;font-weight:700;flex-shrink:0;white-space:nowrap;">
      ${step.action.label}
    </button>
  </div>
  <!-- progress bar -->
  <div style="background:#f1f5f9;height:3px;flex-shrink:0;">
    <div style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);width:${pct}%;transition:width .4s;"></div>
  </div>
  <!-- scrollable content -->
  <div style="flex:1;overflow-y:auto;padding:.85rem .9rem;">
    <div style="background:white;border-radius:10px;padding:.8rem .95rem;border:1px solid #e8eaed;margin-bottom:.85rem;font-size:.83rem;color:#374151;line-height:1.65;">${step.description}</div>
    <div style="background:white;border-radius:10px;border:1px solid #e8eaed;margin-bottom:.85rem;overflow:hidden;">
      <div style="padding:.6rem .95rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
        <div style="font-weight:700;font-size:.82rem;color:#111827;">${(typeof getOBUI==='function'&&getOBUI('stepsLabel'))||'Кроки виконання'}</div>
        <div style="font-size:.7rem;color:#9ca3af;">${stepDoneCount(step)}/${step.tasks.length} ${(typeof getOBUI==='function'&&getOBUI('completed'))||'виконано'}</div>
      </div>
      ${step.tasks.map((task,ti) => {
        const checked = ob.progress[step.id]?.tasks?.[task.id]||false;
        return `<div style="padding:.75rem .95rem;border-bottom:${ti<step.tasks.length-1?'1px solid #f9fafb':'none'};">
          <div style="display:flex;align-items:flex-start;gap:.6rem;">
            <div onclick="obToggleTask('${step.id}','${task.id}')" style="width:20px;height:20px;border-radius:5px;flex-shrink:0;margin-top:1px;cursor:pointer;border:2px solid ${checked?step.color:'#d1d5db'};background:${checked?step.color:'white'};display:flex;align-items:center;justify-content:center;">
              ${checked?'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':''}
            </div>
            <div style="flex:1;">
              <div style="font-size:.84rem;font-weight:600;color:${checked?'#9ca3af':'#111827'};text-decoration:${checked?'line-through':'none'};margin-bottom:${task.detail?'.3rem':'0'};">${task.text}</div>
              ${task.detail?`<div style="font-size:.76rem;color:#6b7280;line-height:1.5;background:#f8fafc;border-radius:6px;padding:.35rem .6rem;border-left:3px solid ${step.color}40;">${task.detail}</div>`:''}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="background:${step.color}08;border:1px solid ${step.color}25;border-radius:9px;padding:.7rem .9rem;margin-bottom:1rem;font-size:.81rem;color:#374151;line-height:1.6;">${step.tip || ""}</div>
    <!-- nav buttons -->
    <div style="display:flex;gap:.5rem;justify-content:space-between;padding-bottom:.5rem;">
      <button onclick="obPrevStep()" ${ob.activeStep===0?'disabled':''} style="flex:1;padding:.6rem;background:white;color:#374151;border:1.5px solid #e8eaed;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:600;opacity:${ob.activeStep===0?'0.4':'1'};">← ${(typeof getOBUI==='function'&&getOBUI('prev'))||'Попередній'}</button>
      ${stepComplete(step)&&ob.activeStep<OB_STEPS.length-1
        ? `<button onclick="obNextStep()" style="flex:2;padding:.6rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:700;">${(typeof getOBUI==='function'&&getOBUI('next'))||'Наступний крок'} →</button>`
        : ob.activeStep<OB_STEPS.length-1
        ? `<button onclick="obNextStep()" style="flex:2;padding:.6rem;background:white;color:#9ca3af;border:1.5px solid #e8eaed;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:600;">${(typeof getOBUI==='function'&&getOBUI('skip'))||'Пропустити'} →</button>`
        : `<div onclick="ob.activeStep=-1;ob._mobilePanel='content';renderOnboarding();" style="flex:2;cursor:pointer;padding:.6rem;background:#f0fdf4;color:#22c55e;border:1.5px solid #bbf7d0;border-radius:8px;font-size:.82rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${(typeof getOBUI==='function'&&getOBUI('done'))||'Онбординг завершено!'}</div>`
      }
    </div>
  </div>
</div>`;
        return;
    }

    // ─── DESKTOP: two-panel layout ────────────────────────────
    c.innerHTML = `
<div style="display:flex;height:calc(100vh - 56px);background:#f8fafc;overflow:hidden;">
  <!-- LEFT -->
  <div style="width:280px;flex-shrink:0;background:white;border-right:1px solid #e8eaed;display:flex;flex-direction:column;overflow:hidden;">
    <div style="padding:.75rem .85rem;border-bottom:1px solid #f1f5f9;">
      <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.65rem;">
        <button onclick="ob.activeStep=-1;renderOnboarding();" style="display:flex;align-items:center;gap:4px;padding:.25rem .55rem;border:1px solid #e8eaed;border-radius:7px;background:white;cursor:pointer;font-size:.72rem;color:#6b7280;font-weight:600;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> ${(typeof getOBUI==='function'&&getOBUI('overview'))||'Огляд'}
        </button>
        <div style="flex:1;text-align:right;font-size:.68rem;color:#9ca3af;">${completedSteps}/${OB_STEPS.length} · ${pct}%</div>
      </div>
      <div style="background:#f1f5f9;border-radius:999px;height:5px;">
        <div style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);width:${pct}%;border-radius:999px;transition:width .4s;"></div>
      </div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:.4rem;">
      ${blockGroups.map(bg => {
        const bp = bg.progress;
        return `<div style="margin-bottom:.2rem;">
          <div style="display:flex;align-items:center;gap:.4rem;padding:.4rem .6rem;margin-bottom:1px;">
            <span style="font-size:.8rem;">${bg.icon}</span>
            <div style="flex:1;font-size:.68rem;font-weight:800;color:${bg.color};text-transform:uppercase;letter-spacing:.05em;">${(typeof getOBBlockLabel==='function'?getOBBlockLabel(bg.id):bg.label)}</div>
            <div style="display:flex;align-items:center;gap:3px;">
              <div style="width:36px;background:#f1f5f9;border-radius:999px;height:3px;"><div style="height:100%;background:${bg.color};width:${bp?bp.pct:0}%;border-radius:999px;"></div></div>
              <span style="font-size:.62rem;color:#9ca3af;">${bp?bp.done:0}/${bp?bp.total:0}</span>
            </div>
          </div>
          ${bg.steps.map(s => {
            const done = stepComplete(s); const active = s._idx===ob.activeStep;
            return `<div onclick="obSelectStep(${s._idx})" style="display:flex;align-items:center;gap:.5rem;padding:.45rem .6rem;border-radius:8px;cursor:pointer;margin-bottom:1px;background:${active?bg.color+'12':'transparent'};border:1px solid ${active?bg.color+'35':'transparent'};">
              <div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;background:${done?'#22c55e':active?bg.color+'20':'#f1f5f9'};display:flex;align-items:center;justify-content:center;">
                ${done?'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':`<span style="font-size:.6rem;font-weight:800;color:${active?bg.color:'#9ca3af'};">${s._idx+1}</span>`}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:.76rem;font-weight:${active?'700':'500'};color:${done?'#22c55e':active?'#111827':'#374151'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${(typeof getLocalizedStep==='function'?getLocalizedStep(s):s).title}</div>
                <div style="font-size:.62rem;color:#9ca3af;">${s.est} · ${stepDoneCount(s)}/${s.tasks.length}</div>
              </div>
            </div>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>
  </div>
  <!-- RIGHT -->
  <div style="flex:1;overflow-y:auto;padding:1.5rem 2rem;">
    <div style="width:100%;">
      <div style="display:flex;align-items:flex-start;gap:.85rem;margin-bottom:1.25rem;">
        <div style="width:50px;height:50px;border-radius:13px;flex-shrink:0;background:${step.color}18;display:flex;align-items:center;justify-content:center;color:${step.color};">${step.icon}</div>
        <div style="flex:1;">
          <div style="font-size:.7rem;font-weight:700;color:${step.color};text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">${step.subtitle}</div>
          <div style="font-size:1.2rem;font-weight:800;color:#111827;line-height:1.3;">${step.title}</div>
          <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${(typeof getOBUI==='function'&&getOBUI('estLabel'))||'Орієнтовний час:'} <b>${step.est}</b></div>
        </div>
        <button onclick="obGoToTab('${step.action.tab}')" style="padding:.45rem .9rem;background:${step.color};color:white;border:none;border-radius:8px;cursor:pointer;font-size:.78rem;font-weight:700;display:flex;align-items:center;gap:5px;flex-shrink:0;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          ${step.action.label}
        </button>
      </div>
      <div style="background:white;border-radius:11px;padding:.9rem 1.1rem;border:1px solid #e8eaed;margin-bottom:1rem;font-size:.84rem;color:#374151;line-height:1.65;">${step.description}</div>
      <div style="background:white;border-radius:11px;border:1px solid #e8eaed;margin-bottom:1rem;overflow:hidden;">
        <div style="padding:.65rem 1.1rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-weight:700;font-size:.83rem;color:#111827;">${(typeof getOBUI==='function'&&getOBUI('stepsLabel'))||'Кроки виконання'}</div>
          <div style="display:flex;align-items:center;gap:.6rem;">
            <div style="font-size:.7rem;color:#9ca3af;">${stepDoneCount(step)}/${step.tasks.length} ${(typeof getOBUI==='function'&&getOBUI('completed'))||'виконано'}</div>
            <div style="width:54px;background:#f1f5f9;border-radius:999px;height:4px;"><div style="height:100%;background:${step.color};border-radius:999px;width:${step.tasks.length>0?Math.round(stepDoneCount(step)/step.tasks.length*100):0}%;"></div></div>
          </div>
        </div>
        ${step.tasks.map((task,ti) => {
          const checked = ob.progress[step.id]?.tasks?.[task.id]||false;
          return `<div style="padding:.8rem 1.1rem;border-bottom:${ti<step.tasks.length-1?'1px solid #f9fafb':'none'};">
            <div style="display:flex;align-items:flex-start;gap:.65rem;">
              <div onclick="obToggleTask('${step.id}','${task.id}')" style="width:19px;height:19px;border-radius:5px;flex-shrink:0;margin-top:1px;cursor:pointer;border:2px solid ${checked?step.color:'#d1d5db'};background:${checked?step.color:'white'};display:flex;align-items:center;justify-content:center;">
                ${checked?'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':''}
              </div>
              <div style="flex:1;">
                <div style="font-size:.83rem;font-weight:600;color:${checked?'#9ca3af':'#111827'};text-decoration:${checked?'line-through':'none'};margin-bottom:${task.detail?'.3rem':'0'};">${task.text}</div>
                ${task.detail?`<div style="font-size:.75rem;color:#6b7280;line-height:1.55;background:#f8fafc;border-radius:6px;padding:.4rem .65rem;border-left:3px solid ${step.color}40;">${task.detail}</div>`:''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div style="background:${step.color}08;border:1px solid ${step.color}25;border-radius:9px;padding:.75rem 1rem;margin-bottom:1.25rem;font-size:.81rem;color:#374151;line-height:1.6;">${step.tip || ""}</div>
      <div style="display:flex;gap:.65rem;justify-content:space-between;">
        <button onclick="obPrevStep()" ${ob.activeStep===0?'disabled':''} style="padding:.55rem 1.1rem;background:white;color:#374151;border:1.5px solid #e8eaed;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:600;opacity:${ob.activeStep===0?'0.4':'1'};">← ${(typeof getOBUI==='function'&&getOBUI('prev'))||'Попередній'}</button>
        ${stepComplete(step)&&ob.activeStep<OB_STEPS.length-1
          ? `<button onclick="obNextStep()" style="padding:.55rem 1.35rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:700;">${(typeof getOBUI==='function'&&getOBUI('next'))||'Наступний крок'} →</button>`
          : ob.activeStep<OB_STEPS.length-1
          ? `<button onclick="obNextStep()" style="padding:.55rem 1.35rem;background:white;color:#9ca3af;border:1.5px solid #e8eaed;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:600;">${(typeof getOBUI==='function'&&getOBUI('skip'))||'Пропустити'} →</button>`
          : `<div onclick="ob.activeStep=-1;renderOnboarding();" style="cursor:pointer;padding:.55rem 1.1rem;background:#f0fdf4;color:#22c55e;border:1.5px solid #bbf7d0;border-radius:8px;font-size:.8rem;font-weight:700;display:flex;align-items:center;gap:5px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${(typeof getOBUI==='function'&&getOBUI('done'))||'Онбординг завершено!'}</div>`
        }
      </div>
    </div>
  </div>
</div>`;
}

// ─── ACTIONS ───────────────────────────────────────────────
window.obStartOnboarding = function() {
    let first = OB_STEPS.findIndex(s => !stepComplete(s));
    ob.activeStep = first >= 0 ? first : 0;
    renderOnboarding();
};
window.obSelectStep = function(i) { ob.activeStep=i; renderOnboarding(); obSave(); };
window.obToggleTask = async function(stepId, taskId) {
    if (!ob.progress[stepId]) ob.progress[stepId] = { tasks:{} };
    if (!ob.progress[stepId].tasks) ob.progress[stepId].tasks = {};
    ob.progress[stepId].tasks[taskId] = !ob.progress[stepId].tasks[taskId];
    const step = OB_STEPS.find(s => s.id===stepId);
    if (step && stepComplete(step) && window.showToast) { const _doneMsg = (getOBUI('complete')||'Виконано') + ': ' + step.title; showToast('✓ ' + _doneMsg, 'success'); }
    renderOnboarding();
    await obSave();
};
window.obNextStep = function() { if(ob.activeStep<OB_STEPS.length-1){ob.activeStep++;renderOnboarding();obSave();} };
window.obPrevStep = function() { if(ob.activeStep>0){ob.activeStep--;renderOnboarding();obSave();} };
window.obGoToTab = function(tab) {
    if(typeof switchTab==='function') switchTab(tab);
    if(tab==='coordination'&&window._initCoordTab) setTimeout(window._initCoordTab,100);
    if(tab==='learning') { window.loadLearningModules && window.loadLearningModules(function(){}); }
};

// ─── INIT ──────────────────────────────────────────────────
async function initOnboarding() { await obLoad(); renderOnboarding(); }
window.initOnboarding = initOnboarding;

if (window.onSwitchTab) {
    window.onSwitchTab('onboarding', initOnboarding);
} else {
    let t=0,iv=setInterval(()=>{ if(window.onSwitchTab){window.onSwitchTab('onboarding',initOnboarding);clearInterval(iv);}else if(++t>30)clearInterval(iv); },100);
}

})();
