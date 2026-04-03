// deploy-trigger: 2026-04-01
const functions = require('firebase-functions/v1'); // upgraded to firebase-functions v7, explicit v1 API
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// ===========================
// CONFIG
// ===========================
const REGION = 'europe-west1';

// Telegram token — зберігається в Firebase secrets
// Встановити: firebase functions:secrets:set TELEGRAM_BOT_TOKEN
function getTelegramToken() {
    return process.env.TELEGRAM_BOT_TOKEN || '8389055770:AAEWTQcwveoIjmAJmtrM4Y1JToNJ3T8t4lY';
}

function getTelegramApi() {
    return `https://api.telegram.org/bot${getTelegramToken()}`;
}

// ===========================
// i18n FOR TELEGRAM MESSAGES
// ===========================
const TG_LANG = {
    ua: {
        taskDone: '✅ <b>Завдання виконано!</b>',
        taskSentForReview: '🔍 <b>Відправлено на перевірку!</b>',
        taskInProgress: '🚀 <b>В роботі</b>',
        taskPostponed: '🔄 <b>Перенесено</b>',
        newDeadline: '📅 Новий дедлайн',
        deadline: '📅 Дедлайн',
        executor: '👤 Виконавець',
        unknown: 'Невідомо',
        taskType_process: '🟣 Процес',
        taskType_regular: '🟠 Регулярне',
        taskType_task: '🟢 Завдання',
        expectedResult: '📋 Очікуваний результат',
        description: '📝 Опис',
        status: '📊 Статус',
        priority: '🔖 Пріоритет',
        function: '⚙️ Функція',
        object: '🏷 Об\'єкт',
        taskNotFound: '❌ Задачу не знайдено',
        noPermission: '❌ Немає прав на цю задачу',
        unknownAction: '❌ Невідома дія',
        invalidParams: '❌ Невірні параметри',
        errorPrefix: '❌ Помилка: ',
        cbTaskDone: '✅ Задачу завершено!',
        cbInProgress: '🚀 Взято в роботу',
        cbPostponed: '📅 Перенесено на',
        cbSentForReview: '🔍 Відправлено на перевірку',
        connectedSuccess: '✅ <b>Успішно підключено!</b>\n\nТепер ви отримуватимете сповіщення про нові завдання.\n\nКнопки під кожним завданням:\n✅ Готово — завершити\n🔄 +1 день — перенести\n🚀 В роботу — взяти\n📎 Деталі — побачити опис',
        codeNotFound: '❌ Код не знайдено або застарів.\n\nСпробуйте отримати новий код в TALKO System.',
        welcome: '👋 <b>Вітаю в TALKO Tasks!</b>\n\nЩоб підключити сповіщення, натисніть кнопку "Підключити Telegram" в налаштуваннях TALKO System.\n\nДоступні команди:\n/today — задачі на сьогодні\n/overdue — прострочені',
        noTasksToday: '✅ Задач на сьогодні немає',
        noOverdue: '✅ Прострочених немає!',
        noTasksAndDeals: '✅ На сьогодні завдань і угод немає!',
        tasksToday: '📋 Задачі на сьогодні',
        tasksOverdue: '📋 Прострочені',
        moreItems: '... ще',
        crmContactToday: '📞 <b>Потрібен контакт сьогодні',
        crmDeals: 'угод</b>',
        crmStage: '📊 Стадія',
        crmContact: '📅 Контакт',
        crmMoreDeals: 'угод',
        crmOverdue: '⚠️ Прострочено (мав бути',
        helpMenu: '📖 <b>TALKO Tasks — команди:</b>\n\n/today — завдання на сьогодні\n/overdue — прострочені завдання\n/task @імя Назва | дата — поставити завдання\n/weekly — звіт за тиждень\n/team — статус команди\n/lang — мова сповіщень\n/help — ця довідка',
        langChanged: '✅ 🇺🇦 Українська — мову встановлено!\n\nВсі наступні сповіщення будуть українською.',
        weeklyReport: '📊 <b>Тижневий звіт</b>\n\n✅ Виконано',
        weeklyInProgress: '🔄 В роботі',
        weeklyOverdue: '⚠️ Прострочено',
        notConnected: '❌ Не підключено. Натисніть "Підключити Telegram" в TALKO System.',
        teamOnlyForManagers: 'ℹ️ Команда /team доступна тільки для керівників в TALKO System.',
        connectHint: 'ℹ️ Для підключення email зайдіть в TALKO System → Профіль → Підключити Telegram.',
        btnDone: '✅ Готово',
        btnPostpone: '🔄 +1 день',
        btnDetails: '📎 Деталі',
        btnInProgress: '🚀 В роботу',
        overdueAlert: '⚠️ Прострочено',
        reminderPrefix: '⏰ Нагадування',
        escalationPrefix: '🚨 Ескалація',
        reviewRequired: '🔍 Потребує перевірки',
        teamReport: '👥 <b>Статус команди</b>',
        active: 'активних',
        overdueTasks: 'прострочених',
        doneTasks: 'виконано сьогодні',
        noTeamData: 'Немає даних про команду',
        morningReport: '📊 <b>Ранковий звіт</b>',
        morningDate: 'виконано вчора',
        morningToday: '📋 На сьогодні',
        morningTasks: 'задач',
        morningCompleted: '✅ Виконано вчора',
        morningOverdue: '⚠️ Прострочено',
        morningProcesses: '🔄 Активних процесів',
        morningTeam: '👥 <b>Команда:</b>',
        morningDone: 'виконано',
        morningOverdueShort: 'прострочено',
        goodMorning: '☀️ Доброго ранку',
        noTasksToday2: '✅ На сьогодні завдань немає.',
        todayTasksCount: '📋 На сьогодні',
        overdueCount: '⚠️ Прострочено',
        weeklyTitle: '📈 <b>Тижневий звіт</b>',
        weeklyCreated: '📝 Створено',
        weeklyDone: '✅ Виконано',
        weeklyOverdueShort: '⚠️ Прострочено',
        weeklyProcesses: '🔄 Процесів завершено',
        weeklyAvgTime: '⏱ Сер. час',
        weeklyHours: 'год',
        weeklyEfficiency: '📊 Ефективність',
        weeklyBest: '🏆 <b>Найкращі:</b>',
        weeklyAttention: '⚠️ <b>Потребують уваги:</b>',
        weeklyOverdueOf: 'прострочень',
        overdueTaskAlert: '⚠️ <b>Задача прострочена!</b>',
        minutesShort: 'хв',
        processCompleted: '✅ <b>Процес завершено!</b>',
        processSteps: 'етапів виконано',
        langMenuTitle: '🌐 <b>Мова сповіщень</b>',
        langCurrent: 'Поточна',
        langChange: '<b>Змінити:</b>',
        hoursShort: 'год',
        newProcessStep: 'Новий етап процесу!',
        stepLabel: 'Етап',
        processProgress: '📊 Прогрес процесу',
        completed: 'завершено',
        eveningReport: 'Вечірній звіт',
        planVsFact: 'План vs Факт',
        eveningDone: 'Виконано',
        eveningMissed: 'Не виконано',
        eveningTomorrow: 'На завтра',
    },
    ru: {
        taskDone: '✅ <b>Задача выполнена!</b>',
        taskSentForReview: '🔍 <b>Отправлено на проверку!</b>',
        taskInProgress: '🚀 <b>В работе</b>',
        taskPostponed: '🔄 <b>Перенесено</b>',
        newDeadline: '📅 Новый дедлайн',
        deadline: '📅 Дедлайн',
        executor: '👤 Исполнитель',
        unknown: 'Неизвестно',
        taskType_process: '🟣 Процесс',
        taskType_regular: '🟠 Регулярная',
        taskType_task: '🟢 Задача',
        expectedResult: '📋 Ожидаемый результат',
        description: '📝 Описание',
        status: '📊 Статус',
        priority: '🔖 Приоритет',
        function: '⚙️ Функция',
        object: '🏷 Объект',
        taskNotFound: '❌ Задача не найдена',
        noPermission: '❌ Нет прав на эту задачу',
        unknownAction: '❌ Неизвестное действие',
        invalidParams: '❌ Неверные параметры',
        errorPrefix: '❌ Ошибка: ',
        cbTaskDone: '✅ Задача завершена!',
        cbInProgress: '🚀 Взято в работу',
        cbPostponed: '📅 Перенесено на',
        cbSentForReview: '🔍 Отправлено на проверку',
        connectedSuccess: '✅ <b>Успешно подключено!</b>\n\nТеперь вы будете получать уведомления о новых задачах.\n\nКнопки под каждой задачей:\n✅ Готово — завершить\n🔄 +1 день — перенести\n🚀 В работу — взять\n📎 Детали — посмотреть описание',
        codeNotFound: '❌ Код не найден или устарел.\n\nПопробуйте получить новый код в TALKO System.',
        welcome: '👋 <b>Добро пожаловать в TALKO Tasks!</b>\n\nЧтобы подключить уведомления, нажмите кнопку "Подключить Telegram" в настройках TALKO System.\n\nДоступные команды:\n/today — задачи на сегодня\n/overdue — просроченные',
        noTasksToday: '✅ Задач на сегодня нет',
        noOverdue: '✅ Просроченных нет!',
        noTasksAndDeals: '✅ На сегодня задач и сделок нет!',
        tasksToday: '📋 Задачи на сегодня',
        tasksOverdue: '📋 Просроченные',
        moreItems: '... ещё',
        crmContactToday: '📞 <b>Нужен контакт сегодня',
        crmDeals: 'сделок</b>',
        crmStage: '📊 Стадия',
        crmContact: '📅 Контакт',
        crmMoreDeals: 'сделок',
        crmOverdue: '⚠️ Просрочено (должен был быть',
        helpMenu: '📖 <b>TALKO Tasks — команды:</b>\n\n/today — задачи на сегодня\n/overdue — просроченные задачи\n/task @имя Название | дата — поставить задачу\n/weekly — отчёт за неделю\n/team — статус команды\n/lang — язык уведомлений\n/help — эта справка',
        langChanged: '✅ 🇷🇺 Русский — язык установлен!\n\nВсе следующие уведомления будут на русском.',
        weeklyReport: '📊 <b>Недельный отчёт</b>\n\n✅ Выполнено',
        weeklyInProgress: '🔄 В работе',
        weeklyOverdue: '⚠️ Просрочено',
        notConnected: '❌ Не подключено. Нажмите "Подключить Telegram" в TALKO System.',
        teamOnlyForManagers: 'ℹ️ Команда /team доступна только для руководителей в TALKO System.',
        connectHint: 'ℹ️ Для подключения email зайдите в TALKO System → Профиль → Подключить Telegram.',
        btnDone: '✅ Готово',
        btnPostpone: '🔄 +1 день',
        btnDetails: '📎 Детали',
        btnInProgress: '🚀 В работу',
        overdueAlert: '⚠️ Просрочено',
        reminderPrefix: '⏰ Напоминание',
        escalationPrefix: '🚨 Эскалация',
        reviewRequired: '🔍 Требует проверки',
        teamReport: '👥 <b>Статус команды</b>',
        active: 'активных',
        overdueTasks: 'просроченных',
        doneTasks: 'выполнено сегодня',
        noTeamData: 'Нет данных о команде',
        morningReport: '📊 <b>Утренний отчёт</b>',
        morningDate: 'выполнено вчера',
        morningToday: '📋 На сегодня',
        morningTasks: 'задач',
        morningCompleted: '✅ Выполнено вчера',
        morningOverdue: '⚠️ Просрочено',
        morningProcesses: '🔄 Активных процессов',
        morningTeam: '👥 <b>Команда:</b>',
        morningDone: 'выполнено',
        morningOverdueShort: 'просрочено',
        goodMorning: '☀️ Доброе утро',
        noTasksToday2: '✅ На сегодня задач нет.',
        todayTasksCount: '📋 На сегодня',
        overdueCount: '⚠️ Просрочено',
        weeklyTitle: '📈 <b>Недельный отчёт</b>',
        weeklyCreated: '📝 Создано',
        weeklyDone: '✅ Выполнено',
        weeklyOverdueShort: '⚠️ Просрочено',
        weeklyProcesses: '🔄 Процессов завершено',
        weeklyAvgTime: '⏱ Ср. время',
        weeklyHours: 'ч',
        weeklyEfficiency: '📊 Эффективность',
        weeklyBest: '🏆 <b>Лучшие:</b>',
        weeklyAttention: '⚠️ <b>Требуют внимания:</b>',
        weeklyOverdueOf: 'просрочений',
        overdueTaskAlert: '⚠️ <b>Задача просрочена!</b>',
        minutesShort: 'мин',
        processCompleted: '✅ <b>Процесс завершён!</b>',
        processSteps: 'этапов выполнено',
        langMenuTitle: '🌐 <b>Язык уведомлений</b>',
        langCurrent: 'Текущий',
        langChange: '<b>Изменить:</b>',
        hoursShort: 'ч',
        newProcessStep: 'Новый этап процесса!',
        stepLabel: 'Этап',
        processProgress: '📊 Прогресс процесса',
        completed: 'завершён',
        eveningReport: 'Вечерний отчёт',
        planVsFact: 'План vs Факт',
        eveningDone: 'Выполнено',
        eveningMissed: 'Не выполнено',
        eveningTomorrow: 'На завтра',
    },
    en: {
        taskDone: '✅ <b>Task completed!</b>',
        taskSentForReview: '🔍 <b>Sent for review!</b>',
        taskInProgress: '🚀 <b>In progress</b>',
        taskPostponed: '🔄 <b>Postponed</b>',
        newDeadline: '📅 New deadline',
        deadline: '📅 Deadline',
        executor: '👤 Assignee',
        unknown: 'Unknown',
        taskType_process: '🟣 Process',
        taskType_regular: '🟠 Regular',
        taskType_task: '🟢 Task',
        expectedResult: '📋 Expected result',
        description: '📝 Description',
        status: '📊 Status',
        priority: '🔖 Priority',
        function: '⚙️ Function',
        object: '🏷 Object',
        taskNotFound: '❌ Task not found',
        noPermission: '❌ No permission for this task',
        unknownAction: '❌ Unknown action',
        invalidParams: '❌ Invalid parameters',
        errorPrefix: '❌ Error: ',
        cbTaskDone: '✅ Task completed!',
        cbInProgress: '🚀 Taken in progress',
        cbPostponed: '📅 Postponed to',
        cbSentForReview: '🔍 Sent for review',
        connectedSuccess: '✅ <b>Successfully connected!</b>\n\nYou will now receive notifications about new tasks.\n\nButtons under each task:\n✅ Done — complete\n🔄 +1 day — postpone\n🚀 In progress — take\n📎 Details — view description',
        codeNotFound: '❌ Code not found or expired.\n\nTry getting a new code in TALKO System.',
        welcome: '👋 <b>Welcome to TALKO Tasks!</b>\n\nTo connect notifications, click "Connect Telegram" in TALKO System settings.\n\nAvailable commands:\n/today — tasks for today\n/overdue — overdue tasks',
        noTasksToday: '✅ No tasks for today',
        noOverdue: '✅ No overdue tasks!',
        noTasksAndDeals: '✅ No tasks or deals for today!',
        tasksToday: '📋 Tasks for today',
        tasksOverdue: '📋 Overdue',
        moreItems: '... more',
        crmContactToday: '📞 <b>Contact needed today',
        crmDeals: 'deals</b>',
        crmStage: '📊 Stage',
        crmContact: '📅 Contact',
        crmMoreDeals: 'deals',
        crmOverdue: '⚠️ Overdue (was due',
        helpMenu: '📖 <b>TALKO Tasks — commands:</b>\n\n/today — tasks for today\n/overdue — overdue tasks\n/task @name Title | date — create task\n/weekly — weekly report\n/team — team status\n/lang — notification language\n/help — this help',
        langChanged: '✅ 🇬🇧 English — language set!\n\nAll future notifications will be in English.',
        weeklyReport: '📊 <b>Weekly report</b>\n\n✅ Completed',
        weeklyInProgress: '🔄 In progress',
        weeklyOverdue: '⚠️ Overdue',
        notConnected: '❌ Not connected. Click "Connect Telegram" in TALKO System.',
        teamOnlyForManagers: 'ℹ️ The /team command is available to managers only in TALKO System.',
        connectHint: 'ℹ️ To connect your email, go to TALKO System → Profile → Connect Telegram.',
        btnDone: '✅ Done',
        btnPostpone: '🔄 +1 day',
        btnDetails: '📎 Details',
        btnInProgress: '🚀 In progress',
        overdueAlert: '⚠️ Overdue',
        reminderPrefix: '⏰ Reminder',
        escalationPrefix: '🚨 Escalation',
        reviewRequired: '🔍 Needs review',
        teamReport: '👥 <b>Team status</b>',
        active: 'active',
        overdueTasks: 'overdue',
        doneTasks: 'done today',
        noTeamData: 'No team data available',
        morningReport: '📊 <b>Morning report</b>',
        morningDate: 'completed yesterday',
        morningToday: '📋 Today',
        morningTasks: 'tasks',
        morningCompleted: '✅ Completed yesterday',
        morningOverdue: '⚠️ Overdue',
        morningProcesses: '🔄 Active processes',
        morningTeam: '👥 <b>Team:</b>',
        morningDone: 'done',
        morningOverdueShort: 'overdue',
        goodMorning: '☀️ Good morning',
        noTasksToday2: '✅ No tasks for today.',
        todayTasksCount: '📋 Today',
        overdueCount: '⚠️ Overdue',
        weeklyTitle: '📈 <b>Weekly report</b>',
        weeklyCreated: '📝 Created',
        weeklyDone: '✅ Completed',
        weeklyOverdueShort: '⚠️ Overdue',
        weeklyProcesses: '🔄 Processes completed',
        weeklyAvgTime: '⏱ Avg time',
        weeklyHours: 'h',
        weeklyEfficiency: '📊 Efficiency',
        weeklyBest: '🏆 <b>Top performers:</b>',
        weeklyAttention: '⚠️ <b>Need attention:</b>',
        weeklyOverdueOf: 'overdue',
        overdueTaskAlert: '⚠️ <b>Task overdue!</b>',
        minutesShort: 'min',
        processCompleted: '✅ <b>Process completed!</b>',
        processSteps: 'steps completed',
        langMenuTitle: '🌐 <b>Notification language</b>',
        langCurrent: 'Current',
        langChange: '<b>Change:</b>',
        hoursShort: 'h',
        newProcessStep: 'New process step!',
        stepLabel: 'Step',
        processProgress: '📊 Process progress',
        completed: 'completed',
        eveningReport: 'Evening report',
        planVsFact: 'Plan vs Fact',
        eveningDone: 'Completed',
        eveningMissed: 'Missed',
        eveningTomorrow: 'Tomorrow',
    },
    pl: {
        taskDone: '✅ <b>Zadanie wykonane!</b>',
        taskSentForReview: '🔍 <b>Wysłano do sprawdzenia!</b>',
        taskInProgress: '🚀 <b>W trakcie</b>',
        taskPostponed: '🔄 <b>Przesunięto</b>',
        newDeadline: '📅 Nowy termin',
        deadline: '📅 Termin',
        executor: '👤 Wykonawca',
        unknown: 'Nieznany',
        taskType_process: '🟣 Proces',
        taskType_regular: '🟠 Regularne',
        taskType_task: '🟢 Zadanie',
        expectedResult: '📋 Oczekiwany wynik',
        description: '📝 Opis',
        status: '📊 Status',
        priority: '🔖 Priorytet',
        function: '⚙️ Funkcja',
        object: '🏷 Obiekt',
        taskNotFound: '❌ Zadanie nie znalezione',
        noPermission: '❌ Brak uprawnień do tego zadania',
        unknownAction: '❌ Nieznana akcja',
        invalidParams: '❌ Nieprawidłowe parametry',
        errorPrefix: '❌ Błąd: ',
        cbTaskDone: '✅ Zadanie ukończone!',
        cbInProgress: '🚀 Wzięto do pracy',
        cbPostponed: '📅 Przesunięto na',
        cbSentForReview: '🔍 Wysłano do sprawdzenia',
        connectedSuccess: '✅ <b>Pomyślnie połączono!</b>\n\nBędziesz teraz otrzymywać powiadomienia o nowych zadaniach.\n\nPrzyciski pod każdym zadaniem:\n✅ Gotowe — zakończ\n🔄 +1 dzień — przesuń\n🚀 Do pracy — weź\n📎 Szczegóły — zobacz opis',
        codeNotFound: '❌ Kod nie znaleziony lub wygasł.\n\nSpróbuj uzyskać nowy kod w TALKO System.',
        welcome: '👋 <b>Witamy w TALKO Tasks!</b>\n\nAby połączyć powiadomienia, kliknij "Połącz Telegram" w ustawieniach TALKO System.\n\nDostępne polecenia:\n/today — zadania na dziś\n/overdue — zaległe',
        noTasksToday: '✅ Brak zadań na dziś',
        noOverdue: '✅ Brak zaległości!',
        noTasksAndDeals: '✅ Brak zadań i transakcji na dziś!',
        tasksToday: '📋 Zadania na dziś',
        tasksOverdue: '📋 Zaległe',
        moreItems: '... jeszcze',
        crmContactToday: '📞 <b>Kontakt potrzebny dziś',
        crmDeals: 'transakcji</b>',
        crmStage: '📊 Etap',
        crmContact: '📅 Kontakt',
        crmMoreDeals: 'transakcji',
        crmOverdue: '⚠️ Zaległe (miał być',
        helpMenu: '📖 <b>TALKO Tasks — polecenia:</b>\n\n/today — zadania na dziś\n/overdue — zaległe zadania\n/weekly — raport tygodniowy\n/team — status zespołu\n/lang — język powiadomień\n/connect — połącz email\n/help — ta pomoc',
        langChanged: '✅ 🇵🇱 Polski — język ustawiony!\n\nWszystkie przyszłe powiadomienia będą po polsku.',
        weeklyReport: '📊 <b>Raport tygodniowy</b>\n\n✅ Wykonano',
        weeklyInProgress: '🔄 W trakcie',
        weeklyOverdue: '⚠️ Zaległe',
        notConnected: '❌ Nie połączono. Kliknij "Połącz Telegram" w TALKO System.',
        teamOnlyForManagers: 'ℹ️ Polecenie /team dostępne tylko dla kierowników w TALKO System.',
        connectHint: 'ℹ️ Aby połączyć email, przejdź do TALKO System → Profil → Połącz Telegram.',
        btnDone: '✅ Gotowe',
        btnPostpone: '🔄 +1 dzień',
        btnDetails: '📎 Szczegóły',
        btnInProgress: '🚀 Do pracy',
        overdueAlert: '⚠️ Zaległe',
        reminderPrefix: '⏰ Przypomnienie',
        escalationPrefix: '🚨 Eskalacja',
        reviewRequired: '🔍 Wymaga sprawdzenia',
        teamReport: '👥 <b>Status zespołu</b>',
        active: 'aktywnych',
        overdueTasks: 'zaległych',
        doneTasks: 'wykonano dziś',
        noTeamData: 'Brak danych o zespole',
        morningReport: '📊 <b>Poranny raport</b>',
        morningDate: 'ukończono wczoraj',
        morningToday: '📋 Na dziś',
        morningTasks: 'zadań',
        morningCompleted: '✅ Ukończono wczoraj',
        morningOverdue: '⚠️ Zaległe',
        morningProcesses: '🔄 Aktywnych procesów',
        morningTeam: '👥 <b>Zespół:</b>',
        morningDone: 'wykonano',
        morningOverdueShort: 'zaległe',
        goodMorning: '☀️ Dzień dobry',
        noTasksToday2: '✅ Brak zadań na dziś.',
        todayTasksCount: '📋 Na dziś',
        overdueCount: '⚠️ Zaległe',
        weeklyTitle: '📈 <b>Raport tygodniowy</b>',
        weeklyCreated: '📝 Utworzono',
        weeklyDone: '✅ Wykonano',
        weeklyOverdueShort: '⚠️ Zaległe',
        weeklyProcesses: '🔄 Ukończonych procesów',
        weeklyAvgTime: '⏱ Śr. czas',
        weeklyHours: 'h',
        weeklyEfficiency: '📊 Wydajność',
        weeklyBest: '🏆 <b>Najlepsi:</b>',
        weeklyAttention: '⚠️ <b>Wymagają uwagi:</b>',
        weeklyOverdueOf: 'zaległych',
        overdueTaskAlert: '⚠️ <b>Zadanie zaległe!</b>',
        minutesShort: 'min',
        processCompleted: '✅ <b>Proces zakończony!</b>',
        processSteps: 'etapów wykonanych',
        langMenuTitle: '🌐 <b>Język powiadomień</b>',
        langCurrent: 'Aktualny',
        langChange: '<b>Zmień:</b>',
        hoursShort: 'h',
        newProcessStep: 'Nowy etap procesu!',
        stepLabel: 'Etap',
        processProgress: '📊 Postęp procesu',
        completed: 'ukończono',
        eveningReport: 'Raport wieczorny',
        planVsFact: 'Plan vs Fakt',
        eveningDone: 'Wykonano',
        eveningMissed: 'Niewykonane',
        eveningTomorrow: 'Na jutro',
    },
    de: {
        taskDone: '✅ <b>Aufgabe erledigt!</b>',
        taskSentForReview: '🔍 <b>Zur Prüfung gesendet!</b>',
        taskInProgress: '🚀 <b>In Bearbeitung</b>',
        taskPostponed: '🔄 <b>Verschoben</b>',
        newDeadline: '📅 Neuer Termin',
        deadline: '📅 Termin',
        executor: '👤 Bearbeiter',
        unknown: 'Unbekannt',
        taskType_process: '🟣 Prozess',
        taskType_regular: '🟠 Regelmäßig',
        taskType_task: '🟢 Aufgabe',
        expectedResult: '📋 Erwartetes Ergebnis',
        description: '📝 Beschreibung',
        status: '📊 Status',
        priority: '🔖 Priorität',
        function: '⚙️ Funktion',
        object: '🏷 Objekt',
        taskNotFound: '❌ Aufgabe nicht gefunden',
        noPermission: '❌ Keine Berechtigung für diese Aufgabe',
        unknownAction: '❌ Unbekannte Aktion',
        invalidParams: '❌ Ungültige Parameter',
        errorPrefix: '❌ Fehler: ',
        cbTaskDone: '✅ Aufgabe abgeschlossen!',
        cbInProgress: '🚀 In Bearbeitung genommen',
        cbPostponed: '📅 Verschoben auf',
        cbSentForReview: '🔍 Zur Prüfung gesendet',
        connectedSuccess: '✅ <b>Erfolgreich verbunden!</b>\n\nSie erhalten jetzt Benachrichtigungen über neue Aufgaben.\n\nSchaltflächen unter jeder Aufgabe:\n✅ Fertig — abschließen\n🔄 +1 Tag — verschieben\n🚀 In Arbeit — nehmen\n📎 Details — Beschreibung ansehen',
        codeNotFound: '❌ Code nicht gefunden oder abgelaufen.\n\nVersuchen Sie, einen neuen Code in TALKO System zu erhalten.',
        welcome: '👋 <b>Willkommen bei TALKO Tasks!</b>\n\nUm Benachrichtigungen zu verbinden, klicken Sie auf "Telegram verbinden" in den TALKO System-Einstellungen.\n\nVerfügbare Befehle:\n/today — Aufgaben für heute\n/overdue — überfällige',
        noTasksToday: '✅ Keine Aufgaben für heute',
        noOverdue: '✅ Keine überfälligen Aufgaben!',
        noTasksAndDeals: '✅ Keine Aufgaben oder Deals für heute!',
        tasksToday: '📋 Aufgaben für heute',
        tasksOverdue: '📋 Überfällig',
        moreItems: '... weitere',
        crmContactToday: '📞 <b>Kontakt heute erforderlich',
        crmDeals: 'Deals</b>',
        crmStage: '📊 Stufe',
        crmContact: '📅 Kontakt',
        crmMoreDeals: 'Deals',
        crmOverdue: '⚠️ Überfällig (war fällig am',
        helpMenu: '📖 <b>TALKO Tasks — Befehle:</b>\n\n/today — Aufgaben für heute\n/overdue — überfällige Aufgaben\n/weekly — Wochenbericht\n/team — Teamstatus\n/lang — Benachrichtigungssprache\n/connect — Email verbinden\n/help — diese Hilfe',
        langChanged: '✅ 🇩🇪 Deutsch — Sprache gesetzt!\n\nAlle zukünftigen Benachrichtigungen werden auf Deutsch sein.',
        weeklyReport: '📊 <b>Wochenbericht</b>\n\n✅ Erledigt',
        weeklyInProgress: '🔄 In Bearbeitung',
        weeklyOverdue: '⚠️ Überfällig',
        notConnected: '❌ Nicht verbunden. Klicken Sie auf "Telegram verbinden" in TALKO System.',
        teamOnlyForManagers: 'ℹ️ Der Befehl /team ist nur für Manager in TALKO System verfügbar.',
        connectHint: 'ℹ️ Um Ihre E-Mail zu verbinden, gehen Sie zu TALKO System → Profil → Telegram verbinden.',
        btnDone: '✅ Fertig',
        btnPostpone: '🔄 +1 Tag',
        btnDetails: '📎 Details',
        btnInProgress: '🚀 In Arbeit',
        overdueAlert: '⚠️ Überfällig',
        reminderPrefix: '⏰ Erinnerung',
        escalationPrefix: '🚨 Eskalation',
        reviewRequired: '🔍 Prüfung erforderlich',
        teamReport: '👥 <b>Teamstatus</b>',
        active: 'aktiv',
        overdueTasks: 'überfällig',
        doneTasks: 'heute erledigt',
        noTeamData: 'Keine Teamdaten verfügbar',
        morningReport: '📊 <b>Morgenbericht</b>',
        morningDate: 'gestern erledigt',
        morningToday: '📋 Heute',
        morningTasks: 'Aufgaben',
        morningCompleted: '✅ Gestern erledigt',
        morningOverdue: '⚠️ Überfällig',
        morningProcesses: '🔄 Aktive Prozesse',
        morningTeam: '👥 <b>Team:</b>',
        morningDone: 'erledigt',
        morningOverdueShort: 'überfällig',
        goodMorning: '☀️ Guten Morgen',
        noTasksToday2: '✅ Keine Aufgaben für heute.',
        todayTasksCount: '📋 Heute',
        overdueCount: '⚠️ Überfällig',
        weeklyTitle: '📈 <b>Wochenbericht</b>',
        weeklyCreated: '📝 Erstellt',
        weeklyDone: '✅ Erledigt',
        weeklyOverdueShort: '⚠️ Überfällig',
        weeklyProcesses: '🔄 Abgeschlossene Prozesse',
        weeklyAvgTime: '⏱ Ø Zeit',
        weeklyHours: 'Std',
        weeklyEfficiency: '📊 Effizienz',
        weeklyBest: '🏆 <b>Beste:</b>',
        weeklyAttention: '⚠️ <b>Benötigen Aufmerksamkeit:</b>',
        weeklyOverdueOf: 'überfällig',
        overdueTaskAlert: '⚠️ <b>Aufgabe überfällig!</b>',
        minutesShort: 'Min',
        processCompleted: '✅ <b>Prozess abgeschlossen!</b>',
        processSteps: 'Schritte abgeschlossen',
        langMenuTitle: '🌐 <b>Benachrichtigungssprache</b>',
        langCurrent: 'Aktuell',
        langChange: '<b>Ändern:</b>',
        hoursShort: 'Std',
        newProcessStep: 'Neuer Prozessschritt!',
        stepLabel: 'Schritt',
        processProgress: '📊 Prozessfortschritt',
        completed: 'abgeschlossen',
        eveningReport: 'Abendbericht',
        planVsFact: 'Plan vs Ist',
        eveningDone: 'Erledigt',
        eveningMissed: 'Nicht erledigt',
        eveningTomorrow: 'Morgen',
    },
    cs: {
        taskDone: '✅ <b>Úkol dokončen!</b>',
        taskSentForReview: '🔍 <b>Odesláno ke kontrole!</b>',
        taskInProgress: '🚀 <b>V průběhu</b>',
        taskPostponed: '🔄 <b>Přesunuto</b>',
        newDeadline: '📅 Nový termín',
        deadline: '📅 Termín',
        executor: '👤 Řešitel',
        unknown: 'Neznámý',
        taskType_process: '🟣 Proces',
        taskType_regular: '🟠 Pravidelný',
        taskType_task: '🟢 Úkol',
        expectedResult: '📋 Očekávaný výsledek',
        description: '📝 Popis',
        status: '📊 Status',
        priority: '🔖 Priorita',
        function: '⚙️ Funkce',
        object: '🏷 Objekt',
        taskNotFound: '❌ Úkol nenalezen',
        noPermission: '❌ Žádná oprávnění pro tento úkol',
        unknownAction: '❌ Neznámá akce',
        invalidParams: '❌ Neplatné parametry',
        errorPrefix: '❌ Chyba: ',
        cbTaskDone: '✅ Úkol dokončen!',
        cbInProgress: '🚀 Vzato do práce',
        cbPostponed: '📅 Přesunuto na',
        cbSentForReview: '🔍 Odesláno ke kontrole',
        connectedSuccess: '✅ <b>Úspěšně připojeno!</b>\n\nNyní budete dostávat oznámení o nových úkolech.\n\nTlačítka pod každým úkolem:\n✅ Hotovo — dokončit\n🔄 +1 den — přesunout\n🚀 Do práce — vzít\n📎 Detaily — zobrazit popis',
        codeNotFound: '❌ Kód nenalezen nebo vypršel.\n\nZkuste získat nový kód v TALKO System.',
        welcome: '👋 <b>Vítejte v TALKO Tasks!</b>\n\nPro připojení oznámení klikněte na "Připojit Telegram" v nastavení TALKO System.\n\nDostupné příkazy:\n/today — úkoly na dnes\n/overdue — zpožděné',
        noTasksToday: '✅ Žádné úkoly na dnes',
        noOverdue: '✅ Žádné zpožděné úkoly!',
        noTasksAndDeals: '✅ Žádné úkoly ani obchody na dnes!',
        tasksToday: '📋 Úkoly na dnes',
        tasksOverdue: '📋 Zpožděné',
        moreItems: '... dalších',
        crmContactToday: '📞 <b>Kontakt potřebný dnes',
        crmDeals: 'obchodů</b>',
        crmStage: '📊 Fáze',
        crmContact: '📅 Kontakt',
        crmMoreDeals: 'obchodů',
        crmOverdue: '⚠️ Zpožděno (mělo být',
        helpMenu: '📖 <b>TALKO Tasks — příkazy:</b>\n\n/today — úkoly na dnes\n/overdue — zpožděné úkoly\n/weekly — týdenní zpráva\n/team — stav týmu\n/lang — jazyk oznámení\n/connect — připojit email\n/help — tato nápověda',
        langChanged: '✅ 🇨🇿 Čeština — jazyk nastaven!\n\nVšechna budoucí oznámení budou v češtině.',
        weeklyReport: '📊 <b>Týdenní zpráva</b>\n\n✅ Dokončeno',
        weeklyInProgress: '🔄 V průběhu',
        weeklyOverdue: '⚠️ Zpožděno',
        notConnected: '❌ Nepřipojeno. Klikněte na "Připojit Telegram" v TALKO System.',
        teamOnlyForManagers: 'ℹ️ Příkaz /team je dostupný pouze pro manažery v TALKO System.',
        connectHint: 'ℹ️ Pro připojení emailu přejděte do TALKO System → Profil → Připojit Telegram.',
        btnDone: '✅ Hotovo',
        btnPostpone: '🔄 +1 den',
        btnDetails: '📎 Detaily',
        btnInProgress: '🚀 Do práce',
        overdueAlert: '⚠️ Zpožděno',
        reminderPrefix: '⏰ Připomínka',
        escalationPrefix: '🚨 Eskalace',
        reviewRequired: '🔍 Vyžaduje kontrolu',
        teamReport: '👥 <b>Stav týmu</b>',
        active: 'aktivních',
        overdueTasks: 'zpožděných',
        doneTasks: 'hotovo dnes',
        noTeamData: 'Žádná data o týmu',
        morningReport: '📊 <b>Ranní zpráva</b>',
        morningDate: 'dokončeno včera',
        morningToday: '📋 Dnes',
        morningTasks: 'úkolů',
        morningCompleted: '✅ Dokončeno včera',
        morningOverdue: '⚠️ Zpožděno',
        morningProcesses: '🔄 Aktivních procesů',
        morningTeam: '👥 <b>Tým:</b>',
        morningDone: 'hotovo',
        morningOverdueShort: 'zpožděno',
        goodMorning: '☀️ Dobré ráno',
        noTasksToday2: '✅ Žádné úkoly na dnes.',
        todayTasksCount: '📋 Dnes',
        overdueCount: '⚠️ Zpožděno',
        weeklyTitle: '📈 <b>Týdenní zpráva</b>',
        weeklyCreated: '📝 Vytvořeno',
        weeklyDone: '✅ Dokončeno',
        weeklyOverdueShort: '⚠️ Zpožděno',
        weeklyProcesses: '🔄 Dokončených procesů',
        weeklyAvgTime: '⏱ Prům. čas',
        weeklyHours: 'h',
        weeklyEfficiency: '📊 Efektivita',
        weeklyBest: '🏆 <b>Nejlepší:</b>',
        weeklyAttention: '⚠️ <b>Vyžadují pozornost:</b>',
        weeklyOverdueOf: 'zpožděných',
        overdueTaskAlert: '⚠️ <b>Úkol zpožděn!</b>',
        minutesShort: 'min',
        processCompleted: '✅ <b>Proces dokončen!</b>',
        processSteps: 'kroků dokončeno',
        langMenuTitle: '🌐 <b>Jazyk oznámení</b>',
        langCurrent: 'Aktuální',
        langChange: '<b>Změnit:</b>',
        hoursShort: 'h',
        newProcessStep: 'Nový krok procesu!',
        stepLabel: 'Krok',
        processProgress: '📊 Průběh procesu',
        completed: 'dokončeno',
        eveningReport: 'Večerní zpráva',
        planVsFact: 'Plán vs Skutečnost',
        eveningDone: 'Dokončeno',
        eveningMissed: 'Nesplněno',
        eveningTomorrow: 'Zítra',
    },
};

/**
 * Повертає переклад для Telegram повідомлень.
 * @param {string} lang  — мова ('ua','ru','en','pl','de','cs')
 * @param {string} key   — ключ з TG_LANG
 * @returns {string}
 */
function tg(lang, key) {
    const l = TG_LANG[lang] || TG_LANG['ua'];
    return l[key] !== undefined ? l[key] : (TG_LANG['ua'][key] || key);
}

/**
 * Визначає мову користувача/компанії з даних Firestore.
 * Повертає код мови або 'ua' за замовчуванням.
 */
function getLang(docData) {
    const lang = (docData && (docData.language || docData.lang)) || 'ua';
    return TG_LANG[lang] ? lang : 'ua';
}

/**
 * Отримує мову з Firestore для конкретного юзера.
 * Спочатку дивиться users/{uid}.language, потім companies/{id}.language.
 */
async function getUserLang(companyId, userId) {
    try {
        const uDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(userId).get();
        if (uDoc.exists) {
            const data = uDoc.data();
            // telegramLanguage — пріоритет (встановлюється через /lang в боті)
            // language — мова інтерфейсу платформи (може перезаписуватись при зміні UI)
            const lang = data.telegramLanguage || data.language;
            if (lang && TG_LANG[lang]) return lang;
        }
        // Fallback: мова на рівні компанії
        const cDoc = await db.collection('companies').doc(companyId).get();
        if (cDoc.exists && cDoc.data().language) {
            const lang = cDoc.data().language;
            return TG_LANG[lang] ? lang : 'ua';
        }
    } catch(e) {
        console.warn('[getLang] Failed:', e.message);
    }
    return 'ua';
}

// ===========================
// TELEGRAM HELPERS
// ===========================
async function sendTelegramMessage(chatId, text, opts = {}) {
    try {
        const response = await fetch(`${getTelegramApi()}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML',
                ...opts
            })
        });
        // P2: перевіряємо HTTP статус — Telegram повертає 4xx/5xx при помилках
        if (!response.ok) {
            const errBody = await response.text().catch(() => '');
            console.error(`[Telegram] HTTP ${response.status} for chat ${chatId}:`, errBody.slice(0, 200));
            return null;
        }
        const json = await response.json();
        if (!json.ok) {
            console.error(`[Telegram] API error for chat ${chatId}:`, json.description || json.error_code);
        }
        return json;
    } catch (error) {
        console.error('[Telegram] Network error:', error.message);
        return null;
    }
}

async function answerCallbackQuery(callbackQueryId, text = '') {
    try {
        await fetch(`${getTelegramApi()}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: text,
                show_alert: !!text
            })
        });
    } catch (e) {
        console.error('answerCallbackQuery error:', e);
    }
}

async function editMessageText(chatId, messageId, text, opts = {}) {
    try {
        await fetch(`${getTelegramApi()}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: text,
                parse_mode: 'HTML',
                ...opts
            })
        });
    } catch (e) {
        console.error('editMessageText error:', e);
    }
}

function taskButtons(taskId, companyId, lang) {
    const l = lang || 'ua';
    return [
        [
            { text: tg(l, 'btnDone'), callback_data: `done:${companyId}:${taskId}` },
            { text: tg(l, 'btnPostpone'), callback_data: `postpone:${companyId}:${taskId}` },
        ],
        [
            { text: tg(l, 'btnDetails'), callback_data: `details:${companyId}:${taskId}` },
            { text: tg(l, 'btnInProgress'), callback_data: `progress:${companyId}:${taskId}` },
        ],
    ];
}

async function sendWithButtons(chatId, text, buttons) {
    return sendTelegramMessage(chatId, text, {
        reply_markup: { inline_keyboard: buttons }
    });
}

// ===========================
// SMART ASSIGN HELPER
// ===========================
async function getSmartAssignee(companyId, funcData) {
    if (!funcData?.assigneeIds?.length) return null;
    if (funcData.assigneeIds.length === 1) return funcData.assigneeIds[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const tasksSnap = await db.collection('companies').doc(companyId)
        .collection('tasks')
        .where('function', '==', funcData.name)
        .where('status', 'in', ['new', 'progress'])
        .get();

    const loads = {};
    funcData.assigneeIds.forEach(uid => { loads[uid] = 0; });

    tasksSnap.docs.forEach(d => {
        const t = d.data();
        if (loads[t.assigneeId] !== undefined) {
            loads[t.assigneeId]++;
            // Overdue weighs double
            if (t.deadlineDate && t.deadlineDate < todayStr) {
                loads[t.assigneeId]++;
            }
        }
    });

    const sorted = Object.entries(loads).sort((a, b) => a[1] - b[1]);
    return sorted[0][0];
}

// ===========================
// 1. НОВЕ ЗАВДАННЯ → Telegram з кнопками
// ===========================
exports.onNewTask = functions
    .region(REGION)
    .runWith({})
    .firestore.document('companies/{companyId}/tasks/{taskId}')
    .onCreate(async (snap, context) => {
        const task = snap.data();
        const { companyId, taskId } = context.params;

        if (task.source === 'telegram') return null;
        if (!task.assigneeId) return null;

        const userDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(task.assigneeId).get();

        if (!userDoc.exists || !userDoc.data().telegramChatId) return null;

        const chatId = userDoc.data().telegramChatId;
        const userLang = await getUserLang(companyId, task.assigneeId);
        const taskType = task.processId ? tg(userLang, 'taskType_process') : (task.regularTaskId ? tg(userLang, 'taskType_regular') : tg(userLang, 'taskType_task'));

        const message = `
${taskType}: <b>${task.title}</b>

${tg(userLang, 'deadline')}: ${task.deadlineDate || '-'} ${task.deadlineTime || ''}
${task.expectedResult ? `\n${tg(userLang, 'expectedResult')}:\n${task.expectedResult}` : ''}
${task.description ? `\n${tg(userLang, 'description')}:\n${task.description.substring(0, 500)}` : ''}
        `.trim();

        return sendWithButtons(chatId, message, taskButtons(taskId, companyId, userLang));
    });

// ===========================
// 2. ЗАВДАННЯ ВИКОНАНО → сповіщення
// ===========================
exports.onTaskCompleted = functions
    .region(REGION)
    .runWith({})
    .firestore.document('companies/{companyId}/tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const { companyId } = context.params;

        if (before.status === after.status || after.status !== 'done') return null;

        const notifyUsers = after.notifyOnComplete || [];
        if (notifyUsers.length === 0) return null;

        const usersToNotify = notifyUsers.filter(uid => uid !== after.assigneeId);

        for (const userId of usersToNotify) {
            const userDoc = await db.collection('companies').doc(companyId)
                .collection('users').doc(userId).get();

            if (!userDoc.exists || !userDoc.data().telegramChatId) continue;

            const chatId = userDoc.data().telegramChatId;
            const userLang = await getUserLang(companyId, userId);
            const message = `
${tg(userLang, 'taskDone')}

📌 ${after.title}
${tg(userLang, 'executor')}: ${after.assigneeName || tg(userLang, 'unknown')}
${tg(userLang, 'deadline')}: ${after.deadlineDate || ''}
            `.trim();

            await sendTelegramMessage(chatId, message);
        }

        return null;
    });

// ===========================
// 3. TELEGRAM WEBHOOK — реєстрація + CALLBACK QUERY HANDLER
// ===========================
exports.telegramWebhook = functions
    .region(REGION)
    .runWith({})
    .https.onRequest(async (req, res) => {
        if (req.method !== 'POST') {
            return res.status(200).send('TALKO Telegram Bot is running!');
        }

        // Secret validation disabled — webhook secured by obscure URL

        const update = req.body;

        // ---- CALLBACK QUERY (кнопки в повідомленнях) ----
        if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;
            const messageId = cb.message.message_id;
            const data = cb.data || ''; // format: "action:companyId:taskId"

            // Валідація callback_data — захист від injection/malformed input
            if (!data || typeof data !== 'string' || data.length > 200) {
                await answerCallbackQuery(cb.id, tg('ua', 'unknownAction'));
                return res.status(200).send('OK');
            }

            // ── setlang callback — окремий обробник ──────────────────────
            if (data.startsWith('setlang:')) {
                const slParts = data.split(':');
                const slCompanyId = slParts[1];
                const slLang = slParts[2];
                const LANG_NAMES_CB = { ua: '🇺🇦 Українська', ru: '🇷🇺 Русский', en: '🇬🇧 English', de: '🇩🇪 Deutsch', cs: '🇨🇿 Čeština', pl: '🇵🇱 Polski' };
                if (!slCompanyId || !slLang || !TG_LANG[slLang]) {
                    await answerCallbackQuery(cb.id, '❌ Невідома мова');
                    return res.status(200).send('OK');
                }
                // Знаходимо юзера по chatId
                let slUid = null;
                const slIdx = await db.collection('telegramIndex').doc('chat_' + chatId.toString()).get();
                if (slIdx.exists) slUid = slIdx.data().userId;
                if (!slUid) {
                    const slSnap = await db.collectionGroup('users').where('telegramChatId', '==', chatId.toString()).limit(1).get();
                    if (!slSnap.empty) slUid = slSnap.docs[0].id;
                }
                if (!slUid) {
                    await answerCallbackQuery(cb.id, tg('ua', 'notConnected'));
                    return res.status(200).send('OK');
                }
                await db.collection('companies').doc(slCompanyId).collection('users').doc(slUid)
                    .update({ telegramLanguage: slLang });
                await answerCallbackQuery(cb.id, `✅ ${LANG_NAMES_CB[slLang]}`);
                await sendTelegramMessage(chatId,
                    tg(slLang, 'langChanged') ||
                    `✅ ${LANG_NAMES_CB[slLang]} — мову встановлено!\n\nВсі наступні сповіщення будуть цією мовою.`
                );
                return res.status(200).send('OK');
            }
            // ─────────────────────────────────────────────────────────────

            const ALLOWED_ACTIONS = ['done', 'postpone', 'progress', 'details'];
            const parts = data.split(':');
            if (parts.length < 3) {
                await answerCallbackQuery(cb.id, tg('ua', 'unknownAction'));
                return res.status(200).send('OK');
            }

            const [action, companyId, taskId] = parts;

            // Перевіряємо action в whitelist
            if (!ALLOWED_ACTIONS.includes(action)) {
                await answerCallbackQuery(cb.id, tg('ua', 'unknownAction'));
                return res.status(200).send('OK');
            }
            // Перевіряємо companyId і taskId — тільки alphanumeric
            if (!/^[a-zA-Z0-9_-]{1,128}$/.test(companyId) || !/^[a-zA-Z0-9_-]{1,128}$/.test(taskId)) {
                await answerCallbackQuery(cb.id, tg('ua', 'invalidParams'));
                return res.status(200).send('OK');
            }

            // Find user by telegramChatId
            let userId = null;
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users')
                .where('telegramChatId', '==', chatId.toString())
                .limit(1).get();

            if (!usersSnap.empty) {
                userId = usersSnap.docs[0].id;
            }

            const taskRef = db.collection('companies').doc(companyId)
                .collection('tasks').doc(taskId);
            const taskDoc = await taskRef.get();

            if (!taskDoc.exists) {
                await answerCallbackQuery(cb.id, tg('ua', 'taskNotFound'));
                return res.status(200).send('OK');
            }

            const task = taskDoc.data();

            // ── TASK-LEVEL AUTHORIZATION ─────────────────────
            if (userId) {
                const isAssignee = task.assigneeId === userId;
                const isCreator = task.creatorId === userId;
                const isCoExecutor = (task.coExecutorIds || []).includes(userId);
                // Перевіряємо чи юзер manager/owner
                const userDoc = await db.collection('companies').doc(companyId)
                    .collection('users').doc(userId).get();
                const userRole = userDoc.exists ? userDoc.data().role : null;
                const isManager = userRole === 'owner' || userRole === 'manager';

                if (!isAssignee && !isCreator && !isCoExecutor && !isManager) {
                    console.warn('[Webhook] Unauthorized task action:', userId, '->', taskId);
                    await answerCallbackQuery(cb.id, tg('ua', 'noPermission'));
                    return res.status(200).send('OK');
                }
            }

            // Визначаємо мову користувача для callback відповідей
            let cbLang = 'ua';
            if (userId) {
                try {
                    cbLang = await getUserLang(companyId, userId);
                } catch(e) { /* fallback to ua */ }
            }

            try {
                if (action === 'done') {
                    // ✅ Завершити задачу — з перевіркою requireReview
                    if (task.requireReview && task.creatorId && task.creatorId !== userId) {
                        await taskRef.update({
                            status: 'review',
                            completedAt: admin.firestore.FieldValue.serverTimestamp(),
                            completedBy: userId,
                            completionSource: 'telegram'
                        });
                        await editMessageText(chatId, messageId,
                            `${tg(cbLang, 'taskSentForReview')}\n\n📌 ${task.title}`
                        );
                        await answerCallbackQuery(cb.id, tg(cbLang, 'cbSentForReview'));
                    } else {
                    await taskRef.update({
                        status: 'done',
                        completedAt: admin.firestore.FieldValue.serverTimestamp(),
                        completedBy: userId,
                        completionSource: 'telegram'
                    });

                    await editMessageText(chatId, messageId,
                        `${tg(cbLang, 'taskDone')}\n\n📌 ${task.title}\n⏰ ${new Date().toLocaleString('uk-UA')}`
                    );
                    await answerCallbackQuery(cb.id, tg(cbLang, 'cbTaskDone'));
                    } // end else (no requireReview)

                } else if (action === 'postpone') {
                    // 🔄 Перенести на +1 день
                    let newDate = task.deadlineDate;
                    if (newDate) {
                        const d = new Date(newDate + 'T12:00:00');
                        d.setDate(d.getDate() + 1);
                        newDate = d.toISOString().split('T')[0];
                    } else {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        newDate = d.toISOString().split('T')[0];
                    }

                    await taskRef.update({
                        deadlineDate: newDate,
                        deadline: admin.firestore.Timestamp.fromDate(
                            new Date(newDate + 'T' + (task.deadlineTime || '18:00') + ':00')
                        ),
                        overdueNotified: false,
                        sentReminders: []
                    });

                    // Decision log
                    if (userId) {
                        await db.collection('companies').doc(companyId)
                            .collection('decisions').add({
                                type: 'deadline_change',
                                details: {
                                    taskId, taskTitle: task.title,
                                    from: task.deadlineDate, to: newDate,
                                    source: 'telegram'
                                },
                                date: new Date().toISOString().split('T')[0],
                                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                                userId
                            }).catch(() => {});
                    }

                    await editMessageText(chatId, messageId,
                        `${tg(cbLang, 'taskPostponed')}\n\n📌 ${task.title}\n${tg(cbLang, 'newDeadline')}: ${newDate}`,
                        { reply_markup: { inline_keyboard: taskButtons(taskId, companyId, cbLang) } }
                    );
                    await answerCallbackQuery(cb.id, `${tg(cbLang, 'cbPostponed')} ${newDate}`);

                } else if (action === 'progress') {
                    // 🚀 В роботу
                    if (task.status === 'new') {
                        await taskRef.update({ status: 'progress' });
                    }

                    await editMessageText(chatId, messageId,
                        `${tg(cbLang, 'taskInProgress')}\n\n📌 ${task.title}\n${tg(cbLang, 'deadline')}: ${task.deadlineDate || '-'} ${task.deadlineTime || ''}`,
                        { reply_markup: { inline_keyboard: taskButtons(taskId, companyId, cbLang) } }
                    );
                    await answerCallbackQuery(cb.id, tg(cbLang, 'cbInProgress'));

                } else if (action === 'details') {
                    // 📎 Показати деталі
                    let details = `📎 <b>${task.title}</b>\n\n`;
                    details += `${tg(cbLang, 'deadline')}: ${task.deadlineDate || '-'} ${task.deadlineTime || ''}\n`;
                    details += `${tg(cbLang, 'status')}: ${task.status}\n`;
                    details += `${tg(cbLang, 'priority')}: ${task.priority || 'medium'}\n`;
                    if (task.function) details += `${tg(cbLang, 'function')}: ${task.function}\n`;
                    if (task.expectedResult) details += `\n${tg(cbLang, 'expectedResult')}:\n${task.expectedResult}\n`;
                    if (task.description) details += `\n${tg(cbLang, 'description')}:\n${task.description.substring(0, 800)}\n`;
                    if (task.processObject) details += `\n${tg(cbLang, 'object')}: ${task.processObject}\n`;

                    await sendTelegramMessage(chatId, details);
                    await answerCallbackQuery(cb.id);
                }
            } catch (err) {
                console.error('Callback error:', err);
                await answerCallbackQuery(cb.id, tg('ua', 'errorPrefix') + err.message);
            }

            return res.status(200).send('OK');
        }

        // ---- TEXT MESSAGES (реєстрація) ----
        if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            const userId = update.message.from.id;

            if (text.startsWith('/start')) {
                const parts = text.split(' ');
                if (parts.length > 1) {
                    const registrationCode = parts[1];

                    // Lookup via telegramIndex for fast O(1) access without collectionGroup
                    const idxDoc = await db.collection('telegramIndex').doc('code_' + registrationCode).get();
                    let cgUsersSnap = { empty: true, docs: [] };
                    if (idxDoc.exists) {
                        const { companyId: cId, userId: uId } = idxDoc.data();
                        const uDoc = await db.collection('companies').doc(cId).collection('users').doc(uId).get();
                        if (uDoc.exists) cgUsersSnap = { empty: false, docs: [uDoc] };
                    }
                    // Fallback: collectionGroup query if telegramIndex not found
                    if (cgUsersSnap.empty) {
                        cgUsersSnap = await db.collectionGroup('users')
                            .where('telegramCode', '==', registrationCode).limit(1).get();
                    }

                    if (!cgUsersSnap.empty) {
                        const userDoc = cgUsersSnap.docs[0];
                        await userDoc.ref.update({
                            telegramChatId: chatId.toString(),
                            telegramUserId: userId.toString(),
                            telegramCode: null
                        });
                        // Write to telegramIndex for fast future lookups
                        const cIdForIdx = userDoc.ref.parent.parent.id;
                        const uIdForIdx = userDoc.id;
                        await db.collection('telegramIndex').doc('chat_' + chatId.toString()).set({
                            companyId: cIdForIdx, userId: uIdForIdx,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });

                        const connectedUserLang = await getUserLang(cIdForIdx, uIdForIdx);
                        await sendTelegramMessage(chatId, tg(connectedUserLang, 'connectedSuccess'));
                        return res.status(200).send('OK');
                    }

                    await sendTelegramMessage(chatId, tg('ua', 'codeNotFound'));
                } else {
                    await sendTelegramMessage(chatId, tg('ua', 'welcome'));
                }
            } else if (text === '/today' || text === '/overdue') {
                // Lookup user by telegramChatId
                let userCompanyId = null;
                let userUid = null;

                // 1. Try telegramIndex first
                const chatIdxDoc = await db.collection('telegramIndex').doc('chat_' + chatId.toString()).get();
                if (chatIdxDoc.exists) {
                    const d = chatIdxDoc.data();
                    if (d.companyId && d.userId) {
                        userCompanyId = d.companyId;
                        userUid = d.userId;
                    }
                }
                // 2. Fallback: collectionGroup by telegramChatId
                if (!userCompanyId || !userUid) {
                    const snap = await db.collectionGroup('users')
                        .where('telegramChatId', '==', chatId.toString()).limit(1).get();
                    if (!snap.empty) {
                        const doc = snap.docs[0];
                        userUid = doc.id;
                        userCompanyId = doc.ref.parent.parent.id;
                    }
                }

                if (userCompanyId && userUid) {
                    const companyId = userCompanyId;
                    const uid = userUid;
                    // Визначаємо мову юзера для /today /overdue відповідей
                    let cmdLang = 'ua';
                    try {
                        cmdLang = await getUserLang(companyId, uid);
                    } catch(e) { /* fallback ua */ }
                    if (true) { // scope wrapper
                    const todayStr = new Date().toISOString().split('T')[0];

                    const tasksSnap = await db.collection('companies').doc(companyId)
                        .collection('tasks')
                        .where('assigneeId', '==', uid)
                        .where('status', 'in', ['new', 'progress'])
                        .get();

                    const filtered = [];
                    tasksSnap.docs.forEach(d => {
                        const t = { id: d.id, ...d.data() };
                        if (text === '/today' && t.deadlineDate === todayStr) filtered.push(t);
                        if (text === '/overdue' && t.deadlineDate && t.deadlineDate < todayStr) filtered.push(t);
                    });

                    // ── CRM: угоди на сьогоднішній або прострочений контакт ──
                    let crmDealsToday = [];
                    if (text === '/today' || text === '/overdue') {
                        try {
                            const weekAgoDate = new Date();
                            weekAgoDate.setDate(weekAgoDate.getDate() - 7);
                            const weekAgoStr = weekAgoDate.toISOString().split('T')[0];

                            if (text === '/today') {
                                const crmSnap = await db.collection('companies').doc(companyId)
                                    .collection('crm_deals')
                                    .where('nextContactDate', '==', todayStr)
                                    .where('assigneeId', '==', uid)
                                    .get();
                                const yesterday = new Date();
                                yesterday.setDate(yesterday.getDate() - 1);
                                const yesterdayStr = yesterday.toISOString().split('T')[0];
                                const overdueSnap = await db.collection('companies').doc(companyId)
                                    .collection('crm_deals')
                                    .where('nextContactDate', '>=', yesterdayStr)
                                    .where('nextContactDate', '<', todayStr)
                                    .where('assigneeId', '==', uid)
                                    .get();
                                const allDealDocs = [...crmSnap.docs, ...overdueSnap.docs];
                                crmDealsToday = allDealDocs
                                    .map(d => ({ id: d.id, ...d.data() }))
                                    .filter(d => d.stage !== 'won' && d.stage !== 'lost');
                            } else {
                                // /overdue — прострочені контакти за останній тиждень
                                const overdueSnap = await db.collection('companies').doc(companyId)
                                    .collection('crm_deals')
                                    .where('nextContactDate', '>=', weekAgoStr)
                                    .where('nextContactDate', '<', todayStr)
                                    .where('assigneeId', '==', uid)
                                    .get();
                                crmDealsToday = overdueSnap.docs
                                    .map(d => ({ id: d.id, ...d.data() }))
                                    .filter(d => d.stage !== 'won' && d.stage !== 'lost');
                            }
                        } catch(crmErr) {
                            console.warn('[TG /today /overdue] CRM fetch error:', crmErr.message);
                        }
                    }

                    if (filtered.length === 0 && crmDealsToday.length === 0) {
                        await sendTelegramMessage(chatId, text === '/today'
                            ? tg(cmdLang, 'noTasksAndDeals')
                            : tg(cmdLang, 'noOverdue'));
                    } else {
                        // Задачі
                        if (filtered.length > 0) {
                            await sendTelegramMessage(chatId,
                                `${text === '/today' ? tg(cmdLang, 'tasksToday') : tg(cmdLang, 'tasksOverdue')}: <b>${filtered.length}</b>`);
                            for (const t of filtered.slice(0, 10)) {
                                const pr = t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡';
                                await sendWithButtons(chatId,
                                    `${pr} <b>${t.title}</b>\n📅 ${t.deadlineDate} ${t.deadlineTime || ''}`,
                                    taskButtons(t.id, companyId, cmdLang)
                                );
                            }
                            if (filtered.length > 10) {
                                await sendTelegramMessage(chatId, `${tg(cmdLang, 'moreItems')} ${filtered.length - 10}`);
                            }
                        } else if (text === '/today') {
                            await sendTelegramMessage(chatId, tg(cmdLang, 'noTasksToday'));
                        }

                        // CRM угоди
                        if (crmDealsToday.length > 0) {
                            await sendTelegramMessage(chatId,
                                `${tg(cmdLang, 'crmContactToday')}: ${crmDealsToday.length} ${tg(cmdLang, 'crmDeals')}`);
                            for (const deal of crmDealsToday.slice(0, 8)) {
                                const isOverdue = deal.nextContactDate < todayStr;
                                const amountStr = deal.amount ? ` · ${Number(deal.amount).toLocaleString()} €` : '';
                                const overdueStr = isOverdue ? `\n${tg(cmdLang, 'crmOverdue')} ${deal.nextContactDate})` : '';
                                await sendTelegramMessage(chatId,
                                    `${isOverdue ? '🔴' : '🟡'} <b>${deal.clientName || deal.title || 'Угода'}</b>${amountStr}` +
                                    `\n${tg(cmdLang, 'crmStage')}: ${deal.stage}` +
                                    `\n${tg(cmdLang, 'crmContact')}: ${deal.nextContactDate}` +
                                    `${deal.note ? '\n📝 ' + deal.note.slice(0, 80) : ''}` +
                                    overdueStr
                                );
                            }
                            if (crmDealsToday.length > 8) {
                                await sendTelegramMessage(chatId, `${tg(cmdLang, 'moreItems')} ${crmDealsToday.length - 8} ${tg(cmdLang, 'crmMoreDeals')}`);
                            }
                        }
                    }
                    } // end scope wrapper
                } // end if cgUserSnap
            } else if (text === '/help') {
                // /help — показуємо меню мовою юзера
                let helpLang = 'ua';
                try {
                    const hlIdxDoc = await db.collection('telegramIndex').doc('chat_' + chatId.toString()).get();
                    if (hlIdxDoc.exists) {
                        helpLang = await getUserLang(hlIdxDoc.data().companyId, hlIdxDoc.data().userId);
                    }
                } catch(e) {}
                await sendTelegramMessage(chatId, tg(helpLang, 'helpMenu'));
            } else if (text.startsWith('/lang')) {
                // /lang — встановити мову сповіщень прямо з Telegram
                // Використання: /lang de  або  /lang ua  або  /lang en
                const parts = text.trim().split(/\s+/);
                const requestedLang = parts[1] ? parts[1].toLowerCase() : null;
                const LANG_NAMES = { ua: '🇺🇦 Українська', ru: '🇷🇺 Русский', en: '🇬🇧 English', de: '🇩🇪 Deutsch', cs: '🇨🇿 Čeština', pl: '🇵🇱 Polski' };

                // Знаходимо юзера
                let langCompanyId = null, langUid = null;
                const langIdxDoc = await db.collection('telegramIndex').doc('chat_' + chatId.toString()).get();
                if (langIdxDoc.exists) {
                    langCompanyId = langIdxDoc.data().companyId;
                    langUid = langIdxDoc.data().userId;
                }
                if (!langCompanyId) {
                    const ls = await db.collectionGroup('users').where('telegramChatId', '==', chatId.toString()).limit(1).get();
                    if (!ls.empty) { langUid = ls.docs[0].id; langCompanyId = ls.docs[0].ref.parent.parent.id; }
                }

                if (!langCompanyId) {
                    await sendTelegramMessage(chatId, tg('ua', 'notConnected'));
                } else if (!requestedLang || !TG_LANG[requestedLang]) {
                    // Показуємо поточну мову і inline кнопки для вибору
                    const curLang = await getUserLang(langCompanyId, langUid);
                    const langButtons = [
                        [
                            { text: '🇺🇦 Українська', callback_data: `setlang:${langCompanyId}:ua` },
                            { text: '🇷🇺 Русский',     callback_data: `setlang:${langCompanyId}:ru` },
                        ],
                        [
                            { text: '🇬🇧 English',     callback_data: `setlang:${langCompanyId}:en` },
                            { text: '🇩🇪 Deutsch',     callback_data: `setlang:${langCompanyId}:de` },
                        ],
                        [
                            { text: '🇨🇿 Čeština',     callback_data: `setlang:${langCompanyId}:cs` },
                            { text: '🇵🇱 Polski',      callback_data: `setlang:${langCompanyId}:pl` },
                        ],
                    ];
                    await sendWithButtons(chatId,
                        `${tg(curLang, 'langMenuTitle')}\n\n${tg(curLang, 'langCurrent')}: ${LANG_NAMES[curLang] || curLang}\n\n${tg(curLang, 'langChange')}`,
                        langButtons
                    );
                } else {
                    // Зберігаємо нову мову в Firestore (telegramLanguage — окреме поле)
                    // НЕ перезаписує мову інтерфейсу (language) яка керується платформою
                    await db.collection('companies').doc(langCompanyId)
                        .collection('users').doc(langUid)
                        .update({ telegramLanguage: requestedLang });
                    await sendTelegramMessage(chatId,
                        tg(requestedLang, 'langChanged') ||
                        `✅ ${LANG_NAMES[requestedLang]} — мову встановлено!\n\nВсі наступні сповіщення будуть цією мовою.`
                    );
                }
            } else if (text === '/weekly') {
                // Тижневий звіт для поточного користувача
                let wCompanyId = null, wUid = null;
                const wIdxDoc = await db.collection('telegramIndex').doc('chat_' + chatId.toString()).get();
                if (wIdxDoc.exists) { const d = wIdxDoc.data(); wCompanyId = d.companyId; wUid = d.userId; }
                if (!wCompanyId) {
                    const ws = await db.collectionGroup('users').where('telegramChatId', '==', chatId.toString()).limit(1).get();
                    if (!ws.empty) { wUid = ws.docs[0].id; wCompanyId = ws.docs[0].ref.parent.parent.id; }
                }
                if (wCompanyId && wUid) {
                    const now = new Date();
                    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    const todayStr = now.toISOString().split('T')[0];
                    // FIX: фільтруємо тільки задачі за тиждень (done за тиждень, active з дедлайном за тиждень)
                    const snap = await db.collection('companies').doc(wCompanyId).collection('tasks')
                        .where('assigneeId', '==', wUid)
                        .where('status', 'in', ['done', 'new', 'progress', 'review'])
                        .get();
                    let done = 0, inProgress = 0, overdue = 0, review = 0;
                    snap.docs.forEach(d => {
                        const t = d.data();
                        // Done за тиждень — по completedAt або deadlineDate
                        if (t.status === 'done') {
                            const cd = t.completedAt?.toDate ? t.completedAt.toDate().toISOString().split('T')[0]
                                : (t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : t.deadlineDate);
                            if (cd && cd >= weekAgo) done++;
                        } else if (t.status === 'review') {
                            review++;
                        } else if (t.status === 'progress') {
                            inProgress++;
                        }
                        // Прострочені — дедлайн в межах тижня або раніше
                        if (t.deadlineDate && t.deadlineDate < todayStr && t.deadlineDate >= weekAgo
                            && t.status !== 'done' && t.status !== 'review') overdue++;
                    });
                    const wLang = await getUserLang(wCompanyId, wUid);
                    const weekAgoFormatted = weekAgo.split('-').reverse().join('.');
                    const todayFormatted = todayStr.split('-').reverse().join('.');
                    await sendTelegramMessage(chatId,
                        `${tg(wLang, 'weeklyReport')} (${weekAgoFormatted} — ${todayFormatted})\n\n` +
                        `✅ Виконано: <b>${done}</b>\n` +
                        `🔄 В роботі: <b>${inProgress}</b>\n` +
                        (review > 0 ? `🔍 На перевірці: <b>${review}</b>\n` : '') +
                        (overdue > 0 ? `⚠️ Прострочено: <b>${overdue}</b>\n` : '✅ Прострочених немає\n')
                    );
                } else {
                    await sendTelegramMessage(chatId, tg('ua', 'notConnected'));
                }
            } else if (text === '/team') {
                // Знаходимо юзера
                let tCompanyId = null, tUid = null;
                const tIdx = await db.collection('telegramIndex').doc('chat_' + chatId.toString()).get();
                if (tIdx.exists) { const d = tIdx.data(); tCompanyId = d.companyId; tUid = d.userId; }
                if (!tCompanyId) {
                    const ts = await db.collectionGroup('users').where('telegramChatId', '==', chatId.toString()).limit(1).get();
                    if (!ts.empty) { tUid = ts.docs[0].id; tCompanyId = ts.docs[0].ref.parent.parent.id; }
                }
                if (!tCompanyId || !tUid) {
                    await sendTelegramMessage(chatId, tg('ua', 'notConnected'));
                } else {
                    const tUserDoc = await db.collection('companies').doc(tCompanyId).collection('users').doc(tUid).get();
                    const tUserData = tUserDoc.exists ? tUserDoc.data() : {};
                    const tLang = await getUserLang(tCompanyId, tUid);
                    // Перевіряємо роль — owner або manager
                    if (!['owner', 'manager'].includes(tUserData.role)) {
                        await sendTelegramMessage(chatId, tg(tLang, 'teamOnlyForManagers'));
                    } else {
                        const todayStr = new Date().toISOString().split('T')[0];
                        // Завантажуємо всіх юзерів компанії
                        const usersSnap = await db.collection('companies').doc(tCompanyId).collection('users').get();
                        const teamUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                            .filter(u => ['owner','manager','employee'].includes(u.role));

                        // Завантажуємо задачі компанії
                        const tasksSnap = await db.collection('companies').doc(tCompanyId).collection('tasks')
                            .where('status', 'in', ['new', 'progress', 'review', 'done'])
                            .limit(500).get();

                        // Статистика по кожному юзеру
                        const stats = {};
                        teamUsers.forEach(u => {
                            stats[u.id] = { name: u.name || u.email || u.id, done: 0, inProgress: 0, overdue: 0, review: 0 };
                        });
                        tasksSnap.docs.forEach(d => {
                            const t = d.data();
                            if (!t.assigneeId || !stats[t.assigneeId]) return;
                            const s = stats[t.assigneeId];
                            if (t.status === 'done') s.done++;
                            else if (t.status === 'progress') s.inProgress++;
                            else if (t.status === 'review') s.review++;
                            if (t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done' && t.status !== 'review') s.overdue++;
                        });

                        const rows = Object.values(stats)
                            .filter(s => s.done + s.inProgress + s.overdue + s.review > 0)
                            .sort((a, b) => b.done - a.done);

                        let msg = `${tg(tLang, 'teamReport')}\n📅 ${todayStr}\n\n`;
                        if (!rows.length) {
                            msg += 'Задач немає.';
                        } else {
                            rows.forEach(s => {
                                const status = s.overdue > 0 ? '🔴' : s.inProgress > 0 ? '🟡' : '🟢';
                                msg += `${status} <b>${s.name}</b>\n`;
                                if (s.done)       msg += `  ✅ Виконано: ${s.done}\n`;
                                if (s.inProgress) msg += `  🔄 В роботі: ${s.inProgress}\n`;
                                if (s.review)     msg += `  🔍 На перевірці: ${s.review}\n`;
                                if (s.overdue)    msg += `  ⚠️ Прострочено: ${s.overdue}\n`;
                                msg += '\n';
                            });
                        }
                        await sendTelegramMessage(chatId, msg.trim());
                    }
                }
            } else if (text.startsWith('/task') || text.startsWith('/завдання')) {
                // Lookup відправника
                let senderCid = null, senderUid = null;
                const sIdx = await db.collection('telegramIndex').doc('chat_' + chatId.toString()).get();
                if (sIdx.exists) { const d = sIdx.data(); senderCid = d.companyId; senderUid = d.userId; }
                if (!senderCid || !senderUid) {
                    const snap = await db.collectionGroup('users').where('telegramChatId', '==', chatId.toString()).limit(1).get();
                    if (!snap.empty) { senderUid = snap.docs[0].id; senderCid = snap.docs[0].ref.parent.parent.id; }
                }
                if (!senderCid || !senderUid) {
                    await sendTelegramMessage(chatId, '⚠️ Ваш Telegram не підключений до системи.\n\nВідкрийте профіль у TALKO → «Підключити Telegram».');
                } else {
                    const cmdLang = await getUserLang(senderCid, senderUid).catch(() => 'ua');
                    const cmd = text.replace(/^\/task\s*|^\/завдання\s*/i, '').trim();
                    if (!cmd) {
                        await sendTelegramMessage(chatId,
                            '📝 <b>Формат команди:</b>\n\n' +
                            '<code>/task @ім\'я Назва завдання | 10.04.2026</code>\n\n' +
                            'Приклади:\n' +
                            '<code>/task @Петренко Підготувати кошторис | 10.04.2026</code>\n' +
                            '<code>/task @Іванов Зателефонувати клієнту</code>\n\n' +
                            'Дата необов\'язкова. Без @ім\'я — ставиться собі.\n/help — всі команди');
                    } else {
                        // Парсинг: @assignee, назва, дата після |
                        let assigneeQ = '', taskTitle = cmd, deadline = '';
                        const pp = cmd.split('|');
                        if (pp.length >= 2) {
                            taskTitle = pp[0].trim();
                            const rd = pp[1].trim();
                            const dm = rd.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})/);
                            if (dm) {
                                const y = dm[3].length === 2 ? '20' + dm[3] : dm[3];
                                deadline = `${y}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`;
                            } else if (/^\d{4}-\d{2}-\d{2}$/.test(rd)) deadline = rd;
                        }
                        const am = taskTitle.match(/^@(\S+)\s*(.*)/);
                        if (am) { assigneeQ = am[1].toLowerCase(); taskTitle = am[2].trim() || am[1]; }

                        if (!taskTitle) {
                            await sendTelegramMessage(chatId, '❌ Вкажіть назву завдання.');
                        } else {
                            // Знаходимо виконавця
                            let aId = senderUid, aName = 'Я';
                            if (assigneeQ) {
                                const usSnap = await db.collection('companies').doc(senderCid).collection('users').get();
                                const found = usSnap.docs.find(d => {
                                    const u = d.data();
                                    const n = (u.name || u.email || '').toLowerCase();
                                    const tg = (u.telegramUsername || '').toLowerCase().replace('@', '');
                                    return n.includes(assigneeQ) || tg === assigneeQ || d.id === assigneeQ;
                                });
                                if (!found) {
                                    await sendTelegramMessage(chatId, `❌ Співробітника <b>"${assigneeQ}"</b> не знайдено.\n\nПеревірте ім'я або спробуйте іншу частину імені.`);
                                    return res.status(200).send('OK');
                                }
                                aId = found.id;
                                const fd = found.data();
                                aName = fd.name || fd.email || assigneeQ;
                            }

                            // Ім'я відправника
                            let crName = 'Telegram';
                            const crDoc = await db.collection('companies').doc(senderCid).collection('users').doc(senderUid).get();
                            if (crDoc.exists) { const cd = crDoc.data(); crName = cd.name || cd.email || crName; }

                            // Створюємо задачу
                            const today = new Date().toISOString().split('T')[0];
                            const taskData = {
                                title: taskTitle,
                                status: 'new',
                                priority: 'medium',
                                assigneeId: aId,
                                assigneeName: aName,
                                creatorId: senderUid,
                                creatorName: crName,
                                source: 'telegram',
                                createdDate: today,
                                pinned: false,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            };
                            if (deadline) {
                                taskData.deadlineDate = deadline;
                                taskData.deadline = deadline + 'T18:00';
                                taskData.deadlineTime = '18:00';
                            }
                            const taskRef = await db.collection('companies').doc(senderCid).collection('tasks').add(taskData);

                            // Підтвердження відправнику
                            const dl = deadline ? `\n📅 Дедлайн: <b>${deadline}</b>` : '';
                            await sendTelegramMessage(chatId,
                                `✅ <b>Завдання створено!</b>\n\n📋 <b>${taskTitle}</b>\n👤 Виконавець: <b>${aName}</b>${dl}\n\nЗавдання з'явиться в «Мій день» виконавця.`);

                            // Сповіщення виконавцю (якщо інший)
                            if (aId !== senderUid) {
                                const aDoc = await db.collection('companies').doc(senderCid).collection('users').doc(aId).get();
                                if (aDoc.exists) {
                                    const au = aDoc.data();
                                    if (au.telegramChatId) {
                                        await sendTelegramMessage(au.telegramChatId,
                                            `📋 <b>Нове завдання від ${crName}:</b>\n\n<b>${taskTitle}</b>${dl}\n\nВідкрийте TALKO → «Мій день».`);
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (text === '/connect') {
                await sendTelegramMessage(chatId, tg('ua', 'connectHint'));
            }
        }

        return res.status(200).send('OK');
    });

// ===========================
// 4. LEAD WEBHOOK
// ===========================
exports.leadWebhook = functions
    .region(REGION)
    .runWith({})
    .https.onRequest(async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') return res.status(200).send('');
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        try {
            const { companyId, apiKey, name, phone, email, source, message, processTemplate, city, country, niche, utmSource, utmCampaign, adId } = req.body;
            if (!companyId) return res.status(400).json({ error: 'companyId is required' });

            const companyDoc = await db.collection('companies').doc(companyId).get();
            if (!companyDoc.exists) return res.status(404).json({ error: 'Company not found' });

            const companyData = companyDoc.data();
            // P0 SEC FIX: apiKey обов'язковий — якщо компанія не налаштувала webhook → 403
            if (!companyData.webhookApiKey) {
                return res.status(403).json({ error: 'Webhook not configured. Set webhookApiKey in company settings first.' });
            }
            if (companyData.webhookApiKey !== apiKey) {
                return res.status(401).json({ error: 'Invalid API key' });
            }

            const now = new Date();
            const leadRef = await db.collection('companies').doc(companyId)
                .collection('leads').add({
                    name: name || 'Невідомий',
                    phone: phone || '', email: email || '',
                    source: source || 'Сайт', message: message || '',
                    city: city || '',
                    country: country || '',
                    niche: niche || '',
                    utmSource: utmSource || '',
                    utmCampaign: utmCampaign || '',
                    adId: adId || '',
                    status: 'new',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

            let templateToUse = null;
            const templateName = processTemplate || 'Обробка ліда';
            const templatesSnap = await db.collection('companies').doc(companyId)
                .collection('processTemplates').where('name', '==', templateName).limit(1).get();
            if (!templatesSnap.empty) {
                templateToUse = { id: templatesSnap.docs[0].id, ...templatesSnap.docs[0].data() };
            }

            let processId = null;
            const clientName = name || phone || 'Новий лід';

            if (templateToUse && templateToUse.steps && templateToUse.steps.length > 0) {
                const processRef = await db.collection('companies').doc(companyId)
                    .collection('processes').add({
                        name: `${templateToUse.name} - ${clientName}`,
                        templateId: templateToUse.id,
                        objectName: clientName,
                        leadId: leadRef.id,
                        status: 'active',
                        currentStep: 0,
                        stepResults: [],
                        history: [],
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        createdBy: 'webhook'
                    });
                processId = processRef.id;

                const firstStep = templateToUse.steps[0];
                const funcsSnap = await db.collection('companies').doc(companyId)
                    .collection('functions').where('name', '==', firstStep.function).limit(1).get();

                let assigneeId = null, assigneeName = '';
                if (!funcsSnap.empty) {
                    const funcData = { id: funcsSnap.docs[0].id, ...funcsSnap.docs[0].data() };
                    // Smart assign
                    if (firstStep.smartAssign !== false && funcData.assigneeIds?.length > 1) {
                        assigneeId = await getSmartAssignee(companyId, funcData);
                    } else {
                        assigneeId = funcData.assigneeIds?.[0] || null;
                    }
                    if (assigneeId) {
                        const uDoc = await db.collection('companies').doc(companyId)
                            .collection('users').doc(assigneeId).get();
                        if (uDoc.exists) assigneeName = uDoc.data().name || uDoc.data().email || '';
                    }
                }

                const deadline = new Date(now.getTime() + (firstStep.slaMinutes || 15) * 60 * 1000);

                // Context-rich instruction
                let instruction = firstStep.instruction || '';
                instruction = `[${clientName}]\n📞 ${phone || '-'}\n📧 ${email || '-'}\n💬 ${message || '-'}\n🔗 ${source || 'Сайт'}\n\n` + instruction;
                if (firstStep.expectedResult) instruction += `\n\n📋 Очікуваний результат: ${firstStep.expectedResult}`;
                if (firstStep.controlQuestion) instruction += `\n❓ Контрольне питання: ${firstStep.controlQuestion}`;

                await db.collection('companies').doc(companyId)
                    .collection('tasks').add({
                        title: `[${templateToUse.name}] ${firstStep.title || firstStep.function} - ${clientName}`,
                        function: firstStep.function,
                        assigneeId, assigneeName,
                        description: instruction,
                        instruction: instruction,
                        expectedResult: firstStep.expectedResult || 'Зв\'язатися з клієнтом',
                        deadlineDate: deadline.toISOString().split('T')[0],
                        deadlineTime: deadline.toTimeString().slice(0, 5),
                        deadline: admin.firestore.Timestamp.fromDate(deadline),
                        status: 'new', priority: 'high',
                        processId, processStep: 0,
                        processObject: clientName,
                        leadId: leadRef.id,
                        requireReview: firstStep.checkpoint || false,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        isAutoGenerated: true,
                        escalationEnabled: true,
                        escalationMinutes: firstStep.slaMinutes || 15
                    });
            } else {
                // Fallback: create simple task
                const funcsSnap = await db.collection('companies').doc(companyId)
                    .collection('functions').limit(1).get();

                let assigneeId = null, assigneeName = '', functionName = 'Адміністрування';
                if (!funcsSnap.empty) {
                    const funcData = funcsSnap.docs[0].data();
                    functionName = funcData.name;
                    if (funcData.assigneeIds?.length) {
                        assigneeId = funcData.assigneeIds[0];
                        const uDoc = await db.collection('companies').doc(companyId)
                            .collection('users').doc(assigneeId).get();
                        if (uDoc.exists) assigneeName = uDoc.data().name || uDoc.data().email || '';
                    }
                }

                const deadline = new Date(now.getTime() + 15 * 60 * 1000);

                await db.collection('companies').doc(companyId)
                    .collection('tasks').add({
                        title: `📞 Зателефонувати — ${clientName}`,
                        function: functionName,
                        assigneeId, assigneeName,
                        description: `Новий лід з сайту!\n\n📞 ${phone || '-'}\n📧 ${email || '-'}\n👤 ${name || '-'}\n💬 ${message || '-'}\n🔗 ${source || 'Сайт'}`,
                        expectedResult: 'Зв\'язатися з клієнтом протягом 15 хвилин',
                        deadlineDate: deadline.toISOString().split('T')[0],
                        deadlineTime: deadline.toTimeString().slice(0, 5),
                        deadline: admin.firestore.Timestamp.fromDate(deadline),
                        status: 'new', priority: 'high',
                        leadId: leadRef.id,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        isAutoGenerated: true,
                        escalationEnabled: true,
                        escalationMinutes: 15
                    });
            }

            // Notify managers
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users').where('role', 'in', ['owner', 'manager']).get();

            for (const userDoc of usersSnap.docs) {
                const userData = userDoc.data();
                if (userData.telegramChatId) {
                    await sendTelegramMessage(userData.telegramChatId,
                        `🔔 <b>Новий лід!</b>\n\n👤 ${name || 'Невідомий'}\n📞 ${phone || '-'}\n📧 ${email || '-'}\n🔗 ${source || 'Сайт'}\n${message ? `💬 ${message}` : ''}\n\n⚡ Зателефонуйте протягом 15 хвилин!`
                    );
                }
            }

            // ── CRM: створити клієнта + угоду ──────────────────
            try {
                const companyRef = db.collection('companies').doc(companyId);

                // 1. Знайти або створити клієнта в crm_clients
                let crmClientId = null;
                const clientQuery = phone
                    ? companyRef.collection('crm_clients').where('phone', '==', phone).limit(1)
                    : email
                        ? companyRef.collection('crm_clients').where('email', '==', email).limit(1)
                        : null;

                if (clientQuery) {
                    const existingSnap = await clientQuery.get();
                    if (!existingSnap.empty) {
                        crmClientId = existingSnap.docs[0].id;
                        // Оновити якщо є нові дані
                        await companyRef.collection('crm_clients').doc(crmClientId).set({
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            ...(name && { name }),
                            ...(phone && { phone }),
                            ...(email && { email }),
                        }, { merge: true });
                    }
                }

                if (!crmClientId) {
                    const newClient = await companyRef.collection('crm_clients').add({
                        name: name || phone || email || 'Новий лід',
                        phone: phone || '',
                        email: email || '',
                        source: source || 'Сайт',
                        city: city || '',
                        country: country || '',
                        niche: niche || '',
                        leadId: leadRef.id,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    crmClientId = newClient.id;
                }

                // 2. Отримати першу воронку компанії (або дефолтну)
                let pipelineId = null, firstStageId = null;
                const pipesSnap = await companyRef.collection('settings').doc('crm').get();
                const crmSettings = pipesSnap.exists ? pipesSnap.data() : {};
                if (crmSettings.pipelines && crmSettings.pipelines.length > 0) {
                    const pipe = crmSettings.pipelines[0];
                    pipelineId = pipe.id;
                    firstStageId = pipe.stages?.[0]?.id || null;
                }

                // 3. Створити угоду в crm_deals
                const dealTitle = name
                    ? `${name}${source ? ' — ' + source : ''}`
                    : `Новий лід${source ? ' — ' + source : ''}`;

                await companyRef.collection('crm_deals').add({
                    title: dealTitle,
                    clientName: name || phone || email || 'Невідомий',
                    clientId: crmClientId,
                    phone: phone || '',
                    email: email || '',
                    source: source || 'Сайт',
                    message: message || '',
                    city: city || '',
                    country: country || '',
                    niche: niche || '',
                    utmSource: utmSource || '',
                    utmCampaign: utmCampaign || '',
                    adId: adId || '',
                    stage: firstStageId || 'lead',
                    pipelineId: pipelineId,
                    amount: 0,
                    leadId: leadRef.id,
                    processId: processId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    createdBy: 'webhook',
                });
            } catch (crmErr) {
                // Не ламаємо основний флоу — лід вже збережений
                console.error('[leadWebhook] CRM write error:', crmErr.message);
            }
            // ────────────────────────────────────────────────────

            return res.status(200).json({
                success: true, leadId: leadRef.id, processId,
                message: 'Lead received and process started'
            });

        } catch (error) {
            console.error('Lead webhook error:', error);
            return res.status(500).json({ error: error.message });
        }
    });

// ===========================
// 5. SCHEDULED: ПРОСТРОЧЕНІ + ЕСКАЛАЦІЯ
// ===========================
// ========================
// P2 COST FIX: checkOverdueTasks
// Замість full scan всіх companies — collectionGroup query тільки по задачах
// де overdueNotified = false і deadline вже минув (індексовано)
// Reads: ~O(overdue tasks) замість O(N×M all tasks)
// ========================
exports.checkOverdueTasks = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('every 5 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const nowTimestamp = admin.firestore.Timestamp.fromDate(now);

        // Один collectionGroup query замість N company loops
        const tasksSnap = await db.collectionGroup('tasks')
            .where('status', 'in', ['new', 'progress'])
            .where('overdueNotified', '==', false)
            .where('deadline', '<=', nowTimestamp)
            .limit(200)  // Safety cap — не більше 200 за раз
            .get();

        // Групуємо по companyId для batch reads юзерів
        const byCompany = {};
        tasksSnap.docs.forEach(doc => {
            // companyId з path: companies/{cid}/tasks/{tid}
            const cid = doc.ref.path.split('/')[1];
            if (!byCompany[cid]) byCompany[cid] = [];
            byCompany[cid].push(doc);
        });

        for (const [companyId, taskDocs] of Object.entries(byCompany)) {
            // Завантажуємо менеджерів компанії один раз
            const managersSnap = await db.collection('companies').doc(companyId)
                .collection('users').where('role', 'in', ['owner', 'manager']).get();
            const managers = managersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            for (const taskDoc of taskDocs) {
                const task = taskDoc.data();
                if (!task.deadline) continue;

                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                if (now <= deadline) continue;
                if (task.overdueNotified) continue;

                const overdueMinutes = Math.floor((now - deadline) / (1000 * 60));
                // taskType визначається per-user мовою нижче
                // Notify assignee
                if (task.assigneeId) {
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(task.assigneeId).get();
                    if (userDoc.exists && userDoc.data().telegramChatId) {
                        const assigneeLang = await getUserLang(companyId, task.assigneeId);
                        const assigneeTaskType = task.processId ? tg(assigneeLang, 'taskType_process') : (task.regularTaskId ? tg(assigneeLang, 'taskType_regular') : tg(assigneeLang, 'taskType_task'));
                        await sendWithButtons(userDoc.data().telegramChatId,
                            `${tg(assigneeLang, 'overdueTaskAlert')}\n\n${assigneeTaskType}\n📌 ${task.title}\n⏰ +${overdueMinutes} ${tg(assigneeLang, 'minutesShort')}`,
                            taskButtons(taskDoc.id, companyId, assigneeLang)
                        );
                    }
                }

                // Notify managers (завантажені раніше — без повторного read)
                for (const managerData of managers) {
                    if (managerData.id === task.assigneeId) continue;
                    const d = managerData;
                    if (d.telegramChatId) {
                        const mgrLang = await getUserLang(companyId, managerData.id);
                        await sendWithButtons(d.telegramChatId,
                            `${tg(mgrLang, 'overdueTaskAlert')}\n\n${taskType}\n📌 ${task.title}\n👤 ${task.assigneeName || '-'}\n⏰ +${overdueMinutes} ${tg(mgrLang, 'minutesShort')}`,
                            taskButtons(taskDoc.id, companyId, mgrLang)
                        );
                    }
                }

                await taskDoc.ref.update({
                    overdueNotified: true,
                    overdueNotifiedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Escalation
                if (task.escalationEnabled && task.escalationMinutes) {
                    const escalationTime = new Date(deadline.getTime() + task.escalationMinutes * 60 * 1000);
                    if (now >= escalationTime && !task.escalated) {
                        const newDeadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                        await db.collection('companies').doc(companyId)
                            .collection('tasks').add({
                                title: `🔄 Повторно: ${task.title}`,
                                function: task.function,
                                assigneeId: task.assigneeId, assigneeName: task.assigneeName,
                                description: `⚠️ ЕСКАЛАЦІЯ: Попередня задача не виконана!\n\n${task.description || ''}`,
                                expectedResult: task.expectedResult,
                                deadlineDate: newDeadline.toISOString().split('T')[0],
                                deadlineTime: newDeadline.toTimeString().slice(0, 5),
                                deadline: admin.firestore.Timestamp.fromDate(newDeadline),
                                status: 'new', priority: 'high',
                                processId: task.processId || null,
                                processStep: task.processStep,
                                leadId: task.leadId || null,
                                parentTaskId: taskDoc.id,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                isAutoGenerated: true, isEscalation: true
                            });
                        await taskDoc.ref.update({
                            escalated: true,
                            escalatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }
            }
        }
        return null;
    });

// ===========================
// 6. АВТОПРОСУВАННЯ ПРОЦЕСУ (з Smart Assign + контекст + SLA)
// ===========================
exports.onProcessTaskCompleted = functions
    .region(REGION)
    .runWith({})
    .firestore.document('companies/{companyId}/tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const { companyId, taskId } = context.params;

        if (!after.processId) return null;
        // Тригеримо при: будь-який статус → done (включаючи review → done)
        if (before.status === after.status || after.status !== 'done') return null;
        // NOTE: review→done handled here — якщо requireReview=true, задача йде review→done
        // через acceptReviewTask, і тільки тоді просуваємо процес

        const processRef = db.collection('companies').doc(companyId)
            .collection('processes').doc(after.processId);

        // Transaction to prevent race
        const result = await db.runTransaction(async (tx) => {
            const processDoc = await tx.get(processRef);
            if (!processDoc.exists) return null;

            const process = processDoc.data();
            if (process.status !== 'active') return null;

            const currentStep = process.currentStep || 0;
            if (after.processStep !== currentStep) return null;

            const templateDoc = await tx.get(
                db.collection('companies').doc(companyId)
                    .collection('processTemplates').doc(process.templateId)
            );
            if (!templateDoc.exists) return null;

            const template = templateDoc.data();
            if (!template.steps?.length) return null;

            const stepDef = template.steps[currentStep];
            const nextStepIndex = currentStep + 1;
            const nextStep = template.steps[nextStepIndex];

            // Step result for context chain
            const stepResult = {
                step: currentStep,
                function: stepDef?.function || '',
                title: stepDef?.title || stepDef?.function || '',
                completedBy: after.completedBy || after.assigneeId,
                completedByName: after.assigneeName || '',
                completedAt: new Date().toISOString(),
                taskId,
                result: after.completionComment || '',
                trackedMinutes: after.timeLog ? after.timeLog.reduce((s, e) => s + (e.minutes || 0), 0) : 0
            };

            const historyEntry = {
                step: currentStep,
                stepTitle: stepDef?.title || stepDef?.function || '',
                completedAt: new Date().toISOString(),
                completedBy: after.completedBy || after.assigneeId,
                completedByName: after.assigneeName || '',
                taskId
            };

            const updateData = {
                currentStep: nextStepIndex,
                history: admin.firestore.FieldValue.arrayUnion(historyEntry),
                stepResults: admin.firestore.FieldValue.arrayUnion(stepResult)
            };

            if (!nextStep) {
                updateData.status = 'completed';
                updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
            }

            tx.update(processRef, updateData);

            return { process, template, nextStep, nextStepIndex, stepResult };
        });

        if (!result) return null;

        const { process, template, nextStep, nextStepIndex, stepResult } = result;

        if (nextStep) {
            // Get function and smart assign
            const funcsSnap = await db.collection('companies').doc(companyId)
                .collection('functions').where('name', '==', nextStep.function).limit(1).get();

            let assigneeId = null, assigneeName = '';
            if (!funcsSnap.empty) {
                const funcData = { id: funcsSnap.docs[0].id, ...funcsSnap.docs[0].data() };
                if (nextStep.smartAssign !== false && funcData.assigneeIds?.length > 1) {
                    assigneeId = await getSmartAssignee(companyId, funcData);
                } else {
                    assigneeId = funcData.headId || funcData.assigneeIds?.[0] || null;
                }
                if (assigneeId) {
                    const uDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(assigneeId).get();
                    if (uDoc.exists) assigneeName = uDoc.data().name || uDoc.data().email || '';
                }
            }

            // Deadline: SLA or process deadline
            const now = new Date();
            let deadlineDate;
            if (process.deadline) {
                const pdl = new Date(process.deadline + 'T18:00:00');
                const remaining = template.steps.slice(nextStepIndex + 1)
                    .reduce((s, st) => s + parseInt(st.slaMinutes || st.estimatedTime || 60), 0);
                const sdl = new Date(pdl.getTime() - remaining * 60000);
                const tmw = new Date(now); tmw.setDate(tmw.getDate() + 1);
                deadlineDate = sdl > tmw ? sdl : tmw;
            } else if (nextStep.slaMinutes) {
                deadlineDate = new Date(now.getTime() + nextStep.slaMinutes * 60000);
            } else {
                deadlineDate = new Date(now.getTime() + 24 * 60 * 60000);
            }
            const deadlineDateStr = deadlineDate.toISOString().split('T')[0];

            // Context from previous steps
            const prevResults = (process.stepResults || []).concat([stepResult]);
            let contextBlock = '';
            if (prevResults.length > 0) {
                contextBlock = '--- Попередні етапи ---\n' +
                    prevResults.map((r, i) =>
                        `${i + 1}. ${r.title || r.function}: ${r.result || '(без коментаря)'} [${r.completedByName || ''}]`
                    ).join('\n') + '\n---\n\n';
            }

            let instruction = contextBlock;
            if (process.objectName) instruction += `[${process.objectName}]\n`;
            instruction += nextStep.instruction || '';
            if (nextStep.expectedResult) instruction += `\n\n📋 Очікуваний результат: ${nextStep.expectedResult}`;
            if (nextStep.controlQuestion) instruction += `\n❓ ${nextStep.controlQuestion}`;

            const newTaskRef = await db.collection('companies').doc(companyId)
                .collection('tasks').add({
                    title: `[${process.name}] ${nextStep.title || nextStep.function}`,
                    function: nextStep.function,
                    assigneeId, assigneeName,
                    description: instruction,
                    instruction: instruction,
                    expectedResult: nextStep.expectedResult || '',
                    estimatedTime: String(nextStep.slaMinutes || nextStep.estimatedTime || 60),
                    deadlineDate: deadlineDateStr,
                    deadlineTime: '18:00',
                    deadline: deadlineDateStr + 'T18:00',
                    status: 'new', priority: 'high',
                    processId: after.processId,
                    processStep: nextStepIndex,
                    processObject: process.objectName || '',
                    requireReview: nextStep.checkpoint || false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAutoGenerated: true, creatorName: 'TALKO System'
                });

            // Telegram: notify assignee
            if (assigneeId) {
                const aDoc = await db.collection('companies').doc(companyId)
                    .collection('users').doc(assigneeId).get();
                if (aDoc.exists && aDoc.data().telegramChatId) {
                    const procAssigneeLang = await getUserLang(companyId, assigneeId);
                    await sendWithButtons(aDoc.data().telegramChatId,
                        `🔔 <b>${tg(procAssigneeLang, 'newProcessStep') || 'Новий етап процесу!'}</b>\n\n📋 ${process.name}${process.objectName ? ` [${process.objectName}]` : ''}\n📍 ${tg(procAssigneeLang, 'stepLabel') || 'Етап'} ${nextStepIndex + 1}/${template.steps.length}: ${nextStep.title || nextStep.function}\n⏰ ${tg(procAssigneeLang, 'deadline') || 'Дедлайн'}: ${deadlineDateStr}\n${nextStep.expectedResult ? `\n📋 ${nextStep.expectedResult}` : ''}`,
                        taskButtons(newTaskRef.id, companyId, procAssigneeLang)
                    );
                }
            }

            // Telegram: notify managers about progress
            const managersSnap = await db.collection('companies').doc(companyId)
                .collection('users').where('role', 'in', ['owner', 'manager']).get();
            for (const mDoc of managersSnap.docs) {
                if (mDoc.id === assigneeId) continue;
                const d = mDoc.data();
                if (d.telegramChatId) {
                    const procMgrLang = await getUserLang(companyId, mDoc.id);
                    await sendTelegramMessage(d.telegramChatId,
                        `📊 <b>${tg(procMgrLang, 'processProgress') || 'Прогрес процесу'}</b>\n\n📋 ${process.name}${process.objectName ? ` [${process.objectName}]` : ''}\n✅ ${tg(procMgrLang, 'stepLabel') || 'Етап'} ${process.currentStep + 1} ${tg(procMgrLang, 'completed') || 'завершено'}\n▶️ ${tg(procMgrLang, 'stepLabel') || 'Етап'} ${nextStepIndex + 1}: ${nextStep.title || nextStep.function}\n👤 ${assigneeName || '-'}`
                    );
                }
            }

        } else {
            // Process completed
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users').where('role', 'in', ['owner', 'manager']).get();
            for (const uDoc of usersSnap.docs) {
                const d = uDoc.data();
                if (d.telegramChatId) {
                    const uLangProc = await getUserLang(companyId, uDoc.id);
                    await sendTelegramMessage(d.telegramChatId,
                        `${tg(uLangProc, 'processCompleted')}\n\n📋 ${process.name}${process.objectName ? ` [${process.objectName}]` : ''}\n🎉 ${template.steps.length} ${tg(uLangProc, 'processSteps')}!`
                    );
                }
            }
        }

        return null;
    });

// ===========================
// 7. SCHEDULED TASKS
// ===========================
exports.checkScheduledTasks = functions
    .region(REGION)
    .pubsub.schedule('every 15 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const companiesSnap = await db.collection('companies').limit(500).get(); // safety cap
        for (const companyDoc of companiesSnap.docs) {
            const scheduledSnap = await companyDoc.ref
                .collection('scheduledTasks')
                .where('activateAt', '<=', admin.firestore.Timestamp.fromDate(now))
                .where('activated', '==', false).get();
            for (const schedDoc of scheduledSnap.docs) {
                const schedTask = schedDoc.data();
                // Транзакція: create + activate атомарно — дубль неможливий
                await db.runTransaction(async (tx) => {
                    const fresh = await tx.get(schedDoc.ref);
                    if (!fresh.exists || fresh.data().activated === true) return; // idempotent guard
                    const newTaskRef = companyDoc.ref.collection('tasks').doc();
                    tx.set(newTaskRef, {
                        ...schedTask.taskData,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        isAutoGenerated: true,
                        scheduledTaskId: schedDoc.id
                    });
                    tx.update(schedDoc.ref, { activated: true, activatedTaskId: newTaskRef.id });
                });
            }
        }
        return null;
    });

// ===========================
// 8. REMINDERS (з кнопками)
// ===========================
// ========================
// P2 COST FIX: sendReminders
// Замість full scan — collectionGroup query тільки задач де deadline в межах ±90 хв
// Reads: ~O(upcoming tasks) замість O(N×M)
// ========================
exports.sendReminders = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('every 5 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
        // Вікно: задачі з дедлайном від зараз до +90 хвилин
        const windowEnd = new Date(now.getTime() + 90 * 60 * 1000);
        const windowEndTs = admin.firestore.Timestamp.fromDate(windowEnd);

        const tasksSnap = await db.collectionGroup('tasks')
            .where('status', 'in', ['new', 'progress'])
            .where('deadline', '>=', nowTimestamp)
            .where('deadline', '<=', windowEndTs)
            .limit(200)
            .get();

        // Групуємо по companyId
        const byCompany = {};
        tasksSnap.docs.forEach(doc => {
            const cid = doc.ref.path.split('/')[1];
            if (!byCompany[cid]) byCompany[cid] = [];
            byCompany[cid].push(doc);
        });

        for (const [companyId, taskDocs] of Object.entries(byCompany)) {
            for (const taskDoc of taskDocs) {
                const task = taskDoc.data();
                if (!task.deadline) continue;

                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                const minUntil = Math.floor((deadline - now) / (1000 * 60));
                if (minUntil < 0) continue;

                const reminders = task.reminders || [60, 15];
                const sent = task.sentReminders || []; // для read-only перевірки

                for (const rem of reminders) {
                    if (minUntil <= rem + 3 && minUntil >= rem - 3 && !sent.includes(rem)) {
                        const timeText = rem >= 60 ? `${Math.floor(rem / 60)} год` : `${rem} хв`;
                        if (task.assigneeId) {
                            const uDoc = await db.collection('companies').doc(companyId)
                                .collection('users').doc(task.assigneeId).get();
                            if (uDoc.exists && uDoc.data().telegramChatId) {
                                const remLang = await getUserLang(companyId, task.assigneeId);
                                const remTaskType = task.processId ? tg(remLang, 'taskType_process') : (task.regularTaskId ? tg(remLang, 'taskType_regular') : tg(remLang, 'taskType_task'));
                                const remTimeText = rem >= 60 ? `${Math.floor(rem / 60)} ${tg(remLang, 'hoursShort') || 'год'}` : `${rem} ${tg(remLang, 'minutesShort') || 'хв'}`;
                                await sendWithButtons(uDoc.data().telegramChatId,
                                    `${tg(remLang, 'reminderPrefix')}: \n\n${remTaskType}\n📌 ${task.title}\n⏳ ${remTimeText}`,
                                    taskButtons(taskDoc.id, companyId, remLang)
                                );
                            }
                        }

                        if (task.notifyOnReminder?.length) {
                            for (const uid of task.notifyOnReminder) {
                                if (uid === task.assigneeId) continue;
                                const uDoc = await db.collection('companies').doc(companyId)
                                    .collection('users').doc(uid).get();
                                if (uDoc.exists && uDoc.data().telegramChatId) {
                                    const ctrlLang = await getUserLang(companyId, uid);
                                    const ctrlTimeText = rem >= 60 ? `${Math.floor(rem / 60)} ${tg(ctrlLang, 'hoursShort') || 'год'}` : `${rem} ${tg(ctrlLang, 'minutesShort') || 'хв'}`;
                                    await sendTelegramMessage(uDoc.data().telegramChatId,
                                        `${tg(ctrlLang, 'escalationPrefix') || '⏰ Контроль'}: <b>${task.title}</b>\n👤 ${task.assigneeName || '-'}\n⏳ ${ctrlTimeText}`
                                    );
                                }
                            }
                        }

                        // arrayUnion — атомарно, safe при паралельних раннах
                        await taskDoc.ref.update({
                            sentReminders: admin.firestore.FieldValue.arrayUnion(rem)
                        });
                    }
                }
            }
        }
        return null;
    });

// ===========================
// 9. РАНКОВИЙ ЗВІТ (9:00)
// ===========================
exports.dailyReport = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('0 9 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const companiesSnap = await db.collection('companies').limit(500).get(); // safety cap

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            if (companyData.dailyReportEnabled === false) continue;

            let todayTasks = 0, overdueTasks = 0, completedYesterday = 0;
            const userStats = {};

            const tasksSnap = await companyDoc.ref.collection('tasks').get();
            for (const td of tasksSnap.docs) {
                const t = td.data();

                // BUG 1 FIX: звіт рахував status!='done' — але "Мій день" також виключає 'review'
                // BUG 2 FIX: звіт використовував t.deadline (Timestamp) — але завдання зберігають t.deadlineDate (string YYYY-MM-DD)
                // Тепер використовуємо deadlineDate для консистентності з клієнтом

                // На сьогодні: дедлайн = сьогодні, не виконано і не на перевірці
                if (t.deadlineDate === todayStr && t.status !== 'done' && t.status !== 'review') todayTasks++;

                // Прострочено: дедлайн < сьогодні, статус активний (не done, не review)
                if (t.deadlineDate && t.deadlineDate < todayStr &&
                    t.status !== 'done' && t.status !== 'review') {
                    overdueTasks++;
                    if (t.assigneeId) {
                        if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                        userStats[t.assigneeId].overdue++;
                    }
                }

                // BUG 3 FIX: completedAt порівнювався через toISOString() — повертає UTC
                // Якщо виконано о 23:30 Kyiv = 00:30 UTC наступного дня → не потрапляло у вчора
                // Фіксуємо: конвертуємо в локальну дату Kyiv (+3/+2)
                if (t.status === 'done' && t.completedAt) {
                    const cd = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    // Конвертуємо в Kyiv time для порівняння дат
                    const kyivDateStr = cd.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' });
                    if (kyivDateStr === yesterdayStr) {
                        completedYesterday++;
                        if (t.assigneeId) {
                            if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                            userStats[t.assigneeId].completed++;
                        }
                    }
                }
            }

            // BUG 4 FIX: регулярні задачі — "Мій день" показує їх, звіт не рахував
            // Рахуємо скільки регулярних задач на сьогодні (по period/dayOfWeek/dayOfMonth)
            const regularSnap = await companyDoc.ref.collection('regularTasks').get();
            const todayDate = new Date(todayStr + 'T00:00:00');
            const todayDayOfWeek = todayDate.getDay(); // 0=Sun, 1=Mon...
            const todayDayOfMonth = todayDate.getDate();
            let regularTodayCount = 0;

            for (const rd of regularSnap.docs) {
                const rt = rd.data();
                if (rt.status === 'archived') continue;
                let isToday = false;
                if (rt.period === 'daily') {
                    isToday = true;
                } else if (rt.period === 'weekly') {
                    const days = rt.daysOfWeek || (rt.dayOfWeek ? [rt.dayOfWeek] : []);
                    isToday = days.map(String).includes(String(todayDayOfWeek));
                } else if (rt.period === 'monthly') {
                    isToday = rt.dayOfMonth === todayDayOfMonth;
                }
                if (isToday) regularTodayCount++;
            }
            todayTasks += regularTodayCount;

            // Active processes
            const procSnap = await companyDoc.ref.collection('processes')
                .where('status', '==', 'active').get();

            const managersSnap = await companyDoc.ref.collection('users')
                .where('role', 'in', ['owner', 'manager']).get();
            for (const mDoc of managersSnap.docs) {
                const d = mDoc.data();
                if (d.dailyReportEnabled === false) continue;
                if (!d.telegramChatId) continue;

                // Мова per-manager
                const mLang = await getUserLang(companyId, mDoc.id);
                const mLocale = mLang === 'de' ? 'de-DE' : mLang === 'ru' ? 'ru-RU' : mLang === 'en' ? 'en-US' : mLang === 'pl' ? 'pl-PL' : mLang === 'cs' ? 'cs-CZ' : 'uk-UA';
                const mDateStr = now.toLocaleDateString(mLocale, { weekday: 'long', day: 'numeric', month: 'long' });

                let report = `${tg(mLang, 'morningReport')}\n`;
                report += `📅 ${mDateStr}\n\n`;
                report += `${tg(mLang, 'morningToday')}: <b>${todayTasks}</b> ${tg(mLang, 'morningTasks')}\n`;
                report += `${tg(mLang, 'morningCompleted')}: <b>${completedYesterday}</b>\n`;
                if (overdueTasks > 0) report += `${tg(mLang, 'morningOverdue')}: <b>${overdueTasks}</b>\n`;
                if (procSnap.size > 0) report += `${tg(mLang, 'morningProcesses')}: <b>${procSnap.size}</b>\n`;

                const sorted = Object.entries(userStats).sort((a, b) => b[1].completed - a[1].completed).slice(0, 5);
                if (sorted.length > 0) {
                    report += `\n${tg(mLang, 'morningTeam')}\n`;
                    for (const [, s] of sorted) {
                        const emoji = s.overdue > 0 ? '⚠️' : '✅';
                        report += `${emoji} ${s.name}: ${s.completed} ${tg(mLang, 'morningDone')}${s.overdue > 0 ? `, ${s.overdue} ${tg(mLang, 'morningOverdueShort')}` : ''}\n`;
                    }
                }

                await sendTelegramMessage(d.telegramChatId, report);
            }
        }
        return null;
    });

// ===========================
// 10. ПЕРСОНАЛЬНІ ЗАВДАННЯ (9:05)
// ===========================
exports.personalDailyTasks = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('5 9 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const day = now.getDay();
        if (day === 0 || day === 6) return null;

        const companiesSnap = await db.collection('companies').limit(500).get(); // safety cap
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            if (companyDoc.data().personalDailyEnabled === false) continue;

            const usersSnap = await companyDoc.ref.collection('users').get();
            for (const userDoc of usersSnap.docs) {
                const ud = userDoc.data();
                if (!ud.telegramChatId || ud.personalDailyEnabled === false) continue;

                const uid = userDoc.id;
                const chatId = ud.telegramChatId;
                const userName = ud.name || ud.email || '';

                const tasksSnap = await companyDoc.ref.collection('tasks')
                    .where('assigneeId', '==', uid)
                    .where('status', 'in', ['new', 'progress']).get();

                const todayTasks = [], overdueTasks = [];
                tasksSnap.docs.forEach(d => {
                    const t = { id: d.id, ...d.data() };
                    if (t.deadlineDate === todayStr) todayTasks.push(t);
                    else if (t.deadlineDate && t.deadlineDate < todayStr) overdueTasks.push(t);
                });
                todayTasks.sort((a, b) => (a.deadlineTime || '').localeCompare(b.deadlineTime || ''));

                // Мова per-user
                const pLang = await getUserLang(companyId, uid);

                if (todayTasks.length === 0 && overdueTasks.length === 0) {
                    await sendTelegramMessage(chatId,
                        `${tg(pLang, 'goodMorning')}, <b>${userName}</b>!\n\n${tg(pLang, 'noTasksToday2')}`);
                    continue;
                }

                await sendTelegramMessage(chatId,
                    `${tg(pLang, 'goodMorning')}, <b>${userName}</b>!\n\n${tg(pLang, 'todayTasksCount')}: <b>${todayTasks.length}</b>` +
                    (overdueTasks.length > 0 ? `\n${tg(pLang, 'overdueCount')}: <b>${overdueTasks.length}</b>` : ''));

                for (const t of overdueTasks.slice(0, 5)) {
                    const pr = t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡';
                    await sendWithButtons(chatId,
                        `⚠️ ${pr} <b>${t.title}</b>\n📅 ${t.deadlineDate}`,
                        taskButtons(t.id, companyId, pLang));
                }
                if (overdueTasks.length > 5) await sendTelegramMessage(chatId, `${tg(pLang, 'moreItems')} ${overdueTasks.length - 5}. /overdue`);

                for (const t of todayTasks.slice(0, 10)) {
                    const tm = t.deadlineTime ? ` ⏰ ${t.deadlineTime}` : '';
                    const pr = t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡';
                    await sendWithButtons(chatId,
                        `${pr} <b>${t.title}</b>${tm}`,
                        taskButtons(t.id, companyId, pLang));
                }
                if (todayTasks.length > 10) await sendTelegramMessage(chatId, `${tg(pLang, 'moreItems')} ${todayTasks.length - 10}. /today`);
            }
        }
        return null;
    });

// ===========================
// 11. ТИЖНЕВИЙ ЗВІТ (понеділок 9:00)
// ===========================
exports.weeklyReport = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('0 9 * * 1')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);

        const companiesSnap = await db.collection('companies').limit(500).get(); // safety cap
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            if (companyDoc.data().weeklyReportEnabled === false) continue;

            let totalCreated = 0, totalCompleted = 0, totalOverdue = 0;
            let completionTimes = [];
            const userStats = {};

            const tasksSnap = await companyDoc.ref.collection('tasks').get();
            for (const td of tasksSnap.docs) {
                const t = td.data();
                if (t.createdAt) {
                    const cr = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
                    if (cr >= weekAgo) totalCreated++;
                }
                if (t.status === 'done' && t.completedAt) {
                    const co = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    if (co >= weekAgo) {
                        totalCompleted++;
                        if (t.createdAt) {
                            const cr = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
                            completionTimes.push((co - cr) / (1000 * 60 * 60));
                        }
                        if (t.assigneeId) {
                            if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                            userStats[t.assigneeId].completed++;
                        }
                    }
                }
                if (t.overdueNotified && t.overdueNotifiedAt) {
                    const ov = t.overdueNotifiedAt.toDate ? t.overdueNotifiedAt.toDate() : new Date(t.overdueNotifiedAt);
                    if (ov >= weekAgo) {
                        totalOverdue++;
                        if (t.assigneeId) {
                            if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                            userStats[t.assigneeId].overdue++;
                        }
                    }
                }
            }

            const avgTime = completionTimes.length > 0
                ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : 0;

            // Processes completed this week
            const procSnap = await companyDoc.ref.collection('processes')
                .where('status', '==', 'completed').get();
            const procCompleted = procSnap.docs.filter(d => {
                const ca = d.data().completedAt;
                if (!ca) return false;
                const dt = ca.toDate ? ca.toDate() : new Date(ca);
                return dt >= weekAgo;
            }).length;

            const byCompleted = Object.entries(userStats).sort((a, b) => b[1].completed - a[1].completed);
            const byOverdue = Object.entries(userStats).filter(([, s]) => s.overdue > 0).sort((a, b) => b[1].overdue - a[1].overdue);

            const wManagersSnap = await companyDoc.ref.collection('users')
                .where('role', 'in', ['owner', 'manager']).get();
            for (const mDoc of wManagersSnap.docs) {
                const d = mDoc.data();
                if (d.weeklyReportEnabled === false) continue;
                if (!d.telegramChatId) continue;

                // Мова per-manager
                const wLang = await getUserLang(companyId, mDoc.id);
                const wLocale = wLang === 'de' ? 'de-DE' : wLang === 'ru' ? 'ru-RU' : wLang === 'en' ? 'en-US' : wLang === 'pl' ? 'pl-PL' : wLang === 'cs' ? 'cs-CZ' : 'uk-UA';

                let report = `${tg(wLang, 'weeklyTitle')}\n`;
                report += `📅 ${weekAgo.toLocaleDateString(wLocale)} - ${now.toLocaleDateString(wLocale)}\n\n`;
                report += `${tg(wLang, 'weeklyCreated')}: ${totalCreated}\n${tg(wLang, 'weeklyDone')}: ${totalCompleted}\n${tg(wLang, 'weeklyOverdueShort')}: ${totalOverdue}\n`;
                if (procCompleted > 0) report += `${tg(wLang, 'weeklyProcesses')}: ${procCompleted}\n`;
                if (avgTime > 0) report += `${tg(wLang, 'weeklyAvgTime')}: ${Math.round(avgTime)} ${tg(wLang, 'weeklyHours')}\n`;
                if (totalCreated > 0) report += `\n${tg(wLang, 'weeklyEfficiency')}: <b>${Math.round((totalCompleted / totalCreated) * 100)}%</b>\n`;

                if (byCompleted.length > 0) {
                    report += `\n${tg(wLang, 'weeklyBest')}\n`;
                    for (const [, s] of byCompleted.slice(0, 3)) report += `✅ ${s.name}: ${s.completed}\n`;
                }
                if (byOverdue.length > 0) {
                    report += `\n${tg(wLang, 'weeklyAttention')}\n`;
                    for (const [, s] of byOverdue.slice(0, 3)) report += `❌ ${s.name}: ${s.overdue} ${tg(wLang, 'weeklyOverdueOf')}\n`;
                }

                await sendTelegramMessage(d.telegramChatId, report);
            }
        }
        return null;
    });

// ===========================
// 12. AI ASSISTANT — Universal Cloud Function
// ===========================
exports.aiAssistant = functions
    .region(REGION)
    .runWith({ timeoutSeconds: 120, memory: '256MB' })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Login required');
        }

        const { companyId, assistantId, userMessage, contextData } = data;
        if (!companyId || !assistantId || !userMessage) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
        }

        // ─── AI KILL SWITCH + ЛІМІТИ ──────────────────────
        const today = new Date().toISOString().split('T')[0];
        const monthKey = today.slice(0, 7);

        // Глобальний kill switch
        try {
            const globalSettings = await db.collection('settings').doc('ai').get();
            if (globalSettings.exists && globalSettings.data().globalAiEnabled === false) {
                throw new functions.https.HttpsError('unavailable', 'AI тимчасово недоступний');
            }
        } catch(e) { if (e.code) throw e; }

        // Перевірка компанії — ліміти та статус
        const companyDoc2 = await db.collection('companies').doc(companyId).get();
        if (companyDoc2.exists) {
            const compData = companyDoc2.data();
            if (compData.aiEnabled === false) {
                throw new functions.https.HttpsError('permission-denied', 'AI вимкнено для вашої компанії');
            }
            // Денний ліміт
            if (compData.aiDailyTokenLimit > 0) {
                const todaySnap = await db.collection('companies').doc(companyId)
                    .collection('aiUsageLog').where('date', '==', today).get();
                const tokensToday = todaySnap.docs.reduce((s, d) => s + (d.data().tokens || 0), 0);
                if (tokensToday >= compData.aiDailyTokenLimit) {
                    throw new functions.https.HttpsError('resource-exhausted',
                        `Денний ліміт AI вичерпано: ${tokensToday}/${compData.aiDailyTokenLimit} токенів`);
                }
            }
            // Місячний ліміт
            if (compData.aiMonthlyTokenLimit > 0) {
                const monthSnap = await db.collection('companies').doc(companyId)
                    .collection('aiUsageLog').where('month', '==', monthKey).get();
                const tokensMonth = monthSnap.docs.reduce((s, d) => s + (d.data().tokens || 0), 0);
                if (tokensMonth >= compData.aiMonthlyTokenLimit) {
                    throw new functions.https.HttpsError('resource-exhausted',
                        `Місячний ліміт AI вичерпано: ${tokensMonth}/${compData.aiMonthlyTokenLimit} токенів`);
                }
            }
        }

        try {
            // Verify user — superadmin or company member
            const isSuperAdmin = context.auth.token.email === 'management.talco@gmail.com';
            if (!isSuperAdmin) {
                const userDoc = await db.collection('companies').doc(companyId)
                    .collection('users').doc(context.auth.uid).get();
                if (!userDoc.exists) {
                    throw new functions.https.HttpsError('permission-denied', 'Not a member');
                }
            }

            // Load assistant — global first, then company fallback
            let aDoc = await db.collection('settings').doc('ai')
                .collection('assistants').doc(assistantId).get();
            if (!aDoc.exists) {
                aDoc = await db.collection('companies').doc(companyId)
                    .collection('aiAssistants').doc(assistantId).get();
            }
            if (!aDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Assistant not found');
            }

            const assistant = aDoc.data();
            const model = assistant.model || 'gpt-4o-mini';

            // P1 SEC FIX: API key виключно з Firebase Secret (env var)
            // НЕ читати з Firestore — company members мають read на /companies/{cid}
            const apiKey = process.env.OPENAI_API_KEY || '';
            if (!apiKey) {
                throw new functions.https.HttpsError('failed-precondition',
                    'OpenAI API key not configured. Add OPENAI_API_KEY to Firebase Secrets via: firebase functions:secrets:set OPENAI_API_KEY');
            }

            // Build messages
            const messages = [];
            if (assistant.systemPrompt) messages.push({ role: 'system', content: assistant.systemPrompt });
            if (contextData) messages.push({ role: 'system', content: 'Context:\n' + JSON.stringify(contextData, null, 2) });
            messages.push({ role: 'user', content: userMessage });

            // Call OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
               body: JSON.stringify({ model, messages, max_completion_tokens: 16000 })
            });

            if (!response.ok) {
                const err = await response.text();
                console.error('OpenAI error:', response.status, err);
                throw new functions.https.HttpsError('internal', `OpenAI: ${response.status}`);
            }

            const result = await response.json();
            const content = result.choices?.[0]?.message?.content || '';

            // Log usage
            await db.collection('companies').doc(companyId)
                .collection('aiUsageLog').add({
                    assistantId, model, userId: context.auth.uid,
                    tokens: result.usage?.total_tokens || 0,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                }).catch(() => {});

            return { content, model, tokens: result.usage?.total_tokens || 0 };

        } catch (error) {
            if (error instanceof functions.https.HttpsError) throw error;
            console.error('aiAssistant error:', error);
            throw new functions.https.HttpsError('internal', error.message);
        }
    });
// ===========================
// 13. ВЕЧІРНІЙ DIGEST (18:00) — Plan vs Fact
// ===========================
exports.eveningDigest = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('0 18 * * 1-5')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const day = now.getDay();
        if (day === 0 || day === 6) return null;

        const tmrw = new Date(now); tmrw.setDate(tmrw.getDate() + 1);
        const tmrwStr = tmrw.toISOString().split('T')[0];

        const companiesSnap = await db.collection('companies').limit(500).get(); // safety cap

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            if (companyDoc.data().eveningDigestEnabled === false) continue;

            const usersSnap = await companyDoc.ref.collection('users').get();

            for (const userDoc of usersSnap.docs) {
                const ud = userDoc.data();
                if (!ud.telegramChatId || ud.eveningDigestEnabled === false) continue;

                const uid = userDoc.id;
                const chatId = ud.telegramChatId;
                const userName = ud.name || ud.email || '';

                // Get all tasks for this user
                const tasksSnap = await companyDoc.ref.collection('tasks')
                    .where('assigneeId', '==', uid).get();

                const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Completed today — completedAt (Timestamp), конвертуємо в Kyiv date
                const doneToday = tasks.filter(t => {
                    if (t.status !== 'done' || !t.completedAt) return false;
                    const cd = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    return cd.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' }) === todayStr;
                });

                // Due today but not done
                const missedToday = tasks.filter(t =>
                    t.deadlineDate === todayStr && t.status !== 'done'
                );

                // All overdue (before today)
                const overdue = tasks.filter(t =>
                    t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done'
                );

                // Tomorrow
                const tomorrow = tasks.filter(t =>
                    t.deadlineDate === tmrwStr && t.status !== 'done'
                ).sort((a, b) => (a.deadlineTime || '').localeCompare(b.deadlineTime || ''));

                // Skip if no activity
                if (doneToday.length === 0 && missedToday.length === 0 && overdue.length === 0 && tomorrow.length === 0) {
                    continue;
                }

                // Score
                const planned = doneToday.length + missedToday.length;
                const score = planned > 0 ? Math.round((doneToday.length / planned) * 100) : 100;
                const emoji = score >= 80 ? '🟢' : score >= 50 ? '🟡' : '🔴';

                const evLang = await getUserLang(companyId, uid);
                let msg = `🌆 <b>${tg(evLang, 'eveningReport') || 'Вечірній звіт'}</b>\n👤 ${userName}\n\n`;
                msg += `${emoji} <b>${tg(evLang, 'planVsFact') || 'План vs Факт'}: ${doneToday.length}/${planned} (${score}%)</b>\n\n`;

                if (doneToday.length > 0) {
                    msg += `✅ ${tg(evLang, 'eveningDone') || 'Виконано'} (${doneToday.length}):\n`;
                    doneToday.slice(0, 5).forEach(t => { msg += `  • <s>${t.title}</s>\n`; });
                    if (doneToday.length > 5) msg += `  ... ${tg(evLang, 'moreItems') || 'ще'} ${doneToday.length - 5}\n`;
                    msg += `\n`;
                }

                if (missedToday.length > 0) {
                    msg += `❌ ${tg(evLang, 'eveningMissed') || 'Не виконано'} (${missedToday.length}):\n`;
                    missedToday.forEach(t => { msg += `  • ${t.title}\n`; });
                    msg += `\n`;
                }

                if (overdue.length > 0) {
                    msg += `⚠️ ${tg(evLang, 'morningOverdue') || 'Прострочено'} (${overdue.length}):\n`;
                    overdue.slice(0, 3).forEach(t => {
                        msg += `  • ${t.title} (📅 ${t.deadlineDate})\n`;
                    });
                    if (overdue.length > 3) msg += `  ... ${tg(evLang, 'moreItems') || 'ще'} ${overdue.length - 3}\n`;
                    msg += `\n`;
                }

                if (tomorrow.length > 0) {
                    msg += `📅 ${tg(evLang, 'eveningTomorrow') || 'Завтра'} (${tomorrow.length}):\n`;
                    tomorrow.slice(0, 5).forEach(t => {
                        const tm = t.deadlineTime ? ` ⏰ ${t.deadlineTime}` : '';
                        const pr = t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡';
                        msg += `  ${pr} ${t.title}${tm}\n`;
                    });
                    if (tomorrow.length > 5) msg += `  ... ${tg(evLang, 'moreItems') || 'ще'} ${tomorrow.length - 5}\n`;
                }

                await sendTelegramMessage(chatId, msg);
            }

            // Manager summary
            const allTasksSnap = await companyDoc.ref.collection('tasks').get();
            const allTasks = allTasksSnap.docs.map(d => d.data());
            
            const totalDoneToday = allTasks.filter(t => {
                if (t.status !== 'done' || !t.completedAt) return false;
                const cd = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                return cd.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' }) === todayStr;
            }).length;
            const totalMissed = allTasks.filter(t => t.deadlineDate === todayStr && t.status !== 'done').length;
            const totalOverdue = allTasks.filter(t => t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done').length;
            const totalTomorrow = allTasks.filter(t => t.deadlineDate === tmrwStr && t.status !== 'done').length;

            const planned = totalDoneToday + totalMissed;
            const score = planned > 0 ? Math.round((totalDoneToday / planned) * 100) : 100;
            const emoji = score >= 80 ? '🟢' : score >= 50 ? '🟡' : '🔴';

            // Per-person breakdown
            const byPerson = {};
            allTasks.forEach(t => {
                const n = t.assigneeName || '—';
                if (!byPerson[n]) byPerson[n] = { done: 0, missed: 0, overdue: 0 };
                if (t.status === 'done' && t.completedAt) {
                    const cd2 = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    if (cd2.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' }) === todayStr) byPerson[n].done++;
                }
                if (t.deadlineDate === todayStr && t.status !== 'done') byPerson[n].missed++;
                if (t.deadlineDate && t.deadlineDate < todayStr && t.status !== 'done') byPerson[n].overdue++;
            });

            const sortedByPerson = Object.entries(byPerson)
                .filter(([, s]) => s.done > 0 || s.missed > 0 || s.overdue > 0)
                .sort((a, b) => (b[1].missed + b[1].overdue) - (a[1].missed + a[1].overdue));

            // Per-manager language
            const mgrSnap = await companyDoc.ref.collection('users')
                .where('role', 'in', ['owner', 'manager']).get();
            for (const mDoc of mgrSnap.docs) {
                const d = mDoc.data();
                if (d.eveningDigestEnabled === false) continue;
                if (!d.telegramChatId) continue;
                const mgrEvLang = await getUserLang(companyId, mDoc.id);
                let mgrMsg = `🌆 <b>${tg(mgrEvLang, 'eveningReport') || 'Вечірній звіт'} (${tg(mgrEvLang, 'teamReport') || 'Команда'})</b>\n\n`;
                mgrMsg += `${emoji} <b>${tg(mgrEvLang, 'planVsFact') || 'План vs Факт'}: ${totalDoneToday}/${planned} (${score}%)</b>\n`;
                mgrMsg += `⚠️ ${tg(mgrEvLang, 'morningOverdue') || 'Прострочено'}: ${totalOverdue}\n`;
                mgrMsg += `📅 ${tg(mgrEvLang, 'eveningTomorrow') || 'Завтра'}: ${totalTomorrow}\n\n`;
                if (sortedByPerson.length > 0) {
                    mgrMsg += `👥 <b>${tg(mgrEvLang, 'teamReport') || 'Команда'}:</b>\n`;
                    sortedByPerson.forEach(([n, s]) => {
                        const e = (s.missed + s.overdue) > 0 ? '⚠️' : '✅';
                        mgrMsg += `${e} ${n}: ✅${s.done}`;
                        if (s.missed > 0) mgrMsg += ` ❌${s.missed}`;
                        if (s.overdue > 0) mgrMsg += ` ⏰${s.overdue}`;
                        mgrMsg += `\n`;
                    });
                }
                await sendTelegramMessage(d.telegramChatId, mgrMsg);
            }
        }
        return null;
    });


// ============================================================
// STATISTICS: Aggregates + Audit Log
// ============================================================

// Trigger: when metricEntry is created or updated → update aggregate
exports.onMetricEntryWrite = functions
    .region(REGION)
    .firestore.document('companies/{companyId}/metricEntries/{entryId}')
    .onWrite(async (change, context) => {
        const { companyId, entryId } = context.params;
        const after = change.after.exists ? change.after.data() : null;
        const before = change.before.exists ? change.before.data() : null;

        if (!after && !before) return null;

        // Пропускаємо DELETE — його обробляє onMetricEntryDelete (щоб не було подвійного recalc)
        if (!after) return null;

        const entry = after;
        const { metricId, periodKey, scope, scopeId } = entry;
        if (!metricId || !periodKey) return null;

        // 1) AUDIT LOG: track value changes
        if (before && after && before.value !== after.value) {
            await db.collection('companies').doc(companyId)
                .collection('metricAuditLog').add({
                    metricId,
                    entryId,
                    periodKey,
                    scope: scope || 'user',
                    scopeId: scopeId || '',
                    oldValue: before.value,
                    newValue: after.value,
                    changedBy: after.createdBy || '',
                    changedAt: admin.firestore.FieldValue.serverTimestamp(),
                    reason: 'value_update'
                });
        }

        // 2) AGGREGATE: recalculate for this metric+period+scope
        await recalcAggregate(companyId, metricId, periodKey);

        return null;
    });

// Recalculate aggregate for a metric+period across all scopes
async function recalcAggregate(companyId, metricId, periodKey) {
    const entriesSnap = await db.collection('companies').doc(companyId)
        .collection('metricEntries')
        .where('metricId', '==', metricId)
        .where('periodKey', '==', periodKey)
        .get();

    const entries = entriesSnap.docs.map(d => d.data());

    // Group by scope+scopeId
    const groups = {};
    // Also track company-wide totals
    let companySum = 0;
    let companyCount = 0;

    for (const e of entries) {
        const key = `${e.scope || 'user'}:${e.scopeId || e.createdBy || ''}`;
        if (!groups[key]) groups[key] = { scope: e.scope || 'user', scopeId: e.scopeId || e.createdBy || '', sum: 0, count: 0, values: [] };
        groups[key].sum += (e.value || 0);
        groups[key].count++;
        groups[key].values.push(e.value || 0);
        companySum += (e.value || 0);
        companyCount++;
    }

    const batch = db.batch();
    const aggRef = db.collection('companies').doc(companyId).collection('metricAggregates');

    // Write per-scope aggregates
    for (const g of Object.values(groups)) {
        const aggId = `${metricId}_${periodKey}_${g.scope}_${g.scopeId}`;
        const values = g.values;
        batch.set(aggRef.doc(aggId), {
            metricId,
            periodKey,
            scope: g.scope,
            scopeId: g.scopeId,
            sum: g.sum,
            avg: values.length > 0 ? Math.round((g.sum / values.length) * 100) / 100 : 0,
            count: g.count,
            min: values.length > 0 ? Math.min(...values) : 0,
            max: values.length > 0 ? Math.max(...values) : 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    // Write company-wide aggregate
    const compAggId = `${metricId}_${periodKey}_company_${companyId}`;
    batch.set(aggRef.doc(compAggId), {
        metricId,
        periodKey,
        scope: 'company',
        scopeId: companyId,
        sum: companySum,
        avg: companyCount > 0 ? Math.round((companySum / companyCount) * 100) / 100 : 0,
        count: companyCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await batch.commit();
}

// Trigger: when metricEntry is deleted → update aggregate + log
exports.onMetricEntryDelete = functions
    .region(REGION)
    .firestore.document('companies/{companyId}/metricEntries/{entryId}')
    .onDelete(async (snap, context) => {
        const { companyId } = context.params;
        const data = snap.data();
        if (!data.metricId || !data.periodKey) return null;

        // Audit log
        await db.collection('companies').doc(companyId)
            .collection('metricAuditLog').add({
                metricId: data.metricId,
                entryId: context.params.entryId,
                periodKey: data.periodKey,
                oldValue: data.value,
                newValue: null,
                changedBy: data.createdBy || '',
                changedAt: admin.firestore.FieldValue.serverTimestamp(),
                reason: 'entry_deleted'
            });

        // Recalc
        await recalcAggregate(companyId, data.metricId, data.periodKey);
        return null;
    });

// Metric limit check: max 50 metrics per company
exports.onMetricCreate = functions
    .region(REGION)
    .firestore.document('companies/{companyId}/metrics/{metricId}')
    .onCreate(async (snap, context) => {
        const { companyId, metricId } = context.params;
        const metricsSnap = await db.collection('companies').doc(companyId)
            .collection('metrics').get();

        if (metricsSnap.size > 50) {
            console.warn(`[STATS] Company ${companyId} exceeded 50 metrics limit. Deleting ${metricId}`);
            await snap.ref.delete();
            return null;
        }

        // Log creation
        await db.collection('companies').doc(companyId)
            .collection('metricAuditLog').add({
                metricId,
                action: 'metric_created',
                name: snap.data().name || '',
                createdBy: snap.data().createdBy || '',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

        return null;
    });
// trigger-1773262405

// ===========================
// MIGRATION: deadline string → Timestamp
// One-time migration for all existing tasks
// Trigger: GET https://REGION-PROJECT.cloudfunctions.net/migrateDeadlines?secret=TALKO_MIGRATE_2026
// ===========================
exports.migrateDeadlines = functions
    .region(REGION)
    .runWith({ timeoutSeconds: 540, memory: '512MB' })
    .https.onRequest(async (req, res) => {
        // Simple secret check
        if (req.query.secret !== 'TALKO_MIGRATE_2026') {
            return res.status(403).send('Forbidden');
        }

        let total = 0, migrated = 0, skipped = 0, errors = 0;

        try {
            const companiesSnap = await db.collection('companies').limit(500).get();

            for (const companyDoc of companiesSnap.docs) {
                const companyId = companyDoc.id;
                let lastDoc = null;

                // Paginate through all tasks
                while (true) {
                    let q = companyDoc.ref.collection('tasks').limit(400);
                    if (lastDoc) q = q.startAfter(lastDoc);
                    const tasksSnap = await q.get();
                    if (tasksSnap.empty) break;
                    lastDoc = tasksSnap.docs[tasksSnap.docs.length - 1];

                    const batch = db.batch();
                    let batchCount = 0;

                    for (const taskDoc of tasksSnap.docs) {
                        total++;
                        const t = taskDoc.data();

                        // Skip if deadline already Timestamp
                        if (t.deadline && t.deadline.toDate) { skipped++; continue; }

                        // Skip if no deadline info at all
                        if (!t.deadlineDate && !t.deadline) { skipped++; continue; }

                        // Build Timestamp from deadlineDate + deadlineTime
                        const dateStr = t.deadlineDate || (t.deadline ? t.deadline.split('T')[0] : null);
                        const timeStr = t.deadlineTime || (t.deadline && t.deadline.includes('T') ? t.deadline.split('T')[1]?.slice(0,5) : null) || '23:59';

                        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) { skipped++; continue; }

                        try {
                            const ts = admin.firestore.Timestamp.fromDate(new Date(`${dateStr}T${timeStr}:00`));
                            const upd = { deadline: ts };
                            // Also reset overdueNotified if deadline was in future (so reminders fire)
                            if (t.overdueNotified === true) {
                                const now = new Date();
                                const deadlineDate = new Date(`${dateStr}T${timeStr}:00`);
                                // If deadline is in future — reset so it gets checked again
                                if (deadlineDate > now) {
                                    upd.overdueNotified = false;
                                    upd.sentReminders = [];
                                }
                            }
                            batch.update(taskDoc.ref, upd);
                            batchCount++;
                            migrated++;
                        } catch(e) {
                            errors++;
                        }
                    }

                    if (batchCount > 0) await batch.commit();
                    if (tasksSnap.docs.length < 400) break;
                }
            }

            const result = { total, migrated, skipped, errors };
            console.log('[migrateDeadlines]', result);
            return res.status(200).json({ ok: true, ...result });

        } catch(e) {
            console.error('[migrateDeadlines] Fatal:', e);
            return res.status(500).json({ ok: false, error: e.message });
        }
    });

// ===========================
// ТЗ ПРІОРИТЕТ 16: FUNCTION OWNER CLOUD FUNCTIONS
// ===========================

// 16a. Щотижневий звіт власнику функції (щопонеділка 9:00)
exports.weeklyFunctionReport = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('0 9 * * 1')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const companiesSnap = await db.collection('companies').limit(200).get();

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;

            // Завантажуємо функції компанії
            const functionsSnap = await companyDoc.ref.collection('functions')
                .where('status', '!=', 'archived').get();
            if (functionsSnap.empty) continue;

            // Завантажуємо задачі за тиждень
            const tasksSnap = await companyDoc.ref.collection('tasks').get();
            const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Регулярні задачі
            const regSnap = await companyDoc.ref.collection('regularTasks').get();
            const allRegular = regSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const todayStr = now.toISOString().split('T')[0];

            for (const funcDoc of functionsSnap.docs) {
                const func = funcDoc.data();
                if (!func.headId) continue;

                // Тимчасовий власник якщо активний
                const ownerId = (func.ownerTempId && func.ownerTempUntil && func.ownerTempUntil >= todayStr)
                    ? func.ownerTempId : func.headId;

                // Отримуємо telegramChatId власника
                const ownerDoc = await companyDoc.ref.collection('users').doc(ownerId).get();
                if (!ownerDoc.exists) continue;
                const owner = ownerDoc.data();
                if (!owner.telegramChatId) continue;
                if (owner.weeklyFunctionReportEnabled === false) continue;

                // Задачі функції
                const funcTasks = allTasks.filter(t => t.function === func.name || t.ownerFunctionId === funcDoc.id);
                const doneThisWeek = funcTasks.filter(t => {
                    if (t.status !== 'done' || !t.completedAt) return false;
                    const dt = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    return dt >= weekAgo;
                });
                const overdue = funcTasks.filter(t =>
                    t.status !== 'done' && t.deadlineDate && t.deadlineDate < todayStr
                );
                const active = funcTasks.filter(t => t.status !== 'done');

                // Регулярні задачі функції
                const funcRegular = allRegular.filter(rt => rt.function === func.name);

                const lang = owner.lang || 'ua';
                const locale = lang === 'en' ? 'en-US' : 'uk-UA';

                let report = `📊 <b>Тижневий звіт функції: ${func.name}</b>\n`;
                report += `📅 ${weekAgo.toLocaleDateString(locale)} — ${now.toLocaleDateString(locale)}\n\n`;
                report += `✅ Виконано задач: <b>${doneThisWeek.length}</b>\n`;
                report += `🔄 Активних: <b>${active.length}</b>\n`;
                if (overdue.length > 0) {
                    report += `⚠️ Прострочено: <b>${overdue.length}</b>\n`;
                    overdue.slice(0, 3).forEach(t => {
                        report += `  • ${t.title} (${t.deadlineDate})\n`;
                    });
                }
                report += `🔁 Регулярних задач: <b>${funcRegular.length}</b>\n`;

                if (func.result) {
                    report += `\n🎯 ЦКП: <i>${func.result}</i>\n`;
                }

                await sendTelegramMessage(owner.telegramChatId, report);
            }
        }
        return null;
    });

// 16b. Перевірка ownerTempUntil (щодня о 8:00)
exports.checkOwnerTempExpiry = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('0 8 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const companiesSnap = await db.collection('companies').limit(200).get();

        for (const companyDoc of companiesSnap.docs) {
            const functionsSnap = await companyDoc.ref.collection('functions')
                .where('ownerTempId', '!=', '').get();

            for (const funcDoc of functionsSnap.docs) {
                const func = funcDoc.data();
                if (!func.ownerTempId || !func.ownerTempUntil) continue;

                // Нормалізуємо дату (може бути рядок або Timestamp)
                const untilStr = func.ownerTempUntil?.toDate
                    ? func.ownerTempUntil.toDate().toISOString().split('T')[0]
                    : String(func.ownerTempUntil).slice(0, 10);

                // Термін закінчився — скидаємо тимчасового власника
                if (untilStr < today) {
                    await funcDoc.ref.update({ ownerTempId: '', ownerTempUntil: '' });
                    console.log(`[OwnerTempExpiry] Cleared temp owner for ${func.name} in ${companyDoc.id}`);
                    continue;
                }

                // Нагадування за день до закінчення
                if (untilStr === tomorrow && func.headId) {
                    const ownerDoc = await companyDoc.ref.collection('users').doc(func.headId).get();
                    const owner = ownerDoc.data();
                    if (owner?.telegramChatId) {
                        const tempOwnerDoc = await companyDoc.ref.collection('users').doc(func.ownerTempId).get();
                        const tempOwnerName = tempOwnerDoc.data()?.name || func.ownerTempId;
                        await sendTelegramMessage(
                            owner.telegramChatId,
                            `⏰ <b>Нагадування</b>\n\nЗавтра закінчуються повноваження тимчасового власника функції <b>${func.name}</b>.\n\nТимчасовий власник: ${tempOwnerName}\nДата: ${func.ownerTempUntil}\n\nПісля цієї дати права повернуться до вас.`
                        );
                    }
                }
            }
        }
        return null;
    });

// 16c. Обробка ескалацій (кожні 30 хвилин)
exports.processEscalations = functions
    .region(REGION)
    .runWith({})
    .pubsub.schedule('every 30 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 хв тому

        const companiesSnap = await db.collection('companies').limit(200).get();

        for (const companyDoc of companiesSnap.docs) {
            const escSnap = await companyDoc.ref.collection('escalations')
                .where('handled', '==', false)
                .get();

            for (const escDoc of escSnap.docs) {
                const esc = escDoc.data();
                const createdAt = esc.createdAt?.toDate ? esc.createdAt.toDate() : new Date(esc.createdAt);

                // Обробляємо тільки ескалації старші 30 хв
                if (createdAt > cutoff) continue;

                try {
                    // Надсилаємо сповіщення власнику батьківської функції
                    if (esc.parentOwnerId) {
                        const ownerDoc = await companyDoc.ref.collection('users').doc(esc.parentOwnerId).get();
                        const owner = ownerDoc.data();
                        if (owner?.telegramChatId) {
                            await sendTelegramMessage(
                                owner.telegramChatId,
                                `🔺 <b>Ескалація</b>\n\nФункція <b>${esc.functionName}</b> має ${esc.overdueCount} прострочених задач.\n\nПотребує вашої уваги як керівника вищого рівня.`
                            );
                        }
                    }

                    // Позначаємо як оброблену
                    await escDoc.ref.update({ handled: true, handledAt: admin.firestore.FieldValue.serverTimestamp() });
                } catch (e) {
                    console.error('[processEscalations] Error:', e.message);
                }
            }
        }
        return null;
    });

// ─────────────────────────────────────────────────────────────
// DAILY BACKUP: кожна компанія → окремий JSON у Cloud Storage
// Запускається щодня о 02:00 UTC
// Bucket: task-manager-44e84-backups (потрібно створити вручну)
// Структура: backups/{companyId}/2026-03-25.json
// ─────────────────────────────────────────────────────────────

const BACKUP_BUCKET = 'task-manager-44e84-backups';

// Всі підколекції що бекапимо для кожної компанії
const BACKUP_SUBCOLLECTIONS = [
    'tasks', 'users', 'functions', 'processes', 'regularTasks',
    'metrics', 'metricEntries', 'crm_deals', 'crm_clients',
    'crm_pipeline', 'settings', 'assistants', 'decisions',
    'escalations', 'aiUsageLog', 'scheduledTasks',
    'processTemplates', 'leads', 'metricAuditLog',
];

async function backupCompany(companyId, companyData, dateStr) {
    const snapshot = { companyId, date: dateStr, collections: {} };

    for (const col of BACKUP_SUBCOLLECTIONS) {
        try {
            const snap = await db.collection('companies').doc(companyId)
                .collection(col).get();
            if (!snap.empty) {
                snapshot.collections[col] = snap.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));
            }
        } catch (e) {
            console.warn(`[backup] skip ${companyId}/${col}:`, e.message);
        }
    }

    // Додаємо мета-дані компанії
    snapshot.companyMeta = companyData;

    const json = JSON.stringify(snapshot, (key, val) => {
        // Конвертуємо Firestore Timestamp → ISO string
        if (val && typeof val === 'object' && val._seconds !== undefined) {
            return new Date(val._seconds * 1000).toISOString();
        }
        return val;
    }, 2);

    const storage = admin.storage().bucket(BACKUP_BUCKET);
    const file = storage.file(`backups/${companyId}/${dateStr}.json`);
    await file.save(json, {
        contentType: 'application/json',
        metadata: {
            cacheControl: 'no-cache',
            metadata: { companyId, date: dateStr }
        }
    });

    console.log(`[backup] ✅ ${companyId} → ${dateStr}.json (${(json.length/1024).toFixed(1)} KB)`);

    // Зберігаємо метадані в Firestore для відображення в UI
    try {
        await db.collection('companies').doc(companyId)
            .collection('backupMeta').doc(dateStr).set({
                date: dateStr,
                sizeKb: (json.length / 1024).toFixed(1),
                type: 'auto',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
    } catch(e) {
        console.warn('[backup] meta save failed:', e.message);
    }

    return json.length;
}

exports.dailyBackup = functions
    .runWith({ timeoutSeconds: 540, memory: '512MB' })
    .pubsub.schedule('0 2 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async () => {
        const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        console.log(`[backup] Starting daily backup for ${dateStr}`);

        // Беремо всі компанії
        const companiesSnap = await db.collection('companies').get();
        if (companiesSnap.empty) {
            console.log('[backup] No companies found');
            return null;
        }

        let success = 0, failed = 0, totalBytes = 0;

        // Обробляємо по 5 компаній паралельно (щоб не вбити квоти)
        const companies = companiesSnap.docs;
        for (let i = 0; i < companies.length; i += 5) {
            const batch = companies.slice(i, i + 5);
            const results = await Promise.allSettled(
                batch.map(doc => backupCompany(doc.id, doc.data(), dateStr))
            );
            results.forEach((r, idx) => {
                if (r.status === 'fulfilled') { success++; totalBytes += r.value; }
                else { failed++; console.error(`[backup] ❌ ${batch[idx].id}:`, r.reason?.message); }
            });
        }

        console.log(`[backup] Done: ${success} ok, ${failed} failed, ${(totalBytes/1024/1024).toFixed(2)} MB total`);
        return null;
    });

// Ручний тригер бекапу однієї компанії (через Firebase Console або API)
// POST /manualBackup з body { companyId: "..." }
exports.manualBackup = functions
    .runWith({ timeoutSeconds: 300, memory: '512MB' })
    .https.onRequest(async (req, res) => {
        // CORS — дозволяємо запити з нашого домену
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, x-backup-secret');
        if (req.method === 'OPTIONS') return res.status(204).send('');

        // Простий захист — перевіряємо secret header
        const secret = req.headers['x-backup-secret'];
        if (secret !== (process.env.BACKUP_SECRET || 'talko-backup-2026')) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { companyId } = req.body;
        if (!companyId) return res.status(400).json({ error: 'companyId required' });

        const dateStr = new Date().toISOString().slice(0, 10);
        try {
            const compDoc = await db.collection('companies').doc(companyId).get();
            if (!compDoc.exists) return res.status(404).json({ error: 'Company not found' });

            const bytes = await backupCompany(companyId, compDoc.data(), dateStr);
            res.json({ ok: true, companyId, date: dateStr, sizeKb: (bytes/1024).toFixed(1) });
        } catch (e) {
            console.error('[manualBackup]', e);
            res.status(500).json({ error: e.message });
        }
    });

// ── Відновлення з бекапу ──────────────────────────────────────
exports.restoreBackup = functions
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .https.onRequest(async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, x-backup-secret');
        if (req.method === 'OPTIONS') return res.status(204).send('');

        const secret = req.headers['x-backup-secret'];
        if (secret !== (process.env.BACKUP_SECRET || 'talko-backup-2026')) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { companyId, date } = req.body;
        if (!companyId || !date) return res.status(400).json({ error: 'companyId and date required' });

        try {
            const storage = admin.storage().bucket(BACKUP_BUCKET);
            const file = storage.file(`backups/${companyId}/${date}.json`);
            const [exists] = await file.exists();
            if (!exists) return res.status(404).json({ error: `Backup ${date} not found` });

            const [content] = await file.download();
            const backup = JSON.parse(content.toString());

            let restored = 0;
            for (const [colName, docs] of Object.entries(backup.collections || {})) {
                for (const doc of docs) {
                    const { id, ...data } = doc;
                    await db.collection('companies').doc(companyId)
                        .collection(colName).doc(id).set(data);
                    restored++;
                }
            }

            console.log(`[restore] ✅ ${companyId} from ${date}: ${restored} docs`);
            res.json({ ok: true, companyId, date, restored });
        } catch(e) {
            console.error('[restoreBackup]', e);
            res.status(500).json({ error: e.message });
        }
    });
// ===========================
// REGISTER BOT COMMANDS (викликати один раз вручну)
// ===========================
exports.registerBotCommands = functions
    .region(REGION)
    .https.onRequest(async (req, res) => {
        const token = getTelegramToken();
        const api = `https://api.telegram.org/bot${token}/setMyCommands`;

        const commandsByLang = {
            uk: [
                { command: 'today',   description: 'Завдання на сьогодні' },
                { command: 'overdue', description: 'Прострочені завдання' },
                { command: 'task',    description: 'Поставити завдання: /task @імя Назва | дата' },
                { command: 'weekly',  description: 'Тижневий звіт' },
                { command: 'team',    description: 'Статус команди' },
                { command: 'lang',    description: 'Змінити мову бота: /lang uk | ru | en' },
                { command: 'connect', description: 'Підключити Telegram до акаунту' },
                { command: 'help',    description: 'Довідка' },
            ],
            ru: [
                { command: 'today',   description: 'Задачи на сегодня' },
                { command: 'overdue', description: 'Просроченные задачи' },
                { command: 'task',    description: 'Поставить задачу: /task @имя Название | дата' },
                { command: 'weekly',  description: 'Отчёт за неделю' },
                { command: 'team',    description: 'Статус команды' },
                { command: 'lang',    description: 'Сменить язык бота: /lang uk | ru | en' },
                { command: 'connect', description: 'Подключить Telegram к аккаунту' },
                { command: 'help',    description: 'Справка' },
            ],
            en: [
                { command: 'today',   description: 'Tasks for today' },
                { command: 'overdue', description: 'Overdue tasks' },
                { command: 'task',    description: 'Create task: /task @name Title | date' },
                { command: 'weekly',  description: 'Weekly report' },
                { command: 'team',    description: 'Team status' },
                { command: 'lang',    description: 'Change bot language: /lang uk | ru | en' },
                { command: 'connect', description: 'Connect Telegram to your account' },
                { command: 'help',    description: 'Help' },
            ],
            de: [
                { command: 'today',   description: 'Aufgaben für heute' },
                { command: 'overdue', description: 'Überfällige Aufgaben' },
                { command: 'task',    description: 'Aufgabe erstellen: /task @name Titel | Datum' },
                { command: 'weekly',  description: 'Wochenbericht' },
                { command: 'team',    description: 'Teamstatus' },
                { command: 'lang',    description: 'Sprache ändern: /lang uk | ru | en' },
                { command: 'connect', description: 'Telegram mit Konto verbinden' },
                { command: 'help',    description: 'Hilfe' },
            ],
            pl: [
                { command: 'today',   description: 'Zadania na dziś' },
                { command: 'overdue', description: 'Zaległe zadania' },
                { command: 'task',    description: 'Utwórz zadanie: /task @imię Tytuł | data' },
                { command: 'weekly',  description: 'Raport tygodniowy' },
                { command: 'team',    description: 'Status zespołu' },
                { command: 'lang',    description: 'Zmień język: /lang uk | ru | en' },
                { command: 'connect', description: 'Połącz Telegram z kontem' },
                { command: 'help',    description: 'Pomoc' },
            ],
        };

        const results = [];
        for (const [lang, commands] of Object.entries(commandsByLang)) {
            const r = await fetch(api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commands,
                    language_code: lang,
                }),
            });
            const d = await r.json();
            results.push({ lang, ok: d.ok, description: d.description });
        }

        // Default (без мови — fallback для всіх інших)
        const rDef = await fetch(api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands: commandsByLang.en }),
        });
        const dDef = await rDef.json();
        results.push({ lang: 'default', ok: dDef.ok });

        res.json({ success: true, results });
    });

// ===========================
// CRM STALE DEALS — deal_stale trigger
// Запускається щодня о 10:00 Kyiv
// Перевіряє угоди, що не рухались N днів
// ===========================
exports.checkStaleCrmDeals = functions
    .region(REGION)
    .runWith({ timeoutSeconds: 300, memory: '256MB' })
    .pubsub.schedule('0 10 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        console.log('[checkStaleCrmDeals] Starting at', now.toISOString());

        // Отримуємо всі активні компанії
        const companiesSnap = await db.collection('companies')
            .where('status', 'in', ['active', 'trial'])
            .limit(100)
            .get()
            .catch(() => db.collection('companies').limit(100).get());

        let totalDealsChecked = 0;
        let totalTriggered = 0;

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;

            try {
                // Завантажуємо активні тригери типу deal_stale для цієї компанії
                const triggersSnap = await db.collection('companies').doc(companyId)
                    .collection('crmTriggers')
                    .where('isActive', '==', true)
                    .where('event', '==', 'deal_stale')
                    .get();

                if (triggersSnap.empty) continue;

                const triggers = triggersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Для кожного тригера знаходимо staleDays з умов
                for (const trigger of triggers) {
                    const staleDaysCondition = (trigger.conditions || [])
                        .find(c => c.field === 'staleDays');
                    const staleDays = parseInt(staleDaysCondition?.value) || 7;

                    const cutoffDate = new Date(now);
                    cutoffDate.setDate(cutoffDate.getDate() - staleDays);
                    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

                    // Угоди що не рухались з cutoffDate
                    // stageEnteredAt або updatedAt <= cutoff, stage не 'won' і не 'lost'
                    const dealsSnap = await db.collection('companies').doc(companyId)
                        .collection('crm_deals')
                        .where('stage', 'not-in', ['won', 'lost'])
                        .limit(100)
                        .get();

                    totalDealsChecked += dealsSnap.size;

                    for (const dealDoc of dealsSnap.docs) {
                        const deal = { id: dealDoc.id, ...dealDoc.data() };

                        // Визначаємо дату останнього руху
                        const lastMove = deal.stageEnteredAt
                            ? (deal.stageEnteredAt.toDate ? deal.stageEnteredAt.toDate() : new Date(deal.stageEnteredAt))
                            : deal.updatedAt
                                ? (deal.updatedAt.toDate ? deal.updatedAt.toDate() : new Date(deal.updatedAt))
                                : null;

                        if (!lastMove) continue;
                        if (lastMove > cutoffDate) continue; // рухалась недавно

                        // Перевіряємо чи вже надсилали сьогодні для цієї угоди+тригера
                        const todayStr = now.toISOString().split('T')[0];
                        const logId = `stale_${trigger.id}_${todayStr}`;
                        const logRef = db.collection('companies').doc(companyId)
                            .collection('crmTriggers').doc(trigger.id)
                            .collection('log').doc(`${dealDoc.id}_${todayStr}`);

                        const logSnap = await logRef.get();
                        if (logSnap.exists) continue; // вже відправляли сьогодні

                        const actualStaleDays = Math.floor((now - lastMove) / (1000 * 60 * 60 * 24));

                        // Перевіряємо решту умов тригера (крім staleDays)
                        const otherConditions = (trigger.conditions || [])
                            .filter(c => c.field !== 'staleDays');

                        let conditionsOk = true;
                        for (const cond of otherConditions) {
                            const dealVal = String(deal[cond.field] || '');
                            const condVal = String(cond.value || '');
                            if (cond.op === 'eq'  && dealVal !== condVal) { conditionsOk = false; break; }
                            if (cond.op === 'neq' && dealVal === condVal) { conditionsOk = false; break; }
                        }
                        if (!conditionsOk) continue;

                        // Виконуємо дії тригера
                        for (const action of (trigger.actions || [])) {
                            try {
                                if (action.type === 'create_task') {
                                    const dueDays = parseInt(action.dueDays) || 1;
                                    const deadline = new Date(now);
                                    deadline.setDate(deadline.getDate() + dueDays);
                                    await db.collection('companies').doc(companyId)
                                        .collection('tasks').add({
                                            title: `[${trigger.name}] ${action.title || 'Слідкувати за угодою'} — ${deal.clientName || deal.title || ''}`,
                                            dealId: deal.id,
                                            clientName: deal.clientName || '',
                                            deadlineDate: deadline.toISOString().split('T')[0],
                                            assigneeId: deal.assigneeId || null,
                                            status: 'new',
                                            priority: 'high',
                                            source: 'crm_trigger',
                                            triggerId: trigger.id,
                                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                        });
                                }

                                if (action.type === 'send_telegram') {
                                    const msg = (action.message || trigger.name) + '\n' +
                                        `⏰ Угода не рухається ${actualStaleDays} днів\n` +
                                        (deal.clientName ? `👤 ${deal.clientName}\n` : '') +
                                        (deal.amount ? `💰 ${Number(deal.amount).toLocaleString()} грн` : '');

                                    // Знаходимо chatId отримувача
                                    let chatId = null;
                                    if (action.to === 'owner') {
                                        const ownersSnap = await db.collection('companies').doc(companyId)
                                            .collection('users').where('role', '==', 'owner').limit(1).get();
                                        if (!ownersSnap.empty) chatId = ownersSnap.docs[0].data().telegramChatId;
                                    } else if (action.to === 'responsible' && deal.assigneeId) {
                                        const userDoc = await db.collection('companies').doc(companyId)
                                            .collection('users').doc(deal.assigneeId).get();
                                        if (userDoc.exists) chatId = userDoc.data().telegramChatId;
                                    } else if (action.to) {
                                        chatId = action.to; // прямий chatId
                                    }

                                    if (chatId) {
                                        await sendTelegramMessage(chatId,
                                            `🤖 <b>TALKO Тригер — ${trigger.name}</b>\n\n${msg}`
                                        );
                                    }
                                }

                                if (action.type === 'change_assignee' && action.assigneeId) {
                                    await db.collection('companies').doc(companyId)
                                        .collection('crm_deals').doc(deal.id)
                                        .update({ assigneeId: action.assigneeId, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
                                }

                                if (action.type === 'add_tag' && action.tag) {
                                    await db.collection('companies').doc(companyId)
                                        .collection('crm_deals').doc(deal.id)
                                        .update({ tags: admin.firestore.FieldValue.arrayUnion(action.tag) });
                                }

                                if (action.type === 'move_stage' && action.stage) {
                                    await db.collection('companies').doc(companyId)
                                        .collection('crm_deals').doc(deal.id)
                                        .update({
                                            stage: action.stage,
                                            stageEnteredAt: admin.firestore.FieldValue.serverTimestamp(),
                                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                                        });
                                }
                            } catch(actionErr) {
                                console.error('[checkStaleCrmDeals] action error:', action.type, actionErr.message);
                            }
                        }

                        // Пишемо лог — щоб не повторювати сьогодні
                        await logRef.set({
                            dealId: deal.id,
                            dealTitle: deal.title || deal.clientName || '',
                            triggerId: trigger.id,
                            triggerName: trigger.name,
                            staleDays: actualStaleDays,
                            firedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });

                        totalTriggered++;
                        console.log(`[checkStaleCrmDeals] fired trigger "${trigger.name}" for deal "${deal.clientName || deal.id}" (${actualStaleDays} days stale)`);
                    }
                }
            } catch(companyErr) {
                console.error('[checkStaleCrmDeals] company error:', companyId, companyErr.message);
            }
        }

        console.log(`[checkStaleCrmDeals] Done. Checked: ${totalDealsChecked} deals, triggered: ${totalTriggered}`);
        return null;
    });

// ===========================
// CRM CONTACT REMINDERS (9:15)
// Нагадування менеджерам про угоди де nextContactDate === сьогодні або прострочено
// ===========================
exports.crmContactReminders = functions
    .region(REGION)
    .runWith({ timeoutSeconds: 300, memory: '256MB' })
    .pubsub.schedule('15 9 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' });
        // Прострочені — за останні 7 днів (не флудимо старим)
        const weekAgoDate = new Date(now);
        weekAgoDate.setDate(weekAgoDate.getDate() - 7);
        const weekAgoStr = weekAgoDate.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' });

        console.log('[crmContactReminders] Starting for date:', todayStr);

        const companiesSnap = await db.collection('companies').limit(100).get();
        let totalSent = 0;

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            try {
                // Угоди з nextContactDate сьогодні або прострочені (за тиждень)
                const [todaySnap, overdueSnap] = await Promise.all([
                    companyDoc.ref.collection('crm_deals')
                        .where('nextContactDate', '==', todayStr)
                        .where('stage', 'not-in', ['won', 'lost'])
                        .limit(100)
                        .get(),
                    companyDoc.ref.collection('crm_deals')
                        .where('nextContactDate', '>=', weekAgoStr)
                        .where('nextContactDate', '<', todayStr)
                        .where('stage', 'not-in', ['won', 'lost'])
                        .limit(100)
                        .get(),
                ]);

                const todayDeals = todaySnap.docs.map(d => ({ id: d.id, ...d.data(), _isOverdue: false }));
                const overdueDeals = overdueSnap.docs.map(d => ({ id: d.id, ...d.data(), _isOverdue: true }));
                const allDeals = [...todayDeals, ...overdueDeals];

                if (!allDeals.length) continue;

                // Групуємо по assigneeId
                const byAssignee = {};
                for (const deal of allDeals) {
                    const uid = deal.assigneeId || deal.responsibleId || '_owner';
                    if (!byAssignee[uid]) byAssignee[uid] = [];
                    byAssignee[uid].push(deal);
                }

                // Завантажуємо юзерів компанії один раз
                const usersSnap = await companyDoc.ref.collection('users').get();
                const usersMap = {};
                usersSnap.docs.forEach(d => { usersMap[d.id] = { id: d.id, ...d.data() }; });

                // Знаходимо owner для fallback
                const owner = Object.values(usersMap).find(u => u.role === 'owner');

                for (const [assigneeId, deals] of Object.entries(byAssignee)) {
                    // Визначаємо отримувача
                    let recipient = assigneeId === '_owner'
                        ? owner
                        : usersMap[assigneeId] || owner;

                    if (!recipient?.telegramChatId) continue;

                    const lang = await getUserLang(companyId, recipient.id);

                    const todayList  = deals.filter(d => !d._isOverdue);
                    const overdueList = deals.filter(d => d._isOverdue);

                    let msg = `📞 <b>Контакти на сьогодні</b>\n`;
                    if (assigneeId !== '_owner' && recipient.name) {
                        msg = `📞 <b>Контакти на сьогодні</b> — ${recipient.name}\n`;
                    }
                    msg += `📅 ${todayStr}\n\n`;

                    if (todayList.length) {
                        msg += `✅ <b>Запланований контакт (${todayList.length}):</b>\n`;
                        todayList.slice(0, 10).forEach(d => {
                            const time = d.nextContactTime ? ` о ${d.nextContactTime}` : '';
                            const amount = d.amount ? ` · ${Number(d.amount).toLocaleString()} ₴` : '';
                            const phone = d.phone ? ` · ${d.phone}` : '';
                            msg += `• <b>${d.clientName || d.title || '—'}</b>${time}${amount}${phone}\n`;
                            if (d.note) msg += `  📝 ${d.note.slice(0, 80)}${d.note.length > 80 ? '...' : ''}\n`;
                        });
                        if (todayList.length > 10) msg += `  ...ще ${todayList.length - 10}\n`;
                        msg += '\n';
                    }

                    if (overdueList.length) {
                        msg += `⚠️ <b>Прострочений контакт (${overdueList.length}):</b>\n`;
                        overdueList.slice(0, 5).forEach(d => {
                            const amount = d.amount ? ` · ${Number(d.amount).toLocaleString()} ₴` : '';
                            msg += `• <b>${d.clientName || d.title || '—'}</b> — мав бути ${d.nextContactDate}${amount}\n`;
                        });
                        if (overdueList.length > 5) msg += `  ...ще ${overdueList.length - 5}\n`;
                        msg += '\n';
                    }

                    msg += `🔗 Відкрити CRM: https://apptalko.com`;

                    await sendTelegramMessage(recipient.telegramChatId, msg);
                    totalSent++;
                }
            } catch(companyErr) {
                console.error('[crmContactReminders] company error:', companyId, companyErr.message);
            }
        }

        console.log(`[crmContactReminders] Done. Sent ${totalSent} messages.`);
        return null;
    });

// ═══════════════════════════════════════════════════════════════════════════
// checkOverdueDebtors — щоденна перевірка прострочених боргів (9:30 Kyiv)
// ═══════════════════════════════════════════════════════════════════════════
exports.checkOverdueDebtors = functions
    .region('europe-west1')
    .pubsub.schedule('30 6 * * *') // 06:30 UTC = 09:30 Kyiv
    .timeZone('Europe/Kiev')
    .onRun(async () => {
        const today = new Date().toISOString().slice(0, 10);
        console.log('[checkOverdueDebtors] Running for date:', today);

        let totalOverdue = 0;
        const companiesSnap = await db.collection('companies').get();

        for (const compDoc of companiesSnap.docs) {
            const companyId = compDoc.id;
            try {
                // Знаходимо відкриті прострочені борги
                const debtorsSnap = await compDoc.ref
                    .collection('sales_debtors')
                    .where('status', 'in', ['open', 'partial'])
                    .where('dueDate', '<', today)
                    .get();

                if (debtorsSnap.empty) continue;

                // Оновлюємо статус на overdue
                const batch = db.batch();
                debtorsSnap.docs.forEach(d => {
                    batch.update(d.ref, { status: 'overdue' });
                });
                await batch.commit();

                // Групуємо по менеджерах і надсилаємо Telegram
                const byAssignee = {};
                for (const d of debtorsSnap.docs) {
                    const data = d.data();
                    // Знаходимо менеджера з угоди або реалізації
                    let assigneeId = null;
                    if (data.realizationId) {
                        try {
                            const rSnap = await compDoc.ref.collection('sales_realizations').doc(data.realizationId).get();
                            if (rSnap.exists) assigneeId = rSnap.data().createdBy;
                        } catch(e) { /* skip */ }
                    }
                    if (!assigneeId) continue;
                    if (!byAssignee[assigneeId]) byAssignee[assigneeId] = [];
                    byAssignee[assigneeId].push(data);
                }

                // Сповіщення менеджерам
                for (const [userId, debts] of Object.entries(byAssignee)) {
                    try {
                        const userSnap = await compDoc.ref.collection('users').doc(userId).get();
                        const user = userSnap.data();
                        if (!user?.telegramChatId) continue;

                        const lang = user.telegramLanguage || user.language || 'ua';
                        const isUa = lang !== 'en';

                        let msg = isUa
                            ? `⚠️ <b>Прострочена дебіторка</b>\n\n`
                            : `⚠️ <b>Overdue receivables</b>\n\n`;

                        const totalSum = debts.reduce((s, d) => s + Number(d.amount || 0) - Number(d.paidAmount || 0), 0);

                        debts.slice(0, 5).forEach(d => {
                            const bal = Number(d.amount || 0) - Number(d.paidAmount || 0);
                            const overDays = Math.floor((new Date(today) - new Date(d.dueDate)) / 86400000);
                            msg += isUa
                                ? `• <b>${d.clientName || '—'}</b> — ${bal.toLocaleString()} ${d.currency || 'UAH'} (прострочено ${overDays} дн.)\n`
                                : `• <b>${d.clientName || '—'}</b> — ${bal.toLocaleString()} ${d.currency || 'UAH'} (${overDays} days overdue)\n`;
                        });

                        if (debts.length > 5) {
                            msg += isUa
                                ? `  ...ще ${debts.length - 5}\n`
                                : `  ...and ${debts.length - 5} more\n`;
                        }

                        msg += isUa
                            ? `\n💰 <b>Загалом: ${totalSum.toLocaleString()} UAH</b>\n🔗 <a href="https://apptalko.com">Відкрити TALKO</a>`
                            : `\n💰 <b>Total: ${totalSum.toLocaleString()} UAH</b>\n🔗 <a href="https://apptalko.com">Open TALKO</a>`;

                        await sendTelegramMessage(user.telegramChatId, msg);
                        totalOverdue += debts.length;
                    } catch(userErr) {
                        console.warn('[checkOverdueDebtors] user error:', userId, userErr.message);
                    }
                }

                // Сповіщення власнику (зведене) — тільки якщо він НЕ отримав вже як менеджер
                try {
                    const ownerSnap = await compDoc.ref.collection('users')
                        .where('role', '==', 'owner').limit(1).get();
                    if (!ownerSnap.empty) {
                        const ownerDoc = ownerSnap.docs[0];
                        const owner = ownerDoc.data();
                        const ownerId = ownerDoc.id;
                        // БАГ 10 fix: пропускаємо якщо власник вже отримав сповіщення як менеджер
                        if (owner.telegramChatId && !byAssignee[ownerId]) {
                            const totalBal = debtorsSnap.docs.reduce((s, d) => {
                                const data = d.data();
                                return s + Number(data.amount || 0) - Number(data.paidAmount || 0);
                            }, 0);
                            const lang = owner.telegramLanguage || owner.language || 'ua';
                            const isUa = lang !== 'en';
                            const ownerMsg = isUa
                                ? `📊 <b>Прострочена дебіторка: ${debtorsSnap.size} рахунків</b>\nЗагалом: ${totalBal.toLocaleString()} UAH\n🔗 <a href="https://apptalko.com">Відкрити TALKO</a>`
                                : `📊 <b>Overdue receivables: ${debtorsSnap.size} invoices</b>\nTotal: ${totalBal.toLocaleString()} UAH\n🔗 <a href="https://apptalko.com">Open TALKO</a>`;
                            await sendTelegramMessage(owner.telegramChatId, ownerMsg);
                        }
                    }
                } catch(ownerErr) {
                    console.warn('[checkOverdueDebtors] owner notify error:', companyId, ownerErr.message);
                }

            } catch(compErr) {
                console.error('[checkOverdueDebtors] company error:', companyId, compErr.message);
            }
        }

        console.log(`[checkOverdueDebtors] Done. Overdue: ${totalOverdue}`);
        return null;
    });

// ═══════════════════════════════════════════════════════════════════════════
// onRealizationPosted — Firestore trigger при проведенні реалізації
// ═══════════════════════════════════════════════════════════════════════════
exports.onRealizationPosted = functions
    .region('europe-west1')
    .firestore
    .document('companies/{companyId}/sales_realizations/{realizationId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after  = change.after.data();
        const { companyId, realizationId } = context.params;

        // Спрацьовує тільки при переході draft → posted
        if (before.status === after.status) return null;
        if (after.status !== 'posted') return null;

        console.log('[onRealizationPosted]', realizationId, 'company:', companyId);

        try {
            const compRef = db.collection('companies').doc(companyId);

            // Оновлюємо totalDebt клієнта (денормалізація)
            if (after.clientId && after.debtorEntryId) {
                const clientRef = compRef.collection('crm_clients').doc(after.clientId);
                const clientSnap = await clientRef.get();
                if (clientSnap.exists) {
                    const currentDebt = Number(clientSnap.data().totalDebt || 0);
                    const newAmount = Number(after.totalAmount || 0);
                    await clientRef.update({
                        totalDebt: currentDebt + newAmount,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }

            // Логуємо в activity_log
            await compRef.collection('activity_log').add({
                type:          'realization_posted',
                realizationId,
                clientId:      after.clientId || null,
                clientName:    after.clientName || '',
                totalAmount:   after.totalAmount || 0,
                currency:      after.currency || 'UAH',
                createdBy:     after.createdBy || 'system',
                createdAt:     admin.firestore.FieldValue.serverTimestamp(),
            });

        } catch(e) {
            console.error('[onRealizationPosted] error:', e.message);
        }

        return null;
    });

// ═══════════════════════════════════════════════════════════════════════════
// onDebtorPaid — Firestore trigger при закритті боргу
// ═══════════════════════════════════════════════════════════════════════════
exports.onDebtorPaid = functions
    .region('europe-west1')
    .firestore
    .document('companies/{companyId}/sales_debtors/{debtorId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after  = change.after.data();
        const { companyId, debtorId } = context.params;

        // Спрацьовує тільки при переході → paid
        if (before.status === after.status) return null;
        if (after.status !== 'paid') return null;

        console.log('[onDebtorPaid]', debtorId, 'company:', companyId);

        try {
            const compRef = db.collection('companies').doc(companyId);

            // Зменшуємо totalDebt клієнта
            if (after.clientId) {
                const clientRef = compRef.collection('crm_clients').doc(after.clientId);
                const clientSnap = await clientRef.get();
                if (clientSnap.exists) {
                    const currentDebt = Number(clientSnap.data().totalDebt || 0);
                    const paidAmount  = Number(after.paidAmount || after.amount || 0);
                    await clientRef.update({
                        totalDebt: Math.max(0, currentDebt - paidAmount),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }

            // Логуємо
            await compRef.collection('activity_log').add({
                type:       'debtor_paid',
                debtorId,
                clientId:   after.clientId || null,
                clientName: after.clientName || '',
                amount:     after.paidAmount || after.amount || 0,
                currency:   after.currency || 'UAH',
                createdAt:  admin.firestore.FieldValue.serverTimestamp(),
            });

        } catch(e) {
            console.error('[onDebtorPaid] error:', e.message);
        }

        return null;
    });

// ═══════════════════════════════════════════════════════════════════════════
// migrateWarehouseAndClients — одноразова міграція існуючих даних
// HTTPS endpoint: GET /migrateWarehouseAndClients
// Додає поля: warehouse_items.reserved=0, crm_clients.creditLimit/priceTypeId/totalDebt
// Безпечно запускати кілька разів (idempotent)
// ═══════════════════════════════════════════════════════════════════════════
exports.migrateWarehouseAndClients = functions
    .region('europe-west1')
    .runWith({ timeoutSeconds: 540, memory: '512MB' })
    .https.onRequest(async (req, res) => {
        // Тільки суперадмін
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (token !== 'talko-migrate-2026') {
            return res.status(403).json({ error: 'forbidden' });
        }

        console.log('[migrate] Starting warehouse + clients migration...');

        const results = {
            warehouseItemsUpdated: 0,
            warehouseItemsSkipped: 0,
            clientsUpdated: 0,
            clientsSkipped: 0,
            errors: [],
            companies: 0,
        };

        try {
            const companiesSnap = await db.collection('companies').get();
            results.companies = companiesSnap.size;

            for (const compDoc of companiesSnap.docs) {
                const cid = compDoc.id;
                console.log(`[migrate] Processing company: ${cid}`);

                // ── 1. warehouse_items — додаємо reserved:0 якщо немає ──
                try {
                    const itemsSnap = await compDoc.ref.collection('warehouse_items').get();
                    const whBatch = db.batch();
                    let whCount = 0;

                    for (const itemDoc of itemsSnap.docs) {
                        const data = itemDoc.data();
                        // Пропускаємо якщо поле вже є
                        if (data.reserved !== undefined) {
                            results.warehouseItemsSkipped++;
                            continue;
                        }
                        whBatch.update(itemDoc.ref, {
                            reserved:  0,
                            available: Number(data.quantity || 0),
                        });
                        whCount++;
                        results.warehouseItemsUpdated++;

                        // Firestore batch limit = 500
                        if (whCount % 400 === 0) {
                            await whBatch.commit();
                            console.log(`[migrate] wh batch committed: ${whCount}`);
                        }
                    }
                    if (whCount % 400 !== 0) await whBatch.commit();
                } catch(e) {
                    console.error(`[migrate] wh error ${cid}:`, e.message);
                    results.errors.push(`wh:${cid}: ${e.message}`);
                }

                // ── 2. warehouse_stock — синхронізуємо available ──
                try {
                    const stockSnap = await compDoc.ref.collection('warehouse_stock').get();
                    const stockBatch = db.batch();
                    let sCount = 0;

                    for (const stockDoc of stockSnap.docs) {
                        const data = stockDoc.data();
                        if (data.reserved !== undefined) continue; // вже мігровано
                        const qty = Number(data.quantity || 0);
                        stockBatch.update(stockDoc.ref, { reserved: 0, available: qty });
                        sCount++;
                        if (sCount % 400 === 0) await stockBatch.commit();
                    }
                    if (sCount % 400 !== 0 && sCount > 0) await stockBatch.commit();
                } catch(e) {
                    console.error(`[migrate] stock error ${cid}:`, e.message);
                    results.errors.push(`stock:${cid}: ${e.message}`);
                }

                // ── 3. crm_clients — додаємо нові поля якщо немає ──
                try {
                    const clientsSnap = await compDoc.ref.collection('crm_clients').get();
                    let clBatch = db.batch();
                    let clCount = 0;
                    let batchSize = 0;

                    for (const clientDoc of clientsSnap.docs) {
                        const data = clientDoc.data();
                        const updates = {};
                        let needsUpdate = false;

                        if (data.creditLimit === undefined) { updates.creditLimit = 0; needsUpdate = true; }
                        if (data.priceTypeId === undefined) { updates.priceTypeId = null; needsUpdate = true; }
                        if (data.totalDebt === undefined) { updates.totalDebt = 0; needsUpdate = true; }
                        if (data.paymentCondition === undefined) { updates.paymentCondition = 'prepay'; needsUpdate = true; }
                        if (data.paymentDueDays === undefined) { updates.paymentDueDays = 0; needsUpdate = true; }

                        if (needsUpdate) {
                            clBatch.update(clientDoc.ref, updates);
                            clCount++;
                            batchSize++;
                            results.clientsUpdated++;
                            // Після кожних 400 — commit і новий batch
                            if (batchSize >= 400) {
                                await clBatch.commit();
                                clBatch = db.batch(); // новий batch
                                batchSize = 0;
                            }
                        } else {
                            results.clientsSkipped++;
                        }
                    }
                    // Залишок
                    if (batchSize > 0) await clBatch.commit();
                } catch(e) {
                    console.error(`[migrate] clients error ${cid}:`, e.message);
                    results.errors.push(`clients:${cid}: ${e.message}`);
                }
            }

            console.log('[migrate] Done:', JSON.stringify(results));
            return res.json({ success: true, results });

        } catch(e) {
            console.error('[migrate] Fatal:', e.message);
            return res.status(500).json({ error: e.message, results });
        }
    });
