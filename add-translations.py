#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translation Management Script for Talko Task Manager

This script:
1. Loads translations from translations-to-add.json
2. Generates missing translations (EN, DE, CS, PL) from Ukrainian text
3. Updates 01-translations-v2.js by inserting new keys after "noComments"
4. Ensures no duplicate keys are added
5. Maintains proper JavaScript syntax with escaped quotes
"""

import json
import re
import os
from typing import Dict, List, Tuple, Set

# Try to import translation library, but make it optional
try:
    from deep_translator import GoogleTranslator
    HAS_TRANSLATOR = True
except ImportError:
    HAS_TRANSLATOR = False
    print("⚠️  deep_translator not installed. Install with: pip install deep-translator")
    print("   Using fallback translation method...\n")

# Define translation mappings and common words
TRANSLATION_MAP = {
    # Common words that don't need translation
    'common': {
        'Telegram': 'Telegram',
        'Google': 'Google',
        'email': 'email',
        'Email': 'Email',
        'slug': 'slug',
        'Slug': 'Slug',
    },
    # Day abbreviations
    'days_short': {
        'ua': {'Пн': 'Mon', 'Вт': 'Tue', 'Ср': 'Wed', 'Чт': 'Thu', 'Пт': 'Fri', 'Сб': 'Sat', 'Нд': 'Sun'},
        'en': {'Пн': 'Mon', 'Вт': 'Tue', 'Ср': 'Wed', 'Чт': 'Thu', 'Пт': 'Fri', 'Сб': 'Sat', 'Нд': 'Sun'},
        'de': {'Пн': 'Mo', 'Вт': 'Di', 'Ср': 'Mi', 'Чт': 'Do', 'Пт': 'Fr', 'Сб': 'Sa', 'Нд': 'So'},
        'cs': {'Пн': 'Po', 'Вт': 'Út', 'Ср': 'St', 'Чт': 'Čt', 'Пт': 'Pá', 'Сб': 'So', 'Нд': 'Ne'},
        'pl': {'Пн': 'Pon', 'Вт': 'Wt', 'Ср': 'Śr', 'Чт': 'Czw', 'Пт': 'Pt', 'Сб': 'Sob', 'Нд': 'Niedz'},
    }
}

class TranslationManager:
    def __init__(self, json_path: str, js_path: str):
        self.json_path = json_path
        self.js_path = js_path
        self.translations_data = {}
        self.js_content = ""
        self.unique_keys = {}
        self.stats = {
            'total_keys': 0,
            'new_keys_added': 0,
            'skipped_duplicates': 0,
            'updated_blocks': [],
            'errors': [],
            'warnings': []
        }

    def load_json(self) -> bool:
        """Load and parse the JSON file with translations to add."""
        try:
            with open(self.json_path, 'r', encoding='utf-8') as f:
                self.translations_data = json.load(f)
            print(f"✓ Loaded {len(self.translations_data)} translations from JSON")
            return True
        except FileNotFoundError:
            self.stats['errors'].append(f"JSON file not found: {self.json_path}")
            return False
        except json.JSONDecodeError as e:
            self.stats['errors'].append(f"Invalid JSON format: {str(e)}")
            return False
        except Exception as e:
            self.stats['errors'].append(f"Error loading JSON: {str(e)}")
            return False

    def load_js_file(self) -> bool:
        """Load the JavaScript translations file."""
        try:
            with open(self.js_path, 'r', encoding='utf-8') as f:
                self.js_content = f.read()
            print(f"✓ Loaded JavaScript file: {self.js_path}")
            return True
        except FileNotFoundError:
            self.stats['errors'].append(f"JavaScript file not found: {self.js_path}")
            return False
        except Exception as e:
            self.stats['errors'].append(f"Error loading JavaScript file: {str(e)}")
            return False

    def extract_unique_translations(self) -> Dict[str, Dict[str, str]]:
        """Extract unique translation keys from JSON data."""
        unique_translations = {}

        for display_text, trans_data in self.translations_data.items():
            if 'key' not in trans_data:
                self.stats['warnings'].append(f"Skipping entry without key: {display_text}")
                continue

            key = trans_data['key']
            if key in unique_translations:
                # Skip duplicate keys
                continue

            # Get Ukrainian text - if empty, use Russian or display text
            ua_text = trans_data.get('ua', '').strip()
            if not ua_text:
                # Try Russian text
                ua_text = trans_data.get('ru', '').strip()
                if not ua_text:
                    # Fallback to display text
                    ua_text = display_text

                if trans_data.get('needs_ua_translation'):
                    self.stats['warnings'].append(f"Entry '{key}' needs Ukrainian translation (using fallback)")

            # Get Russian text
            ru_text = trans_data.get('ru', '').strip()
            if not ru_text:
                ru_text = ua_text  # Use UA as fallback

            # Store the translation data
            unique_translations[key] = {
                'ua': ua_text,
                'ru': ru_text,
                'key': key
            }

        self.unique_keys = unique_translations
        self.stats['total_keys'] = len(unique_translations)
        print(f"✓ Extracted {len(unique_translations)} unique translation keys")
        return unique_translations

    def translate_text(self, text: str, target_lang: str) -> str:
        """
        Translate text to target language using Google Translate.
        Preserves special characters and formatting.
        """
        # Handle empty or whitespace-only strings
        if not text or not text.strip():
            return text

        # Check for day abbreviations
        if text in TRANSLATION_MAP['days_short']['ua']:
            return TRANSLATION_MAP['days_short'][target_lang].get(text, text)

        # Preserve special prefixes/suffixes
        prefix = ''
        suffix = ''
        clean_text = text

        # Extract emoji/symbols at the start
        emoji_pattern = r'^([\u2700-\u27BF\u2600-\u26FF\uFE00-\uFE0F]+\s*)'
        emoji_match = re.match(emoji_pattern, text)
        if emoji_match:
            prefix = emoji_match.group(1)
            clean_text = text[len(prefix):]

        # Extract punctuation at the end
        if clean_text.endswith('...'):
            suffix = '...'
            clean_text = clean_text[:-3]
        elif clean_text.endswith(':'):
            suffix = ':'
            clean_text = clean_text[:-1]

        # Don't translate if it's too short or just symbols
        if len(clean_text.strip()) < 2:
            return text

        try:
            if HAS_TRANSLATOR:
                # Use Google Translator
                translator = GoogleTranslator(source='uk', target=target_lang)
                translated = translator.translate(clean_text.strip())
            else:
                # Fallback: mark as needing translation
                translated = f"[TODO: {clean_text.strip()}]"

            # Reconstruct with prefix and suffix
            result = prefix + translated + suffix
            return result
        except Exception as e:
            self.stats['warnings'].append(f"Translation error for '{text}' to {target_lang}: {str(e)}")
            return f"[TODO: {clean_text}]"  # Return marked text on error

    def generate_missing_translations(self):
        """Generate EN, DE, CS, PL translations from Ukrainian text."""
        print("\n🌐 Generating missing translations...")

        # Language codes for Google Translate
        lang_map = {
            'en': 'en',  # English
            'de': 'de',  # German
            'cs': 'cs',  # Czech
            'pl': 'pl'   # Polish
        }

        for key, trans_data in self.unique_keys.items():
            ua_text = trans_data['ua']

            # Generate translations for each language
            for lang_key, google_lang in lang_map.items():
                if lang_key not in trans_data:
                    translated = self.translate_text(ua_text, google_lang)
                    trans_data[lang_key] = translated
                    print(f"  {key} [{lang_key}]: {translated}")

        print(f"✓ Generated translations for all languages")

    def escape_js_string(self, text: str) -> str:
        """Escape special characters for JavaScript string literals."""
        # Escape backslashes first
        text = text.replace('\\', '\\\\')
        # Escape single quotes
        text = text.replace("'", "\\'")
        # Escape newlines
        text = text.replace('\n', '\\n')
        text = text.replace('\r', '\\r')
        return text

    def check_key_exists(self, key: str, lang_block: str) -> bool:
        """Check if a key already exists in a language block."""
        # Match the key pattern (key name followed by colon)
        pattern = rf'^\s*{re.escape(key)}\s*:'
        return bool(re.search(pattern, lang_block, re.MULTILINE))

    def find_language_block(self, lang: str) -> Tuple[int, int]:
        """
        Find the start and end positions of a language block.
        Returns (start_pos, end_pos) or (-1, -1) if not found.
        """
        # Pattern to find language block start
        pattern = rf'^\s+{lang}\s*:\s*{{'
        match = re.search(pattern, self.js_content, re.MULTILINE)

        if not match:
            return (-1, -1)

        start_pos = match.start()

        # Find the matching closing brace
        brace_count = 0
        in_block = False
        pos = match.end()

        while pos < len(self.js_content):
            char = self.js_content[pos]

            if char == '{':
                brace_count += 1
                in_block = True
            elif char == '}':
                if in_block and brace_count == 0:
                    # Found the closing brace for this language block
                    return (start_pos, pos + 1)
                elif brace_count > 0:
                    brace_count -= 1

            pos += 1

        return (-1, -1)

    def find_nocomments_position(self, lang_block_content: str, lang: str) -> int:
        """
        Find the position after the noComments line in a language block.
        Returns the position where new keys should be inserted, or -1 if not found.
        """
        # Pattern to find noComments line
        pattern = r"^\s*noComments\s*:\s*'[^']*',?\s*$"
        match = re.search(pattern, lang_block_content, re.MULTILINE)

        if match:
            # Return position after this line
            return match.end()

        self.stats['warnings'].append(f"noComments key not found in {lang} block")
        return -1

    def insert_translations_in_block(self, lang: str) -> bool:
        """Insert new translations into a specific language block."""
        # Find the language block
        start_pos, end_pos = self.find_language_block(lang)

        if start_pos == -1:
            self.stats['errors'].append(f"Could not find {lang} language block")
            return False

        # Extract the block content
        block_content = self.js_content[start_pos:end_pos]

        # Check for existing keys to avoid duplicates
        new_keys_to_add = []
        for key, trans_data in self.unique_keys.items():
            if not self.check_key_exists(key, block_content):
                new_keys_to_add.append((key, trans_data.get(lang, trans_data['ua'])))

        if not new_keys_to_add:
            print(f"  No new keys to add to {lang} block (all exist)")
            return True

        # Find insertion point after noComments
        insertion_pos = self.find_nocomments_position(block_content, lang)

        if insertion_pos == -1:
            return False

        # Get indentation from the noComments line
        nocomments_line_start = block_content.rfind('\n', 0, insertion_pos) + 1
        nocomments_line = block_content[nocomments_line_start:insertion_pos]
        indent_match = re.match(r'^(\s*)', nocomments_line)
        indent = indent_match.group(1) if indent_match else '                '

        # Build the insertion string
        insertion_lines = []
        for key, translation in new_keys_to_add:
            escaped_translation = self.escape_js_string(translation)
            insertion_lines.append(f"{indent}{key}: '{escaped_translation}',")

        insertion_text = '\n' + '\n'.join(insertion_lines)

        # Insert the new content
        new_block_content = (
            block_content[:insertion_pos] +
            insertion_text +
            block_content[insertion_pos:]
        )

        # Update the main content
        self.js_content = (
            self.js_content[:start_pos] +
            new_block_content +
            self.js_content[end_pos:]
        )

        print(f"  ✓ Added {len(new_keys_to_add)} keys to {lang} block")
        self.stats['updated_blocks'].append(lang)
        return True

    def update_all_language_blocks(self) -> bool:
        """Update all 6 language blocks with new translations."""
        print("\n📝 Updating language blocks...")

        languages = ['ua', 'en', 'de', 'cs', 'ru', 'pl']
        success_count = 0

        for lang in languages:
            if self.insert_translations_in_block(lang):
                success_count += 1

        # Calculate how many keys were actually added
        if success_count > 0:
            # Count new keys added (from first successful language)
            first_lang = languages[0]
            start_pos, end_pos = self.find_language_block(first_lang)
            if start_pos != -1:
                block_content = self.js_content[start_pos:end_pos]
                added_count = 0
                for key in self.unique_keys.keys():
                    if self.check_key_exists(key, block_content):
                        added_count += 1
                # New keys = total found - skipped duplicates from before
                self.stats['new_keys_added'] = added_count

        return success_count == len(languages)

    def save_js_file(self) -> bool:
        """Save the updated JavaScript file."""
        try:
            # Create a backup first
            backup_path = self.js_path + '.backup'
            if os.path.exists(self.js_path):
                import shutil
                shutil.copy2(self.js_path, backup_path)
                print(f"✓ Created backup: {backup_path}")

            # Save the updated file
            with open(self.js_path, 'w', encoding='utf-8') as f:
                f.write(self.js_content)

            print(f"✓ Saved updated file: {self.js_path}")
            return True
        except Exception as e:
            self.stats['errors'].append(f"Error saving file: {str(e)}")
            return False

    def print_summary(self):
        """Print a summary of the operation."""
        print("\n" + "=" * 70)
        print("📊 TRANSLATION UPDATE SUMMARY")
        print("=" * 70)

        print(f"\n📈 Statistics:")
        print(f"  Total unique keys in JSON: {self.stats['total_keys']}")
        print(f"  New keys added: {self.stats['new_keys_added']}")
        print(f"  Skipped duplicates: {self.stats['skipped_duplicates']}")

        if self.stats['updated_blocks']:
            print(f"\n✅ Updated language blocks: {', '.join(self.stats['updated_blocks'])}")

        if self.stats['warnings']:
            print(f"\n⚠️  Warnings ({len(self.stats['warnings'])}):")
            for warning in self.stats['warnings'][:10]:  # Show first 10
                print(f"  - {warning}")
            if len(self.stats['warnings']) > 10:
                print(f"  ... and {len(self.stats['warnings']) - 10} more")

        if self.stats['errors']:
            print(f"\n❌ Errors ({len(self.stats['errors'])}):")
            for error in self.stats['errors']:
                print(f"  - {error}")

        print("\n" + "=" * 70)

    def run(self) -> bool:
        """Run the complete translation update process."""
        print("🚀 Starting translation update process...\n")

        # Step 1: Load JSON
        if not self.load_json():
            self.print_summary()
            return False

        # Step 2: Load JavaScript file
        if not self.load_js_file():
            self.print_summary()
            return False

        # Step 3: Extract unique translations
        self.extract_unique_translations()

        # Step 4: Generate missing translations
        self.generate_missing_translations()

        # Step 5: Update all language blocks
        if not self.update_all_language_blocks():
            self.print_summary()
            return False

        # Step 6: Save the file
        if not self.save_js_file():
            self.print_summary()
            return False

        # Step 7: Print summary
        self.print_summary()

        return True


def main():
    """Main entry point."""
    # Define file paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'translations-to-add.json')
    js_path = os.path.join(script_dir, 'js', 'modules', '01-translations-v2.js')

    # Create and run the translation manager
    manager = TranslationManager(json_path, js_path)
    success = manager.run()

    if success:
        print("\n✨ Translation update completed successfully!")
        return 0
    else:
        print("\n❌ Translation update failed. Check errors above.")
        return 1


if __name__ == '__main__':
    import sys
    sys.exit(main())
