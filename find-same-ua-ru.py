#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Знаходить ключі де RU та UA значення однакові (не перекладено)
"""
import re
import json

def find_same_ua_ru():
    """Знаходить ключі з однаковими UA та RU значеннями"""

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

    # Парсимо ключі з значеннями (single-line only)
    pattern = r"(\w+):\s*'([^']+)'"

    ua_dict = {}
    for match in re.finditer(pattern, ua_section):
        key, value = match.groups()
        ua_dict[key] = value

    ru_dict = {}
    for match in re.finditer(pattern, ru_section):
        key, value = match.groups()
        ru_dict[key] = value

    # Знаходимо однакові (тільки якщо містять кирилицю)
    same = {}
    for key in ua_dict:
        if key in ru_dict:
            ua_val = ua_dict[key]
            ru_val = ru_dict[key]
            if ua_val == ru_val and re.search(r'[а-яА-ЯіїєґІЇЄҐ]', ua_val):
                same[key] = ua_val

    print(f"Found {len(same)} keys where RU == UA")
    if same:
        print("\nExamples:")
        for i, (k, v) in enumerate(list(same.items())[:20]):
            print(f"  {k}: '{v}'")
        if len(same) > 20:
            print(f"  ... and {len(same) - 20} more")

    # Зберігаємо
    with open('same-ua-ru-keys.json', 'w', encoding='utf-8') as f:
        json.dump(same, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to: same-ua-ru-keys.json")
    return same

if __name__ == '__main__':
    find_same_ua_ru()
