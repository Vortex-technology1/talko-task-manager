#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to find and fix nested translation calls in JavaScript files.

This script scans JS files for patterns like:
- _t(window.t('key'), window.t('key')) -> window.t('key')
- _tg(window.t('key'), window.t('key')) -> window.t('key')

It creates backups before modifying files and provides detailed reporting.
"""

import os
import re
import shutil
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple

# Set UTF-8 encoding for output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')


class TranslationFixer:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.js_path = self.base_path / "js" / "modules"
        self.backup_dir = self.base_path / "backups" / f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.stats = {
            'files_scanned': 0,
            'files_fixed': 0,
            'nested_calls_fixed': 0,
            'backups_created': 0,
            'errors': []
        }
        self.changes_log = []
        self.remaining_tg_calls = []
        self.warnings = []

    def find_js_files(self) -> List[Path]:
        """Find all JavaScript files in js/modules/"""
        if not self.js_path.exists():
            print(f"[ERROR] Directory not found: {self.js_path}")
            return []

        js_files = list(self.js_path.rglob("*.js"))
        print(f"[INFO] Found {len(js_files)} JavaScript files in {self.js_path}")
        return js_files

    def create_backup(self, file_path: Path) -> bool:
        """Create a backup of the file before modification"""
        try:
            # Create backup directory structure
            relative_path = file_path.relative_to(self.base_path)
            backup_file = self.backup_dir / relative_path
            backup_file.parent.mkdir(parents=True, exist_ok=True)

            # Copy file to backup location
            shutil.copy2(file_path, backup_file)
            self.stats['backups_created'] += 1
            return True
        except Exception as e:
            self.stats['errors'].append(f"Backup failed for {file_path}: {str(e)}")
            return False

    def check_syntax_issues(self, content: str, file_path: Path) -> List[str]:
        """Check for potential syntax issues"""
        issues = []

        # Check for unclosed brackets
        open_parens = content.count('(')
        close_parens = content.count(')')
        if open_parens != close_parens:
            issues.append(f"Mismatched parentheses: {open_parens} open, {close_parens} close")

        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces != close_braces:
            issues.append(f"Mismatched braces: {open_braces} open, {close_braces} close")

        open_brackets = content.count('[')
        close_brackets = content.count(']')
        if open_brackets != close_brackets:
            issues.append(f"Mismatched brackets: {open_brackets} open, {close_brackets} close")

        # Check for unclosed quotes (basic check)
        # Count single quotes not in comments or strings
        single_quotes = len(re.findall(r"(?<!\\)'", content))
        if single_quotes % 2 != 0:
            issues.append(f"Possible unclosed single quotes")

        double_quotes = len(re.findall(r'(?<!\\)"', content))
        if double_quotes % 2 != 0:
            issues.append(f"Possible unclosed double quotes")

        return issues

    def find_nested_translation_calls(self, content: str) -> List[Tuple[str, str, str]]:
        """
        Find nested translation calls and return list of (full_match, replacement, pattern_type)

        Patterns to find:
        1. _t(window.t('key1'), window.t('key2')) -> window.t('key1')
        2. _t(window.t("key1"), window.t("key2")) -> window.t("key1")
        3. _tg(window.t('key'), ...) -> window.t('key')
        """
        replacements = []

        # Pattern 1: _t(window.t('...'), window.t('...'))
        # This pattern captures nested _t calls with two window.t arguments
        pattern1 = r"_t\s*\(\s*(window\.t\s*\(['\"][^'\"]+['\"]\))\s*,\s*window\.t\s*\(['\"][^'\"]+['\"]\)\s*\)"
        for match in re.finditer(pattern1, content):
            full_match = match.group(0)
            first_arg = match.group(1)  # The first window.t('key')
            replacements.append((full_match, first_arg, "_t with two window.t arguments"))

        # Pattern 2: _tg(window.t('...'), ...)
        # This pattern captures _tg calls with window.t as first argument
        pattern2 = r"_tg\s*\(\s*(window\.t\s*\(['\"][^'\"]+['\"]\))\s*(?:,\s*[^)]+)?\)"
        for match in re.finditer(pattern2, content):
            full_match = match.group(0)
            first_arg = match.group(1)  # The window.t('key')
            replacements.append((full_match, first_arg, "_tg with window.t argument"))

        # Pattern 3: _t or _tg with multiple nested levels
        # Match cases like _t(_t(window.t(...), ...), ...)
        pattern3 = r"_t(?:g)?\s*\(\s*_t(?:g)?\s*\((window\.t\s*\(['\"][^'\"]+['\"]\)[^)]*)\)[^)]*\)"
        for match in re.finditer(pattern3, content):
            # Extract the innermost window.t call
            inner_content = match.group(1)
            window_t_match = re.search(r"window\.t\s*\(['\"][^'\"]+['\"]\)", inner_content)
            if window_t_match:
                full_match = match.group(0)
                first_window_t = window_t_match.group(0)
                replacements.append((full_match, first_window_t, "deeply nested translation"))

        return replacements

    def find_remaining_tg_calls(self, content: str, file_path: Path):
        """Find any remaining _tg() calls after fixes"""
        pattern = r"_tg\s*\([^)]+\)"
        matches = re.finditer(pattern, content)

        for match in matches:
            # Get line number
            line_num = content[:match.start()].count('\n') + 1
            self.remaining_tg_calls.append({
                'file': str(file_path),
                'line': line_num,
                'call': match.group(0)
            })

    def process_file(self, file_path: Path) -> bool:
        """Process a single JavaScript file"""
        try:
            self.stats['files_scanned'] += 1

            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()

            # Check for syntax issues before processing
            syntax_issues = self.check_syntax_issues(original_content, file_path)
            if syntax_issues:
                self.warnings.append({
                    'file': str(file_path),
                    'type': 'syntax',
                    'issues': syntax_issues
                })

            # Find nested translation calls
            replacements = self.find_nested_translation_calls(original_content)

            if not replacements:
                # No nested calls found, but check for remaining _tg calls
                self.find_remaining_tg_calls(original_content, file_path)
                return False

            # Create backup before modifying
            if not self.create_backup(file_path):
                return False

            # Apply replacements
            modified_content = original_content
            file_changes = []

            for full_match, replacement, pattern_type in replacements:
                if full_match in modified_content:
                    modified_content = modified_content.replace(full_match, replacement, 1)
                    file_changes.append({
                        'pattern': pattern_type,
                        'from': full_match,
                        'to': replacement
                    })
                    self.stats['nested_calls_fixed'] += 1

            # Write modified content back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)

            # Log changes
            if file_changes:
                self.stats['files_fixed'] += 1
                self.changes_log.append({
                    'file': str(file_path),
                    'changes': file_changes
                })

            # Check for remaining _tg calls after fixes
            self.find_remaining_tg_calls(modified_content, file_path)

            return True

        except Exception as e:
            self.stats['errors'].append(f"Error processing {file_path}: {str(e)}")
            return False

    def run(self):
        """Main execution method"""
        print("=" * 80)
        print("Nested Translation Call Fixer")
        print("=" * 80)
        print(f"Base path: {self.base_path}")
        print(f"Scanning: {self.js_path}")
        print()

        # Find all JS files
        js_files = self.find_js_files()
        if not js_files:
            print("[ERROR] No JavaScript files found. Exiting.")
            return

        print(f"Processing {len(js_files)} files...")
        print()

        # Process each file
        for file_path in js_files:
            print(f"  Checking: {file_path.name}", end=" ")
            if self.process_file(file_path):
                print("[FIXED]")
            else:
                print("(no changes)")

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print detailed summary of operations"""
        print()
        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Files scanned:          {self.stats['files_scanned']}")
        print(f"Files fixed:            {self.stats['files_fixed']}")
        print(f"Nested calls fixed:     {self.stats['nested_calls_fixed']}")
        print(f"Backups created:        {self.stats['backups_created']}")
        print(f"Errors:                 {len(self.stats['errors'])}")
        print()

        # Detailed changes
        if self.changes_log:
            print("=" * 80)
            print("DETAILED CHANGES")
            print("=" * 80)
            for log_entry in self.changes_log:
                print(f"\n[FILE] {log_entry['file']}")
                for idx, change in enumerate(log_entry['changes'], 1):
                    print(f"  {idx}. Pattern: {change['pattern']}")
                    print(f"     FROM: {change['from'][:100]}{'...' if len(change['from']) > 100 else ''}")
                    print(f"     TO:   {change['to']}")
                print()

        # Remaining _tg calls
        if self.remaining_tg_calls:
            print("=" * 80)
            print(f"REMAINING _tg() CALLS ({len(self.remaining_tg_calls)})")
            print("=" * 80)
            for tg_call in self.remaining_tg_calls:
                print(f"  [FILE] {tg_call['file']}:{tg_call['line']}")
                print(f"     {tg_call['call']}")
                print()

        # Warnings
        if self.warnings:
            print("=" * 80)
            print(f"WARNINGS ({len(self.warnings)})")
            print("=" * 80)
            for warning in self.warnings:
                print(f"  [FILE] {warning['file']}")
                print(f"     Type: {warning['type']}")
                if warning['type'] == 'syntax':
                    for issue in warning['issues']:
                        print(f"     - {issue}")
                print()

        # Errors
        if self.stats['errors']:
            print("=" * 80)
            print(f"ERRORS ({len(self.stats['errors'])})")
            print("=" * 80)
            for error in self.stats['errors']:
                print(f"  * {error}")
            print()

        # Backup location
        if self.stats['backups_created'] > 0:
            print("=" * 80)
            print("BACKUPS")
            print("=" * 80)
            print(f"Backup location: {self.backup_dir}")
            print()

        # Final status
        print("=" * 80)
        if self.stats['files_fixed'] > 0:
            print("[SUCCESS] Processing complete! Files have been modified.")
            print("          Review the changes and test thoroughly.")
        else:
            print("[INFO] No nested translation calls found.")
        print("=" * 80)


def main():
    """Main entry point"""
    # Use the current working directory as base path
    base_path = r"C:\Users\User\talko-task-manager"

    # Check if base path exists
    if not os.path.exists(base_path):
        print(f"[ERROR] Base path does not exist: {base_path}")
        print("        Please ensure you're running this from the correct directory.")
        return 1

    fixer = TranslationFixer(base_path)
    fixer.run()

    return 0


if __name__ == "__main__":
    exit(main())
