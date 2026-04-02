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

// ── Глобальні хелпери для демо-ніш ───────────────────────────
// Використовуються в construction, medical, beauty та ін.
window._demoDate = function(offsetDays) {
    offsetDays = offsetDays || 0;
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + '-' +
        String(d.getMonth()+1).padStart(2,'0') + '-' +
        String(d.getDate()).padStart(2,'0');
};
window._demoTs = function(offsetDays) {
    return firebase.firestore.Timestamp.fromDate(
        new Date(Date.now() + (offsetDays||0) * 86400000)
    );
};
window._demoTsFinance = function(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetDays||0));
    d.setHours(12, 0, 0, 0);
    return firebase.firestore.Timestamp.fromDate(d);
};

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

// Записує DEFAULT_CATEGORIES з 98-finance.js в демо-компанію
window._writeDemoDefaultFinCategories = async function(cr, uid) {
    try {
        if (typeof window._getDefaultFinCategories !== 'function') return;
        const cats = window._getDefaultFinCategories();
        if (!cats || !cats.length) return;
        const now = firebase.firestore.FieldValue.serverTimestamp();
        const ops = cats.map(cat => ({
            type: 'set',
            ref: cr.collection('finance_categories').doc(cat.id),
            data: { ...cat, system: !cat.parentId, createdBy: uid, createdAt: now }
        }));
        await window.safeBatchCommit(ops, 'default-fin-categories');
    } catch(e) {
        console.warn('[Demo] writeDefaultFinCategories:', e.message);
    }
};
