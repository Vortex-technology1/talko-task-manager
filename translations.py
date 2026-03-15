#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
import sys
import time
from deep_translator import GoogleTranslator

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("АВТОМАТИЧНИЙ ПЕРЕКЛАД TALKO TASK MANAGER")
print("=" * 60)
print("\nУКРАЇНСЬКА → АНГЛІЙСЬКА, НІМЕЦЬКА, ЧЕСЬКА, РОСІЙСЬКА\n")

# Читаємо файл
print("📖 Читаю файл...")
with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Знаходимо українську секцію
lines = content.split('\n')
ua_start = None
ua_end = None

for i, line in enumerate(lines):
    if re.match(r'^\s+ua:\s*\{$', line):
        ua_start = i
    elif ua_start and re.match(r'^\s+(de|en|cs|ru):\s*\{$', line):
        ua_end = i
        break

if not ua_start:
    ua_end = len(lines)

if not ua_start:
    print("❌ Помилка: не знайдено секцію UA")
    sys.exit(1)

# Витягуємо всі ключі з UA
print("📋 Витягую ключі з української мови...")
ua_translations = {}
for line in lines[ua_start:ua_end]:
    match = re.match(r'^\s+(\w+):\s*[\'"](.+?)[\'"],?\s*$', line)
    if match:
        key, value = match.groups()
        ua_translations[key] = value

print(f"✅ Знайдено {len(ua_translations)} ключів в UA\n")
print(f"⏱️  Орієнтовний час: {len(ua_translations) * 4 * 0.1 / 60:.0f} хвилин\n")
print("=" * 60)

# Функція для перекладу
def translate_text(text, target_lang, retry_count=0):
    max_retries = 3
    try:
        lang_map = {'en': 'en', 'de': 'de', 'cs': 'cs', 'ru': 'ru'}
        translator = GoogleTranslator(source='uk', target=lang_map[target_lang])
        
        # Зберігаємо спеціальні конструкції
        placeholders = {}
        temp_text = text
        
        # HTML теги
        for i, tag in enumerate(re.findall(r'<[^>]+>', text)):
            placeholder = f'___HTMLTAG{i}___'
            placeholders[placeholder] = tag
            temp_text = temp_text.replace(tag, placeholder)
        
        # Плейсхолдери {0}, {{var}}
        for i, ph in enumerate(re.findall(r'\{[^\}]+\}', temp_text)):
            placeholder = f'___PH{i}___'
            placeholders[placeholder] = ph
            temp_text = temp_text.replace(ph, placeholder)
        
        # Перекладаємо
        translated = translator.translate(temp_text)
        
        # Повертаємо назад
        for placeholder, original in placeholders.items():
            translated = translated.replace(placeholder, original)
        
        return translated
    
    except Exception as e:
        if retry_count < max_retries:
            time.sleep(2 ** retry_count)  # exponential backoff
            return translate_text(text, target_lang, retry_count + 1)
        else:
            return text  # повертаємо оригінал

# Перекладаємо на всі мови
target_langs = ['en', 'de', 'cs', 'ru']
all_translations = {'ua': ua_translations}

for lang in target_langs:
    print(f"\n🌍 Перекладаю на {lang.upper()}...")
    all_translations[lang] = {}
    
    start_time = time.time()
    
    for i, (key, ua_text) in enumerate(ua_translations.items(), 1):
        if i % 50 == 0:
            elapsed = time.time() - start_time
            remaining = (elapsed / i) * (len(ua_translations) - i)
            print(f"   Прогрес: {i}/{len(ua_translations)} | Залишилось: {remaining/60:.1f} хв")
        
        translated = translate_text(ua_text, lang)
        all_translations[lang][key] = translated
        time.sleep(0.15)  # затримка між запитами
    
    print(f"   ✅ {lang.upper()} завершено за {(time.time() - start_time)/60:.1f} хв")

print("\n" + "=" * 60)
print("📝 Створюю новий файл з перекладами...")

# Генеруємо новий файл
def format_translations(lang, translations):
    result = [f"            {lang}: {{"]
    for key, value in translations.items():
        escaped = value.replace("'", "\'").replace("\n", "\n")
        result.append(f"                {key}: '{escaped}',")
    result.append("            },")
    return '\n'.join(result)

new_content = [
    "// =====================",
    "'use strict';",
    "        const translations = {"
]

for lang in ['ua', 'en', 'de', 'cs', 'ru']:
    new_content.append(format_translations(lang, all_translations[lang]))

new_content.append("        };")
new_content.append("        window.translations = translations;")

# Записуємо
with open('js/modules/01-translations-v2.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_content))

print("✅ Файл оновлено успішно!")
print("\n" + "=" * 60)
print("📊 ПІДСУМОК:")
print(f"   UA: {len(all_translations['ua'])} ключів (оригінал)")
print(f"   EN: {len(all_translations['en'])} ключів (перекладено)")
print(f"   DE: {len(all_translations['de'])} ключів (перекладено)")
print(f"   CS: {len(all_translations['cs'])} ключів (перекладено)")
print(f"   RU: {len(all_translations['ru'])} ключів (перекладено)")
print("=" * 60)
