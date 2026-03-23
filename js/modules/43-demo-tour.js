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
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Мій день — серце системи',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Кожен співробітник бачить свої завдання на сьогодні. Тарас (майстер) відкрив систему зранку і знає що робити — без вашого дзвінка і «що мені сьогодні робити?»',
        question: 'Як зараз ваші майстри дізнаються що їм робити кожен ранок?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI в завданнях — виконують з першого разу',
        selector: '#mydayContent',
        tab: 'myday',
        pitch: 'Завдання приходить у телефон: що зробити, до коли, який результат. Якщо незрозуміло — там же інструкція і AI який підкаже кроки. Забути або "не побачити" неможливо.<br><br>Але головне — перед тим як задача піде виконавцю, AI перевіряє: чи зрозуміло написано, чи вистачає деталей. Щоб людина не здогадувалась що мав на увазі власник — а просто виконувала.<br><br>AI не керує людьми. Він не дає людям ставити криві задачі.',
        question: 'Скільки часу у вас іде на пояснення завдань і відповіді на питання "а що ти мав на увазі?"',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Відхилені завдання — живий контроль',
        selector: '#mydayContent',
        tab: 'myday',
        pitch: 'Власник відхилив план закупівель — "Бюджет перевищений на 18 000 грн, скоротити позиції". Система зберігає причину і завдання повертається виконавцю. Ніяких усних розмов — все в системі.',
        question: 'Коли ви повертаєте роботу на доопрацювання — як ви пояснюєте причину зараз?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Завдання — повна картина',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: '22 завдання розподілені між 8 співробітниками. Кожне має: виконавця, функцію, дедлайн, очікуваний результат і час виконання. Власник бачить хто що робить без нарад.',
        question: 'Скільки зараз у вас активних завдань? Де вони фіксуються — в голові, в телефоні, в Excel?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Прострочені завдання',
        selector: '#tasksTab',
        tab: 'tasks',
        pitch: 'Одразу видно хто прострочив і на скільки. ТО верстатів не зроблено вже 1 день — ризик поломки під час виробництва. Система показує де виникає пожежа ДО того як вона вибухне.',
        question: 'Як ви зараз відстежуєте прострочені завдання? Хтось вам про це доповідає чи ви самі виявляєте?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процеси — стандарт виробництва',
        selector: '[onclick*="switchTab(\'processes\')"]',
        tab: 'processes',
        pitch: 'Замовлення кухні Ковалів зараз на кроці 4 з 9 — "Підписання договору". Кожен крок призначений конкретній людині. Якщо Ірина захворіє — хтось інший відкриває систему і бачить що робити далі.',
        question: 'Що відбувається з замовленням якщо ваш ключовий менеджер захворів?',
    },
    {
        title: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Процес — 9 кроків від заявки до монтажу',
        selector: '#processesTab',
        tab: 'processes',
        pitch: 'Від першого дзвінка клієнта до підписаного акту — 9 стандартних кроків. Замір, 3D-проєкт, договір, матеріали, виробництво, ВТК, монтаж. Новий співробітник на 3-й день вже знає весь цикл.',
        question: 'Скільки часу займає введення нового менеджера у ваш процес продажів?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.28 9.5 19.79 19.79 0 01.22 1.1 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.66-.66a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> CRM Todo — дзвінки на сьогодні',
        selector: '[onclick*="crm"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Ірина відкриває ранок і бачить: 4 клієнти яким треба зателефонувати сьогодні. Романова жде консультацію, Бондар просив передзвонити після 14:00. Ніхто не забутий, ніхто не "загубився".',
        question: 'Як зараз ваші менеджери пам\'ятають кому і коли треба передзвонити?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> CRM — воронка продажів',
        selector: '#crmTab',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: '14 угод у воронці на загальну суму 985 000 грн. Одразу видно де "затор" — 3 угоди застрягли на стадії "Проєктування" більше тижня. Ви бачите це одним поглядом, а не питаєте менеджера.',
        question: 'Скільки зараз угод у вашій воронці? Ви можете назвати суму прямо зараз?',
    },
    {
        title: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналітика — 12 тижнів динаміки',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: 'Виручка росте: 63 000 → 72 000 грн/тиждень за 3 місяці (+14%). Конверсія 38% — нижче цілі 45%. Одразу видно де проблема і де ріст. Це не Excel звіт який готують 2 дні — дані оновлюються в реальному часі.',
        question: 'Скільки часу у вас іде на підготовку тижневого звіту по продажах?',
    },
    {
        title: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цілі і факт',
        selector: '#statisticsContainer',
        tab: 'statistics',
        pitch: 'Зеленим — досягаємо цілі. Червоним — відстаємо. Конверсія 38% при цілі 45% — червона. Власник бачить це без нарад і питань. Менеджер сам бачить де він відстає від плану.',
        question: 'Ваші менеджери знають свої KPI? Вони самі відстежують досягнення цілей?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 8 функцій бізнесу',
        selector: '[onclick*="switchTab(\'system\')"], [onclick*="\'system\'"]',
        tab: 'system',
        pitch: 'Весь бізнес розбитий на 8 функцій: від залучення клієнтів до управління. Кожна функція має власника, завдання і KPI. Ви бачите структуру бізнесу як карту — де є провали, де все під контролем.',
        question: 'Якщо я попрошу вас намалювати структуру вашого бізнесу прямо зараз — скільки хвилин це займе?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Команда — навантаження кожного',
        selector: '#sysTeamTab, [onclick*="system"]',
        tab: 'system',
        pitch: 'Тарас завантажений на 87% — норма. Катерина має 1 прострочене завдання. Ірина виконує 100% вчасно. Ви бачите хто перевантажений, хто недозавантажений — без нарад і особистих питань.',
        question: 'Як ви розумієте що конкретний співробітник перевантажений — коли він вам про це скаже?',
    },
    {
        title: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a2.5 2.5 0 010 5H9v2h6"/></svg> Фінанси — повний контур',
        selector: '[onclick*="finance"]',
        tab: 'finance',
        lazyGroup: 'finance',
        pitch: 'Доходи, витрати, прибуток у реальному часі. 287 500 грн виручки, 58 400 грн чистого прибутку, маржа 31.2%. 3 рахунки, 27 транзакцій за 3 місяці. Бухгалтер більше не носить папери — все в системі.',
        question: 'Ви зараз знаєте свій чистий прибуток за минулий місяць? За скільки часу ви це дізнаєтесь?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Регулярні платежі — нічого не забуто',
        selector: '#financeTab',
        tab: 'finance',
        pitch: '9 регулярних платежів автоматично нагадують коли і скільки сплатити. Оренда 18 000 грн — 1-го числа. Зарплата Тараса 28 000 — 25-го. Ви не пропустите жодного платежу.',
        question: 'Чи бувало що ви забули вчасно сплатити рахунок або зарплату?',
    },
    {
        title: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Фінансове планування',
        selector: '#financeTab',
        tab: 'finance',
        pitch: 'Ціль на березень — 320 000 грн. Факт — 287 500. Відставання 32 500 грн — видно одразу. Ви плануєте квітень з урахуванням березневих результатів. Фінансова дисципліна без бухгалтера який "порахує колись".',
        question: 'У вас є фінансовий план на наступний місяць? На папері, в Excel чи в голові?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Склад — матеріали під контролем',
        selector: '[onclick*="warehouse"]',
        tab: 'warehouse',
        lazyGroup: 'warehouse',
        pitch: 'Клей ПВА — 2 каністри, мінімум 3. Система автоматично показує "Потребує замовлення". Виробництво ніколи не зупиниться через відсутність матеріалу — система попередить заздалегідь.',
        question: 'Чи зупинялось у вас виробництво через те що закінчились матеріали?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Склад — переміщення і інвентаризація',
        selector: '#warehouseTab',
        tab: 'warehouse',
        pitch: 'Зразки фасадів переміщені з цеху в шоурум — операція зафіксована. Щомісячна інвентаризація показала відхилення -2 листи ЛДСП. Ви знаєте де кожна одиниця матеріалу. Склад більше не "чорна діра".',
        question: 'Як часто у вас проводиться інвентаризація? Ви знаєте фактичні залишки зараз?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Постачальники — вся база в системі',
        selector: '#warehouseTab',
        tab: 'warehouse',
        pitch: 'Кромтех, Blum Ukraine, ПВХ-Декор, МеталПроф, Hafele — контакти, умови, нотатки по кожному. Новий закупівельник відкриває систему і знає де і що замовляти без питань до власника.',
        question: 'Якщо ваш закупівельник звільниться завтра — де знаходяться контакти постачальників?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg> Кошторис — рахуємо точно',
        selector: '[onclick*="estimate"]',
        tab: 'estimate',
        lazyGroup: 'estimate',
        pitch: 'Кухня Ковалів — 11 позицій матеріалів + робота = 87 500 грн. Менеджер вводить розміри кухні — система автоматично рахує потребу в матеріалах по нормах. Більше ніяких "на oko" і втрат маржі.',
        question: 'Як зараз ваші менеджери рахують кошторис клієнту — на калькуляторі, в Excel?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Бронювання — онлайн запис на замір',
        selector: '[onclick*="booking"]',
        tab: 'booking',
        lazyGroup: 'booking',
        pitch: 'Клієнт заходить на сайт і сам обирає зручний час для виїзного заміру. 6 записів на цьому тижні вже є. Менеджер не витрачає час на "а коли вам зручно" — система робить це автоматично.',
        question: 'Скільки часу ваш менеджер витрачає на узгодження часу виїзду до клієнта?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Координації — наради з результатом',
        selector: '[onclick*="coordination"]',
        tab: 'coordination',
        lazyGroup: 'coordination',
        pitch: '4 регулярних наради: щоденний стенд-ап цеху 08:00, тижнева нарада виробництво+продажі, рада власника щоп\'ятниці. Кожна нарада має порядок денний, рішення фіксуються. Наради більше не "поговорили і розійшлись".',
        question: 'Ваші наради мають зафіксований результат? Або через тиждень ніхто не пам\'ятає що вирішили?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI Асистент — знає ваш бізнес',
        selector: '#aiAssistantBtn, [onclick*="openAiChat"]',
        tab: null,
        pitch: 'AI знає що МеблеМайстер виробляє меблі на замовлення, що ціль — 320 000 грн/міс, що конверсія відстає від плану. Ви питаєте "що не так з продажами цього місяця" — AI дає відповідь на основі ваших реальних даних.',
        question: 'Уявіть що у вас є аналітик який завжди знає всі цифри і може відповісти на будь-яке питання за 10 секунд.',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобільна версія',
        selector: null,
        tab: null,
        pitch: 'Власник перевіряє показники з телефону о 7 ранку. Майстер закриває завдання на об\'єкті. Менеджер переглядає угоди між зустрічами. Система працює однаково добре на телефоні і компютері.',
        question: 'Де ви зазвичай перевіряєте стан бізнесу — за комп\'ютером чи з телефону?',
    },
    {
        title: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg> Що далі — система на автопілоті',
        selector: null,
        tab: null,
        isLast: true,
        pitch: 'За 65 днів впровадження бізнес переходить на автопілот: кожен знає що робити, власник бачить картину в реальному часі, жодне завдання не загублено, жоден клієнт не забутий. Це не програма — це система управління бізнесом.',
        question: 'Як виглядає ваш бізнес через рік якщо кожен день є така картина?',
    },
],

construction_eu: [
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Мій день — прораб знає план',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Олег (прораб) відкрив систему о 8:00 і бачить: виїзд на Клименко о 9:00, огляд якості Бойко о 14:00, виплата бригаді о 17:00. Без дзвінка від власника. Без "що мені сьогодні робити?"',
        question: 'Як зараз ваші прораби дізнаються що їм робити на кожному об\'єкті кожного ранку?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI в завданнях — виконують з першого разу',
        selector: '#mydayContent',
        tab: 'myday',
        pitch: 'Завдання приходить у телефон: що зробити, до коли, який результат. Якщо незрозуміло — там же інструкція і AI який підкаже кроки. Забути або "не побачити" неможливо.<br><br>Перед тим як задача піде прорабу, AI перевіряє: чи зрозуміло написано, чи вистачає деталей. Щоб людина не здогадувалась — а просто виконувала.<br><br>AI не керує людьми. Він просто не дає ставити криві задачі.',
        question: 'Скільки часу у вас іде на пояснення завдань і відповіді на питання "а що ти мав на увазі?"',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Відхилені — кошторис повернено',
        selector: '#mydayContent',
        tab: 'myday',
        pitch: 'Власник відхилив кошторис Ковалів — "Занижена вартість робіт на 15%, переглянути норми". Система зберігає причину, завдання повертається Дмитру. Ніяких дзвінків і перепитувань — все письмово в системі.',
        question: 'Коли ви повертаєте роботу на доопрацювання — як ви пояснюєте причину зараз?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Завдання — 4 об\'єкти паралельно',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: '25 завдань між 12 виконавцями. Бойко, FinTech, Петренки, Сидоренки — 4 об\'єкти одночасно. Кожне завдання має виконавця, об\'єкт, дедлайн і очікуваний результат. Власник бачить всю картину без дзвінків прорабам.',
        question: 'Скільки зараз у вас активних об\'єктів? Ви можете сказати статус кожного прямо зараз?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Прострочені — акт не підписаний 3 дні',
        selector: '#tasksTab',
        tab: 'tasks',
        pitch: 'Акт виконаних робіт Тарасенків прострочений 3 дні. Фото для портфоліо — 5 днів. Система показує це одразу — без того щоб власник сам виявив або чекав поки хтось скаже.',
        question: 'Як ви зараз дізнаєтесь що щось прострочено? Вам хтось доповідає чи ви самі помічаєте?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процеси — ремонт без стресу',
        selector: '[onclick*="switchTab(\'processes\')"]',
        tab: 'processes',
        pitch: 'Квартира Бойко — крок 9 з 12 (чистові роботи). Офіс FinTech — крок 5 з 9 (монтажні). Кожен крок призначений конкретній людині. Якщо прораб захворів — хтось інший відкриває систему і бачить що робити далі.',
        question: 'Що відбувається з об\'єктом якщо ваш прораб раптово захворів?',
    },
    {
        title: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Ремонт під ключ — 12 кроків',
        selector: '#processesTab',
        tab: 'processes',
        pitch: 'Замір → КП → Договір → Аванс → Демонтаж → Чорнові роботи → Комунікації → Стяжка → Стіни → Чистові → Прибирання → Здача. Новий прораб на 2-й день знає весь процес. Клієнт бачить на якому кроці його об\'єкт.',
        question: 'Скільки часу займає введення нового прораба у ваш процес ведення об\'єкту?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.28 9.5 19.79 19.79 0 01.22 1.1 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.66-.66a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> CRM Todo — дзвінки на сьогодні',
        selector: '[onclick*="crm"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Наталія відкриває ранок і бачить: 4 клієнти яким треба зателефонувати сьогодні. Ковалі чекають замір, Данченко — нарада о 15:00, Борисенко — новий лід по рекомендації. Ніхто не загубиться.',
        question: 'Як зараз ваш менеджер пам\'ятає кому і коли треба передзвонити?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> CRM — воронка ремонтів',
        selector: '#crmTab',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: '14 угод у воронці: Бойко 245К, FinTech 580К, Петренко 520К — 3 великих об\'єкти в роботі. Одразу видно де "затор" і що потребує уваги. Загальна сума по всіх стадіях — 3,1 млн грн.',
        question: 'Скільки зараз грошей "в трубі" у вашого менеджера? Ви знаєте цю цифру прямо зараз?',
    },
    {
        title: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналітика — контроль без нарад',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: '15 щотижневих і 34 щомісячних метрики. Об\'єктів зданих вчасно — 87% при цілі 90%. Відсоток рекламацій — 4.2%. Власник бачить де проблема без дзвінків і нарад — дані оновлюються в реальному часі.',
        question: 'Скільки часу у вас іде на збір інформації по всіх об\'єктах за тиждень?',
    },
    {
        title: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цілі і факт по об\'єктах',
        selector: '#statisticsContainer',
        tab: 'statistics',
        pitch: 'Зеленим — досягаємо. Червоним — відстаємо. NPS 72 при цілі 75 — жовтий. Конверсія 38% при цілі 42% — червоний. Власник бачить це щодня без звітів від менеджерів.',
        question: 'Ваші прораби і менеджер знають свої KPI? Вони самі відстежують де відстають?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 8 функцій ремонтного бізнесу',
        selector: '[onclick*="switchTab(\'system\')"]',
        tab: 'system',
        pitch: 'Маркетинг → Продажі → Проєктування → Виконання → Постачання → Фінанси → Якість → Управління. Кожна функція має власника, завдання і KPI. Ви бачите де є провал і хто за це відповідає.',
        question: 'Якщо я попрошу вас намалювати структуру вашого бізнесу прямо зараз — скільки хвилин це займе?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Команда — навантаження 12 осіб',
        selector: '#sysTeamTab, [onclick*="system"]',
        tab: 'system',
        pitch: 'Олег — 4 об\'єкти, 6 завдань сьогодні. Максим — 3 закупівлі на цьому тижні. Василь — 2 об\'єкти по електриці. Хто перевантажений, хто недозавантажений — видно одразу без особистих питань.',
        question: 'Як ви розумієте що конкретний прораб або майстер перевантажений?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Фінанси — 3 об\'єкти, 3 рахунки',
        selector: '[onclick*="finance"]',
        tab: 'finance',
        lazyGroup: 'finance',
        pitch: 'Приватбанк 485К, Каса 85К, Картка 32К — всього 602 000 грн. Аванс від Бойко, FinTech, Петренко отримані. Витрати прив\'язані до об\'єктів — видно маржу по кожному. Все без бухгалтера з папками.',
        question: 'Ви зараз знаєте маржу по кожному активному об\'єкту? За скільки часу ви це дізнаєтесь?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Регулярні платежі — 8 авто-нагадувань',
        selector: '#financeTab',
        tab: 'finance',
        pitch: '8 регулярних платежів: оренда складу 12К, зарплата офісу 60К, реклама 8К — система нагадує коли і скільки сплатити. Оксана не тримає це в голові і не пропускає жодного платежу.',
        question: 'Чи бувало що ви забули вчасно сплатити рахунок, зарплату або оренду?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Склад — матеріали без зупинок',
        selector: '[onclick*="warehouse"]',
        tab: 'warehouse',
        lazyGroup: 'warehouse',
        pitch: 'Затирка — 8 кг, мінімум 10. Плитковий клей — 10 мішків, мінімум 12. Система автоматично показує що треба замовити. Виробництво не зупиниться через брак матеріалу — Максим бачить це заздалегідь.',
        question: 'Чи зупинявся у вас об\'єкт через те що закінчились матеріали?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg> Кошторис — рахуємо до копійки',
        selector: '[onclick*="estimate"]',
        tab: 'estimate',
        lazyGroup: 'estimate',
        pitch: 'Квартира Бойко 65м² — 5 видів робіт, кошторис автоматично: штукатурення стін 165м² + плитка 18м² + ГКЛ 35м² + стяжка 65м² + електромонтаж = 205 500 грн. Дмитро вводить площу — система рахує сама.',
        question: 'Як зараз ваші кошторисники рахують об\'єкт клієнту — на калькуляторі, в Excel?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Бронювання — клієнт сам записується на замір',
        selector: '[onclick*="booking"]',
        tab: 'booking',
        lazyGroup: 'booking',
        pitch: 'Клієнт заходить на сайт і сам обирає зручний час. 6 записів на цьому тижні вже є. Наталія не витрачає час на "а коли вам зручно" — система робить це замість неї.',
        question: 'Скільки часу ваш менеджер витрачає на погодження часу виїзду до клієнта?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Координації — стенд-ап о 8:00',
        selector: '[onclick*="coordination"]',
        tab: 'coordination',
        lazyGroup: 'coordination',
        pitch: '4 регулярних наради: щоденний стенд-ап прорабів 08:00 (10 хв), тижнева нарада, оперативка постачання, звіт власнику. Протокол з рішеннями — через тиждень видно хто що виконав.',
        question: 'Ваші наради мають зафіксований результат? Або через тиждень ніхто не пам\'ятає що вирішили?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI Асистент — знає ваш бізнес',
        selector: '#aiAssistantBtn, [onclick*="openAiChat"]',
        tab: null,
        pitch: 'AI знає що БудМайстер робить ремонти під ключ, що ціль — 520К/міс, що NPS зараз 72 при цілі 75. Питаєте "чому затримується об\'єкт Петренків" — AI дивиться на дані і дає конкретну відповідь.',
        question: 'Уявіть що у вас є аналітик який завжди знає стан кожного об\'єкту і відповідає за 10 секунд.',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобільна версія — контроль з телефону',
        selector: null,
        tab: null,
        pitch: 'Ігор перевіряє стан об\'єктів о 7 ранку з телефону. Олег закриває завдання прямо на об\'єкті. Наталія переглядає угоди між зустрічами. Система працює однаково на телефоні і комп\'ютері.',
        question: 'Де ви зараз перевіряєте стан бізнесу і об\'єктів — за комп\'ютером чи з телефону?',
    },
    {
        title: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg> Ремонт без стресу — система на автопілоті',
        selector: null,
        tab: null,
        isLast: true,
        pitch: 'За 65 днів впровадження: кожен прораб знає свій план, кожен об\'єкт ведеться по стандарту, клієнт бачить що відбувається кожного дня. Власник контролює метрики — не гасить пожежі. Ремонт без стресу — для клієнта і для вас.',
        question: 'Як виглядає ваш бізнес через рік якщо кожен об\'єкт ведеться саме так?',
    },
],

autoservice: [
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мій день — кожен майстер знає черговість',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: 'Олексій (механік) відкрив систему о 8:30:<br><br>• <b>09:00</b> — Mazda CX-5 Іванченка: масло Castrol 5W-30 + свічки NGK (90 хв)<br>• <b>11:30</b> — BMW X5 Бойка: повна діагностика підвіски (120 хв)<br>• <b>14:00</b> — Toyota Camry Ковальської: гальма — колодки TRW + диски Brembo (120 хв)<br>• <b>16:30</b> — Ford Focus Марченка: шиномонтаж 4 колеса (45 хв)<br><br>Сергій і Василь бачать <i>свою</i> чергу. Якщо Олексій захворів — Андрій відкриває систему і бачить перерозподілену чергу.',
        question: 'Як ваші майстри дізнаються черговість авто і що саме робити? Дзвінок? WhatsApp? Дошка?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> Картки авто — повна історія без паперів',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Mazda CX-5, <b>AA1234BC</b>, VIN: JMZKE1W2500123456, 2019 р.в., пробіг <b>85 420 км</b>. Іванченко Михайло.<br><br>Історія:<br>• 15.03 — масло Castrol + фільтри (1 820 грн)<br>• 21.06 — повітряний фільтр (820 грн)<br>• Сьогодні — масло + свічки (поточний наряд)<br><br>Майстер бачить все до того як клієнт відкрив рот. "Вони пам'ятають моє авто" — саме це утримує клієнта.',
        question: 'Де зберігається інформація по авто? Якщо клієнт каже "я був рік тому" — знайдете що робили?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> Замовлення-наряд — роботи і запчастини в одному документі',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Наряд <b>WO-2026-0007</b>, Toyota Camry, Олексій.<br><br>Роботи: колодки передні 600 грн, диски передні 800 грн, балансування 280 грн.<br>Запчастини зі складу: TRW колодки 720 грн, Brembo диски ×2 шт 2 700 грн, DOT4 95 грн.<br><br><b>Разом: 5 195 грн.</b><br><br>Клієнт підписує → склад списується автоматично → оплата у фінанси. Нічого вручну.',
        question: 'Як ведете облік по наряду: що зроблено, які запчастини, скільки? Один документ чи кілька?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Склад запчастин — знаєте залишки до ремонту, не під час',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: '✅ Масло 5W-30 — 22 шт (мін. 8)<br>✅ Фільтри MANN — 35 шт (мін. 15)<br>✅ Колодки TRW — 14 компл. (мін. 5)<br>⚠️ <b>Диски Brembo 280мм — 2 шт (мін. 4) — НИЖЧЕ МІНІМУМУ</b><br>✅ Свічки NGK — 28 компл. (мін. 10)<br><br>Система сповістила Ірину вчора о 18:00. Вона замовила сьогодні. Диски будуть до обіду.<br><br>Без системи: клієнт приїхав, майстер підняв авто — дисків нема.',
        question: 'Скільки разів за місяць клієнт чекав ремонту бо не було запчастини?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Постачальники — вся база в системі',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: 'AutoParts Pro — масла/фільтри/гальма, доставка 1 день, знижка 12%.<br>MotoZip — Toyota/Mazda, ціни -8%, доставка 2 дні.<br>BremboUkraine — диски і колодки, оплата 14 днів.<br>NGK Офіційний — свічки, датчики, 2 дні.<br><br>Умови, контакти, терміни — в системі. Новий майстер не питає власника "де замовляти?".',
        question: 'Якщо майстер по закупівлях захворіє — де контакти постачальників і умови?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.28 9.5 19.79 19.79 0 01.22 1.1 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.66-.66a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> CRM Todo — дзвінки по ТО сьогодні',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Ірина відкрила ранок:<br><br>📞 <b>Ткаченко Юлія</b> — 120 днів, Hyundai Tucson ~114 000 км. Нагадати про масло і антифриз<br>📞 <b>Марченко Василь</b> — Ford Focus, 6 міс після гальм. Все ok?<br>📞 <b>Кравченко Юрій</b> — Mercedes C200, запит на капремонт 60 днів тому. Рішення? (24 000 грн)<br><br>Клієнти самі не повернуться. Ірина дзвонить — 30-40% записуються.',
        question: 'Як відстежуєте клієнтів яким скоро треба ТО? Хтось їм нагадує?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> CRM — воронка продажів',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Воронка: <b>8 угод на 61 120 грн</b><br><br>Новий: Гриценко (ГРМ Skoda, 2 800 грн), Кравченко (капремонт Mercedes, 24 000 грн).<br>На консультації: Бойко (BMW X5, 8 400 грн).<br>В роботі: Іванченко, Ковальська, Шевченко.<br>Готово: Ткаченко (шиномонтаж, 960 грн).<br><br>Кравченко чекає 3 дні — треба передзвонити сьогодні.',
        question: 'Скільки угод у воронці? Можете назвати загальну суму прямо зараз?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109 9"/><polyline points="3 3 3 12 12 12"/></svg> Win-back — клієнти що пропали повертаються',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: '60+ днів → задача: зателефонувати, нагадати про плановий огляд.<br>90+ днів → SMS: "Давно не бачились. Акція на ТО — 10% знижка".<br><br>Ткаченко Юлія: 120 днів, ~114 000 км — пора міняти антифриз.<br>Олійник Сергій: 45 днів — Renault Duster після діагностики.<br><br>65% клієнтів що отримали нагадування — повертаються.',
        question: 'Скільки клієнтів пішло і не повернулось після першого візиту? Скільки це грошей щомісяця?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 014.5 8A2.5 2.5 0 012 10.5v3A2.5 2.5 0 014.5 16A2.5 2.5 0 017 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16A2.5 2.5 0 0117 13.5v-3A2.5 2.5 0 0014.5 8A2.5 2.5 0 0112 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI в завданнях — майстер виконує з першого разу',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: 'Задача: "Замінити масло на Mazda CX-5 Іванченка".<br><br>AI перевіряє: вказаний артикул масла? Свічки теж? Перевірити охолоджуючу рідину?<br><br>Якщо нечітко — AI повертає з коментарем. Майстер виконує — не здогадується.<br><br>Результат: 0 уточнюючих дзвінків. Майстер = виконавча машина.',
        question: 'Скільки часу іде на пояснення задач і відповіді "а що ти мав на увазі"?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Відхилені завдання — причина зафіксована',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: 'Власник відхилив кошторис: "Диски Brembo завищені на 18%. Замовити у MotoZip — 2 700 грн замість 3 200."<br><br>Причина збережена. Задача повертається Ірині. Ніяких усних розмов.<br><br>Через 2 дні: новий кошторис з дисками від MotoZip. Власник бачить результат.',
        question: 'Коли повертаєте роботу на доопрацювання — як пояснюєте причину?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Завдання — повна картина по СТО',
        selector: '[onclick*=\'tasks\']',
        tab: 'tasks',
        pitch: '14 завдань між 7 співробітниками:<br><br>🔴 Прострочені (2): Mercedes Кравченко 3 дні, Google Business фото 5 днів.<br>🟡 Сьогодні (8): наряди по черзі, замовити диски, звіт виручки.<br>🟢 Тиждень (4): BMW діагностика, атестація Андрія.<br><br>Власник бачить хто що робить без нарад.',
        question: 'Скільки активних завдань? Де фіксуються — в голові, телефоні, Excel?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Прострочені — де горить прямо зараз',
        selector: '[onclick*=\'tasks\']',
        tab: 'tasks',
        pitch: '⚠️ <b>Mercedes C200 Кравченко</b> — капремонт 24 000 грн, не передзвонили 3 дні. Кожен день = ризик що піде до конкурента.<br><br>⚠️ <b>Google Business</b> — оновлення фото 2 місяці тому. Конкурент оновлює щотижня.<br><br>Власник бачить ці ризики одразу.',
        question: 'Як відстежуєте прострочені задачі? Хтось доповідає або самі виявляєте?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процес — стандарт обслуговування авто (8 кроків)',
        selector: '[onclick*=\'processes\']',
        tab: 'processes',
        pitch: '1. Запис (Ірина, 15 хв) — марка, рік, пробіг, скарга<br>2. Прийом + огляд (20 хв) — фіксація пошкоджень<br>3. Діагностика + наряд + узгодження (40 хв)<br>4. Замовлення запчастин якщо немає (20 хв)<br>5. Виконання робіт (60-240 хв)<br>6. Контроль якості + тест-драйв (30 хв)<br>7. Видача + оплата (20 хв)<br>8. Зворотній зв'язок через 3 дні — відгук на Google (10 хв)<br><br>Олексій захворів → Андрій відкриває систему і знає що робити.',
        question: 'Що відбувається якщо ваш ключовий майстер захворів? Стандарт записаний чи тільки в голові?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процес — закупівля запчастин (5 кроків)',
        selector: '[onclick*=\'processes\']',
        tab: 'processes',
        pitch: '1. Виявлення потреби — склад нижче мінімуму (авто-сповіщення)<br>2. Формування замовлення — список, постачальник, ціни<br>3. Відправка + підтвердження дати<br>4. Прийом + перевірка + оприбуткування<br>5. Оплата + документи<br><br>Новий закупник на 3-й день знає весь процес. Власник не відповідає на питання.',
        question: 'Якщо закупник піде у відпустку — хто і як буде замовляти запчастини?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналітика — 12 тижнів динаміки',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: '📈 Виручка: 28 400 → 34 800 грн/тиждень (+23%)<br>📈 Нарядів: 18 → 24/тиждень (+33%)<br>📈 Середній чек: 1 240 → 1 520 грн (+22%)<br>📈 Завантаженість: 62% → 82%<br>🔴 Повернення клієнтів: 58% (ціль 60%) — відстаємо<br><br>Чому відстає? Два клієнти не отримали дзвінок після ремонту. Власник бачить причину — не просто цифру.',
        question: 'Скільки часу займає підготовка тижневого звіту?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цілі і факт по кожному показнику',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: '🟢 Виручка 34 800 — ціль 35 000<br>🟢 Середній чек 1 520 — ціль 1 400 (перевиконано)<br>🔴 Повернення клієнтів 58% — ціль 60%<br>🟢 Завантаженість 82% — ціль 80%<br>🔴 Google рейтинг 4.4 — ціль 4.6<br><br>Майстер бачить свою завантаженість. Власник бачить де бізнес відстає — без нарад.',
        question: 'Ваші майстри знають свої KPI? Самі відстежують де відстають?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 8 функцій вашого СТО',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: '0. Маркетинг (Ірина) — реклама, Google, залучення<br>1. Продажі та запис (Ірина) — дзвінки, консультації<br>2. Прийом та діагностика (Олексій) — приймання авто<br>3. Ремонт та ТО (Олексій, Сергій, Василь) — роботи<br>4. Склад та закупівлі (Ірина) — запчастини<br>5. Фінанси (Олена) — P&L, зарплата<br>6. Команда (Ірина) — графік, навчання<br>7. Управління (власник) — стратегія<br><br>Кожна функція: власник + задачі + KPI.',
        question: 'Намалювати структуру СТО прямо зараз — скільки хвилин це займе?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Команда — завантаженість кожного майстра',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: '🔴 Олексій — 4 наряди, 7.5 год. Перевантажений.<br>🟢 Сергій — 2 наряди, 4 год. Може взяти ще авто.<br>🟡 Василь — 3 шиномонтажі, 5 год. Норма.<br>🟢 Андрій — 1 наряд, 2 год. Вільний → направити Кравченка.<br><br>Власник бачить без питань. Олексій не перегоряє. Андрій не сидить без роботи.',
        question: 'Як розумієте що майстер перевантажений — коли він сам скаже?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Фінанси — прибуток без Excel і бухгалтера',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'Квітень:<br>💰 Виручка: 145 000 грн<br>🔩 Запчастини: 48 000 грн<br>👷 Зарплата: 28 000 грн<br>🏢 Оренда: 18 000 грн<br>📱 Реклама: 3 200 грн<br>⚡ Комунальні: 4 800 грн<br><br><b>Прибуток: 43 000 грн (29.7%)</b><br><br>Кожна оплата наряду → автоматично у фінанси. P&L вранці з телефону.',
        question: 'Знаєте чистий прибуток за минулий місяць? За скільки часу дізнаєтесь?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Регулярні платежі — нічого не забуто',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: '8 регулярних платежів:<br>• 1-го — оренда 3 боксів 18 000 грн<br>• 25-го — зарплата Олексія 14 000 грн<br>• 25-го — зарплата Сергія 12 000 грн<br>• 5-го — Google Ads 1 500 грн<br>• 15-го — AutoParts Pro за замовлення<br>• 25-го — ПЗ і CRM 2 400 грн<br><br>Олена не тримає в голові — не пропускає.',
        question: 'Бувало що забули оплатити оренду, зарплату або рахунок постачальника?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Фінансове планування',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'Ціль квітня — 150 000 грн. Факт — 145 000 грн. Відставання 5 000 грн.<br><br>Причина: тиждень 3 — менше записів (дощі). Рішення: SMS-розсилка "Весняне ТО — 10% знижка".<br><br>Травень: ціль 160 000 грн. Фокус — ТО-наряди з 40% до 55% (прибутковіші).',
        question: 'Є фінансовий план на наступний місяць? На папері, в Excel чи в голові?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Координації — наради з результатом',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: '• <b>Щоранку 8:30</b> — стенд-ап майстрів (10 хв): черговість, запити запчастин<br>• <b>Щопонеділка 9:00</b> — планування тижня: записи, завантаженість<br>• <b>Щоп'ятниці 17:00</b> — звіт власнику: виручка, прострочені, рішення<br><br>Кожна нарада — порядок денний і протокол. Через тиждень видно хто що виконав.',
        question: 'Ваші наради мають зафіксований результат? Або через тиждень ніхто не пам'ятає що вирішили?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 014.5 8A2.5 2.5 0 012 10.5v3A2.5 2.5 0 014.5 16A2.5 2.5 0 017 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16A2.5 2.5 0 0117 13.5v-3A2.5 2.5 0 0014.5 8A2.5 2.5 0 0112 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI Асистент — знає ваш СТО',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: 'AI знає: 6 майстрів, 3 підйомники, ціль 160 000 грн/міс, завантаженість 85%+.<br><br>Ви: <i>"Чому тиждень слабший?"</i><br>AI: <i>"Середа і четвер — 4 наряди замість 7 через відсутність дисків Brembo. Ірина не замовила вчасно. Рекомендую мінімум підняти з 2 до 6 шт — покриє 2 тижні роботи."</i>',
        question: 'Уявіть аналітика що знає всі цифри і відповідає за 10 секунд. Яке перше питання?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобільна версія — контроль з телефону',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: 'Власник о 7:30:<br>• Виручка вчора: 9 240 грн ✅<br>• Прострочених: 2 ⚠️ (Mercedes, Google Business)<br>• Завантаженість: 82%<br>• Записів на завтра: 8<br><br>Олексій у ямі — закриває наряд з телефону. Ірина у відпустці — відповідає клієнтам.',
        question: 'Де перевіряєте стан бізнесу — за комп'ютером або з телефону?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg> АвтоМайстер на автопілоті — через 65 днів',
        selector: '#mydayTab, [onclick*=\'myday\']',
        tab: 'myday',
        pitch: '✅ Кожен майстер знає чергу без дзвінків<br>✅ Запчастини замовляються до того як закінчились<br>✅ Ткаченко, Марченко, Олійник отримали нагадування і повернулись<br>✅ Кравченко записав Mercedes на капремонт (24 000 грн)<br>✅ Google рейтинг 4.6 — відгук після кожного наряду<br>✅ P&L вранці з телефону<br><br><b>Виручка: 145 000 → 290 000 грн/місяць за рік.</b><br>Математика: завантаженість 82→90% + середній чек 1 520→1 900 грн.',
        question: 'Як виглядає ваш СТО через рік? Що змінюється особисто для вас?',
    }
],

horeca: [
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мій день — кухня і зал не конфліктують',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Іван (шеф-кухар) відкрив систему о 7:30: заготовити 30 порцій борщу до 11:00, зварити 5 кг картопляного пюре до 12:00, прийняти постачальника о 9:00. Тетяна (офіціант) бачить: сервірування залу до 10:30, обслуговування банкету за столом 5 о 13:00. Аліна (касир) знає: відкрити зміну о 9:00, каса на початок 500 грн. Кожен знає що робити — без ранкової планерки.',
        question: 'Як зараз ваша команда дізнається завдання на зміну? Скільки часу займає ранкова планерка і чи завжди всі на ній присутні?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg> Зміна — відкрили, відпрацювали, закрили без розбіжностей',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Аліна відкрила зміну о 9:00, каса на початок: 500 грн. За день: 22 чеки. Виручка: готівка 3 200 грн + термінал 2 100 грн = 5 300 грн. Середній чек: 241 грн. Закрила зміну о 21:30, каса на кінець: 3 700 грн (500 + 3 200 готівкою). Власник бачить підсумок в телефоні — без дзвінка "скільки зробили сьогодні?".',
        question: 'Скільки часу займає закриття зміни і підрахунок виручки? Бували розбіжності між тим що в касі і тим що реально?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/><line x1="12" y1="16" x2="8" y2="16"/></svg> Меню в системі — чек за 10 секунд',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Стіл 3 замовив: борщ з пампушками (85 грн) + котлета по-київськи (145 грн) + капучино 300 мл (75 грн) + пюре (45 грн). Аліна обрала позиції з меню — разом 350 грн — натиснула "Провести". Клієнт платить карткою — термінал, готово. Весь чек: 10 секунд. Жодного "зачекайте поки я порахую".',
        question: 'Як зараз відбувається розрахунок з клієнтом? Скільки часу займає і бувало що помилялись в сумі?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Склад продуктів — замовляєте до того як закінчилось',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: 'Борошно пшеничне: є 48 кг, мінімум 20 кг — все добре. М\'ясо свинина: є 28 кг, мінімум 15 кг — ок. Молоко: є 95 л, мінімум 30 л — добре. Капуста: є 12 кг, мінімум 20 кг — НИЖЧЕ МІНІМУМУ, сповіщення надіслано. Кухар бачить попередження і каже адміністратору замовити сьогодні. Завтра є чим готувати борщ.',
        question: 'Скільки разів за місяць кухар приходить зранку і каже "не з чого готувати — не замовили вчасно"?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> Постійні гості — знаєте їх і вони відчувають це',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        pitch: 'Марина: 12 відвідувань за місяць, середній чек 285 грн. Програма лояльності: накопичено 340 балів з 500 — наступне замовлення з кавою безкоштовно. Ігор: не приходив 18 днів після останнього візиту — система поставила задачу "відправити SMS: Скучали за вами, приходьте — кава у подарунок". Марина повертається бо відчуває що її пам\'ятають. Ігор повертається бо отримав нагадування.',
        question: 'Як відрізняєте постійних гостей від випадкових? Хто і як їх утримує коли вони "пропадають"?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінанси — власник бачить прибуток без дзвінків',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'Вчора (вівторок): виручка 5 300 грн, продукти (собівартість) 1 590 грн, зарплата персоналу 1 200 грн, оренда (денна частка) 600 грн, комунальні 180 грн. Прибуток дня: 1 730 грн. Порівняння з минулим вівторком: +340 грн (+24%). Власник відкриває телефон о 8:00 — вже бачить цю картину. Без дзвінка адміністратору і без Excel.',
        question: 'Як зараз дізнаєтесь скільки реально заробили за вчора? І скільки часу це займає?',
    },
],

logistics: [
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мій день — диспетчер не "тримає все в голові"',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Олена (диспетчер) відкрила систему о 7:00: Микола — рейс Київ→Львів, виїзд о 8:00, вантаж будматеріали 8т, клієнт ТОВ БудМайстер; Сергій — Харків→Одеса, виїзд о 9:00, зернові 20т, ТОВ АгроТрейд; Андрій — очікує завантаження в Дніпрі, повернення сьогодні. Кожен водій відкриває систему і бачить свій маршрут, адресу, контакт клієнта. Без 8 дзвінків зранку.',
        question: 'Скільки дзвінків між диспетчером і водіями відбувається до 10:00 ранку? І що відбувається якщо диспетчер захворів?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Рейс — тариф, витрати, прибуток в одному документі',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Рейс RTE-2026-0001, Київ→Львів, вантаж: будматеріали 8т/24м³, водій Микола, авто AA1111BB. Тариф: 9 500 грн. Витрати: паливо 1 400 грн + платні дороги 540 грн + оплата водія 1 500 грн = 3 440 грн. Прибуток рейсу: 6 060 грн (64%). Власник бачить рентабельність кожного рейсу. Не "загалом по місяцю" — а конкретно Київ→Львів проти Харків→Одеса.',
        question: 'Знаєте прибуток з кожного рейсу окремо? Чи тільки загальний прибуток по місяцю?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5c.4 0 .9-.2 1.2-.5l2.8-2.8c.3-.3.5-.7.5-1.2V7"/><path d="M14 7H4"/><path d="M14 7l-2-2"/><path d="M14 7l-2 2"/><circle cx="18" cy="7" r="3"/></svg> Водії — прозорий розрахунок без суперечок',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Микола (водій): за травень — 4 рейси, оплата водія = 1 500 + 2 000 + 1 200 + 1 600 = 6 300 грн. Водій бачить деталі по кожному рейсу — ніяких суперечок "а мені здається ви рахували інакше". Розрахунок прозорий, документ є. Власник формує виплату без Excel і без блокнота.',
        question: 'Як зараз розраховуєте зарплату водіїв? Бувало що водій оскаржував суму?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Клієнти-вантажовідправники — знаєте хто приносить гроші',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        pitch: 'ТОВ БудМайстер: 6 рейсів за 3 місяці, виручка 57 000 грн, середній тариф 9 500 грн, завжди платить вчасно. ФОП Іванченко Логістик: 2 рейси, виручка 22 000 грн, але прострочення оплати 12 днів по останньому рейсу. Вкладка "Рейси" в картці клієнта — вся історія: маршрути, суми, статуси оплати. Відразу видно хто ваш найцінніший клієнт.',
        question: 'Хто ваш найприбутковіший клієнт за останні 3 місяці? Можете назвати цифру прямо зараз?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінанси — рентабельність по напрямках',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'Травень: 6 рейсів. Виручка: 57 000 грн. Витрати (паливо+дороги+водії): 20 640 грн. Амортизація авто: 4 800 грн. Зарплата диспетчера: 15 000 грн. Прибуток: 16 560 грн, маржа 29%. Найприбутковіший напрямок: Харків→Одеса (маржа 47%). Найменш вигідний: Київ→Полтава (маржа 18%). Власник бачить де заробляє більше — і перерозподіляє рейси.',
        question: 'Знаєте яка рентабельність вашого бізнесу по конкретних напрямках? Або тільки загальна цифра?',
    },
],

food_production: [
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мій день — кожен знає своє завдання без дзвінків',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Галина (технолог) о 7:30 відкрила систему — і без єдиного дзвінка знає:<br><br><b>Оксана (кухар, перші страви):</b><br>• Борщ 100 порцій до 10:30 → Кейтеринг Плюс 60 + СмакО 40<br>• Суп курячий 40 порцій до 10:30<br><br><b>Микола (кухар, другі страви):</b><br>• Бізнес-ланч 80 комплектів до 11:30 → TechHub (термін!)<br>• Котлети 30 порцій до 14:00 → СмакО Поділ<br><br><b>Ірина (пекар):</b><br>• Хліб 30 буханок — виїзд о 7:30 (вже в дорозі)<br>• Брауні 48 порцій до 15:00<br><br><b>Тетяна (менеджер):</b><br>• Виставити рахунок лікарні до 9:00<br>• Підтвердити замовлення СмакО на завтра до 12:00',
        question: 'Як зараз ваша команда дізнається план виробництва? Скільки дзвінків, повідомлень і непорозумінь до 9:00?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Завдання — кожна задача з результатом, не просто списком',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: 'Завдання в КухняПро — не просто "зробити борщ". Кожна задача має:<br><br><b>Приклад задачі:</b><br>Назва: <i>Борщ класичний 100 порцій до 10:30</i><br>Виконавець: Оксана Ковальчук<br>Дедлайн: сьогодні 10:30<br>Очікуваний результат: <i>"100 порцій у промаркованих контейнерах на полиці, температура +4°C перевірена, накладна підготована"</i><br><br>Власник бачить не "в роботі" — а конкретно що має бути зроблено і яким чином. Якщо Оксана захворіла — будь-хто відкриває задачу і розуміє що робити.',
        question: 'Якщо ваш ключовий кухар захворів о 7:00 — хтось інший зможе без дзвінка зрозуміти що і як зробити?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Прострочені — втрати в гривнях, не просто список',
        selector: '#tasksTab',
        tab: 'tasks',
        pitch: 'Прострочені задачі — це не просто "не встигли". Це конкретні втрати:<br><br>⚠️ <b>Магазин Марченко — збільшити хліб з 15 до 25 буханок</b><br>Прострочено: 2 дні. Втрата: клієнт замовляє 10 буханок в іншому місці = −4 500 грн/місяць<br><br>⚠️ <b>Оновити технологічну карту котлет</b><br>Прострочено: 3 дні. Ризик: перевірка СЕС за старою картою = штраф або закриття<br><br>⚠️ <b>Переговори зі Школою №145</b><br>Прострочено: 1 день. Потенціал: 380 обідів/день = 285 000 грн/рік<br><br>Система не просто показує "прострочено" — вона показує що ці прострочення коштують бізнесу.',
        question: 'Скільки грошей ваш бізнес зараз втрачає через прострочені задачі? Є ця цифра?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Рецептура — брутто, нетто, відходи і собівартість',
        selector: '#foodProductionTab, [onclick*=\"foodProduction\"]',
        tab: 'foodProduction',
        pitch: 'Відкриємо рецептуру борщу класичного (на 100 порцій):<br><br><b>Інгредієнт → Брутто → Нетто → Відходи → Ціна → Сума</b><br>Свинина лопатка → 1 650 г → 1 500 г → 150 г (9%) → 185 грн/кг → 27.75 грн<br>Буряк → 3 300 г → 3 000 г → 300 г (9%) → 14 грн/кг → 4.20 грн<br>Картопля → 2 780 г → 2 500 г → 280 г (10%) → 12 грн/кг → 3.00 грн<br>Морква → 880 г → 800 г → 80 г (9%) → 16 грн/кг → 1.28 грн<br>Капуста → 2 200 г → 2 000 г → 200 г (9%) → 10 грн/кг → 2.00 грн<br>Олія, сіль, цибуля, спеції → — → — → — → — → 4.59 грн<br><br><b>Разом: соб. 4.82 грн/порція. Ціна 95 грн. Маржа 95%</b><br><br>Відходи враховані — ціна точна, не "приблизно".',
        question: 'У вашій рецептурі враховані відходи? Ви рахуєте по брутто чи нетто? Різниця — до 15% в собівартості.',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> ОП-1 — калькуляційна карта для СЕС одним кліком',
        selector: '#foodProductionTab, [onclick*=\"foodProduction\"]',
        tab: 'foodProduction',
        pitch: 'Це унікальна функція тільки для харчового виробництва.<br><br>Заповнили рецептуру → натиснули <b>"ОП-1"</b> → система автоматично формує офіційну калькуляційну карту:<br><br>• Найменування страви: Борщ класичний<br>• Таблиця: № / Інгредієнт / Од. вим. / Брутто / Нетто / Ціна / Сума<br>• Разом на порцію: 4.82 грн<br>• Ціна продажу: 95.00 грн<br>• Торгова надбавка: 1870%<br>• Місце підпису: Технолог / Завідувач / Керівник<br><br><b>Документ відкривається для друку. 10 секунд.</b><br><br>При перевірці СЕС — всі карти в системі, актуальні, підписані.',
        question: 'Де зберігаються ваші технологічні карти? Скільки часу займає підготувати ОП-1 вручну для нової страви?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> HACCP — температурні журнали без паперів і без ризику штрафу',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: 'HACCP — обов'язкова система безпеки для будь-якого харчового виробництва. Штраф за порушення — від 17 000 грн.<br><br>В системі — щоденне завдання яке повторюється автоматично о 7:00:<br><b>"Перевірити критичні точки HACCP"</b><br><br>Галина вносить в телефоні:<br>• М'ясо в холодильнику: +2°C ✅ (норма 0..+4°C)<br>• Молочні в холодильнику: +4°C ✅<br>• Морозилка: −18°C ✅<br>• Температура в цеху: +18°C ✅<br>• Температура готової продукції: +65°C ✅ (при видачі)<br><br>Якщо щось виходить за норму → автоматичне сповіщення власнику.<br>При перевірці СЕС — журнал за будь-який день в один клік.',
        question: 'Як зараз ведуться журнали HACCP? Що відбувається при раптовій перевірці СЕС — чи є у вас журнал за позавчора?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Собівартість в динаміці — м'ясо подорожчало, маржа впала',
        selector: '#foodProductionTab, [onclick*=\"foodProduction\"]',
        tab: 'foodProduction',
        pitch: 'Унікальна проблема харчового виробництва — ціни на сировину змінюються.<br><br><b>Що відбулось у лютому:</b><br>М'ясо свинина: було 160 грн/кг → стало 185 грн/кг (+16%)<br><br><b>Вплив на борщ:</b><br>Собівартість: 4.20 грн/порц. → 4.82 грн/порц. (+0.62 грн)<br>Маржа: 95.6% → 94.9% — незначна зміна через малу частку м'яса<br><br><b>Вплив на котлету:</b><br>Собівартість: 21.40 грн/порц. → 25.80 грн/порц. (+4.40 грн)<br>Маржа: 71.5% → 65.6% — <b>падіння на 6 пп!</b><br><br>Система показала це одразу. Власник підняв ціну котлети з 75 до 82 грн. Маржа відновилась до 68.5%.',
        question: 'Коли ціна на м'ясо або муку змінюється — ви одразу знаєте як це вплинуло на маржу кожної страви? Або дізнаєтесь в кінці місяця?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/></svg> Plan виробництва — що, скільки, для кого і до якого часу',
        selector: '#foodProductionTab, [onclick*=\"foodProduction\"]',
        tab: 'foodProduction',
        pitch: 'Plan виробництва КухняПро з прив'язкою до клієнтів і часу доставки:<br><br>🟡 <b>Заплановано:</b><br>• Борщ 100 порц. → Кейтеринг Плюс (60) + СмакО (40) | доставка 11:00<br>• Бізнес-ланч 80 компл. → TechHub | ТЕРМІН: до 11:30!<br><br>🟠 <b>В роботі (Ірина, Микола):</b><br>• Брауні 48 порц. → СмакО Поділ | до 15:00<br>• Хліб 30 бух. → Марченко | ✅ доставлено о 7:30<br><br>✅ <b>Виконано сьогодні:</b><br>• Котлети 50 порц. → Лікарня №3 | доставлено о 9:00<br><br>Якщо TechHub переносить замовлення — Тетяна змінює статус і Микола одразу бачить.',
        question: 'Якщо клієнт зранку переносить замовлення — як швидко ваш кухар дізнається що план змінився?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Стоп-лист — нестача виявляється о 7:30, не о 11:00',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: 'Планують завтра: борщ 150 порцій + бізнес-ланч 100 комплектів.<br>Система перевіряє склад прямо зараз:<br><br>✅ М'ясо: потрібно 3.75 кг — є 68 кг<br>✅ Буряк: потрібно 4.95 кг — є 85 кг<br>⚠️ Капуста: потрібно 3.3 кг — є 48 кг (ліміт 50 кг, скоро впаде)<br>❌ <b>БОРОШНО: потрібно 15 кг — є 12 мішків×25 кг=300 кг — ОК<br>❌ ЯЙЦЯ: потрібно 100 шт — є 40 лотків×30=1200 шт — ОК</b><br><br>Все окей на завтра. Але капусту треба замовити.<br>Тетяна бачить це сьогодні о 16:00 — замовляє, привезуть вранці.<br><br>Це не "можна і без системи". Без системи — Оксана о 10:30 каже "капусти не вистачить на всі порції".',
        question: 'Скільки разів за останні 3 місяці виробництво зупинялось або зменшувалось через нестачу сировини?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Автосписання по рецептурі — без зошита і без Excel',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: 'Виробили 100 порцій борщу. Галина натиснула <b>"✓ Готово"</b>.<br><br>Система автоматично списала зі складу строго по рецептурі:<br><br>Свинина лопатка: −1.650 кг (залишок 66.350 кг)<br>Буряк: −3.300 кг (залишок 81.700 кг)<br>Картопля: −2.780 кг (залишок 117.220 кг)<br>Морква: −0.880 кг (залишок 61.120 кг)<br>Капуста: −2.200 кг (залишок 45.800 кг — <b>нижче мінімуму 50 кг, сповіщення</b>)<br>Олія соняшникова: −0.300 л (залишок 47.700 л)<br><br><b>Час операції: 3 секунди. Точність: до грама.</b><br>Технолог не веде зошит. Бухгалтер не рахує в Excel. Склад актуальний завжди.',
        question: 'Як зараз ведеться облік витрат сировини? Коли останній раз залишки в обліку не збіглись з реальністю на складі?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Відвантаження — маршрутний лист водія автоматично',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Сергій (водій-комірник) о 7:00 відкриває телефон і бачить маршрут на сьогодні:<br><br><b>07:30 — Магазин Марченко</b><br>Адреса: вул. Садова 12<br>Вантаж: хліб 30 бух. + брауні 12 порц.<br>Контакт: +38067...<br><br><b>09:00 — Лікарня №3</b><br>Адреса: вул. Медична 45, вхід з боку харчоблоку<br>Вантаж: котлети 50 порц. + пюре 50 порц.<br>Контакт: Надія Петрівна +38050...<br><br><b>11:30 — TechHub офіс</b><br>Адреса: вул. Хрещатик 22, 5 поверх<br>Вантаж: бізнес-ланч 80 компл.<br>УВАГА: термінова доставка, пропуск на ресепції!<br><br>Жодного дзвінка "куди їхати і що везти".',
        question: 'Як зараз ваш водій дізнається маршрут і що везти кожному клієнту? Скільки дзвінків між ним і менеджером щоранку?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процес виробництва — від замовлення до оплати, 8 кроків',
        selector: '[onclick*="switchTab(\'processes\')"]',
        tab: 'processes',
        pitch: 'Стандарт виробництва КухняПро — 8 кроків, кожен з відповідальним і терміном:<br><br>1. <b>Приймання замовлення</b> — Тетяна: перевірити меню, узгодити обсяг, підтвердити дату<br>2. <b>Перевірка стоп-листа</b> — система: чи вистачить сировини на всі позиції?<br>3. <b>Планування виробництва</b> — Галина: розподіл між кухарями, терміни по позиціях<br>4. <b>Закупівля якщо потрібно</b> — Сергій: ринок/постачальник, до 9:00<br>5. <b>Виробництво по рецептурі</b> — Оксана/Микола/Ірина: температура, час, контроль якості<br>6. <b>Пакування і маркування</b> — Сергій: дата виробництва, склад, кількість, клієнт<br>7. <b>Відвантаження і доставка</b> — Сергій: маршрут, підписана накладна від клієнта<br>8. <b>Виставлення рахунку</b> — Тетяна: протягом доби, контроль оплати<br><br>Якщо Тетяна захворіла — будь-хто відкриває систему і знає весь цикл.',
        question: 'Якщо ваш ключовий менеджер або технолог звільниться — скільки часу займе ввести нову людину в усі процеси?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Клієнти — оптові замовники з договорами і рахунками',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'CRM харчового виробництва — це не фізичні особи. Це юридичні:<br><br>🏆 <b>Мережа кафе "СмакО"</b> — 5 точок, 150 порц./тиждень<br>Виручка: 182 000 грн/рік | Умови: оплата 3 дні<br>Примітки: <i>кожен понеділок замовлення до 10:00, окремий рахунок на кожну точку</i><br><br>🏥 <b>Лікарня №3 (їдальня)</b> — держзамовлення, 96 000 грн/рік<br>Примітки: <i>дієтичне меню — без гострого, без смаженого. Платить місяць-в-місяць, рахунок до 1-го числа</i><br><br>🎒 <b>Дитсадок №48</b> — 120 дітей, 48 000 грн/рік<br>Примітки: <i>СТРОГО без горіхів, без меду, без цитрусових. Алергія у 3 дітей зафіксована</i><br><br>Ці примітки — не в голові менеджера. В системі.',
        question: 'Де зберігаються особливі умови по кожному клієнту — без меду для дитсадка, окремі рахунки для мережі? Що якщо менеджер звільниться?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Воронка продажів — нові клієнти в роботі',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Активні переговори прямо зараз:<br><br>🎯 <b>Школа №145</b> — 380 обідів/день, вересень-травень<br>Стадія: переговори. Потенціал: <b>285 000 грн/рік</b><br>Наступний крок: зустріч з директором в п'ятницю о 10:00<br>Тетяна знає це без нагадування — задача в системі<br><br>🎯 <b>Корпорація KPI Group</b> — 50 бізнес-ланчів щодня<br>Стадія: надіслано КП. Потенціал: 48 000 грн/місяць<br>Наступний крок: передзвонити в середу якщо не відповіли<br><br>Власник бачить воронку нових клієнтів і загальну суму потенціалу в одному місці.',
        question: 'Скільки зараз потенційних клієнтів "в роботі"? Можете назвати загальну суму контрактів які зараз обговорюються?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/></svg> Рахунок-фактура — документ для юросіб за 2 хвилини',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Відвантажили СмакО (тижневе замовлення). Тетяна відкриває систему:<br><br>Клієнт: Мережа кафе "СмакО" → обирає клієнта<br>Вибирає позиції:<br>• Борщ класичний — 150 порцій × 95 грн = 14 250 грн<br>• Котлета по-домашньому — 80 порц. × 75 грн = 6 000 грн<br>• Пюре картопляне — 80 порц. × 35 грн = 2 800 грн<br>• Хліб пшеничний — 20 бух. × 45 грн = 900 грн<br><br><b>Рахунок INV-2026-0012 — 23 950 грн</b><br>Натискає "Виставити" → email відправлено автоматично<br>СмакО оплатив → виручка одразу у фінансах<br><br>Час: 2 хвилини. Без Excel, без ручного рахунку.',
        question: 'Як зараз виставляєте рахунок юридичній особі? Скільки часу займає від відвантаження до отримання грошей?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінанси — собівартість vs виручка по кожній страві',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: '<b>Квітень — повний P&L:</b><br><br>Виручка: 430 800 грн<br>• Сировина та інгредієнти: 86 400 грн (20%)<br>• Зарплата 6 осіб: 38 000 грн (9%)<br>• Оренда цеху 120м²: 18 000 грн (4%)<br>• Пакування і маркування: 4 800 грн (1%)<br>• Комунальні: 8 400 грн (2%)<br>Разом витрати: 155 600 грн (36%)<br><b>Прибуток: 275 200 грн (маржа 64%)</b><br><br>Рентабельність по стравах:<br>🥇 Борщ: маржа 95% | 🥈 Брауні: 63% | 🥉 Бізнес-ланч: 58% | Хліб: 42%<br><br>Власник бачить: варто менше хліба і більше борщу.',
        question: 'Знаєте рентабельність по кожній страві окремо? Яка найприбутковіша страва у вашому меню прямо зараз?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Регулярні платежі — жоден не забутий',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'В КухняПро є регулярні платежі яких не можна пропустити:<br><br>📅 <b>1-го числа кожного місяця:</b><br>• Оренда цеху 120м² — 18 000 грн<br><br>📅 <b>5-го числа:</b><br>• Зарплата 6 співробітників — 38 000 грн<br><br>📅 <b>15-го числа:</b><br>• Газ і електрика — 8 400 грн<br>• Пакувальні матеріали (щомісячне замовлення) — 4 800 грн<br><br>📅 <b>Щоквартально:</b><br>• Продовження сертифіката HACCP — 3 200 грн<br>• Перевірка обладнання (холодильники, плити) — 2 400 грн<br><br>Система нагадує за 3 дні до кожного платежу. Ніяких "ой, забули оплатити оренду".',
        question: 'Бувало що ви забули вчасно оплатити оренду, зарплату або ліцензію? Де зараз ведеться список таких платежів?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналітика — 12 тижнів динаміки по кожній позиції',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: 'Система відстежує 12 тижнів динаміки по кожній страві і кожному клієнту:<br><br><b>Борщ:</b> продажі ростуть — 600 → 900 → 1050 порцій/тиждень (+75% за квартал)<br><b>Брауні:</b> стабільно 360 порцій/тиждень, маржа 63%<br><b>Хліб:</b> 600 бух./тиждень, але маржа 42% — найнижча в асортименті<br><br><b>По клієнтах:</b><br>• СмакО — ріст +12 000 грн/місяць (відкрили 2 нові точки)<br>• Лікарня — стабільно, держконтракт<br>• TechHub — ріст компанії → потенціал збільшити ланчі з 80 до 120<br><br>Власник бачить де ріст і де стеля.',
        question: 'Ви знаєте яка страва в нас росте а яка стоїть на місці? Де ця динаміка — в Excel, в голові, чи ніде?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цілі і факт, зеленим і червоним',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: 'KPI КухняПро на сьогодні:<br><br>🟢 Виручка тижнева: 46 200 грн | ціль 48 000 грн (96%) — майже<br>🟢 Середня маржа: 68% | ціль 65% — <b>перевиконано!</b><br>🟡 Порцій/тиждень: 1 520 | ціль 1 500 — виконано<br>🔴 Активних клієнтів: 6 | ціль 8 — <b>відставання</b><br>🟡 Вчасних відвантажень: 98% | ціль 98% — точно в цілі<br><br>Власник бачить де виконуємо і де відстаємо — без нарад і без звітів.<br>Кухарі бачать свої KPI (порції, якість, відходи) і самі знають чи досягли мети.',
        question: 'Ваша команда знає свої KPI? Галина знає що маржа 68% — це вище цілі? Або ці цифри тільки у власника в голові?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Команда — хто завантажений, хто вільний',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: 'Навантаженість команди КухняПро сьогодні:<br><br><b>Галина (технолог):</b> 3 задачі, 5 год | 87% завантаженість — норма<br><b>Оксана (кухар перші):</b> 2 задачі, 4.5 год | 75% — є резерв<br><b>Микола (кухар другі):</b> 3 задачі, 6 год | 100% — повне завантаження<br><b>Ірина (пекар):</b> 2 задачі, 5 год | 83%<br><b>Тетяна (менеджер):</b> 4 задачі, 3 год | 50% — може взяти додаткове<br><b>Сергій (водій):</b> 3 доставки, 4 год | 67%<br><br>Власник бачить: якщо завтра прийде велике замовлення від Школи №145 — Оксана і Тетяна можуть взяти більше. Микола — ні.',
        question: 'Якщо завтра прийде велике замовлення — ви знаєте хто з команди може взяти додаткове навантаження?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Координації — планерка о 7:30, 15 хвилин, без тяганини',
        selector: '[onclick*="coordination"]',
        tab: 'myday',
        pitch: 'В КухняПро — 3 регулярні координації:<br><br>⏰ <b>Щоденна планерка — 7:30, 15 хвилин</b><br>Учасники: Галина + всі кухарі<br>Порядок денний: план на день, стоп-лист, особливі замовлення<br>Результат фіксується — що вирішили, хто відповідає<br><br>⏰ <b>Щотижнева зустріч — понеділок 9:00, 30 хвилин</b><br>Учасники: Галина + Тетяна + власник<br>Порядок: виручка тижня, нові клієнти, проблеми<br><br>⏰ <b>Місячний огляд — 1-го числа, 1 година</b><br>P&L, рентабельність по стравах, цілі на місяць<br><br>Через тиждень видно хто що виконав з того що вирішили.',
        question: 'Ваші наради мають фіксований результат? Або через тиждень ніхто не пам'ятає що вирішили о 7:30?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобільна версія — Галина з телефону, Сергій з маршруту',
        selector: '#mydayTab',
        tab: 'myday',
        pitch: 'Весь КухняПро — в телефоні:<br><br><b>Галина о 7:30</b> (ще вдома, в транспорті):<br>Відкриває план виробництва → бачить стоп-лист → замовляє борошно до приїзду на роботу<br><br><b>Сергій (водій) між доставками:</b><br>Відмічає виконані доставки → отримує зміни в маршруті → бачить наступну адресу<br><br><b>Власник о 8:00 (вдома):</b><br>Відкриває телефон → бачить виручку вчора + план сьогодні + чи є критичні ситуації<br><br><b>Оксана прямо на кухні:</b><br>Перевіряє рецептуру на телефоні → відмічає виконання → склад оновлюється<br><br>Система однакова на телефоні і комп'ютері. Без окремих додатків.',
        question: 'Ваша команда може працювати з системою з телефону? Або тільки з комп'ютера в офісі?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1A2.5 2.5 0 0 1 14.5 8A2.5 2.5 0 0 1 17 10.5v3A2.5 2.5 0 0 1 14.5 16A2.5 2.5 0 0 1 12 18.5v1a2.5 2.5 0 0 1-5 0v-1A2.5 2.5 0 0 1 4.5 16A2.5 2.5 0 0 1 2 13.5v-3A2.5 2.5 0 0 1 4.5 8A2.5 2.5 0 0 1 7 5.5v-1A2.5 2.5 0 0 1 9.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI — знає вашу рецептуру, клієнтів і маржу',
        selector: '[onclick*="aiAssistant"], #aiAssistantBtn',
        tab: 'myday',
        pitch: 'AI КухняПро знає специфіку вашого виробництва:<br><br><b>Запит:</b> <i>"Маржа котлети впала до 55%. Що робити?"</i><br><b>AI:</b> <i>"М'ясо подорожчало +25 грн/кг цього місяця. Три варіанти: 1) підняти ціну котлети з 75 до 88 грн (маржа 72%); 2) змінити пропорцію свинина/яловичина на 60/40 (соб. −3.20 грн); 3) прибрати з меню і збільшити борщ (маржа 95%). Рекомендую варіант 1 — ринок витримає."</i><br><br><b>Запит:</b> <i>"TechHub просить збільшити ланчі до 120. Чи впораємось?"</i><br><b>AI:</b> <i>"При поточному навантаженні — Микола на 100%. Потрібно або найняти помічника або перенести брауні на іншого кухаря. Розрахунок: +40 ланчів = +5 400 грн/день."</i>',
        question: 'Уявіть консультанта який знає вашу рецептуру, склад і клієнтів і дає відповідь за 10 секунд. Яке перше питання?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 8 функцій харчового виробництва',
        selector: '[onclick*="switchTab(\'functions\')"], #functionsTab',
        tab: 'functions',
        pitch: 'КухняПро структурована на 8 функцій:<br><br>0. <b>Маркетинг та продажі</b> — нові клієнти, переговори, контракти (Тетяна)<br>1. <b>Прийом замовлень</b> — обробка, підтвердження, рахунки (Тетяна)<br>2. <b>Виробництво / Кухня</b> — приготування за рецептурами (Галина, Оксана, Микола, Ірина)<br>3. <b>Склад та закупівлі</b> — сировина, залишки, замовлення (Сергій + Тетяна)<br>4. <b>Відвантаження</b> — пакування, маркування, доставка (Сергій)<br>5. <b>Фінанси та облік</b> — рахунки, P&L, зарплата (власник + Тетяна)<br>6. <b>Команда та навчання</b> — стандарти, HACCP, атестація (Галина)<br>7. <b>Управління та розвиток</b> — нові страви, рецептури, масштабування (власник)<br><br>Кожна функція має власника, задачі і KPI.',
        question: 'Якщо намалювати структуру вашого бізнесу — скільки хвилин це займе? І чи всі функції мають відповідального?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg> КухняПро на автопілоті — що через 65 днів',
        selector: '#mydayTab',
        tab: 'myday',
        pitch: '<b>Через 65 днів впровадження КухняПро:</b><br><br>✅ Галина відкриває систему о 7:30 — план вже є, команда знає<br>✅ HACCP журнали ведуться автоматично — перевірка СЕС без стресу<br>✅ Борошно закінчується о 7:30 — замовили до обіду<br>✅ М'ясо подорожчало — система показала вплив на маржу одразу<br>✅ Рахунок СмакО за 2 хвилини, оплата — автоматично у фінансах<br>✅ Школа №145 підписала контракт — 380 обідів/день<br>✅ Власник бачить P&L о 8:00 з телефону<br><br><b>Математика росту:</b><br>Зараз: 6 клієнтів × 71 800 грн/місяць = 430 800 грн<br>Через рік: 9 клієнтів × 95 500 грн = 859 500 грн<br><br>Не прогноз — математика: школа (+285к) + ще 2 клієнти.',
        question: 'Як виглядає ваш бізнес через рік якщо кожен день є ця картина? Що змінюється особисто для вас — як власника?',
    },
],



cleaning: [
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мій день — бригада знає маршрут без дзвінків',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Катерина (бригадир №1) о 7:30 відкрила телефон — без жодного дзвінка знає весь день:<br><br><b>08:30 — БЦ "Панорама", 3-й поверх</b><br>Площа: 450 м² | Тип: щотижневе (абонемент) | Час: 2.5 год<br>Бригада: Катерина + Ірина + Оля | Хімія: FloorPro (паркет), SaniMax (санвузли)<br>Контакт адміністратора: Марина +38067...<br><br><b>12:00 — Квартира Ковальчук, Садова 12</b><br>Площа: 87 м² | Тип: генеральне після ремонту | Час: 4 год<br>Бригада: Катерина + Оля (Ірина — окремо на офіс)<br>Код домофону: 1234# | Паркет — засіб БЕЗ АМІАКУ ⚠️<br><br><b>17:00 — Офіс ТОВ "Альфа", Хрещатик 22</b><br>Площа: 120 м² | Тип: щоденне вечірнє | Час: 1.5 год | Бригада: Ірина<br><br>Транспорт: Vito AA1234BC, виїзд о 8:00 від бази.',
        question: 'Як зараз ваші бригади дізнаються маршрут і об'єкти на день? Скільки дзвінків відбувається до 8:30?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Завдання — кожен об'єкт як задача з конкретним результатом',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: 'Кожен виїзд — задача зі стандартом якості, а не просто "поїхати прибрати":<br><br><b>Задача: БЦ "Панорама" — щотижневе прибирання</b><br>Виконавець: Катерина Мельник<br>Дедлайн: сьогодні 11:00<br>Очікуваний результат:<br><i>"Підлоги — без плям і сміття, блиск на плитці. Санвузли — дезінфіковані, дзеркала чисті. Кухня — раковина і мікрохвильова. Килим на вході — пропилососити. Фото до/після прикріплено. Клієнт підписав чек-лист."</i><br><br>Якщо Катерина не відмітить виконання до 11:15 — диспетчер Тетяна отримає сповіщення автоматично.',
        question: 'Як зараз фіксується що об'єкт прибраний якісно? Є стандарт — що саме і як має бути зроблено?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a1.5 1.5 0 0 0 1.5-1.5v-5.5"/><path d="M14 7H4"/><circle cx="18" cy="7" r="3"/></svg> Маршрут бригад — оптимально, без зайвих кілометрів',
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Тетяна (диспетчер) о 8:00 бачить маршрути обох бригад:<br><br><b>Бригада №1 (Катерина, Ірина, Оля) — Vito AA1234BC:</b><br>🔵 8:30 БЦ "Панорама" (Печерськ) → 🟡 12:00 Ковальчук (Поділ) → 🟢 17:00 ТОВ "Альфа" (Хрещатик)<br>Загальний пробіг: 18 км | Час в дорозі: 45 хв<br><br><b>Бригада №2 (Микола, Світлана) — Transit KA5678:</b><br>🔵 9:00 ЖК "Sunrise" кв.47 (Оболонь) → 🟡 13:30 ресторан "Смак" (Відрадний) → 🟢 17:30 склад (Дарниця)<br>Загальний пробіг: 34 км<br><br>Порядок об'єктів оптимізований по карті. Раніше бригада могла їхати Печерськ → Оболонь → Печерськ — зайвих 40 хв.',
        question: 'Хто зараз складає маршрути бригад? Скільки часу? Чи бувало що бригада їде через все місто між об'єктами?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> Чек-лист — захист від "ви погано прибрали"',
        selector: '#mydayTab',
        tab: 'myday',
        pitch: 'Після завершення об'єкту Катерина відкриває чек-лист в телефоні:<br><br><b>БЦ "Панорама", 3-й поверх — відмічає зону за зоною:</b><br>✅ Коридор: підлога, плінтуси, вхідна зона<br>✅ Open-space: 24 робочих місця, підлога, кошики для сміття<br>✅ Переговорна 1: стіл, крісла, дошка, вікно<br>✅ Переговорна 2: стіл, крісла, кавова зона<br>✅ Кухня: раковина, мікрохвильова, холодильник зовні, підлога<br>✅ Санвузол ч.: унітаз, раковина, дзеркало, підлога, освіжувач<br>✅ Санвузол ж.: унітаз, раковина, дзеркало, підлога, освіжувач<br><br>Марина (адміністратор БЦ) підписує чек-лист пальцем прямо в телефоні Катерини.<br>Документ збережений з датою 16.04.2026, часом 10:52, підписом Марини.',
        question: 'Якщо клієнт каже "ви не прибрали туалет" через 2 дні — як ви доводите що все зробили? Без чек-листа це слово проти слова.',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Фото до/після — незаперечний доказ якості роботи',
        selector: '#mydayTab',
        tab: 'myday',
        pitch: 'Ірина приїхала на квартиру Ковальчук після ремонту. Відкриває задачу — система вимагає фото ДО:<br><br>📸 Вітальня: пил і сміття від шліфовки, фарба на плінтусах<br>📸 Кухня: залишки шпаклівки на фасадах, жирний наліт на плиті<br>📸 Ванна: вапняний наліт на плитці, шпаклівка на сантехніці<br><br>Після 4 годин прибирання — фото ПІСЛЯ:<br>📸 Вітальня: паркет блищить, плінтуси чисті, вікна прозорі<br>📸 Кухня: фасади, стільниця, плита і раковина сяють<br>📸 Ванна: плитка і сантехніка без нальоту<br><br><b>Клієнт: "Ого, не очікувала такого результату! Тепер тільки до вас."</b><br><br>Всі фото збережені і прив'язані до клієнта, об'єкту і дати.',
        question: 'Бувало що клієнт незадоволений якістю і ви не могли довести що зробили все правильно? Скільки грошей повернули за "неякісне" прибирання?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6m20 0-3-3"/></svg> Час на об'єкт — норматив vs факт, ефективність бригади',
        selector: '#mydayTab',
        tab: 'myday',
        pitch: 'Система фіксує реальний час кожної бригади на кожному об'єкті:<br><br><b>БЦ "Панорама" (450 м², 3 особи):</b><br>Норматив: 2 год 30 хв<br>Факт сьогодні: 2 год 10 хв ✅ (швидше — премія)<br>Факт 2 тижні тому: 3 год 20 хв ⚠️ (повільніше — з'ясували: не було FloorPro, витратили час на замінник)<br><br><b>Квартира після ремонту (87 м², 2 особи):</b><br>Норматив: 4 год<br>Факт: 5 год 10 хв ⚠️ (перевищення через стелю в шпаклівці — не передбачили)<br>→ Доплата 600 грн автоматично розрахована, клієнт погодив<br><br><b>Рейтинг ефективності бригад за місяць:</b><br>Бригада №1 (Катерина): в середньому -8% від нормативу (швидше)<br>Бригада №2 (Микола): в середньому +12% від нормативу (повільніше — є питання)',
        question: 'Знаєте скільки реально часу бригада витрачає на кожний тип об'єкту? Хтось це контролює чи бригада сама вирішує коли виїжджати?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg> Хімія та інвентар — облік витрат по кожному об'єкту',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: '<b>Склад CleanMaster — залишки сьогодні:</b><br><br>✅ FloorPro (підлоги, 5л) — 12 каністр (мін. 8)<br>✅ SaniMax (сантехніка, 1л) — 28 шт (мін. 20)<br>❌ <b>ClearView (скло, 0.5л) — 6 шт (мін. 10) — НИЖЧЕ МІНІМУМУ</b><br>Сповіщення відправлено Тетяні: "Замовити ClearView до п'ятниці"<br>✅ Антибактеріальний спрей — 18 шт (мін. 15)<br>✅ Рукавички (уп.100 шт) — 8 уп. (мін. 5)<br>✅ Серветки мікрофібра — 24 уп.<br><br><b>Витрати хімії по об'єктах за тиждень:</b><br>БЦ "Панорама" (щотижн.): FloorPro 0.5л + SaniMax 0.2л = <b>48 грн/прибирання</b><br>Клініка "МедПлюс" (3×/тижд.): Антибакт. 0.5л + SaniMax 0.4л = <b>91 грн/прибирання</b><br>Генеральне після ремонту: ClearView 0.4л + різне = <b>124 грн/прибирання</b><br><br>Власник бачить реальну вартість хімії на кожному типі об'єкту.',
        question: 'Знаєте скільки витрачається хімії на кожний об'єкт? Чи буває що бригада каже "засіб закінчився" вже на місці?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Абонементи — гроші прийшли, об'єкти ще попереду',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Найкращий клієнт в клінінгу — той хто платить наперед.<br><br><b>Активні абонементи CleanMaster:</b><br><br>🏢 <b>БЦ "Панорама"</b> — щотижнево<br>4 800 грн/тиждень | Передплата 4 тижні = <b>19 200 грн</b> ✅<br>Залишок: 3 тижні = 14 400 грн<br><br>🍽️ <b>Ресторан "Смак"</b> — щодня вечірнє<br>1 200 грн/день | Місяць = <b>26 400 грн</b> ✅<br><br>🏠 <b>Бондаренко (ЖК "Sunrise")</b> — 2 рази/місяць<br>1 800 грн/прибирання | Передплата 2 = <b>3 600 грн</b> ✅<br><br>🏥 <b>Клініка "МедПлюс"</b> — 3 рази/тиждень<br>2 400 грн/прибирання | Місяць = <b>28 800 грн</b> ✅<br><br>Загальна передплата в касі прямо зараз: <b>86 400 грн</b><br>Це гроші які вже отримані — і команда знає скільки об'єктів попереду.',
        question: 'Скільки у вас абонентних клієнтів? Яка сума передплати зараз на рахунку? Це ваша "подушка безпеки" на місяць?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> CRM — вся специфіка клієнта в одній картці',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Картка клієнта містить все що важливо для прибирання:<br><br><b>Ковальчук Оксана — кв. 87 м², Садова 12</b><br>⚠️ Паркет — засіб БЕЗ АМІАКУ (є реакція на запах)<br>⚠️ Алергія на хлор — не використовувати СанФреш!<br>🐱 Кіт Барсик — замкнути в кімнаті перед початком<br>🔑 Код домофону: 1234# | 2-й під'їзд, 5-й поверх<br>👤 Клієнт вдома: з 11:00 до 14:00<br>⭐ Улюблена бригада: тільки Катерина<br><br>Історія: 8 прибирань. Скарга в лютому: не протерли плінтуси → виправили + знижка 10%.<br>Рейтинг: 4.7/5 | LTV: 14 400 грн/рік<br><br>Нова прибиральниця Ірина відкрила картку — і знає все без дзвінка Катерині.',
        question: 'Де зберігається специфіка кожного клієнта? Якщо нова людина виїде замість Катерини — чи знатиме вона про паркет і кота?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Рекламація — вирішуємо за 30 секунд з доказами',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Бондаренко телефонує: <i>"Ваші прибирали вчора — і досі пил за телевізором!"</i><br><br>Тетяна відкриває задачу на об'єкті:<br>🔍 Чек-лист: пункт "ТВ-зона — протерти пил" ✅ відмічено о 10:47<br>📸 Фото ПІСЛЯ: за телевізором чисто — зафіксовано о 10:51<br>✍️ Підпис клієнта: є (сам підписав чек-лист)<br><br>Тетяна: <i>"Оксано Василівно, ось фото після прибирання — ось за ТВ чисто. Ось підписаний чек-лист. Можливо пил осів після? Ми готові приїхати перевірити безкоштовно."</i><br><br>Клієнт: <i>"Ой, справді... вибачте, можливо кіт натусив."</i><br><br><b>Результат: претензія знята, клієнт лояльний, гроші не повернуті.</b>',
        question: 'Як зараз вирішуєте рекламації? Скільки грошей повернули за "неякісне прибирання" за останні 3 місяці?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Win-back — клієнти які "пішли" повертаються',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Система автоматично відстежує клієнтів які перестали замовляти:<br><br>⚠️ <b>Петренко Ірина</b> — кв. 65 м², 3 прибирання в минулому році<br><b>Не замовляла 4 місяці.</b><br>Задача для Тетяни: "Передзвонити, з'ясувати причину, запропонувати знижку 15%"<br><br>⚠️ <b>ФОП "Тех-Консалт"</b> — офіс 90 м², скасував абонемент 6 тижнів тому<br>Причина: "дорого". Задача: "Запропонувати вечірній пакет 2 800 грн/тиждень замість 3 400"<br><br>Тетяна телефонує Петренко: <i>"Іринo, ми помітили що давно не бачились. Хочемо запропонувати знижку 15% на наступні 3 прибирання..."</i><br><br>Результат по базі: 60% клієнтів повертаються після win-back дзвінка.',
        question: 'Як відстежуєте клієнтів які пропали? Хтось їм телефонує і з'ясовує причину?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Прострочені — кожна з конкретною ціною ризику',
        selector: '#tasksTab',
        tab: 'tasks',
        pitch: 'Прострочені задачі CleanMaster з ціною кожної:<br><br>🔴 <b>Замовити ClearView для скла</b> — прострочено 3 дні<br>Ризик: завтра генеральне у Ковальчук — вікна і дзеркала без засобу. Клієнт побачить = рекламація.<br><br>🔴 <b>Оновити сертифікат HACCP для клініки</b> — прострочено 5 днів<br>Ризик: без сертифікату клініка "МедПлюс" може відмовити нашій хімії. Втрата контракту = <b>28 800 грн/місяць</b>.<br><br>⚠️ <b>Атестація Ірини Шевченко (3 місяці роботи)</b> — прострочено 1 день<br>Ризик: без атестації Ірина не може самостійно виїжджати на медичні об'єкти. Бригада неукомплектована.',
        question: 'Скільки зараз прострочених задач у вашому бізнесі? Знаєте яка ціна кожної з них у гривнях?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процес прибирання — від замовлення до підпису клієнта',
        selector: '[onclick*="switchTab(\'processes\')"]',
        tab: 'processes',
        pitch: 'Стандарт CleanMaster — 8 кроків, кожен з відповідальним:<br><br>1. <b>Прийом замовлення</b> — Тетяна: тип об'єкту, площа, особливості, розрахунок вартості<br>2. <b>Підтвердження і оплата</b> — Тетяна: рахунок або аванс для разового<br>3. <b>Призначення бригади</b> — Тетяна: виходячи з завантаженості і спеціалізації<br>4. <b>Підготовка</b> — бригадир: хімія, інвентар, маршрут, картка клієнта<br>5. <b>Фото ДО + прибирання</b> — бригада: фіксація до початку<br>6. <b>Чек-лист зона за зоною</b> — відмітки в телефоні по ходу<br>7. <b>Фото ПІСЛЯ + підпис клієнта</b> — закриття об'єкту<br>8. <b>Рахунок і відгук</b> — Тетяна: фінальний рахунок + SMS з проханням оцінити<br><br>Нова прибиральниця виходить на лінію на 2-й день — процес у телефоні.',
        question: 'Якщо завтра ваша ключова людина захворіє — нова зможе вийти на об'єкт і знати що робити без вашого особистого інструктажу?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> Онлайн-запис — клієнт обирає час сам, диспетчер не телефонує',
        selector: '[onclick*="switchTab(\'booking\')"], #bookingNavBtn',
        tab: 'booking',
        pitch: 'Клієнт заходить на сайт CleanMaster і за 2 хвилини оформляє замовлення:<br><br>Крок 1: Тип прибирання → ● Генеральне після ремонту<br>Крок 2: Площа → 87 м²<br>Крок 3: Вартість → <b>автоматично 2 800 грн</b><br>Крок 4: Дата і час → "Завтра 10:00-14:00" (Бригада №2 вільна ✅)<br>Крок 5: Адреса і особливості (паркет без аміаку, кіт)<br>Крок 6: Оплата онлайн → підтвердження на email<br><br>Тетяна бачить нове замовлення в системі — бригада вже призначена. Нуль дзвінків.<br><br><b>8 таких самозаписів за тиждень = звільнено 2 год 40 хв роботи диспетчера.</b><br>2 год 40 хв × 4 тижні = 10+ годин на місяць = ще 4-5 замовлень.',
        question: 'Скільки часу диспетчер витрачає на узгодження одного замовлення телефоном? Помножте на кількість замовлень за місяць.',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Рейтинг бригад — система якості без суб'єктивності',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        lazyGroup: 'crm',
        pitch: 'Після кожного прибирання клієнт отримує SMS:<br><i>"Дякуємо! Оцініть якість від 1 до 5 — ваш відгук допомагає нам бути кращими."</i><br><br><b>Рейтинги бригад за квітень:</b><br>🏆 Бригада №1 (Катерина, Ірина, Оля): <b>4.9/5</b> — 24 оцінки | 0 рекламацій<br>🥈 Бригада №2 (Микола, Світлана): <b>4.6/5</b> — 18 оцінок | 1 рекламація (не витерли піддон під холодильником)<br>⚠️ Бригада №3 (Петро, Ганна): <b>4.1/5</b> — 12 оцінок | 3 рекламації ("не протерли плінтуси", "мокрий килим", "пил на полицях")<br><br>Власник побачив проблему Петра — провів навчання, дав наставника. Без системи відгуків — дізнався б після втрати 3-4 клієнтів.<br><br>Google Maps CleanMaster: <b>4.8 ⭐</b> | 87 відгуків',
        question: 'Як зараз оцінюєте якість роботи кожної бригади окремо? Звідки дізнаєтесь що бригада "халтурить" — від клієнта або самі помічаєте?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінанси — маржа по типах прибирання',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: '<b>P&L CleanMaster — квітень:</b><br><br>Виручка:<br>• Абонементи (4 клієнти): 86 400 грн<br>• Разові прибирання (18 шт): 48 600 грн<br>• Генеральні після ремонту (6 шт): 28 800 грн<br><b>Разом: 163 800 грн</b><br><br>Витрати:<br>• Зарплата 8 прибиральників: 64 000 грн (39%)<br>• Зарплата диспетчера: 18 000 грн (11%)<br>• Хімія і витратні матеріали: 12 400 грн (8%)<br>• Паливо і амортизація авто: 8 200 грн (5%)<br>• Реклама: 4 800 грн (3%) | Оренда складу: 6 000 грн (4%)<br><b>Разом: 113 400 грн</b><br><br><b>Прибуток: 50 400 грн (маржа 31%)</b><br><br>Маржа по типах: Генеральні 48% 🥇 | Абонементи 38% 🥈 | Разові 24% 🥉 | Щоденні офіси 22% ⚠️',
        question: 'Знаєте маржу по кожному типу прибирання окремо? Щоденні офіси у вас найменш прибуткові — знали?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Регулярні витрати — жодна не пропущена',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'Регулярні витрати CleanMaster:<br><br>📅 <b>1-го числа:</b> Оренда складу і бази — 6 000 грн | Страхування 2 авто — 2 400 грн<br>📅 <b>5-го числа:</b> Зарплата 8 прибиральників — 64 000 грн | Диспетчер — 18 000 грн<br>📅 <b>15-го числа:</b> Паливна карта WOG — 8 400 грн | Хімія і витратні — 12 400 грн<br>📅 <b>Щоквартально:</b> ТО двох мікроавтобусів — 6 800 грн | Сертифікат HACCP для медоб'єктів — 2 200 грн<br><br>Система нагадує за 5 днів до кожного платежу.<br><br>Особливо важливе: якщо забути про ТО авто → поломка на виїзді → об'єкт зірваний → штраф за договором.',
        question: 'Бувало що забули вчасно поповнити паливо, провести ТО або оновити сертифікат — і це вплинуло на виїзд?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналітика — сезонність і де ростемо',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: 'Динаміка CleanMaster за 3 місяці:<br><br>📈 Виручка: 118 000 → 139 000 → 163 800 грн/місяць (+39%)<br>📈 Об'єктів/місяць: 34 → 41 → 48 (+41%)<br>📈 Абонентна база: 3 → 4 клієнти (+клініка)<br>📉 Середній рейтинг: 4.8 → 4.6 (бригада Петра)<br><br><b>Сезонність:</b><br>🌸 Квітень-травень — пік генеральних (після ремонтів і весняне прибирання)<br>☀️ Червень-серпень — спад 25-30% (люди у відпустках)<br>🍂 Жовтень — відновлення (після дач і ремонтів)<br>❄️ Грудень — пік корпоративних (офіси перед Новим роком)<br><br>Власник знає: у серпні треба запустити акцію "Повернення з відпустки".',
        question: 'Знаєте свою сезонність? Що робите в "тихі" місяці щоб тримати завантаженість бригад?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — бригади, якість, диспетчер',
        selector: '[onclick*="statistics"]',
        tab: 'statistics',
        lazyGroup: 'statistics',
        pitch: 'KPI CleanMaster — квітень:<br><br>🟢 Виручка: 163 800 при цілі 150 000 — <b>+9%, перевиконано!</b><br>🟢 Об'єктів вчасно: 94% при цілі 90% ✅<br>🟡 Середній рейтинг: 4.6 при цілі 4.8 — ⚠️ через бригаду Петра<br>🔴 Абонентних клієнтів: 4 при цілі 6 — відставання, треба продавати<br>🟢 Win-back: 3 з 5 повернулись (60%) ✅<br><br><b>KPI по бригадах:</b><br>Катерина: рейтинг 4.9, вчасно 100%, хімія в нормі ← ТОП<br>Микола: рейтинг 4.6, вчасно 89%, перевищення нормативу 2 рази<br>Петро: рейтинг 4.1, 3 рекламації ← <b>потребує уваги</b>',
        question: 'Ваші бригадири знають свої KPI? Петро знає що у нього 3 рекламації і рейтинг 4.1? Або дізнається тільки коли ви скажете?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Команда — хто вільний для термінового замовлення',
        selector: '[onclick*="switchTab(\'tasks\')"]',
        tab: 'tasks',
        pitch: 'Завантаженість команди CleanMaster сьогодні:<br><br><b>Бригада №1 (Катерина, Ірина, Оля):</b><br>3 об'єкти, 8 год — 100% завантажена<br><br><b>Бригада №2 (Микола, Світлана):</b><br>3 об'єкти, 7 год — 87%, є 1 год резерву<br><br><b>Бригада №3 (Петро, Ганна):</b><br>2 об'єкти, 5 год — <b>62%, вільні з 14:00!</b><br><br>Зараз зателефонували: <i>"Потрібне термінове прибирання квартири після вечірки — 70 м², сьогодні о 15:00"</i><br><br>Тетяна одразу бачить: Петро і Ганна вільні з 14:00 → призначає → підтверджує клієнту.<br>Час від дзвінка до підтвердження: <b>3 хвилини.</b><br>Без системи: 5 дзвінків бригадирам → "зачекайте уточню" → 20 хвилин.',
        question: 'Якщо зараз надійде термінове замовлення — скільки часу займе зрозуміти хто вільний і підтвердити клієнту?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Координації — планерка 8:00, 10 хвилин',
        selector: '[onclick*="coordination"]',
        tab: 'myday',
        pitch: 'В CleanMaster — 3 регулярні координації:<br><br>⏰ <b>Щоденна планерка — 8:00, 10 хвилин (аудіоповідомлення в системі)</b><br>Учасники: Тетяна + всі бригадири<br>Порядок: маршрути підтверджені, проблемні об'єкти, хімія на борту<br>Результат: кожен бригадир підтвердив або підняв питання<br><br>⏰ <b>Щотижневий розбір — понеділок 9:00, 30 хвилин</b><br>Учасники: власник + Тетяна + бригадири<br>Порядок: рейтинги за тиждень, рекламації, завантаженість, нові клієнти<br><br>⏰ <b>Місячний підсумок — 1-го, 1 година</b><br>P&L, KPI бригад, план на сезон, нові напрямки<br><br>Кожне рішення фіксується. Через тиждень видно хто що виконав.',
        question: 'Ваші бригадири знають результати своєї роботи за тиждень? Або дізнаються тільки якщо ви самі скажете?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобільна — бригада працює виключно з телефону',
        selector: '#mydayTab',
        tab: 'myday',
        pitch: 'Прибиральник не сидить за комп'ютером — все в телефоні:<br><br><b>Катерина на об'єкті (весь цикл у телефоні):</b><br>→ Приїхала → відкрила задачу → зробила фото ДО<br>→ Прибирає → відмічає зони чек-листу одну за одною<br>→ Завершила → фото ПІСЛЯ → клієнт підписує пальцем<br>→ Задача закрита → Тетяна бачить "✅ БЦ Панорама — виконано"<br><br><b>Тетяна з будь-якого місця:</b><br>→ Бачить де зараз кожна бригада і статус кожного об'єкту<br>→ Призначає термінове замовлення за 3 хвилини<br><br><b>Власник вранці в телефоні:</b><br>→ Виручка вчора: 8 400 грн (6 об'єктів)<br>→ Рейтинг тижня: 4.7 ⭐ | Рекламацій: 0<br><br>Без WhatsApp-груп де все губиться серед мемів.',
        question: 'Ваші бригади зараз комунікують через WhatsApp? Скільки важливих повідомлень губиться в чаті?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1A2.5 2.5 0 0 1 14.5 8A2.5 2.5 0 0 1 17 10.5v3A2.5 2.5 0 0 1 14.5 16A2.5 2.5 0 0 1 12 18.5v1a2.5 2.5 0 0 1-5 0v-1A2.5 2.5 0 0 1 4.5 16A2.5 2.5 0 0 1 2 13.5v-3A2.5 2.5 0 0 1 4.5 8A2.5 2.5 0 0 1 7 5.5v-1A2.5 2.5 0 0 1 9.5 2z"/><path d="M12 5.5v13M7 8.5h10M7 13.5h10"/></svg> AI — знає ваших клієнтів, бригади і сезонність',
        selector: '[onclick*="aiAssistant"], #aiAssistantBtn',
        tab: 'myday',
        pitch: 'AI CleanMaster знає специфіку вашого бізнесу:<br><br><b>Запит:</b> <i>"Маржа щоденних офісів тільки 22%. Що робити?"</i><br><b>AI:</b> <i>"Три варіанти: 1) підняти тариф ТОВ 'Альфа' з 900 до 1 100 грн — вони з вами 2 роки, ризик низький; 2) скоротити бригаду з 2 до 1 особи (площа 120 м², реально за 2 год); 3) перевести на 3 рази/тиждень замість 5 — і підняти глибину. Рекомендую варіант 1."</i><br><br><b>Запит:</b> <i>"Серпень — традиційно тихий. Як завантажити бригади?"</i><br><b>AI:</b> <i>"Запустіть акцію 'Повернення з відпустки' — прибирання після відпустки -20%. Цільова аудиторія: всі клієнти кому слали win-back. База: 48 контактів. Потенціал: 8-12 додаткових замовлень."</i>',
        question: 'Уявіть консультанта який знає ваших клієнтів, бригади і сезонність — і відповідає за 10 секунд. Яке перше питання?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 7 функцій клінінгового бізнесу',
        selector: '[onclick*="switchTab(\'functions\')"], #functionsTab',
        tab: 'functions',
        pitch: 'CleanMaster структуровано на 7 функцій:<br><br>0. <b>Маркетинг і залучення</b> — реклама, Google Maps, відгуки, акції (власник + Тетяна)<br>1. <b>Продажі та онлайн-запис</b> — прийом заявок, розрахунок, підтвердження (Тетяна)<br>2. <b>Диспетчеризація</b> — маршрути, призначення бригад, термінові замовлення (Тетяна)<br>3. <b>Виконання прибирання</b> — бригади, чек-листи, фото до/після (бригадири)<br>4. <b>Якість і рекламації</b> — відгуки, рейтинги, вирішення скарг (Тетяна + власник)<br>5. <b>Склад і хімія</b> — засоби, інвентар, залишки, замовлення (бригадир складу)<br>6. <b>Фінанси і розвиток</b> — P&L, KPI, нові напрямки, масштабування (власник)<br><br>Кожна функція має власника, задачі і KPI.',
        question: 'Якщо намалювати структуру вашого бізнесу — є відповідальний за кожну функцію? Або диспетчер = маркетолог = комірник = бухгалтер?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg> CleanMaster на автопілоті — що через 65 днів',
        selector: '#mydayTab',
        tab: 'myday',
        pitch: '<b>Через 65 днів впровадження CleanMaster:</b><br><br>✅ Катерина о 7:30 — маршрут є, хімія підготована, специфіка кожного клієнта відома<br>✅ Рекламація Бондаренко: Тетяна відкрила фото → 30 секунд → закрила без повернення грошей<br>✅ Рейтинг Петра впав до 4.1 → побачили відразу → провели навчання → 4.5 наступного місяця<br>✅ ФОП "Тех-Консалт" скасував — win-back → повернули з новим тарифом<br>✅ Серпень: запустили акцію "Повернення з відпустки" → +11 замовлень<br>✅ Власник о 8:00: виручка, рейтинг, рекламації — в телефоні<br><br><b>Математика росту:</b><br>Зараз: 48 об'єктів/місяць, виручка 163 800 грн<br>Через рік: +3-я бригада, 72 об'єкти, виручка 245 000 грн<br>Різниця: <b>+81 200 грн/місяць</b> — без збільшення рекламного бюджету',
        question: 'Скільки клієнтів ви втратили за останній рік через незадоволеність або просто "пропали"? Яка ціна цих втрат у гривнях?',
    },
],

}; // кінець TOURS

// ── Переклади туру (title/pitch/question по мовах) ──────────
// UA — основний (в TOURS вище). Тут тільки інші мови.
const TOURS_I18N = {

ru: {
furniture_factory: [
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Мой день — сердце системы',
      pitch:'Каждый сотрудник видит свои задачи на сегодня. Тарас (мастер) открыл систему утром и знает что делать — без вашего звонка и «что мне сегодня делать?»',
      question:'Как сейчас ваши мастера узнают что им делать каждое утро?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI в задачах — выполняют с первого раза',
      pitch:'Задача приходит в телефон: что сделать, до когда, какой результат. Если непонятно — там же инструкция и AI который подскажет шаги. Забыть или "не увидеть" невозможно.<br><br>Но главное — перед тем как задача уйдёт исполнителю, AI проверяет: понятно ли написано, хватает ли деталей. Чтобы человек не догадывался что имел в виду владелец — а просто выполнял.<br><br>AI не управляет людьми. Он просто не даёт ставить кривые задачи.',
      question:'Сколько времени у вас уходит на объяснение задач и ответы на вопросы "а что ты имел в виду?"' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Отклонённые задачи — живой контроль',
      pitch:'Владелец отклонил план закупок — «Бюджет превышен на 18 000 грн, сократить позиции». Система сохраняет причину и задача возвращается исполнителю. Никаких устных разговоров — всё в системе.',
      question:'Когда вы возвращаете работу на доработку — как вы объясняете причину сейчас?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Задачи — полная картина',
      pitch:'22 задачи распределены между 8 сотрудниками. Каждая имеет: исполнителя, функцию, дедлайн, ожидаемый результат и время выполнения. Владелец видит кто что делает без совещаний.',
      question:'Сколько сейчас у вас активных задач? Где они фиксируются — в голове, в телефоне, в Excel?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Просроченные задачи',
      pitch:'Сразу видно кто просрочил и насколько. ТО станков не сделано уже 1 день — риск поломки во время производства. Система показывает где возникает пожар ДО того как он вспыхнет.',
      question:'Как вы сейчас отслеживаете просроченные задачи? Кто-то вам докладывает или вы сами выявляете?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процессы — стандарт производства',
      pitch:'Заказ кухни Ковалёвых сейчас на шаге 4 из 9 — «Подписание договора». Каждый шаг назначен конкретному человеку. Если Ирина заболеет — кто-то другой открывает систему и видит что делать дальше.',
      question:'Что происходит с заказом если ваш ключевой менеджер заболел?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Процесс — 9 шагов от заявки до монтажа',
      pitch:'От первого звонка клиента до подписанного акта — 9 стандартных шагов. Замер, 3D-проект, договор, материалы, производство, ВТК, монтаж. Новый сотрудник на 3-й день уже знает весь цикл.',
      question:'Сколько времени занимает введение нового менеджера в ваш процесс продаж?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.28 9.5 19.79 19.79 0 01.22 1.1 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.66-.66a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> CRM Todo — звонки на сегодня',
      pitch:'Система сама подсказывает кому позвонить сегодня. Бойко ждёт замер, Гриценко — коммерческое предложение. Менеджер открывает CRM и видит конкретный список — без поиска по переписке.',
      question:'Как сейчас ваши менеджеры знают кому нужно перезвонить сегодня?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> CRM — воронка продаж',
      pitch:'14 сделок в воронке на общую сумму 985 000 грн. Сразу видно где «затор» — 3 сделки застряли на стадии «Проектирование» больше недели. Вы видите это одним взглядом, а не спрашиваете менеджера.',
      question:'Сколько сейчас сделок в вашей воронке? Вы можете назвать сумму прямо сейчас?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Аналитика — 12 недель динамики',
      pitch:'Выручка растёт: 63 000 → 72 000 грн/неделю за 3 месяца (+14%). Конверсия 38% — ниже цели 45%. Сразу видно где проблема и где рост. Это не Excel отчёт который готовят 2 дня — данные обновляются в реальном времени.',
      question:'Сколько времени у вас уходит на подготовку еженедельного отчёта по продажам?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цели и факт',
      pitch:'Зелёным — достигаем цели. Красным — отстаём. Конверсия 38% при цели 45% — красная. Владелец видит это без совещаний и вопросов. Менеджер сам видит где он отстаёт от плана.',
      question:'Ваши менеджеры знают свои KPI? Они сами отслеживают достижение целей?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 8 функций бизнеса',
      pitch:'Весь бизнес разбит на 8 функций: от привлечения клиентов до управления. Каждая функция имеет владельца, задачи и KPI. Вы видите структуру бизнеса как карту — где есть провалы, где всё под контролем.',
      question:'Если я попрошу вас нарисовать структуру вашего бизнеса прямо сейчас — сколько минут это займёт?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Команда — загрузка каждого',
      pitch:'Тарас загружен на 87% — норма. Катерина имеет 1 просроченную задачу. Ирина выполняет 100% вовремя. Вы видите кто перегружен, кто недогружен — без совещаний и личных вопросов.',
      question:'Как вы понимаете что конкретный сотрудник перегружен — когда он вам об этом скажет?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Финансы — полный контур',
      pitch:'Доходы, расходы, прибыль в реальном времени. 287 500 грн выручки, 58 400 грн чистой прибыли, маржа 31.2%. 3 счёта, 27 транзакций за 3 месяца. Бухгалтер больше не носит бумаги — всё в системе.',
      question:'Вы сейчас знаете свою чистую прибыль за прошлый месяц? За сколько времени вы это узнаете?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Регулярные платежи — ничего не забыто',
      pitch:'9 регулярных платежей автоматически напоминают когда и сколько оплатить. Аренда 18 000 грн — 1-го числа. Зарплата Тараса 28 000 — 25-го. Вы не пропустите ни одного платежа.',
      question:'Бывало ли что вы забыли вовремя оплатить счёт или зарплату?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Финансовое планирование',
      pitch:'Цель на март — 320 000 грн. Факт — 287 500. Отставание 32 500 грн — видно сразу. Вы планируете апрель с учётом мартовских результатов. Финансовая дисциплина без бухгалтера который «посчитает когда-нибудь».',
      question:'У вас есть финансовый план на следующий месяц? На бумаге, в Excel или в голове?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Склад — материалы под контролем',
      pitch:'Клей ПВА — 2 канистры, минимум 3. Система автоматически показывает «Требует заказа». Производство никогда не остановится из-за отсутствия материала — система предупредит заранее.',
      question:'Останавливалось ли у вас производство из-за того что закончились материалы?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Склад — перемещения и инвентаризация',
      pitch:'Образцы фасадов перемещены из цеха в шоурум — операция зафиксирована. Ежемесячная инвентаризация показала отклонение -2 листа ЛДСП. Вы знаете где каждая единица материала. Склад больше не «чёрная дыра».',
      question:'Как часто у вас проводится инвентаризация? Вы знаете фактические остатки прямо сейчас?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Поставщики — вся база в системе',
      pitch:'Кромтех, Blum Ukraine, ПВХ-Декор, МеталПроф, Hafele — контакты, условия, заметки по каждому. Новый закупщик открывает систему и знает где и что заказывать без вопросов к владельцу.',
      question:'Если ваш закупщик уволится завтра — где находятся контакты поставщиков?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg> Смета — считаем точно',
      pitch:'Кухня Ковалёвых — 11 позиций материалов + работа = 87 500 грн. Менеджер вводит размеры кухни — система автоматически считает потребность в материалах по нормам. Больше никаких «на глазок» и потерь маржи.',
      question:'Как сейчас ваши менеджеры считают смету клиенту — на калькуляторе, в Excel?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Бронирование — онлайн запись на замер',
      pitch:'Клиент заходит на сайт и сам выбирает удобное время для выездного замера. 6 записей на этой неделе уже есть. Менеджер не тратит время на «а когда вам удобно» — система делает это автоматически.',
      question:'Сколько времени ваш менеджер тратит на согласование времени выезда к клиенту?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Координации — совещания с результатом',
      pitch:'4 регулярных совещания: ежедневный стенд-ап цеха 08:00, еженедельное совещание производство+продажи, совет владельца каждую пятницу. Каждое совещание имеет повестку, решения фиксируются. Совещания больше не «поговорили и разошлись».',
      question:'Ваши совещания имеют зафиксированный результат? Или через неделю никто не помнит что решили?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI Ассистент — знает ваш бизнес',
      pitch:'AI знает что МебельМастер производит мебель на заказ, что цель — 320 000 грн/мес, что конверсия отстаёт от плана. Вы спрашиваете «что не так с продажами этого месяца» — AI даёт ответ на основе ваших реальных данных.',
      question:'Представьте что у вас есть аналитик который всегда знает все цифры и может ответить на любой вопрос за 10 секунд.' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобильная версия',
      pitch:'Владелец проверяет показатели с телефона в 7 утра. Мастер закрывает задачи на объекте. Менеджер просматривает сделки между встречами. Система работает одинаково хорошо на телефоне и компьютере.',
      question:'Где вы обычно проверяете состояние бизнеса — за компьютером или с телефона?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg> Что дальше — система на автопилоте',
      pitch:'За 65 дней внедрения бизнес переходит на автопилот: каждый знает что делать, владелец видит картину в реальном времени, ни одна задача не потеряна, ни один клиент не забыт. Это не программа — это система управления бизнесом.',
      question:'Как выглядит ваш бизнес через год если каждый день есть такая картина?' },
],

construction_eu: [
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Мой день — прораб знает план',
      pitch:'Олег (прораб) открыл систему в 8:00 и видит: выезд на Клименко в 9:00, осмотр качества Бойко в 14:00, выплата бригаде в 17:00. Без звонка от владельца. Без «что мне сегодня делать?»',
      question:'Как сейчас ваши прорабы узнают что им делать на каждом объекте каждое утро?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI в задачах — выполняют с первого раза',
      pitch:'Задача приходит в телефон: что сделать, до когда, какой результат. Если непонятно — там же инструкция и AI который подскажет шаги. Забыть или «не увидеть» невозможно.<br><br>Перед тем как задача уйдёт прорабу, AI проверяет: понятно ли написано, хватает ли деталей. Чтобы человек не догадывался — а просто выполнял.<br><br>AI не управляет людьми. Он просто не даёт ставить кривые задачи.',
      question:'Сколько времени у вас уходит на объяснение задач и ответы на вопросы «а что ты имел в виду?»' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Отклонённые — смета возвращена',
      pitch:'Владелец отклонил смету Ковалёвых — «Занижена стоимость работ на 15%, пересмотреть нормы». Система сохраняет причину, задача возвращается Дмитрию. Никаких звонков и переспросов — всё письменно в системе.',
      question:'Когда вы возвращаете работу на доработку — как вы объясняете причину сейчас?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Задачи — 4 объекта параллельно',
      pitch:'25 задач между 12 исполнителями. Бойко, FinTech, Петренко, Сидоренко — 4 объекта одновременно. Каждая задача имеет исполнителя, объект, дедлайн и ожидаемый результат. Владелец видит всю картину без звонков прорабам.',
      question:'Сколько сейчас у вас активных объектов? Вы можете назвать статус каждого прямо сейчас?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Просроченные — акт не подписан 3 дня',
      pitch:'Акт выполненных работ Тарасенко просрочен 3 дня. Фото для портфолио — 5 дней. Система показывает это сразу — без того чтобы владелец сам выявил или ждал пока кто-то скажет.',
      question:'Как вы сейчас узнаёте что что-то просрочено? Вам кто-то докладывает или вы сами замечаете?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процессы — ремонт без стресса',
      pitch:'Квартира Бойко — шаг 9 из 12 (чистовые работы). Офис FinTech — шаг 5 из 9 (монтажные). Каждый шаг назначен конкретному человеку. Если прораб заболел — кто-то другой открывает систему и видит что делать дальше.',
      question:'Что происходит с объектом если ваш прораб внезапно заболел?' },
    { title:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Ремонт под ключ — 12 шагов',
      pitch:'Замер → КП → Договор → Аванс → Демонтаж → Черновые работы → Коммуникации → Стяжка → Стены → Чистовые → Уборка → Сдача. Новый прораб на 2-й день знает весь процесс. Клиент видит на каком шаге его объект.',
      question:'Сколько времени занимает введение нового прораба в ваш процесс ведения объекта?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.28 9.5 19.79 19.79 0 01.22 1.1 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.66-.66a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> CRM Todo — звонки на сегодня',
      pitch:'Наталья открывает утро и видит: 4 клиента которым нужно позвонить сегодня. Ковалёвы ждут замер, Данченко — встреча в 15:00, Борисенко — новый лид по рекомендации. Никто не потеряется.',
      question:'Как сейчас ваш менеджер помнит кому и когда нужно перезвонить?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> CRM — воронка ремонтов',
      pitch:'14 сделок в воронке: Бойко 245К, FinTech 580К, Петренко 520К — 3 больших объекта в работе. Сразу видно где «затор» и что требует внимания. Общая сумма по всем стадиям — 3,1 млн грн.',
      question:'Сколько сейчас денег «в трубе» у вашего менеджера? Вы знаете эту цифру прямо сейчас?' },
    { title:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналитика — контроль без совещаний',
      pitch:'15 еженедельных и 34 ежемесячных метрики. Объектов сданных вовремя — 87% при цели 90%. Процент рекламаций — 4.2%. Владелец видит где проблема без звонков и совещаний — данные обновляются в реальном времени.',
      question:'Сколько времени у вас уходит на сбор информации по всем объектам за неделю?' },
    { title:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цели и факт по объектам',
      pitch:'Зелёным — достигаем. Красным — отстаём. NPS 72 при цели 75 — жёлтый. Конверсия 38% при цели 42% — красный. Владелец видит это каждый день без отчётов от менеджеров.',
      question:'Ваши прорабы и менеджер знают свои KPI? Они сами отслеживают где отстают?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 8 функций ремонтного бизнеса',
      pitch:'Маркетинг → Продажи → Проектирование → Выполнение → Снабжение → Финансы → Качество → Управление. Каждая функция имеет владельца, задачи и KPI. Вы видите где есть провал и кто за это отвечает.',
      question:'Если я попрошу вас нарисовать структуру вашего бизнеса прямо сейчас — сколько минут это займёт?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Команда — загрузка 12 человек',
      pitch:'Олег — 4 объекта, 6 задач сегодня. Максим — 3 закупки на этой неделе. Василий — 2 объекта по электрике. Кто перегружен, кто недогружен — видно сразу без личных вопросов.',
      question:'Как вы понимаете что конкретный прораб или мастер перегружен?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Финансы — 3 объекта, 3 счёта',
      pitch:'Приватбанк 485К, Касса 85К, Карта 32К — всего 602 000 грн. Авансы от Бойко, FinTech, Петренко получены. Расходы привязаны к объектам — видна маржа по каждому. Всё без бухгалтера с папками.',
      question:'Вы сейчас знаете маржу по каждому активному объекту? За сколько времени вы это узнаете?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Регулярные платежи — 8 авто-напоминаний',
      pitch:'8 регулярных платежей: аренда склада 12К, зарплата офиса 60К, реклама 8К — система напоминает когда и сколько оплатить. Оксана не держит это в голове и не пропускает ни одного платежа.',
      question:'Бывало ли что вы забыли вовремя оплатить счёт, зарплату или аренду?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Склад — материалы без остановок',
      pitch:'Затирка — 8 кг, минимум 10. Плиточный клей — 10 мешков, минимум 12. Система автоматически показывает что нужно заказать. Объект не остановится из-за нехватки материала — Максим видит это заранее.',
      question:'Останавливался ли у вас объект из-за того что закончились материалы?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg> Смета — считаем до копейки',
      pitch:'Квартира Бойко 65м² — 5 видов работ, смета автоматически: штукатурка стен 165м² + плитка 18м² + ГКЛ 35м² + стяжка 65м² + электромонтаж = 205 500 грн. Дмитрий вводит площадь — система считает сама.',
      question:'Как сейчас ваши сметчики считают объект клиенту — на калькуляторе, в Excel?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Бронирование — клиент сам записывается на замер',
      pitch:'Клиент заходит на сайт и сам выбирает удобное время. 6 записей на этой неделе уже есть. Наталья не тратит время на «а когда вам удобно» — система делает это вместо неё.',
      question:'Сколько времени ваш менеджер тратит на согласование времени выезда к клиенту?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Координации — стенд-ап в 8:00',
      pitch:'4 регулярных совещания: ежедневный стенд-ап прорабов 08:00 (10 мин), еженедельное совещание, оперативка снабжения, отчёт владельцу. Протокол с решениями — через неделю видно кто что выполнил.',
      question:'Ваши совещания имеют зафиксированный результат? Или через неделю никто не помнит что решили?' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 004.5 8v0A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v0A2.5 2.5 0 007 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16v0a2.5 2.5 0 002.5-2.5v-3A2.5 2.5 0 0014.5 8v0A2.5 2.5 0 0012 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI Ассистент — знает ваш бизнес',
      pitch:'AI знает что БудМайстер делает ремонты под ключ, что цель — 520К/мес, что NPS сейчас 72 при цели 75. Спрашиваете «почему задерживается объект Петренко» — AI смотрит на данные и даёт конкретный ответ.',
      question:'Представьте что у вас есть аналитик который всегда знает состояние каждого объекта и отвечает за 10 секунд.' },
    { title:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобильная версия — контроль с телефона',
      pitch:'Игорь проверяет состояние объектов в 7 утра с телефона. Олег закрывает задачи прямо на объекте. Наталья просматривает сделки между встречами. Система работает одинаково на телефоне и компьютере.',
      question:'Где вы сейчас проверяете состояние бизнеса и объектов — за компьютером или с телефона?' },
    { title:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg> Ремонт без стресса — система на автопилоте',
      pitch:'За 65 дней внедрения: каждый прораб знает свой план, каждый объект ведётся по стандарту, клиент видит что происходит каждый день. Владелец контролирует метрики — не тушит пожары. Ремонт без стресса — для клиента и для вас.',
      question:'Как выглядит ваш бизнес через год если каждый объект ведётся именно так?' },
],
},


autoservice: [
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мой день — каждый мастер знает очерёдность', pitch: 'Алексей (механик) открыл систему в 8:30:<br><br>• <b>09:00</b> — Mazda CX-5 Иванченко: масло Castrol 5W-30 + свечи NGK<br>• <b>11:30</b> — BMW X5 Бойко: полная диагностика подвески<br>• <b>14:00</b> — Toyota Camry Ковальской: тормоза — колодки TRW + диски Brembo<br>• <b>16:30</b> — Ford Focus Марченко: шиномонтаж 4 колеса<br><br>Сергей и Василий видят свою очередь. Если Алексей заболел — Андрей открывает систему и видит перераспределённую очередь.', question: 'Как ваши мастера узнают очерёдность авто? Звонок? WhatsApp? Доска?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> Карточки авто — полная история без бумаг', pitch: 'Mazda CX-5, <b>AA1234BC</b>, VIN: JMZKE1W2500123456, 2019 г.в., пробег <b>85 420 км</b>. Иванченко Михаил.<br><br>История: 15.03 — масло Castrol + фильтры (1 820 грн), 21.06 — воздушный фильтр (820 грн), сегодня — масло + свечи.<br><br>Мастер видит всё до того как клиент открыл рот.', question: 'Где хранится информация по авто? Если клиент говорит "был год назад" — найдёте что делали?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> Заказ-наряд — работы и запчасти в одном документе', pitch: 'Наряд <b>WO-2026-0007</b>, Toyota Camry, Алексей.<br>Работы: колодки 600 + диски 800 + балансировка 280 грн.<br>Запчасти: TRW колодки 720 + Brembo диски ×2 шт 2 700 + DOT4 95 грн.<br><br><b>Итого: 5 195 грн.</b> Клиент подписывает → склад списывается → оплата в финансы.', question: 'Как ведёте учёт по наряду?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Склад запчастей — знаете остатки до ремонта', pitch: '✅ Масло 5W-30 — 22 шт (мин. 8)<br>✅ Фильтры — 35 шт (мин. 15)<br>✅ Колодки TRW — 14 компл. (мин. 5)<br>⚠️ <b>Диски Brembo 280мм — 2 шт (мин. 4) — НИЖЕ МИНИМУМА</b><br><br>Система уведомила Ирину вчера в 18:00. Заказала утром. Диски будут к обеду.', question: 'Сколько раз за месяц клиент ждал ремонта потому что не было запчасти?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Поставщики — вся база в системе', pitch: 'AutoParts Pro — масла/фильтры, доставка 1 день, скидка 12%.<br>MotoZip — Toyota/Mazda, цены -8%.<br>BremboUkraine — диски и колодки, оплата 14 дней.<br>NGK Официальный — свечи, датчики.<br><br>Новый мастер по закупкам не спрашивает где и что заказывать.', question: 'Если мастер по закупкам заболеет — где контакты поставщиков?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.28 9.5 19.79 19.79 0 01.22 1.1 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.66-.66a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> CRM Todo — звонки по ТО сегодня', pitch: 'Ирина открыла утро:<br>📞 Ткаченко Юлия — 120 дней, Hyundai ~114 000 км. Напомнить про масло и антифриз<br>📞 Марченко Василий — Ford Focus, 6 мес после тормозов<br>📞 Кравченко Юрий — Mercedes, запрос на капремонт 60 дней назад (24 000 грн)<br><br>65% клиентов с напоминанием — возвращаются.', question: 'Как отслеживаете клиентов которым скоро нужно ТО?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> CRM — воронка продаж', pitch: 'Воронка: <b>8 сделок на 61 120 грн</b>. Новый: Гриценко (ГРМ, 2 800 грн), Кравченко (капремонт Mercedes, 24 000 грн). На консультации: Бойко (BMW X5, 8 400 грн). Кравченко ждёт 3 дня — нужно перезвонить.', question: 'Сколько сделок в воронке? Можете назвать общую сумму прямо сейчас?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109 9"/><polyline points="3 3 3 12 12 12"/></svg> Win-back — потерянные клиенты возвращаются', pitch: '60+ дней → звонок, напомнить про плановый осмотр.<br>90+ дней → SMS: "Акция на ТО — 10% скидка".<br>Ткаченко Юлия: 120 дней, ~114 000 км — пора менять антифриз.<br><br>65% клиентов с напоминанием — возвращаются.', question: 'Сколько клиентов ушло и не вернулось после первого визита?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 014.5 8A2.5 2.5 0 012 10.5v3A2.5 2.5 0 014.5 16A2.5 2.5 0 017 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16A2.5 2.5 0 0117 13.5v-3A2.5 2.5 0 0014.5 8A2.5 2.5 0 0112 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI в задачах — мастер выполняет с первого раза', pitch: 'Задача: "Заменить масло на Mazda CX-5 Иванченко". AI проверяет: артикул масла? Свечи тоже? Проверить охлаждающую жидкость?<br><br>Нечёткая задача → AI возвращает с комментарием. Мастер выполняет — не догадывается. Результат: 0 уточняющих звонков.', question: 'Сколько времени уходит на объяснение задач?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Отклонённые задачи — причина зафиксирована', pitch: 'Владелец отклонил смету: "Диски Brembo завышены на 18%. Заказать в MotoZip — 2 700 грн вместо 3 200." Причина сохранена. Задача вернулась Ирине. Через 2 дня: новая смета с дисками от MotoZip.', question: 'Когда возвращаете работу на доработку — как объясняете причину?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Задачи — полная картина по СТО', pitch: '14 задач между 7 сотрудниками.<br>🔴 Просроченные (2): Mercedes Кравченко 3 дня, Google Business фото 5 дней.<br>🟡 Сегодня (8): наряды, заказать диски, отчёт.<br>🟢 Неделя (4): BMW диагностика, аттестация Андрея.', question: 'Сколько активных задач? Где фиксируются?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Просроченные — где горит', pitch: '⚠️ Mercedes C200 Кравченко — капремонт 24 000 грн, не перезвонили 3 дня. Каждый день = риск что уйдёт к конкуренту.<br>⚠️ Google Business — последнее обновление 2 месяца назад.', question: 'Как отслеживаете просроченные задачи?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процесс — стандарт обслуживания (8 шагов)', pitch: '1. Запись (15 мин) 2. Приём+осмотр (20 мин) 3. Диагностика+наряд (40 мин) 4. Заказ запчастей (20 мин) 5. Ремонт (60-240 мин) 6. Контроль качества (30 мин) 7. Выдача+оплата (20 мин) 8. Обратная связь через 3 дня (10 мин)<br><br>Алексей заболел → Андрей открывает систему и знает что делать.', question: 'Что происходит если ключевой мастер заболел?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процесс — закупка запчастей (5 шагов)', pitch: '1. Выявление потребности (авто-уведомление) 2. Формирование заказа 3. Отправка+подтверждение 4. Приём+оприходование 5. Оплата поставщику<br><br>Новый мастер по закупкам на 3-й день знает весь процесс.', question: 'Если мастер по закупкам уйдёт в отпуск — кто и как будет заказывать?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналитика — 12 недель динамики', pitch: '📈 Выручка: 28 400 → 34 800 грн/нед. (+23%)<br>📈 Нарядов: 18 → 24/нед. (+33%)<br>📈 Средний чек: 1 240 → 1 520 грн (+22%)<br>📈 Загрузка: 62% → 82%<br>🔴 Возврат клиентов: 58% (цель 60%)', question: 'Сколько времени занимает подготовка еженедельного отчёта?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цели и факт', pitch: '🟢 Выручка 34 800 — цель 35 000<br>🟢 Средний чек 1 520 — цель 1 400 (перевыполнено)<br>🔴 Возврат 58% — цель 60%<br>🟢 Загрузка 82% — цель 80%<br>🔴 Google рейтинг 4.4 — цель 4.6', question: 'Ваши мастера знают свои KPI?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 8 функций СТО', pitch: '0. Маркетинг (Ирина) 1. Продажи и запись (Ирина) 2. Приём+диагностика (Алексей) 3. Ремонт (Алексей, Сергей, Василий) 4. Склад+закупки (Ирина) 5. Финансы (Елена) 6. Команда (Ирина) 7. Управление (владелец)', question: 'Нарисовать структуру СТО прямо сейчас — сколько минут займёт?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Команда — загрузка каждого мастера', pitch: '🔴 Алексей — 4 наряда, 7.5 ч. Перегружен.<br>🟢 Сергей — 2 наряда, 4 ч. Может взять ещё.<br>🟡 Василий — 3 шиномонтажа, 5 ч. Норма.<br>🟢 Андрей — 1 наряд, 2 ч. Свободен → направить Кравченко.', question: 'Как понимаете что мастер перегружен?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Финансы — прибыль без Excel', pitch: 'Апрель: выручка 145 000, запчасти 48 000, зарплата 28 000, аренда 18 000, реклама 3 200, коммунальные 4 800.<br><br><b>Прибыль: 43 000 грн (29.7%)</b>. Каждая оплата наряда → в финансы автоматически.', question: 'Знаете чистую прибыль за прошлый месяц? За сколько времени узнаете?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Регулярные платежи — ничего не забыто', pitch: '8 платежей: аренда 18 000 (1-го), зарплата Алексея 14 000 (25-го), зарплата Сергея 12 000 (25-го), Google Ads 1 500 (5-го), AutoParts Pro (15-го)...<br><br>Система напоминает. Елена не держит в голове.', question: 'Бывало что забывали оплатить аренду или зарплату?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Финансовое планирование', pitch: 'Цель апреля — 150 000 грн. Факт — 145 000 грн. Отставание 5 000 грн.<br>Причина: неделя 3 — меньше записей (дожди). Решение: SMS "Весеннее ТО — 10% скидка".<br>Май: цель 160 000 грн.', question: 'Есть финансовый план на следующий месяц?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Координации — совещания с результатом', pitch: '• Ежедневно 8:30 — стенд-ап мастеров (10 мин)<br>• Понедельник 9:00 — планирование недели<br>• Пятница 17:00 — отчёт владельцу<br><br>Каждое совещание — повестка и протокол решений.', question: 'Ваши совещания имеют зафиксированный результат?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 014.5 8A2.5 2.5 0 012 10.5v3A2.5 2.5 0 014.5 16A2.5 2.5 0 017 18.5v1a2.5 2.5 0 005 0v-1A2.5 2.5 0 0014.5 16A2.5 2.5 0 0117 13.5v-3A2.5 2.5 0 0014.5 8A2.5 2.5 0 0112 5.5v-1A2.5 2.5 0 009.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI Ассистент — знает ваш СТО', pitch: 'AI знает: 6 мастеров, 3 подъёмника, цель 160 000 грн/мес.<br><br>Вы: "Почему неделя слабее?"<br>AI: "Среда и четверг — 4 наряда вместо 7 из-за дисков Brembo. Рекомендую поднять минимум с 2 до 6 шт."', question: 'Представьте аналитика который знает все цифры. Какой первый вопрос?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобильная версия — контроль с телефона', pitch: 'Владелец в 7:30: выручка 9 240 грн ✅, просроченных 2 ⚠️, загрузка 82%, записей завтра 8.<br><br>Алексей в яме закрывает наряд с телефона. Ирина в отпуске отвечает клиентам.', question: 'Где проверяете состояние бизнеса — компьютер или телефон?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg> АвтоМастер на автопилоте — через 65 дней', pitch: '✅ Мастера знают очередь без звонков<br>✅ Запчасти заказываются до того как закончились<br>✅ Ткаченко, Марченко, Олийник вернулись<br>✅ Кравченко записал Mercedes (24 000 грн)<br>✅ Google 4.6<br>✅ P&L утром в телефоне<br><br><b>Выручка: 145 000 → 290 000 грн/мес. за год.</b>', question: 'Как выглядит ваш СТО через год? Что меняется лично для вас?'}
],

horeca: [
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мой день — кухня и зал не конфликтуют', pitch: 'Иван (шеф-повар) открыл систему в 7:30: заготовить 30 порций борща до 11:00, сварить 5 кг пюре до 12:00, принять поставщика в 9:00. Татьяна (официант): сервировка зала до 10:30, банкет в 13:00. Алина (кассир): открыть смену в 9:00, касса на начало 500 грн. Каждый знает что делать — без утренней планёрки.', question: 'Как ваша команда узнаёт задачи на смену? Сколько времени занимает утренняя планёрка?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg> Смена — открыли, отработали, закрыли без расхождений', pitch: 'Алина открыла смену в 9:00, касса: 500 грн. За день: 22 чека, выручка 5 300 грн — наличные 3 200 грн + терминал 2 100 грн. Средний чек 241 грн. Закрыла смену в 21:30, касса на конец 3 700 грн. Владелец видит итог в телефоне — без звонка сколько сделали сегодня.', question: 'Сколько времени занимает закрытие смены? Бывали расхождения между кассой и реальностью?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/></svg> Меню в системе — чек за 10 секунд', pitch: 'Стол 3: борщ с пампушками (85 грн) + котлета по-киевски (145 грн) + капучино (75 грн) + пюре (45 грн) = 350 грн. Алина выбрала позиции из меню — нажала Провести. Клиент платит картой — готово. Весь чек: 10 секунд. Никакого подождите пока я посчитаю.', question: 'Как происходит расчёт с клиентом? Бывало что ошибались в сумме?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Склад продуктов — заказываете до того как закончилось', pitch: 'Мука: 48 кг, минимум 20 кг — хорошо. Мясо: 28 кг — ок. Капуста: 12 кг, минимум 20 кг — НИЖЕ МИНИМУМА, уведомление отправлено. Повар говорит администратору заказать сегодня. Завтра есть из чего готовить борщ.', question: 'Сколько раз за месяц повар приходит утром и говорит не из чего готовить — не заказали вовремя?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> Постоянные гости — знаете их и они это чувствуют', pitch: 'Марина: 12 визитов за месяц, средний чек 285 грн, накоплено 340 баллов из 500. Следующий заказ с кофе бесплатно. Игорь: не приходил 18 дней — система поставила задачу отправить SMS: Скучали по вам, кофе в подарок. Марина возвращается потому что её помнят.', question: 'Как отличаете постоянных гостей от случайных? Кто удерживает их когда они пропадают?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Финансы — владелец видит прибыль без звонков', pitch: 'Вчера: выручка 5 300 грн, продукты 1 590 грн, зарплата 1 200 грн, аренда 600 грн, коммунальные 180 грн. Прибыль дня: 1 730 грн. Сравнение с прошлым вторником: +340 грн (+24%). Владелец открывает телефон в 8:00 — уже видит эту картину.', question: 'Как узнаёте сколько реально заработали за вчера? Сколько времени это занимает?'},
],

logistics: [
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мой день — диспетчер не держит всё в голове', pitch: 'Елена (диспетчер) открыла систему в 7:00: Николай — Киев→Львов, выезд в 8:00, стройматериалы 8т, ООО БудМайстер; Сергей — Харьков→Одесса, зерновые 20т; Андрей — ожидает загрузки в Днепре. Каждый водитель видит маршрут, адрес, контакт клиента. Без 8 звонков утром.', question: 'Сколько звонков между диспетчером и водителями до 10:00 утра? Что происходит если диспетчер заболел?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Рейс — тариф, расходы, прибыль в одном документе', pitch: 'Рейс Киев→Львов, стройматериалы 8т, водитель Николай. Тариф: 9 500 грн. Расходы: топливо 1 400 грн + платные дороги 540 грн + водитель 1 500 грн = 3 440 грн. Прибыль: 6 060 грн (64%). Владелец видит рентабельность каждого рейса — не в целом за месяц, а конкретно Киев→Львов против Харьков→Одесса.', question: 'Знаете прибыль с каждого рейса отдельно? Или только общую прибыль за месяц?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5c.4 0 .9-.2 1.2-.5l2.8-2.8c.3-.3.5-.7.5-1.2V7"/><path d="M14 7H4"/><circle cx="18" cy="7" r="3"/></svg> Водители — прозрачный расчёт без споров', pitch: 'Николай (водитель): за май — 4 рейса, оплата = 1 500 + 2 000 + 1 200 + 1 600 = 6 300 грн. Водитель видит детали по каждому рейсу — никаких споров. Расчёт прозрачный, документ есть. Владелец формирует выплату без Excel.', question: 'Как рассчитываете зарплату водителей? Бывало что водитель оспаривал сумму?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Клиенты-грузоотправители — знаете кто приносит деньги', pitch: 'ООО БудМайстер: 6 рейсов за 3 месяца, выручка 57 000 грн, всегда платит вовремя. ФОП Иванченко Логистик: 2 рейса, выручка 22 000 грн, просрочка оплаты 12 дней. Вкладка Рейсы в карточке клиента — вся история: маршруты, суммы, статусы оплаты.', question: 'Кто ваш самый прибыльный клиент за последние 3 месяца? Можете назвать цифру прямо сейчас?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Финансы — рентабельность по направлениям', pitch: 'Май: 6 рейсов, выручка 57 000 грн, расходы 20 640 грн, амортизация 4 800 грн, зарплата диспетчера 15 000 грн. Прибыль: 16 560 грн, маржа 29%. Харьков→Одесса: маржа 47%. Киев→Полтава: маржа 18%. Владелец перераспределяет рейсы на более выгодные направления.', question: 'Знаете рентабельность по конкретным направлениям? Или только общая цифра?'},
],

food_production: [
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мой день — каждый знает своё задание без звонков', pitch: 'Галина (технолог) в 7:30 открыла систему:<br><br><b>Оксана:</b> Борщ 100 порций до 10:30 → Кейтеринг (60) + СмакО (40); Суп 40 порций до 10:30<br><b>Николай:</b> Бизнес-ланч 80 компл. до 11:30 → TechHub (срочно!); Котлеты 30 порций до 14:00<br><b>Ирина:</b> Хлеб 30 буханок — выезд в 7:30 (уже в пути); Брауни 48 порций до 15:00<br><b>Татьяна:</b> Счёт больнице до 9:00; Подтвердить заказ СмакО до 12:00<br><br>Ни одного звонка.', question: 'Как команда узнаёт план производства? Сколько звонков до 9:00?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Задачи — каждая с результатом, не просто списком', pitch: 'Задача: <i>Борщ классический 100 порций до 10:30</i><br>Исполнитель: Оксана Ковальчук<br>Результат: <i>"100 порций в маркированных контейнерах на полке, температура +4°C проверена, накладная подготовлена"</i><br><br>Если Оксана заболела — любой открывает задачу и понимает что делать без звонков владельцу.', question: 'Если ключевой повар заболел в 7:00 — кто-то другой сможет без звонка понять что и как сделать?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Просроченные — потери в гривнях', pitch: '⚠️ <b>Магазин Марченко — увеличить хлеб до 25 буханок</b> (2 дня) → −4 500 грн/мес<br>⚠️ <b>Обновить техкарту котлет</b> — новые нормы МОЗ (3 дня) → риск штрафа СЭС<br>⚠️ <b>Переговоры Школа №145</b> (1 день) → потенциал 285 000 грн/год<br><br>Система показывает не просто "просрочено" — а сколько это стоит бизнесу.', question: 'Сколько денег бизнес теряет из-за просроченных задач? Есть эта цифра?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Рецептура — брутто, нетто, отходы и себестоимость', pitch: 'Борщ классический (100 порций):<br><br>Свинина лопатка → 1 650 г брутто → 1 500 г нетто → 150 г отходов (9%) → 185 грн/кг → 27.75 грн<br>Свёкла → 3 300 г → 3 000 г → 300 г → 14 грн/кг → 4.20 грн<br>Картофель → 2 780 г → 2 500 г → 280 г → 12 грн/кг → 3.00 грн<br>Прочие ингредиенты → 7.87 грн<br><br><b>Себестоимость: 4.82 грн/порция. Цена 95 грн. Маржа 95%</b><br><br>Отходы учтены — цена точная, не "приблизительно".', question: 'В вашей рецептуре учтены отходы? По брутто или нетто? Разница — до 15% в себестоимости.'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> ОП-1 — калькуляционная карта для СЭС одним кликом', pitch: 'Уникальная функция только для пищевого производства.<br><br>Заполнили рецептуру → нажали <b>"ОП-1"</b> → система формирует официальную калькуляционную карту:<br><br>Таблица: № / Ингредиент / Ед. / Брутто / Нетто / Цена / Сумма<br>Итого на порцию: 4.82 грн | Цена продажи: 95.00 грн | Торговая надбавка: 1870%<br>Место подписи технолога, заведующего, руководителя.<br><br><b>Документ готов для печати. 10 секунд.</b>', question: 'Где хранятся технологические карты? Сколько времени занимает ОП-1 вручную для новой позиции?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> HACCP — температурные журналы без бумаг', pitch: 'Ежедневное задание в 7:00: <b>"Проверить критические точки HACCP"</b><br><br>Галина вносит в телефоне:<br>• Мясо: +2°C ✅ | Молочные: +4°C ✅ | Морозилка: −18°C ✅<br>• Температура цеха: +18°C ✅ | Готовая продукция: +65°C ✅<br><br>Выход за норму → автоматическое уведомление владельцу.<br>При проверке СЭС — журнал за любой день в один клик. Штраф за нарушение HACCP — от 17 000 грн.', question: 'Как сейчас ведутся журналы HACCP? Есть журнал за позавчера при внезапной проверке?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Себестоимость в динамике — мясо подорожало, маржа упала', pitch: 'Февраль: свинина 160 → 185 грн/кг (+16%)<br><br>Борщ: себестоимость 4.20 → 4.82 грн (+0.62) — незначительно<br>Котлета: себестоимость 21.40 → 25.80 грн (+4.40)<br>Маржа котлеты: 71.5% → 65.6% — <b>падение 6 пп!</b><br><br>Система показала это сразу. Владелец поднял цену с 75 до 82 грн — маржа восстановилась до 68.5%.', question: 'Когда цена на мясо меняется — вы сразу знаете влияние на маржу каждого блюда? Или узнаёте в конце месяца?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> План производства — что, сколько, для кого, к какому времени', pitch: '🟡 <b>Запланировано:</b> Борщ 100 порц. → Кейтеринг (60) + СмакО (40), 11:00; Бизнес-ланч 80 → TechHub, 11:30 (!)<br>🟠 <b>В работе:</b> Брауни 48 порц. → СмакО Подол, 15:00; Хлеб 30 бух. → Марченко ✅ доставлено<br>✅ <b>Выполнено:</b> Котлеты 50 порц. → Больница, доставлено 9:00<br><br>Если TechHub переносит заказ — Татьяна меняет статус, Николай видит сразу.', question: 'Если клиент утром переносит заказ — как быстро повар узнаёт что план изменился?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Стоп-лист — нехватка в 7:30, не в 11:00', pitch: 'Завтра: борщ 150 порций + ланч 100 комплектов. Система проверяет:<br><br>✅ Мясо 3.75 кг — есть 68 кг | ✅ Свёкла 4.95 кг — есть 85 кг<br>⚠️ Капуста — почти лимит<br>❌ <b>МУКА: нужно 15 кг — есть 12 мешков, минимум 20 — НИЖЕ ЛИМИТА</b><br><br>Татьяна видит в 16:00 — заказывает, привезут утром.<br>Без системы: Николай в 11:30 открывает мешок — "муки нет".', question: 'Сколько раз производство останавливалось из-за нехватки сырья за последние 3 месяца?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Автосписание по рецептуре — без блокнота и Excel', pitch: 'Произвели 100 порций борща. Нажали <b>"✓ Готово"</b>. Система списала:<br><br>• Свинина −1.650 кг (ост. 66.350 кг)<br>• Свёкла −3.300 кг (ост. 81.700 кг)<br>• Картофель −2.780 кг (ост. 117.220 кг)<br>• Капуста −2.200 кг (ост. 45.800 кг — <b>ниже минимума, уведомление</b>)<br>• Масло −0.300 л<br><br><b>3 секунды. До грамма. Ноль ручного ввода.</b>', question: 'Как ведётся учёт расхода сырья? Когда последний раз остатки не совпали с реальностью?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8Z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Отгрузка — маршрутный лист водителя автоматически', pitch: 'Сергей в 7:00 открывает телефон:<br><br><b>07:30 — Магазин Марченко</b> | ул. Садовая 12 | хлеб 30 бух. + брауни 12 порц.<br><b>09:00 — Больница №3</b> | ул. Медицинская 45, вход пищеблока | котлеты 50 + пюре 50<br><b>11:30 — TechHub</b> | Крещатик 22, 5 эт. | ланч 80 компл. | СРОЧНО, пропуск на ресепции!<br><br>Никаких звонков "куда ехать и что везти".', question: 'Сколько звонков между водителем и менеджером каждое утро для составления маршрута?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процесс — от заказа до оплаты, 8 шагов', pitch: '1. Приём заказа — Татьяна<br>2. Проверка стоп-листа — система<br>3. Планирование — Галина<br>4. Закупка при необходимости — Сергей<br>5. Производство по рецептуре — Оксана/Николай/Ирина<br>6. Упаковка и маркировка — Сергей<br>7. Отгрузка — накладная<br>8. Счёт — Татьяна, в течение суток<br><br>Если Татьяна уволилась — новый менеджер открывает систему и знает всё.', question: 'Если менеджер уволится — сколько времени займёт ввести нового в процессы?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Клиенты — оптовики с договорами, а не физлица', pitch: '🏆 <b>СмакО (5 точек)</b> — 150 порц./нед., 182 000 грн/год | каждый понедельник до 10:00, отдельный счёт на каждую точку<br>🏥 <b>Больница №3</b> — 96 000 грн/год | диетическое меню, без жареного, без острого<br>🎒 <b>Детсад №48</b> — 48 000 грн/год | СТРОГО без орехов, без мёда (аллергия у 3 детей)<br><br>Все примечания — не в голове менеджера, а в системе.', question: 'Где хранятся особые условия по каждому клиенту? Что если менеджер уволится?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Воронка продаж — новые клиенты в работе', pitch: '🎯 <b>Школа №145</b> — 380 обедов/день, сентябрь-май | переговоры | потенциал <b>285 000 грн/год</b><br>Следующий шаг: встреча в пятницу 10:00 — задача в системе, Татьяна знает<br><br>🎯 <b>Корпорация KPI Group</b> — 50 ланчей ежедневно | КП отправлено | 48 000 грн/мес<br>Следующий шаг: перезвонить в среду если нет ответа', question: 'Сколько потенциальных клиентов "в работе"? Назовите сумму контрактов в переговорах.'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/></svg> Счёт-фактура для юрлиц за 2 минуты', pitch: 'Отгрузили СмакО (еженедельный):<br>• Борщ 150 порц. × 95 = 14 250 грн<br>• Котлета 80 порц. × 75 = 6 000 грн<br>• Пюре 80 порц. × 35 = 2 800 грн<br>• Хлеб 20 бух. × 45 = 900 грн<br><b>INV-2026-0012 — 23 950 грн</b><br><br>Татьяна выставила за 2 минуты. Email автоматически. Оплата → в финансах.', question: 'Как выставляете счёт юрлицу? Сколько времени от отгрузки до получения денег?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Финансы — себестоимость vs выручка по каждому блюду', pitch: '<b>Апрель P&L:</b><br>Выручка: 430 800 грн<br>Расходы: сырьё 86 400 + зарплата 38 000 + аренда 18 000 + прочие 13 200 = 155 600 грн<br><b>Прибыль: 275 200 грн (маржа 64%)</b><br><br>По блюдам: Борщ 95% | Брауни 63% | Бизнес-ланч 58% | Хлеб 42%<br><br>Вывод: больше борща, меньше хлеба.', question: 'Знаете рентабельность по каждому блюду? Какое самое прибыльное прямо сейчас?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Регулярные платежи — ни один не забыт', pitch: '📅 1-го: Аренда цеха 120м² — 18 000 грн<br>📅 5-го: Зарплата 6 чел. — 38 000 грн<br>📅 15-го: Газ+электро — 8 400 грн; Упаковка — 4 800 грн<br>📅 Ежеквартально: Сертификат HACCP — 3 200 грн; ТО оборудования — 2 400 грн<br><br>Система напоминает за 3 дня до каждого платежа.', question: 'Бывало что забыли оплатить аренду, зарплату или сертификат HACCP?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналитика — 12 недель динамики', pitch: 'Борщ: 600 → 900 → 1 050 порц./нед. (+75% за квартал)<br>Брауни: стабильно 360, маржа 63%<br>Хлеб: 600 бух./нед., маржа 42% — самая низкая<br><br>По клиентам: СмакО +12 000 грн/мес (открыли 2 точки); TechHub растёт → потенциал ланчи 80 → 120<br><br>Видно где рост и где потолок.', question: 'Какое блюдо растёт а какое стоит? Где эта динамика — в Excel, в голове?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — цели и факт, зелёным и красным', pitch: '🟢 Средняя маржа: 68% при цели 65% — перевыполнено!<br>🟢 Вовремя отгружено: 98% — в цели<br>🟡 Выручка: 46 200 при цели 48 000 (96%)<br>🟡 Порций/нед.: 1 520 при цели 1 500<br>🔴 Активных клиентов: 6 при цели 8 — отставание<br><br>Владелец и команда видят без совещаний.', question: 'Команда знает свои KPI? Галина знает что маржа 68% — выше цели?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Команда — кто загружен, кто свободен', pitch: 'Загруженность сегодня:<br>Галина 87% — норма | Оксана 75% — есть резерв | Николай 100% — полная нагрузка<br>Ирина 83% | Татьяна 50% — может взять дополнительное | Сергей 67%<br><br>Если придёт заказ Школы №145 — Оксана и Татьяна могут взять больше. Николай — нет.', question: 'Если придёт большой заказ завтра — знаете кто может взять дополнительную нагрузку?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Координации — планёрка в 7:30, 15 минут', pitch: '⏰ <b>Ежедневная 7:30, 15 мин</b> — Галина + все повара: план дня, стоп-лист, особые заказы<br>⏰ <b>Еженедельная пн 9:00, 30 мин</b> — Галина + Татьяна + владелец: выручка, клиенты, проблемы<br>⏰ <b>Месячный обзор 1-го</b> — P&L, маржа по блюдам, цели<br><br>Протокол с решениями — через неделю видно кто что выполнил.', question: 'Совещания имеют зафиксированный результат? Через неделю кто-то помнит что решили в 7:30?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобильная — Галина с телефона, Сергей с маршрута', pitch: '<b>Галина в 7:30 (дома):</b> открывает план → видит стоп-лист → заказывает муку до приезда<br><b>Сергей (между доставками):</b> отмечает выполненные → получает изменения маршрута<br><b>Владелец в 8:00:</b> выручка вчера + план сегодня + критические ситуации<br><b>Оксана на кухне:</b> проверяет рецептуру → отмечает выполнение → склад обновляется', question: 'Команда работает с системой с телефона? Или только с компьютера в офисе?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1A2.5 2.5 0 0 1 14.5 8A2.5 2.5 0 0 1 17 10.5v3A2.5 2.5 0 0 1 14.5 16A2.5 2.5 0 0 1 12 18.5v1a2.5 2.5 0 0 1-5 0v-1A2.5 2.5 0 0 1 4.5 16A2.5 2.5 0 0 1 2 13.5v-3A2.5 2.5 0 0 1 4.5 8A2.5 2.5 0 0 1 7 5.5v-1A2.5 2.5 0 0 1 9.5 2z"/><path d="M12 5.5v13"/><path d="M7 8.5h10"/><path d="M7 13.5h10"/></svg> AI — знает рецептуру, клиентов и маржу', pitch: '<i>"Маржа котлеты упала до 55%?"</i> AI: <i>"Мясо подорожало +25 грн/кг. Варианты: 1) поднять цену до 88 грн (маржа 72%); 2) изменить пропорцию свинина/говядина (−3.20 грн соб.); 3) больше борща вместо котлеты. Рекомендую вариант 1."</i><br><br><i>"TechHub просит 120 ланчей?"</i> AI: <i>"Николай на 100%. Нужен помощник или перенос брауни. +40 ланчей = +5 400 грн/день."</i>', question: 'Консультант который знает рецептуру и склад и отвечает за 10 секунд. Какой первый вопрос?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> 8 функций пищевого производства', pitch: '0. Маркетинг/продажи — Татьяна<br>1. Приём заказов — Татьяна<br>2. Производство/Кухня — Галина, Оксана, Николай, Ирина<br>3. Склад/закупки — Сергей+Татьяна<br>4. Отгрузка — Сергей<br>5. Финансы — владелец+Татьяна<br>6. Команда/HACCP — Галина<br>7. Управление/развитие — владелец<br><br>Каждая функция имеет владельца, задачи и KPI.', question: 'Все функции бизнеса имеют ответственного? Кто отвечает за HACCP и за привлечение новых клиентов?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg> КухняПро на автопилоте — через 65 дней', pitch: '✅ Галина в 7:30 — план уже есть<br>✅ HACCP — без стресса при проверке СЭС<br>✅ Мука кончается в 7:30 — заказали до обеда<br>✅ Мясо дорожает — маржа пересчитана сразу<br>✅ Счёт СмакО за 2 минуты<br>✅ Школа №145 подписала контракт — 380 обедов/день<br>✅ P&L в телефоне в 8:00<br><br><b>430 000 → 860 000 грн/мес. за год.</b><br>Математика: +школа (285К) + ещё 2 клиента.', question: 'Как выглядит бизнес через год если каждый день есть такая картина?'},
],



cleaning: [
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мой день — бригада знает маршрут без звонков', pitch: 'Екатерина (бригадир №1) в 7:30 открыла телефон — без единого звонка знает весь день:<br><br><b>08:30 — БЦ "Панорама", 3-й этаж</b><br>450 м² | Еженедельное (абонемент) | 2.5 ч | Бригада: Екатерина+Ирина+Оля<br>Химия: FloorPro (паркет), SaniMax (санузлы) | Контакт: Марина +38067...<br><br><b>12:00 — Квартира Ковальчук, Садовая 12</b><br>87 м² | Генеральная после ремонта | 4 ч | Екатерина+Оля<br>Код домофона: 1234# | Паркет — средство БЕЗ АММИАКА ⚠️<br><br><b>17:00 — Офис ООО "Альфа", Крещатик 22</b><br>120 м² | Ежедневная вечерняя | 1.5 ч | Ирина', question: 'Как сейчас бригады узнают маршрут и объекты на день? Сколько звонков до 8:30?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Задачи — каждый объект с конкретным результатом', pitch: 'Задача: <i>БЦ "Панорама" — еженедельная уборка</i><br>Исполнитель: Екатерина Мельник | Дедлайн: сегодня 11:00<br>Ожидаемый результат: <i>"Полы — без пятен и мусора, блеск на плитке. Санузлы — продезинфицированы, зеркала чистые. Кухня — раковина и микроволновка. Ковёр на входе — пропылесосить. Фото до/после прикреплено. Клиент подписал чек-лист."</i><br><br>Если Екатерина не отметит выполнение до 11:15 — Татьяна получит уведомление.', question: 'Как сейчас фиксируется что объект убран качественно? Есть стандарт что именно и как должно быть сделано?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a1.5 1.5 0 0 0 1.5-1.5v-5.5"/><path d="M14 7H4"/><circle cx="18" cy="7" r="3"/></svg> Маршрут бригад — оптимально, без лишних километров', pitch: '<b>Бригада №1 (Екатерина, Ирина, Оля) — Vito AA1234BC:</b><br>🔵 8:30 БЦ "Панорама" (Печерск) → 🟡 12:00 Ковальчук (Подол) → 🟢 17:00 ООО "Альфа" (Крещатик)<br>Общий пробег: 18 км | В дороге: 45 мин<br><br><b>Бригада №2 (Николай, Светлана) — Transit KA5678:</b><br>🔵 9:00 ЖК "Sunrise" кв.47 (Оболонь) → 🟡 13:30 ресторан "Смак" → 🟢 17:30 склад (Дарница)<br>Общий пробег: 34 км<br><br>Порядок объектов оптимизирован. Раньше бригада могла ехать Печерск → Оболонь → Печерск — лишние 40 мин.', question: 'Кто сейчас составляет маршруты бригад? Бывало что бригада едет через весь город между объектами?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> Чек-лист — защита от "вы плохо убрали"', pitch: 'После завершения объекта Екатерина открывает чек-лист в телефоне:<br><br><b>БЦ "Панорама", 3-й этаж:</b><br>✅ Коридор: пол, плинтусы, входная зона<br>✅ Open-space: 24 рабочих места, пол, мусорные корзины<br>✅ Переговорная 1: стол, кресла, доска, окно<br>✅ Кухня: раковина, микроволновка, холодильник снаружи, пол<br>✅ Санузел м.: унитаз, раковина, зеркало, пол, освежитель<br>✅ Санузел ж.: унитаз, раковина, зеркало, пол, освежитель<br><br>Марина (администратор БЦ) подписывает чек-лист пальцем прямо в телефоне Екатерины.<br>Документ сохранён с датой 16.04.2026, временем 10:52, подписью Марины.', question: 'Если клиент говорит "вы не убрали туалет" через 2 дня — как вы доказываете что всё сделали? Без чек-листа это слово против слова.'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Фото до/после — неопровержимое доказательство', pitch: 'Ирина приехала на квартиру Ковальчук после ремонта. Система требует фото ДО:<br><br>📸 Гостиная: пыль от шлифовки, краска на плинтусах<br>📸 Кухня: остатки шпаклёвки на фасадах<br>📸 Ванная: известковый налёт на плитке и сантехнике<br><br>После 4 часов уборки — фото ПОСЛЕ:<br>📸 Гостиная: паркет блестит, окна прозрачные<br>📸 Кухня: фасады, столешница, плита сияют<br>📸 Ванная: плитка и сантехника без налёта<br><br><b>Клиент: "Не ожидала такого результата! Теперь только к вам."</b>', question: 'Бывало что клиент остался недоволен и вы не могли доказать что сделали всё правильно? Сколько денег вернули за "некачественную" уборку?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6m20 0-3-3"/></svg> Время на объект — норматив vs факт', pitch: '<b>БЦ "Панорама" (450 м², 3 чел.):</b><br>Норматив: 2 ч 30 мин<br>Факт сегодня: 2 ч 10 мин ✅ (быстрее — премия)<br>Факт 2 недели назад: 3 ч 20 мин ⚠️ (не было FloorPro — потратили время на замену)<br><br><b>Квартира после ремонта (87 м², 2 чел.):</b><br>Норматив: 4 ч | Факт: 5 ч 10 мин ⚠️ (потолок в шпаклёвке — не предусмотрели)<br>→ Доплата 600 грн рассчитана автоматически, клиент согласовал<br><br><b>Рейтинг эффективности:</b><br>Бригада №1: в среднем −8% от норматива (быстрее)<br>Бригада №2: в среднем +12% от норматива (медленнее)', question: 'Знаете сколько реально времени бригада тратит на каждый тип объекта? Кто-то это контролирует?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg> Химия и инвентарь — учёт расходов по объекту', pitch: '<b>Склад CleanMaster — остатки сегодня:</b><br>✅ FloorPro (полы, 5л) — 12 канистр (мин. 8)<br>✅ SaniMax (сантехника, 1л) — 28 шт (мин. 20)<br>❌ <b>ClearView (стекло, 0.5л) — 6 шт (мин. 10) — НИЖЕ МИНИМУМА</b><br>Уведомление Татьяне: "Заказать ClearView до пятницы"<br>✅ Антибактериальный спрей — 18 шт | ✅ Перчатки — 8 уп.<br><br><b>Расходы химии по объектам:</b><br>БЦ "Панорама" (еженед.): FloorPro 0.5л + SaniMax 0.2л = <b>48 грн/уборка</b><br>Клиника "МедПлюс" (3×/нед.): Антибакт. 0.5л + SaniMax 0.4л = <b>91 грн/уборка</b><br>Генеральная после ремонта: <b>124 грн/уборка</b>', question: 'Знаете сколько расходуется химии на каждый объект? Бывало что бригада говорит "средство закончилось" прямо на месте?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Абонементы — деньги пришли, объекты впереди', pitch: '<b>Активные абонементы CleanMaster:</b><br><br>🏢 <b>БЦ "Панорама"</b> — еженедельно<br>4 800 грн/нед. | Предоплата 4 нед. = <b>19 200 грн</b> ✅ | Остаток: 3 нед.<br><br>🍽️ <b>Ресторан "Смак"</b> — ежедневная вечерняя<br>1 200 грн/день | Месяц = <b>26 400 грн</b> ✅<br><br>🏠 <b>Бондаренко (ЖК "Sunrise")</b> — 2 раза/месяц<br>1 800 грн/уборка | Предоплата 2 = <b>3 600 грн</b> ✅<br><br>🏥 <b>Клиника "МедПлюс"</b> — 3 раза/неделю<br>2 400 грн/уборка | Месяц = <b>28 800 грн</b> ✅<br><br>Общая предоплата в кассе прямо сейчас: <b>86 400 грн</b>', question: 'Сколько у вас абонентных клиентов? Какая сумма предоплаты сейчас на счету?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> CRM — вся специфика клиента в одной карточке', pitch: '<b>Ковальчук Оксана — кв. 87 м², Садовая 12</b><br>⚠️ Паркет — средство БЕЗ АММИАКА (реакция на запах)<br>⚠️ Аллергия на хлор — не использовать СанФреш!<br>🐱 Кот Барсик — закрыть в комнате до начала<br>🔑 Код домофона: 1234# | 2-й подъезд, 5-й этаж<br>⭐ Любимая бригада: только Екатерина<br><br>История: 8 уборок. Жалоба в феврале: не вытерли плинтусы → исправили + скидка 10%.<br>Рейтинг: 4.7/5 | LTV: 14 400 грн/год<br><br>Новая уборщица Ирина открыла карточку — и знает всё без звонка Екатерине.', question: 'Где хранится специфика каждого клиента? Если новый человек едет на объект — узнает ли о паркете и коте?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Рекламация — решаем за 30 секунд с доказательствами', pitch: 'Бондаренко звонит: <i>"Ваши убирали вчера — и до сих пор пыль за телевизором!"</i><br><br>Татьяна открывает задачу на объекте:<br>🔍 Чек-лист: пункт "ТВ-зона — протереть пыль" ✅ отмечено в 10:47<br>📸 Фото ПОСЛЕ: за телевизором чисто — зафиксировано в 10:51<br>✍️ Подпись клиента: есть<br><br>Татьяна: <i>"Оксана Васильевна, вот фото после уборки — вот за ТВ чисто. Вот подписанный чек-лист. Возможно пыль осела после? Мы готовы приехать проверить бесплатно."</i><br><br><b>Результат: претензия снята, деньги не возвращены, клиент лоялен.</b>', question: 'Как сейчас решаете рекламации? Сколько денег вернули за "некачественную уборку" за последние 3 месяца?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Win-back — клиенты которые "ушли" возвращаются', pitch: 'Система автоматически отслеживает клиентов которые перестали заказывать:<br><br>⚠️ <b>Петренко Ирина</b> — кв. 65 м², 3 уборки в прошлом году<br><b>Не заказывала 4 месяца.</b> Задача Татьяне: "Позвонить, узнать причину, предложить скидку 15%"<br><br>⚠️ <b>ФОП "Тех-Консалт"</b> — офис 90 м², отменил абонемент 6 недель назад<br>Причина: "дорого". Задача: "Предложить вечерний пакет 2 800 грн/нед. вместо 3 400"<br><br>Татьяна звонит Петренко: <i>"Ирина, мы заметили что давно не виделись. Хотим предложить скидку 15% на следующие 3 уборки..."</i><br><br>Результат по базе: 60% клиентов возвращаются после win-back звонка.', question: 'Как отслеживаете клиентов которые ушли? Кто-то им звонит и выясняет причину?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Просроченные — каждая с ценой риска', pitch: 'Просроченные задачи CleanMaster:<br><br>🔴 <b>Заказать ClearView для стекла</b> — просрочено 3 дня<br>Риск: завтра генеральная у Ковальчук — окна и зеркала без средства → рекламация<br><br>🔴 <b>Обновить сертификат HACCP для клиники</b> — просрочено 5 дней<br>Риск: без сертификата клиника "МедПлюс" может отказать нашей химии = потеря контракта <b>28 800 грн/мес</b><br><br>⚠️ <b>Аттестация Ирины Шевченко</b> — просрочено 1 день<br>Риск: без аттестации Ирина не может самостоятельно выезжать на медицинские объекты', question: 'Сколько сейчас просроченных задач в вашем бизнесе? Знаете цену каждой из них в гривнях?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Процесс уборки — от заказа до подписи клиента', pitch: 'Стандарт CleanMaster — 8 шагов:<br><br>1. <b>Приём заказа</b> — Татьяна: тип объекта, площадь, особенности, расчёт стоимости<br>2. <b>Подтверждение и оплата</b> — счёт или аванс для разового<br>3. <b>Назначение бригады</b> — по загруженности и специализации<br>4. <b>Подготовка</b> — бригадир: химия, инвентарь, маршрут, карточка клиента<br>5. <b>Фото ДО + уборка</b> — фиксация до начала<br>6. <b>Чек-лист зона за зоной</b> — отметки в телефоне по ходу<br>7. <b>Фото ПОСЛЕ + подпись клиента</b> — закрытие объекта<br>8. <b>Счёт и отзыв</b> — финальный счёт + SMS с просьбой оценить', question: 'Если завтра ключевой человек заболеет — новый сможет выйти на объект без вашего личного инструктажа?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> Онлайн-запись — клиент выбирает время сам', pitch: 'Клиент заходит на сайт CleanMaster:<br><br>Тип уборки → ● Генеральная после ремонта<br>Площадь → 87 м²<br>Стоимость → <b>автоматически 2 800 грн</b><br>Дата → "Завтра 10:00-14:00" ✅<br>Адрес + особенности (паркет без аммиака, кот)<br>Оплата онлайн → подтверждение на email<br><br>Татьяна видит новый заказ — бригада уже назначена. Ноль звонков.<br><br><b>8 самозаписей в неделю = освобождено 2 ч 40 мин диспетчера = +4-5 заказов в месяц.</b>', question: 'Сколько времени диспетчер тратит на согласование одного заказа по телефону? Умножьте на количество заказов в месяц.'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Рейтинг бригад — система качества без субъективности', pitch: 'После каждой уборки клиент получает SMS с оценкой 1-5.<br><br><b>Рейтинги бригад за апрель:</b><br>🏆 Бригада №1 (Екатерина): <b>4.9/5</b> — 24 оценки | 0 рекламаций<br>🥈 Бригада №2 (Николай): <b>4.6/5</b> — 18 оценок | 1 рекламация (поддон под холодильником)<br>⚠️ Бригада №3 (Пётр): <b>4.1/5</b> — 12 оценок | 3 рекламации ("плинтусы", "мокрый ковёр", "пыль на полках")<br><br>Владелец увидел проблему Петра — провёл обучение. Без системы отзывов — узнал бы после потери 3-4 клиентов.<br><br>Google Maps: <b>4.8 ⭐</b> | 87 отзывов', question: 'Как оцениваете качество работы каждой бригады отдельно? Откуда узнаёте что бригада халтурит — от клиента или сами замечаете?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Финансы — маржа по типам уборки', pitch: '<b>P&L CleanMaster — апрель:</b><br>Выручка: Абонементы 86 400 + Разовые 48 600 + Генеральные 28 800 = <b>163 800 грн</b><br>Расходы: Зарплата 8 уборщиков 64 000 + Диспетчер 18 000 + Химия 12 400 + Топливо/авто 8 200 + Реклама 4 800 + Аренда 6 000 = <b>113 400 грн</b><br><b>Прибыль: 50 400 грн (маржа 31%)</b><br><br>Маржа по типам: Генеральные 48% 🥇 | Абонементы 38% 🥈 | Разовые 24% 🥉 | Ежедневные офисы 22% ⚠️', question: 'Знаете маржу по каждому типу уборки отдельно? Ежедневные офисы самые низкомаржинальные — знали?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Регулярные расходы — ни один не пропущен', pitch: '📅 <b>1-го:</b> Аренда склада 6 000 + Страховка 2 авто 2 400 грн<br>📅 <b>5-го:</b> Зарплата 8 уборщиков 64 000 + Диспетчер 18 000 грн<br>📅 <b>15-го:</b> Топливная карта WOG 8 400 + Химия 12 400 грн<br>📅 <b>Ежеквартально:</b> ТО двух микроавтобусов 6 800 + Сертификат HACCP 2 200 грн<br><br>Система напоминает за 5 дней до каждого платежа.<br>Важно: если забыть ТО авто → поломка на выезде → объект сорван → штраф по договору.', question: 'Бывало что забыли вовремя заправить, провести ТО или обновить сертификат — и это повлияло на выезд?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Аналитика — сезонность и где растём', pitch: 'Динамика CleanMaster за 3 месяца:<br>📈 Выручка: 118 000 → 139 000 → 163 800 грн/мес (+39%)<br>📈 Объектов/мес: 34 → 41 → 48 (+41%)<br>📉 Средний рейтинг: 4.8 → 4.6 (бригада Петра)<br><br><b>Сезонность:</b><br>🌸 Апрель-май — пик генеральных (после ремонтов)<br>☀️ Июнь-август — спад 25-30% (отпуска)<br>🍂 Октябрь — восстановление | ❄️ Декабрь — пик корпоративных<br><br>Владелец знает: в августе запустить акцию "Возвращение с отпуска".', question: 'Знаете свою сезонность? Что делаете в "тихие" месяцы чтобы держать загруженность бригад?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> KPI — бригады, качество, диспетчер', pitch: 'KPI CleanMaster — апрель:<br>🟢 Выручка: 163 800 при цели 150 000 — <b>+9%, перевыполнено!</b><br>🟢 Объектов вовремя: 94% при цели 90% ✅<br>🟡 Средний рейтинг: 4.6 при цели 4.8 — ⚠️ через бригаду Петра<br>🔴 Абонентных клиентов: 4 при цели 6 — отставание<br>🟢 Win-back: 60% ✅<br><br><b>По бригадам:</b><br>Екатерина: рейтинг 4.9, вовремя 100%, химия в норме ← ТОП<br>Пётр: рейтинг 4.1, 3 рекламации ← <b>требует внимания</b>', question: 'Ваши бригадиры знают свои KPI? Пётр знает что у него 3 рекламации и рейтинг 4.1?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Команда — кто свободен для срочного заказа', pitch: 'Загруженность команды сегодня:<br>Бригада №1 (Екатерина, Ирина, Оля): 3 объекта, 8 ч — 100%<br>Бригада №2 (Николай, Светлана): 3 объекта, 7 ч — 87%, есть 1 ч<br>Бригада №3 (Пётр, Анна): 2 объекта, 5 ч — <b>62%, свободны с 14:00!</b><br><br>Звонят: <i>"Нужна срочная уборка квартиры после вечеринки — 70 м², сегодня в 15:00"</i><br><br>Татьяна сразу видит: Пётр и Анна свободны с 14:00 → назначает → подтверждает клиенту.<br>Время: <b>3 минуты.</b> Без системы: 5 звонков → "уточню" → 20 минут.', question: 'Если сейчас придёт срочный заказ — сколько времени займёт понять кто свободен и подтвердить клиенту?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Координации — планёрка 8:00, 10 минут', pitch: '⏰ <b>Ежедневная планёрка — 8:00, 10 мин:</b><br>Татьяна + все бригадиры: маршруты подтверждены, проблемные объекты, химия на борту<br><br>⏰ <b>Еженедельный разбор — понедельник 9:00, 30 мин:</b><br>Владелец + Татьяна + бригадиры: рейтинги за неделю, рекламации, загруженность, новые клиенты<br><br>⏰ <b>Месячный итог — 1-го, 1 час:</b><br>P&L, KPI бригад, план на сезон, новые направления<br><br>Каждое решение фиксируется. Через неделю видно кто что выполнил.', question: 'Ваши бригадиры знают результаты своей работы за неделю? Или узнают только если вы сами скажете?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Мобильная — бригада работает только с телефона', pitch: '<b>Екатерина на объекте (весь цикл в телефоне):</b><br>→ Приехала → открыла задачу → фото ДО → убирает → чек-лист зона за зоной → фото ПОСЛЕ → клиент подписывает пальцем → задача закрыта<br><br><b>Татьяна откуда угодно:</b><br>→ Видит статус каждого объекта в реальном времени<br>→ Назначает срочный заказ за 3 минуты<br><br><b>Владелец утром в телефоне:</b><br>Выручка вчера: 8 400 грн (6 объектов) | Рейтинг: 4.7 ⭐ | Рекламаций: 0<br><br>Без WhatsApp-групп где всё теряется.', question: 'Бригады сейчас общаются через WhatsApp? Сколько важных сообщений теряется в чате?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1A2.5 2.5 0 0 1 14.5 8A2.5 2.5 0 0 1 17 10.5v3A2.5 2.5 0 0 1 14.5 16A2.5 2.5 0 0 1 12 18.5v1a2.5 2.5 0 0 1-5 0v-1A2.5 2.5 0 0 1 4.5 16A2.5 2.5 0 0 1 2 13.5v-3A2.5 2.5 0 0 1 4.5 8A2.5 2.5 0 0 1 7 5.5v-1A2.5 2.5 0 0 1 9.5 2z"/><path d="M12 5.5v13M7 8.5h10M7 13.5h10"/></svg> AI — знает клиентов, бригады и сезонность', pitch: '<i>"Маржа ежедневных офисов только 22%. Что делать?"</i><br>AI: <i>"Три варианта: 1) поднять тариф ООО 'Альфа' с 900 до 1 100 грн — они с вами 2 года, риск низкий; 2) сократить бригаду с 2 до 1 человека (120 м², реально за 2 ч); 3) перевести на 3 раза/нед. и углубить уборку. Рекомендую вариант 1."</i><br><br><i>"Август — тихий месяц. Как загрузить бригады?"</i><br>AI: <i>"Запустите акцию 'Возвращение с отпуска' -20%. База: 48 контактов. Потенциал: 8-12 дополнительных заказов."</i>', question: 'Представьте консультанта который знает клиентов, бригады и сезонность — отвечает за 10 секунд. Первый вопрос?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="1"/><polyline points="17 2 12 7 7 2"/><line x1="12" y1="7" x2="12" y2="22"/><line x1="2" y1="14" x2="22" y2="14"/></svg> Система — 7 функций клинингового бизнеса', pitch: '0. <b>Маркетинг и привлечение</b> — реклама, Google Maps, отзывы, акции<br>1. <b>Продажи и онлайн-запись</b> — приём заявок, расчёт (Татьяна)<br>2. <b>Диспетчеризация</b> — маршруты, назначение бригад (Татьяна)<br>3. <b>Выполнение уборки</b> — бригады, чек-листы, фото (бригадиры)<br>4. <b>Качество и рекламации</b> — отзывы, рейтинги, жалобы (Татьяна+владелец)<br>5. <b>Склад и химия</b> — остатки, заказы (бригадир склада)<br>6. <b>Финансы и развитие</b> — P&L, KPI, масштабирование (владелец)<br><br>Каждая функция имеет владельца и KPI.', question: 'В вашем бизнесе есть ответственный за каждую функцию? Или диспетчер = маркетолог = кладовщик = бухгалтер?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg> CleanMaster на автопилоте — через 65 дней', pitch: '✅ Екатерина в 7:30 — маршрут есть, химия подготовлена, специфика клиентов известна<br>✅ Рекламация Бондаренко: Татьяна открыла фото → 30 секунд → закрыла без возврата денег<br>✅ Рейтинг Петра упал → увидели сразу → обучение → 4.5 в следующем месяце<br>✅ ФОП "Тех-Консалт" отменил — win-back → вернули с новым тарифом<br>✅ Август: акция "Возвращение с отпуска" → +11 заказов<br>✅ Владелец в 8:00: выручка, рейтинг, рекламации — в телефоне<br><br><b>Математика роста:</b><br>Сейчас: 48 объектов/мес, 163 800 грн<br>Через год: +3-я бригада, 72 объекта, 245 000 грн<br><b>+81 200 грн/мес — без увеличения рекламного бюджета</b>', question: 'Сколько клиентов вы потеряли за последний год из-за недовольства или просто "пропали"? Какова цена этих потерь в гривнях?'},
],

}; // кінець TOURS_I18N

// ── Хелпер поточної мови ────────────────────────────────────
function _getTourLang() {
    // Береться з глобального стану платформи
    return window._currentLang || window.currentLang || localStorage.getItem('talko_lang') || 'ua';
}

// ── Отримати текст кроку з урахуванням мови ─────────────────
function _getStepI18n(niche, idx) {
    const lang = _getTourLang();
    if (lang === 'ua') return null; // UA — основний, беремо з TOURS напряму
    const langTours = TOURS_I18N[lang];
    if (!langTours) return null;
    const nicheTours = langTours[niche];
    if (!nicheTours) return null;
    return nicheTours[idx] || null;
}

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
    // Floating кнопка більше не потрібна — є кнопка Тур в хедері
    const existing = document.getElementById('demoTourBtn');
    if (existing) existing.remove();
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
    // Автовизначення ніші: аргумент → збережена → ніша компанії → дефолт
    const companyNiche = window.currentCompanyData?.niche || window.currentCompany?.niche;
    _tourNiche  = niche || _tourNiche || (TOURS[companyNiche] ? companyNiche : (TOURS[Object.keys(TOURS)[0]] ? Object.keys(TOURS)[0] : 'furniture_factory'));
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
        <div class="tour-tag">Тур завершено</div>
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

    // Локалізований текст
    const i18n = _getStepI18n(_tourNiche, idx);
    const title    = i18n?.title    || step.title;
    const pitch    = i18n?.pitch    || step.pitch;
    const question = i18n?.question || step.question;

    // UI labels по мові
    const lang = _getTourLang();
    const labels = {
        ua: { step:'Крок', of:'з', back:'← Назад', next:'Далі →', finish:'Завершити ✓', stop:'Зупинити тур', client:'Питання клієнту:' },
        ru: { step:'Шаг',  of:'из', back:'← Назад', next:'Далее →', finish:'Завершить ✓', stop:'Остановить тур', client:'Вопрос клиенту:' },
    };
    const L = labels[lang] || labels.ua;

    card.innerHTML = `
        <div class="tour-tag">${L.step} ${idx+1} ${L.of} ${total}</div>
        <div class="tour-title">${title}</div>
        <div class="tour-pitch">${pitch}</div>
        ${question ? `<div class="tour-question"><strong>${L.client}</strong>${question}</div>` : ''}
        <div class="tour-footer">
            <div class="tour-progress">${idx+1}/${total}</div>
            <div class="tour-progress-bar"><div class="tour-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="tour-btns">
            ${!isFirst ? `<button class="tour-btn-prev" onclick="tourPrev()">${L.back}</button>` : ''}
            <button class="tour-btn-next" onclick="tourNext()">
                ${isLast ? L.finish : L.next}
            </button>
            <button class="tour-btn-skip" onclick="stopTour()" title="${L.stop}">✕</button>
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
                    showToast('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Демо готове! Натисніть «Тур» щоб провести клієнта по системі', 'success');
                }
            }, 1500);
        }
    };
}

})();
