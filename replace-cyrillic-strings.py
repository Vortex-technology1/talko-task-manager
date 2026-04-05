#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Replace hardcoded Cyrillic strings with window.t() calls in JS files.
This script processes JavaScript files and replaces Cyrillic text with translation function calls.
"""

import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple
from datetime import datetime
import unicodedata

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass


class CyrillicReplacer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.analysis_results = {}
        self.translations = {}
        self.stats = {
            'files_processed': 0,
            'files_modified': 0,
            'strings_replaced': 0,
            'strings_skipped': 0,
            'new_keys_needed': 0,
            'backup_created': 0
        }
        self.skipped_reasons = {
            'already_using_t': 0,
            'in_console_log': 0,
            'in_comment': 0,
            'css_class_id': 0,
            'firestore_field': 0,
            'invalid_context': 0,
            'no_translation': 0
        }
        self.new_translations = {}
        self.replacement_log = []

    def load_data(self):
        """Load analysis results and translations."""
        print("Loading analysis-results.json...")
        with open(self.project_root / 'analysis-results.json', 'r', encoding='utf-8') as f:
            self.analysis_results = json.load(f)

        print("Loading translations-to-add.json...")
        with open(self.project_root / 'translations-to-add.json', 'r', encoding='utf-8') as f:
            self.translations = json.load(f)

        print(f"Loaded {len(self.analysis_results.get('cyrillic_strings', []))} Cyrillic strings")
        print(f"Loaded {len(self.translations)} translation mappings")

    def is_cyrillic(self, text: str) -> bool:
        """Check if text contains Cyrillic characters."""
        return bool(re.search(r'[а-яА-ЯёЁіІїЇєЄґҐ]', text))

    def should_skip_replacement(self, line_content: str, text: str, context: str) -> Tuple[bool, str]:
        """
        Determine if a string replacement should be skipped.
        Returns (should_skip, reason).
        """
        # Already using window.t()
        if 'window.t(' in line_content or 'window.t(' in line_content:
            return True, 'already_using_t'

        # In console.log or console methods
        if re.search(r'console\.(log|warn|error|info|debug)\s*\(', line_content):
            return True, 'in_console_log'

        # In comments
        if re.match(r'^\s*(/\*|\*|//)', line_content.strip()):
            return True, 'in_comment'
        if '//' in line_content:
            comment_pos = line_content.index('//')
            text_pattern = re.escape(text)
            if re.search(text_pattern, line_content[comment_pos:]):
                return True, 'in_comment'

        # CSS classes or IDs (className, classList, getElementById, etc.)
        if re.search(r'(className|classList|getElementById|querySelector|class\s*=)', line_content):
            return True, 'css_class_id'

        # Firestore collection/field names
        if re.search(r'(collection\s*\(|doc\s*\(|\.orderBy\(|\.where\(|field\s*:|fieldPath)', line_content, re.IGNORECASE):
            return True, 'firestore_field'

        # Context-based skipping
        if context in ['class_name', 'id', 'firestore', 'url', 'key']:
            return True, 'invalid_context'

        return False, ''

    def normalize_text(self, text: str) -> str:
        """Normalize text for comparison (remove quotes, trim)."""
        return text.strip().strip('"\'')

    def find_translation_key(self, text: str) -> str | None:
        """Find translation key for given Cyrillic text."""
        normalized = self.normalize_text(text)

        # Direct lookup
        if normalized in self.translations:
            return self.translations[normalized]['key']

        # Try with different quote variations
        for variant in [text, text.strip(), text.strip('"\'')]:
            if variant in self.translations:
                return self.translations[variant]['key']

        return None

    def generate_key(self, text: str) -> str:
        """Generate a new translation key from text."""
        # Remove special characters, keep only Cyrillic and spaces
        clean = re.sub(r'[^\w\s]', '', text, flags=re.UNICODE)
        # Convert to lowercase
        clean = clean.lower().strip()
        # Replace spaces with underscores
        clean = re.sub(r'\s+', '_', clean)
        # Limit length
        if len(clean) > 50:
            clean = clean[:50]
        return clean

    def create_backup(self, file_path: Path):
        """Create a backup of the file."""
        backup_dir = self.project_root / 'backups' / datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir.mkdir(parents=True, exist_ok=True)

        relative_path = file_path.relative_to(self.project_root)
        backup_path = backup_dir / relative_path
        backup_path.parent.mkdir(parents=True, exist_ok=True)

        shutil.copy2(file_path, backup_path)
        self.stats['backup_created'] += 1
        return backup_path

    def escape_for_template_literal(self, text: str) -> str:
        """Escape text for use in template literal."""
        # Escape backticks and ${} constructs
        text = text.replace('`', '\\`')
        text = text.replace('${', '\\${')
        return text

    def replace_in_template_literal(self, match, translation_key: str) -> str:
        """Replace Cyrillic text in template literal with ${window.t('key')}."""
        full_match = match.group(0)
        cyrillic_text = match.group(1) or match.group(2)

        # Determine quote type used
        if full_match.startswith('`'):
            # Already in template literal
            return f"${{window.t('{translation_key}')}}"
        else:
            # In regular string, need to convert to template literal
            return f"${{window.t('{translation_key}')}}"

    def replace_in_string(self, content: str, text: str, translation_key: str, line_content: str) -> str:
        """
        Replace a Cyrillic string with window.t() call.
        Handles different contexts intelligently.
        """
        # Escape special regex characters in text
        escaped_text = re.escape(text)

        # Check if this is in a template literal context
        if '`' in line_content and '${' in line_content:
            # In template literal - replace with ${window.t('key')}
            pattern = rf'(["\']){escaped_text}\1'
            replacement = f"window.t('{translation_key}')"
            new_content = re.sub(pattern, replacement, content, count=1)
            if new_content != content:
                return new_content

        # Check if this is innerHTML or similar assignment
        if re.search(r'\.innerHTML\s*=|\.textContent\s*=|\.innerText\s*=', line_content):
            # Replace the string value with window.t()
            pattern = rf'(["\']){escaped_text}\1'
            replacement = f"window.t('{translation_key}')"
            new_content = re.sub(pattern, replacement, content, count=1)
            if new_content != content:
                return new_content

        # Check if in template literal (backticks)
        if '`' in line_content:
            # Try to replace in template literal context
            # Pattern: backtick string containing the text
            pattern = rf'`([^`]*){escaped_text}([^`]*)`'
            def replacer(m):
                before = m.group(1)
                after = m.group(2)
                return f"`{before}${{window.t('{translation_key}')}}{after}`"

            new_content = re.sub(pattern, replacer, content, count=1)
            if new_content != content:
                return new_content

        # Default: replace quoted string with window.t() call
        # Try double quotes
        pattern = rf'"{escaped_text}"'
        replacement = f"window.t('{translation_key}')"
        new_content = content.replace(f'"{text}"', replacement, 1)
        if new_content != content:
            return new_content

        # Try single quotes
        new_content = content.replace(f"'{text}'", replacement, 1)
        if new_content != content:
            return new_content

        # Try without quotes (bare text in template literal)
        if text in content:
            # This is risky - only do if we're sure it's in a template literal
            if '`' in line_content:
                new_content = content.replace(text, f"${{window.t('{translation_key}')}}", 1)
                return new_content

        return content

    def process_file(self, file_path: Path, strings_in_file: List[Dict]) -> bool:
        """
        Process a single JS file and replace Cyrillic strings.
        Returns True if file was modified.
        """
        if not file_path.exists():
            print(f"[!] File not found: {file_path}")
            return False

        print(f"\nProcessing: {file_path.relative_to(self.project_root)}")

        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        content = original_content
        modified = False
        replacements_in_file = 0

        # Sort strings by line number in reverse to avoid offset issues
        strings_sorted = sorted(strings_in_file, key=lambda x: x.get('line', 0), reverse=True)

        for string_info in strings_sorted:
            text = string_info.get('text', '')
            line_num = string_info.get('line', 0)
            context = string_info.get('context', '')
            line_content = string_info.get('line_content', '')

            # Skip if not Cyrillic
            if not self.is_cyrillic(text):
                continue

            # Check if should skip
            should_skip, reason = self.should_skip_replacement(line_content, text, context)
            if should_skip:
                self.stats['strings_skipped'] += 1
                self.skipped_reasons[reason] = self.skipped_reasons.get(reason, 0) + 1
                print(f"  [-] Skipping '{text[:30]}...' (line {line_num}): {reason}")
                continue

            # Find translation key
            translation_key = self.find_translation_key(text)

            if not translation_key:
                # Generate new key
                translation_key = self.generate_key(text)

                # Check for duplicates
                counter = 1
                original_key = translation_key
                while translation_key in self.new_translations:
                    translation_key = f"{original_key}_{counter}"
                    counter += 1

                self.new_translations[translation_key] = {
                    'key': translation_key,
                    'text': text,
                    'file': str(file_path.relative_to(self.project_root)),
                    'line': line_num,
                    'context': context
                }
                self.stats['new_keys_needed'] += 1
                print(f"  [+] New key needed: '{translation_key}' for '{text[:30]}...'")

            # Attempt replacement
            new_content = self.replace_in_string(content, text, translation_key, line_content)

            if new_content != content:
                content = new_content
                modified = True
                replacements_in_file += 1
                self.stats['strings_replaced'] += 1

                self.replacement_log.append({
                    'file': str(file_path.relative_to(self.project_root)),
                    'line': line_num,
                    'original': text,
                    'key': translation_key,
                    'context': context
                })

                print(f"  [OK] Replaced '{text[:30]}...' with window.t('{translation_key}')")
            else:
                self.stats['strings_skipped'] += 1
                self.skipped_reasons['no_translation'] = self.skipped_reasons.get('no_translation', 0) + 1
                print(f"  [!] Could not replace '{text[:30]}...' (line {line_num})")

        # Save modified file
        if modified:
            # Create backup
            backup_path = self.create_backup(file_path)
            print(f"  [BACKUP] Backup created: {backup_path.relative_to(self.project_root)}")

            # Write modified content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  [DONE] File modified: {replacements_in_file} replacements made")
            self.stats['files_modified'] += 1

        self.stats['files_processed'] += 1
        return modified

    def group_strings_by_file(self) -> Dict[str, List[Dict]]:
        """Group Cyrillic strings by file path."""
        grouped = {}

        for string_info in self.analysis_results.get('cyrillic_strings', []):
            file_path = string_info.get('file', '')
            if file_path not in grouped:
                grouped[file_path] = []
            grouped[file_path].append(string_info)

        return grouped

    def save_new_translations(self):
        """Save new translation keys that need to be added."""
        if not self.new_translations:
            return

        output_file = self.project_root / 'new-translation-keys.json'

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.new_translations, f, ensure_ascii=False, indent=2)

        print(f"\n[NOTE] New translation keys saved to: {output_file}")

    def save_replacement_log(self):
        """Save detailed log of all replacements."""
        if not self.replacement_log:
            return

        output_file = self.project_root / 'replacement-log.json'

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.replacement_log, f, ensure_ascii=False, indent=2)

        print(f"[LOG] Replacement log saved to: {output_file}")

    def print_summary(self):
        """Print summary of operations."""
        print("\n" + "="*80)
        print("REPLACEMENT SUMMARY")
        print("="*80)
        print(f"\n[STATS] Statistics:")
        print(f"  Files processed:      {self.stats['files_processed']}")
        print(f"  Files modified:       {self.stats['files_modified']}")
        print(f"  Backups created:      {self.stats['backup_created']}")
        print(f"  Strings replaced:     {self.stats['strings_replaced']}")
        print(f"  Strings skipped:      {self.stats['strings_skipped']}")
        print(f"  New keys needed:      {self.stats['new_keys_needed']}")

        print(f"\n[-] Skip Reasons:")
        for reason, count in sorted(self.skipped_reasons.items(), key=lambda x: x[1], reverse=True):
            if count > 0:
                print(f"  {reason:20s}: {count}")

        print(f"\n[FILES] Output Files:")
        if self.stats['backup_created'] > 0:
            print(f"  Backups: backups/{datetime.now().strftime('%Y%m%d_%H%M%S')}/")
        if self.new_translations:
            print(f"  New translation keys: new-translation-keys.json ({len(self.new_translations)} keys)")
        if self.replacement_log:
            print(f"  Replacement log: replacement-log.json ({len(self.replacement_log)} entries)")

        print("\n" + "="*80)

    def run(self):
        """Main execution method."""
        print("="*80)
        print("CYRILLIC STRING REPLACEMENT TOOL")
        print("="*80)

        # Load data
        self.load_data()

        # Group strings by file
        grouped_strings = self.group_strings_by_file()
        print(f"\n[FOLDER] Found {len(grouped_strings)} files with Cyrillic strings")

        # Process each file
        for file_path_str, strings in grouped_strings.items():
            # Convert backslashes to forward slashes and create Path
            file_path_str = file_path_str.replace('\\', '/')
            file_path = self.project_root / file_path_str

            self.process_file(file_path, strings)

        # Save outputs
        self.save_new_translations()
        self.save_replacement_log()

        # Print summary
        self.print_summary()


def main():
    """Main entry point."""
    project_root = Path(__file__).parent

    print(f"Project root: {project_root}\n")

    replacer = CyrillicReplacer(project_root)
    replacer.run()


if __name__ == '__main__':
    main()
