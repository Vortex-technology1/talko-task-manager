#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Знаходить захардкоджені українські тексти в HTML/JS які не перекладаються
"""
import re
import os
import json

def is_ukrainian_word(text):
    """Перевіряє чи текст містить українські літери"""
    return bool(re.search(r'[іїєґІЇЄҐ]', text))

def find_hardcoded_ua():
    """Знаходить захардкоджені UA тексти"""

    problems = []

    # HTML файли
    html_files = ['index.html', 'biz-structure.html']

    for fname in html_files:
        if not os.path.exists(fname):
            continue

        with open(fname, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for i, line in enumerate(lines, 1):
            # Пропускаємо якщо є data-i18n
            if 'data-i18n' in line:
                continue

            # Шукаємо placeholder з українськими літерами
            match = re.search(r'placeholder=["\']([^"\']+)["\']', line)
            if match and is_ukrainian_word(match.group(1)):
                problems.append({
                    'file': fname,
                    'line': i,
                    'type': 'placeholder',
                    'text': match.group(1),
                    'content': line.strip()
                })

            # Шукаємо aria-label з українськими літерами
            match = re.search(r'aria-label=["\']([^"\']+)["\']', line)
            if match and is_ukrainian_word(match.group(1)):
                problems.append({
                    'file': fname,
                    'line': i,
                    'type': 'aria-label',
                    'text': match.group(1),
                    'content': line.strip()
                })

            # Шукаємо title з українськими літерами (якщо немає data-i18n-title)
            if 'data-i18n-title' not in line:
                match = re.search(r'title=["\']([^"\']+)["\']', line)
                if match and is_ukrainian_word(match.group(1)):
                    problems.append({
                        'file': fname,
                        'line': i,
                        'type': 'title',
                        'text': match.group(1),
                        'content': line.strip()
                    })

    print(f"Found {len(problems)} hardcoded UA texts in HTML")

    # Зберігаємо
    with open('hardcoded-ua-texts.json', 'w', encoding='utf-8') as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)

    # Показуємо приклади
    if problems:
        print("\nExamples:")
        for p in problems[:20]:
            print(f"  {p['file']}:{p['line']} [{p['type']}] '{p['text']}'")
        if len(problems) > 20:
            print(f"  ... and {len(problems) - 20} more")

    print(f"\nSaved to: hardcoded-ua-texts.json")
    return problems

if __name__ == '__main__':
    find_hardcoded_ua()
