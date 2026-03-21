// api/sales-assistant.js
// Підказки в реальному часі під час дзвінка
// Викликається після кожного завершеного речення клієнта

const admin = require('firebase-admin');

if (!admin.apps.length) {
  let pk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (pk && !pk.includes('-----BEGIN')) {
    try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
  }
  pk = pk.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: pk || undefined,
    })
  });
}

const db = admin.firestore();

const ALLOWED_ORIGINS = [
  'https://taskmanagerai-vert.vercel.app',
  'https://test-talko-task.vercel.app',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

// Кеш налаштувань (10 хв)
let _settingsCache = null, _settingsCacheAt = 0;

async function getSettings() {
  if (_settingsCache && Date.now() - _settingsCacheAt < 600000) return _settingsCache;
  const snap = await db.doc('settings/platform').get().catch(() => null);
  _settingsCache = snap?.data()?.agents?.salesAssistant || {};
  _settingsCacheAt = Date.now();
  return _settingsCache;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  let uid;
  try {
    const d = await admin.auth().verifyIdToken(authHeader.slice(7));
    uid = d.uid;
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { companyId, dealId, sessionId, sentence, history = [] } = req.body || {};

  if (!companyId || !sessionId) return res.status(400).json({ error: 'companyId, sessionId required' });

  // Якщо речення порожнє або занадто коротке — не витрачаємо токени
  if (!sentence || sentence.trim().length < 5) {
    return res.status(200).json({ hint: '', action: 'listen' });
  }

  // Перевірка членства
  try {
    const m = await db.doc(`companies/${companyId}/users/${uid}`).get();
    if (!m.exists) return res.status(403).json({ error: 'Forbidden' });
  } catch(e) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Читання даних угоди (якщо є)
  let clientName = '', dealStage = '', dealNote = '';
  if (dealId) {
    try {
      const dealSnap = await db.doc(`companies/${companyId}/crm_deals/${dealId}`).get();
      if (dealSnap.exists) {
        const d = dealSnap.data();
        clientName = d.clientName || '';
        dealStage = d.stage || '';
        dealNote = d.note || '';
      }
    } catch(e) { /* не блокуємо */ }
  }

  // Читання системного промпту
  const settings = await getSettings();
  const systemPrompt = settings.systemPrompt || '';
  const model = settings.model || 'claude-haiku-4-5-20251001';
  const maxTokens = settings.maxTokens || 200;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY не налаштований' });

  // Останні 3 підказки — щоб не повторювались
  const historyText = history.slice(-3).join(' | ') || 'немає';

  const userMessage = [
    systemPrompt || `Ти AI-асистент для менеджера з продажів. 
Слухаєш дзвінок в реальному часі. 
Отримуєш одне речення від клієнта.
Відповідай ТІЛЬКИ JSON без markdown.
Якщо речення не потребує реакції — повертай порожній hint.
JSON формат: {"hint":"підказка менеджеру що сказати зараз","action":"listen|question|response|close|warn"}`,
    `КЛІЄНТ: ${clientName || 'невідомий'}`,
    dealStage ? `СТАДІЯ: ${dealStage}` : '',
    dealNote ? `НОТАТКА: ${dealNote}` : '',
    `ПОПЕРЕДНІ ПІДКАЗКИ: ${historyText}`,
    `КЛІЄНТ ЩОЙНО СКАЗАВ: "${sentence.trim()}"`,
    `Що менеджер має відповісти прямо зараз? Коротко, конкретно, одне речення.`,
  ].filter(Boolean).join('\n\n');

  // Виклик Claude з таймаутом 5 секунд (дзвінок не може чекати)
  const ctrl = new AbortController();
  const tout = setTimeout(() => ctrl.abort(), 5000);

  let hint = '', action = 'listen';

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: ctrl.signal,
    });

    const aiData = await aiRes.json();
    const rawText = aiData.content?.[0]?.text || '{}';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    hint = parsed.hint || '';
    action = parsed.action || 'listen';

  } catch(e) {
    const isTimeout = e.name === 'AbortError';
    console.error('[sa] Claude error:', isTimeout ? 'TIMEOUT' : e.message);
    // Не перебиваємо дзвінок — просто повертаємо порожній hint
  } finally {
    clearTimeout(tout);
  }

  // Async: зберегти hint в сесію (не блокує відповідь)
  if (hint && sessionId) {
    const sessionPath = dealId
      ? `companies/${companyId}/crm_deals/${dealId}/call_sessions/${sessionId}`
      : `companies/${companyId}/sa_sessions/${sessionId}`;

    db.doc(sessionPath).update({
      hints: admin.firestore.FieldValue.arrayUnion({
        at: admin.firestore.Timestamp.now(),
        sentence, hint, action,
      }),
    }).catch(e => console.warn('[sa] Firestore hint save:', e.message));
  }

  return res.status(200).json({ hint, action });
};
