// ============================================================
// js/modules/77f-crm-mobile.js — CRM мобільна картка угоди
//
// Fix: замість monkey-patch при старті — використовуємо
// window.crmOpenDealHooks[] — масив callback-ів які 77-crm.js
// викликає після кожного відкриття угоди.
// Це усуває race condition з defer-скриптами.
// ============================================================

(function () {

    // ── Hook system замість monkey-patch ───────────────────
    // 77-crm.js викликає window.crmOnDealOpened(dealId) якщо вона є.
    // Ми реєструємо свій callback через масив.
    if (!window.crmOpenDealHooks) window.crmOpenDealHooks = [];
    window.crmOpenDealHooks.push(function (dealId) {
        requestAnimationFrame(function () {
            _attachSwipe(dealId);
            _injectNavArrows(dealId);
        });
    });

    // ── Список угод для навігації ───────────────────────────
    function _getNavDeals(currentDeal) {
        const deals    = window.crm?.deals || [];
        const filtered = typeof window._filteredDealsForNav === 'function'
            ? window._filteredDealsForNav()
            : deals;
        const stageDeals = filtered.filter(function (d) { return d.stage === currentDeal.stage; });
        return stageDeals.length > 1 ? stageDeals : filtered;
    }

    // ── Стрілки навігації ───────────────────────────────────
    function _injectNavArrows(dealId) {
        const deal = (window.crm?.deals || []).find(function (d) { return d.id === dealId; });
        if (!deal) return;

        const navDeals = _getNavDeals(deal);
        const idx      = navDeals.findIndex(function (d) { return d.id === dealId; });
        if (navDeals.length < 2) return;

        const overlay = document.getElementById('crmDealOverlay');
        if (!overlay) return;

        overlay.querySelectorAll('.crm-nav-arrow').forEach(function (el) { el.remove(); });

        const panel = overlay.firstElementChild;
        if (!panel) return;
        panel.style.position = 'relative';

        const nav = document.createElement('div');
        nav.className = 'crm-nav-arrow';
        nav.style.cssText = [
            'display:flex;align-items:center;gap:0.3rem;',
            'position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);',
            'background:white;border:1px solid #e8eaed;border-radius:20px;',
            'padding:4px 10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);z-index:1;'
        ].join('');

        const prevDisabled = idx === 0 ? 'opacity:0.3;pointer-events:none;' : '';
        const nextDisabled = idx === navDeals.length - 1 ? 'opacity:0.3;pointer-events:none;' : '';

        nav.innerHTML =
            '<button onclick="_crmNavDeal(-1,\'' + dealId + '\')" style="background:none;border:none;cursor:pointer;color:#374151;font-size:1rem;padding:2px 4px;line-height:1;' + prevDisabled + '">&#8249;</button>' +
            '<span style="font-size:0.72rem;color:#6b7280;font-weight:600;min-width:32px;text-align:center;">' + (idx + 1) + ' / ' + navDeals.length + '</span>' +
            '<button onclick="_crmNavDeal(1,\'' + dealId + '\')" style="background:none;border:none;cursor:pointer;color:#374151;font-size:1rem;padding:2px 4px;line-height:1;' + nextDisabled + '">&#8250;</button>';

        panel.appendChild(nav);
    }

    // ── Навігація між угодами ───────────────────────────────
    window._crmNavDeal = function (dir, currentId) {
        const deal = (window.crm?.deals || []).find(function (d) { return d.id === currentId; });
        if (!deal) return;
        const navDeals = _getNavDeals(deal);
        const idx      = navDeals.findIndex(function (d) { return d.id === currentId; });
        const nextIdx  = idx + dir;
        if (nextIdx < 0 || nextIdx >= navDeals.length) return;

        const overlay = document.getElementById('crmDealOverlay');
        const panel   = overlay && overlay.firstElementChild;
        if (panel) {
            panel.style.transition = 'transform 0.18s ease,opacity 0.18s ease';
            panel.style.transform  = 'translateX(' + (dir > 0 ? '-40px' : '40px') + ')';
            panel.style.opacity    = '0';
            setTimeout(function () {
                panel.style.transition = '';
                panel.style.transform  = '';
                panel.style.opacity    = '';
                if (typeof window.crmOpenDeal === 'function') window.crmOpenDeal(navDeals[nextIdx].id);
            }, 180);
        } else {
            if (typeof window.crmOpenDeal === 'function') window.crmOpenDeal(navDeals[nextIdx].id);
        }
    };

    // ── Touch swipe ─────────────────────────────────────────
    function _attachSwipe(dealId) {
        const overlay = document.getElementById('crmDealOverlay');
        const panel   = overlay && overlay.firstElementChild;
        if (!panel) return;

        // Якщо вже вішали — знімаємо старі
        if (panel._crmSwipeAttached) return;
        panel._crmSwipeAttached = true;

        var startX = 0, startY = 0, isDragging = false, lockedAxis = null;
        var SWIPE_H = 80, SWIPE_V = 120, AXIS_LOCK = 20;

        panel.addEventListener('touchstart', function (e) {
            var t = e.touches[0];
            startX = t.clientX; startY = t.clientY;
            isDragging = true; lockedAxis = null;
            panel.style.transition = '';
        }, { passive: true });

        panel.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            var t = e.touches[0];
            var dx = t.clientX - startX, dy = t.clientY - startY;
            if (!lockedAxis && (Math.abs(dx) > AXIS_LOCK || Math.abs(dy) > AXIS_LOCK)) {
                lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            }
            if (lockedAxis === 'x') {
                panel.style.transform = 'translateX(' + (dx * 0.4) + 'px)';
                panel.style.opacity   = String(1 - Math.abs(dx) / 400);
            } else if (lockedAxis === 'y' && dy > 0) {
                panel.style.transform = 'translateY(' + (dy * 0.5) + 'px)';
                panel.style.opacity   = String(1 - dy / 400);
            }
        }, { passive: true });

        panel.addEventListener('touchend', function (e) {
            if (!isDragging) return;
            isDragging = false;
            var t  = e.changedTouches[0];
            var dx = t.clientX - startX, dy = t.clientY - startY;
            panel.style.transition = 'transform 0.2s ease,opacity 0.2s ease';

            if (lockedAxis === 'x' && Math.abs(dx) > SWIPE_H) {
                var dir = dx < 0 ? 1 : -1;
                panel.style.transform = 'translateX(' + (dx < 0 ? '-100%' : '100%') + ')';
                panel.style.opacity   = '0';
                setTimeout(function () {
                    panel.style.transition = '';
                    panel.style.transform  = '';
                    panel.style.opacity    = '';
                    window._crmNavDeal(dir, dealId);
                }, 200);
            } else if (lockedAxis === 'y' && dy > SWIPE_V) {
                panel.style.transform = 'translateY(100%)';
                panel.style.opacity   = '0';
                setTimeout(function () { if (typeof window.crmCloseDeal === 'function') window.crmCloseDeal(); }, 200);
            } else {
                panel.style.transform = '';
                panel.style.opacity   = '1';
                setTimeout(function () { panel.style.transition = ''; }, 200);
            }
        }, { passive: true });
    }

    // ── Keyboard навігація ──────────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (!document.getElementById('crmDealOverlay')) return;
        var tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (e.key === 'ArrowLeft')  { e.preventDefault(); window._crmNavDeal(-1, window.crm && window.crm.activeDealId); }
        if (e.key === 'ArrowRight') { e.preventDefault(); window._crmNavDeal(1,  window.crm && window.crm.activeDealId); }
        if (e.key === 'Escape')     { if (typeof window.crmCloseDeal === 'function') window.crmCloseDeal(); }
    });

    window._crmMobileGetNavDeals = _getNavDeals;

})();
