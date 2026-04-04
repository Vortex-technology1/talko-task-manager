// ============================================================
// 86-ai-chat-modal.js — Universal AI Chat Modal
// Підключається до: статистика, координація
// ============================================================
(function() {

// ── Стан чату ────────────────────────────────────────────────
let _chatHistory = [];       // [{role, content}]
let _chatModule  = '';       // 'statistics' | 'coordination'
let _chatContext = '';       // початковий контекст (метрики / патерни)
let _chatSystemPrompt = null;
let _chatMaxTokens = 1200;   // FIX: зберігаємо maxTokens між викликами

// ── Відкрити чат ─────────────────────────────────────────────
window.openAiChat = function({ module, contextText, systemPrompt, title, initialMessage, maxTokens }) {
    _chatHistory    = [];
    _chatModule     = module;
    _chatContext    = contextText || '';
    _chatSystemPrompt = systemPrompt || null;
    _chatMaxTokens  = maxTokens || 1200; // FIX: зберігаємо для всіх наступних викликів

    // Видаляємо старий якщо є
    document.getElementById('aiChatOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'aiChatOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10050;display:flex;align-items:center;justify-content:center;padding:1rem;';

    overlay.innerHTML = `
        <div style="background:white;border-radius:16px;width:100%;max-width:640px;height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f1117;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                <div style="display:flex;align-items:center;gap:0.6rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span style="font-size:1rem;font-weight:700;color:#fff;">${title || window.t('aiAnalysisWord')}</span>
                </div>
                <button onclick="document.getElementById('aiChatOverlay').remove()" style="background:#ffffff18;border:none;cursor:pointer;width:32px;height:32px;border-radius:50%;color:#9ca3af;font-size:1.1rem;display:flex;align-items:center;justify-content:center;">✕</button>
            </div>

            <!-- Context block -->
            ${_chatContext ? `
            <div style="background:#f0fdf4;border-bottom:1px solid #e5e7eb;padding:0.75rem 1rem;flex-shrink:0;max-height:140px;overflow-y:auto;">
                <div style="font-size:0.72rem;font-weight:700;color:#16a34a;margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.05em;">Дані для аналізу</div>
                <pre style="font-size:0.75rem;white-space:pre-wrap;margin:0;color:#374151;font-family:inherit;line-height:1.5;">${_escHtml(_chatContext)}</pre>
            </div>` : ''}

            <!-- Messages -->
            <div id="aiChatMessages" style="flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;">
            </div>

            <!-- Input -->
            <div style="border-top:1px solid #e5e7eb;padding:0.75rem 1rem;flex-shrink:0;background:white;">
                <div style="display:flex;gap:0.5rem;align-items:flex-end;">
                    <textarea id="aiChatInput" placeholder=${window.t('askAIPh')}
                        rows="2"
                        style="flex:1;padding:0.6rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:12px;font-size:0.88rem;font-family:inherit;resize:none;line-height:1.4;outline:none;transition:border-color 0.2s;"
                        onfocus="this.style.borderColor='#8b5cf6'"
                        onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window._sendAiChatMsg();}"></textarea>
                    <button onclick="window._sendAiChatMsg()"
                        style="padding:0.6rem 1rem;background:#8b5cf6;color:white;border:none;border-radius:12px;cursor:pointer;font-weight:600;font-size:0.88rem;white-space:nowrap;display:flex;align-items:center;gap:0.4rem;flex-shrink:0;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Надіслати
                    </button>
                </div>
                <div style="font-size:0.7rem;color:#9ca3af;margin-top:0.4rem;">Enter — надіслати, Shift+Enter — новий рядок</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('aiChatInput')?.focus(), 100);

    // Якщо є початкове повідомлення — відправляємо автоматично
    if (initialMessage) {
        _appendChatMsg('user', initialMessage);
        _chatHistory.push({ role: 'user', content: initialMessage });
        _callAI();
    }
};

// ── Надіслати повідомлення ────────────────────────────────────
window._sendAiChatMsg = async function() {
    const input = document.getElementById('aiChatInput');
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';

    _appendChatMsg('user', text);
    _chatHistory.push({ role: 'user', content: text });
    await _callAI();
};

// ── Виклик AI ────────────────────────────────────────────────
async function _callAI() {
    const typingId = 'typing_' + Date.now();
    _appendTyping(typingId);

    // FIX: контекст (метрики/патерни) передаємо через systemPrompt — так він
    // присутній у КОЖНОМУ повідомленні чату, а не тільки в першому.
    // Пріоритет: явний systemPrompt з виклику → додаємо контекст як префікс.
    // Якщо systemPrompt null — воркер сам підтягне промпт агента з адмінки,
    // тому контекст додаємо окремим system повідомленням через messages.
    let messages = [..._chatHistory];
    let effectiveSystemPrompt = _chatSystemPrompt;

    if (_chatContext) {
        const contextBlock = `=== ДАНІ ДЛЯ АНАЛІЗУ ===\n${_chatContext}\n=== КІНЕЦЬ ДАНИХ ===`;
        if (effectiveSystemPrompt) {
            // Є явний system prompt — додаємо контекст на початок
            effectiveSystemPrompt = contextBlock + '\n\n' + effectiveSystemPrompt;
        } else {
            // System prompt береться з адмінки (null) — вставляємо контекст
            // як перше system повідомлення в messages (воркер прибере дублі)
            messages = [{ role: 'system', content: contextBlock }, ...messages];
        }
    }

    try {
        const reply = await window.aiProxy({
            messages:     messages,
            systemPrompt: effectiveSystemPrompt,
            model:        null,     // воркер бере модель з налаштувань агента в адмінці
            maxTokens:    _chatMaxTokens,
            module:       _chatModule,
        });

        document.getElementById(typingId)?.remove();
        _appendChatMsg('assistant', reply);
        _chatHistory.push({ role: 'assistant', content: reply });

    } catch(e) {
        document.getElementById(typingId)?.remove();
        _appendChatMsg('error', 'Помилка: ' + (e.message || window.t('unknownErr')));
    }
}

// ── Додати повідомлення в чат ─────────────────────────────────
function _appendChatMsg(role, text) {
    const msgs = document.getElementById('aiChatMessages');
    if (!msgs) return;

    const isUser = role === 'user';
    const isError = role === 'error';

    const div = document.createElement('div');
    div.style.cssText = `display:flex;${isUser ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}`;

    const bubble = document.createElement('div');
    bubble.style.cssText = `
        max-width:85%;
        padding:0.65rem 0.9rem;
        border-radius:${isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
        font-size:0.88rem;
        line-height:1.55;
        white-space:pre-wrap;
        ${isUser
            ? 'background:#8b5cf6;color:white;'
            : isError
            ? 'background:#fef2f2;color:#ef4444;border:1px solid #fecaca;'
            : 'background:#f3f4f6;color:#1f2937;border:1px solid #e5e7eb;'}
    `;
    bubble.textContent = text;

    div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

// ── Індикатор друку ───────────────────────────────────────────
function _appendTyping(id) {
    const msgs = document.getElementById('aiChatMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.id = id;
    div.style.cssText = 'display:flex;justify-content:flex-start;';
    div.innerHTML = `
        <div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:16px 16px 16px 4px;padding:0.65rem 0.9rem;display:flex;gap:4px;align-items:center;">
            <span style="width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:aiDot 1.2s infinite 0s;"></span>
            <span style="width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:aiDot 1.2s infinite 0.2s;"></span>
            <span style="width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:aiDot 1.2s infinite 0.4s;"></span>
        </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;

    // CSS анімація (один раз)
    if (!document.getElementById('aiDotStyle')) {
        const s = document.createElement('style');
        s.id = 'aiDotStyle';
        s.textContent = '@keyframes aiDot{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}';
        document.head.appendChild(s);
    }
}

function _escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ══════════════════════════════════════════════════════════════
// ПОКРОКОВИЙ АНАЛІЗ МЕТРИК — статистика
// Крок 1: вузьке місце + втрати
// Крок 2: уточнення від користувача
// Крок 3: 2 варіанти рішень + сценарії
// Крок 4: людина обирає варіант
// Крок 5: план дій
// Крок 6: розбивка на задачі в TALKO
// ══════════════════════════════════════════════════════════════

let _sfStep = 0;          // поточний крок
let _sfContext = '';      // дані метрик
let _sfHistory = [];      // history для AI
let _sfChosenVar = null;  // обраний варіант (1 або 2)
let _sfPlan = '';         // згенерований план

window.openMetricsStepFlow = function(contextText) {
    _sfStep = 1;
    _sfContext = contextText || '';
    _sfHistory = [];
    _sfChosenVar = null;
    _sfPlan = '';

    document.getElementById('aiChatOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'aiChatOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:10050;display:flex;align-items:center;justify-content:center;padding:1rem;';

    overlay.innerHTML = `
    <div style="background:white;border-radius:16px;width:100%;max-width:640px;height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
        <!-- Header -->
        <div style="background:#0f1117;padding:0.9rem 1.25rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:0.6rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span style="font-size:1rem;font-weight:700;color:#fff;">✦ AI Аналіз метрик</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <span id="sfStepBadge" style="font-size:0.72rem;color:#9ca3af;background:#ffffff15;padding:2px 10px;border-radius:20px;">Крок 1 / 6</span>
                <button onclick="document.getElementById('aiChatOverlay').remove()" style="background:#ffffff18;border:none;cursor:pointer;width:30px;height:30px;border-radius:50%;color:#9ca3af;font-size:1rem;display:flex;align-items:center;justify-content:center;">✕</button>
            </div>
        </div>

        <!-- Context -->
        <div style="background:#f0fdf4;border-bottom:1px solid #e5e7eb;padding:0.6rem 1rem;flex-shrink:0;max-height:100px;overflow-y:auto;">
            <div style="font-size:0.7rem;font-weight:700;color:#16a34a;margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:0.05em;">Дані для аналізу</div>
            <pre style="font-size:0.72rem;white-space:pre-wrap;margin:0;color:#374151;font-family:inherit;line-height:1.4;">${_escHtml(_sfContext.slice(0,800))}${_sfContext.length>800?'\n[...і ще дані]':''}</pre>
        </div>

        <!-- Messages -->
        <div id="sfMessages" style="flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;"></div>

        <!-- Input area -->
        <div id="sfInputArea" style="border-top:1px solid #e5e7eb;padding:0.75rem 1rem;flex-shrink:0;background:white;">
            <div style="display:flex;gap:0.5rem;align-items:flex-end;">
                <textarea id="sfInput" placeholder="Додайте свої думки або натисніть продовжити..." rows="2"
                    style="flex:1;padding:0.6rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:12px;font-size:0.88rem;font-family:inherit;resize:none;line-height:1.4;outline:none;transition:border-color 0.2s;"
                    onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='#e5e7eb'"
                    onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window._sfSend();}"></textarea>
                <button onclick="window._sfSend()" id="sfSendBtn"
                    style="padding:0.6rem 1rem;background:#8b5cf6;color:white;border:none;border-radius:12px;cursor:pointer;font-weight:600;font-size:0.88rem;flex-shrink:0;">
                    Продовжити →
                </button>
            </div>
        </div>
    </div>`;

    document.body.appendChild(overlay);

    // Крок 1 — AI сам починає аналіз
    _sfRunStep1();
};

// ── Крок 1: вузьке місце + втрати ────────────────────────────
async function _sfRunStep1() {
    _sfSetStep(1);
    const prompt = `Ти — бізнес-аналітик. Проаналізуй дані метрик нижче.

ЗАВДАННЯ: визнач ОДНЕ найкритичніше вузьке місце.
Відповідь СТРОГО за структурою:

🔴 ВУЗЬКЕ МІСЦЕ: [назва проблеми одним реченням]

📊 ПОТОЧНА СИТУАЦІЯ: [факти з даних — цифри, тренди]

💸 ФІНАНСОВІ НАСЛІДКИ: [якщо не виправити — скільки грошей втрачається на місяць/рік. Дай конкретну цифру або діапазон]

⚠️ РИЗИКИ ЧЕРЕЗ 3 МІСЯЦІ: [що станеться якщо не діяти]

Дані: ${_sfContext.slice(0, 4000)}`;

    await _sfAskAI(prompt, true);
    _sfShowButtons([{ label: '💬 Додати контекст', action: 'sfUserComment' },
                    { label: 'Далі →', action: 'sfStep2' }]);
}

// ── Крок 2: уточнення від користувача ─────────────────────────
window._sfStep2 = async function(userComment) {
    _sfSetStep(2);
    const msg = userComment
        ? `Враховуючи додатковий контекст від власника: "${userComment}"\n\nПідтверди або скоригуй своє бачення вузького місця. Відповідь коротко — 2-3 речення.`
        : `Власник не має що додати. Підтверди своє бачення вузького місця одним реченням.`;
    await _sfAskAI(msg);
    _sfShowButtons([{ label: 'Показати рішення →', action: 'sfStep3' }]);
};

// ── Крок 3: 2 варіанти рішень ─────────────────────────────────
window._sfStep3 = async function() {
    _sfSetStep(3);
    const msg = `Запропонуй рівно 2 варіанти вирішення цього вузького місця.

Формат СТРОГО:

ВАРІАНТ 1: [назва]
✅ Плюси: [3 пункти]
❌ Мінуси: [2 пункти]
📈 Сценарій через 3 міс: [конкретна цифра або результат]
💰 Орієнтовні витрати: [сума або "без витрат"]

ВАРІАНТ 2: [назва]
✅ Плюси: [3 пункти]
❌ Мінуси: [2 пункти]
📈 Сценарій через 3 міс: [конкретна цифра або результат]
💰 Орієнтовні витрати: [сума або "без витрат"]

⭐ МОЯ РЕКОМЕНДАЦІЯ: Варіант [1 або 2] — [одне речення чому]`;
    await _sfAskAI(msg);
    _sfShowButtons([
        { label: '✓ Обираю Варіант 1', action: 'sfChoose', data: 1 },
        { label: '✓ Обираю Варіант 2', action: 'sfChoose', data: 2 },
        { label: '💬 Є питання', action: 'sfUserComment3' },
    ]);
};

// ── Крок 4: вибір варіанту ────────────────────────────────────
window._sfChoose = async function(varNum) {
    _sfChosenVar = varNum;
    _sfSetStep(4);
    _sfAppendMsg('user', `Обираю Варіант ${varNum}`);
    _sfHistory.push({ role: 'user', content: `Обираю Варіант ${varNum}` });
    await _sfStep4();
};

async function _sfStep4() {
    const msg = `Власник обрав Варіант ${_sfChosenVar}. 
Склади детальний план дій — конкретні кроки що треба зробити.

Формат:
📋 ПЛАН ДІЙ: [назва варіанту]

Тиждень 1:
• [дія 1]
• [дія 2]

Тиждень 2-3:
• [дія 1]
• [дія 2]

Тиждень 4+:
• [дія 1]
• [дія 2]

🎯 ОЧІКУВАНИЙ РЕЗУЛЬТАТ: [через 30/60/90 днів]`;
    await _sfAskAI(msg);
    _sfShowButtons([{ label: '📋 Створити задачі в TALKO', action: 'sfStep5' },
                    { label: '💬 Скоригувати план', action: 'sfUserComment4' }]);
}

// ── Крок 5: розбивка на задачі ────────────────────────────────
window._sfStep5 = async function() {
    _sfSetStep(5);
    const msg = `Розбий цей план на конкретні задачі для TALKO.

Відповідай ТІЛЬКИ JSON масивом, без пояснень:
[
  {"title":"назва задачі","deadlineDays":7,"priority":"high"},
  {"title":"назва задачі","deadlineDays":14,"priority":"medium"}
]

priority: high/medium/low
deadlineDays: через скільки днів дедлайн від сьогодні
Максимум 8 задач.`;

    _sfAppendMsg('assistant', '⏳ Формую задачі...', 'typing');
    try {
        const reply = await _sfCallAI(msg);
        document.querySelector('[data-typing]')?.remove();

        // Парсимо JSON
        const jsonMatch = reply.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('no json');
        const tasks = JSON.parse(jsonMatch[0]);

        // Показуємо задачі для підтвердження
        _sfShowTasksConfirm(tasks);
    } catch(e) {
        _sfAppendMsg('error', 'Не вдалось розібрати задачі. Спробуйте ще раз.');
        _sfShowButtons([{ label: '🔄 Спробувати ще', action: 'sfStep5' }]);
    }
};

function _sfShowTasksConfirm(tasks) {
    const msgs = document.getElementById('sfMessages');
    const div = document.createElement('div');
    div.style.cssText = 'background:#f3f4f6;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;';

    const today = new Date();
    const priorityLabel = { high: '🔴 Висока', medium: '🟡 Середня', low: '🟢 Низька' };

    div.innerHTML = `
        <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.75rem;color:#111827;">📋 Задачі для створення в TALKO:</div>
        ${tasks.map((t, i) => {
            const dl = new Date(today); dl.setDate(dl.getDate() + (t.deadlineDays || 7));
            const dlStr = dl.toISOString().split('T')[0];
            return `<div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0;border-bottom:1px solid #e5e7eb;font-size:0.85rem;">
                <input type="checkbox" checked id="sftask_${i}" style="accent-color:#8b5cf6;flex-shrink:0;">
                <div style="flex:1;">
                    <div style="font-weight:600;color:#111827;">${_escHtml(t.title)}</div>
                    <div style="font-size:0.75rem;color:#6b7280;">${priorityLabel[t.priority]||''} · до ${dlStr}</div>
                </div>
            </div>`;
        }).join('')}
        <button onclick="window._sfCreateTasks(${JSON.stringify(tasks).replace(/"/g,'&quot;')})"
            style="margin-top:0.75rem;width:100%;padding:0.6rem;background:#8b5cf6;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.9rem;">
            ✓ Створити вибрані задачі
        </button>`;

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    document.getElementById('sfInputArea').style.display = 'none';
}

window._sfCreateTasks = async function(tasks) {
    const today = new Date();
    let created = 0;
    for (let i = 0; i < tasks.length; i++) {
        const cb = document.getElementById(`sftask_${i}`);
        if (!cb?.checked) continue;
        const t = tasks[i];
        const dl = new Date(today); dl.setDate(dl.getDate() + (t.deadlineDays || 7));
        const deadlineDate = dl.toISOString().split('T')[0];
        try {
            await window.companyRef().collection('tasks').add({
                title: t.title,
                status: 'new',
                priority: t.priority || 'medium',
                assigneeId: window.currentUser?.uid || '',
                assigneeName: window.currentUserData?.name || window.currentUser?.email || '',
                creatorId: window.currentUser?.uid || '',
                creatorName: window.currentUserData?.name || window.currentUser?.email || '',
                deadlineDate,
                deadlineTime: '18:00',
                source: 'ai_metrics_analysis',
                autoCreated: true,
                requireReview: false,
                coExecutorIds: [], observerIds: [], checklist: [],
                pinned: false,
                createdDate: today.toISOString().split('T')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            created++;
        } catch(e) { console.warn('task create error', e.message); }
    }

    // Оновлюємо локальний масив
    if (typeof scheduleRender === 'function') scheduleRender();
    else if (typeof window.scheduleRender === 'function') window.scheduleRender();

    _sfAppendMsg('assistant', `✅ Створено ${created} задач у TALKO! Перейдіть у «Мій день» або «Завдання» щоб побачити їх.`);
    document.getElementById('sfInputArea').style.display = '';
    document.getElementById('sfInputArea').innerHTML = `
        <div style="text-align:center;padding:0.5rem;">
            <button onclick="document.getElementById('aiChatOverlay').remove()"
                style="padding:0.6rem 1.5rem;background:#22c55e;color:white;border:none;border-radius:12px;cursor:pointer;font-weight:700;">
                🎉 Закрити
            </button>
        </div>`;
};

// ── Helpers ───────────────────────────────────────────────────
function _sfSetStep(n) {
    _sfStep = n;
    const badge = document.getElementById('sfStepBadge');
    if (badge) badge.textContent = `Крок ${n} / 6`;
}

async function _sfAskAI(prompt, isFirst) {
    if (!isFirst) _sfHistory.push({ role: 'user', content: prompt });
    else _sfHistory = [{ role: 'user', content: prompt }];

    const typingId = 'sftyping_' + Date.now();
    _sfAppendTyping(typingId);

    try {
        const reply = await _sfCallAI(prompt, isFirst);
        document.getElementById(typingId)?.remove();
        _sfAppendMsg('assistant', reply);
        _sfHistory.push({ role: 'assistant', content: reply });
        return reply;
    } catch(e) {
        document.getElementById(typingId)?.remove();
        _sfAppendMsg('error', 'Помилка: ' + e.message);
        throw e;
    }
}

async function _sfCallAI(prompt, isFirst) {
    // Промпт з адмінки ('statistics' агент) стає системним автоматично у воркері.
    // Контекст метрик додаємо як system повідомлення — воркер об'єднає їх з промптом адмінки.
    // Наші покрокові інструкції йдуть як user повідомлення поверх системного промпту.

    let messages;
    if (isFirst) {
        // Перший крок: контекст метрик в системному + інструкція кроку в user
        messages = [
            { role: 'system', content: `=== ДАНІ МЕТРИК КОМПАНІЇ ===\n${_sfContext}\n=== КІНЕЦЬ ДАНИХ ===` },
            { role: 'user', content: prompt },
        ];
    } else {
        // Наступні кроки: весь history (вже містить контекст з першого кроку)
        messages = _sfHistory;
    }

    const reply = await window.aiProxy({
        messages,
        systemPrompt: null,   // null → воркер бере промпт агента 'statistics' з адмінки
        maxTokens: 1200,
        module: 'statistics', // ключ агента в адмінці
    });
    return reply;
}

function _sfShowButtons(buttons) {
    const inputArea = document.getElementById('sfInputArea');
    if (!inputArea) return;

    // Визначаємо чи є кнопка "Додати контекст" або "Є питання" (треба input)
    const hasComment = buttons.some(b => b.action === 'sfUserComment' || b.action === 'sfUserComment3' || b.action === 'sfUserComment4');

    inputArea.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;padding:0.25rem 0 0.5rem;">
            ${buttons.map(b => `
                <button onclick="window._sfHandleBtn('${b.action}',${b.data||'null'})"
                    style="padding:0.5rem 1rem;border:1.5px solid #8b5cf6;border-radius:10px;cursor:pointer;font-size:0.85rem;font-weight:600;
                    background:${b.action.startsWith('sfChoose')||b.action==='sfStep5'?'#8b5cf6':'white'};
                    color:${b.action.startsWith('sfChoose')||b.action==='sfStep5'?'white':'#8b5cf6'};">
                    ${b.label}
                </button>`).join('')}
        </div>
        ${hasComment ? `<div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
            <textarea id="sfInput" placeholder="Ваш коментар..." rows="2"
                style="flex:1;padding:0.5rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:10px;font-size:0.85rem;font-family:inherit;resize:none;"
                onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window._sfSend();}"></textarea>
            <button onclick="window._sfSend()" style="padding:0.5rem 0.9rem;background:#8b5cf6;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:600;">→</button>
        </div>` : ''}`;
}

window._sfHandleBtn = function(action, data) {
    switch(action) {
        case 'sfStep2':   window._sfStep2(document.getElementById('sfInput')?.value?.trim()||''); break;
        case 'sfStep3':   window._sfStep3(); break;
        case 'sfChoose':  window._sfChoose(data); break;
        case 'sfStep5':   window._sfStep5(); break;
        case 'sfUserComment':
        case 'sfUserComment3':
        case 'sfUserComment4':
            // Input вже показаний — просто фокус
            document.getElementById('sfInput')?.focus(); break;
    }
};

window._sfSend = function() {
    const val = document.getElementById('sfInput')?.value?.trim();
    if (!val) return;
    document.getElementById('sfInput').value = '';
    _sfAppendMsg('user', val);

    if (_sfStep === 1) window._sfStep2(val);
    else if (_sfStep === 3) {
        _sfHistory.push({ role: 'user', content: val });
        _sfAskAI(val).then(() => {
            _sfShowButtons([
                { label: '✓ Обираю Варіант 1', action: 'sfChoose', data: 1 },
                { label: '✓ Обираю Варіант 2', action: 'sfChoose', data: 2 },
            ]);
        });
    } else if (_sfStep === 4) {
        _sfHistory.push({ role: 'user', content: val });
        _sfAskAI(val).then(() => {
            _sfShowButtons([{ label: '📋 Створити задачі в TALKO', action: 'sfStep5' }]);
        });
    }
};

function _sfAppendMsg(role, text) {
    const msgs = document.getElementById('sfMessages');
    if (!msgs) return;
    const isUser = role === 'user';
    const isError = role === 'error';
    const div = document.createElement('div');
    div.style.cssText = `display:flex;${isUser?'justify-content:flex-end;':'justify-content:flex-start;'}`;
    const bubble = document.createElement('div');
    bubble.style.cssText = `max-width:88%;padding:0.65rem 0.9rem;border-radius:${isUser?'16px 16px 4px 16px':'16px 16px 16px 4px'};font-size:0.88rem;line-height:1.55;white-space:pre-wrap;
        ${isUser?'background:#8b5cf6;color:white;':isError?'background:#fef2f2;color:#ef4444;border:1px solid #fecaca;':'background:#f3f4f6;color:#1f2937;border:1px solid #e5e7eb;'}`;
    bubble.textContent = text;
    div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function _sfAppendTyping(id) {
    const msgs = document.getElementById('sfMessages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.id = id;
    div.style.cssText = 'display:flex;justify-content:flex-start;';
    div.innerHTML = `<div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:16px 16px 16px 4px;padding:0.65rem 0.9rem;display:flex;gap:4px;align-items:center;">
        <span style="width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:aiDot 1.2s infinite 0s;"></span>
        <span style="width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:aiDot 1.2s infinite 0.2s;"></span>
        <span style="width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:aiDot 1.2s infinite 0.4s;"></span>
    </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

})();
