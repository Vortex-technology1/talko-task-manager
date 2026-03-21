// ============================================================
// 42-demo-niches.js — Повні демо-ніші для TALKO
// Меблевий бізнес — максимальна деталізація
// ============================================================
'use strict';

// Патчимо safeBatchCommit щоб автоматично додавав isDemo:true до set операцій
const _origSafeBatch = window.safeBatchCommit;
window.safeBatchCommit = async function(ops) {
    const markedOps = (ops || []).map(op => {
        if (op.type === 'set' && op.data && !op.data.isDemo) {
            return { ...op, data: { ...op.data, isDemo: true } };
        }
        return op;
    });
    return _origSafeBatch(markedOps);
};

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
        if ((proj.name||'').includes('Еко') || (proj.name||'').includes('Дерево')) {
            // Кошторис для Еко-Дерево — 8 моделей з масиву
            const ecoSections = [{
                normId:   '',
                normName: 'Масив дерева (дуб/ясен)',
                inputValue: 8,
                inputUnit: 'шт',
                extraParam: null,
                calculatedMaterials: [
                    { name:'Масив дуб 50мм (заготовки)', unit:'м³',  required:2.4, inStock:0, deficit:2.4, pricePerUnit:18000, total:43200 },
                    { name:'Фурнітура натуральна',        unit:'компл', required:8, inStock:0, deficit:8,   pricePerUnit:850,   total:6800  },
                    { name:'Лак паркетний Osmo',          unit:'л',   required:12,  inStock:0, deficit:12,  pricePerUnit:480,   total:5760  },
                    { name:'Робота столяра (ручна)',      unit:'год',  required:160, inStock:0, deficit:160, pricePerUnit:250,   total:40000 },
                ],
            }];
            const ecoMatTotal = ecoSections[0].calculatedMaterials.reduce((s,m) => s + m.total, 0);
            projEstOps.push({type:'set', ref:cr.collection('project_estimates').doc(), data:{
                title:     'Кошторис — нова лінійка Еко-Дерево (8 моделей)',
                projectId: proj.id,
                dealId:    '',
                functionId:'',
                status:    'approved',
                sections:  ecoSections,
                totals: { totalMaterialsCost: ecoMatTotal, totalDeficitCost: ecoMatTotal, currency:'UAH' },
                deleted:   false,
                createdBy: uid, approvedBy: uid,
                createdAt: now, updatedAt: now,
            }});
            projEstOps.push({type:'update', ref:cr.collection('projects').doc(proj.id), data:{
                estimateBudget: ecoMatTotal, updatedAt: now,
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
        isDemo: true,
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
        { name:'Кухня 4м горіх',            client:'Коваль Петро',         phone:'+380671234001', email:'koval@gmail.com',      src:'instagram',  stage:'production',   amt:87500,  nc:2,  note:'Кухня 4м, горіх, МДФ фасади. Аванс 50% отримано.' },
        { name:'Шафа-купе 3-дверна',         client:'Іваненко Марина',      phone:'+380671234002', email:'ivanenko@ukr.net',      src:'site_form',  stage:'delivery',     amt:32000,  nc:1,  note:'Дзеркало + ЛДСП білий глянець. Монтаж завтра 10:00.' },
        { name:'Меблі для спальні',          client:'Марченко Сергій',      phone:'+380671234003', email:'marchenko@gmail.com',   src:'referral',   stage:'design',       amt:65000,  nc:3,  note:'Ліжко 180×200 + тумбочки + шафа. Стиль Loft.' },
        { name:'Офісні меблі 60 місць',      client:'ІТ Хаб (Дмитренко)',  phone:'+380671234004', email:'ithub@company.ua',      src:'cold_call',  stage:'production',   amt:380000, nc:7,  note:'Договір підписано. Аванс 50% отримано.' },
        { name:'Комод та туалетний столик',  client:'Петрова Тетяна',       phone:'+380671234005', email:'petrova@gmail.com',     src:'instagram',  stage:'proposal',     amt:18500,  nc:1,  note:'Стиль Прованс, білий матовий. Жде КП до п\'ятниці.' },
        { name:'Дитяча кімната',             client:'Бойко Олена',          phone:'+380671234006', email:'boyko@ukr.net',         src:'site_form',  stage:'measurement',  amt:45000,  nc:0,  note:'Ліжко-горище + стіл + шафа. Дитині 8 років.' },
        { name:'Кухня + вітальня',           client:'Романова Юлія',        phone:'+380671234007', email:'romanova@gmail.com',    src:'referral',   stage:'consultation', amt:120000, nc:0,  note:'Велике замовлення. Бюджет гнучкий.' },
        { name:'Шафа для передпокою',        client:'Мельник Андрій',       phone:'+380671234008', email:'melnyk@gmail.com',      src:'google',     stage:'new',          amt:14000,  nc:0,  note:'Залишив заявку вночі. Ще не дзвонили.' },
        { name:'Ресторанні меблі "Смачно"',  client:'Гриценко Василь',      phone:'+380671234009', email:'grytsenko@gmail.com',   src:'cold_call',  stage:'consultation', amt:95000,  nc:1,  note:'Столи та стільці для 40 місць.' },
        { name:'Кухня — програна угода',     client:'Литвиненко Катерина',  phone:'+380671234010', email:'lytvynenko@ukr.net',    src:'instagram',  stage:'lost',         amt:55000,  nc:null, note:'Пішла до конкурентів. Різниця 8 000 грн.' },
        { name:'Спальня Тарасенків',         client:'Тарасенко Ігор',       phone:'+380671234011', email:'tarasenko@gmail.com',   src:'referral',   stage:'won',          amt:78000,  nc:null, note:'Виконано вчасно. 5 зірок у Google.' },
        { name:'Дитяча Сидоренків',          client:'Сидоренко Ніна',       phone:'+380671234012', email:'sydorenko@gmail.com',   src:'site_form',  stage:'won',          amt:42000,  nc:null, note:'Успішний проєкт. Клієнт дав рекомендацію другу.' },
    ];

    // ── Крок 1: crm_clients — спочатку клієнти, потім deals з clientId ──
    const clientRefs = DEALS.map(() => cr.collection('crm_clients').doc());
    const clientOps = [];
    const _ages = [1,2,3,5,7,10,14,21];
    DEALS.forEach((d, i) => {
        clientOps.push({type:'set', ref:clientRefs[i], data:{
            name:      d.client,
            phone:     d.phone,
            email:     d.email || '',
            telegram:  '',
            type:      'person',
            source:    d.src,
            niche:     'furniture',
            createdAt: _demoTs(-_ages[Math.floor(Math.random()*_ages.length)]),
            updatedAt: now,
        }});
    });
    await window.safeBatchCommit(clientOps);

    // ── Крок 2: crm_deals з clientId прив'язаним до crm_clients ──
    const dealOps = [];
    DEALS.forEach((d, i) => {
        dealOps.push({type:'set', ref:cr.collection('crm_deals').doc(), data:{
            pipelineId:      pipRef.id,
            title:           d.name,
            clientName:      d.client,
            clientId:        clientRefs[i].id,
            phone:           d.phone,
            email:           d.email || '',
            source:          d.src,
            stage:           d.stage,
            amount:          d.amt,
            note:            d.note,
            nextContactDate: d.nc !== null ? _demoDate(d.nc) : null,
            nextContactTime: d.nc === 0 ? '14:00' : null,
            assigneeId:      sRefs[1].id,
            assigneeName:    STAFF[1].name,
            deleted:         false,
            tags:            [],
            createdAt:       _demoTs(-_ages[Math.floor(Math.random()*_ages.length)]),
            updatedAt:       now,
        }});
    });
    await window.safeBatchCommit(dealOps);

    // ── 8. ФІНАНСИ — категорії, рахунки, транзакції ────────
    // (FIN_CATS видалено — використовується тільки FIN_CATS2 нижче з повним набором полів)

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
        { name:'Виручка (тиждень)',          unit:'грн', cat:'Продажі',       trend:10.0, freq:'weekly',  value:72000, int:false,
          desc:'Загальна сума оплат від клієнтів за тиждень. Показує реальний оборот, а не відвантаження.' },
        { name:'Нові ліди',                  unit:'шт',  cat:'Маркетинг',     trend:12.0, freq:'weekly',  value:8,     int:true,
          desc:'Кількість нових звернень від потенційних клієнтів (дзвінки, заявки, повідомлення) за тиждень.' },
        { name:'Нові замовлення',            unit:'шт',  cat:'Продажі',       trend:8.0,  freq:'weekly',  value:3,     int:true,
          desc:'Кількість підписаних договорів за тиждень. Відображає реальне завантаження виробництва.' },
        { name:'Конверсія лід→договір',      unit:'%',   cat:'Продажі',       trend:5.0,  freq:'weekly',  value:38,    int:false,
          desc:'Відсоток лідів що перетворились в підписаний договір. Показує ефективність менеджерів продажів.' },
        { name:'Замовлень у виробництві',    unit:'шт',  cat:'Виробництво',   trend:6.0,  freq:'weekly',  value:4,     int:true,
          desc:'Кількість замовлень що зараз виготовляються в цеху. Показує завантаженість виробництва.' },
        { name:'Відсоток браку',             unit:'%',   cat:'Виробництво',   trend:-8.0, freq:'weekly',  value:2.1,   int:false,
          desc:'Частка виробів з дефектами від загальної кількості. Кожен 1% браку = пряма втрата маржі.' },
        { name:'Виконання плану вир.',       unit:'%',   cat:'Виробництво',   trend:3.0,  freq:'weekly',  value:94,    int:false,
          desc:'Відсоток замовлень виготовлених вчасно від запланованих. Норма 90%+.' },
        { name:'Переробок через помилку',    unit:'шт',  cat:'Виробництво',   trend:-20.0,freq:'weekly',  value:1,     int:true,
          desc:'Кількість деталей або виробів що довелось переробити через помилку заміру або виробництва. Кожна переробка = -5-20k грн.' },
        { name:'Доставок виконано',          unit:'шт',  cat:'Доставка',      trend:7.0,  freq:'weekly',  value:4,     int:true,
          desc:'Кількість замовлень доставлених та змонтованих у клієнтів за тиждень.' },
        { name:'Своєчасність доставки',      unit:'%',   cat:'Доставка',      trend:2.0,  freq:'weekly',  value:93,    int:false,
          desc:'Відсоток доставок виконаних у домовлений день. Затримка = ризик рекламації та втрати лояльності.' },
        { name:'Прострочені задачі',         unit:'шт',  cat:'Управління',    trend:-25.0,freq:'weekly',  value:3,     int:true,
          desc:'Кількість завдань з минулим дедлайном що ще не виконані. Показує реальну дисципліну команди.' },
        { name:'Виконання задач вчасно',     unit:'%',   cat:'Управління',    trend:6.0,  freq:'weekly',  value:84,    int:false,
          desc:'Відсоток завдань виконаних до дедлайну. Нижче 80% — команда перевантажена або задачі нечіткі.' },
        { name:'Задач повернуто на доробку', unit:'шт',  cat:'Управління',    trend:-30.0,freq:'weekly',  value:2,     int:true,
          desc:'Кількість завдань повернутих виконавцю на доопрацювання. Показує якість виконання і чіткість ТЗ.' },
        { name:'Записи на консультацію',     unit:'шт',  cat:'Маркетинг',     trend:15.0, freq:'weekly',  value:6,     int:true,
          desc:'Кількість клієнтів що записались на виїзний замір або консультацію через сайт/Instagram/рекомендацію.' },
        { name:'Дизайн-проєктів',            unit:'шт',  cat:'Підготовка',    trend:5.0,  freq:'weekly',  value:3,     int:true,
          desc:'Кількість 3D-проєктів розроблених дизайнером за тиждень. Показує пропускну здатність підготовчого відділу.' },
        // ══ ЩОДЕННІ (daily) ═════════════════════════════════════
        { name:'Час відповіді на лід',       unit:'год', cat:'Продажі',       trend:-20.0,freq:'daily',   value:2.5,   int:false,
          desc:'Середній час від першого звернення клієнта до відповіді менеджера. Норма: до 1 год. Понад 3 год — клієнт іде до конкурента.' },
        { name:'NPS клієнтів',               unit:'бали',cat:'Продажі',       trend:4.0,  freq:'daily',   value:72,    int:false,
          desc:'Net Promoter Score — готовність клієнтів рекомендувати нас (0-100). 70+ = відмінно, нижче 50 = є системні проблеми.' },
        // ══ ЩОМІСЯЧНІ (monthly) — стратегічні ══════════════════
        { name:'Виручка (місяць)',           unit:'грн', cat:'Фінанси',       trend:10.0, freq:'monthly', value:287500,int:false,
          desc:'Загальна сума надходжень від клієнтів за місяць. Основний показник масштабу бізнесу.' },
        { name:'Чистий прибуток',            unit:'грн', cat:'Фінанси',       trend:9.0,  freq:'monthly', value:58400, int:false,
          desc:'Виручка мінус всі витрати (матеріали, зарплата, оренда, реклама). Реальний заробіток власника.' },
        { name:'Маржинальність',             unit:'%',   cat:'Фінанси',       trend:2.0,  freq:'monthly', value:31.2,  int:false,
          desc:'Чистий прибуток / Виручка × 100%. Норма для меблів на замовлення: 25-40%. Нижче 20% — бізнес в зоні ризику.' },
        { name:'Середній чек',               unit:'грн', cat:'Продажі',       trend:3.0,  freq:'monthly', value:23958, int:false,
          desc:'Середня сума одного замовлення. Зростання середнього чека = зростання якості клієнтів і продажів.' },
        { name:'Витрати на матеріали',       unit:'грн', cat:'Фінанси',       trend:5.0,  freq:'monthly', value:52700, int:false,
          desc:'Загальні витрати на ЛДСП, МДФ, фурнітуру за місяць. В нормі не більше 35% від виручки.' },
        { name:'Витрати на зарплату',        unit:'грн', cat:'Фінанси',       trend:0.0,  freq:'monthly', value:56000, int:false,
          desc:'ФОП — загальний фонд оплати праці включно з податками. В нормі не більше 30% від виручки.' },
        { name:'Дебіторська заборг.',        unit:'грн', cat:'Фінанси',       trend:-5.0, freq:'monthly', value:145000,int:false,
          desc:'Загальна сума грошей яку ще не отримали від клієнтів (доплати після монтажу). Понад 2 місяці виручки = проблема.' },
        { name:'Замовлень виготовлено',      unit:'шт',  cat:'Виробництво',   trend:6.0,  freq:'monthly', value:18,    int:true,
          desc:'Загальна кількість замовлень зданих клієнтам за місяць. Показує реальну виробничу потужність.' },
        { name:'Угод у воронці',             unit:'шт',  cat:'Продажі',       trend:5.0,  freq:'monthly', value:9,     int:true,
          desc:'Кількість активних угод в CRM на кінець місяця. Показує "запас" на наступний місяць.' },
        { name:'Охоплення Instagram',        unit:'осіб',cat:'Маркетинг',     trend:15.0, freq:'monthly', value:12400, int:true,
          desc:'Кількість унікальних людей що побачили публікації. Показує потенційний ринок залучення.' },
        { name:'Вартість ліда (CPL)',         unit:'грн', cat:'Маркетинг',     trend:-10.0,freq:'monthly', value:535,   int:false,
          desc:'Середня вартість залучення одного потенційного клієнта через рекламу. Норма для меблів: до 600 грн.' },
        { name:'Замовлень затримано',        unit:'шт',  cat:'Виробництво',   trend:-15.0,freq:'monthly', value:2,     int:true,
          desc:'Кількість замовлень що порушили обіцяний клієнту термін здачі. Кожна затримка = ризик конфлікту і збиток репутації.' },
        { name:'Час замір→виробництво',      unit:'дні', cat:'Підготовка',    trend:-8.0, freq:'monthly', value:3.2,   int:false,
          desc:'Скільки днів проходить від виїзного заміру до запуску у виробництво. Норма: до 3 днів. Більше = втрата часу і клієнта.' },
        { name:'Матеріалів понад норму',     unit:'%',   cat:'Виробництво',   trend:-5.0, freq:'monthly', value:4.8,   int:false,
          desc:'Відсоток перевитрати матеріалів відносно кошторису. Кожен 1% перевитрати = зниження маржі. Причина: брак, крадіжка, неточний розкрій.' },
        { name:'Здано без рекламацій',       unit:'%',   cat:'Виробництво',   trend:3.0,  freq:'monthly', value:91,    int:false,
          desc:'Відсоток замовлень зданих без скарг і переробок після монтажу. Норма: 95%+. Показник системи якості.' },
        { name:'Середній час виробн.',       unit:'дні', cat:'Виробництво',   trend:-8.0, freq:'monthly', value:16,    int:false,
          desc:'Середня кількість днів від запуску у виробництво до готовності. Норма для кухонь: 14-21 день.' },
        { name:'Завантаженість майстрів',    unit:'%',   cat:'Люди/HR',       trend:3.0,  freq:'monthly', value:87,    int:false,
          desc:'Відсоток робочого часу майстрів зайнятих виробництвом. 85-95% = норма. Понад 95% = ризик затримок, нижче 70% = недозавантаженість.' },
        { name:'Задоволеність команди',      unit:'бали',cat:'Люди/HR',       trend:1.0,  freq:'monthly', value:7.8,   int:false,
          desc:'Оцінка задоволеності співробітників роботою (1-10). Нижче 6 = ризик звільнень. Вимірюється анонімним опитуванням.' },
        { name:'Завдань виконано',           unit:'шт',  cat:'Управління',    trend:8.0,  freq:'monthly', value:67,    int:true,
          desc:'Загальна кількість завдань закритих за місяць. Показує продуктивність команди в абсолютних числах.' },
        // Виробничі чекпоїнти — система контролю якості на кожному етапі
        { name:'01 Перевірка замовлення',    unit:'%',   cat:'Чекпоїнти',     trend:4.0,  freq:'monthly', value:92,    int:false,
          desc:'% замовлень де перевірили реалістичність термінів і бюджету ДО запуску. Запобігає конфліктам на фіналі.' },
        { name:'02 Другий перегляд зам.',    unit:'%',   cat:'Чекпоїнти',     trend:8.0,  freq:'monthly', value:78,    int:false,
          desc:'% проєктів де замір перевірив 2-й фахівець. Виявляє помилки що призводять до дорогих переробок.' },
        { name:'03 Деталізація частин',      unit:'%',   cat:'Чекпоїнти',     trend:5.0,  freq:'monthly', value:88,    int:false,
          desc:'% замовлень з деталізованим списком деталей до запуску. Без деталізації — хаос на виробництві.' },
        { name:'04 Черговість робіт',        unit:'%',   cat:'Чекпоїнти',     trend:3.0,  freq:'monthly', value:82,    int:false,
          desc:'% замовлень де визначена черговість виконання робіт. Без черговості — майстри працюють в хаотичному порядку.' },
        { name:'05 Комплектність старт.',    unit:'%',   cat:'Чекпоїнти',     trend:2.0,  freq:'monthly', value:96,    int:false,
          desc:'% замовлень де перевірили наявність ВСІХ матеріалів перед стартом виробництва. Зупинки через брак матеріалів = збиток.' },
        { name:'06 Комплект. відправка',     unit:'%',   cat:'Чекпоїнти',     trend:1.0,  freq:'monthly', value:94,    int:false,
          desc:'% відправок де перевірили комплектність перед завантаженням. Забутий елемент = повторний виїзд монтажника.' },
        { name:'07 Фіксація змін',           unit:'%',   cat:'Чекпоїнти',     trend:12.0, freq:'monthly', value:71,    int:false,
          desc:'% випадків де зміни побажань клієнта зафіксовані письмово. Без фіксації — суперечки хто правий та безкоштовні переробки.' },
        { name:'08 Габарити доставки',       unit:'%',   cat:'Чекпоїнти',     trend:6.0,  freq:'monthly', value:85,    int:false,
          desc:'% доставок де заздалегідь перевірили чи проходять меблі в ліфт, двері, повороти. Запобігає відмові клієнта прийняти товар.' },
        { name:'09 Завантаження цеху',       unit:'%',   cat:'Чекпоїнти',     trend:9.0,  freq:'monthly', value:79,    int:false,
          desc:'% місяців де цех був завантажений по плану. Показує ефективність планування виробництва.' },
        { name:'10 Координація менедж.',     unit:'%',   cat:'Чекпоїнти',     trend:14.0, freq:'monthly', value:68,    int:false,
          desc:'% тижнів де менеджер і цех синхронізували статус замовлень. Без координації — клієнт не знає що відбувається.' },
        { name:'11 Контроль якості',         unit:'%',   cat:'Чекпоїнти',     trend:4.0,  freq:'monthly', value:88,    int:false,
          desc:'% замовлень з проміжним контролем якості на етапах виробництва (не тільки фінальний). Виявляє брак раніше.' },
        { name:'12 Розбір причин браку',     unit:'%',   cat:'Чекпоїнти',     trend:18.0, freq:'monthly', value:60,    int:false,
          desc:'% випадків браку де провели розбір і визначили першопричину. Без аналізу — брак повторюється.' },
        { name:'13 Контроль задач',          unit:'%',   cat:'Чекпоїнти',     trend:6.0,  freq:'monthly', value:84,    int:false,
          desc:'% тижнів де всі відкриті задачі були переглянуті і оновлені. Показує системність управління.' },
        { name:'14 Щоденні планерки',        unit:'%',   cat:'Чекпоїнти',     trend:2.0,  freq:'monthly', value:91,    int:false,
          desc:'% робочих днів де проводився ранковий стенд-ап (5 хв). Запобігає "кожен сам по собі" ситуації.' },
        { name:'15 Найм та онбординг',       unit:'%',   cat:'Чекпоїнти',     trend:22.0, freq:'monthly', value:55,    int:false,
          desc:'% нових співробітників що пройшли повний онбординг по стандарту. Низький показник = новачки роблять помилки.' },
        { name:'16 Облік і звітність',       unit:'%',   cat:'Чекпоїнти',     trend:8.0,  freq:'monthly', value:82,    int:false,
          desc:'% місяців де фінансовий звіт готовий до 5-го числа наступного місяця. Показник фінансової дисципліни.' },
        { name:'17 Планування вироб.',       unit:'%',   cat:'Чекпоїнти',     trend:11.0, freq:'monthly', value:76,    int:false,
          desc:'% тижнів де план виробництва складений на 2 тижні вперед. Без планування — хаотичне завантаження цеху.' },
        { name:'18 Закупівлі та запаси',     unit:'%',   cat:'Чекпоїнти',     trend:3.0,  freq:'monthly', value:88,    int:false,
          desc:'% місяців де закупівлі зроблені вчасно без аварійних замовлень. Аварійні закупівлі = переплата 15-30%.' },
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
            description: m.desc || '',   // опис що вимірює метрика
            formula:     '',
            inputType:   'manual',
            importance:  'critical',
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
        isDemo: true, version: 1, region: 'UA', currency: 'UAH', niche: 'furniture',
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

    // ── ПРОТОКОЛИ КООРДИНАЦІЙ ─────────────────────────────
    // Завантажуємо ID координацій що були щойно записані
    const coordSnap = await cr.collection('coordinations').get();
    const coordDocs = coordSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const standupCoord = coordDocs.find(c => c.name && c.name.includes('стенд-ап'));
    const weeklyCoord  = coordDocs.find(c => c.name && c.name.includes('нарада'));
    const ownerCoord   = coordDocs.find(c => c.name && c.name.includes('власника') || c.name && c.name.includes('Рада'));

    const sessionOps = [];

    // Протокол 1 — Щоденний стенд-ап 2 дні тому
    if (standupCoord) {
        sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
            coordId:   standupCoord.id,
            coordName: standupCoord.name,
            coordType: 'daily',
            startedAt: new Date(Date.now() - 2*86400000).toISOString(),
            finishedAt:new Date(Date.now() - 2*86400000 + 15*60000).toISOString(), // 15хв
            decisions: [
                { text:'Тарас бере в роботу кухню Петрова №МБ-091 — старт сьогодні 08:00', taskId:'', authorId:uid },
                { text:'Ірина передзвонює Романовій до 12:00 — узгодити день виїзду', taskId:'', authorId:uid },
                { text:'Оксана готує рахунок для ІТ Хаб до кінця дня', taskId:'', authorId:uid },
            ],
            unresolved: [],
            agendaDone: ['Стан замовлень', 'Пріоритети дня', 'Блокери'],
            dynamicAgendaItems: [],
            notes: 'Команда в нормі. Микола запізнився на 5 хв — попередили.',
            conductedBy: uid,
            participantIds: sRefs.map(s => s.id),
            taskSnapshot: [],
            createdAt: _demoTs(-2),
        }});
    }

    // Протокол 2 — Тижнева нарада тиждень тому
    if (weeklyCoord) {
        sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
            coordId:   weeklyCoord.id,
            coordName: weeklyCoord.name,
            coordType: 'weekly',
            startedAt: new Date(Date.now() - 7*86400000).toISOString(),
            finishedAt:new Date(Date.now() - 7*86400000 + 45*60000).toISOString(), // 45хв
            decisions: [
                { text:'Запустити замовлення Ковалів у виробництво в понеділок', taskId:'', authorId:uid },
                { text:'Закупити додатково 20 листів ЛДСП Горіх для квітневих замовлень', taskId:'', authorId:uid },
                { text:'Перевести стенд шоуруму на нове місце до пятниці', taskId:'', authorId:uid },
                { text:'Призначити Андрія відповідальним за доставки ІТ Хаб', taskId:'', authorId:uid },
                { text:'Повторно обговорити причини затримки замовлення Гриценка на наступній нараді', taskId:'', authorId:uid },
            ],
            unresolved: [
                { text:'Проблема з постачальником МДФ — терміни затримуються на 3 дні', authorId:uid, addedAt:new Date(Date.now() - 7*86400000).toISOString() },
            ],
            agendaDone: ['Підсумки тижня', 'Виробничий план', 'Продажі', 'Фінанси', 'Блокери та ризики'],
            dynamicAgendaItems: [
                { text:'Ситуація з браком на фасадах Марченків', authorId:uid, addedAt:new Date(Date.now() - 7*86400000 - 3600000).toISOString() },
            ],
            notes: 'Продуктивна нарада. Команда виконала 87% плану тижня. Ризик — постачальник МДФ.',
            conductedBy: uid,
            participantIds: sRefs.map(s => s.id),
            taskSnapshot: [],
            createdAt: _demoTs(-7),
        }});
    }

    // Протокол 3 — Рада власника минулого тижня
    if (ownerCoord) {
        sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
            coordId:   ownerCoord.id,
            coordName: ownerCoord.name,
            coordType: 'council_own',
            startedAt: new Date(Date.now() - 8*86400000).toISOString(),
            finishedAt:new Date(Date.now() - 8*86400000 + 60*60000).toISOString(), // 60хв
            decisions: [
                { text:'Затвердити бюджет на відкриття шоуруму — 95 000 грн', taskId:'', authorId:uid },
                { text:'Запустити Instagram-рекламу на квітень бюджет 5 000 грн', taskId:'', authorId:uid },
                { text:'Підвищити ціни на кухні на 7% з 1 квітня 2026', taskId:'', authorId:uid },
                { text:'Найняти другого менеджера продажів до 15 квітня', taskId:'', authorId:uid },
            ],
            unresolved: [],
            agendaDone: ['Фінансові підсумки місяця', 'Стратегія квітня', 'HR питання', 'Ціноутворення'],
            dynamicAgendaItems: [],
            notes: 'Березень — рекордний місяць по виручці. Цілі на квітень підвищені на 10%.',
            conductedBy: uid,
            participantIds: [uid, sRefs[1].id, sRefs[7].id],
            taskSnapshot: [],
            createdAt: _demoTs(-8),
        }});
    }

    if (sessionOps.length) await window.safeBatchCommit(sessionOps);

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
            if (n.includes('шоурум') || n.includes('Шоурум') || n.includes('Сагайдачного')) _txProjIds['showroom'] = d.id;
            if (n.includes('Еко') || n.includes('Дерево')) _txProjIds['eco'] = d.id;
        });
    } catch(e) {}

    // Додаткові транзакції для шоуруму
    if (_txProjIds['showroom']) {
        const showroomTxOps = [];
        const _sr = _txProjIds['showroom'];
        const _showroomTxs = [
            { type:'expense', amt:38000, note:'Ремонт та оздоблення шоуруму',      d:-25, cat:'Оренда цеху та шоуруму',    fi:5 },
            { type:'expense', amt:25000, note:'Меблі для шоуруму (зразки)',         d:-20, cat:'Матеріали (ЛДСП, МДФ)',      fi:3 },
            { type:'expense', amt:12000, note:'Освітлення та електромонтаж',        d:-18, cat:'Обладнання та інструменти',  fi:5 },
            { type:'expense', amt:8500,  note:'Брендування та вивіска',             d:-15, cat:'Маркетинг та реклама',       fi:0 },
            { type:'expense', amt:4500,  note:'Каталоги та рекламні матеріали',    d:-10, cat:'Маркетинг та реклама',       fi:0 },
            { type:'income',  amt:5000,  note:'Перше замовлення з шоуруму',        d:-5,  cat:'Виручка від замовлень',      fi:1 },
        ];
        for (const tx of _showroomTxs) {
            const _catRef2 = catRefs2.find((_, i) => FIN_CATS2[i]?.name === tx.cat);
            showroomTxOps.push({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
                categoryId:   _catRef2 ? _catRef2.id : catRefs2[0].id,
                categoryName: tx.cat,
                accountId:    accRefs[0].id,
                accountName:  ACCOUNTS[0].name,
                type:tx.type, amount:tx.amt, currency:'UAH',
                note:tx.note,
                date:_demoTsFinance(tx.d),
                projectId:   _sr,
                functionId:  fRefs[tx.fi].id,
                createdBy:uid, createdAt:now,
            }});
        }
        await window.safeBatchCommit(showroomTxOps);
    }

    // Транзакції для Еко-Дерево
    if (_txProjIds['eco']) {
        const ecoTxOps = [];
        const _ec = _txProjIds['eco'];
        const _ecoTxs = [
            { type:'expense', amt:18000, note:'Масив дуб — перша партія (1.2 м³)',      d:-55, cat:'Матеріали (ЛДСП, МДФ)',      fi:3 },
            { type:'expense', amt:12000, note:'Масив ясен — заготовки (0.8 м³)',         d:-40, cat:'Матеріали (ЛДСП, МДФ)',      fi:3 },
            { type:'expense', amt:6800,  note:'Фурнітура натуральна — 8 комплектів',    d:-35, cat:'Фурнітура та комплектуючі',  fi:5 },
            { type:'expense', amt:5760,  note:'Лак Osmo — 12л для покриття прототипів', d:-20, cat:'Матеріали (ЛДСП, МДФ)',      fi:3 },
            { type:'expense', amt:8000,  note:'Зарплата столяра — прототипи Еко',       d:-15, cat:'Зарплата команди',           fi:6 },
        ];
        for (const tx of _ecoTxs) {
            const _catRef2 = catRefs2.find((_, i) => FIN_CATS2[i]?.name === tx.cat);
            ecoTxOps.push({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
                categoryId:   _catRef2 ? _catRef2.id : catRefs2[0].id,
                categoryName: tx.cat,
                accountId:    accRefs[0].id,
                accountName:  ACCOUNTS[0].name,
                type:tx.type, amount:tx.amt, currency:'UAH',
                note:tx.note,
                date:_demoTsFinance(tx.d),
                projectId:   _ec,
                functionId:  fRefs[tx.fi].id,
                createdBy:uid, createdAt:now,
            }});
        }
        await window.safeBatchCommit(ecoTxOps);
    }

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
    // Використовуємо safeBatchCommit щоб isDemo:true додалось автоматично
    const bookingCalRef = cr.collection('booking_calendars').doc();
    const bookingSchedRef = cr.collection('booking_schedules').doc(bookingCalRef.id);
    await window.safeBatchCommit([
        {type:'set', ref:bookingCalRef, data:{
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
        }},
        {type:'set', ref:bookingSchedRef, data:{
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
        }},
    ]);

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
    // Очищаємо старі локації перед записом нових
    try {
        const oldLocs = await cr.collection('warehouse_locations').get();
        if (!oldLocs.empty) {
            const delOps = oldLocs.docs.map(d => ({type:'delete', ref:d.ref}));
            await window.safeBatchCommit(delOps);
        }
    } catch(e) {}
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
            ...(finCatMap['Фурнітура та комплектуючі']   ? {['cat_'+finCatMap['Фурнітура та комплектуючі']]:  15000} : {}),
            ...(finCatMap['Оренда цеху та шоуруму']      ? {['cat_'+finCatMap['Оренда цеху та шоуруму']]:     26500} : {}),
            ...(finCatMap['Зарплата команди']             ? {['cat_'+finCatMap['Зарплата команди']]:           112000} : {}),
            ...(finCatMap['Маркетинг та реклама']         ? {['cat_'+finCatMap['Маркетинг та реклама']]:        8000} : {}),
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
        await window.safeBatchCommit([{type:'set', ref:cr.collection('warehouse_inventories').doc(), data:{
            locationId: locIds[0],
            month:      invMonth,
            items:      invItems,
            status:     'confirmed',
            createdBy:  uid,
            createdAt:  _demoTs(-15),
            updatedAt:  _demoTs(-15),
        }}]);
    }

    // ── J. CRM TODO — дзвінки на сьогодні ────────────────
    // nextContactDate вже встановлений в CRM угодах (d:0 = сьогодні)
    // Переконуємось що є угоди на сьогодні і завтра — вже є в DEALS
    // Додаємо ще 2 угоди спеціально для CRM todo списку
    const todayDeals = [
        {
            name:'Первинний дзвінок — Ковтун Марія',
            client:'Ковтун Марія Василівна', phone:'+380671234050', email:'kovtun@gmail.com',
            src:'instagram', stage:'new', amt:0, nc:0,
            note:'Залишила коментар під постом про кухні. Хоче дізнатись ціни і терміни.',
        },
        {
            name:'Нагадування — Бондар Олег (заміри)',
            client:'Бондар Олег', phone:'+380671234051', email:'bondar@ukr.net',
            src:'referral', stage:'consultation', amt:45000, nc:0,
            note:'Домовились перетелефонувати сьогодні після 14:00. Погодити дату виїзду.',
        },
    ];
    // Спочатку клієнти, потім deals з clientId
    const todayClientRefs = todayDeals.map(() => cr.collection('crm_clients').doc());
    const todayClientOps = todayDeals.map((d, i) => ({type:'set', ref:todayClientRefs[i], data:{
        name: d.client, phone: d.phone, email: d.email || '',
        telegram: '', type: 'person', source: d.src, niche: 'furniture',
        createdAt: _demoTs(-1), updatedAt: now,
    }}));
    await window.safeBatchCommit(todayClientOps);

    const todayDealOps = [];
    todayDeals.forEach((d, i) => {
        todayDealOps.push({type:'set', ref:cr.collection('crm_deals').doc(), data:{
            pipelineId:      pipRef.id,
            title:           d.name,
            clientName:      d.client,
            clientId:        todayClientRefs[i].id,
            phone:           d.phone,
            email:           d.email || '',
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
    });
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

// ════════════════════════════════════════════════════════════
// БУДІВЕЛЬНА КОМПАНІЯ — construction_eu
// "БудМайстер" — ремонт та оздоблення приміщень, Київ
// 12 осіб, 8 функцій, повний цикл від ліда до здачі об'єкту
// ════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['construction_eu'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];

    // ── 1. ФУНКЦІЇ (8 блоків) ───────────────────────────────
    const FUNCS = [
        { name:'0. Маркетинг та залучення',   color:'#ec4899', desc:'Реклама, SMM, воронка, ліди, заявки з сайту та соцмереж' },
        { name:'1. Продажі та оцінка',         color:'#22c55e', desc:'Консультації, заміри, КП, договори, CRM, конверсія лідів' },
        { name:'2. Проєктування та кошторис',  color:'#f97316', desc:'Дизайн-проєкт, кошторис, узгодження з клієнтом' },
        { name:'3. Виконання робіт',           color:'#f59e0b', desc:'Демонтаж, чорнові роботи, оздоблення, контроль якості' },
        { name:'4. Постачання матеріалів',     color:'#0ea5e9', desc:'Закупівля, доставка, контроль залишків, постачальники' },
        { name:'5. Фінанси та договори',       color:'#ef4444', desc:'Оплати, рахунки, облік витрат, зарплата, звітність' },
        { name:'6. Якість та здача',           color:'#8b5cf6', desc:'Контроль якості, акти, здача об\'єкту, NPS клієнтів' },
        { name:'7. Управління',                color:'#374151', desc:'Координація, планування, KPI, стратегія' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f, i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Ігор Савченко',
        status:'active', createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // ── 2. КОМАНДА (12 осіб) ────────────────────────────────
    try {
        const oldUsers = await cr.collection('users').get();
        if (!oldUsers.empty) {
            const delOps = [];
            oldUsers.docs.forEach(d => { if (d.id !== uid) delOps.push({type:'delete', ref:cr.collection('users').doc(d.id)}); });
            if (delOps.length) await window.safeBatchCommit(delOps);
        }
    } catch(e) { console.warn('[demo] cleanup users:', e.message); }

    // fi = індекс функції (null = owner без конкретної функції)
    const STAFF = [
        { name:'Ігор Савченко',   role:'owner',    fi:null, pos:'Власник / Директор' },
        { name:'Наталія Коваль',  role:'manager',  fi:1,    pos:'Менеджер продажів' },
        { name:'Дмитро Лисенко',  role:'employee', fi:2,    pos:'Дизайнер-кошторисник' },
        { name:'Олег Мартиненко', role:'employee', fi:6,    pos:'Прораб (старший)' },
        { name:'Сергій Бойченко', role:'employee', fi:3,    pos:'Прораб' },
        { name:'Андрій Ткач',     role:'employee', fi:3,    pos:'Маляр-штукатур (бригадир)' },
        { name:'Василь Гончар',   role:'employee', fi:3,    pos:'Електрик' },
        { name:'Петро Савчук',    role:'employee', fi:3,    pos:'Сантехнік' },
        { name:'Іван Коваленко',  role:'employee', fi:3,    pos:'Плиточник' },
        { name:'Тетяна Романюк',  role:'employee', fi:2,    pos:'Дизайнер інтер\'єру' },
        { name:'Оксана Білоус',   role:'employee', fi:5,    pos:'Бухгалтер / Адмін' },
        { name:'Максим Поліщук',  role:'employee', fi:4,    pos:'Менеджер закупівель' },
    ];
    const sRefs = STAFF.map(() => cr.collection('users').doc());
    STAFF.forEach((s, i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        ops.push({type:'set', ref:sRefs[i], data:{
            name:s.name, role:s.role, position:s.pos,
            email:s.name.toLowerCase().replace(/['\s]+/g,'.') + '@budmaster.demo',
            functionIds: fid ? [fid] : [],
            primaryFunctionId: fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
    });
    await window.safeBatchCommit(ops); ops = [];

    // Оновлюємо функції з assigneeIds
    const funcAssignees = {
        0:[sRefs[0].id],
        1:[sRefs[1].id],
        2:[sRefs[2].id, sRefs[9].id],
        3:[sRefs[3].id, sRefs[4].id, sRefs[5].id, sRefs[6].id, sRefs[7].id, sRefs[8].id],
        4:[sRefs[11].id],
        5:[sRefs[10].id],
        6:[sRefs[3].id],
        7:[sRefs[0].id],
    };
    const funcUpdOps = [];
    for (const [fi, aids] of Object.entries(funcAssignees)) {
        funcUpdOps.push({type:'update', ref:fRefs[parseInt(fi)], data:{assigneeIds:aids, updatedAt:now}});
    }
    await window.safeBatchCommit(funcUpdOps);

    // ── 3. ЗАВДАННЯ (25+) ───────────────────────────────────
    // fi=функція, ai=виконавець (індекс STAFF), st=статус, pr=пріоритет
    // d=зміщення дня відносно сьогодні, tm=час, est=хвилин
    const TASKS = [
        // Сьогодні — МІЙ ДЕНЬ
        { t:'Виїзд на об\'єкт Клименко — підписання акту здачі',       fi:6, ai:3,  st:'new',      pr:'high',   d:0,  tm:'09:00', est:90,  r:'Акт підписаний, фото об\'єкту зроблені, клієнт задоволений' },
        { t:'Закупити штукатурку Knauf для об\'єкту вул.Хрещатик',      fi:4, ai:11, st:'new',      pr:'high',   d:0,  tm:'11:00', est:60,  r:'Штукатурка куплена та доставлена на об\'єкт' },
        { t:'Фінальний огляд якості — квартира Бойко 3к',               fi:6, ai:3,  st:'progress', pr:'high',   d:0,  tm:'14:00', est:60,  r:'Чекліст якості заповнений, дефекти усунені або зафіксовані' },
        { t:'Відповісти на 3 запити в Instagram',                       fi:0, ai:1,  st:'new',      pr:'medium', d:0,  tm:'10:00', est:30,  r:'Всі запити оброблені, ліди внесені в CRM' },
        { t:'Обновити кошторис Петренків після змін планування',        fi:2, ai:2,  st:'progress', pr:'high',   d:0,  tm:'16:00', est:120, r:'Кошторис оновлений і узгоджений з клієнтом' },
        { t:'Виплатити аванс бригаді Андрія за тиждень',                fi:5, ai:10, st:'new',      pr:'high',   d:0,  tm:'17:00', est:30,  r:'Виплата проведена, квитанція збережена в системі' },
        // Завтра
        { t:'Виїзд на замір — вул. Лесі Українки 24',                  fi:2, ai:2,  st:'new',      pr:'high',   d:1,  tm:'10:00', est:90,  r:'Всі заміри зроблені, фото та нотатки збережені' },
        { t:'Доставка плитки Cerrad для ванної Сидоренків',             fi:4, ai:11, st:'new',      pr:'high',   d:1,  tm:'09:00', est:45,  r:'Плитка доставлена, кількість перевірена, брак відсутній' },
        { t:'Нарада з бригадою — розподіл на тиждень',                  fi:7, ai:0,  st:'new',      pr:'medium', d:1,  tm:'08:30', est:45,  r:'Протокол наради, завдання розподілені по виконавцях' },
        // Поточний тиждень
        { t:'Підготувати КП для офісу IT-компанії (300м²)',             fi:1, ai:1,  st:'new',      pr:'high',   d:3,  tm:'18:00', est:180, r:'КП відправлено, дата відповіді зафіксована в CRM' },
        { t:'Встановити електрощиток — об\'єкт Бойко',                  fi:3, ai:6,  st:'new',      pr:'high',   d:4,  tm:'09:00', est:240, r:'Щиток встановлений, перевірений, акт підписаний' },
        { t:'Укласти плитку — ванна кімната Сидоренків',                fi:3, ai:8,  st:'new',      pr:'high',   d:5,  tm:'09:00', est:480, r:'Плитка укладена рівно, затирка виконана, фото зроблені' },
        { t:'Здати дизайн-проєкт Марченків клієнту',                    fi:2, ai:9,  st:'new',      pr:'medium', d:4,  tm:'17:00', est:60,  r:'Проєкт переданий, правки узгоджені письмово' },
        { t:'Замовити вікна Rehau — об\'єкт Петренків',                 fi:4, ai:11, st:'new',      pr:'medium', d:3,  tm:'11:00', est:45,  r:'Замовлення підтверджено, дата поставки відома' },
        // Прострочені
        { t:'Акт виконаних робіт — Тарасенки',                         fi:6, ai:3,  st:'new',      pr:'high',   d:-3, tm:'18:00', est:60,  r:'Акт підписаний, скан збережений в системі' },
        { t:'Фото для портфоліо — об\'єкт Клименко',                    fi:0, ai:1,  st:'new',      pr:'medium', d:-5, tm:'18:00', est:60,  r:'10+ фото готові для публікації в Instagram' },
        { t:'Оновити прайс на сайті',                                   fi:0, ai:1,  st:'new',      pr:'low',    d:-7, tm:'18:00', est:45,  r:'Новий прайс опублікований на сайті та в Google Business' },
        // На перевірці / Виконані
        { t:'Залити стяжку підлоги — квартира Петренків',               fi:3, ai:4,  st:'review',   pr:'high',   d:-1, tm:'18:00', est:480, r:'Стяжка залита, рівність перевірена рівнем' },
        { t:'Договір з Бойками підписаний — старт ремонту',            fi:1, ai:1,  st:'done',     pr:'high',   d:-5, tm:'18:00', est:30,  r:'Договір підписаний, аванс 50% отриманий' },
        { t:'Кошторис Романових затверджений клієнтом',                 fi:2, ai:2,  st:'done',     pr:'medium', d:-4, tm:'18:00', est:90,  r:'Кошторис затверджений, підпис клієнта отримано' },
        // Відхилені з перевірки
        { t:'Кошторис для Ковалів — занижена вартість робіт',           fi:2, ai:2,  st:'progress', pr:'high',   d:-2, tm:'18:00', est:90,
          reason:'Занижена вартість робіт на 15%. Переглянути норми та підняти ціни до ринкових.' },
        { t:'Звіт по матеріалах — не вистачає накладних',               fi:5, ai:10, st:'progress', pr:'medium', d:-3, tm:'18:00', est:45,
          reason:'Не вистачає накладних від постачальника. Додати скани всіх документів.' },
        // Додаткові для наповненості
        { t:'Демонтаж старої плитки — ванна Бойко',                     fi:3, ai:5,  st:'done',     pr:'high',   d:-8, tm:'09:00', est:240, r:'Демонтаж виконаний, сміття вивезено' },
        { t:'Розробити план-графік об\'єкту FinTech',                    fi:2, ai:2,  st:'done',     pr:'high',   d:-6, tm:'18:00', est:120, r:'Графік розроблений і погоджений з замовником' },
        { t:'Перевірка комунікацій перед закриттям стін — Петренки',    fi:6, ai:3,  st:'done',     pr:'high',   d:-9, tm:'11:00', est:60,  r:'Всі комунікації перевірені, фото до закриття зроблені' },
    ];

    for (const t of TASKS) {
        const ref = cr.collection('tasks').doc();
        const data = {
            title:t.t,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:t.st, priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:t.tm,
            estimatedTime:String(t.est), expectedResult:t.r || '',
            requireReview: t.st !== 'done',
            createdAt:now, updatedAt:now,
        };
        if (t.reason) {
            data.reviewRejectedAt = new Date(Date.now() + t.d * 86400000).toISOString();
            data.reviewRejectedBy = uid;
            data.reviewRejectReason = t.reason;
        }
        ops.push({type:'set', ref, data});
    }

    // ── 4. РЕГУЛЯРНІ ЗАВДАННЯ (15) ──────────────────────────
    const REGS = [
        // Щоденні
        { t:'Стенд-ап прорабів 08:00 — стан кожного об\'єкту',  type:'daily',              fi:7, ai:0,  tm:'08:00', est:10, result:'Кожен прораб озвучив статус, блокери вирішені або ескальовані' },
        { t:'Фото прогресу з об\'єктів в чат',                   type:'daily',              fi:3, ai:5,  tm:'09:00', est:15, result:'3+ фото з кожного активного об\'єкту відправлені в робочий чат' },
        // Щотижневі пн
        { t:'Нарада всієї команди — розподіл задач на тиждень',  type:'weekly', dow:1,       fi:7, ai:0,  tm:'08:30', est:45, result:'Протокол наради, задачі тижня розподілені по виконавцях' },
        { t:'Перевірка залишків матеріалів на складі',            type:'weekly', dow:1,       fi:4, ai:11, tm:'09:00', est:30, result:'Список позицій нижче мінімуму, заявка на закупівлю сформована' },
        { t:'Планування закупівель на тиждень',                   type:'weekly', dow:1,       fi:4, ai:11, tm:'10:00', est:30, result:'Список закупівель затверджений, постачальники повідомлені' },
        // Щотижневі ср
        { t:'Обдзвін клієнтів — статус задоволення',              type:'weekly', dow:3,       fi:1, ai:1,  tm:'14:00', est:90, result:'Кожен активний клієнт отримав дзвінок, нотатка внесена в CRM' },
        { t:'Перевірка якості на кожному об\'єкті',               type:'weekly', dow:3,       fi:6, ai:3,  tm:'10:00', est:120,result:'Чекліст якості заповнений по кожному об\'єкту, дефекти зафіксовані' },
        // Щотижневі пт
        { t:'Фінансовий звіт тижня',                              type:'weekly', dow:5,       fi:5, ai:10, tm:'16:00', est:60, result:'Доходи/витрати тижня, залишки на рахунках, прострочені платежі' },
        { t:'Звіт продажів: ліди, КП, договори',                  type:'weekly', dow:5,       fi:1, ai:1,  tm:'17:00', est:45, result:'Таблиця: нові ліди, відправлені КП, підписані договори, конверсія' },
        { t:'Виплата зарплати погодинникам',                       type:'weekly', dow:5,       fi:5, ai:10, tm:'15:00', est:30, result:'Погодинники отримали оплату, відомість підписана' },
        // Щомісячні
        { t:'Оновлення портфоліо на сайті',                        type:'monthly', dom:1,      fi:0, ai:1,  tm:'11:00', est:60, result:'Нові завершені об\'єкти опубліковані з фото та описом' },
        { t:'Аналіз рентабельності об\'єктів',                    type:'monthly', dom:5,      fi:7, ai:0,  tm:'10:00', est:120,result:'Звіт по маржі кожного об\'єкту, висновки для власника' },
        { t:'Виплата основної зарплати',                           type:'monthly', dom:25,     fi:5, ai:10, tm:'10:00', est:60, result:'Зарплата нарахована та виплачена, звіт для власника' },
        { t:'Страхові внески та податки',                          type:'monthly', dom:28,     fi:5, ai:10, tm:'11:00', est:45, result:'Всі обов\'язкові платежі проведені, квитанції збережені' },
        { t:'Зустріч з постачальниками — умови та ціни',          type:'monthly', dom:10,     fi:4, ai:11, tm:'14:00', est:90, result:'Актуальні прайси отримані, умови співпраці переглянуті' },
    ];
    for (const r of REGS) {
        const dows = r.type === 'weekly' && r.dow != null ? [r.dow] : null;
        let timeEnd = null;
        if (r.tm && r.est) {
            const [hh, mm] = r.tm.split(':').map(Number);
            const tot = hh * 60 + mm + r.est;
            timeEnd = String(Math.floor(tot/60)).padStart(2,'0') + ':' + String(tot%60).padStart(2,'0');
        }
        ops.push({type:'set', ref:cr.collection('regularTasks').doc(), data:{
            title:r.t, period:r.type, daysOfWeek:dows, dayOfMonth:r.dom || null,
            skipWeekends:r.type==='daily', timeStart:r.tm, timeEnd, duration:r.est,
            function:FUNCS[r.fi].name,
            assigneeId:sRefs[r.ai].id,
            expectedResult:r.result || '',
            reportFormat:'Короткий звіт у вільній формі',
            instruction:'', priority:'medium', requireReview:false,
            notifyOnComplete:[], checklist:[], status:'active', createdAt:now,
        }});
    }

    // ── 5. ПРОЦЕС-ШАБЛОНИ (5 шаблонів) ─────────────────────
    const tpl1Ref = cr.collection('processTemplates').doc(); // Ремонт квартири під ключ
    const tpl2Ref = cr.collection('processTemplates').doc(); // Оздоблення офісу
    const tpl3Ref = cr.collection('processTemplates').doc(); // Онбординг
    const tpl4Ref = cr.collection('processTemplates').doc(); // Закупівля матеріалів
    const tpl5Ref = cr.collection('processTemplates').doc(); // Рекламація

    ops.push({type:'set', ref:tpl1Ref, data:{
        name:'Ремонт квартири під ключ',
        description:'Повний цикл від першого дзвінка до підписаного акту здачі. 12 кроків.',
        steps:[
            {id:'s1', name:'Виїзний замір та консультація',          functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1,  order:1},
            {id:'s2', name:'Підготовка КП та кошторису',             functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:3,  order:2},
            {id:'s3', name:'Підписання договору',                    functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1,  order:3},
            {id:'s4', name:'Отримання авансу 50%',                   functionId:fRefs[5].id, functionName:FUNCS[5].name, durationDays:1,  order:4},
            {id:'s5', name:'Демонтажні роботи',                      functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:5,  order:5},
            {id:'s6', name:'Чорнові роботи (електро, сантехніка)',   functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:10, order:6},
            {id:'s7', name:'Комунікації та інженерні системи',       functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:7,  order:7},
            {id:'s8', name:'Стяжка підлоги',                         functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:4,  order:8},
            {id:'s9', name:'Роботи зі стінами та стелею',            functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:14, order:9},
            {id:'s10',name:'Чистові оздоблювальні роботи',           functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:10, order:10},
            {id:'s11',name:'Фінальне прибирання',                    functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1,  order:11},
            {id:'s12',name:'Здача об\'єкту — підписання акту',       functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1,  order:12},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl2Ref, data:{
        name:'Оздоблення офісу',
        description:'9 кроків від технічного завдання до здачі комерційного об\'єкту',
        steps:[
            {id:'s1', name:'Замір та погодження ТЗ',                 functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:2,  order:1},
            {id:'s2', name:'Розробка дизайн-проєкту',                functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:7,  order:2},
            {id:'s3', name:'Підготовка КП та кошторису',             functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:3,  order:3},
            {id:'s4', name:'Підписання договору та аванс',           functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1,  order:4},
            {id:'s5', name:'Підготовчі та демонтажні роботи',        functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:5,  order:5},
            {id:'s6', name:'Монтажні та інженерні роботи',           functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:14, order:6},
            {id:'s7', name:'Оздоблювальні роботи',                   functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:10, order:7},
            {id:'s8', name:'Фінальне прибирання та обладнання',      functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:2,  order:8},
            {id:'s9', name:'Здача та підписання акту',               functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1,  order:9},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl3Ref, data:{
        name:'Онбординг нового працівника',
        description:'Введення нового члена бригади або адміністративного персоналу',
        steps:[
            {id:'s1', name:'Оформлення документів та інструктаж ТБ', functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:1},
            {id:'s2', name:'Знайомство з командою та об\'єктами',    functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:2},
            {id:'s3', name:'Навчання стандартам та інструкціям',     functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:3, order:3},
            {id:'s4', name:'Робота під наглядом наставника',         functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:7, order:4},
            {id:'s5', name:'Самостійна робота на об\'єкті',          functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:7, order:5},
            {id:'s6', name:'Оцінка за випробувальний період',        functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:6},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl4Ref, data:{
        name:'Закупівля матеріалів',
        description:'Від виявлення потреби до оприбуткування на склад',
        steps:[
            {id:'s1', name:'Формування заявки на матеріали',         functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:1},
            {id:'s2', name:'Отримання КП від постачальників',        functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:2, order:2},
            {id:'s3', name:'Погодження та оплата рахунку',           functionId:fRefs[5].id, functionName:FUNCS[5].name, durationDays:1, order:3},
            {id:'s4', name:'Приймання та перевірка якості',          functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:4},
            {id:'s5', name:'Оприбуткування в системі',               functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl5Ref, data:{
        name:'Робота з рекламацією',
        description:'Обробка скарги клієнта від звернення до закриття',
        steps:[
            {id:'s1', name:'Прийом скарги та реєстрація',            functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Виїзна діагностика прорабом',            functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:2},
            {id:'s3', name:'Погодження рішення з клієнтом',          functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:3},
            {id:'s4', name:'Виконання ремонтних робіт',              functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:3, order:4},
            {id:'s5', name:'Закриття рекламації та відгук клієнта',  functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    // 7 активних процесів
    const PROCS = [
        { tpl:tpl1Ref, name:'Квартира Бойко — 2к 65м² ЖК Комфорт',  step:9,  ai:3  },
        { tpl:tpl2Ref, name:'Офіс FinTech Київ — 180м²',             step:5,  ai:3  },
        { tpl:tpl1Ref, name:'Квартира Петренків — 3к 95м²',          step:6,  ai:4  },
        { tpl:tpl1Ref, name:'Квартира Сидоренків — 1к 38м²',         step:8,  ai:5  },
        { tpl:tpl3Ref, name:'Онбординг — Іван Коваленко',             step:4,  ai:3  },
        { tpl:tpl4Ref, name:'Закупівля матеріалів — квітень',         step:2,  ai:11 },
        { tpl:tpl5Ref, name:'Рекламація Тарасенків — тріщина в стіні',step:2,  ai:3  },
    ];
    const tplNames = {
        [tpl1Ref.id]:'Ремонт квартири під ключ',
        [tpl2Ref.id]:'Оздоблення офісу',
        [tpl3Ref.id]:'Онбординг нового працівника',
        [tpl4Ref.id]:'Закупівля матеріалів',
        [tpl5Ref.id]:'Робота з рекламацією',
    };
    for (const p of PROCS) {
        ops.push({type:'set', ref:cr.collection('processes').doc(), data:{
            templateId:p.tpl.id, templateName:tplNames[p.tpl.id],
            name:p.name, currentStep:p.step, status:'active',
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            startDate:_demoDate(-14), deadline:_demoDate(30),
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops); ops = [];

    // ── 6. ПРОЄКТИ (3) ──────────────────────────────────────
    const PROJS = [
        { name:'Квартира Бойко — 65м² ЖК Комфорт',     desc:'Ремонт 2-кімнатної квартири під ключ',           color:'#22c55e', rev:245000, labor:120000, mat:85000,  start:-10, end:25  },
        { name:'Офіс FinTech Київ — 180м²',             desc:'Оздоблення офісного приміщення під ключ',        color:'#f59e0b', rev:580000, labor:250000, mat:180000, start:-20, end:40  },
        { name:'Квартира Петренків — 95м² преміум',     desc:'Ремонт 3-кімнатної квартири преміум класу',      color:'#8b5cf6', rev:520000, labor:200000, mat:120000, start:-15, end:50  },
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

    // Читаємо проєкти для прив'язки етапів і завдань
    const projSnap = await cr.collection('projects').get();
    const projDocs = projSnap.docs.map(d => ({id:d.id, ...d.data()}));

    // Етапи проєктів
    const stageOps = [];
    for (const proj of projDocs) {
        const pn = proj.name || '';
        let stages = [];
        if (pn.includes('Бойко')) {
            stages = [
                {name:'Демонтаж та підготовка',     status:'done',        order:1, start:_demoDate(-10), end:_demoDate(-6)},
                {name:'Чорнові роботи',              status:'done',        order:2, start:_demoDate(-6),  end:_demoDate(-2)},
                {name:'Комунікації (електро/сантех)',status:'done',        order:3, start:_demoDate(-3),  end:_demoDate(0) },
                {name:'Стяжка та вирівнювання',      status:'done',        order:4, start:_demoDate(0),   end:_demoDate(3) },
                {name:'Чистові оздоблювальні роботи',status:'in_progress', order:5, start:_demoDate(3),   end:_demoDate(18)},
                {name:'Здача об\'єкту',              status:'planned',     order:6, start:_demoDate(20),  end:_demoDate(25)},
            ];
        } else if (pn.includes('FinTech')) {
            stages = [
                {name:'ТЗ та дизайн-проєкт',         status:'done',        order:1, start:_demoDate(-20), end:_demoDate(-16)},
                {name:'Демонтаж та підготовка',       status:'done',        order:2, start:_demoDate(-16), end:_demoDate(-10)},
                {name:'Монтажні та інженерні роботи', status:'in_progress', order:3, start:_demoDate(-8),  end:_demoDate(10) },
                {name:'Оздоблювальні роботи',         status:'planned',     order:4, start:_demoDate(10),  end:_demoDate(28) },
                {name:'Здача та оплата',              status:'planned',     order:5, start:_demoDate(36),  end:_demoDate(40) },
            ];
        } else if (pn.includes('Петренків')) {
            stages = [
                {name:'Замір та кошторис',            status:'done',        order:1, start:_demoDate(-15), end:_demoDate(-13)},
                {name:'Демонтаж',                     status:'done',        order:2, start:_demoDate(-13), end:_demoDate(-8) },
                {name:'Чорнові роботи',               status:'done',        order:3, start:_demoDate(-8),  end:_demoDate(-2) },
                {name:'Стяжка та комунікації',        status:'in_progress', order:4, start:_demoDate(-2),  end:_demoDate(10) },
                {name:'Чистові роботи',               status:'planned',     order:5, start:_demoDate(12),  end:_demoDate(38) },
                {name:'Здача об\'єкту',               status:'planned',     order:6, start:_demoDate(44),  end:_demoDate(50) },
            ];
        }
        for (const s of stages) {
            stageOps.push({type:'set', ref:cr.collection('projectStages').doc(), data:{
                projectId:proj.id, name:s.name, order:s.order, status:s.status,
                plannedStartDate:s.start, plannedEndDate:s.end,
                actualStartDate: s.status==='done' ? s.start : null,
                actualEndDate:   s.status==='done' ? s.end   : null,
                progressPct: s.status==='done' ? 100 : s.status==='in_progress' ? 50 : 0,
                blockedReason:null, createdAt:now, updatedAt:now,
            }});
        }
    }
    if (stageOps.length) await window.safeBatchCommit(stageOps);

    // ── 7. CRM ───────────────────────────────────────────────
    // Видаляємо старі pipelines
    try {
        const oldPips = await cr.collection('crm_pipeline').get();
        if (!oldPips.empty) {
            const pipDelOps = oldPips.docs.map(d => ({type:'delete', ref:d.ref}));
            await window.safeBatchCommit(pipDelOps);
        }
    } catch(e) {}

    const pipRef = cr.collection('crm_pipeline').doc();
    await pipRef.set({
        isDemo:true,
        name:'Ремонтні послуги',
        stages:[
            {id:'new',          label:'Новий лід',          color:'#6b7280', order:1},
            {id:'consultation', label:'Консультація',        color:'#3b82f6', order:2},
            {id:'measurement',  label:'Виїзний замір',       color:'#8b5cf6', order:3},
            {id:'estimate',     label:'Кошторис',            color:'#f59e0b', order:4},
            {id:'proposal',     label:'КП / Договір',        color:'#f97316', order:5},
            {id:'signed',       label:'Підписано',           color:'#22c55e', order:6},
            {id:'in_progress',  label:'В роботі',            color:'#0ea5e9', order:7},
            {id:'done',         label:'Об\'єкт зданий',      color:'#16a34a', order:8},
            {id:'lost',         label:'Відмова',             color:'#ef4444', order:9},
        ],
        createdBy:uid, createdAt:now, isDefault:true,
    });

    const DEALS = [
        // Активні
        { name:'Ремонт квартири — Бойко Олена',        client:'Бойко Олена',       phone:'+380671110001', email:'boyko@gmail.com',      src:'referral',   stage:'in_progress', amt:245000, nc:2,  note:'Квартира 65м², 2к. В роботі — крок 9/12 (чистові роботи). Аванс 50% отримано.' },
        { name:'Оздоблення офісу FinTech',             client:'FinTech (Данилюк)', phone:'+380671110002', email:'fintech@company.ua',   src:'google',     stage:'in_progress', amt:580000, nc:5,  note:'Офіс 180м². В роботі — монтажні роботи. Договір підписаний, аванс 40% отримано.' },
        { name:'Ремонт преміум — Петренко С.',         client:'Петренко Сергій',   phone:'+380671110003', email:'petrenko@ukr.net',     src:'referral',   stage:'in_progress', amt:520000, nc:7,  note:'Квартира 95м², 3к, преміум. Стяжка. Матеріали преміум-класу узгоджені.' },
        { name:'Ремонт ванної кімнати — Сидоренко',   client:'Сидоренко Віра',    phone:'+380671110004', email:'sydorenko@gmail.com',  src:'instagram',  stage:'in_progress', amt:165000, nc:1,  note:'Квартира 38м², 1к. Укладка плитки. Термін здачі — 2 тижні.' },
        { name:'Дизайн + ремонт — Марченки',          client:'Марченко Олег',     phone:'+380671110005', email:'marchenko@ukr.net',    src:'referral',   stage:'proposal',    amt:280000, nc:3,  note:'КП надіслано. Чекаємо підпис. Бюджет погоджений, початок через 3 тижні.' },
        { name:'Ремонт квартири — Ковалі',            client:'Коваль Тетяна',     phone:'+380671110006', email:'koval@gmail.com',      src:'google',     stage:'measurement', amt:120000, nc:0,  note:'Замір призначено. Хочуть кухню + вітальню. Бюджет ~120К.' },
        { name:'Консультація — Гриценко І.',          client:'Гриценко Іван',     phone:'+380671110007', email:'grytsenko@ukr.net',   src:'instagram',  stage:'consultation',amt:90000,  nc:1,  note:'Онлайн-консультація проведена. Хочуть ремонт ванної + коридору.' },
        { name:'Новий лід — Яценко А.',               client:'Яценко Андрій',     phone:'+380671110008', email:'yatsenko@gmail.com',   src:'instagram',  stage:'new',         amt:0,      nc:0,  note:'Залишив заявку на сайті. Однокімнатна квартира, орієнтовний бюджет невідомий.' },
        { name:'Новий лід — Борисенко К.',            client:'Борисенко Катерина', phone:'+380671110009',email:'borysenko@ukr.net',    src:'referral',   stage:'new',         amt:0,      nc:0,  note:'Рекомендація від Бойко. Потребує ремонт офісу 80м².' },
        { name:'Відновити контакт — Терещенко',       client:'Терещенко Микола',  phone:'+380671110010', email:'tereshchenko@ukr.net', src:'google',     stage:'estimate',    amt:150000, nc:0,  note:'Кошторис відправлений 2 тижні тому. Не відповідає. Потрібно зателефонувати.' },
        { name:'Ремонт квартири — Данченко',          client:'Данченко Світлана', phone:'+380671110011', email:'danchenko@gmail.com',  src:'referral',   stage:'consultation',amt:380000, nc:0,  note:'Нарада погоджена на завтра. Преміум ремонт квартири 120м².' },
        // Виграні
        { name:'Ремонт квартири — Клименко',          client:'Клименко Ірина',    phone:'+380671110012', email:'klymenko@ukr.net',     src:'referral',   stage:'done',        amt:185000, nc:null, note:'Об\'єкт зданий вчасно. Клієнт задоволений. Дав 5 зірок у Google.' },
        { name:'Ремонт будинку — Романови',           client:'Романов Василь',    phone:'+380671110013', email:'romanov@gmail.com',    src:'referral',   stage:'done',        amt:320000, nc:null, note:'Будинок 130м². Зданий на 5 днів раніше терміну. Порекомендував 2 клієнтів.' },
        // Програна
        { name:'Офіс — Шевченко (відмова: ціна)',     client:'Шевченко Ігор',     phone:'+380671110014', email:'shevchenko@ukr.net',   src:'google',     stage:'lost',        amt:210000, nc:null, note:'Пішов до дешевшого підрядника. Різниця 15%. Ціна = наш стандарт якості.' },
    ];

    // Спочатку crm_clients, потім deals з clientId
    const cliRefs = DEALS.map(() => cr.collection('crm_clients').doc());
    const cliOps  = DEALS.map((d, i) => ({type:'set', ref:cliRefs[i], data:{
        name:d.client, phone:d.phone, email:d.email,
        telegram:'', type:'person', source:d.src, niche:'construction',
        createdAt:_demoTs(-[1,2,3,5,7,10,14,21][Math.floor(Math.random()*8)]),
        updatedAt:now,
    }}));
    await window.safeBatchCommit(cliOps);

    const dealOps = [];
    const _ages = [1,2,3,5,7,10,14,21];
    DEALS.forEach((d, i) => {
        dealOps.push({type:'set', ref:cr.collection('crm_deals').doc(), data:{
            pipelineId:pipRef.id,
            title:d.name,
            clientName:d.client,
            clientId:cliRefs[i].id,
            phone:d.phone, email:d.email,
            source:d.src, stage:d.stage, amount:d.amt,
            note:d.note,
            nextContactDate: d.nc !== null ? _demoDate(d.nc) : null,
            nextContactTime: d.nc === 0 ? '14:00' : null,
            assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
            deleted:false, tags:[],
            createdAt:_demoTs(-_ages[Math.floor(Math.random()*_ages.length)]),
            updatedAt:now,
        }});
    });
    await window.safeBatchCommit(dealOps);

    // CRM TODO — додаткові дзвінки на сьогодні
    const todayDeals = [
        { name:'Первинний дзвінок — Яценко Андрій',  client:'Яценко Андрій',     phone:'+380671110020', email:'yatsenko2@gmail.com',  src:'instagram',  stage:'new',         amt:0,     note:'Залишив заявку вночі на ремонт 1к квартири. Ще не дзвонили.' },
        { name:'Нагадування — Данченко (нарада)',     client:'Данченко Світлана', phone:'+380671110021', email:'danchenko2@ukr.net',   src:'referral',   stage:'consultation',amt:380000,note:'Домовились зустрітись сьогодні о 15:00. Преміум квартира 120м².' },
    ];
    const todayCliRefs = todayDeals.map(() => cr.collection('crm_clients').doc());
    const todayCliOps  = todayDeals.map((d, i) => ({type:'set', ref:todayCliRefs[i], data:{
        name:d.client, phone:d.phone, email:d.email,
        telegram:'', type:'person', source:d.src, niche:'construction',
        createdAt:_demoTs(-1), updatedAt:now,
    }}));
    await window.safeBatchCommit(todayCliOps);

    const todayDealOps = todayDeals.map((d, i) => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        pipelineId:pipRef.id, title:d.name,
        clientName:d.client, clientId:todayCliRefs[i].id,
        phone:d.phone, email:d.email,
        source:d.src, stage:d.stage, amount:d.amt, note:d.note,
        nextContactDate:_demoDate(0), nextContactTime:'14:00',
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        deleted:false, tags:[], createdAt:_demoTs(-1), updatedAt:now,
    }}));
    await window.safeBatchCommit(todayDealOps);

    // ── 8. ФІНАНСИ ───────────────────────────────────────────
    const finSettingsRef = cr.collection('finance_settings').doc('main');
    await finSettingsRef.set({
        isDemo:true, version:1, region:'UA', currency:'UAH', niche:'construction',
        initializedAt:now, initializedBy:uid, updatedAt:now,
    });

    // Видаляємо старі рахунки та категорії
    try {
        for (const col of ['finance_accounts','finance_transactions','finance_categories','finance_recurring']) {
            const snap = await cr.collection(col).get();
            if (!snap.empty) {
                const delOps = snap.docs.map(d => ({type:'delete', ref:d.ref}));
                await window.safeBatchCommit(delOps);
            }
        }
    } catch(e) { console.warn('[demo] cleanup finance:', e.message); }

    // Рахунки
    const accRefs = [
        cr.collection('finance_accounts').doc(),
        cr.collection('finance_accounts').doc(),
        cr.collection('finance_accounts').doc(),
    ];
    const ACCOUNTS = [
        { name:'Приватбанк ФОП', type:'bank', balance:485000, currency:'UAH', isDefault:true  },
        { name:'Каса (аванси готівкою)', type:'cash', balance:85000, currency:'UAH', isDefault:false },
        { name:'Картка матеріали', type:'card', balance:32000, currency:'UAH', isDefault:false },
    ];
    const finOps = [];
    ACCOUNTS.forEach((a, i) => finOps.push({type:'set', ref:accRefs[i], data:{
        ...a, createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // Категорії
    const FIN_CATS = [
        { name:'Аванс за ремонт',              type:'income',  color:'#22c55e', icon:'dollar-sign' },
        { name:'Фінальна оплата',               type:'income',  color:'#16a34a', icon:'credit-card' },
        { name:'Доплата за додаткові роботи',   type:'income',  color:'#84cc16', icon:'plus-circle' },
        { name:'Матеріали (будівельні)',         type:'expense', color:'#ef4444', icon:'package' },
        { name:'Зарплата бригади',              type:'expense', color:'#f97316', icon:'users' },
        { name:'Оренда складу',                 type:'expense', color:'#8b5cf6', icon:'home' },
        { name:'Транспорт та доставка',         type:'expense', color:'#0ea5e9', icon:'truck' },
        { name:'Інструменти та обладнання',     type:'expense', color:'#14b8a6', icon:'tool' },
        { name:'Реклама / Маркетинг',           type:'expense', color:'#ec4899', icon:'trending-up' },
        { name:'Адміністративні витрати',       type:'expense', color:'#6b7280', icon:'briefcase' },
        { name:'Субпідряд',                     type:'expense', color:'#f59e0b', icon:'git-branch' },
    ];
    const catRefs = FIN_CATS.map(() => cr.collection('finance_categories').doc());
    FIN_CATS.forEach((c, i) => finOps.push({type:'set', ref:catRefs[i], data:{
        name:c.name, type:c.type, color:c.color, icon:c.icon,
        isDefault:false, createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(finOps);

    // Маппінг нотатки → functionId
    const _noteToFunc = (note) => {
        if (!note) return '';
        if (note.includes('реклам') || note.includes('Instagram') || note.includes('Google')) return fRefs[0].id;
        if (note.includes('Аванс') || note.includes('аванс') || note.includes('Бойко') || note.includes('FinTech') || note.includes('Петренко') || note.includes('Сидоренко') || note.includes('Клименко') || note.includes('Романов')) return fRefs[1].id;
        if (note.includes('матеріал') || note.includes('штукатурк') || note.includes('плитк') || note.includes('ЛДСП') || note.includes('Knauf') || note.includes('Cerrad')) return fRefs[4].id;
        if (note.includes('зарплат') || note.includes('бригад')) return fRefs[5].id;
        if (note.includes('оренд')) return fRefs[5].id;
        return '';
    };

    // Транзакції (27+ за 3 місяці)
    const TXS = [
        // Поточний місяць — доходи
        {ci:0, acc:0, amt:122500, note:'Аванс 50% — квартира Бойко (245К)', d:-2,  type:'income'},
        {ci:0, acc:0, amt:232000, note:'Аванс 40% — офіс FinTech (580К)',   d:-5,  type:'income'},
        {ci:0, acc:1, amt:82500,  note:'Аванс 50% готівкою — Петренко',     d:-7,  type:'income'},
        {ci:1, acc:0, amt:185000, note:'Фінальна оплата — Клименко',        d:-1,  type:'income'},
        {ci:2, acc:0, amt:18000,  note:'Доплата — Тарасенки (додаткові роботи)',d:-9,type:'income'},
        // Поточний місяць — витрати
        {ci:3, acc:0, amt:38500,  note:'Штукатурка Knauf + шпаклівка — Петренко',d:-3, type:'expense'},
        {ci:3, acc:0, amt:22000,  note:'Плитка Cerrad 40м² — Сидоренко',   d:-6,  type:'expense'},
        {ci:3, acc:2, amt:18000,  note:'Матеріали — офіс FinTech (гіпсокартон)', d:-4,type:'expense'},
        {ci:4, acc:1, amt:45000,  note:'Зарплата бригади — аванс березень',d:-10, type:'expense'},
        {ci:5, acc:2, amt:12000,  note:'Оренда складу — березень',          d:-1,  type:'expense'},
        {ci:6, acc:2, amt:8500,   note:'Транспорт — доставка матеріалів',   d:-8,  type:'expense'},
        {ci:8, acc:0, amt:8000,   note:'Реклама Google/Meta — березень',    d:-5,  type:'expense'},
        {ci:9, acc:2, amt:2500,   note:'Інтернет + телефонія',              d:-1,  type:'expense'},
        // Минулий місяць — доходи
        {ci:1, acc:0, amt:320000, note:'Фінальна оплата — будинок Романових',d:-32, type:'income'},
        {ci:0, acc:0, amt:96000,  note:'Аванс 40% — Сидоренко',            d:-28, type:'income'},
        {ci:2, acc:1, amt:25000,  note:'Доплата за додаткові роботи — Петренко',d:-25,type:'income'},
        // Минулий місяць — витрати
        {ci:3, acc:0, amt:85000,  note:'Матеріали — Романови (будинок)',    d:-30, type:'expense'},
        {ci:4, acc:0, amt:92000,  note:'Зарплата бригади — лютий повна',    d:-5,  type:'expense'},
        {ci:3, acc:0, amt:28000,  note:'Матеріали — Сидоренко',            d:-29, type:'expense'},
        {ci:5, acc:2, amt:12000,  note:'Оренда складу — лютий',            d:-31, type:'expense'},
        {ci:10,acc:0, amt:15000,  note:'Субпідряд — електрик Гончар',      d:-27, type:'expense'},
        // Позаминулий місяць
        {ci:1, acc:0, amt:140000, note:'Фінальна оплата — Клименко (минулий)',d:-58,type:'income'},
        {ci:0, acc:1, amt:60000,  note:'Аванс готівкою — Марченки',        d:-55, type:'income'},
        {ci:3, acc:0, amt:42000,  note:'Матеріали — Клименко',             d:-60, type:'expense'},
        {ci:4, acc:0, amt:88000,  note:'Зарплата — січень',                d:-36, type:'expense'},
        {ci:8, acc:0, amt:8000,   note:'Реклама — січень',                  d:-55, type:'expense'},
        {ci:7, acc:2, amt:12000,  note:'Інструменти — перфоратор Bosch',    d:-50, type:'expense'},
    ];

    const txOps = [];
    // Завантажуємо проєкти для прив'язки транзакцій
    const projSnapFin = await cr.collection('projects').get();
    const projDocsFin = projSnapFin.docs.map(d => ({id:d.id, ...d.data()}));
    const _getProjId = (note) => {
        const p = projDocsFin.find(p => {
            const n = (p.name||'').toLowerCase();
            if (note.includes('Бойко') && n.includes('бойко')) return true;
            if (note.includes('FinTech') && n.includes('fintech')) return true;
            if ((note.includes('Петренко') || note.includes('Петренк')) && n.includes('петренк')) return true;
            return false;
        });
        return p ? p.id : '';
    };

    for (const tx of TXS) {
        txOps.push({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
            categoryId:   catRefs[tx.ci].id,
            categoryName: FIN_CATS[tx.ci].name,
            accountId:    accRefs[tx.acc].id,
            accountName:  ACCOUNTS[tx.acc].name,
            type:tx.type, amount:tx.amt, currency:'UAH',
            note:tx.note,
            date:_demoTsFinance(tx.d),
            projectId:  _getProjId(tx.note),
            functionId: _noteToFunc(tx.note),
            createdBy:uid, createdAt:now,
        }});
    }
    await window.safeBatchCommit(txOps);

    // Регулярні платежі (8)
    const regPays = [
        { name:'Оренда складу',              type:'expense', amount:12000, day:1,  category:'Оренда', freq:'monthly', comment:'вул. Складська 5' },
        { name:'Інтернет + телефонія',        type:'expense', amount:2500,  day:1,  category:'Адмін', freq:'monthly',  comment:'Київстар + Укртелеком' },
        { name:'Підписка CRM (TALKO)',        type:'expense', amount:1200,  day:1,  category:'Адмін', freq:'monthly',  comment:'talko.app' },
        { name:'Страховка відповідальності',  type:'expense', amount:3500,  day:1,  category:'Адмін', freq:'monthly',  comment:'Річна страховка' },
        { name:'Зарплата — Оксана Білоус',    type:'expense', amount:22000, day:25, category:'Зарплата', freq:'monthly',comment:'Бухгалтер/Адмін' },
        { name:'Зарплата — Наталія Коваль',   type:'expense', amount:18000, day:25, category:'Зарплата', freq:'monthly',comment:'Менеджер продажів' },
        { name:'Зарплата — Дмитро Лисенко',   type:'expense', amount:20000, day:25, category:'Зарплата', freq:'monthly',comment:'Дизайнер-кошторисник' },
        { name:'Реклама Google/Meta',          type:'expense', amount:8000,  day:5,  category:'Маркетинг', freq:'monthly',comment:'Google Ads + Meta Ads' },
    ];
    const regOps = regPays.map(r => ({type:'set', ref:cr.collection('finance_recurring').doc(), data:{
        name:r.name, type:r.type, amount:r.amount, currency:'UAH',
        category:r.category, frequency:r.freq, dayOfMonth:r.day,
        counterparty:'', comment:r.comment, accountId:'',
        active:true, createdAt:now, updatedAt:now,
    }}));
    await window.safeBatchCommit(regOps);

    // Бюджети (3 місяці)
    const finCatSnap = await cr.collection('finance_categories').get();
    const finCatMap = {};
    finCatSnap.docs.forEach(d => { finCatMap[d.data().name] = d.id; });
    const budgetMonths = [
        { month:_demoDate(-30).slice(0,7), goal:420000 },
        { month:_demoDate(0).slice(0,7),   goal:480000 },
        { month:_demoDate(30).slice(0,7),  goal:540000 },
    ];
    const budgetOps = budgetMonths.map(bm => ({type:'set',
        ref:cr.collection('finance_budgets').doc(bm.month),
        data:{
            month:bm.month, goal:bm.goal,
            ...(finCatMap['Матеріали (будівельні)']  ? {['cat_'+finCatMap['Матеріали (будівельні)']]:  120000} : {}),
            ...(finCatMap['Зарплата бригади']         ? {['cat_'+finCatMap['Зарплата бригади']]:         90000} : {}),
            ...(finCatMap['Реклама / Маркетинг']      ? {['cat_'+finCatMap['Реклама / Маркетинг']]:      10000} : {}),
            ...(finCatMap['Оренда складу']            ? {['cat_'+finCatMap['Оренда складу']]:            12000} : {}),
            updatedAt:now,
        },
    }));
    await window.safeBatchCommit(budgetOps);

    // ── 9. СКЛАД ─────────────────────────────────────────────
    const STOCK = [
        { name:'Штукатурка Knauf Rotband 30кг',  sku:'KNAUF-ROT-30', cat:'Штукатурки',     unit:'мішок', qty:45, min:20, price:420 },
        { name:'Шпаклівка Knauf Finish 25кг',    sku:'KNAUF-FIN-25', cat:'Штукатурки',     unit:'мішок', qty:28, min:15, price:380 },
        { name:'Ґрунтовка Ceresit CT17 10л',     sku:'CER-CT17-10',  cat:'Ґрунтовки',      unit:'відро', qty:22, min:10, price:310 },
        { name:'Плитковий клей Ceresit CM11 25кг',sku:'CER-CM11-25', cat:'Клеї',           unit:'мішок', qty:18, min:12, price:350 },
        { name:'Гіпсокартон 12.5мм (лист)',       sku:'GKL-125',     cat:'ГКЛ / ГВЛ',     unit:'лист',  qty:85, min:30, price:185 },
        { name:'Профіль CD 60/27 (шт)',            sku:'CD-6027',     cat:'Профілі',        unit:'шт',    qty:320,min:100,price:42  },
        { name:'Електрокабель ВВГнг 3×1.5 (м)',   sku:'VVG-315',     cat:'Електро',        unit:'м',     qty:180,min:100,price:28  },
        { name:'Труба поліпропілен 20мм (м)',      sku:'PPR-20',      cat:'Сантехніка',     unit:'м',     qty:95, min:50, price:35  },
        { name:'Затирка для плитки (кг)',           sku:'GROUT-1KG',  cat:'Клеї',           unit:'кг',    qty:12, min:10, price:95  },
        { name:'Малярна стрічка 50мм (рулон)',     sku:'TAPE-50',     cat:'Витратники',     unit:'рулон', qty:35, min:20, price:45  },
    ];
    const itemRefs = [];
    for (const s of STOCK) {
        const iRef = cr.collection('warehouse_items').doc();
        itemRefs.push(iRef);
        ops.push({type:'set', ref:iRef, data:{
            name:s.name, sku:s.sku, category:s.cat, unit:s.unit,
            minStock:s.min, costPrice:s.price,
            niche:'construction', createdAt:now,
        }});
        ops.push({type:'set', ref:cr.collection('warehouse_stock').doc(iRef.id), data:{
            itemId:iRef.id, itemName:s.name, qty:s.qty,
            reserved:0, available:s.qty, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops); ops = [];

    // Алерти: деякі позиції нижче мінімуму
    const stockSnap = await cr.collection('warehouse_stock').get();
    const whOps = [];
    stockSnap.docs.forEach(doc => {
        const name = doc.data().itemName || '';
        if (name.includes('Затирка'))  whOps.push({type:'update', ref:cr.collection('warehouse_stock').doc(doc.id), data:{qty:8,  available:8,  updatedAt:now}});
        if (name.includes('Плитковий')) whOps.push({type:'update', ref:cr.collection('warehouse_stock').doc(doc.id), data:{qty:10, available:10, updatedAt:now}});
        if (name.includes('Ґрунтовка')) whOps.push({type:'update', ref:cr.collection('warehouse_stock').doc(doc.id), data:{qty:7,  available:7,  updatedAt:now}});
    });
    if (whOps.length) await window.safeBatchCommit(whOps);

    // Операції IN/OUT
    const itemsSnap2 = await cr.collection('warehouse_items').get();
    const itemIds2 = itemsSnap2.docs.map(d => d.id);
    const whOpDefs = itemIds2.slice(0,6).map((id, i) => ([
        { itemId:id, type:'IN',  qty:[30,20,12,15,40,150][i], price:[420,380,310,350,185,42][i], note:`Закупівля — ${['Knauf Rotband','Knauf Finish','Ceresit CT17','Ceresit CM11','ГКЛ','Профіль CD'][i]}`, d:-4 },
        { itemId:id, type:'OUT', qty:[12,8,5,6,15,60][i],     price:[420,380,310,350,185,42][i], note:`Видача на об\'єкт — ${['Бойко','FinTech','Петренко','Сидоренко','FinTech','Бойко'][i]}`, d:-1 },
    ])).flat();
    const whOpRecs = whOpDefs.map(op => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
        itemId:op.itemId, type:op.type, qty:op.qty, price:op.price,
        totalPrice:op.qty * op.price, note:op.note,
        date:_demoDate(op.d), createdBy:uid, createdAt:_demoTs(op.d),
    }}));
    if (whOpRecs.length) await window.safeBatchCommit(whOpRecs);

    // Локації
    try {
        const oldLocs = await cr.collection('warehouse_locations').get();
        if (!oldLocs.empty) await window.safeBatchCommit(oldLocs.docs.map(d => ({type:'delete', ref:d.ref})));
    } catch(e) {}
    const locDefs = [
        { name:'Головний склад (вул. Складська 5)',  type:'warehouse', isDefault:true  },
        { name:'Бус-1 (мобільний)',                   type:'mobile',    isDefault:false },
        { name:'Об\'єкт Бойко (тимчасовий)',          type:'site',      isDefault:false },
    ];
    const locRefs = locDefs.map(() => cr.collection('warehouse_locations').doc());
    await window.safeBatchCommit(locDefs.map((l, i) => ({type:'set', ref:locRefs[i], data:{
        name:l.name, type:l.type, isDefault:l.isDefault, deleted:false, createdAt:now, updatedAt:now,
    }})));

    // Постачальники
    const supplierDefs = [
        { name:'Будмакс',         phone:'+380442223301', email:'sales@budmax.ua',      url:'budmax.ua',       note:'Будівельні матеріали оптом. Доставка 1-2 дні. Відстрочка 21 день.' },
        { name:'Церезит Україна', phone:'+380442223302', email:'ceresit@henkel.ua',    url:'ceresit.ua',      note:'Офіційний дистриб\'ютор Ceresit. Штукатурки, клеї, ґрунтовки.' },
        { name:'Кераміка Плюс',   phone:'+380672223303', email:'info@keramika-plus.ua',url:'keramika-plus.ua',note:'Плитка та керамограніт. Великий асортимент. Консультант Олена.' },
        { name:'Rehau Ukraine',   phone:'+380442223304', email:'rehau@rehau.ua',        url:'rehau.com/ua',    note:'Вікна та двері ПВХ. Термін виготовлення 14 днів. Гарантія 10 років.' },
        { name:'Elektro-master',  phone:'+380672223305', email:'em@elektromaster.ua',   url:'elektromaster.ua',note:'Електрокабелі, щитки, комплектуючі. Доставка на наступний день.' },
    ];
    await window.safeBatchCommit(supplierDefs.map(s => ({type:'set', ref:cr.collection('warehouse_suppliers').doc(), data:{
        name:s.name, phone:s.phone, email:s.email, url:s.url, note:s.note,
        deleted:false, createdAt:now, updatedAt:now,
    }})));

    // TRANSFER операції
    const transferOps = [
        { itemIdx:0, qty:10, note:'Штукатурка — зі складу на об\'єкт Бойко' },
        { itemIdx:4, qty:20, note:'ГКЛ — зі складу в Бус-1 для FinTech' },
        { itemIdx:6, qty:30, note:'Кабель ВВГнг — зі складу на об\'єкт Петренко' },
    ];
    const itemSnap3 = await cr.collection('warehouse_items').get();
    const itemData3 = itemSnap3.docs.map(d => ({id:d.id, name:d.data().name}));
    const locIds3   = locRefs.map(r => r.id);
    const transferRecs = transferOps.map(t => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
        itemId:     itemData3[t.itemIdx]?.id || itemData3[0].id,
        itemName:   itemData3[t.itemIdx]?.name || '',
        type:'TRANSFER', qty:t.qty,
        fromLocationId:locIds3[0], toLocationId:locIds3[t.itemIdx === 4 ? 1 : 2],
        note:t.note, date:_demoDate(-3), createdBy:uid, createdAt:_demoTs(-3),
    }}));
    await window.safeBatchCommit(transferRecs);

    // Інвентаризація
    const invMonth = _demoDate(-15).slice(0,7);
    const invItems = itemData3.slice(0,8).map((item, i) => {
        const expected = [45,28,22,18,85,320,180,95][i] || 10;
        const actual   = expected + [-3,0,1,-2,0,5,-4,0][i];
        return { itemId:item.id, itemName:item.name, expected, actual, diff:actual-expected };
    });
    await window.safeBatchCommit([{type:'set', ref:cr.collection('warehouse_inventories').doc(), data:{
        locationId:locIds3[0], month:invMonth, items:invItems,
        status:'confirmed', createdBy:uid, createdAt:_demoTs(-15), updatedAt:_demoTs(-15),
    }}]);

    // ── 10. КОШТОРИС — норми та приклад ─────────────────────
    const normDefs = [
        {
            name:'Штукатурення стін (1м²)',
            category:'repair', inputUnit:'м²', niche:'construction',
            materials:[
                {name:'Штукатурка Knauf Rotband 30кг', qty:0.016, unit:'мішок', price:420, coefficient:1},
                {name:'Ґрунтовка Ceresit CT17 10л',    qty:0.008, unit:'відро', price:310, coefficient:1},
                {name:'Робота штукатура',               qty:1,     unit:'м²',   price:180, coefficient:1},
            ],
        },
        {
            name:'Укладання плитки (1м²)',
            category:'repair', inputUnit:'м²', niche:'construction',
            materials:[
                {name:'Плитковий клей Ceresit CM11 25кг', qty:0.02, unit:'мішок', price:350, coefficient:1},
                {name:'Затирка для плитки',                qty:0.3,  unit:'кг',   price:95,  coefficient:1},
                {name:'Робота плиточника',                 qty:1,    unit:'м²',   price:350, coefficient:1},
            ],
        },
        {
            name:'Монтаж гіпсокартону (1м²)',
            category:'repair', inputUnit:'м²', niche:'construction',
            materials:[
                {name:'Гіпсокартон 12.5мм (лист)',  qty:0.4,  unit:'лист', price:185, coefficient:1},
                {name:'Профіль CD 60/27 (шт)',       qty:1.2,  unit:'шт',  price:42,  coefficient:1},
                {name:'Робота монтажника ГКЛ',       qty:1,    unit:'м²',  price:220, coefficient:1},
            ],
        },
        {
            name:'Стяжка підлоги (1м²)',
            category:'repair', inputUnit:'м²', niche:'construction',
            materials:[
                {name:'Пісок (т)',                   qty:0.05, unit:'т',   price:450, coefficient:1},
                {name:'Цемент М400 (мішок 25кг)',     qty:0.12, unit:'мішок',price:180,coefficient:1},
                {name:'Робота по стяжці',             qty:1,    unit:'м²',  price:250, coefficient:1},
            ],
        },
        {
            name:'Електромонтаж квартира (1 к.к.)',
            category:'electrical', inputUnit:'к.к.', niche:'construction',
            materials:[
                {name:'Електрокабель ВВГнг 3×1.5 (м)', qty:80, unit:'м',   price:28,  coefficient:1},
                {name:'Щиток 12 модулів',               qty:1,  unit:'шт',  price:850, coefficient:1},
                {name:'Автомат 16А',                     qty:6,  unit:'шт',  price:120, coefficient:1},
                {name:'Робота електрика',                qty:1,  unit:'к.к.',price:4500,coefficient:1},
            ],
        },
    ];
    const normOps = normDefs.map(n => {
        const cleanMaterials = n.materials.map(m => ({
            name:m.name, qty:Number(m.qty), unit:m.unit,
            price:Number(m.price), coefficient:Number(m.coefficient),
        }));
        return {type:'set', ref:cr.collection('estimate_norms').doc(), data:{
            name:n.name, category:n.category, inputUnit:n.inputUnit,
            hasExtraParam:false, extraParamLabel:'',
            niche:n.niche, materials:cleanMaterials,
            createdBy:uid, createdAt:now,
        }};
    });
    await window.safeBatchCommit(normOps);

    // Приклад кошторису — квартира Бойко 65м²
    const normSnap2 = await cr.collection('estimate_norms').get();
    const normDocs2 = normSnap2.docs.map(d => ({id:d.id, ...d.data()}));
    const plasterNorm = normDocs2.find(n => n.name && n.name.includes('Штукатур'));
    const tileNorm    = normDocs2.find(n => n.name && n.name.includes('плитки'));
    const gklNorm     = normDocs2.find(n => n.name && n.name.includes('гіпсокартон'));
    const screedNorm  = normDocs2.find(n => n.name && n.name.includes('Стяжка'));
    const electricNorm= normDocs2.find(n => n.name && n.name.includes('Електро'));

    const projSnapEst = await cr.collection('projects').get();
    const boykoProj   = projSnapEst.docs.find(d => (d.data().name||'').includes('Бойко'));

    if (boykoProj) {
        const estSections = [];
        let totalMat = 0;
        const addSection = (norm, area, label) => {
            if (!norm) return;
            const calced = (norm.materials||[]).map(m => ({
                name:m.name, unit:m.unit,
                required:Math.round(m.qty * area * 10)/10,
                inStock:0, deficit:Math.round(m.qty * area * 10)/10,
                pricePerUnit:m.price,
                total:Math.round(m.qty * area * m.price),
            }));
            const sectionTotal = calced.reduce((s, m) => s + m.total, 0);
            totalMat += sectionTotal;
            estSections.push({
                normId:norm.id, normName:norm.name,
                inputValue:area, inputUnit:norm.inputUnit,
                extraParam:null, calculatedMaterials:calced,
            });
        };
        addSection(plasterNorm, 165, 'Штукатурення стін');  // 65м² × ~2.5 стіни
        addSection(tileNorm,    18,  'Плитка ванна + туалет');
        addSection(gklNorm,     35,  'ГКЛ перегородки');
        addSection(screedNorm,  65,  'Стяжка підлоги 65м²');
        addSection(electricNorm,1,   'Електромонтаж 2к');

        await window.safeBatchCommit([{type:'set', ref:cr.collection('project_estimates').doc(), data:{
            title:'Ремонт квартири Бойко — 65м² ЖК Комфорт',
            projectId:boykoProj.id,
            dealId:'', functionId:'',
            status:'approved',
            sections:estSections,
            totals:{ totalMaterialsCost:totalMat, totalDeficitCost:totalMat, currency:'UAH' },
            deleted:false,
            createdBy:uid, approvedBy:uid,
            createdAt:now, updatedAt:now,
        }}]);

        // Оновлюємо estimateBudget проєкту
        await cr.collection('projects').doc(boykoProj.id).update({estimateBudget:totalMat, updatedAt:now});
    }

    // Кошторис для FinTech — офіс 180м²
    const fintechProj = projSnapEst.docs.find(d => (d.data().name||'').includes('FinTech'));
    if (fintechProj && plasterNorm && gklNorm && electricNorm) {
        const ftSections = [];
        let ftTotal = 0;
        const addFT = (norm, area) => {
            if (!norm) return;
            const calced = (norm.materials||[]).map(m => ({
                name:m.name, unit:m.unit,
                required:Math.round(m.qty * area * 10)/10,
                inStock:0, deficit:Math.round(m.qty * area * 10)/10,
                pricePerUnit:m.price,
                total:Math.round(m.qty * area * m.price),
            }));
            ftTotal += calced.reduce((s, m) => s + m.total, 0);
            ftSections.push({normId:norm.id, normName:norm.name, inputValue:area, inputUnit:norm.inputUnit, extraParam:null, calculatedMaterials:calced});
        };
        addFT(plasterNorm, 420); // 180м² офіс × ~2.3 стіни
        addFT(gklNorm,     180); // перегородки по всьому офісу
        addFT(electricNorm, 3); // 3 зони = 3 к.к. еквівалент
        await window.safeBatchCommit([{type:'set', ref:cr.collection('project_estimates').doc(), data:{
            title:'Кошторис — офіс FinTech 180м² (оздоблення)',
            projectId:fintechProj.id, dealId:'', functionId:'',
            status:'approved', sections:ftSections,
            totals:{totalMaterialsCost:ftTotal, totalDeficitCost:ftTotal, currency:'UAH'},
            deleted:false, createdBy:uid, approvedBy:uid, createdAt:now, updatedAt:now,
        }}]);
        await cr.collection('projects').doc(fintechProj.id).update({estimateBudget:ftTotal, updatedAt:now});
    }

    // Кошторис для Петренків — квартира 95м²
    const petrenkoProj = projSnapEst.docs.find(d => (d.data().name||'').includes('Петренків'));
    if (petrenkoProj && plasterNorm && tileNorm && gklNorm && screedNorm && electricNorm) {
        const ptSections = [];
        let ptTotal = 0;
        const addPT = (norm, area) => {
            if (!norm) return;
            const calced = (norm.materials||[]).map(m => ({
                name:m.name, unit:m.unit,
                required:Math.round(m.qty * area * 10)/10,
                inStock:0, deficit:Math.round(m.qty * area * 10)/10,
                pricePerUnit:m.price,
                total:Math.round(m.qty * area * m.price),
            }));
            ptTotal += calced.reduce((s, m) => s + m.total, 0);
            ptSections.push({normId:norm.id, normName:norm.name, inputValue:area, inputUnit:norm.inputUnit, extraParam:null, calculatedMaterials:calced});
        };
        addPT(plasterNorm, 240); // 95м² × ~2.5 стіни
        addPT(tileNorm,    32);  // 2 ванні + 2 туалети преміум
        addPT(gklNorm,     55);  // перегородки + короби
        addPT(screedNorm,  95);  // вся площа
        addPT(electricNorm, 3);  // 3-кімнатна
        await window.safeBatchCommit([{type:'set', ref:cr.collection('project_estimates').doc(), data:{
            title:'Кошторис — квартира Петренків 95м² преміум',
            projectId:petrenkoProj.id, dealId:'', functionId:'',
            status:'approved', sections:ptSections,
            totals:{totalMaterialsCost:ptTotal, totalDeficitCost:ptTotal, currency:'UAH'},
            deleted:false, createdBy:uid, approvedBy:uid, createdAt:now, updatedAt:now,
        }}]);
        await cr.collection('projects').doc(petrenkoProj.id).update({estimateBudget:ptTotal, updatedAt:now});
    }
    const bookingCalRef = cr.collection('booking_calendars').doc();
    const bookingSchedRef = cr.collection('booking_schedules').doc(bookingCalRef.id);
    await window.safeBatchCommit([
        {type:'set', ref:bookingCalRef, data:{
            name:'Виїзний замір та консультація',
            slug:'budmaster-zamiry',
            ownerName:STAFF[1].name, ownerId:sRefs[1].id,
            duration:60, bufferBefore:15, bufferAfter:30,
            timezone:'Europe/Kiev', confirmationType:'manual',
            color:'#f59e0b',
            location:'Виїзд по Києву та передмістю (до 30 км)',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1', text:'Що плануєте зробити? (ремонт квартири/офісу/ванної)', type:'text', required:true},
                {id:'q2', text:'Адреса об\'єкту', type:'text', required:true},
                {id:'q3', text:'Орієнтовний бюджет (грн)', type:'text', required:false},
                {id:'q4', text:'Площа приміщення (м²)', type:'text', required:false},
            ],
            maxBookingsPerSlot:1, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:bookingSchedRef, data:{
            weeklyHours:{
                mon:[{start:'09:00',end:'18:00'}],
                tue:[{start:'09:00',end:'18:00'}],
                wed:[{start:'09:00',end:'18:00'}],
                thu:[{start:'09:00',end:'18:00'}],
                fri:[{start:'09:00',end:'17:00'}],
                sat:[{start:'10:00',end:'15:00'}],
                sun:[],
            },
            dateOverrides:{}, updatedAt:now,
        }},
    ]);

    const apptDefs = [
        {name:'Коваль Тетяна',    phone:'+380671110006', email:'koval@gmail.com',      date:_demoDate(1),  time:'10:00', status:'confirmed', note:'Ремонт квартири, приблизно 80м². Хочуть кухню і ванну.'},
        {name:'Гриценко Іван',    phone:'+380671110007', email:'grytsenko@ukr.net',    date:_demoDate(2),  time:'14:00', status:'confirmed', note:'Ванна + коридор. Бюджет ~90К.'},
        {name:'Данченко Світлана',phone:'+380671110011', email:'danchenko@gmail.com',  date:_demoDate(3),  time:'11:00', status:'confirmed', note:'Преміум квартира 120м². Повний ремонт.'},
        {name:'Яценко Андрій',    phone:'+380671110008', email:'yatsenko@gmail.com',   date:_demoDate(4),  time:'16:00', status:'pending',   note:'Однокімнатна квартира. Бюджет не визначений.'},
        {name:'Борисенко Катерина',phone:'+380671110009',email:'borysenko@ukr.net',    date:_demoDate(-2), time:'10:00', status:'confirmed', note:'Офіс 80м². Рекомендація від Бойко.'},
        {name:'Литвиненко Олег',  phone:'+380671110030', email:'lytvyn@gmail.com',     date:_demoDate(-7), time:'15:00', status:'confirmed', note:'Кухня + вітальня. Бюджет ~150К.'},
    ];
    await window.safeBatchCommit(apptDefs.map(a => ({type:'set', ref:cr.collection('booking_appointments').doc(), data:{
        calendarId:bookingCalRef.id,
        calendarName:'Виїзний замір та консультація',
        guestName:a.name, guestPhone:a.phone, guestEmail:a.email,
        date:a.date, startTime:a.time,
        endTime:(parseInt(a.time.split(':')[0])+1).toString().padStart(2,'0')+':'+a.time.split(':')[1],
        status:a.status, note:a.note,
        answers:[{questionId:'q1',answer:a.note},{questionId:'q2',answer:'Київ'}],
        createdAt:_demoTs(-Math.floor(Math.random()*14)), updatedAt:now,
    }})));

    // ── 12. КООРДИНАЦІЇ (4) ──────────────────────────────────
    const COORDS = [
        {
            name:'Щоденний стенд-ап прорабів',
            type:'daily', chairmanId:sRefs[0].id,
            participantIds:[sRefs[0].id, sRefs[3].id, sRefs[4].id],
            schedule:{day:null, time:'08:00'}, status:'active',
            agendaItems:['execution','tasks'],
            dynamicAgenda:[
                {id:'da1', text:'Проблема з постачанням штукатурки на Хрещатик', authorId:sRefs[3].id, createdAt:new Date().toISOString()},
            ],
        },
        {
            name:'Тижнева нарада команди',
            type:'weekly', chairmanId:sRefs[0].id,
            participantIds:[sRefs[0].id, sRefs[1].id, sRefs[3].id, sRefs[4].id, sRefs[11].id],
            schedule:{day:1, time:'08:30'}, status:'active',
            agendaItems:['stats','execution','reports','questions','tasks'],
            dynamicAgenda:[
                {id:'da2', text:'Оцінити нову заявку на офіс 300м²', authorId:sRefs[1].id, createdAt:new Date().toISOString()},
                {id:'da3', text:'Підписати акт з Клименко до пятниці', authorId:sRefs[3].id, createdAt:new Date().toISOString()},
            ],
        },
        {
            name:'Оперативка постачання матеріалів',
            type:'weekly', chairmanId:sRefs[11].id,
            participantIds:[sRefs[0].id, sRefs[11].id, sRefs[3].id],
            schedule:{day:3, time:'10:00'}, status:'active',
            agendaItems:['reports','questions','tasks'],
            dynamicAgenda:[
                {id:'da4', text:'Rehau затримує вікна для Петренків — шукаємо альтернативу', authorId:sRefs[11].id, createdAt:new Date().toISOString()},
            ],
        },
        {
            name:'Звіт власнику — підсумки тижня',
            type:'council_own', chairmanId:sRefs[0].id,
            participantIds:[sRefs[0].id, sRefs[1].id, sRefs[10].id],
            schedule:{day:5, time:'17:00'}, status:'active',
            agendaItems:['stats','execution','reports','decisions'],
            dynamicAgenda:[],
        },
    ];
    const coordRefs = COORDS.map(() => cr.collection('coordinations').doc());
    await window.safeBatchCommit(COORDS.map((c, i) => ({type:'set', ref:coordRefs[i], data:{
        name:c.name, type:c.type, chairmanId:c.chairmanId,
        participantIds:c.participantIds, schedule:c.schedule,
        status:c.status, agendaItems:c.agendaItems, dynamicAgenda:c.dynamicAgenda,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})));

    // Протоколи координацій (3 шт)
    const coordSnap = await cr.collection('coordinations').get();
    const coordDocs = coordSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const standupCoord = coordDocs.find(c => c.name && c.name.includes('стенд-ап'));
    const weeklyCoord  = coordDocs.find(c => c.name && c.name.includes('Тижнева'));
    const ownerCoord   = coordDocs.find(c => c.name && c.name.includes('власнику'));

    const sessionOps = [];
    if (standupCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:standupCoord.id, coordName:standupCoord.name, coordType:'daily',
        startedAt:new Date(Date.now()-2*86400000).toISOString(),
        finishedAt:new Date(Date.now()-2*86400000+10*60000).toISOString(),
        decisions:[
            {text:'Олег бере об\'єкт Клименко — підпис акту сьогодні о 09:00', taskId:'', authorId:uid},
            {text:'Максим терміново замовляє штукатурку Knauf — потрібно до завтра', taskId:'', authorId:uid},
            {text:'Сергій завтра переходить на об\'єкт Сидоренків — плитка', taskId:'', authorId:uid},
        ],
        unresolved:[],
        agendaDone:['Стан об\'єктів', 'Пріоритети дня', 'Блокери'],
        dynamicAgendaItems:[], notes:'Всі об\'єкти в нормі. Клименко — фінальний день.',
        conductedBy:uid, participantIds:sRefs.slice(0,5).map(s=>s.id),
        taskSnapshot:[], createdAt:_demoTs(-2),
    }});

    if (weeklyCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:weeklyCoord.id, coordName:weeklyCoord.name, coordType:'weekly',
        startedAt:new Date(Date.now()-7*86400000).toISOString(),
        finishedAt:new Date(Date.now()-7*86400000+45*60000).toISOString(),
        decisions:[
            {text:'Перекинути бригаду Андрія з об\'єкту Бойко на FinTech — починаємо штукатурку', taskId:'', authorId:uid},
            {text:'Наталія готує КП для офісу IT-компанії до четверга', taskId:'', authorId:uid},
            {text:'Максим шукає альтернативного постачальника вікон — Rehau затримує', taskId:'', authorId:uid},
            {text:'Ігор підписує акт з Клименко до пятниці', taskId:'', authorId:uid},
        ],
        unresolved:[
            {text:'Постачальник Rehau затримує вікна для Петренків на 5 днів', authorId:uid, addedAt:new Date(Date.now()-7*86400000).toISOString()},
        ],
        agendaDone:['Підсумки тижня', 'Стан об\'єктів', 'Продажі', 'Постачання', 'Фінанси'],
        dynamicAgendaItems:[{text:'Конфлікт з субпідрядником — електрик не вийшов на об\'єкт', authorId:uid, addedAt:new Date(Date.now()-8*86400000).toISOString()}],
        notes:'Тиждень виконано на 91%. Ризик — Rehau. Квітень планується рекордний.',
        conductedBy:uid, participantIds:sRefs.slice(0,5).map(s=>s.id),
        taskSnapshot:[], createdAt:_demoTs(-7),
    }});

    if (ownerCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:ownerCoord.id, coordName:ownerCoord.name, coordType:'council_own',
        startedAt:new Date(Date.now()-8*86400000).toISOString(),
        finishedAt:new Date(Date.now()-8*86400000+60*60000).toISOString(),
        decisions:[
            {text:'Підвищити ціни на 8% з 1 квітня — ринок зріс', taskId:'', authorId:uid},
            {text:'Запустити рекламу Google Ads на 15К/міс — збільшити бюджет', taskId:'', authorId:uid},
            {text:'Найняти другого прораба до 15 квітня — потужності не вистачає', taskId:'', authorId:uid},
            {text:'Скласти договір з субпідрядником по електриці', taskId:'', authorId:uid},
        ],
        unresolved:[],
        agendaDone:['Фінансові підсумки', 'Стратегія квітня', 'HR', 'Ціноутворення'],
        dynamicAgendaItems:[],
        notes:'Березень — рекордний місяць. 4 активних об\'єкти одночасно. Потрібне масштабування.',
        conductedBy:uid, participantIds:[uid, sRefs[1].id, sRefs[10].id],
        taskSnapshot:[], createdAt:_demoTs(-8),
    }});

    if (sessionOps.length) await window.safeBatchCommit(sessionOps);

    // ── 13. МЕТРИКИ ──────────────────────────────────────────
    const METRICS = [
        // Щотижневі (12 метрик)
        {name:'Виручка тижня',          unit:'грн', cat:'Фінанси',     trend:12.0, freq:'weekly',  value:95000, int:false,
         desc:'Загальна сума оплат від клієнтів за тиждень. Включає аванси і фінальні оплати.'},
        {name:'Нові ліди',               unit:'шт',  cat:'Маркетинг',   trend:10.0, freq:'weekly',  value:5,     int:true,
         desc:'Нові звернення від потенційних клієнтів за тиждень (дзвінки, заявки, повідомлення).'},
        {name:'Нові договори',           unit:'шт',  cat:'Продажі',     trend:8.0,  freq:'weekly',  value:2,     int:true,
         desc:'Кількість підписаних договорів на ремонт за тиждень.'},
        {name:'Конверсія лід→договір',   unit:'%',   cat:'Продажі',     trend:5.0,  freq:'weekly',  value:38,    int:false,
         desc:'Відсоток лідів що перетворились у підписаний договір. Норма для ремонту: 30-40%.'},
        {name:'Об\'єктів в роботі',      unit:'шт',  cat:'Виробництво', trend:3.0,  freq:'weekly',  value:4,     int:true,
         desc:'Кількість активних об\'єктів на яких зараз ведуться роботи.'},
        {name:'Об\'єктів зданих вчасно', unit:'%',   cat:'Виробництво', trend:5.0,  freq:'weekly',  value:87,    int:false,
         desc:'Відсоток об\'єктів зданих у погоджений з клієнтом строк. Ціль: 90%+.'},
        {name:'Відсоток рекламацій',     unit:'%',   cat:'Якість',      trend:-8.0, freq:'weekly',  value:4.2,   int:false,
         desc:'Відсоток об\'єктів де клієнт звернувся з претензіями після здачі. Норма: до 5%.'},
        {name:'Перевитрата матеріалів',  unit:'%',   cat:'Виробництво', trend:-5.0, freq:'weekly',  value:3.8,   int:false,
         desc:'Перевищення кошторису по матеріалах у відсотках. Кожен 1% = зниження маржі.'},
        {name:'Виконання задач вчасно',  unit:'%',   cat:'Управління',  trend:6.0,  freq:'weekly',  value:84,    int:false,
         desc:'Відсоток задач виконаних в дедлайн. Показник дисципліни команди.'},
        {name:'Прострочені задачі',      unit:'шт',  cat:'Управління',  trend:-15.0,freq:'weekly',  value:3,     int:true,
         desc:'Кількість задач з простроченим дедлайном. Потребує негайної уваги.'},
        {name:'Бригад на об\'єктах',     unit:'шт',  cat:'Виробництво', trend:3.0,  freq:'weekly',  value:3,     int:true,
         desc:'Кількість бригад що зараз активно працюють на об\'єктах.'},
        {name:'Записів на замір',        unit:'шт',  cat:'Продажі',     trend:8.0,  freq:'weekly',  value:4,     int:true,
         desc:'Кількість записів на виїзний замір цього тижня. Показник активності воронки.'},

        // Щомісячні фінансові (першими)
        {name:'Виручка місяць',          unit:'грн', cat:'Фінанси',     trend:14.0, freq:'monthly', value:485000,int:false,
         desc:'Загальна виручка за місяць. Включає всі надходження від клієнтів.'},
        {name:'Чистий прибуток',         unit:'грн', cat:'Фінанси',     trend:10.0, freq:'monthly', value:118000,int:false,
         desc:'Виручка мінус всі витрати за місяць. Реальний заробіток бізнесу.'},
        {name:'Маржинальність',          unit:'%',   cat:'Фінанси',     trend:3.0,  freq:'monthly', value:24.3,  int:false,
         desc:'Чистий прибуток / Виручка × 100%. Норма для ремонтного бізнесу: 20-30%.'},
        {name:'Середній чек об\'єкту',   unit:'грн', cat:'Фінанси',     trend:8.0,  freq:'monthly', value:185000,int:false,
         desc:'Середня вартість одного договору на ремонт. Показник якості клієнтів.'},
        {name:'Витрати на матеріали',    unit:'грн', cat:'Фінанси',     trend:5.0,  freq:'monthly', value:165000,int:false,
         desc:'Загальні витрати на будівельні матеріали за місяць. Норма: 30-35% від виручки.'},
        {name:'Витрати на зарплату',     unit:'грн', cat:'Фінанси',     trend:2.0,  freq:'monthly', value:130000,int:false,
         desc:'ФОП — загальний фонд оплати праці. Норма: 25-35% від виручки.'},
        {name:'Дебіторська заборгованість',unit:'грн',cat:'Фінанси',   trend:-5.0, freq:'monthly', value:290000,int:false,
         desc:'Сума грошей що ще не отримана від клієнтів (доплати після здачі). Понад 2 місяці виручки = проблема.'},

        // Щомісячні операційні
        {name:'Об\'єктів завершено',     unit:'шт',  cat:'Виробництво', trend:5.0,  freq:'monthly', value:3,     int:true,
         desc:'Кількість об\'єктів зданих клієнтам за місяць. Показник реальної продуктивності.'},
        {name:'Середня тривалість об\'єкту',unit:'дні',cat:'Виробництво',trend:-8.0,freq:'monthly', value:52,    int:false,
         desc:'Середня кількість днів від підписання договору до здачі. Норма: 30-60 днів залежно від обсягу.'},
        {name:'Об\'єктів затримано',     unit:'шт',  cat:'Виробництво', trend:-12.0,freq:'monthly', value:1,     int:true,
         desc:'Кількість об\'єктів що порушили погоджений строк здачі. Кожна затримка = ризик конфлікту.'},
        {name:'NPS клієнтів',            unit:'бали',cat:'Якість',      trend:4.0,  freq:'monthly', value:72,    int:false,
         desc:'Net Promoter Score — готовність клієнтів рекомендувати нас. Норма: 50+. Відмінно: 70+.'},
        {name:'Повторних клієнтів',      unit:'%',   cat:'Продажі',     trend:6.0,  freq:'monthly', value:18,    int:false,
         desc:'Відсоток клієнтів що звернулись повторно або дали рекомендацію. Основа органічного зростання.'},
        {name:'Угод у воронці',          unit:'шт',  cat:'Продажі',     trend:5.0,  freq:'monthly', value:11,    int:true,
         desc:'Кількість активних угод в CRM. Показник "запасу" на наступні місяці.'},
        {name:'Вартість залучення клієнта',unit:'грн',cat:'Маркетинг',  trend:-8.0, freq:'monthly', value:2850,  int:false,
         desc:'Бюджет на маркетинг / кількість нових клієнтів. Норма для ремонту: до 3 000 грн.'},

        // 18 виробничих чекпоїнтів
        {name:'01 Перевірка замовлення',   unit:'%', cat:'Чекпоїнти', trend:4.0,  freq:'monthly', value:88, int:false,
         desc:'% договорів де перевірили реалістичність термінів і бюджету ДО підписання.'},
        {name:'02 Подвійний замір',        unit:'%', cat:'Чекпоїнти', trend:8.0,  freq:'monthly', value:72, int:false,
         desc:'% об\'єктів де замір перевірив 2-й фахівець. Виявляє помилки що призводять до переробок.'},
        {name:'03 Деталізація робіт',      unit:'%', cat:'Чекпоїнти', trend:5.0,  freq:'monthly', value:85, int:false,
         desc:'% договорів з детальним переліком робіт до старту. Без деталізації — суперечки на фіналі.'},
        {name:'04 Черговість робіт',       unit:'%', cat:'Чекпоїнти', trend:3.0,  freq:'monthly', value:79, int:false,
         desc:'% об\'єктів де визначена черговість виконання. Без черговості — бригади заважають одна одній.'},
        {name:'05 Комплектність старт.',   unit:'%', cat:'Чекпоїнти', trend:2.0,  freq:'monthly', value:93, int:false,
         desc:'% об\'єктів де перевірили наявність матеріалів перед стартом. Зупинки = збиток і затримки.'},
        {name:'06 Фото до початку',        unit:'%', cat:'Чекпоїнти', trend:6.0,  freq:'monthly', value:91, int:false,
         desc:'% об\'єктів де зроблені фото "до" перед стартом. Захист від претензій клієнта.'},
        {name:'07 Фіксація змін',          unit:'%', cat:'Чекпоїнти', trend:14.0, freq:'monthly', value:68, int:false,
         desc:'% випадків де зміни фіксуються письмово. Усні домовленості = конфлікти і безкоштовна робота.'},
        {name:'08 Перевірка комунікацій',  unit:'%', cat:'Чекпоїнти', trend:5.0,  freq:'monthly', value:88, int:false,
         desc:'% об\'єктів де перевірили електро/сантехніку до закриття стін. Виявлення дефектів до фінішу.'},
        {name:'09 Завантаження бригад',    unit:'%', cat:'Чекпоїнти', trend:7.0,  freq:'monthly', value:82, int:false,
         desc:'% місяців де бригади завантажені по плану. Недозавантаженість = втрата грошей.'},
        {name:'10 Координація щодня',      unit:'%', cat:'Чекпоїнти', trend:12.0, freq:'monthly', value:71, int:false,
         desc:'% днів де прораб звітував про стан об\'єкту. Без щоденного контролю — ризик затримок.'},
        {name:'11 Контроль якості',        unit:'%', cat:'Чекпоїнти', trend:4.0,  freq:'monthly', value:85, int:false,
         desc:'% об\'єктів з проміжним контролем якості. Виявляє брак до фінального огляду клієнта.'},
        {name:'12 Розбір браку',           unit:'%', cat:'Чекпоїнти', trend:20.0, freq:'monthly', value:58, int:false,
         desc:'% випадків браку де провели розбір причини. Без аналізу — брак повторюється.'},
        {name:'13 Контроль задач',         unit:'%', cat:'Чекпоїнти', trend:6.0,  freq:'monthly', value:81, int:false,
         desc:'% тижнів де всі відкриті задачі переглянуті й оновлені. Системність управління.'},
        {name:'14 Щоденний стенд-ап',      unit:'%', cat:'Чекпоїнти', trend:3.0,  freq:'monthly', value:89, int:false,
         desc:'% днів де проводився ранковий стенд-ап прорабів. Запобігає хаосу на об\'єктах.'},
        {name:'15 Онбординг новачків',     unit:'%', cat:'Чекпоїнти', trend:18.0, freq:'monthly', value:60, int:false,
         desc:'% нових робітників що пройшли повний онбординг. Низький показник = помилки і травми.'},
        {name:'16 Фінансова звітність',    unit:'%', cat:'Чекпоїнти', trend:8.0,  freq:'monthly', value:80, int:false,
         desc:'% місяців де фінансовий звіт готовий до 5-го числа. Фінансова дисципліна бізнесу.'},
        {name:'17 Планування вперед',      unit:'%', cat:'Чекпоїнти', trend:10.0, freq:'monthly', value:74, int:false,
         desc:'% тижнів де план об\'єктів складений на 2 тижні вперед. Без планування — авральний режим.'},
        {name:'18 Закупівлі вчасно',       unit:'%', cat:'Чекпоїнти', trend:4.0,  freq:'monthly', value:86, int:false,
         desc:'% місяців де матеріали закуплені без термінових замовлень. Термінові закупівлі = переплата 15-25%.'},
    ];

    const mOps = [];
    for (const m of METRICS) {
        const mRef = cr.collection('metrics').doc();
        const freq = m.freq || 'weekly';
        mOps.push({type:'set', ref:mRef, data:{
            name:m.name, unit:m.unit, category:m.cat,
            frequency:freq, scope:'company', scopeType:'company',
            description:m.desc, formula:'', inputType:'manual',
            importance:'critical', createdBy:uid, createdAt:now, updatedAt:now,
        }});
        const periods = freq === 'daily' ? 14 : freq === 'weekly' ? 12 : 8;
        for (let p = 0; p < periods; p++) {
            const trendFactor = 1 - (m.trend || 0) / 100 * p / periods;
            const noiseScale = m.value > 10000 ? 0.06 : (m.int ? 0.15 : 0.10);
            const noise = (Math.random() - 0.5) * noiseScale;
            const rawVal = m.value * trendFactor * (1 + noise);
            let val;
            if (m.int) val = Math.max(0, Math.round(rawVal));
            else if (m.unit === '%' || m.unit === 'бали') val = Math.min(100, Math.max(0, Math.round(rawVal * 10) / 10));
            else val = Math.max(0, Math.round(rawVal * 10) / 10);

            const entryRef = cr.collection('metricEntries').doc();
            const d = new Date();
            let pk;
            if (freq === 'monthly') {
                d.setMonth(d.getMonth() - p);
                pk = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
            } else if (freq === 'daily') {
                d.setDate(d.getDate() - p);
                pk = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
            } else {
                d.setDate(d.getDate() - p * 7);
                d.setHours(12,0,0,0);
                const dow = d.getDay() || 7;
                d.setDate(d.getDate() - dow + 4);
                const j1 = new Date(d.getFullYear(), 0, 1);
                const wn = Math.ceil(((d - j1) / 864e5 + j1.getDay() + 1) / 7);
                pk = d.getFullYear() + '-W' + String(wn).padStart(2,'0');
            }
            mOps.push({type:'set', ref:entryRef, data:{
                metricId:mRef.id, metricName:m.name, unit:m.unit,
                value:val, periodKey:pk || '', frequency:freq,
                scope:'company', scopeType:'company',
                note:'', enteredBy:uid, createdBy:uid, createdAt:now,
            }});
        }
    }
    await window.safeBatchCommit(mOps);

    // KPI цілі
    const mSnap = await cr.collection('metrics').get();
    const mMap = {};
    mSnap.docs.forEach(d => { mMap[d.data().name] = d.id; });
    const targetDefs = [
        {name:'Виручка тижня',              target:100000, period:'weekly'},
        {name:'Конверсія лід→договір',      target:42,     period:'weekly'},
        {name:'Об\'єктів зданих вчасно',    target:90,     period:'weekly'},
        {name:'Відсоток рекламацій',         target:3,      period:'weekly'},
        {name:'Виконання задач вчасно',     target:90,     period:'weekly'},
        {name:'Виручка місяць',             target:520000, period:'monthly'},
        {name:'Чистий прибуток',            target:130000, period:'monthly'},
        {name:'Маржинальність',             target:28,     period:'monthly'},
        {name:'NPS клієнтів',               target:75,     period:'monthly'},
    ];
    const curWeek = (() => {
        const d = new Date(); d.setHours(12,0,0,0);
        const dow = d.getDay()||7; d.setDate(d.getDate()-dow+4);
        const j1 = new Date(d.getFullYear(),0,1);
        const wn = Math.ceil(((d-j1)/864e5+j1.getDay()+1)/7);
        return d.getFullYear()+'-W'+String(wn).padStart(2,'0');
    })();
    const curMonth = new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0');
    const tgtOps = [];
    for (const t of targetDefs) {
        const mid = mMap[t.name];
        if (!mid) continue;
        const pk = t.period === 'monthly' ? curMonth : curWeek;
        const periods = t.period === 'monthly' ? 3 : 4;
        for (let p = 0; p < periods; p++) {
            let periodKey = pk;
            if (p > 0) {
                const d2 = new Date();
                if (t.period === 'monthly') { d2.setMonth(d2.getMonth()-p); periodKey = d2.getFullYear()+'-'+String(d2.getMonth()+1).padStart(2,'0'); }
                else { d2.setDate(d2.getDate()-p*7); d2.setHours(12,0,0,0); const dow=d2.getDay()||7; d2.setDate(d2.getDate()-dow+4); const j1=new Date(d2.getFullYear(),0,1); const wn=Math.ceil(((d2-j1)/864e5+j1.getDay()+1)/7); periodKey=d2.getFullYear()+'-W'+String(wn).padStart(2,'0'); }
            }
            tgtOps.push({type:'set', ref:cr.collection('metricTargets').doc(), data:{
                metricId:mid, periodKey, periodType:t.period,
                scope:'company', scopeId:cr.id,
                targetValue:t.target, setBy:uid, createdAt:now,
            }});
        }
    }
    if (tgtOps.length) await window.safeBatchCommit(tgtOps);

    // ── 14. СТАНДАРТИ (4) ────────────────────────────────────
    const STD_DEFS = [
        {
            name:'Стандарт здачі об\'єкту клієнту',
            functionId:fRefs[6].id,
            checklist:[
                'Провести фінальний огляд всіх приміщень з чеклістом',
                'Перевірити роботу всіх вимикачів і розеток',
                'Перевірити роботу сантехніки — немає протікань',
                'Перевірити рівність стін і підлоги (відхилення до 2мм/2м)',
                'Зробити фото кожного приміщення (мін. 3 фото)',
                'Прибрати сміття та будівельний пил',
                'Оформити акт здачі-приймання в 2 примірниках',
                'Передати клієнту гарантійний лист (12 місяців)',
            ],
            acceptanceCriteria:[
                'Всі пункти чекліста відмічені ✓',
                'Акт підписаний обома сторонами',
                'Клієнт не має претензій або вони зафіксовані в акті',
            ],
            instructionsHtml:'<p>Здача проводиться прорабом разом з клієнтом. Без підпису акту — оплата не вимагається.</p>',
        },
        {
            name:'Стандарт роботи з рекламацією',
            functionId:fRefs[1].id,
            checklist:[
                'Зареєструвати рекламацію в системі протягом 2 годин',
                'Зателефонувати клієнту та вибачитись за незручності',
                'Призначити виїзну діагностику протягом 24 годин',
                'Сфотографувати проблему до початку робіт',
                'Усунути недолік за рахунок компанії (якщо гарантійний випадок)',
                'Після усунення — взяти підпис клієнта про закриття рекламації',
            ],
            acceptanceCriteria:[
                'Час реакції: до 24 годин',
                'Час усунення: до 5 робочих днів',
                'Клієнт підписав акт закриття рекламації',
            ],
            instructionsHtml:'<p>Рекламації — найкраща можливість перетворити незадоволеного клієнта на адвоката бренду.</p>',
        },
        {
            name:'Стандарт прийому нового об\'єкту в роботу',
            functionId:fRefs[3].id,
            checklist:[
                'Отримати підписаний договір з кошторисом від менеджера',
                'Виїхати на об\'єкт і познайомитись з клієнтом особисто',
                'Зробити фото "до" всіх приміщень',
                'Перевірити наявність матеріалів за кошторисом',
                'Перевірити доступ до об\'єкту (ключі, ліфт, паркінг)',
                'Погодити з клієнтом час роботи бригади',
                'Занести об\'єкт в систему і призначити відповідальних',
            ],
            acceptanceCriteria:[
                'Всі фото "до" збережені в системі',
                'Матеріали на об\'єкті або підтверджена дата поставки',
                'Клієнт знає ім\'я і телефон прораба',
            ],
            instructionsHtml:'<p>Перший день на об\'єкті формує враження клієнта на весь ремонт. Бути пунктуальним і акуратним.</p>',
        },
        {
            name:'Стандарт контролю якості на об\'єкті',
            functionId:fRefs[6].id,
            checklist:[
                'Перевірити кожен крок перед переходом до наступного',
                'Сфотографувати результат після кожного ключового етапу',
                'Перевірити відхилення поверхонь (рівень, відвіс)',
                'Перевірити комунікації до закриття стін',
                'Підписати проміжний акт прийому-передачі по етапах',
            ],
            acceptanceCriteria:[
                'Кожен етап має фотозвіт',
                'Відхилення в межах норми (±2мм/2м)',
                'Проміжні акти підписані',
            ],
            instructionsHtml:'<p>Контроль якості — щотижнева задача прораба. Краще виявити проблему на етапі ніж на здачі.</p>',
        },
    ];
    const stdOps = STD_DEFS.map(s => ({type:'set', ref:cr.collection('workStandards').doc(), data:{
        name:s.name, functionId:s.functionId,
        checklist:s.checklist, acceptanceCriteria:s.acceptanceCriteria,
        instructionsHtml:s.instructionsHtml,
        createdBy:uid, createdAt:now, updatedAt:now,
    }}));
    await window.safeBatchCommit(stdOps);

    // ── 15. ЗАВДАННЯ ПРИВ'ЯЗАНІ ДО ПРОЄКТІВ ─────────────────
    const projSnap2 = await cr.collection('projects').get();
    const pByName = {};
    projSnap2.docs.forEach(d => {
        const n = d.data().name || '';
        if (n.includes('Бойко'))    pByName['boyko']   = {id:d.id, name:n};
        if (n.includes('FinTech'))  pByName['fintech']  = {id:d.id, name:n};
        if (n.includes('Петренків'))pByName['petrenko'] = {id:d.id, name:n};
    });

    const projTaskOps = [];

    if (pByName.boyko) {
        const pid = pByName.boyko.id, pname = pByName.boyko.name;
        [
            {t:'Встановити електрощиток та розводку',              fi:3, ai:6,  d:2,  pr:'high',   est:240, r:'Щиток встановлений, кабелі розведені, акт підписаний'},
            {t:'Укласти плитку у ванній кімнаті',                  fi:3, ai:8,  d:3,  pr:'high',   est:480, r:'Плитка укладена рівно, затирка виконана'},
            {t:'Поклеїти шпалери у спальні',                       fi:3, ai:5,  d:5,  pr:'medium', est:300, r:'Шпалери поклеєні без стиків і бульбашок'},
            {t:'Встановити двері та наличники',                    fi:3, ai:4,  d:7,  pr:'medium', est:180, r:'Двері встановлені, відкриваються рівно'},
            {t:'Фінальне прибирання квартири Бойко',               fi:6, ai:3,  d:20, pr:'high',   est:120, r:'Квартира чиста, готова до здачі'},
            {t:'Підписати акт здачі — Бойко',                      fi:1, ai:1,  d:22, pr:'high',   est:60,  r:'Акт підписаний, фінальна оплата отримана'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }

    if (pByName.fintech) {
        const pid = pByName.fintech.id, pname = pByName.fintech.name;
        [
            {t:'Монтаж металокаркасу перегородок',                 fi:3, ai:5,  d:1,  pr:'high',   est:480, r:'Каркас змонтований за проєктом'},
            {t:'Прокладка електрокабелю — офіс 180м²',             fi:3, ai:6,  d:3,  pr:'high',   est:600, r:'Кабель прокладений, схема в системі'},
            {t:'Монтаж вентиляції та кондиціонерів',               fi:3, ai:4,  d:7,  pr:'high',   est:360, r:'Вентиляція змонтована, кондиціонери працюють'},
            {t:'Штукатурення стін та стелі',                       fi:3, ai:5,  d:12, pr:'high',   est:720, r:'Стіни оштукатурені, відхилення до 2мм'},
            {t:'Фінальне прибирання та здача офісу',               fi:6, ai:3,  d:38, pr:'high',   est:180, r:'Офіс готовий до здачі, документи підготовлені'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }

    if (pByName.petrenko) {
        const pid = pByName.petrenko.id, pname = pByName.petrenko.name;
        [
            {t:'Чорнова стяжка підлоги — 95м²',                    fi:3, ai:4,  d:5,  pr:'high',   est:480, r:'Стяжка залита, рівність перевірена'},
            {t:'Монтаж гіпсокартонних перегородок',                fi:3, ai:5,  d:10, pr:'medium', est:480, r:'Перегородки змонтовані за проєктом'},
            {t:'Замовлення преміум-плитки для ванних кімнат',      fi:4, ai:11, d:2,  pr:'high',   est:60,  r:'Плитка замовлена, дата поставки підтверджена'},
            {t:'Підготовка дизайн-специфікації преміум матеріалів', fi:2, ai:9,  d:1,  pr:'high',   est:120, r:'Специфікація погоджена з клієнтом письмово'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }

    if (projTaskOps.length) await window.safeBatchCommit(projTaskOps);

    // Бюджети проєктів (транзакції прив'язані до проєктів)
    const projFin = await cr.collection('projects').get();
    const projFinMap = {};
    projFin.docs.forEach(d => {
        const n = d.data().name || '';
        if (n.includes('Бойко'))    projFinMap['boyko']   = d.id;
        if (n.includes('FinTech'))  projFinMap['fintech']  = d.id;
        if (n.includes('Петренків'))projFinMap['petrenko'] = d.id;
    });
    const projTxOps = [];
    const projTxDefs = [
        // Бойко — аванс і матеріали
        {type:'income',  amt:122500, note:'Аванс 50% — квартира Бойко',          proj:'boyko',   cat:'Аванс за ремонт',        fi:1, d:-8},
        {type:'expense', amt:38500,  note:'Матеріали — штукатурка, клей Бойко',  proj:'boyko',   cat:'Матеріали (будівельні)',  fi:4, d:-6},
        {type:'expense', amt:22000,  note:'Плитка ванна — Бойко',                proj:'boyko',   cat:'Матеріали (будівельні)',  fi:4, d:-4},
        // FinTech — аванс і матеріали
        {type:'income',  amt:232000, note:'Аванс 40% — офіс FinTech',            proj:'fintech', cat:'Аванс за ремонт',        fi:1, d:-12},
        {type:'expense', amt:85000,  note:'Матеріали ГКЛ та профілі — FinTech',  proj:'fintech', cat:'Матеріали (будівельні)',  fi:4, d:-10},
        // Петренко — аванс
        {type:'income',  amt:130000, note:'Аванс 25% — Петренків преміум',       proj:'petrenko',cat:'Аванс за ремонт',        fi:1, d:-5},
    ];
    for (const tx of projTxDefs) {
        const catRef = catRefs[FIN_CATS.findIndex(c => c.name === tx.cat)];
        if (!catRef) continue;
        projTxOps.push({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
            categoryId:catRef.id, categoryName:tx.cat,
            accountId:accRefs[0].id, accountName:ACCOUNTS[0].name,
            type:tx.type, amount:tx.amt, currency:'UAH',
            note:tx.note,
            date:_demoTsFinance(tx.d),
            projectId: projFinMap[tx.proj] || '',
            functionId:fRefs[tx.fi].id,
            createdBy:uid, createdAt:now,
        }});
    }
    if (projTxOps.length) await window.safeBatchCommit(projTxOps);

    // ── 16. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:           'БудМайстер',
        niche:          'construction',
        nicheLabel:     'Ремонтно-будівельна компанія',
        description:    'Комплексний ремонт квартир, офісів та комерційних приміщень під ключ.',
        city:           'Київ',
        employees:      12,
        currency:       'UAH',
        companyGoal:    'Стати №1 ремонтною компанією в Києві по NPS і стабільності термінів',
        companyConcept: 'Ремонт без стресу — клієнт знає що відбувається кожного дня. Прораб звітує щодня, терміни фіксуються в договорі з гарантією. Відрізняємось від конкурентів системним підходом і відповідальністю за строки.',
        companyCKP:     'Здача об\'єкту в строк з першого разу без доробок, з підписаним актом і задоволеним клієнтом',
        companyIdeal:   '8 об\'єктів одночасно, кожен з відповідальним прорабом. Власник бачить метрики кожного об\'єкту з телефону і не витрачає час на "де ти і що робиш". Команда працює по стандартах, клієнти рекомендують нас друзям.',
        targetAudience: 'Власники квартир і офісів у Києві що роблять ремонт. Вік 28-55, дохід вище середнього. Цінують якість, прозорість процесу і дотримання термінів. Не хочуть щодня контролювати бригаду.',
        avgCheck:       185000,
        monthlyRevenue: 485000,
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) {
    window._NICHE_LABELS['furniture_factory'] = 'Меблевий бізнес (повне демо)';
    window._NICHE_LABELS['construction_eu']   = 'БудМайстер — ремонт та будівництво';
}

// ════════════════════════════════════════════════════════════
// МЕДИЧНА КЛІНІКА — medical
// "МедікаПро" — багатопрофільна клініка, Київ
// 12 осіб, 8 функцій, повний цикл від запису до контролю
// ════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['medical'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];

    // ── 1. ФУНКЦІЇ (8 блоків) ────────────────────────────────
    const FUNCS = [
        { name:'0. Маркетинг та залучення пацієнтів',  color:'#ec4899', desc:'Реклама, SMM, корпоративні партнерства, воронка залучення нових пацієнтів' },
        { name:'1. Запис та адміністрування',           color:'#22c55e', desc:'Прийом дзвінків, запис пацієнтів, розклад, підтвердження візитів' },
        { name:'2. Первинний прийом та діагностика',    color:'#3b82f6', desc:'Огляд, анамнез, призначення діагностики, постановка діагнозу' },
        { name:'3. Лікування та процедури',             color:'#f59e0b', desc:'Хірургія, терапія, косметологія, фізіотерапія, виконання призначень' },
        { name:'4. Лабораторія та аналізи',             color:'#8b5cf6', desc:'Забір матеріалу, аналізи, УЗД, рентген, результати в систему' },
        { name:'5. Фінанси та страхування',             color:'#ef4444', desc:'Оплати, договори зі страховими, бюджет, звітність, виплати' },
        { name:'6. Якість та безпека пацієнтів',        color:'#0ea5e9', desc:'Протоколи, стерилізація, скарги, контроль якості, акредитація' },
        { name:'7. Управління та розвиток',             color:'#374151', desc:'Стратегія, KPI, персонал, навчання, ліцензії, розвиток клініки' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f, i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Олександр Грищенко',
        status:'active', createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // ── 2. КОМАНДА (12 осіб) ─────────────────────────────────
    try {
        const oldUsers = await cr.collection('users').get();
        if (!oldUsers.empty) {
            const delOps = oldUsers.docs.filter(d => d.id !== uid).map(d => ({type:'delete', ref:d.ref}));
            if (delOps.length) await window.safeBatchCommit(delOps);
        }
    } catch(e) { console.warn('[demo] cleanup users:', e.message); }

    const STAFF = [
        { name:'Олександр Грищенко', role:'owner',    fi:null, pos:'Власник / Головлікар' },
        { name:'Ірина Петрова',      role:'manager',  fi:1,    pos:'Адміністратор' },
        { name:'Василь Коваль',      role:'employee', fi:2,    pos:'Терапевт' },
        { name:'Марина Лисенко',     role:'employee', fi:2,    pos:'Кардіолог' },
        { name:'Андрій Мороз',       role:'employee', fi:3,    pos:'Хірург' },
        { name:'Оксана Бондар',      role:'employee', fi:3,    pos:'Гінеколог' },
        { name:'Дмитро Савченко',    role:'employee', fi:4,    pos:'УЗД-спеціаліст' },
        { name:'Наталія Ткач',       role:'employee', fi:3,    pos:'Косметолог' },
        { name:'Ігор Романенко',     role:'employee', fi:2,    pos:'Ортопед' },
        { name:'Тетяна Гончар',      role:'employee', fi:6,    pos:'Медсестра старша' },
        { name:'Олена Яценко',       role:'employee', fi:5,    pos:'Бухгалтер' },
        { name:'Максим Поліщук',     role:'employee', fi:7,    pos:'IT / Адміністратор системи' },
    ];
    const sRefs = STAFF.map(() => cr.collection('users').doc());
    STAFF.forEach((s, i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        ops.push({type:'set', ref:sRefs[i], data:{
            name:s.name, role:s.role, position:s.pos,
            email:s.name.toLowerCase().replace(/['\s]+/g,'.') + '@klinika.demo',
            functionIds:fid ? [fid] : [], primaryFunctionId:fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
    });
    await window.safeBatchCommit(ops); ops = [];

    // assigneeIds для функцій
    const funcAssignOps = [];
    const faMap = {
        0:[sRefs[0].id],
        1:[sRefs[1].id],
        2:[sRefs[2].id, sRefs[3].id, sRefs[8].id],
        3:[sRefs[4].id, sRefs[5].id, sRefs[7].id],
        4:[sRefs[6].id],
        5:[sRefs[10].id],
        6:[sRefs[9].id],
        7:[sRefs[0].id, sRefs[11].id],
    };
    for (const [fi, aids] of Object.entries(faMap)) {
        funcAssignOps.push({type:'update', ref:fRefs[parseInt(fi)], data:{assigneeIds:aids, updatedAt:now}});
    }
    await window.safeBatchCommit(funcAssignOps);

    // ── 3. НОРМИ КОШТОРИСУ (5) ───────────────────────────────
    const normDefs = [
        {
            name:'Диспансеризація — комплекс (1 особа)',
            category:'medical', inputUnit:'особа', niche:'medical',
            materials:[
                {name:'Консультація терапевта',       qty:1,    unit:'послуга', price:450,  coefficient:1},
                {name:'Загальний аналіз крові',       qty:1,    unit:'аналіз',  price:180,  coefficient:1},
                {name:'Біохімія крові (7 показників)',qty:1,    unit:'аналіз',  price:320,  coefficient:1},
                {name:'УЗД органів черевної порожнини',qty:1,   unit:'послуга', price:550,  coefficient:1},
                {name:'ЕКГ з розшифровкою',           qty:1,    unit:'послуга', price:280,  coefficient:1},
                {name:'Огляд офтальмолога',           qty:1,    unit:'послуга', price:350,  coefficient:1},
                {name:'Шприці/витратні матеріали',    qty:0.05, unit:'комплект',price:120,  coefficient:1},
                {name:'Рукавиці нітрилові',           qty:0.02, unit:'пачка',   price:180,  coefficient:1},
            ],
        },
        {
            name:'Корпоративний пакет базовий (1 особа)',
            category:'medical', inputUnit:'особа', niche:'medical',
            materials:[
                {name:'Консультація терапевта',       qty:1,   unit:'послуга', price:450,  coefficient:1},
                {name:'Загальний аналіз крові',       qty:1,   unit:'аналіз',  price:180,  coefficient:1},
                {name:'Флюорографія',                 qty:1,   unit:'послуга', price:220,  coefficient:1},
                {name:'Огляд офтальмолога',           qty:1,   unit:'послуга', price:350,  coefficient:1},
                {name:'Витратні матеріали',           qty:0.03,unit:'комплект',price:120,  coefficient:1},
            ],
        },
        {
            name:'Хірургічна операція — середня складність',
            category:'surgical', inputUnit:'операція', niche:'medical',
            materials:[
                {name:'Хірург (вартість роботи)',     qty:1,    unit:'послуга', price:8500,  coefficient:1},
                {name:'Анестезіолог',                 qty:1,    unit:'послуга', price:3200,  coefficient:1},
                {name:'Операційна медсестра',         qty:1,    unit:'послуга', price:1800,  coefficient:1},
                {name:'Витратні хірургічні матеріали',qty:1,    unit:'комплект',price:2400,  coefficient:1},
                {name:'Катетер венозний G20',         qty:2,    unit:'шт',      price:85,    coefficient:1},
                {name:'Стерилізація інструментів',   qty:1,    unit:'послуга', price:650,   coefficient:1},
            ],
        },
        {
            name:'Косметологічний курс (10 процедур)',
            category:'cosmetology', inputUnit:'курс', niche:'medical',
            materials:[
                {name:'Ін\'єкційні матеріали (гіалуронова кислота)',qty:1,unit:'флакон',price:2800,coefficient:1},
                {name:'Робота косметолога × 10',     qty:10,   unit:'процедура',price:800,  coefficient:1},
                {name:'Допоміжні косметологічні матеріали',qty:1,unit:'комплект',price:450, coefficient:1},
                {name:'Рукавиці нітрилові',           qty:0.1,  unit:'пачка',   price:180,  coefficient:1},
            ],
        },
        {
            name:'УЗД повний скринінг',
            category:'diagnostics', inputUnit:'пацієнт', niche:'medical',
            materials:[
                {name:'УЗД органів черевної порожнини',qty:1, unit:'послуга', price:550, coefficient:1},
                {name:'УЗД нирок та надниркових залоз',qty:1, unit:'послуга', price:480, coefficient:1},
                {name:'УЗД щитовидної залози',          qty:1, unit:'послуга', price:420, coefficient:1},
                {name:'УЗД гель (витрата на пацієнта)', qty:0.05,unit:'флакон',price:185,coefficient:1},
            ],
        },
    ];
    const normOps = normDefs.map(n => ({type:'set', ref:cr.collection('estimate_norms').doc(), data:{
        name:n.name, category:n.category, inputUnit:n.inputUnit,
        hasExtraParam:false, extraParamLabel:'',
        niche:n.niche, materials:n.materials,
        createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(normOps);

    // ── 4. ЗАВДАННЯ (25+) ────────────────────────────────────
    const TASKS = [
        // Сьогодні
        { t:'Провести огляд пацієнтів відділення',                       fi:2, ai:2,  st:'new',      pr:'high',   d:0,  tm:'09:00', est:120, r:'Огляд проведений, записи в медкартах оновлені' },
        { t:'Подати звіт статистики до МОЗ',                             fi:5, ai:10, st:'new',      pr:'high',   d:0,  tm:'14:00', est:90,  r:'Звіт підписаний і відправлений до МОЗ' },
        { t:'Закупити витратні матеріали — перев\'язка, рукавиці',        fi:6, ai:9,  st:'new',      pr:'high',   d:0,  tm:'11:00', est:45,  r:'Матеріали закуплені та оприбутковані на склад' },
        { t:'Передзвонити пацієнту Бойко після операції',                fi:6, ai:4,  st:'new',      pr:'medium', d:0,  tm:'15:00', est:15,  r:'Стан пацієнта зафіксований, рекомендації надані' },
        { t:'Оновити протокол лікування для відділення',                 fi:7, ai:2,  st:'progress', pr:'high',   d:0,  tm:'16:00', est:60,  r:'Новий протокол затверджений і доведений до команди' },
        { t:'Провести планову нараду відділу',                           fi:7, ai:0,  st:'new',      pr:'medium', d:0,  tm:'17:00', est:45,  r:'Протокол наради складений, завдання розподілені' },
        // Завтра
        { t:'УЗД скринінг — 8 пацієнтів',                               fi:4, ai:6,  st:'new',      pr:'high',   d:1,  tm:'09:00', est:240, r:'Всі 8 досліджень проведені, результати в систему' },
        { t:'Перевірити термін дії ліцензії на обладнання',              fi:7, ai:11, st:'new',      pr:'high',   d:1,  tm:'10:00', est:30,  r:'Ліцензії перевірені, список документів для поновлення готовий' },
        { t:'Зустріч з представником фармкомпанії',                      fi:0, ai:0,  st:'new',      pr:'medium', d:1,  tm:'14:00', est:60,  r:'Умови співпраці обговорені, рішення зафіксоване' },
        // Тиждень
        { t:'Підготувати КП для корпоративного клієнта (200 чол)',       fi:0, ai:1,  st:'new',      pr:'high',   d:3,  tm:'18:00', est:120, r:'КП відправлено клієнту, дата відповіді зафіксована' },
        { t:'Провести навчання персоналу — новий протокол',              fi:6, ai:9,  st:'new',      pr:'high',   d:4,  tm:'14:00', est:90,  r:'Навчання проведено, тест пройдено всіма учасниками' },
        { t:'Оновити базу пацієнтів в системі',                         fi:7, ai:11, st:'new',      pr:'medium', d:3,  tm:'18:00', est:60,  r:'База оновлена, дублі видалені, контакти актуальні' },
        { t:'Замовити вакцини для планової вакцинації',                  fi:6, ai:9,  st:'new',      pr:'high',   d:4,  tm:'11:00', est:30,  r:'Вакцини замовлені, дата поставки підтверджена' },
        { t:'Перевірка стерилізатора — планове ТО',                      fi:6, ai:9,  st:'new',      pr:'medium', d:5,  tm:'10:00', est:45,  r:'ТО виконано, акт підписаний, наступна дата встановлена' },
        // Прострочені
        { t:'Квартальний звіт МОЗ',                                      fi:5, ai:10, st:'new',      pr:'high',   d:-3, tm:'18:00', est:180, r:'Звіт підписаний і зданий до МОЗ' },
        { t:'Технічний огляд рентген-апарату',                           fi:7, ai:11, st:'new',      pr:'high',   d:-5, tm:'18:00', est:60,  r:'ТО проведено, сертифікат отримано' },
        { t:'Профілактичний огляд персоналу',                            fi:6, ai:9,  st:'new',      pr:'medium', d:-7, tm:'18:00', est:90,  r:'Всі 12 співробітників пройшли огляд' },
        { t:'Оновлення прайс-листа',                                     fi:1, ai:1,  st:'new',      pr:'low',    d:-14,tm:'18:00', est:45,  r:'Новий прайс затверджений і опублікований' },
        // На перевірці / Виконані
        { t:'Протокол лікування пацієнта Марченко',                      fi:2, ai:2,  st:'review',   pr:'high',   d:-1, tm:'18:00', est:60,  r:'Протокол підписаний і збережений в системі' },
        { t:'Договір з страховою компанією АХА підписаний',             fi:5, ai:10, st:'done',     pr:'high',   d:-6, tm:'18:00', est:30,  r:'Договір підписаний, умови узгоджені' },
        { t:'Акредитація відділення косметології',                       fi:7, ai:0,  st:'done',     pr:'high',   d:-10,tm:'18:00', est:120, r:'Акредитація пройдена, сертифікат отримано' },
        { t:'Закупівля нового УЗД-сканера Samsung HS50',                fi:4, ai:0,  st:'done',     pr:'high',   d:-15,tm:'18:00', est:60,  r:'Сканер придбаний, встановлений, персонал навчений' },
        // Відхилені
        { t:'Звіт витрат медикаментів за березень',                      fi:5, ai:10, st:'progress', pr:'high',   d:-2, tm:'18:00', est:60,
          reason:'Не вистачає підписів завідувачів відділень. Зібрати всі підписи та повторно подати.' },
        { t:'Оновлення цінника — нові послуги косметології',            fi:1, ai:1,  st:'progress', pr:'medium', d:-3, tm:'18:00', est:30,
          reason:'Ціни не погоджені з головлікарем. Узгодити прайс на нараді у п\'ятницю.' },
        { t:'Заявка на обладнання — новий стерилізатор',                fi:6, ai:9,  st:'progress', pr:'medium', d:-4, tm:'18:00', est:45,
          reason:'Перевищено бюджет відділу на 25%. Переглянути специфікацію або перенести на наступний квартал.' },
    ];

    for (const t of TASKS) {
        const ref = cr.collection('tasks').doc();
        const data = {
            title:t.t,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:t.st, priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:t.tm,
            estimatedTime:String(t.est), expectedResult:t.r || '',
            requireReview: t.st !== 'done',
            createdAt:now, updatedAt:now,
        };
        if (t.reason) {
            data.reviewRejectedAt = new Date(Date.now() + t.d * 86400000).toISOString();
            data.reviewRejectedBy = uid;
            data.reviewRejectReason = t.reason;
        }
        ops.push({type:'set', ref, data});
    }

    // ── 5. РЕГУЛЯРНІ ЗАВДАННЯ (17) ───────────────────────────
    const REGS = [
        // Щоденні
        { t:'Обхід пацієнтів відділення',                type:'daily',           fi:2, ai:2,  tm:'08:00', est:30, result:'Стан кожного пацієнта оцінений, записи в медкартах оновлені' },
        { t:'Перевірка записів на завтра',               type:'daily',           fi:1, ai:1,  tm:'17:00', est:20, result:'Всі записи підтверджені або перенесені, пацієнти повідомлені' },
        // Пн
        { t:'Клінічна нарада — стан пацієнтів',          type:'weekly', dow:1,   fi:7, ai:0,  tm:'09:00', est:45, result:'Протокол наради, складні випадки обговорені, рішення зафіксовані' },
        { t:'Перевірка залишків медматеріалів',           type:'weekly', dow:1,   fi:6, ai:9,  tm:'09:30', est:30, result:'Список позицій нижче мінімуму, заявка на закупівлю сформована' },
        { t:'Планування закупівель тижня',               type:'weekly', dow:1,   fi:6, ai:9,  tm:'10:30', est:20, result:'Список закупівель затверджений, постачальники повідомлені' },
        // Ср
        { t:'Дзвінки пацієнтам — контроль самопочуття',  type:'weekly', dow:3,   fi:1, ai:1,  tm:'14:00', est:60, result:'Кожен пацієнт тижня отримав дзвінок, стан зафіксований в системі' },
        { t:'Перевірка якості ведення медкарт',           type:'weekly', dow:3,   fi:6, ai:0,  tm:'11:00', est:30, result:'Карти без порушень або список виправлень передано відповідним лікарям' },
        // Пт
        { t:'Фінансовий звіт тижня',                     type:'weekly', dow:5,   fi:5, ai:10, tm:'16:00', est:30, result:'Доходи/витрати тижня, залишки на рахунках, прострочені платежі' },
        { t:'Звіт по записах та завантаженості',         type:'weekly', dow:5,   fi:1, ai:1,  tm:'17:00', est:20, result:'Таблиця: записи/прийоми/no-show/завантаженість лікарів за тиждень' },
        { t:'Запит відгуків у пацієнтів тижня',          type:'weekly', dow:5,   fi:0, ai:1,  tm:'15:00', est:30, result:'Відгуки зібрані, NPS зафіксований, скарги передані головлікарю' },
        { t:'Перевірка термінів ліків і матеріалів',     type:'weekly', dow:5,   fi:6, ai:9,  tm:'15:00', est:20, result:'Список матеріалів з терміном що спливає, план утилізації або заміни' },
        // Щомісячні
        { t:'Звіт до МОЗ — статистика',                  type:'monthly', dom:28, fi:5, ai:10, tm:'14:00', est:180,result:'Звіт підписаний і зданий до МОЗ вчасно' },
        { t:'Аналіз рентабельності послуг',               type:'monthly', dom:5,  fi:7, ai:0,  tm:'10:00', est:90, result:'Звіт по маржі кожної послуги, висновки та рекомендації для власника' },
        { t:'Виплата основної зарплати',                  type:'monthly', dom:25, fi:5, ai:10, tm:'10:00', est:60, result:'Зарплата нарахована та виплачена, звіт для власника підготовлений' },
        { t:'Оновлення прайс-листа',                      type:'monthly', dom:1,  fi:1, ai:1,  tm:'10:00', est:30, result:'Новий прайс погоджений головлікарем і опублікований на сайті' },
        { t:'Перевірка ліцензій та дозволів',             type:'monthly', dom:10, fi:7, ai:11, tm:'11:00', est:60, result:'Всі ліцензії актуальні або список документів для поновлення підготовлений' },
        { t:'Навчання персоналу — нові протоколи',        type:'monthly', dom:15, fi:7, ai:0,  tm:'14:00', est:90, result:'Навчання проведено, тест пройдено всіма, сертифікати видані' },
    ];
    for (const r of REGS) {
        const dows = r.type === 'weekly' && r.dow != null ? [r.dow] : null;
        let timeEnd = null;
        if (r.tm && r.est) {
            const [hh, mm] = r.tm.split(':').map(Number);
            const tot = hh * 60 + mm + r.est;
            timeEnd = String(Math.floor(tot/60)).padStart(2,'0') + ':' + String(tot%60).padStart(2,'0');
        }
        ops.push({type:'set', ref:cr.collection('regularTasks').doc(), data:{
            title:r.t, period:r.type, daysOfWeek:dows, dayOfMonth:r.dom || null,
            skipWeekends:r.type==='daily', timeStart:r.tm, timeEnd, duration:r.est,
            function:FUNCS[r.fi].name,
            assigneeId:sRefs[r.ai].id,
            expectedResult:r.result || '',
            reportFormat:'Короткий звіт у вільній формі',
            instruction:'', priority:'medium', requireReview:false,
            notifyOnComplete:[], checklist:[], status:'active', createdAt:now,
        }});
    }

    // ── 6. ШАБЛОНИ ПРОЦЕСІВ (5) ──────────────────────────────
    const tpl1Ref = cr.collection('processTemplates').doc(); // Прийом нового пацієнта
    const tpl2Ref = cr.collection('processTemplates').doc(); // Хірургічна операція
    const tpl3Ref = cr.collection('processTemplates').doc(); // Онбординг лікаря
    const tpl4Ref = cr.collection('processTemplates').doc(); // Закупівля медикаментів
    const tpl5Ref = cr.collection('processTemplates').doc(); // Скарга пацієнта

    ops.push({type:'set', ref:tpl1Ref, data:{
        name:'Прийом нового пацієнта',
        description:'8 кроків від першого контакту до постановки на облік і початку лікування',
        steps:[
            {id:'s1', name:'Реєстрація та запис',                    functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Збір анамнезу',                          functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:2},
            {id:'s3', name:'Первинний огляд лікаря',                 functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:3},
            {id:'s4', name:'Призначення діагностики',                functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:2, order:4},
            {id:'s5', name:'Постановка діагнозу',                    functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:5},
            {id:'s6', name:'Призначення лікування',                  functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:6},
            {id:'s7', name:'Виписка та рекомендації',                functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:7},
            {id:'s8', name:'Контрольний дзвінок через 7 днів',       functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:8},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl2Ref, data:{
        name:'Хірургічна операція',
        description:'10 кроків від направлення до зняття швів і закриття справи',
        steps:[
            {id:'s1', name:'Направлення та призначення дати',         functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:1},
            {id:'s2', name:'Передопераційне обстеження',              functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:2, order:2},
            {id:'s3', name:'Госпіталізація та підготовка',            functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:3},
            {id:'s4', name:'Підготовка операційної',                  functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:4},
            {id:'s5', name:'Проведення операції',                     functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:5},
            {id:'s6', name:'Реанімація та відновлення',               functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:6},
            {id:'s7', name:'Перебування у палаті',                    functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:3, order:7},
            {id:'s8', name:'Виписка з рекомендаціями',                functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:8},
            {id:'s9', name:'Контроль через 7 днів',                   functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:9},
            {id:'s10',name:'Зняття швів і закриття справи',           functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:10},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl3Ref, data:{
        name:'Онбординг нового лікаря',
        description:'7 кроків від оформлення до самостійного ведення пацієнтів',
        steps:[
            {id:'s1', name:'Оформлення документів та ліцензій',       functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:2, order:1},
            {id:'s2', name:'Ознайомлення з протоколами клініки',      functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:2, order:2},
            {id:'s3', name:'Навчання роботі в системі',               functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:3},
            {id:'s4', name:'Прийом пацієнтів з наставником',         functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:5, order:4},
            {id:'s5', name:'Самостійний прийом під наглядом',        functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:7, order:5},
            {id:'s6', name:'Складання кваліфікаційного тесту',       functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:6},
            {id:'s7', name:'Затвердження результатів випробування',   functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl4Ref, data:{
        name:'Закупівля медикаментів',
        description:'5 кроків від виявлення потреби до оприбуткування',
        steps:[
            {id:'s1', name:'Формування заявки на матеріали',          functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:1},
            {id:'s2', name:'Отримання КП від постачальників',         functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:2, order:2},
            {id:'s3', name:'Погодження та оплата рахунку',            functionId:fRefs[5].id, functionName:FUNCS[5].name, durationDays:1, order:3},
            {id:'s4', name:'Приймання та перевірка якості/термінів',  functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:4},
            {id:'s5', name:'Оприбуткування в систему',                functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl5Ref, data:{
        name:'Робота зі скаргою пацієнта',
        description:'6 кроків від отримання скарги до закриття і аналізу',
        steps:[
            {id:'s1', name:'Прийом та реєстрація скарги',             functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Розгляд скарги головлікарем',             functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:2},
            {id:'s3', name:'Внутрішнє розслідування',                 functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:2, order:3},
            {id:'s4', name:'Погодження рішення з пацієнтом',          functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:4},
            {id:'s5', name:'Виконання компенсаційних заходів',        functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:3, order:5},
            {id:'s6', name:'Закриття скарги та аналіз причини',       functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:6},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    // 7 активних процесів
    const PROCS = [
        { tpl:tpl2Ref, name:'Пацієнт Бойко — постоперативний контроль', step:7,  ai:4  },
        { tpl:tpl1Ref, name:'Корпоративна програма FinTech — реєстрація',step:3,  ai:1  },
        { tpl:tpl3Ref, name:'Акредитація ISO 9001',                       step:4,  ai:0  },
        { tpl:tpl3Ref, name:'Онбординг — лікар Ігор Романенко',           step:5,  ai:0  },
        { tpl:tpl4Ref, name:'Закупівля медикаментів — квітень',           step:2,  ai:9  },
        { tpl:tpl5Ref, name:'Скарга пацієнта Литвиненко',                 step:3,  ai:0  },
        { tpl:tpl1Ref, name:'Відкриття косметологічного кабінету',        step:4,  ai:7  },
    ];
    const tplNames = {
        [tpl1Ref.id]:'Прийом нового пацієнта',
        [tpl2Ref.id]:'Хірургічна операція',
        [tpl3Ref.id]:'Онбординг нового лікаря',
        [tpl4Ref.id]:'Закупівля медикаментів',
        [tpl5Ref.id]:'Робота зі скаргою пацієнта',
    };
    for (const p of PROCS) {
        ops.push({type:'set', ref:cr.collection('processes').doc(), data:{
            templateId:p.tpl.id, templateName:tplNames[p.tpl.id],
            name:p.name, currentStep:p.step, status:'active',
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            startDate:_demoDate(-10), deadline:_demoDate(25),
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops); ops = [];

    // ── 7. ПРОЄКТИ (3) ───────────────────────────────────────
    const PROJS = [
        { name:'Відкриття кабінету косметології',     desc:'Запуск нового косметологічного відділення з повним обладнанням', color:'#ec4899', rev:1200000, labor:0,      mat:420000, start:-20, end:45  },
        { name:'Корпоративна програма FinTech 200 чол',desc:'Медичне обслуговування команди FinTech — 200 співробітників',   color:'#22c55e', rev:580000,  labor:85000,  mat:0,      start:-15, end:30  },
        { name:'Акредитація ISO 9001',                 desc:'Отримання міжнародної акредитації якості клініки',               color:'#3b82f6', rev:0,       labor:95000,  mat:0,      start:-30, end:60  },
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

    // Етапи проєктів
    const projSnap = await cr.collection('projects').get();
    const projDocs = projSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const stageOps = [];
    for (const proj of projDocs) {
        const pn = proj.name || '';
        let stages = [];
        if (pn.includes('косметол')) {
            stages = [
                {name:'Планування та бюджет',         status:'done',        order:1, start:_demoDate(-20), end:_demoDate(-15)},
                {name:'Закупівля обладнання',         status:'done',        order:2, start:_demoDate(-15), end:_demoDate(-5) },
                {name:'Ремонт та монтаж кабінету',    status:'in_progress', order:3, start:_demoDate(-5),  end:_demoDate(15) },
                {name:'Навчання косметолога',         status:'planned',     order:4, start:_demoDate(15),  end:_demoDate(25) },
                {name:'Відкриття та перший клієнт',  status:'planned',     order:5, start:_demoDate(38),  end:_demoDate(45) },
            ];
        } else if (pn.includes('FinTech')) {
            stages = [
                {name:'Підписання договору',          status:'done',        order:1, start:_demoDate(-15), end:_demoDate(-12)},
                {name:'Формування списку персоналу',  status:'done',        order:2, start:_demoDate(-12), end:_demoDate(-8) },
                {name:'Первинні огляди (100 чол)',    status:'in_progress', order:3, start:_demoDate(-5),  end:_demoDate(10) },
                {name:'Другий потік (100 чол)',       status:'planned',     order:4, start:_demoDate(12),  end:_demoDate(28) },
            ];
        } else if (pn.includes('ISO')) {
            stages = [
                {name:'Документація та підготовка',  status:'done',        order:1, start:_demoDate(-30), end:_demoDate(-20)},
                {name:'Внутрішній аудит',            status:'done',        order:2, start:_demoDate(-20), end:_demoDate(-12)},
                {name:'Усунення невідповідностей',   status:'done',        order:3, start:_demoDate(-12), end:_demoDate(-5) },
                {name:'Зовнішній аудит ISO',         status:'in_progress', order:4, start:_demoDate(-3),  end:_demoDate(10) },
                {name:'Виправлення після аудиту',    status:'planned',     order:5, start:_demoDate(12),  end:_demoDate(30) },
                {name:'Отримання сертифікату',       status:'planned',     order:6, start:_demoDate(45),  end:_demoDate(60) },
            ];
        }
        for (const s of stages) {
            stageOps.push({type:'set', ref:cr.collection('projectStages').doc(), data:{
                projectId:proj.id, name:s.name, order:s.order, status:s.status,
                plannedStartDate:s.start, plannedEndDate:s.end,
                actualStartDate:s.status==='done'?s.start:null,
                actualEndDate:s.status==='done'?s.end:null,
                progressPct:s.status==='done'?100:s.status==='in_progress'?55:0,
                blockedReason:null, createdAt:now, updatedAt:now,
            }});
        }
    }
    if (stageOps.length) await window.safeBatchCommit(stageOps);

    // Завдання прив'язані до проєктів
    const pByName = {};
    projDocs.forEach(d => {
        const n = d.data ? d.data().name || '' : d.name || '';
        const name = n || '';
        if (name.includes('косметол')) pByName['cosm']    = {id:d.id, name};
        if (name.includes('FinTech'))  pByName['fintech']  = {id:d.id, name};
        if (name.includes('ISO'))      pByName['iso']       = {id:d.id, name};
    });

    // Отримуємо назви після запису
    const projSnap2 = await cr.collection('projects').get();
    projSnap2.docs.forEach(d => {
        const name = d.data().name || '';
        if (name.includes('косметол')) pByName['cosm']   = {id:d.id, name};
        if (name.includes('FinTech'))  pByName['fintech'] = {id:d.id, name};
        if (name.includes('ISO'))      pByName['iso']     = {id:d.id, name};
    });

    const projTaskOps = [];
    if (pByName.cosm) {
        const {id:pid, name:pname} = pByName.cosm;
        [
            {t:'Замовити лазерний апарат Fotona для косметології',    fi:6, ai:0,  d:1,  pr:'high',   est:45,  r:'Обладнання замовлено, дата доставки підтверджена'},
            {t:'Розробити прайс на косметологічні послуги',           fi:1, ai:1,  d:2,  pr:'high',   est:60,  r:'Прайс погоджений головлікарем і переданий дизайнеру'},
            {t:'Провести навчання косметолога Наталії Ткач',          fi:7, ai:7,  d:12, pr:'high',   est:480, r:'Сертифікат отримано, навчання пройдено'},
            {t:'Підготувати документи для відкриття кабінету',        fi:7, ai:11, d:3,  pr:'high',   est:90,  r:'Всі дозволи та ліцензії отримані'},
            {t:'Маркетингова кампанія — відкриття косметології',     fi:0, ai:0,  d:20, pr:'medium', est:120, r:'Кампанія запущена, перші записи є'},
            {t:'Закупити витратні матеріали для косметологічного кабінету', fi:6, ai:9, d:10, pr:'medium', est:60, r:'Матеріали закуплені та розміщені в кабінеті'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }

    if (pByName.fintech) {
        const {id:pid, name:pname} = pByName.fintech;
        [
            {t:'Скласти графік первинних оглядів FinTech (200 чол)', fi:1, ai:1,  d:1,  pr:'high',   est:60,  r:'Графік затверджений, HR FinTech повідомлено'},
            {t:'Провести огляди першого потоку — 100 чол',           fi:2, ai:2,  d:7,  pr:'high',   est:480, r:'100 пацієнтів пройшли огляд, карти заповнені'},
            {t:'Підготувати зведений звіт здоров\'я команди',         fi:7, ai:0,  d:15, pr:'high',   est:120, r:'Анонімний звіт переданий HR директору FinTech'},
            {t:'Виставити рахунок за перший потік',                  fi:5, ai:10, d:10, pr:'high',   est:30,  r:'Рахунок виставлений та оплачений'},
            {t:'Узгодити другий потік — 100 чол',                    fi:1, ai:1,  d:12, pr:'medium', est:30,  r:'Дати узгоджені, HR повідомлено'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }

    if (pByName.iso) {
        const {id:pid, name:pname} = pByName.iso;
        [
            {t:'Підготувати документацію процесів для аудиту ISO',  fi:7, ai:11, d:5,  pr:'high',   est:180, r:'Пакет документів переданий аудитору'},
            {t:'Провести навчання персоналу вимогам ISO 9001',       fi:7, ai:0,  d:7,  pr:'high',   est:90,  r:'Весь персонал пройшов навчання'},
            {t:'Усунути невідповідності після внутрішнього аудиту',  fi:6, ai:9,  d:3,  pr:'high',   est:120, r:'Всі невідповідності усунені, докази надані аудитору'},
            {t:'Підготовка до зовнішнього аудиту ISO',               fi:7, ai:0,  d:2,  pr:'high',   est:60,  r:'Команда підготовлена, документи зібрані'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }
    if (projTaskOps.length) await window.safeBatchCommit(projTaskOps);

    // ── 8. КОШТОРИС — приклад FinTech ────────────────────────
    const normSnap2 = await cr.collection('estimate_norms').get();
    const normDocs2 = normSnap2.docs.map(d => ({id:d.id, ...d.data()}));
    const corpNorm  = normDocs2.find(n => n.name && n.name.includes('Корпоративний пакет'));
    const fintechProjSnap = await cr.collection('projects').get();
    const fintechProjDoc  = fintechProjSnap.docs.find(d => (d.data().name||'').includes('FinTech'));

    if (corpNorm && fintechProjDoc) {
        const qty200 = 200;
        const calced = (corpNorm.materials||[]).map(m => ({
            name:m.name, unit:m.unit,
            required:Math.round(m.qty * qty200 * 10)/10,
            inStock:0, deficit:Math.round(m.qty * qty200 * 10)/10,
            pricePerUnit:m.price,
            total:Math.round(m.qty * qty200 * m.price),
        }));
        const totalEst = calced.reduce((s, m) => s + m.total, 0);
        await window.safeBatchCommit([{type:'set', ref:cr.collection('project_estimates').doc(), data:{
            title:'Корпоративна програма FinTech — 200 чол',
            projectId:fintechProjDoc.id, dealId:'', functionId:'',
            status:'approved', sections:[{
                normId:corpNorm.id, normName:corpNorm.name,
                inputValue:qty200, inputUnit:corpNorm.inputUnit,
                extraParam:null, calculatedMaterials:calced,
            }],
            totals:{totalMaterialsCost:totalEst, totalDeficitCost:totalEst, currency:'UAH'},
            deleted:false, createdBy:uid, approvedBy:uid, createdAt:now, updatedAt:now,
        }}]);
        await cr.collection('projects').doc(fintechProjDoc.id).update({estimateBudget:totalEst, updatedAt:now});
    }

    // ── 9. CRM ───────────────────────────────────────────────
    try {
        const oldPips = await cr.collection('crm_pipeline').get();
        if (!oldPips.empty) await window.safeBatchCommit(oldPips.docs.map(d => ({type:'delete', ref:d.ref})));
    } catch(e) {}

    const pipRef = cr.collection('crm_pipeline').doc();
    await pipRef.set({
        isDemo:true,
        name:'Медичні послуги',
        stages:[
            {id:'new',          label:'Новий лід',          color:'#6b7280', order:1},
            {id:'contacted',    label:'Контакт встановлено', color:'#3b82f6', order:2},
            {id:'consultation', label:'Консультація',        color:'#8b5cf6', order:3},
            {id:'diagnosis',    label:'Діагностика',         color:'#f59e0b', order:4},
            {id:'treatment',    label:'Лікування',           color:'#f97316', order:5},
            {id:'followup',     label:'Контрольний огляд',  color:'#22c55e', order:6},
            {id:'won',          label:'Завершено успішно',   color:'#16a34a', order:7},
            {id:'lost',         label:'Відмова',             color:'#ef4444', order:8},
            {id:'archived',     label:'В архіві',            color:'#9ca3af', order:9},
        ],
        createdBy:uid, createdAt:now, isDefault:true,
    });

    const DEALS = [
        // Активні
        {name:'Корпоративна програма ДТЕК — 150 чол',      client:'ДТЕК (Бондаренко В.)',  phone:'+380671220001', email:'hr@dtek.ua',          src:'referral',     stage:'consultation', amt:450000, nc:0,  note:'Зустріч призначена. Хочуть пакет диспансеризації + щеплення. Бюджет погоджено.' },
        {name:'VIP-пакет — Іваненко Олег (сім\'я)',        client:'Іваненко Олег',         phone:'+380671220002', email:'ivanenko@gmail.com',  src:'referral',     stage:'treatment',    amt:85000,  nc:0,  note:'Родина 4 особи. Комплексне обстеження. Результати аналізів готові — зателефонувати.' },
        {name:'Онкоскринінг — 50 чол (ПрАТ Укрбуд)',      client:'ПрАТ Укрбуд (Мельник)', phone:'+380671220003', email:'hr@ukrbud.ua',        src:'google',       stage:'consultation', amt:380000, nc:3,  note:'КП надіслано. Чекаємо відповідь. Конкурент запропонував менше.' },
        {name:'Страхова Уніка — договір ДМС',              client:'Уніка (Кравченко П.)',  phone:'+380671220004', email:'p.kravchenko@unica.ua',src:'cold_call',    stage:'consultation', amt:280000, nc:2,  note:'Переговори тривають. Хочуть 200 застрахованих, потрібно погодити тарифи.' },
        {name:'Жіноче здоров\'я × 30 чол (СМБ Груп)',     client:'СМБ Груп (Ковалів Л.)',  phone:'+380671220005', email:'hr@smb.ua',           src:'instagram',    stage:'diagnosis',    amt:165000, nc:1,  note:'Пакет для жінок: гінеколог + УЗД + аналізи. 30 жінок, погоджено.' },
        {name:'Диспансеризація заводу — 80 чол',          client:'АТ Завод (Руденко О.)',  phone:'+380671220006', email:'rudenkoav@zavod.ua',  src:'referral',     stage:'new',          amt:120000, nc:0,  note:'Новий лід. Звернулись через рекомендацію. Потрібно виїзний огляд на підприємство.' },
        {name:'VIP щорічний огляд — Мороз Андрій',        client:'Мороз Андрій Іванович', phone:'+380671220007', email:'moroz@gmail.com',     src:'google',       stage:'new',          amt:45000,  nc:0,  note:'Особистий пацієнт. Комплексний чекап. Записатись на зручний час.' },
        {name:'Корпоратив Нова Пошта — 300 чол',          client:'Нова Пошта (Данченко)',  phone:'+380671220008', email:'hr@novaposhta.ua',    src:'referral',     stage:'consultation', amt:290000, nc:0,  note:'Нарада погоджена на завтра. Великий контракт, підготувати детальне КП.' },
        {name:'Пацієнт Яценко Сергій — терапія',          client:'Яценко Сергій',         phone:'+380671220009', email:'yatsenko@gmail.com',  src:'instagram',    stage:'treatment',    amt:8000,   nc:0,  note:'Лікування хронічного гастриту. Другий тиждень терапії.' },
        {name:'Постоп контроль — Бойко Петро',            client:'Бойко Петро',           phone:'+380671220010', email:'boyko@ukr.net',       src:'referral',     stage:'followup',     amt:12000,  nc:0,  note:'Апендектомія 10 днів тому. Контрольний огляд — зателефонувати.' },
        {name:'Новий пацієнт — Гриценко Ірина',           client:'Гриценко Ірина',        phone:'+380671220011', email:'grytsenko@gmail.com', src:'google',       stage:'new',          amt:5000,   nc:0,  note:'Скарги на болі в спині. Направити до ортопеда Романенка.' },
        // Виграні
        {name:'Корпоративна програма FinTech 200 чол',    client:'FinTech (Данилюк В.)',  phone:'+380671220012', email:'v.danyliuk@fintech.ua',src:'referral',    stage:'won',          amt:580000, nc:null, note:'Договір підписаний. Перший потік 100 чол уже проходять огляди.' },
        {name:'Страхова АХА — договір ДМС 2024',         client:'АХА Страхування (Кулик)',phone:'+380671220013', email:'kylyk@axa.ua',        src:'cold_call',    stage:'won',          amt:320000, nc:null, note:'Договір підписаний. 180 застрахованих. Умови відмінні.' },
        // Програна
        {name:'Медком — корпоративний огляд (відмова)',   client:'Медком (Семенюк)',       phone:'+380671220014', email:'semenuk@medcom.ua',   src:'google',       stage:'lost',         amt:200000, nc:null, note:'Пішли до конкурента — дешевше на 18%. Наша якість вища, але ціна вирішила.' },
    ];

    const cliRefs = DEALS.map(() => cr.collection('crm_clients').doc());
    await window.safeBatchCommit(DEALS.map((d, i) => ({type:'set', ref:cliRefs[i], data:{
        name:d.client, phone:d.phone, email:d.email,
        telegram:'', type:'person', source:d.src, niche:'medical',
        createdAt:_demoTs(-Math.floor(Math.random()*21+1)), updatedAt:now,
    }})));

    await window.safeBatchCommit(DEALS.map((d, i) => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        pipelineId:pipRef.id, title:d.name,
        clientName:d.client, clientId:cliRefs[i].id,
        phone:d.phone, email:d.email,
        source:d.src, stage:d.stage, amount:d.amt, note:d.note,
        nextContactDate:d.nc !== null ? _demoDate(d.nc) : null,
        nextContactTime:d.nc === 0 ? '14:00' : null,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        deleted:false, tags:[],
        createdAt:_demoTs(-Math.floor(Math.random()*14+1)), updatedAt:now,
    }})));

    // CRM Todo — дзвінки сьогодні
    const todayDeals = [
        {name:'Перший дзвінок — Шевченко Олег (заявка з сайту)',       client:'Шевченко Олег',     phone:'+380671220020', src:'google',    note:'Залишив заявку вночі. Скарги: біль в серці, задишка. Направити до кардіолога Лисенко.'},
        {name:'Нагадування — Іваненко, результати аналізів готові',    client:'Іваненко Олег',     phone:'+380671220021', src:'referral',  note:'Результати готові з вчора. Терміново зателефонувати і призначити візит.'},
        {name:'Підтвердити зустріч — ДТЕК, корпоративна програма',    client:'ДТЕК (Бондаренко)', phone:'+380671220022', src:'referral',  note:'Зустріч на 15:00. Підготувати КП на 150 чол, прайс і приклади звітів.'},
    ];
    const todayCliRefs = todayDeals.map(() => cr.collection('crm_clients').doc());
    await window.safeBatchCommit(todayDeals.map((d, i) => ({type:'set', ref:todayCliRefs[i], data:{
        name:d.client, phone:d.phone, email:'', telegram:'', type:'person',
        source:d.src, niche:'medical', createdAt:_demoTs(-1), updatedAt:now,
    }})));
    await window.safeBatchCommit(todayDeals.map((d, i) => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        pipelineId:pipRef.id, title:d.name,
        clientName:d.client, clientId:todayCliRefs[i].id,
        phone:d.phone, email:'', source:d.src, stage:'new', amount:0, note:d.note,
        nextContactDate:_demoDate(0), nextContactTime:'14:00',
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        deleted:false, tags:[], createdAt:_demoTs(-1), updatedAt:now,
    }})));

    // ── 10. ФІНАНСИ ──────────────────────────────────────────
    const finSettingsRef = cr.collection('finance_settings').doc('main');
    await finSettingsRef.set({isDemo:true, version:1, region:'UA', currency:'UAH', niche:'medical', initializedAt:now, initializedBy:uid, updatedAt:now});

    try {
        for (const col of ['finance_accounts','finance_transactions','finance_categories','finance_recurring']) {
            const snap = await cr.collection(col).get();
            if (!snap.empty) await window.safeBatchCommit(snap.docs.map(d => ({type:'delete', ref:d.ref})));
        }
    } catch(e) {}

    const accRefs = [
        cr.collection('finance_accounts').doc(),
        cr.collection('finance_accounts').doc(),
        cr.collection('finance_accounts').doc(),
    ];
    const ACCOUNTS = [
        {name:'Приватбанк клініки',           type:'bank', balance:485000, currency:'UAH', isDefault:true},
        {name:'Каса (готівка)',               type:'cash', balance:62000,  currency:'UAH', isDefault:false},
        {name:'Картка витратні матеріали',    type:'card', balance:28000,  currency:'UAH', isDefault:false},
    ];
    const finOps = [];
    ACCOUNTS.forEach((a, i) => finOps.push({type:'set', ref:accRefs[i], data:{...a, createdBy:uid, createdAt:now, updatedAt:now}}));

    const FIN_CATS = [
        {name:'Оплата за прийом',             type:'income',  color:'#22c55e', icon:'activity'},
        {name:'Корпоративний договір (аванс)',type:'income',  color:'#16a34a', icon:'briefcase'},
        {name:'Страхова виплата',             type:'income',  color:'#84cc16', icon:'shield'},
        {name:'Перший клієнт (косметологія)', type:'income',  color:'#f0abfc', icon:'sparkles'},
        {name:'Медикаменти та матеріали',     type:'expense', color:'#ef4444', icon:'package'},
        {name:'Зарплата персоналу',           type:'expense', color:'#f97316', icon:'users'},
        {name:'Оренда приміщення',            type:'expense', color:'#8b5cf6', icon:'home'},
        {name:'Обладнання та ТО',             type:'expense', color:'#0ea5e9', icon:'tool'},
        {name:'Реклама / Маркетинг',          type:'expense', color:'#ec4899', icon:'trending-up'},
        {name:'Адміністративні витрати',      type:'expense', color:'#6b7280', icon:'settings'},
        {name:'Ліцензії та акредитація',      type:'expense', color:'#f59e0b', icon:'award'},
    ];
    const catRefs = FIN_CATS.map(() => cr.collection('finance_categories').doc());
    FIN_CATS.forEach((c, i) => finOps.push({type:'set', ref:catRefs[i], data:{name:c.name, type:c.type, color:c.color, icon:c.icon, isDefault:false, createdBy:uid, createdAt:now}}));
    await window.safeBatchCommit(finOps);

    const _noteToFuncMed = (note) => {
        if (!note) return '';
        const n = note.toLowerCase();
        if (n.includes('реклам') || n.includes('маркет') || n.includes('google') || n.includes('meta')) return fRefs[0].id;
        if (n.includes('запис') || n.includes('адмін') || n.includes('корпоратив') || n.includes('фінтех') || n.includes('fintech') || n.includes('страхов') || n.includes('аванс')) return fRefs[1].id;
        if (n.includes('прийом') || n.includes('огляд') || n.includes('консультац')) return fRefs[2].id;
        if (n.includes('хірург') || n.includes('операц') || n.includes('косметол') || n.includes('процедур')) return fRefs[3].id;
        if (n.includes('лаборатор') || n.includes('аналіз') || n.includes('узд')) return fRefs[4].id;
        if (n.includes('медикамент') || n.includes('матеріал') || n.includes('шприц') || n.includes('рукавиц')) return fRefs[4].id;
        if (n.includes('зарплат')) return fRefs[5].id;
        if (n.includes('оренд')) return fRefs[5].id;
        return '';
    };

    const projSnapFin = await cr.collection('projects').get();
    const projDocsFin = projSnapFin.docs.map(d => ({id:d.id, name:d.data().name||''}));
    const _getProjIdMed = (note) => {
        const n = (note||'').toLowerCase();
        const p = projDocsFin.find(p => {
            if (n.includes('косметол') && p.name.includes('косметол')) return true;
            if ((n.includes('fintech') || n.includes('фінтех')) && p.name.includes('FinTech')) return true;
            return false;
        });
        return p ? p.id : '';
    };

    const TXS = [
        // Поточний місяць — доходи
        {ci:1, acc:0, amt:290000, note:'Аванс 50% — корпоративна FinTech (580К)', d:-3},
        {ci:2, acc:0, amt:160000, note:'Страхова виплата — АХА (перший транш)',   d:-5},
        {ci:0, acc:1, amt:42000,  note:'Оплата за прийоми — тиждень',             d:-1},
        {ci:0, acc:0, amt:38500,  note:'Оплата прийомів — терапія, кардіо',       d:-7},
        {ci:3, acc:1, amt:8500,   note:'Перший клієнт косметологія — Шевченко',   d:-2},
        // Витрати поточний місяць
        {ci:4, acc:2, amt:28000,  note:'Медикаменти та шприці — місячна закупівля',d:-4},
        {ci:4, acc:2, amt:15500,  note:'Рукавиці, маски, перев\'язка',            d:-8},
        {ci:5, acc:0, amt:95000,  note:'Зарплата лікарів — аванс березень',       d:-10},
        {ci:6, acc:0, amt:45000,  note:'Оренда приміщення — березень',            d:-1},
        {ci:7, acc:0, amt:18500,  note:'ТО УЗД-сканера + обслуговування обладнання',d:-6},
        {ci:8, acc:0, amt:12000,  note:'Реклама Google/Meta — березень',          d:-5},
        {ci:9, acc:2, amt:3500,   note:'CRM підписка + IT послуги',               d:-1},
        // Минулий місяць — доходи
        {ci:1, acc:0, amt:320000, note:'Корпоратив АХА — повна оплата договору',  d:-32},
        {ci:0, acc:0, amt:85000,  note:'Оплата за прийоми — лютий тиждень 3-4',  d:-25},
        {ci:2, acc:1, amt:45000,  note:'Страхова виплата Уніка — частково',       d:-28},
        // Витрати минулий місяць
        {ci:4, acc:0, amt:32000,  note:'Медикаменти лютий — закупівля',           d:-30},
        {ci:5, acc:0, amt:185000, note:'Зарплата всього персоналу — лютий',       d:-5},
        {ci:6, acc:0, amt:45000,  note:'Оренда — лютий',                          d:-31},
        {ci:10,acc:0, amt:14500,  note:'Ліцензія та акредитація косметологія',    d:-22},
        {ci:7, acc:0, amt:420000, note:'Косметологія — купівля лазерного апарату Fotona', d:-18},
        // Позаминулий місяць
        {ci:0, acc:0, amt:92000,  note:'Оплата за прийоми — січень',              d:-55},
        {ci:1, acc:0, amt:75000,  note:'Корпоративний аванс — FinTech перший',    d:-50},
        {ci:5, acc:0, amt:182000, note:'Зарплата персоналу — січень',             d:-36},
        {ci:4, acc:0, amt:28000,  note:'Медикаменти — січень',                    d:-58},
        {ci:8, acc:0, amt:12000,  note:'Реклама — січень',                        d:-55},
        {ci:9, acc:2, amt:8500,   note:'Адмін витрати — комунальні січень',       d:-50},
        {ci:7, acc:0, amt:18000,  note:'ТО обладнання — планове щоквартальне',    d:-45},
    ];

    const txOps = TXS.map(tx => ({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
        categoryId:catRefs[tx.ci].id, categoryName:FIN_CATS[tx.ci].name,
        accountId:accRefs[tx.acc].id, accountName:ACCOUNTS[tx.acc].name,
        type:FIN_CATS[tx.ci].type, amount:tx.amt, currency:'UAH',
        note:tx.note, date:_demoTsFinance(tx.d),
        projectId:_getProjIdMed(tx.note),
        functionId:_noteToFuncMed(tx.note),
        createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(txOps);

    const regPays = [
        {name:'Оренда приміщення клініки',    type:'expense', amount:45000, day:1,  freq:'monthly', comment:'вул. Медична 12, Київ'},
        {name:'Зарплата адміністраторів',     type:'expense', amount:28000, day:25, freq:'monthly', comment:'2 адміністратори'},
        {name:'Зарплата медсестра старша',    type:'expense', amount:22000, day:25, freq:'monthly', comment:'Тетяна Гончар'},
        {name:'Зарплата бухгалтер',           type:'expense', amount:25000, day:25, freq:'monthly', comment:'Олена Яценко'},
        {name:'Комунальні + електрика',       type:'expense', amount:18000, day:10, freq:'monthly', comment:'Включно з опаленням'},
        {name:'Медична ліцензія (щомісяч.)', type:'expense', amount:710,   day:1,  freq:'monthly', comment:'8 500 грн/рік'},
        {name:'CRM + IT обслуговування',     type:'expense', amount:3500,  day:1,  freq:'monthly', comment:'TALKO System + підтримка'},
        {name:'Реклама Google/Meta',          type:'expense', amount:12000, day:5,  freq:'monthly', comment:'Google Ads + Meta Ads'},
        {name:'Страхування медперсоналу',    type:'expense', amount:5500,  day:1,  freq:'monthly', comment:'Профільне страхування 12 осіб'},
        {name:'ТО медичного обладнання',     type:'expense', amount:8000,  day:15, freq:'monthly', comment:'Контракт з сервісним центром'},
    ];
    await window.safeBatchCommit(regPays.map(r => ({type:'set', ref:cr.collection('finance_recurring').doc(), data:{
        name:r.name, type:r.type, amount:r.amount, currency:'UAH',
        category:r.comment, frequency:r.freq, dayOfMonth:r.day,
        counterparty:'', comment:r.comment, accountId:'',
        active:true, createdAt:now, updatedAt:now,
    }})));

    const finCatSnap = await cr.collection('finance_categories').get();
    const finCatMap = {};
    finCatSnap.docs.forEach(d => { finCatMap[d.data().name] = d.id; });
    const budgetMonths = [
        {month:_demoDate(-30).slice(0,7), goal:640000},
        {month:_demoDate(0).slice(0,7),   goal:720000},
        {month:_demoDate(30).slice(0,7),  goal:800000},
    ];
    await window.safeBatchCommit(budgetMonths.map(bm => ({type:'set', ref:cr.collection('finance_budgets').doc(bm.month), data:{
        month:bm.month, goal:bm.goal,
        ...(finCatMap['Медикаменти та матеріали']    ? {['cat_'+finCatMap['Медикаменти та матеріали']]: 55000} : {}),
        ...(finCatMap['Зарплата персоналу']          ? {['cat_'+finCatMap['Зарплата персоналу']]:       220000} : {}),
        ...(finCatMap['Реклама / Маркетинг']         ? {['cat_'+finCatMap['Реклама / Маркетинг']]:       12000} : {}),
        ...(finCatMap['Оренда приміщення']           ? {['cat_'+finCatMap['Оренда приміщення']]:          45000} : {}),
        updatedAt:now,
    }})));

    // ── 11. СКЛАД ────────────────────────────────────────────
    const STOCK = [
        {name:'Рукавиці нітрилові M (пачка 100шт)', sku:'GLV-NIT-M',   cat:'Захист',        unit:'пачка', qty:5,   min:10, price:180},
        {name:'Шприці 5мл (упаковка 100шт)',         sku:'SYR-5ML',    cat:'Ін\'єкції',     unit:'упак',  qty:20,  min:50, price:145},
        {name:'Маски медичні (упаковка 50шт)',        sku:'MASK-MED',   cat:'Захист',        unit:'упак',  qty:35,  min:20, price:95},
        {name:'Бинт стерильний 10×10 (упак)',         sku:'BND-STER',   cat:'Перев\'язка',   unit:'упак',  qty:42,  min:25, price:125},
        {name:'Антисептик 500мл (флакон)',            sku:'ANTISEP-5',  cat:'Антисептики',   unit:'флак',  qty:28,  min:15, price:210},
        {name:'Катетер венозний G20 (шт)',            sku:'CAT-G20',    cat:'Ін\'єкції',     unit:'шт',    qty:85,  min:40, price:85},
        {name:'Тест-смужки глюкоза (упак 50шт)',      sku:'STRIP-GLUC', cat:'Діагностика',   unit:'упак',  qty:18,  min:10, price:320},
        {name:'Ампули NaCl 200мл (шт)',               sku:'NACL-200',   cat:'Розчини',       unit:'шт',    qty:120, min:60, price:48},
        {name:'Пластир медичний (рулон 5м)',           sku:'PLSTR-5M',   cat:'Перев\'язка',   unit:'рулон', qty:22,  min:15, price:65},
        {name:'Рукавиці латексні S (пачка 100шт)',    sku:'GLV-LAT-S',  cat:'Захист',        unit:'пачка', qty:12,  min:10, price:155},
    ];
    const itemRefs = [];
    for (const s of STOCK) {
        const iRef = cr.collection('warehouse_items').doc();
        itemRefs.push(iRef);
        ops.push({type:'set', ref:iRef, data:{name:s.name, sku:s.sku, category:s.cat, unit:s.unit, minStock:s.min, costPrice:s.price, niche:'medical', createdAt:now}});
        ops.push({type:'set', ref:cr.collection('warehouse_stock').doc(iRef.id), data:{itemId:iRef.id, itemName:s.name, qty:s.qty, reserved:0, available:s.qty, updatedAt:now}});
    }
    await window.safeBatchCommit(ops); ops = [];

    try {
        const oldLocs = await cr.collection('warehouse_locations').get();
        if (!oldLocs.empty) await window.safeBatchCommit(oldLocs.docs.map(d => ({type:'delete', ref:d.ref})));
    } catch(e) {}
    const locDefs = [
        {name:'Центральний медсклад',      type:'warehouse', isDefault:true},
        {name:'Маніпуляційний кабінет',    type:'room',      isDefault:false},
        {name:'Хірургічне відділення',     type:'room',      isDefault:false},
    ];
    const locRefs = locDefs.map(() => cr.collection('warehouse_locations').doc());
    await window.safeBatchCommit(locDefs.map((l, i) => ({type:'set', ref:locRefs[i], data:{name:l.name, type:l.type, isDefault:l.isDefault, deleted:false, createdAt:now, updatedAt:now}})));

    await window.safeBatchCommit([
        {name:'МедТехнолоджі',     phone:'+380442225501', email:'sales@medtech.ua',   url:'medtech.ua',      note:'Витратні матеріали оптом. Доставка 1-2 дні.'},
        {name:'Фармацевтик Плюс', phone:'+380442225502', email:'orders@pharmaplus.ua',url:'pharmaplus.ua',   note:'Медикаменти та препарати. Є сертифікати.'},
        {name:'Steris Ukraine',   phone:'+380672225503', email:'steris@steris.ua',    url:'steris.com',      note:'Стерилізаційне обладнання та витратні матеріали.'},
        {name:'BD Medical',       phone:'+380442225504', email:'bd@bdmedical.ua',     url:'bd.com/ua',       note:'Шприці, катетери, системи для ін\'єкцій.'},
        {name:'Medline Ukraine',  phone:'+380672225505', email:'medline@medline.ua',  url:'medline.ua',      note:'Перев\'язка, хірургічні матеріали, захист.'},
    ].map(s => ({type:'set', ref:cr.collection('warehouse_suppliers').doc(), data:{...s, deleted:false, createdAt:now, updatedAt:now}})));

    // Операції IN/OUT/TRANSFER
    const itemsSnap = await cr.collection('warehouse_items').get();
    const itemData  = itemsSnap.docs.map(d => ({id:d.id, name:d.data().name}));
    const whOps = [
        ...itemData.slice(0,5).map((item, i) => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:item.id, type:'IN', qty:[20,50,30,25,15][i], price:[180,145,95,125,210][i], totalPrice:0, note:`Надходження — ${item.name.split(' ').slice(0,3).join(' ')}`, date:_demoDate(-4), createdBy:uid, createdAt:_demoTs(-4)}})),
        ...itemData.slice(0,6).map((item, i) => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:item.id, type:'OUT', qty:[5,15,10,8,6,20][i], price:[180,145,95,125,210,85][i], totalPrice:0, note:`Видача у відділення — ${['маніпуляційний','хірургічне','маніпуляційний','маніпуляційний','хірургічне','хірургічне'][i]}`, date:_demoDate(-2), createdBy:uid, createdAt:_demoTs(-2)}})),
        {type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:itemData[0]?.id, type:'TRANSFER', qty:10, note:'Рукавиці: центральний склад → хірургічне відділення', fromLocationId:locRefs[0].id, toLocationId:locRefs[2].id, date:_demoDate(-3), createdBy:uid, createdAt:_demoTs(-3)}},
        {type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:itemData[4]?.id, type:'TRANSFER', qty:8, note:'Антисептик: центральний склад → маніпуляційний кабінет', fromLocationId:locRefs[0].id, toLocationId:locRefs[1].id, date:_demoDate(-1), createdBy:uid, createdAt:_demoTs(-1)}},
    ];
    whOps.forEach(o => { if (o.data.totalPrice === 0) o.data.totalPrice = (o.data.qty || 0) * (o.data.price || 0); });
    if (whOps.length) await window.safeBatchCommit(whOps);

    const invMonth = _demoDate(-15).slice(0,7);
    const invItems = itemData.slice(0,8).map((item, i) => {
        const expected = [5,20,35,42,28,85,18,120][i] || 10;
        const actual   = expected + [-1,0,2,-1,0,3,-2,0][i];
        return {itemId:item.id, itemName:item.name, expected, actual, diff:actual-expected};
    });
    await window.safeBatchCommit([{type:'set', ref:cr.collection('warehouse_inventories').doc(), data:{locationId:locRefs[0].id, month:invMonth, items:invItems, status:'confirmed', createdBy:uid, createdAt:_demoTs(-15), updatedAt:_demoTs(-15)}}]);

    // ── 12. СТАНДАРТИ (4) ────────────────────────────────────
    const STD_DEFS = [
        {
            name:'Стандарт першого прийому пацієнта',
            functionId:fRefs[2].id,
            checklist:['Перевірити запис пацієнта в системі','Виміряти тиск і температуру до входу до лікаря','Зібрати повний анамнез (скарги, алергії, ліки)','Занести дані в медичну картку','Лікар проводить огляд і ставить попередній діагноз','Видати направлення на необхідні аналізи','Призначити повторний візит або лікування','Запросити відгук після візиту'],
            acceptanceCriteria:['Картка заповнена повністю','Пацієнт отримав план лікування або направлення','Оплата проведена і чек виданий'],
            instructionsHtml:'<p>Перший прийом формує враження пацієнта про клініку. Ввічливість, пунктуальність та уважність обов\'язкові.</p>',
        },
        {
            name:'Стандарт роботи зі скаргою пацієнта',
            functionId:fRefs[6].id,
            checklist:['Прийняти скаргу спокійно, без виправдань','Зареєструвати скаргу в системі протягом 1 години','Повідомити головлікаря того ж дня','Призначити зустріч з пацієнтом протягом 24 годин','Провести внутрішнє розслідування','Запропонувати компенсацію або безкоштовний повторний прийом'],
            acceptanceCriteria:['Відповідь пацієнту протягом 24 годин','Скарга зареєстрована і закрита','Пацієнт підписав акт вирішення або отримав компенсацію'],
            instructionsHtml:'<p>Скарга — шанс утримати пацієнта і покращити клініку. Не виправдовуватись, слухати і вирішувати.</p>',
        },
        {
            name:'Стандарт виписки та контрольного огляду',
            functionId:fRefs[3].id,
            checklist:['Роздрукувати виписку з призначеннями','Пояснити пацієнту усно план лікування','Записати пацієнта на контрольний огляд','Зателефонувати через 7 днів для перевірки стану','Занести результат контролю в картку'],
            acceptanceCriteria:['Пацієнт записаний на контрольний огляд','Контрольний дзвінок проведено','Результат зафіксований в системі'],
            instructionsHtml:'<p>Контрольний огляд — основа повторних відвідувань. 70% повторних візитів приходять через системний контроль.</p>',
        },
        {
            name:'Стандарт стерилізації та безпеки',
            functionId:fRefs[6].id,
            checklist:['Стерилізувати інструменти після кожного пацієнта','Перевірити дату стерилізації до використання','Використовувати рукавички при будь-якому контакті','Утилізувати гострі відходи у спеціальні контейнери','Вести журнал стерилізації щодня','Перевіряти стерилізатор щотижня','Проводити навчання персоналу кожні 3 місяці'],
            acceptanceCriteria:['Журнал стерилізації заповнений','Всі інструменти мають марковані дати','Жодного порушення при перевірці МОЗ'],
            instructionsHtml:'<p>Безпека пацієнтів — пріоритет №1. Жодних компромісів зі стерилізацією.</p>',
        },
    ];
    await window.safeBatchCommit(STD_DEFS.map(s => ({type:'set', ref:cr.collection('workStandards').doc(), data:{
        name:s.name, functionId:s.functionId, checklist:s.checklist,
        acceptanceCriteria:s.acceptanceCriteria, instructionsHtml:s.instructionsHtml,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})));

    // ── 13. КООРДИНАЦІЇ (4) ──────────────────────────────────
    const COORDS = [
        {name:'Щоденний обхід лікарів',      type:'daily',      chairmanId:sRefs[0].id, participantIds:[sRefs[0].id,sRefs[2].id,sRefs[3].id,sRefs[4].id,sRefs[8].id], schedule:{day:null,time:'08:00'}, agendaItems:['execution','tasks'],
         dynamicAgenda:[{id:'da1',text:'Стан пацієнта Бойко після операції — потрібне рішення по виписці',authorId:sRefs[4].id,createdAt:new Date().toISOString()}]},
        {name:'Тижнева клінічна нарада',      type:'weekly',     chairmanId:sRefs[0].id, participantIds:sRefs.slice(0,10).map(s=>s.id), schedule:{day:1,time:'09:00'}, agendaItems:['stats','execution','reports','questions','tasks'],
         dynamicAgenda:[{id:'da2',text:'Новий протокол антикоагулянтної терапії — Марина Лисенко',authorId:sRefs[3].id,createdAt:new Date().toISOString()},{id:'da3',text:'Скарга пацієнта Литвиненко — статус розгляду',authorId:sRefs[0].id,createdAt:new Date().toISOString()}]},
        {name:'Оперативка адміністрації',     type:'weekly',     chairmanId:sRefs[1].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[10].id,sRefs[11].id], schedule:{day:3,time:'14:00'}, agendaItems:['reports','questions','tasks'],
         dynamicAgenda:[{id:'da4',text:'Затримка постачальника медматеріалів — МедТехнолоджі',authorId:sRefs[9].id,createdAt:new Date().toISOString()}]},
        {name:'Рада власника — підсумки тижня',type:'council_own',chairmanId:sRefs[0].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[10].id], schedule:{day:5,time:'17:00'}, agendaItems:['stats','execution','reports','decisions'],
         dynamicAgenda:[]},
    ];
    const coordRefs = COORDS.map(() => cr.collection('coordinations').doc());
    await window.safeBatchCommit(COORDS.map((c, i) => ({type:'set', ref:coordRefs[i], data:{
        name:c.name, type:c.type, chairmanId:c.chairmanId, participantIds:c.participantIds,
        schedule:c.schedule, status:'active', agendaItems:c.agendaItems, dynamicAgenda:c.dynamicAgenda,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})));

    const coordSnap = await cr.collection('coordinations').get();
    const coordDocs = coordSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const obhidCoord   = coordDocs.find(c => c.name && c.name.includes('обхід'));
    const clinicCoord  = coordDocs.find(c => c.name && c.name.includes('клінічна'));
    const ownerCoord   = coordDocs.find(c => c.name && c.name.includes('власника'));

    const sessionOps = [];
    if (obhidCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:obhidCoord.id, coordName:obhidCoord.name, coordType:'daily',
        startedAt:new Date(Date.now()-2*86400000).toISOString(),
        finishedAt:new Date(Date.now()-2*86400000+15*60000).toISOString(),
        decisions:[
            {text:'Пацієнта Бойко виписати в четвер — стан стабільний', taskId:'', authorId:uid},
            {text:'Замовити катетери G20 — залишок критичний', taskId:'', authorId:uid},
            {text:'Нові протоколи антикоагулянтів — Василь впроваджує з понеділка', taskId:'', authorId:uid},
        ],
        unresolved:[], agendaDone:['Стан пацієнтів','Пріоритети дня'],
        dynamicAgendaItems:[], notes:'Обхід пройшов без ускладнень.',
        conductedBy:uid, participantIds:sRefs.slice(0,5).map(s=>s.id), taskSnapshot:[], createdAt:_demoTs(-2),
    }});

    if (clinicCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:clinicCoord.id, coordName:clinicCoord.name, coordType:'weekly',
        startedAt:new Date(Date.now()-7*86400000).toISOString(),
        finishedAt:new Date(Date.now()-7*86400000+45*60000).toISOString(),
        decisions:[
            {text:'Впровадити новий протокол лікування гіпертонії — Василь готує до п\'ятниці', taskId:'', authorId:uid},
            {text:'Закупити УЗД гель — запас на 3 дні', taskId:'', authorId:uid},
            {text:'Відпустки: Андрій Мороз — 15-29 квітня, заміна — зовнішній хірург', taskId:'', authorId:uid},
            {text:'Наталія Ткач — сертифікація лазерної косметології до 1 квітня', taskId:'', authorId:uid},
            {text:'Звіт МОЗ — Оксана здає до 28-го, не допустити простроченого знову', taskId:'', authorId:uid},
        ],
        unresolved:[{text:'Затримка постачальника МедТехнолоджі — шприці не прийшли 3 дні', authorId:uid, addedAt:new Date(Date.now()-7*86400000).toISOString()}],
        agendaDone:['Стан пацієнтів','KPI тижня','Постачання','Плани відпусток'],
        dynamicAgendaItems:[{text:'Скарга Литвиненко — статус?',authorId:uid,addedAt:new Date(Date.now()-8*86400000).toISOString()}],
        notes:'Завантаженість УЗД критична — потрібен другий апарат або додатковий час.',
        conductedBy:uid, participantIds:sRefs.slice(0,10).map(s=>s.id), taskSnapshot:[], createdAt:_demoTs(-7),
    }});

    if (ownerCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:ownerCoord.id, coordName:ownerCoord.name, coordType:'council_own',
        startedAt:new Date(Date.now()-8*86400000).toISOString(),
        finishedAt:new Date(Date.now()-8*86400000+60*60000).toISOString(),
        decisions:[
            {text:'Бюджет косметологічного кабінету затверджений — 600 000 грн', taskId:'', authorId:uid},
            {text:'Нова страхова АХА — укласти договір на 180 застрахованих', taskId:'', authorId:uid},
            {text:'Підняти прайс на 10% з 1 квітня — ринок зріс', taskId:'', authorId:uid},
            {text:'Найняти 2-го терапевта до 1 травня — черги неприпустимі', taskId:'', authorId:uid},
        ],
        unresolved:[], agendaDone:['Фінансові підсумки','Стратегія','Кадри','Ціноутворення'],
        dynamicAgendaItems:[],
        notes:'Березень — рекордний місяць. Косметологія відкривається вчасно.',
        conductedBy:uid, participantIds:[uid,sRefs[1].id,sRefs[10].id], taskSnapshot:[], createdAt:_demoTs(-8),
    }});

    if (sessionOps.length) await window.safeBatchCommit(sessionOps);

    // ── 14. БРОНЮВАННЯ ───────────────────────────────────────
    const bookingCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookingCalRef, data:{
            name:'Запис до лікаря — первинний прийом',
            slug:'medikopro-zapis',
            ownerName:STAFF[1].name, ownerId:sRefs[1].id,
            duration:30, bufferBefore:5, bufferAfter:10,
            timezone:'Europe/Kiev', confirmationType:'manual',
            color:'#3b82f6',
            location:'МедікаПро, вул. Медична 12, Київ',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1', text:'Опишіть ваші скарги',                       type:'text',   required:true},
                {id:'q2', text:'До якого лікаря хочете записатись?',         type:'text',   required:false},
                {id:'q3', text:'Ви вже були пацієнтом нашої клініки?',       type:'select', required:false, options:['Перший раз','Так, був(ла) раніше']},
                {id:'q4', text:'Зручний час (ранок 8-12 / день 12-16 / вечір 16-20)',type:'text', required:false},
            ],
            maxBookingsPerSlot:1, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookingCalRef.id), data:{
            weeklyHours:{
                mon:[{start:'08:00',end:'20:00'}], tue:[{start:'08:00',end:'20:00'}],
                wed:[{start:'08:00',end:'20:00'}], thu:[{start:'08:00',end:'20:00'}],
                fri:[{start:'08:00',end:'20:00'}], sat:[{start:'09:00',end:'16:00'}],
                sun:[],
            },
            dateOverrides:{}, updatedAt:now,
        }},
    ]);

    const apptDefs = [
        {name:'Іваненко Олег',     phone:'+380671220002', email:'ivanenko@gmail.com',  date:_demoDate(1),  time:'09:30', status:'confirmed',  note:'Результати аналізів. Прийом терапевта.'},
        {name:'Шевченко Олег',     phone:'+380671220020', email:'shevchenko@ukr.net',  date:_demoDate(1),  time:'11:00', status:'confirmed',  note:'Первинний прийом. Скарги на серце.'},
        {name:'Гриценко Ірина',    phone:'+380671220011', email:'grytsenko@gmail.com', date:_demoDate(2),  time:'14:30', status:'confirmed',  note:'До ортопеда Романенка. Болі в спині.'},
        {name:'Данченко Наталія',  phone:'+380671221030', email:'danchenko@gmail.com', date:_demoDate(3),  time:'10:00', status:'pending',    note:'Гінеколог. Першовізитна консультація.'},
        {name:'Мороз Андрій В.',   phone:'+380671221031', email:'moroz2@ukr.net',      date:_demoDate(4),  time:'16:00', status:'pending',    note:'VIP щорічний огляд. Комплекс.'},
        {name:'Литвиненко Сергій', phone:'+380671221032', email:'lytvyn@gmail.com',    date:_demoDate(5),  time:'09:00', status:'pending',    note:'Контрольний огляд після скарги.'},
        {name:'Бойко Петро',       phone:'+380671220010', email:'boyko@ukr.net',        date:_demoDate(-3), time:'10:30', status:'confirmed',  note:'Постоп контроль — апендектомія.'},
        {name:'Марченко Леся',     phone:'+380671221033', email:'marchenko@gmail.com',  date:_demoDate(-7), time:'13:00', status:'confirmed',  note:'Повторний прийом — терапія закінчена.'},
    ];
    await window.safeBatchCommit(apptDefs.map(a => ({type:'set', ref:cr.collection('booking_appointments').doc(), data:{
        calendarId:bookingCalRef.id,
        calendarName:'Запис до лікаря — первинний прийом',
        guestName:a.name, guestPhone:a.phone, guestEmail:a.email,
        date:a.date, startTime:a.time,
        endTime:(parseInt(a.time.split(':')[0])+(a.time.split(':')[1]==='30'?1:0)).toString().padStart(2,'0')+':'+(a.time.split(':')[1]==='30'?'00':'30'),
        status:a.status, note:a.note,
        answers:[{questionId:'q1',answer:a.note},{questionId:'q3',answer:'Так, був(ла) раніше'}],
        createdAt:_demoTs(-Math.floor(Math.random()*7+1)), updatedAt:now,
    }})));

    // ── 15. МЕТРИКИ ──────────────────────────────────────────
    const METRICS = [
        // Щотижневі (15)
        {name:'Виручка тижня',                    unit:'грн',  cat:'Фінанси',    freq:'weekly',  value:168000, trend:8.0,   int:false, desc:'Загальна виручка від прийомів, процедур та корпоративних клієнтів за тиждень. Ціль: 180 000 грн.'},
        {name:'Нових пацієнтів',                  unit:'шт',   cat:'Продажі',    freq:'weekly',  value:22,     trend:10.0,  int:true,  desc:'Пацієнти, що прийшли вперше. Показник ефективності маркетингу. Ціль: 25/тиждень.'},
        {name:'Повторних візитів',                unit:'шт',   cat:'Якість',     freq:'weekly',  value:72,     trend:6.0,   int:true,  desc:'Пацієнти, що повернулись на повторний прийом або лікування. Ціль: 80/тиждень.'},
        {name:'Конверсія першого візиту',         unit:'%',    cat:'Продажі',    freq:'weekly',  value:61,     trend:5.0,   int:false, desc:'% пацієнтів після первинного огляду що продовжили лікування. Ціль: 65%.'},
        {name:'Середній час очікування',          unit:'хв',   cat:'Якість',     freq:'weekly',  value:18,     trend:-12.0, int:false, desc:'Середній час від запису до входу в кабінет. Ціль: менше 15 хвилин. Менше — краще.'},
        {name:'Завантаженість лікарів',           unit:'%',    cat:'Операційні', freq:'weekly',  value:82,     trend:4.0,   int:false, desc:'% заповнення розкладу лікарів від максимально можливого. Ціль: 85%.'},
        {name:'Виконання задач вчасно',           unit:'%',    cat:'Управління', freq:'weekly',  value:84,     trend:5.0,   int:false, desc:'% задач виконаних в дедлайн. Показник дисципліни команди. Ціль: 90%.'},
        {name:'Прострочені задачі',               unit:'шт',   cat:'Управління', freq:'weekly',  value:4,      trend:-20.0, int:true,  desc:'Кількість задач з порушеним дедлайном. Ціль: 0. Кожна — ризик для пацієнтів.'},
        {name:'Записів на прийом',                unit:'шт',   cat:'Продажі',    freq:'weekly',  value:112,    trend:7.0,   int:true,  desc:'Нові записи через телефон, сайт та онлайн-форму. Ціль: 120/тиждень.'},
        {name:'Скасованих записів',               unit:'шт',   cat:'Якість',     freq:'weekly',  value:6,      trend:-8.0,  int:true,  desc:'Пацієнти що скасували запис. Ціль: менше 5. Менше — краще.'},
        {name:'Скарг від пацієнтів',              unit:'шт',   cat:'Якість',     freq:'weekly',  value:1,      trend:-15.0, int:true,  desc:'Офіційних скарг або негативних відгуків. Ціль: 0. Кожна — сигнал для аналізу.'},
        {name:'Аналізів виконано',                unit:'шт',   cat:'Операційні', freq:'weekly',  value:185,    trend:8.0,   int:true,  desc:'Лабораторних аналізів виконано в лабораторії. Ціль: 200/тиждень.'},
        {name:'УЗД-досліджень',                   unit:'шт',   cat:'Операційні', freq:'weekly',  value:36,     trend:5.0,   int:true,  desc:'УЗД досліджень проведено. Ціль: 40/тиждень. Лімітуючий фактор — 1 апарат.'},
        {name:'Задач повернуто на доробку',       unit:'шт',   cat:'Управління', freq:'weekly',  value:2,      trend:-10.0, int:true,  desc:'Задач відхилених з перевірки. Ціль: менше 2. Показник якості виконання.'},
        {name:'Дзвінків без відповіді',           unit:'шт',   cat:'Продажі',    freq:'weekly',  value:3,      trend:-18.0, int:true,  desc:'Дзвінки від пацієнтів що залишились без відповіді. Ціль: 0. Кожен — втрачений пацієнт.'},

        // Щомісячні — фінансові (першими, 8)
        {name:'Виручка місяць',                   unit:'грн',  cat:'Фінанси',    freq:'monthly', value:680000, trend:12.0,  int:false, desc:'Загальна виручка клініки за місяць. Ціль: 720 000 грн.'},
        {name:'Чистий прибуток',                  unit:'грн',  cat:'Фінанси',    freq:'monthly', value:195000, trend:8.0,   int:false, desc:'Виручка мінус всі витрати. Ціль: 180 000 грн.'},
        {name:'Маржинальність',                   unit:'%',    cat:'Фінанси',    freq:'monthly', value:28.7,   trend:3.0,   int:false, desc:'Чистий прибуток / Виручка. Норма для клініки: 25-35%.'},
        {name:'Середній чек візиту',              unit:'грн',  cat:'Фінанси',    freq:'monthly', value:820,    trend:6.0,   int:false, desc:'Середній дохід з одного візиту. Ціль: 850 грн.'},
        {name:'Витрати медикаменти',              unit:'грн',  cat:'Фінанси',    freq:'monthly', value:68000,  trend:4.0,   int:false, desc:'Витрати на медикаменти та витратні матеріали. Норма: до 10% від виручки.'},
        {name:'Витрати зарплата',                 unit:'грн',  cat:'Фінанси',    freq:'monthly', value:285000, trend:2.0,   int:false, desc:'Фонд оплати праці всього персоналу. Норма для клініки: 35-45% від виручки.'},
        {name:'Дебіторська заборгованість',       unit:'грн',  cat:'Фінанси',    freq:'monthly', value:145000, trend:-5.0,  int:false, desc:'Заборгованість страхових компаній та корпоративних клієнтів. Контролювати щомісяця.'},
        {name:'Виручка корпоративні клієнти',    unit:'грн',  cat:'Фінанси',    freq:'monthly', value:185000, trend:15.0,  int:false, desc:'Дохід від корпоративних програм і ДМС. Стратегічний напрямок розвитку.'},

        // Операційні (8)
        {name:'Пацієнтів обслужено',              unit:'шт',   cat:'Операційні', freq:'monthly', value:820,    trend:6.0,   int:true,  desc:'Загальна кількість візитів за місяць. Ціль: 850 пацієнтів.'},
        {name:'Нових пацієнтів',                  unit:'шт',   cat:'Операційні', freq:'monthly', value:88,     trend:8.0,   int:true,  desc:'Нові пацієнти за місяць. Ціль: 100/міс. Основа зростання.'},
        {name:'Повторних клієнтів',               unit:'%',    cat:'Операційні', freq:'monthly', value:67,     trend:4.0,   int:false, desc:'% пацієнтів що повернулись повторно. Ціль: 70%. Показник лояльності.'},
        {name:'NPS пацієнтів',                    unit:'бали', cat:'Якість',     freq:'monthly', value:78,     trend:5.0,   int:false, desc:'Net Promoter Score. Ціль: 85+. Відмінно: 80+. Нижче 50 — критично.'},
        {name:'Час від запису до прийому',        unit:'дні',  cat:'Якість',     freq:'monthly', value:2.4,    trend:-8.0,  int:false, desc:'Середній час очікування на прийом у днях. Ціль: менше 2 днів. Менше — краще.'},
        {name:'Відсоток no-show',                 unit:'%',    cat:'Якість',     freq:'monthly', value:9.2,    trend:-6.0,  int:false, desc:'% пацієнтів що не прийшли без попередження. Ціль: менше 8%. Менше — краще.'},
        {name:'Корпоративних клієнтів',           unit:'шт',   cat:'Продажі',    freq:'monthly', value:5,      trend:20.0,  int:true,  desc:'Активних корпоративних договорів та ДМС партнерств.'},
        {name:'Виконання плану по лікарях',       unit:'%',    cat:'Операційні', freq:'monthly', value:81,     trend:3.0,   int:false, desc:'Середній % виконання особистого плану прийомів лікарями.'},

        // Якість та безпека (5)
        {name:'Ускладнень після процедур',        unit:'шт',   cat:'Якість',     freq:'monthly', value:0,      trend:0.0,   int:true,  desc:'Клінічних ускладнень після маніпуляцій та операцій. Ціль: 0. Абсолютний показник безпеки.'},
        {name:'Помилок медикації',                unit:'шт',   cat:'Якість',     freq:'monthly', value:0,      trend:0.0,   int:true,  desc:'Помилок при введенні або видачі медикаментів. Ціль: 0. Нуль відхилень неприйнятний.'},
        {name:'Скарг від пацієнтів',              unit:'шт',   cat:'Якість',     freq:'monthly', value:1,      trend:-10.0, int:true,  desc:'Офіційних скарг за місяць. Ціль: 0. Кожна розглядається на наступній нараді.'},
        {name:'Позитивних відгуків',              unit:'шт',   cat:'Якість',     freq:'monthly', value:28,     trend:12.0,  int:true,  desc:'Google/Trustpilot/особисті відгуки. Ціль: 30+/місяць.'},
        {name:'Явок на контрольний огляд',        unit:'%',    cat:'Якість',     freq:'monthly', value:72,     trend:6.0,   int:false, desc:'% пацієнтів що прийшли на призначений контрольний огляд. Ціль: 80%.'},

        // 18 чекпоїнтів
        {name:'01 Перевірка запису пацієнта',     unit:'%', cat:'Чекпоїнти', freq:'monthly', value:94, trend:2.0, int:false, desc:'% прийомів де адміністратор підтвердив запис в системі до початку прийому.'},
        {name:'02 Підтвердження за 24 год',       unit:'%', cat:'Чекпоїнти', freq:'monthly', value:88, trend:4.0, int:false, desc:'% пацієнтів що отримали підтвердження запису за 24 години. Зменшує no-show.'},
        {name:'03 Анамнез заповнений',            unit:'%', cat:'Чекпоїнти', freq:'monthly', value:91, trend:3.0, int:false, desc:'% прийомів з повністю заповненим анамнезом в медкарті.'},
        {name:'04 Протокол лікування підписаний', unit:'%', cat:'Чекпоїнти', freq:'monthly', value:85, trend:5.0, int:false, desc:'% виписок де протокол лікування підписаний лікарем і пацієнтом.'},
        {name:'05 Направлення на аналізи',        unit:'%', cat:'Чекпоїнти', freq:'monthly', value:82, trend:3.0, int:false, desc:'% профільних прийомів де видане направлення на аналізи або УЗД.'},
        {name:'06 Результати в системі',          unit:'%', cat:'Чекпоїнти', freq:'monthly', value:89, trend:6.0, int:false, desc:'% аналізів де результати внесені в систему протягом 24 годин.'},
        {name:'07 Рекомендації видані письмово',  unit:'%', cat:'Чекпоїнти', freq:'monthly', value:78, trend:8.0, int:false, desc:'% пацієнтів що отримали письмові рекомендації після прийому.'},
        {name:'08 Контрольний дзвінок',           unit:'%', cat:'Чекпоїнти', freq:'monthly', value:68, trend:12.0,int:false, desc:'% пацієнтів що отримали дзвінок через 7 днів після лікування.'},
        {name:'09 Пацієнт записаний повторно',    unit:'%', cat:'Чекпоїнти', freq:'monthly', value:65, trend:5.0, int:false, desc:'% пацієнтів що записались на повторний прийом до виходу з клініки.'},
        {name:'10 Оплата проведена',              unit:'%', cat:'Чекпоїнти', freq:'monthly', value:99, trend:1.0, int:false, desc:'% прийомів де оплата проведена і зафіксована в системі.'},
        {name:'11 Чек виданий',                   unit:'%', cat:'Чекпоїнти', freq:'monthly', value:98, trend:1.0, int:false, desc:'% прийомів де пацієнту виданий фіскальний чек або квитанція.'},
        {name:'12 Відгук запитаний',              unit:'%', cat:'Чекпоїнти', freq:'monthly', value:72, trend:10.0,int:false, desc:'% пацієнтів у яких запитали відгук після прийому.'},
        {name:'13 Стерилізація інструментів',     unit:'%', cat:'Чекпоїнти', freq:'monthly', value:100,trend:0.0, int:false, desc:'% кабінетів де журнал стерилізації заповнений щодня без пропусків.'},
        {name:'14 Медикаменти списані правильно',  unit:'%', cat:'Чекпоїнти', freq:'monthly', value:93, trend:3.0, int:false, desc:'% медикаментів що були списані з відповідним документальним підтвердженням.'},
        {name:'15 Звітність здана',               unit:'%', cat:'Чекпоїнти', freq:'monthly', value:80, trend:6.0, int:false, desc:'% обов\'язкових звітів зданих вчасно (МОЗ, статистика, страхові).'},
        {name:'16 Навчання персоналу',            unit:'%', cat:'Чекпоїнти', freq:'monthly', value:75, trend:8.0, int:false, desc:'% персоналу що пройшли запланований місячний тренінг або навчання.'},
        {name:'17 Обладнання перевірено',         unit:'%', cat:'Чекпоїнти', freq:'monthly', value:88, trend:4.0, int:false, desc:'% одиниць медичного обладнання що пройшли щомісячний технічний огляд.'},
        {name:'18 Ліцензії актуальні',            unit:'%', cat:'Чекпоїнти', freq:'monthly', value:92, trend:2.0, int:false, desc:'% медичних ліцензій та дозволів з актуальним терміном дії.'},
    ];

    const mOps = [];
    for (const m of METRICS) {
        const mRef = cr.collection('metrics').doc();
        const freq = m.freq || 'weekly';
        mOps.push({type:'set', ref:mRef, data:{
            name:m.name, unit:m.unit, category:m.cat, frequency:freq,
            scope:'company', scopeType:'company',
            description:m.desc, formula:'', inputType:'manual',
            importance:'critical', createdBy:uid, createdAt:now, updatedAt:now,
        }});
        const periods = freq === 'weekly' ? 12 : 8;
        for (let p = 0; p < periods; p++) {
            const trendFactor = 1 - (m.trend || 0) / 100 * p / periods;
            const noiseScale = m.value > 10000 ? 0.06 : (m.int ? 0.15 : 0.08);
            const noise = (Math.random() - 0.5) * noiseScale;
            const rawVal = m.value * trendFactor * (1 + noise);
            let val;
            if (m.int) val = Math.max(0, Math.round(rawVal));
            else if (m.unit === '%' || m.unit === 'бали') val = Math.min(100, Math.max(0, Math.round(rawVal * 10) / 10));
            else val = Math.max(0, Math.round(rawVal * 10) / 10);
            const entryRef = cr.collection('metricEntries').doc();
            const d = new Date();
            let pk;
            if (freq === 'monthly') {
                d.setMonth(d.getMonth() - p);
                pk = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
            } else {
                d.setDate(d.getDate() - p * 7);
                d.setHours(12,0,0,0);
                const dow = d.getDay() || 7;
                d.setDate(d.getDate() - dow + 4);
                const j1 = new Date(d.getFullYear(), 0, 1);
                const wn = Math.ceil(((d - j1) / 864e5 + j1.getDay() + 1) / 7);
                pk = d.getFullYear() + '-W' + String(wn).padStart(2,'0');
            }
            mOps.push({type:'set', ref:entryRef, data:{
                metricId:mRef.id, metricName:m.name, unit:m.unit,
                value:val, periodKey:pk || '', frequency:freq,
                scope:'company', scopeType:'company',
                note:'', enteredBy:uid, createdBy:uid, createdAt:now,
            }});
        }
    }
    await window.safeBatchCommit(mOps);

    // KPI цілі
    const mSnap = await cr.collection('metrics').get();
    const mMap = {};
    mSnap.docs.forEach(d => { mMap[d.data().name] = d.id; });
    const KPI_TARGETS = [
        {name:'Виручка тижня',              target:180000, period:'weekly'},
        {name:'Конверсія першого візиту',   target:65,     period:'weekly'},
        {name:'Середній час очікування',    target:15,     period:'weekly'},
        {name:'Записів на прийом',          target:120,    period:'weekly'},
        {name:'NPS пацієнтів',              target:85,     period:'monthly'},
        {name:'Виручка місяць',             target:720000, period:'monthly'},
        {name:'Чистий прибуток',            target:180000, period:'monthly'},
        {name:'Маржинальність',             target:25,     period:'monthly'},
        {name:'Пацієнтів обслужено',        target:850,    period:'monthly'},
    ];
    const curWeek = (() => {
        const d = new Date(); d.setHours(12,0,0,0);
        const dow = d.getDay()||7; d.setDate(d.getDate()-dow+4);
        const j1 = new Date(d.getFullYear(),0,1);
        const wn = Math.ceil(((d-j1)/864e5+j1.getDay()+1)/7);
        return d.getFullYear()+'-W'+String(wn).padStart(2,'0');
    })();
    const curMonth = new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0');
    const tgtOps = [];
    for (const t of KPI_TARGETS) {
        const mid = mMap[t.name];
        if (!mid) continue;
        const pk = t.period === 'monthly' ? curMonth : curWeek;
        for (let p = 0; p < 3; p++) {
            let periodKey = pk;
            if (p > 0) {
                const d2 = new Date();
                if (t.period === 'monthly') { d2.setMonth(d2.getMonth()-p); periodKey = d2.getFullYear()+'-'+String(d2.getMonth()+1).padStart(2,'0'); }
                else { d2.setDate(d2.getDate()-p*7); d2.setHours(12,0,0,0); const dow=d2.getDay()||7; d2.setDate(d2.getDate()-dow+4); const j1=new Date(d2.getFullYear(),0,1); const wn=Math.ceil(((d2-j1)/864e5+j1.getDay()+1)/7); periodKey=d2.getFullYear()+'-W'+String(wn).padStart(2,'0'); }
            }
            tgtOps.push({type:'set', ref:cr.collection('metricTargets').doc(), data:{
                metricId:mid, periodKey, periodType:t.period,
                scope:'company', scopeId:cr.id,
                targetValue:t.target, setBy:uid, createdAt:now,
            }});
        }
    }
    if (tgtOps.length) await window.safeBatchCommit(tgtOps);

    // ── 16. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:           'МедікаПро',
        niche:          'medical',
        nicheLabel:     'Багатопрофільна медична клініка',
        description:    'Діагностика, терапія, хірургія та косметологія в одному місці.',
        city:           'Київ',
        employees:      12,
        currency:       'UAH',
        companyGoal:    'Стати клінікою №1 в місті по NPS та повторним візитам пацієнтів',
        companyConcept: 'Медицина без черг — пацієнт отримує результат, не процес. Від запису до виписки — прозоро, швидко і з турботою. Жоден пацієнт не загублений, жоден дзвінок без відповіді.',
        companyCKP:     'Пацієнт здоровий, повернувся і рекомендував клініку 3 знайомим',
        companyIdeal:   '50 пацієнтів на день, 8 лікарів, кожен знає свій план. Власник бачить NPS, завантаженість і виручку з телефону о 8 ранку. Черг немає, скарг немає, команда працює по стандартах.',
        targetAudience: 'Активні люди 35-60 років з середнім+ доходом в Києві. Цінують час, якість і прозорість. Хочуть знати що з ними відбувається — без черг і "зателефонуйте завтра".',
        avgCheck:       820,
        monthlyRevenue: 680000,
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) {
    window._NICHE_LABELS['medical'] = 'МедікаПро — медична клініка';
}
