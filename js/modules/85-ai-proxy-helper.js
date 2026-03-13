(function () {
'use strict';

// ============================================================
// window.aiProxy — Universal AI helper
// Всі модулі використовують цю функцію замість прямих fetch до OpenAI
//
// Використання:
//   const text = await window.aiProxy({
//     messages:     [{ role: 'user', content: '...' }],
//     systemPrompt: '...', // опційно
//     model:        'gpt-4o-mini', // опційно
//     maxTokens:    800,  // опційно
//     module:       'incidents', // для логування
//   });
// ============================================================

window.aiProxy = async function({
    messages,
    systemPrompt,
    model       = 'gpt-4o-mini',
    maxTokens   = 800,
    module: mod = 'unknown',
} = {}) {
    const companyId = window.currentCompanyId;
    if (!companyId) throw new Error('currentCompanyId не визначений');
    if (!messages || !messages.length) throw new Error('messages[] порожній');

    // Firebase ID token для авторизації на сервері
    const user = firebase.auth().currentUser;
    if (!user) throw new Error('Користувач не авторизований');
    const idToken = await user.getIdToken();

    // FIX: AbortController timeout — LLM може відповідати до 60s
    const _ctrl  = new AbortController();
    const _timer = setTimeout(() => _ctrl.abort(), 60000);
    let response;
    try {
        response = await fetch('/api/ai-proxy', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                companyId,
                messages,
                systemPrompt,
                model,
                maxTokens,
                module: mod,
            }),
            signal: _ctrl.signal,
        });
    } finally { clearTimeout(_timer); }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `AI proxy error ${response.status}`);
    }

    return data.text;
};

})();
