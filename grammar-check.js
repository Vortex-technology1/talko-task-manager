const fs = require('fs');

// Завантажуємо файл
const content = fs.readFileSync('./js/modules/01-translations-v2.js', 'utf-8');

// Функція для витягу всіх перекладів мови
function extractLanguageTranslations(content, lang) {
    const pattern = new RegExp(`\\b${lang}:\\s*\\{`, 'g');
    const match = pattern.exec(content);
    if (!match) return {};

    const startPos = match.index;

    // Знаходимо кінець секції
    const languages = ['ua', 'ru', 'en', 'de', 'cs'];
    const langIndex = languages.indexOf(lang);
    let endPos = content.length;

    for (let i = langIndex + 1; i < languages.length; i++) {
        const nextLang = languages[i];
        const nextPattern = new RegExp(`\\b${nextLang}:\\s*\\{`, 'g');
        const nextMatch = nextPattern.exec(content);
        if (nextMatch) {
            endPos = nextMatch.index;
            break;
        }
    }

    const langSection = content.substring(startPos, endPos);

    // Витягуємо ключ-значення пари
    const translations = {};
    const keyValuePattern = /([a-zA-Z_][a-zA-Z0-9_]*):\s*['"`]([^'"`]*?)['"`]/g;
    let m;

    while ((m = keyValuePattern.exec(langSection)) !== null) {
        const key = m[1];
        const value = m[2];
        if (value.length > 0) {
            translations[key] = value;
        }
    }

    return translations;
}

console.log('=== ДЕТАЛЬНИЙ ГРАМАТИЧНИЙ АНАЛІЗ ===\n');

const report = {
    ukrainian: [],
    english: [],
    german: [],
    czech: [],
    russian: []
};

// Завантажуємо переклади
const ua = extractLanguageTranslations(content, 'ua');
const ru = extractLanguageTranslations(content, 'ru');
const en = extractLanguageTranslations(content, 'en');
const de = extractLanguageTranslations(content, 'de');
const cs = extractLanguageTranslations(content, 'cs');

console.log('Кількість завантажених перекладів:');
console.log(`UA: ${Object.keys(ua).length}`);
console.log(`RU: ${Object.keys(ru).length}`);
console.log(`EN: ${Object.keys(en).length}`);
console.log(`DE: ${Object.keys(de).length}`);
console.log(`CS: ${Object.keys(cs).length}\n`);

// === УКРАЇНСЬКА ===
console.log('1. УКРАЇНСЬКА МОВА:\n');

Object.entries(ua).forEach(([key, text]) => {
    // Перевірка апострофів
    // Шукаємо слова де має бути апостроф: з'єднання, зв'язок, під'їзд тощо
    const needsApostrophe = /\b([зЗ])[єя](?!['])/g;
    if (needsApostrophe.test(text)) {
        report.ukrainian.push({
            key,
            text,
            issue: 'Можлива відсутність апострофа після "з" перед "є" або "я"',
            severity: 'MEDIUM',
            example: text.match(needsApostrophe)?.[0]
        });
    }

    // Перевірка подвійних пробілів
    if (text.includes('  ')) {
        report.ukrainian.push({
            key,
            text,
            issue: 'Подвійні пробіли',
            severity: 'LOW'
        });
    }

    // Перевірка латиниці в українському тексті (підозра на неправильний переклад)
    if (text.length > 5 && /[a-zA-Z]{5,}/.test(text) && !/<[^>]+>/.test(text)) {
        const latinWords = text.match(/[a-zA-Z]{5,}/g);
        if (latinWords && !['Google', 'Telegram', 'AI', 'Email', 'API', 'CRM', 'SMS', 'JSON', 'Excel', 'PDF', 'TALKO', 'Mono', 'IBAN'].some(tech => latinWords.some(w => w.includes(tech)))) {
            report.ukrainian.push({
                key,
                text,
                issue: 'Багато латиниці в українському тексті (можливо неправильний переклад)',
                severity: 'HIGH',
                latinWords: latinWords.join(', ')
            });
        }
    }
});

console.log(`Знайдено ${report.ukrainian.length} потенційних проблем\n`);

// === АНГЛІЙСЬКА ===
console.log('2. АНГЛІЙСЬКА МОВА:\n');

Object.entries(en).forEach(([key, text]) => {
    // Перевірка артиклів a/an
    const wrongArticle = /\ba\s+[aeiouAEIOU]/g;
    if (wrongArticle.test(text)) {
        report.english.push({
            key,
            text,
            issue: 'Неправильний артикль: "a" перед голосною (має бути "an")',
            severity: 'MEDIUM',
            example: text.match(wrongArticle)?.[0]
        });
    }

    // Перевірка множини після "are"
    const pluralIssue = /are\s+[a-z]+(?!s\b)/;
    if (pluralIssue.test(text)) {
        const match = text.match(pluralIssue)?.[0];
        if (match && !['are you', 'are there', 'are not', 'are being'].some(exc => match.includes(exc))) {
            report.english.push({
                key,
                text,
                issue: 'Можлива помилка множини після "are"',
                severity: 'LOW',
                example: match
            });
        }
    }

    // Подвійні пробіли
    if (text.includes('  ')) {
        report.english.push({
            key,
            text,
            issue: 'Подвійні пробіли',
            severity: 'LOW'
        });
    }
});

console.log(`Знайдено ${report.english.length} потенційних проблем\n`);

// === НІМЕЦЬКА ===
console.log('3. НІМЕЦЬКА МОВА:\n');

Object.entries(de).forEach(([key, text]) => {
    // Перевірка великих літер для іменників
    // Складна перевірка - шукаємо підозрілі випадки
    const words = text.split(/\s+/);
    words.forEach((word, idx) => {
        if (idx === 0 || word.length < 4) return; // Пропускаємо перше слово та короткі
        if (/<[^>]+>/.test(word)) return; // Пропускаємо HTML

        // Перевірка потенційних іменників без великої літери
        const cleanWord = word.replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
        if (/^[a-zäöü][a-zäöü]+ung$/.test(cleanWord)) {
            // Слова на -ung є іменниками і мають бути з великої
            report.german.push({
                key,
                text,
                issue: 'Іменник на -ung без великої літери',
                severity: 'MEDIUM',
                word: cleanWord
            });
        }

        if (/^[a-zäöü][a-zäöü]+heit$/.test(cleanWord)) {
            // Слова на -heit є іменниками
            report.german.push({
                key,
                text,
                issue: 'Іменник на -heit без великої літери',
                severity: 'MEDIUM',
                word: cleanWord
            });
        }

        if (/^[a-zäöü][a-zäöü]+keit$/.test(cleanWord)) {
            // Слова на -keit є іменниками
            report.german.push({
                key,
                text,
                issue: 'Іменник на -keit без великої літери',
                severity: 'MEDIUM',
                word: cleanWord
            });
        }
    });

    // Подвійні пробіли
    if (text.includes('  ')) {
        report.german.push({
            key,
            text,
            issue: 'Подвійні пробіли',
            severity: 'LOW'
        });
    }
});

console.log(`Знайдено ${report.german.length} потенційних проблем\n`);

// === ЧЕСЬКА ===
console.log('4. ЧЕСЬКА МОВА:\n');

Object.entries(cs).forEach(([key, text]) => {
    // Перевірка відсутності діакритики на довгих словах
    if (text.length > 10 && !/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(text) && /^[a-zA-Z\s]+$/.test(text)) {
        report.czech.push({
            key,
            text,
            issue: 'Відсутня діакритика в чеському тексті (підозра на неправильний переклад)',
            severity: 'HIGH'
        });
    }

    // Подвійні пробіли
    if (text.includes('  ')) {
        report.czech.push({
            key,
            text,
            issue: 'Подвійні пробіли',
            severity: 'LOW'
        });
    }
});

console.log(`Знайдено ${report.czech.length} потенційних проблем\n`);

// === РОСІЙСЬКА ===
console.log('5. РОСІЙСЬКА МОВА:\n');

Object.entries(ru).forEach(([key, text]) => {
    // Перевірка використання української "і" замість російської "и"
    if (/[а-яА-Я]\s+і\s+[а-яА-Я]/.test(text)) {
        report.russian.push({
            key,
            text,
            issue: 'Використання української "і" в російському тексті',
            severity: 'HIGH'
        });
    }

    // Подвійні пробіли
    if (text.includes('  ')) {
        report.russian.push({
            key,
            text,
            issue: 'Подвійні пробіли',
            severity: 'LOW'
        });
    }

    // Перевірка відсутності м'якого знаку де він потрібен
    // Наприклад: "виполнить" замість "выполнить"
});

console.log(`Знайдено ${report.russian.length} потенційних проблем\n`);

// Зберігаємо детальний звіт
fs.writeFileSync('./grammar-issues-report.json', JSON.stringify(report, null, 2), 'utf-8');

// Підсумок
console.log('=== ПІДСУМОК ГРАМАТИЧНОГО АНАЛІЗУ ===\n');
console.log(`Українська: ${report.ukrainian.length} проблем`);
console.log(`  - Високий пріоритет: ${report.ukrainian.filter(i => i.severity === 'HIGH').length}`);
console.log(`  - Середній: ${report.ukrainian.filter(i => i.severity === 'MEDIUM').length}`);
console.log(`  - Низький: ${report.ukrainian.filter(i => i.severity === 'LOW').length}\n`);

console.log(`Англійська: ${report.english.length} проблем`);
console.log(`  - Високий пріоритет: ${report.english.filter(i => i.severity === 'HIGH').length}`);
console.log(`  - Середній: ${report.english.filter(i => i.severity === 'MEDIUM').length}`);
console.log(`  - Низький: ${report.english.filter(i => i.severity === 'LOW').length}\n`);

console.log(`Німецька: ${report.german.length} проблем`);
console.log(`  - Високий пріоритет: ${report.german.filter(i => i.severity === 'HIGH').length}`);
console.log(`  - Середній: ${report.german.filter(i => i.severity === 'MEDIUM').length}`);
console.log(`  - Низький: ${report.german.filter(i => i.severity === 'LOW').length}\n`);

console.log(`Чеська: ${report.czech.length} проблем`);
console.log(`  - Високий пріоритет: ${report.czech.filter(i => i.severity === 'HIGH').length}`);
console.log(`  - Середній: ${report.czech.filter(i => i.severity === 'MEDIUM').length}`);
console.log(`  - Низький: ${report.czech.filter(i => i.severity === 'LOW').length}\n`);

console.log(`Російська: ${report.russian.length} проблем`);
console.log(`  - Високий пріоритет: ${report.russian.filter(i => i.severity === 'HIGH').length}`);
console.log(`  - Середній: ${report.russian.filter(i => i.severity === 'MEDIUM').length}`);
console.log(`  - Низький: ${report.russian.filter(i => i.severity === 'LOW').length}\n`);

console.log('📄 Детальний звіт: grammar-issues-report.json\n');
