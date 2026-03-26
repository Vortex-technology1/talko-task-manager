// api/sales-assistant-token.js
// Vercel Serverless Function
// Видає тимчасовий Deepgram токен (TTL 1 година)

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
    }),
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
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Верифікація Firebase токена
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 2. Перевірка companyId
  const { companyId } = req.body || {};
  if (!companyId) return res.status(400).json({ error: 'companyId required' });

  // 3. Перевірка членства в компанії
  try {
    const memberSnap = await db.doc(`companies/${companyId}/users/${uid}`).get();
    if (!memberSnap.exists) {
      return res.status(403).json({ error: 'Not a company member' });
    }
  } catch(e) {
    return res.status(403).json({ error: 'Cannot verify membership' });
  }

  // 4. Перевірка що модуль увімкнений для компанії
  try {
    const saSnap = await db.doc(`companies/${companyId}/settings/salesAssistant`).get();
    if (!saSnap.exists || !saSnap.data().enabled) {
      return res.status(403).json({ error: 'Sales Assistant не активований' });
    }
  } catch(e) {
    return res.status(403).json({ error: 'Cannot verify module access' });
  }

  // 5. Отримати тимчасовий Deepgram токен
  const deepgramKey = process.env.DEEPGRAM_API_KEY;
  if (!deepgramKey) {
    return res.status(500).json({ error: 'DEEPGRAM_API_KEY не налаштований' });
  }

  try {
    const dgRes = await fetch('https://api.deepgram.com/v1/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${deepgramKey}`,
      },
      body: JSON.stringify({
        comment: `sa-${companyId}-${uid}`,
        scopes: ['usage:write'],
        time_to_live_in_seconds: 3600,
      }),
    });

    const dgData = await dgRes.json();

    if (!dgRes.ok) {
      console.error('[sa-token] Deepgram error:', dgData);
      return res.status(502).json({ error: 'Deepgram API error' });
    }

    return res.status(200).json({
      token: dgData.key,
      expiresAt: Date.now() + 3600 * 1000,
    });

  } catch(e) {
    console.error('[sa-token] fetch error:', e.message);
    return res.status(500).json({ error: 'Network error: ' + e.message });
  }
};
