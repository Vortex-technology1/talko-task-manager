// ============================================================
// 42-niche-medical.js — Медична клініка
// МедікаПро — багатопрофільна клініка, Київ
// ============================================================
'use strict';

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['medical'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];
    const _demoDate = window._demoDate;
    const _demoTs = window._demoTs;
    const _demoTsFinance = window._demoTsFinance;

    // ── 0. OWNER PRE-WRITE + ОЧИСТКА ─────────────────────────
    try {
        await cr.collection('users').doc(uid).set(
            { role:'owner', status:'active', updatedAt:now }, { merge:true }
        );
    } catch(e) { console.warn('[demo] owner:', e.message); }

    const _clearCols = ['tasks','regularTasks','functions','processTemplates',
        'processes','projects','projectStages','workStandards','coordinations',
        'crm_clients','crm_deals','crm_pipeline','crm_activities',
        'finance_transactions','finance_categories','finance_accounts',
        'finance_recurring','finance_budgets','finance_settings',
        'warehouse_items','warehouse_operations','warehouse_suppliers',
        'metricEntries','metrics','metricTargets',
        'booking_calendars','booking_schedules','booking_appointments',
        'estimates','estimate_norms','project_estimates',
        'finance_invoices','coordination_sessions','sales'];
    try {
        for (const col of _clearCols) {
            const snap = await cr.collection(col).where('isDemo','==',true).get();
            if (!snap.empty) await window.safeBatchCommit(
                snap.docs.map(d=>({type:'delete',ref:d.ref})), 'clear-'+col);
        }
    } catch(e) { console.warn('[demo] clear:', e.message); }


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
        // Сьогодні — МІЙ ДЕНЬ (власник ai:0)
        { t:'Перевірити KPI клініки — завантаженість, виручка',          fi:7, ai:0,  st:'new',      pr:'high',   d:0,  tm:'09:00', est:30,  r:'KPI зафіксовані, відхилення визначені та заплановані' },
        { t:'Підписати договір з новим постачальником медобладнання',    fi:6, ai:0,  st:'new',      pr:'high',   d:0,  tm:'11:00', est:30,  r:'Договір підписаний, умови погоджені' },
        { t:'Зустріч з головним лікарем — план на місяць',              fi:7, ai:0,  st:'new',      pr:'medium', d:0,  tm:'15:00', est:45,  r:'План затверджений, відповідальні призначені' },
        { t:'Розглянути скаргу пацієнта Коваленко',                     fi:7, ai:0,  st:'new',      pr:'high',   d:0,  tm:'16:30', est:30,  r:'Скарга розглянута, відповідь надана, ситуація врегульована' },
        // Сьогодні — команда
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

    // ── 9б. CRM АКТИВНОСТІ ────────────────────────────────────
    const crmCliSnap9m = await cr.collection('crm_clients').get();
    const crmDocs9m = crmCliSnap9m.docs.slice(0, 10);
    const ACT_TEXTS_M = [
        'Пацієнт цікавиться комплексним обстеженням, уточнює вартість',
        'Проведена первинна консультація, призначено аналізи',
        'Отримано результати аналізів, підготовано план лікування',
        'Пацієнт підтвердив курс лікування, підписана згода',
        'Завершено перший тиждень лікування, динаміка позитивна',
        'Пацієнт запитав про повторний прийом через місяць',
        'Нагадування про профілактичний огляд надіслано',
        'Пацієнт залишив відгук 5★ на Google Maps',
        'Надіслано результати УЗД на email',
        'Рекомендував клініку другу — нарахований бонус',
    ];
    await window.safeBatchCommit(crmDocs9m.map((doc, i) => ({type:'set', ref:cr.collection('crm_activities').doc(), data:{
        clientId:doc.id, clientName:doc.data().name,
        type:['note','call','meeting','email','note','call','note','note','email','note'][i],
        text:ACT_TEXTS_M[i],
        date:_demoDate(-(i+1)),
        managerId:sRefs[1].id, managerName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        createdBy:uid, createdAt:now,
    }})), 'step-crm-activities');

    // ── 9в. РАХУНКИ-ФАКТУРИ ───────────────────────────────────
    const INVOICES_M = [
        {client:'Петренко Олег',   amount:3200,  status:'paid',    d:-30, items:[{name:'Комплексне обстеження',      qty:1, price:3200}]},
        {client:'Коваль Оксана',   amount:1800,  status:'paid',    d:-15, items:[{name:'Консультація кардіолога',     qty:1, price:1800}]},
        {client:'Бондар Сергій',   amount:5400,  status:'pending', d:7,   items:[{name:'Курс лікування — 5 сеансів', qty:1, price:5400}]},
        {client:'Мельник Тетяна',  amount:2600,  status:'pending', d:14,  items:[{name:'УЗД + консультація',          qty:1, price:2600}]},
        {client:'Іванченко Роман', amount:1200,  status:'overdue', d:-5,  items:[{name:'Первинний прийом',            qty:1, price:1200}]},
    ];
    await window.safeBatchCommit(INVOICES_M.map(inv => ({type:'set', ref:cr.collection('finance_invoices').doc(), data:{
        clientName:inv.client, amount:inv.amount, currency:'UAH',
        status:inv.status, dueDate:_demoDate(inv.d),
        items:inv.items,
        functionId:fRefs[5].id, functionName:FUNCS[5].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})), 'step-invoices');

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

if (window._NICHE_LABELS) window._NICHE_LABELS['medical'] = 'МедікаПро — медична клініка';
