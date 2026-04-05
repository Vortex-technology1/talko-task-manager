#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Аналізує захардкоджені російські тексти в HTML/JS файлах
"""
import os
import re
import json

# Явно російські слова які не використовуються в українській
RUSSIAN_ONLY_WORDS = [
    'выберите', 'сохранить', 'удалить', 'создать', 'редактировать',
    'выбрать', 'добавить', 'отменить', 'закрыть', 'открыть',
    'изменить', 'обновить', 'загрузить', 'скачать', 'поиск',
    'название', 'описание', 'комментарий', 'подтвердить',
    'отправить', 'получить', 'ввести', 'введите', 'выход', 'вход',
    'настройки', 'параметры', 'применить', 'войти', 'настроить',
    'счета', 'расходов', 'быстрый', 'недельный', 'заполнить',
    'среднего', 'корректируйте', 'вручную', 'связи', 'модулей',
    'сделка', 'выиграно', 'автоматику', 'подключить', 'первые',
    'транзакции', 'внести', 'сумма', 'категория', 'счёт', 'минимум',
    'реальных', 'текущий', 'месяц', 'первый', 'ссылка', 'редагувати',
    'удаляет', 'необратимо', 'метрики', 'часовой', 'пояс', 'забыли',
    'пароль', 'повернутися', 'консультацию', 'прораб', 'объединенной',
    'функции', 'приглашение', 'токен', 'шаблон', 'этап', 'сотрудника',
    'контакт', 'сохранить', 'удалить', 'метрику', 'показатель',
    'оберіть', 'зберегти', 'видалити', 'створити', 'редагувати',
    'обрати', 'додати', 'скасувати', 'закрити', 'відкрити',
    'змінити', 'оновити', 'завантажити', 'скачати', 'пошук',
    'назва', 'опис', 'коментар', 'підтвердити', 'надіслати',
    'отримати', 'ввести', 'введіть', 'вихід', 'налаштування'
]

# Файли які потрібно ігнорувати
IGNORE_FILES = [
    'offer-ru-construction-eu.html',  # Російська версія офера - це ОК
    '01-translations-v2.js',  # Файл перекладів - там мають бути російські тексти
    'russian-in-ua-report.json',
    'find-russian-in-ua.py',
    'analyze-hardcoded-russian.py',
    'analyze-translations.js',
    'translation-analysis-report.json',
    'fix_translations.py',
    'fix_how_panel.py',
    'fix_how_panel2.py'
]

def should_ignore_file(file_path):
    """Перевіряє чи потрібно ігнорувати файл"""
    for ignore in IGNORE_FILES:
        if ignore in file_path:
            return True
    # Ігноруємо node_modules, .git тощо
    if 'node_modules' in file_path or '.git' in file_path or 'firebase_functions_backend' in file_path:
        return True
    return False

def analyze_file(file_path):
    """Аналізує один файл на наявність російських текстів"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []

    problems = []
    lines = content.split('\n')

    for line_num, line in enumerate(lines, 1):
        # Пропускаємо коментарі
        if line.strip().startswith('//') or line.strip().startswith('/*') or line.strip().startswith('*'):
            continue

        # Шукаємо російські слова
        for russian_word in RUSSIAN_ONLY_WORDS:
            # Шукаємо слово (case-insensitive)
            if re.search(r'\b' + re.escape(russian_word) + r'\b', line, re.IGNORECASE):
                # Пропускаємо рядки з переключенням мови (це частина системи перекладів)
                if 'window.currentLang' in line or '_tg(' in line or 'translations[' in line:
                    continue
                if "ru:" in line or "'ru'" in line or '"ru"' in line:
                    continue

                problems.append({
                    'file': file_path,
                    'line': line_num,
                    'russian_word': russian_word,
                    'content': line.strip()[:200]  # Перші 200 символів
                })

    return problems

def main():
    """Головна функція"""
    all_problems = []

    # Шукаємо у всіх HTML та JS файлах
    for root, dirs, files in os.walk('.'):
        # Пропускаємо деякі директорії
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'firebase_functions_backend']]

        for file in files:
            if file.endswith(('.html', '.js')):
                file_path = os.path.join(root, file)

                if should_ignore_file(file_path):
                    continue

                problems = analyze_file(file_path)
                all_problems.extend(problems)

    # Групуємо по файлах
    by_file = {}
    for p in all_problems:
        file = p['file']
        if file not in by_file:
            by_file[file] = []
        by_file[file].append(p)

    # Виводимо звіт
    print("="*80)
    print("ZAXARDKODZHENI ROSIJSKI TEKSTY V HTML/JS FAJLAX")
    print("="*80)
    print(f"\n[!!!] Znaideno {len(all_problems)} problem v {len(by_file)} fajlax\n")

    for file_path, problems in sorted(by_file.items()):
        print(f"\n[*] {file_path} ({len(problems)} problem):")
        # Показуємо перші 10 проблем
        for problem in problems[:10]:
            print(f"    L{problem['line']}: [{problem['russian_word']}] {problem['content'][:100]}")
        if len(problems) > 10:
            print(f"    ... ta shche {len(problems) - 10} problem")

    # Зберігаємо в JSON
    with open('hardcoded-russian-report.json', 'w', encoding='utf-8') as f:
        json.dump(all_problems, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*80}")
    print(f"[OK] Detalnyj zvit zberezhenoу: hardcoded-russian-report.json")
    print(f"{'='*80}\n")

if __name__ == '__main__':
    main()
