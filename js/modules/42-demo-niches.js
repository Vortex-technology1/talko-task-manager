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
