// ============================================================
// api/crm-reminders.js — CRM нагадування по nextContactDate
//
// ЗАПУСК: Vercel Cron щодня о 8:00 UTC (vercel.json)
//         або POST /api/crm-reminders (з CRON_SECRET у заголовку)
//
// ЛОГІКА:
//   1. Auth: перевірка CRON_SECRET
//   2. Читаємо всі компанії
//   3. Для кожної компанії:
//      a. Читаємо crm_deals де nextContactDate <= today і status='open'
//      b. Знаходимо telegramChatId власника/менеджерів
//      c. Надсилаємо Telegram повідомлення з переліком угод
//      d. Записуємо лог (щоб не дублювати)
//   4. Повертаємо звіт
// ============================================================

const admin = require('firebase-admin');

if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {} 
    }
    pk = pk.replace(/\\n/g, '\n');
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId:   process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey:  pk || undefined,
        }),
    });
}

const db = admin.firestore();

// ── Telegram helper ──────────────────────────────────────
async function tgSend(token, chatId, text) {
    if (!token || !chatId || !text) return false;
    try {
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id:    String(chatId),
                text:       text.slice(0, 4096),
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });
        const d = await r.json();
        if (!d.ok) console.warn('[crm-reminders] tgSend error:', d.description, 'chatId:', chatId);
        return d.ok;
    } catch(e) {
        console.error('[crm-reminders] tgSend fetch error:', e.message);
        return false;
    }
}

// ── Форматуємо список угод для Telegram ─────────────────
function formatDealsList(deals, emoji, header) {
    if (!deals.length) return '';
    const lines = deals.slice(0, 10).map(d => {
        const name = (d.clientName || d.title || 'Без імені').slice(0, 40);
        const phone = d.phone ? ` | ${d.phone}` : '';
        const date = d.nextContactDate ? ` 📅 ${d.nextContactDate}` : '';
        const amount = d.amount > 0 ? ` | ${d.amount.toLocaleString()} ${d.currency || 'UAH'}` : '';
        return `• ${name}${phone}${amount}${date}`;
    });
    const more = deals.length > 10 ? `\n  <i>...та ще ${deals.length - 10}</i>` : '';
    return `${emoji} <b>${header} (${deals.length}):</b>\n${lines.join('\n')}${more}`;
}

// ── Основна логіка для однієї компанії ──────────────────
async function processCompany(companyId, companyData) {
    const today = new Date().toISOString().split('T')[0];
    const compRef = db.collection('companies').doc(companyId);

    // Ідемпотентність — не надсилаємо двічі на день
    const logId = `crm_reminders_${today}`;
    const logRef = compRef.collection('_cron_logs').doc(logId);
    const logDoc = await logRef.get().catch(() => null);
    if (logDoc?.exists && logDoc.data()?.sent) {
        return { skipped: true, reason: 'already_sent_today' };
    }

    // Читаємо deals де nextContactDate <= today і статус не won/lost
    let dealsSnap;
    try {
        dealsSnap = await compRef.collection('crm_deals')
            .where('status', '==', 'open')
            .where('nextContactDate', '<=', today)
            .limit(200)
            .get();
    } catch(e) {
        // Якщо нема індексу — fallback: читаємо всі open і фільтруємо client-side
        console.warn('[crm-reminders] Index missing for company', companyId, '— fallback scan');
        try {
            dealsSnap = await compRef.collection('crm_deals')
                .where('status', '==', 'open')
                .limit(500)
                .get();
        } catch(e2) {
            console.error('[crm-reminders] deals fetch error:', companyId, e2.message);
            return { error: e2.message };
        }
    }

    if (!dealsSnap || dealsSnap.empty) return { sent: false, reason: 'no_open_deals' };

    const allDeals = dealsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Фільтруємо прострочені та сьогоднішні
    const overdue  = allDeals.filter(d =>
        d.nextContactDate && d.nextContactDate < today &&
        d.stage !== 'won' && d.stage !== 'lost'
    );
    const dueToday = allDeals.filter(d =>
        d.nextContactDate === today &&
        d.stage !== 'won' && d.stage !== 'lost'
    );

    if (overdue.length === 0 && dueToday.length === 0) {
        return { sent: false, reason: 'no_reminders' };
    }

    // Знаходимо Telegram токен і chatId
    // Шукаємо в: companyData.telegramBotToken, companyData.integrations.telegram
    const botToken = companyData.telegramBotToken
        || companyData.botToken
        || companyData.integrations?.telegram?.botToken
        || null;

    // chatId: власник компанії
    const chatIds = new Set();
    if (companyData.telegramChatId)             chatIds.add(String(companyData.telegramChatId));
    if (companyData.managerChatId)              chatIds.add(String(companyData.managerChatId));
    if (companyData.ownerTelegramId)            chatIds.add(String(companyData.ownerTelegramId));

    // Також шукаємо серед users компанії з telegramChatId
    try {
        const usersSnap = await compRef.collection('users')
            .where('role', 'in', ['owner', 'admin', 'manager'])
            .limit(10).get();
        usersSnap.docs.forEach(u => {
            const tid = u.data()?.telegramChatId || u.data()?.telegramId;
            if (tid) chatIds.add(String(tid));
        });
    } catch(e) { /* users collection може не існувати */ }

    if (chatIds.size === 0 || !botToken) {
        return { sent: false, reason: 'no_telegram_config', chatIds: chatIds.size, hasToken: !!botToken };
    }

    // Формуємо повідомлення
    const compName = (companyData.name || companyData.companyName || 'Ваша компанія').slice(0, 50);
    const parts = [];
    parts.push(`🏢 <b>${compName}</b> — CRM нагадування на ${today}`);
    parts.push('');

    const overdueText  = formatDealsList(overdue,  '🔴', 'Прострочені контакти');
    const todayText    = formatDealsList(dueToday, '📅', 'Контакти сьогодні');

    if (overdueText)  parts.push(overdueText);
    if (todayText)    { if (overdueText) parts.push(''); parts.push(todayText); }

    const total = overdue.length + dueToday.length;
    parts.push('');
    parts.push(`📊 Всього: <b>${total}</b> угод потребують уваги`);
    parts.push(`🔗 <a href="https://taskmanagerai-vert.vercel.app">Відкрити CRM →</a>`);

    const message = parts.join('\n');

    // Надсилаємо всім знайденим chatId
    let sentCount = 0;
    for (const chatId of chatIds) {
        const ok = await tgSend(botToken, chatId, message);
        if (ok) sentCount++;
    }

    // Записуємо лог
    await logRef.set({
        sent:      sentCount > 0,
        sentCount,
        chatIds:   [...chatIds],
        overdue:   overdue.length,
        dueToday:  dueToday.length,
        at:        admin.firestore.FieldValue.serverTimestamp(),
    }).catch(e => console.warn('[crm-reminders] log write error:', e.message));

    return { sent: sentCount > 0, sentCount, overdue: overdue.length, dueToday: dueToday.length };
}

// ── Main handler ─────────────────────────────────────────
module.exports = async (req, res) => {
    // Auth — CRON_SECRET або Vercel cron header
    const secret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization || '';
    const queryToken = req.query?.token || '';
    const isVercelCron = req.headers['x-vercel-cron'] === '1';

    if (!isVercelCron && secret) {
        const provided = authHeader.replace('Bearer ', '') || queryToken;
        if (provided !== secret) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const startTs = Date.now();
    console.log('[crm-reminders] Starting run at', new Date().toISOString());

    try {
        // Читаємо всі компанії (з лімітом — безпека)
        const companiesSnap = await db.collection('companies').limit(500).get();

        if (companiesSnap.empty) {
            return res.status(200).json({ ok: true, message: 'No companies found', duration: Date.now() - startTs });
        }

        const results = {};
        let totalSent = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        // Обробляємо паралельно — але не всі одразу (батчі по 10)
        const companies = companiesSnap.docs;
        const BATCH = 10;
        for (let i = 0; i < companies.length; i += BATCH) {
            const batch = companies.slice(i, i + BATCH);
            const batchResults = await Promise.allSettled(
                batch.map(doc => processCompany(doc.id, doc.data() || {}))
            );
            batchResults.forEach((r, idx) => {
                const cid = batch[idx].id;
                if (r.status === 'fulfilled') {
                    results[cid] = r.value;
                    if (r.value?.sent)    totalSent++;
                    if (r.value?.skipped) totalSkipped++;
                    if (r.value?.error)   totalErrors++;
                } else {
                    results[cid] = { error: r.reason?.message || 'unknown' };
                    totalErrors++;
                }
            });
        }

        // Cleanup старих _rate_limits (> 1 год) — fire-and-forget
        const _rlCutoff = admin.firestore.Timestamp.fromMillis(Date.now() - 3600000);
        db.collectionGroup('_rate_limits').where('windowStart', '<', _rlCutoff.toMillis()).limit(500).get()
            .then(snap => {
                if (snap.empty) return;
                const batch = db.batch();
                snap.docs.forEach(d => batch.delete(d.ref));
                return batch.commit();
            })
            .catch(e => console.warn('[crm-reminders] rate_limits cleanup:', e.message));

        const duration = Date.now() - startTs;
        console.log(`[crm-reminders] Done in ${duration}ms. Sent: ${totalSent}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);

        return res.status(200).json({
            ok: true,
            companies: companies.length,
            sent: totalSent,
            skipped: totalSkipped,
            errors: totalErrors,
            duration,
            results,
        });

    } catch(e) {
        console.error('[crm-reminders] Fatal error:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
    }
};
