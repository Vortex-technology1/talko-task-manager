'use strict';
// ─── ONBOARDING i18n ───────────────────────────────────────
// OB_I18N[lang][stepId] = { title, subtitle, est, tipText, actionLabel, tasks:[{text,detail}] }
// UA — базова мова в OB_STEPS (хардкод). Решта — тут.
// Мови: en, ru, pl, de, cs

window.OB_I18N = {

// ──────────────────────────────────────────────────────────
// ENGLISH
// ──────────────────────────────────────────────────────────
en: {
  // Блоки (назви в сайдбарі і welcome)
  _blocks: {
    start: 'Start', tasks: 'Tasks', myday: 'My Day',
    system: 'System', projects: 'Projects', coordination: 'Coordination',
    analytics: 'Analytics', finance: 'Finance', business: 'Business', learning: 'Learning',
  },
  // UI рядки онбордингу
  _ui: {
    skip: 'Skip →', prev: '← Previous', done: 'Onboarding complete!',
    askAI: 'Ask AI Assistant', stepsOf: 'steps',
    minUnit: 'min', overview: 'Overview',
    completed: 'completed', complete: 'Complete',
  },

  // ── БЛОК 0 — START ────────────────────────────────────────
  setup_company: {
    title: 'Company Setup',
    subtitle: 'Block 0 · Start', est: '5 min',
    actionLabel: 'Open settings',
    tipText: 'Company setup takes 5 minutes once. Without the correct timezone all reminders will be shifted.',
    tasks: [
      { text: 'Open System → Employees → "Company" tab', detail: 'This tab is visible to the Owner only.' },
      { text: 'Enter company name and save', detail: 'The name appears in invitations, reports, and the system header.' },
      { text: 'Check timezone — set the correct one', detail: 'Default is Kyiv (UTC+2/+3). Change if your team is in another timezone.' },
      { text: 'Enable weekly report for the owner', detail: 'Every Monday you receive a task completion summary automatically.' },
    ],
  },
  setup_telegram: {
    title: 'Connect Telegram',
    subtitle: 'Block 0 · Start', est: '5 min',
    actionLabel: 'Open profile',
    tipText: 'Telegram is not a bonus — it is mandatory. Anyone who hasn\'t connected is outside the system.',
    tasks: [
      { text: 'Open profile → find the "Telegram Notifications" section', detail: 'Click your name or avatar in the top right.' },
      { text: 'Click "Connect Telegram" and complete the process', detail: 'The TALKO bot will open. Press /start → system confirms connection.' },
      { text: 'Verify — send yourself a test task', detail: 'Assign a task to yourself → a notification should arrive in 10–20 seconds.' },
      { text: 'Ask each employee to connect Telegram after registration', detail: 'Without this, notifications don\'t work. Make it a mandatory onboarding condition.' },
    ],
  },
  setup_invite: {
    title: 'Invite Your Team',
    subtitle: 'Block 0 · Start', est: '10 min',
    actionLabel: 'Open employees',
    tipText: 'Mistake: inviting everyone at once. Better to start with 3–5 key people → establish the process → then add the rest.',
    tasks: [
      { text: 'Compile a list of employees to invite', detail: 'Start with 3–5 key people. Not everyone at once.' },
      { text: 'Invite the first employee via System → Employees', detail: '"Invite" button → email → role → send. The person receives an email within a minute.' },
      { text: 'Confirm the invitee has registered and appears in the list', detail: 'Refresh the list. The new team member should appear with status "Active".' },
      { text: 'Assign the new employee their first test task', detail: 'This reinforces the habit and shows the system is live.' },
    ],
  },

  // ── БЛОК 1 — TASKS ────────────────────────────────────────
  tasks_views: {
    title: 'Tasks: Views and Filters',
    subtitle: 'Block 1 · Tasks', est: '10 min',
    actionLabel: 'Open tasks',
    tipText: 'Kanban view is ideal for weekly team reviews. You can see where things are stuck and why.',
    tasks: [
      { text: 'Open "All Tasks" and switch through all 6 views', detail: 'Each view serves a different management purpose. Kanban and List — for daily work.' },
      { text: 'Apply a filter: select a specific assignee', detail: 'Filter panel is above the task list. Select a name — see only their tasks instantly.' },
      { text: 'Apply the "Overdue" status filter', detail: 'Critical filter for managers. Immediately see what\'s burning and whose it is.' },
      { text: 'Find a task using global search', detail: 'Search bar at the top. Searches by title, comments, names. Instant results.' },
    ],
  },
  tasks_anatomy: {
    title: 'Tasks: Anatomy and Proper Setup',
    subtitle: 'Block 1 · Tasks', est: '15 min',
    actionLabel: 'Open tasks',
    tipText: 'Rule: if the assignee can complete the task without a single additional question — it\'s set up correctly.',
    tasks: [
      { text: 'Create a test task filling in all fields completely', detail: 'Title, assignee, deadline, priority, expected result, report format.' },
      { text: 'Add a checklist with 3 sub-items to the task', detail: 'Inside the task — "Checklist" section → "Add item".' },
      { text: 'Set a reminder for tomorrow at 9:00', detail: 'The assignee receives a Telegram notification at the specified time.' },
      { text: 'Enable "Review after completion"', detail: 'After marking done — status becomes "Under review". The reviewer gets a signal.' },
      { text: 'Write a comment and attach a file', detail: 'All correspondence stays inside the task forever.' },
    ],
  },
  regular_tasks: {
    title: 'Recurring Tasks: Automating Routine',
    subtitle: 'Block 1 · Tasks', est: '10 min',
    actionLabel: 'Open recurring',
    tipText: 'Golden rule: any task you set more than twice — automate it.',
    tasks: [
      { text: 'Open the "Recurring Tasks" tab', detail: 'Tasks → "Recurring" or via "All Tasks" menu.' },
      { text: 'Identify 3 tasks you set manually every week', detail: 'For example: report, planning meeting, metrics review.' },
      { text: 'Create a weekly recurring task with a reminder', detail: '"+ Recurring" → assignee, day of week, reminder time, expected result.' },
      { text: 'Verify the task appeared automatically for the assignee', detail: 'Filter by assignee → the recurring task is already there with a deadline.' },
    ],
  },

  // ── БЛОК 2 — MY DAY ───────────────────────────────────────
  myday: {
    title: 'My Day: Focus and Planning',
    subtitle: 'Block 2 · My Day', est: '5 min',
    actionLabel: 'Open My Day',
    tipText: 'Ask the team to start each day with "My Day". 5 minutes in the morning — everyone knows their plan.',
    tasks: [
      { text: 'Open "My Day" and review today\'s tasks', detail: 'If there are no tasks — create a test one with today\'s deadline.' },
      { text: 'Switch to "Focus" mode and complete one task', detail: '"Focus" button at the top of the tab. Click "Done" — system moves to the next.' },
    ],
  },

  // ── БЛОК 3 — SYSTEM ───────────────────────────────────────
  functions: {
    title: 'Functions: Departments and Business KPIs',
    subtitle: 'Block 3 · System', est: '15 min',
    actionLabel: 'Open functions',
    tipText: 'Minimum: 3–5 functions with KPIs. This is the analytics foundation. Without functions the department report is empty.',
    tasks: [
      { text: 'Open System → Functions', detail: 'Without functions the department analytics don\'t work.' },
      { text: 'Create at least 3 key business functions', detail: '"+ Function" → department name → assign responsible. Start with: Sales, Operations, Finance.' },
      { text: 'Add at least 1 KPI with a specific number to each function', detail: 'Inside the function → "KPI" section → "+ Add KPI". Example: New deals — 20 — pcs/month.' },
      { text: 'Switch to "Structure" view and review the chart', detail: '"Structure" button at the top. Shows department hierarchy and connections.' },
      { text: 'Link existing tasks to their respective functions', detail: 'Open any task → "Function" field → select department.' },
    ],
  },
  bizstructure: {
    title: 'Structure: Organizational Chart',
    subtitle: 'Block 3 · System', est: '10 min',
    actionLabel: 'Open structure',
    tipText: 'Structure is the first thing to show a new manager. They immediately understand where they are, who\'s nearby, who\'s above. Saves 2–3 weeks of onboarding.',
    tasks: [
      { text: 'Open System → Structure', detail: 'Shows the org chart. If empty — fill in Functions first (previous step).' },
      { text: 'Verify all departments and sub-departments display correctly', detail: 'Compare with your real business structure.' },
      { text: 'Click on any employee card and review the details', detail: 'See: role, department, active tasks, workload. Can navigate directly to their tasks.' },
      { text: 'Verify each employee is linked to their department', detail: 'If someone is "without department" — open their card → change function/department.' },
    ],
  },
  team_management: {
    title: 'Employees: Roles, Access and Invitations',
    subtitle: 'Block 3 · System', est: '15 min',
    actionLabel: 'Open employees',
    tipText: 'Mistake #1: giving everyone Owner access. Then wondering why a regular employee sees salaries. Set roles correctly once.',
    tasks: [
      { text: 'Open System → Employees → "List" tab', detail: 'Review all active employees. Each card shows role, department, task count.' },
      { text: 'Verify each person\'s role matches their actual responsibilities', detail: 'Click employee → "Change role". Rule: minimum necessary access. Manager doesn\'t need Owner.' },
      { text: 'Go to "Roles" tab and study the access matrix', detail: 'Table showing who sees what. Owner — everything. Manager — their dept + analytics. Employee — only their own tasks.' },
      { text: 'Invite a new employee via the "Invite" tab', detail: 'Email → role → function → "Send". Person receives an email. After registration — appears in the list.' },
      { text: 'Open the "Company" tab and review settings (Owner only)', detail: 'Company name, timezone, weekly report. If timezone is wrong — all reminders are shifted.' },
    ],
  },
  system_integrations: {
    title: 'Integrations: Connecting External Services',
    subtitle: 'Block 3 · System', est: '15 min',
    actionLabel: 'Open integrations',
    tipText: 'Telephony is the biggest loss point for businesses with incoming calls. Without integration: missed call = lost client. With integration: missed call → auto-task → callback in 5 minutes.',
    tasks: [
      { text: 'Open Business → Integrations and review all available', detail: 'You\'ll see a list of services with "Connected" or "Not connected" status.' },
      { text: 'Verify Telegram is connected in your profile', detail: 'Click your name top right → "Telegram Notifications" → should show "Connected".' },
      { text: 'Connect Google Calendar or review the connection guide', detail: 'Integrations → Google Calendar → "Connect" → Google authorization. Deadlines sync automatically.' },
      { text: 'If using Binotel, Ringostat or Stream — connect telephony', detail: 'Integrations → select provider → API key → save. Test call → verify task was created.' },
      { text: 'Ask each employee to connect Telegram after registration', detail: 'Without this notifications don\'t come. Make it mandatory in employee onboarding.' },
    ],
  },

  // ── БЛОК 4 — PROJECTS ─────────────────────────────────────
  projects: {
    title: 'Projects: Complex Tasks with Timeline',
    subtitle: 'Block 4 · Projects & Processes', est: '10 min',
    actionLabel: 'Open projects',
    tipText: 'Timeline view immediately shows the bottleneck and who is blocking the rest of the team.',
    tasks: [
      { text: 'Open "Projects" tab and review existing ones', detail: 'If none — create a test one. Name + deadline + a few tasks.' },
      { text: 'Switch views: Cards → List → Timeline', detail: 'Timeline is the most informative view for control.' },
      { text: 'Add a few tasks and verify the progress', detail: 'Add 3–4 tasks → check the timeline.' },
    ],
  },
  processes: {
    title: 'Processes: Templates for Recurring Situations',
    subtitle: 'Block 4 · Projects & Processes', est: '15 min',
    actionLabel: 'Open processes',
    tipText: '1 configured process = hundreds of hours saved per year.',
    tasks: [
      { text: 'Open "Processes" tab and review the logic', detail: 'Find demo templates. Note: template → launch → active process.' },
      { text: 'Identify 1 recurring process in your business', detail: 'What do you do the same way several times a month? That\'s a candidate.' },
      { text: 'Create a process template with 3–4 steps', detail: 'Processes → "New template" → add steps. Each: who + how many days + result.' },
      { text: 'Launch the process and verify tasks were created', detail: 'Go to "All Tasks" — tasks are already there with assignees and deadlines.' },
    ],
  },

  // ── БЛОК 5 — COORDINATION ─────────────────────────────────
  coordination_types: {
    title: 'Coordinations: Types and When to Use',
    subtitle: 'Block 5 · Coordination', est: '10 min',
    actionLabel: 'Open coordination',
    tipText: 'Weekly planning meeting — the basic business rhythm. Without it the team falls apart into isolated islands.',
    tasks: [
      { text: 'Open "Coordination" tab and review all 8 types', detail: 'Each type has its own agenda template and duration.' },
      { text: 'Determine which types your business needs', detail: 'Minimum: Weekly + Monthly. For executives — Executive Board.' },
      { text: 'Set up a regular weekly coordination', detail: '"New coordination" → type → day → time → participants.' },
    ],
  },
  coordination_process: {
    title: 'Coordinations: How to Run and Record Results',
    subtitle: 'Block 5 · Coordination', est: '15 min',
    actionLabel: 'Open coordination',
    tipText: 'Rule: every meeting ends with a protocol containing tasks.',
    tasks: [
      { text: 'Create a "Weekly" coordination and add participants', detail: '"New coordination" → type → name → participants.' },
      { text: 'Launch the coordination and complete the agenda', detail: '"Start" → agenda → record at least 1 decision.' },
      { text: 'Record a decision and assign an executor with deadline', detail: '"+ Add decision" → text → assignee → deadline. Immediately becomes a task.' },
      { text: 'Complete the coordination and verify tasks appeared', detail: 'Go to "All Tasks" — all decisions are already there.' },
      { text: 'Open the automatically generated protocol', detail: 'In archive → completed coordination → "Protocol" button. Ready PDF.' },
    ],
  },
  control: {
    title: 'Control: Business Pulse in 5 Minutes Daily',
    subtitle: 'Block 5 · Control', est: '15 min',
    actionLabel: 'Open control',
    tipText: 'Morning ritual: 5 minutes in "Critical Attention" — business status without a single meeting.',
    tasks: [
      { text: 'Open "Control" → click "Critical Attention"', detail: 'This is your morning ritual. 2 minutes — you know where the fire is.' },
      { text: 'Review "Workload" — see the team distribution', detail: 'Who has 15 tasks vs who has 2? Imbalance signals poor delegation.' },
      { text: 'Open "Delegation Funnel" and understand the logic', detail: 'If most tasks are at step 1 — assignees aren\'t picking them up.' },
      { text: 'Add the first entry to "Management Issue Log"', detail: 'Fact → cause → solution. After 3 months you see systemic patterns.' },
    ],
  },

  // ── БЛОК 6 — ANALYTICS ────────────────────────────────────
  analytics: {
    title: 'Efficiency & Statistics: Numbers Instead of Feelings',
    subtitle: 'Block 6 · Analytics', est: '10 min',
    actionLabel: 'Open analytics',
    tipText: 'If a metric isn\'t measured — it can\'t be managed. 3 numbers daily — minimum.',
    tasks: [
      { text: 'Open "Efficiency" — review task statistics', detail: 'Who completes on time vs who keeps postponing. Objective data, no emotions.' },
      { text: 'Open "Statistics" and add 3 key business metrics', detail: 'Examples: "Daily Revenue", "New Clients", "Orders Completed".' },
      { text: 'Switch metrics between Day / Week / Month', detail: 'Month shows trend, day shows current pulse.' },
    ],
  },

  // ── БЛОК 7 — FINANCE ──────────────────────────────────────
  finance_dashboard: {
    title: 'Finance: Dashboard and Big Picture',
    subtitle: 'Block 7 · Finance', est: '10 min',
    actionLabel: 'Open finance',
    tipText: 'Finance without data — a beautiful but empty dashboard. Start entering transactions today.',
    tasks: [
      { text: 'Open Business → Finance and review the dashboard', detail: 'Select the current month.' },
      { text: 'Review all sub-tabs: Income, Expenses, Accounts, Planning', detail: 'Go through each — understand the logic before entering data.' },
      { text: 'Set up accounts (cash, bank, card)', detail: 'Finance → Settings → Accounts. Add at least 2: cash and current account.' },
    ],
  },
  finance_transactions: {
    title: 'Finance: Income, Expenses and Categories',
    subtitle: 'Block 7 · Finance', est: '15 min',
    actionLabel: 'Open finance',
    tipText: 'Standard: enter transactions daily or at least every 2–3 days.',
    tasks: [
      { text: 'Enter 3 test income items in different categories', detail: 'Finance → Income → "+ Income". Category, amount, account, date.' },
      { text: 'Enter 3 test expenses in different categories', detail: 'Link to a function — then department analytics work.' },
      { text: 'Set up a recurring transaction (e.g. rent)', detail: 'Finance → Recurring → "+ Recurring" → monthly, amount, category.' },
      { text: 'Check the dashboard after entering data', detail: 'Now charts and top expenses are filled with real data.' },
    ],
  },
  finance_planning: {
    title: 'Finance: Budgeting, Invoices and P&L',
    subtitle: 'Block 7 · Finance', est: '15 min',
    actionLabel: 'Open finance',
    tipText: 'P&L — the first document in a conversation with an investor or bank. Now generated automatically.',
    tasks: [
      { text: 'Open Finance → Planning and enter the monthly income plan', detail: 'Expected income by category.' },
      { text: 'Enter expense plan by categories', detail: 'Salary, rent, marketing, materials — break it down.' },
      { text: 'Create a test invoice for a client and check statuses', detail: 'Finance → Invoices → "+ Invoice". Items → deadline → mark "Paid".' },
      { text: 'Review the P&L report for the current month', detail: 'If there are transactions — P&L fills automatically.' },
    ],
  },

  // ── БЛОК 8 — BUSINESS ─────────────────────────────────────
  crm: {
    title: 'CRM: Clients, Deals, Sales',
    subtitle: 'Block 8 · Business', est: '15 min',
    actionLabel: 'Open CRM',
    tipText: 'Main CRM rule: every client interaction gets recorded. In 6 months this log becomes your most valuable asset.',
    tasks: [
      { text: 'Open CRM and review the deal kanban', detail: 'Customize stage names for your business: CRM → Settings → Pipelines.' },
      { text: 'Create a test deal and drag it between stages', detail: '"+ Deal". Name, amount, client, stage. Try drag & drop.' },
      { text: 'Add a client and link them to a deal', detail: 'CRM → Clients → "+ Client".' },
      { text: 'From the deal, create a "Call back" task with a deadline', detail: 'Open deal → "Task". Appears in the system.' },
    ],
  },
  bots_sites: {
    title: 'Marketing, Bots and My Sites',
    subtitle: 'Block 8 · Business', est: '10 min',
    actionLabel: 'Open bots',
    tipText: 'Even a simple bot that responds and passes the contact to CRM is better than nothing.',
    tasks: [
      { text: 'Open "Bots" and see how to connect a Telegram bot', detail: 'Bots → "+ New bot" → token from @BotFather → welcome message.' },
      { text: 'Browse the message sequence builder', detail: 'In the bot → "Flows" → "+ New flow". Drag & drop: Message, Question, Condition.' },
      { text: 'Open "My Sites" and review the builder', detail: 'Sites → "+ New site". Template → edit → publish. Form → goes to CRM.' },
    ],
  },

  // ── БЛОК 9 — LEARNING ─────────────────────────────────────
  learning_start: {
    title: 'Learning: Program Roadmap and First Modules',
    subtitle: 'Block 9 · Learning', est: '20 min',
    actionLabel: 'Open learning',
    tipText: 'Learning and implementation — in parallel. Complete a module → immediately configure in the system → it sticks.',
    tasks: [
      { text: 'Open the "Learning" tab in the main menu (between Analytics and System)', detail: 'New button in the desktop menu. On mobile — in the bottom menu.' },
      { text: 'View Module 0 "Program Roadmap"', detail: 'This is the map of the entire journey. After viewing, the sequence becomes clear.' },
      { text: 'View Module 4 "Task Delegation System"', detail: 'After this module, delegation quality improves immediately.' },
      { text: 'Plan to complete remaining modules — 1 per week', detail: 'Don\'t try to do everything at once. 1 module per week = understood and implemented.' },
    ],
  },
  learning_ai: {
    title: 'AI Assistant and Integrations',
    subtitle: 'Block 9 · Learning', est: '5 min',
    actionLabel: 'Open integrations',
    tipText: 'AI Assistant 24/7 — first point of help. Before contacting the developer — ask the assistant.',
    tasks: [
      { text: 'Click the green button and ask a question about the platform', detail: 'For example: "How to set up a recurring task?"' },
      { text: 'Open "Integrations" and review available connections', detail: 'Google Calendar, Telegram, Webhook.' },
      { text: 'Connect Google Calendar or confirm Telegram is connected', detail: 'Select integration → follow the instructions. 3–5 minutes.' },
    ],
  },
}, // end en

// ══════════════════════════════════════════════════════════
// RUSSIAN
// ══════════════════════════════════════════════════════════
ru: {
  _blocks: {
    start: 'Старт', tasks: 'Задачи', myday: 'Мой день',
    system: 'Система', projects: 'Проекты', coordination: 'Координации',
    analytics: 'Аналитика', finance: 'Финансы', business: 'Бизнес', learning: 'Обучение',
  },
  _ui: {
    skip: 'Пропустить →', prev: '← Назад', done: 'Онбординг завершён!',
    askAI: 'Спросить AI-ассистента', stepsOf: 'шагов',
    minUnit: 'мин', overview: 'Обзор',
    completed: 'выполнено', complete: 'Завершить',
  },
  setup_company: {
    title: 'Настройка компании',
    subtitle: 'Блок 0 · Старт', est: '5 мин',
    actionLabel: 'Открыть настройки',
    tipText: 'Настройка компании — 5 минут один раз. Без правильного часового пояса все напоминания будут смещены.',
    tasks: [
      { text: 'Открыть Система → Сотрудники → вкладка «Компания»', detail: 'Вкладка видима только для владельца (Owner).' },
      { text: 'Ввести название компании и сохранить', detail: 'Название отображается в приглашениях и заголовке системы.' },
      { text: 'Проверить часовой пояс — установить правильный', detail: 'По умолчанию Киев (UTC+2/+3). Если команда в другом поясе — изменить.' },
      { text: 'Включить еженедельный отчёт владельцу', detail: 'Каждый понедельник получаете сводку по выполнению задач.' },
    ],
  },
  setup_telegram: {
    title: 'Подключение Telegram',
    subtitle: 'Блок 0 · Старт', est: '5 мин',
    actionLabel: 'Открыть профиль',
    tipText: 'Telegram — не бонус, это обязанность. Кто не подключил — они вне системы.',
    tasks: [
      { text: 'Открыть профиль → найти раздел «Telegram уведомления»', detail: 'Кликните на своё имя или аватар вверху справа.' },
      { text: 'Нажать «Подключить Telegram» и пройти процесс', detail: 'Откроется бот TALKO. Нажмите /start → система подтвердит подключение.' },
      { text: 'Проверить — отправить тестовую задачу себе', detail: 'Задача где вы исполнитель → через 10–20 секунд должно прийти уведомление.' },
      { text: 'Попросить каждого сотрудника подключить Telegram после регистрации', detail: 'Без этого уведомления не работают. Сделайте обязательным условием.' },
    ],
  },
  setup_invite: {
    title: 'Приглашение команды',
    subtitle: 'Блок 0 · Старт', est: '10 мин',
    actionLabel: 'Открыть сотрудников',
    tipText: 'Ошибка: приглашать всех сразу. Лучше 3–5 ключевых → наладить процесс → остальные.',
    tasks: [
      { text: 'Составить список сотрудников для приглашения', detail: 'Начинайте с 3–5 ключевых людей. Не всех сразу.' },
      { text: 'Пригласить первого сотрудника через Система → Сотрудники', detail: 'Кнопка «Пригласить» → email → роль → отправить. Письмо придёт за минуту.' },
      { text: 'Убедиться что приглашённый зарегистрировался и появился в списке', detail: 'Обновите список. Новый член команды должен появиться со статусом «Активный».' },
      { text: 'Назначить новому сотруднику первую тестовую задачу', detail: 'Это закрепит навык и покажет что система живёт.' },
    ],
  },
  tasks_views: {
    title: 'Задачи: виды отображения и фильтры',
    subtitle: 'Блок 1 · Задачи', est: '10 мин',
    actionLabel: 'Открыть задачи',
    tipText: 'Канбан-вид — идеален для еженедельного обзора с командой. Видно где затор и почему.',
    tasks: [
      { text: 'Открыть «Все задачи» и переключить все 6 видов', detail: 'Каждый вид — для разной задачи управления. Канбан и Список — для ежедневной работы.' },
      { text: 'Применить фильтр: выбрать конкретного исполнителя', detail: 'Панель фильтров над списком задач. Выберите имя — сразу видите только их задачи.' },
      { text: 'Применить фильтр по статусу «Просрочено»', detail: 'Критический фильтр для руководителя. Сразу видно что «горит» и у кого.' },
      { text: 'Найти задачу через глобальный поиск', detail: 'Строка поиска вверху. Ищет по названию, комментариях, именах. Мгновенно.' },
    ],
  },
  tasks_anatomy: {
    title: 'Задачи: анатомия и правильная постановка',
    subtitle: 'Блок 1 · Задачи', est: '15 мин',
    actionLabel: 'Открыть задачи',
    tipText: 'Правило: если исполнитель может выполнить задачу без единого дополнительного вопроса — поставлено правильно.',
    tasks: [
      { text: 'Создать тестовую задачу заполнив все поля', detail: 'Название, исполнитель, дедлайн, приоритет, ожидаемый результат, формат отчёта.' },
      { text: 'Добавить чеклист с 3 подпунктами', detail: 'Внутри задачи — раздел «Чеклист» → «Добавить пункт».' },
      { text: 'Поставить напоминание на завтра в 9:00', detail: 'Исполнитель получит уведомление в Telegram в указанное время.' },
      { text: 'Включить «Проверку после выполнения»', detail: 'После отметки done — статус «На проверке». Контролёр получает сигнал.' },
      { text: 'Написать комментарий и прикрепить файл', detail: 'Вся переписка остаётся внутри задачи навсегда.' },
    ],
  },
  regular_tasks: {
    title: 'Регулярные задачи: автоматизация рутины',
    subtitle: 'Блок 1 · Задачи', est: '10 мин',
    actionLabel: 'Открыть регулярные',
    tipText: 'Золотое правило: любую задачу которую ставите больше 2 раз — автоматизируйте.',
    tasks: [
      { text: 'Открыть вкладку «Регулярные задачи»', detail: 'Задачи → «Регулярные» или через меню «Все задачи».' },
      { text: 'Определить 3 задачи которые ставите вручную каждую неделю', detail: 'Например: отчёт, планёрка, проверка показателей.' },
      { text: 'Создать еженедельную регулярную задачу с напоминанием', detail: 'Кнопка «+ Регулярная» → исполнитель, день недели, время, результат.' },
      { text: 'Проверить что задача автоматически появилась у исполнителя', detail: 'Фильтр по исполнителю → регулярная задача уже там с дедлайном.' },
    ],
  },
  myday: {
    title: 'Мой день: фокус и планирование',
    subtitle: 'Блок 2 · Мой день', est: '5 мин',
    actionLabel: 'Открыть Мой день',
    tipText: 'Попросите команду начинать день с «Моего дня». 5 минут утром — и каждый знает свой план.',
    tasks: [
      { text: 'Открыть «Мой день» и просмотреть задачи на сегодня', detail: 'Если задач нет — создайте тестовую с дедлайном сегодня.' },
      { text: 'Переключиться в режим «Фокус» и выполнить одну задачу', detail: 'Кнопка «Фокус» вверху вкладки. Нажмите «Готово» — система переходит к следующей.' },
    ],
  },
  functions: {
    title: 'Функции: отделы и KPI бизнеса',
    subtitle: 'Блок 3 · Система', est: '15 мин',
    actionLabel: 'Открыть функции',
    tipText: 'Минимум: 3–5 функций с KPI. Это фундамент аналитики. Без функций отчёт по отделам пуст.',
    tasks: [
      { text: 'Открыть Система → Функции', detail: 'Без функций аналитика по отделам не работает.' },
      { text: 'Создать минимум 3 ключевые функции своего бизнеса', detail: '«+ Функция» → название → назначить ответственного. Начните с: Продажи, Операционная, Финансы.' },
      { text: 'К каждой функции добавить минимум 1 KPI с конкретным числом', detail: 'Внутри функции → «KPI» → «+ KPI». Пример: Новые сделки — 20 — шт/мес.' },
      { text: 'Переключиться в режим «Структура» и проверить схему', detail: 'Кнопка «Структура» вверху. Видна иерархия отделов.' },
      { text: 'Привязать существующие задачи к соответствующим функциям', detail: 'Откройте задачу → поле «Функция» → выберите отдел.' },
    ],
  },
  bizstructure: {
    title: 'Структура: организационная схема компании',
    subtitle: 'Блок 3 · Система', est: '10 мин',
    actionLabel: 'Открыть структуру',
    tipText: 'Структура — первое что показываете новому менеджеру. Экономит 2–3 недели адаптации.',
    tasks: [
      { text: 'Открыть Система → Структура', detail: 'Если пусто — сначала заполните Функции.' },
      { text: 'Проверить что все отделы отображаются корректно', detail: 'Сравните с реальной структурой бизнеса.' },
      { text: 'Кликнуть на карточку сотрудника и просмотреть детали', detail: 'Роль, отдел, активные задачи, нагрузка.' },
      { text: 'Проверить что каждый сотрудник привязан к своему отделу', detail: 'Если кто-то «без отдела» — откройте карточку → измените функцию.' },
    ],
  },
  team_management: {
    title: 'Сотрудники: роли, доступы и приглашения',
    subtitle: 'Блок 3 · Система', est: '15 мин',
    actionLabel: 'Открыть сотрудников',
    tipText: 'Ошибка №1: всем дают Owner. Потом удивляются почему рядовой сотрудник видит зарплаты. Роли — настройте один раз правильно.',
    tasks: [
      { text: 'Открыть Система → Сотрудники → вкладка «Список»', detail: 'Проверьте всех активных. Карточка: роль, отдел, количество задач.' },
      { text: 'Проверить роли — соответствуют ли реальным обязанностям', detail: 'Клик → «Изменить роль». Правило: минимально необходимый доступ.' },
      { text: 'Перейти на вкладку «Роли» и изучить матрицу доступов', detail: 'Owner — всё. Manager — свой отдел + аналитика. Employee — только свои задачи.' },
      { text: 'Пригласить нового сотрудника через вкладку «Пригласить»', detail: 'Email → роль → функция → «Отправить».' },
      { text: 'Открыть вкладку «Компания» и проверить настройки (только Owner)', detail: 'Название, часовой пояс, еженедельный отчёт.' },
    ],
  },
  system_integrations: {
    title: 'Интеграции: подключение внешних сервисов',
    subtitle: 'Блок 3 · Система', est: '15 мин',
    actionLabel: 'Открыть интеграции',
    tipText: 'Телефония — наибольшая точка потерь для бизнесов со входящими звонками. Без интеграции: пропущенный звонок = потерянный клиент.',
    tasks: [
      { text: 'Открыть Бизнес → Интеграции и просмотреть доступные', detail: 'Список сервисов со статусом «Подключено» или «Не подключено».' },
      { text: 'Проверить что Telegram подключён в вашем профиле', detail: 'Клик на имя вверху справа → «Telegram уведомления» → должно быть «Подключено».' },
      { text: 'Подключить Google Calendar или просмотреть инструкцию', detail: 'Интеграции → Google Calendar → «Подключить» → авторизация Google.' },
      { text: 'Если используете Binotel, Ringostat или Stream — подключить телефонию', detail: 'Интеграции → провайдер → API ключ → сохранить.' },
      { text: 'Попросить каждого сотрудника подключить Telegram', detail: 'Без этого уведомления не приходят. Сделайте обязательным условием.' },
    ],
  },
  projects: {
    title: 'Проекты: сложные задачи с таймлайном',
    subtitle: 'Блок 4 · Проекты и процессы', est: '10 мин',
    actionLabel: 'Открыть проекты',
    tipText: 'Таймлайн — сразу видно где «узкое место» и кто блокирует остальных.',
    tasks: [
      { text: 'Открыть вкладку «Проекты» и просмотреть имеющиеся', detail: 'Если нет — создайте тестовый. Название + дедлайн + задачи.' },
      { text: 'Переключить вид: Карты → Список → Таймлайн', detail: 'Таймлайн — наиболее информативный вид для контроля.' },
      { text: 'Добавить задачи и проверить прогресс', detail: 'Добавьте 3–4 задачи → проверьте таймлайн.' },
    ],
  },
  processes: {
    title: 'Процессы: шаблоны для повторяющихся ситуаций',
    subtitle: 'Блок 4 · Проекты и процессы', est: '15 мин',
    actionLabel: 'Открыть процессы',
    tipText: '1 настроенный процесс = сотни сэкономленных часов в год.',
    tasks: [
      { text: 'Открыть вкладку «Процессы» и просмотреть логику', detail: 'Найдите демо-шаблоны. Обратите внимание: шаблон → запуск → активный процесс.' },
      { text: 'Определить 1 повторяющийся процесс в своём бизнесе', detail: 'Что делаете несколько раз в месяц одинаково? Это кандидат.' },
      { text: 'Создать шаблон процесса с 3–4 этапами', detail: 'Процессы → «Новый шаблон» → добавьте этапы. Каждый: кто + дней + результат.' },
      { text: 'Запустить процесс и проверить что задачи создались', detail: 'Перейдите в «Все задачи» — задачи уже там с исполнителями и дедлайнами.' },
    ],
  },
  coordination_types: {
    title: 'Координации: типы и когда использовать',
    subtitle: 'Блок 5 · Координации', est: '10 мин',
    actionLabel: 'Открыть координации',
    tipText: 'Еженедельная планёрка — базовый ритм бизнеса. Без неё команда «рассыпается» на островки.',
    tasks: [
      { text: 'Открыть вкладку «Координации» и просмотреть все 8 типов', detail: 'Каждый тип — отдельный шаблон повестки и длительность.' },
      { text: 'Определить какие типы нужны вашему бизнесу', detail: 'Минимум: Еженедельная + Ежемесячная. Для руководителей — Исполнительный совет.' },
      { text: 'Настроить регулярную еженедельную координацию', detail: '«Новая координация» → тип → день → время → участники.' },
    ],
  },
  coordination_process: {
    title: 'Координации: как провести и зафиксировать результат',
    subtitle: 'Блок 5 · Координации', est: '15 мин',
    actionLabel: 'Открыть координации',
    tipText: 'Правило: каждое совещание заканчивается протоколом с задачами.',
    tasks: [
      { text: 'Создать координацию «Еженедельная» и добавить участников', detail: '«Новая координация» → тип → название → участники.' },
      { text: 'Запустить координацию и пройти повестку до конца', detail: 'Кнопка «Начать» → повестка → зафиксируйте минимум 1 решение.' },
      { text: 'Зафиксировать решение и назначить исполнителя с дедлайном', detail: '«+ Добавить решение» → текст → исполнитель → дедлайн. Сразу становится задачей.' },
      { text: 'Завершить координацию и проверить что задачи появились', detail: 'Перейдите в «Все задачи» — все решения уже там.' },
      { text: 'Открыть автоматически сформированный протокол', detail: 'В архиве → завершённая координация → кнопка «Протокол». Готовый PDF.' },
    ],
  },
  control: {
    title: 'Контроль: пульс бизнеса за 5 минут в день',
    subtitle: 'Блок 5 · Контроль', est: '15 мин',
    actionLabel: 'Открыть контроль',
    tipText: 'Утренний ритуал: 5 минут в «Критическом внимании» — состояние бизнеса без единого совещания.',
    tasks: [
      { text: 'Открыть «Контроль» → нажать «Критическое внимание»', detail: 'Ваш утренний ритуал. 2 минуты — знаете где «пожар».' },
      { text: 'Просмотреть «Нагрузку» — увидеть распределение по команде', detail: 'У кого 15 задач а у кого 2? Дисбаланс — признак неправильного делегирования.' },
      { text: 'Открыть «Воронку делегирования» и понять логику', detail: 'Если большинство на первом этапе — исполнители не берут в работу.' },
      { text: 'Добавить первую запись в «Журнал управленческих сбоев»', detail: 'Факт → причина → решение. Через 3 месяца видны системные паттерны.' },
    ],
  },
  analytics: {
    title: 'Эффективность и Статистика: цифры вместо ощущений',
    subtitle: 'Блок 6 · Аналитика', est: '10 мин',
    actionLabel: 'Открыть аналитику',
    tipText: 'Если метрика не измеряется — ею невозможно управлять. 3 цифры в день — минимум.',
    tasks: [
      { text: 'Открыть «Эффективность» — просмотреть статистику по задачам', detail: 'Кто выполняет вовремя а кто постоянно переносит. Объективные данные.' },
      { text: 'Открыть «Статистика» и добавить 3 ключевые метрики', detail: 'Примеры: «Выручка за день», «Новых клиентов», «Выполненных заказов».' },
      { text: 'Переключить метрики между День / Неделя / Месяц', detail: 'Месяц показывает тренд, день — текущий пульс.' },
    ],
  },
  finance_dashboard: {
    title: 'Финансы: дашборд и общая картина',
    subtitle: 'Блок 7 · Финансы', est: '10 мин',
    actionLabel: 'Открыть финансы',
    tipText: 'Финансы без данных — красивый но пустой дашборд. Начинайте вносить транзакции с сегодня.',
    tasks: [
      { text: 'Открыть Бизнес → Финансы и просмотреть дашборд', detail: 'Выберите текущий месяц.' },
      { text: 'Просмотреть все подвкладки: Доходы, Расходы, Счета, Планирование', detail: 'Пройдите по каждой — поймите логику перед внесением данных.' },
      { text: 'Настроить счета (касса, банк, карта)', detail: 'Финансы → Настройки → Счета. Добавьте минимум 2: наличные и текущий счёт.' },
    ],
  },
  finance_transactions: {
    title: 'Финансы: доходы, расходы и категории',
    subtitle: 'Блок 7 · Финансы', est: '15 мин',
    actionLabel: 'Открыть финансы',
    tipText: 'Стандарт: вносить транзакции ежедневно или минимум раз в 2–3 дня.',
    tasks: [
      { text: 'Внести 3 тестовых дохода по разным категориям', detail: 'Финансы → Доходы → «+ Доход». Категория, сумма, счёт, дата.' },
      { text: 'Внести 3 тестовых расхода по разным категориям', detail: 'Привяжите к функции — тогда аналитика по отделам работает.' },
      { text: 'Настроить повторяющуюся транзакцию (например аренда)', detail: 'Финансы → Повторяющиеся → «+ Повторяющаяся» → ежемесячно, сумма, категория.' },
      { text: 'Проверить дашборд после внесения данных', detail: 'Теперь графики и топ расходов заполнены реальными данными.' },
    ],
  },
  finance_planning: {
    title: 'Финансы: бюджетирование, счета и P&L',
    subtitle: 'Блок 7 · Финансы', est: '15 мин',
    actionLabel: 'Открыть финансы',
    tipText: 'P&L — первый документ в разговоре с инвестором или банком. Теперь формируется автоматически.',
    tasks: [
      { text: 'Открыть Финансы → Планирование и внести план доходов на месяц', detail: 'Ожидаемый доход по каждой категории.' },
      { text: 'Внести план расходов по категориям', detail: 'Зарплата, аренда, маркетинг, материалы — детализируйте.' },
      { text: 'Создать тестовый счёт клиенту и проверить статусы', detail: 'Финансы → Счета → «+ Счёт». Позиции → дедлайн → отметить «Оплачено».' },
      { text: 'Просмотреть P&L отчёт за текущий месяц', detail: 'Если есть транзакции — P&L заполнится автоматически.' },
    ],
  },
  crm: {
    title: 'CRM: клиенты, сделки, продажи',
    subtitle: 'Блок 8 · Бизнес', est: '15 мин',
    actionLabel: 'Открыть CRM',
    tipText: 'Главное правило CRM: любое взаимодействие с клиентом — фиксируется. Через 6 месяцев этот журнал становится ценнейшим активом.',
    tasks: [
      { text: 'Открыть CRM и просмотреть канбан сделок', detail: 'Настройте названия стадий: CRM → Настройки → Воронки.' },
      { text: 'Создать тестовую сделку и перетащить между стадиями', detail: '«+ Сделка». Название, сумма, клиент, стадия. Попробуйте drag & drop.' },
      { text: 'Добавить клиента и привязать к нему сделку', detail: 'CRM → Клиенты → «+ Клиент».' },
      { text: 'Из сделки создать задачу «Перезвонить» с дедлайном', detail: 'Откройте сделку → «Задача». Появляется в системе.' },
    ],
  },
  bots_sites: {
    title: 'Маркетинг, Боты и Мои сайты',
    subtitle: 'Блок 8 · Бизнес', est: '10 мин',
    actionLabel: 'Открыть боты',
    tipText: 'Даже простой бот который отвечает и передаёт контакт в CRM — уже лучше чем ничего.',
    tasks: [
      { text: 'Открыть «Боты» и посмотреть как подключается Telegram-бот', detail: 'Боты → «+ Новый бот» → токен от @BotFather → приветственное сообщение.' },
      { text: 'Просмотреть конструктор цепочек сообщений', detail: 'В боте → «Цепочки» → «+ Новая цепочка». Drag & drop: Сообщение, Вопрос, Условие.' },
      { text: 'Открыть «Мои сайты» и просмотреть конструктор', detail: 'Сайты → «+ Новый сайт». Шаблон → редактировать → опубликовать. Форма → в CRM.' },
    ],
  },
  learning_start: {
    title: 'Обучение: маршрут программы и первые модули',
    subtitle: 'Блок 9 · Обучение', est: '20 мин',
    actionLabel: 'Открыть обучение',
    tipText: 'Обучение и внедрение — параллельно. Прошли модуль → сразу настроили в системе → закрепилось.',
    tasks: [
      { text: 'Открыть вкладку «Обучение» в главном меню', detail: 'Новая кнопка в десктопном меню. На мобильном — в нижнем меню.' },
      { text: 'Просмотреть Модуль 0 «Маршрут программы»', detail: 'Это карта всего пути. После просмотра станет понятно в какой последовательности двигаться.' },
      { text: 'Просмотреть Модуль 4 «Система поручений»', detail: 'После этого модуля качество делегирования растёт сразу.' },
      { text: 'Запланировать прохождение остальных модулей — по 1 в неделю', detail: 'Не пытайтесь пройти всё сразу. 1 модуль в неделю = усвоено и внедрено.' },
    ],
  },
  learning_ai: {
    title: 'AI-ассистент и интеграции',
    subtitle: 'Блок 9 · Обучение', est: '5 мин',
    actionLabel: 'Открыть интеграции',
    tipText: 'AI-ассистент 24/7 — первая точка помощи. Прежде чем писать разработчику — спросите ассистента.',
    tasks: [
      { text: 'Нажать зелёную кнопку и задать вопрос о платформе', detail: 'Например: «Как настроить повторяющуюся задачу?»' },
      { text: 'Открыть «Интеграции» и просмотреть доступные подключения', detail: 'Google Calendar, Telegram, Webhook.' },
      { text: 'Подключить Google Calendar или убедиться что Telegram подключён', detail: 'Выберите интеграцию → следуйте инструкции. 3–5 минут.' },
    ],
  },
}, // end ru

}; // end OB_I18N

// ─── HELPER: patch step with current language ──────────────
window.getLocalizedStep = function(step) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_lang') || 'ua';
    if (lang === 'ua') return step; // UA — базова, без патча
    var i18n = window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang][step.id];
    if (!i18n) return step; // fallback UA
    var patched = Object.assign({}, step);
    if (i18n.title)       patched.title       = i18n.title;
    if (i18n.subtitle)    patched.subtitle     = i18n.subtitle;
    if (i18n.est)         patched.est          = i18n.est;
    if (i18n.tipText)     patched._tipText     = i18n.tipText; // окремо — без SVG
    if (i18n.actionLabel && patched.action) {
        patched.action = Object.assign({}, patched.action, { label: i18n.actionLabel });
    }
    if (i18n.tasks && i18n.tasks.length) {
        patched.tasks = step.tasks.map(function(t, idx) {
            var tr = i18n.tasks[idx];
            if (!tr) return t;
            return Object.assign({}, t, { text: tr.text || t.text, detail: tr.detail || t.detail });
        });
    }
    return patched;
};

// ─── HELPER: get block label ───────────────────────────────
window.getOBBlockLabel = function(blockId) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_lang') || 'ua';
    return (window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang]._blocks && window.OB_I18N[lang]._blocks[blockId]) || blockId;
};

// ─── HELPER: get UI string ─────────────────────────────────
window.getOBUI = function(key) {
    var lang = (typeof currentLang !== 'undefined' ? currentLang : null)
             || localStorage.getItem('talko_lang') || 'ua';
    return (window.OB_I18N && window.OB_I18N[lang] && window.OB_I18N[lang]._ui && window.OB_I18N[lang]._ui[key]) || '';
};
