// ============================================================
// 42-demo-niches.js — Повні демо-ніші для TALKO
// Меблевий бізнес — максимальна деталізація
// ============================================================
'use strict';

function _demoDate(offsetDays) {
    offsetDays = offsetDays || 0;
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + '-' +
        String(d.getMonth()+1).padStart(2,'0') + '-' +
        String(d.getDate()).padStart(2,'0');
}
function _demoTs(offsetDays) {
    return firebase.firestore.Timestamp.fromDate(
        new Date(Date.now() + (offsetDays||0) * 86400000)
    );
}
// Timestamp для фінансових транзакцій (фінанси фільтрують по Timestamp)
function _demoTsFinance(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetDays||0));
    d.setHours(12, 0, 0, 0);
    return firebase.firestore.Timestamp.fromDate(d);
}
function _dRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

// ════════════════════════════════════════════════════════════
// МЕБЛЕВИЙ БІЗНЕС — furniture_factory
// "МеблеМайстер" — виробництво меблів на замовлення, Київ
// 8 співробітників, 5 функцій, повний цикл від ліда до монтажу
// ════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['furniture_factory'] = async function() {
    const cr   = db.collection('companies').doc(currentCompany);
    const uid  = currentUser.uid;
    const now  = firebase.firestore.FieldValue.serverTimestamp();
    let ops    = [];

    // ── 1. ФУНКЦІЇ (8 основних блоків виробництва) ──────────
    // 0.Маркетинг 1.Продажі 2.Підготовка 3.Виробництво
    // 4.Доставка/Монтаж 5.Фінанси 6.Люди 7.Управління
    const FUNCS = [
        { name:'0. Маркетинг та залучення',  color:'#ec4899', desc:'Реклама, SMM, воронка, ліди, заявки з сайту та соцмереж' },
        { name:'1. Продажі та CRM',           color:'#22c55e', desc:'Консультації, заміри, КП, договори, CRM, конверсія лідів' },
        { name:'2. Підготовка до виробництва',color:'#f97316', desc:'Перевірка замовлення, матеріали, технічні креслення, комплектність' },
        { name:'3. Виробництво',              color:'#f59e0b', desc:'Розкрій, фрезерування, облицювання, збірка, ВТК, контроль якості' },
        { name:'4. Доставка та монтаж',       color:'#0ea5e9', desc:'Логістика, доставка, монтаж у клієнта, гарантійне обслуговування' },
        { name:'5. Фінанси та закупівлі',     color:'#ef4444', desc:'Оплати, закупівля матеріалів, облік витрат, зарплата, звітність' },
        { name:'6. Люди та HR',               color:'#8b5cf6', desc:'Найм, онбординг, навчання, мотивація, оцінка персоналу' },
        { name:'7. Управління',               color:'#374151', desc:'Координація, планування, KPI, стратегія, контроль виконання' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    // Власники функцій призначаються після створення staffRefs
    // Тимчасово зберігаємо без ownerId — оновимо після створення staff
    // assigneeIds — після створення sRefs, тому заповнюємо після їх створення
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color,
        order: i,
        ownerId:   uid,
        ownerName: 'Олексій Мороз',
        // assigneeIds: заповнюємо після staffRefs
        status:'active', createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // ── 2. СПІВРОБІТНИКИ ────────────────────────────────────
    // Спочатку видаляємо старих demo-юзерів щоб уникнути дублікатів
    try {
        const oldUsers = await cr.collection('users').get();
        if (!oldUsers.empty) {
            const delOps = [];
            // Видаляємо тільки demo-акаунти (не поточного власника)
            oldUsers.docs.forEach(d => {
                if (d.id !== uid) {
                    delOps.push({type:'delete', ref:cr.collection('users').doc(d.id)});
                }
            });
            if (delOps.length) await window.safeBatchCommit(delOps);
        }
    } catch(e) { console.warn('[demo] cleanup users:', e.message); }

    const STAFF = [
        { name:'Олексій Мороз',    role:'owner',    fi:null, pos:'Власник / Директор' },
        { name:'Ірина Сидоренко',  role:'manager',  fi:1,    pos:'Менеджер з продажів' },
        { name:'Василь Коваленко', role:'employee', fi:1,    pos:'Менеджер з продажів' },
        { name:'Тарас Бондаренко', role:'employee', fi:3,    pos:'Майстер-виробничник' },
        { name:'Микола Гриценко',  role:'employee', fi:3,    pos:'Столяр' },
        { name:'Катерина Лісова',  role:'employee', fi:2,    pos:'Дизайнер-технолог' },
        { name:'Андрій Петренко',  role:'employee', fi:4,    pos:'Водій-монтажник' },
        { name:'Оксана Ткаченко',  role:'employee', fi:5,    pos:'Бухгалтер' },
    ];
    const sRefs = STAFF.map(() => cr.collection('users').doc());
    STAFF.forEach((s,i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        ops.push({type:'set', ref:sRefs[i], data:{
            name:s.name, role:s.role, position:s.pos,
            email: s.name.toLowerCase().replace(/\s+/g,'.') + '@meble.demo',
            functionIds: fid ? [fid] : [],
            primaryFunctionId: fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
    });

    await window.safeBatchCommit(ops); ops = [];

    // Оновлюємо функції з правильними assigneeIds
    const funcUpdateOps = [];
    const funcAssignees = {
        0: [sRefs[0].id],                          // Маркетинг: власник
        1: [sRefs[1].id, sRefs[2].id],             // Продажі: 2 менеджери
        2: [sRefs[5].id],                          // Підготовка: дизайнер
        3: [sRefs[3].id, sRefs[4].id],             // Виробництво: 2 майстри
        4: [sRefs[6].id],                          // Доставка: монтажник
        5: [sRefs[7].id],                          // Фінанси: бухгалтер
        6: [sRefs[0].id],                          // Люди: власник
        7: [sRefs[0].id],                          // Управління: власник
    };
    for (const [fi, aids] of Object.entries(funcAssignees)) {
        funcUpdateOps.push({type:'update', ref:fRefs[parseInt(fi)], data:{
            assigneeIds: aids,
            updatedAt: now,
        }});
    }
    await window.safeBatchCommit(funcUpdateOps);

    // ── 3. ЗАВДАННЯ (22 шт) ────────────────────────────────
    // fi: 0=маркетинг, 1=продажі, 2=підготовка, 3=виробництво, 4=доставка, 5=фінанси, 6=люди, 7=управління
    const TASKS = [
        // Сьогодні — МІЙ ДЕНЬ
        { t:'Зустріч з клієнтом Ковалем — замовлення кухні 4м',         fi:1, ai:1, st:'new',      pr:'high',   d:0,  tm:'10:00', est:60,  r:'Підписаний договір або фото вимірів' },
        { t:'Передати замовлення №МБ-089 у виробництво',                 fi:1, ai:1, st:'new',      pr:'high',   d:0,  tm:'12:00', est:30,  r:'Виробничий лист переданий, дата запуску підтверджена' },
        { t:'Замовити ЛДСП та МДФ для партії замовлень',                 fi:5, ai:7, st:'new',      pr:'high',   d:0,  tm:'11:00', est:45,  r:'Рахунок оплачено, постачання підтверджено' },
        { t:'ВТК шафи-купе для Іваненка перед відвантаженням',           fi:3, ai:3, st:'progress', pr:'high',   d:0,  tm:'14:00', est:30,  r:'Акт ВТК підписаний, шафа готова до доставки' },
        { t:'Розробити 3D-проєкт спальні Марченків',                     fi:2, ai:5, st:'progress', pr:'medium', d:0,  tm:'16:00', est:180, r:'3 варіанти 3D + PDF-презентація для клієнта' },
        // Завтра
        { t:'Доставка і монтаж шафи-купе — вул. Хрещатик 12',           fi:4, ai:6, st:'new',      pr:'high',   d:1,  tm:'09:00', est:120, r:'Меблі встановлені, акт підписаний клієнтом' },
        { t:'Планова нарада виробничого відділу',                        fi:3, ai:3, st:'new',      pr:'medium', d:1,  tm:'08:30', est:30,  r:'Протокол наради, розподіл замовлень на тиждень' },
        { t:'Підготувати КП для ресторану "Смачно" (40 місць)',          fi:1, ai:2, st:'new',      pr:'high',   d:1,  tm:'11:00', est:90,  r:'КП відправлено, дата відповіді зафіксована' },
        { t:'Оплатити оренду цеху за березень',                         fi:5, ai:7, st:'new',      pr:'high',   d:1,  tm:'10:00', est:15,  r:'Платіж проведено, квитанція збережена' },
        // Поточний тиждень
        { t:'Фото готових проєктів для портфоліо та Instagram',          fi:2, ai:5, st:'new',      pr:'low',    d:3,  tm:'15:00', est:60,  r:'10+ фото готові для публікації' },
        { t:'Навчання монтажників — нові системи кріплень',              fi:4, ai:6, st:'new',      pr:'medium', d:4,  tm:'09:00', est:120, r:'Підпис у журналі навчання' },
        { t:'Звіт продажів за місяць (кількість, сума, джерела)',        fi:1, ai:1, st:'new',      pr:'high',   d:2,  tm:'17:00', est:60,  r:'Звіт в Excel із конверсіями та динамікою' },
        { t:'Закупити фурнітуру Blum для 5 замовлень',                   fi:5, ai:7, st:'progress', pr:'medium', d:2,  tm:'14:00', est:30,  r:'Замовлення відправлено постачальнику' },
        { t:'Запустити виробництво кухні Петрова №МБ-091',               fi:3, ai:4, st:'new',      pr:'high',   d:3,  tm:'08:00', est:480, r:'Розкрій виконано, збірка розпочата' },
        // Прострочені
        { t:'Відповісти на відгук клієнта в Google Maps',                fi:1, ai:2, st:'new',      pr:'medium', d:-2, tm:'18:00', est:20,  r:'Відповідь опублікована' },
        { t:'Оновити прайс-лист на сайті',                               fi:1, ai:1, st:'progress', pr:'low',    d:-3, tm:'16:00', est:45,  r:'Новий прайс опублікований' },
        { t:'ТО верстатів та обладнання цеху',                           fi:3, ai:3, st:'new',      pr:'high',   d:-1, tm:'08:00', est:180, r:'Акт ТО підписаний' },
        { t:'Переговори з новим постачальником ПВХ-плівок',              fi:5, ai:0, st:'progress', pr:'medium', d:-4, tm:'14:00', est:60,  r:'Прайс отримано, рішення прийнято' },
        // На перевірці / Виконані
        { t:'ТЗ на кухню Романової — узгодити з клієнтом',              fi:2, ai:5, st:'review',   pr:'high',   d:-1, tm:'16:00', est:90,  r:'ТЗ підписане клієнтом' },
        { t:'Виготовити зразок фасаду для демонстрації',                 fi:3, ai:4, st:'done',     pr:'medium', d:-2, tm:'17:00', est:120, r:'Зразок готовий' },
        { t:'Налаштувати CRM pipeline для меблевих замовлень',           fi:1, ai:1, st:'done',     pr:'high',   d:-5, tm:'15:00', est:60,  r:'CRM налаштована, команда навчена' },
        { t:'Підписати договір з дизайн-студією "Простір"',              fi:7, ai:0, st:'done',     pr:'high',   d:-7, tm:'11:00', est:30,  r:'Договір підписаний' },
    ];
    for (const t of TASKS) {
        const ref = cr.collection('tasks').doc();
        ops.push({type:'set', ref, data:{
            title:t.t,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:t.st, priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:t.tm,
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview: t.st !== 'done',
            createdAt:now, updatedAt:now,
        }});
    }

    // ── 4. РЕГУЛЯРНІ ЗАВДАННЯ ──────────────────────────────
    const REGS = [
        // Щоденні
        { t:'Щоденний stand-up 5хв (план на день)',
          type:'daily', fi:7, ai:0, tm:'08:00', est:10,
          result:'Кожен знає свої 3 пріоритети на день' },
        // Щотижневі — понеділок
        { t:'Планова нарада виробництва (понеділок)',
          type:'weekly', dow:1, fi:3, ai:3, tm:'08:30', est:30,
          result:'Розподіл замовлень на тиждень, вирішені блокери' },
        { t:'Перевірка залишків матеріалів на складі',
          type:'weekly', dow:1, fi:5, ai:7, tm:'09:00', est:20,
          result:'Список позицій нижче мінімуму, заявка на закупівлю' },
        // Щотижневі — середа
        { t:'Обдзвін клієнтів — статус замовлення',
          type:'weekly', dow:3, fi:1, ai:2, tm:'14:00', est:90,
          result:'Кожен клієнт в роботі отримав дзвінок, нотатка в CRM' },
        // Щотижневі — четвер
        { t:'Публікація кейсу в Instagram/Facebook',
          type:'weekly', dow:4, fi:0, ai:5, tm:'12:00', est:60,
          result:'Пост опублікований з фото та описом готового проєкту' },
        // Щотижневі — п'ятниця
        { t:'Щотижневий звіт продажів (кількість, сума, конверсія)',
          type:'weekly', dow:5, fi:1, ai:1, tm:'17:00', est:45,
          result:'Таблиця з показниками: нові ліди, замовлення, виручка, конверсія' },
        { t:'Фінансовий звіт за тиждень',
          type:'weekly', dow:5, fi:5, ai:7, tm:'16:00', est:30,
          result:'Доходи vs витрати, залишок на рахунках, прострочені платежі' },
        // Щомісячні
        { t:'ТО верстатів та обладнання цеху',
          type:'monthly', dom:1, fi:3, ai:3, tm:'08:00', est:180,
          result:'Акт ТО підписаний, несправності усунені, верстати готові' },
        { t:'Аналіз NPS та відгуків клієнтів',
          type:'monthly', dom:5, fi:1, ai:1, tm:'11:00', est:60,
          result:'Звіт по відгуках, відповіді опубліковані, план покращень' },
        { t:'Звірка бухгалтерії та виплата зарплати',
          type:'monthly', dom:25, fi:5, ai:7, tm:'10:00', est:120,
          result:'Зарплата нарахована та виплачена, звіт для власника' },
        // Додаткові регулярні по функціях
        { t:'Обновлення прайс-листа та каталогу',
          type:'monthly', dom:1, fi:0, ai:5, tm:'11:00', est:60,
          result:'Актуальний прайс на сайті та в офісі' },
        { t:'Аналіз конкурентів (ціни, новинки)',
          type:'monthly', dom:3, fi:0, ai:1, tm:'14:00', est:90,
          result:'Звіт по 3 конкурентах, висновки для власника' },
        { t:'Перевірка якості виконаних замовлень (вибірка 3 шт)',
          type:'weekly', dow:5, fi:3, ai:3, tm:'15:00', est:60,
          result:'Акт перевірки, виявлені відхилення усунені' },
        { t:'Дзвінок задоволеному клієнту — запит на відгук',
          type:'weekly', dow:4, fi:1, ai:2, tm:'16:00', est:30,
          result:'Відгук в Google або Rozetka отримано' },
        { t:'Перевірка касових залишків та інкасація',
          type:'weekly', dow:5, fi:5, ai:7, tm:'17:30', est:20,
          result:'Каса звірена, надлишок здано в банк' },
        { t:'Планування виробництва на наступний тиждень',
          type:'weekly', dow:5, fi:3, ai:3, tm:'16:00', est:45,
          result:'Розподіл замовлень по майстрах, матеріали заявлені' },
        { t:'Перевірка та відповідь на повідомлення в Instagram',
          type:'daily', fi:0, ai:5, tm:'10:00', est:20,
          result:'Всі повідомлення оброблені, ліди переведені в CRM' },
    ];
    for (const r of REGS) {
        const dows = r.type === 'weekly' && r.dow != null ? [r.dow] : null;
        // Розраховуємо timeEnd з timeStart + duration
        let timeEnd = null;
        if (r.tm && r.est) {
            const [hh, mm] = r.tm.split(':').map(Number);
            const totalMin = hh * 60 + mm + (r.est || 30);
            timeEnd = String(Math.floor(totalMin/60)).padStart(2,'0') + ':' + String(totalMin%60).padStart(2,'0');
        }
        ops.push({type:'set', ref:cr.collection('regularTasks').doc(), data:{
            title:           r.t,
            period:          r.type,
            daysOfWeek:      dows,
            dayOfMonth:      r.dom || null,
            skipWeekends:    r.type === 'daily',
            timeStart:       r.tm,
            timeEnd:         timeEnd,
            duration:        r.est || 30,
            function:        FUNCS[r.fi].name,
            assigneeId:      sRefs[r.ai].id,
            expectedResult:  r.result || '',
            reportFormat:    'Короткий звіт у вільній формі',
            instruction:     '',
            priority:        'medium',
            requireReview:   false,
            notifyOnComplete:[],
            checklist:       [],
            status:          'active',
            createdAt:       now,
        }});
    }

    await window.safeBatchCommit(ops); ops = [];

    // ── 5. ПРОЦЕС-ШАБЛОНИ ──────────────────────────────────
    const tpl1Ref = cr.collection('processTemplates').doc();
    ops.push({type:'set', ref:tpl1Ref, data:{
        name:'Виконання замовлення меблів',
        description:'Повний цикл від заявки до монтажу у клієнта',
        steps:[
            {id:'s1',name:'Прийом заявки та консультація',    functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:1,order:1},
            {id:'s2',name:'Виїзний замір та перші ескізи',    functionId:fRefs[2].id,functionName:FUNCS[2].name,durationDays:2,order:2},
            {id:'s3',name:'3D-проєктування та погодження',    functionId:fRefs[2].id,functionName:FUNCS[2].name,durationDays:4,order:3},
            {id:'s4',name:'Підписання договору, аванс 50%',   functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:1,order:4},
            {id:'s5',name:'Закупівля матеріалів під проєкт',  functionId:fRefs[4].id,functionName:FUNCS[4].name,durationDays:3,order:5},
            {id:'s6',name:'Виробництво та збірка',            functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:14,order:6},
            {id:'s7',name:'Контроль якості (ВТК)',             functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:1,order:7},
            {id:'s8',name:'Доставка і монтаж у клієнта',      functionId:fRefs[3].id,functionName:FUNCS[3].name,durationDays:1,order:8},
            {id:'s9',name:'Здача об\'єкту, фінальна оплата',  functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:1,order:9},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    const tpl2Ref = cr.collection('processTemplates').doc();
    ops.push({type:'set', ref:tpl2Ref, data:{
        name:'Онбординг нового співробітника',
        description:'Введення нового майстра або менеджера',
        steps:[
            {id:'s1',name:'Оформлення документів та інструктаж ТБ', functionId:fRefs[4].id,functionName:FUNCS[4].name,durationDays:1,order:1},
            {id:'s2',name:'Знайомство з командою та цехом',          functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:1,order:2},
            {id:'s3',name:'Навчання стандартам виробництва',          functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:5,order:3},
            {id:'s4',name:'Робота під наглядом наставника',           functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:10,order:4},
            {id:'s5',name:'Перший самостійний проєкт',                functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:7,order:5},
            {id:'s6',name:'Оцінка та рішення по випробувальному',     functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:1,order:6},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    // Активні процеси
    const PROCS = [
        { tpl:tpl1Ref, name:'Кухня Ковалів — 4м горіх',            step:4, ai:1 },
        { tpl:tpl1Ref, name:'Спальня Марченків — шафа + ліжко',    step:2, ai:5 },
        { tpl:tpl1Ref, name:'Офісні меблі ІТ Хаб — 12 столів',     step:6, ai:3 },
        { tpl:tpl2Ref, name:'Онбординг — Василь Коваленко',         step:3, ai:3 },
    ];
    for (const p of PROCS) {
        const tplName = p.tpl === tpl1Ref
            ? 'Виконання замовлення меблів'
            : 'Онбординг нового співробітника';
        ops.push({type:'set', ref:cr.collection('processes').doc(), data:{
            templateId:   p.tpl.id,
            templateName: tplName,
            name:         p.name,
            currentStep:  p.step,
            status:       'active',
            assigneeId:   sRefs[p.ai].id,
            assigneeName: STAFF[p.ai].name,
            startDate:    _demoDate(-7),
            deadline:     _demoDate(21),
            createdBy:    uid,
            createdAt:    now,
            updatedAt:    now,
        }});
    }

    // ── 6. ПРОЄКТИ ─────────────────────────────────────────
    const PROJS = [
        { name:'Відкриття шоуруму — вул. Сагайдачного 18', desc:'Ремонт та оснащення нового шоуруму 120м²', color:'#22c55e', rev:0,      labor:85000,  mat:120000, start:-30, end:45  },
        { name:'Корпоративне замовлення ІТ Хаб Київ',      desc:'60 робочих місць: столи, тумби, перегородки', color:'#f59e0b', rev:380000, labor:45000,  mat:160000, start:-14, end:30  },
        { name:'Нова лінійка "Еко-Дерево" — 8 моделей',    desc:'Продуктова лінійка з масиву дерева',          color:'#8b5cf6', rev:0,      labor:30000,  mat:50000,  start:-60, end:90  },
    ];
    for (const p of PROJS) {
        ops.push({type:'set', ref:cr.collection('projects').doc(), data:{
            name:p.name, description:p.desc, status:'active', color:p.color,
            startDate:_demoDate(p.start), deadline:_demoDate(p.end),
            plannedRevenue:p.rev, plannedLaborCost:p.labor, plannedMaterialCost:p.mat,
            assigneeId:uid, createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }

    await window.safeBatchCommit(ops); ops = [];

    // ── 6b. ЕТАПИ ПРОЄКТІВ + ФІНАНСИ ПРОЄКТІВ ─────────────
    const projSnapNow = await cr.collection('projects').get();
    const projDocs = projSnapNow.docs.map(d => ({id:d.id, ...d.data()}));

    const stageOps = [];
    for (const proj of projDocs) {
        let stages = [];
        const pn = proj.name || '';
        if (pn.includes('шоурум') || pn.includes('Шоурум') || pn.includes('Сагайдачного')) {
            stages = [
                {name:'Ремонт та підготовка приміщення', status:'done',       order:1, start:_demoDate(-30), end:_demoDate(-10)},
                {name:'Закупівля обладнання та меблів',  status:'in_progress',order:2, start:_demoDate(-10), end:_demoDate(10) },
                {name:'Оформлення та розстановка',       status:'planned',    order:3, start:_demoDate(10),  end:_demoDate(30) },
                {name:'Відкриття та маркетинг',          status:'planned',    order:4, start:_demoDate(35),  end:_demoDate(45) },
            ];
        } else if (pn.includes('ІТ Хаб') || pn.includes('іт хаб') || pn.includes('Дмитренко')) {
            stages = [
                {name:'Погодження ТЗ та договір',        status:'done',       order:1, start:_demoDate(-14), end:_demoDate(-12)},
                {name:'Закупівля матеріалів',             status:'done',       order:2, start:_demoDate(-12), end:_demoDate(-8) },
                {name:'Виробництво партія 1 (6 столів)', status:'in_progress',order:3, start:_demoDate(-5),  end:_demoDate(4)  },
                {name:'Виробництво партія 2 (6 столів)', status:'planned',    order:4, start:_demoDate(5),   end:_demoDate(12) },
                {name:'Доставка та монтаж',               status:'planned',    order:5, start:_demoDate(13),  end:_demoDate(15) },
                {name:'Здача та оплата залишку',          status:'planned',    order:6, start:_demoDate(15),  end:_demoDate(17) },
            ];
        } else if (pn.includes('Еко') || pn.includes('еко') || pn.includes('Дерево')) {
            stages = [
                {name:'Дизайн та прототипи',             status:'in_progress',order:1, start:_demoDate(-60), end:_demoDate(-20)},
                {name:'Виготовлення зразків (3 моделі)', status:'planned',    order:2, start:_demoDate(-10), end:_demoDate(20) },
                {name:'Тестування та доопрацювання',     status:'planned',    order:3, start:_demoDate(20),  end:_demoDate(50) },
                {name:'Фото та запуск продажів',         status:'planned',    order:4, start:_demoDate(55),  end:_demoDate(90) },
            ];
        }
        for (const s of stages) {
            stageOps.push({type:'set', ref:cr.collection('projectStages').doc(), data:{
                projectId:        proj.id,
                name:             s.name,
                order:            s.order,
                status:           s.status,
                plannedStartDate: s.start,
                plannedEndDate:   s.end,
                actualStartDate:  s.status === 'done' ? s.start : null,
                actualEndDate:    s.status === 'done' ? s.end   : null,
                ownerFunctionId:  '',
                responsibleUserId:'',
                progressPct:      s.status === 'done' ? 100 : s.status === 'in_progress' ? 50 : 0,
                blockedReason:    null,
                createdAt:        now, updatedAt: now,
            }});
        }
    }
    if (stageOps.length) await window.safeBatchCommit(stageOps);

    const normDefs = [
        {
            name:'Кухня пряма (на 1 пм)',
            category:'production', inputUnit:'пм',
            hasExtraParam:false, niche:'furniture',
            materials:[
                {name:'ЛДСП 16мм',        qty:2.8, unit:'лист', price:900,  coefficient:1},
                {name:'МДФ фасад ПВХ',    qty:3.5, unit:'шт',   price:420,  coefficient:1},
                {name:'Петлі Blum',        qty:4,   unit:'шт',   price:45,   coefficient:1},
                {name:'Напрямні Blum 500', qty:1,   unit:'пара', price:280,  coefficient:1},
                {name:'Кромка ПВХ 22мм',  qty:8,   unit:'пм',   price:1.6,  coefficient:1},
                {name:'Робота виробн.',    qty:1,   unit:'пм',   price:6500, coefficient:1},
            ],
        },
        {
            name:'Шафа-купе (на 1 м² фронту)',
            category:'production', inputUnit:'м²',
            hasExtraParam:false, niche:'furniture',
            materials:[
                {name:'ЛДСП 16мм',         qty:1.2, unit:'лист', price:900,  coefficient:1},
                {name:'Профіль алюм.',      qty:2.5, unit:'пм',   price:320,  coefficient:1},
                {name:'Роликова система',   qty:1,   unit:'компл',price:1800, coefficient:1},
                {name:'Наповнення шафи',    qty:0.8, unit:'компл',price:850,  coefficient:1},
                {name:'Робота виробн.',     qty:1,   unit:'м²',   price:4500, coefficient:1},
            ],
        },
        {
            name:'Стіл офісний (1 шт)',
            category:'production', inputUnit:'шт',
            hasExtraParam:false, niche:'furniture',
            materials:[
                {name:'ЛДСП 16мм',          qty:1.5, unit:'лист', price:900,  coefficient:1},
                {name:'Стільниця 38мм',      qty:1.6, unit:'пм',   price:1800, coefficient:1},
                {name:'Ніжки металеві',      qty:4,   unit:'шт',   price:180,  coefficient:1},
                {name:'Кромка ПВХ 22мм',    qty:6,   unit:'пм',   price:1.6,  coefficient:1},
                {name:'Робота виробн.',      qty:1,   unit:'шт',   price:2800, coefficient:1},
            ],
        },
        {
            name:'Шафа розпашна (на 1 м² фронту)',
            category:'production', inputUnit:'м²',
            hasExtraParam:false, niche:'furniture',
            materials:[
                {name:'ЛДСП 16мм',          qty:2.0, unit:'лист', price:900,  coefficient:1},
                {name:'МДФ фасад ПВХ',       qty:1.2, unit:'шт',   price:420,  coefficient:1},
                {name:'Петлі Blum',          qty:3,   unit:'шт',   price:45,   coefficient:1},
                {name:'Ручки меблеві',        qty:2,   unit:'шт',   price:85,   coefficient:1},
                {name:'Кромка ПВХ 22мм',    qty:10,  unit:'пм',   price:1.6,  coefficient:1},
                {name:'Робота виробн.',      qty:1,   unit:'м²',   price:3800, coefficient:1},
            ],
        },
        {
            name:'Дитяче ліжко-горище (1 шт)',
            category:'production', inputUnit:'шт',
            hasExtraParam:false, niche:'furniture',
            materials:[
                {name:'МДФ 18мм',            qty:2.5, unit:'лист', price:1100, coefficient:1},
                {name:'ЛДСП 16мм',           qty:1.0, unit:'лист', price:900,  coefficient:1},
                {name:'Ламелі берез.(90шт)', qty:1,   unit:'уп',   price:320,  coefficient:1},
                {name:'Кріплення меблеві',   qty:1,   unit:'компл',price:150,  coefficient:1},
                {name:'Робота виробн.',      qty:1,   unit:'шт',   price:4200, coefficient:1},
            ],
        },
    ];
    const normOps = [];
    for (const n of normDefs) {
        // Очищаємо materials від undefined полів
        const cleanMaterials = (n.materials||[]).map(m => ({
            name:        m.name        || '',
            qty:         Number(m.qty) || 0,
            unit:        m.unit        || 'шт',
            price:       Number(m.price) || 0,
            coefficient: Number(m.coefficient) || 1,
        }));
        normOps.push({type:'set', ref:cr.collection('estimate_norms').doc(), data:{
            name:          n.name        || '',
            category:      n.category    || 'production',
            inputUnit:     n.inputUnit   || 'шт',    // inputUnit — правильне поле
            hasExtraParam: n.hasExtraParam === true,
            extraParamLabel: n.extraParamLabel || '',
            niche:         n.niche       || 'furniture',
            materials:     cleanMaterials,
            createdBy:     uid,
            createdAt:     now,
        }});
    }
    await window.safeBatchCommit(normOps);

    // ── 6c. КОШТОРИСИ ПРОЄКТІВ ─────────────────────────────
    // Читаємо проєкти свіжо (після запису) щоб мати правильні ID
    const projSnapFresh = await cr.collection('projects').get();
    const projDocsFresh = projSnapFresh.docs.map(d => ({id:d.id, ...d.data()}));
    // Отримуємо нори кошторису
    const normSnap = await cr.collection('estimate_norms').get();
    const normDocs = normSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const kitchenNorm = normDocs.find(n => n.name && n.name.includes('Кухня'));
    const tableNorm   = normDocs.find(n => n.name && n.name.includes('Стіл'));

    const projEstOps = [];
    for (const proj of projDocsFresh) {
        if ((proj.name||'').includes('ІТ Хаб') && tableNorm) {
            // Кошторис для ІТ Хаб — 12 столів
            const sections = [{
                normId:   tableNorm.id,
                normName: tableNorm.name,
                inputValue: 12,
                inputUnit: 'шт',
                extraParam: null,
                calculatedMaterials: (tableNorm.materials||[]).map(m => ({
                    name:     m.name,
                    unit:     m.unit,
                    required: Math.round(m.qty * 12 * 10) / 10,
                    inStock:  0,
                    deficit:  Math.round(m.qty * 12 * 10) / 10,
                    pricePerUnit: m.price || 0,
                    total:    Math.round(m.qty * 12 * (m.price||0)),
                })),
            }];
            const totalMat = sections[0].calculatedMaterials.reduce((s,m) => s + m.total, 0);
            projEstOps.push({type:'set', ref:cr.collection('project_estimates').doc(), data:{
                title:     'Кошторис — офісні меблі ІТ Хаб (12 столів)',
                projectId: proj.id,
                dealId:    '',
                functionId:'',
                status:    'approved',
                sections,
                totals: { totalMaterialsCost: totalMat, totalDeficitCost: totalMat, currency:'UAH' },
                deleted:   false,
                createdBy: uid, approvedBy: uid,
                createdAt: now, updatedAt: now,
            }});
            // Оновлюємо бюджет проєкту
            projEstOps.push({type:'update', ref:cr.collection('projects').doc(proj.id), data:{
                estimateBudget: totalMat, updatedAt: now,
            }});
        }
        if ((proj.name||'').includes('шоурум') || (proj.name||'').includes('Шоурум')) {
            // Кошторис для шоуруму — демонстраційні меблі
            projEstOps.push({type:'set', ref:cr.collection('project_estimates').doc(), data:{
                title:     'Кошторис — оснащення шоуруму (демозразки)',
                projectId: proj.id,
                dealId:    '',
                functionId:'',
                status:    'draft',
                sections:  [],
                totals: { totalMaterialsCost: 85000, totalDeficitCost: 0, currency:'UAH' },
                deleted:   false,
                createdBy: uid, approvedBy: '',
                createdAt: now, updatedAt: now,
            }});
        }
    }
    if (projEstOps.length) await window.safeBatchCommit(projEstOps);

    // ── 7. CRM PIPELINE + УГОДИ ────────────────────────────
    // Спочатку видаляємо всі старі pipelines (включаючи дефолтний що міг створитись)
    try {
        const oldPips = await cr.collection('crm_pipeline').get();
        if (!oldPips.empty) {
            const pipDelOps = oldPips.docs.map(d => ({type:'delete', ref:d.ref}));
            await window.safeBatchCommit(pipDelOps);
        }
    } catch(e) { console.warn('[demo] cleanup pipelines:', e.message); }

    const pipRef = cr.collection('crm_pipeline').doc();
    await pipRef.set({
        name:'Продажі меблів',
        stages:[
            {id:'new',          label:'Новий лід',        color:'#6b7280', order:1},
            {id:'consultation', label:'Консультація',      color:'#3b82f6', order:2},
            {id:'measurement',  label:'Виїзний замір',     color:'#8b5cf6', order:3},
            {id:'design',       label:'Проєктування',      color:'#f59e0b', order:4},
            {id:'proposal',     label:'КП / Договір',      color:'#f97316', order:5},
            {id:'production',   label:'У виробництві',     color:'#22c55e', order:6},
            {id:'delivery',     label:'Доставка/Монтаж',   color:'#0ea5e9', order:7},
            {id:'won',          label:'Виграно',            color:'#16a34a', order:8},
            {id:'lost',         label:'Програно',           color:'#ef4444', order:9},
        ],
        createdBy:uid, createdAt:now, isDefault:true,
    });

    const DEALS = [
        { name:'Кухня 4м горіх',            client:'Коваль Петро',         phone:'+380671234001', src:'instagram',  stage:'production',   amt:87500,  nc:2,  note:'Кухня 4м, горіх, МДФ фасади. Аванс 50% отримано.' },
        { name:'Шафа-купе 3-дверна',         client:'Іваненко Марина',      phone:'+380671234002', src:'site_form',  stage:'delivery',     amt:32000,  nc:1,  note:'Дзеркало + ЛДСП білий глянець. Монтаж завтра 10:00.' },
        { name:'Меблі для спальні',          client:'Марченко Сергій',      phone:'+380671234003', src:'referral',   stage:'design',       amt:65000,  nc:3,  note:'Ліжко 180×200 + тумбочки + шафа. Стиль Loft.' },
        { name:'Офісні меблі 60 місць',      client:'ІТ Хаб (Дмитренко)',  phone:'+380671234004', src:'cold_call',  stage:'production',   amt:380000, nc:7,  note:'Договір підписано. Аванс 50% отримано.' },
        { name:'Комод та туалетний столик',  client:'Петрова Тетяна',       phone:'+380671234005', src:'instagram',  stage:'proposal',     amt:18500,  nc:1,  note:'Стиль Прованс, білий матовий. Жде КП до п\'ятниці.' },
        { name:'Дитяча кімната',             client:'Бойко Олена',          phone:'+380671234006', src:'site_form',  stage:'measurement',  amt:45000,  nc:0,  note:'Ліжко-горище + стіл + шафа. Дитині 8 років.' },
        { name:'Кухня + вітальня',           client:'Романова Юлія',        phone:'+380671234007', src:'referral',   stage:'consultation', amt:120000, nc:0,  note:'Велике замовлення. Бюджет гнучкий.' },
        { name:'Шафа для передпокою',        client:'Мельник Андрій',       phone:'+380671234008', src:'google',     stage:'new',          amt:14000,  nc:0,  note:'Залишив заявку вночі. Ще не дзвонили.' },
        { name:'Ресторанні меблі "Смачно"',  client:'Гриценко Василь',      phone:'+380671234009', src:'cold_call',  stage:'consultation', amt:95000,  nc:1,  note:'Столи та стільці для 40 місць.' },
        { name:'Кухня — програна угода',     client:'Литвиненко Катерина',  phone:'+380671234010', src:'instagram',  stage:'lost',         amt:55000,  nc:null, note:'Пішла до конкурентів. Різниця 8 000 грн.' },
        { name:'Спальня Тарасенків',         client:'Тарасенко Ігор',       phone:'+380671234011', src:'referral',   stage:'won',          amt:78000,  nc:null, note:'Виконано вчасно. 5 зірок у Google.' },
        { name:'Дитяча Сидоренків',          client:'Сидоренко Ніна',       phone:'+380671234012', src:'site_form',  stage:'won',          amt:42000,  nc:null, note:'Успішний проєкт. Клієнт дав рекомендацію другу.' },
    ];
    // Deals записуємо ОКРЕМИМ батчем одразу після pipeline
    const dealOps = [];
    const _ages = [1,2,3,5,7,10,14,21];
    for (const d of DEALS) {
        dealOps.push({type:'set', ref:cr.collection('crm_deals').doc(), data:{
            pipelineId:     pipRef.id,
            title:          d.name,
            clientName:     d.client,
            phone:          d.phone,
            source:         d.src,
            stage:          d.stage,
            amount:         d.amt,
            note:           d.note,
            nextContactDate: d.nc !== null ? _demoDate(d.nc) : null,
            nextContactTime: d.nc === 0 ? '14:00' : null,
            assigneeId:     sRefs[1].id,
            assigneeName:   STAFF[1].name,
            deleted:        false,
            tags:           [],
            createdAt:      _demoTs(-_ages[Math.floor(Math.random()*_ages.length)]),
            updatedAt:      now,
        }});
    }
    await window.safeBatchCommit(dealOps);

    // ── 8. ФІНАНСИ ─────────────────────────────────────────
    const FIN_CATS = [
        { name:'Виручка від замовлень',     type:'income',  color:'#22c55e' },
        { name:'Матеріали (ЛДСП, МДФ)',     type:'expense', color:'#ef4444' },
        { name:'Фурнітура та комплектуючі', type:'expense', color:'#f59e0b' },
        { name:'Оренда цеху та шоуруму',    type:'expense', color:'#8b5cf6' },
        { name:'Зарплата команди',          type:'expense', color:'#f97316' },
        { name:'Транспорт та доставка',     type:'expense', color:'#0ea5e9' },
        { name:'Маркетинг та реклама',      type:'expense', color:'#ec4899' },
        { name:'Комунальні послуги',        type:'expense', color:'#6b7280' },
        { name:'Обладнання',                type:'expense', color:'#14b8a6' },
        { name:'Аванси від клієнтів',       type:'income',  color:'#84cc16' },
    ];
    const catRefs = FIN_CATS.map(() => cr.collection('finance_categories').doc());
    FIN_CATS.forEach((c,i) => ops.push({type:'set', ref:catRefs[i], data:{
        name:c.name, type:c.type, color:c.color, createdAt:now,
    }}));

    await window.safeBatchCommit(ops); ops = [];

    const TXS = [
        // Поточний місяць
        {ci:0, amt:87500, note:'Оплата кухні — Коваль П.І.',              d:-1,  type:'income'},
        {ci:9, amt:45000, note:'Аванс 50% — ІТ Хаб Київ',                d:-3,  type:'income'},
        {ci:0, amt:32000, note:'Оплата шафи-купе — Іваненко М.О.',        d:-5,  type:'income'},
        {ci:9, amt:25000, note:'Аванс — Марченко С. (спальня)',            d:-7,  type:'income'},
        {ci:1, amt:38500, note:'ЛДСП 16мм — Кромтех',                     d:-2,  type:'expense'},
        {ci:2, amt:14200, note:'Фурнітура Blum — 5 комплектів',            d:-4,  type:'expense'},
        {ci:3, amt:18000, note:'Оренда цеху 600м² — березень',             d:-1,  type:'expense'},
        {ci:3, amt:8500,  note:'Оренда шоуруму — березень',                d:-1,  type:'expense'},
        {ci:4, amt:56000, note:'Зарплата команди — аванс березень',        d:-10, type:'expense'},
        {ci:5, amt:4800,  note:'Пальне + амортизація авто доставки',       d:-6,  type:'expense'},
        {ci:6, amt:7500,  note:'Instagram/Facebook реклама — березень',    d:-8,  type:'expense'},
        {ci:7, amt:5200,  note:'Електроенергія цех + шоурум',              d:-3,  type:'expense'},
        // Минулий місяць
        {ci:0, amt:78000, note:'Спальня Тарасенків — фінальна оплата',     d:-32, type:'income'},
        {ci:0, amt:42000, note:'Дитяча Сидоренків — фінальна оплата',      d:-28, type:'income'},
        {ci:0, amt:65000, note:'Кухня Литвиненко — оплата',                d:-25, type:'income'},
        {ci:9, amt:35000, note:'Аванси — 3 замовлення лютий',              d:-35, type:'income'},
        {ci:1, amt:42000, note:'МДФ та ЛДСП — лютий',                      d:-30, type:'expense'},
        {ci:4, amt:112000,note:'Зарплата команди — лютий повна',            d:-5,  type:'expense'},
        {ci:2, amt:18600, note:'Фурнітура — лютий',                         d:-29, type:'expense'},
        {ci:3, amt:26500, note:'Оренда цех + шоурум — лютий',              d:-31, type:'expense'},
        {ci:8, amt:12000, note:'Фрезер DeWalt — нове обладнання',           d:-27, type:'expense'},
        // Позаминулий місяць
        {ci:0, amt:95000, note:'Виручка замовлення — січень',               d:-58, type:'income'},
        {ci:9, amt:48000, note:'Аванси — січень',                           d:-62, type:'income'},
        {ci:1, amt:39000, note:'Матеріали — січень',                        d:-60, type:'expense'},
        {ci:4, amt:112000,note:'Зарплата — січень',                         d:-36, type:'expense'},
    ];
    // TXS записи замінено TXS2 з accountId

    // ── 9. СКЛАД ───────────────────────────────────────────
    const STOCK = [
        { name:'ЛДСП 16мм Білий (2800×2070)',    sku:'LDSP-16-WHT',    cat:'Плити',     unit:'лист',  qty:45, min:20, price:850  },
        { name:'ЛДСП 16мм Горіх (2800×2070)',    sku:'LDSP-16-WAL',    cat:'Плити',     unit:'лист',  qty:28, min:15, price:920  },
        { name:'МДФ 18мм (2800×2070)',            sku:'MDF-18',         cat:'Плити',     unit:'лист',  qty:32, min:10, price:1100 },
        { name:'Фасад МДФ ПВХ Білий матовий',    sku:'FACADE-WHT-MAT', cat:'Фасади',    unit:'шт',    qty:120,min:50, price:380  },
        { name:'Кромка ПВХ 22мм Білий (200м)',   sku:'EDGE-22-WHT',    cat:'Кромка',    unit:'рулон', qty:15, min:5,  price:320  },
        { name:'Петля Blum Clip Top 110°',        sku:'BLUM-CLIP-110',  cat:'Фурнітура', unit:'шт',    qty:340,min:100,price:45   },
        { name:'Напрямні Blum Tandem 500мм',     sku:'BLUM-TND-500',   cat:'Фурнітура', unit:'пара',  qty:85, min:30, price:280  },
        { name:'Конфірмат 7×50мм (200шт)',        sku:'CONF-200',       cat:'Кріплення', unit:'уп',    qty:22, min:10, price:75   },
        { name:'Клей ПВА столярний 10кг',         sku:'GLUE-PVA-10',    cat:'Витратники',unit:'кан',   qty:8,  min:3,  price:320  },
        { name:'Наждачний папір P120 (100шт)',    sku:'SAND-P120',      cat:'Витратники',unit:'уп',    qty:12, min:5,  price:95   },
    ];
    for (const s of STOCK) {
        const iRef = cr.collection('warehouse_items').doc();
        ops.push({type:'set', ref:iRef, data:{
            name:s.name, sku:s.sku, category:s.cat, unit:s.unit,
            minStock:s.min, costPrice:s.price,
            niche:'furniture', createdAt:now,
        }});
        ops.push({type:'set', ref:cr.collection('warehouse_stock').doc(iRef.id), data:{
            itemId:iRef.id, itemName:s.name, qty:s.qty,
            reserved:0, available:s.qty, updatedAt:now,
        }});
    }

    // ── 10. КОШТОРИС ───────────────────────────────────────
    ops.push({type:'set', ref:cr.collection('estimates').doc(), data:{
        name:'Кухня 4м — Коваль П.І.',
        clientName:'Коваль Петро Іванович',
        status:'approved', totalAmount:87500,
        items:[
            {name:'ЛДСП 16мм Горіх — 12 листів',    qty:12, unit:'лист',    price:920,  amount:11040},
            {name:'МДФ фасади ПВХ Горіх — 18 шт',   qty:18, unit:'шт',      price:850,  amount:15300},
            {name:'Петлі Blum — 32 шт',              qty:32, unit:'шт',      price:45,   amount:1440 },
            {name:'Напрямні Blum 500мм — 8 пар',     qty:8,  unit:'пара',    price:280,  amount:2240 },
            {name:'Стільниця 38мм — 5 пм',           qty:5,  unit:'пм',      price:1800, amount:9000 },
            {name:'Робота дизайнера',                 qty:1,  unit:'проєкт',  price:3500, amount:3500 },
            {name:'Робота виробництва',               qty:1,  unit:'замовл.', price:32000,amount:32000},
            {name:'Доставка та монтаж',               qty:1,  unit:'замовл.', price:4500, amount:4500 },
            {name:'Фурнітура дрібна (ручки, підпірки)',qty:1, unit:'компл.',  price:1200, amount:1200 },
            {name:'Профіль алюмінієвий — 6 пм',      qty:6,  unit:'пм',      price:320,  amount:1920 },
            {name:'Торговельна надбавка 25%',         qty:1,  unit:'компл.',  price:5360, amount:5360 },
        ],
        createdBy:uid, createdAt:now,
    }});

    // ── 11. КООРДИНАЦІЇ ─────────────────────────────────────
    // Структура: name, type, chairmanId, participantIds, schedule:{day,time}
    // types: daily, weekly, monthly, council_rec, council_dir, council_own, oneoff
    const COORDS = [
        {
            name:'Тижнева нарада — виробництво та продажі',
            type:'weekly',
            chairmanId: sRefs[0].id,
            participantIds:[sRefs[0].id, sRefs[1].id, sRefs[3].id, sRefs[4].id],
            schedule:{ day:1, time:'09:00' }, // Понеділок 09:00
            status:'active',
            agendaItems:['stats','execution','reports','questions','tasks'],
            dynamicAgenda:[
                { id:'da1', text:'Статус замовлення Ковалів', authorId:sRefs[1].id, createdAt:new Date().toISOString() },
                { id:'da2', text:'Закупівля ЛДСП — терміново', authorId:sRefs[3].id, createdAt:new Date().toISOString() },
            ],
        },
        {
            name:'Щоденний стенд-ап цеху',
            type:'daily',
            chairmanId: sRefs[3].id,
            participantIds:[sRefs[3].id, sRefs[4].id, sRefs[6].id],
            schedule:{ day:null, time:'08:00' },
            status:'active',
            agendaItems:['execution','tasks'],
            dynamicAgenda:[],
        },
        {
            name:'Оперативка з дизайнерами',
            type:'weekly',
            chairmanId: sRefs[5].id,
            participantIds:[sRefs[0].id, sRefs[1].id, sRefs[5].id],
            schedule:{ day:3, time:'11:00' }, // Середа 11:00
            status:'active',
            agendaItems:['reports','questions','tasks'],
            dynamicAgenda:[
                { id:'da3', text:'Правки по кухні Романової', authorId:sRefs[5].id, createdAt:new Date().toISOString() },
            ],
        },
        {
            name:'Рада власника — підсумки місяця',
            type:'council_own',
            chairmanId: sRefs[0].id,
            participantIds:[sRefs[0].id, sRefs[1].id, sRefs[7].id],
            schedule:{ day:5, time:'17:00' }, // П'ятниця 17:00
            status:'active',
            agendaItems:['stats','execution','reports','decisions'],
            dynamicAgenda:[],
        },
    ];
    for (const c of COORDS) {
        ops.push({type:'set', ref:cr.collection('coordinations').doc(), data:{
            name: c.name,
            type: c.type,
            chairmanId: c.chairmanId,
            participantIds: c.participantIds,
            schedule: c.schedule,
            status: c.status,
            agendaItems: c.agendaItems,
            dynamicAgenda: c.dynamicAgenda,
            createdBy: uid, createdAt: now, updatedAt: now,
        }});
    }

    await window.safeBatchCommit(ops);

    // ── 12. АНАЛІТИКА — метрики ──────────────────────────────
    const METRICS = [
        // ══ ЩОТИЖНЕВІ (weekly) — операційний контроль ══════════
        // Продажі та маркетинг — першими (найважливіші для власника)
        { name:'Виручка (тиждень)',          unit:'грн', cat:'Продажі',       trend:10.0, freq:'weekly',  value:72000, int:false },
        { name:'Нові ліди',                  unit:'шт',  cat:'Маркетинг',     trend:12.0, freq:'weekly',  value:8,     int:true  },
        { name:'Нові замовлення',            unit:'шт',  cat:'Продажі',       trend:8.0,  freq:'weekly',  value:3,     int:true  },
        { name:'Конверсія лід→договір',      unit:'%',   cat:'Продажі',       trend:5.0,  freq:'weekly',  value:38,    int:false },
        // Виробництво
        { name:'Замовлень у виробництві',    unit:'шт',  cat:'Виробництво',   trend:6.0,  freq:'weekly',  value:4,     int:true  },
        { name:'Відсоток браку',             unit:'%',   cat:'Виробництво',   trend:-8.0, freq:'weekly',  value:2.1,   int:false },
        { name:'Виконання плану вир.',       unit:'%',   cat:'Виробництво',   trend:3.0,  freq:'weekly',  value:94,    int:false },
        { name:'Переробок через помилку',    unit:'шт',  cat:'Виробництво',   trend:-20.0,freq:'weekly',  value:1,     int:true  },
        // Доставка
        { name:'Доставок виконано',          unit:'шт',  cat:'Доставка',      trend:7.0,  freq:'weekly',  value:4,     int:true  },
        { name:'Своєчасність доставки',      unit:'%',   cat:'Доставка',      trend:2.0,  freq:'weekly',  value:93,    int:false },
        // Управління — неочевидні
        { name:'Прострочені задачі',         unit:'шт',  cat:'Управління',    trend:-25.0,freq:'weekly',  value:3,     int:true  },
        { name:'Виконання задач вчасно',     unit:'%',   cat:'Управління',    trend:6.0,  freq:'weekly',  value:84,    int:false },
        { name:'Задач повернуто на доробку', unit:'шт',  cat:'Управління',    trend:-30.0,freq:'weekly',  value:2,     int:true  },
        { name:'Записи на консультацію',     unit:'шт',  cat:'Маркетинг',     trend:15.0, freq:'weekly',  value:6,     int:true  },
        { name:'Дизайн-проєктів',            unit:'шт',  cat:'Підготовка',    trend:5.0,  freq:'weekly',  value:3,     int:true  },

        // ══ ЩОДЕННІ (daily) — оперативний контроль ═════════════
        { name:'Час відповіді на лід',       unit:'год', cat:'Продажі',       trend:-20.0,freq:'daily',   value:2.5,   int:false },
        { name:'NPS клієнтів',               unit:'бали',cat:'Продажі',       trend:4.0,  freq:'daily',   value:72,    int:false },

        // ══ ЩОМІСЯЧНІ (monthly) — стратегічні ══════════════════
        // Фінансові — ПЕРШИМИ (власник відкриває і одразу бачить гроші)
        { name:'Виручка (місяць)',           unit:'грн', cat:'Фінанси',       trend:10.0, freq:'monthly', value:287500,int:false },
        { name:'Чистий прибуток',            unit:'грн', cat:'Фінанси',       trend:9.0,  freq:'monthly', value:58400, int:false },
        { name:'Маржинальність',             unit:'%',   cat:'Фінанси',       trend:2.0,  freq:'monthly', value:31.2,  int:false },
        { name:'Середній чек',               unit:'грн', cat:'Продажі',       trend:3.0,  freq:'monthly', value:23958, int:false },
        { name:'Витрати на матеріали',       unit:'грн', cat:'Фінанси',       trend:5.0,  freq:'monthly', value:52700, int:false },
        { name:'Витрати на зарплату',        unit:'грн', cat:'Фінанси',       trend:0.0,  freq:'monthly', value:56000, int:false },
        { name:'Дебіторська заборг.',        unit:'грн', cat:'Фінанси',       trend:-5.0, freq:'monthly', value:145000,int:false },
        // Продажі
        { name:'Замовлень виготовлено',      unit:'шт',  cat:'Виробництво',   trend:6.0,  freq:'monthly', value:18,    int:true  },
        { name:'Угод у воронці',             unit:'шт',  cat:'Продажі',       trend:5.0,  freq:'monthly', value:9,     int:true  },
        { name:'Охоплення Instagram',        unit:'осіб',cat:'Маркетинг',     trend:15.0, freq:'monthly', value:12400, int:true  },
        { name:'Вартість ліда (CPL)',         unit:'грн', cat:'Маркетинг',     trend:-10.0,freq:'monthly', value:535,   int:false },
        // Виробництво — неочевидні
        { name:'Замовлень затримано',        unit:'шт',  cat:'Виробництво',   trend:-15.0,freq:'monthly', value:2,     int:true  },
        { name:'Час замір→виробництво',      unit:'дні', cat:'Підготовка',    trend:-8.0, freq:'monthly', value:3.2,   int:false },
        { name:'Матеріалів понад норму',     unit:'%',   cat:'Виробництво',   trend:-5.0, freq:'monthly', value:4.8,   int:false },
        { name:'Здано без рекламацій',       unit:'%',   cat:'Виробництво',   trend:3.0,  freq:'monthly', value:91,    int:false },
        { name:'Середній час виробн.',       unit:'дні', cat:'Виробництво',   trend:-8.0, freq:'monthly', value:16,    int:false },
        // HR
        { name:'Завантаженість майстрів',    unit:'%',   cat:'Люди/HR',       trend:3.0,  freq:'monthly', value:87,    int:false },
        { name:'Задоволеність команди',      unit:'бали',cat:'Люди/HR',       trend:1.0,  freq:'monthly', value:7.8,   int:false },
        // Управління
        { name:'Завдань виконано',           unit:'шт',  cat:'Управління',    trend:8.0,  freq:'monthly', value:67,    int:true  },
        // Виробничі чекпоїнти — В КІНЦІ (деталізація для глибокого аналізу)
        { name:'01 Перевірка замовлення',    unit:'%',   cat:'Чекпоїнти',     trend:4.0,  freq:'monthly', value:92,    int:false },
        { name:'02 Другий перегляд зам.',    unit:'%',   cat:'Чекпоїнти',     trend:8.0,  freq:'monthly', value:78,    int:false },
        { name:'03 Деталізація частин',      unit:'%',   cat:'Чекпоїнти',     trend:5.0,  freq:'monthly', value:88,    int:false },
        { name:'04 Черговість робіт',        unit:'%',   cat:'Чекпоїнти',     trend:3.0,  freq:'monthly', value:82,    int:false },
        { name:'05 Комплектність старт.',    unit:'%',   cat:'Чекпоїнти',     trend:2.0,  freq:'monthly', value:96,    int:false },
        { name:'06 Комплект. відправка',     unit:'%',   cat:'Чекпоїнти',     trend:1.0,  freq:'monthly', value:94,    int:false },
        { name:'07 Фіксація змін',           unit:'%',   cat:'Чекпоїнти',     trend:12.0, freq:'monthly', value:71,    int:false },
        { name:'08 Габарити доставки',       unit:'%',   cat:'Чекпоїнти',     trend:6.0,  freq:'monthly', value:85,    int:false },
        { name:'09 Завантаження цеху',       unit:'%',   cat:'Чекпоїнти',     trend:9.0,  freq:'monthly', value:79,    int:false },
        { name:'10 Координація менедж.',     unit:'%',   cat:'Чекпоїнти',     trend:14.0, freq:'monthly', value:68,    int:false },
        { name:'11 Контроль якості',         unit:'%',   cat:'Чекпоїнти',     trend:4.0,  freq:'monthly', value:88,    int:false },
        { name:'12 Розбір причин браку',     unit:'%',   cat:'Чекпоїнти',     trend:18.0, freq:'monthly', value:60,    int:false },
        { name:'13 Контроль задач',          unit:'%',   cat:'Чекпоїнти',     trend:6.0,  freq:'monthly', value:84,    int:false },
        { name:'14 Щоденні планерки',        unit:'%',   cat:'Чекпоїнти',     trend:2.0,  freq:'monthly', value:91,    int:false },
        { name:'15 Найм та онбординг',       unit:'%',   cat:'Чекпоїнти',     trend:22.0, freq:'monthly', value:55,    int:false },
        { name:'16 Облік і звітність',       unit:'%',   cat:'Чекпоїнти',     trend:8.0,  freq:'monthly', value:82,    int:false },
        { name:'17 Планування вироб.',       unit:'%',   cat:'Чекпоїнти',     trend:11.0, freq:'monthly', value:76,    int:false },
        { name:'18 Закупівлі та запаси',     unit:'%',   cat:'Чекпоїнти',     trend:3.0,  freq:'monthly', value:88,    int:false },
    ];

    // Зберігаємо метрики + записи значень для поточного і попередніх тижнів/місяців
    const mOps = [];
    const now_ = firebase.firestore.FieldValue.serverTimestamp;
    for (const m of METRICS) {
        const mRef = cr.collection('metrics').doc();
        const freq = m.freq || 'weekly';
        mOps.push({type:'set', ref:mRef, data:{
            name:        m.name,
            unit:        m.unit || 'шт',
            category:    m.cat || '',
            frequency:   freq,
            scope:       'company',
            scopeType:   'company',
            description: m.cat || '',
            createdBy:   uid,
            createdAt:   now,
            updatedAt:   now,
        }});
        // Записи для 12 тижнів / 8 місяців / 14 днів
        const periods = freq === 'daily' ? 14 : freq === 'weekly' ? 12 : 8;
        for (let p = 0; p < periods; p++) {
            const trendFactor = 1 - (m.trend || 0) / 100 * p / periods;
            // Менший шум для великих фінансових значень
            const noiseScale = m.value > 10000 ? 0.06 : (m.int ? 0.15 : 0.10);
            const noise = (Math.random() - 0.5) * noiseScale;
            const rawVal = m.value * trendFactor * (1 + noise);
            let val;
            if (m.int) {
                // Цілі числа для шт (не дробові 3.1 шт)
                val = Math.max(0, Math.round(rawVal));
            } else if (m.unit === '%' || m.unit === 'бали') {
                val = Math.min(100, Math.max(0, Math.round(rawVal * 10) / 10));
            } else {
                val = Math.max(0, Math.round(rawVal * 10) / 10);
            }
            const entryRef = cr.collection('metricEntries').doc();
            let pk;
            const d = new Date();
            if (freq === 'monthly') {
                d.setMonth(d.getMonth() - p);
                pk = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
            } else if (freq === 'daily') {
                d.setDate(d.getDate() - p);
                pk = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
            } else {
                // weekly ISO week
                d.setDate(d.getDate() - p * 7);
                d.setHours(12,0,0,0);
                const dow = d.getDay() || 7;
                d.setDate(d.getDate() - dow + 4);
                const j1 = new Date(d.getFullYear(), 0, 1);
                const wn = Math.ceil(((d - j1) / 864e5 + j1.getDay() + 1) / 7);
                pk = d.getFullYear() + '-W' + String(wn).padStart(2,'0');
            }
            mOps.push({type:'set', ref:entryRef, data:{
                metricId:   mRef.id,
                metricName: m.name || '',
                unit:       m.unit || 'шт',
                value:      val,
                periodKey:  pk || '',
                frequency:  freq,
                scope:      'company',
                scopeType:  'company',
                note:       '',
                enteredBy:  uid,
                createdBy:  uid,
                createdAt:  now,
            }});
        }
    }
    await window.safeBatchCommit(mOps);

    // ── 13. ФІНАНСИ — налаштування UAH + рахунки + транзакції ─
    const finSettingsRef = cr.collection('finance_settings').doc('main');
    // Завжди перезаписуємо finance_settings + видаляємо старі accounts щоб оновити валюту
    await finSettingsRef.set({
        version: 1, region: 'UA', currency: 'UAH', niche: 'furniture',
        initializedAt: now, initializedBy: uid, updatedAt: now,
    });
    // Видаляємо старі рахунки (EUR) через safeBatchCommit
    try {
        const oldAccs = await cr.collection('finance_accounts').get();
        if (!oldAccs.empty) {
            const delOps = oldAccs.docs.map(d => ({type:'delete', ref:d.ref}));
            await window.safeBatchCommit(delOps);
        }
    } catch(e) { console.warn('[demo] cleanup accounts:', e.message); }
    // Видаляємо старі транзакції та категорії (EUR)
    try {
        for (const col of ['finance_transactions','finance_categories','finance_recurring']) {
            const snap = await cr.collection(col).get();
            if (!snap.empty) {
                const ops = snap.docs.map(d => ({type:'delete', ref:d.ref}));
                await window.safeBatchCommit(ops);
            }
        }
    } catch(e) { console.warn('[demo] cleanup finance:', e.message); }

    // Регулярні платежі (щомісячні фіксовані витрати)
    const regPayDefs = [
        { name:'Оренда цеху 600м²',           type:'expense', amount:18000, day:1,  category:'Оренда', freq:'monthly', comment:'Договір оренди №18/2024' },
        { name:'Оренда шоуруму',              type:'expense', amount:8500,  day:1,  category:'Оренда', freq:'monthly', comment:'вул. Сагайдачного 18' },
        { name:'Зарплата — Тарас Бондаренко', type:'expense', amount:28000, day:25, category:'Зарплата', freq:'monthly', comment:'Майстер-виробничник' },
        { name:'Зарплата — Катерина Лісова',  type:'expense', amount:22000, day:25, category:'Зарплата', freq:'monthly', comment:'Дизайнер' },
        { name:'Зарплата — Андрій Петренко',  type:'expense', amount:18000, day:25, category:'Зарплата', freq:'monthly', comment:'Монтажник' },
        { name:'Зарплата — Оксана Ткаченко',  type:'expense', amount:16000, day:25, category:'Зарплата', freq:'monthly', comment:'Бухгалтер' },
        { name:'Інтернет + телефонія цех',    type:'expense', amount:850,   day:10, category:'Комунальні', freq:'monthly', comment:'' },
        { name:'Instagram реклама (авто)',    type:'expense', amount:5000,  day:5,  category:'Маркетинг', freq:'monthly', comment:'Meta Ads Manager' },
        { name:'Підписка CRM (TALKO)',        type:'expense', amount:1200,  day:1,  category:'Сервіси', freq:'monthly', comment:'talko.app' },
    ];
    const regPayOps = [];
    for (const r of regPayDefs) {
        regPayOps.push({type:'set', ref:cr.collection('finance_recurring').doc(), data:{
            name:         r.name,
            type:         r.type,
            amount:       r.amount,
            currency:     'UAH',
            category:     r.category,
            frequency:    r.freq,
            dayOfMonth:   r.day,
            counterparty: '',
            comment:      r.comment,
            accountId:    '',
            active:       true,
            createdAt:    now, updatedAt: now,
        }});
    }
    await window.safeBatchCommit(regPayOps);

    // Рахунки
    const accRefs = [
        cr.collection('finance_accounts').doc(),
        cr.collection('finance_accounts').doc(),
        cr.collection('finance_accounts').doc(),
    ];
    const ACCOUNTS = [
        { name:'Розрахунковий рахунок (Приватбанк)', type:'bank',  balance:287500, currency:'UAH', isDefault:true  },
        { name:'Каса (готівка в офісі)',             type:'cash',  balance:45000,  currency:'UAH', isDefault:false },
        { name:'Картка (виробничі витрати)',         type:'card',  balance:18500,  currency:'UAH', isDefault:false },
    ];
    const finOps = [];
    ACCOUNTS.forEach((a,i) => finOps.push({type:'set', ref:accRefs[i], data:{
        ...a, createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // Категорії доходів/витрат
    const FIN_CATS2 = [
        { name:'Оплата замовлень (готівка)',  type:'income',  color:'#22c55e', icon:'shopping-bag' },
        { name:'Оплата замовлень (безгот.)',  type:'income',  color:'#16a34a', icon:'credit-card'  },
        { name:'Аванси від клієнтів',         type:'income',  color:'#84cc16', icon:'dollar-sign'  },
        { name:'Матеріали (ЛДСП, МДФ)',       type:'expense', color:'#ef4444', icon:'package'      },
        { name:'Фурнітура та комплектуючі',   type:'expense', color:'#f59e0b', icon:'tool'         },
        { name:'Оренда цеху та шоуруму',      type:'expense', color:'#8b5cf6', icon:'home'         },
        { name:'Зарплата команди',            type:'expense', color:'#f97316', icon:'users'        },
        { name:'Транспорт та доставка',       type:'expense', color:'#0ea5e9', icon:'truck'        },
        { name:'Маркетинг та реклама',        type:'expense', color:'#ec4899', icon:'trending-up'  },
        { name:'Комунальні послуги',          type:'expense', color:'#6b7280', icon:'zap'          },
        { name:'Обладнання та інструменти',   type:'expense', color:'#14b8a6', icon:'settings'     },
    ];
    const catRefs2 = FIN_CATS2.map(() => cr.collection('finance_categories').doc());
    FIN_CATS2.forEach((c,i) => finOps.push({type:'set', ref:catRefs2[i], data:{
        name:c.name, type:c.type, color:c.color, icon:c.icon,
        isDefault:false, createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(finOps);

    // Транзакції (3 місяці детально)
    const TXS2 = [
        // Березень — поточний
        {ci:1,acc:0,amt:87500,note:'Кухня Коваль П.І. — фінальна оплата',d:-1, type:'income'},
        {ci:2,acc:0,amt:43750,note:'Аванс 50% ІТ Хаб Київ (190 000 грн)',d:-3, type:'income'},
        {ci:1,acc:1,amt:32000,note:'Шафа-купе Іваненко — готівка',       d:-5, type:'income'},
        {ci:2,acc:0,amt:25000,note:'Аванс — Марченко С. (спальня)',       d:-7, type:'income'},
        {ci:0,acc:1,amt:18500,note:'Петрова — передоплата готівка',       d:-9, type:'income'},
        {ci:3,acc:0,amt:38500,note:'ЛДСП 16мм — Кромтех (45 листів)',    d:-2, type:'expense'},
        {ci:4,acc:0,amt:14200,note:'Фурнітура Blum — 5 комплектів',       d:-4, type:'expense'},
        {ci:5,acc:2,amt:18000,note:'Оренда цеху 600м² — березень',        d:-1, type:'expense'},
        {ci:5,acc:2,amt:8500, note:'Оренда шоуруму — березень',           d:-1, type:'expense'},
        {ci:6,acc:0,amt:56000,note:'Зарплата команди — аванс березень',   d:-10,type:'expense'},
        {ci:7,acc:2,amt:4800, note:'Пальне + амортизація авто',           d:-6, type:'expense'},
        {ci:8,acc:2,amt:7500, note:'Instagram/Facebook реклама березень', d:-8, type:'expense'},
        {ci:9,acc:2,amt:5200, note:'Електроенергія цех + шоурум',         d:-3, type:'expense'},
        // Лютий
        {ci:1,acc:0,amt:78000,note:'Спальня Тарасенків — фінальна',       d:-32,type:'income'},
        {ci:1,acc:0,amt:42000,note:'Дитяча Сидоренків — фінальна',        d:-28,type:'income'},
        {ci:1,acc:1,amt:32000,note:'Кухня Литвиненко — готівка',          d:-25,type:'income'},
        {ci:2,acc:0,amt:35000,note:'Аванси — 3 замовлення лютий',         d:-35,type:'income'},
        {ci:3,acc:0,amt:42000,note:'МДФ та ЛДСП — лютий',                 d:-30,type:'expense'},
        {ci:6,acc:0,amt:112000,note:'Зарплата команди — лютий повна',     d:-5, type:'expense'},
        {ci:4,acc:0,amt:18600,note:'Фурнітура — лютий',                   d:-29,type:'expense'},
        {ci:5,acc:2,amt:26500,note:'Оренда цех + шоурум — лютий',         d:-31,type:'expense'},
        {ci:10,acc:0,amt:12000,note:'Фрезер DeWalt — нове обладнання',    d:-27,type:'expense'},
        // Січень
        {ci:1,acc:0,amt:95000,note:'Виручка замовлення — січень',         d:-58,type:'income'},
        {ci:2,acc:0,amt:48000,note:'Аванси — січень',                     d:-62,type:'income'},
        {ci:3,acc:0,amt:39000,note:'Матеріали — січень',                  d:-60,type:'expense'},
        {ci:6,acc:0,amt:112000,note:'Зарплата — січень',                  d:-36,type:'expense'},
        {ci:8,acc:2,amt:6500, note:'Реклама — січень',                    d:-55,type:'expense'},
    ];
    const txOps2 = [];
    // Зберігаємо projectId для деяких транзакцій після запису проєктів
    const _txProjIds = {};
    try {
        const _tpSnap = await cr.collection('projects').get();
        _tpSnap.docs.forEach(d => {
            const n = d.data().name || '';
            if (n.includes('ІТ Хаб')) _txProjIds['ithub'] = d.id;
            if (n.includes('шоурум') || n.includes('Шоурум')) _txProjIds['showroom'] = d.id;
        });
    } catch(e) {}

    // Маппінг категорій до функцій для "Фінанси по функціях"
    const _catToFunc = {
        'Кухня Коваль':       fRefs[1].id,  // Продажі
        'ІТ Хаб':             fRefs[1].id,  // Продажі
        'Шафа-купе':          fRefs[1].id,  // Продажі
        'Марченко':           fRefs[1].id,  // Продажі
        'ЛДСП':               fRefs[5].id,  // Фінанси/закупівлі
        'МДФ':                fRefs[5].id,  // Фінанси/закупівлі
        'Фурнітура':          fRefs[5].id,  // Фінанси/закупівлі
        'Матеріали':          fRefs[5].id,  // Фінанси/закупівлі
        'Оренда':             fRefs[5].id,  // Фінанси/закупівлі
        'Зарплата':           fRefs[6].id,  // Люди/HR
        'Пальне':             fRefs[4].id,  // Доставка
        'Instagram':          fRefs[0].id,  // Маркетинг
        'Facebook':           fRefs[0].id,  // Маркетинг
        'реклама':            fRefs[0].id,  // Маркетинг
        'Електроенергія':     fRefs[5].id,  // Фінанси
        'обладнання':         fRefs[3].id,  // Виробництво
        'DeWalt':             fRefs[3].id,  // Виробництво
    };
    function _getFuncIdForTx(note) {
        if (!note) return '';
        for (const [key, fid] of Object.entries(_catToFunc)) {
            if (note.includes(key)) return fid;
        }
        return '';
    }

    for (const tx of TXS2) {
        const projId = tx.note && tx.note.includes('ІТ Хаб') ? (_txProjIds['ithub'] || '') : '';
        const funcId = _getFuncIdForTx(tx.note);
        txOps2.push({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
            categoryId:   catRefs2[tx.ci].id,
            categoryName: FIN_CATS2[tx.ci].name,
            accountId:    accRefs[tx.acc].id,
            accountName:  ACCOUNTS[tx.acc].name,
            type:tx.type, amount:tx.amt, currency:'UAH',
            note:tx.note,
            date:_demoTsFinance(tx.d),
            projectId:    projId,
            functionId:   funcId,
            createdBy:uid, createdAt:now,
        }});
    }
    await window.safeBatchCommit(txOps2);

    // ── 14. СКЛАД — операції для звітів + деякі товари нижче мінімуму ─
    // Оновлюємо деякі позиції нижче мінімального рівня (для "потребує замовлення")
    // Спочатку отримуємо items зі складу
    const stockSnap = await cr.collection('warehouse_stock').get();
    const whOps = [];
    stockSnap.docs.forEach(doc => {
        const data = doc.data();
        const name = data.itemName || data.name || '';
        // Клей і наждачний — нижче мінімуму (critical)
        if (name.includes('Клей') || name.includes('Наждач')) {
            whOps.push({type:'update', ref:cr.collection('warehouse_stock').doc(doc.id),
                data:{ qty:2, available:2, updatedAt:now }});
        }
        // Кромка — низький рівень (low)
        if (name.includes('Кромка')) {
            whOps.push({type:'update', ref:cr.collection('warehouse_stock').doc(doc.id),
                data:{ qty:4, available:4, updatedAt:now }});
        }
        // Конфірмат — низький рівень
        if (name.includes('Конфірмат')) {
            whOps.push({type:'update', ref:cr.collection('warehouse_stock').doc(doc.id),
                data:{ qty:8, available:8, updatedAt:now }});
        }
    });

    // Операції (IN/OUT) для звітів
    const itemsSnap = await cr.collection('warehouse_items').get();
    const itemIds = itemsSnap.docs.map(d => d.id);
    const whOpDefs = itemIds.slice(0,6).map((id,i) => ([
        // Прихід
        { itemId:id, type:'IN',  qty:[15,12,10,80,5,120][i],  price:[850,920,1100,380,320,45][i],
          note:`Закупівля — ${['ЛДСП біл.','ЛДСП гор.','МДФ','Фасади','Кромка','Петлі'][i]}`, d:-3 },
        // Видача у виробництво
        { itemId:id, type:'OUT', qty:[8,6,5,30,2,60][i],     price:[850,920,1100,380,320,45][i],
          note:`Видача у виробництво — замовл. №МБ-${89+i}`, d:-1 },
    ])).flat();

    const whOpRecs = [];
    for (const op of whOpDefs) {
        whOpRecs.push({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
            itemId: op.itemId,
            type: op.type,
            qty: op.qty,
            price: op.price,
            totalPrice: op.qty * op.price,
            note: op.note,
            date: _demoDate(op.d),
            createdBy: uid, createdAt: _demoTs(op.d),
        }});
    }
    if (whOps.length) await window.safeBatchCommit(whOps);
    if (whOpRecs.length) await window.safeBatchCommit(whOpRecs);

    // ── 15. БРОНЮВАННЯ — консультації та виїзні заміри ──────
    const bookingCalRef = cr.collection('booking_calendars').doc();
    const bookingSchedRef = cr.collection('booking_schedules').doc(bookingCalRef.id);
    await firebase.firestore().batch()
        .set(bookingCalRef, {
            name: 'Виїзний замір та консультація',
            slug: 'meble-zamiry',
            ownerName: STAFF[1].name,
            ownerId: sRefs[1].id,
            duration: 60,
            bufferBefore: 15,
            bufferAfter: 15,
            timezone: 'Europe/Kiev',
            confirmationType: 'manual',
            color: '#22c55e',
            location: 'Виїзд до клієнта (Київ та область)',
            isActive: true,
            phoneRequired: true,
            questions: [
                { id:'q1', text:'Що плануєте замовити?', type:'text', required:true },
                { id:'q2', text:'Адреса для виїзду', type:'text', required:true },
                { id:'q3', text:'Приблизний бюджет (грн)', type:'text', required:false },
            ],
            maxBookingsPerSlot: 1,
            requirePayment: false,
            price: 0,
            createdAt: now, updatedAt: now,
        })
        .set(bookingSchedRef, {
            weeklyHours: {
                mon:[{start:'09:00',end:'18:00'}],
                tue:[{start:'09:00',end:'18:00'}],
                wed:[{start:'09:00',end:'18:00'}],
                thu:[{start:'09:00',end:'18:00'}],
                fri:[{start:'09:00',end:'17:00'}],
                sat:[{start:'10:00',end:'15:00'}],
                sun:[],
            },
            dateOverrides: {},
            updatedAt: now,
        })
        .commit();

    // Бронювання (записи клієнтів)
    const apptDefs = [
        { name:'Коваль Петро',    phone:'+380671234001', email:'koval@gmail.com',   date:_demoDate(1),  time:'10:00', status:'confirmed', note:'Кухня 4м, стиль мінімалізм' },
        { name:'Бойко Олена',     phone:'+380671234006', email:'boyko@gmail.com',   date:_demoDate(2),  time:'14:00', status:'confirmed', note:'Дитяча кімната, дівчинка 8 років' },
        { name:'Романова Юлія',   phone:'+380671234007', email:'romanova@ukr.net',  date:_demoDate(3),  time:'11:00', status:'pending',   note:'Кухня + вітальня, бюджет ~120 000' },
        { name:'Мельник Андрій',  phone:'+380671234008', email:'melnyk@gmail.com',  date:_demoDate(4),  time:'16:00', status:'pending',   note:'Шафа в передпокій' },
        { name:'Тарасенко Ірина', phone:'+380671234020', email:'tarасенко@ukr.net', date:_demoDate(-3), time:'10:00', status:'confirmed', note:'Спальня — ліжко + шафа' },
        { name:'Лисенко Олег',    phone:'+380671234021', email:'lysenko@gmail.com', date:_demoDate(-7), time:'15:00', status:'confirmed', note:'Офіс 4 робочих місця' },
    ];
    const apptOps = [];
    for (const a of apptDefs) {
        apptOps.push({type:'set', ref:cr.collection('booking_appointments').doc(), data:{
            calendarId:  bookingCalRef.id,
            calendarName:'Виїзний замір та консультація',
            guestName:   a.name,
            guestPhone:  a.phone,
            guestEmail:  a.email,
            date:        a.date,
            startTime:   a.time,
            endTime:     (parseInt(a.time.split(':')[0])+1).toString().padStart(2,'0')+':'+a.time.split(':')[1],
            status:      a.status,
            note:        a.note,
            answers:     [{questionId:'q1',answer:a.note},{questionId:'q2',answer:'Київ'}],
            createdAt:   _demoTs(-Math.floor(Math.random()*14)),
            updatedAt:   now,
        }});
    }
    await window.safeBatchCommit(apptOps);

    // ── 16. КОШТОРИС — меблеві норми (не будівельні) ────────
    // Замінюємо будівельні норми на меблеві
    // Правильна структура: category = ключ з categoryLabel, inputUnit = одиниця виміру


    // ── 6d. СТАНДАРТИ ВИРОБНИЦТВА (workStandards) ─────────
    const stdOps = [];
    const STD_DEFS = [
        {
            name:'Стандарт якості виготовлення кухні',
            functionId: fRefs[3].id,
            checklist: [
                'Перевірити відповідність розмірів кресленню (±2мм)',
                'Перевірити якість кромкування (без відшарувань)',
                'Перевірити роботу петель та напрямних',
                'Перевірити відсутність подряпин на фасадах',
                'Перевірити щільність прилягання дверей',
            ],
            acceptanceCriteria: [
                'Всі розміри в допуску ±2мм',
                'Кромка без дефектів на 100% периметру',
                'Фурнітура працює плавно без заїдань',
            ],
            instructionsHtml: '<p>Перевірка виконується майстром ВТК перед відвантаженням. Фото обовязкове.</p>',
        },
        {
            name:'Стандарт прийому замовлення від клієнта',
            functionId: fRefs[1].id,
            checklist: [
                'Уточнити розміри та конфігурацію',
                'Узгодити колір та матеріал фасадів',
                'Уточнити бюджет та терміни',
                'Зафіксувати контактні дані клієнта',
                'Погодити дату виїзного заміру',
            ],
            acceptanceCriteria: [
                'Заповнена картка клієнта в CRM',
                'Визначена орієнтовна сума замовлення',
                'Погоджена дата наступного кроку',
            ],
            instructionsHtml: '<p>Менеджер заповнює картку в CRM одразу під час дзвінка.</p>',
        },
        {
            name:'Стандарт виїзного заміру',
            functionId: fRefs[2].id,
            checklist: [
                'Заміряти всі стіни та прорізи (висота, ширина, глибина)',
                'Зафіксувати розміщення розеток та виводів',
                'Сфотографувати приміщення (мін. 5 фото)',
                'Перевірити рівень стін і підлоги',
                'Уточнити побажання клієнта на місці',
            ],
            acceptanceCriteria: [
                'Всі заміри занесені в форму',
                'Фото прикріплені до картки клієнта',
                'Узгоджені нестандартні рішення',
            ],
            instructionsHtml: '<p>Замір виконується дизайнером або майстром. Подвійний контроль обовязковий.</p>',
        },
        {
            name:'Стандарт пакування та підготовки до відвантаження',
            functionId: fRefs[4].id,
            checklist: [
                'Пронумерувати всі деталі згідно схеми монтажу',
                'Загорнути фасади в захисну плівку',
                'Укласти фурнітуру в окремий пакет з маркуванням',
                'Перевірити комплектність по специфікації',
                'Скласти акт пакування',
            ],
            acceptanceCriteria: [
                'Всі деталі пронумеровані та зафіксовані',
                'Акт пакування підписаний',
                'Нічого не загублено при транспортуванні',
            ],
            instructionsHtml: '<p>Пакування виконується день до відвантаження. Фото комплектації обовязкове.</p>',
        },
    ];
    for (const s of STD_DEFS) {
        stdOps.push({type:'set', ref:cr.collection('workStandards').doc(), data:{
            name:               s.name,
            functionId:         s.functionId,
            checklist:          s.checklist,
            acceptanceCriteria: s.acceptanceCriteria,
            instructionsHtml:   s.instructionsHtml,
            createdBy:          uid,
            createdAt:          now,
            updatedAt:          now,
        }});
    }
    await window.safeBatchCommit(stdOps);

    // Транзакції прив'язані до проєктів
    // (оновлюємо частину транзакцій з projectId після запису проєктів)

    // ── 13+. ДОПОВНЕННЯ — постачальники, локації, планування, процеси ─

    // ── A. ЛОКАЦІЇ СКЛАДУ ──────────────────────────────────
    const locDefs = [
        { name:'Головний цех (вул. Промислова 12)', type:'warehouse', isDefault:true  },
        { name:'Шоурум (вул. Сагайдачного 18)',     type:'showroom',  isDefault:false },
        { name:'Виїзний склад (авто)',               type:'mobile',    isDefault:false },
    ];
    const locRefs = locDefs.map(() => cr.collection('warehouse_locations').doc());
    const locOps = [];
    locDefs.forEach((l,i) => locOps.push({type:'set', ref:locRefs[i], data:{
        name:l.name, type:l.type, isDefault:l.isDefault||false,
        deleted:false, createdAt:now, updatedAt:now,
    }}));
    await window.safeBatchCommit(locOps);

    // ── B. ПОСТАЧАЛЬНИКИ СКЛАДУ ────────────────────────────
    const supplierDefs = [
        { name:'Кромтех',        phone:'+380443456789', email:'sales@kromtech.ua',    url:'kromtech.ua',      note:'ЛДСП, МДФ. Доставка 3-5 днів. Відстрочка 14 днів.' },
        { name:'Blum Ukraine',   phone:'+380442223344', email:'info@blum.com.ua',     url:'blum.com.ua',      note:'Петлі, напрямні, підйомники. Офіційний дилер.' },
        { name:'ПВХ-Декор',      phone:'+380671112233', email:'pvhdecor@gmail.com',   url:'pvhdecor.com.ua',  note:'Кромка ПВХ, плівки, фасадні матеріали.' },
        { name:'МеталПроф',      phone:'+380502223344', email:'metal@metalprof.ua',   url:'metalprof.ua',     note:'Профілі алюмінієві, ніжки, кріплення.' },
        { name:'Hafele Ukraine', phone:'+380444455566', email:'hafele@hafele.ua',     url:'hafele.com',       note:'Системи ковзання, підвісні системи, аксесуари.' },
    ];
    const suppOps = supplierDefs.map(s => ({type:'set',
        ref: cr.collection('warehouse_suppliers').doc(), data:{
            name:s.name, phone:s.phone, email:s.email,
            url:s.url, note:s.note,
            deleted:false, createdAt:now, updatedAt:now,
        }
    }));
    await window.safeBatchCommit(suppOps);

    // ── C. ДОДАТКОВІ ПРОЦЕС-ШАБЛОНИ (5 загалом) ───────────
    const tpl3Ref = cr.collection('processTemplates').doc();
    const tpl4Ref = cr.collection('processTemplates').doc();
    const tpl5Ref = cr.collection('processTemplates').doc();
    const newTplOps = [];
    newTplOps.push({type:'set', ref:tpl3Ref, data:{
        name:'Рекламація та гарантійний ремонт',
        description:'Обробка скарги клієнта, виїзна діагностика, ремонт або заміна',
        steps:[
            {id:'s1',name:'Прийом скарги та реєстрація',         functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:1,order:1},
            {id:'s2',name:'Виїзна діагностика майстром',          functionId:fRefs[4].id,functionName:FUNCS[4].name,durationDays:1,order:2},
            {id:'s3',name:'Погодження рішення з клієнтом',        functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:1,order:3},
            {id:'s4',name:'Виконання ремонту або заміни',         functionId:fRefs[3].id,functionName:FUNCS[3].name,durationDays:3,order:4},
            {id:'s5',name:'Закриття рекламації, відгук клієнта',  functionId:fRefs[1].id,functionName:FUNCS[1].name,durationDays:1,order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});
    newTplOps.push({type:'set', ref:tpl4Ref, data:{
        name:'Закупівля матеріалів',
        description:'Від виявлення потреби до приходу на склад',
        steps:[
            {id:'s1',name:'Формування заявки на матеріали',        functionId:fRefs[5].id,functionName:FUNCS[5].name,durationDays:1,order:1},
            {id:'s2',name:'Отримання КП від 2-3 постачальників',   functionId:fRefs[5].id,functionName:FUNCS[5].name,durationDays:2,order:2},
            {id:'s3',name:'Погодження та оплата рахунку',          functionId:fRefs[5].id,functionName:FUNCS[5].name,durationDays:1,order:3},
            {id:'s4',name:'Прийом та перевірка якості на складі',  functionId:fRefs[5].id,functionName:FUNCS[5].name,durationDays:1,order:4},
            {id:'s5',name:'Оприбуткування в системі',              functionId:fRefs[5].id,functionName:FUNCS[5].name,durationDays:1,order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});
    newTplOps.push({type:'set', ref:tpl5Ref, data:{
        name:'Маркетингова кампанія',
        description:'Запуск рекламної кампанії від ідеї до аналізу результатів',
        steps:[
            {id:'s1',name:'Визначення цілі та бюджету кампанії',   functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:2,order:1},
            {id:'s2',name:'Підготовка контенту та креативів',       functionId:fRefs[2].id,functionName:FUNCS[2].name,durationDays:5,order:2},
            {id:'s3',name:'Налаштування та запуск реклами',         functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:1,order:3},
            {id:'s4',name:'Ведення та оптимізація кампанії',        functionId:fRefs[0].id,functionName:FUNCS[0].name,durationDays:14,order:4},
            {id:'s5',name:'Аналіз результатів та звіт',             functionId:fRefs[7].id,functionName:FUNCS[7].name,durationDays:2,order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    // Додаткові активні процеси
    newTplOps.push({type:'set', ref:cr.collection('processes').doc(), data:{
        templateId:tpl3Ref.id, templateName:'Рекламація та гарантійний ремонт',
        name:'Рекламація — Шафа Петренка (дверь не закривається)', currentStep:2, status:'active',
        assigneeId:sRefs[6].id, assigneeName:STAFF[6].name,
        startDate:_demoDate(-2), deadline:_demoDate(5),
        createdBy:uid, createdAt:now, updatedAt:now,
    }});
    newTplOps.push({type:'set', ref:cr.collection('processes').doc(), data:{
        templateId:tpl4Ref.id, templateName:'Закупівля матеріалів',
        name:'Закупівля ЛДСП та МДФ — квітнева партія', currentStep:1, status:'active',
        assigneeId:sRefs[7].id, assigneeName:STAFF[7].name,
        startDate:_demoDate(0), deadline:_demoDate(7),
        createdBy:uid, createdAt:now, updatedAt:now,
    }});
    newTplOps.push({type:'set', ref:cr.collection('processes').doc(), data:{
        templateId:tpl5Ref.id, templateName:'Маркетингова кампанія',
        name:'Instagram-кампанія "Весняні меблі" — квітень 2026', currentStep:3, status:'active',
        assigneeId:sRefs[5].id, assigneeName:STAFF[5].name,
        startDate:_demoDate(-5), deadline:_demoDate(20),
        createdBy:uid, createdAt:now, updatedAt:now,
    }});
    await window.safeBatchCommit(newTplOps);

    // ── D. ЗАВДАННЯ ПРИВ'ЯЗАНІ ДО ПРОЄКТІВ ────────────────
    const projSnap = await cr.collection('projects').get();
    // Знаходимо проєкти по назві — незалежно від порядку
    const _pByName = {};
    projSnap.docs.forEach(d => {
        const n = d.data().name || '';
        if (n.includes('шоурум') || n.includes('Шоурум')) _pByName['showroom'] = {id:d.id, name:n};
        if (n.includes('ІТ Хаб') || n.includes('іт хаб')) _pByName['ithub'] = {id:d.id, name:n};
        if (n.includes('Еко') || n.includes('еко')) _pByName['eco'] = {id:d.id, name:n};
    });

    const projTaskOps = [];

    // Завдання для Шоурум
    if (_pByName.showroom) {
        const pid = _pByName.showroom.id, pname = _pByName.showroom.name;
        const showroomTasks = [
            { title:'Замовити стелажі та вітрини для шоуруму',       ai:1, fi:5, d:3,  pr:'high',   est:60,  r:'Стелажі замовлені, дата доставки підтверджена' },
            { title:'Розробити планування шоуруму (розстановка меблів)', ai:5, fi:2, d:2, pr:'high', est:180, r:'3 варіанти планування у PDF для власника' },
            { title:'Встановити освітлення та декор',                 ai:6, fi:3, d:7,  pr:'medium', est:240, r:'Освітлення встановлене, фото готові' },
            { title:'Підготувати каталог та цінники',                 ai:2, fi:1, d:5,  pr:'medium', est:90,  r:'Каталог надрукований, цінники встановлені' },
            { title:'Провести відкриття — запросити 50 клієнтів',    ai:1, fi:0, d:14, pr:'high',   est:120, r:'50+ гостей, 5+ нових замовлень з відкриття' },
        ];
        for (const t of showroomTasks) {
            projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
                title:t.title, projectId:pid, projectName:pname,
                functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
                assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
                creatorId:uid, creatorName:STAFF[0].name,
                status:'new', priority:t.pr,
                deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
                estimatedTime:String(t.est), expectedResult:t.r,
                requireReview:true, createdAt:now, updatedAt:now,
            }});
        }
    }

    // Завдання для ІТ Хаб
    if (_pByName.ithub) {
        const pid = _pByName.ithub.id, pname = _pByName.ithub.name;
        const itHubTasks = [
            { title:'Погодити фінальне планування меблів з замовником', ai:1, fi:1, d:1,  pr:'high',   est:60,  r:'Планування підписано, специфікація фінальна' },
            { title:'Розкрій ЛДСП для 12 столів',                       ai:3, fi:3, d:2,  pr:'high',   est:360, r:'Всі деталі розкроєні по кресленнях' },
            { title:'Збірка каркасів столів (партія 1: 6 шт)',           ai:4, fi:3, d:4,  pr:'high',   est:480, r:'6 столів зібрані, пройшли ВТК' },
            { title:'Збірка партія 2 (6 шт) + тумби',                   ai:4, fi:3, d:7,  pr:'high',   est:480, r:'Всі 12 столів + 12 тумб готові' },
            { title:'Доставка та монтаж в офісі ІТ Хаб',                ai:6, fi:4, d:10, pr:'high',   est:240, r:'Меблі встановлені, клієнт підписав акт' },
            { title:'Підписання акту та отримання фінальної оплати',    ai:1, fi:1, d:11, pr:'medium', est:30,  r:'Акт підписаний, оплата надійшла' },
        ];
        for (const t of itHubTasks) {
            projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
                title:t.title, projectId:pid, projectName:pname,
                functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
                assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
                creatorId:uid, creatorName:STAFF[0].name,
                status:'new', priority:t.pr,
                deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
                estimatedTime:String(t.est), expectedResult:t.r,
                requireReview:true, createdAt:now, updatedAt:now,
            }});
        }
    }

    // Завдання для Еко-Дерево
    if (_pByName.eco) {
        const pid = _pByName.eco.id, pname = _pByName.eco.name;
        const ecoTasks = [
            { title:'Розробити ескізи 8 моделей (концепт)',             ai:5, fi:2, d:10, pr:'high',   est:480, r:'8 ескізів затверджені власником' },
            { title:'Підібрати постачальника масиву дерева',            ai:7, fi:5, d:7,  pr:'medium', est:60,  r:'Постачальник обраний, ціни погоджені' },
            { title:'Виготовити прототип стола (перша модель)',         ai:3, fi:3, d:21, pr:'medium', est:480, r:'Прототип готовий, якість перевірена' },
        ];
        for (const t of ecoTasks) {
            projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
                title:t.title, projectId:pid, projectName:pname,
                functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
                assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
                creatorId:uid, creatorName:STAFF[0].name,
                status:'new', priority:t.pr,
                deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
                estimatedTime:String(t.est), expectedResult:t.r,
                requireReview:true, createdAt:now, updatedAt:now,
            }});
        }
    }

    if (projTaskOps.length) await window.safeBatchCommit(projTaskOps);

    // ── E. ФІНАНСОВЕ ПЛАНУВАННЯ (бюджети по місяцях) ──────
    // Отримуємо категорії витрат щоб прив'язати бюджет
    const finCatSnap = await cr.collection('finance_categories').get();
    const finCatMap = {};
    finCatSnap.docs.forEach(d => { finCatMap[d.data().name] = d.id; });

    const budgetMonths = [
        { month: _demoDate(0).slice(0,7), goal:320000 }, // поточний місяць
        { month: _demoDate(-30).slice(0,7), goal:290000 }, // минулий
        { month: _demoDate(30).slice(0,7), goal:350000 }, // наступний
    ];
    const budgetOps = [];
    for (const bm of budgetMonths) {
        const budData = {
            month:    bm.month,
            goal:     bm.goal,
            // Планові витрати по категоріях
            ...(finCatMap['Матеріали (ЛДСП, МДФ)']      ? {['cat_'+finCatMap['Матеріали (ЛДСП, МДФ)']]:      45000} : {}),
            ...(finCatMap['Фурнітура та комплектуючі']   ? {['cat_'+finCatMap['Фурнітура та комплектуючі)']]: 15000} : {}),
            ...(finCatMap['Оренда цеху та шоуруму']      ? {['cat_'+finCatMap['Оренда цеху та шоуруму']]:     26500} : {}),
            ...(finCatMap['Зарплата команди']             ? {['cat_'+finCatMap['Зарплата команди']]:           112000} : {}),
            ...(finCatMap['Маркетинг та реклама']         ? {['cat_'+finCatMap['Маркетинг та реклама]']]:      8000} : {}),
            updatedAt: now,
        };
        budgetOps.push({type:'set',
            ref: cr.collection('finance_budgets').doc(bm.month),
            data: budData
        });
    }
    await window.safeBatchCommit(budgetOps);


    // ── F. ЗАВДАННЯ ВІДХИЛЕНІ НА ПЕРЕВІРЦІ ────────────────
    const rejectedTasks = [
        {
            title:'Оновити прайс-лист на сайті',
            fi:1, ai:2, pr:'low', d:-3,
            reason:'Ціни не узгоджені з власником. Потрібно додати нові позиції по кухнях.',
        },
        {
            title:'Налаштувати email-розсилку по базі клієнтів',
            fi:0, ai:1, pr:'medium', d:-5,
            reason:'Текст листа не відповідає стилю бренду. Переписати більш особисто.',
        },
        {
            title:'Підготувати план закупівель на квітень',
            fi:5, ai:7, pr:'high', d:-2,
            reason:'Бюджет перевищений на 18 000 грн. Скоротити позиції або обґрунтувати.',
        },
    ];
    const rejOps = [];
    for (const t of rejectedTasks) {
        rejOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title: t.title,
            functionId: fRefs[t.fi].id, functionName: FUNCS[t.fi].name,
            assigneeId: sRefs[t.ai].id, assigneeName: STAFF[t.ai].name,
            creatorId: uid, creatorName: STAFF[0].name,
            status: 'progress',
            priority: t.pr,
            deadlineDate: _demoDate(t.d), deadlineTime: '18:00',
            requireReview: true,
            // Відхилено з перевірки
            reviewRejectedAt: new Date(Date.now() + t.d * 86400000).toISOString(),
            reviewRejectedBy: uid,
            reviewRejectReason: t.reason,
            createdAt: now, updatedAt: now,
        }});
    }
    await window.safeBatchCommit(rejOps);

    // ── G. KPI ЦІЛІ ПО МЕТРИКАХ ───────────────────────────
    // Завантажуємо ID метрик і додаємо targets для ключових
    const mSnap = await cr.collection('metrics').get();
    const mMap = {};
    mSnap.docs.forEach(d => { mMap[d.data().name] = d.id; });

    const targetDefs = [
        { name:'Виручка (тиждень)',        target:80000,  period:'weekly'  },
        { name:'Нові замовлення',          target:4,      period:'weekly'  },
        { name:'Конверсія лід→договір',    target:45,     period:'weekly'  },
        { name:'Відсоток браку',           target:1.5,    period:'weekly'  },
        { name:'Своєчасність доставки',    target:95,     period:'weekly'  },
        { name:'Виконання задач вчасно',   target:90,     period:'weekly'  },
        { name:'Виручка (місяць)',         target:320000, period:'monthly' },
        { name:'Чистий прибуток',          target:70000,  period:'monthly' },
        { name:'Маржинальність',           target:35,     period:'monthly' },
        { name:'NPS клієнтів',             target:80,     period:'daily'   },
        { name:'Нові ліди',                target:10,     period:'weekly'  },
        { name:'Замовлень виготовлено',    target:22,     period:'monthly' },
    ];
    const tgtOps = [];
    // Поточні periodKeys
    const curWeek = (() => {
        const d = new Date(); d.setHours(12,0,0,0);
        const dow = d.getDay()||7; d.setDate(d.getDate()-dow+4);
        const j1 = new Date(d.getFullYear(),0,1);
        const wn = Math.ceil(((d-j1)/864e5+j1.getDay()+1)/7);
        return d.getFullYear()+'-W'+String(wn).padStart(2,'0');
    })();
    const curMonth = new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0');
    const curDay   = _demoDate(0);

    for (const t of targetDefs) {
        const mid = mMap[t.name];
        if (!mid) continue;
        const pk = t.period === 'monthly' ? curMonth : t.period === 'daily' ? curDay : curWeek;
        // Додаємо для кількох минулих періодів теж
        const periods = t.period === 'monthly' ? 3 : t.period === 'daily' ? 7 : 4;
        for (let p = 0; p < periods; p++) {
            let periodKey = pk;
            if (p > 0) {
                const d2 = new Date();
                if (t.period === 'monthly') { d2.setMonth(d2.getMonth()-p); periodKey = d2.getFullYear()+'-'+String(d2.getMonth()+1).padStart(2,'0'); }
                else if (t.period === 'daily') { d2.setDate(d2.getDate()-p); periodKey = d2.getFullYear()+'-'+String(d2.getMonth()+1).padStart(2,'0')+'-'+String(d2.getDate()).padStart(2,'0'); }
                else { d2.setDate(d2.getDate()-p*7); d2.setHours(12,0,0,0); const dow=d2.getDay()||7; d2.setDate(d2.getDate()-dow+4); const j1=new Date(d2.getFullYear(),0,1); const wn=Math.ceil(((d2-j1)/864e5+j1.getDay()+1)/7); periodKey=d2.getFullYear()+'-W'+String(wn).padStart(2,'0'); }
            }
            tgtOps.push({type:'set', ref:cr.collection('metricTargets').doc(), data:{
                metricId:    mid,
                periodKey:   periodKey,
                periodType:  t.period,
                scope:       'company',
                scopeId:     cr.id,
                targetValue: t.target,
                setBy:       uid,
                createdAt:   now,
            }});
        }
    }
    if (tgtOps.length) await window.safeBatchCommit(tgtOps);

    // ── H. СКЛАД — ПЕРЕМІЩЕННЯ МІЖ ЛОКАЦІЯМИ ──────────────
    // Отримуємо ID локацій і товарів
    const locSnap2 = await cr.collection('warehouse_locations').get();
    const locIds = locSnap2.docs.map(d => d.id);
    const itemSnap2 = await cr.collection('warehouse_items').get();
    const itemData = itemSnap2.docs.map(d => ({id:d.id, name:d.data().name}));

    if (locIds.length >= 2 && itemData.length >= 3) {
        const transferOps = [];
        // Переміщення: цех → шоурум (зразки для демонстрації)
        const transfers = [
            { itemIdx:3, qty:5,  note:'Зразки фасадів для шоуруму — для демонстрації клієнтам' },
            { itemIdx:0, qty:2,  note:'ЛДСП для виставкового стенду' },
            { itemIdx:5, qty:20, note:'Петлі на виїзний монтаж Іваненків' },
        ];
        for (const t of transfers) {
            const item = itemData[t.itemIdx] || itemData[0];
            transferOps.push({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
                itemId:     item.id,
                itemName:   item.name || '',
                type:       'TRANSFER',
                qty:        t.qty,
                fromLocationId: locIds[0],
                toLocationId:   locIds[1] || locIds[0],
                note:       t.note,
                date:       _demoDate(-2),
                createdBy:  uid,
                createdAt:  _demoTs(-2),
            }});
        }
        await window.safeBatchCommit(transferOps);
    }

    // ── I. ІНВЕНТАРИЗАЦІЯ ──────────────────────────────────
    if (locIds.length > 0 && itemData.length > 0) {
        const invMonth = _demoDate(-15).slice(0,7); // минулий місяць
        const invItems = itemData.slice(0,8).map((item, i) => {
            const expectedQty = [45,28,32,120,15,340,85,22][i] || 10;
            const actualQty   = expectedQty + [-2,0,1,-3,0,2,-1,0][i]; // невеликі відхилення
            return {
                itemId:   item.id,
                itemName: item.name || '',
                expected: expectedQty,
                actual:   actualQty,
                diff:     actualQty - expectedQty,
            };
        });
        await cr.collection('warehouse_inventories').add({
            locationId: locIds[0],
            month:      invMonth,
            items:      invItems,
            status:     'confirmed',
            createdBy:  uid,
            createdAt:  _demoTs(-15),
            updatedAt:  _demoTs(-15),
        });
    }

    // ── J. CRM TODO — дзвінки на сьогодні ────────────────
    // nextContactDate вже встановлений в CRM угодах (d:0 = сьогодні)
    // Переконуємось що є угоди на сьогодні і завтра — вже є в DEALS
    // Додаємо ще 2 угоди спеціально для CRM todo списку
    const todayDeals = [
        {
            name:'Первинний дзвінок — Ковтун Марія',
            client:'Ковтун Марія Василівна', phone:'+380671234050',
            src:'instagram', stage:'new', amt:0, nc:0,
            note:'Залишила коментар під постом про кухні. Хоче дізнатись ціни і терміни.',
        },
        {
            name:'Нагадування — Бондар Олег (заміри)',
            client:'Бондар Олег', phone:'+380671234051',
            src:'referral', stage:'consultation', amt:45000, nc:0,
            note:'Домовились перетелефонувати сьогодні після 14:00. Погодити дату виїзду.',
        },
    ];
    const todayDealOps = [];
    for (const d of todayDeals) {
        todayDealOps.push({type:'set', ref:cr.collection('crm_deals').doc(), data:{
            pipelineId:      pipRef.id,
            title:           d.name,
            clientName:      d.client,
            phone:           d.phone,
            source:          d.src,
            stage:           d.stage,
            amount:          d.amt,
            note:            d.note,
            nextContactDate: _demoDate(d.nc),
            nextContactTime: d.nc === 0 ? '14:00' : '10:00',
            assigneeId:      sRefs[1].id,
            assigneeName:    STAFF[1].name,
            createdAt:       _demoTs(-1),
            updatedAt:       now,
        }});
    }
    await window.safeBatchCommit(todayDealOps);

    // ── 12. Профіль компанії ────────────────────────────────
    await cr.update({
        name:           'МеблеМайстер',
        niche:          'furniture',
        nicheLabel:     'Меблевий бізнес',
        description:    'Виробництво меблів на замовлення. Кухні, шафи-купе, дитячі, офісні меблі.',
        city:           'Київ',
        employees:      8,
        currency:       'UAH',
        // Профіль компанії — для AI аналітики
        companyGoal:    'Виготовляти меблі на замовлення вчасно і без переробок, щоб клієнт рекомендував нас друзям',
        companyConcept: 'Меблі на замовлення під розмір і стиль клієнта. Повний цикл: замір → 3D-проєкт → виробництво → монтаж. Відрізняємось від конкурентів гарантією термінів (або повернення авансу) та власним дизайнером.',
        companyCKP:     'Готові меблі встановлені у клієнта в обіцяний термін, без браку і переробок, з підписаним актом і позитивним відгуком',
        companyIdeal:   'Компанія отримує 20+ замовлень на місяць, виробництво завантажене на 90%, кожен клієнт рекомендує нас мінімум одному знайомому. Власник керує стратегією, а не "гасить пожежі" щодня.',
        // Додаткові дані профілю
        targetAudience: 'Власники квартир та будинків у Києві, які роблять ремонт або переїзд. Вік 28-50, дохід вище середнього. Цінують якість, індивідуальний підхід і чіткі терміни.',
        avgCheck:       23958,
        monthlyRevenue: 287500,
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    });
};

// Оновлюємо мітку для UI
if (window._NICHE_LABELS) {
    window._NICHE_LABELS['furniture_factory'] = 'Меблевий бізнес (повне демо)';
}
