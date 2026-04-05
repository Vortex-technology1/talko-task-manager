#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Знаходить російські слова в українських перекладах
"""
import json
import re

# Типові російські слова які НЕ повинні бути в українських перекладах
RUSSIAN_WORDS = [
    'выберите', 'сохранить', 'удалить', 'создать', 'редактировать',
    'выбрать', 'добавить', 'отменить', 'закрыть', 'открыть',
    'изменить', 'обновить', 'загрузить', 'скачать', 'поиск',
    'название', 'описание', 'комментарий', 'подтвердить',
    'отправить', 'получить', 'ввести', 'введите', 'выход', 'вход',
    'настройки', 'параметры', 'применить', 'войти', 'настроить',
    'счета', 'расходов', 'быстрый', 'старт', 'планирование',
    'недельный', 'план', 'заполнить', 'среднего', 'корректируйте',
    'вручную', 'сохранить', 'связи', 'модулей', 'сделка', 'выиграно',
    'автоматику', 'подключить', 'первые', 'транзакции', 'внести',
    'тип', 'сумма', 'категория', 'счёт', 'минимум', 'реальных',
    'текущий', 'месяц', 'первый'
]

def find_russian_in_translations():
    """Шукає російські слова в українських перекладах"""

    # Читаємо файл перекладів
    with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Витягуємо об'єкт translations
    # Шукаємо початок об'єкта translations
    start_match = re.search(r'const\s+translations\s*=\s*\{', content)
    if not start_match:
        print("❌ Не знайдено об'єкт translations")
        return

    # Знаходимо секцію ua
    ua_match = re.search(r'ua:\s*\{', content[start_match.end():])
    if not ua_match:
        print("❌ Не знайдено секцію ua")
        return

    ua_start = start_match.end() + ua_match.end()

    # Знаходимо кінець секції ua (наступна секція ru або en)
    ru_match = re.search(r'\n\s*\},?\s*\n\s*ru:\s*\{', content[ua_start:])
    if ru_match:
        ua_end = ua_start + ru_match.start()
    else:
        print("❌ Не знайдено кінець секції ua")
        return

    ua_content = content[ua_start:ua_end]

    # Шукаємо всі рядки виду: key: 'value' або key: "value"
    pattern = r'(\w+):\s*[\'"]([^\'"]+)[\'"]'
    matches = re.findall(pattern, ua_content, re.MULTILINE)

    problems = []

    for key, value in matches:
        # Перевіряємо кожне російське слово
        for russian_word in RUSSIAN_WORDS:
            # Шукаємо слово (case-insensitive)
            if re.search(r'\b' + re.escape(russian_word) + r'\b', value, re.IGNORECASE):
                problems.append({
                    'key': key,
                    'value': value,
                    'russian_word': russian_word,
                    'line': content[:ua_start + ua_content.find(f"{key}:")].count('\n') + 1
                })

    # Виводимо звіт
    print(f"\n{'='*80}")
    print(f"ROSIJSKI SLOVA V UKRAJINSKYX PEREKLADAX (ua)")
    print(f"{'='*80}\n")

    if not problems:
        print("[OK] Ne znaideno rosijskyx sliv v ukrajinskyx perekladax")
    else:
        print(f"[!!!] Znaideno {len(problems)} problem:\n")

        # Групуємо по російському слову
        by_word = {}
        for p in problems:
            word = p['russian_word']
            if word not in by_word:
                by_word[word] = []
            by_word[word].append(p)

        for russian_word, items in sorted(by_word.items()):
            print(f"\n[*] Slovo '{russian_word}' ({len(items)} vxodzhen):")
            for item in items[:5]:  # Показуємо перші 5
                print(f"   Ryadok {item['line']}: {item['key']}: '{item['value']}'")
            if len(items) > 5:
                print(f"   ... ta shche {len(items) - 5} vxodzhen")

    # Зберігаємо в JSON
    with open('russian-in-ua-report.json', 'w', encoding='utf-8') as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*80}")
    print(f"📄 Детальний звіт збережено у: russian-in-ua-report.json")
    print(f"{'='*80}\n")

    return problems

if __name__ == '__main__':
    find_russian_in_translations()
