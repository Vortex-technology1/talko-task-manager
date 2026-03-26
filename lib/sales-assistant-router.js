// api/sales-assistant.js — Sales Assistant unified endpoint
// ?action=hints|token|save

const admin = require('firebase-admin');
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || 'hints';

    if (action === 'token') return require('./api-impl/sales-assistant-token-impl')(req, res);
    if (action === 'save')  return require('./api-impl/sales-assistant-save-impl')(req, res);
    // default: hints
    return require('./api-impl/sales-assistant-hints-impl')(req, res);
};
