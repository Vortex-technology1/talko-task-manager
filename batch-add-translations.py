#!/usr/bin/env python3
"""
Batch Translation Adder - Adds translations to 01-translations-v2.js
Processes translations in batches of 100 for progress tracking
"""

import json
import re
import os
from datetime import datetime

def escape_js_string(text):
    """Escape single quotes and special characters for JavaScript strings"""
    if not text:
        return text
    # Escape backslashes first
    text = text.replace('\\', '\\\\')
    # Escape single quotes
    text = text.replace("'", "\\'")
    # Escape newlines
    text = text.replace('\n', '\\n')
    text = text.replace('\r', '\\r')
    return text

def load_translations_to_add(file_path):
    """Load translations from JSON file"""
    print(f"Loading translations from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded {len(data)} translations to add")
    return data

def read_js_file(file_path):
    """Read the JavaScript translations file"""
    print(f"Reading {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"File size: {len(content)} characters")
    return content

def find_insertion_point(content, language_code):
    """Find the line after 'noComments' in the specified language block"""
    # Find the language block
    lang_pattern = rf'\b{language_code}:\s*\{{'
    lang_match = re.search(lang_pattern, content)

    if not lang_match:
        raise ValueError(f"Could not find language block for '{language_code}'")

    # Find noComments within this language block
    start_pos = lang_match.start()

    # Find the next language block to know where to stop searching
    next_lang_pattern = r'\b(ua|en|de|cs|ru|pl):\s*\{'
    next_matches = list(re.finditer(next_lang_pattern, content[start_pos + 10:]))

    if next_matches:
        end_pos = start_pos + 10 + next_matches[0].start()
    else:
        # Last language block, search until end
        end_pos = len(content)

    # Search for noComments in this range
    no_comments_pattern = r"noComments:\s*['\"].*?['\"]"
    no_comments_match = re.search(no_comments_pattern, content[start_pos:end_pos])

    if not no_comments_match:
        raise ValueError(f"Could not find 'noComments' key in {language_code} block")

    # Find the end of the line (comma and newline)
    match_end = start_pos + no_comments_match.end()
    comma_newline = content.find('\n', match_end)

    if comma_newline == -1:
        raise ValueError(f"Could not find line ending after noComments in {language_code}")

    return comma_newline + 1  # Return position after the newline

def get_existing_keys(content, language_code):
    """Extract all existing translation keys from a language block"""
    # Find the language block
    lang_pattern = rf'\b{language_code}:\s*\{{'
    lang_match = re.search(lang_pattern, content)

    if not lang_match:
        return set()

    start_pos = lang_match.start()

    # Find the next language block
    next_lang_pattern = r'\b(ua|en|de|cs|ru|pl):\s*\{'
    next_matches = list(re.finditer(next_lang_pattern, content[start_pos + 10:]))

    if next_matches:
        end_pos = start_pos + 10 + next_matches[0].start()
    else:
        end_pos = len(content)

    # Extract all keys from this block
    block_content = content[start_pos:end_pos]
    key_pattern = r'\b(\w+):\s*[\'"]'
    keys = set(re.findall(key_pattern, block_content))

    return keys

def create_backup(file_path):
    """Create a backup of the original file"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f"{file_path}.backup_{timestamp}"

    print(f"\nCreating backup: {backup_path}")

    with open(file_path, 'r', encoding='utf-8') as src:
        content = src.read()

    with open(backup_path, 'w', encoding='utf-8') as dst:
        dst.write(content)

    print(f"Backup created successfully")
    return backup_path

def generate_simple_translation(ua_text, ru_text, lang_code):
    """Generate simple translations for missing languages"""
    if lang_code == 'en':
        # Very basic UA to EN mapping for common words
        simple_mappings = {
            'Так': 'Yes',
            'Ні': 'No',
            'Назва': 'Name',
            'Дата': 'Date',
            'Час': 'Time',
            'Зберегти': 'Save',
            'Скасувати': 'Cancel',
            'Видалити': 'Delete',
            'Додати': 'Add',
            'Редагувати': 'Edit',
            'Пошук': 'Search',
            'Фільтр': 'Filter',
            'Сортувати': 'Sort',
            'Завантаження': 'Loading',
            'Помилка': 'Error',
            'Успішно': 'Success',
            'Увага': 'Attention',
        }

        # Check if it's in simple mappings
        if ua_text in simple_mappings:
            return simple_mappings[ua_text]

        # Otherwise return [TODO]
        return f'[TODO: {ua_text}]'

    # For other languages, use [TODO]
    return f'[TODO: {ua_text}]'

def add_translations_batch(content, translations_batch, batch_num, total_batches):
    """Add a batch of translations to all language blocks"""
    print(f"\n{'='*60}")
    print(f"Processing batch {batch_num}/{total_batches} ({len(translations_batch)} translations)")
    print(f"{'='*60}")

    languages = ['ua', 'en', 'de', 'cs', 'ru', 'pl']

    # Get existing keys for each language to check for duplicates
    existing_keys = {}
    for lang in languages:
        existing_keys[lang] = get_existing_keys(content, lang)
        print(f"  {lang.upper()}: {len(existing_keys[lang])} existing keys")

    # Track statistics
    added_count = 0
    skipped_count = 0

    # Prepare all insertions for each language
    insertions = {lang: [] for lang in languages}

    for orig_text, trans_data in translations_batch.items():
        key = trans_data['key']
        ua_text = trans_data.get('ua', orig_text)
        ru_text = trans_data.get('ru', orig_text)

        # Check if key already exists in UA block (primary check)
        if key in existing_keys['ua']:
            skipped_count += 1
            continue

        # Prepare translations for each language
        translations = {
            'ua': escape_js_string(ua_text),
            'ru': escape_js_string(ru_text),
            'en': escape_js_string(generate_simple_translation(ua_text, ru_text, 'en')),
            'de': escape_js_string(generate_simple_translation(ua_text, ru_text, 'de')),
            'cs': escape_js_string(generate_simple_translation(ua_text, ru_text, 'cs')),
            'pl': escape_js_string(generate_simple_translation(ua_text, ru_text, 'pl')),
        }

        # Add to insertions for each language
        for lang in languages:
            # Get proper indentation (16 spaces based on the file structure)
            indent = ' ' * 16
            line = f"{indent}{key}: '{translations[lang]}',\n"
            insertions[lang].append(line)

        added_count += 1

    print(f"\n  Keys to add: {added_count}")
    print(f"  Keys skipped (duplicates): {skipped_count}")

    # Now insert into each language block
    if added_count > 0:
        # Process languages in reverse order to maintain position accuracy
        for lang in reversed(languages):
            insertion_point = find_insertion_point(content, lang)
            insertion_text = ''.join(insertions[lang])
            content = content[:insertion_point] + insertion_text + content[insertion_point:]
            print(f"  Inserted {len(insertions[lang])} keys into {lang.upper()} block")

    return content, added_count, skipped_count

def main():
    """Main function to add translations"""
    print("\n" + "="*60)
    print("BATCH TRANSLATION ADDER")
    print("="*60)

    # File paths
    base_dir = r'C:\Users\User\talko-task-manager'
    translations_json = os.path.join(base_dir, 'translations-to-add.json')
    js_file = os.path.join(base_dir, 'js', 'modules', '01-translations-v2.js')

    # Load translations to add
    translations_data = load_translations_to_add(translations_json)

    # Read the JS file
    content = read_js_file(js_file)

    # Create backup
    backup_path = create_backup(js_file)

    # Process in batches of 100
    batch_size = 100
    translations_items = list(translations_data.items())
    total_translations = len(translations_items)
    total_batches = (total_translations + batch_size - 1) // batch_size

    print(f"\nTotal translations to process: {total_translations}")
    print(f"Batch size: {batch_size}")
    print(f"Total batches: {total_batches}")

    total_added = 0
    total_skipped = 0

    # Process each batch
    for i in range(0, total_translations, batch_size):
        batch = dict(translations_items[i:i+batch_size])
        batch_num = (i // batch_size) + 1

        content, added, skipped = add_translations_batch(
            content, batch, batch_num, total_batches
        )

        total_added += added
        total_skipped += skipped

    # Save the updated file
    print(f"\n{'='*60}")
    print("SAVING UPDATED FILE")
    print(f"{'='*60}")

    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"File saved: {js_file}")

    # Print final summary
    print(f"\n{'='*60}")
    print("FINAL SUMMARY")
    print(f"{'='*60}")
    print(f"Total translations in JSON: {total_translations}")
    print(f"Keys added: {total_added}")
    print(f"Keys skipped (duplicates): {total_skipped}")
    print(f"Backup location: {backup_path}")
    print(f"\n{'='*60}")
    print("PROCESS COMPLETE")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
