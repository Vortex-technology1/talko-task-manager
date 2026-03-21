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
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color,
        order: i,
        ownerId: uid,        // власник компанії як тимчасовий власник
        ownerName: 'Олексій Мороз',
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
        { t:'Щотижневий звіт продажів',              type:'weekly', dow:5, fi:1, ai:1, tm:'17:00' },
        { t:'Планова нарада виробництва',            type:'weekly', dow:1, fi:3, ai:3, tm:'08:30' },
        { t:'Перевірка залишків матеріалів на складі',type:'weekly', dow:1, fi:5, ai:7, tm:'09:00' },
        { t:'Фінансовий звіт за тиждень',            type:'weekly', dow:5, fi:5, ai:7, tm:'16:00' },
        { t:'Обдзвін клієнтів — статус замовлень',   type:'weekly', dow:3, fi:1, ai:2, tm:'14:00' },
        { t:'ТО верстатів та обладнання',            type:'monthly',dom:1, fi:3, ai:3, tm:'08:00' },
        { t:'Аналіз NPS та відгуків клієнтів',       type:'monthly',dom:5, fi:1, ai:1, tm:'11:00' },
        { t:'Звірка бухгалтерії та виплата зарплати',type:'monthly',dom:25,fi:5, ai:7, tm:'10:00' },
        { t:'Публікація кейсів у соціальних мережах',type:'weekly', dow:4, fi:0, ai:5, tm:'12:00' },
        { t:'Щоденний stand-up 5хв',                 type:'daily',       fi:7, ai:0, tm:'08:00' },
    ];
    for (const r of REGS) {
        ops.push({type:'set', ref:cr.collection('regularTasks').doc(), data:{
            title:r.t, type:r.type,
            dayOfWeek:r.dow||null, dayOfMonth:r.dom||null,
            time:r.tm,
            functionId:fRefs[r.fi].id, functionName:FUNCS[r.fi].name,
            assigneeId:sRefs[r.ai].id, assigneeName:STAFF[r.ai].name,
            creatorId:uid, status:'active', requireReview:false, createdAt:now,
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
        ops.push({type:'set', ref:cr.collection('processes').doc(), data:{
            templateId:p.tpl.id,
            name:p.name, currentStep:p.step, status:'active',
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            startDate:_demoDate(-7), deadline:_demoDate(21),
            createdBy:uid, createdAt:now, updatedAt:now,
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

    // ── 7. CRM PIPELINE + УГОДИ ────────────────────────────
    const pipRef = cr.collection('crm_pipelines').doc();
    ops.push({type:'set', ref:pipRef, data:{
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
    }});

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
    for (const d of DEALS) {
        ops.push({type:'set', ref:cr.collection('crm_deals').doc(), data:{
            pipelineId:pipRef.id,
            title:d.name, clientName:d.client, phone:d.phone,
            source:d.src, stage:d.stage, amount:d.amt,
            note:d.note,
            nextContactDate: d.nc !== null ? _demoDate(d.nc) : null,
            assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
            createdAt:_demoTs(-[1,2,3,5,7,10,14,21][Math.floor(Math.random()*8)]),
            updatedAt:now,
        }});
    }

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
    const catRefs = FIN_CATS.map(() => cr.collection('financeCategories').doc());
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
    for (const tx of TXS) {
        ops.push({type:'set', ref:cr.collection('financeTransactions').doc(), data:{
            categoryId:catRefs[tx.ci].id, categoryName:FIN_CATS[tx.ci].name,
            type:tx.type, amount:tx.amt, note:tx.note,
            date:_demoDate(tx.d),
            createdBy:uid, createdAt:now,
        }});
    }

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

    // ── 12. АНАЛІТИКА — метрики по 8 функціях + 18 виробничих чекпоїнтів ──
    // ── МЕТРИКИ — унікальні назви, правильні одиниці, реалістичні значення ──
    // weekly: операційні показники (тижнева динаміка)
    // monthly: фінансові та стратегічні (місячна динаміка)
    // daily: оперативні (щоденний контроль)
    const METRICS = [
        // ── ЩОТИЖНЕВІ (weekly) ─────────────────────────────
        { name:'Нові ліди',               unit:'шт',  cat:'Маркетинг',     trend:12.0, freq:'weekly',  value:8    },
        { name:'Заявки з сайту',          unit:'шт',  cat:'Маркетинг',     trend:20.0, freq:'weekly',  value:4    },
        { name:'Записи на консультацію',  unit:'шт',  cat:'Маркетинг',     trend:15.0, freq:'weekly',  value:6    },
        { name:'Нові замовлення',         unit:'шт',  cat:'Продажі',       trend:8.0,  freq:'weekly',  value:3    },
        { name:'Виручка (тиждень)',       unit:'грн', cat:'Продажі',       trend:10.0, freq:'weekly',  value:72000},
        { name:'Конверсія лід→договір',   unit:'%',   cat:'Продажі',       trend:5.0,  freq:'weekly',  value:38   },
        { name:'Замовлень у виробн.',     unit:'шт',  cat:'Виробництво',   trend:6.0,  freq:'weekly',  value:4    },
        { name:'Відсоток браку',          unit:'%',   cat:'Виробництво',   trend:-8.0, freq:'weekly',  value:2.1  },
        { name:'Виконання плану вир.',    unit:'%',   cat:'Виробництво',   trend:3.0,  freq:'weekly',  value:94   },
        { name:'Доставок виконано',       unit:'шт',  cat:'Доставка',      trend:7.0,  freq:'weekly',  value:4    },
        { name:'Своєчасність доставки',   unit:'%',   cat:'Доставка',      trend:2.0,  freq:'weekly',  value:93   },
        { name:'Виконання задач вчасно',  unit:'%',   cat:'Управління',    trend:6.0,  freq:'weekly',  value:84   },
        { name:'Прострочені задачі',      unit:'шт',  cat:'Управління',    trend:-15.0,freq:'weekly',  value:3    },
        { name:'Дизайн-проєктів',         unit:'шт',  cat:'Підготовка',    trend:5.0,  freq:'weekly',  value:3    },
        { name:'Ліди (вхідні)',           unit:'шт',  cat:'Маркетинг',     trend:10.0, freq:'weekly',  value:8    },
        // ── ЩОДЕННІ (daily) ────────────────────────────────
        { name:'Час відповіді на лід',    unit:'год', cat:'Продажі',       trend:-20.0,freq:'daily',   value:2.5  },
        { name:'NPS клієнтів',            unit:'бали',cat:'Продажі',       trend:4.0,  freq:'daily',   value:72   },
        // ── ЩОМІСЯЧНІ (monthly) ────────────────────────────
        // Маркетинг
        { name:'Охоплення Instagram',     unit:'осіб',cat:'Маркетинг',     trend:15.0, freq:'monthly', value:12400},
        { name:'Вартість ліда (CPL)',      unit:'грн', cat:'Маркетинг',     trend:-10.0,freq:'monthly', value:535  },
        // Продажі
        { name:'Виручка (місяць)',         unit:'грн', cat:'Продажі',       trend:10.0, freq:'monthly', value:287500},
        { name:'Середній чек',            unit:'грн', cat:'Продажі',       trend:3.0,  freq:'monthly', value:23958},
        { name:'Угод у воронці',          unit:'шт',  cat:'Продажі',       trend:5.0,  freq:'monthly', value:9    },
        // Виробництво
        { name:'Замовлень виготовлено',   unit:'шт',  cat:'Виробництво',   trend:6.0,  freq:'monthly', value:18   },
        { name:'Середній час виробн.',    unit:'дні', cat:'Виробництво',   trend:-8.0, freq:'monthly', value:16   },
        { name:'Переробок (зміна замовл)',unit:'шт',  cat:'Виробництво',   trend:-20.0,freq:'monthly', value:3    },
        // Фінанси
        { name:'Чистий прибуток',         unit:'грн', cat:'Фінанси',       trend:9.0,  freq:'monthly', value:58400},
        { name:'Маржинальність',          unit:'%',   cat:'Фінанси',       trend:2.0,  freq:'monthly', value:31.2 },
        { name:'Витрати на матеріали',    unit:'грн', cat:'Фінанси',       trend:5.0,  freq:'monthly', value:52700},
        { name:'Витрати на зарплату',     unit:'грн', cat:'Фінанси',       trend:0.0,  freq:'monthly', value:56000},
        { name:'Дебіторська заборг.',     unit:'грн', cat:'Фінанси',       trend:-5.0, freq:'monthly', value:145000},
        // HR
        { name:'Завантаженість майстрів', unit:'%',   cat:'Люди/HR',       trend:3.0,  freq:'monthly', value:87   },
        { name:'Задоволеність команди',   unit:'бали',cat:'Люди/HR',       trend:1.0,  freq:'monthly', value:7.8  },
        // Управління
        { name:'Завдань виконано',        unit:'шт',  cat:'Управління',    trend:8.0,  freq:'monthly', value:67   },
        // Виробничі чекпоїнти
        { name:'01 Перевірка замовлення', unit:'%',   cat:'Чекпоїнти',     trend:4.0,  freq:'monthly', value:92   },
        { name:'02 Другий перегляд зам.', unit:'%',   cat:'Чекпоїнти',     trend:8.0,  freq:'monthly', value:78   },
        { name:'03 Деталізація частин',   unit:'%',   cat:'Чекпоїнти',     trend:5.0,  freq:'monthly', value:88   },
        { name:'04 Черговість робіт',     unit:'%',   cat:'Чекпоїнти',     trend:3.0,  freq:'monthly', value:82   },
        { name:'05 Комплектність старт.', unit:'%',   cat:'Чекпоїнти',     trend:2.0,  freq:'monthly', value:96   },
        { name:'06 Комплект. відправка',  unit:'%',   cat:'Чекпоїнти',     trend:1.0,  freq:'monthly', value:94   },
        { name:'07 Фіксація змін',        unit:'%',   cat:'Чекпоїнти',     trend:12.0, freq:'monthly', value:71   },
        { name:'08 Габарити доставки',    unit:'%',   cat:'Чекпоїнти',     trend:6.0,  freq:'monthly', value:85   },
        { name:'09 Завантаження цеху',    unit:'%',   cat:'Чекпоїнти',     trend:9.0,  freq:'monthly', value:79   },
        { name:'10 Координація менедж.',  unit:'%',   cat:'Чекпоїнти',     trend:14.0, freq:'monthly', value:68   },
        { name:'11 Контроль якості',      unit:'%',   cat:'Чекпоїнти',     trend:4.0,  freq:'monthly', value:88   },
        { name:'12 Розбір причин браку',  unit:'%',   cat:'Чекпоїнти',     trend:18.0, freq:'monthly', value:60   },
        { name:'13 Контроль задач',       unit:'%',   cat:'Чекпоїнти',     trend:6.0,  freq:'monthly', value:84   },
        { name:'14 Щоденні планерки',     unit:'%',   cat:'Чекпоїнти',     trend:2.0,  freq:'monthly', value:91   },
        { name:'15 Найм та онбординг',    unit:'%',   cat:'Чекпоїнти',     trend:22.0, freq:'monthly', value:55   },
        { name:'16 Облік і звітність',    unit:'%',   cat:'Чекпоїнти',     trend:8.0,  freq:'monthly', value:82   },
        { name:'17 Планування вироб.',    unit:'%',   cat:'Чекпоїнти',     trend:11.0, freq:'monthly', value:76   },
        { name:'18 Закупівлі та запаси',  unit:'%',   cat:'Чекпоїнти',     trend:3.0,  freq:'monthly', value:88   },
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
            // Реалістична варіація з трендом — чим далі в минуле, тим менше значення
            const trendFactor = 1 - (m.trend || 0) / 100 * p / periods;
            const noise = (Math.random() - 0.5) * 0.12;
            const rawVal = m.value * trendFactor * (1 + noise);
            const val = m.unit === '%' || m.unit === 'бали'
                ? Math.min(100, Math.max(0, Math.round(rawVal * 10) / 10))
                : Math.max(0, Math.round(rawVal * 10) / 10);
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
    // Видаляємо старі рахунки якщо є (з EUR) — перезапишемо нові з UAH
    try {
        const oldAccs = await cr.collection('finance_accounts').get();
        if (!oldAccs.empty) {
            const delBatch = firebase.firestore().batch();
            oldAccs.docs.forEach(d => delBatch.delete(d.ref));
            await delBatch.commit();
        }
    } catch(e) { console.warn('[demo] cleanup accounts:', e.message); }

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
    for (const tx of TXS2) {
        txOps2.push({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
            categoryId:   catRefs2[tx.ci].id,
            categoryName: FIN_CATS2[tx.ci].name,
            accountId:    accRefs[tx.acc].id,
            accountName:  ACCOUNTS[tx.acc].name,
            type:tx.type, amount:tx.amt, currency:'UAH',
            note:tx.note, date:_demoDate(tx.d),
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

    // ── 12. Профіль компанії ────────────────────────────────
    await cr.update({
        name:'МеблеМайстер',
        niche:'furniture', nicheLabel:'Меблевий бізнес',
        description:'Виробництво меблів на замовлення. Кухні, шафи-купе, дитячі, офісні меблі.',
        city:'Київ', employees:8, currency:'UAH',
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
    });
};

// Оновлюємо мітку для UI
if (window._NICHE_LABELS) {
    window._NICHE_LABELS['furniture_factory'] = 'Меблевий бізнес (повне демо)';
}
