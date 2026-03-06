// =====================

        // DEBUG flag — встановити true в DevTools: window.DEBUG = true
        window.DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const dbg = (...args) => window.DEBUG && console.log('[TALKO]', ...args);
        window.dbg = dbg;
        // APP STATE
        // =====================
        const SUPERADMIN_EMAIL = 'management.talco@gmail.com';
        let currentUser = null;
        let currentCompany = null;
        let currentUserData = null;
        let isSuperAdmin = false;
        let tasks = [];
        let users = [];
        let functions = [];
        let regularTasks = [];
        let projects = [];
        let editingId = null;
        
        // Race condition protection
        let isLoading = false;
        let isSaving = false;
        let loadingVersion = 0; // Tracks which load operation is current
        
        // Debounce utility
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Debounced render functions for performance
        const debouncedRenderMyDay = debounce(() => renderMyDay(), 100);
        const debouncedRenderTasks = debounce(() => renderTasks(), 100);
        const debouncedRenderCalendar = debounce(() => renderCalendar(), 100);
        
        // ═══ COALESCED RENDER — batches all render calls into single RAF ═══
        let _coalescePending = false;
        let _coalesceMyDay = false;
        let _coalesceView = false;
        
        function scheduleRender(myDay = true, view = true) {
            if (myDay) _coalesceMyDay = true;
            if (view) _coalesceView = true;
            if (_coalescePending) return;
            _coalescePending = true;
            requestAnimationFrame(() => {
                _coalescePending = false;
                if (_coalesceMyDay) { _coalesceMyDay = false; renderMyDay(); }
                if (_coalesceView) { _coalesceView = false; refreshCurrentView(); }
                updateOverdueBadges();
            });
        }
