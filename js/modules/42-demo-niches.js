// TALKO Demo Niches — 9 ніш з повними даними
// Підключається окремим файлом, доповнює 41-demo-data.js

'use strict';

// ─── Хелпер: дата відносно сьогодні ────────────────────────────────────────
function _demoDate(dayOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return getLocalDateStr(d);
}
function _demoTS(dayOffset = 0, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return firebase.firestore.Timestamp.fromDate(d);
}

// ─── Batch helper (max 499 per batch) ────────────────────────────────────────
async function _demoBatchCommit(ops) {
  const CHUNK = 490;
  for (let i = 0; i < ops.length; i += CHUNK) {
    const batch = db.batch();
    ops.slice(i, i + CHUNK).forEach(fn => fn(batch));
    await batch.commit();
  }
}

// ─── Фінанси: транзакції за 3 місяці ────────────────────────────────────────
async function _loadDemoFinance(companyRef, currency, niche, accounts, incomeCategories, expenseCategories, monthlyData) {
  const ops = [];
  const now = new Date();

  // Ініціалізуємо рахунки
  accounts.forEach(acc => {
    const ref = companyRef.collection('finance_accounts').doc();
    ops.push(b => b.set(ref, { ...acc, createdAt: firebase.firestore.FieldValue.serverTimestamp() }));
  });

  // Категорії доходів
  incomeCategories.forEach((cat, i) => {
    const ref = companyRef.collection('finance_categories').doc();
    ops.push(b => b.set(ref, { name: cat, type: 'income', isSystem: false, order: i, createdAt: firebase.firestore.FieldValue.serverTimestamp() }));
  });

  // Категорії витрат
  expenseCategories.forEach((cat, i) => {
    const ref = companyRef.collection('finance_categories').doc();
    ops.push(b => b.set(ref, { name: cat, type: 'expense', isSystem: false, order: i, createdAt: firebase.firestore.FieldValue.serverTimestamp() }));
  });

  // Транзакції по місяцях
  monthlyData.forEach(({ monthOffset, transactions }) => {
    const baseDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

    transactions.forEach(tx => {
      const day = Math.min(tx.day || Math.floor(Math.random() * 25) + 1, daysInMonth);
      const txDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
      const ref = companyRef.collection('finance_transactions').doc();
      const accId = accounts[tx.accIndex || 0]?.id || 'main';
      ops.push(b => b.set(ref, {
        type: tx.type,
        amount: tx.amount,
        currency,
        category: tx.category,
        accountId: accId,
        accountName: accounts[tx.accIndex || 0]?.name || 'Основний',
        counterparty: tx.counterparty || '',
        comment: tx.comment || '',
        date: firebase.firestore.Timestamp.fromDate(txDate),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }));
    });
  });

  // Налаштування фінансів
  const settRef = companyRef.collection('finance_settings').doc('main');
  ops.push(b => b.set(settRef, { currency, niche, region: currency === 'USD' ? 'US' : currency === 'EUR' ? 'EU' : 'UA', initialized: true }));

  await _demoBatchCommit(ops);
}

// ─── Профіль компанії ────────────────────────────────────────────────────────
async function _saveDemoCompanyProfile(niche, name, goal, concept, ckp, ideal, currency) {
  await db.collection('companies').doc(currentCompany).set({
    niche, name, companyGoal: goal, companyConcept: concept,
    companyCKP: ckp, companyIdeal: ideal, currency,
    region: currency === 'USD' ? 'US' : currency === 'EUR' ? 'EU' : 'UA'
  }, { merge: true });
}

// ════════════════════════════════════════════════════════════════════════════
// 1. БУДІВНИЦТВО / РЕМОНТ (Німеччина) — EUR
// ════════════════════════════════════════════════════════════════════════════
async function loadConstructionEuDemoData() {
  const companyRef = db.collection('companies').doc(currentCompany);
  const ops = [];

  await _saveDemoCompanyProfile('construction',
    'BauProfi GmbH', 
    'Забезпечити власників нерухомості в Німеччині якісним ремонтом і будівництвом у строк і без перевитрат',
    'Будівельна компанія у Дюссельдорфі. Виконуємо ремонт квартир, офісів та зведення приватних будинків під ключ. Власні бригади без субпідряду. Гарантія 5 років на всі роботи.',
    'Готовий об\'єкт у погоджені терміни, без додаткових витрат понад кошторис, з гарантією якості',
    '2026: 12 об\'єктів паралельно, виручка 280к EUR/міс, маржа 22%, 3 бригади по 6 осіб',
    'EUR'
  );

  const users = [
    { name: 'Марко Шульц', email: 'marko@bauprofi.de', role: 'manager' },
    { name: 'Олег Ткач', email: 'oleg@bauprofi.de', role: 'employee' },
    { name: 'Юрій Мельник', email: 'yuriy@bauprofi.de', role: 'employee' },
    { name: 'Анна Вебер', email: 'anna@bauprofi.de', role: 'employee' },
  ];
  const uids = users.map(() => companyRef.collection('users').doc().id);
  users.forEach((u, i) => ops.push(b => b.set(companyRef.collection('users').doc(uids[i]), { ...u, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const funcs = [
    { name: 'Виробництво (бригада)', description: 'Будівельні та ремонтні роботи на об\'єктах', assigneeIds: [uids[1], uids[2]] },
    { name: 'Проектування та кошторис', description: 'Обмір, кошторис, замовлення матеріалів', assigneeIds: [uids[0]] },
    { name: 'Закупівлі матеріалів', description: 'Пошук постачальників, замовлення, логістика', assigneeIds: [uids[2]] },
    { name: 'Маркетинг і продажі', description: 'Лідогенерація, зустрічі з клієнтами, договори', assigneeIds: [uids[0]] },
    { name: 'Адміністрування', description: 'Документи, дозволи, звітність', assigneeIds: [uids[3]] },
    { name: 'Фінанси', description: 'Рахунки, оплати, контроль витрат по об\'єктах', assigneeIds: [uids[3]] },
  ];
  const fids = funcs.map(() => companyRef.collection('functions').doc().id);
  funcs.forEach((f, i) => ops.push(b => b.set(companyRef.collection('functions').doc(fids[i]), { ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  // Регулярні завдання
  const regular = [
    { title: 'Щотижневий об\'їзд об\'єктів', function: 'Виробництво (бригада)', period: 'weekly', daysOfWeek: ['1'], timeStart: '07:00', timeEnd: '10:00', instruction: 'Об\'їхати всі активні об\'єкти. Перевірити прогрес, якість, безпеку. Сфотографувати.', expectedResult: 'Фото-звіт по кожному об\'єкту в чаті' },
    { title: 'Замовлення матеріалів на тиждень', function: 'Закупівлі матеріалів', period: 'weekly', daysOfWeek: ['4'], timeStart: '09:00', timeEnd: '11:00', instruction: 'Зібрати заявки від бригад. Оформити замовлення постачальникам. Підтвердити доставку.', expectedResult: 'Всі матеріали замовлені, підтверджені дати доставки' },
    { title: 'Виставлення рахунків клієнтам', function: 'Фінанси', period: 'weekly', daysOfWeek: ['5'], timeStart: '14:00', timeEnd: '16:00', instruction: 'За кожним об\'єктом виставити проміжний або фінальний рахунок згідно з договором.', expectedResult: 'Рахунки відправлені, підтвердження отримані' },
    { title: 'Публікація кейсів в Instagram', function: 'Маркетинг і продажі', period: 'weekly', daysOfWeek: ['3'], timeStart: '11:00', timeEnd: '12:00', instruction: 'Взяти фото завершеного об\'єкту або етапу. Написати пост до/після з описом робіт.', expectedResult: 'Пост опублікований з хештегами' },
    { title: 'Планерка з бригадирами', function: 'Виробництво (бригада)', period: 'weekly', daysOfWeek: ['1'], timeStart: '06:30', timeEnd: '07:00', instruction: 'Обговорити план на тиждень по кожному об\'єкту. Вирішити проблеми.', expectedResult: 'Протокол з розподілом завдань' },
    { title: 'Закриття місяця — акти', function: 'Фінанси', period: 'monthly', dayOfMonth: '28', timeStart: '14:00', timeEnd: '17:00', instruction: 'Підписати акти виконаних робіт з клієнтами. Перевірити оплати. Закрити місяць.', expectedResult: 'Всі акти підписані, дебіторка списана або нагадування відправлені' },
  ];
  regular.forEach(r => ops.push(b => b.set(companyRef.collection('regularTasks').doc(), { ...r, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  // Проекти
  const projects = [
    { name: 'ЖК Sonnenhof — квартира 45м²', status: 'active', color: '#3b82f6', description: 'Повний ремонт квартири під ключ. Клієнт: Familie Müller', deadline: _demoDate(25), budget: 18500 },
    { name: 'Офіс Düsseldorf Innenstadt', status: 'active', color: '#22c55e', description: 'Ремонт офісу 120м². Open space + 3 переговорні.', deadline: _demoDate(40), budget: 42000 },
    { name: 'Приватний будинок Krefeld', status: 'active', color: '#f59e0b', description: 'Будівництво 180м² під ключ. 2 поверхи.', deadline: _demoDate(90), budget: 185000 },
    { name: 'Ванна кімната — Köln', status: 'done', color: '#8b5cf6', description: 'Заміна сантехніки та плитки', deadline: _demoDate(-10), budget: 7200 },
  ];
  projects.forEach(p => ops.push(b => b.set(companyRef.collection('projects').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  // Бізнес-процеси
  const procs = [
    { name: 'Продаж об\'єкту', description: 'Від ліда до підписання договору', stages: [
      { name: 'Вхідний запит', result: 'Заявка в CRM з контактами' },
      { name: 'Виїзд на об\'єкт', result: 'Фото, виміри, технічне завдання' },
      { name: 'Кошторис', result: 'Кошторис затверджений клієнтом' },
      { name: 'Договір', result: 'Договір підписаний, аванс 30% отримано' },
    ]},
    { name: 'Виконання об\'єкту', description: 'Від старту до здачі', stages: [
      { name: 'Закупівля матеріалів', result: 'Всі матеріали на складі або замовлені' },
      { name: 'Виробничі роботи', result: 'Щотижневий фото-звіт клієнту' },
      { name: 'Приймання', result: 'Клієнт підписав акт, відгук отримано' },
    ]},
  ];
  procs.forEach(p => ops.push(b => b.set(companyRef.collection('processTemplates').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  // Завдання
  const tasks = [
    { title: 'Скласти кошторис — вул. Berliner Str. 12', function: 'Проектування та кошторис', status: 'new', priority: 'high', deadlineDate: _demoDate(1), deadlineTime: '14:00', expectedResult: 'PDF кошторис відправлений клієнту' },
    { title: 'Замовити плитку для Sonnenhof', function: 'Закупівлі матеріалів', status: 'progress', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '12:00', expectedResult: 'Замовлення підтверджено, дата доставки 3 дні' },
    { title: 'Зустріч з клієнтом по офісу Innenstadt', function: 'Маркетинг і продажі', status: 'new', priority: 'medium', deadlineDate: _demoDate(2), deadlineTime: '15:00', expectedResult: 'Підписаний протокол зустрічі' },
    { title: 'Оплата постачальнику Bauhaus', function: 'Фінанси', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '16:00', expectedResult: 'Платіж підтверджений' },
    { title: 'Контроль бригади — будинок Krefeld', function: 'Виробництво (бригада)', status: 'progress', priority: 'medium', deadlineDate: _demoDate(-2), deadlineTime: '18:00', expectedResult: 'Фото-звіт по фундаменту' },
    { title: 'Дозвіл на будівництво — Krefeld', function: 'Адміністрування', status: 'new', priority: 'high', deadlineDate: _demoDate(-5), deadlineTime: '10:00', expectedResult: 'Bauantrag поданий в Bauamt' },
    { title: 'Виставити рахунок Familie Weber', function: 'Фінанси', status: 'new', priority: 'medium', deadlineDate: _demoDate(0), deadlineTime: '17:00', expectedResult: 'Invoice відправлений, очікуємо оплату 7 днів' },
    { title: 'Реклама Google Ads — ремонт ванних', function: 'Маркетинг і продажі', status: 'progress', priority: 'low', deadlineDate: _demoDate(3), deadlineTime: '18:00', expectedResult: 'Кампанія запущена, бюджет 300EUR/міс' },
    { title: 'Перевірка якості — Sonnenhof', function: 'Виробництво (бригада)', status: 'review', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '11:00', expectedResult: 'Акт прийому підписаний клієнтом' },
    { title: 'Навчання бригади: безпека праці', function: 'Адміністрування', status: 'new', priority: 'low', deadlineDate: _demoDate(-7), deadlineTime: '09:00', expectedResult: 'Підписи в журналі інструктажу' },
  ];
  tasks.forEach((task, i) => {
    const fi = i % funcs.length;
    const uid = uids[fi % uids.length];
    ops.push(b => b.set(companyRef.collection('tasks').doc(), {
      ...task,
      assigneeId: uid,
      assigneeName: users[fi % users.length].name,
      createdBy: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deadline: firebase.firestore.Timestamp.fromDate(new Date(task.deadlineDate + 'T' + task.deadlineTime))
    }));
  });

  await _demoBatchCommit(ops);

  await _loadDemoFinance(companyRef, 'EUR', 'construction',
    [{ name: 'Розрахунковий рахунок (DE)', balance: 47200 }, { name: 'Каса готівка', balance: 3800 }],
    ['Оплата від клієнтів', 'Аванс за об\'єкт', 'Доплата за роботи'],
    ['Матеріали', 'Зарплата бригад', 'Оренда техніки', 'Реклама', 'Адміністративні', 'Паливо / логістика', 'Інструмент та обладнання'],
    [
      { monthOffset: -2, transactions: [
        { type:'income', amount:28000, category:'Оплата від клієнтів', counterparty:'Familie Müller', comment:'Оплата 70% — кухня Sonnenhof', day:5 },
        { type:'income', amount:12000, category:'Аванс за об\'єкт', counterparty:'Firma Weber GmbH', comment:'Аванс 30% — офіс Innenstadt', day:8 },
        { type:'expense', amount:9800, category:'Матеріали', counterparty:'Bauhaus Düsseldorf', comment:'Плитка, гіпсокартон, шпаклівка', day:3 },
        { type:'expense', amount:14000, category:'Зарплата бригад', counterparty:'', comment:'Зарплата 2 бригади — серпень', day:30 },
        { type:'expense', amount:1800, category:'Реклама', counterparty:'Google Ads', comment:'Контекстна реклама', day:15 },
        { type:'expense', amount:1200, category:'Паливо / логістика', counterparty:'', comment:'Паливо, транспорт матеріалів', day:18 },
      ]},
      { monthOffset: -1, transactions: [
        { type:'income', amount:42000, category:'Оплата від клієнтів', counterparty:'Firma Weber GmbH', comment:'70% оплата — офіс Innenstadt', day:10 },
        { type:'income', amount:7200, category:'Доплата за роботи', counterparty:'Familie Braun', comment:'Фінальна оплата — ванна Köln', day:18 },
        { type:'expense', amount:16500, category:'Матеріали', counterparty:'OBI, Hornbach', comment:'Матеріали офіс + будинок Krefeld', day:5 },
        { type:'expense', amount:14000, category:'Зарплата бригад', counterparty:'', comment:'Зарплата — вересень', day:30 },
        { type:'expense', amount:3200, category:'Оренда техніки', counterparty:'Cramo GmbH', comment:'Будівельний ліфт, риштування', day:8 },
        { type:'expense', amount:900, category:'Реклама', counterparty:'Instagram Ads', comment:'Таргет — ремонт квартир Düsseldorf', day:12 },
        { type:'expense', amount:800, category:'Паливo / логістика', counterparty:'', comment:'Паливо', day:20 },
      ]},
      { monthOffset: 0, transactions: [
        { type:'income', amount:55000, category:'Аванс за об\'єкт', counterparty:'Herr Schmidt', comment:'Аванс 30% — будинок Krefeld', day:3 },
        { type:'expense', amount:18000, category:'Матеріали', counterparty:'Bauhaus, Hornbach', comment:'Матеріали Krefeld — фундамент та стіни', day:4 },
        { type:'expense', amount:14000, category:'Зарплата бригад', counterparty:'', comment:'Зарплата — жовтень', day:5 },
        { type:'expense', amount:1500, category:'Реклама', counterparty:'Google Ads', comment:'Підвищений бюджет — осінній сезон', day:6 },
      ]},
    ]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. МЕДИЧНА КЛІНІКА — UAH
// ════════════════════════════════════════════════════════════════════════════
async function loadMedicalDemoData() {
  const companyRef = db.collection('companies').doc(currentCompany);
  const ops = [];

  await _saveDemoCompanyProfile('medical',
    'Медичний центр «Здоров\'я»',
    'Допомагати пацієнтам швидко отримати якісну медичну допомогу без черг і бюрократії',
    'Приватна клініка у Луцьку. Приймаємо 8 спеціалістів, УЗД, лабораторія. Запис онлайн за 5 хвилин, результати в день аналізу.',
    'Вчасно поставлений діагноз і призначене лікування, після якого пацієнт почувається краще',
    '2026: 120 пацієнтів/день, виручка 1.8М грн/міс, маржа 32%, 15 лікарів, філія в Рівному',
    'UAH'
  );

  const users = [
    { name: 'Наталія Дорош', email: 'natalia@clinic.ua', role: 'manager' },
    { name: 'Андрій Ковалів', email: 'andriy@clinic.ua', role: 'employee' },
    { name: 'Ірина Мороз', email: 'iryna@clinic.ua', role: 'employee' },
  ];
  const uids = users.map(() => companyRef.collection('users').doc().id);
  users.forEach((u, i) => ops.push(b => b.set(companyRef.collection('users').doc(uids[i]), { ...u, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const funcs = [
    { name: 'Адміністрування', description: 'Запис, ресепшн, документи, виклики', assigneeIds: [uids[0]] },
    { name: 'Медична допомога', description: 'Прийоми лікарів, процедури, УЗД', assigneeIds: [uids[1]] },
    { name: 'Лабораторія', description: 'Аналізи, видача результатів', assigneeIds: [uids[2]] },
    { name: 'Маркетинг', description: 'Реклама, відгуки, контент', assigneeIds: [uids[0]] },
    { name: 'Закупівлі', description: 'Медикаменти, витратні матеріали, обладнання', assigneeIds: [uids[2]] },
    { name: 'Фінанси', description: 'Виручка по лікарях, витрати, план-факт', assigneeIds: [uids[0]] },
  ];
  const fids = funcs.map(() => companyRef.collection('functions').doc().id);
  funcs.forEach((f, i) => ops.push(b => b.set(companyRef.collection('functions').doc(fids[i]), { ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const regular = [
    { title: 'Підтвердження записів на завтра', function: 'Адміністрування', period: 'weekly', daysOfWeek: ['1','2','3','4','5'], timeStart: '17:00', timeEnd: '18:00', instruction: 'Зателефонувати або написати SMS всім пацієнтам, записаним на завтра. Підтвердити візит.', expectedResult: '100% підтверджень або перенесень' },
    { title: 'Замовлення витратних матеріалів', function: 'Закупівлі', period: 'weekly', daysOfWeek: ['4'], timeStart: '13:00', timeEnd: '14:00', instruction: 'Перевірити залишки рукавичок, масок, шприців, дез. засобів. Оформити замовлення.', expectedResult: 'Замовлення розміщене у постачальника' },
    { title: 'Тижневий звіт по виручці лікарів', function: 'Фінанси', period: 'weekly', daysOfWeek: ['5'], timeStart: '18:00', timeEnd: '19:00', instruction: 'Зібрати виручку по кожному лікарю за тиждень. Порівняти з планом. Сформувати таблицю.', expectedResult: 'Звіт в Google Sheets, відправлений керівнику' },
    { title: 'Відповіді на відгуки Google Maps', function: 'Маркетинг', period: 'weekly', daysOfWeek: ['2','4'], timeStart: '10:00', timeEnd: '10:30', instruction: 'Перевірити Google Maps, Liki24, Zdravoe. Відповісти на кожен відгук протягом 24 годин.', expectedResult: 'Всі відгуки мають відповідь' },
    { title: 'Ревізія терміну придатності медикаментів', function: 'Закупівлі', period: 'monthly', dayOfMonth: '1', timeStart: '09:00', timeEnd: '11:00', instruction: 'Перевірити термін придатності всіх препаратів та матеріалів. Списати прострочені.', expectedResult: 'Акт ревізії підписаний, список на замовлення сформований' },
  ];
  regular.forEach(r => ops.push(b => b.set(companyRef.collection('regularTasks').doc(), { ...r, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const projects = [
    { name: 'Відкриття відділу косметології', status: 'active', color: '#ec4899', description: 'Ліцензія, обладнання, найм косметолога', deadline: _demoDate(45) },
    { name: 'CRM для запису пацієнтів', status: 'active', color: '#3b82f6', description: 'Впровадження онлайн-запису та нагадувань', deadline: _demoDate(20) },
    { name: 'Сертифікація лабораторії', status: 'active', color: '#f59e0b', description: 'Отримання акредитації МОЗ', deadline: _demoDate(60) },
  ];
  projects.forEach(p => ops.push(b => b.set(companyRef.collection('projects').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const tasks = [
    { title: 'Підготувати план маркетингу на Q4', function: 'Маркетинг', status: 'new', priority: 'high', deadlineDate: _demoDate(3), deadlineTime: '17:00', expectedResult: 'Погоджений план з бюджетом' },
    { title: 'Оплата оренди за місяць', function: 'Фінанси', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '16:00', expectedResult: 'Квитанція про оплату' },
    { title: 'Відповісти на 7 нових відгуків', function: 'Маркетинг', status: 'new', priority: 'medium', deadlineDate: _demoDate(0), deadlineTime: '12:00', expectedResult: 'Всі відгуки оброблені' },
    { title: 'Замовити шприці і рукавички', function: 'Закупівлі', status: 'progress', priority: 'high', deadlineDate: _demoDate(-2), deadlineTime: '14:00', expectedResult: 'Замовлення підтверджено' },
    { title: 'Скласти розклад лікарів на тиждень', function: 'Адміністрування', status: 'new', priority: 'medium', deadlineDate: _demoDate(1), deadlineTime: '09:00', expectedResult: 'Розклад розміщений на сайті та WhatsApp' },
    { title: 'Звіт по лікарях — аналіз виручки', function: 'Фінанси', status: 'review', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '18:00', expectedResult: 'Топ-3 і аутсайдери з причинами' },
    { title: 'Налаштувати Binotel для клініки', function: 'Адміністрування', status: 'progress', priority: 'medium', deadlineDate: _demoDate(-4), deadlineTime: '17:00', expectedResult: 'IP-телефонія працює, дзвінки записуються' },
    { title: 'Запустити рекламу послуги УЗД', function: 'Маркетинг', status: 'new', priority: 'medium', deadlineDate: _demoDate(5), deadlineTime: '15:00', expectedResult: 'Кампанія Meta Ads запущена' },
  ];
  tasks.forEach((task, i) => {
    const fi = i % funcs.length;
    ops.push(b => b.set(companyRef.collection('tasks').doc(), {
      ...task, assigneeId: uids[fi % uids.length], assigneeName: users[fi % users.length].name,
      createdBy: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deadline: firebase.firestore.Timestamp.fromDate(new Date(task.deadlineDate + 'T' + task.deadlineTime))
    }));
  });

  await _demoBatchCommit(ops);
  await _loadDemoFinance(companyRef, 'UAH', 'medical',
    [{ name: 'Поточний рахунок (ПриватБанк)', balance: 285000 }, { name: 'Каса', balance: 42000 }],
    ['Консультації лікарів', 'УЗД та діагностика', 'Лабораторні аналізи', 'Процедури'],
    ['Зарплата лікарів (50%)', 'Оренда приміщення', 'Витратні матеріали', 'Реклама', 'Комунальні', 'Лабораторні реагенти', 'Адміністративні'],
    [
      { monthOffset:-2, transactions:[
        {type:'income',amount:680000,category:'Консультації лікарів',counterparty:'',comment:'Серпень — консультації',day:31},
        {type:'income',amount:180000,category:'УЗД та діагностика',counterparty:'',comment:'УЗД серпень',day:31},
        {type:'income',amount:95000,category:'Лабораторні аналізи',counterparty:'',comment:'Аналізи серпень',day:31},
        {type:'expense',amount:380000,category:'Зарплата лікарів (50%)',counterparty:'',comment:'ФОП лікарів серпень',day:30},
        {type:'expense',amount:55000,category:'Оренда приміщення',counterparty:'ФОП Лесько',comment:'Оренда серпень',day:1},
        {type:'expense',amount:42000,category:'Витратні матеріали',counterparty:'Medline',comment:'',day:10},
        {type:'expense',amount:28000,category:'Реклама',counterparty:'Meta, Google',comment:'',day:15},
      ]},
      { monthOffset:-1, transactions:[
        {type:'income',amount:742000,category:'Консультації лікарів',counterparty:'',comment:'Вересень',day:30},
        {type:'income',amount:198000,category:'УЗД та діагностика',counterparty:'',comment:'',day:30},
        {type:'income',amount:108000,category:'Лабораторні аналізи',counterparty:'',comment:'',day:30},
        {type:'expense',amount:420000,category:'Зарплата лікарів (50%)',counterparty:'',comment:'',day:30},
        {type:'expense',amount:55000,category:'Оренда приміщення',counterparty:'ФОП Лесько',comment:'',day:1},
        {type:'expense',amount:38000,category:'Витратні матеріали',counterparty:'Medline',comment:'',day:12},
        {type:'expense',amount:35000,category:'Реклама',counterparty:'Meta, Google',comment:'',day:14},
        {type:'expense',amount:18000,category:'Лабораторні реагенти',counterparty:'Діла',comment:'',day:8},
      ]},
      { monthOffset:0, transactions:[
        {type:'income',amount:520000,category:'Консультації лікарів',counterparty:'',comment:'Жовтень (неповний)',day:15},
        {type:'income',amount:140000,category:'УЗД та діагностика',counterparty:'',comment:'',day:15},
        {type:'expense',amount:420000,category:'Зарплата лікарів (50%)',counterparty:'',comment:'',day:5},
        {type:'expense',amount:55000,category:'Оренда приміщення',counterparty:'',comment:'',day:1},
        {type:'expense',amount:40000,category:'Реклама',counterparty:'',comment:'Підвищений бюджет жовтень',day:3},
      ]},
    ]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. МЕБЛЕВЕ ВИРОБНИЦТВО — UAH
// ════════════════════════════════════════════════════════════════════════════
async function loadFurnitureFactoryDemoData() {
  const companyRef = db.collection('companies').doc(currentCompany);
  const ops = [];

  await _saveDemoCompanyProfile('furniture',
    'Меблі «Форест»',
    'Виготовляти меблі на замовлення, що служать роками і радують клієнта з першого дня',
    'Меблева майстерня в Тернополі. Кухні, шафи, дитячі — під замовлення. Власне виробництво, матеріали від польських постачальників. Термін виготовлення 21-28 днів.',
    'Встановлені меблі, якими клієнт задоволений і рекомендує нас знайомим',
    '2026: 45 замовлень/міс, виручка 1.1М грн/міс, маржа 28%, 12 виробничих + 3 монтажники',
    'UAH'
  );

  const users = [
    { name: 'Сергій Бондар', email: 'sergiy@forest.ua', role: 'manager' },
    { name: 'Ігор Лисенко', email: 'igor@forest.ua', role: 'employee' },
    { name: 'Катерина Гриценко', email: 'kate@forest.ua', role: 'employee' },
  ];
  const uids = users.map(() => companyRef.collection('users').doc().id);
  users.forEach((u, i) => ops.push(b => b.set(companyRef.collection('users').doc(uids[i]), { ...u, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const funcs = [
    { name: 'Виробництво', description: 'Розкрій, збирання, лакування меблів', assigneeIds: [uids[1]] },
    { name: 'Монтаж', description: 'Доставка та встановлення у клієнта', assigneeIds: [uids[1]] },
    { name: 'Проектування', description: 'Дизайн, 3D-візуалізація, технічне завдання', assigneeIds: [uids[2]] },
    { name: 'Закупівлі', description: 'ЛДСП, фасади, фурнітура, оздоблення', assigneeIds: [uids[0]] },
    { name: 'Продажі', description: 'Замір, консультація, договір', assigneeIds: [uids[2]] },
    { name: 'Фінанси', description: 'Контроль собівартості, оплати, прибуток', assigneeIds: [uids[0]] },
  ];
  const fids = funcs.map(() => companyRef.collection('functions').doc().id);
  funcs.forEach((f, i) => ops.push(b => b.set(companyRef.collection('functions').doc(fids[i]), { ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const regular = [
    { title: 'Контроль виробничого плану', function: 'Виробництво', period: 'weekly', daysOfWeek: ['1','3','5'], timeStart: '08:00', timeEnd: '08:30', instruction: 'Перевірити статус кожного замовлення в роботі. Актуалізувати дати здачі.', expectedResult: 'Таблиця замовлень оновлена' },
    { title: 'Замовлення матеріалів у Польщі', function: 'Закупівлі', period: 'weekly', daysOfWeek: ['2'], timeStart: '10:00', timeEnd: '12:00', instruction: 'Зібрати потреби по всіх замовленнях на тиждень. Оформити замовлення у Kronospan, Egger.', expectedResult: 'Замовлення підтверджено, дата доставки визначена' },
    { title: 'Обдзвін клієнтів — підтвердження монтажу', function: 'Монтаж', period: 'weekly', daysOfWeek: ['4'], timeStart: '14:00', timeEnd: '15:00', instruction: 'Підтвердити дату монтажу з кожним клієнтом на наступний тиждень.', expectedResult: 'Графік монтажу підтверджений' },
    { title: 'Фінансовий звіт по замовленнях', function: 'Фінанси', period: 'weekly', daysOfWeek: ['5'], timeStart: '17:00', timeEnd: '18:00', instruction: 'Виручка, собівартість, маржа по кожному завершеному замовленню.', expectedResult: 'Таблиця рентабельності замовлень оновлена' },
    { title: 'Публікація кейсів у Instagram', function: 'Продажі', period: 'weekly', daysOfWeek: ['2','5'], timeStart: '12:00', timeEnd: '12:30', instruction: 'Фото встановлених меблів до/після. Написати пост з деталями.', expectedResult: 'Пост опублікований' },
  ];
  regular.forEach(r => ops.push(b => b.set(companyRef.collection('regularTasks').doc(), { ...r, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const projects = [
    { name: 'Кухня — вул. Грушевського 18', status: 'active', color: '#22c55e', description: 'Кухня 4.2м L-подібна, фасади МДФ матові. Виробництво.', deadline: _demoDate(12) },
    { name: 'Гардеробна — ЖК Зелений Парк', status: 'active', color: '#3b82f6', description: 'Гардеробна 6.5м², дзеркальні двері.', deadline: _demoDate(18) },
    { name: 'Дитяча — Тернопіль, вул. Шевченка', status: 'active', color: '#f59e0b', description: 'Двоярусне ліжко + стіл + шафа', deadline: _demoDate(8) },
    { name: 'Офісні меблі — ТОВ Агро-Захід', status: 'active', color: '#8b5cf6', description: '12 робочих місць + ресепшн + переговорна', deadline: _demoDate(30) },
  ];
  projects.forEach(p => ops.push(b => b.set(companyRef.collection('projects').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const tasks = [
    { title: 'Замір кухні — вул. Садова 5', function: 'Продажі', status: 'new', priority: 'high', deadlineDate: _demoDate(1), deadlineTime: '14:00', expectedResult: 'Виміри, технічне завдання, фото' },
    { title: 'Розкрій ЛДСП — замовлення №47', function: 'Виробництво', status: 'progress', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '18:00', expectedResult: '100% деталей розкроєні' },
    { title: 'Замовити фасади МДФ (матові графіт)', function: 'Закупівлі', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '12:00', expectedResult: 'Рахунок оплачено, виробництво підтверджено' },
    { title: '3D-візуалізація — гардеробна Зелений Парк', function: 'Проектування', status: 'progress', priority: 'medium', deadlineDate: _demoDate(2), deadlineTime: '17:00', expectedResult: '3 варіанти для вибору клієнтом' },
    { title: 'Монтаж дитячої кімнати', function: 'Монтаж', status: 'new', priority: 'high', deadlineDate: _demoDate(3), deadlineTime: '09:00', expectedResult: 'Акт виконаних робіт підписаний' },
    { title: 'Контроль фурнітури на складі', function: 'Закупівлі', status: 'new', priority: 'medium', deadlineDate: _demoDate(-3), deadlineTime: '10:00', expectedResult: 'Залишки оновлені, дефіцит замовлений' },
    { title: 'Виставити рахунок ТОВ Агро-Захід', function: 'Фінанси', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '16:00', expectedResult: 'Рахунок відправлений, аванс 50% очікується' },
    { title: 'Фото кейс — кухня Грушевського', function: 'Продажі', status: 'new', priority: 'low', deadlineDate: _demoDate(5), deadlineTime: '15:00', expectedResult: 'Фото до/після + відгук клієнта' },
  ];
  tasks.forEach((task, i) => {
    const fi = i % funcs.length;
    ops.push(b => b.set(companyRef.collection('tasks').doc(), {
      ...task, assigneeId: uids[fi % uids.length], assigneeName: users[fi % users.length].name,
      createdBy: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deadline: firebase.firestore.Timestamp.fromDate(new Date(task.deadlineDate + 'T' + task.deadlineTime))
    }));
  });

  await _demoBatchCommit(ops);
  await _loadDemoFinance(companyRef, 'UAH', 'furniture',
    [{ name: 'Поточний рахунок', balance: 182000 }, { name: 'Каса', balance: 28000 }],
    ['Оплата замовлень', 'Аванс (50%)', 'Доплата при монтажі'],
    ['Матеріали (ЛДСП, фасади)', 'Фурнітура', 'Зарплата виробництво', 'Зарплата монтаж', 'Реклама', 'Оренда цеху', 'Логістика доставка'],
    [
      { monthOffset:-2, transactions:[
        {type:'income',amount:420000,category:'Оплата замовлень',counterparty:'',comment:'Серпень — 28 замовлень',day:31},
        {type:'income',amount:180000,category:'Аванс (50%)',counterparty:'',comment:'Аванси на вересень',day:25},
        {type:'expense',amount:145000,category:'Матеріали (ЛДСП, фасади)',counterparty:'Kronospan UA',comment:'',day:5},
        {type:'expense',amount:62000,category:'Фурнітура',counterparty:'Blum, Hettich',comment:'',day:8},
        {type:'expense',amount:120000,category:'Зарплата виробництво',counterparty:'',comment:'8 майстрів',day:30},
        {type:'expense',amount:38000,category:'Зарплата монтаж',counterparty:'',comment:'2 монтажники',day:30},
        {type:'expense',amount:25000,category:'Оренда цеху',counterparty:'',comment:'',day:1},
      ]},
      { monthOffset:-1, transactions:[
        {type:'income',amount:485000,category:'Оплата замовлень',counterparty:'',comment:'32 замовлення',day:30},
        {type:'income',amount:210000,category:'Аванс (50%)',counterparty:'ТОВ Агро-Захід',comment:'Офіс 12 місць',day:20},
        {type:'expense',amount:168000,category:'Матеріали (ЛДСП, фасади)',counterparty:'Egger',comment:'',day:6},
        {type:'expense',amount:74000,category:'Фурнітура',counterparty:'',comment:'',day:9},
        {type:'expense',amount:120000,category:'Зарплата виробництво',counterparty:'',comment:'',day:30},
        {type:'expense',amount:38000,category:'Зарплата монтаж',counterparty:'',comment:'',day:30},
        {type:'expense',amount:25000,category:'Оренда цеху',counterparty:'',comment:'',day:1},
        {type:'expense',amount:18000,category:'Реклама',counterparty:'Meta, OLX',comment:'',day:12},
      ]},
      { monthOffset:0, transactions:[
        {type:'income',amount:350000,category:'Оплата замовлень',counterparty:'',comment:'Жовтень (неповний)',day:15},
        {type:'expense',amount:120000,category:'Матеріали (ЛДСП, фасади)',counterparty:'',comment:'',day:4},
        {type:'expense',amount:120000,category:'Зарплата виробництво',counterparty:'',comment:'',day:5},
        {type:'expense',amount:25000,category:'Оренда цеху',counterparty:'',comment:'',day:1},
      ]},
    ]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. КЛІНІНГ (США) — USD
// ════════════════════════════════════════════════════════════════════════════
async function loadCleaningDemoData() {
  const companyRef = db.collection('companies').doc(currentCompany);
  const ops = [];

  await _saveDemoCompanyProfile('other',
    'CleanPro Services LLC',
    'Provide reliable commercial and residential cleaning so clients always walk into a spotless space',
    'Commercial cleaning company in Chicago. 24/7 service, bonded & insured teams, eco-friendly products. 85+ recurring contracts. Specialized in offices, medical facilities, and Airbnb.',
    'Spotless property delivered on schedule with zero complaints',
    '2026: $180k/month revenue, 35% margin, 45 employees, expand to suburbs',
    'USD'
  );

  const users = [
    { name: 'Maria Gonzalez', email: 'maria@cleanpro.us', role: 'manager' },
    { name: 'James Taylor', email: 'james@cleanpro.us', role: 'employee' },
    { name: 'Sofia Petrenko', email: 'sofia@cleanpro.us', role: 'employee' },
  ];
  const uids = users.map(() => companyRef.collection('users').doc().id);
  users.forEach((u, i) => ops.push(b => b.set(companyRef.collection('users').doc(uids[i]), { ...u, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const funcs = [
    { name: 'Operations / Cleaning', description: 'Daily cleaning teams, scheduling, quality control', assigneeIds: [uids[1]] },
    { name: 'Sales & Contracts', description: 'New clients, contract renewals, upsells', assigneeIds: [uids[0]] },
    { name: 'HR / Staffing', description: 'Hiring, training, scheduling cleaners', assigneeIds: [uids[0]] },
    { name: 'Supply & Equipment', description: 'Chemicals, tools, uniforms procurement', assigneeIds: [uids[2]] },
    { name: 'Finance', description: 'Invoicing, payroll, P&L by client', assigneeIds: [uids[2]] },
  ];
  const fids = funcs.map(() => companyRef.collection('functions').doc().id);
  funcs.forEach((f, i) => ops.push(b => b.set(companyRef.collection('functions').doc(fids[i]), { ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const regular = [
    { title: 'Weekly quality inspection — top 10 clients', function: 'Operations / Cleaning', period: 'weekly', daysOfWeek: ['5'], timeStart: '14:00', timeEnd: '17:00', instruction: 'Visit or call the 10 highest-value clients. Rate quality 1-5. Document issues. Send report.', expectedResult: 'Quality report submitted, issues actioned' },
    { title: 'Payroll processing', function: 'Finance', period: 'weekly', daysOfWeek: ['5'], timeStart: '10:00', timeEnd: '12:00', instruction: 'Calculate hours from scheduling app. Process payroll via Gusto. Confirm deposits.', expectedResult: 'All team paid by Friday noon' },
    { title: 'Send weekly invoices', function: 'Finance', period: 'weekly', daysOfWeek: ['1'], timeStart: '09:00', timeEnd: '11:00', instruction: 'Generate invoices for all weekly/bi-weekly clients. Send via QuickBooks.', expectedResult: '100% invoices sent' },
    { title: 'Restock supplies', function: 'Supply & Equipment', period: 'weekly', daysOfWeek: ['3'], timeStart: '08:00', timeEnd: '09:00', instruction: 'Check chemical inventory. Order from Zoro or Amazon if below 2-week supply.', expectedResult: 'Order placed, ETA confirmed' },
    { title: 'Follow up on overdue invoices', function: 'Finance', period: 'weekly', daysOfWeek: ['2','4'], timeStart: '10:00', timeEnd: '11:00', instruction: 'Check QuickBooks for invoices >14 days unpaid. Call or email client.', expectedResult: 'Payment collected or payment plan agreed' },
  ];
  regular.forEach(r => ops.push(b => b.set(companyRef.collection('regularTasks').doc(), { ...r, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const projects = [
    { name: 'New contract — Loop Tower offices', status: 'active', color: '#3b82f6', description: '12,000 sqft office, 5x/week. $8,400/month', deadline: _demoDate(10) },
    { name: 'Airbnb portfolio — Lincoln Park', status: 'active', color: '#22c55e', description: '14 units, turnover cleaning. Revenue share model.', deadline: _demoDate(5) },
    { name: 'Hire 6 cleaners for Q4', status: 'active', color: '#f59e0b', description: 'Seasonal growth — need 6 full-time by Nov 1', deadline: _demoDate(15) },
  ];
  projects.forEach(p => ops.push(b => b.set(companyRef.collection('projects').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const tasks = [
    { title: 'Send proposal to Loop Tower offices', function: 'Sales & Contracts', status: 'new', priority: 'high', deadlineDate: _demoDate(1), deadlineTime: '17:00', expectedResult: 'Proposal sent, follow-up scheduled' },
    { title: 'Interview 3 cleaning candidates', function: 'HR / Staffing', status: 'new', priority: 'high', deadlineDate: _demoDate(2), deadlineTime: '14:00', expectedResult: 'At least 2 hired' },
    { title: 'Quality check — MedStar Clinic', function: 'Operations / Cleaning', status: 'progress', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '10:00', expectedResult: 'Score 5/5, photos submitted' },
    { title: 'Collect overdue — Acme Corp ($1,200)', function: 'Finance', status: 'new', priority: 'high', deadlineDate: _demoDate(-2), deadlineTime: '16:00', expectedResult: 'Payment received or escalated' },
    { title: 'Order eco-friendly cleaners (bulk)', function: 'Supply & Equipment', status: 'progress', priority: 'medium', deadlineDate: _demoDate(1), deadlineTime: '12:00', expectedResult: 'Order confirmed, delivery in 3 days' },
    { title: 'Renew contract — Riverside Apartments', function: 'Sales & Contracts', status: 'new', priority: 'medium', deadlineDate: _demoDate(5), deadlineTime: '15:00', expectedResult: 'Contract signed for 12 months' },
    { title: 'Set up new team schedule — Airbnb units', function: 'Operations / Cleaning', status: 'new', priority: 'medium', deadlineDate: _demoDate(3), deadlineTime: '18:00', expectedResult: 'Schedule in Jobber app updated' },
  ];
  tasks.forEach((task, i) => {
    const fi = i % funcs.length;
    ops.push(b => b.set(companyRef.collection('tasks').doc(), {
      ...task, assigneeId: uids[fi % uids.length], assigneeName: users[fi % users.length].name,
      createdBy: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deadline: firebase.firestore.Timestamp.fromDate(new Date(task.deadlineDate + 'T' + task.deadlineTime))
    }));
  });

  await _demoBatchCommit(ops);
  await _loadDemoFinance(companyRef, 'USD', 'other',
    [{ name: 'Chase Business Checking', balance: 42800 }, { name: 'PayPal Business', balance: 6200 }],
    ['Recurring contracts', 'One-time cleanings', 'Airbnb turnover'],
    ['Payroll (cleaners)', 'Cleaning supplies', 'Insurance & bonds', 'Fuel & transport', 'Advertising', 'Software (Jobber, QB)', 'Admin'],
    [
      { monthOffset:-2, transactions:[
        {type:'income',amount:112000,category:'Recurring contracts',counterparty:'',comment:'Aug — 68 recurring clients',day:31},
        {type:'income',amount:18500,category:'One-time cleanings',counterparty:'',comment:'Move-out, post-construction',day:31},
        {type:'expense',amount:52000,category:'Payroll (cleaners)',counterparty:'',comment:'28 cleaners — August',day:30},
        {type:'expense',amount:8200,category:'Cleaning supplies',counterparty:'Zoro.com',comment:'',day:8},
        {type:'expense',amount:3800,category:'Insurance & bonds',counterparty:'Hiscox',comment:'Monthly premium',day:1},
        {type:'expense',amount:4200,category:'Fuel & transport',counterparty:'',comment:'',day:20},
        {type:'expense',amount:3500,category:'Advertising',counterparty:'Google Ads',comment:'',day:15},
      ]},
      { monthOffset:-1, transactions:[
        {type:'income',amount:128000,category:'Recurring contracts',counterparty:'',comment:'Sep — 76 clients',day:30},
        {type:'income',amount:22000,category:'Airbnb turnover',counterparty:'',comment:'Lincoln Park portfolio',day:30},
        {type:'expense',amount:58000,category:'Payroll (cleaners)',counterparty:'',comment:'32 cleaners',day:30},
        {type:'expense',amount:9400,category:'Cleaning supplies',counterparty:'Amazon Business',comment:'',day:7},
        {type:'expense',amount:3800,category:'Insurance & bonds',counterparty:'',comment:'',day:1},
        {type:'expense',amount:4800,category:'Fuel & transport',counterparty:'',comment:'',day:20},
        {type:'expense',amount:4200,category:'Advertising',counterparty:'Google, Yelp',comment:'',day:12},
      ]},
      { monthOffset:0, transactions:[
        {type:'income',amount:92000,category:'Recurring contracts',counterparty:'',comment:'Oct partial',day:15},
        {type:'income',amount:14000,category:'Airbnb turnover',counterparty:'',comment:'',day:15},
        {type:'expense',amount:58000,category:'Payroll (cleaners)',counterparty:'',comment:'',day:5},
        {type:'expense',amount:3800,category:'Insurance & bonds',counterparty:'',comment:'',day:1},
      ]},
    ]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. ТРАК / OWNER-OPERATOR (США) — USD
// ════════════════════════════════════════════════════════════════════════════
async function loadTruckingDemoData() {
  const companyRef = db.collection('companies').doc(currentCompany);
  const ops = [];

  await _saveDemoCompanyProfile('logistics',
    'A1 Trucking Solutions LLC',
    'Deliver freight on time, every time — keeping supply chains moving across the Midwest',
    'Owner-operator trucking company based in Chicago. 3 trucks, dry van and reefer. Broker loads + dedicated lanes. DOT compliant, ELD enabled.',
    'Freight delivered on time with zero damage claims and positive broker reviews',
    '2026: 5 trucks, $85k/month net revenue, hire 2 drivers, dedicated Amazon lane',
    'USD'
  );

  const users = [
    { name: 'Alex Kovalenko', email: 'alex@a1trucking.us', role: 'manager' },
    { name: 'Dmitri Shevchenko', email: 'dmitri@a1trucking.us', role: 'employee' },
    { name: 'Maria Santos', email: 'maria@a1trucking.us', role: 'employee' },
  ];
  const uids = users.map(() => companyRef.collection('users').doc().id);
  users.forEach((u, i) => ops.push(b => b.set(companyRef.collection('users').doc(uids[i]), { ...u, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const funcs = [
    { name: 'Dispatch / Load Planning', description: 'Finding loads, booking, route planning', assigneeIds: [uids[0]] },
    { name: 'Driving / Delivery', description: 'Picking up and delivering freight', assigneeIds: [uids[1]] },
    { name: 'Maintenance & Safety', description: 'Truck maintenance, DOT compliance, inspections', assigneeIds: [uids[1]] },
    { name: 'Admin & Accounting', description: 'Invoicing, IFTA, permits, bookkeeping', assigneeIds: [uids[2]] },
    { name: 'Fuel & Cost Control', description: 'Fuel cards, cost per mile tracking', assigneeIds: [uids[2]] },
  ];
  const fids = funcs.map(() => companyRef.collection('functions').doc().id);
  funcs.forEach((f, i) => ops.push(b => b.set(companyRef.collection('functions').doc(fids[i]), { ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const regular = [
    { title: 'Book loads for next week', function: 'Dispatch / Load Planning', period: 'weekly', daysOfWeek: ['4'], timeStart: '09:00', timeEnd: '12:00', instruction: 'Check DAT, TruckStop, and broker portals. Book minimum 5 loads per truck for next week. Prioritize $2.50+/mile.', expectedResult: 'All trucks booked Mon-Fri, lane summary sent to drivers' },
    { title: 'Weekly truck inspection (pre-trip)', function: 'Maintenance & Safety', period: 'weekly', daysOfWeek: ['1'], timeStart: '06:00', timeEnd: '07:00', instruction: 'Check tires, lights, brakes, fluid levels. Complete FMCSA pre-trip inspection form. Report defects.', expectedResult: 'Inspection form signed, any defects reported' },
    { title: 'Submit invoices to brokers', function: 'Admin & Accounting', period: 'weekly', daysOfWeek: ['1'], timeStart: '08:00', timeEnd: '10:00', instruction: 'Upload POD (Proof of Delivery) to broker portals for all loads delivered last week. Track payment terms.', expectedResult: '100% PODs submitted, expected payment dates logged' },
    { title: 'IFTA mileage log update', function: 'Admin & Accounting', period: 'weekly', daysOfWeek: ['5'], timeStart: '16:00', timeEnd: '17:00', instruction: 'Export ELD data. Update mileage by state for IFTA quarterly filing preparation.', expectedResult: 'Mileage log updated in spreadsheet' },
    { title: 'Fuel card audit & cost per mile', function: 'Fuel & Cost Control', period: 'weekly', daysOfWeek: ['5'], timeStart: '14:00', timeEnd: '15:00', instruction: 'Download fuel card statements. Calculate cost per mile per truck. Compare to $0.58/mile target.', expectedResult: 'Cost per mile report, anomalies flagged' },
  ];
  regular.forEach(r => ops.push(b => b.set(companyRef.collection('regularTasks').doc(), { ...r, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const projects = [
    { name: 'Add 4th truck — lease or buy', status: 'active', color: '#3b82f6', description: 'Evaluate Freightliner Cascadia 2022 lease vs purchase', deadline: _demoDate(30) },
    { name: 'Get Amazon Relay approval', status: 'active', color: '#f59e0b', description: 'Dedicated lanes, better rates. Apply and pass audit.', deadline: _demoDate(20) },
    { name: 'Hire 2nd driver for Truck 2', status: 'active', color: '#22c55e', description: 'CDL-A, clean MVR, 2yr OTR experience minimum', deadline: _demoDate(14) },
  ];
  projects.forEach(p => ops.push(b => b.set(companyRef.collection('projects').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const tasks = [
    { title: 'Book Chicago → Dallas run for Truck 1', function: 'Dispatch / Load Planning', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '12:00', expectedResult: 'Load booked $2.80/mile, pickup confirmed' },
    { title: 'Submit POD — Walmart load #TT8821', function: 'Admin & Accounting', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '10:00', expectedResult: 'POD uploaded to Coyote portal' },
    { title: 'Oil change — Truck 2 (due 248k miles)', function: 'Maintenance & Safety', status: 'new', priority: 'high', deadlineDate: _demoDate(2), deadlineTime: '08:00', expectedResult: 'Service completed, receipt saved' },
    { title: 'Collect payment — Echo Global ($4,200)', function: 'Admin & Accounting', status: 'new', priority: 'high', deadlineDate: _demoDate(-3), deadlineTime: '16:00', expectedResult: 'Payment received or factoring used' },
    { title: 'Apply for Amazon Relay — upload docs', function: 'Dispatch / Load Planning', status: 'progress', priority: 'medium', deadlineDate: _demoDate(5), deadlineTime: '18:00', expectedResult: 'Application submitted, confirmation email' },
    { title: 'Post CDL driver job on Indeed', function: 'Admin & Accounting', status: 'new', priority: 'medium', deadlineDate: _demoDate(1), deadlineTime: '15:00', expectedResult: 'Job posted with $0.55/mile + benefits' },
    { title: 'Renew USDOT registration', function: 'Admin & Accounting', status: 'new', priority: 'high', deadlineDate: _demoDate(-5), deadlineTime: '17:00', expectedResult: 'Registration renewed, updated card in truck' },
  ];
  tasks.forEach((task, i) => {
    const fi = i % funcs.length;
    ops.push(b => b.set(companyRef.collection('tasks').doc(), {
      ...task, assigneeId: uids[fi % uids.length], assigneeName: users[fi % users.length].name,
      createdBy: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deadline: firebase.firestore.Timestamp.fromDate(new Date(task.deadlineDate + 'T' + task.deadlineTime))
    }));
  });

  await _demoBatchCommit(ops);
  await _loadDemoFinance(companyRef, 'USD', 'logistics',
    [{ name: 'Trucking Checking (Chase)', balance: 28400 }, { name: 'Fuel Card (EFS)', balance: 8200 }],
    ['Broker loads', 'Dedicated lanes', 'Fuel surcharge reimbursement'],
    ['Fuel', 'Driver pay', 'Truck payments (lease)', 'Insurance', 'Maintenance & repairs', 'Permits & fees', 'Factoring fees'],
    [
      { monthOffset:-2, transactions:[
        {type:'income',amount:68000,category:'Broker loads',counterparty:'Echo, Coyote, CH Robinson',comment:'Aug — 3 trucks, 58 loads',day:31},
        {type:'income',amount:4200,category:'Fuel surcharge reimbursement',counterparty:'',comment:'',day:31},
        {type:'expense',amount:22000,category:'Fuel',counterparty:'Pilot, Love\'s',comment:'3 trucks — Aug avg $0.58/mi',day:31},
        {type:'expense',amount:14000,category:'Driver pay',counterparty:'',comment:'2 drivers — Aug',day:30},
        {type:'expense',amount:8400,category:'Truck payments (lease)',counterparty:'Daimler Financial',comment:'3 trucks lease',day:1},
        {type:'expense',amount:4800,category:'Insurance',counterparty:'Progressive Commercial',comment:'Monthly',day:1},
        {type:'expense',amount:3200,category:'Maintenance & repairs',counterparty:'',comment:'Truck 1 — brake replacement',day:15},
      ]},
      { monthOffset:-1, transactions:[
        {type:'income',amount:74000,category:'Broker loads',counterparty:'',comment:'Sep — strong demand, 62 loads',day:30},
        {type:'income',amount:5800,category:'Dedicated lanes',counterparty:'Target Corp',comment:'3 dedicated runs',day:30},
        {type:'expense',amount:24000,category:'Fuel',counterparty:'',comment:'',day:30},
        {type:'expense',amount:14000,category:'Driver pay',counterparty:'',comment:'',day:30},
        {type:'expense',amount:8400,category:'Truck payments (lease)',counterparty:'',comment:'',day:1},
        {type:'expense',amount:4800,category:'Insurance',counterparty:'',comment:'',day:1},
        {type:'expense',amount:1800,category:'Maintenance & repairs',counterparty:'',comment:'Tire replacement Truck 3',day:20},
        {type:'expense',amount:1200,category:'Permits & fees',counterparty:'FMCSA',comment:'Annual UCR filing',day:10},
      ]},
      { monthOffset:0, transactions:[
        {type:'income',amount:52000,category:'Broker loads',counterparty:'',comment:'Oct partial — 2 weeks',day:14},
        {type:'expense',amount:17000,category:'Fuel',counterparty:'',comment:'',day:14},
        {type:'expense',amount:14000,category:'Driver pay',counterparty:'',comment:'',day:5},
        {type:'expense',amount:8400,category:'Truck payments (lease)',counterparty:'',comment:'',day:1},
        {type:'expense',amount:4800,category:'Insurance',counterparty:'',comment:'',day:1},
      ]},
    ]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. ХАРЧОВЕ ВИРОБНИЦТВО — UAH
// ════════════════════════════════════════════════════════════════════════════
async function loadFoodProductionDemoData() {
  const companyRef = db.collection('companies').doc(currentCompany);
  const ops = [];

  await _saveDemoCompanyProfile('manufacturing',
    'Смачні традиції — харчове виробництво',
    'Забезпечувати ресторани та магазини свіжою якісною продукцією власного виробництва щодня',
    'Цех у Луцьку. Виробляємо ковбасні вироби, напівфабрикати, кулінарію. Постачаємо в мережі, ресторани, ринки. Щоденне виробництво, власний розвізний транспорт.',
    'Свіжа продукція доставлена в точку продажу вчасно, без рекламацій і повернень',
    '2026: 4.5 тонни/день, виручка 2.8М грн/міс, маржа 24%, власна ТМ в супермаркетах',
    'UAH'
  );

  const users = [
    { name: 'Олексій Стець', email: 'alex@smachni.ua', role: 'manager' },
    { name: 'Людмила Кузик', email: 'luda@smachni.ua', role: 'employee' },
    { name: 'Василь Ярмолюк', email: 'vasyl@smachni.ua', role: 'employee' },
  ];
  const uids = users.map(() => companyRef.collection('users').doc().id);
  users.forEach((u, i) => ops.push(b => b.set(companyRef.collection('users').doc(uids[i]), { ...u, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const funcs = [
    { name: 'Виробництво', description: 'Переробка сировини, виробництво партій, контроль якості', assigneeIds: [uids[1]] },
    { name: 'Логістика та доставка', description: 'Розвіз по точках, маршрути, відповідність замовленням', assigneeIds: [uids[2]] },
    { name: 'Закупівля сировини', description: 'М\'ясо, спеції, упаковка — пошук, якість, ціна', assigneeIds: [uids[0]] },
    { name: 'Продажі та клієнти', description: 'Нові точки, робота з мережами, рекламації', assigneeIds: [uids[0]] },
    { name: 'Якість та сертифікація', description: 'Лабораторний контроль, HACCP, документи', assigneeIds: [uids[1]] },
    { name: 'Фінанси', description: 'Собівартість партій, втрати, дебіторка', assigneeIds: [uids[2]] },
  ];
  const fids = funcs.map(() => companyRef.collection('functions').doc().id);
  funcs.forEach((f, i) => ops.push(b => b.set(companyRef.collection('functions').doc(fids[i]), { ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const regular = [
    { title: 'Планування виробничої партії на завтра', function: 'Виробництво', period: 'weekly', daysOfWeek: ['1','2','3','4','5'], timeStart: '16:00', timeEnd: '17:00', instruction: 'Зібрати замовлення від всіх точок. Розрахувати обсяг виробництва. Видати завдання цеху.', expectedResult: 'Виробниче завдання підписане, сировина підготовлена' },
    { title: 'Контроль залишків сировини', function: 'Закупівля сировини', period: 'weekly', daysOfWeek: ['1','4'], timeStart: '07:00', timeEnd: '08:00', instruction: 'Перевірити залишки м\'яса, спецій, оболонки, упаковки. Сформувати заявку постачальнику.', expectedResult: 'Заявка відправлена, підтвердження отримано' },
    { title: 'Звіт по втратах виробництва', function: 'Виробництво', period: 'weekly', daysOfWeek: ['5'], timeStart: '17:00', timeEnd: '18:00', instruction: 'Порахувати: прийнята сировина vs готова продукція. Норма втрат <8%. Якщо більше — розслідування.', expectedResult: 'Таблиця втрат тижня, причини понаднормових списань' },
    { title: 'Облік дебіторки по клієнтах', function: 'Фінанси', period: 'weekly', daysOfWeek: ['2'], timeStart: '10:00', timeEnd: '11:00', instruction: 'Перевірити борги кожної точки. Відправити нагадування якщо >14 днів. Заблокувати відвантаження при >30 днів.', expectedResult: 'Список дебіторів, нагадування відправлені' },
    { title: 'Відбір проб для лабораторії', function: 'Якість та сертифікація', period: 'weekly', daysOfWeek: ['3'], timeStart: '08:00', timeEnd: '09:00', instruction: 'Відібрати проби з кожного виду продукції. Відправити в лабораторію. Зафіксувати в журналі.', expectedResult: 'Проби відправлені, протоколи отримані протягом 3 днів' },
  ];
  regular.forEach(r => ops.push(b => b.set(companyRef.collection('regularTasks').doc(), { ...r, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const projects = [
    { name: 'Вхід в мережу Сільпо', status: 'active', color: '#22c55e', description: 'Переговори, документи, пробна поставка 500кг', deadline: _demoDate(25) },
    { name: 'Сертифікація HACCP', status: 'active', color: '#f59e0b', description: 'Обов\'язково для мереж. Залучити консультанта.', deadline: _demoDate(40) },
    { name: 'Новий продукт — бургерна котлета', status: 'active', color: '#3b82f6', description: 'Рецептура, тестування, упаковка, собівартість', deadline: _demoDate(20) },
  ];
  projects.forEach(p => ops.push(b => b.set(companyRef.collection('projects').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const tasks = [
    { title: 'Перевірити якість партії ковбаси "Лікарська"', function: 'Якість та сертифікація', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '09:00', expectedResult: 'Протокол лабораторії — відповідає ДСТУ' },
    { title: 'Замовити м\'ясо у ФГ "Захід-Агро"', function: 'Закупівля сировини', status: 'new', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '11:00', expectedResult: '2 тонни свинини, доставка завтра 6:00' },
    { title: 'Маршрут доставки на завтра — 18 точок', function: 'Логістика та доставка', status: 'progress', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '19:00', expectedResult: 'Маршрутні листи роздані водіям' },
    { title: 'Зустріч з менеджером Сільпо', function: 'Продажі та клієнти', status: 'new', priority: 'high', deadlineDate: _demoDate(3), deadlineTime: '14:00', expectedResult: 'Протокол, список документів для входу' },
    { title: 'Розрахунок собівартості нової котлети', function: 'Фінанси', status: 'progress', priority: 'medium', deadlineDate: _demoDate(2), deadlineTime: '17:00', expectedResult: 'Собівартість <55 грн/кг, ціна продажу визначена' },
    { title: 'Рекламація від АТБ — повернення 40кг', function: 'Якість та сертифікація', status: 'new', priority: 'high', deadlineDate: _demoDate(-1), deadlineTime: '12:00', expectedResult: 'Акт розслідування, причина встановлена' },
    { title: 'Ремонт холодильника №3', function: 'Виробництво', status: 'progress', priority: 'high', deadlineDate: _demoDate(-2), deadlineTime: '16:00', expectedResult: 'Холодильник справний, температурний журнал оновлений' },
  ];
  tasks.forEach((task, i) => {
    const fi = i % funcs.length;
    ops.push(b => b.set(companyRef.collection('tasks').doc(), {
      ...task, assigneeId: uids[fi % uids.length], assigneeName: users[fi % users.length].name,
      createdBy: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deadline: firebase.firestore.Timestamp.fromDate(new Date(task.deadlineDate + 'T' + task.deadlineTime))
    }));
  });

  await _demoBatchCommit(ops);
  await _loadDemoFinance(companyRef, 'UAH', 'manufacturing',
    [{ name: 'Поточний рахунок (ПУМБ)', balance: 420000 }, { name: 'Каса', balance: 68000 }],
    ['Реалізація продукції', 'Мережі (безготівка)', 'Ринки та ресторани (готівка)'],
    ['Сировина (м\'ясо)', 'Допоміжні матеріали (спеції, оболонка)', 'Упаковка', 'Зарплата цех', 'Зарплата логістика', 'Паливо', 'Оренда цеху', 'Комунальні (холод, газ)'],
    [
      { monthOffset:-2, transactions:[
        {type:'income',amount:1850000,category:'Реалізація продукції',counterparty:'',comment:'Серпень — 3.8т/день середнє',day:31},
        {type:'expense',amount:820000,category:'Сировина (м\'ясо)',counterparty:'ФГ Захід-Агро',comment:'4.2т м\'яса',day:10},
        {type:'expense',amount:145000,category:'Допоміжні матеріали (спеції, оболонка)',counterparty:'',comment:'',day:8},
        {type:'expense',amount:92000,category:'Упаковка',counterparty:'Укрпак',comment:'',day:5},
        {type:'expense',amount:280000,category:'Зарплата цех',counterparty:'',comment:'18 працівників',day:30},
        {type:'expense',amount:85000,category:'Зарплата логістика',counterparty:'',comment:'4 водії',day:30},
        {type:'expense',amount:42000,category:'Паливо',counterparty:'ОККО',comment:'',day:20},
        {type:'expense',amount:65000,category:'Оренда цеху',counterparty:'',comment:'',day:1},
        {type:'expense',amount:48000,category:'Комунальні (холод, газ)',counterparty:'',comment:'',day:15},
      ]},
      { monthOffset:-1, transactions:[
        {type:'income',amount:2050000,category:'Реалізація продукції',counterparty:'',comment:'Вересень — +10% зростання',day:30},
        {type:'expense',amount:920000,category:'Сировина (м\'ясо)',counterparty:'ФГ Захід-Агро',comment:'',day:8},
        {type:'expense',amount:158000,category:'Допоміжні матеріали (спеції, оболонка)',counterparty:'',comment:'',day:10},
        {type:'expense',amount:98000,category:'Упаковка',counterparty:'',comment:'',day:6},
        {type:'expense',amount:280000,category:'Зарплата цех',counterparty:'',comment:'',day:30},
        {type:'expense',amount:85000,category:'Зарплата логістика',counterparty:'',comment:'',day:30},
        {type:'expense',amount:45000,category:'Паливо',counterparty:'',comment:'',day:20},
        {type:'expense',amount:65000,category:'Оренда цеху',counterparty:'',comment:'',day:1},
        {type:'expense',amount:52000,category:'Комунальні (холод, газ)',counterparty:'',comment:'',day:15},
      ]},
      { monthOffset:0, transactions:[
        {type:'income',amount:1420000,category:'Реалізація продукції',counterparty:'',comment:'Жовтень (2 тижні)',day:15},
        {type:'expense',amount:640000,category:'Сировина (м\'ясо)',counterparty:'',comment:'',day:4},
        {type:'expense',amount:280000,category:'Зарплата цех',counterparty:'',comment:'',day:5},
        {type:'expense',amount:65000,category:'Оренда цеху',counterparty:'',comment:'',day:1},
      ]},
    ]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. БЬЮТІ ІНДУСТРІЯ — UAH
// ════════════════════════════════════════════════════════════════════════════
async function loadBeautyDemoData() {
  const companyRef = db.collection('companies').doc(currentCompany);
  const ops = [];

  await _saveDemoCompanyProfile('beauty',
    'Beauty Studio «AURA»',
    'Допомагати жінкам почуватися красивими та впевненими після кожного візиту',
    'Студія краси в Луцьку. 6 майстрів: косметолог, нейл-майстер, брови/вії, перукар, масажист. Запис онлайн, нагадування за 2 год. Преміум клас.',
    'Клієнт виходить задоволений, повертається через 3-4 тижні і рекомендує подругам',
    '2026: 220 візитів/тиждень, виручка 680к грн/міс, маржа 42%, відкрити другу студію',
    'UAH'
  );

  const users = [
    { name: 'Вікторія Луцька', email: 'vika@aura.ua', role: 'manager' },
    { name: 'Дар\'я Ткач', email: 'daria@aura.ua', role: 'employee' },
    { name: 'Олена Василюк', email: 'olena@aura.ua', role: 'employee' },
  ];
  const uids = users.map(() => companyRef.collection('users').doc().id);
  users.forEach((u, i) => ops.push(b => b.set(companyRef.collection('users').doc(uids[i]), { ...u, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const funcs = [
    { name: 'Обслуговування клієнтів', description: 'Прийом, сервіс, ресепшн, клієнтська база', assigneeIds: [uids[0]] },
    { name: 'Косметологія', description: 'Процедури обличчя, масаж, апаратна косметологія', assigneeIds: [uids[1]] },
    { name: 'Нейл-сервіс', description: 'Манікюр, педикюр, нарощування', assigneeIds: [uids[2]] },
    { name: 'Маркетинг', description: 'Instagram, Tik-Tok, акції, відгуки, партнери', assigneeIds: [uids[0]] },
    { name: 'Закупівлі', description: 'Витратні матеріали, косметика, обладнання', assigneeIds: [uids[1]] },
    { name: 'Фінанси', description: 'Виручка по майстрах, план-факт, витрати', assigneeIds: [uids[0]] },
  ];
  const fids = funcs.map(() => companyRef.collection('functions').doc().id);
  funcs.forEach((f, i) => ops.push(b => b.set(companyRef.collection('functions').doc(fids[i]), { ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const regular = [
    { title: 'Нагадування клієнтам про запис на завтра', function: 'Обслуговування клієнтів', period: 'weekly', daysOfWeek: ['1','2','3','4','5','6'], timeStart: '17:00', timeEnd: '18:00', instruction: 'Написати всім клієнтам, записаним на завтра. WhatsApp/Telegram нагадування. Підтвердити час.', expectedResult: '100% клієнтів підтвердили або перенесли' },
    { title: 'Звіт по виручці майстрів', function: 'Фінанси', period: 'weekly', daysOfWeek: ['6'], timeStart: '19:00', timeEnd: '20:00', instruction: 'Виручка по кожному майстру за тиждень. Кількість клієнтів. Середній чек. Порівняння з планом.', expectedResult: 'Таблиця відправлена власнику' },
    { title: 'Публікація контенту в Instagram', function: 'Маркетинг', period: 'weekly', daysOfWeek: ['1','3','5'], timeStart: '12:00', timeEnd: '13:00', instruction: 'Пост + 3 stories. Контент: до/після, процес роботи, відгук клієнта, акція.', expectedResult: 'Пост опублікований, stories виставлені' },
    { title: 'Замовлення матеріалів', function: 'Закупівлі', period: 'weekly', daysOfWeek: ['2'], timeStart: '11:00', timeEnd: '12:00', instruction: 'Перевірити залишки по кожному майстру. Замовити гель-лак, косметику, одноразові матеріали.', expectedResult: 'Замовлення оформлене та оплачене' },
    { title: 'Обдзвін клієнтів, що не записалися (30+ днів)', function: 'Маркетинг', period: 'weekly', daysOfWeek: ['3'], timeStart: '15:00', timeEnd: '16:00', instruction: 'Вибрати з CRM клієнтів, які не були >30 днів. Зателефонувати, запропонувати акцію або знижку 10%.', expectedResult: 'Мінімум 5 записів від "сплячих" клієнтів' },
  ];
  regular.forEach(r => ops.push(b => b.set(companyRef.collection('regularTasks').doc(), { ...r, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const projects = [
    { name: 'Відкриття другої студії', status: 'active', color: '#ec4899', description: 'Локація, дизайн, найм 3 майстрів, обладнання', deadline: _demoDate(90) },
    { name: 'Впровадження CRM (Altegio)', status: 'active', color: '#3b82f6', description: 'Онлайн-запис, нагадування, база клієнтів, аналітика', deadline: _demoDate(20) },
    { name: 'Запуск TikTok-каналу', status: 'active', color: '#f59e0b', description: 'Відео до/після, 3 відео/тиждень, ціль 10к підписників', deadline: _demoDate(30) },
  ];
  projects.forEach(p => ops.push(b => b.set(companyRef.collection('projects').doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() })));

  const tasks = [
    { title: 'Відповісти на 12 коментарів в Instagram', function: 'Маркетинг', status: 'new', priority: 'medium', deadlineDate: _demoDate(0), deadlineTime: '12:00', expectedResult: '100% коментарів оброблені' },
    { title: 'Замовити гель-лаки OPI (топ-20 кольорів)', function: 'Закупівлі', status: 'progress', priority: 'high', deadlineDate: _demoDate(0), deadlineTime: '14:00', expectedResult: 'Замовлення оплачене' },
    { title: 'Розрахунок зарплати майстрів за місяць', function: 'Фінанси', status: 'new', priority: 'high', deadlineDate: _demoDate(1), deadlineTime: '18:00', expectedResult: 'Відомість підписана, виплата завтра' },
    { title: 'Зняти відео для TikTok — манікюр TIME-LAPSE', function: 'Маркетинг', status: 'new', priority: 'medium', deadlineDate: _demoDate(2), deadlineTime: '16:00', expectedResult: 'Відео змонтоване, опубліковане' },
    { title: 'Технічне обслуговування лампи для гель-лаку', function: 'Закупівлі', status: 'new', priority: 'low', deadlineDate: _demoDate(-3), deadlineTime: '10:00', expectedResult: 'Лампа перевірена, замінена якщо потрібно' },
    { title: 'Переговори з орендодавцем — нова студія', function: 'Обслуговування клієнтів', status: 'progress', priority: 'high', deadlineDate: _demoDate(5), deadlineTime: '15:00', expectedResult: 'Договір оренди або відмова з причиною' },
    { title: 'Акція "Приведи подругу -20%"', function: 'Маркетинг', status: 'new', priority: 'medium', deadlineDate: _demoDate(3), deadlineTime: '17:00', expectedResult: 'Пост з умовами, оновлений прайс' },
  ];
  tasks.forEach((task, i) => {
    const fi = i % funcs.length;
    ops.push(b => b.set(companyRef.collection('tasks').doc(), {
      ...task, assigneeId: uids[fi % uids.length], assigneeName: users[fi % users.length].name,
      createdBy: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deadline: firebase.firestore.Timestamp.fromDate(new Date(task.deadlineDate + 'T' + task.deadlineTime))
    }));
  });

  await _demoBatchCommit(ops);
  await _loadDemoFinance(companyRef, 'UAH', 'beauty',
    [{ name: 'Монобанк бізнес', balance: 124000 }, { name: 'Каса студії', balance: 18500 }],
    ['Косметологія', 'Манікюр / педикюр', 'Перукарські послуги', 'Брови / вії', 'Масаж'],
    ['Зарплата майстрів (40%)', 'Витратні матеріали', 'Оренда студії', 'Реклама (Instagram, таргет)', 'Обладнання та інструмент', 'Адміністративні'],
    [
      { monthOffset:-2, transactions:[
        {type:'income',amount:285000,category:'Манікюр / педикюр',counterparty:'',comment:'Серпень — 380 клієнтів',day:31},
        {type:'income',amount:168000,category:'Косметологія',counterparty:'',comment:'',day:31},
        {type:'income',amount:82000,category:'Перукарські послуги',counterparty:'',comment:'',day:31},
        {type:'income',amount:65000,category:'Брови / вії',counterparty:'',comment:'',day:31},
        {type:'expense',amount:240000,category:'Зарплата майстрів (40%)',counterparty:'',comment:'6 майстрів',day:30},
        {type:'expense',amount:68000,category:'Витратні матеріали',counterparty:'',comment:'Гель-лаки, косметика',day:10},
        {type:'expense',amount:35000,category:'Оренда студії',counterparty:'',comment:'',day:1},
        {type:'expense',amount:22000,category:'Реклама (Instagram, таргет)',counterparty:'Meta',comment:'',day:15},
      ]},
      { monthOffset:-1, transactions:[
        {type:'income',amount:312000,category:'Манікюр / педикюр',counterparty:'',comment:'Вересень — сезон',day:30},
        {type:'income',amount:185000,category:'Косметологія',counterparty:'',comment:'',day:30},
        {type:'income',amount:95000,category:'Перукарські послуги',counterparty:'',comment:'',day:30},
        {type:'income',amount:72000,category:'Брови / вії',counterparty:'',comment:'',day:30},
        {type:'expense',amount:266000,category:'Зарплата майстрів (40%)',counterparty:'',comment:'',day:30},
        {type:'expense',amount:74000,category:'Витратні матеріали',counterparty:'',comment:'',day:8},
        {type:'expense',amount:35000,category:'Оренда студії',counterparty:'',comment:'',day:1},
        {type:'expense',amount:28000,category:'Реклама (Instagram, таргет)',counterparty:'',comment:'Підвищений бюджет',day:12},
        {type:'expense',amount:18000,category:'Обладнання та інструмент',counterparty:'',comment:'Нова лампа для гель',day:20},
      ]},
      { monthOffset:0, transactions:[
        {type:'income',amount:228000,category:'Манікюр / педикюр',counterparty:'',comment:'Жовтень (2 тижні)',day:14},
        {type:'income',amount:132000,category:'Косметологія',counterparty:'',comment:'',day:14},
        {type:'expense',amount:266000,category:'Зарплата майстрів (40%)',counterparty:'',comment:'',day:5},
        {type:'expense',amount:35000,category:'Оренда студії',counterparty:'',comment:'',day:1},
        {type:'expense',amount:25000,category:'Реклама (Instagram, таргет)',counterparty:'',comment:'',day:3},
      ]},
    ]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// РОУТЕР — mapує тип до функції
// ════════════════════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP = {
  'construction_eu': loadConstructionEuDemoData,
  'medical':         loadMedicalDemoData,
  'furniture_factory': loadFurnitureFactoryDemoData,
  'cleaning_us':     loadCleaningDemoData,
  'trucking_us':     loadTruckingDemoData,
  'food_production': loadFoodProductionDemoData,
  'beauty':          loadBeautyDemoData,
};
