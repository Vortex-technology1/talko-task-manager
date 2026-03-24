// ============================================================
// 42-niche-food.js — Харчове виробництво
// ФудПро — виробництво снеків та сухариків, Київ
// 12 осіб, 8 функцій, UAH
// ============================================================
'use strict';

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['food_production'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];

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

    // ── 1. ФУНКЦІЇ (8 блоків) ─────────────────────────────────
    const FUNCS = [
        { name:'0. Маркетинг та продажі',        color:'#ec4899', desc:'B2B продажі, мережі, дистриб\'ютори, тендери, нові ринки' },
        { name:'1. Замовлення та планування',     color:'#22c55e', desc:'Прийом замовлень, виробничий план, відвантаження' },
        { name:'2. Виробництво',                  color:'#f97316', desc:'Лінія виробництва, рецептури, норми закладки, ВТК' },
        { name:'3. Контроль якості (ВТК)',        color:'#6366f1', desc:'Лабораторія, HACCP, сертифікати, тести партій' },
        { name:'4. Склад та закупівля сировини', color:'#3b82f6', desc:'Сировина, пакування, постачальники, залишки, ревізія' },
        { name:'5. Логістика та доставка',        color:'#0ea5e9', desc:'Власна доставка, перевізники, відвантаження, документи' },
        { name:'6. Фінанси та облік',             color:'#ef4444', desc:'Собівартість, P&L, рахунки, зарплата, звітність' },
        { name:'7. HR та розвиток персоналу',     color:'#8b5cf6', desc:'Підбір, навчання, санкнижки, охорона праці, атестація' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Дмитро Савченко',
        status:'active', createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // ── 2. КОМАНДА (12 осіб) ─────────────────────────────────
    try {
        const old = await cr.collection('users').get();
        if (!old.empty) {
            const del = old.docs.filter(d=>d.id!==uid).map(d=>({type:'delete',ref:d.ref}));
            if (del.length) await window.safeBatchCommit(del, 'clear-users');
        }
    } catch(e) { console.warn('[demo] clear users:', e.message); }

    const STAFF = [
        { name:'Дмитро Савченко',    role:'owner',    fi:null, pos:'Власник / Генеральний директор' },
        { name:'Галина Пономаренко', role:'manager',  fi:2,    pos:'Технолог / Начальник виробництва' },
        { name:'Микола Сердюк',      role:'employee', fi:2,    pos:'Оператор лінії (зміна А)' },
        { name:'Оксана Ковальчук',   role:'employee', fi:2,    pos:'Оператор лінії (зміна Б)' },
        { name:'Василь Лисенко',     role:'employee', fi:2,    pos:'Оператор пакувальної лінії' },
        { name:'Ірина Білоус',       role:'employee', fi:3,    pos:'Лаборант ВТК' },
        { name:'Сергій Ткаченко',    role:'employee', fi:4,    pos:'Комірник / Склад сировини' },
        { name:'Тетяна Власенко',    role:'employee', fi:1,    pos:'Менеджер з продажів та замовлень' },
        { name:'Андрій Романенко',   role:'employee', fi:5,    pos:'Водій / Логіст' },
        { name:'Наталія Гриценко',   role:'employee', fi:6,    pos:'Бухгалтер' },
        { name:'Олег Бондаренко',    role:'employee', fi:0,    pos:'Менеджер по роботі з мережами' },
        { name:'Людмила Шевченко',   role:'employee', fi:7,    pos:'HR-менеджер' },
    ];
    const sRefs = STAFF.map((s,i) => i===0 ? cr.collection('users').doc(uid) : cr.collection('users').doc());
    STAFF.forEach((s,i) => {
        const fid = s.fi !== null ? fRefs[s.fi].id : null;
        if (i === 0) {
            ops.push({type:'update', ref:sRefs[i], data:{
                role:'owner', position:s.pos,
                functionIds:[], primaryFunctionId:null,
                status:'active', updatedAt:now,
            }});
        } else {
            ops.push({type:'set', ref:sRefs[i], data:{
                name:s.name, role:s.role, position:s.pos,
                email:s.name.toLowerCase().replace(/[\s'іїєа]+/g,'.')+`@foodpro.ua`,
                functionIds:fid?[fid]:[], primaryFunctionId:fid,
                status:'active', createdAt:now, updatedAt:now,
            }});
        }
    });
    await window.safeBatchCommit(ops,'step-staff'); ops=[];

    const faMap = {
        0:[sRefs[0].id,sRefs[10].id],
        1:[sRefs[7].id],
        2:[sRefs[1].id,sRefs[2].id,sRefs[3].id,sRefs[4].id],
        3:[sRefs[5].id],
        4:[sRefs[6].id],
        5:[sRefs[8].id],
        6:[sRefs[9].id,sRefs[0].id],
        7:[sRefs[11].id],
    };
    await window.safeBatchCommit(
        Object.entries(faMap).map(([fi,aids])=>({type:'update',ref:fRefs[parseInt(fi)],data:{assigneeIds:aids,updatedAt:now}})),
        'step-func-assignees'
    );

    // ── 3. ЗАВДАННЯ (25+) ────────────────────────────────────
    function _d(n){const dt=new Date();dt.setDate(dt.getDate()+n);return dt.toISOString().slice(0,10);}
    function _ts(n){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+n*86400000));}
    function _tsF(n){const d=new Date();d.setDate(d.getDate()+n);d.setHours(12,0,0,0);return firebase.firestore.Timestamp.fromDate(d);}

    const TASKS = [
        // Власник (ai:0)
        {t:'Переговори з АТБ — введення нового SKU',          fi:0, ai:0, st:'new',      pr:'high',   d:0,  tm:'11:00'},
        {t:'Підписати контракт з дистриб\'ютором Захід',      fi:0, ai:0, st:'new',      pr:'high',   d:1,  tm:'14:00'},
        {t:'Перевірити P&L та собівартість за березень',      fi:6, ai:0, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Затвердити рецептуру нового смаку — паприка',     fi:2, ai:0, st:'new',      pr:'medium', d:2,  tm:'15:00'},
        {t:'Зустріч з банком — кредитна лінія для обладнання',fi:6, ai:0, st:'new',      pr:'high',   d:3,  tm:'10:00'},
        {t:'Оновити комерційну пропозицію для мереж',         fi:0, ai:0, st:'new',      pr:'medium', d:-1, tm:'10:00'},
        // Виробництво
        {t:'Запуск виробничої лінії — зміна А (06:00)',       fi:2, ai:1, st:'new',      pr:'high',   d:0,  tm:'06:00'},
        {t:'Перевірка рецептури — партія сухариків з часником',fi:2,ai:1, st:'progress', pr:'high',   d:0,  tm:'09:00'},
        {t:'Налаштування пакувальної машини — новий формат',  fi:2, ai:4, st:'new',      pr:'medium', d:1,  tm:'10:00'},
        {t:'Відбір зразків з партії №2847 для ВТК',           fi:3, ai:5, st:'new',      pr:'high',   d:0,  tm:'08:00'},
        // ВТК
        {t:'Тестування нового смаку — паприка + сир',         fi:3, ai:5, st:'progress', pr:'high',   d:0,  tm:'10:00'},
        {t:'Перевірка температурних журналів HACCP',          fi:3, ai:5, st:'new',      pr:'medium', d:0,  tm:'14:00'},
        // Склад та закупівля
        {t:'Замовлення борошна у постачальника Мірошник',     fi:4, ai:6, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Ревізія складу пакувальних матеріалів',           fi:4, ai:6, st:'new',      pr:'medium', d:1,  tm:'11:00'},
        // Продажі
        {t:'Обзвін клієнтів — підтвердження замовлень на тиждень',fi:1,ai:7,st:'new',   pr:'high',   d:0,  tm:'09:00'},
        {t:'Підготовка КП для мережі Сільпо — 5 SKU',        fi:0, ai:10,st:'progress', pr:'high',   d:2,  tm:'12:00'},
        // Логістика
        {t:'Відвантаження АТБ — 800 кг сухариків',            fi:5, ai:8, st:'new',      pr:'high',   d:0,  tm:'07:00'},
        {t:'Доставка замовлення ФОП Марченко — Бровари',      fi:5, ai:8, st:'new',      pr:'medium', d:1,  tm:'10:00'},
        // Фінанси
        {t:'Виставити рахунки за тиждень — 6 клієнтів',       fi:6, ai:9, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Розрахунок собівартості нового SKU (паприка)',     fi:6, ai:9, st:'progress', pr:'medium', d:2,  tm:'15:00'},
        // HR
        {t:'Перевірка санітарних книжок — термін дії',        fi:7, ai:11,st:'new',      pr:'high',   d:1,  tm:'10:00'},
        // На перевірці
        {t:'Звіт по партії №2845 — ВТК перевірка',            fi:3, ai:5, st:'review',   pr:'high',   d:-1, tm:'15:00'},
        // Виконані
        {t:'Отримати сертифікат ДСТУ на новий продукт',       fi:3, ai:0, st:'done',     pr:'high',   d:-10,tm:'10:00'},
        {t:'Підписати договір з АТБ на постачання',           fi:0, ai:0, st:'done',     pr:'high',   d:-7, tm:'10:00'},
        {t:'Навчання операторів — новий режим лінії',         fi:7, ai:11,st:'done',     pr:'medium', d:-5, tm:'09:00'},
    ];
    await window.safeBatchCommit(TASKS.map(t=>({type:'set',ref:cr.collection('tasks').doc(),data:{
        title:t.t, functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
        assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
        status:t.st, priority:t.pr,
        deadlineDate:_d(t.d), deadlineTime:t.tm,
        deadline:firebase.firestore.Timestamp.fromDate(new Date(_d(t.d)+'T'+t.tm+':00')),
        creatorId:uid, creatorName:STAFF[0].name,
        pinned:false, checklist:[], notifyOnComplete:[],
        createdAt:_ts(-1), updatedAt:now,
    }})),'step-tasks');

    // ── 4. РЕГУЛЯРНІ ЗАВДАННЯ (15) ───────────────────────────
    const REGULAR = [
        {t:'Запуск виробничої лінії та перевірка обладнання', fi:2, ai:1,  type:'daily',  dows:['1','2','3','4','5'], time:'06:00', dur:30},
        {t:'Відбір зразків з кожної партії для ВТК',          fi:3, ai:5,  type:'daily',  dows:['1','2','3','4','5'], time:'08:00', dur:20},
        {t:'Контроль температур — журнал HACCP',              fi:3, ai:5,  type:'daily',  dows:['1','2','3','4','5'], time:'12:00', dur:15},
        {t:'Обзвін клієнтів — підтвердження замовлень',       fi:1, ai:7,  type:'daily',  dows:['1','2','3','4','5'], time:'09:00', dur:30},
        {t:'Звіт по виробництву за зміну (кг, партії)',       fi:2, ai:1,  type:'daily',  dows:['1','2','3','4','5'], time:'18:00', dur:20},
        {t:'Планування виробничого плану на тиждень',         fi:1, ai:0,  type:'weekly', dows:['5'], time:'15:00', dur:60},
        {t:'Звіт по продажах та залишках на складі ГП',       fi:6, ai:0,  type:'weekly', dows:['5'], time:'17:00', dur:45},
        {t:'Нарада команди — підсумки тижня',                 fi:7, ai:0,  type:'weekly', dows:['6'], time:'09:00', dur:60},
        {t:'Перевірка залишків сировини та замовлення',       fi:4, ai:6,  type:'weekly', dows:['1','4'], time:'09:00', dur:30},
        {t:'Перевірка обладнання — технічний огляд',          fi:2, ai:1,  type:'weekly', dows:['6'], time:'08:00', dur:60},
        {t:'Виставлення рахунків клієнтам',                   fi:6, ai:9,  type:'weekly', dows:['1'], time:'09:00', dur:45},
        {t:'Розрахунок зарплат та видача',                    fi:6, ai:9,  type:'monthly',dom:'last', time:'15:00', dur:90},
        {t:'Повна ревізія складу сировини та ГП',             fi:4, ai:6,  type:'monthly',dom:'1',    time:'08:00', dur:180},
        {t:'Перевірка та поновлення санкнижок',               fi:7, ai:11, type:'monthly',dom:'15',   time:'10:00', dur:30},
        {t:'Аналіз собівартості та рентабельності SKU',       fi:6, ai:0,  type:'monthly',dom:'25',   time:'15:00', dur:60},
    ];
    await window.safeBatchCommit(REGULAR.map(r=>({type:'set',ref:cr.collection('regularTasks').doc(),data:{
        title:r.t, period:r.type,
        daysOfWeek:r.dows||null, dayOfMonth:r.dom||null,
        timeStart:r.time, estimatedTime:r.dur,
        functionId:fRefs[r.fi].id, functionName:FUNCS[r.fi].name,
        assigneeId:sRefs[r.ai].id, assigneeName:STAFF[r.ai].name,
        creatorId:uid, creatorName:STAFF[0].name,
        status:'active', createdAt:now, updatedAt:now,
    }})),'step-regular');

    // ── 5. ПРОЦЕС-ШАБЛОНИ (4) ────────────────────────────────
    const PROC_TPLS = [
        {
            name:'Виробництво нової партії снеків',
            fi:2, desc:'Повний цикл від сировини до відвантаження',
            steps:[
                {id:'s1',name:'Отримання сировини та вхідний контроль',  fi:4,dur:1,order:1},
                {id:'s2',name:'Підготовка лінії та замішування',         fi:2,dur:1,order:2},
                {id:'s3',name:'Виробництво та пакування',               fi:2,dur:1,order:3},
                {id:'s4',name:'Відбір зразків та ВТК',                  fi:3,dur:1,order:4},
                {id:'s5',name:'Маркування та складування ГП',           fi:4,dur:1,order:5},
                {id:'s6',name:'Оформлення документів та відвантаження', fi:5,dur:1,order:6},
            ],
        },
        {
            name:'Введення нового SKU в лінійку',
            fi:0, desc:'Від ідеї до виходу на полицю',
            steps:[
                {id:'s1',name:'Розробка рецептури та технологічної карти',fi:2,dur:5,order:1},
                {id:'s2',name:'Дослідна партія та ВТК',                  fi:3,dur:2,order:2},
                {id:'s3',name:'Розрахунок собівартості та ціни',         fi:6,dur:2,order:3},
                {id:'s4',name:'Розробка дизайну упаковки',               fi:0,dur:5,order:4},
                {id:'s5',name:'Отримання сертифікату ДСТУ',              fi:3,dur:14,order:5},
                {id:'s6',name:'Переговори з мережами та введення',       fi:0,dur:7,order:6},
            ],
        },
        {
            name:'Залучення нової мережі/дистриб\'ютора',
            fi:0, desc:'Від першого контакту до першого замовлення',
            steps:[
                {id:'s1',name:'Презентація та надсилання КП',            fi:0,dur:2,order:1},
                {id:'s2',name:'Відправка зразків продукції',             fi:0,dur:3,order:2},
                {id:'s3',name:'Переговори по умовах та ціні',            fi:0,dur:5,order:3},
                {id:'s4',name:'Юридичне оформлення договору',            fi:6,dur:3,order:4},
                {id:'s5',name:'Перше тестове замовлення',               fi:1,dur:2,order:5},
                {id:'s6',name:'Аналіз та перехід на регулярні поставки', fi:1,dur:5,order:6},
            ],
        },
        {
            name:'Планове ТО виробничого обладнання',
            fi:2, desc:'Технічне обслуговування лінії',
            steps:[
                {id:'s1',name:'Зупинка лінії та огляд',                fi:2,dur:1,order:1},
                {id:'s2',name:'Заміна зношених деталей',               fi:2,dur:1,order:2},
                {id:'s3',name:'Мастило та налаштування',               fi:2,dur:1,order:3},
                {id:'s4',name:'Тестовий запуск та перевірка',          fi:2,dur:1,order:4},
                {id:'s5',name:'Запис в сервісну книгу',                fi:7,dur:1,order:5},
            ],
        },
    ];
    const tplRefs = PROC_TPLS.map(()=>cr.collection('processTemplates').doc());
    const tplOps = [];
    PROC_TPLS.forEach((tpl,i)=>{
        tplOps.push({type:'set',ref:tplRefs[i],data:{
            name:tpl.name, description:tpl.desc,
            functionId:fRefs[tpl.fi].id, functionName:FUNCS[tpl.fi].name,
            steps:tpl.steps.map(s=>({...s,functionId:fRefs[s.fi].id,functionName:FUNCS[s.fi].name})),
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    });
    const procRefs = [0,1,2].map(()=>cr.collection('processes').doc());
    [
        {ti:0,name:'Партія №2847 — сухарики часник (500кг)',   st:'in_progress',ai:1},
        {ti:1,name:'Новий SKU — снеки зі смаком паприки',     st:'in_progress',ai:0},
        {ti:2,name:'Переговори з мережею Сільпо — 5 SKU',     st:'in_progress',ai:10},
    ].forEach((p,i)=>{
        tplOps.push({type:'set',ref:procRefs[i],data:{
            templateId:tplRefs[p.ti].id, templateName:PROC_TPLS[p.ti].name,
            name:p.name, status:p.st,
            currentStep:3, totalSteps:PROC_TPLS[p.ti].steps.length,
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            functionId:fRefs[PROC_TPLS[p.ti].fi].id, functionName:FUNCS[PROC_TPLS[p.ti].fi].name,
            createdBy:uid, createdAt:_ts(-3), updatedAt:now,
        }});
    });
    await window.safeBatchCommit(tplOps,'step-procs');

    // ── 6. ПРОЄКТИ (3) ──────────────────────────────────────
    const PROJECTS = [
        {
            name:'Купівля другої виробничої лінії',
            fi:2, budget:1800000, desc:'Розширення потужності до 2 тон/добу — нова лінія Fritsch',
            stages:[
                {name:'Аналіз ринку обладнання та постачальників', ai:0, d:14, status:'done'},
                {name:'Отримання кредиту під обладнання',          ai:9, d:30, status:'in_progress'},
                {name:'Замовлення та оплата обладнання',           ai:0, d:60, status:'pending'},
                {name:'Монтаж та налаштування лінії',              ai:1, d:90, status:'pending'},
                {name:'Навчання операторів та запуск',             ai:11,d:100,status:'pending'},
            ],
        },
        {
            name:'Вихід на ринок Польщі та ЄС',
            fi:0, budget:320000, desc:'Сертифікація за стандартами ЄС та перші контракти з Польщею',
            stages:[
                {name:'Отримання сертифікату BRC/IFS',             ai:3, d:60, status:'in_progress'},
                {name:'Локалізація упаковки (польська/англійська)',ai:0, d:45, status:'in_progress'},
                {name:'Участь у виставці Warsaw Food Expo',        ai:0, d:90, status:'pending'},
                {name:'Переговори з польськими дистриб\'юторами', ai:10,d:120,status:'pending'},
                {name:'Перший контейнер до Польщі',               ai:8, d:150,status:'pending'},
            ],
        },
        {
            name:'Впровадження ERP-системи (1С:Виробництво)',
            fi:6, budget:85000, desc:'Автоматизація обліку сировини, виробництва та продажів',
            stages:[
                {name:'Вибір рішення та постачальника',            ai:0, d:14, status:'done'},
                {name:'Налаштування та кастомізація',             ai:9, d:45, status:'in_progress'},
                {name:'Навчання персоналу',                       ai:11,d:55, status:'pending'},
                {name:'Дослідна експлуатація',                   ai:0, d:70, status:'pending'},
                {name:'Перехід на бойову базу',                  ai:0, d:90, status:'pending'},
            ],
        },
    ];
    const projRefs = PROJECTS.map(()=>cr.collection('projects').doc());
    const projOps = [];
    PROJECTS.forEach((p,i)=>{
        projOps.push({type:'set',ref:projRefs[i],data:{
            name:p.name, description:p.desc, status:'active',
            budget:p.budget, spent:Math.round(p.budget*0.2),
            functionId:fRefs[p.fi].id, functionName:FUNCS[p.fi].name,
            ownerId:sRefs[0].id, ownerName:STAFF[0].name,
            deadline:_d(p.stages[p.stages.length-1].d),
            createdBy:uid, createdAt:_ts(-14), updatedAt:now,
        }});
        p.stages.forEach((s,j)=>{
            projOps.push({type:'set',ref:cr.collection('projectStages').doc(),data:{
                projectId:projRefs[i].id, projectName:p.name,
                name:s.name, order:j+1, status:s.status,
                deadline:_d(s.d),
                assigneeId:sRefs[s.ai].id, assigneeName:STAFF[s.ai].name,
                createdBy:uid, createdAt:_ts(-14), updatedAt:now,
            }});
        });
    });
    await window.safeBatchCommit(projOps,'step-projects');

    // ── 7. CRM ───────────────────────────────────────────────
    const pipRef = cr.collection('crm_pipeline').doc();
    await pipRef.set({
        isDemo:true, isDefault:true,
        name:'Клієнти ФудПро',
        stages:[
            {id:'new',       label:'Новий контакт',     color:'#6b7280', order:1},
            {id:'samples',   label:'Зразки надіслано',   color:'#3b82f6', order:2},
            {id:'negotiation',label:'Переговори',        color:'#f59e0b', order:3},
            {id:'active',    label:'Активний клієнт',    color:'#22c55e', order:4},
            {id:'vip',       label:'VIP / Мережа',       color:'#8b5cf6', order:5},
            {id:'paused',    label:'Пауза',              color:'#94a3b8', order:6},
            {id:'lost',      label:'Відмова',            color:'#ef4444', order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    });

    const CLIENTS = [
        {name:'АТБ-Маркет (мережа)',      phone:'+380441150001', email:'category@atb.ua',      src:'direct',   stage:'vip',        amt:840000, d:-3,  note:'480 магазинів, 3 SKU, щотижнева поставка 4 тон'},
        {name:'Сільпо (Fozzy Group)',      phone:'+380441150002', email:'buyer@fozzy.ua',        src:'referral', stage:'negotiation', amt:0,      d:14,  note:'Переговори щодо введення 5 SKU — на фінальному етапі'},
        {name:'Дистриб\'ютор Захід',      phone:'+380441150003', email:'sales@zakhid.ua',       src:'referral', stage:'active',     amt:280000, d:-7,  note:'Захід України — Рівне, Луцьк, Львів. 15 клієнтів'},
        {name:'Мережа АЗС WOG',          phone:'+380441150004', email:'retail@wog.ua',         src:'direct',   stage:'active',     amt:145000, d:-5,  note:'Снеки для АЗС — 120 заправок по Україні'},
        {name:'METRO Cash & Carry',       phone:'+380441150005', email:'buyer@metro.ua',        src:'tender',   stage:'samples',    amt:0,      d:21,  note:'Надіслали зразки 6 SKU. Чекаємо дегустації'},
        {name:'ДП Укрпродторг (держ)',    phone:'+380441150006', email:'tender@upt.gov.ua',     src:'tender',   stage:'vip',        amt:420000, d:-14, note:'Держзакупівля — шкільне харчування, 3 роки'},
        {name:'ФОП Марченко (опт)',       phone:'+380441150007', email:'march@gmail.com',       src:'direct',   stage:'active',     amt:48000,  d:-4,  note:'Оптова торгівля — базар Столичний, Київ'},
        {name:'Кейтеринг Еліт',          phone:'+380441150008', email:'supply@catering.ua',    src:'referral', stage:'active',     amt:62000,  d:-2,  note:'Снеки та горіхи для корпоративних заходів'},
        {name:'Новус (мережа)',           phone:'+380441150009', email:'buyer@novus.ua',        src:'direct',   stage:'new',        amt:0,      d:2,   note:'Перший контакт — надсилаємо каталог та КП'},
        {name:'Дніпровський Дистриб\'ютор',phone:'+380441150010',email:'opt@dndist.ua',        src:'referral', stage:'active',     amt:118000, d:-6,  note:'Центр та Схід України — 20 клієнтів'},
    ];
    const cliRefs = CLIENTS.map(()=>cr.collection('crm_clients').doc());
    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cliRefs[i],data:{
        name:c.name, phone:c.phone, email:c.email,
        source:c.src, status:'active', notes:c.note,
        totalSpent:c.amt, lastOrderDate:_d(c.d-2),
        pipelineId:pipRef.id,
        assigneeId:sRefs[7].id, assigneeName:STAFF[7].name,
        createdAt:_ts(c.d-10), updatedAt:_ts(c.d),
    }})),'step-clients');

    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cr.collection('crm_deals').doc(),data:{
        pipelineId:pipRef.id,
        title:`${c.name} — поставки снеків`,
        clientId:cliRefs[i].id, clientName:c.name,
        phone:c.phone, email:c.email,
        source:c.src, stage:c.stage, amount:c.amt,
        note:c.note,
        assigneeId:sRefs[7].id, assigneeName:STAFF[7].name,
        deleted:false, tags:[], createdAt:_ts(c.d-5), updatedAt:_ts(c.d),
    }})),'step-deals');

    const ACT_TEXTS = [
        'Узгодили квартальний план поставок, ціну зафіксовано на 6 місяців',
        'Buyer Сільпо запросила на презентацію нових SKU — готуємо зразки',
        'Збільшили замовлення — новий клієнт у Тернополі підключився',
        'Підтвердили поставку на 120 АЗС — новий SKU "Крекер BBQ"',
        'Відправили 6 SKU + технологічні карти — чекаємо дегустації',
        'Виграли тендер на 2025-2027 роки — підписання наступного тижня',
        'Підняли ціну на 8% через зростання собівартості — погодили',
        'Нова подія — корпоратив 300 осіб, потрібні снеки та горіхи',
    ];
    await window.safeBatchCommit(cliRefs.slice(0,8).map((ref,i)=>({type:'set',ref:cr.collection('crm_activities').doc(),data:{
        clientId:ref.id, clientName:CLIENTS[i].name,
        type:['meeting','email','call','call','note','meeting','call','note'][i],
        text:ACT_TEXTS[i], date:_d(-(i+1)),
        managerId:sRefs[7].id, managerName:STAFF[7].name,
        functionId:fRefs[0].id, functionName:FUNCS[0].name,
        createdBy:uid, createdAt:_ts(-(i+1)),
    }})),'step-crm-activities');

    // ── 8. ФІНАНСИ ───────────────────────────────────────────
    await cr.collection('finance_settings').doc('main').set({
        isDemo:true, version:1, region:'UA', currency:'UAH', niche:'food_production',
        initializedAt:now, initializedBy:uid, updatedAt:now,
    });

    const FIN_CATS = [
        {name:'Виручка від продажу',      type:'income',  color:'#22c55e', icon:'package'},
        {name:'Закупівля сировини',       type:'expense', color:'#ef4444', icon:'shopping-cart'},
        {name:'Пакувальні матеріали',     type:'expense', color:'#f97316', icon:'box'},
        {name:'Зарплата виробництво',     type:'expense', color:'#8b5cf6', icon:'users'},
        {name:'Електроенергія / газ',     type:'expense', color:'#0ea5e9', icon:'zap'},
        {name:'Логістика та доставка',    type:'expense', color:'#3b82f6', icon:'truck'},
        {name:'Оренда приміщення',        type:'expense', color:'#6b7280', icon:'building'},
        {name:'Інші витрати',             type:'expense', color:'#94a3b8', icon:'more-horizontal'},
    ];
    const catRefs = FIN_CATS.map(()=>cr.collection('finance_categories').doc());
    await window.safeBatchCommit(FIN_CATS.map((c,i)=>({type:'set',ref:catRefs[i],data:{
        name:c.name, type:c.type, color:c.color, icon:c.icon,
        isDefault:false, createdBy:uid, createdAt:now,
    }})),'step-cats');

    const ACCOUNTS = [
        {name:'Приватбанк — ФОП Савченко',  type:'bank', balance:1240000, isDefault:true},
        {name:'Каса підприємства',           type:'cash', balance:28000,   isDefault:false},
        {name:'ПУМБ — розрахунковий',        type:'bank', balance:480000,  isDefault:false},
    ];
    const accRefs = ACCOUNTS.map(()=>cr.collection('finance_accounts').doc());
    await window.safeBatchCommit(ACCOUNTS.map((a,i)=>({type:'set',ref:accRefs[i],data:{
        name:a.name, type:a.type, balance:a.balance,
        currency:'UAH', isDefault:a.isDefault,
        createdBy:uid, createdAt:now,
    }})),'step-accounts');

    const TRANSACTIONS = [
        {cat:0, acc:0, amt:840000,  type:'income',  d:-7,  desc:'АТБ — місячна поставка'},
        {cat:0, acc:0, amt:280000,  type:'income',  d:-5,  desc:'Дистриб\'ютор Захід — квітень'},
        {cat:0, acc:0, amt:420000,  type:'income',  d:-14, desc:'ДП Укрпродторг — квартальна'},
        {cat:0, acc:0, amt:145000,  type:'income',  d:-3,  desc:'Мережа АЗС WOG — місячна'},
        {cat:1, acc:0, amt:-380000, type:'expense', d:-7,  desc:'Борошно, олія, сіль — тиждень'},
        {cat:2, acc:0, amt:-85000,  type:'expense', d:-7,  desc:'Пакування — плівка, коробки'},
        {cat:3, acc:0, amt:-248000, type:'expense', d:-14, desc:'Зарплата виробництво — 1-14 квітня'},
        {cat:4, acc:0, amt:-62000,  type:'expense', d:-30, desc:'Електроенергія — квітень'},
        {cat:5, acc:0, amt:-42000,  type:'expense', d:-7,  desc:'Логістика — доставка клієнтам'},
        {cat:6, acc:0, amt:-35000,  type:'expense', d:-30, desc:'Оренда виробничого приміщення'},
        {cat:0, acc:0, amt:118000,  type:'income',  d:-2,  desc:'Дніпровський Дистриб\'ютор'},
        {cat:0, acc:0, amt:62000,   type:'income',  d:-1,  desc:'Кейтеринг Еліт — замовлення'},
    ];
    await window.safeBatchCommit(TRANSACTIONS.map(t=>({type:'set',ref:cr.collection('finance_transactions').doc(),data:{
        categoryId:catRefs[t.cat].id, categoryName:FIN_CATS[t.cat].name,
        accountId:accRefs[t.acc].id, accountName:ACCOUNTS[t.acc].name,
        amount:Math.abs(t.amt), type:t.type,
        description:t.desc, date:_tsF(t.d),
        createdBy:uid, createdAt:_ts(t.d), updatedAt:now,
    }})),'step-transactions');

    await window.safeBatchCommit([
        {client:'АТБ-Маркет',         amount:840000, status:'paid',    d:-7},
        {client:'ДП Укрпродторг',     amount:420000, status:'paid',    d:-14},
        {client:'Дистриб\'ютор Захід',amount:280000, status:'pending', d:5},
        {client:'Мережа АЗС WOG',    amount:145000, status:'pending', d:7},
        {client:'ФОП Марченко',       amount:48000,  status:'overdue', d:-3},
    ].map(inv=>({type:'set',ref:cr.collection('finance_invoices').doc(),data:{
        clientName:inv.client, amount:inv.amount, currency:'UAH',
        status:inv.status, dueDate:_d(inv.d),
        items:[{name:'Снеки та сухарики ФудПро', qty:1, price:inv.amount}],
        functionId:fRefs[6].id, functionName:FUNCS[6].name,
        createdBy:uid, createdAt:_ts(inv.d-3), updatedAt:now,
    }})),'step-invoices');

    // ── 9. СКЛАД сировини та ГП ──────────────────────────────
    const RAW = [
        {name:'Борошно пшеничне в/г (25 кг)',    cat:'Сировина',  qty:80,  unit:'меш', price:480,  min:30},
        {name:'Олія соняшникова рафінована (5л)', cat:'Сировина',  qty:40,  unit:'каністра',price:240,min:15},
        {name:'Сіль харчова (1 кг)',              cat:'Сировина',  qty:50,  unit:'пач', price:18,   min:20},
        {name:'Приправа "Часник" (1 кг)',         cat:'Приправи',  qty:12,  unit:'кг',  price:320,  min:5},
        {name:'Приправа "Паприка" (1 кг)',        cat:'Приправи',  qty:8,   unit:'кг',  price:280,  min:5},
        {name:'Приправа "Сир" (1 кг)',            cat:'Приправи',  qty:10,  unit:'кг',  price:380,  min:5},
        {name:'Плівка пакувальна (рулон 10 кг)',  cat:'Пакування', qty:15,  unit:'рул', price:840,  min:6},
        {name:'Коробка гофрокартон 500×300×200', cat:'Пакування', qty:200, unit:'шт',  price:28,   min:80},
        {name:'Пакет zip-lock 100г (1000шт)',     cat:'Пакування', qty:8,   unit:'блок',price:480,  min:3},
        {name:'Лоток пластиковий (100шт)',        cat:'Пакування', qty:12,  unit:'упак',price:320,  min:5},
        {name:'ГП — Сухарики "Часник" 100г',     cat:'Готова продукція',qty:1200,unit:'уп',price:12,min:200},
        {name:'ГП — Снеки "Паприка" 90г',        cat:'Готова продукція',qty:800, unit:'уп',price:14,min:150},
    ];
    await window.safeBatchCommit(RAW.map(p=>({type:'set',ref:cr.collection('warehouse_items').doc(),data:{
        name:p.name, category:p.cat,
        quantity:p.qty, unit:p.unit,
        purchasePrice:p.price, salePrice:Math.round(p.price*1.6),
        minQuantity:p.min,
        locationId:'main', locationName:'Склад ФудПро',
        status:p.qty<=p.min?'low_stock':'in_stock',
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-warehouse');

    // ── 10. БРОНЮВАННЯ (замовлення партій) ───────────────────
    const bookCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookCalRef, data:{
            name:'Замовлення партії — ФудПро',
            slug:'foodpro-order',
            ownerName:STAFF[7].name, ownerId:sRefs[7].id,
            duration:30, bufferBefore:0, bufferAfter:0,
            timezone:'Europe/Kiev',
            confirmationType:'manual',
            color:'#f97316',
            location:'ФудПро, вул. Виробнича 8, Київ',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1',text:'Назва SKU та кількість (кг або упаковок)', type:'text',   required:true},
                {id:'q2',text:'Бажана дата відвантаження',                type:'text',   required:true},
                {id:'q3',text:'Тип доставки',                             type:'select', required:true,
                 options:['Самовивіз','Доставка нашим транспортом','Новою Поштою']},
                {id:'q4',text:'Додаткові побажання',                      type:'text',   required:false},
            ],
            maxBookingsPerSlot:5, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookCalRef.id), data:{
            calendarId:bookCalRef.id,
            weeklyHours:{
                mon:[{start:'08:00',end:'17:00'}],
                tue:[{start:'08:00',end:'17:00'}],
                wed:[{start:'08:00',end:'17:00'}],
                thu:[{start:'08:00',end:'17:00'}],
                fri:[{start:'08:00',end:'16:00'}],
                sat:[],sun:[],
            },
            isActive:true, createdAt:now, updatedAt:now,
        }},
    ],'step-booking');

    await window.safeBatchCommit([
        {client:'АТБ-Маркет',          phone:'+380441150001', service:'Сухарики часник — 800кг',    d:-7, time:'08:00', status:'completed'},
        {client:'Дистриб\'ютор Захід', phone:'+380441150003', service:'Снеки паприка — 400кг',      d:-5, time:'09:00', status:'completed'},
        {client:'Мережа АЗС WOG',     phone:'+380441150004', service:'Асорті снеків — 200кг',      d:1,  time:'08:00', status:'scheduled'},
        {client:'ФОП Марченко',        phone:'+380441150007', service:'Оптове замовлення — 150кг',  d:2,  time:'10:00', status:'scheduled'},
        {client:'Кейтеринг Еліт',     phone:'+380441150008', service:'Снеки для заходу — 80кг',    d:3,  time:'09:00', status:'scheduled'},
    ].map(b=>({type:'set',ref:cr.collection('booking_appointments').doc(),data:{
        calendarId:bookCalRef.id,
        clientName:b.client, clientPhone:b.phone,
        serviceName:b.service, date:_d(b.d), time:b.time,
        duration:30, status:b.status,
        assigneeId:sRefs[7].id, assigneeName:STAFF[7].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        notes:'', createdBy:uid, createdAt:_ts(b.d-1), updatedAt:now,
    }})),'step-booking-apps');

    // ── 11. КООРДИНАЦІЇ (4) ──────────────────────────────────
    await window.safeBatchCommit([
        {name:'Ранковий запуск виробництва',           type:'daily',   ai:1, parts:[0,1,2,3,4,5], d:1,  time:'06:00'},
        {name:'Тижнева нарада команди',               type:'weekly',  ai:0, parts:[0,1,5,6,7,8,9,10,11], d:7, time:'09:00'},
        {name:'Планування виробничого плану',          type:'weekly',  ai:0, parts:[0,1,6,7],      d:5,  time:'15:00'},
        {name:'Нарада по якості (ВТК)',               type:'monthly', ai:5, parts:[0,1,5],         d:14, time:'10:00'},
    ].map(c=>({type:'set',ref:cr.collection('coordinations').doc(),data:{
        name:c.name, type:c.type,
        chairmanId:sRefs[c.ai].id, chairmanName:STAFF[c.ai].name,
        participantIds:c.parts.map(i=>sRefs[i].id),
        participantNames:c.parts.map(i=>STAFF[i].name),
        schedule:{day:null,time:c.time},
        nextDate:_d(c.d),
        agendaItems:['execution','tasks','reports'],
        functionId:fRefs[7].id, functionName:FUNCS[7].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-coords');

    // ── 12. МЕТРИКИ ──────────────────────────────────────────
    const METRICS = [
        {name:'Виробництво (кг/тиждень)',      unit:'кг',  fi:2, freq:'weekly',  vals:[4200,3800,4600,4400,5000]},
        {name:'Виручка за тиждень',            unit:'грн', fi:6, freq:'weekly',  vals:[465000,420000,512000,485000,580000]},
        {name:'Собівартість 1 кг продукції',   unit:'грн', fi:6, freq:'weekly',  vals:[58,60,57,59,56]},
        {name:'Відсоток браку',                unit:'%',   fi:3, freq:'weekly',  vals:[1.8,2.1,1.5,1.7,1.4]},
        {name:'Завантаженість лінії',          unit:'%',   fi:2, freq:'weekly',  vals:[72,65,80,76,86]},
        {name:'Рентабельність продажів',       unit:'%',   fi:6, freq:'monthly', vals:[28,30,27,32,35]},
        {name:'Кількість активних клієнтів',  unit:'шт',  fi:0, freq:'monthly', vals:[6,7,7,8,10]},
        {name:'Вчасність поставок',            unit:'%',   fi:5, freq:'weekly',  vals:[94,90,96,95,98]},
    ];
    const mRefs = METRICS.map(()=>cr.collection('metrics').doc());
    const mOps = [];
    const now_ms = Date.now();
    METRICS.forEach((m,i)=>{
        mOps.push({type:'set',ref:mRefs[i],data:{
            name:m.name, unit:m.unit, frequency:m.freq,
            functionId:fRefs[m.fi].id, functionName:FUNCS[m.fi].name,
            createdBy:uid, createdAt:now,
        }});
        const pd = m.freq==='weekly'?7:30;
        m.vals.forEach((val,j)=>{
            const offset = -(m.vals.length-1-j)*pd;
            const dt = new Date(now_ms+offset*86400000);
            const pk = m.freq==='weekly'
                ?`${dt.getFullYear()}-W${String(Math.ceil(dt.getDate()/7)).padStart(2,'0')}`
                :`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
            mOps.push({type:'set',ref:cr.collection('metricEntries').doc(),data:{
                metricId:mRefs[i].id, metricName:m.name,
                value:val, periodKey:pk, frequency:m.freq,
                scope:'company', createdBy:uid,
                createdAt:firebase.firestore.Timestamp.fromDate(dt),
            }});
        });
    });
    await window.safeBatchCommit(mOps,'step-metrics');

    // ── 13. СТАНДАРТИ (3) ────────────────────────────────────
    await window.safeBatchCommit([
        {name:'Стандарт виробничого процесу',    fi:2,
         content:'1. Перевірити чистоту лінії перед запуском.\n2. Звірити рецептуру за технологічною картою.\n3. Зафіксувати дату, зміну та номер партії в журналі.\n4. Кожні 30 хв відбирати зразки для ВТК.\n5. По завершенні партії — чищення лінії за графіком.'},
        {name:'Стандарт ВТК — контроль партії', fi:3,
         content:'1. Відбір зразків: 3 упаковки з початку, середини, кінця партії.\n2. Перевірка ваги (±3%), зовнішнього вигляду, кольору.\n3. Органолептичний аналіз — смак, запах, хрусткість.\n4. Перевірка маркування та терміну придатності.\n5. Підпис акту ВТК. Брак >2% — зупинка лінії.'},
        {name:'Стандарт відвантаження клієнту', fi:5,
         content:'1. Звірити замовлення з накладною (SKU, кількість, вага).\n2. Перевірити цілісність упаковки та маркування.\n3. Оформити ТТН та рахунок-фактуру.\n4. Сфотографувати партію при завантаженні.\n5. Повідомити клієнта про відвантаження (SMS/email).'},
    ].map(s=>({type:'set',ref:cr.collection('workStandards').doc(),data:{
        name:s.name, content:s.content,
        functionId:fRefs[s.fi].id, functionName:FUNCS[s.fi].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-standards');

    // ── 14. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:'ФудПро', niche:'food_production',
        nicheLabel:'Харчове виробництво',
        description:'ФудПро — виробництво снеків та сухариків. 1 тон/добу, клієнти АТБ, Укрпродторг, мережі АЗС. Сертифіковано ДСТУ.',
        city:'Київ', currency:'UAH',
        employees:12, avgCheck:0,
        monthlyRevenue:2320000,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['food_production'] = 'ФудПро — виробництво снеків (Київ)';
