// ============================================================
// 94-sites-builder.js — TALKO Sites Builder v1.0
// Двоколонний редактор: ліво=панель, право=прев'ю
// ============================================================
(function () {
'use strict';

let sb = {
    siteId:   null,
    site:     null,
    blocks:   [],
    activeBlockIdx: null,
    saving:   false,
    panelTab: 'blocks', // blocks | seo
};

const BLOCK_TYPES = [
    { type:'hero',      icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/><path d="M6.5 8.5 5 12 7 11"/><path d="M17.5 8.5 19 12l-2-1"/></svg></span>', label:'Hero' },
    { type:'benefits',  icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>', label:window.t('sitesBlockBenefits') },
    { type:'services',  icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span>', label:window.t('sitesBlockServices') },
    { type:'reviews',   icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>', label:window.t('sitesBlockReviews') },
    { type:'faq',       icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>', label:'FAQ' },
    { type:'form',      icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>', label:window.t('sitesBlockForm') },
    { type:'team',      icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>', label:window.t('sitesBlockTeam') },
    { type:'prices',    icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>', label:window.t('sitesBlockPrices') },
    { type:'gallery',   icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>', label:'Галерея' },
    { type:'about',     icon:'ℹ️',  label:window.t('sitesBlockAbout') },
    { type:'html',      icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>', label:'HTML блок' },
];

// ── Init ───────────────────────────────────────────────────
window.initSitesBuilder = function (siteId) {
    sb.siteId = siteId;
    sb.activeBlockIdx = null;
    _renderBuilderShell();
    _loadSite();
};

function _renderBuilderShell() {
    const c = document.getElementById('sitesContainer');
    if (!c) return;
    c.innerHTML = `
    <div style="display:flex;flex-direction:column;height:calc(100vh - 100px);">
        <!-- Топ хедер -->
        <div style="display:flex;align-items:center;justify-content:space-between;
            padding:0.5rem 0.75rem;background:white;border-bottom:1.5px solid #f1f5f9;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:0.5rem;">
                <button onclick="window.initSitesModule()"
                    style="padding:0.35rem 0.6rem;background:#f9fafb;border:1px solid #e5e7eb;
                    border-radius:8px;cursor:pointer;font-size:0.8rem;">← Назад</button>
                <span id="sbSiteName" style="font-weight:700;font-size:0.9rem;color:#1a1a1a;"></span>
                <span id="sbStatusBadge" style="font-size:0.65rem;padding:2px 8px;border-radius:8px;"></span>
            </div>
            <div style="display:flex;gap:0.4rem;">
                <button onclick="sbTogglePreview()"
                    style="padding:0.4rem 0.7rem;background:#f1f5f9;border:none;border-radius:8px;
                    cursor:pointer;font-size:0.78rem;" title="Прев'ю"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span> Прев'ю</button>
                <button id="sbPublishBtn" onclick="sbTogglePublish()"
                    style="padding:0.4rem 0.9rem;background:#f1f5f9;border:1px solid #e5e7eb;border-radius:8px;
                    cursor:pointer;font-size:0.78rem;font-weight:600;transition:all .15s;">
                    <span id="sbPublishBtnLabel">Публікувати</span>
                </button>
                <button id="sbSaveBtn" onclick="sbSave()"
                    style="padding:0.4rem 1rem;background:#22c55e;color:white;border:none;
                    border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">
                    💾 Зберегти
                </button>
            </div>
        </div>

        <!-- Двоколонний layout -->
        <div style="display:flex;flex:1;overflow:hidden;">
            <!-- Ліво: панель блоків -->
            <div id="sbPanel" style="width:300px;flex-shrink:0;background:#f9fafb;
                border-right:1.5px solid #f1f5f9;overflow-y:auto;display:flex;flex-direction:column;">

                <!-- Панель табів -->
                <div style="display:flex;border-bottom:1px solid #e5e7eb;background:white;flex-shrink:0;">
                    <button onclick="sbPanelTab('blocks')" id="sbPanelTab_blocks"
                        style="flex:1;padding:0.5rem;background:none;border:none;border-bottom:2px solid #22c55e;
                        cursor:pointer;font-size:0.75rem;font-weight:600;color:#22c55e;">Блоки</button>
                    <button onclick="sbPanelTab('seo')" id="sbPanelTab_seo"
                        style="flex:1;padding:0.5rem;background:none;border:none;border-bottom:2px solid transparent;
                        cursor:pointer;font-size:0.75rem;font-weight:500;color:#6b7280;">SEO</button>
                    <button onclick="sbPanelTab('code')" id="sbPanelTab_code"
                        style="flex:1;padding:0.5rem;background:none;border:none;border-bottom:2px solid transparent;
                        cursor:pointer;font-size:0.75rem;font-weight:500;color:#6b7280;">
                        <span style="display:inline-flex;align-items:center;gap:3px;vertical-align:middle;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            Код
                        </span>
                    </button>
                </div>

                <!-- Панель блоків (blocks tab) -->
                <div id="sbPanelBlocks" style="display:flex;flex-direction:column;flex:1;">

                <!-- Бібліотека блоків -->
                <div style="padding:0.6rem 0.75rem;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.4rem;">
                        Додати блок
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
                        ${BLOCK_TYPES.map(bt => `
                        <button onclick="sbAddBlock('${bt.type}')"
                            style="padding:0.3rem 0.5rem;background:white;border:1px solid #e5e7eb;
                            border-radius:7px;cursor:pointer;font-size:0.72rem;display:flex;
                            align-items:center;gap:0.25rem;transition:all 0.1s;"
                            onmouseenter="this.style.borderColor='#22c55e';this.style.background='#f0fdf4'"
                            onmouseleave="this.style.borderColor='#e5e7eb';this.style.background='white'">
                            ${bt.icon} ${bt.label}
                        </button>`).join('')}
                    </div>
                </div>

                <!-- Список блоків сайту -->
                <div style="padding:0.6rem 0.75rem;">
                    <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.4rem;">
                        Структура сайту
                    </div>
                    <div id="sbBlockList" style="display:flex;flex-direction:column;gap:0.3rem;"></div>
                </div>

                </div><!-- /sbPanelBlocks -->

                <!-- Редагування блоку -->
                <div id="sbBlockEditor" style="padding:0.75rem;border-top:1.5px solid #e5e7eb;display:none;flex:1;"></div>
            </div>

                <!-- SEO & Analytics panel -->
                <div id="sbPanelSeo" style="display:none;flex-direction:column;flex:1;padding:0.75rem;gap:0.75rem;overflow-y:auto;">
                    <div id="sbSeoContent"></div>
                </div>

                <!-- Code panel -->
                <div id="sbPanelCode" style="display:none;flex-direction:column;flex:1;padding:0.75rem;gap:0.75rem;overflow-y:auto;">
                    <div id="sbCodeContent"></div>
                </div>

            <!-- Право: прев'ю -->
            <div id="sbPreview" style="flex:1;overflow-y:auto;background:#e5e7eb;padding:1rem;">
                <div id="sbPreviewInner"
                    style="max-width:640px;margin:0 auto;background:white;border-radius:12px;
                    overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);min-height:400px;">
                    <div style="text-align:center;padding:3rem;color:#9ca3af;">Завантаження...</div>
                </div>
            </div>
        </div>
    </div>`;
}

async function _loadSite() {
    try {
        const doc = await window.companyRef()
            .collection(window.DB_COLS.SITES).doc(sb.siteId).get();
        if (!doc.exists) { (window.showToast && showToast(window.t('sitesNotFound'),'warning')); window.initSitesModule(); return; }
        sb.site   = { id: doc.id, ...doc.data() };
        sb.blocks = sb.site.blocks || [];
        _updateHeader();
        _renderBlockList();
        _renderPreview();
    } catch(e) {
        console.error('[Builder]', e);
        if (typeof showToast === 'function') showToast(window.t('intgLoadError') + e.message, 'error');
    }
}

function _updateHeader() {
    const nameEl   = document.getElementById('sbSiteName');
    const statusEl = document.getElementById('sbStatusBadge');
    if (nameEl)   nameEl.textContent = sb.site.name || window.t('botsNoTitle');
    if (statusEl) {
        const pub = sb.site.status === 'published';
        statusEl.textContent = pub ? window.t('sitesPublishedBadge') : window.t('sitesDraftBadge');
        statusEl.style.background = pub ? '#dcfce7' : '#f3f4f6';
        statusEl.style.color = pub ? '#16a34a' : '#6b7280';
        if (typeof _updatePublishBtn === 'function') _updatePublishBtn();
        statusEl.style.background = pub ? '#f0fdf4' : '#f9fafb';
        statusEl.style.color      = pub ? '#16a34a' : '#9ca3af';
    }
}

// ── Список блоків ──────────────────────────────────────────
function _renderBlockList() {
    const c = document.getElementById('sbBlockList');
    if (!c) return;

    if (!sb.blocks.length) {
        c.innerHTML = '<div style="font-size:0.75rem;color:#9ca3af;text-align:center;padding:0.5rem;">Блоків немає</div>';
        return;
    }

    c.innerHTML = sb.blocks.map((block, i) => {
        const bt   = BLOCK_TYPES.find(b => b.type === block.type) || { icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>', label: block.type };
        const active = i === sb.activeBlockIdx;
        return `
        <div onclick="sbSelectBlock(${i})"
            style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.5rem;
            background:${active ? '#f0fdf4' : 'white'};border:1.5px solid ${active ? '#22c55e' : '#e5e7eb'};
            border-radius:8px;cursor:pointer;transition:all 0.12s;">
            <span style="font-size:0.85rem;">${bt.icon}</span>
            <span style="flex:1;font-size:0.75rem;font-weight:${active ? '700' : '500'};color:#374151;">
                ${bt.label}${block.title ? ' — ' + _esc(block.title).substring(0,20) : ''}
            </span>
            <div style="display:flex;gap:0.2rem;">
                ${i > 0 ? `<button onclick="event.stopPropagation();sbMoveBlock(${i},-1)"
                    style="padding:1px 4px;background:none;border:none;cursor:pointer;font-size:0.7rem;color:#9ca3af;"
                    title=window.t('sitesUp')>↑</button>` : ''}
                ${i < sb.blocks.length-1 ? `<button onclick="event.stopPropagation();sbMoveBlock(${i},1)"
                    style="padding:1px 4px;background:none;border:none;cursor:pointer;font-size:0.7rem;color:#9ca3af;"
                    title=window.t('sitesDown')>↓</button>` : ''}
                <button onclick="event.stopPropagation();sbRemoveBlock(${i})"
                    style="padding:1px 4px;background:none;border:none;cursor:pointer;font-size:0.7rem;color:#ef4444;"
                    title=window.t('crmDelete')>✕</button>
            </div>
        </div>`;
    }).join('');
}

// ── Вибір/редагування блоку ────────────────────────────────
window.sbSelectBlock = function (idx) {
    sb.activeBlockIdx = idx;
    _renderBlockList();
    _renderBlockEditor(idx);
    _renderPreview();
    // Scroll preview до блоку
    const el = document.getElementById('sbPreviewBlock_' + idx);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
};

function _renderBlockEditor(idx) {
    const c = document.getElementById('sbBlockEditor');
    if (!c) return;
    const block = sb.blocks[idx];
    if (!block) { c.style.display = 'none'; return; }
    c.style.display = 'block';
    const bt = BLOCK_TYPES.find(b => b.type === block.type) || { icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>', label: block.type };

    const inp = 'width:100%;padding:0.4rem 0.5rem;border:1.5px solid #e5e7eb;border-radius:7px;font-size:0.78rem;box-sizing:border-box;font-family:inherit;margin-bottom:0.4rem;';

    let fields = '';

    if (block.type === 'hero') {
        fields = `
        <div><label style="${lbl}">Заголовок</label>
        <input value="${_esc(block.title||'')}" oninput="sbUpdateBlock(${idx},'title',this.value)" style="${inp}"></div>
        <div><label style="${lbl}">Підзаголовок</label>
        <input value="${_esc(block.subtitle||'')}" oninput="sbUpdateBlock(${idx},'subtitle',this.value)" style="${inp}"></div>
        <div><label style="${lbl}">Кнопка CTA</label>
        <input value="${_esc(block.cta||'')}" oninput="sbUpdateBlock(${idx},'cta',this.value)" style="${inp}"></div>
        <div><label style="${lbl}">Фон</label>
        <input type="color" value="${block.bgColor||'#0a0f1a'}" oninput="sbUpdateBlock(${idx},'bgColor',this.value)"
            style="width:100%;height:32px;border:none;border-radius:7px;cursor:pointer;margin-bottom:0.4rem;"></div>`;
    } else if (block.type === 'form') {
        fields = `
        <div><label style="${lbl}">Заголовок форми</label>
        <input value="${_esc(block.title||'')}" oninput="sbUpdateBlock(${idx},'title',this.value)" style="${inp}"></div>
        <div><label style="${lbl}">Підзаголовок</label>
        <input value="${_esc(block.subtitle||'')}" oninput="sbUpdateBlock(${idx},'subtitle',this.value)" style="${inp}"></div>
        <div><label style="${lbl}">Поля форми</label>
        <div style="display:flex;flex-direction:column;gap:0.3rem;">
            ${['name','phone','email','message','telegram'].map(f => `
            <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;cursor:pointer;">
                <input type="checkbox" ${(block.fields||[]).includes(f)?'checked':''}
                    onchange="sbToggleFormField(${idx},'${f}',this.checked)"
                    style="width:14px;height:14px;accent-color:#22c55e;">
                ${{name:"Ім'я",phone:window.t('crmPhone'),email:'Email',message:window.t('sitesFormMessage'),telegram:'Telegram'}[f]}
            </label>`).join('')}
        </div></div>
        <div style="margin-top:0.4rem;"><label style="${lbl}">Текст кнопки</label>
        <input value="${_esc(block.cta||window.t('sitesFormSubmit'))}" oninput="sbUpdateBlock(${idx},'cta',this.value)" style="${inp}"></div>`;
    } else if (['benefits','services','reviews','faq','team','prices'].includes(block.type)) {
        fields = `
        <div><label style="${lbl}">Заголовок секції</label>
        <input value="${_esc(block.title||'')}" oninput="sbUpdateBlock(${idx},'title',this.value)" style="${inp}"></div>
        <div style="font-size:0.72rem;color:#6b7280;background:#f9fafb;padding:0.4rem;border-radius:7px;margin-top:0.2rem;">
            Для редагування елементів — натисни на блок у прев'ю
        </div>`;
    } else if (block.type === 'html') {
        fields = `
        <div>
            <label style="${lbl}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-flex;vertical-align:middle;margin-right:3px;"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                HTML код блоку
            </label>
            <textarea rows="12" style="width:100%;padding:0.45rem;border:1.5px solid #8b5cf6;border-radius:7px;font-size:0.72rem;font-family:monospace;box-sizing:border-box;line-height:1.5;resize:vertical;background:#faf5ff;"
                placeholder="<!-- Вставте будь-який HTML сюди -->&#10;<section>&#10;  <h2>Заголовок</h2>&#10;  <p>Текст</p>&#10;</section>"
                oninput="sbUpdateBlock(${idx},'rawHtml',this.value)">${_esc(block.rawHtml||'')}</textarea>
            <div style="font-size:0.68rem;color:#9ca3af;margin-top:4px;line-height:1.4;">
                Вставляється прямо між блоками сторінки.
                Підтримка: iframe, скрипти, будь-який HTML/CSS.
            </div>
        </div>`;
    } else {
        fields = `
        <div><label style="${lbl}">Заголовок</label>
        <input value="${_esc(block.title||'')}" oninput="sbUpdateBlock(${idx},'title',this.value)" style="${inp}"></div>`;
    }

    c.innerHTML = `
    <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;
        margin-bottom:0.6rem;display:flex;align-items:center;gap:0.3rem;">
        ${bt.icon} ${bt.label}
    </div>
    ${fields}`;
}

const lbl = 'font-size:0.67rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.2rem;';

// ── Операції з блоками ─────────────────────────────────────
window.sbUpdateBlock = function (idx, field, value) {
    if (!sb.blocks[idx]) return;
    sb.blocks[idx][field] = value;
    _renderPreview();
};

window.sbToggleFormField = function (idx, field, checked) {
    if (!sb.blocks[idx]) return;
    let fields = [...(sb.blocks[idx].fields || [])];
    if (checked && !fields.includes(field)) fields.push(field);
    if (!checked) fields = fields.filter(f => f !== field);
    sb.blocks[idx].fields = fields;
    _renderPreview();
};

window.sbAddBlock = function (type) {
    const newBlock = _defaultBlock(type, sb.blocks.length);
    sb.blocks.push(newBlock);
    sb.activeBlockIdx = sb.blocks.length - 1;
    _renderBlockList();
    _renderPreview();
    _renderBlockEditor(sb.activeBlockIdx);
    if (typeof showToast === 'function') showToast(window.t('sitesBlockAdded'), 'success');
};

window.sbMoveBlock = function (idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sb.blocks.length) return;
    [sb.blocks[idx], sb.blocks[newIdx]] = [sb.blocks[newIdx], sb.blocks[idx]];
    sb.blocks.forEach((b, i) => b.order = i);
    if (sb.activeBlockIdx === idx) sb.activeBlockIdx = newIdx;
    _renderBlockList();
    _renderPreview();
};

window.sbRemoveBlock = async function (idx) {
    if (!(await (window.showConfirmModal ? showConfirmModal(window.t('sitesDeleteBlock'),{danger:true}) : Promise.resolve(confirm(window.t('sitesDeleteBlock')))))) return;
    sb.blocks.splice(idx, 1);
    if (sb.activeBlockIdx >= sb.blocks.length) sb.activeBlockIdx = sb.blocks.length - 1;
    _renderBlockList();
    _renderPreview();
    _renderBlockEditor(sb.activeBlockIdx);
};

function _defaultBlock(type, order) {
    const defaults = {
        hero:     { type:'hero',     order, title:window.t('sitesHeaderTitle'), subtitle:window.t('sitesMainBenefit'), cta:window.t('sitesFormSubmitAlt'), bgColor:'#0a0f1a', textColor:'#ffffff' },
        benefits: { type:'benefits', order, title:window.t('sitesOurBenefits'), items:[{icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>',title:'Перевага 1',text:'Опис'},{icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>',title:'Перевага 2',text:'Опис'},{icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg></span>',title:'Перевага 3',text:'Опис'}]},
        services: { type:'services', order, title:window.t('sitesBlockServices'), items:[{title:window.t('sitesService1'),price:window.t('sitesPrice1'),text:'Опис'},{title:window.t('sitesService2'),price:window.t('sitesPrice2'),text:'Опис'}]},
        reviews:  { type:'reviews',  order, title:window.t('sitesBlockReviews'), items:[{name:window.t('sitesClient1'),rating:5,text:window.t('sitesReview4')},{name:window.t('sitesClient2'),rating:5,text:window.t('sitesReview2')}]},
        faq:      { type:'faq',      order, title:'Питання та відповіді', items:[{question:window.t('sitesQuestion1'),answer:window.t('sitesAns1')},{question:window.t('sitesQuestion2'),answer:window.t('sitesAns2')}]},
        form:     { type:'form',     order, title:window.t('sitesFormSubmitAlt'), subtitle:'Зв\'яжемося за 15 хвилин', fields:['name','phone'], cta:window.t('sitesFormSubmit') },
        team:     { type:'team',     order, title:window.t('sitesBlockTeam'), items:[{name:window.t('sitesSpecialist1'),role:window.t('botsPosition'),photo:''}]},
        prices:   { type:'prices',   order, title:window.t('sitesBlockPrices'), items:[{title:'Базовий',price:window.t('sitesPrice4'),features:[window.t('sitesOption1'),window.t('sitesOption2')]}]},
        gallery:  { type:'gallery',  order, title:window.t('sitesOurWorks'), items:[]},
        about:    { type:'about',    order, title:window.t('sitesBlockAbout'), text:window.t('sitesAboutPh'), photo:''},
        html:     { type:'html',     order, rawHtml: '' },
    };
    return defaults[type] || { type, order, title: type };
}

// ── Прев'ю ─────────────────────────────────────────────────
function _renderPreview() {
    const c = document.getElementById('sbPreviewInner');
    if (!c) return;
    const theme = sb.site?.theme || { primaryColor:'#22c55e' };
    const primary = theme.primaryColor || '#22c55e';

    if (!sb.blocks.length) {
        c.innerHTML = `<div style="text-align:center;padding:3rem;color:#9ca3af;">
            <div style="font-size:2rem;margin-bottom:0.5rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span></div>
            Додай перший блок з панелі зліва
        </div>`;
        return;
    }

    c.innerHTML = sb.blocks.map((block, i) => {
        const active = i === sb.activeBlockIdx;
        const wrapper = (inner) => `
        <div id="sbPreviewBlock_${i}" onclick="sbSelectBlock(${i})"
            style="position:relative;cursor:pointer;outline:${active ? '2px solid '+primary : 'none'};
            outline-offset:-2px;transition:outline 0.1s;">
            ${active ? `<div style="position:absolute;top:4px;right:4px;background:${primary};color:white;
                font-size:0.6rem;padding:2px 6px;border-radius:4px;z-index:10;font-weight:700;">
                редагується</div>` : ''}
            ${inner}
        </div>`;

        if (block.type === 'hero') {
            return wrapper(`
            <div style="background:${block.bgColor||'#0a0f1a'};color:${block.textColor||'#fff'};
                padding:3rem 1.5rem;text-align:center;">
                <h1 style="font-size:1.6rem;font-weight:800;margin:0 0 0.75rem;line-height:1.2;">
                    ${_esc(block.title||window.t('sitesHeading'))}</h1>
                <p style="font-size:0.9rem;opacity:0.8;margin:0 0 1.5rem;max-width:480px;margin-inline:auto;">
                    ${_esc(block.subtitle||'')}</p>
                <button style="padding:0.7rem 2rem;background:${primary};color:white;border:none;
                    border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;">
                    ${_esc(block.cta||window.t('sitesFormSubmitAlt'))}</button>
            </div>`);
        }
        if (block.type === 'benefits') {
            const items = block.items || [];
            return wrapper(`
            <div style="padding:2rem 1.5rem;background:#f9fafb;">
                <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin:0 0 1.25rem;">
                    ${_esc(block.title||window.t('sitesBlockBenefits'))}</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;">
                    ${items.map(item => `
                    <div style="background:white;border-radius:12px;padding:1rem;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.07);">
                        <div style="font-size:1.5rem;margin-bottom:0.35rem;">${item.icon||'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>'}</div>
                        <div style="font-weight:700;font-size:0.82rem;margin-bottom:0.25rem;">${_esc(item.title||'')}</div>
                        <div style="font-size:0.72rem;color:#6b7280;">${_esc(item.text||'')}</div>
                    </div>`).join('')}
                </div>
            </div>`);
        }
        if (block.type === 'services') {
            const items = block.items || [];
            return wrapper(`
            <div style="padding:2rem 1.5rem;">
                <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin:0 0 1.25rem;">
                    ${_esc(block.title||window.t('sitesBlockServices'))}</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;">
                    ${items.map(item => `
                    <div style="border:1.5px solid #e5e7eb;border-radius:12px;padding:1rem;">
                        <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.25rem;">${_esc(item.title||'')}</div>
                        <div style="font-size:0.75rem;color:#6b7280;margin-bottom:0.5rem;">${_esc(item.text||'')}</div>
                        <div style="font-size:0.85rem;font-weight:700;color:${primary};">${_esc(item.price||'')}</div>
                    </div>`).join('')}
                </div>
            </div>`);
        }
        if (block.type === 'reviews') {
            const items = block.items || [];
            return wrapper(`
            <div style="padding:2rem 1.5rem;background:#f9fafb;">
                <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin:0 0 1.25rem;">
                    ${_esc(block.title||window.t('sitesBlockReviews'))}</h2>
                <div style="display:flex;flex-direction:column;gap:0.6rem;">
                    ${items.map(item => `
                    <div style="background:white;border-radius:12px;padding:0.9rem;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;">
                            <div style="width:32px;height:32px;background:${primary};border-radius:50%;
                                display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.8rem;">
                                ${_esc((item.name||'?').charAt(0))}</div>
                            <div>
                                <div style="font-weight:700;font-size:0.8rem;">${_esc(item.name||'')}</div>
                                <div style="color:#f59e0b;font-size:0.75rem;">${'★'.repeat(item.rating||5)}</div>
                            </div>
                        </div>
                        <div style="font-size:0.78rem;color:#374151;">${_esc(item.text||'')}</div>
                    </div>`).join('')}
                </div>
            </div>`);
        }
        if (block.type === 'faq') {
            const items = block.items || [];
            return wrapper(`
            <div style="padding:2rem 1.5rem;">
                <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin:0 0 1.25rem;">
                    ${_esc(block.title||'FAQ')}</h2>
                ${items.map(item => `
                <details style="margin-bottom:0.5rem;border:1.5px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                    <summary style="padding:0.75rem 1rem;cursor:pointer;font-weight:600;font-size:0.83rem;">
                        ${_esc(item.question||'')}</summary>
                    <div style="padding:0.5rem 1rem 0.75rem;font-size:0.78rem;color:#374151;border-top:1px solid #f1f5f9;">
                        ${_esc(item.answer||'')}</div>
                </details>`).join('')}
            </div>`);
        }
        if (block.type === 'form') {
            const fields = block.fields || ['name','phone'];
            const fieldLabels = {name:"Ім'я",phone:window.t('crmPhone'),email:'Email',message:window.t('sitesFormMessage'),telegram:'Telegram'};
            return wrapper(`
            <div style="padding:2rem 1.5rem;background:linear-gradient(135deg,${primary}15,${primary}05);">
                <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin:0 0 0.35rem;">
                    ${_esc(block.title||window.t('sitesFormSubmitAlt'))}</h2>
                ${block.subtitle ? `<p style="text-align:center;font-size:0.8rem;color:#6b7280;margin:0 0 1rem;">${_esc(block.subtitle)}</p>` : ''}
                <div style="max-width:360px;margin:0 auto;display:flex;flex-direction:column;gap:0.5rem;">
                    ${fields.map(f => `
                    <input placeholder="${fieldLabels[f]||f}" style="padding:0.6rem 0.75rem;
                        border:1.5px solid #e5e7eb;border-radius:9px;font-size:0.83rem;width:100%;box-sizing:border-box;" disabled>`).join('')}
                    <button style="padding:0.65rem;background:${primary};color:white;border:none;
                        border-radius:9px;font-weight:700;font-size:0.85rem;cursor:pointer;">
                        ${_esc(block.cta||window.t('sitesFormSubmit'))}</button>
                </div>
            </div>`);
        }
        if (block.type === 'team') {
            const items = block.items || [];
            return wrapper(`
            <div style="padding:2rem 1.5rem;background:#f9fafb;">
                <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin:0 0 1.25rem;">
                    ${_esc(block.title||window.t('sitesBlockTeam'))}</h2>
                <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;">
                    ${items.map(item => `
                    <div style="text-align:center;width:120px;">
                        <div style="width:64px;height:64px;background:${primary};border-radius:50%;
                            margin:0 auto 0.4rem;display:flex;align-items:center;justify-content:center;
                            color:white;font-size:1.2rem;font-weight:700;">
                            ${_esc((item.name||'?').charAt(0))}</div>
                        <div style="font-weight:700;font-size:0.78rem;">${_esc(item.name||'')}</div>
                        <div style="font-size:0.7rem;color:#6b7280;">${_esc(item.role||'')}</div>
                    </div>`).join('')}
                </div>
            </div>`);
        }
        if (block.type === 'prices') {
            const items = block.items || [];
            return wrapper(`
            <div style="padding:2rem 1.5rem;">
                <h2 style="text-align:center;font-size:1.2rem;font-weight:700;margin:0 0 1.25rem;">
                    ${_esc(block.title||window.t('sitesBlockPrices'))}</h2>
                <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;">
                    ${items.map(item => `
                    <div style="border:2px solid ${primary};border-radius:14px;padding:1.25rem;min-width:140px;text-align:center;">
                        <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.5rem;">${_esc(item.title||'')}</div>
                        <div style="font-size:1.3rem;font-weight:800;color:${primary};margin-bottom:0.6rem;">${_esc(item.price||'')}</div>
                        ${(item.features||[]).map(f=>`<div style="font-size:0.72rem;color:#6b7280;margin-bottom:0.2rem;">✓ ${_esc(f)}</div>`).join('')}
                    </div>`).join('')}
                </div>
            </div>`);
        }
        // HTML блок — рендеримо rawHtml напряму
        if (block.type === 'html') {
            return block.rawHtml
                ? `<div class="site-block site-block--html">${block.rawHtml}</div>`
                : wrapper('<div style="padding:1.5rem;text-align:center;background:#faf5ff;border:2px dashed #c4b5fd;">'
                    + '<div style="font-size:0.8rem;font-weight:600;color:#8b5cf6;">HTML блок (порожній)</div>'
                    + '<div style="font-size:0.7rem;color:#9ca3af;margin-top:4px;">Вставте HTML у лівій панелі</div>'
                    + '</div>');
        }
        // Дефолт для gallery, about, etc.
        return wrapper(`
        <div style="padding:1.5rem;text-align:center;background:#f9fafb;">
            <div style="font-size:0.9rem;font-weight:700;color:#374151;">${_esc(block.title||block.type)}</div>
        </div>`);
    }).join('');
}

window.sbTogglePreview = function () {
    const panel = document.getElementById('sbPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? '' : 'none';
};

// ── Зберегти ───────────────────────────────────────────────
window.sbSave = async function () {
    if (sb.saving) return;
    sb.saving = true;
    const btn = document.getElementById('sbSaveBtn');
    if (btn) { btn.textContent = window.t('saving'); btn.disabled = true; }
    try {
        await window.companyRef()
            .collection(window.DB_COLS.SITES).doc(sb.siteId)
            .update({
                blocks:    sb.blocks,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        if (typeof showToast === 'function') showToast(window.t('savedOk'), 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    } finally {
        sb.saving = false;
        if (btn) { btn.innerHTML = '💾 Зберегти'; btn.disabled = false; }
    }
};

// ══════════════════════════════════════════════════════════
// SEO & ANALYTICS PANEL
// ══════════════════════════════════════════════════════════
window.sbPanelTab = function(tab) {
    sb.panelTab = tab;
    const blocksEl = document.getElementById('sbPanelBlocks');
    const seoEl    = document.getElementById('sbPanelSeo');
    const codeEl   = document.getElementById('sbPanelCode');
    const bBtn     = document.getElementById('sbPanelTab_blocks');
    const sBtn     = document.getElementById('sbPanelTab_seo');
    const cBtn     = document.getElementById('sbPanelTab_code');
    if (blocksEl) blocksEl.style.display = tab === 'blocks' ? 'flex' : 'none';
    if (seoEl)    seoEl.style.display    = tab === 'seo'    ? 'flex' : 'none';
    if (codeEl)   codeEl.style.display   = tab === 'code'   ? 'flex' : 'none';
    const _tabStyle = (btn, active) => {
        if (!btn) return;
        btn.style.borderBottomColor = active ? '#8b5cf6' : 'transparent';
        btn.style.color = active ? '#8b5cf6' : '#6b7280';
        btn.style.fontWeight = active ? '600' : '500';
    };
    if (bBtn) { bBtn.style.borderBottomColor = tab==='blocks'?'#22c55e':'transparent'; bBtn.style.color=tab==='blocks'?'#22c55e':'#6b7280'; bBtn.style.fontWeight=tab==='blocks'?'600':'500'; }
    if (sBtn) { sBtn.style.borderBottomColor = tab==='seo'?'#22c55e':'transparent'; sBtn.style.color=tab==='seo'?'#22c55e':'#6b7280'; sBtn.style.fontWeight=tab==='seo'?'600':'500'; }
    _tabStyle(cBtn, tab === 'code');
    if (tab === 'seo')  _renderSeoPanel();
    if (tab === 'code') _renderCodePanel();
};

// ── PUBLISH TOGGLE (з білдера) ────────────────────────────
window.sbTogglePublish = async function() {
    if (sb._publishing) return; // double-click guard
    sb._publishing = true;
    const _publishBtn = document.getElementById('sbPublishBtn');
    if (_publishBtn) { _publishBtn.disabled = true; _publishBtn.style.opacity = '0.6'; }
    if (!sb.site) { sb._publishing = false; return; }
    const newStatus = sb.site.status === 'published' ? 'draft' : 'published';
    try {
        const _base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
            ? location.origin : 'https://taskmanagerai-vert.vercel.app';
        const _cid  = window.currentCompanyId || window.currentCompany || '';
        const _pub  = newStatus === 'published';
        const _pubUrl = _pub ? `${_base}/api/site?id=${sb.siteId}&cid=${_cid}` : null;
        await window.companyRef()
            .collection(window.DB_COLS?.SITES || 'sites').doc(sb.siteId)
            .update({
                status: newStatus,
                publicUrl: _pubUrl,
                publishedAt: _pub ? firebase.firestore.FieldValue.serverTimestamp() : null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        sb.site.status = newStatus;
        sb.site.publicUrl = _pubUrl;
        _updatePublishBtn();
        const pub = _pub;
        if (pub && _pubUrl) {
            try { navigator.clipboard?.writeText(_pubUrl); } catch(e) {}
            if (typeof showToast === 'function')
                showToast('🚀 Сайт опубліковано! URL скопійовано', 'success');
            // Показуємо посилання в badge
            const badge = document.getElementById('sbStatusBadge');
            if (badge) badge.title = _pubUrl;
            // Відкриваємо URL modal якщо є функція
            if (typeof _showPublicUrlModal === 'function') _showPublicUrlModal(_pubUrl, sb.siteId);
            else {
                const a = document.createElement('a');
                a.href = _pubUrl; a.target = '_blank';
                a.style.cssText = 'position:fixed;bottom:70px;right:20px;z-index:9999;background:#22c55e;color:white;padding:0.6rem 1.25rem;border-radius:10px;font-weight:700;font-size:0.85rem;text-decoration:none;box-shadow:0 4px 16px rgba(0,0,0,.2);';
                a.textContent = '🌐 Відкрити сайт';
                a.id = 'sbSiteLinkBtn';
                document.getElementById('sbSiteLinkBtn')?.remove();
                document.body.appendChild(a);
                setTimeout(() => a.remove(), 8000);
            }
        } else if (!pub) {
            if (typeof showToast === 'function') showToast('Сайт знято з публікації', 'info');
        }
        // Оновлюємо badge
        const badge = document.getElementById('sbStatusBadge');
        if (badge) {
            badge.textContent = pub ? (window.t?.('sitesPublishedBadge') || 'Опубліковано') : (window.t?.('sitesDraftBadge') || 'Чернетка');
            badge.style.background = pub ? '#dcfce7' : '#f3f4f6';
            badge.style.color = pub ? '#16a34a' : '#6b7280';
        }
    } catch(e) {
        if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
    } finally {
        sb._publishing = false;
        if (_publishBtn) { _publishBtn.disabled = false; _publishBtn.style.opacity = ''; }
    }
};

function _updatePublishBtn() {
    const btn   = document.getElementById('sbPublishBtn');
    const label = document.getElementById('sbPublishBtnLabel');
    if (!btn || !sb.site) return;
    const pub = sb.site.status === 'published';
    btn.style.background   = pub ? '#fef2f2' : '#f0fdf4';
    btn.style.borderColor  = pub ? '#fecaca' : '#bbf7d0';
    btn.style.color        = pub ? '#dc2626' : '#16a34a';
    if (label) label.textContent = pub ? 'Зняти з публікації' : 'Публікувати';
}

function _renderSeoPanel() {
    const c = document.getElementById('sbSeoContent');
    if (!c || !sb.site) return;
    const s = sb.site;
    const inp  = 'width:100%;padding:0.4rem 0.5rem;border:1px solid #e5e7eb;border-radius:6px;font-size:0.78rem;box-sizing:border-box;font-family:inherit;';
    const ta   = inp + 'resize:vertical;';
    const lbl  = 'font-size:0.67rem;font-weight:700;color:#6b7280;text-transform:uppercase;display:block;margin-bottom:0.2rem;letter-spacing:0.03em;';
    const sec  = 'margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #f1f5f9;';
    const head = 'font-size:0.78rem;font-weight:700;color:#111827;margin-bottom:0.6rem;display:flex;align-items:center;gap:0.35rem;';

    c.innerHTML = `
    <style>
    .seo-section { margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid #f1f5f9; }
    .seo-section:last-child { border-bottom:none; }
    </style>

    <!-- SEO Meta -->
    <div class="seo-section">
        <div style="${head}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            SEO Meta
        </div>
        <div style="margin-bottom:0.5rem;">
            <label style="${lbl}">Title (заголовок сторінки)</label>
            <input id="seo_title" value="${_esc(s.seoTitle||s.name||'')}" placeholder=window.t('sitesSeoTitle') style="${inp}">
        </div>
        <div style="margin-bottom:0.5rem;">
            <label style="${lbl}">Description</label>
            <textarea id="seo_desc" rows="2" placeholder="Опис для пошукових систем..." style="${ta}">${_esc(s.seoDescription||'')}</textarea>
        </div>
        <div style="margin-bottom:0.5rem;">
            <label style="${lbl}">Keywords</label>
            <input id="seo_keywords" value="${_esc(s.seoKeywords||'')}" placeholder="ключові, слова, через кому" style="${inp}">
        </div>
        <div>
            <label style="${lbl}">OG Image URL (соц мережі)</label>
            <input id="seo_ogimage" value="${_esc(s.seoOgImage||'')}" placeholder="https://..." style="${inp}">
        </div>
    </div>

    <!-- Google Analytics -->
    <div class="seo-section">
        <div style="${head}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            Google Analytics / GTM
        </div>
        <div style="margin-bottom:0.5rem;">
            <label style="${lbl}">GA4 Measurement ID</label>
            <input id="seo_ga4" value="${_esc(s.analyticsGA4||'')}" placeholder="G-XXXXXXXXXX" style="${inp}">
            <div style="font-size:0.65rem;color:#9ca3af;margin-top:2px;">Google Analytics 4</div>
        </div>
        <div>
            <label style="${lbl}">GTM Container ID</label>
            <input id="seo_gtm" value="${_esc(s.analyticsGTM||'')}" placeholder="GTM-XXXXXXX" style="${inp}">
            <div style="font-size:0.65rem;color:#9ca3af;margin-top:2px;">Google Tag Manager</div>
        </div>
    </div>

    <!-- Meta Pixel -->
    <div class="seo-section">
        <div style="${head}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            Meta (Facebook) Pixel
        </div>
        <div>
            <label style="${lbl}">Pixel ID</label>
            <input id="seo_fbpixel" value="${_esc(s.analyticsMetaPixel||'')}" placeholder="1234567890123456" style="${inp}">
        </div>
    </div>

    <!-- TikTok Pixel -->
    <div class="seo-section">
        <div style="${head}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
            TikTok Pixel
        </div>
        <div>
            <label style="${lbl}">TikTok Pixel ID</label>
            <input id="seo_tiktok" value="${_esc(s.analyticsTikTok||'')}" placeholder="CXXXXXXXXXXXXXXXX" style="${inp}">
        </div>
    </div>

    <!-- Custom Head Code -->
    <div class="seo-section">
        <div style="${head}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Custom &lt;head&gt; код
        </div>
        <div>
            <label style="${lbl}">Довільний код в &lt;head&gt;</label>
            <textarea id="seo_headcode" rows="4"
                placeholder="<!-- Вставте будь-який скрипт, тег або код -->" style="${ta}font-family:monospace;font-size:0.72rem;">${_esc(s.analyticsHeadCode||'')}</textarea>
            <div style="font-size:0.65rem;color:#9ca3af;margin-top:2px;">
                Підтримка: Hotjar, Clarity, LiveChat, Intercom, будь-який інший pixel
            </div>
        </div>
    </div>

    <!-- Custom Domain -->
    <div class="seo-section">
        <div style="${head}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Власний домен
        </div>
        <div style="margin-bottom:0.5rem;">
            <label style="${lbl}">Домен</label>
            <input id="seo_domain" value="${_esc(s.customDomain||'')}" placeholder="clinic.com.ua або www.clinic.com.ua" style="${inp}">
            <div style="font-size:0.65rem;color:#9ca3af;margin-top:3px;">Введіть домен без https://</div>
        </div>
        ${s.customDomain ? `
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:0.65rem;font-size:0.7rem;line-height:1.6;">
            <div style="font-weight:700;color:#0369a1;margin-bottom:0.35rem;">Як підключити домен:</div>
            <div>1. Зайдіть до реєстратора домену (Namecheap, GoDaddy, Hosting.ua тощо)</div>
            <div>2. Відкрийте DNS налаштування для <strong>${_esc(s.customDomain)}</strong></div>
            <div>3. Додайте CNAME запис:</div>
            <div style="background:white;border-radius:6px;padding:0.4rem 0.6rem;margin:0.35rem 0;font-family:monospace;font-size:0.68rem;border:1px solid #e0f2fe;">
                Тип: <strong>CNAME</strong><br>
                Ім'я: <strong>${_esc(s.customDomain.startsWith('www.')?'www':'@')}</strong><br>
                Значення: <strong>cname.vercel-dns.com</strong><br>
                TTL: 3600
            </div>
            <div>4. Напишіть нам — ми підключимо домен в Vercel</div>
            <div style="margin-top:0.35rem;color:#6b7280;">⏱ DNS розповсюджується 15хв–48год</div>
        </div>` : `
        <div style="font-size:0.68rem;color:#9ca3af;background:#f9fafb;border-radius:7px;padding:0.5rem;">
            Після введення домену ми покажемо інструкцію по підключенню
        </div>`}
    </div>

    <!-- Save -->
    <button onclick="sbSaveSeo()"
        style="width:100%;padding:0.5rem;background:#22c55e;color:white;border:none;
        border-radius:7px;cursor:pointer;font-weight:700;font-size:0.82rem;">
        Зберегти SEO & Аналітику
    </button>`;
}

// ── CODE PANEL ───────────────────────────────────────────
function _renderCodePanel() {
    const c = document.getElementById('sbCodeContent');
    if (!c || !sb.site) return;
    const s = sb.site;
    const ta = 'width:100%;padding:0.5rem;border:1px solid #e5e7eb;border-radius:7px;font-size:0.75rem;font-family:monospace;box-sizing:border-box;line-height:1.5;resize:vertical;';
    const lbl = 'font-size:0.72rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;';
    const hint = 'font-size:0.65rem;color:#9ca3af;margin-top:3px;';

    c.innerHTML = `
    <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:0.75rem;letter-spacing:.04em;">
        Вставка HTML / Скрипти
    </div>

    <!-- HEAD code -->
    <div style="margin-bottom:1rem;">
        <label style="${lbl}">
            <span style="display:inline-flex;align-items:center;gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Код у &lt;head&gt;
            </span>
        </label>
        <textarea id="code_headcode" rows="5" placeholder="<!-- Google Analytics, Pixel, Hotjar, LiveChat, будь-який скрипт -->"
            style="${ta}">${_esc(s.analyticsHeadCode||'')}</textarea>
        <div style="${hint}">Вставляється перед &lt;/head&gt; на кожній сторінці сайту</div>
    </div>

    <!-- BODY code -->
    <div style="margin-bottom:1rem;">
        <label style="${lbl}">
            <span style="display:inline-flex;align-items:center;gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
                Код у &lt;body&gt;
            </span>
        </label>
        <textarea id="code_bodycode" rows="5" placeholder="<!-- Chat widget, popup, або будь-який HTML блок -->"
            style="${ta}">${_esc(s.bodyCode||'')}</textarea>
        <div style="${hint}">Вставляється перед &lt;/body&gt; — для чат-віджетів, попапів тощо</div>
    </div>

    <!-- Роздільник -->
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
        <div style="flex:1;height:1px;background:#e5e7eb;"></div>
        <span style="font-size:0.65rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;">або</span>
        <div style="flex:1;height:1px;background:#e5e7eb;"></div>
    </div>

    <!-- HTML блок між блоками -->
    <div style="margin-bottom:1rem;border:1.5px solid #ede9fe;border-radius:10px;padding:0.85rem;background:#faf5ff;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
            <label style="${lbl}">
                <span style="display:inline-flex;align-items:center;gap:5px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    <span style="color:#7c3aed;">HTML блок між блоками сторінки</span>
                </span>
            </label>
            <span style="font-size:0.62rem;background:#ede9fe;color:#7c3aed;padding:1px 7px;border-radius:10px;font-weight:700;">як Tilda T123</span>
        </div>
        <div style="font-size:0.68rem;color:#6b7280;margin-bottom:0.5rem;line-height:1.5;">
            Вставляється <strong>між блоками</strong> сторінки — після Hero, перед Формою тощо.<br>
            Підтримка: iframe, embed, кастомні секції, будь-який HTML.
        </div>
        <button onclick="sbAddHtmlBlockFromCode()"
            style="width:100%;padding:0.45rem;background:#8b5cf6;color:white;border:none;
            border-radius:7px;cursor:pointer;font-weight:700;font-size:0.8rem;
            display:flex;align-items:center;justify-content:center;gap:5px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Додати HTML блок → перейти в Блоки
        </button>
        ${sb.blocks.filter(b=>b.type==='html').length > 0 ? `
        <div style="margin-top:0.5rem;font-size:0.7rem;color:#7c3aed;text-align:center;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-flex;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>
            ${sb.blocks.filter(b=>b.type==='html').length} HTML блок(ів) вже є в структурі сторінки
        </div>` : ''}
    </div>

    <!-- Підказки -->
    <div style="margin-bottom:1rem;padding:0.6rem;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
        <div style="font-size:0.72rem;font-weight:700;color:#475569;margin-bottom:0.4rem;">💡 Код у &lt;head&gt;/&lt;body&gt; — для:</div>
        <div style="font-size:0.7rem;color:#64748b;display:flex;flex-direction:column;gap:3px;">
            <span>• Google Analytics / GA4 (gtag.js)</span>
            <span>• Meta Pixel / TikTok Pixel</span>
            <span>• Hotjar, Microsoft Clarity</span>
            <span>• LiveChat, Intercom, Tawk.to</span>
            <span>• Google Tag Manager</span>
            <span>• Будь-який &lt;script&gt; або &lt;style&gt;</span>
        </div>
    </div>

    <button onclick="sbSaveCode()"
        style="width:100%;padding:0.5rem;background:#8b5cf6;color:white;border:none;
        border-radius:7px;cursor:pointer;font-weight:700;font-size:0.82rem;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-flex;vertical-align:middle;margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>
        Зберегти код
    </button>`;
}

// Додати HTML блок з табу Код → переключитись на Блоки
window.sbAddHtmlBlockFromCode = function() {
    sbAddBlock('html');          // додає блок стандартним способом
    sbPanelTab('blocks');        // переключає на таб Блоки
    // Автоматично вибирає останній доданий блок (html)
    const idx = sb.blocks.length - 1;
    if (idx >= 0) sbSelectBlock(idx);
    if (typeof showToast === 'function')
        showToast('HTML блок додано — редагуй вміст зліва', 'success');
};

window.sbSaveCode = async function() {
    if (!sb.site || !sb.siteId) return;
    const headCode = document.getElementById('code_headcode')?.value || '';
    const bodyCode = document.getElementById('code_bodycode')?.value || '';
    try {
        await window.companyRef()
            .collection(window.DB_COLS?.SITES || 'sites').doc(sb.siteId)
            .update({
                analyticsHeadCode: headCode,
                bodyCode:          bodyCode,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        sb.site.analyticsHeadCode = headCode;
        sb.site.bodyCode          = bodyCode;
        if (typeof showToast === 'function') showToast('Код збережено ✓', 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
    }
};

window.sbSaveSeo = async function() {
    const updates = {
        seoTitle:          document.getElementById('seo_title')?.value.trim()    || '',
        seoDescription:    document.getElementById('seo_desc')?.value.trim()     || '',
        seoKeywords:       document.getElementById('seo_keywords')?.value.trim() || '',
        seoOgImage:        document.getElementById('seo_ogimage')?.value.trim()  || '',
        analyticsGA4:      document.getElementById('seo_ga4')?.value.trim()      || '',
        analyticsGTM:      document.getElementById('seo_gtm')?.value.trim()      || '',
        analyticsMetaPixel:document.getElementById('seo_fbpixel')?.value.trim()  || '',
        analyticsTikTok:   document.getElementById('seo_tiktok')?.value.trim()   || '',
        analyticsHeadCode: document.getElementById('seo_headcode')?.value        || '',
        customDomain:      (document.getElementById('seo_domain')?.value.trim()  || '').replace(/^https?:\/\//,'').replace(/\/$/,''),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
        await window.companyRef()
            .collection(window.DB_COLS.SITES).doc(sb.siteId)
            .update(updates);
        Object.assign(sb.site, updates);
        if (typeof showToast === 'function') showToast(window.t('sitesSeoSaved'), 'success');
    } catch(e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// ══════════════════════════════════════════════════════════
// PUBLIC HTML GENERATOR — вставляє аналітику в <head>
// ══════════════════════════════════════════════════════════
window.sbBuildPublicHtml = function(site, blocksHtml) {
    const s = site || sb.site || {};

    // HTML режим: повертаємо rawHtml без обробки
    if (s.mode === 'html' && s.rawHtml) {
        return s.rawHtml;
    }

    const ga4     = s.analyticsGA4       || '';
    const gtm     = s.analyticsGTM       || '';
    const fbPixel = s.analyticsMetaPixel || '';
    const tiktok  = s.analyticsTikTok    || '';
    const custom  = s.analyticsHeadCode  || '';

    const ga4Code = ga4 ? `
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4}"><\/script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4}');
    <\/script>` : '';

    const gtmCode = gtm ? `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtm}');<\/script>` : '';

    const fbCode = fbPixel ? `
    <!-- Meta Pixel -->
    <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${fbPixel}');
    fbq('track', 'PageView');
    <\/script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${fbPixel}&ev=PageView&noscript=1"/></noscript>` : '';

    const tiktokCode = tiktok ? `
    <!-- TikTok Pixel -->
    <script>
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
      ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
      o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${tiktok}');ttq.page();
    }(window, document, 'ttq');
    <\/script>` : '';

    return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${_esc(s.seoTitle || s.name || window.t('sitesSite'))}</title>
    ${s.seoDescription ? `<meta name="description" content="${_esc(s.seoDescription)}">` : ''}
    ${s.seoKeywords    ? `<meta name="keywords"    content="${_esc(s.seoKeywords)}">` : ''}
    ${s.seoOgImage     ? `<meta property="og:image" content="${_esc(s.seoOgImage)}">` : ''}
    <meta property="og:title" content="${_esc(s.seoTitle || s.name || '')}">
    ${s.seoDescription ? `<meta property="og:description" content="${_esc(s.seoDescription)}">` : ''}
    ${ga4Code}
    ${gtmCode}
    ${fbCode}
    ${tiktokCode}
    ${custom}
</head>
<body>
    ${gtm ? `<!-- GTM noscript --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : ''}
    ${blocksHtml || ''}
    ${s.bodyCode ? `<!-- Custom body code -->\n${s.bodyCode}` : ''}
</body>
    <script>
    (function(){
        try {
            var _sid = '${s.id || ''}';
            var _cid = '${s.companyId || ''}';
            if (_sid && _cid) {
                fetch('/api/track-visit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ siteId: _sid, companyId: _cid })
                }).catch(function(){});
            }
        } catch(e){}
    })();
    </script>
</html>`;
};

function _esc(s) {
    // Shared via TALKO.utils.esc — local fallback for load order safety
    if (window.TALKO?.utils?.esc) return window.TALKO.utils.esc(s);
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

    // ── TALKO namespace ───────────────────────────────────────
    if (window.TALKO) {
        window.TALKO.sites = Object.assign(window.TALKO.sites||{}, {
            initBuilder: window.initSitesBuilder,
            save: window.sbSave,
            saveSeo: window.sbSaveSeo,
            addBlock: window.sbAddBlock,
            removeBlock: window.sbRemoveBlock,
            panelTab: window.sbPanelTab,
            buildHtml: window.sbBuildPublicHtml,
        });
    }

})();
