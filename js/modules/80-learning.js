// =====================
// MODULE 80: LEARNING PLATFORM
// =====================
(function() {

    // ── Course Data ──────────────────────────────────────────
    const learningCourseData = [
            {
                id: 0,
                title: "МАРШРУТ ПРОГРАМИ",
                title_ru: "МАРШРУТ ПРОГРАММЫ",
                subtitle: "AI-асистент розкаже що далі",
                subtitle_ru: "AI-ассистент расскажет что дальше",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що це</div>
    </div>
    <div class="lesson-block-content">
        <p>Це ваш <strong>маршрут програми</strong> — повна карта всіх етапів систематизації бізнесу.</p>
        <p style="margin-top: 12px;">AI-асистент проведе вас через кожен крок і розкаже, що потрібно зробити далі.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Відкрийте маршрут</div>
    </div>
    <div class="lesson-block-content">
        <p>Перегляньте повну карту програми — всі етапи та їх послідовність:</p>
        <div style="margin-top: 12px;">
            <a href="https://alextalko.com/algoritm" target="_blank" class="action-btn primary">
                
                Відкрити маршрут програми
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Пройдіть AI-асистента</div>
    </div>
    <div class="lesson-block-content">
        <p>Асистент розкаже:</p>
        <ul>
            <li>Які етапи вас чекають</li>
            <li>Що потрібно зробити на кожному</li>
            <li>Як підготуватись до наступних кроків</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат</div>
    </div>
    <div class="lesson-block-content">
        <p>Ви отримаєте повне розуміння програми і будете точно знати, що робити далі на кожному етапі.</p>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Что это</div>
    </div>
    <div class="lesson-block-content">
        <p>Это ваш <strong>маршрут программы</strong> — полная карта всех этапов систематизации бизнеса.</p>
        <p style="margin-top: 12px;">AI-ассистент проведёт вас через каждый шаг и расскажет, что нужно делать дальше.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Откройте маршрут</div>
    </div>
    <div class="lesson-block-content">
        <p>Просмотрите полную карту программы:</p>
        <div style="margin-top: 12px;">
            <a href="https://alextalko.com/algoritm" target="_blank" class="action-btn primary">
                
                Открыть маршрут программы
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Пройдите AI-ассистента</div>
    </div>
    <div class="lesson-block-content">
        <p>Ассистент расскажет:</p>
        <ul>
            <li>Какие этапы вас ждут</li>
            <li>Что нужно сделать на каждом</li>
            <li>Как подготовиться к следующим шагам</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат</div>
    </div>
    <div class="lesson-block-content">
        <p>Вы получите полное понимание программы и будете точно знать, что делать дальше на каждом этапе.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Відкрийте маршрут програми</li>
            <li>Пройдіть AI-асистента</li>
            <li>Напишіть у полі завдання: "Маршрут вивчено"</li>
        </ol>
    </div>
</div>
                `,

                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Откройте маршрут программы</li>
            <li>Пройдите AI-ассистента</li>
            <li>Напишите в поле задания: "Маршрут изучен"</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-68568e2561ac8191a0a71e31dc7cb74d-ai-kouch-konsultant-alex-talko-pidgotovka",
                homeworkLinkName: "→ AI-асистент маршруту",
                homeworkLinkName_ru: "→ AI-ассистент маршрута",
                time: 15
            },
            {
                id: 1,
                title: "ЯК ПРАЦЮВАТИ З GOOGLE ДИСКОМ",
                title_ru: "КАК РАБОТАТЬ С GOOGLE ДИСКОМ",
                subtitle: "Google Диск, Таблиці та Telegram Web",
                subtitle_ru: "Google Диск, Таблицы и Telegram Web",
                
                videoLink: "https://youtu.be/sbsgKYlPuqw?si=Oei3lJ72PZctvtzz",
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Про що цей урок</div>
    </div>
    <div class="lesson-block-content">
        <p>Урок показує, як працювати з <strong>Google Диском</strong>: створювати папки, документи й таблиці, завантажувати файли, давати доступ за посиланням та надсилати ці матеріали через <strong>Telegram Web</strong>.</p>
        <p style="margin-top: 12px;"><strong>Ви навчитесь:</strong></p>
        <ul>
            <li>Створювати папки та організовувати файли</li>
            <li>Працювати з Google Документами та Таблицями</li>
            <li>Налаштовувати доступ за посиланням</li>
            <li>Надсилати матеріали через Telegram Web</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Перегляньте відео</div>
    </div>
    <div class="lesson-block-content">
        <p>У відео покроково показано весь процес роботи з Google Диском — від створення папки до надсилання посилання.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Створіть папку на Google Диску</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Назва папки:</strong> <code>Систематизація TALKO – Ім'я Прізвище</code></p>
        <p style="margin-top: 8px;">Це буде ваша основна робоча папка для всіх матеріалів програми.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 3. Створіть файли всередині папки</div>
    </div>
    <div class="lesson-block-content">
        <p>Створіть 3 файли:</p>
        <ul>
            <li>Google Документ — <code>Документ 1</code></li>
            <li>Google Документ — <code>Документ 2</code></li>
            <li>Google Таблицю — <code>Таблиця 1</code></li>
        </ul>
        <p style="margin-top: 8px; color: #64748b; font-size: 14px;">Вміст не важливий — можна написати «тест».</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 4. Надайте доступ до папки</div>
    </div>
    <div class="lesson-block-content">
        <p>Налаштуйте доступ: <strong>Усі, хто має посилання → Коментувати</strong></p>
        <p style="margin-top: 8px;">Скопіюйте посилання на папку.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 5. Надішліть в бот підтримки</div>
    </div>
    <div class="lesson-block-content">
        <p>Надішліть посилання на папку в бот підтримки у форматі:</p>
        <div style="margin-top: 12px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-family: monospace; font-size: 14px;">
            Моє ДЗ:<br>
            Папка: &lt;посилання&gt;
        </div>
    </div>
</div>
                `,
                
                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">О чём этот урок</div>
    </div>
    <div class="lesson-block-content">
        <p>Урок показывает, как работать с <strong>Google Диском</strong>: создавать папки, документы и таблицы, загружать файлы, давать доступ по ссылке и отправлять эти материалы через <strong>Telegram Web</strong>.</p>
        <p style="margin-top: 12px;"><strong>Вы научитесь:</strong></p>
        <ul>
            <li>Создавать папки и организовывать файлы</li>
            <li>Работать с Google Документами и Таблицами</li>
            <li>Настраивать доступ по ссылке</li>
            <li>Отправлять материалы через Telegram Web</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Посмотрите видео</div>
    </div>
    <div class="lesson-block-content">
        <p>В видео пошагово показан весь процесс работы с Google Диском — от создания папки до отправки ссылки.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Создайте папку на Google Диске</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Название папки:</strong> <code>Систематизация TALKO – Ваше Имя</code></p>
        <p style="margin-top: 8px;">Это будет ваша основная рабочая папка для всех материалов программы.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Создайте файлы внутри папки</div>
    </div>
    <div class="lesson-block-content">
        <p>Создайте 3 файла:</p>
        <ul>
            <li>Google Документ — <code>Документ 1</code></li>
            <li>Google Документ — <code>Документ 2</code></li>
            <li>Google Таблицу — <code>Таблица 1</code></li>
        </ul>
        <p style="margin-top: 8px; color: #64748b; font-size: 14px;">Содержимое не важно — можно написать «тест».</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 4. Дайте доступ к папке</div>
    </div>
    <div class="lesson-block-content">
        <p>Настройте доступ: <strong>Все, у кого есть ссылка → Комментировать</strong></p>
        <p style="margin-top: 8px;">Скопируйте ссылку на папку.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 12px; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">1</span>
                <span>Створіть папку <code>Систематизація TALKO – Ваше Ім'я</code></span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">2</span>
                <span>Всередині створіть 2 документи і 1 таблицю</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">3</span>
                <span>Натисніть «Поділитися» → «Усі, хто має посилання»</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">4</span>
                <span>Скопіюйте посилання на папку</span>
            </div>
        </div>
        <div style="padding: 16px; background: #f0fdf4; border-radius: 10px; border: 2px solid #22c55e;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                
                <span style="font-weight: 700; color: #166534; font-size: 15px;">ВСТАВТЕ ПОСИЛАННЯ СЮДИ</span>
                
            </div>
            <textarea placeholder="https://drive.google.com/drive/folders/..." style="width: 100%; min-height: 60px; padding: 12px; border: 1px solid #22c55e; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>
                `,
                
                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 12px; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">1</span>
                <span>Создайте папку <code>Систематизация TALKO – Ваше Имя</code></span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">2</span>
                <span>Внутри создайте 2 документа и 1 таблицу</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">3</span>
                <span>Нажмите «Поделиться» → «Все, у кого есть ссылка»</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">4</span>
                <span>Скопируйте ссылку на папку</span>
            </div>
        </div>
        <div style="padding: 16px; background: #f0fdf4; border-radius: 10px; border: 2px solid #22c55e;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                
                <span style="font-weight: 700; color: #166534; font-size: 15px;">ВСТАВЬТЕ ССЫЛКУ СЮДА</span>
                
            </div>
            <textarea placeholder="https://drive.google.com/drive/folders/..." style="width: 100%; min-height: 60px; padding: 12px; border: 1px solid #22c55e; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>
                `,
                
                homeworkLink: null,
                time: 15
            },
            {
                id: 2,
                title: "СЛОВНИК ТЕРМІНІВ + ЕФЕКТИВНЕ НАВЧАННЯ",
                title_ru: "СЛОВАРЬ ТЕРМИНОВ + ЭФФЕКТИВНОЕ ОБУЧЕНИЕ",
                subtitle: "Говоримо однією мовою",
                subtitle_ru: "Говорим на одном языке",
                
                videoLink: "https://youtu.be/NsI4kEuT6Z8",
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Суть уроку</div>
    </div>
    <div class="lesson-block-content">
        <p>Перш ніж будувати систему — потрібно говорити однією мовою. Коли ви кажете "функція", а співробітник розуміє "задача" — виникає хаос.</p>
        <p style="margin-top: 12px;"><strong>Без єдиної термінології:</strong></p>
        <ul>
            <li>Ви просите "результат" — вам приносять "звіт про активність"</li>
            <li>Ви питаєте "скільки заробили" — вам кажуть "скільки дзвінків зробили"</li>
            <li>Неможливо делегувати, контролювати, масштабуватись</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Створіть робочу папку</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Назва:</strong> СИСТЕМАТИЗАЦІЯ TALKO</p>
        <p>Зберігайте тут всі матеріали та домашні завдання курсу.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Пройдіть AI-асистента термінології</div>
    </div>
    <div class="lesson-block-content">
        <p>Асистент працює в 2 режимах:</p>
        <ul>
            <li><strong>Режим НАВЧАННЯ</strong> — проведе вас через 13 ключових понять з прикладами саме для вашої ніші</li>
            <li><strong>Режим КОНСУЛЬТАЦІЇ</strong> — ви описуєте ситуацію зі свого бізнесу, асистент "перекладає" її в правильну управлінську мову</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 3. Завантажте матеріали</div>
    </div>
    <div class="lesson-block-content">
        <p>Всі необхідні файли та шаблони для роботи.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройти асистента в режимі навчання</li>
            <li>Виписати 20 ключових термінів з визначеннями</li>
            <li>Додати їх у Google-документ у своїй папці</li>
            <li>Прикріпити посилання на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройти ассистента в режиме обучения</li>
            <li>Выписать 20 ключевых терминов с определениями</li>
            <li>Добавить их в Google-документ в своей папке</li>
            <li>Прикрепить ссылку на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-688c4d14d300819186e96a0226712dde-asistent-navchannia-strukturi-upravlinnia-biznesom",
                homeworkLinkName: "→ Асистент термінології",
                homeworkLinkName_ru: "→ Ассистент терминологии",
                time: 15
            },
            {
                id: 3,
                title: "НАЛАШТУВАННЯ ДОСТУПУ ДО AI",
                title_ru: "НАСТРОЙКА ДОСТУПА К AI",
                subtitle: "ChatGPT та Claude AI — ваші робочі інструменти",
                subtitle_ru: "ChatGPT и Claude AI — ваши рабочие инструменты",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Навіщо цей урок</div>
    </div>
    <div class="lesson-block-content">
        <p>Усі AI-асистенти програми працюють на базі <strong>ChatGPT</strong> та <strong>Claude AI</strong>. Щоб проходити уроки, вам потрібен доступ до цих платформ.</p>
        <p style="margin-top: 12px;">Цей урок допоможе налаштувати акаунти та авторизуватись.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Реєстрація в ChatGPT</div>
    </div>
    <div class="lesson-block-content">
        <p>ChatGPT — основна платформа для AI-асистентів програми.</p>
        <ol>
            <li>Перейдіть на <a href="https://chat.openai.com" target="_blank" style="color: var(--primary); font-weight: 600;">chat.openai.com</a></li>
            <li>Натисніть <strong>"Sign up"</strong> (або "Log in" якщо вже є акаунт)</li>
            <li>Зареєструйтесь через Google, Microsoft або email</li>
            <li>Підтвердіть email якщо потрібно</li>
        </ol>
        <div style="margin-top: 12px;">
            <a href="https://chat.openai.com" target="_blank" class="action-btn primary">
                
                Відкрити ChatGPT
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Реєстрація в Claude AI</div>
    </div>
    <div class="lesson-block-content">
        <p>Claude AI — додатковий інструмент для складних задач.</p>
        <ol>
            <li>Перейдіть на <a href="https://claude.ai" target="_blank" style="color: var(--primary); font-weight: 600;">claude.ai</a></li>
            <li>Натисніть <strong>"Sign up"</strong></li>
            <li>Зареєструйтесь через Google або email</li>
            <li>Підтвердіть номер телефону (одноразово)</li>
        </ol>
        <div style="margin-top: 12px;">
            <a href="https://claude.ai" target="_blank" class="action-btn outline">
                
                Відкрити Claude AI
            </a>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Важливо про VPN</div>
    </div>
    <div class="lesson-block-content">
        <p>Якщо сайти не відкриваються — увімкніть <strong>VPN</strong> (США, Європа, Канада).</p>
        <p style="margin-top: 8px;">Рекомендовані VPN: NordVPN, ExpressVPN, Surfshark або безкоштовні розширення для браузера.</p>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Перевірка доступу</div>
    </div>
    <div class="lesson-block-content">
        <p>Після реєстрації перевірте, що все працює:</p>
        <ol>
            <li>Відкрийте будь-якого AI-асистента з програми</li>
            <li>Якщо відкривається діалог — все готово!</li>
            <li>Якщо просить авторизацію — увійдіть в акаунт</li>
        </ol>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Зачем этот урок</div>
    </div>
    <div class="lesson-block-content">
        <p>Все AI-ассистенты программы работают на базе <strong>ChatGPT</strong> и <strong>Claude AI</strong>. Чтобы проходить уроки, вам нужен доступ к этим платформам.</p>
        <p style="margin-top: 12px;">Этот урок поможет настроить аккаунты и авторизоваться.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Регистрация в ChatGPT</div>
    </div>
    <div class="lesson-block-content">
        <p>ChatGPT — основная платформа для AI-ассистентов программы.</p>
        <ol>
            <li>Перейдите на <a href="https://chat.openai.com" target="_blank" style="color: var(--primary); font-weight: 600;">chat.openai.com</a></li>
            <li>Нажмите <strong>"Sign up"</strong> (или "Log in" если уже есть аккаунт)</li>
            <li>Зарегистрируйтесь через Google, Microsoft или email</li>
            <li>Подтвердите email если нужно</li>
        </ol>
        <div style="margin-top: 12px;">
            <a href="https://chat.openai.com" target="_blank" class="action-btn primary">
                
                Открыть ChatGPT
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Регистрация в Claude AI</div>
    </div>
    <div class="lesson-block-content">
        <p>Claude AI — дополнительный инструмент для сложных задач.</p>
        <ol>
            <li>Перейдите на <a href="https://claude.ai" target="_blank" style="color: var(--primary); font-weight: 600;">claude.ai</a></li>
            <li>Нажмите <strong>"Sign up"</strong></li>
            <li>Зарегистрируйтесь через Google или email</li>
            <li>Подтвердите номер телефона (одноразово)</li>
        </ol>
        <div style="margin-top: 12px;">
            <a href="https://claude.ai" target="_blank" class="action-btn outline">
                
                Открыть Claude AI
            </a>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Важно про VPN</div>
    </div>
    <div class="lesson-block-content">
        <p>Если сайты не открываются — включите <strong>VPN</strong> (США, Европа, Канада).</p>
        <p style="margin-top: 8px;">Рекомендуемые VPN: NordVPN, ExpressVPN, Surfshark или бесплатные расширения для браузера.</p>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Проверка доступа</div>
    </div>
    <div class="lesson-block-content">
        <p>После регистрации проверьте, что всё работает:</p>
        <ol>
            <li>Откройте любого AI-ассистента из программы</li>
            <li>Если открывается диалог — всё готово!</li>
            <li>Если просит авторизацию — войдите в аккаунт</li>
        </ol>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 12px; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">1</span>
                <span style="flex: 1; min-width: 150px;">Зареєструйтесь в ChatGPT</span>
                <a href="https://chat.openai.com" target="_blank" style="padding: 6px 12px; background: #22c55e; color: white; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Відкрити</a>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">2</span>
                <span style="flex: 1; min-width: 150px;">Зареєструйтесь в Claude AI</span>
                <a href="https://claude.ai" target="_blank" style="padding: 6px 12px; background: #22c55e; color: white; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Відкрити</a>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">3</span>
                <span>Якщо обидва сайти відкриваються — готово!</span>
            </div>
        </div>
        <div style="padding: 16px; background: #f0fdf4; border-radius: 10px; border: 2px solid #22c55e;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                
                <span style="font-weight: 700; color: #166534; font-size: 15px;">НАПИШІТЬ «ГОТОВО»</span>
                
            </div>
            <textarea placeholder="Готово" style="width: 100%; min-height: 50px; padding: 12px; border: 1px solid #22c55e; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>
                `,

                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 12px; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">1</span>
                <span style="flex: 1; min-width: 150px;">Зарегистрируйтесь в ChatGPT</span>
                <a href="https://chat.openai.com" target="_blank" style="padding: 6px 12px; background: #22c55e; color: white; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Открыть</a>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">2</span>
                <span style="flex: 1; min-width: 150px;">Зарегистрируйтесь в Claude AI</span>
                <a href="https://claude.ai" target="_blank" style="padding: 6px 12px; background: #22c55e; color: white; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Открыть</a>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">3</span>
                <span>Если оба сайта открываются — готово!</span>
            </div>
        </div>
        <div style="padding: 16px; background: #f0fdf4; border-radius: 10px; border: 2px solid #22c55e;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                
                <span style="font-weight: 700; color: #166534; font-size: 15px;">НАПИШИТЕ «ГОТОВО»</span>
                
            </div>
            <textarea placeholder="Готово" style="width: 100%; min-height: 50px; padding: 12px; border: 1px solid #22c55e; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>
                `,
                
                homeworkLink: "https://chat.openai.com",
                homeworkLinkName: "→ Відкрити ChatGPT",
                homeworkLinkName_ru: "→ Открыть ChatGPT",
                time: 10
            },
            {
                id: 4,
                title: "СИСТЕМА РОЗПОРЯДЖЕНЬ",
                title_ru: "СИСТЕМА РАСПОРЯЖЕНИЙ",
                subtitle: "Як проходити урок: переглянути відео",
                subtitle_ru: "Прочитайте инструкцию и выполните задание в AI-ассистенте",
                
                videoLink: "https://youtu.be/wroQPSBgAn0",
                materialsLink: "https://drive.google.com/drive/folders/1BNSRJePCQG0UgcFC399GQcAInS44YZvJ?usp=sharing",
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Суть уроку</div>
    </div>
    <div class="lesson-block-content">
        <p>Чому люди не виконують завдання як слід? Бо ви нечітко формулюєте. "Забезпечити порядок" — це що конкретно? "До кінця дня" — це 14:00 чи 20:00?</p>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Без чітких розпоряджень</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Підлеглі постійно перепитують "а що конкретно робити?"</li>
            <li>Завдання переробляються по 3-4 рази</li>
            <li>Ви витрачаєте 15 хвилин на пояснення замість 30 секунд</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що дає правильне розпорядження</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Працівник розуміє ЩО, ДО КОЛИ і ЯК зробити</li>
            <li>Все виконується з першого разу</li>
            <li>Контроль, прозорість, порядок</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Подивіться відео</div>
    </div>
    <div class="lesson-block-content">
        <p>Розбір системи розпоряджень з реальними прикладами.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Завантажте матеріали</div>
    </div>
    <div class="lesson-block-content">
        <p>Шаблони та приклади правильних розпоряджень.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 3. Генератор розпоряджень</div>
    </div>
    <div class="lesson-block-content">
        <p>Цей інструмент ви будете використовувати <strong>постійно</strong>. Перед тим як дати будь-яке завдання — закиньте його в генератор. За 30 секунд отримаєте чітке розпорядження.</p>
        <p style="margin-top: 12px;"><strong>Як працювати:</strong></p>
        <ol>
            <li>Опишіть завдання своїми словами</li>
            <li>Асистент переформулює його в правильний формат</li>
            <li>Скопіюйте та відправте виконавцю</li>
        </ol>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 4. Познайомтесь з TALKO Task Manager</div>
    </div>
    <div class="lesson-block-content">
        <p>Це платформа для управління завданнями, яку ми будемо використовувати далі в курсі.</p>
        <p style="margin-top: 8px;">Зайдіть в асистента підтримки та задайте йому питання: як він працює, які проблеми допоможе вирішити, як почати користуватись.</p>
        <div style="margin-top: 16px;">
            <a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" class="action-btn outline">
                
                TALKO Task Manager Support
            </a>
        </div>
    </div>
</div>
                `,
                
                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Суть урока</div>
    </div>
    <div class="lesson-block-content">
        <p>Почему люди не выполняют задачи как надо? Потому что вы нечётко формулируете. "Обеспечить порядок" — это что конкретно? "До конца дня" — это 14:00 или 20:00?</p>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Без чётких распоряжений</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Подчинённые постоянно переспрашивают "а что конкретно делать?"</li>
            <li>Задачи переделываются по 3-4 раза</li>
            <li>Вы тратите 15 минут на объяснения вместо 30 секунд</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Что даёт правильное распоряжение</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Работник понимает ЧТО, ДО КОГДА и КАК сделать</li>
            <li>Всё выполняется с первого раза</li>
            <li>Контроль, прозрачность, порядок</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Посмотрите видео</div>
    </div>
    <div class="lesson-block-content">
        <p>Разбор системы распоряжений с реальными примерами.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Скачайте материалы</div>
    </div>
    <div class="lesson-block-content">
        <p>Шаблоны и примеры правильных распоряжений.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Генератор распоряжений</div>
    </div>
    <div class="lesson-block-content">
        <p>Этот инструмент вы будете использовать <strong>постоянно</strong>. Перед тем как дать любую задачу — закиньте её в генератор. За 30 секунд получите чёткое распоряжение.</p>
        <p style="margin-top: 12px;"><strong>Как работать:</strong></p>
        <ol>
            <li>Опишите задачу своими словами</li>
            <li>Ассистент переформулирует её в правильный формат</li>
            <li>Скопируйте и отправьте исполнителю</li>
        </ol>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 4. Познакомьтесь с TALKO Task Manager</div>
    </div>
    <div class="lesson-block-content">
        <p>Это платформа для управления задачами, которую мы будем использовать далее в курсе.</p>
        <p style="margin-top: 8px;">Зайдите в ассистента поддержки и задайте ему вопросы: как он работает, какие проблемы поможет решить, как начать пользоваться.</p>
        <div style="margin-top: 16px;">
            <a href="https://chatgpt.com/g/g-69382bfa841881918aff7b50aa25a4f9-talko-task-manager-support" target="_blank" class="action-btn outline">
                
                TALKO Task Manager Support
            </a>
        </div>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Створіть таблицю розпоряджень (шаблон у матеріалах)</li>
            <li>Згенеруйте через асистента 2-3 реальні розпорядження</li>
            <li>Додайте їх у таблицю</li>
            <li>Поспілкуйтесь з асистентом TALKO Task Manager</li>
            <li>Прикріпіть посилання на таблицю</li>
        </ol>
    </div>
</div>
                `,
                
                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Создайте таблицу распоряжений (шаблон в материалах)</li>
            <li>Сгенерируйте через ассистента 2-3 реальных распоряжения</li>
            <li>Добавьте их в таблицу</li>
            <li>Пообщайтесь с ассистентом TALKO Task Manager</li>
            <li>Прикрепите ссылку на таблицу</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-684be37e3bcc81918f64088a2bb094da-ai-alex-talko-generator-rozporiadzhen-dlia-biznesu",
                homeworkLinkName: "→ AI-генератор розпоряджень",
                homeworkLinkName_ru: "→ AI-генератор распоряжений",
                time: 15
            },
            {
                id: 5,
                title: "СИСТЕМА РАДАР",
                title_ru: "СИСТЕМА РАДАР",
                subtitle: "Як проходити урок: переглянути відео",
                subtitle_ru: "Прочитайте инструкцию и выполните задание в AI-ассистенте",
                
                videoLink: "https://youtu.be/nX5xaLqeeSs",
                materialsLink: "https://drive.google.com/drive/folders/1z1vFSjzGNb-RYd2WdB3TxwmMb9CKN5vG?usp=sharing",
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Суть уроку</div>
    </div>
    <div class="lesson-block-content">
        <p>Коли співробітник приходить до вас з питанням "Що робити?" — він перекладає свою роботу на вас. Правильний підхід: співробітник приходить з <strong>готовим рішенням</strong>, а ви тільки погоджуєте.</p>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Типова проблема</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Співробітник ставить питання без готової пропозиції</li>
            <li>Формулює ідею нечітко — отримує "відбій"</li>
            <li>Сумнівається, що саме запропонувати</li>
            <li>Ви витрачаєте час на обдумування замість нього</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що дає система РАДАР</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Співробітник сам аналізує ситуацію</li>
            <li>Готує 3 варіанти рішення з плюсами/мінусами</li>
            <li>Пропонує оптимальний варіант</li>
            <li>Ви тільки кажете "так" або "ні"</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Подивіться відео</div>
    </div>
    <div class="lesson-block-content">
        <p>Розбір системи РАДАР з реальними прикладами.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Розберіться з AI-асистентом РАДАР</div>
    </div>
    <div class="lesson-block-content">
        <p>Цей інструмент — <strong>для ваших співробітників</strong>. Розберіться самі, як він працює, а потім дайте посилання команді.</p>
        <p style="margin-top: 12px;"><strong>Як працює:</strong></p>
        <ol>
            <li>Співробітник описує ситуацію</li>
            <li>Асистент запитує деталі та дані</li>
            <li>Формує 3 варіанти рішення</li>
            <li>Готує оформлену пропозицію для керівника</li>
        </ol>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 3. Передайте посилання команді</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Правило:</strong> Тепер кожного разу, коли у співробітника питання — він спочатку звертається до цього асистента, а потім приходить до вас з готовим рішенням.</p>
    </div>
</div>
                `,
                
                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Суть урока</div>
    </div>
    <div class="lesson-block-content">
        <p>Когда сотрудник приходит к вам с вопросом "Что делать?" — он перекладывает свою работу на вас. Правильный подход: сотрудник приходит с <strong>готовым решением</strong>, а вы только согласовываете.</p>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Типичная проблема</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Сотрудник задаёт вопрос без готового предложения</li>
            <li>Формулирует идею нечётко — получает "отказ"</li>
            <li>Сомневается, что именно предложить</li>
            <li>Вы тратите время на обдумывание вместо него</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Что даёт система РАДАР</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Сотрудник сам анализирует ситуацию</li>
            <li>Готовит 3 варианта решения с плюсами/минусами</li>
            <li>Предлагает оптимальный вариант</li>
            <li>Вы только говорите "да" или "нет"</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Посмотрите видео</div>
    </div>
    <div class="lesson-block-content">
        <p>Разбор системы РАДАР с реальными примерами.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Разберитесь с AI-ассистентом РАДАР</div>
    </div>
    <div class="lesson-block-content">
        <p>Этот инструмент — <strong>для ваших сотрудников</strong>. Разберитесь сами, как он работает, а потом дайте ссылку команде.</p>
        <p style="margin-top: 12px;"><strong>Как работает:</strong></p>
        <ol>
            <li>Сотрудник описывает ситуацию</li>
            <li>Ассистент спрашивает детали и данные</li>
            <li>Формирует 3 варианта решения</li>
            <li>Готовит оформленное предложение для руководителя</li>
        </ol>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Передайте ссылку команде</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Правило:</strong> Теперь каждый раз, когда у сотрудника вопрос — он сначала обращается к этому ассистенту, а потом приходит к вам с готовым решением.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдіть асистента самі — змоделюйте будь-яку робочу ситуацію</li>
            <li>Скопіюйте посилання на асистента</li>
            <li>Відправте 2-3 співробітникам з інструкцією: "Тепер перед тим як підходити з питанням — спочатку сюди"</li>
            <li>Прикріпіть посилання на документ з описом впровадження</li>
        </ol>
    </div>
</div>
                `,
                
                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдите ассистента сами — смоделируйте любую рабочую ситуацию</li>
            <li>Скопируйте ссылку на ассистента</li>
            <li>Отправьте 2-3 сотрудникам с инструкцией: "Теперь перед тем как подходить с вопросом — сначала сюда"</li>
            <li>Прикрепите ссылку на документ с описанием внедрения</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-684bb075301481918669f787231e1af7-radar-ai-alex-talko",
                homeworkLinkName: "→ AI-асистент РАДАР",
                homeworkLinkName_ru: "→ AI-ассистент РАДАР",
                time: 15
            },
            {
                id: 6,
                title: "ТЕХНІЧНИЙ ПРОВІДНИК",
                subtitle: "AI-асистент для покрокового налаштування систем",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що це</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Технічний провідник</strong> — це AI-інструмент, який допомагає покроково налаштовувати будь-яку систему: CRM, таблицю, бот чи інструмент управління.</p>
        <p style="margin-top: 12px;">Ви просто описуєте, <strong>що хочете отримати в результаті</strong>, і він проведе вас через усі кроки.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Ваше завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Зайдіть у <strong>Технічного провідника</strong></li>
            <li>Вкажіть мету (наприклад: "налаштувати CRM для продажів" або "створити дашборд у Google Sheets")</li>
            <li>Якщо потрібно — <strong>додайте скрін</strong>, і провідник покаже, куди натискати або що виправити</li>
            <li>Пройдіть покрокову інструкцію до готового результату</li>
        </ol>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Для чого</div>
    </div>
    <div class="lesson-block-content">
        <p>Щоб будь-яке технічне налаштування проходило <strong>без плутанини, пошуку в Google і звернень до фахівців</strong> — все під контролем системи.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат</div>
    </div>
    <div class="lesson-block-content">
        <p>Ви протестували інструмент і маєте <strong>особистого технічного асистента</strong>, який допомагає реалізувати будь-яку ідею до робочого результату.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <p>Оберіть одну технічну задачу (налаштування CRM, створення таблиці, налаштування автоматизації) і пройдіть покрокову інструкцію з Технічним провідником до готового результату.</p>
    </div>
</div>
                `,
                
                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <p>Выберите одну техническую задачу (настройка CRM, создание таблицы, настройка автоматизации) и пройдите пошаговую инструкцию с Техническим проводником до готового результата.</p>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-685640bc592881918743da9332b83f31-ai-alex-talko-tekhnichnii-providnik",
                homeworkLinkName: "→ Технічний провідник",
                homeworkLinkName_ru: "→ Технический проводник",
                time: 15
            },
            {
                id: 7,
                title: "ПІДГОТОВКА КОМАНДИ ДО ЗМІН",
                title_ru: "ПОДГОТОВКА КОМАНДЫ К ИЗМЕНЕНИЯМ",
                subtitle: "Як познайомити співробітників з проектом систематизації",
                subtitle_ru: "Как познакомить сотрудников с проектом систематизации",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Навіщо цей урок</div>
    </div>
    <div class="lesson-block-content">
        <p>Коли власник починає зміни без узгодження з командою — виникає опір. Співробітники не розуміють <strong>навіщо</strong> зміни і <strong>до чого</strong> вони приведуть.</p>
        <p style="margin-top: 12px;">Цей урок допоможе правильно підготувати команду: пояснити суть змін, провести навчання і отримати підтримку ключових людей.</p>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">«Ой всьо…» — чому співробітники чинять опір?</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 12px 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 16px;">
            <p style="margin: 0;"><strong>Рекомендація:</strong> Якщо співробітник проявляє опір, образу або пасивну агресію — прочитайте цю статтю разом з ним. Нехай співробітник читає вголос.</p>
        </div>
        
        <details class="accordion-article" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <summary style="padding: 16px; background: #f9fafb; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; list-style: none;">
                
                Стаття: «Ой всьо…» або чому ваші співробітники не сприймають критику
            </summary>
            <div style="padding: 20px; background: white;">
                <h4 style="color: #dc2626; margin-bottom: 16px;">Знайома сцена?</h4>
                <p style="margin-bottom: 16px;">Ви спокійно кажете людині: «Ось тут треба підучитися. Ось так робити правильно».</p>
                <p style="margin-bottom: 16px;">І що у відповідь?</p>
                <ul style="margin-bottom: 20px; padding-left: 20px;">
                    <li>кисле лице</li>
                    <li>образа</li>
                    <li>пасивна агресія</li>
                    <li>"ой всьо, я поняв(ла)"</li>
                    <li>мінімум дій, максимум емоцій</li>
                </ul>
                <p style="margin-bottom: 20px;">Хоча ви навіть не кричали.</p>
                
                <div style="padding: 16px; background: #fef2f2; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; font-weight: 600;">Тут важливо зрозуміти одну неприємну річ:</p>
                    <p style="margin: 8px 0 0 0;">Більшість дорослих працює з психікою 12-річної дитини.<br>Виглядає 30+. Працює 20+. А реагує як школяр, якому вчитель сказав: "Треба підтягнути математику."</p>
                </div>
                
                <h4 style="margin-bottom: 12px;">Чому так?</h4>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">1. Бо вони плутають поради з нападом</p>
                    <p style="margin-bottom: 4px;"><strong>Доросла людина:</strong> "Я можу краще — дякую за уточнення."</p>
                    <p style="margin: 0;"><strong>Дитяча людина:</strong> "Ти сказав, що я поганий. Ой всьо."</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">2. Бо самооцінка крихка, як пластиковий стаканчик</p>
                    <p style="margin: 0;">Будь-яка ремарка = удар по «я хороший». Не витримує навіть легкий натяк, що щось можна зробити інакше. Слабка внутрішня опора → сильні зовнішні реакції.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">3. Бо їх ніхто не навчив розрізняти "я" і "мою дію"</p>
                    <p style="margin: 0;">"Ти зробив помилку" сприймається як "Ти — помилка." Людина з такою логікою приречена ображатися.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">4. Бо критика змушує дорослішати — а цього вони бояться</p>
                    <p style="margin-bottom: 8px;">Критика означає:</p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>визнати реальність</li>
                        <li>змінити поведінку</li>
                        <li>взяти відповідальність</li>
                    </ul>
                    <p style="margin: 8px 0 0 0;">Це боляче. Це дискомфортно. Це не дитяча модель. Тому включається: «ой всьо, я нічого не знаю, робіть самі»</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">5. Бо є глибока установка "я вже маю знати"</p>
                    <p style="margin: 0;">Дуже токсична. Якщо людина вірить, що вона повинна все вміти — то будь-яка порада = доказ слабкості. Не порадить — погано. Порада — теж погано. Парадокс інфантильності.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">6. Бо образа — це спосіб уникнути відповідальності</p>
                    <p style="margin: 0;">Коли працівник ображається, він знімає з себе вантаж дії. Образився → значить, він "жертва", а не виконавець. А жертва нічого не зобов'язана. Зручно. Неефективно. І дуже дорого для бізнесу.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">7. Бо ви говорите по-дорослому, а в них — дитячий фільтр</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Ваше:</strong> "Треба зробити ось так."</td>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Їхнє:</strong> "Мене принизили."</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Ваше:</strong> "Виправ помилку."</td>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Їхнє:</strong> "Мене не цінують."</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Ваше:</strong> "Потрібно навчатися."</td>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Їхнє:</strong> "Я недостатній."</td>
                        </tr>
                    </table>
                </div>
                
                <div style="padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="font-weight: 600; margin-bottom: 8px;">Гола правда</p>
                    <p style="margin: 0;">Не кожен працівник може працювати в компанії, де є стандарти, регламенти, інструкції і чіткі вимоги. Не тому, що вони «погані». А тому що їх психіка ще не доросла до професійної ролі. <strong>Компанія росте — не всі люди ростуть разом із нею.</strong></p>
                </div>
            </div>
        </details>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Підготуйтесь до розмови</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Перед зустріччю:</strong></p>
        <ol>
            <li>Випишіть якості кожного ключового співробітника — чому він важливий</li>
            <li>Напишіть власні тези розмови</li>
            <li>Проговоріть кілька разів вголос</li>
            <li>Увімкніть диктофон під час розмови (для звіту консультанту)</li>
        </ol>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Скрипт розмови (читайте це співробітнику)</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #22c55e; margin-bottom: 16px;">
            <p style="font-style: italic; color: #166534; margin-bottom: 12px;"> <strong>Приклад скрипту — адаптуйте під себе:</strong></p>
            
            <p style="margin-bottom: 12px;">«Вітаю! Наша компанія дійшла до певного рубежу. <strong>Ви — ключовий співробітник</strong>, підтримка та опора всієї компанії. Нам треба разом рухатись далі, розвивати діяльність.</p>
            
            <p style="margin-bottom: 12px;">Для цього ми удосконалюватимемо <strong>систему управління</strong>. Я вирішив брати участь у проекті систематизації бізнесу. У процесі цього консалтингу я наводитиму порядок у компанії, і в цьому мені потрібна буде <strong>ваша допомога</strong>.</p>
            
            <p style="margin-bottom: 12px;"><strong>Скажіть, як ви розумієте слово "управління"?</strong></p>
            
            <p style="margin-bottom: 12px;"><em>[Вислухайте відповідь, потім поясніть:]</em></p>
            
            <p style="margin-bottom: 12px;"><strong>Управління</strong> — це коли ми погоджуємо всі наші дії, щоб вони вели нас до однієї мети. Якщо в компанії добре налагоджено управління — дії кожного співробітника ведуть до загальної мети. Якщо погано — троє йдуть до мети, один йде в інший бік. В результаті рух сповільнюється.»</p>
        </div>
        
        <p style="font-weight: 600; margin-bottom: 12px;"> Замальовка для пояснення (намалюйте на папері):</p>
        
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 3. Розкажіть план змін (продовження скрипту)</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #22c55e;">
            <p style="margin-bottom: 16px;">«Робота буде цікавою і водночас складною. І, як ви розумієте, таку роботу не можна зробити самотужки, ми її робитимемо разом, і мені потрібна буде <strong>ваша підтримка та допомога</strong>.</p>
            
            <p style="margin-bottom: 16px;">Внаслідок цих змін я хочу сформувати <strong>команду керівників</strong>, які керуватимуть оперативною діяльністю компанії. Я хочу ростити виконавчого директора. Я хочу, щоб кожен керівник у нашій компанії професійно, усвідомлено займався управлінням. Я знаю, що нам є куди зростати у цьому питанні.</p>
            
            <p style="margin-bottom: 20px;"><strong>Хороша новина</strong> в тому, що ці зміни ми проводитимемо поступово і плавно протягом цього року. Ще одна гарна новина, що ці зміни матимуть початок та кінець. Ось план організаційних змін:»</p>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Перше</strong> — я опишу, що є основною метою нашої компанії. Що для компанії найголовніше, щоб вона продовжувала успішно існувати. Сформулюю стратегію цього року.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Друге</strong> — точно опишу наших клієнтів. Опишу наш головний продукт, за який клієнт платить саме нам, а не нашим конкурентам. <em>Це зрозуміло?</em></p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Третє</strong> — опишу всі функції, які необхідні для виробництва нашого продукту.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Четверте</strong> — ми разом перерозподілимо функції так, щоб врахувати навантаження і сконцентруватися на головному. На цьому етапі функції можуть бути переглянуті, опишемо посадові інструкції. Вчимося виконувати нові функції, розбиратися з тим, як їх виконувати. Почнемо освоювати професійні функції керівників. Частину функцій делегуватимемо, навчатимемо своїх помічників. <em>Це зрозуміло?</em></p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>П'яте</strong> — створимо кількісну оцінку результатів за основними функціями та в майбутньому по кожному співробітнику.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Шосте</strong> — створимо систему планування. Ми введемо планування завдань (щотижневе та щоденне) насамперед для керівників, а потім для інших співробітників.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Сьоме</strong> — ми впровадимо систему письмової комунікації, щоб швидко та чітко надавати інформацію один одному.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Восьме</strong> — з'являться регулярні координації серед керівників усіх підрозділів та на рівні відділів. З'являться збори персоналу та внутрішній PR.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Дев'яте</strong> — створимо систему фінансового планування. <em>Це зрозуміло?</em></p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 16px;">
                <p><strong>І нарешті</strong> — почнемо цикл стратегічного планування, який щороку повторюватимемо.</p>
            </div>
            
            <p style="margin-bottom: 12px;">«Всі ці частини єдиної системи управління дозволять нашій команді узгоджено працювати за єдиними правилами. Це зменшить хаотичність, додасть порядку та справедливості.</p>
            
            <p><strong>Що ви про це думаєте?</strong>»</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 4. Про навчання та час (продовження скрипту)</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #22c55e;">
            <p style="margin-bottom: 16px;">«Зміни в компанії вимагатимуть від кожного працівника <strong>витрат часу на навчання</strong>. Кожен повинен розуміти новації, щоб ми могли діяти по-новому. Без розуміння, у чому полягає зміна, навіщо вона необхідна і як треба діяти — результату не буде.</p>
            
            <p style="margin-bottom: 16px;">Наприклад, ми ніколи раніше не планували роботу на тиждень. Щоб почати це робити, необхідно дізнатися: навіщо потрібно планувати на тиждень, як планувати, спробувати зробити це вперше. Для цього необхідне навчання, тому цього року ми матимемо багато навчання.</p>
            
            <p style="margin-bottom: 16px;">Повинен попередити, що це навчання вимагатиме від вас іноді виходити на роботу в суботу, і, крім того, вам доведеться витратити близько <strong>10-20% вашого робочого часу</strong>.</p>
            
            <p style="margin-bottom: 16px;">Коли ми опануємо адміністративні функції, вони будуть забирати від 10% до 40% робочого часу залежно від посади. Чим вища посада, тим більше часу працівник витрачатиме на адміністративні функції. Адміністративні функції необхідні для підтримки порядку в організації.</p>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #22c55e;">
                <p style="font-weight: 600; margin-bottom: 8px;">Аналогія з кухнею:</p>
                <p>При цьому треба розуміти, що наведення порядку на кухні не призводить до того, що в сім'ї з'являється обід, а лише забирає час. Мало хто любить наводити лад, особливо на кухні.</p>
                <p style="margin-top: 8px;">Але якщо на кухні порядок, процес приготування їжі значно прискорюється, адже не доводиться витрачати час на пошук різних предметів — все, що необхідно, знаходиться під рукою.</p>
            </div>
            
            <p>Такий же ефект компанія отримує, якщо виконувати адміністративні функції. Стабільні правила взаємодії та стандартні процедури зменшують кількість зупинок у виробництві за подальшого зростання компанії.»</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 5. Відповіді на типові питання</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; color: #6b7280;"><em>Не "підштовхуйте" співробітників до цих питань. Якщо вони їх задають — тоді відповідайте:</em></p>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #22c55e;">
            <p style="font-weight: 600;">«Як торкнеться мене?»</p>
            <p style="color: #166534; margin-top: 8px;">→ «Як точно зараз не скажу, це стане більш зрозумілим у процесі. Що знаю точно — ми з вами обов'язково будь-які зміни погоджуватимемо.»</p>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #22c55e;">
            <p style="font-weight: 600;">«Навіщо нам щось міняти, у нас все й так непогано?»</p>
            <p style="color: #166534; margin-top: 8px;">→ «Пам'ятаєте, ми змінювали у компанії [навести приклад]…? Це спочатку виглядало дивним, складним та непотрібним, але тепер ми без цього не уявляємо життя компанії. Якщо вам щось здаватиметься дивним чи незрозумілим, я готовий це з вами обговорювати, пояснювати.»</p>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="font-weight: 600;">«Багато адміністрування — це погано!»</p>
            <p style="color: #166534; margin-top: 8px;">→ «Я розумію, у вас був різний досвід у цьому питанні. Пройдіть навчання і ми повернемося до цієї розмови. Тільки коли навчатиметесь, відкиньте для початку думку, що це погано, і розгляньте "з чистого аркуша" — постарайтеся це розглянути як нову ідею.»</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 6. Надішліть на навчання в Team Academy AI</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 12px;">Завершіть розмову так:</p>
        <div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #22c55e; margin-bottom: 16px;">
            <p style="margin-bottom: 12px;">«Про подробиці всіх етапів впровадження системи управління ви зможете дізнатися, пройшовши <strong>навчання з AI-асистентом</strong>. Він розкаже про всі інструменти управління.</p>
            
            <p style="margin-bottom: 12px;">Ви можете відзначити місця, які викликають питання, та місця, які вам подобаються.</p>
            
            <p style="margin-bottom: 12px;"><strong>Чи готові ви пройти це навчання та заповнити тест до [ДАТА]</strong>, щоб ми з вами це обговорили і разом подивилися, що чекає на нашу компанію?</p>
            
            <p>Я готовий з вами обговорити цю інформацію будь-коли. Пропоную приблизно за 1 тиждень провести таке обговорення.»</p>
        </div>
        
        <div style="margin-top: 16px;">
            <a href="https://chatgpt.com/g/g-694ea789f6fc8191a90694aae93de819-team-academy-ai" target="_blank" class="action-btn primary">
                
                Team Academy AI — надішліть це посилання співробітникам
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 7. Зберіть відповіді на тест</div>
    </div>
    <div class="lesson-block-content">
        <p>Після навчання співробітники відповідають на тест. Це підтверджує, що вони розуміють зміни.</p>
        <p style="margin-top: 12px; font-weight: 600;">Питання тесту (надішліть співробітникам):</p>
        <ol style="font-size: 14px; background: #f9fafb; padding: 16px 16px 16px 36px; border-radius: 8px; margin-top: 8px;">
            <li>Назвіть етапи розвитку компанії</li>
            <li>Чи можуть гроші бути метою компанії? Чому?</li>
            <li>У чому основна мета будь-якого бізнесу?</li>
            <li>Що таке задум компанії?</li>
            <li>Які рівні мотивації людей у компанії? Опишіть їх</li>
            <li>Який рівень мотивації є найціннішим? Чому?</li>
            <li>Що таке ЦКП? Розшифруйте кожне слово</li>
            <li>Чи повинен кожен співробітник знати свій ЦКП? Чому?</li>
            <li>Що таке посадова папка? Навіщо вона потрібна?</li>
            <li>Чи залежить продуктивність команди від найсильнішого гравця? Чому?</li>
            <li>Скільки відділень має бути в компанії за оргсхемою? Чому?</li>
            <li>Яке відділення йде найпершим? Чому?</li>
            <li>У чому різниця 2 та 6 відділень?</li>
            <li>Що таке план? З чого починати планування?</li>
            <li>Що таке координація і навіщо вона потрібна?</li>
            <li>Як часто має здійснюватися фінансове планування?</li>
            <li>Що таке фінансові резерви? Навіщо їх створювати?</li>
            <li>Як підвищити мотивацію співробітників на рівні "особиста вигода"?</li>
            <li>Чи може команда працювати на рівні "почуття обов'язку" при лідері на рівні "особова переконаність"?</li>
        </ol>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат уроку</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li> Ключові співробітники розуміють, що буде відбуватися</li>
            <li> Вони пройшли навчання і здали тест</li>
            <li> Вони готові підтримувати вас у змінах</li>
            <li> Опір мінімізовано через розуміння</li>
        </ul>
        <p style="margin-top: 16px;">Якщо таким чином розповісти ключовим співробітникам про своє рішення проводити організаційні зміни, вони краще розберуться з цим і будуть до них готові. <strong>Завдяки готовності ключових співробітників подальші зміни пройдуть усвідомлено та гладко.</strong></p>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Зачем этот урок</div>
    </div>
    <div class="lesson-block-content">
        <p>Когда собственник начинает изменения без согласования с командой — возникает сопротивление. Сотрудники не понимают <strong>зачем</strong> изменения и <strong>к чему</strong> они приведут.</p>
        <p style="margin-top: 12px;">Этот урок поможет правильно подготовить команду: объяснить суть изменений, провести обучение и получить поддержку ключевых людей.</p>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">«Ой всё…» — почему сотрудники сопротивляются?</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 12px 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 16px;">
            <p style="margin: 0;"><strong>Рекомендация:</strong> Если сотрудник проявляет сопротивление, обиду или пассивную агрессию — прочитайте эту статью вместе с ним. Пусть сотрудник читает вслух.</p>
        </div>
        
        <details class="accordion-article" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <summary style="padding: 16px; background: #f9fafb; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; list-style: none;">
                
                Статья: «Ой всё…» или почему ваши сотрудники не воспринимают критику
            </summary>
            <div style="padding: 20px; background: white;">
                <h4 style="color: #dc2626; margin-bottom: 16px;">Знакомая сцена?</h4>
                <p style="margin-bottom: 16px;">Вы спокойно говорите человеку: «Вот тут надо подучиться. Вот так делать правильно».</p>
                <p style="margin-bottom: 16px;">И что в ответ?</p>
                <ul style="margin-bottom: 20px; padding-left: 20px;">
                    <li>кислое лицо</li>
                    <li>обида</li>
                    <li>пассивная агрессия</li>
                    <li>"ой всё, я понял(а)"</li>
                    <li>минимум действий, максимум эмоций</li>
                </ul>
                <p style="margin-bottom: 20px;">Хотя вы даже не кричали.</p>
                
                <div style="padding: 16px; background: #fef2f2; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; font-weight: 600;">Тут важно понять одну неприятную вещь:</p>
                    <p style="margin: 8px 0 0 0;">Большинство взрослых работает с психикой 12-летнего ребёнка.<br>Выглядит 30+. Работает 20+. А реагирует как школьник, которому учитель сказал: "Надо подтянуть математику."</p>
                </div>
                
                <h4 style="margin-bottom: 12px;">Почему так?</h4>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">1. Потому что они путают советы с нападением</p>
                    <p style="margin-bottom: 4px;"><strong>Взрослый человек:</strong> "Я могу лучше — спасибо за уточнение."</p>
                    <p style="margin: 0;"><strong>Детский человек:</strong> "Ты сказал, что я плохой. Ой всё."</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">2. Потому что самооценка хрупкая, как пластиковый стаканчик</p>
                    <p style="margin: 0;">Любое замечание = удар по «я хороший». Не выдерживает даже лёгкий намёк, что что-то можно сделать иначе. Слабая внутренняя опора → сильные внешние реакции.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">3. Потому что их никто не научил различать "я" и "моё действие"</p>
                    <p style="margin: 0;">"Ты сделал ошибку" воспринимается как "Ты — ошибка." Человек с такой логикой обречён обижаться.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">4. Потому что критика заставляет взрослеть — а этого они боятся</p>
                    <p style="margin-bottom: 8px;">Критика означает:</p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>признать реальность</li>
                        <li>изменить поведение</li>
                        <li>взять ответственность</li>
                    </ul>
                    <p style="margin: 8px 0 0 0;">Это больно. Это дискомфортно. Это не детская модель. Поэтому включается: «ой всё, я ничего не знаю, делайте сами»</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">5. Потому что есть глубокая установка "я уже должен знать"</p>
                    <p style="margin: 0;">Очень токсичная. Если человек верит, что он должен всё уметь — то любой совет = доказательство слабости. Не посоветуешь — плохо. Совет — тоже плохо. Парадокс инфантильности.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">6. Потому что обида — это способ избежать ответственности</p>
                    <p style="margin: 0;">Когда работник обижается, он снимает с себя груз действия. Обиделся → значит, он "жертва", а не исполнитель. А жертва ничего не обязана. Удобно. Неэффективно. И очень дорого для бизнеса.</p>
                </div>
                
                <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">7. Потому что вы говорите по-взрослому, а у них — детский фильтр</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Ваше:</strong> "Надо сделать вот так."</td>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Их:</strong> "Меня унизили."</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Ваше:</strong> "Исправь ошибку."</td>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Их:</strong> "Меня не ценят."</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Ваше:</strong> "Нужно учиться."</td>
                            <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Их:</strong> "Я недостаточный."</td>
                        </tr>
                    </table>
                </div>
                
                <div style="padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="font-weight: 600; margin-bottom: 8px;">Голая правда</p>
                    <p style="margin: 0;">Не каждый работник может работать в компании, где есть стандарты, регламенты, инструкции и чёткие требования. Не потому, что они «плохие». А потому что их психика ещё не доросла до профессиональной роли. <strong>Компания растёт — не все люди растут вместе с ней.</strong></p>
                </div>
            </div>
        </details>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Подготовьтесь к разговору</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Перед встречей:</strong></p>
        <ol>
            <li>Выпишите качества каждого ключевого сотрудника — почему он важен</li>
            <li>Напишите собственные тезисы разговора</li>
            <li>Проговорите несколько раз вслух</li>
            <li>Включите диктофон во время разговора (для отчёта консультанту)</li>
        </ol>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Скрипт разговора (читайте это сотруднику)</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #22c55e; margin-bottom: 16px;">
            <p style="font-style: italic; color: #166534; margin-bottom: 12px;"> <strong>Пример скрипта — адаптируйте под себя:</strong></p>
            
            <p style="margin-bottom: 12px;">«Приветствую! Наша компания дошла до определённого рубежа. <strong>Вы — ключевой сотрудник</strong>, поддержка и опора всей компании. Нам нужно вместе двигаться дальше, развивать деятельность.</p>
            
            <p style="margin-bottom: 12px;">Для этого мы будем совершенствовать <strong>систему управления</strong>. Я решил участвовать в проекте систематизации бизнеса. В процессе этого консалтинга я буду наводить порядок в компании, и в этом мне понадобится <strong>ваша помощь</strong>.</p>
            
            <p style="margin-bottom: 12px;"><strong>Скажите, как вы понимаете слово "управление"?</strong></p>
            
            <p style="margin-bottom: 12px;"><em>[Выслушайте ответ, затем объясните:]</em></p>
            
            <p style="margin-bottom: 12px;"><strong>Управление</strong> — это когда мы согласовываем все наши действия, чтобы они вели нас к одной цели. Если в компании хорошо налажено управление — действия каждого сотрудника ведут к общей цели. Если плохо — трое идут к цели, один идёт в другую сторону. В результате движение замедляется.»</p>
        </div>
        
        <p style="font-weight: 600; margin-bottom: 12px;"> Зарисовка для объяснения (нарисуйте на бумаге):</p>
        
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Расскажите план изменений (продолжение скрипта)</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #22c55e;">
            <p style="margin-bottom: 16px;">«Работа будет интересной и одновременно сложной. И, как вы понимаете, такую работу нельзя сделать в одиночку, мы будем делать её вместе, и мне понадобится <strong>ваша поддержка и помощь</strong>.</p>
            
            <p style="margin-bottom: 16px;">В результате этих изменений я хочу сформировать <strong>команду руководителей</strong>, которые будут управлять оперативной деятельностью компании. Я хочу растить исполнительного директора. Я хочу, чтобы каждый руководитель в нашей компании профессионально, осознанно занимался управлением.</p>
            
            <p style="margin-bottom: 20px;"><strong>Хорошая новость</strong> в том, что эти изменения мы будем проводить постепенно и плавно в течение этого года. Ещё одна хорошая новость — эти изменения будут иметь начало и конец. Вот план организационных изменений:»</p>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Первое</strong> — я опишу, что является основной целью нашей компании. Что для компании самое главное, чтобы она продолжала успешно существовать. Сформулирую стратегию этого года.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Второе</strong> — точно опишу наших клиентов. Опишу наш главный продукт, за который клиент платит именно нам, а не нашим конкурентам. <em>Это понятно?</em></p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Третье</strong> — опишу все функции, необходимые для производства нашего продукта.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Четвёртое</strong> — мы вместе перераспределим функции так, чтобы учесть нагрузку и сконцентрироваться на главном. На этом этапе функции могут быть пересмотрены, опишем должностные инструкции. Учимся выполнять новые функции. Начнём осваивать профессиональные функции руководителей. Часть функций будем делегировать, обучать своих помощников. <em>Это понятно?</em></p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Пятое</strong> — создадим количественную оценку результатов по основным функциям и в будущем по каждому сотруднику.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Шестое</strong> — создадим систему планирования. Мы введём планирование задач (еженедельное и ежедневное) в первую очередь для руководителей, а затем для других сотрудников.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Седьмое</strong> — мы внедрим систему письменной коммуникации, чтобы быстро и чётко предоставлять информацию друг другу.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Восьмое</strong> — появятся регулярные координации среди руководителей всех подразделений и на уровне отделов. Появятся собрания персонала и внутренний PR.</p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 12px;">
                <p><strong>Девятое</strong> — создадим систему финансового планирования. <em>Это понятно?</em></p>
            </div>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 16px;">
                <p><strong>И наконец</strong> — начнём цикл стратегического планирования, который ежегодно будем повторять.</p>
            </div>
            
            <p style="margin-bottom: 12px;">«Все эти части единой системы управления позволят нашей команде согласованно работать по единым правилам. Это уменьшит хаотичность, добавит порядка и справедливости.</p>
            
            <p><strong>Что вы об этом думаете?</strong>»</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 4. Об обучении и времени (продолжение скрипта)</div>
    </div>
    <div class="lesson-block-content">
        <div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #22c55e;">
            <p style="margin-bottom: 16px;">«Изменения в компании потребуют от каждого работника <strong>затрат времени на обучение</strong>. Каждый должен понимать нововведения, чтобы мы могли действовать по-новому. Без понимания, в чём состоит изменение, зачем оно необходимо и как нужно действовать — результата не будет.</p>
            
            <p style="margin-bottom: 16px;">Например, мы никогда раньше не планировали работу на неделю. Чтобы начать это делать, необходимо узнать: зачем нужно планировать на неделю, как планировать, попробовать сделать это впервые. Для этого необходимо обучение, поэтому в этом году у нас будет много обучения.</p>
            
            <p style="margin-bottom: 16px;">Должен предупредить, что это обучение потребует от вас иногда выходить на работу в субботу, и, кроме того, вам придётся потратить около <strong>10-20% вашего рабочего времени</strong>.</p>
            
            <p style="margin-bottom: 16px;">Когда мы освоим административные функции, они будут забирать от 10% до 40% рабочего времени в зависимости от должности. Чем выше должность, тем больше времени работник будет тратить на административные функции.</p>
            
            <div style="padding: 16px; background: white; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #22c55e;">
                <p style="font-weight: 600; margin-bottom: 8px;">Аналогия с кухней:</p>
                <p>При этом надо понимать, что наведение порядка на кухне не приводит к тому, что в семье появляется обед, а лишь забирает время. Мало кто любит наводить порядок, особенно на кухне.</p>
                <p style="margin-top: 8px;">Но если на кухне порядок, процесс приготовления пищи значительно ускоряется, ведь не приходится тратить время на поиск разных предметов — всё, что необходимо, находится под рукой.</p>
            </div>
            
            <p>Такой же эффект компания получает, если выполнять административные функции. Стабильные правила взаимодействия и стандартные процедуры уменьшают количество остановок в производстве при дальнейшем росте компании.»</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 5. Ответы на типичные вопросы</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; color: #6b7280;"><em>Не "подталкивайте" сотрудников к этим вопросам. Если они их задают — тогда отвечайте:</em></p>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #22c55e;">
            <p style="font-weight: 600;">«Как это коснётся меня?»</p>
            <p style="color: #166534; margin-top: 8px;">→ «Как точно сейчас не скажу, это станет более понятным в процессе. Что знаю точно — мы с вами обязательно любые изменения будем согласовывать.»</p>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #22c55e;">
            <p style="font-weight: 600;">«Зачем нам что-то менять, у нас всё и так неплохо?»</p>
            <p style="color: #166534; margin-top: 8px;">→ «Помните, мы меняли в компании [привести пример]…? Это сначала выглядело странным, сложным и ненужным, но теперь мы без этого не представляем жизнь компании. Если вам что-то будет казаться странным или непонятным, я готов это с вами обсуждать, объяснять.»</p>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="font-weight: 600;">«Много администрирования — это плохо!»</p>
            <p style="color: #166534; margin-top: 8px;">→ «Я понимаю, у вас был разный опыт в этом вопросе. Пройдите обучение и мы вернёмся к этому разговору. Только когда будете учиться, отбросьте для начала мысль, что это плохо, и рассмотрите "с чистого листа" — постарайтесь это рассмотреть как новую идею.»</p>
        </div>
    </div>
</div>
            <p style="color: #166534; margin-top: 4px;">→ «Как точно — пока не скажу, это станет понятным в процессе. Что знаю точно — любые изменения мы с вами обязательно будем согласовывать.»</p>
        </div>
        
        <div style="padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
            <p><strong>«Зачем что-то менять, у нас всё и так неплохо?»</strong></p>
            <p style="color: #166534; margin-top: 4px;">→ «Помните, мы меняли [приведите пример]? Сначала выглядело странно, но теперь мы без этого не представляем работу.»</p>
        </div>
<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 6. Отправьте на обучение в Team Academy AI</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 12px;">Завершите разговор так:</p>
        <div style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 1px solid #22c55e; margin-bottom: 16px;">
            <p style="margin-bottom: 12px;">«О подробностях всех этапов внедрения системы управления вы сможете узнать, пройдя <strong>обучение с AI-ассистентом</strong>. Он расскажет обо всех инструментах управления.</p>
            
            <p style="margin-bottom: 12px;">Вы можете отметить места, которые вызывают вопросы, и места, которые вам нравятся.</p>
            
            <p style="margin-bottom: 12px;"><strong>Готовы ли вы пройти это обучение и заполнить тест до [ДАТА]</strong>, чтобы мы с вами это обсудили и вместе посмотрели, что ждёт нашу компанию?</p>
            
            <p>Я готов с вами обсудить эту информацию в любое время. Предлагаю примерно через 1 неделю провести такое обсуждение.»</p>
        </div>
        
        <div style="margin-top: 16px;">
            <a href="https://chatgpt.com/g/g-694ea789f6fc8191a90694aae93de819-team-academy-ai" target="_blank" class="action-btn primary">
                
                Team Academy AI — отправьте эту ссылку сотрудникам
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 7. Соберите ответы на тест</div>
    </div>
    <div class="lesson-block-content">
        <p>После обучения сотрудники отвечают на тест. Это подтверждает, что они понимают изменения.</p>
        <p style="margin-top: 12px; font-weight: 600;">Вопросы теста (отправьте сотрудникам):</p>
        <ol style="font-size: 14px; background: #f9fafb; padding: 16px 16px 16px 36px; border-radius: 8px; margin-top: 8px;">
            <li>Назовите этапы развития компании</li>
            <li>Могут ли деньги быть целью компании? Почему?</li>
            <li>В чём основная цель любого бизнеса?</li>
            <li>Что такое замысел компании?</li>
            <li>Какие уровни мотивации людей в компании? Опишите их</li>
            <li>Какой уровень мотивации самый ценный? Почему?</li>
            <li>Что такое ЦКП? Расшифруйте каждое слово</li>
            <li>Должен ли каждый сотрудник знать свой ЦКП? Почему?</li>
            <li>Что такое должностная папка? Зачем она нужна?</li>
            <li>Зависит ли продуктивность команды от самого сильного игрока? Почему?</li>
            <li>Сколько отделений должно быть в компании по оргсхеме? Почему?</li>
            <li>Какое отделение идёт первым? Почему?</li>
            <li>В чём разница 2 и 6 отделений?</li>
            <li>Что такое план? С чего начинать планирование?</li>
            <li>Что такое координация и зачем она нужна?</li>
            <li>Как часто должно осуществляться финансовое планирование?</li>
            <li>Что такое финансовые резервы? Зачем их создавать?</li>
            <li>Как повысить мотивацию сотрудников на уровне "личная выгода"?</li>
            <li>Может ли команда работать на уровне "чувство долга" при лидере на уровне "личная убеждённость"?</li>
        </ol>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Вывод</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li> Ключевые сотрудники понимают, что будет происходить</li>
            <li> Они прошли обучение и сдали тест</li>
            <li> Они готовы поддерживать вас в изменениях</li>
            <li> Сопротивление минимизировано через понимание</li>
        </ul>
        <p style="margin-top: 16px;">Если таким образом рассказать ключевым сотрудникам о своём решении проводить организационные изменения, они лучше разберутся с этим и будут к ним готовы. <strong>Благодаря готовности ключевых сотрудников дальнейшие изменения пройдут осознанно и гладко.</strong></p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Визначте ключових співробітників (2-5 осіб)</li>
            <li>Підготуйте скрипт розмови (адаптуйте приклад під себе)</li>
            <li>Проведіть розмову з кожним (запишіть на диктофон)</li>
            <li>Надішліть їм посилання на Team Academy AI</li>
            <li>Зберіть відповіді на тест від кожного</li>
            <li>Завантажте скріни/фото відповідей у Google Документ</li>
            <li>Прикріпіть посилання на документ</li>
        </ol>
    </div>
</div>
                `,

                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Определите ключевых сотрудников (2-5 человек)</li>
            <li>Подготовьте скрипт разговора (адаптируйте пример под себя)</li>
            <li>Проведите разговор с каждым (запишите на диктофон)</li>
            <li>Отправьте им ссылку на Team Academy AI</li>
            <li>Соберите ответы на тест от каждого</li>
            <li>Загрузите скрины/фото ответов в Google Документ</li>
            <li>Прикрепите ссылку на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-694ea789f6fc8191a90694aae93de819-team-academy-ai",
                homeworkLinkName: "→ Team Academy AI",
                homeworkLinkName_ru: "→ Team Academy AI",
                time: 60
            },
            {
                id: 8,
                title: "АНАЛІЗ ТОЧОК РОСТУ ТА МИСЛЕННЯ",
                title_ru: "АНАЛИЗ ТОЧЕК РОСТА И МЫШЛЕНИЯ",
                subtitle: "Інструмент самоаналізу для визначення справжніх причин проблем",
                subtitle_ru: "Инструмент самоанализа для определения настоящих причин проблем",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що це</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Асистент розвитку та мислення</strong> — це інструмент для самоаналізу, який допомагає в будь-який момент протестувати, де саме зараз ваша точка росту.</p>
        <p style="margin-top: 12px;">Він допомагає зрозуміти, чи справжня причина уповільнення у інструментах, бізнес-моделі, цілях, чи у власних переконаннях.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Ваше завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдіть діалог із асистентом</li>
            <li>Ставте питання типу: "Для чого мені це потрібно?", "Що заважає мені рухатись далі?"</li>
            <li>Не бійтеся "завантажити" асистента своїми питаннями</li>
        </ol>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат</div>
    </div>
    <div class="lesson-block-content">
        <p>Ви визначите:</p>
        <ul>
            <li>на якому рівні знаходиться ваша головна проблема</li>
            <li>які обмежуючі переконання її підтримують</li>
            <li>свою ключову ціль на рік у цифрах</li>
        </ul>
    </div>
</div>
                `,
                
                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Что это</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Ассистент развития и мышления</strong> — это инструмент для самоанализа, который помогает в любой момент протестировать, где именно сейчас ваша точка роста.</p>
        <p style="margin-top: 12px;">Он помогает понять, настоящая ли причина замедления в инструментах, бизнес-модели, целях или в собственных убеждениях.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Ваше задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдите диалог с ассистентом</li>
            <li>Задавайте вопросы типа: "Для чего мне это нужно?", "Что мешает мне двигаться дальше?"</li>
            <li>Не бойтесь "загрузить" ассистента своими вопросами</li>
        </ol>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат</div>
    </div>
    <div class="lesson-block-content">
        <p>Вы определите:</p>
        <ul>
            <li>на каком уровне находится ваша главная проблема</li>
            <li>какие ограничивающие убеждения её поддерживают</li>
            <li>свою ключевую цель на год в цифрах</li>
        </ul>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <p>Пройдіть діалог з асистентом і визначте вашу точку росту.</p>
    </div>
</div>
                `,
                
                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <p>Пройдите диалог с ассистентом и определите вашу точку роста.</p>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-6856d5ef91608191918552480e1018eb-ai-kouch-konsultant-alex-talko-5-shariv",
                homeworkLinkName: "→ Асистент 5 шарів",
                time: 15
            },
            {
                id: 9,
                title: "ЦІЛЬ, ЗАДУМ, ПРОДУКТ ОРГАНІЗАЦІЇ. ФУНКЦІОНАЛЬНА СТРУКТУРА ТА РОЛІ",
                title_ru: "ЦЕЛЬ, ЗАМЫСЕЛ, ПРОДУКТ ОРГАНИЗАЦИИ. ФУНКЦИОНАЛЬНАЯ СТРУКТУРА И РОЛИ",
                subtitle: "Фундамент системного бізнесу",
                subtitle_ru: "Фундамент системного бизнеса",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Ціль уроку</div>
    </div>
    <div class="lesson-block-content">
        <p>Це <strong>найважливіший урок курсу</strong>. Ви зрозумієте фундаментальні речі, без яких неможливо побудувати системний бізнес:</p>
        <div style="margin-top: 12px; display: grid; gap: 8px;">
            <div style="padding: 10px 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">Що таке <strong>Ціль, Задум і Продукт</strong> організації</div>
            <div style="padding: 10px 12px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">Як побудувати <strong>Функціональну структуру</strong></div>
            <div style="padding: 10px 12px; background: #faf5ff; border-radius: 8px; border-left: 4px solid #8b5cf6;">Різниця між <strong>Функціями та Ролями</strong></div>
        </div>
    </div>
</div>

<!-- ==================== ЧАСТИНА 1: ЦІЛЬ ==================== -->

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТИНА 1. ЦІЛЬ ОРГАНІЗАЦІЇ</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Ціль організації</strong> — це кінцевий стан, якого хоче досягти компанія. Це "пункт призначення" на карті.</p>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 10px 0; font-weight: 600;">Приклади цілей:</p>
            <div style="display: grid; gap: 8px;">
                <div style="padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; font-size: 13px;"><strong>Мережа клінік:</strong> "Стати найбільшою мережею стоматологій в області до 2027 року"</p>
                </div>
                <div style="padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; font-size: 13px;"><strong>Виробництво:</strong> "Вийти на експорт в 5 країн ЄС протягом 3 років"</p>
                </div>
                <div style="padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                    <p style="margin: 0; font-size: 13px;"><strong>Сервісна компанія:</strong> "Досягти 10 000 постійних клієнтів і 50 млн виручки"</p>
                </div>
            </div>
        </div>
        
        <div style="padding: 14px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: 600;">Важливо:</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;">Ціль — це НЕ "заробляти гроші". Гроші — це наслідок досягнення цілі. Ціль відповідає на питання: <strong>"Куди ми йдемо?"</strong></p>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Проблема більшості бізнесів</div>
    </div>
    <div class="lesson-block-content">
        <p>90% власників не можуть чітко сформулювати ціль своєї компанії. Вони кажуть:</p>
        <div style="display: grid; gap: 8px; margin: 12px 0;">
            <div style="display: flex; gap: 10px; padding: 10px; background: #fef2f2; border-radius: 8px;">
                
                <span>"Хочу більше заробляти" — це не ціль, це бажання</span>
            </div>
            <div style="display: flex; gap: 10px; padding: 10px; background: #fef2f2; border-radius: 8px;">
                
                <span>"Хочу розвиватись" — це не ціль, це напрямок</span>
            </div>
            <div style="display: flex; gap: 10px; padding: 10px; background: #fef2f2; border-radius: 8px;">
                
                <span>"Хочу вільний час" — це не ціль, це мрія</span>
            </div>
        </div>
        <p><strong>Без чіткої цілі</strong> неможливо побудувати систему, бо незрозуміло куди вона має вести.</p>
    </div>
</div>

<!-- ==================== ЧАСТИНА 2: ЗАДУМ ==================== -->

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТИНА 2. ЗАДУМ ОРГАНІЗАЦІЇ</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Задум</strong> — це спосіб досягнення цілі. Якщо ціль — це "куди", то задум — це "як саме".</p>
        
        <div style="background: #f0fdf4; padding: 14px; border-radius: 8px; margin: 14px 0;">
            <p style="margin: 0; font-weight: 600;">Формула:</p>
            <p style="margin: 6px 0 0 0; font-size: 15px;"><strong>Задум = Що ми робимо + Для кого + Яким способом</strong></p>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 10px 0; font-weight: 600;">Приклади задумів:</p>
            <div style="display: grid; gap: 10px;">
                <div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; font-weight: 600; color: #166534;">Мережа клінік</p>
                    <p style="margin: 6px 0 0 0; font-size: 13px;">"Надаємо комплексні стоматологічні послуги сім'ям середнього класу через мережу зручно розташованих клінік з акцентом на профілактику та довгострокові відносини з пацієнтами"</p>
                </div>
                <div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; font-weight: 600; color: #1e40af;">Виробництво меблів</p>
                    <p style="margin: 6px 0 0 0; font-size: 13px;">"Виготовляємо корпусні меблі на замовлення для власників квартир преміум-класу, використовуючи європейські матеріали та власне виробництво з коротким терміном виконання"</p>
                </div>
            </div>
        </div>
        
        <div style="padding: 14px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-weight: 600;">Навіщо потрібен задум?</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;">Задум визначає <strong>бізнес-модель</strong>. Від нього залежить: яка структура потрібна, які люди, які процеси, які ресурси. Два бізнеси з однаковою ціллю можуть мати абсолютно різні задуми.</p>
        </div>
    </div>
</div>

<!-- ==================== ЧАСТИНА 3: ПРОДУКТ ==================== -->

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТИНА 3. ПРОДУКТ ОРГАНІЗАЦІЇ</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Продукт організації</strong> — це кінцевий результат діяльності компанії, те, за що клієнт платить гроші.</p>
        
        <div style="background: #fef3c7; padding: 14px; border-radius: 8px; margin: 14px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: 600;">Критично важливо:</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;">Продукт — це НЕ послуга чи товар. Продукт — це <strong>результат для клієнта</strong>, цінність, яку він отримує.</p>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 12px 0; font-weight: 600;">Різниця між послугою і продуктом:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <th style="padding: 10px; border: 1px solid #e5e7eb; background: #fef2f2; text-align: left;">Послуга (ЩО робимо)</th>
                    <th style="padding: 10px; border: 1px solid #e5e7eb; background: #f0fdf4; text-align: left;">Продукт (ЩО отримує клієнт)</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Лікування зубів</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Здорова посмішка без болю</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Ремонт квартири</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Затишний дім, готовий до життя</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Бухгалтерський облік</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Спокій власника: все законно і вчасно</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">Виготовлення меблів</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Функціональний простір під стиль життя</strong></td>
                </tr>
            </table>
        </div>
        
        <div style="padding: 14px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-weight: 600;">Чому це важливо?</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;">Коли ви розумієте продукт — ви розумієте, що насправді потрібно клієнту. Це змінює все: маркетинг, продажі, сервіс, ціноутворення.</p>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Ланцюжок: Ціль → Задум → Продукт</div>
    </div>
    <div class="lesson-block-content">
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; font-weight: 600; color: #dc2626;">ЦІЛЬ</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px;">Куди ми йдемо? Який кінцевий стан?</p>
                </div>
                <div style="text-align: center; color: #9ca3af; font-size: 20px;">↓</div>
                <div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-weight: 600; color: #d97706;">ЗАДУМ</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px;">Яким способом досягаємо цілі? Бізнес-модель.</p>
                </div>
                <div style="text-align: center; color: #9ca3af; font-size: 20px;">↓</div>
                <div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0; font-weight: 600; color: #16a34a;">ПРОДУКТ</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px;">Що отримує клієнт? За що платить гроші?</p>
                </div>
            </div>
        </div>
        <p style="margin-top: 14px; font-size: 13px;"><strong>Приклад:</strong> Ціль — стати лідером ринку стоматології в місті. Задум — мережа клінік для сімей з фокусом на профілактику. Продукт — здорова посмішка всієї родини на все життя.</p>
    </div>
</div>

<!-- ==================== ЧАСТИНА 4: ФУНКЦІОНАЛЬНА СТРУКТУРА ==================== -->

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТИНА 4. ФУНКЦІОНАЛЬНА СТРУКТУРА</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Функціональна структура</strong> — це каркас організації, який показує ВСІ функції, необхідні для досягнення цілі та виробництва продукту.</p>
        
        <div style="background: #f0fdf4; padding: 14px; border-radius: 8px; margin: 14px 0;">
            <p style="margin: 0; font-weight: 600;">Ключова ідея:</p>
            <p style="margin: 6px 0 0 0;">Структура будується від <strong>ФУНКЦІЙ</strong>, а не від людей. Спочатку визначаємо що потрібно робити, потім — хто це буде робити.</p>
        </div>
        
        <p style="font-weight: 600; margin: 16px 0 10px 0;">7 базових функцій будь-якої організації:</p>
        
        <div style="display: grid; gap: 10px;">
            <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">1</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">АДМІНІСТРАТИВНА</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Керування, координація, планування, контроль</p>
                </div>
            </div>
            <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; align-items: flex-start;">
                <span style="background: #3b82f6; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">2</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">МАРКЕТИНГ</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Залучення клієнтів, реклама, просування, бренд</p>
                </div>
            </div>
            <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">3</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">ПРОДАЖІ</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Конвертація лідів в клієнтів, укладання угод</p>
                </div>
            </div>
            <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; align-items: flex-start;">
                <span style="background: #f59e0b; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">4</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">ВИРОБНИЦТВО / НАДАННЯ ПОСЛУГ</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Створення продукту, виконання замовлень</p>
                </div>
            </div>
            <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; align-items: flex-start;">
                <span style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">5</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">ФІНАНСИ</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Облік, бюджетування, управління грошима</p>
                </div>
            </div>
            <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; align-items: flex-start;">
                <span style="background: #ec4899; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">6</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">ПЕРСОНАЛ (HR)</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Найм, навчання, мотивація, розвиток команди</p>
                </div>
            </div>
            <div style="display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; align-items: flex-start;">
                <span style="background: #6366f1; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">7</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">ЯКІСТЬ / КОНТРОЛЬ</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Стандарти, перевірки, покращення процесів</p>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Чому структура від функцій, а не від людей?</div>
    </div>
    <div class="lesson-block-content">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
                <th style="padding: 12px; border: 1px solid #e5e7eb; background: #fef2f2; text-align: left;"><span style="color: #ef4444; font-weight: bold;">✗</span> Структура від людей</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; background: #f0fdf4; text-align: left;"><span style="color: #22c55e; font-weight: bold;">✓</span> Структура від функцій</th>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">"Є Петро — він робить все"</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">"Є функція Продажі — її виконує Петро"</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">Петро звільнився — хаос</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">Петро звільнився — шукаємо людину на функцію</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">Незрозуміло що робити новому</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">Є опис функції — легко навчити</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">Бізнес = залежність від людей</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">Бізнес = система, що працює</td>
            </tr>
        </table>
    </div>
</div>

<!-- ==================== ЧАСТИНА 5: ІЄРАРХІЯ ФУНКЦІЯ → ОПЕРАЦІЇ ==================== -->

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТИНА 5. Ієрархія: від Функції до Операції</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px;">Кожна функція розкладається на менші елементи:</p>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #8b5cf6;">
                <p style="font-weight: 700; margin: 0; color: #8b5cf6; font-size: 15px;">ФУНКЦІЯ</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Область відповідальності. <em>Приклад: Продажі</em></p>
            </div>
            <div style="text-align: center; color: #9ca3af; font-size: 18px;">↓</div>
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #3b82f6;">
                <p style="font-weight: 700; margin: 0; color: #3b82f6; font-size: 15px;">ОБОВ'ЯЗКИ</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;"><strong>ЩО</strong> потрібно робити. <em>Приклад: Обробляти заявки, Проводити зустрічі, Укладати договори</em></p>
            </div>
            <div style="text-align: center; color: #9ca3af; font-size: 18px;">↓</div>
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #22c55e;">
                <p style="font-weight: 700; margin: 0; color: #22c55e; font-size: 15px;">ПРОЦЕС (Направляюча форма)</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Послідовність етапів від початку до результату. <em>Приклад: Процес продажу в 5 етапів</em></p>
            </div>
            <div style="text-align: center; color: #9ca3af; font-size: 18px;">↓</div>
            <div style="padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="font-weight: 700; margin: 0; color: #f59e0b; font-size: 15px;">ОПЕРАЦІЇ</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;"><strong>ЯК</strong> виконується кожен крок. <em>Приклад: 1. Відкрити CRM 2. Знайти картку 3. Зателефонувати...</em></p>
            </div>
        </div>
        
        <div style="padding: 14px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: 600;">Ключове розуміння:</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;"><strong>Обов'язки</strong> = ЩО потрібно зробити (результат)<br><strong>Операції</strong> = ЯК це виконується (кроки)</p>
        </div>
    </div>
</div>

<!-- ==================== ЧАСТИНА 6: РОЛІ ==================== -->

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТИНА 6. ФУНКЦІЇ vs РОЛІ</div>
    </div>
    <div class="lesson-block-content">
        <p>Це одне з найважливіших розумінь для власника малого та середнього бізнесу.</p>
        
        <div style="display: grid; gap: 16px; margin: 16px 0;">
            <div style="padding: 16px; background: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe;">
                <p style="margin: 0; font-weight: 700; color: #1e40af; font-size: 15px;">ФУНКЦІЯ</p>
                <p style="margin: 8px 0 0 0; font-size: 13px;">Це <strong>область роботи</strong>, яка існує незалежно від людей. Функція "Продажі" існує завжди — хтось має її виконувати.</p>
            </div>
            <div style="padding: 16px; background: #faf5ff; border-radius: 10px; border: 1px solid #e9d5ff;">
                <p style="margin: 0; font-weight: 700; color: #7c3aed; font-size: 15px;">РОЛЬ</p>
                <p style="margin: 8px 0 0 0; font-size: 13px;">Це <strong>капелюх</strong>, який надягає конкретна людина, коли виконує функцію. Одна людина може носити кілька "капелюхів".</p>
            </div>
        </div>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 12px 0; font-weight: 600;">Приклад для малого бізнесу:</p>
            <div style="display: grid; gap: 8px; font-size: 13px;">
                <div style="display: flex; gap: 8px; padding: 10px; background: white; border-radius: 8px;">
                    <span style="font-weight: 600; color: #3b82f6; min-width: 80px;">Марія:</span>
                    <span>Виконує функції <strong>Адміністратор + HR + Частково Фінанси</strong> = 3 ролі</span>
                </div>
                <div style="display: flex; gap: 8px; padding: 10px; background: white; border-radius: 8px;">
                    <span style="font-weight: 600; color: #22c55e; min-width: 80px;">Олег:</span>
                    <span>Виконує функції <strong>Продажі + Маркетинг</strong> = 2 ролі</span>
                </div>
                <div style="display: flex; gap: 8px; padding: 10px; background: white; border-radius: 8px;">
                    <span style="font-weight: 600; color: #8b5cf6; min-width: 80px;">Власник:</span>
                    <span>Виконує функції <strong>Директор + Продажі + Фінанси + Все інше</strong> = 5+ ролей</span>
                </div>
            </div>
        </div>
        
        <div style="padding: 14px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; font-weight: 600;">Проблема більшості власників:</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;">Власник носить 10-15 "капелюхів" одночасно і не розуміє чому втомлений. Він не бачить, скільки ФУНКЦІЙ насправді виконує, бо ніколи їх не виписував.</p>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Функції ВЛАСНИКА vs функції ДИРЕКТОРА</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 12px;">Це різні ролі з різними функціями:</p>
        
        <div style="display: grid; gap: 12px;">
            <div style="padding: 14px; background: #fef3c7; border-radius: 10px; border: 1px solid #fde68a;">
                <p style="margin: 0; font-weight: 700; color: #92400e;">ВЛАСНИК відповідає за:</p>
                <div style="margin-top: 8px; display: grid; gap: 4px; font-size: 13px;">
                    <div style="display: flex; gap: 8px;"><span style="color: #f59e0b;">•</span> Ідеологію та цінності компанії</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #f59e0b;">•</span> Стратегічний маркетинг (куди рухаємось)</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #f59e0b;">•</span> Координацію між напрямками</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #f59e0b;">•</span> Політики та етику</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #f59e0b;">•</span> Технологію (як працює бізнес)</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #f59e0b;">•</span> Фінанси (розподіл прибутку)</div>
                </div>
            </div>
            
            <div style="padding: 14px; background: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe;">
                <p style="margin: 0; font-weight: 700; color: #1e40af;">ДИРЕКТОР відповідає за:</p>
                <div style="margin-top: 8px; display: grid; gap: 4px; font-size: 13px;">
                    <div style="display: flex; gap: 8px;"><span style="color: #3b82f6;">•</span> Оперативне управління</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #3b82f6;">•</span> Виконання планів</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #3b82f6;">•</span> Досягнення прибутку</div>
                    <div style="display: flex; gap: 8px;"><span style="color: #3b82f6;">•</span> Управління командою</div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 14px; padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-size: 13px;"><strong>Ціль системного бізнесу:</strong> Власник виконує ТІЛЬКИ функції власника, а не бігає з 15 капелюхами.</p>
        </div>
    </div>
</div>

<!-- ==================== ЧАСТИНА 7: ПОЛІТИКИ ==================== -->

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТИНА 7. ПОЛІТИКИ — правила гри</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Політика</strong> — це письмова домовленість про те, як прийнято діяти в компанії.</p>
        
        <div style="display: grid; gap: 10px; margin: 14px 0;">
            <div style="padding: 12px 14px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>1. Як тут прийнято діяти?</strong>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Стандарт поведінки</p>
            </div>
            <div style="padding: 12px 14px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>2. Що можна, а що не можна?</strong>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Межі дозволеного</p>
            </div>
            <div style="padding: 12px 14px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <strong>3. Що буде, якщо порушити?</strong>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Наслідки</p>
            </div>
        </div>
        
        <p style="font-weight: 600; margin: 16px 0 10px 0;">Приклади політик:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">Запізнення</span>
            <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">Знижки клієнтам</span>
            <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">Робота з готівкою</span>
            <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">Повернення товару</span>
            <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">Використання телефону</span>
            <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">Дрес-код</span>
            <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 13px;">Конфіденційність</span>
        </div>
        
        <div style="margin-top: 14px; padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-size: 13px;"><strong>Без політик:</strong> "А мені ніхто не казав". <strong>З політиками:</strong> "Це правило компанії, ви його підписали".</p>
        </div>
    </div>
</div>

<!-- ==================== ПІДСУМОК ==================== -->

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ПІДСУМОК: Як все пов'язано</div>
    </div>
    <div class="lesson-block-content">
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px;">
            <div style="display: grid; gap: 10px;">
                <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; align-items: center;">
                    <span style="background: #ef4444; color: white; padding: 6px 10px; border-radius: 6px; font-weight: 600;">1</span>
                    <div>
                        <p style="margin: 0; font-weight: 600;">ЦІЛЬ</p>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Куди йдемо</p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; align-items: center;">
                    <span style="background: #f59e0b; color: white; padding: 6px 10px; border-radius: 6px; font-weight: 600;">2</span>
                    <div>
                        <p style="margin: 0; font-weight: 600;">ЗАДУМ</p>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Яким способом</p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; align-items: center;">
                    <span style="background: #22c55e; color: white; padding: 6px 10px; border-radius: 6px; font-weight: 600;">3</span>
                    <div>
                        <p style="margin: 0; font-weight: 600;">ПРОДУКТ</p>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Що отримує клієнт</p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; align-items: center;">
                    <span style="background: #3b82f6; color: white; padding: 6px 10px; border-radius: 6px; font-weight: 600;">4</span>
                    <div>
                        <p style="margin: 0; font-weight: 600;">ФУНКЦІОНАЛЬНА СТРУКТУРА</p>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Які функції потрібні для продукту</p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; align-items: center;">
                    <span style="background: #8b5cf6; color: white; padding: 6px 10px; border-radius: 6px; font-weight: 600;">5</span>
                    <div>
                        <p style="margin: 0; font-weight: 600;">РОЛІ</p>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Хто виконує функції</p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; align-items: center;">
                    <span style="background: #ec4899; color: white; padding: 6px 10px; border-radius: 6px; font-weight: 600;">6</span>
                    <div>
                        <p style="margin: 0; font-weight: 600;">ПОЛІТИКИ</p>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Правила гри для всіх</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що далі?</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 15px;">Тепер ви розумієте <strong>як все пов'язано</strong> в бізнесі: ціль → задум → продукт → функції → ролі → політики.</p>
        <p style="margin-top: 12px; padding: 14px; background: #f0fdf4; border-radius: 10px; border-left: 4px solid #22c55e; font-size: 14px;">
            <strong>В наступному уроці</strong> ми перейдемо до практики — ви сформулюєте <strong>ціль та ідеальну картину</strong> вашого бізнесу.
        </p>
    </div>
</div>
                `,
                
                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Цель урока</div>
    </div>
    <div class="lesson-block-content">
        <p>Это <strong>самый важный урок курса</strong>. Вы поймёте фундаментальные вещи, без которых невозможно построить системный бизнес:</p>
        <div style="margin-top: 12px; display: grid; gap: 8px;">
            <div style="padding: 10px 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">Что такое <strong>Цель, Замысел и Продукт</strong> организации</div>
            <div style="padding: 10px 12px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">Как построить <strong>Функциональную структуру</strong></div>
            <div style="padding: 10px 12px; background: #faf5ff; border-radius: 8px; border-left: 4px solid #8b5cf6;">Разница между <strong>Функциями и Ролями</strong></div>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТЬ 1. ЦЕЛЬ ОРГАНИЗАЦИИ</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Цель организации</strong> — это конечное состояние, которого хочет достичь компания. Это "пункт назначения" на карте.</p>
        <div style="padding: 14px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 12px;">
            <p style="margin: 0; font-weight: 600;">Важно:</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;">Цель — это НЕ "зарабатывать деньги". Деньги — это следствие достижения цели. Цель отвечает на вопрос: <strong>"Куда мы идём?"</strong></p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТЬ 2. ЗАМЫСЕЛ ОРГАНИЗАЦИИ</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Замысел</strong> — это способ достижения цели. Если цель — это "куда", то замысел — это "как именно".</p>
        <div style="background: #f0fdf4; padding: 14px; border-radius: 8px; margin: 14px 0;">
            <p style="margin: 0; font-weight: 600;">Формула:</p>
            <p style="margin: 6px 0 0 0; font-size: 15px;"><strong>Замысел = Что мы делаем + Для кого + Каким способом</strong></p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТЬ 3. ПРОДУКТ ОРГАНИЗАЦИИ</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Продукт</strong> — это то, за что клиент платит деньги. Не процесс, не услуга, а <strong>конечный результат</strong>, который получает клиент.</p>
        <div style="background: #f0fdf4; padding: 14px; border-radius: 8px; margin: 14px 0;">
            <p style="margin: 0; font-weight: 600;">ЦКП — Ценный Конечный Продукт:</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;"><strong>Ценный</strong> — клиент готов платить. <strong>Конечный</strong> — завершённый, не требует доработки. <strong>Продукт</strong> — результат, не процесс.</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТЬ 4. ФУНКЦИОНАЛЬНАЯ СТРУКТУРА</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Функция</strong> — это набор действий, которые приводят к определённому результату.</p>
        <p style="margin-top: 12px;"><strong>Функциональная структура</strong> — это список ВСЕХ функций, необходимых для производства продукта.</p>
        <div style="padding: 14px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 12px;">
            <p style="margin: 0; font-weight: 600;">Зачем это нужно?</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;">Когда все функции описаны — понятно что делать. Когда функции распределены по людям — понятно кто отвечает.</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ЧАСТЬ 5. ФУНКЦИЯ vs РОЛЬ</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 12px;">
            <div style="padding: 14px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <p style="margin: 0; font-weight: 600; color: #166534;">ФУНКЦИЯ — что нужно делать</p>
                <p style="margin: 6px 0 0 0; font-size: 13px;">"Вести бухгалтерию", "Продавать", "Закупать материалы"</p>
            </div>
            <div style="padding: 14px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; font-weight: 600; color: #1e40af;">РОЛЬ — кто это делает</p>
                <p style="margin: 6px 0 0 0; font-size: 13px;">"Бухгалтер Мария", "Менеджер Алексей", "Собственник Иван"</p>
            </div>
        </div>
        <p style="margin-top: 12px;"><strong>Важно:</strong> Один человек может выполнять несколько функций. Одна функция может быть распределена между несколькими людьми.</p>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ИТОГ: Как всё связано</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 15px;">Теперь вы понимаете <strong>как всё связано</strong> в бизнесе: цель → замысел → продукт → функции → роли.</p>
        <p style="margin-top: 12px; padding: 14px; background: #f0fdf4; border-radius: 10px; border-left: 4px solid #22c55e; font-size: 14px;">
            <strong>В следующем уроке</strong> мы перейдём к практике — вы сформулируете <strong>цель и идеальную картину</strong> вашего бизнеса.
        </p>
    </div>
</div>
                `,
                
                homeworkLink: null,
                homeworkLinkName: null,
                homeworkLinkName_ru: null,
                time: 15
            },
            {
                id: 10,
                title: "ЦІЛЬ І ЗАДУМ",
                title_ru: "ЦЕЛЬ И ЗАМЫСЕЛ",
                subtitle: "Перегляньте відео та виконайте завдання",
                subtitle_ru: "Прочитайте инструкцию и выполните задание в AI-ассистенте",
                
                videoLink: null,
                materialsLink: "https://drive.google.com/drive/folders/1c--GPEXkBsH99Pt07LP5nGUed3Br0tid?usp=sharing",
                
                lessonContent: `
<div class="lesson-block intro" style="border-left: 4px solid #ef4444;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #ef4444;">Відео 1: Головна перешкода впровадження</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 8px; font-weight: 600;">Чому співробітники саботують зміни і як цього уникнути.</p>
        <p style="margin-bottom: 16px; color: #64748b;">Зрозумієте, чому команда чинить опір змінам. Навчитесь впроваджувати нове без втрати цінних людей.</p>
        <div style="margin-bottom: 16px;">
            <a href="https://youtu.be/bdbw9obbtMM" target="_blank" class="action-btn primary">
                
                Дивитись відео
            </a>
        </div>
        <div style="padding: 16px; background: #fef2f2; border-radius: 10px; border: 1px solid #fecaca;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #dc2626;">Після перегляду дайте відповідь:</p>
            <ol style="margin: 0 0 16px 0; padding-left: 20px; color: #991b1b;">
                <li style="margin-bottom: 8px;">Напишіть <strong>три інсайти</strong> з відео, що вам запам'яталось</li>
                <li>Яка <strong>основна перешкода</strong> у впровадженні інструментів управління?</li>
            </ol>
            <textarea placeholder="Ваші відповіді..." style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #fecaca; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #3b82f6;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #3b82f6;">Відео 2: Політика компанії</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 8px; font-weight: 600;">Не словами, а на папері.</p>
        <p style="margin-bottom: 12px; color: #64748b;"><strong>Що ви отримаєте:</strong></p>
        <ul style="margin-bottom: 16px; color: #64748b;">
            <li>Зрозумієте, що таке політика і навіщо вона потрібна</li>
            <li>Навчитесь створювати правила, які реально працюють</li>
            <li>Дізнаєтесь, як зробити так, щоб співробітники їх виконували</li>
        </ul>
        <div style="margin-bottom: 16px;">
            <a href="https://youtu.be/ZSFC1-PJvlk" target="_blank" class="action-btn secondary">
                
                Дивитись відео
            </a>
        </div>
        <div style="padding: 16px; background: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1d4ed8;">Завдання:</p>
            <p style="margin: 0 0 12px 0; color: #1e40af;">Напишіть приклади політик, які потрібно вам впровадити в першу чергу</p>
            <textarea placeholder="Ваші приклади політик..." style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #bfdbfe; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #8b5cf6;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #8b5cf6;">Відео 3: Технологія бізнесу</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; font-weight: 600;">Чому ваш бізнес не росте, поки процеси "в голові"</p>
        <div>
            <a href="https://youtu.be/qMS_Wb8JkUQ" target="_blank" class="action-btn outline" style="border-color: #8b5cf6; color: #8b5cf6;">
                
                Дивитись відео
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #f59e0b;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #f59e0b;">Відео 4: Рівні мотивації</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; font-weight: 600;">Чому одні горять роботою, а іншим — байдуже</p>
        <div style="margin-bottom: 16px;">
            <a href="https://youtu.be/_BhPtBD_CIM" target="_blank" class="action-btn outline" style="border-color: #f59e0b; color: #f59e0b;">
                
                Дивитись відео
            </a>
        </div>
        <div style="padding: 16px; background: #fffbeb; border-radius: 10px; border: 1px solid #fde68a;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #92400e;">Завдання: Визначте рівні</p>
            <p style="margin: 0 0 12px 0; color: #78350f;">Подумайте про своїх співробітників:</p>
            <ul style="margin: 0 0 12px 0; padding-left: 20px; color: #78350f;">
                <li style="margin-bottom: 6px;">Наведіть по <strong>два приклади</strong> для кожного рівня</li>
                <li>Поясніть, <strong>чому</strong> ви так вважаєте</li>
            </ul>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #92400e;">Це допоможе зрозуміти, як працювати з кожним з них.</p>
            <textarea placeholder="Ваші приклади для кожного рівня..." style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #fde68a; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #ec4899;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #ec4899;">Відео 5: Як підвищувати мотивацію</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; font-weight: 600;">Єдиний інструмент, який працює завжди</p>
        <div style="margin-bottom: 16px;">
            <a href="https://youtu.be/5i8Vqud6DLQ" target="_blank" class="action-btn outline" style="border-color: #ec4899; color: #ec4899;">
                
                Дивитись відео
            </a>
        </div>
        <div style="padding: 16px; background: #fdf2f8; border-radius: 10px; border: 1px solid #fbcfe8;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #9d174d;">Завдання 1: Коли востаннє?</p>
            <p style="margin: 0 0 8px 0; color: #831843;">Згадайте: коли востаннє ви говорили команді про ідеологічні цілі компанії?</p>
            <ul style="margin: 0 0 12px 0; padding-left: 20px; color: #831843; font-size: 14px;">
                <li>В якій обстановці?</li>
                <li>З чим це було пов'язано?</li>
                <li>Хто отримав цю інформацію?</li>
            </ul>
            <textarea placeholder="Ваша відповідь на завдання 1..." style="width: 100%; min-height: 100px; padding: 12px; border: 1px solid #fbcfe8; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white; margin-bottom: 16px;"></textarea>
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #9d174d;">Завдання 2: Який відсоток?</p>
            <p style="margin: 0 0 12px 0; color: #831843;">Для якого відсотка вашої команди реальне таке поняття, як ідеологічні цілі? Скільки людей дійсно бачать і поділяють цілі компанії?</p>
            <textarea placeholder="Ваша відповідь на завдання 2..." style="width: 100%; min-height: 100px; padding: 12px; border: 1px solid #fbcfe8; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #06b6d4;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #06b6d4;">Відео 6: Адміністративна шкала</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 8px; font-weight: 600;">Інструмент, який з'єднує все в одну систему.</p>
        <p style="margin-bottom: 12px; color: #64748b;"><strong>Після цього модуля ви:</strong></p>
        <ul style="margin-bottom: 16px; color: #64748b;">
            <li>Зрозумієте, як приймати правильні рішення</li>
            <li>Навчитесь перевіряти ідеї: робити чи ні?</li>
            <li>Побудуєте систему, де все працює разом</li>
        </ul>
        <div style="margin-bottom: 16px;">
            <a href="https://youtu.be/mEEQfHFFMAg" target="_blank" class="action-btn outline" style="border-color: #06b6d4; color: #06b6d4;">
                
                Дивитись відео
            </a>
        </div>
        <div style="padding: 16px; background: #ecfeff; border-radius: 10px; border: 1px solid #a5f3fc;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #0e7490;">Практичне завдання: Зробіть прямо зараз</p>
            <div style="display: grid; gap: 8px; color: #155e75; margin-bottom: 12px;">
                <p style="margin: 0;"><strong>Крок 1:</strong> Запишіть мету вашого бізнесу (не «гроші»!)</p>
                <p style="margin: 0;"><strong>Крок 2:</strong> Опишіть задум — як ви досягаєте мети</p>
                <p style="margin: 0;"><strong>Крок 3:</strong> Згадайте останню «спокусу» — нову ідею, яка здавалась хорошою</p>
                <p style="margin: 0;"><strong>Крок 4:</strong> Перевірте: чи вона відповідає меті і задуму?</p>
            </div>
            <textarea placeholder="Ваші відповіді на 4 кроки..." style="width: 100%; min-height: 140px; padding: 12px; border: 1px solid #a5f3fc; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #10b981;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #10b981;">Відео 7: Мета та Задум</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; font-weight: 600;">Два головних елементи успішної компанії</p>
        <div style="margin-bottom: 16px;">
            <a href="https://youtu.be/XcdO_lVy5QY" target="_blank" class="action-btn outline" style="border-color: #10b981; color: #10b981;">
                
                Дивитись відео
            </a>
        </div>
        <div style="padding: 16px; background: #ecfdf5; border-radius: 10px; border: 1px solid #a7f3d0;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #047857;">Завдання: Сформулюйте мету і задум</p>
            <p style="margin: 0 0 8px 0; color: #065f46;">Для вашої компанії:</p>
            <ol style="margin: 0 0 12px 0; padding-left: 20px; color: #065f46;">
                <li style="margin-bottom: 6px;"><strong>Мета</strong> — для чого ви існуєте? Що зміниться у світі?</li>
                <li><strong>Задум</strong> — як ви це робите? Чим відрізняєтесь?</li>
            </ol>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #047857;">Якщо кілька напрямків — виберіть один і працюйте з ним.</p>
            <textarea placeholder="Ваша мета і задум..." style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #a7f3d0; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; background: white;"></textarea>
        </div>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #6366f1;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #6366f1;">Відео 8: Як донести цілі та задум</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 8px; font-weight: 600;">Ви сформулювали мету і задум. Тепер — як зробити так, щоб команда їх знала і виконувала.</p>
        <p style="margin-bottom: 12px; color: #64748b;"><strong>Після цього модуля ви:</strong></p>
        <ul style="margin-bottom: 16px; color: #64748b;">
            <li>Створите офіційний документ з цілями</li>
            <li>Правильно презентуєте його команді</li>
            <li>Зробите так, щоб люди не забували</li>
        </ul>
        <div style="margin-bottom: 16px;">
            <a href="https://youtu.be/VCWc0blqokU" target="_blank" class="action-btn outline" style="border-color: #6366f1; color: #6366f1;">
                
                Дивитись відео
            </a>
        </div>
        <div style="padding: 16px; background: #eef2ff; border-radius: 10px; border: 1px solid #c7d2fe;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #4338ca;">4 кроки донесення:</p>
            <div style="display: grid; gap: 10px;">
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <span style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0;">1</span>
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #3730a3;">Створіть документ</p>
                        <p style="margin: 2px 0 0 0; font-size: 13px; color: #4338ca;">Мета + Задум + Історія + Ідеальна картина. Підпис засновника.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <span style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0;">2</span>
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #3730a3;">Презентуйте команді</p>
                        <p style="margin: 2px 0 0 0; font-size: 13px; color: #4338ca;">Зберіть всіх. Розкажіть. Запишіть на відео.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <span style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0;">3</span>
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #3730a3;">Нагадуйте регулярно</p>
                        <p style="margin: 2px 0 0 0; font-size: 13px; color: #4338ca;">На зборах, при наймі, при успіхах. Спокійно, без напруги.</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <span style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0;">4</span>
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #3730a3;">Оновлюйте раз на рік</p>
                        <p style="margin: 2px 0 0 0; font-size: 13px; color: #4338ca;">Перегляньте, додайте нове, захищайте від критиків.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block success" style="border-left: 4px solid #22c55e;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #22c55e;">Фінальне практичне завдання</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; font-weight: 600;">Після перегляду всіх відео виконайте наступні кроки:</p>
        <div style="display: grid; gap: 12px;">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">1</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Перейдіть до AI-асистента</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Розробіть політику по цілях компанії</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">2</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Завантажте матеріали</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">В папці знайдете презентацію та інструкцію як її провести</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">3</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Відредагуйте презентацію під себе</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Адаптуйте під специфіку вашого бізнесу</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #22c55e; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">4</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Проведіть презентацію для співробітників</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Це ключовий елемент впровадження змін</p>
                </div>
            </div>
        </div>
        <div style="margin-top: 16px; padding: 12px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 13px;"><strong>Час на впровадження:</strong> ~3 години (1 год підготовка + 2 год проведення презентації)</p>
        </div>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Суть задания</div>
    </div>
    <div class="lesson-block-content">
        <p>Вам нужно пройти диалог с <strong>AI-коучем целей</strong>, чтобы:</p>
        <ul>
            <li>сформировать <strong>Цель, Замысел, Идеальную картину и Историю бизнеса</strong></li>
            <li>на выходе получить <strong>Политику развития организации</strong> — документ, который определяет содержание и направление компании</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Пройдите AI-ассистента</div>
    </div>
    <div class="lesson-block-content">
        <p>Ассистент проведёт вас через формулировку целей и создаст черновик политики.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Адаптируйте материалы</div>
    </div>
    <div class="lesson-block-content">
        <p>Используйте материалы из папки (презентация, тезисы, опросник) и адаптируйте под свой бизнес:</p>
        <div style="margin-top: 12px;">
            <a href="https://drive.google.com/drive/folders/1c--GPEXkBsH99Pt07LP5nGUed3Br0tid?usp=sharing" target="_blank" class="action-btn outline">
                
                Папка с материалами
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Проведите презентацию</div>
    </div>
    <div class="lesson-block-content">
        <p>Представьте политику целей команде. Это важная часть технологии внедрения.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдіть діалог із AI-коучем цілей</li>
            <li>Створіть у Google Docs документ: <strong>Політика цілей і задуму компанії</strong></li>
            <li>Вставте сформовані тези (ціль, задум, ідеальна картина, історія бізнесу)</li>
            <li>Зайдіть в папку «Завантажити матеріали» → папка «Презентація», збережіть тезиси та презентацію і переробіть під себе</li>
            <li>Проведіть презентацію впровадження — розкажіть команді та «продайте» ідею використання інструмента управління «Ціль і задум»</li>
            <li>Прикріпіть посилання на документ</li>
        </ol>
    </div>
</div>
                `,

                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдите диалог с AI-коучем целей</li>
            <li>Создайте политику целей в Google Docs</li>
            <li>Адаптируйте презентацию и тезисы из папки материалов</li>
            <li>Проведите презентацию для команды</li>
            <li>Прикрепите ссылку на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-6850f64368a08191b2c1e8cb233b7ebb-ai-kouch-konsultant-alex-talko-tochka-b",
                homeworkLinkName: "→ AI-коуч цілей",
                homeworkLinkName_ru: "→ AI-коуч целей",
                time: 120
            },
            {
                id: 11,
                title: "ПРОДУКТ ОРГАНІЗАЦІЇ",
                title_ru: "ПРОДУКТ ОРГАНИЗАЦИИ",
                subtitle: "Як проходити урок: переглянути відео",
                subtitle_ru: "Прочитайте инструкцию и выполните задание в AI-ассистенте",
                
                videoLink: "https://youtu.be/mVSxlbMoCFY",
                materialsLink: "https://drive.google.com/drive/folders/1Ct2GBeRfXxxrzg0oJ8TjxaUQ1N12rcKD?usp=sharing",
                
                lessonContent: `
<div class="lesson-block warning" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #92400e;">Як проходити цей урок</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 12px;">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">1</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Спочатку розробляємо інструмент</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #78716c;">Пройдіть AI-асистента і створіть документ</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">2</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Потім — впровадження</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #78716c;">В папці з матеріалами є інструкція як провести презентацію для співробітників</p>
                </div>
            </div>
        </div>
        <div style="margin-top: 14px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #fde68a;">
            <p style="margin: 0; font-size: 13px;"><strong>Час на впровадження:</strong> ~3 години (1 год підготовка + 2 год проведення презентації)</p>
        </div>
    </div>
</div>

<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Завдання</div>
    </div>
    <div class="lesson-block-content">
        <p>Через діалог з <strong>AI-коучем продукту</strong> визначте:</p>
        <ul>
            <li><strong>головний продукт компанії</strong> — який цінний результат ви створюєте для клієнта</li>
            <li><strong>продукти ролей</strong>, необхідні для створення цього результату</li>
            <li>як продукти ролей пов'язані між собою та з цілями організації</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат</div>
    </div>
    <div class="lesson-block-content">
        <p>На виході — <strong>Політика продукту організації</strong>, що описує:</p>
        <ul>
            <li>головний продукт компанії</li>
            <li>продукти ключових ролей</li>
            <li>як кожен продукт впливає на спільний результат</li>
        </ul>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Задание</div>
    </div>
    <div class="lesson-block-content">
        <p>Через диалог с <strong>AI-коучем продукта</strong> определите главный продукт компании и продукты ключевых ролей.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Пройдите AI-ассистента</div>
    </div>
    <div class="lesson-block-content">
        <p>Ассистент поможет сформулировать продукт компании и продукты ролей.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Адаптируйте материалы</div>
    </div>
    <div class="lesson-block-content">
        <p>Используйте материалы из папки и адаптируйте под свой бизнес:</p>
        <div style="margin-top: 12px;">
            <a href="https://drive.google.com/drive/folders/1Ct2GBeRfXxxrzg0oJ8TjxaUQ1N12rcKD?usp=sharing" target="_blank" class="action-btn outline">
                
                Папка с материалами
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Проведите презентацию</div>
    </div>
    <div class="lesson-block-content">
        <p>Представьте политику продукта команде.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдіть діалог із AI-коучем продукту</li>
            <li>Створіть документ «Політика продукту організації» у Google Docs</li>
            <li>Внесіть результати діалогу й прикріпіть посилання на документ</li>
            <li>Зайдіть в папку «Завантажити матеріали» → папка «Презентація», збережіть тезиси та презентацію і переробіть під себе</li>
            <li>Проведіть презентацію впровадження — розкажіть команді та «продайте» ідею використання інструмента управління «Продукт / ЦКП»</li>
        </ol>
    </div>
</div>
                `,

                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдите диалог с AI-коучем продукта</li>
            <li>Создайте политику продукта в Google Docs</li>
            <li>Адаптируйте материалы из папки</li>
            <li>Проведите презентацию для команды</li>
            <li>Прикрепите ссылку на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-6851a1db22ac81918521e73ffdd1d6e2-ai-kouch-konsultant-alex-talko-produkt-tskp",
                homeworkLinkName: "→ AI-коуч продукту",
                homeworkLinkName_ru: "→ AI-коуч продукта",
                time: 120
            },
            {
                id: 12,
                title: "ФУНКЦІОНАЛЬНА СТРУКТУРА ТА РОЛІ",
                title_ru: "ФУНКЦИОНАЛЬНАЯ СТРУКТУРА И РОЛИ",
                subtitle: "Як проходити урок: переглянути відео",
                subtitle_ru: "Прочитайте инструкцию и выполните задание в AI-ассистенте",
                
                videoLink: "https://youtu.be/zFNsHtbRoVs",
                materialsLink: "https://drive.google.com/drive/folders/1difvS_l0v_1RaOqte4zIvmdxR4jf-zEM?usp=sharing",
                
                lessonContent: `
<div class="lesson-block warning" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #92400e;">Як проходити цей урок</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 12px;">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">1</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Спочатку розробляємо інструмент</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #78716c;">Пройдіть AI-асистента і створіть документ</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0;">2</span>
                <div>
                    <p style="margin: 0; font-weight: 600;">Потім — впровадження</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #78716c;">В папці з матеріалами є інструкція як провести презентацію для співробітників</p>
                </div>
            </div>
        </div>
        <div style="margin-top: 14px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #fde68a;">
            <p style="margin: 0; font-size: 13px;"><strong>Час на впровадження:</strong> ~3 години (1 год підготовка + 2 год проведення презентації)</p>
        </div>
    </div>
</div>

<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Завдання</div>
    </div>
    <div class="lesson-block-content">
        <p>Через діалог з <strong>AI-коучем структури</strong> визначте:</p>
        <ul>
            <li><strong>ключові функції організації</strong> (маркетинг, продажі, фінанси, адміністрування)</li>
            <li>які ролі відповідають за виконання цих функцій</li>
            <li>принцип: ми будуємо систему навколо функцій, а не людей</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Результат</div>
    </div>
    <div class="lesson-block-content">
        <p>На виході — <strong>Політика функціональної структури</strong>, що описує:</p>
        <ul>
            <li>основні функції компанії</li>
            <li>ролі, відповідальні за них</li>
            <li>логіку взаємодії між зонами</li>
            <li>підготовлений регламент функцій</li>
        </ul>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Задание</div>
    </div>
    <div class="lesson-block-content">
        <p>Определите ключевые функции организации и роли через <strong>AI-коуча структуры</strong>.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Пройдите AI-ассистента</div>
    </div>
    <div class="lesson-block-content">
        <p>Ассистент поможет определить функции и роли вашей организации.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Адаптируйте материалы</div>
    </div>
    <div class="lesson-block-content">
        <p>Используйте материалы из папки:</p>
        <div style="margin-top: 12px;">
            <a href="https://drive.google.com/drive/folders/1difvS_l0v_1RaOqte4zIvmdxR4jf-zEM?usp=sharing" target="_blank" class="action-btn outline">
                
                Папка с материалами
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Проведите презентацию</div>
    </div>
    <div class="lesson-block-content">
        <p>Представьте структуру и роли команде.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдіть діалог із AI-коучем структури</li>
            <li>Створіть документ «Політика функціональної структури» у Google Docs</li>
            <li>Внесіть результати діалогу (функції, ролі, регламент) і прикріпіть посилання</li>
            <li>Зайдіть в папку «Завантажити матеріали», збережіть тезиси та презентацію і переробіть під себе</li>
            <li>Проведіть презентацію впровадження — розкажіть команді та «продайте» ідею використання інструмента управління «Функціонально-організаційна структура»</li>
        </ol>
    </div>
</div>
                `,

                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдите диалог с AI-коучем структуры</li>
            <li>Создайте политику структуры в Google Docs</li>
            <li>Адаптируйте материалы из папки</li>
            <li>Проведите презентацию для команды</li>
            <li>Прикрепите ссылку на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-68584f3314848191b812f6c0abaaae9e-ai-kouch-konsultant-alex-talko-orgstruktura",
                homeworkLinkName: "→ AI-коуч структури",
                homeworkLinkName_ru: "→ AI-коуч структуры",
                time: 120
            },
            {
                id: 13,
                title: "СИСТЕМА СТАТИСТИК",
                title_ru: "СИСТЕМА СТАТИСТИК",
                subtitle: "Вимірювання продукту та щотижневий аналіз",
                subtitle_ru: "Измерение продукта и еженедельный анализ",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що таке статистика?</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 15px;"><strong>Статистика</strong> — це цифра, яка показує <strong>скільки продукту ви виробили</strong>.</p>
        
        <div style="margin-top: 16px; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 2px solid #22c55e;">
            <p style="margin: 0; font-size: 15px;"><strong>Простими словами:</strong></p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">Не "скільки годин працював", а <strong>"скільки зробив"</strong>.</p>
        </div>
        
        <p style="margin-top: 16px; font-weight: 600;">Приклади статистик:</p>
        <div style="margin-top: 10px; display: grid; gap: 8px;">
            <div style="padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 14px;">
                <strong>Продажі:</strong> скільки договорів підписали
            </div>
            <div style="padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 14px;">
                <strong>Маркетинг:</strong> скільки заявок отримали
            </div>
            <div style="padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 14px;">
                <strong>Виробництво:</strong> скільки замовлень виконали
            </div>
            <div style="padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 14px;">
                <strong>Гроші:</strong> скільки грошей заробили
            </div>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Навіщо рахувати цифри кожен тиждень?</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 10px;">
            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; font-size: 14px;">
                <strong>Бачите правду</strong> — не здогадки, а реальні цифри
            </div>
            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; font-size: 14px;">
                <strong>Помічаєте проблеми рано</strong> — поки вони маленькі
            </div>
            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; font-size: 14px;">
                <strong>Приймаєте рішення</strong> — на основі фактів, а не емоцій
            </div>
        </div>
        
        <div style="margin-top: 16px; padding: 14px; background: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 14px;"><strong>Без статистик</strong> — керуєте наосліп.<br><strong>Зі статистиками</strong> — бачите повну картину.</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #16a34a;">КРОК 1. Розробіть статистики</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 14px; margin-bottom: 12px;">AI-асистент задасть вам питання і допоможе визначити <strong>які цифри відстежувати</strong> саме у вашому бізнесі.</p>
        
        <a href="https://chatgpt.com/g/g-6851a70e282481918ad5c2894ff30b13-statistics" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; text-decoration: none; color: white;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600; font-size: 15px;">Натисніть сюди</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">AI-асистент розробки статистик</p>
            </div>
            
        </a>
        
        <div style="margin-top: 12px; padding: 12px; background: #eff6ff; border-radius: 8px; font-size: 13px;">
            <strong>Підказка:</strong> Напишіть асистенту "Які проблеми ти вирішуєш?" — він пояснить що робить.
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #7c3aed;">КРОК 2. Отримайте доступ до платформи</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 14px; margin-bottom: 12px;">Напишіть в бот підтримки і вкажіть:</p>
        
        <div style="padding: 14px; background: #faf5ff; border-radius: 10px; margin-bottom: 14px;">
            <div style="display: grid; gap: 6px; font-size: 14px;">
                <div><strong>1.</strong> Назву вашої організації</div>
                <div><strong>2.</strong> Ваше ПІБ</div>
                <div><strong>3.</strong> Номер телефону</div>
            </div>
        </div>
        
        <a href="https://t.me/AlexEduPro_bot?start=68dcfbcd093bcfb4230b182e" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border-radius: 12px; border: 2px solid #8b5cf6; text-decoration: none; color: inherit;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600; font-size: 15px;">Натисніть сюди</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Запросити доступ в Telegram</p>
            </div>
            
        </a>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #d97706;">КРОК 3. Внесіть дані в платформу</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 14px; margin-bottom: 12px;">Коли отримаєте доступ — зайдіть на платформу:</p>
        
        <a href="https://alextalko.com/kpi" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; text-decoration: none; color: white;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600; font-size: 15px;">TALKO Statistics</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">alextalko.com/kpi</p>
            </div>
            
        </a>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Як налаштувати платформу? (5 простих кроків)</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 10px;">
            <div style="padding: 14px; background: white; border-radius: 10px; border-left: 4px solid #22c55e;">
                <p style="margin: 0; font-weight: 600; color: #16a34a;">1. Оберіть 5-8 показників</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Не більше! Інакше важко буде вести.</p>
            </div>
            
            <div style="padding: 14px; background: white; border-radius: 10px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; font-weight: 600; color: #1e40af;">2. Створіть показники</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Назва + Хто відповідає + Як часто + Ціль</p>
            </div>
            
            <div style="padding: 14px; background: white; border-radius: 10px; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; font-weight: 600; color: #7c3aed;">3. Додайте команду (якщо є)</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Кожен бачитиме тільки свої цифри.</p>
            </div>
            
            <div style="padding: 14px; background: white; border-radius: 10px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-weight: 600; color: #d97706;">4. Вносьте дані регулярно</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Щодня або щотижня — як обрали. З коментарями!</p>
            </div>
            
            <div style="padding: 14px; background: white; border-radius: 10px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-weight: 600; color: #dc2626;">5. AI-аналіз через 3-5 тижнів</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Коли буде достатньо даних — запустіть.</p>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Потрібна допомога? Є AI-асистент!</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 14px; margin-bottom: 12px;">На платформі є <strong>фіолетова кнопка</strong> — це AI-асистент, який допоможе налаштувати все правильно.</p>
        
        <a href="https://chatgpt.com/g/g-693bf67a13e48191940632f9d6bedb63-talko-statistics-ai-support" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #8b5cf6; border-radius: 12px; text-decoration: none; color: white;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600; font-size: 15px;">AI-підтримка платформи</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Відповість на будь-які питання</p>
            </div>
            
        </a>
    </div>
</div>

<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Що зробити?</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 10px;">
            <div style="display: flex; gap: 10px; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <span style="background: #22c55e; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">1</span>
                <span style="font-size: 14px;">Пройдіть AI-асистента і отримайте список статистик</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <span style="background: #8b5cf6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">2</span>
                <span style="font-size: 14px;">Запросіть доступ до платформи в Telegram</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <span style="background: #f59e0b; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">3</span>
                <span style="font-size: 14px;">Внесіть 5-8 показників на платформу</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <span style="background: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0;">4</span>
                <span style="font-size: 14px;">Заповніть перші дані за цей тиждень</span>
            </div>
        </div>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Что такое статистика?</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Статистика</strong> — это числовой показатель, измеряющий <strong>количество произведенного продукта</strong> за период.</p>
        
        <div style="margin-top: 14px; padding: 14px; background: #f0fdf4; border-radius: 10px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-weight: 600;">Ключевая идея:</p>
            <p style="margin: 6px 0 0 0;">Статистика измеряет <strong>РЕЗУЛЬТАТ</strong>, а не процесс.</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Разработать статистики</div>
    </div>
    <div class="lesson-block-content">
        <p>AI-ассистент поможет определить ключевые показатели для вашего бизнеса.</p>
        
        <a href="https://chatgpt.com/g/g-6851a70e282481918ad5c2894ff30b13-statistics" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 14px; margin-top: 14px; background: white; border-radius: 10px; border: 2px solid #22c55e; text-decoration: none; color: inherit;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600;">AI-ассистент разработки статистик</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Определит ключевые показатели</p>
            </div>
            
        </a>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Получить доступ к платформе</div>
    </div>
    <div class="lesson-block-content">
        <p>Напишите в бот поддержки: название организации, ФИО, номер телефона.</p>
        
        <a href="https://t.me/AlexEduPro_bot?start=68dcfbcd093bcfb4230b182e" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 14px; margin-top: 14px; background: white; border-radius: 10px; border: 2px solid #8b5cf6; text-decoration: none; color: inherit;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600;">Запросить доступ</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Telegram-бот поддержки</p>
            </div>
            
        </a>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Внести данные в платформу</div>
    </div>
    <div class="lesson-block-content">
        <a href="https://alextalko.com/kpi" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 14px; margin: 14px 0; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 10px; text-decoration: none; color: white;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600;">TALKO Statistics</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">alextalko.com/kpi</p>
            </div>
            
        </a>
        
        <p>AI-поддержка платформы (фиолетовая кнопка):</p>
        
        <a href="https://chatgpt.com/g/g-693bf67a13e48191940632f9d6bedb63-talko-statistics-ai-support" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 14px; margin-top: 10px; background: white; border-radius: 10px; border: 2px solid #8b5cf6; text-decoration: none; color: inherit;">
            
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600;">AI-поддержка TALKO Statistics</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Поможет настроить платформу</p>
            </div>
            
        </a>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-6851a70e282481918ad5c2894ff30b13-statistics",
                homeworkLinkName: "→ AI-асистент статистик",
                homeworkLinkName_ru: "→ AI-ассистент статистик",
                time: 90
            },
            {
                id: 14,
                title: "ОСВОЄННЯ ПЛАТФОРМИ TALKO STRUCTURE",
                title_ru: "ОСВОЕНИЕ ПЛАТФОРМЫ TALKO STRUCTURE",
                subtitle: "Побудова функціональної структури бізнесу",
                subtitle_ru: "Построение функциональной структуры бизнеса",
                
                videoLink: "https://youtu.be/kfiFG5VMTY0?si=7nCKfpLKc7-EpFNR",
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Ціль уроку</div>
    </div>
    <div class="lesson-block-content">
        <p>Створити візуальну функціональну структуру бізнесу на платформі <strong>TALKO Structure</strong> — основу системного управління.</p>
        <div style="margin-top: 12px;">
            <a href="https://alextalko.com/tms" target="_blank" class="action-btn primary">
                
                Відкрити платформу TALKO Structure
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 1. Реєстрація та вхід</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Увійдіть з email + пароль</li>
            <li>Якщо забули пароль → зверніться до адміна</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 2. Створення базової структури</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Натисніть «+» на канвасі</li>
            <li>Введіть: назву функції, відповідального, колір</li>
            <li>Натисніть "Зберегти"</li>
            <li>Перетягніть блок у потрібне місце (Drag & Drop)</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 3. Створення підфункцій</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Наведіть курсор на функцію → знизу з'явиться кнопка «+»</li>
            <li>Натисніть — створиться підфункція</li>
            <li>Так формується ієрархія: "Продажі" → "B2B", "B2C", "Онлайн"</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 4. KPI / Показники</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Відкрийте функцію (клік)</li>
            <li>Перейдіть до вкладки «Статистика»</li>
            <li>Натисніть «+» та введіть: назву показника, значення, колір</li>
            <li>Можна додати до 4 KPI на одну функцію</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 5. Додавання співробітників</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Відкрийте функцію</li>
            <li>Прокрутіть до блоку «Співробітники»</li>
            <li>Введіть імена працівників</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 6. Зв'язки між функціями</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Натисніть «+» внизу функції</li>
            <li>Оберіть або створіть нову функцію</li>
            <li>Вони з'єднаються лінією</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">КРОК 7. Експорт структури</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Іконка експорту праворуч зверху</li>
            <li>JPEG — картинка структури</li>
            <li>PDF — файл з клікабельними посиланнями</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Порада</div>
    </div>
    <div class="lesson-block-content">
        <p>Створіть структуру як "бізнес на папері". Уявіть: ви у відпустці — а команда працює самостійно, бо все задокументовано.</p>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Цель урока</div>
    </div>
    <div class="lesson-block-content">
        <p>Создать визуальную функциональную структуру бизнеса на платформе <strong>TALKO Structure</strong>.</p>
        <div style="margin-top: 12px;">
            <a href="https://alextalko.com/tms" target="_blank" class="action-btn primary">
                
                Открыть платформу TALKO Structure
            </a>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 1. Регистрация и вход</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Войдите с email + пароль</li>
            <li>Если забыли пароль → обратитесь к админу</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 2. Создание базовой структуры</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Нажмите «+» на канвасе</li>
            <li>Введите: название функции, ответственного, цвет</li>
            <li>Нажмите "Сохранить"</li>
            <li>Перетащите блок в нужное место (Drag & Drop)</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 3. Создание подфункций</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Наведите курсор на функцию → снизу появится кнопка «+»</li>
            <li>Нажмите — создастся подфункция</li>
            <li>Так формируется иерархия: "Продажи" → "B2B", "B2C", "Онлайн"</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 4. KPI / Показатели</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Откройте функцию (клик)</li>
            <li>Перейдите во вкладку «Статистика»</li>
            <li>Нажмите «+» и введите: название показателя, значение, цвет</li>
            <li>Можно добавить до 4 KPI на одну функцию</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 5. Добавление сотрудников</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Откройте функцию</li>
            <li>Прокрутите до блока «Сотрудники»</li>
            <li>Введите имена работников</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 6. Связи между функциями</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Нажмите «+» внизу функции</li>
            <li>Выберите или создайте новую функцию</li>
            <li>Они соединятся линией</li>
        </ul>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">ШАГ 7. Экспорт структуры</div>
    </div>
    <div class="lesson-block-content">
        <ul>
            <li>Иконка экспорта справа сверху</li>
            <li>JPEG — картинка структуры</li>
            <li>PDF — файл с кликабельными ссылками</li>
        </ul>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Совет</div>
    </div>
    <div class="lesson-block-content">
        <p>Создайте структуру как "бизнес на бумаге". Представьте: вы в отпуске — а команда работает самостоятельно, потому что всё задокументировано.</p>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Створіть функціональну структуру на платформі</li>
            <li>Додайте всі функції бізнесу (адміністрація, маркетинг, продажі, фінанси)</li>
            <li>Для кожної функції додайте: ЦКП, статистику, відповідального</li>
            <li>Зробіть експорт (JPEG або PDF)</li>
            <li>Прикріпіть посилання на документ</li>
        </ol>
    </div>
</div>
                `,

                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Создайте функциональную структуру на платформе</li>
            <li>Добавьте все функции бизнеса (администрация, маркетинг, продажи, финансы)</li>
            <li>Для каждой функции добавьте: ЦКП, статистику, ответственного</li>
            <li>Сделайте экспорт (JPEG или PDF)</li>
            <li>Прикрепите ссылку на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-6870bc9f1658819192171561f5d8fe53-ai-consultant-talko-management-system",
                homeworkLinkName: "→ AI-консультант платформи",
                homeworkLinkName_ru: "→ AI-консультант платформы",
                time: 30
            },
            {
                id: 15,
                title: "ЩО ДАЛІ? ВИБІР НАПРЯМКУ",
                title_ru: "ЧТО ДАЛЬШЕ? ВЫБОР НАПРАВЛЕНИЯ",
                subtitle: "Оберіть наступний етап розвитку вашого бізнесу",
                subtitle_ru: "Выберите следующий этап развития вашего бизнеса",
                
                videoLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Вітаємо! Ви пройшли базову програму</div>
    </div>
    <div class="lesson-block-content">
        <p>Тепер у вас є фундамент: термінологія, інструменти управління, структура, статистики. <strong>Але це тільки початок.</strong></p>
        <p style="margin-top: 12px;">Далі ви можете поглибити роботу в одному з напрямків. Оберіть той, який найбільше резонує з вашою поточною ситуацією.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">1. МАРКЕТИНГ І ПРОДАЖІ</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Це для вас, якщо:</p>
        <ul style="margin-bottom: 16px;">
            <li>Клієнтів мало або потік нестабільний</li>
            <li>Реклама "з'їдає" бюджет, але не дає результату</li>
            <li>Менеджери не закривають угоди</li>
            <li>Немає системи залучення клієнтів — все на "сарафані"</li>
            <li>Не знаєте вартість залучення клієнта (CAC)</li>
            <li>Конкуренти забирають ваших клієнтів</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Стабільний потік клієнтів, конверсія продажів, прогнозований дохід</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">2. НАЙМ І ВВЕДЕННЯ В ПОСАДУ</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Це для вас, якщо:</p>
        <ul style="margin-bottom: 16px;">
            <li>Не можете знайти "нормальних" людей</li>
            <li>Нові співробітники звільняються через 1-3 місяці</li>
            <li>Навчання новачків забирає весь ваш час</li>
            <li>Кожен раз "винаходите велосипед" при наймі</li>
            <li>Немає чітких критеріїв відбору</li>
            <li>Співробітники не виходять на продуктивність</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Система найму, онбординг, швидкий вихід на продуктивність</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">3. ДЕЛЕГУВАННЯ (ПЕРЕДАЧА ОБЛАСТІ)</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Це для вас, якщо:</p>
        <ul style="margin-bottom: 16px;">
            <li>Ви — "вузьке місце" в компанії, все через вас</li>
            <li>Делегуєте, але потім переробляєте</li>
            <li>Боїтесь передати відповідальність — "зроблять не так"</li>
            <li>Керівники є, але вони не керують</li>
            <li>Хочете вирощувати виконавчого директора</li>
            <li>Мрієте про відпустку без телефону</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Керівники, які реально керують, автономні підрозділи</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">4. СИСТЕМА ФІНАНСІВ</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Це для вас, якщо:</p>
        <ul style="margin-bottom: 16px;">
            <li>Гроші є, а в кінці місяця — немає</li>
            <li>Не знаєте реальну прибутковість бізнесу</li>
            <li>Фінанси компанії і особисті — в одній купі</li>
            <li>Немає резервів — кожна криза = стрес</li>
            <li>Не розумієте, куди йдуть гроші</li>
            <li>Рішення приймаєте "на око", а не на цифрах</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Фінансове планування, резерви, контроль грошового потоку</p>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Напишіть у підтримку</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px;">Оберіть напрямок і напишіть нам — ми відкриємо вам доступ до наступного модуля.</p>
        
        <div style="margin: 16px 0;">
            <a href="https://t.me/AlexEduPro_bot?start=68f4ac956d0d3141970a83e8" target="_blank" class="action-btn primary">
                
                Написати в підтримку
            </a>
        </div>
        
        <p style="font-weight: 600; margin-bottom: 8px;">Приклад повідомлення:</p>
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 14px;">
            Вітаю! Пройшов базову програму "Архітектура бізнесу".<br><br>
            Хочу продовжити навчання.<br>
            Обираю напрямок: <strong>[МАРКЕТИНГ / НАЙМ / ДЕЛЕГУВАННЯ / ФІНАНСИ]</strong><br><br>
            Моя компанія: [назва, сфера]<br>
            Головна проблема зараз: [опишіть коротко]
        </div>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Дякуємо за проходження програми!</div>
    </div>
    <div class="lesson-block-content">
        <p>Ви зробили важливий крок до системного бізнесу. Тепер головне — впроваджувати та не зупинятися.</p>
        <p style="margin-top: 12px;"><strong>До зустрічі на наступному етапі! </strong></p>
    </div>
</div>
                `,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Поздравляем! Вы прошли базовую программу</div>
    </div>
    <div class="lesson-block-content">
        <p>Теперь у вас есть фундамент: терминология, инструменты управления, структура, статистики. <strong>Но это только начало.</strong></p>
        <p style="margin-top: 12px;">Далее вы можете углубить работу в одном из направлений. Выберите то, которое больше всего резонирует с вашей текущей ситуацией.</p>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">1. МАРКЕТИНГ И ПРОДАЖИ</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Это для вас, если:</p>
        <ul style="margin-bottom: 16px;">
            <li>Клиентов мало или поток нестабильный</li>
            <li>Реклама "съедает" бюджет, но не даёт результата</li>
            <li>Менеджеры не закрывают сделки</li>
            <li>Нет системы привлечения клиентов — всё на "сарафане"</li>
            <li>Не знаете стоимость привлечения клиента (CAC)</li>
            <li>Конкуренты забирают ваших клиентов</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Стабильный поток клиентов, конверсия продаж, прогнозируемый доход</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">2. НАЙМ И ВВОД В ДОЛЖНОСТЬ</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Это для вас, если:</p>
        <ul style="margin-bottom: 16px;">
            <li>Не можете найти "нормальных" людей</li>
            <li>Новые сотрудники увольняются через 1-3 месяца</li>
            <li>Обучение новичков забирает всё ваше время</li>
            <li>Каждый раз "изобретаете велосипед" при найме</li>
            <li>Нет чётких критериев отбора</li>
            <li>Сотрудники не выходят на продуктивность</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Система найма, онбординг, быстрый выход на продуктивность</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">3. ДЕЛЕГИРОВАНИЕ (ПЕРЕДАЧА ОБЛАСТИ)</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Это для вас, если:</p>
        <ul style="margin-bottom: 16px;">
            <li>Вы — "узкое место" в компании, всё через вас</li>
            <li>Делегируете, но потом переделываете</li>
            <li>Боитесь передать ответственность — "сделают не так"</li>
            <li>Руководители есть, но они не руководят</li>
            <li>Хотите выращивать исполнительного директора</li>
            <li>Мечтаете об отпуске без телефона</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Руководители, которые реально руководят, автономные подразделения</p>
        </div>
    </div>
</div>

<div class="lesson-block step">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">4. СИСТЕМА ФИНАНСОВ</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-weight: 600; color: #22c55e; margin-bottom: 12px;">Это для вас, если:</p>
        <ul style="margin-bottom: 16px;">
            <li>Деньги есть, а в конце месяца — нет</li>
            <li>Не знаете реальную прибыльность бизнеса</li>
            <li>Финансы компании и личные — в одной куче</li>
            <li>Нет резервов — каждый кризис = стресс</li>
            <li>Не понимаете, куда уходят деньги</li>
            <li>Решения принимаете "на глаз", а не на цифрах</li>
        </ul>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>Результат:</strong> Финансовое планирование, резервы, контроль денежного потока</p>
        </div>
    </div>
</div>

<div class="lesson-block warning">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Напишите в поддержку</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px;">Выберите направление и напишите нам — мы откроем вам доступ к следующему модулю.</p>
        
        <div style="margin: 16px 0;">
            <a href="https://t.me/AlexEduPro_bot?start=68f4ac956d0d3141970a83e8" target="_blank" class="action-btn primary">
                
                Написать в поддержку
            </a>
        </div>
        
        <p style="font-weight: 600; margin-bottom: 8px;">Пример сообщения:</p>
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 14px;">
            Здравствуйте! Прошёл базовую программу "Архитектура бизнеса".<br><br>
            Хочу продолжить обучение.<br>
            Выбираю направление: <strong>[МАРКЕТИНГ / НАЙМ / ДЕЛЕГИРОВАНИЕ / ФИНАНСЫ]</strong><br><br>
            Моя компания: [название, сфера]<br>
            Главная проблема сейчас: [опишите кратко]
        </div>
    </div>
</div>

<div class="lesson-block success">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Спасибо за прохождение программы!</div>
    </div>
    <div class="lesson-block-content">
        <p>Вы сделали важный шаг к системному бизнесу. Теперь главное — внедрять и не останавливаться.</p>
        <p style="margin-top: 12px;"><strong>До встречи на следующем этапе! </strong></p>
    </div>
</div>
                `,
                
                homeworkLink: "https://t.me/AlexEduPro_bot?start=68f4ac956d0d3141970a83e8",
                homeworkLinkName: "→ Написати в підтримку",
                homeworkLinkName_ru: "→ Написать в поддержку",
                time: 10
            },
            {
                id: 16,
                title: "АНАЛІЗ ВУЗЬКОГО МІСЦЯ",
                title_ru: "АНАЛИЗ УЗКОГО МЕСТА",
                subtitle: "AI-діагностика проблем бізнесу",
                subtitle_ru: "AI-диагностика проблем бизнеса",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Чому статистик недостатньо?</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Статистики — це градусник.</strong> Він тільки ПОКАЗУЄ проблему:</p>
        <ul>
            <li>Показник в нормі — все добре</li>
            <li>Трохи впав — щось не так</li>
            <li>Сильно впав — треба діяти</li>
        </ul>
        <p style="margin-top: 12px;">Але градусник не каже <strong>ЧОМУ</strong> впало і <strong>ЩО</strong> з цим робити.</p>
        <p style="margin-top: 8px;">У попередньому уроці ми зробили "градусник" (систему статистик).<br>Тепер потрібен <strong>"лікар"</strong> — який скаже чому падає і як лікувати.</p>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #8b5cf6;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #8b5cf6;">Як працює AI-аналіз вузьких місць</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; font-weight: 600;">7 кроків діагностики:</p>
        <div style="display: grid; gap: 10px;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">1</span>
                <div><strong>Бачить проблему</strong><br><span style="color: #64748b; font-size: 14px;">"Ось тут падає третій тиждень поспіль. Це не випадковість — це тренд."</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">2</span>
                <div><strong>Шукає причину</strong><br><span style="color: #64748b; font-size: 14px;">Не просто "показник впав", а ЧОМУ впав</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">3</span>
                <div><strong>Пропонує рішення</strong><br><span style="color: #64748b; font-size: 14px;">Три варіанти: А, В, С — з плюсами і мінусами кожного</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">4</span>
                <div><strong>Рахує гроші</strong><br><span style="color: #64748b; font-size: 14px;">Скільки коштує впровадити, скільки принесе, яка рентабельність</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">5</span>
                <div><strong>Показує пріоритет</strong><br><span style="color: #64748b; font-size: 14px;">"Ця проблема з'їдає 50 000 на місяць, а ота — 5 000. Почніть з першої."</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">6</span>
                <div><strong>Складає план</strong><br><span style="color: #64748b; font-size: 14px;">Конкретні кроки що робити</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">7</span>
                <div><strong>Створює задачі</strong><br><span style="color: #64748b; font-size: 14px;">Перетворює план на завдання для виконання</span></div>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block warning" style="background: #f0fdf4; border-left: 4px solid #22c55e;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #166534;">Результат AI-аналізу</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 16px; font-weight: 600; color: #166534;">Бачить → Каже чому → Пропонує → Планує</p>
        <p style="margin-top: 8px; color: #166534;">AI бачить де проблема → каже чому виникла → пропонує як вирішити → складає план дій</p>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #f59e0b;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #92400e;">Як це використовувати?</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 12px;"><strong>Варіант 1:</strong> Якщо у вас своя облікова система (Excel, 1C, CRM тощо)</p>
        <p style="margin-bottom: 16px; color: #64748b;">→ Використовуйте AI-асистента нижче. Завантажте свої дані і отримайте аналіз.</p>
        <p style="margin-bottom: 12px;"><strong>Варіант 2:</strong> Якщо ви користуєтесь платформою TALKO Статистики</p>
        <p style="color: #64748b;">→ Аналіз вузьких місць вже вбудований в платформу.</p>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #22c55e;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #166534;">Як працювати з асистентом</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 10px;">
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">1</span>
                <span>Заходите в асистента</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">2</span>
                <span>Обираєте мову спілкування</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">3</span>
                <span>Асистент запитає ваші дані і статистики</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">4</span>
                <span><strong>На виході отримаєте готовий план дій</strong></span>
            </div>
        </div>
    </div>
</div>
                `,
                
                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Почему статистик недостаточно?</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Статистики — это градусник.</strong> Он только ПОКАЗЫВАЕТ проблему:</p>
        <ul>
            <li>Показатель в норме — всё хорошо</li>
            <li>Немного упал — что-то не так</li>
            <li>Сильно упал — нужно действовать</li>
        </ul>
        <p style="margin-top: 12px;">Но градусник не говорит <strong>ПОЧЕМУ</strong> упало и <strong>ЧТО</strong> с этим делать.</p>
        <p style="margin-top: 8px;">В предыдущем уроке мы сделали "градусник" (систему статистик).<br>Теперь нужен <strong>"врач"</strong> — который скажет почему падает и как лечить.</p>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #8b5cf6;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #8b5cf6;">Как работает AI-анализ узких мест</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 16px; font-weight: 600;">7 шагов диагностики:</p>
        <div style="display: grid; gap: 10px;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">1</span>
                <div><strong>Видит проблему</strong><br><span style="color: #64748b; font-size: 14px;">"Вот тут падает третью неделю подряд. Это не случайность — это тренд."</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">2</span>
                <div><strong>Ищет причину</strong><br><span style="color: #64748b; font-size: 14px;">Не просто "показатель упал", а ПОЧЕМУ упал</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">3</span>
                <div><strong>Предлагает решения</strong><br><span style="color: #64748b; font-size: 14px;">Три варианта: А, В, С — с плюсами и минусами каждого</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">4</span>
                <div><strong>Считает деньги</strong><br><span style="color: #64748b; font-size: 14px;">Сколько стоит внедрить, сколько принесёт, какая рентабельность</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">5</span>
                <div><strong>Показывает приоритет</strong><br><span style="color: #64748b; font-size: 14px;">"Эта проблема съедает 50 000 в месяц, а та — 5 000. Начните с первой."</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">6</span>
                <div><strong>Составляет план</strong><br><span style="color: #64748b; font-size: 14px;">Конкретные шаги что делать</span></div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span style="background: #8b5cf6; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">7</span>
                <div><strong>Создаёт задачи</strong><br><span style="color: #64748b; font-size: 14px;">Превращает план в задачи для выполнения</span></div>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block warning" style="background: #f0fdf4; border-left: 4px solid #22c55e;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #166534;">Результат AI-анализа</div>
    </div>
    <div class="lesson-block-content">
        <p style="font-size: 16px; font-weight: 600; color: #166534;">Видит → Говорит почему → Предлагает → Планирует</p>
        <p style="margin-top: 8px; color: #166534;">AI видит где проблема → говорит почему возникла → предлагает как решить → составляет план действий</p>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #f59e0b;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #92400e;">Как это использовать?</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom: 12px;"><strong>Вариант 1:</strong> Если у вас своя учётная система (Excel, 1C, CRM и т.д.)</p>
        <p style="margin-bottom: 16px; color: #64748b;">→ Используйте AI-ассистента ниже. Загрузите свои данные и получите анализ.</p>
        <p style="margin-bottom: 12px;"><strong>Вариант 2:</strong> Если вы пользуетесь платформой TALKO Статистики</p>
        <p style="color: #64748b;">→ Анализ узких мест уже встроен в платформу.</p>
    </div>
</div>

<div class="lesson-block step" style="border-left: 4px solid #22c55e;">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title" style="color: #166534;">Как работать с ассистентом</div>
    </div>
    <div class="lesson-block-content">
        <div style="display: grid; gap: 10px;">
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">1</span>
                <span>Заходите в ассистента</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">2</span>
                <span>Выбираете язык общения</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">3</span>
                <span>Ассистент спросит ваши данные и статистики</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: #22c55e; color: white; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">4</span>
                <span><strong>На выходе получите готовый план действий</strong></span>
            </div>
        </div>
    </div>
</div>
                `,
                
                homework: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдіть діалог з AI-асистентом аналізу</li>
            <li>Завантажте свої статистики за останні 4-8 тижнів</li>
            <li>Отримайте план дій по вузькому місцю</li>
            <li>Збережіть план у Google Docs</li>
            <li>Прикріпіть посилання на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homework_ru: `
<div class="lesson-block homework">
    <div class="lesson-block-header">
        
        <div class="lesson-block-title">Домашнее задание</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Пройдите диалог с AI-ассистентом анализа</li>
            <li>Загрузите свои статистики за последние 4-8 недель</li>
            <li>Получите план действий по узкому месту</li>
            <li>Сохраните план в Google Docs</li>
            <li>Прикрепите ссылку на документ</li>
        </ol>
    </div>
</div>
                `,
                
                homeworkLink: "https://chatgpt.com/g/g-690355c39cdc81919726ed1647aaae92-test-analiz-vuzkogo-mistsia",
                homeworkLinkName: "→ AI-асистент аналізу вузьких місць",
                homeworkLinkName_ru: "→ AI-ассистент анализа узких мест",
                time: 60
            }
        ];

    // ── State ─────────────────────────────────────────────────
    let learningProgress = {};     // { moduleId: { completed, homeworkDone, homeworkText } }
    let currentLearningModule = null;
    // Use TALKO main lang - read from localStorage key used by translations module
    function getLearningLang() {
        return localStorage.getItem('talko_lang') || 'ua';
    }

    // ── Firestore helpers ─────────────────────────────────────
    // Use same pattern as 76-coordination: firebase.firestore() + window.currentCompany
    function _db() { return firebase.firestore(); }
    function _companyId() { return typeof currentCompany !== 'undefined' ? currentCompany : null; }
    function _uid() { return typeof currentUser !== 'undefined' && currentUser ? currentUser.uid : null; }

    function lProgressRef() {
        const cid = _companyId();
        const uid = _uid();
        if (!cid || !uid) return null;
        return _db()
            .collection('companies').doc(cid)
            .collection('users').doc(uid);
    }

    async function loadLearningProgress() {
        const ref = lProgressRef();
        if (!ref) {
            // No Firestore access - just render with empty progress
            updateModulesFromLearningProgress();
            renderLearning();
            return;
        }
        try {
            const snap = await ref.get();
            if (snap.exists) {
                learningProgress = snap.data().learningProgress || {};
            }
        } catch(e) {
            console.warn('[Learning] Load progress error:', e);
        }
        updateModulesFromLearningProgress();
        renderLearning();
    }

    async function saveLearningProgress() {
        const ref = lProgressRef();
        if (!ref) return;
        try {
            await ref.set({ learningProgress }, { merge: true });
        } catch(e) {
            console.warn('[Learning] Save progress error:', e);
        }
    }

    // ── Progress helpers ──────────────────────────────────────
    function updateModulesFromLearningProgress() {
        learningCourseData.forEach(module => {
            const p = learningProgress[module.id];
            if (p) {
                module.completed = !!p.completed;
                module.homeworkCompleted = !!p.homeworkDone;
            } else {
                module.completed = false;
                module.homeworkCompleted = false;
            }
        });
    }

    function getLearningStats() {
        const total = learningCourseData.length;
        const completed = learningCourseData.filter(m => m.completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pct };
    }

    // ── Main Render ───────────────────────────────────────────
    function renderLearning() {
        const root = document.getElementById('learningTab');
        if (!root) return;

        const stats = getLearningStats();
        const isRu = getLearningLang() === 'ru';

        root.innerHTML = `
        <div class="learning-wrap">
            <!-- Header -->
            <div class="learning-header">
                <div class="learning-header-title">
                    <i data-lucide="graduation-cap" class="icon" style="color:#22c55e;width:24px;height:24px;"></i>
                    <span>${isRu ? 'Программа обучения' : 'Програма навчання'}</span>
                </div>
    
            </div>

            <!-- Stats bar -->
            <div class="learning-stats">
                <div class="learning-stat">
                    <div class="learning-stat-value">${stats.pct}%</div>
                    <div class="learning-stat-label">${isRu ? 'Прогресс' : 'Прогрес'}</div>
                </div>
                <div class="learning-stat">
                    <div class="learning-stat-value">${stats.completed}/${stats.total}</div>
                    <div class="learning-stat-label">${isRu ? 'Модулей' : 'Модулів'}</div>
                </div>
                <div class="learning-progress-bar-wrap">
                    
                </div>
            </div>

            <!-- Modules list -->
            <div class="learning-modules-list" id="learningModulesList">
                ${learningCourseData.map(module => renderModuleCard(module, isRu)).join('')}
            </div>
        </div>`;

        if (window.refreshIcons) window.refreshIcons();
    }

    function renderModuleCard(module, isRu) {
        const title = isRu ? (module.title_ru || module.title) : module.title;
        const subtitle = isRu ? (module.subtitle_ru || module.subtitle || '') : (module.subtitle || '');
        const isCompleted = module.completed;
        const isAvailable = module.id === 0 || (learningCourseData[module.id - 1] && learningCourseData[module.id - 1].completed) || module.id <= 3;

        return `
        <div class="l-module-card ${isCompleted ? 'completed' : ''} ${!isAvailable ? 'locked' : ''}" 
             onclick="window._openLearningModule(${module.id})"
             style="cursor:pointer;">
            <div class="l-module-icon ${isCompleted ? 'completed' : isAvailable ? 'available' : 'locked'}">
                ${isCompleted
                    ? '<i data-lucide="check-circle" class="icon" style="width:20px;height:20px;"></i>'
                    : !isAvailable
                        ? '<i data-lucide="lock" class="icon" style="width:20px;height:20px;"></i>'
                        : `<span style="font-weight:700;font-size:0.9rem;">${module.id}</span>`
                }
            </div>
            <div class="l-module-info">
                <div class="l-module-title">${title}</div>
                ${subtitle ? `<div class="l-module-subtitle">${subtitle}</div>` : ''}
                ${module.time ? `<div class="l-module-time"><i data-lucide="clock" class="icon" style="width:12px;height:12px;"></i> ${module.time} хв</div>` : ''}
            </div>
            <div class="l-module-arrow">
                <i data-lucide="${isCompleted ? 'check' : 'chevron-right'}" class="icon" style="width:18px;height:18px;color:${isCompleted ? '#22c55e' : '#9ca3af'};"></i>
            </div>
        </div>`;
    }

    // ── Open Module Detail ────────────────────────────────────
    window._openLearningModule = function(moduleId) {
        const module = learningCourseData.find(m => m.id === moduleId);
        if (!module) return;
        currentLearningModule = module;
        const isRu = getLearningLang() === 'ru';

        const title = isRu ? (module.title_ru || module.title) : module.title;
        const subtitle = isRu ? (module.subtitle_ru || module.subtitle || '') : (module.subtitle || '');
        const content = isRu ? (module.lessonContent_ru || module.lessonContent || '') : (module.lessonContent || '');
        const isCompleted = module.completed;
        const hwText = (learningProgress[moduleId] || {}).homeworkText || '';
        const hwDone = (learningProgress[moduleId] || {}).homeworkDone || false;

        const root = document.getElementById('learningTab');
        root.innerHTML = `
        <div class="learning-wrap">
            <div class="learning-module-nav">
                <button class="l-back-btn" onclick="window._closeLearningModule()">
                    <i data-lucide="arrow-left" class="icon" style="width:18px;height:18px;"></i>
                    ${isRu ? 'Назад' : 'Назад'}
                </button>

            </div>

            <div class="l-module-detail">
                <div class="l-detail-header">
                    <div class="l-detail-num">${moduleId}</div>
                    <div>
                        <div class="l-detail-title">${title}</div>
                        ${subtitle ? `<div class="l-detail-subtitle">${subtitle}</div>` : ''}
                        ${module.time ? `<div class="l-module-time" style="margin-top:4px;"><i data-lucide="clock" class="icon" style="width:12px;height:12px;"></i> ${module.time} хв</div>` : ''}
                    </div>
                </div>

                ${module.videoLink ? `
                <div class="l-links-row">
                    <a href="${module.videoLink}" target="_blank" class="l-link-btn video">
                        <i data-lucide="play-circle" class="icon" style="width:16px;height:16px;"></i>
                        ${isRu ? 'Видео' : 'Відео'}
                    </a>
                    ${module.materialsLink ? `<a href="${module.materialsLink}" target="_blank" class="l-link-btn materials">
                        <i data-lucide="file-text" class="icon" style="width:16px;height:16px;"></i>
                        ${isRu ? 'Материалы' : 'Матеріали'}
                    </a>` : ''}
                </div>` : ''}

                <!-- Lesson content -->
                <div class="l-lesson-content">
                    ${content}
                </div>

                <!-- Homework block -->
                ${module.homework ? `
                <div class="l-homework-block">
                    <div class="l-homework-title">
                        <i data-lucide="pencil" class="icon" style="width:16px;height:16px;color:#f59e0b;"></i>
                        ${isRu ? 'Домашнее задание' : 'Домашнє завдання'}
                    </div>
                    <div class="l-homework-desc">${isRu ? (module.homework_ru || module.homework) : module.homework}</div>
                    <textarea class="l-homework-textarea" id="learningHwTextarea" placeholder="${isRu ? 'Введите ваш ответ...' : 'Введіть вашу відповідь...'}">${hwText}</textarea>
                    <div class="l-homework-actions">
                        ${hwDone ? `<span class="l-hw-done-badge"><i data-lucide="check" class="icon" style="width:14px;height:14px;"></i> ${isRu ? 'Выполнено' : 'Виконано'}</span>` : ''}
                        <button class="l-btn-save-hw" onclick="window._saveLearningHomework(${moduleId})">
                            ${isRu ? 'Сохранить' : 'Зберегти'}
                        </button>
                    </div>
                </div>` : ''}

                <!-- Complete button -->
                <div class="l-complete-row">
                    ${isCompleted
                        ? `<button class="l-btn-completed" onclick="window._toggleLearningComplete(${moduleId}, false)">
                            <i data-lucide="check-circle" class="icon" style="width:18px;height:18px;"></i>
                            ${isRu ? 'Пройден ✓' : 'Пройдено ✓'}
                           </button>`
                        : `<button class="l-btn-complete" onclick="window._toggleLearningComplete(${moduleId}, true)">
                            ${isRu ? 'Отметить как пройденный' : 'Позначити як пройдений'}
                           </button>`
                    }
                </div>
            </div>
        </div>`;

        if (window.refreshIcons) window.refreshIcons();
    };

    // ── Back ──────────────────────────────────────────────────
    window._closeLearningModule = function() {
        currentLearningModule = null;
        renderLearning();
    };



    // ── Mark complete ─────────────────────────────────────────
    window._toggleLearningComplete = function(moduleId, done) {
        if (!learningProgress[moduleId]) learningProgress[moduleId] = {};
        learningProgress[moduleId].completed = done;
        updateModulesFromLearningProgress();
        saveLearningProgress();
        window._openLearningModule(moduleId);
    };

    // ── Save homework ─────────────────────────────────────────
    window._saveLearningHomework = function(moduleId) {
        const ta = document.getElementById('learningHwTextarea');
        if (!ta) return;
        if (!learningProgress[moduleId]) learningProgress[moduleId] = {};
        learningProgress[moduleId].homeworkText = ta.value;
        learningProgress[moduleId].homeworkDone = ta.value.trim().length > 0;
        saveLearningProgress();
        window._openLearningModule(moduleId);
    };

    // ── Init (called when tab opens) ──────────────────────────
    window.initLearning = function() {
        loadLearningProgress();
    };

    // ── Re-render on tab switch ───────────────────────────────
    window.renderLearning = renderLearning;

})();
