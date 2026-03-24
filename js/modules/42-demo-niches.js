// ============================================================
// 42-demo-niches.js — Повні демо-ніші для TALKO
// Меблевий бізнес — максимальна деталізація
// ============================================================
'use strict';

// Патчимо safeBatchCommit щоб автоматично додавав isDemo:true до set операцій
const _origSafeBatch = window.safeBatchCommit;
window.safeBatchCommit = async function(ops, _label) {
    if (!ops || !ops.length) return;
    const markedOps = (ops || []).map(op => {
        if (op.type === 'set' && op.data && !op.data.isDemo) {
            return { ...op, data: { ...op.data, isDemo: true } };
        }
        return op;
    });
    try {
        return await _origSafeBatch(markedOps);
    } catch(e) {
        console.warn('[DemoNiche] batch error', _label || '?', e.message, 'ops sample:', markedOps.slice(0,2).map(o=>o.ref?.path||'?'));
        // Don't rethrow — skip this batch and continue
    }
};

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
// Timestamp для фінансових транзакцій (фінанси фільтрують по Timestamp)
function _demoTsFinance(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetDays||0));
    d.setHours(12, 0, 0, 0);
    return firebase.firestore.Timestamp.fromDate(d);
}
function _dRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

// ════════════════════════════════════════════════════════════
// БУДІВЕЛЬНА КОМПАНІЯ — construction_eu
// "БудМайстер" — ремонт та оздоблення приміщень, Київ
// 12 осіб, 8 функцій, повний цикл від ліда до здачі об\'єкту
// ════════════════════════════════════════════════════════════

// "SparkClean Pro" — Commercial & Residential Cleaning, Austin TX
// 12 staff, 8 functions, USD, full cycle from lead to contract
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
// HORECA — Кафе "Сонячне"
// ════════════════════════════════════════════════════════════════════════════

window._DEMO_NICHE_MAP['horeca'] = async function() {
    if (!window.currentCompanyId || !window.db) throw new Error('No company');
    const cr = window.db.collection('companies').doc(window.currentCompanyId);
    const uid = window.currentUser?.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    function dDate(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);}
    function dTs(d){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+d*86400000));}
    let ops=[];

    // ФУНКЦІЇ
    const FUNCS=[
        {name:'0. Маркетинг',    color:'#ec4899',desc:'Реклама, Instagram, Google Maps, акції, залучення гостей'},
        {name:'1. Сервіс залу',  color:'#22c55e',desc:'Офіціанти, обслуговування столів, чеки, задоволеність гостей'},
        {name:'2. Кухня',        color:'#f97316',desc:'Приготування страв, якість, меню, заготовки, технологічні карти'},
        {name:'3. Бар та каса',  color:'#6366f1',desc:'Бар, каса, відкриття/закриття зміни, облік виручки'},
        {name:'4. Склад та закупівлі',color:'#0ea5e9',desc:'Продукти, залишки, замовлення у постачальників'},
        {name:'5. Фінанси',      color:'#10b981',desc:'P&L, зарплата, витрати, аналітика рентабельності'},
        {name:'6. Команда',      color:'#8b5cf6',desc:'Графік, навчання, стандарти обслуговування'},
        {name:'7. Управління',   color:'#f59e0b',desc:'Стратегія, якість, нові страви, масштабування'},
    ];
    const fRefs=FUNCS.map(()=>cr.collection('functions').doc());
    FUNCS.forEach((f,i)=>{ops.push({type:'set',ref:fRefs[i],data:{name:f.name,color:f.color,description:f.desc,order:i,status:'active',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // СПІВРОБІТНИКИ
    try{const o=await cr.collection('users').get();if(!o.empty){const d=[];o.docs.forEach(doc=>{if(doc.id!==uid)d.push({type:'delete',ref:cr.collection('users').doc(doc.id)});});if(d.length)await window.safeBatchCommit(d);}}catch(e){}
    const STAFF=[
        {name:'Марина Ковальчук', role:'Адміністратор',  fn:6,email:'kovalchuk@cafe.ua', phone:'+380671120001'},
        {name:'Іван Приходько',   role:'Шеф-кухар',      fn:2,email:'prykhodko@cafe.ua', phone:'+380671120002'},
        {name:'Оля Захарченко',   role:'Кухар',           fn:2,email:'zakharchenko@cafe.ua',phone:'+380671120003'},
        {name:'Петро Мороз',      role:'Кухар',           fn:2,email:'moroz@cafe.ua',     phone:'+380671120004'},
        {name:'Тетяна Бондар',    role:'Офіціант',        fn:1,email:'bondar@cafe.ua',    phone:'+380671120005'},
        {name:'Микола Даценко',   role:'Офіціант',        fn:1,email:'datsenko@cafe.ua',  phone:'+380671120006'},
        {name:'Ліля Гончаренко',  role:'Офіціант',        fn:1,email:'goncharenko@cafe.ua',phone:'+380671120007'},
        {name:'Арсен Кириленко',  role:'Бармен',          fn:3,email:'kyrylenko@cafe.ua', phone:'+380671120008'},
        {name:'Аліна Сергієнко',  role:'Касир',           fn:3,email:'sergiienko@cafe.ua',phone:'+380671120009'},
        {name:'Дмитро Власенко',  role:'Вантажник/клінінг',fn:4,email:'vlasenko@cafe.ua',phone:'+380671120010'},
    ];
    const sRefs=STAFF.map(()=>cr.collection('staff').doc());
    const uRefs=STAFF.map(()=>cr.collection('users').doc());
    STAFF.forEach((s,i)=>{
        ops.push({type:'set',ref:sRefs[i],data:{name:s.name,role:s.role,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,phone:s.phone,isActive:true,isDemo:true,createdAt:now}});
        ops.push({type:'set',ref:uRefs[i],data:{name:s.name,email:s.email,role:'employee',functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,staffId:sRefs[i].id,isDemo:true,createdAt:now}});
    });
    FUNCS.forEach((f,i)=>{const oi=STAFF.findIndex(s=>s.fn===i);if(oi>=0)ops.push({type:'update',ref:fRefs[i],data:{ownerId:sRefs[oi].id,ownerName:STAFF[oi].name}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM — постійні гості
    const GUESTS=[
        {name:'Петренко Марина',  phone:'+380671121001',visits:24,spent:6840, lastVisit:-2,  loyalty:true, notes:'Любить столик 3 біля вікна. Алергія на горіхи!'},
        {name:'Коваленко Ігор',   phone:'+380671121002',visits:8, spent:2280, lastVisit:-18, loyalty:true, notes:'Бізнес-ланч щотижня. Завжди бере борщ і каву.'},
        {name:'Бондаренко Сімейні',phone:'+380671121003',visits:12,spent:4800, lastVisit:-5,  loyalty:false,notes:'Сім\'я з дітьми. Столик 7. Дитяче меню.'},
        {name:'Ткаченко Ніна',    phone:'+380671121004',visits:31,spent:8680, lastVisit:-1,  loyalty:true, notes:'VIP гість. Завжди бере кожного 5-го каву безкоштовно.'},
        {name:'Мороз Андрій',     phone:'+380671121005',visits:5, spent:1250, lastVisit:-45, loyalty:false,notes:'Приходив щотижня, потім зник. Win-back.'},
        {name:'Гриценко Олена',   phone:'+380671121006',visits:18,spent:5040, lastVisit:-3,  loyalty:true, notes:'Любить десерти і капучино. Відзначає ДН 15 червня.'},
        {name:'Шевченко Юрій',    phone:'+380671121007',visits:7, spent:1960, lastVisit:-10, loyalty:false,notes:'Бізнес-ланч, завжди з колегами (5-6 осіб).'},
        {name:'Корпорація TechHub',phone:'+380671121008',visits:4, spent:8400, lastVisit:-7,  loyalty:false,notes:'Корпоративні замовлення. Банкети на 15-20 осіб.'},
    ];
    const gRefs=GUESTS.map(()=>cr.collection('crm_clients').doc());
    GUESTS.forEach((g,i)=>{ops.push({type:'set',ref:gRefs[i],data:{name:g.name,phone:g.phone,source:'direct',status:'active',notes:g.notes,totalSpent:g.spent,lastOrderDate:dDate(g.lastVisit),loyaltyPoints:g.loyalty?Math.floor(g.spent/10):0,isDemo:true,createdAt:dTs(g.lastVisit-30)}});});
    await window.safeBatchCommit(ops);ops=[];

    // МЕНЮ (каталог)
    const MENU=[
        // Перші страви
        {name:'Борщ з пампушками',          price:85,  unit:'порція',cat:'Перші страви'},
        {name:'Суп курячий з вермішеллю',   price:75,  unit:'порція',cat:'Перші страви'},
        {name:'Солянка м\'ясна',            price:95,  unit:'порція',cat:'Перші страви'},
        // Другі страви
        {name:'Котлета по-київськи',        price:145, unit:'порція',cat:'Другі страви'},
        {name:'Риба запечена з овочами',    price:165, unit:'порція',cat:'Другі страви'},
        {name:'Стейк зі свинини 200г',      price:195, unit:'порція',cat:'Другі страви'},
        {name:'Вареники з картоплею (6 шт)',price:95,  unit:'порція',cat:'Другі страви'},
        {name:'Плов по-домашньому',         price:115, unit:'порція',cat:'Другі страви'},
        // Гарніри
        {name:'Пюре картопляне',            price:45,  unit:'порція',cat:'Гарніри'},
        {name:'Рис відварний',              price:40,  unit:'порція',cat:'Гарніри'},
        {name:'Гречка з підливою',          price:50,  unit:'порція',cat:'Гарніри'},
        // Салати
        {name:'Цезар з куркою',             price:135, unit:'порція',cat:'Салати'},
        {name:'Грецький салат',             price:115, unit:'порція',cat:'Салати'},
        {name:'Вінегрет',                   price:65,  unit:'порція',cat:'Салати'},
        {name:'Олів\'є',                   price:75,  unit:'порція',cat:'Салати'},
        // Напої
        {name:'Кава еспресо',               price:45,  unit:'шт',    cat:'Напої'},
        {name:'Капучино 300мл',             price:75,  unit:'шт',    cat:'Напої'},
        {name:'Латте 350мл',                price:85,  unit:'шт',    cat:'Напої'},
        {name:'Чай трав\'яний',            price:55,  unit:'шт',    cat:'Напої'},
        {name:'Свіжовичавлений сік 300мл',  price:85,  unit:'шт',    cat:'Напої'},
        {name:'Компот домашній',            price:35,  unit:'шт',    cat:'Напої'},
        {name:'Вода мінеральна 0.5л',       price:30,  unit:'шт',    cat:'Напої'},
        // Десерти
        {name:'Торт Наполеон (порція)',      price:85,  unit:'порція',cat:'Десерти'},
        {name:'Млинці з варенням (3 шт)',    price:75,  unit:'порція',cat:'Десерти'},
        {name:'Морозиво асорті (3 кульки)',  price:65,  unit:'порція',cat:'Десерти'},
        {name:'Тірамісу',                   price:95,  unit:'порція',cat:'Десерти'},
        // Бізнес-ланч
        {name:'Бізнес-ланч (комплекс)',      price:135, unit:'порція',cat:'Бізнес-ланч'},
        // Хліб
        {name:'Хліб (порція)',               price:15,  unit:'порція',cat:'Хліб та випічка'},
        {name:'Пампушки часникові (3 шт)',   price:35,  unit:'порція',cat:'Хліб та випічка'},
        // Алкоголь
        {name:'Вино червоне (150мл)',        price:95,  unit:'шт',    cat:'Алкоголь'},
        {name:'Вино біле (150мл)',           price:85,  unit:'шт',    cat:'Алкоголь'},
        {name:'Пиво "Львівське" 0.5л',      price:55,  unit:'шт',    cat:'Алкоголь'},
    ];
    const mRefs=MENU.map(()=>cr.collection('sales_products').doc());
    MENU.forEach((m,i)=>{ops.push({type:'set',ref:mRefs[i],data:{name:m.name,price:m.price,unit:m.unit,category:m.cat,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // СКЛАД ПРОДУКТІВ
    const INGR=[
        {name:'Борошно пшеничне в/с',qty:85, unit:'кг', price:28, cat:'Бакалія', min:20},
        {name:'Цукор пісок',          qty:40, unit:'кг', price:32, cat:'Бакалія', min:10},
        {name:'Сіль кухонна',         qty:15, unit:'кг', price:8,  cat:'Бакалія', min:5},
        {name:'Олія соняшникова',      qty:24, unit:'л',  price:65, cat:'Бакалія', min:8},
        {name:'Масло вершкове 82.5%',  qty:18, unit:'кг', price:280,cat:'Молочні', min:5},
        {name:'Яйця (С1, 10 шт)',      qty:80, unit:'упак',price:65, cat:'Молочні', min:20},
        {name:'Молоко 3.2% (1л)',       qty:95, unit:'л',  price:32, cat:'Молочні', min:30},
        {name:'Сметана 20% (0.5л)',     qty:28, unit:'шт', price:48, cat:'Молочні', min:10},
        {name:'Картопля',              qty:120,unit:'кг', price:12, cat:'Овочі',   min:30},
        {name:'Буряк',                 qty:42, unit:'кг', price:14, cat:'Овочі',   min:15},
        {name:'Морква',                qty:38, unit:'кг', price:16, cat:'Овочі',   min:15},
        {name:'Капуста білокачанна',   qty:28, unit:'кг', price:10, cat:'Овочі',   min:10},
        {name:'Цибуля ріпчаста',       qty:25, unit:'кг', price:18, cat:'Овочі',   min:8},
        {name:'Помідори',              qty:18, unit:'кг', price:45, cat:'Овочі',   min:8},
        {name:'Огірки свіжі',          qty:12, unit:'кг', price:48, cat:'Овочі',   min:5},
        {name:'М\'ясо свинина (лопатка)',qty:32,unit:'кг', price:185,cat:'М\'ясо', min:10},
        {name:'М\'ясо яловичина',       qty:18, unit:'кг', price:220,cat:'М\'ясо', min:8},
        {name:'Курятина (грудка)',      qty:28, unit:'кг', price:130,cat:'М\'ясо', min:10},
        {name:'Риба (судак/тилапія)',   qty:14, unit:'кг', price:195,cat:'Риба',   min:5},
        {name:'Кава зернова (1кг)',     qty:6,  unit:'кг', price:580,cat:'Кава/Чай',min:2},
        {name:'Чай трав\'яний (100г)',  qty:12, unit:'упак',price:45,cat:'Кава/Чай',min:4},
        {name:'Молоко для кави 3.5%',   qty:30, unit:'л',  price:38, cat:'Молочні', min:10},
        {name:'Вершки 33% (1л)',         qty:8,  unit:'л',  price:165,cat:'Молочні', min:3},
    ];
    const iRefs=INGR.map(()=>cr.collection('warehouse_items').doc());
    INGR.forEach((it,i)=>{ops.push({type:'set',ref:iRefs[i],data:{name:it.name,quantity:it.qty,price:it.price,unit:it.unit,category:it.cat,minQuantity:it.min,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ЗМІНИ (shifts)
    const yr=new Date().getFullYear();
    const shiftYRef=cr.collection('sales_shifts').doc();
    const shiftTRef=cr.collection('sales_shifts').doc();
    ops.push({type:'set',ref:shiftYRef,data:{status:'closed',openedByName:STAFF[8].name,openedAt:dTs(-1),closedAt:dTs(-0.4),cashStart:500,cashEnd:3700,totalCash:3200,totalTerminal:2100,totalTransfer:0,totalRevenue:5300,ordersCount:22,avgCheck:241,notes:'Вівторок — гарний день. Були замовлення від TechHub.',isDemo:true,createdAt:dTs(-1)}});
    ops.push({type:'set',ref:shiftTRef,data:{status:'open',openedByName:STAFF[8].name,openedAt:dTs(0),closedAt:null,cashStart:500,cashEnd:0,totalCash:0,totalTerminal:0,totalTransfer:0,totalRevenue:0,ordersCount:0,avgCheck:0,notes:'',isDemo:true,createdAt:dTs(0)}});
    await window.safeBatchCommit(ops);ops=[];

    // ЧЕКИ (receipts) — вчора і сьогодні
    const CHECKS=[
        // Вчора
        {d:-1,n:1,mi:[0,8,15],   method:'cash',   cI:0,  table:'Стіл 3'},
        {d:-1,n:2,mi:[3,11,16,21],method:'terminal',cI:1, table:'Стіл 1'},
        {d:-1,n:3,mi:[26,15,22], method:'cash',   cI:-1, table:'Стіл 5'},
        {d:-1,n:4,mi:[4,12,14,24],method:'cash',  cI:2,  table:'Стіл 7'},
        {d:-1,n:5,mi:[0,1,8,15,20],method:'terminal',cI:3,table:'Стіл 2'},
        {d:-1,n:6,mi:[2,13,18],  method:'cash',   cI:-1, table:'Стіл 6'},
        {d:-1,n:7,mi:[3,11,15],  method:'terminal',cI:4, table:'Стіл 4'},
        {d:-1,n:8,mi:[26,26,26,15,15,16,21,5,8],method:'terminal',cI:7,table:'Корпоратив TechHub (8 осіб)'},
        {d:-1,n:9,mi:[26,16,20], method:'cash',   cI:5,  table:'Стіл 8'},
        {d:-1,n:10,mi:[26,15,22,24],method:'cash', cI:-1,table:'Стіл 9'},
        {d:-1,n:11,mi:[3,8,28],  method:'terminal',cI:6, table:'Стіл 10'},
        // Сьогодні (поки відкрита зміна)
        {d:0,n:12,mi:[0,8,15],   method:'cash',   cI:0,  table:'Стіл 3'},
        {d:0,n:13,mi:[4,11,16],  method:'terminal',cI:1, table:'Стіл 1'},
        {d:0,n:14,mi:[26,15,22], method:'cash',   cI:3,  table:'Стіл 2'},
        {d:0,n:15,mi:[3,12,14,24],method:'terminal',cI:-1,table:'Стіл 5'},
        {d:0,n:16,mi:[26,16,20], method:'cash',   cI:5,  table:'Стіл 7'},
    ];
    CHECKS.forEach(ch=>{
        const items=ch.mi.map(mi=>{const m=MENU[mi];return{id:String(mi),name:m.name,qty:1,unit:m.unit,price:m.price,discount:0,total:m.price};});
        const total=items.reduce((s,x)=>s+x.total,0);
        ops.push({type:'set',ref:cr.collection('sales_orders').doc(),data:{
            type:'receipt',number:`RCP-${yr}-${String(ch.n).padStart(4,'0')}`,status:'paid',
            clientId:ch.cI>=0?gRefs[ch.cI].id:'',clientName:ch.cI>=0?GUESTS[ch.cI].name:ch.table,
            date:dDate(ch.d),items,subtotal:total,discountTotal:0,total,
            paymentMethod:ch.method,paymentStatus:'paid',paidAmount:total,
            shiftId:ch.d<0?shiftYRef.id:shiftTRef.id,notes:ch.table,
            isDemo:true,createdAt:dTs(ch.d),updatedAt:now,
        }});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ЗАВДАННЯ
    const TASKS=[
        {t:'Заготовити 30 порцій борщу до 11:00 (основна страва дня)',          fi:2,ai:1,st:'in_progress',pr:'high',  d:0,tm:'07:30',est:90, r:'Борщ готовий, на роздачі до 11:00'},
        {t:'Відкрити зміну о 9:00 — каса 500 грн, перевірити залишки',          fi:3,ai:8,st:'done',       pr:'high',  d:0,tm:'09:00',est:15, r:'Зміна відкрита, залишки перевірені'},
        {t:'Сервірування залу — 12 столів до 10:30',                             fi:1,ai:4,st:'done',       pr:'medium',d:0,tm:'09:30',est:45, r:'Всі столи сервіровані, зал готовий до відкриття'},
        {t:'Замовити капусту — залишок 28 кг, мінімум 30 кг (нижче ліміту)',    fi:4,ai:9,st:'new',        pr:'high',  d:0,tm:'08:00',est:20, r:'Email постачальнику відправлено, дата доставки підтверджена'},
        {t:'Банкет TechHub на 18:00 — 15 осіб, стіл 7+8+9',                    fi:1,ai:0,st:'new',        pr:'high',  d:1,tm:'17:30',est:30, r:'Стіл накритий, меню погоджено, офіціант призначений'},
        {t:'Приготувати шоколадний торт на ДН Гриценко Олени (15 червня)',       fi:2,ai:1,st:'new',        pr:'medium',d:2,tm:'14:00',est:120,r:'Торт готовий, прикраса імені, свічки'},
        {t:'Відповісти на відгуки в Google Maps (3 нових відгуки)',              fi:0,ai:0,st:'new',        pr:'medium',d:0,tm:'11:00',est:20, r:'Відповіді на всі відгуки за тиждень'},
        {t:'Акція "Безкоштовна кава" — оновити Instagram Stories',              fi:0,ai:0,st:'new',        pr:'low',   d:1,tm:'10:00',est:30, r:'Пост і Stories опубліковані, охоплення > 500'},
        {t:'Звіт P&L — вчорашня зміна: виручка 5 300, витрати?',               fi:5,ai:0,st:'new',        pr:'medium',d:0,tm:'09:00',est:30, r:'Заповнена таблиця P&L, надіслана власнику'},
        {t:'Мороз Андрій — 45 днів без візиту. Відправити SMS "Скучали"',       fi:0,ai:0,st:'overdue',   pr:'medium',d:-2,tm:'12:00',est:10, r:'SMS відправлено або відмітка "не цікавий"'},
        {t:'Провести санітарну перевірку кухні (щотижнево)',                    fi:2,ai:1,st:'overdue',   pr:'low',   d:-3,tm:'17:00',est:60, r:'Чек-ліст заповнено, зауваження усунуто'},
        {t:'Оновити меню — додати сезонні страви (весна)',                       fi:7,ai:0,st:'new',        pr:'low',   d:5, tm:'11:00',est:120,r:'Нові 3-5 позицій в меню, оновлені роздруківки'},
        {t:'Закупівля продуктів на тиждень (щопонеділка)',                       fi:4,ai:9,st:'new',        pr:'high',  d:1, tm:'08:00',est:60, r:'Всі продукти куплені, склад поповнено'},
    ];
    TASKS.forEach(tk=>{ops.push({type:'set',ref:cr.collection('tasks').doc(),data:{title:tk.t,functionName:FUNCS[tk.fi].name,functionId:fRefs[tk.fi].id,assigneeId:sRefs[tk.ai].id,assigneeName:STAFF[tk.ai].name,status:tk.st,priority:tk.pr,deadlineDate:dDate(tk.d),scheduledTime:tk.tm,estimatedMinutes:tk.est,expectedResult:tk.r,isDemo:true,createdAt:now,updatedAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ПРОЦЕСИ
    const P1=[
        {n:'Відкриття зміни',           fn:3,ai:8,dur:20, desc:'Перевірити касу. Відкрити зміну в системі. Перевірити залишки і наявність для меню.'},
        {n:'Підготовка залу',           fn:1,ai:4,dur:45, desc:'Сервірування столів. Перевірка чистоти. Зустріч гостей від 10:00.'},
        {n:'Підготовка кухні',          fn:2,ai:1,dur:60, desc:'Заготовки до 11:00. Перевірка залишків. Розкладка по позиціях.'},
        {n:'Обслуговування гостей',     fn:1,ai:4,dur:30, desc:'Зустріч, меню, прийом замовлення, подача, розрахунок. Стандарт 5 хвилин на прийом.'},
        {n:'Обробка оплати',            fn:3,ai:8,dur:5,  desc:'Провести чек. Готівка або термінал. Видати решту/чек.'},
        {n:'Збирання столу',            fn:1,ai:4,dur:10, desc:'Зібрати посуд. Прибрати стіл. Готовність до наступних гостей.'},
        {n:'Закриття зміни',            fn:3,ai:8,dur:30, desc:'Підрахунок виручки. Закриття зміни в системі. Звіт власнику.'},
        {n:'Миття та прибирання',       fn:6,ai:9,dur:60, desc:'Посуд, підлога, кухня. Санітарні стандарти.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Стандарт обслуговування гостей',description:'Повний цикл: відкриття зміни → обслуговування → закриття. 8 кроків.',category:'Основний',status:'active',steps:P1.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});
    await window.safeBatchCommit(ops);ops=[];

    // ФІНАНСИ
    try{for(const col of['finance_transactions','finance_categories','finance_accounts']){const s=await cr.collection(col).get();if(!s.empty){const d=s.docs.map(doc=>({type:'delete',ref:doc.ref}));await window.safeBatchCommit(d);}}}catch(e){}
    const accCash=cr.collection('finance_accounts').doc();
    const accCard=cr.collection('finance_accounts').doc();
    ops.push({type:'set',ref:accCash,data:{name:'Каса (готівка)',  type:'cash',currency:'UAH',balance:8400, isDefault:true, isDemo:true,createdAt:now}});
    ops.push({type:'set',ref:accCard,data:{name:'ПриватБанк ФОП', type:'card',currency:'UAH',balance:86200,isDefault:false,isDemo:true,createdAt:now}});
    const CAT_I=['Виручка від продажів','Доставка та кейтеринг','Банкети та корпоративи'];
    const CAT_O=['Продукти та сировина','Оренда приміщення','Зарплата персоналу','Комунальні послуги','Реклама та маркетинг','Обладнання та інвентар'];
    const ciRefs=CAT_I.map(()=>cr.collection('finance_categories').doc());
    const coRefs=CAT_O.map(()=>cr.collection('finance_categories').doc());
    CAT_I.forEach((n,i)=>{ops.push({type:'set',ref:ciRefs[i],data:{name:n,type:'income', isDemo:true,createdAt:now}});});
    CAT_O.forEach((n,i)=>{ops.push({type:'set',ref:coRefs[i],data:{name:n,type:'expense',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    const TXNS=[
        {tp:'income', ci:0,acc:accCash,amt:5300, note:'Виручка вчора (22 чеки, зміна закрита)',           d:-1},
        {tp:'income', ci:0,acc:accCard,amt:4840, note:'Виручка позавчора (20 чеків)',                     d:-2},
        {tp:'income', ci:2,acc:accCard,amt:8400, note:'Корпоратив TechHub — 15 осіб банкет',              d:-7},
        {tp:'income', ci:0,acc:accCash,amt:5680, note:'Виручка 3-й тиждень березня (5 смін)',             d:-15},
        {tp:'income', ci:0,acc:accCard,amt:6240, note:'Виручка 4-й тиждень березня (5 смін)',             d:-8},
        {tp:'income', ci:1,acc:accCard,amt:2800, note:'Доставка бізнес-ланчів офіс на тиждень',           d:-5},
        {tp:'expense',ci:0,acc:accCard,amt:18400,note:'Закупівля продуктів — ринок + постачальники (квітень)',d:-3},
        {tp:'expense',ci:1,acc:accCash,amt:22000,note:'Оренда приміщення 80 м² (квітень)',               d:-1},
        {tp:'expense',ci:2,acc:accCard,amt:48000,note:'Зарплата 10 співробітників (березень)',            d:-28},
        {tp:'expense',ci:3,acc:accCash,amt:6400, note:'Електроенергія + газ + вода (квітень)',            d:-1},
        {tp:'expense',ci:4,acc:accCard,amt:3200, note:'Instagram + Google реклама (квітень)',             d:-2},
        {tp:'expense',ci:0,acc:accCard,amt:16800,note:'Закупівля продуктів — березень',                  d:-15},
        {tp:'expense',ci:1,acc:accCash,amt:22000,note:'Оренда (березень)',                               d:-28},
        {tp:'expense',ci:2,acc:accCard,amt:48000,note:'Зарплата персоналу (квітень)',                    d:-1},
    ];
    TXNS.forEach(tx=>{ops.push({type:'set',ref:cr.collection('finance_transactions').doc(),data:{type:tx.tp,categoryId:(tx.tp==='income'?ciRefs:coRefs)[tx.ci].id,categoryName:(tx.tp==='income'?CAT_I:CAT_O)[tx.ci],accountId:tx.acc.id,amount:tx.amt,note:tx.note,date:dDate(tx.d),createdAt:dTs(tx.d),isDemo:true}});});
    await window.safeBatchCommit(ops);ops=[];

    // KPI
    const KPI=[
        {name:'Виручка тижнева',            unit:'₴',  target:38000,vals:[28400,31200,29800,33600,35100,32400,34800]},
        {name:'Кількість чеків за день',    unit:'шт', target:28,   vals:[19,22,18,24,26,21,22]},
        {name:'Середній чек',               unit:'₴',  target:260,  vals:[218,235,224,248,256,241,245]},
        {name:'Завантаженість залу (пік)',  unit:'%',  target:90,   vals:[65,72,68,78,82,75,80]},
        {name:'Повернення гостей (30 днів)',unit:'%',  target:55,   vals:[38,42,45,48,50,47,52]},
    ];
    KPI.forEach(k=>{ops.push({type:'set',ref:cr.collection('kpi_metrics').doc(),data:{name:k.name,unit:k.unit,target:k.target,values:k.vals.map((v,i)=>({value:v,date:dDate(-42+i*7)})),currentValue:k.vals[k.vals.length-1],trend:k.vals[k.vals.length-1]>k.vals[k.vals.length-2]?'up':'down',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    await cr.update({name:'Кафе "Сонячне"',niche:'horeca',nicheLabel:'HoReCa — кафе, ресторан',description:'Кафе "Сонячне" — домашня кухня, бізнес-ланчі, банкети. 10 співробітників, 60 посадкових місць. Київ, вул. Садова 8.',city:'Київ',employees:10,currency:'UAH',avgCheck:241,monthlyRevenue:158000,companyGoal:'Завантаженість 85%+ в обідній час, NPS гостей > 80, власний бренд бізнес-ланчів у районі',companyConcept:'Кожен гість — постійний. Борщ як вдома, сервіс як в ресторані.',targetAudience:'Офісні працівники 25-45 років на бізнес-ланчах, сім\'ї на вечерях, корпоративні замовлення.',modules:{scheduling:true,clientProfile:true,loyalty:true,subscriptions:false,reviews:true,winback:true,notifications:true,estimates:false,warehouse:true,booking:false,sales:true},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
};
if (window._NICHE_LABELS) window._NICHE_LABELS['horeca'] = 'Кафе "Сонячне" — HoReCa (Київ)';

// ════════════════════════════════════════════════════════════════════════════
// ЛОГІСТИКА — Логіст Про
// ════════════════════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['logistics'] = async function() {
    if (!window.currentCompanyId || !window.db) throw new Error('No company');
    const cr = window.db.collection('companies').doc(window.currentCompanyId);
    const uid = window.currentUser?.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    function dDate(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);}
    function dTs(d){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+d*86400000));}
    let ops=[];

    const FUNCS=[
        {name:'0. Маркетинг та залучення', color:'#ec4899',desc:'Сайт, пошук клієнтів, тендери, партнерства'},
        {name:'1. Диспетчеризація',        color:'#22c55e',desc:'Розподіл рейсів, зв\'язок з водіями, відстеження'},
        {name:'2. Водії та транспорт',     color:'#f97316',desc:'Водії, техстан авто, документи, маршрути'},
        {name:'3. Клієнтський сервіс',     color:'#6366f1',desc:'Комунікація з клієнтами, документи, ТТН/CMR'},
        {name:'4. Фінанси та розрахунки',  color:'#10b981',desc:'Тарифи, рахунки, оплати водіїв, P&L'},
        {name:'5. Команда',                color:'#8b5cf6',desc:'Водії, диспетчери, навчання, KPI'},
        {name:'6. Управління',             color:'#f59e0b',desc:'Стратегія, нові напрямки, ефективність'},
    ];
    const fRefs=FUNCS.map(()=>cr.collection('functions').doc());
    FUNCS.forEach((f,i)=>{ops.push({type:'set',ref:fRefs[i],data:{name:f.name,color:f.color,description:f.desc,order:i,status:'active',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    try{const o=await cr.collection('users').get();if(!o.empty){const d=[];o.docs.forEach(doc=>{if(doc.id!==uid)d.push({type:'delete',ref:cr.collection('users').doc(doc.id)});});if(d.length)await window.safeBatchCommit(d);}}catch(e){}
    const STAFF=[
        {name:'Іваненко Микола',   role:'Водій (категорія CE)',     fn:2,email:'ivanenko@logist.ua',plate:'AA1111BB',phone:'+380671230001'},
        {name:'Коваленко Сергій',  role:'Водій (категорія CE)',     fn:2,email:'kovalenko@logist.ua',plate:'KA2222CC',phone:'+380671230002'},
        {name:'Петренко Андрій',   role:'Водій (категорія CE)',     fn:2,email:'petrenko@logist.ua', plate:'AA3333DD',phone:'+380671230003'},
        {name:'Мороз Василь',      role:'Водій (категорія C)',      fn:2,email:'moroz@logist.ua',    plate:'KA4444EE',phone:'+380671230004'},
        {name:'Захарченко Дмитро', role:'Водій (категорія C)',      fn:2,email:'zakharchenko@logist.ua',plate:'AA5555FF',phone:'+380671230005'},
        {name:'Олена Бондаренко',  role:'Диспетчер',                fn:1,email:'bondarenko@logist.ua',plate:'',phone:'+380671230006'},
        {name:'Іван Ткаченко',     role:'Логіст / менеджер',        fn:3,email:'tkachenko@logist.ua', plate:'',phone:'+380671230007'},
    ];
    const sRefs=STAFF.map(()=>cr.collection('staff').doc());
    const uRefs=STAFF.map(()=>cr.collection('users').doc());
    STAFF.forEach((s,i)=>{
        ops.push({type:'set',ref:sRefs[i],data:{name:s.name,role:s.role,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,phone:s.phone,notes:s.plate?`Авто: ${s.plate}`:'',isActive:true,isDemo:true,createdAt:now}});
        ops.push({type:'set',ref:uRefs[i],data:{name:s.name,email:s.email,role:'employee',functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,staffId:sRefs[i].id,isDemo:true,createdAt:now}});
    });
    FUNCS.forEach((f,i)=>{const oi=STAFF.findIndex(s=>s.fn===i);if(oi>=0)ops.push({type:'update',ref:fRefs[i],data:{ownerId:sRefs[oi].id,ownerName:STAFF[oi].name}});});
    await window.safeBatchCommit(ops);ops=[];

    const CLIENTS=[
        {name:'ТОВ БудМайстер',         phone:'+380441234561',email:'bud@budmaister.ua',  notes:'Будматеріали, регулярні рейси Київ-Захід. Оплата 7 днів.',     spent:57000,d:-3},
        {name:'ФОП Іванченко Логістик',  phone:'+380441234562',email:'ivan@fop.ua',         notes:'Дрібні вантажі, нерегулярно. Іноді затримує оплату.',          spent:22000,d:-15},
        {name:'ТОВ АгроТрейд',           phone:'+380441234563',email:'agro@agrotr.ua',      notes:'Зернові, сезонні рейси (серпень-жовтень). Великі обсяги.',     spent:84000,d:-7},
        {name:'ПП Карго Сервіс',         phone:'+380441234564',email:'cargo@pp.ua',          notes:'Обладнання та техніка. Потрібна ретельна упаковка.',           spent:38500,d:-5},
        {name:'ТОВ Укрпромпостач',       phone:'+380441234565',email:'ukr@ukrprom.ua',       notes:'Промислові товари, постачання по всій Україні.',              spent:46200,d:-2},
        {name:'ВАТ Метал-Груп',          phone:'+380441234566',email:'metal@grup.ua',         notes:'Металопрокат, важкі вантажі. Потрібна платформа.',             spent:62400,d:-20},
        {name:'ТОВ FreshMart Logistics', phone:'+380441234567',email:'fresh@freshmart.ua',   notes:'Продукти харчування, рефрижератор. Термінові рейси.',          spent:28800,d:-1},
    ];
    const cRefs=CLIENTS.map(()=>cr.collection('crm_clients').doc());
    CLIENTS.forEach((c,i)=>{ops.push({type:'set',ref:cRefs[i],data:{name:c.name,phone:c.phone,email:c.email,source:'direct',status:'active',notes:c.notes,totalSpent:c.spent,lastOrderDate:dDate(c.d),isDemo:true,createdAt:dTs(c.d-20)}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM УГОДИ — переговори щодо нових рейсів
    const DEALS=[
        {t:'ТОВ АгроТрейд — контракт на сезонні рейси зернових (серпень-жовтень)', c:2,amt:240000,stage:'consultation',ai:6,d:-5},
        {t:'ВАТ Метал-Груп — постійний партнер (2 рейси на тиждень)',               c:5,amt:96000, stage:'consultation',ai:6,d:-3},
        {t:'ТОВ FreshMart — рефрижератор Київ-Одеса (рефрижератор, щотижня)',       c:6,amt:48000, stage:'new',        ai:5,d:0},
        {t:'ТОВ БудМайстер — підвищення тарифу на 8% від травня',                  c:0,amt:8000,  stage:'consultation',ai:6,d:-1},
    ];
    DEALS.forEach(d=>{ops.push({type:'set',ref:cr.collection('crm_deals').doc(),data:{title:d.t,clientId:cRefs[d.c].id,clientName:CLIENTS[d.c].name,phone:CLIENTS[d.c].phone,amount:d.amt,stage:d.stage,assigneeId:sRefs[d.ai].id,assigneeName:STAFF[d.ai].name,source:'phone',isDemo:true,createdAt:dTs(d.d)}});});
    await window.safeBatchCommit(ops);ops=[];

    // РЕЙСИ
    const yr=new Date().getFullYear();
    const ROUTES=[
        {from:'Київ',   to:'Львів',     cargo:'Будматеріали',    wt:8,  vol:24,tariff:9500, dI:0,cI:0,fuel:1400,road:540, drv:1500,status:'closed',d:-8, note:'Блоки газобетонні, 2 піддони. Розвантаження о 14:00.'},
        {from:'Харків', to:'Одеса',     cargo:'Зернові (пшениця)',wt:20, vol:60,tariff:14000,dI:1,cI:2,fuel:2200,road:820, drv:2000,status:'closed',d:-6, note:'Зерновоз, 20т. Завантаження на елеваторі, розвантаження порт.'},
        {from:'Київ',   to:'Дніпро',   cargo:'Промислове обладнання',wt:5,vol:15,tariff:7500,dI:2,cI:3,fuel:980,road:360,drv:1200,status:'closed',d:-4, note:'Верстати ЧПК, 3 місця. Обережно — крихке!'},
        {from:'Львів',  to:'Харків',   cargo:'Текстиль',         wt:3,  vol:12,tariff:11000,dI:3,cI:4,fuel:1800,road:680, drv:1600,status:'paid',  d:-2, note:'Одяг, 8 паків. Завантаження 08:00, розвантаження до 18:00.'},
        {from:'Київ',   to:'Полтава',  cargo:'Продукти харчування',wt:12,vol:35,tariff:6500,dI:4,cI:6,fuel:780, road:280, drv:1000,status:'sent',  d:-1, note:'Рефрижератор +4°C. Термін доставки до 10:00.'},
        {from:'Одеса',  to:'Київ',     cargo:'Металопрокат',     wt:15, vol:20,tariff:12000,dI:0,cI:5,fuel:1600,road:580, drv:1800,status:'draft', d:0,  note:'Труби, арматура. Маса 15т. Потрібна платформа.'},
        {from:'Київ',   to:'Запоріжжя', cargo:'Будматеріали',           wt:8,  vol:24,tariff:8500, dI:1,cI:0,fuel:1100,road:400, drv:1400,status:'draft', d:1,  note:'ТОВ БудМайстер, 2-й рейс за тиждень. Цегла 8т.'},
    ];
    const rRefs=ROUTES.map(()=>cr.collection('sales_orders').doc());
    ROUTES.forEach((r,i)=>{
        const d=STAFF[r.dI];const c=CLIENTS[r.cI];
        const exp=[{type:'fuel',amount:r.fuel,note:'Паливо'},{type:'road',amount:r.road,note:'Платні дороги'},{type:'driver',amount:r.drv,note:'Оплата водія'}];
        const profit=r.tariff-r.fuel-r.road-r.drv;
        const isPaid=r.status==='closed'||r.status==='paid';
        ops.push({type:'set',ref:rRefs[i],data:{
            type:'route',number:`RTE-${yr}-${String(i+1).padStart(4,'0')}`,status:r.status,
            clientId:cRefs[r.cI].id,clientName:c.name,clientPhone:c.phone,
            date:dDate(r.d),routeFrom:r.from,routeTo:r.to,cargoWeight:r.wt,cargoVolume:r.vol,
            items:[{id:'1',name:`Перевезення ${r.from}–${r.to}`,qty:1,unit:'рейс',price:r.tariff,discount:0,total:r.tariff}],
            subtotal:r.tariff,discountTotal:0,total:r.tariff,
            paymentMethod:'transfer',paymentStatus:isPaid?'paid':'unpaid',paidAmount:isPaid?r.tariff:0,
            driverId:sRefs[r.dI].id,driverName:d.name,vehiclePlate:d.plate||'',
            routeExpenses:exp,routeProfit:profit,
            notes:r.note,isDemo:true,createdAt:dTs(r.d),updatedAt:now,
        }});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ЗАВДАННЯ
    const TASKS=[
        {t:'Рейс RTE-0006: Одеса→Київ — скоординувати завантаження металопрокату',  fi:1,ai:5,st:'in_progress',pr:'high',  d:0,tm:'07:00',est:30,r:'Микола підтвердив виїзд, ТТН оформлена'},
        {t:'Рейс RTE-0007: завтра Київ→Запоріжжя — підтвердити з БудМайстром',       fi:3,ai:6,st:'new',        pr:'high',  d:0,tm:'10:00',est:20,r:'Клієнт підтвердив, час завантаження 07:00'},
        {t:'Сергій Коваленко — перевірка тахографа і документів (щомісяця)',          fi:5,ai:5,st:'new',        pr:'medium',d:1,tm:'09:00',est:30,r:'Тахограф перевірено, документи в порядку або замовлено'},
        {t:'Виставити рахунок ТОВ Укрпромпостач (RTE-0004, 11 000 грн)',             fi:4,ai:6,st:'new',        pr:'high',  d:0,tm:'09:00',est:15,r:'Рахунок виставлений, відправлений email'},
        {t:'ФОП Іванченко — прострочення оплати 15 днів. Нагадати.',                 fi:4,ai:6,st:'overdue',   pr:'high',  d:-3,tm:'10:00',est:15,r:'Оплата отримана або домовились про дату'},
        {t:'Переговори АгроТрейд — контракт на сезон (зернові серп-жовт)',           fi:0,ai:6,st:'new',        pr:'high',  d:2,tm:'11:00',est:60,r:'Підписаний договір або перехід на наступний етап'},
        {t:'ТО авто AA1111BB (Микола) — пробіг 185 000 км',                         fi:2,ai:5,st:'new',        pr:'medium',d:3,tm:'09:00',est:240,r:'ТО виконано, запис в картку авто'},
        {t:'Звіт рентабельності рейсів за квітень (P&L по напрямках)',               fi:4,ai:6,st:'new',        pr:'medium',d:1,tm:'17:00',est:90,r:'Таблиця по напрямках: Київ-Львів vs Харків-Одеса'},
        {t:'Мороз Василь — продовження ліцензії водія (спливає 15.06)',             fi:5,ai:5,st:'new',        pr:'medium',d:7,tm:'09:00',est:30,r:'Документи подані, дата отримання відома'},
        {t:'Оновити сайт — додати нові напрямки і тарифи',                          fi:0,ai:6,st:'new',        pr:'low',   d:5,tm:'11:00',est:60,r:'Сайт оновлений, нові напрямки вказані'},
    ];
    TASKS.forEach(tk=>{ops.push({type:'set',ref:cr.collection('tasks').doc(),data:{title:tk.t,functionName:FUNCS[tk.fi].name,functionId:fRefs[tk.fi].id,assigneeId:sRefs[tk.ai].id,assigneeName:STAFF[tk.ai].name,status:tk.st,priority:tk.pr,deadlineDate:dDate(tk.d),scheduledTime:tk.tm,estimatedMinutes:tk.est,expectedResult:tk.r,isDemo:true,createdAt:now,updatedAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ПРОЦЕСИ
    const P1=[
        {n:'Прийом замовлення',       fn:3,ai:6,dur:30,desc:'Отримати заявку. Уточнити: маршрут, вантаж (вага/об\'єм/тип), дата, ціна. Виставити КП.'},
        {n:'Підбір водія та авто',    fn:1,ai:5,dur:20,desc:'Вибрати вільного водія. Перевірити документи і стан авто. Підтвердити готовність.'},
        {n:'Оформлення документів',   fn:3,ai:6,dur:30,desc:'Виписати ТТН або CMR. Договір-заявка. Страхування якщо треба.'},
        {n:'Інструктаж водія',        fn:2,ai:5,dur:20,desc:'Маршрут, контакт клієнта, час завантаження/розвантаження. Особливості вантажу.'},
        {n:'Контроль рейсу',          fn:1,ai:5,dur:0, desc:'Відстеження. Зв\'язок з водієм. Повідомлення клієнту про статус.'},
        {n:'Закриття рейсу',          fn:3,ai:6,dur:20,desc:'Підтвердження доставки. Підписані документи. Закрити рейс в системі.'},
        {n:'Виставлення рахунку',     fn:4,ai:6,dur:15,desc:'Виставити рахунок клієнту протягом доби. Контроль оплати.'},
        {n:'Розрахунок з водієм',     fn:4,ai:6,dur:15,desc:'Розрахувати оплату водія. Провести виплату. Зафіксувати в системі.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Стандарт виконання рейсу',description:'Від заявки клієнта до отримання оплати. 8 кроків.',category:'Основний',status:'active',steps:P1.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});
    await window.safeBatchCommit(ops);ops=[];

    // ФІНАНСИ
    try{for(const col of['finance_transactions','finance_categories','finance_accounts']){const s=await cr.collection(col).get();if(!s.empty){const d=s.docs.map(doc=>({type:'delete',ref:doc.ref}));await window.safeBatchCommit(d);}}}catch(e){}
    const accCard=cr.collection('finance_accounts').doc();
    const accCash=cr.collection('finance_accounts').doc();
    ops.push({type:'set',ref:accCard,data:{name:'ПриватБанк ФОП',type:'card',currency:'UAH',balance:284000,isDefault:true,isDemo:true,createdAt:now}});
    ops.push({type:'set',ref:accCash,data:{name:'Каса',          type:'cash',currency:'UAH',balance:12400, isDefault:false,isDemo:true,createdAt:now}});
    const CAT_I=['Оплата рейсів','Додаткові послуги (навантаження/розвантаження)'];
    const CAT_O=['Паливо','Платні дороги та збори','Зарплата водіїв','Зарплата диспетчера/менеджера','ТО та ремонт авто','Страхування','Офісні витрати'];
    const ciRefs=CAT_I.map(()=>cr.collection('finance_categories').doc());
    const coRefs=CAT_O.map(()=>cr.collection('finance_categories').doc());
    CAT_I.forEach((n,i)=>{ops.push({type:'set',ref:ciRefs[i],data:{name:n,type:'income', isDemo:true,createdAt:now}});});
    CAT_O.forEach((n,i)=>{ops.push({type:'set',ref:coRefs[i],data:{name:n,type:'expense',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    const TXNS=[
        {tp:'income', ci:0,acc:accCard,amt:9500, note:'Рейс RTE-0001 — Київ→Львів (БудМайстер)',           d:-8},
        {tp:'income', ci:0,acc:accCard,amt:14000,note:'Рейс RTE-0002 — Харків→Одеса (АгроТрейд)',          d:-6},
        {tp:'income', ci:0,acc:accCard,amt:7500, note:'Рейс RTE-0003 — Київ→Дніпро (ПП Карго)',            d:-4},
        {tp:'income', ci:0,acc:accCard,amt:11000,note:'Рейс RTE-0004 — Львів→Харків (Укрпромпостач)',      d:-2},
        {tp:'income', ci:0,acc:accCard,amt:28500,note:'Виручка березень — 3 рейси (БудМайстер 3×9500)',   d:-15},
        {tp:'income', ci:0,acc:accCard,amt:42000,note:'Виручка березень — АгроТрейд (3 рейси зернові)',   d:-12},
        {tp:'expense',ci:0,acc:accCard,amt:8680, note:'Паливо — Миколай+Сергій+Андрій (квітень, ч.1)',   d:-10},
        {tp:'expense',ci:1,acc:accCard,amt:3140, note:'Платні дороги — всі водії (квітень)',              d:-8},
        {tp:'expense',ci:2,acc:accCash,amt:18800,note:'Зарплата 5 водіїв (березень)',                    d:-28},
        {tp:'expense',ci:3,acc:accCard,amt:22000,note:'Зарплата диспетчер + менеджер (березень)',        d:-28},
        {tp:'expense',ci:4,acc:accCard,amt:12400,note:'ТО авто KA2222CC + AA3333DD (квітень)',           d:-5},
        {tp:'expense',ci:5,acc:accCard,amt:8400, note:'Страхування ОСЦПВ 5 авто (квітал)',              d:-20},
        {tp:'expense',ci:6,acc:accCash,amt:6800, note:'Оренда офісу + телефонія (квітень)',             d:-1},
        {tp:'expense',ci:2,acc:accCash,amt:18800,note:'Зарплата водіїв (квітень)',                      d:-1},
        {tp:'expense',ci:3,acc:accCard,amt:22000,note:'Зарплата диспетчер+менеджер (квітень)',          d:-1},
    ];
    TXNS.forEach(tx=>{ops.push({type:'set',ref:cr.collection('finance_transactions').doc(),data:{type:tx.tp,categoryId:(tx.tp==='income'?ciRefs:coRefs)[tx.ci].id,categoryName:(tx.tp==='income'?CAT_I:CAT_O)[tx.ci],accountId:tx.acc.id,amount:tx.amt,note:tx.note,date:dDate(tx.d),createdAt:dTs(tx.d),isDemo:true}});});
    await window.safeBatchCommit(ops);ops=[];

    const KPI=[
        {name:'Виручка тижнева',          unit:'₴', target:55000,vals:[38400,42000,45600,48200,51000,47800,53400]},
        {name:'Кількість рейсів за тиждень',unit:'шт',target:6,  vals:[4,4,5,5,6,5,6]},
        {name:'Середній тариф рейсу',     unit:'₴', target:10000,vals:[8200,8900,9100,9600,10200,9800,10400]},
        {name:'Рентабельність рейсів',    unit:'%', target:35,   vals:[28,30,31,33,35,32,36]},
        {name:'Відсоток вчасних доставок',unit:'%', target:95,   vals:[88,91,90,93,94,92,96]},
    ];
    KPI.forEach(k=>{ops.push({type:'set',ref:cr.collection('kpi_metrics').doc(),data:{name:k.name,unit:k.unit,target:k.target,values:k.vals.map((v,i)=>({value:v,date:dDate(-42+i*7)})),currentValue:k.vals[k.vals.length-1],trend:k.vals[k.vals.length-1]>k.vals[k.vals.length-2]?'up':'down',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    await cr.update({name:'Логіст Про',niche:'logistics',nicheLabel:'Логістика — вантажні перевезення',description:'Транспортна компанія Логіст Про — вантажні перевезення по Україні. 5 водіїв, 5 авто (до 20т), комп\'ютерна диспетчеризація. Київ, вул. Складська 22.',city:'Київ',employees:7,currency:'UAH',avgCheck:10571,monthlyRevenue:228000,companyGoal:'6+ рейсів на тиждень, рентабельність 35%+, 3+ постійних клієнти з контрактами',companyConcept:'Водій знає маршрут до виїзду. Клієнт отримує підтвердження. Власник бачить рентабельність кожного напрямку.',targetAudience:'Торгові компанії, виробники, дистриб\'ютори з регулярними потребами перевезення 3-20т.',modules:{scheduling:false,clientProfile:true,loyalty:false,subscriptions:false,reviews:false,winback:true,notifications:true,estimates:false,warehouse:false,booking:false,sales:true},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
};
if (window._NICHE_LABELS) window._NICHE_LABELS['logistics'] = 'Логіст Про — Вантажні перевезення (Київ)';

// ════════════════════════════════════════════════════════════════════════════
// ХАРЧОВЕ ВИРОБНИЦТВО — КухняПро
// ════════════════════════════════════════════════════════════════════════════
window._DEMO_NICHE_MAP['food_production'] = async function() {
    if (!window.currentCompanyId || !window.db) throw new Error('No company');
    const cr = window.db.collection('companies').doc(window.currentCompanyId);
    const uid = window.currentUser?.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    function dDate(d){const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10);}
    function dTs(d){return firebase.firestore.Timestamp.fromDate(new Date(Date.now()+d*86400000));}
    let ops=[];

    const FUNCS=[
        {name:'0. Маркетинг та продажі',  color:'#ec4899',desc:'Пошук клієнтів, прайс, переговори, контракти'},
        {name:'1. Прийом замовлень',       color:'#22c55e',desc:'Обробка замовлень, узгодження меню, підтвердження'},
        {name:'2. Виробництво / Кухня',   color:'#f97316',desc:'Приготування страв за рецептурами, якість, норми'},
        {name:'3. Склад та закупівлі',    color:'#6366f1',desc:'Сировина, залишки, замовлення, постачальники'},
        {name:'4. Відвантаження',         color:'#0ea5e9',desc:'Пакування, документи, доставка клієнтам'},
        {name:'5. Фінанси та облік',      color:'#10b981',desc:'Собівартість, рентабельність, рахунки, P&L'},
        {name:'6. Команда',              color:'#8b5cf6',desc:'Кухарі, технолог, графік, санітарні норми'},
        {name:'7. Управління та розвиток',color:'#f59e0b',desc:'Нові страви, рецептури, масштабування, HACCP'},
    ];
    const fRefs=FUNCS.map(()=>cr.collection('functions').doc());
    FUNCS.forEach((f,i)=>{ops.push({type:'set',ref:fRefs[i],data:{name:f.name,color:f.color,description:f.desc,order:i,status:'active',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    try{const o=await cr.collection('users').get();if(!o.empty){const d=[];o.docs.forEach(doc=>{if(doc.id!==uid)d.push({type:'delete',ref:cr.collection('users').doc(doc.id)});});if(d.length)await window.safeBatchCommit(d);}}catch(e){}
    const STAFF=[
        {name:'Галина Пономаренко', role:'Шеф-кухар / Технолог',   fn:2,email:'ponomarenko@kukhnya.ua',phone:'+380671140001'},
        {name:'Оксана Ковальчук',   role:'Кухар (перші страви)',    fn:2,email:'kovalchuk@kukhnya.ua',  phone:'+380671140002'},
        {name:'Микола Сердюк',      role:'Кухар (другі страви)',    fn:2,email:'serdyuk@kukhnya.ua',    phone:'+380671140003'},
        {name:'Ірина Білоус',       role:'Пекар / Кондитер',        fn:2,email:'bilous@kukhnya.ua',     phone:'+380671140004'},
        {name:'Тетяна Власенко',    role:'Менеджер замовлень',      fn:1,email:'vlasenko@kukhnya.ua',   phone:'+380671140005'},
        {name:'Сергій Ткаченко',    role:'Водій / Комірник',        fn:4,email:'tkachenko@kukhnya.ua',  phone:'+380671140006'},
    ];
    const sRefs=STAFF.map(()=>cr.collection('staff').doc());
    const uRefs=STAFF.map(()=>cr.collection('users').doc());
    STAFF.forEach((s,i)=>{
        ops.push({type:'set',ref:sRefs[i],data:{name:s.name,role:s.role,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,phone:s.phone,isActive:true,isDemo:true,createdAt:now}});
        ops.push({type:'set',ref:uRefs[i],data:{name:s.name,email:s.email,role:'employee',functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,staffId:sRefs[i].id,isDemo:true,createdAt:now}});
    });
    FUNCS.forEach((f,i)=>{const oi=STAFF.findIndex(s=>s.fn===i);if(oi>=0)ops.push({type:'update',ref:fRefs[i],data:{ownerId:sRefs[oi].id,ownerName:STAFF[oi].name}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM КЛІЄНТИ — оптові покупці
    const CLIENTS=[
        {name:'ТОВ Кейтеринг Плюс',     phone:'+380441141001',email:'catering@plus.ua',  notes:'Щотижневі замовлення: борщ 60 порц., котлети 40 порц. Оплата 3 дні.',spent:74400,d:-3},
        {name:'Мережа кафе "СмакО"',    phone:'+380441141002',email:'smako@cafe.ua',      notes:'5 точок, кожна по 30 порц. Разом 150 порц/тиждень. Великий клієнт!',spent:182000,d:-1},
        {name:'Лікарня №3 (їдальня)',   phone:'+380441141003',email:'likarn@hosp.ua',     notes:'Держзамовлення. Дієтичне харчування. Платить місяць-в-місяць.',spent:96000,d:-7},
        {name:'Дитячий садок №48',      phone:'+380441141004',email:'sadok@dz.ua',        notes:'Сніданки для 120 дітей. Спец. меню (без гострого, без горіхів).',spent:48000,d:-5},
        {name:'Офіс-центр TechHub',     phone:'+380441141005',email:'info@techhub.ua',    notes:'Бізнес-ланчі 80 осіб щодня. Преміальний клієнт, платить вчасно.',spent:128000,d:-2},
        {name:'ФОП Марченко (магазин)', phone:'+380441141006',email:'march@shop.ua',      notes:'Готова продукція в роздріб: хліб, випічка, десерти. 3×/тиждень.',spent:32000,d:-4},
    ];
    const cRefs=CLIENTS.map(()=>cr.collection('crm_clients').doc());
    CLIENTS.forEach((c,i)=>{ops.push({type:'set',ref:cRefs[i],data:{name:c.name,phone:c.phone,email:c.email,source:'direct',status:'active',notes:c.notes,totalSpent:c.spent,lastOrderDate:dDate(c.d),isDemo:true,createdAt:dTs(c.d-30)}});});
    await window.safeBatchCommit(ops);ops=[];

    // CRM УГОДИ
    const DEALS=[
        {t:'Мережа "СмакО" — розширення до 7 точок (+2 нові, +80 порц./тиждень)',c:1,amt:52000,stage:'consultation',ai:4,d:-5},
        {t:'Школа №145 — харчування учнів (380 обідів/день, вересень-травень)',  c:2,amt:285000,stage:'new',        ai:4,d:-2},
        {t:'Корпорація KPI Group — щоденні бізнес-ланчі 50 осіб',               c:4,amt:48000, stage:'consultation',ai:4,d:-3},
    ];
    DEALS.forEach(d=>{ops.push({type:'set',ref:cr.collection('crm_deals').doc(),data:{title:d.t,clientId:cRefs[d.c].id,clientName:CLIENTS[d.c].name,phone:CLIENTS[d.c].phone,amount:d.amt,stage:d.stage,assigneeId:sRefs[d.ai].id,assigneeName:STAFF[d.ai].name,source:'phone',isDemo:true,createdAt:dTs(d.d)}});});
    await window.safeBatchCommit(ops);ops=[];

    // СКЛАД СИРОВИНИ
    const INGR=[
        {name:'Борошно пшеничне в/с (25кг)',qty:12, unit:'меш',price:680,  cat:'Бакалія',  min:4},
        {name:'Цукор (50кг)',                qty:6,  unit:'меш',price:1600, cat:'Бакалія',  min:2},
        {name:'Сіль кухонна',                qty:18, unit:'кг', price:8,    cat:'Бакалія',  min:5},
        {name:'Олія соняшникова рафін.',      qty:48, unit:'л',  price:65,   cat:'Бакалія',  min:15},
        {name:'Масло вершкове 82.5%',         qty:24, unit:'кг', price:280,  cat:'Молочні',  min:8},
        {name:'Яйця С1 (лоток 30 шт)',        qty:40, unit:'лот',price:195,  cat:'Молочні',  min:15},
        {name:'Молоко 3.2% (1л)',             qty:120,unit:'л',  price:32,   cat:'Молочні',  min:40},
        {name:'Сметана 20%',                  qty:32, unit:'кг', price:95,   cat:'Молочні',  min:10},
        {name:'Картопля (мішок 25кг)',        qty:8,  unit:'меш',price:300,  cat:'Овочі',    min:3},
        {name:'Буряк (кг)',                   qty:85, unit:'кг', price:14,   cat:'Овочі',    min:25},
        {name:'Морква (кг)',                  qty:62, unit:'кг', price:16,   cat:'Овочі',    min:20},
        {name:'Капуста білокачанна',          qty:48, unit:'кг', price:10,   cat:'Овочі',    min:15},
        {name:'Цибуля ріпчаста',              qty:38, unit:'кг', price:18,   cat:'Овочі',    min:12},
        {name:'М\'ясо свинина (лопатка)',     qty:68, unit:'кг', price:185,  cat:'М\'ясо',   min:20},
        {name:'М\'ясо яловичина (лопатка)',   qty:32, unit:'кг', price:220,  cat:'М\'ясо',   min:10},
        {name:'Курятина грудка',              qty:52, unit:'кг', price:130,  cat:'М\'ясо',   min:15},
        {name:'Риба (тилапія заморож.)',       qty:24, unit:'кг', price:165,  cat:'Риба',     min:8},
        {name:'Какао-порошок',                qty:12, unit:'кг', price:380,  cat:'Кондит.',  min:3},
        {name:'Шоколад чорний 70%',           qty:16, unit:'кг', price:480,  cat:'Кондит.',  min:4},
        {name:'Дріжджі сухі (500г)',          qty:20, unit:'упак',price:110, cat:'Бакалія',  min:6},
        {name:'Ванільний цукор',              qty:8,  unit:'кг', price:260,  cat:'Кондит.',  min:2},
        {name:'Розпушувач для тіста',         qty:6,  unit:'кг', price:180,  cat:'Кондит.',  min:2},
    ];
    const iRefs=INGR.map(()=>cr.collection('warehouse_items').doc());
    INGR.forEach((it,i)=>{ops.push({type:'set',ref:iRefs[i],data:{name:it.name,quantity:it.qty,price:it.price,unit:it.unit,category:it.cat,minQuantity:it.min,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // КАТАЛОГ (готова продукція для продажу)
    const PRODUCTS=[
        {name:'Борщ класичний (порція)',      price:95,  unit:'порція',cat:'Перші страви'},
        {name:'Суп курячий (порція)',          price:80,  unit:'порція',cat:'Перші страви'},
        {name:'Котлета по-домашньому',        price:75,  unit:'порція',cat:'Другі страви'},
        {name:'Риба запечена',                price:95,  unit:'порція',cat:'Другі страви'},
        {name:'Тефтелі в соусі',             price:70,  unit:'порція',cat:'Другі страви'},
        {name:'Вареники з картоплею (6 шт)', price:65,  unit:'порція',cat:'Другі страви'},
        {name:'Пюре картопляне (порція)',     price:35,  unit:'порція',cat:'Гарніри'},
        {name:'Рис відварний (порція)',       price:30,  unit:'порція',cat:'Гарніри'},
        {name:'Шоколадний брауні (порція)',   price:85,  unit:'порція',cat:'Десерти'},
        {name:'Тірамісу домашнє',            price:90,  unit:'порція',cat:'Десерти'},
        {name:'Хліб пшеничний (буханка 700г)',price:45, unit:'шт',    cat:'Хліб'},
        {name:'Хліб житній (буханка 600г)',  price:50,  unit:'шт',    cat:'Хліб'},
        {name:'Пиріг з яблуками (1 кг)',     price:120, unit:'шт',    cat:'Випічка'},
        {name:'Круасани (упаковка 6 шт)',     price:85,  unit:'упак',  cat:'Випічка'},
        {name:'Бізнес-ланч (комплекс)',       price:135, unit:'компл', cat:'Бізнес-ланч'},
    ];
    const pRefs=PRODUCTS.map(()=>cr.collection('sales_products').doc());
    PRODUCTS.forEach((p,i)=>{ops.push({type:'set',ref:pRefs[i],data:{name:p.name,price:p.price,unit:p.unit,category:p.cat,isActive:true,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // РЕЦЕПТУРИ
    const yr=new Date().getFullYear();
    function calcCost(ingrs,portions){
        let total=0;
        ingrs.forEach(i=>{let q=i.qty;if(i.unit==='г'||i.unit==='мл')q/=1000;i.cost=Math.round(q*(i.price||0)*100)/100;total+=i.cost;});
        return{totalCost:Math.round(total*100)/100,costPerPortion:Math.round(total/portions*100)/100};
    }
    const RECIPES=[
        {name:'Борщ класичний',cat:'Перші страви',yield:10000,portions:100,salePrice:95,
         tech:'1. Зварити м\'ясний бульйон (свинина 1.5 год). 2. Буряк: нарізати соломкою, тушкувати з олією і оцтом 15 хв. 3. Морква+цибуля: пасерувати 10 хв. 4. Картоплю додати в бульйон, 10 хв. 5. Капусту — 5 хв до готовності. 6. Засмажку і буряк — 5 хв. Сметана при подачі.',
         ingrs:[
            {name:'Свинина',qty:1500,unit:'г',price:0.185,wI:13},
            {name:'Буряк',  qty:3000,unit:'г',price:0.014,wI:9},
            {name:'Картопля',qty:2500,unit:'г',price:0.012,wI:8},
            {name:'Морква', qty:800, unit:'г',price:0.016,wI:10},
            {name:'Капуста',qty:2000,unit:'г',price:0.010,wI:11},
            {name:'Цибуля', qty:600, unit:'г',price:0.018,wI:12},
            {name:'Олія',   qty:300, unit:'мл',price:0.065,wI:3},
            {name:'Сіль',   qty:80,  unit:'г',price:0.008,wI:2},
        ]},
        {name:'Котлета по-домашньому',cat:'Другі страви',yield:100,portions:1,salePrice:75,
         tech:'1. Фарш (свинина+яловичина) змішати з цибулею, яйцем, сіллю. Вимісити 5 хв. 2. Сформувати котлети 100г. 3. Обваляти в панірувальних сухарях. 4. Смажити на олії 4 хв з кожного боку. 5. Довести до готовності в духовці 180°C, 10 хв.',
         ingrs:[
            {name:'Свинина',qty:60, unit:'г',price:0.185,wI:13},
            {name:'Яловичина',qty:60,unit:'г',price:0.220,wI:14},
            {name:'Яйце',   qty:0.5,unit:'шт',price:6.5, wI:5},
            {name:'Цибуля', qty:15, unit:'г',price:0.018,wI:12},
            {name:'Сіль',   qty:2,  unit:'г',price:0.008,wI:2},
            {name:'Олія',   qty:15, unit:'мл',price:0.065,wI:3},
        ]},
        {name:'Шоколадний брауні',cat:'Десерти',yield:600,portions:12,salePrice:85,
         tech:'1. Шоколад + масло розтопити на водяній бані. 2. Яйця збити з цукром до піни. 3. Додати шоколадну суміш, какао, борошно. 4. Вилити у форму 20×20 см. 5. Випікати 25 хв при 175°C. 6. Охолодити, нарізати порціями.',
         ingrs:[
            {name:'Шоколад чорний',qty:200,unit:'г',price:0.480,wI:18},
            {name:'Масло вершкове',qty:150,unit:'г',price:0.280,wI:4},
            {name:'Яйця',qty:4,unit:'шт',price:6.5,wI:5},
            {name:'Цукор',qty:150,unit:'г',price:0.032,wI:1},
            {name:'Борошно',qty:80,unit:'г',price:0.027,wI:0},
            {name:'Какао',qty:30,unit:'г',price:0.380,wI:17},
        ]},
        {name:'Хліб пшеничний',cat:'Хліб',yield:700,portions:1,salePrice:45,
         tech:'1. Дріжджі розвести в теплій воді (35°C). 2. Борошно + сіль + олія + дріжджова суміш — замісити тісто 10 хв. 3. Підходити 60 хв при 28°C. 4. Обім\'яти, сформувати буханку. 5. Вистоювання 30 хв. 6. Випікати 35 хв при 200°C.',
         ingrs:[
            {name:'Борошно',qty:500,unit:'г',price:0.027,wI:0},
            {name:'Дріжджі',qty:7,  unit:'г',price:0.220,wI:19},
            {name:'Сіль',   qty:10, unit:'г',price:0.008,wI:2},
            {name:'Олія',   qty:20, unit:'мл',price:0.065,wI:3},
        ]},
        {name:'Бізнес-ланч (комплекс)',cat:'Бізнес-ланч',yield:500,portions:1,salePrice:135,
         tech:'Комплекс: перша страва (250 мл борщу) + друга страва (котлета 100г + гарнір 150г) + хліб 50г + напій (компот/чай). Зборка і упаковка на лінії.',
         ingrs:[
            {name:'Борщ готовий',qty:250,unit:'г',price:0.0482,wI:9},
            {name:'Котлета',qty:100,unit:'г',price:0.380,wI:13},
            {name:'Картопля',qty:150,unit:'г',price:0.012,wI:8},
            {name:'Хліб',qty:50,unit:'г',price:0.064,wI:0},
            {name:'Олія для картоплі',qty:10,unit:'мл',price:0.065,wI:3},
        ]},
    ];
    const recipeRefs=RECIPES.map(()=>cr.collection('fp_recipes').doc());
    RECIPES.forEach((r,i)=>{
        const ingrs=r.ingrs.map(ing=>({name:ing.name,grossQty:ing.qty,netQty:Math.round(ing.qty*0.9),unit:ing.unit,pricePerUnit:ing.price,cost:0,warehouseItemId:ing.wI>=0?iRefs[ing.wI].id:''}));
        const{totalCost,costPerPortion}=calcCost(ingrs,r.portions);
        const margin=r.salePrice>0?Math.round((r.salePrice-costPerPortion)/r.salePrice*100):null;
        ops.push({type:'set',ref:recipeRefs[i],data:{name:r.name,category:r.cat,yield:r.yield,portions:r.portions,salePrice:r.salePrice,technology:r.tech,ingredients:ingrs,totalCost,costPerPortion,margin,isDemo:true,createdAt:now}});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ПЛАН ВИРОБНИЦТВА (сьогодні)
    const today=new Date().toISOString().slice(0,10);
    const PLAN=[
        {rI:0,portions:100,status:'planned',   note:'Борщ для Кейтеринг Плюс (60) + СмакО (40)'},
        {rI:4,portions:80, status:'planned',   note:'Бізнес-ланч для ТехХаб (80 комплектів до 11:30)'},
        {rI:2,portions:48, status:'in_progress',note:'Брауні — форм 4×12 порц. (замовлення магазин+кафе)'},
        {rI:3,portions:30, status:'in_progress',note:'Хліб пшеничний — 30 буханок (розвезення о 07:30)'},
        {rI:1,portions:50, status:'done',       note:'Котлети — 50 порц. для лікарні (доставлено о 09:00)'},
    ];
    PLAN.forEach(p=>{ops.push({type:'set',ref:cr.collection('fp_production_plan').doc(),data:{recipeId:recipeRefs[p.rI].id,recipeName:RECIPES[p.rI].name,portions:p.portions,date:today,status:p.status,notes:p.note,isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ВІДВАНТАЖЕННЯ (рахунки)
    const INVOICES=[
        {c:0,items:[{p:0,q:60},{p:2,q:20}], method:'transfer',status:'paid',   d:-7,  note:'Тижневе замовлення Кейтеринг Плюс'},
        {c:1,items:[{p:0,q:150},{p:6,q:80},{p:7,q:80}],method:'transfer',status:'paid',d:-5,note:'СмакО — 5 точок, тижневе замовлення'},
        {c:4,items:[{p:14,q:80}],           method:'transfer',status:'paid',   d:-3,  note:'TechHub — бізнес-ланчі 80 осіб'},
        {c:2,items:[{p:0,q:200},{p:2,q:150},{p:6,q:200}],method:'transfer',status:'sent',d:-1,note:'Лікарня №3 — тижневе замовлення'},
        {c:5,items:[{p:10,q:25},{p:12,q:10},{p:13,q:15}],method:'cash',status:'paid',d:-2,note:'Магазин Марченко — хліб і випічка'},
    ];
    INVOICES.forEach((inv,i)=>{
        const c=CLIENTS[inv.c];
        const items=inv.items.map(it=>{const p=PRODUCTS[it.p];return{id:'p'+it.p,name:p.name,qty:it.q,unit:p.unit,price:p.price,discount:0,total:p.price*it.q};});
        const total=items.reduce((s,x)=>s+x.total,0);
        const isPaid=inv.status==='paid';
        ops.push({type:'set',ref:cr.collection('sales_orders').doc(),data:{type:'invoice',number:`INV-${yr}-${String(i+1).padStart(4,'0')}`,status:inv.status,clientId:cRefs[inv.c].id,clientName:c.name,clientPhone:c.phone,date:dDate(inv.d),items,subtotal:total,discountTotal:0,total,paymentMethod:inv.method,paymentStatus:isPaid?'paid':'unpaid',paidAmount:isPaid?total:0,notes:inv.note,isDemo:true,createdAt:dTs(inv.d),updatedAt:now}});
    });
    await window.safeBatchCommit(ops);ops=[];

    // ЗАВДАННЯ
    const TASKS=[
        {t:'Зготовити 100 порцій борщу до 10:30 (Кейтеринг Плюс 60 + СмакО 40)',   fi:2,ai:1,st:'in_progress',pr:'high',  d:0,tm:'07:00',est:90, r:'100 порцій у контейнерах, готові до відвантаження'},
        {t:'Бізнес-ланч TechHub 80 компл. — зборка лінія до 11:30',                 fi:2,ai:2,st:'in_progress',pr:'high',  d:0,tm:'09:00',est:150,r:'80 комплектів упаковані, маркіровані, передані водію'},
        {t:'Хліб 30 буханок — розвезення о 07:30 (магазин Марченко)',               fi:4,ai:5,st:'done',       pr:'high',  d:0,tm:'07:00',est:60, r:'Хліб доставлено, накладна підписана'},
        {t:'Замовити борошно — залишок 12 мішків, потрібно 20 (виробництво тижень)',fi:3,ai:4,st:'new',        pr:'high',  d:0,tm:'08:00',est:20, r:'Замовлення відправлено, дата доставки підтверджена'},
        {t:'Перевірити холодильники — температурний журнал HACCP (щодня)',          fi:6,ai:0,st:'new',        pr:'high',  d:0,tm:'07:00',est:15, r:'Температури записані: м\'ясо +2°C, молочні +4°C'},
        {t:'Виставити рахунок лікарні №3 (тижневе, ~14 000 грн)',                   fi:5,ai:4,st:'new',        pr:'high',  d:0,tm:'09:00',est:15, r:'Рахунок виставлений і відправлений email'},
        {t:'Переговори з Школою №145 — харчування учнів (бюджетний контракт)',       fi:0,ai:4,st:'new',        pr:'high',  d:2,tm:'10:00',est:120,r:'Договір підписаний або наступний крок визначений'},
        {t:'Оновити технологічну карту на котлети — нові норми МОЗ від квітня',      fi:7,ai:0,st:'new',        pr:'medium',d:3,tm:'14:00',est:90, r:'Картка оновлена, підписана технологом, зберігається'},
        {t:'Брауні — тестова партія з лісовими горіхами (запит СмакО)',             fi:2,ai:3,st:'new',        pr:'low',   d:4,tm:'15:00',est:120,r:'Тест-партія 12 порц., фото, зразки до СмакО'},
        {t:'Санітарна обробка цеху (щоп\'ятниці) — дезінфекція HACCP',            fi:6,ai:0,st:'new',        pr:'medium',d:4,tm:'17:00',est:90, r:'Акт дезінфекції підписаний, журнал оновлено'},
        {t:'Звіт рентабельності по стравах за квітень',                             fi:5,ai:4,st:'new',        pr:'medium',d:1,tm:'17:00',est:60, r:'Таблиця: борщ 95% маржа, брауні 63%, хліб 42%'},
        {t:'ФОП Іванченко (магазин) — збільшити обсяг хліба з 15 до 25 буханок',   fi:0,ai:4,st:'overdue',   pr:'medium',d:-2,tm:'11:00',est:20, r:'Домовились + оновили договір'},
    ];
    TASKS.forEach(tk=>{ops.push({type:'set',ref:cr.collection('tasks').doc(),data:{title:tk.t,functionName:FUNCS[tk.fi].name,functionId:fRefs[tk.fi].id,assigneeId:sRefs[tk.ai].id,assigneeName:STAFF[tk.ai].name,status:tk.st,priority:tk.pr,deadlineDate:dDate(tk.d),scheduledTime:tk.tm,estimatedMinutes:tk.est,expectedResult:tk.r,isDemo:true,createdAt:now,updatedAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    // ПРОЦЕСИ
    const P1=[
        {n:'Отримання замовлення',    fn:1,ai:4,dur:20,desc:'Прийняти замовлення від клієнта. Перевірити наявність по рецептурах і складу. Підтвердити дату і обсяг.'},
        {n:'Перевірка стоп-листа',    fn:3,ai:4,dur:15,desc:'Перевірити чи вистачає всіх інгредієнтів. Якщо є нестача — замовити терміново або повідомити клієнта.'},
        {n:'Постановка у план',       fn:2,ai:0,dur:10,desc:'Додати позиції в план виробництва на потрібну дату. Призначити кухарів.'},
        {n:'Закупівля якщо потрібно', fn:3,ai:4,dur:30,desc:'Замовити відсутні інгредієнти. Отримати і оприбуткувати на склад.'},
        {n:'Виробництво',             fn:2,ai:1,dur:180,desc:'Приготування за рецептурою. Дотримання температурних режимів. Фото контроль якості.'},
        {n:'Пакування та маркування', fn:4,ai:5,dur:30,desc:'Розфасувати порції. Нанести маркування: дата, склад, кількість. Підготувати супровідні документи.'},
        {n:'Відвантаження',           fn:4,ai:5,dur:30,desc:'Завантажити авто. Підписати накладну. Доставка клієнту до обумовленого часу.'},
        {n:'Виставлення рахунку',     fn:5,ai:4,dur:15,desc:'Виставити рахунок протягом доби. Контроль оплати у термін.'},
    ];
    ops.push({type:'set',ref:cr.collection('processes').doc(),data:{name:'Виробництво та відвантаження',description:'Від замовлення клієнта до доставки і оплати. 8 кроків.',category:'Основний',status:'active',steps:P1.map((s,i)=>({id:`s${i}`,name:s.n,description:s.desc,functionId:fRefs[s.fn].id,functionName:FUNCS[s.fn].name,assigneeId:sRefs[s.ai].id,assigneeName:STAFF[s.ai].name,estimatedMinutes:s.dur,order:i,status:'active'})),isDemo:true,createdAt:now}});
    await window.safeBatchCommit(ops);ops=[];

    // ФІНАНСИ
    try{for(const col of['finance_transactions','finance_categories','finance_accounts']){const s=await cr.collection(col).get();if(!s.empty){const d=s.docs.map(doc=>({type:'delete',ref:doc.ref}));await window.safeBatchCommit(d);}}}catch(e){}
    const accCard=cr.collection('finance_accounts').doc();
    const accCash=cr.collection('finance_accounts').doc();
    ops.push({type:'set',ref:accCard,data:{name:'ПриватБанк ФОП',type:'card',currency:'UAH',balance:184000,isDefault:true, isDemo:true,createdAt:now}});
    ops.push({type:'set',ref:accCash,data:{name:'Каса',          type:'cash',currency:'UAH',balance:8400, isDefault:false,isDemo:true,createdAt:now}});
    const CAT_I=['Оплата замовлень (оптові клієнти)','Роздрібні продажі'];
    const CAT_O=['Сировина та інгредієнти','Оренда цеху','Зарплата виробничого персоналу','Пакувальні матеріали','Комунальні послуги','Реклама та маркетинг'];
    const ciRefs=CAT_I.map(()=>cr.collection('finance_categories').doc());
    const coRefs=CAT_O.map(()=>cr.collection('finance_categories').doc());
    CAT_I.forEach((n,i)=>{ops.push({type:'set',ref:ciRefs[i],data:{name:n,type:'income', isDemo:true,createdAt:now}});});
    CAT_O.forEach((n,i)=>{ops.push({type:'set',ref:coRefs[i],data:{name:n,type:'expense',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    const TXNS=[
        {tp:'income', ci:0,acc:accCard,amt:16050,note:'Кейтеринг Плюс — тижн. замовлення (борщ 60 + котлети 20)',d:-7},
        {tp:'income', ci:0,acc:accCard,amt:34800,note:'СмакО — 5 точок, тижневе (150 борщів + гарніри)',         d:-5},
        {tp:'income', ci:0,acc:accCard,amt:10800,note:'TechHub — бізнес-ланчі 80 осіб',                          d:-3},
        {tp:'income', ci:1,acc:accCash,amt:4200, note:'Магазин Марченко — хліб+випічка (тиждень)',               d:-2},
        {tp:'income', ci:0,acc:accCard,amt:72000,note:'Лікарня №3 — харчування місяць (березень)',               d:-20},
        {tp:'income', ci:0,acc:accCard,amt:48000,note:'Дитсадок №48 — харчування місяць (березень)',             d:-18},
        {tp:'income', ci:0,acc:accCard,amt:38400,note:'СмакО — квітень 1-й тиждень (4 замовлення)',              d:-8},
        {tp:'expense',ci:0,acc:accCard,amt:32400,note:'Закупівля сировини — ринок+постачальники (квітень)',      d:-5},
        {tp:'expense',ci:1,acc:accCash,amt:18000,note:'Оренда виробничого цеху 120м² (квітень)',                 d:-1},
        {tp:'expense',ci:2,acc:accCard,amt:38000,note:'Зарплата 6 працівників (березень)',                      d:-28},
        {tp:'expense',ci:3,acc:accCard,amt:4800, note:'Контейнери, фольга, пакети (квітень)',                   d:-3},
        {tp:'expense',ci:4,acc:accCash,amt:8400, note:'Газ + електрика + вода (квітень)',                       d:-1},
        {tp:'expense',ci:0,acc:accCard,amt:30800,note:'Закупівля сировини (березень)',                          d:-20},
        {tp:'expense',ci:1,acc:accCash,amt:18000,note:'Оренда цеху (березень)',                                 d:-28},
        {tp:'expense',ci:2,acc:accCard,amt:38000,note:'Зарплата (квітень)',                                     d:-1},
    ];
    TXNS.forEach(tx=>{ops.push({type:'set',ref:cr.collection('finance_transactions').doc(),data:{type:tx.tp,categoryId:(tx.tp==='income'?ciRefs:coRefs)[tx.ci].id,categoryName:(tx.tp==='income'?CAT_I:CAT_O)[tx.ci],accountId:tx.acc.id,amount:tx.amt,note:tx.note,date:dDate(tx.d),createdAt:dTs(tx.d),isDemo:true}});});
    await window.safeBatchCommit(ops);ops=[];

    const KPI=[
        {name:'Виручка тижнева',              unit:'₴',  target:48000,vals:[32400,36800,40200,43600,45800,42400,46200]},
        {name:'Кількість порцій за тиждень',  unit:'шт', target:1500, vals:[980,1120,1240,1360,1480,1380,1520]},
        {name:'Середня маржа по стравах',     unit:'%',  target:65,   vals:[58,61,63,64,67,65,68]},
        {name:'Відсоток вчасних відвантажень',unit:'%',  target:98,   vals:[92,94,95,96,97,95,98]},
        {name:'Активних клієнтів',            unit:'шт', target:8,    vals:[4,4,5,5,6,6,6]},
    ];
    KPI.forEach(k=>{ops.push({type:'set',ref:cr.collection('kpi_metrics').doc(),data:{name:k.name,unit:k.unit,target:k.target,values:k.vals.map((v,i)=>({value:v,date:dDate(-42+i*7)})),currentValue:k.vals[k.vals.length-1],trend:k.vals[k.vals.length-1]>k.vals[k.vals.length-2]?'up':'down',isDemo:true,createdAt:now}});});
    await window.safeBatchCommit(ops);ops=[];

    await cr.update({name:'КухняПро — Фабрика-кухня',niche:'food_production',nicheLabel:'Харчове виробництво — фабрика-кухня',description:'Виробництво готових страв для корпоративних клієнтів. 6 співробітників, цех 120м², HACCP. Київ, вул. Харчова 12.',city:'Київ',employees:6,currency:'UAH',avgCheck:28000,monthlyRevenue:185000,companyGoal:'8+ постійних клієнтів, 2 000 порцій/тиждень, HACCP сертифікація',companyConcept:'Борщ як вдома — для 1000 чоловік. Технологічна карта = стабільний смак щодня.',targetAudience:'Кейтеринг-компанії, корпоративні їдальні, лікарні, дитсадки, мережі кафе.',modules:{scheduling:false,clientProfile:true,loyalty:false,subscriptions:false,reviews:false,winback:true,notifications:true,estimates:false,warehouse:true,booking:false,sales:true},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
};
if (window._NICHE_LABELS) window._NICHE_LABELS['food_production'] = 'КухняПро — Харчове виробництво (Київ)';
