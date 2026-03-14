// ============================================================
// 78-landing-pages.js  — TALKO Marketing Hub v3
// Головний екран: Kanban-конструктор воронок
// Колонки: 🌐Сайт → 🤖Бот → 💼CRM → ⚙️Процес
// ============================================================
(function () {
    'use strict';

    // ── State ──────────────────────────────────────────────
    let _sites      = [];   // landingPages
    let _bots       = [];   // bots
    let _funnels    = [];   // funnels
    let _templates  = [];   // processTemplates
    let _deals      = [];   // crm_deals (counts only)
    let _unsubs     = [];
    let _activeBoard = null; // currently open funnel board id

    // ── Init ───────────────────────────────────────────────
    window.initLandingPagesModule = async function () {
        if (!window.currentCompanyId) return;
        const c = document.getElementById('marketingContainer');
        if (!c) return;
        c.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;">Завантаження...</div>';
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
            base.collection('processTemplates').get(),
        ]);
        _sites     = sitesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        _bots      = botsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        _funnels   = funnelsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        _templates = tplSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Live funnels
        _unsubs.push(base.collection('funnels').orderBy('createdAt','desc')
            .onSnapshot(snap => {
                _funnels = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                _renderHub();
            }));
    }

    // ══════════════════════════════════════════════════════
    // MAIN HUB RENDER
    // ══════════════════════════════════════════════════════
    function _renderHub() {
        const c = document.getElementById('marketingContainer');
        if (!c) return;
        const isMobile = window.innerWidth < 768;

        c.innerHTML = `
<div style="height:100%;display:flex;flex-direction:column;background:#f4f5f7;overflow:hidden;">

    <!-- Top bar -->
    <div style="background:white;border-bottom:1px solid #e8eaed;padding:0 1rem;
        display:flex;align-items:center;justify-content:space-between;height:48px;flex-shrink:0;">
        <div style="font-weight:700;font-size:.95rem;color:#111827;">
            📊 Маркетинг
        </div>
        <button onclick="mktNewFunnel()"
            style="display:flex;align-items:center;gap:.35rem;padding:.4rem .85rem;
            background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;
            font-size:.81rem;font-weight:600;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Нова воронка
        </button>
    </div>

    <!-- Kanban board -->
    <div style="flex:1;overflow-x:auto;overflow-y:hidden;display:flex;gap:0;min-height:0;">
        ${_funnels.length === 0 ? _renderEmpty() : _renderColumns()}
    </div>
</div>`;
    }

    function _renderEmpty() {
        return `
<div style="flex:1;display:flex;align-items:center;justify-content:center;">
    <div style="text-align:center;padding:2rem;max-width:400px;">
        <div style="font-size:3rem;margin-bottom:1rem;">🎯</div>
        <div style="font-weight:700;font-size:1.1rem;color:#111827;margin-bottom:.5rem;">Ще немає воронок</div>
        <div style="font-size:.85rem;color:#6b7280;margin-bottom:1.5rem;line-height:1.6;">
            Створіть воронку і підключіть сайт, бота, CRM і процес —<br>
            отримаєте повний ланцюг від ліда до клієнта
        </div>
        <button onclick="mktNewFunnel()"
            style="padding:.6rem 1.5rem;background:#22c55e;color:white;border:none;
            border-radius:10px;cursor:pointer;font-weight:700;font-size:.9rem;">
            + Створити першу воронку
        </button>
    </div>
</div>`;
    }

    // ══════════════════════════════════════════════════════
    // KANBAN COLUMNS
    // ══════════════════════════════════════════════════════
    const COLS = [
        { id: 'site',    icon: '🌐', label: 'Сайт',    color: '#3b82f6', bg: '#eff6ff' },
        { id: 'bot',     icon: '🤖', label: 'Бот',     color: '#8b5cf6', bg: '#f5f3ff' },
        { id: 'crm',     icon: '💼', label: 'CRM',     color: '#22c55e', bg: '#f0fdf4' },
        { id: 'process', icon: '⚙️', label: 'Процес',  color: '#f59e0b', bg: '#fffbeb' },
    ];

    function _renderColumns() {
        return COLS.map((col, ci) => {
            const cards = _funnels.map(f => _renderCard(f, col, ci)).join('');
            return `
<div style="min-width:260px;flex:1;display:flex;flex-direction:column;
    border-right:1px solid #e8eaed;background:#f8fafc;overflow:hidden;">

    <!-- Col header -->
    <div style="padding:.65rem .85rem;background:white;border-bottom:1px solid #e8eaed;
        border-top:3px solid ${col.color};flex-shrink:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:.4rem;">
                <span style="font-size:1.1rem;">${col.icon}</span>
                <span style="font-weight:700;font-size:.82rem;color:#374151;">${col.label}</span>
            </div>
            <span style="font-size:.68rem;color:#9ca3af;background:#f1f5f9;
                padding:2px 7px;border-radius:10px;">${_funnels.length}</span>
        </div>
    </div>

    <!-- Cards -->
    <div style="flex:1;overflow-y:auto;padding:.5rem;display:flex;flex-direction:column;gap:.4rem;">
        ${cards}
    </div>
</div>`;
        }).join('') +
        // Arrow connector between columns (visual only, on top of border)
        '';
    }

    // ══════════════════════════════════════════════════════
    // CARD PER FUNNEL PER COLUMN
    // ══════════════════════════════════════════════════════
    function _renderCard(funnel, col, ci) {
        const leads  = funnel.leadsCount || 0;
        const linked = _isLinked(funnel, col.id);

        // What's shown in each column slot
        const info   = _getColInfo(funnel, col.id);

        return `
<div onclick="mktCardClick('${funnel.id}','${col.id}')"
    style="background:white;border-radius:9px;cursor:pointer;
    border:1.5px solid ${linked ? col.color+'35' : '#e8eaed'};
    transition:box-shadow .15s,border-color .15s;overflow:hidden;"
    onmouseenter="this.style.boxShadow='0 2px 10px rgba(0,0,0,.1)';this.style.borderColor='${col.color}60'"
    onmouseleave="this.style.boxShadow='none';this.style.borderColor='${linked ? col.color+'35' : '#e8eaed'}'">

    <!-- Card top: funnel name (only first col) + status badge -->
    ${ci === 0 ? `
    <div style="padding:.5rem .7rem;border-bottom:1px solid #f1f5f9;
        display:flex;align-items:center;justify-content:space-between;">
        <div style="font-size:.78rem;font-weight:700;color:#111827;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">
            ${_esc(funnel.name)}
        </div>
        <span style="font-size:.62rem;padding:2px 6px;border-radius:8px;flex-shrink:0;margin-left:.35rem;
            background:${leads>0?'#f0fdf4':'#f1f5f9'};color:${leads>0?'#16a34a':'#9ca3af'};font-weight:600;">
            ${leads} лідів
        </span>
    </div>` : `
    <div style="padding:.4rem .7rem;border-bottom:1px solid #f1f5f9;
        font-size:.72rem;color:#9ca3af;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${_esc(funnel.name)}
    </div>`}

    <!-- Col content -->
    <div style="padding:.6rem .7rem;">
        ${linked ? `
        <!-- Linked state -->
        <div style="display:flex;align-items:center;gap:.45rem;margin-bottom:.4rem;">
            <div style="width:28px;height:28px;border-radius:7px;background:${col.bg};
                display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-size:.95rem;">${col.icon}</span>
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:.76rem;font-weight:600;color:#111827;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${info.title}
                </div>
                <div style="font-size:.65rem;color:#9ca3af;">${info.subtitle}</div>
            </div>
        </div>
        ${info.stat ? `
        <div style="display:flex;align-items:center;justify-content:space-between;
            background:${col.bg};border-radius:6px;padding:.3rem .5rem;">
            <span style="font-size:.68rem;color:${col.color};font-weight:700;">${info.stat}</span>
            <span style="font-size:.62rem;color:#9ca3af;">${info.statLabel}</span>
        </div>` : ''}
        ` : `
        <!-- Empty / not linked state -->
        <div style="display:flex;flex-direction:column;align-items:center;
            padding:.5rem 0;text-align:center;">
            <div style="width:32px;height:32px;border:2px dashed #d1d5db;border-radius:8px;
                display:flex;align-items:center;justify-content:center;
                font-size:.9rem;color:#d1d5db;margin-bottom:.3rem;">+</div>
            <div style="font-size:.7rem;color:#9ca3af;">Прив'язати</div>
        </div>`}
    </div>
</div>`;
    }

    // ── Helpers ────────────────────────────────────────────
    function _isLinked(funnel, colId) {
        if (colId === 'site')    return !!(_sites.find(s => s.funnelId === funnel.id));
        if (colId === 'bot')     return !!(funnel.botId);
        if (colId === 'crm')     return (funnel.leadsCount || 0) > 0;
        if (colId === 'process') return !!(funnel.processTemplateId);
        return false;
    }

    function _getColInfo(funnel, colId) {
        if (colId === 'site') {
            const site = _sites.find(s => s.funnelId === funnel.id);
            if (!site) return { title:'', subtitle:'', stat:null, statLabel:'' };
            return {
                title:     site.name || 'Лендінг',
                subtitle:  site.slug ? '/' + site.slug : 'лендінг',
                stat:      site.views ? site.views : null,
                statLabel: 'переглядів',
            };
        }
        if (colId === 'bot') {
            const bot = _bots.find(b => b.id === funnel.botId);
            if (!bot) return { title:'', subtitle:'', stat:null, statLabel:'' };
            return {
                title:     bot.name || 'Бот',
                subtitle:  bot.username ? '@' + bot.username : 'Telegram бот',
                stat:      funnel.leadsCount ? funnel.leadsCount : null,
                statLabel: 'запусків',
            };
        }
        if (colId === 'crm') {
            return {
                title:     'Лід в CRM',
                subtitle:  'автоматично',
                stat:      funnel.leadsCount || null,
                statLabel: 'угод',
            };
        }
        if (colId === 'process') {
            const tpl = _templates.find(t => t.id === funnel.processTemplateId);
            if (!tpl) return { title:'', subtitle:'', stat:null, statLabel:'' };
            return {
                title:     tpl.name || 'Процес',
                subtitle:  'шаблон процесу',
                stat:      funnel.processLaunched || null,
                statLabel: 'запущено',
            };
        }
        return { title:'', subtitle:'', stat:null, statLabel:'' };
    }

    function _esc(s) {
        if (!s) return '';
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ══════════════════════════════════════════════════════
    // CARD CLICK → open editor for that column
    // ══════════════════════════════════════════════════════
    window.mktCardClick = function(funnelId, colId) {
        const funnel = _funnels.find(f => f.id === funnelId);
        if (!funnel) return;

        if (colId === 'site') {
            const site = _sites.find(s => s.funnelId === funnelId);
            if (site) {
                lpEditPage(site.id);
            } else {
                _openLinkSiteModal(funnelId);
            }
        } else if (colId === 'bot') {
            if (funnel.botId) {
                if (typeof switchTab === 'function') switchTab('bots');
            } else {
                _openLinkBotModal(funnelId);
            }
        } else if (colId === 'crm') {
            if (typeof switchTab === 'function') switchTab('crm');
        } else if (colId === 'process') {
            if (funnel.processTemplateId) {
                if (typeof switchTab === 'function') switchTab('processes');
            } else {
                _openLinkProcessModal(funnelId);
            }
        }
    };

    // ══════════════════════════════════════════════════════
    // NEW FUNNEL
    // ══════════════════════════════════════════════════════
    window.mktNewFunnel = function() {
        const ov = document.createElement('div');
        ov.id = 'mktNewFunnelOv';
        ov.onclick = e => { if(e.target===ov) ov.remove(); };
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
        ov.innerHTML = `
<div style="background:white;border-radius:16px;width:100%;max-width:420px;
    box-shadow:0 24px 64px rgba(0,0,0,.2);">
    <div style="padding:1.1rem 1.25rem;border-bottom:1px solid #f0f0f0;
        display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;font-size:.95rem;">Нова воронка</div>
        <button onclick="document.getElementById('mktNewFunnelOv').remove()"
            style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;">×</button>
    </div>
    <div style="padding:1.1rem 1.25rem;display:flex;flex-direction:column;gap:.75rem;">
        <div>
            <label style="font-size:.72rem;font-weight:700;color:#6b7280;display:block;margin-bottom:.25rem;">
                НАЗВА *
            </label>
            <input id="mktFunnelName" placeholder="Наприклад: Запис на консультацію"
                style="width:100%;padding:.55rem .65rem;border:1px solid #e5e7eb;border-radius:8px;
                font-size:.88rem;box-sizing:border-box;outline:none;"
                onkeydown="if(event.key==='Enter')mktSaveNewFunnel()">
        </div>
    </div>
    <div style="padding:.85rem 1.25rem;border-top:1px solid #f0f0f0;
        display:flex;gap:.5rem;justify-content:flex-end;">
        <button onclick="document.getElementById('mktNewFunnelOv').remove()"
            style="padding:.5rem 1rem;background:#f9fafb;color:#525252;
            border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:.82rem;">
            Скасувати
        </button>
        <button onclick="mktSaveNewFunnel()"
            style="padding:.5rem 1.1rem;background:#22c55e;color:white;
            border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:.82rem;">
            Створити
        </button>
    </div>
</div>`;
        document.body.appendChild(ov);
        setTimeout(() => document.getElementById('mktFunnelName')?.focus(), 50);
    };

    window.mktSaveNewFunnel = async function() {
        const name = document.getElementById('mktFunnelName')?.value.trim();
        if (!name) { if(window.showToast) showToast('Введіть назву','warning'); return; }
        try {
            const ref = await window.companyRef().collection('funnels').add({
                name, steps: [], leadsCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            document.getElementById('mktNewFunnelOv')?.remove();
            if (window.showToast) showToast('Воронку створено ✓','success');
        } catch(e) {
            if (window.showToast) showToast('Помилка: ' + e.message, 'error');
        }
    };

    // ══════════════════════════════════════════════════════
    // LINK MODALS (bot / process)
    // ══════════════════════════════════════════════════════
    function _openLinkBotModal(funnelId) {
        const ov = document.createElement('div');
        ov.onclick = e => { if(e.target===ov) ov.remove(); };
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
        const botOptions = _bots.map(b =>
            `<div onclick="mktLinkBot('${funnelId}','${b.id}',this)"
                style="padding:.55rem .75rem;border:1.5px solid #e8eaed;border-radius:8px;
                cursor:pointer;display:flex;align-items:center;gap:.5rem;font-size:.82rem;"
                onmouseenter="this.style.borderColor='#8b5cf6';this.style.background='#f5f3ff'"
                onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
                <span style="font-size:1rem;">🤖</span>
                <div>
                    <div style="font-weight:600;color:#111827;">${_esc(b.name||'Бот')}</div>
                    ${b.username?`<div style="font-size:.68rem;color:#9ca3af;">@${_esc(b.username)}</div>`:''}
                </div>
            </div>`
        ).join('') || `<div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:.82rem;">
            Ботів ще немає.<br>
            <button onclick="switchTab('bots')" style="margin-top:.5rem;padding:.35rem .75rem;
                background:#8b5cf6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:.78rem;">
                Створити бота
            </button>
        </div>`;
        ov.innerHTML = `
<div style="background:white;border-radius:14px;width:100%;max-width:380px;
    box-shadow:0 20px 60px rgba(0,0,0,.2);">
    <div style="padding:1rem 1.25rem;border-bottom:1px solid #f0f0f0;
        display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;">🤖 Вибрати бота</div>
        <button onclick="this.closest('[style*=fixed]').remove()"
            style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;">×</button>
    </div>
    <div style="padding:1rem;display:flex;flex-direction:column;gap:.4rem;">${botOptions}</div>
</div>`;
        document.body.appendChild(ov);
    }

    window.mktLinkBot = async function(funnelId, botId, el) {
        el.closest('[style*=fixed]')?.remove();
        try {
            await window.companyRef().collection('funnels').doc(funnelId)
                .update({ botId, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (window.showToast) showToast('Бота прив\'язано ✓','success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    function _openLinkProcessModal(funnelId) {
        const ov = document.createElement('div');
        ov.onclick = e => { if(e.target===ov) ov.remove(); };
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
        const tplOptions = _templates.map(t =>
            `<div onclick="mktLinkProcess('${funnelId}','${t.id}',this)"
                style="padding:.55rem .75rem;border:1.5px solid #e8eaed;border-radius:8px;
                cursor:pointer;font-size:.82rem;"
                onmouseenter="this.style.borderColor='#f59e0b';this.style.background='#fffbeb'"
                onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
                <div style="font-weight:600;color:#111827;">⚙️ ${_esc(t.name)}</div>
                ${t.description?`<div style="font-size:.68rem;color:#9ca3af;margin-top:2px;">${_esc(t.description.slice(0,60))}</div>`:''}
            </div>`
        ).join('') || `<div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:.82rem;">
            Шаблонів процесів ще немає.<br>
            <button onclick="switchTab('processes')" style="margin-top:.5rem;padding:.35rem .75rem;
                background:#f59e0b;color:white;border:none;border-radius:6px;cursor:pointer;font-size:.78rem;">
                Створити шаблон
            </button>
        </div>`;
        ov.innerHTML = `
<div style="background:white;border-radius:14px;width:100%;max-width:380px;
    box-shadow:0 20px 60px rgba(0,0,0,.2);">
    <div style="padding:1rem 1.25rem;border-bottom:1px solid #f0f0f0;
        display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;">⚙️ Вибрати процес</div>
        <button onclick="this.closest('[style*=fixed]').remove()"
            style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;">×</button>
    </div>
    <div style="padding:1rem;display:flex;flex-direction:column;gap:.4rem;">${tplOptions}</div>
</div>`;
        document.body.appendChild(ov);
    }

    window.mktLinkProcess = async function(funnelId, tplId, el) {
        el.closest('[style*=fixed]')?.remove();
        try {
            await window.companyRef().collection('funnels').doc(funnelId)
                .update({ processTemplateId: tplId, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            if (window.showToast) showToast('Процес прив\'язано ✓','success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    function _openLinkSiteModal(funnelId) {
        // Open sites tab — user creates/links site there
        if (typeof switchTab === 'function') switchTab('sites');
        if (window.showToast) showToast('Створіть або відкрийте сайт і прив\'яжіть до воронки','info');
    }

    // ── lpEditPage compatibility ───────────────────────────
    window.lpEditPage = function(pageId) {
        if (window.showToast) showToast('Відкрити редактор сайту...','info');
        if (typeof switchTab === 'function') switchTab('sites');
    };

    // ── Tab registration ───────────────────────────────────
    function _lpRegisterTab(tabName, fn) {
        if (window.onSwitchTab) {
            window.onSwitchTab(tabName, fn);
        } else {
            let iv = setInterval(() => {
                if (window.onSwitchTab) { window.onSwitchTab(tabName, fn); clearInterval(iv); }
            }, 100);
        }
    }
    _lpRegisterTab('marketing', function() {
        if (typeof window.initLandingPagesModule === 'function') window.initLandingPagesModule();
    });

})();
