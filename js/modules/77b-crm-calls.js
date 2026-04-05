// ============================================================
// js/modules/77b-crm-calls.js — CRM лог дзвінків
//
// Flow:
//   1. crmStartCall(dealId, phone, clientName) — ініціює дзвінок
//      → tel: link (відкриває телефон) + показує форму логу
//   2. Юзер заповнює: результат, тривалість, нотатка
//   3. Зберігається в history угоди (type: 'call')
//      + оновлюється lastCallAt на угоді
//   4. Вкладка Активності показує дзвінки з іконками
// ============================================================

// Стан поточного дзвінка
window._crmActiveCall = null;

window.crmStartCall = function (dealId, phone, clientName) {
    if (!dealId || !phone) return;

    // FIX: <a> + click() замість window.location.href — не перезавантажує SPA в Safari
    const telLink = document.createElement('a');
    const _cleanPhone = String(phone).replace(/[^\d+]/g, '');
    telLink.href = `tel:${_cleanPhone}`;
    telLink.style.display = 'none';
    document.body.appendChild(telLink);
    telLink.click();
    setTimeout(() => telLink.remove(), 500);

    // Зберігаємо стан і показуємо форму логу через 1.5с
    window._crmActiveCall = {
        dealId,
        phone,
        clientName,
        startTime: Date.now(),
    };

    setTimeout(() => _crmShowCallLogModal(), 1500);
};

// Дефолтна дата +2 дні через локальну timezone (не UTC)
function _crmCallDefaultDate() {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function _crmShowCallLogModal() {
    const existing = document.getElementById('crmCallLogModal');
    if (existing) existing.remove();

    const call = window._crmActiveCall;
    if (!call) return;

    const modal = document.createElement('div');
    modal.id = 'crmCallLogModal';
    // FIX: Зберігаємо dealId в data-атрибуті (захист від race condition)
    modal.dataset.dealId = call.dealId;
    modal.dataset.phone = call.phone || '';
    modal.dataset.clientName = call.clientName || '';
    modal.dataset.startTime = call.startTime;
    modal.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10060;
        display:flex;align-items:flex-end;justify-content:center;padding:0 0 env(safe-area-inset-bottom,0);`;

    // Таймер дзвінка
    let elapsed = 0;
    const startTs = call.startTime;

    modal.innerHTML = `
    <div style="background:white;border-radius:18px 18px 0 0;width:100%;max-width:480px;
        padding:1.25rem;padding-bottom:calc(1.25rem + env(safe-area-inset-bottom, 0px));
        box-shadow:0 -8px 40px rgba(0,0,0,0.2);">

        <!-- Хедер -->
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
            <div style="width:44px;height:44px;background:#f0fdf4;border-radius:50%;
                display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div style="flex:1;">
                <div style="font-weight:700;font-size:0.92rem;color:#111827;">${_escStr(call.clientName || window.t('crmClient2'))}</div>
                <div style="font-size:0.78rem;color:#6b7280;">${_escStr(call.phone)}</div>
                ${(()=>{
                    const deal = window.crm?.deals?.find(d=>d.id===call.dealId);
                    const stages = window.crm?.pipeline?.stages||[];
                    const stageObj = deal ? stages.find(s=>s.id===deal.stage) : null;
                    return stageObj
                        ? '<span style="font-size:0.7rem;font-weight:600;padding:1px 7px;border-radius:8px;background:'+stageObj.color+'18;color:'+stageObj.color+';border:1px solid '+stageObj.color+'33;margin-top:2px;display:inline-block;">'+_escStr(stageObj.label)+'</span>'
                        : '';
                })()}
            </div>
            <div id="crmCallTimer" style="font-size:0.82rem;color:#22c55e;font-weight:700;font-family:monospace;">0:00</div>
        </div>

        <!-- Результат -->
        <div style="margin-bottom:0.75rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.4rem;">${window.t('callResult')||'Результат дзвінка'}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;">
                ${[
                    ['answered',  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Взяв трубку',   '#f0fdf4', '#16a34a', '#bbf7d0'],
                    ['missed',    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Не відповів',    '#fef2f2', '#ef4444', '#fecaca'],
                    ['busy',      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Зайнято',        '#fff7ed', '#ea580c', '#fed7aa'],
                    ['callback',  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Передзвонити',   '#eff6ff', '#2563eb', '#bfdbfe'],
                ].map(([val, label, bg, color, border]) => `
                <button onclick="crmSelectCallResult('${val}')" id="crmCallResult_${val}"
                    style="padding:0.5rem;background:${bg};color:${color};border:1px solid ${border};
                    border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:600;text-align:center;
                    transition:all 0.1s;">
                    ${label}
                </button>`).join('')}
            </div>
        </div>

        <!-- Тривалість (ручна, якщо не відстежили) -->
        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
            <div style="flex:1;">
                <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.3rem;">${window.t('callDuration')||'Тривалість (хв)'}</div>
                <input id="crmCallDuration" type="number" min="0" max="180" placeholder="0"
                    style="width:100%;padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;">
            </div>
            <div style="flex:2;">
                <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.3rem;">Наступний контакт</div>
                <div style="display:flex;gap:0.35rem;">
                    <input id="crmCallNextDate" type="date"
                        value="${_crmCallDefaultDate()}"
                        style="flex:1;padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;min-width:0;">
                    <input id="crmCallNextTime" type="time"
                        value="10:00"
                        style="width:80px;padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;font-size:0.82rem;">
                </div>
            </div>
        </div>

        <!-- Нотатка -->
        <div style="margin-bottom:0.75rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.3rem;">${window.t('callNote')||'Нотатка по дзвінку'}</div>
            <textarea id="crmCallNote" rows="2" placeholder="Що обговорили, домовились..."
                style="width:100%;padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:7px;
                font-size:0.82rem;font-family:inherit;resize:none;box-sizing:border-box;"></textarea>
        </div>

        <!-- Прикріпити файл -->
        <div style="margin-bottom:1rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.3rem;">Звіт або файл</div>
            <div style="display:flex;gap:0.4rem;align-items:center;">
                <input type="file" id="crmCallFile" accept="*/*" style="display:none;"
                    onchange="window._crmCallFileSelected(this)">
                <button onclick="document.getElementById('crmCallFile').click()"
                    style="padding:0.4rem 0.6rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;
                    border-radius:7px;cursor:pointer;font-size:0.75rem;font-weight:600;display:flex;align-items:center;gap:0.3rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    Прикріпити файл
                </button>
                <div id="crmCallFileName" style="flex:1;font-size:0.75rem;color:#6b7280;"></div>
            </div>
        </div>

        <!-- Кнопки -->
        <div style="display:flex;gap:0.5rem;">
            <button onclick="if(document.getElementById('crmCallNote')?.value.trim()||window._crmSelectedCallResult!=='answered'){if(!confirm('Скасувати запис дзвінка?'))return;}document.getElementById('crmCallLogModal').remove();window._crmActiveCall=null;"
                style="flex:1;padding:0.6rem;background:#f4f5f7;border:1px solid #e8eaed;
                border-radius:8px;cursor:pointer;font-size:0.82rem;color:#374151;">
                Скасувати
            </button>
            <button onclick="crmSaveCallLog()"
                style="flex:2;padding:0.6rem;background:#22c55e;color:white;border:none;
                border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:700;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Зберегти дзвінок
            </button>
        </div>
    </div>`;

    document.body.appendChild(modal);

    // FIX: MutationObserver замість 'remove' event (DOM .remove() не fireвить custom events)
    const timerEl = document.getElementById('crmCallTimer');
    const timerInterval = setInterval(() => {
        if (!document.getElementById('crmCallLogModal')) {
            clearInterval(timerInterval); // modal видалено — зупиняємо timer
            return;
        }
        const sec = Math.floor((Date.now() - startTs) / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        if (timerEl) timerEl.textContent = `${m}:${String(s).padStart(2,'0')}`;
    }, 1000);

    // Автовибір "answered" за замовчуванням
    setTimeout(() => crmSelectCallResult('answered'), 100);
};

window._crmSelectedCallResult = 'answered';
window.crmSelectCallResult = function (val) {
    window._crmSelectedCallResult = val;
    ['answered','missed','busy','callback'].forEach(r => {
        const btn = document.getElementById(`crmCallResult_${r}`);
        if (!btn) return;
        btn.style.outline = r === val ? '2px solid currentColor' : 'none';
        btn.style.fontWeight = r === val ? '700' : '600';
        btn.style.transform = r === val ? 'scale(1.02)' : 'scale(1)';
    });
};

window.crmSaveCallLog = async function () {
    // FIX: Читаємо dealId з модалки (захист від race condition)
    const modal = document.getElementById('crmCallLogModal');
    if (!modal) return;

    const dealId = modal.dataset.dealId;
    const phone = modal.dataset.phone || '';
    const clientName = modal.dataset.clientName || '';
    if (!dealId) return;

    const result   = window._crmSelectedCallResult || 'answered';
    const duration = parseInt(document.getElementById('crmCallDuration')?.value || '0') || 0;
    const note     = document.getElementById('crmCallNote')?.value.trim() || '';
    const nextDate = document.getElementById('crmCallNextDate')?.value || '';
    const nextTime = document.getElementById('crmCallNextTime')?.value || '';

    const resultLabels = {
        answered: window.t('crmPickd'),
        missed:   window.t('noAnswerCall'),
        busy:     'Зайнято',
        callback: 'Передзвонити',
    };

    const saveBtn = document.querySelector('#crmCallLogModal button:last-child');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Збереження...'; }

    try {
        const compRef = window.companyRef();
        if (!compRef) throw new Error('companyRef не готовий');
        const dealCol = window.DB_COLS?.CRM_DEALS || 'crm_deals';
        const ref     = compRef.collection(dealCol).doc(dealId);
        const now     = firebase.firestore.FieldValue.serverTimestamp();

        // Завантажуємо файл якщо є
        let fileData = null;
        try {
            fileData = await _crmUploadCallFile(dealId);
            if (fileData && saveBtn) {
                saveBtn.textContent = 'Збереження запису...';
            }
        } catch (fileErr) {
            if (window.showToast) showToast('⚠️ Файл не завантажено: ' + fileErr.message, 'warning');
            // Продовжуємо без файлу
        }

        // Лог в history
        const historyData = {
            type:     'call',
            result:   result,
            text:     resultLabels[result] + (note ? ': ' + note : ''),
            phone:    phone,
            duration: duration,
            note:     note,
            by:       window.currentUser?.email || 'manager',
            at:       now,
        };

        // Додаємо файл якщо завантажено
        if (fileData) {
            historyData.fileUrl  = fileData.url;
            historyData.fileName = fileData.name;
            historyData.fileSize = fileData.size;
            historyData.fileType = fileData.type;
        }

        await ref.collection('history').add(historyData);

        // Оновлення угоди
        const upd = {
            lastCallAt:     now,
            lastCallResult: result,
            updatedAt:      now,
        };
        if (nextDate) upd.nextContactDate = nextDate;
        if (nextTime) upd.nextContactTime = nextTime;
        await ref.update(upd);

        // Оновлення локального стану
        const deal = window.crm?.deals?.find(d => d.id === dealId);
        if (deal) {
            deal.lastCallResult  = result;
            if (nextDate) deal.nextContactDate = nextDate;
            if (nextTime) deal.nextContactTime = nextTime;
        }

        // Якщо missed або callback — автоматично створюємо задачу "Передзвонити"
        // Така сама логіка що і стандартна задача (повний набір полів)
        if (result === 'missed' || result === 'callback') {
            try {
                const uid = window.currentUser?.uid || '';
                const usersArr = window.users || [];
                const assigneeUser = usersArr.find(u => u.id === uid);
                const callbackDate = nextDate || _crmCallDefaultDate();
                const taskTitle = result === 'missed'
                    ? `Передзвонити (пропущений): ${clientName || phone}`
                    : `Передзвонити: ${clientName || phone}`;

                const taskRef = await window.companyRef()
                    .collection(window.DB_COLS?.TASKS || 'tasks').add({
                        title:        taskTitle,
                        status:       'new',
                        priority:     result === 'missed' ? 'high' : 'medium',
                        assigneeId:   uid,
                        assigneeName: assigneeUser ? (assigneeUser.name || assigneeUser.email || '') : '',
                        creatorId:    uid,
                        creatorName:  assigneeUser ? (assigneeUser.name || assigneeUser.email || '') : '',
                        deadlineDate: callbackDate,
                        deadlineTime: nextTime || '10:00',
                        deadline:     callbackDate + 'T' + (nextTime || '10:00'),
                        createdDate:  new Date().toISOString().split('T')[0],
                        description:  note ? `Нотатка дзвінка: ${note}` : '',
                        function:     '',
                        projectId:    '',
                        stageId:      '',
                        pinned:       false,
                        requireReview:    false,
                        coExecutorIds:    [],
                        observerIds:      [],
                        notifyOnComplete: [],
                        checklist:        [],
                        source:       'crm_call',
                        crmDealId:    dealId,
                        dealId:       dealId,
                        clientName:   clientName || '',
                        clientPhone:  phone || '',
                        autoCreated:  true,
                        createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt:    firebase.firestore.FieldValue.serverTimestamp(),
                    });

                // Логуємо задачу в history угоди
                ref.collection('history').add({
                    type: 'task', text: taskTitle, taskId: taskRef.id,
                    by: window.currentUser?.email || 'manager',
                    at: firebase.firestore.FieldValue.serverTimestamp(),
                }).catch(() => {});

                // Локальний масив tasks
                if (window.tasks && Array.isArray(window.tasks)) {
                    window.tasks.unshift({ id: taskRef.id, title: taskTitle, status: 'new',
                        assigneeId: uid, deadlineDate: callbackDate, crmDealId: dealId });
                    if (typeof scheduleRender === 'function') scheduleRender();
                }
            } catch(taskErr) {
                console.warn('[CRM calls] callback task creation failed:', taskErr.message);
            }
        }

        // Емітуємо події в EventBus → тригери CRM
        if (typeof emitTalkoEvent === 'function' && window.TALKO_EVENTS) {
            const eventType = result === 'missed'
                ? window.TALKO_EVENTS.CALL_MISSED
                : window.TALKO_EVENTS.CALL_RECEIVED;
            if (eventType) {
                emitTalkoEvent(eventType, {
                    dealId, clientName, phone, result, note, duration,
                }).catch(() => {});
            }
        }

        if (window.showToast) {
            const msg = (result === 'missed' || result === 'callback')
                ? (window.t('callSaved') || 'Дзвінок збережено') + ' · Задачу «Передзвонити» створено'
                : (window.t('callSaved') || 'Дзвінок збережено');
            showToast(msg, 'success');
        }

        // Якщо відкрита картка угоди — оновлюємо активності
        const actTab = document.getElementById('crmDealContent');
        if (actTab && window._crmActiveDealId === dealId) {
            const deal2 = window.crm?.deals?.find(d => d.id === dealId);
            if (deal2 && typeof window._crmLoadActivityTab === 'function') {
                window._crmLoadActivityTab(deal2);
            }
        }

        document.getElementById('crmCallLogModal')?.remove();
        window._crmActiveCall = null;
        // Оновлюємо список "Що робити зараз" якщо він активний
        if (typeof window.renderCrmTodo === 'function' &&
            document.getElementById('crmViewTodo')) {
            window.renderCrmTodo();
        }
    } catch (e) {
        if (window.showToast) showToast(window.t('errPfx2') + e.message, 'error');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Зберегти дзвінок';
        }
    }
};

// ── Швидкий лог дзвінка з активностей (без tel:) ─────────
window.crmLogCallManual = function (dealId, clientName, phone) {
    window._crmActiveCall = { dealId, phone: phone || '', clientName: clientName || '', startTime: Date.now() };
    _crmShowCallLogModal();
};

// ── Робота з файлами ───────────────────────────────────────
window._crmCallFileSelected = function(input) {
    const file = input.files?.[0];
    const fileNameEl = document.getElementById('crmCallFileName');
    if (!fileNameEl) return;

    if (file) {
        // Показуємо ім'я файлу та розмір
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        fileNameEl.innerHTML = `<span style="color:#16a34a;font-weight:600;">${_escStr(file.name)}</span> <span style="color:#9ca3af;">(${sizeMB} MB)</span>`;
    } else {
        fileNameEl.textContent = '';
    }
};

// Завантаження файлу в Firebase Storage
async function _crmUploadCallFile(dealId) {
    const fileInput = document.getElementById('crmCallFile');
    const file = fileInput?.files?.[0];
    if (!file) return null; // Немає файлу — не завантажуємо

    try {
        if (!firebase.storage) {
            throw new Error('Firebase Storage не ініціалізовано');
        }

        const compId = window.currentCompanyData?.id || 'unknown';
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `companies/${compId}/crm_calls/${dealId}/${timestamp}_${safeName}`;

        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(path);

        // Завантажуємо файл
        const uploadTask = await fileRef.put(file);

        // Отримуємо публічний URL
        const downloadURL = await fileRef.getDownloadURL();

        return {
            url: downloadURL,
            name: file.name,
            size: file.size,
            type: file.type,
        };
    } catch (e) {
        console.error('[CRM] File upload error:', e);
        throw new Error('Помилка завантаження файлу: ' + e.message);
    }
}

// ── Хелпер ─────────────────────────────────────────────────
// Використовуємо глобальний _crmEsc якщо доступний, інакше локальний fallback
function _escStr(s) {
    if (typeof window._crmEsc === 'function') return window._crmEsc(s);
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
