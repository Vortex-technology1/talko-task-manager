#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Додає відсутні RU переклади до файлу translations
"""
import re
import json

# Простий словник для автоматичного перекладу UA->RU
# Для професійних перекладів краще використати GPT, але для базових слів можна так
UA_TO_RU_BASIC = {
    # Вже є в missing-ru-translations.json
}

def add_missing_ru_translations():
    """Додає відсутні RU переклади"""

    # Читаємо згенеровані переклади
    with open('missing-ru-translations.json', 'r', encoding='utf-8') as f:
        translations = json.load(f)

    # Читаємо файл перекладів
    with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Знаходимо секцію RU
    ru_match = re.search(r'(\n\s+)ru:\s*\{', content)
    if not ru_match:
        print("ERROR: ru section not found")
        return

    indent = ru_match.group(1)  # Зберігаємо відступ

    # Знаходимо кінець секції RU (перед pl:)
    pl_match = re.search(r'\n\s+\},?\s*\n\s+pl:\s*\{', content)
    if not pl_match:
        print("ERROR: pl section not found")
        return

    ru_end_pos = pl_match.start()

    # Витягуємо секцію RU
    ru_section = content[ru_match.end():ru_end_pos]

    # Знаходимо всі існуючі ключі в RU
    existing_keys = set()
    for match in re.finditer(r'(\w+):\s*[\'"]', ru_section):
        existing_keys.add(match.group(1))

    print(f"Existing RU keys: {len(existing_keys)}")

    # Готуємо нові ключі для додавання
    new_lines = []
    added_count = 0

    for key, values in translations.items():
        if key not in existing_keys:
            ru_value = values['ru']
            # Escape одинарні лапки
            ru_value = ru_value.replace("'", "\\'")
            new_lines.append(f"{indent}    {key}: '{ru_value}',")
            added_count += 1

    if added_count == 0:
        print("No keys to add - all translations are already present!")
        return

    print(f"Adding {added_count} new keys...")

    # Знаходимо останній ключ в RU секції
    # Шукаємо останню кому перед закриваючою дужкою
    last_key_match = None
    for match in re.finditer(r"(\w+):\s*'[^']*',?\s*\n", ru_section):
        last_key_match = match

    if not last_key_match:
        print("ERROR: cannot find last key in RU section")
        return

    # Позиція після останнього ключа
    insert_pos = ru_match.end() + last_key_match.end()

    # Вставляємо нові ключі
    new_content = (
        content[:insert_pos] +
        '\n'.join(new_lines) + '\n' +
        content[insert_pos:]
    )

    # Записуємо назад
    with open('js/modules/01-translations-v2.js', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"SUCCESS: Added {added_count} RU translations!")
    print("Keys added:")
    for line in new_lines[:10]:
        key = line.strip().split(':')[0].strip()
        print(f"  - {key}")
    if len(new_lines) > 10:
        print(f"  ... and {len(new_lines) - 10} more")

if __name__ == '__main__':
    add_missing_ru_translations()
