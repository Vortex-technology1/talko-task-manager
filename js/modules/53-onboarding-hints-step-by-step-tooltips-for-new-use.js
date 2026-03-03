// =====================
    // ONBOARDING HINTS — step-by-step tooltips for new users
    // =====================
    const ONBOARDING_HINTS = [
        {
            target: '#nextTaskBtn',
            text: 'hintNextTask',
            fallback: 'Натисніть, щоб відкрити найважливішу задачу. Система сама вибере що робити першим.',
            position: 'below'
        },
        {
            target: '[data-tab="tasks"]',
            text: 'hintTasks',
            fallback: 'Тут всі задачі. Використовуйте фільтри "Мої" та "Сьогодні" щоб бачити тільки своє.',
            position: 'above'
        },
        {
            target: '[data-tab="control"]',
            text: 'hintControl',
            fallback: 'Панель керівника: брифінг, журнал збоїв, аналітика по команді.',
            position: 'above'
        },
        {
            target: '[data-tab="more"]',
            text: 'hintMore',
            fallback: 'Тут AI-асистенти, функції, аналітика, профіль та налаштування.',
            position: 'above'
        }
    ];
    
    let currentHintIndex = 0;
    
    function startOnboarding() {
        // Onboarding disabled
        return;
    }
    
    function showNextHint() {
        // Remove previous
        document.querySelector('.hint-tooltip')?.remove();
        document.querySelector('.hint-pulse')?.classList.remove('hint-pulse');
        
        if (currentHintIndex >= ONBOARDING_HINTS.length) {
            // Done
            const key = `onboarding_${currentUser?.uid}`;
            localStorage.setItem(key, '1');
            return;
        }
        
        const hint = ONBOARDING_HINTS[currentHintIndex];
        const el = document.querySelector(hint.target);
        if (!el) { currentHintIndex++; showNextHint(); return; }
        
        // Pulse the target
        el.classList.add('hint-pulse');
        
        // Create tooltip
        const rect = el.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.className = 'hint-tooltip';
        
        const stepText = `${currentHintIndex + 1}/${ONBOARDING_HINTS.length}`;
        const hintText = t(hint.text) || hint.fallback;
        
        tooltip.innerHTML = `
            <div class="hint-step">${stepText}</div>
            <div>${hintText}</div>
            <button class="hint-dismiss" onclick="advanceHint()">${currentHintIndex < ONBOARDING_HINTS.length - 1 ? (t('next') || 'Далі') : (t('gotIt') || 'Зрозуміло')}</button>
            <button class="hint-dismiss" onclick="skipOnboarding()" style="margin-left:4px;opacity:0.6;">${t('skip') || 'Пропустити'}</button>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position
        const ttRect = tooltip.getBoundingClientRect();
        if (hint.position === 'above') {
            tooltip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
            tooltip.style.left = Math.max(8, Math.min(rect.left + rect.width/2 - ttRect.width/2, window.innerWidth - ttRect.width - 8)) + 'px';
        } else {
            tooltip.style.top = (rect.bottom + 8) + 'px';
            tooltip.style.left = Math.max(8, Math.min(rect.left + rect.width/2 - ttRect.width/2, window.innerWidth - ttRect.width - 8)) + 'px';
        }
    }
    
    function advanceHint() {
        currentHintIndex++;
        showNextHint();
    }
    
    function skipOnboarding() {
        document.querySelector('.hint-tooltip')?.remove();
        document.querySelector('.hint-pulse')?.classList.remove('hint-pulse');
        const key = `onboarding_${currentUser?.uid}`;
        localStorage.setItem(key, '1');
    }
