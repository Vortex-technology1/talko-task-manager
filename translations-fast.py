#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import sys
import time
from deep_translator import GoogleTranslator

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("ПЕРЕКЛАД: UA → EN, DE, CS, RU")
print("Витягую ключі з UA...\n")

# Швидке читання тільки UA секції
ua_translations = {}
in_ua = False
bracket_count = 0

with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
    for line in f:
        if re.match(r'^\s+ua:\s*\{', line):
            in_ua = True
            bracket_count = 1
            continue
        
        if in_ua:
            bracket_count += line.count('{') - line.count('}')
            
            # Витягуємо ключ
            match = re.match(r'^\s+(\w+):\s*[\'"](.+?)[\'"],?\s*$', line)
            if match:
                key, value = match.groups()
                ua_translations[key] = value
            
            if bracket_count == 0:
                break

print(f"Знайдено: {len(ua_translations)} ключів")
print(f"Час: ~{len(ua_translations) * 4 * 0.15 / 60:.0f} хв\n")

# Переклад
def translate(text, lang):
    try:
        translator = GoogleTranslator(source='uk', target=lang)
        
        # Захист HTML та плейсхолдерів
        protected = {}
        temp = text
        
        for i, tag in enumerate(re.findall(r'<[^>]+>', text)):
            key = f'_T{i}_'
            protected[key] = tag
            temp = temp.replace(tag, key)
        
        for i, ph in enumerate(re.findall(r'\{[^\}]+\}', temp)):
            key = f'_P{i}_'
            protected[key] = ph
            temp = temp.replace(ph, key)
        
        result = translator.translate(temp)
        
        for key, val in protected.items():
            result = result.replace(key, val)
        
        return result
    except:
        return text

# Перекладаємо
translations = {'ua': ua_translations}

for lang in ['en', 'de', 'cs', 'ru']:
    print(f"Переклад на {lang.upper()}...")
    translations[lang] = {}
    
    for i, (key, text) in enumerate(ua_translations.items(), 1):
        if i % 100 == 0:
            print(f"  {i}/{len(ua_translations)}")
        
        translations[lang][key] = translate(text, lang)
        time.sleep(0.12)
    
    print(f"  ✓ {lang.upper()} готово\n")

# Генеруємо файл
print("Створюю файл...")
lines = ["// =====================", "'use strict';", "        const translations = {"]

for lang in ['ua', 'en', 'de', 'cs', 'ru']:
    lines.append(f"            {lang}: {{")
    for key, val in translations[lang].items():
        escaped = val.replace("'", "\'").replace("\n", "\n")
        lines.append(f"                {key}: '{escaped}',")
    lines.append("            },")

lines.append("        };")
lines.append("        window.translations = translations;")

with open('js/modules/01-translations-v2.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"\n✓ Готово! UA: {len(translations['ua'])}, EN/DE/CS/RU: по {len(translations['en'])} ключів")
