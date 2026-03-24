// ============================================================
// 42-demo-niches.js — Повні демо-ніші для TALKO
// Меблевий бізнес — максимальна деталізація
// ============================================================
'use strict';

// Патчимо safeBatchCommit щоб автоматично додавав isDemo:true до set операцій
const _origSafeBatch = window.safeBatchCommit;
window.safeBatchCommit = async function(ops, _label) {
    if (!ops || !ops.length) return;
    const markedOps = (ops || []).map(op => {
        if (op.type === 'set' && op.data && !op.data.isDemo) {
            return { ...op, data: { ...op.data, isDemo: true } };
        }
        return op;
    });
    try {
        return await _origSafeBatch(markedOps);
    } catch(e) {
        console.warn('[DemoNiche] batch error', _label || '?', e.message, 'ops sample:', markedOps.slice(0,2).map(o=>o.ref?.path||'?'));
        // Don't rethrow — skip this batch and continue
    }
};

function _demoDate(offsetDays) {
    offsetDays = offsetDays || 0;
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + '-' +
        String(d.getMonth()+1).padStart(2,'0') + '-' +
        String(d.getDate()).padStart(2,'0');
}
function _demoTs(offsetDays) {
    return firebase.firestore.Timestamp.fromDate(
        new Date(Date.now() + (offsetDays||0) * 86400000)
    );
}
// Timestamp для фінансових транзакцій (фінанси фільтрують по Timestamp)
function _demoTsFinance(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetDays||0));
    d.setHours(12, 0, 0, 0);
    return firebase.firestore.Timestamp.fromDate(d);
}
function _dRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

window._DEMO_NICHE_MAP = window._DEMO_NICHE_MAP || {};

// ════════════════════════════════════════════════════════════
// БУДІВЕЛЬНА КОМПАНІЯ — construction_eu
// "БудМайстер" — ремонт та оздоблення приміщень, Київ
// 12 осіб, 8 функцій, повний цикл від ліда до здачі об\'єкту
// ════════════════════════════════════════════════════════════

// "SparkClean Pro" — Commercial & Residential Cleaning, Austin TX
// 12 staff, 8 functions, USD, full cycle from lead to contract
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
// HORECA — Кафе "Сонячне"
// ════════════════════════════════════════════════════════════════════════════

