// =====================
        // SWIPE TO COMPLETE (Event Delegation)
        // =====================
'use strict';
        let swipeState = {
            startX: 0,
            startY: 0,
            currentX: 0,
            isDragging: false,
            isHorizontal: null, // null=невизначено, true=горизонт, false=верт
            activeCard: null
        };

        function initSwipeHandlers() {
            const container = document.getElementById('mobileTasksList');
            if (!container || container.dataset.swipeInit) return;
            container.dataset.swipeInit = 'true';

            container.addEventListener('touchstart', (e) => {
                const card = e.target.closest('.mobile-task-card');
                if (!card) return;
                swipeState.startX = e.touches[0].clientX;
                swipeState.startY = e.touches[0].clientY;
                swipeState.isDragging = true;
                swipeState.activeCard = card;
                swipeState.currentX = 0;
                swipeState.isHorizontal = null; // скидаємо напрям
                card.classList.add('swiping');
            }, { passive: true });

            // БАГ M8 fix: реєструємо з passive:false щоб можна було preventDefault при горизонтальному свайпі
            container.addEventListener('touchmove', (e) => {
                if (!swipeState.isDragging || !swipeState.activeCard) return;

                const card = swipeState.activeCard;
                const content = card.querySelector('.mobile-task-content');
                const leftBg = card.querySelector('.swipe-action-bg.left');
                const rightBg = card.querySelector('.swipe-action-bg.right');
                const canComplete = card.dataset.canComplete === 'true';
                if (!content) return;

                const dx = e.touches[0].clientX - swipeState.startX;
                const dy = e.touches[0].clientY - swipeState.startY;

                // Визначаємо напрям руху після перших 8px
                if (swipeState.isHorizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                    swipeState.isHorizontal = Math.abs(dx) > Math.abs(dy);
                }

                // Якщо вертикальний — не перехоплюємо
                if (swipeState.isHorizontal === false) return;

                // Якщо горизонтальний — блокуємо вертикальний scroll
                if (swipeState.isHorizontal === true) {
                    e.preventDefault();
                }

                swipeState.currentX = Math.max(-120, Math.min(120, dx));
                content.style.transform = `translateX(${swipeState.currentX}px)`;

                if (swipeState.currentX > 30 && canComplete) {
                    leftBg?.classList.add('visible');
                    rightBg?.classList.remove('visible');
                } else if (swipeState.currentX < -30) {
                    rightBg?.classList.add('visible');
                    leftBg?.classList.remove('visible');
                } else {
                    leftBg?.classList.remove('visible');
                    rightBg?.classList.remove('visible');
                }
            }, { passive: false }); // БАГ M8 fix: passive:false дозволяє preventDefault

            container.addEventListener('touchend', () => {
                if (!swipeState.isDragging || !swipeState.activeCard) return;

                const card = swipeState.activeCard;
                const content = card.querySelector('.mobile-task-content');
                const leftBg = card.querySelector('.swipe-action-bg.left');
                const rightBg = card.querySelector('.swipe-action-bg.right');
                const canComplete = card.dataset.canComplete === 'true';
                const taskId = card.dataset.taskId;
                const didSwipe = Math.abs(swipeState.currentX) > 10;

                swipeState.isDragging = false;
                card.classList.remove('swiping');

                const threshold = 80;

                // Виконати задачу (свайп вправо)
                if (swipeState.currentX > threshold && canComplete) {
                    content.style.transform = 'translateX(100%)';
                    content.style.opacity = '0';
                    setTimeout(() => { quickCompleteTask(taskId); }, 200);
                    swipeState.activeCard = null;
                    return;
                }

                // БАГ M7 fix: видалення з undo замість миттєвого deleteTask
                if (swipeState.currentX < -(threshold + 30)) {
                    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

                    const task = (typeof tasks !== 'undefined') ? tasks.find(t => t.id === taskId) : null;
                    const taskName = task?.title || window.t('task') || 'Задача';
                    const taskCopy = task ? JSON.parse(JSON.stringify(task)) : null;

                    // Анімуємо видалення
                    content.style.transform = 'translateX(-100%)';
                    content.style.opacity = '0';
                    content.style.transition = 'transform 0.25s ease, opacity 0.25s ease';

                    // Показуємо undo toast — фактичне видалення відкладено
                    if (typeof showUndoToast === 'function' && taskCopy) {
                        // Анімуємо скорочення картки
                        card.style.maxHeight = card.offsetHeight + 'px';
                        card.style.overflow = 'hidden';
                        card.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
                        requestAnimationFrame(() => {
                            card.style.maxHeight = '0';
                            card.style.opacity = '0';
                        });

                        setTimeout(() => {
                            // showUndoToast показує toast і чекає — якщо юзер натиснув Undo, відновлюємо
                            showUndoToast(taskName, taskCopy, 'task');
                        }, 300);
                    } else {
                        // Fallback — пряме видалення
                        setTimeout(() => { deleteTask(taskId); }, 250);
                    }

                    swipeState.activeCard = null;
                    return;
                }

                // Скидаємо позицію
                if (content) {
                    content.style.transition = 'transform 0.2s ease';
                    content.style.transform = '';
                    setTimeout(() => { content.style.transition = ''; }, 200);
                }
                leftBg?.classList.remove('visible');
                rightBg?.classList.remove('visible');

                // Блокуємо click після свайпу
                if (didSwipe && content) {
                    content.style.pointerEvents = 'none';
                    setTimeout(() => { content.style.pointerEvents = ''; }, 50);
                }

                swipeState.currentX = 0;
                swipeState.isHorizontal = null;
                swipeState.activeCard = null;
            });
        }
