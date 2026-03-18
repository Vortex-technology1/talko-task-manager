// =============================================
// MODULE 72 — GLOBAL SEARCH v3
// =============================================

(function() {
    'use strict';

    // i18n helper — читає поточну мову через window.t
    function gs_t(key, fallback) {
        return (window.t && window.t(key)) || fallback;
    }
    let activeIndex = -1;
    let currentResults = [];

    // Search history on focus
    document.addEventListener('focusin', function(e) {
        if (e.target && e.target.id === 'globalSearchInput') {
            if (!e.target.value) showSearchHistory('globalSearchResults');
        }
    });

    // FIX БАГ A: pointerdown listener один раз, поза globalSearch()
    function setupResultsListener(containerId) {
        const r = document.getElementById(containerId);
        if (!r || r._gsearchListenerSet) return;
        r._gsearchListenerSet = true;
        r.addEventListener('pointerdown', function(e) {
            const item = e.target.closest('.gsearch-item');
            if (item) {
                e.preventDefault();
                const idx = parseInt(item.dataset.idx, 10);
                selectResult(idx, containerId === 'mobileSearchResults');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        setupResultsListener('globalSearchResults');
        setupResultsListener('mobileSearchResults');
        initMobileSearchBtn();
    });
    setTimeout(function() {
        setupResultsListener('globalSearchResults');
        setupResultsListener('mobileSearchResults');
        initMobileSearchBtn();
    }, 800);

    // Ctrl+K / Cmd+K
    document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const inp = document.getElementById('globalSearchInput');
            if (inp) { inp.focus(); inp.select(); }
            return;
        }
        if (e.key === 'Escape') {
            const r = document.getElementById('globalSearchResults');
            const rm = document.getElementById('mobileSearchResults');
            const panelOpen = (r && r.style.display !== 'none') ||
                              (rm && rm.style.display !== 'none');
            if (panelOpen) {
                e.stopPropagation();
                hideGlobalSearch();
            }
            // FIX БАГ G: якщо пошук закритий — не заважаємо іншим Escape handlers
            return;
        }
        // Клавіатурна навігація
        const inp = document.getElementById('globalSearchInput');
        if (document.activeElement === inp) {
            if (e.key === 'ArrowDown') { e.preventDefault(); navigateSearch(1); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); navigateSearch(-1); }
            if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectResult(activeIndex, false); }
        }
    });

    function navigateSearch(dir) {
        if (!currentResults.length) return;
        activeIndex = Math.max(0, Math.min(currentResults.length - 1, activeIndex + dir));
        highlightActive();
    }

    function highlightActive() {
        document.querySelectorAll('.gsearch-item').forEach((el, i) => {
            el.style.background = i === activeIndex ? '#f0fdf4' : '';
            el.style.outline = i === activeIndex ? '2px solid #22c55e' : '';
        });
        const active = document.querySelectorAll('.gsearch-item')[activeIndex];
        if (active) active.scrollIntoView({ block: 'nearest' });
    }

    window.hideGlobalSearch = function() {
        const r = document.getElementById('globalSearchResults');
        if (r) r.style.display = 'none';
        activeIndex = -1;
    };

    // FIX БАГ F: sanitize для badgeColor
    function safeCssColor(val) {
        if (!val) return '#6b7280';
        if (/^#[0-9a-fA-F]{3,6}$/.test(val)) return val;
        const named = {red:'#ef4444',green:'#22c55e',blue:'#3b82f6',orange:'#f97316',purple:'#8b5cf6',gray:'#6b7280'};
        return named[val] || '#6b7280';
    }

    const safeEsc = (str) => String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const highlight = (str, q) => safeEsc(str).replace(
        new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'),
        '<mark>$1</mark>'
    );

    function buildResults(q) {
        const results = [];

        // ЗАВДАННЯ
        if (typeof tasks !== 'undefined') {
            tasks.filter(t =>
                (t.title||'').toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q)
            ).slice(0, 5).forEach(t => {
                const statusColor = t.status==='done'?'#22c55e':t.status==='progress'?'#3b82f6':'#f59e0b';
                const assignee = (typeof users!=='undefined') ? users.find(u=>u.id===t.assigneeId) : null;
                const assigneeName = assignee ? (assignee.name||assignee.email).split(' ')[0] : '';
                const today = (typeof getLocalDateStr==='function') ? getLocalDateStr(new Date()) : '';
                const isOverdue = t.deadlineDate && t.deadlineDate < today && t.status !== 'done' && t.status !== 'review';
                results.push({
                    category: gs_t('gsSearchTasks','Завдання'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>',
                    title: t.title||'(без назви)',
                    subtitle: [assigneeName, t.deadlineDate].filter(Boolean).join(' · '),
                    badge: t.status==='done'?gs_t('gsStatusDone','Виконано'):t.status==='progress'?gs_t('gsStatusProgress','В роботі'):gs_t('gsStatusNew','Нове'),
                    badgeColor: statusColor, overdue: isOverdue,
                    action: () => { if (typeof openTaskModal==='function') openTaskModal(t.id); }
                });
            });
        }

        // СПІВРОБІТНИКИ
        if (typeof users !== 'undefined') {
            users.filter(u =>
                (u.name||'').toLowerCase().includes(q) ||
                (u.email||'').toLowerCase().includes(q) ||
                (u.role||'').toLowerCase().includes(q)
            ).slice(0, 4).forEach(u => {
                const userTasks = (typeof tasks!=='undefined') ? tasks.filter(t=>t.assigneeId===u.id&&t.status!=='done') : [];
                const roleMap = {owner:gs_t('roleOwner','Власник'),manager:gs_t('roleManager','Менеджер'),admin:gs_t('roleAdmin',window.t('adminWord2')),employee:gs_t('roleEmployee',window.t('employeeWord2'))};
                results.push({
                    category: gs_t('gsSearchUsers','Співробітники'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>',
                    title: u.name||u.email,
                    subtitle: `${u.email} · ${userTasks.length} ${gs_t('gsActive','активних')}`,
                    badge: (roleMap[u.role]||u.role),
                    badgeColor: u.role==='owner'?'#22c55e':u.role==='manager'?'#f97316':'#6b7280',
                    action: () => {
                        if (typeof switchTab==='function') switchTab('users');
                        setTimeout(() => {
                            document.querySelectorAll('.user-card').forEach(card => {
                                if (card.getAttribute('onclick')?.includes(u.id)) {
                                    card.scrollIntoView({behavior:'smooth',block:'center'});
                                    card.style.outline='2px solid #22c55e';
                                    setTimeout(()=>card.style.outline='',2000);
                                }
                            });
                        }, 400);
                    }
                });
            });
        }

        // ФУНКЦІЇ
        if (typeof functions !== 'undefined') {
            functions.filter(f => f.status!=='archived' && (
                (f.name||'').toLowerCase().includes(q) ||
                (f.description||'').toLowerCase().includes(q) ||
                (f.result||'').toLowerCase().includes(q) ||
                (f.contacts||'').toLowerCase().includes(q) ||
                (f.keywords||[]).some(k => (k||'').toLowerCase().includes(q)) ||
                (f.headName||'').toLowerCase().includes(q) ||
                (f.communicatesWith||[]).some(c =>
                    (c.topics||[]).some(t => (t||'').toLowerCase().includes(q))
                )
            )).slice(0, 4).forEach(f => {
                const ownerUser = (typeof users!=='undefined') ? users.find(u=>u.id===f.headId) : null;
                const ownerName = ownerUser ? (ownerUser.name||ownerUser.email) : (f.headName||'');
                // Build rich subtitle: owner + ЦКП (truncated)
                const resultSnippet = f.result ? (f.result.length > 55 ? f.result.substring(0,55)+'…' : f.result) : '';
                const subtitleParts = [
                    ownerName ? '👤 ' + ownerName : '',
                    resultSnippet ? '🎯 ' + resultSnippet : ''
                ].filter(Boolean);
                // Keywords hint if matched via keyword
                const matchedKeyword = (f.keywords||[]).find(k => (k||'').toLowerCase().includes(q));
                const keywordHint = matchedKeyword ? ' · 🔑 ' + matchedKeyword : '';
                results.push({
                    category: gs_t('gsSearchFunctions','Функції'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span>️',
                    title: f.name,
                    subtitle: subtitleParts.join(' · ') + keywordHint,
                    badge: gs_t('gsSearchFunctionBadge','Функція'), badgeColor:'#8b5cf6',
                    action: () => {
                        if (typeof switchTab==='function') switchTab('functions');
                        setTimeout(() => {
                            const cards = document.querySelectorAll('.function-card');
                            let found = false;
                            cards.forEach(card => {
                                if (!found && card.getAttribute('onclick')?.includes(f.id)) {
                                    found = true;
                                    card.scrollIntoView({behavior:'smooth',block:'center'});
                                    card.style.outline='2px solid #8b5cf6';
                                    setTimeout(()=>card.style.outline='',2000);
                                }
                            });
                        }, 500);
                    }
                });
            });
        }

        // ПРОЄКТИ
        if (typeof projects !== 'undefined') {
            projects.filter(p =>
                (p.name||'').toLowerCase().includes(q)||(p.description||'').toLowerCase().includes(q)
            ).slice(0, 3).forEach(p => {
                const taskCount = (typeof tasks!=='undefined') ? tasks.filter(t=>t.projectId===p.id&&t.status!=='done').length : 0;
                results.push({
                    category: gs_t('gsSearchProjects','Проєкти'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>',
                    title: p.name, subtitle:`${taskCount} ${gs_t('gsActiveTasks','активних завдань')}`,
                    badge: gs_t('gsSearchProjectBadge','Проєкт'), badgeColor:'#3b82f6',
                    action: () => {
                        if (typeof switchTab==='function') switchTab('projects');
                        setTimeout(() => {
                            // Реальний клас: .project-card, onclick openProjectDetail(p.id)
                            const cards = document.querySelectorAll('.project-card');
                            let found = false;
                            cards.forEach(card => {
                                if (!found && card.getAttribute('onclick')?.includes(p.id)) {
                                    found = true;
                                    card.scrollIntoView({behavior:'smooth',block:'center'});
                                    card.style.outline='2px solid #3b82f6';
                                    setTimeout(()=>card.style.outline='',2000);
                                }
                            });
                        }, 500);
                    }
                });
            });
        }

        // ПРОЦЕСИ
        if (typeof processes !== 'undefined') {
            processes.filter(p =>
                (p.name||'').toLowerCase().includes(q)||(p.description||'').toLowerCase().includes(q)
            ).slice(0, 2).forEach(p => {
                const desc = p.description||'';
                results.push({
                    category: gs_t('gsSearchProcesses','Процеси'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></span>',
                    title: p.name,
                    subtitle: desc.length>60 ? desc.substring(0,60)+'…' : desc,
                    badge: gs_t('gsSearchProcessBadge','Процес'), badgeColor:'#06b6d4',
                    action: () => {
                        if (typeof switchTab==='function') switchTab('processes');
                        setTimeout(() => {
                            // Реальний клас: .process-pipeline-row, onclick openViewProcessModal(id)
                            const rows = document.querySelectorAll('.process-pipeline-row');
                            let found = false;
                            rows.forEach(row => {
                                if (!found && row.getAttribute('onclick')?.includes(p.id)) {
                                    found = true;
                                    row.scrollIntoView({behavior:'smooth',block:'center'});
                                    row.style.outline='2px solid #06b6d4';
                                    setTimeout(()=>row.style.outline='',2000);
                                }
                            });
                        }, 500);
                    }
                });
            });
        }

        // РЕГУЛЯРНІ ЗАВДАННЯ
        const regularTasks = window._regularTasks || [];
        if (regularTasks.length) {
            regularTasks.filter(t =>
                (t.title||'').toLowerCase().includes(q)||(t.description||'').toLowerCase().includes(q)
            ).slice(0, 3).forEach(t => {
                const assignee = (typeof users!=='undefined') ? users.find(u=>u.id===t.assigneeId) : null;
                results.push({
                    category: gs_t('gsSearchRegular','Регулярні'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span>',
                    title: t.title||'(без назви)',
                    subtitle: assignee ? (assignee.name||assignee.email) : '',
                    badge: gs_t('gsSearchRegularBadge','Регулярне'), badgeColor:'#06b6d4',
                    action: () => { if (typeof switchTab==='function') switchTab('regular'); }
                });
            });
        }

        // КООРДИНАЦІЇ (наради)
        const _coords = window._coordinations || [];
        if (_coords.length) {
            _coords.filter(c =>
                (c.name||'').toLowerCase().includes(q)||(c.description||'').toLowerCase().includes(q)
            ).slice(0, 3).forEach(c => {
                results.push({
                    category: gs_t('gsSearchCoordination','Координація'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>',
                    title: c.name||'(без назви)',
                    subtitle: c.type||'',
                    badge: c.status==='active'?gs_t('gsStatusActive','Активна'):gs_t('gsStatusDone2','Завершена'),
                    badgeColor: c.status==='active'?'#22c55e':'#9ca3af',
                    action: () => {
                        if (typeof switchTab==='function') switchTab('coordination');
                        if (window._initCoordTab) setTimeout(window._initCoordTab, 100);
                    }
                });
            });
        }

        // МЕТРИКИ
        const _metrics = window._metrics || [];
        if (_metrics.length) {
            _metrics.filter(m =>
                (m.name||'').toLowerCase().includes(q)
            ).slice(0, 3).forEach(m => {
                results.push({
                    category: gs_t('gsSearchStatistics','Статистика'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>',
                    title: m.name,
                    subtitle: m.unit ? gs_t('gsUnit','Одиниця: ') + m.unit : '',
                    badge: gs_t('gsSearchMetric','Метрика'), badgeColor:'#8b5cf6',
                    action: () => { if (typeof switchTab==='function') switchTab('statistics'); }
                });
            });
        }

        // НАВІГАЦІЯ по вкладках
        const navItems = [
            {keys:['мій день','myday','my day','mein tag','mon jour','mój dzień'], label: gs_t('tabMyDay','Мій день'), tab:'myday'},
            {keys:['завдання','tasks','задачі','aufgaben','tâches','zadania'], label: gs_t('tabTasks','Завдання'), tab:'tasks'},
            {keys:['регулярні','regular','wiederkehrend','récurrent','cykliczne'], label: gs_t('tabRegular','Регулярні завдання'), tab:'regular'},
            {keys:['проект','projects','projekte','projets','projekty'], label: gs_t('tabProjects','Проєкти'), tab:'projects'},
            {keys:['процес','processes','prozesse','processus','procesy'], label: gs_t('tabProcesses','Процеси'), tab:'processes'},
            {keys:['координація','coordination','нарада','koordination','koordinacja'], label: gs_t('tabCoordination','Координація'), tab:'coordination'},
            {keys:['контроль','control','дашборд','kontrolle','dashboard'], label: gs_t('tabControl','Контроль'), tab:'control'},
            {keys:['аналітика','analytics','analytik','analytique','analityka'], label: gs_t('navAnalytics','Аналітика'), tab:'analytics'},
            {keys:['статистика','statistics','метрики','statistik','statystyki'], label: gs_t('tabStatistics','Статистика'), tab:'statistics'},
            {keys:['функції','functions','funktionen','fonctions','funkcje'], label: gs_t('tabFunctions','Функції'), tab:'functions'},
            {keys:['структура','bizstructure','struktur','struktura'], label: gs_t('tabStructure','Структура'), tab:'bizstructure'},
            {keys:['співробітники','users','команда','mitarbeiter','employés','pracownicy'], label: gs_t('tabUsers','Співробітники'), tab:'users'},
            {keys:['навчання','learning','lernen','apprentissage','nauka'], label: gs_t('tabLearning','Навчання'), tab:'learning'},
            {keys:['crm',window.t('clientsWordLc'),'угоди','kunden','klienci'], label:'CRM', tab:'crm'},
            {keys:['фінанси','finance','finanzen','finances','finanse'], label: gs_t('finFinances',window.t('financeWord2')), tab:'finance'},
            {keys:['маркетинг','marketing'], label: gs_t('tabMarketing','Маркетинг'), tab:'marketing'},
            {keys:['боти','bots'], label: gs_t('tabBots','Боти'), tab:'bots'},
            {keys:['сайти','sites','websites'], label: gs_t('tabSites','Сайти'), tab:'sites'},
            {keys:['інтеграції','integrations','integrationen'], label: gs_t('tabIntegrations','Інтеграції'), tab:'integrations'},
        ];
        navItems.forEach(item => {
            if (item.keys.some(k => k.includes(q) || q.includes(k))) {
                results.push({
                    category: gs_t('gsSearchNav','Перейти'), categoryIcon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></span>',
                    title: item.label,
                    subtitle: gs_t('gsOpenTab','Відкрити вкладку'),
                    badge: gs_t('gsSearchNavBadge','Навігація'), badgeColor:'#6b7280',
                    action: () => {
                        if (typeof switchTab==='function') switchTab(item.tab);
                        if (item.tab==='coordination' && window._initCoordTab) setTimeout(window._initCoordTab,100);
                    }
                });
            }
        });

        return results;
    }

    function renderResults(results, q, containerId) {
        const r = document.getElementById(containerId);
        if (!r) return;

        if (results.length === 0) {
            r.style.display = 'block';
            r.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#9ca3af;font-size:0.85rem;">
                <div style="font-size:1.5rem;margin-bottom:0.5rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span></div>
                ${gs_t('gsNoResults','Нічого не знайдено за')} "<strong>${safeEsc(q)}</strong>"
            </div>`;
            return;
        }

        const grouped = {};
        results.forEach((res, idx) => {
            if (!grouped[res.category]) grouped[res.category] = {icon:res.categoryIcon,items:[]};
            grouped[res.category].items.push({...res, _flatIdx:idx});
        });

        let html = '';
        Object.entries(grouped).forEach(([cat, data]) => {
            html += `<div style="padding:0.5rem 0.75rem 0.2rem;font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;display:flex;align-items:center;gap:0.35rem;">
                <span>${data.icon}</span><span>${cat}</span></div>`;
            data.items.forEach(res => {
                const bc = safeCssColor(res.badgeColor);
                html += `<div class="gsearch-item" data-idx="${res._flatIdx}"
                    style="display:flex;align-items:center;gap:0.75rem;padding:0.55rem 0.75rem;cursor:pointer;border-radius:8px;margin:1px 4px;transition:background 0.1s;"
                    onmouseover="this.style.background='#f3f4f6'"
                    onmouseout="this.style.background=''">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:0.88rem;font-weight:600;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                            ${res.overdue?'<span style="color:#ef4444;margin-right:4px;">⚠</span>':''}${highlight(res.title,q)}
                        </div>
                        ${res.subtitle?`<div style="font-size:0.75rem;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${safeEsc(res.subtitle)}</div>`:''}
                    </div>
                    ${res.badge?`<span style="font-size:0.7rem;font-weight:600;color:${bc};background:${bc}18;border-radius:4px;padding:2px 6px;white-space:nowrap;">${safeEsc(res.badge)}</span>`:''}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>`;
            });
        });

        r.style.display = 'block';
        r.innerHTML = `<div style="padding:4px 0;">${html}</div>
            <div style="padding:0.4rem 0.75rem;border-top:1px solid #f3f4f6;font-size:0.7rem;color:#d1d5db;display:flex;justify-content:space-between;">
                <span>${gs_t('gsNavHint','↑↓ навігація · Enter · Esc')}</span><span>${results.length} ${gs_t('gsResults','результатів')}</span>
            </div>`;
    }

    // ---- Search History ----
    const SEARCH_HISTORY_KEY = 'talko_search_history';
    function getSearchHistory() {
        try { return JSON.parse(sessionStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); } catch { return []; }
    }
    function saveToSearchHistory(q) {
        if (!q || q.length < 2) return;
        const h = getSearchHistory().filter(x => x !== q);
        h.unshift(q);
        try { sessionStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(h.slice(0, 5))); } catch {}
    }
    function showSearchHistory(containerId) {
        const history = getSearchHistory();
        const container = document.getElementById(containerId);
        if (!container || history.length === 0) return;
        container.style.display = 'block';
        container.innerHTML = `
            <div style="padding:0.5rem 0.75rem;font-size:0.72rem;color:#9ca3af;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">
                <span>${gs_t('gsRecentQueries','Останні запити')}</span>
                <button onclick="clearSearchHistory('${containerId}')" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:0.72rem;padding:0;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span> ${gs_t('gsClear','очистити')}</button>
            </div>
            ${history.map(h => `
                <div class="gsearch-item" onclick="fillSearchQuery(${JSON.stringify(h)})" 
                     style="padding:0.5rem 0.75rem;cursor:pointer;display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:#374151;">
                    <i data-lucide="clock" style="width:14px;height:14px;color:#9ca3af;flex-shrink:0;"></i>
                    ${h.replace(/</g,'&lt;')}
                </div>`).join('')}`;
        if (typeof lucide !== 'undefined') refreshIcons();
    }
    window.clearSearchHistory = function(containerId) {
        try { sessionStorage.removeItem(SEARCH_HISTORY_KEY); } catch {}
        const c = document.getElementById(containerId);
        if (c) c.style.display = 'none';
    };
    window.fillSearchQuery = function(q) {
        const inp = document.getElementById('globalSearchInput');
        if (inp) { inp.value = q; inp.dispatchEvent(new Event('input')); inp.focus(); }
    };
    // ---- End Search History ----

    // Debounce timer for globalSearch — prevents re-render on every keypress
    let _gsDebounceTimer = null;

    window.globalSearch = function(query, mode) {
        clearTimeout(_gsDebounceTimer);
        const q = (query||'').trim().toLowerCase();
        activeIndex = -1;

        const desktopR = document.getElementById('globalSearchResults');
        const mobileR  = document.getElementById('mobileSearchResults');

        // Clear immediately on empty
        if (q.length < 1) {
            if (desktopR) desktopR.style.display = 'none';
            if (mobileR)  mobileR.style.display  = 'none';
            currentResults = [];
            return;
        }

        // Debounce: wait 120ms after last keypress before searching
        _gsDebounceTimer = setTimeout(function() {
            currentResults = buildResults(q);

            if (mode === 'mobile') {
                if (desktopR) desktopR.style.display = 'none';
                renderResults(currentResults, q, 'mobileSearchResults');
            } else {
                if (mobileR) mobileR.style.display = 'none';
                saveToSearchHistory(q);
                renderResults(currentResults, q, 'globalSearchResults');
            }
        }, 120);
    };

    function selectResult(idx, isMobile) {
        const res = currentResults[idx];
        if (!res) return;
        res.action && res.action();
        hideGlobalSearch();
        // FIX БАГ D: очищаємо правильний input
        if (isMobile) {
            closeMobileSearch();
        } else {
            const inp = document.getElementById('globalSearchInput');
            if (inp) inp.value = '';
            if (document.getElementById('globalSearchResults'))
                document.getElementById('globalSearchResults').style.display = 'none';
        }
        currentResults = [];
        activeIndex = -1;
    }
    window.selectResult = selectResult;

    // --- МОБІЛЬНИЙ ПОШУК ---
    window.toggleMobileSearch = function() {
        const panel = document.getElementById('mobileSearchPanel');
        if (!panel) return;
        if (panel.style.display !== 'none') {
            closeMobileSearch();
        } else {
            panel.style.display = 'block';
            setTimeout(() => {
                const inp = document.getElementById('mobileSearchInput');
                if (inp) inp.focus();
            }, 100);
        }
    };

    window.closeMobileSearch = function() {
        const panel = document.getElementById('mobileSearchPanel');
        if (panel) panel.style.display = 'none';
        // FIX БАГ D: очищаємо mobile input
        const inp = document.getElementById('mobileSearchInput');
        if (inp) inp.value = '';
        const r = document.getElementById('mobileSearchResults');
        if (r) { r.style.display = 'none'; r.innerHTML = ''; }
        currentResults = [];
        activeIndex = -1;
    };

    // FIX БАГ C: show-mobile-only через JS, не клас
    function initMobileSearchBtn() {
        const btn = document.getElementById('mobileSearchBtn');
        if (!btn) return;
        btn.style.display = window.innerWidth < 768 ? 'flex' : 'none';
    }
    window.addEventListener('resize', initMobileSearchBtn);
    window.initMobileSearchBtn = initMobileSearchBtn;

})();
