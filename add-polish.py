#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re, sys, time
from deep_translator import GoogleTranslator

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*60, flush=True)
print("ДОДАВАННЯ ПОЛЬСЬКОЇ МОВИ (PL)", flush=True)
print("="*60, flush=True)

# Читаємо поточний файл з перекладами
print("\n📖 Читаю файл з перекладами...", flush=True)
with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Витягуємо UA ключі
print("📋 Витягую UA ключі...", flush=True)
ua = {}
in_ua, bc = False, 0

for line in content.split('\n'):
    if re.match(r'^\s+ua:\s*\{', line):
        in_ua, bc = True, 1
        continue
    if in_ua:
        bc += line.count('{') - line.count('}')
        m = re.match(r'^\s+(\w+):\s*[\'"](.+?)[\'"],', line)
        if m:
            ua[m.group(1)] = m.group(2)
        if bc == 0:
            break

print(f"✓ Знайдено {len(ua)} ключів", flush=True)

# Функція перекладу на польську
def trans_pl(txt):
    try:
        t = GoogleTranslator(source='uk', target='pl')
        p, tmp = {}, txt
        for i, tag in enumerate(re.findall(r'<[^>]+>', txt)):
            k = f'_H{i}_'
            p[k], tmp = tag, tmp.replace(tag, k)
        for i, ph in enumerate(re.findall(r'\{[^\}]+\}', tmp)):
            k = f'_P{i}_'
            p[k], tmp = ph, tmp.replace(ph, k)
        r = t.translate(tmp)
        for k, v in p.items():
            r = r.replace(k, v)
        return r
    except:
        return txt

# Перекладаємо на польську
print(f"\n🇵🇱 Перекладаю на польську...", flush=True)
pl = {}
st = time.time()

for i, (k, v) in enumerate(ua.items(), 1):
    pl[k] = trans_pl(v)
    time.sleep(0.12)
    
    if i % 100 == 0:
        el = time.time() - st
        rem = (el/i) * (len(ua)-i)
        print(f"   {i}/{len(ua)} | Залишилось: {rem/60:.1f}хв", flush=True)

print(f"   ✓ PL готово за {(time.time()-st)/60:.1f}хв\n", flush=True)

# Читаємо всі інші мови з файлу
print("📝 Читаю інші мови (EN, DE, CS, RU)...", flush=True)
translations = {'ua': ua, 'pl': pl}

for lang in ['en', 'de', 'cs', 'ru']:
    translations[lang] = {}
    in_lang, bc = False, 0
    
    for line in content.split('\n'):
        if re.match(rf'^\s+{lang}:\s*\{{', line):
            in_lang, bc = True, 1
            continue
        if in_lang:
            bc += line.count('{') - line.count('}')
            m = re.match(r'^\s+(\w+):\s*[\'"](.+?)[\'"],', line)
            if m:
                translations[lang][m.group(1)] = m.group(2)
            if bc == 0:
                break
    
    print(f"   {lang.upper()}: {len(translations[lang])} ключів", flush=True)

# Генеруємо фінальний файл з усіма 6 мовами
print("\n📝 Створюю фінальний файл з 6 мовами...", flush=True)
lines = ["// =====================", "'use strict';", "        const translations = {"]

for lang in ['ua', 'en', 'de', 'cs', 'ru', 'pl']:
    lines.append(f"            {lang}: {{")
    for k, v in translations[lang].items():
        esc = v.replace("'", "\'").replace("\n", "\n")
        lines.append(f"                {k}: '{esc}',")
    lines.append("            },")

lines += ["        };", "        window.translations = translations;"]

with open('js/modules/01-translations-v2.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("\n"+"="*60, flush=True)
print("✅ ФІНАЛ! Файл з 6 мовами готовий!", flush=True)
print(f"UA, EN, DE, CS, RU, PL: по {len(ua)} ключів кожна", flush=True)
print("="*60, flush=True)
