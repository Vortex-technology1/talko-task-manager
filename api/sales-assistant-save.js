// api/sales-assistant-save.js
// Збереження і аналіз після завершення дзвінка

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

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  let uid;
  try {
    const d = await admin.auth().verifyIdToken(authHeader.slice(7));
    uid = d.uid;
  } catch(e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { companyId, dealId, sessionId, transcript, duration } = req.body || {};
  if (!companyId || !sessionId) return res.status(400).json({ error: 'Required params missing' });

  // Читання post-call промпту
  let postCallPrompt = '';
  try {
    const snap = await db.doc('settings/platform').get();
    postCallPrompt = snap.data()?.agents?.salesAssistant?.postCallPrompt || '';
  } catch(e) {}

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let summary = '', score = 0, nextStep = '', risks = '';

  if (apiKey && transcript && transcript.length > 50) {
    const prompt = postCallPrompt
      ? postCallPrompt.replace('{transcript}', transcript.slice(0, 8000))
      : `Проаналізуй транскрипт продажного дзвінка. Відповідай ТІЛЬКИ JSON без markdown.
JSON формат: {"summary":"короткий підсумок дзвінка","score":7,"nextStep":"що зробити далі","risks":"що може піти не так"}

ТРАНСКРИПТ:
${transcript.slice(0, 8000)}`;

    try {
      const ctrl = new AbortController();
      const tout = setTimeout(() => ctrl.abort(), 30000);

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: ctrl.signal,
      });

      clearTimeout(tout);
      const aiData = await aiRes.json();
      const rawText = aiData.content?.[0]?.text || '{}';
      const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

      summary = parsed.summary || '';
      score = parsed.score || 0;
      nextStep = parsed.nextStep || '';
      risks = parsed.risks || '';

    } catch(e) {
      console.error('[sa-save] Claude error:', e.message);
    }
  }

  // Зберегти в call_sessions
  const now = admin.firestore.FieldValue.serverTimestamp();
  const sessionData = {
    endedAt: now,
    duration,
    transcript,
    aiSummary: summary,
    aiScore: score,
    aiNextStep: nextStep,
    aiRisks: risks,
  };

  try {
    const sessionPath = dealId
      ? `companies/${companyId}/crm_deals/${dealId}/call_sessions/${sessionId}`
      : `companies/${companyId}/sa_sessions/${sessionId}`;
    await db.doc(sessionPath).set(sessionData, { merge: true });
  } catch(e) {
    console.error('[sa-save] session save:', e.message);
  }

  // Записати в history угоди
  if (dealId) {
    try {
      const dealRef = db.doc(`companies/${companyId}/crm_deals/${dealId}`);
      await dealRef.collection('history').add({
        type: 'sales_call',
        text: '[AI дзвінок] ' + (summary ? summary.slice(0, 120) : 'Дзвінок завершено'),
        duration,
        aiScore: score,
        aiNextStep: nextStep,
        sessionId,
        by: uid,
        at: now,
      });
      await dealRef.update({ lastCallAt: now, lastCallResult: 'ai_call', updatedAt: now });
    } catch(e) {
      console.error('[sa-save] history save:', e.message);
    }
  }

  return res.status(200).json({ summary, score, nextStep, risks });
};
