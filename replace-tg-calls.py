#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to replace _tg() calls with window.t() calls in JS files.

This script:
1. Loads analysis-results.json to get all _tg() calls found
2. Loads translations-to-add.json to get the key mappings (ua text -> key name)
3. Replaces _tg() calls with window.t() calls based on the mappings
4. Creates backups before modifying files
5. Handles special cases (template variables, arrays, comments)
"""

import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Set
from collections import defaultdict

# Ensure UTF-8 output on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class TgReplacer:
    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.translations = {}
        self.tg_calls = []
        self.stats = {
            'files_processed': 0,
            'total_replaced': 0,
            'total_skipped': 0,
            'files_modified': {},
            'skipped_reasons': defaultdict(int)
        }

    def load_data(self):
        """Load analysis results and translations mapping."""
        print("Loading analysis-results.json...")
        analysis_file = self.base_dir / "analysis-results.json"
        with open(analysis_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.tg_calls = data.get('tg_calls', [])
        print(f"  Loaded {len(self.tg_calls)} _tg() calls")

        print("\nLoading translations-to-add.json...")
        translations_file = self.base_dir / "translations-to-add.json"
        with open(translations_file, 'r', encoding='utf-8') as f:
            self.translations = json.load(f)
        print(f"  Loaded {len(self.translations)} translation mappings")

    def should_skip_call(self, full_match: str) -> Tuple[bool, str]:
        """
        Check if a _tg() call should be skipped.
        Returns (should_skip, reason)
        """
        # Skip if contains template variables ${...}
        if '${' in full_match and '}' in full_match:
            return True, "template_variable"

        # Skip if contains arrays []
        if '[' in full_match and ']' in full_match:
            return True, "array"

        return False, ""

    def escape_regex_special_chars(self, text: str) -> str:
        """Escape special regex characters in text for safe pattern matching."""
        # Escape all special regex characters
        special_chars = r'\.^$*+?{}[]|()'
        escaped = text
        for char in special_chars:
            escaped = escaped.replace(char, '\\' + char)
        return escaped

    def find_translation_key(self, ua_text: str) -> str:
        """Find the translation key for given Ukrainian text."""
        if ua_text in self.translations:
            return self.translations[ua_text]['key']
        return None

    def create_backup(self, file_path: Path) -> Path:
        """Create a backup of the file before modification."""
        backup_path = file_path.with_suffix(file_path.suffix + '.backup')
        shutil.copy2(file_path, backup_path)
        return backup_path

    def is_in_comment(self, content: str, match_start: int) -> bool:
        """Check if a match position is inside a comment."""
        # Find the start of the line containing the match
        line_start = content.rfind('\n', 0, match_start) + 1
        line_content = content[line_start:match_start]

        # Check for single-line comment //
        if '//' in line_content:
            return True

        # Check for multi-line comment /* ... */
        # Count opening and closing comment markers before the match
        before_match = content[:match_start]
        open_count = before_match.count('/*')
        close_count = before_match.count('*/')

        # If more opening than closing, we're inside a multi-line comment
        if open_count > close_count:
            return True

        return False

    def replace_in_file(self, file_path: Path, calls_in_file: List[Dict]) -> int:
        """
        Replace _tg() calls in a single file.
        Returns the number of replacements made.
        """
        print(f"\n  Processing: {file_path.relative_to(self.base_dir)}")

        # Read file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, 'r', encoding='windows-1251') as f:
                content = f.read()

        original_content = content
        replacements_made = 0
        skipped_count = 0

        # Sort calls by line number (descending) to process from bottom to top
        # This prevents position shifts from affecting later replacements
        sorted_calls = sorted(calls_in_file, key=lambda x: x.get('line', 0), reverse=True)

        # Group calls by their full_match to handle multiple identical calls
        calls_by_match = defaultdict(list)
        for call in sorted_calls:
            calls_by_match[call['full_match']].append(call)

        # Process each unique _tg() call pattern
        for full_match, calls in calls_by_match.items():
            # Check if should skip
            should_skip, skip_reason = self.should_skip_call(full_match)
            if should_skip:
                skipped_count += len(calls)
                self.stats['skipped_reasons'][skip_reason] += len(calls)
                print(f"    SKIP: {full_match[:80]}... (reason: {skip_reason})")
                continue

            # Get the first call to extract ua_text and ru_text
            call = calls[0]
            ua_text = call['ua_text']
            ru_text = call.get('ru_text', '')

            # Check if already using window.t()
            if call.get('is_using_window_t', False):
                # Pattern: _tg('ua text', window.t('key')) -> window.t('key')
                # Extract the window.t() part
                window_t_match = re.search(r"window\.t\([^)]+\)", full_match)
                if window_t_match:
                    replacement = window_t_match.group(0)
                else:
                    print(f"    WARNING: Expected window.t() in: {full_match}")
                    skipped_count += len(calls)
                    continue
            else:
                # Pattern: _tg('ua text', 'ru text') -> window.t('key')
                # Find the translation key
                key = self.find_translation_key(ua_text)
                if not key:
                    print(f"    WARNING: No translation key found for: {ua_text}")
                    skipped_count += len(calls)
                    self.stats['skipped_reasons']['no_key'] += len(calls)
                    continue

                replacement = f"window.t('{key}')"

            # Escape the full_match for regex
            escaped_match = self.escape_regex_special_chars(full_match)

            # Count actual occurrences in the file (not in comments)
            occurrences = 0
            for match in re.finditer(re.escape(full_match), content):
                if not self.is_in_comment(content, match.start()):
                    occurrences += 1

            if occurrences == 0:
                print(f"    WARNING: Could not find pattern in file: {full_match[:80]}...")
                skipped_count += len(calls)
                continue

            # Replace all occurrences
            # We need to be careful not to replace occurrences in comments
            new_content = ""
            last_end = 0
            replaced_count = 0

            for match in re.finditer(re.escape(full_match), content):
                # Add content before this match
                new_content += content[last_end:match.start()]

                # Check if in comment
                if self.is_in_comment(content, match.start()):
                    # Keep original
                    new_content += match.group(0)
                    skipped_count += 1
                    self.stats['skipped_reasons']['in_comment'] += 1
                else:
                    # Replace
                    new_content += replacement
                    replaced_count += 1

                last_end = match.end()

            # Add remaining content
            new_content += content[last_end:]
            content = new_content

            if replaced_count > 0:
                replacements_made += replaced_count
                print(f"    [OK] Replaced {replaced_count}x: {full_match[:60]}... -> {replacement}")

        # Save the modified file if any replacements were made
        if replacements_made > 0:
            # Create backup
            backup_path = self.create_backup(file_path)
            print(f"    Backup created: {backup_path.name}")

            # Write modified content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"    [OK] File modified: {replacements_made} replacements made")
        else:
            print(f"    No replacements made in this file")

        if skipped_count > 0:
            print(f"    Skipped {skipped_count} calls")

        return replacements_made

    def process_files(self):
        """Process all files that have _tg() calls."""
        print("\n" + "="*70)
        print("PROCESSING FILES")
        print("="*70)

        # Group calls by file
        calls_by_file = defaultdict(list)
        for call in self.tg_calls:
            file_path = call['file']
            calls_by_file[file_path].append(call)

        print(f"\nTotal files to process: {len(calls_by_file)}")

        # Process each file
        for file_path_str, calls in calls_by_file.items():
            # Convert to absolute path
            # The file paths in JSON use backslashes, convert to forward slashes
            file_path_str = file_path_str.replace('\\', '/')
            file_path = self.base_dir / file_path_str

            if not file_path.exists():
                print(f"\n  WARNING: File not found: {file_path}")
                self.stats['skipped_reasons']['file_not_found'] += len(calls)
                continue

            self.stats['files_processed'] += 1
            replacements = self.replace_in_file(file_path, calls)

            if replacements > 0:
                self.stats['files_modified'][str(file_path.relative_to(self.base_dir))] = replacements
                self.stats['total_replaced'] += replacements

    def print_summary(self):
        """Print summary of all replacements."""
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)

        print(f"\nTotal files processed: {self.stats['files_processed']}")
        print(f"Total files modified: {len(self.stats['files_modified'])}")
        print(f"\nTotal _tg() calls replaced: {self.stats['total_replaced']}")

        # Calculate total skipped
        total_skipped = sum(self.stats['skipped_reasons'].values())
        print(f"Total _tg() calls skipped: {total_skipped}")

        if self.stats['skipped_reasons']:
            print("\nSkipped by reason:")
            for reason, count in sorted(self.stats['skipped_reasons'].items()):
                print(f"  - {reason}: {count}")

        if self.stats['files_modified']:
            print("\n" + "-"*70)
            print("FILES MODIFIED (with replacement counts):")
            print("-"*70)
            for file_path, count in sorted(self.stats['files_modified'].items()):
                print(f"  {file_path}: {count} replacements")

        print("\n" + "="*70)
        print("DONE!")
        print("="*70)
        print("\nBackup files have been created with .backup extension")
        print("Review the changes and delete backups if everything looks good.")

    def run(self):
        """Main execution method."""
        print("="*70)
        print("TG CALL REPLACER")
        print("="*70)

        self.load_data()
        self.process_files()
        self.print_summary()


def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent

    replacer = TgReplacer(script_dir)
    replacer.run()


if __name__ == '__main__':
    main()
