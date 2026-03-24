// ============================================================
// 42-niche-construction.js — Будівництво EU (Німеччина)
// БудМайстер DE — будівельний підряд
// ============================================================
'use strict';

window._DEMO_NICHE_MAP['construction_eu'] = async function() {
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
        'booking_calendars','booking_schedules','bookings',
        'estimates','estimate_norms','project_estimates','norm_definitions',
        'finance_invoices','coordination_sessions','sales'];
    try {
        for (const col of _clearCols) {
            const snap = await cr.collection(col).where('isDemo','==',true).get();
            if (!snap.empty) await window.safeBatchCommit(
                snap.docs.map(d=>({type:'delete',ref:d.ref})), 'clear-'+col);
        }
    } catch(e) { console.warn('[demo] clear:', e.message); }

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
            email:s.name.toLowerCase().replace(/['\s]+/g,'.') + '@budmaster.demo',
            functionIds: fid ? [fid] : [],
            primaryFunctionId: fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
        }
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
            title:r.t, period:r.type, daysOfWeek:dows ? dows.map(String) : null, dayOfMonth:r.dom || null,
            skipWeekends:r.type==='daily', timeStart:r.tm, timeEnd, duration:r.est,
            functionId:fRefs[r.fi].id, functionName:FUNCS[r.fi].name,
            assigneeId:sRefs[r.ai].id, assigneeName:STAFF[r.ai].name,
            creatorId:uid, creatorName:STAFF[0].name,
            estimatedTime:String(r.est||30), expectedResult:r.result || '',
            reportFormat:'Короткий звіт у вільній формі',
            status:'active', instruction:'', priority:'medium', requireReview:false,
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

    // Читаємо проєкти для прив\'язки етапів і завдань
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

    // ── 7б. CRM АКТИВНОСТІ ────────────────────────────────────
    const crmCliSnap = await cr.collection('crm_clients').get();
    const crmDocs = crmCliSnap.docs.slice(0,10);
    const ACT_TEXTS = [
        'Клієнт зацікавлений у ремонті квартири 85м², бюджет €35 000',
        'Зустріч проведена, підписали NDA, чекаємо кошторис',
        'Виїзний замір виконано, фото зроблено, кошторис у роботі',
        'Надіслали КП, клієнт взяв 3 дні на роздуми',
        'Договір підписано, аванс 30% отримано',
        'Замовник задоволений першим тижнем робіт',
        'Питання по кольору плитки — узгодили зразки',
        'Проміжна здача — клієнт прийняв, підписав акт',
        'Претензія по рівню підлоги — виїхали, виправили',
        'Об\'єкт зданий, акт підписано, відгук 5★ на Google',
    ];
    await window.safeBatchCommit(crmDocs.map((doc, i) => ({type:'set', ref:cr.collection('crm_activities').doc(), data:{
        isDemo:true,
        clientId:doc.id, clientName:doc.data().name,
        type:['note','call','meeting','email','note','call','meeting','note','call','meeting'][i],
        text:ACT_TEXTS[i],
        date:_demoDate(-(i+1)),
        managerId:sRefs[1].id, managerName:STAFF[1].name,
        functionId:fRefs[1].id,
        createdBy:uid, createdAt:now,
    }})), 'step-crm-activities');

    // ── 7в. РАХУНКИ-ФАКТУРИ ───────────────────────────────────
    const INVOICES_CON = [
        {client:'Franz Müller',   amount:45000, status:'paid',    d:-30, items:[{name:'Ремонт квартири 85м² — аванс 30%', qty:1, price:45000}]},
        {client:'Klaus Weber',    amount:85000, status:'paid',    d:-15, items:[{name:'Офісний ремонт — перший транш',     qty:1, price:85000}]},
        {client:'Anna Schmidt',   amount:62000, status:'pending', d:7,   items:[{name:'Ремонт будинку 200м² — етап 2',     qty:1, price:62000}]},
        {client:'Hans Becker',    amount:28000, status:'pending', d:14,  items:[{name:'Оздоблення фасаду — аванс',         qty:1, price:28000}]},
        {client:'Thomas Schulz',  amount:15000, status:'overdue', d:-5,  items:[{name:'Консультація + проект',             qty:1, price:15000}]},
    ];
    await window.safeBatchCommit(INVOICES_CON.map(inv => ({type:'set', ref:cr.collection('finance_invoices').doc(), data:{
        isDemo:true,
        clientName:inv.client, amount:inv.amount, currency:'EUR',
        status:inv.status, dueDate:_demoDate(inv.d),
        items:inv.items,
        functionId:fRefs[5].id, functionName:FUNCS[5].name,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})), 'step-invoices');

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
    // Завантажуємо проєкти для прив\'язки транзакцій
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

    // ── 15. ЗАВДАННЯ ПРИВ\'ЯЗАНІ ДО ПРОЄКТІВ ─────────────────
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

    // Бюджети проєктів (транзакції прив\'язані до проєктів)
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
