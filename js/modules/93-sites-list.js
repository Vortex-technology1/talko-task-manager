// ============================================================
// 93-sites-list.js — TALKO Sites v1.0
// Список сайтів компанії + створення + видалення
// Firestore: companies/{id}/sites/{siteId}
// ============================================================
(function () {
'use strict';

let sl = {
    sites:   [],
    unsub:   null,
    loading: true,
};

// ── Init ───────────────────────────────────────────────────
window.initSitesModule = async function () {
    if (!window.currentCompanyId) return;
    _renderShell();
    _loadSites();
};

function _renderShell() {
    const c = document.getElementById('sitesContainer');
    if (!c) return;
    c.innerHTML = `
    <div style="padding:0.75rem;">
        <!-- Хедер -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">
            <div>
                <div style="font-weight:700;font-size:1rem;color:#1a1a1a;">Мої сайти</div>
                <div style="font-size:0.72rem;color:#9ca3af;">Лендінги, форми, аналітика</div>
            </div>
            <button onclick="sitesOpenCreate()"
                style="padding:0.5rem 1rem;background:#22c55e;color:white;border:none;
                border-radius:10px;cursor:pointer;font-weight:700;font-size:0.82rem;
                display:flex;align-items:center;gap:0.4rem;box-shadow:0 2px 8px rgba(34,197,94,0.3);">
                + Новий сайт
            </button>
        </div>
        <div id="sitesList"></div>
    </div>`;
}

function _loadSites() {
    if (sl.unsub) sl.unsub();
    const base = window.companyRef();
    sl.unsub = base.collection('sites').orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
            sl.sites   = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            sl.loading = false;
            _renderList();
        }, err => {
            console.error('[Sites]', err);
            sl.loading = false;
            _renderList();
        });
}

// ── Список сайтів ──────────────────────────────────────────
function _renderList() {
    const c = document.getElementById('sitesList');
    if (!c) return;

    if (sl.loading) {
        c.innerHTML = '<div style="text-align:center;padding:3rem;color:#9ca3af;">Завантаження...</div>';
        return;
    }

    if (sl.sites.length === 0) {
        c.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;">
            <div style="font-size:3rem;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span></div>
            <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.35rem;">Сайтів ще немає</div>
            <div style="font-size:0.8rem;color:#6b7280;margin-bottom:1.25rem;">
                Створи перший лендінг за 30 хвилин без коду
            </div>
            <button onclick="sitesOpenCreate()"
                style="padding:0.6rem 1.5rem;background:#22c55e;color:white;border:none;
                border-radius:10px;cursor:pointer;font-weight:700;font-size:0.85rem;">
                Створити сайт
            </button>
        </div>`;
        return;
    }

    c.innerHTML = `
    <!-- Статистика -->
    <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
        ${[
            [window.t('sitesTotal'), sl.sites.length, '#374151'],
            [window.t('sitesPublished'), sl.sites.filter(s=>s.status==='published').length, '#22c55e'],
            [window.t('sitesDrafts'), sl.sites.filter(s=>s.status!=='published').length, '#9ca3af'],
        ].map(([l,v,col]) => `
        <div style="flex:1;min-width:90px;background:white;border-radius:12px;
            padding:0.6rem 0.75rem;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-top:3px solid ${col};">
            <div style="font-size:1rem;font-weight:700;color:${col};">${v}</div>
            <div style="font-size:0.67rem;color:#9ca3af;">${l}</div>
        </div>`).join('')}
    </div>

    <!-- Картки сайтів -->
    <div style="display:flex;flex-direction:column;gap:0.6rem;">
        ${sl.sites.map(site => _siteCard(site)).join('')}
    </div>`;
}

function _siteCard(site) {
    const isPublished = site.status === 'published';
    const blocksCount = (site.blocks || []).length;
    const createdAt   = site.createdAt?.toDate ? site.createdAt.toDate().toLocaleDateString('uk-UA') : '';
    const niche       = site.niche || '';

    const nicheColors = {
        dental: '#3b82f6', construction: '#f97316', legal: '#8b5cf6',
        auto: '#06b6d4', beauty: '#ec4899', fitness: '#22c55e', education: '#f59e0b',
    };
    const nicheColor = nicheColors[site.nicheKey] || '#6b7280';

    return `
    <div style="background:white;border-radius:14px;padding:1rem;
        box-shadow:0 1px 6px rgba(0,0,0,0.07);border:1.5px solid #f1f5f9;
        transition:all 0.15s;"
        onmouseenter="this.style.borderColor='#bbf7d0';this.style.boxShadow='0 4px 14px rgba(34,197,94,0.12)'"
        onmouseleave="this.style.borderColor='#f1f5f9';this.style.boxShadow='0 1px 6px rgba(0,0,0,0.07)'">

        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;">
            <!-- Ліво: info -->
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;flex-wrap:wrap;">
                    <span style="font-weight:700;font-size:0.92rem;color:#1a1a1a;">${_esc(site.name || window.t('botsNoTitle'))}</span>
                    <span style="font-size:0.65rem;padding:1px 7px;border-radius:8px;font-weight:600;
                        background:${isPublished ? '#f0fdf4' : '#f9fafb'};
                        color:${isPublished ? '#16a34a' : '#9ca3af'};">
                        ${isPublished ? window.t('sitesPublishedBadge') : window.t('sitesDraftBadge')}
                    </span>
                    ${niche ? `<span style="font-size:0.65rem;padding:1px 7px;border-radius:8px;
                        background:#f1f5f9;color:${nicheColor};font-weight:600;">${_esc(niche)}</span>` : ''}
                </div>

                ${site.description ? `<div style="font-size:0.78rem;color:#6b7280;margin-bottom:0.4rem;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(site.description)}</div>` : ''}

                ${isPublished && (site.customDomain || site.publicUrl) ? `
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:0.4rem;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    <span style="font-size:0.72rem;color:#0ea5e9;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;"
                        title="${site.customDomain ? 'https://'+_esc(site.customDomain) : _esc(site.publicUrl||'')}">
                        ${site.customDomain ? site.customDomain : (site.publicUrl||'').replace(/^https:\/\/[^/]+/,'').slice(0,40)+'...'}
                    </span>
                    <button onclick="navigator.clipboard?.writeText('${site.customDomain ? 'https://'+_esc(site.customDomain) : _esc(site.publicUrl||'')}');event.stopPropagation();if(typeof showToast==='function')showToast('URL скопійовано','success');"
                        style="background:none;border:none;cursor:pointer;color:#0ea5e9;padding:1px;flex-shrink:0;" title="Копіювати URL">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                </div>` : ''}

                <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                    <span style="font-size:0.72rem;color:#9ca3af;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span> ${blocksCount} блоків</span>
                    ${site.visits ? `<span style="font-size:0.72rem;color:#9ca3af;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span> ${site.visits} відвідувань</span>` : ''}
                    ${site.formSubmissions ? `<span style="font-size:0.72rem;color:#22c55e;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span> ${site.formSubmissions} заявок</span>` : ''}
                    ${createdAt ? `<span style="font-size:0.68rem;color:#d1d5db;">${createdAt}</span>` : ''}
                </div>
            </div>

            <!-- Право: кнопки -->
            <div style="display:flex;flex-direction:column;gap:0.35rem;flex-shrink:0;">
                ${site.mode === 'html' ? `
                <button onclick="sitesEditHtml('${site.id}')"
                    style="padding:0.4rem 0.7rem;background:#8b5cf6;color:white;border:none;
                    border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:700;white-space:nowrap;display:flex;align-items:center;gap:4px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    Редагувати HTML
                </button>` : `
                <button onclick="sitesOpenBuilder('${site.id}')"
                    style="padding:0.4rem 0.7rem;background:#22c55e;color:white;border:none;
                    border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:700;white-space:nowrap;">
                    <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>️ Редагувати
                </button>`}
                <button onclick="sitesOpenForms('${site.id}')"
                    style="padding:0.4rem 0.7rem;background:#eff6ff;color:#3b82f6;border:none;
                    border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:600;">
                    <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span> Форми
                </button>
                <div style="display:flex;gap:0.3rem;">
                    ${isPublished && site.publicUrl ? `
                    <button onclick="sitesTrackVisit('${site.id}');window.open('${_esc(site.publicUrl)}','_blank')"
                        style="flex:1;padding:0.35rem;background:#f0fdf4;color:#16a34a;border:none;
                        border-radius:7px;cursor:pointer;font-size:0.72rem;" title="Відкрити сайт"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span></button>` : ''}
                    <button onclick="sitesTogglePublish('${site.id}','${site.status}')"
                        style="flex:1;padding:0.35rem;background:#f9fafb;color:#525252;border:1px solid #e5e7eb;
                        border-radius:7px;cursor:pointer;font-size:0.72rem;" title="${isPublished ? window.t('botsRemove') : window.t('sitesPublish')}">
                        ${isPublished ? '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="2" y1="2" x2="22" y2="22"/></svg></span>' : '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg></span>'}
                    </button>
                    <button onclick="sitesDelete('${site.id}','${_esc(site.name || '')}')"
                        style="flex:1;padding:0.35rem;background:#fff5f5;color:#ef4444;border:none;
                        border-radius:7px;cursor:pointer;font-size:0.72rem;" title=window.t('crmDelete')><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span></button>
                </div>
            </div>
        </div>
    </div>`;
}

// ── Створення сайту ────────────────────────────────────────
window.sitesOpenCreate = function () {
    document.getElementById('sitesCreateOverlay')?.remove();

    const niches = [
        { key: 'dental',       label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5c-1.5-2-4-2.5-5.5-1S5 8 6 10c.5 1 1 2 1 4 0 1 .5 2 1 2s1-.5 1-1 .5-1 1-1 1 .5 1 1-.5 1 1 1 1-1 1-2c0-2 .5-3 1-4 1-2 1-4.5-.5-6S13.5 3.5 12 5.5z"/></svg></span> Стоматологія',  template: 'Dental Pro' },
        { key: 'construction', label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg></span> Будівництво',    template: 'Build & Repair' },
        { key: 'legal',        label: '⚖️ Юристи',         template: 'Legal Expert' },
        { key: 'auto',         label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></span> Авто',           template: 'AutoService' },
        { key: 'beauty',       label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M5 22v-3a7 7 0 0 1 14 0v3"/><path d="M9 17v5"/><path d="M15 17v5"/></svg></span> Краса',          template: 'Beauty Studio' },
        { key: 'fitness',      label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="5" x2="6" y2="19"/><line x1="18" y1="5" x2="18" y2="19"/><line x1="2" y1="12" x2="22" y2="12"/></svg></span> Фітнес',         template: 'FitLife' },
        { key: 'education',    label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span> Освіта',         template: 'Online Course' },
        { key: 'custom',       label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>️ З нуля',         template: null },
    ];

    const inp = 'width:100%;padding:0.5rem 0.6rem;border:1.5px solid #e5e7eb;border-radius:9px;font-size:0.83rem;box-sizing:border-box;font-family:inherit;';

    document.body.insertAdjacentHTML('beforeend', `
    <div id="sitesCreateOverlay" onclick="if(event.target===this)this.remove()"
        style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10030;
        display:flex;align-items:center;justify-content:center;padding:1rem;">
        <div style="background:white;border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid #f1f5f9;
                display:flex;justify-content:space-between;align-items:center;">
                <div style="font-weight:700;font-size:0.95rem;">Новий сайт</div>
                <button onclick="document.getElementById('sitesCreateOverlay').remove()"
                    style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;">✕</button>
            </div>
            <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
                <div>
                    <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.3rem;">Назва сайту</label>
                    <input id="sc_name" placeholder="Стоматологія Dr.Іваненко, Ремонт квартир Київ..."
                        style="${inp}" autofocus>
                </div>

                <!-- Режим створення -->
                <div>
                    <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.4rem;">Режим</label>
                    <div style="display:flex;gap:0.4rem;">
                        <button id="sc_mode_blocks" onclick="sitesSetCreateMode('blocks')"
                            style="flex:1;padding:0.55rem;border:2px solid #22c55e;border-radius:10px;
                            background:#f0fdf4;color:#16a34a;font-size:0.8rem;font-weight:700;cursor:pointer;
                            display:flex;align-items:center;justify-content:center;gap:0.35rem;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            Блоки
                        </button>
                        <button id="sc_mode_html" onclick="sitesSetCreateMode('html')"
                            style="flex:1;padding:0.55rem;border:2px solid #e5e7eb;border-radius:10px;
                            background:white;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;
                            display:flex;align-items:center;justify-content:center;gap:0.35rem;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            Вставити HTML
                        </button>
                    </div>
                </div>

                <!-- HTML textarea (прихований по дефолту) -->
                <div id="sc_html_section" style="display:none;">
                    <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.3rem;">HTML код сторінки</label>
                    <textarea id="sc_html" rows="10"
                        placeholder="<!DOCTYPE html>&#10;<html>&#10;  <head>...</head>&#10;  <body>&#10;    <!-- Ваш HTML сюди -->&#10;  </body>&#10;</html>"
                        style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:9px;
                        font-size:0.72rem;font-family:monospace;box-sizing:border-box;resize:vertical;
                        line-height:1.5;min-height:180px;"></textarea>
                    <div style="font-size:0.65rem;color:#9ca3af;margin-top:3px;">
                        Вставте повний HTML — сайт буде одразу опублікований
                    </div>
                </div>

                <!-- Блоки секція (видима по дефолту) -->
                <div id="sc_blocks_section">
                <div>
                    <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.3rem;">Опис (необов'язково)</label>
                    <input id="sc_desc" placeholder=window.t('sitesDescPh')
                        style="${inp}">
                </div>
                <div>
                    <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.5rem;">Шаблон (ніша)</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;" id="sc_niches">
                        ${niches.map(n => `
                        <div onclick="sitesSelectNiche('${n.key}')" id="scn_${n.key}"
                            style="padding:0.5rem 0.6rem;border:2px solid #e5e7eb;border-radius:10px;
                            cursor:pointer;font-size:0.78rem;font-weight:500;transition:all 0.15s;
                            display:flex;align-items:center;gap:0.4rem;">
                            ${_esc(n.label)}
                        </div>`).join('')}
                    </div>
                </div>
                </div><!-- /sc_blocks_section -->
            </div>
            <div style="padding:0.75rem 1.25rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:0.4rem;">
                <button onclick="document.getElementById('sitesCreateOverlay').remove()"
                    style="padding:0.5rem 1rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:0.82rem;">
                    Скасувати
                </button>
                <button onclick="sitesCreate()"
                    style="padding:0.5rem 1.25rem;background:#22c55e;color:white;border:none;
                    border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">
                    Створити →
                </button>
            </div>
        </div>
    </div>`);

    document.getElementById('sc_name')?.focus();
};

let _selectedNiche = 'custom';
window.sitesSelectNiche = function (key) {
    _selectedNiche = key;
    document.querySelectorAll('[id^="scn_"]').forEach(el => {
        el.style.borderColor = '#e5e7eb';
        el.style.background  = 'white';
        el.style.color       = '#374151';
    });
    const sel = document.getElementById('scn_' + key);
    if (sel) {
        sel.style.borderColor = '#22c55e';
        sel.style.background  = '#f0fdf4';
        sel.style.color       = '#16a34a';
    }
};

// Редагування HTML сайту
window.sitesEditHtml = function(siteId) {
    const site = sl.sites?.find(s => s.id === siteId);
    if (!site) return;

    document.getElementById('sitesEditHtmlOverlay')?.remove();
    const ov = document.createElement('div');
    ov.id = 'sitesEditHtmlOverlay';
    ov.onclick = e => { if(e.target===ov) ov.remove(); };
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10030;display:flex;align-items:center;justify-content:center;padding:1rem;';
    ov.innerHTML = `
    <div style="background:white;border-radius:14px;width:100%;max-width:860px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="padding:0.85rem 1.25rem;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
            <div>
                <div style="font-weight:700;font-size:0.95rem;">HTML код: ${_esc(site.name)}</div>
                <div style="font-size:0.7rem;color:#9ca3af;margin-top:1px;">Вставте або відредагуйте HTML — натисніть Зберегти</div>
            </div>
            <button onclick="document.getElementById('sitesEditHtmlOverlay').remove()" style="background:none;border:none;cursor:pointer;font-size:1.3rem;color:#9ca3af;">×</button>
        </div>
        <div style="flex:1;padding:1rem;overflow:hidden;display:flex;flex-direction:column;gap:0.75rem;">
            <textarea id="editHtml_code" style="flex:1;width:100%;padding:0.6rem;border:1.5px solid #e5e7eb;border-radius:8px;
                font-size:0.75rem;font-family:monospace;box-sizing:border-box;resize:none;line-height:1.5;min-height:400px;"
                placeholder="<!DOCTYPE html>&#10;<html>...</html>">${_esc(site.rawHtml||'')}</textarea>
        </div>
        <div style="padding:0.75rem 1.25rem;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
            <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;cursor:pointer;">
                <input type="checkbox" id="editHtml_publish" ${site.status==='published'?'checked':''} style="width:15px;height:15px;accent-color:#22c55e;">
                Опублікований
            </label>
            <div style="display:flex;gap:0.5rem;">
                <button onclick="document.getElementById('sitesEditHtmlOverlay').remove()"
                    style="padding:0.45rem 1rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:0.82rem;">
                    Скасувати
                </button>
                <button onclick="sitesSaveHtml('${siteId}')"
                    style="padding:0.45rem 1.25rem;background:#8b5cf6;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">
                    Зберегти →
                </button>
            </div>
        </div>
    </div>`;
    document.body.appendChild(ov);
};

window.sitesSaveHtml = async function(siteId) {
    const rawHtml = document.getElementById('editHtml_code')?.value || '';
    const publish = document.getElementById('editHtml_publish')?.checked;
    const status  = publish ? 'published' : 'draft';
    try {
        await window.companyRef().collection(window.DB_COLS?.SITES||'sites').doc(siteId).update({
            rawHtml,
            status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        document.getElementById('sitesEditHtmlOverlay')?.remove();
        if (typeof showToast === 'function') showToast('HTML збережено ✓', 'success');
        if (typeof window.initSitesModule === 'function') window.initSitesModule();
    } catch(e) {
        if (typeof showToast === 'function') showToast('Помилка: ' + e.message, 'error');
    }
};

let _createMode = 'blocks'; // 'blocks' | 'html'

window.sitesSetCreateMode = function(mode) {
    _createMode = mode;
    const btnBlocks = document.getElementById('sc_mode_blocks');
    const btnHtml   = document.getElementById('sc_mode_html');
    const secBlocks = document.getElementById('sc_blocks_section');
    const secHtml   = document.getElementById('sc_html_section');

    if (mode === 'html') {
        if (btnHtml)   { btnHtml.style.borderColor='#8b5cf6'; btnHtml.style.background='#f5f3ff'; btnHtml.style.color='#7c3aed'; btnHtml.style.fontWeight='700'; }
        if (btnBlocks) { btnBlocks.style.borderColor='#e5e7eb'; btnBlocks.style.background='white'; btnBlocks.style.color='#6b7280'; btnBlocks.style.fontWeight='600'; }
        if (secBlocks) secBlocks.style.display = 'none';
        if (secHtml)   secHtml.style.display   = '';
        setTimeout(() => document.getElementById('sc_html')?.focus(), 50);
    } else {
        if (btnBlocks) { btnBlocks.style.borderColor='#22c55e'; btnBlocks.style.background='#f0fdf4'; btnBlocks.style.color='#16a34a'; btnBlocks.style.fontWeight='700'; }
        if (btnHtml)   { btnHtml.style.borderColor='#e5e7eb'; btnHtml.style.background='white'; btnHtml.style.color='#6b7280'; btnHtml.style.fontWeight='600'; }
        if (secHtml)   secHtml.style.display   = 'none';
        if (secBlocks) secBlocks.style.display  = '';
    }
};

window.sitesCreate = async function () {
    const name = document.getElementById('sc_name')?.value.trim();
    if (!name) { if(window.showToast)showToast(window.t('sitesEnterName'),'warning'); else alert(window.t('sitesEnterName')); return; }

    // ── HTML режим ────────────────────────────────────────
    if (_createMode === 'html') {
        const rawHtml = document.getElementById('sc_html')?.value.trim() || '';
        if (!rawHtml) {
            if(window.showToast) showToast('Вставте HTML код', 'warning');
            return;
        }
        try {
            const ref = await window.companyRef().collection(window.DB_COLS?.SITES || 'sites').add({
                name,
                description: '',
                niche: 'custom',
                nicheKey: 'custom',
                status: 'published',          // одразу публікуємо
                mode: 'html',                  // маркер режиму
                rawHtml,                       // повний HTML код
                blocks: [],
                companyId: window.currentCompanyId || '',
                theme: { primaryColor: '#22c55e', fontFamily: 'Inter', borderRadius: '12px' },
                visits: 0,
                formSubmissions: 0,
                analyticsHeadCode: '',
                bodyCode: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            document.getElementById('sitesCreateOverlay')?.remove();
            if (typeof showToast === 'function') showToast('🚀 Сайт створено і опубліковано!', 'success');
            // Оновлюємо список — не відкриваємо білдер (HTML режим)
            if (typeof window.initSitesModule === 'function') window.initSitesModule();
        } catch(e) {
            if(window.showToast) showToast('Помилка: ' + e.message, 'error');
        }
        return;
    }

    // ── Блоки режим ───────────────────────────────────────
    const desc = document.getElementById('sc_desc')?.value.trim() || '';

    const nicheTemplates = {
        dental:       { niche: window.t('nicheDental'),  blocks: ['hero','benefits','services','team','reviews','form'] },
        construction: { niche: window.t('nicheConstruction2'),   blocks: ['hero','services','gallery','reviews','form'] },
        legal:        { niche: window.t('nicheLawyers'),        blocks: ['hero','services','team','faq','form'] },
        auto:         { niche: window.t('botsAuto'),          blocks: ['hero','services','prices','reviews','form'] },
        beauty:       { niche: window.t('nicheBeauty'),         blocks: ['hero','services','team','portfolio','form'] },
        fitness:      { niche: window.t('nicheFitness'),        blocks: ['hero','programs','team','prices','form'] },
        education:    { niche: window.t('nicheEducation'),        blocks: ['hero','program','about','reviews','prices','form'] },
        custom:       { niche: '',              blocks: ['hero'] },
    };

    const tmpl  = nicheTemplates[_selectedNiche] || nicheTemplates.custom;
    const blocks = tmpl.blocks.map((type, i) => _defaultBlock(type, i));

    try {
        const db   = firebase.firestore();
        const ref  = await window.companyRef()
            .collection('sites').add({
                name, description: desc,
                niche:    tmpl.niche,
                nicheKey: _selectedNiche,
                status:   'draft',
                blocks,
                companyId: window.currentCompanyId || '',  // FIX: needed for track-visit
                theme: { primaryColor: '#22c55e', fontFamily: 'Inter', borderRadius: '12px' },
                visits:           0,
                formSubmissions:  0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

        document.getElementById('sitesCreateOverlay')?.remove();
        if (typeof showToast === 'function') showToast(window.t('sitesCreated'), 'success');

        // Одразу відкриваємо редактор
        sitesOpenBuilder(ref.id);
    } catch (e) { if(window.showToast)showToast(window.t('errPrefix') + e.message,'error'); else alert(window.t('errPrefix') + e.message); }
};

function _defaultBlock(type, order) {
    const defaults = {
        hero:     { type:'hero',     order, title:window.t('sitesHeaderTitle'), subtitle:window.t('sitesSubBenefit'), cta:window.t('sitesFormSubmitAlt'), bgColor:'#0a0f1a', textColor:'#ffffff' },
        benefits: { type:'benefits', order, title:window.t('sitesOurBenefits'), items:[
            { icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>', title:'Перевага 1', text:'Опис першої переваги' },
            { icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>', title:'Перевага 2', text:'Опис другої переваги' },
            { icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg></span>', title:'Перевага 3', text:'Опис третьої переваги' },
        ]},
        services: { type:'services', order, title:window.t('sitesOurServices'), items:[
            { title:window.t('sitesService1'), price:window.t('sitesPrice1'), text:window.t('sitesShortDesc') },
            { title:window.t('sitesService2'), price:window.t('sitesPrice2'), text:window.t('sitesShortDesc') },
            { title:window.t('sitesService3'), price:window.t('sitesPrice3'), text:window.t('sitesShortDesc') },
        ]},
        reviews:  { type:'reviews', order, title:'Відгуки клієнтів', items:[
            { name:window.t('sitesClient1'), rating:5, text:window.t('sitesReview3') },
            { name:window.t('sitesClient2'), rating:5, text:window.t('sitesReview1') },
        ]},
        faq:      { type:'faq', order, title:window.t('sitesFAQ'), items:[
            { question:window.t('sitesQuestion1'), answer:window.t('sitesAnswer1') },
            { question:window.t('sitesQuestion2'), answer:window.t('sitesAnswer2') },
        ]},
        form:     { type:'form', order, title:window.t('sitesFormSubmitAlt'), subtitle:'Ми зв\'яжемося з вами протягом 15 хвилин', fields:['name','phone'], cta:window.t('sitesFormSubmit') },
        team:     { type:'team', order, title:window.t('sitesOurTeam'), items:[ { name:window.t('sitesSpecialist1'), role:window.t('botsPosition'), photo:'' } ]},
        prices:   { type:'prices', order, title:window.t('sitesBlockPrices'), items:[ { title:'Базовий', price:window.t('sitesPrice4'), features:[window.t('sitesOption1'),window.t('sitesOption2')] } ]},
        gallery:  { type:'gallery', order, title:window.t('sitesOurWorks'), items:[] },
        programs: { type:'programs', order, title:window.t('sitesPrograms'), items:[ { title:window.t('sitesProgram1'), text:'Опис' } ]},
        about:    { type:'about', order, title:window.t('sitesAboutAuthor'), text:window.t('sitesAboutPh'), photo:'' },
        portfolio:{ type:'portfolio', order, title:window.t('sitesBlockPortfolio'), items:[] },
    };
    return defaults[type] || { type, order, title: type };
}

// ── Дії з сайтом ──────────────────────────────────────────
// ── Modal з публічним URL сайту ────────────────────────
function _showPublicUrlModal(url, siteId) {
    document.getElementById('siteUrlModal')?.remove();
    const m = document.createElement('div');
    m.id = 'siteUrlModal';
    m.onclick = e => { if (e.target === m) m.remove(); };
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10040;display:flex;align-items:center;justify-content:center;padding:1rem;';
    m.innerHTML = `
    <div style="background:white;border-radius:14px;padding:1.75rem;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="text-align:center;margin-bottom:1.25rem;">
            <div style="font-size:2.5rem;margin-bottom:0.5rem;">🚀</div>
            <div style="font-weight:800;font-size:1.1rem;">Сайт опубліковано!</div>
            <div style="color:#6b7280;font-size:0.85rem;margin-top:4px;">Ваш сайт доступний за посиланням:</div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-bottom:1.25rem;">
            <input id="sitePublicUrlInput" value="${url}" readonly
                style="flex:1;padding:0.6rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.8rem;font-family:monospace;background:#f9fafb;">
            <button onclick="navigator.clipboard?.writeText('${url}');this.textContent='✓';setTimeout(()=>this.textContent='Копіювати',1500);"
                style="padding:0.6rem 1rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.82rem;white-space:nowrap;">
                Копіювати
            </button>
        </div>
        <div style="display:flex;gap:0.5rem;">
            <button onclick="window.open('${url}','_blank');"
                style="flex:1;padding:0.55rem;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                🌐 Відкрити сайт
            </button>
            <button onclick="document.getElementById('siteUrlModal').remove()"
                style="flex:1;padding:0.55rem;background:#f9fafb;color:#374151;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:0.85rem;">
                Закрити
            </button>
        </div>
    </div>`;
    document.body.appendChild(m);
}

window.sitesTogglePublish = async function (siteId, currentStatus) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
        const BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
            ? `${location.origin}`
            : 'https://taskmanagerai-vert.vercel.app';
        const cid = window.currentCompanyId || window.currentCompany || '';
        const publicUrl = newStatus === 'published'
            ? `${BASE}/api/site?id=${siteId}&cid=${cid}`
            : null;

        await window.companyRef()
            .collection(window.DB_COLS.SITES).doc(siteId)
            .update({
                status: newStatus,
                publicUrl: publicUrl,
                publishedAt: newStatus === 'published' ? firebase.firestore.FieldValue.serverTimestamp() : null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

        // Показуємо URL при публікації
        if (newStatus === 'published' && publicUrl) {
            try { navigator.clipboard?.writeText(publicUrl); } catch(e) {}
            if (typeof showToast === 'function')
                showToast('🚀 Сайт опубліковано! URL скопійовано', 'success');
            // Показуємо modal з посиланням
            _showPublicUrlModal(publicUrl, siteId);
        } else {
            if (typeof showToast === 'function')
                showToast('Сайт знято з публікації', 'info');
        }
    } catch (e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

window.sitesDelete = async function (siteId, name) {
    if (!(await (window.showConfirmModal ? showConfirmModal('Видалити сайт "' + name + '"?\nВсі блоки та форми будуть видалені.',{danger:true}) : Promise.resolve(confirm('Видалити сайт "' + name + '"?\nВсі блоки та форми будуть видалені.'))))) return;
    try {
        // FIX 7: delete HTML from Firebase Storage if path exists
        const siteDoc = sl.sites.find(s => s.id === siteId);
        if (siteDoc?.htmlStoragePath) {
            try {
                await firebase.storage().ref(siteDoc.htmlStoragePath).delete();
            } catch(e) { /* storage file may not exist, ignore */ }
        }
        await window.companyRef()
            .collection(window.DB_COLS.SITES).doc(siteId).delete();
        if (typeof showToast === 'function') showToast(window.t('sitesDeleted'), 'success');
    } catch (e) {
        if (typeof showToast === 'function') showToast(window.t('errPrefix') + e.message, 'error');
    }
};

// Переходи в інші модулі (94, 95)
window.sitesOpenBuilder = function (siteId) {
    if (typeof window.initSitesBuilder === 'function') {
        window.initSitesBuilder(siteId);
    } else {
        if (typeof showToast === 'function') showToast(window.t('sitesEditorLoading'), 'success');
    }
};

window.sitesOpenForms = function (siteId) {
    if (typeof window.initSitesForms === 'function') {
        window.initSitesForms(siteId);
    } else {
        if (typeof showToast === 'function') showToast(window.t('sitesFormBuilderLoading'), 'success');
    }
};

// ── Helper ─────────────────────────────────────────────────
function _esc(s) {
    // Shared via TALKO.utils.esc — local fallback for load order safety
    if (window.TALKO?.utils?.esc) return window.TALKO.utils.esc(s);
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}


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
// ── Трекінг відвідувань ──────────────────────────────────
window.sitesTrackVisit = async function(siteId) {
    if (!siteId || !window.currentCompany) return;
    try {
        const ref = window.companyRef().collection(window.DB_COLS.SITES || 'sites').doc(siteId);
        await ref.update({
            visits: firebase.firestore.FieldValue.increment(1),
            lastVisitAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Оновлюємо локальний об'єкт
        const s = sl.sites.find(x => x.id === siteId);
        if (s) s.visits = (s.visits || 0) + 1;
    } catch(e) { /* тихо */ }
};

// ── Аналітика сайту ──────────────────────────────────────
window.sitesOpenAnalytics = async function(siteId) {
    const site = sl.sites.find(s => s.id === siteId);
    if (!site) return;
    const name = _esc(site.name || window.t('sitesSite'));

    // Завантажуємо submissions для підрахунку лідів
    let leads = 0;
    try {
        const snap = await window.companyRef()
            .collection(window.DB_COLS.SITES || 'sites').doc(siteId)
            .collection('forms').get();
        for (const fd of snap.docs) {
            const sub = await fd.ref.collection('submissions').get();
            leads += sub.size;
        }
    } catch(e) {}

    const visits = site.visits || 0;
    const conv = visits > 0 ? Math.round(leads / visits * 100) : 0;
    const lastVisit = site.lastVisitAt?.toDate
        ? site.lastVisitAt.toDate().toLocaleString('uk-UA',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
        : '—';

    window.showAlertModal(`
        <div style="min-width:280px;">
            <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;">${name} — Аналітика</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem;">
                <div style="background:#f0fdf4;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:#22c55e;">${visits}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">Відвідувань</div>
                </div>
                <div style="background:#eff6ff;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:#3b82f6;">${leads}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">Заявок</div>
                </div>
                <div style="background:#fefce8;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:#f59e0b;">${conv}%</div>
                    <div style="font-size:0.7rem;color:#6b7280;">Конверсія</div>
                </div>
                <div style="background:#f9fafb;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:0.78rem;font-weight:700;color:#374151;">${lastVisit}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">Останній візит</div>
                </div>
            </div>
            ${visits === 0 ? '<div style="font-size:0.78rem;color:#9ca3af;text-align:center;">Поки що немає даних. Відвідування трекуються при кліку на кнопку <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span></div>' : ''}
        </div>
    `);
};

_registerTab('sites', function() { window.initSitesModule(); });
// Показуємо кнопку якщо feature увімкнена
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        if (window.isFeatureEnabled && window.isFeatureEnabled('sites')) {
            const btn = document.getElementById('sitesNavBtn');
            if (btn) btn.style.display = '';
        }
    }, 1500);
});

    // ── Register in TALKO namespace ──────────────────────────
    if (window.TALKO) {
        window.TALKO.sites = Object.assign(window.TALKO.sites || {}, {
            init: window.initSitesModule,
            create: window.sitesCreate,
            delete: window.sitesDelete,
            openBuilder: window.sitesOpenBuilder,
            openForms: window.sitesOpenForms,
            togglePublish: window.sitesTogglePublish,
        });
    }

})();
