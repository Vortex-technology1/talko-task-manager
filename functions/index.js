const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

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
