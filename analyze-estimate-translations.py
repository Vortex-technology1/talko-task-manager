#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Аналіз перекладів модуля "Estimate" (Кошторис) для всіх мов
"""

import re
import json

def extract_estimate_translations(file_path):
    """Витягує переклади модуля Estimate з файлу"""

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Визначаємо позиції секцій "Estimate module" для кожної мови
    estimate_sections = {
        'ua': (3435, 3470),
        'en': (7162, 7197),
        'de': (10774, 10809),
        'cs': (14387, 14422),
        'ru': (18047, 18082),
        'pl': (21753, 21788)
    }

    lines = content.split('\n')
    translations = {}

    for lang, (start, end) in estimate_sections.items():
        translations[lang] = {}

        # Читаємо рядки з відповідної секції
        for i in range(start - 1, min(end, len(lines))):
            line = lines[i].strip()

            # Пропускаємо коментарі та порожні рядки
            if not line or line.startswith('//'):
                continue

            # Шукаємо ключ: 'значення'
            match = re.match(r"(\w+):\s*['\"](.+?)['\"],?$", line)
            if match:
                key = match.group(1)
                value = match.group(2)
                translations[lang][key] = value

    return translations

def analyze_translations(translations):
    """Аналізує переклади на наявність помилок та неточностей"""

    issues = {
        'missing_keys': {},
        'inconsistencies': [],
        'suggestions': []
    }

    # Отримуємо всі унікальні ключі
    all_keys = set()
    for lang_trans in translations.values():
        all_keys.update(lang_trans.keys())

    # Перевіряємо наявність всіх ключів у всіх мовах
    for lang, lang_trans in translations.items():
        missing = all_keys - set(lang_trans.keys())
        if missing:
            issues['missing_keys'][lang] = list(missing)

    # Перевіряємо можливі неточності

    # 1. Перевірка "Sync with warehouse" / "Synchronize"
    if 'syncWithWarehouse' in all_keys:
        sync_translations = {
            lang: trans.get('syncWithWarehouse', '')
            for lang, trans in translations.items()
        }

        # Англійська повинна бути "Sync with warehouse" або подібне
        if 'en' in sync_translations:
            if 'Sync' not in sync_translations['en'] and 'Update' not in sync_translations['en']:
                issues['inconsistencies'].append({
                    'key': 'syncWithWarehouse',
                    'lang': 'en',
                    'current': sync_translations['en'],
                    'issue': 'Should use "Sync" or "Update" for consistency'
                })

    # 2. Перевірка "Write off materials"
    if 'writeOffMaterials' in all_keys:
        writeoff_trans = {
            lang: trans.get('writeOffMaterials', '')
            for lang, trans in translations.items()
        }

        # Російська: перевірка правильності терміну
        if 'ru' in writeoff_trans:
            if 'Списать' not in writeoff_trans['ru']:
                issues['suggestions'].append({
                    'key': 'writeOffMaterials',
                    'lang': 'ru',
                    'current': writeoff_trans['ru'],
                    'suggestion': 'Списать материалы'
                })

    # 3. Перевірка термінології "Budget" vs "Cost"
    if 'totalMaterialsCost' in all_keys:
        budget_trans = {
            lang: trans.get('totalMaterialsCost', '')
            for lang, trans in translations.items()
        }

        # Рекомендації з термінології
        for lang, value in budget_trans.items():
            if lang == 'en' and 'budget' not in value.lower() and 'cost' not in value.lower():
                issues['inconsistencies'].append({
                    'key': 'totalMaterialsCost',
                    'lang': lang,
                    'current': value,
                    'issue': 'Should include "budget" or "cost"'
                })

    return issues

def generate_report(translations, issues):
    """Генерує звіт про аналіз перекладів"""

    report = []
    report.append("=" * 80)
    report.append("ЗВІТ АНАЛІЗУ ПЕРЕКЛАДІВ МОДУЛЯ 'КОШТОРИС' (ESTIMATE)")
    report.append("=" * 80)
    report.append("")

    # Статистика
    report.append("СТАТИСТИКА:")
    report.append("-" * 40)
    for lang, trans in translations.items():
        lang_names = {
            'ua': 'Українська',
            'en': 'Англійська',
            'de': 'Німецька',
            'cs': 'Чеська',
            'ru': 'Російська',
            'pl': 'Польська'
        }
        report.append(f"{lang_names.get(lang, lang)}: {len(trans)} ключів")
    report.append("")

    # Відсутні ключі
    if issues['missing_keys']:
        report.append("ВІДСУТНІ КЛЮЧІ:")
        report.append("-" * 40)
        for lang, keys in issues['missing_keys'].items():
            lang_names = {
                'ua': 'Українська',
                'en': 'Англійська',
                'de': 'Німецька',
                'cs': 'Чеська',
                'ru': 'Російська',
                'pl': 'Польська'
            }
            report.append(f"{lang_names.get(lang, lang)}:")
            for key in keys:
                report.append(f"  - {key}")
        report.append("")
    else:
        report.append("✓ Всі ключі присутні у всіх мовах")
        report.append("")

    # Неточності
    if issues['inconsistencies']:
        report.append("ВИЯВЛЕНІ НЕТОЧНОСТІ:")
        report.append("-" * 40)
        for issue in issues['inconsistencies']:
            report.append(f"Ключ: {issue['key']}")
            report.append(f"Мова: {issue['lang']}")
            report.append(f"Поточне значення: {issue['current']}")
            report.append(f"Проблема: {issue['issue']}")
            report.append("")

    # Рекомендації
    if issues['suggestions']:
        report.append("РЕКОМЕНДАЦІЇ ДО ВИПРАВЛЕННЯ:")
        report.append("-" * 40)
        for suggestion in issues['suggestions']:
            report.append(f"Ключ: {suggestion['key']}")
            report.append(f"Мова: {suggestion['lang']}")
            report.append(f"Поточне значення: {suggestion['current']}")
            report.append(f"Рекомендація: {suggestion['suggestion']}")
            report.append("")

    # Детальний список перекладів
    report.append("ДЕТАЛЬНИЙ СПИСОК ПЕРЕКЛАДІВ:")
    report.append("=" * 80)

    # Отримуємо всі ключі
    all_keys = set()
    for lang_trans in translations.values():
        all_keys.update(lang_trans.keys())

    for key in sorted(all_keys):
        report.append(f"\n{key}:")
        report.append("-" * 40)
        lang_order = ['ua', 'en', 'de', 'cs', 'ru', 'pl']
        lang_names = {
            'ua': 'UA',
            'en': 'EN',
            'de': 'DE',
            'cs': 'CS',
            'ru': 'RU',
            'pl': 'PL'
        }
        for lang in lang_order:
            if lang in translations:
                value = translations[lang].get(key, '❌ ВІДСУТНІЙ')
                report.append(f"  {lang_names[lang]}: {value}")

    report.append("")
    report.append("=" * 80)
    report.append("КІНЕЦЬ ЗВІТУ")
    report.append("=" * 80)

    return "\n".join(report)

def main():
    file_path = 'js/modules/01-translations-v2.js'

    print("Analyzing estimate module translations...")

    # Витягуємо переклади
    translations = extract_estimate_translations(file_path)

    # Аналізуємо переклади
    issues = analyze_translations(translations)

    # Генеруємо звіт
    report = generate_report(translations, issues)

    # Зберігаємо звіт у файл
    with open('estimate-translations-report.txt', 'w', encoding='utf-8') as f:
        f.write(report)

    # Зберігаємо дані у JSON
    with open('estimate-translations-data.json', 'w', encoding='utf-8') as f:
        json.dump({
            'translations': translations,
            'issues': issues
        }, f, ensure_ascii=False, indent=2)

    print("Report saved to: estimate-translations-report.txt")
    print("Data saved to: estimate-translations-data.json")

if __name__ == '__main__':
    main()
