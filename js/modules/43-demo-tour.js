// ============================================================
// MODULE 43 — DEMO TOUR v1.0
// Інтерактивний тур для продавця по демо-даних
// Підсвічує елементи + підказки що говорити клієнту
// ============================================================
'use strict';

(function() {

// ── Стилі тура ──────────────────────────────────────────────
const TOUR_CSS = `
#demoTourOverlay {
    position: fixed;
    inset: 0;
    z-index: 99998;
    pointer-events: none;
}
#demoTourSpotlight {
    position: fixed;
    z-index: 99999;
    border-radius: 12px;
    box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);
    transition: all 0.35s cubic-bezier(.4,0,.2,1);
    pointer-events: none;
}
#demoTourCard {
    position: fixed;
    z-index: 100000;
    background: #fff;
    border-radius: 20px;
    padding: 1.4rem 1.6rem 1.2rem;
    width: 340px;
    max-width: calc(100vw - 32px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(.4,0,.2,1);
    border: 1.5px solid #f0f0f0;
}
#demoTourCard .tour-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #f0fdf4;
    color: #16a34a;
    border-radius: 8px;
    padding: 3px 10px;
    font-size: .72rem;
    font-weight: 700;
    margin-bottom: .75rem;
    letter-spacing: .03em;
}
#demoTourCard .tour-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: #111827;
    margin: 0 0 .6rem;
    line-height: 1.3;
}
#demoTourCard .tour-pitch {
    font-size: .85rem;
    color: #374151;
    line-height: 1.55;
    margin-bottom: .75rem;
}
#demoTourCard .tour-question {
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
    border-radius: 0 8px 8px 0;
    padding: .55rem .75rem;
    font-size: .82rem;
    color: #92400e;
    font-style: italic;
    margin-bottom: 1rem;
    line-height: 1.45;
}
#demoTourCard .tour-question strong {
    display: block;
    font-style: normal;
    font-size: .7rem;
    font-weight: 700;
    color: #b45309;
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: .04em;
}
#demoTourCard .tour-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
}
#demoTourCard .tour-progress {
    font-size: .72rem;
    color: #9ca3af;
    font-weight: 600;
    white-space: nowrap;
}
#demoTourCard .tour-progress-bar {
    flex: 1;
    height: 4px;
    background: #f3f4f6;
    border-radius: 2px;
    overflow: hidden;
}
#demoTourCard .tour-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border-radius: 2px;
    transition: width .35s ease;
}
#demoTourCard .tour-btns {
    display: flex;
    gap: .4rem;
    margin-top: .85rem;
}
#demoTourCard .tour-btn-prev {
    flex: 0 0 auto;
    padding: .45rem .9rem;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    font-size: .82rem;
    font-weight: 600;
    color: #6b7280;
    transition: all .15s;
}
#demoTourCard .tour-btn-prev:hover { border-color: #9ca3af; color: #374151; }
#demoTourCard .tour-btn-next {
    flex: 1;
    padding: .5rem 1rem;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #fff;
    cursor: pointer;
    font-size: .85rem;
    font-weight: 700;
    transition: all .15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}
#demoTourCard .tour-btn-next:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(34,197,94,.4); }
#demoTourCard .tour-btn-skip {
    flex: 0 0 auto;
    padding: .45rem .7rem;
    border-radius: 10px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: .78rem;
    color: #d1d5db;
    transition: color .15s;
}
#demoTourCard .tour-btn-skip:hover { color: #9ca3af; }
#demoTourBtn {
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 9990;
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: .55rem 1.1rem;
    font-size: .82rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(124,58,237,.4);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all .2s;
}
#demoTourBtn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,.5); }
@media (max-width: 767px) {
    #demoTourCard { width: calc(100vw - 24px); left: 12px !important; right: 12px !important; }
    #demoTourBtn { bottom: 70px; right: 16px; }
}
`;

// ── Кроки туру для меблевого бізнесу ───────────────────────
const TOURS = {

furniture_factory: [
    {
        title: '🌅 Мій день — серце системи',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Кожен співробітник бачить свої завдання на сьогодні. Тарас (майстер) відкрив систему зранку і знає що робити — без вашого дзвінка і «що мені сьогодні робити?»',
        question: 'Як зараз ваші майстри дізнаються що їм робити кожен ранок?',
    },
    {
        title: '⚠️ Відхилені завдання — живий контроль',
        selector: '#mydayContent',
        tab: 'myday',
        pitch: 'Власник відхилив план закупівель — "Бюджет перевищений на 18 000 грн, скоротити позиції". Система зберігає причину і завдання повертається виконавцю. Ніяких усних розмов — все в системі.',
        question: 'Коли ви повертаєте роботу на доопрацювання — як ви пояснюєте причину зараз?',
    },
    {
        title: '📋 Завдання — повна картина',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: '22 завдання розподілені між 8 співробітниками. Кожне має: виконавця, функцію, дедлайн, очікуваний результат і час виконання. Власник бачить хто що робить без нарад.',
        question: 'Скільки зараз у вас активних завдань? Де вони фіксуються — в голові, в телефоні, в Excel?',
    },
    {
        title: '🔴 Прострочені завдання',
        selector: '#tasksTab',
        tab: 'tasks',
        pitch: 'Одразу видно хто прострочив і на скільки. ТО верстатів не зроблено вже 1 день — ризик поломки під час виробництва. Система показує де виникає пожежа ДО того як вона вибухне.',
        question: 'Як ви зараз відстежуєте прострочені завдання? Хтось вам про це доповідає чи ви самі виявляєте?',
    },
    {
        title: '⚙️ Процеси — стандарт виробництва',
        selector: '[onclick*="switchTab(\'processes\')"]',
        tab: 'processes',
        pitch: 'Замовлення кухні Ковалів зараз на кроці 4 з 9 — "Підписання договору". Кожен крок призначений конкретній людині. Якщо Ірина захворіє — хтось інший відкриває систему і бачить що робити далі.',
        question: 'Що відбувається з замовленням якщо ваш ключовий менеджер захворів?',
    },
    {
        title: '📊 Процес — 9 кроків від заявки до монтажу',
        selector: '#processesTab',
        tab: 'processes',
        pitch: 'Від першого дзвінка клієнта до підписаного акту — 9 стандартних кроків. Замір, 3D-проєкт, договір, матеріали, виробництво, ВТК, монтаж. Новий співробітник на 3-й день вже знає весь цикл.',
        question: 'Скільки часу займає введення нового менеджера у ваш процес продажів?',
    },
    {
        title: '📞 CRM Todo — дзвінки на сьогодні',
        selector: '[onclick*="crm"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Ірина відкриває ранок і бачить: 4 клієнти яким треба зателефонувати сьогодні. Романова жде консультацію, Бондар просив передзвонити після 14:00. Ніхто не забутий, ніхто не "загубився".',
        question: 'Як зараз ваші менеджери пам\'ятають кому і коли треба передзвонити?',
    },
    {
        title: '💼 CRM — воронка продажів',
        selector: '#crmTab',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: '14 угод у воронці на загальну суму 985 000 грн. Одразу видно де "затор" — 3 угоди застрягли на стадії "Проєктування" більше тижня. Ви бачите це одним поглядом, а не питаєте менеджера.',
        question: 'Скільки зараз угод у вашій воронці? Ви можете назвати суму прямо зараз?',
    },
    {
        title: '📈 Аналітика — 12 тижнів динаміки',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: 'Виручка росте: 63 000 → 72 000 грн/тиждень за 3 місяці (+14%). Конверсія 38% — нижче цілі 45%. Одразу видно де проблема і де ріст. Це не Excel звіт який готують 2 дні — дані оновлюються в реальному часі.',
        question: 'Скільки часу у вас іде на підготовку тижневого звіту по продажах?',
    },
    {
        title: '🎯 KPI — цілі і факт',
        selector: '#statisticsContainer',
        tab: 'statistics',
        pitch: 'Зеленим — досягаємо цілі. Червоним — відстаємо. Конверсія 38% при цілі 45% — червона. Власник бачить це без нарад і питань. Менеджер сам бачить де він відстає від плану.',
        question: 'Ваші менеджери знають свої KPI? Вони самі відстежують досягнення цілей?',
    },
    {
        title: '🏭 Система — 8 функцій бізнесу',
        selector: '[onclick*="switchTab(\'system\')"], [onclick*="\'system\'"]',
        tab: 'system',
        pitch: 'Весь бізнес розбитий на 8 функцій: від залучення клієнтів до управління. Кожна функція має власника, завдання і KPI. Ви бачите структуру бізнесу як карту — де є провали, де все під контролем.',
        question: 'Якщо я попрошу вас намалювати структуру вашого бізнесу прямо зараз — скільки хвилин це займе?',
    },
    {
        title: '👥 Команда — навантаження кожного',
        selector: '#sysTeamTab, [onclick*="system"]',
        tab: 'system',
        pitch: 'Тарас завантажений на 87% — норма. Катерина має 1 прострочене завдання. Ірина виконує 100% вчасно. Ви бачите хто перевантажений, хто недозавантажений — без нарад і особистих питань.',
        question: 'Як ви розумієте що конкретний співробітник перевантажений — коли він вам про це скаже?',
    },
    {
        title: '💰 Фінанси — повний контур',
        selector: '[onclick*="finance"]',
        tab: 'finance',
        lazyGroup: 'finance',
        pitch: 'Доходи, витрати, прибуток у реальному часі. 287 500 грн виручки, 58 400 грн чистого прибутку, маржа 31.2%. 3 рахунки, 27 транзакцій за 3 місяці. Бухгалтер більше не носить папери — все в системі.',
        question: 'Ви зараз знаєте свій чистий прибуток за минулий місяць? За скільки часу ви це дізнаєтесь?',
    },
    {
        title: '📅 Регулярні платежі — нічого не забуто',
        selector: '#financeTab',
        tab: 'finance',
        pitch: '9 регулярних платежів автоматично нагадують коли і скільки сплатити. Оренда 18 000 грн — 1-го числа. Зарплата Тараса 28 000 — 25-го. Ви не пропустите жодного платежу.',
        question: 'Чи бувало що ви забули вчасно сплатити рахунок або зарплату?',
    },
    {
        title: '📊 Фінансове планування',
        selector: '#financeTab',
        tab: 'finance',
        pitch: 'Ціль на березень — 320 000 грн. Факт — 287 500. Відставання 32 500 грн — видно одразу. Ви плануєте квітень з урахуванням березневих результатів. Фінансова дисципліна без бухгалтера який "порахує колись".',
        question: 'У вас є фінансовий план на наступний місяць? На папері, в Excel чи в голові?',
    },
    {
        title: '📦 Склад — матеріали під контролем',
        selector: '[onclick*="warehouse"]',
        tab: 'warehouse',
        lazyGroup: 'warehouse',
        pitch: 'Клей ПВА — 2 каністри, мінімум 3. Система автоматично показує "Потребує замовлення". Виробництво ніколи не зупиниться через відсутність матеріалу — система попередить заздалегідь.',
        question: 'Чи зупинялось у вас виробництво через те що закінчились матеріали?',
    },
    {
        title: '🔄 Склад — переміщення і інвентаризація',
        selector: '#warehouseTab',
        tab: 'warehouse',
        pitch: 'Зразки фасадів переміщені з цеху в шоурум — операція зафіксована. Щомісячна інвентаризація показала відхилення -2 листи ЛДСП. Ви знаєте де кожна одиниця матеріалу. Склад більше не "чорна діра".',
        question: 'Як часто у вас проводиться інвентаризація? Ви знаєте фактичні залишки зараз?',
    },
    {
        title: '🏪 Постачальники — вся база в системі',
        selector: '#warehouseTab',
        tab: 'warehouse',
        pitch: 'Кромтех, Blum Ukraine, ПВХ-Декор, МеталПроф, Hafele — контакти, умови, нотатки по кожному. Новий закупівельник відкриває систему і знає де і що замовляти без питань до власника.',
        question: 'Якщо ваш закупівельник звільниться завтра — де знаходяться контакти постачальників?',
    },
    {
        title: '📐 Кошторис — рахуємо точно',
        selector: '[onclick*="estimate"]',
        tab: 'estimate',
        lazyGroup: 'estimate',
        pitch: 'Кухня Ковалів — 11 позицій матеріалів + робота = 87 500 грн. Менеджер вводить розміри кухні — система автоматично рахує потребу в матеріалах по нормах. Більше ніяких "на oko" і втрат маржі.',
        question: 'Як зараз ваші менеджери рахують кошторис клієнту — на калькуляторі, в Excel?',
    },
    {
        title: '📅 Бронювання — онлайн запис на замір',
        selector: '[onclick*="booking"]',
        tab: 'booking',
        lazyGroup: 'booking',
        pitch: 'Клієнт заходить на сайт і сам обирає зручний час для виїзного заміру. 6 записів на цьому тижні вже є. Менеджер не витрачає час на "а коли вам зручно" — система робить це автоматично.',
        question: 'Скільки часу ваш менеджер витрачає на узгодження часу виїзду до клієнта?',
    },
    {
        title: '🤝 Координації — наради з результатом',
        selector: '[onclick*="coordination"]',
        tab: 'coordination',
        lazyGroup: 'coordination',
        pitch: '4 регулярних наради: щоденний стенд-ап цеху 08:00, тижнева нарада виробництво+продажі, рада власника щоп\'ятниці. Кожна нарада має порядок денний, рішення фіксуються. Наради більше не "поговорили і розійшлись".',
        question: 'Ваші наради мають зафіксований результат? Або через тиждень ніхто не пам\'ятає що вирішили?',
    },
    {
        title: '🧠 AI Асистент — знає ваш бізнес',
        selector: '#aiAssistantBtn, [onclick*="openAiChat"]',
        tab: null,
        pitch: 'AI знає що МеблеМайстер виробляє меблі на замовлення, що ціль — 320 000 грн/міс, що конверсія відстає від плану. Ви питаєте "що не так з продажами цього місяця" — AI дає відповідь на основі ваших реальних даних.',
        question: 'Уявіть що у вас є аналітик який завжди знає всі цифри і може відповісти на будь-яке питання за 10 секунд.',
    },
    {
        title: '📱 Мобільна версія',
        selector: null,
        tab: null,
        pitch: 'Власник перевіряє показники з телефону о 7 ранку. Майстер закриває завдання на об\'єкті. Менеджер переглядає угоди між зустрічами. Система працює однаково добре на телефоні і компютері.',
        question: 'Де ви зазвичай перевіряєте стан бізнесу — за комп\'ютером чи з телефону?',
    },
    {
        title: '🚀 Що далі — система на автопілоті',
        selector: null,
        tab: null,
        isLast: true,
        pitch: 'За 65 днів впровадження бізнес переходить на автопілот: кожен знає що робити, власник бачить картину в реальному часі, жодне завдання не загублено, жоден клієнт не забутий. Це не програма — це система управління бізнесом.',
        question: 'Як виглядає ваш бізнес через рік якщо кожен день є така картина?',
    },
],

}; // кінець TOURS

// ── Стан тура ───────────────────────────────────────────────
let _tourActive  = false;
let _tourStep    = 0;
let _tourNiche   = null;
let _tourSteps   = [];

// ── Ін'єкція стилів ─────────────────────────────────────────
function _injectStyles() {
    if (document.getElementById('demoTourStyles')) return;
    const s = document.createElement('style');
    s.id = 'demoTourStyles';
    s.textContent = TOUR_CSS;
    document.head.appendChild(s);
}

// ── Кнопка запуску тура ────────────────────────────────────
function _renderTourButton(niche) {
    const existing = document.getElementById('demoTourBtn');
    if (existing) existing.remove();

    const steps = TOURS[niche];
    if (!steps) return;

    const saved = _getSavedStep(niche);
    const label = saved > 0 ? `▶ Тур (${saved+1}/${steps.length})` : '🎯 Тур';

    const btn = document.createElement('button');
    btn.id = 'demoTourBtn';
    btn.innerHTML = label;
    btn.title = 'Запустити демо-тур для клієнта';
    btn.onclick = () => startTour(niche);
    document.body.appendChild(btn);
}

// ── Збереження позиції ─────────────────────────────────────
function _getSavedStep(niche) {
    try { return parseInt(localStorage.getItem('demoTour_' + niche) || '0'); } catch { return 0; }
}
function _saveStep(niche, step) {
    try { localStorage.setItem('demoTour_' + niche, step); } catch {}
}
function _clearStep(niche) {
    try { localStorage.removeItem('demoTour_' + niche); } catch {}
}

// ── Запустити тур ──────────────────────────────────────────
window.startTour = function(niche) {
    _injectStyles();
    _tourNiche  = niche || _tourNiche || 'furniture_factory';
    _tourSteps  = TOURS[_tourNiche] || [];
    if (!_tourSteps.length) return;

    _tourStep   = _getSavedStep(_tourNiche);
    _tourActive = true;

    _createOverlay();
    _renderStep(_tourStep);
};

// ── Зупинити тур ───────────────────────────────────────────
window.stopTour = function() {
    _tourActive = false;
    document.getElementById('demoTourOverlay')?.remove();
    document.getElementById('demoTourSpotlight')?.remove();
    document.getElementById('demoTourCard')?.remove();
    _renderTourButton(_tourNiche);
};

// ── Наступний крок ─────────────────────────────────────────
window.tourNext = function() {
    if (_tourStep < _tourSteps.length - 1) {
        _tourStep++;
        _saveStep(_tourNiche, _tourStep);
        _renderStep(_tourStep);
    } else {
        _clearStep(_tourNiche);
        _finishTour();
    }
};

// ── Попередній крок ────────────────────────────────────────
window.tourPrev = function() {
    if (_tourStep > 0) {
        _tourStep--;
        _saveStep(_tourNiche, _tourStep);
        _renderStep(_tourStep);
    }
};

// ── Фінал тура ─────────────────────────────────────────────
function _finishTour() {
    document.getElementById('demoTourOverlay')?.remove();
    document.getElementById('demoTourSpotlight')?.remove();
    document.getElementById('demoTourCard')?.remove();
    _tourActive = false;

    // Фінальна картка
    _injectStyles();
    const card = document.createElement('div');
    card.id = 'demoTourCard';
    card.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%);';
    card.innerHTML = `
        <div class="tour-tag">✅ Тур завершено</div>
        <div class="tour-title">Готові до наступного кроку?</div>
        <div class="tour-pitch">
            Ви щойно побачили як виглядає бізнес на автопілоті.<br><br>
            <strong>МеблеМайстер за 65 днів отримає:</strong><br>
            • Кожен знає своє завдання на день<br>
            • Власник бачить бізнес в реальному часі<br>
            • Жоден клієнт не загублений<br>
            • Фінанси і склад під контролем
        </div>
        <div class="tour-question">
            <strong>💬 Завершальне питання:</strong>
            «Що з того що ви побачили — найбільш болить у вашому бізнесі зараз?»
        </div>
        <div class="tour-btns">
            <button class="tour-btn-prev" onclick="window.startTour('${_tourNiche}')">↺ Спочатку</button>
            <button class="tour-btn-next" onclick="this.closest('#demoTourCard').remove()">
                Закрити тур ✓
            </button>
        </div>`;
    document.body.appendChild(card);
    _renderTourButton(_tourNiche);
}

// ── Рендер кроку ───────────────────────────────────────────
function _renderStep(idx) {
    const step    = _tourSteps[idx];
    if (!step) return;
    const total   = _tourSteps.length;
    const pct     = Math.round(((idx+1)/total)*100);
    const isFirst = idx === 0;
    const isLast  = idx === total - 1;

    // Переключити вкладку якщо потрібно
    if (step.tab) {
        _goToTab(step, () => {
            setTimeout(() => _positionSpotlightAndCard(step, idx, total, pct, isFirst, isLast), 400);
        });
    } else {
        _positionSpotlightAndCard(step, idx, total, pct, isFirst, isLast);
    }
}

function _goToTab(step, cb) {
    if (step.lazyGroup) {
        if (typeof lazyLoad === 'function') {
            lazyLoad(step.lazyGroup, () => {
                if (typeof switchTab === 'function') switchTab(step.tab);
                cb();
            });
        } else cb();
    } else {
        if (typeof switchTab === 'function') switchTab(step.tab);
        cb();
    }
}

function _positionSpotlightAndCard(step, idx, total, pct, isFirst, isLast) {
    const el = step.selector ? document.querySelector(step.selector) : null;

    // Spotlight
    let spotlight = document.getElementById('demoTourSpotlight');
    if (!spotlight) {
        spotlight = document.createElement('div');
        spotlight.id = 'demoTourSpotlight';
        document.body.appendChild(spotlight);
    }

    if (el) {
        const r = el.getBoundingClientRect();
        const pad = 8;
        spotlight.style.cssText = `
            position:fixed; z-index:99999;
            left:${r.left - pad}px; top:${r.top - pad}px;
            width:${r.width + pad*2}px; height:${r.height + pad*2}px;
            border-radius:12px;
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 3px #22c55e;
            transition: all 0.35s cubic-bezier(.4,0,.2,1);
            pointer-events:none;
        `;
    } else {
        // Немає елемента — просто затемнення
        spotlight.style.cssText = `
            position:fixed; z-index:99999;
            left:50%; top:50%; width:0; height:0;
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);
            pointer-events:none;
        `;
    }

    // Картка
    let card = document.getElementById('demoTourCard');
    if (!card) {
        card = document.createElement('div');
        card.id = 'demoTourCard';
        document.body.appendChild(card);
    }

    card.innerHTML = `
        <div class="tour-tag">🎯 Крок ${idx+1} з ${total}</div>
        <div class="tour-title">${step.title}</div>
        <div class="tour-pitch">${step.pitch}</div>
        ${step.question ? `<div class="tour-question"><strong>💬 Питання клієнту:</strong>${step.question}</div>` : ''}
        <div class="tour-footer">
            <div class="tour-progress">${idx+1}/${total}</div>
            <div class="tour-progress-bar"><div class="tour-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="tour-btns">
            ${!isFirst ? `<button class="tour-btn-prev" onclick="tourPrev()">← Назад</button>` : ''}
            <button class="tour-btn-next" onclick="tourNext()">
                ${isLast ? 'Завершити ✓' : 'Далі →'}
            </button>
            <button class="tour-btn-skip" onclick="stopTour()" title="Зупинити тур">✕</button>
        </div>`;

    // Позиція картки відносно елементу
    _positionCard(card, el);
}

function _positionCard(card, el) {
    const cardW = 340;
    const cardH = 280; // орієнтовна висота
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left, top;

    if (!el) {
        left = (vw - cardW) / 2;
        top  = (vh - cardH) / 2;
    } else {
        const r = el.getBoundingClientRect();
        // Спробуємо знизу
        if (r.bottom + cardH + margin < vh) {
            top = r.bottom + margin;
        } else if (r.top - cardH - margin > 0) {
            top = r.top - cardH - margin;
        } else {
            top = margin;
        }
        // Горизонталь — по центру елемента, але в межах екрану
        left = r.left + (r.width - cardW) / 2;
        left = Math.max(margin, Math.min(left, vw - cardW - margin));
    }

    card.style.left = left + 'px';
    card.style.top  = top  + 'px';
    card.style.transform = 'none';
}

// ── Overlay для кліків поза карткою ───────────────────────
function _createOverlay() {
    document.getElementById('demoTourOverlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'demoTourOverlay';
    // Дозволяємо клікати крізь overlay
    overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);
}

// ── Публічний API ──────────────────────────────────────────
window._demoTour = {
    start:  window.startTour,
    stop:   window.stopTour,
    next:   window.tourNext,
    prev:   window.tourPrev,
    tours:  TOURS,
};

// ── Автозапуск кнопки після завантаження демо ─────────────
// Перевіряємо наявність демо даних і показуємо кнопку
function _checkAndShowButton() {
    const niche = window.currentCompanyData?.niche;
    if (niche && TOURS[niche]) {
        _injectStyles();
        _renderTourButton(niche);
    }
}

// Слухаємо подію завантаження даних компанії
window.addEventListener('companyDataLoaded', _checkAndShowButton);
// Також перевіряємо при старті (якщо дані вже є)
setTimeout(_checkAndShowButton, 2000);

// Після завантаження демо — показуємо кнопку і пропонуємо тур
const _origLoadFull = window.loadDemoDataFull;
if (_origLoadFull) {
    window.loadDemoDataFull = async function(nicheKey) {
        await _origLoadFull(nicheKey);
        if (TOURS[nicheKey]) {
            _injectStyles();
            _tourNiche = nicheKey;
            _clearStep(nicheKey);
            _renderTourButton(nicheKey);
            // Затримка і пропозиція запустити тур
            setTimeout(() => {
                if (typeof showToast === 'function') {
                    showToast('🎯 Демо готове! Натисніть «Тур» щоб провести клієнта по системі', 'success');
                }
            }, 1500);
        }
    };
}

})();
