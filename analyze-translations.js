const fs = require('fs');

// Завантажуємо файл
const content = fs.readFileSync('./js/modules/01-translations-v2.js', 'utf-8');

console.log('Аналізуємо файл перекладів...\n');

// Знаходимо початок та кінець кожної мови
const languages = ['ua', 'ru', 'en', 'de', 'cs'];
const langData = {};

languages.forEach(lang => {
    // Шукаємо початок мови
    const pattern = new RegExp(`\\b${lang}:\\s*\\{`, 'g');
    const match = pattern.exec(content);

    if (!match) {
        console.log(`❌ Мова ${lang} не знайдена`);
        langData[lang] = { exists: false, keys: new Set() };
        return;
    }

    console.log(`✓ Знайдено мову: ${lang} на позиції ${match.index}`);
    langData[lang] = { exists: true, keys: new Set(), startPos: match.index };
});

// Простий підхід: знайдемо всі можливі ключі регулярним виразом
console.log('\nВитягуємо ключі перекладів...\n');

// Шукаємо всі ключі у форматі: ключ: 'значення' або ключ: "значення"
const keyPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*):\s*['"`]/g;
let match;
const allPossibleKeys = new Set();

while ((match = keyPattern.exec(content)) !== null) {
    const key = match[1];
    // Виключаємо самі назви мов
    if (!languages.includes(key)) {
        allPossibleKeys.add(key);
    }
}

console.log(`Знайдено ${allPossibleKeys.size} унікальних ключів\n`);

// Для кожної мови підрахуємо які ключі є
const report = {
    totalKeys: allPossibleKeys.size,
    languages: {},
    missingKeys: {},
    placeholderIssues: [],
    htmlIssues: [],
    criticalIssues: []
};

languages.forEach(lang => {
    if (!langData[lang].exists) {
        report.missingKeys[lang] = Array.from(allPossibleKeys);
        report.criticalIssues.push({
            severity: 'CRITICAL',
            lang,
            issue: 'Мова відсутня повністю'
        });
        return;
    }

    // Знаходимо секцію мови
    const langStart = langData[lang].startPos;

    // Знаходимо кінець секції (наступна мова або кінець об'єкта)
    let langEnd = content.length;
    const nextLangIndex = languages.findIndex(l => l === lang) + 1;
    if (nextLangIndex < languages.length) {
        const nextLang = languages[nextLangIndex];
        if (langData[nextLang].exists) {
            langEnd = langData[nextLang].startPos;
        }
    }

    const langSection = content.substring(langStart, langEnd);

    // Підраховуємо які ключі є в цій секції
    const foundKeys = new Set();
    allPossibleKeys.forEach(key => {
        const keyRegex = new RegExp(`\\b${key}:\\s*['"\`]`, 'g');
        if (keyRegex.test(langSection)) {
            foundKeys.add(key);
        }
    });

    const missing = [];
    allPossibleKeys.forEach(key => {
        if (!foundKeys.has(key)) {
            missing.push(key);
        }
    });

    report.languages[lang] = {
        totalKeys: foundKeys.size,
        missingCount: missing.length,
        coverage: ((foundKeys.size / allPossibleKeys.size) * 100).toFixed(2) + '%'
    };

    if (missing.length > 0) {
        report.missingKeys[lang] = missing;
    }
});

// Детальна перевірка проблем з плейсхолдерами та HTML
console.log('Перевіряємо плейсхолдери та HTML...\n');

// Функція для витягу значення ключа
function extractValue(text, key, lang) {
    // Шукаємо key: 'value' або key: "value" або key: `value`
    const patterns = [
        new RegExp(`${key}:\\s*'([^']*)'`, 'g'),
        new RegExp(`${key}:\\s*"([^"]*)"`, 'g'),
        new RegExp(`${key}:\\s*\`([^\`]*)\``, 'g')
    ];

    for (let pattern of patterns) {
        const match = pattern.exec(text);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Вибіркова перевірка ключів з HTML та плейсхолдерами
const sampleKeys = [
    'noAccessText', 'contactSupport', 'registerHint', 'deleteCompanyConfirm',
    'taskLimitWarning', 'restorePartial', 'deadlineExceedsProject',
    'finBaseCurrencyHint', 'finRateNotSet', 'finTransferDone'
];

sampleKeys.forEach(key => {
    const values = {};
    languages.forEach(lang => {
        if (!langData[lang].exists) return;

        const langStart = langData[lang].startPos;
        let langEnd = content.length;
        const nextLangIndex = languages.findIndex(l => l === lang) + 1;
        if (nextLangIndex < languages.length && langData[languages[nextLangIndex]].exists) {
            langEnd = langData[languages[nextLangIndex]].startPos;
        }
        const langSection = content.substring(langStart, langEnd);

        const value = extractValue(langSection, key, lang);
        if (value) {
            values[lang] = value;
        }
    });

    // Перевірка плейсхолдерів
    const placeholders = {};
    let hasPlaceholders = false;
    Object.entries(values).forEach(([lang, text]) => {
        const found = text.match(/\{[^}]+\}|\%s|\$\d+/g) || [];
        if (found.length > 0) {
            placeholders[lang] = found.sort().join(', ');
            hasPlaceholders = true;
        }
    });

    if (hasPlaceholders) {
        const unique = new Set(Object.values(placeholders));
        if (unique.size > 1) {
            report.placeholderIssues.push({
                key,
                placeholders,
                severity: 'HIGH',
                issue: 'Плейсхолдери не співпадають між мовами'
            });
        }
    }

    // Перевірка HTML
    const htmlTags = {};
    let hasHtml = false;
    Object.entries(values).forEach(([lang, text]) => {
        const found = text.match(/<[^>]+>/g) || [];
        if (found.length > 0) {
            htmlTags[lang] = found.join(', ');
            hasHtml = true;
        }
    });

    if (hasHtml) {
        const unique = new Set(Object.values(htmlTags));
        if (unique.size > 1) {
            report.htmlIssues.push({
                key,
                htmlTags,
                severity: 'HIGH',
                issue: 'HTML теги не співпадають між мовами'
            });
        }
    }
});

// Зберігаємо звіт
fs.writeFileSync('./translation-analysis-report.json', JSON.stringify(report, null, 2), 'utf-8');

// Виводимо результати
console.log('========================================');
console.log('ЗВІТ ПРО АНАЛІЗ ПЕРЕКЛАДІВ');
console.log('========================================\n');

console.log('📊 ЗАГАЛЬНА СТАТИСТИКА:\n');
console.log(`Всього унікальних ключів: ${report.totalKeys}`);
console.log(`Кількість мов: ${languages.length} (ua, ru, en, de, cs)\n`);

console.log('📈 ПОКРИТТЯ ПО МОВАХ:\n');
languages.forEach(lang => {
    if (report.languages[lang]) {
        const data = report.languages[lang];
        const status = data.missingCount === 0 ? '✅' : '⚠️';
        console.log(`${status} ${lang.toUpperCase()}: ${data.totalKeys}/${report.totalKeys} ключів (${data.coverage})`);
        if (data.missingCount > 0) {
            console.log(`   ❌ Відсутні: ${data.missingCount} ключів`);
        }
    } else {
        console.log(`❌ ${lang.toUpperCase()}: МОВА ВІДСУТНЯ`);
    }
});

console.log('\n🔴 КРИТИЧНІ ПРОБЛЕМИ:\n');
if (report.criticalIssues.length === 0) {
    console.log('✅ Немає критичних проблем (всі мови присутні)\n');
} else {
    report.criticalIssues.forEach(issue => {
        console.log(`❌ ${issue.lang.toUpperCase()}: ${issue.issue}`);
    });
}

console.log('🟠 ВИСОКИЙ ПРІОРИТЕТ:\n');
console.log(`Проблем з плейсхолдерами: ${report.placeholderIssues.length}`);
if (report.placeholderIssues.length > 0) {
    report.placeholderIssues.slice(0, 5).forEach(issue => {
        console.log(`  - ${issue.key}`);
        Object.entries(issue.placeholders).forEach(([lang, ph]) => {
            console.log(`    ${lang}: ${ph}`);
        });
    });
    if (report.placeholderIssues.length > 5) {
        console.log(`  ... та ще ${report.placeholderIssues.length - 5}`);
    }
}

console.log(`\nПроблем з HTML тегами: ${report.htmlIssues.length}`);
if (report.htmlIssues.length > 0) {
    report.htmlIssues.slice(0, 5).forEach(issue => {
        console.log(`  - ${issue.key}`);
        Object.entries(issue.htmlTags).forEach(([lang, tags]) => {
            console.log(`    ${lang}: ${tags}`);
        });
    });
    if (report.htmlIssues.length > 5) {
        console.log(`  ... та ще ${report.htmlIssues.length - 5}`);
    }
}

console.log('\n🟡 СЕРЕДНІЙ ПРІОРИТЕТ:\n');
console.log('Відсутні ключі по мовах:');
Object.entries(report.missingKeys).forEach(([lang, keys]) => {
    if (keys.length > 0) {
        console.log(`  ${lang.toUpperCase()}: ${keys.length} відсутніх ключів`);
        console.log(`    Приклади: ${keys.slice(0, 10).join(', ')}`);
        if (keys.length > 10) {
            console.log(`    ... та ще ${keys.length - 10}`);
        }
    }
});

console.log('\n📄 Детальний звіт збережено у: translation-analysis-report.json');
console.log('========================================\n');
