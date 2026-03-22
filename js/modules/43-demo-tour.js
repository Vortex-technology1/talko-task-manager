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
        selector: '#mydayTab, [onclick*="switchTab(\'myday\')"]',
        tab: 'myday',
        pitch: 'Олексій (механік) відкрив систему о 8:30 і бачить: Mazda CX-5 Іванченка — заміна масла і фільтрів о 9:00, BMW X5 Бойка — діагностика підвіски о 11:30, Toyota Camry Ткаченко — заміна гальмівних колодок о 14:00. Черга розставлена без вашого дзвінка. Якщо Олексій захворів — Сергій (автоелектрик) відкриває систему і бачить перерозподілену чергу.',
        question: 'Як зараз ваші майстри дізнаються черговість авто і що саме робити з кожним? Дзвінок? WhatsApp? Папірець на стіні?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> Картка авто — повна історія без паперів',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Mazda CX-5, держ. номер AA1234BC, VIN: JMZKE1W25001..., пробіг при прийомі 85 420 км. Клієнт: Іванченко Михайло, +38067... За рік — 3 візити: заміна масла (березень, 1 820 грн), заміна повітряного фільтра (червень, 820 грн), поточний наряд. Майстер відкриває картку — і одразу знає всю історію авто. Клієнт це відчуває: "Вони пам\'ятають моє авто".',
        question: 'Де зараз зберігається інформація про авто і ремонти ваших клієнтів? Якщо клієнт каже "я був у вас рік тому" — ви знайдете що робили?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> Замовлення-наряд — роботи і запчастини в одному документі',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Наряд WO-2026-0003, Toyota Camry, майстер Сергій. Роботи: заміна гальмівних колодок (600 грн) + балансування коліс (280 грн). Запчастини зі складу: гальмівні колодки передні (680 грн), гальмівний диск 2 шт (2 400 грн). Разом: 3 960 грн. Клієнт підписує — система автоматично списує запчастини зі складу і записує оплату у фінанси. Нічого вручну.',
        question: 'Як зараз ведете облік по наряду: що зроблено, які запчастини поставлені, скільки коштує? Це один документ чи кілька різних?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Склад запчастин — знаєте залишки до ремонту, не під час',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: 'Масло моторне 5W-30: є 18 л, мінімум 5 л — все ок. Гальмівні колодки передні: є 4 комплекти, мінімум 3 — майже ліміт. Гальмівний диск 280 мм: є 2 шт, мінімум 3 — НИЖЧЕ МІНІМУМУ, система надіслала сповіщення вчора. Ви замовляєте сьогодні — запчастини є до приїзду наступного клієнта. А не навпаки.',
        question: 'Скільки разів за останній місяць клієнт чекав ремонту бо не було потрібної запчастини на складі?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> CRM — клієнти повертаються бо ви їх пам\'ятаєте',
        selector: '#crmTab, [onclick*=\"crm\"]',
        tab: 'crm',
        pitch: 'Картка: Іванченко Михайло. Вкладка "Авто/Наряди" — Mazda CX-5: 3 наряди, загалом 4 460 грн за рік. Ткаченко Юлія: не приходила 4 місяці після заміни масла — система автоматично поставила задачу менеджеру "передзвонити, нагадати про ТО". Клієнти які "пропали" — більше не пропадають.',
        question: 'Як зараз відстежуєте клієнтів яким скоро треба міняти масло або проходити ТО? Хто їм про це нагадує?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінанси — прибуток без Excel і без бухгалтера',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'Вчора: 5 нарядів, виручка 9 240 грн. Запчастини (собівартість): 4 200 грн. Зарплата майстрів (відрядна): 1 380 грн. Прибуток дня: 3 660 грн. Кожна оплата наряду — автоматично йде у фінанси. Власник бачить P&L вранці в телефоні. Скільки заробив кожен пост, хто найприбутковіший майстер — одним поглядом.',
        question: 'Скільки часу у вас або вашого бухгалтера іде на підрахунок прибутку за тиждень? І ця цифра — реальна чи приблизна?',
    },
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
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Рецептури — знаєте собівартість кожної страви до копійки',
        selector: '#foodProductionTab, [onclick*=\"foodProduction\"]',
        tab: 'foodProduction',
        pitch: 'Борщ класичний (10 порцій): буряк 300 г (4.20 грн) + картопля 250 г (3.00 грн) + морква 80 г (1.28 грн) + м\'ясо 150 г (27.75 грн) + інші = собівартість 4.82 грн/порція. Ціна продажу 95 грн. Маржа 95%. Шоколадний брауні (12 порцій): шоколад 200 г (96 грн) + масло 150 г (42 грн) + яйця 4 шт (22 грн) + інші = собівартість 31.17 грн. Ціна 85 грн. Маржа 63%. Знаєте на чому реально заробляєте — а не "здається прибуткова страва".',
        question: 'Знаєте точну собівартість вашої найпопулярнішої страви? Не приблизно — а з конкретними цінами на кожен інгредієнт?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/></svg> Планування виробництва — що і скільки робити сьогодні',
        selector: '#foodProductionTab, [onclick*=\"foodProduction\"]',
        tab: 'foodProduction',
        pitch: 'Галина (технолог) о 7:30 відкрила план: борщ 30 порцій (собівартість 144.60 грн, очікувана виручка 2 850 грн) — статус "Заплановано"; хліб пшеничний 20 буханок (собівартість 226 грн, виручка 900 грн) — статус "Виробляється"; шоколадний брауні 5 форм/60 порцій — статус "Готово". Микола (кухар) бачить ті самі дані — не потрібно пояснювати що і скільки робити.',
        question: 'Як зараз плануєте виробництво на день? Технолог пише на дошці? У WhatsApp? Як кухар розуміє що і скільки варити?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Стоп-лист — знаєте про нестачу до початку готування',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: 'Плануєте 50 порцій борщу. Система перевіряє: буряку потрібно 15 кг — є 60 кг (ОК); картопля 12.5 кг — є 48 кг (ОК); м\'ясо 7.5 кг — є 8 кг (майже ліміт, сповіщення); капуста 10 кг — є 3 кг (СТОП). Система показує це ПЕРЕД початком готування — о 7:30, поки ще можна доставити. А не о 11:00 коли борщ вже має бути на роздачі.',
        question: 'Скільки разів за місяць виробництво зупинялось в процесі бо не вистачило якогось інгредієнта?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Автосписання — склад актуальний завжди',
        selector: '#warehouseTab, [onclick*=\"warehouse\"]',
        tab: 'warehouse',
        pitch: 'Виробили 30 порцій борщу. Натиснули "Готово" — система автоматично списала зі складу: буряк −4.5 кг (залишок 55.5 кг), картопля −3.75 кг (залишок 44.25 кг), м\'ясо −2.25 кг (залишок 5.75 кг — нижче мінімуму, сповіщення), олія −0.9 л. Жодного ручного введення. Технолог не веде окремий зошит — залишки в системі завжди актуальні.',
        question: 'Як зараз ведете облік витрат сировини? Є окремий зошит або таблиця? Скільки часу на це йде щодня?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/><line x1="12" y1="16" x2="8" y2="16"/></svg> Реалізація — виставляємо рахунок за те що зробили',
        selector: '#salesTab, [onclick*=\"sales\"]',
        tab: 'sales',
        pitch: 'Відвантаження ТОВ Кейтеринг Плюс: борщ 30 порцій × 95 грн = 2 850 грн + котлети 50 порцій × 75 грн = 3 750 грн + хліб 10 буханок × 45 грн = 450 грн. Разом рахунок INV-2026-0008 на 7 050 грн. Виставили — клієнт оплатив — виручка автоматично у фінансах. Повний цикл: сировина на складі → виробництво → рахунок → гроші.',
        question: 'Як зараз виставляєте рахунок оптовому клієнту? Скільки часу від відвантаження до отримання грошей?',
    },
    {
        title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Фінанси — знаєте рентабельність по кожній страві',
        selector: '#financeTab, [onclick*=\"finance\"]',
        tab: 'finance',
        pitch: 'Травень: сировина 42 000 грн, зарплата 28 000 грн, оренда цеху 12 000 грн, комунальні 4 500 грн. Виручка 185 000 грн. Прибуток 98 500 грн, маржа 53%. Борщ: маржа 95%, продали 900 порцій. Брауні: маржа 63%, продали 360 порцій. Хліб: маржа 42%, продали 600 буханок. Власник бачить що варто продавати більше борщу — а не хліба.',
        question: 'Знаєте яка рентабельність по кожному продукту окремо? Або тільки загальний прибуток?',
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
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Мой день — каждый мастер знает очерёдность', pitch: 'Алексей (механик) открыл систему в 8:30: Mazda CX-5 Иванченко — замена масла в 9:00, BMW X5 Бойко — диагностика подвески в 11:30, Toyota Camry Ткаченко — тормозные колодки в 14:00. Очередь расставлена без вашего звонка. Если Алексей заболел — Сергей открывает систему и видит перераспределённую очередь.', question: 'Как сейчас ваши мастера узнают очерёдность авто? Звонок? WhatsApp? Бумажка на стене?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> Карточка авто — полная история без бумаг', pitch: 'Mazda CX-5, AA1234BC, VIN: JMZKE1W25001..., пробег 85 420 км. Иванченко Михаил. За год — 3 визита: замена масла (март, 1 820 грн), воздушный фильтр (июнь, 820 грн), текущий наряд. Мастер открывает карточку — и сразу знает всю историю авто. Клиент чувствует: они помнят мою машину.', question: 'Где хранится информация об авто и ремонтах ваших клиентов? Если клиент говорит был у вас год назад — вы найдёте что делали?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> Заказ-наряд — работы и запчасти в одном документе', pitch: 'Наряд WO-2026-0003, Toyota Camry, мастер Сергей. Работы: замена тормозных колодок (600 грн) + балансировка (280 грн). Запчасти: колодки передние (680 грн), тормозной диск 2 шт (2 400 грн). Итого: 3 960 грн. Клиент подписывает — система автоматически списывает запчасти со склада и записывает оплату в финансы.', question: 'Как ведёте учёт по наряду: что сделано, какие запчасти поставлены, сколько стоит? Один документ или несколько?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Склад запчастей — знаете остатки до ремонта', pitch: 'Масло 5W-30: есть 18 л, минимум 5 л — ок. Тормозные колодки: есть 4 комплекта, минимум 3 — почти лимит. Тормозной диск 280 мм: есть 2 шт, минимум 3 — НИЖЕ МИНИМУМА, уведомление вчера. Заказываете сегодня — запчасти есть к приезду следующего клиента. А не наоборот.', question: 'Сколько раз за последний месяц клиент ждал ремонта потому что не было нужной запчасти?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> CRM — клиенты возвращаются потому что вы их помните', pitch: 'Иванченко Михаил. Вкладка Авто/Наряды — Mazda CX-5: 3 наряда, итого 4 460 грн за год. Ткаченко Юлия: не приходила 4 месяца после замены масла — система поставила задачу позвонить, напомнить про ТО. Клиенты которые пропали — больше не пропадают.', question: 'Как отслеживаете клиентов которым скоро нужно менять масло или проходить ТО?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Финансы — прибыль без Excel и без бухгалтера', pitch: 'Вчера: 5 нарядов, выручка 9 240 грн. Запчасти: 4 200 грн. Зарплата мастеров: 1 380 грн. Прибыль дня: 3 660 грн. Каждая оплата наряда автоматически идёт в финансы. Владелец видит P&L утром в телефоне без звонков.', question: 'Сколько времени уходит на подсчёт прибыли за неделю? И эта цифра — реальная или приблизительная?'},
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
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Рецептуры — знаете себестоимость каждого блюда до копейки', pitch: 'Борщ классический (10 порций): свёкла 300 г (4.20 грн) + картофель 250 г (3.00 грн) + мясо 150 г (27.75 грн) + прочие = 4.82 грн/порция. Цена 95 грн. Маржа 95%. Шоколадный брауни: себестоимость 31.17 грн. Цена 85 грн. Маржа 63%. Знаете на чём реально зарабатываете.', question: 'Знаете точную себестоимость вашего самого популярного блюда? С конкретными ценами на каждый ингредиент?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Планирование производства — что и сколько делать сегодня', pitch: 'Галина (технолог) в 7:30: борщ 30 порций (себестоимость 144.60 грн, выручка 2 850 грн) — Запланировано; хлеб 20 буханок — Производится; брауни 5 форм — Готово. Николай (повар) видит те же данные — не нужно объяснять что готовить.', question: 'Как планируете производство на день? Технолог пишет на доске? В WhatsApp?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Стоп-лист — знаете о нехватке до начала готовки', pitch: 'Планируете 50 порций борща. Система проверяет: свёкла 15 кг — есть 60 кг (ОК); мясо 7.5 кг — есть 8 кг (почти лимит); капуста 10 кг — есть 3 кг (СТОП). Система показывает это в 7:30 — пока ещё можно доставить. А не в 11:00 когда борщ уже должен быть на раздаче.', question: 'Сколько раз за месяц производство останавливалось потому что не хватило ингредиента?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> Автосписание — склад актуален всегда', pitch: 'Произвели 30 порций борща. Нажали Готово — система списала: свёкла −4.5 кг (остаток 55.5 кг), картофель −3.75 кг, мясо −2.25 кг (ниже минимума, уведомление). Никакого ручного ввода. Остатки в системе всегда актуальны.', question: 'Как ведёте учёт расхода сырья? Есть отдельный блокнот? Сколько времени уходит каждый день?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/></svg> Реализация — выставляем счёт за то что сделали', pitch: 'Отгрузка ООО Кейтеринг Плюс: борщ 30 порций × 95 грн = 2 850 грн + котлеты 50 порций × 75 грн = 3 750 грн + хлеб 10 буханок × 45 грн = 450 грн. Счёт на 7 050 грн. Выставили — клиент оплатил — выручка в финансах. Полный цикл: сырьё → производство → счёт → деньги.', question: 'Как выставляете счёт оптовому клиенту? Сколько времени от отгрузки до получения денег?'},
    {title: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Финансы — рентабельность по каждому блюду', pitch: 'Май: сырьё 42 000 грн, зарплата 28 000 грн, аренда 12 000 грн, коммунальные 4 500 грн. Выручка 185 000 грн. Прибыль 98 500 грн, маржа 53%. Борщ: маржа 95%, 900 порций. Брауни: маржа 63%, 360 порций. Хлеб: маржа 42%, 600 буханок. Стоит продавать больше борща — а не хлеба.', question: 'Знаете рентабельность по каждому продукту отдельно? Или только общая прибыль?'},
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
