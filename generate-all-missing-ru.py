#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генерує RU переклади для ВСІХ відсутніх ключів
"""
import re
import json

def find_missing_ru_keys():
    """Знаходить всі відсутні RU ключі та їх UA значення"""

    with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # UA keys
    ua_start = content.find('ua: {')
    ua_end = content.find('ru: {', ua_start)
    ua_section = content[ua_start:ua_end]

    # RU keys
    ru_start = content.find('ru: {', ua_end)
    ru_end = content.find('en: {', ru_start)
    ru_section = content[ru_start:ru_end]

    # Парсимо UA ключі з значеннями
    ua_pattern = r"(\w+):\s*['\"]([^'\"]+)['\"]"
    ua_dict = {}
    for match in re.finditer(ua_pattern, ua_section):
        key, value = match.groups()
        ua_dict[key] = value

    # Парсимо RU ключі
    ru_keys = set()
    for match in re.finditer(r'(\w+):\s*[\'"]', ru_section):
        ru_keys.add(match.group(1))

    # Знаходимо відсутні
    missing = {}
    for key, ua_value in ua_dict.items():
        if key not in ru_keys:
            missing[key] = ua_value

    print(f"Found {len(missing)} missing RU keys")

    # Зберігаємо в JSON для подальшого перекладу
    with open('missing-ru-keys-full.json', 'w', encoding='utf-8') as f:
        json.dump(missing, f, ensure_ascii=False, indent=2)

    print(f"Saved to: missing-ru-keys-full.json")
    print(f"\nFirst 20 keys:")
    for i, (k, v) in enumerate(list(missing.items())[:20]):
        print(f"  {k}: '{v}'")

    return missing

if __name__ == '__main__':
    find_missing_ru_keys()
