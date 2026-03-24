// ============================================================
// 42-niche-autoservice.js — Автосервіс
// АвтоСтар СТО — повний спектр послуг, Київ
// 12 осіб, 8 функцій, повний цикл
// ============================================================
'use strict';

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['autoservice'] = async function() {
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
        { name:'0. Маркетинг та залучення',    color:'#ec4899', desc:'Google Ads, Instagram, акції, залучення нових клієнтів, репутація' },
        { name:'1. Прийом та запис авто',       color:'#22c55e', desc:'Дзвінки, запис, розклад, прийом авто, замовлення-наряд' },
        { name:'2. Діагностика та ремонт',      color:'#f97316', desc:'Діагностика, ТО, заміна запчастин, контроль якості робіт' },
        { name:'3. Контроль якості та сервіс',  color:'#6366f1', desc:'Перевірка перед видачею, здача авто, відгуки, NPS' },
        { name:'4. Планування та розвиток',     color:'#3b82f6', desc:'Нові послуги, обладнання, стратегія, партнерства' },
        { name:'5. Запчастини та постачання',   color:'#0ea5e9', desc:'Склад запчастин, замовлення, мінімальні залишки, постачальники' },
        { name:'6. Фінанси та облік',           color:'#ef4444', desc:'Каса, виручка, зарплата, ФОП, P&L, звітність' },
        { name:'7. HR та навчання',             color:'#8b5cf6', desc:'Підбір, атестація механіків, мотивація, графік роботи' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Сергій Коваленко',
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
        { name:'Сергій Коваленко',  role:'owner',    fi:null, pos:'Власник / Директор СТО' },
        { name:'Ірина Мельник',     role:'manager',  fi:1,    pos:'Майстер-приймальник' },
        { name:'Олексій Бондаренко',role:'employee', fi:2,    pos:'Майстер-механік (старший)' },
        { name:'Василь Петренко',   role:'employee', fi:2,    pos:'Майстер-механік' },
        { name:'Дмитро Сидоренко',  role:'employee', fi:2,    pos:'Майстер-механік' },
        { name:'Андрій Лисенко',    role:'employee', fi:2,    pos:'Автоелектрик' },
        { name:'Микола Гриценко',   role:'employee', fi:2,    pos:'Шиномонтажник' },
        { name:'Олег Савченко',     role:'employee', fi:5,    pos:'Комірник / Запчастини' },
        { name:'Тетяна Бойко',      role:'employee', fi:6,    pos:'Бухгалтер / Каса' },
        { name:'Юрій Ткаченко',     role:'employee', fi:0,    pos:'Менеджер з реклами' },
        { name:'Катерина Шевченко', role:'employee', fi:3,    pos:'Контролер якості' },
        { name:'Павло Романенко',   role:'employee', fi:7,    pos:'HR-менеджер' },
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
                email:s.name.toLowerCase().replace(/[\s']+/g,'.')+`@autostar.ua`,
                functionIds:fid?[fid]:[], primaryFunctionId:fid,
                status:'active', createdAt:now, updatedAt:now,
            }});
        }
    });
    await window.safeBatchCommit(ops,'step-staff'); ops=[];

    // assigneeIds для функцій
    const faMap = {
        0:[sRefs[0].id,sRefs[9].id],
        1:[sRefs[1].id],
        2:[sRefs[2].id,sRefs[3].id,sRefs[4].id,sRefs[5].id,sRefs[6].id],
        3:[sRefs[10].id],
        4:[sRefs[0].id],
        5:[sRefs[7].id],
        6:[sRefs[8].id,sRefs[0].id],
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
        // Власник (ai:0) — Мій день
        {t:'Перевірити завантаженість постів на тиждень',    fi:7, ai:0,  st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Погодити закупівлю нового підйомника',           fi:4, ai:0,  st:'new',      pr:'high',   d:1,  tm:'11:00'},
        {t:'Звіт по виручці за тиждень',                     fi:6, ai:0,  st:'new',      pr:'high',   d:0,  tm:'17:00'},
        {t:'Зустріч з постачальником запчастин',             fi:5, ai:0,  st:'new',      pr:'medium', d:2,  tm:'14:00'},
        {t:'Перевірити відгуки в Google Business',           fi:0, ai:0,  st:'progress', pr:'medium', d:0,  tm:'10:00'},
        // Прострочені власника
        {t:'Оновити прайс на ТО для Euro 6',                 fi:1, ai:0,  st:'new',      pr:'high',   d:-2, tm:'10:00'},
        // Команда
        {t:'Провести ранковий стенд-ап з майстрами',         fi:7, ai:1,  st:'new',      pr:'high',   d:0,  tm:'08:00'},
        {t:'Замовити оливу Shell 5W40 (20л × 5)',            fi:5, ai:7,  st:'new',      pr:'high',   d:0,  tm:'10:00'},
        {t:'Діагностика BMW X5 — Коваленко',                 fi:2, ai:2,  st:'progress', pr:'high',   d:0,  tm:'11:00'},
        {t:'ТО Toyota Camry — Петров',                       fi:2, ai:3,  st:'new',      pr:'medium', d:0,  tm:'13:00'},
        {t:'Перевірка підвіски Skoda Octavia',               fi:2, ai:4,  st:'new',      pr:'medium', d:1,  tm:'09:00'},
        {t:'Замінити гальмівні колодки VW Passat',           fi:2, ai:5,  st:'progress', pr:'high',   d:0,  tm:'10:00'},
        {t:'Шиномонтаж + балансування 4 колеса — Hyundai',  fi:2, ai:6,  st:'new',      pr:'low',    d:0,  tm:'14:00'},
        {t:'Ревізія складу запчастин',                       fi:5, ai:7,  st:'new',      pr:'medium', d:1,  tm:'10:00'},
        {t:'Виставити рахунок за ремонт Ford Focus',         fi:6, ai:8,  st:'new',      pr:'high',   d:0,  tm:'12:00'},
        {t:'Запустити акцію: ТО + 10% знижки',              fi:0, ai:9,  st:'progress', pr:'medium', d:2,  tm:'10:00'},
        {t:'Контроль якості — перевірка BMW X5 перед видачею',fi:3,ai:10, st:'new',      pr:'high',   d:0,  tm:'16:00'},
        {t:'Скласти графік роботи на квітень',               fi:7, ai:11, st:'new',      pr:'medium', d:3,  tm:'10:00'},
        // На перевірці
        {t:'Ремонт двигуна Renault Duster — фінальна перевірка', fi:2, ai:2, st:'review', pr:'high', d:-1, tm:'15:00'},
        // Прострочені
        {t:'Відновити контракт з постачальником Bosch',      fi:5, ai:0,  st:'new',      pr:'high',   d:-3, tm:'10:00'},
        {t:'Подати звіт ФОП за лютий',                       fi:6, ai:8,  st:'new',      pr:'high',   d:-1, tm:'18:00'},
        // Виконані
        {t:'Налаштувати онлайн-запис через сайт',            fi:0, ai:9,  st:'done',     pr:'medium', d:-5, tm:'10:00'},
        {t:'Провести атестацію механіків',                   fi:7, ai:11, st:'done',     pr:'high',   d:-7, tm:'10:00'},
        {t:'Закупити новий компресор',                       fi:4, ai:0,  st:'done',     pr:'medium', d:-10,tm:'10:00'},
        {t:'Оновити сторінку в Instagram',                   fi:0, ai:9,  st:'done',     pr:'low',    d:-3, tm:'11:00'},
    ];
    const taskOps = TASKS.map(t=>({type:'set',ref:cr.collection('tasks').doc(),data:{
        title:t.t, functionId:fRefs[t.fi].id, functionName:FUNCS[t.fi].name,
        assigneeId:sRefs[t.ai].id, assigneeName:STAFF[t.ai].name,
        status:t.st, priority:t.pr,
        deadlineDate:_d(t.d), deadlineTime:t.tm,
        deadline:firebase.firestore.Timestamp.fromDate(new Date(_d(t.d)+'T'+t.tm+':00')),
        creatorId:uid, creatorName:STAFF[0].name,
        pinned:false, checklist:[], notifyOnComplete:[],
        createdAt:_ts(-1), updatedAt:now,
    }}));
    await window.safeBatchCommit(taskOps,'step-tasks');

    // ── 4. РЕГУЛЯРНІ ЗАВДАННЯ (15) ───────────────────────────
    const REGULAR = [
        {t:'Ранковий стенд-ап з майстрами',        fi:7, ai:1,  type:'daily',   dows:['1','2','3','4','5'], time:'08:00', dur:20},
        {t:'Перевірка записів на день',             fi:1, ai:1,  type:'daily',   dows:['1','2','3','4','5','6'], time:'07:45', dur:15},
        {t:'Контроль наявності витратних матеріалів',fi:5,ai:7,  type:'daily',   dows:['1','3','5'], time:'09:00', dur:20},
        {t:'Публікація в Instagram/Facebook',       fi:0, ai:9,  type:'daily',   dows:['1','3','5'], time:'11:00', dur:30},
        {t:'Перевірка відгуків Google та 2GIS',     fi:0, ai:9,  type:'weekly',  dows:['1'], time:'10:00', dur:20},
        {t:'Звіт по виручці та завантаженості',     fi:6, ai:0,  type:'weekly',  dows:['5'], time:'17:00', dur:45},
        {t:'Нарада з майстрами — підсумки тижня',   fi:7, ai:0,  type:'weekly',  dows:['6'], time:'09:00', dur:60},
        {t:'Замовлення запчастин та витратних',      fi:5, ai:7,  type:'weekly',  dows:['1'], time:'10:00', dur:30},
        {t:'Перевірка стану обладнання (підйомники, компресор)', fi:4, ai:2, type:'weekly', dows:['6'], time:'08:00', dur:30},
        {t:'Аналіз конкурентів та цін на ринку',    fi:4, ai:0,  type:'weekly',  dows:['3'], time:'15:00', dur:30},
        {t:'Атестація нового майстра',              fi:7, ai:11, type:'monthly', dom:'1',  time:'10:00', dur:60},
        {t:'Повна ревізія складу',                  fi:5, ai:7,  type:'monthly', dom:'1',  time:'10:00', dur:120},
        {t:'Звіт ФОП / бухгалтерський звіт',       fi:6, ai:8,  type:'monthly', dom:'last', time:'16:00', dur:90},
        {t:'Планування акцій на наступний місяць',  fi:0, ai:9,  type:'monthly', dom:'25', time:'14:00', dur:45},
        {t:'Технічне обслуговування обладнання',    fi:4, ai:2,  type:'monthly', dom:'15', time:'09:00', dur:120},
    ];
    const regOps = REGULAR.map(r=>{
        const dows = r.dows ? r.dows : null;
        return {type:'set',ref:cr.collection('regularTasks').doc(),data:{
            title:r.t,
            period:r.type,
            daysOfWeek:dows,
            dayOfMonth:r.dom||null,
            timeStart:r.time,
            estimatedTime:r.dur,
            functionId:fRefs[r.fi].id, functionName:FUNCS[r.fi].name,
            assigneeId:sRefs[r.ai].id, assigneeName:STAFF[r.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            status:'active', createdAt:now, updatedAt:now,
        }};
    });
    await window.safeBatchCommit(regOps,'step-regular');

    // ── 5. ПРОЦЕС-ШАБЛОНИ (4) ────────────────────────────────
    const PROC_TPLS = [
        {
            name:'Стандартне ТО автомобіля',
            fi:2, desc:'Повний цикл технічного обслуговування',
            steps:[
                {id:'s1',name:'Прийом та огляд авто',          fi:1, dur:1, order:1},
                {id:'s2',name:'Діагностика комп\'ютером',      fi:2, dur:1, order:2},
                {id:'s3',name:'Заміна оливи та фільтрів',      fi:2, dur:1, order:3},
                {id:'s4',name:'Перевірка гальм та підвіски',   fi:2, dur:1, order:4},
                {id:'s5',name:'Контроль якості',               fi:3, dur:1, order:5},
                {id:'s6',name:'Здача авто клієнту',            fi:1, dur:1, order:6},
            ],
        },
        {
            name:'Кузовний ремонт',
            fi:2, desc:'Ремонт кузова — від прийому до видачі',
            steps:[
                {id:'s1',name:'Фотофіксація пошкоджень',       fi:1, dur:1, order:1},
                {id:'s2',name:'Складання кошторису',           fi:1, dur:1, order:2},
                {id:'s3',name:'Рихтування та зварювання',      fi:2, dur:3, order:3},
                {id:'s4',name:'Підготовка під фарбування',     fi:2, dur:1, order:4},
                {id:'s5',name:'Фарбування',                    fi:2, dur:2, order:5},
                {id:'s6',name:'Полірування та контроль',       fi:3, dur:1, order:6},
            ],
        },
        {
            name:'Онбординг нового механіка',
            fi:7, desc:'Введення нового майстра в роботу',
            steps:[
                {id:'s1',name:'Знайомство з командою та СТО',  fi:7, dur:1, order:1},
                {id:'s2',name:'Інструктаж з безпеки',          fi:7, dur:1, order:2},
                {id:'s3',name:'Навчання стандартам якості',    fi:7, dur:3, order:3},
                {id:'s4',name:'Робота під керівництвом',       fi:2, dur:5, order:4},
                {id:'s5',name:'Атестація та допуск',           fi:7, dur:1, order:5},
            ],
        },
        {
            name:'Закупівля запчастин',
            fi:5, desc:'Стандартний процес закупівлі',
            steps:[
                {id:'s1',name:'Перевірка залишків',            fi:5, dur:1, order:1},
                {id:'s2',name:'Формування заявки',             fi:5, dur:1, order:2},
                {id:'s3',name:'Погодження з директором',       fi:5, dur:1, order:3},
                {id:'s4',name:'Відправка постачальнику',       fi:5, dur:1, order:4},
                {id:'s5',name:'Прийом та оприходування',       fi:5, dur:1, order:5},
            ],
        },
    ];
    const tplOps = [];
    const tplRefs = PROC_TPLS.map(()=>cr.collection('processTemplates').doc());
    PROC_TPLS.forEach((tpl,i)=>{
        tplOps.push({type:'set',ref:tplRefs[i],data:{
            name:tpl.name, description:tpl.desc,
            functionId:fRefs[tpl.fi].id, functionName:FUNCS[tpl.fi].name,
            steps:tpl.steps.map(s=>({...s,functionId:fRefs[s.fi].id,functionName:FUNCS[s.fi].name})),
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    });
    // Активні процеси (3)
    const procRefs = [0,1,2].map(()=>cr.collection('processes').doc());
    [
        {ti:0,name:'ТО BMW X5 — Бойко Андрій',    st:'in_progress', ai:2},
        {ti:1,name:'Кузов Ford Focus — Марченко',   st:'in_progress', ai:4},
        {ti:2,name:'Онбординг — Романенко Павло',   st:'in_progress', ai:11},
    ].forEach((p,i)=>{
        tplOps.push({type:'set',ref:procRefs[i],data:{
            templateId:tplRefs[p.ti].id, templateName:PROC_TPLS[p.ti].name,
            name:p.name, status:p.st,
            currentStep:1, totalSteps:PROC_TPLS[p.ti].steps.length,
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            functionId:fRefs[PROC_TPLS[p.ti].fi].id, functionName:FUNCS[PROC_TPLS[p.ti].fi].name,
            createdBy:uid, createdAt:_ts(-2), updatedAt:now,
        }});
    });
    await window.safeBatchCommit(tplOps,'step-procs');

    // ── 6. ПРОЄКТИ (3) ──────────────────────────────────────
    const PROJECTS = [
        {
            name:'Купівля 4-стійкового підйомника',
            fi:4, budget:180000, status:'active',
            desc:'Придбання та монтаж підйомника Ravaglioli G2140',
            stages:[
                {name:'Аналіз ринку та вибір моделі',   ai:0,  d:7,  status:'done'},
                {name:'Переговори з постачальниками',    ai:0,  d:14, status:'done'},
                {name:'Оформлення замовлення',           ai:8,  d:21, status:'in_progress'},
                {name:'Доставка та монтаж',              ai:2,  d:35, status:'pending'},
                {name:'Навчання персоналу',              ai:11, d:42, status:'pending'},
            ],
        },
        {
            name:'Відкриття поста кузовного ремонту',
            fi:4, budget:320000, status:'active',
            desc:'Облаштування окремого боксу для кузовного ремонту та фарбування',
            stages:[
                {name:'Проєктування та дозволи',        ai:0,  d:30, status:'in_progress'},
                {name:'Ремонт приміщення',              ai:0,  d:60, status:'pending'},
                {name:'Закупівля обладнання',           ai:7,  d:75, status:'pending'},
                {name:'Найм кузовника',                 ai:11, d:90, status:'pending'},
            ],
        },
        {
            name:'Сертифікація ISO 9001',
            fi:4, budget:45000, status:'active',
            desc:'Отримання міжнародного сертифікату якості',
            stages:[
                {name:'Підготовка документації',        ai:0,  d:14, status:'done'},
                {name:'Внутрішній аудит',               ai:10, d:21, status:'in_progress'},
                {name:'Навчання персоналу',             ai:11, d:28, status:'pending'},
                {name:'Зовнішній аудит',               ai:0,  d:45, status:'pending'},
                {name:'Отримання сертифікату',         ai:0,  d:60, status:'pending'},
            ],
        },
    ];
    const projRefs = PROJECTS.map(()=>cr.collection('projects').doc());
    const projOps = [];
    PROJECTS.forEach((p,i)=>{
        projOps.push({type:'set',ref:projRefs[i],data:{
            name:p.name, description:p.desc, status:p.status,
            budget:p.budget, spent:Math.round(p.budget*0.3),
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
        name:'Клієнти СТО',
        stages:[
            {id:'new',         label:'Новий запит',     color:'#6b7280', order:1},
            {id:'appointment', label:'Запис',            color:'#3b82f6', order:2},
            {id:'in_work',     label:'В роботі',         color:'#f59e0b', order:3},
            {id:'quality',     label:'Контроль якості',  color:'#8b5cf6', order:4},
            {id:'ready',       label:'Готово до видачі', color:'#22c55e', order:5},
            {id:'done',        label:'Виданий',          color:'#16a34a', order:6},
            {id:'lost',        label:'Відмова',          color:'#ef4444', order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    });

    const CLIENTS = [
        {name:'Бойко Андрій',     phone:'+380671111001', email:'boyko@gmail.com',   car:'BMW X5 2019',          src:'google',   stage:'in_work',    amt:4800,  d:-3},
        {name:'Марченко Василь',  phone:'+380671111002', email:'march@ukr.net',     car:'Ford Focus 2018',      src:'referral', stage:'in_work',    amt:1840,  d:-1},
        {name:'Шевченко Петро',   phone:'+380671111003', email:'shev@gmail.com',    car:'VW Passat 2020',       src:'instagram',stage:'appointment',amt:3200,  d:1 },
        {name:'Іванченко Михайло',phone:'+380671111004', email:'ivan@gmail.com',    car:'Mazda CX-5 2021',      src:'google',   stage:'new',        amt:1600,  d:2 },
        {name:'Ковальська Оксана',phone:'+380671111005', email:'kova@ukr.net',      car:'Toyota Camry 2022',    src:'referral', stage:'ready',      amt:3960,  d:-2},
        {name:'Гриценко Наталія', phone:'+380671111006', email:'gryts@gmail.com',   car:'Skoda Octavia 2019',   src:'2gis',     stage:'done',       amt:2800,  d:-7},
        {name:'Павленко Ірина',   phone:'+380671111007', email:'pavl@gmail.com',    car:'Kia Sportage 2020',    src:'google',   stage:'done',       amt:5200,  d:-10},
        {name:'Кравченко Юрій',   phone:'+380671111008', email:'krav@ukr.net',      car:'Mercedes C200 2021',   src:'referral', stage:'in_work',    amt:8400,  d:-1},
        {name:'Олійник Сергій',   phone:'+380671111009', email:'oliynyk@meta.ua',   car:'Renault Duster 2018',  src:'facebook', stage:'appointment',amt:1920,  d:3 },
        {name:'Ткаченко Юлія',    phone:'+380671111010', email:'tkach@gmail.com',   car:'Hyundai Tucson 2023',  src:'google',   stage:'new',        amt:900,   d:2 },
        {name:'Лисенко Олег',     phone:'+380671111011', email:'lysen@ukr.net',     car:'Audi A4 2020',         src:'referral', stage:'quality',    amt:6200,  d:0 },
        {name:'Савченко Дмитро',  phone:'+380671111012', email:'savch@gmail.com',   car:'Peugeot 308 2019',     src:'site',     stage:'done',       amt:2100,  d:-14},
    ];
    const cliRefs = CLIENTS.map(()=>cr.collection('crm_clients').doc());
    const cliOps = CLIENTS.map((c,i)=>({type:'set',ref:cliRefs[i],data:{
        name:c.name, phone:c.phone, email:c.email,
        source:c.src, status:'active',
        notes:`Авто: ${c.car}`,
        totalSpent:c.amt, lastOrderDate:_d(c.d-5),
        pipelineId:pipRef.id,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        createdAt:_ts(c.d-10), updatedAt:_ts(c.d),
    }}));
    await window.safeBatchCommit(cliOps,'step-clients');

    const dealOps = CLIENTS.map((c,i)=>({type:'set',ref:cr.collection('crm_deals').doc(),data:{
        pipelineId:pipRef.id,
        title:`${c.car} — ${c.name.split(' ')[0]}`,
        clientId:cliRefs[i].id, clientName:c.name,
        phone:c.phone, email:c.email,
        source:c.src, stage:c.stage, amount:c.amt,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        deleted:false, tags:[], createdAt:_ts(c.d-5), updatedAt:_ts(c.d),
    }}));
    await window.safeBatchCommit(dealOps,'step-deals');

    // CRM активності
    const ACT_TEXTS = [
        'Клієнт записався на ТО, підтвердив час 11:00',
        'Прийнято авто, проведено діагностику, виявлено проблеми з підвіскою',
        'Узгоджено кошторис на ремонт, клієнт погодився',
        'Завершено ТО, авто готове до видачі',
        'Клієнт забрав авто, поставив 5★ в Google',
        'Вхідний дзвінок — хоче записатись на заміну масла',
        'Нагадування відправлено — термін ТО через тиждень',
        'Повторний клієнт — третій візит за рік',
    ];
    const actOps = cliRefs.slice(0,8).map((ref,i)=>({type:'set',ref:cr.collection('crm_activities').doc(),data:{
        clientId:ref.id, clientName:CLIENTS[i].name,
        type:['call','note','meeting','note','call','call','note','call'][i],
        text:ACT_TEXTS[i],
        date:_d(-(i+1)),
        managerId:sRefs[1].id, managerName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        createdBy:uid, createdAt:_ts(-(i+1)),
    }}));
    await window.safeBatchCommit(actOps,'step-crm-activities');

    // ── 8. ФІНАНСИ ───────────────────────────────────────────
    const finSettingsRef = cr.collection('finance_settings').doc('main');
    await finSettingsRef.set({
        isDemo:true, version:1, region:'UA', currency:'UAH', niche:'autoservice',
        initializedAt:now, initializedBy:uid, updatedAt:now,
    });

    const FIN_CATS = [
        {name:'Виручка за послуги',        type:'income',  color:'#22c55e', icon:'wrench'},
        {name:'Продаж запчастин',          type:'income',  color:'#10b981', icon:'package'},
        {name:'Закупівля запчастин',       type:'expense', color:'#ef4444', icon:'shopping-cart'},
        {name:'Зарплата майстрів',         type:'expense', color:'#f97316', icon:'users'},
        {name:'Оренда та комунальні',      type:'expense', color:'#8b5cf6', icon:'building'},
        {name:'Реклама та маркетинг',      type:'expense', color:'#ec4899', icon:'megaphone'},
        {name:'Обладнання та інструменти', type:'expense', color:'#0ea5e9', icon:'tool'},
        {name:'Інші витрати',              type:'expense', color:'#6b7280', icon:'more-horizontal'},
    ];
    const catRefs = FIN_CATS.map(()=>cr.collection('finance_categories').doc());
    await window.safeBatchCommit(
        FIN_CATS.map((c,i)=>({type:'set',ref:catRefs[i],data:{
            name:c.name, type:c.type, color:c.color, icon:c.icon,
            isDefault:false, createdBy:uid, createdAt:now,
        }})), 'step-cats'
    );

    const ACCOUNTS = [
        {name:'Приватбанк ФОП',      type:'bank', balance:284000, isDefault:true},
        {name:'Каса СТО (готівка)',  type:'cash', balance:42000,  isDefault:false},
        {name:'Monobank картка',     type:'card', balance:18500,  isDefault:false},
    ];
    const accRefs = ACCOUNTS.map(()=>cr.collection('finance_accounts').doc());
    await window.safeBatchCommit(
        ACCOUNTS.map((a,i)=>({type:'set',ref:accRefs[i],data:{
            name:a.name, type:a.type, balance:a.balance,
            currency:'UAH', isDefault:a.isDefault,
            createdBy:uid, createdAt:now,
        }})), 'step-accounts'
    );

    const TRANSACTIONS = [
        {cat:0, acc:0, amt:4800,  type:'income',  d:-1,  desc:'ТО BMW X5 — Бойко'},
        {cat:0, acc:1, amt:1840,  type:'income',  d:-1,  desc:'Ремонт Ford Focus — Марченко'},
        {cat:0, acc:0, amt:3960,  type:'income',  d:-3,  desc:'Гальма Toyota Camry — Ковальська'},
        {cat:1, acc:1, amt:2400,  type:'income',  d:-2,  desc:'Продаж масла та фільтрів'},
        {cat:2, acc:0, amt:-18400,type:'expense', d:-5,  desc:'Закупівля запчастин Bosch'},
        {cat:2, acc:0, amt:-9200, type:'expense', d:-7,  desc:'Закупівля оливи Shell 5W40'},
        {cat:3, acc:0, amt:-68000,type:'expense', d:-30, desc:'Зарплата майстрів за березень'},
        {cat:4, acc:0, amt:-22000,type:'expense', d:-30, desc:'Оренда приміщення — квітень'},
        {cat:5, acc:0, amt:-8500, type:'expense', d:-10, desc:'Google Ads — березень'},
        {cat:0, acc:0, amt:8400,  type:'income',  d:0,   desc:'Ремонт Mercedes C200 — Кравченко'},
        {cat:0, acc:0, amt:5200,  type:'income',  d:-5,  desc:'ТО Kia Sportage — Павленко'},
        {cat:6, acc:0, amt:-15000,type:'expense', d:-15, desc:'Покупка пневматичного інструменту'},
        {cat:0, acc:1, amt:2800,  type:'income',  d:-4,  desc:'Шиномонтаж + балансування'},
        {cat:0, acc:0, amt:6200,  type:'income',  d:-2,  desc:'Ремонт Audi A4 підвіска — Лисенко'},
        {cat:3, acc:0, amt:-8000, type:'expense', d:-15, desc:'Аванс майстрам — 1 половина місяця'},
    ];
    await window.safeBatchCommit(
        TRANSACTIONS.map(t=>({type:'set',ref:cr.collection('finance_transactions').doc(),data:{
            categoryId:catRefs[t.cat].id, categoryName:FIN_CATS[t.cat].name,
            accountId:accRefs[t.acc].id, accountName:ACCOUNTS[t.acc].name,
            amount:Math.abs(t.amt), type:t.type,
            description:t.desc, date:_tsF(t.d),
            createdBy:uid, createdAt:_ts(t.d), updatedAt:now,
        }})), 'step-transactions'
    );

    // Рахунки-фактури
    const INVOICES = [
        {client:'Бойко Андрій',    amount:4800,  status:'paid',    d:-1},
        {client:'Ковальська Оксана',amount:3960, status:'paid',    d:-3},
        {client:'Кравченко Юрій',  amount:8400,  status:'pending', d:3},
        {client:'Лисенко Олег',    amount:6200,  status:'pending', d:5},
        {client:'Марченко Василь', amount:1840,  status:'overdue', d:-2},
    ];
    await window.safeBatchCommit(
        INVOICES.map(inv=>({type:'set',ref:cr.collection('finance_invoices').doc(),data:{
            clientName:inv.client, amount:inv.amount, currency:'UAH',
            status:inv.status, dueDate:_d(inv.d),
            items:[{name:'Послуги СТО', qty:1, price:inv.amount}],
            functionId:fRefs[6].id, functionName:FUNCS[6].name,
            createdBy:uid, createdAt:_ts(inv.d-2), updatedAt:now,
        }})), 'step-invoices'
    );

    // ── 9. СКЛАД ─────────────────────────────────────────────
    const WAREHOUSE_LOCS = [
        {name:'Основний склад запчастин', type:'warehouse', isDefault:true},
        {name:'Стелаж з оливами',         type:'shelf',     isDefault:false},
        {name:'Каса / видаткові',         type:'mobile',    isDefault:false},
    ];
    const locRefs = WAREHOUSE_LOCS.map(()=>cr.collection('warehouse_suppliers').doc());
    // Локації зберігаємо окремо
    const wLocRefs = WAREHOUSE_LOCS.map(()=>cr.collection('warehouse_items').doc());

    const SPARE_PARTS = [
        {name:'Олива Shell Helix HX7 5W40 4л',   cat:'Оливи',       qty:24,  unit:'шт',  price:680,  min:10},
        {name:'Масляний фільтр Bosch (універс.)', cat:'Фільтри',     qty:18,  unit:'шт',  price:180,  min:10},
        {name:'Повітряний фільтр Mann',           cat:'Фільтри',     qty:12,  unit:'шт',  price:220,  min:6},
        {name:'Фільтр салону Carbon',             cat:'Фільтри',     qty:8,   unit:'шт',  price:280,  min:5},
        {name:'Гальмівні колодки Brembo перед.',  cat:'Гальма',      qty:6,   unit:'компл',price:1840,min:4},
        {name:'Гальмівні колодки Brembo зад.',    cat:'Гальма',      qty:4,   unit:'компл',price:1620,min:3},
        {name:'Гальмівний диск TRW передній',     cat:'Гальма',      qty:4,   unit:'шт',  price:1240, min:2},
        {name:'Свічки NGK Iridium (4шт)',         cat:'Запалювання', qty:10,  unit:'компл',price:840, min:4},
        {name:'Ремінь ГРМ Gates к-кт',           cat:'ГРМ',         qty:3,   unit:'компл',price:2400,min:2},
        {name:'Антифриз HEPU G12+ 5л',           cat:'Охолодження', qty:8,   unit:'шт',  price:420,  min:4},
        {name:'Гальмівна рідина DOT4 500мл',      cat:'Гальма',      qty:12,  unit:'шт',  price:180,  min:6},
        {name:'Стійка амортизатора Kayaba перед.',cat:'Підвіска',    qty:2,   unit:'шт',  price:2800, min:2},
    ];
    await window.safeBatchCommit(
        SPARE_PARTS.map(p=>({type:'set',ref:cr.collection('warehouse_items').doc(),data:{
            name:p.name, category:p.cat,
            quantity:p.qty, unit:p.unit,
            purchasePrice:p.price, salePrice:Math.round(p.price*1.3),
            minQuantity:p.min,
            locationId:'main', locationName:'Основний склад запчастин',
            status: p.qty <= p.min ? 'low_stock' : 'in_stock',
            createdBy:uid, createdAt:now, updatedAt:now,
        }})), 'step-warehouse'
    );

    // ── 10. БРОНЮВАННЯ ───────────────────────────────────────
    const bookCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookCalRef, data:{
            name:'Запис на СТО — АвтоСтар',
            slug:'autostar-zapis',
            ownerName:STAFF[1].name, ownerId:sRefs[1].id,
            duration:60, bufferBefore:10, bufferAfter:15,
            timezone:'Europe/Kiev',
            confirmationType:'manual',
            color:'#22c55e',
            location:'АвтоСтар СТО, вул. Промислова 15, Київ',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1',text:'Марка та модель авто',         type:'text',   required:true},
                {id:'q2',text:'Рік випуску',                   type:'text',   required:true},
                {id:'q3',text:'Опис проблеми або вид послуги', type:'text',   required:true},
                {id:'q4',text:'Зручний час',                   type:'select', required:false,
                 options:['09:00-11:00','11:00-13:00','13:00-15:00','15:00-17:00']},
            ],
            maxBookingsPerSlot:1, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookCalRef.id), data:{
            calendarId:bookCalRef.id,
            weeklyHours:{
                mon:[{start:'08:00',end:'18:00'}],
                tue:[{start:'08:00',end:'18:00'}],
                wed:[{start:'08:00',end:'18:00'}],
                thu:[{start:'08:00',end:'18:00'}],
                fri:[{start:'08:00',end:'18:00'}],
                sat:[{start:'09:00',end:'15:00'}],
                sun:[],
            },
            isActive:true, createdAt:now, updatedAt:now,
        }},
    ], 'step-booking');

    const BOOKINGS = [
        {client:'Бойко Андрій',    phone:'+380671111001', service:'ТО BMW X5',              d:-3, time:'11:00', status:'completed'},
        {client:'Марченко Василь', phone:'+380671111002', service:'Ремонт Ford Focus',       d:-1, time:'10:00', status:'completed'},
        {client:'Шевченко Петро',  phone:'+380671111003', service:'Заміна підвіски VW',      d:1,  time:'09:00', status:'scheduled'},
        {client:'Іванченко Михайло',phone:'+380671111004',service:'ТО Mazda CX-5',           d:2,  time:'11:00', status:'scheduled'},
        {client:'Олійник Сергій',  phone:'+380671111009', service:'Діагностика двигуна',     d:3,  time:'13:00', status:'scheduled'},
        {client:'Ткаченко Юлія',   phone:'+380671111010', service:'Шиномонтаж Hyundai',      d:2,  time:'15:00', status:'scheduled'},
    ];
    await window.safeBatchCommit(
        BOOKINGS.map(b=>({type:'set',ref:cr.collection('booking_appointments').doc(),data:{
            calendarId:bookCalRef.id,
            clientName:b.client, clientPhone:b.phone,
            serviceName:b.service,
            date:_d(b.d), time:b.time,
            duration:60, status:b.status,
            assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
            functionId:fRefs[1].id, functionName:FUNCS[1].name,
            notes:'', createdBy:uid, createdAt:_ts(b.d-1), updatedAt:now,
        }})), 'step-booking-apps'
    );

    // ── 11. КООРДИНАЦІЇ (4) ──────────────────────────────────
    const COORDS = [
        {name:'Щоденний стенд-ап',          type:'daily',   ai:0,  parts:[0,1,2,3,4], d:1,  time:'08:00'},
        {name:'Тижнева нарада команди',      type:'weekly',  ai:0,  parts:[0,1,2,5,6,7,8,9,10,11], d:7, time:'09:00'},
        {name:'Оперативка по CRM і записах', type:'weekly',  ai:1,  parts:[0,1,9], d:3, time:'09:30'},
        {name:'Нарада по закупівлях',        type:'monthly', ai:7,  parts:[0,7,8], d:14, time:'10:00'},
    ];
    await window.safeBatchCommit(
        COORDS.map(c=>({type:'set',ref:cr.collection('coordinations').doc(),data:{
            name:c.name, type:c.type,
            chairmanId:sRefs[c.ai].id, chairmanName:STAFF[c.ai].name,
            participantIds:c.parts.map(i=>sRefs[i].id),
            participantNames:c.parts.map(i=>STAFF[i].name),
            schedule:{day:null, time:c.time},
            nextDate:_d(c.d),
            agendaItems:['execution','tasks','reports'],
            functionId:fRefs[7].id, functionName:FUNCS[7].name,
            createdBy:uid, createdAt:now, updatedAt:now,
        }})), 'step-coords'
    );

    // ── 12. МЕТРИКИ ──────────────────────────────────────────
    const METRICS = [
        {name:'Виручка за тиждень',          unit:'грн',  fi:6, freq:'weekly',  vals:[112000,98000,125000,118000,145000]},
        {name:'Кількість авто за тиждень',   unit:'авто', fi:1, freq:'weekly',  vals:[42,38,48,45,52]},
        {name:'Середній чек',                unit:'грн',  fi:6, freq:'weekly',  vals:[2667,2579,2604,2622,2788]},
        {name:'Завантаженість постів',       unit:'%',    fi:7, freq:'weekly',  vals:[68,72,75,78,82]},
        {name:'NPS клієнтів',                unit:'бал',  fi:3, freq:'monthly', vals:[72,74,76,78,82]},
        {name:'Повторні клієнти',            unit:'%',    fi:0, freq:'monthly', vals:[45,48,51,54,58]},
        {name:'Середній час ремонту',        unit:'год',  fi:2, freq:'weekly',  vals:[3.2,2.9,3.1,2.8,2.7]},
        {name:'Рентабельність',              unit:'%',    fi:6, freq:'monthly', vals:[28,31,29,33,35]},
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
        const periodDays = m.freq==='weekly' ? 7 : 30;
        m.vals.forEach((val,j)=>{
            const offset = -(m.vals.length-1-j)*periodDays;
            const dt = new Date(now_ms + offset*86400000);
            const pk = m.freq==='weekly'
                ? `${dt.getFullYear()}-W${String(Math.ceil(dt.getDate()/7)).padStart(2,'0')}`
                : `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
            mOps.push({type:'set',ref:cr.collection('metricEntries').doc(),data:{
                metricId:mRefs[i].id, metricName:m.name,
                value:val, periodKey:pk, frequency:m.freq,
                scope:'company', createdBy:uid, createdAt:firebase.firestore.Timestamp.fromDate(dt),
            }});
        });
    });
    await window.safeBatchCommit(mOps,'step-metrics');

    // ── 13. СТАНДАРТИ (3) ────────────────────────────────────
    const STANDARDS = [
        {name:'Стандарт прийому авто',       fi:1, content:'1. Огляд зовнішнього стану авто (фото).\n2. Перевірка документів.\n3. Заповнення замовлення-наряду.\n4. Узгодження переліку та вартості робіт.\n5. Підпис клієнта під кошторисом.'},
        {name:'Стандарт якості ТО',          fi:2, content:'1. Перевірка за чеклістом 32 пункти.\n2. Фото до та після роботи.\n3. Тест-драйв після ремонту.\n4. Підпис майстра-контролера.'},
        {name:'Стандарт видачі авто',        fi:3, content:'1. Пояснення клієнту що було зроблено.\n2. Показ старих деталей (якщо замінювались).\n3. Рекомендації щодо наступного обслуговування.\n4. Запит відгуку в Google.'},
    ];
    await window.safeBatchCommit(
        STANDARDS.map(s=>({type:'set',ref:cr.collection('workStandards').doc(),data:{
            name:s.name, content:s.content,
            functionId:fRefs[s.fi].id, functionName:FUNCS[s.fi].name,
            createdBy:uid, createdAt:now, updatedAt:now,
        }})), 'step-standards'
    );

    // ── 14. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:'АвтоСтар СТО', niche:'autoservice',
        nicheLabel:'Автосервіс — ремонт і ТО',
        description:'СТО АвтоСтар — повний спектр послуг: ТО, ремонт, кузов, шиномонтаж. 5 майстрів, 3 підйомники, комп\'ютерна діагностика. Київ.',
        city:'Київ', currency:'UAH',
        employees:12, avgCheck:2788,
        monthlyRevenue:145000,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['autoservice'] = 'АвтоСтар СТО (Київ)';
