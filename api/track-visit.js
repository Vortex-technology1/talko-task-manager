// /api/track-visit.js
// Tracks site visits from public landing pages (no Firebase SDK needed)
// Called via fetch('/api/track-visit', { method:'POST', body: JSON.stringify({siteId, companyId}) })

const admin = require('firebase-admin');

let _db = null;
function db() {
  if (!_db) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey:  (process.env.FIREBASE_PRIVATE_KEY||'').replace(/\\n/g,'\n'),
        })
      });
    }
    _db = admin.firestore();
  }
  return _db;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { siteId, companyId } = req.body || {};
  if (!siteId || !companyId) return res.status(400).json({ error: 'Missing siteId or companyId' });

  try {
    await db()
      .collection('companies').doc(companyId)
      .collection('sites').doc(siteId)
      .update({
        visits:      admin.firestore.FieldValue.increment(1),
        lastVisitAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    res.status(200).json({ ok: true });
  } catch(e) {
    // Silently fail — don't break user experience
    res.status(200).json({ ok: false, error: e.message });
  }
};
