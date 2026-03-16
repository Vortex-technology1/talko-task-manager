// ============================================================
// api/stripe.js — TALKO Stripe Integration
//
// POST /api/stripe?action=create-session
//   body: { companyId, invoiceId?, bookingId?, amount, currency, description, clientEmail?, clientName?, successUrl?, cancelUrl? }
//   → { url: 'https://checkout.stripe.com/...' }
//
// POST /api/stripe?action=webhook
//   Stripe webhook → checkout.session.completed
//   → invoice.paid + finance_transaction + emitTalkoEvent(INVOICE_PAID)
// ============================================================

const Stripe       = require('stripe');
const admin        = require('firebase-admin');

// ── Firebase init ─────────────────────────────────────────
if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
    }
    pk = pk.replace(/\\n/g, '\n');
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId:   process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  pk || undefined,
            }),
        });
    } catch(e) {
        console.error('[stripe.js] Firebase init:', e.message);
    }
}

const db = admin.firestore();

// ── Stripe init ───────────────────────────────────────────
function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not set');
    return Stripe(key);
}

// ── Utils ─────────────────────────────────────────────────
function companyRef(companyId) {
    return db.collection('companies').doc(companyId);
}

// Stripe вимагає суму в найменших одиницях (центи/хелери)
// EUR: 1 EUR = 100 cents | CZK: 1 CZK = 100 haléřů (але CZK zero-decimal = false)
// Повний список zero-decimal currencies: https://stripe.com/docs/currencies#zero-decimal
const ZERO_DECIMAL = new Set(['BIF','CLP','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF']);

function toStripeAmount(amount, currency) {
    if (ZERO_DECIMAL.has((currency || '').toUpperCase())) return Math.round(amount);
    return Math.round(amount * 100);
}

// ── POST /api/stripe?action=create-session ────────────────
async function createSession(req, res) {
    // FIX S-01: перевірка Firebase ID token перед створенням Stripe сесії
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    let decodedUser = null;
    try {
        decodedUser = await admin.auth().verifyIdToken(authHeader.slice(7).trim());
    } catch(e) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const {
        companyId,
        invoiceId,
        bookingId,
        amount,
        currency = 'EUR',
        description = 'Оплата',
        clientEmail,
        clientName,
        successUrl,
        cancelUrl,
    } = req.body || {};

    // FIX S-02: валідація amount — тип, мінімум і максимум
    const amt = parseFloat(amount);
    if (!companyId || isNaN(amt) || amt <= 0 || amt > 999999)
        return res.status(400).json({ error: 'Missing or invalid fields: companyId, amount (0 < amount ≤ 999999)' });

    const cur = (currency || 'EUR').toUpperCase();
    if (!['EUR', 'CZK', 'USD'].includes(cur))
        return res.status(400).json({ error: `Currency ${cur} not supported. Use EUR or CZK.` });

    // Перевіряємо що компанія існує І що юзер є її членом
    const compDoc = await companyRef(companyId).get();
    if (!compDoc.exists)
        return res.status(404).json({ error: 'Company not found' });

    // FIX S-01: перевірка приналежності до компанії
    try {
        const userDoc = await companyRef(companyId).collection('users').doc(decodedUser.uid).get();
        if (!userDoc.exists) return res.status(403).json({ error: 'Forbidden' });
    } catch(e) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // FIX S-03: валідація successUrl і cancelUrl — тільки https:// або http://
    function safeRedirectUrl(url, fallback) {
        if (!url) return fallback;
        try {
            const u = new URL(url);
            if (!['https:', 'http:'].includes(u.protocol)) return fallback;
            return url;
        } catch { return fallback; }
    }

    const stripe = getStripe();
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://taskmanagerai-vert.vercel.app';

    // FIX S-05: clientName обрізаємо до 500 символів (Stripe metadata limit)
    const safeClientName = clientName ? String(clientName).slice(0, 500) : undefined;

    // Метадані — все що потрібно webhook для автоматизації
    const metadata = {
        companyId,
        ...(invoiceId        ? { invoiceId }                : {}),
        ...(bookingId        ? { bookingId }                : {}),
        ...(safeClientName   ? { clientName: safeClientName } : {}),
    };

    const sessionParams = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
            price_data: {
                currency:     cur.toLowerCase(),
                unit_amount:  toStripeAmount(amt, cur),
                product_data: {
                    name: description,
                    ...(safeClientName ? { description: `Клієнт: ${safeClientName}` } : {}),
                },
            },
            quantity: 1,
        }],
        metadata,
        success_url: safeRedirectUrl(successUrl, `${origin}/?stripe=success&session_id={CHECKOUT_SESSION_ID}`),
        cancel_url:  safeRedirectUrl(cancelUrl,  `${origin}/?stripe=cancelled`),
        // Автоматично заповнюємо email клієнта якщо є
        ...(clientEmail ? { customer_email: clientEmail } : {}),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Зберігаємо stripeSessionId в інвойсі або записі бронювання
    if (invoiceId) {
        await companyRef(companyId).collection('finance_invoices').doc(invoiceId)
            .update({
                stripeSessionId:  session.id,
                stripeSessionUrl: session.url,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(() => {}); // non-critical
    }
    if (bookingId) {
        await companyRef(companyId).collection('booking_appointments').doc(bookingId)
            .update({
                stripeSessionId:  session.id,
                stripeSessionUrl: session.url,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(() => {}); // non-critical
    }

    return res.status(200).json({ url: session.url, sessionId: session.id });
}

// ── POST /api/stripe?action=webhook ──────────────────────
async function handleWebhook(req, res) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET not set');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const stripe = getStripe();
    const sig    = req.headers['stripe-signature'];

    // Stripe вимагає raw body для перевірки підпису
    const rawBody = req.body; // Vercel надає Buffer якщо Content-Type=application/json + NO bodyParser

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch(err) {
        console.error('[stripe webhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook signature error: ${err.message}` });
    }

    // Обробляємо тільки checkout.session.completed
    if (event.type !== 'checkout.session.completed') {
        return res.status(200).json({ received: true, skipped: event.type });
    }

    const session    = event.data.object;
    const metadata   = session.metadata || {};
    const companyId  = metadata.companyId;
    const invoiceId  = metadata.invoiceId;
    const bookingId  = metadata.bookingId;
    const clientName = metadata.clientName || session.customer_details?.name || '';
    const clientEmail= session.customer_details?.email || '';
    // FIX S-04: zero-decimal currencies (JPY, KRW) вже в мінімальних одиницях — не ділити на 100
    const currency   = (session.currency || 'eur').toUpperCase();
    const ZERO_DECIMAL_WH = new Set(['BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF']);
    const amount = ZERO_DECIMAL_WH.has(currency)
        ? session.amount_total
        : session.amount_total / 100;

    if (!companyId) {
        console.error('[stripe webhook] No companyId in metadata');
        return res.status(200).json({ received: true, error: 'No companyId' });
    }

    console.log(`[stripe webhook] checkout.session.completed | company=${companyId} invoice=${invoiceId} booking=${bookingId} amount=${amount} ${currency}`);

    const batch = db.batch();
    const now   = admin.firestore.FieldValue.serverTimestamp();
    const compRef = companyRef(companyId);

    // ── 1. Інвойс → статус «Оплачено» ─────────────────────
    let inv = null;
    if (invoiceId) {
        const invRef = compRef.collection('finance_invoices').doc(invoiceId);
        const invDoc = await invRef.get();
        if (invDoc.exists) {
            inv = { id: invoiceId, ...invDoc.data() };
            // Не перезаписуємо вже оплачений
            if (inv.status !== 'paid') {
                batch.update(invRef, {
                    status:           'paid',
                    paidAt:           now,
                    paidVia:          'stripe',
                    stripeSessionId:  session.id,
                    updatedAt:        now,
                });
            }
        }
    }

    // ── 2. Бронювання → статус «Підтверджено» ──────────────
    let appt = null;
    if (bookingId) {
        const apptRef = compRef.collection('booking_appointments').doc(bookingId);
        const apptDoc = await apptRef.get();
        if (apptDoc.exists) {
            appt = { id: bookingId, ...apptDoc.data() };
            if (appt.status !== 'confirmed') {
                batch.update(apptRef, {
                    status:          'confirmed',
                    paidVia:         'stripe',
                    paidAt:          now,
                    stripeSessionId: session.id,
                    updatedAt:       now,
                });
            }
        }
    }

    // ── 3. Транзакція у Фінансах (прихід) ──────────────────
    const txRef = compRef.collection('finance_transactions').doc();
    const txDescription = invoiceId && inv
        ? `Stripe: ${inv.number || invoiceId} — ${clientName || inv.clientName || ''}`
        : bookingId && appt
            ? `Stripe: Бронювання ${appt.date || ''} ${appt.timeSlot || ''} — ${clientName}`
            : `Stripe: оплата — ${clientName}`;

    batch.set(txRef, {
        type:            'income',
        amount:          amount,
        currency:        currency,
        description:     txDescription,
        category:        'stripe_payment',
        source:          'stripe',
        stripeSessionId: session.id,
        ...(invoiceId  ? { invoiceId }  : {}),
        ...(bookingId  ? { bookingId }  : {}),
        ...(inv?.crmDealId ? { crmDealId: inv.crmDealId } : {}),
        clientName:      clientName,
        clientEmail:     clientEmail,
        createdAt:       now,
        updatedAt:       now,
    });

    // ── 4. CRM угода → «Виграно» (через event) ─────────────
    let dealId = inv?.crmDealId || appt?.crmDealId || null;

    if (dealId) {
        const dealRef = compRef.collection('crm_deals').doc(dealId);
        const dealDoc = await dealRef.get();
        if (dealDoc.exists && dealDoc.data().stage !== 'won') {
            batch.update(dealRef, {
                stage:     'won',
                payStatus: 'paid',
                updatedAt: now,
            });
            // Лог зміни стадії
            const histRef = dealRef.collection('history').doc();
            batch.set(histRef, {
                type:      'stage_changed',
                text:      `Stripe оплата → Виграно (${amount} ${currency})`,
                userId:    'stripe_webhook',
                createdAt: now,
            });
        }
    }

    // ── 5. Event для automation rules ──────────────────────
    if (invoiceId || dealId) {
        const eventRef = compRef.collection('events').doc();
        batch.set(eventRef, {
            type:      'invoice.paid',
            payload: {
                invoiceId:   invoiceId  || null,
                bookingId:   bookingId  || null,
                dealId:      dealId     || null,
                amount,
                currency,
                clientName,
                clientEmail,
                paidVia:     'stripe',
                sessionId:   session.id,
            },
            triggeredBy: 'stripe_webhook',
            processed:   false,
            createdAt:   now,
        });
    }

    // ── Commit all ──────────────────────────────────────────
    await batch.commit();

    // ── Telegram повідомлення ───────────────────────────────
    try {
        const compData = (await compRef.get()).data() || {};
        const telegramToken = compData.telegramBotToken;
        const telegramChatId = compData.telegramOwnerId || compData.telegramChatId;
        if (telegramToken && telegramChatId) {
            const msg = `💳 <b>Stripe оплата!</b>\n` +
                `Сума: <b>${amount} ${currency}</b>\n` +
                (clientName  ? `Клієнт: ${clientName}\n` : '') +
                (clientEmail ? `Email: ${clientEmail}\n`  : '') +
                (invoiceId   ? `Рахунок: ${inv?.number || invoiceId}\n` : '') +
                (bookingId   ? `Бронювання підтверджено\n` : '');
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: telegramChatId, text: msg, parse_mode: 'HTML' }),
            }).catch(() => {});
        }
    } catch(e) { /* non-critical */ }

    return res.status(200).json({ received: true });
}

// ── Main handler ──────────────────────────────────────────
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || '';

    try {
        if (req.method === 'POST' && action === 'create-session') {
            return await createSession(req, res);
        }
        if (req.method === 'POST' && action === 'webhook') {
            return await handleWebhook(req, res);
        }
        return res.status(400).json({ error: `Unknown action: ${action}` });
    } catch(e) {
        console.error('[stripe.js] Error:', e.message);
        return res.status(500).json({ error: e.message });
    }
};
