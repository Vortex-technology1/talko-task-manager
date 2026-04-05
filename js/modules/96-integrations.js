// ============================================================
// 96-integrations.js — TALKO Integrations v1.0
// API ключі, Webhook, Telegram, Zapier/Make
// ============================================================
(function () {
'use strict';
var _tg = function(ua,ru){return window.currentLang==='ru'?ru:ua;};

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

// ── Base webhook URL ────────────────────────────────────
const _TALKO_BASE_URL = (typeof window !== 'undefined' && window.location?.hostname !== 'localhost')
    ? 'https://apptalko.com'
    : 'http://localhost:3000';

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
        <div style="max-width:100%;padding:0 0.5rem;">
            <div style="margin-bottom:1rem;">
                <div style="font-weight:700;font-size:1rem;color:#111827;">${window.t('intgTitle2')}</div>
                <div style="font-size:0.72rem;color:#9ca3af;margin-top:2px;">${window.t('intgSubtitle')}</div>
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
    const card = 'border-bottom:1px solid #f1f5f9;padding:0.9rem 1rem;';
    const sTitle = 'display:flex;align-items:center;gap:0.5rem;font-weight:700;font-size:0.88rem;color:#111827;margin-bottom:0.75rem;';
    const badge = (ok) => ok
        ? `<span style="font-size:0.65rem;background:#f0fdf4;color:#16a34a;padding:1px 7px;border-radius:4px;font-weight:600;">${I.check} ${window.t('intgConfigured2')}</span>`
        : `<span style="font-size:0.65rem;background:#f9fafb;color:#9ca3af;padding:1px 7px;border-radius:4px;">${window.t('intgNotConfigured2')}</span>`;

    c.style.cssText = 'display:flex;flex-direction:column;gap:0;border:1px solid #e8eaed;border-radius:12px;overflow:hidden;background:white;';
    c.innerHTML = `

    <!-- AI / Anthropic API -->
    <div style="${card}">
        <div style="${sTitle}">${I.key} ${_tg('Anthropic API (AI функції)','Anthropic API (AI функции)')} ${badge(!!s.anthropicApiKey)}</div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">API Key</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_anthropic" type="password" value="${s.anthropicApiKey||''}"
                    placeholder="sk-ant-api03-..." style="${inp}flex:1;">
                <button onclick="intgToggleVisibility('intg_anthropic')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;"
                    title=${window.t('intgToggleVisibility')}>${I.eye}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                Для AI аналізу угод у CRM. Отримати: <a href="https://console.anthropic.com" target="_blank" style="color:#22c55e;">console.anthropic.com</a>
            </div>
        </div>
        <button onclick="intgSave('anthropicApiKey','intg_anthropic')"
            style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
            ${I.save} ${_tg('Зберегти','Сохранить')}
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
            <label style="${lbl}">${_tg('Chat ID менеджера (для сповіщень)','Chat ID менеджера (для уведомлений)')}</label>
            <input id="intg_tgchat" type="text" value="${s.managerChatId||''}"
                placeholder="-1001234567890" style="${inp}font-family:monospace;">
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                ${_tg('Отримати Chat ID: напиши боту @userinfobot','Получить Chat ID: напиши боту @userinfobot')}
            </div>
        </div>
        <div style="display:flex;gap:0.4rem;">
            <button onclick="intgSaveTelegram()"
                style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${_tg('Зберегти','Сохранить')}
            </button>
            <button onclick="intgTestTelegram()"
                style="padding:0.4rem 0.9rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} ${_tg('Тест','Тест')}
            </button>
        </div>
    </div>

    <!-- WhatsApp Business API -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color:#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18a7.96 7.96 0 0 1-4.073-1.114l-.292-.174-3.012.79.803-2.927-.19-.3A7.96 7.96 0 0 1 4 12c0-4.411 3.588-8 8-8s8 3.589 8 8-3.589 8-8 8z/></svg>
            WhatsApp Business API ${badge(!!(s.whatsappApiKey))}
        </div>
        <div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.6rem;">
            Провайдер: <a href="https://www.360dialog.com" target="_blank" style="color:#25d366;font-weight:600;">360dialog</a> — рекомендовано для Чехії та ЄС. Автоматичні сповіщення клієнтам при зміні статусу замовлення.
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">360dialog API Key</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_wapikey" type="password" value="${s.whatsappApiKey||''}"
                    placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_wapikey')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                Отримати ключ: <a href="https://hub.360dialog.com" target="_blank" style="color:#25d366;">hub.360dialog.com</a> → API Keys
            </div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">${_tg('Номер WhatsApp Business','Номер WhatsApp Business')}</label>
            <input id="intg_waphone" type="text" value="${s.whatsappPhone||''}"
                placeholder="+420123456789" style="${inp}">
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                ${_tg('Номер який підключено у 360dialog (з кодом країни)','Номер подключённый в 360dialog (с кодом страны)')}
            </div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">${_tg('Автосповіщення клієнтам','Авто-уведомления клиентам')}</label>
            <div style="font-size:0.72rem;color:#6b7280;background:#f8fafc;border-radius:6px;padding:0.5rem 0.65rem;border:1px solid #e8eaed;">
                ${_tg('✓ Підтвердження заміру → клієнт отримує дату і імʼя замірника','✓ Подтверждение замера → клиент получает дату и имя замерщика')}<br>
                ✓ КП погоджено → рахунок на передоплату<br>
                ${_tg('✓ Передоплата отримана → старт виробництва','✓ Предоплата получена → старт производства')}<br>
                ${_tg('✓ Монтаж призначено → дата і імʼя майстра','✓ Монтаж назначен → дата и имя мастера')}<br>
                ${_tg('✓ Монтаж завершено → залишок до оплати','✓ Монтаж завершён → остаток к оплате')}<br>
                ${_tg('✓ +180 днів → нагадування про чищення штор','✓ +180 дней → напоминание о чистке штор')}
            </div>
        </div>
        <div style="display:flex;gap:0.4rem;">
            <button onclick="intgSaveWhatsApp()"
                style="padding:0.4rem 1rem;background:#25d366;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${_tg('Зберегти','Сохранить')}
            </button>
            <button onclick="intgTestWhatsApp()"
                style="padding:0.4rem 0.9rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} ${_tg('Тест','Тест')}
            </button>
        </div>
    </div>

    <!-- Viber Bot -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Viber Bot ${badge(!!s.viberBotToken)}\n        </div>\n        <div style=\"margin-bottom:0.6rem;\">\n            <label style=\"${lbl}\">Bot Token</label>\n            <div style=\"display:flex;gap:0.4rem;\">\n                <input id=\"intg_vibertoken\" type=\"password\" value=\"${s.viberBotToken||''}\"\n                    placeholder=\"xxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx\" style=\"${inp}flex:1;font-family:monospace;\">\n                <button onclick=\"intgToggleVisibility('intg_vibertoken')\"\n                    style=\"padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;\">${I.eye}</button>\n            </div>\n            <div style=\"font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;\">\n                Отримати token: <a href=\"https://partners.viber.com\" target=\"_blank\" style=\"color:#7c3aed;\">partners.viber.com</a> → Create bot\n            </div>\n        </div>\n        <div style=\"margin-bottom:0.75rem;\">\n            <label style=\"${lbl}\">ID чату менеджера (для сповіщень)</label>\n            <input id=\"intg_viberchat\" type=\"text\" value=\"${s.viberManagerId||''}\"\n                placeholder=\"+380XXXXXXXXX або user_id\" style=\"${inp}\">\n            <div style=\"font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;\">\n                Отримати ID: напишіть боту будь-що — він відповість з вашим Viber ID\n            </div>\n        </div>\n        <div style=\"margin-bottom:0.75rem;\">\n            <label style=\"${lbl}\">Webhook URL (встановіть у Viber)</label>\n            <div style=\"display:flex;gap:0.4rem;\">\n                <input type=\"text\" readonly\n                    value=\"https://apptalko.com/api/webhook?channel=viber&cid=${window.currentCompanyId||''}\"\n                    style=\"${inp}flex:1;color:#6b7280;font-size:0.72rem;font-family:monospace;\">\n                <button onclick=\"intgCopy('https://apptalko.com/api/webhook?channel=viber&cid=${window.currentCompanyId||''}')\"  \n                    style=\"padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;\">${I.copy}</button>\n            </div>\n        </div>\n        <div style=\"display:flex;gap:0.4rem;\">\n            <button onclick=\"intgSaveViber()\"\n                style=\"padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;\">\n                ${I.save} Зберегти\n            </button>\n            <button onclick=\"intgTestViber()\"\n                style=\"padding:0.4rem 0.9rem;background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;\">\n                ${I.test} Тест\n            </button>\n            <button onclick=\"intgSetViberWebhook()\"\n                style=\"padding:0.4rem 0.9rem;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;\">\n                ${I.webhook} Підключити webhook\n            </button>\n        </div>\n    </div>\n\n    <!-- Webhook / Ліди з лендингів -->
    <div style="${card}">
        <div style="${sTitle}">${I.webhook} ${_tg('Ліди з лендингів → CRM','Лиды с лендингов → CRM')} ${badge(!!(s.webhookApiKey))}</div>

        <!-- API Key -->
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">${_tg('API Key (для підключення форм)','API Key (для подключения форм)')}</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_apikey" type="password" value="${s.webhookApiKey||''}"
                    placeholder="${_tg('Згенеруйте ключ →','Сгенерируйте ключ →')}" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_apikey')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
                <button onclick="intgGenerateApiKey()"
                    style="padding:0.45rem 0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;cursor:pointer;color:#16a34a;font-size:0.72rem;font-weight:600;white-space:nowrap;">
                    ${_tg('Згенерувати','Сгенерировать')}
                </button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                ${_tg('Цей ключ вставляється у форму на лендингу. Зберігайте в таємниці.','Этот ключ вставляется в форму на лендинге. Храните в тайне.')}
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
            ${I.save} ${_tg('Зберегти ключ','Сохранить ключ')}
        </button>

        <!-- Готовий код форми -->
        <div style="border-top:1px solid #f1f5f9;padding-top:0.85rem;">
            <div style="font-size:0.72rem;font-weight:700;color:#374151;margin-bottom:0.5rem;">${_tg('Готовий код для лендингу','Готовый код для лендинга')}</div>
            <div style="position:relative;">
                <pre id="intg_form_code" style="background:#1e1e2e;color:#cdd6f4;border-radius:8px;padding:0.85rem 1rem;font-size:0.68rem;overflow-x:auto;margin:0;line-height:1.6;">&lt;form id="talko-lead-form"&gt;
  &lt;input name="name" placeholder=${window.t('yourNamePh')} required&gt;
  &lt;input name="phone" placeholder=${window.t('crmColPhone')} required&gt;
  &lt;input name="email" placeholder="Email"&gt;
  &lt;textarea name="message" placeholder=${window.t('crmMessage')}&gt;&lt;/textarea&gt;
  &lt;button type="submit"&gt;${_tg('Відправити','Отправить')}&lt;/button&gt;
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
      source:    _tg('Сайт','Сайт'),
      ...data
    })
  });
  if (typeof showToast === 'function') showToast('Дякуємо! Ми зв\'яжемося з вами найближчим часом.', 'error'); else console.error('Дякуємо! Ми зв\'яжемося з вами найближчим часом.');
  this.reset();
});
&lt;/script&gt;</pre>
                <button onclick="intgCopyFormCode()"
                    style="position:absolute;top:0.5rem;right:0.5rem;padding:0.3rem 0.6rem;
                    background:#313244;border:1px solid #45475a;border-radius:5px;
                    cursor:pointer;color:#cdd6f4;font-size:0.68rem;display:flex;align-items:center;gap:4px;">
                    ${I.copy} ${_tg('Копіювати','Копировать')}
                </button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.5rem;line-height:1.5;">
                ${_tg('Вставте на лендинг. Ліди автоматично потраплять в CRM і створиться завдання для менеджера.','Вставьте на лендинг. Лиды автоматически попадут в CRM и создастся задание для менеджера.')}
            </div>
        </div>
    </div>

    <!-- Nova Poshta -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            ${_tg('Нова Пошта','Новая Почта')} ${badge(!!s.novaPoshtaApiKey)}
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">API ключ</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_np_key" type="password" value="${s.novaPoshtaApiKey||''}"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_np_key')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                Отримати: <a href="https://my.novaposhta.ua/settings/index#apikeys" target="_blank" style="color:#e30613;">my.novaposhta.ua</a> → Налаштування → API
            </div>
        </div>
        <div style="display:flex;gap:0.4rem;margin-bottom:0.75rem;">
            <button onclick="intgSaveNP()"
                style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${_tg('Зберегти','Сохранить')}
            </button>
            <button onclick="intgTestNP()"
                style="padding:0.4rem 0.9rem;background:#fef2f2;color:#e30613;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} ${_tg('Тест','Тест')}
            </button>
        </div>
        ${s.novaPoshtaApiKey ? `
        <div style="background:#f8fafc;border:1px solid #e8eaed;border-radius:8px;padding:0.6rem 0.75rem;">
            <div style="font-size:0.72rem;font-weight:600;color:#374151;margin-bottom:0.4rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:middle"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Перевірити ТТН</div>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_np_ttn" type="text" placeholder="59000000000000"
                    style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgTrackNP()"
                    style="padding:0.35rem 0.75rem;background:#e30613;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;white-space:nowrap;">
                    ${_tg('Відстежити','Отследить')}
                </button>
            </div>
            <div id="intg_np_result" style="margin-top:0.5rem;display:none;font-size:0.78rem;line-height:1.5;"></div>
        </div>` : ''}
    </div>

    <!-- Monobank / LiqPay -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            ${_tg('Оплата (Monobank / LiqPay)','Оплата (Monobank / LiqPay)')} ${badge(!!(s.monobankToken || s.liqpayPublicKey))}
        </div>

        <!-- Monobank -->
        <div style="margin-bottom:0.75rem;">
            <div style="font-size:0.72rem;font-weight:700;color:#374151;margin-bottom:0.35rem;">🏦 Monobank</div>
            <label style="${lbl}">X-Token</label>
            <div style="display:flex;gap:0.4rem;margin-bottom:0.35rem;">
                <input id="intg_mono_token" type="password" value="${s.monobankToken||''}"
                    placeholder="uqvH..." style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_mono_token')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;">
                <a href="https://api.monobank.ua" target="_blank" style="color:#1f3950;">api.monobank.ua</a> → Отримати токен
            </div>
        </div>

        <!-- LiqPay -->
        <div style="margin-bottom:0.75rem;padding-top:0.75rem;border-top:1px solid #f1f5f9;">
            <div style="font-size:0.72rem;font-weight:700;color:#374151;margin-bottom:0.35rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> LiqPay</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin-bottom:0.35rem;">
                <div>
                    <label style="${lbl}">Public Key</label>
                    <input id="intg_liqpay_pub" type="text" value="${s.liqpayPublicKey||''}"
                        placeholder="sandbox_..." style="${inp}font-family:monospace;">
                </div>
                <div>
                    <label style="${lbl}">Private Key</label>
                    <div style="display:flex;gap:0.25rem;">
                        <input id="intg_liqpay_priv" type="password" value="${s.liqpayPrivateKey||''}"
                            placeholder="sandbox_..." style="${inp}flex:1;font-family:monospace;">
                        <button onclick="intgToggleVisibility('intg_liqpay_priv')"
                            style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
                    </div>
                </div>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;">
                <a href="https://www.liqpay.ua/uk/registration" target="_blank" style="color:#009e3c;">liqpay.ua</a> → Мій бізнес → Ключі
            </div>
        </div>

        <button onclick="intgSavePayments()"
            style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
            ${I.save} ${_tg('Зберегти','Сохранить')}
        </button>
    </div>

    <!-- Zapier / Make -->
    <div style="${card}">
        <div style="${sTitle}">${I.zapier} ${_tg('Zapier / Make (автоматизації)','Zapier / Make (автоматизации)')}</div>
        <div style="font-size:0.8rem;color:#374151;margin-bottom:0.75rem;line-height:1.5;">
            ${_tg('Підключи TALKO до 5000+ сервісів через Webhook тригери.','Подключи TALKO к 5000+ сервисам через Webhook триггеры.')}
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

    <!-- Facebook Lead Ads -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            Facebook Lead Ads ${badge(!!(s.fbPageAccessToken && s.fbPageId))}
        </div>
        <div style="font-size:0.78rem;color:#374151;margin-bottom:0.75rem;line-height:1.5;">
            ${_tg('Нові ліди з Facebook форм автоматично потрапляють у CRM як угоди.','Новые лиды из Facebook форм автоматически попадают в CRM как сделки.')}
        </div>

        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">Page Access Token</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_fb_token" type="password" value="${s.fbPageAccessToken||''}"
                    placeholder="EAAxxxxx..." style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_fb_token')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">Page ID</label>
            <input id="intg_fb_pageid" type="text" value="${s.fbPageId||''}"
                placeholder="123456789012345" style="${inp}font-family:monospace;">
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">Verify Token (придумай будь-який рядок)</label>
            <input id="intg_fb_verify" type="text" value="${s.fbVerifyToken||''}"
                placeholder="my_verify_token_123" style="${inp}">
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:0.65rem 0.75rem;margin-bottom:0.75rem;font-size:0.75rem;color:#1e40af;line-height:1.6;">
            <strong>Як підключити:</strong><br>
            1. Збережи токени нижче<br>
            2. У Meta for Developers → Webhooks → Page → підпишись на <code>leadgen</code><br>
            3. Callback URL: <code style="background:#dbeafe;padding:1px 4px;border-radius:3px;">https://apptalko.com/api/webhook?channel=facebook&cid=${window.currentCompanyId||''}</code><br>
            4. Verify Token: той що вказав вище<br>
            5. Підпишися на свою Facebook сторінку
        </div>
        <div style="display:flex;gap:0.4rem;">
            <button onclick="intgSaveFacebook()"
                style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${_tg('Зберегти','Сохранить')}
            </button>
            <button onclick="intgCopy('https://apptalko.com/api/webhook?channel=facebook&cid=${window.currentCompanyId||''}')"
                style="padding:0.4rem 0.9rem;background:#f0f9ff;color:#0369a1;border:1px solid #bae6fd;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.copy} Webhook URL
            </button>
        </div>
    </div>

    <!-- Google Sheets -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Google Sheets ${badge(!!s.googleSheetsUrl)}
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">${_tg('URL таблиці (Apps Script endpoint)','URL таблицы (Apps Script endpoint)')}</label>
            <input id="intg_sheets" type="text" value="${s.googleSheetsUrl||''}"
                placeholder="https://script.google.com/macros/s/..." style="${inp}">
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">
                ${_tg('Нові ліди автоматично додаються в таблицю','Новые лиды автоматически добавляются в таблицу')}
            </div>
        </div>
        <button onclick="intgSave('googleSheetsUrl','intg_sheets',false)"
            style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
            ${I.save} ${_tg('Зберегти','Сохранить')}
        </button>
    </div>

    <!-- ══════════════════════════════════════════════════
         ${_tg('ТЕЛЕФОНІЯ','ТЕЛЕФОНИЯ')}
    ══════════════════════════════════════════════════ -->

    <!-- Binotel -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
            Binotel ${badge(!!(s.binotelKey && s.binotelSecret))}
        </div>
        <div style="font-size:0.78rem;color:#374151;margin-bottom:0.75rem;line-height:1.5;">
            ${_tg('Вхідні/вихідні дзвінки → автоматичний контакт + угода в CRM. Лог в активностях.','Входящие/исходящие звонки → автоматический контакт + сделка в CRM. Лог в активностях.')}
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">API Key</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_binotel_key" type="password" value="${s.binotelKey||''}"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_binotel_key')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">Binotel кабінет → Налаштування → API → API Key</div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">API Secret</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_binotel_secret" type="password" value="${s.binotelSecret||''}"
                    placeholder="API Secret" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_binotel_secret')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">${_tg('Webhook URL — вставте в Binotel кабінет','Webhook URL — вставьте в кабинет Binotel')}</label>
            <div style="display:flex;gap:0.4rem;">
                <input type="text" readonly
                    value="${window.currentCompanyId ? 'https://apptalko.com/api/webhook?channel=binotel&cid=' + window.currentCompanyId : '(завантаження... відкрийте вкладку повторно)'}"
                    style="${inp}flex:1;color:#6b7280;font-size:0.72rem;font-family:monospace;">
                <button onclick="intgCopy(window.currentCompanyId ? 'https://apptalko.com/api/webhook?channel=binotel&cid=' + window.currentCompanyId : '')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.copy}</button>
            </div>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:0.65rem 0.75rem;margin-bottom:0.75rem;font-size:0.75rem;color:#1e40af;line-height:1.6;">
            <strong>Як підключити:</strong><br>
            1. Binotel кабінет → Налаштування → API → скопіюй Key і Secret<br>
            2. Збережи ключі нижче<br>
            3. Binotel → Налаштування → Webhooks → вставте URL вище<br>
            4. Обери подію: <code>HANGUP</code> (завершення дзвінка)
        </div>
        <div style="display:flex;gap:0.4rem;">
            <button onclick="intgSaveBinotel()"
                style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${_tg('Зберегти','Сохранить')}
            </button>
            <button onclick="intgTestBinotel()"
                style="padding:0.4rem 0.9rem;background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} ${_tg('Тест з\'єднання','Тест соединения')}
            </button>
        </div>
    </div>

    <!-- Ringostat -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
            Ringostat ${badge(!!s.ringostatApiKey)}
        </div>
        <div style="font-size:0.78rem;color:#374151;margin-bottom:0.75rem;line-height:1.5;">
            ${_tg('Вхідні дзвінки → автоматичний контакт + угода в CRM. Аналітика дзвінків в активностях.','Входящие звонки → автоматический контакт + сделка в CRM. Аналитика звонков в активностях.')}
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">API Token</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_ringostat_key" type="password" value="${s.ringostatApiKey||''}"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_ringostat_key')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">app.ringostat.com → Налаштування → Інтеграції → API token</div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">Project ID (необов'язково)</label>
            <input id="intg_ringostat_project" type="text" value="${s.ringostatProjectId||''}"
                placeholder="12345" style="${inp}font-family:monospace;">
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">Webhook URL — вставте в Ringostat</label>
            <div style="display:flex;gap:0.4rem;">
                <input type="text" readonly
                    value="${window.currentCompanyId ? 'https://apptalko.com/api/webhook?channel=ringostat&cid=' + window.currentCompanyId : '(завантаження... відкрийте вкладку повторно)'}"
                    style="${inp}flex:1;color:#6b7280;font-size:0.72rem;font-family:monospace;">
                <button onclick="intgCopy(window.currentCompanyId ? 'https://apptalko.com/api/webhook?channel=ringostat&cid=' + window.currentCompanyId : '')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.copy}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">app.ringostat.com → Налаштування → Callback → Webhook URL</div>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:0.65rem 0.75rem;margin-bottom:0.75rem;font-size:0.75rem;color:#1e40af;line-height:1.6;">
            <strong>Як підключити:</strong><br>
            1. app.ringostat.com → Налаштування → Інтеграції → скопіюй API token<br>
            2. Збережи токен нижче<br>
            3. Налаштування → Callback → вставте Webhook URL вище<br>
            4. Обери події: <code>call_hangup</code>
        </div>
        <div style="display:flex;gap:0.4rem;">
            <button onclick="intgSaveRingostat()"
                style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${_tg('Зберегти','Сохранить')}
            </button>
            <button onclick="intgTestRingostat()"
                style="padding:0.4rem 0.9rem;background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} ${_tg('Тест з\'єднання','Тест соединения')}
            </button>
        </div>
    </div>

    <!-- Stream Telecom -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
            Stream Telecom ${badge(!!(s.streamTelecomLogin && s.streamTelecomPassword))}
        </div>
        <div style="font-size:0.78rem;color:#374151;margin-bottom:0.75rem;line-height:1.5;">
            ${_tg('IP-телефонія Stream Telecom → автоматичний лог дзвінків + контакти в CRM.','IP-телефония Stream Telecom → автоматический лог звонков + контакты в CRM.')}
        </div>
        <div style="margin-bottom:0.6rem;">
            <label style="${lbl}">Login (email)</label>
            <input id="intg_stream_login" type="text" value="${s.streamTelecomLogin||''}"
                placeholder="your@email.com" style="${inp}">
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">my.stream-telecom.ua → Профіль → API доступ</div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">Password / API ключ</label>
            <div style="display:flex;gap:0.4rem;">
                <input id="intg_stream_pass" type="password" value="${s.streamTelecomPassword||''}"
                    placeholder="API ключ або пароль" style="${inp}flex:1;font-family:monospace;">
                <button onclick="intgToggleVisibility('intg_stream_pass')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.eye}</button>
            </div>
        </div>
        <div style="margin-bottom:0.75rem;">
            <label style="${lbl}">Webhook URL — вставте в Stream Telecom</label>
            <div style="display:flex;gap:0.4rem;">
                <input type="text" readonly
                    value="${window.currentCompanyId ? 'https://apptalko.com/api/webhook?channel=stream_telecom&cid=' + window.currentCompanyId : '(завантаження... відкрийте вкладку повторно)'}"
                    style="${inp}flex:1;color:#6b7280;font-size:0.72rem;font-family:monospace;">
                <button onclick="intgCopy(window.currentCompanyId ? 'https://apptalko.com/api/webhook?channel=stream_telecom&cid=' + window.currentCompanyId : '')"
                    style="padding:0.45rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;color:#6b7280;display:flex;align-items:center;">${I.copy}</button>
            </div>
            <div style="font-size:0.69rem;color:#9ca3af;margin-top:0.25rem;">my.stream-telecom.ua → Налаштування → Webhooks → URL дзвінків</div>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:0.65rem 0.75rem;margin-bottom:0.75rem;font-size:0.75rem;color:#1e40af;line-height:1.6;">
            <strong>Як підключити:</strong><br>
            1. my.stream-telecom.ua → Налаштування → API → скопіюй дані доступу<br>
            2. Збережи нижче<br>
            3. Налаштування → Webhooks → вставте URL вище → збережи
        </div>
        <div style="display:flex;gap:0.4rem;">
            <button onclick="intgSaveStreamTelecom()"
                style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${_tg('Зберегти','Сохранить')}
            </button>
            <button onclick="intgTestStreamTelecom()"
                style="padding:0.4rem 0.9rem;background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} ${_tg('Тест з\'єднання','Тест соединения')}
            </button>
        </div>
    </div>
    <!-- Stripe -->
    <div style="${card}">
        <div style="${sTitle}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#635bff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <span style="font-weight:700;font-size:0.85rem;color:#111827">Stripe</span>
            ${badge(!!s.stripeEnabled)}
        </div>
        <div style="margin:0.35rem 0 0.7rem;font-size:0.75rem;color:#6b7280;line-height:1.4">
            ${window.t('stripeIntgDesc')||'Online platby pro faktury, rezervace a CRM. EUR + CZK.'}
            <a href="https://stripe.com" target="_blank" style="color:#635bff;margin-left:4px;">stripe.com ↗</a>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <div>
                <label style="${lbl}">${window.t('stripeSecretKey')||'Secret Key (sk_live_...)'}</label>
                <div style="display:flex;gap:0.4rem;">
                    <input id="intg_stripe_key" type="password"
                        value="${s.stripeSecretKey ? ('••••' + (s.stripeSecretKey || '').slice(-4)) : ''}"
                        placeholder="sk_live_..." style="${inp}flex:1"
                        onfocus="if(this.value.startsWith('\u2022'))this.value=''">
                    <button onclick="intgToggleVisibility('intg_stripe_key')"
                        style="padding:0.4rem 0.6rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;font-size:0.8rem;color:#6b7280;">
                        ${I.eye}
                    </button>
                </div>
            </div>
            <div>
                <label style="${lbl}">${window.t('stripeWebhookSec')||'Webhook Secret (whsec_...)'}</label>
                <div style="display:flex;gap:0.4rem;">
                    <input id="intg_stripe_webhook" type="password"
                        value="${s.stripeWebhookSecret ? ('••••' + (s.stripeWebhookSecret || '').slice(-4)) : ''}"
                        placeholder="whsec_..." style="${inp}flex:1"
                        onfocus="if(this.value.startsWith('\u2022'))this.value=''">
                    <button onclick="intgToggleVisibility('intg_stripe_webhook')"
                        style="padding:0.4rem 0.6rem;background:#f9fafb;border:1px solid #e8eaed;border-radius:6px;cursor:pointer;font-size:0.8rem;color:#6b7280;">
                        ${I.eye}
                    </button>
                </div>
            </div>
            <div style="background:#f0f4ff;border-radius:7px;padding:0.5rem 0.75rem;font-size:0.74rem;color:#4338ca;line-height:1.5">
                <b>${window.t('stripeWebhookUrl')||'Webhook URL (Stripe Dashboard)'}:</b><br>
                <span style="font-family:monospace;word-break:break-all">${window.location.origin}/api/stripe?action=webhook</span>
                <br><span style="color:#6b7280">Event: checkout.session.completed</span>
            </div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap">
            <button onclick="intgSaveStripe()"
                style="padding:0.4rem 0.9rem;background:#635bff;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.save} ${window.t('saveWord')||'Uložit'}
            </button>
            <button onclick="intgTestStripe()"
                style="padding:0.4rem 0.9rem;background:#f5f3ff;color:#635bff;border:1px solid #ddd6fe;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.35rem;">
                ${I.test} ${window.t('testWord')||'Test'}
            </button>
        </div>
    </div>`;
}


// ── Stripe Actions ─────────────────────────────────────────
window.intgSaveStripe = async function() {
    const keyEl  = document.getElementById('intg_stripe_key');
    const whEl   = document.getElementById('intg_stripe_webhook');
    const key    = (keyEl?.value || '').trim();
    const wh     = (whEl?.value || '').trim();
    if (!key && !wh) {
        if (typeof showToast === 'function') showToast(_tg('Введіть ключ Stripe', 'Введите ключ Stripe'), 'warning');
        return;
    }
    try {
        const update = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (key && !key.startsWith('•')) update.stripeSecretKey = key;
        if (wh  && !wh.startsWith('•'))  update.stripeWebhookSecret = wh;
        if (Object.keys(update).length > 1)  update.stripeEnabled = true;
        await window.companyRef().update(update);
        intg.settings = { ...intg.settings, ...update };
        if (typeof showToast === 'function') showToast('Stripe: ' + (window.t('savedOk2')||'збережено'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast((window.t('errPrefix')||'Помилка: ') + e.message, 'error');
    }
};

window.intgTestStripe = async function() {
    const savedKey = intg.settings?.stripeSecretKey;
    const inputKey = document.getElementById('intg_stripe_key')?.value.trim();
    if (!savedKey && (!inputKey || inputKey.startsWith('•'))) {
        if (typeof showToast === 'function') showToast(window.t('stripeSecretKey')||'Введіть Secret Key', 'warning');
        return;
    }
    if (typeof showToast === 'function') showToast(_tg('Перевірка Stripe...', 'Проверка Stripe...'), 'info');
    try {
        const res = await fetch('/api/stripe?action=create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId:   window.currentCompanyId,
                amount:      0.01,
                currency:    'EUR',
                description: 'Stripe connection test',
                successUrl:  window.location.href,
                cancelUrl:   window.location.href,
            }),
        });
        const data = await res.json();
        if (data.url || data.sessionId) {
            if (typeof showToast === 'function') showToast('✅ Stripe ' + (window.t('stripeEnabled')||'підключений'), 'success');
        } else {
            throw new Error(data.error || 'No session URL');
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast('Stripe: ' + e.message, 'error');
    }
};

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
    if (typeof showToast === 'function') showToast(_tg('Ключ згенеровано — натисніть «Зберегти»', 'Ключ сгенерирован — нажмите «Сохранить»'), 'info');
};



window.intgSave = async function(field, inputId, isSecret = true) {
    const val = document.getElementById(inputId)?.value.trim();
    if (!val) { if (typeof showToast === 'function') showToast(window.t('botsEnterValue'), 'error'); return; }
    // Guard against concurrent saves (double-click)
    const lockKey = '_saving_' + field;
    if (window[lockKey]) return;
    window[lockKey] = true;
    try {
        // FIX: Додано await для гарантії завершення update перед оновленням локального стану
        await window.companyRef()
            .update({ [field]: val, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });

        // Оновлюємо локальний стан ТІЛЬКИ після успішного Firestore update
        intg.settings[field] = val;
        if (typeof showToast === 'function') showToast(window.t('savedOk'), 'success');
        _renderAll();
    } catch(e) {
        // При помилці локальний стан не змінюється
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    } finally {
        window[lockKey] = false;
    }
};

// ── Nova Poshta ────────────────────────────────────────────
// ── Facebook Lead Ads ─────────────────────────────────────
window.intgSaveFacebook = async function() {
    const token   = document.getElementById('intg_fb_token')?.value.trim();
    const pageId  = document.getElementById('intg_fb_pageid')?.value.trim();
    const verify  = document.getElementById('intg_fb_verify')?.value.trim();
    if (!token || !pageId) {
        if (typeof showToast === 'function') showToast(_tg('Заповніть Page Access Token і Page ID', 'Заполните Page Access Token и Page ID'), 'error'); return;
    }
    try {
        await window.companyRef().update({
            fbPageAccessToken: token,
            fbPageId:          pageId,
            fbVerifyToken:     verify || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        intg.settings.fbPageAccessToken = token;
        intg.settings.fbPageId          = pageId;
        intg.settings.fbVerifyToken     = verify;
        if (typeof showToast === 'function') showToast(_tg('Facebook Lead Ads збережено', 'Facebook Lead Ads сохранены'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.intgSaveNP = async function() {
    const key = document.getElementById('intg_np_key')?.value.trim();
    if (!key) { if (typeof showToast === 'function') showToast(_tg('Введіть API ключ Нової Пошти', 'Введите API ключ Новой Почты'), 'error'); return; }
    try {
        await window.companyRef().update({
            novaPoshtaApiKey: key,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        intg.settings.novaPoshtaApiKey = key;
        if (typeof showToast === 'function') showToast(_tg('Nova Poshta API збережено', 'Nova Poshta API сохранено'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.intgTestNP = async function() {
    const key = document.getElementById('intg_np_key')?.value.trim() || intg.settings?.novaPoshtaApiKey;
    if (!key) { if (typeof showToast === 'function') showToast(_tg('Введіть API ключ', 'Введите API ключ'), 'error'); return; }
    try {
        const _npCtrl = new AbortController();
        setTimeout(() => _npCtrl.abort(), 10000); // 10s timeout
        const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            signal: _npCtrl.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: key,
                modelName: 'CommonGeneral',
                calledMethod: 'getTimeIntervals',
                methodProperties: { RecipientCityRef: 'db5c88e0-391c-11dd-90d9-001a92567626', DateTime: new Date().toLocaleDateString('uk-UA') },
            }),
        });
        const data = await res.json();
        if (data.success) {
            if (typeof showToast === 'function') showToast(_tg('Nova Poshta API працює', 'Nova Poshta API работает'), 'success');
        } else {
            if (typeof showToast === 'function') showToast(window.t('errPfx2') + (data.errors?.[0] || 'невірний ключ'), 'error');
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.intgTrackNP = async function() {
    const key = intg.settings?.novaPoshtaApiKey;
    const ttn = document.getElementById('intg_np_ttn')?.value.trim();
    const resultEl = document.getElementById('intg_np_result');
    if (!ttn) { if (typeof showToast === 'function') showToast(_tg('Введіть номер ТТН', 'Введите номер ТТН'), 'warning'); return; }
    if (resultEl) { resultEl.style.display = 'block'; resultEl.innerHTML = _tg('Завантаження...', 'Загрузка...'); }
    try {
        const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: key,
                modelName: 'TrackingDocument',
                calledMethod: 'getStatusDocuments',
                methodProperties: { Documents: [{ DocumentNumber: ttn, Phone: '' }] },
            }),
        });
        const data = await res.json();
        if (data.success && data.data?.[0]) {
            const d = data.data[0];
            const statusColor = d.StatusCode === '9' ? '#16a34a' : d.StatusCode === '7' ? '#f59e0b' : '#3b82f6';
            if (resultEl) resultEl.innerHTML = `
                <div style="background:white;border:1px solid #e8eaed;border-radius:6px;padding:0.5rem 0.65rem;">
                    <div style="font-weight:700;color:${statusColor};margin-bottom:0.25rem;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:middle"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>${d.Status || '—'}</div>
                    <div style="color:#374151;">ТТН: <b>${ttn}</b></div>
                    ${d.RecipientFullName ? `<div style="color:#6b7280;">${_tg('Отримувач:','Получатель:')} ${d.RecipientFullName}</div>` : ''}
                    ${d.CityRecipient ? `<div style="color:#6b7280;">${window.t('cityLabel').replace('{V}', d.CityRecipient)}</div>` : ''}
                    ${d.ScheduledDeliveryDate ? `<div style="color:#6b7280;">${_tg('Дата доставки:','Дата доставки:')} ${d.ScheduledDeliveryDate}</div>` : ''}
                    ${d.WarehouseRecipient ? `<div style="color:#6b7280;font-size:0.72rem;">${d.WarehouseRecipient}</div>` : ''}
                </div>`;
        } else {
            if (resultEl) resultEl.innerHTML = `<span style="color:#ef4444;">ТТН не знайдено або помилка API</span>`;
        }
    } catch(e) {
        if (resultEl) resultEl.innerHTML = `<span style="color:#ef4444;">${e.message}</span>`;
    }
};

// ── Nova Poshta пошук ТТН з картки угоди ──────────────────
window.crmTrackNP = async function(ttn) {
    if (!ttn) return;
    const key = (await window.companyRef().get().then(d => d.data()?.novaPoshtaApiKey));
    if (!key) { if (typeof showToast === 'function') showToast(_tg('Nova Poshta API ключ не налаштовано', 'Nova Poshta API ключ не настроен'), 'warning'); return; }
    try {
        const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: key,
                modelName: 'TrackingDocument',
                calledMethod: 'getStatusDocuments',
                methodProperties: { Documents: [{ DocumentNumber: ttn, Phone: '' }] },
            }),
        });
        const data = await res.json();
        if (data.success && data.data?.[0]) {
            const d = data.data[0];
            if (typeof showToast === 'function') showToast(`${ttn}: ${d.Status}`, 'info');
        } else {
            if (typeof showToast === 'function') showToast('ТТН не знайдено', 'warning');
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ── Payments (Monobank / LiqPay) ───────────────────────────
window.intgSavePayments = async function() {
    const mono    = document.getElementById('intg_mono_token')?.value.trim();
    const liqPub  = document.getElementById('intg_liqpay_pub')?.value.trim();
    const liqPriv = document.getElementById('intg_liqpay_priv')?.value.trim();
    if (!mono && !liqPub) {
        if (typeof showToast === 'function') showToast(_tg('Введіть хоча б один ключ', 'Введите хотя бы один ключ'), 'warning'); return;
    }
    try {
        const upd = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (mono)    { upd.monobankToken     = mono;    intg.settings.monobankToken    = mono; }
        if (liqPub)  { upd.liqpayPublicKey   = liqPub;  intg.settings.liqpayPublicKey  = liqPub; }
        if (liqPriv) { upd.liqpayPrivateKey  = liqPriv; intg.settings.liqpayPrivateKey = liqPriv; }
        await window.companyRef().update(upd);
        if (typeof showToast === 'function') showToast(_tg('Платіжні ключі збережено', 'Платёжные ключи сохранены'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ── Генерація Monobank посилання на оплату ─────────────────
window.crmMonoPayLink = async function(amount, description, dealId) {
    const token = intg.settings?.monobankToken;
    if (!token) { if (typeof showToast === 'function') showToast(_tg('Monobank не налаштовано — Інтеграції → Оплата', 'Monobank не настроен — Интеграции → Оплата'), 'warning'); return null; }
    try {
        const res = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
            method: 'POST',
            headers: { 'X-Token': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // копійки
                ccy: 980, // UAH
                merchantPaymInfo: { reference: dealId || '', destination: description || _tg('Оплата','Оплата') },
                redirectUrl: window.location.origin,
                webHookUrl: `https://apptalko.com/api/webhook?channel=monobank&cid=${window.currentCompanyId}`,
            }),
        });
        const data = await res.json();
        if (data.pageUrl) {
            navigator.clipboard?.writeText(data.pageUrl);
            if (typeof showToast === 'function') showToast(_tg('Посилання скопійовано', 'Ссылка скопирована'), 'success');
            return data.pageUrl;
        } else {
            if (typeof showToast === 'function') showToast(window.t('errPfx2') + (data.errText || JSON.stringify(data)), 'error');
            return null;
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
        return null;
    }
};

window.intgSaveViber = async function() {
    const token   = document.getElementById('intg_vibertoken')?.value.trim();
    const manager = document.getElementById('intg_viberchat')?.value.trim();
    if (!token) { if (typeof showToast === 'function') showToast(_tg('Введіть Viber Bot Token', 'Введите Viber Bot Token'), 'error'); return; }
    try {
        await window.companyRef().update({
            viberBotToken:  token,
            viberManagerId: manager || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        intg.settings.viberBotToken  = token;
        intg.settings.viberManagerId = manager;
        if (typeof showToast === 'function') showToast(_tg('Viber Bot збережено', 'Viber Bot сохранён'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.intgTestViber = async function() {
    const token   = document.getElementById('intg_vibertoken')?.value.trim() || intg.settings?.viberBotToken;
    const manager = document.getElementById('intg_viberchat')?.value.trim()  || intg.settings?.viberManagerId;
    if (!token || !manager) {
        if (typeof showToast === 'function') showToast(_tg('Заповніть Token і ID менеджера', 'Заполните Token и ID менеджера'), 'error');
        return;
    }
    try {
        const res = await fetch('https://chatapi.viber.com/pa/send_message', {
            method: 'POST',
            headers: { 'X-Viber-Auth-Token': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                receiver: manager,
                min_api_version: 1,
                sender: { name: 'TALKO CRM' },
                type: 'text',
                text: window.t('viberTestMsg'),
            }),
        });
        const data = await res.json();
        if (data.status === 0) {
            if (typeof showToast === 'function') showToast(_tg('Повідомлення відправлено у Viber', 'Сообщение отправлено в Viber'), 'success');
        } else {
            if (typeof showToast === 'function') showToast('Viber помилка: ' + (data.status_message || data.status), 'error');
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.intgSetViberWebhook = async function() {
    const token = document.getElementById('intg_vibertoken')?.value.trim() || intg.settings?.viberBotToken;
    if (!token) { if (typeof showToast === 'function') showToast(_tg('Спочатку введіть Token', 'Сначала введите Token'), 'error'); return; }
    const webhookUrl = `https://apptalko.com/api/webhook?channel=viber&cid=${window.currentCompanyId||''}`;
    try {
        const res = await fetch('https://chatapi.viber.com/pa/set_webhook', {
            method: 'POST',
            headers: { 'X-Viber-Auth-Token': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: webhookUrl,
                event_types: ['message', 'conversation_started'],
                send_name: true,
            }),
        });
        const data = await res.json();
        if (data.status === 0) {
            if (typeof showToast === 'function') showToast(_tg('Webhook підключено — Viber бот активний', 'Webhook подключён — Viber бот активен'), 'success');
        } else {
            if (typeof showToast === 'function') showToast(_tg('Помилка webhook: ','Ошибка webhook: ') + (data.status_message || data.status), 'error');
        }
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

// ── Binotel ────────────────────────────────────────────────
window.intgSaveBinotel = async function() {
    const key    = document.getElementById('intg_binotel_key')?.value.trim();
    const secret = document.getElementById('intg_binotel_secret')?.value.trim();
    if (!key || !secret) {
        if (typeof showToast === 'function') showToast(_tg('Введіть API Key і Secret', 'Введите API Key и Secret'), 'error'); return;
    }
    try {
        await window.companyRef().update({
            binotelKey:    key,
            binotelSecret: secret,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        intg.settings.binotelKey    = key;
        intg.settings.binotelSecret = secret;
        if (typeof showToast === 'function') showToast(_tg('Binotel збережено', 'Binotel сохранён'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
    }
};

window.intgTestBinotel = async function() {
    // Binotel API не підтримує CORS — пряма перевірка з браузера неможлива.
    // Перевірка відбудеться автоматично при першому реальному дзвінку.
    const key    = document.getElementById('intg_binotel_key')?.value.trim()    || intg.settings?.binotelKey;
    const secret = document.getElementById('intg_binotel_secret')?.value.trim() || intg.settings?.binotelSecret;
    if (!key || !secret) {
        if (typeof showToast === 'function') showToast(_tg('Заповніть Key і Secret', 'Заполните Key и Secret'), 'error'); return;
    }
    // Перевіряємо формат ключів (UUID-подібний)
    const uuidRe = /^[0-9a-f\-]{32,40}$/i;
    if (!uuidRe.test(key)) {
        if (typeof showToast === 'function') showToast(_tg('API Key виглядає невірно — перевірте Binotel кабінет', 'API Key выглядит неверным — проверьте кабинет Binotel'), 'warning'); return;
    }
    if (typeof showToast === 'function') showToast(_tg('Ключі виглядають коректно. Перевірка відбудеться при першому дзвінку', 'Ключи выглядят корректно. Проверка произойдёт при первом звонке'), 'info');
};

// ── Ringostat ──────────────────────────────────────────────
window.intgSaveRingostat = async function() {
    const key     = document.getElementById('intg_ringostat_key')?.value.trim();
    const project = document.getElementById('intg_ringostat_project')?.value.trim();
    if (!key) {
        if (typeof showToast === 'function') showToast(_tg('Введіть API Token', 'Введите API Token'), 'error'); return;
    }
    try {
        await window.companyRef().update({
            ringostatApiKey:    key,
            ringostatProjectId: project || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        intg.settings.ringostatApiKey    = key;
        intg.settings.ringostatProjectId = project;
        if (typeof showToast === 'function') showToast(_tg('Ringostat збережено', 'Ringostat сохранён'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
    }
};

window.intgTestRingostat = async function() {
    // Ringostat API не підтримує CORS — пряма перевірка з браузера неможлива.
    const key = document.getElementById('intg_ringostat_key')?.value.trim() || intg.settings?.ringostatApiKey;
    if (!key) {
        if (typeof showToast === 'function') showToast(_tg('Введіть API Token', 'Введите API Token'), 'error'); return;
    }
    // Мінімальна валідація: токен має бути рядком >= 16 символів
    if (key.length < 16) {
        if (typeof showToast === 'function') showToast(_tg('Токен виглядає занадто коротким — перевірте Ringostat кабінет', 'Токен выглядит слишком коротким — проверьте кабинет Ringostat'), 'warning'); return;
    }
    if (typeof showToast === 'function') showToast(_tg('Токен збережено. Перевірка відбудеться при першому дзвінку', 'Токен сохранён. Проверка произойдёт при первом звонке'), 'info');
};

// ── Stream Telecom ─────────────────────────────────────────
window.intgSaveStreamTelecom = async function() {
    const login = document.getElementById('intg_stream_login')?.value.trim();
    const pass  = document.getElementById('intg_stream_pass')?.value.trim();
    if (!login || !pass) {
        if (typeof showToast === 'function') showToast(_tg('Введіть Login і Password', 'Введите Login и Password'), 'error'); return;
    }
    try {
        await window.companyRef().update({
            streamTelecomLogin:    login,
            streamTelecomPassword: pass,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        intg.settings.streamTelecomLogin    = login;
        intg.settings.streamTelecomPassword = pass;
        if (typeof showToast === 'function') showToast(_tg('Stream Telecom збережено', 'Stream Telecom сохранён'), 'success');
        _renderAll();
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
    }
};

window.intgTestStreamTelecom = async function() {
    const login = document.getElementById('intg_stream_login')?.value.trim()  || intg.settings?.streamTelecomLogin;
    const pass  = document.getElementById('intg_stream_pass')?.value.trim()   || intg.settings?.streamTelecomPassword;
    if (!login || !pass) {
        if (typeof showToast === 'function') showToast(_tg('Заповніть Login і Password', 'Заполните Login и Password'), 'error'); return;
    }
    // Базова валідація email
    if (!login.includes('@')) {
        if (typeof showToast === 'function') showToast(_tg('Login має бути email адресою', 'Login должен быть email адресом'), 'warning'); return;
    }
    if (pass.length < 6) {
        if (typeof showToast === 'function') showToast(_tg('Пароль/ключ занадто короткий', 'Пароль/ключ слишком короткий'), 'warning'); return;
    }
    if (typeof showToast === 'function') showToast(_tg('Дані виглядають коректно. Перевірка відбудеться при першому дзвінку', 'Данные выглядят корректно. Проверка произойдёт при первом звонке'), 'info');
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

    // ══════════════════════════════════════════════════════════
    // WhatsApp Business API (360dialog) — зберегти / тест
    // ══════════════════════════════════════════════════════════
    window.intgSaveWhatsApp = async function() {
        const apiKey = document.getElementById('intg_wapikey')?.value.trim();
        const phone  = document.getElementById('intg_waphone')?.value.trim();
        if (!apiKey) {
            if (typeof showToast === 'function') showToast(_tg('Введіть 360dialog API Key', 'Введите 360dialog API Key'), 'error');
            return;
        }
        try {
            await window.companyRef().collection('settings').doc('integrations').set({
                whatsappApiKey:  apiKey,
                whatsappPhone:   phone || null,
                whatsappUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            if (intg.settings) {
                intg.settings.whatsappApiKey = apiKey;
                intg.settings.whatsappPhone  = phone || null;
            }
            if (typeof showToast === 'function') showToast(_tg('WhatsApp Business збережено ✓', 'WhatsApp Business сохранён ✓'), 'success');
        } catch(e) {
            if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
        }
    };

    window.intgTestWhatsApp = async function() {
        const apiKey = document.getElementById('intg_wapikey')?.value.trim() || intg.settings?.whatsappApiKey;
        const phone  = document.getElementById('intg_waphone')?.value.trim() || intg.settings?.whatsappPhone;
        if (!apiKey || !phone) {
            if (typeof showToast === 'function') showToast(_tg('Заповніть API Key і номер WhatsApp', 'Заполните API Key и номер WhatsApp'), 'error');
            return;
        }
        try {
            const result = await window.waSend(phone, _tg('✅ Тестове повідомлення з платформи Талько. WhatsApp підключено успішно!','✅ Тестовое сообщение с платформы Талько. WhatsApp подключён успешно!'), apiKey);
            if (result.ok) {
                if (typeof showToast === 'function') showToast(_tg('Тест успішний — перевірте WhatsApp', 'Тест успешен — проверьте WhatsApp'), 'success');
            } else {
                if (typeof showToast === 'function') showToast(_tg('Помилка відправки: ', 'Ошибка отправки: ') + (result.error || _tg('невідома', 'неизвестна')), 'error');
            }
        } catch(e) {
            if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
        }
    };

})();
