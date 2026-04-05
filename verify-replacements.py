#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verification script to check the results of _tg() replacements.
"""

import os
import re
from pathlib import Path

def count_tg_calls(file_path):
    """Count _tg() calls in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return len(re.findall(r'_tg\(', content))
    except:
        return 0

def main():
    base_dir = Path(__file__).parent / "js" / "modules"

    print("="*80)
    print("VERIFICATION OF _tg() REPLACEMENTS")
    print("="*80)
    print()

    total_before = 0
    total_after = 0
    total_replaced = 0
    files_modified = []

    # Find all backup files
    backup_files = sorted(base_dir.glob("*.backup"))

    if not backup_files:
        print("No backup files found!")
        return

    print(f"{'File':<40} {'Before':>10} {'After':>10} {'Replaced':>10}")
    print("-" * 80)

    for backup_file in backup_files:
        original_file = backup_file.with_suffix('')

        before_count = count_tg_calls(backup_file)
        after_count = count_tg_calls(original_file)
        replaced = before_count - after_count

        total_before += before_count
        total_after += after_count
        total_replaced += replaced

        if replaced > 0:
            files_modified.append(original_file.name)

        print(f"{original_file.name:<40} {before_count:>10} {after_count:>10} {replaced:>10}")

    print("-" * 80)
    print(f"{'TOTAL':<40} {total_before:>10} {total_after:>10} {total_replaced:>10}")
    print()
    print(f"Files modified: {len(files_modified)}")
    print(f"Total _tg() calls replaced: {total_replaced}")
    print(f"Total _tg() calls remaining: {total_after}")
    print()

    if total_after > 0:
        print("NOTE: Some _tg() calls remain because they:")
        print("  - Use different quote styles (double quotes instead of single)")
        print("  - Contain template variables ${...}")
        print("  - Contain arrays []")
        print("  - Are in comments")
        print("  - Don't have matching translations")

    print()
    print("="*80)

if __name__ == '__main__':
    main()
