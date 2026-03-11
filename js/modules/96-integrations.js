// ============================================================
// 96-integrations.js — TALKO Integrations v1.0
// API ключі, Webhook, Telegram, Zapier/Make
// ============================================================
(function () {
'use strict';

const I = {
    key:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    webhook: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    tg:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    zapier:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    check:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    copy:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    eye:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    save:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    test:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
};

let intg = { settings: null, saving: false };

window.initIntegrationsModule = async function () {
    if (!window.currentCompanyId) return;
    _renderShell();
    await _loadSettings();
    _renderAll();
};

function _renderShell() {
    const c = document.getElementById('integrationsContainer');
    if (!c) return;
    c.innerHTML = `
    <div style="min-height:100%;background:#f4f5f7;padding:1rem;">
        <div style="max-width:680px;margin:0 auto;">
            <div style="margin-bottom:1rem;">
                <div style="font-weight:700;font-size:1rem;color:#111827;">Інтеграції</div>
                <div style="font-size:0.72rem;color:#9ca3af;margin-top:2px;">API ключі, Webhook, Telegram, автоматизації</div>
            </div>
            <div id="intgContent"></div>
        </div>
    </div>`;
}

async function _loadSettings() {
    try {
        const doc = await window.companyRef().get();
        intg.settings = doc.data() || {};
    } catch(e) {
        intg.settings = {};
        console.error('[Integrations]', e);
    }
}

function _renderAll() {
    const c = document.getElementById('intgContent');
    if (!c) return;
    const s = intg.settings || {};

    const inp = 'width:100%;padding:0.45rem 0.6rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.82rem;box-sizing:border-box;font-family:monospace;background:white;';
    const lbl = 'font-size:0.68rem;font-weight:600;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.25rem;letter-spacing:0.03em;';
    const card = 'background:white;border-radius:10px;padding:1.1rem;border:1px solid #e8eaed;margin-bottom:0.75rem;';
    const sTitle = 'display:flex;align-items:center;gap:0.5rem;font-weight:700;font-size:0.88rem;color:#111827;margin-bottom:0.9rem;';
    const badge = (ok) => ok
        ? `<span style="font-size:0.65rem;background:#f0fdf4;color:#16a34a;padding:1px 7px;border-radius:4px;font-weight:600;">${I.check} Підключено</span>`
        : `<span style="font-size:0.65rem;background:#f9fafb;color:#9ca3af;padding:1px 7px;border-radius:4px;">Не налаштовано</span>`;

    c.innerHTML = `

    <!-- AI / Anthropic API -->
    <div style="${card}">
        <div style="${sTitle}">${I.key} Anthropic API (AI функції) ${badge(!!s.anthropicApiKey)}</div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">API Key</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_anthropic" type="password" value="${s.anthropicApiKey||''}"
                    placeholder="sk-ant-api03-..." style="${inp}flex:1;">
                <button onclick="intgToggleVisibility('intg_anthropic')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;"
                    title=window.t('intgToggleVisibility')>${I.eye}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                Для AI аналізу угод у CRM. Отримати: <a href="https://console.anthropic.com" target="_blank" style="color:#22c55e;">console.anthropic.com</a>
            </div>
        </div>
        <button onclick="intgSave('anthropicApiKey','intg_anthropic')"
            style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
            ${I.save} Зберегти
        </button>
    </div>

    <!-- Telegram Bot -->
    <div style="${card}">
        <div style="${sTitle}">${I.tg} Telegram Bot ${badge(!!(s.telegramBotToken || s.botToken))}</div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">Bot Token</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_tgtoken" type="password" value="${s.telegramBotToken||s.botToken||''}"
                    placeholder="1234567890:AAF..." style="${inp}flex:1;">
                <button onclick="intgToggleVisibility('intg_tgtoken')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">Chat ID менеджера (для сповіщень)</label>
            <input id="intg_tgchat" type="text" value="${s.managerChatId||''}"
                placeholder="-1001234567890" style="${inp}font-family:monospace;">
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                Отримати Chat ID: напиши боту @userinfobot
            </div>
        </div>
        <div style="display:flex;gap:0.4rem;">
            <button onclick="intgSaveTelegram()"
                style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} Зберегти
            </button>
            <button onclick="intgTestTelegram()"
                style="padding:0.4rem 0.9rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} Тест
            </button>
        </div>
    </div>

    <!-- Webhook / Ліди з лендингів -->
    <div style="${card}">
        <div style="${sTitle}">${I.webhook} Ліди з лендингів → CRM ${badge(!!(s.webhookApiKey))}</div>

        <!-- API Key -->
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">API Key (для підключення форм)</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_apikey" type="password" value="${s.webhookApiKey||''}"
                    placeholder="Згенеруйте ключ →" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_apikey')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
                <button onclick="intgGenerateApiKey()"
                    style="padding:0.45rem 0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;color:#16a34a;font-size:0.72rem;font-weight:600;white-space:nowrap;">
                    Згенерувати
                </button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                Цей ключ вставляється у форму на лендингу. Зберігайте в таємниці.
            </div>
        </div>

        <!-- Endpoint URL -->
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">Endpoint URL</label>
            <div style="display:flex;gap:0.4rem;">
                <input readonly
                    value="https://europe-west1-task-manager-44e84.cloudfunctions.net/leadWebhook"
                    style="${inp}flex:1;background:#f9fafb;cursor:pointer;font-size:0.75rem;"
                    onclick="this.select()">
                <button onclick="intgCopy('https://europe-west1-task-manager-44e84.cloudfunctions.net/leadWebhook')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.copy}</button>
            </div>
        </div>

        <!-- Зберегти ключ -->
        <button onclick="intgSave('webhookApiKey','intg_apikey')"
            style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;margin-bottom:1rem;">
            ${I.save} Зберегти ключ
        </button>

        <!-- Готовий код форми -->
        <div style="border-top:1px solid #f1f5f9;padding-top:0.85rem;">
            <div style="font-size:0.72rem;font-weight:700;color:#374151;margin-bottom:0.5rem;">Готовий код для лендингу</div>
            <div style="position:relative;">
                <pre id="intg_form_code" style="background:#1e1e2e;color:#cdd6f4;border-radius:8px;padding:0.85rem 1rem;font-size:0.68rem;overflow-x:auto;margin:0;line-height:1.6;">&lt;form id="talko-lead-form"&gt;
  &lt;input name="name" placeholder="Ваше ім'я" required&gt;
  &lt;input name="phone" placeholder="Телефон" required&gt;
  &lt;input name="email" placeholder="Email"&gt;
  &lt;textarea name="message" placeholder="Повідомлення"&gt;&lt;/textarea&gt;
  &lt;button type="submit"&gt;Відправити&lt;/button&gt;
&lt;/form&gt;

&lt;script&gt;
document.getElementById('talko-lead-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this));
  await fetch('https://europe-west1-task-manager-44e84.cloudfunctions.net/leadWebhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: '${window.currentCompanyId||"YOUR_COMPANY_ID"}',
      apiKey:    '${s.webhookApiKey||"YOUR_API_KEY"}',
      source:    'Сайт',
      ...data
    })
  });
  alert('Дякуємо! Ми зв\'яжемося з вами найближчим часом.');
  this.reset();
});
&lt;/script&gt;</pre>
                <button onclick="intgCopyFormCode()"
                    style="position:absolute;top:0.5rem;right:0.5rem;padding:0.3rem 0.6rem;
                    background:#313244;border:1px solid #45475a;border-radius:5px;
                    cursor:pointer;color:#cdd6f4;font-size:0.68rem;display:flex;align-items:center;gap:4px;">
                    ${I.copy} Копіювати
                </button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.5rem;line-height:1.5;">
                Вставте на лендинг. Ліди автоматично потраплять в CRM і створиться завдання для менеджера.
            </div>
        </div>
    </div>

    <!-- Zapier / Make -->
    <div style="${card}">
        <div style="${sTitle}">${I.zapier} Zapier / Make (автоматизації)</div>
        <div style="font-size:0.8rem;color:#374151;margin-bottom:0.75rem;line-height:1.5;">
            Підключи TALKO до 5000+ сервісів через Webhook тригери.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">
            ${[
                ['Zapier','https://zapier.com/apps/webhook','#ff4a00'],
                ['Make (Integromat)','https://make.com','#6c3fdf'],
            ].map(([name, url, color]) => `
            <a href="${url}" target="_blank"
                style="padding:0.65rem 0.75rem;border:1px solid #e8eaed;border-radius:8px;
                text-decoration:none;display:flex;align-items:center;gap:0.5rem;
                font-size:0.8rem;font-weight:600;color:${color};background:white;">
                ${I.zapier}
                ${name}
            </a>`).join('')}
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:0.75rem;font-size:0.78rem;color:#92400e;">
            <strong>Як підключити:</strong> У Zapier/Make вибери тригер "Webhooks by Zapier" → вкажи URL вище → TALKO надсилатиме події автоматично.
        </div>
    </div>

    <!-- Google Sheets -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Google Sheets ${badge(!!s.googleSheetsUrl)}
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">URL таблиці (Apps Script endpoint)</label>
            <input id="intg_sheets" type="text" value="${s.googleSheetsUrl||''}"
                placeholder="https://script.google.com/macros/s/..." style="${inp}">
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                Нові ліди автоматично додаються в таблицю
            </div>
        </div>
        <button onclick="intgSave('googleSheetsUrl','intg_sheets',false)"
            style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
            ${I.save} Зберегти
        </button>
    </div>`;
}

// ── Actions ────────────────────────────────────────────────
window.intgToggleVisibility = function(inputId) {
    const el = document.getElementById(inputId);
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
};

window.intgCopy = function(text) {
    navigator.clipboard?.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast(window.t('botsCopied'), 'success');
    });
};

window.intgCopyFormCode = function() {
    const el = document.getElementById('intg_form_code');
    if (!el) return;
    // Copy visible text (HTML entities decoded)
    const text = el.innerText || el.textContent;
    navigator.clipboard?.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast(window.t('botsCopied'), 'success');
    });
};

window.intgGenerateApiKey = async function() {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    const key = 'talko_' + Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('').slice(0,32);
    const inp = document.getElementById('intg_apikey');
    if (inp) {
        inp.value = key;
        inp.type = 'text';
        setTimeout(() => { if (inp) inp.type = 'password'; }, 3000);
    }
    if (typeof showToast === 'function') showToast('Ключ згенеровано — натисніть «Зберегти»', 'info');
};



window.intgSave = async function(field, inputId, isSecret = true) {
    const val = document.getElementById(inputId)?.value.trim();
    if (!val) { if (typeof showToast === 'function') showToast(window.t('botsEnterValue'), 'error'); return; }
    try {
        await window.companyRef()
            .update({ [field]: val, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        intg.settings[field] = val;
        if (typeof showToast === 'function') showToast(window.t('savedOk'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.intgSaveTelegram = async function() {
    const token  = document.getElementById('intg_tgtoken')?.value.trim();
    const chatId = document.getElementById('intg_tgchat')?.value.trim();
    if (!token) { if (typeof showToast === 'function') showToast(window.t('intgBotToken'), 'error'); return; }
    try {
        await window.companyRef()
            .update({
                telegramBotToken: token,
                managerChatId: chatId || '',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        intg.settings.telegramBotToken = token;
        intg.settings.managerChatId    = chatId;
        if (typeof showToast === 'function') showToast(window.t('botsTgSaved'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.intgTestTelegram = async function() {
    const token  = document.getElementById('intg_tgtoken')?.value.trim() || intg.settings?.telegramBotToken;
    const chatId = document.getElementById('intg_tgchat')?.value.trim()  || intg.settings?.managerChatId;
    if (!token || !chatId) {
        if (typeof showToast === 'function') showToast(window.t('botsFilledRequired'), 'error');
        return;
    }
    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ chat_id: chatId, text: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span> TALKO: тестове повідомлення. Інтеграція працює!' }),
        });
        const data = await res.json();
        if (data.ok) {
            if (typeof showToast === 'function') showToast(window.t('botsMsgSent'), 'success');
        } else {
            if (typeof showToast === 'function') showToast(window.t('botsTgError') + data.description, 'error');
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ── Tab hook ───────────────────────────────────────────────

function _registerTab(tabName, fn) {
    if (window.onSwitchTab) {
        window.onSwitchTab(tabName, fn);
    } else {
        var t = 0;
        var iv = setInterval(function() {
            if (window.onSwitchTab) { window.onSwitchTab(tabName, fn); clearInterval(iv); }
            else if (++t > 30) clearInterval(iv);
        }, 100);
    }
}
_registerTab('integrations', function() { window.initIntegrationsModule(); });

    // ── Register in TALKO namespace ──────────────────────────
    if (window.TALKO) {
        window.TALKO.intg = {
            init: window.initIntegrationsModule,
            save: window.intgSave,
            saveTelegram: window.intgSaveTelegram,
            testTelegram: window.intgTestTelegram,
            copy: window.intgCopy,
        };
    }

})();
