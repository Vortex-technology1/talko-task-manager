# TALKO System — Таск Менеджер Pro

## Структура проєкту (модульна)

```
talko-task-manager/
├── index.html                  # Головний HTML (тільки розмітка + підключення)
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker (оновлений для модулів)
├── firebase.json               # Firebase hosting config
├── .firebaserc                 # Firebase project
├── .gitignore
│
├── css/                        # Стилі (розбиті по компонентах)
│   ├── variables.css           # CSS змінні (:root)
│   ├── base.css                # Body, header, layout, tabs
│   ├── myday.css               # Мій день
│   ├── filters-structure.css   # Фільтри, структура функцій
│   ├── projects.css            # Проєкти
│   ├── tables-forms.css        # Таблиці, форми, картки
│   ├── modals-auth.css         # Модальні вікна, авторизація
│   ├── mobile.css              # Мобільна адаптація
│   ├── components.css          # Компоненти (кнопки, бейджі, тощо)
│   ├── kanban-calendar.css     # Kanban, календар
│   ├── animations-misc.css     # Анімації, тултіпи, інше
│   ├── focus-mode.css          # Режим фокусу
│   └── undo-toast.css          # Toast повідомлення
│
├── js/modules/                 # JavaScript (64 модулі по функціоналу)
│   ├── 01-translations.js      # Переклади UA/RU/EN
│   ├── 02-firebase-config.js   # Firebase конфігурація
│   ├── 03-app-state.js         # Глобальний стан додатку
│   ├── 04-google-calendar-config.js
│   ├── 05-auth-functions.js    # Авторизація
│   ├── 06-auth-state-listener.js
│   ├── 07-data-loading.js      # Завантаження даних
│   ├── 08-notifications-*.js   # Звук, бейдж, заголовок
│   ├── 09-auto-generate-*.js   # Авто-генерація регулярних
│   ├── 10-auto-archive-*.js    # Авто-архів (>30 днів)
│   ├── 11-archive-ui.js        # UI архіву
│   ├── 12-my-day-popup.js      # Попап "Мій день"
│   ├── 13-tasks.js             # CRUD завдань
│   ├── 14-reminders-*.js       # Нагадування
│   ├── 15-validation-*.js      # Валідація, безпека
│   ├── 16-review-system.js     # Перевірка постановником
│   ├── 17-time-tracking.js     # Трекінг часу
│   ├── 18-checklist.js         # Чеклісти
│   ├── 19-user-checkboxes.js   # Співвиконавці, спостерігачі
│   ├── 20-deadline-*.js        # Валідація дедлайнів
│   ├── 21-calendar-view.js     # Календар
│   ├── 22-my-day-rendering.js  # Рендер "Мій день"
│   ├── 23-status-filter.js     # Мульти-фільтр статусів
│   ├── 24-table-*.js           # Resize/sort колонок
│   ├── 25-functions.js         # Функції бізнесу
│   ├── 26-functions-*.js       # Структура функцій
│   ├── 27-processes.js         # Направляючі форми
│   ├── 28-projects.js          # Проєкти
│   ├── 29-auto-advance.js      # Автопросування процесів
│   ├── 30-regular-tasks.js     # Регулярні завдання
│   ├── 31-regular-calendar.js  # Календар регулярних
│   ├── 32-users-invites.js     # Користувачі, запрошення
│   ├── 33-control-dashboard.js # Панель контролю
│   ├── 34-admin-functions.js   # Адмін-функції
│   ├── 35-helpers.js           # Утиліти
│   ├── 36-swipe-complete.js    # Свайп для завершення
│   ├── 37-browser-notif.js     # Push-сповіщення
│   ├── 38-gcal-integration.js  # Google Calendar
│   ├── 39-telegram-*.js        # Telegram бот
│   ├── 40-calendar-actions.js  # Швидкі дії календаря
│   ├── 41-demo-data.js         # Демо-дані
│   ├── 42-swipe-tabs.js        # Свайп між табами
│   ├── 43-pull-refresh.js      # Pull-to-refresh
│   ├── 44-offline-support.js   # Офлайн режим
│   ├── 45-comments-system.js   # Коментарі
│   ├── 46-audit-log.js         # Аудит-лог
│   ├── 47-cascading-*.js       # Каскадна ескалація
│   ├── 48-kanban-board.js      # Kanban дошка
│   ├── 49-file-attachments.js  # Файлові вкладення
│   ├── 50-next-task.js         # AI-пріоритезація
│   ├── 51-morning-start.js     # Авто-старт дня
│   ├── 52-task-timer.js        # Таймер задач
│   ├── 53-onboarding-hints.js  # Підказки для нових
│   ├── 54-personal-analytics.js # Аналітика співробітника
│   ├── 55-team-dashboard.js    # Дашборд команди
│   ├── 56-daily-snapshot.js    # Щоденний знімок (AGI)
│   ├── 57-decision-log.js      # Лог рішень (AGI)
│   ├── 58-ai-generator.js      # AI генератор структури
│   ├── 59-ai-assistants.js     # AI асистенти (owner)
│   ├── 60-manual-incidents.js  # Журнал збоїв
│   ├── 61-task-templates.js    # Шаблони завдань
│   ├── 62-completion-report.js # Звіт виконання
│   ├── 63-notification-center.js # Центр сповіщень
│   └── 64-focus-mode.js        # Режим фокусу
│
├── icons/                      # PWA іконки
├── api/
│   └── telegram.js             # Telegram webhook
└── functions/
    ├── index.js                # Firebase Cloud Functions
    ├── package.json
    └── package-lock.json
```

## Як працювати

### Редагувати окремий модуль
Кожен JS-файл — самостійна секція. Знайди потрібний модуль по назві і редагуй.

### Додати новий функціонал
1. Створи `js/modules/65-new-feature.js`
2. Додай `<script src="js/modules/65-new-feature.js"></script>` в `index.html`
3. Оновити `sw.js` precache якщо потрібно офлайн

### Deploy
```bash
firebase deploy
```

## Порядок завантаження JS
Файли пронумеровані і завантажуються послідовно. Порядок важливий:
- **01-04**: Конфіг (translations, firebase, state, gcal)
- **05-07**: Auth + завантаження даних
- **08-64**: Функціонал (можна переставляти, але залежності врахувати)
