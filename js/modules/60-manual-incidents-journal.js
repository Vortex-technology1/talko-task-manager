(function () {
'use strict';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const INCIDENTS_COL = 'incidents';

const SEVERITY_LABELS = { 1: window.t('sevLow2'), 2: window.t('sevMedium2'), 3: window.t('sevCritical2') };
const STATUS_LABELS = {
  new:        window.t('incStatusNew'),
  in_review:  'На розгляді',
  fixing:     window.t('incStatusFixing'),
  resolved:   window.t('incResolved2'),
};
const CATEGORY_LABELS = {
  people:   'Люди',
  process:  window.t('permProcesses'),
  finance:  window.t('permFinance'),
  clients:  'Клієнти',
  quality:  'Якість',
  other:    window.t('finOther'),
};

// Поточний стан AI-чату
let aiChat = {
  active: false,
  messages: [],       // { role: 'user'|'assistant', content: '' }
  parsedData: null,   // JSON від AI
};

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

window.showIncidentModal = function (incidentId = null) {
  _openModeChooser(incidentId);
};

window.resolveIncident = async function (id) {
  try {
    await window.companyRef().collection(INCIDENTS_COL).doc(id).update({
      status: 'resolved',
      resolved: true,
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    if (typeof showToast === 'function') showToast(window.t('incidentResolved') || 'Збій позначено як вирішений', 'success');
    _reloadJournalView();
  } catch (e) {
    console.error('resolveIncident error:', e);
    if (typeof showToast === 'function') showToast('Помилка збереження', 'error');
  }
};

window.deleteIncident = async function (id) {
  const _ok = window.showConfirmModal
      ? await showConfirmModal('Видалити цей запис збою?', {danger:true})
      : confirm('Видалити цей запис збою?');
  if (!_ok) return;
  try {
    await window.companyRef().collection(INCIDENTS_COL).doc(id).delete();
    if (typeof showToast === 'function') showToast('Запис видалено', 'success');
    _reloadJournalView();
  } catch (e) {
    console.error('deleteIncident error:', e);
  }
};

window.loadIncidentsForJournal = async function () {
  try {
    const snap = await window.companyRef()
      .collection(INCIDENTS_COL)
      .orderBy('date', 'desc')
      .limit(100)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('loadIncidentsForJournal error:', e);
    return [];
  }
};

// Лічильник відкритих збоїв по functionName (для 25-functions.js)
window.getOpenIncidentsByFunction = async function () {
  try {
    const snap = await window.companyRef()
      .collection(INCIDENTS_COL)
      .where('resolved', '!=', true)
      .get();
    const counts = {};
    snap.docs.forEach(d => {
      const fn = d.data().functionName;
      if (fn) counts[fn] = (counts[fn] || 0) + 1;
    });
    return counts;
  } catch (e) {
    console.error('getOpenIncidentsByFunction error:', e);
    return {};
  }
};

// ─── MODE CHOOSER ─────────────────────────────────────────────────────────────

function _openModeChooser(incidentId) {
  // Якщо редагуємо існуючий — одразу ручна форма
  if (incidentId) {
    _openManualForm(incidentId);
    return;
  }

  const modal = _createModal('incident-mode-chooser', `
    <div class="incident-modal-header">
      <h3>Записати управлінський збій</h3>
      <button class="incident-close-btn" onclick="_closeIncidentModal('incident-mode-chooser')">✕</button>
    </div>
    <div class="incident-mode-body">
      <p class="incident-mode-hint">Оберіть спосіб запису:</p>
      <div class="incident-mode-cards">
        <div class="incident-mode-card" onclick="_closeIncidentModal('incident-mode-chooser'); _openAiMode()">
          <div class="incident-mode-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg></div>
          <div class="incident-mode-title">Описати голосом / текстом (AI)</div>
          <div class="incident-mode-desc">Опишіть що сталося — AI структурує запис автоматично</div>
        </div>
        <div class="incident-mode-card" onclick="_closeIncidentModal('incident-mode-chooser'); _openManualForm(null)">
          <div class="incident-mode-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
          <div class="incident-mode-title">Заповнити вручну</div>
          <div class="incident-mode-desc">Самостійно заповніть всі поля форми</div>
        </div>
      </div>
    </div>
  `);
  document.body.appendChild(modal);
  _injectStyles();
}

// ─── AI MODE ──────────────────────────────────────────────────────────────────

function _openAiMode() {
  aiChat = { active: true, messages: [], parsedData: null };

  const modal = _createModal('incident-ai-mode', `
    <div class="incident-modal-header">
      <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg> AI-запис збою</h3>
      <button class="incident-close-btn" onclick="_closeIncidentModal('incident-ai-mode')">✕</button>
    </div>
    <div class="incident-ai-body">
      <div class="incident-ai-chat" id="incidentAiChat">
        <div class="incident-ai-msg assistant">
          <span>Опишіть що сталося у вільній формі. Наприклад: «Менеджер не передзвонив клієнту, угода зірвалась, втратили 15 000 грн»</span>
        </div>
      </div>
      <div class="incident-ai-input-row">
        <textarea id="incidentAiInput" class="incident-ai-textarea" 
          placeholder="Що сталося..." rows="3"
          onkeydown="if(event.ctrlKey && event.key==='Enter') _sendAiMessage()"></textarea>
        <button class="incident-ai-send-btn" onclick="_sendAiMessage()">
          ➤ Надіслати<br><small>Ctrl+Enter</small>
        </button>
      </div>
      <div id="incidentAiPreview" style="display:none"></div>
      <div class="incident-ai-actions" id="incidentAiActions" style="display:none">
        <button class="btn-primary" onclick="_saveIncidentFromAi()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Зберегти в журнал</button>
        <button class="btn-secondary" onclick="_copyIncidentText()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Копіювати текст</button>
        <button class="btn-ghost" onclick="_resetAiMode()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Переробити</button>
      </div>
    </div>
  `);
  document.body.appendChild(modal);
  _injectStyles();
  setTimeout(() => document.getElementById('incidentAiInput')?.focus(), 100);
}

window._sendAiMessage = async function () {
  const input = document.getElementById('incidentAiInput');
  const text = input?.value?.trim();
  if (!text || text.length < 5) return;

  input.value = '';
  input.disabled = true;

  _appendChatMsg('user', text);
  aiChat.messages.push({ role: 'user', content: text });

  const typingId = _appendChatMsg('assistant', '⏳ Аналізую...');

  try {
    const functions = _getFunctionsList();
    const systemPrompt = _buildSystemPrompt(functions);

    const reply = await window.aiProxy({
      messages:     aiChat.messages,
      systemPrompt: systemPrompt,
      model:        'gpt-4o-mini',
      maxTokens:    800,
      module:       'incidents',
    });

    aiChat.messages.push({ role: 'assistant', content: reply });

    document.getElementById(typingId)?.remove();

    const parsed = _tryParseJson(reply);
    if (parsed) {
      aiChat.parsedData = parsed;
      _appendChatMsg('assistant', 'Готово! Перевірте попередній перегляд нижче і відредагуйте при потребі.');
      _showAiPreview(parsed);
    } else {
      _appendChatMsg('assistant', reply);
    }

  } catch (e) {
    document.getElementById(typingId)?.remove();
    _appendChatMsg('assistant', `❌ Помилка: ${e.message}`);
  }

  input.disabled = false;
  input.focus();
};

function _buildSystemPrompt(functions) {
  const fnList = functions.length ? functions.join(', ') : 'не визначено';
  return `Ти — асистент для фіксації управлінських збоїв в бізнесі.

Твоє завдання: перетворити вільний опис ситуації на структурований запис.

Якщо в тексті бракує важливих даних — задай НЕ БІЛЬШЕ 3 уточнюючих питань.
Питання задавай одним блоком, нумерованим списком.

Коли даних достатньо — поверни ТІЛЬКИ JSON без коментарів, без markdown-обгортки:
{
  "title": "коротка назва збою (до 60 символів)",
  "category": "people|process|finance|clients|quality|other",
  "severity": 1,
  "participants": ["хто залучений"],
  "failedProcess": "який процес або задача дали збій",
  "cause": "причина збою",
  "consequences": "наслідки",
  "toChange": "що потрібно змінити",
  "responsible": "відповідальний за виправлення",
  "functionName": "до якої функції бізнесу відноситься"
}

severity: 1=низька, 2=середня, 3=критична.
Доступні функції бізнесу: ${fnList}

Відповідай українською мовою.`;
}

function _tryParseJson(text) {
  // Чистимо можливі markdown обгортки
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try {
    const obj = JSON.parse(cleaned);
    if (obj && obj.title) return obj;
  } catch (_) {}
  // Шукаємо JSON в тексті
  const match = cleaned.match(/\{[\s\S]*"title"[\s\S]*\}/);
  if (match) {
    try {
      const obj = JSON.parse(match[0]);
      if (obj && obj.title) return obj;
    } catch (_) {}
  }
  return null;
}

function _showAiPreview(data) {
  const preview = document.getElementById('incidentAiPreview');
  if (!preview) return;

  const participants = Array.isArray(data.participants) ? data.participants.join(', ') : (data.participants || '');

  preview.innerHTML = `
    <div class="incident-preview-card">
      <div class="incident-preview-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Попередній перегляд — відредагуйте при потребі</div>
      <div class="incident-preview-grid">
        ${_previewField('Назва збою', 'prev_title', data.title || '', 'input')}
        ${_previewField('Категорія', 'prev_category', data.category || 'other', 'select-category')}
        ${_previewField('Серйозність', 'prev_severity', data.severity || 2, 'select-severity')}
        ${_previewField('Статус', 'prev_status', data.status || 'new', 'select-status')}
        ${_previewField('Функція бізнесу', 'prev_functionName', data.functionName || '', 'input')}
        ${_previewField(window.t('crmColAssignee'), 'prev_responsible', data.responsible || '', 'input')}
        ${_previewField('Залучені', 'prev_participants', participants, 'input')}
        ${_previewField('Процес/задача що зламались', 'prev_failedProcess', data.failedProcess || '', 'textarea')}
        ${_previewField('Причина', 'prev_cause', data.cause || '', 'textarea')}
        ${_previewField('Наслідки', 'prev_consequences', data.consequences || '', 'textarea')}
        ${_previewField('Що потрібно змінити', 'prev_toChange', data.toChange || '', 'textarea')}
      </div>
    </div>
  `;
  preview.style.display = 'block';
  document.getElementById('incidentAiActions').style.display = 'flex';
  preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function _previewField(label, id, value, type) {
  if (type === 'textarea') {
    return `<div class="incident-pf"><label>${label}</label>
      <textarea id="${id}" class="incident-pf-input" rows="2">${_esc(value)}</textarea></div>`;
  }
  if (type === 'select-category') {
    const opts = Object.entries(CATEGORY_LABELS).map(([v, l]) =>
      `<option value="${v}" ${v === value ? 'selected' : ''}>${l}</option>`).join('');
    return `<div class="incident-pf"><label>${label}</label>
      <select id="${id}" class="incident-pf-input">${opts}</select></div>`;
  }
  if (type === 'select-severity') {
    const opts = Object.entries(SEVERITY_LABELS).map(([v, l]) =>
      `<option value="${v}" ${String(v) === String(value) ? 'selected' : ''}>${l}</option>`).join('');
    return `<div class="incident-pf"><label>${label}</label>
      <select id="${id}" class="incident-pf-input">${opts}</select></div>`;
  }
  if (type === 'select-status') {
    const opts = Object.entries(STATUS_LABELS).map(([v, l]) =>
      `<option value="${v}" ${v === value ? 'selected' : ''}>${l}</option>`).join('');
    return `<div class="incident-pf"><label>${label}</label>
      <select id="${id}" class="incident-pf-input">${opts}</select></div>`;
  }
  return `<div class="incident-pf"><label>${label}</label>
    <input id="${id}" class="incident-pf-input" type="text" value="${_esc(value)}"></div>`;
}

window._saveIncidentFromAi = async function () {
  const get = id => document.getElementById(id);
  const participants = (get('prev_participants')?.value || '').split(',').map(s => s.trim()).filter(Boolean);

  const incident = {
    title:         get('prev_title')?.value?.trim() || 'Збій',
    category:      get('prev_category')?.value || 'other',
    severity:      parseInt(get('prev_severity')?.value || '2'),
    status:        get('prev_status')?.value || 'new',
    functionName:  get('prev_functionName')?.value?.trim() || '',
    responsible:   get('prev_responsible')?.value?.trim() || '',
    participants,
    failedProcess: get('prev_failedProcess')?.value?.trim() || '',
    cause:         get('prev_cause')?.value?.trim() || '',
    consequences:  get('prev_consequences')?.value?.trim() || '',
    toChange:      get('prev_toChange')?.value?.trim() || '',
    description:   '',
    linkedTaskId:  '',
    resolved:      false,
    createdVia:    'ai',
    date:          new Date().toISOString().split('T')[0],
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
    createdBy:     window.currentUser?.displayName || window.currentUser?.email || '',
  };

  await _saveIncident(incident);
  _closeIncidentModal('incident-ai-mode');
};

window._copyIncidentText = function () {
  const get = id => document.getElementById(id)?.value || '';
  const text = [
    `УПРАВЛІНСЬКИЙ ЗБІЙ`,
    `Назва: ${get('prev_title')}`,
    `Категорія: ${CATEGORY_LABELS[get('prev_category')] || get('prev_category')}`,
    `Серйозність: ${SEVERITY_LABELS[get('prev_severity')] || get('prev_severity')}`,
    `Відповідальний: ${get('prev_responsible')}`,
    `Функція: ${get('prev_functionName')}`,
    ``,
    `Процес що зламався: ${get('prev_failedProcess')}`,
    `Причина: ${get('prev_cause')}`,
    `Наслідки: ${get('prev_consequences')}`,
    `Що змінити: ${get('prev_toChange')}`,
  ].join('\n');
  navigator.clipboard?.writeText(text);
  if (typeof showToast === 'function') showToast('Скопійовано', 'success');
};

window._resetAiMode = function () {
  _closeIncidentModal('incident-ai-mode');
  _openAiMode();
};

// ─── MANUAL FORM ──────────────────────────────────────────────────────────────

async function _openManualForm(incidentId) {
  let existing = null;
  if (incidentId) {
    const doc = await window.companyRef().collection(INCIDENTS_COL).doc(incidentId).get();
    if (doc.exists) existing = { id: doc.id, ...doc.data() };
  }

  const e = existing || {};
  const users = window.users || [];
  const functions = _getFunctionsList();

  const userOpts = users.map(u =>
    `<option value="${_esc(u.name || u.email)}">${_esc(u.name || u.email)}</option>`
  ).join('');

  const fnOpts = `<option value="">— не вказано —</option>` +
    functions.map(f => `<option value="${_esc(f)}" ${e.functionName === f ? 'selected' : ''}>${_esc(f)}</option>`).join('');

  const participantsVal = Array.isArray(e.participants) ? e.participants.join(', ') : '';

  const modal = _createModal('incident-manual-form', `
    <div class="incident-modal-header">
      <h3>${incidentId ? 'Редагувати збій' : 'Новий збій'}</h3>
      <button class="incident-close-btn" onclick="_closeIncidentModal('incident-manual-form')">✕</button>
    </div>
    <div class="incident-form-body">
      <div class="incident-form-grid">

        <div class="incident-fg incident-fg-full">
          <label>Назва збою *</label>
          <input id="if_title" class="incident-input" type="text" maxlength="100"
            value="${_esc(e.title || '')}" placeholder="Коротко: що сталося">
        </div>

        <div class="incident-fg">
          <label>Категорія</label>
          <select id="if_category" class="incident-input">
            ${Object.entries(CATEGORY_LABELS).map(([v, l]) =>
              `<option value="${v}" ${e.category === v ? 'selected' : ''}>${l}</option>`
            ).join('')}
          </select>
        </div>

        <div class="incident-fg">
          <label>Серйозність</label>
          <select id="if_severity" class="incident-input">
            ${Object.entries(SEVERITY_LABELS).map(([v, l]) =>
              `<option value="${v}" ${String(e.severity) === String(v) ? 'selected' : ''}>${l}</option>`
            ).join('')}
          </select>
        </div>

        <div class="incident-fg">
          <label>Статус</label>
          <select id="if_status" class="incident-input">
            ${Object.entries(STATUS_LABELS).map(([v, l]) =>
              `<option value="${v}" ${(e.status || 'new') === v ? 'selected' : ''}>${l}</option>`
            ).join('')}
          </select>
        </div>

        <div class="incident-fg">
          <label>Відповідальний за виправлення</label>
          <input id="if_responsible" class="incident-input" type="text"
            value="${_esc(e.responsible || '')}" list="if_responsible_list" placeholder="Ім'я або роль">
          <datalist id="if_responsible_list">${userOpts}</datalist>
        </div>

        <div class="incident-fg">
          <label>Функція бізнесу</label>
          <select id="if_functionName" class="incident-input">${fnOpts}</select>
        </div>

        <div class="incident-fg">
          <label>Залучені (через кому)</label>
          <input id="if_participants" class="incident-input" type="text"
            value="${_esc(participantsVal)}" placeholder="Іванов, Петрова...">
        </div>

        <div class="incident-fg incident-fg-full">
          <label>Процес / задача що зламались</label>
          <textarea id="if_failedProcess" class="incident-input" rows="2"
            placeholder="Який процес або задача не спрацювали">${_esc(e.failedProcess || '')}</textarea>
        </div>

        <div class="incident-fg incident-fg-full">
          <label>Причина збою</label>
          <textarea id="if_cause" class="incident-input" rows="2"
            placeholder="Чому це сталося">${_esc(e.cause || '')}</textarea>
        </div>

        <div class="incident-fg incident-fg-full">
          <label>Наслідки</label>
          <textarea id="if_consequences" class="incident-input" rows="2"
            placeholder="Що відбулось через цей збій">${_esc(e.consequences || '')}</textarea>
        </div>

        <div class="incident-fg incident-fg-full">
          <label>Що потрібно змінити</label>
          <textarea id="if_toChange" class="incident-input" rows="2"
            placeholder="Конкретні дії для виправлення">${_esc(e.toChange || '')}</textarea>
        </div>

        <div class="incident-fg incident-fg-full">
          <label>Додаткові нотатки</label>
          <textarea id="if_description" class="incident-input" rows="2"
            placeholder="Будь-яка додаткова інформація">${_esc(e.description || '')}</textarea>
        </div>

      </div>

      <div class="incident-form-footer">
        <button class="btn-primary" onclick="_saveManualIncident('${incidentId || ''}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> ${incidentId ? 'Зберегти зміни' : 'Зберегти в журнал'}
        </button>
        <button class="btn-ghost" onclick="_closeIncidentModal('incident-manual-form')">Скасувати</button>
      </div>
    </div>
  `);
  document.body.appendChild(modal);
  _injectStyles();
  setTimeout(() => document.getElementById('if_title')?.focus(), 100);
}

window._saveManualIncident = async function (existingId) {
  const get = id => document.getElementById(id);
  const title = get('if_title')?.value?.trim();
  if (!title) {
    if (typeof showToast === 'function') showToast('Введіть назву збою', 'error');
    return;
  }
  const participants = (get('if_participants')?.value || '').split(',').map(s => s.trim()).filter(Boolean);

  const incident = {
    title,
    category:      get('if_category')?.value || 'other',
    severity:      parseInt(get('if_severity')?.value || '2'),
    status:        get('if_status')?.value || 'new',
    responsible:   get('if_responsible')?.value?.trim() || '',
    functionName:  get('if_functionName')?.value || '',
    participants,
    failedProcess: get('if_failedProcess')?.value?.trim() || '',
    cause:         get('if_cause')?.value?.trim() || '',
    consequences:  get('if_consequences')?.value?.trim() || '',
    toChange:      get('if_toChange')?.value?.trim() || '',
    description:   get('if_description')?.value?.trim() || '',
    resolved:      get('if_status')?.value === 'resolved',
    createdVia:    'manual',
  };

  if (existingId) {
    incident.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    incident.updatedBy = window.currentUser?.displayName || window.currentUser?.email || '';
    await window.companyRef().collection(INCIDENTS_COL).doc(existingId).update(incident);
  } else {
    incident.date      = new Date().toISOString().split('T')[0];
    incident.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    incident.createdBy = window.currentUser?.displayName || window.currentUser?.email || '';
    incident.linkedTaskId = '';
    await window.companyRef().collection(INCIDENTS_COL).add(incident);
  }

  _closeIncidentModal('incident-manual-form');
  if (typeof showToast === 'function') showToast('Збій збережено', 'success');
  _reloadJournalView();
};

// ─── SAVE HELPER ──────────────────────────────────────────────────────────────

async function _saveIncident(data) {
  try {
    await window.companyRef().collection(INCIDENTS_COL).add(data);
    if (typeof showToast === 'function') showToast('Збій збережено', 'success');
    _reloadJournalView();
  } catch (e) {
    console.error('_saveIncident error:', e);
    if (typeof showToast === 'function') showToast('Помилка збереження', 'error');
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function _getAiKey() {
  // Читаємо з кешу якщо вже завантажили
  if (window._cachedAiKey) return Promise.resolve(window._cachedAiKey);
  // Читаємо з Firebase settings/ai (як 98-finance.js)
  try {
    return window.companyRef().collection('settings').doc('ai').get()
      .then(snap => {
        const key = snap.data()?.openaiApiKey || snap.data()?.apiKey || '';
        if (key) window._cachedAiKey = key;
        return key;
      })
      .catch(() => '');
  } catch(_) { return Promise.resolve(''); }
}

function _getFunctionsList() {
  try {
    // window.functions — масив функцій з 25-functions.js
    const fns = window.functions || window.businessFunctions || [];
    return fns.map(f => f.name || f.title || f).filter(Boolean);
  } catch (_) { return []; }
}

function _appendChatMsg(role, text) {
  const chat = document.getElementById('incidentAiChat');
  if (!chat) return null;
  const id = 'chat-msg-' + Date.now();
  const div = document.createElement('div');
  div.className = `incident-ai-msg ${role}`;
  div.id = id;
  div.innerHTML = `<span>${_esc(text)}</span>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return id;
}

function _reloadJournalView() {
  // Тригеримо ре-рендер вкладки journal в 33-control-dashboard.js
  if (typeof window.renderControlDashboard === 'function') {
    window.renderControlDashboard();
  } else if (typeof window.loadJournalTab === 'function') {
    window.loadJournalTab();
  }
}

function _createModal(id, html) {
  // Закриваємо існуючий якщо є
  document.getElementById(id)?.remove();
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.className = 'incident-overlay';
  overlay.innerHTML = `<div class="incident-modal">${html}</div>`;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) _closeIncidentModal(id);
  });
  return overlay;
}

window._closeIncidentModal = function (id) {
  document.getElementById(id)?.remove();
};

function _esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

function _injectStyles() {
  if (document.getElementById('incident-journal-styles')) return;
  const style = document.createElement('style');
  style.id = 'incident-journal-styles';
  style.textContent = `
    .incident-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,.55); display: flex;
      align-items: center; justify-content: center;
      padding: 16px; animation: incidentFadeIn .15s ease;
    }
    @keyframes incidentFadeIn { from { opacity:0 } to { opacity:1 } }

    .incident-modal {
      background: var(--bg-primary, #fff);
      border-radius: 12px; width: 100%; max-width: 620px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      display: flex; flex-direction: column;
    }

    .incident-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px 14px; border-bottom: 1px solid var(--border-color, #e5e7eb);
      position: sticky; top: 0; background: var(--bg-primary, #fff); z-index: 1;
    }
    .incident-modal-header h3 { margin: 0; font-size: 17px; font-weight: 600; }
    .incident-close-btn {
      background: none; border: none; cursor: pointer;
      font-size: 18px; color: var(--text-muted, #9ca3af);
      padding: 4px 8px; border-radius: 6px;
      transition: background .15s;
    }
    .incident-close-btn:hover { background: var(--bg-hover, #f3f4f6); }

    /* MODE CHOOSER */
    .incident-mode-body { padding: 24px 20px; }
    .incident-mode-hint { margin: 0 0 16px; color: var(--text-muted, #6b7280); font-size: 14px; }
    .incident-mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .incident-mode-card {
      border: 2px solid var(--border-color, #e5e7eb); border-radius: 10px;
      padding: 20px 16px; cursor: pointer; text-align: center;
      transition: border-color .15s, background .15s;
    }
    .incident-mode-card:hover {
      border-color: var(--primary, #6366f1);
      background: var(--bg-hover, #f5f3ff);
    }
    .incident-mode-icon { font-size: 28px; margin-bottom: 8px; }
    .incident-mode-title { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
    .incident-mode-desc { font-size: 12px; color: var(--text-muted, #6b7280); line-height: 1.4; }

    /* AI MODE */
    .incident-ai-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 12px; }
    .incident-ai-chat {
      min-height: 120px; max-height: 280px; overflow-y: auto;
      border: 1px solid var(--border-color, #e5e7eb); border-radius: 8px;
      padding: 12px; display: flex; flex-direction: column; gap: 8px;
      background: var(--bg-secondary, #f9fafb);
    }
    .incident-ai-msg { max-width: 85%; padding: 8px 12px; border-radius: 8px; font-size: 14px; line-height: 1.5; }
    .incident-ai-msg.user {
      align-self: flex-end; background: var(--primary, #6366f1);
      color: #fff; border-bottom-right-radius: 2px;
    }
    .incident-ai-msg.assistant {
      align-self: flex-start; background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #e5e7eb); border-bottom-left-radius: 2px;
    }
    .incident-ai-input-row { display: flex; gap: 8px; }
    .incident-ai-textarea {
      flex: 1; padding: 10px 12px; border-radius: 8px; resize: none; font-size: 14px;
      border: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-primary, #fff); color: var(--text-primary, #111);
      font-family: inherit;
    }
    .incident-ai-textarea:focus { outline: none; border-color: var(--primary, #6366f1); }
    .incident-ai-send-btn {
      background: var(--primary, #6366f1); color: #fff; border: none;
      border-radius: 8px; padding: 0 16px; cursor: pointer; font-size: 13px;
      font-weight: 600; line-height: 1.3; text-align: center; min-width: 80px;
      transition: opacity .15s;
    }
    .incident-ai-send-btn:hover { opacity: .85; }
    .incident-ai-actions {
      display: flex; gap: 8px; flex-wrap: wrap; padding-top: 4px;
    }

    /* PREVIEW */
    .incident-preview-card {
      border: 2px solid var(--primary, #6366f1); border-radius: 10px; padding: 16px;
    }
    .incident-preview-title {
      font-size: 13px; font-weight: 600; color: var(--primary, #6366f1); margin-bottom: 12px;
    }
    .incident-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .incident-pf { display: flex; flex-direction: column; gap: 4px; }
    .incident-pf label { font-size: 12px; font-weight: 500; color: var(--text-muted, #6b7280); }
    .incident-pf-input {
      padding: 7px 10px; border-radius: 6px; font-size: 13px; font-family: inherit;
      border: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-primary, #fff); color: var(--text-primary, #111);
      width: 100%; box-sizing: border-box;
    }
    .incident-pf-input:focus { outline: none; border-color: var(--primary, #6366f1); }
    textarea.incident-pf-input { resize: vertical; }

    /* MANUAL FORM */
    .incident-form-body { padding: 16px 20px 20px; }
    .incident-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .incident-fg { display: flex; flex-direction: column; gap: 4px; }
    .incident-fg.incident-fg-full { grid-column: 1 / -1; }
    .incident-fg label { font-size: 12px; font-weight: 500; color: var(--text-muted, #6b7280); }
    .incident-input {
      padding: 8px 10px; border-radius: 6px; font-size: 14px; font-family: inherit;
      border: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-primary, #fff); color: var(--text-primary, #111);
      width: 100%; box-sizing: border-box;
    }
    .incident-input:focus { outline: none; border-color: var(--primary, #6366f1); }
    textarea.incident-input { resize: vertical; }
    .incident-form-footer {
      display: flex; gap: 10px; margin-top: 16px; padding-top: 16px;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    /* BUTTONS */
    .btn-primary {
      background: var(--primary, #6366f1); color: #fff; border: none;
      padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 14px;
      font-weight: 600; transition: opacity .15s;
    }
    .btn-primary:hover { opacity: .85; }
    .btn-secondary {
      background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111); border: none;
      padding: 9px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;
    }
    .btn-secondary:hover { background: var(--bg-hover, #e5e7eb); }
    .btn-ghost {
      background: none; color: var(--text-muted, #6b7280); border: none;
      padding: 9px 14px; border-radius: 8px; cursor: pointer; font-size: 14px;
    }
    .btn-ghost:hover { background: var(--bg-hover, #f3f4f6); }

    @media (max-width: 520px) {
      .incident-mode-cards { grid-template-columns: 1fr; }
      .incident-preview-grid { grid-template-columns: 1fr; }
      .incident-form-grid { grid-template-columns: 1fr; }
      .incident-fg.incident-fg-full { grid-column: unset; }
      .incident-modal { max-width: 100%; border-radius: 12px 12px 0 0; }
      .incident-overlay { align-items: flex-end; padding: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ── backward-compat alias (07-data-loading.js calls loadManualIncidents) ──
window.loadManualIncidents = window.loadIncidentsForJournal;

})();
