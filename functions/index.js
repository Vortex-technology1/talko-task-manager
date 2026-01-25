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
async function sendTelegramMessage(chatId, text) {
    try {
        const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
        return response.json();
    } catch (error) {
        console.error('Telegram send error:', error);
        return null;
    }
}

// ===========================
// 1. НОВЕ ЗАВДАННЯ
// ===========================
exports.onNewTask = functions.firestore
    .document('companies/{companyId}/tasks/{taskId}')
    .onCreate(async (snap, context) => {
        const task = snap.data();
        const { companyId } = context.params;
        
        if (!task.assigneeId) return null;
        
        // Отримуємо Telegram chat_id виконавця
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
        
        return sendTelegramMessage(chatId, message);
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
        
        // Перевіряємо чи змінився статус на done
        if (before.status === after.status || after.status !== 'done') return null;
        
        // Отримуємо список тих, кого сповістити
        const notifyUsers = after.notifyOnComplete || [];
        if (notifyUsers.length === 0) return null;
        
        // Не сповіщаємо виконавця (він і так знає що виконав)
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
            // Перевіряємо чи є код реєстрації
            const parts = text.split(' ');
            if (parts.length > 1) {
                const registrationCode = parts[1];
                
                // Шукаємо користувача з таким кодом
                const companiesSnap = await db.collection('companies').get();
                
                for (const companyDoc of companiesSnap.docs) {
                    const usersSnap = await companyDoc.ref.collection('users')
                        .where('telegramCode', '==', registrationCode).get();
                    
                    if (!usersSnap.empty) {
                        const userDoc = usersSnap.docs[0];
                        await userDoc.ref.update({
                            telegramChatId: chatId.toString(),
                            telegramUserId: userId.toString(),
                            telegramCode: null // Видаляємо код після використання
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
// Приймає заявки з сайту і автоматично створює процес
exports.leadWebhook = functions.https.onRequest(async (req, res) => {
    // CORS headers
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
            companyId,      // ID компанії (обов'язково)
            apiKey,         // API ключ для авторизації
            name,           // Ім'я ліда
            phone,          // Телефон
            email,          // Email
            source,         // Джерело (сайт, реклама, тощо)
            message,        // Повідомлення/коментар
            processTemplate // Назва шаблону процесу для запуску
        } = req.body;
        
        // Валідація
        if (!companyId) {
            return res.status(400).json({ error: 'companyId is required' });
        }
        
        // Перевірка API ключа компанії
        const companyDoc = await db.collection('companies').doc(companyId).get();
        if (!companyDoc.exists) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        const companyData = companyDoc.data();
        if (companyData.webhookApiKey && companyData.webhookApiKey !== apiKey) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().slice(0, 5);
        
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
            // Створюємо процес
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
            
            // 4. Створюємо першу задачу з процесу
            const firstStep = templateToUse.steps[0];
            
            // Знаходимо виконавців функції
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
                    
                    // Отримуємо ім'я виконавця
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(assigneeId).get();
                    if (userDoc.exists) {
                        assigneeName = userDoc.data().name || userDoc.data().email || '';
                    }
                }
            }
            
            // Дедлайн через 15 хвилин для першого дзвінка
            const deadline = new Date(now.getTime() + 15 * 60 * 1000);
            const deadlineDate = deadline.toISOString().split('T')[0];
            const deadlineTime = deadline.toTimeString().slice(0, 5);
            
            await db.collection('companies').doc(companyId)
                .collection('tasks').add({
                    title: `${firstStep.name} - ${name || phone || 'Новий лід'}`,
                    function: firstStep.function,
                    assigneeId: assigneeId,
                    assigneeName: assigneeName,
                    description: `${firstStep.instruction || ''}\n\n📞 Телефон: ${phone || '-'}\n📧 Email: ${email || '-'}\n💬 Коментар: ${message || '-'}\n🔗 Джерело: ${source || 'Сайт'}`,
                    expectedResult: firstStep.expectedResult || 'Зв\'язатися з клієнтом',
                    deadlineDate: deadlineDate,
                    deadlineTime: deadlineTime,
                    deadline: admin.firestore.Timestamp.fromDate(deadline),
                    status: 'new',
                    priority: 'high',
                    processId: processId,
                    processStep: 0,
                    leadId: leadRef.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isAutoGenerated: true,
                    escalationEnabled: true,
                    escalationMinutes: 15 // Якщо не виконано за 15 хв - ескалація
                });
        } else {
            // Якщо немає шаблону - створюємо просту задачу
            // Шукаємо функцію "Адміністрування" або першу доступну
            const funcsSnap = await db.collection('companies').doc(companyId)
                .collection('functions')
                .limit(1)
                .get();
            
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
        
        // 5. Сповіщення в Telegram всім менеджерам
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
// Запускається кожні 5 хвилин - перевіряє ВСІ задачі
exports.checkOverdueTasks = functions.pubsub
    .schedule('every 5 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            
            // ========================================
            // 1. ПРОСТРОЧЕНІ ЗАДАЧІ (всі типи)
            // ========================================
            const tasksSnap = await db.collection('companies').doc(companyId)
                .collection('tasks')
                .where('status', 'in', ['new', 'progress'])
                .get();
            
            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                if (!task.deadline) continue;
                
                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                
                // Перевіряємо чи прострочено
                if (now <= deadline) continue;
                if (task.overdueNotified) continue; // Вже сповіщували
                
                // Скільки хвилин прострочено
                const overdueMinutes = Math.floor((now - deadline) / (1000 * 60));
                
                // Визначаємо тип задачі для повідомлення
                let taskType = '📋 Розпорядження';
                if (task.processId) taskType = '🟣 Бізнес-процес';
                else if (task.regularTaskId) taskType = '🟠 Регулярна задача';
                
                // Сповіщення виконавцю
                if (task.assigneeId) {
                    const userDoc = await db.collection('companies').doc(companyId)
                        .collection('users').doc(task.assigneeId).get();
                    
                    if (userDoc.exists && userDoc.data().telegramChatId) {
                        await sendTelegramMessage(userDoc.data().telegramChatId,
                            `⚠️ <b>ПРОСТРОЧЕНО!</b>\n\n` +
                            `${taskType}\n` +
                            `📌 ${task.title}\n` +
                            `⏰ Прострочено на ${overdueMinutes} хв\n\n` +
                            `Терміново виконайте задачу!`
                        );
                    }
                }
                
                // Сповіщення менеджерам/власникам
                const managersSnap = await db.collection('companies').doc(companyId)
                    .collection('users')
                    .where('role', 'in', ['owner', 'manager'])
                    .get();
                
                for (const managerDoc of managersSnap.docs) {
                    if (managerDoc.id === task.assigneeId) continue;
                    const managerData = managerDoc.data();
                    if (managerData.telegramChatId) {
                        await sendTelegramMessage(managerData.telegramChatId,
                            `⚠️ <b>Задача прострочена!</b>\n\n` +
                            `${taskType}\n` +
                            `📌 ${task.title}\n` +
                            `👤 Виконавець: ${task.assigneeName || 'Не призначено'}\n` +
                            `⏰ Прострочено на ${overdueMinutes} хв`
                        );
                    }
                }
                
                // Позначаємо що сповістили
                await taskDoc.ref.update({ 
                    overdueNotified: true,
                    overdueNotifiedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                // ========================================
                // ЕСКАЛАЦІЯ (якщо увімкнена)
                // ========================================
                if (task.escalationEnabled && task.escalationMinutes) {
                    const escalationTime = new Date(deadline.getTime() + task.escalationMinutes * 60 * 1000);
                    
                    if (now >= escalationTime && !task.escalated) {
                        // Створюємо follow-up задачу
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
            
            // ========================================
            // 2. ПРОСТРОЧЕНІ БІЗНЕС-ПРОЦЕСИ
            // ========================================
            const processesSnap = await db.collection('companies').doc(companyId)
                .collection('processes')
                .where('status', '==', 'active')
                .get();
            
            for (const processDoc of processesSnap.docs) {
                const process = processDoc.data();
                if (!process.steps || process.currentStep === undefined) continue;
                
                const currentStepData = process.steps[process.currentStep];
                if (!currentStepData || currentStepData.status !== 'active') continue;
                
                // Перевіряємо чи є дедлайн етапу
                if (currentStepData.deadline) {
                    const stepDeadline = currentStepData.deadline.toDate ? 
                        currentStepData.deadline.toDate() : new Date(currentStepData.deadline);
                    
                    if (now > stepDeadline && !currentStepData.overdueNotified) {
                        const overdueMinutes = Math.floor((now - stepDeadline) / (1000 * 60));
                        
                        // Сповіщення менеджерам
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
                        
                        // Оновлюємо статус
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
// Коли задача процесу виконана - відкриваємо наступний етап
exports.onProcessTaskCompleted = functions.firestore
    .document('companies/{companyId}/tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const { companyId, taskId } = context.params;
        
        // Перевіряємо чи це задача процесу і чи змінився статус на done
        if (!after.processId) return null;
        if (before.status === after.status || after.status !== 'done') return null;
        
        // Отримуємо процес
        const processRef = db.collection('companies').doc(companyId)
            .collection('processes').doc(after.processId);
        const processDoc = await processRef.get();
        
        if (!processDoc.exists) return null;
        
        const process = processDoc.data();
        const currentStep = after.processStep;
        
        // Оновлюємо статус етапу
        const updatedSteps = [...process.steps];
        if (updatedSteps[currentStep]) {
            updatedSteps[currentStep].status = 'completed';
            updatedSteps[currentStep].completedAt = admin.firestore.FieldValue.serverTimestamp();
        }
        
        // Перевіряємо чи є наступний етап
        const nextStep = currentStep + 1;
        
        if (nextStep < updatedSteps.length) {
            // Активуємо наступний етап
            updatedSteps[nextStep].status = 'active';
            
            await processRef.update({
                steps: updatedSteps,
                currentStep: nextStep
            });
            
            // Створюємо задачу для наступного етапу
            const stepData = updatedSteps[nextStep];
            
            // Знаходимо виконавця функції
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
            
            // Визначаємо дедлайн (через estimatedTime хвилин або 24 години)
            const now = new Date();
            const minutes = parseInt(stepData.estimatedTime) || 1440; // 24 години default
            const deadline = new Date(now.getTime() + minutes * 60 * 1000);
            
            // Створюємо задачу
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
            
            // ========================================
            // СПОВІЩЕННЯ ПРО ПЕРЕХІД НА НОВИЙ ЕТАП
            // ========================================
            
            // Сповіщення новому виконавцю
            if (assigneeId) {
                const assigneeDoc = await db.collection('companies').doc(companyId)
                    .collection('users').doc(assigneeId).get();
                
                if (assigneeDoc.exists && assigneeDoc.data().telegramChatId) {
                    await sendTelegramMessage(assigneeDoc.data().telegramChatId,
                        `🔔 <b>Новий етап процесу!</b>\n\n` +
                        `📋 Процес: ${process.name}\n` +
                        `📍 Етап ${nextStep + 1}/${process.steps.length}: ${stepData.name}\n` +
                        `⏰ Дедлайн: ${deadline.toLocaleString('uk-UA')}\n\n` +
                        `${stepData.instruction ? `📝 ${stepData.instruction}` : ''}`
                    );
                }
            }
            
            // Сповіщення менеджерам про прогрес процесу
            const managersSnap = await db.collection('companies').doc(companyId)
                .collection('users')
                .where('role', 'in', ['owner', 'manager'])
                .get();
            
            for (const managerDoc of managersSnap.docs) {
                if (managerDoc.id === assigneeId) continue; // Вже сповістили
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
            // Процес завершено!
            await processRef.update({
                steps: updatedSteps,
                status: 'completed',
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Сповіщення про завершення процесу
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
// Перевіряє чи є задачі які потрібно активувати
exports.checkScheduledTasks = functions.pubsub
    .schedule('every 15 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            
            // Шукаємо відкладені задачі які пора активувати
            const scheduledSnap = await db.collection('companies').doc(companyId)
                .collection('scheduledTasks')
                .where('activateAt', '<=', admin.firestore.Timestamp.fromDate(now))
                .where('activated', '==', false)
                .get();
            
            for (const schedDoc of scheduledSnap.docs) {
                const schedTask = schedDoc.data();
                
                // Створюємо реальну задачу
                await db.collection('companies').doc(companyId)
                    .collection('tasks').add({
                        ...schedTask.taskData,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        isAutoGenerated: true,
                        scheduledTaskId: schedDoc.id
                    });
                
                // Позначаємо як активовану
                await schedDoc.ref.update({ activated: true });
                
                console.log(`Activated scheduled task ${schedDoc.id} in company ${companyId}`);
            }
        }
        
        return null;
    });

// ===========================
// 8. SCHEDULED: НАГАДУВАННЯ ДО ДЕДЛАЙНУ
// ===========================
// Запускається кожні 5 хвилин - перевіряє задачі які скоро закінчуються
exports.sendReminders = functions.pubsub
    .schedule('every 5 minutes')
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            
            // Отримуємо активні задачі
            const tasksSnap = await db.collection('companies').doc(companyId)
                .collection('tasks')
                .where('status', 'in', ['new', 'progress'])
                .get();
            
            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                if (!task.deadline) continue;
                
                const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                const minutesUntilDeadline = Math.floor((deadline - now) / (1000 * 60));
                
                // Пропускаємо якщо вже прострочено
                if (minutesUntilDeadline < 0) continue;
                
                // Налаштування нагадувань (з задачі або дефолтні)
                const reminders = task.reminders || [60, 15]; // За 60 і 15 хвилин
                const sentReminders = task.sentReminders || [];
                
                for (const reminderMinutes of reminders) {
                    // Перевіряємо чи час нагадування (±3 хвилини для точності)
                    if (minutesUntilDeadline <= reminderMinutes + 3 && 
                        minutesUntilDeadline >= reminderMinutes - 3 &&
                        !sentReminders.includes(reminderMinutes)) {
                        
                        // Визначаємо тип задачі
                        let taskType = '📋 Розпорядження';
                        if (task.processId) taskType = '🟣 Бізнес-процес';
                        else if (task.regularTaskId) taskType = '🟠 Регулярна задача';
                        
                        // Форматуємо час
                        let timeText = '';
                        if (reminderMinutes >= 60) {
                            timeText = `${Math.floor(reminderMinutes / 60)} год`;
                        } else {
                            timeText = `${reminderMinutes} хв`;
                        }
                        
                        // Сповіщення виконавцю
                        if (task.assigneeId) {
                            const userDoc = await db.collection('companies').doc(companyId)
                                .collection('users').doc(task.assigneeId).get();
                            
                            if (userDoc.exists && userDoc.data().telegramChatId) {
                                await sendTelegramMessage(userDoc.data().telegramChatId,
                                    `⏰ <b>Нагадування!</b>\n\n` +
                                    `${taskType}\n` +
                                    `📌 ${task.title}\n\n` +
                                    `⏳ До дедлайну: ${timeText}\n` +
                                    `🕐 Дедлайн: ${task.deadlineTime || ''}`
                                );
                            }
                        }
                        
                        // Сповіщення тим хто в списку контролю
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
                        
                        // Позначаємо що нагадування відправлено
                        sentReminders.push(reminderMinutes);
                        await taskDoc.ref.update({ sentReminders: sentReminders });
                    }
                }
            }
        }
        
        return null;
    });

// ===========================
// 9. SCHEDULED: РАНКОВИЙ ЗВІТ (щодня о 9:00)
// ===========================
exports.dailyReport = functions.pubsub
    .schedule('0 9 * * *')  // Кожен день о 9:00
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        // Вчора
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const companiesSnap = await db.collection('companies').get();
        
        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            
            // Пропускаємо якщо звіти вимкнені
            if (companyData.dailyReportEnabled === false) continue;
            
            // Статистика
            let todayTasks = 0;
            let overdueTasks = 0;
            let completedYesterday = 0;
            const userStats = {};
            
            // Отримуємо всі задачі
            const tasksSnap = await db.collection('companies').doc(companyId)
                .collection('tasks').get();
            
            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                
                // Задачі на сьогодні
                if (task.deadlineDate === todayStr && task.status !== 'done') {
                    todayTasks++;
                }
                
                // Прострочені
                if (task.deadline && task.status !== 'done') {
                    const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
                    if (deadline < now) {
                        overdueTasks++;
                        
                        // Статистика по виконавцях
                        if (task.assigneeId) {
                            if (!userStats[task.assigneeId]) {
                                userStats[task.assigneeId] = { name: task.assigneeName, completed: 0, overdue: 0 };
                            }
                            userStats[task.assigneeId].overdue++;
                        }
                    }
                }
                
                // Виконані вчора
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
            
            // Формуємо звіт
            let report = `📊 <b>Ранковий звіт</b>\n`;
            report += `📅 ${now.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n`;
            
            report += `📋 На сьогодні: <b>${todayTasks}</b> задач\n`;
            report += `✅ Виконано вчора: <b>${completedYesterday}</b>\n`;
            
            if (overdueTasks > 0) {
                report += `\n⚠️ <b>Прострочено: ${overdueTasks}</b>\n`;
            }
            
            // Топ виконавців
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
                // Перевіряємо чи хоче отримувати звіти
                if (managerData.dailyReportEnabled === false) continue;
                
                if (managerData.telegramChatId) {
                    await sendTelegramMessage(managerData.telegramChatId, report);
                }
            }
        }
        
        return null;
    });

// ===========================
// 10. SCHEDULED: ТИЖНЕВИЙ ЗВІТ (понеділок о 9:00)
// ===========================
exports.weeklyReport = functions.pubsub
    .schedule('0 9 * * 1')  // Кожен понеділок о 9:00
    .timeZone('Europe/Kyiv')
    .onRun(async (context) => {
        const now = new Date();
        
        // Минулий тиждень
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
            let avgCompletionTime = 0;
            let completionTimes = [];
            const userStats = {};
            
            const tasksSnap = await db.collection('companies').doc(companyId)
                .collection('tasks').get();
            
            for (const taskDoc of tasksSnap.docs) {
                const task = taskDoc.data();
                
                // Створені за тиждень
                if (task.createdAt) {
                    const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                    if (created >= weekAgo) {
                        totalCreated++;
                    }
                }
                
                // Виконані за тиждень
                if (task.status === 'done' && task.completedAt) {
                    const completed = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
                    if (completed >= weekAgo) {
                        totalCompleted++;
                        
                        // Час виконання
                        if (task.createdAt) {
                            const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                            const hours = (completed - created) / (1000 * 60 * 60);
                            completionTimes.push(hours);
                        }
                        
                        // Статистика по користувачах
                        if (task.assigneeId) {
                            if (!userStats[task.assigneeId]) {
                                userStats[task.assigneeId] = { name: task.assigneeName, completed: 0, overdue: 0 };
                            }
                            userStats[task.assigneeId].completed++;
                        }
                    }
                }
                
                // Прострочені
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
            
            // Середній час виконання
            if (completionTimes.length > 0) {
                avgCompletionTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
            }
            
            // Формуємо звіт
            let report = `📈 <b>Тижневий звіт</b>\n`;
            report += `📅 ${weekAgo.toLocaleDateString('uk-UA')} - ${now.toLocaleDateString('uk-UA')}\n\n`;
            
            report += `📊 <b>Загальна статистика:</b>\n`;
            report += `📝 Створено: ${totalCreated}\n`;
            report += `✅ Виконано: ${totalCompleted}\n`;
            report += `⚠️ Прострочено: ${totalOverdue}\n`;
            
            if (avgCompletionTime > 0) {
                const avgHours = Math.round(avgCompletionTime);
                report += `⏱ Сер. час виконання: ${avgHours} год\n`;
            }
            
            // Ефективність
            if (totalCreated > 0) {
                const efficiency = Math.round((totalCompleted / totalCreated) * 100);
                report += `\n📊 Ефективність: <b>${efficiency}%</b>\n`;
            }
            
            // Топ і антитоп
            const sortedByCompleted = Object.entries(userStats)
                .sort((a, b) => b[1].completed - a[1].completed);
            
            const sortedByOverdue = Object.entries(userStats)
                .filter(([_, stats]) => stats.overdue > 0)
                .sort((a, b) => b[1].overdue - a[1].overdue);
            
            if (sortedByCompleted.length > 0) {
                report += `\n🏆 <b>Найкращі:</b>\n`;
                for (const [_, stats] of sortedByCompleted.slice(0, 3)) {
                    report += `✅ ${stats.name}: ${stats.completed} задач\n`;
                }
            }
            
            if (sortedByOverdue.length > 0) {
                report += `\n⚠️ <b>Потребують уваги:</b>\n`;
                for (const [_, stats] of sortedByOverdue.slice(0, 3)) {
                    report += `❌ ${stats.name}: ${stats.overdue} прострочень\n`;
                }
            }
            
            // Відправляємо
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
