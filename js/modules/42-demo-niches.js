// ============================================================
// 42-demo-niches.js — Повні демо-ніші для TALKO
// Меблевий бізнес — максимальна деталізація
// ============================================================
'use strict';

// Патчимо safeBatchCommit щоб автоматично додавав isDemo:true до set операцій
const _origSafeBatch = window.safeBatchCommit;
window.safeBatchCommit = async function(ops, _label) {
    if (!ops || !ops.length) return;
    const markedOps = (ops || []).map(op => {
        if (op.type === 'set' && op.data && !op.data.isDemo) {
            return { ...op, data: { ...op.data, isDemo: true } };
        }
        return op;
    });
    try {
        return await _origSafeBatch(markedOps);
    } catch(e) {
        console.warn('[DemoNiche] batch error', _label || '?', e.message, 'ops sample:', markedOps.slice(0,2).map(o=>o.ref?.path||'?'));
        // Don't rethrow — skip this batch and continue
    }
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
    const sRefs = STAFF.map((s, i) => i === 0 ? cr.collection('users').doc(uid) : cr.collection('users').doc());
    STAFF.forEach((s,i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        if (i === 0) {
            // Власник — зберігаємо реальне ім'я і email, тільки оновлюємо роль
            ops.push({type:'set', ref:sRefs[i], data:{
                role:'owner', position:s.pos,
                functionIds:[], primaryFunctionId:null,
                status:'active', updatedAt:now,
            }, merge:true});
        } else {
            ops.push({type:'set', ref:sRefs[i], data:{
            name:s.name, role:s.role, position:s.pos,
            email: s.name.toLowerCase().replace(/\s+/g,'.') + '@meble.demo',
            functionIds: fid ? [fid] : [],
            primaryFunctionId: fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
        }
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
        // Щотижневі — п\'ятниця
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

    // ── Крок 2: crm_deals з clientId прив\'язаним до crm_clients ──
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
            schedule:{ day:5, time:'17:00' }, // П\'ятниця 17:00
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

    // Транзакції прив\'язані до проєктів
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

    // ── D. ЗАВДАННЯ ПРИВ\'ЯЗАНІ ДО ПРОЄКТІВ ────────────────
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
    // Отримуємо категорії витрат щоб прив\'язати бюджет
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
// 12 осіб, 8 функцій, повний цикл від ліда до здачі об\'єкту
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
    const sRefs = STAFF.map((s, i) => i === 0 ? cr.collection('users').doc(uid) : cr.collection('users').doc());
    STAFF.forEach((s, i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        if (i === 0) {
            // Власник — зберігаємо реальне ім'я і email, тільки оновлюємо роль
            ops.push({type:'set', ref:sRefs[i], data:{
                role:'owner', position:s.pos,
                functionIds:[], primaryFunctionId:null,
                status:'active', updatedAt:now,
            }, merge:true});
        } else {
            ops.push({type:'set', ref:sRefs[i], data:{
            name:s.name, role:s.role, position:s.pos,
            email:s.name.toLowerCase().replace(/['\s]+/g,'.') + '@klinika.demo',
            functionIds:fid ? [fid] : [], primaryFunctionId:fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
        }
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
            functionName:FUNCS[r.fi].name,
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

    // Завдання прив\'язані до проєктів
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

if (window._NICHE_LABELS) window._NICHE_LABELS['medical'] = 'МедікаПро — медична клініка';

// ════════════════════════════════════════════════════════════
// CLEANING COMPANY — cleaning
// "SparkClean Pro" — Commercial & Residential Cleaning, Austin TX
// 12 staff, 8 functions, USD, full cycle from lead to contract
// ════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['cleaning'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];

    // ── 1. FUNCTIONS (8 blocks) ──────────────────────────────
    const FUNCS = [
        { name:'0. Marketing & Lead Generation',  color:'#ec4899', desc:'Ads, SEO, Google reviews, referrals, Instagram, lead tracking and nurturing' },
        { name:'1. Sales & Quoting',              color:'#22c55e', desc:'Inbound calls, walkthroughs, custom quotes, contract negotiation, CRM pipeline' },
        { name:'2. Scheduling & Dispatch',        color:'#3b82f6', desc:'Crew assignment, route planning, calendar management, real-time dispatch' },
        { name:'3. Field Operations',             color:'#f59e0b', desc:'Residential, commercial, move-out, Airbnb turnover cleaning — all field work' },
        { name:'4. Quality Control & Inspections',color:'#8b5cf6', desc:'Post-clean inspections, QC photos, re-clean management, checklist compliance' },
        { name:'5. Finance & Billing',            color:'#ef4444', desc:'Invoicing, payroll, tax payments, insurance, budgeting, P&L reporting' },
        { name:'6. HR & Crew Management',         color:'#0ea5e9', desc:'Hiring, onboarding, training, OSHA compliance, performance reviews, scheduling' },
        { name:'7. Management & Growth',          color:'#374151', desc:'KPIs, strategy, new markets, partnerships, owner-level decisions' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f, i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Michael Torres',
        status:'active', createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // ── 2. TEAM (12 people) ───────────────────────────────────
    try {
        const oldUsers = await cr.collection('users').get();
        if (!oldUsers.empty) {
            const delOps = oldUsers.docs.filter(d => d.id !== uid).map(d => ({type:'delete', ref:d.ref}));
            if (delOps.length) await window.safeBatchCommit(delOps);
        }
    } catch(e) { console.warn('[demo] cleanup users:', e.message); }

    const STAFF = [
        { name:'Michael Torres',   role:'owner',    fi:null, pos:'Owner / CEO' },
        { name:'Jessica Williams', role:'manager',  fi:2,    pos:'Operations Manager' },
        { name:'Amanda Rodriguez', role:'manager',  fi:1,    pos:'Sales & Booking Manager' },
        { name:'Carlos Mendez',    role:'employee', fi:2,    pos:'Lead Crew Supervisor' },
        { name:'Maria Gonzalez',   role:'employee', fi:3,    pos:'Crew Lead #1 — Residential' },
        { name:'James Wilson',     role:'employee', fi:3,    pos:'Crew Lead #2 — Commercial' },
        { name:'Sofia Martinez',   role:'employee', fi:3,    pos:'Crew Lead #3 — Airbnb/Turnover' },
        { name:'Robert Chen',      role:'employee', fi:4,    pos:'QC Inspector' },
        { name:'Emily Davis',      role:'employee', fi:0,    pos:'Customer Success Manager' },
        { name:'Daniel Kim',       role:'employee', fi:5,    pos:'Bookkeeper / Finance' },
        { name:'Lisa Thompson',    role:'employee', fi:6,    pos:'HR Coordinator' },
        { name:'Kevin Brown',      role:'employee', fi:0,    pos:'Marketing Specialist' },
    ];
    const sRefs = STAFF.map((s, i) => i === 0 ? cr.collection('users').doc(uid) : cr.collection('users').doc());
    STAFF.forEach((s, i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        if (i === 0) {
            // Власник — зберігаємо реальне ім'я і email, тільки оновлюємо роль
            ops.push({type:'set', ref:sRefs[i], data:{
                role:'owner', position:s.pos,
                functionIds:[], primaryFunctionId:null,
                status:'active', updatedAt:now,
            }, merge:true});
        } else {
            ops.push({type:'set', ref:sRefs[i], data:{
            name:s.name, role:s.role, position:s.pos,
            email:s.name.toLowerCase().replace(/['\s]+/g,'.') + '@sparkclean.demo',
            functionIds:fid ? [fid] : [], primaryFunctionId:fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
        }
    });
    await window.safeBatchCommit(ops); ops = [];

    const faMap = {
        0:[sRefs[8].id, sRefs[11].id],
        1:[sRefs[2].id],
        2:[sRefs[1].id, sRefs[3].id],
        3:[sRefs[4].id, sRefs[5].id, sRefs[6].id],
        4:[sRefs[7].id],
        5:[sRefs[9].id],
        6:[sRefs[10].id],
        7:[sRefs[0].id],
    };
    const funcAssignOps = [];
    for (const [fi, aids] of Object.entries(faMap)) {
        funcAssignOps.push({type:'update', ref:fRefs[parseInt(fi)], data:{assigneeIds:aids, updatedAt:now}});
    }
    await window.safeBatchCommit(funcAssignOps);

    // ── 3. ESTIMATE NORMS (5) ─────────────────────────────────
    const normDefs = [
        {
            name:'Standard Residential Cleaning (per sqft)',
            category:'residential', inputUnit:'sqft', niche:'cleaning',
            materials:[
                {name:'Cleaner labor (hrs per 100 sqft)', qty:0.15, unit:'hr',     price:22,  coefficient:1},
                {name:'All-purpose cleaner',              qty:0.02, unit:'gallon', price:18,  coefficient:1},
                {name:'Microfiber cloths (use per job)',  qty:0.5,  unit:'pack',   price:12,  coefficient:1},
                {name:'Vacuum bags + supplies',           qty:0.1,  unit:'pack',   price:8,   coefficient:1},
            ],
        },
        {
            name:'Deep Clean Residential (per sqft)',
            category:'residential', inputUnit:'sqft', niche:'cleaning',
            materials:[
                {name:'Cleaner labor — deep (hrs per 100 sqft)', qty:0.28, unit:'hr',     price:22,  coefficient:1},
                {name:'Heavy-duty degreaser',                    qty:0.04, unit:'gallon', price:24,  coefficient:1},
                {name:'Disinfectant spray',                      qty:0.03, unit:'gallon', price:20,  coefficient:1},
                {name:'Scrub brushes (per job)',                 qty:0.2,  unit:'each',   price:6,   coefficient:1},
                {name:'Microfiber cloths',                       qty:1,    unit:'pack',   price:12,  coefficient:1},
            ],
        },
        {
            name:'Commercial Office Cleaning (per sqft/month)',
            category:'commercial', inputUnit:'sqft', niche:'cleaning',
            materials:[
                {name:'Cleaner labor commercial (hr/100sqft)',   qty:0.12, unit:'hr',     price:22,  coefficient:1},
                {name:'Commercial floor cleaner',                qty:0.015,unit:'gallon', price:22,  coefficient:1},
                {name:'Glass & surface spray',                   qty:0.01, unit:'gallon', price:18,  coefficient:1},
                {name:'Paper towels commercial',                 qty:0.05, unit:'case',   price:45,  coefficient:1},
            ],
        },
        {
            name:'Move-Out Cleaning (per bedroom)',
            category:'moveout', inputUnit:'bedroom', niche:'cleaning',
            materials:[
                {name:'Cleaner labor move-out (hrs per bdr)',    qty:2.5,  unit:'hr',     price:22,  coefficient:1},
                {name:'Heavy-duty oven & appliance cleaner',     qty:0.5,  unit:'gallon', price:28,  coefficient:1},
                {name:'Grout & tile scrub kit',                  qty:0.5,  unit:'each',   price:14,  coefficient:1},
                {name:'Full supplies kit per bedroom',           qty:1,    unit:'kit',    price:18,  coefficient:1},
            ],
        },
        {
            name:'Airbnb Turnover Cleaning (per unit)',
            category:'airbnb', inputUnit:'unit', niche:'cleaning',
            materials:[
                {name:'Turnover cleaner labor (2 hrs per unit)', qty:2,    unit:'hr',     price:22,  coefficient:1},
                {name:'Fresh scent spray + disinfectant',        qty:1,    unit:'kit',    price:12,  coefficient:1},
                {name:'Microfiber cloths (fresh set)',           qty:1,    unit:'pack',   price:12,  coefficient:1},
                {name:'Consumables restocking kit',              qty:0.5,  unit:'kit',    price:20,  coefficient:1},
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

    // ── 4. TASKS (25+) ────────────────────────────────────────
    const TASKS = [
        // Today (6)
        { t:'Dispatch crews to 8 locations — morning briefing',               fi:2, ai:3,  st:'new',      pr:'high',   d:0,  tm:'07:00', est:30,  r:'All 8 crews dispatched with routes, locations, and checklists confirmed' },
        { t:'Follow up on Marriott Hotel proposal — $12,400/month contract',  fi:1, ai:2,  st:'new',      pr:'high',   d:0,  tm:'10:00', est:45,  r:'Meeting scheduled or written response received, next step defined' },
        { t:'QC inspection — Johnson residence post-cleaning',                fi:4, ai:7,  st:'progress', pr:'high',   d:0,  tm:'14:00', est:60,  r:'QC checklist completed, photos taken, client signed off' },
        { t:'Reply to 5 Google review responses',                             fi:0, ai:8,  st:'new',      pr:'medium', d:0,  tm:'11:00', est:30,  r:'All 5 reviews responded to professionally within 24 hours' },
        { t:'Review and approve weekly payroll',                              fi:5, ai:9,  st:'new',      pr:'high',   d:0,  tm:'15:00', est:45,  r:'Payroll approved and submitted, all crew paid on time' },
        { t:'Interview candidate for Crew Lead position',                     fi:6, ai:10, st:'new',      pr:'medium', d:0,  tm:'16:00', est:60,  r:'Interview completed, decision recorded, next steps defined' },
        // Tomorrow
        { t:'Deep clean — Austin Convention Center (6 hrs)',                  fi:3, ai:4,  st:'new',      pr:'high',   d:1,  tm:'08:00', est:360, r:'Full deep clean completed, before/after photos, signed checklist' },
        { t:'New client walkthrough — Google Austin office',                  fi:1, ai:2,  st:'new',      pr:'high',   d:1,  tm:'14:00', est:90,  r:'Walkthrough done, custom quote prepared and sent within 24hrs' },
        { t:'Equipment maintenance check — vacuums & steamers',               fi:2, ai:3,  st:'new',      pr:'high',   d:1,  tm:'09:00', est:60,  r:'All equipment inspected, issues logged, repairs scheduled if needed' },
        // This week
        { t:'Prepare Q2 tax documents for CPA',                              fi:5, ai:9,  st:'new',      pr:'high',   d:3,  tm:'18:00', est:180, r:'All Q2 tax docs compiled and sent to CPA on time' },
        { t:'Launch Instagram campaign — "Before/After" series',             fi:0, ai:11, st:'new',      pr:'high',   d:4,  tm:'12:00', est:120, r:'Campaign live with 10 posts scheduled for the next 30 days' },
        { t:'Train 3 new cleaners — OSHA safety standards',                  fi:6, ai:10, st:'new',      pr:'high',   d:4,  tm:'09:00', est:180, r:'All 3 cleaners pass OSHA quiz, certificates issued' },
        { t:'Renew liability insurance policy',                               fi:5, ai:0,  st:'new',      pr:'medium', d:5,  tm:'18:00', est:30,  r:'Policy renewed, new certificate on file, updated in system' },
        { t:'Update cleaning checklists for Airbnb clients',                 fi:7, ai:1,  st:'new',      pr:'medium', d:3,  tm:'18:00', est:60,  r:'Updated checklists distributed to all Airbnb crew leads' },
        // Overdue
        { t:'Q2 estimated tax payment',                                       fi:5, ai:9,  st:'new',      pr:'high',   d:-3, tm:'18:00', est:60,  r:'Tax payment submitted, confirmation number saved' },
        { t:'Annual equipment calibration certification',                     fi:2, ai:3,  st:'new',      pr:'high',   d:-5, tm:'18:00', est:120, r:'All equipment calibrated and certified, stickers updated' },
        { t:'Staff background checks renewal',                               fi:6, ai:10, st:'new',      pr:'medium', d:-7, tm:'18:00', est:90,  r:'All 12 staff background checks current and filed' },
        { t:'Update pricing on website',                                     fi:0, ai:11, st:'new',      pr:'low',    d:-10,tm:'18:00', est:45,  r:'New pricing live on website, confirmed by Amanda' },
        // Review / Done
        { t:'Monthly P&L report — March',                                    fi:5, ai:9,  st:'review',   pr:'high',   d:-1, tm:'18:00', est:90,  r:'P&L reviewed and approved by Michael, shared with team' },
        { t:'New commercial contract — WeWork Austin',                        fi:1, ai:2,  st:'done',     pr:'high',   d:-5, tm:'18:00', est:30,  r:'Contract signed, first invoice sent, onboarding started' },
        { t:'Spring promotion campaign launched',                             fi:0, ai:11, st:'done',     pr:'medium', d:-8, tm:'18:00', est:60,  r:'Campaign live, 340 clicks week 1, 12 new leads' },
        { t:'Google Austin office site walkthrough completed',               fi:1, ai:2,  st:'done',     pr:'high',   d:-10,tm:'18:00', est:90,  r:'Walkthrough done, proposal in progress' },
        // Rejected with reasons
        { t:'Quote for Marriott Hotel — first draft',                        fi:1, ai:2,  st:'progress', pr:'high',   d:-2, tm:'18:00', est:45,
          reason:'Underpriced by 30% — labor not fully accounted. Revise using standard commercial rate $0.12/sqft/visit.' },
        { t:'New hire contract — David Park',                                fi:6, ai:10, st:'progress', pr:'medium', d:-3, tm:'18:00', est:30,
          reason:'Missing background check documents. Cannot proceed without completed BGC from Sterling.' },
        { t:'Marketing budget Q2 — Kevin proposal',                          fi:0, ai:11, st:'progress', pr:'medium', d:-4, tm:'18:00', est:30,
          reason:'Exceeds approved limit by $2,400. Resubmit with cuts to display ads or reduce influencer spend.' },
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
            requireReview:t.st !== 'done',
            createdAt:now, updatedAt:now,
        };
        if (t.reason) {
            data.reviewRejectedAt = new Date(Date.now() + t.d * 86400000).toISOString();
            data.reviewRejectedBy = uid;
            data.reviewRejectReason = t.reason;
        }
        ops.push({type:'set', ref, data});
    }

    // ── 5. REGULAR TASKS (17) ─────────────────────────────────
    const REGS = [
        // Daily
        { t:'Morning crew dispatch & briefing',           type:'daily',           fi:2, ai:3,  tm:'07:00', est:15, result:'All crews assigned with locations, routes, and cleaning checklists for the day' },
        { t:'EOD report review + next day prep',          type:'daily',           fi:2, ai:1,  tm:'18:00', est:20, result:'Tomorrow schedule confirmed, any reschedules communicated, crew notified' },
        // Mon
        { t:'Team operations meeting',                    type:'weekly', dow:1,   fi:7, ai:0,  tm:'08:30', est:45, result:'Meeting notes saved, tasks assigned, blockers resolved or escalated' },
        { t:'Supplies inventory check',                   type:'weekly', dow:1,   fi:2, ai:3,  tm:'09:30', est:20, result:'Inventory count done, reorder list ready, low items flagged' },
        { t:'Plan weekly supply orders',                  type:'weekly', dow:1,   fi:2, ai:3,  tm:'10:00', est:20, result:'Order list approved, POs submitted to suppliers' },
        // Wed
        { t:'Client follow-up calls — satisfaction check',type:'weekly', dow:3,   fi:0, ai:8,  tm:'14:00', est:60, result:'All clients from the week called, NPS logged, issues escalated' },
        { t:'QC spot inspections — 3 random sites',       type:'weekly', dow:3,   fi:4, ai:7,  tm:'10:00', est:120,result:'3 sites inspected, QC photos taken, any issues assigned for follow-up' },
        // Fri
        { t:'Weekly revenue & expense report',            type:'weekly', dow:5,   fi:5, ai:9,  tm:'16:00', est:30, result:'Weekly P&L summary sent to Michael, variances explained' },
        { t:'Payroll processing & approval',              type:'weekly', dow:5,   fi:5, ai:9,  tm:'15:00', est:45, result:'Payroll submitted to ADP, all crew paid, records updated' },
        { t:'Sales pipeline review — leads & proposals',  type:'weekly', dow:5,   fi:1, ai:2,  tm:'17:00', est:30, result:'Pipeline updated, stuck deals actioned, forecast updated for Michael' },
        { t:'Google reviews response — all new reviews',  type:'weekly', dow:5,   fi:0, ai:8,  tm:'15:00', est:20, result:'All new Google reviews responded to professionally, no unanswered reviews' },
        // Monthly
        { t:'P&L review + owner presentation',            type:'monthly', dom:1,  fi:5, ai:9,  tm:'10:00', est:90, result:'Monthly P&L presented to Michael, approved, filed in Drive' },
        { t:'Equipment maintenance check',                type:'monthly', dom:5,  fi:2, ai:3,  tm:'09:00', est:120,result:'All vacuums, steamers, mops inspected, service scheduled if needed' },
        { t:'Staff performance reviews',                  type:'monthly', dom:10, fi:6, ai:10, tm:'09:00', est:180,result:'All crew leads reviewed, ratings logged, improvement plans updated' },
        { t:'Main payroll — salaried staff',              type:'monthly', dom:25, fi:5, ai:9,  tm:'10:00', est:60, result:'Salaried payroll processed, pay stubs sent, records filed' },
        { t:'Update pricing & service catalog',           type:'monthly', dom:1,  fi:1, ai:2,  tm:'11:00', est:60, result:'Pricing reviewed vs market, updated on website and quote templates' },
        { t:'Insurance & compliance review',              type:'monthly', dom:15, fi:7, ai:0,  tm:'14:00', est:45, result:'All policies current, compliance checklist signed, renewals flagged' },
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
            functionName:FUNCS[r.fi].name,
            assigneeId:sRefs[r.ai].id,
            expectedResult:r.result || '',
            reportFormat:'Short summary in free form',
            instruction:'', priority:'medium', requireReview:false,
            notifyOnComplete:[], checklist:[], status:'active', createdAt:now,
        }});
    }

    // ── 6. PROCESS TEMPLATES (5) ──────────────────────────────
    const tpl1Ref = cr.collection('processTemplates').doc(); // Onboard Commercial
    const tpl2Ref = cr.collection('processTemplates').doc(); // Move-Out Cleaning
    const tpl3Ref = cr.collection('processTemplates').doc(); // Onboard Crew Member
    const tpl4Ref = cr.collection('processTemplates').doc(); // Handle Complaint
    const tpl5Ref = cr.collection('processTemplates').doc(); // Contract Renewal

    ops.push({type:'set', ref:tpl1Ref, data:{
        name:'Onboard New Commercial Client',
        description:'9-step process from discovery to recurring service launch',
        steps:[
            {id:'s1', name:'Discovery call — understand needs & scope',      functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Site walkthrough & measurement',                 functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:2},
            {id:'s3', name:'Custom quote preparation & send',                functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:2, order:3},
            {id:'s4', name:'Contract negotiation',                           functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:3, order:4},
            {id:'s5', name:'Sign contract & collect deposit',                functionId:fRefs[5].id, functionName:FUNCS[5].name, durationDays:1, order:5},
            {id:'s6', name:'Crew assignment & briefing',                     functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:6},
            {id:'s7', name:'Initial deep clean',                             functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:7},
            {id:'s8', name:'Client feedback & QC sign-off',                  functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:8},
            {id:'s9', name:'Set recurring schedule & automate invoicing',    functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:9},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl2Ref, data:{
        name:'Residential Move-Out Cleaning',
        description:'8-step move-out cleaning from booking to review request',
        steps:[
            {id:'s1', name:'Booking & deposit collection',                   functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Pre-clean inspection & key pickup',              functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:2},
            {id:'s3', name:'Full deep clean (4-8 hours)',                    functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:3},
            {id:'s4', name:'QC walk-through by supervisor',                  functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:4},
            {id:'s5', name:'Photo documentation (50+ photos)',               functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:5},
            {id:'s6', name:'Client walk-through & approval',                 functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:6},
            {id:'s7', name:'Final invoice & payment collection',             functionId:fRefs[5].id, functionName:FUNCS[5].name, durationDays:1, order:7},
            {id:'s8', name:'Review request via email & text',                functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:8},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl3Ref, data:{
        name:'Onboard New Cleaning Crew Member',
        description:'7-step hiring and onboarding from application to schedule assignment',
        steps:[
            {id:'s1', name:'Application review & phone screen',              functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:2, order:1},
            {id:'s2', name:'Background check (Sterling)',                    functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:3, order:2},
            {id:'s3', name:'In-person interview',                            functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:3},
            {id:'s4', name:'Trial cleaning shift with supervisor',           functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:4},
            {id:'s5', name:'OSHA safety & product training',                 functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:2, order:5},
            {id:'s6', name:'Uniform, badge & equipment assignment',          functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:6},
            {id:'s7', name:'Schedule assignment & first solo job',           functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl4Ref, data:{
        name:'Handle Client Complaint — 24hr Resolution',
        description:'6-step complaint resolution to retain client and prevent recurrence',
        steps:[
            {id:'s1', name:'Receive & log complaint (system + call)',        functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:1},
            {id:'s2', name:'Apologize & acknowledge (same day)',             functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:2},
            {id:'s3', name:'Schedule re-clean within 24 hours',             functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:3},
            {id:'s4', name:'QC inspection after re-clean',                  functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:4},
            {id:'s5', name:'Client approval & satisfaction confirmation',    functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:5},
            {id:'s6', name:'Root cause analysis & prevention plan',         functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:6},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl5Ref, data:{
        name:'Monthly Contract Renewal',
        description:'5-step renewal process — never lose a client to inattention',
        steps:[
            {id:'s1', name:'30-day renewal notice triggered',               functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Review client satisfaction history',            functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:2, order:2},
            {id:'s3', name:'Update pricing & prepare renewal offer',        functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:3},
            {id:'s4', name:'Send renewal contract to client',               functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:4},
            {id:'s5', name:'Sign & update schedule for next period',        functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    // 7 active processes
    const tplNames = {
        [tpl1Ref.id]:'Onboard New Commercial Client',
        [tpl2Ref.id]:'Residential Move-Out Cleaning',
        [tpl3Ref.id]:'Onboard New Cleaning Crew Member',
        [tpl4Ref.id]:'Handle Client Complaint — 24hr Resolution',
        [tpl5Ref.id]:'Monthly Contract Renewal',
    };
    const PROCS = [
        { tpl:tpl1Ref, name:'Austin Tech Campus — onboarding contract',    step:4, ai:3  },
        { tpl:tpl1Ref, name:'WeWork Austin — monthly commercial service',  step:7, ai:5  },
        { tpl:tpl2Ref, name:'Move-out cleaning — Johnson Family',          step:5, ai:7  },
        { tpl:tpl3Ref, name:'New hire — Sofia replacement crew lead',      step:4, ai:10 },
        { tpl:tpl4Ref, name:'Complaint — Davis residence (missed bathroom)',step:3, ai:7  },
        { tpl:tpl4Ref, name:'Monthly supplies ordering — April',           step:2, ai:3  },
        { tpl:tpl1Ref, name:'Marriott Hotel — proposal & site walkthrough', step:2, ai:2  },
    ];
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

    // ── 7. PROJECTS (3) ───────────────────────────────────────
    const PROJS = [
        { name:'Austin Tech Campus — Annual Contract',   desc:'Annual cleaning contract $12,400/month — offices + common areas', color:'#22c55e', rev:148800, labor:72000, mat:18000, start:-15, end:350 },
        { name:'WeWork Austin — Monthly Commercial',     desc:'Monthly office cleaning contract — 5 locations in WeWork',       color:'#3b82f6', rev:102000, labor:50400, mat:12000, start:-5,  end:355 },
        { name:'Expand to San Antonio — New Market',     desc:'Market entry: hire local crews, set up ops, launch marketing',   color:'#f59e0b', rev:85000,  labor:45000, mat:0,     start:-3,  end:180 },
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

    const projSnap = await cr.collection('projects').get();
    const projDocs = projSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const stageOps = [];
    for (const proj of projDocs) {
        const pn = proj.name || '';
        let stages = [];
        if (pn.includes('Tech Campus')) {
            stages = [
                {name:'Contract signed',       status:'done',        order:1, start:_demoDate(-15), end:_demoDate(-14)},
                {name:'Client onboarding',     status:'done',        order:2, start:_demoDate(-14), end:_demoDate(-10)},
                {name:'Regular service launch',status:'done',        order:3, start:_demoDate(-10), end:_demoDate(-5) },
                {name:'Q1 performance review', status:'done',        order:4, start:_demoDate(-3),  end:_demoDate(0)  },
                {name:'Mid-year review',       status:'in_progress', order:5, start:_demoDate(0),   end:_demoDate(170)},
                {name:'Annual renewal',        status:'planned',     order:6, start:_demoDate(335), end:_demoDate(350)},
            ];
        } else if (pn.includes('WeWork')) {
            stages = [
                {name:'Contract & deposit',    status:'done',        order:1, start:_demoDate(-5),  end:_demoDate(-4)},
                {name:'Crew briefing & setup', status:'done',        order:2, start:_demoDate(-4),  end:_demoDate(-2)},
                {name:'First month service',   status:'in_progress', order:3, start:_demoDate(-1),  end:_demoDate(28)},
                {name:'Month 2 renewal',       status:'planned',     order:4, start:_demoDate(29),  end:_demoDate(58)},
            ];
        } else if (pn.includes('San Antonio')) {
            stages = [
                {name:'Market research',       status:'in_progress', order:1, start:_demoDate(-3),  end:_demoDate(14)},
                {name:'Hiring & training',     status:'planned',     order:2, start:_demoDate(15),  end:_demoDate(45)},
                {name:'Marketing launch',      status:'planned',     order:3, start:_demoDate(30),  end:_demoDate(60)},
                {name:'First clients — launch',status:'planned',     order:4, start:_demoDate(46),  end:_demoDate(90)},
                {name:'Revenue review',        status:'planned',     order:5, start:_demoDate(90),  end:_demoDate(180)},
            ];
        }
        for (const s of stages) {
            stageOps.push({type:'set', ref:cr.collection('projectStages').doc(), data:{
                projectId:proj.id, name:s.name, order:s.order, status:s.status,
                plannedStartDate:s.start, plannedEndDate:s.end,
                actualStartDate:s.status==='done'?s.start:null,
                actualEndDate:s.status==='done'?s.end:null,
                progressPct:s.status==='done'?100:s.status==='in_progress'?50:0,
                blockedReason:null, createdAt:now, updatedAt:now,
            }});
        }
    }
    if (stageOps.length) await window.safeBatchCommit(stageOps);

    // Project tasks
    const pByName = {};
    projDocs.forEach(d => {
        const name = d.name || '';
        if (name.includes('Tech Campus')) pByName['campus']   = {id:d.id, name};
        if (name.includes('WeWork'))      pByName['wework']   = {id:d.id, name};
        if (name.includes('San Antonio')) pByName['sanantonio'] = {id:d.id, name};
    });
    const projSnap2 = await cr.collection('projects').get();
    projSnap2.docs.forEach(d => {
        const name = d.data().name || '';
        if (name.includes('Tech Campus')) pByName['campus']    = {id:d.id, name};
        if (name.includes('WeWork'))      pByName['wework']    = {id:d.id, name};
        if (name.includes('San Antonio')) pByName['sanantonio'] = {id:d.id, name};
    });

    const projTaskOps = [];
    if (pByName.campus) {
        const {id:pid, name:pname} = pByName.campus;
        [
            {t:'Schedule monthly cleaning calendar — Tech Campus Q2',        fi:2, ai:1,  d:2,  pr:'high',   est:30,  r:'Q2 schedule sent to client contact, confirmed'},
            {t:'Order specialized floor cleaner for Tech Campus',            fi:2, ai:3,  d:1,  pr:'medium', est:20,  r:'Order placed with CleanCo, delivery confirmed'},
            {t:'Train Carlos crew on Tech Campus security protocols',        fi:6, ai:3,  d:3,  pr:'high',   est:60,  r:'All 4 crew members briefed and badged'},
            {t:'QC audit — Tech Campus week 8',                             fi:4, ai:7,  d:4,  pr:'high',   est:90,  r:'QC photos taken, score ≥ 9.0, report sent to client'},
            {t:'Prepare mid-year performance report for Tech Campus',       fi:7, ai:0,  d:10, pr:'high',   est:60,  r:'Report sent, renewal meeting scheduled'},
            {t:'Invoice Tech Campus — April service ($12,400)',             fi:5, ai:9,  d:1,  pr:'high',   est:15,  r:'Invoice sent via QuickBooks, payment due 30 days'},
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
    if (pByName.wework) {
        const {id:pid, name:pname} = pByName.wework;
        [
            {t:'WeWork Austin — first monthly cleaning (5 locations)',      fi:3, ai:5,  d:2,  pr:'high',   est:360, r:'All 5 locations cleaned, checklist signed, photos taken'},
            {t:'Invoice WeWork — first month ($8,500)',                     fi:5, ai:9,  d:3,  pr:'high',   est:15,  r:'Invoice sent, payment received within 30 days'},
            {t:'WeWork client onboarding call — confirm recurring schedule',fi:1, ai:2,  d:1,  pr:'high',   est:30,  r:'Schedule locked in, client contact saved, recurring set'},
            {t:'QC inspection WeWork — post first clean',                   fi:4, ai:7,  d:3,  pr:'high',   est:60,  r:'Score ≥ 9.0, photos shared with client'},
            {t:'Add WeWork to monthly billing automation',                  fi:5, ai:9,  d:4,  pr:'medium', est:20,  r:'Auto-invoice set up in QuickBooks, test invoice sent'},
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
    if (pByName.sanantonio) {
        const {id:pid, name:pname} = pByName.sanantonio;
        [
            {t:'San Antonio market research — competitors & pricing',       fi:0, ai:11, d:7,  pr:'high',   est:180, r:'Report: 5 competitors, avg pricing, opportunity size'},
            {t:'Post job listings — San Antonio crew lead & 4 cleaners',    fi:6, ai:10, d:10, pr:'high',   est:60,  r:'Listings live on Indeed/ZipRecruiter, target: 3 applicants/week'},
            {t:'Set up San Antonio marketing — Google Ads local',           fi:0, ai:11, d:14, pr:'high',   est:90,  r:'Ads live, $500/month budget, tracking set up'},
            {t:'Register business entity in San Antonio',                   fi:7, ai:0,  d:5,  pr:'high',   est:30,  r:'LLC registered, EIN obtained, bank account opened'},
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

    // ── 8. ESTIMATE EXAMPLE ───────────────────────────────────
    const normSnap2 = await cr.collection('estimate_norms').get();
    const normDocs2 = normSnap2.docs.map(d => ({id:d.id, ...d.data()}));
    const commNorm  = normDocs2.find(n => n.name && n.name.includes('Commercial Office'));
    const campusProjSnap = await cr.collection('projects').get();
    const campusProjDoc  = campusProjSnap.docs.find(d => (d.data().name||'').includes('Tech Campus'));

    if (commNorm && campusProjDoc) {
        const sqft = 12000; // Tech Campus 12,000 sqft
        const calced = (commNorm.materials||[]).map(m => ({
            name:m.name, unit:m.unit,
            required:Math.round(m.qty * sqft * 10)/10,
            inStock:0, deficit:Math.round(m.qty * sqft * 10)/10,
            pricePerUnit:m.price,
            total:Math.round(m.qty * sqft * m.price),
        }));
        const baseMonthly = calced.reduce((s, m) => s + m.total, 0);
        // Estimate shows annual value
        const annualTotal = 148800;
        await window.safeBatchCommit([{type:'set', ref:cr.collection('project_estimates').doc(), data:{
            title:'Austin Tech Campus — Annual Cleaning Contract (12,000 sqft)',
            projectId:campusProjDoc.id, dealId:'', functionId:'',
            status:'approved',
            sections:[{
                normId:commNorm.id, normName:commNorm.name,
                inputValue:sqft, inputUnit:commNorm.inputUnit,
                extraParam:null, calculatedMaterials:calced,
            }],
            totals:{totalMaterialsCost:annualTotal, totalDeficitCost:0, currency:'USD'},
            deleted:false, createdBy:uid, approvedBy:uid, createdAt:now, updatedAt:now,
        }}]);
        await cr.collection('projects').doc(campusProjDoc.id).update({estimateBudget:annualTotal, updatedAt:now});
    }

    // ── 9. CRM ────────────────────────────────────────────────
    try {
        const oldPips = await cr.collection('crm_pipeline').get();
        if (!oldPips.empty) await window.safeBatchCommit(oldPips.docs.map(d => ({type:'delete', ref:d.ref})));
    } catch(e) {}

    const pipRef = cr.collection('crm_pipeline').doc();
    await pipRef.set({
        isDemo:true,
        name:'Cleaning Services',
        stages:[
            {id:'new_lead',    label:'New Lead',              color:'#6b7280', order:1},
            {id:'contacted',   label:'Contacted',             color:'#3b82f6', order:2},
            {id:'quote_sent',  label:'Quote Sent',            color:'#8b5cf6', order:3},
            {id:'negotiation', label:'Negotiation',           color:'#f59e0b', order:4},
            {id:'signed',      label:'Contract Signed',       color:'#f97316', order:5},
            {id:'active_client',label:'Active Client',        color:'#22c55e', order:6},
            {id:'renewal',     label:'Up for Renewal',        color:'#0ea5e9', order:7},
            {id:'won',         label:'Won / Closed',          color:'#16a34a', order:8},
            {id:'lost',        label:'Lost',                  color:'#ef4444', order:9},
        ],
        createdBy:uid, createdAt:now, isDefault:true,
    });

    const DEALS = [
        // Active
        {name:'Austin Tech Campus — $12,400/month annual',  client:'Tech Campus (Mark Johnson)',phone:'+15125550001', email:'mjohnson@techcampus.com',  src:'referral',   stage:'active_client', amt:148800,nc:30,  note:'Annual contract active. Q1 review passed — score 9.4/10. Mid-year review due in 5 months.'},
        {name:'Google Austin Office — $18,500/month',       client:'Google Austin (Amy Chen)',  phone:'+15125550002', email:'achen@google.com',          src:'referral',   stage:'negotiation',   amt:222000,nc:0,   note:'Proposal under review. Google wants eco-friendly products only. Revise quote with green supplies.'},
        {name:'Marriott Hotel Austin — $12,400/month',      client:'Marriott (David Park)',     phone:'+15125550003', email:'dpark@marriott.com',        src:'google',     stage:'quote_sent',    amt:148800,nc:0,   note:'Quote revised after rejection. New quote sent Monday. They have 2 competitor quotes.'},
        {name:'45 Airbnb Units — Lisa Park Portfolio',      client:'Lisa Park (host)',          phone:'+15125550004', email:'lisapark@airbnb.com',       src:'instagram',  stage:'signed',        amt:97200, nc:2,   note:'45 units, $180/turnover. Contract signed. First cleaning batch next Tuesday.'},
        {name:'Downtown Condos HOA — $6,800/month',         client:'HOA (Tom Baker)',           phone:'+15125550005', email:'tbaker@downtownhoa.com',    src:'referral',   stage:'negotiation',   amt:81600, nc:1,   note:'HOA board wants 3-year contract. We want 1+1 renewal. Counteroffer sent.'},
        {name:'Dell Medical School — $22,000/month',        client:'Dell Medical (Sara Lee)',   phone:'+15125550006', email:'slee@dellmed.utexas.edu',   src:'cold_call',  stage:'quote_sent',    amt:264000,nc:5,   note:'Large opportunity — 50,000 sqft. Quote includes specialized medical-grade disinfection.'},
        {name:'Johnson Family Recurring — $480/month',      client:'Johnson Family',            phone:'+15125550007', email:'johnson@gmail.com',         src:'google',     stage:'active_client', amt:5760,  nc:14,  note:'Bi-weekly residential. Score 9.2/10. Renews automatically. 2-year client.'},
        {name:'Davis Residence — $380/month',               client:'Davis Residence (Jane Davis)',phone:'+15125550008',email:'jdavis@gmail.com',          src:'google',     stage:'active_client', amt:4560,  nc:0,   note:'OPEN COMPLAINT: missed bathroom in last clean. Re-clean scheduled for tomorrow. Client unhappy.'},
        {name:'New Lead — Sarah Mitchell (residential)',    client:'Sarah Mitchell',            phone:'+15125550009', email:'smitchell@gmail.com',       src:'google',     stage:'contacted',     amt:0,     nc:0,   note:'3BR/2BA house, 1,800sqft. Wants biweekly. First call today — estimate $280-320/clean.'},
        {name:'Austin Gym Chain — $4,200/month',            client:'FitAustin (Chris Park)',    phone:'+15125550010', email:'cpark@fitaustin.com',       src:'instagram',  stage:'new_lead',      amt:50400, nc:0,   note:'3 gym locations. Needs daily evening cleaning. High foot traffic — specialty floor work needed.'},
        {name:'Smith Family — 2-year renewal',              client:'Smith Family',              phone:'+15125550011', email:'smith@gmail.com',           src:'referral',   stage:'renewal',       amt:12480, nc:3,   note:'2-year contract expires in 3 weeks. Good client — score 9.1/10. Offer 5% loyalty discount.'},
        // Won
        {name:'WeWork Austin — $8,500/month',               client:'WeWork (Ryan Moore)',       phone:'+15125550012', email:'rmoore@wework.com',         src:'referral',   stage:'won',           amt:102000,nc:null,note:'Contract signed. First month service in progress. Excellent relationship with Ryan.'},
        {name:'Austin Marriott — one-time deep clean',      client:'Marriott Austin (GM)',      phone:'+15125550013', email:'gm@marriott-austin.com',    src:'google',     stage:'won',           amt:8200,  nc:null,note:'One-time post-renovation deep clean. Completed 3 weeks ago. Led to ongoing proposal.'},
        // Lost
        {name:'Hyatt Hotel Austin — $15,000/month',         client:'Hyatt (Pat Williams)',      phone:'+15125550014', email:'pwilliams@hyatt.com',       src:'cold_call',  stage:'lost',          amt:180000,nc:null,note:'Lost on price — they went with a national chain at $12K/month. Note: our quality is better. Follow up Q3.'},
    ];

    const cliRefs = DEALS.map(() => cr.collection('crm_clients').doc());
    await window.safeBatchCommit(DEALS.map((d, i) => ({type:'set', ref:cliRefs[i], data:{
        name:d.client, phone:d.phone, email:d.email,
        telegram:'', type:'company', source:d.src, niche:'cleaning',
        createdAt:_demoTs(-Math.floor(Math.random()*21+1)), updatedAt:now,
    }})));

    await window.safeBatchCommit(DEALS.map((d, i) => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        pipelineId:pipRef.id, title:d.name,
        clientName:d.client, clientId:cliRefs[i].id,
        phone:d.phone, email:d.email,
        source:d.src, stage:d.stage, amount:d.amt, note:d.note,
        nextContactDate:d.nc !== null ? _demoDate(d.nc) : null,
        nextContactTime:d.nc === 0 ? '14:00' : null,
        assigneeId:sRefs[2].id, assigneeName:STAFF[2].name,
        deleted:false, tags:[],
        createdAt:_demoTs(-Math.floor(Math.random()*14+1)), updatedAt:now,
    }})));

    // CRM Todo — today
    const todayDeals = [
        {name:'Sarah Mitchell — first call after website inquiry',  client:'Sarah Mitchell',     phone:'+15125550009', src:'google',   note:'Homeowner, 1,800sqft, wants biweekly. Estimate: $280-320. Ready to book if price is right.'},
        {name:'Google Austin — follow up $18,500/month proposal',   client:'Google Austin',      phone:'+15125550002', src:'referral', note:'Amy Chen asked for eco-friendly product list. Send green product PDF and revised pricing.'},
        {name:'Davis residence — re-clean confirmation after complaint',client:'Jane Davis',      phone:'+15125550008', src:'google',   note:'Client upset about missed bathroom. Confirm tomorrow 10am re-clean. Offer 1 free clean.'},
    ];
    const todayCliRefs = todayDeals.map(() => cr.collection('crm_clients').doc());
    await window.safeBatchCommit(todayDeals.map((d, i) => ({type:'set', ref:todayCliRefs[i], data:{
        name:d.client, phone:d.phone, email:'', telegram:'', type:'person',
        source:d.src, niche:'cleaning', createdAt:_demoTs(-1), updatedAt:now,
    }})));
    await window.safeBatchCommit(todayDeals.map((d, i) => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        pipelineId:pipRef.id, title:d.name,
        clientName:d.client, clientId:todayCliRefs[i].id,
        phone:d.phone, email:'', source:d.src, stage:'contacted', amount:0, note:d.note,
        nextContactDate:_demoDate(0), nextContactTime:'14:00',
        assigneeId:sRefs[2].id, assigneeName:STAFF[2].name,
        deleted:false, tags:[], createdAt:_demoTs(-1), updatedAt:now,
    }})));

    // ── 10. FINANCE (USD) ─────────────────────────────────────
    const finSettingsRef = cr.collection('finance_settings').doc('main');
    await finSettingsRef.set({isDemo:true, version:1, region:'US', currency:'USD', niche:'cleaning', initializedAt:now, initializedBy:uid, updatedAt:now});

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
        {name:'Chase Business Checking',       type:'bank', balance:48500, currency:'USD', isDefault:true},
        {name:'PayPal Business (online pmts)', type:'bank', balance:12300, currency:'USD', isDefault:false},
        {name:'Petty Cash (crews)',             type:'cash', balance:2800,  currency:'USD', isDefault:false},
    ];
    const finOps = [];
    ACCOUNTS.forEach((a, i) => finOps.push({type:'set', ref:accRefs[i], data:{...a, createdBy:uid, createdAt:now, updatedAt:now}}));

    const FIN_CATS = [
        {name:'Commercial contract payment',  type:'income',  color:'#22c55e', icon:'briefcase'},
        {name:'Residential cleaning payment', type:'income',  color:'#16a34a', icon:'home'},
        {name:'Deposit received',             type:'income',  color:'#84cc16', icon:'dollar-sign'},
        {name:'One-time job payment',         type:'income',  color:'#a3e635', icon:'credit-card'},
        {name:'Cleaning supplies',            type:'expense', color:'#ef4444', icon:'package'},
        {name:'Crew labor / payroll',         type:'expense', color:'#f97316', icon:'users'},
        {name:'Insurance',                    type:'expense', color:'#8b5cf6', icon:'shield'},
        {name:'Equipment & maintenance',      type:'expense', color:'#0ea5e9', icon:'tool'},
        {name:'Marketing & advertising',      type:'expense', color:'#ec4899', icon:'trending-up'},
        {name:'Office & admin',               type:'expense', color:'#6b7280', icon:'settings'},
        {name:'Vehicle & fuel',               type:'expense', color:'#f59e0b', icon:'truck'},
    ];
    const catRefs = FIN_CATS.map(() => cr.collection('finance_categories').doc());
    FIN_CATS.forEach((c, i) => finOps.push({type:'set', ref:catRefs[i], data:{name:c.name, type:c.type, color:c.color, icon:c.icon, isDefault:false, createdBy:uid, createdAt:now}}));
    await window.safeBatchCommit(finOps);

    const _noteToFuncCleaning = (note) => {
        const n = (note||'').toLowerCase();
        if (n.includes('google ads') || n.includes('instagram') || n.includes('marketing')) return fRefs[0].id;
        if (n.includes('contract') || n.includes('proposal') || n.includes('wework') || n.includes('tech campus') || n.includes('weework')) return fRefs[1].id;
        if (n.includes('dispatch') || n.includes('schedule') || n.includes('supplies')) return fRefs[2].id;
        if (n.includes('cleaning') || n.includes('crew') || n.includes('labor') || n.includes('payroll')) return fRefs[3].id;
        if (n.includes('insurance') || n.includes('payroll tax') || n.includes('accounting') || n.includes('tax')) return fRefs[5].id;
        if (n.includes('hiring') || n.includes('training') || n.includes('hr')) return fRefs[6].id;
        return '';
    };

    const projSnapFin = await cr.collection('projects').get();
    const projDocsFin = projSnapFin.docs.map(d => ({id:d.id, name:d.data().name||''}));
    const _getProjIdCleaning = (note) => {
        const n = (note||'').toLowerCase();
        const p = projDocsFin.find(p => {
            if (n.includes('tech campus') && p.name.includes('Tech Campus')) return true;
            if (n.includes('wework') && p.name.includes('WeWork')) return true;
            return false;
        });
        return p ? p.id : '';
    };

    const TXS = [
        // Current month — income
        {ci:0, acc:0, amt:12400, note:'Tech Campus — April monthly contract payment',     d:-3},
        {ci:0, acc:0, amt:8500,  note:'WeWork Austin — first month payment',              d:-5},
        {ci:2, acc:1, amt:4200,  note:'Deposit — Lisa Park Airbnb 45 units',              d:-2},
        {ci:1, acc:1, amt:2880,  note:'Residential cleaning payments — week of 3/25',     d:-7},
        {ci:3, acc:1, amt:8200,  note:'One-time deep clean — Austin Marriott',            d:-10},
        {ci:1, acc:1, amt:1960,  note:'Residential payments — Johnson, Smith, 3 others',  d:-1},
        // Current month — expenses
        {ci:4, acc:2, amt:3850,  note:'CleanCo Supply — monthly cleaning chemicals bulk', d:-4},
        {ci:4, acc:2, amt:1200,  note:'Microfiber cloths, mop heads, HEPA bags',          d:-8},
        {ci:5, acc:0, amt:18500, note:'Weekly crew labor payroll — March 25',             d:-3},
        {ci:5, acc:0, amt:18500, note:'Weekly crew labor payroll — March 18',             d:-10},
        {ci:6, acc:0, amt:1850,  note:'Liability insurance — monthly premium',            d:-1},
        {ci:6, acc:0, amt:2100,  note:'Workers comp insurance — monthly',                 d:-1},
        {ci:8, acc:0, amt:2500,  note:'Google Ads — April marketing budget',              d:-5},
        {ci:9, acc:0, amt:3200,  note:'Office/storage rent — April',                      d:-1},
        // Last month — income
        {ci:0, acc:0, amt:12400, note:'Tech Campus — March contract payment',             d:-32},
        {ci:0, acc:0, amt:8200,  note:'Marriott one-time deep clean deposit',             d:-28},
        {ci:1, acc:1, amt:4200,  note:'Residential cleaning — week 3',                   d:-25},
        // Last month — expenses
        {ci:5, acc:0, amt:74000, note:'Monthly crew payroll — full March',                d:-5},
        {ci:4, acc:0, amt:4200,  note:'Cleaning supplies — March bulk order',             d:-30},
        {ci:6, acc:0, amt:3950,  note:'All insurance premiums — March',                  d:-31},
        {ci:7, acc:2, amt:1200,  note:'Equipment lease — vacuum fleet March',             d:-15},
        {ci:10,acc:2, amt:1840,  note:'Van fuel & maintenance — March',                   d:-20},
        // Prior month
        {ci:0, acc:0, amt:24800, note:'Tech Campus 2x payment + WeWork signup',           d:-58},
        {ci:1, acc:1, amt:3850,  note:'Residential February — recurring clients',         d:-50},
        {ci:5, acc:0, amt:72000, note:'Full payroll — February',                          d:-36},
        {ci:8, acc:0, amt:2500,  note:'Google Ads — February',                            d:-55},
        {ci:4, acc:0, amt:3600,  note:'Supplies — February order',                        d:-50},
    ];
    const txOps = TXS.map(tx => ({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
        categoryId:catRefs[tx.ci].id, categoryName:FIN_CATS[tx.ci].name,
        accountId:accRefs[tx.acc].id, accountName:ACCOUNTS[tx.acc].name,
        type:FIN_CATS[tx.ci].type, amount:tx.amt, currency:'USD',
        note:tx.note, date:_demoTsFinance(tx.d),
        projectId:_getProjIdCleaning(tx.note),
        functionId:_noteToFuncCleaning(tx.note),
        createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(txOps);

    const regPays = [
        {name:'Office & storage rent',          type:'expense', amount:3200,  day:1,  freq:'monthly', comment:'Warehouse District storage unit + office'},
        {name:'Crew payroll (weekly)',           type:'expense', amount:18500, day:5,  freq:'weekly',  comment:'All field crew, weekly via ADP'},
        {name:'Liability insurance',            type:'expense', amount:1850,  day:1,  freq:'monthly', comment:'$2M general liability — State Farm'},
        {name:'Workers comp insurance',         type:'expense', amount:2100,  day:1,  freq:'monthly', comment:'Required for all field staff'},
        {name:'Vehicle insurance (2 vans)',     type:'expense', amount:680,   day:1,  freq:'monthly', comment:'Both cargo vans insured'},
        {name:'Google Ads',                     type:'expense', amount:2500,  day:5,  freq:'monthly', comment:'Local service ads + display'},
        {name:'CRM software (TALKO)',           type:'expense', amount:380,   day:1,  freq:'monthly', comment:'Business management system'},
        {name:'QuickBooks Online',              type:'expense', amount:85,    day:1,  freq:'monthly', comment:'Accounting software'},
        {name:'Equipment lease',                type:'expense', amount:1200,  day:15, freq:'monthly', comment:'Commercial vacuum fleet lease'},
        {name:'Phone plan — 12 lines',          type:'expense', amount:720,   day:1,  freq:'monthly', comment:'AT&T business plan, all staff'},
    ];
    await window.safeBatchCommit(regPays.map(r => ({type:'set', ref:cr.collection('finance_recurring').doc(), data:{
        name:r.name, type:r.type, amount:r.amount, currency:'USD',
        category:r.comment, frequency:r.freq, dayOfMonth:r.day,
        counterparty:'', comment:r.comment, accountId:'',
        active:true, createdAt:now, updatedAt:now,
    }})));

    const finCatSnap = await cr.collection('finance_categories').get();
    const finCatMap = {};
    finCatSnap.docs.forEach(d => { finCatMap[d.data().name] = d.id; });
    const budgetMonths = [
        {month:_demoDate(-30).slice(0,7), goal:108000},
        {month:_demoDate(0).slice(0,7),   goal:118500},
        {month:_demoDate(30).slice(0,7),  goal:132000},
    ];
    await window.safeBatchCommit(budgetMonths.map(bm => ({type:'set', ref:cr.collection('finance_budgets').doc(bm.month), data:{
        month:bm.month, goal:bm.goal,
        ...(finCatMap['Cleaning supplies']        ? {['cat_'+finCatMap['Cleaning supplies']]:      5500} : {}),
        ...(finCatMap['Crew labor / payroll']     ? {['cat_'+finCatMap['Crew labor / payroll']]:  74000} : {}),
        ...(finCatMap['Marketing & advertising']  ? {['cat_'+finCatMap['Marketing & advertising']]: 2500} : {}),
        ...(finCatMap['Insurance']                ? {['cat_'+finCatMap['Insurance']]:               3950} : {}),
        updatedAt:now,
    }})));

    // ── 11. INVENTORY (Cleaning Supplies) ────────────────────
    const STOCK = [
        {name:'All-Purpose Cleaner (gallon)',      sku:'APC-1G',    cat:'Chemicals',    unit:'gallon', qty:8,   min:20, price:18},
        {name:'Disinfectant Spray (gallon)',        sku:'DIS-1G',    cat:'Chemicals',    unit:'gallon', qty:22,  min:15, price:20},
        {name:'Glass Cleaner (quart)',              sku:'GLS-QT',    cat:'Chemicals',    unit:'quart',  qty:18,  min:12, price:8},
        {name:'Microfiber Cloths (pack of 12)',     sku:'MFC-12PK',  cat:'Consumables',  unit:'pack',   qty:45,  min:100,price:12},
        {name:'Mop Heads — commercial (each)',      sku:'MOP-COM',   cat:'Equipment',    unit:'each',   qty:24,  min:15, price:14},
        {name:'HEPA Vacuum Bags (pack of 10)',      sku:'HEPA-10PK', cat:'Equipment',    unit:'pack',   qty:18,  min:10, price:22},
        {name:'Scrub Brushes heavy-duty (each)',    sku:'SCB-HD',    cat:'Equipment',    unit:'each',   qty:32,  min:20, price:6},
        {name:'Trash Liners 30gal (roll of 50)',    sku:'TRL-30G',   cat:'Consumables',  unit:'roll',   qty:28,  min:15, price:18},
        {name:'Nitrile Gloves L (box of 100)',      sku:'GLV-L-100', cat:'PPE',          unit:'box',    qty:35,  min:20, price:24},
        {name:'Paper Towels commercial (case)',     sku:'PTW-CS',    cat:'Consumables',  unit:'case',   qty:14,  min:10, price:45},
    ];
    const itemRefs = [];
    for (const s of STOCK) {
        const iRef = cr.collection('warehouse_items').doc();
        itemRefs.push(iRef);
        ops.push({type:'set', ref:iRef, data:{name:s.name, sku:s.sku, category:s.cat, unit:s.unit, minStock:s.min, costPrice:s.price, niche:'cleaning', createdAt:now}});
        ops.push({type:'set', ref:cr.collection('warehouse_stock').doc(iRef.id), data:{itemId:iRef.id, itemName:s.name, qty:s.qty, reserved:0, available:s.qty, updatedAt:now}});
    }
    await window.safeBatchCommit(ops); ops = [];

    try {
        const oldLocs = await cr.collection('warehouse_locations').get();
        if (!oldLocs.empty) await window.safeBatchCommit(oldLocs.docs.map(d => ({type:'delete', ref:d.ref})));
    } catch(e) {}

    const locDefs = [
        {name:'Main Warehouse (Warehouse District)', type:'warehouse', isDefault:true},
        {name:'Van #1 — Carlos crew (mobile)',        type:'mobile',    isDefault:false},
        {name:'Van #2 — Maria crew (mobile)',         type:'mobile',    isDefault:false},
    ];
    const locRefs = locDefs.map(() => cr.collection('warehouse_locations').doc());
    await window.safeBatchCommit(locDefs.map((l, i) => ({type:'set', ref:locRefs[i], data:{name:l.name, type:l.type, isDefault:l.isDefault, deleted:false, createdAt:now, updatedAt:now}})));

    await window.safeBatchCommit([
        {name:'CleanCo Supply',      phone:'+15125550101', email:'orders@cleanco.com',    url:'cleancosupply.com',  note:'Primary supplier — bulk chemicals. Net 30 terms. Monthly delivery.'},
        {name:'Staples Business',   phone:'+15125550102', email:'biz@staples.com',        url:'staples.com',        note:'Paper goods, general office and cleaning supplies. Same day pickup.'},
        {name:'Grainger',           phone:'+15125550103', email:'orders@grainger.com',    url:'grainger.com',       note:'Commercial equipment, tools, replacement parts. Fast shipping.'},
        {name:'Amazon Business',    phone:'+15125550104', email:'biz@amazon.com',         url:'amazon.com/business',note:'Misc supplies, backup orders. Prime 2-day shipping on most items.'},
        {name:'Ferguson Supply',    phone:'+15125550105', email:'austin@ferguson.com',    url:'ferguson.com',       note:'Specialty cleaning — commercial floor care, carpet extraction supplies.'},
    ].map(s => ({type:'set', ref:cr.collection('warehouse_suppliers').doc(), data:{...s, deleted:false, createdAt:now, updatedAt:now}})));

    // Warehouse operations
    const itemsSnap = await cr.collection('warehouse_items').get();
    const itemData  = itemsSnap.docs.map(d => ({id:d.id, name:d.data().name}));
    const whOps = [
        ...itemData.slice(0,5).map((item, i) => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
            itemId:item.id, type:'IN', qty:[20,15,12,50,10][i], price:[18,20,8,12,14][i],
            totalPrice:[20,15,12,50,10][i]*[18,20,8,12,14][i],
            note:`Delivery from CleanCo — ${item.name.split(' ').slice(0,3).join(' ')}`, date:_demoDate(-5), createdBy:uid, createdAt:_demoTs(-5),
        }})),
        ...itemData.slice(0,6).map((item, i) => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
            itemId:item.id, type:'OUT', qty:[4,6,4,20,5,3][i], price:[18,20,8,12,14,22][i],
            totalPrice:[4,6,4,20,5,3][i]*[18,20,8,12,14,22][i],
            note:`Crew supply load — ${['Van #1 Carlos','Van #2 Maria','Van #1','Van #2','Van #1','Van #2'][i]}`, date:_demoDate(-2), createdBy:uid, createdAt:_demoTs(-2),
        }})),
        {type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:itemData[0]?.id, type:'TRANSFER', qty:5, note:'All-purpose cleaner: warehouse → Van #1', fromLocationId:locRefs[0].id, toLocationId:locRefs[1].id, date:_demoDate(-3), createdBy:uid, createdAt:_demoTs(-3)}},
        {type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:itemData[3]?.id, type:'TRANSFER', qty:10, note:'Microfiber cloths: warehouse → Van #2', fromLocationId:locRefs[0].id, toLocationId:locRefs[2].id, date:_demoDate(-1), createdBy:uid, createdAt:_demoTs(-1)}},
    ];
    if (whOps.length) await window.safeBatchCommit(whOps);

    const invMonth = _demoDate(-15).slice(0,7);
    const invItems = itemData.slice(0,10).map((item, i) => {
        const expected = [8,22,18,45,24,18,32,28,35,14][i] || 10;
        const actual = expected + [-1,0,0,-2,1,0,-1,0,0,1][i];
        return {itemId:item.id, itemName:item.name, expected, actual, diff:actual-expected};
    });
    await window.safeBatchCommit([{type:'set', ref:cr.collection('warehouse_inventories').doc(), data:{
        locationId:locRefs[0].id, month:invMonth, items:invItems,
        status:'confirmed', createdBy:uid, createdAt:_demoTs(-15), updatedAt:_demoTs(-15),
    }}]);

    // ── 12. WORK STANDARDS (4) ───────────────────────────────
    const STD_DEFS = [
        {
            name:'Standard Cleaning Checklist — Residential',
            functionId:fRefs[3].id,
            checklist:['Check in with client or use lockbox key — confirm access','Review client-specific notes before starting','All rooms: dust surfaces from top to bottom','Vacuum all carpets and rugs thoroughly','Mop all hard floors with appropriate cleaner','Clean all bathrooms: toilet, sink, tub/shower, mirrors','Kitchen: counters, stovetop, microwave (inside), sink','Empty all trash cans and replace liners','Final walk-through — check every room against checklist','Take 3 photos per room (before is preferred, after required)','Lock up and notify client via text upon completion','Log job completion in system within 30 minutes'],
            acceptanceCriteria:['Checklist signed by crew lead','3+ photos per room uploaded','Client notified via text','Job logged in system same day'],
            instructionsHtml:'<p>Every job must be treated like a new client inspection. Consistency is what earns 5-star reviews and renewals.</p>',
        },
        {
            name:'Commercial Deep Clean Protocol',
            functionId:fRefs[3].id,
            checklist:['Pre-clean walkthrough with site contact','Document any existing damage with photos','Strip and re-wax all hard floors if applicable','Deep scrub restrooms — grout, tiles, behind fixtures','Clean all vents, light fixtures, and ceiling fans','Wipe all baseboards, window sills, door frames','Disinfect all high-touch surfaces (handles, switches, desks)','Final QC walk with client before leaving'],
            acceptanceCriteria:['Before/after photos for each section','Client signs commercial checklist','No items missed — QC score ≥ 9.0'],
            instructionsHtml:'<p>Commercial clients pay premium rates — premium execution is required. No rushing, no skipping corners.</p>',
        },
        {
            name:'Handle Client Complaint — 24hr Resolution',
            functionId:fRefs[4].id,
            checklist:['Log complaint in system within 1 hour of receiving','Call client personally within 2 hours — do not text first','Apologize sincerely — do not make excuses','Offer re-clean within 24 hours at no charge','Assign best available crew for the re-clean','QC inspect the re-clean yourself before client walkthrough','Follow up 48 hours after re-clean to confirm satisfaction','Document root cause and update crew training notes'],
            acceptanceCriteria:['Client called within 2 hours','Re-clean completed within 24 hours','Client satisfaction confirmed in writing','Root cause logged and training updated'],
            instructionsHtml:'<p>Every complaint is a $5,000+ lifetime value at risk. Treat it accordingly. A resolved complaint builds more loyalty than a perfect first clean.</p>',
        },
        {
            name:'New Crew Member — First Week Standards',
            functionId:fRefs[6].id,
            checklist:['Background check cleared and filed','OSHA safety training completed (certificate on file)','Product training — chemicals, dilution ratios, safety data sheets','Shadow veteran crew for minimum 2 jobs','Solo trial job with supervisor present','Uniform, badge, and equipment assigned','Emergency contact and bank info collected','Phone number added to crew group chat'],
            acceptanceCriteria:['OSHA certificate on file','Trial job score ≥ 8.5 from supervisor','All paperwork complete','Schedule assigned for week 2'],
            instructionsHtml:'<p>First week sets expectations for life. Crew members who start right stay longer. Crew members who start wrong cost us clients.</p>',
        },
    ];
    await window.safeBatchCommit(STD_DEFS.map(s => ({type:'set', ref:cr.collection('workStandards').doc(), data:{
        name:s.name, functionId:s.functionId, checklist:s.checklist,
        acceptanceCriteria:s.acceptanceCriteria, instructionsHtml:s.instructionsHtml,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})));

    // ── 13. COORDINATIONS (4) ─────────────────────────────────
    const COORDS = [
        {name:'Morning crew dispatch',          type:'daily',      chairmanId:sRefs[3].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[3].id,sRefs[4].id,sRefs[5].id,sRefs[6].id], schedule:{day:null,time:'07:00'}, agendaItems:['execution','tasks'],
         dynamicAgenda:[{id:'da1',text:'Davis complaint re-clean — confirm crew assignment for today',authorId:sRefs[1].id,createdAt:new Date().toISOString()}]},
        {name:'Weekly operations meeting',      type:'weekly',     chairmanId:sRefs[0].id, participantIds:sRefs.slice(0,8).map(s=>s.id), schedule:{day:1,time:'08:30'}, agendaItems:['stats','execution','reports','questions','tasks'],
         dynamicAgenda:[{id:'da2',text:'Google Austin proposal — need eco-product list by EOD',authorId:sRefs[2].id,createdAt:new Date().toISOString()},{id:'da3',text:'CleanCo supply delay — microfiber cloths at critical low',authorId:sRefs[3].id,createdAt:new Date().toISOString()}]},
        {name:'Quality & complaints review',    type:'weekly',     chairmanId:sRefs[7].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[7].id,sRefs[3].id], schedule:{day:3,time:'14:00'}, agendaItems:['reports','questions','tasks'],
         dynamicAgenda:[{id:'da4',text:'Davis residence — complaint still open 4 days, re-clean today',authorId:sRefs[7].id,createdAt:new Date().toISOString()}]},
        {name:'Owner review — KPIs & growth',   type:'council_own',chairmanId:sRefs[0].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[9].id], schedule:{day:5,time:'17:00'}, agendaItems:['stats','execution','reports','decisions'],
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
    const dispatchCoord = coordDocs.find(c => c.name && c.name.includes('dispatch'));
    const opsCoord      = coordDocs.find(c => c.name && c.name.includes('operations'));
    const ownerCoord    = coordDocs.find(c => c.name && c.name.includes('Owner'));

    const sessionOps = [];
    if (dispatchCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:dispatchCoord.id, coordName:dispatchCoord.name, coordType:'daily',
        startedAt:new Date(Date.now()-2*86400000).toISOString(),
        finishedAt:new Date(Date.now()-2*86400000+15*60000).toISOString(),
        decisions:[
            {text:'Reassign Carlos crew to Tech Campus today — James covers residential route', taskId:'', authorId:uid},
            {text:'Order microfiber cloths URGENT — down to 2 days supply', taskId:'', authorId:uid},
            {text:'Handle Davis complaint today — Sofia crew assigned for re-clean 2pm', taskId:'', authorId:uid},
        ],
        unresolved:[], agendaDone:['Crew assignments','Supply status','Complaints'],
        dynamicAgendaItems:[], notes:'All 8 crews dispatched on time. Tech Campus crew briefed on new security protocol.',
        conductedBy:uid, participantIds:sRefs.slice(0,6).map(s=>s.id), taskSnapshot:[], createdAt:_demoTs(-2),
    }});

    if (opsCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:opsCoord.id, coordName:opsCoord.name, coordType:'weekly',
        startedAt:new Date(Date.now()-7*86400000).toISOString(),
        finishedAt:new Date(Date.now()-7*86400000+45*60000).toISOString(),
        decisions:[
            {text:'New commercial pricing: $0.12/sqft standard, $0.22/sqft deep clean — effective April 1', taskId:'', authorId:uid},
            {text:'Hire 2 additional cleaners by April 15 — Lisa posts on Indeed today', taskId:'', authorId:uid},
            {text:'Launch San Antonio research — Kevin and Amanda own this by EOW', taskId:'', authorId:uid},
            {text:'Update Airbnb checklist — add linen staging photos as requirement', taskId:'', authorId:uid},
            {text:'Implement GPS tracking on both vans — Jessica to evaluate Samsara by Friday', taskId:'', authorId:uid},
        ],
        unresolved:[{text:'Supply chain delay — CleanCo delayed microfiber delivery by 2 weeks → escalate', authorId:uid, addedAt:new Date(Date.now()-7*86400000).toISOString()}],
        agendaDone:['Weekly KPIs','New contracts','Staffing','Operations','Marketing'],
        dynamicAgendaItems:[{text:'Marriott quote was rejected — how do we revise?',authorId:uid,addedAt:new Date(Date.now()-8*86400000).toISOString()}],
        notes:'Strong week — WeWork signed, Tech Campus score 9.4. Focus on Google Austin proposal.',
        conductedBy:uid, participantIds:sRefs.slice(0,8).map(s=>s.id), taskSnapshot:[], createdAt:_demoTs(-7),
    }});

    if (ownerCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:ownerCoord.id, coordName:ownerCoord.name, coordType:'council_own',
        startedAt:new Date(Date.now()-8*86400000).toISOString(),
        finishedAt:new Date(Date.now()-8*86400000+60*60000).toISOString(),
        decisions:[
            {text:'Approve $45K budget for San Antonio expansion — Q3 target: $85K revenue', taskId:'', authorId:uid},
            {text:'Raise commercial rates 8% across all new proposals — market rate is now higher', taskId:'', authorId:uid},
            {text:'Launch Google review automation via NiceJob — Daniel to set up this week', taskId:'', authorId:uid},
            {text:'Hire Operations Coordinator — post job by April 10, target May 1 start', taskId:'', authorId:uid},
        ],
        unresolved:[], agendaDone:['March P&L','Growth strategy','Pricing','Hiring'],
        dynamicAgendaItems:[],
        notes:'March was best month ever — $118.5K revenue, 30.8% margin. April target $132K.',
        conductedBy:uid, participantIds:[uid,sRefs[1].id,sRefs[9].id], taskSnapshot:[], createdAt:_demoTs(-8),
    }});

    if (sessionOps.length) await window.safeBatchCommit(sessionOps);

    // ── 14. BOOKING ───────────────────────────────────────────
    const bookingCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookingCalRef, data:{
            name:'Book a Cleaning — Free Estimate',
            slug:'sparkclean-estimate',
            ownerName:STAFF[2].name, ownerId:sRefs[2].id,
            duration:45, bufferBefore:10, bufferAfter:15,
            timezone:'America/Chicago', confirmationType:'manual',
            color:'#22c55e',
            location:'Austin, TX and surrounding areas (up to 30 miles)',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1', text:'Property type (residential / commercial / Airbnb / move-out)',  type:'text',   required:true},
                {id:'q2', text:'Approximate square footage',                                     type:'text',   required:true},
                {id:'q3', text:'Desired frequency (one-time / weekly / biweekly / monthly)',     type:'text',   required:false},
                {id:'q4', text:'Any special requirements (pets, allergies, specific areas)',     type:'text',   required:false},
            ],
            maxBookingsPerSlot:1, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookingCalRef.id), data:{
            weeklyHours:{
                mon:[{start:'08:00',end:'19:00'}], tue:[{start:'08:00',end:'19:00'}],
                wed:[{start:'08:00',end:'19:00'}], thu:[{start:'08:00',end:'19:00'}],
                fri:[{start:'08:00',end:'19:00'}], sat:[{start:'09:00',end:'15:00'}],
                sun:[],
            },
            dateOverrides:{}, updatedAt:now,
        }},
    ]);

    const apptDefs = [
        {name:'Sarah Mitchell',     phone:'+15125550009', email:'smitchell@gmail.com',  date:_demoDate(1), time:'10:00', status:'confirmed',  note:'1,800sqft 3BR/2BA — biweekly. Estimate $290/clean. Has 2 dogs.'},
        {name:'Google Austin Rep',  phone:'+15125550002', email:'achen@google.com',     date:_demoDate(2), time:'14:00', status:'confirmed',  note:'Site walkthrough 18,000sqft. Wants eco-products. $18.5K/month proposal.'},
        {name:'Austin Gym Chain',   phone:'+15125550010', email:'cpark@fitaustin.com',  date:_demoDate(3), time:'11:00', status:'confirmed',  note:'3 gym locations, evening cleaning. Heavy foot traffic floors.'},
        {name:'HOA Property Mgr',   phone:'+15125550005', email:'tbaker@hoa.com',       date:_demoDate(4), time:'15:00', status:'pending',    note:'Downtown condos common areas. 3-year contract potential.'},
        {name:'Lisa Park',          phone:'+15125550004', email:'lisapark@airbnb.com',  date:_demoDate(5), time:'10:30', status:'pending',    note:'45 Airbnb units. Discuss turnover schedule and team access.'},
        {name:'Airbnb Host — Kim',  phone:'+15125550020', email:'kim.host@gmail.com',   date:_demoDate(6), time:'09:00', status:'pending',    note:'8 units in South Austin. Wants same-day turnover service.'},
        {name:'Johnson Family',     phone:'+15125550007', email:'johnson@gmail.com',    date:_demoDate(-3),time:'10:00', status:'confirmed',  note:'Biweekly residential — completed clean, 9.5/10 score.'},
        {name:'Davis Residence',    phone:'+15125550008', email:'jdavis@gmail.com',     date:_demoDate(-5),time:'14:00', status:'confirmed',  note:'Biweekly residential — complaint re-clean scheduled.'},
    ];
    await window.safeBatchCommit(apptDefs.map(a => ({type:'set', ref:cr.collection('booking_appointments').doc(), data:{
        calendarId:bookingCalRef.id,
        calendarName:'Book a Cleaning — Free Estimate',
        guestName:a.name, guestPhone:a.phone, guestEmail:a.email,
        date:a.date, startTime:a.time,
        endTime:(parseInt(a.time.split(':')[0])+(a.time.split(':')[1]==='00'?0:1)).toString().padStart(2,'0')+':'+(a.time.split(':')[1]==='00'?'45':'15'),
        status:a.status, note:a.note,
        answers:[{questionId:'q1',answer:a.note},{questionId:'q2',answer:'Estimated 1500-18000 sqft'}],
        createdAt:_demoTs(-Math.floor(Math.random()*7+1)), updatedAt:now,
    }})));

    // ── 15. METRICS ───────────────────────────────────────────
    const METRICS = [
        // Weekly (15)
        {name:'Revenue (week)',                    unit:'$',   cat:'Finance',    freq:'weekly',  value:29800,  trend:8.0,  int:false, desc:'Total weekly revenue from all cleaning jobs and contracts. Goal: $32,000/week.'},
        {name:'New leads',                         unit:'ea',  cat:'Marketing',  freq:'weekly',  value:15,     trend:10.0, int:true,  desc:'New inquiries received (calls, forms, referrals). Goal: 18/week.'},
        {name:'New contracts signed',              unit:'ea',  cat:'Sales',      freq:'weekly',  value:2,      trend:8.0,  int:true,  desc:'New contracts or recurring agreements signed this week. Goal: 3/week.'},
        {name:'Conversion rate lead→contract',     unit:'%',   cat:'Sales',      freq:'weekly',  value:16,     trend:5.0,  int:false, desc:'% of leads that become paying clients. Goal: 18%. Industry avg: 15%.'},
        {name:'Jobs completed',                    unit:'ea',  cat:'Operations', freq:'weekly',  value:78,     trend:6.0,  int:true,  desc:'Total cleaning jobs completed this week. Goal: 85/week.'},
        {name:'On-time arrival rate',              unit:'%',   cat:'Operations', freq:'weekly',  value:96.2,   trend:2.0,  int:false, desc:'% of jobs where crew arrived within 15 minutes of scheduled time. Goal: 98%.'},
        {name:'Client satisfaction score',         unit:'/10', cat:'Quality',    freq:'weekly',  value:9.1,    trend:3.0,  int:false, desc:'Average post-job satisfaction score (0-10). Goal: 9.2+.'},
        {name:'Re-clean requests',                 unit:'ea',  cat:'Quality',    freq:'weekly',  value:1,      trend:-10.0,int:true,  desc:'Number of re-cleans requested due to quality issues. Goal: 0. Each = lost margin.'},
        {name:'Crew utilization rate',             unit:'%',   cat:'Operations', freq:'weekly',  value:84,     trend:4.0,  int:false, desc:'% of available crew hours that were billable. Goal: 88%.'},
        {name:'Tasks completed on time',           unit:'%',   cat:'Management', freq:'weekly',  value:86,     trend:5.0,  int:false, desc:'% of internal tasks completed by deadline. Goal: 92%.'},
        {name:'Overdue tasks',                     unit:'ea',  cat:'Management', freq:'weekly',  value:4,      trend:-18.0,int:true,  desc:'Open tasks past their deadline. Goal: 0. Currently: tax, equipment, BGC, website.'},
        {name:'Bookings via website',              unit:'ea',  cat:'Marketing',  freq:'weekly',  value:21,     trend:8.0,  int:true,  desc:'New booking requests submitted through website. Goal: 25/week.'},
        {name:'5-star reviews received',           unit:'ea',  cat:'Marketing',  freq:'weekly',  value:6,      trend:10.0, int:true,  desc:'New 5-star Google reviews this week. Goal: 8/week. Reviews = free lead gen.'},
        {name:'Tasks returned for rework',         unit:'ea',  cat:'Management', freq:'weekly',  value:2,      trend:-8.0, int:true,  desc:'Tasks rejected from review and sent back. Goal: <2. Indicates unclear task writing.'},
        {name:'Unanswered calls / messages',       unit:'ea',  cat:'Sales',      freq:'weekly',  value:3,      trend:-15.0,int:true,  desc:'Calls or messages that went unanswered. Goal: 0. Every missed call = potential lost client.'},

        // Monthly — Financial (first 9)
        {name:'Monthly Revenue',                   unit:'$',   cat:'Finance',    freq:'monthly', value:118500, trend:10.0, int:false, desc:'Total monthly revenue. Goal: $128,000. Current best month ever: $118,500.'},
        {name:'Net Profit',                        unit:'$',   cat:'Finance',    freq:'monthly', value:36500,  trend:8.0,  int:false, desc:'Revenue minus all expenses. Goal: $38,400. Track weekly, not monthly.'},
        {name:'Profit Margin',                     unit:'%',   cat:'Finance',    freq:'monthly', value:30.8,   trend:3.0,  int:false, desc:'Net profit / Revenue. Goal: 30%. Industry top performers: 28-35%.'},
        {name:'Average job value',                 unit:'$',   cat:'Finance',    freq:'monthly', value:371,    trend:6.0,  int:false, desc:'Total revenue / jobs completed. Goal: $385. Improve by upselling add-ons.'},
        {name:'Supplies cost',                     unit:'$',   cat:'Finance',    freq:'monthly', value:5200,   trend:4.0,  int:false, desc:'Total cleaning supply spend. Should stay under 5% of revenue.'},
        {name:'Labor cost',                        unit:'$',   cat:'Finance',    freq:'monthly', value:74000,  trend:2.0,  int:false, desc:'Total crew payroll. Largest expense — target 55-60% of revenue.'},
        {name:'Accounts receivable',               unit:'$',   cat:'Finance',    freq:'monthly', value:22400,  trend:-5.0, int:false, desc:'Outstanding invoices not yet paid. Goal: under 2 weeks revenue. Chase at 30 days.'},
        {name:'Recurring contract revenue',        unit:'$',   cat:'Finance',    freq:'monthly', value:82000,  trend:15.0, int:false, desc:'Revenue from recurring contracts (not one-time). Goal: 70% of total revenue.'},
        {name:'One-time job revenue',              unit:'$',   cat:'Finance',    freq:'monthly', value:36500,  trend:3.0,  int:false, desc:'Revenue from one-time jobs (move-outs, deep cleans). Good for cash flow, not growth.'},

        // Operational (8)
        {name:'Total jobs completed',              unit:'ea',  cat:'Operations', freq:'monthly', value:318,    trend:6.0,  int:true,  desc:'All cleaning jobs completed. Goal: 340/month. Requires 3-4 full crews.'},
        {name:'Recurring clients',                 unit:'ea',  cat:'Sales',      freq:'monthly', value:78,     trend:8.0,  int:true,  desc:'Clients on active recurring contracts. Goal: 85. The foundation of the business.'},
        {name:'New clients acquired',              unit:'ea',  cat:'Sales',      freq:'monthly', value:18,     trend:10.0, int:true,  desc:'New clients who completed first job this month. Goal: 22/month.'},
        {name:'Client retention rate',             unit:'%',   cat:'Sales',      freq:'monthly', value:92.4,   trend:3.0,  int:false, desc:'% of clients who renewed or stayed active. Goal: 94%. Losing clients = losing compounding revenue.'},
        {name:'NPS score',                         unit:'pts', cat:'Quality',    freq:'monthly', value:68,     trend:5.0,  int:false, desc:'Net Promoter Score from monthly survey. Goal: 72+. Key indicator of referral likelihood.'},
        {name:'Response time to booking',          unit:'hrs', cat:'Sales',      freq:'monthly', value:2.8,    trend:-8.0, int:false, desc:'Average hours to respond to new booking inquiry. Goal: under 2 hours. Speed = conversion.'},
        {name:'No-show / cancellation rate',       unit:'%',   cat:'Operations', freq:'monthly', value:6.2,    trend:-5.0, int:false, desc:'% of booked jobs that were cancelled or no-showed. Goal: under 5%.'},
        {name:'Contracts renewed',                 unit:'ea',  cat:'Sales',      freq:'monthly', value:12,     trend:6.0,  int:true,  desc:'Contracts successfully renewed this month. Proactive renewal = zero churn.'},
        {name:'Referrals received',                unit:'ea',  cat:'Marketing',  freq:'monthly', value:11,     trend:12.0, int:true,  desc:'New clients who came via referral. Goal: 15/month. Referrals convert at 60%+ vs 15% for ads.'},

        // Quality & HR (8)
        {name:'Re-clean rate',                     unit:'%',   cat:'Quality',    freq:'monthly', value:1.8,    trend:-8.0, int:false, desc:'% of jobs requiring a re-clean. Goal: under 2%. Above 3% = systemic training issue.'},
        {name:'Complaint rate',                    unit:'%',   cat:'Quality',    freq:'monthly', value:0.6,    trend:-10.0,int:false, desc:'% of jobs resulting in formal complaint. Goal: under 1%. Track reason per complaint.'},
        {name:'5-star Google reviews',             unit:'ea',  cat:'Marketing',  freq:'monthly', value:24,     trend:15.0, int:true,  desc:'New 5-star Google reviews. Goal: 30+/month. Reviews are best free marketing.'},
        {name:'Crew turnover rate',                unit:'%',   cat:'HR',         freq:'monthly', value:4.2,    trend:-5.0, int:false, desc:'% of crew who left this month. Goal: under 5%. High turnover = high training cost.'},
        {name:'Training hours completed',          unit:'hrs', cat:'HR',         freq:'monthly', value:6.5,    trend:8.0,  int:false, desc:'Average training hours per crew member. Goal: 8 hrs/month. Trained crews = fewer complaints.'},
        {name:'Equipment downtime',                unit:'hrs', cat:'Operations', freq:'monthly', value:3,      trend:-12.0,int:false, desc:'Hours lost due to equipment breakdown. Goal: 0. Preventive maintenance prevents this.'},
        {name:'Supply waste rate',                 unit:'%',   cat:'Operations', freq:'monthly', value:2.4,    trend:-6.0, int:false, desc:'% of supplies used above standard ratio. Goal: under 3%. Train crews on dilution ratios.'},
        {name:'OSHA incidents',                    unit:'ea',  cat:'HR',         freq:'monthly', value:0,      trend:0.0,  int:true,  desc:'Workplace safety incidents. Goal: 0. Report any incident within 24 hours.'},

        // 18 checkpoints
        {name:'01 Booking confirmed 2hrs',         unit:'%', cat:'Checkpoints', freq:'monthly', value:88, trend:4.0, int:false, desc:'% of new bookings confirmed (called/emailed) within 2 hours. Slower = lost client.'},
        {name:'02 Crew assigned before job',       unit:'%', cat:'Checkpoints', freq:'monthly', value:96, trend:2.0, int:false, desc:'% of jobs with crew assigned at least 24 hours before scheduled time.'},
        {name:'03 Pre-clean checklist done',       unit:'%', cat:'Checkpoints', freq:'monthly', value:82, trend:5.0, int:false, desc:'% of jobs where crew completed pre-clean walkthrough checklist.'},
        {name:'04 Arrival on time',                unit:'%', cat:'Checkpoints', freq:'monthly', value:96, trend:2.0, int:false, desc:'% of jobs with on-time arrival (within 15 min of schedule).'},
        {name:'05 Cleaning checklist signed',      unit:'%', cat:'Checkpoints', freq:'monthly', value:91, trend:3.0, int:false, desc:'% of jobs with completed, signed cleaning checklist.'},
        {name:'06 QC photo taken',                 unit:'%', cat:'Checkpoints', freq:'monthly', value:85, trend:6.0, int:false, desc:'% of jobs with after-clean photos uploaded before crew leaves.'},
        {name:'07 Client notified on completion',  unit:'%', cat:'Checkpoints', freq:'monthly', value:94, trend:2.0, int:false, desc:'% of clients notified via text/email upon job completion.'},
        {name:'08 Invoice sent same day',          unit:'%', cat:'Checkpoints', freq:'monthly', value:88, trend:5.0, int:false, desc:'% of completed jobs with invoice sent same day. Delayed invoicing = delayed cash.'},
        {name:'09 Payment collected on time',      unit:'%', cat:'Checkpoints', freq:'monthly', value:86, trend:3.0, int:false, desc:'% of invoices paid by due date. Chase at 30 days.'},
        {name:'10 Review requested',               unit:'%', cat:'Checkpoints', freq:'monthly', value:78, trend:8.0, int:false, desc:'% of completed jobs where client was asked for Google review.'},
        {name:'11 Follow-up call 48hrs',           unit:'%', cat:'Checkpoints', freq:'monthly', value:65, trend:10.0,int:false, desc:'% of new clients who received a follow-up satisfaction call within 48 hours.'},
        {name:'12 Recurring schedule set',         unit:'%', cat:'Checkpoints', freq:'monthly', value:72, trend:6.0, int:false, desc:'% of one-time clients offered and given recurring schedule option.'},
        {name:'13 Supplies restocked after job',   unit:'%', cat:'Checkpoints', freq:'monthly', value:89, trend:3.0, int:false, desc:'% of van supply kits restocked to standard level after each job.'},
        {name:'14 Equipment cleaned after job',    unit:'%', cat:'Checkpoints', freq:'monthly', value:92, trend:2.0, int:false, desc:'% of equipment properly cleaned and stored after each job.'},
        {name:'15 Incident report filed',          unit:'%', cat:'Checkpoints', freq:'monthly', value:100,trend:0.0, int:false, desc:'% of incidents (damage, injury) with incident report filed same day.'},
        {name:'16 Crew feedback submitted',        unit:'%', cat:'Checkpoints', freq:'monthly', value:68, trend:8.0, int:false, desc:'% of crew members who submitted end-of-week feedback on jobs and issues.'},
        {name:'17 Client satisfaction logged',     unit:'%', cat:'Checkpoints', freq:'monthly', value:82, trend:4.0, int:false, desc:'% of jobs with client satisfaction score logged in system.'},
        {name:'18 Contract renewal flagged 30d',   unit:'%', cat:'Checkpoints', freq:'monthly', value:88, trend:5.0, int:false, desc:'% of contracts where renewal outreach started 30 days before expiration.'},
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
            const noiseScale  = m.value > 10000 ? 0.06 : (m.int ? 0.15 : 0.08);
            const noise = (Math.random() - 0.5) * noiseScale;
            const rawVal = m.value * trendFactor * (1 + noise);
            let val;
            if (m.int) val = Math.max(0, Math.round(rawVal));
            else if (['%','/10','pts'].includes(m.unit)) val = Math.min(m.unit==='%'?100:10, Math.max(0, Math.round(rawVal * 10) / 10));
            else val = Math.max(0, Math.round(rawVal * 10) / 10);
            const entryRef = cr.collection('metricEntries').doc();
            const d2 = new Date();
            let pk;
            if (freq === 'monthly') {
                d2.setMonth(d2.getMonth() - p);
                pk = d2.getFullYear() + '-' + String(d2.getMonth()+1).padStart(2,'0');
            } else {
                d2.setDate(d2.getDate() - p * 7);
                d2.setHours(12,0,0,0);
                const dow = d2.getDay() || 7;
                d2.setDate(d2.getDate() - dow + 4);
                const j1 = new Date(d2.getFullYear(), 0, 1);
                const wn = Math.ceil(((d2 - j1) / 864e5 + j1.getDay() + 1) / 7);
                pk = d2.getFullYear() + '-W' + String(wn).padStart(2,'0');
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

    const mSnap = await cr.collection('metrics').get();
    const mMap = {};
    mSnap.docs.forEach(d => { mMap[d.data().name] = d.id; });
    const KPI_TARGETS = [
        {name:'Revenue (week)',             target:32000, period:'weekly'},
        {name:'Client satisfaction score',  target:9.2,   period:'weekly'},
        {name:'On-time arrival rate',       target:98,    period:'weekly'},
        {name:'Re-clean requests',          target:0,     period:'weekly'},
        {name:'Monthly Revenue',            target:128000,period:'monthly'},
        {name:'Net Profit',                 target:38400, period:'monthly'},
        {name:'Profit Margin',              target:30,    period:'monthly'},
        {name:'Client retention rate',      target:94,    period:'monthly'},
        {name:'NPS score',                  target:72,    period:'monthly'},
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

    // ── 16. COMPANY PROFILE ───────────────────────────────────
    await cr.update({
        name:           'SparkClean Pro',
        niche:          'cleaning',
        nicheLabel:     'Commercial & Residential Cleaning',
        description:    'Commercial cleaning, residential, post-construction, and Airbnb turnover cleaning in Austin, TX.',
        city:           'Austin, TX',
        employees:      12,
        currency:       'USD',
        companyGoal:    'Become #1 rated cleaning company in Austin by Google reviews and recurring commercial contracts',
        companyConcept: 'Cleaning without stress — client books once, gets consistent quality forever. Every crew shows up on time, follows the checklist, sends photos, and asks for a review. No surprises, no excuses.',
        companyCKP:     'Every client renews their contract and refers at least 2 friends within 12 months',
        companyIdeal:   '25 crews working simultaneously. Owner reviews only dashboard KPIs each morning — not fielding calls or fixing problems. $150K/month recurring revenue. Google rating 4.9+. Zero re-cleans.',
        targetAudience: 'Austin homeowners with $80K+ household income, property managers with 5+ units, offices 2,000-50,000 sqft, and Airbnb hosts with 3+ properties. They pay for reliability, not for cheap.',
        avgCheck:       371,
        monthlyRevenue: 118500,
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['cleaning'] = 'SparkClean Pro — Cleaning Company (Austin, TX)';

// ════════════════════════════════════════════════════════════
// BEAUTY SALON — beauty_salon
// "GlowStudio" — студія краси, Київ
// 8 майстрів, 5 функцій, повний цикл + loyalty + абонементи
// ════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['beauty_salon'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];

    // ── 0. ENSURE OWNER IN USERS + CLEAR OLD DEMO DATA ─────
    try {
        await cr.collection('users').doc(uid).set({
            name:'Ірина Кравченко', role:'owner', position:'Власниця / Директор',
            email:'irina.kravchenko@glowstudio.ua',
            functionIds:[], primaryFunctionId:null,
            status:'active', createdAt:now, updatedAt:now,
        }, {merge:true});
    } catch(e) { console.warn('[demo] owner upsert:', e.message); }

    // Clear old demo data from previous niches
    const _clearCols = ['tasks','regularTasks','functions','processTemplates','processes',
        'projects','projectStages','workStandards','coordinations','crm_clients','crm_deals',
        'crm_pipeline','crm_activities','finance_transactions','finance_categories',
        'finance_accounts','finance_recurring','finance_budgets','finance_settings',
        'warehouse_items','warehouse_operations','warehouse_suppliers',
        'metricEntries','metrics','metricTargets','bookings','estimates',
        'estimate_norms','project_estimates','norm_definitions',
        'finance_invoices','coordination_sessions','booking_calendars','booking_schedules','sales'];
    try {
        for (const col of _clearCols) {
            const snap = await cr.collection(col).where('isDemo','==',true).get();
            if (!snap.empty) {
                await window.safeBatchCommit(snap.docs.map(d=>({type:'delete',ref:d.ref})), 'clear-'+col);
            }
        }
    } catch(e) { console.warn('[demo] clear old:', e.message); }

    // ── 1. ФУНКЦІЇ (8 блоків) ────────────────────────────────
    const FUNCS = [
        { name:'0. Маркетинг та залучення клієнтів', color:'#ec4899', desc:'Instagram, TikTok, Google Ads, реферальна програма, акції, SMM, таргет' },
        { name:'1. Запис та адміністрування',        color:'#22c55e', desc:'Онлайн-запис, підтвердження, нагадування, розклад майстрів, адміністратор' },
        { name:'2. Надання послуг / майстри',        color:'#8b5cf6', desc:'Манікюр, педикюр, нарощування нігтів, шелак, брови, вії, косметологія' },
        { name:'3. Сервіс та утримання клієнтів',   color:'#f59e0b', desc:'Win-back, loyalty програма, абонементи, сертифікати, відгуки, NPS' },
        { name:'4. Планування та розвиток',          color:'#3b82f6', desc:'Стратегія, нові напрямки, відкриття нових точок, навчання майстрів' },
        { name:'5. Забезпечення / постачання',       color:'#0ea5e9', desc:'Закупівля матеріалів, інструментів, гель-лаків, косметики, витратних' },
        { name:'6. Фінанси та аналітика',            color:'#ef4444', desc:'Виручка по майстрах, середній чек, завантаженість, KPI, розрахунок зарплат' },
        { name:'7. HR та навчання персоналу',        color:'#6b7280', desc:'Підбір майстрів, онбординг, атестація, мотивація, корпоративна культура' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f, i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Ірина Кравченко',
        status:'active', createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // ── 2. КОМАНДА (10 осіб) ─────────────────────────────────
    try {
        const oldUsers = await cr.collection('users').get();
        if (!oldUsers.empty) {
            const delOps = oldUsers.docs.filter(d => d.id !== uid).map(d => ({type:'delete', ref:d.ref}));
            if (delOps.length) await window.safeBatchCommit(delOps, "step-1-delOps");
        }
    } catch(e) { console.warn('[demo] cleanup users:', e.message); }

    const STAFF = [
        { name:'Ірина Кравченко',  role:'owner',    fi:null, pos:'Власниця / Директор' },
        { name:'Марія Ткаченко',   role:'manager',  fi:1,    pos:'Адміністратор' },
        { name:'Олена Мороз',      role:'employee', fi:2,    pos:'Майстер манікюру (TOP)' },
        { name:'Вікторія Лисенко', role:'employee', fi:2,    pos:'Майстер манікюру' },
        { name:'Аліна Шевченко',   role:'employee', fi:2,    pos:'Майстер нарощування нігтів' },
        { name:'Дарина Петрова',   role:'employee', fi:2,    pos:'Майстер брів та вій' },
        { name:'Катерина Бондар',  role:'employee', fi:2,    pos:'Майстер педикюру' },
        { name:'Юлія Гончар',      role:'employee', fi:3,    pos:'Менеджер лояльності та CRM' },
        { name:'Тетяна Савченко',  role:'employee', fi:6,    pos:'Бухгалтер' },
        { name:'Оксана Поліщук',   role:'employee', fi:0,    pos:'SMM / Таргетолог' },
    ];
    // Use uid for owner slot so tasks assigned to owner show in "My Day"
    const sRefs = STAFF.map((s, i) => i === 0 ? cr.collection('users').doc(uid) : cr.collection('users').doc());
    STAFF.forEach((s, i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        if (i === 0) {
            // Власник — використовуємо update щоб не перезаписати ім'я
            ops.push({type:'update', ref:sRefs[i], data:{
                role:'owner', position:s.pos,
                functionIds:[], primaryFunctionId:null,
                status:'active', updatedAt:now,
            }});
        } else {
            ops.push({type:'set', ref:sRefs[i], data:{
            name:s.name, role:s.role, position:s.pos,
            email:s.name.toLowerCase().replace(/['\s]+/g, '.') + '@glowstudio.ua',
            functionIds:fid ? [fid] : [], primaryFunctionId:fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
        }
    });
    await window.safeBatchCommit(ops, "step-2-ops"); ops = [];

    // assigneeIds для функцій
    const faMap = {
        0:[sRefs[0].id, sRefs[9].id],
        1:[sRefs[1].id],
        2:[sRefs[2].id, sRefs[3].id, sRefs[4].id, sRefs[5].id, sRefs[6].id],
        3:[sRefs[7].id],
        4:[sRefs[0].id],
        5:[sRefs[0].id],
        6:[sRefs[8].id, sRefs[0].id],
        7:[sRefs[0].id],
    };
    await window.safeBatchCommit(
        Object.entries(faMap).map(([fi, aids]) => ({type:'update', ref:fRefs[parseInt(fi)], data:{assigneeIds:aids, updatedAt:now}}))
    );

    // ── 3. НОРМИ КОШТОРИСУ (5) ───────────────────────────────
    const normDefs = [
        {
            name:'Манікюр класичний (1 клієнт)',
            category:'beauty', inputUnit:'клієнт', niche:'beauty_salon',
            materials:[
                {name:'Гель-лак (порція)',          qty:0.1,  unit:'мл',   price:180,  coefficient:1},
                {name:'Топ та база (порція)',        qty:0.1,  unit:'мл',   price:120,  coefficient:1},
                {name:'Пилочка одноразова',         qty:1,    unit:'шт',   price:8,    coefficient:1},
                {name:'Ватні диски',                qty:5,    unit:'шт',   price:1.5,  coefficient:1},
                {name:'Рукавиці нітрилові',         qty:2,    unit:'шт',   price:3,    coefficient:1},
                {name:'Рідина для зняття лаку',     qty:5,    unit:'мл',   price:12,   coefficient:1},
                {name:'Дезінфекція інструментів',   qty:0.05, unit:'порц', price:45,   coefficient:1},
            ],
        },
        {
            name:'Нарощування нігтів гелем (1 клієнт)',
            category:'beauty', inputUnit:'клієнт', niche:'beauty_salon',
            materials:[
                {name:'Гель для нарощування (порція)',qty:2,  unit:'г',    price:95,   coefficient:1},
                {name:'Форми для нарощування',       qty:10,  unit:'шт',   price:4,    coefficient:1},
                {name:'Праймер (порція)',             qty:0.2, unit:'мл',   price:85,   coefficient:1},
                {name:'Дегідратор (порція)',          qty:0.2, unit:'мл',   price:65,   coefficient:1},
                {name:'Гель-лак (порція)',            qty:0.15,unit:'мл',   price:180,  coefficient:1},
                {name:'Топ (порція)',                 qty:0.1, unit:'мл',   price:120,  coefficient:1},
                {name:'Рукавиці нітрилові',          qty:2,   unit:'шт',   price:3,    coefficient:1},
                {name:'Пилочки (набір)',              qty:1,   unit:'набір',price:35,   coefficient:1},
            ],
        },
        {
            name:'Ламінування брів (1 клієнт)',
            category:'beauty', inputUnit:'клієнт', niche:'beauty_salon',
            materials:[
                {name:'Склад для ламінування (порція)',qty:0.5,unit:'мл',  price:120,  coefficient:1},
                {name:'Фарба для брів (порція)',       qty:0.3,unit:'мл',  price:85,   coefficient:1},
                {name:'Фіксатор (порція)',             qty:0.5,unit:'мл',  price:95,   coefficient:1},
                {name:'Щіточки одноразові',            qty:3,  unit:'шт',  price:2,    coefficient:1},
                {name:'Вата',                         qty:5,  unit:'шт',  price:1,    coefficient:1},
                {name:'Силіконові накладки (пара)',    qty:1,  unit:'пара',price:45,   coefficient:1},
            ],
        },
        {
            name:'Педикюр апаратний (1 клієнт)',
            category:'beauty', inputUnit:'клієнт', niche:'beauty_salon',
            materials:[
                {name:'Гель-лак для ніг (порція)',   qty:0.15,unit:'мл',   price:180,  coefficient:1},
                {name:'Фреза (знос)',                qty:0.02,unit:'шт',   price:250,  coefficient:1},
                {name:'Дезінфекція (ванночка)',      qty:0.1, unit:'порц', price:65,   coefficient:1},
                {name:'Рукавиці нітрилові',          qty:2,   unit:'шт',   price:3,    coefficient:1},
                {name:'Топ та база (порція)',         qty:0.1, unit:'мл',   price:120,  coefficient:1},
            ],
        },
        {
            name:'Нарощування вій (1 клієнт)',
            category:'beauty', inputUnit:'клієнт', niche:'beauty_salon',
            materials:[
                {name:'Вії штучні (пучки)',          qty:30,  unit:'шт',   price:4.5,  coefficient:1},
                {name:'Клей для вій (порція)',        qty:0.2, unit:'мл',   price:180,  coefficient:1},
                {name:'Ремувер (порція)',             qty:0.3, unit:'мл',   price:85,   coefficient:1},
                {name:'Ватні палички',               qty:5,   unit:'шт',   price:0.8,  coefficient:1},
                {name:'Патчі під очі (пара)',        qty:1,   unit:'пара', price:12,   coefficient:1},
            ],
        },
    ];

    for (const nd of normDefs) {
        const nRef = cr.collection('norm_definitions').doc();
        ops.push({type:'set', ref:nRef, data:{
            name:nd.name, category:nd.category, inputUnit:nd.inputUnit,
            niche:nd.niche, isActive:true,
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
        for (const m of nd.materials) {
            ops.push({type:'set', ref:nRef.collection('materials').doc(), data:{
                name:m.name, qty:m.qty, unit:m.unit,
                pricePerUnit:m.price, coefficient:m.coefficient,
            }});
        }
    }
    await window.safeBatchCommit(ops, "step-3-ops"); ops = [];

    // ── 4. ЗАВДАННЯ (25) ─────────────────────────────────────
    const TASKS = [
        // Маркетинг (fi:0)
        {t:'Запустити таргетовану рекламу Instagram — акція на квітень',    fi:0, ai:9, d:3,  pr:'high',   est:120, r:'Кампанія активна, перші ліди є'},
        {t:'Зробити Reels для TikTok — нарощування нігтів Аліна',          fi:0, ai:9, d:5,  pr:'high',   est:180, r:'Відео опубліковано, 5000+ переглядів'},
        {t:'Відповісти на всі відгуки Google за тиждень',                   fi:0, ai:1, d:1,  pr:'medium', est:30,  r:'Всі відгуки отримали відповідь'},
        {t:'Розробити офер на абонемент "5+1 безкоштовно" — промо травень', fi:0, ai:0, d:0,  pr:'high',   est:90,  r:'Офер погоджений, пост готовий до публікації'},
        // Адміністрування (fi:1)
        {t:'Дзвінок всім клієнтам, які не були більше 6 тижнів (win-back)', fi:1, ai:7, d:2,  pr:'high',   est:240, r:'50 клієнтів обдзвонено, 8 записів'},
        {t:'Оновити розклад майстрів на травень — погодити відпустки',      fi:1, ai:1, d:4,  pr:'high',   est:60,  r:'Розклад затверджений, всі майстри погодили'},
        {t:'Підтвердити записи на понеділок — SMS розсилка',                fi:1, ai:1, d:1,  pr:'medium', est:20,  r:'Розсилка відправлена, підтверджено 32/35'},
        // Послуги (fi:2)
        {t:'Провести атестацію майстрів манікюру — перевірка якості',       fi:2, ai:0, d:10, pr:'high',   est:180, r:'Атестацію пройшли всі 3 майстри, протокол підписано'},
        {t:'Навчання Вікторії — техніка Мілена (комбі-манікюр)',           fi:2, ai:3, d:14, pr:'medium', est:480, r:'Навчання завершено, сертифікат отримано'},
        {t:'Закупити новинки весна — колекція OPI Spring 2025',            fi:5, ai:0, d:6,  pr:'high',   est:45,  r:'Замовлення оформлено, доставка підтверджена'},
        // Сервіс (fi:3)
        {t:'Зателефонувати клієнтам після першого візиту — зворотний зв\'язок', fi:3, ai:7, d:2, pr:'high', est:120, r:'Опитано 15 нових клієнтів, NPS 9.2'},
        {t:'Нарахувати бонуси за лютий по програмі лояльності',            fi:3, ai:7, d:3,  pr:'high',   est:60,  r:'Бонуси нараховані 87 активним клієнтам'},
        // Планування (fi:4)
        {t:'Підготувати бізнес-план відкриття другої точки GlowStudio',    fi:4, ai:0, d:21, pr:'high',   est:360, r:'Бізнес-план готовий, локація обрана'},
        {t:'Аналіз завантаженості майстрів — квітень vs березень',         fi:4, ai:0, d:7,  pr:'medium', est:90,  r:'Звіт підготовлено, рекомендації надані'},
        // Забезпечення (fi:5)
        {t:'Оформити замовлення витратних матеріалів у постачальника',      fi:5, ai:0, d:2,  pr:'high',   est:45,  r:'Замовлення відправлено, дата доставки — пʼятниця'},
        {t:'Перевірити строк придатності гель-лаків — ревізія складу',     fi:5, ai:1, d:3,  pr:'medium', est:60,  r:'Ревізія проведена, прострочене списано'},
        // Фінанси (fi:6)
        {t:'Розрахувати зарплату майстрів за березень (% від виручки)',     fi:6, ai:8, d:2,  pr:'high',   est:120, r:'Розрахунок готовий, виплати підготовлені'},
        {t:'Подати звіт ФОП за 1 квартал',                                 fi:6, ai:8, d:14, pr:'high',   est:180, r:'Звіт подано, оплата ЄСВ підтверджена'},
        {t:'Звірити касу — тижневий підсумок',                             fi:6, ai:8, d:1,  pr:'medium', est:30,  r:'Каса зведена, розбіжностей немає'},
        // HR (fi:7)
        {t:'Провести співбесіду з кандидатом на майстра косметолога',       fi:7, ai:0, d:5,  pr:'high',   est:60,  r:'Кандидат обраний, пробний день призначено'},
        {t:'Скласти KPI для майстрів на квітень',                          fi:7, ai:0, d:4,  pr:'high',   est:90,  r:'KPI погоджені з кожним майстром'},
        {t:'Провести щотижневу нараду команди — підсумки тижня',           fi:7, ai:0, d:1,  pr:'medium', est:60,  r:'Нарада проведена, протокол записаний'},
        // Поточні (mixed)
        {t:'Замовити стенд із зразками кольорів — оновлення колекції',     fi:5, ai:1, d:8,  pr:'medium', est:30,  r:'Стенд замовлено, надійде через 3 дні'},
        {t:'Оновити профіль Instagram — нові фото робіт Дарини',           fi:0, ai:9, d:3,  pr:'medium', est:120, r:'15 нових фото опубліковано, охоплення +40%'},
        {t:'Виставити рахунок корпоративному клієнту Beauty Corp',         fi:6, ai:8, d:2,  pr:'high',   est:20,  r:'Рахунок відправлено, очікуємо оплату'},
    ];

    for (const t of TASKS) {
        // Завдання власника з d<=1 показуємо сьогодні або вчора (для "Мій день")
        const _deadline = (t.ai === 0 && t.d > 0) ? _demoDate(0) : _demoDate(t.d);
        ops.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'new', priority:t.pr,
            deadlineDate:_deadline, deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-4-ops"); ops = [];

    // ── 5. РЕГУЛЯРНІ ЗАВДАННЯ (12) ───────────────────────────
    const REG_TASKS = [
        {t:'Щоденний звіт виручки — внести в таблицю',       fi:6, ai:8, freq:'daily',   dow:null, est:15, r:'Дані внесені, відхилень від плану немає'},
        {t:'Перевірка відгуків Google та відповідь',          fi:0, ai:9, freq:'daily',   dow:null, est:20, r:'Всі відгуки оброблені'},
        {t:'Зарплата майстрів — щомісячний розрахунок',       fi:6, ai:8, freq:'monthly', dow:null, est:120,r:'Розрахунок готовий, виплати ініційовані'},
        {t:'Нарада команди — підсумки тижня',                 fi:7, ai:0, freq:'weekly',  dow:'1',    est:60, r:'Нарада проведена, задачі розподілені'},
        {t:'Поповнення запасів витратних матеріалів',         fi:5, ai:1, freq:'weekly',  dow:'2',    est:45, r:'Матеріали замовлено, дефіцитів немає'},
        {t:'Контроль KPI майстрів — тижневий звіт',           fi:4, ai:0, freq:'weekly',  dow:'5',    est:60, r:'Звіт підготовлено, аутсайдери отримали фідбек'},
        {t:'Win-back: дзвінки клієнтам 6+ тижнів без візиту',fi:3, ai:7, freq:'weekly',  dow:'3',    est:120,r:'Обдзвонено, частина записалась'},
        {t:'SMM: 3 пости за тиждень + Stories щодня',         fi:0, ai:9, freq:'weekly',  dow:'1',    est:180,r:'Пости опубліковано, охоплення в нормі'},
        {t:'Підтвердження записів на наступний день — SMS',   fi:1, ai:1, freq:'daily',   dow:null, est:20, r:'SMS відправлено, підтвердження отримані'},
        {t:'Нарахування бонусних балів клієнтам за тиждень',  fi:3, ai:7, freq:'weekly',  dow:'5',    est:30, r:'Бали нараховані'},
        {t:'Ревізія складу гель-лаків та списання',           fi:5, ai:1, freq:'monthly', dow:null, est:90, r:'Ревізія проведена, прострочене списано'},
        {t:'Планова дезінфекція інструментів — стерилізація', fi:2, ai:2, freq:'weekly',  dow:'1',    est:45, r:'Стерилізація проведена, журнал підписано'},
    ];
    for (const t of REG_TASKS) {
        ops.push({type:'set', ref:cr.collection('regularTasks').doc(), data:{
            title:t.t,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            period:t.freq,
            dayOfWeek: t.dow !== null ? String(t.dow) : null,
            dayOfMonth: t.freq === 'monthly' ? 1 : null,
            estimatedTime:String(t.est), expectedResult:t.r,
            status:'active', priority:'medium',
            createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-5-ops"); ops = [];

    // ── 6. ШАБЛОНИ ПРОЦЕСІВ (4) ──────────────────────────────
    const TPL_DEFS = [
        {
            name:'Прийом нового клієнта',
            desc:'Стандарт обслуговування нового клієнта GlowStudio від запису до повторного візиту',
            fi:1, color:'#22c55e',
            steps:[
                {n:'Запис та підтвердження',            desc:'Онлайн або телефонний запис, підтвердження за день',  dur:15,  resp:1},
                {n:'Зустріч та консультація',           desc:'Адміністратор зустрічає, майстер консультує',         dur:10,  resp:2},
                {n:'Виконання послуги',                 desc:'Процедура за стандартом якості GlowStudio',            dur:90,  resp:2},
                {n:'Прийом оплати',                     desc:'Готівка або термінал, видача чеку',                    dur:5,   resp:1},
                {n:'Реєстрація в CRM',                  desc:'Внести клієнта, послугу, фото роботи',                 dur:10,  resp:1},
                {n:'Запис на наступний візит',          desc:'Запропонувати дату, нагадування',                      dur:5,   resp:1},
                {n:'SMS подяка + посилання на відгук', desc:'Автоматичне повідомлення через 3 години',              dur:2,   resp:1},
            ],
        },
        {
            name:'Онбординг нового майстра',
            desc:'Стандарт введення в роботу нового майстра GlowStudio',
            fi:7, color:'#8b5cf6',
            steps:[
                {n:'Ознайомлення з правилами студії',   desc:'Підписання договору, корпоративні стандарти',          dur:60,  resp:0},
                {n:'Навчання стандартам GlowStudio',    desc:'Техніки, презентація, стандарти якості',               dur:480, resp:0},
                {n:'Пробний день (3 клієнти)',          desc:'Робота під наглядом старшого майстра',                  dur:360, resp:2},
                {n:'Оцінка якості роботи',              desc:'Фото, фідбек, атестація',                              dur:60,  resp:0},
                {n:'Доступ до системи / розкладу',      desc:'Налаштування CRM, графік',                            dur:30,  resp:1},
                {n:'Перший самостійний прийом',         desc:'Перший робочий день, контроль',                        dur:480, resp:2},
            ],
        },
        {
            name:'Закупівля матеріалів',
            desc:'Процес замовлення та прийому витратних матеріалів для студії',
            fi:5, color:'#0ea5e9',
            steps:[
                {n:'Перевірка залишків складу',         desc:'Ревізія гель-лаків, витратних, косметики',             dur:30,  resp:1},
                {n:'Формування списку замовлення',      desc:'Підготовка списку за нормами витрат',                  dur:20,  resp:1},
                {n:'Погодження бюджету з власницею',    desc:'Затвердження суми закупівлі',                          dur:15,  resp:0},
                {n:'Відправка замовлення постачальнику',desc:'Email або через кабінет постачальника',                 dur:15,  resp:1},
                {n:'Прийом товару та перевірка',        desc:'Перевірка кількості, якості, строків',                 dur:45,  resp:1},
                {n:'Оприбуткування на склад',           desc:'Внесення в систему складу',                            dur:20,  resp:1},
            ],
        },
        {
            name:'Робота зі скаргою клієнта',
            desc:'Стандарт обробки скарг та негативних відгуків',
            fi:3, color:'#f59e0b',
            steps:[
                {n:'Отримання та реєстрація скарги',    desc:'Фіксація в CRM, час, суть, клієнт',                   dur:10,  resp:7},
                {n:'Вибачення та визнання проблеми',    desc:'Контакт з клієнтом протягом 2 годин',                  dur:20,  resp:0},
                {n:'Аналіз ситуації',                   desc:'Спілкування з майстром, перевірка факту',              dur:30,  resp:0},
                {n:'Пропозиція компенсації',            desc:'Безкоштовна повторна послуга або знижка',              dur:15,  resp:0},
                {n:'Вирішення питання',                 desc:'Переробка, повернення або компенсація',                 dur:120, resp:2},
                {n:'Контрольний зв\'язок',              desc:'Дзвінок через 3 дні — чи задоволений клієнт',          dur:10,  resp:7},
            ],
        },
    ];
    const tplRefs = TPL_DEFS.map(() => cr.collection('processTemplates').doc());
    for (let i = 0; i < TPL_DEFS.length; i++) {
        const tpl = TPL_DEFS[i];
        ops.push({type:'set', ref:tplRefs[i], data:{
            name:tpl.name, description:tpl.desc, color:tpl.color,
            functionId:fRefs[tpl.fi].id, functionName:FUNCS[tpl.fi].name,
            stepsCount:tpl.steps.length, isActive:true,
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
        for (let j = 0; j < tpl.steps.length; j++) {
            const s = tpl.steps[j];
            ops.push({type:'set', ref:tplRefs[i].collection('steps').doc(), data:{
                order:j+1, name:s.n, description:s.desc,
                estimatedDuration:s.dur,
                responsibleFunctionId:fRefs[s.resp].id,
                responsibleFunctionName:FUNCS[s.resp].name,
                requiresApproval:false, createdAt:now,
            }});
        }
    }
    await window.safeBatchCommit(ops, "step-6-ops"); ops = [];

    // Активні процеси (7)
    const PROCS = [
        {tpl:0, name:'Онбординг — новий майстер Наталія Іванова', step:3, ai:0},
        {tpl:2, name:'Закупівля весняної колекції OPI + Kodi',    step:2, ai:1},
        {tpl:0, name:'Прийом VIP-клієнта Коваленко Олена',        step:5, ai:2},
        {tpl:3, name:'Скарга клієнта Мартиненко — відтінок',      step:4, ai:7},
        {tpl:1, name:'Онбординг нового адміністратора',            step:4, ai:0},
        {tpl:2, name:'Закупівля косметологічних препаратів',       step:3, ai:1},
        {tpl:0, name:'Нова клієнтка з Instagram — Поліна Руденко', step:2, ai:2},
    ];
    for (const p of PROCS) {
        ops.push({type:'set', ref:cr.collection('processes').doc(), data:{
            templateId:tplRefs[p.tpl].id, templateName:TPL_DEFS[p.tpl].name,
            name:p.name, currentStep:p.step, status:'active',
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            startDate:_demoDate(-5), deadline:_demoDate(14),
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-7-ops"); ops = [];

    // ── 7. ПРОЄКТИ (2 повних) ────────────────────────────────
    const PROJS = [
        {
            name:'Відкриття другої точки GlowStudio — ТРЦ Гулівер',
            desc:'Відкриття філії GlowStudio у ТРЦ Гулівер — 5 крісел, 6 майстрів, старт 1 червня',
            color:'#ec4899', rev:2400000, labor:380000, mat:680000, start:-15, end:75,
        },
        {
            name:'Запуск напрямку косметологія — кабінет та апарати',
            desc:'Обладнання кабінету косметології, навчання спеціаліста, перші клієнти',
            color:'#8b5cf6', rev:960000, labor:120000, mat:420000, start:-20, end:45,
        },
    ];
    for (const p of PROJS) {
        ops.push({type:'set', ref:cr.collection('projects').doc(), data:{
            name:p.name, description:p.desc, status:'active', color:p.color,
            startDate:_demoDate(p.start), deadline:_demoDate(p.end),
            plannedRevenue:p.rev, plannedLaborCost:p.labor, plannedMaterialCost:p.mat,
            assigneeId:uid, createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-8-ops"); ops = [];

    // Етапи проєктів
    const projSnap = await cr.collection('projects').get();
    const projDocs = projSnap.docs.map(d => ({id:d.id, name:d.data().name||''}));
    const stageOps = [];
    for (const proj of projDocs) {
        const pn = proj.name || '';
        let stages = [];
        if (pn.includes('Гулівер') || pn.includes('друг')) {
            stages = [
                {n:'Переговори з ТРЦ та підписання договору оренди', status:'done',        order:1, s:-15, e:-10},
                {n:'Дизайн-проект та затвердження планування',        status:'done',        order:2, s:-10, e:-5},
                {n:'Ремонт та оздоблення приміщення',                status:'in_progress', order:3, s:-5,  e:20},
                {n:'Закупівля обладнання та меблів',                  status:'in_progress', order:4, s:5,   e:25},
                {n:'Підбір та навчання команди',                      status:'planned',     order:5, s:20,  e:45},
                {n:'Маркетингова кампанія відкриття',                 status:'planned',     order:6, s:45,  e:70},
                {n:'Гранд-відкриття та перші клієнти',               status:'planned',     order:7, s:72,  e:75},
            ];
        } else if (pn.includes('косметолог')) {
            stages = [
                {n:'Підбір та закупівля апаратів (лазер, RF)',        status:'done',        order:1, s:-20, e:-10},
                {n:'Ремонт та обладнання кабінету',                   status:'done',        order:2, s:-10, e:-3},
                {n:'Навчання косметолога — курс та сертифікат',       status:'in_progress', order:3, s:-3,  e:14},
                {n:'Отримання ліцензії на косметологічні послуги',    status:'planned',     order:4, s:14,  e:28},
                {n:'Запуск реклами нового напрямку',                  status:'planned',     order:5, s:28,  e:38},
                {n:'Перші клієнти та аналіз результатів',             status:'planned',     order:6, s:38,  e:45},
            ];
        }
        for (const s of stages) {
            stageOps.push({type:'set', ref:cr.collection('projectStages').doc(), data:{
                projectId:proj.id, name:s.n, order:s.order, status:s.status,
                plannedStartDate:_demoDate(s.s), plannedEndDate:_demoDate(s.e),
                actualStartDate:s.status==='done'?_demoDate(s.s):null,
                actualEndDate:s.status==='done'?_demoDate(s.e):null,
                progressPct:s.status==='done'?100:s.status==='in_progress'?45:0,
                createdAt:now, updatedAt:now,
            }});
        }
    }
    if (stageOps.length) await window.safeBatchCommit(stageOps, "step-9-stageOps");

    // Завдання проєктів
    const projSnap2 = await cr.collection('projects').get();
    const pByName = {};
    projSnap2.docs.forEach(d => {
        const name = d.data().name || '';
        if (name.includes('Гулівер') || name.includes('друг')) pByName['guliver'] = {id:d.id, name};
        if (name.includes('косметолог')) pByName['cosm'] = {id:d.id, name};
    });
    const projTaskOps = [];
    if (pByName.guliver) {
        const {id:pid, name:pname} = pByName.guliver;
        [
            {t:'Підписати договір оренди в ТРЦ Гулівер',                      fi:4, ai:0, d:-8, pr:'high',   est:120, r:'Договір підписано, акт прийому-передачі оформлено'},
            {t:'Затвердити дизайн-проект другої точки',                        fi:4, ai:0, d:-4, pr:'high',   est:60,  r:'Дизайн затверджено, підрядник отримав ТЗ'},
            {t:'Закупити 5 крісел майстра та обладнання',                      fi:5, ai:0, d:8,  pr:'high',   est:90,  r:'Замовлення оформлено, доставка підтверджена'},
            {t:'Підібрати 4 майстри манікюру для нової точки',                 fi:7, ai:0, d:25, pr:'high',   est:240, r:'4 майстри відібрано, договори підписані'},
            {t:'Запустити рекламну кампанію відкриття — Instagram + TikTok',   fi:0, ai:9, d:50, pr:'high',   est:180, r:'Кампанія запущена, 500+ заявок'},
            {t:'Розробити систему лояльності для нової точки',                  fi:3, ai:7, d:30, pr:'medium', est:120, r:'Програма лояльності налаштована в CRM'},
            {t:'Підготувати кошторис на ремонт та оздоблення',                 fi:4, ai:0, d:3,  pr:'high',   est:90,  r:'Кошторис затверджено, аванс виплачено'},
            {t:'Навчання нової команди стандартам GlowStudio',                 fi:7, ai:0, d:40, pr:'high',   est:480, r:'Команда навчена, атестацію пройдено'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:t.d < 0 ? 'done' : 'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }
    if (pByName.cosm) {
        const {id:pid, name:pname} = pByName.cosm;
        [
            {t:'Замовити апарат RF-ліфтинг та ультразвук',                     fi:5, ai:0, d:-12, pr:'high',   est:60,  r:'Апарати замовлено, доставка через 2 тижні'},
            {t:'Підготувати кабінет косметолога — меблі та стерилізатор',      fi:5, ai:1, d:-5,  pr:'high',   est:120, r:'Кабінет облаштовано, стерилізатор встановлено'},
            {t:'Записати косметолога на курс апаратної косметології',           fi:7, ai:0, d:-3,  pr:'high',   est:30,  r:'Запис підтверджено, курс 14 днів'},
            {t:'Отримати ліцензію на косметологічні послуги',                   fi:4, ai:0, d:20,  pr:'high',   est:180, r:'Ліцензія отримана'},
            {t:'Сфотографувати кабінет та підготувати контент',                 fi:0, ai:9, d:30,  pr:'medium', est:120, r:'15 фото та 2 Reels готові'},
            {t:'Встановити прайс на косметологію та погодити з власницею',      fi:4, ai:0, d:15,  pr:'high',   est:45,  r:'Прайс затверджено та розміщено на сайті'},
        ].forEach(t => projTaskOps.push({type:'set', ref:cr.collection('tasks').doc(), data:{
            title:t.t, projectId:pid, projectName:pname,
            functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
            assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:t.d < 0 ? 'done' : 'new', priority:t.pr,
            deadlineDate:_demoDate(t.d), deadlineTime:'18:00',
            estimatedTime:String(t.est), expectedResult:t.r,
            requireReview:true, createdAt:now, updatedAt:now,
        }}));
    }
    if (projTaskOps.length) await window.safeBatchCommit(projTaskOps, "step-10-projTaskOps");

    // ── 8. КОШТОРИС (2 об'єкти) ──────────────────────────────
    const estRef1 = cr.collection('estimates').doc();
    const estRef2 = cr.collection('estimates').doc();
    ops.push({type:'set', ref:estRef1, data:{
        name:'Відкриття точки ТРЦ Гулівер — кошторис',
        client:'GlowStudio (власний проект)', clientPhone:'',
        status:'approved', totalAmount:680000, currency:'UAH',
        projectId:pByName.guliver?.id || '',
        createdBy:uid, createdAt:now, updatedAt:now,
    }});
    ops.push({type:'set', ref:estRef2, data:{
        name:'Кабінет косметології — обладнання та матеріали',
        client:'GlowStudio (внутрішній)', clientPhone:'',
        status:'approved', totalAmount:420000, currency:'UAH',
        projectId:pByName.cosm?.id || '',
        createdBy:uid, createdAt:now, updatedAt:now,
    }});
    await window.safeBatchCommit(ops, "step-11-ops"); ops = [];

    // Позиції кошторису — точка Гулівер
    const estItems1 = [
        {name:'Крісла майстра манікюру (5 шт)',     qty:5,  unit:'шт',   price:18000,  cat:'Меблі та обладнання'},
        {name:'Стійка адміністратора',              qty:1,  unit:'шт',   price:24000,  cat:'Меблі та обладнання'},
        {name:'Дзеркала настінні з підсвіткою',    qty:5,  unit:'шт',   price:8500,   cat:'Меблі та обладнання'},
        {name:'Ремонт та оздоблення 80м²',         qty:80, unit:'м²',   price:4500,   cat:'Ремонт'},
        {name:'Вивіска та брендинг (зовнішній)',   qty:1,  unit:'компл',price:32000,  cat:'Маркетинг'},
        {name:'Бактерицидний рециркулятор (2шт)',  qty:2,  unit:'шт',   price:4800,   cat:'Обладнання'},
        {name:'UV/LED лампи для манікюру (5шт)',   qty:5,  unit:'шт',   price:2800,   cat:'Обладнання'},
        {name:'Стартовий запас гель-лаків (500шт)',qty:500,unit:'шт',   price:180,    cat:'Матеріали'},
        {name:'Витратні матеріали (старт)',         qty:1,  unit:'компл',price:18000,  cat:'Матеріали'},
        {name:'Система запису (CRM налаштування)', qty:1,  unit:'компл',price:8000,   cat:'IT'},
    ];
    await window.safeBatchCommit(estItems1.map(item => ({type:'set', ref:estRef1.collection('items').doc(), data:{
        name:item.name, quantity:item.qty, unit:item.unit,
        pricePerUnit:item.price, totalPrice:item.qty * item.price,
        category:item.cat, createdAt:now,
    }})));

    // Позиції кошторису — кабінет косметології
    const estItems2 = [
        {name:'Апарат RF-ліфтинг Beautytek',       qty:1,  unit:'шт',   price:185000, cat:'Апарати'},
        {name:'УЗ-кавітація апарат',               qty:1,  unit:'шт',   price:98000,  cat:'Апарати'},
        {name:'Стерилізатор автоклав 23л',          qty:1,  unit:'шт',   price:32000,  cat:'Обладнання'},
        {name:'Кушетка косметологічна',             qty:1,  unit:'шт',   price:28000,  cat:'Меблі'},
        {name:'Ремонт кабінету 15м²',              qty:15, unit:'м²',   price:3800,   cat:'Ремонт'},
        {name:'Косметологічна косметика (старт)',   qty:1,  unit:'компл',price:45000,  cat:'Матеріали'},
        {name:'Одноразові матеріали (старт)',       qty:1,  unit:'компл',price:12000,  cat:'Матеріали'},
        {name:'Навчання косметолога',               qty:1,  unit:'курс', price:20000,  cat:'Навчання'},
    ];
    await window.safeBatchCommit(estItems2.map(item => ({type:'set', ref:estRef2.collection('items').doc(), data:{
        name:item.name, quantity:item.qty, unit:item.unit,
        pricePerUnit:item.price, totalPrice:item.qty * item.price,
        category:item.cat, createdAt:now,
    }})));

    // ── 9. CRM (20 клієнтів + угоди) ─────────────────────────
    const CLIENTS = [
        {n:'Коваленко Олена',     phone:'+38067-111-2233', src:'instagram', vis:18, spent:42800, lv:'vip',    lb:850,  tag:['VIP','нарощування']},
        {n:'Мартиненко Яна',      phone:'+38050-234-5678', src:'referral',  vis:12, spent:28400, lv:'loyal',  lb:568,  tag:['манікюр','лояльна']},
        {n:'Бондаренко Світлана', phone:'+38095-345-6789', src:'google',    vis:8,  spent:19600, lv:'regular',lb:392,  tag:['педикюр']},
        {n:'Іваненко Тетяна',     phone:'+38093-456-7890', src:'instagram', vis:15, spent:35200, lv:'vip',    lb:704,  tag:['VIP','брови']},
        {n:'Сидоренко Наталія',   phone:'+38067-567-8901', src:'tiktok',    vis:6,  spent:14400, lv:'regular',lb:288,  tag:['нарощування']},
        {n:'Гончар Анна',         phone:'+38050-678-9012', src:'referral',  vis:20, spent:48000, lv:'vip',    lb:960,  tag:['VIP','абонемент']},
        {n:'Поліщук Ірина',       phone:'+38095-789-0123', src:'google',    vis:4,  spent:9600,  lv:'new',    lb:192,  tag:['нова']},
        {n:'Кравченко Юлія',      phone:'+38093-890-1234', src:'instagram', vis:9,  spent:21600, lv:'regular',lb:432,  tag:['манікюр']},
        {n:'Шевченко Ліна',       phone:'+38067-901-2345', src:'tiktok',    vis:11, spent:26400, lv:'loyal',  lb:528,  tag:['вії','абонемент']},
        {n:'Тищенко Оксана',      phone:'+38050-012-3456', src:'referral',  vis:7,  spent:16800, lv:'regular',lb:336,  tag:['брови']},
        {n:'Руденко Поліна',      phone:'+38095-123-4567', src:'instagram', vis:2,  spent:4800,  lv:'new',    lb:96,   tag:['нова','instagram']},
        {n:'Лисенко Марина',      phone:'+38093-234-5678', src:'google',    vis:14, spent:33600, lv:'loyal',  lb:672,  tag:['VIP','педикюр']},
        {n:'Мороз Катерина',      phone:'+38067-345-6789', src:'referral',  vis:16, spent:38400, lv:'vip',    lb:768,  tag:['VIP','нарощування']},
        {n:'Ткач Вікторія',       phone:'+38050-456-7890', src:'instagram', vis:5,  spent:12000, lv:'regular',lb:240,  tag:['манікюр']},
        {n:'Бойко Людмила',       phone:'+38095-567-8901', src:'tiktok',    vis:3,  spent:7200,  lv:'new',    lb:144,  tag:['нова']},
        {n:'Захарченко Олена',    phone:'+38093-678-9012', src:'google',    vis:10, spent:24000, lv:'regular',lb:480,  tag:['брови','вії']},
        {n:'Петренко Дар\'я',     phone:'+38067-789-0123', src:'instagram', vis:13, spent:31200, lv:'loyal',  lb:624,  tag:['абонемент']},
        {n:'Романенко Аліна',     phone:'+38050-890-1234', src:'referral',  vis:8,  spent:19200, lv:'regular',lb:384,  tag:['педикюр']},
        {n:'Власенко Ганна',      phone:'+38095-901-2345', src:'tiktok',    vis:1,  spent:2400,  lv:'new',    lb:48,   tag:['нова','тікток']},
        {n:'Харченко Ніна',       phone:'+38093-012-3456', src:'google',    vis:22, spent:52800, lv:'vip',    lb:1056, tag:['VIP','топ-клієнт']},
    ];

    const crmRefs = CLIENTS.map(() => cr.collection('crm_clients').doc());
    CLIENTS.forEach((c, i) => ops.push({type:'set', ref:crmRefs[i], data:{
        name:c.n, phone:c.phone, source:c.src,
        totalVisits:c.vis, totalSpent:c.spent,
        loyaltyLevel:c.lv, bonusBalance:c.lb,
        tags:c.tag, status:'active',
        lastVisitDate:_demoDate(-Math.floor(Math.random()*21+1)),
        nextVisitDate:_demoDate(Math.floor(Math.random()*14+1)),
        assignedMasterId:sRefs[2+Math.floor(i%5)].id,
        assignedMasterName:STAFF[2+Math.floor(i%5)].name,
        notes:i%3===0?'Важливий клієнт, запис тільки з підтвердженням':'',
        createdBy:uid, createdAt:now, updatedAt:now,
    }}));
    await window.safeBatchCommit(ops, "step-12-ops"); ops = [];

    // CRM угоди/ліди
    const DEALS = [
        {ci:0, name:'Абонемент на манікюр — 5 сесій',    amt:3500, st:'won',     src:'instagram'},
        {ci:5, name:'Корпоративний депозит Beauty Corp', amt:28000,st:'won',     src:'referral'},
        {ci:12,name:'Абонемент нарощування — квартал',   amt:9800, st:'won',     src:'referral'},
        {ci:3, name:'VIP пакет — брови+вії+манікюр',     amt:4800, st:'in_work', src:'instagram'},
        {ci:10,name:'Перший записувальний пакет',         amt:1200, st:'in_work', src:'instagram'},
        {ci:14,name:'Абонемент педикюру — 3 місяці',     amt:5400, st:'in_work', src:'tiktok'},
        {ci:18,name:'Манікюр + нарощування — пробний',   amt:800,  st:'new',     src:'tiktok'},
        {ci:7, name:'Комбо: манікюр+педикюр щомісяця',  amt:2200, st:'new',     src:'google'},
    ];
    await window.safeBatchCommit(DEALS.map(d => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        clientId:crmRefs[d.ci].id, clientName:CLIENTS[d.ci].n,
        name:d.name, amount:d.amt, currency:'UAH', status:d.st, source:d.src,
        managerId:sRefs[7].id, managerName:STAFF[7].name,
        createdAt:now, updatedAt:now,
    }})));

    // ── 10. ФІНАНСИ ──────────────────────────────────────────
    const finSettingsRef = cr.collection('finance_settings').doc('main');
    await finSettingsRef.set({isDemo:true, version:1, region:'UA', currency:'UAH', niche:'beauty_salon', initializedAt:now, initializedBy:uid, updatedAt:now});

    try {
        for (const col of ['finance_accounts','finance_transactions','finance_categories','finance_recurring','finance_budgets']) {
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
        {name:'Приватбанк ФОП Кравченко',       type:'bank', balance:318500, currency:'UAH', isDefault:true},
        {name:'Каса студії (готівка)',           type:'cash', balance:48200,  currency:'UAH', isDefault:false},
        {name:'Monobank корпоративна',           type:'card', balance:92000,  currency:'UAH', isDefault:false},
    ];
    const finOps = [];
    ACCOUNTS.forEach((a, i) => finOps.push({type:'set', ref:accRefs[i], data:{...a, createdBy:uid, createdAt:now, updatedAt:now}}));

    const FIN_CATS = [
        {name:'Виручка — послуги майстрів',     type:'income',  color:'#22c55e', icon:'scissors'},
        {name:'Абонементи та депозити',         type:'income',  color:'#16a34a', icon:'credit-card'},
        {name:'Корпоративні клієнти',           type:'income',  color:'#84cc16', icon:'briefcase'},
        {name:'Продаж косметики (ретейл)',      type:'income',  color:'#f0abfc', icon:'shopping-bag'},
        {name:'Матеріали та косметика',         type:'expense', color:'#ef4444', icon:'package'},
        {name:'Зарплата майстрів (% + оклад)',  type:'expense', color:'#f97316', icon:'users'},
        {name:'Зарплата адмін та менеджмент',   type:'expense', color:'#fb923c', icon:'user'},
        {name:'Оренда приміщення',              type:'expense', color:'#8b5cf6', icon:'home'},
        {name:'Реклама / SMM / Таргет',         type:'expense', color:'#ec4899', icon:'trending-up'},
        {name:'Обладнання та ТО апаратів',      type:'expense', color:'#0ea5e9', icon:'tool'},
        {name:'CRM та IT',                      type:'expense', color:'#6b7280', icon:'settings'},
        {name:'Комунальні послуги',             type:'expense', color:'#9ca3af', icon:'zap'},
    ];
    const catRefs = FIN_CATS.map(() => cr.collection('finance_categories').doc());
    FIN_CATS.forEach((c, i) => finOps.push({type:'set', ref:catRefs[i], data:{name:c.name, type:c.type, color:c.color, icon:c.icon, isDefault:false, createdBy:uid, createdAt:now}}));
    await window.safeBatchCommit(finOps, "step-13-finOps");

    // Транзакції — 5 тижнів (35 записів)
    const TXS = [
        // Поточний тиждень
        {ci:0, acc:1, amt:38400, note:'Виручка майстрів — понеділок-п\'ятниця цей тиждень', d:-1},
        {ci:1, acc:2, amt:3500,  note:'Абонемент Коваленко Олена — 5 манікюрів',            d:-1},
        {ci:3, acc:1, amt:2800,  note:'Продаж гель-лаку клієнткам (12 шт)',                 d:-2},
        {ci:4, acc:0, amt:8200,  note:'Матеріали — гель-лаки Kodi 50шт + витратні',         d:-3},
        {ci:7, acc:0, amt:32000, note:'Оренда — квітень 2025',                              d:-1},
        {ci:8, acc:0, amt:6500,  note:'Таргет Instagram + TikTok — квітень',               d:-2},
        // Минулий тиждень
        {ci:0, acc:1, amt:42600, note:'Виручка майстрів — тиждень -2',                     d:-8},
        {ci:1, acc:2, amt:9800,  note:'Абонемент нарощування Мороз Катерина — квартал',    d:-9},
        {ci:2, acc:0, amt:28000, note:'Корпоратив Beauty Corp — аванс',                    d:-10},
        {ci:5, acc:0, amt:68000, note:'Зарплата майстрів — аванс квітень',                 d:-10},
        {ci:6, acc:0, amt:18000, note:'Зарплата адміністратор + менеджер лояльності',      d:-10},
        {ci:4, acc:0, amt:12400, note:'Матеріали — замовлення весняна колекція OPI',       d:-12},
        // -2 тижні
        {ci:0, acc:1, amt:39800, note:'Виручка майстрів — тиждень -3',                     d:-15},
        {ci:0, acc:1, amt:44200, note:'Виручка майстрів — вихідні + п\'ятниця',            d:-16},
        {ci:1, acc:2, amt:5400,  note:'Абонемент педикюру Петренко Дар\'я',                d:-18},
        {ci:8, acc:0, amt:6500,  note:'Таргет березень — Meta Ads',                        d:-20},
        {ci:4, acc:0, amt:9800,  note:'Косметика для косметологічного кабінету',           d:-17},
        {ci:9, acc:0, amt:98000, note:'УЗ-кавітація апарат — оплата (кошторис косметол.)',d:-19},
        // -3 тижні
        {ci:0, acc:1, amt:37600, note:'Виручка майстрів — тиждень -4',                     d:-22},
        {ci:2, acc:0, amt:12500, note:'Корпоратив — Beauty Day офіс Kyiv Digital',         d:-23},
        {ci:5, acc:0, amt:72000, note:'Зарплата майстрів — березень фінальний розрахунок', d:-25},
        {ci:7, acc:0, amt:32000, note:'Оренда — березень',                                 d:-30},
        {ci:10,acc:0, amt:1800,  note:'CRM TALKO System — підписка квітень',               d:-25},
        {ci:11,acc:0, amt:5200,  note:'Комунальні + електрика — квітень',                  d:-26},
        // -4 тижні
        {ci:0, acc:1, amt:41200, note:'Виручка майстрів — тиждень -5',                     d:-29},
        {ci:1, acc:2, amt:28000, note:'Абонементи та депозити — місяць',                   d:-30},
        {ci:4, acc:0, amt:10500, note:'Матеріали березень — щомісячна закупівля',          d:-32},
        {ci:8, acc:0, amt:6500,  note:'Реклама Google + SEO — березень',                   d:-33},
        {ci:3, acc:1, amt:4200,  note:'Продаж косметики — березень',                       d:-32},
        // -5 тижнів
        {ci:0, acc:1, amt:35800, note:'Виручка майстрів — тиждень -6',                     d:-36},
        {ci:2, acc:0, amt:8800,  note:'Корпоратив February special — офіс',               d:-38},
        {ci:5, acc:0, amt:69000, note:'Зарплата майстрів — лютий',                         d:-40},
        {ci:7, acc:0, amt:32000, note:'Оренда — лютий',                                    d:-40},
        {ci:4, acc:0, amt:9200,  note:'Матеріали — лютий закупівля',                       d:-38},
        {ci:9, acc:0, amt:185000,note:'RF-ліфтинг апарат Beautytek — оплата',             d:-35},
    ];

    // Map transaction notes to project IDs
    const projSnapFin = await cr.collection('projects').get();
    const projDocsFin = projSnapFin.docs.map(d => ({id:d.id, name:d.data().name||''}));
    const _getProjId = (note) => {
        const n = (note||'').toLowerCase();
        const p = projDocsFin.find(p => {
            if ((n.includes('гулівер') || n.includes('друг')) && p.name.includes('Гулівер')) return true;
            if (n.includes('косметолог') && p.name.includes('косметолог')) return true;
            return false;
        });
        return p ? p.id : '';
    };
    const _getFuncId = (note) => {
        const n = (note||'').toLowerCase();
        if (n.includes('таргет') || n.includes('реклам') || n.includes('smm')) return fRefs[0].id;
        if (n.includes('запис') || n.includes('адмін')) return fRefs[1].id;
        if (n.includes('майстр') || n.includes('виручка') || n.includes('послуг')) return fRefs[2].id;
        if (n.includes('зарплат')) return fRefs[6].id;
        if (n.includes('оренда')) return fRefs[5].id;
        if (n.includes('матеріал') || n.includes('закуп') || n.includes('косметик')) return fRefs[5].id;
        return '';
    };
    const txOps = TXS.map(tx => ({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
        categoryId:catRefs[tx.ci].id, categoryName:FIN_CATS[tx.ci].name,
        accountId:accRefs[tx.acc].id, accountName:ACCOUNTS[tx.acc].name,
        type:FIN_CATS[tx.ci].type, amount:tx.amt, currency:'UAH',
        note:tx.note, date:_demoTsFinance(tx.d),
        projectId:_getProjId(tx.note),
        functionId:_getFuncId(tx.note),
        createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(txOps, "step-14-txOps");

    const regPays = [
        {name:'Оренда студії GlowStudio',            type:'expense', amount:32000, day:1,  freq:'monthly', comment:'вул. Хрещатик 12, Київ'},
        {name:'Зарплата адміністратора',              type:'expense', amount:14000, day:25, freq:'monthly', comment:'Марія Ткаченко'},
        {name:'Зарплата менеджера лояльності',        type:'expense', amount:12000, day:25, freq:'monthly', comment:'Юлія Гончар'},
        {name:'Зарплата бухгалтера',                  type:'expense', amount:10000, day:25, freq:'monthly', comment:'Тетяна Савченко'},
        {name:'CRM TALKO System',                     type:'expense', amount:1800,  day:1,  freq:'monthly', comment:'Підписка'},
        {name:'Таргет Instagram + TikTok',            type:'expense', amount:6500,  day:5,  freq:'monthly', comment:'Meta Ads + TikTok Ads'},
        {name:'Комунальні + електрика',               type:'expense', amount:5200,  day:10, freq:'monthly', comment:'Включно з опаленням'},
        {name:'Матеріали — щомісячна закупівля',      type:'expense', amount:11000, day:15, freq:'monthly', comment:'Гель-лаки, витратні, косметика'},
        {name:'ТО обладнання УФ-ламп та апаратів',   type:'expense', amount:2800,  day:15, freq:'monthly', comment:'Сервісний контракт'},
        {name:'Страхування ФОП',                      type:'expense', amount:1200,  day:1,  freq:'monthly', comment:'ЄСВ + страховка'},
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
        {month:_demoDate(-35).slice(0,7), goal:140000},
        {month:_demoDate(-10).slice(0,7), goal:155000},
        {month:_demoDate(20).slice(0,7),  goal:170000},
    ];
    await window.safeBatchCommit(budgetMonths.map(bm => ({type:'set', ref:cr.collection('finance_budgets').doc(bm.month), data:{
        month:bm.month, goal:bm.goal,
        ...(finCatMap['Матеріали та косметика']      ? {['cat_'+finCatMap['Матеріали та косметика']]:      11000} : {}),
        ...(finCatMap['Зарплата майстрів (% + оклад)']? {['cat_'+finCatMap['Зарплата майстрів (% + оклад)']]:70000} : {}),
        ...(finCatMap['Реклама / SMM / Таргет']       ? {['cat_'+finCatMap['Реклама / SMM / Таргет']]:       6500} : {}),
        ...(finCatMap['Оренда приміщення']            ? {['cat_'+finCatMap['Оренда приміщення']]:           32000} : {}),
        updatedAt:now,
    }})));

    // ── 11. СКЛАД ────────────────────────────────────────────
    const STOCK = [
        {name:'Гель-лак Kodi Professional (шт)',     sku:'GEL-KODI',   cat:'Гель-лаки',     unit:'шт',   qty:215, min:50,  price:180},
        {name:'Гель-лак OPI GelColor (шт)',           sku:'GEL-OPI',    cat:'Гель-лаки',     unit:'шт',   qty:88,  min:30,  price:320},
        {name:'Топ без липкого шару Kodi (30мл)',     sku:'TOP-KODI',   cat:'База та топ',   unit:'фл',   qty:18,  min:10,  price:185},
        {name:'База каучукова Kodi (30мл)',           sku:'BASE-KODI',  cat:'База та топ',   unit:'фл',   qty:22,  min:10,  price:165},
        {name:'Праймер Bluesky (15мл)',               sku:'PRM-BLUE',   cat:'Праймери',      unit:'фл',   qty:8,   min:5,   price:145},
        {name:'Рукавиці нітрилові S (пачка 100шт)',  sku:'GLV-S',      cat:'Захист',        unit:'пачка',qty:14,  min:10,  price:155},
        {name:'Рукавиці нітрилові M (пачка 100шт)',  sku:'GLV-M',      cat:'Захист',        unit:'пачка',qty:22,  min:10,  price:155},
        {name:'Пилочки одноразові (уп. 50шт)',       sku:'FILE-50',    cat:'Інструменти',   unit:'уп',   qty:8,   min:5,   price:120},
        {name:'Ватні диски (пачка 100шт)',            sku:'COT-DISC',   cat:'Витратні',      unit:'пачка',qty:35,  min:15,  price:65},
        {name:'Рідина для зняття лаку (500мл)',       sku:'REM-500',    cat:'Хімія',         unit:'фл',   qty:12,  min:5,   price:185},
        {name:'Форми для нарощування (уп. 500шт)',   sku:'FORM-500',   cat:'Нарощування',   unit:'уп',   qty:6,   min:3,   price:280},
        {name:'Гель для нарощування Kira Nails (г)', sku:'GEL-NAR',    cat:'Нарощування',   unit:'г',    qty:450, min:200, price:4.5},
        {name:'Клей для вій Lovely (5г)',            sku:'GLUE-EYE',   cat:'Вії',           unit:'шт',   qty:9,   min:5,   price:320},
        {name:'Вії пучкові 0.10 C (50 ліній)',       sku:'LASH-C10',   cat:'Вії',           unit:'уп',   qty:28,  min:15,  price:180},
        {name:'Фарба для брів RefectoCil (15мл)',    sku:'BROW-REF',   cat:'Брови',         unit:'шт',   qty:15,  min:8,   price:245},
        {name:'Склад для ламінування брів (6мл)',    sku:'LAM-BROW',   cat:'Брови',         unit:'шт',   qty:12,  min:6,   price:320},
        {name:'Дезінфектант Kodan (250мл)',          sku:'DIS-KOD',    cat:'Дезінфекція',   unit:'фл',   qty:7,   min:4,   price:225},
        {name:'Серветки безворсові (уп. 200шт)',     sku:'WIPE-200',   cat:'Витратні',      unit:'уп',   qty:24,  min:10,  price:95},
        {name:'Патчі під очі (уп. 50 пар)',         sku:'PATCH-EYE',  cat:'Вії',           unit:'уп',   qty:18,  min:8,   price:185},
        {name:'Фреза для апаратного педикюру',       sku:'FREZ-PED',   cat:'Інструменти',   unit:'шт',   qty:24,  min:15,  price:285},
    ];
    const itemRefs = [];
    for (const s of STOCK) {
        const iRef = cr.collection('warehouse_items').doc();
        itemRefs.push(iRef);
        ops.push({type:'set', ref:iRef, data:{
            name:s.name, sku:s.sku, category:s.cat,
            unit:s.unit, quantity:s.qty, minQuantity:s.min,
            purchasePrice:s.price, salePrice:Math.round(s.price*1.35),
            supplierId:'', supplierName:'KODI Professional / OPI Ukraine',
            location:'Склад студії, стелаж А',
            isActive:true, createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-15-ops"); ops = [];

    // Реалізації (6 записів)
    const SALES = [
        {items:[{i:0,q:25},{i:6,q:5},{i:8,q:10}], client:'Виручка тижень — послуги',     d:-1, total:38400},
        {items:[{i:0,q:18},{i:3,q:3},{i:9,q:2}],  client:'Виручка тижень — послуги',     d:-8, total:42600},
        {items:[{i:1,q:8},{i:2,q:2},{i:17,q:5}],  client:'Продаж косметики клієнтам',    d:-3, total:4200},
        {items:[{i:0,q:22},{i:5,q:3},{i:16,q:2}], client:'Виручка тижень — послуги',    d:-15, total:39800},
        {items:[{i:1,q:12},{i:13,q:8},{i:18,q:6}],client:'Виручка тижень — послуги',    d:-22, total:37600},
        {items:[{i:0,q:20},{i:6,q:4},{i:7,q:2}],  client:'Виручка тижень — послуги',    d:-29, total:41200},
    ];
    for (const s of SALES) {
        const sRef = cr.collection('sales').doc();
        const saleItems = s.items.map(si => ({
            itemId:itemRefs[si.i].id,
            itemName:STOCK[si.i].name,
            quantity:si.q,
            unit:STOCK[si.i].unit,
            pricePerUnit:STOCK[si.i].salePrice || STOCK[si.i].price,
            totalPrice:si.q * (STOCK[si.i].salePrice || STOCK[si.i].price),
        }));
        ops.push({type:'set', ref:sRef, data:{
            clientName:s.client, date:_demoDate(s.d),
            items:saleItems, totalAmount:s.total, currency:'UAH',
            status:'completed', paymentMethod:'mixed',
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-16-ops"); ops = [];

    // ── 12. СТАНДАРТИ (4) ────────────────────────────────────
    const STANDARDS = [
        {
            name:'Стандарт обслуговування клієнта GlowStudio',
            category:'service', fi:2,
            content:`# Стандарт якості обслуговування\n\n## Зустріч клієнта\n- Привітання протягом 30 секунд після входу\n- Запропонувати чай/кава\n- Уточнити бажаний результат\n\n## Під час послуги\n- Робоче місце стерильне\n- Інформування про кожен етап\n- Без телефону під час роботи\n\n## Завершення\n- Показати результат, отримати схвалення\n- Сфотографувати роботу (з дозволу)\n- Запис на наступний візит\n- SMS подяка через 3 години`,
        },
        {
            name:'Стандарт дезінфекції та стерилізації інструментів',
            category:'safety', fi:2,
            content:`# Протокол дезінфекції\n\n## Після кожного клієнта\n1. Зняти залишки гелю/матеріалів\n2. Занурити в дезрозчин Kodan на 30 хв\n3. Ополоснути дистильованою водою\n4. Просушити\n5. Запакувати в крафт-пакет\n6. Автоклавувати при 134°C 4 хв\n\n## Щотижня\n- Обробка поверхонь кабінету\n- Дезінфекція ламп та обладнання\n\n## Журнал стерилізації підписувати обов'язково`,
        },
        {
            name:'Регламент роботи з програмою лояльності',
            category:'service', fi:3,
            content:`# Програма лояльності GlowStudio\n\n## Рівні клієнтів\n- NEW (1-3 візити): знижка 5%\n- REGULAR (4-10 візитів): знижка 7%\n- LOYAL (11-19 візитів): знижка 10% + подарунок\n- VIP (20+ візитів): знижка 15% + пріоритет запису\n\n## Бонусна програма\n- 1 грн = 2 бонуси\n- 100 бонусів = 1 грн знижки\n- Бонуси діють 6 місяців\n\n## Win-back\n- Дзвінок через 5 тижнів без візиту\n- Персональна пропозиція`,
        },
        {
            name:'KPI майстрів — формула розрахунку зарплати',
            category:'hr', fi:6,
            content:`# Система KPI та оплати праці\n\n## Формула зарплати майстра\nЗП = Оклад (8000) + % від виручки + Бонуси\n\n## % від виручки\n- Виручка до 30 000: 35%\n- Виручка 30-50 000: 38%\n- Виручка 50 000+: 42%\n\n## Бонуси KPI\n- NPS 9.0+: +2000 грн\n- Продаж абонементів (5+): +1500 грн\n- 0 скарг за місяць: +1000 грн\n- Залучення нових клієнтів (5+): +2500 грн\n\n## Розрахунок — до 25 числа`,
        },
    ];
    for (const s of STANDARDS) {
        ops.push({type:'set', ref:cr.collection('workStandards').doc(), data:{
            name:s.name, category:s.category, content:s.content,
            functionId:fRefs[s.fi].id, functionName:FUNCS[s.fi].name,
            isActive:true, version:1,
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-17-ops"); ops = [];

    // ── 13. КООРДИНАЦІЇ (5) ───────────────────────────────────
    const COORDS = [
        {
            name:'Щотижнева нарада команди GlowStudio',
            type:'meeting', fi:7, ai:0,
            desc:'Підсумки тижня, KPI майстрів, проблеми, плани на наступний тиждень',
            freq:'weekly', dow:1, time:'09:30',
            participants:[0,1,2,3,4,5,6,7],
            agenda:['Виручка за тиждень', 'KPI кожного майстра', 'Відгуки клієнтів', 'Проблеми та питання', 'Задачі на тиждень'],
        },
        {
            name:'Планерка по маркетингу — SMM + реклама',
            type:'meeting', fi:0, ai:9,
            desc:'Результати реклами, плани контент-плану, нові акції',
            freq:'weekly', dow:4, time:'10:00',
            participants:[0,9,7],
            agenda:['Охоплення та ліди за тиждень', 'Контент-план на наступний тиждень', 'Бюджет реклами', 'Нові акції та промо'],
        },
        {
            name:'Звіт майстрів — виручка та NPS',
            type:'report', fi:6, ai:8,
            desc:'Щомісячний фінансовий звіт по кожному майстру',
            freq:'monthly', dow:null, time:'18:00',
            participants:[0,8],
            agenda:['Виручка по майстрах', 'Середній чек', 'NPS та відгуки', 'Розрахунок зарплат'],
        },
        {
            name:'Перевірка складу та замовлення матеріалів',
            type:'task', fi:5, ai:1,
            desc:'Ревізія залишків, формування замовлення постачальнику',
            freq:'weekly', dow:3, time:'12:00',
            participants:[0,1],
            agenda:['Ревізія гель-лаків', 'Ревізія витратних', 'Формування замовлення'],
        },
        {
            name:'One-on-one власниця з кожним майстром',
            type:'meeting', fi:7, ai:0,
            desc:'Щомісячна індивідуальна зустріч — фідбек, цілі, розвиток',
            freq:'monthly', dow:null, time:'17:00',
            participants:[0],
            agenda:['Результати місяця', 'Задоволеність роботою', 'Цілі на наступний місяць', 'Навчання та розвиток'],
        },
    ];
    for (const c of COORDS) {
        ops.push({type:'set', ref:cr.collection('coordinations').doc(), data:{
            name:c.name, type:c.type, description:c.desc,
            functionId:fRefs[c.fi].id, functionName:FUNCS[c.fi].name,
            responsibleId:sRefs[c.ai].id, responsibleName:STAFF[c.ai].name,
            frequency:c.freq, dayOfWeek:c.dow, time:c.time,
            participantIds:c.participants.map(i => sRefs[i].id),
            participantNames:c.participants.map(i => STAFF[i].name),
            agenda:c.agenda,
            isActive:true, createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops, "step-18-ops"); ops = [];

    // ── 14. БРОНЮВАННЯ — CALENDAR (5 тижнів) ─────────────────
    const SERVICES_LIST = [
        {name:'Манікюр + гель-лак',         dur:90,  price:680},
        {name:'Нарощування нігтів гелем',   dur:150, price:1200},
        {name:'Педикюр апаратний + гель',   dur:120, price:850},
        {name:'Lamination брів + фарбування',dur:60, price:650},
        {name:'Нарощування вій 2D-3D',      dur:120, price:900},
        {name:'Корекція нарощування',       dur:90,  price:750},
        {name:'Манікюр без покриття',       dur:60,  price:380},
        {name:'Педикюр класичний',          dur:90,  price:620},
    ];
    const masterIndices = [2,3,4,5,6]; // sRefs індекси майстрів
    const bookingOps = [];
    // 5 тижнів × 5 майстрів × 6 прийомів = ~150 записів
    for (let week = -4; week <= 0; week++) {
        for (let day = 1; day <= 6; day++) { // пн-сб
            const dayOffset = week * 7 + day;
            for (let slot = 0; slot < 5; slot++) {
                const masterIdx = masterIndices[slot % masterIndices.length];
                const svc = SERVICES_LIST[Math.floor((slot + day + Math.abs(week)) % SERVICES_LIST.length)];
                const clientIdx = Math.floor((slot * day + Math.abs(week) * 3) % CLIENTS.length);
                const hour = 10 + slot * 1;
                const timeStr = `${String(hour).padStart(2,'0')}:00`;
                bookingOps.push({type:'set', ref:cr.collection('bookings').doc(), data:{
                    clientId:crmRefs[clientIdx].id,
                    clientName:CLIENTS[clientIdx].n,
                    clientPhone:CLIENTS[clientIdx].phone,
                    masterId:sRefs[masterIdx].id,
                    masterName:STAFF[masterIdx].name,
                    serviceName:svc.name,
                    duration:svc.dur,
                    price:svc.price,
                    date:_demoDate(dayOffset),
                    time:timeStr,
                    status: dayOffset < 0 ? 'completed' : dayOffset === 0 ? 'confirmed' : 'scheduled',
                    notes:'',
                    functionId:fRefs[2].id,
                    createdBy:uid, createdAt:now, updatedAt:now,
                }});
            }
        }
    }
    // Наступні 2 тижні записи
    for (let day = 1; day <= 14; day++) {
        for (let slot = 0; slot < 4; slot++) {
            const masterIdx = masterIndices[slot % masterIndices.length];
            const svc = SERVICES_LIST[Math.floor((slot + day) % SERVICES_LIST.length)];
            const clientIdx = Math.floor((slot + day * 2) % CLIENTS.length);
            const hour = 10 + slot * 2;
            bookingOps.push({type:'set', ref:cr.collection('bookings').doc(), data:{
                clientId:crmRefs[clientIdx].id,
                clientName:CLIENTS[clientIdx].n,
                clientPhone:CLIENTS[clientIdx].phone,
                masterId:sRefs[masterIdx].id,
                masterName:STAFF[masterIdx].name,
                serviceName:svc.name,
                duration:svc.dur,
                price:svc.price,
                date:_demoDate(day),
                time:`${String(hour).padStart(2,'0')}:00`,
                status:'scheduled',
                notes:'',
                functionId:fRefs[2].id,
                createdBy:uid, createdAt:now, updatedAt:now,
            }});
        }
    }
    await window.safeBatchCommit(bookingOps, "step-19-bookingOps");

    // ── 15. МЕТРИКИ / СТАТИСТИКА (5 тижнів) ──────────────────
    // Step 1: Create metric definitions
    const METRIC_DEFS = [
        {name:'Виручка тижня',           unit:'грн',   freq:'weekly',  fi:6, icon:'trending-up',  color:'#22c55e'},
        {name:'Кількість клієнтів',      unit:'осіб',  freq:'weekly',  fi:2, icon:'users',        color:'#3b82f6'},
        {name:'Середній чек',            unit:'грн',   freq:'weekly',  fi:6, icon:'credit-card',  color:'#f59e0b'},
        {name:'NPS (задоволеність)',      unit:'балів', freq:'weekly',  fi:3, icon:'star',         color:'#8b5cf6'},
        {name:'Нові клієнти',            unit:'осіб',  freq:'weekly',  fi:0, icon:'user-plus',    color:'#ec4899'},
    ];
    const mDefRefs = METRIC_DEFS.map(() => cr.collection('metrics').doc());
    const mDefOps = METRIC_DEFS.map((m, i) => ({type:'set', ref:mDefRefs[i], data:{
        name:m.name, unit:m.unit, frequency:m.freq,
        functionId:fRefs[m.fi].id, functionName:FUNCS[m.fi].name,
        icon:m.icon, color:m.color,
        target:0, isActive:true,
        createdBy:uid, createdAt:now, updatedAt:now, isDemo:true,
    }}));
    await window.safeBatchCommit(mDefOps, 'step-metric-defs');

    // Step 2: Create metric entries (5 weeks of data)
    const WEEKS_DATA = [
        {wk:-4, revenue:41200, clients:52, avg_check:792, nps:8.8, new_clients:6},
        {wk:-3, revenue:37600, clients:48, avg_check:783, nps:8.9, new_clients:4},
        {wk:-2, revenue:39800, clients:51, avg_check:780, nps:9.1, new_clients:7},
        {wk:-1, revenue:42600, clients:54, avg_check:788, nps:9.0, new_clients:5},
        {wk: 0, revenue:38400, clients:49, avg_check:784, nps:9.2, new_clients:8},
    ];
    const entryValues = [
        w => w.revenue,
        w => w.clients,
        w => w.avg_check,
        w => w.nps,
        w => w.new_clients,
    ];
    const entryOps = [];
    for (const w of WEEKS_DATA) {
        const periodKey = _demoDate(w.wk * 7);
        for (let mi = 0; mi < METRIC_DEFS.length; mi++) {
            entryOps.push({type:'set', ref:cr.collection('metricEntries').doc(), data:{
                metricId: mDefRefs[mi].id,
                value: entryValues[mi](w),
                period: periodKey,
                periodKey: periodKey,
                periodType: 'weekly',
                date: periodKey,
                scope: 'company',
                scopeId: uid,
                source: 'demo',
                createdBy: uid,
                createdAt: now,
                isDemo: true,
            }});
        }
    }
    await window.safeBatchCommit(entryOps, 'step-metric-entries');


    // ── 17. CRM PIPELINE + АКТИВНОСТІ ───────────────────────
    // Pipeline воронка
    try {
        const oldPips = await cr.collection('crm_pipeline').get();
        if (!oldPips.empty) await window.safeBatchCommit(oldPips.docs.map(d => ({type:'delete', ref:d.ref})), 'clear-pipeline');
    } catch(e) {}

    const pipRef = cr.collection('crm_pipeline').doc();
    await window.safeBatchCommit([{type:'set', ref:pipRef, data:{
        isDemo:true,
        name:'GlowStudio — Залучення клієнтів',
        isDefault:true,
        stages:[
            {id:'new',        label:'Новий лід',          color:'#6b7280', order:1},
            {id:'contacted',  label:'Контакт встановлено', color:'#3b82f6', order:2},
            {id:'trial',      label:'Пробний візит',       color:'#8b5cf6', order:3},
            {id:'regular',    label:'Постійний клієнт',    color:'#22c55e', order:4},
            {id:'vip',        label:'VIP клієнт',          color:'#f59e0b', order:5},
            {id:'paused',     label:'Пауза',               color:'#f97316', order:6},
            {id:'lost',       label:'Відмова',             color:'#ef4444', order:7},
        ],
        defaultStageId:'new',
        createdAt:now, updatedAt:now,
    }}], 'step-pipeline');

    // CRM активності (дзвінки, зустрічі, нотатки)
    const crmCliSnap = await cr.collection('crm_clients').get();
    const crmCliDocs = crmCliSnap.docs.slice(0, 12);
    const actOps = [];
    const ACT_TYPES = [
        {type:'call',    icon:'phone',    label:'Дзвінок'},
        {type:'visit',   icon:'calendar', label:'Візит'},
        {type:'note',    icon:'file-text',label:'Нотатка'},
        {type:'message', icon:'message',  label:'Повідомлення'},
    ];
    const ACT_TEXTS = [
        'Підтвердила запис на манікюр на п\'ятницю 14:00',
        'Клієнтка задоволена результатом, планує абонемент',
        'Нагадала про акцію — знижка 15% на нарощування вій у квітні',
        'Запитала про нові послуги косметолога, записала на консультацію',
        'Нагадала про дату повторного запису через 3 тижні',
        'Клієнтка перенесла запис на понеділок 11:00',
        'Надіслала фото результату роботи для Instagram з дозволу',
        'Win-back дзвінок — клієнтка не була 6 тижнів, записалась',
        'Запропонувала абонемент педикюру — зацікавлена',
        'Отримала відгук Google 5★ від клієнтки',
        'Вирішили питання з кольором гель-лаку — замінили безкоштовно',
        'Нагадала про бонуси, що спливають до кінця місяця',
    ];
    crmCliDocs.forEach((doc, i) => {
        const act = ACT_TYPES[i % ACT_TYPES.length];
        actOps.push({type:'set', ref:cr.collection('crm_activities').doc(), data:{
            clientId: doc.id,
            clientName: doc.data().name,
            type: act.type,
            icon: act.icon,
            label: act.label,
            text: ACT_TEXTS[i],
            date: _demoDate(-(i + 1)),
            managerId: sRefs[7].id,
            managerName: STAFF[7].name,
            functionId: fRefs[3].id,
            createdBy: uid, createdAt: now, isDemo: true,
        }});
        // Додаємо другу активність для перших 5 клієнтів
        if (i < 5) {
            actOps.push({type:'set', ref:cr.collection('crm_activities').doc(), data:{
                clientId: doc.id,
                clientName: doc.data().name,
                type: 'note',
                icon: 'file-text',
                label: 'Нотатка',
                text: ['Уподобання: пастельні відтінки, довгі нігті', 'Алергія на латекс — використовуємо нітрил', 'Вважає за краще запис у вихідні 10-12', 'Подруга клієнтки — знижка за рефералом 5%', 'VIP: завжди зустрічати у дверей, чай з лимоном'][i],
                date: _demoDate(-(i + 7)),
                managerId: sRefs[1].id,
                managerName: STAFF[1].name,
                functionId: fRefs[1].id,
                createdBy: uid, createdAt: now, isDemo: true,
            }});
        }
    });
    await window.safeBatchCommit(actOps, 'step-crm-activities');

    // Оновлюємо deals зі стадіями pipeline
    const dealSnap = await cr.collection('crm_deals').get();
    const dealStages = ['won','regular','trial','contacted','new','paused','lost','vip'];
    const dealUpOps = dealSnap.docs.map((doc, i) => ({
        type:'update', ref:doc.ref,
        data:{ pipelineId:pipRef.id, stageId:dealStages[i % dealStages.length], updatedAt:now }
    }));
    if (dealUpOps.length) await window.safeBatchCommit(dealUpOps, 'step-deals-pipeline');

    // ── 18. БРОНЮВАННЯ — НАЛАШТУВАННЯ ────────────────────────
    try {
        const oldCals = await cr.collection('booking_calendars').get();
        if (!oldCals.empty) await window.safeBatchCommit(oldCals.docs.map(d=>({type:'delete',ref:d.ref})), 'clear-booking-cals');
        const oldSch = await cr.collection('booking_schedules').get();
        if (!oldSch.empty) await window.safeBatchCommit(oldSch.docs.map(d=>({type:'delete',ref:d.ref})), 'clear-booking-sch');
    } catch(e) {}

    // 5 календарів — по одному на кожного майстра
    const masterSchedules = [
        {name:'Олена Мороз — манікюр',        slug:'glowstudio-olena',  color:'#ec4899', dur:90,  services:['Манікюр + гель-лак','Корекція','Зняття + нове покриття']},
        {name:'Вікторія Лисенко — манікюр',   slug:'glowstudio-vika',   color:'#8b5cf6', dur:90,  services:['Манікюр + гель-лак','Манікюр без покриття']},
        {name:'Аліна Шевченко — нарощування', slug:'glowstudio-alina',  color:'#3b82f6', dur:150, services:['Нарощування нігтів','Корекція нарощування','Зняття нарощування']},
        {name:'Дарина Петрова — брови та вії', slug:'glowstudio-daryna', color:'#f59e0b', dur:90,  services:['Ламінування брів','Нарощування вій 2D','Корекція брів + фарбування']},
        {name:'Катерина Бондар — педикюр',     slug:'glowstudio-katya',  color:'#22c55e', dur:120, services:['Педикюр апаратний + гель','Педикюр класичний']},
    ];
    const calRefs = masterSchedules.map(() => cr.collection('booking_calendars').doc());
    const calOps = [];
    masterSchedules.forEach((ms, i) => {
        calOps.push({type:'set', ref:calRefs[i], data:{
            name: ms.name,
            slug: ms.slug,
            ownerName: STAFF[2 + i].name,
            ownerId: sRefs[2 + i].id,
            duration: ms.dur,
            bufferBefore: 5, bufferAfter: 10,
            timezone: 'Europe/Kiev',
            confirmationType: 'auto',
            color: ms.color,
            location: 'GlowStudio, вул. Хрещатик 12, Київ',
            isActive: true, phoneRequired: true,
            services: ms.services.map((s, j) => ({id:`s${i}${j}`, name:s, duration:ms.dur, price:[680,420,350,850,650,900,620][j]||500})),
            questions:[
                {id:'q1', text:'Побажання до форми/довжини нігтів', type:'text', required:false},
                {id:'q2', text:'Є алергія на матеріали?',           type:'select', required:false, options:['Ні','Алергія на латекс','Алергія на акрил','Інше']},
            ],
            maxBookingsPerSlot: 1, requirePayment: false, price: 0,
            createdAt: now, updatedAt: now, isDemo: true,
        }});
        // Розклад майстра
        calOps.push({type:'set', ref:cr.collection('booking_schedules').doc(calRefs[i].id), data:{
            calendarId: calRefs[i].id,
            weeklyHours:{
                mon:[{start:'09:00',end:'19:00'}],
                tue:[{start:'09:00',end:'19:00'}],
                wed:i % 2 === 0 ? [] : [{start:'09:00',end:'19:00'}],
                thu:[{start:'10:00',end:'20:00'}],
                fri:[{start:'09:00',end:'20:00'}],
                sat:[{start:'09:00',end:'18:00'}],
                sun: i < 2 ? [{start:'10:00',end:'16:00'}] : [],
            },
            isActive: true, createdAt: now, updatedAt: now, isDemo: true,
        }});
    });
    await window.safeBatchCommit(calOps, 'step-booking-calendars');

    // ── 19. РАХУНКИ-ФАКТУРИ ───────────────────────────────────
    const INVOICES = [
        {client:'Beauty Corp',       amount:28000, status:'paid',    daysAgo:-3,  items:[{name:'Корпоративний Beauty Day — 20 осіб', qty:20, price:1400}]},
        {client:'Коваленко Олена',   amount:3500,  status:'paid',    daysAgo:-7,  items:[{name:'Абонемент манікюр 5 сесій', qty:1, price:3500}]},
        {client:'Мороз Катерина',    amount:9800,  status:'paid',    daysAgo:-10, items:[{name:'Абонемент нарощування — квартал', qty:1, price:9800}]},
        {client:'Гончар Анна',       amount:3500,  status:'pending', daysAgo:5,   items:[{name:'Абонемент манікюр 5 сесій', qty:1, price:3500}]},
        {client:'ТОВ Stella Beauty', amount:15000, status:'pending', daysAgo:7,   items:[{name:'Корпоративна Beauty Day — 10 осіб', qty:10, price:1500}]},
        {client:'Харченко Ніна',     amount:5200,  status:'pending', daysAgo:14,  items:[{name:'VIP пакет — місяць обслуговування', qty:1, price:5200}]},
        {client:'Іваненко Тетяна',   amount:2600,  status:'overdue', daysAgo:-2,  items:[{name:'Ламінування брів + нарощування вій', qty:1, price:2600}]},
    ];
    const invOps = [];
    for (const inv of INVOICES) {
        const iRef = cr.collection('finance_invoices').doc();
        invOps.push({type:'set', ref:iRef, data:{
            clientName: inv.client,
            amount: inv.amount, currency: 'UAH',
            status: inv.status,
            dueDate: _demoDate(inv.daysAgo),
            items: inv.items,
            note: inv.status === 'overdue' ? 'Нагадати клієнту про оплату' : '',
            functionId: fRefs[6].id, functionName: FUNCS[6].name,
            createdBy: uid, createdAt: now, updatedAt: now, isDemo: true,
        }});
    }
    await window.safeBatchCommit(invOps, 'step-invoices');

    // ── 20. ЦІЛІ МЕТРИК ──────────────────────────────────────
    const mDefSnap = await cr.collection('metrics').get();
    const mDefs = mDefSnap.docs.filter(d => d.data().isDemo);
    const TARGET_VALUES = [170000, 65, 820, 9.5, 12]; // по метриках: виручка, клієнти, чек, NPS, нові
    const targetOps = [];
    mDefs.forEach((doc, i) => {
        if (TARGET_VALUES[i] !== undefined) {
            targetOps.push({type:'set', ref:cr.collection('metricTargets').doc(doc.id), data:{
                metricId: doc.id,
                metricName: doc.data().name,
                target: TARGET_VALUES[i],
                period: 'weekly',
                createdBy: uid, createdAt: now, updatedAt: now, isDemo: true,
            }});
        }
    });
    if (targetOps.length) await window.safeBatchCommit(targetOps, 'step-metric-targets');

    // ── 21. СКЛАД — ОПЕРАЦІЇ ТА ПОСТАЧАЛЬНИКИ ─────────────────
    // Постачальники
    const SUPPLIERS = [
        {name:'KODI Professional Ukraine', contact:'Олег Марченко', phone:'+38044-111-2233', email:'orders@kodi.ua',    terms:'Доставка 2-3 дні, мінімальне замовлення 500 грн'},
        {name:'OPI Україна — дистриб\'ютор', contact:'Світлана Іщенко', phone:'+38044-222-3344', email:'opi@beauty.ua', terms:'Доставка 3-5 днів, знижка від 5000 грн'},
        {name:'Lovely Cosmetics',           contact:'Менеджер',     phone:'+38050-333-4455', email:'info@lovely.ua',    terms:'Самовивіз або Нова Пошта від 300 грн'},
        {name:'Beauty Box Supply',          contact:'Тетяна',       phone:'+38067-444-5566', email:'supply@bbox.ua',    terms:'Доставка щотижня по вівторках'},
    ];
    const supRefs = SUPPLIERS.map(() => cr.collection('warehouse_suppliers').doc());
    await window.safeBatchCommit(SUPPLIERS.map((s, i) => ({type:'set', ref:supRefs[i], data:{
        name:s.name, contactPerson:s.contact, phone:s.phone,
        email:s.email, terms:s.terms, isActive:true,
        createdBy:uid, createdAt:now, updatedAt:now, isDemo:true,
    }})), 'step-suppliers');

    // Операції складу (прихід/видача/списання)
    const whSnap = await cr.collection('warehouse_items').get();
    const whDocs = whSnap.docs.filter(d => d.data().isDemo);
    if (whDocs.length > 0) {
        const whOps = [];
        // Приходи — 3 тижні тому
        whDocs.slice(0, 8).forEach((doc, i) => {
            whOps.push({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
                itemId: doc.id, itemName: doc.data().name,
                type: 'IN',
                qty: [50, 30, 10, 10, 5, 10, 5, 5][i],
                price: doc.data().purchasePrice || 100,
                totalPrice: ([50,30,10,10,5,10,5,5][i]) * (doc.data().purchasePrice || 100),
                supplierId: supRefs[i % supRefs.length].id,
                supplierName: SUPPLIERS[i % SUPPLIERS.length].name,
                note: 'Щомісячне поповнення запасів',
                date: _demoDate(-21),
                createdBy: uid, createdAt: _demoTs(-21), isDemo: true,
            }});
        });
        // Видача — за поточний тиждень (для 5 майстрів)
        whDocs.slice(0, 5).forEach((doc, i) => {
            whOps.push({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
                itemId: doc.id, itemName: doc.data().name,
                type: 'OUT',
                qty: [10, 5, 3, 2, 4][i],
                price: doc.data().purchasePrice || 100,
                totalPrice: ([10,5,3,2,4][i]) * (doc.data().purchasePrice || 100),
                note: `Видача майстру — ${STAFF[2 + i].name}`,
                date: _demoDate(-3),
                createdBy: uid, createdAt: _demoTs(-3), isDemo: true,
            }});
        });
        // Списання (прострочені)
        whDocs.slice(0, 2).forEach((doc, i) => {
            whOps.push({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
                itemId: doc.id, itemName: doc.data().name,
                type: 'WRITEOFF',
                qty: [3, 2][i],
                price: 0, totalPrice: 0,
                note: 'Списання — закінчився строк придатності',
                date: _demoDate(-14),
                createdBy: uid, createdAt: _demoTs(-14), isDemo: true,
            }});
        });
        await window.safeBatchCommit(whOps, 'step-warehouse-ops');
    }

    // ── 22. НОРМИ КОШТОРИСУ (правильна колекція) ─────────────
    // estimate_norms — для вкладки Кошторис
    const NORM_DEFS_STD = [
        {
            name:'Манікюр класичний + гель-лак',
            category:'beauty_service', inputUnit:'клієнт',
            materials:[
                {name:'Гель-лак Kodi (порція)',      qty:0.1,  unit:'мл',    price:180},
                {name:'Топ без липкого (порція)',     qty:0.08, unit:'мл',    price:185},
                {name:'База каучукова (порція)',      qty:0.08, unit:'мл',    price:165},
                {name:'Рукавиці нітрил (2 шт)',      qty:2,    unit:'шт',    price:3},
                {name:'Пилочка одноразова',          qty:1,    unit:'шт',    price:8},
                {name:'Серветки безворсові (5 шт)',  qty:5,    unit:'шт',    price:0.8},
                {name:'Рідина для зняття (порція)',  qty:5,    unit:'мл',    price:0.7},
            ],
        },
        {
            name:'Нарощування нігтів гелем',
            category:'beauty_service', inputUnit:'клієнт',
            materials:[
                {name:'Гель для нарощування',        qty:2,    unit:'г',     price:4.5},
                {name:'Форми для нарощування (10)',  qty:10,   unit:'шт',    price:0.8},
                {name:'Праймер (порція)',             qty:0.2,  unit:'мл',    price:9.7},
                {name:'Дегідратор (порція)',          qty:0.2,  unit:'мл',    price:6.5},
                {name:'Гель-лак (порція)',            qty:0.15, unit:'мл',    price:180},
                {name:'Рукавиці нітрил (2 шт)',      qty:2,    unit:'шт',    price:3},
                {name:'Пилочки набір',               qty:1,    unit:'набір', price:35},
            ],
        },
        {
            name:'Нарощування вій 2D-3D',
            category:'beauty_service', inputUnit:'клієнт',
            materials:[
                {name:'Вії пучкові 0.10 C (30 шт)', qty:30,   unit:'шт',    price:4.5},
                {name:'Клей для вій Lovely (порц.)', qty:0.2,  unit:'мл',    price:64},
                {name:'Ремувер (порція)',             qty:0.3,  unit:'мл',    price:25.5},
                {name:'Патчі під очі (пара)',        qty:1,    unit:'пара',  price:12},
                {name:'Ватні палички (5 шт)',        qty:5,    unit:'шт',    price:0.8},
            ],
        },
        {
            name:'Ламінування брів + фарбування',
            category:'beauty_service', inputUnit:'клієнт',
            materials:[
                {name:'Склад для ламінування',       qty:0.5,  unit:'мл',    price:64},
                {name:'Фарба для брів RefectoCil',   qty:0.3,  unit:'мл',    price:81.7},
                {name:'Фіксатор (порція)',            qty:0.5,  unit:'мл',    price:40},
                {name:'Щіточки одноразові (3 шт)',   qty:3,    unit:'шт',    price:2},
                {name:'Силіконові накладки (пара)',  qty:1,    unit:'пара',  price:45},
            ],
        },
        {
            name:'Педикюр апаратний + гель-лак',
            category:'beauty_service', inputUnit:'клієнт',
            materials:[
                {name:'Гель-лак для ніг (порція)',   qty:0.15, unit:'мл',    price:180},
                {name:'Фреза (знос на процедуру)',   qty:0.02, unit:'шт',    price:285},
                {name:'Дезінфекція ванночки',        qty:0.1,  unit:'порц',  price:22.5},
                {name:'Рукавиці нітрил (2 шт)',      qty:2,    unit:'шт',    price:3},
                {name:'Топ та база (порція)',         qty:0.1,  unit:'мл',    price:175},
            ],
        },
    ];

    for (const nd of NORM_DEFS_STD) {
        const nRef = cr.collection('estimate_norms').doc();
        await window.safeBatchCommit([{type:'set', ref:nRef, data:{
            name:nd.name, category:nd.category, inputUnit:nd.inputUnit,
            niche:'beauty_salon', isActive:true,
            createdBy:uid, createdAt:now, updatedAt:now, isDemo:true,
        }}], 'step-norm-def');
        const matOps = nd.materials.map(m => ({type:'set', ref:nRef.collection('materials').doc(), data:{
            name:m.name, qty:m.qty, unit:m.unit, pricePerUnit:m.price,
            coefficient:1, isDemo:true,
        }}));
        await window.safeBatchCommit(matOps, 'step-norm-materials');
    }

    // Приклад кошторису прив\'язаний до проекту (правильна колекція)
    const projSnapEst = await cr.collection('projects').get();
    const projForEst = projSnapEst.docs.find(d => d.data().name?.includes('Гулівер'));
    if (projForEst) {
        const estRef = cr.collection('project_estimates').doc();
        await window.safeBatchCommit([{type:'set', ref:estRef, data:{
            name:'Відкриття ТРЦ Гулівер — зведений кошторис',
            clientName:'GlowStudio (власний проект)',
            projectId: projForEst.id, projectName: projForEst.data().name,
            status:'approved', totalAmount:680000, currency:'UAH',
            createdBy:uid, createdAt:now, updatedAt:now, isDemo:true,
        }}], 'step-project-estimate');
        const PE_ITEMS = [
            {name:'Крісла майстра манікюру (5 шт)',  qty:5,   unit:'шт',   price:18000, cat:'Меблі'},
            {name:'Стійка адміністратора',           qty:1,   unit:'шт',   price:24000, cat:'Меблі'},
            {name:'Дзеркала з підсвіткою (5 шт)',   qty:5,   unit:'шт',   price:8500,  cat:'Меблі'},
            {name:'Ремонт та оздоблення 80м²',      qty:80,  unit:'м²',   price:4500,  cat:'Ремонт'},
            {name:'Вивіска та брендинг',             qty:1,   unit:'компл',price:32000, cat:'Маркетинг'},
            {name:'UV/LED лампи (5 шт)',             qty:5,   unit:'шт',   price:2800,  cat:'Обладнання'},
            {name:'Стартовий запас гель-лаків 500шт',qty:500,unit:'шт',   price:180,   cat:'Матеріали'},
            {name:'Витратні матеріали (старт)',      qty:1,   unit:'компл',price:18000, cat:'Матеріали'},
            {name:'CRM налаштування',                qty:1,   unit:'компл',price:8000,  cat:'IT'},
        ];
        await window.safeBatchCommit(PE_ITEMS.map(item => ({type:'set', ref:estRef.collection('items').doc(), data:{
            name:item.name, quantity:item.qty, unit:item.unit,
            pricePerUnit:item.price, totalPrice:item.qty * item.price,
            category:item.cat, isDemo:true, createdAt:now,
        }})), 'step-estimate-items');
    }

    // ── 23. КООРДИНАЦІЇ — СЕСІЇ ───────────────────────────────
    const coordSnap = await cr.collection('coordinations').get();
    const coordDocs = coordSnap.docs.filter(d => d.data().isDemo);
    const sessOps = [];
    coordDocs.slice(0, 3).forEach((doc, i) => {
        const offsetDays = -(i * 7 + 1);
        sessOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
            coordId: doc.id,
            coordName: doc.data().name,
            coordType: doc.data().type || 'meeting',
            startedAt: new Date(Date.now() + offsetDays * 86400000).toISOString(),
            finishedAt: new Date(Date.now() + offsetDays * 86400000 + 55 * 60000).toISOString(),
            durationMin: 55,
            participantIds: doc.data().participantIds || [uid],
            decisions: [
                {text:['Підняти ціну на манікюр з гель-лаком з 650 до 680 грн з 1 квітня','Запустити акцію "Приведи подругу — знижка 10% обом" на квітень','Замовити нову колекцію OPI Spring 2025 на 15 тис. грн'][i], taskId:'', authorId:uid},
                {text:['Ввести обов\'язкову фотографію результату з дозволу клієнта','Підготувати SMM-контент план на 2 тижні вперед','Перевірити залишки матеріалів і зробити замовлення'][i], taskId:'', authorId:uid},
            ],
            summary: ['Обговорили ціноутворення на квітень, запустили акцію', 'Узгодили контент-план і маркетингову стратегію', 'Зробили ревізію складу, сформували замовлення'][i],
            createdBy: uid, createdAt: now, isDemo: true,
        }});
    });
    if (sessOps.length) await window.safeBatchCommit(sessOps, 'step-coord-sessions');


    // ── 16. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:           'GlowStudio',
        niche:          'beauty_salon',
        nicheLabel:     'Студія краси — манікюр, педикюр, нарощування, брови, вії',
        description:    'Студія краси GlowStudio — манікюр, педикюр, нарощування нігтів, брови та вії. Київ, вул. Хрещатик 12. 5 майстрів, 8 крісел.',
        city:           'Київ',
        address:        'вул. Хрещатик 12, 2-й поверх',
        employees:      10,
        currency:       'UAH',
        companyGoal:    'Стати №1 студією краси в районі за відгуками Google та утримати 80% клієнтів на абонементах',
        companyConcept: 'Краса без стресу — клієнт записується онлайн, майстер знає його уподобання, після візиту отримує нагадування. Жодних черг, жодних сюрпризів.',
        companyCKP:     'Кожен клієнт повертається мінімум раз на 3 тижні та рекомендує студію 2 подругам',
        companyIdeal:   '3 точки GlowStudio: Хрещатик + ТРЦ Гулівер + Позняки. 18 майстрів з завантаженістю 85%+. Власниця перевіряє лише дашборд вранці. Виручка 520 000 грн/міс. Google рейтинг 4.9+.',
        targetAudience: 'Жінки 22-45 років з доходом середній+. Цінують якість, зручність та персональний підхід. Готові платити за стабільний результат.',
        avgCheck:       780,
        monthlyRevenue: 158000,
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    });
};



window._DEMO_NICHE_MAP['autoservice'] = async function() {
    if (!window.currentCompanyId || !window.db) throw new Error('No company');
    const cr = window.db.collection('companies').doc(window.currentCompanyId);
    const uid = window.currentUser?.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    function dDate(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);}
    function dTs(d){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+d*86400000));}
    let ops=[];

    // ФУНКЦІЇ
    const FUNCS=[
        {name:'0. Маркетинг',       color:'#ec4899',desc:'Реклама, Google Business, SMM, залучення нових клієнтів'},
        {name:'1. Продажі та запис', color:'#22c55e',desc:'Прийом дзвінків, запис авто, консультації, кошторис'},
        {name:'2. Прийом та діагностика',color:'#f97316',desc:'Прийом авто, діагностика, замовлення-наряд'},
        {name:'3. Ремонт та ТО',    color:'#6366f1',desc:'Виконання робіт, заміна запчастин, контроль якості'},
        {name:'4. Склад та закупівлі',color:'#0ea5e9',desc:'Облік запчастин, замовлення, мінімальні залишки'},
        {name:'5. Фінанси',         color:'#10b981',desc:'Каса, розрахунки, зарплата, P&L'},
        {name:'6. Команда',         color:'#8b5cf6',desc:'Майстри, графік, навчання, KPI'},
        {name:'7. Управління',      color:'#f59e0b',desc:'Стратегія, стандарти, аналітика'},
    ];
    const fRefs=FUNCS.map(()=>cr.collection('functions').doc());
    FUNCS.forEach((f,i)=>{ops.push({type:'set',ref:fRefs[i],data:{name:f.name,color:f.color,description:f.desc,order:i,status:'active',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // СПІВРОБІТНИКИ
    try{const o=await cr.collection('users').get();if(!o.empty){const d=[];o.docs.forEach(doc=>{if(doc.id!==uid)d.push({type:'delete',ref:cr.collection('users').doc(doc.id)});});if(d.length)await window.safeBatchCommit(d);}}catch(e){}
    const STAFF=[
        {name:'Олексій Бондаренко',role:'Майстер-механік',     fn:3,email:'bondarenko@sto.ua',phone:'+380671110001'},
        {name:'Сергій Коваль',     role:'Майстер-автоелектрик',fn:3,email:'koval@sto.ua',     phone:'+380671110002'},
        {name:'Василь Петренко',   role:'Шиномонтажник',       fn:3,email:'petrenko@sto.ua',  phone:'+380671110003'},
        {name:'Ірина Мельник',     role:'Адміністратор',        fn:1,email:'melnyk@sto.ua',    phone:'+380671110004'},
        {name:'Дмитро Сидоренко',  role:'Кузовний майстер',     fn:3,email:'sydorenko@sto.ua', phone:'+380671110005'},
        {name:'Андрій Левченко',   role:'Помічник механіка',    fn:3,email:'levchenko@sto.ua', phone:'+380671110006'},
        {name:'Олена Власенко',    role:'Бухгалтер',            fn:5,email:'vlasenko@sto.ua',  phone:'+380671110007'},
    ];
    const sRefs=STAFF.map(()=>cr.collection('staff').doc());
    const uRefs=STAFF.map(()=>cr.collection('users').doc());
    STAFF.forEach((s,i)=>{
        ops.push({type:'set',ref:sRefs[i],data:{name:s.name,role:s.role,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,phone:s.phone,isActive:true,isDemo:true,createdAt:now}});
        ops.push({type:'set',ref:uRefs[i],data:{name:s.name,email:s.email,role:'employee',functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,staffId:sRefs[i].id,isDemo:true,createdAt:now}});
    });
    FUNCS.forEach((f,i)=>{const oi=STAFF.findIndex(s=>s.fn===i);if(oi>=0)ops.push({type:'update',ref:fRefs[i],data:{ownerId:sRefs[oi].id,ownerName:STAFF[oi].name}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM КЛІЄНТИ
    const CL=[
        {name:'Іванченко Михайло',phone:'+380671111001',email:'ivan@gmail.com',   car:'Mazda CX-5, AA1234BC',    spent:4460, d:-5 },
        {name:'Ковальська Оксана',phone:'+380671111002',email:'kova@ukr.net',      car:'Toyota Camry, KA5678HI',  spent:3280, d:-12},
        {name:'Шевченко Петро',   phone:'+380671111003',email:'shev@gmail.com',    car:'VW Passat, AA9012EH',     spent:6840, d:-2 },
        {name:'Бойко Андрій',     phone:'+380671111004',email:'boyko@meta.ua',     car:'BMW X5, AA3456KM',        spent:12400,d:-30},
        {name:'Ткаченко Юлія',    phone:'+380671111005',email:'tkach@gmail.com',   car:'Hyundai Tucson, KA7890OR',spent:2100, d:-120},
        {name:'Марченко Василь',  phone:'+380671111006',email:'march@ukr.net',     car:'Ford Focus, AA2345ST',    spent:1840, d:-7 },
        {name:'Гриценко Наталія', phone:'+380671111007',email:'gryts@gmail.com',   car:'Skoda Octavia, KA6789UF', spent:3600, d:-1 },
        {name:'Олійник Сергій',   phone:'+380671111008',email:'oliynyk@meta.ua',   car:'Renault Duster, AA0123HC',spent:1920, d:-45},
        {name:'Павленко Ірина',   phone:'+380671111009',email:'pavl@gmail.com',    car:'Kia Sportage, KA3456PQ',  spent:5200, d:-3 },
        {name:'Кравченко Юрій',   phone:'+380671111010',email:'krav@ukr.net',      car:'Mercedes C200, AA7890RS', spent:18600,d:-60},
    ];
    const cRefs=CL.map(()=>cr.collection('crm_clients').doc());
    CL.forEach((c,i)=>{ops.push({type:'set',ref:cRefs[i],data:{name:c.name,phone:c.phone,email:c.email,source:'direct',status:'active',notes:`Авто: ${c.car}`,totalSpent:c.spent,lastOrderDate:dDate(c.d),niche:'autoservice',isDemo:true,createdAt:dTs(c.d-10)}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM УГОДИ
    const DEALS=[
        {t:'Mazda CX-5 Іванченко — заміна масла + свічки',          c:0,amt:1820, stage:'in_work',    ai:0,d:0 },
        {t:'Toyota Camry Ковальська — гальма колодки + диски',       c:1,amt:3960, stage:'in_work',    ai:1,d:0 },
        {t:'VW Passat Шевченко — підвіска амортизатори',             c:2,amt:4800, stage:'in_work',    ai:0,d:0 },
        {t:'BMW X5 Бойко — повна діагностика + ТО',                  c:3,amt:8400, stage:'consultation',ai:3,d:-2},
        {t:'Hyundai Tucson Ткаченко — шиномонтаж 4 колеса',          c:4,amt:960,  stage:'ready',      ai:2,d:-1},
        {t:'Skoda Octavia Гриценко — заміна ременя ГРМ',             c:6,amt:2800, stage:'new',        ai:3,d:0 },
        {t:'Kia Sportage Павленко — кузовний ремонт після ДТП',      c:8,amt:6200, stage:'consultation',ai:4,d:-3},
        {t:'Mercedes C200 Кравченко — капітальний ремонт двигуна',   c:9,amt:24000,stage:'new',        ai:3,d:0 },
    ];
    DEALS.forEach(d=>{ops.push({type:'set',ref:cr.collection('crm_deals').doc(),data:{title:d.t,clientId:cRefs[d.c].id,clientName:CL[d.c].name,phone:CL[d.c].phone,amount:d.amt,stage:d.stage,assigneeId:sRefs[d.ai].id,assigneeName:STAFF[d.ai].name,source:'phone',isDemo:true,createdAt:dTs(d.d)}});});
    await window.safeBatchCommit(ops);ops=[];

    // КАРТКИ АВТО
    const VEH=[
        {plate:'AA1234BC',make:'Mazda',     model:'CX-5',    year:2019,vin:'JMZKE1W2500123456',color:'Сірий',   cI:0,km:85420},
        {plate:'KA5678HI',make:'Toyota',    model:'Camry',   year:2021,vin:'4T1BF1FK0CU123456',color:'Білий',   cI:1,km:42100},
        {plate:'AA9012EH',make:'Volkswagen',model:'Passat',  year:2018,vin:'WVWZZZ3CZ9E123456',color:'Чорний',  cI:2,km:98300},
        {plate:'AA3456KM',make:'BMW',       model:'X5',      year:2020,vin:'WBAKS410100E12345',color:'Синій',   cI:3,km:61500},
        {plate:'KA7890OR',make:'Hyundai',   model:'Tucson',  year:2022,vin:'KMHJ3813BE123456', color:'Червоний',cI:4,km:28900},
        {plate:'AA2345ST',make:'Ford',      model:'Focus',   year:2017,vin:'WF0DXXGCHDHJ12345',color:'Зелений', cI:5,km:112000},
        {plate:'KA6789UF',make:'Skoda',     model:'Octavia', year:2020,vin:'TMBEA7NE0L0123456',color:'Срібний', cI:6,km:74200},
        {plate:'AA0123HC',make:'Renault',   model:'Duster',  year:2019,vin:'VF1HSRDB5H0123456',color:'Оранж.',  cI:7,km:89600},
        {plate:'KA3456PQ',make:'Kia',       model:'Sportage',year:2021,vin:'U5YH2814BML123456',color:'Білий',   cI:8,km:38700},
        {plate:'AA7890RS',make:'Mercedes',  model:'C200',    year:2018,vin:'WDD2050451F123456', color:'Чорний',  cI:9,km:143000},
    ];
    const vRefs=VEH.map(()=>cr.collection('sales_vehicles').doc());
    VEH.forEach((v,i)=>{const c=CL[v.cI];ops.push({type:'set',ref:vRefs[i],data:{plate:v.plate,vin:v.vin,make:v.make,model:v.model,year:v.year,color:v.color,clientId:cRefs[v.cI].id,clientName:c.name,clientPhone:c.phone,mileageHistory:[{date:dDate(-180),mileage:v.km-18000,orderId:''},{date:dDate(-60),mileage:v.km-5000,orderId:''},{date:dDate(-5),mileage:v.km,orderId:''}],notes:'',isDemo:true,createdAt:dTs(-90)}});});
    await window.safeBatchCommit(ops);ops=[];

    // СКЛАД ЗАПЧАСТИН
    const PARTS=[
        {name:'Масло 5W-30 Castrol 4л', sku:'OIL-5W30',  cat:'Мастила',   unit:'шт',   qty:22,min:8, price:840 },
        {name:'Масло 5W-40 Mobil 4л',   sku:'OIL-5W40',  cat:'Мастила',   unit:'шт',   qty:16,min:6, price:960 },
        {name:'Масло 0W-20 Toyota 4л',  sku:'OIL-0W20',  cat:'Мастила',   unit:'шт',   qty:8, min:4, price:1240},
        {name:'Фільтр оливи MANN',       sku:'FILT-OIL',  cat:'Фільтри',   unit:'шт',   qty:35,min:15,price:185 },
        {name:'Фільтр повітряний MANN',  sku:'FILT-AIR',  cat:'Фільтри',   unit:'шт',   qty:24,min:10,price:240 },
        {name:'Фільтр салону MANN',      sku:'FILT-CAB',  cat:'Фільтри',   unit:'шт',   qty:18,min:8, price:290 },
        {name:'Колодки передні TRW',     sku:'BRAKE-PAD-F',cat:'Гальма',  unit:'компл',qty:14,min:5, price:720 },
        {name:'Колодки задні TRW',       sku:'BRAKE-PAD-R',cat:'Гальма',  unit:'компл',qty:11,min:4, price:580 },
        {name:'Диск гальмівний 280мм',   sku:'DISC-280',  cat:'Гальма',    unit:'шт',   qty:6, min:4, price:1350},
        {name:'Диск гальмівний 300мм',   sku:'DISC-300',  cat:'Гальма',    unit:'шт',   qty:4, min:3, price:1580},
        {name:'Свічки NGK (4 шт)',        sku:'SPARK-NGK', cat:'Запалювання',unit:'компл',qty:28,min:10,price:380},
        {name:'Антифриз G12+ 1л',        sku:'COOL-G12',  cat:'Охолодження',unit:'шт',  qty:32,min:12,price:145 },
        {name:'Ремінь ГРМ Gates',        sku:'BELT-GRM',  cat:'ГРМ',       unit:'шт',   qty:8, min:3, price:720 },
        {name:'Комплект ГРМ повний',     sku:'KIT-GRM',   cat:'ГРМ',       unit:'компл',qty:5, min:2, price:1840},
        {name:'Амортизатор передній KYB',sku:'SHOCK-F',   cat:'Підвіска',  unit:'шт',   qty:6, min:3, price:1680},
        {name:'Амортизатор задній KYB',  sku:'SHOCK-R',   cat:'Підвіска',  unit:'шт',   qty:6, min:2, price:1420},
        {name:'Сайлентблок важеля',      sku:'BUSH-ARM',  cat:'Підвіска',  unit:'шт',   qty:16,min:6, price:380 },
        {name:'Рідина гальмівна DOT4',   sku:'BRAKE-FL',  cat:'Рідини',    unit:'шт',   qty:20,min:8, price:95  },
        {name:'Акумулятор Bosch 60Ah',   sku:'BATT-60',   cat:'Акумулятор',unit:'шт',   qty:4, min:2, price:3200},
    ];
    const pRefs=PARTS.map(()=>cr.collection('warehouse_items').doc());
    PARTS.forEach((p,i)=>{ops.push({type:'set',ref:pRefs[i],data:{name:p.name,sku:p.sku,category:p.cat,unit:p.unit,quantity:p.qty,minQuantity:p.min,price:p.price,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // КАТАЛОГ ПОСЛУГ
    const SVC=[
        {name:'Заміна масла та фільтра',           price:500, unit:'послуга',cat:'ТО'},
        {name:'ТО комплексне',                      price:1200,unit:'послуга',cat:'ТО'},
        {name:'Комп\'ютерна діагностика',           price:400, unit:'послуга',cat:'Діагностика'},
        {name:'Повна діагностика авто',             price:800, unit:'послуга',cat:'Діагностика'},
        {name:'Заміна колодок (передні)',           price:600, unit:'послуга',cat:'Гальма'},
        {name:'Заміна колодок (задні)',             price:500, unit:'послуга',cat:'Гальма'},
        {name:'Заміна дисків (передні)',            price:800, unit:'послуга',cat:'Гальма'},
        {name:'Заміна ременя ГРМ',                  price:1200,unit:'послуга',cat:'ГРМ'},
        {name:'Шиномонтаж 4 колеса',               price:400, unit:'послуга',cat:'Шини'},
        {name:'Балансування 4 колеса',              price:280, unit:'послуга',cat:'Шини'},
        {name:'Заміна свічок',                      price:300, unit:'послуга',cat:'Двигун'},
        {name:'Заміна антифризу',                   price:350, unit:'послуга',cat:'Охолодження'},
        {name:'Заміна амортизаторів (2 шт)',        price:1200,unit:'послуга',cat:'Підвіска'},
        {name:'Заміна сайлентблоків (4 шт)',        price:800, unit:'послуга',cat:'Підвіска'},
        {name:'Кузовний огляд',                     price:200, unit:'послуга',cat:'Кузов'},
    ];
    const svcRefs=SVC.map(()=>cr.collection('sales_products').doc());
    SVC.forEach((s,i)=>{ops.push({type:'set',ref:svcRefs[i],data:{name:s.name,price:s.price,unit:s.unit,category:s.cat,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // НАРЯДИ
    const yr=new Date().getFullYear();
    const WO=[
        {v:0,c:0,m:0,status:'closed', d:-14,km:83200, ws:[0,1],ps:[{p:0,q:1},{p:3,q:1}],          note:'Оригінальне масло Toyota 5W-30. Пробіг від останнього ТО 12 000 км.'},
        {v:1,c:1,m:1,status:'closed', d:-10,km:40800, ws:[4,5], ps:[{p:6,q:1},{p:7,q:1}],          note:'Колодки скрипіли при гальмуванні. Передні зношені до 2 мм.'},
        {v:2,c:2,m:0,status:'closed', d:-7, km:96500, ws:[7],   ps:[{p:12,q:1},{p:13,q:1}],        note:'ГРМ — ресурс перевищено на 7 000 км. Ролики теж замінили.'},
        {v:5,c:5,m:2,status:'closed', d:-5, km:109800,ws:[8,9], ps:[],                              note:'Шиномонтаж — клієнт приїхав зі своїми шинами Michelin.'},
        {v:7,c:7,m:0,status:'paid',   d:-3, km:87900, ws:[2,0], ps:[{p:0,q:1},{p:3,q:1},{p:4,q:1}],note:'Діагностика виявила підвищене зношення повітряного фільтра.'},
        {v:0,c:0,m:0,status:'in_work',d:0,  km:85420, ws:[0,10],ps:[{p:0,q:1},{p:3,q:1},{p:10,q:1}],note:'Іванченко — масло Castrol 5W-30. Свічки NGK всі 4.'},
        {v:1,c:1,m:1,status:'in_work',d:0,  km:42100, ws:[4,6,9],ps:[{p:6,q:1},{p:8,q:2},{p:9,q:2}],note:'Гальма — колодки + диски передні. Лій новий DOT4.'},
        {v:2,c:2,m:0,status:'draft',  d:0,  km:98300, ws:[12,13],ps:[{p:14,q:2},{p:16,q:4}],       note:'Підвіска — 2 амортизатори + 4 сайлентблоки.'},
        {v:6,c:6,m:0,status:'draft',  d:1,  km:74200, ws:[7],    ps:[{p:12,q:1}],                  note:'Запис на завтра. ГРМ — ресурс 107 000 км перевищено.'},
        {v:8,c:8,m:4,status:'draft',  d:1,  km:38700, ws:[14],   ps:[],                             note:'Кузовний огляд + рихтування після ДТП.'},
    ];
    const woRefs=WO.map(()=>cr.collection('sales_orders').doc());
    WO.forEach((o,i)=>{
        const v=VEH[o.v];const cl=CL[o.c];const m=STAFF[o.m];
        const items=[
            ...o.ws.map(si=>{const s=SVC[si];return{id:'s'+si,name:s.name,qty:1,unit:s.unit,price:s.price,discount:0,total:s.price};}),
            ...o.ps.map(pi=>{const pt=PARTS[pi.p];return{id:'p'+pi.p,name:pt.name,qty:pi.q,unit:pt.unit,price:pt.price,discount:0,total:pt.price*pi.q,warehouseItemId:pRefs[pi.p].id};}),
        ];
        const total=items.reduce((s,x)=>s+x.total,0);
        const isPaid=o.status==='closed'||o.status==='paid';
        ops.push({type:'set',ref:woRefs[i],data:{
            type:'work_order',number:`WO-${yr}-${String(i+1).padStart(4,'0')}`,
            status:o.status,clientId:cRefs[o.c].id,clientName:cl.name,clientPhone:cl.phone,
            vehicleId:vRefs[o.v].id,vehicleInfo:{plate:v.plate,vin:v.vin,make:v.make,model:v.model,year:v.year,mileage:o.km},
            masterId:sRefs[o.m].id,masterName:m.name,date:dDate(o.d),
            items,subtotal:total,discountTotal:0,total,
            paymentMethod:'cash',paymentStatus:isPaid?'paid':'unpaid',paidAmount:isPaid?total:0,
            notes:o.note,isDemo:true,createdAt:dTs(o.d),updatedAt:now,
        }});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ЗАВДАННЯ
    const TASKS=[
        {t:'Mazda CX-5 Іванченко — заміна масла і свічок (до 12:00)',           fi:3,ai:0,st:'in_progress',pr:'high',  d:0, tm:'09:00',est:90, r:'Виконаний наряд WO, авто повернено клієнту'},
        {t:'Toyota Camry Ковальська — гальма: колодки + диски (до 14:00)',       fi:3,ai:1,st:'in_progress',pr:'high',  d:0, tm:'11:00',est:120,r:'Наряд виконано, клієнт перевірив і підписав'},
        {t:'VW Passat Шевченко — прийняти, скласти наряд підвіска',             fi:2,ai:3,st:'new',        pr:'high',  d:0, tm:'13:00',est:30, r:'Заповнений наряд з узгодженою сумою'},
        {t:'Зателефонувати Бойку — підтвердити запис на BMW X5 (повна діагностика)',fi:1,ai:3,st:'new',  pr:'medium',d:0, tm:'10:00',est:15, r:'Клієнт підтвердив дату і час'},
        {t:'Замовити диски Brembo 280мм — залишок 2 шт, мінімум 4',            fi:4,ai:3,st:'new',        pr:'high',  d:0, tm:'09:30',est:20, r:'Email постачальнику відправлено, підтвердження отримано'},
        {t:'BMW X5 Бойко — повна діагностика 4 год',                            fi:2,ai:0,st:'new',        pr:'high',  d:2, tm:'10:00',est:240,r:'Звіт діагностики, узгоджений план ремонту'},
        {t:'Skoda Octavia Гриценко — ремінь ГРМ (записана на завтра)',          fi:3,ai:0,st:'new',        pr:'high',  d:1, tm:'09:00',est:180,r:'Виконаний наряд, авто повернено'},
        {t:'Kia Sportage Павленко — кузовний огляд після ДТП',                  fi:3,ai:4,st:'new',        pr:'medium',d:1, tm:'11:00',est:60, r:'Складений кошторис ремонту кузова'},
        {t:'Атестація Андрія Левченка (3 місяці в колективі)',                  fi:6,ai:3,st:'new',        pr:'low',   d:3, tm:'16:00',est:60, r:'Форма атестації заповнена, рішення по зарплаті'},
        {t:'Оновити прайс — підняти вартість діагностики на 15%',              fi:0,ai:3,st:'new',        pr:'low',   d:4, tm:'11:00',est:30, r:'Новий прайс на сайті і в WhatsApp'},
        {t:'Звіт P&L за тиждень (щопонеділка)',                                fi:5,ai:6,st:'new',        pr:'medium',d:1, tm:'09:00',est:45, r:'Таблиця P&L заповнена, надіслана власнику'},
        {t:'Перевірити залишки складу і замовити (щоп\'ятниці)',               fi:4,ai:3,st:'new',        pr:'medium',d:4, tm:'16:00',est:30, r:'Залишки оновлені, замовлення відправлені'},
        {t:'Mercedes C200 Кравченко — не передзвонили після запиту 60 днів',   fi:1,ai:3,st:'overdue',   pr:'high',  d:-3,tm:'09:00',est:15, r:'Клієнт записаний або відмова — статус в CRM оновлено'},
        {t:'Google Business — нові фото і відповіді на відгуки (прострочено)', fi:0,ai:3,st:'overdue',   pr:'low',   d:-5,tm:'10:00',est:30, r:'Додано 5+ фото, відповіді на всі відгуки за місяць'},
    ];
    TASKS.forEach(tk=>{ops.push({type:'set',ref:cr.collection('tasks').doc(),data:{title:tk.t,functionName:FUNCS[tk.fi].name,functionId:fRefs[tk.fi].id,assigneeId:sRefs[tk.ai].id,assigneeName:STAFF[tk.ai].name,status:tk.st,priority:tk.pr,deadlineDate:dDate(tk.d),scheduledTime:tk.tm,estimatedMinutes:tk.est,expectedResult:tk.r,isDemo:true,createdAt:now,updatedAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ПРОЦЕСИ
    const P1_STEPS=[
        {n:'Запис клієнта',       fn:1,ai:3,dur:15,desc:'Прийняти дзвінок, записати авто. Уточнити: марка, рік, пробіг, скарга.'},
        {n:'Прийом авто',         fn:2,ai:0,dur:20,desc:'Зустріти клієнта, оглянути авто. Зафіксувати пошкодження. Уточнити пробіг.'},
        {n:'Діагностика та наряд',fn:2,ai:0,dur:40,desc:'Провести діагностику. Скласти наряд. Узгодити суму з клієнтом.'},
        {n:'Замовлення запчастин',fn:4,ai:3,dur:20,desc:'Перевірити склад. Замовити відсутнє. Повідомити клієнта про терміни.'},
        {n:'Виконання ремонту',   fn:3,ai:0,dur:120,desc:'Виконати роботи згідно наряду. Фотографувати критичні вузли.'},
        {n:'Контроль якості',     fn:3,ai:0,dur:30,desc:'Перевірити якість. Тест-драйв. Прибирання авто.'},
        {n:'Видача та оплата',    fn:1,ai:3,dur:20,desc:'Показати виконані роботи. Пояснити що замінено. Отримати оплату.'},
        {n:'Зворотній зв\'язок',fn:1,ai:3,dur:10,desc:'Через 3 дні: дзвінок клієнту. Чи все ok? Запросити відгук.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Стандарт обслуговування авто',description:'Повний цикл: запис → прийом → діагностика → ремонт → видача → відгук. 8 кроків.',category:'Основний',status:'active',steps:P1_STEPS.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});

    const P2_STEPS=[
        {n:'Виявлення потреби',   fn:4,ai:3,dur:15,desc:'Моніторинг залишків. Позиції нижче мінімуму.'},
        {n:'Формування замовлення',fn:4,ai:3,dur:20,desc:'Список замовлення. Вибір постачальника. Узгодження цін.'},
        {n:'Відправка замовлення',fn:4,ai:3,dur:10,desc:'Відправити постачальнику. Отримати підтвердження і дату.'},
        {n:'Прийом та перевірка', fn:4,ai:3,dur:30,desc:'Прийняти товар. Звірити з накладною. Оприбуткувати.'},
        {n:'Оплата',              fn:5,ai:6,dur:15,desc:'Перевірити рахунок. Провести оплату. Зберегти документи.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Закупівля запчастин',description:'Стандарт замовлення та прийому запчастин. 5 кроків.',category:'Склад',status:'active',steps:P2_STEPS.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});
    await window.safeBatchCommit(ops);ops=[];

    // ФІНАНСИ
    try{for(const col of['finance_transactions','finance_categories','finance_accounts']){const s=await cr.collection(col).get();if(!s.empty){const d=s.docs.map(doc=>({type:'delete',ref:doc.ref}));await window.safeBatchCommit(d);}}}catch(e){}
    const accCash=cr.collection('finance_accounts').doc();
    const accCard=cr.collection('finance_accounts').doc();
    ops.push({type:'set',ref:accCash,data:{name:'Каса (готівка)',  type:'cash',currency:'UAH',balance:18400, isDefault:true, isDemo:true,createdAt:now}});
    ops.push({type:'set',ref:accCard,data:{name:'ПриватБанк ФОП', type:'card',currency:'UAH',balance:142600,isDefault:false,isDemo:true,createdAt:now}});
    const CAT_I=['Ремонтні роботи','Запчастини (продаж)','Діагностика','Шиномонтаж'];
    const CAT_O=['Запчастини (закупівля)','Оренда боксів','Зарплата майстрів','Реклама','Комунальні'];
    const ciRefs=CAT_I.map(()=>cr.collection('finance_categories').doc());
    const coRefs=CAT_O.map(()=>cr.collection('finance_categories').doc());
    CAT_I.forEach((n,i)=>{ops.push({type:'set',ref:ciRefs[i],data:{name:n,type:'income', isDemo:true,createdAt:now}});});
    CAT_O.forEach((n,i)=>{ops.push({type:'set',ref:coRefs[i],data:{name:n,type:'expense',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    const TXNS=[
        {tp:'income', ci:0,acc:accCash,amt:1820, note:'Наряд WO-0001 — Mazda CX-5 Іванченко (масло+ТО)',      d:-14},
        {tp:'income', ci:0,acc:accCash,amt:3960, note:'Наряд WO-0002 — Toyota Camry Ковальська (гальма)',      d:-10},
        {tp:'income', ci:0,acc:accCash,amt:2800, note:'Наряд WO-0003 — VW Passat Шевченко (ремінь ГРМ)',       d:-7},
        {tp:'income', ci:3,acc:accCash,amt:680,  note:'Шиномонтаж — Ford Focus Марченко',                      d:-5},
        {tp:'income', ci:0,acc:accCash,amt:3240, note:'Наряд WO-0005 — Renault Duster Олійник',                d:-3},
        {tp:'income', ci:0,acc:accCard,amt:9240, note:'Наряд WO-0009 — Kia Sportage Павленко (підвіска)',      d:-1},
        {tp:'income', ci:0,acc:accCash,amt:8400, note:'Виручка 3-й тиждень березня (4 наряди)',                d:-18},
        {tp:'income', ci:0,acc:accCard,amt:12600,note:'Виручка 4-й тиждень березня (5 нарядів)',               d:-11},
        {tp:'income', ci:1,acc:accCash,amt:4200, note:'Запчастини (продаж клієнтам, березень)',                d:-11},
        {tp:'income', ci:0,acc:accCash,amt:7800, note:'Виручка 1-й тиждень квітня (4 наряди)',                 d:-4},
        {tp:'expense',ci:0,acc:accCard,amt:12400,note:'Закупівля — AutoParts Pro (накл. №А-1842)',             d:-15},
        {tp:'expense',ci:1,acc:accCash,amt:18000,note:'Оренда 3 боксів (березень)',                           d:-30},
        {tp:'expense',ci:2,acc:accCard,amt:42000,note:'Зарплата 6 майстрів (березень)',                       d:-28},
        {tp:'expense',ci:0,acc:accCard,amt:8600, note:'Закупівля — MotoZip (накл. №МЗ-4421)',                 d:-8},
        {tp:'expense',ci:3,acc:accCard,amt:3200, note:'Google Ads + Facebook (квітень)',                      d:-2},
        {tp:'expense',ci:4,acc:accCash,amt:4800, note:'Електроенергія + водопостачання (квітень)',            d:-1},
        {tp:'expense',ci:2,acc:accCard,amt:42000,note:'Зарплата 6 майстрів (квітень)',                        d:-1},
        {tp:'expense',ci:1,acc:accCash,amt:18000,note:'Оренда 3 боксів (квітень)',                            d:-1},
    ];
    TXNS.forEach(tx=>{ops.push({type:'set',ref:cr.collection('finance_transactions').doc(),data:{type:tx.tp,categoryId:(tx.tp==='income'?ciRefs:coRefs)[tx.ci].id,categoryName:(tx.tp==='income'?CAT_I:CAT_O)[tx.ci],accountId:tx.acc.id,amount:tx.amt,note:tx.note,date:dDate(tx.d),createdAt:dTs(tx.d),isDemo:true}});});
    await window.safeBatchCommit(ops);ops=[];

    // KPI
    const KPI=[
        {name:'Виручка тижнева',             unit:'₴', target:35000,vals:[28400,31200,29800,33600,35100,32400,34800]},
        {name:'Кількість нарядів за тиждень',unit:'шт',target:25,   vals:[18,21,19,23,25,22,24]},
        {name:'Середній чек наряду',          unit:'₴', target:1400, vals:[1240,1180,1320,1410,1480,1390,1520]},
        {name:'Завантаженість майстрів',      unit:'%', target:80,   vals:[62,68,71,75,78,74,82]},
        {name:'Повернення клієнтів (60 днів)',unit:'%', target:60,   vals:[42,45,48,51,55,53,58]},
    ];
    KPI.forEach(k=>{ops.push({type:'set',ref:cr.collection('kpi_metrics').doc(),data:{name:k.name,unit:k.unit,target:k.target,values:k.vals.map((v,i)=>({value:v,date:dDate(-42+i*7)})),currentValue:k.vals[k.vals.length-1],trend:k.vals[k.vals.length-1]>k.vals[k.vals.length-2]?'up':'down',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    await cr.update({name:'АвтоМайстер СТО',niche:'autoservice',nicheLabel:'Автосервіс — ремонт і обслуговування авто',description:'СТО АвтоМайстер — повний спектр послуг. 6 майстрів, 3 підйомники, комп\'ютерна діагностика. Київ, вул. Промислова 15.',city:'Київ',employees:7,currency:'UAH',avgCheck:1840,monthlyRevenue:145000,companyGoal:'Стати №1 СТО в районі за рейтингом Google та завантаженістю 85%+ майстрів',companyConcept:'Кожен клієнт знає що ми пам\'ятаємо його авто. Прозорий наряд, фото до/після, дзвінок через 3 дні.',targetAudience:'Власники авто 2015-2023 р.в. з доходом середній+. Цінують якість і прозорість.',modules:{scheduling:true,clientProfile:true,loyalty:false,subscriptions:false,reviews:true,winback:true,notifications:true,estimates:false,warehouse:true,booking:false,sales:true},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
};
if (window._NICHE_LABELS) window._NICHE_LABELS['autoservice'] = 'АвтоМайстер СТО (Київ)';

// ════════════════════════════════════════════════════════════════════════════
// HORECA — Кафе "Сонячне"
// ════════════════════════════════════════════════════════════════════════════
if (window._NICHE_LABELS) window._NICHE_LABELS['autoservice'] = 'АвтоМайстер СТО (Київ)';

// ════════════════════════════════════════════════════════════════════════════
// HORECA — Кафе "Сонячне"
// ════════════════════════════════════════════════════════════════════════════

window._DEMO_NICHE_MAP['horeca'] = async function() {
    if (!window.currentCompanyId || !window.db) throw new Error('No company');
    const cr = window.db.collection('companies').doc(window.currentCompanyId);
    const uid = window.currentUser?.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    function dDate(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);}
    function dTs(d){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+d*86400000));}
    let ops=[];

    // ФУНКЦІЇ
    const FUNCS=[
        {name:'0. Маркетинг',    color:'#ec4899',desc:'Реклама, Instagram, Google Maps, акції, залучення гостей'},
        {name:'1. Сервіс залу',  color:'#22c55e',desc:'Офіціанти, обслуговування столів, чеки, задоволеність гостей'},
        {name:'2. Кухня',        color:'#f97316',desc:'Приготування страв, якість, меню, заготовки, технологічні карти'},
        {name:'3. Бар та каса',  color:'#6366f1',desc:'Бар, каса, відкриття/закриття зміни, облік виручки'},
        {name:'4. Склад та закупівлі',color:'#0ea5e9',desc:'Продукти, залишки, замовлення у постачальників'},
        {name:'5. Фінанси',      color:'#10b981',desc:'P&L, зарплата, витрати, аналітика рентабельності'},
        {name:'6. Команда',      color:'#8b5cf6',desc:'Графік, навчання, стандарти обслуговування'},
        {name:'7. Управління',   color:'#f59e0b',desc:'Стратегія, якість, нові страви, масштабування'},
    ];
    const fRefs=FUNCS.map(()=>cr.collection('functions').doc());
    FUNCS.forEach((f,i)=>{ops.push({type:'set',ref:fRefs[i],data:{name:f.name,color:f.color,description:f.desc,order:i,status:'active',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // СПІВРОБІТНИКИ
    try{const o=await cr.collection('users').get();if(!o.empty){const d=[];o.docs.forEach(doc=>{if(doc.id!==uid)d.push({type:'delete',ref:cr.collection('users').doc(doc.id)});});if(d.length)await window.safeBatchCommit(d);}}catch(e){}
    const STAFF=[
        {name:'Марина Ковальчук', role:'Адміністратор',  fn:6,email:'kovalchuk@cafe.ua', phone:'+380671120001'},
        {name:'Іван Приходько',   role:'Шеф-кухар',      fn:2,email:'prykhodko@cafe.ua', phone:'+380671120002'},
        {name:'Оля Захарченко',   role:'Кухар',           fn:2,email:'zakharchenko@cafe.ua',phone:'+380671120003'},
        {name:'Петро Мороз',      role:'Кухар',           fn:2,email:'moroz@cafe.ua',     phone:'+380671120004'},
        {name:'Тетяна Бондар',    role:'Офіціант',        fn:1,email:'bondar@cafe.ua',    phone:'+380671120005'},
        {name:'Микола Даценко',   role:'Офіціант',        fn:1,email:'datsenko@cafe.ua',  phone:'+380671120006'},
        {name:'Ліля Гончаренко',  role:'Офіціант',        fn:1,email:'goncharenko@cafe.ua',phone:'+380671120007'},
        {name:'Арсен Кириленко',  role:'Бармен',          fn:3,email:'kyrylenko@cafe.ua', phone:'+380671120008'},
        {name:'Аліна Сергієнко',  role:'Касир',           fn:3,email:'sergiienko@cafe.ua',phone:'+380671120009'},
        {name:'Дмитро Власенко',  role:'Вантажник/клінінг',fn:4,email:'vlasenko@cafe.ua',phone:'+380671120010'},
    ];
    const sRefs=STAFF.map(()=>cr.collection('staff').doc());
    const uRefs=STAFF.map(()=>cr.collection('users').doc());
    STAFF.forEach((s,i)=>{
        ops.push({type:'set',ref:sRefs[i],data:{name:s.name,role:s.role,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,phone:s.phone,isActive:true,isDemo:true,createdAt:now}});
        ops.push({type:'set',ref:uRefs[i],data:{name:s.name,email:s.email,role:'employee',functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,staffId:sRefs[i].id,isDemo:true,createdAt:now}});
    });
    FUNCS.forEach((f,i)=>{const oi=STAFF.findIndex(s=>s.fn===i);if(oi>=0)ops.push({type:'update',ref:fRefs[i],data:{ownerId:sRefs[oi].id,ownerName:STAFF[oi].name}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM — постійні гості
    const GUESTS=[
        {name:'Петренко Марина',  phone:'+380671121001',visits:24,spent:6840, lastVisit:-2,  loyalty:true, notes:'Любить столик 3 біля вікна. Алергія на горіхи!'},
        {name:'Коваленко Ігор',   phone:'+380671121002',visits:8, spent:2280, lastVisit:-18, loyalty:true, notes:'Бізнес-ланч щотижня. Завжди бере борщ і каву.'},
        {name:'Бондаренко Сімейні',phone:'+380671121003',visits:12,spent:4800, lastVisit:-5,  loyalty:false,notes:'Сім\'я з дітьми. Столик 7. Дитяче меню.'},
        {name:'Ткаченко Ніна',    phone:'+380671121004',visits:31,spent:8680, lastVisit:-1,  loyalty:true, notes:'VIP гість. Завжди бере кожного 5-го каву безкоштовно.'},
        {name:'Мороз Андрій',     phone:'+380671121005',visits:5, spent:1250, lastVisit:-45, loyalty:false,notes:'Приходив щотижня, потім зник. Win-back.'},
        {name:'Гриценко Олена',   phone:'+380671121006',visits:18,spent:5040, lastVisit:-3,  loyalty:true, notes:'Любить десерти і капучино. Відзначає ДН 15 червня.'},
        {name:'Шевченко Юрій',    phone:'+380671121007',visits:7, spent:1960, lastVisit:-10, loyalty:false,notes:'Бізнес-ланч, завжди з колегами (5-6 осіб).'},
        {name:'Корпорація TechHub',phone:'+380671121008',visits:4, spent:8400, lastVisit:-7,  loyalty:false,notes:'Корпоративні замовлення. Банкети на 15-20 осіб.'},
    ];
    const gRefs=GUESTS.map(()=>cr.collection('crm_clients').doc());
    GUESTS.forEach((g,i)=>{ops.push({type:'set',ref:gRefs[i],data:{name:g.name,phone:g.phone,source:'direct',status:'active',notes:g.notes,totalSpent:g.spent,lastOrderDate:dDate(g.lastVisit),loyaltyPoints:g.loyalty?Math.floor(g.spent/10):0,isDemo:true,createdAt:dTs(g.lastVisit-30)}});});
    await window.safeBatchCommit(ops);ops=[];

    // МЕНЮ (каталог)
    const MENU=[
        // Перші страви
        {name:'Борщ з пампушками',          price:85,  unit:'порція',cat:'Перші страви'},
        {name:'Суп курячий з вермішеллю',   price:75,  unit:'порція',cat:'Перші страви'},
        {name:'Солянка м\'ясна',            price:95,  unit:'порція',cat:'Перші страви'},
        // Другі страви
        {name:'Котлета по-київськи',        price:145, unit:'порція',cat:'Другі страви'},
        {name:'Риба запечена з овочами',    price:165, unit:'порція',cat:'Другі страви'},
        {name:'Стейк зі свинини 200г',      price:195, unit:'порція',cat:'Другі страви'},
        {name:'Вареники з картоплею (6 шт)',price:95,  unit:'порція',cat:'Другі страви'},
        {name:'Плов по-домашньому',         price:115, unit:'порція',cat:'Другі страви'},
        // Гарніри
        {name:'Пюре картопляне',            price:45,  unit:'порція',cat:'Гарніри'},
        {name:'Рис відварний',              price:40,  unit:'порція',cat:'Гарніри'},
        {name:'Гречка з підливою',          price:50,  unit:'порція',cat:'Гарніри'},
        // Салати
        {name:'Цезар з куркою',             price:135, unit:'порція',cat:'Салати'},
        {name:'Грецький салат',             price:115, unit:'порція',cat:'Салати'},
        {name:'Вінегрет',                   price:65,  unit:'порція',cat:'Салати'},
        {name:'Олів\'є',                   price:75,  unit:'порція',cat:'Салати'},
        // Напої
        {name:'Кава еспресо',               price:45,  unit:'шт',    cat:'Напої'},
        {name:'Капучино 300мл',             price:75,  unit:'шт',    cat:'Напої'},
        {name:'Латте 350мл',                price:85,  unit:'шт',    cat:'Напої'},
        {name:'Чай трав\'яний',            price:55,  unit:'шт',    cat:'Напої'},
        {name:'Свіжовичавлений сік 300мл',  price:85,  unit:'шт',    cat:'Напої'},
        {name:'Компот домашній',            price:35,  unit:'шт',    cat:'Напої'},
        {name:'Вода мінеральна 0.5л',       price:30,  unit:'шт',    cat:'Напої'},
        // Десерти
        {name:'Торт Наполеон (порція)',      price:85,  unit:'порція',cat:'Десерти'},
        {name:'Млинці з варенням (3 шт)',    price:75,  unit:'порція',cat:'Десерти'},
        {name:'Морозиво асорті (3 кульки)',  price:65,  unit:'порція',cat:'Десерти'},
        {name:'Тірамісу',                   price:95,  unit:'порція',cat:'Десерти'},
        // Бізнес-ланч
        {name:'Бізнес-ланч (комплекс)',      price:135, unit:'порція',cat:'Бізнес-ланч'},
        // Хліб
        {name:'Хліб (порція)',               price:15,  unit:'порція',cat:'Хліб та випічка'},
        {name:'Пампушки часникові (3 шт)',   price:35,  unit:'порція',cat:'Хліб та випічка'},
        // Алкоголь
        {name:'Вино червоне (150мл)',        price:95,  unit:'шт',    cat:'Алкоголь'},
        {name:'Вино біле (150мл)',           price:85,  unit:'шт',    cat:'Алкоголь'},
        {name:'Пиво "Львівське" 0.5л',      price:55,  unit:'шт',    cat:'Алкоголь'},
    ];
    const mRefs=MENU.map(()=>cr.collection('sales_products').doc());
    MENU.forEach((m,i)=>{ops.push({type:'set',ref:mRefs[i],data:{name:m.name,price:m.price,unit:m.unit,category:m.cat,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // СКЛАД ПРОДУКТІВ
    const INGR=[
        {name:'Борошно пшеничне в/с',qty:85, unit:'кг', price:28, cat:'Бакалія', min:20},
        {name:'Цукор пісок',          qty:40, unit:'кг', price:32, cat:'Бакалія', min:10},
        {name:'Сіль кухонна',         qty:15, unit:'кг', price:8,  cat:'Бакалія', min:5},
        {name:'Олія соняшникова',      qty:24, unit:'л',  price:65, cat:'Бакалія', min:8},
        {name:'Масло вершкове 82.5%',  qty:18, unit:'кг', price:280,cat:'Молочні', min:5},
        {name:'Яйця (С1, 10 шт)',      qty:80, unit:'упак',price:65, cat:'Молочні', min:20},
        {name:'Молоко 3.2% (1л)',       qty:95, unit:'л',  price:32, cat:'Молочні', min:30},
        {name:'Сметана 20% (0.5л)',     qty:28, unit:'шт', price:48, cat:'Молочні', min:10},
        {name:'Картопля',              qty:120,unit:'кг', price:12, cat:'Овочі',   min:30},
        {name:'Буряк',                 qty:42, unit:'кг', price:14, cat:'Овочі',   min:15},
        {name:'Морква',                qty:38, unit:'кг', price:16, cat:'Овочі',   min:15},
        {name:'Капуста білокачанна',   qty:28, unit:'кг', price:10, cat:'Овочі',   min:10},
        {name:'Цибуля ріпчаста',       qty:25, unit:'кг', price:18, cat:'Овочі',   min:8},
        {name:'Помідори',              qty:18, unit:'кг', price:45, cat:'Овочі',   min:8},
        {name:'Огірки свіжі',          qty:12, unit:'кг', price:48, cat:'Овочі',   min:5},
        {name:'М\'ясо свинина (лопатка)',qty:32,unit:'кг', price:185,cat:'М\'ясо', min:10},
        {name:'М\'ясо яловичина',       qty:18, unit:'кг', price:220,cat:'М\'ясо', min:8},
        {name:'Курятина (грудка)',      qty:28, unit:'кг', price:130,cat:'М\'ясо', min:10},
        {name:'Риба (судак/тилапія)',   qty:14, unit:'кг', price:195,cat:'Риба',   min:5},
        {name:'Кава зернова (1кг)',     qty:6,  unit:'кг', price:580,cat:'Кава/Чай',min:2},
        {name:'Чай трав\'яний (100г)',  qty:12, unit:'упак',price:45,cat:'Кава/Чай',min:4},
        {name:'Молоко для кави 3.5%',   qty:30, unit:'л',  price:38, cat:'Молочні', min:10},
        {name:'Вершки 33% (1л)',         qty:8,  unit:'л',  price:165,cat:'Молочні', min:3},
    ];
    const iRefs=INGR.map(()=>cr.collection('warehouse_items').doc());
    INGR.forEach((it,i)=>{ops.push({type:'set',ref:iRefs[i],data:{name:it.name,quantity:it.qty,price:it.price,unit:it.unit,category:it.cat,minQuantity:it.min,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ЗМІНИ (shifts)
    const yr=new Date().getFullYear();
    const shiftYRef=cr.collection('sales_shifts').doc();
    const shiftTRef=cr.collection('sales_shifts').doc();
    ops.push({type:'set',ref:shiftYRef,data:{status:'closed',openedByName:STAFF[8].name,openedAt:dTs(-1),closedAt:dTs(-0.4),cashStart:500,cashEnd:3700,totalCash:3200,totalTerminal:2100,totalTransfer:0,totalRevenue:5300,ordersCount:22,avgCheck:241,notes:'Вівторок — гарний день. Були замовлення від TechHub.',isDemo:true,createdAt:dTs(-1)}});
    ops.push({type:'set',ref:shiftTRef,data:{status:'open',openedByName:STAFF[8].name,openedAt:dTs(0),closedAt:null,cashStart:500,cashEnd:0,totalCash:0,totalTerminal:0,totalTransfer:0,totalRevenue:0,ordersCount:0,avgCheck:0,notes:'',isDemo:true,createdAt:dTs(0)}});
    await window.safeBatchCommit(ops);ops=[];

    // ЧЕКИ (receipts) — вчора і сьогодні
    const CHECKS=[
        // Вчора
        {d:-1,n:1,mi:[0,8,15],   method:'cash',   cI:0,  table:'Стіл 3'},
        {d:-1,n:2,mi:[3,11,16,21],method:'terminal',cI:1, table:'Стіл 1'},
        {d:-1,n:3,mi:[26,15,22], method:'cash',   cI:-1, table:'Стіл 5'},
        {d:-1,n:4,mi:[4,12,14,24],method:'cash',  cI:2,  table:'Стіл 7'},
        {d:-1,n:5,mi:[0,1,8,15,20],method:'terminal',cI:3,table:'Стіл 2'},
        {d:-1,n:6,mi:[2,13,18],  method:'cash',   cI:-1, table:'Стіл 6'},
        {d:-1,n:7,mi:[3,11,15],  method:'terminal',cI:4, table:'Стіл 4'},
        {d:-1,n:8,mi:[26,26,26,15,15,16,21,5,8],method:'terminal',cI:7,table:'Корпоратив TechHub (8 осіб)'},
        {d:-1,n:9,mi:[26,16,20], method:'cash',   cI:5,  table:'Стіл 8'},
        {d:-1,n:10,mi:[26,15,22,24],method:'cash', cI:-1,table:'Стіл 9'},
        {d:-1,n:11,mi:[3,8,28],  method:'terminal',cI:6, table:'Стіл 10'},
        // Сьогодні (поки відкрита зміна)
        {d:0,n:12,mi:[0,8,15],   method:'cash',   cI:0,  table:'Стіл 3'},
        {d:0,n:13,mi:[4,11,16],  method:'terminal',cI:1, table:'Стіл 1'},
        {d:0,n:14,mi:[26,15,22], method:'cash',   cI:3,  table:'Стіл 2'},
        {d:0,n:15,mi:[3,12,14,24],method:'terminal',cI:-1,table:'Стіл 5'},
        {d:0,n:16,mi:[26,16,20], method:'cash',   cI:5,  table:'Стіл 7'},
    ];
    CHECKS.forEach(ch=>{
        const items=ch.mi.map(mi=>{const m=MENU[mi];return{id:String(mi),name:m.name,qty:1,unit:m.unit,price:m.price,discount:0,total:m.price};});
        const total=items.reduce((s,x)=>s+x.total,0);
        ops.push({type:'set',ref:cr.collection('sales_orders').doc(),data:{
            type:'receipt',number:`RCP-${yr}-${String(ch.n).padStart(4,'0')}`,status:'paid',
            clientId:ch.cI>=0?gRefs[ch.cI].id:'',clientName:ch.cI>=0?GUESTS[ch.cI].name:ch.table,
            date:dDate(ch.d),items,subtotal:total,discountTotal:0,total,
            paymentMethod:ch.method,paymentStatus:'paid',paidAmount:total,
            shiftId:ch.d<0?shiftYRef.id:shiftTRef.id,notes:ch.table,
            isDemo:true,createdAt:dTs(ch.d),updatedAt:now,
        }});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ЗАВДАННЯ
    const TASKS=[
        {t:'Заготовити 30 порцій борщу до 11:00 (основна страва дня)',          fi:2,ai:1,st:'in_progress',pr:'high',  d:0,tm:'07:30',est:90, r:'Борщ готовий, на роздачі до 11:00'},
        {t:'Відкрити зміну о 9:00 — каса 500 грн, перевірити залишки',          fi:3,ai:8,st:'done',       pr:'high',  d:0,tm:'09:00',est:15, r:'Зміна відкрита, залишки перевірені'},
        {t:'Сервірування залу — 12 столів до 10:30',                             fi:1,ai:4,st:'done',       pr:'medium',d:0,tm:'09:30',est:45, r:'Всі столи сервіровані, зал готовий до відкриття'},
        {t:'Замовити капусту — залишок 28 кг, мінімум 30 кг (нижче ліміту)',    fi:4,ai:9,st:'new',        pr:'high',  d:0,tm:'08:00',est:20, r:'Email постачальнику відправлено, дата доставки підтверджена'},
        {t:'Банкет TechHub на 18:00 — 15 осіб, стіл 7+8+9',                    fi:1,ai:0,st:'new',        pr:'high',  d:1,tm:'17:30',est:30, r:'Стіл накритий, меню погоджено, офіціант призначений'},
        {t:'Приготувати шоколадний торт на ДН Гриценко Олени (15 червня)',       fi:2,ai:1,st:'new',        pr:'medium',d:2,tm:'14:00',est:120,r:'Торт готовий, прикраса імені, свічки'},
        {t:'Відповісти на відгуки в Google Maps (3 нових відгуки)',              fi:0,ai:0,st:'new',        pr:'medium',d:0,tm:'11:00',est:20, r:'Відповіді на всі відгуки за тиждень'},
        {t:'Акція "Безкоштовна кава" — оновити Instagram Stories',              fi:0,ai:0,st:'new',        pr:'low',   d:1,tm:'10:00',est:30, r:'Пост і Stories опубліковані, охоплення > 500'},
        {t:'Звіт P&L — вчорашня зміна: виручка 5 300, витрати?',               fi:5,ai:0,st:'new',        pr:'medium',d:0,tm:'09:00',est:30, r:'Заповнена таблиця P&L, надіслана власнику'},
        {t:'Мороз Андрій — 45 днів без візиту. Відправити SMS "Скучали"',       fi:0,ai:0,st:'overdue',   pr:'medium',d:-2,tm:'12:00',est:10, r:'SMS відправлено або відмітка "не цікавий"'},
        {t:'Провести санітарну перевірку кухні (щотижнево)',                    fi:2,ai:1,st:'overdue',   pr:'low',   d:-3,tm:'17:00',est:60, r:'Чек-ліст заповнено, зауваження усунуто'},
        {t:'Оновити меню — додати сезонні страви (весна)',                       fi:7,ai:0,st:'new',        pr:'low',   d:5, tm:'11:00',est:120,r:'Нові 3-5 позицій в меню, оновлені роздруківки'},
        {t:'Закупівля продуктів на тиждень (щопонеділка)',                       fi:4,ai:9,st:'new',        pr:'high',  d:1, tm:'08:00',est:60, r:'Всі продукти куплені, склад поповнено'},
    ];
    TASKS.forEach(tk=>{ops.push({type:'set',ref:cr.collection('tasks').doc(),data:{title:tk.t,functionName:FUNCS[tk.fi].name,functionId:fRefs[tk.fi].id,assigneeId:sRefs[tk.ai].id,assigneeName:STAFF[tk.ai].name,status:tk.st,priority:tk.pr,deadlineDate:dDate(tk.d),scheduledTime:tk.tm,estimatedMinutes:tk.est,expectedResult:tk.r,isDemo:true,createdAt:now,updatedAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ПРОЦЕСИ
    const P1=[
        {n:'Відкриття зміни',           fn:3,ai:8,dur:20, desc:'Перевірити касу. Відкрити зміну в системі. Перевірити залишки і наявність для меню.'},
        {n:'Підготовка залу',           fn:1,ai:4,dur:45, desc:'Сервірування столів. Перевірка чистоти. Зустріч гостей від 10:00.'},
        {n:'Підготовка кухні',          fn:2,ai:1,dur:60, desc:'Заготовки до 11:00. Перевірка залишків. Розкладка по позиціях.'},
        {n:'Обслуговування гостей',     fn:1,ai:4,dur:30, desc:'Зустріч, меню, прийом замовлення, подача, розрахунок. Стандарт 5 хвилин на прийом.'},
        {n:'Обробка оплати',            fn:3,ai:8,dur:5,  desc:'Провести чек. Готівка або термінал. Видати решту/чек.'},
        {n:'Збирання столу',            fn:1,ai:4,dur:10, desc:'Зібрати посуд. Прибрати стіл. Готовність до наступних гостей.'},
        {n:'Закриття зміни',            fn:3,ai:8,dur:30, desc:'Підрахунок виручки. Закриття зміни в системі. Звіт власнику.'},
        {n:'Миття та прибирання',       fn:6,ai:9,dur:60, desc:'Посуд, підлога, кухня. Санітарні стандарти.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Стандарт обслуговування гостей',description:'Повний цикл: відкриття зміни → обслуговування → закриття. 8 кроків.',category:'Основний',status:'active',steps:P1.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});
    await window.safeBatchCommit(ops);ops=[];

    // ФІНАНСИ
    try{for(const col of['finance_transactions','finance_categories','finance_accounts']){const s=await cr.collection(col).get();if(!s.empty){const d=s.docs.map(doc=>({type:'delete',ref:doc.ref}));await window.safeBatchCommit(d);}}}catch(e){}
    const accCash=cr.collection('finance_accounts').doc();
    const accCard=cr.collection('finance_accounts').doc();
    ops.push({type:'set',ref:accCash,data:{name:'Каса (готівка)',  type:'cash',currency:'UAH',balance:8400, isDefault:true, isDemo:true,createdAt:now}});
    ops.push({type:'set',ref:accCard,data:{name:'ПриватБанк ФОП', type:'card',currency:'UAH',balance:86200,isDefault:false,isDemo:true,createdAt:now}});
    const CAT_I=['Виручка від продажів','Доставка та кейтеринг','Банкети та корпоративи'];
    const CAT_O=['Продукти та сировина','Оренда приміщення','Зарплата персоналу','Комунальні послуги','Реклама та маркетинг','Обладнання та інвентар'];
    const ciRefs=CAT_I.map(()=>cr.collection('finance_categories').doc());
    const coRefs=CAT_O.map(()=>cr.collection('finance_categories').doc());
    CAT_I.forEach((n,i)=>{ops.push({type:'set',ref:ciRefs[i],data:{name:n,type:'income', isDemo:true,createdAt:now}});});
    CAT_O.forEach((n,i)=>{ops.push({type:'set',ref:coRefs[i],data:{name:n,type:'expense',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    const TXNS=[
        {tp:'income', ci:0,acc:accCash,amt:5300, note:'Виручка вчора (22 чеки, зміна закрита)',           d:-1},
        {tp:'income', ci:0,acc:accCard,amt:4840, note:'Виручка позавчора (20 чеків)',                     d:-2},
        {tp:'income', ci:2,acc:accCard,amt:8400, note:'Корпоратив TechHub — 15 осіб банкет',              d:-7},
        {tp:'income', ci:0,acc:accCash,amt:5680, note:'Виручка 3-й тиждень березня (5 смін)',             d:-15},
        {tp:'income', ci:0,acc:accCard,amt:6240, note:'Виручка 4-й тиждень березня (5 смін)',             d:-8},
        {tp:'income', ci:1,acc:accCard,amt:2800, note:'Доставка бізнес-ланчів офіс на тиждень',           d:-5},
        {tp:'expense',ci:0,acc:accCard,amt:18400,note:'Закупівля продуктів — ринок + постачальники (квітень)',d:-3},
        {tp:'expense',ci:1,acc:accCash,amt:22000,note:'Оренда приміщення 80 м² (квітень)',               d:-1},
        {tp:'expense',ci:2,acc:accCard,amt:48000,note:'Зарплата 10 співробітників (березень)',            d:-28},
        {tp:'expense',ci:3,acc:accCash,amt:6400, note:'Електроенергія + газ + вода (квітень)',            d:-1},
        {tp:'expense',ci:4,acc:accCard,amt:3200, note:'Instagram + Google реклама (квітень)',             d:-2},
        {tp:'expense',ci:0,acc:accCard,amt:16800,note:'Закупівля продуктів — березень',                  d:-15},
        {tp:'expense',ci:1,acc:accCash,amt:22000,note:'Оренда (березень)',                               d:-28},
        {tp:'expense',ci:2,acc:accCard,amt:48000,note:'Зарплата персоналу (квітень)',                    d:-1},
    ];
    TXNS.forEach(tx=>{ops.push({type:'set',ref:cr.collection('finance_transactions').doc(),data:{type:tx.tp,categoryId:(tx.tp==='income'?ciRefs:coRefs)[tx.ci].id,categoryName:(tx.tp==='income'?CAT_I:CAT_O)[tx.ci],accountId:tx.acc.id,amount:tx.amt,note:tx.note,date:dDate(tx.d),createdAt:dTs(tx.d),isDemo:true}});});
    await window.safeBatchCommit(ops);ops=[];

    // KPI
    const KPI=[
        {name:'Виручка тижнева',            unit:'₴',  target:38000,vals:[28400,31200,29800,33600,35100,32400,34800]},
        {name:'Кількість чеків за день',    unit:'шт', target:28,   vals:[19,22,18,24,26,21,22]},
        {name:'Середній чек',               unit:'₴',  target:260,  vals:[218,235,224,248,256,241,245]},
        {name:'Завантаженість залу (пік)',  unit:'%',  target:90,   vals:[65,72,68,78,82,75,80]},
        {name:'Повернення гостей (30 днів)',unit:'%',  target:55,   vals:[38,42,45,48,50,47,52]},
    ];
    KPI.forEach(k=>{ops.push({type:'set',ref:cr.collection('kpi_metrics').doc(),data:{name:k.name,unit:k.unit,target:k.target,values:k.vals.map((v,i)=>({value:v,date:dDate(-42+i*7)})),currentValue:k.vals[k.vals.length-1],trend:k.vals[k.vals.length-1]>k.vals[k.vals.length-2]?'up':'down',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    await cr.update({name:'Кафе "Сонячне"',niche:'horeca',nicheLabel:'HoReCa — кафе, ресторан',description:'Кафе "Сонячне" — домашня кухня, бізнес-ланчі, банкети. 10 співробітників, 60 посадкових місць. Київ, вул. Садова 8.',city:'Київ',employees:10,currency:'UAH',avgCheck:241,monthlyRevenue:158000,companyGoal:'Завантаженість 85%+ в обідній час, NPS гостей > 80, власний бренд бізнес-ланчів у районі',companyConcept:'Кожен гість — постійний. Борщ як вдома, сервіс як в ресторані.',targetAudience:'Офісні працівники 25-45 років на бізнес-ланчах, сім\'ї на вечерях, корпоративні замовлення.',modules:{scheduling:true,clientProfile:true,loyalty:true,subscriptions:false,reviews:true,winback:true,notifications:true,estimates:false,warehouse:true,booking:false,sales:true},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
};
if (window._NICHE_LABELS) window._NICHE_LABELS['horeca'] = 'Кафе "Сонячне" — HoReCa (Київ)';

// ════════════════════════════════════════════════════════════════════════════
// ЛОГІСТИКА — Логіст Про
// ════════════════════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['logistics'] = async function() {
    if (!window.currentCompanyId || !window.db) throw new Error('No company');
    const cr = window.db.collection('companies').doc(window.currentCompanyId);
    const uid = window.currentUser?.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    function dDate(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);}
    function dTs(d){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+d*86400000));}
    let ops=[];

    const FUNCS=[
        {name:'0. Маркетинг та залучення', color:'#ec4899',desc:'Сайт, пошук клієнтів, тендери, партнерства'},
        {name:'1. Диспетчеризація',        color:'#22c55e',desc:'Розподіл рейсів, зв\'язок з водіями, відстеження'},
        {name:'2. Водії та транспорт',     color:'#f97316',desc:'Водії, техстан авто, документи, маршрути'},
        {name:'3. Клієнтський сервіс',     color:'#6366f1',desc:'Комунікація з клієнтами, документи, ТТН/CMR'},
        {name:'4. Фінанси та розрахунки',  color:'#10b981',desc:'Тарифи, рахунки, оплати водіїв, P&L'},
        {name:'5. Команда',                color:'#8b5cf6',desc:'Водії, диспетчери, навчання, KPI'},
        {name:'6. Управління',             color:'#f59e0b',desc:'Стратегія, нові напрямки, ефективність'},
    ];
    const fRefs=FUNCS.map(()=>cr.collection('functions').doc());
    FUNCS.forEach((f,i)=>{ops.push({type:'set',ref:fRefs[i],data:{name:f.name,color:f.color,description:f.desc,order:i,status:'active',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    try{const o=await cr.collection('users').get();if(!o.empty){const d=[];o.docs.forEach(doc=>{if(doc.id!==uid)d.push({type:'delete',ref:cr.collection('users').doc(doc.id)});});if(d.length)await window.safeBatchCommit(d);}}catch(e){}
    const STAFF=[
        {name:'Іваненко Микола',   role:'Водій (категорія CE)',     fn:2,email:'ivanenko@logist.ua',plate:'AA1111BB',phone:'+380671230001'},
        {name:'Коваленко Сергій',  role:'Водій (категорія CE)',     fn:2,email:'kovalenko@logist.ua',plate:'KA2222CC',phone:'+380671230002'},
        {name:'Петренко Андрій',   role:'Водій (категорія CE)',     fn:2,email:'petrenko@logist.ua', plate:'AA3333DD',phone:'+380671230003'},
        {name:'Мороз Василь',      role:'Водій (категорія C)',      fn:2,email:'moroz@logist.ua',    plate:'KA4444EE',phone:'+380671230004'},
        {name:'Захарченко Дмитро', role:'Водій (категорія C)',      fn:2,email:'zakharchenko@logist.ua',plate:'AA5555FF',phone:'+380671230005'},
        {name:'Олена Бондаренко',  role:'Диспетчер',                fn:1,email:'bondarenko@logist.ua',plate:'',phone:'+380671230006'},
        {name:'Іван Ткаченко',     role:'Логіст / менеджер',        fn:3,email:'tkachenko@logist.ua', plate:'',phone:'+380671230007'},
    ];
    const sRefs=STAFF.map(()=>cr.collection('staff').doc());
    const uRefs=STAFF.map(()=>cr.collection('users').doc());
    STAFF.forEach((s,i)=>{
        ops.push({type:'set',ref:sRefs[i],data:{name:s.name,role:s.role,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,phone:s.phone,notes:s.plate?`Авто: ${s.plate}`:'',isActive:true,isDemo:true,createdAt:now}});
        ops.push({type:'set',ref:uRefs[i],data:{name:s.name,email:s.email,role:'employee',functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,staffId:sRefs[i].id,isDemo:true,createdAt:now}});
    });
    FUNCS.forEach((f,i)=>{const oi=STAFF.findIndex(s=>s.fn===i);if(oi>=0)ops.push({type:'update',ref:fRefs[i],data:{ownerId:sRefs[oi].id,ownerName:STAFF[oi].name}});});
    await window.safeBatchCommit(ops);ops=[];

    const CLIENTS=[
        {name:'ТОВ БудМайстер',         phone:'+380441234561',email:'bud@budmaister.ua',  notes:'Будматеріали, регулярні рейси Київ-Захід. Оплата 7 днів.',     spent:57000,d:-3},
        {name:'ФОП Іванченко Логістик',  phone:'+380441234562',email:'ivan@fop.ua',         notes:'Дрібні вантажі, нерегулярно. Іноді затримує оплату.',          spent:22000,d:-15},
        {name:'ТОВ АгроТрейд',           phone:'+380441234563',email:'agro@agrotr.ua',      notes:'Зернові, сезонні рейси (серпень-жовтень). Великі обсяги.',     spent:84000,d:-7},
        {name:'ПП Карго Сервіс',         phone:'+380441234564',email:'cargo@pp.ua',          notes:'Обладнання та техніка. Потрібна ретельна упаковка.',           spent:38500,d:-5},
        {name:'ТОВ Укрпромпостач',       phone:'+380441234565',email:'ukr@ukrprom.ua',       notes:'Промислові товари, постачання по всій Україні.',              spent:46200,d:-2},
        {name:'ВАТ Метал-Груп',          phone:'+380441234566',email:'metal@grup.ua',         notes:'Металопрокат, важкі вантажі. Потрібна платформа.',             spent:62400,d:-20},
        {name:'ТОВ FreshMart Logistics', phone:'+380441234567',email:'fresh@freshmart.ua',   notes:'Продукти харчування, рефрижератор. Термінові рейси.',          spent:28800,d:-1},
    ];
    const cRefs=CLIENTS.map(()=>cr.collection('crm_clients').doc());
    CLIENTS.forEach((c,i)=>{ops.push({type:'set',ref:cRefs[i],data:{name:c.name,phone:c.phone,email:c.email,source:'direct',status:'active',notes:c.notes,totalSpent:c.spent,lastOrderDate:dDate(c.d),isDemo:true,createdAt:dTs(c.d-20)}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM УГОДИ — переговори щодо нових рейсів
    const DEALS=[
        {t:'ТОВ АгроТрейд — контракт на сезонні рейси зернових (серпень-жовтень)', c:2,amt:240000,stage:'consultation',ai:6,d:-5},
        {t:'ВАТ Метал-Груп — постійний партнер (2 рейси на тиждень)',               c:5,amt:96000, stage:'consultation',ai:6,d:-3},
        {t:'ТОВ FreshMart — рефрижератор Київ-Одеса (рефрижератор, щотижня)',       c:6,amt:48000, stage:'new',        ai:5,d:0},
        {t:'ТОВ БудМайстер — підвищення тарифу на 8% від травня',                  c:0,amt:8000,  stage:'consultation',ai:6,d:-1},
    ];
    DEALS.forEach(d=>{ops.push({type:'set',ref:cr.collection('crm_deals').doc(),data:{title:d.t,clientId:cRefs[d.c].id,clientName:CLIENTS[d.c].name,phone:CLIENTS[d.c].phone,amount:d.amt,stage:d.stage,assigneeId:sRefs[d.ai].id,assigneeName:STAFF[d.ai].name,source:'phone',isDemo:true,createdAt:dTs(d.d)}});});
    await window.safeBatchCommit(ops);ops=[];

    // РЕЙСИ
    const yr=new Date().getFullYear();
    const ROUTES=[
        {from:'Київ',   to:'Львів',     cargo:'Будматеріали',    wt:8,  vol:24,tariff:9500, dI:0,cI:0,fuel:1400,road:540, drv:1500,status:'closed',d:-8, note:'Блоки газобетонні, 2 піддони. Розвантаження о 14:00.'},
        {from:'Харків', to:'Одеса',     cargo:'Зернові (пшениця)',wt:20, vol:60,tariff:14000,dI:1,cI:2,fuel:2200,road:820, drv:2000,status:'closed',d:-6, note:'Зерновоз, 20т. Завантаження на елеваторі, розвантаження порт.'},
        {from:'Київ',   to:'Дніпро',   cargo:'Промислове обладнання',wt:5,vol:15,tariff:7500,dI:2,cI:3,fuel:980,road:360,drv:1200,status:'closed',d:-4, note:'Верстати ЧПК, 3 місця. Обережно — крихке!'},
        {from:'Львів',  to:'Харків',   cargo:'Текстиль',         wt:3,  vol:12,tariff:11000,dI:3,cI:4,fuel:1800,road:680, drv:1600,status:'paid',  d:-2, note:'Одяг, 8 паків. Завантаження 08:00, розвантаження до 18:00.'},
        {from:'Київ',   to:'Полтава',  cargo:'Продукти харчування',wt:12,vol:35,tariff:6500,dI:4,cI:6,fuel:780, road:280, drv:1000,status:'sent',  d:-1, note:'Рефрижератор +4°C. Термін доставки до 10:00.'},
        {from:'Одеса',  to:'Київ',     cargo:'Металопрокат',     wt:15, vol:20,tariff:12000,dI:0,cI:5,fuel:1600,road:580, drv:1800,status:'draft', d:0,  note:'Труби, арматура. Маса 15т. Потрібна платформа.'},
        {from:'Київ',   to:'Запоріжжя', cargo:'Будматеріали',           wt:8,  vol:24,tariff:8500, dI:1,cI:0,fuel:1100,road:400, drv:1400,status:'draft', d:1,  note:'ТОВ БудМайстер, 2-й рейс за тиждень. Цегла 8т.'},
    ];
    const rRefs=ROUTES.map(()=>cr.collection('sales_orders').doc());
    ROUTES.forEach((r,i)=>{
        const d=STAFF[r.dI];const c=CLIENTS[r.cI];
        const exp=[{type:'fuel',amount:r.fuel,note:'Паливо'},{type:'road',amount:r.road,note:'Платні дороги'},{type:'driver',amount:r.drv,note:'Оплата водія'}];
        const profit=r.tariff-r.fuel-r.road-r.drv;
        const isPaid=r.status==='closed'||r.status==='paid';
        ops.push({type:'set',ref:rRefs[i],data:{
            type:'route',number:`RTE-${yr}-${String(i+1).padStart(4,'0')}`,status:r.status,
            clientId:cRefs[r.cI].id,clientName:c.name,clientPhone:c.phone,
            date:dDate(r.d),routeFrom:r.from,routeTo:r.to,cargoWeight:r.wt,cargoVolume:r.vol,
            items:[{id:'1',name:`Перевезення ${r.from}–${r.to}`,qty:1,unit:'рейс',price:r.tariff,discount:0,total:r.tariff}],
            subtotal:r.tariff,discountTotal:0,total:r.tariff,
            paymentMethod:'transfer',paymentStatus:isPaid?'paid':'unpaid',paidAmount:isPaid?r.tariff:0,
            driverId:sRefs[r.dI].id,driverName:d.name,vehiclePlate:d.plate||'',
            routeExpenses:exp,routeProfit:profit,
            notes:r.note,isDemo:true,createdAt:dTs(r.d),updatedAt:now,
        }});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ЗАВДАННЯ
    const TASKS=[
        {t:'Рейс RTE-0006: Одеса→Київ — скоординувати завантаження металопрокату',  fi:1,ai:5,st:'in_progress',pr:'high',  d:0,tm:'07:00',est:30,r:'Микола підтвердив виїзд, ТТН оформлена'},
        {t:'Рейс RTE-0007: завтра Київ→Запоріжжя — підтвердити з БудМайстром',       fi:3,ai:6,st:'new',        pr:'high',  d:0,tm:'10:00',est:20,r:'Клієнт підтвердив, час завантаження 07:00'},
        {t:'Сергій Коваленко — перевірка тахографа і документів (щомісяця)',          fi:5,ai:5,st:'new',        pr:'medium',d:1,tm:'09:00',est:30,r:'Тахограф перевірено, документи в порядку або замовлено'},
        {t:'Виставити рахунок ТОВ Укрпромпостач (RTE-0004, 11 000 грн)',             fi:4,ai:6,st:'new',        pr:'high',  d:0,tm:'09:00',est:15,r:'Рахунок виставлений, відправлений email'},
        {t:'ФОП Іванченко — прострочення оплати 15 днів. Нагадати.',                 fi:4,ai:6,st:'overdue',   pr:'high',  d:-3,tm:'10:00',est:15,r:'Оплата отримана або домовились про дату'},
        {t:'Переговори АгроТрейд — контракт на сезон (зернові серп-жовт)',           fi:0,ai:6,st:'new',        pr:'high',  d:2,tm:'11:00',est:60,r:'Підписаний договір або перехід на наступний етап'},
        {t:'ТО авто AA1111BB (Микола) — пробіг 185 000 км',                         fi:2,ai:5,st:'new',        pr:'medium',d:3,tm:'09:00',est:240,r:'ТО виконано, запис в картку авто'},
        {t:'Звіт рентабельності рейсів за квітень (P&L по напрямках)',               fi:4,ai:6,st:'new',        pr:'medium',d:1,tm:'17:00',est:90,r:'Таблиця по напрямках: Київ-Львів vs Харків-Одеса'},
        {t:'Мороз Василь — продовження ліцензії водія (спливає 15.06)',             fi:5,ai:5,st:'new',        pr:'medium',d:7,tm:'09:00',est:30,r:'Документи подані, дата отримання відома'},
        {t:'Оновити сайт — додати нові напрямки і тарифи',                          fi:0,ai:6,st:'new',        pr:'low',   d:5,tm:'11:00',est:60,r:'Сайт оновлений, нові напрямки вказані'},
    ];
    TASKS.forEach(tk=>{ops.push({type:'set',ref:cr.collection('tasks').doc(),data:{title:tk.t,functionName:FUNCS[tk.fi].name,functionId:fRefs[tk.fi].id,assigneeId:sRefs[tk.ai].id,assigneeName:STAFF[tk.ai].name,status:tk.st,priority:tk.pr,deadlineDate:dDate(tk.d),scheduledTime:tk.tm,estimatedMinutes:tk.est,expectedResult:tk.r,isDemo:true,createdAt:now,updatedAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ПРОЦЕСИ
    const P1=[
        {n:'Прийом замовлення',       fn:3,ai:6,dur:30,desc:'Отримати заявку. Уточнити: маршрут, вантаж (вага/об\'єм/тип), дата, ціна. Виставити КП.'},
        {n:'Підбір водія та авто',    fn:1,ai:5,dur:20,desc:'Вибрати вільного водія. Перевірити документи і стан авто. Підтвердити готовність.'},
        {n:'Оформлення документів',   fn:3,ai:6,dur:30,desc:'Виписати ТТН або CMR. Договір-заявка. Страхування якщо треба.'},
        {n:'Інструктаж водія',        fn:2,ai:5,dur:20,desc:'Маршрут, контакт клієнта, час завантаження/розвантаження. Особливості вантажу.'},
        {n:'Контроль рейсу',          fn:1,ai:5,dur:0, desc:'Відстеження. Зв\'язок з водієм. Повідомлення клієнту про статус.'},
        {n:'Закриття рейсу',          fn:3,ai:6,dur:20,desc:'Підтвердження доставки. Підписані документи. Закрити рейс в системі.'},
        {n:'Виставлення рахунку',     fn:4,ai:6,dur:15,desc:'Виставити рахунок клієнту протягом доби. Контроль оплати.'},
        {n:'Розрахунок з водієм',     fn:4,ai:6,dur:15,desc:'Розрахувати оплату водія. Провести виплату. Зафіксувати в системі.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Стандарт виконання рейсу',description:'Від заявки клієнта до отримання оплати. 8 кроків.',category:'Основний',status:'active',steps:P1.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});
    await window.safeBatchCommit(ops);ops=[];

    // ФІНАНСИ
    try{for(const col of['finance_transactions','finance_categories','finance_accounts']){const s=await cr.collection(col).get();if(!s.empty){const d=s.docs.map(doc=>({type:'delete',ref:doc.ref}));await window.safeBatchCommit(d);}}}catch(e){}
    const accCard=cr.collection('finance_accounts').doc();
    const accCash=cr.collection('finance_accounts').doc();
    ops.push({type:'set',ref:accCard,data:{name:'ПриватБанк ФОП',type:'card',currency:'UAH',balance:284000,isDefault:true,isDemo:true,createdAt:now}});
    ops.push({type:'set',ref:accCash,data:{name:'Каса',          type:'cash',currency:'UAH',balance:12400, isDefault:false,isDemo:true,createdAt:now}});
    const CAT_I=['Оплата рейсів','Додаткові послуги (навантаження/розвантаження)'];
    const CAT_O=['Паливо','Платні дороги та збори','Зарплата водіїв','Зарплата диспетчера/менеджера','ТО та ремонт авто','Страхування','Офісні витрати'];
    const ciRefs=CAT_I.map(()=>cr.collection('finance_categories').doc());
    const coRefs=CAT_O.map(()=>cr.collection('finance_categories').doc());
    CAT_I.forEach((n,i)=>{ops.push({type:'set',ref:ciRefs[i],data:{name:n,type:'income', isDemo:true,createdAt:now}});});
    CAT_O.forEach((n,i)=>{ops.push({type:'set',ref:coRefs[i],data:{name:n,type:'expense',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    const TXNS=[
        {tp:'income', ci:0,acc:accCard,amt:9500, note:'Рейс RTE-0001 — Київ→Львів (БудМайстер)',           d:-8},
        {tp:'income', ci:0,acc:accCard,amt:14000,note:'Рейс RTE-0002 — Харків→Одеса (АгроТрейд)',          d:-6},
        {tp:'income', ci:0,acc:accCard,amt:7500, note:'Рейс RTE-0003 — Київ→Дніпро (ПП Карго)',            d:-4},
        {tp:'income', ci:0,acc:accCard,amt:11000,note:'Рейс RTE-0004 — Львів→Харків (Укрпромпостач)',      d:-2},
        {tp:'income', ci:0,acc:accCard,amt:28500,note:'Виручка березень — 3 рейси (БудМайстер 3×9500)',   d:-15},
        {tp:'income', ci:0,acc:accCard,amt:42000,note:'Виручка березень — АгроТрейд (3 рейси зернові)',   d:-12},
        {tp:'expense',ci:0,acc:accCard,amt:8680, note:'Паливо — Миколай+Сергій+Андрій (квітень, ч.1)',   d:-10},
        {tp:'expense',ci:1,acc:accCard,amt:3140, note:'Платні дороги — всі водії (квітень)',              d:-8},
        {tp:'expense',ci:2,acc:accCash,amt:18800,note:'Зарплата 5 водіїв (березень)',                    d:-28},
        {tp:'expense',ci:3,acc:accCard,amt:22000,note:'Зарплата диспетчер + менеджер (березень)',        d:-28},
        {tp:'expense',ci:4,acc:accCard,amt:12400,note:'ТО авто KA2222CC + AA3333DD (квітень)',           d:-5},
        {tp:'expense',ci:5,acc:accCard,amt:8400, note:'Страхування ОСЦПВ 5 авто (квітал)',              d:-20},
        {tp:'expense',ci:6,acc:accCash,amt:6800, note:'Оренда офісу + телефонія (квітень)',             d:-1},
        {tp:'expense',ci:2,acc:accCash,amt:18800,note:'Зарплата водіїв (квітень)',                      d:-1},
        {tp:'expense',ci:3,acc:accCard,amt:22000,note:'Зарплата диспетчер+менеджер (квітень)',          d:-1},
    ];
    TXNS.forEach(tx=>{ops.push({type:'set',ref:cr.collection('finance_transactions').doc(),data:{type:tx.tp,categoryId:(tx.tp==='income'?ciRefs:coRefs)[tx.ci].id,categoryName:(tx.tp==='income'?CAT_I:CAT_O)[tx.ci],accountId:tx.acc.id,amount:tx.amt,note:tx.note,date:dDate(tx.d),createdAt:dTs(tx.d),isDemo:true}});});
    await window.safeBatchCommit(ops);ops=[];

    const KPI=[
        {name:'Виручка тижнева',          unit:'₴', target:55000,vals:[38400,42000,45600,48200,51000,47800,53400]},
        {name:'Кількість рейсів за тиждень',unit:'шт',target:6,  vals:[4,4,5,5,6,5,6]},
        {name:'Середній тариф рейсу',     unit:'₴', target:10000,vals:[8200,8900,9100,9600,10200,9800,10400]},
        {name:'Рентабельність рейсів',    unit:'%', target:35,   vals:[28,30,31,33,35,32,36]},
        {name:'Відсоток вчасних доставок',unit:'%', target:95,   vals:[88,91,90,93,94,92,96]},
    ];
    KPI.forEach(k=>{ops.push({type:'set',ref:cr.collection('kpi_metrics').doc(),data:{name:k.name,unit:k.unit,target:k.target,values:k.vals.map((v,i)=>({value:v,date:dDate(-42+i*7)})),currentValue:k.vals[k.vals.length-1],trend:k.vals[k.vals.length-1]>k.vals[k.vals.length-2]?'up':'down',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    await cr.update({name:'Логіст Про',niche:'logistics',nicheLabel:'Логістика — вантажні перевезення',description:'Транспортна компанія Логіст Про — вантажні перевезення по Україні. 5 водіїв, 5 авто (до 20т), комп\'ютерна диспетчеризація. Київ, вул. Складська 22.',city:'Київ',employees:7,currency:'UAH',avgCheck:10571,monthlyRevenue:228000,companyGoal:'6+ рейсів на тиждень, рентабельність 35%+, 3+ постійних клієнти з контрактами',companyConcept:'Водій знає маршрут до виїзду. Клієнт отримує підтвердження. Власник бачить рентабельність кожного напрямку.',targetAudience:'Торгові компанії, виробники, дистриб\'ютори з регулярними потребами перевезення 3-20т.',modules:{scheduling:false,clientProfile:true,loyalty:false,subscriptions:false,reviews:false,winback:true,notifications:true,estimates:false,warehouse:false,booking:false,sales:true},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
};
if (window._NICHE_LABELS) window._NICHE_LABELS['logistics'] = 'Логіст Про — Вантажні перевезення (Київ)';

// ════════════════════════════════════════════════════════════════════════════
// ХАРЧОВЕ ВИРОБНИЦТВО — КухняПро
// ════════════════════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['food_production'] = async function() {
    if (!window.currentCompanyId || !window.db) throw new Error('No company');
    const cr = window.db.collection('companies').doc(window.currentCompanyId);
    const uid = window.currentUser?.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    function dDate(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);}
    function dTs(d){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+d*86400000));}
    let ops=[];

    const FUNCS=[
        {name:'0. Маркетинг та продажі',  color:'#ec4899',desc:'Пошук клієнтів, прайс, переговори, контракти'},
        {name:'1. Прийом замовлень',       color:'#22c55e',desc:'Обробка замовлень, узгодження меню, підтвердження'},
        {name:'2. Виробництво / Кухня',   color:'#f97316',desc:'Приготування страв за рецептурами, якість, норми'},
        {name:'3. Склад та закупівлі',    color:'#6366f1',desc:'Сировина, залишки, замовлення, постачальники'},
        {name:'4. Відвантаження',         color:'#0ea5e9',desc:'Пакування, документи, доставка клієнтам'},
        {name:'5. Фінанси та облік',      color:'#10b981',desc:'Собівартість, рентабельність, рахунки, P&L'},
        {name:'6. Команда',              color:'#8b5cf6',desc:'Кухарі, технолог, графік, санітарні норми'},
        {name:'7. Управління та розвиток',color:'#f59e0b',desc:'Нові страви, рецептури, масштабування, HACCP'},
    ];
    const fRefs=FUNCS.map(()=>cr.collection('functions').doc());
    FUNCS.forEach((f,i)=>{ops.push({type:'set',ref:fRefs[i],data:{name:f.name,color:f.color,description:f.desc,order:i,status:'active',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    try{const o=await cr.collection('users').get();if(!o.empty){const d=[];o.docs.forEach(doc=>{if(doc.id!==uid)d.push({type:'delete',ref:cr.collection('users').doc(doc.id)});});if(d.length)await window.safeBatchCommit(d);}}catch(e){}
    const STAFF=[
        {name:'Галина Пономаренко', role:'Шеф-кухар / Технолог',   fn:2,email:'ponomarenko@kukhnya.ua',phone:'+380671140001'},
        {name:'Оксана Ковальчук',   role:'Кухар (перші страви)',    fn:2,email:'kovalchuk@kukhnya.ua',  phone:'+380671140002'},
        {name:'Микола Сердюк',      role:'Кухар (другі страви)',    fn:2,email:'serdyuk@kukhnya.ua',    phone:'+380671140003'},
        {name:'Ірина Білоус',       role:'Пекар / Кондитер',        fn:2,email:'bilous@kukhnya.ua',     phone:'+380671140004'},
        {name:'Тетяна Власенко',    role:'Менеджер замовлень',      fn:1,email:'vlasenko@kukhnya.ua',   phone:'+380671140005'},
        {name:'Сергій Ткаченко',    role:'Водій / Комірник',        fn:4,email:'tkachenko@kukhnya.ua',  phone:'+380671140006'},
    ];
    const sRefs=STAFF.map(()=>cr.collection('staff').doc());
    const uRefs=STAFF.map(()=>cr.collection('users').doc());
    STAFF.forEach((s,i)=>{
        ops.push({type:'set',ref:sRefs[i],data:{name:s.name,role:s.role,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,phone:s.phone,isActive:true,isDemo:true,createdAt:now}});
        ops.push({type:'set',ref:uRefs[i],data:{name:s.name,email:s.email,role:'employee',functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,staffId:sRefs[i].id,isDemo:true,createdAt:now}});
    });
    FUNCS.forEach((f,i)=>{const oi=STAFF.findIndex(s=>s.fn===i);if(oi>=0)ops.push({type:'update',ref:fRefs[i],data:{ownerId:sRefs[oi].id,ownerName:STAFF[oi].name}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM КЛІЄНТИ — оптові покупці
    const CLIENTS=[
        {name:'ТОВ Кейтеринг Плюс',     phone:'+380441141001',email:'catering@plus.ua',  notes:'Щотижневі замовлення: борщ 60 порц., котлети 40 порц. Оплата 3 дні.',spent:74400,d:-3},
        {name:'Мережа кафе "СмакО"',    phone:'+380441141002',email:'smako@cafe.ua',      notes:'5 точок, кожна по 30 порц. Разом 150 порц/тиждень. Великий клієнт!',spent:182000,d:-1},
        {name:'Лікарня №3 (їдальня)',   phone:'+380441141003',email:'likarn@hosp.ua',     notes:'Держзамовлення. Дієтичне харчування. Платить місяць-в-місяць.',spent:96000,d:-7},
        {name:'Дитячий садок №48',      phone:'+380441141004',email:'sadok@dz.ua',        notes:'Сніданки для 120 дітей. Спец. меню (без гострого, без горіхів).',spent:48000,d:-5},
        {name:'Офіс-центр TechHub',     phone:'+380441141005',email:'info@techhub.ua',    notes:'Бізнес-ланчі 80 осіб щодня. Преміальний клієнт, платить вчасно.',spent:128000,d:-2},
        {name:'ФОП Марченко (магазин)', phone:'+380441141006',email:'march@shop.ua',      notes:'Готова продукція в роздріб: хліб, випічка, десерти. 3×/тиждень.',spent:32000,d:-4},
    ];
    const cRefs=CLIENTS.map(()=>cr.collection('crm_clients').doc());
    CLIENTS.forEach((c,i)=>{ops.push({type:'set',ref:cRefs[i],data:{name:c.name,phone:c.phone,email:c.email,source:'direct',status:'active',notes:c.notes,totalSpent:c.spent,lastOrderDate:dDate(c.d),isDemo:true,createdAt:dTs(c.d-30)}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM УГОДИ
    const DEALS=[
        {t:'Мережа "СмакО" — розширення до 7 точок (+2 нові, +80 порц./тиждень)',c:1,amt:52000,stage:'consultation',ai:4,d:-5},
        {t:'Школа №145 — харчування учнів (380 обідів/день, вересень-травень)',  c:2,amt:285000,stage:'new',        ai:4,d:-2},
        {t:'Корпорація KPI Group — щоденні бізнес-ланчі 50 осіб',               c:4,amt:48000, stage:'consultation',ai:4,d:-3},
    ];
    DEALS.forEach(d=>{ops.push({type:'set',ref:cr.collection('crm_deals').doc(),data:{title:d.t,clientId:cRefs[d.c].id,clientName:CLIENTS[d.c].name,phone:CLIENTS[d.c].phone,amount:d.amt,stage:d.stage,assigneeId:sRefs[d.ai].id,assigneeName:STAFF[d.ai].name,source:'phone',isDemo:true,createdAt:dTs(d.d)}});});
    await window.safeBatchCommit(ops);ops=[];

    // СКЛАД СИРОВИНИ
    const INGR=[
        {name:'Борошно пшеничне в/с (25кг)',qty:12, unit:'меш',price:680,  cat:'Бакалія',  min:4},
        {name:'Цукор (50кг)',                qty:6,  unit:'меш',price:1600, cat:'Бакалія',  min:2},
        {name:'Сіль кухонна',                qty:18, unit:'кг', price:8,    cat:'Бакалія',  min:5},
        {name:'Олія соняшникова рафін.',      qty:48, unit:'л',  price:65,   cat:'Бакалія',  min:15},
        {name:'Масло вершкове 82.5%',         qty:24, unit:'кг', price:280,  cat:'Молочні',  min:8},
        {name:'Яйця С1 (лоток 30 шт)',        qty:40, unit:'лот',price:195,  cat:'Молочні',  min:15},
        {name:'Молоко 3.2% (1л)',             qty:120,unit:'л',  price:32,   cat:'Молочні',  min:40},
        {name:'Сметана 20%',                  qty:32, unit:'кг', price:95,   cat:'Молочні',  min:10},
        {name:'Картопля (мішок 25кг)',        qty:8,  unit:'меш',price:300,  cat:'Овочі',    min:3},
        {name:'Буряк (кг)',                   qty:85, unit:'кг', price:14,   cat:'Овочі',    min:25},
        {name:'Морква (кг)',                  qty:62, unit:'кг', price:16,   cat:'Овочі',    min:20},
        {name:'Капуста білокачанна',          qty:48, unit:'кг', price:10,   cat:'Овочі',    min:15},
        {name:'Цибуля ріпчаста',              qty:38, unit:'кг', price:18,   cat:'Овочі',    min:12},
        {name:'М\'ясо свинина (лопатка)',     qty:68, unit:'кг', price:185,  cat:'М\'ясо',   min:20},
        {name:'М\'ясо яловичина (лопатка)',   qty:32, unit:'кг', price:220,  cat:'М\'ясо',   min:10},
        {name:'Курятина грудка',              qty:52, unit:'кг', price:130,  cat:'М\'ясо',   min:15},
        {name:'Риба (тилапія заморож.)',       qty:24, unit:'кг', price:165,  cat:'Риба',     min:8},
        {name:'Какао-порошок',                qty:12, unit:'кг', price:380,  cat:'Кондит.',  min:3},
        {name:'Шоколад чорний 70%',           qty:16, unit:'кг', price:480,  cat:'Кондит.',  min:4},
        {name:'Дріжджі сухі (500г)',          qty:20, unit:'упак',price:110, cat:'Бакалія',  min:6},
        {name:'Ванільний цукор',              qty:8,  unit:'кг', price:260,  cat:'Кондит.',  min:2},
        {name:'Розпушувач для тіста',         qty:6,  unit:'кг', price:180,  cat:'Кондит.',  min:2},
    ];
    const iRefs=INGR.map(()=>cr.collection('warehouse_items').doc());
    INGR.forEach((it,i)=>{ops.push({type:'set',ref:iRefs[i],data:{name:it.name,quantity:it.qty,price:it.price,unit:it.unit,category:it.cat,minQuantity:it.min,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // КАТАЛОГ (готова продукція для продажу)
    const PRODUCTS=[
        {name:'Борщ класичний (порція)',      price:95,  unit:'порція',cat:'Перші страви'},
        {name:'Суп курячий (порція)',          price:80,  unit:'порція',cat:'Перші страви'},
        {name:'Котлета по-домашньому',        price:75,  unit:'порція',cat:'Другі страви'},
        {name:'Риба запечена',                price:95,  unit:'порція',cat:'Другі страви'},
        {name:'Тефтелі в соусі',             price:70,  unit:'порція',cat:'Другі страви'},
        {name:'Вареники з картоплею (6 шт)', price:65,  unit:'порція',cat:'Другі страви'},
        {name:'Пюре картопляне (порція)',     price:35,  unit:'порція',cat:'Гарніри'},
        {name:'Рис відварний (порція)',       price:30,  unit:'порція',cat:'Гарніри'},
        {name:'Шоколадний брауні (порція)',   price:85,  unit:'порція',cat:'Десерти'},
        {name:'Тірамісу домашнє',            price:90,  unit:'порція',cat:'Десерти'},
        {name:'Хліб пшеничний (буханка 700г)',price:45, unit:'шт',    cat:'Хліб'},
        {name:'Хліб житній (буханка 600г)',  price:50,  unit:'шт',    cat:'Хліб'},
        {name:'Пиріг з яблуками (1 кг)',     price:120, unit:'шт',    cat:'Випічка'},
        {name:'Круасани (упаковка 6 шт)',     price:85,  unit:'упак',  cat:'Випічка'},
        {name:'Бізнес-ланч (комплекс)',       price:135, unit:'компл', cat:'Бізнес-ланч'},
    ];
    const pRefs=PRODUCTS.map(()=>cr.collection('sales_products').doc());
    PRODUCTS.forEach((p,i)=>{ops.push({type:'set',ref:pRefs[i],data:{name:p.name,price:p.price,unit:p.unit,category:p.cat,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // РЕЦЕПТУРИ
    const yr=new Date().getFullYear();
    function calcCost(ingrs,portions){
        let total=0;
        ingrs.forEach(i=>{let q=i.qty;if(i.unit==='г'||i.unit==='мл')q/=1000;i.cost=Math.round(q*(i.price||0)*100)/100;total+=i.cost;});
        return{totalCost:Math.round(total*100)/100,costPerPortion:Math.round(total/portions*100)/100};
    }
    const RECIPES=[
        {name:'Борщ класичний',cat:'Перші страви',yield:10000,portions:100,salePrice:95,
         tech:'1. Зварити м\'ясний бульйон (свинина 1.5 год). 2. Буряк: нарізати соломкою, тушкувати з олією і оцтом 15 хв. 3. Морква+цибуля: пасерувати 10 хв. 4. Картоплю додати в бульйон, 10 хв. 5. Капусту — 5 хв до готовності. 6. Засмажку і буряк — 5 хв. Сметана при подачі.',
         ingrs:[
            {name:'Свинина',qty:1500,unit:'г',price:0.185,wI:13},
            {name:'Буряк',  qty:3000,unit:'г',price:0.014,wI:9},
            {name:'Картопля',qty:2500,unit:'г',price:0.012,wI:8},
            {name:'Морква', qty:800, unit:'г',price:0.016,wI:10},
            {name:'Капуста',qty:2000,unit:'г',price:0.010,wI:11},
            {name:'Цибуля', qty:600, unit:'г',price:0.018,wI:12},
            {name:'Олія',   qty:300, unit:'мл',price:0.065,wI:3},
            {name:'Сіль',   qty:80,  unit:'г',price:0.008,wI:2},
        ]},
        {name:'Котлета по-домашньому',cat:'Другі страви',yield:100,portions:1,salePrice:75,
         tech:'1. Фарш (свинина+яловичина) змішати з цибулею, яйцем, сіллю. Вимісити 5 хв. 2. Сформувати котлети 100г. 3. Обваляти в панірувальних сухарях. 4. Смажити на олії 4 хв з кожного боку. 5. Довести до готовності в духовці 180°C, 10 хв.',
         ingrs:[
            {name:'Свинина',qty:60, unit:'г',price:0.185,wI:13},
            {name:'Яловичина',qty:60,unit:'г',price:0.220,wI:14},
            {name:'Яйце',   qty:0.5,unit:'шт',price:6.5, wI:5},
            {name:'Цибуля', qty:15, unit:'г',price:0.018,wI:12},
            {name:'Сіль',   qty:2,  unit:'г',price:0.008,wI:2},
            {name:'Олія',   qty:15, unit:'мл',price:0.065,wI:3},
        ]},
        {name:'Шоколадний брауні',cat:'Десерти',yield:600,portions:12,salePrice:85,
         tech:'1. Шоколад + масло розтопити на водяній бані. 2. Яйця збити з цукром до піни. 3. Додати шоколадну суміш, какао, борошно. 4. Вилити у форму 20×20 см. 5. Випікати 25 хв при 175°C. 6. Охолодити, нарізати порціями.',
         ingrs:[
            {name:'Шоколад чорний',qty:200,unit:'г',price:0.480,wI:18},
            {name:'Масло вершкове',qty:150,unit:'г',price:0.280,wI:4},
            {name:'Яйця',qty:4,unit:'шт',price:6.5,wI:5},
            {name:'Цукор',qty:150,unit:'г',price:0.032,wI:1},
            {name:'Борошно',qty:80,unit:'г',price:0.027,wI:0},
            {name:'Какао',qty:30,unit:'г',price:0.380,wI:17},
        ]},
        {name:'Хліб пшеничний',cat:'Хліб',yield:700,portions:1,salePrice:45,
         tech:'1. Дріжджі розвести в теплій воді (35°C). 2. Борошно + сіль + олія + дріжджова суміш — замісити тісто 10 хв. 3. Підходити 60 хв при 28°C. 4. Обім\'яти, сформувати буханку. 5. Вистоювання 30 хв. 6. Випікати 35 хв при 200°C.',
         ingrs:[
            {name:'Борошно',qty:500,unit:'г',price:0.027,wI:0},
            {name:'Дріжджі',qty:7,  unit:'г',price:0.220,wI:19},
            {name:'Сіль',   qty:10, unit:'г',price:0.008,wI:2},
            {name:'Олія',   qty:20, unit:'мл',price:0.065,wI:3},
        ]},
        {name:'Бізнес-ланч (комплекс)',cat:'Бізнес-ланч',yield:500,portions:1,salePrice:135,
         tech:'Комплекс: перша страва (250 мл борщу) + друга страва (котлета 100г + гарнір 150г) + хліб 50г + напій (компот/чай). Зборка і упаковка на лінії.',
         ingrs:[
            {name:'Борщ готовий',qty:250,unit:'г',price:0.0482,wI:9},
            {name:'Котлета',qty:100,unit:'г',price:0.380,wI:13},
            {name:'Картопля',qty:150,unit:'г',price:0.012,wI:8},
            {name:'Хліб',qty:50,unit:'г',price:0.064,wI:0},
            {name:'Олія для картоплі',qty:10,unit:'мл',price:0.065,wI:3},
        ]},
    ];
    const recipeRefs=RECIPES.map(()=>cr.collection('fp_recipes').doc());
    RECIPES.forEach((r,i)=>{
        const ingrs=r.ingrs.map(ing=>({name:ing.name,grossQty:ing.qty,netQty:Math.round(ing.qty*0.9),unit:ing.unit,pricePerUnit:ing.price,cost:0,warehouseItemId:ing.wI>=0?iRefs[ing.wI].id:''}));
        const{totalCost,costPerPortion}=calcCost(ingrs,r.portions);
        const margin=r.salePrice>0?Math.round((r.salePrice-costPerPortion)/r.salePrice*100):null;
        ops.push({type:'set',ref:recipeRefs[i],data:{name:r.name,category:r.cat,yield:r.yield,portions:r.portions,salePrice:r.salePrice,technology:r.tech,ingredients:ingrs,totalCost,costPerPortion,margin,isDemo:true,createdAt:now}});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ПЛАН ВИРОБНИЦТВА (сьогодні)
    const today=new Date().toISOString().slice(0,10);
    const PLAN=[
        {rI:0,portions:100,status:'planned',   note:'Борщ для Кейтеринг Плюс (60) + СмакО (40)'},
        {rI:4,portions:80, status:'planned',   note:'Бізнес-ланч для ТехХаб (80 комплектів до 11:30)'},
        {rI:2,portions:48, status:'in_progress',note:'Брауні — форм 4×12 порц. (замовлення магазин+кафе)'},
        {rI:3,portions:30, status:'in_progress',note:'Хліб пшеничний — 30 буханок (розвезення о 07:30)'},
        {rI:1,portions:50, status:'done',       note:'Котлети — 50 порц. для лікарні (доставлено о 09:00)'},
    ];
    PLAN.forEach(p=>{ops.push({type:'set',ref:cr.collection('fp_production_plan').doc(),data:{recipeId:recipeRefs[p.rI].id,recipeName:RECIPES[p.rI].name,portions:p.portions,date:today,status:p.status,notes:p.note,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ВІДВАНТАЖЕННЯ (рахунки)
    const INVOICES=[
        {c:0,items:[{p:0,q:60},{p:2,q:20}], method:'transfer',status:'paid',   d:-7,  note:'Тижневе замовлення Кейтеринг Плюс'},
        {c:1,items:[{p:0,q:150},{p:6,q:80},{p:7,q:80}],method:'transfer',status:'paid',d:-5,note:'СмакО — 5 точок, тижневе замовлення'},
        {c:4,items:[{p:14,q:80}],           method:'transfer',status:'paid',   d:-3,  note:'TechHub — бізнес-ланчі 80 осіб'},
        {c:2,items:[{p:0,q:200},{p:2,q:150},{p:6,q:200}],method:'transfer',status:'sent',d:-1,note:'Лікарня №3 — тижневе замовлення'},
        {c:5,items:[{p:10,q:25},{p:12,q:10},{p:13,q:15}],method:'cash',status:'paid',d:-2,note:'Магазин Марченко — хліб і випічка'},
    ];
    INVOICES.forEach((inv,i)=>{
        const c=CLIENTS[inv.c];
        const items=inv.items.map(it=>{const p=PRODUCTS[it.p];return{id:'p'+it.p,name:p.name,qty:it.q,unit:p.unit,price:p.price,discount:0,total:p.price*it.q};});
        const total=items.reduce((s,x)=>s+x.total,0);
        const isPaid=inv.status==='paid';
        ops.push({type:'set',ref:cr.collection('sales_orders').doc(),data:{type:'invoice',number:`INV-${yr}-${String(i+1).padStart(4,'0')}`,status:inv.status,clientId:cRefs[inv.c].id,clientName:c.name,clientPhone:c.phone,date:dDate(inv.d),items,subtotal:total,discountTotal:0,total,paymentMethod:inv.method,paymentStatus:isPaid?'paid':'unpaid',paidAmount:isPaid?total:0,notes:inv.note,isDemo:true,createdAt:dTs(inv.d),updatedAt:now}});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ЗАВДАННЯ
    const TASKS=[
        {t:'Зготовити 100 порцій борщу до 10:30 (Кейтеринг Плюс 60 + СмакО 40)',   fi:2,ai:1,st:'in_progress',pr:'high',  d:0,tm:'07:00',est:90, r:'100 порцій у контейнерах, готові до відвантаження'},
        {t:'Бізнес-ланч TechHub 80 компл. — зборка лінія до 11:30',                 fi:2,ai:2,st:'in_progress',pr:'high',  d:0,tm:'09:00',est:150,r:'80 комплектів упаковані, маркіровані, передані водію'},
        {t:'Хліб 30 буханок — розвезення о 07:30 (магазин Марченко)',               fi:4,ai:5,st:'done',       pr:'high',  d:0,tm:'07:00',est:60, r:'Хліб доставлено, накладна підписана'},
        {t:'Замовити борошно — залишок 12 мішків, потрібно 20 (виробництво тижень)',fi:3,ai:4,st:'new',        pr:'high',  d:0,tm:'08:00',est:20, r:'Замовлення відправлено, дата доставки підтверджена'},
        {t:'Перевірити холодильники — температурний журнал HACCP (щодня)',          fi:6,ai:0,st:'new',        pr:'high',  d:0,tm:'07:00',est:15, r:'Температури записані: м\'ясо +2°C, молочні +4°C'},
        {t:'Виставити рахунок лікарні №3 (тижневе, ~14 000 грн)',                   fi:5,ai:4,st:'new',        pr:'high',  d:0,tm:'09:00',est:15, r:'Рахунок виставлений і відправлений email'},
        {t:'Переговори з Школою №145 — харчування учнів (бюджетний контракт)',       fi:0,ai:4,st:'new',        pr:'high',  d:2,tm:'10:00',est:120,r:'Договір підписаний або наступний крок визначений'},
        {t:'Оновити технологічну карту на котлети — нові норми МОЗ від квітня',      fi:7,ai:0,st:'new',        pr:'medium',d:3,tm:'14:00',est:90, r:'Картка оновлена, підписана технологом, зберігається'},
        {t:'Брауні — тестова партія з лісовими горіхами (запит СмакО)',             fi:2,ai:3,st:'new',        pr:'low',   d:4,tm:'15:00',est:120,r:'Тест-партія 12 порц., фото, зразки до СмакО'},
        {t:'Санітарна обробка цеху (щоп\'ятниці) — дезінфекція HACCP',            fi:6,ai:0,st:'new',        pr:'medium',d:4,tm:'17:00',est:90, r:'Акт дезінфекції підписаний, журнал оновлено'},
        {t:'Звіт рентабельності по стравах за квітень',                             fi:5,ai:4,st:'new',        pr:'medium',d:1,tm:'17:00',est:60, r:'Таблиця: борщ 95% маржа, брауні 63%, хліб 42%'},
        {t:'ФОП Іванченко (магазин) — збільшити обсяг хліба з 15 до 25 буханок',   fi:0,ai:4,st:'overdue',   pr:'medium',d:-2,tm:'11:00',est:20, r:'Домовились + оновили договір'},
    ];
    TASKS.forEach(tk=>{ops.push({type:'set',ref:cr.collection('tasks').doc(),data:{title:tk.t,functionName:FUNCS[tk.fi].name,functionId:fRefs[tk.fi].id,assigneeId:sRefs[tk.ai].id,assigneeName:STAFF[tk.ai].name,status:tk.st,priority:tk.pr,deadlineDate:dDate(tk.d),scheduledTime:tk.tm,estimatedMinutes:tk.est,expectedResult:tk.r,isDemo:true,createdAt:now,updatedAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ПРОЦЕСИ
    const P1=[
        {n:'Отримання замовлення',    fn:1,ai:4,dur:20,desc:'Прийняти замовлення від клієнта. Перевірити наявність по рецептурах і складу. Підтвердити дату і обсяг.'},
        {n:'Перевірка стоп-листа',    fn:3,ai:4,dur:15,desc:'Перевірити чи вистачає всіх інгредієнтів. Якщо є нестача — замовити терміново або повідомити клієнта.'},
        {n:'Постановка у план',       fn:2,ai:0,dur:10,desc:'Додати позиції в план виробництва на потрібну дату. Призначити кухарів.'},
        {n:'Закупівля якщо потрібно', fn:3,ai:4,dur:30,desc:'Замовити відсутні інгредієнти. Отримати і оприбуткувати на склад.'},
        {n:'Виробництво',             fn:2,ai:1,dur:180,desc:'Приготування за рецептурою. Дотримання температурних режимів. Фото контроль якості.'},
        {n:'Пакування та маркування', fn:4,ai:5,dur:30,desc:'Розфасувати порції. Нанести маркування: дата, склад, кількість. Підготувати супровідні документи.'},
        {n:'Відвантаження',           fn:4,ai:5,dur:30,desc:'Завантажити авто. Підписати накладну. Доставка клієнту до обумовленого часу.'},
        {n:'Виставлення рахунку',     fn:5,ai:4,dur:15,desc:'Виставити рахунок протягом доби. Контроль оплати у термін.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Виробництво та відвантаження',description:'Від замовлення клієнта до доставки і оплати. 8 кроків.',category:'Основний',status:'active',steps:P1.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});
    await window.safeBatchCommit(ops);ops=[];

    // ФІНАНСИ
    try{for(const col of['finance_transactions','finance_categories','finance_accounts']){const s=await cr.collection(col).get();if(!s.empty){const d=s.docs.map(doc=>({type:'delete',ref:doc.ref}));await window.safeBatchCommit(d);}}}catch(e){}
    const accCard=cr.collection('finance_accounts').doc();
    const accCash=cr.collection('finance_accounts').doc();
    ops.push({type:'set',ref:accCard,data:{name:'ПриватБанк ФОП',type:'card',currency:'UAH',balance:184000,isDefault:true, isDemo:true,createdAt:now}});
    ops.push({type:'set',ref:accCash,data:{name:'Каса',          type:'cash',currency:'UAH',balance:8400, isDefault:false,isDemo:true,createdAt:now}});
    const CAT_I=['Оплата замовлень (оптові клієнти)','Роздрібні продажі'];
    const CAT_O=['Сировина та інгредієнти','Оренда цеху','Зарплата виробничого персоналу','Пакувальні матеріали','Комунальні послуги','Реклама та маркетинг'];
    const ciRefs=CAT_I.map(()=>cr.collection('finance_categories').doc());
    const coRefs=CAT_O.map(()=>cr.collection('finance_categories').doc());
    CAT_I.forEach((n,i)=>{ops.push({type:'set',ref:ciRefs[i],data:{name:n,type:'income', isDemo:true,createdAt:now}});});
    CAT_O.forEach((n,i)=>{ops.push({type:'set',ref:coRefs[i],data:{name:n,type:'expense',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    const TXNS=[
        {tp:'income', ci:0,acc:accCard,amt:16050,note:'Кейтеринг Плюс — тижн. замовлення (борщ 60 + котлети 20)',d:-7},
        {tp:'income', ci:0,acc:accCard,amt:34800,note:'СмакО — 5 точок, тижневе (150 борщів + гарніри)',         d:-5},
        {tp:'income', ci:0,acc:accCard,amt:10800,note:'TechHub — бізнес-ланчі 80 осіб',                          d:-3},
        {tp:'income', ci:1,acc:accCash,amt:4200, note:'Магазин Марченко — хліб+випічка (тиждень)',               d:-2},
        {tp:'income', ci:0,acc:accCard,amt:72000,note:'Лікарня №3 — харчування місяць (березень)',               d:-20},
        {tp:'income', ci:0,acc:accCard,amt:48000,note:'Дитсадок №48 — харчування місяць (березень)',             d:-18},
        {tp:'income', ci:0,acc:accCard,amt:38400,note:'СмакО — квітень 1-й тиждень (4 замовлення)',              d:-8},
        {tp:'expense',ci:0,acc:accCard,amt:32400,note:'Закупівля сировини — ринок+постачальники (квітень)',      d:-5},
        {tp:'expense',ci:1,acc:accCash,amt:18000,note:'Оренда виробничого цеху 120м² (квітень)',                 d:-1},
        {tp:'expense',ci:2,acc:accCard,amt:38000,note:'Зарплата 6 працівників (березень)',                      d:-28},
        {tp:'expense',ci:3,acc:accCard,amt:4800, note:'Контейнери, фольга, пакети (квітень)',                   d:-3},
        {tp:'expense',ci:4,acc:accCash,amt:8400, note:'Газ + електрика + вода (квітень)',                       d:-1},
        {tp:'expense',ci:0,acc:accCard,amt:30800,note:'Закупівля сировини (березень)',                          d:-20},
        {tp:'expense',ci:1,acc:accCash,amt:18000,note:'Оренда цеху (березень)',                                 d:-28},
        {tp:'expense',ci:2,acc:accCard,amt:38000,note:'Зарплата (квітень)',                                     d:-1},
    ];
    TXNS.forEach(tx=>{ops.push({type:'set',ref:cr.collection('finance_transactions').doc(),data:{type:tx.tp,categoryId:(tx.tp==='income'?ciRefs:coRefs)[tx.ci].id,categoryName:(tx.tp==='income'?CAT_I:CAT_O)[tx.ci],accountId:tx.acc.id,amount:tx.amt,note:tx.note,date:dDate(tx.d),createdAt:dTs(tx.d),isDemo:true}});});
    await window.safeBatchCommit(ops);ops=[];

    const KPI=[
        {name:'Виручка тижнева',              unit:'₴',  target:48000,vals:[32400,36800,40200,43600,45800,42400,46200]},
        {name:'Кількість порцій за тиждень',  unit:'шт', target:1500, vals:[980,1120,1240,1360,1480,1380,1520]},
        {name:'Середня маржа по стравах',     unit:'%',  target:65,   vals:[58,61,63,64,67,65,68]},
        {name:'Відсоток вчасних відвантажень',unit:'%',  target:98,   vals:[92,94,95,96,97,95,98]},
        {name:'Активних клієнтів',            unit:'шт', target:8,    vals:[4,4,5,5,6,6,6]},
    ];
    KPI.forEach(k=>{ops.push({type:'set',ref:cr.collection('kpi_metrics').doc(),data:{name:k.name,unit:k.unit,target:k.target,values:k.vals.map((v,i)=>({value:v,date:dDate(-42+i*7)})),currentValue:k.vals[k.vals.length-1],trend:k.vals[k.vals.length-1]>k.vals[k.vals.length-2]?'up':'down',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    await cr.update({name:'КухняПро — Фабрика-кухня',niche:'food_production',nicheLabel:'Харчове виробництво — фабрика-кухня',description:'Виробництво готових страв для корпоративних клієнтів. 6 співробітників, цех 120м², HACCP. Київ, вул. Харчова 12.',city:'Київ',employees:6,currency:'UAH',avgCheck:28000,monthlyRevenue:185000,companyGoal:'8+ постійних клієнтів, 2 000 порцій/тиждень, HACCP сертифікація',companyConcept:'Борщ як вдома — для 1000 чоловік. Технологічна карта = стабільний смак щодня.',targetAudience:'Кейтеринг-компанії, корпоративні їдальні, лікарні, дитсадки, мережі кафе.',modules:{scheduling:false,clientProfile:true,loyalty:false,subscriptions:false,reviews:false,winback:true,notifications:true,estimates:false,warehouse:true,booking:false,sales:true},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
};
if (window._NICHE_LABELS) window._NICHE_LABELS['food_production'] = 'КухняПро — Харчове виробництво (Київ)';
