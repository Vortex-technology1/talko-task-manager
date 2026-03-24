// ============================================================
// 42-niche-cleaning.js — Клінінгова компанія (США)
// SparkClean Pro — Commercial & Residential Cleaning, Austin TX
// ============================================================
'use strict';

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

window._DEMO_NICHE_MAP['cleaning'] = async function() {
    const cr  = db.collection('companies').doc(currentCompany);
    const uid = currentUser.uid;
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let ops   = [];

    // ── 1. FUNCTIONS (8 blocks) ──────────────────────────────
    const FUNCS = [
        { name:'0. Marketing & Lead Generation',  color:'#ec4899', desc:'Ads, SEO, Google reviews, referrals, Instagram, lead tracking and nurturing' },
        { name:'1. Sales & Quoting',              color:'#22c55e', desc:'Inbound calls, walkthroughs, custom quotes, contract negotiation, CRM pipeline' },
        { name:'2. Scheduling & Dispatch',        color:'#3b82f6', desc:'Crew assignment, route planning, calendar management, real-time dispatch' },
        { name:'3. Field Operations',             color:'#f59e0b', desc:'Residential, commercial, move-out, Airbnb turnover cleaning — all field work' },
        { name:'4. Quality Control & Inspections',color:'#8b5cf6', desc:'Post-clean inspections, QC photos, re-clean management, checklist compliance' },
        { name:'5. Finance & Billing',            color:'#ef4444', desc:'Invoicing, payroll, tax payments, insurance, budgeting, P&L reporting' },
        { name:'6. HR & Crew Management',         color:'#0ea5e9', desc:'Hiring, onboarding, training, OSHA compliance, performance reviews, scheduling' },
        { name:'7. Management & Growth',          color:'#374151', desc:'KPIs, strategy, new markets, partnerships, owner-level decisions' },
    ];
    const fRefs = FUNCS.map(() => cr.collection('functions').doc());
    FUNCS.forEach((f, i) => ops.push({type:'set', ref:fRefs[i], data:{
        name:f.name, description:f.desc, color:f.color, order:i,
        ownerId:uid, ownerName:'Michael Torres',
        status:'active', createdBy:uid, createdAt:now, updatedAt:now,
    }}));

    // ── 2. TEAM (12 people) ───────────────────────────────────
    try {
        const oldUsers = await cr.collection('users').get();
        if (!oldUsers.empty) {
            const delOps = oldUsers.docs.filter(d => d.id !== uid).map(d => ({type:'delete', ref:d.ref}));
            if (delOps.length) await window.safeBatchCommit(delOps);
        }
    } catch(e) { console.warn('[demo] cleanup users:', e.message); }

    const STAFF = [
        { name:'Michael Torres',   role:'owner',    fi:null, pos:'Owner / CEO' },
        { name:'Jessica Williams', role:'manager',  fi:2,    pos:'Operations Manager' },
        { name:'Amanda Rodriguez', role:'manager',  fi:1,    pos:'Sales & Booking Manager' },
        { name:'Carlos Mendez',    role:'employee', fi:2,    pos:'Lead Crew Supervisor' },
        { name:'Maria Gonzalez',   role:'employee', fi:3,    pos:'Crew Lead #1 — Residential' },
        { name:'James Wilson',     role:'employee', fi:3,    pos:'Crew Lead #2 — Commercial' },
        { name:'Sofia Martinez',   role:'employee', fi:3,    pos:'Crew Lead #3 — Airbnb/Turnover' },
        { name:'Robert Chen',      role:'employee', fi:4,    pos:'QC Inspector' },
        { name:'Emily Davis',      role:'employee', fi:0,    pos:'Customer Success Manager' },
        { name:'Daniel Kim',       role:'employee', fi:5,    pos:'Bookkeeper / Finance' },
        { name:'Lisa Thompson',    role:'employee', fi:6,    pos:'HR Coordinator' },
        { name:'Kevin Brown',      role:'employee', fi:0,    pos:'Marketing Specialist' },
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
            email:s.name.toLowerCase().replace(/['\s]+/g,'.') + '@sparkclean.demo',
            functionIds:fid ? [fid] : [], primaryFunctionId:fid,
            status:'active', createdAt:now, updatedAt:now,
        }});
        }
    });
    await window.safeBatchCommit(ops); ops = [];

    const faMap = {
        0:[sRefs[8].id, sRefs[11].id],
        1:[sRefs[2].id],
        2:[sRefs[1].id, sRefs[3].id],
        3:[sRefs[4].id, sRefs[5].id, sRefs[6].id],
        4:[sRefs[7].id],
        5:[sRefs[9].id],
        6:[sRefs[10].id],
        7:[sRefs[0].id],
    };
    const funcAssignOps = [];
    for (const [fi, aids] of Object.entries(faMap)) {
        funcAssignOps.push({type:'update', ref:fRefs[parseInt(fi)], data:{assigneeIds:aids, updatedAt:now}});
    }
    await window.safeBatchCommit(funcAssignOps);

    // ── 3. ESTIMATE NORMS (5) ─────────────────────────────────
    const normDefs = [
        {
            name:'Standard Residential Cleaning (per sqft)',
            category:'residential', inputUnit:'sqft', niche:'cleaning',
            materials:[
                {name:'Cleaner labor (hrs per 100 sqft)', qty:0.15, unit:'hr',     price:22,  coefficient:1},
                {name:'All-purpose cleaner',              qty:0.02, unit:'gallon', price:18,  coefficient:1},
                {name:'Microfiber cloths (use per job)',  qty:0.5,  unit:'pack',   price:12,  coefficient:1},
                {name:'Vacuum bags + supplies',           qty:0.1,  unit:'pack',   price:8,   coefficient:1},
            ],
        },
        {
            name:'Deep Clean Residential (per sqft)',
            category:'residential', inputUnit:'sqft', niche:'cleaning',
            materials:[
                {name:'Cleaner labor — deep (hrs per 100 sqft)', qty:0.28, unit:'hr',     price:22,  coefficient:1},
                {name:'Heavy-duty degreaser',                    qty:0.04, unit:'gallon', price:24,  coefficient:1},
                {name:'Disinfectant spray',                      qty:0.03, unit:'gallon', price:20,  coefficient:1},
                {name:'Scrub brushes (per job)',                 qty:0.2,  unit:'each',   price:6,   coefficient:1},
                {name:'Microfiber cloths',                       qty:1,    unit:'pack',   price:12,  coefficient:1},
            ],
        },
        {
            name:'Commercial Office Cleaning (per sqft/month)',
            category:'commercial', inputUnit:'sqft', niche:'cleaning',
            materials:[
                {name:'Cleaner labor commercial (hr/100sqft)',   qty:0.12, unit:'hr',     price:22,  coefficient:1},
                {name:'Commercial floor cleaner',                qty:0.015,unit:'gallon', price:22,  coefficient:1},
                {name:'Glass & surface spray',                   qty:0.01, unit:'gallon', price:18,  coefficient:1},
                {name:'Paper towels commercial',                 qty:0.05, unit:'case',   price:45,  coefficient:1},
            ],
        },
        {
            name:'Move-Out Cleaning (per bedroom)',
            category:'moveout', inputUnit:'bedroom', niche:'cleaning',
            materials:[
                {name:'Cleaner labor move-out (hrs per bdr)',    qty:2.5,  unit:'hr',     price:22,  coefficient:1},
                {name:'Heavy-duty oven & appliance cleaner',     qty:0.5,  unit:'gallon', price:28,  coefficient:1},
                {name:'Grout & tile scrub kit',                  qty:0.5,  unit:'each',   price:14,  coefficient:1},
                {name:'Full supplies kit per bedroom',           qty:1,    unit:'kit',    price:18,  coefficient:1},
            ],
        },
        {
            name:'Airbnb Turnover Cleaning (per unit)',
            category:'airbnb', inputUnit:'unit', niche:'cleaning',
            materials:[
                {name:'Turnover cleaner labor (2 hrs per unit)', qty:2,    unit:'hr',     price:22,  coefficient:1},
                {name:'Fresh scent spray + disinfectant',        qty:1,    unit:'kit',    price:12,  coefficient:1},
                {name:'Microfiber cloths (fresh set)',           qty:1,    unit:'pack',   price:12,  coefficient:1},
                {name:'Consumables restocking kit',              qty:0.5,  unit:'kit',    price:20,  coefficient:1},
            ],
        },
    ];
    const normOps = normDefs.map(n => ({type:'set', ref:cr.collection('estimate_norms').doc(), data:{
        name:n.name, category:n.category, inputUnit:n.inputUnit,
        hasExtraParam:false, extraParamLabel:'',
        niche:n.niche, materials:n.materials,
        createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(normOps);

    // ── 4. TASKS (25+) ────────────────────────────────────────
    const TASKS = [
        // Today (6)
        { t:'Dispatch crews to 8 locations — morning briefing',               fi:2, ai:3,  st:'new',      pr:'high',   d:0,  tm:'07:00', est:30,  r:'All 8 crews dispatched with routes, locations, and checklists confirmed' },
        { t:'Follow up on Marriott Hotel proposal — $12,400/month contract',  fi:1, ai:2,  st:'new',      pr:'high',   d:0,  tm:'10:00', est:45,  r:'Meeting scheduled or written response received, next step defined' },
        { t:'QC inspection — Johnson residence post-cleaning',                fi:4, ai:7,  st:'progress', pr:'high',   d:0,  tm:'14:00', est:60,  r:'QC checklist completed, photos taken, client signed off' },
        { t:'Reply to 5 Google review responses',                             fi:0, ai:8,  st:'new',      pr:'medium', d:0,  tm:'11:00', est:30,  r:'All 5 reviews responded to professionally within 24 hours' },
        { t:'Review and approve weekly payroll',                              fi:5, ai:9,  st:'new',      pr:'high',   d:0,  tm:'15:00', est:45,  r:'Payroll approved and submitted, all crew paid on time' },
        { t:'Interview candidate for Crew Lead position',                     fi:6, ai:10, st:'new',      pr:'medium', d:0,  tm:'16:00', est:60,  r:'Interview completed, decision recorded, next steps defined' },
        // Tomorrow
        { t:'Deep clean — Austin Convention Center (6 hrs)',                  fi:3, ai:4,  st:'new',      pr:'high',   d:1,  tm:'08:00', est:360, r:'Full deep clean completed, before/after photos, signed checklist' },
        { t:'New client walkthrough — Google Austin office',                  fi:1, ai:2,  st:'new',      pr:'high',   d:1,  tm:'14:00', est:90,  r:'Walkthrough done, custom quote prepared and sent within 24hrs' },
        { t:'Equipment maintenance check — vacuums & steamers',               fi:2, ai:3,  st:'new',      pr:'high',   d:1,  tm:'09:00', est:60,  r:'All equipment inspected, issues logged, repairs scheduled if needed' },
        // This week
        { t:'Prepare Q2 tax documents for CPA',                              fi:5, ai:9,  st:'new',      pr:'high',   d:3,  tm:'18:00', est:180, r:'All Q2 tax docs compiled and sent to CPA on time' },
        { t:'Launch Instagram campaign — "Before/After" series',             fi:0, ai:11, st:'new',      pr:'high',   d:4,  tm:'12:00', est:120, r:'Campaign live with 10 posts scheduled for the next 30 days' },
        { t:'Train 3 new cleaners — OSHA safety standards',                  fi:6, ai:10, st:'new',      pr:'high',   d:4,  tm:'09:00', est:180, r:'All 3 cleaners pass OSHA quiz, certificates issued' },
        { t:'Renew liability insurance policy',                               fi:5, ai:0,  st:'new',      pr:'medium', d:5,  tm:'18:00', est:30,  r:'Policy renewed, new certificate on file, updated in system' },
        { t:'Update cleaning checklists for Airbnb clients',                 fi:7, ai:1,  st:'new',      pr:'medium', d:3,  tm:'18:00', est:60,  r:'Updated checklists distributed to all Airbnb crew leads' },
        // Overdue
        { t:'Q2 estimated tax payment',                                       fi:5, ai:9,  st:'new',      pr:'high',   d:-3, tm:'18:00', est:60,  r:'Tax payment submitted, confirmation number saved' },
        { t:'Annual equipment calibration certification',                     fi:2, ai:3,  st:'new',      pr:'high',   d:-5, tm:'18:00', est:120, r:'All equipment calibrated and certified, stickers updated' },
        { t:'Staff background checks renewal',                               fi:6, ai:10, st:'new',      pr:'medium', d:-7, tm:'18:00', est:90,  r:'All 12 staff background checks current and filed' },
        { t:'Update pricing on website',                                     fi:0, ai:11, st:'new',      pr:'low',    d:-10,tm:'18:00', est:45,  r:'New pricing live on website, confirmed by Amanda' },
        // Review / Done
        { t:'Monthly P&L report — March',                                    fi:5, ai:9,  st:'review',   pr:'high',   d:-1, tm:'18:00', est:90,  r:'P&L reviewed and approved by Michael, shared with team' },
        { t:'New commercial contract — WeWork Austin',                        fi:1, ai:2,  st:'done',     pr:'high',   d:-5, tm:'18:00', est:30,  r:'Contract signed, first invoice sent, onboarding started' },
        { t:'Spring promotion campaign launched',                             fi:0, ai:11, st:'done',     pr:'medium', d:-8, tm:'18:00', est:60,  r:'Campaign live, 340 clicks week 1, 12 new leads' },
        { t:'Google Austin office site walkthrough completed',               fi:1, ai:2,  st:'done',     pr:'high',   d:-10,tm:'18:00', est:90,  r:'Walkthrough done, proposal in progress' },
        // Rejected with reasons
        { t:'Quote for Marriott Hotel — first draft',                        fi:1, ai:2,  st:'progress', pr:'high',   d:-2, tm:'18:00', est:45,
          reason:'Underpriced by 30% — labor not fully accounted. Revise using standard commercial rate $0.12/sqft/visit.' },
        { t:'New hire contract — David Park',                                fi:6, ai:10, st:'progress', pr:'medium', d:-3, tm:'18:00', est:30,
          reason:'Missing background check documents. Cannot proceed without completed BGC from Sterling.' },
        { t:'Marketing budget Q2 — Kevin proposal',                          fi:0, ai:11, st:'progress', pr:'medium', d:-4, tm:'18:00', est:30,
          reason:'Exceeds approved limit by $2,400. Resubmit with cuts to display ads or reduce influencer spend.' },
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
            requireReview:t.st !== 'done',
            createdAt:now, updatedAt:now,
        };
        if (t.reason) {
            data.reviewRejectedAt = new Date(Date.now() + t.d * 86400000).toISOString();
            data.reviewRejectedBy = uid;
            data.reviewRejectReason = t.reason;
        }
        ops.push({type:'set', ref, data});
    }

    // ── 5. REGULAR TASKS (17) ─────────────────────────────────
    const REGS = [
        // Daily
        { t:'Morning crew dispatch & briefing',           type:'daily',           fi:2, ai:3,  tm:'07:00', est:15, result:'All crews assigned with locations, routes, and cleaning checklists for the day' },
        { t:'EOD report review + next day prep',          type:'daily',           fi:2, ai:1,  tm:'18:00', est:20, result:'Tomorrow schedule confirmed, any reschedules communicated, crew notified' },
        // Mon
        { t:'Team operations meeting',                    type:'weekly', dow:1,   fi:7, ai:0,  tm:'08:30', est:45, result:'Meeting notes saved, tasks assigned, blockers resolved or escalated' },
        { t:'Supplies inventory check',                   type:'weekly', dow:1,   fi:2, ai:3,  tm:'09:30', est:20, result:'Inventory count done, reorder list ready, low items flagged' },
        { t:'Plan weekly supply orders',                  type:'weekly', dow:1,   fi:2, ai:3,  tm:'10:00', est:20, result:'Order list approved, POs submitted to suppliers' },
        // Wed
        { t:'Client follow-up calls — satisfaction check',type:'weekly', dow:3,   fi:0, ai:8,  tm:'14:00', est:60, result:'All clients from the week called, NPS logged, issues escalated' },
        { t:'QC spot inspections — 3 random sites',       type:'weekly', dow:3,   fi:4, ai:7,  tm:'10:00', est:120,result:'3 sites inspected, QC photos taken, any issues assigned for follow-up' },
        // Fri
        { t:'Weekly revenue & expense report',            type:'weekly', dow:5,   fi:5, ai:9,  tm:'16:00', est:30, result:'Weekly P&L summary sent to Michael, variances explained' },
        { t:'Payroll processing & approval',              type:'weekly', dow:5,   fi:5, ai:9,  tm:'15:00', est:45, result:'Payroll submitted to ADP, all crew paid, records updated' },
        { t:'Sales pipeline review — leads & proposals',  type:'weekly', dow:5,   fi:1, ai:2,  tm:'17:00', est:30, result:'Pipeline updated, stuck deals actioned, forecast updated for Michael' },
        { t:'Google reviews response — all new reviews',  type:'weekly', dow:5,   fi:0, ai:8,  tm:'15:00', est:20, result:'All new Google reviews responded to professionally, no unanswered reviews' },
        // Monthly
        { t:'P&L review + owner presentation',            type:'monthly', dom:1,  fi:5, ai:9,  tm:'10:00', est:90, result:'Monthly P&L presented to Michael, approved, filed in Drive' },
        { t:'Equipment maintenance check',                type:'monthly', dom:5,  fi:2, ai:3,  tm:'09:00', est:120,result:'All vacuums, steamers, mops inspected, service scheduled if needed' },
        { t:'Staff performance reviews',                  type:'monthly', dom:10, fi:6, ai:10, tm:'09:00', est:180,result:'All crew leads reviewed, ratings logged, improvement plans updated' },
        { t:'Main payroll — salaried staff',              type:'monthly', dom:25, fi:5, ai:9,  tm:'10:00', est:60, result:'Salaried payroll processed, pay stubs sent, records filed' },
        { t:'Update pricing & service catalog',           type:'monthly', dom:1,  fi:1, ai:2,  tm:'11:00', est:60, result:'Pricing reviewed vs market, updated on website and quote templates' },
        { t:'Insurance & compliance review',              type:'monthly', dom:15, fi:7, ai:0,  tm:'14:00', est:45, result:'All policies current, compliance checklist signed, renewals flagged' },
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
            title:r.t, period:r.type, daysOfWeek:dows, dayOfMonth:r.dom || null,
            skipWeekends:r.type==='daily', timeStart:r.tm, timeEnd, duration:r.est,
            functionName:FUNCS[r.fi].name,
            assigneeId:sRefs[r.ai].id,
            expectedResult:r.result || '',
            reportFormat:'Short summary in free form',
            instruction:'', priority:'medium', requireReview:false,
            notifyOnComplete:[], checklist:[], status:'active', createdAt:now,
        }});
    }

    // ── 6. PROCESS TEMPLATES (5) ──────────────────────────────
    const tpl1Ref = cr.collection('processTemplates').doc(); // Onboard Commercial
    const tpl2Ref = cr.collection('processTemplates').doc(); // Move-Out Cleaning
    const tpl3Ref = cr.collection('processTemplates').doc(); // Onboard Crew Member
    const tpl4Ref = cr.collection('processTemplates').doc(); // Handle Complaint
    const tpl5Ref = cr.collection('processTemplates').doc(); // Contract Renewal

    ops.push({type:'set', ref:tpl1Ref, data:{
        name:'Onboard New Commercial Client',
        description:'9-step process from discovery to recurring service launch',
        steps:[
            {id:'s1', name:'Discovery call — understand needs & scope',      functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Site walkthrough & measurement',                 functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:2},
            {id:'s3', name:'Custom quote preparation & send',                functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:2, order:3},
            {id:'s4', name:'Contract negotiation',                           functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:3, order:4},
            {id:'s5', name:'Sign contract & collect deposit',                functionId:fRefs[5].id, functionName:FUNCS[5].name, durationDays:1, order:5},
            {id:'s6', name:'Crew assignment & briefing',                     functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:6},
            {id:'s7', name:'Initial deep clean',                             functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:7},
            {id:'s8', name:'Client feedback & QC sign-off',                  functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:8},
            {id:'s9', name:'Set recurring schedule & automate invoicing',    functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:9},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl2Ref, data:{
        name:'Residential Move-Out Cleaning',
        description:'8-step move-out cleaning from booking to review request',
        steps:[
            {id:'s1', name:'Booking & deposit collection',                   functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Pre-clean inspection & key pickup',              functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:2},
            {id:'s3', name:'Full deep clean (4-8 hours)',                    functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:3},
            {id:'s4', name:'QC walk-through by supervisor',                  functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:4},
            {id:'s5', name:'Photo documentation (50+ photos)',               functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:5},
            {id:'s6', name:'Client walk-through & approval',                 functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:6},
            {id:'s7', name:'Final invoice & payment collection',             functionId:fRefs[5].id, functionName:FUNCS[5].name, durationDays:1, order:7},
            {id:'s8', name:'Review request via email & text',                functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:8},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl3Ref, data:{
        name:'Onboard New Cleaning Crew Member',
        description:'7-step hiring and onboarding from application to schedule assignment',
        steps:[
            {id:'s1', name:'Application review & phone screen',              functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:2, order:1},
            {id:'s2', name:'Background check (Sterling)',                    functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:3, order:2},
            {id:'s3', name:'In-person interview',                            functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:3},
            {id:'s4', name:'Trial cleaning shift with supervisor',           functionId:fRefs[3].id, functionName:FUNCS[3].name, durationDays:1, order:4},
            {id:'s5', name:'OSHA safety & product training',                 functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:2, order:5},
            {id:'s6', name:'Uniform, badge & equipment assignment',          functionId:fRefs[6].id, functionName:FUNCS[6].name, durationDays:1, order:6},
            {id:'s7', name:'Schedule assignment & first solo job',           functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:7},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl4Ref, data:{
        name:'Handle Client Complaint — 24hr Resolution',
        description:'6-step complaint resolution to retain client and prevent recurrence',
        steps:[
            {id:'s1', name:'Receive & log complaint (system + call)',        functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:1},
            {id:'s2', name:'Apologize & acknowledge (same day)',             functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:2},
            {id:'s3', name:'Schedule re-clean within 24 hours',             functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:3},
            {id:'s4', name:'QC inspection after re-clean',                  functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:1, order:4},
            {id:'s5', name:'Client approval & satisfaction confirmation',    functionId:fRefs[0].id, functionName:FUNCS[0].name, durationDays:1, order:5},
            {id:'s6', name:'Root cause analysis & prevention plan',         functionId:fRefs[7].id, functionName:FUNCS[7].name, durationDays:1, order:6},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    ops.push({type:'set', ref:tpl5Ref, data:{
        name:'Monthly Contract Renewal',
        description:'5-step renewal process — never lose a client to inattention',
        steps:[
            {id:'s1', name:'30-day renewal notice triggered',               functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:1},
            {id:'s2', name:'Review client satisfaction history',            functionId:fRefs[4].id, functionName:FUNCS[4].name, durationDays:2, order:2},
            {id:'s3', name:'Update pricing & prepare renewal offer',        functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:3},
            {id:'s4', name:'Send renewal contract to client',               functionId:fRefs[1].id, functionName:FUNCS[1].name, durationDays:1, order:4},
            {id:'s5', name:'Sign & update schedule for next period',        functionId:fRefs[2].id, functionName:FUNCS[2].name, durationDays:1, order:5},
        ],
        createdBy:uid, createdAt:now, updatedAt:now,
    }});

    // 7 active processes
    const tplNames = {
        [tpl1Ref.id]:'Onboard New Commercial Client',
        [tpl2Ref.id]:'Residential Move-Out Cleaning',
        [tpl3Ref.id]:'Onboard New Cleaning Crew Member',
        [tpl4Ref.id]:'Handle Client Complaint — 24hr Resolution',
        [tpl5Ref.id]:'Monthly Contract Renewal',
    };
    const PROCS = [
        { tpl:tpl1Ref, name:'Austin Tech Campus — onboarding contract',    step:4, ai:3  },
        { tpl:tpl1Ref, name:'WeWork Austin — monthly commercial service',  step:7, ai:5  },
        { tpl:tpl2Ref, name:'Move-out cleaning — Johnson Family',          step:5, ai:7  },
        { tpl:tpl3Ref, name:'New hire — Sofia replacement crew lead',      step:4, ai:10 },
        { tpl:tpl4Ref, name:'Complaint — Davis residence (missed bathroom)',step:3, ai:7  },
        { tpl:tpl4Ref, name:'Monthly supplies ordering — April',           step:2, ai:3  },
        { tpl:tpl1Ref, name:'Marriott Hotel — proposal & site walkthrough', step:2, ai:2  },
    ];
    for (const p of PROCS) {
        ops.push({type:'set', ref:cr.collection('processes').doc(), data:{
            templateId:p.tpl.id, templateName:tplNames[p.tpl.id],
            name:p.name, currentStep:p.step, status:'active',
            assigneeId:sRefs[p.ai].id, assigneeName:STAFF[p.ai].name,
            startDate:_demoDate(-10), deadline:_demoDate(25),
            createdBy:uid, createdAt:now, updatedAt:now,
        }});
    }
    await window.safeBatchCommit(ops); ops = [];

    // ── 7. PROJECTS (3) ───────────────────────────────────────
    const PROJS = [
        { name:'Austin Tech Campus — Annual Contract',   desc:'Annual cleaning contract $12,400/month — offices + common areas', color:'#22c55e', rev:148800, labor:72000, mat:18000, start:-15, end:350 },
        { name:'WeWork Austin — Monthly Commercial',     desc:'Monthly office cleaning contract — 5 locations in WeWork',       color:'#3b82f6', rev:102000, labor:50400, mat:12000, start:-5,  end:355 },
        { name:'Expand to San Antonio — New Market',     desc:'Market entry: hire local crews, set up ops, launch marketing',   color:'#f59e0b', rev:85000,  labor:45000, mat:0,     start:-3,  end:180 },
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

    const projSnap = await cr.collection('projects').get();
    const projDocs = projSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const stageOps = [];
    for (const proj of projDocs) {
        const pn = proj.name || '';
        let stages = [];
        if (pn.includes('Tech Campus')) {
            stages = [
                {name:'Contract signed',       status:'done',        order:1, start:_demoDate(-15), end:_demoDate(-14)},
                {name:'Client onboarding',     status:'done',        order:2, start:_demoDate(-14), end:_demoDate(-10)},
                {name:'Regular service launch',status:'done',        order:3, start:_demoDate(-10), end:_demoDate(-5) },
                {name:'Q1 performance review', status:'done',        order:4, start:_demoDate(-3),  end:_demoDate(0)  },
                {name:'Mid-year review',       status:'in_progress', order:5, start:_demoDate(0),   end:_demoDate(170)},
                {name:'Annual renewal',        status:'planned',     order:6, start:_demoDate(335), end:_demoDate(350)},
            ];
        } else if (pn.includes('WeWork')) {
            stages = [
                {name:'Contract & deposit',    status:'done',        order:1, start:_demoDate(-5),  end:_demoDate(-4)},
                {name:'Crew briefing & setup', status:'done',        order:2, start:_demoDate(-4),  end:_demoDate(-2)},
                {name:'First month service',   status:'in_progress', order:3, start:_demoDate(-1),  end:_demoDate(28)},
                {name:'Month 2 renewal',       status:'planned',     order:4, start:_demoDate(29),  end:_demoDate(58)},
            ];
        } else if (pn.includes('San Antonio')) {
            stages = [
                {name:'Market research',       status:'in_progress', order:1, start:_demoDate(-3),  end:_demoDate(14)},
                {name:'Hiring & training',     status:'planned',     order:2, start:_demoDate(15),  end:_demoDate(45)},
                {name:'Marketing launch',      status:'planned',     order:3, start:_demoDate(30),  end:_demoDate(60)},
                {name:'First clients — launch',status:'planned',     order:4, start:_demoDate(46),  end:_demoDate(90)},
                {name:'Revenue review',        status:'planned',     order:5, start:_demoDate(90),  end:_demoDate(180)},
            ];
        }
        for (const s of stages) {
            stageOps.push({type:'set', ref:cr.collection('projectStages').doc(), data:{
                projectId:proj.id, name:s.name, order:s.order, status:s.status,
                plannedStartDate:s.start, plannedEndDate:s.end,
                actualStartDate:s.status==='done'?s.start:null,
                actualEndDate:s.status==='done'?s.end:null,
                progressPct:s.status==='done'?100:s.status==='in_progress'?50:0,
                blockedReason:null, createdAt:now, updatedAt:now,
            }});
        }
    }
    if (stageOps.length) await window.safeBatchCommit(stageOps);

    // Project tasks
    const pByName = {};
    projDocs.forEach(d => {
        const name = d.name || '';
        if (name.includes('Tech Campus')) pByName['campus']   = {id:d.id, name};
        if (name.includes('WeWork'))      pByName['wework']   = {id:d.id, name};
        if (name.includes('San Antonio')) pByName['sanantonio'] = {id:d.id, name};
    });
    const projSnap2 = await cr.collection('projects').get();
    projSnap2.docs.forEach(d => {
        const name = d.data().name || '';
        if (name.includes('Tech Campus')) pByName['campus']    = {id:d.id, name};
        if (name.includes('WeWork'))      pByName['wework']    = {id:d.id, name};
        if (name.includes('San Antonio')) pByName['sanantonio'] = {id:d.id, name};
    });

    const projTaskOps = [];
    if (pByName.campus) {
        const {id:pid, name:pname} = pByName.campus;
        [
            {t:'Schedule monthly cleaning calendar — Tech Campus Q2',        fi:2, ai:1,  d:2,  pr:'high',   est:30,  r:'Q2 schedule sent to client contact, confirmed'},
            {t:'Order specialized floor cleaner for Tech Campus',            fi:2, ai:3,  d:1,  pr:'medium', est:20,  r:'Order placed with CleanCo, delivery confirmed'},
            {t:'Train Carlos crew on Tech Campus security protocols',        fi:6, ai:3,  d:3,  pr:'high',   est:60,  r:'All 4 crew members briefed and badged'},
            {t:'QC audit — Tech Campus week 8',                             fi:4, ai:7,  d:4,  pr:'high',   est:90,  r:'QC photos taken, score ≥ 9.0, report sent to client'},
            {t:'Prepare mid-year performance report for Tech Campus',       fi:7, ai:0,  d:10, pr:'high',   est:60,  r:'Report sent, renewal meeting scheduled'},
            {t:'Invoice Tech Campus — April service ($12,400)',             fi:5, ai:9,  d:1,  pr:'high',   est:15,  r:'Invoice sent via QuickBooks, payment due 30 days'},
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
    if (pByName.wework) {
        const {id:pid, name:pname} = pByName.wework;
        [
            {t:'WeWork Austin — first monthly cleaning (5 locations)',      fi:3, ai:5,  d:2,  pr:'high',   est:360, r:'All 5 locations cleaned, checklist signed, photos taken'},
            {t:'Invoice WeWork — first month ($8,500)',                     fi:5, ai:9,  d:3,  pr:'high',   est:15,  r:'Invoice sent, payment received within 30 days'},
            {t:'WeWork client onboarding call — confirm recurring schedule',fi:1, ai:2,  d:1,  pr:'high',   est:30,  r:'Schedule locked in, client contact saved, recurring set'},
            {t:'QC inspection WeWork — post first clean',                   fi:4, ai:7,  d:3,  pr:'high',   est:60,  r:'Score ≥ 9.0, photos shared with client'},
            {t:'Add WeWork to monthly billing automation',                  fi:5, ai:9,  d:4,  pr:'medium', est:20,  r:'Auto-invoice set up in QuickBooks, test invoice sent'},
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
    if (pByName.sanantonio) {
        const {id:pid, name:pname} = pByName.sanantonio;
        [
            {t:'San Antonio market research — competitors & pricing',       fi:0, ai:11, d:7,  pr:'high',   est:180, r:'Report: 5 competitors, avg pricing, opportunity size'},
            {t:'Post job listings — San Antonio crew lead & 4 cleaners',    fi:6, ai:10, d:10, pr:'high',   est:60,  r:'Listings live on Indeed/ZipRecruiter, target: 3 applicants/week'},
            {t:'Set up San Antonio marketing — Google Ads local',           fi:0, ai:11, d:14, pr:'high',   est:90,  r:'Ads live, $500/month budget, tracking set up'},
            {t:'Register business entity in San Antonio',                   fi:7, ai:0,  d:5,  pr:'high',   est:30,  r:'LLC registered, EIN obtained, bank account opened'},
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

    // ── 8. ESTIMATE EXAMPLE ───────────────────────────────────
    const normSnap2 = await cr.collection('estimate_norms').get();
    const normDocs2 = normSnap2.docs.map(d => ({id:d.id, ...d.data()}));
    const commNorm  = normDocs2.find(n => n.name && n.name.includes('Commercial Office'));
    const campusProjSnap = await cr.collection('projects').get();
    const campusProjDoc  = campusProjSnap.docs.find(d => (d.data().name||'').includes('Tech Campus'));

    if (commNorm && campusProjDoc) {
        const sqft = 12000; // Tech Campus 12,000 sqft
        const calced = (commNorm.materials||[]).map(m => ({
            name:m.name, unit:m.unit,
            required:Math.round(m.qty * sqft * 10)/10,
            inStock:0, deficit:Math.round(m.qty * sqft * 10)/10,
            pricePerUnit:m.price,
            total:Math.round(m.qty * sqft * m.price),
        }));
        const baseMonthly = calced.reduce((s, m) => s + m.total, 0);
        // Estimate shows annual value
        const annualTotal = 148800;
        await window.safeBatchCommit([{type:'set', ref:cr.collection('project_estimates').doc(), data:{
            title:'Austin Tech Campus — Annual Cleaning Contract (12,000 sqft)',
            projectId:campusProjDoc.id, dealId:'', functionId:'',
            status:'approved',
            sections:[{
                normId:commNorm.id, normName:commNorm.name,
                inputValue:sqft, inputUnit:commNorm.inputUnit,
                extraParam:null, calculatedMaterials:calced,
            }],
            totals:{totalMaterialsCost:annualTotal, totalDeficitCost:0, currency:'USD'},
            deleted:false, createdBy:uid, approvedBy:uid, createdAt:now, updatedAt:now,
        }}]);
        await cr.collection('projects').doc(campusProjDoc.id).update({estimateBudget:annualTotal, updatedAt:now});
    }

    // ── 9. CRM ────────────────────────────────────────────────
    try {
        const oldPips = await cr.collection('crm_pipeline').get();
        if (!oldPips.empty) await window.safeBatchCommit(oldPips.docs.map(d => ({type:'delete', ref:d.ref})));
    } catch(e) {}

    const pipRef = cr.collection('crm_pipeline').doc();
    await pipRef.set({
        isDemo:true,
        name:'Cleaning Services',
        stages:[
            {id:'new_lead',    label:'New Lead',              color:'#6b7280', order:1},
            {id:'contacted',   label:'Contacted',             color:'#3b82f6', order:2},
            {id:'quote_sent',  label:'Quote Sent',            color:'#8b5cf6', order:3},
            {id:'negotiation', label:'Negotiation',           color:'#f59e0b', order:4},
            {id:'signed',      label:'Contract Signed',       color:'#f97316', order:5},
            {id:'active_client',label:'Active Client',        color:'#22c55e', order:6},
            {id:'renewal',     label:'Up for Renewal',        color:'#0ea5e9', order:7},
            {id:'won',         label:'Won / Closed',          color:'#16a34a', order:8},
            {id:'lost',        label:'Lost',                  color:'#ef4444', order:9},
        ],
        createdBy:uid, createdAt:now, isDefault:true,
    });

    const DEALS = [
        // Active
        {name:'Austin Tech Campus — $12,400/month annual',  client:'Tech Campus (Mark Johnson)',phone:'+15125550001', email:'mjohnson@techcampus.com',  src:'referral',   stage:'active_client', amt:148800,nc:30,  note:'Annual contract active. Q1 review passed — score 9.4/10. Mid-year review due in 5 months.'},
        {name:'Google Austin Office — $18,500/month',       client:'Google Austin (Amy Chen)',  phone:'+15125550002', email:'achen@google.com',          src:'referral',   stage:'negotiation',   amt:222000,nc:0,   note:'Proposal under review. Google wants eco-friendly products only. Revise quote with green supplies.'},
        {name:'Marriott Hotel Austin — $12,400/month',      client:'Marriott (David Park)',     phone:'+15125550003', email:'dpark@marriott.com',        src:'google',     stage:'quote_sent',    amt:148800,nc:0,   note:'Quote revised after rejection. New quote sent Monday. They have 2 competitor quotes.'},
        {name:'45 Airbnb Units — Lisa Park Portfolio',      client:'Lisa Park (host)',          phone:'+15125550004', email:'lisapark@airbnb.com',       src:'instagram',  stage:'signed',        amt:97200, nc:2,   note:'45 units, $180/turnover. Contract signed. First cleaning batch next Tuesday.'},
        {name:'Downtown Condos HOA — $6,800/month',         client:'HOA (Tom Baker)',           phone:'+15125550005', email:'tbaker@downtownhoa.com',    src:'referral',   stage:'negotiation',   amt:81600, nc:1,   note:'HOA board wants 3-year contract. We want 1+1 renewal. Counteroffer sent.'},
        {name:'Dell Medical School — $22,000/month',        client:'Dell Medical (Sara Lee)',   phone:'+15125550006', email:'slee@dellmed.utexas.edu',   src:'cold_call',  stage:'quote_sent',    amt:264000,nc:5,   note:'Large opportunity — 50,000 sqft. Quote includes specialized medical-grade disinfection.'},
        {name:'Johnson Family Recurring — $480/month',      client:'Johnson Family',            phone:'+15125550007', email:'johnson@gmail.com',         src:'google',     stage:'active_client', amt:5760,  nc:14,  note:'Bi-weekly residential. Score 9.2/10. Renews automatically. 2-year client.'},
        {name:'Davis Residence — $380/month',               client:'Davis Residence (Jane Davis)',phone:'+15125550008',email:'jdavis@gmail.com',          src:'google',     stage:'active_client', amt:4560,  nc:0,   note:'OPEN COMPLAINT: missed bathroom in last clean. Re-clean scheduled for tomorrow. Client unhappy.'},
        {name:'New Lead — Sarah Mitchell (residential)',    client:'Sarah Mitchell',            phone:'+15125550009', email:'smitchell@gmail.com',       src:'google',     stage:'contacted',     amt:0,     nc:0,   note:'3BR/2BA house, 1,800sqft. Wants biweekly. First call today — estimate $280-320/clean.'},
        {name:'Austin Gym Chain — $4,200/month',            client:'FitAustin (Chris Park)',    phone:'+15125550010', email:'cpark@fitaustin.com',       src:'instagram',  stage:'new_lead',      amt:50400, nc:0,   note:'3 gym locations. Needs daily evening cleaning. High foot traffic — specialty floor work needed.'},
        {name:'Smith Family — 2-year renewal',              client:'Smith Family',              phone:'+15125550011', email:'smith@gmail.com',           src:'referral',   stage:'renewal',       amt:12480, nc:3,   note:'2-year contract expires in 3 weeks. Good client — score 9.1/10. Offer 5% loyalty discount.'},
        // Won
        {name:'WeWork Austin — $8,500/month',               client:'WeWork (Ryan Moore)',       phone:'+15125550012', email:'rmoore@wework.com',         src:'referral',   stage:'won',           amt:102000,nc:null,note:'Contract signed. First month service in progress. Excellent relationship with Ryan.'},
        {name:'Austin Marriott — one-time deep clean',      client:'Marriott Austin (GM)',      phone:'+15125550013', email:'gm@marriott-austin.com',    src:'google',     stage:'won',           amt:8200,  nc:null,note:'One-time post-renovation deep clean. Completed 3 weeks ago. Led to ongoing proposal.'},
        // Lost
        {name:'Hyatt Hotel Austin — $15,000/month',         client:'Hyatt (Pat Williams)',      phone:'+15125550014', email:'pwilliams@hyatt.com',       src:'cold_call',  stage:'lost',          amt:180000,nc:null,note:'Lost on price — they went with a national chain at $12K/month. Note: our quality is better. Follow up Q3.'},
    ];

    const cliRefs = DEALS.map(() => cr.collection('crm_clients').doc());
    await window.safeBatchCommit(DEALS.map((d, i) => ({type:'set', ref:cliRefs[i], data:{
        name:d.client, phone:d.phone, email:d.email,
        telegram:'', type:'company', source:d.src, niche:'cleaning',
        createdAt:_demoTs(-Math.floor(Math.random()*21+1)), updatedAt:now,
    }})));

    await window.safeBatchCommit(DEALS.map((d, i) => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        pipelineId:pipRef.id, title:d.name,
        clientName:d.client, clientId:cliRefs[i].id,
        phone:d.phone, email:d.email,
        source:d.src, stage:d.stage, amount:d.amt, note:d.note,
        nextContactDate:d.nc !== null ? _demoDate(d.nc) : null,
        nextContactTime:d.nc === 0 ? '14:00' : null,
        assigneeId:sRefs[2].id, assigneeName:STAFF[2].name,
        deleted:false, tags:[],
        createdAt:_demoTs(-Math.floor(Math.random()*14+1)), updatedAt:now,
    }})));

    // CRM Todo — today
    const todayDeals = [
        {name:'Sarah Mitchell — first call after website inquiry',  client:'Sarah Mitchell',     phone:'+15125550009', src:'google',   note:'Homeowner, 1,800sqft, wants biweekly. Estimate: $280-320. Ready to book if price is right.'},
        {name:'Google Austin — follow up $18,500/month proposal',   client:'Google Austin',      phone:'+15125550002', src:'referral', note:'Amy Chen asked for eco-friendly product list. Send green product PDF and revised pricing.'},
        {name:'Davis residence — re-clean confirmation after complaint',client:'Jane Davis',      phone:'+15125550008', src:'google',   note:'Client upset about missed bathroom. Confirm tomorrow 10am re-clean. Offer 1 free clean.'},
    ];
    const todayCliRefs = todayDeals.map(() => cr.collection('crm_clients').doc());
    await window.safeBatchCommit(todayDeals.map((d, i) => ({type:'set', ref:todayCliRefs[i], data:{
        name:d.client, phone:d.phone, email:'', telegram:'', type:'person',
        source:d.src, niche:'cleaning', createdAt:_demoTs(-1), updatedAt:now,
    }})));
    await window.safeBatchCommit(todayDeals.map((d, i) => ({type:'set', ref:cr.collection('crm_deals').doc(), data:{
        pipelineId:pipRef.id, title:d.name,
        clientName:d.client, clientId:todayCliRefs[i].id,
        phone:d.phone, email:'', source:d.src, stage:'contacted', amount:0, note:d.note,
        nextContactDate:_demoDate(0), nextContactTime:'14:00',
        assigneeId:sRefs[2].id, assigneeName:STAFF[2].name,
        deleted:false, tags:[], createdAt:_demoTs(-1), updatedAt:now,
    }})));

    // ── 10. FINANCE (USD) ─────────────────────────────────────
    const finSettingsRef = cr.collection('finance_settings').doc('main');
    await finSettingsRef.set({isDemo:true, version:1, region:'US', currency:'USD', niche:'cleaning', initializedAt:now, initializedBy:uid, updatedAt:now});

    try {
        for (const col of ['finance_accounts','finance_transactions','finance_categories','finance_recurring']) {
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
        {name:'Chase Business Checking',       type:'bank', balance:48500, currency:'USD', isDefault:true},
        {name:'PayPal Business (online pmts)', type:'bank', balance:12300, currency:'USD', isDefault:false},
        {name:'Petty Cash (crews)',             type:'cash', balance:2800,  currency:'USD', isDefault:false},
    ];
    const finOps = [];
    ACCOUNTS.forEach((a, i) => finOps.push({type:'set', ref:accRefs[i], data:{...a, createdBy:uid, createdAt:now, updatedAt:now}}));

    const FIN_CATS = [
        {name:'Commercial contract payment',  type:'income',  color:'#22c55e', icon:'briefcase'},
        {name:'Residential cleaning payment', type:'income',  color:'#16a34a', icon:'home'},
        {name:'Deposit received',             type:'income',  color:'#84cc16', icon:'dollar-sign'},
        {name:'One-time job payment',         type:'income',  color:'#a3e635', icon:'credit-card'},
        {name:'Cleaning supplies',            type:'expense', color:'#ef4444', icon:'package'},
        {name:'Crew labor / payroll',         type:'expense', color:'#f97316', icon:'users'},
        {name:'Insurance',                    type:'expense', color:'#8b5cf6', icon:'shield'},
        {name:'Equipment & maintenance',      type:'expense', color:'#0ea5e9', icon:'tool'},
        {name:'Marketing & advertising',      type:'expense', color:'#ec4899', icon:'trending-up'},
        {name:'Office & admin',               type:'expense', color:'#6b7280', icon:'settings'},
        {name:'Vehicle & fuel',               type:'expense', color:'#f59e0b', icon:'truck'},
    ];
    const catRefs = FIN_CATS.map(() => cr.collection('finance_categories').doc());
    FIN_CATS.forEach((c, i) => finOps.push({type:'set', ref:catRefs[i], data:{name:c.name, type:c.type, color:c.color, icon:c.icon, isDefault:false, createdBy:uid, createdAt:now}}));
    await window.safeBatchCommit(finOps);

    const _noteToFuncCleaning = (note) => {
        const n = (note||'').toLowerCase();
        if (n.includes('google ads') || n.includes('instagram') || n.includes('marketing')) return fRefs[0].id;
        if (n.includes('contract') || n.includes('proposal') || n.includes('wework') || n.includes('tech campus') || n.includes('weework')) return fRefs[1].id;
        if (n.includes('dispatch') || n.includes('schedule') || n.includes('supplies')) return fRefs[2].id;
        if (n.includes('cleaning') || n.includes('crew') || n.includes('labor') || n.includes('payroll')) return fRefs[3].id;
        if (n.includes('insurance') || n.includes('payroll tax') || n.includes('accounting') || n.includes('tax')) return fRefs[5].id;
        if (n.includes('hiring') || n.includes('training') || n.includes('hr')) return fRefs[6].id;
        return '';
    };

    const projSnapFin = await cr.collection('projects').get();
    const projDocsFin = projSnapFin.docs.map(d => ({id:d.id, name:d.data().name||''}));
    const _getProjIdCleaning = (note) => {
        const n = (note||'').toLowerCase();
        const p = projDocsFin.find(p => {
            if (n.includes('tech campus') && p.name.includes('Tech Campus')) return true;
            if (n.includes('wework') && p.name.includes('WeWork')) return true;
            return false;
        });
        return p ? p.id : '';
    };

    const TXS = [
        // Current month — income
        {ci:0, acc:0, amt:12400, note:'Tech Campus — April monthly contract payment',     d:-3},
        {ci:0, acc:0, amt:8500,  note:'WeWork Austin — first month payment',              d:-5},
        {ci:2, acc:1, amt:4200,  note:'Deposit — Lisa Park Airbnb 45 units',              d:-2},
        {ci:1, acc:1, amt:2880,  note:'Residential cleaning payments — week of 3/25',     d:-7},
        {ci:3, acc:1, amt:8200,  note:'One-time deep clean — Austin Marriott',            d:-10},
        {ci:1, acc:1, amt:1960,  note:'Residential payments — Johnson, Smith, 3 others',  d:-1},
        // Current month — expenses
        {ci:4, acc:2, amt:3850,  note:'CleanCo Supply — monthly cleaning chemicals bulk', d:-4},
        {ci:4, acc:2, amt:1200,  note:'Microfiber cloths, mop heads, HEPA bags',          d:-8},
        {ci:5, acc:0, amt:18500, note:'Weekly crew labor payroll — March 25',             d:-3},
        {ci:5, acc:0, amt:18500, note:'Weekly crew labor payroll — March 18',             d:-10},
        {ci:6, acc:0, amt:1850,  note:'Liability insurance — monthly premium',            d:-1},
        {ci:6, acc:0, amt:2100,  note:'Workers comp insurance — monthly',                 d:-1},
        {ci:8, acc:0, amt:2500,  note:'Google Ads — April marketing budget',              d:-5},
        {ci:9, acc:0, amt:3200,  note:'Office/storage rent — April',                      d:-1},
        // Last month — income
        {ci:0, acc:0, amt:12400, note:'Tech Campus — March contract payment',             d:-32},
        {ci:0, acc:0, amt:8200,  note:'Marriott one-time deep clean deposit',             d:-28},
        {ci:1, acc:1, amt:4200,  note:'Residential cleaning — week 3',                   d:-25},
        // Last month — expenses
        {ci:5, acc:0, amt:74000, note:'Monthly crew payroll — full March',                d:-5},
        {ci:4, acc:0, amt:4200,  note:'Cleaning supplies — March bulk order',             d:-30},
        {ci:6, acc:0, amt:3950,  note:'All insurance premiums — March',                  d:-31},
        {ci:7, acc:2, amt:1200,  note:'Equipment lease — vacuum fleet March',             d:-15},
        {ci:10,acc:2, amt:1840,  note:'Van fuel & maintenance — March',                   d:-20},
        // Prior month
        {ci:0, acc:0, amt:24800, note:'Tech Campus 2x payment + WeWork signup',           d:-58},
        {ci:1, acc:1, amt:3850,  note:'Residential February — recurring clients',         d:-50},
        {ci:5, acc:0, amt:72000, note:'Full payroll — February',                          d:-36},
        {ci:8, acc:0, amt:2500,  note:'Google Ads — February',                            d:-55},
        {ci:4, acc:0, amt:3600,  note:'Supplies — February order',                        d:-50},
    ];
    const txOps = TXS.map(tx => ({type:'set', ref:cr.collection('finance_transactions').doc(), data:{
        categoryId:catRefs[tx.ci].id, categoryName:FIN_CATS[tx.ci].name,
        accountId:accRefs[tx.acc].id, accountName:ACCOUNTS[tx.acc].name,
        type:FIN_CATS[tx.ci].type, amount:tx.amt, currency:'USD',
        note:tx.note, date:_demoTsFinance(tx.d),
        projectId:_getProjIdCleaning(tx.note),
        functionId:_noteToFuncCleaning(tx.note),
        createdBy:uid, createdAt:now,
    }}));
    await window.safeBatchCommit(txOps);

    const regPays = [
        {name:'Office & storage rent',          type:'expense', amount:3200,  day:1,  freq:'monthly', comment:'Warehouse District storage unit + office'},
        {name:'Crew payroll (weekly)',           type:'expense', amount:18500, day:5,  freq:'weekly',  comment:'All field crew, weekly via ADP'},
        {name:'Liability insurance',            type:'expense', amount:1850,  day:1,  freq:'monthly', comment:'$2M general liability — State Farm'},
        {name:'Workers comp insurance',         type:'expense', amount:2100,  day:1,  freq:'monthly', comment:'Required for all field staff'},
        {name:'Vehicle insurance (2 vans)',     type:'expense', amount:680,   day:1,  freq:'monthly', comment:'Both cargo vans insured'},
        {name:'Google Ads',                     type:'expense', amount:2500,  day:5,  freq:'monthly', comment:'Local service ads + display'},
        {name:'CRM software (TALKO)',           type:'expense', amount:380,   day:1,  freq:'monthly', comment:'Business management system'},
        {name:'QuickBooks Online',              type:'expense', amount:85,    day:1,  freq:'monthly', comment:'Accounting software'},
        {name:'Equipment lease',                type:'expense', amount:1200,  day:15, freq:'monthly', comment:'Commercial vacuum fleet lease'},
        {name:'Phone plan — 12 lines',          type:'expense', amount:720,   day:1,  freq:'monthly', comment:'AT&T business plan, all staff'},
    ];
    await window.safeBatchCommit(regPays.map(r => ({type:'set', ref:cr.collection('finance_recurring').doc(), data:{
        name:r.name, type:r.type, amount:r.amount, currency:'USD',
        category:r.comment, frequency:r.freq, dayOfMonth:r.day,
        counterparty:'', comment:r.comment, accountId:'',
        active:true, createdAt:now, updatedAt:now,
    }})));

    const finCatSnap = await cr.collection('finance_categories').get();
    const finCatMap = {};
    finCatSnap.docs.forEach(d => { finCatMap[d.data().name] = d.id; });
    const budgetMonths = [
        {month:_demoDate(-30).slice(0,7), goal:108000},
        {month:_demoDate(0).slice(0,7),   goal:118500},
        {month:_demoDate(30).slice(0,7),  goal:132000},
    ];
    await window.safeBatchCommit(budgetMonths.map(bm => ({type:'set', ref:cr.collection('finance_budgets').doc(bm.month), data:{
        month:bm.month, goal:bm.goal,
        ...(finCatMap['Cleaning supplies']        ? {['cat_'+finCatMap['Cleaning supplies']]:      5500} : {}),
        ...(finCatMap['Crew labor / payroll']     ? {['cat_'+finCatMap['Crew labor / payroll']]:  74000} : {}),
        ...(finCatMap['Marketing & advertising']  ? {['cat_'+finCatMap['Marketing & advertising']]: 2500} : {}),
        ...(finCatMap['Insurance']                ? {['cat_'+finCatMap['Insurance']]:               3950} : {}),
        updatedAt:now,
    }})));

    // ── 11. INVENTORY (Cleaning Supplies) ────────────────────
    const STOCK = [
        {name:'All-Purpose Cleaner (gallon)',      sku:'APC-1G',    cat:'Chemicals',    unit:'gallon', qty:8,   min:20, price:18},
        {name:'Disinfectant Spray (gallon)',        sku:'DIS-1G',    cat:'Chemicals',    unit:'gallon', qty:22,  min:15, price:20},
        {name:'Glass Cleaner (quart)',              sku:'GLS-QT',    cat:'Chemicals',    unit:'quart',  qty:18,  min:12, price:8},
        {name:'Microfiber Cloths (pack of 12)',     sku:'MFC-12PK',  cat:'Consumables',  unit:'pack',   qty:45,  min:100,price:12},
        {name:'Mop Heads — commercial (each)',      sku:'MOP-COM',   cat:'Equipment',    unit:'each',   qty:24,  min:15, price:14},
        {name:'HEPA Vacuum Bags (pack of 10)',      sku:'HEPA-10PK', cat:'Equipment',    unit:'pack',   qty:18,  min:10, price:22},
        {name:'Scrub Brushes heavy-duty (each)',    sku:'SCB-HD',    cat:'Equipment',    unit:'each',   qty:32,  min:20, price:6},
        {name:'Trash Liners 30gal (roll of 50)',    sku:'TRL-30G',   cat:'Consumables',  unit:'roll',   qty:28,  min:15, price:18},
        {name:'Nitrile Gloves L (box of 100)',      sku:'GLV-L-100', cat:'PPE',          unit:'box',    qty:35,  min:20, price:24},
        {name:'Paper Towels commercial (case)',     sku:'PTW-CS',    cat:'Consumables',  unit:'case',   qty:14,  min:10, price:45},
    ];
    const itemRefs = [];
    for (const s of STOCK) {
        const iRef = cr.collection('warehouse_items').doc();
        itemRefs.push(iRef);
        ops.push({type:'set', ref:iRef, data:{name:s.name, sku:s.sku, category:s.cat, unit:s.unit, minStock:s.min, costPrice:s.price, niche:'cleaning', createdAt:now}});
        ops.push({type:'set', ref:cr.collection('warehouse_stock').doc(iRef.id), data:{itemId:iRef.id, itemName:s.name, qty:s.qty, reserved:0, available:s.qty, updatedAt:now}});
    }
    await window.safeBatchCommit(ops); ops = [];

    try {
        const oldLocs = await cr.collection('warehouse_locations').get();
        if (!oldLocs.empty) await window.safeBatchCommit(oldLocs.docs.map(d => ({type:'delete', ref:d.ref})));
    } catch(e) {}

    const locDefs = [
        {name:'Main Warehouse (Warehouse District)', type:'warehouse', isDefault:true},
        {name:'Van #1 — Carlos crew (mobile)',        type:'mobile',    isDefault:false},
        {name:'Van #2 — Maria crew (mobile)',         type:'mobile',    isDefault:false},
    ];
    const locRefs = locDefs.map(() => cr.collection('warehouse_locations').doc());
    await window.safeBatchCommit(locDefs.map((l, i) => ({type:'set', ref:locRefs[i], data:{name:l.name, type:l.type, isDefault:l.isDefault, deleted:false, createdAt:now, updatedAt:now}})));

    await window.safeBatchCommit([
        {name:'CleanCo Supply',      phone:'+15125550101', email:'orders@cleanco.com',    url:'cleancosupply.com',  note:'Primary supplier — bulk chemicals. Net 30 terms. Monthly delivery.'},
        {name:'Staples Business',   phone:'+15125550102', email:'biz@staples.com',        url:'staples.com',        note:'Paper goods, general office and cleaning supplies. Same day pickup.'},
        {name:'Grainger',           phone:'+15125550103', email:'orders@grainger.com',    url:'grainger.com',       note:'Commercial equipment, tools, replacement parts. Fast shipping.'},
        {name:'Amazon Business',    phone:'+15125550104', email:'biz@amazon.com',         url:'amazon.com/business',note:'Misc supplies, backup orders. Prime 2-day shipping on most items.'},
        {name:'Ferguson Supply',    phone:'+15125550105', email:'austin@ferguson.com',    url:'ferguson.com',       note:'Specialty cleaning — commercial floor care, carpet extraction supplies.'},
    ].map(s => ({type:'set', ref:cr.collection('warehouse_suppliers').doc(), data:{...s, deleted:false, createdAt:now, updatedAt:now}})));

    // Warehouse operations
    const itemsSnap = await cr.collection('warehouse_items').get();
    const itemData  = itemsSnap.docs.map(d => ({id:d.id, name:d.data().name}));
    const whOps = [
        ...itemData.slice(0,5).map((item, i) => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
            itemId:item.id, type:'IN', qty:[20,15,12,50,10][i], price:[18,20,8,12,14][i],
            totalPrice:[20,15,12,50,10][i]*[18,20,8,12,14][i],
            note:`Delivery from CleanCo — ${item.name.split(' ').slice(0,3).join(' ')}`, date:_demoDate(-5), createdBy:uid, createdAt:_demoTs(-5),
        }})),
        ...itemData.slice(0,6).map((item, i) => ({type:'set', ref:cr.collection('warehouse_operations').doc(), data:{
            itemId:item.id, type:'OUT', qty:[4,6,4,20,5,3][i], price:[18,20,8,12,14,22][i],
            totalPrice:[4,6,4,20,5,3][i]*[18,20,8,12,14,22][i],
            note:`Crew supply load — ${['Van #1 Carlos','Van #2 Maria','Van #1','Van #2','Van #1','Van #2'][i]}`, date:_demoDate(-2), createdBy:uid, createdAt:_demoTs(-2),
        }})),
        {type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:itemData[0]?.id, type:'TRANSFER', qty:5, note:'All-purpose cleaner: warehouse → Van #1', fromLocationId:locRefs[0].id, toLocationId:locRefs[1].id, date:_demoDate(-3), createdBy:uid, createdAt:_demoTs(-3)}},
        {type:'set', ref:cr.collection('warehouse_operations').doc(), data:{itemId:itemData[3]?.id, type:'TRANSFER', qty:10, note:'Microfiber cloths: warehouse → Van #2', fromLocationId:locRefs[0].id, toLocationId:locRefs[2].id, date:_demoDate(-1), createdBy:uid, createdAt:_demoTs(-1)}},
    ];
    if (whOps.length) await window.safeBatchCommit(whOps);

    const invMonth = _demoDate(-15).slice(0,7);
    const invItems = itemData.slice(0,10).map((item, i) => {
        const expected = [8,22,18,45,24,18,32,28,35,14][i] || 10;
        const actual = expected + [-1,0,0,-2,1,0,-1,0,0,1][i];
        return {itemId:item.id, itemName:item.name, expected, actual, diff:actual-expected};
    });
    await window.safeBatchCommit([{type:'set', ref:cr.collection('warehouse_inventories').doc(), data:{
        locationId:locRefs[0].id, month:invMonth, items:invItems,
        status:'confirmed', createdBy:uid, createdAt:_demoTs(-15), updatedAt:_demoTs(-15),
    }}]);

    // ── 12. WORK STANDARDS (4) ───────────────────────────────
    const STD_DEFS = [
        {
            name:'Standard Cleaning Checklist — Residential',
            functionId:fRefs[3].id,
            checklist:['Check in with client or use lockbox key — confirm access','Review client-specific notes before starting','All rooms: dust surfaces from top to bottom','Vacuum all carpets and rugs thoroughly','Mop all hard floors with appropriate cleaner','Clean all bathrooms: toilet, sink, tub/shower, mirrors','Kitchen: counters, stovetop, microwave (inside), sink','Empty all trash cans and replace liners','Final walk-through — check every room against checklist','Take 3 photos per room (before is preferred, after required)','Lock up and notify client via text upon completion','Log job completion in system within 30 minutes'],
            acceptanceCriteria:['Checklist signed by crew lead','3+ photos per room uploaded','Client notified via text','Job logged in system same day'],
            instructionsHtml:'<p>Every job must be treated like a new client inspection. Consistency is what earns 5-star reviews and renewals.</p>',
        },
        {
            name:'Commercial Deep Clean Protocol',
            functionId:fRefs[3].id,
            checklist:['Pre-clean walkthrough with site contact','Document any existing damage with photos','Strip and re-wax all hard floors if applicable','Deep scrub restrooms — grout, tiles, behind fixtures','Clean all vents, light fixtures, and ceiling fans','Wipe all baseboards, window sills, door frames','Disinfect all high-touch surfaces (handles, switches, desks)','Final QC walk with client before leaving'],
            acceptanceCriteria:['Before/after photos for each section','Client signs commercial checklist','No items missed — QC score ≥ 9.0'],
            instructionsHtml:'<p>Commercial clients pay premium rates — premium execution is required. No rushing, no skipping corners.</p>',
        },
        {
            name:'Handle Client Complaint — 24hr Resolution',
            functionId:fRefs[4].id,
            checklist:['Log complaint in system within 1 hour of receiving','Call client personally within 2 hours — do not text first','Apologize sincerely — do not make excuses','Offer re-clean within 24 hours at no charge','Assign best available crew for the re-clean','QC inspect the re-clean yourself before client walkthrough','Follow up 48 hours after re-clean to confirm satisfaction','Document root cause and update crew training notes'],
            acceptanceCriteria:['Client called within 2 hours','Re-clean completed within 24 hours','Client satisfaction confirmed in writing','Root cause logged and training updated'],
            instructionsHtml:'<p>Every complaint is a $5,000+ lifetime value at risk. Treat it accordingly. A resolved complaint builds more loyalty than a perfect first clean.</p>',
        },
        {
            name:'New Crew Member — First Week Standards',
            functionId:fRefs[6].id,
            checklist:['Background check cleared and filed','OSHA safety training completed (certificate on file)','Product training — chemicals, dilution ratios, safety data sheets','Shadow veteran crew for minimum 2 jobs','Solo trial job with supervisor present','Uniform, badge, and equipment assigned','Emergency contact and bank info collected','Phone number added to crew group chat'],
            acceptanceCriteria:['OSHA certificate on file','Trial job score ≥ 8.5 from supervisor','All paperwork complete','Schedule assigned for week 2'],
            instructionsHtml:'<p>First week sets expectations for life. Crew members who start right stay longer. Crew members who start wrong cost us clients.</p>',
        },
    ];
    await window.safeBatchCommit(STD_DEFS.map(s => ({type:'set', ref:cr.collection('workStandards').doc(), data:{
        name:s.name, functionId:s.functionId, checklist:s.checklist,
        acceptanceCriteria:s.acceptanceCriteria, instructionsHtml:s.instructionsHtml,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})));

    // ── 13. COORDINATIONS (4) ─────────────────────────────────
    const COORDS = [
        {name:'Morning crew dispatch',          type:'daily',      chairmanId:sRefs[3].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[3].id,sRefs[4].id,sRefs[5].id,sRefs[6].id], schedule:{day:null,time:'07:00'}, agendaItems:['execution','tasks'],
         dynamicAgenda:[{id:'da1',text:'Davis complaint re-clean — confirm crew assignment for today',authorId:sRefs[1].id,createdAt:new Date().toISOString()}]},
        {name:'Weekly operations meeting',      type:'weekly',     chairmanId:sRefs[0].id, participantIds:sRefs.slice(0,8).map(s=>s.id), schedule:{day:1,time:'08:30'}, agendaItems:['stats','execution','reports','questions','tasks'],
         dynamicAgenda:[{id:'da2',text:'Google Austin proposal — need eco-product list by EOD',authorId:sRefs[2].id,createdAt:new Date().toISOString()},{id:'da3',text:'CleanCo supply delay — microfiber cloths at critical low',authorId:sRefs[3].id,createdAt:new Date().toISOString()}]},
        {name:'Quality & complaints review',    type:'weekly',     chairmanId:sRefs[7].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[7].id,sRefs[3].id], schedule:{day:3,time:'14:00'}, agendaItems:['reports','questions','tasks'],
         dynamicAgenda:[{id:'da4',text:'Davis residence — complaint still open 4 days, re-clean today',authorId:sRefs[7].id,createdAt:new Date().toISOString()}]},
        {name:'Owner review — KPIs & growth',   type:'council_own',chairmanId:sRefs[0].id, participantIds:[sRefs[0].id,sRefs[1].id,sRefs[9].id], schedule:{day:5,time:'17:00'}, agendaItems:['stats','execution','reports','decisions'],
         dynamicAgenda:[]},
    ];
    const coordRefs = COORDS.map(() => cr.collection('coordinations').doc());
    await window.safeBatchCommit(COORDS.map((c, i) => ({type:'set', ref:coordRefs[i], data:{
        name:c.name, type:c.type, chairmanId:c.chairmanId, participantIds:c.participantIds,
        schedule:c.schedule, status:'active', agendaItems:c.agendaItems, dynamicAgenda:c.dynamicAgenda,
        createdBy:uid, createdAt:now, updatedAt:now,
    }})));

    const coordSnap = await cr.collection('coordinations').get();
    const coordDocs = coordSnap.docs.map(d => ({id:d.id, ...d.data()}));
    const dispatchCoord = coordDocs.find(c => c.name && c.name.includes('dispatch'));
    const opsCoord      = coordDocs.find(c => c.name && c.name.includes('operations'));
    const ownerCoord    = coordDocs.find(c => c.name && c.name.includes('Owner'));

    const sessionOps = [];
    if (dispatchCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:dispatchCoord.id, coordName:dispatchCoord.name, coordType:'daily',
        startedAt:new Date(Date.now()-2*86400000).toISOString(),
        finishedAt:new Date(Date.now()-2*86400000+15*60000).toISOString(),
        decisions:[
            {text:'Reassign Carlos crew to Tech Campus today — James covers residential route', taskId:'', authorId:uid},
            {text:'Order microfiber cloths URGENT — down to 2 days supply', taskId:'', authorId:uid},
            {text:'Handle Davis complaint today — Sofia crew assigned for re-clean 2pm', taskId:'', authorId:uid},
        ],
        unresolved:[], agendaDone:['Crew assignments','Supply status','Complaints'],
        dynamicAgendaItems:[], notes:'All 8 crews dispatched on time. Tech Campus crew briefed on new security protocol.',
        conductedBy:uid, participantIds:sRefs.slice(0,6).map(s=>s.id), taskSnapshot:[], createdAt:_demoTs(-2),
    }});

    if (opsCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:opsCoord.id, coordName:opsCoord.name, coordType:'weekly',
        startedAt:new Date(Date.now()-7*86400000).toISOString(),
        finishedAt:new Date(Date.now()-7*86400000+45*60000).toISOString(),
        decisions:[
            {text:'New commercial pricing: $0.12/sqft standard, $0.22/sqft deep clean — effective April 1', taskId:'', authorId:uid},
            {text:'Hire 2 additional cleaners by April 15 — Lisa posts on Indeed today', taskId:'', authorId:uid},
            {text:'Launch San Antonio research — Kevin and Amanda own this by EOW', taskId:'', authorId:uid},
            {text:'Update Airbnb checklist — add linen staging photos as requirement', taskId:'', authorId:uid},
            {text:'Implement GPS tracking on both vans — Jessica to evaluate Samsara by Friday', taskId:'', authorId:uid},
        ],
        unresolved:[{text:'Supply chain delay — CleanCo delayed microfiber delivery by 2 weeks → escalate', authorId:uid, addedAt:new Date(Date.now()-7*86400000).toISOString()}],
        agendaDone:['Weekly KPIs','New contracts','Staffing','Operations','Marketing'],
        dynamicAgendaItems:[{text:'Marriott quote was rejected — how do we revise?',authorId:uid,addedAt:new Date(Date.now()-8*86400000).toISOString()}],
        notes:'Strong week — WeWork signed, Tech Campus score 9.4. Focus on Google Austin proposal.',
        conductedBy:uid, participantIds:sRefs.slice(0,8).map(s=>s.id), taskSnapshot:[], createdAt:_demoTs(-7),
    }});

    if (ownerCoord) sessionOps.push({type:'set', ref:cr.collection('coordination_sessions').doc(), data:{
        coordId:ownerCoord.id, coordName:ownerCoord.name, coordType:'council_own',
        startedAt:new Date(Date.now()-8*86400000).toISOString(),
        finishedAt:new Date(Date.now()-8*86400000+60*60000).toISOString(),
        decisions:[
            {text:'Approve $45K budget for San Antonio expansion — Q3 target: $85K revenue', taskId:'', authorId:uid},
            {text:'Raise commercial rates 8% across all new proposals — market rate is now higher', taskId:'', authorId:uid},
            {text:'Launch Google review automation via NiceJob — Daniel to set up this week', taskId:'', authorId:uid},
            {text:'Hire Operations Coordinator — post job by April 10, target May 1 start', taskId:'', authorId:uid},
        ],
        unresolved:[], agendaDone:['March P&L','Growth strategy','Pricing','Hiring'],
        dynamicAgendaItems:[],
        notes:'March was best month ever — $118.5K revenue, 30.8% margin. April target $132K.',
        conductedBy:uid, participantIds:[uid,sRefs[1].id,sRefs[9].id], taskSnapshot:[], createdAt:_demoTs(-8),
    }});

    if (sessionOps.length) await window.safeBatchCommit(sessionOps);

    // ── 14. BOOKING ───────────────────────────────────────────
    const bookingCalRef = cr.collection('booking_calendars').doc();
    await window.safeBatchCommit([
        {type:'set', ref:bookingCalRef, data:{
            name:'Book a Cleaning — Free Estimate',
            slug:'sparkclean-estimate',
            ownerName:STAFF[2].name, ownerId:sRefs[2].id,
            duration:45, bufferBefore:10, bufferAfter:15,
            timezone:'America/Chicago', confirmationType:'manual',
            color:'#22c55e',
            location:'Austin, TX and surrounding areas (up to 30 miles)',
            isActive:true, phoneRequired:true,
            questions:[
                {id:'q1', text:'Property type (residential / commercial / Airbnb / move-out)',  type:'text',   required:true},
                {id:'q2', text:'Approximate square footage',                                     type:'text',   required:true},
                {id:'q3', text:'Desired frequency (one-time / weekly / biweekly / monthly)',     type:'text',   required:false},
                {id:'q4', text:'Any special requirements (pets, allergies, specific areas)',     type:'text',   required:false},
            ],
            maxBookingsPerSlot:1, requirePayment:false, price:0,
            createdAt:now, updatedAt:now,
        }},
        {type:'set', ref:cr.collection('booking_schedules').doc(bookingCalRef.id), data:{
            weeklyHours:{
                mon:[{start:'08:00',end:'19:00'}], tue:[{start:'08:00',end:'19:00'}],
                wed:[{start:'08:00',end:'19:00'}], thu:[{start:'08:00',end:'19:00'}],
                fri:[{start:'08:00',end:'19:00'}], sat:[{start:'09:00',end:'15:00'}],
                sun:[],
            },
            dateOverrides:{}, updatedAt:now,
        }},
    ]);

    const apptDefs = [
        {name:'Sarah Mitchell',     phone:'+15125550009', email:'smitchell@gmail.com',  date:_demoDate(1), time:'10:00', status:'confirmed',  note:'1,800sqft 3BR/2BA — biweekly. Estimate $290/clean. Has 2 dogs.'},
        {name:'Google Austin Rep',  phone:'+15125550002', email:'achen@google.com',     date:_demoDate(2), time:'14:00', status:'confirmed',  note:'Site walkthrough 18,000sqft. Wants eco-products. $18.5K/month proposal.'},
        {name:'Austin Gym Chain',   phone:'+15125550010', email:'cpark@fitaustin.com',  date:_demoDate(3), time:'11:00', status:'confirmed',  note:'3 gym locations, evening cleaning. Heavy foot traffic floors.'},
        {name:'HOA Property Mgr',   phone:'+15125550005', email:'tbaker@hoa.com',       date:_demoDate(4), time:'15:00', status:'pending',    note:'Downtown condos common areas. 3-year contract potential.'},
        {name:'Lisa Park',          phone:'+15125550004', email:'lisapark@airbnb.com',  date:_demoDate(5), time:'10:30', status:'pending',    note:'45 Airbnb units. Discuss turnover schedule and team access.'},
        {name:'Airbnb Host — Kim',  phone:'+15125550020', email:'kim.host@gmail.com',   date:_demoDate(6), time:'09:00', status:'pending',    note:'8 units in South Austin. Wants same-day turnover service.'},
        {name:'Johnson Family',     phone:'+15125550007', email:'johnson@gmail.com',    date:_demoDate(-3),time:'10:00', status:'confirmed',  note:'Biweekly residential — completed clean, 9.5/10 score.'},
        {name:'Davis Residence',    phone:'+15125550008', email:'jdavis@gmail.com',     date:_demoDate(-5),time:'14:00', status:'confirmed',  note:'Biweekly residential — complaint re-clean scheduled.'},
    ];
    await window.safeBatchCommit(apptDefs.map(a => ({type:'set', ref:cr.collection('booking_appointments').doc(), data:{
        calendarId:bookingCalRef.id,
        calendarName:'Book a Cleaning — Free Estimate',
        guestName:a.name, guestPhone:a.phone, guestEmail:a.email,
        date:a.date, startTime:a.time,
        endTime:(parseInt(a.time.split(':')[0])+(a.time.split(':')[1]==='00'?0:1)).toString().padStart(2,'0')+':'+(a.time.split(':')[1]==='00'?'45':'15'),
        status:a.status, note:a.note,
        answers:[{questionId:'q1',answer:a.note},{questionId:'q2',answer:'Estimated 1500-18000 sqft'}],
        createdAt:_demoTs(-Math.floor(Math.random()*7+1)), updatedAt:now,
    }})));

    // ── 15. METRICS ───────────────────────────────────────────
    const METRICS = [
        // Weekly (15)
        {name:'Revenue (week)',                    unit:'$',   cat:'Finance',    freq:'weekly',  value:29800,  trend:8.0,  int:false, desc:'Total weekly revenue from all cleaning jobs and contracts. Goal: $32,000/week.'},
        {name:'New leads',                         unit:'ea',  cat:'Marketing',  freq:'weekly',  value:15,     trend:10.0, int:true,  desc:'New inquiries received (calls, forms, referrals). Goal: 18/week.'},
        {name:'New contracts signed',              unit:'ea',  cat:'Sales',      freq:'weekly',  value:2,      trend:8.0,  int:true,  desc:'New contracts or recurring agreements signed this week. Goal: 3/week.'},
        {name:'Conversion rate lead→contract',     unit:'%',   cat:'Sales',      freq:'weekly',  value:16,     trend:5.0,  int:false, desc:'% of leads that become paying clients. Goal: 18%. Industry avg: 15%.'},
        {name:'Jobs completed',                    unit:'ea',  cat:'Operations', freq:'weekly',  value:78,     trend:6.0,  int:true,  desc:'Total cleaning jobs completed this week. Goal: 85/week.'},
        {name:'On-time arrival rate',              unit:'%',   cat:'Operations', freq:'weekly',  value:96.2,   trend:2.0,  int:false, desc:'% of jobs where crew arrived within 15 minutes of scheduled time. Goal: 98%.'},
        {name:'Client satisfaction score',         unit:'/10', cat:'Quality',    freq:'weekly',  value:9.1,    trend:3.0,  int:false, desc:'Average post-job satisfaction score (0-10). Goal: 9.2+.'},
        {name:'Re-clean requests',                 unit:'ea',  cat:'Quality',    freq:'weekly',  value:1,      trend:-10.0,int:true,  desc:'Number of re-cleans requested due to quality issues. Goal: 0. Each = lost margin.'},
        {name:'Crew utilization rate',             unit:'%',   cat:'Operations', freq:'weekly',  value:84,     trend:4.0,  int:false, desc:'% of available crew hours that were billable. Goal: 88%.'},
        {name:'Tasks completed on time',           unit:'%',   cat:'Management', freq:'weekly',  value:86,     trend:5.0,  int:false, desc:'% of internal tasks completed by deadline. Goal: 92%.'},
        {name:'Overdue tasks',                     unit:'ea',  cat:'Management', freq:'weekly',  value:4,      trend:-18.0,int:true,  desc:'Open tasks past their deadline. Goal: 0. Currently: tax, equipment, BGC, website.'},
        {name:'Bookings via website',              unit:'ea',  cat:'Marketing',  freq:'weekly',  value:21,     trend:8.0,  int:true,  desc:'New booking requests submitted through website. Goal: 25/week.'},
        {name:'5-star reviews received',           unit:'ea',  cat:'Marketing',  freq:'weekly',  value:6,      trend:10.0, int:true,  desc:'New 5-star Google reviews this week. Goal: 8/week. Reviews = free lead gen.'},
        {name:'Tasks returned for rework',         unit:'ea',  cat:'Management', freq:'weekly',  value:2,      trend:-8.0, int:true,  desc:'Tasks rejected from review and sent back. Goal: <2. Indicates unclear task writing.'},
        {name:'Unanswered calls / messages',       unit:'ea',  cat:'Sales',      freq:'weekly',  value:3,      trend:-15.0,int:true,  desc:'Calls or messages that went unanswered. Goal: 0. Every missed call = potential lost client.'},

        // Monthly — Financial (first 9)
        {name:'Monthly Revenue',                   unit:'$',   cat:'Finance',    freq:'monthly', value:118500, trend:10.0, int:false, desc:'Total monthly revenue. Goal: $128,000. Current best month ever: $118,500.'},
        {name:'Net Profit',                        unit:'$',   cat:'Finance',    freq:'monthly', value:36500,  trend:8.0,  int:false, desc:'Revenue minus all expenses. Goal: $38,400. Track weekly, not monthly.'},
        {name:'Profit Margin',                     unit:'%',   cat:'Finance',    freq:'monthly', value:30.8,   trend:3.0,  int:false, desc:'Net profit / Revenue. Goal: 30%. Industry top performers: 28-35%.'},
        {name:'Average job value',                 unit:'$',   cat:'Finance',    freq:'monthly', value:371,    trend:6.0,  int:false, desc:'Total revenue / jobs completed. Goal: $385. Improve by upselling add-ons.'},
        {name:'Supplies cost',                     unit:'$',   cat:'Finance',    freq:'monthly', value:5200,   trend:4.0,  int:false, desc:'Total cleaning supply spend. Should stay under 5% of revenue.'},
        {name:'Labor cost',                        unit:'$',   cat:'Finance',    freq:'monthly', value:74000,  trend:2.0,  int:false, desc:'Total crew payroll. Largest expense — target 55-60% of revenue.'},
        {name:'Accounts receivable',               unit:'$',   cat:'Finance',    freq:'monthly', value:22400,  trend:-5.0, int:false, desc:'Outstanding invoices not yet paid. Goal: under 2 weeks revenue. Chase at 30 days.'},
        {name:'Recurring contract revenue',        unit:'$',   cat:'Finance',    freq:'monthly', value:82000,  trend:15.0, int:false, desc:'Revenue from recurring contracts (not one-time). Goal: 70% of total revenue.'},
        {name:'One-time job revenue',              unit:'$',   cat:'Finance',    freq:'monthly', value:36500,  trend:3.0,  int:false, desc:'Revenue from one-time jobs (move-outs, deep cleans). Good for cash flow, not growth.'},

        // Operational (8)
        {name:'Total jobs completed',              unit:'ea',  cat:'Operations', freq:'monthly', value:318,    trend:6.0,  int:true,  desc:'All cleaning jobs completed. Goal: 340/month. Requires 3-4 full crews.'},
        {name:'Recurring clients',                 unit:'ea',  cat:'Sales',      freq:'monthly', value:78,     trend:8.0,  int:true,  desc:'Clients on active recurring contracts. Goal: 85. The foundation of the business.'},
        {name:'New clients acquired',              unit:'ea',  cat:'Sales',      freq:'monthly', value:18,     trend:10.0, int:true,  desc:'New clients who completed first job this month. Goal: 22/month.'},
        {name:'Client retention rate',             unit:'%',   cat:'Sales',      freq:'monthly', value:92.4,   trend:3.0,  int:false, desc:'% of clients who renewed or stayed active. Goal: 94%. Losing clients = losing compounding revenue.'},
        {name:'NPS score',                         unit:'pts', cat:'Quality',    freq:'monthly', value:68,     trend:5.0,  int:false, desc:'Net Promoter Score from monthly survey. Goal: 72+. Key indicator of referral likelihood.'},
        {name:'Response time to booking',          unit:'hrs', cat:'Sales',      freq:'monthly', value:2.8,    trend:-8.0, int:false, desc:'Average hours to respond to new booking inquiry. Goal: under 2 hours. Speed = conversion.'},
        {name:'No-show / cancellation rate',       unit:'%',   cat:'Operations', freq:'monthly', value:6.2,    trend:-5.0, int:false, desc:'% of booked jobs that were cancelled or no-showed. Goal: under 5%.'},
        {name:'Contracts renewed',                 unit:'ea',  cat:'Sales',      freq:'monthly', value:12,     trend:6.0,  int:true,  desc:'Contracts successfully renewed this month. Proactive renewal = zero churn.'},
        {name:'Referrals received',                unit:'ea',  cat:'Marketing',  freq:'monthly', value:11,     trend:12.0, int:true,  desc:'New clients who came via referral. Goal: 15/month. Referrals convert at 60%+ vs 15% for ads.'},

        // Quality & HR (8)
        {name:'Re-clean rate',                     unit:'%',   cat:'Quality',    freq:'monthly', value:1.8,    trend:-8.0, int:false, desc:'% of jobs requiring a re-clean. Goal: under 2%. Above 3% = systemic training issue.'},
        {name:'Complaint rate',                    unit:'%',   cat:'Quality',    freq:'monthly', value:0.6,    trend:-10.0,int:false, desc:'% of jobs resulting in formal complaint. Goal: under 1%. Track reason per complaint.'},
        {name:'5-star Google reviews',             unit:'ea',  cat:'Marketing',  freq:'monthly', value:24,     trend:15.0, int:true,  desc:'New 5-star Google reviews. Goal: 30+/month. Reviews are best free marketing.'},
        {name:'Crew turnover rate',                unit:'%',   cat:'HR',         freq:'monthly', value:4.2,    trend:-5.0, int:false, desc:'% of crew who left this month. Goal: under 5%. High turnover = high training cost.'},
        {name:'Training hours completed',          unit:'hrs', cat:'HR',         freq:'monthly', value:6.5,    trend:8.0,  int:false, desc:'Average training hours per crew member. Goal: 8 hrs/month. Trained crews = fewer complaints.'},
        {name:'Equipment downtime',                unit:'hrs', cat:'Operations', freq:'monthly', value:3,      trend:-12.0,int:false, desc:'Hours lost due to equipment breakdown. Goal: 0. Preventive maintenance prevents this.'},
        {name:'Supply waste rate',                 unit:'%',   cat:'Operations', freq:'monthly', value:2.4,    trend:-6.0, int:false, desc:'% of supplies used above standard ratio. Goal: under 3%. Train crews on dilution ratios.'},
        {name:'OSHA incidents',                    unit:'ea',  cat:'HR',         freq:'monthly', value:0,      trend:0.0,  int:true,  desc:'Workplace safety incidents. Goal: 0. Report any incident within 24 hours.'},

        // 18 checkpoints
        {name:'01 Booking confirmed 2hrs',         unit:'%', cat:'Checkpoints', freq:'monthly', value:88, trend:4.0, int:false, desc:'% of new bookings confirmed (called/emailed) within 2 hours. Slower = lost client.'},
        {name:'02 Crew assigned before job',       unit:'%', cat:'Checkpoints', freq:'monthly', value:96, trend:2.0, int:false, desc:'% of jobs with crew assigned at least 24 hours before scheduled time.'},
        {name:'03 Pre-clean checklist done',       unit:'%', cat:'Checkpoints', freq:'monthly', value:82, trend:5.0, int:false, desc:'% of jobs where crew completed pre-clean walkthrough checklist.'},
        {name:'04 Arrival on time',                unit:'%', cat:'Checkpoints', freq:'monthly', value:96, trend:2.0, int:false, desc:'% of jobs with on-time arrival (within 15 min of schedule).'},
        {name:'05 Cleaning checklist signed',      unit:'%', cat:'Checkpoints', freq:'monthly', value:91, trend:3.0, int:false, desc:'% of jobs with completed, signed cleaning checklist.'},
        {name:'06 QC photo taken',                 unit:'%', cat:'Checkpoints', freq:'monthly', value:85, trend:6.0, int:false, desc:'% of jobs with after-clean photos uploaded before crew leaves.'},
        {name:'07 Client notified on completion',  unit:'%', cat:'Checkpoints', freq:'monthly', value:94, trend:2.0, int:false, desc:'% of clients notified via text/email upon job completion.'},
        {name:'08 Invoice sent same day',          unit:'%', cat:'Checkpoints', freq:'monthly', value:88, trend:5.0, int:false, desc:'% of completed jobs with invoice sent same day. Delayed invoicing = delayed cash.'},
        {name:'09 Payment collected on time',      unit:'%', cat:'Checkpoints', freq:'monthly', value:86, trend:3.0, int:false, desc:'% of invoices paid by due date. Chase at 30 days.'},
        {name:'10 Review requested',               unit:'%', cat:'Checkpoints', freq:'monthly', value:78, trend:8.0, int:false, desc:'% of completed jobs where client was asked for Google review.'},
        {name:'11 Follow-up call 48hrs',           unit:'%', cat:'Checkpoints', freq:'monthly', value:65, trend:10.0,int:false, desc:'% of new clients who received a follow-up satisfaction call within 48 hours.'},
        {name:'12 Recurring schedule set',         unit:'%', cat:'Checkpoints', freq:'monthly', value:72, trend:6.0, int:false, desc:'% of one-time clients offered and given recurring schedule option.'},
        {name:'13 Supplies restocked after job',   unit:'%', cat:'Checkpoints', freq:'monthly', value:89, trend:3.0, int:false, desc:'% of van supply kits restocked to standard level after each job.'},
        {name:'14 Equipment cleaned after job',    unit:'%', cat:'Checkpoints', freq:'monthly', value:92, trend:2.0, int:false, desc:'% of equipment properly cleaned and stored after each job.'},
        {name:'15 Incident report filed',          unit:'%', cat:'Checkpoints', freq:'monthly', value:100,trend:0.0, int:false, desc:'% of incidents (damage, injury) with incident report filed same day.'},
        {name:'16 Crew feedback submitted',        unit:'%', cat:'Checkpoints', freq:'monthly', value:68, trend:8.0, int:false, desc:'% of crew members who submitted end-of-week feedback on jobs and issues.'},
        {name:'17 Client satisfaction logged',     unit:'%', cat:'Checkpoints', freq:'monthly', value:82, trend:4.0, int:false, desc:'% of jobs with client satisfaction score logged in system.'},
        {name:'18 Contract renewal flagged 30d',   unit:'%', cat:'Checkpoints', freq:'monthly', value:88, trend:5.0, int:false, desc:'% of contracts where renewal outreach started 30 days before expiration.'},
    ];

    const mOps = [];
    for (const m of METRICS) {
        const mRef = cr.collection('metrics').doc();
        const freq = m.freq || 'weekly';
        mOps.push({type:'set', ref:mRef, data:{
            name:m.name, unit:m.unit, category:m.cat, frequency:freq,
            scope:'company', scopeType:'company',
            description:m.desc, formula:'', inputType:'manual',
            importance:'critical', createdBy:uid, createdAt:now, updatedAt:now,
        }});
        const periods = freq === 'weekly' ? 12 : 8;
        for (let p = 0; p < periods; p++) {
            const trendFactor = 1 - (m.trend || 0) / 100 * p / periods;
            const noiseScale  = m.value > 10000 ? 0.06 : (m.int ? 0.15 : 0.08);
            const noise = (Math.random() - 0.5) * noiseScale;
            const rawVal = m.value * trendFactor * (1 + noise);
            let val;
            if (m.int) val = Math.max(0, Math.round(rawVal));
            else if (['%','/10','pts'].includes(m.unit)) val = Math.min(m.unit==='%'?100:10, Math.max(0, Math.round(rawVal * 10) / 10));
            else val = Math.max(0, Math.round(rawVal * 10) / 10);
            const entryRef = cr.collection('metricEntries').doc();
            const d2 = new Date();
            let pk;
            if (freq === 'monthly') {
                d2.setMonth(d2.getMonth() - p);
                pk = d2.getFullYear() + '-' + String(d2.getMonth()+1).padStart(2,'0');
            } else {
                d2.setDate(d2.getDate() - p * 7);
                d2.setHours(12,0,0,0);
                const dow = d2.getDay() || 7;
                d2.setDate(d2.getDate() - dow + 4);
                const j1 = new Date(d2.getFullYear(), 0, 1);
                const wn = Math.ceil(((d2 - j1) / 864e5 + j1.getDay() + 1) / 7);
                pk = d2.getFullYear() + '-W' + String(wn).padStart(2,'0');
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

    const mSnap = await cr.collection('metrics').get();
    const mMap = {};
    mSnap.docs.forEach(d => { mMap[d.data().name] = d.id; });
    const KPI_TARGETS = [
        {name:'Revenue (week)',             target:32000, period:'weekly'},
        {name:'Client satisfaction score',  target:9.2,   period:'weekly'},
        {name:'On-time arrival rate',       target:98,    period:'weekly'},
        {name:'Re-clean requests',          target:0,     period:'weekly'},
        {name:'Monthly Revenue',            target:128000,period:'monthly'},
        {name:'Net Profit',                 target:38400, period:'monthly'},
        {name:'Profit Margin',              target:30,    period:'monthly'},
        {name:'Client retention rate',      target:94,    period:'monthly'},
        {name:'NPS score',                  target:72,    period:'monthly'},
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
    for (const t of KPI_TARGETS) {
        const mid = mMap[t.name];
        if (!mid) continue;
        const pk = t.period === 'monthly' ? curMonth : curWeek;
        for (let p = 0; p < 3; p++) {
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

    // ── 16. COMPANY PROFILE ───────────────────────────────────
    await cr.update({
        name:           'SparkClean Pro',
        niche:          'cleaning',
        nicheLabel:     'Commercial & Residential Cleaning',
        description:    'Commercial cleaning, residential, post-construction, and Airbnb turnover cleaning in Austin, TX.',
        city:           'Austin, TX',
        employees:      12,
        currency:       'USD',
        companyGoal:    'Become #1 rated cleaning company in Austin by Google reviews and recurring commercial contracts',
        companyConcept: 'Cleaning without stress — client books once, gets consistent quality forever. Every crew shows up on time, follows the checklist, sends photos, and asks for a review. No surprises, no excuses.',
        companyCKP:     'Every client renews their contract and refers at least 2 friends within 12 months',
        companyIdeal:   '25 crews working simultaneously. Owner reviews only dashboard KPIs each morning — not fielding calls or fixing problems. $150K/month recurring revenue. Google rating 4.9+. Zero re-cleans.',
        targetAudience: 'Austin homeowners with $80K+ household income, property managers with 5+ units, offices 2,000-50,000 sqft, and Airbnb hosts with 3+ properties. They pay for reliability, not for cheap.',
        avgCheck:       371,
        monthlyRevenue: 118500,
        updatedAt:      firebase.firestore.FieldValue.serverTimestamp(),
    });
};

if (window._NICHE_LABELS) window._NICHE_LABELS['cleaning'] = 'SparkClean Pro — Cleaning Company (Austin, TX)';
