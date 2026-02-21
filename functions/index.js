const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// Регіон для функцій (ближче до України)
const REGION = 'europe-west1';

const TELEGRAM_BOT_TOKEN = '8389055770:AAEWTQcwveoIjmAJmtrM4Y1JToNJ3T8t4lY';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Відправка повідомлення в Telegram
async function sendTelegramMessage(chatId, text, opts = {}) {
    try {
        const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
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

// Відправка з inline кнопками
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
// 1. НОВЕ ЗАВДАННЯ (з кнопками!)
// ===========================
exports.onNewTask = functions.firestore
    .document('companies/{companyId}/tasks/{taskId}')
    .onCreate(async (snap, context) => {
        const task = snap.data();
        const { companyId, taskId } = context.params;
        
        // Не дублювати сповіщення для завдань з Telegram (бот вже шле)
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
${task.description ? `\n📝 Опис:\n${task.description}` : ''}
        `.trim();
        
        // Шлемо з кнопками
        return sendWithButtons(chatId, message, taskButtons(taskId, companyId));
    });

// ===========================
// 2. ЗАВДАННЯ ВИКОНАНО
// ===========================
exports.onTaskCompleted = functions.firestore
    .document('companies/{companyId}/tasks/{taskId}')
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
// 3. WEBHOOK ДЛЯ РЕЄСТРАЦІЇ
// ===========================
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('TALKO Telegram Bot is running!');
    }
    
    const update = req.body;
    
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
                            '✅ <b>Успішно підключено!</b>\n\nТепер ви отримуватимете сповіщення про нові завдання.'
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
                    'Щоб підключити сповіщення, натисніть кнопку "Підключити Telegram" в налаштуваннях TALKO System.'
                );
            }
        }
    }
    
    return res.status(200).send('OK');
});

// ===========================
// 4. WEBHOOK ДЛЯ ЛІДІВ
// ===========================
exports.leadWebhook = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { 
            companyId, apiKey, name, phone, email,
            source, message, processTemplate
        } = req.body;
        
        if (!companyId) {
            return res.status(400).json({ error: 'companyId is required' });
        }
        
        const companyDoc = await db.collection('companies').doc(companyId).get();
        if (!companyDoc.exists) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        const companyData = companyDoc.data();
        if (companyData.webhookApiKey && companyData.webhookApiKey !== apiKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        
        const now = new Date();
        
        // 1. Створюємо запис ліда
        const leadRef = await db.collection('companies').doc(companyId)
            .collection('leads').add({
                name: name || 'Невідомий',
                phone: phone || '',
                email: email || '',
                source: source || 'Сайт',
                message: message || '',
                status: 'new',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        
        // 2. Шукаємо шаблон процесу
        let templateToUse = null;
        const templateName = processTemplate || 'Обробка ліда';
        
        const templatesSnap = await db.collection('companies').doc(companyId)
            .collection('processTemplates')
            .where('name', '==', templateName)
            .limit(1)
            .get();
        
        if (!templatesSnap.empty) {
            templateToUse = { id: templatesSnap.docs[0].id, ...templatesSnap.docs[0].data() };
        }
        
        // 3. Якщо є шаблон - запускаємо процес
        let processId = null;
        if (templateToUse && templateToUse.steps && templateToUse.steps.length > 0) {
            const processRef = await db.collection('companies').doc(companyId)
                .collection('processes').add({
                    name: `${templateToUse.name} - ${name || phone || 'Новий лід'}`,
                    templateId: templateToUse.id,
                    templateName: templateToUse.name,
                    leadId: leadRef.id,
                    status: 'active',
                    currentStep: 0,
                    steps: templateToUse.steps.map((step, index) => ({
                        ...step,
                        status: index === 0 ? 'active' : 'pending',
                        completedAt: null,
                        completedBy: null
                    })),
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    startedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            
            processId = processRef.id;
            
            const firstStep = templateToUse.steps[0];
            
            const funcsSnap = await db.collection('companies').doc(companyId)
                .collection('functions')
                .where('name', '==', firstStep.function)
                .limit(1)
                .get();
            
            let assigneeId = null;
            let assigneeName = '';
            
            if (!funcsSnap.empty) {
                const funcData = funcsSnap.docs[0].data();
                if (funcData.assigneeIds && funcData.assigneeIds.length > 0) {
                    assigneeId = funcData.assigneeIds[0];
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(assigneeId).get();
                    if (userDoc.exists) {
                        assigneeName = userDoc.data().name || userDoc.data().email || '';
                    }
                }
            }
            
            const deadline = new Date(now.getTime() + 15 * 60 * 1000);
            
            await db.collection('companies').doc(companyId)
                .collection('tasks').add({
                    title: `${firstStep.name} - ${name || phone || 'Новий лід'}`,
                    function: firstStep.function,
                    assigneeId: assigneeId,
                    assigneeName: assigneeName,
                    description: `${firstStep.instruction || ''}\n\n📞 Телефон: ${phone || '-'}\n📧 Email: ${email || '-'}\n💬 Коментар: ${message || '-'}\n🔗 Джерело: ${source || 'Сайт'}`,
                    expectedResult: firstStep.expectedResult || 'Зв\'язатися з клієнтом',
                    deadlineDate: deadline.toISOString().split('T')[0],
                    deadlineTime: deadline.toTimeString().slice(0, 5),
                    deadline: admin.firestore.Timestamp.fromDate(deadline),
                    status: 'new',
                    priority: 'high',
                    processId: processId,
                    processStep: 0,
                    leadId: leadRef.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAutoGenerated: true,
                    escalationEnabled: true,
                    escalationMinutes: 15
                });
        } else {
            const funcsSnap = await db.collection('companies').doc(companyId)
                .collection('functions').limit(1).get();
            
            let assigneeId = null;
            let assigneeName = '';
            let functionName = 'Адміністрування';
            
            if (!funcsSnap.empty) {
                const funcData = funcsSnap.docs[0].data();
                functionName = funcData.name;
                if (funcData.assigneeIds && funcData.assigneeIds.length > 0) {
                    assigneeId = funcData.assigneeIds[0];
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(assigneeId).get();
                    if (userDoc.exists) {
                        assigneeName = userDoc.data().name || userDoc.data().email || '';
                    }
                }
            }
            
            const deadline = new Date(now.getTime() + 15 * 60 * 1000);
            
            await db.collection('companies').doc(companyId)
                .collection('tasks').add({
                    title: `📞 Зателефонувати новому ліду - ${name || phone || 'Невідомий'}`,
                    function: functionName,
                    assigneeId: assigneeId,
                    assigneeName: assigneeName,
                    description: `Новий лід з сайту!\n\n📞 Телефон: ${phone || '-'}\n📧 Email: ${email || '-'}\n👤 Ім'я: ${name || '-'}\n💬 Коментар: ${message || '-'}\n🔗 Джерело: ${source || 'Сайт'}`,
                    expectedResult: 'Зв\'язатися з клієнтом протягом 15 хвилин',
                    deadlineDate: deadline.toISOString().split('T')[0],
                    deadlineTime: deadline.toTimeString().slice(0, 5),
                    deadline: admin.firestore.Timestamp.fromDate(deadline),
                    status: 'new',
                    priority: 'high',
                    leadId: leadRef.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAutoGenerated: true,
                    escalationEnabled: true,
                    escalationMinutes: 15
                });
        }
        
        // 5. Сповіщення менеджерам
        const usersSnap = await db.collection('companies').doc(companyId)
            .collection('users')
            .where('role', 'in', ['owner', 'manager'])
            .get();
        
        for (const userDoc of usersSnap.docs) {
            const userData = userDoc.data();
            if (userData.telegramChatId) {
                await sendTelegramMessage(userData.telegramChatId,
                    `🔔 <b>Новий лід!</b>\n\n` +
                    `👤 ${name || 'Невідомий'}\n` +
                    `📞 ${phone || '-'}\n` +
                    `📧 ${email || '-'}\n` +
                    `🔗 ${source || 'Сайт'}\n` +
                    `${message ? `💬 ${message}` : ''}\n\n` +
                    `⚡ Зателефонуйте протягом 15 хвилин!`
                );
            }
        }
        
        return res.status(200).json({ 
            success: true, 
            leadId: leadRef.id,
            processId: processId,
            message: 'Lead received and process started'
        });
        
    } catch (error) {
        console.error('Lead webhook error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// ===========================
// 5. SCHEDULED: ПЕРЕВІРКА ПРОСТРОЧЕНИХ ЗАДАЧ
// ===========================
exports.checkOverdueTasks = functions.pubsub
    .schedule('every 5 minutes')
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
                
                // Сповіщення виконавцю з кнопками
                if (task.assigneeId) {
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(task.assigneeId).get();
                    
                    if (userDoc.exists && userDoc.data().telegramChatId) {
                        await sendWithButtons(userDoc.data().telegramChatId,
                            `⚠️ <b>ПРОСТРОЧЕНО!</b>\n\n` +
                            `${taskType}\n` +
                            `📌 ${task.title}\n` +
                            `⏰ Прострочено на ${overdueMinutes} хв\n\n` +
                            `Терміново виконайте задачу!`,
                            taskButtons(taskDoc.id, companyId)
                        );
                    }
                }
                
                // Сповіщення менеджерам
                const managersSnap = await db.collection('companies').doc(companyId)
                    .collection('users')
                    .where('role', 'in', ['owner', 'manager'])
                    .get();
                
                for (const managerDoc of managersSnap.docs) {
                    if (managerDoc.id === task.assigneeId) continue;
                    const managerData = managerDoc.data();
                    if (managerData.telegramChatId) {
                        await sendWithButtons(managerData.telegramChatId,
                            `⚠️ <b>Задача прострочена!</b>\n\n` +
                            `${taskType}\n` +
                            `📌 ${task.title}\n` +
                            `👤 Виконавець: ${task.assigneeName || 'Не призначено'}\n` +
                            `⏰ Прострочено на ${overdueMinutes} хв`,
                            taskButtons(taskDoc.id, companyId)
                        );
                    }
                }
                
                await taskDoc.ref.update({ 
                    overdueNotified: true,
                    overdueNotifiedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                // ЕСКАЛАЦІЯ
                if (task.escalationEnabled && task.escalationMinutes) {
                    const escalationTime = new Date(deadline.getTime() + task.escalationMinutes * 60 * 1000);
                    
                    if (now >= escalationTime && !task.escalated) {
                        const newDeadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                        
                        await db.collection('companies').doc(companyId)
                            .collection('tasks').add({
                                title: `🔄 Повторно: ${task.title}`,
                                function: task.function,
                                assigneeId: task.assigneeId,
                                assigneeName: task.assigneeName,
                                description: `⚠️ ЕСКАЛАЦІЯ: Попередня задача не виконана вчасно!\n\n${task.description || ''}`,
                                expectedResult: task.expectedResult,
                                deadlineDate: newDeadline.toISOString().split('T')[0],
                                deadlineTime: newDeadline.toTimeString().slice(0, 5),
                                deadline: admin.firestore.Timestamp.fromDate(newDeadline),
                                status: 'new',
                                priority: 'high',
                                processId: task.processId || null,
                                processStep: task.processStep,
                                leadId: task.leadId || null,
                                parentTaskId: taskDoc.id,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                isAutoGenerated: true,
                                isEscalation: true
                            });
                        
                        await taskDoc.ref.update({ 
                            escalated: true,
                            escalatedAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }
            }
            
            // ПРОСТРОЧЕНІ БІЗНЕС-ПРОЦЕСИ
            const processesSnap = await db.collection('companies').doc(companyId)
                .collection('processes')
                .where('status', '==', 'active')
                .get();
            
            for (const processDoc of processesSnap.docs) {
                const process = processDoc.data();
                if (!process.steps || process.currentStep === undefined) continue;
                
                const currentStepData = process.steps[process.currentStep];
                if (!currentStepData || currentStepData.status !== 'active') continue;
                
                if (currentStepData.deadline) {
                    const stepDeadline = currentStepData.deadline.toDate ? 
                        currentStepData.deadline.toDate() : new Date(currentStepData.deadline);
                    
                    if (now > stepDeadline && !currentStepData.overdueNotified) {
                        const overdueMinutes = Math.floor((now - stepDeadline) / (1000 * 60));
                        
                        const managersSnap = await db.collection('companies').doc(companyId)
                            .collection('users')
                            .where('role', 'in', ['owner', 'manager'])
                            .get();
                        
                        for (const managerDoc of managersSnap.docs) {
                            const managerData = managerDoc.data();
                            if (managerData.telegramChatId) {
                                await sendTelegramMessage(managerData.telegramChatId,
                                    `⚠️ <b>Етап процесу прострочено!</b>\n\n` +
                                    `📋 Процес: ${process.name}\n` +
                                    `📍 Етап: ${currentStepData.name}\n` +
                                    `⏰ Прострочено на ${overdueMinutes} хв`
                                );
                            }
                        }
                        
                        const updatedSteps = [...process.steps];
                        updatedSteps[process.currentStep].overdueNotified = true;
                        await processDoc.ref.update({ steps: updatedSteps });
                    }
                }
            }
        }
        
        return null;
    });

// ===========================
// 6. АВТОЗАВЕРШЕННЯ ЕТАПУ ПРОЦЕСУ
// ===========================
exports.onProcessTaskCompleted = functions.firestore
    .document('companies/{companyId}/tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const { companyId, taskId } = context.params;
        
        if (!after.processId) return null;
        if (before.status === after.status || after.status !== 'done') return null;
        
        const processRef = db.collection('companies').doc(companyId)
            .collection('processes').doc(after.processId);
        const processDoc = await processRef.get();
        
        if (!processDoc.exists) return null;
        
        const process = processDoc.data();
        const currentStep = after.processStep;
        
        const updatedSteps = [...process.steps];
        if (updatedSteps[currentStep]) {
            updatedSteps[currentStep].status = 'completed';
            updatedSteps[currentStep].completedAt = admin.firestore.FieldValue.serverTimestamp();
        }
        
        const nextStep = currentStep + 1;
        
        if (nextStep < updatedSteps.length) {
            updatedSteps[nextStep].status = 'active';
            
            await processRef.update({
                steps: updatedSteps,
                currentStep: nextStep
            });
            
            const stepData = updatedSteps[nextStep];
            
            const funcsSnap = await db.collection('companies').doc(companyId)
                .collection('functions')
                .where('name', '==', stepData.function)
                .limit(1)
                .get();
            
            let assigneeId = null;
            let assigneeName = '';
            
            if (!funcsSnap.empty) {
                const funcData = funcsSnap.docs[0].data();
                if (funcData.assigneeIds && funcData.assigneeIds.length > 0) {
                    assigneeId = funcData.assigneeIds[0];
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(assigneeId).get();
                    if (userDoc.exists) {
                        assigneeName = userDoc.data().name || userDoc.data().email || '';
                    }
                }
            }
            
            const now = new Date();
            const minutes = parseInt(stepData.estimatedTime) || 1440;
            const deadline = new Date(now.getTime() + minutes * 60 * 1000);
            
            const newTaskRef = await db.collection('companies').doc(companyId)
                .collection('tasks').add({
                    title: `${stepData.name} - ${process.name}`,
                    function: stepData.function,
                    assigneeId: assigneeId,
                    assigneeName: assigneeName,
                    description: stepData.instruction || '',
                    expectedResult: stepData.expectedResult || '',
                    deadlineDate: deadline.toISOString().split('T')[0],
                    deadlineTime: deadline.toTimeString().slice(0, 5),
                    deadline: admin.firestore.Timestamp.fromDate(deadline),
                    status: 'new',
                    priority: 'medium',
                    processId: after.processId,
                    processStep: nextStep,
                    leadId: after.leadId || process.leadId || null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAutoGenerated: true
                });
            
            // Сповіщення з кнопками
            if (assigneeId) {
                const assigneeDoc = await db.collection('companies').doc(companyId)
                    .collection('users').doc(assigneeId).get();
                
                if (assigneeDoc.exists && assigneeDoc.data().telegramChatId) {
                    await sendWithButtons(assigneeDoc.data().telegramChatId,
                        `🔔 <b>Новий етап процесу!</b>\n\n` +
                        `📋 Процес: ${process.name}\n` +
                        `📍 Етап ${nextStep + 1}/${process.steps.length}: ${stepData.name}\n` +
                        `⏰ Дедлайн: ${deadline.toLocaleString('uk-UA')}\n\n` +
                        `${stepData.instruction ? `📝 ${stepData.instruction}` : ''}`,
                        taskButtons(newTaskRef.id, companyId)
                    );
                }
            }
            
            // Сповіщення менеджерам про прогрес
            const managersSnap = await db.collection('companies').doc(companyId)
                .collection('users')
                .where('role', 'in', ['owner', 'manager'])
                .get();
            
            for (const managerDoc of managersSnap.docs) {
                if (managerDoc.id === assigneeId) continue;
                const managerData = managerDoc.data();
                if (managerData.telegramChatId) {
                    await sendTelegramMessage(managerData.telegramChatId,
                        `📊 <b>Прогрес процесу</b>\n\n` +
                        `📋 ${process.name}\n` +
                        `✅ Завершено: Етап ${process.currentStep + 1}\n` +
                        `▶️ Розпочато: Етап ${nextStep + 1} - ${stepData.name}\n` +
                        `👤 Виконавець: ${assigneeName || 'Не призначено'}`
                    );
                }
            }
            
        } else {
            // Процес завершено
            await processRef.update({
                steps: updatedSteps,
                status: 'completed',
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users')
                .where('role', 'in', ['owner', 'manager'])
                .get();
            
            for (const userDoc of usersSnap.docs) {
                const userData = userDoc.data();
                if (userData.telegramChatId) {
                    await sendTelegramMessage(userData.telegramChatId,
                        `✅ <b>Процес завершено!</b>\n\n` +
                        `📋 ${process.name}\n` +
                        `🎉 Всі етапи виконано успішно!`
                    );
                }
            }
        }
        
        return null;
    });

// ===========================
// 7. SCHEDULED: ВІДКЛАДЕНІ ЗАДАЧІ
// ===========================
exports.checkScheduledTasks = functions.pubsub
    .schedule('every 15 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            
            const scheduledSnap = await db.collection('companies').doc(companyId)
                .collection('scheduledTasks')
                .where('activateAt', '<=', admin.firestore.Timestamp.fromDate(now))
                .where('activated', '==', false)
                .get();
            
            for (const schedDoc of scheduledSnap.docs) {
                const schedTask = schedDoc.data();
                
                await db.collection('companies').doc(companyId)
                    .collection('tasks').add({
                        ...schedTask.taskData,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        isAutoGenerated: true,
                        scheduledTaskId: schedDoc.id
                    });
                
                await schedDoc.ref.update({ activated: true });
            }
        }
        
        return null;
    });

// ===========================
// 8. SCHEDULED: НАГАДУВАННЯ ДО ДЕДЛАЙНУ (з кнопками)
// ===========================
exports.sendReminders = functions.pubsub
    .schedule('every 5 minutes')
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
                const minutesUntilDeadline = Math.floor((deadline - now) / (1000 * 60));
                
                if (minutesUntilDeadline < 0) continue;
                
                const reminders = task.reminders || [60, 15];
                const sentReminders = task.sentReminders || [];
                
                for (const reminderMinutes of reminders) {
                    if (minutesUntilDeadline <= reminderMinutes + 3 && 
                        minutesUntilDeadline >= reminderMinutes - 3 &&
                        !sentReminders.includes(reminderMinutes)) {
                        
                        let taskType = '📋 Розпорядження';
                        if (task.processId) taskType = '🟣 Бізнес-процес';
                        else if (task.regularTaskId) taskType = '🟠 Регулярна задача';
                        
                        let timeText = '';
                        if (reminderMinutes >= 60) {
                            timeText = `${Math.floor(reminderMinutes / 60)} год`;
                        } else {
                            timeText = `${reminderMinutes} хв`;
                        }
                        
                        // Нагадування виконавцю з кнопками
                        if (task.assigneeId) {
                            const userDoc = await db.collection('companies').doc(companyId)
                                .collection('users').doc(task.assigneeId).get();
                            
                            if (userDoc.exists && userDoc.data().telegramChatId) {
                                await sendWithButtons(userDoc.data().telegramChatId,
                                    `⏰ <b>Нагадування!</b>\n\n` +
                                    `${taskType}\n` +
                                    `📌 ${task.title}\n\n` +
                                    `⏳ До дедлайну: ${timeText}\n` +
                                    `🕐 Дедлайн: ${task.deadlineTime || ''}`,
                                    taskButtons(taskDoc.id, companyId)
                                );
                            }
                        }
                        
                        // Контролерам (без кнопок)
                        if (task.notifyOnReminder && task.notifyOnReminder.length > 0) {
                            for (const userId of task.notifyOnReminder) {
                                if (userId === task.assigneeId) continue;
                                
                                const userDoc = await db.collection('companies').doc(companyId)
                                    .collection('users').doc(userId).get();
                                
                                if (userDoc.exists && userDoc.data().telegramChatId) {
                                    await sendTelegramMessage(userDoc.data().telegramChatId,
                                        `⏰ <b>Контроль задачі</b>\n\n` +
                                        `📌 ${task.title}\n` +
                                        `👤 Виконавець: ${task.assigneeName || '-'}\n` +
                                        `⏳ До дедлайну: ${timeText}`
                                    );
                                }
                            }
                        }
                        
                        sentReminders.push(reminderMinutes);
                        await taskDoc.ref.update({ sentReminders: sentReminders });
                    }
                }
            }
        }
        
        return null;
    });

// ===========================
// 9. РАНКОВИЙ ЗВІТ КЕРІВНИКАМ (9:00)
// ===========================
exports.dailyReport = functions.pubsub
    .schedule('0 9 * * *')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            
            if (companyData.dailyReportEnabled === false) continue;
            
            let todayTasks = 0;
            let overdueTasks = 0;
            let completedYesterday = 0;
            const userStats = {};
            
            const tasksSnap = await db.collection('companies').doc(companyId)
                .collection('tasks').get();
            
            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                
                if (task.deadlineDate === todayStr && task.status !== 'done') {
                    todayTasks++;
                }
                
                if (task.deadline && task.status !== 'done') {
                    const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                    if (deadline < now) {
                        overdueTasks++;
                        if (task.assigneeId) {
                            if (!userStats[task.assigneeId]) {
                                userStats[task.assigneeId] = { name: task.assigneeName, completed: 0, overdue: 0 };
                            }
                            userStats[task.assigneeId].overdue++;
                        }
                    }
                }
                
                if (task.status === 'done' && task.completedAt) {
                    const completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
                    if (completedDate.toISOString().split('T')[0] === yesterdayStr) {
                        completedYesterday++;
                        if (task.assigneeId) {
                            if (!userStats[task.assigneeId]) {
                                userStats[task.assigneeId] = { name: task.assigneeName, completed: 0, overdue: 0 };
                            }
                            userStats[task.assigneeId].completed++;
                        }
                    }
                }
            }
            
            let report = `📊 <b>Ранковий звіт</b>\n`;
            report += `📅 ${now.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n`;
            report += `📋 На сьогодні: <b>${todayTasks}</b> задач\n`;
            report += `✅ Виконано вчора: <b>${completedYesterday}</b>\n`;
            if (overdueTasks > 0) {
                report += `\n⚠️ <b>Прострочено: ${overdueTasks}</b>\n`;
            }
            
            const sortedUsers = Object.entries(userStats)
                .sort((a, b) => b[1].completed - a[1].completed)
                .slice(0, 3);
            
            if (sortedUsers.length > 0) {
                report += `\n👥 <b>Активність:</b>\n`;
                for (const [userId, stats] of sortedUsers) {
                    const emoji = stats.overdue > 0 ? '⚠️' : '✅';
                    report += `${emoji} ${stats.name}: ${stats.completed} виконано`;
                    if (stats.overdue > 0) report += `, ${stats.overdue} прострочено`;
                    report += `\n`;
                }
            }
            
            // Відправляємо власникам і менеджерам
            const managersSnap = await db.collection('companies').doc(companyId)
                .collection('users')
                .where('role', 'in', ['owner', 'manager'])
                .get();
            
            for (const managerDoc of managersSnap.docs) {
                const managerData = managerDoc.data();
                if (managerData.dailyReportEnabled === false) continue;
                if (managerData.telegramChatId) {
                    await sendTelegramMessage(managerData.telegramChatId, report);
                }
            }
        }
        
        return null;
    });

// ===========================
// 10. ПЕРСОНАЛЬНІ ЗАВДАННЯ КОЖНОМУ (9:05)
// ===========================
// Шле КОЖНОМУ підключеному співробітнику його завдання на сьогодні з кнопками
exports.personalDailyTasks = functions.pubsub
    .schedule('5 9 * * *')  // 9:05 (після ранкового звіту керівникам)
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        // Не шлемо у вихідні (сб=6, нд=0)
        const day = now.getDay();
        if (day === 0 || day === 6) return null;
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            
            // Пропускаємо якщо вимкнено
            if (companyData.personalDailyEnabled === false) continue;
            
            // Всі підключені юзери
            const usersSnap = await db.collection('companies').doc(companyId)
                .collection('users').get();
            
            for (const userDoc of usersSnap.docs) {
                const userData = userDoc.data();
                if (!userData.telegramChatId) continue;
                if (userData.personalDailyEnabled === false) continue;
                
                const userId = userDoc.id;
                const chatId = userData.telegramChatId;
                const userName = userData.name || userData.email || '';
                
                // Завдання цього юзера на сьогодні
                const tasksSnap = await db.collection('companies').doc(companyId)
                    .collection('tasks')
                    .where('assigneeId', '==', userId)
                    .where('status', 'in', ['new', 'progress'])
                    .get();
                
                const todayTasks = [];
                const overdueTasks = [];
                
                tasksSnap.docs.forEach(d => {
                    const t = { id: d.id, ...d.data() };
                    if (t.deadlineDate === todayStr) {
                        todayTasks.push(t);
                    } else if (t.deadlineDate && t.deadlineDate < todayStr) {
                        overdueTasks.push(t);
                    }
                });
                
                // Сортуємо по часу
                todayTasks.sort((a, b) => (a.deadlineTime || '').localeCompare(b.deadlineTime || ''));
                
                // Якщо немає завдань — коротке повідомлення
                if (todayTasks.length === 0 && overdueTasks.length === 0) {
                    await sendTelegramMessage(chatId,
                        `☀️ Доброго ранку, <b>${userName}</b>!\n\n` +
                        `✅ На сьогодні завдань немає. Гарного дня!`
                    );
                    continue;
                }
                
                // Привітання
                await sendTelegramMessage(chatId,
                    `☀️ Доброго ранку, <b>${userName}</b>!\n\n` +
                    `📋 На сьогодні: <b>${todayTasks.length}</b> завдань` +
                    (overdueTasks.length > 0 ? `\n⚠️ Прострочено: <b>${overdueTasks.length}</b>` : '')
                );
                
                // Прострочені (перші 5)
                for (const t of overdueTasks.slice(0, 5)) {
                    const pr = t.priority==='high'?'🔴':t.priority==='low'?'🟢':'🟡';
                    await sendWithButtons(chatId,
                        `⚠️ ${pr} <b>${t.title}</b>\n📅 Дедлайн: ${t.deadlineDate}`,
                        taskButtons(t.id, companyId)
                    );
                }
                if (overdueTasks.length > 5) {
                    await sendTelegramMessage(chatId, `... ще ${overdueTasks.length - 5} прострочених. /overdue`);
                }
                
                // Завдання на сьогодні (перші 10)
                for (const t of todayTasks.slice(0, 10)) {
                    const tm = t.deadlineTime ? ` ⏰ ${t.deadlineTime}` : '';
                    const pr = t.priority==='high'?'🔴':t.priority==='low'?'🟢':'🟡';
                    await sendWithButtons(chatId,
                        `${pr} <b>${t.title}</b>${tm}`,
                        taskButtons(t.id, companyId)
                    );
                }
                if (todayTasks.length > 10) {
                    await sendTelegramMessage(chatId, `... ще ${todayTasks.length - 10}. /today`);
                }
            }
        }
        
        return null;
    });

// ===========================
// 11. ТИЖНЕВИЙ ЗВІТ (понеділок 9:00)
// ===========================
exports.weeklyReport = functions.pubsub
    .schedule('0 9 * * 1')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            
            if (companyData.weeklyReportEnabled === false) continue;
            
            let totalCreated = 0;
            let totalCompleted = 0;
            let totalOverdue = 0;
            let completionTimes = [];
            const userStats = {};
            
            const tasksSnap = await db.collection('companies').doc(companyId)
                .collection('tasks').get();
            
            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                
                if (task.createdAt) {
                    const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                    if (created >= weekAgo) totalCreated++;
                }
                
                if (task.status === 'done' && task.completedAt) {
                    const completed = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
                    if (completed >= weekAgo) {
                        totalCompleted++;
                        if (task.createdAt) {
                            const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                            completionTimes.push((completed - created) / (1000 * 60 * 60));
                        }
                        if (task.assigneeId) {
                            if (!userStats[task.assigneeId]) {
                                userStats[task.assigneeId] = { name: task.assigneeName, completed: 0, overdue: 0 };
                            }
                            userStats[task.assigneeId].completed++;
                        }
                    }
                }
                
                if (task.overdueNotified && task.overdueNotifiedAt) {
                    const overdueAt = task.overdueNotifiedAt.toDate ? task.overdueNotifiedAt.toDate() : new Date(task.overdueNotifiedAt);
                    if (overdueAt >= weekAgo) {
                        totalOverdue++;
                        if (task.assigneeId) {
                            if (!userStats[task.assigneeId]) {
                                userStats[task.assigneeId] = { name: task.assigneeName, completed: 0, overdue: 0 };
                            }
                            userStats[task.assigneeId].overdue++;
                        }
                    }
                }
            }
            
            let avgCompletionTime = 0;
            if (completionTimes.length > 0) {
                avgCompletionTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
            }
            
            let report = `📈 <b>Тижневий звіт</b>\n`;
            report += `📅 ${weekAgo.toLocaleDateString('uk-UA')} - ${now.toLocaleDateString('uk-UA')}\n\n`;
            report += `📊 <b>Загальна статистика:</b>\n`;
            report += `📝 Створено: ${totalCreated}\n`;
            report += `✅ Виконано: ${totalCompleted}\n`;
            report += `⚠️ Прострочено: ${totalOverdue}\n`;
            
            if (avgCompletionTime > 0) {
                report += `⏱ Сер. час виконання: ${Math.round(avgCompletionTime)} год\n`;
            }
            
            if (totalCreated > 0) {
                report += `\n📊 Ефективність: <b>${Math.round((totalCompleted / totalCreated) * 100)}%</b>\n`;
            }
            
            const sortedByCompleted = Object.entries(userStats)
                .sort((a, b) => b[1].completed - a[1].completed);
            
            const sortedByOverdue = Object.entries(userStats)
                .filter(([_, s]) => s.overdue > 0)
                .sort((a, b) => b[1].overdue - a[1].overdue);
            
            if (sortedByCompleted.length > 0) {
                report += `\n🏆 <b>Найкращі:</b>\n`;
                for (const [_, s] of sortedByCompleted.slice(0, 3)) {
                    report += `✅ ${s.name}: ${s.completed} задач\n`;
                }
            }
            
            if (sortedByOverdue.length > 0) {
                report += `\n⚠️ <b>Потребують уваги:</b>\n`;
                for (const [_, s] of sortedByOverdue.slice(0, 3)) {
                    report += `❌ ${s.name}: ${s.overdue} прострочень\n`;
                }
            }
            
            const managersSnap = await db.collection('companies').doc(companyId)
                .collection('users')
                .where('role', 'in', ['owner', 'manager'])
                .get();
            
            for (const managerDoc of managersSnap.docs) {
                const managerData = managerDoc.data();
                if (managerData.weeklyReportEnabled === false) continue;
                if (managerData.telegramChatId) {
                    await sendTelegramMessage(managerData.telegramChatId, report);
                }
            }
        }
        
        return null;
    });
