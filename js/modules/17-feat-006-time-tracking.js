// =====================
        // FEAT-006: TIME TRACKING
        // =====================
        let timeTrackerInterval = null;
        let timeTrackerStart = null;
        let timeTrackerTaskId = null;
        
        function toggleTimeTracker() {
            if (!editingId) return;
            
            if (timeTrackerInterval) {
                // СТОП
                stopTimeTracker();
            } else {
                // СТАРТ
                timeTrackerStart = Date.now();
                timeTrackerTaskId = editingId;
                const btn = document.getElementById('timeTrackBtn');
                btn.style.background = '#ef4444';
                btn.innerHTML = '<i data-lucide="square" class="icon icon-sm"></i> <span>Стоп</span>';
                refreshIcons();
                
                timeTrackerInterval = setInterval(() => {
                    if (!timeTrackerStart) return;
                    const elapsed = Math.floor((Date.now() - timeTrackerStart) / 1000);
                    const mins = Math.floor(elapsed / 60);
                    const secs = elapsed % 60;
                    document.getElementById('timeTrackActual').textContent = formatTrackedTime(getTotalTrackedMinutes() + mins) + ':' + String(secs).padStart(2, '0').slice(-2);
                }, 1000);
            }
        }
        
        function stopTimeTracker() {
            if (!timeTrackerStart || !timeTrackerTaskId) return;
            
            const elapsed = Math.round((Date.now() - timeTrackerStart) / 60000); // хвилини
            clearInterval(timeTrackerInterval);
            timeTrackerInterval = null;
            
            const btn = document.getElementById('timeTrackBtn');
            btn.style.background = '#22c55e';
            btn.innerHTML = '<i data-lucide="play" class="icon icon-sm"></i> <span data-i18n="startTimer">Старт</span>';
            refreshIcons();
            
            if (elapsed >= 1) {
                addTimeEntry(elapsed);
            }
            
            timeTrackerStart = null;
        }
        
        function addManualTime() {
            if (!editingId) return;
            const minutes = prompt(t('howManyMinutes'));
            if (minutes === null) return;
            const mins = parseInt(minutes);
            if (isNaN(mins) || mins <= 0) return;
            addTimeEntry(mins);
        }
        
        async function addTimeEntry(minutes) {
            const taskId = editingId; // copy to avoid race condition
            const task = tasks.find(t => t.id === taskId);
            if (!task || !taskId) return;
            
            const entry = {
                minutes: minutes,
                userId: currentUser.uid,
                userName: currentUserData?.name || currentUser.email,
                date: new Date().toISOString()
            };
            
            const timeLog = [...(task.timeLog || []), entry];
            
            try {
                await db.collection('companies').doc(currentCompany).collection('tasks').doc(taskId).update({
                    timeLog: timeLog
                });
                task.timeLog = timeLog;
                renderTimeTracking(task);
            } catch (e) {
                console.error('addTimeEntry error:', e);
                showToast(t('error') + ': ' + e.message, 'error');
            }
        }
        
        function getTotalTrackedMinutes() {
            const task = tasks.find(t => t.id === editingId);
            if (!task || !task.timeLog) return 0;
            return task.timeLog.reduce((sum, e) => sum + (e.minutes || 0), 0);
        }
        
        function formatTrackedTime(totalMinutes) {
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            return `${h}:${String(m).padStart(2, '0')}`;
        }
        
        function renderTimeTracking(task) {
            const section = document.getElementById('timeTrackingSection');
            if (!section) return;
            
            // Показуємо тільки при редагуванні
            section.style.display = editingId ? 'block' : 'none';
            
            // Запланований час
            const planned = task?.estimatedTime ? parseInt(task.estimatedTime) : 0;
            document.getElementById('timeTrackPlanned').textContent = planned > 0 
                ? formatTrackedTime(planned) : '—';
            
            // Фактичний час
            const total = task?.timeLog ? task.timeLog.reduce((s, e) => s + (e.minutes || 0), 0) : 0;
            const actualEl = document.getElementById('timeTrackActual');
            actualEl.textContent = formatTrackedTime(total);
            
            // Колір: зелений якщо < план, жовтий якщо ~, червоний якщо >
            if (planned > 0 && total > planned * 1.2) {
                actualEl.style.color = '#ef4444';
            } else if (planned > 0 && total > planned * 0.8) {
                actualEl.style.color = '#f59e0b';
            } else {
                actualEl.style.color = '#22c55e';
            }
            
            // Лог
            const logEl = document.getElementById('timeTrackLog');
            if (task?.timeLog && task.timeLog.length > 0) {
                logEl.innerHTML = task.timeLog.slice(-10).reverse().map(e => {
                    const date = new Date(e.date);
                    const dateStr = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
                    const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                    return `<div style="padding:2px 0;border-bottom:1px solid #f3f4f6;">${esc(e.userName)}: <strong>${esc(String(e.minutes || 0))} хв</strong> — ${esc(dateStr)} ${esc(timeStr)}</div>`;
                }).join('');
            } else {
                logEl.innerHTML = '';
            }
        }
