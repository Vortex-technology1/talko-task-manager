// ============================================================
// pages/p/[companyId]/[slug].js — TALKO Public Landing Page
// Vercel Dynamic Route: читає HTML з Firebase Storage і рендерить
// Підключає AI чат-воронку як overlay
// ============================================================

const admin = require('firebase-admin');

if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch (e) {}
    }
    if (pk && pk.includes('\\n')) pk = pk.replace(/\\n/g, '\n');
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: pk || undefined,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'task-manager-44e84.firebasestorage.app',
    });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = async function handler(req, res) {
    const { companyId, slug } = req.query;

    if (!companyId || !slug) {
        return res.status(400).send('<h1>Невірний URL</h1>');
    }

    try {
        // Find landing page by slug
        const snap = await db.collection('companies').doc(companyId)
            .collection('landingPages')
            .where('slug', '==', slug)
            .where('status', '==', 'active')
            .limit(1)
            .get();

        if (snap.empty) {
            return res.status(404).send(renderNotFound());
        }

        const page = { id: snap.docs[0].id, ...snap.docs[0].data() };

        // Load HTML from Storage or Firestore
        let htmlContent = '';

        if (page.htmlStoragePath) {
            try {
                const file = bucket.file(page.htmlStoragePath);
                const [exists] = await file.exists();
                if (exists) {
                    const [content] = await file.download();
                    htmlContent = content.toString('utf8');
                }
            } catch (e) {
                console.error('Storage read error:', e);
            }
        }

        // Fallback to Firestore preview
        if (!htmlContent && page.htmlContent) {
            htmlContent = page.htmlContent;
        }

        if (!htmlContent) {
            return res.status(404).send(renderNotFound());
        }

        // Get funnel data if attached
        let funnelData = null;
        if (page.funnelId) {
            const funnelDoc = await db.collection('companies').doc(companyId)
                .collection('funnels').doc(page.funnelId).get();
            if (funnelDoc.exists) {
                funnelData = { id: funnelDoc.id, ...funnelDoc.data() };
                // Don't expose steps with AI prompts to client — only safe fields
                funnelData = {
                    id: funnelData.id,
                    name: funnelData.name,
                    calendlyUrl: funnelData.calendlyUrl || null,
                    steps: (funnelData.steps || []).map(s => ({
                        id: s.id, type: s.type, name: s.name,
                        message: s.message, options: s.options,
                        saveAs: s.saveAs, nextStep: s.nextStep,
                        aiProvider: s.aiProvider,
                        // systemPrompt intentionally excluded — stays server-side
                    }))
                };
            }
        }

        // Inject TALKO funnel overlay into HTML
        const injectedHtml = injectFunnelOverlay(htmlContent, funnelData, companyId, page);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        return res.status(200).send(injectedHtml);

    } catch (error) {
        console.error('Landing page error:', error);
        return res.status(500).send('<h1>Помилка сервера</h1>');
    }
};

function injectFunnelOverlay(html, funnelData, companyId, page) {
    const funnelJson = funnelData ? JSON.stringify(funnelData) : 'null';
    const companyJson = JSON.stringify(companyId);

    const overlay = `
<!-- TALKO Funnel Overlay -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<style>
    #talkoChatBubbleFixed {
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        width: 60px; height: 60px;
        background: linear-gradient(135deg, #16a34a, #22c55e);
        border-radius: 50%; cursor: pointer;
        box-shadow: 0 4px 20px rgba(34,197,94,0.45);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.6rem; transition: transform 0.2s;
        animation: bubblePulse 2s ease-in-out infinite;
    }
    #talkoChatBubbleFixed:hover { transform: scale(1.1); }
    @keyframes bubblePulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(34,197,94,0.45); }
        50% { box-shadow: 0 4px 32px rgba(34,197,94,0.7); }
    }
    .talko-chat-container {
        position: fixed; bottom: 24px; right: 24px; z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: none;
    }
    .talko-chat-window {
        width: 340px; max-height: 520px; background: white;
        border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        display: flex; flex-direction: column; overflow: hidden;
        animation: chatSlideIn 0.3s ease;
    }
    .talko-chat-header {
        background: linear-gradient(135deg, #16a34a, #22c55e);
        color: white; padding: 1rem;
        display: flex; justify-content: space-between; align-items: center;
        flex-shrink: 0;
    }
    .talko-chat-messages {
        flex: 1; overflow-y: auto; padding: 0.75rem;
        display: flex; flex-direction: column; gap: 0.6rem;
        min-height: 200px; max-height: 320px; background: #f9fafb;
    }
    .talko-chat-input { padding: 0.6rem; border-top: 1px solid #f0f0f0; background: white; flex-shrink: 0; }
    .chat-msg-bot { background: white; border-radius: 12px 12px 12px 4px; padding: 0.6rem 0.75rem; max-width: 85%; font-size: 0.85rem; color: #1a1a1a; box-shadow: 0 1px 4px rgba(0,0,0,0.07); align-self: flex-start; }
    .chat-msg-user { background: #22c55e; color: white; border-radius: 12px 12px 4px 12px; padding: 0.6rem 0.75rem; max-width: 85%; font-size: 0.85rem; align-self: flex-end; }
    .chat-btn { background: white; border: 2px solid #22c55e; color: #16a34a; padding: 0.5rem 0.75rem; border-radius: 20px; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.15s; display: inline-block; margin: 2px; }
    .chat-btn:hover { background: #22c55e; color: white; }
    .chat-input-field { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 0.85rem; outline: none; box-sizing: border-box; }
    .chat-input-field:focus { border-color: #22c55e; }
    .chat-send-btn { background: #22c55e; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    @keyframes chatSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>

<!-- Chat bubble -->
<div id="talkoChatBubbleFixed" onclick="talkOpenChat()" title="Записатися">💬</div>

<!-- Chat window container -->
<div class="talko-chat-container" id="talkoChatContainer">
    <div class="talko-chat-window">
        <div class="talko-chat-header">
            <div>
                <div style="font-weight:700;font-size:0.95rem;" id="talkoChatTitle">Консультант</div>
                <div style="font-size:0.75rem;opacity:0.85;">🟢 Онлайн</div>
            </div>
            <button onclick="talkCloseChat()" style="background:rgba(255,255,255,0.2);border:none;color:white;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div class="talko-chat-messages" id="talkoChatMessages"></div>
        <div class="talko-chat-input" id="talkoChatInput"></div>
    </div>
</div>

<script>
(function() {
    const FUNNEL = ${funnelJson};
    const COMPANY_ID = ${companyJson};

    if (!FUNNEL || !FUNNEL.steps || FUNNEL.steps.length === 0) return;

    // Update title
    const titleEl = document.getElementById('talkoChatTitle');
    if (titleEl) titleEl.textContent = FUNNEL.name || 'Консультант';

    // Firebase init
    const firebaseConfig = {
        apiKey: "AIzaSyD1oBJuuFiVVo4HHjjeb81IhGEt1oz4Ydc",
        authDomain: "task-manager-44e84.firebaseapp.com",
        projectId: "task-manager-44e84",
        storageBucket: "task-manager-44e84.firebasestorage.app",
        messagingSenderId: "181519398491",
        appId: "1:181519398491:web:baa17a9a88f637ee94717e"
    };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    let chatStarted = false;
    let currentStepIdx = 0;
    let leadData = {};

    window.talkOpenChat = function() {
        document.getElementById('talkoChatBubbleFixed').style.display = 'none';
        document.getElementById('talkoChatContainer').style.display = 'block';
        if (!chatStarted) { chatStarted = true; executeStep(0); }
    };

    window.talkCloseChat = function() {
        document.getElementById('talkoChatContainer').style.display = 'none';
        document.getElementById('talkoChatBubbleFixed').style.display = 'flex';
    };

    // Auto-open on CTA click
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-talko-funnel="open"]')) {
            talkOpenChat();
        }
    });

    // Auto-open after 5 seconds
    setTimeout(() => {
        if (!chatStarted) talkOpenChat();
    }, 5000);

    const steps = FUNNEL.steps || [];

    function getStepIdx(stepId) {
        return steps.findIndex(s => s.id === stepId);
    }

    function addBotMsg(text) {
        return new Promise(resolve => {
            const msgs = document.getElementById('talkoChatMessages');
            if (!msgs) return resolve();
            const typing = document.createElement('div');
            typing.className = 'chat-msg-bot';
            typing.innerHTML = '<span style="opacity:0.4">• • •</span>';
            msgs.appendChild(typing);
            msgs.scrollTop = msgs.scrollHeight;
            setTimeout(() => { typing.textContent = text; msgs.scrollTop = msgs.scrollHeight; resolve(); }, 700);
        });
    }

    function addUserMsg(text) {
        const msgs = document.getElementById('talkoChatMessages');
        if (!msgs) return;
        const el = document.createElement('div');
        el.className = 'chat-msg-user';
        el.textContent = text;
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function setInput(html) {
        const el = document.getElementById('talkoChatInput');
        if (el) el.innerHTML = html;
    }

    async function executeStep(idx) {
        const step = steps[idx];
        if (!step) { await saveLead(); return; }
        currentStepIdx = idx;

        const nextIdx = step.nextStep ? getStepIdx(step.nextStep) : idx + 1;
        const safeNext = nextIdx >= 0 ? nextIdx : idx + 1;

        if (step.type === 'message') {
            await addBotMsg(step.message || '...');
            setInput('<div style="text-align:center;"><button class="chat-btn" onclick="window._talkoNext()">Далі →</button></div>');
            window._talkoNext = () => executeStep(safeNext);
        }

        else if (step.type === 'buttons') {
            await addBotMsg(step.message || 'Оберіть:');
            const opts = step.options || [];
            setInput('<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:4px 0;">' +
                opts.map((o, i) => '<button class="chat-btn" onclick="window._talkoOpt(' + i + ')">' + escH(o.text) + '</button>').join('') + '</div>');
            window._talkoOpt = (i) => {
                const opt = opts[i];
                addUserMsg(opt.text);
                leadData['choice_' + step.id] = opt.text;
                const ni = opt.nextStep ? getStepIdx(opt.nextStep) : idx + 1;
                executeStep(ni >= 0 ? ni : idx + 1);
            };
        }

        else if (['text_input','phone','email'].includes(step.type)) {
            await addBotMsg(step.message || (step.type === 'phone' ? 'Ваш телефон?' : step.type === 'email' ? 'Ваш email?' : 'Ваша відповідь?'));
            const iType = step.type === 'phone' ? 'tel' : step.type === 'email' ? 'email' : 'text';
            const saveKey = step.saveAs || step.type;
            setInput('<div style="display:flex;gap:6px;"><input type="' + iType + '" class="chat-input-field" id="talkoInput" placeholder="' + (step.type === 'phone' ? '+380...' : '') + '"><button class="chat-send-btn" onclick="window._talkoSubmit()">→</button></div>');
            const inp = document.getElementById('talkoInput');
            if (inp) inp.focus();
            window._talkoSubmit = () => {
                const val = (document.getElementById('talkoInput') || {}).value?.trim();
                if (!val) return;
                addUserMsg(val);
                leadData[saveKey] = val;
                setInput('');
                executeStep(safeNext);
            };
            if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') window._talkoSubmit(); });
        }

        else if (step.type === 'ai_response') {
            await addBotMsg('Аналізую...');
            try {
                const r = await fetch('/api/funnel-ai', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ companyId: COMPANY_ID, stepId: step.id, leadData, provider: step.aiProvider || 'openai' })
                });
                const data = await r.json();
                const msgs = document.getElementById('talkoChatMessages');
                if (msgs) { const el = document.createElement('div'); el.className='chat-msg-bot'; el.textContent=data.response||'...'; msgs.appendChild(el); msgs.scrollTop=msgs.scrollHeight; }
            } catch(e) {
                const msgs = document.getElementById('talkoChatMessages');
                if (msgs) { const el = document.createElement('div'); el.className='chat-msg-bot'; el.textContent='Вибачте, спробуйте ще раз.'; msgs.appendChild(el); }
            }
            setInput('<div style="text-align:center;"><button class="chat-btn" onclick="window._talkoNext()">Далі →</button></div>');
            window._talkoNext = () => executeStep(safeNext);
        }

        else if (step.type === 'calendly') {
            await addBotMsg(step.message || 'Оберіть зручний час:');
            const url = FUNNEL.calendlyUrl;
            if (url) {
                setInput('<div style="text-align:center;padding:4px 0;"><a href="' + url + '" target="_blank" style="display:inline-block;background:#22c55e;color:white;padding:0.6rem 1.25rem;border-radius:20px;text-decoration:none;font-weight:700;font-size:0.88rem;">📅 Записатися</a></div>');
            }
            await saveLead();
        }

        else if (step.type === 'end') {
            await addBotMsg(step.message || 'Дякуємо! Ми зв\'яжемося з вами найближчим часом. 🙏');
            setInput('');
            await saveLead();
        }
    }

    async function saveLead() {
        if (!COMPANY_ID || !FUNNEL.id) return;
        try {
            const base = db.collection('companies').doc(COMPANY_ID);
            const now = firebase.firestore.Timestamp.now();

            // Check existing contact by phone
            let contactId = null;
            if (leadData.phone) {
                const ex = await base.collection('contacts').where('phone','==',leadData.phone).limit(1).get();
                if (!ex.empty) {
                    contactId = ex.docs[0].id;
                    await base.collection('contacts').doc(contactId).update({ variables: Object.assign({}, ex.docs[0].data().variables || {}, leadData), lastActivity: now });
                }
            }
            if (!contactId) {
                const ref = await base.collection('contacts').add({
                    name: leadData.name || '', phone: leadData.phone || '', email: leadData.email || '',
                    source: 'web', flowId: FUNNEL.id, variables: leadData,
                    tags: ['лід','сайт'], status: 'active',
                    lastActivity: now, createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                contactId = ref.id;
            }

            // Get default pipeline
            const pSnap = await base.collection('pipelines').where('isDefault','==',true).limit(1).get();
            if (!pSnap.empty) {
                await base.collection('deals').add({
                    title: (leadData.name || leadData.phone || 'Лід') + ' — ' + (FUNNEL.name || 'Сайт'),
                    contactId, pipelineId: pSnap.docs[0].id, stage: 'new',
                    source: 'web', funnelId: FUNNEL.id,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Increment funnel leads count
            await base.collection('funnels').doc(FUNNEL.id).update({
                leadsCount: firebase.firestore.FieldValue.increment(1)
            });
        } catch(e) { console.error('saveLead:', e); }
    }

    function escH(s) { return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
})();
</script>`;

    // Inject before </body>
    if (html.includes('</body>')) {
        return html.replace('</body>', overlay + '</body>');
    }
    return html + overlay;
}

function renderNotFound() {
    return `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><title>Сторінку не знайдено</title>
<style>body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;color:#1a1a1a;text-align:center;}</style>
</head>
<body>
<div>
    <div style="font-size:3rem;margin-bottom:1rem;">😔</div>
    <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Сторінку не знайдено</h1>
    <p style="color:#6b7280;">Можливо, вона деактивована або видалена.</p>
</div>
</body></html>`;
}
