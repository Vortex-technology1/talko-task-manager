// =====================
// MODULE 80: LEARNING PLATFORM
// =====================
(function() {

    // ── Course Data ──────────────────────────────────────────
        const AI_ASSISTANT_URL = 'https://chatgpt.com/g/g-685640bc592881918743da9332b83f31-ai-alex-talko-technical-lead';

    window.learningCourseData = window.learningCourseData || [];
    const learningCourseData = [
            {
                id: 0,
                title: "МАРШРУТ ПРОГРАМИ",
                title_ru: "МАРШРУТ ПРОГРАММЫ",
                subtitle: "Покрокова карта переходу від хаотичного управління до системного бізнесу",
                subtitle_ru: "Пошаговая карта перехода от хаотичного управления к системному бизнесу",
                hideAiBlock: true,

                videoLink: null,
                materialsLink: null,

                lessonContent: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Що це таке</div>
    </div>
    <div class="lesson-block-content">
        <p>Більшість власників намагаються навести порядок у бізнесі хаотично.</p>
        <p style="margin-top:0.75rem;">Сьогодні займаються наймом.<br>Завтра — маркетингом.<br>Післязавтра — CRM або фінансами.</p>
        <p style="margin-top:0.75rem;">У результаті робота ведеться у різних напрямках, але система так і не з'являється.</p>
        <p style="margin-top:0.75rem;">Саме тому у програмі використовується <strong>маршрут систематизації бізнесу</strong>.</p>
        <p style="margin-top:0.75rem;">Це покрокова карта, яка показує:</p>
        <ul style="margin-top:0.5rem;padding-left:1.2rem;line-height:1.9;">
            <li>що потрібно налаштувати</li>
            <li>у якій послідовності це робити</li>
            <li>який результат має бути на кожному етапі</li>
        </ul>
        <p style="margin-top:0.75rem;">Фактично це маршрут від хаосу до системного бізнесу.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Як побудований маршрут</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom:1rem;">Маршрут складається з кількох ключових фаз.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 1</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Архітектура бізнесу</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Структура компанії, ролі, функції та зони відповідальності.</div>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 2</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Найм і команда</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Формування команди та результати роботи кожної ролі.</div>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 3</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Маркетинг і продажі</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Стабільний та прогнозований потік клієнтів.</div>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 4</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Фінанси і масштабування</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Контроль прибутку та підготовка до масштабування.</div>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block" style="text-align:center;">
    <div class="lesson-block-content" style="padding:1.25rem;">
        <p style="color:#525252;font-size:0.9rem;margin-bottom:1rem;">Щоб побачити повну структуру програми, відкрийте карту маршруту.</p>
        <a href="#" onclick="event.preventDefault();window._openAlgoritm()" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;background:#22c55e;color:white;border-radius:12px;font-weight:700;font-size:0.95rem;text-decoration:none;">
            Відкрити маршрут програми →
        </a>
    </div>
</div>

<div class="result-block">
    <strong>Результат.</strong> Після ознайомлення з маршрутом ви будете розуміти: які етапи проходить систематизація, що саме потрібно зробити на кожному етапі та як рухатися по програмі далі.
</div>`,

                lessonContent_ru: `
<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Что это такое</div>
    </div>
    <div class="lesson-block-content">
        <p>Большинство владельцев пытаются навести порядок в бизнесе хаотично.</p>
        <p style="margin-top:0.75rem;">Сегодня занимаются наймом.<br>Завтра — маркетингом.<br>Послезавтра — CRM или финансами.</p>
        <p style="margin-top:0.75rem;">В итоге работа ведётся в разных направлениях, но система так и не появляется.</p>
        <p style="margin-top:0.75rem;">Именно поэтому в программе используется <strong>маршрут систематизации бизнеса</strong>.</p>
        <p style="margin-top:0.75rem;">Это пошаговая карта, которая показывает:</p>
        <ul style="margin-top:0.5rem;padding-left:1.2rem;line-height:1.9;">
            <li>что нужно настроить</li>
            <li>в какой последовательности это делать</li>
            <li>какой результат должен быть на каждом этапе</li>
        </ul>
        <p style="margin-top:0.75rem;">Фактически это маршрут от хаоса к системному бизнесу.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Как построен маршрут</div>
    </div>
    <div class="lesson-block-content">
        <p style="margin-bottom:1rem;">Маршрут состоит из нескольких ключевых фаз.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 1</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Архитектура бизнеса</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Структура компании, роли, функции и зоны ответственности.</div>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 2</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Найм и команда</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Формирование команды и результаты работы каждой роли.</div>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 3</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Маркетинг и продажи</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Стабильный и прогнозируемый поток клиентов.</div>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;">
                <div style="font-size:0.7rem;font-weight:700;color:#16a34a;letter-spacing:0.08em;margin-bottom:0.35rem;">ФАЗА 4</div>
                <div style="font-weight:700;color:#1a1a1a;font-size:0.95rem;margin-bottom:0.4rem;">Финансы и масштабирование</div>
                <div style="font-size:0.82rem;color:#525252;line-height:1.5;">Контроль прибыли и подготовка к масштабированию.</div>
            </div>
        </div>
    </div>
</div>

<div class="lesson-block" style="text-align:center;">
    <div class="lesson-block-content" style="padding:1.25rem;">
        <p style="color:#525252;font-size:0.9rem;margin-bottom:1rem;">Чтобы увидеть полную структуру программы, откройте карту маршрута.</p>
        <a href="#" onclick="event.preventDefault();window._openAlgoritm()" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;background:#22c55e;color:white;border-radius:12px;font-weight:700;font-size:0.95rem;text-decoration:none;">
            Открыть маршрут программы →
        </a>
    </div>
</div>

<div class="result-block">
    <strong>Результат.</strong> После ознакомления с маршрутом вы будете понимать: какие этапы проходит систематизация, что именно нужно сделать на каждом этапе и как двигаться по программе дальше.
</div>`,

                homework: `<ol><li>Відкрийте маршрут програми</li><li>Ознайомтесь із фазами систематизації</li><li>Поверніться до цього уроку</li></ol>`,
                homework_ru: `<ol><li>Откройте маршрут программы</li><li>Ознакомьтесь с фазами систематизации</li><li>Вернитесь к этому уроку</li></ol>`,

                homeworkLink: null,
                homeworkLinkName: null,
                homeworkLinkName_ru: null,
                time: 15
            },
            {
                id: 1,
                title: "ЯК ПРАЦЮВАТИ З GOOGLE ДИСКОМ",
                title_ru: "КАК РАБОТАТЬ С GOOGLE ДИСКОМ",
                subtitle: "Підготовка робочого середовища програми",
                subtitle_ru: "Подготовка рабочей среды программы",
                hideAiBlock: true,

                videoLink: null,
                materialsLink: null,

                lessonContent: `
<div style="margin-bottom:1.25rem;padding:1rem 1.25rem;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:14px;display:flex;align-items:flex-start;gap:0.9rem;">
    <div style="width:40px;height:40px;background:#22c55e;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="22" height="22"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg>
    </div>
    <div>
        <div style="font-weight:700;color:#166534;font-size:0.95rem;margin-bottom:0.3rem;">У вас є AI-асистент</div>
        <div style="color:#15803d;font-size:0.85rem;line-height:1.6;">Якщо щось незрозуміло або виникнуть труднощі — напишіть асистенту суть завдання, і він проведе вас за руку крок за кроком.</div>
        <a href="https://chatgpt.com/g/g-685640bc592881918743da9332b83f31-ai-alex-talko-technical-lead" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;margin-top:0.65rem;padding:0.4rem 0.85rem;background:#22c55e;color:white;border-radius:8px;font-size:0.82rem;font-weight:600;text-decoration:none;">
            Відкрити AI-асистента →
        </a>
    </div>
</div>

<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Для чого це потрібно</div>
    </div>
    <div class="lesson-block-content">
        <p>У програмі всі матеріали систематизації бізнесу зберігаються у Google Диску.</p>
        <p style="margin-top:0.75rem;">Це дозволяє:</p>
        <ul style="margin-top:0.5rem;padding-left:1.2rem;line-height:1.9;">
            <li>зберігати всі документи в одному місці</li>
            <li>легко ділитися матеріалами з командою</li>
            <li>працювати з файлами з будь-якого пристрою</li>
        </ul>
        <p style="margin-top:0.75rem;">Фактично Google Диск буде вашим <strong>центром робочих документів</strong> у програмі.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Що потрібно зробити</div>
    </div>
    <div class="lesson-block-content">
        <p>У цьому уроці потрібно:</p>
        <div style="margin-top:0.75rem;display:grid;gap:0.6rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.9rem;background:#f0fdf4;border-radius:10px;">
                <span style="background:#22c55e;color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">1</span>
                <span style="font-size:0.9rem;color:#1a1a1a;">Створити робочу папку програми</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.9rem;background:#f0fdf4;border-radius:10px;">
                <span style="background:#22c55e;color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">2</span>
                <span style="font-size:0.9rem;color:#1a1a1a;">Створити у ній документи для роботи</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.9rem;background:#f0fdf4;border-radius:10px;">
                <span style="background:#22c55e;color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">3</span>
                <span style="font-size:0.9rem;color:#1a1a1a;">Налаштувати доступ</span>
            </div>
        </div>
        <p style="margin-top:0.9rem;color:#525252;font-size:0.875rem;">Це займе приблизно 5–10 хвилин.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">1</span>
            Створіть папку програми
        </div>
    </div>
    <div class="lesson-block-content">
        <p>У Google Диску створіть нову папку з назвою:</p>
        <div style="margin-top:0.6rem;padding:0.7rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:0.9rem;color:#1a1a1a;">
            Систематизація TALKO — Ваше Ім'я
        </div>
        <p style="margin-top:0.6rem;color:#525252;font-size:0.875rem;">Це буде ваша основна папка для матеріалів програми.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">2</span>
            Створіть документи у папці
        </div>
    </div>
    <div class="lesson-block-content">
        <p>У папці потрібно створити:</p>
        <ul style="margin-top:0.5rem;padding-left:1.2rem;line-height:1.9;">
            <li>2 Google Документи</li>
            <li>1 Google Таблицю</li>
        </ul>
        <p style="margin-top:0.5rem;color:#525252;font-size:0.875rem;">Назви документів можна залишити будь-які.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">3</span>
            Налаштуйте доступ до папки
        </div>
    </div>
    <div class="lesson-block-content">
        <p>Натисніть <strong>«Поділитися»</strong>. В налаштуваннях оберіть:</p>
        <div style="margin-top:0.6rem;padding:0.7rem 1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:0.875rem;color:#166534;font-weight:600;">
            Усі, хто має посилання — можуть коментувати
        </div>
        <p style="margin-top:0.6rem;color:#525252;font-size:0.875rem;">Після цього скопіюйте посилання на папку.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">4</span>
            Додайте посилання у систему
        </div>
    </div>
    <div class="lesson-block-content">
        <p>Вставте посилання на папку у поле домашнього завдання нижче.</p>
    </div>
</div>

<div class="result-block">
    <strong>Результат.</strong> Ваше робоче середовище готове — всі матеріали програми зберігатимуться в одному місці з правильним доступом.
</div>

<div style="margin-top:1.25rem;padding:1.1rem 1.25rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
    <div style="display:flex;align-items:flex-start;gap:0.75rem;">
        <div style="width:36px;height:36px;background:#f0fdf4;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </div>
        <div>
            <div style="font-weight:700;color:#1a1a1a;font-size:0.9rem;margin-bottom:0.3rem;">Потрібна допомога?</div>
            <div style="color:#525252;font-size:0.82rem;line-height:1.5;margin-bottom:0.75rem;">Якщо під час виконання виникнуть питання, скористайтесь технічним помічником. Він проведе вас через виконання крок за кроком.</div>
            <a href="https://chatgpt.com/g/g-685640bc592881918743da9332b83f31-ai-alex-talko-technical-lead" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;background:#22c55e;color:white;border-radius:8px;font-size:0.82rem;font-weight:600;text-decoration:none;">
                Отримати допомогу →
            </a>
        </div>
    </div>
</div>`,

                lessonContent_ru: `
<div style="margin-bottom:1.25rem;padding:1rem 1.25rem;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:14px;display:flex;align-items:flex-start;gap:0.9rem;">
    <div style="width:40px;height:40px;background:#22c55e;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="22" height="22"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg>
    </div>
    <div>
        <div style="font-weight:700;color:#166534;font-size:0.95rem;margin-bottom:0.3rem;">У вас есть AI-ассистент</div>
        <div style="color:#15803d;font-size:0.85rem;line-height:1.6;">Если что-то непонятно или возникнут трудности — напишите ассистенту суть задания, и он проведёт вас за руку шаг за шагом.</div>
        <a href="https://chatgpt.com/g/g-685640bc592881918743da9332b83f31-ai-alex-talko-technical-lead" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;margin-top:0.65rem;padding:0.4rem 0.85rem;background:#22c55e;color:white;border-radius:8px;font-size:0.82rem;font-weight:600;text-decoration:none;">
            Открыть AI-ассистента →
        </a>
    </div>
</div>

<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Для чего это нужно</div>
    </div>
    <div class="lesson-block-content">
        <p>В программе все материалы систематизации бизнеса хранятся в Google Диске.</p>
        <p style="margin-top:0.75rem;">Это позволяет:</p>
        <ul style="margin-top:0.5rem;padding-left:1.2rem;line-height:1.9;">
            <li>хранить все документы в одном месте</li>
            <li>легко делиться материалами с командой</li>
            <li>работать с файлами с любого устройства</li>
        </ul>
        <p style="margin-top:0.75rem;">Фактически Google Диск будет вашим <strong>центром рабочих документов</strong> в программе.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Что нужно сделать</div>
    </div>
    <div class="lesson-block-content">
        <p>В этом уроке нужно:</p>
        <div style="margin-top:0.75rem;display:grid;gap:0.6rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.9rem;background:#f0fdf4;border-radius:10px;">
                <span style="background:#22c55e;color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">1</span>
                <span style="font-size:0.9rem;color:#1a1a1a;">Создать рабочую папку программы</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.9rem;background:#f0fdf4;border-radius:10px;">
                <span style="background:#22c55e;color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">2</span>
                <span style="font-size:0.9rem;color:#1a1a1a;">Создать в ней документы для работы</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.9rem;background:#f0fdf4;border-radius:10px;">
                <span style="background:#22c55e;color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">3</span>
                <span style="font-size:0.9rem;color:#1a1a1a;">Настроить доступ</span>
            </div>
        </div>
        <p style="margin-top:0.9rem;color:#525252;font-size:0.875rem;">Это займёт около 5–10 минут.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">1</span>
            Создайте папку программы
        </div>
    </div>
    <div class="lesson-block-content">
        <p>В Google Диске создайте новую папку с названием:</p>
        <div style="margin-top:0.6rem;padding:0.7rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:0.9rem;color:#1a1a1a;">
            Систематизация TALKO — Ваше Имя
        </div>
        <p style="margin-top:0.6rem;color:#525252;font-size:0.875rem;">Это будет ваша основная папка для материалов программы.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">2</span>
            Создайте документы в папке
        </div>
    </div>
    <div class="lesson-block-content">
        <p>В папке нужно создать:</p>
        <ul style="margin-top:0.5rem;padding-left:1.2rem;line-height:1.9;">
            <li>2 Google Документа</li>
            <li>1 Google Таблицу</li>
        </ul>
        <p style="margin-top:0.5rem;color:#525252;font-size:0.875rem;">Названия документов могут быть любыми.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">3</span>
            Настройте доступ к папке
        </div>
    </div>
    <div class="lesson-block-content">
        <p>Нажмите <strong>«Поделиться»</strong>. В настройках выберите:</p>
        <div style="margin-top:0.6rem;padding:0.7rem 1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:0.875rem;color:#166534;font-weight:600;">
            Все, у кого есть ссылка — могут комментировать
        </div>
        <p style="margin-top:0.6rem;color:#525252;font-size:0.875rem;">После этого скопируйте ссылку на папку.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title" style="display:flex;align-items:center;gap:0.5rem;">
            <span style="background:#22c55e;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">4</span>
            Добавьте ссылку в систему
        </div>
    </div>
    <div class="lesson-block-content">
        <p>Вставьте ссылку на папку в поле домашнего задания ниже.</p>
    </div>
</div>

<div class="result-block">
    <strong>Результат.</strong> Ваша рабочая среда готова — все материалы программы будут храниться в одном месте с правильным доступом.
</div>

<div style="margin-top:1.25rem;padding:1.1rem 1.25rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
    <div style="display:flex;align-items:flex-start;gap:0.75rem;">
        <div style="width:36px;height:36px;background:#f0fdf4;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </div>
        <div>
            <div style="font-weight:700;color:#1a1a1a;font-size:0.9rem;margin-bottom:0.3rem;">Нужна помощь?</div>
            <div style="color:#525252;font-size:0.82rem;line-height:1.5;margin-bottom:0.75rem;">Если во время выполнения возникнут вопросы, воспользуйтесь техническим помощником. Он проведёт вас через выполнение шаг за шагом.</div>
            <a href="https://chatgpt.com/g/g-685640bc592881918743da9332b83f31-ai-alex-talko-technical-lead" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;background:#22c55e;color:white;border-radius:8px;font-size:0.82rem;font-weight:600;text-decoration:none;">
                Получить помощь →
            </a>
        </div>
    </div>
</div>`,

                homework: `<ol><li>Створіть папку <strong>Систематизація TALKO — Ваше Ім'я</strong></li><li>Створіть у ній 2 Google Документи та 1 Google Таблицю</li><li>Налаштуйте доступ: <em>Усі, хто має посилання — можуть коментувати</em></li><li>Вставте посилання на папку у поле нижче</li></ol>`,
                homework_ru: `<ol><li>Создайте папку <strong>Систематизация TALKO — Ваше Имя</strong></li><li>Создайте в ней 2 Google Документа и 1 Google Таблицу</li><li>Настройте доступ: <em>Все, у кого есть ссылка — могут комментировать</em></li><li>Вставьте ссылку на папку в поле ниже</li></ol>`,

                homeworkLink: null,
                homeworkLinkName: null,
                homeworkLinkName_ru: null,
                time: 15
            },
            {
                id: 2,
                title: "СЛОВНИК ТЕРМІНІВ + ЕФЕКТИВНЕ НАВЧАННЯ",
                title_ru: "СЛОВАРЬ ТЕРМИНОВ + ЭФФЕКТИВНОЕ ОБУЧЕНИЕ",
                subtitle: "Технологія навчання + прояснення 13 термінів",
                subtitle_ru: "Технология обучения + прояснение 13 терминов",
                
                videoLink: null,
                materialsLink: null,
                
                lessonContent: `<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Чому це важливо перш за все</div>
    </div>
    <div class="lesson-block-content">
        <p>90% навчання не працює — не тому що люди тупі, а тому що відсутня технологія.</p>
        <p style="margin-top:8px;">Автошкола: кілька тижнів → людина їде. Університет: 5 років → людина не може працювати за спеціальністю. <strong>В чому різниця?</strong> Технологія — це послідовність дій, яка дає передбачуваний результат.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Закон навчання: відтворення → розуміння → результат</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Запам'ятати ≠ зрозуміти.</strong> Справжнє знання не потребує згадування — ви просто знаєте, як знаєте що вогонь гарячий.</p>
        <p style="margin-top:8px;">Головна причина невдач у навчанні — <strong>незрозуміле слово</strong>. Одне пропущене слово зупиняє розуміння всієї теми. Як дірка в стіні — можна фарбувати шар за шаром, але дірка нікуди не дінеться.</p>
        <ul style="margin-top:8px;">
            <li>Нудно і хочеться відволіктись → є незрозуміле слово</li>
            <li>Відчуття "щось не вкладається" → є незрозуміле слово</li>
            <li>Проблема завжди <strong>раніше</strong> — в попередньому матеріалі</li>
        </ul>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Що таке концепт і чому він важливіший за визначення</div>
    </div>
    <div class="lesson-block-content">
        <p>Концепт — це ідея в вашому розумі, а не запам'ятоване визначення. <strong>Концепт не можна запам'ятати — його можна тільки створити.</strong></p>
        <p style="margin-top:8px;">Приклад: "план" для керівника продажів = цифра яку хочу досягнути. Для власника = послідовність конкретних дій. Одне слово — два різних концепти — повна відсутність взаєморозуміння.</p>
        <p style="margin-top:8px;"><strong>Правило:</strong> ніколи не питайте значення слів у людей — вони дають хибні визначення. Використовуйте словник або AI.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Навичка = автоматизм через повторення</div>
    </div>
    <div class="lesson-block-content">
        <p>Розуміння — це ще не навичка. Знати граматику ≠ говорити мовою.</p>
        <p style="margin-top:8px;">Навичка — це автоматизм: перші 30 годин за кермом — стрес і увага на педалях. Після — слухаєш музику і їдеш. Так само з управлінням: перший раз віддати розпорядження — страшно. Після 100 разів — природно.</p>
        <p style="margin-top:8px;"><strong>Важливо вчитись одразу правильно</strong> — неправильний автоматизм заважатиме все життя.</p>
    </div>
</div>


<div class="l-ai-block" style="margin:1.25rem 0 0;">
    <div class="l-ai-block-header">
        <div class="l-ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="28" height="28"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
        <div>
            <div class="l-ai-title">AI Асистент Термінології</div>
            <div class="l-ai-desc">Зайдіть в асистента і напишіть: <em>"Поясни мені перші 13 термінів програми TALKO"</em>. Зупиніться на 13-му терміні.</div>
        </div>
    </div>
    <button class="l-ai-btn" onclick="window.open('https://chatgpt.com/g/g-688c4d14d300819186e96a0226712dde-terminology-assistant','_blank')">
        Відкрити асистента термінології →
    </button>
</div>
<div class="result-block">
    <strong>Ваше завдання зараз:</strong> прояснити перші 13 термінів програми через AI асистента нижче. Тільки 13 — не більше. Асистент може запропонувати йти далі — зупиніться на 13-му.
</div>`,
                
                homework: `<div class="lesson-block homework">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Зайдіть в AI асистента термінології</li>
            <li>Пройдіть перші 13 термінів — зупиніться на 13-му</li>
            <li>Використовуйте ці терміни в роботі з наступного дня</li>
        </ol>
    </div>
</div>`,
                
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

                lessonContent_ru: `<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Почему это важно прежде всего</div>
    </div>
    <div class="lesson-block-content">
        <p>90% обучения не работает — не потому что люди глупые, а потому что отсутствует технология.</p>
        <p style="margin-top:8px;">Автошкола: несколько недель → человек едет. Университет: 5 лет → человек не может работать по специальности. <strong>В чём разница?</strong> Технология — это последовательность действий, которая даёт предсказуемый результат.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Закон обучения: воспроизведение → понимание → результат</div>
    </div>
    <div class="lesson-block-content">
        <p><strong>Запомнить ≠ понять.</strong> Настоящее знание не требует вспоминания — вы просто знаете, как знаете что огонь горячий.</p>
        <p style="margin-top:8px;">Главная причина неудач в обучении — <strong>непонятное слово</strong>. Одно пропущенное слово останавливает понимание всей темы. Как дырка в стене — можно красить слой за слоем, но дырка никуда не денется.</p>
        <ul style="margin-top:8px;">
            <li>Скучно и хочется отвлечься → есть непонятное слово</li>
            <li>Ощущение "что-то не укладывается" → есть непонятное слово</li>
            <li>Проблема всегда <strong>раньше</strong> — в предыдущем материале</li>
        </ul>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Что такое концепт и почему он важнее определения</div>
    </div>
    <div class="lesson-block-content">
        <p>Концепт — это идея в вашем уме, а не запомненное определение. <strong>Концепт нельзя запомнить — его можно только создать.</strong></p>
        <p style="margin-top:8px;">Пример: "план" для руководителя продаж = цифра которую хочу достичь. Для владельца = последовательность конкретных действий. Одно слово — два разных концепта — полное непонимание.</p>
        <p style="margin-top:8px;"><strong>Правило:</strong> никогда не спрашивайте значение слов у людей — они дают ложные определения. Используйте словарь или AI.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Навык = автоматизм через повторение</div>
    </div>
    <div class="lesson-block-content">
        <p>Понимание — это ещё не навык. Знать грамматику ≠ говорить на языке.</p>
        <p style="margin-top:8px;">Навык — это автоматизм: первые 30 часов за рулём — стресс и внимание на педалях. После — слушаешь музыку и едешь. Так же с управлением: первый раз отдать распоряжение — страшно. После 100 раз — естественно.</p>
        <p style="margin-top:8px;"><strong>Важно учиться сразу правильно</strong> — неправильный автоматизм будет мешать всю жизнь.</p>
    </div>
</div>

<div class="result-block">
    <strong>Ваше задание сейчас:</strong> прояснить первые 13 терминов программы через AI ассистента ниже. Только 13 — не больше. Ассистент может предложить идти дальше — остановитесь на 13-м.
</div>`,
                
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
                
                lessonContent: `<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Чому більшість розпоряджень не виконується</div>
    </div>
    <div class="lesson-block-content">
        <p>Ви даєте завдання щодня. Через тиждень половина не виконана. Ви самі забуваєте що просили — співробітники теж.</p>
        <p style="margin-top:8px;">У команді живе негласне правило: <strong>"Сказали раз і не нагадали — значить неважливо".</strong> Це не зла воля — це нормальна реакція людини на яку звалюється купа задач.</p>
        <p style="margin-top:8px;">Результат: невиконання → ви втрачаєте контроль над бізнесом.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Рівні влади: чому одних слухають, а інших ігнорують</div>
    </div>
    <div class="lesson-block-content">
        <p>Є керівники які кажуть "тут душно" — і хтось відразу йде відкривати вікно. Є інші, які 10 разів нагадують "прибрати офіс" — і їх ігнорують. <strong>Різниця — рівень влади.</strong></p>
        <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;">
            <div style="flex:1;min-width:100px;padding:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;text-align:center;">
                <div style="font-size:1.5rem;font-weight:900;color:#ef4444;">1–10</div>
                <div style="font-size:0.78rem;color:#94a3b8;margin-top:4px;">Нагадуєте 10+ разів</div>
            </div>
            <div style="flex:1;min-width:100px;padding:12px;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:10px;text-align:center;">
                <div style="font-size:1.5rem;font-weight:900;color:#f97316;">40–60</div>
                <div style="font-size:0.78rem;color:#94a3b8;margin-top:4px;">Нагадуєте 2–3 рази</div>
            </div>
            <div style="flex:1;min-width:100px;padding:12px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:10px;text-align:center;">
                <div style="font-size:1.5rem;font-weight:900;color:#22c55e;">80+</div>
                <div style="font-size:0.78rem;color:#94a3b8;margin-top:4px;">Сказали раз — виконали</div>
            </div>
        </div>
        <p style="margin-top:10px;">Більшість власників зараз на рівні 20–30. Єдиний спосіб піднятися — систематично домагатися виконання кожного розпорядження. <strong>Кожне непроконтрольоване завдання = мінус до влади.</strong></p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">4 правила системи</div>
    </div>
    <div class="lesson-block-content">
        <div style="margin-bottom:12px;padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">01 — Тільки письмово</div>
            <p style="font-size:0.85rem;color:#94a3b8;">Усних розпоряджень не існує. Якщо сказали на нараді — одразу дублюйте письмово. Навіть якщо треба взяти паузу.</p>
        </div>
        <div style="margin-bottom:12px;padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">02 — Конкретна дата і час</div>
            <p style="font-size:0.85rem;color:#94a3b8;">"Скоро" і "пізніше" не існує. Без дедлайну завдання не буде виконано ніколи.</p>
        </div>
        <div style="margin-bottom:12px;padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">03 — Список усіх розпоряджень</div>
            <p style="font-size:0.85rem;color:#94a3b8;">Google таблиця або Excel: кому, що, термін, виконано. Без списку ви забуваєте контролювати — і руйнуєте свою владу.</p>
        </div>
        <div style="padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">04 — Контроль на кожній зустрічі</div>
            <p style="font-size:0.85rem;color:#94a3b8;">Кожна зустріч зі співробітником — відкриваєте список і проходите по кожному пункту. Не кричіть — спокійно нагадуйте поки не зрозуміють: ви НЕ забудете.</p>
        </div>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Шаблон правильного розпорядження (7 елементів)</div>
    </div>
    <div class="lesson-block-content">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">КОМУ</span><br><span style="color:#94a3b8;">Конкретна посада + ПІБ. Не "відділу".</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ТЕРМІН</span><br><span style="color:#94a3b8;">Конкретна дата і час.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">КОНТЕКСТ</span><br><span style="color:#94a3b8;">Чому, що змінилось, кого стосується.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ЗАВДАННЯ</span><br><span style="color:#94a3b8;">Дія + конкретний результат.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ПРОДУКТ</span><br><span style="color:#94a3b8;">Що має бути готовим: документ, фото, звіт.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ЗВІТ</span><br><span style="color:#94a3b8;">Дедлайн звіту, формат, куди надсилати.</span></div>
        </div>
        <div style="padding:12px;background:rgba(239,68,68,0.08);border-radius:8px;border-left:3px solid #ef4444;">
            <p style="font-size:0.82rem;color:#94a3b8;"><strong style="color:#ef4444;">❌ Погано:</strong> "Прослідкуй щоб усе було в порядку. Якось повідом якщо будуть проблеми."</p>
            <p style="font-size:0.82rem;color:#94a3b8;margin-top:6px;"><strong style="color:#22c55e;">✅ Добре:</strong> "До 13.12 о 18:00: провести брифінг (фото присутніх), перевірити кабінети 1–5 (фото кожного), надіслати звіт у Telegram до 19:00."</p>
        </div>
        <p style="font-size:0.82rem;color:#94a3b8;margin-top:10px;"><strong style="color:#ffffff;">Правило доказів:</strong> Купити квиток → "Зроблено" + файл. Розробити дизайн → "Зроблено" + скрін. Зателефонувати → "Зроблено" + скрін дзвінка. Без доказу — не виконано.</p>
    </div>
</div>


<div class="l-ai-block" style="margin:1.25rem 0 0;">
    <div class="l-ai-block-header">
        <div class="l-ai-icon">📋</div>
        <div>
            <div class="l-ai-title">AI Генератор розпоряджень</div>
            <div class="l-ai-desc">Опишіть завдання яке хочете поставити — асистент складе правильне розпорядження за шаблоном TALKO з усіма 7 елементами.</div>
        </div>
    </div>
    <button class="l-ai-btn" onclick="window.open('https://chatgpt.com/g/g-684be37e3bcc81918f64088a2bb094da-task-generator','_blank')">
        📋 Скласти розпорядження через AI →
    </button>
</div>

<div class="result-block" style="margin-top:1rem;">
    <strong>Результат через 2–4 тижні:</strong> співробітники звикнуть виконувати без суперечок. Замість 10 нагадувань — скажете раз і отримаєте результат. Перевірено на 150+ бізнесах.
</div>`,
                
                lessonContent_ru: `<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Чому більшість розпоряджень не виконується</div>
    </div>
    <div class="lesson-block-content">
        <p>Ви даєте завдання щодня. Через тиждень половина не виконана. Ви самі забуваєте що просили — співробітники теж.</p>
        <p style="margin-top:8px;">У команді живе негласне правило: <strong>"Сказали раз і не нагадали — значить неважливо".</strong> Це не зла воля — це нормальна реакція людини на яку звалюється купа задач.</p>
        <p style="margin-top:8px;">Результат: невиконання → ви втрачаєте контроль над бізнесом.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Рівні влади: чому одних слухають, а інших ігнорують</div>
    </div>
    <div class="lesson-block-content">
        <p>Є керівники які кажуть "тут душно" — і хтось відразу йде відкривати вікно. Є інші, які 10 разів нагадують "прибрати офіс" — і їх ігнорують. <strong>Різниця — рівень влади.</strong></p>
        <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;">
            <div style="flex:1;min-width:100px;padding:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;text-align:center;">
                <div style="font-size:1.5rem;font-weight:900;color:#ef4444;">1–10</div>
                <div style="font-size:0.78rem;color:#94a3b8;margin-top:4px;">Нагадуєте 10+ разів</div>
            </div>
            <div style="flex:1;min-width:100px;padding:12px;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:10px;text-align:center;">
                <div style="font-size:1.5rem;font-weight:900;color:#f97316;">40–60</div>
                <div style="font-size:0.78rem;color:#94a3b8;margin-top:4px;">Нагадуєте 2–3 рази</div>
            </div>
            <div style="flex:1;min-width:100px;padding:12px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:10px;text-align:center;">
                <div style="font-size:1.5rem;font-weight:900;color:#22c55e;">80+</div>
                <div style="font-size:0.78rem;color:#94a3b8;margin-top:4px;">Сказали раз — виконали</div>
            </div>
        </div>
        <p style="margin-top:10px;">Більшість власників зараз на рівні 20–30. Єдиний спосіб піднятися — систематично домагатися виконання кожного розпорядження. <strong>Кожне непроконтрольоване завдання = мінус до влади.</strong></p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">4 правила системи</div>
    </div>
    <div class="lesson-block-content">
        <div style="margin-bottom:12px;padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">01 — Тільки письмово</div>
            <p style="font-size:0.85rem;color:#94a3b8;">Усних розпоряджень не існує. Якщо сказали на нараді — одразу дублюйте письмово. Навіть якщо треба взяти паузу.</p>
        </div>
        <div style="margin-bottom:12px;padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">02 — Конкретна дата і час</div>
            <p style="font-size:0.85rem;color:#94a3b8;">"Скоро" і "пізніше" не існує. Без дедлайну завдання не буде виконано ніколи.</p>
        </div>
        <div style="margin-bottom:12px;padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">03 — Список усіх розпоряджень</div>
            <p style="font-size:0.85rem;color:#94a3b8;">Google таблиця або Excel: кому, що, термін, виконано. Без списку ви забуваєте контролювати — і руйнуєте свою владу.</p>
        </div>
        <div style="padding:12px;background:rgba(34,197,94,0.06);border-radius:10px;border-left:3px solid #22c55e;">
            <div style="font-weight:700;color:#22c55e;margin-bottom:4px;font-size:0.9rem;">04 — Контроль на кожній зустрічі</div>
            <p style="font-size:0.85rem;color:#94a3b8;">Кожна зустріч зі співробітником — відкриваєте список і проходите по кожному пункту. Не кричіть — спокійно нагадуйте поки не зрозуміють: ви НЕ забудете.</p>
        </div>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Шаблон правильного розпорядження (7 елементів)</div>
    </div>
    <div class="lesson-block-content">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">КОМУ</span><br><span style="color:#94a3b8;">Конкретна посада + ПІБ. Не "відділу".</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ТЕРМІН</span><br><span style="color:#94a3b8;">Конкретна дата і час.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">КОНТЕКСТ</span><br><span style="color:#94a3b8;">Чому, що змінилось, кого стосується.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ЗАВДАННЯ</span><br><span style="color:#94a3b8;">Дія + конкретний результат.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ПРОДУКТ</span><br><span style="color:#94a3b8;">Що має бути готовим: документ, фото, звіт.</span></div>
            <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.82rem;"><span style="color:#22c55e;font-weight:700;">ЗВІТ</span><br><span style="color:#94a3b8;">Дедлайн звіту, формат, куди надсилати.</span></div>
        </div>
        <div style="padding:12px;background:rgba(239,68,68,0.08);border-radius:8px;border-left:3px solid #ef4444;">
            <p style="font-size:0.82rem;color:#94a3b8;"><strong style="color:#ef4444;">❌ Погано:</strong> "Прослідкуй щоб усе було в порядку. Якось повідом якщо будуть проблеми."</p>
            <p style="font-size:0.82rem;color:#94a3b8;margin-top:6px;"><strong style="color:#22c55e;">✅ Добре:</strong> "До 13.12 о 18:00: провести брифінг (фото присутніх), перевірити кабінети 1–5 (фото кожного), надіслати звіт у Telegram до 19:00."</p>
        </div>
        <p style="font-size:0.82rem;color:#94a3b8;margin-top:10px;"><strong style="color:#ffffff;">Правило доказів:</strong> Купити квиток → "Зроблено" + файл. Розробити дизайн → "Зроблено" + скрін. Зателефонувати → "Зроблено" + скрін дзвінка. Без доказу — не виконано.</p>
    </div>
</div>


<div class="l-ai-block" style="margin:1.25rem 0 0;">
    <div class="l-ai-block-header">
        <div class="l-ai-icon">📋</div>
        <div>
            <div class="l-ai-title">AI Генератор розпоряджень</div>
            <div class="l-ai-desc">Опишіть завдання яке хочете поставити — асистент складе правильне розпорядження за шаблоном TALKO з усіма 7 елементами.</div>
        </div>
    </div>
    <button class="l-ai-btn" onclick="window.open('https://chatgpt.com/g/g-684be37e3bcc81918f64088a2bb094da-task-generator','_blank')">
        📋 Скласти розпорядження через AI →
    </button>
</div>

<div class="result-block" style="margin-top:1rem;">
    <strong>Результат через 2–4 тижні:</strong> співробітники звикнуть виконувати без суперечок. Замість 10 нагадувань — скажете раз і отримаєте результат. Перевірено на 150+ бізнесах.
</div>`,
                
                homework: `<div class="lesson-block homework">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Зайдіть в AI Генератор розпоряджень (кнопка вище)</li>
            <li>Складіть одне реальне розпорядження для вашого співробітника</li>
            <li>Перевірте: чи є всі 7 елементів шаблону</li>
            <li>Відправте це розпорядження реальному співробітнику</li>
            <li>Напишіть у полі відповіді: кому відправили і яке завдання</li>
        </ol>
    </div>
</div>`,
                
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
                
                lessonContent: `<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Чому одні бізнеси ростуть, а інші застигають</div>
    </div>
    <div class="lesson-block-content">
        <p>Маючи крутий продукт, команду і бажання — бізнес все одно не рухається. Причина завжди в одному: <strong>не знайдено справжнє вузьке місце</strong>.</p>
        <p style="margin-top:8px;">Більшість власників шукають рішення на рівні дій — більше реклами, більше продажів, більше контролю. Але проблема може бути глибше — в інструментах, бізнес-моделі, цілях або особистих переконаннях.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">5 шарів бізнесу — де шукати точку росту</div>
    </div>
    <div class="lesson-block-content">
        <p>Кожен бізнес має 5 шарів. Проблема завжди в одному з них — і рішення треба шукати саме там, а не зверху:</p>
        <ul style="margin-top:8px;">
            <li><strong>1. Дії</strong> — що робите зараз: продажі, зустрічі, маркетинг</li>
            <li><strong>2. Інструменти</strong> — структура, делегування, статистики, фінплан</li>
            <li><strong>3. Бізнес-модель</strong> — як заробляєте, чи достатня маржа, чи масштабується</li>
            <li><strong>4. Цілі та партнерства</strong> — чи надихають цілі, чи є спільне бачення з партнерами</li>
            <li><strong>5. Особистість</strong> — обмежуючі переконання та гординя що блокують ріст</li>
        </ul>
        <p style="margin-top:8px;">Тригери які кажуть "спускайся глибше": немає часу, люди саботують, продажі нестабільні, низька рентабельність, висока плинність, відсутність мотивації в команді.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Найглибший шар — переконання та гординя</div>
    </div>
    <div class="lesson-block-content">
        <p>Це шар який найважче побачити самостійно. Переконання формують рішення — а рішення формують результат.</p>
        <p style="margin-top:8px;">Приклади що блокують ріст:</p>
        <ul style="margin-top:6px;">
            <li>"Якщо хочеш зробити добре — зроби сам" → власник стає вузьким місцем</li>
            <li>"Консультант не знає мого бізнесу" → закритість до нових рішень</li>
            <li>"Клієнти не готові платити більше" → підсвідомо занижуєте ціни</li>
            <li>"Я завжди правий" → не вчитесь на помилках</li>
        </ul>
        <p style="margin-top:8px;">Гординя — невидимий бар'єр: блокує делегування, руйнує команду, зупиняє ріст. Найуспішніші власники — ті хто залишається відкритим і вдячним.</p>
    </div>
</div>

<div class="result-block">
    <strong>Результат уроку:</strong> ви визначите в якому з 5 шарів зараз знаходиться ваше вузьке місце — і зрозумієте де шукати рішення.
</div>

<div class="l-ai-block" style="margin:1.25rem 0 0;">
    <div class="l-ai-block-header">
        <div class="l-ai-icon">🔍</div>
        <div>
            <div class="l-ai-title">AI Аналіз — 5 шарів бізнесу</div>
            <div class="l-ai-desc">Зайдіть в асистента і пройдіть аналіз своєї ситуації. Він задасть питання по кожному шару і визначить де ваше вузьке місце прямо зараз.</div>
        </div>
    </div>
    <button class="l-ai-btn" onclick="window.open('https://chatgpt.com/g/g-6856d5ef91608191918552480e1018eb-pie-analysis-methodology-5-layers-of-business','_blank')">
        🔍 Пройти аналіз 5 шарів →
    </button>
</div>`,
                
                lessonContent_ru: `<div class="lesson-block intro">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Почему одни бизнесы растут, а другие застывают</div>
    </div>
    <div class="lesson-block-content">
        <p>Имея крутой продукт, команду и желание — бизнес всё равно не двигается. Причина всегда одна: <strong>не найдено настоящее узкое место</strong>.</p>
        <p style="margin-top:8px;">Большинство владельцев ищут решение на уровне действий — больше рекламы, больше продаж, больше контроля. Но проблема может быть глубже — в инструментах, бизнес-модели, целях или личных убеждениях.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">5 слоёв бизнеса — где искать точку роста</div>
    </div>
    <div class="lesson-block-content">
        <p>Каждый бизнес имеет 5 слоёв. Проблема всегда в одном из них — и решение нужно искать именно там, а не сверху:</p>
        <ul style="margin-top:8px;">
            <li><strong>1. Действия</strong> — что делаете сейчас: продажи, встречи, маркетинг</li>
            <li><strong>2. Инструменты</strong> — структура, делегирование, статистики, финплан</li>
            <li><strong>3. Бизнес-модель</strong> — как зарабатываете, достаточна ли маржа, масштабируется ли</li>
            <li><strong>4. Цели и партнёрства</strong> — вдохновляют ли цели, есть ли общее видение с партнёрами</li>
            <li><strong>5. Личность</strong> — ограничивающие убеждения и гордыня, блокирующие рост</li>
        </ul>
        <p style="margin-top:8px;">Триггеры "спускайся глубже": нет времени, люди саботируют, нестабильные продажи, низкая рентабельность, высокая текучка, отсутствие мотивации в команде.</p>
    </div>
</div>

<div class="lesson-block">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Самый глубокий слой — убеждения и гордыня</div>
    </div>
    <div class="lesson-block-content">
        <p>Это слой который сложнее всего увидеть самостоятельно. Убеждения формируют решения — а решения формируют результат.</p>
        <p style="margin-top:8px;">Примеры что блокируют рост:</p>
        <ul style="margin-top:6px;">
            <li>"Хочешь сделать хорошо — сделай сам" → владелец становится узким местом</li>
            <li>"Консультант не знает мой бизнес" → закрытость к новым решениям</li>
            <li>"Клиенты не готовы платить больше" → подсознательно занижаете цены</li>
            <li>"Я всегда прав" → не учитесь на ошибках</li>
        </ul>
        <p style="margin-top:8px;">Гордыня — невидимый барьер: блокирует делегирование, разрушает команду, останавливает рост. Самые успешные владельцы — те кто остаётся открытым и благодарным.</p>
    </div>
</div>

<div class="result-block">
    <strong>Результат урока:</strong> вы определите в каком из 5 слоёв сейчас находится ваше узкое место — и поймёте где искать решение.
</div>

<div class="l-ai-block" style="margin:1.25rem 0 0;">
    <div class="l-ai-block-header">
        <div class="l-ai-icon">🔍</div>
        <div>
            <div class="l-ai-title">AI Анализ — 5 слоёв бизнеса</div>
            <div class="l-ai-desc">Зайдите в ассистента и пройдите анализ своей ситуации. Он задаст вопросы по каждому слою и определит где ваше узкое место прямо сейчас.</div>
        </div>
    </div>
    <button class="l-ai-btn" onclick="window.open('https://chatgpt.com/g/g-6856d5ef91608191918552480e1018eb-pie-analysis-methodology-5-layers-of-business','_blank')">
        🔍 Пройти анализ 5 слоёв →
    </button>
</div>`,
                
                homework: `<div class="lesson-block homework">
    <div class="lesson-block-header">
        <div class="lesson-block-title">Домашнє завдання</div>
    </div>
    <div class="lesson-block-content">
        <ol>
            <li>Зайдіть в AI асистента (кнопка вище)</li>
            <li>Пройдіть аналіз — відповідайте чесно на питання</li>
            <li>Запишіть: в якому шарі ваше вузьке місце зараз</li>
            <li>Напишіть у полі відповіді назву шару і 1-2 речення про свою ситуацію</li>
        </ol>
    </div>
</div>`,
                
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
    // ── Algoritm Route (Module 0 special view) ────────────────
    window._openAlgoritm = function() {
        const root = document.getElementById('learningTab');
        if (!root) return;
        root.innerHTML = `
        <div class="learning-wrap" style="padding:0 0 4rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;padding:1rem 1.5rem 0.5rem;position:sticky;top:0;background:white;z-index:10;border-bottom:1px solid #e5e7eb;">
                <button class="l-back-btn" onclick="window._openLearningModule(0)" style="display:flex;align-items:center;gap:0.4rem;background:none;border:none;color:#6b7280;font-size:0.875rem;cursor:pointer;">
                    ← Назад до модуля
                </button>
                <span style="font-weight:700;color:#1a1a1a;">Маршрут програми</span>
            </div>
            <style>
        :root {
            --primary: #22c55e;
            --primary-dark: #16a34a;
            --primary-light: rgba(34, 197, 94, 0.1);
            --bg-dark: #0a0f0a;
            --bg-light: #f9fafb;
            --bg-card: #ffffff;
            --text-dark: #1a1a1a;
            --text-gray: #525252;
            --text-light: #94a3b8;
            --border: #e2e8f0;
            --red: #ef4444;
            --orange: #f59e0b;
            --blue: #3b82f6;
            --purple: #8b5cf6;
        }





.algoritm-wrap .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px 16px;
        }

        /* Header */
.algoritm-wrap .page-header {
            background: var(--bg-dark);
            padding: 24px 0;
            margin-bottom: 24px;
        }

.algoritm-wrap .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
        }

.algoritm-wrap .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

.algoritm-wrap .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
        }

.algoritm-wrap .logo-icon {
            width: 40px;
            height: 40px;
            background: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

.algoritm-wrap .logo-icon svg {
            width: 22px;
            height: 22px;
            color: var(--bg-dark);
        }

.algoritm-wrap .page-title {
            color: #fff;
            font-size: 24px;
            font-weight: 700;
        }

.algoritm-wrap .page-title span {
            color: var(--primary);
        }

        /* Progress Bar */
.algoritm-wrap .progress-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 20px 24px;
            margin-bottom: 24px;
            border: 1px solid var(--border);
        }

.algoritm-wrap .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

.algoritm-wrap .progress-label {
            font-weight: 600;
            font-size: 14px;
            color: var(--text-gray);
        }

.algoritm-wrap .progress-value {
            font-weight: 700;
            font-size: 14px;
            color: var(--primary);
        }

.algoritm-wrap .progress-bar {
            height: 8px;
            background: var(--border);
            border-radius: 4px;
            overflow: hidden;
        }

.algoritm-wrap .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        /* Stats */
.algoritm-wrap .stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

.algoritm-wrap .stat-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 16px 20px;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 12px;
        }

.algoritm-wrap .stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

.algoritm-wrap .stat-icon svg {
            width: 22px;
            height: 22px;
        }

.algoritm-wrap .stat-icon.green {
            background: var(--primary-light);
        }

.algoritm-wrap .stat-icon.green svg {
            color: var(--primary);
        }

.algoritm-wrap .stat-icon.orange {
            background: rgba(245, 158, 11, 0.1);
        }

.algoritm-wrap .stat-icon.orange svg {
            color: var(--orange);
        }

.algoritm-wrap .stat-icon.blue {
            background: rgba(59, 130, 246, 0.1);
        }

.algoritm-wrap .stat-icon.blue svg {
            color: var(--blue);
        }

.algoritm-wrap .stat-icon.gray {
            background: rgba(148, 163, 184, 0.1);
        }

.algoritm-wrap .stat-icon.gray svg {
            color: var(--text-light);
        }

.algoritm-wrap .stat-content h4 {
            font-size: 24px;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 2px;
        }

.algoritm-wrap .stat-content p {
            font-size: 13px;
            color: var(--text-gray);
        }

        /* Table Container */
.algoritm-wrap .table-container {
            background: var(--bg-card);
            border-radius: 16px;
            border: 1px solid var(--border);
            overflow: hidden;
        }

.algoritm-wrap .table-header-bar {
            background: var(--bg-dark);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

.algoritm-wrap .table-title {
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

.algoritm-wrap .table-title svg {
            width: 20px;
            height: 20px;
            color: var(--primary);
        }

.algoritm-wrap .table-actions {
            display: flex;
            gap: 8px;
        }

.algoritm-wrap .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }

.algoritm-wrap .btn svg {
            width: 16px;
            height: 16px;
        }

.algoritm-wrap .btn-primary {
            background: var(--primary);
            color: #fff;
        }

.algoritm-wrap .btn-primary:hover {
            background: var(--primary-dark);
        }

.algoritm-wrap .btn-outline-light {
            background: transparent;
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

.algoritm-wrap .btn-outline-light:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        /* Table */
.algoritm-wrap .table-scroll {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1100px;
        }

        th {
            background: var(--bg-light);
            padding: 14px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-gray);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
            vertical-align: middle;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover {
            background: rgba(34, 197, 94, 0.02);
        }

        /* Step Column */
.algoritm-wrap .step-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

.algoritm-wrap .step-number {
            width: 32px;
            height: 32px;
            background: var(--primary-light);
            color: var(--primary-dark);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
        }

.algoritm-wrap .step-number.completed {
            background: var(--primary);
            color: #fff;
        }

.algoritm-wrap .step-number.active {
            background: var(--orange);
            color: #fff;
        }

.algoritm-wrap .step-info h4 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 2px;
        }

.algoritm-wrap .step-info p {
            font-size: 12px;
            color: var(--text-gray);
        }

        /* Status Badge */
.algoritm-wrap .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s;
        }

.algoritm-wrap .status-badge:hover {
            transform: scale(1.02);
        }

.algoritm-wrap .status-badge svg {
            width: 14px;
            height: 14px;
        }

.algoritm-wrap .status-completed {
            background: var(--primary-light);
            color: var(--primary-dark);
        }

.algoritm-wrap .status-in-progress {
            background: rgba(245, 158, 11, 0.1);
            color: #d97706;
        }

.algoritm-wrap .status-waiting {
            background: rgba(59, 130, 246, 0.1);
            color: var(--blue);
        }

.algoritm-wrap .status-locked {
            background: rgba(148, 163, 184, 0.1);
            color: var(--text-light);
        }

        /* Tool Cell */
.algoritm-wrap .tool-cell {
            display: flex;
            align-items: center;
            gap: 10px;
        }

.algoritm-wrap .tool-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

.algoritm-wrap .tool-icon svg {
            width: 18px;
            height: 18px;
        }

.algoritm-wrap .tool-icon.ai {
            background: rgba(139, 92, 246, 0.1);
        }

.algoritm-wrap .tool-icon.ai svg {
            color: var(--purple);
        }

.algoritm-wrap .tool-icon.video {
            background: rgba(239, 68, 68, 0.1);
        }

.algoritm-wrap .tool-icon.video svg {
            color: var(--red);
        }

.algoritm-wrap .tool-icon.doc {
            background: rgba(59, 130, 246, 0.1);
        }

.algoritm-wrap .tool-icon.doc svg {
            color: var(--blue);
        }

.algoritm-wrap .tool-icon.excel {
            background: rgba(34, 197, 94, 0.1);
        }

.algoritm-wrap .tool-icon.excel svg {
            color: var(--primary);
        }

.algoritm-wrap .tool-icon.chat {
            background: rgba(245, 158, 11, 0.1);
        }

.algoritm-wrap .tool-icon.chat svg {
            color: var(--orange);
        }

.algoritm-wrap .tool-icon.platform {
            background: var(--primary-light);
        }

.algoritm-wrap .tool-icon.platform svg {
            color: var(--primary-dark);
        }

.algoritm-wrap .tool-icon.folder {
            background: rgba(59, 130, 246, 0.1);
        }

.algoritm-wrap .tool-icon.folder svg {
            color: var(--blue);
        }

.algoritm-wrap .tool-icon.team {
            background: rgba(245, 158, 11, 0.1);
        }

.algoritm-wrap .tool-icon.team svg {
            color: var(--orange);
        }

.algoritm-wrap .tool-icon.present {
            background: rgba(239, 68, 68, 0.1);
        }

.algoritm-wrap .tool-icon.present svg {
            color: var(--red);
        }

.algoritm-wrap .tool-name {
            font-weight: 500;
        }

        /* Task Cell */
.algoritm-wrap .task-text {
            max-width: 280px;
            line-height: 1.4;
        }

        /* Date Cell */
.algoritm-wrap .date-cell {
            white-space: nowrap;
        }

.algoritm-wrap .date-planned {
            color: var(--text-gray);
            font-size: 13px;
        }

.algoritm-wrap .date-input {
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 13px;
            font-family: inherit;
            color: var(--text-dark);
            background: #fff;
        }

        /* Time Cell */
.algoritm-wrap .time-cell {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-gray);
        }

.algoritm-wrap .time-cell svg {
            width: 14px;
            height: 14px;
            color: var(--text-light);
        }

        /* Comment Cell */
.algoritm-wrap .comment-cell {
            max-width: 200px;
            font-size: 13px;
            color: var(--text-gray);
        }

.algoritm-wrap .comment-cell.empty {
            color: var(--text-light);
            font-style: italic;
        }

        /* Phase Divider */
.algoritm-wrap .phase-row td {
            background: var(--bg-dark);
            color: #fff;
            padding: 12px 16px;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

.algoritm-wrap .phase-row:hover td {
            background: var(--bg-dark);
        }

.algoritm-wrap .phase-label {
            display: flex;
            align-items: center;
            gap: 10px;
        }

.algoritm-wrap .phase-label svg {
            width: 18px;
            height: 18px;
            color: var(--primary);
        }

        /* Sub-phase */
.algoritm-wrap .subphase-row td {
            background: rgba(34, 197, 94, 0.05);
            color: var(--primary-dark);
            padding: 10px 16px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-left: 3px solid var(--primary);
        }

.algoritm-wrap .subphase-row:hover td {
            background: rgba(34, 197, 94, 0.08);
        }

        /* Responsive */
        @media (max-width: 1024px) {
.algoritm-wrap .stats-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 640px) {
.algoritm-wrap .stats-row {
                grid-template-columns: 1fr;
            }

.algoritm-wrap .header-content {
                flex-direction: column;
                align-items: flex-start;
            }

.algoritm-wrap .page-title {
                font-size: 20px;
            }
        }
</style>
<div class="algoritm-wrap"><!-- Header -->
    

    <div class="container">
        <!-- Progress -->
        <div class="progress-section">
            <div class="progress-header">
                <span class="progress-label">Загальний прогрес</span>
                <span class="progress-value">0 з 100 кроків (0%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>Виконано</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>В процесі</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="stat-content">
                    <h4>100</h4>
                    <p>Очікує</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gray">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>Заблоковано</p>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="table-container">
            <div class="table-header-bar">
                <div class="table-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    План впровадження
                </div>
                <div class="table-actions">
                    <button class="btn btn-outline-light" style="display:none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Експорт в Excel
                    </button>
                </div>
            </div>

            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 280px;">Крок</th>
                            <th style="width: 130px;">Статус</th>
                            <th style="width: 180px;">Інструмент</th>
                            <th style="width: 300px;">Що потрібно зробити</th>
                            <th style="width: 120px;">Планова дата</th>
                            <th style="width: 90px;">Час</th>
                            <th>Коментар</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- ФАЗА 1: АРХІТЕКТУРА БІЗНЕСУ -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    Фаза 1: Архітектура бізнесу
                                </div>
                            </td>
                        </tr>

                        <!-- Крок 1 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">1</div>
                                    <div class="step-info">
                                        <h4>Словник термінів</h4>
                                        <p>Основи системи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати словник термінів та понять з AI-асистентом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 2 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">2</div>
                                    <div class="step-info">
                                        <h4>Завдання та розпорядження</h4>
                                        <p>Як ставити правильно</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати як ставити завдання та розпорядження</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 3 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">3</div>
                                    <div class="step-info">
                                        <h4>Система Радар</h4>
                                        <p>Попередження проблем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Радар</span>
                                </div>
                            </td>
                            <td class="task-text">Розібратися з системою Радар — щоб люди не приходили з проблемою</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 4 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">4</div>
                                    <div class="step-info">
                                        <h4>Впровадження Радар</h4>
                                        <p>Для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Команда</span>
                                </div>
                            </td>
                            <td class="task-text">Дати людям систему і пояснити як використовувати AI Радар</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 5 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">5</div>
                                    <div class="step-info">
                                        <h4>Система Компас</h4>
                                        <p>Напрямок руху</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Компас</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати систему Компас з AI-асистентом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 6 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">6</div>
                                    <div class="step-info">
                                        <h4>Технічний провідник</h4>
                                        <p>Налаштування систем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">Техн. провідник</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-інструмент для покрокового налаштування CRM, таблиць, ботів</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 7 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">7</div>
                                    <div class="step-info">
                                        <h4>Папка на Google Drive</h4>
                                        <p>Систематизація TALKO</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon folder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                    </div>
                                    <span class="tool-name">Google Drive</span>
                                </div>
                            </td>
                            <td class="task-text">Створити папку "Систематизація TALKO" на Google Drive</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 8 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">8</div>
                                    <div class="step-info">
                                        <h4>Техн. провідник команді</h4>
                                        <p>Впровадження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Команда</span>
                                </div>
                            </td>
                            <td class="task-text">Дати співробітникам Технічний провідник для використання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 9 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">9</div>
                                    <div class="step-info">
                                        <h4>Асистент розвитку</h4>
                                        <p>Самоаналіз та мислення</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Розвиток</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати асистента для самоаналізу: інструменти, бізнес-модель, цілі, переконання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 10 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">10</div>
                                    <div class="step-info">
                                        <h4>Розмова з командою</h4>
                                        <p>Плани систематизації</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Команда</span>
                                </div>
                            </td>
                            <td class="task-text">Провести розмову зі співробітниками щодо планів систематизації та наступних кроків</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Ціль та ідеальна картина -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Ціль, задум та ідеальна картина</td>
                        </tr>

                        <!-- Крок 10 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">11</div>
                                    <div class="step-info">
                                        <h4>Ціль та ідеальна картина</h4>
                                        <p>Формування політики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти асистента "Ціль, задум та ідеальна картина" та сформувати політику</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 11 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">12</div>
                                    <div class="step-info">
                                        <h4>Презентація цілі</h4>
                                        <p>Тезиси для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентація</span>
                                </div>
                            </td>
                            <td class="task-text">Створити презентацію та тезиси до цілі та ідеальної картини</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 12 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">13</div>
                                    <div class="step-info">
                                        <h4>Впровадження цілі</h4>
                                        <p>Донесення команді</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження цілі та ідеальної картини для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Продукт організації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Продукт організації</td>
                        </tr>

                        <!-- Крок 13 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">14</div>
                                    <div class="step-info">
                                        <h4>Продукт організації</h4>
                                        <p>Політика продукту</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти асистента "Продукт організації" та створити політику</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 14 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">15</div>
                                    <div class="step-info">
                                        <h4>Презентація продукту</h4>
                                        <p>Підготовка матеріалів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентація</span>
                                </div>
                            </td>
                            <td class="task-text">Підготувати презентацію продукту організації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 15 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">16</div>
                                    <div class="step-info">
                                        <h4>Впровадження продукту</h4>
                                        <p>Донесення команді</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження продукту для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Структура -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Структура</td>
                        </tr>

                        <!-- Крок 16 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">17</div>
                                    <div class="step-info">
                                        <h4>Структура</h4>
                                        <p>Регламент</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Структура</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти асистента "Структура" та створити регламент</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 17 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">18</div>
                                    <div class="step-info">
                                        <h4>Презентація структури</h4>
                                        <p>Підготовка</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентація</span>
                                </div>
                            </td>
                            <td class="task-text">Провести презентацію структури</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 18 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">19</div>
                                    <div class="step-info">
                                        <h4>Впровадження структури</h4>
                                        <p>Донесення команді</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження структури для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Статистики та платформа -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Статистики та платформа</td>
                        </tr>

                        <!-- Крок 19 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">20</div>
                                    <div class="step-info">
                                        <h4>Статистики</h4>
                                        <p>Довідник метрик</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Статистики</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти асистента "Статистики" та створити довідник</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 20 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">21</div>
                                    <div class="step-info">
                                        <h4>Платформа: Структура</h4>
                                        <p>Освоєння модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Структура</span>
                                </div>
                            </td>
                            <td class="task-text">Освоїти платформу "Структура"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 21 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">22</div>
                                    <div class="step-info">
                                        <h4>Платформа: Статистики</h4>
                                        <p>Освоєння модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Статистики</span>
                                </div>
                            </td>
                            <td class="task-text">Освоїти платформу "Статистики"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 22 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">23</div>
                                    <div class="step-info">
                                        <h4>Платформа: Таск-трекер</h4>
                                        <p>Освоєння модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Освоїти платформу "Таск-трекер"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Вузьке місце та таски -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Вузьке місце та практика</td>
                        </tr>

                        <!-- Крок 23 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">24</div>
                                    <div class="step-info">
                                        <h4>Аналіз вузького місця</h4>
                                        <p>Знаходження проблеми</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                    </div>
                                    <span class="tool-name">Аналіз</span>
                                </div>
                            </td>
                            <td class="task-text">Провести аналіз вузького місця бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 24 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">25</div>
                                    <div class="step-info">
                                        <h4>План вузького місця</h4>
                                        <p>Розпорядження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">План</span>
                                </div>
                            </td>
                            <td class="task-text">Скласти план вузького місця та розбити на розпорядження</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 25 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">26</div>
                                    <div class="step-info">
                                        <h4>Розпорядження в таски</h4>
                                        <p>Внесення в систему</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Внести розпорядження в таск-трекер</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 26 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">27</div>
                                    <div class="step-info">
                                        <h4>Додати співробітника</h4>
                                        <p>В таск-трекер</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Додати співробітника в таск-трекер</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 27 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">28</div>
                                    <div class="step-info">
                                        <h4>Створити 4 функції</h4>
                                        <p>В таск-трекері</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Створити 4 функції в таск-трекері</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 28 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">29</div>
                                    <div class="step-info">
                                        <h4>Регулярні завдання</h4>
                                        <p>Додати в таск-трекер</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Додати кілька регулярних завдань до таск-трекера</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Журнал управлінських збоїв -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Журнал управлінських збоїв</td>
                        </tr>

                        <!-- Крок 29 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">30</div>
                                    <div class="step-info">
                                        <h4>AI: Журнал збоїв</h4>
                                        <p>Розбір системи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Журнал управлінських збоїв"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 30 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">31</div>
                                    <div class="step-info">
                                        <h4>Excel: Журнал збоїв</h4>
                                        <p>Створення таблиці</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Excel</span>
                                </div>
                            </td>
                            <td class="task-text">Створити Excel-таблицю журналу збоїв (дати в рядках, параметри в колонках)</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 31 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">32</div>
                                    <div class="step-info">
                                        <h4>Впровадження: Журнал</h4>
                                        <p>Щоденне ведення</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Впровадити щоденне ведення журналу управлінських збоїв</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>
                        <!-- ========================================== -->
                        <!-- ФАЗА 2: НАЙМ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                    Фаза 2: Найм
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Створення пропозицій -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Створення пропозицій — оффери, від яких не відмовляються</td>
                        </tr>

                        <!-- Крок 29 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">33</div>
                                    <div class="step-info">
                                        <h4>AI: Створення пропозицій</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Створення пропозицій"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 30 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">34</div>
                                    <div class="step-info">
                                        <h4>Документ: Пропозиції</h4>
                                        <p>Створення офферів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ з пропозиціями/офферами</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Формування заявки -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Формування заявки — правильне формулювання потреби</td>
                        </tr>

                        <!-- Крок 32 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">35</div>
                                    <div class="step-info">
                                        <h4>AI: Формування заявки</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Формування заявки"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 33 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">36</div>
                                    <div class="step-info">
                                        <h4>Документ: Заявка</h4>
                                        <p>Шаблон заявки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ/шаблон заявки на найм</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Опис функції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Опис функції — що саме робитиме людина</td>
                        </tr>

                        <!-- Крок 35 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">37</div>
                                    <div class="step-info">
                                        <h4>AI: Опис функції</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Опис функції"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 36 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">38</div>
                                    <div class="step-info">
                                        <h4>Документ: Опис функції</h4>
                                        <p>Посадові інструкції</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документи з описом функцій/посад</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Утримання співробітників -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Утримання співробітників — як зробити, щоб не звільнялися</td>
                        </tr>

                        <!-- Крок 38 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">39</div>
                                    <div class="step-info">
                                        <h4>AI: Утримання</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Утримання співробітників"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 39 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">40</div>
                                    <div class="step-info">
                                        <h4>Документ: Утримання</h4>
                                        <p>Політика утримання</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ з політикою утримання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Співбесіда та випробування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Співбесіда та випробування — структурований відбір та тестування</td>
                        </tr>

                        <!-- Крок 41 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">41</div>
                                    <div class="step-info">
                                        <h4>AI: Співбесіда</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Співбесіда та випробування"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 42 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">42</div>
                                    <div class="step-info">
                                        <h4>Документ: Співбесіда</h4>
                                        <p>Чек-лист та тести</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити чек-лист співбесіди та тестові завдання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Система наставництва -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Система наставництва — підтримка нового співробітника</td>
                        </tr>

                        <!-- Крок 44 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">43</div>
                                    <div class="step-info">
                                        <h4>AI: Наставництво</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Система наставництва"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 45 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">44</div>
                                    <div class="step-info">
                                        <h4>Документ: Наставництво</h4>
                                        <p>Програма менторства</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ з програмою наставництва</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Онбордінг + AI -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Онбордінг + AI-асистент — автоматизація введення в посаду</td>
                        </tr>

                        <!-- Крок 47 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">45</div>
                                    <div class="step-info">
                                        <h4>AI: Онбордінг</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Онбордінг</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Онбордінг"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 48 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">46</div>
                                    <div class="step-info">
                                        <h4>Документ: Онбордінг</h4>
                                        <p>Програма введення</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ з програмою онбордінгу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 3: ФІНАНСИ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Фаза 3: Фінанси
                                </div>
                            </td>
                        </tr>

                        <!-- Крок 50 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">47</div>
                                    <div class="step-info">
                                        <h4>Бізнес-калькулятор</h4>
                                        <p>Перевірка фін. цілі</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/></svg>
                                    </div>
                                    <span class="tool-name">AI Калькулятор</span>
                                </div>
                            </td>
                            <td class="task-text">Перевірка реальності твоєї фінансової цілі</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 51 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">48</div>
                                    <div class="step-info">
                                        <h4>Аналіз ніші</h4>
                                        <p>Перевірка потенціалу</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Проаналізувати чи можна на цій ніші заробити заплановану суму грошей</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 52 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">49</div>
                                    <div class="step-info">
                                        <h4>Три кити контролю</h4>
                                        <p>P&L, Cash Flow, Баланс</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">P&L, Cash Flow, Баланс — основа фінансової грамотності</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 53 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">50</div>
                                    <div class="step-info">
                                        <h4>7 департаментів</h4>
                                        <p>Контроль витрат</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Прив'язати витрати до департаментів та функцій бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 54 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">51</div>
                                    <div class="step-info">
                                        <h4>Excel: Витрати</h4>
                                        <p>Файл департаментів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Excel</span>
                                </div>
                            </td>
                            <td class="task-text">Створити файл Excel з витратами, департаментами та функціями</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 55 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">52</div>
                                    <div class="step-info">
                                        <h4>Бенчмарки по нішах</h4>
                                        <p>Еталонні % витрат</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Еталонні % витрат для різних типів бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 56 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">53</div>
                                    <div class="step-info">
                                        <h4>Тренажер витрат</h4>
                                        <p>Заповнення таблиці</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Тренажер</span>
                                </div>
                            </td>
                            <td class="task-text">Заповни таблицю витрат для свого бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 4: МАРКЕТИНГ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                    Фаза 4: Маркетинг (Реклама → Сайт → Бот → Фільтрація → Діалог → Консультація → Продаж → Аналітика)
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Основа і контроль -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основа і контроль — чітка ціль, метрики, де зливаються гроші</td>
                        </tr>

                        <!-- Крок 53 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">54</div>
                                    <div class="step-info">
                                        <h4>AI: Основа маркетингу</h4>
                                        <p>Ціль та метрики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: чітка ціль маркетингу, правильні метрики, де зливаються гроші</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 54 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">55</div>
                                    <div class="step-info">
                                        <h4>Документ: Ціль маркетингу</h4>
                                        <p>Метрики та контроль</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ: ціль маркетингу, ключові метрики, точки контролю</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Офер і тексти -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Офер і тексти, які продають — сильний офер, фільтрація нецільових</td>
                        </tr>

                        <!-- Крок 55 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">56</div>
                                    <div class="step-info">
                                        <h4>AI: Офер та тексти</h4>
                                        <p>Що продає</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: сильний офер під нішу, тексти що фільтрують, AI як інструмент</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 56 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">57</div>
                                    <div class="step-info">
                                        <h4>Документ: Офер</h4>
                                        <p>Тексти для реклами</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити офер та рекламні тексти, які фільтрують нецільових</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Сайт -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Сайт, який не зливає трафік — лендінг, логіка дії, інтеграція</td>
                        </tr>

                        <!-- Крок 57 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">58</div>
                                    <div class="step-info">
                                        <h4>AI: Структура сайту</h4>
                                        <p>Лендінг що конвертує</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: простий лендінг, логіка що веде до дії, інтеграція з ботом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 58 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">59</div>
                                    <div class="step-info">
                                        <h4>Документ: ТЗ на сайт</h4>
                                        <p>Структура лендінгу</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити ТЗ на лендінг: структура, тексти, інтеграції</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Telegram-воронка -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 4: Telegram-воронка і бот — автовідбір, кваліфікація, мінус 80% рутини</td>
                        </tr>

                        <!-- Крок 59 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">60</div>
                                    <div class="step-info">
                                        <h4>AI: Telegram-воронка</h4>
                                        <p>Бот та кваліфікація</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: автовідбір клієнтів, кваліфікаційні питання, прогрів</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 60 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">61</div>
                                    <div class="step-info">
                                        <h4>Документ: ТЗ на бот</h4>
                                        <p>Логіка воронки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити ТЗ на Telegram-бот: логіка воронки, питання, повідомлення</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Реклама -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 5: Реклама без хаосу — схема запуску, контроль бюджету, стабільні заявки</td>
                        </tr>

                        <!-- Крок 61 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">62</div>
                                    <div class="step-info">
                                        <h4>AI: Запуск реклами</h4>
                                        <p>Схема без зливів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: схема запуску реклами, контроль бюджету, відмова від зливів</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 62 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">63</div>
                                    <div class="step-info">
                                        <h4>Документ: План реклами</h4>
                                        <p>Бюджет та контроль</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити план запуску реклами: бюджет, етапи, точки контролю</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Продажі в переписці -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 6: Продажі в переписці — шаблони, структура консультації, даунсел</td>
                        </tr>

                        <!-- Крок 63 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">64</div>
                                    <div class="step-info">
                                        <h4>AI: Продажі в переписці</h4>
                                        <p>Шаблони та скрипти</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: шаблони переписок, структура консультації, даунсел</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 64 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">65</div>
                                    <div class="step-info">
                                        <h4>Документ: Скрипти продажів</h4>
                                        <p>Шаблони переписок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити скрипти продажів в переписці та структуру консультації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Аналітика -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 7: Аналітика і масштабування — ключові цифри, звіти, точки росту</td>
                        </tr>

                        <!-- Крок 65 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">66</div>
                                    <div class="step-info">
                                        <h4>AI: Аналітика</h4>
                                        <p>Ключові цифри</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: ключові цифри, аналіз воронки, точки росту без збільшення бюджету</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 66 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">67</div>
                                    <div class="step-info">
                                        <h4>Excel: Звіти маркетингу</h4>
                                        <p>Шаблони аналітики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Excel</span>
                                </div>
                            </td>
                            <td class="task-text">Створити Excel-шаблони звітів маркетингу та аналізу воронки</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 5: ДЕЛЕГУВАННЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                                    Фаза 5: Делегування
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Етапи делегування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Етапи делегування — розуміння процесу передачі функцій</td>
                        </tr>

                        <!-- Крок 68 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">68</div>
                                    <div class="step-info">
                                        <h4>AI: Етапи делегування</h4>
                                        <p>Послідовність кроків</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати етапи делегування: від підготовки до повної передачі функції</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 69 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">69</div>
                                    <div class="step-info">
                                        <h4>Документ: Етапи</h4>
                                        <p>Чек-лист делегування</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити чек-лист етапів делегування для використання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Опис функції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Опис функції — що робить людина на посаді</td>
                        </tr>

                        <!-- Крок 70 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">70</div>
                                    <div class="step-info">
                                        <h4>AI: Опис функції</h4>
                                        <p>Структура та зміст</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке опис функції, з чого складається, як писати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Бізнес-процес та направляюча форма -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Бізнес-процес та направляюча форма — алгоритми роботи</td>
                        </tr>

                        <!-- Крок 71 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">71</div>
                                    <div class="step-info">
                                        <h4>AI: Бізнес-процес</h4>
                                        <p>Направляюча форма</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке опис бізнес-процесу, направляюча форма, етапи з продуктами</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Інструкції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 4: Інструкції — детальні покрокові алгоритми</td>
                        </tr>

                        <!-- Крок 72 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">72</div>
                                    <div class="step-info">
                                        <h4>AI: Інструкції</h4>
                                        <p>Як писати та структурувати</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке інструкція, як правильно писати, рівень деталізації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Передача функції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 5: Передача функції — як правильно передати роботу</td>
                        </tr>

                        <!-- Крок 73 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">73</div>
                                    <div class="step-info">
                                        <h4>AI: Передача функції</h4>
                                        <p>Алгоритм передачі</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: як правильно передавати функцію, що підготувати, як контролювати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Папки співробітника -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 6: Папка штатного співробітника vs Посадова папка</td>
                        </tr>

                        <!-- Крок 74 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">74</div>
                                    <div class="step-info">
                                        <h4>AI: Папка співробітника</h4>
                                        <p>Що містить</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: папка штатного співробітника — що містить, для чого потрібна</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 75 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">75</div>
                                    <div class="step-info">
                                        <h4>AI: Посадова папка</h4>
                                        <p>Різниця та зміст</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: посадова папка — що містить, різниця від папки співробітника</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 76 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">76</div>
                                    <div class="step-info">
                                        <h4>Документ: Шаблони папок</h4>
                                        <p>Структура папок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити шаблони папки штатного співробітника та посадової папки</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Проведення делегування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 7: Як провести делегування — практична передача</td>
                        </tr>

                        <!-- Крок 77 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">77</div>
                                    <div class="step-info">
                                        <h4>AI: Проведення делегування</h4>
                                        <p>Практичний алгоритм</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: як провести делегування крок за кроком, що говорити</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Форма ППФ -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 8: Форма ППФ — документ передачі функції</td>
                        </tr>

                        <!-- Крок 78 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">78</div>
                                    <div class="step-info">
                                        <h4>AI: Форма ППФ</h4>
                                        <p>Протокол передачі</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: форма ППФ (протокол передачі функції), як заповнювати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 79 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">79</div>
                                    <div class="step-info">
                                        <h4>Документ: Форма ППФ</h4>
                                        <p>Шаблон протоколу</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити шаблон форми ППФ для використання при делегуванні</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Місяць координації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 9: Місяць координації — супровід нової людини на посаді</td>
                        </tr>

                        <!-- Крок 80 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">80</div>
                                    <div class="step-info">
                                        <h4>AI: Місяць координації</h4>
                                        <p>Навіщо та як</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: для чого місяць координувати нову людину, що робити, як контролювати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 81 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">81</div>
                                    <div class="step-info">
                                        <h4>Документ: План координації</h4>
                                        <p>Чек-лист на місяць</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити план координації на місяць: щоденні/тижневі точки контролю</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 6: СИСТЕМА ПЛАНУВАННЯ ТА КОМУНІКАЦІЇ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    Фаза 6: Система планування та комунікації
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Основи планування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи планування — навіщо і як планувати</td>
                        </tr>

                        <!-- Крок 82 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">82</div>
                                    <div class="step-info">
                                        <h4>AI: Основи планування</h4>
                                        <p>Принципи та підходи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: основи планування, рівні планів, зв'язок з цілями</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Система комунікації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Система комунікації — як спілкуватися в команді</td>
                        </tr>

                        <!-- Крок 83 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">83</div>
                                    <div class="step-info">
                                        <h4>AI: Система комунікації</h4>
                                        <p>Канали та правила</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: канали комунікації, правила спілкування, ескалація проблем</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 84 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">84</div>
                                    <div class="step-info">
                                        <h4>Документ: Політика комунікації</h4>
                                        <p>Правила для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити політику комунікації: канали, час відповіді, формати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Наради та зустрічі -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Наради та зустрічі — ефективні комунікації</td>
                        </tr>

                        <!-- Крок 85 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">85</div>
                                    <div class="step-info">
                                        <h4>AI: Наради та зустрічі</h4>
                                        <p>Як проводити ефективно</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: типи нарад, структура зустрічі, протоколювання рішень</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 86 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">86</div>
                                    <div class="step-info">
                                        <h4>Документ: Регламент нарад</h4>
                                        <p>Шаблони та правила</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити регламент нарад: типи, частота, шаблон протоколу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 7: СИСТЕМА КООРДИНАЦІЙ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                    Фаза 7: Система координацій
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Що таке координація -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Що таке координація — синхронізація роботи команди</td>
                        </tr>

                        <!-- Крок 87 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">87</div>
                                    <div class="step-info">
                                        <h4>AI: Основи координації</h4>
                                        <p>Навіщо та як</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке координація, відмінність від контролю, роль керівника</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Щоденна координація -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Щоденна координація — daily standup</td>
                        </tr>

                        <!-- Крок 88 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">88</div>
                                    <div class="step-info">
                                        <h4>AI: Щоденна координація</h4>
                                        <p>Daily standup</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: щоденна координація, формат, питання, тривалість</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Тижнева координація -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Тижнева координація — weekly review</td>
                        </tr>

                        <!-- Крок 89 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">89</div>
                                    <div class="step-info">
                                        <h4>AI: Тижнева координація</h4>
                                        <p>Weekly review</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: тижнева координація, аналіз результатів, планування тижня</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 90 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">90</div>
                                    <div class="step-info">
                                        <h4>Документ: Система координацій</h4>
                                        <p>Регламент та шаблони</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити систему координацій: щоденна, тижнева, місячна</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 8: СИСТЕМА ТАКТИЧНОГО ПЛАНУВАННЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Фаза 8: Система тактичного планування
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Тактичне планування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи тактичного планування — місяць/квартал</td>
                        </tr>

                        <!-- Крок 91 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">91</div>
                                    <div class="step-info">
                                        <h4>AI: Тактичне планування</h4>
                                        <p>Місяць та квартал</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: тактичне планування, горизонт місяць/квартал, декомпозиція цілей</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: OKR та KPI -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: OKR та KPI — метрики досягнення</td>
                        </tr>

                        <!-- Крок 92 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">92</div>
                                    <div class="step-info">
                                        <h4>AI: OKR та KPI</h4>
                                        <p>Метрики результатів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: OKR та KPI, як ставити, як відстежувати, каскадування</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 93 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">93</div>
                                    <div class="step-info">
                                        <h4>Документ: Тактичний план</h4>
                                        <p>Шаблон на квартал</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити шаблон тактичного плану на квартал з OKR</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 9: СТРАТЕГІЧНЕ ПЛАНУВАННЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                                    Фаза 9: Стратегічне планування
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Стратегія -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи стратегії — бачення на 1-3-5 років</td>
                        </tr>

                        <!-- Крок 94 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">94</div>
                                    <div class="step-info">
                                        <h4>AI: Основи стратегії</h4>
                                        <p>Бачення та місія</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: стратегічне планування, бачення, місія, горизонт 1-3-5 років</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Стратегічний аналіз -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Стратегічний аналіз — SWOT, конкуренти, ринок</td>
                        </tr>

                        <!-- Крок 95 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">95</div>
                                    <div class="step-info">
                                        <h4>AI: Стратегічний аналіз</h4>
                                        <p>SWOT та ринок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: SWOT-аналіз, аналіз конкурентів, позиціонування</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 96 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">96</div>
                                    <div class="step-info">
                                        <h4>Документ: Стратегічний план</h4>
                                        <p>План на 1-3 роки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити стратегічний план: бачення, цілі, ключові ініціативи</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 10: АВТОМАТИЗАЦІЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    Фаза 10: Автоматизація
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Основи автоматизації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи автоматизації — що і навіщо автоматизувати</td>
                        </tr>

                        <!-- Крок 97 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">97</div>
                                    <div class="step-info">
                                        <h4>AI: Основи автоматизації</h4>
                                        <p>Що автоматизувати</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що варто автоматизувати, пріоритети, ROI автоматизації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: AI в бізнесі -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: AI в бізнесі — практичне застосування</td>
                        </tr>

                        <!-- Крок 98 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">98</div>
                                    <div class="step-info">
                                        <h4>AI: AI в бізнесі</h4>
                                        <p>Практичні кейси</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: AI для бізнесу, чат-боти, асистенти, генерація контенту</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Інтеграції та автоматизації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Інтеграції — з'єднання систем</td>
                        </tr>

                        <!-- Крок 99 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">99</div>
                                    <div class="step-info">
                                        <h4>AI: Інтеграції</h4>
                                        <p>З'єднання систем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: інтеграції між системами, Zapier, Make, API</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 100 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">100</div>
                                    <div class="step-info">
                                        <h4>Документ: План автоматизації</h4>
                                        <p>Roadmap впровадження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити план автоматизації: пріоритети, інструменти, терміни</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    </div>
        </div>`;
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

    // ── AI Assistant block ───────────────────────────────────
        window.learningCourseData = learningCourseData;

window._openAIAssistant = function(moduleTitle, homeworkText) {
        const prompt = `У мене завдання з програми навчання TALKO:\n\nМодуль: ${moduleTitle}\n${homeworkText ? 'Домашнє завдання: ' + homeworkText + '\n' : ''}\nЯк мені це виконати? Проведи мене крок за кроком.`;
        navigator.clipboard.writeText(prompt).catch(() => {});
        window.open(AI_ASSISTANT_URL, '_blank');
    };

    function renderAIBlock(module, isRu) {
        const title = isRu ? (module.title_ru || module.title) : module.title;
        const hwRaw = isRu ? (module.homework_ru || module.homework || '') : (module.homework || '');
        // Витягуємо тільки текст з <li> елементів, ігноруємо заголовки блоку
        const hwItems = [];
        const liMatches = hwRaw.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
        liMatches.forEach(li => hwItems.push(li.replace(/<[^>]*>/g, '').trim()));
        const hw = hwItems.length ? hwItems.join('; ') : hwRaw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
        const prompt = isRu
            ? `У меня задание из программы обучения TALKO:\n\nМодуль: ${title}\n${hw ? 'Домашнее задание: ' + hw + '\n' : ''}\nКак мне это выполнить? Проведи меня шаг за шагом.`
            : `У мене завдання з програми навчання TALKO:\n\nМодуль: ${title}\n${hw ? 'Домашнє завдання: ' + hw + '\n' : ''}\nЯк мені це виконати? Проведи мене крок за кроком.`;
        const btnText = isRu ? 'Запитати AI асистента' : 'Запитати AI асистента';
        const descText = isRu
            ? 'Зайдіть в AI асистента, натисніть кнопку нижче — промпт скопіюється автоматично. Вставте його в чат і асистент проведе вас через виконання.'
            : 'Зайдіть в AI асистента, натисніть кнопку нижче — промпт скопіюється автоматично. Вставте його в чат і асистент проведе вас через виконання.';
        return `
        <div class="l-ai-block">
            <div class="l-ai-block-header">
                <div class="l-ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="26" height="26"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg></div>
                <div>
                    <div class="l-ai-title">AI Технічний провідник</div>
                    <div class="l-ai-desc">${descText}</div>
                </div>
            </div>
            <div class="l-ai-prompt-preview">${prompt.replace(/\\n/g,'<br>').replace(/\n/g,'<br>')}</div>
            <button class="l-ai-btn" onclick="navigator.clipboard.writeText(\`${prompt}\`).catch(()=>{});window.open('${AI_ASSISTANT_URL}','_blank')">
                ${btnText} →
            </button>
        </div>`;
    }


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

                <!-- AI Assistant block -->
                ${module.hideAiBlock ? '' : renderAIBlock(module, isRu)}

                <!-- Homework block -->
                ${module.homework ? (() => {
                    const hwHtml = isRu ? (module.homework_ru || module.homework) : module.homework;
                    const liItems2 = [];
                    const liM = hwHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
                    liM.forEach(li => liItems2.push(li.replace(/<[^>]*>/g, '').trim()));
                    const hwLinkUrl = module.homeworkLink || null;
                    const hwLinkName = isRu ? (module.homeworkLinkName_ru || module.homeworkLinkName || '') : (module.homeworkLinkName || '');
                    return `
                <div class="l-homework-block">
                    <div class="l-homework-title">
                        <i data-lucide="pencil" class="icon" style="width:16px;height:16px;color:#f59e0b;"></i>
                        ${isRu ? 'Домашнее задание' : 'Домашнє завдання'}
                    </div>
                    ${liItems2.length
                        ? `<ol style="margin:0.5rem 0 0.75rem 1.2rem;padding:0;color:#374151;font-size:0.9rem;line-height:1.7;">${liItems2.map(t => `<li>${t}</li>`).join('')}</ol>`
                        : `<div class="l-homework-desc">${hwHtml}</div>`
                    }
                    ${hwLinkUrl ? `<a href="${hwLinkUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:10px;font-size:0.875rem;color:#16a34a;text-decoration:none;font-weight:600;margin-bottom:0.75rem;">${hwLinkName || '→ AI-асистент'}</a>` : ''}
                    <textarea class="l-homework-textarea" id="learningHwTextarea" placeholder="${isRu ? 'Введите ваш ответ...' : 'Введіть вашу відповідь...'}">${hwText}</textarea>
                    <div class="l-homework-actions">
                        ${hwDone ? `<span class="l-hw-done-badge"><i data-lucide="check" class="icon" style="width:14px;height:14px;"></i> ${isRu ? 'Выполнено' : 'Виконано'}</span>` : ''}
                        <button class="l-btn-save-hw" onclick="window._saveLearningHomework(${moduleId})">
                            ${isRu ? 'Сохранить' : 'Зберегти'}
                        </button>
                    </div>
                </div>`;
                })() : ''}

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




})(); // END IIFE
