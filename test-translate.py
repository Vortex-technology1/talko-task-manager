import re
import sys
from deep_translator import GoogleTranslator

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("ТЕСТ: перші 50 ключів\n", flush=True)

ua_trans = {}
in_ua = False
count = 0

with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
    for line in f:
        if 'ua:' in line and '{' in line:
            in_ua = True
            continue
        
        if in_ua and count < 50:
            match = re.match(r'^\s+(\w+):\s*[\'"](.+?)[\'"],', line)
            if match:
                key, val = match.groups()
                ua_trans[key] = val
                count += 1
        
        if count >= 50:
            break

print(f"Знайдено: {len(ua_trans)} ключів\n", flush=True)

# Тестуємо переклад
translator_en = GoogleTranslator(source='uk', target='en')
test_text = list(ua_trans.values())[0]
print(f"Тест: '{test_text}' →", flush=True)
result = translator_en.translate(test_text)
print(f"      '{result}'\n", flush=True)

print("✓ Google Translate працює!", flush=True)
print(f"\nДля {len(ua_trans)} ключів × 4 мови займе ~{len(ua_trans) * 4 * 0.15 / 60:.1f} хв")
