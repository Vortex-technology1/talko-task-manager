// ============================================================
// 78-landing-pages.js  — TALKO Marketing Hub v5
// Kanban: Воронка | Сайт | Бот | AI | CRM | Процес
// + Етапи воронки (stages) між колонками
// ============================================================
(function () {
    'use strict';

    // ── SVG Icons ──────────────────────────────────────────
    const I = {
        site:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        bot:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg>',
        ai:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        crm:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>',
        process: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
        plus:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        edit:    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
        trash:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>',
        funnel:  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
        leads:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        stage:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
        check:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        close:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        arrow:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    };

    // ── State ──────────────────────────────────────────────
    let _sites     = [];
    let _bots      = [];
    let _funnels   = [];
    let _templates = [];
    let _unsubs    = [];

    // ── Column definitions ─────────────────────────────────
    const COLS = [
        { id:'site',    icon:()=>I.site,    label:'Сайт',      color:'#3b82f6', bg:'#eff6ff', hint:'Лендінг, звідки приходять ліди' },
        { id:'bot',     icon:()=>I.bot,     label:'Бот',       color:'#8b5cf6', bg:'#f5f3ff', hint:'Telegram бот для обробки ліда' },
        { id:'ai',      icon:()=>I.ai,      label:'AI Ланцюг', color:'#06b6d4', bg:'#ecfeff', hint:'Кроки: питання, AI відповідь, збір даних' },
        { id:'crm',     icon:()=>I.crm,     label:'CRM',       color:'#22c55e', bg:'#f0fdf4', hint:'Автоматичне створення угоди' },
        { id:'process', icon:()=>I.process, label:'Процес',    color:'#f59e0b', bg:'#fffbeb', hint:'Запуск процесу після воронки' },
    ];

    // ── Init ───────────────────────────────────────────────
    let _initialized = false;
    let _initCompanyId = null;

    window.initLandingPagesModule = async function () {
        if (!window.currentCompanyId) return;
        const c = document.getElementById('marketingContainer');
        if (!c) return;
        // FIX-7: skip full reload if already initialized for this company
        if (_initialized && _initCompanyId === window.currentCompanyId) {
            _renderHub();
            return;
        }
        c.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;font-size:.85rem;">Завантаження...</div>';
        _initialized = false;
        await _loadAll();
        _initialized = true;
        _initCompanyId = window.currentCompanyId;
        _renderHub();
    };

    async function _loadAll() {
        const base = window.companyRef();
        _unsubs.forEach(u => { try { u(); } catch(e){} });
        _unsubs = [];
        const empty = () => ({ docs: [] });
        const [sitesSnap, botsSnap, funnelsSnap, tplSnap] = await Promise.all([
            base.collection('landingPages').orderBy('createdAt','desc').get().catch(empty),
            base.collection('bots').get().catch(empty),
            base.collection('funnels').orderBy('createdAt','desc').get().catch(empty),
            base.collection('processTemplates').get().catch(empty),
        ]);
        _sites     = sitesSnap.docs.map(d=>({id:d.id,...d.data()}));
        _bots      = botsSnap.docs.map(d=>({id:d.id,...d.data()}));
        _funnels   = funnelsSnap.docs.map(d=>({id:d.id,...d.data()}));
        _templates = tplSnap.docs.map(d=>({id:d.id,...d.data()}));
        _unsubs.push(
            base.collection('funnels').orderBy('createdAt','desc')
                .onSnapshot(snap => {
                    _funnels = snap.docs.map(d=>({id:d.id,...d.data()}));
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
        // FIX-1: skip re-render if any modal overlay is open (would orphan modal DOM)
        if (document.getElementById('mktPickOv') ||
            document.getElementById('mktStageOv') ||
            document.getElementById('mktNewFunnelOv')) return;
        c.innerHTML = `
<div style="height:100%;display:flex;flex-direction:column;background:#f4f5f7;overflow:hidden;">

    <!-- Top bar -->
    <div style="background:white;border-bottom:1px solid #e8eaed;padding:0 1rem;
        display:flex;align-items:center;gap:.75rem;height:48px;flex-shrink:0;">
        <div style="font-weight:700;font-size:.92rem;color:#111827;display:flex;align-items:center;gap:.5rem;">
            ${I.funnel} Маркетинг
        </div>
        <span style="font-size:.73rem;color:#9ca3af;">${_funnels.length} воронок</span>
        <div style="flex:1;"></div>
        <button onclick="mktNewFunnel()"
            style="display:flex;align-items:center;gap:.35rem;padding:.38rem .85rem;
            background:#22c55e;color:white;border:none;border-radius:7px;
            cursor:pointer;font-size:.8rem;font-weight:700;">
            ${I.plus} Нова воронка
        </button>
    </div>

    <!-- Board -->
    <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0;">
        ${_funnels.length === 0 ? _renderEmpty() : _renderBoard()}
    </div>
</div>`;
    }

    function _renderEmpty() {
        return `
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:2rem;">
    <div style="text-align:center;max-width:380px;">
        <div style="width:56px;height:56px;background:#f0fdf4;border-radius:14px;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;
            color:#22c55e;">${I.funnel.replace('11','24').replace('11','24')}</div>
        <div style="font-weight:800;font-size:1.1rem;color:#111827;margin-bottom:.5rem;">Ще немає воронок</div>
        <div style="font-size:.82rem;color:#6b7280;line-height:1.6;margin-bottom:1.5rem;">
            Створіть воронку, додайте етапи і підключіть<br>
            сайт, бота, CRM і процес — повний шлях ліда
        </div>
        <button onclick="mktNewFunnel()"
            style="padding:.58rem 1.6rem;background:#22c55e;color:white;border:none;
            border-radius:10px;cursor:pointer;font-weight:700;font-size:.88rem;">
            ${I.plus} Створити першу воронку
        </button>
    </div>
</div>`;
    }

    // ══════════════════════════════════════════════════════
    // BOARD
    // ══════════════════════════════════════════════════════
    function _renderBoard() {
        const colMinW = 'min-width:200px;flex:1;';

        const headers = COLS.map(col => `
<div style="${colMinW}padding:.55rem .75rem;background:white;
    border-right:1px solid #e8eaed;border-top:3px solid ${col.color};flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:.4rem;">
        <span style="color:${col.color};display:flex;">${col.icon()}</span>
        <div>
            <div style="font-size:.77rem;font-weight:700;color:#374151;">${col.label}</div>
            <div style="font-size:.58rem;color:#9ca3af;white-space:nowrap;overflow:hidden;
                text-overflow:ellipsis;max-width:130px;">${col.hint}</div>
        </div>
    </div>
</div>`).join('');

        const rows = _funnels.map(f => {
            const stages = f.stages || [];
            const cells = COLS.map(col => `
<div style="${colMinW}border-right:1px solid #e8eaed;padding:.3rem .35rem;flex-shrink:0;">
    ${_renderCell(f, col)}
</div>`).join('');

            return `
<div style="display:flex;border-bottom:1px solid #f1f5f9;background:white;
    transition:background .1s;"
    onmouseenter="this.style.background='#fafbfc'"
    onmouseleave="this.style.background='white'">

    <!-- Funnel label -->
    <div style="min-width:160px;max-width:160px;padding:.5rem .65rem;
        border-right:2px solid #e8eaed;flex-shrink:0;display:flex;
        flex-direction:column;justify-content:center;background:inherit;">
        <div style="font-size:.77rem;font-weight:700;color:#111827;
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
            title="${_esc(f.name)}">${_esc(f.name)}</div>
        <div style="display:flex;align-items:center;gap:.25rem;margin-top:3px;">
            <span style="color:#22c55e;display:flex;">${I.leads}</span>
            <span style="font-size:.62rem;font-weight:600;
                color:${(f.leadsCount||0)>0?'#16a34a':'#9ca3af'};">
                ${f.leadsCount||0} лідів
            </span>
        </div>

        <!-- Stages list -->
        ${stages.length ? `
        <div style="margin-top:5px;display:flex;flex-direction:column;gap:2px;">
            ${stages.map((st,si) => `
            <div style="display:flex;align-items:center;gap:3px;font-size:.6rem;color:#6b7280;">
                <span style="color:${st.color||'#9ca3af'};display:flex;">${I.stage}</span>
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:90px;"
                    title="${_esc(st.name)}">${_esc(st.name)}</span>
                <button onclick="event.stopPropagation();mktDeleteStage('${f.id}',${si})"
                    style="margin-left:auto;padding:0;background:none;border:none;
                    cursor:pointer;color:#d1d5db;display:flex;line-height:1;"
                    onmouseenter="this.style.color='#ef4444'"
                    onmouseleave="this.style.color='#d1d5db'">${I.close}</button>
            </div>`).join('')}
        </div>` : ''}

        <!-- Add stage btn -->
        <button onclick="mktAddStage('${f.id}')"
            style="margin-top:5px;display:flex;align-items:center;gap:3px;
            padding:2px 5px;background:none;border:1px dashed #d1d5db;
            border-radius:5px;cursor:pointer;font-size:.6rem;color:#9ca3af;
            width:100%;transition:all .15s;"
            onmouseenter="this.style.borderColor='#22c55e';this.style.color='#22c55e'"
            onmouseleave="this.style.borderColor='#d1d5db';this.style.color='#9ca3af'">
            ${I.plus} Етап
        </button>

        <!-- Action buttons -->
        <div style="display:flex;gap:3px;margin-top:5px;">
            <button onclick="mktEditFunnel('${f.id}')"
                style="flex:1;display:flex;align-items:center;justify-content:center;
                gap:2px;padding:3px 4px;background:#f0fdf4;color:#16a34a;
                border:1px solid #bbf7d0;border-radius:5px;cursor:pointer;font-size:.62rem;font-weight:600;">
                ${I.edit} AI
            </button>
            <button onclick="mktDeleteFunnel('${f.id}')"
                style="padding:3px 5px;background:#fef2f2;color:#ef4444;
                border:1px solid #fecaca;border-radius:5px;cursor:pointer;
                display:flex;align-items:center;">
                ${I.trash}
            </button>
        </div>
    </div>

    <!-- Column cells -->
    ${cells}
</div>`;
        }).join('');

        return `
<div style="flex:1;overflow:auto;">
    <div style="display:flex;position:sticky;top:0;z-index:5;
        border-bottom:2px solid #e8eaed;">
        <div style="min-width:160px;max-width:160px;padding:.55rem .75rem;
            border-right:2px solid #e8eaed;flex-shrink:0;background:white;">
            <div style="font-size:.7rem;font-weight:700;color:#6b7280;
                text-transform:uppercase;letter-spacing:.04em;display:flex;
                align-items:center;gap:.3rem;">${I.funnel} Воронка</div>
        </div>
        ${headers}
    </div>
    ${rows}
</div>`;
    }

    // ══════════════════════════════════════════════════════
    // CELL
    // ══════════════════════════════════════════════════════
    function _renderCell(funnel, col) {
        const linked = _isLinked(funnel, col.id);
        const info   = _getColInfo(funnel, col.id);
        if (linked) {
            return `
<div onclick="mktCellClick('${funnel.id}','${col.id}')"
    style="border-radius:8px;padding:.42rem .52rem;cursor:pointer;
    background:${col.bg};border:1.5px solid ${col.color}30;transition:all .15s;"
    onmouseenter="this.style.borderColor='${col.color}70';this.style.boxShadow='0 2px 8px rgba(0,0,0,.07)'"
    onmouseleave="this.style.borderColor='${col.color}30';this.style.boxShadow='none'">
    <div style="display:flex;align-items:center;gap:.3rem;margin-bottom:2px;">
        <span style="color:${col.color};display:flex;flex-shrink:0;">${col.icon()}</span>
        <div style="font-size:.71rem;font-weight:600;color:${col.color};
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">
            ${info.title}
        </div>
    </div>
    <div style="font-size:.6rem;color:${col.color}90;">${info.subtitle}</div>
    ${info.stat !== null ? `
    <div style="margin-top:3px;font-size:.63rem;font-weight:700;color:${col.color};">
        ${info.stat} <span style="font-weight:400;color:${col.color}80;">${info.statLabel}</span>
    </div>` : ''}
</div>`;
        }
        return `
<div onclick="mktCellClick('${funnel.id}','${col.id}')"
    style="border-radius:8px;padding:.42rem .52rem;cursor:pointer;
    border:1.5px dashed #d1d5db;min-height:50px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    transition:all .15s;"
    onmouseenter="this.style.borderColor='${col.color}';this.style.background='${col.bg}'"
    onmouseleave="this.style.borderColor='#d1d5db';this.style.background='transparent'">
    <span style="color:#d1d5db;display:flex;">${col.icon()}</span>
    <div style="font-size:.59rem;color:#9ca3af;margin-top:3px;">+ Прив'язати</div>
</div>`;
    }

    // ── Link helpers ───────────────────────────────────────
    function _isLinked(f, id) {
        if (id==='site')    return !!_sites.find(s=>s.funnelId===f.id);
        if (id==='bot')     return !!f.botId;
        if (id==='ai')      return (f.steps||[]).length>0 || !!f.botId;
        if (id==='crm')     return true;
        if (id==='process') return !!f.processTemplateId;
        return false;
    }
    function _getColInfo(f, id) {
        if (id==='site') {
            const s = _sites.find(p=>p.funnelId===f.id);
            if (!s) return _mt();
            return { title:s.name||'Лендінг', subtitle:s.slug?'/'+s.slug:'сайт', stat:s.visits||null, statLabel:'відвідувань' };
        }
        if (id==='bot') {
            const b = _bots.find(b=>b.id===f.botId);
            if (!b) return _mt();
            return { title:b.name||'Бот', subtitle:b.username?'@'+b.username:'Telegram', stat:null, statLabel:'' };
        }
        if (id==='ai') {
            const n = (f.steps||[]).length;
            return { title:'AI Ланцюг', subtitle:n>0?n+' кроків':'налаштувати', stat:f.leadsCount||null, statLabel:'пройшли' };
        }
        if (id==='crm') {
            const cnt = f.leadsCount||0;
            return { title:'Лід в CRM', subtitle:cnt>0?'автоматично':'готово до роботи', stat:cnt||null, statLabel:'угод' };
        }
        if (id==='process') {
            const t = _templates.find(t=>t.id===f.processTemplateId);
            if (!t) return _mt();
            return { title:t.name||'Процес', subtitle:'шаблон', stat:f.processLaunched||null, statLabel:'запущено' };
        }
        return _mt();
    }
    function _mt() { return { title:'', subtitle:'', stat:null, statLabel:'' }; }

    // ══════════════════════════════════════════════════════
    // STAGES
    // ══════════════════════════════════════════════════════
    const STAGE_COLORS = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899'];

    window.mktAddStage = function(funnelId) {
        const f = _funnels.find(x=>x.id===funnelId);
        if (!f) return;
        const stages = f.stages || [];
        _showModal('mktStageOv',
            `<div style="font-weight:700;font-size:.9rem;display:flex;align-items:center;gap:.4rem;">
                ${I.stage} Новий етап воронки
            </div>`,
            `<div style="display:flex;flex-direction:column;gap:.6rem;">
                <div>
                    <label style="font-size:.7rem;font-weight:700;color:#6b7280;display:block;margin-bottom:.25rem;">НАЗВА ЕТАПУ *</label>
                    <input id="mktStageNameInp" placeholder="Наприклад: Кваліфікація, Презентація, Угода..."
                        style="width:100%;padding:.5rem .6rem;border:1px solid #e5e7eb;border-radius:8px;font-size:.85rem;box-sizing:border-box;outline:none;"
                        onkeydown="if(event.key==='Enter')mktSaveStage('${funnelId}')">
                </div>
                <div>
                    <label style="font-size:.7rem;font-weight:700;color:#6b7280;display:block;margin-bottom:.25rem;">КОЛІР</label>
                    <div style="display:flex;gap:.4rem;flex-wrap:wrap;">
                        ${STAGE_COLORS.map((c,i) => `
                        <label style="cursor:pointer;">
                            <input type="radio" name="stageColor" value="${c}" ${i===0?'checked':''} style="display:none;">
                            <div class="mktColorDot" data-color="${c}"
                                style="width:22px;height:22px;border-radius:50%;background:${c};
                                border:2.5px solid ${i===0?'#111827':'transparent'};transition:border-color .15s;cursor:pointer;"
                                onclick="this.parentNode.querySelector('input').checked=true;
                                    var ov=document.getElementById('mktStageOv');
                                    if(ov)ov.querySelectorAll('.mktColorDot').forEach(function(d){d.style.borderColor='transparent';});
                                    this.style.borderColor='#111827';">
                            </div>
                        </label>`).join('')}
                    </div>
                </div>
            </div>`,
            `<button onclick="document.getElementById('mktStageOv').remove()"
                style="padding:.45rem .9rem;background:#f9fafb;color:#525252;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;font-size:.81rem;">
                Скасувати
            </button>
            <button onclick="mktSaveStage('${funnelId}')"
                style="padding:.45rem 1rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:700;font-size:.81rem;">
                ${I.check} Додати
            </button>`
        );
        setTimeout(()=>document.getElementById('mktStageNameInp')?.focus(), 60);
    };

    window.mktSaveStage = async function(funnelId) {
        const name = document.getElementById('mktStageNameInp')?.value.trim();
        if (!name) { if(window.showToast) showToast('Введіть назву','warning'); return; }
        const colorInput = (document.getElementById('mktStageOv') || document).querySelector('[name=stageColor]:checked');
        const color = colorInput ? colorInput.value : '#22c55e';
        const f = _funnels.find(x=>x.id===funnelId);
        if (!f) return;
        const stages = [...(f.stages||[]), { name, color }];
        document.getElementById('mktStageOv')?.remove();
        try {
            await window.companyRef().collection('funnels').doc(funnelId)
                .update({ stages, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            f.stages = stages;
            _renderHub();
            if (window.showToast) showToast('Етап додано ✓','success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    window.mktDeleteStage = async function(funnelId, idx) {
        const f = _funnels.find(x=>x.id===funnelId);
        if (!f) return;
        const stages = (f.stages||[]).filter((_,i)=>i!==idx);
        try {
            await window.companyRef().collection('funnels').doc(funnelId)
                .update({ stages, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            f.stages = stages;
            _renderHub();
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    // ══════════════════════════════════════════════════════
    // CELL CLICKS
    // ══════════════════════════════════════════════════════
    window.mktCellClick = function(funnelId, colId) {
        const f = _funnels.find(x=>x.id===funnelId);
        if (!f) return;
        if (colId==='site') {
            if (_sites.find(s=>s.funnelId===funnelId)) { if(typeof switchTab==='function') switchTab('sites'); }
            else _modalPickSite(funnelId);
        } else if (colId==='bot') {
            if (f.botId) { if(typeof switchTab==='function') switchTab('bots'); }
            else _modalPickBot(funnelId);
        } else if (colId==='ai') {
            if (typeof openFunnelEditorModule==='function') {
                openFunnelEditorModule(funnelId);
            } else if (typeof lazyLoad === 'function') {
                if(window.showToast) showToast('Завантажую редактор...','info');
                lazyLoad('funnels', function() {
                    if (typeof openFunnelEditorModule==='function') openFunnelEditorModule(funnelId);
                });
            } else if(window.showToast) showToast('Редактор недоступний','warning');
        } else if (colId==='crm') {
            if(typeof switchTab==='function') switchTab('crm');
        } else if (colId==='process') {
            if (f.processTemplateId) { if(typeof switchTab==='function') switchTab('processes'); }
            else _modalPickProcess(funnelId);
        }
    };

    window.mktEditFunnel = function(fid) {
        if (typeof openFunnelEditorModule==='function') openFunnelEditorModule(fid);
        else if(window.showToast) showToast('Редактор завантажується...','info');
    };

    window.mktDeleteFunnel = async function(fid) {
        const f = _funnels.find(x=>x.id===fid);
        const ok = window.showConfirmModal
            ? await showConfirmModal(`Видалити "${f?.name}"?`,{danger:true})
            : confirm(`Видалити "${f?.name}"?`);
        if (!ok) return;
        try {
            const linked = _sites.filter(s=>s.funnelId===fid);
            await Promise.all(linked.map(s =>
                window.companyRef().collection('landingPages').doc(s.id)
                    .update({ funnelId: firebase.firestore.FieldValue.delete() })
            ));
            linked.forEach(s=>delete s.funnelId);
            await window.companyRef().collection('funnels').doc(fid).delete();
            if(window.showToast) showToast('Видалено','success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    // ══════════════════════════════════════════════════════
    // NEW FUNNEL
    // ══════════════════════════════════════════════════════
    window.mktNewFunnel = function() {
        _showModal('mktNewFunnelOv',
            `<div style="font-weight:700;font-size:.92rem;display:flex;align-items:center;gap:.4rem;">
                ${I.funnel} Нова воронка
            </div>`,
            `<div>
                <label style="font-size:.7rem;font-weight:700;color:#6b7280;display:block;margin-bottom:.28rem;">НАЗВА *</label>
                <input id="mktFunnelNameInp" placeholder="Наприклад: Запис на консультацію"
                    style="width:100%;padding:.52rem .62rem;border:1px solid #e5e7eb;border-radius:8px;
                    font-size:.87rem;box-sizing:border-box;outline:none;"
                    onkeydown="if(event.key==='Enter')mktSaveNewFunnel()">
            </div>`,
            `<button onclick="document.getElementById('mktNewFunnelOv').remove()"
                style="padding:.45rem .9rem;background:#f9fafb;color:#525252;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;font-size:.81rem;">
                Скасувати
            </button>
            <button id="mktFunnelSaveBtn" onclick="mktSaveNewFunnel()"
                style="padding:.45rem 1rem;background:#22c55e;color:white;border:none;border-radius:7px;cursor:pointer;font-weight:700;font-size:.81rem;">
                Створити
            </button>`
        );
        setTimeout(()=>document.getElementById('mktFunnelNameInp')?.focus(), 60);
    };

    window.mktSaveNewFunnel = async function() {
        const name = document.getElementById('mktFunnelNameInp')?.value.trim();
        if (!name) { if(window.showToast) showToast('Введіть назву','warning'); return; }
        const btn = document.getElementById('mktFunnelSaveBtn');
        if (btn) { btn.disabled=true; btn.textContent='...'; }
        try {
            await window.companyRef().collection('funnels').add({
                name, steps:[], stages:[], leadsCount:0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            document.getElementById('mktNewFunnelOv')?.remove();
            if(window.showToast) showToast('Воронку створено ✓','success');
        } catch(e) {
            if (btn) { btn.disabled=false; btn.textContent='Створити'; }
            if(window.showToast) showToast('Помилка: '+e.message,'error');
        }
    };

    // ══════════════════════════════════════════════════════
    // PICK MODALS
    // ══════════════════════════════════════════════════════
    function _modalPickBot(fid) {
        const items = _bots.map(b=>`
<div onclick="mktLinkField('${fid}','botId','${b.id}','mktPickOv')"
    style="padding:.52rem .7rem;border:1.5px solid #e8eaed;border-radius:8px;cursor:pointer;
    display:flex;align-items:center;gap:.5rem;"
    onmouseenter="this.style.borderColor='#8b5cf6';this.style.background='#f5f3ff'"
    onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
    <span style="color:#8b5cf6;display:flex;">${I.bot}</span>
    <div>
        <div style="font-size:.82rem;font-weight:600;color:#111827;">${_esc(b.name||'Бот')}</div>
        ${b.username?`<div style="font-size:.67rem;color:#9ca3af;">@${_esc(b.username)}</div>`:''}
    </div>
</div>`).join('') || _noItems('бота','bots','#8b5cf6');
        _showModal('mktPickOv',`<div style="font-weight:700;display:flex;align-items:center;gap:.4rem;">${I.bot} Вибрати бота</div>`,items,'');
    }

    function _modalPickProcess(fid) {
        const items = _templates.map(t=>`
<div onclick="mktLinkField('${fid}','processTemplateId','${t.id}','mktPickOv')"
    style="padding:.52rem .7rem;border:1.5px solid #e8eaed;border-radius:8px;cursor:pointer;"
    onmouseenter="this.style.borderColor='#f59e0b';this.style.background='#fffbeb'"
    onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
    <div style="font-size:.82rem;font-weight:600;color:#111827;display:flex;align-items:center;gap:.35rem;">
        ${I.process} ${_esc(t.name)}
    </div>
    ${t.description?`<div style="font-size:.67rem;color:#9ca3af;margin-top:2px;">${_esc(t.description.slice(0,60))}</div>`:''}
</div>`).join('') || _noItems('шаблон','processes','#f59e0b');
        _showModal('mktPickOv',`<div style="font-weight:700;display:flex;align-items:center;gap:.4rem;">${I.process} Вибрати процес</div>`,items,'');
    }

    function _modalPickSite(fid) {
        const unlinked = _sites.filter(s=>!s.funnelId||s.funnelId===fid);
        const items = unlinked.map(s=>`
<div onclick="mktLinkSite('${fid}','${s.id}')"
    style="padding:.52rem .7rem;border:1.5px solid #e8eaed;border-radius:8px;cursor:pointer;"
    onmouseenter="this.style.borderColor='#3b82f6';this.style.background='#eff6ff'"
    onmouseleave="this.style.borderColor='#e8eaed';this.style.background='white'">
    <div style="font-size:.82rem;font-weight:600;color:#111827;display:flex;align-items:center;gap:.35rem;">
        ${I.site} ${_esc(s.name||s.slug||'Сайт')}
    </div>
    ${s.slug?`<div style="font-size:.67rem;color:#9ca3af;">/${_esc(s.slug)}</div>`:''}
</div>`).join('') || _noItems('сайт','sites','#3b82f6');
        _showModal('mktPickOv',`<div style="font-weight:700;display:flex;align-items:center;gap:.4rem;">${I.site} Вибрати сайт</div>`,items,'');
    }

    window.mktLinkSite = async function(fid, sid) {
        document.getElementById('mktPickOv')?.remove();
        try {
            await window.companyRef().collection('landingPages').doc(sid)
                .update({ funnelId:fid, updatedAt:firebase.firestore.FieldValue.serverTimestamp() });
            const s = _sites.find(x=>x.id===sid);
            if (s) s.funnelId = fid;
            _renderHub();
            if(window.showToast) showToast("Сайт прив'язано ✓",'success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    window.mktLinkField = async function(fid, field, value, ovId) {
        document.getElementById(ovId)?.remove();
        try {
            await window.companyRef().collection('funnels').doc(fid)
                .update({ [field]:value, updatedAt:firebase.firestore.FieldValue.serverTimestamp() });
            const f = _funnels.find(x=>x.id===fid);
            if (f) f[field] = value;
            _renderHub();
            if(window.showToast) showToast('Збережено ✓','success');
        } catch(e) { if(window.showToast) showToast('Помилка: '+e.message,'error'); }
    };

    // ── Modal helper ───────────────────────────────────────
    function _showModal(id, header, body, footer) {
        document.getElementById(id)?.remove();
        const ov = document.createElement('div');
        ov.id = id;
        ov.onclick = e=>{ if(e.target===ov) ov.remove(); };
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:10010;display:flex;align-items:center;justify-content:center;padding:1rem;';
        ov.innerHTML = `
<div style="background:white;border-radius:14px;width:100%;max-width:400px;
    box-shadow:0 20px 60px rgba(0,0,0,.18);max-height:80vh;display:flex;flex-direction:column;">
    <div style="padding:.9rem 1.1rem;border-bottom:1px solid #f0f0f0;
        display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
        ${header}
        <button onclick="document.getElementById('${id}').remove()"
            style="background:none;border:none;cursor:pointer;color:#9ca3af;
            display:flex;align-items:center;padding:2px;">${I.close}</button>
    </div>
    <div style="padding:.85rem;overflow-y:auto;display:flex;flex-direction:column;gap:.4rem;flex:1;">
        ${body}
    </div>
    ${footer ? `<div style="padding:.75rem 1rem;border-top:1px solid #f0f0f0;
        display:flex;gap:.5rem;justify-content:flex-end;flex-shrink:0;">${footer}</div>` : ''}
</div>`;
        document.body.appendChild(ov);
    }

    function _noItems(what, tab, color) {
        return `<div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:.82rem;">
            Ще немає: ${what}
            <br><button onclick="if(typeof switchTab==='function')switchTab('${tab}');document.getElementById('mktPickOv')?.remove()"
                style="margin-top:.5rem;padding:.35rem .75rem;background:${color};color:white;
                border:none;border-radius:6px;cursor:pointer;font-size:.78rem;">
                Перейти →
            </button>
        </div>`;
    }

    function _esc(s) {
        if (!s) return '';
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Tab registration ───────────────────────────────────
    (function reg() {
        const fn = ()=>{ if(typeof window.initLandingPagesModule==='function') window.initLandingPagesModule(); };
        if (window.onSwitchTab) { window.onSwitchTab('marketing', fn); return; }
        let i=0, iv=setInterval(()=>{
            if (window.onSwitchTab) { window.onSwitchTab('marketing', fn); clearInterval(iv); }
            else if (++i>50) clearInterval(iv);
        }, 100);
    })();

})();
