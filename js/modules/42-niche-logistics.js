// ============================================================
// 42-niche-logistics.js — Логістика / Вантажні перевезення
// ЛогіПро Logistics — вантажні перевезення, Київ
// 12 осіб, 8 функцій, UAH
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

window._DEMO_NICHE_MAP['logistics'] = async function() {
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
        { name:'0. Маркетинг та залучення клієнтів', color:'#ec4899', desc:'Сайт, тендери, холодні дзвінки, партнерства з виробниками' },
        { name:'1. Диспетчерська та планування рейсів', color:'#22c55e', desc:'Розподіл рейсів, маршрути, відстеження, зв\'язок з водіями' },
        { name:'2. Водії та виконання рейсів',        color:'#f97316', desc:'Водії, виконання рейсів, ТТН/CMR, контроль дотримання термінів' },
        { name:'3. Контроль та якість сервісу',       color:'#6366f1', desc:'GPS-моніторинг, терміни доставки, претензії, NPS клієнтів' },
        { name:'4. Розвиток маршрутів та партнерства',color:'#3b82f6', desc:'Нові напрямки, партнери-перевізники, субпідряд' },
        { name:'5. Технічне обслуговування авто',     color:'#0ea5e9', desc:'ТО автопарку, ремонти, страхування, техогляд, запчастини' },
        { name:'6. Фінанси та розрахунки',            color:'#ef4444', desc:'Виставлення рахунків, оплата водіїв, витрати, P&L, звітність' },
        { name:'7. HR та навчання водіїв',            color:'#8b5cf6', desc:'Підбір, перевірка CDL/посвідчення, навчання, мотивація, графік' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f,i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Олексій Харченко',
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
        { name:'Олексій Харченко',  role:'owner',    fi:null, pos:'Власник / Директор' },
        { name:'Наталія Бойко',     role:'manager',  fi:1,    pos:'Старший диспетчер' },
        { name:'Микола Іваненко',   role:'employee', fi:2,    pos:'Водій (кат. CE, МАЗ)' },
        { name:'Сергій Коваленко',  role:'employee', fi:2,    pos:'Водій (кат. CE, Volvo)' },
        { name:'Андрій Петренко',   role:'employee', fi:2,    pos:'Водій (кат. CE, DAF)' },
        { name:'Василь Мороз',      role:'employee', fi:2,    pos:'Водій (кат. C, ГАЗель)' },
        { name:'Дмитро Захарченко', role:'employee', fi:2,    pos:'Водій (кат. C, ГАЗель)' },
        { name:'Олена Ткаченко',    role:'employee', fi:1,    pos:'Диспетчер' },
        { name:'Іван Лисенко',      role:'employee', fi:3,    pos:'Менеджер по роботі з клієнтами' },
        { name:'Тетяна Романенко',  role:'employee', fi:6,    pos:'Бухгалтер' },
        { name:'Юрій Савченко',     role:'employee', fi:5,    pos:'Механік / ТО автопарку' },
        { name:'Катерина Шевченко', role:'employee', fi:7,    pos:'HR-менеджер' },
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
                email:s.name.toLowerCase().replace(/[\s'іїєа]+/g,'.')+`@logipro.ua`,
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
        3:[sRefs[8].id],
        4:[sRefs[0].id],
        5:[sRefs[10].id],
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
        // Власник (ai:0) — МІЙ ДЕНЬ
        {t:'Переговори з новим клієнтом — Агропром Плюс',     fi:0, ai:0, st:'new',      pr:'high',   d:0,  tm:'11:00'},
        {t:'Перевірити P&L за березень',                      fi:6, ai:0, st:'new',      pr:'high',   d:0,  tm:'17:00'},
        {t:'Перевірити стан автопарку — технічний огляд',     fi:5, ai:0, st:'new',      pr:'medium', d:0,  tm:'09:00'},
        {t:'Підписати контракт з Нова Пошта Фрейт',           fi:4, ai:0, st:'new',      pr:'high',   d:1,  tm:'14:00'},
        {t:'Затвердити план рейсів на наступний тиждень',      fi:1, ai:0, st:'new',      pr:'medium', d:1,  tm:'09:00'},
        {t:'Зустріч з страховою компанією — поновлення',       fi:5, ai:0, st:'new',      pr:'medium', d:2,  tm:'10:00'},
        {t:'Оновити тарифи — зростання ціни дизелю',          fi:6, ai:0, st:'new',      pr:'high',   d:-1, tm:'10:00'},
        // Диспетчер
        {t:'Скласти маршрут Київ-Одеса-Київ (Іваненко)',      fi:1, ai:1, st:'new',      pr:'high',   d:0,  tm:'08:00'},
        {t:'Відстежити рейс Коваленко — Харків (затримка)',   fi:1, ai:1, st:'progress', pr:'high',   d:0,  tm:'09:00'},
        {t:'Підтвердити вантаж для Петренко — Львів',         fi:1, ai:7, st:'new',      pr:'medium', d:0,  tm:'10:00'},
        // Водії
        {t:'Рейс Київ-Дніпро — вантаж Укртелеком',           fi:2, ai:2, st:'progress', pr:'high',   d:0,  tm:'07:00'},
        {t:'Рейс Київ-Харків — 20 тон будматеріалів',        fi:2, ai:3, st:'new',      pr:'high',   d:1,  tm:'06:00'},
        {t:'Рейс Київ-Одеса — рефрижератор, продукти',       fi:2, ai:4, st:'new',      pr:'high',   d:0,  tm:'05:00'},
        {t:'Місцевий розвіз — 8 точок по Київській обл.',    fi:2, ai:5, st:'progress', pr:'medium', d:0,  tm:'08:00'},
        {t:'Місцевий розвіз — склад Бровари → магазини',     fi:2, ai:6, st:'new',      pr:'medium', d:1,  tm:'08:00'},
        // Контроль та сервіс
        {t:'Перевірити GPS-звіти за вчора (5 авто)',          fi:3, ai:8, st:'new',      pr:'medium', d:0,  tm:'09:00'},
        {t:'Обробити претензію клієнта АТБ — затримка',       fi:3, ai:8, st:'progress', pr:'high',   d:0,  tm:'10:00'},
        // Фінанси
        {t:'Виставити рахунки за тиждень — 8 клієнтів',      fi:6, ai:9, st:'new',      pr:'high',   d:0,  tm:'09:00'},
        {t:'Розрахунок зарплат водіїв за рейси',              fi:6, ai:9, st:'new',      pr:'high',   d:3,  tm:'16:00'},
        // ТО
        {t:'ТО Volvo FH (Коваленко) — 250 000 км',           fi:5, ai:10,st:'new',      pr:'high',   d:2,  tm:'09:00'},
        {t:'Замінити гуму на DAF (Петренко) — сезон',        fi:5, ai:10,st:'new',      pr:'medium', d:3,  tm:'10:00'},
        // HR
        {t:'Співбесіда — водій кат. CE (2 кандидати)',        fi:7, ai:11,st:'new',      pr:'medium', d:1,  tm:'14:00'},
        // На перевірці
        {t:'Звіт по рейсу Київ-Варшава-Київ — Іваненко',     fi:2, ai:2, st:'review',   pr:'high',   d:-1, tm:'15:00'},
        // Виконані
        {t:'Укласти договір з АТБ-Маркет',                   fi:0, ai:0, st:'done',     pr:'high',   d:-10,tm:'10:00'},
        {t:'Техогляд ГАЗелі (Мороз) — пройдено',             fi:5, ai:10,st:'done',     pr:'medium', d:-5, tm:'09:00'},
        {t:'Навчання водіїв — оновлені правила ADR',          fi:7, ai:11,st:'done',     pr:'high',   d:-7, tm:'10:00'},
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
        {t:'Ранковий брифінг водіїв та розподіл рейсів',       fi:1, ai:1,  type:'daily',  dows:['1','2','3','4','5','6'], time:'06:30', dur:30},
        {t:'Перевірка GPS та статусів усіх рейсів',            fi:3, ai:8,  type:'daily',  dows:['1','2','3','4','5','6'], time:'12:00', dur:20},
        {t:'Перевірка паливних карт та витрат',                fi:6, ai:9,  type:'daily',  dows:['1','2','3','4','5'],    time:'17:00', dur:20},
        {t:'Звіт по завершених рейсах за день',                fi:1, ai:1,  type:'daily',  dows:['1','2','3','4','5','6'], time:'20:00', dur:20},
        {t:'Планування рейсів на наступний тиждень',           fi:1, ai:0,  type:'weekly', dows:['5'], time:'15:00', dur:60},
        {t:'Звіт по виручці та витратах за тиждень',           fi:6, ai:0,  type:'weekly', dows:['5'], time:'17:00', dur:45},
        {t:'Нарада команди — підсумки тижня',                  fi:7, ai:0,  type:'weekly', dows:['6'], time:'09:00', dur:60},
        {t:'Перевірка технічного стану авто (огляд)',          fi:5, ai:10, type:'weekly', dows:['1'], time:'08:00', dur:60},
        {t:'Контроль документів водіїв (посвідчення, тахограф)',fi:7,ai:11, type:'weekly', dows:['2'], time:'10:00', dur:30},
        {t:'Аналіз ефективності маршрутів (кілометраж/виручка)',fi:4,ai:0,  type:'weekly', dows:['3'], time:'15:00', dur:45},
        {t:'Виставлення рахунків клієнтам',                    fi:6, ai:9,  type:'weekly', dows:['1'], time:'09:00', dur:60},
        {t:'Розрахунок зарплат водіїв за рейси',               fi:6, ai:9,  type:'monthly',dom:'last', time:'15:00', dur:120},
        {t:'Планове ТО згідно регламенту',                     fi:5, ai:10, type:'monthly',dom:'1',    time:'08:00', dur:240},
        {t:'Звіт для бухгалтера — ПДВ, акти',                 fi:6, ai:9,  type:'monthly',dom:'last', time:'16:00', dur:90},
        {t:'Перегляд та оновлення тарифів',                    fi:0, ai:0,  type:'monthly',dom:'1',    time:'10:00', dur:45},
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
            name:'Стандартний рейс (внутрішній)',
            fi:2, desc:'Повний цикл рейсу по Україні',
            steps:[
                {id:'s1',name:'Отримання заявки та узгодження ціни',    fi:1,dur:1,order:1},
                {id:'s2',name:'Призначення водія та авто',              fi:1,dur:1,order:2},
                {id:'s3',name:'Оформлення ТТН та документів',          fi:3,dur:1,order:3},
                {id:'s4',name:'Завантаження вантажу',                  fi:2,dur:1,order:4},
                {id:'s5',name:'Рейс та GPS-моніторинг',                fi:2,dur:1,order:5},
                {id:'s6',name:'Розвантаження та підпис ТТН',           fi:2,dur:1,order:6},
                {id:'s7',name:'Виставлення рахунку клієнту',           fi:6,dur:1,order:7},
            ],
        },
        {
            name:'Підбір та онбординг водія',
            fi:7, desc:'Прийом нового водія на роботу',
            steps:[
                {id:'s1',name:'Перевірка посвідчення та документів',   fi:7,dur:1,order:1},
                {id:'s2',name:'Медична довідка та перевірка',          fi:7,dur:2,order:2},
                {id:'s3',name:'Інструктаж з безпеки та правил',        fi:7,dur:1,order:3},
                {id:'s4',name:'Навчальний рейс з досвідченим водієм',  fi:2,dur:2,order:4},
                {id:'s5',name:'Допуск до самостійних рейсів',          fi:7,dur:1,order:5},
            ],
        },
        {
            name:'Планове ТО автомобіля',
            fi:5, desc:'Регламентне технічне обслуговування',
            steps:[
                {id:'s1',name:'Діагностика та список робіт',           fi:5,dur:1,order:1},
                {id:'s2',name:'Замовлення запчастин',                  fi:5,dur:1,order:2},
                {id:'s3',name:'Проведення ТО',                        fi:5,dur:2,order:3},
                {id:'s4',name:'Перевірка після ТО',                   fi:5,dur:1,order:4},
                {id:'s5',name:'Оновлення сервісної книги',            fi:5,dur:1,order:5},
            ],
        },
        {
            name:'Залучення нового корпоративного клієнта',
            fi:0, desc:'Від першого контакту до підписання договору',
            steps:[
                {id:'s1',name:'Перший контакт та виявлення потреб',    fi:0,dur:1,order:1},
                {id:'s2',name:'Підготовка комерційної пропозиції',     fi:0,dur:1,order:2},
                {id:'s3',name:'Презентація та переговори',             fi:0,dur:2,order:3},
                {id:'s4',name:'Узгодження тарифів та умов',           fi:6,dur:1,order:4},
                {id:'s5',name:'Підписання договору',                  fi:0,dur:1,order:5},
                {id:'s6',name:'Перший пробний рейс',                  fi:2,dur:1,order:6},
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
        {ti:0,name:'Рейс Київ-Дніпро — Укртелеком',        st:'in_progress',ai:2},
        {ti:0,name:'Рейс Київ-Харків — будматеріали',       st:'in_progress',ai:3},
        {ti:1,name:'Онбординг нового водія — Сидоренко',    st:'in_progress',ai:11},
    ].forEach((p,i)=>{
        tplOps.push({type:'set',ref:procRefs[i],data:{
            templateId:tplRefs[p.ti].id, templateName:PROC_TPLS[p.ti].name,
            name:p.name, status:p.st,
            currentStep:3, totalSteps:PROC_TPLS[p.ti].steps.length,
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            functionId:fRefs[PROC_TPLS[p.ti].fi].id, functionName:FUNCS[PROC_TPLS[p.ti].fi].name,
            createdBy:uid, createdAt:_ts(-1), updatedAt:now,
        }});
    });
    await window.safeBatchCommit(tplOps,'step-procs');

    // ── 6. ПРОЄКТИ (3) ──────────────────────────────────────
    const PROJECTS = [
        {
            name:'Купівля нової вантажівки Volvo FH (новий)',
            fi:4, budget:2800000, desc:'Розширення автопарку — 6-й магістральний тягач Volvo FH 460',
            stages:[
                {name:'Аналіз ринку та вибір комплектації',   ai:0, d:14, status:'done'},
                {name:'Переговори з дилером та фінансування', ai:0, d:30, status:'in_progress'},
                {name:'Оформлення кредиту/лізингу',          ai:9, d:45, status:'pending'},
                {name:'Отримання та реєстрація авто',        ai:0, d:60, status:'pending'},
                {name:'Допуск водія та перший рейс',         ai:11,d:70, status:'pending'},
            ],
        },
        {
            name:'Вихід на міжнародні перевезення (ЄС)',
            fi:4, budget:180000, desc:'Отримання ліцензій та перші рейси до Польщі та Румунії',
            stages:[
                {name:'Отримання ліцензії ЄКТР / CMR',       ai:0, d:30, status:'in_progress'},
                {name:'Навчання водіїв міжнародним правилам',ai:11,d:45, status:'pending'},
                {name:'Пошук перших міжнародних клієнтів',  ai:0, d:60, status:'pending'},
                {name:'Перший пробний рейс Київ-Варшава',   ai:2, d:75, status:'pending'},
            ],
        },
        {
            name:'Впровадження TMS-системи (транспортний менеджмент)',
            fi:1, budget:85000, desc:'Автоматизація планування рейсів та документообігу',
            stages:[
                {name:'Аналіз і вибір TMS-рішення',          ai:0, d:21, status:'done'},
                {name:'Налаштування та інтеграція',          ai:1, d:45, status:'in_progress'},
                {name:'Навчання диспетчерів',               ai:11,d:55, status:'pending'},
                {name:'Запуск в промислову експлуатацію',   ai:0, d:70, status:'pending'},
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
        name:'Клієнти ЛогіПро',
        stages:[
            {id:'new',       label:'Новий запит',      color:'#6b7280', order:1},
            {id:'offer',     label:'КП надіслано',      color:'#3b82f6', order:2},
            {id:'negotiation',label:'Переговори',       color:'#f59e0b', order:3},
            {id:'active',    label:'Активний клієнт',   color:'#22c55e', order:4},
            {id:'vip',       label:'VIP / Контракт',    color:'#8b5cf6', order:5},
            {id:'paused',    label:'Пауза',             color:'#94a3b8', order:6},
            {id:'lost',      label:'Відмова',           color:'#ef4444', order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    });

    const CLIENTS = [
        {name:'АТБ-Маркет',           phone:'+380441110001', email:'logistics@atb.ua',       src:'referral',  stage:'vip',        amt:280000, d:-3,  note:'Щотижневі рейси Київ-Дніпро, 40+ тон/тиждень'},
        {name:'Укртелеком',           phone:'+380441110002', email:'supply@ukrtelecom.ua',   src:'tender',    stage:'active',     amt:85000,  d:-7,  note:'Перевезення обладнання, 3-4 рейси/місяць'},
        {name:'Агропром Плюс',        phone:'+380441110003', email:'agro@agroprom.ua',       src:'referral',  stage:'negotiation',amt:120000, d:3,   note:'Зернові Полтава-Одеса, розглядають пропозицію'},
        {name:'Будівельна компанія К',phone:'+380441110004', email:'bud@bk.ua',              src:'google',    stage:'active',     amt:64000,  d:-14, note:'Будматеріали по Київській обл.'},
        {name:'Нова Пошта Фрейт',     phone:'+380441110005', email:'freight@novaposhta.ua',  src:'direct',    stage:'offer',      amt:450000, d:7,   note:'Субпідряд — регулярні рейси по всій Україні'},
        {name:'Метро Кеш Керрі',      phone:'+380441110006', email:'log@metro.ua',           src:'tender',    stage:'vip',        amt:320000, d:-21, note:'Щоденний розвіз по мережі — 8 авто'},
        {name:'ФОП Коваль',           phone:'+380441110007', email:'koval@ukr.net',          src:'direct',    stage:'active',     amt:18000,  d:-5,  note:'Разові рейси, будматеріали'},
        {name:'Ашан Україна',         phone:'+380441110008', email:'transport@auchan.ua',    src:'referral',  stage:'new',        amt:600000, d:2,   note:'Зацікавлені в субпідряді — на розгляді'},
        {name:'Фармак (фарм)',        phone:'+380441110009', email:'supply@farmak.ua',       src:'referral',  stage:'active',     amt:92000,  d:-10, note:'Фарм. вантажі, температурний режим'},
        {name:'Укрзалізниця',        phone:'+380441110010', email:'cargo@uz.gov.ua',        src:'tender',    stage:'paused',     amt:0,      d:-60, note:'Відклали рішення до другого кварталу'},
        {name:'Епіцентр К',          phone:'+380441110011', email:'logistic@epicentr.ua',   src:'direct',    stage:'active',     amt:145000, d:-4,  note:'Розвіз будматеріалів по магазинах'},
        {name:'Сільпо (Fozzy Group)', phone:'+380441110012', email:'log@fozzy.ua',           src:'referral',  stage:'vip',        amt:520000, d:-28, note:'Щоденний розвіз — 12 авто, 3 склади'},
    ];
    const cliRefs = CLIENTS.map(()=>cr.collection('crm_clients').doc());
    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cliRefs[i],data:{
        name:c.name, phone:c.phone, email:c.email,
        source:c.src, status:'active', notes:c.note,
        totalSpent:c.amt, lastOrderDate:_d(c.d-2),
        pipelineId:pipRef.id,
        assigneeId:sRefs[8].id, assigneeName:STAFF[8].name,
        createdAt:_ts(c.d-10), updatedAt:_ts(c.d),
    }})),'step-clients');

    await window.safeBatchCommit(CLIENTS.map((c,i)=>({type:'set',ref:cr.collection('crm_deals').doc(),data:{
        pipelineId:pipRef.id,
        title:`${c.name} — вантажні перевезення`,
        clientId:cliRefs[i].id, clientName:c.name,
        phone:c.phone, email:c.email,
        source:c.src, stage:c.stage, amount:c.amt,
        note:c.note,
        assigneeId:sRefs[8].id, assigneeName:STAFF[8].name,
        deleted:false, tags:[], createdAt:_ts(c.d-5), updatedAt:_ts(c.d),
    }})),'step-deals');

    const ACT_TEXTS = [
        'Підписано річний договір, тарифи погоджені, старт з 1 квітня',
        'Виконано 12 рейсів за місяць, клієнт задоволений, просить знижку при обсязі',
        'КП надіслано, чекаємо рішення керівника з логістики',
        'Претензія по затримці на 4 год — вибачились, надали знижку 5% на наступний рейс',
        'Зустріч в офісі, обговорили умови субпідряду, готуємо договір',
        'Клієнт збільшив обсяг з 4 до 8 авто — підписали доп. угоду',
        'Дзвінок — підтвердили рейс на середу, 20 тон будматеріалів',
        'Email з відповіддю на КП — хочуть обговорити ціну на великий обсяг',
    ];
    await window.safeBatchCommit(cliRefs.slice(0,8).map((ref,i)=>({type:'set',ref:cr.collection('crm_activities').doc(),data:{
        clientId:ref.id, clientName:CLIENTS[i].name,
        type:['meeting','call','email','call','meeting','note','call','email'][i],
        text:ACT_TEXTS[i], date:_d(-(i+1)),
        managerId:sRefs[8].id, managerName:STAFF[8].name,
        functionId:fRefs[0].id, functionName:FUNCS[0].name,
        createdBy:uid, createdAt:_ts(-(i+1)),
    }})),'step-crm-activities');

    // ── 8. ФІНАНСИ ───────────────────────────────────────────
    await cr.collection('finance_settings').doc('main').set({
        isDemo:true, version:1, region:'UA', currency:'UAH', niche:'logistics',
        initializedAt:now, initializedBy:uid, updatedAt:now,
    });

    const FIN_CATS = [
        {name:'Виручка за перевезення',    type:'income',  color:'#22c55e', icon:'truck'},
        {name:'Додаткові послуги',         type:'income',  color:'#10b981', icon:'plus'},
        {name:'Дизельне паливо',           type:'expense', color:'#ef4444', icon:'fuel'},
        {name:'Зарплата водіїв',           type:'expense', color:'#f97316', icon:'users'},
        {name:'ТО та ремонт авто',         type:'expense', color:'#8b5cf6', icon:'wrench'},
        {name:'Страхування та податки',    type:'expense', color:'#0ea5e9', icon:'shield'},
        {name:'Оренда стоянки / офісу',   type:'expense', color:'#6b7280', icon:'building'},
        {name:'Інші витрати',             type:'expense', color:'#94a3b8', icon:'more-horizontal'},
    ];
    const catRefs = FIN_CATS.map(()=>cr.collection('finance_categories').doc());
    await window.safeBatchCommit(FIN_CATS.map((c,i)=>({type:'set',ref:catRefs[i],data:{
        name:c.name, type:c.type, color:c.color, icon:c.icon,
        isDefault:false, createdBy:uid, createdAt:now,
    }})),'step-cats');
    await window._writeDemoDefaultFinCategories(cr, uid);

    const ACCOUNTS = [
        {name:'Приватбанк — ФОП Харченко',  type:'bank', balance:684000,  isDefault:true},
        {name:'Каса (готівка)',              type:'cash', balance:28000,   isDefault:false},
        {name:'Monobank — корпоративна',    type:'card', balance:145000,  isDefault:false},
    ];
    const accRefs = ACCOUNTS.map(()=>cr.collection('finance_accounts').doc());
    await window.safeBatchCommit(ACCOUNTS.map((a,i)=>({type:'set',ref:accRefs[i],data:{
        name:a.name, type:a.type, balance:a.balance,
        currency:'UAH', isDefault:a.isDefault,
        createdBy:uid, createdAt:now,
    }})),'step-accounts');

    const TRANSACTIONS = [
        {cat:0, acc:0, amt:280000, type:'income',  d:-7,  desc:'АТБ-Маркет — тижневий рахунок'},
        {cat:0, acc:0, amt:85000,  type:'income',  d:-10, desc:'Укртелеком — рейс обладнання'},
        {cat:0, acc:0, amt:320000, type:'income',  d:-3,  desc:'Метро — розвіз по мережі'},
        {cat:0, acc:0, amt:145000, type:'income',  d:-5,  desc:'Епіцентр — будматеріали'},
        {cat:0, acc:2, amt:18000,  type:'income',  d:-4,  desc:'ФОП Коваль — разовий рейс'},
        {cat:2, acc:0, amt:-124000,type:'expense', d:-7,  desc:'Паливо — заправка 5 авто (тиждень)'},
        {cat:3, acc:0, amt:-185000,type:'expense', d:-14, desc:'Зарплата водіїв — 1-14 березня'},
        {cat:4, acc:0, amt:-42000, type:'expense', d:-5,  desc:'ТО Volvo FH — 250 000 км'},
        {cat:5, acc:0, amt:-28000, type:'expense', d:-30, desc:'Страхування ОСЦПВ — 5 авто'},
        {cat:6, acc:0, amt:-12000, type:'expense', d:-30, desc:'Оренда стоянки — квітень'},
        {cat:0, acc:0, amt:92000,  type:'income',  d:-2,  desc:'Фармак — фарм. перевезення'},
        {cat:0, acc:0, amt:520000, type:'income',  d:-1,  desc:'Сільпо — місячний рахунок'},
        {cat:2, acc:0, amt:-98000, type:'expense', d:-1,  desc:'Паливо — поточний тиждень'},
    ];
    await window.safeBatchCommit(TRANSACTIONS.map(t=>({type:'set',ref:cr.collection('finance_transactions').doc(),data:{
        categoryId:catRefs[t.cat].id, categoryName:FIN_CATS[t.cat].name,
        accountId:accRefs[t.acc].id, accountName:ACCOUNTS[t.acc].name,
        amount:Math.abs(t.amt), type:t.type,
        description:t.desc, date:_tsF(t.d),
        createdBy:uid, createdAt:_ts(t.d), updatedAt:now,
    }})),'step-transactions');

    await window.safeBatchCommit([
        {client:'АТБ-Маркет',    amount:280000, status:'paid',    d:-7},
        {client:'Метро Кеш Керрі',amount:320000,status:'paid',    d:-3},
        {client:'Сільпо',         amount:520000, status:'pending', d:5},
        {client:'Нова Пошта Фрейт',amount:450000,status:'pending',d:10},
        {client:'Укртелеком',    amount:85000,  status:'overdue', d:-2},
    ].map(inv=>({type:'set',ref:cr.collection('finance_invoices').doc(),data:{
        clientName:inv.client, amount:inv.amount, currency:'UAH',
        status:inv.status, dueDate:_d(inv.d),
        items:[{name:'Послуги перевезення', qty:1, price:inv.amount}],
        functionId:fRefs[6].id, functionName:FUNCS[6].name,
        createdBy:uid, createdAt:_ts(inv.d-3), updatedAt:now,
    }})),'step-invoices');

    // ── 9. СКЛАД (запчастини та витратні) ────────────────────
    const PARTS = [
        {name:'Дизельне паливо (талони WOG)',   cat:'Паливо',     qty:150, unit:'л',   price:48,   min:100},
        {name:'Моторна олива Shell Rimula 10л', cat:'Оливи',      qty:8,   unit:'каністра',price:980,min:4},
        {name:'Фільтр паливний (Volvo FH)',     cat:'Фільтри',    qty:4,   unit:'шт',  price:620,  min:2},
        {name:'Фільтр повітряний (DAF CF)',     cat:'Фільтри',    qty:3,   unit:'шт',  price:840,  min:2},
        {name:'Гальмівні колодки осі (ун-с)',  cat:'Гальма',     qty:4,   unit:'компл',price:2800,min:2},
        {name:'Ремінь приводу (ГАЗель Next)',   cat:'ДВЗ',        qty:2,   unit:'шт',  price:480,  min:1},
        {name:'Щітки склоочисника (600мм)',     cat:'Витратні',   qty:10,  unit:'шт',  price:120,  min:4},
        {name:'Антифриз HEPU G12 20л',          cat:'Охолодження',qty:3,   unit:'каністра',price:640,min:2},
        {name:'Тахограф картка (водія)',        cat:'Документи',  qty:6,   unit:'шт',  price:280,  min:3},
        {name:'Бланки ТТН (100шт)',             cat:'Документи',  qty:5,   unit:'блок',price:80,   min:2},
        {name:'Сигнальні жилети (клас 2)',      cat:'Безпека',    qty:8,   unit:'шт',  price:180,  min:5},
        {name:'Аптечка автомобільна',           cat:'Безпека',    qty:5,   unit:'шт',  price:320,  min:5},
    ];
    await window.safeBatchCommit(PARTS.map(p=>({type:'set',ref:cr.collection('warehouse_items').doc(),data:{
        name:p.name, category:p.cat,
        quantity:p.qty, unit:p.unit,
        purchasePrice:p.price, salePrice:Math.round(p.price*1.15),
        minQuantity:p.min,
        locationId:'main', locationName:'Склад ЛогіПро',
        status:p.qty<=p.min?'low_stock':'in_stock',
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-warehouse');

    // ── 10. БРОНЮВАННЯ (слот для погодження рейсу) ───────────
    const bookCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookCalRef, data:{
            name:'Замовлення рейсу — ЛогіПро',
            slug:'logipro-booking',
            ownerName:STAFF[1].name, ownerId:sRefs[1].id,
            duration:30, bufferBefore:15, bufferAfter:15,
            timezone:'Europe/Kiev',
            confirmationType:'manual',
            color:'#22c55e',
            location:'ЛогіПро Logistics, Київ',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1',text:'Маршрут (звідки — куди)',               type:'text',   required:true},
                {id:'q2',text:'Тип вантажу та вага (тон)',             type:'text',   required:true},
                {id:'q3',text:'Тип кузова',                            type:'select', required:true,
                 options:['Тент (шторний)','Рефрижератор','Борт','Контейнер','Цистерна']},
                {id:'q4',text:'Бажана дата навантаження',             type:'text',   required:false},
            ],
            maxBookingsPerSlot:3, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookCalRef.id), data:{
            calendarId:bookCalRef.id,
            weeklyHours:{
                mon:[{start:'07:00',end:'20:00'}],
                tue:[{start:'07:00',end:'20:00'}],
                wed:[{start:'07:00',end:'20:00'}],
                thu:[{start:'07:00',end:'20:00'}],
                fri:[{start:'07:00',end:'20:00'}],
                sat:[{start:'08:00',end:'16:00'}],
                sun:[{start:'09:00',end:'14:00'}],
            },
            isActive:true, createdAt:now, updatedAt:now,
        }},
    ],'step-booking');

    await window.safeBatchCommit([
        {client:'АТБ-Маркет',    phone:'+380441110001', service:'Рейс Київ-Дніпро, 40т тент',    d:-3, time:'08:00', status:'completed'},
        {client:'Укртелеком',    phone:'+380441110002', service:'Рейс Київ-Харків, обладнання',  d:-7, time:'07:00', status:'completed'},
        {client:'Агропром Плюс', phone:'+380441110003', service:'Рейс Полтава-Одеса, зерно',     d:2,  time:'06:00', status:'scheduled'},
        {client:'Фармак',        phone:'+380441110009', service:'Рейс Київ-Львів, рефрижератор', d:1,  time:'07:00', status:'scheduled'},
        {client:'Епіцентр К',    phone:'+380441110011', service:'Розвіз будматеріалів — Київ',   d:0,  time:'08:00', status:'scheduled'},
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
        {name:'Ранковий брифінг водіїв',           type:'daily',   ai:1, parts:[0,1,2,3,4,5,6,7], d:1,  time:'06:30'},
        {name:'Тижнева нарада команди',             type:'weekly',  ai:0, parts:[0,1,7,8,9,10,11], d:7,  time:'09:00'},
        {name:'Оперативка по рейсах та клієнтах',   type:'weekly',  ai:1, parts:[0,1,7,8],          d:3,  time:'10:00'},
        {name:'Нарада по техстану автопарку',       type:'monthly', ai:10,parts:[0,10,11],           d:14, time:'10:00'},
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
        {name:'Виручка за тиждень',           unit:'грн', fi:6, freq:'weekly',  vals:[485000,420000,560000,510000,620000]},
        {name:'Кількість рейсів за тиждень',  unit:'рейс',fi:2, freq:'weekly',  vals:[28,24,32,30,36]},
        {name:'Середній дохід з рейсу',       unit:'грн', fi:6, freq:'weekly',  vals:[17321,17500,17500,17000,17222]},
        {name:'Витрати на паливо (% виручки)',unit:'%',   fi:6, freq:'weekly',  vals:[22,24,21,23,20]},
        {name:'Завантаженість автопарку',     unit:'%',   fi:1, freq:'weekly',  vals:[72,68,80,78,85]},
        {name:'Вчасність доставок',           unit:'%',   fi:3, freq:'weekly',  vals:[88,85,91,89,94]},
        {name:'NPS клієнтів',                 unit:'бал', fi:3, freq:'monthly', vals:[72,74,76,78,82]},
        {name:'Рентабельність',               unit:'%',   fi:6, freq:'monthly', vals:[24,26,23,28,31]},
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
        {name:'Стандарт підготовки водія до рейсу', fi:2,
         content:'1. Перевірка технічного стану авто (ходова, гальма, освітлення).\n2. Перевірка рівня оливи, антифризу, рідини ГПК.\n3. Наявність усіх документів (посвідчення, тахограф, ТТН).\n4. Підтвердження маршруту у диспетчера.\n5. Запис у журналі виїзду.'},
        {name:'Стандарт роботи диспетчера',         fi:1,
         content:'1. Щогодини перевіряти GPS-статус всіх авто.\n2. При затримці >1 год — дзвінок водію та повідомлення клієнту.\n3. Оформляти рейс в системі до виїзду водія.\n4. Після завершення рейсу — закрити в системі, виставити рахунок.'},
        {name:'Стандарт роботи з претензіями',      fi:3,
         content:'1. Прийняти претензію протягом 1 год.\n2. З\'ясувати причину у водія та диспетчера.\n3. Надати відповідь клієнту протягом 24 год.\n4. Якщо провина ЛогіПро — компенсація або знижка.\n5. Зафіксувати інцидент для аналізу.'},
    ].map(s=>({type:'set',ref:cr.collection('workStandards').doc(),data:{
        name:s.name, content:s.content,
        functionId:fRefs[s.fi].id, functionName:FUNCS[s.fi].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})),'step-standards');

    // ── 14. ПРОФІЛЬ КОМПАНІЇ ─────────────────────────────────
    await cr.update({
        name:'ЛогіПро Logistics', niche:'logistics',
        nicheLabel:'Логістика / Вантажні перевезення',
        description:'ЛогіПро Logistics — вантажні перевезення по Україні. 5 вантажівок (CE/C), 200+ рейсів/місяць, клієнти АТБ, Метро, Сільпо.',
        city:'Київ', currency:'UAH',
        employees:12, avgCheck:17222,
        monthlyRevenue:620000,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['logistics'] = 'ЛогіПро Logistics (Київ)';
