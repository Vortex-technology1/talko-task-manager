// ============================================================
// TALKO Telegram Bot — Vercel Serverless Function
// ============================================================
// Webhook: POST /api/telegram
// Notify:  POST /api/telegram?action=notify  (from Cloud Functions)
//
// Env vars (Vercel → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN        — from @BotFather
//   FIREBASE_PROJECT_ID       — task-manager-44e84
//   FIREBASE_CLIENT_EMAIL     — from service account JSON
//   FIREBASE_PRIVATE_KEY      — base64(private_key from JSON)
// ============================================================

const admin = require('firebase-admin');

// --- Firebase ---
if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // Try base64 decode first
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
    }
    // Handle escaped newlines from env vars
    if (pk && pk.includes('\\n')) {
        pk = pk.replace(/\\n/g, '\n');
    }
    
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: pk || undefined,
        }),
    });
}
const db = admin.firestore();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ========================
//  TELEGRAM API
// ========================
async function tg(method, body) {
    return fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).then(r => r.json());
}
const send = (chatId, text) => tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });

// ========================
//  USER LOOKUP
// ========================
async function findByChatId(chatId) {
    const companies = await db.collection('companies').get();
    for (const c of companies.docs) {
        const snap = await c.ref.collection('users')
            .where('telegramChatId', '==', String(chatId)).limit(1).get();
        if (!snap.empty) {
            const d = snap.docs[0];
            return { uid: d.id, cid: c.id, data: d.data(), ref: d.ref };
        }
    }
    return null;
}

async function findByCode(code) {
    const companies = await db.collection('companies').get();
    for (const c of companies.docs) {
        const snap = await c.ref.collection('users')
            .where('telegramCode', '==', code).limit(1).get();
        if (!snap.empty) {
            const d = snap.docs[0];
            return { uid: d.id, cid: c.id, data: d.data(), ref: d.ref };
        }
    }
    return null;
}

async function findByEmail(email) {
    const companies = await db.collection('companies').get();
    for (const c of companies.docs) {
        const snap = await c.ref.collection('users')
            .where('email', '==', email.toLowerCase()).limit(1).get();
        if (!snap.empty) {
            const d = snap.docs[0];
            return { uid: d.id, cid: c.id, data: d.data(), ref: d.ref };
        }
    }
    return null;
}

async function findAssignee(cid, q) {
    if (!q) return null;
    const low = q.toLowerCase().trim();
    const snap = await db.collection('companies').doc(cid).collection('users').get();
    let best = null;
    for (const d of snap.docs) {
        const u = d.data();
        const n = (u.name || '').toLowerCase();
        if (n === low) return { id: d.id, ...u };
        if (n.includes(low) || low.includes(n.split(' ')[0])) best = { id: d.id, ...u };
    }
    return best;
}

// ========================
//  PARSE TASK
// ========================
function parseTask(text) {
    let msg = text.replace(/@\w+bot\b/gi, '').trim();

    // @Виконавець
    let who = null;
    const wm = msg.match(/@([А-Яа-яІіЇїЄєҐґA-Za-z_]+)/);
    if (wm) { who = wm[1]; msg = msg.replace(wm[0], '').trim(); }

    // Дедлайн
    let date = null;
    const dd = [
        { r: /до\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/i, f: m => `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}` },
        { r: /до\s+(\d{1,2})\.(\d{1,2})/i, f: m => { const y = new Date().getFullYear(); return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; }},
        { r: /завтра/i, f: () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; }},
        { r: /сьогодні/i, f: () => new Date().toISOString().split('T')[0] },
        { r: /післязавтра/i, f: () => { const d = new Date(); d.setDate(d.getDate()+2); return d.toISOString().split('T')[0]; }},
    ];
    for (const p of dd) { const m = msg.match(p.r); if (m) { date = p.f(m); msg = msg.replace(m[0], '').trim(); break; }}

    // Пріоритет
    let prio = 'medium';
    if (msg.includes('!!!')) { prio = 'high'; msg = msg.replace('!!!','').trim(); }
    else if (msg.includes('!')) { prio = 'low'; msg = msg.replace(/!+/g,'').trim(); }

    // Час
    let time = '18:00';
    const tm = msg.match(/[ов]\s*(\d{1,2}):(\d{2})/);
    if (tm) { time = `${tm[1].padStart(2,'0')}:${tm[2]}`; msg = msg.replace(tm[0],'').trim(); }

    return { title: msg.replace(/\s+/g,' ').trim(), who, date, time, prio };
}

// ========================
//  /start CODE — підключення через TALKO UI
// ========================
async function cmdStart(chatId, tgId, tgUser, args) {
    // /start ABCD1234 — код з TALKO Профіль → Telegram
    if (args && args.length >= 6) {
        const user = await findByCode(args);
        if (user) {
            await user.ref.update({
                telegramChatId: String(chatId),
                telegramUserId: String(tgId),
                telegramUsername: tgUser || '',
            });
            return send(chatId,
                `✅ <b>Telegram підключено!</b>\n\n` +
                `👤 ${user.data.name || user.data.email}\n\n` +
                `Тепер ви отримуватимете сповіщення:\n` +
                `• 📥 Нове завдання\n` +
                `• ✅ Завдання виконано\n` +
                `• 🔍 На перевірку\n` +
                `• ⚡ Процес просунувся\n\n` +
                `Також можете ставити завдання прямо тут — /help`
            );
        }
        return send(chatId, '❌ Код не знайдено.\nСпробуйте заново: TALKO → Профіль → Telegram');
    }

    return send(chatId,
        '👋 <b>TALKO Task Manager</b>\n\n' +
        '<b>Підключення (2 способи):</b>\n\n' +
        '1️⃣ Через TALKO:\nПрофіль → Telegram → "Підключити"\n\n' +
        '2️⃣ Тут: <code>/connect ваш@email.com</code>\n\n' +
        'Після підключення:\n• Отримуєте push-сповіщення\n• Ставите завдання з чату\n• Моніторите команду\n\n/help — деталі'
    );
}

// ========================
//  /connect email
// ========================
async function cmdConnect(chatId, tgId, tgUser, email) {
    if (!email || !email.includes('@'))
        return send(chatId, '❌ <code>/connect ваш@email.com</code>');

    const user = await findByEmail(email);
    if (!user)
        return send(chatId, `❌ <b>${email}</b> не знайдено в TALKO.`);

    await user.ref.update({
        telegramChatId: String(chatId),
        telegramUserId: String(tgId),
        telegramUsername: tgUser || '',
    });
    return send(chatId, `✅ Підключено! 👤 ${user.data.name || email}\n\nТепер отримуєте сповіщення. /help — як ставити завдання`);
}

// ========================
//  /today /overdue /team
// ========================
async function cmdToday(chatId, u) {
    const today = new Date().toISOString().split('T')[0];
    const snap = await db.collection('companies').doc(u.cid)
        .collection('tasks').where('assigneeId','==',u.uid).where('status','in',['new','progress']).get();
    const list = snap.docs.map(d => d.data()).filter(t => t.deadlineDate === today || !t.deadlineDate)
        .sort((a,b) => (a.deadlineTime||'').localeCompare(b.deadlineTime||''));
    if (!list.length) return send(chatId, '✅ На сьогодні чисто!');
    let msg = `📋 <b>Сьогодні (${list.length}):</b>\n\n`;
    list.forEach(t => {
        const tm = t.deadlineTime ? ` ${t.deadlineTime}` : '';
        const p = t.priority==='high'?'🔴':t.priority==='low'?'🟢':'🟡';
        msg += `${p} ${t.title}${tm}\n`;
    });
    return send(chatId, msg);
}

async function cmdOverdue(chatId, u) {
    const today = new Date().toISOString().split('T')[0];
    const snap = await db.collection('companies').doc(u.cid)
        .collection('tasks').where('status','in',['new','progress']).get();
    const list = snap.docs.map(d => d.data()).filter(t => t.deadlineDate && t.deadlineDate < today);
    if (!list.length) return send(chatId, '✅ Прострочених немає!');
    const byP = {};
    list.forEach(t => { const n=t.assigneeName||'—'; (byP[n]=byP[n]||[]).push(t); });
    let msg = `⚠️ <b>Прострочено (${list.length}):</b>\n\n`;
    Object.entries(byP).forEach(([n,ts]) => {
        msg += `<b>${n}</b> (${ts.length}):\n`;
        ts.slice(0,3).forEach(t => msg += `  • ${t.title}\n`);
        if (ts.length>3) msg += `  +${ts.length-3} ще\n`;
        msg += '\n';
    });
    return send(chatId, msg);
}

async function cmdTeam(chatId, u) {
    const today = new Date().toISOString().split('T')[0];
    const snap = await db.collection('companies').doc(u.cid)
        .collection('tasks').where('status','in',['new','progress']).get();
    const byP = {};
    snap.docs.forEach(d => {
        const t=d.data(); const n=t.assigneeName||'—';
        if(!byP[n]) byP[n]={a:0,o:0}; byP[n].a++;
        if(t.deadlineDate && t.deadlineDate<today) byP[n].o++;
    });
    let msg = '👥 <b>Команда:</b>\n\n';
    Object.entries(byP).sort((a,b)=>b[1].a-a[1].a).forEach(([n,d]) => {
        msg += `• <b>${n}</b>: ${d.a} завд.${d.o?` ⚠️${d.o} простр.`:''}\n`;
    });
    return send(chatId, msg);
}

// ========================
//  CREATE TASK
// ========================
async function createTask(u, p) {
    let aId = u.uid, aName = u.data.name || u.data.email;
    if (p.who) {
        const a = await findAssignee(u.cid, p.who);
        if (a) { aId = a.id; aName = a.name || a.email; }
    }
    const dt = p.date || new Date().toISOString().split('T')[0];
    const data = {
        title: p.title, function: '', projectId: '',
        assigneeId: aId, assigneeName: aName,
        deadlineDate: dt, deadlineTime: p.time, deadline: dt+'T'+p.time,
        estimatedTime: '', priority: p.prio, status: 'new',
        expectedResult: '', reportFormat: '', description: '',
        notifyOnComplete: [u.uid], notifyOnReminder: [u.uid],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdDate: new Date().toISOString().split('T')[0],
        creatorId: u.uid, creatorName: u.data.name || u.data.email,
        pinned: false, source: 'telegram',
    };
    await db.collection('companies').doc(u.cid).collection('tasks').add(data);
    return { aId, aName, ...data };
}

// ========================
//  PUSH NOTIFICATIONS
// ========================
//  Викликається через POST /api/telegram?action=notify
//  Body: { type, userId, companyId, taskTitle, ... }
//  АБО напряму: notifyUser(cid, uid, type, data)

async function notifyUser(cid, uid, type, data) {
    try {
        const doc = await db.collection('companies').doc(cid).collection('users').doc(uid).get();
        if (!doc.exists) return;
        const chatId = doc.data().telegramChatId;
        if (!chatId) return; // Telegram не підключено — тихо пропускаємо

        const msgs = {
            new_task:       `📥 <b>Нове завдання</b>\n\n${data.taskTitle}\n\nВід: ${data.creatorName||''}`,
            task_completed: `✅ <b>Виконано</b>\n\n${data.taskTitle}\n\nВиконав: ${data.assigneeName||''}`,
            task_review:    `🔍 <b>На перевірку</b>\n\n${data.taskTitle}\n\nВід: ${data.assigneeName||''}`,
            task_rejected:  `↩️ <b>Повернуто</b>\n\n${data.taskTitle}`,
            process_step:   `⚡ <b>Ваш крок в процесі</b>\n\n${data.processName||''}\nКрок: ${data.stepName||''}`,
            overdue:        `⏰ <b>Прострочено!</b>\n\n${data.taskTitle}`,
        };
        await send(chatId, msgs[type] || `📌 ${data.taskTitle||'Сповіщення'}`);
    } catch (e) {
        console.error('notifyUser:', e.message);
    }
}

// Notify всіх з масиву userIds
async function notifyUsers(cid, userIds, type, data) {
    if (!userIds?.length) return;
    await Promise.allSettled(userIds.map(uid => notifyUser(cid, uid, type, data)));
}

// ========================
//  WEBHOOK HANDLER
// ========================
module.exports = async function handler(req, res) {
    // Health check
    if (req.method === 'GET')
        return res.status(200).json({ ok: true, bot: 'TALKO' });

    // Push notification API (від Cloud Functions або TALKO backend)
    if (req.query?.action === 'notify') {
        try {
            const { type, userId, userIds, companyId, ...data } = req.body;
            if (userIds) await notifyUsers(companyId, userIds, type, data);
            else if (userId) await notifyUser(companyId, userId, type, data);
            return res.status(200).json({ ok: true });
        } catch (e) {
            return res.status(200).json({ ok: false, error: e.message });
        }
    }

    // Telegram webhook
    try {
        const msg = req.body?.message;
        if (!msg?.text) return res.status(200).json({ ok: true });

        const chatId = msg.chat.id;
        const tgId = msg.from.id;
        const tgUser = msg.from.username || '';
        const text = msg.text.trim();

        // --- Commands ---
        if (text.startsWith('/')) {
            const [rawCmd, ...rest] = text.split(/\s+/);
            const cmd = rawCmd.toLowerCase().replace(/@\w+/g, '');
            const args = rest.join(' ');

            if (cmd === '/start') { await cmdStart(chatId, tgId, tgUser, args); return res.status(200).json({ ok: true }); }
            if (cmd === '/connect') { await cmdConnect(chatId, tgId, tgUser, args); return res.status(200).json({ ok: true }); }
            if (cmd === '/help') {
                await send(chatId,
                    '📖 <b>Ставити завдання:</b>\n<code>Текст @Виконавець до ДД.ММ</code>\n\n' +
                    '<b>Приклади:</b>\n• <code>Звіт @Олена до 25.02</code>\n• <code>Матеріали @Сергій завтра !!!</code>\n• <code>Перевірка сьогодні о 14:00</code>\n\n' +
                    '!!! високий, ! низький\n\n' +
                    '/today — мої на сьогодні\n/overdue — прострочені\n/team — команда'
                );
                return res.status(200).json({ ok: true });
            }

            // Команди що потребують авторизації
            const u = await findByChatId(chatId);
            if (!u) { await send(chatId, '❌ Підключіть: TALKO → Профіль → Telegram\nАбо: /connect email'); return res.status(200).json({ ok: true }); }

            if (cmd === '/today') await cmdToday(chatId, u);
            else if (cmd === '/overdue') await cmdOverdue(chatId, u);
            else if (cmd === '/team') await cmdTeam(chatId, u);
            else await send(chatId, '❓ /help — список команд');

            return res.status(200).json({ ok: true });
        }

        // --- Створення завдання ---
        const u = await findByChatId(chatId);
        if (!u) {
            await send(chatId, '❌ Спочатку підключіть:\n1. TALKO → Профіль → Telegram\n2. Або: <code>/connect email</code>');
            return res.status(200).json({ ok: true });
        }

        const p = parseTask(text);
        if (!p.title || p.title.length < 2) {
            await send(chatId, '❓ Не зрозумів. /help — приклади');
            return res.status(200).json({ ok: true });
        }

        const task = await createTask(u, p);
        const dl = task.deadlineDate ? ` 📅 ${task.deadlineDate}` : '';
        const tm = task.deadlineTime !== '18:00' ? ` ⏰ ${task.deadlineTime}` : '';
        const pr = task.priority==='high'?'🔴':task.priority==='low'?'🟢':'🟡';
        await send(chatId, `✅ <b>Створено</b>\n\n${pr} ${task.title}\n👤 ${task.aName}${dl}${tm}`);

        // Push виконавцю якщо інша людина
        if (task.aId !== u.uid) {
            await notifyUser(u.cid, task.aId, 'new_task', {
                taskTitle: task.title,
                creatorName: u.data.name || u.data.email,
            });
        }

        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error('Bot error:', e);
        return res.status(200).json({ ok: true });
    }
};

// Export для Cloud Functions
module.exports.notifyUser = notifyUser;
module.exports.notifyUsers = notifyUsers;
