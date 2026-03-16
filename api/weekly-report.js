// ============================================================
// api/weekly-report.js — Тижневий Telegram звіт власнику
//
// ЗАПУСК: Vercel Cron щонеділі 9:00 UTC
//         або POST /api/weekly-report (з CRON_SECRET у заголовку)
//
// ЛОГІКА:
//   1. Auth: перевірка CRON_SECRET
//   2. Читаємо всі компанії з Firestore
//   3. Для кожної компанії:
//      a. Знаходимо owner/manager з telegramChatId
//      b. Збираємо задачі за 7 днів
//      c. Читаємо 7 snapshots (якщо є) → delta з минулим тижнем
//      d. Топ-3 сигнали з ai_recommendations (критичні спочатку)
//      e. Надсилаємо Telegram повідомлення
//   4. Зберігаємо лог відправки
// ============================================================

const admin = require('firebase-admin');

// Firebase Admin init (singleton)
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

const db    = admin.firestore();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ─────────────────────────────────────────
// Telegram send helper
// ─────────────────────────────────────────
async function tgSend(chatId, text) {
    if (!TOKEN || !chatId) return;
    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id:    chatId,
                text:       text,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });
    } catch (e) {
        console.warn(`[WeeklyReport] tgSend failed for chatId ${chatId}:`, e.message);
    }
}

// ─────────────────────────────────────────
// Побудова звіту для однієї компанії
// ─────────────────────────────────────────
async function buildAndSendReport(companyId) {
    const now       = new Date();
    const todayStr  = now.toISOString().split('T')[0];
    const weekAgo   = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];

    const compRef = db.collection('companies').doc(companyId);

    // ── 0. Dedup guard: вже відправляли сьогодні? ────────
    try {
        const logDoc = await compRef.collection('weekly_report_log').doc(todayStr).get();
        if (logDoc.exists && logDoc.data()?.sentAt) {
            return { companyId, skipped: 'already_sent_today' };
        }
    } catch(e) { /* не критично — продовжуємо */ }

    // ── 1. Знаходимо owner/manager з telegramChatId ──────
    const usersSnap = await compRef.collection('users')
        .where('role', 'in', ['owner', 'manager'])
        .get();

    const recipients = usersSnap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter(u => u.telegramChatId);

    // Читаємо мову компанії як fallback
    let companyLang = 'ua';
    try {
        const compDoc = await compRef.get();
        companyLang = compDoc.data()?.language || compDoc.data()?.interfaceLang || 'ua';
    } catch(e) {}

    if (recipients.length === 0) return { companyId, skipped: 'no_telegram_recipients' };

    // ── 2. Задачі за цей тиждень ─────────────────────────
    // FIX W-02: фільтруємо по createdDate >= weekAgoStr замість limit(2000) всіх задач
    let tasksSnap;
    try {
        tasksSnap = await compRef.collection('tasks')
            .where('createdDate', '>=', weekAgoStr)
            .limit(500)
            .get();
    } catch(e) {
        // Fallback якщо немає індексу по createdDate
        tasksSnap = await compRef.collection('tasks').limit(500).get();
    }
    const allTasks  = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let created = 0, completed = 0, overdue = 0;
    const byPerson = {};

    allTasks.forEach(tk => {
        const name = tk.assigneeName || '—';
        if (!byPerson[name]) byPerson[name] = { done: 0, overdue: 0, active: 0 };

        if (tk.createdDate && tk.createdDate >= weekAgoStr) created++;

        if (tk.status === 'done' && tk.completedDate && tk.completedDate >= weekAgoStr) {
            completed++;
            byPerson[name].done++;
        }
        if (tk.status !== 'done' && tk.deadlineDate && tk.deadlineDate < todayStr) {
            overdue++;
            byPerson[name].overdue++;
        }
        if (tk.status !== 'done') byPerson[name].active++;
    });

    const efficiency = created > 0 ? Math.round((completed / created) * 100) : 0;

    // ── 3. Delta з минулим тижнем (через snapshots) ──────
    let delta = null;
    try {
        const [thisSnap, prevSnap] = await Promise.all([
            compRef.collection('snapshots').doc(todayStr).get(),
            compRef.collection('snapshots').doc(weekAgoStr).get(),
        ]);
        if (thisSnap.exists && prevSnap.exists) {
            const cur  = thisSnap.data().totals  || {};
            const prev = prevSnap.data().totals  || {};
            delta = {
                overdue:   (cur.overdue  || 0) - (prev.overdue  || 0),
                active:    (cur.active   || 0) - (prev.active   || 0),
                completed: (cur.doneToday|| 0) - (prev.doneToday|| 0),
            };
        }
    } catch(e) { /* snapshots можуть бути відсутні — не критично */ }

    // ── 4. Топ-3 активних рекомендації (критичні спочатку) ──
    let topSignals = [];
    try {
        const recsSnap = await compRef.collection('ai_recommendations')
            .where('dismissed', '==', false)
            .where('date', '==', todayStr)
            .get();

        if (recsSnap.empty) {
            // Якщо за сьогодні немає — беремо за останні 2 дні
            const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
            const recsYesterday = await compRef.collection('ai_recommendations')
                .where('dismissed', '==', false)
                .where('date', '>=', yesterday.toISOString().split('T')[0])
                .get();
            topSignals = recsYesterday.docs.map(d => d.data());
        } else {
            topSignals = recsSnap.docs.map(d => d.data());
        }

        // Сортуємо: critical спочатку, потім warning
        topSignals.sort((a, b) => {
            if (a.severity === 'critical' && b.severity !== 'critical') return -1;
            if (b.severity === 'critical' && a.severity !== 'critical') return 1;
            return 0;
        });
        topSignals = topSignals.slice(0, 3);
    } catch(e) { /* ai_recommendations може бути відсутня — не критично */ }

    // ── 5. Формуємо текст звіту ───────────────────────────
    const msg = _buildMessage({
        weekAgoStr, todayStr,
        created, completed, overdue, efficiency,
        byPerson, delta, topSignals,
    });

    // ── 6. Надсилаємо кожному отримувачу їхньою мовою ───
    const sent = [];
    for (const user of recipients) {
        // Мова: user.language → user.interfaceLang → companyLang → 'ua'
        const userLang = user.language || user.interfaceLang || companyLang || 'ua';
        const userMsg = userLang === 'ua' ? msg : _buildMessage({
            weekAgoStr, todayStr,
            created, completed, overdue, efficiency,
            byPerson, delta, topSignals,
            lang: userLang,
        });
        await tgSend(user.telegramChatId, userMsg);
        sent.push(user.uid);
    }

    // ── 7. Логуємо відправку ──────────────────────────────
    try {
        await compRef.collection('weekly_report_log').doc(todayStr).set({
            sentAt:     admin.firestore.FieldValue.serverTimestamp(),
            recipients: sent,
            weekFrom:   weekAgoStr,
            weekTo:     todayStr,
            stats:      { created, completed, overdue, efficiency },
        });
    } catch(e) { /* лог не критичний */ }

    return { companyId, sent: sent.length };
}

// ─────────────────────────────────────────
// Формування тексту повідомлення
// ─────────────────────────────────────────
function _buildMessage({ weekAgoStr, todayStr, created, completed, overdue, efficiency, byPerson, delta, topSignals, lang = 'ua' }) {

    // ── Переклади тексту звіту ──────────────────────────
    const T = {
        ua: {
            title:    '📈 <b>Тижневий звіт TALKO</b>',
            created:  '📝 Створено',
            done:     '✅ Виконано',
            overdue:  'Прострочені',
            eff:      'Ефективність',
            vsLast:   'Прострочені vs минулий тиждень',
            team:     '👥 Команда',
            signals:  '🔍 Операційні збої тижня',
            priority: '🎯 Пріоритет на тиждень',
            footer:   '— TALKO System',
        },
        ru: {
            title:    '📈 <b>Еженедельный отчёт TALKO</b>',
            created:  '📝 Создано',
            done:     '✅ Выполнено',
            overdue:  'Просроченные',
            eff:      'Эффективность',
            vsLast:   'Просроченные vs прошлая неделя',
            team:     '👥 Команда',
            signals:  '🔍 Операционные сбои недели',
            priority: '🎯 Приоритет на неделю',
            footer:   '— TALKO System',
        },
        en: {
            title:    '📈 <b>Weekly TALKO Report</b>',
            created:  '📝 Created',
            done:     '✅ Completed',
            overdue:  'Overdue',
            eff:      'Efficiency',
            vsLast:   'Overdue vs last week',
            team:     '👥 Team',
            signals:  '🔍 Operational issues this week',
            priority: '🎯 Priority for next week',
            footer:   '— TALKO System',
        },
        de: {
            title:    '📈 <b>Wöchentlicher TALKO-Bericht</b>',
            created:  '📝 Erstellt',
            done:     '✅ Erledigt',
            overdue:  'Überfällig',
            eff:      'Effizienz',
            vsLast:   'Überfällig vs letzte Woche',
            team:     '👥 Team',
            signals:  '🔍 Betriebliche Probleme der Woche',
            priority: '🎯 Priorität für nächste Woche',
            footer:   '— TALKO System',
        },
        cs: {
            title:    '📈 <b>Týdenní zpráva TALKO</b>',
            created:  '📝 Vytvořeno',
            done:     '✅ Dokončeno',
            overdue:  'Po termínu',
            eff:      'Efektivita',
            vsLast:   'Po termínu vs minulý týden',
            team:     '👥 Tým',
            signals:  '🔍 Provozní problémy týdne',
            priority: '🎯 Priorita na příští týden',
            footer:   '— TALKO System',
        },
        pl: {
            title:    '📈 <b>Tygodniowy raport TALKO</b>',
            created:  '📝 Utworzone',
            done:     '✅ Ukończone',
            overdue:  'Po terminie',
            eff:      'Efektywność',
            vsLast:   'Po terminie vs poprzedni tydzień',
            team:     '👥 Zespół',
            signals:  '🔍 Problemy operacyjne tygodnia',
            priority: '🎯 Priorytet na następny tydzień',
            footer:   '— TALKO System',
        },
    };
    const tx = T[lang] || T['ua'];

    // Заголовок
    let msg = `${tx.title}\n`;
    msg += `📅 ${weekAgoStr} — ${todayStr}\n\n`;

    // KPI блок
    const overdueEmoji = overdue === 0 ? '✅' : overdue > 10 ? '🔴' : '⚠️';
    const effEmoji     = efficiency >= 80 ? '🟢' : efficiency >= 50 ? '🟡' : '🔴';

    msg += `${tx.created}: <b>${created}</b>\n`;
    msg += `${tx.done}: <b>${completed}</b>\n`;
    msg += `${overdueEmoji} ${tx.overdue}: <b>${overdue}</b>\n`;
    msg += `${effEmoji} ${tx.eff}: <b>${efficiency}%</b>\n`;

    // Delta з минулим тижнем
    if (delta) {
        const dOverdue = delta.overdue;
        const sign     = dOverdue > 0 ? '+' : '';
        const dEmoji   = dOverdue > 0 ? '📈' : dOverdue < 0 ? '📉' : '➡️';
        msg += `${dEmoji} ${tx.vsLast}: <b>${sign}${dOverdue}</b>\n`;
    }

    // По людях (топ-5)
    const sorted = Object.entries(byPerson)
        .filter(([, v]) => v.done > 0 || v.overdue > 0)
        .sort((a, b) => b[1].done - a[1].done)
        .slice(0, 5);

    if (sorted.length > 0) {
        msg += `\n<b>${tx.team}:</b>\n`;
        sorted.forEach(([name, s]) => {
            const warn = s.overdue > 0 ? ` ⚠️${s.overdue}` : '';
            msg += `• <b>${_esc(name)}</b>: ✅${s.done} | 📋${s.active}${warn}\n`;
        });
    }

    // Топ-3 сигнали з AI-діагностики
    if (topSignals.length > 0) {
        msg += `\n<b>${tx.signals}:</b>\n`;
        topSignals.forEach((sig, i) => {
            const icon = sig.severity === 'critical' ? '🔴' : '🟡';
            msg += `${icon} ${_esc(sig.signalText || sig.signal || '')}\n`;
            if (sig.action) msg += `   → ${_esc(sig.action)}\n`;
        });
    }

    // Рекомендований пріоритет на наступний тиждень
    const topCritical = topSignals.find(s => s.severity === 'critical');
    if (topCritical?.action) {
        msg += `\n<b>${tx.priority}:</b>\n${_esc(topCritical.action)}\n`;
    }

    msg += `\n<i>${tx.footer}</i>`;
    return msg;
}

function _esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ─────────────────────────────────────────
// ГОЛОВНИЙ HANDLER
// ─────────────────────────────────────────
module.exports = async (req, res) => {
    // FIX W-01: якщо CRON_SECRET не встановлено — endpoint відключений
    // Попередньо: if(cronSecret) → без змінної захист пропускався повністю
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        console.error('[WeeklyReport] CRON_SECRET not configured — endpoint disabled for security');
        return res.status(503).json({ ok: false, error: 'Not configured' });
    }
    const authHeader = req.headers['authorization'] || '';
    const providedSecret = authHeader.replace('Bearer ', '').trim();
    // Vercel Cron надсилає заголовок Authorization: Bearer <CRON_SECRET>
    if (providedSecret !== cronSecret) {
        return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // Перевірка що це GET або POST (Vercel Cron використовує GET)
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    console.log('[WeeklyReport] Starting weekly report run...');

    try {
        // Читаємо всі компанії (обмежуємо 100 для safety)
        const companiesSnap = await db.collection('companies').limit(100).get();

        if (companiesSnap.empty) {
            return res.status(200).json({ ok: true, processed: 0, message: 'No companies found' });
        }

        const results = [];

        // Обробляємо по черзі (не паралельно — щоб не перевантажити Telegram API)
        for (const doc of companiesSnap.docs) {
            try {
                const result = await buildAndSendReport(doc.id);
                results.push(result);
            } catch (e) {
                console.error(`[WeeklyReport] Error for company ${doc.id}:`, e.message);
                results.push({ companyId: doc.id, error: e.message });
            }
        }

        const sent    = results.filter(r => r.sent > 0).length;
        const skipped = results.filter(r => r.skipped).length;
        const errors  = results.filter(r => r.error).length;

        console.log(`[WeeklyReport] Done. Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);

        return res.status(200).json({
            ok: true,
            processed: companiesSnap.size,
            sent, skipped, errors,
            results,
        });

    } catch (e) {
        console.error('[WeeklyReport] Fatal error:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
    }
};
