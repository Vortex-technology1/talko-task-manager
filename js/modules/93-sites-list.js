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
                <div style="font-weight:700;font-size:1rem;color:#1a1a1a;">${window.t('sitesTitle')}</div>
                <div style="font-size:0.72rem;color:#9ca3af;">${window.t('sitesSubtitle')}</div>
            </div>
            <button onclick="sitesOpenCreate()"
                style="padding:0.5rem 1rem;background:#22c55e;color:white;border:none;
                border-radius:10px;cursor:pointer;font-weight:700;font-size:0.82rem;
                display:flex;align-items:center;gap:0.4rem;box-shadow:0 2px 8px rgba(34,197,94,0.3);">
                ${window.t('sitesNew')}
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
        c.innerHTML = `<div style="text-align:center;padding:3rem;color:#9ca3af;">${window.t('loading')}</div>`;
        return;
    }

    if (sl.sites.length === 0) {
        c.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;">
            <div style="font-size:3rem;margin-bottom:0.75rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span></div>
            <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.35rem;">${window.t('sitesEmpty')}</div>
            <div style="font-size:0.8rem;color:#6b7280;margin-bottom:1.25rem;">
                ${window.t('sitesEmptyHint')}
            </div>
            <button onclick="sitesOpenCreate()"
                style="padding:0.6rem 1.5rem;background:#22c55e;color:white;border:none;
                border-radius:10px;cursor:pointer;font-weight:700;font-size:0.85rem;">
                ${window.t('sitesCreate')}
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
    <div style="display:flex;flex-direction:column;gap:0.35rem;">
        ${sl.sites.map(site => _siteCard(site)).join('')}
    </div>`;
}

function _siteCard(site) {
    const isPublished = site.status === 'published';
    const blocksCount = (site.blocks || []).length;
    const createdAt   = site.createdAt?.toDate ? site.createdAt.toDate().toLocaleDateString('uk-UA') : '';
    const visits      = site.visits || 0;
    const forms       = site.formSubmissions || 0;

    return `
    <div style="background:white;border-radius:10px;padding:0.7rem 1rem;
        box-shadow:0 1px 3px rgba(0,0,0,0.06);border:1px solid #f1f5f9;
        display:flex;align-items:center;gap:0.75rem;
        transition:box-shadow 0.15s,border-color 0.15s;"
        onmouseenter="this.style.borderColor='#bbf7d0';this.style.boxShadow='0 3px 12px rgba(34,197,94,0.1)'"
        onmouseleave="this.style.borderColor='#f1f5f9';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)'">

        <!-- Статус індикатор -->
        <div style="width:4px;height:40px;border-radius:2px;flex-shrink:0;
            background:${isPublished ? '#22c55e' : '#e5e7eb'};"></div>

        <!-- Назва + мета -->
        <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;">
                <span style="font-weight:700;font-size:0.88rem;color:#111827;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px;"
                    title="${_esc(site.name)}">${_esc(site.name || window.t('botsNoTitle'))}</span>
                <span style="font-size:0.65rem;padding:1px 7px;border-radius:8px;font-weight:600;flex-shrink:0;
                    background:${isPublished ? '#f0fdf4' : '#f9fafb'};
                    color:${isPublished ? '#16a34a' : '#9ca3af'};">
                    ${isPublished ? '● ' + window.t('sitesPublishedBadge') : window.t('sitesDraftBadge')}
                </span>
            </div>
            <div style="display:flex;align-items:center;gap:1rem;font-size:0.72rem;color:#9ca3af;flex-wrap:wrap;">
                <span style="display:flex;align-items:center;gap:3px;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    ${blocksCount} блоків
                </span>
                ${visits ? `<span style="display:flex;align-items:center;gap:3px;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ${visits} відвідувань
                </span>` : ''}
                ${forms ? `<span style="display:flex;align-items:center;gap:3px;color:#22c55e;font-weight:600;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="12" y1="11" x2="16" y2="11"/><line x1="12" y1="16" x2="16" y2="16"/><circle cx="8" cy="11" r=".5" fill="currentColor"/><circle cx="8" cy="16" r=".5" fill="currentColor"/></svg>
                    ${forms} заявок
                </span>` : ''}
                ${createdAt ? `<span>${createdAt}</span>` : ''}
                ${isPublished && site.publicUrl ? `
                <a href="${_esc(site.publicUrl)}" target="_blank" onclick="event.stopPropagation();sitesTrackVisit('${site.id}')"
                    style="color:#0ea5e9;text-decoration:none;display:flex;align-items:center;gap:3px;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;"
                    title="${_esc(site.publicUrl)}">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    ${(_esc(site.customDomain || site.publicUrl)).replace('https://','').slice(0,35)}
                </a>` : ''}
            </div>
        </div>

        <!-- Кнопки дій -->
        <div style="display:flex;align-items:center;gap:0.3rem;flex-shrink:0;">
            ${site.mode === 'html' ? `
            <button onclick="sitesEditHtml('${site.id}')" title="Редагувати HTML"
                style="padding:0.38rem 0.65rem;background:#8b5cf6;color:white;border:none;
                border-radius:7px;cursor:pointer;font-size:0.75rem;font-weight:600;white-space:nowrap;
                display:flex;align-items:center;gap:4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                HTML
            </button>` : `
            <button onclick="sitesOpenBuilder('${site.id}')" title="Редагувати"
                style="padding:0.38rem 0.7rem;background:#22c55e;color:white;border:none;
                border-radius:7px;cursor:pointer;font-size:0.75rem;font-weight:600;
                display:flex;align-items:center;gap:4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Редагувати
            </button>`}
            <button onclick="sitesOpenForms('${site.id}')" title="Форми"
                style="padding:0.38rem 0.65rem;background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe;
                border-radius:7px;cursor:pointer;font-size:0.75rem;font-weight:600;
                display:flex;align-items:center;gap:4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="12" y1="11" x2="16" y2="11"/><line x1="12" y1="16" x2="16" y2="16"/></svg>
                Форми
            </button>
            ${isPublished && site.publicUrl ? `
            <button onclick="navigator.clipboard?.writeText('${_esc(site.publicUrl)}');event.stopPropagation();if(typeof showToast==='function')showToast('URL скопійовано','success');"
                title="Копіювати посилання"
                style="padding:0.38rem 0.45rem;background:#f8fafc;color:#6b7280;border:1px solid #e5e7eb;
                border-radius:7px;cursor:pointer;display:flex;align-items:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>` : ''}
            <button onclick="sitesTogglePublish('${site.id}','${site.status}')"
                title="${isPublished ? 'Зняти з публікації' : 'Опублікувати'}"
                style="padding:0.38rem 0.45rem;background:#f8fafc;color:#6b7280;border:1px solid #e5e7eb;
                border-radius:7px;cursor:pointer;display:flex;align-items:center;">
                ${isPublished
                    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`
                    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`}
            </button>
            <button onclick="sitesDelete('${site.id}','${_esc(site.name || '')}')" title="Видалити"
                style="padding:0.38rem 0.45rem;background:#fff5f5;color:#ef4444;border:none;
                border-radius:7px;cursor:pointer;display:flex;align-items:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
    </div>`;
}

// ── Створення сайту ────────────────────────────────────────
// ── Бібліотека готових HTML шаблонів ──────────────────────
const SITE_TEMPLATES = [
    {
        key: 'consult-dental',
        niche: 'dental',
        nicheLabel: 'Медицина',
        type: 'consult',
        typeLabel: 'Консультація',
        title: 'Безкоштовна консультація стоматолога',
        desc: 'Запис на прийом, біль → результат → CTA',
        color: '#0ea5e9',
        html: `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Консультація стоматолога</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}.hero{background:linear-gradient(135deg,#0a1628,#0c2340);padding:60px 20px;text-align:center}.hero h1{font-size:clamp(24px,5vw,38px);font-weight:800;color:#fff;margin-bottom:12px}.hero p{font-size:18px;color:#94a3b8;margin-bottom:28px}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.btn{display:inline-block;background:#22c55e;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:26px;font-weight:800;margin-bottom:20px}.pain-list{display:grid;gap:12px;margin-bottom:28px}.pain-item{display:flex;gap:12px;background:#fff5f5;border:1px solid #fecaca;border-radius:10px;padding:14px}.pain-item::before{content:"✗";color:#ef4444;font-weight:700;flex-shrink:0}.sol-list{display:grid;gap:12px;margin-bottom:28px}.sol-item{display:flex;gap:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px}.sol-item::before{content:"✓";color:#22c55e;font-weight:700;flex-shrink:0}.form-box{background:#f8fafc;border-radius:14px;padding:28px;text-align:center}.form-box h2{font-size:22px;font-weight:800;margin-bottom:8px}.form-box p{color:#64748b;margin-bottom:20px}.form-box input{width:100%;padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:15px;margin-bottom:12px;font-family:inherit}.ftr{background:#0a1628;color:#475569;text-align:center;padding:16px;font-size:13px}</style></head><body><header class="hero"><div class="wrap"><h1>Болить зуб? Безкоштовна консультація стоматолога</h1><p>Приймаємо щодня. Без черг. Перший огляд — безкоштовно.</p><a href="#form" class="btn">Записатись на консультацію</a></div></header><section class="sec"><div class="wrap"><h2 class="sec-h">Впізнаєте себе?</h2><div class="pain-list"><div class="pain-item">Відкладаєте похід до лікаря — бо страшно або дорого</div><div class="pain-item">Зуб болить вже кілька днів, але терпите</div><div class="pain-item">Не знаєте скільки коштуватиме лікування</div></div><h2 class="sec-h">Що ви отримаєте на консультації</h2><div class="sol-list"><div class="sol-item">Огляд і точний діагноз без зайвих процедур</div><div class="sol-item">План лікування з вартістю — без прихованих доплат</div><div class="sol-item">Відповіді на всі запитання — без поспіху</div></div></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><div class="form-box" id="form"><h2>Записатись на безкоштовну консультацію</h2><p>Заповніть форму — передзвонимо протягом 15 хвилин</p><input type="text" placeholder="Ваше ім\'я"><input type="tel" placeholder="Номер телефону"><button class="btn" style="width:100%">Записатись →</button></div></div></section><footer class="ftr"><p>© 2026 Стоматологія. Всі права захищені.</p></footer></body></html>`
    },
    {
        key: 'mk-construction',
        niche: 'construction',
        nicheLabel: 'Будівництво',
        type: 'masterclass',
        typeLabel: 'Майстер-клас',
        title: 'МК для власників будівельного бізнесу',
        desc: 'Безкоштовний вебінар, реєстрація через Telegram',
        color: '#f59e0b',
        html: `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Мастер-класс для строительного бизнеса</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}:root{--green:#22c55e;--bg:#0a0f0a}.hero{background:var(--bg);padding:52px 20px;text-align:center;position:relative}.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(34,197,94,0.12),transparent)}.hero-in{position:relative}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.hero h1{font-size:clamp(22px,5vw,36px);font-weight:800;color:#fff;margin-bottom:12px}.hero p{font-size:17px;color:#94a3b8;margin-bottom:24px}.btn{display:inline-block;background:#0088cc;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:24px;font-weight:800;margin-bottom:18px;line-height:1.3}.gold-box{background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:20px;margin-bottom:24px}.gold-box li{list-style:none;padding:5px 0;color:#d1d5db;font-size:15px}.gold-box li::before{content:"▸ ";color:#fbbf24}.pain-list,.sol-list{display:grid;gap:10px;margin-bottom:24px}.pain-item{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:13px 15px;font-size:15px;color:#525252}.pain-item::before{content:"✗ ";color:#ef4444;font-weight:700}.sol-item{background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.18);border-radius:10px;padding:13px 15px;font-size:15px}.sol-item::before{content:"✓ ";color:#22c55e;font-weight:700}.prog-list{display:grid;gap:12px;margin-bottom:24px}.prog-item{display:flex;gap:14px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}.prog-num{width:36px;height:36px;background:var(--green);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;flex-shrink:0}.prog-item h3{font-size:14px;font-weight:700;margin-bottom:3px}.prog-item p{font-size:13px;color:#6b7280}.cta-fin{background:var(--bg);padding:52px 20px;text-align:center}.cta-fin h2{color:#fff;font-size:22px;font-weight:800;margin-bottom:12px}.cta-fin p{color:#94a3b8;font-size:15px;margin-bottom:24px}.ftr{background:var(--bg);border-top:1px solid rgba(255,255,255,0.07);padding:16px;text-align:center;color:#475569;font-size:12px}</style></head><body><section class="hero"><div class="wrap hero-in"><h1>Как перестать тащить строительный бизнес на себе</h1><p>Бесплатный мастер-класс для владельцев строительного бизнеса в Европе</p><div class="gold-box"><ul><li>80–90% решений без вашего участия</li><li>Управление бизнесом за ≈60 минут в день</li><li>Объекты идут без срывов сроков и переделок</li></ul></div><a href="https://t.me/" class="btn">Зарегистрироваться в Telegram</a></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><h2 class="sec-h">Вы узнаете себя в этих ситуациях</h2><div class="pain-list"><div class="pain-item">Бригада ждёт — без вас никто ничего не решит</div><div class="pain-item">Материалы не заказали — объект встал, сроки горят</div><div class="pain-item">Переделки и клиент звонит напрямую в любое время</div><div class="pain-item">Без вас бизнес просто не двигается</div></div></div></section><section class="sec"><div class="wrap"><h2 class="sec-h">Что вы получите за 60 минут</h2><div class="prog-list"><div class="prog-item"><div class="prog-num">1</div><div><h3>Почему бизнес зависит от владельца</h3><p>Какие процессы создают хаос и почему CRM не помогает</p></div></div><div class="prog-item"><div class="prog-num">2</div><div><h3>Готовая операционная система</h3><p>7 блоков от заявки до финальной оплаты без вашего участия</p></div></div><div class="prog-item"><div class="prog-num">3</div><div><h3>Как удвоить прибыль за 8 недель</h3><p>Снижение переделок, простоев и дебиторки без новых затрат</p></div></div></div></div></section><section class="cta-fin"><div class="wrap"><h2>Зарегистрируйтесь на бесплатный мастер-класс</h2><p>Четверг · 18:30 по Варшаве · Zoom · Без теории</p><a href="https://t.me/" class="btn">Зарегистрироваться →</a></div></section><footer class="ftr"><p>© 2026 TALKO Management System</p></footer></body></html>`
    },
    {
        key: 'consult-furniture',
        niche: 'furniture',
        nicheLabel: 'Меблі',
        type: 'consult',
        typeLabel: 'Консультація',
        title: 'Безкоштовний замір та прорахунок меблів',
        desc: 'Лід-магніт, замір + консультація дизайнера',
        color: '#8b5cf6',
        html: `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Безкоштовний замір меблів</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}.hero{background:linear-gradient(135deg,#1e1b4b,#312e81);padding:56px 20px;text-align:center}.hero h1{font-size:clamp(22px,5vw,36px);font-weight:800;color:#fff;margin-bottom:12px}.hero p{font-size:17px;color:#a5b4fc;margin-bottom:28px}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.btn{display:inline-block;background:#22c55e;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:24px;font-weight:800;margin-bottom:18px}.benefits{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px}.benefit{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;text-align:center}.benefit-icon{font-size:28px;margin-bottom:8px}.benefit h3{font-size:14px;font-weight:700;margin-bottom:4px}.benefit p{font-size:13px;color:#6b7280}.how-list{display:grid;gap:14px;margin-bottom:28px;counter-reset:steps}.how-item{display:flex;gap:14px;align-items:flex-start;background:#f8fafc;border-radius:12px;padding:16px}.how-num{width:32px;height:32px;background:#8b5cf6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0}.how-item h3{font-size:14px;font-weight:700;margin-bottom:3px}.how-item p{font-size:13px;color:#6b7280}.form-wrap{background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:16px;padding:32px;text-align:center}.form-wrap h2{font-size:22px;font-weight:800;margin-bottom:8px}.form-wrap p{color:#6b7280;margin-bottom:20px}.form-wrap input,.form-wrap select{width:100%;padding:12px 14px;border:1.5px solid #ddd6fe;border-radius:10px;font-size:15px;margin-bottom:12px;font-family:inherit;background:#fff}.ftr{background:#1e1b4b;color:#6b7280;text-align:center;padding:16px;font-size:13px}</style></head><body><header class="hero"><div class="wrap"><h1>Безкоштовний замір і прорахунок меблів під ваш простір</h1><p>Виїжджаємо в день звернення. Точний прорахунок з матеріалами та монтажем.</p><a href="#form" class="btn">Замовити безкоштовний замір</a></div></header><section class="sec"><div class="wrap"><h2 class="sec-h">Що входить у безкоштовний замір</h2><div class="benefits"><div class="benefit"><div class="benefit-icon">📐</div><h3>Точні виміри</h3><p>Замірник приїде з інструментами і врахує всі нюанси приміщення</p></div><div class="benefit"><div class="benefit-icon">🎨</div><h3>Дизайн-проект</h3><p>Підберемо кольори, матеріали та фурнітуру під ваш стиль</p></div><div class="benefit"><div class="benefit-icon">💰</div><h3>Точний кошторис</h3><p>Ціна з матеріалами та монтажем — без прихованих доплат</p></div><div class="benefit"><div class="benefit-icon">📅</div><h3>Терміни виготовлення</h3><p>Чіткі дати — коли буде готово і коли встановимо</p></div></div><h2 class="sec-h">Як це відбувається</h2><div class="how-list"><div class="how-item"><div class="how-num">1</div><div><h3>Залишаєте заявку</h3><p>Заповнюєте форму — передзвонимо протягом 30 хвилин</p></div></div><div class="how-item"><div class="how-num">2</div><div><h3>Замірник приїжджає</h3><p>У зручний для вас час — без передоплати</p></div></div><div class="how-item"><div class="how-num">3</div><div><h3>Отримуєте прорахунок</h3><p>Повний кошторис з 3D-візуалізацією протягом 24 годин</p></div></div></div></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><div class="form-wrap" id="form"><h2>Замовити безкоштовний замір</h2><p>Виїзд замірника — безкоштовно і без зобов\'язань</p><input type="text" placeholder="Ваше ім\'я"><input type="tel" placeholder="Номер телефону"><select><option value="">Що потрібно зробити?</option><option>Кухня</option><option>Шафа-купе</option><option>Спальня</option><option>Вітальня</option><option>Інше</option></select><button class="btn" style="width:100%">Замовити замір безкоштовно →</button><p style="font-size:12px;color:#9ca3af;margin-top:10px">Передзвонимо протягом 30 хвилин</p></div></div></section><footer class="ftr"><p>© 2026 Меблева майстерня. Виробництво меблів під замовлення.</p></footer></body></html>`
    },
    {
        key: 'mk-furniture',
        niche: 'furniture',
        nicheLabel: 'Меблі',
        type: 'masterclass',
        typeLabel: 'Майстер-клас',
        title: 'МК для власників мебельного бізнесу',
        desc: 'Система управління замовленнями без хаосу',
        color: '#f59e0b',
        html: `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Мастер-класс для мебельного бизнеса</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}:root{--green:#22c55e;--bg:#0a0f0a}.hero{background:var(--bg);padding:52px 20px;text-align:center;position:relative}.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(34,197,94,0.12),transparent)}.hero-in{position:relative}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.hero h1{font-size:clamp(22px,5vw,36px);font-weight:800;color:#fff;margin-bottom:12px}.hero p{font-size:17px;color:#94a3b8;margin-bottom:24px}.btn{display:inline-block;background:#0088cc;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:24px;font-weight:800;margin-bottom:18px}.gold-box{background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:20px;margin-bottom:24px}.gold-box li{list-style:none;padding:5px 0;color:#d1d5db;font-size:15px}.gold-box li::before{content:"▸ ";color:#fbbf24}.pain-list{display:grid;gap:10px;margin-bottom:24px}.pain-item{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:13px 15px;font-size:15px;color:#525252}.pain-item::before{content:"✗ ";color:#ef4444;font-weight:700}.prog-list{display:grid;gap:12px;margin-bottom:24px}.prog-item{display:flex;gap:14px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}.prog-num{width:36px;height:36px;background:var(--green);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;flex-shrink:0}.prog-item h3{font-size:14px;font-weight:700;margin-bottom:3px}.prog-item p{font-size:13px;color:#6b7280}.cta-fin{background:var(--bg);padding:52px 20px;text-align:center}.cta-fin h2{color:#fff;font-size:22px;font-weight:800;margin-bottom:12px}.cta-fin p{color:#94a3b8;font-size:15px;margin-bottom:24px}.ftr{background:var(--bg);border-top:1px solid rgba(255,255,255,0.07);padding:16px;text-align:center;color:#475569;font-size:12px}</style></head><body><section class="hero"><div class="wrap hero-in"><h1>Как перестать тащить мебельный бизнес на себе</h1><p>Бесплатный мастер-класс для владельцев мебельного бизнеса в Европе</p><div class="gold-box"><ul><li>80–90% вопросов решаются без вашего участия</li><li>Управление бизнесом за ≈60 минут в день</li><li>Заказы выполняются без брака и срывов сроков</li></ul></div><a href="https://t.me/" class="btn">Зарегистрироваться в Telegram</a></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><h2 class="sec-h">Вы узнаете себя?</h2><div class="pain-list"><div class="pain-item">Мастер останавливается — без вас не знает что делать дальше</div><div class="pain-item">Материал или фурнитуру не заказали вовремя — заказ встал</div><div class="pain-item">Переделки из-за неверных размеров — за счёт бизнеса</div><div class="pain-item">Клиент получил мебель и не платит финальный платёж</div></div></div></section><section class="sec"><div class="wrap"><h2 class="sec-h">Что вы получите за 60 минут</h2><div class="prog-list"><div class="prog-item"><div class="prog-num">1</div><div><h3>Почему мебельный бизнес зависит от владельца</h3><p>Какие процессы создают хаос и почему таблицы не решают проблему</p></div></div><div class="prog-item"><div class="prog-num">2</div><div><h3>Маршрут заказа от замера до оплаты</h3><p>7 ключевых блоков без вашего участия на каждом этапе</p></div></div><div class="prog-item"><div class="prog-num">3</div><div><h3>Как сократить брак и простои</h3><p>Стандарты качества которые работают без надзора владельца</p></div></div></div></div></section><section class="cta-fin"><div class="wrap"><h2>Зарегистрируйтесь на бесплатный мастер-класс</h2><p>Четверг · 18:30 по Варшаве · Zoom · Без теории</p><a href="https://t.me/" class="btn">Зарегистрироваться →</a></div></section><footer class="ftr"><p>© 2026 TALKO Management System</p></footer></body></html>`
    },
    {
        key: 'hire-construction',
        niche: 'construction',
        nicheLabel: 'Будівництво',
        type: 'hire',
        typeLabel: 'Найм',
        title: 'Шукаємо прораба / бригадира',
        desc: 'Лендінг для залучення кандидатів',
        color: '#ef4444',
        html: `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Вакансія прораба</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}.hero{background:linear-gradient(135deg,#1c1917,#292524);padding:56px 20px;text-align:center}.hero h1{font-size:clamp(22px,5vw,36px);font-weight:800;color:#fff;margin-bottom:12px}.hero-badge{display:inline-block;background:#22c55e;color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:16px}.hero p{font-size:17px;color:#a8a29e;margin-bottom:28px}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.btn{display:inline-block;background:#22c55e;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:24px;font-weight:800;margin-bottom:18px}.conditions{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px}.cond-item{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px}.cond-item .val{font-size:22px;font-weight:800;color:#22c55e;margin-bottom:4px}.cond-item p{font-size:13px;color:#6b7280}.req-list{display:grid;gap:10px;margin-bottom:28px}.req-item{display:flex;gap:10px;background:#f8fafc;border-radius:10px;padding:13px 15px;font-size:15px}.req-item::before{content:"✓";color:#22c55e;font-weight:700;flex-shrink:0}.steps{display:grid;gap:12px;margin-bottom:28px}.step{display:flex;gap:14px;align-items:flex-start}.step-num{width:32px;height:32px;background:#1c1917;color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}.step h3{font-size:14px;font-weight:700;margin-bottom:3px}.step p{font-size:13px;color:#6b7280}.form-wrap{background:#f8fafc;border-radius:16px;padding:28px;text-align:center}.form-wrap h2{font-size:22px;font-weight:800;margin-bottom:8px}.form-wrap p{color:#6b7280;margin-bottom:20px}.form-wrap input{width:100%;padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:15px;margin-bottom:12px;font-family:inherit}.ftr{background:#1c1917;color:#57534e;text-align:center;padding:16px;font-size:13px}</style></head><body><header class="hero"><div class="wrap"><div class="hero-badge">🔥 Відкрита вакансія</div><h1>Шукаємо досвідченого прораба в будівельну компанію</h1><p>Польща · Постійна зайнятість · Офіційне працевлаштування</p><a href="#form" class="btn">Відгукнутись на вакансію</a></div></header><section class="sec"><div class="wrap"><h2 class="sec-h">Умови роботи</h2><div class="conditions"><div class="cond-item"><div class="val">4 500–6 000 €</div><p>Заробітна плата на місяць (нетто)</p></div><div class="cond-item"><div class="val">Офіційно</div><p>Umowa o pracę, соціальні гарантії</p></div><div class="cond-item"><div class="val">Житло</div><p>Допомога з проживанням або компенсація</p></div><div class="cond-item"><div class="val">Авто</div><p>Службовий автомобіль для роз\'їздів</p></div></div><h2 class="sec-h">Що ми чекаємо</h2><div class="req-list"><div class="req-item">Досвід роботи прорабом або бригадиром від 3 років</div><div class="req-item">Вміння читати креслення і технічну документацію</div><div class="req-item">Навички організації роботи бригади</div><div class="req-item">Польська мова — базовий або середній рівень</div></div><h2 class="sec-h">Як відбувається відбір</h2><div class="steps"><div class="step"><div class="step-num">1</div><div><h3>Залишаєте заявку</h3><p>Заповнюєте форму — телефонуємо протягом доби</p></div></div><div class="step"><div class="step-num">2</div><div><h3>Коротка розмова по телефону</h3><p>15 хвилин — розповідаємо деталі, ви ставите питання</p></div></div><div class="step"><div class="step-num">3</div><div><h3>Виходите на роботу</h3><p>Оформлення і старт — протягом 2 тижнів</p></div></div></div></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><div class="form-wrap" id="form"><h2>Відгукнутись на вакансію</h2><p>Залиште контакти — передзвонимо протягом доби</p><input type="text" placeholder="Ваше ім\'я"><input type="tel" placeholder="Номер телефону"><input type="text" placeholder="Досвід роботи (коротко)"><button class="btn" style="width:100%">Відгукнутись →</button></div></div></section><footer class="ftr"><p>© 2026 Будівельна компанія. Всі права захищені.</p></footer></body></html>`
    },
    {
        key: 'beauty-booking',
        niche: 'beauty',
        nicheLabel: "Б'юті",
        type: 'booking',
        typeLabel: 'Запис',
        title: 'Запис на процедуру в салон краси',
        desc: 'Лід-магніт з онлайн-записом і акцією',
        color: '#ec4899',
        html: `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Запис у салон краси</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}.hero{background:linear-gradient(135deg,#4a044e,#701a75);padding:56px 20px;text-align:center}.hero h1{font-size:clamp(22px,5vw,34px);font-weight:800;color:#fff;margin-bottom:12px}.hero-promo{display:inline-block;background:#fbbf24;color:#1a1a1a;padding:8px 18px;border-radius:20px;font-size:14px;font-weight:700;margin-bottom:18px}.hero p{font-size:17px;color:#e879f9;margin-bottom:28px}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.btn{display:inline-block;background:#ec4899;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:24px;font-weight:800;margin-bottom:18px}.services{display:grid;gap:12px;margin-bottom:28px}.svc-item{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #fce7f3;border-radius:12px;padding:16px 18px}.svc-item h3{font-size:15px;font-weight:700}.svc-item .price{font-size:15px;font-weight:800;color:#ec4899}.svc-item .old{text-decoration:line-through;color:#9ca3af;font-size:13px;margin-right:6px}.masters{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px}.master{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center}.master-ava{width:64px;height:64px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:24px}.master h3{font-size:14px;font-weight:700;margin-bottom:3px}.master p{font-size:12px;color:#6b7280}.form-wrap{background:linear-gradient(135deg,#fdf4ff,#fce7f3);border-radius:16px;padding:28px;text-align:center}.form-wrap h2{font-size:22px;font-weight:800;margin-bottom:8px}.form-wrap p{color:#9d174d;margin-bottom:20px}.form-wrap input,.form-wrap select{width:100%;padding:12px 14px;border:1.5px solid #fbcfe8;border-radius:10px;font-size:15px;margin-bottom:12px;font-family:inherit;background:#fff}.ftr{background:#4a044e;color:#a21caf;text-align:center;padding:16px;font-size:13px}</style></head><body><header class="hero"><div class="wrap"><div class="hero-promo">🎁 -20% на перший візит</div><h1>Запишіться до салону краси і отримайте знижку 20%</h1><p>Манікюр, брови, вії, обличчя — все в одному місці</p><a href="#form" class="btn">Записатись зі знижкою</a></div></header><section class="sec"><div class="wrap"><h2 class="sec-h">Наші послуги</h2><div class="services"><div class="svc-item"><div><h3>Манікюр з покриттям</h3><p style="font-size:13px;color:#6b7280">Гель-лак, 45 хвилин</p></div><div><span class="old">400 грн</span><span class="price">320 грн</span></div></div><div class="svc-item"><div><h3>Корекція та фарбування брів</h3><p style="font-size:13px;color:#6b7280">Хна або барвник, 40 хвилин</p></div><div><span class="old">350 грн</span><span class="price">280 грн</span></div></div><div class="svc-item"><div><h3>Нарощування вій</h3><p style="font-size:13px;color:#6b7280">Класика або 2D, 2 години</p></div><div><span class="old">600 грн</span><span class="price">480 грн</span></div></div><div class="svc-item"><div><h3>Чищення обличчя</h3><p style="font-size:13px;color:#6b7280">Механічне + маска, 60 хвилин</p></div><div><span class="old">550 грн</span><span class="price">440 грн</span></div></div></div><h2 class="sec-h">Наші майстри</h2><div class="masters"><div class="master"><div class="master-ava">💅</div><h3>Аліна</h3><p>Манікюр та педикюр · 5 років досвіду</p></div><div class="master"><div class="master-ava">👁</div><h3>Катерина</h3><p>Вії та брови · 4 роки досвіду</p></div></div></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><div class="form-wrap" id="form"><h2>Записатись зі знижкою 20%</h2><p>Акція діє для нових клієнтів. Заповніть форму — підтвердимо час протягом 15 хвилин.</p><input type="text" placeholder="Ваше ім\'я"><input type="tel" placeholder="Номер телефону"><select><option value="">Оберіть послугу</option><option>Манікюр з покриттям</option><option>Корекція брів</option><option>Нарощування вій</option><option>Чищення обличчя</option></select><button class="btn" style="width:100%;background:#ec4899">Записатись зі знижкою →</button><p style="font-size:12px;color:#9ca3af;margin-top:10px">Знижка 20% — тільки для нових клієнтів</p></div></div></section><footer class="ftr"><p>© 2026 Beauty Studio. Всі права захищені.</p></footer></body></html>`
    },
    {
        key: 'hire-beauty',
        niche: 'beauty',
        nicheLabel: "Б'юті",
        type: 'hire',
        typeLabel: 'Найм',
        title: 'Шукаємо майстра манікюру / косметолога',
        desc: 'Лендінг для залучення майстрів у салон',
        color: '#ef4444',
        html: `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Вакансія майстра в салон</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}.hero{background:linear-gradient(135deg,#4a044e,#701a75);padding:56px 20px;text-align:center}.hero-badge{display:inline-block;background:#fbbf24;color:#1a1a1a;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:16px}.hero h1{font-size:clamp(22px,5vw,34px);font-weight:800;color:#fff;margin-bottom:12px}.hero p{font-size:17px;color:#e879f9;margin-bottom:28px}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.btn{display:inline-block;background:#ec4899;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:24px;font-weight:800;margin-bottom:18px}.perks{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px}.perk{background:#fff;border:1px solid #fce7f3;border-radius:12px;padding:18px;text-align:center}.perk .ico{font-size:26px;margin-bottom:8px}.perk .val{font-size:18px;font-weight:800;color:#ec4899;margin-bottom:4px}.perk p{font-size:13px;color:#6b7280}.req-list{display:grid;gap:10px;margin-bottom:24px}.req-item{display:flex;gap:10px;background:#fdf4ff;border-radius:10px;padding:12px 14px;font-size:15px}.req-item::before{content:"✓";color:#ec4899;font-weight:700;flex-shrink:0}.form-wrap{background:linear-gradient(135deg,#fdf4ff,#fce7f3);border-radius:16px;padding:28px;text-align:center}.form-wrap h2{font-size:22px;font-weight:800;margin-bottom:8px}.form-wrap p{color:#9d174d;margin-bottom:20px}.form-wrap input{width:100%;padding:12px 14px;border:1.5px solid #fbcfe8;border-radius:10px;font-size:15px;margin-bottom:12px;font-family:inherit;background:#fff}.ftr{background:#4a044e;color:#a21caf;text-align:center;padding:16px;font-size:13px}</style></head><body><header class="hero"><div class="wrap"><div class="hero-badge">🔥 Відкрита вакансія</div><h1>Шукаємо майстра манікюру в Beauty Studio</h1><p>Оренда місця або відсоток. Великий клієнтський потік.</p><a href="#form" class="btn">Відгукнутись на вакансію</a></div></header><section class="sec"><div class="wrap"><h2 class="sec-h">Що ми пропонуємо</h2><div class="perks"><div class="perk"><div class="ico">💰</div><div class="val">40–60%</div><p>Відсоток від виручки або оренда місця від 200 грн/день</p></div><div class="perk"><div class="ico">👥</div><div class="val">50+ клієнтів</div><p>Готова база і постійний потік нових клієнтів</p></div><div class="perk"><div class="ico">📅</div><div class="val">Графік</div><p>Гнучкий графік — самостійно обираєте зміни</p></div><div class="perk"><div class="ico">🎓</div><div class="val">Навчання</div><p>Майстер-класи і підвищення кваліфікації за рахунок салону</p></div></div><h2 class="sec-h">Що нам важливо</h2><div class="req-list"><div class="req-item">Досвід роботи майстром манікюру від 1 року</div><div class="req-item">Акуратність, охайний зовнішній вигляд</div><div class="req-item">Позитивне ставлення до клієнтів</div><div class="req-item">Власний клієнтський портфоліо — буде перевагою</div></div></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><div class="form-wrap" id="form"><h2>Відгукнутись на вакансію</h2><p>Залиште контакти — зв\'яжемося протягом доби</p><input type="text" placeholder="Ваше ім\'я"><input type="tel" placeholder="Номер телефону"><input type="text" placeholder="Спеціалізація (манікюр, вії, брови...)"><button class="btn" style="width:100%">Відгукнутись →</button></div></div></section><footer class="ftr"><p>© 2026 Beauty Studio. Всі права захищені.</p></footer></body></html>`
    },
    {
        key: 'horeca-catering',
        niche: 'horeca',
        nicheLabel: 'Хорека',
        type: 'consult',
        typeLabel: 'Прорахунок',
        title: 'Кейтеринг — розрахунок меню і вартості',
        desc: 'Форма замовлення кейтерингу на захід',
        color: '#f59e0b',
        html: `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Кейтеринг на ваш захід</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.6}.hero{background:linear-gradient(135deg,#1c0a00,#431407);padding:56px 20px;text-align:center}.hero h1{font-size:clamp(22px,5vw,34px);font-weight:800;color:#fff;margin-bottom:12px}.hero p{font-size:17px;color:#fdba74;margin-bottom:28px}.wrap{max-width:640px;margin:0 auto;padding:0 20px}.btn{display:inline-block;background:#f59e0b;color:#1a1a1a;padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer}.sec{padding:48px 0}.sec-h{font-size:24px;font-weight:800;margin-bottom:18px}.events{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px}.event{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;text-align:center}.event .ico{font-size:32px;margin-bottom:8px}.event h3{font-size:14px;font-weight:700}.benefits-list{display:grid;gap:10px;margin-bottom:28px}.benefit-item{display:flex;gap:12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:13px 15px;font-size:15px}.benefit-item::before{content:"✓";color:#f59e0b;font-weight:700;flex-shrink:0}.form-wrap{background:linear-gradient(135deg,#fff7ed,#fef3c7);border-radius:16px;padding:28px;text-align:center}.form-wrap h2{font-size:22px;font-weight:800;margin-bottom:8px}.form-wrap p{color:#92400e;margin-bottom:20px}.form-wrap input,.form-wrap select{width:100%;padding:12px 14px;border:1.5px solid #fed7aa;border-radius:10px;font-size:15px;margin-bottom:12px;font-family:inherit;background:#fff}.ftr{background:#1c0a00;color:#57534e;text-align:center;padding:16px;font-size:13px}</style></head><body><header class="hero"><div class="wrap"><h1>Кейтеринг на ваш захід — розрахунок меню безкоштовно</h1><p>Весілля, корпоративи, дні народження від 20 до 500 гостей</p><a href="#form" class="btn">Розрахувати вартість</a></div></header><section class="sec"><div class="wrap"><h2 class="sec-h">Для яких заходів</h2><div class="events"><div class="event"><div class="ico">💍</div><h3>Весілля</h3></div><div class="event"><div class="ico">🏢</div><h3>Корпоратив</h3></div><div class="event"><div class="ico">🎂</div><h3>День народження</h3></div><div class="event"><div class="ico">🎓</div><h3>Випускний</h3></div></div><h2 class="sec-h">Чому обирають нас</h2><div class="benefits-list"><div class="benefit-item">Власна кухня і кондитерський цех — без посередників</div><div class="benefit-item">Обладнання та посуд — включено у вартість</div><div class="benefit-item">Офіціанти та координатор заходу — у вашому розпорядженні</div><div class="benefit-item">Дегустація меню до підписання договору — безкоштовно</div></div></div></section><section class="sec" style="background:#f8fafc"><div class="wrap"><div class="form-wrap" id="form"><h2>Розрахувати вартість кейтерингу</h2><p>Заповніть форму — надішлемо прорахунок меню протягом 2 годин</p><input type="text" placeholder="Ваше ім\'я"><input type="tel" placeholder="Номер телефону"><select><option value="">Тип заходу</option><option>Весілля</option><option>Корпоратив</option><option>День народження</option><option>Інше</option></select><input type="number" placeholder="Кількість гостей"><button class="btn" style="width:100%">Отримати прорахунок →</button><p style="font-size:12px;color:#9ca3af;margin-top:10px">Відповімо протягом 2 годин у робочий час</p></div></div></section><footer class="ftr"><p>© 2026 Кейтеринг. Смачно і без турбот.</p></footer></body></html>`
    },
];

window.sitesOpenCreate = function () {
    document.getElementById('sitesCreateOverlay')?.remove();

    const niches = [
        { key: 'dental',       label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5c-1.5-2-4-2.5-5.5-1S5 8 6 10c.5 1 1 2 1 4 0 1 .5 2 1 2s1-.5 1-1 .5-1 1-1 1 .5 1 1-.5 1 1 1 1-1 1-2c0-2 .5-3 1-4 1-2 1-4.5-.5-6S13.5 3.5 12 5.5z"/></svg></span> Стоматологія', template: 'Dental Pro' },
        { key: 'construction', label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg></span> Будівництво', template: 'Build & Repair' },
        { key: 'legal',        label: '⚖️ Юристи', template: 'Legal Expert' },
        { key: 'auto',         label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></span> Авто', template: 'AutoService' },
        { key: 'beauty',       label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M5 22v-3a7 7 0 0 1 14 0v3"/><path d="M9 17v5"/><path d="M15 17v5"/></svg></span> Краса', template: 'Beauty Studio' },
        { key: 'fitness',      label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="5" x2="6" y2="19"/><line x1="18" y1="5" x2="18" y2="19"/><line x1="2" y1="12" x2="22" y2="12"/></svg></span> Фітнес', template: 'FitLife' },
        { key: 'education',    label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span> Освіта', template: 'Online Course' },
        { key: 'custom',       label: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>️ З нуля', template: null },
    ];

    const inp = 'width:100%;padding:0.5rem 0.6rem;border:1.5px solid #e5e7eb;border-radius:9px;font-size:0.83rem;box-sizing:border-box;font-family:inherit;';

    document.body.insertAdjacentHTML('beforeend', `
    <div id="sitesCreateOverlay" onclick="if(event.target===this)this.remove()"
        style="position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:10030;
        display:flex;align-items:center;justify-content:center;padding:1rem;">
        <div style="background:white;border-radius:18px;width:100%;max-width:860px;max-height:92vh;
            display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.18);">

            <!-- Хедер -->
            <div style="padding:1rem 1.5rem;border-bottom:1px solid #f1f5f9;
                display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <div>
                    <div style="font-weight:800;font-size:1rem;">${window.t('sitesNew')}</div>
                    <div style="font-size:0.72rem;color:#9ca3af;margin-top:2px;">Виберіть режим і налаштуйте сайт</div>
                </div>
                <button onclick="document.getElementById('sitesCreateOverlay').remove()"
                    style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.3rem;line-height:1;">✕</button>
            </div>

            <!-- Тіло — два стовпці -->
            <div style="display:flex;flex:1;overflow:hidden;">

                <!-- Ліва колонка — налаштування -->
                <div style="width:320px;flex-shrink:0;padding:1.25rem;border-right:1px solid #f1f5f9;
                    overflow-y:auto;display:flex;flex-direction:column;gap:0.85rem;">

                    <div>
                        <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.3rem;">Назва сайту</label>
                        <input id="sc_name" placeholder="${window.t('siteNameEx')}"
                            style="${inp}" autofocus>
                    </div>

                    <!-- Режим -->
                    <div>
                        <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.4rem;">Режим створення</label>
                        <div style="display:flex;flex-direction:column;gap:0.3rem;">
                            <button id="sc_mode_blocks" onclick="sitesSetCreateMode('blocks')"
                                style="width:100%;padding:0.55rem 0.75rem;border:2px solid #22c55e;border-radius:10px;
                                background:#f0fdf4;color:#16a34a;font-size:0.8rem;font-weight:700;cursor:pointer;
                                display:flex;align-items:center;gap:0.4rem;text-align:left;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                Конструктор блоків
                            </button>
                            <button id="sc_mode_html" onclick="sitesSetCreateMode('html')"
                                style="width:100%;padding:0.55rem 0.75rem;border:2px solid #e5e7eb;border-radius:10px;
                                background:white;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;
                                display:flex;align-items:center;gap:0.4rem;text-align:left;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                                Вставити HTML
                            </button>
                            <button id="sc_mode_library" onclick="sitesSetCreateMode('library')"
                                style="width:100%;padding:0.55rem 0.75rem;border:2px solid #e5e7eb;border-radius:10px;
                                background:white;color:#6b7280;font-size:0.8rem;font-weight:600;cursor:pointer;
                                display:flex;align-items:center;gap:0.4rem;text-align:left;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                З бібліотеки шаблонів
                            </button>
                        </div>
                    </div>

                    <!-- Блоки секція -->
                    <div id="sc_blocks_section" style="display:flex;flex-direction:column;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.3rem;">Опис (необов\'язково)</label>
                            <input id="sc_desc" placeholder="${window.t('sitesDescPh')}" style="${inp}">
                        </div>
                        <div>
                            <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.45rem;">Шаблон (ніша)</label>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.35rem;" id="sc_niches">
                                ${niches.map(n => `
                                <div onclick="sitesSelectNiche('${n.key}')" id="scn_${n.key}"
                                    style="padding:0.45rem 0.6rem;border:2px solid #e5e7eb;border-radius:9px;
                                    cursor:pointer;font-size:0.75rem;font-weight:500;transition:all 0.15s;
                                    display:flex;align-items:center;gap:0.35rem;">
                                    ${_esc(n.label)}
                                </div>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- HTML секція -->
                    <div id="sc_html_section" style="display:none;flex-direction:column;gap:0.5rem;">
                        <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.3rem;">HTML код сторінки</label>
                        <textarea id="sc_html" rows="12"
                            placeholder="<!DOCTYPE html>&#10;<html>&#10;  <head>...</head>&#10;  <body>&#10;    <!-- Ваш HTML сюди -->&#10;  </body>&#10;</html>"
                            style="width:100%;padding:0.5rem;border:1.5px solid #e5e7eb;border-radius:9px;
                            font-size:0.72rem;font-family:monospace;box-sizing:border-box;resize:vertical;
                            line-height:1.5;min-height:220px;"></textarea>
                        <div style="font-size:0.65rem;color:#9ca3af;">
                            ${window.t('siteHtmlHint')||'Вставте повний HTML — сайт буде одразу опублікований'}
                        </div>
                    </div>

                    <!-- Бібліотека секція — фільтри -->
                    <div id="sc_library_section" style="display:none;flex-direction:column;gap:0.5rem;">
                        <div>
                            <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.4rem;">Ніша</label>
                            <select id="sc_lib_niche" onchange="sitesFilterLibrary()"
                                style="${inp}">
                                <option value="">Всі ніші</option>
                                <option value="dental">Медицина</option>
                                <option value="construction">Будівництво</option>
                                <option value="furniture">Меблі</option>
                                <option value="beauty">Б\'юті</option>
                                <option value="horeca">Хорека</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:0.4rem;">Тип сторінки</label>
                            <select id="sc_lib_type" onchange="sitesFilterLibrary()"
                                style="${inp}">
                                <option value="">Всі типи</option>
                                <option value="consult">Консультація / Запис</option>
                                <option value="masterclass">Майстер-клас</option>
                                <option value="hire">Найм</option>
                                <option value="booking">Бронювання</option>
                            </select>
                        </div>
                        <div id="sc_lib_selected" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px;padding:10px 12px;">
                            <div style="font-size:0.7rem;font-weight:700;color:#16a34a;margin-bottom:3px;">✓ Шаблон обрано</div>
                            <div id="sc_lib_selected_title" style="font-size:0.78rem;color:#15803d;font-weight:600;"></div>
                        </div>
                    </div>
                </div>

                <!-- Права колонка — превью -->
                <div style="flex:1;overflow-y:auto;padding:1.25rem;background:#f8fafc;">

                    <!-- Превью блоків/HTML режим -->
                    <div id="sc_preview_hint" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#9ca3af;text-align:center;gap:0.5rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <div style="font-size:0.85rem;font-weight:600;">Превью сайту</div>
                        <div style="font-size:0.75rem;">Оберіть шаблон з бібліотеки<br>щоб побачити попередній перегляд</div>
                    </div>

                    <!-- Бібліотека карток -->
                    <div id="sc_library_grid" style="display:none;display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;"></div>

                    <!-- iframe превью обраного шаблону -->
                    <div id="sc_preview_wrap" style="display:none;height:100%;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                            <span style="font-size:0.75rem;font-weight:700;color:#374151;">Попередній перегляд</span>
                            <button onclick="sitesBackToLibrary()"
                                style="font-size:0.72rem;color:#6b7280;background:white;border:1px solid #e5e7eb;
                                border-radius:7px;padding:4px 10px;cursor:pointer;">← Назад до бібліотеки</button>
                        </div>
                        <iframe id="sc_preview_iframe"
                            style="width:100%;height:calc(100% - 40px);border:none;border-radius:10px;
                            box-shadow:0 2px 12px rgba(0,0,0,0.08);background:#fff;"></iframe>
                    </div>
                </div>
            </div>

            <!-- Футер -->
            <div style="padding:0.85rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:0.4rem;flex-shrink:0;">
                <button onclick="document.getElementById('sitesCreateOverlay').remove()"
                    style="padding:0.5rem 1rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:0.82rem;">
                    Скасувати
                </button>
                <button onclick="sitesCreate()"
                    style="padding:0.5rem 1.4rem;background:#22c55e;color:white;border:none;
                    border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;
                    box-shadow:0 2px 8px rgba(34,197,94,0.3);">
                    Створити сайт →
                </button>
            </div>
        </div>
    </div>`);

    document.getElementById('sc_name')?.focus();
    // Ініціалізуємо бібліотеку карток
    sitesRenderLibraryGrid(SITE_TEMPLATES);
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
                <div style="font-size:0.7rem;color:#9ca3af;margin-top:1px;">${window.t('pasteHtml')||'Вставте або відредагуйте HTML'} — натисніть Зберегти</div>
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
                ${window.t('publishedWord')||'Опублікований'}
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
        if (typeof showToast === 'function') showToast(window.t('errPfx2') + e.message, 'error');
    }
};

let _createMode = 'blocks'; // 'blocks' | 'html' | 'library'
let _selectedLibraryTemplate = null;

window.sitesSetCreateMode = function(mode) {
    _createMode = mode;
    const btnBlocks  = document.getElementById('sc_mode_blocks');
    const btnHtml    = document.getElementById('sc_mode_html');
    const btnLib     = document.getElementById('sc_mode_library');
    const secBlocks  = document.getElementById('sc_blocks_section');
    const secHtml    = document.getElementById('sc_html_section');
    const secLib     = document.getElementById('sc_library_section');
    const prevHint   = document.getElementById('sc_preview_hint');
    const prevGrid   = document.getElementById('sc_library_grid');
    const prevWrap   = document.getElementById('sc_preview_wrap');

    // скидаємо всі кнопки
    const btns = [btnBlocks, btnHtml, btnLib];
    btns.forEach(b => { if(b){ b.style.borderColor='#e5e7eb'; b.style.background='white'; b.style.color='#6b7280'; b.style.fontWeight='600'; }});

    // ховаємо всі секції
    [secBlocks, secHtml, secLib].forEach(s => { if(s) s.style.display='none'; });
    if (prevHint) prevHint.style.display='flex';
    if (prevGrid) prevGrid.style.display='none';
    if (prevWrap) prevWrap.style.display='none';

    if (mode === 'html') {
        if (btnHtml) { btnHtml.style.borderColor='#8b5cf6'; btnHtml.style.background='#f5f3ff'; btnHtml.style.color='#7c3aed'; btnHtml.style.fontWeight='700'; }
        if (secHtml) secHtml.style.display='flex';
        setTimeout(() => document.getElementById('sc_html')?.focus(), 50);
    } else if (mode === 'library') {
        if (btnLib) { btnLib.style.borderColor='#f59e0b'; btnLib.style.background='#fffbeb'; btnLib.style.color='#b45309'; btnLib.style.fontWeight='700'; }
        if (secLib) secLib.style.display='flex';
        if (prevHint) prevHint.style.display='none';
        if (prevGrid) { prevGrid.style.display='grid'; }
        sitesFilterLibrary();
    } else {
        if (btnBlocks) { btnBlocks.style.borderColor='#22c55e'; btnBlocks.style.background='#f0fdf4'; btnBlocks.style.color='#16a34a'; btnBlocks.style.fontWeight='700'; }
        if (secBlocks) secBlocks.style.display='flex';
    }
};

// ── Бібліотека: рендер карток ─────────────────────────────
window.sitesRenderLibraryGrid = function(templates) {
    const grid = document.getElementById('sc_library_grid');
    if (!grid) return;
    if (!templates.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#9ca3af;padding:2rem;font-size:0.85rem;">Шаблони не знайдено</div>';
        return;
    }
    grid.innerHTML = templates.map(t => `
    <div onclick="sitesSelectLibraryTemplate('${t.key}')" id="slt_${t.key}"
        style="background:white;border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;
        cursor:pointer;transition:all 0.15s;"
        onmouseenter="this.style.borderColor='${t.color}';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'"
        onmouseleave="this.style.borderColor=window._selectedLibraryTemplate===this.dataset.key?'${t.color}':'#e5e7eb';this.style.boxShadow='none'"
        data-key="${t.key}">
        <div style="height:6px;background:${t.color};"></div>
        <div style="padding:12px 14px;">
            <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
                <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:8px;
                    background:${t.color}18;color:${t.color};">${t.nicheLabel}</span>
                <span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:8px;
                    background:#f1f5f9;color:#6b7280;">${t.typeLabel}</span>
            </div>
            <div style="font-size:0.82rem;font-weight:700;color:#111;margin-bottom:4px;line-height:1.3;">${t.title}</div>
            <div style="font-size:0.72rem;color:#9ca3af;line-height:1.4;">${t.desc}</div>
            <button onclick="event.stopPropagation();sitesPreviewTemplate('${t.key}')"
                style="margin-top:10px;width:100%;padding:6px;background:#f8fafc;border:1px solid #e5e7eb;
                border-radius:7px;cursor:pointer;font-size:0.72rem;font-weight:600;color:#374151;">
                👁 Переглянути
            </button>
        </div>
    </div>`).join('');
};

window.sitesFilterLibrary = function() {
    const niche = document.getElementById('sc_lib_niche')?.value || '';
    const type  = document.getElementById('sc_lib_type')?.value  || '';
    const filtered = SITE_TEMPLATES.filter(t =>
        (!niche || t.niche === niche) &&
        (!type  || t.type  === type)
    );
    sitesRenderLibraryGrid(filtered);
};

window.sitesSelectLibraryTemplate = function(key) {
    _selectedLibraryTemplate = key;
    const t = SITE_TEMPLATES.find(x => x.key === key);
    if (!t) return;
    // підсвічуємо картку
    document.querySelectorAll('[id^="slt_"]').forEach(el => {
        el.style.borderColor = '#e5e7eb';
        el.style.boxShadow   = 'none';
    });
    const card = document.getElementById('slt_' + key);
    if (card) { card.style.borderColor = t.color; card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }
    // показуємо обраний шаблон
    const sel = document.getElementById('sc_lib_selected');
    const selTitle = document.getElementById('sc_lib_selected_title');
    if (sel) sel.style.display = 'block';
    if (selTitle) selTitle.textContent = t.title;
    // підставляємо назву в поле якщо порожнє
    const nameInput = document.getElementById('sc_name');
    if (nameInput && !nameInput.value.trim()) nameInput.value = t.title;
};

window.sitesPreviewTemplate = function(key) {
    const t = SITE_TEMPLATES.find(x => x.key === key);
    if (!t) return;
    // позначаємо як обраний
    sitesSelectLibraryTemplate(key);
    // показуємо iframe
    const grid = document.getElementById('sc_library_grid');
    const wrap  = document.getElementById('sc_preview_wrap');
    const iframe = document.getElementById('sc_preview_iframe');
    if (grid) grid.style.display = 'none';
    if (wrap) wrap.style.display = 'block';
    if (iframe) {
        iframe.srcdoc = t.html;
    }
};

window.sitesBackToLibrary = function() {
    const grid = document.getElementById('sc_library_grid');
    const wrap  = document.getElementById('sc_preview_wrap');
    if (grid) grid.style.display = 'grid';
    if (wrap) wrap.style.display = 'none';
};

window.sitesCreate = async function () {
    const name = document.getElementById('sc_name')?.value.trim();
    if (!name) { if(window.showToast)showToast(window.t('sitesEnterName'),'warning'); else alert(window.t('sitesEnterName')); return; }

    // ── Бібліотека режим ──────────────────────────────────
    if (_createMode === 'library') {
        if (!_selectedLibraryTemplate) {
            if(window.showToast) showToast('Оберіть шаблон з бібліотеки', 'warning');
            return;
        }
        const tpl = SITE_TEMPLATES.find(x => x.key === _selectedLibraryTemplate);
        if (!tpl) return;
        try {
            await window.companyRef().collection(window.DB_COLS?.SITES || 'sites').add({
                name,
                description: tpl.desc || '',
                niche: tpl.nicheLabel,
                nicheKey: tpl.niche,
                status: 'published',
                mode: 'html',
                rawHtml: tpl.html,
                templateKey: tpl.key,
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
            _selectedLibraryTemplate = null;
            document.getElementById('sitesCreateOverlay')?.remove();
            if (typeof showToast === 'function') showToast('🚀 Сайт зі шаблону створено і опубліковано!', 'success');
            if (typeof window.initSitesModule === 'function') window.initSitesModule();
        } catch(e) {
            if(window.showToast) showToast(window.t('errPfx2') + e.message, 'error');
        }
        return;
    }

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
            if (typeof showToast === 'function') showToast(window.t('siteCreatedPublished')||'🚀 Сайт створено і опубліковано!', 'success');
            // Оновлюємо список — не відкриваємо білдер (HTML режим)
            if (typeof window.initSitesModule === 'function') window.initSitesModule();
        } catch(e) {
            if(window.showToast) showToast(window.t('errPfx2') + e.message, 'error');
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
        reviews:  { type:'reviews', order, title:window.t('clientReviews'), items:[
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
            <div style="margin-bottom:0.5rem;color:#22c55e;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg></div>
            <div style="font-weight:800;font-size:1.1rem;">${window.t('sitePublished')||'Сайт опубліковано!'}</div>
            <div style="color:#6b7280;font-size:0.85rem;margin-top:4px;">Ваш сайт доступний за посиланням:</div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-bottom:1.25rem;">
            <input id="sitePublicUrlInput" value="${url}" readonly
                style="flex:1;padding:0.6rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:0.8rem;font-family:monospace;background:#f9fafb;">
            <button onclick="navigator.clipboard?.writeText('${url}');this.textContent='✓';setTimeout(()=>this.textContent=window.t('copyWord'),1500);"
                style="padding:0.6rem 1rem;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.82rem;white-space:nowrap;">
                ${window.t('copyWord')}
            </button>
        </div>
        <div style="display:flex;gap:0.5rem;">
            <button onclick="window.open('${url}','_blank');"
                style="flex:1;padding:0.55rem;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                ${window.t('openSite')||'🌐 Відкрити сайт'}
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
            : 'https://apptalko.com';
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
    if (!(await (window.showConfirmModal ? showConfirmModal('Видалити сайт "' + name + '"?\n' + window.t('allBlocksDeleted'),{danger:true}) : Promise.resolve(confirm('Видалити сайт "' + name + '"?\n' + window.t('allBlocksDeleted')))))) return;
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
            <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;">${name} — ${window.t('analyticsWord')||'Аналітика'}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem;">
                <div style="background:#f0fdf4;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:#22c55e;">${visits}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">${window.t('visitsWord')||'Відвідувань'}</div>
                </div>
                <div style="background:#eff6ff;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:#3b82f6;">${leads}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">Заявок</div>
                </div>
                <div style="background:#fefce8;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:#f59e0b;">${conv}%</div>
                    <div style="font-size:0.7rem;color:#6b7280;">${window.t('conversionWord')||'Конверсія'}</div>
                </div>
                <div style="background:#f9fafb;border-radius:8px;padding:0.75rem;text-align:center;">
                    <div style="font-size:0.78rem;font-weight:700;color:#374151;">${lastVisit}</div>
                    <div style="font-size:0.7rem;color:#6b7280;">${window.t('lastVisit')||'Останній візит'}</div>
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
