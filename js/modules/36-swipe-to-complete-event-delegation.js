// =====================
        // SWIPE TO COMPLETE (Event Delegation)
        // =====================
'use strict';
        let swipeState = {
            startX: 0,
            startY: 0,
            currentX: 0,
            isDragging: false,
            isHorizontal: null,
            activeCard: null,
            startTime: 0,
        };

        function initSwipeHandlers() {
            const container = document.getElementById('mobileTasksList');
            if (!container || container.dataset.swipeInit) return;
            container.dataset.swipeInit = 'true';

            container.addEventListener('touchstart', (e) => {
                const card = e.target.closest('.mobile-task-card');
                if (!card) return;
                swipeState.startX    = e.touches[0].clientX;
                swipeState.startY    = e.touches[0].clientY;
                swipeState.startTime = Date.now();
                swipeState.isDragging   = true;
                swipeState.activeCard   = card;
                swipeState.currentX     = 0;
                swipeState.isHorizontal = null;
                card.classList.add('swiping');
            }, { passive: true });

            // passive:true — НЕ блокуємо scroll за замовчуванням
            // Горизонтальний свайп обробляємо через transform без preventDefault
            // Це дозволяє вертикальний scroll працювати завжди
            container.addEventListener('touchmove', (e) => {
                if (!swipeState.isDragging || !swipeState.activeCard) return;

                const dx = e.touches[0].clientX - swipeState.startX;
                const dy = e.touches[0].clientY - swipeState.startY;
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);

                // Визначаємо напрям тільки після впевненого руху 12px
                if (swipeState.isHorizontal === null) {
                    if (absDx < 12 && absDy < 12) return; // ще не рухається
                    // Для горизонтального потрібно явна перевага: dx > dy * 2
                    swipeState.isHorizontal = absDx > absDy * 2;
                }

                // Вертикальний — повністю ігноруємо, дозволяємо scroll
                if (!swipeState.isHorizontal) {
                    // Скидаємо активну картку щоб не перехоплювати далі
                    const card = swipeState.activeCard;
                    if (card) card.classList.remove('swiping');
                    swipeState.activeCard = null;
                    swipeState.isDragging = false;
                    return;
                }

                // Горизонтальний — показуємо swipe preview
                const card    = swipeState.activeCard;
                const content = card.querySelector('.mobile-task-content');
                const leftBg  = card.querySelector('.swipe-action-bg.left');
                const rightBg = card.querySelector('.swipe-action-bg.right');
                const canComplete = card.dataset.canComplete === 'true';
                if (!content) return;

                swipeState.currentX = Math.max(-130, Math.min(130, dx));
                content.style.transform = `translateX(${swipeState.currentX}px)`;

                // Показуємо фон тільки після впевненого свайпу 40px
                if (swipeState.currentX > 40 && canComplete) {
                    leftBg?.classList.add('visible');
                    rightBg?.classList.remove('visible');
                } else if (swipeState.currentX < -40) {
                    rightBg?.classList.add('visible');
                    leftBg?.classList.remove('visible');
                } else {
                    leftBg?.classList.remove('visible');
                    rightBg?.classList.remove('visible');
                }
            }, { passive: true }); // passive:true — scroll завжди вільний

            container.addEventListener('touchend', () => {
                if (!swipeState.isDragging || !swipeState.activeCard) return;

                const card    = swipeState.activeCard;
                const content = card.querySelector('.mobile-task-content');
                const leftBg  = card.querySelector('.swipe-action-bg.left');
                const rightBg = card.querySelector('.swipe-action-bg.right');
                const canComplete = card.dataset.canComplete === 'true';
                const taskId = card.dataset.taskId;
                const didSwipe = Math.abs(swipeState.currentX) > 15;

                swipeState.isDragging = false;
                card.classList.remove('swiping');

                // Поріг дії — 100px (підвищений з 80 для захисту від випадкових)
                const ACTION_THRESHOLD = 100;

                // Виконати задачу — свайп вправо
                if (swipeState.currentX > ACTION_THRESHOLD && canComplete) {
                    if (content) { content.style.transform = 'translateX(110%)'; content.style.opacity = '0'; }
                    setTimeout(() => { quickCompleteTask(taskId); }, 180);
                    swipeState.activeCard = null;
                    return;
                }

                // Видалити задачу — свайп вліво (підвищений поріг: 130px)
                if (swipeState.currentX < -(ACTION_THRESHOLD + 30)) {
                    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
                    const task = (typeof tasks !== 'undefined') ? tasks.find(t => t.id === taskId) : null;
                    const taskName = task?.title || window.t('task') || 'Задача';
                    const taskCopy = task ? JSON.parse(JSON.stringify(task)) : null;

                    if (content) {
                        content.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
                        content.style.transform = 'translateX(-110%)';
                        content.style.opacity = '0';
                    }

                    if (typeof showUndoToast === 'function' && taskCopy) {
                        card.style.maxHeight = card.offsetHeight + 'px';
                        card.style.overflow = 'hidden';
                        card.style.transition = 'max-height 0.28s ease, opacity 0.28s ease';
                        requestAnimationFrame(() => { card.style.maxHeight = '0'; card.style.opacity = '0'; });
                        setTimeout(() => { showUndoToast(taskName, taskCopy, 'task'); }, 280);
                    } else {
                        setTimeout(() => { deleteTask(taskId); }, 230);
                    }

                    swipeState.activeCard = null;
                    return;
                }

                // Скидаємо — плавна анімація повернення
                if (content) {
                    content.style.transition = 'transform 0.18s ease';
                    content.style.transform = '';
                    setTimeout(() => { if (content) content.style.transition = ''; }, 180);
                }
                leftBg?.classList.remove('visible');
                rightBg?.classList.remove('visible');

                // Блокуємо відкриття модалки після свайпу
                if (didSwipe && content) {
                    content.style.pointerEvents = 'none';
                    setTimeout(() => { if (content) content.style.pointerEvents = ''; }, 60);
                }

                swipeState.currentX     = 0;
                swipeState.isHorizontal = null;
                swipeState.activeCard   = null;
            }, { passive: true });
        }
