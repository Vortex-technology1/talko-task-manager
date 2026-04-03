#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Аналізує російську локалізацію - шукає відсутні та неперекладені ключі
"""
import re
import json

def analyze_ru_translations():
    """Аналізує ru переклади"""

    # Читаємо файл перекладів
    with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Знаходимо об'єкт translations
    start_match = re.search(r'const\s+translations\s*=\s*\{', content)
    if not start_match:
        print("ERROR: translations object not found")
        return

    # Витягуємо секції ua та ru
    # UA секція
    ua_match = re.search(r'ua:\s*\{', content[start_match.end():])
    ua_start = start_match.end() + ua_match.end()
    ru_match = re.search(r'\n\s*\},?\s*\n\s*ru:\s*\{', content[ua_start:])
    ua_end = ua_start + ru_match.start()
    ua_content = content[ua_start:ua_end]

    # RU секція
    ru_start = ua_end + ru_match.end()
    en_match = re.search(r'\n\s*\},?\s*\n\s*en:\s*\{', content[ru_start:])
    ru_end = ru_start + en_match.start()
    ru_content = content[ru_start:ru_end]

    # Парсимо ключі
    key_pattern = r"(\w+):\s*['\"]([^'\"]*)['\"]"

    ua_keys = {}
    for match in re.finditer(key_pattern, ua_content):
        key, value = match.groups()
        ua_keys[key] = value

    ru_keys = {}
    for match in re.finditer(key_pattern, ru_content):
        key, value = match.groups()
        ru_keys[key] = value

    # Аналіз проблем
    missing_ru = []  # Ключі які є в UA але відсутні в RU
    same_as_ua = []  # Ключі де RU = UA (не перекладено)
    empty_ru = []    # Ключі де RU порожній

    for key, ua_value in ua_keys.items():
        if key not in ru_keys:
            missing_ru.append({'key': key, 'ua': ua_value})
        elif ru_keys[key] == '':
            empty_ru.append({'key': key, 'ua': ua_value})
        elif ru_keys[key] == ua_value:
            # Перевіряємо чи це справді український текст (кирилиця)
            if re.search(r'[а-яА-ЯіїєґІЇЄҐ]', ua_value):
                same_as_ua.append({'key': key, 'value': ua_value})

    # Виводимо звіт
    print("="*80)
    print("ANALIZ ROSIJSKOJI LOKALIZACIJI")
    print("="*80)
    print(f"\nZagalna statystyka:")
    print(f"  UA klyuchiv: {len(ua_keys)}")
    print(f"  RU klyuchiv: {len(ru_keys)}")
    print(f"  Vidsutni v RU: {len(missing_ru)}")
    print(f"  Porozhni v RU: {len(empty_ru)}")
    print(f"  Odnakovi z UA (ne perekladeno): {len(same_as_ua)}")

    print(f"\n[1] VIDSUTNI RU PEREKLADY ({len(missing_ru)} klyuchiv):")
    for item in missing_ru[:20]:
        print(f"  {item['key']}: '{item['ua']}'")
    if len(missing_ru) > 20:
        print(f"  ... ta shche {len(missing_ru) - 20}")

    print(f"\n[2] POROZHNI RU PEREKLADY ({len(empty_ru)} klyuchiv):")
    for item in empty_ru[:10]:
        print(f"  {item['key']}: '{item['ua']}'")
    if len(empty_ru) > 10:
        print(f"  ... ta shche {len(empty_ru) - 10}")

    print(f"\n[3] RU = UA (NE PEREKLADENO) ({len(same_as_ua)} klyuchiv):")
    for item in same_as_ua[:20]:
        print(f"  {item['key']}: '{item['value']}'")
    if len(same_as_ua) > 20:
        print(f"  ... ta shche {len(same_as_ua) - 20}")

    # Зберігаємо в JSON
    report = {
        'missing_ru': missing_ru,
        'empty_ru': empty_ru,
        'same_as_ua': same_as_ua,
        'stats': {
            'ua_total': len(ua_keys),
            'ru_total': len(ru_keys),
            'missing_count': len(missing_ru),
            'empty_count': len(empty_ru),
            'same_count': len(same_as_ua)
        }
    }

    with open('ru-translations-analysis.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*80}")
    print(f"Zvit zberezhenoу: ru-translations-analysis.json")
    print(f"{'='*80}\n")

    return report

if __name__ == '__main__':
    analyze_ru_translations()
