#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import json
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("ANALIZ PEREKLADIV\n")

with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

langs = {'ua': None, 'en': None, 'de': None, 'cs': None, 'ru': None}
lang_pattern = r'^\s+(ua|en|de|cs|ru):\s*\{$'

for i, line in enumerate(content.split('\n'), 1):
    match = re.match(lang_pattern, line)
    if match:
        langs[match.group(1)] = i

print("Знайдені мови:")
for lang, line_num in langs.items():
    status = f"рядок {line_num}" if line_num else "ВІДСУТНЯ"
    print(f"  {lang.upper()}: {status}")

lines = content.split('\n')
ua_keys = []
if langs['ua']:
    start = langs['ua']
    end = langs['de'] if langs['de'] else len(lines)
    
    for line in lines[start:end]:
        match = re.match(r'^\s+(\w+):\s*[\'"]', line)
        if match:
            ua_keys.append(match.group(1))

print(f"\nКлючів в UA: {len(ua_keys)}")

for lang in ['de', 'cs']:
    if langs[lang]:
        start = langs[lang]
        next_langs = [langs[l] for l in ['ua', 'en', 'de', 'cs', 'ru'] if langs[l] and langs[l] > start]
        end = min(next_langs) if next_langs else len(lines)
        
        lang_keys = []
        for line in lines[start:end]:
            match = re.match(r'^\s+(\w+):\s*[\'"]', line)
            if match:
                lang_keys.append(match.group(1))
        
        print(f"  Ключів в {lang.upper()}: {len(lang_keys)}")
        missing = [k for k in ua_keys if k not in lang_keys]
        if missing:
            print(f"    Відсутні: {len(missing)} ключів")
            print(f"    Приклади: {', '.join(missing[:5])}")

for lang in ['en', 'ru']:
    if not langs[lang]:
        print(f"\n{lang.upper()}: МОВА ВІДСУТНЯ (потрібно {len(ua_keys)} ключів)")

missing_all = {
    'en': ua_keys if not langs['en'] else [],
    'ru': ua_keys if not langs['ru'] else []
}

with open('missing-keys.json', 'w', encoding='utf-8') as f:
    json.dump({'ua_keys': ua_keys, 'missing': missing_all}, f, ensure_ascii=False, indent=2)

print("\nРезультати збережено в missing-keys.json")
