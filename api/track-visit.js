// /api/track-visit.js
// Tracks site visits from public landing pages (no Firebase SDK needed)
// Rate limited: 1 request per IP per siteId per 10 minutes

const admin = require('firebase-admin');

// Simple in-memory rate limit (resets on cold start, good enough for Vercel)
const _seen = new Map();
function isRateLimited(ip, siteId) {
  const key = ip + ':' + siteId;
  const now = Date.now();
  const last = _seen.get(key) || 0;
  if (now - last < 10 * 60 * 1000) return true; // 10 min window
  _seen.set(key, now);
  // Cleanup old entries every 1000 requests
  if (_seen.size > 1000) {
    for (const [k, t] of _seen) {
      if (now - t > 10 * 60 * 1000) _seen.delete(k);
    }
  }
  return false;
}

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

  // Rate limit by IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip, siteId)) return res.status(200).json({ ok: true, cached: true });

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
    res.status(200).json({ ok: false, error: e.message });
  }
};
