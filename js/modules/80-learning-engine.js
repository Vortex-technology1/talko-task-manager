// ============================================================
// 80-learning-engine.js — TALKO Learning Platform: Engine
// State, Firestore sync, render functions, init
// Потребує: 80-learning-data.js (завантажувати першим)
// ============================================================
(function() {
'use strict';

    // ── Course Data (from data module) ────────────────────────
    const learningCourseData = window.learningCourseData || [];
    console.log('[learning-engine] learningCourseData length:', learningCourseData.length);

    // ── State ─────────────────────────────────────────────────
    let learningProgress = {};     // { moduleId: { completed, homeworkDone, homeworkText } }
    let currentLearningModule = null;
    // Use TALKO main lang - read from localStorage key used by translations module
    function getLearningLang() {
        return localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || window.currentLang || 'ua';
    }

    // Universal helper: module.title_de || module.title_en || module.title_ru || module.title
    function getLangField(module, field, lang) {
        if (!lang || lang === 'ua') return module[field] || '';
        const localized = module[field + '_' + lang];
        if (localized) return localized;
        // fallback chain: en → ru → ua
        if (lang === 'cs' || lang === 'pl' || lang === 'de') {
            return module[field + '_en'] || module[field + '_ru'] || module[field] || '';
        }
        return module[field + '_ru'] || module[field] || '';
    }

    // ── Firestore helpers ─────────────────────────────────────
    // Use same pattern as 76-coordination: firebase.firestore() + window.currentCompany
    function _db() { return firebase.firestore(); }
    function _companyId() { return typeof currentCompany !== 'undefined' ? currentCompany : null; }
    function _uid() { return typeof currentUser !== 'undefined' && currentUser ? currentUser.uid : null; }

    function lProgressRef() {
        const cid = _companyId();
        const uid = _uid();
        if (!cid || !uid) return null;
        return _db()
            .collection('companies').doc(cid)
            .collection('users').doc(uid);
    }

    async function loadLearningProgress() {
        const ref = lProgressRef();
        if (!ref) {
            // No Firestore access - just render with empty progress
            updateModulesFromLearningProgress();
            renderLearning();
            return;
        }
        try {
            const snap = await ref.get();
            if (snap.exists) {
                learningProgress = snap.data().learningProgress || {};
            }
        } catch(e) {
            console.warn('[Learning] Load progress error:', e);
        }
        updateModulesFromLearningProgress();
        renderLearning();
    }

    async function saveLearningProgress() {
        const ref = lProgressRef();
        if (!ref) return;
        try {
            await ref.set({ learningProgress }, { merge: true });
        } catch(e) {
            console.warn('[Learning] Save progress error:', e);
        }
    }

    // ── Progress helpers ──────────────────────────────────────
    function updateModulesFromLearningProgress() {
        learningCourseData.forEach(module => {
            const p = learningProgress[module.id];
            if (p) {
                module.completed = !!p.completed;
                module.homeworkCompleted = !!p.homeworkDone;
            } else {
                module.completed = false;
                module.homeworkCompleted = false;
            }
        });
    }

    function getLearningStats() {
        const total = learningCourseData.length;
        const completed = learningCourseData.filter(m => m.completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pct };
    }

    // ── Main Render ───────────────────────────────────────────
    function _cleanPresOverlays() {
        ['l10Ov','l11Ov','l12Ov'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) { el.style.display = 'none'; el.remove(); }
        });
        document.body.style.overflow = '';
    }

    function renderLearning() {
        _cleanPresOverlays();
        const root = document.getElementById('learningTab');
        if (!root) return;

        const lang = getLearningLang();

        // Активна категорія
        if (!window._learningActiveCategory) window._learningActiveCategory = 'systematization';
        const activeCat = window._learningActiveCategory;

        // Модулі активної категорії — обчислюємо ДО catTabsHTML (використовується в dropdown)
        const filteredModules = learningCourseData.filter(m => (m.category || 'systematization') === activeCat);
        const catDone = filteredModules.filter(m => m.completed).length;
        const catPct = filteredModules.length > 0 ? Math.round(catDone / filteredModules.length * 100) : 0;

        // Вкладки категорій — мобільний dropdown замість горизонтального скролу
        const categories = window.learningCategories || window.learningCourseCategories || [];
        const activeCategory = categories.find(c => c.id === activeCat) || categories[0];
        const catTabsHTML = categories.length > 1 ? `
        <div style="padding:0.75rem 1rem 0.5rem;position:relative;">
            <!-- Dropdown trigger -->
            <button
                onclick="window._toggleLearningCatMenu()"
                id="learningCatTrigger"
                style="width:100%;display:flex;align-items:center;justify-content:space-between;
                    padding:0.65rem 0.9rem;border-radius:12px;border:1.5px solid ${activeCategory?.color || '#22c55e'};
                    background:${activeCategory?.color ? activeCategory.color + '12' : '#f0fdf4'};
                    cursor:pointer;font-size:0.88rem;font-weight:600;color:${activeCategory?.color || '#22c55e'};">
                <span style="display:flex;align-items:center;gap:0.5rem;">
                    <i data-lucide="${activeCategory?.icon || 'graduation-cap'}" class="icon" style="width:16px;height:16px;"></i>
                    ${activeCategory ? (activeCategory['title_' + lang] || activeCategory.title) : ''}
                </span>
                <span style="display:flex;align-items:center;gap:0.4rem;">
                    <span style="font-size:0.75rem;font-weight:500;opacity:0.7;">${catDone}/${filteredModules.length}</span>
                    <svg id="learningCatChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
            </button>

            <!-- Dropdown menu -->
            <div id="learningCatMenu" style="display:none;position:absolute;left:1rem;right:1rem;top:calc(100% - 4px);
                background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.15);
                border:1px solid #e5e7eb;z-index:999;overflow:hidden;">
                ${categories.map((cat, idx) => {
                    const isActive = cat.id === activeCat;
                    const catTitle = cat['title_' + lang] || cat.title;
                    const catModules = learningCourseData.filter(m => (m.category || 'systematization') === cat.id);
                    const catDoneCount = catModules.filter(m => m.completed).length;
                    return `<button onclick="window._switchLearningCategory('${cat.id}')"
                        style="width:100%;display:flex;align-items:center;justify-content:space-between;
                            padding:0.75rem 1rem;border:none;background:${isActive ? cat.color + '12' : 'white'};
                            cursor:pointer;font-size:0.86rem;font-weight:${isActive ? '700' : '500'};
                            color:${isActive ? cat.color : '#374151'};
                            border-bottom:${idx < categories.length - 1 ? '1px solid #f3f4f6' : 'none'};
                            text-align:left;">
                        <span style="display:flex;align-items:center;gap:0.6rem;">
                            <span style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0;"></span>
                            <i data-lucide="${cat.icon}" class="icon" style="width:15px;height:15px;color:${cat.color};"></i>
                            ${catTitle}
                        </span>
                        <span style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
                            <span style="font-size:0.75rem;color:#9ca3af;">${catDoneCount}/${catModules.length}</span>
                            ${isActive ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + cat.color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                        </span>
                    </button>`;
                }).join('')}
            </div>
        </div>` : '';

        // (filteredModules, catDone, catPct — визначені вище перед catTabsHTML)

        root.innerHTML = `
        <div class="learning-wrap">
            <div class="learning-header">
                <div class="learning-header-title">
                    <i data-lucide="graduation-cap" class="icon" style="color:#22c55e;width:24px;height:24px;"></i>
                    <span>${window.t('learningTitle')}</span>
                </div>
            </div>
            <div class="learning-stats">
                <div class="learning-stat">
                    <div class="learning-stat-value">${catPct}%</div>
                    <div class="learning-stat-label">${window.t('learningProgress')}</div>
                </div>
                <div class="learning-stat">
                    <div class="learning-stat-value">${catDone}/${filteredModules.length}</div>
                    <div class="learning-stat-label">${window.t('learningModules')}</div>
                </div>
                <div class="learning-progress-bar-wrap">
                    <div class="learning-progress-bar" style="width:${catPct}%"></div>
                </div>
            </div>
            ${catTabsHTML}
            <div class="learning-modules-list" id="learningModulesList">
                ${filteredModules.length === 0
                    ? `<div style="padding:2.5rem 1rem;text-align:center;color:#9ca3af;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin-bottom:0.75rem;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        <div style="font-size:0.95rem;font-weight:600;color:#6b7280;margin-bottom:0.4rem;">${window.t('learningComingSoon') || 'Уроки скоро появляться'}</div>
                        <div style="font-size:0.82rem;color:#9ca3af;">${window.t('learningComingSoonSub') || 'Контент в розробці'}</div>
                      </div>`
                    : filteredModules.map(module => renderModuleCard(module, filteredModules)).join('')}
            </div>
        </div>`;

        if (window.refreshIcons) window.refreshIcons();
    }

    window._toggleLearningCatMenu = function() {
        const menu = document.getElementById('learningCatMenu');
        const chevron = document.getElementById('learningCatChevron');
        if (!menu) return;
        const isOpen = menu.style.display !== 'none';
        menu.style.display = isOpen ? 'none' : 'block';
        if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        // Закриваємо при кліку поза меню
        if (!isOpen) {
            setTimeout(() => {
                const handler = function(e) {
                    if (!menu.contains(e.target) && e.target.id !== 'learningCatTrigger') {
                        menu.style.display = 'none';
                        if (chevron) chevron.style.transform = '';
                        document.removeEventListener('click', handler);
                    }
                };
                document.addEventListener('click', handler);
            }, 10);
        }
    };

    window._switchLearningCategory = function(catId) {
        window._learningActiveCategory = catId;
        // Закриваємо меню перед ре-рендером
        const menu = document.getElementById('learningCatMenu');
        if (menu) menu.style.display = 'none';
        renderLearning();
    };

    function renderModuleCard(module, moduleList) {
        const lang = getLearningLang();
        const title = getLangField(module, 'title', lang);
        const subtitle = getLangField(module, 'subtitle', lang);
        const isCompleted = module.completed;
        // Використовуємо moduleList (filtered by category) для визначення доступності
        const list = moduleList || learningCourseData;
        const moduleIndex = list.findIndex(m => m.id === module.id);
        // Перші 3 модулі категорії — завжди доступні; далі — тільки після завершення попереднього
        const isAvailable = true;

        return `
        <div class="l-module-card ${isCompleted ? 'completed' : ''} ${!isAvailable ? 'locked' : ''}" 
             onclick="window._openLearningModule(${module.id})"
             style="cursor:pointer;">
            <div class="l-module-icon ${isCompleted ? 'completed' : isAvailable ? 'available' : 'locked'}">
                ${!isAvailable
                    ? '<i data-lucide="lock" class="icon" style="width:20px;height:20px;"></i>'
                    : `<span style="font-weight:700;font-size:0.9rem;">${moduleIndex + 1}${isCompleted ? '<svg style=\"display:inline;vertical-align:middle;margin-left:1px;\" width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"3\"><polyline points=\"20 6 9 17 4 12\"/></svg>' : ''}</span>`
                }
            </div>
            <div class="l-module-info">
                <div class="l-module-title">${title}</div>
                ${subtitle ? `<div class="l-module-subtitle">${subtitle}</div>` : ''}
                ${module.time ? `<div class="l-module-time"><i data-lucide="clock" class="icon" style="width:12px;height:12px;"></i> ${module.time} ${window.t('learningMin')}</div>` : ''}
            </div>
            <div class="l-module-arrow">
                <i data-lucide="${isCompleted ? 'check' : 'chevron-right'}" class="icon" style="width:18px;height:18px;color:${isCompleted ? '#22c55e' : '#9ca3af'};"></i>
            </div>
        </div>`;
    }

    // ── Open Module Detail ────────────────────────────────────
    // ── Algoritm Route (Module 0 special view) ────────────────
    window._openAlgoritm = function() {
        _cleanPresOverlays();
        const root = document.getElementById('learningTab');
        if (!root) return;
        root.innerHTML = `
        <div class="learning-wrap" style="padding:0 0 4rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;padding:1rem 1.5rem 0.5rem;position:sticky;top:0;background:white;z-index:10;border-bottom:1px solid #e5e7eb;">
                <button class="l-back-btn" onclick="window._openLearningModule(0)" style="display:flex;align-items:center;gap:0.4rem;background:none;border:none;color:#6b7280;font-size:0.875rem;cursor:pointer;">
                    ← Назад к модулю
                </button>
                <span style="font-weight:700;color:#1a1a1a;">Маршрут программы</span>
            </div>
            <style>
        :root {
            --primary: #22c55e;
            --primary-dark: #16a34a;
            --primary-light: rgba(34, 197, 94, 0.1);
            --bg-dark: #0a0f0a;
            --bg-light: #f9fafb;
            --bg-card: #ffffff;
            --text-dark: #1a1a1a;
            --text-gray: #525252;
            --text-light: #94a3b8;
            --border: #e2e8f0;
            --red: #ef4444;
            --orange: #f59e0b;
            --blue: #3b82f6;
            --purple: #8b5cf6;
        }





.algoritm-wrap .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px 16px;
        }

        /* Header */
.algoritm-wrap .page-header {
            background: var(--bg-dark);
            padding: 24px 0;
            margin-bottom: 24px;
        }

.algoritm-wrap .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
        }

.algoritm-wrap .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

.algoritm-wrap .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #fff;
            font-weight: 700;
            font-size: 18px;
        }

.algoritm-wrap .logo-icon {
            width: 40px;
            height: 40px;
            background: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

.algoritm-wrap .logo-icon svg {
            width: 22px;
            height: 22px;
            color: var(--bg-dark);
        }

.algoritm-wrap .page-title {
            color: #fff;
            font-size: 24px;
            font-weight: 700;
        }

.algoritm-wrap .page-title span {
            color: var(--primary);
        }

        /* Progress Bar */
.algoritm-wrap .progress-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 20px 24px;
            margin-bottom: 24px;
            border: 1px solid var(--border);
        }

.algoritm-wrap .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

.algoritm-wrap .progress-label {
            font-weight: 600;
            font-size: 14px;
            color: var(--text-gray);
        }

.algoritm-wrap .progress-value {
            font-weight: 700;
            font-size: 14px;
            color: var(--primary);
        }

.algoritm-wrap .progress-bar {
            height: 8px;
            background: var(--border);
            border-radius: 4px;
            overflow: hidden;
        }

.algoritm-wrap .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        /* Stats */
.algoritm-wrap .stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

.algoritm-wrap .stat-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 16px 20px;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 12px;
        }

.algoritm-wrap .stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

.algoritm-wrap .stat-icon svg {
            width: 22px;
            height: 22px;
        }

.algoritm-wrap .stat-icon.green {
            background: var(--primary-light);
        }

.algoritm-wrap .stat-icon.green svg {
            color: var(--primary);
        }

.algoritm-wrap .stat-icon.orange {
            background: rgba(245, 158, 11, 0.1);
        }

.algoritm-wrap .stat-icon.orange svg {
            color: var(--orange);
        }

.algoritm-wrap .stat-icon.blue {
            background: rgba(59, 130, 246, 0.1);
        }

.algoritm-wrap .stat-icon.blue svg {
            color: var(--blue);
        }

.algoritm-wrap .stat-icon.gray {
            background: rgba(148, 163, 184, 0.1);
        }

.algoritm-wrap .stat-icon.gray svg {
            color: var(--text-light);
        }

.algoritm-wrap .stat-content h4 {
            font-size: 24px;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 2px;
        }

.algoritm-wrap .stat-content p {
            font-size: 13px;
            color: var(--text-gray);
        }

        /* Table Container */
.algoritm-wrap .table-container {
            background: var(--bg-card);
            border-radius: 16px;
            border: 1px solid var(--border);
            overflow: hidden;
        }

.algoritm-wrap .table-header-bar {
            background: var(--bg-dark);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

.algoritm-wrap .table-title {
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

.algoritm-wrap .table-title svg {
            width: 20px;
            height: 20px;
            color: var(--primary);
        }

.algoritm-wrap .table-actions {
            display: flex;
            gap: 8px;
        }

.algoritm-wrap .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }

.algoritm-wrap .btn svg {
            width: 16px;
            height: 16px;
        }

.algoritm-wrap .btn-primary {
            background: var(--primary);
            color: #fff;
        }

.algoritm-wrap .btn-primary:hover {
            background: var(--primary-dark);
        }

.algoritm-wrap .btn-outline-light {
            background: transparent;
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

.algoritm-wrap .btn-outline-light:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        /* Table */
.algoritm-wrap .table-scroll {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1100px;
        }

        th {
            background: var(--bg-light);
            padding: 14px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-gray);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
            vertical-align: middle;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover {
            background: rgba(34, 197, 94, 0.02);
        }

        /* Step Column */
.algoritm-wrap .step-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

.algoritm-wrap .step-number {
            width: 32px;
            height: 32px;
            background: var(--primary-light);
            color: var(--primary-dark);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
        }

.algoritm-wrap .step-number.completed {
            background: var(--primary);
            color: #fff;
        }

.algoritm-wrap .step-number.active {
            background: var(--orange);
            color: #fff;
        }

.algoritm-wrap .step-info h4 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 2px;
        }

.algoritm-wrap .step-info p {
            font-size: 12px;
            color: var(--text-gray);
        }

        /* Status Badge */
.algoritm-wrap .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.2s;
        }

.algoritm-wrap .status-badge:hover {
            transform: scale(1.02);
        }

.algoritm-wrap .status-badge svg {
            width: 14px;
            height: 14px;
        }

.algoritm-wrap .status-completed {
            background: var(--primary-light);
            color: var(--primary-dark);
        }

.algoritm-wrap .status-in-progress {
            background: rgba(245, 158, 11, 0.1);
            color: #d97706;
        }

.algoritm-wrap .status-waiting {
            background: rgba(59, 130, 246, 0.1);
            color: var(--blue);
        }

.algoritm-wrap .status-locked {
            background: rgba(148, 163, 184, 0.1);
            color: var(--text-light);
        }

        /* Tool Cell */
.algoritm-wrap .tool-cell {
            display: flex;
            align-items: center;
            gap: 10px;
        }

.algoritm-wrap .tool-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

.algoritm-wrap .tool-icon svg {
            width: 18px;
            height: 18px;
        }

.algoritm-wrap .tool-icon.ai {
            background: rgba(139, 92, 246, 0.1);
        }

.algoritm-wrap .tool-icon.ai svg {
            color: var(--purple);
        }

.algoritm-wrap .tool-icon.video {
            background: rgba(239, 68, 68, 0.1);
        }

.algoritm-wrap .tool-icon.video svg {
            color: var(--red);
        }

.algoritm-wrap .tool-icon.doc {
            background: rgba(59, 130, 246, 0.1);
        }

.algoritm-wrap .tool-icon.doc svg {
            color: var(--blue);
        }

.algoritm-wrap .tool-icon.excel {
            background: rgba(34, 197, 94, 0.1);
        }

.algoritm-wrap .tool-icon.excel svg {
            color: var(--primary);
        }

.algoritm-wrap .tool-icon.chat {
            background: rgba(245, 158, 11, 0.1);
        }

.algoritm-wrap .tool-icon.chat svg {
            color: var(--orange);
        }

.algoritm-wrap .tool-icon.platform {
            background: var(--primary-light);
        }

.algoritm-wrap .tool-icon.platform svg {
            color: var(--primary-dark);
        }

.algoritm-wrap .tool-icon.folder {
            background: rgba(59, 130, 246, 0.1);
        }

.algoritm-wrap .tool-icon.folder svg {
            color: var(--blue);
        }

.algoritm-wrap .tool-icon.team {
            background: rgba(245, 158, 11, 0.1);
        }

.algoritm-wrap .tool-icon.team svg {
            color: var(--orange);
        }

.algoritm-wrap .tool-icon.present {
            background: rgba(239, 68, 68, 0.1);
        }

.algoritm-wrap .tool-icon.present svg {
            color: var(--red);
        }

.algoritm-wrap .tool-name {
            font-weight: 500;
        }

        /* Task Cell */
.algoritm-wrap .task-text {
            max-width: 280px;
            line-height: 1.4;
        }

        /* Date Cell */
.algoritm-wrap .date-cell {
            white-space: nowrap;
        }

.algoritm-wrap .date-planned {
            color: var(--text-gray);
            font-size: 13px;
        }

.algoritm-wrap .date-input {
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 13px;
            font-family: inherit;
            color: var(--text-dark);
            background: #fff;
        }

        /* Time Cell */
.algoritm-wrap .time-cell {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-gray);
        }

.algoritm-wrap .time-cell svg {
            width: 14px;
            height: 14px;
            color: var(--text-light);
        }

        /* Comment Cell */
.algoritm-wrap .comment-cell {
            max-width: 200px;
            font-size: 13px;
            color: var(--text-gray);
        }

.algoritm-wrap .comment-cell.empty {
            color: var(--text-light);
            font-style: italic;
        }

        /* Phase Divider */
.algoritm-wrap .phase-row td {
            background: var(--bg-dark);
            color: #fff;
            padding: 12px 16px;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

.algoritm-wrap .phase-row:hover td {
            background: var(--bg-dark);
        }

.algoritm-wrap .phase-label {
            display: flex;
            align-items: center;
            gap: 10px;
        }

.algoritm-wrap .phase-label svg {
            width: 18px;
            height: 18px;
            color: var(--primary);
        }

        /* Sub-phase */
.algoritm-wrap .subphase-row td {
            background: rgba(34, 197, 94, 0.05);
            color: var(--primary-dark);
            padding: 10px 16px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-left: 3px solid var(--primary);
        }

.algoritm-wrap .subphase-row:hover td {
            background: rgba(34, 197, 94, 0.08);
        }

        /* Responsive */
        @media (max-width: 1024px) {
.algoritm-wrap .stats-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 640px) {
.algoritm-wrap .stats-row {
                grid-template-columns: 1fr;
            }

.algoritm-wrap .header-content {
                flex-direction: column;
                align-items: flex-start;
            }

.algoritm-wrap .page-title {
                font-size: 20px;
            }
        }
</style>
<div class="algoritm-wrap"><!-- Header -->
    

    <div class="container">
        <!-- Progress -->
        <div class="progress-section">
            <div class="progress-header">
                <span class="progress-label">Общий прогресс</span>
                <span class="progress-value">0 из 100 шагов (0%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>Выполнено</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>В процессе</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="stat-content">
                    <h4>100</h4>
                    <p>Ожидает</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gray">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>Заблокировано</p>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="table-container">
            <div class="table-header-bar">
                <div class="table-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    План внедрения
                </div>
                <div class="table-actions">
                    <button class="btn btn-outline-light" style="display:none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Экспорт в Excel
                    </button>
                </div>
            </div>

            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 280px;">Шаг</th>
                            <th style="width: 130px;">Статус</th>
                            <th style="width: 180px;">Инструмент</th>
                            <th style="width: 300px;">Что нужно сделать</th>
                            <th style="width: 120px;">Плановая дата</th>
                            <th style="width: 90px;">Время</th>
                            <th>Комментарий</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- ФАЗА 1: АРХИТЕКТУРА БИЗНЕСА -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    Фаза 1: Архитектура бизнеса
                                </div>
                            </td>
                        </tr>

                        <!-- Шаг 1 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">1</div>
                                    <div class="step-info">
                                        <h4>Словарь терминов</h4>
                                        <p>Основы системы</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать словарь терминов и понятий с AI-ассистентом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 2 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">2</div>
                                    <div class="step-info">
                                        <h4>Задачи и распоряжения</h4>
                                        <p>Как ставить правильно</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать как ставить задачи и распоряжения</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 3 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">3</div>
                                    <div class="step-info">
                                        <h4>Система Радар</h4>
                                        <p>Предупреждение проблем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Радар</span>
                                </div>
                            </td>
                            <td class="task-text">Разобраться с системой Радар — чтобы люди не приходили с проблемой</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 4 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">4</div>
                                    <div class="step-info">
                                        <h4>Внедрение Радар</h4>
                                        <p>Для команды</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Команда</span>
                                </div>
                            </td>
                            <td class="task-text">Дать людям систему и объяснить как использовать AI Радар</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 5 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">5</div>
                                    <div class="step-info">
                                        <h4>Система Компас</h4>
                                        <p>Направление движения</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Компас</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать систему Компас с AI-ассистентом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 6 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">6</div>
                                    <div class="step-info">
                                        <h4>Технический наставник</h4>
                                        <p>Налаштування систем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">Техн. наставник</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-инструмент для пошаговой настройки CRM, таблиц, ботов</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 7 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">7</div>
                                    <div class="step-info">
                                        <h4>Папка на Google Drive</h4>
                                        <p>Систематизация TALKO</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon folder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                    </div>
                                    <span class="tool-name">Google Drive</span>
                                </div>
                            </td>
                            <td class="task-text">Создать папку «Систематизация TALKO» на Google Drive</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 8 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">8</div>
                                    <div class="step-info">
                                        <h4>Техн. наставник команде</h4>
                                        <p>Впровадження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Команда</span>
                                </div>
                            </td>
                            <td class="task-text">Дать сотрудникам Технический наставник для использования</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 9 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">9</div>
                                    <div class="step-info">
                                        <h4>Асистент розвитку</h4>
                                        <p>Самоанализ и мышление</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Развитие</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать ассистента для самоанализа: инструменты, бизнес-модель, цели, убеждения</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 10 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">10</div>
                                    <div class="step-info">
                                        <h4>Розмова з командою</h4>
                                        <p>Планы систематизации</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Команда</span>
                                </div>
                            </td>
                            <td class="task-text">Провести разговор с сотрудниками о планах систематизации и следующих шагах</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Цель и идеальная картина -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Цель, замысел и идеальная картина</td>
                        </tr>

                        <!-- Шаг 10 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">11</div>
                                    <div class="step-info">
                                        <h4>Цель и идеальная картина</h4>
                                        <p>Формирование политики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти ассистента «Цель, замысел и идеальная картина» и сформировать политику</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 11 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">12</div>
                                    <div class="step-info">
                                        <h4>Презентация цели</h4>
                                        <p>Тезиси для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентация</span>
                                </div>
                            </td>
                            <td class="task-text">Создать презентацию и тезисы к цели и идеальной картине</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 12 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">13</div>
                                    <div class="step-info">
                                        <h4>Внедрение цели</h4>
                                        <p>Донесение команде</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Внедрение</span>
                                </div>
                            </td>
                            <td class="task-text">Провести внедрение цели и идеальной картины для команды</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Продукт организации -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Продукт организации</td>
                        </tr>

                        <!-- Шаг 13 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">14</div>
                                    <div class="step-info">
                                        <h4>Продукт организации</h4>
                                        <p>Политика продукта</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти ассистента «Продукт организации» и создать политику</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 14 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">15</div>
                                    <div class="step-info">
                                        <h4>Презентация продукта</h4>
                                        <p>Подготовка материалов</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентация</span>
                                </div>
                            </td>
                            <td class="task-text">Подготовить презентацию продукта организации</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 15 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">16</div>
                                    <div class="step-info">
                                        <h4>Впровадження продукту</h4>
                                        <p>Донесение команде</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Внедрение</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження продукту для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Структура -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Структура</td>
                        </tr>

                        <!-- Шаг 16 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">17</div>
                                    <div class="step-info">
                                        <h4>Структура</h4>
                                        <p>Регламент</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Структура</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти асистента "Структура" та створити регламент</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 17 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">18</div>
                                    <div class="step-info">
                                        <h4>Презентация структуры</h4>
                                        <p>Подготовка</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентация</span>
                                </div>
                            </td>
                            <td class="task-text">Провести презентацию структуры</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 18 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">19</div>
                                    <div class="step-info">
                                        <h4>Впровадження структури</h4>
                                        <p>Донесение команде</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Внедрение</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження структури для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Статистики та платформа -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Статистики и платформа</td>
                        </tr>

                        <!-- Шаг 19 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">20</div>
                                    <div class="step-info">
                                        <h4>Статистики</h4>
                                        <p>Справочник метрик</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Статистики</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти ассистента «Статистики» и создать справочник</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 20 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">21</div>
                                    <div class="step-info">
                                        <h4>Платформа: Структура</h4>
                                        <p>Освоение модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Структура</span>
                                </div>
                            </td>
                            <td class="task-text">Освоить платформу «Структура»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 21 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">22</div>
                                    <div class="step-info">
                                        <h4>Платформа: Статистики</h4>
                                        <p>Освоение модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Статистики</span>
                                </div>
                            </td>
                            <td class="task-text">Освоить платформу «Статистики»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 22 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">23</div>
                                    <div class="step-info">
                                        <h4>Платформа: Таск-трекер</h4>
                                        <p>Освоение модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Задачи</span>
                                </div>
                            </td>
                            <td class="task-text">Освоить платформу «Таск-трекер»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Узкое место и таски -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Узкое место и практика</td>
                        </tr>

                        <!-- Шаг 23 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">24</div>
                                    <div class="step-info">
                                        <h4>Анализ узкого места</h4>
                                        <p>Знаходження проблеми</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                    </div>
                                    <span class="tool-name">Анализ</span>
                                </div>
                            </td>
                            <td class="task-text">Провести анализ узкого места бизнеса</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 24 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">25</div>
                                    <div class="step-info">
                                        <h4>План узкого места</h4>
                                        <p>Розпорядження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">План</span>
                                </div>
                            </td>
                            <td class="task-text">Составить план узкого места и разбить на распоряжения</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 25 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">26</div>
                                    <div class="step-info">
                                        <h4>Розпорядження в таски</h4>
                                        <p>Внесення в систему</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Задачи</span>
                                </div>
                            </td>
                            <td class="task-text">Внести розпорядження в таск-трекер</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 26 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">27</div>
                                    <div class="step-info">
                                        <h4>Добавить сотрудника</h4>
                                        <p>В таск-трекер</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Задачи</span>
                                </div>
                            </td>
                            <td class="task-text">Добавить сотрудника в таск-трекер</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 27 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">28</div>
                                    <div class="step-info">
                                        <h4>Создать 4 функции</h4>
                                        <p>В таск-трекере</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Задачи</span>
                                </div>
                            </td>
                            <td class="task-text">Создать 4 функции в таск-трекере</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 28 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">29</div>
                                    <div class="step-info">
                                        <h4>Регулярные задачи</h4>
                                        <p>Додати в таск-трекер</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Задачи</span>
                                </div>
                            </td>
                            <td class="task-text">Добавить несколько регулярных задач в таск-трекер</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Журнал управленческих сбоев -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Журнал управленческих сбоев</td>
                        </tr>

                        <!-- Шаг 29 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">30</div>
                                    <div class="step-info">
                                        <h4>AI: Журнал сбоев</h4>
                                        <p>Разбор системы</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Журнал управленческих сбоев»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 30 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">31</div>
                                    <div class="step-info">
                                        <h4>Excel: Журнал сбоев</h4>
                                        <p>Создание таблицы</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Excel</span>
                                </div>
                            </td>
                            <td class="task-text">Создать Excel-таблицу журнала сбоев (даты в строках, параметры в колонках)</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 31 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">32</div>
                                    <div class="step-info">
                                        <h4>Впровадження: Журнал</h4>
                                        <p>Щоденне ведення</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Внедрение</span>
                                </div>
                            </td>
                            <td class="task-text">Внедрить ежедневное ведение журнала управленческих сбоев</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>
                        <!-- ========================================== -->
                        <!-- ФАЗА 2: НАЙМ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                    Фаза 2: Найм
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Создание предложений -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Создание предложений — офферы, от которых не отказываются</td>
                        </tr>

                        <!-- Шаг 29 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">33</div>
                                    <div class="step-info">
                                        <h4>AI: Создание предложений</h4>
                                        <p>Разбор ассистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Создание предложений»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 30 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">34</div>
                                    <div class="step-info">
                                        <h4>Документ: Предложения</h4>
                                        <p>Создание офферов</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать документ с предложениями/офферами</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Формування заявки -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Формирование заявки — правильная формулировка потребности</td>
                        </tr>

                        <!-- Шаг 32 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">35</div>
                                    <div class="step-info">
                                        <h4>AI: Формування заявки</h4>
                                        <p>Разбор ассистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Формирование заявки»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 33 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">36</div>
                                    <div class="step-info">
                                        <h4>Документ: Заявка</h4>
                                        <p>Шаблон заявки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ/шаблон заявки на найм</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Описание функции -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Описание функции — что именно будет делать человек</td>
                        </tr>

                        <!-- Шаг 35 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">37</div>
                                    <div class="step-info">
                                        <h4>AI: Описание функции</h4>
                                        <p>Разбор ассистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Описание функции»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 36 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">38</div>
                                    <div class="step-info">
                                        <h4>Документ: Описание функции</h4>
                                        <p>Должностные инструкции</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать документы с описанием функций/должностей</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Удержание сотрудников -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Удержание сотрудников — как сделать чтобы не уходили</td>
                        </tr>

                        <!-- Шаг 38 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">39</div>
                                    <div class="step-info">
                                        <h4>AI: Утримання</h4>
                                        <p>Разбор ассистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Удержание сотрудников»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 39 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">40</div>
                                    <div class="step-info">
                                        <h4>Документ: Утримання</h4>
                                        <p>Политика удержания</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать документ с политикой удержания</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Собеседование и испытание -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Собеседование и испытание — структурированный отбор и тестирование</td>
                        </tr>

                        <!-- Шаг 41 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">41</div>
                                    <div class="step-info">
                                        <h4>AI: Собеседование</h4>
                                        <p>Разбор ассистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Собеседование и испытание»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 42 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">42</div>
                                    <div class="step-info">
                                        <h4>Документ: Собеседование</h4>
                                        <p>Чек-лист та тести</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать чек-лист собеседования и тестовые задания</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Система наставництва -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Система наставничества — поддержка нового сотрудника</td>
                        </tr>

                        <!-- Шаг 44 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">43</div>
                                    <div class="step-info">
                                        <h4>AI: Наставництво</h4>
                                        <p>Разбор ассистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Система наставничества»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 45 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">44</div>
                                    <div class="step-info">
                                        <h4>Документ: Наставництво</h4>
                                        <p>Програма менторства</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити документ з програмою наставництва</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Онбординг + AI -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Онбординг + AI-ассистент — автоматизация введения в должность</td>
                        </tr>

                        <!-- Шаг 47 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">45</div>
                                    <div class="step-info">
                                        <h4>AI: Онбординг</h4>
                                        <p>Разбор ассистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Онбординг</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать AI-ассистента «Онбординг»</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 48 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">46</div>
                                    <div class="step-info">
                                        <h4>Документ: Онбординг</h4>
                                        <p>Програма введення</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать документ с программой онбординга</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 3: ФИНАНСЫ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Фаза 3: Финансы
                                </div>
                            </td>
                        </tr>

                        <!-- Шаг 50 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">47</div>
                                    <div class="step-info">
                                        <h4>Бизнес-калькулятор</h4>
                                        <p>Проверка фин. цели</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/></svg>
                                    </div>
                                    <span class="tool-name">AI Калькулятор</span>
                                </div>
                            </td>
                            <td class="task-text">Проверка реальности своей финансовой цели</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 51 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">48</div>
                                    <div class="step-info">
                                        <h4>Анализ ниши</h4>
                                        <p>Проверка потенциала</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Проанализировать можно ли на этой нише заработать запланированную сумму</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 52 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">49</div>
                                    <div class="step-info">
                                        <h4>Три кити контролю</h4>
                                        <p>P&L, Cash Flow, Баланс</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">P&L, Cash Flow, Баланс — основа финансовой грамотности</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 53 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">50</div>
                                    <div class="step-info">
                                        <h4>7 департаментов</h4>
                                        <p>Контроль витрат</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Привязать расходы к департаментам и функциям бизнеса</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 54 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">51</div>
                                    <div class="step-info">
                                        <h4>Excel: Витрати</h4>
                                        <p>Файл департаментов</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Excel</span>
                                </div>
                            </td>
                            <td class="task-text">Создать файл Excel с расходами, департаментами и функциями</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 55 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">52</div>
                                    <div class="step-info">
                                        <h4>Бенчмарки по нишам</h4>
                                        <p>Эталонные % расходов</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Эталонные % расходов для разных типов бизнеса</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 56 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">53</div>
                                    <div class="step-info">
                                        <h4>Тренажер витрат</h4>
                                        <p>Заполнение таблицы</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Тренажер</span>
                                </div>
                            </td>
                            <td class="task-text">Заполни таблицу расходов для своего бизнеса</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 4: МАРКЕТИНГ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                    Фаза 4: Маркетинг (Реклама → Сайт → Бот → Фильтрация → Диалог → Консультация → Продажа → Аналитика)
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Основа и контроль -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основа и контроль — чёткая цель, метрики, где сливаются деньги</td>
                        </tr>

                        <!-- Шаг 53 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">54</div>
                                    <div class="step-info">
                                        <h4>AI: Основа маркетингу</h4>
                                        <p>Цель и метрики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: чёткая цель маркетинга, правильные метрики, где сливаются деньги</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 54 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">55</div>
                                    <div class="step-info">
                                        <h4>Документ: Цель маркетинга</h4>
                                        <p>Метрики та контроль</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать документ: цель маркетинга, ключевые метрики, точки контроля</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Оффер и тексты -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Оффер и тексты, которые продают — сильный оффер, фильтрация нецелевых</td>
                        </tr>

                        <!-- Шаг 55 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">56</div>
                                    <div class="step-info">
                                        <h4>AI: Офер та тексти</h4>
                                        <p>Что продаёт</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: сильный оффер под нишу, тексты которые фильтруют, AI как инструмент</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 56 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">57</div>
                                    <div class="step-info">
                                        <h4>Документ: Офер</h4>
                                        <p>Тексти для реклами</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать оффер и рекламные тексты, которые фильтруют нецелевых</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Сайт -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Сайт, который не сливает трафик — лендинг, логика действий, интеграция</td>
                        </tr>

                        <!-- Шаг 57 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">58</div>
                                    <div class="step-info">
                                        <h4>AI: Структура сайту</h4>
                                        <p>Лендинг который конвертирует</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: простой лендинг, логика ведущая к действию, интеграция с ботом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 58 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">59</div>
                                    <div class="step-info">
                                        <h4>Документ: ТЗ на сайт</h4>
                                        <p>Структура лендинга</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать ТЗ на лендинг: структура, тексты, интеграции</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Telegram-воронка -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 4: Telegram-воронка и бот — автоотбор, квалификация, минус 80% рутины</td>
                        </tr>

                        <!-- Шаг 59 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">60</div>
                                    <div class="step-info">
                                        <h4>AI: Telegram-воронка</h4>
                                        <p>Бот и квалификация</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: автоотбор клиентов, квалификационные вопросы, прогрев</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 60 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">61</div>
                                    <div class="step-info">
                                        <h4>Документ: ТЗ на бот</h4>
                                        <p>Логика воронки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать ТЗ на Telegram-бот: логика воронки, вопросы, сообщения</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Реклама -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 5: Реклама без хаоса — схема запуска, контроль бюджета, стабильные заявки</td>
                        </tr>

                        <!-- Шаг 61 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">62</div>
                                    <div class="step-info">
                                        <h4>AI: Запуск реклами</h4>
                                        <p>Схема без сливов</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: схема запуска рекламы, контроль бюджета, отказ от сливов</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 62 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">63</div>
                                    <div class="step-info">
                                        <h4>Документ: План реклами</h4>
                                        <p>Бюджет та контроль</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити план запуску реклами: бюджет, етапи, точки контролю</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Продажи в переписке -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 6: Продажи в переписке — шаблоны, структура консультации, даунсел</td>
                        </tr>

                        <!-- Шаг 63 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">64</div>
                                    <div class="step-info">
                                        <h4>AI: Продажи в переписке</h4>
                                        <p>Шаблони та скрипти</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: шаблоны переписок, структура консультации, даунсел</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 64 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">65</div>
                                    <div class="step-info">
                                        <h4>Документ: Скрипты продаж</h4>
                                        <p>Шаблони переписок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать скрипты продаж в переписке и структуру консультации</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Аналитика -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 7: Аналитика и масштабирование — ключевые цифры, отчёты, точки роста</td>
                        </tr>

                        <!-- Шаг 65 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">66</div>
                                    <div class="step-info">
                                        <h4>AI: Аналитика</h4>
                                        <p>Ключевые цифры</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: ключевые цифры, анализ воронки, точки роста без увеличения бюджета</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 66 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">67</div>
                                    <div class="step-info">
                                        <h4>Excel: Отчёты маркетинга</h4>
                                        <p>Шаблоны аналитики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon excel">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Excel</span>
                                </div>
                            </td>
                            <td class="task-text">Создать Excel-шаблоны отчётов маркетинга и анализа воронки</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 5: ДЕЛЕГУВАННЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                                    Фаза 5: Делегирование
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Етапи делегування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Этапы делегирования — понимание процесса передачи функций</td>
                        </tr>

                        <!-- Шаг 68 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">68</div>
                                    <div class="step-info">
                                        <h4>AI: Етапи делегування</h4>
                                        <p>Последовательность шагов</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать этапы делегирования: от подготовки до полной передачи функции</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 69 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">69</div>
                                    <div class="step-info">
                                        <h4>Документ: Етапи</h4>
                                        <p>Чек-лист делегування</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать чек-лист этапов делегирования для использования</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Описание функции -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Описание функции — что делает человек на должности</td>
                        </tr>

                        <!-- Шаг 70 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">70</div>
                                    <div class="step-info">
                                        <h4>AI: Описание функции</h4>
                                        <p>Структура и содержание</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: что такое описание функции, из чего состоит, как писать</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Бизнес-процесс и направляющая форма -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Бизнес-процесс и направляющая форма — алгоритмы работы</td>
                        </tr>

                        <!-- Шаг 71 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">71</div>
                                    <div class="step-info">
                                        <h4>AI: Бизнес-процесс</h4>
                                        <p>Направляюча форма</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: что такое описание бизнес-процесса, направляющая форма, этапы с продуктами</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Инструкции -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 4: Инструкции — детальные пошаговые алгоритмы</td>
                        </tr>

                        <!-- Шаг 72 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">72</div>
                                    <div class="step-info">
                                        <h4>AI: Инструкции</h4>
                                        <p>Як писати та структурувати</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: что такое инструкция, как правильно писать, уровень детализации</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Передача функции -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 5: Передача функции — как правильно передать работу</td>
                        </tr>

                        <!-- Шаг 73 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">73</div>
                                    <div class="step-info">
                                        <h4>AI: Передача функции</h4>
                                        <p>Алгоритм передачи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: как правильно передавать функцию, что подготовить, как контролировать</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Папки сотрудника -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 6: Папка штатного сотрудника vs Должностная папка</td>
                        </tr>

                        <!-- Шаг 74 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">74</div>
                                    <div class="step-info">
                                        <h4>AI: Папка сотрудника</h4>
                                        <p>Что содержит</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: папка штатного сотрудника — что содержит, для чего нужна</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 75 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">75</div>
                                    <div class="step-info">
                                        <h4>AI: Посадова папка</h4>
                                        <p>Разница и содержание</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: должностная папка — что содержит, отличие от папки сотрудника</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 76 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">76</div>
                                    <div class="step-info">
                                        <h4>Документ: Шаблони папок</h4>
                                        <p>Структура папок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать шаблоны папки штатного сотрудника и должностной папки</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Проведення делегування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 7: Как провести делегирование — практическая передача</td>
                        </tr>

                        <!-- Шаг 77 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">77</div>
                                    <div class="step-info">
                                        <h4>AI: Проведення делегування</h4>
                                        <p>Практичний алгоритм</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: как провести делегирование шаг за шагом, что говорить</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Форма ППФ -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 8: Форма ППФ — документ передачи функции</td>
                        </tr>

                        <!-- Шаг 78 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">78</div>
                                    <div class="step-info">
                                        <h4>AI: Форма ППФ</h4>
                                        <p>Протокол передачи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: форма ППФ (протокол передачи функции), как заполнять</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 79 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">79</div>
                                    <div class="step-info">
                                        <h4>Документ: Форма ППФ</h4>
                                        <p>Шаблон протоколу</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать шаблон формы ППФ для использования при делегировании</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Месяц координации -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 9: Месяц координации — сопровождение нового человека на должности</td>
                        </tr>

                        <!-- Шаг 80 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">80</div>
                                    <div class="step-info">
                                        <h4>AI: Месяц координации</h4>
                                        <p>Зачем и как</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: зачем месяц координировать нового человека, что делать, как контролировать</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 81 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">81</div>
                                    <div class="step-info">
                                        <h4>Документ: План координации</h4>
                                        <p>Чек-лист на месяц</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать план координации на месяц: ежедневные/еженедельные точки контроля</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 6: СИСТЕМА ПЛАНИРОВАНИЯ И КОММУНИКАЦИИ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    Фаза 6: Система планирования и коммуникации
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Основи планування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основы планирования — зачем и как планировать</td>
                        </tr>

                        <!-- Шаг 82 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">82</div>
                                    <div class="step-info">
                                        <h4>AI: Основи планування</h4>
                                        <p>Принципы и подходы</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: основы планирования, уровни планов, связь с целями</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Система коммуникации -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Система коммуникации — как общаться в команде</td>
                        </tr>

                        <!-- Шаг 83 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">83</div>
                                    <div class="step-info">
                                        <h4>AI: Система коммуникации</h4>
                                        <p>Канали та правила</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: каналы коммуникации, правила общения, эскалация проблем</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 84 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">84</div>
                                    <div class="step-info">
                                        <h4>Документ: Политика коммуникации</h4>
                                        <p>Правила для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать политику коммуникации: каналы, время ответа, форматы</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Совещания и встречи -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Совещания и встречи — эффективные коммуникации</td>
                        </tr>

                        <!-- Шаг 85 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">85</div>
                                    <div class="step-info">
                                        <h4>AI: Совещания и встречи</h4>
                                        <p>Як проводити ефективно</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: типы совещаний, структура встречи, протоколирование решений</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 86 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">86</div>
                                    <div class="step-info">
                                        <h4>Документ: Регламент нарад</h4>
                                        <p>Шаблони та правила</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити регламент нарад: типи, частота, шаблон протоколу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 7: СИСТЕМА КООРДИНАЦИЙ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                    Фаза 7: Система координаций
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Что такое координация -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Что такое координация — синхронизация работы команды</td>
                        </tr>

                        <!-- Шаг 87 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">87</div>
                                    <div class="step-info">
                                        <h4>AI: Основы координации</h4>
                                        <p>Зачем и как</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: что такое координация, отличие от контроля, роль руководителя</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Ежедневная координация -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Ежедневная координация — daily standup</td>
                        </tr>

                        <!-- Шаг 88 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">88</div>
                                    <div class="step-info">
                                        <h4>AI: Ежедневная координация</h4>
                                        <p>Daily standup</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: ежедневная координация, формат, вопросы, длительность</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Еженедельная координация -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Еженедельная координация — weekly review</td>
                        </tr>

                        <!-- Шаг 89 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">89</div>
                                    <div class="step-info">
                                        <h4>AI: Еженедельная координация</h4>
                                        <p>Weekly review</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: еженедельная координация, анализ результатов, планирование недели</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 90 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">90</div>
                                    <div class="step-info">
                                        <h4>Документ: Система координаций</h4>
                                        <p>Регламент та шаблони</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать систему координаций: ежедневная, еженедельная, месячная</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 8: СИСТЕМА ТАКТИЧНОГО ПЛАНУВАННЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Фаза 8: Система тактического планирования
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Тактичне планування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основы тактического планирования — месяц/квартал</td>
                        </tr>

                        <!-- Шаг 91 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">91</div>
                                    <div class="step-info">
                                        <h4>AI: Тактичне планування</h4>
                                        <p>Месяц и квартал</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: тактическое планирование, горизонт месяц/квартал, декомпозиция целей</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: OKR та KPI -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: OKR и KPI — метрики достижения</td>
                        </tr>

                        <!-- Шаг 92 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">92</div>
                                    <div class="step-info">
                                        <h4>AI: OKR та KPI</h4>
                                        <p>Метрики результатов</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: OKR и KPI, как ставить, как отслеживать, каскадирование</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 93 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">93</div>
                                    <div class="step-info">
                                        <h4>Документ: Тактичний план</h4>
                                        <p>Шаблон на квартал</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Створити шаблон тактичного плану на квартал з OKR</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 9: СТРАТЕГИЧЕСКОЕ ПЛАНИРОВАНИЕ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                                    Фаза 9: Стратегическое планирование
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Стратегия -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основы стратегии — видение на 1-3-5 лет</td>
                        </tr>

                        <!-- Шаг 94 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">94</div>
                                    <div class="step-info">
                                        <h4>AI: Основы стратегии</h4>
                                        <p>Видение и миссия</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: стратегическое планирование, видение, миссия, горизонт 1-3-5 лет</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Стратегический анализ -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Стратегический анализ — SWOT, конкуренты, рынок</td>
                        </tr>

                        <!-- Шаг 95 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">95</div>
                                    <div class="step-info">
                                        <h4>AI: Стратегический анализ</h4>
                                        <p>SWOT та ринок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: SWOT-анализ, анализ конкурентов, позиционирование</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 96 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">96</div>
                                    <div class="step-info">
                                        <h4>Документ: Стратегический план</h4>
                                        <p>План на 1-3 роки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать стратегический план: видение, цели, ключевые инициативы</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 10: АВТОМАТИЗАЦИЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    Фаза 10: Автоматизация
                                </div>
                            </td>
                        </tr>

                        <!-- Подфаза: Основы автоматизации -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основы автоматизации — что и зачем автоматизировать</td>
                        </tr>

                        <!-- Шаг 97 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">97</div>
                                    <div class="step-info">
                                        <h4>AI: Основы автоматизации</h4>
                                        <p>Що автоматизувати</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: что стоит автоматизировать, приоритеты, ROI автоматизации</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: AI в бизнесе -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: AI в бизнесе — практическое применение</td>
                        </tr>

                        <!-- Шаг 98 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">98</div>
                                    <div class="step-info">
                                        <h4>AI: AI в бизнесе</h4>
                                        <p>Практические кейсы</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: AI для бизнеса, чат-боты, ассистенты, генерация контента</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Подфаза: Интеграции и автоматизация -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Интеграции — соединение систем</td>
                        </tr>

                        <!-- Шаг 99 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">99</div>
                                    <div class="step-info">
                                        <h4>AI: Интеграции</h4>
                                        <p>Соединение систем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-ассистент</span>
                                </div>
                            </td>
                            <td class="task-text">Разобрать: интеграции между системами, Zapier, Make, API</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Шаг 100 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">100</div>
                                    <div class="step-info">
                                        <h4>Документ: План автоматизации</h4>
                                        <p>Roadmap впровадження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Ожидает
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon doc">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <span class="tool-name">Документ</span>
                                </div>
                            </td>
                            <td class="task-text">Создать план автоматизации: приоритеты, инструменты, сроки</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 мин
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    </div>
        </div>`;
    };



    // ── Mark complete ─────────────────────────────────────────
    const _learningToggleLock = new Set(); // lock for double-click (БАГ 3)

    window._toggleLearningComplete = function(moduleId, done) {
        if (_learningToggleLock.has(moduleId)) return;
        _learningToggleLock.add(moduleId);
        if (!learningProgress[moduleId]) learningProgress[moduleId] = {};
        learningProgress[moduleId].completed = done;
        updateModulesFromLearningProgress();
        saveLearningProgress().finally(() => {
            _learningToggleLock.delete(moduleId);
        });
        window._openLearningModule(moduleId);
    };

    // ── Save homework ─────────────────────────────────────────
    window._saveLearningHomework = function(moduleId) {
        const ta = document.getElementById('learningHwTextarea');
        if (!ta) return;

        // БАГ 6: підтвердження перед видаленням статусу "Виконано"
        const wasHomeworkDone = learningProgress[moduleId] && learningProgress[moduleId].homeworkDone;
        const newHomeworkDone = ta.value.trim().length > 0;
        if (wasHomeworkDone && !newHomeworkDone) {
            const msg = window.t('learningClearConfirm');
            if (!confirm(msg)) return;
        }

        // БАГ 2: disable кнопки + feedback
        const btn = document.querySelector('.l-btn-save-hw');
        if (btn) {
            btn.disabled = true;
            const origText = btn.innerHTML;
            btn.innerHTML = window.t('learningSaved');
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = origText;
            }, 2000);
        }

        if (!learningProgress[moduleId]) learningProgress[moduleId] = {};
        learningProgress[moduleId].homeworkText = ta.value;
        learningProgress[moduleId].homeworkDone = newHomeworkDone;
        saveLearningProgress();

        // ── Зберігаємо профільні поля компанії ─────────────────
        // Модуль 10: Ціль і Задум → companyGoal, companyConcept
        // Модуль 11: ЦКП → companyCKP
        if (moduleId === 10 || moduleId === 11) {
            _saveLearningCompanyProfile(moduleId);
        }

        setTimeout(() => window._openLearningModule(moduleId), 2100);
    };

    // ── Збереження профільних полів компанії з уроків 10/11 ──
    async function _saveLearningCompanyProfile(moduleId) {
        const cid = _companyId();
        if (!cid || !_db()) return;

        const updates = {};

        if (moduleId === 10) {
            const goalEl    = document.getElementById('learningCompanyGoal');
            const conceptEl = document.getElementById('learningCompanyConcept');
            const idealEl   = document.getElementById('learningCompanyIdeal');
            if (goalEl    && goalEl.value.trim())    updates.companyGoal    = goalEl.value.trim();
            if (conceptEl && conceptEl.value.trim()) updates.companyConcept = conceptEl.value.trim();
            if (idealEl   && idealEl.value.trim())   updates.companyIdeal   = idealEl.value.trim();
        }

        if (moduleId === 11) {
            const ckpEl = document.getElementById('learningCompanyCKP');
            if (ckpEl && ckpEl.value.trim()) updates.companyCKP = ckpEl.value.trim();
        }

        if (Object.keys(updates).length === 0) return;

        updates.profileUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
        updates.profileUpdatedBy = window.currentUser?.email || 'owner';

        try {
            await _db().collection('companies').doc(cid).update(updates);

            // Оновлюємо кеш
            if (!window._cachedCompanyProfile) window._cachedCompanyProfile = {};
            Object.assign(window._cachedCompanyProfile, updates);

            // Синхронізуємо поля в Системі → Компанія якщо вони відкриті
            const fieldMap = {
                companyGoal:    'settingGoal',
                companyConcept: 'settingConcept',
                companyCKP:     'settingCKP',
                companyIdeal:   'settingIdealPicture',
            };
            Object.entries(updates).forEach(([key, val]) => {
                if (fieldMap[key]) {
                    const el = document.getElementById(fieldMap[key]);
                    if (el && typeof val === 'string') {
                        el.value = val;
                        // Підсвічуємо поле на секунду
                        el.style.borderColor = '#22c55e';
                        setTimeout(() => { el.style.borderColor = ''; }, 1500);
                    }
                }
            });

            if (window.showToast) {
                const labels = {
                    10: 'Ціль і задум збережено в профіль компанії ✓',
                    11: 'ЦКП збережено в профіль компанії ✓',
                };
                showToast(labels[moduleId] || 'Збережено', 'success');
            }
        } catch(e) {
            console.warn('[Learning] Company profile save error:', e);
        }
    }
    window._saveLearningCompanyProfile = _saveLearningCompanyProfile;

    // ── Init (called when tab opens) ──────────────────────────
    window.initLearning = function() {
        loadLearningProgress();
        // Завантажуємо профіль компанії для підтягування в поля уроків 10/11
        _loadCompanyProfileCache();
    };

    // Кешуємо профіль компанії для уроків 10/11
    async function _loadCompanyProfileCache() {
        const cid = _companyId();
        if (!cid || !_db()) return;
        try {
            const snap = await _db().collection('companies').doc(cid).get();
            if (snap.exists) {
                window._cachedCompanyProfile = snap.data();
            }
        } catch(e) { /* ignore */ }
    }
    window._loadCompanyProfileCache = _loadCompanyProfileCache;

    // ── Re-render on tab switch ───────────────────────────────
    window.renderLearning = renderLearning;

    // ── AI Assistant block ───────────────────────────────────
        // НЕ перезаписуємо window.learningCourseData — там можуть бути всі курси (маркетинг/HR/etc)
        // window.learningCourseData = learningCourseData; // ВИДАЛЕНО

window._openAIAssistant = function(moduleTitle, homeworkText) {
        const prompt = `У мене завдання з програми навчання TALKO:\n\nМодуль: ${moduleTitle}\n${homeworkText ? 'Домашнє завдання: ' + homeworkText + '\n' : ''}\nЯк мені це виконати? Проведи мене крок за кроком.`;
        navigator.clipboard.writeText(prompt).catch(() => {});
        window.open(AI_ASSISTANT_URL, '_blank');
    };

    function renderAIBlock(module, isRu) {
        const lang = getLearningLang();
        const title = getLangField(module, 'title', lang);
        const hwRaw = getLangField(module, 'homework', lang);
        // Витягуємо тільки текст з <li> елементів, ігноруємо заголовки блоку
        const hwItems = [];
        const liMatches = hwRaw.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
        liMatches.forEach(li => hwItems.push(li.replace(/<[^>]*>/g, '').trim()));
        const hw = hwItems.length ? hwItems.join('; ') : hwRaw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
        const aiPrompts = {
            ru: `У меня задание из программы обучения TALKO:\n\nМодуль: ${title}\n${hw ? 'Домашнее задание: ' + hw + '\n' : ''}\nКак мне это выполнить? Проведи меня шаг за шагом.`,
            en: `I have an assignment from the TALKO training program:\n\nModule: ${title}\n${hw ? 'Homework: ' + hw + '\n' : ''}\nHow do I complete it? Guide me step by step.`,
            pl: `Mam zadanie z programu szkoleniowego TALKO:\n\nModuł: ${title}\n${hw ? 'Zadanie domowe: ' + hw + '\n' : ''}\nJak to wykonać? Przeprowadź mnie krok po kroku.`,
            de: `Ich habe eine Aufgabe aus dem TALKO-Schulungsprogramm:\n\nModul: ${title}\n${hw ? 'Hausaufgabe: ' + hw + '\n' : ''}\nWie soll ich das erledigen? Führe mich Schritt für Schritt.`,
        };
        const prompt = aiPrompts[lang] || `У мене завдання з програми навчання TALKO:\n\nМодуль: ${title}\n${hw ? 'Домашнє завдання: ' + hw + '\n' : ''}\nЯк мені це виконати? Проведи мене крок за кроком.`;
        const btnText = 'Запитати AI асистента';
        const descText = 'Зайдіть в AI асистента, натисніть кнопку нижче — промпт скопіюється автоматично. Вставте його в чат і асистент проведе вас через виконання.';
        return `
        <div class="l-ai-block">
            <div class="l-ai-block-header">
                <div class="l-ai-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="26" height="26"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg></div>
                <div>
                    <div class="l-ai-title">AI Технічний провідник</div>
                    <div class="l-ai-desc">${descText}</div>
                </div>
            </div>
            <div class="l-ai-prompt-preview">${prompt.replace(/\\n/g,'<br>').replace(/\n/g,'<br>')}</div>
            <button class="l-ai-btn" onclick="navigator.clipboard.writeText(\`${prompt}\`).catch(()=>{});window.open('${AI_ASSISTANT_URL}','_blank')">
                ${btnText} →
            </button>
        </div>`;
    }


    window._openLearningModule = function(moduleId) {
        const module = learningCourseData.find(m => m.id === moduleId);
        if (!module) return;
        currentLearningModule = module;
        const lang = getLearningLang();
        const isRu = lang === 'ru';

        const title = getLangField(module, 'title', lang);
        const subtitle = getLangField(module, 'subtitle', lang);
        const content = getLangField(module, 'lessonContent', lang);
        const isCompleted = module.completed;
        const hwText = (learningProgress[moduleId] || {}).homeworkText || '';
        const hwDone = (learningProgress[moduleId] || {}).homeworkDone || false;
        // Display number = position in filtered list + 1 (same as card list)
        const _activeCat = window._learningActiveCategory || 'systematization';
        const _filteredList = learningCourseData.filter(m => (m.category || 'systematization') === _activeCat);
        const _moduleIndex = _filteredList.findIndex(m => m.id === moduleId);
        const _displayNum = _moduleIndex >= 0 ? _moduleIndex + 1 : moduleId;

        const root = document.getElementById('learningTab');
        root.innerHTML = `
        <div class="learning-wrap">
            <div class="learning-module-nav">
                <button class="l-back-btn" onclick="window._closeLearningModule()">
                    <i data-lucide="arrow-left" class="icon" style="width:18px;height:18px;"></i>
                    ${window.t('learningBack')}
                </button>

            </div>

            <div class="l-module-detail">
                <div class="l-detail-header">
                    <div class="l-detail-num">${_displayNum}</div>
                    <div>
                        <div class="l-detail-title">${title}</div>
                        ${subtitle ? `<div class="l-detail-subtitle">${subtitle}</div>` : ''}
                        ${module.time ? `<div class="l-module-time" style="margin-top:4px;"><i data-lucide="clock" class="icon" style="width:12px;height:12px;"></i> ${module.time} ${window.t('learningMin')}</div>` : ''}
                    </div>
                </div>

                ${module.videoLink ? `
                <div class="l-links-row">
                    <a href="${module.videoLink}" target="_blank" class="l-link-btn video">
                        <i data-lucide="play-circle" class="icon" style="width:16px;height:16px;"></i>
                        ${window.t('learningVideo')}
                    </a>
                    ${module.materialsLink ? `<a href="${module.materialsLink}" target="_blank" class="l-link-btn materials">
                        <i data-lucide="file-text" class="icon" style="width:16px;height:16px;"></i>
                        ${window.t('learningMaterials')}
                    </a>` : ''}
                </div>` : ''}

                <!-- Lesson content -->
                <div class="l-lesson-content">
                    ${content}
                </div>

                <!-- AI Assistant block — disabled globally -->

                <!-- Homework block -->
                ${module.homework ? (() => {
                    const hwHtml = getLangField(module, 'homework', lang);
                    const liItems2 = [];
                    const liM = hwHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
                    liM.forEach(li => liItems2.push(li.replace(/<[^>]*>/g, '').trim()));
                    const hwLinkUrl = module.homeworkLink || null;
                    const hwLinkName = getLangField(module, 'homeworkLinkName', lang);
                    return `
                <div class="l-homework-block">
                    <div class="l-homework-title">
                        <i data-lucide="pencil" class="icon" style="width:16px;height:16px;color:#f59e0b;"></i>
                        ${window.t('learningHomework')}
                    </div>
                    ${liItems2.length
                        ? `<ol style="margin:0.5rem 0 0.75rem 1.2rem;padding:0;color:#374151;font-size:0.9rem;line-height:1.7;">${liItems2.map(item => `<li>${item}</li>`).join('')}</ol>`
                        : `<div class="l-homework-desc">${hwHtml}</div>`
                    }
                    ${hwLinkUrl ? `<a href="${hwLinkUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:10px;font-size:0.875rem;color:#16a34a;text-decoration:none;font-weight:600;margin-bottom:0.75rem;">${hwLinkName || '→ AI-асистент'}</a>` : ''}

                    ${/* Модуль 10: Ціль і задум — профільні поля */ moduleId === 10 ? `
                    <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
                        <div style="font-size:0.72rem;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem;display:flex;align-items:center;gap:6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                            ${isRu ? "Профиль компании — сохраняется автоматически при сохранении" : "Профіль компанії — зберігається автоматично при збереженні"}
                        </div>
                        <div style="display:flex;flex-direction:column;gap:0.6rem;">
                            <div>
                                <label style="font-size:0.72rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem;">${isRu ? "Цель компании" : "Ціль компанії"} <span style="color:#ef4444;">*</span></label>
                                <input id="learningCompanyGoal" type="text"
                                    placeholder="${isRu ? 'напр. Стать лидером рынка медицинских услуг в регионе к 2027 году' : 'напр. Стати лідером ринку медичних послуг у регіоні до 2027 року'}"
                                    value="${(window._cachedCompanyProfile?.companyGoal||'').replace(/"/g,'&quot;')}"
                                    style="width:100%;padding:0.45rem 0.6rem;border:1px solid #86efac;border-radius:7px;font-size:0.85rem;box-sizing:border-box;background:#fff;">
                            </div>
                            <div>
                                <label style="font-size:0.72rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem;">${isRu ? "Замысел компании" : "Задум компанії"}</label>
                                <textarea id="learningCompanyConcept" rows="2"
                                    placeholder="${isRu ? 'Почему вы создали этот бизнес? Какова ваша миссия?' : 'Чому ви створили цей бізнес? Яка ваша місія?'}"
                                    style="width:100%;padding:0.45rem 0.6rem;border:1px solid #86efac;border-radius:7px;font-size:0.85rem;box-sizing:border-box;resize:vertical;background:#fff;">${(window._cachedCompanyProfile?.companyConcept||'')}</textarea>
                            </div>
                            <div>
                                <label style="font-size:0.72rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem;">${isRu ? "Идеальная картина компании" : "Ідеальна картина компанії"}</label>
                                <textarea id="learningCompanyIdeal" rows="2"
                                    placeholder="${isRu ? 'Опишите как выглядит ваш бизнес через 3-5 лет в деталях...' : 'Опишіть як виглядає ваш бізнес через 3-5 років у деталях...'}"
                                    style="width:100%;padding:0.45rem 0.6rem;border:1px solid #86efac;border-radius:7px;font-size:0.85rem;box-sizing:border-box;resize:vertical;background:#fff;">${(window._cachedCompanyProfile?.companyIdeal||'')}</textarea>
                            </div>
                        </div>
                    </div>` : ''}

                    ${/* Модуль 11: ЦКП — профільне поле */ moduleId === 11 ? `
                    <div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:1rem;margin-bottom:0.75rem;">
                        <div style="font-size:0.72rem;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.05em;margin-bottom:0.75rem;display:flex;align-items:center;gap:6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            ${isRu ? "ЦКП — Ценный Конечный Продукт" : "ЦКП — Цінний Кінцевий Продукт"}
                        </div>
                        <div>
                            <label style="font-size:0.72rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem;">
                                ${isRu ? "Главный ЦКП вашей компании" : "Головний ЦКП вашої компанії"} <span style="color:#ef4444;">*</span>
                            </label>
                            <textarea id="learningCompanyCKP" rows="3"
                                placeholder="Приклад: «Власник бізнесу виходить з операційки за 65 днів»&#10;або: «Готовий об'єкт у встановлені терміни, з гарантією якості, без додаткових витрат понад кошторис»"
                                style="width:100%;padding:0.45rem 0.6rem;border:1px solid #7dd3fc;border-radius:7px;font-size:0.85rem;box-sizing:border-box;resize:vertical;background:#fff;">${(window._cachedCompanyProfile?.companyCKP||'')}</textarea>
                            <div style="font-size:0.72rem;color:#6b7280;margin-top:0.3rem;">
                                ${isRu ? 'Формула: конкретное изменение + условия + без чего (если есть)' : 'Формула: конкретна зміна + умови + без чого (якщо є)'}
                            </div>
                        </div>
                    </div>` : ''}

                    <textarea class="l-homework-textarea" id="learningHwTextarea" placeholder="${window.t('learningHwPlaceholder')}">${hwText}</textarea>
                    <div class="l-homework-actions">
                        ${hwDone ? `<span class="l-hw-done-badge"><i data-lucide="check" class="icon" style="width:14px;height:14px;"></i> ${window.t('learningDone')}</span>` : ''}
                        <button class="l-btn-save-hw" onclick="window._saveLearningHomework(${moduleId})">
                            ${window.t('learningSave')}
                        </button>
                    </div>
                </div>`;
                })() : ''}

                <!-- Presentation launch button (lessons 10 and 11) -->
                ${module.presOverlay ? (function(){
                    var _isRu = getLearningLang() === 'ru';
                    var pLabels = {
                        10: _isRu ? 'Занятие 1 — Цели, замысел и будущее компании' : 'Заняття 1 — Цілі, задуми і майбутнє компанії',
                        11: _isRu ? 'Занятие 2 — Ценный конечный продукт компании' : 'Заняття 2 — Цінний кінцевий продукт компанії',
                        12: _isRu ? 'Совещание — Оргсхема компании' : 'Нарада — Оргсхема компанії'
                    };
                    var pSlides = {
                        10: _isRu ? '46 слайдов' : '46 слайдів',
                        11: _isRu ? '43 слайда' : '43 слайди',
                        12: _isRu ? '33 слайда' : '33 слайди'
                    };
                    var pFns = {10:'_l10Launch', 11:'_l11Launch', 12:'_l12Launch'};
                    var pLabel = pLabels[moduleId] || (_isRu ? 'Презентация' : 'Презентація');
                    var pSlide = pSlides[moduleId] || '';
                    var pFn = pFns[moduleId] || '_l10Launch';
                    var pSubtitle = _isRu ? 'Провести с командой после изучения урока' : 'Провести із командою після вивчення уроку';
                    var pBtn = _isRu ? '▶ Запустить презентацию' : '▶ Запустити презентацію';
                    return '<div style="margin:0 1.25rem 1.25rem"><div style="background:linear-gradient(135deg,#0f1c3f,#1a3a6b);border-radius:16px;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;box-shadow:0 4px 20px rgba(15,28,63,.2)"><div style="color:white"><div style="font-size:.9rem;font-weight:800;margin-bottom:.25rem">' + pLabel + '</div><div style="font-size:.76rem;color:#94a3b8">' + pSlide + ' · ' + pSubtitle + '</div></div><button onclick="window.' + pFn + '()" style="display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#22c55e;color:white;border:none;border-radius:12px;font-size:.9rem;font-weight:800;cursor:pointer;white-space:nowrap;box-shadow:0 2px 10px rgba(34,197,94,.35)">' + pBtn + '</button></div></div>';
                })() : ''}

                <!-- Complete button -->
                <div class="l-complete-row">
                    ${isCompleted
                        ? `<button class="l-btn-completed" onclick="window._toggleLearningComplete(${moduleId}, false)">
                            <i data-lucide="check-circle" class="icon" style="width:18px;height:18px;"></i>
                            ${window.t('learningCompleted')}
                           </button>`
                        : `<button class="l-btn-complete" onclick="window._toggleLearningComplete(${moduleId}, true)">
                            ${window.t('learningMarkDone')}
                           </button>`
                    }
                </div>
            </div>
        </div>`;

        if (window.refreshIcons) window.refreshIcons();

        // Inject presOverlay (fullscreen presentation) directly into document.body
        // so it's not affected by overflow:hidden on .l-module-detail
        _cleanPresOverlays();
        if (module.presOverlay) {
            var _ovDiv = document.createElement('div');
            var _presLang = getLearningLang();
            var _presContent = (_presLang === 'ru' && module.presOverlay_ru) ? module.presOverlay_ru : module.presOverlay;
            _ovDiv.innerHTML = _presContent;
            while (_ovDiv.firstChild) document.body.appendChild(_ovDiv.firstChild);
            // Force hide immediately regardless of CSS state
            ['l10Ov','l11Ov','l12Ov'].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) {
                    el.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;flex-direction:column;background:#000;';
                }
            });
        }

        // Execute <script> tags from lessonContent (innerHTML does not run them)
        setTimeout(function() {
            var _lc = document.querySelector(".l-lesson-content");
            if (_lc) {
                _lc.querySelectorAll("script").forEach(function(s) {
                    var ns = document.createElement("script");
                    ns.textContent = s.textContent;
                    document.head.appendChild(ns);
                    document.head.removeChild(ns);
                });
            }

            // ── Lesson 10: Ціль і задум ─────────────────────────────
            (function initL10() {
                if (!document.getElementById('l10Ov')) return;
                var T = 46, c = 1, SK = 'l10d';
                var FI = ['terms','local_company','local2','local_goal','local_vision',
                    'logo','company_goal','goal_q','company_vision','ideal','years',
                    'history_year','history_dates','star_goal'];

                window._l10SF = async function(k, v) {
                    try {
                        var r = await window.storage.get(SK);
                        var d = r ? JSON.parse(r.value) : {};
                        d[k] = v;
                        await window.storage.set(SK, JSON.stringify(d));
                        if (k === 'goal_q') {
                            var q = document.getElementById('l10q27');
                            if (q) q.textContent = v || '[ваша мета]';
                        }
                    } catch(e) {}
                };
                window._l10SaveAll = async function() {
                    try {
                        var d = {};
                        FI.forEach(function(k) { var e = document.getElementById('l10f_' + k); if (e) d[k] = e.value; });
                        await window.storage.set(SK, JSON.stringify(d));
                        if (window.showToast) window.showToast('Збережено', 'success');
                    } catch(e) {}
                };
                function go10(n) {
                    var ov = document.getElementById('l10Ov');
                    var cur = ov.querySelector('.l10s.on');
                    if (cur) cur.classList.remove('on');
                    c = n;
                    var next = document.getElementById('l10_' + c);
                    if (next) next.classList.add('on');
                    var ctr = document.getElementById('l10Ctr');
                    if (ctr) ctr.textContent = c + ' / ' + T;
                    var prev = document.getElementById('l10Prev');
                    var nxt = document.getElementById('l10Next');
                    if (prev) prev.disabled = (c === 1);
                    if (nxt) nxt.disabled = (c === T);
                }
                window._l10P = function() { if (c > 1) go10(c - 1); };
                window._l10N = function() { if (c < T) go10(c + 1); };
                window._l10Launch = async function() {
                    var ov = document.getElementById('l10Ov');
                    if (!ov) return;
                    ov.style.cssText = 'display:flex;position:fixed;inset:0;z-index:99999;flex-direction:column;background:#000;'; ov.classList.add('on');
                    document.body.style.overflow = 'hidden';
                    go10(1);
                    try {
                        var r = await window.storage.get(SK);
                        if (r && r.value) {
                            var d = JSON.parse(r.value);
                            FI.forEach(function(k) { var e = document.getElementById('l10f_' + k); if (e && d[k]) e.value = d[k]; });
                            if (d.goal_q) { var q = document.getElementById('l10q27'); if (q) q.textContent = d.goal_q; }
                        }
                    } catch(e) {}
                };
                window._l10Close = function() {
                    var ov = document.getElementById('l10Ov');
                    if (ov) { ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;'; ov.classList.remove('on'); }
                    document.body.style.overflow = '';
                    window._l10SaveAll();
                };
            })();

            // ── Lesson 12: Оргсхема ─────────────────────────────────
            (function initL12() {
                if (!document.getElementById('l12Ov')) return;
                var T = 33, c = 1;
                window._l12SaveAll = function() {};
                function go12(n) {
                    var ov = document.getElementById('l12Ov');
                    var cur = ov.querySelector('.l12s.on');
                    if (cur) cur.classList.remove('on');
                    c = n;
                    var next = document.getElementById('l12_' + c);
                    if (next) next.classList.add('on');
                    var ctr = document.getElementById('l12Ctr');
                    if (ctr) ctr.textContent = c + ' / ' + T;
                    var pf = document.getElementById('l12PF');
                    if (pf) pf.style.width = Math.round((c/T)*100) + '%';
                    var prev = document.getElementById('l12Prev');
                    var nxt = document.getElementById('l12Next');
                    if (prev) prev.disabled = (c === 1);
                    if (nxt) nxt.disabled = (c === T);
                }
                window._l12P = function() { if (c > 1) go12(c - 1); };
                window._l12N = function() { if (c < T) go12(c + 1); };
                window._l12Launch = function() {
                    var ov = document.getElementById('l12Ov');
                    if (!ov) return;
                    ov.style.cssText = 'display:flex;position:fixed;inset:0;z-index:99999;flex-direction:column;background:#000;'; ov.classList.add('on');
                    document.body.style.overflow = 'hidden';
                    go12(1);
                };
                window._l12Close = function() {
                    var ov = document.getElementById('l12Ov');
                    if (ov) { ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;'; ov.classList.remove('on'); }
                    document.body.style.overflow = '';
                };
            })();


            (function initL11() {
                if (!document.getElementById('l11Ov')) return;
                var T = 43, c = 1, SK = 'l11d';
                var FI = ['values_why','values_left','ckp','v123','goal','ckp_final'];

                window._l11SF = async function(k, v) {
                    try {
                        var r = await window.storage.get(SK);
                        var d = r ? JSON.parse(r.value) : {};
                        d[k] = v;
                        await window.storage.set(SK, JSON.stringify(d));
                    } catch(e) {}
                };
                window._l11SaveAll = async function() {
                    try {
                        var d = {};
                        FI.forEach(function(k) { var e = document.getElementById('l11f_' + k); if (e) d[k] = e.value; });
                        await window.storage.set(SK, JSON.stringify(d));
                        if (window.showToast) window.showToast('Збережено', 'success');
                    } catch(e) {}
                };
                function go11(n) {
                    var ov = document.getElementById('l11Ov');
                    var cur = ov.querySelector('.l11s.on');
                    if (cur) cur.classList.remove('on');
                    c = n;
                    var next = document.getElementById('l11_' + c);
                    if (next) next.classList.add('on');
                    var ctr = document.getElementById('l11Ctr');
                    if (ctr) ctr.textContent = c + ' / ' + T;
                    var prev = document.getElementById('l11Prev');
                    var nxt = document.getElementById('l11Next');
                    if (prev) prev.disabled = (c === 1);
                    if (nxt) nxt.disabled = (c === T);
                }
                window._l11P = function() { if (c > 1) go11(c - 1); };
                window._l11N = function() { if (c < T) go11(c + 1); };
                window._l11Launch = async function() {
                    var ov = document.getElementById('l11Ov');
                    if (!ov) return;
                    ov.style.cssText = 'display:flex;position:fixed;inset:0;z-index:99999;flex-direction:column;background:#000;'; ov.classList.add('on');
                    document.body.style.overflow = 'hidden';
                    go11(1);
                    try {
                        var r = await window.storage.get(SK);
                        if (r && r.value) {
                            var d = JSON.parse(r.value);
                            FI.forEach(function(k) { var e = document.getElementById('l11f_' + k); if (e && d[k]) e.value = d[k]; });
                        }
                    } catch(e) {}
                };
                window._l11Close = function() {
                    var ov = document.getElementById('l11Ov');
                    if (ov) { ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;'; ov.classList.remove('on'); }
                    document.body.style.overflow = '';
                    window._l11SaveAll();
                };

                // Keyboard nav — shared listener (checks which overlay is open)
                document.addEventListener('keydown', function(e) {
                    var ov10 = document.getElementById('l10Ov');
                    var ov11 = document.getElementById('l11Ov');
                    if (ov10 && ov10.classList.contains('on')) {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') window._l10N();
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') window._l10P();
                        if (e.key === 'Escape') window._l10Close();
                    }
                    if (ov11 && ov11.classList.contains('on')) {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') window._l11N();
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') window._l11P();
                        if (e.key === 'Escape') window._l11Close();
                    }
                });
            })();

        }, 100);
    };

    // ── Back ──────────────────────────────────────────────────
    window._closeLearningModule = function() {
        _cleanPresOverlays();
        currentLearningModule = null;
        renderLearning();
    };




    // ── TALKO namespace ───────────────────────────────────────
    if (window.TALKO) {
        window.TALKO.learn = Object.assign(window.TALKO.learn||{}, {
            init: window.initLearning,
            render: window.renderLearning,
            openModule: window._openLearningModule,
            closeModule: window._closeLearningModule,
            openAI: window._openAIAssistant,
            openAlgoritm: window._openAlgoritm,
        });
    }

})(); // END 80-learning-engine
