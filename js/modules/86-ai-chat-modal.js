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

// ── Відкрити чат ─────────────────────────────────────────────
window.openAiChat = function({ module, contextText, systemPrompt, title, initialMessage }) {
    _chatHistory    = [];
    _chatModule     = module;
    _chatContext    = contextText || '';
    _chatSystemPrompt = systemPrompt || null;

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
                    <span style="font-size:1rem;font-weight:700;color:#fff;">${title || 'AI Аналіз'}</span>
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
                    <textarea id="aiChatInput" placeholder="Запитай AI або уточни деталі..."
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

    // Додаємо контекст до першого повідомлення якщо є
    let messages = [..._chatHistory];
    if (_chatContext && messages.length === 1) {
        messages = [{
            role: 'user',
            content: _chatContext + '\n\n---\n\n' + messages[0].content
        }];
    }

    try {
        const reply = await window.aiProxy({
            messages:     messages,
            systemPrompt: _chatSystemPrompt,
            model:        'gpt-4o-mini',
            maxTokens:    1200,
            module:       _chatModule,
        });

        document.getElementById(typingId)?.remove();
        _appendChatMsg('assistant', reply);
        _chatHistory.push({ role: 'assistant', content: reply });

    } catch(e) {
        document.getElementById(typingId)?.remove();
        _appendChatMsg('error', 'Помилка: ' + (e.message || 'невідома'));
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

})();
