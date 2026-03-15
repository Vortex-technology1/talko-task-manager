import sys, re, time, json
sys.stdout.reconfigure(encoding='utf-8')
from deep_translator import GoogleTranslator

translator = GoogleTranslator(source='uk', target='cs')

with open('js/modules/01-translations-v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Витягуємо ua секцію
ua_start = content.find('            ua: {')
ua_end_idx = ua_start
depth = 0
for i, c in enumerate(content[ua_start:], ua_start):
    if c == '{': depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0:
            ua_end_idx = i
            break
ua_section = content[ua_start:ua_end_idx+1]

# Витягуємо cs секцію  
cs_start = content.find('            cs: {')
cs_end_idx = cs_start
depth = 0
for i, c in enumerate(content[cs_start:], cs_start):
    if c == '{': depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0:
            cs_end_idx = i
            break
cs_section = content[cs_start:cs_end_idx+1]

# Парсимо ua ключі
ua_keys = {}
for line in ua_section.split('\n'):
    m = re.match(r"\s+(\w+):\s+['\"](.+)['\"],?\s*$", line)
    if m:
        ua_keys[m.group(1)] = m.group(2)

# Парсимо cs ключі  
cs_keys = {}
for line in cs_section.split('\n'):
    m = re.match(r"\s+(\w+):\s+['\"](.+)['\"],?\s*$", line)
    if m:
        cs_keys[m.group(1)] = m.group(2)

# Знаходимо відсутні
missing = {k: v for k, v in ua_keys.items() if k not in cs_keys}
print(f'Відсутніх ключів в CS: {len(missing)}')

if len(missing) == 0:
    print('Всі ключі вже є!')
    sys.exit(0)

# Перекладаємо
new_translations = {}
errors = []
for i, (key, ua_text) in enumerate(missing.items(), 1):
    try:
        # Пропускаємо HTML теги і технічні рядки
        if ua_text.startswith('<') or ua_text.startswith('http'):
            new_translations[key] = ua_text
        else:
            translated = translator.translate(ua_text)
            new_translations[key] = translated
        
        if i % 50 == 0:
            print(f'Прогрес: {i}/{len(missing)}')
        
        time.sleep(0.15)
    except Exception as e:
        errors.append(key)
        new_translations[key] = ua_text  # fallback

print(f'Перекладено: {len(new_translations)}, Помилок: {len(errors)}')

# Додаємо нові ключі в cs секцію перед закриваючою дужкою
new_lines = []
for key, value in new_translations.items():
    # Екрануємо апострофи
    value = value.replace("'", "\u02bc")
    new_lines.append(f"                {key}: '{value}',")

insert_text = '\n'.join(new_lines) + '\n'

# Вставляємо перед останньою } cs секції
new_cs = cs_section[:-1] + insert_text + '}'
content = content[:cs_start] + new_cs + content[cs_end_idx+1:]

with open('js/modules/01-translations-v2.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Готово! Файл оновлено.')
