// =====================
    // AI ASSISTANTS CONFIG (owner panel) — LEGACY STUB
    // Замінено новою адмінкою: Суперадмін → AI Налаштування → Глобальні налаштування
    // =====================
'use strict';

    // Перенаправляємо на нову адмінку суперадміна
    function openAiAssistantsModal() {
        if (typeof window.openGlobalAISettings === 'function') {
            window.openGlobalAISettings();
        } else {
            showToast && showToast('AI налаштування доступні в: Суперадмін → AI Налаштування', 'info');
        }
    }

    // Заглушки для backward compat (HTML кнопки ще посилаються на ці функції)
    function loadAiAssistants() {}
    function loadAiApiKey() {}
    function saveAiApiKey() { openAiAssistantsModal(); }
    function addAiAssistant() { openAiAssistantsModal(); }
    function updateAssistantPrompt() {}
    function updateAssistantModel() {}
    function deleteAiAssistant() {}
    function ensureDefaultAssistants() {}
