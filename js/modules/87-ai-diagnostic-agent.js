// =====================
// 87-AI-DIAGNOSTIC-AGENT — TALKO
// Операційний AI-діагност для Owner Dashboard.
//
// РОЛЬ: вузький операційний аналітик — не "як можу допомогти?",
//       а конкретний звіт: 3-5 збоїв → причина → наслідок → дія.
//
// АРХІТЕКТУРА:
//   runDiagnostic()
//     → збирає diagnosticContext із глобального стану
//     → пропускає через DIAGNOSTIC_MATRIX (rule-based, 150+ кейсів)
//     → якщо є критичні/попереджувальні сигнали — викликає AI API (Claude)
//     → рендерить секцію в Owner Dashboard
//     → зберігає рекомендації в Firestore: companies/{id}/ai_recommendations
//
// ЗАЛЕЖНОСТІ:
//   03-app-state.js, 71-owner-dashboard.js (renderOwnerDashboard)
//   84b-event-tracking.js (trackAIRecommendation, trackOwnerTaskOverload, trackFunctionOverload)
//   api/ai-proxy.js (Claude Sonnet)
// =====================
'use strict';

// ─────────────────────────────────────────
// КОНСТАНТИ
// ─────────────────────────────────────────
const DIAG_CONTAINER_ID   = 'aiDiagnosticReport';
const DIAG_COOLDOWN_MS    = 5 * 60 * 1000;   // не перезапускати частіше 5 хв
const DIAG_CACHE_KEY      = 'talko_diag_cache';

// Пороги діагностичної матриці (з ТЗ, 150+ кейсів)
const THRESHOLDS = {
    OWNER_TASK_RATIO:      0.30,  // >30% активних задач на власнику — критично
    OVERDUE_RATIO:         0.30,  // >30% прострочених — критично
    FUNCTION_RETURN_RATE:  0.20,  // >20% повернень у функції — попередження
    USER_OVERDUE_CRITICAL: 3,     // ≥3 прострочених у юзера — попередження
    STALLED_PROCESS_HOURS: 24,    // процес не рухався >24 год — попередження
};

// ─────────────────────────────────────────
// ДІАГНОСТИЧНА МАТРИЦЯ
// rule-based. Кожне правило: { id, check(ctx), severity, signal, diagnosis, consequence, action }
// ─────────────────────────────────────────
const DIAGNOSTIC_MATRIX = [

    // ── 1. Власник в операційці ─────────────────────────────
    {
        id: 'owner_task_overload',
        severity: 'critical',
        check(ctx) {
            if (!ctx.ownerTaskCount || !ctx.tasks.active) return false;
            return (ctx.ownerTaskCount / ctx.tasks.active) > THRESHOLDS.OWNER_TASK_RATIO;
        },
        signal(ctx) {
            const pct = Math.round((ctx.ownerTaskCount / ctx.tasks.active) * 100);
            return `${ctx.ownerTaskCount} з ${ctx.tasks.active} активних задач (${pct}%) — на власнику`;
        },
        diagnosis:   'Власник застряг в операційці',
        consequence: 'Стратегічне зростання заблоковане — власник виконує роботу менеджерів',
        action:      'Переглянути задачі власника: які можна делегувати прямо зараз?',
    },

    // ── 2. Хаос в команді (загальні прострочені) ────────────
    {
        id: 'team_overdue_chaos',
        severity: 'critical',
        check(ctx) {
            if (!ctx.tasks.active) return false;
            return (ctx.tasks.overdue / ctx.tasks.active) > THRESHOLDS.OVERDUE_RATIO;
        },
        signal(ctx) {
            const pct = Math.round((ctx.tasks.overdue / ctx.tasks.active) * 100);
            return `${ctx.tasks.overdue} з ${ctx.tasks.active} активних задач прострочені (${pct}%)`;
        },
        diagnosis:   'Хаос в команді — виконання вийшло з-під контролю',
        consequence: 'Клієнти отримують послугу із затримками, репутаційні ризики',
        action:      'Провести короткий standup: по кожній простроченій задачі — причина і новий дедлайн сьогодні',
    },

    // ── 3. Функція з високим рейтом повернень ───────────────
    {
        id: 'function_high_return_rate',
        severity: 'warning',
        check(ctx) {
            return ctx.byFunction.some(f => f.returnRate > THRESHOLDS.FUNCTION_RETURN_RATE && f.active >= 3);
        },
        signal(ctx) {
            const worst = ctx.byFunction
                .filter(f => f.returnRate > THRESHOLDS.FUNCTION_RETURN_RATE && f.active >= 3)
                .sort((a, b) => b.returnRate - a.returnRate)[0];
            return `Функція "${worst.name}": ${Math.round(worst.returnRate * 100)}% задач повертаються на доопрацювання`;
        },
        diagnosis:   'Нечіткі постановки задач або слабка компетенція у функції',
        consequence: 'Подвійні витрати часу — кожна задача робиться двічі',
        action:      'Переглянути шаблон постановки задач у цій функції: додати приклад результату і критерії прийняття',
    },

    // ── 4. Функції без метрик ────────────────────────────────
    {
        id: 'functions_without_statistics',
        severity: 'warning',
        check(ctx) {
            return ctx.statistics.functionsWithoutData.length > 0;
        },
        signal(ctx) {
            const names = ctx.statistics.functionsWithoutData.slice(0, 3).join(', ');
            const more  = ctx.statistics.functionsWithoutData.length > 3
                ? ` та ще ${ctx.statistics.functionsWithoutData.length - 3}`
                : '';
            return `Немає метрик у функціях: ${names}${more}`;
        },
        diagnosis:   'Управління без даних — рішення приймаються по відчуттях',
        consequence: 'Неможливо визначити де є реальна проблема, а де тільки здається',
        action:      'Встановити хоча б 1 KPI для кожної функції без метрик — прямо зараз у розділі Статистика',
    },

    // ── 5. Зупинені процеси ──────────────────────────────────
    {
        id: 'stalled_processes',
        severity: 'warning',
        check(ctx) {
            return ctx.processes.stalled > 0;
        },
        signal(ctx) {
            return `${ctx.processes.stalled} ${ctx.processes.stalled === 1 ? 'процес зупинився' : 'процеси зупинились'} — жодного руху >24 год`;
        },
        diagnosis:   'Вузькі місця в бізнес-процесах',
        consequence: 'Клієнти чекають. Кожна година затримки — це ризик скасування',
        action:      'Відкрити розділ Процеси → знайти зупинений крок → призначити відповідального і дедлайн',
    },

    // ── 6. Перевантажені або неефективні співробітники ──────
    {
        id: 'user_overdue_critical',
        severity: 'warning',
        check(ctx) {
            return ctx.byUser.some(u => !u.isOwner && u.overdue >= THRESHOLDS.USER_OVERDUE_CRITICAL);
        },
        signal(ctx) {
            const worst = ctx.byUser
                .filter(u => !u.isOwner && u.overdue >= THRESHOLDS.USER_OVERDUE_CRITICAL)
                .sort((a, b) => b.overdue - a.overdue)[0];
            return `${worst.name}: ${worst.overdue} прострочених задач одночасно`;
        },
        diagnosis:   'Співробітник перевантажений або задачі поставлені некоректно',
        consequence: 'Деградація якості роботи, ризик вигорання або прихованого саботажу',
        action:      'Провести 1-on-1: з\'ясувати причину — перевантаження чи відсутність розуміння задачі',
    },

    // ── 7. Порушення SLA процесів ────────────────────────────
    {
        id: 'process_sla_breached',
        severity: 'critical',
        check(ctx) {
            return ctx.processes.slaBreaches > 0;
        },
        signal(ctx) {
            return `${ctx.processes.slaBreaches} ${ctx.processes.slaBreaches === 1 ? 'порушення SLA' : 'порушення SLA'} по активних процесах`;
        },
        diagnosis:   'Стандарти часу обслуговування порушені',
        consequence: 'Ризик репутації та претензій від клієнтів',
        action:      'Переглянути процеси з порушенням SLA → виявити де затримка і хто відповідальний',
    },
];

// ─────────────────────────────────────────
// ЗБІР КОНТЕКСТУ ДІАГНОСТИКИ
// Читає з глобального стану без додаткових Firestore запитів
// ─────────────────────────────────────────
function _buildDiagnosticContext() {
    const allTasks    = window.tasks    || [];
    const allUsers    = window.users    || [];
    const allProcs    = window.processes || [];
    const allFuncs    = window.functions || [];
    const ownerId     = window.currentUser?.uid;
    const ownerRole   = window.currentUserData?.role;

    const now     = new Date();
    const today   = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().split('T')[0];
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // ── Задачі ────────────────────────────────────────
    const activeTasks = allTasks.filter(t => t.status !== 'done');
    const overdueTasks = activeTasks.filter(t => {
        const d = t.deadlineDate;
        return d && d < today;
    });
    const doneThisWeek = allTasks.filter(t => {
        if (t.status !== 'done') return false;
        const comp = t.completedDate || (t.completedAt?.toDate
            ? t.completedAt.toDate().toISOString().split('T')[0]
            : '');
        return comp >= weekAgoStr;
    });

    // ── Власник ──────────────────────────────────────
    const ownerTasks = (ownerRole === 'owner' || ownerRole === 'manager')
        ? activeTasks.filter(t => t.assigneeId === ownerId)
        : [];

    // ── По функціях ──────────────────────────────────
    // returnRate = задачі з reviewRejectedAt / total в функції за 7 днів
    const funcMap = {};
    allTasks.forEach(t => {
        const fn = t.function || '_none';
        if (!funcMap[fn]) funcMap[fn] = { name: fn, active: 0, overdue: 0, returned: 0 };
        if (t.status !== 'done') {
            funcMap[fn].active++;
            const d = t.deadlineDate;
            if (d && d < today) funcMap[fn].overdue++;
        }
        if (t.reviewRejectedAt) funcMap[fn].returned++;
    });
    const byFunction = Object.values(funcMap)
        .filter(f => f.name !== '_none')
        .map(f => ({
            ...f,
            returnRate: f.active > 0 ? f.returned / f.active : 0,
        }));

    // ── По юзерах ────────────────────────────────────
    const userMap = {};
    activeTasks.forEach(t => {
        const uid = t.assigneeId || '__none';
        if (!userMap[uid]) {
            const u = allUsers.find(u => u.id === uid);
            userMap[uid] = {
                id: uid,
                name: u ? (u.name || u.email) : 'Без виконавця',
                active: 0,
                overdue: 0,
                doneThisWeek: 0,
                isOwner: uid === ownerId,
            };
        }
        userMap[uid].active++;
        const d = t.deadlineDate;
        if (d && d < today) userMap[uid].overdue++;
    });
    doneThisWeek.forEach(t => {
        const uid = t.assigneeId;
        if (uid && userMap[uid]) userMap[uid].doneThisWeek++;
    });
    const byUser = Object.values(userMap).filter(u => u.id !== '__none');

    // ── Процеси ──────────────────────────────────────
    let stalled = 0, slaBreaches = 0;
    const activeProcs = allProcs.filter(p => p.status === 'active' || p.status === 'progress');
    activeProcs.forEach(p => {
        // Стопорний процес: currentStep не змінився >24 год
        if (p.updatedAt) {
            const updMs = p.updatedAt?.toMillis
                ? p.updatedAt.toMillis()
                : new Date(p.updatedAt).getTime();
            const hoursStalled = (Date.now() - updMs) / 3600000;
            if (hoursStalled > THRESHOLDS.STALLED_PROCESS_HOURS) stalled++;
        }
        // SLA: перевіряємо чи є поточний крок з slaMinutes
        if (p.slaBreached) slaBreaches++;
        // Альтернативний розрахунок SLA якщо є template
        if (p.templateId && p.currentStepStartedAt) {
            const tmpl = (window.processTemplates || []).find(t => t.id === p.templateId);
            const step = tmpl?.steps?.[p.currentStep || 0];
            if (step?.slaMinutes) {
                const startMs = p.currentStepStartedAt?.toMillis
                    ? p.currentStepStartedAt.toMillis()
                    : new Date(p.currentStepStartedAt).getTime();
                const elapsedMin = (Date.now() - startMs) / 60000;
                if (elapsedMin > step.slaMinutes) slaBreaches++;
            }
        }
    });

    // ── Статистика (функції без метрик) ──────────────
    const statsData   = window._metrics || window.statisticsData || window.metricsData || [];
    const funcNames   = allFuncs.map(f => f.name).filter(Boolean);
    const funcsWithStats = new Set(statsData.map(s => s.function || s.functionName || s.functionId).filter(Boolean));
    const functionsWithoutData = funcNames.filter(n => !funcsWithStats.has(n));

    return {
        tasks: {
            total:       allTasks.length,
            active:      activeTasks.length,
            overdue:     overdueTasks.length,
            doneToday:   doneThisWeek.filter(t => t.completedDate === today).length,
            doneThisWeek: doneThisWeek.length,
        },
        byFunction,
        byUser,
        processes: {
            active:     activeProcs.length,
            stalled,
            slaBreaches,
        },
        statistics: { functionsWithoutData },
        ownerTaskCount:      ownerTasks.length,
        returnedTasksCount:  allTasks.filter(t => t.reviewRejectedAt).length,
    };
}

// ─────────────────────────────────────────
// RULE-BASED ОЦІНКА СИГНАЛІВ
// ─────────────────────────────────────────
function _evaluateSignals(ctx) {
    const fired = [];
    for (const rule of DIAGNOSTIC_MATRIX) {
        try {
            if (rule.check(ctx)) {
                fired.push({
                    id:          rule.id,
                    severity:    rule.severity,
                    signal:      rule.signal(ctx),
                    diagnosis:   rule.diagnosis,
                    consequence: rule.consequence,
                    action:      rule.action,
                });
            }
        } catch (e) {
            console.warn(`[DiagAgent] Rule ${rule.id} error:`, e.message);
        }
    }
    // Сортуємо: critical → warning
    return fired.sort((a, b) => (a.severity === 'critical' ? -1 : 1));
}

// ─────────────────────────────────────────
// AI ЗБАГАЧЕННЯ (Claude Sonnet через api/ai-proxy)
// Викликається тільки якщо є сигнали — не "що нового?", а конкретний контекст
// ─────────────────────────────────────────
async function _enrichWithAI(signals, ctx) {
    try {
        const prompt = _buildAIPrompt(signals, ctx);

        const response = await fetch('/api/ai-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId:    window.currentCompanyId,
                module:       'diagnostic_agent',
                messages: [{ role: 'user', content: prompt }],
                systemPrompt: `Ти операційний аналітик бізнесу. Твоя задача — видати короткі, конкретні, практичні рекомендації власнику малого бізнесу. 
Відповідай ТІЛЬКИ у форматі JSON масиву. Жодного тексту поза JSON.
Формат кожного елементу: {"id":"...", "insight":"..."}
де insight — одне речення: що конкретно треба зробити СЬОГОДНІ. Без вступів, без "варто розглянути".`,
                maxTokens: 600,
                temperature: 0.3,
            }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        const text = data.content || data.text || '';

        // Парсимо JSON з відповіді
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (!Array.isArray(parsed)) return null;

        // Мерджимо insights з rule-based сигналами
        return signals.map(sig => {
            const enrich = parsed.find(p => p.id === sig.id);
            return enrich ? { ...sig, aiInsight: enrich.insight } : sig;
        });

    } catch (e) {
        console.warn('[DiagAgent] AI enrichment failed:', e.message);
        return null; // fallback до rule-based без AI
    }
}

function _buildAIPrompt(signals, ctx) {
    const lines = signals.map(s =>
        `- [${s.id}] ${s.signal} → Діагноз: ${s.diagnosis}`
    ).join('\n');

    return `Контекст бізнесу:
- Активних задач: ${ctx.tasks.active}
- Прострочених: ${ctx.tasks.overdue}
- Виконано за тиждень: ${ctx.tasks.doneThisWeek}
- Активних процесів: ${ctx.processes.active}
- Задач на власнику: ${ctx.ownerTaskCount}

Виявлені операційні збої:
${lines}

Для кожного збою (використовуй точний id) — одна конкретна дія на сьогодні для власника.`;
}

// ─────────────────────────────────────────
// ЗБЕРЕЖЕННЯ РЕКОМЕНДАЦІЙ В FIRESTORE
// ─────────────────────────────────────────
async function _saveRecommendations(signals) {
    const companyId = window.currentCompanyId;
    if (!companyId || !signals.length) return;

    try {
        const today = new Date().toISOString().split('T')[0];
        const batch = db.batch();
        const colRef = db.collection(`companies/${companyId}/ai_recommendations`);

        signals.forEach(sig => {
            const docRef = colRef.doc(`${today}_${sig.id}`);
            batch.set(docRef, {
                date:        today,
                signal:      sig.id,
                severity:    sig.severity,
                signalText:  sig.signal,
                diagnosis:   sig.diagnosis,
                consequence: sig.consequence,
                action:      sig.action,
                aiInsight:   sig.aiInsight || null,
                shown:       true,
                action_taken: null,
                dismissed:   false,
                createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        });

        await batch.commit();
    } catch (e) {
        console.warn('[DiagAgent] Save recommendations failed:', e.message);
    }
}

// ─────────────────────────────────────────
// РЕНДЕР СЕКЦІЇ В OWNER DASHBOARD
// ─────────────────────────────────────────
function _renderContainer() {
    const dashboard = document.getElementById('ownerDashboardContent');
    if (!dashboard) return null;

    // Idempotency: видаляємо попередній якщо є
    document.getElementById(DIAG_CONTAINER_ID)?.remove();

    const container = document.createElement('div');
    container.id = DIAG_CONTAINER_ID;
    container.style.cssText = 'margin-bottom:1rem;';

    // Вставляємо ПЕРЕД основним контентом дашборду
    dashboard.insertAdjacentElement('afterbegin', container);
    return container;
}

function _renderLoader(container) {
    container.innerHTML = `
    <div style="background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);border-radius:12px;padding:1rem 1.25rem;border:1px solid #bae6fd;display:flex;align-items:center;gap:0.75rem;">
        <div style="width:20px;height:20px;border:2px solid #0ea5e9;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;flex-shrink:0;"></div>
        <div>
            <div style="font-weight:600;font-size:0.9rem;color:#0369a1;">AI-діагностика запущена</div>
            <div style="font-size:0.78rem;color:#0284c7;margin-top:0.1rem;">Аналізую операційний стан компанії…</div>
        </div>
    </div>`;
}

function _renderSignals(container, signals, ctx) {
    if (signals.length === 0) {
        container.innerHTML = `
        <div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:12px;padding:1rem 1.25rem;border:1px solid #bbf7d0;display:flex;align-items:center;gap:0.75rem;">
            <div style="font-size:1.4rem;">✅</div>
            <div>
                <div style="font-weight:600;font-size:0.9rem;color:#15803d;">Операційних збоїв не виявлено</div>
                <div style="font-size:0.78rem;color:#16a34a;margin-top:0.1rem;">Бізнес працює в нормальному режимі. Наступна перевірка автоматично.</div>
            </div>
        </div>`;
        return;
    }

    const criticals = signals.filter(s => s.severity === 'critical');
    const warnings  = signals.filter(s => s.severity === 'warning');

    const headerColor = criticals.length > 0 ? '#dc2626' : '#d97706';
    const headerBg    = criticals.length > 0
        ? 'linear-gradient(135deg,#fff1f2 0%,#fecdd3 100%)'
        : 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)';
    const headerBorder = criticals.length > 0 ? '#fecaca' : '#fde68a';
    const headerIcon   = criticals.length > 0 ? '🔴' : '🟡';
    const headerTitle  = criticals.length > 0
        ? `${criticals.length} критичних збоїв виявлено`
        : `${warnings.length} попереджень`;

    const rows = signals.map((sig, i) => {
        const isCritical = sig.severity === 'critical';
        const rowBg      = isCritical ? '#fff5f5' : '#fffbf0';
        const iconEl     = isCritical
            ? '<span style="font-size:1rem;flex-shrink:0;">🔴</span>'
            : '<span style="font-size:1rem;flex-shrink:0;">🟡</span>';
        const labelColor = isCritical ? '#dc2626' : '#d97706';
        const labelText  = isCritical ? 'КРИТИЧНО' : 'ПОПЕРЕДЖЕННЯ';

        const aiInsightHtml = sig.aiInsight
            ? `<div style="margin-top:0.5rem;padding:0.4rem 0.6rem;background:#f0f9ff;border-radius:6px;border-left:3px solid #0ea5e9;font-size:0.78rem;color:#0369a1;">
                <strong>AI:</strong> ${_escHtml(sig.aiInsight)}
               </div>`
            : '';

        return `
        <div style="background:${rowBg};border-radius:8px;padding:0.85rem 1rem;border-left:3px solid ${labelColor};">
            <div style="display:flex;align-items:flex-start;gap:0.6rem;">
                ${iconEl}
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
                        <span style="font-size:0.65rem;font-weight:700;color:${labelColor};text-transform:uppercase;letter-spacing:0.05em;background:${isCritical ? '#fee2e2' : '#fef9c3'};padding:0.1rem 0.4rem;border-radius:3px;">${labelText}</span>
                    </div>
                    <div style="font-weight:600;font-size:0.88rem;color:#111827;margin-bottom:0.35rem;">${_escHtml(sig.signal)}</div>
                    <div style="font-size:0.8rem;color:#374151;margin-bottom:0.2rem;"><strong>Причина:</strong> ${_escHtml(sig.diagnosis)}</div>
                    <div style="font-size:0.8rem;color:#6b7280;margin-bottom:0.3rem;"><strong>Наслідок:</strong> ${_escHtml(sig.consequence)}</div>
                    <div style="font-size:0.8rem;color:#059669;"><strong>→ Дія:</strong> ${_escHtml(sig.action)}</div>
                    ${aiInsightHtml}
                    <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">
                        <button onclick="aiDiagDismiss('${sig.id}')" style="font-size:0.72rem;padding:0.2rem 0.6rem;border:1px solid #e5e7eb;border-radius:4px;background:white;color:#6b7280;cursor:pointer;">Прийнято до відома</button>
                        <button onclick="aiDiagAccept('${sig.id}')" style="font-size:0.72rem;padding:0.2rem 0.6rem;border:1px solid #d1fae5;border-radius:4px;background:#f0fdf4;color:#059669;cursor:pointer;">Виконую зараз ✓</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    const lastRun = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    container.innerHTML = `
    <div style="background:${headerBg};border-radius:12px;border:1px solid ${headerBorder};overflow:hidden;">
        <div style="padding:0.85rem 1.25rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${headerBorder};">
            <div style="display:flex;align-items:center;gap:0.6rem;">
                <span style="font-size:1.1rem;">${headerIcon}</span>
                <div>
                    <div style="font-weight:700;font-size:0.92rem;color:${headerColor};">AI-Діагностика: ${headerTitle}</div>
                    <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.1rem;">Оновлено о ${lastRun} · rule-based аналіз на основі 150+ кейсів</div>
                </div>
            </div>
            <button onclick="runAIDiagnostic(true)" title="Оновити діагностику" style="background:none;border:1px solid #e5e7eb;border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.75rem;color:#6b7280;">↻ Оновити</button>
        </div>
        <div style="padding:0.75rem;display:flex;flex-direction:column;gap:0.5rem;">
            ${rows}
        </div>
    </div>`;
}

// ─────────────────────────────────────────
// ГОЛОВНА ФУНКЦІЯ
// ─────────────────────────────────────────
async function runAIDiagnostic(force = false) {
    // Plan gate: AI-діагностика доступна тільки для pro/enterprise
    if (typeof window.isPlanAllowed === 'function' && !window.isPlanAllowed('ai_diagnostic')) {
        const container = _renderContainer();
        if (container) {
            container.innerHTML = `
            <div style="background:#f8fafc;border-radius:12px;padding:1rem 1.25rem;border:1px solid #e2e8f0;display:flex;align-items:center;gap:0.75rem;">
                <span style="font-size:1.2rem;">🔒</span>
                <div>
                    <div style="font-weight:600;font-size:0.88rem;color:#475569;">AI-діагностика — план Pro</div>
                    <div style="font-size:0.78rem;color:#94a3b8;margin-top:0.1rem;">Перейдіть на план Pro щоб отримувати щоденний аналіз операційних збоїв</div>
                </div>
            </div>`;
        }
        return;
    }

    // Cooldown: не запускати частіше 5 хв якщо не force
    if (!force) {
        const cache = window[DIAG_CACHE_KEY];
        if (cache && (Date.now() - cache.ts) < DIAG_COOLDOWN_MS) {
            // Показуємо закешований результат
            const container = _renderContainer();
            if (container) _renderSignals(container, cache.signals, cache.ctx);
            return;
        }
    }

    const container = _renderContainer();
    if (!container) return;

    _renderLoader(container);

    try {
        // 1. Збираємо контекст
        const ctx = _buildDiagnosticContext();

        // 2. Rule-based оцінка
        let signals = _evaluateSignals(ctx);

        // 3. ET: трекінг управлінських сигналів
        if (typeof window.trackOwnerTaskOverload === 'function' && ctx.ownerTaskCount > 0) {
            window.trackOwnerTaskOverload(ctx.ownerTaskCount, ctx.tasks.active);
        }
        ctx.byFunction.forEach(f => {
            if (f.overdue >= 3 && typeof window.trackFunctionOverload === 'function') {
                window.trackFunctionOverload(f.name, f.overdue, f.active);
            }
        });

        // 4. AI збагачення (якщо є сигнали)
        if (signals.length > 0) {
            const enriched = await _enrichWithAI(signals, ctx);
            if (enriched) signals = enriched;

            // 5. Зберігаємо рекомендації в Firestore (non-blocking)
            _saveRecommendations(signals).catch(() => {});

            // 6. ET: показали рекомендації
            if (typeof window.trackAIRecommendation === 'function') {
                signals.forEach(s => window.trackAIRecommendation('shown', s.id, s.severity));
            }
        }

        // 7. Кешуємо
        window[DIAG_CACHE_KEY] = { ts: Date.now(), signals, ctx };

        // 8. Рендеримо
        _renderSignals(container, signals, ctx);

    } catch (e) {
        console.error('[DiagAgent] runAIDiagnostic error:', e);
        container.innerHTML = `
        <div style="background:#fff5f5;border-radius:12px;padding:0.85rem 1.25rem;border:1px solid #fecaca;font-size:0.85rem;color:#dc2626;">
            AI-діагностика тимчасово недоступна. <button onclick="runAIDiagnostic(true)" style="background:none;border:none;color:#2563eb;cursor:pointer;text-decoration:underline;">Спробувати знову</button>
        </div>`;
    }
}

// ─────────────────────────────────────────
// ОБРОБНИКИ КНОПОК (dismiss / accept)
// ─────────────────────────────────────────
window.aiDiagDismiss = function(signalId) {
    if (typeof window.trackAIRecommendation === 'function') {
        window.trackAIRecommendation('ignored', signalId, 'unknown');
    }
    _updateRecommendationStatus(signalId, { dismissed: true });
    // Фейд аут картки
    const cards = document.querySelectorAll(`[onclick*="${signalId}"]`);
    cards.forEach(c => {
        const card = c.closest('[style*="border-left"]');
        if (card) card.style.opacity = '0.4';
    });
    window.showToast && showToast('Прийнято до відома', 'info');
};

window.aiDiagAccept = function(signalId) {
    if (typeof window.trackAIRecommendation === 'function') {
        window.trackAIRecommendation('accepted', signalId, 'unknown');
    }
    _updateRecommendationStatus(signalId, { action_taken: new Date().toISOString() });
    const cards = document.querySelectorAll(`[onclick*="${signalId}"]`);
    cards.forEach(c => {
        const card = c.closest('[style*="border-left"]');
        if (card) {
            card.style.borderLeftColor = '#22c55e';
            card.style.background = '#f0fdf4';
        }
    });
    window.showToast && showToast('Відмічено як виконується ✓', 'success');
};

async function _updateRecommendationStatus(signalId, updates) {
    const companyId = window.currentCompanyId;
    if (!companyId) return;
    try {
        const today = new Date().toISOString().split('T')[0];
        await db.doc(`companies/${companyId}/ai_recommendations/${today}_${signalId}`)
            .update({ ...updates, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    } catch {}
}

// ─────────────────────────────────────────
// HELPER — XSS escape
// ─────────────────────────────────────────
function _escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────
// ПУБЛІЧНЕ API
// ─────────────────────────────────────────
window.runAIDiagnostic = runAIDiagnostic;

// ─────────────────────────────────────────
// ПАТЧ: розширюємо renderOwnerDashboard — запускаємо діагностику після рендеру
// ─────────────────────────────────────────
(function _patchOwnerDashboard() {
    const _original = window.renderOwnerDashboard;
    if (typeof _original !== 'function') {
        // Якщо модуль 71 ще не завантажився — чекаємо
        let attempts = 0;
        const iv = setInterval(() => {
            if (typeof window.renderOwnerDashboard === 'function') {
                clearInterval(iv);
                _patchOwnerDashboard();
            } else if (++attempts > 50) clearInterval(iv);
        }, 100);
        return;
    }

    window.renderOwnerDashboard = function(targetEl) {
        _original(targetEl);
        // Запускаємо діагностику асинхронно — не блокуємо рендер дашборду
        setTimeout(() => runAIDiagnostic(), 0);
    };

    window.dbg && dbg('[DiagAgent] renderOwnerDashboard patched');
})();

window.dbg && dbg('[DiagAgent] Module 87 loaded');
