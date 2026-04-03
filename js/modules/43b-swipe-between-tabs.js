// =====================
        // SWIPE BETWEEN TABS
        // =====================
'use strict';
        const mobileTabs = ['tasks', 'projects', 'control', 'regular', 'users'];
        let tabSwipeStartX = 0;
        let tabSwipeStartY = 0;
        let tabSwipeStartTime = 0;
        let tabSwipeOriginCard = false; // БАГ M10 fix: чи почався свайп на task card
        let isTabSwiping = false;

        function initTabSwipeGestures() {
            const mainInterface = document.getElementById('mainInterface');
            if (!mainInterface || mainInterface.dataset.tabSwipeInit) return;
            mainInterface.dataset.tabSwipeInit = 'true';

            mainInterface.addEventListener('touchstart', (e) => {
                // БАГ M10 fix: запам'ятовуємо чи почався на task card
                tabSwipeOriginCard = !!(
                    e.target.closest('.mobile-task-card') ||
                    e.target.closest('.modal') ||
                    e.target.closest('.filter-chips') ||
                    e.target.closest('input') ||
                    e.target.closest('select') ||
                    e.target.closest('button') ||
                    e.target.closest('.kanban-board') ||
                    e.target.closest('.myday-item')
                );

                if (tabSwipeOriginCard) return;

                tabSwipeStartX = e.touches[0].clientX;
                tabSwipeStartY = e.touches[0].clientY;
                tabSwipeStartTime = Date.now();
                isTabSwiping = true;
            }, { passive: true });

            mainInterface.addEventListener('touchmove', (e) => {
                if (!isTabSwiping || tabSwipeOriginCard) return;

                const diffX = e.touches[0].clientX - tabSwipeStartX;
                const diffY = e.touches[0].clientY - tabSwipeStartY;

                if (Math.abs(diffY) > Math.abs(diffX) * 0.7) {
                    isTabSwiping = false;
                }
            }, { passive: true });

            mainInterface.addEventListener('touchend', (e) => {
                // БАГ M10 fix: якщо почався на task card — ігноруємо повністю
                if (tabSwipeOriginCard) {
                    tabSwipeOriginCard = false;
                    isTabSwiping = false;
                    return;
                }
                if (!isTabSwiping) return;
                isTabSwiping = false;

                const diffX = e.changedTouches[0].clientX - tabSwipeStartX;
                const diffY = e.changedTouches[0].clientY - tabSwipeStartY;
                const elapsed = Date.now() - tabSwipeStartTime;

                // БАГ M12 fix: більший threshold 200px + velocity check
                const threshold = 200;
                const velocity = Math.abs(diffX) / elapsed; // px/ms

                if (Math.abs(diffY) > 40) return;
                // Мінімальна відстань 200px АБО швидкість >0.6px/ms при мінімум 100px
                const isValidSwipe = Math.abs(diffX) > threshold ||
                    (velocity > 0.6 && Math.abs(diffX) > 100);
                if (!isValidSwipe) return;

                const activeTab = document.querySelector('.tab-content.active');
                if (!activeTab) return;

                const currentTabId = activeTab.id.replace('Tab', '');
                const currentIndex = mobileTabs.indexOf(currentTabId);
                if (currentIndex === -1) return;

                if (diffX > 0 && currentIndex > 0) {
                    switchTab(mobileTabs[currentIndex - 1]);
                    showTabSwipeIndicator('←');
                }
                if (diffX < 0 && currentIndex < mobileTabs.length - 1) {
                    switchTab(mobileTabs[currentIndex + 1]);
                    showTabSwipeIndicator('→');
                }
            });
        }

        function showTabSwipeIndicator(direction) {
            const indicator = document.createElement('div');
            indicator.className = 'tab-swipe-indicator';
            indicator.textContent = direction;
            document.body.appendChild(indicator);
            setTimeout(() => indicator.remove(), 300);
        }

        document.addEventListener('DOMContentLoaded', initTabSwipeGestures);
