// ============================================================
// js/modules/77f-crm-mobile.js — CRM мобільна картка угоди
//
// Функціонал:
//   - Swipe left/right між угодами (тієї ж стадії)
//   - Swipe down → закрити картку
//   - Навігаційні стрілки ← / → в хедері
//   - Лічильник позиції (2 / 8)
//   - Pull indicator для swipe down
// ============================================================

(function () {
    // Чи мобайл?
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Список угод для навігації (поточна стадія або всі filtered)
    function _getNavDeals(currentDeal) {
        const deals = window.crm?.deals || [];
        const filtered = typeof window._filteredDealsForNav === 'function'
            ? window._filteredDealsForNav()
            : deals;
        // Угоди тієї ж стадії, відсортовані як у kanban
        const stageDeals = filtered.filter(d => d.stage === currentDeal.stage);
        return stageDeals.length > 1 ? stageDeals : filtered;
    }

    // Патчимо crmOpenDeal — після відкриття вішаємо swipe listeners
    const _origOpenDeal = window.crmOpenDeal;
    window.crmOpenDeal = function (dealId) {
        _origOpenDeal(dealId);
        // Невелика затримка щоб DOM відрендерився
        requestAnimationFrame(() => {
            _attachSwipe(dealId);
            _injectNavArrows(dealId);
        });
    };

    // ── Стрілки навігації в хедері ─────────────────────────
    function _injectNavArrows(dealId) {
        const deal = window.crm?.deals?.find(d => d.id === dealId);
        if (!deal) return;

        const navDeals = _getNavDeals(deal);
        const idx      = navDeals.findIndex(d => d.id === dealId);
        if (navDeals.length < 2) return; // нема куди навігувати

        // Знаходимо хедер панелі
        const overlay = document.getElementById('crmDealOverlay');
        if (!overlay) return;
        const header = overlay.querySelector('[style*="border-bottom:1px solid #f1f5f9"]');
        if (!header) return;

        // Видаляємо попередні стрілки якщо є
        overlay.querySelectorAll('.crm-nav-arrow').forEach(el => el.remove());

        // Вставляємо лічильник і стрілки
        const nav = document.createElement('div');
        nav.className = 'crm-nav-arrow';
        nav.style.cssText = `
            display:flex;align-items:center;gap:0.3rem;
            position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);
            background:white;border:1px solid #e8eaed;border-radius:20px;
            padding:4px 10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);z-index:1;`;
        nav.innerHTML = `
            <button onclick="_crmNavDeal(-1,'${dealId}')"
                style="background:none;border:none;cursor:pointer;color:#374151;
                font-size:1rem;padding:2px 4px;line-height:1;${idx === 0 ? 'opacity:0.3;pointer-events:none;' : ''}">
                ‹
            </button>
            <span style="font-size:0.72rem;color:#6b7280;font-weight:600;min-width:32px;text-align:center;">
                ${idx + 1} / ${navDeals.length}
            </span>
            <button onclick="_crmNavDeal(1,'${dealId}')"
                style="background:none;border:none;cursor:pointer;color:#374151;
                font-size:1rem;padding:2px 4px;line-height:1;${idx === navDeals.length - 1 ? 'opacity:0.3;pointer-events:none;' : ''}">
                ›
            </button>`;

        // Позиціонуємо відносно панелі
        const panel = overlay.firstElementChild;
        if (panel) {
            panel.style.position = 'relative';
            panel.appendChild(nav);
        }
    }

    // Навігація між угодами
    window._crmNavDeal = function (dir, currentId) {
        const deal = window.crm?.deals?.find(d => d.id === currentId);
        if (!deal) return;
        const navDeals = _getNavDeals(deal);
        const idx = navDeals.findIndex(d => d.id === currentId);
        const nextIdx = idx + dir;
        if (nextIdx < 0 || nextIdx >= navDeals.length) return;

        // Анімація слайду
        const overlay = document.getElementById('crmDealOverlay');
        const panel = overlay?.firstElementChild;
        if (panel) {
            panel.style.transition = 'transform 0.18s ease, opacity 0.18s ease';
            panel.style.transform = `translateX(${dir > 0 ? '-40px' : '40px'})`;
            panel.style.opacity = '0';
            setTimeout(() => {
                panel.style.transition = '';
                panel.style.transform = '';
                panel.style.opacity = '';
                window.crmOpenDeal(navDeals[nextIdx].id);
            }, 180);
        } else {
            window.crmOpenDeal(navDeals[nextIdx].id);
        }
    };

    // ── Touch swipe listeners ───────────────────────────────
    function _attachSwipe(dealId) {
        const overlay = document.getElementById('crmDealOverlay');
        const panel   = overlay?.firstElementChild;
        if (!panel) return;

        let startX = 0, startY = 0, isDragging = false;
        const SWIPE_THRESHOLD  = 80;  // px горизонталь
        const CLOSE_THRESHOLD  = 120; // px вертикаль вниз
        const AXIS_LOCK        = 20;  // px до блокування осі

        let lockedAxis = null; // 'x' | 'y' | null

        panel.addEventListener('touchstart', e => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            isDragging = true;
            lockedAxis = null;
            panel.style.transition = '';
        }, { passive: true });

        panel.addEventListener('touchmove', e => {
            if (!isDragging) return;
            const t = e.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;

            // Визначаємо вісь при першому русі
            if (!lockedAxis && (Math.abs(dx) > AXIS_LOCK || Math.abs(dy) > AXIS_LOCK)) {
                lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            }

            if (lockedAxis === 'x') {
                // Горизонтальний свайп — показуємо зміщення
                panel.style.transform = `translateX(${dx * 0.4}px)`;
                panel.style.opacity   = String(1 - Math.abs(dx) / 400);
            } else if (lockedAxis === 'y' && dy > 0) {
                // Вертикальний свайп вниз — pull to close
                panel.style.transform = `translateY(${dy * 0.5}px)`;
                panel.style.opacity   = String(1 - dy / 400);
            }
        }, { passive: true });

        panel.addEventListener('touchend', e => {
            if (!isDragging) return;
            isDragging = false;

            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;

            panel.style.transition = 'transform 0.2s ease, opacity 0.2s ease';

            if (lockedAxis === 'x' && Math.abs(dx) > SWIPE_THRESHOLD) {
                // Свайп до наступної/попередньої угоди
                const dir = dx < 0 ? 1 : -1;
                panel.style.transform = `translateX(${dx < 0 ? '-100%' : '100%'})`;
                panel.style.opacity = '0';
                setTimeout(() => {
                    panel.style.transition = '';
                    panel.style.transform = '';
                    panel.style.opacity = '';
                    window._crmNavDeal(dir, dealId);
                }, 200);
            } else if (lockedAxis === 'y' && dy > CLOSE_THRESHOLD) {
                // Swipe down — закрити
                panel.style.transform = 'translateY(100%)';
                panel.style.opacity = '0';
                setTimeout(() => window.crmCloseDeal?.(), 200);
            } else {
                // Відновити позицію
                panel.style.transform = '';
                panel.style.opacity = '1';
                setTimeout(() => { panel.style.transition = ''; }, 200);
            }
        }, { passive: true });
    }

    // ── Keyboard навігація (desktop) ───────────────────────
    document.addEventListener('keydown', e => {
        const overlay = document.getElementById('crmDealOverlay');
        if (!overlay) return;
        // Не перехоплюємо якщо фокус в інпуті
        if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;

        if (e.key === 'ArrowLeft')  { e.preventDefault(); window._crmNavDeal(-1, window.crm?.activeDealId); }
        if (e.key === 'ArrowRight') { e.preventDefault(); window._crmNavDeal(1,  window.crm?.activeDealId); }
        if (e.key === 'Escape')     { window.crmCloseDeal?.(); }
    });

    // ── Expose для тестування ───────────────────────────────
    window._crmMobileGetNavDeals = _getNavDeals;

})();
