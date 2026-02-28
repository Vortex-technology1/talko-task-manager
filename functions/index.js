const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// ===========================
// CONFIG
// ===========================
const REGION = 'europe-west1';

// Telegram token — зберігається в Firebase secrets
// Встановити: firebase functions:secrets:set TELEGRAM_BOT_TOKEN
function getTelegramToken() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('TELEGRAM_BOT_TOKEN not set! Run: firebase functions:secrets:set TELEGRAM_BOT_TOKEN');
        return '';
    }
    return token;
}

function getTelegramApi() {
    return `https://api.telegram.org/bot${getTelegramToken()}`;
}

// ===========================
// TELEGRAM HELPERS
// ===========================
async function sendTelegramMessage(chatId, text, opts = {}) {
    try {
        const response = await fetch(`${getTelegramApi()}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML',
                ...opts
            })
        });
        return response.json();
    } catch (error) {
        console.error('Telegram send error:', error);
        return null;
    }
}

async function answerCallbackQuery(callbackQueryId, text = '') {
    try {
        await fetch(`${getTelegramApi()}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: text,
                show_alert: !!text
            })
        });
    } catch (e) {
        console.error('answerCallbackQuery error:', e);
    }
}

async function editMessageText(chatId, messageId, text, opts = {}) {
    try {
        await fetch(`${getTelegramApi()}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: text,
                parse_mode: 'HTML',
                ...opts
            })
        });
    } catch (e) {
        console.error('editMessageText error:', e);
    }
}

function taskButtons(taskId, companyId) {
    return [
        [
            { text: '✅ Готово', callback_data: `done:${companyId}:${taskId}` },
            { text: '🔄 +1 день', callback_data: `postpone:${companyId}:${taskId}` },
        ],
        [
            { text: '📎 Деталі', callback_data: `details:${companyId}:${taskId}` },
            { text: '🚀 В роботу', callback_data: `progress:${companyId}:${taskId}` },
        ],
    ];
}

async function sendWithButtons(chatId, text, buttons) {
    return sendTelegramMessage(chatId, text, {
        reply_markup: { inline_keyboard: buttons }
    });
}

// ===========================
// SMART ASSIGN HELPER
// ===========================
async function getSmartAssignee(companyId, funcData) {
    if (!funcData?.assigneeIds?.length) return null;
    if (funcData.assigneeIds.length === 1) return funcData.assigneeIds[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const tasksSnap = await db.collection('companies').doc(companyId)
        .collection('tasks')
        .where('function', '==', funcData.name)
        .where('status', 'in', ['new', 'progress'])
        .get();

    const loads = {};
    funcData.assigneeIds.forEach(uid => { loads[uid] = 0; });

    tasksSnap.docs.forEach(d => {
        const t = d.data();
        if (loads[t.assigneeId] !== undefined) {
            loads[t.assigneeId]++;
            // Overdue weighs double
            if (t.deadlineDate && t.deadlineDate < todayStr) {
                loads[t.assigneeId]++;
            }
        }
    });

    const sorted = Object.entries(loads).sort((a, b) => a[1] - b[1]);
    return sorted[0][0];
}

// ===========================
// 1. НОВЕ ЗАВДАННЯ → Telegram з кнопками
// ===========================
exports.onNewTask = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .firestore.document('companies/{companyId}/tasks/{taskId}')
    .onCreate(async (snap, context) => {
        const task = snap.data();
        const { companyId, taskId } = context.params;

        if (task.source === 'telegram') return null;
        if (!task.assigneeId) return null;

        const userDoc = await db.collection('companies').doc(companyId)
            .collection('users').doc(task.assigneeId).get();

        if (!userDoc.exists || !userDoc.data().telegramChatId) return null;

        const chatId = userDoc.data().telegramChatId;
        const taskType = task.processId ? '🟣 Процес' : (task.regularTaskId ? '🟠 Регулярне' : '🟢 Завдання');

        const message = `
${taskType}: <b>${task.title}</b>

📅 Дедлайн: ${task.deadlineDate || '-'} ${task.deadlineTime || ''}
${task.expectedResult ? `\n📋 Очікуваний результат:\n${task.expectedResult}` : ''}
${task.description ? `\n📝 Опис:\n${task.description.substring(0, 500)}` : ''}
        `.trim();

        return sendWithButtons(chatId, message, taskButtons(taskId, companyId));
    });

// ===========================
// 2. ЗАВДАННЯ ВИКОНАНО → сповіщення
// ===========================
exports.onTaskCompleted = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .firestore.document('companies/{companyId}/tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const { companyId } = context.params;

        if (before.status === after.status || after.status !== 'done') return null;

        const notifyUsers = after.notifyOnComplete || [];
        if (notifyUsers.length === 0) return null;

        const usersToNotify = notifyUsers.filter(uid => uid !== after.assigneeId);

        for (const userId of usersToNotify) {
            const userDoc = await db.collection('companies').doc(companyId)
                .collection('users').doc(userId).get();

            if (!userDoc.exists || !userDoc.data().telegramChatId) continue;

            const chatId = userDoc.data().telegramChatId;
            const message = `
✅ <b>Завдання виконано!</b>

📌 ${after.title}
👤 Виконавець: ${after.assigneeName || 'Невідомо'}
📅 ${after.deadlineDate || ''}
            `.trim();

            await sendTelegramMessage(chatId, message);
        }

        return null;
    });

// ===========================
// 3. TELEGRAM WEBHOOK — реєстрація + CALLBACK QUERY HANDLER
// ===========================
exports.telegramWebhook = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .https.onRequest(async (req, res) => {
        if (req.method !== 'POST') {
            return res.status(200).send('TALKO Telegram Bot is running!');
        }

        const update = req.body;

        // ---- CALLBACK QUERY (кнопки в повідомленнях) ----
        if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message.chat.id;
            const messageId = cb.message.message_id;
            const data = cb.data; // format: "action:companyId:taskId"

            const parts = data.split(':');
            if (parts.length < 3) {
                await answerCallbackQuery(cb.id, '❌ Невідомна дія');
                return res.status(200).send('OK');
            }

            const [action, companyId, taskId] = parts;

            // Find user by telegramChatId
            let userId = null;
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users')
                .where('telegramChatId', '==', chatId.toString())
                .limit(1).get();

            if (!usersSnap.empty) {
                userId = usersSnap.docs[0].id;
            }

            const taskRef = db.collection('companies').doc(companyId)
                .collection('tasks').doc(taskId);
            const taskDoc = await taskRef.get();

            if (!taskDoc.exists) {
                await answerCallbackQuery(cb.id, '❌ Задачу не знайдено');
                return res.status(200).send('OK');
            }

            const task = taskDoc.data();

            try {
                if (action === 'done') {
                    // ✅ Завершити задачу
                    await taskRef.update({
                        status: 'done',
                        completedAt: admin.firestore.FieldValue.serverTimestamp(),
                        completedBy: userId,
                        completionSource: 'telegram'
                    });

                    await editMessageText(chatId, messageId,
                        `✅ <b>Виконано!</b>\n\n📌 ${task.title}\n⏰ ${new Date().toLocaleString('uk-UA')}`
                    );
                    await answerCallbackQuery(cb.id, '✅ Задачу завершено!');

                } else if (action === 'postpone') {
                    // 🔄 Перенести на +1 день
                    let newDate = task.deadlineDate;
                    if (newDate) {
                        const d = new Date(newDate + 'T12:00:00');
                        d.setDate(d.getDate() + 1);
                        newDate = d.toISOString().split('T')[0];
                    } else {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        newDate = d.toISOString().split('T')[0];
                    }

                    await taskRef.update({
                        deadlineDate: newDate,
                        deadline: newDate + 'T' + (task.deadlineTime || '18:00'),
                        overdueNotified: false,
                        sentReminders: []
                    });

                    // Decision log
                    if (userId) {
                        await db.collection('companies').doc(companyId)
                            .collection('decisions').add({
                                type: 'deadline_change',
                                details: {
                                    taskId, taskTitle: task.title,
                                    from: task.deadlineDate, to: newDate,
                                    source: 'telegram'
                                },
                                date: new Date().toISOString().split('T')[0],
                                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                                userId
                            }).catch(() => {});
                    }

                    await editMessageText(chatId, messageId,
                        `🔄 <b>Перенесено</b>\n\n📌 ${task.title}\n📅 Новий дедлайн: ${newDate}`,
                        { reply_markup: { inline_keyboard: taskButtons(taskId, companyId) } }
                    );
                    await answerCallbackQuery(cb.id, `📅 Перенесено на ${newDate}`);

                } else if (action === 'progress') {
                    // 🚀 В роботу
                    if (task.status === 'new') {
                        await taskRef.update({ status: 'progress' });
                    }

                    await editMessageText(chatId, messageId,
                        `🚀 <b>В роботі</b>\n\n📌 ${task.title}\n📅 Дедлайн: ${task.deadlineDate || '-'} ${task.deadlineTime || ''}`,
                        { reply_markup: { inline_keyboard: taskButtons(taskId, companyId) } }
                    );
                    await answerCallbackQuery(cb.id, '🚀 Взято в роботу');

                } else if (action === 'details') {
                    // 📎 Показати деталі
                    let details = `📎 <b>${task.title}</b>\n\n`;
                    details += `📅 Дедлайн: ${task.deadlineDate || '-'} ${task.deadlineTime || ''}\n`;
                    details += `📊 Статус: ${task.status}\n`;
                    details += `🔖 Пріоритет: ${task.priority || 'medium'}\n`;
                    if (task.function) details += `⚙️ Функція: ${task.function}\n`;
                    if (task.expectedResult) details += `\n📋 Очікуваний результат:\n${task.expectedResult}\n`;
                    if (task.description) details += `\n📝 Опис:\n${task.description.substring(0, 800)}\n`;
                    if (task.processObject) details += `\n🏷 Об'єкт: ${task.processObject}\n`;

                    await sendTelegramMessage(chatId, details);
                    await answerCallbackQuery(cb.id);
                }
            } catch (err) {
                console.error('Callback error:', err);
                await answerCallbackQuery(cb.id, '❌ Помилка: ' + err.message);
            }

            return res.status(200).send('OK');
        }

        // ---- TEXT MESSAGES (реєстрація) ----
        if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            const userId = update.message.from.id;

            if (text.startsWith('/start')) {
                const parts = text.split(' ');
                if (parts.length > 1) {
                    const registrationCode = parts[1];

                    const companiesSnap = await db.collection('companies').get();

                    for (const companyDoc of companiesSnap.docs) {
                        const usersSnap = await companyDoc.ref.collection('users')
                            .where('telegramCode', '==', registrationCode).get();

                        if (!usersSnap.empty) {
                            const userDoc = usersSnap.docs[0];
                            await userDoc.ref.update({
                                telegramChatId: chatId.toString(),
                                telegramUserId: userId.toString(),
                                telegramCode: null
                            });

                            await sendTelegramMessage(chatId,
                                '✅ <b>Успішно підключено!</b>\n\nТепер ви отримуватимете сповіщення про нові завдання.\n\nКнопки під кожним завданням:\n✅ Готово — завершити\n🔄 +1 день — перенести\n🚀 В роботу — взяти\n📎 Деталі — побачити опис'
                            );
                            return res.status(200).send('OK');
                        }
                    }

                    await sendTelegramMessage(chatId,
                        '❌ Код не знайдено або застарів.\n\nСпробуйте отримати новий код в TALKO System.'
                    );
                } else {
                    await sendTelegramMessage(chatId,
                        '👋 <b>Вітаю в TALKO Tasks!</b>\n\n' +
                        'Щоб підключити сповіщення, натисніть кнопку "Підключити Telegram" в налаштуваннях TALKO System.\n\n' +
                        'Доступні команди:\n/today — задачі на сьогодні\n/overdue — прострочені'
                    );
                }
            } else if (text === '/today' || text === '/overdue') {
                // Знаходимо юзера по chatId
                const companiesSnap = await db.collection('companies').get();
                for (const companyDoc of companiesSnap.docs) {
                    const companyId = companyDoc.id;
                    const uSnap = await companyDoc.ref.collection('users')
                        .where('telegramChatId', '==', chatId.toString()).limit(1).get();
                    if (uSnap.empty) continue;

                    const uid = uSnap.docs[0].id;
                    const todayStr = new Date().toISOString().split('T')[0];

                    const tasksSnap = await db.collection('companies').doc(companyId)
                        .collection('tasks')
                        .where('assigneeId', '==', uid)
                        .where('status', 'in', ['new', 'progress'])
                        .get();

                    const filtered = [];
                    tasksSnap.docs.forEach(d => {
                        const t = { id: d.id, ...d.data() };
                        if (text === '/today' && t.deadlineDate === todayStr) filtered.push(t);
                        if (text === '/overdue' && t.deadlineDate && t.deadlineDate < todayStr) filtered.push(t);
                    });

                    if (filtered.length === 0) {
                        await sendTelegramMessage(chatId, text === '/today'
                            ? '✅ На сьогодні завдань немає!'
                            : '✅ Прострочених немає!');
                    } else {
                        await sendTelegramMessage(chatId,
                            `📋 ${text === '/today' ? 'Сьогодні' : 'Прострочені'}: <b>${filtered.length}</b>`);
                        for (const t of filtered.slice(0, 10)) {
                            const pr = t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡';
                            await sendWithButtons(chatId,
                                `${pr} <b>${t.title}</b>\n📅 ${t.deadlineDate} ${t.deadlineTime || ''}`,
                                taskButtons(t.id, companyId)
                            );
                        }
                        if (filtered.length > 10) {
                            await sendTelegramMessage(chatId, `... ще ${filtered.length - 10}`);
                        }
                    }
                    break;
                }
            }
        }

        return res.status(200).send('OK');
    });

// ===========================
// 4. LEAD WEBHOOK
// ===========================
exports.leadWebhook = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .https.onRequest(async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') return res.status(200).send('');
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        try {
            const { companyId, apiKey, name, phone, email, source, message, processTemplate } = req.body;
            if (!companyId) return res.status(400).json({ error: 'companyId is required' });

            const companyDoc = await db.collection('companies').doc(companyId).get();
            if (!companyDoc.exists) return res.status(404).json({ error: 'Company not found' });

            const companyData = companyDoc.data();
            if (companyData.webhookApiKey && companyData.webhookApiKey !== apiKey) {
                return res.status(401).json({ error: 'Invalid API key' });
            }

            const now = new Date();
            const leadRef = await db.collection('companies').doc(companyId)
                .collection('leads').add({
                    name: name || 'Невідомий',
                    phone: phone || '', email: email || '',
                    source: source || 'Сайт', message: message || '',
                    status: 'new',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

            let templateToUse = null;
            const templateName = processTemplate || 'Обробка ліда';
            const templatesSnap = await db.collection('companies').doc(companyId)
                .collection('processTemplates').where('name', '==', templateName).limit(1).get();
            if (!templatesSnap.empty) {
                templateToUse = { id: templatesSnap.docs[0].id, ...templatesSnap.docs[0].data() };
            }

            let processId = null;
            const clientName = name || phone || 'Новий лід';

            if (templateToUse && templateToUse.steps && templateToUse.steps.length > 0) {
                const processRef = await db.collection('companies').doc(companyId)
                    .collection('processes').add({
                        name: `${templateToUse.name} - ${clientName}`,
                        templateId: templateToUse.id,
                        objectName: clientName,
                        leadId: leadRef.id,
                        status: 'active',
                        currentStep: 0,
                        stepResults: [],
                        history: [],
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        createdBy: 'webhook'
                    });
                processId = processRef.id;

                const firstStep = templateToUse.steps[0];
                const funcsSnap = await db.collection('companies').doc(companyId)
                    .collection('functions').where('name', '==', firstStep.function).limit(1).get();

                let assigneeId = null, assigneeName = '';
                if (!funcsSnap.empty) {
                    const funcData = { id: funcsSnap.docs[0].id, ...funcsSnap.docs[0].data() };
                    // Smart assign
                    if (firstStep.smartAssign !== false && funcData.assigneeIds?.length > 1) {
                        assigneeId = await getSmartAssignee(companyId, funcData);
                    } else {
                        assigneeId = funcData.assigneeIds?.[0] || null;
                    }
                    if (assigneeId) {
                        const uDoc = await db.collection('companies').doc(companyId)
                            .collection('users').doc(assigneeId).get();
                        if (uDoc.exists) assigneeName = uDoc.data().name || uDoc.data().email || '';
                    }
                }

                const deadline = new Date(now.getTime() + (firstStep.slaMinutes || 15) * 60 * 1000);

                // Context-rich instruction
                let instruction = firstStep.instruction || '';
                instruction = `[${clientName}]\n📞 ${phone || '-'}\n📧 ${email || '-'}\n💬 ${message || '-'}\n🔗 ${source || 'Сайт'}\n\n` + instruction;
                if (firstStep.expectedResult) instruction += `\n\n📋 Очікуваний результат: ${firstStep.expectedResult}`;
                if (firstStep.controlQuestion) instruction += `\n❓ Контрольне питання: ${firstStep.controlQuestion}`;

                await db.collection('companies').doc(companyId)
                    .collection('tasks').add({
                        title: `[${templateToUse.name}] ${firstStep.title || firstStep.function} - ${clientName}`,
                        function: firstStep.function,
                        assigneeId, assigneeName,
                        description: instruction,
                        instruction: instruction,
                        expectedResult: firstStep.expectedResult || 'Зв\'язатися з клієнтом',
                        deadlineDate: deadline.toISOString().split('T')[0],
                        deadlineTime: deadline.toTimeString().slice(0, 5),
                        deadline: admin.firestore.Timestamp.fromDate(deadline),
                        status: 'new', priority: 'high',
                        processId, processStep: 0,
                        processObject: clientName,
                        leadId: leadRef.id,
                        requireReview: firstStep.checkpoint || false,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        isAutoGenerated: true,
                        escalationEnabled: true,
                        escalationMinutes: firstStep.slaMinutes || 15
                    });
            } else {
                // Fallback: create simple task
                const funcsSnap = await db.collection('companies').doc(companyId)
                    .collection('functions').limit(1).get();

                let assigneeId = null, assigneeName = '', functionName = 'Адміністрування';
                if (!funcsSnap.empty) {
                    const funcData = funcsSnap.docs[0].data();
                    functionName = funcData.name;
                    if (funcData.assigneeIds?.length) {
                        assigneeId = funcData.assigneeIds[0];
                        const uDoc = await db.collection('companies').doc(companyId)
                            .collection('users').doc(assigneeId).get();
                        if (uDoc.exists) assigneeName = uDoc.data().name || uDoc.data().email || '';
                    }
                }

                const deadline = new Date(now.getTime() + 15 * 60 * 1000);

                await db.collection('companies').doc(companyId)
                    .collection('tasks').add({
                        title: `📞 Зателефонувати — ${clientName}`,
                        function: functionName,
                        assigneeId, assigneeName,
                        description: `Новий лід з сайту!\n\n📞 ${phone || '-'}\n📧 ${email || '-'}\n👤 ${name || '-'}\n💬 ${message || '-'}\n🔗 ${source || 'Сайт'}`,
                        expectedResult: 'Зв\'язатися з клієнтом протягом 15 хвилин',
                        deadlineDate: deadline.toISOString().split('T')[0],
                        deadlineTime: deadline.toTimeString().slice(0, 5),
                        deadline: admin.firestore.Timestamp.fromDate(deadline),
                        status: 'new', priority: 'high',
                        leadId: leadRef.id,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        isAutoGenerated: true,
                        escalationEnabled: true,
                        escalationMinutes: 15
                    });
            }

            // Notify managers
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users').where('role', 'in', ['owner', 'manager']).get();

            for (const userDoc of usersSnap.docs) {
                const userData = userDoc.data();
                if (userData.telegramChatId) {
                    await sendTelegramMessage(userData.telegramChatId,
                        `🔔 <b>Новий лід!</b>\n\n👤 ${name || 'Невідомий'}\n📞 ${phone || '-'}\n📧 ${email || '-'}\n🔗 ${source || 'Сайт'}\n${message ? `💬 ${message}` : ''}\n\n⚡ Зателефонуйте протягом 15 хвилин!`
                    );
                }
            }

            return res.status(200).json({
                success: true, leadId: leadRef.id, processId,
                message: 'Lead received and process started'
            });

        } catch (error) {
            console.error('Lead webhook error:', error);
            return res.status(500).json({ error: error.message });
        }
    });

// ===========================
// 5. SCHEDULED: ПРОСТРОЧЕНІ + ЕСКАЛАЦІЯ
// ===========================
exports.checkOverdueTasks = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .pubsub.schedule('every 5 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const companiesSnap = await db.collection('companies').get();

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;

            const tasksSnap = await db.collection('companies').doc(companyId)
                .collection('tasks')
                .where('status', 'in', ['new', 'progress'])
                .get();

            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                if (!task.deadline) continue;

                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                if (now <= deadline) continue;
                if (task.overdueNotified) continue;

                const overdueMinutes = Math.floor((now - deadline) / (1000 * 60));
                let taskType = '📋 Розпорядження';
                if (task.processId) taskType = '🟣 Бізнес-процес';
                else if (task.regularTaskId) taskType = '🟠 Регулярна задача';

                // Notify assignee
                if (task.assigneeId) {
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(task.assigneeId).get();
                    if (userDoc.exists && userDoc.data().telegramChatId) {
                        await sendWithButtons(userDoc.data().telegramChatId,
                            `⚠️ <b>ПРОСТРОЧЕНО!</b>\n\n${taskType}\n📌 ${task.title}\n⏰ Прострочено на ${overdueMinutes} хв\n\nТерміново виконайте задачу!`,
                            taskButtons(taskDoc.id, companyId)
                        );
                    }
                }

                // Notify managers
                const managersSnap = await db.collection('companies').doc(companyId)
                    .collection('users').where('role', 'in', ['owner', 'manager']).get();
                for (const managerDoc of managersSnap.docs) {
                    if (managerDoc.id === task.assigneeId) continue;
                    const d = managerDoc.data();
                    if (d.telegramChatId) {
                        await sendWithButtons(d.telegramChatId,
                            `⚠️ <b>Задача прострочена!</b>\n\n${taskType}\n📌 ${task.title}\n👤 ${task.assigneeName || '-'}\n⏰ +${overdueMinutes} хв`,
                            taskButtons(taskDoc.id, companyId)
                        );
                    }
                }

                await taskDoc.ref.update({
                    overdueNotified: true,
                    overdueNotifiedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Escalation
                if (task.escalationEnabled && task.escalationMinutes) {
                    const escalationTime = new Date(deadline.getTime() + task.escalationMinutes * 60 * 1000);
                    if (now >= escalationTime && !task.escalated) {
                        const newDeadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                        await db.collection('companies').doc(companyId)
                            .collection('tasks').add({
                                title: `🔄 Повторно: ${task.title}`,
                                function: task.function,
                                assigneeId: task.assigneeId, assigneeName: task.assigneeName,
                                description: `⚠️ ЕСКАЛАЦІЯ: Попередня задача не виконана!\n\n${task.description || ''}`,
                                expectedResult: task.expectedResult,
                                deadlineDate: newDeadline.toISOString().split('T')[0],
                                deadlineTime: newDeadline.toTimeString().slice(0, 5),
                                deadline: admin.firestore.Timestamp.fromDate(newDeadline),
                                status: 'new', priority: 'high',
                                processId: task.processId || null,
                                processStep: task.processStep,
                                leadId: task.leadId || null,
                                parentTaskId: taskDoc.id,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                isAutoGenerated: true, isEscalation: true
                            });
                        await taskDoc.ref.update({
                            escalated: true,
                            escalatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }
            }
        }
        return null;
    });

// ===========================
// 6. АВТОПРОСУВАННЯ ПРОЦЕСУ (з Smart Assign + контекст + SLA)
// ===========================
exports.onProcessTaskCompleted = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .firestore.document('companies/{companyId}/tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const { companyId, taskId } = context.params;

        if (!after.processId) return null;
        if (before.status === after.status || after.status !== 'done') return null;

        const processRef = db.collection('companies').doc(companyId)
            .collection('processes').doc(after.processId);

        // Transaction to prevent race
        const result = await db.runTransaction(async (tx) => {
            const processDoc = await tx.get(processRef);
            if (!processDoc.exists) return null;

            const process = processDoc.data();
            if (process.status !== 'active') return null;

            const currentStep = process.currentStep || 0;
            if (after.processStep !== currentStep) return null;

            const templateDoc = await tx.get(
                db.collection('companies').doc(companyId)
                    .collection('processTemplates').doc(process.templateId)
            );
            if (!templateDoc.exists) return null;

            const template = templateDoc.data();
            if (!template.steps?.length) return null;

            const stepDef = template.steps[currentStep];
            const nextStepIndex = currentStep + 1;
            const nextStep = template.steps[nextStepIndex];

            // Step result for context chain
            const stepResult = {
                step: currentStep,
                function: stepDef?.function || '',
                title: stepDef?.title || stepDef?.function || '',
                completedBy: after.completedBy || after.assigneeId,
                completedByName: after.assigneeName || '',
                completedAt: new Date().toISOString(),
                taskId,
                result: after.completionComment || '',
                trackedMinutes: after.timeLog ? after.timeLog.reduce((s, e) => s + (e.minutes || 0), 0) : 0
            };

            const historyEntry = {
                step: currentStep,
                stepTitle: stepDef?.title || stepDef?.function || '',
                completedAt: new Date().toISOString(),
                completedBy: after.completedBy || after.assigneeId,
                completedByName: after.assigneeName || '',
                taskId
            };

            const updateData = {
                currentStep: nextStepIndex,
                history: admin.firestore.FieldValue.arrayUnion(historyEntry),
                stepResults: admin.firestore.FieldValue.arrayUnion(stepResult)
            };

            if (!nextStep) {
                updateData.status = 'completed';
                updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
            }

            tx.update(processRef, updateData);

            return { process, template, nextStep, nextStepIndex, stepResult };
        });

        if (!result) return null;

        const { process, template, nextStep, nextStepIndex, stepResult } = result;

        if (nextStep) {
            // Get function and smart assign
            const funcsSnap = await db.collection('companies').doc(companyId)
                .collection('functions').where('name', '==', nextStep.function).limit(1).get();

            let assigneeId = null, assigneeName = '';
            if (!funcsSnap.empty) {
                const funcData = { id: funcsSnap.docs[0].id, ...funcsSnap.docs[0].data() };
                if (nextStep.smartAssign !== false && funcData.assigneeIds?.length > 1) {
                    assigneeId = await getSmartAssignee(companyId, funcData);
                } else {
                    assigneeId = funcData.headId || funcData.assigneeIds?.[0] || null;
                }
                if (assigneeId) {
                    const uDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(assigneeId).get();
                    if (uDoc.exists) assigneeName = uDoc.data().name || uDoc.data().email || '';
                }
            }

            // Deadline: SLA or process deadline
            const now = new Date();
            let deadlineDate;
            if (process.deadline) {
                const pdl = new Date(process.deadline + 'T18:00:00');
                const remaining = template.steps.slice(nextStepIndex + 1)
                    .reduce((s, st) => s + parseInt(st.slaMinutes || st.estimatedTime || 60), 0);
                const sdl = new Date(pdl.getTime() - remaining * 60000);
                const tmw = new Date(now); tmw.setDate(tmw.getDate() + 1);
                deadlineDate = sdl > tmw ? sdl : tmw;
            } else if (nextStep.slaMinutes) {
                deadlineDate = new Date(now.getTime() + nextStep.slaMinutes * 60000);
            } else {
                deadlineDate = new Date(now.getTime() + 24 * 60 * 60000);
            }
            const deadlineDateStr = deadlineDate.toISOString().split('T')[0];

            // Context from previous steps
            const prevResults = (process.stepResults || []).concat([stepResult]);
            let contextBlock = '';
            if (prevResults.length > 0) {
                contextBlock = '--- Попередні етапи ---\n' +
                    prevResults.map((r, i) =>
                        `${i + 1}. ${r.title || r.function}: ${r.result || '(без коментаря)'} [${r.completedByName || ''}]`
                    ).join('\n') + '\n---\n\n';
            }

            let instruction = contextBlock;
            if (process.objectName) instruction += `[${process.objectName}]\n`;
            instruction += nextStep.instruction || '';
            if (nextStep.expectedResult) instruction += `\n\n📋 Очікуваний результат: ${nextStep.expectedResult}`;
            if (nextStep.controlQuestion) instruction += `\n❓ ${nextStep.controlQuestion}`;

            const newTaskRef = await db.collection('companies').doc(companyId)
                .collection('tasks').add({
                    title: `[${process.name}] ${nextStep.title || nextStep.function}`,
                    function: nextStep.function,
                    assigneeId, assigneeName,
                    description: instruction,
                    instruction: instruction,
                    expectedResult: nextStep.expectedResult || '',
                    estimatedTime: String(nextStep.slaMinutes || nextStep.estimatedTime || 60),
                    deadlineDate: deadlineDateStr,
                    deadlineTime: '18:00',
                    deadline: deadlineDateStr + 'T18:00',
                    status: 'new', priority: 'high',
                    processId: after.processId,
                    processStep: nextStepIndex,
                    processObject: process.objectName || '',
                    requireReview: nextStep.checkpoint || false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAutoGenerated: true, creatorName: 'TALKO System'
                });

            // Telegram: notify assignee
            if (assigneeId) {
                const aDoc = await db.collection('companies').doc(companyId)
                    .collection('users').doc(assigneeId).get();
                if (aDoc.exists && aDoc.data().telegramChatId) {
                    await sendWithButtons(aDoc.data().telegramChatId,
                        `🔔 <b>Новий етап процесу!</b>\n\n📋 ${process.name}${process.objectName ? ` [${process.objectName}]` : ''}\n📍 Етап ${nextStepIndex + 1}/${template.steps.length}: ${nextStep.title || nextStep.function}\n⏰ Дедлайн: ${deadlineDateStr}\n${nextStep.expectedResult ? `\n📋 ${nextStep.expectedResult}` : ''}`,
                        taskButtons(newTaskRef.id, companyId)
                    );
                }
            }

            // Telegram: notify managers about progress
            const managersSnap = await db.collection('companies').doc(companyId)
                .collection('users').where('role', 'in', ['owner', 'manager']).get();
            for (const mDoc of managersSnap.docs) {
                if (mDoc.id === assigneeId) continue;
                const d = mDoc.data();
                if (d.telegramChatId) {
                    await sendTelegramMessage(d.telegramChatId,
                        `📊 <b>Прогрес процесу</b>\n\n📋 ${process.name}${process.objectName ? ` [${process.objectName}]` : ''}\n✅ Етап ${process.currentStep + 1} завершено\n▶️ Етап ${nextStepIndex + 1}: ${nextStep.title || nextStep.function}\n👤 ${assigneeName || '-'}`
                    );
                }
            }

        } else {
            // Process completed
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users').where('role', 'in', ['owner', 'manager']).get();
            for (const uDoc of usersSnap.docs) {
                const d = uDoc.data();
                if (d.telegramChatId) {
                    await sendTelegramMessage(d.telegramChatId,
                        `✅ <b>Процес завершено!</b>\n\n📋 ${process.name}${process.objectName ? ` [${process.objectName}]` : ''}\n🎉 Всі ${template.steps.length} етапів виконано!`
                    );
                }
            }
        }

        return null;
    });

// ===========================
// 7. SCHEDULED TASKS
// ===========================
exports.checkScheduledTasks = functions
    .region(REGION)
    .pubsub.schedule('every 15 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const companiesSnap = await db.collection('companies').get();
        for (const companyDoc of companiesSnap.docs) {
            const scheduledSnap = await companyDoc.ref
                .collection('scheduledTasks')
                .where('activateAt', '<=', admin.firestore.Timestamp.fromDate(now))
                .where('activated', '==', false).get();
            for (const schedDoc of scheduledSnap.docs) {
                const schedTask = schedDoc.data();
                await companyDoc.ref.collection('tasks').add({
                    ...schedTask.taskData,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAutoGenerated: true, scheduledTaskId: schedDoc.id
                });
                await schedDoc.ref.update({ activated: true });
            }
        }
        return null;
    });

// ===========================
// 8. REMINDERS (з кнопками)
// ===========================
exports.sendReminders = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .pubsub.schedule('every 5 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const companiesSnap = await db.collection('companies').get();

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const tasksSnap = await companyDoc.ref.collection('tasks')
                .where('status', 'in', ['new', 'progress']).get();

            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                if (!task.deadline) continue;

                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                const minUntil = Math.floor((deadline - now) / (1000 * 60));
                if (minUntil < 0) continue;

                const reminders = task.reminders || [60, 15];
                const sent = task.sentReminders || [];

                for (const rem of reminders) {
                    if (minUntil <= rem + 3 && minUntil >= rem - 3 && !sent.includes(rem)) {
                        const timeText = rem >= 60 ? `${Math.floor(rem / 60)} год` : `${rem} хв`;
                        let taskType = '📋 Розпорядження';
                        if (task.processId) taskType = '🟣 Процес';
                        else if (task.regularTaskId) taskType = '🟠 Регулярне';

                        if (task.assigneeId) {
                            const uDoc = await db.collection('companies').doc(companyId)
                                .collection('users').doc(task.assigneeId).get();
                            if (uDoc.exists && uDoc.data().telegramChatId) {
                                await sendWithButtons(uDoc.data().telegramChatId,
                                    `⏰ <b>Нагадування!</b>\n\n${taskType}\n📌 ${task.title}\n⏳ До дедлайну: ${timeText}`,
                                    taskButtons(taskDoc.id, companyId)
                                );
                            }
                        }

                        if (task.notifyOnReminder?.length) {
                            for (const uid of task.notifyOnReminder) {
                                if (uid === task.assigneeId) continue;
                                const uDoc = await db.collection('companies').doc(companyId)
                                    .collection('users').doc(uid).get();
                                if (uDoc.exists && uDoc.data().telegramChatId) {
                                    await sendTelegramMessage(uDoc.data().telegramChatId,
                                        `⏰ Контроль: <b>${task.title}</b>\n👤 ${task.assigneeName || '-'}\n⏳ ${timeText}`
                                    );
                                }
                            }
                        }

                        sent.push(rem);
                        await taskDoc.ref.update({ sentReminders: sent });
                    }
                }
            }
        }
        return null;
    });

// ===========================
// 9. РАНКОВИЙ ЗВІТ (9:00)
// ===========================
exports.dailyReport = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .pubsub.schedule('0 9 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const companiesSnap = await db.collection('companies').get();

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            if (companyData.dailyReportEnabled === false) continue;

            let todayTasks = 0, overdueTasks = 0, completedYesterday = 0;
            const userStats = {};

            const tasksSnap = await companyDoc.ref.collection('tasks').get();
            for (const td of tasksSnap.docs) {
                const t = td.data();
                if (t.deadlineDate === todayStr && t.status !== 'done') todayTasks++;
                if (t.deadline && t.status !== 'done') {
                    const dl = t.deadline.toDate ? t.deadline.toDate() : new Date(t.deadline);
                    if (dl < now) {
                        overdueTasks++;
                        if (t.assigneeId) {
                            if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                            userStats[t.assigneeId].overdue++;
                        }
                    }
                }
                if (t.status === 'done' && t.completedAt) {
                    const cd = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    if (cd.toISOString().split('T')[0] === yesterdayStr) {
                        completedYesterday++;
                        if (t.assigneeId) {
                            if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                            userStats[t.assigneeId].completed++;
                        }
                    }
                }
            }

            // Active processes
            const procSnap = await companyDoc.ref.collection('processes')
                .where('status', '==', 'active').get();

            let report = `📊 <b>Ранковий звіт</b>\n`;
            report += `📅 ${now.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n`;
            report += `📋 На сьогодні: <b>${todayTasks}</b> задач\n`;
            report += `✅ Виконано вчора: <b>${completedYesterday}</b>\n`;
            if (overdueTasks > 0) report += `⚠️ <b>Прострочено: ${overdueTasks}</b>\n`;
            if (procSnap.size > 0) report += `🔄 Активних процесів: <b>${procSnap.size}</b>\n`;

            const sorted = Object.entries(userStats).sort((a, b) => b[1].completed - a[1].completed).slice(0, 5);
            if (sorted.length > 0) {
                report += `\n👥 <b>Команда:</b>\n`;
                for (const [, s] of sorted) {
                    const emoji = s.overdue > 0 ? '⚠️' : '✅';
                    report += `${emoji} ${s.name}: ${s.completed} виконано${s.overdue > 0 ? `, ${s.overdue} прострочено` : ''}\n`;
                }
            }

            const managersSnap = await companyDoc.ref.collection('users')
                .where('role', 'in', ['owner', 'manager']).get();
            for (const mDoc of managersSnap.docs) {
                const d = mDoc.data();
                if (d.dailyReportEnabled === false) continue;
                if (d.telegramChatId) await sendTelegramMessage(d.telegramChatId, report);
            }
        }
        return null;
    });

// ===========================
// 10. ПЕРСОНАЛЬНІ ЗАВДАННЯ (9:05)
// ===========================
exports.personalDailyTasks = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .pubsub.schedule('5 9 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const day = now.getDay();
        if (day === 0 || day === 6) return null;

        const companiesSnap = await db.collection('companies').get();
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            if (companyDoc.data().personalDailyEnabled === false) continue;

            const usersSnap = await companyDoc.ref.collection('users').get();
            for (const userDoc of usersSnap.docs) {
                const ud = userDoc.data();
                if (!ud.telegramChatId || ud.personalDailyEnabled === false) continue;

                const uid = userDoc.id;
                const chatId = ud.telegramChatId;
                const userName = ud.name || ud.email || '';

                const tasksSnap = await companyDoc.ref.collection('tasks')
                    .where('assigneeId', '==', uid)
                    .where('status', 'in', ['new', 'progress']).get();

                const todayTasks = [], overdueTasks = [];
                tasksSnap.docs.forEach(d => {
                    const t = { id: d.id, ...d.data() };
                    if (t.deadlineDate === todayStr) todayTasks.push(t);
                    else if (t.deadlineDate && t.deadlineDate < todayStr) overdueTasks.push(t);
                });
                todayTasks.sort((a, b) => (a.deadlineTime || '').localeCompare(b.deadlineTime || ''));

                if (todayTasks.length === 0 && overdueTasks.length === 0) {
                    await sendTelegramMessage(chatId,
                        `☀️ Доброго ранку, <b>${userName}</b>!\n\n✅ На сьогодні завдань немає.`);
                    continue;
                }

                await sendTelegramMessage(chatId,
                    `☀️ Доброго ранку, <b>${userName}</b>!\n\n📋 На сьогодні: <b>${todayTasks.length}</b>` +
                    (overdueTasks.length > 0 ? `\n⚠️ Прострочено: <b>${overdueTasks.length}</b>` : ''));

                for (const t of overdueTasks.slice(0, 5)) {
                    const pr = t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡';
                    await sendWithButtons(chatId,
                        `⚠️ ${pr} <b>${t.title}</b>\n📅 ${t.deadlineDate}`,
                        taskButtons(t.id, companyId));
                }
                if (overdueTasks.length > 5) await sendTelegramMessage(chatId, `... ще ${overdueTasks.length - 5}. /overdue`);

                for (const t of todayTasks.slice(0, 10)) {
                    const tm = t.deadlineTime ? ` ⏰ ${t.deadlineTime}` : '';
                    const pr = t.priority === 'high' ? '🔴' : t.priority === 'low' ? '🟢' : '🟡';
                    await sendWithButtons(chatId,
                        `${pr} <b>${t.title}</b>${tm}`,
                        taskButtons(t.id, companyId));
                }
                if (todayTasks.length > 10) await sendTelegramMessage(chatId, `... ще ${todayTasks.length - 10}. /today`);
            }
        }
        return null;
    });

// ===========================
// 11. ТИЖНЕВИЙ ЗВІТ (понеділок 9:00)
// ===========================
exports.weeklyReport = functions
    .region(REGION)
    .runWith({ secrets: ['TELEGRAM_BOT_TOKEN'] })
    .pubsub.schedule('0 9 * * 1')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);

        const companiesSnap = await db.collection('companies').get();
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            if (companyDoc.data().weeklyReportEnabled === false) continue;

            let totalCreated = 0, totalCompleted = 0, totalOverdue = 0;
            let completionTimes = [];
            const userStats = {};

            const tasksSnap = await companyDoc.ref.collection('tasks').get();
            for (const td of tasksSnap.docs) {
                const t = td.data();
                if (t.createdAt) {
                    const cr = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
                    if (cr >= weekAgo) totalCreated++;
                }
                if (t.status === 'done' && t.completedAt) {
                    const co = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
                    if (co >= weekAgo) {
                        totalCompleted++;
                        if (t.createdAt) {
                            const cr = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
                            completionTimes.push((co - cr) / (1000 * 60 * 60));
                        }
                        if (t.assigneeId) {
                            if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                            userStats[t.assigneeId].completed++;
                        }
                    }
                }
                if (t.overdueNotified && t.overdueNotifiedAt) {
                    const ov = t.overdueNotifiedAt.toDate ? t.overdueNotifiedAt.toDate() : new Date(t.overdueNotifiedAt);
                    if (ov >= weekAgo) {
                        totalOverdue++;
                        if (t.assigneeId) {
                            if (!userStats[t.assigneeId]) userStats[t.assigneeId] = { name: t.assigneeName, completed: 0, overdue: 0 };
                            userStats[t.assigneeId].overdue++;
                        }
                    }
                }
            }

            const avgTime = completionTimes.length > 0
                ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : 0;

            // Processes completed this week
            const procSnap = await companyDoc.ref.collection('processes')
                .where('status', '==', 'completed').get();
            const procCompleted = procSnap.docs.filter(d => {
                const ca = d.data().completedAt;
                if (!ca) return false;
                const dt = ca.toDate ? ca.toDate() : new Date(ca);
                return dt >= weekAgo;
            }).length;

            let report = `📈 <b>Тижневий звіт</b>\n`;
            report += `📅 ${weekAgo.toLocaleDateString('uk-UA')} - ${now.toLocaleDateString('uk-UA')}\n\n`;
            report += `📝 Створено: ${totalCreated}\n✅ Виконано: ${totalCompleted}\n⚠️ Прострочено: ${totalOverdue}\n`;
            if (procCompleted > 0) report += `🔄 Процесів завершено: ${procCompleted}\n`;
            if (avgTime > 0) report += `⏱ Сер. час: ${Math.round(avgTime)} год\n`;
            if (totalCreated > 0) report += `\n📊 Ефективність: <b>${Math.round((totalCompleted / totalCreated) * 100)}%</b>\n`;

            const byCompleted = Object.entries(userStats).sort((a, b) => b[1].completed - a[1].completed);
            const byOverdue = Object.entries(userStats).filter(([, s]) => s.overdue > 0).sort((a, b) => b[1].overdue - a[1].overdue);

            if (byCompleted.length > 0) {
                report += `\n🏆 <b>Найкращі:</b>\n`;
                for (const [, s] of byCompleted.slice(0, 3)) report += `✅ ${s.name}: ${s.completed}\n`;
            }
            if (byOverdue.length > 0) {
                report += `\n⚠️ <b>Потребують уваги:</b>\n`;
                for (const [, s] of byOverdue.slice(0, 3)) report += `❌ ${s.name}: ${s.overdue} прострочень\n`;
            }

            const managersSnap = await companyDoc.ref.collection('users')
                .where('role', 'in', ['owner', 'manager']).get();
            for (const mDoc of managersSnap.docs) {
                const d = mDoc.data();
                if (d.weeklyReportEnabled === false) continue;
                if (d.telegramChatId) await sendTelegramMessage(d.telegramChatId, report);
            }
        }
        return null;
    });

// ===========================
// 12. AI ASSISTANT — Universal Cloud Function
// ===========================
exports.aiAssistant = functions
    .region(REGION)
    .runWith({ timeoutSeconds: 120, memory: '256MB' })
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Login required');
        }

        const { companyId, assistantId, userMessage, contextData } = data;
        if (!companyId || !assistantId || !userMessage) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
        }

        try {
            // Verify user
            const userDoc = await db.collection('companies').doc(companyId)
                .collection('users').doc(context.auth.uid).get();
            if (!userDoc.exists) {
                throw new functions.https.HttpsError('permission-denied', 'Not a member');
            }

            // Load assistant
            const aDoc = await db.collection('companies').doc(companyId)
                .collection('aiAssistants').doc(assistantId).get();
            if (!aDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Assistant not found');
            }

            const assistant = aDoc.data();
            const model = assistant.model || 'gpt-4o-mini';

            // Get API key
            let apiKey = '';
            const companyDoc = await db.collection('companies').doc(companyId).get();
            if (companyDoc.exists && companyDoc.data().openaiApiKey) {
                apiKey = companyDoc.data().openaiApiKey;
            }
            if (!apiKey) {
                const globalDoc = await db.collection('settings').doc('ai').get();
                if (globalDoc.exists && globalDoc.data().openaiApiKey) {
                    apiKey = globalDoc.data().openaiApiKey;
                }
            }
            if (!apiKey) {
                throw new functions.https.HttpsError('failed-precondition',
                    'API key not configured. Set in AI Assistants settings.');
            }

            // Build messages
            const messages = [];
            if (assistant.systemPrompt) messages.push({ role: 'system', content: assistant.systemPrompt });
            if (contextData) messages.push({ role: 'system', content: 'Context:\n' + JSON.stringify(contextData, null, 2) });
            messages.push({ role: 'user', content: userMessage });

            // Call OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4000 })
            });

            if (!response.ok) {
                const err = await response.text();
                console.error('OpenAI error:', response.status, err);
                throw new functions.https.HttpsError('internal', `OpenAI: ${response.status}`);
            }

            const result = await response.json();
            const content = result.choices?.[0]?.message?.content || '';

            // Log usage
            await db.collection('companies').doc(companyId)
                .collection('aiUsageLog').add({
                    assistantId, model, userId: context.auth.uid,
                    tokens: result.usage?.total_tokens || 0,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                }).catch(() => {});

            return { content, model, tokens: result.usage?.total_tokens || 0 };

        } catch (error) {
            if (error instanceof functions.https.HttpsError) throw error;
            console.error('aiAssistant error:', error);
            throw new functions.https.HttpsError('internal', error.message);
        }
    });
