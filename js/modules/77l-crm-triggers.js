// ============================================================
// js/modules/77l-crm-triggers.js — CRM Тригери
// "ЯКЩО подія + умови → ТО дії"
// ============================================================

(function () {

    const EVENT_LABELS = {
        stage_changed:    { uk: 'Угода перейшла в стадію', ru: 'Сделка перешла в стадию' },
        deal_created:     { uk: 'Нова угода створена',      ru: 'Новая сделка создана' },
        deal_won:         { uk: 'Угода виграна',             ru: 'Сделка выиграна' },
        deal_lost:        { uk: 'Угода програна',            ru: 'Сделка проиграна' },
        deal_stale:       { uk: 'Угода не рухалась N днів',  ru: 'Сделка не двигалась N дней' },
        amount_threshold: { uk: 'Сума перевищила поріг',     ru: 'Сумма превысила порог' },
    };

    const FIELD_LABELS = {
        stage:       { uk: 'Стадія',    ru: 'Стадия' },
        amount:      { uk: 'Сума',      ru: 'Сумма' },
        source:      { uk: 'Джерело',   ru: 'Источник' },
        assigneeId:  { uk: 'Виконавець',ru: 'Исполнитель' },
        staleDays:   { uk: 'Днів без руху', ru: 'Дней без движения' },
    };

    const OP_LABELS = {
        eq:  { uk: 'дорівнює',     ru: 'равно' },
        neq: { uk: 'не дорівнює',  ru: 'не равно' },
        gt:  { uk: 'більше ніж',   ru: 'больше чем' },
        lt:  { uk: 'менше ніж',    ru: 'меньше чем' },
    };

    const ACTION_LABELS = {
        create_task:     { uk: 'Створити задачу',          ru: 'Создать задачу' },
        send_telegram:   { uk: 'Telegram-повідомлення',    ru: 'Telegram-уведомление' },
        change_assignee: { uk: 'Змінити відповідального',  ru: 'Изменить ответственного' },
        add_tag:         { uk: 'Додати тег',               ru: 'Добавить тег' },
        move_stage:      { uk: 'Перемістити в стадію',     ru: 'Переместить в стадию' },
    };

    function _tl(obj) {
        const lang = window.currentLang || window.currentLanguage || 'uk';
        return (lang === 'ru' || lang === 'ru-RU') ? obj.ru : obj.uk;
    }
    function _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    // ── Render список тригерів ─────────────────────────────
    window.crmRenderTriggersSettings = async function(container) {
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:1rem;color:#9ca3af;font-size:0.8rem;">Завантаження тригерів...</div>';

        let triggers = [];
        try {
            const snap = await window.companyRef().collection('crmTriggers').orderBy('createdAt', 'desc').get();
            triggers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(e) {
            triggers = [];
        }

        const rows = triggers.map(t => {
            const evLabel = _tl(EVENT_LABELS[t.event] || { uk: t.event, ru: t.event });
            const condCount = (t.conditions || []).length;
            const actCount  = (t.actions || []).length;
            const actSummary = (t.actions || []).map(a => _tl(ACTION_LABELS[a.type] || { uk: a.type, ru: a.type })).join(', ');

            return `
            <div style="background:white;border:1px solid #e8eaed;border-radius:10px;padding:0.85rem 1rem;margin-bottom:0.5rem;">
                <div style="display:flex;align-items:center;gap:0.65rem;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.85rem;font-weight:700;color:#111827;">${_esc(t.name||'Без назви')}</div>
                        <div style="font-size:0.72rem;color:#6b7280;margin-top:2px;">
                            <span style="background:#eff6ff;color:#3b82f6;padding:1px 6px;border-radius:4px;font-weight:600;">${_esc(evLabel)}</span>
                            ${condCount ? `<span style="margin-left:4px;">${condCount} умов${condCount===1?'а':condCount<5?'и':''}` + `</span>` : ''}
                        </div>
                        <div style="font-size:0.72rem;color:#9ca3af;margin-top:2px;">Дії: ${_esc(actSummary||'—')}</div>
                    </div>
                    <!-- Toggle ON/OFF -->
                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer;flex-shrink:0;">
                        <div style="position:relative;width:36px;height:20px;">
                            <input type="checkbox" ${t.isActive ? 'checked' : ''} onchange="crmToggleTrigger('${t.id}',this.checked)"
                                style="opacity:0;width:0;height:0;position:absolute;">
                            <div style="position:absolute;inset:0;background:${t.isActive?'#22c55e':'#d1d5db'};border-radius:10px;transition:background 0.2s;"></div>
                            <div style="position:absolute;top:2px;left:${t.isActive?'18px':'2px'};width:16px;height:16px;background:white;border-radius:50%;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
                        </div>
                    </label>
                    <button onclick="crmOpenTriggerModal('${t.id}')"
                        style="padding:0.3rem 0.6rem;background:#f8fafc;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;font-size:0.75rem;color:#374151;">
                        Редагувати
                    </button>
                    <button onclick="crmDeleteTrigger('${t.id}')"
                        style="padding:0.3rem;background:none;border:none;cursor:pointer;color:#fca5a5;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
        <div style="background:white;border-radius:10px;padding:1.1rem;border:1px solid #e8eaed;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <div>
                    <div style="font-weight:700;font-size:0.85rem;color:#111827;">Тригери</div>
                    <div style="font-size:0.72rem;color:#9ca3af;">ЯКЩО подія + умови → ТО дії. Як "Роботи" в Бітрікс</div>
                </div>
                <button onclick="crmOpenTriggerModal(null)"
                    style="display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.75rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    + Тригер
                </button>
            </div>
            ${triggers.length ? rows : '<div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:0.82rem;">Тригерів ще немає.<br>Натисніть «+ Тригер» щоб створити перший.</div>'}
        </div>`;
    };

    // ── Toggle активності ──────────────────────────────────
    window.crmToggleTrigger = async function(triggerId, isActive) {
        try {
            await window.companyRef().collection('crmTriggers').doc(triggerId).update({ isActive });
            if (window.showToast) showToast(isActive ? 'Тригер увімкнено' : 'Тригер вимкнено', 'success');
        } catch(e) {
            if (window.showToast) showToast('Помилка: ' + e.message, 'error');
        }
    };

    // ── Видалення ──────────────────────────────────────────
    window.crmDeleteTrigger = async function(triggerId) {
        const confirmed = typeof showConfirmModal === 'function'
            ? await showConfirmModal('Видалити тригер?', { danger: true })
            : confirm('Видалити тригер?');
        if (!confirmed) return;
        try {
            await window.companyRef().collection('crmTriggers').doc(triggerId).delete();
            if (window.showToast) showToast('Тригер видалено', 'success');
            const el = document.getElementById('crmSettingsTriggersBlock');
            if (el) crmRenderTriggersSettings(el);
        } catch(e) {
            if (window.showToast) showToast('Помилка: ' + e.message, 'error');
        }
    };

    // ── Модал конструктора ─────────────────────────────────
    window.crmOpenTriggerModal = async function(triggerId) {
        let trigger = { name:'', event:'stage_changed', isActive:true, conditions:[], actions:[] };
        if (triggerId) {
            try {
                const snap = await window.companyRef().collection('crmTriggers').doc(triggerId).get();
                if (snap.exists) trigger = { id: snap.id, ...snap.data() };
            } catch(e) {}
        }

        const stages = (window.crm?.pipeline?.stages || []).sort((a,b)=>a.order-b.order);
        const users  = window.companyUsers || window.users || [];

        const stageOpts = stages.map(s => `<option value="${_esc(s.id)}">${_esc(s.label)}</option>`).join('');
        const userOpts  = users.map(u => `<option value="${_esc(u.id)}">${_esc(u.name||u.email)}</option>`).join('');
        const eventOpts = Object.entries(EVENT_LABELS).map(([k,v]) =>
            `<option value="${k}" ${trigger.event===k?'selected':''}>${_tl(v)}</option>`).join('');

        const inp = 'width:100%;padding:0.4rem 0.55rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;font-family:inherit;';
        const lbl = 'font-size:0.7rem;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.3rem;';

        // Рендер умов
        function renderConditions(conditions) {
            return (conditions||[]).map((c,i) => `
            <div class="trg-cond-row" data-idx="${i}" style="display:flex;gap:0.4rem;align-items:center;margin-bottom:0.35rem;">
                <select data-cond-field style="flex:1;${inp}">
                    ${Object.entries(FIELD_LABELS).map(([k,v])=>`<option value="${k}" ${c.field===k?'selected':''}>${_tl(v)}</option>`).join('')}
                </select>
                <select data-cond-op style="flex:1;${inp}">
                    ${Object.entries(OP_LABELS).map(([k,v])=>`<option value="${k}" ${c.op===k?'selected':''}>${_tl(v)}</option>`).join('')}
                </select>
                <input data-cond-val value="${_esc(c.value||'')}" placeholder="Значення" style="flex:1;${inp}">
                <button onclick="this.closest('.trg-cond-row').remove()" style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px;flex-shrink:0;">✕</button>
            </div>`).join('');
        }

        // Рендер дій
        function renderActions(actions) {
            return (actions||[]).map((a,i) => `
            <div class="trg-act-row" data-idx="${i}" style="background:#f8fafc;border-radius:8px;padding:0.55rem;margin-bottom:0.35rem;">
                <div style="display:flex;gap:0.4rem;align-items:center;margin-bottom:0.35rem;">
                    <select data-act-type style="flex:1;${inp}" onchange="crmTriggerActTypeChange(this)">
                        ${Object.entries(ACTION_LABELS).map(([k,v])=>`<option value="${k}" ${a.type===k?'selected':''}>${_tl(v)}</option>`).join('')}
                    </select>
                    <button onclick="this.closest('.trg-act-row').remove()" style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px;flex-shrink:0;">✕</button>
                </div>
                <div data-act-params>
                    ${_actParamsHTML(a, stageOpts, userOpts, inp)}
                </div>
            </div>`).join('');
        }

        const overlay = document.createElement('div');
        overlay.id = 'crmTriggerOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10040;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto;';
        overlay.innerHTML = `
        <div style="background:white;border-radius:14px;padding:1.5rem;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
                <div style="font-weight:700;font-size:1rem;color:#111827;">${triggerId ? 'Редагувати тригер' : 'Новий тригер'}</div>
                <button onclick="document.getElementById('crmTriggerOverlay').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;">✕</button>
            </div>

            <!-- Назва -->
            <div style="margin-bottom:1rem;">
                <label style="${lbl}">Назва тригера</label>
                <input id="trgName" value="${_esc(trigger.name||'')}" placeholder="Наприклад: Виграна велика угода" style="${inp}">
            </div>

            <!-- Подія -->
            <div style="margin-bottom:1rem;">
                <label style="${lbl}">ПОДІЯ — коли спрацьовує</label>
                <select id="trgEvent" style="${inp}">${eventOpts}</select>
            </div>

            <!-- Умови -->
            <div style="margin-bottom:1rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                    <label style="${lbl}margin-bottom:0;">УМОВИ (необов'язково)</label>
                    <button onclick="crmTriggerAddCondition()" style="font-size:0.75rem;padding:2px 8px;background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe;border-radius:5px;cursor:pointer;">+ Умова</button>
                </div>
                <div id="trgConditions">${renderConditions(trigger.conditions)}</div>
            </div>

            <!-- Дії -->
            <div style="margin-bottom:1.25rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                    <label style="${lbl}margin-bottom:0;">ДІЇ — що зробити</label>
                    <button onclick="crmTriggerAddAction()" style="font-size:0.75rem;padding:2px 8px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:5px;cursor:pointer;">+ Дія</button>
                </div>
                <div id="trgActions">${renderActions(trigger.actions)}</div>
            </div>

            <!-- Кнопки -->
            <div style="display:flex;gap:0.5rem;">
                <button onclick="document.getElementById('crmTriggerOverlay').remove()"
                    style="flex:1;padding:0.5rem;background:white;color:#374151;border:1px solid #e8eaed;border-radius:7px;cursor:pointer;font-size:0.82rem;">
                    Скасувати
                </button>
                <button onclick="crmSaveTrigger('${triggerId||''}')"
                    style="flex:2;padding:0.5rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-size:0.82rem;font-weight:600;">
                    Зберегти тригер
                </button>
            </div>
        </div>`;

        // Зберігаємо дані для динамічних select
        overlay._stageOpts = stageOpts;
        overlay._userOpts  = userOpts;
        overlay._inp       = inp;
        document.body.appendChild(overlay);
    };

    // Параметри дії залежно від типу
    function _actParamsHTML(a, stageOpts, userOpts, inp) {
        switch(a.type) {
            case 'create_task':
                return `<input data-act-title placeholder="Назва задачі" value="${_esc(a.title||'')}" style="${inp}margin-bottom:0.3rem;">
                        <input data-act-duedays type="number" placeholder="Дедлайн (днів)" value="${a.dueDays||1}" style="${inp}">`;
            case 'send_telegram':
                return `<select data-act-to style="${inp}margin-bottom:0.3rem;">
                            <option value="owner" ${a.to==='owner'?'selected':''}>Власнику</option>
                            <option value="assignee" ${a.to==='assignee'?'selected':''}>Відповідальному</option>
                        </select>
                        <input data-act-message placeholder="Текст повідомлення" value="${_esc(a.message||'')}" style="${inp}">`;
            case 'change_assignee':
                return `<select data-act-userid style="${inp}">${userOpts}</select>`;
            case 'add_tag':
                return `<input data-act-tag placeholder="Назва тегу" value="${_esc(a.tag||'')}" style="${inp}">`;
            case 'move_stage':
                return `<select data-act-stage style="${inp}">${stageOpts}</select>`;
            default:
                return '';
        }
    }

    window.crmTriggerActTypeChange = function(sel) {
        const row = sel.closest('.trg-act-row');
        const params = row.querySelector('[data-act-params]');
        const overlay = document.getElementById('crmTriggerOverlay');
        const stageOpts = overlay?._stageOpts || '';
        const userOpts  = overlay?._userOpts  || '';
        const inp = overlay?._inp || 'width:100%;padding:0.4rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;';
        params.innerHTML = _actParamsHTML({ type: sel.value }, stageOpts, userOpts, inp);
    };

    window.crmTriggerAddCondition = function() {
        const container = document.getElementById('trgConditions');
        if (!container) return;
        const idx = container.children.length;
        const overlay = document.getElementById('crmTriggerOverlay');
        const inp = overlay?._inp || 'width:100%;padding:0.4rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;';
        const div = document.createElement('div');
        div.className = 'trg-cond-row';
        div.dataset.idx = idx;
        div.style.cssText = 'display:flex;gap:0.4rem;align-items:center;margin-bottom:0.35rem;';
        div.innerHTML = `
            <select data-cond-field style="flex:1;${inp}">
                ${Object.entries(FIELD_LABELS).map(([k,v])=>`<option value="${k}">${_tl(v)}</option>`).join('')}
            </select>
            <select data-cond-op style="flex:1;${inp}">
                ${Object.entries(OP_LABELS).map(([k,v])=>`<option value="${k}">${_tl(v)}</option>`).join('')}
            </select>
            <input data-cond-val placeholder="Значення" style="flex:1;${inp}">
            <button onclick="this.closest('.trg-cond-row').remove()" style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px;flex-shrink:0;">✕</button>`;
        container.appendChild(div);
    };

    window.crmTriggerAddAction = function() {
        const container = document.getElementById('trgActions');
        if (!container) return;
        const overlay = document.getElementById('crmTriggerOverlay');
        const stageOpts = overlay?._stageOpts || '';
        const userOpts  = overlay?._userOpts  || '';
        const inp = overlay?._inp || 'width:100%;padding:0.4rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;';
        const div = document.createElement('div');
        div.className = 'trg-act-row';
        div.style.cssText = 'background:#f8fafc;border-radius:8px;padding:0.55rem;margin-bottom:0.35rem;';
        div.innerHTML = `
            <div style="display:flex;gap:0.4rem;align-items:center;margin-bottom:0.35rem;">
                <select data-act-type style="flex:1;${inp}" onchange="crmTriggerActTypeChange(this)">
                    ${Object.entries(ACTION_LABELS).map(([k,v])=>`<option value="${k}">${_tl(v)}</option>`).join('')}
                </select>
                <button onclick="this.closest('.trg-act-row').remove()" style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px;flex-shrink:0;">✕</button>
            </div>
            <div data-act-params>${_actParamsHTML({ type: 'create_task' }, stageOpts, userOpts, inp)}</div>`;
        container.appendChild(div);
    };

    // ── Збереження тригера ─────────────────────────────────
    window.crmSaveTrigger = async function(triggerId) {
        const name  = document.getElementById('trgName')?.value.trim();
        const event = document.getElementById('trgEvent')?.value;
        if (!name) { if(window.showToast) showToast('Введіть назву тригера', 'error'); return; }

        // Збираємо умови
        const conditions = [];
        document.querySelectorAll('.trg-cond-row').forEach(row => {
            const field = row.querySelector('[data-cond-field]')?.value;
            const op    = row.querySelector('[data-cond-op]')?.value;
            const value = row.querySelector('[data-cond-val]')?.value.trim();
            if (field && op && value) conditions.push({ field, op, value });
        });

        // Збираємо дії
        const actions = [];
        document.querySelectorAll('.trg-act-row').forEach(row => {
            const type = row.querySelector('[data-act-type]')?.value;
            if (!type) return;
            const act = { type };
            if (type === 'create_task') {
                act.title   = row.querySelector('[data-act-title]')?.value.trim() || '';
                act.dueDays = parseInt(row.querySelector('[data-act-duedays]')?.value) || 1;
            } else if (type === 'send_telegram') {
                act.to      = row.querySelector('[data-act-to]')?.value || 'owner';
                act.message = row.querySelector('[data-act-message]')?.value.trim() || '';
            } else if (type === 'change_assignee') {
                act.userId  = row.querySelector('[data-act-userid]')?.value || '';
            } else if (type === 'add_tag') {
                act.tag     = row.querySelector('[data-act-tag]')?.value.trim() || '';
            } else if (type === 'move_stage') {
                act.stage   = row.querySelector('[data-act-stage]')?.value || '';
            }
            actions.push(act);
        });

        const data = {
            name, event, conditions, actions,
            isActive: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            if (triggerId) {
                await window.companyRef().collection('crmTriggers').doc(triggerId).update(data);
            } else {
                data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await window.companyRef().collection('crmTriggers').add(data);
            }
            document.getElementById('crmTriggerOverlay')?.remove();
            if (window.showToast) showToast('Тригер збережено', 'success');
            const el = document.getElementById('crmSettingsTriggersBlock');
            if (el) crmRenderTriggersSettings(el);
        } catch(e) {
            if (window.showToast) showToast('Помилка: ' + e.message, 'error');
            console.error('[crmSaveTrigger]', e);
        }
    };

    // ══════════════════════════════════════════════════════
    // ВИКОНАННЯ ТРИГЕРІВ — crmRunTriggers(deal, event)
    // Викликається при зміні стадії, створенні угоди тощо
    // ══════════════════════════════════════════════════════
    window.crmRunTriggers = async function(deal, eventType, context) {
        if (!deal || !eventType) return;
        try {
            const snap = await window.companyRef().collection('crmTriggers')
                .where('isActive','==',true)
                .where('event','==',eventType)
                .get();
            if (snap.empty) return;

            for (const doc of snap.docs) {
                const trigger = { id: doc.id, ...doc.data() };
                if (_checkConditions(trigger.conditions, deal, context)) {
                    await _executeActions(trigger.actions, deal, trigger);
                    // Лог спрацювання
                    await window.companyRef().collection('crmTriggers').doc(trigger.id)
                        .collection('log').add({
                            dealId: deal.id,
                            dealTitle: deal.title || deal.clientName || '',
                            firedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        }).catch(() => {});
                }
            }
        } catch(e) {
            console.warn('[crmRunTriggers]', e.message);
        }
    };

    function _checkConditions(conditions, deal, context) {
        if (!conditions || !conditions.length) return true;
        return conditions.every(c => {
            let val = deal[c.field];
            if (c.field === 'staleDays') val = context?.staleDays || 0;
            const cmpVal = isNaN(c.value) ? c.value : Number(c.value);
            const dealVal = typeof val === 'number' ? val : String(val || '');
            switch(c.op) {
                case 'eq':  return String(dealVal) === String(cmpVal);
                case 'neq': return String(dealVal) !== String(cmpVal);
                case 'gt':  return Number(dealVal) > Number(cmpVal);
                case 'lt':  return Number(dealVal) < Number(cmpVal);
                default: return true;
            }
        });
    }

    async function _executeActions(actions, deal, trigger) {
        if (!actions || !actions.length) return;
        const uid = window.currentUser?.uid || '';
        const today = new Date().toISOString().split('T')[0];

        for (const action of actions) {
            try {
                if (action.type === 'create_task') {
                    const dl = new Date();
                    dl.setDate(dl.getDate() + (action.dueDays || 1));
                    await window.companyRef().collection('tasks').add({
                        title: (action.title || 'Задача') + (deal.clientName ? ' — ' + deal.clientName : ''),
                        dealId: deal.id,
                        clientName: deal.clientName || '',
                        assigneeId: deal.assigneeId || uid,
                        assigneeName: deal.assigneeName || '',
                        status: 'new',
                        priority: 'medium',
                        deadlineDate: dl.toISOString().split('T')[0],
                        triggerName: trigger.name,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        creatorId: uid,
                    });
                } else if (action.type === 'change_assignee' && action.userId) {
                    const users = window.companyUsers || window.users || [];
                    const user = users.find(u => u.id === action.userId);
                    await window.companyRef().collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
                        .doc(deal.id).update({
                            assigneeId: action.userId,
                            assigneeName: user?.name || user?.email || '',
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        });
                } else if (action.type === 'add_tag' && action.tag) {
                    const currentTags = deal.tags || [];
                    if (!currentTags.includes(action.tag)) {
                        await window.companyRef().collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
                            .doc(deal.id).update({
                                tags: firebase.firestore.FieldValue.arrayUnion(action.tag),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            });
                    }
                } else if (action.type === 'move_stage' && action.stage) {
                    await window.companyRef().collection(window.DB_COLS?.CRM_DEALS || 'crm_deals')
                        .doc(deal.id).update({
                            stage: action.stage,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        });
                } else if (action.type === 'send_telegram') {
                    // Telegram через _worker.js / firebase functions
                    const msg = (action.message || trigger.name) + '\n' +
                        (deal.clientName ? '👤 ' + deal.clientName : '') +
                        (deal.amount ? '\n💰 ' + Number(deal.amount).toLocaleString() + ' грн' : '');
                    if (typeof window._sendTriggerTelegram === 'function') {
                        window._sendTriggerTelegram(action.to, msg, deal);
                    }
                }
            } catch(actErr) {
                console.warn('[crmRunTriggers] action failed:', action.type, actErr.message);
            }
        }
    }

    // ── Підключаємо тригери до зміни стадії ───────────────
    // Викликається з _doStageChange в 77-crm.js
    if (!window.crmTriggerHooks) window.crmTriggerHooks = [];
    window.crmTriggerHooks.push(async function(deal, newStage, oldStage) {
        await window.crmRunTriggers(deal, 'stage_changed', { newStage, oldStage });
        if (newStage === 'won')  await window.crmRunTriggers(deal, 'deal_won');
        if (newStage === 'lost') await window.crmRunTriggers(deal, 'deal_lost');
    });

})();
