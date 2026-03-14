// =====================
    // DAILY SNAPSHOT — data for future AGI analysis
    // =====================
'use strict';
    async function saveDailySnapshot() {
        if (!currentCompany || !currentUser) return;
        const todayStr = getLocalDateStr();
        const key = `snapshot_${currentCompany}_${todayStr}`;
        if (localStorage.getItem(key)) return;
        
        // Only owner/manager saves snapshots
        if (currentUserData?.role !== 'owner' && currentUserData?.role !== 'admin') return;
        
        const activeTasks = tasks.filter(t => t.status !== 'done');
        const overdueTasks = activeTasks.filter(t => t.deadlineDate && t.deadlineDate < todayStr);
        // FIX BP: рахуємо по completedDate (string) як primary, completedAt як fallback
        const doneTodayTasks = tasks.filter(t => {
            if (t.status !== 'done') return false;
            if (t.completedDate) return t.completedDate === todayStr;
            if (t.completedAt) {
                const d = t.completedAt?.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                return getLocalDateStr(d) === todayStr;
            }
            return false;
        });
        
        // Per-user load
        const userLoads = users.map(u => ({
            uid: u.id,
            name: u.name || u.email,
            active: activeTasks.filter(t => t.assigneeId === u.id).length,
            overdue: overdueTasks.filter(t => t.assigneeId === u.id).length,
            doneToday: doneTodayTasks.filter(t => t.assigneeId === u.id).length
        }));
        
        // Per-function load
        const funcLoads = functions.map(f => ({
            name: f.name,
            active: activeTasks.filter(t => t.function === f.name).length,
            overdue: overdueTasks.filter(t => t.function === f.name).length
        }));
        
        // Process status
        const activeProc = processes.filter(p => p.status === 'active').length;
        const overdueProc = processes.filter(p => p.status === 'active' && p.deadline && p.deadline < todayStr).length;
        
        // SLA breaches
        const slaBreaches = processes.filter(p => {
            if (p.status !== 'active') return false;
            const tpl = processTemplates.find(t => t.id === p.templateId);
            if (!tpl?.steps) return false;
            const step = tpl.steps[p.currentStep || 0];
            // If step has SLA and task exists and is overdue
            return step?.slaMinutes && tasks.some(t => 
                t.processId === p.id && t.processStep === (p.currentStep || 0) && 
                t.status !== 'done' && t.status !== 'review' && t.deadlineDate && t.deadlineDate < todayStr
            );
        }).length;
        
        // ── Signals (для AI-агента та тижневого звіту) ──────────
        const ownerUid = currentUser.uid;
        const ownerTasks = activeTasks.filter(t => t.assigneeId === ownerUid);
        const ownerTaskRatio = activeTasks.length > 0
            ? ownerTasks.length / activeTasks.length
            : 0;

        // Функції з returnRate > 20%
        const functionsWithHighReturn = (() => {
            const funcReturnMap = {};
            tasks.forEach(t => {
                const fn = t.function;
                if (!fn) return;
                if (!funcReturnMap[fn]) funcReturnMap[fn] = { active: 0, returned: 0 };
                if (t.status !== 'done') funcReturnMap[fn].active++;
                if (t.reviewRejectedAt) funcReturnMap[fn].returned++;
            });
            return Object.entries(funcReturnMap)
                .filter(([, v]) => v.active >= 3 && (v.returned / v.active) > 0.2)
                .map(([name, v]) => ({
                    name,
                    returnRate: Math.round((v.returned / v.active) * 100),
                }));
        })();

        // Процеси-вузькі місця (стоять >24 год)
        const processBottlenecks = (() => {
            const now = Date.now();
            return processes
                .filter(p => {
                    if (p.status !== 'active') return false;
                    if (!p.updatedAt) return false;
                    const updMs = p.updatedAt?.toMillis
                        ? p.updatedAt.toMillis()
                        : new Date(p.updatedAt).getTime();
                    return (now - updMs) > 24 * 3600 * 1000;
                })
                .map(p => {
                    const tmpl = processTemplates.find(t => t.id === p.templateId);
                    const step = tmpl?.steps?.[p.currentStep || 0];
                    return {
                        processId: p.id,
                        processName: p.name || '',
                        stepFunction: step?.function || '',
                        currentStep: p.currentStep || 0,
                    };
                });
        })();

        // Юзери з нульовою активністю 3+ дні
        const threeDaysAgo = new Date(); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const threeDaysAgoStr = getLocalDateStr(threeDaysAgo);
        const usersWithZeroActivity = users
            .filter(u => u.role !== 'owner')
            .filter(u => {
                const lastDone = tasks
                    .filter(t => t.assigneeId === u.id && t.status === 'done' && t.completedDate)
                    .map(t => t.completedDate)
                    .sort()
                    .pop();
                return !lastDone || lastDone < threeDaysAgoStr;
            })
            .map(u => ({ uid: u.id, name: u.name || u.email }));

        // Зупинені процеси (ті самі що і bottlenecks — зберігаємо IDs для посилань)
        const stalledProcesses = processBottlenecks.map(p => p.processId);

        const signals = {
            ownerTaskRatio:           Math.round(ownerTaskRatio * 100) / 100,
            ownerTaskCount:           ownerTasks.length,
            overdueRatio:             activeTasks.length > 0
                ? Math.round((overdueTasks.length / activeTasks.length) * 100) / 100
                : 0,
            functionsWithHighReturn,
            processBottlenecks,
            usersWithZeroActivity,
            stalledProcesses,
            slaBreaches,
        };

        const snapshot = {
            date: todayStr,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            totals: {
                tasks: tasks.length,
                active: activeTasks.length,
                overdue: overdueTasks.length,
                doneToday: doneTodayTasks.length,
                users: users.length,
                functions: functions.length,
                activeProcesses: activeProc,
                overdueProcesses: overdueProc,
                slaBreaches: slaBreaches
            },
            userLoads,
            funcLoads,
            signals,          // ← НОВИЙ БЛОК: операційні сигнали для AI-агента
            createdBy: currentUser.uid
        };
        
        try {
            await db.collection('companies').doc(currentCompany)
                .collection('snapshots').doc(todayStr).set(snapshot);
            localStorage.setItem(key, '1');
            window.dbg&&dbg('[Snapshot] Daily snapshot saved for', todayStr);
        } catch (e) {
            console.warn('[Snapshot] Failed:', e.message);
        }
    }
