// ============================================================
// 78-landing-pages.js  — TALKO Marketing Hub v4
// Kanban-конструктор воронок як головний екран Маркетингу
// Колонки: 🌐Сайт → 🤖Бот → 🧠AI/Ланцюг → 💼CRM → ⚙️Процес
// ============================================================
(function () {
    'use strict';

    // ── State ──────────────────────────────────────────────
    let _sites      = [];   // landingPages
    let _bots       = [];   // bots
    let _funnels    = [];   // funnels (воронки)
    let _templates  = [];   // processTemplates
    let _unsubs     = [];

    // ── Columns definition ─────────────────────────────────
    const COLS = [
        { id:'site',    icon:'🌐', label:'Сайт',          color:'#3b82f6', bg:'#eff6ff',
          hint:'Лендінг, звідки приходять ліди' },
        { id:'bot',     icon:'🤖', label:'Бот',            color:'#8b5cf6', bg:'#f5f3ff',
          hint:'Telegram бот для обробки ліда' },
        { id:'ai',      icon:'🧠', label:'AI Ланцюг',      color:'#06b6d4', bg:'#ecfeff',
          hint:'Кроки бота: питання, AI відповідь, збір даних' },
        { id:'crm',     icon:'💼', label:'CRM',            color:'#22c55e', bg:'#f0fdf4',
          hint:'Автоматичне створення угоди в CRM' },
        { id:'process', icon:'⚙️', label:'Процес',         color:'#f59e0b', bg:'#fffbeb',
          hint:'Запуск бізнес-процесу після завершення воронки' },
    ];

    // ── Init ───────────────────────────────────────────────
    window.initLandingPagesModule = async function () {
        if (!window.currentCompanyId) return;
        const c = document.getElementById('marketingContainer');
        if (!c) return;
        c.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;font-size:.85rem;">Завантаження...</div>';
        await _loadAll();
        _renderHub();
    };

    async function _loadAll() {
        const base = window.companyRef();
        _unsubs.forEach(u => { try { u(); } catch(e){} });
        _unsubs = [];

        const [sitesSnap, botsSnap, funnelsSnap, tplSnap] = await Promise.all([
            base.collection('landingPages').orderBy('createdAt','desc').get(),
            base.collection('bots').get(),
            base.collection('funnels').orderBy('createdAt','desc').get(),
            base.collection('processTemplates').get().catch(()=>({ docs:[] })),
        ]);
        _sites     = sitesSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        _bots      = botsSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        _funnels   = funnelsSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        _templates = tplSnap.docs.map(d => ({ id:d.id, ...d.data() }));

        // Live funnels subscription
        _unsubs.push(
            base.collection('funnels').orderBy('createdAt','desc')
                .onSnapshot(snap => {
                    _funnels = snap.docs.map(d => ({ id:d.id, ...d.data() }));
                    _renderHub();
                })
        );
    }

    // ══════════════════════════════════════════════════════
    // MAIN HUB
    // ══════════════════════════════════════════════════════
    function _renderHub() {
        const c = document.getElementById('marketingContainer');
        if (!c) return;

        c.innerHTML = `
<div style="height:100%;display:flex;flex-direction:column;background:#f4f5f7;overflow:hidden;">

    <!-- Top bar -->
    <div style="background:white;border-bottom:1px solid #e8eaed;
        padding:0 1rem;display:flex;align-items:center;gap:.75rem;
        height:48px;flex-shrink:0;">
        <div style="font-weight:700;font-size:.92rem;color:#111827;display:flex;align-items:center;gap:.4rem;">
            <span style="font-size:1.1rem;">📊</span> Маркетинг
        </div>
        <div style="font-size:.75rem;color:#9ca3af;">${_funnels.length} воронок</div>
        <div style="flex:1;"></div>
        <button onclick="mktNewFunnel()"
            style="display:flex;align-items:center;gap:.35rem;padding:.38rem .85rem;
            background:#22c55e;color:white;border:none;border-radius:7px;
            cursor:pointer;font-size:.8rem;font-weight:700;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Нова воронка
        </button>
    </div>

    <!-- Kanban board -->
    <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0;">
        ${_funnels.length === 0 ? _renderEmpty() : _renderBoard()}
    </div>
</div>`;
    }

    function _renderEmpty() {
        return `
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:2rem;">
    <div style="text-align:center;max-width:380px;">
        <div style="font-size:3.5rem;margin-bottom:1rem;">🎯</div>
        <div style="font-weight:800;font-size:1.15rem;color:#111827;margin-bottom:.55rem;">
            Ще немає воронок
        </div>
        <div style="font-size:.83rem;color:#6b7280;line-height:1.65;margin-bottom:1.5rem;">
            Створіть воронку і підключіть сайт, бота, AI ланцюг,<br>
            CRM і процес — повний шлях від ліда до клієнта
        </div>
        <button onclick="mktNewFunnel()"
            style="padding:.6rem 1.75rem;background:#22c55e;color:white;border:none;
            border-radius:10px;cursor:pointer;font-weight:700;font-size:.9rem;">
            + Створити першу воронку
        </button>
    </div>
</div>`;
    }

    // ══════════════════════════════════════════════════════
    // BOARD = header row + cards rows
    // ══════════════════════════════════════════════════════
    function _renderBoard() {
        const colW = 'min-width:210px;flex:1;';

        // Column headers
        const headers = COLS.map((col, ci) => `
<div style="${colW}padding:.6rem .75rem;background:white;
    border-right:1px solid #e8eaed;border-top:3px solid ${col.color};
    display:flex;align-items:center;gap:.4rem;flex-shrink:0;">
    <span style="font-size:1rem;">${col.icon}</span>
    <div>
        <div style="font-size:.78rem;font-weight:700;color:#374151;">${col.label}</div>
        <div style="font-size:.6rem;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">${col.hint}</div>
    </div>
</div>`).join('');

        // Funnel rows
        const rows = _funnels.map(f => {
            const cells = COLS.map((col, ci) => `
<div style="${colW}border-right:1px solid #e8eaed;padding:.35rem .4rem;flex-shrink:0;">
    ${_renderCell(f, col, ci)}
</div>`).join('');

            return `
<div style="display:flex;border-bottom:1px solid #f1f5f9;background:white;
    transition:background .1s;"
    onmouseenter="this.style.background='#fafafa'"
    onmouseleave="this.style.background='white'">

    <!-- Funnel label (sticky left) -->
    <div style="min-width:140px;max-width:140px;padding:.5rem .65rem;
        border-right:2px solid #e8eaed;flex-shrink:0;display:flex;
        flex-direction:column;justify-content:center;background:inherit;">
        <div style="font-size:.78rem;font-weight:700;color:#111827;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
            title="${_esc(f.name)}">${_esc(f.name)}</div>
        <div style="display:flex;align-items:center;gap:.3rem;margin-top:2px;">
            <span style="font-size:.62rem;padding:1px 5px;border-radius:6px;font-weight:600;
                background:${(f.leadsCount||0)>0?'#f0fdf4':'#f1f5f9'};
                color:${(f.leadsCount||0)>0?'#16a34a':'#9ca3af'};">
                ${f.leadsCount||0} лідів
            </span>
        </div>
        <div style="display:flex;gap:3px;margin-top:4px;">
            <button onclick="mktEditFunnel('${f.id}')" title="Редагувати AI ланцюг"
                style="padding:2px 5px;background:#f0fdf4;color:#16a34a;
                border:1px solid #bbf7d0;border-radius:4px;cursor:pointer;font-size:.6rem;font-weight:700;">
                ✏️
            </button>
            <button onclick="mktDeleteFunnel('${f.id}')" title="Видалити"
                style="padding:2px 5px;background:#fef2f2;color:#ef4444;
                border:1px solid #fecaca;border-radius:4px;cursor:pointer;font-size:.6rem;">
                🗑
            </button>
        </div>
    </div>

    <!-- Column cells -->
    ${cells}
</div>`;
        }).join('');

        return `
<div style="flex:1;overflow:auto;">
    <!-- Sticky header row -->
    <div style="display:flex;position:sticky;top:0;z-index:5;
        border-bottom:2px solid #e8eaed;background:white;">
        <!-- Funnel name header -->
        <div style="min-width:140px;max-width:140px;padding:.6rem .75rem;
            border-right:2px solid #e8eaed;flex-shrink:0;background:white;">
            <div style="font-size:.72rem;font-weight:700;color:#6b7280;
                text-transform:uppercase;letter-spacing:.04em;">Воронка</div>
        </div>
        ${headers}
    </div>
    <!-- Data rows -->
    ${rows}
</div>`;
    }

    // ══════════════════════════════════════════════════════
    // CELL: one funnel × one column
    // ══════════════════════════════════════════════════════
    function _renderCell(funnel, col, ci) {
        const linked = _isLinked(funnel, col.id);
        const info   = _getColInfo(funnel, col.id);

        if (linked) {
            return `
<div onclick="mktCellClick('${funnel.id}','${col.id}')"
    style="border-radius:8px;padding:.45rem .55rem;cursor:pointer;
    background:${col.bg};border:1.5px solid ${col.color}30;
    transition:all .15s;"
    onmouseenter="this.style.borderColor='${col.color}80';this.style.boxShadow='0 2px 6px rgba(0,0,0,.08)'"
    onmouseleave="this.style.borderColor='${col.color}30';this.style.boxShadow='none'">
    <div style="display:flex;align-items:center;gap:.35rem;margin-bottom:2px;">
        <span style="font-size:.85rem;">${col.icon}</span>
        <div style="font-size:.73rem;font-weight:600;color:${col.color};
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">
            ${info.title}
        </div>
    </div>
    <div style="font-size:.62rem;color:${col.color}99;">${info.subtitle}</div>
    ${info.stat !== null ? `
    <div style="margin-top:3px;font-size:.65rem;font-weight:700;color:${col.color};">
        ${info.stat} <span style="font-weight:400;color:${col.color}80;">${info.statLabel}</span>
    </div>` : ''}
</div>`;
        }

        return `
<div onclick="mktCellClick('${funnel.id}','${col.id}')"
    style="border-radius:8px;padding:.45rem .55rem;cursor:pointer;
    border:1.5px dashed #d1d5db;
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;min-height:52px;
    transition:all .15s;"
    onmouseenter="this.style.borderColor='${col.color}';this.style.background='${col.bg}'"
    onmouseleave="this.style.borderColor='#d1d5db';this.style.background='transparent'">
    <span style="font-size:1rem;opacity:.4;">${col.icon}</span>
    <div style="font-size:.62rem;color:#9ca3af;margin-top:2px;">+ Прив'язати</div>
</div>`;
    }

    // ── Linked detection ───────────────────────────────────
    function _isLinked(f, colId) {
        if (colId === 'site')    return !!_sites.find(s => s.funnelId === f.id);
        if (colId === 'bot')     return !!f.botId;
        if (colId === 'ai')      return (f.steps||[]).length > 0 || !!f.botId;
        if (colId === 'crm')     return true; // CRM is always available in TALKO
        if (colId === 'process') return !!f.processTemplateId;
        return false;
    }

    function _getColInfo(f, colId) {
        if (colId === 'site') {
            const s = _sites.find(p => p.funnelId === f.id);
            if (!s) return _empty();
            return { title: s.name||'Лендінг', subtitle: s.slug ? '/'+s.slug : 'сайт', stat: s.views||null, statLabel:'переглядів' };
        }
        if (colId === 'bot') {
            const b = _bots.find(b => b.id === f.botId);
            if (!b) return _empty();
            return { title: b.name||'Бот', subtitle: b.username?'@'+b.username:'Telegram', stat: null, statLabel:'' };
        }
        if (colId === 'ai') {
            const n = (f.steps||[]).length;
            return { title: 'AI Ланцюг', subtitle: n+' кроків', stat: f.leadsCount||null, statLabel:'завершили' };
        }
        if (colId === 'crm') {
            const cnt = f.leadsCount || 0;
            return { title: 'Лід в CRM', subtitle: cnt > 0 ? 'автоматично' : 'готово до роботи', stat: cnt > 0 ? cnt : null, statLabel:'угод' };
        }
        if (colId === 'process') {
            const t = _templates.find(t => t.id === f.processTemplateId);
            if (!t) return _empty();
            return { title: t.name||'Процес', subtitle: 'шаблон', stat: f.processLaunched||null, statLabel:'запущено' };
        }
        return _empty();
    }
    function _empty() { return { title:'', subtitle:'', stat:null, statLabel:'' }; }

    // ══════════════════════════════════════════════════════
    // CELL CLICK ACTIONS
    // ══════════════════════════════════════════════════════
    window.mktCellClick = function(funnelId, colId) {
        const f = _funnels.find(x => x.id === funnelId);
        if (!f) return;

        if (colId === 'site') {
            const site = _sites.find(s => s.funnelId === funnelId);
            if (site) {
                if (typeof switchTab === 'function') switchTab('sites');
            } else {
                _modalPickSite(funnelId);
            }
        } else if (colId === 'bot') {
            if (f.botId) {
                if (typeof switchTab === 'function') switchTab('bots');
            } else {
                _modalPickBot(funnelId);
            }
        } else if (colId === 'ai') {
            // Open funnel step editor (79-funnels.js)
            if (typeof openFunnelEditorModule === 'function') {
                openFunnelEditorModule(funnelId);
            } else if (typeof openFunnelEditor === 'function') {
                openFunnelEditor(funnelId);
            } else {
                if (window.showToast) showToast('Редактор завантажується...','info');
            }
        } else if (colId === 'crm') {
            if (typeof switchTab === 'function') switchTab('crm');
        } else if (colId === 'process') {
            if (f.processTemplateId) {
                if (typeof switchTab === 'function') switchTab('processes');
            } else {
                _modalPickProcess(funnelId);
            }
        }
    };

    // ── Edit funnel (open AI step editor) ──────────────────
    window.mktEditFunnel = function(funnelId) {
        if (typeof openFunnelEditorModule === 'function') {
            openFunnelEditorModule(funnelId);
        } else if (window.showToast) {
            showToast('Редактор завантажується...','info');
        }
    };

    // ── Delete funnel ──────────────────────────────────────
    window.mktDeleteFunnel = async function(funnelId) {
        const f = _funnels.find(x => x.id === funnelId);
        const confirmed = window.showConfirmModal
            ? await showConfirmModal(`Видалити воронку "${f?.name}"?`, { danger:true })
            : confirm(`Видалити воронку "${f?.name}"?`);
        if (!confirmed) return;
        try {
            const base = window.companyRef();
            // FIX 4: cleanup funnelId from linked sites before deleting
            const linkedSites = _sites.filter(s => s.funnelId === funnelId);
            await Promise.all(linkedSites.map(s =>
                base.collection('landingPages').doc(s.id)
                    .update({ funnelId: firebase.firestore.FieldValue.delete() })
            ));
            // Cleanup local _sites
            linkedSites.forEach(s => { delete s.funnelId; });
            await base.collection('funnels').doc(funnelId).delete();
            // onSnapshot will update _funnels automatically
            if (window.showToast) showToast('Видалено','success');
        } catch(e) {
            if (window.showToast) showToast('Помилка: '+e.message,'error');
        }
    };

    // ══════════════════════════════════════════════════════
    // NEW FUNNEL MODAL
    // ══════════════════════════════════════════════════════
    window.mktNewFunnel = function() {
        _showModal('mktNewFunnelOv', `
<div style="font-weight:700;font-size:.95rem;">🎯 Нова воронка</div>`,
`<div>
    <label style="font-size:.72rem;font-weight:700;color:#6b7280;display:block;margin-bottom:.3rem;">НАЗВА *</label>
    <input id="mktFunnelNameInp" placeholder="Наприклад: Запис на консультацію"
        style="width:100%;padding:.55rem .65rem;border:1px solid #e5e7eb;border-radius:8px;
        font-size:.88rem;box-sizing:border-box;outline:none;"
        onkeydown="if(event.key==='Enter') mktSaveNewFunnel()">
</div>`,
`<button onclick="document.getElementById('mktNewFunnelOv').remove()"
    style="padding:.48rem 1rem;background:#f9fafb;color:#525252;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:.82rem;">
    Скасувати
</button>
<button onclick="mktSaveNewFunnel()"
    style="padding:.48rem 1.1rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:.82rem;">
    Створити
</button>`);
        setTimeout(() => document.getElementById('mktFunnelNameInp')?.focus(), 60);
    };

    window.mktSaveNewFunnel = async function() {
        const name = document.getElementById('mktFunnelNameInp')?.value.trim();
        if (!name) { if(window.showToast) showToast('Введіть назву','warning'); return; }
        // FIX: disable button to prevent double submit
        const btn = document.querySelector('#mktNewFunnelOv button[onclick*="mktSaveNewFunnel"]');
        if (btn) { btn.disabled = true; btn.textContent = '...'; }
        try {
            await window.companyRef().collection('funnels').add({
                name, steps:[], leadsCount:0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            document.getElementById('mktNewFunnelOv')?.remove();
            if (window.showToast) showToast('Воронку створено ✓','success');
        } catch(e) {
            if (btn) { btn.disabled = false; btn.textContent = 'Створити'; }
            if (window.showToast) showToast('Помилка: '+e.message,'error');
        }
    };

    // ══════════════════════════════════════════════════════
    // PICK MODALS
    // ══════════════════════════════════════════════════════
    function _modalPickBot(funnelId) {
        const items = _bots.map(b => `
<div onclick="mktLinkField('${funnelId}','botId','${b.id}','mktPickOv')"
    style="padding:.55rem .75rem;border:1.5px solid #e8eaed;border-radius:8px;
    cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.82rem;"
    onmouseenter="this.style.borderColor='#8b5cf6';this.style.background='#f5f3ff'"
    onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
    <span style="font-size:1.2rem;">🤖</span>
    <div>
        <div style="font-weight:600;color:#111827;">${_esc(b.name||'Бот')}</div>
        ${b.username?`<div style="font-size:.68rem;color:#9ca3af;">@${_esc(b.username)}</div>`:''}
    </div>
</div>`).join('') || _noItemsHint('бота', 'bots', '#8b5cf6');

        _showModal('mktPickOv','<div style="font-weight:700;">🤖 Вибрати бота</div>', items, '');
    }

    function _modalPickProcess(funnelId) {
        const items = _templates.map(t => `
<div onclick="mktLinkField('${funnelId}','processTemplateId','${t.id}','mktPickOv')"
    style="padding:.55rem .75rem;border:1.5px solid #e8eaed;border-radius:8px;
    cursor:pointer;font-size:.82rem;"
    onmouseenter="this.style.borderColor='#f59e0b';this.style.background='#fffbeb'"
    onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
    <div style="font-weight:600;color:#111827;">⚙️ ${_esc(t.name)}</div>
    ${t.description?`<div style="font-size:.68rem;color:#9ca3af;margin-top:2px;">${_esc(t.description.slice(0,60))}</div>`:''}
</div>`).join('') || _noItemsHint('шаблон процесу', 'processes', '#f59e0b');

        _showModal('mktPickOv','<div style="font-weight:700;">⚙️ Вибрати процес</div>', items, '');
    }

    function _modalPickSite(funnelId) {
        const unlinked = _sites.filter(s => !s.funnelId || s.funnelId === funnelId);
        const items = unlinked.map(s => `
<div onclick="mktLinkSite('${funnelId}','${s.id}')"
    style="padding:.55rem .75rem;border:1.5px solid #e8eaed;border-radius:8px;
    cursor:pointer;font-size:.82rem;"
    onmouseenter="this.style.borderColor='#3b82f6';this.style.background='#eff6ff'"
    onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
    <div style="font-weight:600;color:#111827;">🌐 ${_esc(s.name||s.slug||'Сайт')}</div>
    ${s.slug?`<div style="font-size:.68rem;color:#9ca3af;">/${_esc(s.slug)}</div>`:''}
</div>`).join('') || _noItemsHint('сайт', 'sites', '#3b82f6');

        _showModal('mktPickOv','<div style="font-weight:700;">🌐 Вибрати сайт</div>', items, '');
    }

    window.mktLinkSite = async function(funnelId, siteId) {
        document.getElementById('mktPickOv')?.remove();
        try {
            await window.companyRef().collection('landingPages').doc(siteId)
                .update({ funnelId, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            // FIX 1: update local _sites immediately so cell re-renders without waiting
            const s = _sites.find(x => x.id === siteId);
            if (s) s.funnelId = funnelId;
            _renderHub();
            if (window.showToast) showToast('Сайт прив\'язано ✓','success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    window.mktLinkField = async function(funnelId, field, value, ovId) {
        document.getElementById(ovId)?.remove();
        try {
            await window.companyRef().collection('funnels').doc(funnelId)
                .update({ [field]: value, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            // FIX 2: update local _funnels[] immediately for instant UI feedback
            const f = _funnels.find(x => x.id === funnelId);
            if (f) f[field] = value;
            _renderHub();
            if (window.showToast) showToast('Збережено ✓','success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    // ── Modal helper ───────────────────────────────────────
    function _showModal(id, header, body, footer) {
        document.getElementById(id)?.remove();
        const ov = document.createElement('div');
        ov.id = id;
        ov.onclick = e => { if(e.target===ov) ov.remove(); };
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10010;display:flex;align-items:center;justify-content:center;padding:1rem;';
        ov.innerHTML = `
<div style="background:white;border-radius:14px;width:100%;max-width:400px;
    box-shadow:0 20px 60px rgba(0,0,0,.2);max-height:80vh;display:flex;flex-direction:column;">
    <div style="padding:.9rem 1.1rem;border-bottom:1px solid #f0f0f0;
        display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
        ${header}
        <button onclick="document.getElementById('${id}').remove()"
            style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;line-height:1;padding:0 2px;">×</button>
    </div>
    <div style="padding:.85rem;overflow-y:auto;display:flex;flex-direction:column;gap:.4rem;flex:1;">
        ${body}
    </div>
    ${footer ? `<div style="padding:.75rem 1rem;border-top:1px solid #f0f0f0;
        display:flex;gap:.5rem;justify-content:flex-end;flex-shrink:0;">${footer}</div>` : ''}
</div>`;
        document.body.appendChild(ov);
    }

    function _noItemsHint(what, tab, color) {
        return `<div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:.82rem;">
            Ще немає: ${what}
            <br><button onclick="if(typeof switchTab==='function')switchTab('${tab}');document.getElementById('mktPickOv')?.remove()"
                style="margin-top:.5rem;padding:.35rem .75rem;background:${color};color:white;
                border:none;border-radius:6px;cursor:pointer;font-size:.78rem;">
                Перейти до ${tab}
            </button>
        </div>`;
    }

    function _esc(s) {
        if (!s) return '';
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Tab registration ───────────────────────────────────
    (function reg() {
        const fn = () => { if (typeof window.initLandingPagesModule === 'function') window.initLandingPagesModule(); };
        if (window.onSwitchTab) { window.onSwitchTab('marketing', fn); return; }
        let i = 0, iv = setInterval(() => {
            if (window.onSwitchTab) { window.onSwitchTab('marketing', fn); clearInterval(iv); }
            else if (++i > 50) clearInterval(iv);
        }, 100);
    })();

})();
