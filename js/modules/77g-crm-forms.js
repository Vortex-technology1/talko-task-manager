// ============================================================
// js/modules/77g-crm-forms.js — Публічні форми ліда
//
// Settings → Форми:
//   - Список форм компанії (crm_forms subcollection)
//   - Створити форму: назва, стадія, відповідальний, повідомлення
//   - Embed-код: <script> тег для вставки на сайт
//   - Пряме посилання на форму
//   - Деактивувати / Видалити
// ============================================================

// ── Рендер вкладки Форми в Settings ────────────────────────
window.crmRenderFormsSettings = async function () {
    const c = document.getElementById('crmViewSettings');
    if (!c) return;

    if (!window.crmAccess?.canViewAll()) {
        c.innerHTML = '<div style="padding:1rem;color:#9ca3af;font-size:0.82rem;">Доступ тільки для власника</div>';
        return;
    }

    // Завантажуємо форми
    const comp = window.currentCompanyId || window.companyId;
    let forms = [];
    try {
        const snap = await window.companyRef().collection('crm_forms').orderBy('createdAt','desc').get();
        forms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { /* нема форм */ }

    const pipeline  = window.crm?.pipeline;
    const stages    = (pipeline?.stages || []).filter(s => !['lost'].includes(s.id)).sort((a,b) => a.order - b.order);
    const users     = window.users || [];

    const selStyle = 'width:100%;padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.8rem;';

    c.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1rem;">

        <!-- Заголовок + кнопка -->
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
                <div style="font-weight:700;font-size:0.9rem;color:#111827;">🌐 Публічні форми ліда</div>
                <div style="font-size:0.72rem;color:#9ca3af;">Вставте на сайт — заявки автоматично потрапляють у CRM</div>
            </div>
            <button onclick="crmCreateForm()"
                style="display:flex;align-items:center;gap:0.3rem;padding:0.4rem 0.85rem;
                background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;
                font-size:0.8rem;font-weight:600;">
                + Нова форма
            </button>
        </div>

        <!-- Список форм -->
        ${forms.length ? forms.map(f => _formCard(f, stages, users)).join('') :
        `<div style="background:#f8fafc;border:2px dashed #e8eaed;border-radius:10px;padding:2rem;text-align:center;">
            <div style="font-size:1.5rem;margin-bottom:0.5rem;">📋</div>
            <div style="font-size:0.82rem;color:#9ca3af;">Форм ще немає. Натисніть "+ Нова форма"</div>
        </div>`}

    </div>`;
};

function _formCard(f, stages, users) {
    const stageLabel = stages.find(s => s.id === f.stageId)?.label || f.stageId || '—';
    const assignee   = users.find(u => u.id === f.assigneeId);
    const embedUrl   = `${location.origin}/api/crm-form`;
    const formUrl    = `${location.origin}/form/${f.id}?c=${window.currentCompanyId || window.companyId}`;

    return `
    <div style="background:white;border:1px solid ${f.disabled?'#fecaca':'#e8eaed'};border-radius:10px;padding:1rem;
        opacity:${f.disabled?'0.7':'1'};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.6rem;">
            <div>
                <div style="font-weight:700;font-size:0.85rem;color:#111827;">${_fEsc(f.name||'Без назви')}</div>
                <div style="font-size:0.7rem;color:#6b7280;margin-top:2px;">
                    Стадія: ${_fEsc(stageLabel)}
                    ${assignee ? ` · ${_fEsc(assignee.name||assignee.email)}` : ''}
                    · ${f.submitCount||0} заявок
                    ${f.disabled ? ' · <span style="color:#ef4444;font-weight:600;">Деактивована</span>' : ''}
                </div>
            </div>
            <div style="display:flex;gap:0.3rem;">
                <button onclick="crmToggleFormDisabled('${f.id}',${!f.disabled})"
                    style="padding:4px 8px;font-size:0.72rem;border-radius:5px;cursor:pointer;font-weight:600;
                    background:${f.disabled?'#f0fdf4':'#fff7ed'};color:${f.disabled?'#16a34a':'#ea580c'};
                    border:1px solid ${f.disabled?'#bbf7d0':'#fed7aa'};">
                    ${f.disabled?'Активувати':'Деактивувати'}
                </button>
                <button onclick="crmDeleteForm('${f.id}')"
                    style="padding:4px 8px;font-size:0.72rem;border-radius:5px;cursor:pointer;
                    background:#fef2f2;color:#ef4444;border:1px solid #fecaca;">
                    Видалити
                </button>
            </div>
        </div>

        <!-- Embed код -->
        <div style="margin-bottom:0.5rem;">
            <div style="font-size:0.7rem;font-weight:600;color:#6b7280;margin-bottom:0.25rem;">Embed код (вставте на сайт):</div>
            <div style="display:flex;gap:0.3rem;">
                <code style="flex:1;background:#f8fafc;border:1px solid #e8eaed;border-radius:5px;
                    padding:0.35rem 0.5rem;font-size:0.65rem;color:#374151;overflow:hidden;
                    white-space:nowrap;text-overflow:ellipsis;">
                    &lt;script src="${location.origin}/crm-form-widget.js" data-form="${f.id}" data-company="${window.currentCompanyId||window.companyId}"&gt;&lt;/script&gt;
                </code>
                <button onclick="crmCopyEmbed('${f.id}')"
                    style="padding:0.35rem 0.6rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;
                    border-radius:5px;cursor:pointer;font-size:0.72rem;font-weight:600;flex-shrink:0;">
                    Копіювати
                </button>
            </div>
        </div>

        <!-- Пряме посилання -->
        <div style="display:flex;gap:0.3rem;align-items:center;">
            <div style="font-size:0.7rem;font-weight:600;color:#6b7280;flex-shrink:0;">Посилання:</div>
            <a href="${formUrl}" target="_blank"
                style="flex:1;font-size:0.68rem;color:#3b82f6;overflow:hidden;white-space:nowrap;
                text-overflow:ellipsis;text-decoration:none;">
                ${formUrl}
            </a>
            <button onclick="navigator.clipboard?.writeText('${formUrl}');showToast&&showToast('Скопійовано','success')"
                style="padding:3px 7px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;
                border-radius:5px;cursor:pointer;font-size:0.7rem;flex-shrink:0;">
                Копіювати
            </button>
        </div>
    </div>`;
}

// ── Створення нової форми ───────────────────────────────────
window.crmCreateForm = function () {
    const pipeline = window.crm?.pipeline;
    const stages   = (pipeline?.stages||[]).filter(s=>!['lost'].includes(s.id)).sort((a,b)=>a.order-b.order);
    const users    = window.users || [];
    const selStyle = 'width:100%;padding:0.4rem 0.5rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.8rem;margin-top:0.25rem;';

    const existing = document.getElementById('crmFormCreateModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'crmFormCreateModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10055;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
    <div style="background:white;border-radius:12px;width:100%;max-width:420px;padding:1.25rem;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="font-weight:700;font-size:0.92rem;color:#111827;margin-bottom:1rem;">Нова форма ліда</div>

        <label style="display:block;margin-bottom:0.65rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.25rem;">Назва форми *</div>
            <input id="crmFormName" placeholder="Запис на консультацію" style="${selStyle}">
        </label>

        <label style="display:block;margin-bottom:0.65rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.25rem;">Стадія для нових лідів</div>
            <select id="crmFormStage" style="${selStyle}">
                ${stages.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
            </select>
        </label>

        <label style="display:block;margin-bottom:0.65rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.25rem;">Відповідальний менеджер</div>
            <select id="crmFormAssignee" style="${selStyle}">
                <option value="">— Автоматично —</option>
                ${users.map(u => `<option value="${u.id}">${u.name||u.email}</option>`).join('')}
            </select>
        </label>

        <label style="display:block;margin-bottom:0.65rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.25rem;">Повідомлення після відправки</div>
            <input id="crmFormSuccess" value="Дякуємо! Ми зв'яжемось з вами найближчим часом." style="${selStyle}">
        </label>

        <label style="display:block;margin-bottom:1rem;">
            <div style="font-size:0.75rem;font-weight:600;color:#6b7280;margin-bottom:0.25rem;">Поля форми</div>
            <div style="display:flex;flex-direction:column;gap:0.3rem;">
                ${[['name','Ім\'я',true],['phone','Телефон',true],['email','Email',false],['message','Повідомлення',false]].map(([id,label,def]) => `
                <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.78rem;color:#374151;cursor:pointer;">
                    <input type="checkbox" id="crmFormField_${id}" ${def?'checked':''} style="accent-color:#22c55e;">
                    ${label} ${def?'<span style="color:#ef4444;">*</span>':''}
                </label>`).join('')}
            </div>
        </label>

        <div style="display:flex;gap:0.5rem;">
            <button onclick="document.getElementById('crmFormCreateModal').remove()"
                style="flex:1;padding:0.5rem;background:#f4f5f7;border:1px solid #e8eaed;border-radius:7px;cursor:pointer;font-size:0.82rem;">
                Скасувати
            </button>
            <button onclick="crmSaveNewForm()"
                style="flex:2;padding:0.5rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:600;font-size:0.82rem;">
                Створити форму
            </button>
        </div>
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.getElementById('crmFormName')?.focus();
};

window.crmSaveNewForm = async function () {
    const name    = document.getElementById('crmFormName')?.value.trim();
    const stageId = document.getElementById('crmFormStage')?.value || 'new';
    const assignee= document.getElementById('crmFormAssignee')?.value || null;
    const success = document.getElementById('crmFormSuccess')?.value.trim() || '';
    const fields  = ['name','phone','email','message'].filter(f => document.getElementById(`crmFormField_${f}`)?.checked);

    if (!name) { if (window.showToast) showToast('Вкажіть назву форми', 'error'); return; }

    const saveBtn = document.querySelector('#crmFormCreateModal button:last-child');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Збереження...'; }

    try {
        await window.companyRef().collection('crm_forms').add({
            name,
            stageId,
            assigneeId:      assignee || null,
            pipelineId:      window.crm?.pipeline?.id || null,
            successMessage:  success,
            fields,
            defaultSource:   'web_form',
            disabled:        false,
            submitCount:     0,
            createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
            createdBy:       window.currentUser?.uid || '',
        });

        document.getElementById('crmFormCreateModal')?.remove();
        if (window.showToast) showToast('Форму створено', 'success');
        window.crmRenderFormsSettings();
    } catch (e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Створити форму'; }
    }
};

window.crmToggleFormDisabled = async function (formId, disabled) {
    try {
        await window.companyRef().collection('crm_forms').doc(formId).update({ disabled });
        if (window.showToast) showToast(disabled ? 'Форму деактивовано' : 'Форму активовано', 'success');
        window.crmRenderFormsSettings();
    } catch (e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};

window.crmDeleteForm = async function (formId) {
    if (!confirm('Видалити форму? Вбудований код перестане працювати.')) return;
    try {
        await window.companyRef().collection('crm_forms').doc(formId).delete();
        if (window.showToast) showToast('Форму видалено', 'success');
        window.crmRenderFormsSettings();
    } catch (e) {
        if (window.showToast) showToast('Помилка: ' + e.message, 'error');
    }
};

window.crmCopyEmbed = function (formId) {
    const companyId = window.currentCompanyId || window.companyId;
    const code = `<script src="${location.origin}/crm-form-widget.js" data-form="${formId}" data-company="${companyId}"><\/script>`;
    navigator.clipboard?.writeText(code).then(() => {
        if (window.showToast) showToast('Embed код скопійовано', 'success');
    }).catch(() => {
        prompt('Скопіюйте код:', code);
    });
};

// ── Додаємо таб "Форми" в Settings ─────────────────────────
// Патчимо crmSwitchTab щоб при 'forms' рендерити _renderFormsTab
const _origSwitchTab = window.crmSwitchTab;
window.crmSwitchTab = function (tab) {
    if (tab === 'settings') {
        // Додаємо кнопку Форми в settings якщо немає
        setTimeout(_ensureFormsTabInSettings, 100);
    }
    _origSwitchTab(tab);
};

function _ensureFormsTabInSettings() {
    const settingsEl = document.getElementById('crmViewSettings');
    if (!settingsEl) return;
    // Якщо вже є блок форм — нічого не робимо
    if (settingsEl.querySelector('[data-crm-forms]')) return;
    // Додаємо кнопку "Форми" в кінець Settings
    const btn = document.createElement('button');
    btn.setAttribute('data-crm-forms', '1');
    btn.textContent = '🌐 Управління формами →';
    btn.style.cssText = 'width:100%;padding:0.6rem;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;';
    btn.onclick = () => window.crmRenderFormsSettings();
    settingsEl.querySelector('div')?.appendChild(btn);
}

function _fEsc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
