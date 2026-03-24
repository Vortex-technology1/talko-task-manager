// ============================================================
// 42-niche-cleaning-us.js — Клінінгова компанія (США)
// CleanPro Services — комерційне та житлове прибирання, Чикаго, IL
// 12 осіб, 8 функцій, USD
// ============================================================
'use strict';

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['cleaning_us'] = async function() {
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
        { name:'0. Маркетинг та залучення',      color:'#ec4899', desc:'Google Ads, Yelp, Thumbtack, реферальна програма, SMM' },
        { name:'1. Продажі та кошториси',         color:'#22c55e', desc:'Дзвінки, виїзд на оцінку, складання кошторису, договори' },
        { name:'2. Виконання прибирань',          color:'#3b82f6', desc:'Бригади, розклад, виїзди, контроль якості на об\'єкті' },
        { name:'3. Контроль якості та сервіс',    color:'#8b5cf6', desc:'Перевірка якості, відгуки, рекламації, NPS клієнтів' },
        { name:'4. Планування та розвиток',       color:'#f97316', desc:'Нові напрямки, комерційні контракти, партнерства' },
        { name:'5. Матеріали та обладнання',      color:'#0ea5e9', desc:'Засоби прибирання, інвентар, техніка, постачальники' },
        { name:'6. Фінанси та розрахунки',        color:'#ef4444', desc:'Виставлення рахунків, оплати, зарплата, звітність, податки' },
        { name:'7. HR та навчання персоналу',     color:'#6b7280', desc:'Найм, онбординг, навчання стандартам, мотивація, графік' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Сара Джонсон',
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
        { name:'Сара Джонсон',      role:'owner',    fi:null, pos:'Власниця / CEO' },
        { name:'Майкл Сміт',        role:'manager',  fi:1,    pos:'Менеджер з продажів' },
        { name:'Карлос Гарсія',     role:'employee', fi:2,    pos:'Старший клінер (бригадир)' },
        { name:'Марія Родрігес',    role:'employee', fi:2,    pos:'Клінер' },
        { name:'Джеймс Вілсон',     role:'employee', fi:2,    pos:'Клінер' },
        { name:'Ліза Чен',          role:'employee', fi:2,    pos:'Клінер (спеціаліст глибокого прибирання)' },
        { name:'Девід Браун',       role:'employee', fi:2,    pos:'Клінер (комерційні об\'єкти)' },
        { name:'Анна Ковальська',   role:'employee', fi:3,    pos:'Менеджер якості та клієнтів' },
        { name:'Роберт Тейлор',     role:'employee', fi:5,    pos:'Комірник / Матеріали' },
        { name:'Дженніфер Лі',      role:'employee', fi:6,    pos:'Бухгалтер' },
        { name:'Томас Мартін',      role:'employee', fi:0,    pos:'Менеджер з реклами та Yelp' },
        { name:'Патриція Уайт',     role:'employee', fi:7,    pos:'HR-менеджер' },
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
                email:s.name.toLowerCase().replace(/[\s']+/g,'.')+`@cleanpro.us`,
                functionIds:fid?[fid]:[], primaryFunctionId:fid,
                status:'active', createdAt:now, updatedAt:now,
            }});
        }
    });
    await window.safeBatchCommit(ops,'step-staff'); ops=[];

    // assigneeIds для функцій
    const faMap = {
        0:[sRefs[0].id,sRefs[10].id],
        1:[sRefs[1].id],
        2:[sRefs[2].id,sRefs[3].id,sRefs[4].id,sRefs[5].id,sRefs[6].id],
        3:[sRefs[7].id],
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
        // Власник (ai:0) — Мій день
        {t:'Переглянути фінансовий звіт за тиждень',         fi:6, ai:0, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Зустріч з корпоративним клієнтом Hilton Hotel',  fi:1, ai:0, st:'new',      pr:'high',   d:1,  tm:'14:00'},
        {t:'Підписати контракт з офісним центром Downtown',  fi:4, ai:0, st:'new',      pr:'high',   d:0,  tm:'11:00'},
        {t:'Перевірити відгуки на Yelp та Google',           fi:0, ai:0, st:'progress', pr:'medium', d:0,  tm:'10:00'},
        {t:'Затвердити графік бригад на наступний тиждень',  fi:7, ai:0, st:'new',      pr:'high',   d:1,  tm:'16:00'},
        {t:'Відновити контракт з клієнтом Thompson Family',  fi:1, ai:0, st:'new',      pr:'high',   d:-2, tm:'10:00'},
        // Команда
        {t:'Виїзд на оцінку: офіс 3000 sqft — Davis Corp',  fi:1, ai:1, st:'new',      pr:'high',   d:0,  tm:'10:00'},
        {t:'Підготувати кошторис для River North Condo',     fi:1, ai:1, st:'progress', pr:'medium', d:1,  tm:'12:00'},
        {t:'Прибирання офісу Acme Corp — щотижневе',         fi:2, ai:2, st:'new',      pr:'high',   d:0,  tm:'08:00'},
        {t:'Генеральне прибирання будинку — Johnson Family', fi:2, ai:3, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Прибирання після ремонту — Maple Street Apt',    fi:2, ai:4, st:'progress', pr:'high',   d:0,  tm:'11:00'},
        {t:'Глибоке прибирання кухні — Smith Restaurant',   fi:2, ai:5, st:'new',      pr:'medium', d:1,  tm:'07:00'},
        {t:'Комерційне прибирання — Lincoln Tower, floor 8', fi:2, ai:6, st:'new',      pr:'high',   d:0,  tm:'18:00'},
        {t:'Перевірка якості після бригади Карлоса',         fi:3, ai:7, st:'new',      pr:'high',   d:0,  tm:'13:00'},
        {t:'Замовлення засобів прибирання (Zep, Microban)',  fi:5, ai:8, st:'new',      pr:'medium', d:0,  tm:'10:00'},
        {t:'Виставити рахунки за березень — 12 клієнтів',   fi:6, ai:9, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Запустити акцію Spring Deep Clean -15%',         fi:0, ai:10,st:'progress', pr:'medium', d:2,  tm:'10:00'},
        {t:'Найм двох нових клінерів — розміщення вакансії', fi:7, ai:11,st:'new',      pr:'medium', d:3,  tm:'10:00'},
        // На перевірці
        {t:'Звіт по об\'єкту Hilton — контроль якості',     fi:3, ai:7, st:'review',   pr:'high',   d:-1, tm:'15:00'},
        // Прострочені
        {t:'Оновити страховку компанії (liability)',         fi:6, ai:0, st:'new',      pr:'high',   d:-3, tm:'10:00'},
        {t:'Відправити W-2 форми всім співробітникам',       fi:6, ai:9, st:'new',      pr:'high',   d:-1, tm:'18:00'},
        // Виконані
        {t:'Укласти контракт з Marriott Hotels (3 локації)', fi:4, ai:0, st:'done',     pr:'high',   d:-7, tm:'10:00'},
        {t:'Провести навчання для нових клінерів',           fi:7, ai:11,st:'done',     pr:'high',   d:-5, tm:'09:00'},
        {t:'Оновити профіль на Thumbtack та Yelp',           fi:0, ai:10,st:'done',     pr:'medium', d:-3, tm:'11:00'},
        {t:'Закупити новий пилосос Dyson для бригади',       fi:5, ai:8, st:'done',     pr:'medium', d:-4, tm:'10:00'},
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
        {t:'Ранковий брифінг з бригадами',              fi:2, ai:0,  type:'daily',   dows:['1','2','3','4','5'], time:'07:30', dur:15},
        {t:'Перевірка розкладу виїздів на день',         fi:2, ai:1,  type:'daily',   dows:['1','2','3','4','5','6'], time:'07:00', dur:20},
        {t:'Моніторинг відгуків Yelp / Google',          fi:0, ai:10, type:'daily',   dows:['1','2','3','4','5'], time:'09:00', dur:20},
        {t:'Виставлення рахунків за виконані роботи',    fi:6, ai:9,  type:'daily',   dows:['1','2','3','4','5'], time:'17:00', dur:30},
        {t:'Перевірка наявності засобів прибирання',     fi:5, ai:8,  type:'weekly',  dows:['1'], time:'09:00', dur:30},
        {t:'Звіт по виручці та прибутковості',           fi:6, ai:0,  type:'weekly',  dows:['5'], time:'16:00', dur:45},
        {t:'Нарада команди — підсумки тижня',            fi:7, ai:0,  type:'weekly',  dows:['5'], time:'17:00', dur:60},
        {t:'Контроль якості — вибіркова перевірка об\'єктів', fi:3, ai:7, type:'weekly', dows:['3'], time:'14:00', dur:60},
        {t:'Замовлення засобів прибирання (щотижня)',    fi:5, ai:8,  type:'weekly',  dows:['2'], time:'10:00', dur:30},
        {t:'Аналіз нових лідів та конверсії',            fi:1, ai:1,  type:'weekly',  dows:['1'], time:'10:00', dur:30},
        {t:'Розрахунок зарплат та payroll',              fi:6, ai:9,  type:'monthly', dom:'last', time:'15:00', dur:120},
        {t:'Ревізія обладнання та інвентарю',            fi:5, ai:8,  type:'monthly', dom:'1',    time:'10:00', dur:90},
        {t:'Звіт для бухгалтера (taxes quarterly)',      fi:6, ai:9,  type:'monthly', dom:'last', time:'16:00', dur:60},
        {t:'Планування маркетингових акцій на місяць',   fi:0, ai:10, type:'monthly', dom:'25',   time:'14:00', dur:45},
        {t:'Атестація нових клінерів',                   fi:7, ai:11, type:'monthly', dom:'15',   time:'10:00', dur:60},
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
            name:'Стандартне регулярне прибирання',
            fi:2, desc:'Щотижневе або двотижневе прибирання житлового об\'єкту',
            steps:[
                {id:'s1',name:'Підтвердження запису та інструктаж бригади',fi:1,dur:1,order:1},
                {id:'s2',name:'Прибуття на об\'єкт, огляд',               fi:2,dur:1,order:2},
                {id:'s3',name:'Прибирання за чеклістом',                   fi:2,dur:1,order:3},
                {id:'s4',name:'Фінальна перевірка якості',                 fi:3,dur:1,order:4},
                {id:'s5',name:'Виставлення рахунку клієнту',               fi:6,dur:1,order:5},
                {id:'s6',name:'Запит відгуку (Yelp/Google)',               fi:3,dur:1,order:6},
            ],
        },
        {
            name:'Генеральне прибирання (Deep Clean)',
            fi:2, desc:'Повне глибоке прибирання — переїзд або після ремонту',
            steps:[
                {id:'s1',name:'Виїзд на оцінку та кошторис',              fi:1,dur:1,order:1},
                {id:'s2',name:'Підписання договору, передоплата',          fi:6,dur:1,order:2},
                {id:'s3',name:'Підготовка бригади та матеріалів',          fi:5,dur:1,order:3},
                {id:'s4',name:'Глибоке прибирання (4-8 годин)',            fi:2,dur:1,order:4},
                {id:'s5',name:'Контроль якості, фото звіт',               fi:3,dur:1,order:5},
                {id:'s6',name:'Отримання фінальної оплати та відгуку',     fi:6,dur:1,order:6},
            ],
        },
        {
            name:'Комерційний контракт (офіс/бізнес)',
            fi:4, desc:'Підписання та запуск нового корпоративного контракту',
            steps:[
                {id:'s1',name:'Виїзд на об\'єкт, оцінка площі',           fi:1,dur:1,order:1},
                {id:'s2',name:'Підготовка комерційної пропозиції',         fi:1,dur:1,order:2},
                {id:'s3',name:'Переговори та підписання контракту',        fi:4,dur:2,order:3},
                {id:'s4',name:'Перший пробний виїзд бригади',              fi:2,dur:1,order:4},
                {id:'s5',name:'Оцінка зворотного зв\'язку клієнта',       fi:3,dur:1,order:5},
                {id:'s6',name:'Запуск регулярного розкладу',               fi:2,dur:1,order:6},
            ],
        },
        {
            name:'Онбординг нового клінера',
            fi:7, desc:'Введення нового співробітника в роботу',
            steps:[
                {id:'s1',name:'Оформлення документів (I-9, W-4)',          fi:7,dur:1,order:1},
                {id:'s2',name:'Навчання стандартам та хімії',              fi:7,dur:1,order:2},
                {id:'s3',name:'Робота з досвідченим клінером (shadow)',     fi:2,dur:3,order:3},
                {id:'s4',name:'Самостійний виїзд під наглядом',            fi:2,dur:2,order:4},
                {id:'s5',name:'Атестація та допуск до самостійної роботи', fi:7,dur:1,order:5},
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
        {ti:0,name:'Регулярне прибирання — Davis Family',   st:'in_progress',ai:2},
        {ti:1,name:'Deep Clean — Maple St Apt #304',        st:'in_progress',ai:5},
        {ti:2,name:'Контракт — Lincoln Tower офіс',         st:'in_progress',ai:0},
    ].forEach((p,i)=>{
        tplOps.push({type:'set',ref:procRefs[i],data:{
            templateId:tplRefs[p.ti].id, templateName:PROC_TPLS[p.ti].name,
            name:p.name, status:p.st,
            currentStep:2, totalSteps:PROC_TPLS[p.ti].steps.length,
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            functionId:fRefs[PROC_TPLS[p.ti].fi].id, functionName:FUNCS[PROC_TPLS[p.ti].fi].name,
            createdBy:uid, createdAt:_ts(-3), updatedAt:now,
        }});
    });
    await window.safeBatchCommit(tplOps,'step-procs');

    // ── 6. ПРОЄКТИ (3) ──────────────────────────────────────
    const PROJECTS = [
        {
            name:'Вихід на корпоративний ринок Чикаго',
            fi:4, budget:15000, desc:'Підписання 5+ корпоративних контрактів з офісами та готелями',
            stages:[
                {name:'Дослідження ринку та цін конкурентів', ai:0, d:7,  status:'done'},
                {name:'Розробка комерційної пропозиції',      ai:1, d:14, status:'done'},
                {name:'Холодні виклики — 50 компаній',        ai:1, d:30, status:'in_progress'},
                {name:'Переговори та підписання контрактів',  ai:0, d:45, status:'pending'},
                {name:'Запуск перших корпоративних об\'єктів',ai:2, d:60, status:'pending'},
            ],
        },
        {
            name:'Купівля комерційного авто для бригади',
            fi:4, budget:28000, desc:'Ford Transit або аналог для перевезення бригади та обладнання',
            stages:[
                {name:'Аналіз пропозицій та фінансування',   ai:0, d:14, status:'in_progress'},
                {name:'Тест-драйв та вибір моделі',          ai:0, d:21, status:'pending'},
                {name:'Оформлення страховки та документів',  ai:9, d:30, status:'pending'},
            ],
        },
        {
            name:'Запуск франчайзингу CleanPro',
            fi:4, budget:50000, desc:'Розробка франчайзингового пакету та залучення першого франчайзі',
            stages:[
                {name:'Розробка операційного мануалу',       ai:0, d:30, status:'in_progress'},
                {name:'Юридичне оформлення FDD',             ai:0, d:60, status:'pending'},
                {name:'Маркетинг франшизи',                  ai:10,d:90, status:'pending'},
                {name:'Підписання першого франчайзі',        ai:0, d:120,status:'pending'},
            ],
        },
    ];
    const projRefs = PROJECTS.map(()=>cr.collection('projects').doc());
    const projOps = [];
    PROJECTS.forEach((p,i)=>{
        projOps.push({type:'set',ref:projRefs[i],data:{
            name:p.name, description:p.desc, status:'active',
            budget:p.budget, spent:Math.round(p.budget*0.25),
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
        name:'Клієнти CleanPro',
        stages:[
            {id:'new',       label:'Новий лід',        color:'#6b7280', order:1},
            {id:'estimate',  label:'Оцінка / Кошторис', color:'#3b82f6', order:2},
            {id:'proposal',  label:'КП відправлено',    color:'#f59e0b', order:3},
            {id:'active',    label:'Активний клієнт',   color:'#22c55e', order:4},
            {id:'vip',       label:'VIP / Контракт',    color:'#8b5cf6', order:5},
            {id:'paused',    label:'Пауза',             color:'#94a3b8', order:6},
            {id:'lost',      label:'Відмова',           color:'#ef4444', order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    });

    const CLIENTS = [
        {name:'Davis Family',        phone:'+13125550001', email:'davis@gmail.com',      src:'yelp',      stage:'active',   amt:180,  d:-7,  note:'Щотижневе прибирання, будинок 2400 sqft'},
        {name:'Acme Corp',           phone:'+13125550002', email:'facilities@acme.com',  src:'referral',  stage:'vip',      amt:2400, d:-3,  note:'Офіс 8000 sqft, щотижнево, контракт до грудня'},
        {name:'Johnson Family',      phone:'+13125550003', email:'johnson@yahoo.com',    src:'google',    stage:'active',   amt:320,  d:-1,  note:'Генеральне прибирання + двотижневе регулярне'},
        {name:'Smith Restaurant',    phone:'+13125550004', email:'smith.rest@gmail.com', src:'thumbtack', stage:'active',   amt:600,  d:-5,  note:'Кухня щотижня після закриття'},
        {name:'Lincoln Tower Mgmt',  phone:'+13125550005', email:'mgmt@lincolntower.com',src:'referral',  stage:'vip',      amt:4800, d:-14, note:'Весь 8-й поверх, комерційний контракт'},
        {name:'Thompson Family',     phone:'+13125550006', email:'thompson@gmail.com',   src:'google',    stage:'paused',   amt:160,  d:-30, note:'Пауза — переїзд. Повернуться в травні'},
        {name:'Maple Street Apts',   phone:'+13125550007', email:'maple@apts.com',       src:'yelp',      stage:'active',   amt:240,  d:-2,  note:'Прибирання після кожного виселення'},
        {name:'Marriott Downtown',   phone:'+13125550008', email:'ops@marriott.com',     src:'referral',  stage:'vip',      amt:8500, d:-21, note:'3 локації, щоденне прибирання номерів'},
        {name:'Chen Family',         phone:'+13125550009', email:'chen@gmail.com',       src:'thumbtack', stage:'estimate', amt:280,  d:1,   note:'Хочуть генеральне + регулярне. Виїзд завтра'},
        {name:'Park North Office',   phone:'+13125550010', email:'admin@parknorth.com',  src:'google',    stage:'proposal', amt:1200, d:3,   note:'КП відправлено. Чекаємо рішення'},
        {name:'Williams Family',     phone:'+13125550011', email:'williams@gmail.com',   src:'yelp',      stage:'new',      amt:200,  d:2,   note:'Залишили заявку на сайті'},
        {name:'Hilton O\'Hare',      phone:'+13125550012', email:'ops@hilton.com',       src:'referral',  stage:'vip',      amt:12000,d:-45, note:'Контракт на рік — прибирання всього готелю'},
    ];
    const cliRefs = CLIENTS.map(()=>cr.collection('crm_clients').doc());
    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cliRefs[i],data:{
        name:c.name, phone:c.phone, email:c.email,
        source:c.src, status:'active', notes:c.note,
        totalSpent:c.amt*4, lastOrderDate:_d(c.d-3),
        pipelineId:pipRef.id,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        createdAt:_ts(c.d-10), updatedAt:_ts(c.d),
    }})),'step-clients');

    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cr.collection('crm_deals').doc(),data:{
        pipelineId:pipRef.id,
        title:`${c.name} — ${c.amt<=300?'Residential':'Commercial'}`,
        clientId:cliRefs[i].id, clientName:c.name,
        phone:c.phone, email:c.email,
        source:c.src, stage:c.stage,
        amount:c.amt*12,
        note:c.note,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        deleted:false, tags:[], createdAt:_ts(c.d-5), updatedAt:_ts(c.d),
    }})),'step-deals');

    // CRM активності
    const ACT_TEXTS = [
        'Клієнт підтвердив щотижневе прибирання, ключ залишає під килимком',
        'Підписано річний контракт, перший виїзд у понеділок',
        'Задоволені результатом, просять додати вікна до чеклісту',
        'Скарга на пропущену полицю — бригада повернулась та виправила',
        'VIP клієнт — порекомендував нас ще двом компаніям',
        'Запит на збільшення частоти прибирань з 1 до 2 разів на тиждень',
        'Відгук 5★ на Yelp — дуже задоволені командою',
        'Переговори щодо знижки при річному контракті',
    ];
    await window.safeBatchCommit(cliRefs.slice(0,8).map((ref,i)=>({type:'set',ref:cr.collection('crm_activities').doc(),data:{
        clientId:ref.id, clientName:CLIENTS[i].name,
        type:['call','note','call','note','meeting','call','note','meeting'][i],
        text:ACT_TEXTS[i], date:_d(-(i+1)),
        managerId:sRefs[1].id, managerName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        createdBy:uid, createdAt:_ts(-(i+1)),
    }})),'step-crm-activities');

    // ── 8. ФІНАНСИ ───────────────────────────────────────────
    await cr.collection('finance_settings').doc('main').set({
        isDemo:true, version:1, region:'US', currency:'USD', niche:'cleaning_us',
        initializedAt:now, initializedBy:uid, updatedAt:now,
    });

    const FIN_CATS = [
        {name:'Виручка — Residential',     type:'income',  color:'#22c55e', icon:'home'},
        {name:'Виручка — Commercial',      type:'income',  color:'#10b981', icon:'building'},
        {name:'Засоби та матеріали',       type:'expense', color:'#ef4444', icon:'shopping-cart'},
        {name:'Зарплата бригад',           type:'expense', color:'#f97316', icon:'users'},
        {name:'Транспортні витрати',       type:'expense', color:'#8b5cf6', icon:'truck'},
        {name:'Реклама (Google/Yelp)',     type:'expense', color:'#ec4899', icon:'megaphone'},
        {name:'Страхування та ліцензії',   type:'expense', color:'#0ea5e9', icon:'shield'},
        {name:'Інші витрати',              type:'expense', color:'#6b7280', icon:'more-horizontal'},
    ];
    const catRefs = FIN_CATS.map(()=>cr.collection('finance_categories').doc());
    await window.safeBatchCommit(FIN_CATS.map((c,i)=>({type:'set',ref:catRefs[i],data:{
        name:c.name, type:c.type, color:c.color, icon:c.icon,
        isDefault:false, createdBy:uid, createdAt:now,
    }})),'step-cats');

    const ACCOUNTS = [
        {name:'Chase Business Checking', type:'bank', balance:48200,  isDefault:true},
        {name:'Каса (Cash)',              type:'cash', balance:3400,   isDefault:false},
        {name:'Stripe (онлайн оплати)',  type:'card', balance:12800,  isDefault:false},
    ];
    const accRefs = ACCOUNTS.map(()=>cr.collection('finance_accounts').doc());
    await window.safeBatchCommit(ACCOUNTS.map((a,i)=>({type:'set',ref:accRefs[i],data:{
        name:a.name, type:a.type, balance:a.balance,
        currency:'USD', isDefault:a.isDefault,
        createdBy:uid, createdAt:now,
    }})),'step-accounts');

    const TRANSACTIONS = [
        {cat:1, acc:0, amt:2400,  type:'income',  d:-7,  desc:'Acme Corp — тижневий рахунок'},
        {cat:0, acc:2, amt:180,   type:'income',  d:-6,  desc:'Davis Family — щотижневе'},
        {cat:1, acc:0, amt:8500,  type:'income',  d:-5,  desc:'Marriott Downtown — тижневий'},
        {cat:0, acc:2, amt:320,   type:'income',  d:-4,  desc:'Johnson Family — deep clean'},
        {cat:1, acc:0, amt:4800,  type:'income',  d:-3,  desc:'Lincoln Tower — місячний'},
        {cat:0, acc:2, amt:600,   type:'income',  d:-2,  desc:'Smith Restaurant — тижневий'},
        {cat:2, acc:0, amt:-840,  type:'expense', d:-7,  desc:'Zep Professional — засоби на місяць'},
        {cat:3, acc:0, amt:-9600, type:'expense', d:-14, desc:'Зарплата бригад — 1-14 березня'},
        {cat:4, acc:0, amt:-380,  type:'expense', d:-7,  desc:'Бензин та обслуговування авто'},
        {cat:5, acc:0, amt:-650,  type:'expense', d:-10, desc:'Google Ads + Yelp Ads — березень'},
        {cat:6, acc:0, amt:-420,  type:'expense', d:-30, desc:'Liability Insurance — місячний внесок'},
        {cat:1, acc:0, amt:12000, type:'income',  d:-1,  desc:'Hilton O\'Hare — тижневий'},
        {cat:0, acc:2, amt:240,   type:'income',  d:-1,  desc:'Maple Street Apts — виселення'},
    ];
    await window.safeBatchCommit(TRANSACTIONS.map(t=>({type:'set',ref:cr.collection('finance_transactions').doc(),data:{
        categoryId:catRefs[t.cat].id, categoryName:FIN_CATS[t.cat].name,
        accountId:accRefs[t.acc].id, accountName:ACCOUNTS[t.acc].name,
        amount:Math.abs(t.amt), type:t.type,
        description:t.desc, date:_tsF(t.d),
        createdBy:uid, createdAt:_ts(t.d), updatedAt:now,
    }})),'step-transactions');

    // Рахунки-фактури
    const INVOICES = [
        {client:'Acme Corp',          amount:2400,  status:'paid',    d:-7},
        {client:'Marriott Downtown',  amount:8500,  status:'paid',    d:-5},
        {client:'Lincoln Tower Mgmt', amount:4800,  status:'paid',    d:-3},
        {client:'Hilton O\'Hare',     amount:12000, status:'pending', d:3},
        {client:'Park North Office',  amount:1200,  status:'pending', d:7},
        {client:'Smith Restaurant',   amount:600,   status:'overdue', d:-2},
    ];
    await window.safeBatchCommit(INVOICES.map(inv=>({type:'set',ref:cr.collection('finance_invoices').doc(),data:{
        clientName:inv.client, amount:inv.amount, currency:'USD',
        status:inv.status, dueDate:_d(inv.d),
        items:[{name:'Cleaning Services', qty:1, price:inv.amount}],
        functionId:fRefs[6].id, functionName:FUNCS[6].name,
        createdBy:uid, createdAt:_ts(inv.d-3), updatedAt:now,
    }})),'step-invoices');

    // ── 9. СКЛАД ─────────────────────────────────────────────
    const SUPPLIES = [
        {name:'Zep Commercial Cleaner 1gal',      cat:'Засоби',    qty:12, unit:'шт',  price:18,  min:6},
        {name:'Microban Disinfectant Spray',       cat:'Засоби',    qty:24, unit:'шт',  price:12,  min:12},
        {name:'Mr. Clean Magic Eraser (10pk)',     cat:'Засоби',    qty:8,  unit:'упак',price:15,  min:4},
        {name:'Mop Head Replacement',             cat:'Інвентар',  qty:10, unit:'шт',  price:8,   min:5},
        {name:'Microfiber Cloths (12pk)',          cat:'Інвентар',  qty:15, unit:'упак',price:22,  min:6},
        {name:'Scrub Brush Set',                  cat:'Інвентар',  qty:6,  unit:'компл',price:14, min:3},
        {name:'Vacuum Bags HEPA (3pk)',            cat:'Техніка',   qty:9,  unit:'упак',price:18,  min:4},
        {name:'Rubber Gloves (L, 12pk)',           cat:'Захист',    qty:20, unit:'упак',price:9,   min:8},
        {name:'Trash Bags 13gal (100pk)',          cat:'Витратні',  qty:8,  unit:'упак',price:16,  min:4},
        {name:'Paper Towels Commercial (6 rolls)', cat:'Витратні',  qty:14, unit:'упак',price:24,  min:6},
        {name:'Toilet Bowl Cleaner (32oz)',        cat:'Засоби',    qty:18, unit:'шт',  price:7,   min:8},
        {name:'Window Cleaner Windex 1gal',        cat:'Засоби',    qty:6,  unit:'шт',  price:14,  min:3},
    ];
    await window.safeBatchCommit(SUPPLIES.map(p=>({type:'set',ref:cr.collection('warehouse_items').doc(),data:{
        name:p.name, category:p.cat,
        quantity:p.qty, unit:p.unit,
        purchasePrice:p.price, salePrice:Math.round(p.price*1.4),
        minQuantity:p.min,
        locationId:'main', locationName:'Main Storage',
        status:p.qty<=p.min?'low_stock':'in_stock',
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-warehouse');

    // ── 10. БРОНЮВАННЯ ───────────────────────────────────────
    const bookCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookCalRef, data:{
            name:'Запис на прибирання — CleanPro Chicago',
            slug:'cleanpro-booking',
            ownerName:STAFF[1].name, ownerId:sRefs[1].id,
            duration:30, bufferBefore:10, bufferAfter:10,
            timezone:'America/Chicago',
            confirmationType:'manual',
            color:'#0ea5e9',
            location:'CleanPro Services, Chicago, IL',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1',text:'Тип об\'єкту (будинок/квартира/офіс)',  type:'select',required:true,
                 options:['Будинок','Квартира','Офіс','Інше']},
                {id:'q2',text:'Площа (sqft)',                           type:'text',  required:true},
                {id:'q3',text:'Тип прибирання',                         type:'select',required:true,
                 options:['Регулярне','Генеральне (Deep Clean)','Після ремонту','Комерційне']},
                {id:'q4',text:'Зручний час',                           type:'select',required:false,
                 options:['Ранок 8-11','День 11-14','День 14-17']},
            ],
            maxBookingsPerSlot:2, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookCalRef.id), data:{
            calendarId:bookCalRef.id,
            weeklyHours:{
                mon:[{start:'08:00',end:'17:00'}],
                tue:[{start:'08:00',end:'17:00'}],
                wed:[{start:'08:00',end:'17:00'}],
                thu:[{start:'08:00',end:'17:00'}],
                fri:[{start:'08:00',end:'17:00'}],
                sat:[{start:'09:00',end:'14:00'}],
                sun:[],
            },
            isActive:true, createdAt:now, updatedAt:now,
        }},
    ],'step-booking');

    const BOOKINGS = [
        {client:'Chen Family',      phone:'+13125550009', service:'Виїзна оцінка — Deep Clean',    d:1, time:'10:00', status:'scheduled'},
        {client:'Williams Family',  phone:'+13125550011', service:'Оцінка — Регулярне прибирання', d:2, time:'11:00', status:'scheduled'},
        {client:'Park North Office',phone:'+13125550010', service:'Виїзна оцінка офісу',           d:3, time:'14:00', status:'scheduled'},
        {client:'Davis Family',     phone:'+13125550001', service:'Щотижневе прибирання',          d:-7,time:'09:00', status:'completed'},
        {client:'Johnson Family',   phone:'+13125550003', service:'Deep Clean — будинок',          d:-4,time:'08:00', status:'completed'},
        {client:'Smith Restaurant', phone:'+13125550004', service:'Прибирання кухні',              d:-1,time:'07:00', status:'completed'},
    ];
    await window.safeBatchCommit(BOOKINGS.map(b=>({type:'set',ref:cr.collection('booking_appointments').doc(),data:{
        calendarId:bookCalRef.id,
        clientName:b.client, clientPhone:b.phone,
        serviceName:b.service,
        date:_d(b.d), time:b.time,
        duration:30, status:b.status,
        assigneeId:sRefs[1].id, assigneeName:STAFF[1].name,
        functionId:fRefs[1].id, functionName:FUNCS[1].name,
        notes:'', createdBy:uid, createdAt:_ts(b.d-1), updatedAt:now,
    }})),'step-booking-apps');

    // ── 11. КООРДИНАЦІЇ (4) ──────────────────────────────────
    await window.safeBatchCommit([
        {name:'Щоденний брифінг бригад',           type:'daily',   ai:0, parts:[0,1,2,3,4,5,6], d:1,  time:'07:30'},
        {name:'Тижнева нарада команди',             type:'weekly',  ai:0, parts:[0,1,7,9,10,11], d:7,  time:'09:00'},
        {name:'Оперативка по продажах та лідах',    type:'weekly',  ai:1, parts:[0,1,10],         d:3,  time:'10:00'},
        {name:'Нарада по фінансах та зарплаті',     type:'monthly', ai:9, parts:[0,9],            d:14, time:'14:00'},
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
        {name:'Виручка за тиждень',          unit:'$',    fi:6, freq:'weekly',  vals:[14200,12800,16400,15100,18400]},
        {name:'Кількість виїздів',           unit:'шт',   fi:2, freq:'weekly',  vals:[38,34,42,40,48]},
        {name:'Середній чек (Residential)',  unit:'$',    fi:6, freq:'weekly',  vals:[185,192,198,205,218]},
        {name:'Середній чек (Commercial)',   unit:'$',    fi:6, freq:'weekly',  vals:[2100,2400,2650,2800,3200]},
        {name:'Нові клієнти за місяць',      unit:'шт',   fi:0, freq:'monthly', vals:[4,6,5,8,9]},
        {name:'Утримання клієнтів (Retention)',unit:'%',  fi:3, freq:'monthly', vals:[78,81,83,85,88]},
        {name:'NPS клієнтів',                unit:'бал',  fi:3, freq:'monthly', vals:[74,76,79,82,86]},
        {name:'Завантаженість бригад',       unit:'%',    fi:7, freq:'weekly',  vals:[72,68,78,82,88]},
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
        const periodDays = m.freq==='weekly'?7:30;
        m.vals.forEach((val,j)=>{
            const offset = -(m.vals.length-1-j)*periodDays;
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
        {name:'Стандарт прибирання ванної кімнати', fi:2,
         content:'1. Унітаз — ззовні та всередині, Microban.\n2. Ванна/душ — скраб, Anti-soap scum.\n3. Дзеркала та скло — Windex, без розводів.\n4. Підлога — мийка з дезінфікуючим засобом.\n5. Фото для звіту.'},
        {name:'Стандарт комунікації з клієнтом',   fi:3,
         content:'1. SMS-підтвердження за 24год до виїзду.\n2. Дзвінок якщо затримка >15 хв.\n3. Фото до/після — надсилаємо клієнту.\n4. Запит відгуку через 2 години після завершення.\n5. Рекламація — реакція протягом 2 годин.'},
        {name:'Стандарт закінчення роботи',        fi:2,
         content:'1. Перевірка всіх зон за чеклістом.\n2. Вимкнути всі прилади та світло.\n3. Зачинити та перевірити замки.\n4. Фото фінального стану об\'єкту.\n5. Повідомити клієнта про завершення.'},
    ].map(s=>({type:'set',ref:cr.collection('workStandards').doc(),data:{
        name:s.name, content:s.content,
        functionId:fRefs[s.fi].id, functionName:FUNCS[s.fi].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-standards');

    // ── 14. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:'CleanPro Services', niche:'cleaning_us',
        nicheLabel:'Клінінг (США)',
        description:'CleanPro Services — комерційне та житлове прибирання в Чикаго. 5 бригад, 200+ активних клієнтів, рейтинг 4.9★ на Yelp.',
        city:'Chicago, IL', currency:'USD',
        employees:12, avgCheck:218,
        monthlyRevenue:64000,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['cleaning_us'] = 'CleanPro Services (Чикаго, США)';
