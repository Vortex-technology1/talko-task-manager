// ============================================================
// 42-niche-trucking-us.js — Трак / Owner-operator (США)
// TruckPro Logistics — вантажні перевезення, Техас, США
// 12 осіб, 8 функцій, USD, українською мовою
// ============================================================
'use strict';

// Патч safeBatchCommit — автоматично додає isDemo:true до ВСІХ set операцій
(function() {
    const _orig = window.safeBatchCommit;
    if (!_orig || _orig._isPatched) return;
    window.safeBatchCommit = async function(ops, _label) {
        if (!ops || !ops.length) return;
        const markedOps = ops.map(op => {
            if (op.type === 'set' && op.data && !op.data.isDemo) {
                return { ...op, data: { ...op.data, isDemo: true } };
            }
            return op;
        });
        try { return await _orig(markedOps, _label); }
        catch(e) { console.warn('[DemoNiche] batch error', _label || '?', e.message); }
    };
    window.safeBatchCommit._isPatched = true;
})();

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['trucking_us'] = async function() {
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
        { name:'0. Маркетинг та лоад борди',          color:'#ec4899', desc:'DAT, Truckstop, брокери, холодні дзвінки, нові ліни' },
        { name:'1. Диспетчерська та планування рейсів',color:'#22c55e', desc:'Пошук вантажів, переговори з брокерами, планування маршрутів' },
        { name:'2. Водії та виконання рейсів',         color:'#f97316', desc:'OTR водії, дотримання HOS, delivery, pick-up' },
        { name:'3. Safety та Compliance',              color:'#6366f1', desc:'DOT аудити, ELD логи, інспекції, страхування, FMCSA' },
        { name:'4. Розвиток бізнесу',                 color:'#3b82f6', desc:'Нові ліни, прямі вантажовідправники, партнерства з брокерами' },
        { name:'5. Обслуговування парку (Fleet)',      color:'#0ea5e9', desc:'PM-сервіс, ремонти, шини, паливні картки, реєстрація' },
        { name:'6. Фінанси та білінг',                color:'#ef4444', desc:'Виставлення рахунків, факторинг, оплати, IFTA, payroll' },
        { name:'7. HR та найм водіїв',                color:'#8b5cf6', desc:'Рекрутинг CDL, онбординг, drug test, MVR перевірка' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Олекс Петренко',
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
        { name:'Олекс Петренко',      role:'owner',    fi:null, pos:'Owner / CEO' },
        { name:'Марина Коваль',       role:'manager',  fi:1,    pos:'Старший диспетчер' },
        { name:'Джон Сміт',          role:'employee', fi:2,    pos:'OTR Водій (CDL-A, Volvo)' },
        { name:'Карлос Мендоза',     role:'employee', fi:2,    pos:'OTR Водій (CDL-A, Peterbilt)' },
        { name:'Майкл Джонсон',      role:'employee', fi:2,    pos:'OTR Водій (CDL-A, Kenworth)' },
        { name:'Ярослав Левченко',   role:'employee', fi:2,    pos:'OTR Водій (CDL-A, Freightliner)' },
        { name:'Роберт Девіс',       role:'employee', fi:2,    pos:'Місцевий Водій (CDL-B, Box truck)' },
        { name:'Оксана Диспетчер',   role:'employee', fi:1,    pos:'Диспетчер' },
        { name:'Тоні Механік',       role:'employee', fi:5,    pos:'Fleet механік' },
        { name:'Дженніфер Білінг',   role:'employee', fi:6,    pos:'Billing / Accounting' },
        { name:'Стів Сейфті',        role:'employee', fi:3,    pos:'Safety Officer' },
        { name:'Аманда HR',          role:'employee', fi:7,    pos:'Recruiting / HR' },
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
                email:s.name.toLowerCase().replace(/[\s']+/g,'.')+`@truckpro.us`,
                functionIds:fid?[fid]:[], primaryFunctionId:fid,
                status:'active', createdAt:now, updatedAt:now,
            }});
        }
    });
    await window.safeBatchCommit(ops,'step-staff'); ops=[];

    const faMap = {
        0:[sRefs[0].id],
        1:[sRefs[1].id,sRefs[7].id],
        2:[sRefs[2].id,sRefs[3].id,sRefs[4].id,sRefs[5].id,sRefs[6].id],
        3:[sRefs[10].id],
        4:[sRefs[0].id],
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
        // Owner (ai:0) — МІЙ ДЕНЬ
        {t:'Переговори з новим брокером Coyote Logistics',    fi:4, ai:0, st:'new',      pr:'high',   d:0,  tm:'10:00'},
        {t:'Перевірити P&L та cash flow за тиждень',          fi:6, ai:0, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Перевірити ELD compliance всього парку',          fi:3, ai:0, st:'new',      pr:'high',   d:0,  tm:'14:00'},
        {t:'Підписати контракт на пряму ліну з Amazon',       fi:4, ai:0, st:'new',      pr:'high',   d:1,  tm:'14:00'},
        {t:'Поновити страховку парку — 5 траків',             fi:3, ai:0, st:'new',      pr:'high',   d:3,  tm:'10:00'},
        {t:'Подача IFTA звіту за Q1',                         fi:6, ai:0, st:'new',      pr:'high',   d:-1, tm:'17:00'},
        {t:'Зустріч з банком — кредит на новий трак',         fi:6, ai:0, st:'progress', pr:'medium', d:2,  tm:'11:00'},
        // Диспетчери
        {t:'Знайти лоад на DAT для Сміта — TX→CA',           fi:1, ai:1, st:'new',      pr:'high',   d:0,  tm:'06:00'},
        {t:'Переговори з брокером — рейт $3.20/mile',         fi:1, ai:1, st:'progress', pr:'high',   d:0,  tm:'08:00'},
        {t:'Скласти тижневий план рейсів (5 траків)',         fi:1, ai:7, st:'new',      pr:'medium', d:1,  tm:'09:00'},
        // Водії
        {t:'Рейс TX→CA — 1,450 miles, dry van, Amazon',      fi:2, ai:2, st:'progress', pr:'high',   d:0,  tm:'05:00'},
        {t:'Рейс TX→IL — 1,200 miles, reefer, Walmart',      fi:2, ai:3, st:'new',      pr:'high',   d:1,  tm:'04:00'},
        {t:'Рейс TX→FL — 1,100 miles, flatbed, Home Depot',  fi:2, ai:4, st:'new',      pr:'high',   d:0,  tm:'06:00'},
        {t:'Рейс TX→NY — 1,700 miles, dry van, Target',      fi:2, ai:5, st:'new',      pr:'high',   d:2,  tm:'05:00'},
        {t:'Місцевий розвіз по DFW — 8 зупинок',             fi:2, ai:6, st:'progress', pr:'medium', d:0,  tm:'07:00'},
        // Safety & Compliance
        {t:'Перевірка ELD логів всіх водіїв за тиждень',     fi:3, ai:10,st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'DOT інспекція — підготовка документів',           fi:3, ai:10,st:'progress', pr:'high',   d:2,  tm:'10:00'},
        {t:'Оновити MVR для Левченка (annual check)',         fi:3, ai:10,st:'new',      pr:'medium', d:3,  tm:'10:00'},
        // Fleet
        {t:'PM-сервіс Volvo (Сміт) — 15,000 miles',          fi:5, ai:8, st:'new',      pr:'high',   d:1,  tm:'08:00'},
        {t:'Замінити шини на Peterbilt (Мендоза) — зношені', fi:5, ai:8, st:'new',      pr:'high',   d:2,  tm:'09:00'},
        // Billing
        {t:'Виставити рахунки за тиждень — 8 loads',          fi:6, ai:9, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Факторинг — відправити інвойси до OTR Capital',   fi:6, ai:9, st:'new',      pr:'high',   d:0,  tm:'10:00'},
        // HR
        {t:'Інтерв\'ю — CDL-A водій (2 кандидати)',           fi:7, ai:11,st:'new',      pr:'medium', d:1,  tm:'14:00'},
        // На перевірці
        {t:'Звіт по рейсу TX→CA Сміт — підтвердити delivery',fi:2, ai:2, st:'review',   pr:'high',   d:-1, tm:'16:00'},
        // Виконані
        {t:'Отримати MC номер для нового субпідрядника',      fi:3, ai:0, st:'done',     pr:'high',   d:-10,tm:'10:00'},
        {t:'Налаштувати KeepTruckin ELD на новому траку',     fi:3, ai:10,st:'done',     pr:'high',   d:-5, tm:'09:00'},
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
        {t:'Ранковий check-in з водіями (HOS, статус)',       fi:2, ai:1,  type:'daily',  dows:['1','2','3','4','5','6','7'], time:'06:00', dur:20},
        {t:'Моніторинг DAT/Truckstop — нові лоади',          fi:1, ai:1,  type:'daily',  dows:['1','2','3','4','5','6'],    time:'07:00', dur:30},
        {t:'Перевірка ELD compliance всіх водіїв',           fi:3, ai:10, type:'daily',  dows:['1','2','3','4','5'],        time:'09:00', dur:20},
        {t:'Виставлення рахунків за виконані рейси',         fi:6, ai:9,  type:'daily',  dows:['1','2','3','4','5'],        time:'17:00', dur:30},
        {t:'Тижневий P&L звіт та cash flow',                 fi:6, ai:0,  type:'weekly', dows:['5'], time:'16:00', dur:45},
        {t:'Нарада команди — планування наступного тижня',   fi:7, ai:0,  type:'weekly', dows:['5'], time:'17:00', dur:60},
        {t:'Перевірка PM-статусу всіх траків (milage)',       fi:5, ai:8,  type:'weekly', dows:['1'], time:'08:00', dur:30},
        {t:'Аналіз rate per mile та рентабельності лін',     fi:4, ai:0,  type:'weekly', dows:['3'], time:'15:00', dur:45},
        {t:'Перевірка статусу страховки та ліцензій',        fi:3, ai:10, type:'weekly', dows:['2'], time:'10:00', dur:20},
        {t:'Замовлення паливних карт та витратних',          fi:5, ai:8,  type:'weekly', dows:['4'], time:'10:00', dur:20},
        {t:'Payroll водіїв (CPM розрахунок)',                fi:6, ai:9,  type:'monthly',dom:'last', time:'15:00', dur:90},
        {t:'IFTA звіт — паливо по штатах',                  fi:6, ai:9,  type:'monthly',dom:'last', time:'16:00', dur:60},
        {t:'Перевірка та поновлення реєстрацій траків',     fi:3, ai:10, type:'monthly',dom:'1',    time:'10:00', dur:30},
        {t:'Рекрутинг — розміщення вакансій CDL-A',         fi:7, ai:11, type:'monthly',dom:'1',    time:'10:00', dur:45},
        {t:'Перевірка MVR всіх водіїв (річна)',             fi:7, ai:11, type:'monthly',dom:'15',   time:'10:00', dur:30},
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
            name:'Стандартний OTR рейс',
            fi:2, desc:'Повний цикл від пошуку лоаду до delivery',
            steps:[
                {id:'s1',name:'Пошук лоаду на DAT/Truckstop',            fi:1,dur:1,order:1},
                {id:'s2',name:'Переговори з брокером та Rate Con',        fi:1,dur:1,order:2},
                {id:'s3',name:'Призначення водія та трака',              fi:1,dur:1,order:3},
                {id:'s4',name:'Pick-up — завантаження та BOL',           fi:2,dur:1,order:4},
                {id:'s5',name:'Рейс, ELD compliance, check calls',       fi:2,dur:2,order:5},
                {id:'s6',name:'Delivery — підпис POD',                  fi:2,dur:1,order:6},
                {id:'s7',name:'Виставлення рахунку брокеру/факторинг',  fi:6,dur:1,order:7},
            ],
        },
        {
            name:'Онбординг нового CDL-A водія',
            fi:7, desc:'Від першого контакту до першого рейсу',
            steps:[
                {id:'s1',name:'Phone screen та перевірка CDL',           fi:7,dur:1,order:1},
                {id:'s2',name:'Drug test та background check',           fi:7,dur:2,order:2},
                {id:'s3',name:'MVR та PSP перевірка',                   fi:3,dur:1,order:3},
                {id:'s4',name:'Підписання контракту та orientation',     fi:7,dur:1,order:4},
                {id:'s5',name:'ELD налаштування та інструктаж',         fi:3,dur:1,order:5},
                {id:'s6',name:'Перший supervised рейс',                 fi:2,dur:2,order:6},
            ],
        },
        {
            name:'Залучення прямого вантажовідправника',
            fi:4, desc:'Від першого контакту до підписання contract lane',
            steps:[
                {id:'s1',name:'Ідентифікація шипера та first contact',  fi:0,dur:2,order:1},
                {id:'s2',name:'Презентація та надсилання rate quote',    fi:4,dur:1,order:2},
                {id:'s3',name:'Переговори та узгодження ліни',          fi:4,dur:3,order:3},
                {id:'s4',name:'Підписання contract lane agreement',      fi:6,dur:1,order:4},
                {id:'s5',name:'Перший рейс та performance review',       fi:2,dur:1,order:5},
                {id:'s6',name:'Щомісячний review та rate adjustment',    fi:4,dur:1,order:6},
            ],
        },
        {
            name:'DOT Inspection підготовка',
            fi:3, desc:'Підготовка до планової або позапланової інспекції',
            steps:[
                {id:'s1',name:'Перевірка всіх документів (MC, DOT, ins)',fi:3,dur:1,order:1},
                {id:'s2',name:'Аудит ELD логів за 8 днів',              fi:3,dur:1,order:2},
                {id:'s3',name:'Pre-trip inspection vehicle checklist',   fi:5,dur:1,order:3},
                {id:'s4',name:'Перевірка driver qualification files',    fi:7,dur:1,order:4},
                {id:'s5',name:'Усунення виявлених невідповідностей',    fi:3,dur:2,order:5},
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
        {ti:0,name:'Рейс TX→CA — Джон Сміт, Amazon',          st:'in_progress',ai:2},
        {ti:1,name:'Онбординг — новий водій Гарсія',           st:'in_progress',ai:11},
        {ti:2,name:'Пряма ліна з Amazon Freight',              st:'in_progress',ai:0},
    ].forEach((p,i)=>{
        tplOps.push({type:'set',ref:procRefs[i],data:{
            templateId:tplRefs[p.ti].id, templateName:PROC_TPLS[p.ti].name,
            name:p.name, status:p.st,
            currentStep:4, totalSteps:PROC_TPLS[p.ti].steps.length,
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            functionId:fRefs[PROC_TPLS[p.ti].fi].id, functionName:FUNCS[PROC_TPLS[p.ti].fi].name,
            createdBy:uid, createdAt:_ts(-2), updatedAt:now,
        }});
    });
    await window.safeBatchCommit(tplOps,'step-procs');

    // ── 6. ПРОЄКТИ (3) ──────────────────────────────────────
    const PROJECTS = [
        {
            name:'Купівля 6-го трака (Kenworth T680)',
            fi:4, budget:185000, desc:'Розширення парку — новий Kenworth T680 2024, фінансування через Commercial Truck Lender',
            stages:[
                {name:'Аналіз лізингових пропозицій',          ai:0, d:14, status:'done'},
                {name:'Pre-approval від банку',                ai:9, d:21, status:'in_progress'},
                {name:'Вибір та замовлення трака у дилера',   ai:0, d:35, status:'pending'},
                {name:'Реєстрація та страхування',            ai:10,d:45, status:'pending'},
                {name:'Найм 6-го водія та перший рейс',       ai:11,d:60, status:'pending'},
            ],
        },
        {
            name:'Отримання прямих контрактів (без брокерів)',
            fi:4, budget:8000, desc:'Підписати 3+ contract lanes з прямими шиперами TX та CA',
            stages:[
                {name:'Список топ-50 шиперів у TX та CA',      ai:0, d:14, status:'done'},
                {name:'Cold calling кампанія — 50 дзвінків',  ai:0, d:30, status:'in_progress'},
                {name:'Зустрічі та презентації (10 компаній)',ai:0, d:45, status:'pending'},
                {name:'Підписання перших 3 contract lanes',   ai:0, d:60, status:'pending'},
            ],
        },
        {
            name:'Запуск власної dispatch компанії',
            fi:4, budget:25000, desc:'Відкрити dispatch service для інших owner-operators',
            stages:[
                {name:'Бізнес план та юридична структура',    ai:0, d:30, status:'in_progress'},
                {name:'Наймання 2 додаткових диспетчерів',   ai:11,d:45, status:'pending'},
                {name:'CRM та dispatch software setup',       ai:1, d:55, status:'pending'},
                {name:'Перші 5 клієнтів-owner-operators',    ai:0, d:90, status:'pending'},
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
        name:'Брокери та шипери TruckPro',
        stages:[
            {id:'new',       label:'Новий контакт',       color:'#6b7280', order:1},
            {id:'quote',     label:'Rate Quote надіслано', color:'#3b82f6', order:2},
            {id:'negotiation',label:'Переговори',          color:'#f59e0b', order:3},
            {id:'active',    label:'Активний брокер',      color:'#22c55e', order:4},
            {id:'contract',  label:'Contract Lane',        color:'#8b5cf6', order:5},
            {id:'paused',    label:'Пауза / Low rates',    color:'#94a3b8', order:6},
            {id:'lost',      label:'Не працюємо',          color:'#ef4444', order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    });

    const CLIENTS = [
        {name:'Coyote Logistics',      phone:'+18005551001', email:'ops@coyote.com',        src:'dat',      stage:'active',   amt:48000,  d:-3,  note:'Топ брокер TX-CA. Avg rate $3.40/mile. 8+ loads/місяць'},
        {name:'Echo Global Logistics', phone:'+18005551002', email:'dispatch@echo.com',     src:'truckstop',stage:'active',   amt:32000,  d:-7,  note:'TX-IL ліна. Добрі стосунки, платить на 30-й день'},
        {name:'Amazon Freight',        phone:'+18005551003', email:'freight@amazon.com',    src:'direct',   stage:'contract', amt:95000,  d:-14, note:'Contract lane TX-CA. $3.20/mile. 4 loads/тиждень!'},
        {name:'Uber Freight',          phone:'+18005551004', email:'ops@uberfreight.com',   src:'dat',      stage:'active',   amt:28000,  d:-5,  note:'Гарне застосування. Автоматичні виплати. TX-FL'},
        {name:'XPO Logistics',         phone:'+18005551005', email:'broker@xpo.com',        src:'referral', stage:'active',   amt:42000,  d:-10, note:'Reefer спеціаліст. TX-NY. $3.60/mile reefer'},
        {name:'Walmart Transportation',phone:'+18005551006', email:'trans@walmart.com',     src:'direct',   stage:'contract', amt:120000, d:-21, note:'Прямий шипер! DC Supercenter TX. 6 loads/тиждень'},
        {name:'CH Robinson',           phone:'+18005551007', email:'brokerage@chrobin.com', src:'dat',      stage:'paused',   amt:0,      d:-30, note:'Низькі рейти зараз. Можливо відновимо влітку'},
        {name:'Home Depot Supply',     phone:'+18005551008', email:'transport@homedepot.com',src:'referral',stage:'quote',    amt:0,      d:7,   note:'Flatbed спеціаліст. Надіслали rate quote. Чекаємо'},
        {name:'Total Quality Logistics',phone:'+18005551009',email:'ops@tql.com',           src:'truckstop',stage:'active',  amt:22000,  d:-4,  note:'TQL — добрий брокер для spot market. Швидкі виплати'},
        {name:'Target Corporation',    phone:'+18005551010', email:'freight@target.com',    src:'direct',   stage:'negotiation',amt:0,  d:14,  note:'Потенційний прямий шипер TX-NY. На переговорах'},
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
        title:`${c.name} — вантажні перевезення`,
        clientId:cliRefs[i].id, clientName:c.name,
        phone:c.phone, email:c.email,
        source:c.src, stage:c.stage, amount:c.amt,
        note:c.note,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        deleted:false, tags:[], createdAt:_ts(c.d-5), updatedAt:_ts(c.d),
    }})),'step-deals');

    const ACT_TEXTS = [
        'Підтвердили 3 loads на наступний тиждень TX→CA, рейт $3.40',
        'Новий лоад IL→TX — reefer, $3.80/mile. Призначили Мендозу',
        'Перший рейс по contract lane пройшов без проблем. On time delivery',
        'Uber app — прийняли 2 loads автоматично. Виплата через 2 дні',
        'XPO дав reefer TX→NY $3.65/mile. Відправили Левченка',
        'Walmart DC — підписали contract на 6 loads/тиждень. Великий клієнт!',
        'TQL spot market — взяли 1 load TX→GA $2.90. Прийнятно',
        'Home Depot — запросили на зустріч для обговорення flatbed потреб',
    ];
    await window.safeBatchCommit(cliRefs.slice(0,8).map((ref,i)=>({type:'set',ref:cr.collection('crm_activities').doc(),data:{
        clientId:ref.id, clientName:CLIENTS[i].name,
        type:['call','note','meeting','note','call','meeting','note','email'][i],
        text:ACT_TEXTS[i], date:_d(-(i+1)),
        managerId:sRefs[1].id, managerName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        createdBy:uid, createdAt:_ts(-(i+1)),
    }})),'step-crm-activities');

    // ── 8. ФІНАНСИ ───────────────────────────────────────────
    await cr.collection('finance_settings').doc('main').set({
        isDemo:true, version:1, region:'US', currency:'USD', niche:'trucking_us',
        initializedAt:now, initializedBy:uid, updatedAt:now,
    });

    const FIN_CATS = [
        {name:'Фрахт (Gross Revenue)',   type:'income',  color:'#22c55e', icon:'truck'},
        {name:'Fuel Surcharge',          type:'income',  color:'#10b981', icon:'fuel'},
        {name:'Паливо (Diesel)',         type:'expense', color:'#ef4444', icon:'fuel'},
        {name:'Driver Pay (CPM)',        type:'expense', color:'#f97316', icon:'users'},
        {name:'Truck Payment (Lease)',   type:'expense', color:'#8b5cf6', icon:'credit-card'},
        {name:'Insurance',               type:'expense', color:'#0ea5e9', icon:'shield'},
        {name:'Maintenance & Repairs',  type:'expense', color:'#6b7280', icon:'wrench'},
        {name:'Other (IFTA, fees)',      type:'expense', color:'#94a3b8', icon:'more-horizontal'},
    ];
    const catRefs = FIN_CATS.map(()=>cr.collection('finance_categories').doc());
    await window.safeBatchCommit(FIN_CATS.map((c,i)=>({type:'set',ref:catRefs[i],data:{
        name:c.name, type:c.type, color:c.color, icon:c.icon,
        isDefault:false, createdBy:uid, createdAt:now,
    }})),'step-cats');

    const ACCOUNTS = [
        {name:'Chase Business Checking',   type:'bank', balance:84200,  isDefault:true},
        {name:'OTR Capital (факторинг)',   type:'bank', balance:42800,  isDefault:false},
        {name:'Comdata Fuel Card',         type:'card', balance:8400,   isDefault:false},
    ];
    const accRefs = ACCOUNTS.map(()=>cr.collection('finance_accounts').doc());
    await window.safeBatchCommit(ACCOUNTS.map((a,i)=>({type:'set',ref:accRefs[i],data:{
        name:a.name, type:a.type, balance:a.balance,
        currency:'USD', isDefault:a.isDefault,
        createdBy:uid, createdAt:now,
    }})),'step-accounts');

    const TRANSACTIONS = [
        {cat:0, acc:1, amt:14800,  type:'income',  d:-7,  desc:'Amazon Freight — 4 loads TX→CA'},
        {cat:0, acc:1, amt:9600,   type:'income',  d:-5,  desc:'Coyote — 3 loads TX→IL'},
        {cat:0, acc:0, amt:28800,  type:'income',  d:-3,  desc:'Walmart DC — тижневий рахунок'},
        {cat:1, acc:1, amt:2400,   type:'income',  d:-3,  desc:'Fuel Surcharge — 5 траків'},
        {cat:0, acc:1, amt:12000,  type:'income',  d:-1,  desc:'XPO Reefer TX→NY — 2 loads'},
        {cat:2, acc:2, amt:-8400,  type:'expense', d:-7,  desc:'Diesel — 5 траків, тиждень'},
        {cat:3, acc:0, amt:-18000, type:'expense', d:-14, desc:'Driver Pay — 5 водіїв, $0.55 CPM'},
        {cat:4, acc:0, amt:-12500, type:'expense', d:-30, desc:'Truck Lease — 5 траків, місяць'},
        {cat:5, acc:0, amt:-4800,  type:'expense', d:-30, desc:'Cargo & Liability Insurance'},
        {cat:6, acc:0, amt:-2200,  type:'expense', d:-10, desc:'PM Service Volvo + нова шина Peterbilt'},
        {cat:7, acc:0, amt:-1800,  type:'expense', d:-30, desc:'IFTA Q1 + 2290 Heavy Use Tax'},
        {cat:0, acc:1, amt:8400,   type:'income',  d:0,   desc:'Uber Freight — поточний тиждень'},
    ];
    await window.safeBatchCommit(TRANSACTIONS.map(t=>({type:'set',ref:cr.collection('finance_transactions').doc(),data:{
        categoryId:catRefs[t.cat].id, categoryName:FIN_CATS[t.cat].name,
        accountId:accRefs[t.acc].id, accountName:ACCOUNTS[t.acc].name,
        amount:Math.abs(t.amt), type:t.type,
        description:t.desc, date:_tsF(t.d),
        createdBy:uid, createdAt:_ts(t.d), updatedAt:now,
    }})),'step-transactions');

    await window.safeBatchCommit([
        {client:'Amazon Freight',    amount:14800, status:'paid',    d:-7},
        {client:'Walmart Transportation',amount:28800,status:'paid', d:-3},
        {client:'XPO Logistics',     amount:12000, status:'pending', d:5},
        {client:'Echo Global',       amount:9600,  status:'pending', d:7},
        {client:'Total Quality Log.',amount:5400,  status:'overdue', d:-2},
    ].map(inv=>({type:'set',ref:cr.collection('finance_invoices').doc(),data:{
        clientName:inv.client, amount:inv.amount, currency:'USD',
        status:inv.status, dueDate:_d(inv.d),
        items:[{name:'Freight Transportation Services', qty:1, price:inv.amount}],
        functionId:fRefs[6].id, functionName:FUNCS[6].name,
        createdBy:uid, createdAt:_ts(inv.d-3), updatedAt:now,
    }})),'step-invoices');

    // ── 9. СКЛАД (Fleet Inventory) ────────────────────────────
    const FLEET_ITEMS = [
        {name:'Diesel Exhaust Fluid DEF (2.5 gal)',  cat:'Fluid',    qty:20,  unit:'шт',   price:12,   min:10},
        {name:'Engine Oil 15W-40 (1 gal)',           cat:'Oil',      qty:15,  unit:'gal',  price:18,   min:6},
        {name:'Oil Filter (Fleetguard LF9000)',      cat:'Filters',  qty:10,  unit:'шт',   price:24,   min:5},
        {name:'Air Filter (Baldwin PA1812)',          cat:'Filters',  qty:6,   unit:'шт',   price:48,   min:3},
        {name:'Fuel Filter (Racor 2040)',             cat:'Filters',  qty:8,   unit:'шт',   price:32,   min:4},
        {name:'Стропи вантажні 4" × 27\' (cargo strap)',cat:'Safety', qty:24, unit:'шт',  price:28,   min:10},
        {name:'Reflective Triangle Set (DOT)',       cat:'Safety',   qty:10,  unit:'компл',price:22,   min:5},
        {name:'Fire Extinguisher 2.5 lbs',          cat:'Safety',   qty:6,   unit:'шт',   price:45,   min:5},
        {name:'Logbook Paper (2-ply, 150 sets)',     cat:'Documents',qty:4,   unit:'упак', price:18,   min:2},
        {name:'Bill of Lading Blanks (100 pk)',      cat:'Documents',qty:6,   unit:'упак', price:12,   min:3},
        {name:'Comdata Fuel Card (запасна)',         cat:'Cards',    qty:3,   unit:'шт',   price:0,    min:2},
        {name:'Windshield Washer Fluid (-20°F)',     cat:'Fluid',    qty:12,  unit:'gal',  price:6,    min:5},
    ];
    await window.safeBatchCommit(FLEET_ITEMS.map(p=>({type:'set',ref:cr.collection('warehouse_items').doc(),data:{
        name:p.name, category:p.cat,
        quantity:p.qty, unit:p.unit,
        purchasePrice:p.price, salePrice:p.price,
        minQuantity:p.min,
        locationId:'main', locationName:'TruckPro Yard, Dallas TX',
        status:p.qty<=p.min?'low_stock':'in_stock',
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-warehouse');

    // ── 10. БРОНЮВАННЯ (Load Scheduling) ─────────────────────
    const bookCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookCalRef, data:{
            name:'Замовлення рейсу — TruckPro',
            slug:'truckpro-load',
            ownerName:STAFF[1].name, ownerId:sRefs[1].id,
            duration:30, bufferBefore:60, bufferAfter:60,
            timezone:'America/Chicago',
            confirmationType:'manual',
            color:'#22c55e',
            location:'TruckPro Logistics, Dallas, TX 75201',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1',text:'Маршрут (Origin → Destination)',           type:'text',   required:true},
                {id:'q2',text:'Тип трейлера',                             type:'select', required:true,
                 options:['Dry Van 53\'','Reefer 53\'','Flatbed 48\'','Step Deck','Box Truck']},
                {id:'q3',text:'Вага (lbs) та commodity',                  type:'text',   required:true},
                {id:'q4',text:'Pick-up date та delivery window',          type:'text',   required:true},
            ],
            maxBookingsPerSlot:2, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookCalRef.id), data:{
            calendarId:bookCalRef.id,
            weeklyHours:{
                mon:[{start:'05:00',end:'20:00'}],
                tue:[{start:'05:00',end:'20:00'}],
                wed:[{start:'05:00',end:'20:00'}],
                thu:[{start:'05:00',end:'20:00'}],
                fri:[{start:'05:00',end:'20:00'}],
                sat:[{start:'06:00',end:'18:00'}],
                sun:[{start:'07:00',end:'16:00'}],
            },
            isActive:true, createdAt:now, updatedAt:now,
        }},
    ],'step-booking');

    await window.safeBatchCommit([
        {client:'Amazon Freight',    phone:'+18005551003', service:'TX→CA Dry Van 48,000 lbs',    d:-7, time:'05:00', status:'completed'},
        {client:'Walmart Transportation',phone:'+18005551006',service:'TX→DC Dry Van 44,000 lbs', d:-3, time:'04:00', status:'completed'},
        {client:'Coyote Logistics',  phone:'+18005551001', service:'TX→IL Reefer 40,000 lbs',     d:1,  time:'06:00', status:'scheduled'},
        {client:'XPO Logistics',     phone:'+18005551005', service:'TX→NY Reefer 38,000 lbs',     d:2,  time:'05:00', status:'scheduled'},
        {client:'Home Depot Supply', phone:'+18005551008', service:'TX→FL Flatbed 42,000 lbs',    d:3,  time:'06:00', status:'scheduled'},
    ].map(b=>({type:'set',ref:cr.collection('booking_appointments').doc(),data:{
        calendarId:bookCalRef.id,
        clientName:b.client, clientPhone:b.phone,
        serviceName:b.service, date:_d(b.d), time:b.time,
        duration:30, status:b.status,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        notes:'', createdBy:uid, createdAt:_ts(b.d-1), updatedAt:now,
    }})),'step-booking-apps');

    // ── 11. КООРДИНАЦІЇ (4) ──────────────────────────────────
    await window.safeBatchCommit([
        {name:'Ранковий check-in з водіями',              type:'daily',   ai:1, parts:[0,1,2,3,4,5,6,7], d:1,  time:'06:00'},
        {name:'Тижнева нарада команди',                   type:'weekly',  ai:0, parts:[0,1,7,8,9,10,11],  d:7,  time:'17:00'},
        {name:'Планування лоадів на наступний тиждень',   type:'weekly',  ai:1, parts:[0,1,7],            d:5,  time:'16:00'},
        {name:'Safety & Compliance нарада',               type:'monthly', ai:10,parts:[0,5,10,11],         d:14, time:'10:00'},
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
        {name:'Gross Revenue ($/тиждень)',      unit:'$',    fi:6, freq:'weekly',  vals:[48000,42000,54000,52000,62000]},
        {name:'Miles за тиждень (5 траків)',    unit:'miles',fi:2, freq:'weekly',  vals:[18000,15000,21000,19000,24000]},
        {name:'Revenue per Mile (RPM)',         unit:'$/mile',fi:6,freq:'weekly',  vals:[2.67,2.80,2.57,2.74,2.58]},
        {name:'Fuel Cost % від Revenue',        unit:'%',    fi:6, freq:'weekly',  vals:[24,26,22,24,21]},
        {name:'On-Time Delivery Rate',          unit:'%',    fi:2, freq:'weekly',  vals:[94,90,96,95,98]},
        {name:'Empty Miles %',                  unit:'%',    fi:1, freq:'weekly',  vals:[18,22,15,17,14]},
        {name:'Net Profit Margin',             unit:'%',    fi:6, freq:'monthly', vals:[22,24,20,26,28]},
        {name:'Trucks Utilization',            unit:'%',    fi:1, freq:'weekly',  vals:[78,72,84,82,88]},
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
                ?(function(d){var dt2=new Date(d);dt2.setHours(12,0,0,0);var dow=dt2.getDay()||7;dt2.setDate(dt2.getDate()-dow+4);var y=dt2.getFullYear();var j1=new Date(y,0,1);var wn=Math.ceil(((dt2-j1)/864e5+j1.getDay()+1)/7);return y+'-W'+String(wn).padStart(2,'0');})(dt)
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
        {name:'Стандарт pre-trip інспекції',   fi:2,
         content:'1. Перевірити tire pressure та стан шин (tread depth).\n2. Перевірити рівень масла, охолоджуючої рідини, DEF.\n3. Перевірити гальма та ходову (brake adjustment).\n4. Перевірити ліхтарі, рефлектори та markers.\n5. Заповнити pre-trip form у ELD. Підпис водія.\n6. Повідомити механіка при виявленні несправності.'},
        {name:'HOS Compliance стандарт',       fi:3,
         content:'1. Property (non-passenger): 11h driving / 14h on-duty window.\n2. 30-хвилинна перерва після 8 годин driving.\n3. 10 годин відпочинку між змінами (sleeper berth).\n4. Weekly: 60h/7 days або 70h/8 days.\n5. ELD — ніяких manual edits без законної причини.\n6. Порушення HOS = Out-of-Service. Штраф до $16,000.'},
        {name:'Стандарт роботи з брокером',    fi:1,
         content:'1. Завжди отримати Rate Confirmation перед pick-up.\n2. Перевірити broker credit score на CarrierSource/Freight Validate.\n3. Мінімальний рейт: Fuel Cost + $1.50/mile чистого прибутку.\n4. Quick Pay > Net 30 завжди якщо різниця <3%.\n5. Після delivery — відправити POD протягом 24 годин.\n6. Рекламацію від брокера — вирішити протягом 48 годин.'},
    ].map(s=>({type:'set',ref:cr.collection('workStandards').doc(),data:{
        name:s.name, content:s.content,
        functionId:fRefs[s.fi].id, functionName:FUNCS[s.fi].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-standards');

    // ── 14. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:'TruckPro Logistics', niche:'trucking_us',
        nicheLabel:'Трак / Owner-operator (США)',
        description:'TruckPro Logistics — OTR перевезення по США. 5 траків (CDL-A), клієнти Amazon, Walmart, Coyote. Базується в Dallas, TX.',
        city:'Dallas, TX', currency:'USD',
        employees:12, avgCheck:3200,
        monthlyRevenue:248000,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['trucking_us'] = 'TruckPro Logistics (Dallas, TX)';
