// ============================================================
// 42-demo-niches.js — Утиліти для демо-ніш
// Всі ніші перенесені в окремі файли 42-niche-XXX.js
// ============================================================
'use strict';

// Патч safeBatchCommit — автоматично додає isDemo:true
(function() {
    const _orig = window.safeBatchCommit;
    if (!_orig || _orig._isDemoPatchedV2) return;
    window.safeBatchCommit = async function(ops, _label) {
        if (!ops || !ops.length) return;
        const markedOps = ops.map(op => {
            if (op.type === 'set' && op.data && !op.data.isDemo) {
                return { ...op, data: { ...op.data, isDemo: true } };
            }
            return op;
        });
        try {
            return await _orig(markedOps, _label);
        } catch(e) {
            console.warn('[DemoNiche] batch error', _label || '?', e.message);
        }
    };
    window.safeBatchCommit._isDemoPatchedV2 = true;
})();

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};
