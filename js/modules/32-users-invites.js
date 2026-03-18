// =====================
        // USERS & INVITES
        // =====================
'use strict';

        // ---- WORKLOAD DASHBOARD ----
        window.renderWorkloadDashboard = function() {
            const container = document.getElementById('usersSubContent-workload');
            if (!container) return;
            const todayStr = getLocalDateStr(new Date());

            // --- розрахунок по кожному юзеру ---
            const rows = users.map(u => {
                const userTasks = tasks.filter(tk => tk.assigneeId === u.id);
                const active = userTasks.filter(tk => tk.status !== 'done');
                const done = userTasks.filter(tk => tk.status === 'done');
                const overdue = active.filter(tk => tk.deadlineDate && tk.deadlineDate < todayStr);
                const returned = userTasks.filter(tk => tk.reviewRejectedAt);
                const doneNoReturn = done.filter(tk => !tk.reviewRejectedAt).length;
                const autonomy = done.length > 0 ? Math.round(doneNoReturn / done.length * 100) : 0;

                const userRegular = regularTasks.filter(rt => {
                    const func = functions.find(f => f.name === rt.function);
                    return func?.assigneeIds?.includes(u.id);
                });
                let weeklyMin = 0;
                userRegular.forEach(rt => {
                    const start = rt.timeStart || rt.time || '';
                    const end = rt.timeEnd || '';
                    let dur = rt.estimatedTime || 60;
                    if (start && end) {
                        const [sh,sm] = start.split(':').map(Number);
                        const [eh,em] = end.split(':').map(Number);
                        dur = (eh*60+em)-(sh*60+sm);
                        if (dur <= 0) dur = 60;
                    }
                    let dpw = 1;
                    if (rt.period === 'daily') dpw = 5;
                    else if (rt.period === 'weekly' && rt.daysOfWeek) dpw = rt.daysOfWeek.length;
                    else if (rt.period === 'monthly') dpw = 0.25;
                    weeklyMin += dur * dpw;
                });
                const weeklyHrs = Math.round(weeklyMin / 60 * 10) / 10;
                const overloadFlag = weeklyHrs > 45 || overdue.length >= 3;
                const attentionFlag = !overloadFlag && (weeklyHrs > 35 || overdue.length >= 1);

                const userFuncs = functions.filter(f => f.assigneeIds?.includes(u.id));
                return { u, active, overdue, autonomy, weeklyHrs, overloadFlag, attentionFlag, userFuncs, returned };
            });

            // Сортування: перевантажені → увага → за кількістю активних
            rows.sort((a,b) => {
                if (b.overloadFlag !== a.overloadFlag) return b.overloadFlag - a.overloadFlag;
                if (b.attentionFlag !== a.attentionFlag) return b.attentionFlag - a.attentionFlag;
                return b.active.length - a.active.length;
            });

            // --- Summary cards ---
            const totalPeople = users.length;
            const overloadedCount = rows.filter(r => r.overloadFlag).length;
            const totalOverdue = rows.reduce((s,r) => s + r.overdue.length, 0);
            const avgAutonomy = rows.length > 0 ? Math.round(rows.reduce((s,r) => s + r.autonomy, 0) / rows.length) : 0;

            const summaryHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.75rem;margin-bottom:1.25rem;">
                ${[
                    { label: window.t('totalPeople'), val: totalPeople, color: '#0284c7', bg: '#f0f9ff' },
                    { label: window.t('overloadedPeople'), val: overloadedCount, color: overloadedCount > 0 ? '#ef4444' : '#16a34a', bg: overloadedCount > 0 ? '#fef2f2' : '#f0fdf4' },
                    { label: window.t('totalOverdue'), val: totalOverdue, color: totalOverdue > 0 ? '#ef4444' : '#16a34a', bg: totalOverdue > 0 ? '#fef2f2' : '#f0fdf4' },
                    { label: window.t('avgAutonomy'), val: avgAutonomy + '%', color: avgAutonomy >= 80 ? '#16a34a' : avgAutonomy >= 50 ? '#f59e0b' : '#ef4444', bg: '#f9fafb' },
                ].map(c => `<div style="background:${c.bg};border-radius:10px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.6rem;font-weight:700;color:${c.color};">${c.val}</div>
                    <div style="font-size:0.72rem;color:#6b7280;margin-top:0.2rem;">${c.label}</div>
                </div>`).join('')}
            </div>`;

            // --- Table ---
            const tableHTML = `
            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);overflow:hidden;margin-bottom:1.25rem;">
                <div style="padding:0.75rem 1rem;border-bottom:1px solid #f3f4f6;font-weight:600;font-size:0.95rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>${window.t('workloadTitle')}
                </div>
                <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
                    <thead>
                        <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                            <th style="padding:0.5rem 0.75rem;text-align:left;font-weight:600;color:#374151;">${window.t('employee') || 'Співробітник'}</th>
                            <th style="padding:0.5rem 0.75rem;text-align:left;font-weight:600;color:#374151;">${window.t('tabFunctions') || 'Функції'}</th>
                            <th style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:#374151;">${window.t('regularHoursWeek')}</th>
                            <th style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:#374151;">${window.t('activeTasksCount')}</th>
                            <th style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:#374151;">${window.t('overdueStatus')}</th>
                            <th style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:#374151;">${window.t('autonomyIndex')}</th>
                            <th style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:#374151;">${window.t('statusLabel') || 'Статус'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => {
                            const statusText = r.overloadFlag ? `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444;vertical-align:-1px;margin-right:3px;"></span>${window.t('workloadOverloaded')}` : r.attentionFlag ? `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f59e0b;vertical-align:-1px;margin-right:3px;"></span>${window.t('workloadAttention')}` : `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#16a34a;vertical-align:-1px;margin-right:3px;"></span>${window.t('workloadNorm')}`;
                            const hrsColor = r.weeklyHrs > 35 ? '#ef4444' : '#0284c7';
                            const autoColor = r.autonomy >= 80 ? '#16a34a' : r.autonomy >= 50 ? '#f59e0b' : '#ef4444';
                            return `<tr style="border-bottom:1px solid #f3f4f6;${r.overloadFlag ? 'background:#fff5f5;' : ''}">
                                <td style="padding:0.5rem 0.75rem;">
                                    <div style="font-weight:500;">${esc(r.u.name || r.u.email)}</div>
                                    <div style="font-size:0.7rem;color:#9ca3af;">${getRoleText(r.u.role)}</div>
                                </td>
                                <td style="padding:0.5rem 0.75rem;">
                                    <div style="display:flex;flex-wrap:wrap;gap:3px;">
                                        ${r.userFuncs.map(f => `<span style="font-size:0.65rem;background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:4px;">${esc(f.name)}</span>`).join('')}
                                    </div>
                                </td>
                                <td style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:${hrsColor};">${r.weeklyHrs}</td>
                                <td style="padding:0.5rem 0.75rem;text-align:center;">${r.active.length}</td>
                                <td style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:${r.overdue.length > 0 ? '#ef4444' : '#6b7280'};">${r.overdue.length}</td>
                                <td style="padding:0.5rem 0.75rem;text-align:center;font-weight:600;color:${autoColor};">${r.autonomy}%</td>
                                <td style="padding:0.5rem 0.75rem;text-align:center;font-size:0.8rem;">${statusText}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
                </div>
            </div>`;

            // --- Top-5 progress bars ---
            const top5 = [...rows].sort((a,b) => b.weeklyHrs - a.weeklyHrs).slice(0,5);
            const maxHrs = top5.length > 0 ? Math.max(...top5.map(r => r.weeklyHrs), 1) : 1;
            const top5HTML = `
            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;margin-bottom:1.25rem;">
                <div style="font-weight:600;font-size:0.95rem;margin-bottom:0.75rem;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>Топ-5 найбільш завантажених</div>
                ${top5.map(r => {
                    const pct = Math.round(r.weeklyHrs / maxHrs * 100);
                    const barColor = r.overloadFlag ? '#ef4444' : r.attentionFlag ? '#f59e0b' : '#22c55e';
                    return `<div style="margin-bottom:0.6rem;">
                        <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.2rem;">
                            <span style="font-weight:500;">${esc(r.u.name || r.u.email)}</span>
                            <span style="color:#6b7280;">${r.weeklyHrs} год/тижд + ${r.active.length} задач ${r.overloadFlag ? '⚠️' : ''}</span>
                        </div>
                        <div style="background:#f3f4f6;border-radius:4px;height:8px;">
                            <div style="background:${barColor};width:${pct}%;height:8px;border-radius:4px;transition:width 0.3s;"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;

            // --- Навантаження по функціях ---
            const funcStatsHTML = `
            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;font-size:0.95rem;margin-bottom:0.75rem;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Навантаження по функціях</div>
                ${functions.filter(f => f.status !== 'archived').map(f => {
                    const fTasks = tasks.filter(tk => tk.function === f.name);
                    const fActive = fTasks.filter(tk => tk.status !== 'done');
                    const fNew = fTasks.filter(tk => tk.status === 'new').length;
                    const fProgress = fTasks.filter(tk => tk.status === 'progress').length;
                    const fReview = fTasks.filter(tk => tk.status === 'review').length;
                    const fDone = fTasks.filter(tk => tk.status === 'done').length;
                    const assigneesCount = f.assigneeIds?.length || 0;
                    const fRegular = regularTasks.filter(rt => rt.function === f.name);
                    let fMin = 0;
                    fRegular.forEach(rt => {
                        let dur = rt.estimatedTime || 60;
                        const start = rt.timeStart || rt.time || '';
                        const end = rt.timeEnd || '';
                        if (start && end) {
                            const [sh,sm] = start.split(':').map(Number);
                            const [eh,em] = end.split(':').map(Number);
                            dur = (eh*60+em)-(sh*60+sm);
                            if (dur<=0) dur=60;
                        }
                        let dpw = 1;
                        if (rt.period==='daily') dpw=5;
                        else if (rt.period==='weekly' && rt.daysOfWeek) dpw=rt.daysOfWeek.length;
                        else if (rt.period==='monthly') dpw=0.25;
                        fMin += dur*dpw;
                    });
                    const fHrs = Math.round(fMin/60*10)/10;
                    const total = fNew+fProgress+fReview+fDone || 1;
                    return `<div style="padding:0.5rem 0;border-bottom:1px solid #f3f4f6;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;">
                        <div style="flex:1;min-width:120px;">
                            <span style="font-weight:600;font-size:0.85rem;">${esc(f.name)}</span>
                            <span style="font-size:0.72rem;color:#6b7280;margin-left:0.5rem;">${assigneesCount} ${window.t('people') || 'викон.'}</span>
                        </div>
                        <div style="font-size:0.78rem;color:#6b7280;">${fActive.length} активних · ${fHrs} год/тижд</div>
                        <div style="display:flex;gap:2px;min-width:120px;">
                            <div style="flex:${fNew};background:#eff6ff;border-radius:3px 0 0 3px;height:12px;" title="Нових: ${fNew}"></div>
                            <div style="flex:${fProgress};background:#fefce8;height:12px;" title="В роботі: ${fProgress}"></div>
                            <div style="flex:${fReview};background:#f3e8ff;height:12px;" title="На перевірці: ${fReview}"></div>
                            <div style="flex:${fDone};background:#dcfce7;border-radius:0 3px 3px 0;height:12px;" title="Виконано: ${fDone}"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;

            container.innerHTML = `<div style="padding-top:1rem;">${summaryHTML}${tableHTML}${top5HTML}${funcStatsHTML}</div>`;
            if (typeof refreshIcons === 'function') refreshIcons();
        };

        // ---- USERS HOWTO ----
        window.renderUsersHowto = function() {
            const container = document.getElementById('usersSubContent-howto');
            if (!container) return;
            container.innerHTML = _buildUsersHowto();
            if (typeof refreshIcons === 'function') refreshIcons();
        };

        function _buildUsersHowto() {
            return `<div style="padding-top:1rem;display:flex;flex-direction:column;gap:1rem;">

            <div style="background:linear-gradient(135deg,#1e3a5f,#0f2040);border-radius:14px;padding:1.25rem 1.5rem;color:white;">
                <div style="font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Картка співробітника</div>
                <div style="color:#93c5fd;font-size:0.88rem;line-height:1.5;">Це не просто контакт. Це повний зріз: що людина робить, як завантажена і наскільки самостійна.</div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Яку проблему вирішує</div>
                <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
                    <thead><tr style="background:#f9fafb;">
                        <th style="padding:0.5rem;text-align:left;color:#ef4444;border-bottom:2px solid #fecaca;">ПРОБЛЕМА</th>
                        <th style="padding:0.5rem;text-align:left;color:#f59e0b;border-bottom:2px solid #fde68a;">НАСЛІДОК</th>
                        <th style="padding:0.5rem;text-align:left;color:#16a34a;border-bottom:2px solid #bbf7d0;">РІШЕННЯ</th>
                    </tr></thead>
                    <tbody>
                        ${[
                            ['Не знають реальне навантаження','Хтось перевантажений, хтось пустує','Система рахує год/тижд і активні задачі по кожному'],
                            ['Не видно якість роботи людини','Хтось "виконує" але постійно повертають','Індекс автономності: % задач без повернення'],
                            ['Не знають кому делегувати','Власник усе тримає у себе','Дашборд навантаження — видно хто вільний прямо зараз'],
                            ['Людина не знає свої пріоритети','Робить другорядне, важливе відкладає','Мій день: всі задачі відсортовані за пріоритетом'],
                            ['При наймі не знають скільки часу є','Беруть людину без розуміння завантаження','Система показує вільні години/тиждень до перевантаження'],
                        ].map(([p,n,r]) => `<tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:0.5rem;color:#374151;">${p}</td>
                            <td style="padding:0.5rem;color:#6b7280;">${n}</td>
                            <td style="padding:0.5rem;color:#16a34a;font-weight:500;">${r}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Що показує картка</div>
                ${[
                    ['<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#16a34a;vertical-align:-1px;margin-right:4px;"></span>Функції', 'Ролі в компанії де людина є виконавцем. Звідси приходять регулярні завдання і кроки процесів.'],
                    ['<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Pipeline', 'Нових / В роботі / На перевірці / Виконано — стан задач прямо зараз.'],
                    ['<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Індекс автономності', '% задач виконаних без повернення керівником. 80%+ = можна делегувати складне. <50% = більше контролю.'],
                    ['<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Годин/тиждень', 'Скільки годин займають регулярні завдання. >35 = перевантажений, не давати нового.'],
                    ['<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444;vertical-align:-1px;margin-right:4px;"></span>Прострочені', 'Задачі де минув дедлайн. Сигнал: або завдань забагато, або людина не справляється.'],
                    ['<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f59e0b;vertical-align:-1px;margin-right:4px;"></span>Повернені', 'Скільки задач повернули на доопрацювання. Багато — проблема з якістю або розумінням завдань.'],
                ].map(([k,v]) => `<div style="display:flex;gap:0.75rem;padding:0.4rem 0;border-bottom:1px solid #f9fafb;">
                    <div style="min-width:160px;font-weight:500;font-size:0.82rem;">${k}</div>
                    <div style="font-size:0.82rem;color:#6b7280;">${v}</div>
                </div>`).join('')}
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Індекс автономності — як читати</div>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
                    <div style="background:#f0fdf4;border-radius:8px;padding:0.75rem;border-left:4px solid #16a34a;">
                        <div style="font-weight:600;color:#16a34a;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#16a34a;vertical-align:-1px;margin-right:4px;"></span>≥ 80% — Норма</div>
                        <div style="font-size:0.8rem;color:#374151;margin-top:0.25rem;">Людина працює самостійно. Можна делегувати складні завдання без детального контролю.</div>
                    </div>
                    <div style="background:#fffbeb;border-radius:8px;padding:0.75rem;border-left:4px solid #f59e0b;">
                        <div style="font-weight:600;color:#b45309;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f59e0b;vertical-align:-1px;margin-right:4px;"></span>50–79% — Увага</div>
                        <div style="font-size:0.8rem;color:#374151;margin-top:0.25rem;">Перевіряй виконання, уточнюй очікуваний результат. Є зони покращення.</div>
                    </div>
                    <div style="background:#fef2f2;border-radius:8px;padding:0.75rem;border-left:4px solid #ef4444;">
                        <div style="font-weight:600;color:#dc2626;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:-1px;margin-right:4px;"></span>&lt; 50% — Системні проблеми</div>
                        <div style="font-size:0.8rem;color:#374151;margin-top:0.25rem;">Або завдання ставляться нечітко, або людина не розуміє стандарт якості, або потрібне навчання.</div>
                    </div>
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Дашборд навантаження</div>
                <div style="background:#f0f9ff;border-radius:8px;padding:0.75rem;font-size:0.82rem;color:#374151;line-height:1.5;">
                    Вкладка <strong>"Навантаження"</strong> — загальна картина команди. Таблиця де видно кожну людину: скільки годин регулярної роботи, скільки активних задач, індекс автономності, статус (Норма / Увага / Перевантажений). Відразу видно де проблема — без нарад і дзвінків.
                </div>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Взаємозв'язки</div>
                <pre style="background:#f9fafb;border-radius:8px;padding:0.75rem;font-size:0.75rem;line-height:1.6;overflow-x:auto;white-space:pre-wrap;">СПІВРОБІТНИК
│
├──→ ФУНКЦІЇ — ролі в компанії, звідси регулярні завдання і кроки процесів
├──→ МІЙ ДЕНЬ — задачі на сьогодні: регулярні + поточні + прострочені
├──→ ЗАВДАННЯ — всі задачі де assigneeId = ця людина
├──→ TELEGRAM — нова задача → сповіщення, крок процесу → кнопки
├──→ КООРДИНАЦІЇ — фільтр задач по учасниках
├──→ ОСОБИСТА АНАЛІТИКА — динаміка продуктивності, виконані/прострочені
└──→ ПРАВА ДОСТУПУ — роль (Власник/Менеджер/Співробітник) = набір дозволів</pre>
            </div>

            <div style="background:white;border-radius:12px;box-shadow:var(--shadow);padding:1rem;">
                <div style="font-weight:600;margin-bottom:0.75rem;color:#374151;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-3px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Як правильно налаштувати команду</div>
                ${[
                    ['1','Система → Функції','Створи всі ролі компанії ПЕРЕД додаванням людей'],
                    ['2','Система → Співробітники → Запросити','Відправ запрошення на email'],
                    ['3','Після прийняття → картка людини','Відкрий → редагуй → вибери функції'],
                    ['4','Система → Функції','Для кожної функції додай регулярні завдання (кнопка repeat+ на картці)'],
                    ['5','Вкладка "Навантаження"','У всіх має бути статус "Норма"'],
                    ['6','Система → Інтеграції → Telegram','Скопіюй код → відправ боту /connect КОД'],
                ].map(([n,title,desc]) => `<div style="display:flex;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid #f9fafb;align-items:flex-start;">
                    <div style="min-width:24px;height:24px;background:#22c55e;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">${n}</div>
                    <div>
                        <div style="font-weight:500;font-size:0.82rem;">${title}</div>
                        <div style="font-size:0.78rem;color:#6b7280;">${desc}</div>
                    </div>
                </div>`).join('')}
                <div style="margin-top:1rem;">
                    <button class="btn btn-success" onclick="switchUsersSubTab('invite')">
                        <i data-lucide="user-plus" class="icon icon-sm"></i> Запросити співробітника
                    </button>
                </div>
            </div>

            </div>`;
        }

        function openInviteModal() {
            document.getElementById('inviteModal').style.display = 'block';
            document.getElementById('inviteForm').reset();
            document.getElementById('inviteLink').style.display = 'none';
        }

        async function sendInvite(e) {
            e.preventDefault();
            if (currentUserData?.role === 'employee') { showToast(window.t('noPermissionTask'), 'error'); return; }
            // BUG #3 fix: визначаємо активну форму (desktop або mobile)
            const emailDesktop = document.getElementById('inviteEmailDesktop');
            const emailMobile = document.getElementById('inviteEmailMobile');
            const roleDesktop = document.getElementById('inviteRoleDesktop');
            const roleMobile = document.getElementById('inviteRoleMobile');
            // Беремо з тієї форми яка видима і заповнена
            const activeEmail = (emailDesktop?.offsetParent !== null ? emailDesktop : emailMobile);
            const activeRole = (roleDesktop?.offsetParent !== null ? roleDesktop : roleMobile);
            const email = (activeEmail?.value || '').trim().toLowerCase();
            const role = activeRole?.value || 'employee';
            
            try {
                const inviteRef = await db.collection('invites').add({
                    email: email,
                    companyId: currentCompany,
                    role: role,
                    invitedBy: currentUser.uid,
                    accepted: false,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Унікальне посилання з ID інвайту
                const link = window.location.origin + window.location.pathname + '?invite=' + inviteRef.id;
                document.getElementById('inviteLinkText').value = link;
                document.getElementById('inviteLink').style.display = 'block';
                
                showAlertModal(window.t('inviteCreated'));
            } catch (e) {
                showAlertModal(window.t('error') + ': ' + e.message);
            }
        }

        function copyInviteLink() {
            const input = document.getElementById('inviteLinkText');
            input.select();
            document.execCommand('copy');
            showAlertModal(window.t('copied'));
        }

        async function deleteUser(id) {
            const u = users.find(x => x.id === id);
            if (u?.role === 'owner') { showAlertModal(window.t('cannotDeleteOwner')); return; }
            if (!await showConfirmModal(window.t('deleteConfirm'), { danger: true })) return;
            
            const base = db.collection('companies').doc(currentCompany);
            
            // Cascade cleanup (chunked batch для атомарності + Firestore limit 500)
            // ВАЖЛИВО: спочатку cascade, потім user.delete()
            // Якщо cascade впаде — юзер залишається, задачі не залишаться orphaned
            try {
                const base2 = db.collection('companies').doc(currentCompany);
                const allOps = []; // { ref, type: 'update'|'delete', data? }
                
                functions.forEach(f => {
                    if (f.assigneeIds?.includes(id) || f.headId === id) {
                        const upd = {};
                        if (f.assigneeIds?.includes(id)) { f.assigneeIds = f.assigneeIds.filter(uid => uid !== id); upd.assigneeIds = f.assigneeIds; }
                        if (f.headId === id) { f.headId = f.assigneeIds?.[0] || ''; upd.headId = f.headId; }
                        allOps.push({ type: 'update', ref: base2.collection('functions').doc(f.id), data: upd });
                    }
                });
                
                // Fallback assignee для задач видаленого юзера
                const fallbackAssignee = users.find(u => u.role === 'owner' && u.id !== id) 
                    || users.find(u => u.role === 'manager' && u.id !== id);
                const fallbackId = fallbackAssignee?.id || '';
                const fallbackName = fallbackAssignee?.name || fallbackAssignee?.email || '';
                
                tasks.forEach(tk => {
                    const upd = {}; let need = false;
                    if (tk.assigneeId === id) {
                        tk.assigneeId = fallbackId;
                        tk.assigneeName = fallbackName;
                        upd.assigneeId = fallbackId;
                        upd.assigneeName = fallbackName;
                        need = true;
                    }
                    ['coExecutorIds','observerIds','notifyOnComplete'].forEach(fld => {
                        if (tk[fld]?.includes(id)) { tk[fld] = tk[fld].filter(uid => uid !== id); upd[fld] = tk[fld]; need = true; }
                    });
                    if (need) allOps.push({ type: 'update', ref: base2.collection('tasks').doc(tk.id), data: upd });
                });
                
                // Chunked commits — Firestore limit 500 ops/batch
                const CHUNK = 450;
                for (let i = 0; i < allOps.length; i += CHUNK) {
                    const batch = db.batch();
                    allOps.slice(i, i + CHUNK).forEach(op => {
                        if (op.type === 'delete') batch.delete(op.ref);
                        else batch.update(op.ref, op.data);
                    });
                    try {
                    await batch.commit();
                    } catch(err) {
                        console.error('[Batch] commit failed:', err);
                        showToast && showToast('Помилка збереження. Спробуйте ще раз.', 'error');
                    }
                }
            } catch (e) {
                console.error('[deleteUser] cascade failed:', e);
                showToast('Помилка при очищенні задач: ' + e.message, 'error');
                return; // cascade впала — НЕ видаляємо юзера, дані цілі
            }
            
            // Видаляємо юзера тільки після успішного cascade
            await base.collection('users').doc(id).delete();
            
            const idx = users.findIndex(x => x.id === id);
            if (idx >= 0) users.splice(idx, 1);
            renderUsers();
            updateSelects();
        }

        function renderUsers() {
            const c = document.getElementById('usersContainer');
            if (users.length === 0) {
                c.innerHTML = `<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:3rem 1rem;">
                    <div style="margin-bottom:0.75rem;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                    <h3 style="margin-bottom:0.5rem;">${window.t('noUsers') || 'Немає користувачів'}</h3>
                    <p style="color:#6b7280;margin-bottom:1rem;">${window.t('inviteFirst') || 'Запросіть першого співробітника в команду'}</p>
                    <button class="btn btn-success" onclick="openInviteModal()">
                        <i data-lucide="user-plus" class="icon"></i> ${window.t('invite') || 'Запросити'}
                    </button>
                </div>`;
                if (typeof lucide !== 'undefined') refreshIcons();
                return;
            }
            
            const canEdit = (typeof hasPermission === 'function' ? hasPermission('changeRoles') : false) || currentUserData?.role === 'owner' || currentUserData?.role === 'manager';
            const canViewEmails = (typeof hasPermission === 'function') ? hasPermission('viewColleagueEmails') : (currentUserData?.role !== 'employee');
            const canViewTeam = (typeof hasPermission === 'function') ? hasPermission('viewTeamList') : true;
            const canEditCards = (typeof hasPermission === 'function') ? hasPermission('editUserCards') : canEdit;

            // Якщо немає дозволу бачити список — показуємо тільки себе
            const visibleUsers = canViewTeam ? users : users.filter(u => u.id === currentUser?.uid);
            const todayStr = getLocalDateStr(new Date());
            const shortDays = getDayNamesShort();
            const jsDayToIdx = {1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 0:6};

            c.innerHTML = visibleUsers.map(u => {
                const userFunctions = functions.filter(f => f.assigneeIds?.includes(u.id));
                const isOwner = u.role === 'owner';
                
                // Task stats
                const userTasks = tasks.filter(tk => tk.assigneeId === u.id);
                const activeTasks = userTasks.filter(tk => tk.status !== 'done');
                const doneTasks = userTasks.filter(tk => tk.status === 'done');
                const newTasks = userTasks.filter(tk => tk.status === 'new');
                const inProgress = userTasks.filter(tk => tk.status === 'progress');
                const onReview = userTasks.filter(tk => tk.status === 'review');
                const overdue = activeTasks.filter(tk => tk.deadlineDate && tk.deadlineDate < todayStr);
                const returned = userTasks.filter(tk => tk.reviewRejectedAt);
                
                // Autonomy index: % done without returns (from all done tasks)
                const doneWithoutReturn = doneTasks.filter(tk => !tk.reviewRejectedAt).length;
                const autonomyPct = doneTasks.length > 0 ? Math.round(doneWithoutReturn / doneTasks.length * 100) : 0;
                const autonomyColor = autonomyPct >= 80 ? '#16a34a' : autonomyPct >= 50 ? '#f59e0b' : '#ef4444';
                
                // Regular tasks & weekly hours
                const userRegular = regularTasks.filter(rt => {
                    const func = functions.find(f => f.name === rt.function);
                    return func?.assigneeIds?.includes(u.id);
                });
                let weeklyMin = 0;
                userRegular.forEach(rt => {
                    const start = rt.timeStart || rt.time || '';
                    const end = rt.timeEnd || '';
                    let dur = rt.estimatedTime || 60;
                    if (start && end) {
                        const [sh,sm] = start.split(':').map(Number);
                        const [eh,em] = end.split(':').map(Number);
                        dur = (eh*60+em) - (sh*60+sm);
                        if (dur <= 0) dur = 60;
                    }
                    let dpw = 1;
                    if (rt.period === 'daily') dpw = 5;
                    else if (rt.period === 'weekly' && rt.daysOfWeek) dpw = rt.daysOfWeek.length;
                    else if (rt.period === 'monthly') dpw = 0.25;
                    weeklyMin += dur * dpw;
                });
                const weeklyHrs = Math.round(weeklyMin / 60 * 10) / 10;
                const overloadFlag = weeklyHrs > 35;
                
                // Delegation pipeline
                const pipelineHTML = `
                <div style="display:flex;gap:2px;align-items:center;margin:0.5rem 0;">
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#eff6ff;border-radius:6px 0 0 6px;">
                        <div style="font-size:1.1rem;font-weight:700;color:#2563eb;">${newTasks.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${window.t('statusNew')}</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#fefce8;">
                        <div style="font-size:1.1rem;font-weight:700;color:#ca8a04;">${inProgress.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${window.t('inProgressStatus')}</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#f3e8ff;">
                        <div style="font-size:1.1rem;font-weight:700;color:#9333ea;">${onReview.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${window.t('statusOnReview')}</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:0.3rem;background:#dcfce7;border-radius:0 6px 6px 0;">
                        <div style="font-size:1.1rem;font-weight:700;color:#16a34a;">${doneTasks.length}</div>
                        <div style="font-size:0.65rem;color:#6b7280;">${window.t('statusDone')}</div>
                    </div>
                </div>`;
                
                // Expanded detail panel
                const detailHTML = `
                <div id="userDetail_${u.id}" style="display:none;margin-top:0.5rem;border-top:1px solid #e5e7eb;padding-top:0.75rem;">
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">
                        <div style="background:#f0fdf4;border-radius:8px;padding:0.5rem;text-align:center;">
                            <div style="font-size:0.7rem;color:#6b7280;">${window.t('autonomyIndex')}</div>
                            <div style="font-size:1.3rem;font-weight:700;color:${autonomyColor};">${autonomyPct}%</div>
                        </div>
                        <div style="background:${overloadFlag ? '#fef2f2' : '#f0f9ff'};border-radius:8px;padding:0.5rem;text-align:center;">
                            <div style="font-size:0.7rem;color:#6b7280;">${window.t('hoursPerWeek')}</div>
                            <div style="font-size:1.3rem;font-weight:700;color:${overloadFlag ? '#ef4444' : '#0284c7'};">${weeklyHrs}</div>
                        </div>
                    </div>
                    
                    ${overdue.length > 0 ? `
                    <div style="background:#fef2f2;border-radius:8px;padding:0.5rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.8rem;font-weight:600;color:#dc2626;"><i data-lucide="alert-triangle" class="icon icon-sm"></i> ${window.t('overdueStatus')} (${overdue.length})</div>
                        ${overdue.slice(0,3).map(t => `<div style="font-size:0.78rem;color:#374151;padding:0.2rem 0;">&bull; ${esc(t.title)} <span style="color:#ef4444;">${t.deadlineDate || ''}</span></div>`).join('')}
                        ${overdue.length > 3 ? `<div style="font-size:0.72rem;color:#9ca3af;">+${overdue.length - 3} ${window.t('more')}...</div>` : ''}
                    </div>` : ''}
                    
                    ${returned.length > 0 ? `
                    <div style="background:#fffbeb;border-radius:8px;padding:0.5rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.8rem;font-weight:600;color:#b45309;"><i data-lucide="rotate-ccw" class="icon icon-sm"></i> ${window.t('returnedFromReview')} (${returned.length})</div>
                    </div>` : ''}
                    
                    ${userRegular.length > 0 ? `
                    <div style="margin-bottom:0.5rem;">
                        <div style="font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:0.4rem;">
                            <i data-lucide="repeat" class="icon icon-sm"></i> ${window.t('tabRegular')} (${userRegular.length})
                        </div>
                        ${userRegular.map(rt => {
                            const status = getRegularTaskStatus(rt);
                            const start = rt.timeStart || rt.time || '—';
                            const end = rt.timeEnd || '';
                            const timeStr = end ? start + '–' + end : start;
                            let scheduleStr = '';
                            if (rt.period === 'daily') {
                                scheduleStr = '';
                            } else if (rt.period === 'weekly' && rt.daysOfWeek) {
                                scheduleStr = rt.daysOfWeek
                                    .map(d => parseInt(d))
                                    .sort((a,b) => (jsDayToIdx[a]??7) - (jsDayToIdx[b]??7))
                                    .map(d => `<span style="display:inline-block;min-width:16px;height:16px;line-height:16px;text-align:center;border-radius:50%;font-size:0.58rem;font-weight:700;background:#dcfce7;color:#16a34a;">${shortDays[jsDayToIdx[d]] || d}</span>`)
                                    .join('');
                            } else if (rt.period === 'monthly') {
                                scheduleStr = `<span style="font-size:0.62rem;background:#e0e7ff;color:#4338ca;padding:0 4px;border-radius:3px;line-height:16px;">${rt.dayOfMonth || '1'}/${window.t('monthShort')}</span>`;
                            }
                            return `
                            <div style="display:flex;align-items:center;gap:0.3rem;padding:0.3rem 0.5rem;margin-bottom:0.15rem;background:#f9fafb;border-radius:6px;font-size:0.78rem;cursor:pointer;" onclick="openRegularTaskModal('${escId(rt.id)}')">
                                <span style="width:6px;height:6px;border-radius:50%;background:${status.color};flex-shrink:0;"></span>
                                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;">${esc(rt.title)}</span>
                                ${scheduleStr ? `<span style="display:flex;gap:1px;flex-shrink:0;">${scheduleStr}</span>` : ''}
                                <span style="color:#9ca3af;font-size:0.68rem;white-space:nowrap;flex-shrink:0;">${timeStr}</span>
                            </div>`;
                        }).join('')}
                    </div>` : ''}
                    
                    ${userFunctions.length > 0 ? `
                    <div>
                        <div style="font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:0.3rem;">
                            <i data-lucide="settings" class="icon icon-sm"></i> ${window.t('tabFunctions')}
                        </div>
                        ${userFunctions.map(f => {
                            const fTasks = tasks.filter(tk => tk.function === f.name && tk.assigneeId === u.id);
                            const fActive = fTasks.filter(tk => tk.status !== 'done').length;
                            const fDone = fTasks.filter(tk => tk.status === 'done').length;
                            return `<div style="display:flex;justify-content:space-between;padding:0.25rem 0.5rem;font-size:0.8rem;">
                                <span style="font-weight:500;">${esc(f.name)}</span>
                                <span style="color:#6b7280;">${fActive} ${window.t('active')} / ${fDone} ${window.t('doneLabel')}</span>
                            </div>`;
                        }).join('')}
                    </div>` : ''}
                </div>`;

                return `
                <div class="user-card" style="cursor:pointer;" onclick="toggleUserDetail('${u.id}', event)">
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;">
                        <div style="flex:1;">
                            <div class="user-name" style="margin-bottom:2px;">${esc(u.name || u.email)}</div>
                            <div style="font-size:0.75rem;color:#6b7280;">${canViewEmails ? esc(u.email) : '●●●@●●●●●●'}${u.position ? ' · ' + esc(u.position) : ''}</div>
                        </div>
                        <span class="role-badge ${u.role}" style="flex-shrink:0;">${getRoleText(u.role)}</span>
                    </div>
                    ${userFunctions.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:0.4rem;">${userFunctions.map(f => `<span style="font-size:0.65rem;background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:4px;">${esc(f.name)}</span>`).join('')}</div>` : ''}
                    <div style="display:flex;gap:2px;margin-bottom:0.4rem;">
                        <div style="flex:1;text-align:center;padding:2px 0;background:#eff6ff;border-radius:4px 0 0 4px;font-size:0.78rem;font-weight:600;color:#2563eb;" title="${window.t('statusNew')}">${newTasks.length}</div>
                        <div style="flex:1;text-align:center;padding:2px 0;background:#fefce8;font-size:0.78rem;font-weight:600;color:#ca8a04;" title="${window.t('inProgressStatus')}">${inProgress.length}</div>
                        <div style="flex:1;text-align:center;padding:2px 0;background:#f3e8ff;font-size:0.78rem;font-weight:600;color:#9333ea;" title="${window.t('statusOnReview')}">${onReview.length}</div>
                        <div style="flex:1;text-align:center;padding:2px 0;background:#dcfce7;border-radius:0 4px 4px 0;font-size:0.78rem;font-weight:600;color:#16a34a;" title="${window.t('statusDone')}">${doneTasks.length}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;gap:0.6rem;font-size:0.75rem;color:#6b7280;align-items:center;">
                            <span style="font-weight:600;color:${autonomyColor};">${autonomyPct}%</span>
                            <span>${weeklyHrs} ${window.t('hoursPerWeek')}</span>
                            ${overdue.length > 0 ? `<span style="color:#ef4444;font-weight:600;"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>${overdue.length}</span>` : ''}
                            ${returned.length > 0 ? `<span style="color:#f59e0b;"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>${returned.length}</span>` : ''}
                        </div>
                        <div style="display:flex;gap:0.25rem;align-items:center;" onclick="event.stopPropagation();">
                            ${canEditCards && !isOwner ? `<button class="btn btn-small" onclick="openUserPermissionsModal('${u.id}')" title="Дозволи" style="background:#f0f9ff;color:#0369a1;"><i data-lucide="key" class="icon icon-sm"></i></button>` : ''}
                            ${canEditCards && !isOwner ? `<button class="btn btn-small" onclick="openUserModal('${u.id}')" title="${window.t('edit')}"><i data-lucide="pencil" class="icon icon-sm"></i></button>` : ''}
                            ${canEdit && !isOwner ? `<button class="btn btn-small btn-danger" onclick="deleteUser('${u.id}')" title="${window.t('delete')}"><i data-lucide="trash-2" class="icon icon-sm"></i></button>` : ''}
                            <i data-lucide="chevron-down" class="icon icon-sm" style="color:#d1d5db;" id="userToggle_${u.id}"></i>
                        </div>
                    </div>
                    ${detailHTML}
                </div>
            `}).join('');
            refreshIcons();
        }
        
        function toggleUserDetail(userId, event) {
            if (event.target.closest('button') || event.target.closest('a')) return;
            const section = document.getElementById('userDetail_' + userId);
            const toggle = document.getElementById('userToggle_' + userId);
            if (!section) return;
            const isOpen = section.style.display !== 'none';
            section.style.display = isOpen ? 'none' : 'block';
            if (toggle) {
                toggle.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-up');
                refreshIcons();
            }
        }
        
        let editingUserId = null;
        
        function openUserModal(userId = null) {
            editingUserId = userId;
            const modal = document.getElementById('userModal');

            // Приховуємо/показуємо опцію admin залежно від ролі поточного юзера
            const adminOpt = document.querySelector('#userRole option[value="admin"]');
            if (adminOpt) adminOpt.style.display = currentUserData?.role === 'owner' ? '' : 'none';
            
            // Заповнюємо список функцій
            const userFunctionsDiv = document.getElementById('userFunctions');
            userFunctionsDiv.innerHTML = functions.map(f => `
                <label class="assignee-checkbox">
                    <input type="checkbox" value="${f.id}" data-fname="${esc(f.name)}">
                    ${esc(f.name)}
                </label>
            `).join('') || `<p style="color:#7f8c8d;">${window.t('noFunctions')}</p>`;
            
            if (userId) {
                const user = users.find(u => u.id === userId);
                if (user) {
                    document.getElementById('userName').value = user.name || '';
                    document.getElementById('userEmail').value = user.email || '';
                    document.getElementById('userRole').value = user.role || 'employee';
                    document.getElementById('userPosition').value = user.position || '';
                    document.getElementById('userModalTitle').textContent = window.t('editEmployee');
                    
                    // Відмічаємо функції користувача
                    const userFunctions = functions.filter(f => f.assigneeIds?.includes(userId));
                    userFunctions.forEach(f => {
                        const checkbox = userFunctionsDiv.querySelector(`input[value="${f.id}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            } else {
                document.getElementById('userForm').reset();
                document.getElementById('userModalTitle').textContent = window.t('addEmployee');
            }
            
            modal.style.display = 'block';
        }
        
        async function saveUser(e) {
            e.preventDefault();
            
            if (!editingUserId) return;
            
            const name = document.getElementById('userName').value.trim();
            const role = document.getElementById('userRole').value;
            const position = document.getElementById('userPosition').value.trim();

            // Тільки owner може призначати admin
            if (role === 'admin' && currentUserData?.role !== 'owner') {
                showAlertModal(window.t('onlyOwnerAdmin'));
                return;
            }
            
            try {
                // Оновлюємо дані користувача
                await db.collection('companies').doc(currentCompany).collection('users').doc(editingUserId).update({
                    name: name,
                    role: role,
                    position: position
                });
                
                // Оновлюємо функції
                const selectedFunctions = Array.from(document.querySelectorAll('#userFunctions input:checked')).map(cb => cb.value);
                
                // Для кожної функції перевіряємо чи потрібно додати/видалити користувача
                for (const func of functions) {
                    const funcRef = db.collection('companies').doc(currentCompany).collection('functions').doc(func.id);
                    const isSelected = selectedFunctions.includes(func.id);
                    const isCurrentlyAssigned = func.assigneeIds?.includes(editingUserId);
                    
                    if (isSelected && !isCurrentlyAssigned) {
                        await funcRef.update({
                            assigneeIds: firebase.firestore.FieldValue.arrayUnion(editingUserId)
                        });
                    } else if (!isSelected && isCurrentlyAssigned) {
                        await funcRef.update({
                            assigneeIds: firebase.firestore.FieldValue.arrayRemove(editingUserId)
                        });
                    }
                }
                
                closeModal('userModal');
                
                // Локальне оновлення користувача
                const userIdx = users.findIndex(u => u.id === editingUserId);
                if (userIdx >= 0) {
                    users[userIdx] = { 
                        ...users[userIdx], 
                        name: document.getElementById('userName').value.trim(),
                        role: document.getElementById('userRole').value,
                        position: document.getElementById('userPosition').value.trim()
                    };
                }
                
                // Локальне оновлення функцій (використовуємо selectedFunctions з рядка вище)
                functions.forEach(func => {
                    const isSelected = selectedFunctions.includes(func.id);
                    const isCurrentlyAssigned = func.assigneeIds?.includes(editingUserId);
                    if (isSelected && !isCurrentlyAssigned) {
                        func.assigneeIds = [...(func.assigneeIds || []), editingUserId];
                    } else if (!isSelected && isCurrentlyAssigned) {
                        func.assigneeIds = (func.assigneeIds || []).filter(id => id !== editingUserId);
                    }
                });
                
                renderUsers();
                renderFunctions();
                updateSelects();
            } catch (e) {
                showAlertModal(window.t('error') + ': ' + e.message);
            }
        }

        // ---- USER PERMISSIONS MODAL ----
        window.openUserPermissionsModal = function(userId) {
            const u = users.find(x => x.id === userId);
            if (!u) return;

            const PERMISSION_GROUPS = [
                { group: window.t('permStat2'), items: [
                    { key: 'viewStats',        label: 'Переглядати статистику' },
                    { key: 'viewAllMetrics',   label: window.t('permViewAllMetrics') },
                    { key: 'editMetrics',      label: 'Редагувати метрики' },
                    { key: 'deleteMetricRows', label: 'Видаляти рядки' },
                ]},
                { group: window.t('permTsk2'), items: [
                    { key: 'viewAllTasks',  label: window.t('permViewAllTasks2') },
                    { key: 'assignTasks',   label: window.t('permAssignTasks') },
                    { key: 'editAnyTask',   label: 'Редагувати будь-яке завдання' },
                    { key: 'deleteAnyTask', label: 'Видаляти завдання' },
                ]},
                { group: window.t('permCtrl2'), items: [
                    { key: 'viewControl',    label: 'Панель контролю' },
                    { key: 'viewAiAnalysis', label: window.t('aiAnalysis2') },
                ]},
                { group: window.t('teamWord'), items: [
                    { key: 'inviteUsers', label: window.t('permInviteStaff') },
                    { key: 'changeRoles', label: window.t('permChangeRoles') },
                ]},
            ];

            const custom = u.customPermissions || {};
            const rolePerms = (typeof DEFAULT_ROLE_PERMISSIONS !== 'undefined' && DEFAULT_ROLE_PERMISSIONS[u.role]) || {};

            let html = `<div style="max-height:70vh;overflow-y:auto;padding:0.25rem;">
                <p style="font-size:0.82rem;color:#6b7280;margin:0 0 1rem;">
                    Базові права від ролі <strong>${u.role}</strong>. Перемикачі нижче — індивідуальні override.
                </p>`;

            PERMISSION_GROUPS.forEach(group => {
                html += `<div style="margin-bottom:1rem;">
                    <div style="font-size:0.75rem;font-weight:700;color:#16a34a;text-transform:uppercase;padding:0.4rem 0;border-bottom:1px solid #f0fdf4;margin-bottom:0.5rem;">${group.group}</div>`;
                group.items.forEach(item => {
                    const roleDefault = !!rolePerms[item.key];
                    const override = custom[item.key];
                    const effective = override !== undefined ? override : roleDefault;
                    html += `<label style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0.75rem;border-radius:8px;cursor:pointer;background:${effective ? '#f0fdf4' : '#f9fafb'};margin-bottom:0.3rem;border:1px solid ${effective ? '#bbf7d0' : '#e5e7eb'};">
                        <span style="font-size:0.83rem;color:#374151;">${item.label}
                            <span style="font-size:0.72rem;color:#9ca3af;margin-left:0.4rem;">(роль: ${roleDefault ? '✓' : '✗'})</span>
                        </span>
                        <input type="checkbox" data-perm="${item.key}" ${effective ? 'checked' : ''} 
                            onchange="updateUserPermOverride('${userId}','${item.key}',this.checked)"
                            style="width:18px;height:18px;accent-color:#22c55e;cursor:pointer;">
                    </label>`;
                });
                html += '</div>';
            });
            html += '</div>';

            const modal = document.getElementById('userPermissionsModal');
            const body = document.getElementById('userPermissionsModalBody');
            const title = document.getElementById('userPermissionsModalTitle');
            if (title) title.textContent = `Дозволи: ${u.name || u.email}`;
            if (body) body.innerHTML = html;
            if (modal) { modal.style.display = 'flex'; }
            if (typeof lucide !== 'undefined') refreshIcons();
        };

        window.updateUserPermOverride = async function(userId, key, value) {
            if (!currentCompany) return;
            try {
                await db.collection('companies').doc(currentCompany)
                    .collection('users').doc(userId)
                    .set({ customPermissions: { [key]: value } }, { merge: true });
                // Оновлюємо локальний стейт
                const u = users.find(x => x.id === userId);
                if (u) {
                    if (!u.customPermissions) u.customPermissions = {};
                    u.customPermissions[key] = value;
                }
                showToast(window.t('saved2'), 'success');
            } catch(e) {
                showToast(window.t('errPfx2') + e.message, 'error');
            }
        };
