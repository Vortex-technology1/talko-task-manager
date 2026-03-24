// ============================================================
// 42-niche-horeca.js — HoReCa / Кафе-ресторан
// Кафе "Сонячне" — кафе повного циклу, Київ
// 12 осіб, 8 функцій, UAH
// ============================================================
'use strict';

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['horeca'] = async function() {
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
        { name:'0. Маркетинг та залучення гостей',  color:'#ec4899', desc:'Instagram, TripAdvisor, Glovo, акції, залучення нових гостей' },
        { name:'1. Зал та сервіс',                  color:'#22c55e', desc:'Офіціанти, якість обслуговування, відгуки, NPS гостей' },
        { name:'2. Кухня та виробництво',           color:'#f97316', desc:'Шеф, повари, приготування страв, технологічні карти, ВТК' },
        { name:'3. Контроль якості та стандарти',   color:'#6366f1', desc:'HACCP, чистота, температурний контроль, перевірки' },
        { name:'4. Планування та меню',             color:'#3b82f6', desc:'Нові страви, сезонне меню, food cost, дегустації' },
        { name:'5. Закупівля та постачання',        color:'#0ea5e9', desc:'Продукти, напої, постачальники, залишки, ревізія' },
        { name:'6. Фінанси та каса',                color:'#ef4444', desc:'Виручка, облік, каса, зарплата, P&L, звітність' },
        { name:'7. HR та персонал',                 color:'#8b5cf6', desc:'Підбір, навчання, графік, мотивація, корпоративна культура' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Наталія Бойко',
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
        { name:'Наталія Бойко',     role:'owner',    fi:null, pos:'Власниця / Директор' },
        { name:'Марина Ковальчук',  role:'manager',  fi:1,    pos:'Адміністратор залу' },
        { name:'Іван Приходько',    role:'employee', fi:2,    pos:'Шеф-кухар' },
        { name:'Оля Захарченко',    role:'employee', fi:2,    pos:'Кухар' },
        { name:'Петро Мороз',       role:'employee', fi:2,    pos:'Кухар-помічник' },
        { name:'Тетяна Бондар',     role:'employee', fi:1,    pos:'Офіціант (старший)' },
        { name:'Микола Даценко',    role:'employee', fi:1,    pos:'Офіціант' },
        { name:'Ліля Гончаренко',   role:'employee', fi:1,    pos:'Офіціант' },
        { name:'Арсен Кириленко',   role:'employee', fi:5,    pos:'Бармен / Комірник' },
        { name:'Аліна Сергієнко',   role:'employee', fi:6,    pos:'Касир / Бухгалтер' },
        { name:'Дмитро Власенко',   role:'employee', fi:0,    pos:'SMM / Менеджер доставки' },
        { name:'Ірина Павленко',    role:'employee', fi:7,    pos:'HR-менеджер' },
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
                email:s.name.toLowerCase().replace(/[\s'іїєа]+/g,'.')+`@cafe-sonychne.ua`,
                functionIds:fid?[fid]:[], primaryFunctionId:fid,
                status:'active', createdAt:now, updatedAt:now,
            }});
        }
    });
    await window.safeBatchCommit(ops,'step-staff'); ops=[];

    const faMap = {
        0:[sRefs[0].id,sRefs[10].id],
        1:[sRefs[1].id,sRefs[5].id,sRefs[6].id,sRefs[7].id],
        2:[sRefs[2].id,sRefs[3].id,sRefs[4].id],
        3:[sRefs[0].id,sRefs[1].id],
        4:[sRefs[0].id,sRefs[2].id],
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
        {t:'Перевірити виручку та P&L за тиждень',           fi:6, ai:0, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Затвердити сезонне меню — літні страви',          fi:4, ai:0, st:'new',      pr:'high',   d:1,  tm:'11:00'},
        {t:'Зустріч з постачальником фермерських продуктів',  fi:5, ai:0, st:'new',      pr:'medium', d:2,  tm:'14:00'},
        {t:'Переглянути відгуки Google Maps та TripAdvisor',  fi:0, ai:0, st:'progress', pr:'medium', d:0,  tm:'10:00'},
        {t:'Підписати договір з Glovo на доставку',           fi:0, ai:0, st:'new',      pr:'high',   d:1,  tm:'15:00'},
        {t:'Оплатити рахунок за оренду',                      fi:6, ai:0, st:'new',      pr:'high',   d:-1, tm:'12:00'},
        // Адміністратор
        {t:'Провести ранковий брифінг з персоналом',          fi:1, ai:1, st:'new',      pr:'high',   d:0,  tm:'09:30'},
        {t:'Перевірити бронювання на вечір — 3 столи',        fi:1, ai:1, st:'new',      pr:'high',   d:0,  tm:'10:00'},
        {t:'Скласти графік роботи на тиждень',                fi:7, ai:1, st:'progress', pr:'medium', d:1,  tm:'14:00'},
        // Кухня
        {t:'Підготовка заготовок на обідній сервіс',          fi:2, ai:2, st:'new',      pr:'high',   d:0,  tm:'08:00'},
        {t:'Перевірити термін придатності продуктів',         fi:3, ai:2, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Розробити 3 нові страви для літнього меню',       fi:4, ai:2, st:'progress', pr:'medium', d:3,  tm:'16:00'},
        {t:'Провести дегустацію нових страв',                 fi:4, ai:2, st:'new',      pr:'medium', d:5,  tm:'15:00'},
        // Зал
        {t:'Обслуговування вечірнього банкету (20 гостей)',   fi:1, ai:5, st:'new',      pr:'high',   d:0,  tm:'18:00'},
        {t:'Підготувати зал до корпоративу',                  fi:1, ai:6, st:'new',      pr:'high',   d:1,  tm:'10:00'},
        // Склад
        {t:'Замовлення продуктів у постачальника Свіжак',     fi:5, ai:8, st:'new',      pr:'high',   d:0,  tm:'10:00'},
        {t:'Ревізія бару та складу напоїв',                   fi:5, ai:8, st:'progress', pr:'medium', d:1,  tm:'11:00'},
        // Фінанси
        {t:'Виставити рахунок за корпоратив — ТОВ Альфа',    fi:6, ai:9, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Розрахунок зарплат за березень',                  fi:6, ai:9, st:'new',      pr:'high',   d:3,  tm:'16:00'},
        // SMM
        {t:'Публікація в Instagram — нове меню',              fi:0, ai:10,st:'progress', pr:'medium', d:0,  tm:'12:00'},
        {t:'Запустити акцію "Бізнес-ланч 99 грн"',           fi:0, ai:10,st:'new',      pr:'medium', d:2,  tm:'10:00'},
        // На перевірці
        {t:'Звіт по food cost за квітень — перевірка',        fi:6, ai:0, st:'review',   pr:'high',   d:-1, tm:'15:00'},
        // Виконані
        {t:'Запустити доставку через Bolt Food',              fi:0, ai:0, st:'done',     pr:'high',   d:-10,tm:'10:00'},
        {t:'Навчання офіціантів — стандарти сервісу',         fi:7, ai:11,st:'done',     pr:'high',   d:-5, tm:'10:00'},
        {t:'Пройти перевірку HACCP',                          fi:3, ai:0, st:'done',     pr:'high',   d:-7, tm:'10:00'},
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
        {t:'Ранковий брифінг персоналу перед відкриттям',    fi:1, ai:1,  type:'daily',  dows:['1','2','3','4','5','6','7'], time:'09:30', dur:20},
        {t:'Відкриття каси та перевірка каси',               fi:6, ai:9,  type:'daily',  dows:['1','2','3','4','5','6','7'], time:'10:00', dur:15},
        {t:'Температурний контроль холодильників (HACCP)',   fi:3, ai:2,  type:'daily',  dows:['1','2','3','4','5','6','7'], time:'08:00', dur:15},
        {t:'Публікація в Instagram / Stories',               fi:0, ai:10, type:'daily',  dows:['1','3','5','7'], time:'12:00', dur:30},
        {t:'Перевірка залишків та замовлення продуктів',     fi:5, ai:8,  type:'weekly', dows:['1','4'], time:'10:00', dur:30},
        {t:'Звіт по виручці та середньому чеку',             fi:6, ai:0,  type:'weekly', dows:['1'], time:'09:00', dur:45},
        {t:'Нарада команди — підсумки тижня',                fi:7, ai:0,  type:'weekly', dows:['2'], time:'10:00', dur:60},
        {t:'Перевірка відгуків Google / TripAdvisor',        fi:0, ai:10, type:'weekly', dows:['3'], time:'11:00', dur:20},
        {t:'Зведений звіт по food cost',                     fi:4, ai:2,  type:'weekly', dows:['5'], time:'16:00', dur:30},
        {t:'Прибирання та санітарна обробка кухні',          fi:3, ai:2,  type:'weekly', dows:['7'], time:'22:00', dur:60},
        {t:'Розрахунок зарплат та видача',                   fi:6, ai:9,  type:'monthly',dom:'last', time:'16:00', dur:90},
        {t:'Повна ревізія складу та бару',                   fi:5, ai:8,  type:'monthly',dom:'1',    time:'10:00', dur:120},
        {t:'Атестація персоналу по стандартах',              fi:7, ai:11, type:'monthly',dom:'15',   time:'10:00', dur:90},
        {t:'Аналіз меню — популярні та неприбуткові страви', fi:4, ai:0,  type:'monthly',dom:'25',   time:'15:00', dur:45},
        {t:'Перевірка та оновлення санітарних книжок',       fi:3, ai:1,  type:'monthly',dom:'1',    time:'10:00', dur:30},
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
            name:'Організація корпоративного банкету',
            fi:1, desc:'Від першого контакту до проведення заходу',
            steps:[
                {id:'s1',name:'Прийом заявки та узгодження деталей',   fi:1,dur:1,order:1},
                {id:'s2',name:'Підготовка меню та кошторису',          fi:4,dur:1,order:2},
                {id:'s3',name:'Підписання договору та передоплата',    fi:6,dur:1,order:3},
                {id:'s4',name:'Підготовка залу та сервірування',       fi:1,dur:1,order:4},
                {id:'s5',name:'Проведення заходу',                    fi:1,dur:1,order:5},
                {id:'s6',name:'Розрахунок та збір відгуку',           fi:6,dur:1,order:6},
            ],
        },
        {
            name:'Введення нової страви в меню',
            fi:4, desc:'Від ідеї до запуску в продаж',
            steps:[
                {id:'s1',name:'Розробка рецепту та технологічної карти',fi:2,dur:2,order:1},
                {id:'s2',name:'Розрахунок food cost та ціни',          fi:4,dur:1,order:2},
                {id:'s3',name:'Дегустація — оцінка команди та гостей', fi:4,dur:1,order:3},
                {id:'s4',name:'Фотосесія для меню та Instagram',       fi:0,dur:1,order:4},
                {id:'s5',name:'Навчання кухарів та офіціантів',        fi:7,dur:1,order:5},
                {id:'s6',name:'Запуск в продаж, аналіз продажів',     fi:4,dur:3,order:6},
            ],
        },
        {
            name:'Онбординг нового офіціанта',
            fi:7, desc:'Введення нового офіціанта в роботу',
            steps:[
                {id:'s1',name:'Знайомство з командою та закладом',     fi:7,dur:1,order:1},
                {id:'s2',name:'Навчання меню та стандартам сервісу',   fi:1,dur:2,order:2},
                {id:'s3',name:'Робота в парі з досвідченим офіціантом',fi:1,dur:3,order:3},
                {id:'s4',name:'Самостійна робота під наглядом',        fi:1,dur:3,order:4},
                {id:'s5',name:'Атестація та допуск',                  fi:7,dur:1,order:5},
            ],
        },
        {
            name:'Щотижнева ревізія складу',
            fi:5, desc:'Перевірка залишків та замовлення продуктів',
            steps:[
                {id:'s1',name:'Підрахунок залишків по категоріях',    fi:5,dur:1,order:1},
                {id:'s2',name:'Порівняння з нормативами food cost',   fi:4,dur:1,order:2},
                {id:'s3',name:'Формування замовлення постачальникам', fi:5,dur:1,order:3},
                {id:'s4',name:'Перевірка термінів придатності',       fi:3,dur:1,order:4},
                {id:'s5',name:'Прийом товару та оприходування',       fi:5,dur:1,order:5},
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
        {ti:0,name:'Корпоратив ТОВ Альфа — 35 гостей',    st:'in_progress',ai:1},
        {ti:1,name:'Нова страва — Бургер Сонячний',        st:'in_progress',ai:2},
        {ti:2,name:'Онбординг — новий офіціант Петрук',   st:'in_progress',ai:11},
    ].forEach((p,i)=>{
        tplOps.push({type:'set',ref:procRefs[i],data:{
            templateId:tplRefs[p.ti].id, templateName:PROC_TPLS[p.ti].name,
            name:p.name, status:p.st,
            currentStep:2, totalSteps:PROC_TPLS[p.ti].steps.length,
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            functionId:fRefs[PROC_TPLS[p.ti].fi].id, functionName:FUNCS[PROC_TPLS[p.ti].fi].name,
            createdBy:uid, createdAt:_ts(-2), updatedAt:now,
        }});
    });
    await window.safeBatchCommit(tplOps,'step-procs');

    // ── 6. ПРОЄКТИ (3) ──────────────────────────────────────
    const PROJECTS = [
        {
            name:'Відкриття літнього майданчика',
            fi:4, budget:180000, desc:'Облаштування тераси на 40 місць з дахом та обігрівачами',
            stages:[
                {name:'Дизайн-проєкт та дозволи',           ai:0, d:14, status:'done'},
                {name:'Закупівля меблів та обладнання',      ai:0, d:30, status:'in_progress'},
                {name:'Монтаж конструкцій та освітлення',   ai:0, d:45, status:'pending'},
                {name:'Декор та озеленення',                ai:1, d:55, status:'pending'},
                {name:'Відкриття сезону — промо-акція',     ai:10,d:60, status:'pending'},
            ],
        },
        {
            name:'Запуск доставки через власний сайт',
            fi:0, budget:45000, desc:'Сайт з онлайн-замовленнями та власна доставка по Оболоні',
            stages:[
                {name:'Розробка сайту з меню',              ai:0, d:21, status:'in_progress'},
                {name:'Налаштування онлайн-оплати',         ai:9, d:30, status:'pending'},
                {name:'Найм кур\'єра',                      ai:11,d:35, status:'pending'},
                {name:'Маркетинг та запуск',               ai:10,d:45, status:'pending'},
            ],
        },
        {
            name:'Отримання зірки Michelin Bib Gourmand',
            fi:4, budget:120000, desc:'Підготовка до інспекції — якість страв та сервісу на найвищому рівні',
            stages:[
                {name:'Аудит меню та food cost',             ai:0, d:30, status:'done'},
                {name:'Навчання команди з фіне дайнінгу',   ai:11,d:60, status:'in_progress'},
                {name:'Оновлення інтер\'єру',               ai:0, d:90, status:'pending'},
                {name:'PR та відомість закладу',            ai:10,d:120,status:'pending'},
                {name:'Подача заявки на розгляд',           ai:0, d:150,status:'pending'},
            ],
        },
    ];
    const projRefs = PROJECTS.map(()=>cr.collection('projects').doc());
    const projOps = [];
    PROJECTS.forEach((p,i)=>{
        projOps.push({type:'set',ref:projRefs[i],data:{
            name:p.name, description:p.desc, status:'active',
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

    // ── 7. CRM (лояльні гості / корпоративи) ─────────────────
    const pipRef = cr.collection('crm_pipeline').doc();
    await pipRef.set({
        isDemo:true, isDefault:true,
        name:'Гості та корпоративи',
        stages:[
            {id:'new',       label:'Новий запит',        color:'#6b7280', order:1},
            {id:'proposal',  label:'КП надіслано',        color:'#3b82f6', order:2},
            {id:'confirmed', label:'Підтверджено',        color:'#f59e0b', order:3},
            {id:'loyal',     label:'Лояльний гість',      color:'#22c55e', order:4},
            {id:'vip',       label:'VIP / Корпоратив',   color:'#8b5cf6', order:5},
            {id:'lost',      label:'Відмова',             color:'#ef4444', order:6},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    });

    const CLIENTS = [
        {name:'ТОВ Альфа (корпоратив)',    phone:'+380671230001', email:'office@alpha.ua',     src:'referral', stage:'vip',       amt:28000, d:-7,  note:'Щоквартальний корпоратив 35 осіб'},
        {name:'Шевченко Олена (VIP гість)',phone:'+380671230002', email:'shevch@gmail.com',    src:'instagram',stage:'loyal',     amt:4200,  d:-3,  note:'Постійна гостя, завжди столик 4'},
        {name:'ПрАТ Будінвест',           phone:'+380671230003', email:'ceo@budinvest.ua',    src:'referral', stage:'proposal',  amt:45000, d:7,   note:'Новорічний корпоратив 80 осіб — розглядають КП'},
        {name:'Коваленко Ірина',          phone:'+380671230004', email:'kovalenko@ukr.net',   src:'google',   stage:'loyal',     amt:1800,  d:-5,  note:'День народження — стіл на 8, щомісячно'},
        {name:'ФОП Петренко (ланчі)',     phone:'+380671230005', email:'petro@ukr.net',       src:'google',   stage:'loyal',     amt:3200,  d:-2,  note:'Бізнес-ланч щодня, команда 5 осіб'},
        {name:'Школа №24 (випускний)',    phone:'+380671230006', email:'school24@kyiv.ua',    src:'direct',   stage:'confirmed', amt:38000, d:30,  note:'Випускний вечір 60 осіб — підтверджено'},
        {name:'Мороз Василь (банкет)',    phone:'+380671230007', email:'moroz@gmail.com',     src:'referral', stage:'confirmed', amt:22000, d:14,  note:'Ювілей 50 років, 45 гостей'},
        {name:'Ткаченко Наталія',         phone:'+380671230008', email:'tkach@ukr.net',       src:'instagram',stage:'loyal',     amt:2100,  d:-10, note:'Любить брати з собою, частий клієнт'},
        {name:'IT компанія Девпро',       phone:'+380671230009', email:'hr@devpro.ua',        src:'referral', stage:'new',       amt:0,     d:2,   note:'Запит на щомісячні тімбілдинги'},
        {name:'Гриценко Андрій',          phone:'+380671230010', email:'gryts@gmail.com',     src:'google',   stage:'loyal',     amt:1400,  d:-4,  note:'Регулярно приходить з сім\'єю у вихідні'},
    ];
    const cliRefs = CLIENTS.map(()=>cr.collection('crm_clients').doc());
    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cliRefs[i],data:{
        name:c.name, phone:c.phone, email:c.email,
        source:c.src, status:'active', notes:c.note,
        totalSpent:c.amt, lastOrderDate:_d(c.d-1),
        pipelineId:pipRef.id,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        createdAt:_ts(c.d-10), updatedAt:_ts(c.d),
    }})),'step-clients');

    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cr.collection('crm_deals').doc(),data:{
        pipelineId:pipRef.id,
        title:c.name,
        clientId:cliRefs[i].id, clientName:c.name,
        phone:c.phone, email:c.email,
        source:c.src, stage:c.stage, amount:c.amt,
        note:c.note,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        deleted:false, tags:[], createdAt:_ts(c.d-5), updatedAt:_ts(c.d),
    }})),'step-deals');

    const ACT_TEXTS = [
        'Підтвердили корпоратив на 28 квітня, аванс 30% отримано',
        'Попросила зарезервувати улюблений столик на п\'ятницю',
        'КП надіслано на 80 осіб, чекаємо рішення директора',
        'Зателефонувала — бронь на день народження дочки',
        'Замовили нову страву — дуже задоволені, залишили чайові',
        'Підписали договір на випускний, меню погоджено',
        'Уточнив деталі декору — хоче живі квіти на столах',
        'Написала в Instagram — дякує за обслуговування, ★★★★★',
    ];
    await window.safeBatchCommit(cliRefs.slice(0,8).map((ref,i)=>({type:'set',ref:cr.collection('crm_activities').doc(),data:{
        clientId:ref.id, clientName:CLIENTS[i].name,
        type:['call','note','email','call','note','meeting','call','note'][i],
        text:ACT_TEXTS[i], date:_d(-(i+1)),
        managerId:sRefs[1].id, managerName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        createdBy:uid, createdAt:_ts(-(i+1)),
    }})),'step-crm-activities');

    // ── 8. ФІНАНСИ ───────────────────────────────────────────
    await cr.collection('finance_settings').doc('main').set({
        isDemo:true, version:1, region:'UA', currency:'UAH', niche:'horeca',
        initializedAt:now, initializedBy:uid, updatedAt:now,
    });

    const FIN_CATS = [
        {name:'Виручка — зал',          type:'income',  color:'#22c55e', icon:'utensils'},
        {name:'Виручка — доставка',     type:'income',  color:'#10b981', icon:'package'},
        {name:'Виручка — корпоративи',  type:'income',  color:'#16a34a', icon:'users'},
        {name:'Закупівля продуктів',    type:'expense', color:'#ef4444', icon:'shopping-cart'},
        {name:'Закупівля напоїв',       type:'expense', color:'#f97316', icon:'wine'},
        {name:'Зарплата персоналу',     type:'expense', color:'#8b5cf6', icon:'users'},
        {name:'Оренда та комунальні',   type:'expense', color:'#6b7280', icon:'building'},
        {name:'Реклама та маркетинг',   type:'expense', color:'#ec4899', icon:'megaphone'},
    ];
    const catRefs = FIN_CATS.map(()=>cr.collection('finance_categories').doc());
    await window.safeBatchCommit(FIN_CATS.map((c,i)=>({type:'set',ref:catRefs[i],data:{
        name:c.name, type:c.type, color:c.color, icon:c.icon,
        isDefault:false, createdBy:uid, createdAt:now,
    }})),'step-cats');

    const ACCOUNTS = [
        {name:'Монобанк ФОП Бойко',     type:'bank', balance:284000, isDefault:true},
        {name:'Каса кафе',              type:'cash', balance:18400,  isDefault:false},
        {name:'Термінал (Portmone)',    type:'card', balance:92000,  isDefault:false},
    ];
    const accRefs = ACCOUNTS.map(()=>cr.collection('finance_accounts').doc());
    await window.safeBatchCommit(ACCOUNTS.map((a,i)=>({type:'set',ref:accRefs[i],data:{
        name:a.name, type:a.type, balance:a.balance,
        currency:'UAH', isDefault:a.isDefault,
        createdBy:uid, createdAt:now,
    }})),'step-accounts');

    const TRANSACTIONS = [
        {cat:0, acc:2, amt:28400,  type:'income',  d:-1,  desc:'Виручка залу — понеділок'},
        {cat:0, acc:2, amt:42800,  type:'income',  d:-2,  desc:'Виручка залу — неділя'},
        {cat:1, acc:0, amt:8200,   type:'income',  d:-3,  desc:'Glovo + Bolt Food — тиждень'},
        {cat:2, acc:0, amt:28000,  type:'income',  d:-7,  desc:'Корпоратив ТОВ Альфа'},
        {cat:0, acc:2, amt:35600,  type:'income',  d:-3,  desc:'Виручка залу — субота'},
        {cat:3, acc:0, amt:-42000, type:'expense', d:-7,  desc:'Закупівля продуктів — тиждень'},
        {cat:4, acc:0, amt:-18000, type:'expense', d:-14, desc:'Закупівля напоїв — бар'},
        {cat:5, acc:0, amt:-128000,type:'expense', d:-14, desc:'Зарплата персоналу — 1-15 квітня'},
        {cat:6, acc:0, amt:-48000, type:'expense', d:-30, desc:'Оренда приміщення — квітень'},
        {cat:7, acc:0, amt:-12000, type:'expense', d:-10, desc:'Instagram/Google реклама'},
        {cat:0, acc:2, amt:38400,  type:'income',  d:0,   desc:'Виручка залу — поточний день'},
        {cat:3, acc:0, amt:-38000, type:'expense', d:-1,  desc:'Закупівля у постачальника Свіжак'},
    ];
    await window.safeBatchCommit(TRANSACTIONS.map(t=>({type:'set',ref:cr.collection('finance_transactions').doc(),data:{
        categoryId:catRefs[t.cat].id, categoryName:FIN_CATS[t.cat].name,
        accountId:accRefs[t.acc].id, accountName:ACCOUNTS[t.acc].name,
        amount:Math.abs(t.amt), type:t.type,
        description:t.desc, date:_tsF(t.d),
        createdBy:uid, createdAt:_ts(t.d), updatedAt:now,
    }})),'step-transactions');

    await window.safeBatchCommit([
        {client:'ТОВ Альфа',      amount:28000, status:'paid',    d:-7},
        {client:'Школа №24',      amount:38000, status:'pending', d:30},
        {client:'ПрАТ Будінвест', amount:45000, status:'pending', d:90},
        {client:'Мороз Василь',   amount:22000, status:'pending', d:14},
    ].map(inv=>({type:'set',ref:cr.collection('finance_invoices').doc(),data:{
        clientName:inv.client, amount:inv.amount, currency:'UAH',
        status:inv.status, dueDate:_d(inv.d),
        items:[{name:'Послуги кейтерингу / банкету', qty:1, price:inv.amount}],
        functionId:fRefs[6].id, functionName:FUNCS[6].name,
        createdBy:uid, createdAt:_ts(inv.d-3), updatedAt:now,
    }})),'step-invoices');

    // ── 9. СКЛАД ─────────────────────────────────────────────
    const PRODUCTS = [
        {name:'М\'ясо яловичина (охолоджена)',  cat:'М\'ясо',     qty:12,  unit:'кг',  price:280,  min:5},
        {name:'Куряче філе (охолоджене)',        cat:'М\'ясо',     qty:8,   unit:'кг',  price:160,  min:4},
        {name:'Лосось (охолоджений)',            cat:'Риба',       qty:4,   unit:'кг',  price:480,  min:2},
        {name:'Борошно пшеничне вищий ґатунок', cat:'Бакалія',    qty:20,  unit:'кг',  price:32,   min:10},
        {name:'Олія соняшникова рафінована',    cat:'Бакалія',    qty:8,   unit:'л',   price:85,   min:4},
        {name:'Яйця С0 (десяток)',              cat:'Молочка',    qty:24,  unit:'дес', price:68,   min:10},
        {name:'Вершки 33% (1л)',               cat:'Молочка',    qty:10,  unit:'л',   price:95,   min:5},
        {name:'Томати черрі (кг)',              cat:'Овочі',      qty:6,   unit:'кг',  price:120,  min:3},
        {name:'Руккола (100г)',                 cat:'Зелень',     qty:15,  unit:'пачка',price:28,  min:5},
        {name:'Пиво крафт (0.5л пляшка)',      cat:'Напої',      qty:48,  unit:'шт',  price:85,   min:20},
        {name:'Вино Шардоне (пляшка)',          cat:'Напої',      qty:12,  unit:'шт',  price:320,  min:6},
        {name:'Кава зерно (500г пачка)',        cat:'Кава/Чай',   qty:6,   unit:'пачка',price:480, min:3},
    ];
    await window.safeBatchCommit(PRODUCTS.map(p=>({type:'set',ref:cr.collection('warehouse_items').doc(),data:{
        name:p.name, category:p.cat,
        quantity:p.qty, unit:p.unit,
        purchasePrice:p.price, salePrice:Math.round(p.price*2.8),
        minQuantity:p.min,
        locationId:'main', locationName:'Склад кафе',
        status:p.qty<=p.min?'low_stock':'in_stock',
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-warehouse');

    // ── 10. БРОНЮВАННЯ СТОЛИКІВ ──────────────────────────────
    const bookCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookCalRef, data:{
            name:'Бронювання столика — Кафе Сонячне',
            slug:'cafe-sonychne-booking',
            ownerName:STAFF[1].name, ownerId:sRefs[1].id,
            duration:120, bufferBefore:15, bufferAfter:30,
            timezone:'Europe/Kiev',
            confirmationType:'manual',
            color:'#f97316',
            location:'Кафе Сонячне, вул. Оболонська 12, Київ',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1',text:'Кількість гостей',              type:'select',required:true,
                 options:['1-2','3-4','5-8','9-15','16+']},
                {id:'q2',text:'Привід (день народження, романтика, ділова зустріч тощо)',type:'text',required:false},
                {id:'q3',text:'Особливі побажання (дієта, декор)',type:'text',required:false},
                {id:'q4',text:'Час бронювання',               type:'select',required:true,
                 options:['12:00','13:00','14:00','18:00','19:00','20:00','21:00']},
            ],
            maxBookingsPerSlot:4, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookCalRef.id), data:{
            calendarId:bookCalRef.id,
            weeklyHours:{
                mon:[{start:'11:00',end:'22:00'}],
                tue:[{start:'11:00',end:'22:00'}],
                wed:[{start:'11:00',end:'22:00'}],
                thu:[{start:'11:00',end:'23:00'}],
                fri:[{start:'11:00',end:'23:00'}],
                sat:[{start:'10:00',end:'23:00'}],
                sun:[{start:'10:00',end:'22:00'}],
            },
            isActive:true, createdAt:now, updatedAt:now,
        }},
    ],'step-booking');

    await window.safeBatchCommit([
        {client:'Шевченко Олена',  phone:'+380671230002', service:'Стіл на 2, романтична вечеря',  d:2,  time:'19:00', status:'scheduled'},
        {client:'Коваленко Ірина', phone:'+380671230004', service:'День народження, стіл на 8',    d:5,  time:'18:00', status:'scheduled'},
        {client:'Гриценко Андрій', phone:'+380671230010', service:'Сімейний обід, стіл на 4',      d:7,  time:'13:00', status:'scheduled'},
        {client:'ТОВ Альфа',       phone:'+380671230001', service:'Корпоратив 35 осіб',            d:-7, time:'19:00', status:'completed'},
        {client:'Мороз Василь',    phone:'+380671230007', service:'Попередня нарада з приводу',    d:-3, time:'14:00', status:'completed'},
        {client:'ФОП Петренко',    phone:'+380671230005', service:'Бізнес-ланч, стіл на 5',        d:0,  time:'13:00', status:'scheduled'},
    ].map(b=>({type:'set',ref:cr.collection('booking_appointments').doc(),data:{
        calendarId:bookCalRef.id,
        clientName:b.client, clientPhone:b.phone,
        serviceName:b.service, date:_d(b.d), time:b.time,
        duration:120, status:b.status,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        notes:'', createdBy:uid, createdAt:_ts(b.d-1), updatedAt:now,
    }})),'step-booking-apps');

    // ── 11. КООРДИНАЦІЇ (4) ──────────────────────────────────
    await window.safeBatchCommit([
        {name:'Ранковий брифінг перед відкриттям',    type:'daily',   ai:1, parts:[0,1,2,3,4,5,6,7], d:1,  time:'09:30'},
        {name:'Тижнева нарада команди',               type:'weekly',  ai:0, parts:[0,1,2,8,9,10,11],  d:7,  time:'10:00'},
        {name:'Планування меню та food cost',         type:'weekly',  ai:0, parts:[0,2,8],             d:3,  time:'15:00'},
        {name:'Нарада по маркетингу та акціях',       type:'monthly', ai:10,parts:[0,1,10],            d:14, time:'14:00'},
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
        {name:'Виручка за тиждень',        unit:'грн', fi:6, freq:'weekly',  vals:[142000,128000,165000,158000,184000]},
        {name:'Кількість гостей за тиждень',unit:'осіб',fi:1, freq:'weekly',  vals:[420,380,480,455,520]},
        {name:'Середній чек',              unit:'грн', fi:6, freq:'weekly',  vals:[338,337,344,347,354]},
        {name:'Food cost %',               unit:'%',   fi:4, freq:'weekly',  vals:[32,34,31,33,30]},
        {name:'Завантаженість залу',        unit:'%',  fi:1, freq:'weekly',  vals:[58,52,68,65,72]},
        {name:'NPS гостей',                unit:'бал', fi:1, freq:'monthly', vals:[74,76,79,82,86]},
        {name:'Виручка доставки',          unit:'грн', fi:0, freq:'weekly',  vals:[18000,16000,22000,24000,28000]},
        {name:'Повторні гості (retention)',unit:'%',   fi:0, freq:'monthly', vals:[42,45,48,51,55]},
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
        {name:'Стандарт сервісу — зустріч гостя',  fi:1,
         content:'1. Зустріч гостя у дверях — посмішка та привітання.\n2. Супровід до столика протягом 30 сек.\n3. Меню — подати відкритим, порекомендувати топ-3 страви.\n4. Прийняти замовлення протягом 3 хвилин після розсадки.\n5. Страви — подати в правильному порядку, гарячі гарячими.'},
        {name:'Стандарт контролю якості кухні',    fi:2,
         content:'1. Температура страви перед видачею: гарячі >65°C, холодні <8°C.\n2. Зовнішній вигляд — відповідність фото технологічної карти.\n3. Порція — контроль ваги (±5%).\n4. Час приготування — не перевищувати норматив.\n5. Фіксація в журналі при відхиленнях.'},
        {name:'Стандарт закриття зміни',           fi:6,
         content:'1. Звірення каси з Z-звітом терміналу.\n2. Підрахунок готівки та здача в сейф.\n3. Заповнення журналу виручки.\n4. Перевірка чистоти залу та кухні.\n5. Звіт адміністратору по підсумках зміни.'},
    ].map(s=>({type:'set',ref:cr.collection('workStandards').doc(),data:{
        name:s.name, content:s.content,
        functionId:fRefs[s.fi].id, functionName:FUNCS[s.fi].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-standards');

    // ── 14. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:'Кафе "Сонячне"', niche:'horeca',
        nicheLabel:'HoReCa — кафе / ресторан',
        description:'Кафе "Сонячне" — затишне кафе на Оболоні. 60 місць, авторська кухня, доставка, корпоративи. Рейтинг 4.8★ на Google.',
        city:'Київ', currency:'UAH',
        employees:12, avgCheck:354,
        monthlyRevenue:740000,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['horeca'] = 'Кафе "Сонячне" (Київ)';
