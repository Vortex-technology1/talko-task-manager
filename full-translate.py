#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re, sys, time
from deep_translator import GoogleTranslator

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*60, flush=True)
print("ПОВНИЙ ПЕРЕКЛАД: UA → EN, DE, CS, RU", flush=True)
print("="*60, flush=True)

# Витягуємо UA ключі
print("\nВитягую ключі з UA...", flush=True)
ua = {}
in_ua, bc = False, 0

with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
    for line in f:
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
print(f"⏱  Орієнтовний час: {len(ua)*4*0.12/60:.0f} хвилин\n", flush=True)

# Функція перекладу
def trans(txt, lang):
    try:
        t = GoogleTranslator(source='uk', target=lang)
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

# Переклад всіх мов
all_t = {'ua': ua}
for lang in ['en', 'de', 'cs', 'ru']:
    print(f"🌍 {lang.upper()}...", flush=True)
    all_t[lang], st = {}, time.time()
    
    for i, (k, v) in enumerate(ua.items(), 1):
        all_t[lang][k] = trans(v, lang)
        time.sleep(0.12)
        
        if i % 200 == 0:
            el = time.time() - st
            rem = (el/i) * (len(ua)-i)
            print(f"   {i}/{len(ua)} | Залишилось: {rem/60:.1f}хв", flush=True)
    
    print(f"   ✓ Готово за {(time.time()-st)/60:.1f}хв\n", flush=True)

# Генеруємо файл
print("📝 Записую файл...", flush=True)
lines = ["// =====================", "'use strict';", "        const translations = {"]

for lang in ['ua', 'en', 'de', 'cs', 'ru']:
    lines.append(f"            {lang}: {{")
    for k, v in all_t[lang].items():
        esc = v.replace("'", "\'").replace("\n", "\n")
        lines.append(f"                {k}: '{esc}',")
    lines.append("            },")

lines += ["        };", "        window.translations = translations;"]

with open('js/modules/01-translations-v2.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("\n"+"="*60, flush=True)
print("✅ ГОТОВО!", flush=True)
print(f"UA: {len(all_t['ua'])} | EN/DE/CS/RU: {len(all_t['en'])} ключів кожна", flush=True)
print("="*60, flush=True)
