// ============================================================
// 80-learning-engine.js — TALKO Learning Platform: Engine
// State, Firestore sync, render functions, init
// Потребує: 80-learning-data.js (завантажувати першим)
// ============================================================
(function() {
'use strict';

    // ── Course Data (from data module) ────────────────────────
    const learningCourseData = window.learningCourseData || [];

    // ── State ─────────────────────────────────────────────────
    let learningProgress = {};     // { moduleId: { completed, homeworkDone, homeworkText } }
    let currentLearningModule = null;
    // Use TALKO main lang - read from localStorage key used by translations module
    function getLearningLang() {
        return localStorage.getItem('talko_lang') || 'ua';
    }

    // Universal helper: module.title_de || module.title_en || module.title_ru || module.title
    function getLangField(module, field, lang) {
        if (!lang || lang === 'ua') return module[field] || '';
        const localized = module[field + '_' + lang];
        if (localized) return localized;
        // fallback chain: en → ru → ua
        if (lang === 'pl' || lang === 'de') {
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
    function renderLearning() {
        const root = document.getElementById('learningTab');
        if (!root) return;

        const stats = getLearningStats();
        const lang = getLearningLang();

        root.innerHTML = `
        <div class="learning-wrap">
            <!-- Header -->
            <div class="learning-header">
                <div class="learning-header-title">
                    <i data-lucide="graduation-cap" class="icon" style="color:#22c55e;width:24px;height:24px;"></i>
                    <span>${t('learningTitle')}</span>
                </div>
    
            </div>

            <!-- Stats bar -->
            <div class="learning-stats">
                <div class="learning-stat">
                    <div class="learning-stat-value">${stats.pct}%</div>
                    <div class="learning-stat-label">${t('learningProgress')}</div>
                </div>
                <div class="learning-stat">
                    <div class="learning-stat-value">${stats.completed}/${stats.total}</div>
                    <div class="learning-stat-label">${t('learningModules')}</div>
                </div>
                <div class="learning-progress-bar-wrap">
                    <div class="learning-progress-bar" style="width:${stats.pct}%"></div>
                </div>
            </div>

            <!-- Modules list -->
            <div class="learning-modules-list" id="learningModulesList">
                ${learningCourseData.map(module => renderModuleCard(module)).join('')}
            </div>
        </div>`;

        if (window.refreshIcons) window.refreshIcons();
    }

    function renderModuleCard(module) {
        const lang = getLearningLang();
        const title = getLangField(module, 'title', lang);
        const subtitle = getLangField(module, 'subtitle', lang);
        const isCompleted = module.completed;
        const moduleIndex = learningCourseData.findIndex(m => m.id === module.id);
        // Перші 3 модулі (індекси 0,1,2) — завжди доступні; далі — тільки після завершення попереднього
        const isAvailable = moduleIndex <= 2 || (moduleIndex > 0 && learningCourseData[moduleIndex - 1] && learningCourseData[moduleIndex - 1].completed);

        return `
        <div class="l-module-card ${isCompleted ? 'completed' : ''} ${!isAvailable ? 'locked' : ''}" 
             onclick="window._openLearningModule(${module.id})"
             style="cursor:pointer;">
            <div class="l-module-icon ${isCompleted ? 'completed' : isAvailable ? 'available' : 'locked'}">
                ${isCompleted
                    ? '<i data-lucide="check-circle" class="icon" style="width:20px;height:20px;"></i>'
                    : !isAvailable
                        ? '<i data-lucide="lock" class="icon" style="width:20px;height:20px;"></i>'
                        : `<span style="font-weight:700;font-size:0.9rem;">${module.id}</span>`
                }
            </div>
            <div class="l-module-info">
                <div class="l-module-title">${title}</div>
                ${subtitle ? `<div class="l-module-subtitle">${subtitle}</div>` : ''}
                ${module.time ? `<div class="l-module-time"><i data-lucide="clock" class="icon" style="width:12px;height:12px;"></i> ${module.time} ${t('learningMin')}</div>` : ''}
            </div>
            <div class="l-module-arrow">
                <i data-lucide="${isCompleted ? 'check' : 'chevron-right'}" class="icon" style="width:18px;height:18px;color:${isCompleted ? '#22c55e' : '#9ca3af'};"></i>
            </div>
        </div>`;
    }

    // ── Open Module Detail ────────────────────────────────────
    // ── Algoritm Route (Module 0 special view) ────────────────
    window._openAlgoritm = function() {
        const root = document.getElementById('learningTab');
        if (!root) return;
        root.innerHTML = `
        <div class="learning-wrap" style="padding:0 0 4rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;padding:1rem 1.5rem 0.5rem;position:sticky;top:0;background:white;z-index:10;border-bottom:1px solid #e5e7eb;">
                <button class="l-back-btn" onclick="window._openLearningModule(0)" style="display:flex;align-items:center;gap:0.4rem;background:none;border:none;color:#6b7280;font-size:0.875rem;cursor:pointer;">
                    ← Назад до модуля
                </button>
                <span style="font-weight:700;color:#1a1a1a;">Маршрут програми</span>
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
                <span class="progress-label">Загальний прогрес</span>
                <span class="progress-value">0 з 100 кроків (0%)</span>
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
                    <p>Виконано</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>В процесі</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="stat-content">
                    <h4>100</h4>
                    <p>Очікує</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gray">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div class="stat-content">
                    <h4>0</h4>
                    <p>Заблоковано</p>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="table-container">
            <div class="table-header-bar">
                <div class="table-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    План впровадження
                </div>
                <div class="table-actions">
                    <button class="btn btn-outline-light" style="display:none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Експорт в Excel
                    </button>
                </div>
            </div>

            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 280px;">Крок</th>
                            <th style="width: 130px;">Статус</th>
                            <th style="width: 180px;">Інструмент</th>
                            <th style="width: 300px;">Що потрібно зробити</th>
                            <th style="width: 120px;">Планова дата</th>
                            <th style="width: 90px;">Час</th>
                            <th>Коментар</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- ФАЗА 1: АРХІТЕКТУРА БІЗНЕСУ -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    Фаза 1: Архітектура бізнесу
                                </div>
                            </td>
                        </tr>

                        <!-- Крок 1 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">1</div>
                                    <div class="step-info">
                                        <h4>Словник термінів</h4>
                                        <p>Основи системи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати словник термінів та понять з AI-асистентом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 2 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">2</div>
                                    <div class="step-info">
                                        <h4>Завдання та розпорядження</h4>
                                        <p>Як ставити правильно</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати як ставити завдання та розпорядження</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 3 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">3</div>
                                    <div class="step-info">
                                        <h4>Система Радар</h4>
                                        <p>Попередження проблем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Розібратися з системою Радар — щоб люди не приходили з проблемою</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 4 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">4</div>
                                    <div class="step-info">
                                        <h4>Впровадження Радар</h4>
                                        <p>Для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Дати людям систему і пояснити як використовувати AI Радар</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 5 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">5</div>
                                    <div class="step-info">
                                        <h4>Система Компас</h4>
                                        <p>Напрямок руху</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Розібрати систему Компас з AI-асистентом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 6 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">6</div>
                                    <div class="step-info">
                                        <h4>Технічний провідник</h4>
                                        <p>Налаштування систем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">Техн. провідник</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-інструмент для покрокового налаштування CRM, таблиць, ботів</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 7 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">7</div>
                                    <div class="step-info">
                                        <h4>Папка на Google Drive</h4>
                                        <p>Систематизація TALKO</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити папку "Систематизація TALKO" на Google Drive</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 8 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">8</div>
                                    <div class="step-info">
                                        <h4>Техн. провідник команді</h4>
                                        <p>Впровадження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Дати співробітникам Технічний провідник для використання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 9 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">9</div>
                                    <div class="step-info">
                                        <h4>Асистент розвитку</h4>
                                        <p>Самоаналіз та мислення</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Розвиток</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати асистента для самоаналізу: інструменти, бізнес-модель, цілі, переконання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 10 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">10</div>
                                    <div class="step-info">
                                        <h4>Розмова з командою</h4>
                                        <p>Плани систематизації</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Провести розмову зі співробітниками щодо планів систематизації та наступних кроків</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Ціль та ідеальна картина -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Ціль, задум та ідеальна картина</td>
                        </tr>

                        <!-- Крок 10 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">11</div>
                                    <div class="step-info">
                                        <h4>Ціль та ідеальна картина</h4>
                                        <p>Формування політики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти асистента "Ціль, задум та ідеальна картина" та сформувати політику</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 11 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">12</div>
                                    <div class="step-info">
                                        <h4>Презентація цілі</h4>
                                        <p>Тезиси для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентація</span>
                                </div>
                            </td>
                            <td class="task-text">Створити презентацію та тезиси до цілі та ідеальної картини</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 12 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">13</div>
                                    <div class="step-info">
                                        <h4>Впровадження цілі</h4>
                                        <p>Донесення команді</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження цілі та ідеальної картини для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Продукт організації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Продукт організації</td>
                        </tr>

                        <!-- Крок 13 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">14</div>
                                    <div class="step-info">
                                        <h4>Продукт організації</h4>
                                        <p>Політика продукту</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Пройти асистента "Продукт організації" та створити політику</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 14 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">15</div>
                                    <div class="step-info">
                                        <h4>Презентація продукту</h4>
                                        <p>Підготовка матеріалів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентація</span>
                                </div>
                            </td>
                            <td class="task-text">Підготувати презентацію продукту організації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 15 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">16</div>
                                    <div class="step-info">
                                        <h4>Впровадження продукту</h4>
                                        <p>Донесення команді</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження продукту для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Структура -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Структура</td>
                        </tr>

                        <!-- Крок 16 -->
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
                                    Очікує
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
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 17 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">18</div>
                                    <div class="step-info">
                                        <h4>Презентація структури</h4>
                                        <p>Підготовка</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon present">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <span class="tool-name">Презентація</span>
                                </div>
                            </td>
                            <td class="task-text">Провести презентацію структури</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 18 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">19</div>
                                    <div class="step-info">
                                        <h4>Впровадження структури</h4>
                                        <p>Донесення команді</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Провести впровадження структури для команди</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Статистики та платформа -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Статистики та платформа</td>
                        </tr>

                        <!-- Крок 19 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">20</div>
                                    <div class="step-info">
                                        <h4>Статистики</h4>
                                        <p>Довідник метрик</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Пройти асистента "Статистики" та створити довідник</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 20 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">21</div>
                                    <div class="step-info">
                                        <h4>Платформа: Структура</h4>
                                        <p>Освоєння модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Освоїти платформу "Структура"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 21 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">22</div>
                                    <div class="step-info">
                                        <h4>Платформа: Статистики</h4>
                                        <p>Освоєння модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Освоїти платформу "Статистики"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 22 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">23</div>
                                    <div class="step-info">
                                        <h4>Платформа: Таск-трекер</h4>
                                        <p>Освоєння модуля</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Освоїти платформу "Таск-трекер"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Вузьке місце та таски -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Вузьке місце та практика</td>
                        </tr>

                        <!-- Крок 23 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">24</div>
                                    <div class="step-info">
                                        <h4>Аналіз вузького місця</h4>
                                        <p>Знаходження проблеми</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                    </div>
                                    <span class="tool-name">Аналіз</span>
                                </div>
                            </td>
                            <td class="task-text">Провести аналіз вузького місця бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 24 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">25</div>
                                    <div class="step-info">
                                        <h4>План вузького місця</h4>
                                        <p>Розпорядження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Скласти план вузького місця та розбити на розпорядження</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 25 -->
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
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Внести розпорядження в таск-трекер</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 26 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">27</div>
                                    <div class="step-info">
                                        <h4>Додати співробітника</h4>
                                        <p>В таск-трекер</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Додати співробітника в таск-трекер</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 27 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">28</div>
                                    <div class="step-info">
                                        <h4>Створити 4 функції</h4>
                                        <p>В таск-трекері</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Створити 4 функції в таск-трекері</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 28 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">29</div>
                                    <div class="step-info">
                                        <h4>Регулярні завдання</h4>
                                        <p>Додати в таск-трекер</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon platform">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <span class="tool-name">TALKO Таски</span>
                                </div>
                            </td>
                            <td class="task-text">Додати кілька регулярних завдань до таск-трекера</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Журнал управлінських збоїв -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Журнал управлінських збоїв</td>
                        </tr>

                        <!-- Крок 29 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">30</div>
                                    <div class="step-info">
                                        <h4>AI: Журнал збоїв</h4>
                                        <p>Розбір системи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Журнал управлінських збоїв"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 30 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">31</div>
                                    <div class="step-info">
                                        <h4>Excel: Журнал збоїв</h4>
                                        <p>Створення таблиці</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити Excel-таблицю журналу збоїв (дати в рядках, параметри в колонках)</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 31 -->
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
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon team">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span class="tool-name">Впровадження</span>
                                </div>
                            </td>
                            <td class="task-text">Впровадити щоденне ведення журналу управлінських збоїв</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
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

                        <!-- Підфаза: Створення пропозицій -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Створення пропозицій — оффери, від яких не відмовляються</td>
                        </tr>

                        <!-- Крок 29 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">33</div>
                                    <div class="step-info">
                                        <h4>AI: Створення пропозицій</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Створення пропозицій"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 30 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">34</div>
                                    <div class="step-info">
                                        <h4>Документ: Пропозиції</h4>
                                        <p>Створення офферів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити документ з пропозиціями/офферами</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Формування заявки -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Формування заявки — правильне формулювання потреби</td>
                        </tr>

                        <!-- Крок 32 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">35</div>
                                    <div class="step-info">
                                        <h4>AI: Формування заявки</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Формування заявки"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 33 -->
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
                                    Очікує
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
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Опис функції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Опис функції — що саме робитиме людина</td>
                        </tr>

                        <!-- Крок 35 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">37</div>
                                    <div class="step-info">
                                        <h4>AI: Опис функції</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Опис функції"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 36 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">38</div>
                                    <div class="step-info">
                                        <h4>Документ: Опис функції</h4>
                                        <p>Посадові інструкції</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити документи з описом функцій/посад</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Утримання співробітників -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Утримання співробітників — як зробити, щоб не звільнялися</td>
                        </tr>

                        <!-- Крок 38 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">39</div>
                                    <div class="step-info">
                                        <h4>AI: Утримання</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Утримання співробітників"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 39 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">40</div>
                                    <div class="step-info">
                                        <h4>Документ: Утримання</h4>
                                        <p>Політика утримання</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити документ з політикою утримання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Співбесіда та випробування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Співбесіда та випробування — структурований відбір та тестування</td>
                        </tr>

                        <!-- Крок 41 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">41</div>
                                    <div class="step-info">
                                        <h4>AI: Співбесіда</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Співбесіда та випробування"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 42 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">42</div>
                                    <div class="step-info">
                                        <h4>Документ: Співбесіда</h4>
                                        <p>Чек-лист та тести</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити чек-лист співбесіди та тестові завдання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Система наставництва -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Система наставництва — підтримка нового співробітника</td>
                        </tr>

                        <!-- Крок 44 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">43</div>
                                    <div class="step-info">
                                        <h4>AI: Наставництво</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Система наставництва"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 45 -->
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
                                    Очікує
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
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Онбордінг + AI -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок: Онбордінг + AI-асистент — автоматизація введення в посаду</td>
                        </tr>

                        <!-- Крок 47 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">45</div>
                                    <div class="step-info">
                                        <h4>AI: Онбордінг</h4>
                                        <p>Розбір асистента</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI Онбордінг</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати AI-асистента "Онбордінг"</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 48 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">46</div>
                                    <div class="step-info">
                                        <h4>Документ: Онбордінг</h4>
                                        <p>Програма введення</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити документ з програмою онбордінгу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 3: ФІНАНСИ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Фаза 3: Фінанси
                                </div>
                            </td>
                        </tr>

                        <!-- Крок 50 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">47</div>
                                    <div class="step-info">
                                        <h4>Бізнес-калькулятор</h4>
                                        <p>Перевірка фін. цілі</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Перевірка реальності твоєї фінансової цілі</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 51 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">48</div>
                                    <div class="step-info">
                                        <h4>Аналіз ніші</h4>
                                        <p>Перевірка потенціалу</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Проаналізувати чи можна на цій ніші заробити заплановану суму грошей</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 52 -->
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
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">P&L, Cash Flow, Баланс — основа фінансової грамотності</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 53 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">50</div>
                                    <div class="step-info">
                                        <h4>7 департаментів</h4>
                                        <p>Контроль витрат</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Прив'язати витрати до департаментів та функцій бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 54 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">51</div>
                                    <div class="step-info">
                                        <h4>Excel: Витрати</h4>
                                        <p>Файл департаментів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити файл Excel з витратами, департаментами та функціями</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 55 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">52</div>
                                    <div class="step-info">
                                        <h4>Бенчмарки по нішах</h4>
                                        <p>Еталонні % витрат</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Еталонні % витрат для різних типів бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    15 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 56 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">53</div>
                                    <div class="step-info">
                                        <h4>Тренажер витрат</h4>
                                        <p>Заповнення таблиці</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Заповни таблицю витрат для свого бізнесу</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
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
                                    Фаза 4: Маркетинг (Реклама → Сайт → Бот → Фільтрація → Діалог → Консультація → Продаж → Аналітика)
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Основа і контроль -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основа і контроль — чітка ціль, метрики, де зливаються гроші</td>
                        </tr>

                        <!-- Крок 53 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">54</div>
                                    <div class="step-info">
                                        <h4>AI: Основа маркетингу</h4>
                                        <p>Ціль та метрики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: чітка ціль маркетингу, правильні метрики, де зливаються гроші</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 54 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">55</div>
                                    <div class="step-info">
                                        <h4>Документ: Ціль маркетингу</h4>
                                        <p>Метрики та контроль</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити документ: ціль маркетингу, ключові метрики, точки контролю</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Офер і тексти -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Офер і тексти, які продають — сильний офер, фільтрація нецільових</td>
                        </tr>

                        <!-- Крок 55 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">56</div>
                                    <div class="step-info">
                                        <h4>AI: Офер та тексти</h4>
                                        <p>Що продає</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: сильний офер під нішу, тексти що фільтрують, AI як інструмент</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 56 -->
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
                                    Очікує
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
                            <td class="task-text">Створити офер та рекламні тексти, які фільтрують нецільових</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Сайт -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Сайт, який не зливає трафік — лендінг, логіка дії, інтеграція</td>
                        </tr>

                        <!-- Крок 57 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">58</div>
                                    <div class="step-info">
                                        <h4>AI: Структура сайту</h4>
                                        <p>Лендінг що конвертує</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: простий лендінг, логіка що веде до дії, інтеграція з ботом</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 58 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">59</div>
                                    <div class="step-info">
                                        <h4>Документ: ТЗ на сайт</h4>
                                        <p>Структура лендінгу</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити ТЗ на лендінг: структура, тексти, інтеграції</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Telegram-воронка -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 4: Telegram-воронка і бот — автовідбір, кваліфікація, мінус 80% рутини</td>
                        </tr>

                        <!-- Крок 59 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">60</div>
                                    <div class="step-info">
                                        <h4>AI: Telegram-воронка</h4>
                                        <p>Бот та кваліфікація</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: автовідбір клієнтів, кваліфікаційні питання, прогрів</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 60 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">61</div>
                                    <div class="step-info">
                                        <h4>Документ: ТЗ на бот</h4>
                                        <p>Логіка воронки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити ТЗ на Telegram-бот: логіка воронки, питання, повідомлення</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Реклама -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 5: Реклама без хаосу — схема запуску, контроль бюджету, стабільні заявки</td>
                        </tr>

                        <!-- Крок 61 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">62</div>
                                    <div class="step-info">
                                        <h4>AI: Запуск реклами</h4>
                                        <p>Схема без зливів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: схема запуску реклами, контроль бюджету, відмова від зливів</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 62 -->
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
                                    Очікує
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
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Продажі в переписці -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 6: Продажі в переписці — шаблони, структура консультації, даунсел</td>
                        </tr>

                        <!-- Крок 63 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">64</div>
                                    <div class="step-info">
                                        <h4>AI: Продажі в переписці</h4>
                                        <p>Шаблони та скрипти</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: шаблони переписок, структура консультації, даунсел</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 64 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">65</div>
                                    <div class="step-info">
                                        <h4>Документ: Скрипти продажів</h4>
                                        <p>Шаблони переписок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити скрипти продажів в переписці та структуру консультації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Аналітика -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 7: Аналітика і масштабування — ключові цифри, звіти, точки росту</td>
                        </tr>

                        <!-- Крок 65 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">66</div>
                                    <div class="step-info">
                                        <h4>AI: Аналітика</h4>
                                        <p>Ключові цифри</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: ключові цифри, аналіз воронки, точки росту без збільшення бюджету</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 66 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">67</div>
                                    <div class="step-info">
                                        <h4>Excel: Звіти маркетингу</h4>
                                        <p>Шаблони аналітики</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити Excel-шаблони звітів маркетингу та аналізу воронки</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
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
                                    Фаза 5: Делегування
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Етапи делегування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Етапи делегування — розуміння процесу передачі функцій</td>
                        </tr>

                        <!-- Крок 68 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">68</div>
                                    <div class="step-info">
                                        <h4>AI: Етапи делегування</h4>
                                        <p>Послідовність кроків</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати етапи делегування: від підготовки до повної передачі функції</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 69 -->
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
                                    Очікує
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
                            <td class="task-text">Створити чек-лист етапів делегування для використання</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Опис функції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Опис функції — що робить людина на посаді</td>
                        </tr>

                        <!-- Крок 70 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">70</div>
                                    <div class="step-info">
                                        <h4>AI: Опис функції</h4>
                                        <p>Структура та зміст</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке опис функції, з чого складається, як писати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Бізнес-процес та направляюча форма -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Бізнес-процес та направляюча форма — алгоритми роботи</td>
                        </tr>

                        <!-- Крок 71 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">71</div>
                                    <div class="step-info">
                                        <h4>AI: Бізнес-процес</h4>
                                        <p>Направляюча форма</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке опис бізнес-процесу, направляюча форма, етапи з продуктами</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Інструкції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 4: Інструкції — детальні покрокові алгоритми</td>
                        </tr>

                        <!-- Крок 72 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">72</div>
                                    <div class="step-info">
                                        <h4>AI: Інструкції</h4>
                                        <p>Як писати та структурувати</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке інструкція, як правильно писати, рівень деталізації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Передача функції -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 5: Передача функції — як правильно передати роботу</td>
                        </tr>

                        <!-- Крок 73 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">73</div>
                                    <div class="step-info">
                                        <h4>AI: Передача функції</h4>
                                        <p>Алгоритм передачі</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: як правильно передавати функцію, що підготувати, як контролювати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Папки співробітника -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 6: Папка штатного співробітника vs Посадова папка</td>
                        </tr>

                        <!-- Крок 74 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">74</div>
                                    <div class="step-info">
                                        <h4>AI: Папка співробітника</h4>
                                        <p>Що містить</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: папка штатного співробітника — що містить, для чого потрібна</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 75 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">75</div>
                                    <div class="step-info">
                                        <h4>AI: Посадова папка</h4>
                                        <p>Різниця та зміст</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: посадова папка — що містить, різниця від папки співробітника</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 76 -->
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
                                    Очікує
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
                            <td class="task-text">Створити шаблони папки штатного співробітника та посадової папки</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Проведення делегування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 7: Як провести делегування — практична передача</td>
                        </tr>

                        <!-- Крок 77 -->
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
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: як провести делегування крок за кроком, що говорити</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Форма ППФ -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 8: Форма ППФ — документ передачі функції</td>
                        </tr>

                        <!-- Крок 78 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">78</div>
                                    <div class="step-info">
                                        <h4>AI: Форма ППФ</h4>
                                        <p>Протокол передачі</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: форма ППФ (протокол передачі функції), як заповнювати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 79 -->
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
                                    Очікує
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
                            <td class="task-text">Створити шаблон форми ППФ для використання при делегуванні</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Місяць координації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 9: Місяць координації — супровід нової людини на посаді</td>
                        </tr>

                        <!-- Крок 80 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">80</div>
                                    <div class="step-info">
                                        <h4>AI: Місяць координації</h4>
                                        <p>Навіщо та як</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: для чого місяць координувати нову людину, що робити, як контролювати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 81 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">81</div>
                                    <div class="step-info">
                                        <h4>Документ: План координації</h4>
                                        <p>Чек-лист на місяць</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити план координації на місяць: щоденні/тижневі точки контролю</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 6: СИСТЕМА ПЛАНУВАННЯ ТА КОМУНІКАЦІЇ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    Фаза 6: Система планування та комунікації
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Основи планування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи планування — навіщо і як планувати</td>
                        </tr>

                        <!-- Крок 82 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">82</div>
                                    <div class="step-info">
                                        <h4>AI: Основи планування</h4>
                                        <p>Принципи та підходи</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: основи планування, рівні планів, зв'язок з цілями</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Система комунікації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Система комунікації — як спілкуватися в команді</td>
                        </tr>

                        <!-- Крок 83 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">83</div>
                                    <div class="step-info">
                                        <h4>AI: Система комунікації</h4>
                                        <p>Канали та правила</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: канали комунікації, правила спілкування, ескалація проблем</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 84 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">84</div>
                                    <div class="step-info">
                                        <h4>Документ: Політика комунікації</h4>
                                        <p>Правила для команди</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити політику комунікації: канали, час відповіді, формати</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Наради та зустрічі -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Наради та зустрічі — ефективні комунікації</td>
                        </tr>

                        <!-- Крок 85 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">85</div>
                                    <div class="step-info">
                                        <h4>AI: Наради та зустрічі</h4>
                                        <p>Як проводити ефективно</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: типи нарад, структура зустрічі, протоколювання рішень</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 86 -->
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
                                    Очікує
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
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 7: СИСТЕМА КООРДИНАЦІЙ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                    Фаза 7: Система координацій
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Що таке координація -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Що таке координація — синхронізація роботи команди</td>
                        </tr>

                        <!-- Крок 87 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">87</div>
                                    <div class="step-info">
                                        <h4>AI: Основи координації</h4>
                                        <p>Навіщо та як</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що таке координація, відмінність від контролю, роль керівника</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Щоденна координація -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Щоденна координація — daily standup</td>
                        </tr>

                        <!-- Крок 88 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">88</div>
                                    <div class="step-info">
                                        <h4>AI: Щоденна координація</h4>
                                        <p>Daily standup</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: щоденна координація, формат, питання, тривалість</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    30 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Тижнева координація -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Тижнева координація — weekly review</td>
                        </tr>

                        <!-- Крок 89 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">89</div>
                                    <div class="step-info">
                                        <h4>AI: Тижнева координація</h4>
                                        <p>Weekly review</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: тижнева координація, аналіз результатів, планування тижня</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 90 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">90</div>
                                    <div class="step-info">
                                        <h4>Документ: Система координацій</h4>
                                        <p>Регламент та шаблони</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити систему координацій: щоденна, тижнева, місячна</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
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
                                    Фаза 8: Система тактичного планування
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Тактичне планування -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи тактичного планування — місяць/квартал</td>
                        </tr>

                        <!-- Крок 91 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">91</div>
                                    <div class="step-info">
                                        <h4>AI: Тактичне планування</h4>
                                        <p>Місяць та квартал</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: тактичне планування, горизонт місяць/квартал, декомпозиція цілей</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: OKR та KPI -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: OKR та KPI — метрики досягнення</td>
                        </tr>

                        <!-- Крок 92 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">92</div>
                                    <div class="step-info">
                                        <h4>AI: OKR та KPI</h4>
                                        <p>Метрики результатів</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: OKR та KPI, як ставити, як відстежувати, каскадування</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 93 -->
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
                                    Очікує
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
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 9: СТРАТЕГІЧНЕ ПЛАНУВАННЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                                    Фаза 9: Стратегічне планування
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Стратегія -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи стратегії — бачення на 1-3-5 років</td>
                        </tr>

                        <!-- Крок 94 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">94</div>
                                    <div class="step-info">
                                        <h4>AI: Основи стратегії</h4>
                                        <p>Бачення та місія</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: стратегічне планування, бачення, місія, горизонт 1-3-5 років</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Стратегічний аналіз -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: Стратегічний аналіз — SWOT, конкуренти, ринок</td>
                        </tr>

                        <!-- Крок 95 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">95</div>
                                    <div class="step-info">
                                        <h4>AI: Стратегічний аналіз</h4>
                                        <p>SWOT та ринок</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: SWOT-аналіз, аналіз конкурентів, позиціонування</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 96 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">96</div>
                                    <div class="step-info">
                                        <h4>Документ: Стратегічний план</h4>
                                        <p>План на 1-3 роки</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити стратегічний план: бачення, цілі, ключові ініціативи</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    90 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- ========================================== -->
                        <!-- ФАЗА 10: АВТОМАТИЗАЦІЯ -->
                        <!-- ========================================== -->
                        <tr class="phase-row">
                            <td colspan="7">
                                <div class="phase-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    Фаза 10: Автоматизація
                                </div>
                            </td>
                        </tr>

                        <!-- Підфаза: Основи автоматизації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 1: Основи автоматизації — що і навіщо автоматизувати</td>
                        </tr>

                        <!-- Крок 97 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">97</div>
                                    <div class="step-info">
                                        <h4>AI: Основи автоматизації</h4>
                                        <p>Що автоматизувати</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: що варто автоматизувати, пріоритети, ROI автоматизації</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: AI в бізнесі -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 2: AI в бізнесі — практичне застосування</td>
                        </tr>

                        <!-- Крок 98 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">98</div>
                                    <div class="step-info">
                                        <h4>AI: AI в бізнесі</h4>
                                        <p>Практичні кейси</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: AI для бізнесу, чат-боти, асистенти, генерація контенту</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Підфаза: Інтеграції та автоматизації -->
                        <tr class="subphase-row">
                            <td colspan="7">Блок 3: Інтеграції — з'єднання систем</td>
                        </tr>

                        <!-- Крок 99 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">99</div>
                                    <div class="step-info">
                                        <h4>AI: Інтеграції</h4>
                                        <p>З'єднання систем</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
                                </span>
                            </td>
                            <td>
                                <div class="tool-cell">
                                    <div class="tool-icon ai">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                                    </div>
                                    <span class="tool-name">AI-асистент</span>
                                </div>
                            </td>
                            <td class="task-text">Розібрати: інтеграції між системами, Zapier, Make, API</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    45 хв
                                </div>
                            </td>
                            <td class="comment-cell empty">—</td>
                        </tr>

                        <!-- Крок 100 -->
                        <tr>
                            <td>
                                <div class="step-cell">
                                    <div class="step-number">100</div>
                                    <div class="step-info">
                                        <h4>Документ: План автоматизації</h4>
                                        <p>Roadmap впровадження</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-waiting">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Очікує
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
                            <td class="task-text">Створити план автоматизації: пріоритети, інструменти, терміни</td>
                            <td class="date-cell">
                                <input type="date" class="date-input">
                            </td>
                            <td>
                                <div class="time-cell">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    60 хв
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
            const msg = t('learningClearConfirm');
            if (!confirm(msg)) return;
        }

        // БАГ 2: disable кнопки + feedback
        const btn = document.querySelector('.l-btn-save-hw');
        if (btn) {
            btn.disabled = true;
            const origText = btn.innerHTML;
            btn.innerHTML = t('learningSaved');
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = origText;
            }, 2000);
        }

        if (!learningProgress[moduleId]) learningProgress[moduleId] = {};
        learningProgress[moduleId].homeworkText = ta.value;
        learningProgress[moduleId].homeworkDone = newHomeworkDone;
        saveLearningProgress();
        setTimeout(() => window._openLearningModule(moduleId), 2100);
    };

    // ── Init (called when tab opens) ──────────────────────────
    window.initLearning = function() {
        loadLearningProgress();
    };

    // ── Re-render on tab switch ───────────────────────────────
    window.renderLearning = renderLearning;

    // ── AI Assistant block ───────────────────────────────────
        window.learningCourseData = learningCourseData;

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

        const title = getLangField(module, 'title', lang);
        const subtitle = getLangField(module, 'subtitle', lang);
        const content = getLangField(module, 'lessonContent', lang);
        const isCompleted = module.completed;
        const hwText = (learningProgress[moduleId] || {}).homeworkText || '';
        const hwDone = (learningProgress[moduleId] || {}).homeworkDone || false;

        const root = document.getElementById('learningTab');
        root.innerHTML = `
        <div class="learning-wrap">
            <div class="learning-module-nav">
                <button class="l-back-btn" onclick="window._closeLearningModule()">
                    <i data-lucide="arrow-left" class="icon" style="width:18px;height:18px;"></i>
                    ${t('learningBack')}
                </button>

            </div>

            <div class="l-module-detail">
                <div class="l-detail-header">
                    <div class="l-detail-num">${moduleId}</div>
                    <div>
                        <div class="l-detail-title">${title}</div>
                        ${subtitle ? `<div class="l-detail-subtitle">${subtitle}</div>` : ''}
                        ${module.time ? `<div class="l-module-time" style="margin-top:4px;"><i data-lucide="clock" class="icon" style="width:12px;height:12px;"></i> ${module.time} ${t('learningMin')}</div>` : ''}
                    </div>
                </div>

                ${module.videoLink ? `
                <div class="l-links-row">
                    <a href="${module.videoLink}" target="_blank" class="l-link-btn video">
                        <i data-lucide="play-circle" class="icon" style="width:16px;height:16px;"></i>
                        ${t('learningVideo')}
                    </a>
                    ${module.materialsLink ? `<a href="${module.materialsLink}" target="_blank" class="l-link-btn materials">
                        <i data-lucide="file-text" class="icon" style="width:16px;height:16px;"></i>
                        ${t('learningMaterials')}
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
                        ${t('learningHomework')}
                    </div>
                    ${liItems2.length
                        ? `<ol style="margin:0.5rem 0 0.75rem 1.2rem;padding:0;color:#374151;font-size:0.9rem;line-height:1.7;">${liItems2.map(item => `<li>${item}</li>`).join('')}</ol>`
                        : `<div class="l-homework-desc">${hwHtml}</div>`
                    }
                    ${hwLinkUrl ? `<a href="${hwLinkUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:10px;font-size:0.875rem;color:#16a34a;text-decoration:none;font-weight:600;margin-bottom:0.75rem;">${hwLinkName || '→ AI-асистент'}</a>` : ''}
                    <textarea class="l-homework-textarea" id="learningHwTextarea" placeholder="${t('learningHwPlaceholder')}">${hwText}</textarea>
                    <div class="l-homework-actions">
                        ${hwDone ? `<span class="l-hw-done-badge"><i data-lucide="check" class="icon" style="width:14px;height:14px;"></i> ${t('learningDone')}</span>` : ''}
                        <button class="l-btn-save-hw" onclick="window._saveLearningHomework(${moduleId})">
                            ${t('learningSave')}
                        </button>
                    </div>
                </div>`;
                })() : ''}

                <!-- Complete button -->
                <div class="l-complete-row">
                    ${isCompleted
                        ? `<button class="l-btn-completed" onclick="window._toggleLearningComplete(${moduleId}, false)">
                            <i data-lucide="check-circle" class="icon" style="width:18px;height:18px;"></i>
                            ${t('learningCompleted')}
                           </button>`
                        : `<button class="l-btn-complete" onclick="window._toggleLearningComplete(${moduleId}, true)">
                            ${t('learningMarkDone')}
                           </button>`
                    }
                </div>
            </div>
        </div>`;

        if (window.refreshIcons) window.refreshIcons();
    };

    // ── Back ──────────────────────────────────────────────────
    window._closeLearningModule = function() {
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
