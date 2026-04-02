// ============================================================
// 42-niche-beauty.js — Б'юті салон
// Glow Studio — манікюр, педикюр, брови, вії, Київ
// ============================================================
'use strict';

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['beauty_salon'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];
    const _demoDate = window._demoDate;
    const _demoTs = window._demoTs;
    const _demoTsFinance = window._demoTsFinance;

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
        'metricEntries','metrics','metricTargets','booking_appointments','estimates',
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
        // Сьогодні — МІЙ ДЕНЬ (власник ai:0)
        {t:'Перевірити виручку за тиждень та завантаженість майстрів',    fi:7, ai:0, d:0,  pr:'high',   est:30,  r:'KPI зафіксовані, план/факт порівняно'},
        {t:'Узгодити нові ціни з постачальником матеріалів',              fi:5, ai:0, d:0,  pr:'high',   est:30,  r:'Ціни узгоджені або альтернатива знайдена'},
        {t:'Зустріч з кандидаткою на майстра манікюру',                  fi:6, ai:0, d:0,  pr:'medium', est:45,  r:'Рішення прийнято, наступний крок визначений'},
        {t:'Розробити офер на абонемент "5+1 безкоштовно" — промо травень', fi:0, ai:0, d:0, pr:'high',  est:90,  r:'Офер погоджений, пост готовий до публікації'},
        {t:'Зустріч з орендодавцем — обговорення умов поновлення',        fi:7, ai:0, d:-1, pr:'high',   est:60,  r:'Умови погоджені або переговори продовжуються'},
        // Команда — сьогодні
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
    await window._writeDemoDefaultFinCategories(cr, uid);

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
                bookingOps.push({type:'set', ref:cr.collection('booking_appointments').doc(), data:{
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
            bookingOps.push({type:'set', ref:cr.collection('booking_appointments').doc(), data:{
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
        const _dt = new Date(Date.now() + w.wk * 7 * 86400000);
        _dt.setHours(12,0,0,0);
        const _dow = _dt.getDay() || 7;
        _dt.setDate(_dt.getDate() - _dow + 4);
        const _y = _dt.getFullYear();
        const _j1 = new Date(_y, 0, 1);
        const _wn = Math.ceil(((_dt - _j1) / 864e5 + _j1.getDay() + 1) / 7);
        const periodKey = _y + '-W' + String(_wn).padStart(2, '0');
        for (let mi = 0; mi < METRIC_DEFS.length; mi++) {
            entryOps.push({type:'set', ref:cr.collection('metricEntries').doc(), data:{
                metricId: mDefRefs[mi].id,
                value: entryValues[mi](w),
                period: periodKey,
                periodKey: periodKey,
                periodType: 'weekly',
                frequency: 'weekly',
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
