// api/app.js — serves index.html as serverless function (never cached by Vercel CDN)
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    try {
        const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.status(200).send(html);
    } catch(e) {
        res.status(500).send('Error: ' + e.message);
    }
};
