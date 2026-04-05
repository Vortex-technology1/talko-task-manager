#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick validation script for translations-to-add.json

This script checks:
- JSON is valid
- Required fields are present
- Shows statistics about the translations
"""

import json
import os
from collections import Counter

def validate_json(json_path):
    """Validate the translations JSON file."""

    print("🔍 Validating translations-to-add.json...\n")

    # Check file exists
    if not os.path.exists(json_path):
        print(f"❌ File not found: {json_path}")
        return False

    # Try to load JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✓ Valid JSON format")
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False

    # Statistics
    total_entries = len(data)
    entries_with_key = 0
    entries_with_ua = 0
    entries_with_ru = 0
    entries_with_en = 0
    entries_with_de = 0
    entries_with_cs = 0
    entries_with_pl = 0

    missing_key = []
    missing_ua = []
    missing_ru = []

    sources = Counter()
    unique_keys = set()
    duplicate_keys = []

    # Analyze each entry
    for display_text, trans_data in data.items():
        # Count fields
        if 'key' in trans_data:
            entries_with_key += 1
            key = trans_data['key']
            if key in unique_keys:
                duplicate_keys.append(key)
            unique_keys.add(key)
        else:
            missing_key.append(display_text)

        if 'ua' in trans_data:
            entries_with_ua += 1
        else:
            missing_ua.append(display_text)

        if 'ru' in trans_data:
            entries_with_ru += 1
        else:
            missing_ru.append(display_text)

        if 'en' in trans_data:
            entries_with_en += 1

        if 'de' in trans_data:
            entries_with_de += 1

        if 'cs' in trans_data:
            entries_with_cs += 1

        if 'pl' in trans_data:
            entries_with_pl += 1

        if 'source' in trans_data:
            sources[trans_data['source']] += 1

    # Print statistics
    print(f"\n📊 Statistics:")
    print(f"  Total entries: {total_entries}")
    print(f"  Unique keys: {len(unique_keys)}")
    print(f"  Entries with 'key': {entries_with_key}")
    print(f"  Entries with 'ua': {entries_with_ua}")
    print(f"  Entries with 'ru': {entries_with_ru}")
    print(f"  Entries with 'en': {entries_with_en} (will be generated if missing)")
    print(f"  Entries with 'de': {entries_with_de} (will be generated if missing)")
    print(f"  Entries with 'cs': {entries_with_cs} (will be generated if missing)")
    print(f"  Entries with 'pl': {entries_with_pl} (will be generated if missing)")

    if sources:
        print(f"\n📍 Sources:")
        for source, count in sources.most_common():
            print(f"  {source}: {count}")

    # Show issues
    has_issues = False

    if missing_key:
        has_issues = True
        print(f"\n⚠️  Missing 'key' field ({len(missing_key)} entries):")
        for display_text in missing_key[:5]:
            print(f"  - {display_text}")
        if len(missing_key) > 5:
            print(f"  ... and {len(missing_key) - 5} more")

    if missing_ua:
        has_issues = True
        print(f"\n⚠️  Missing 'ua' field ({len(missing_ua)} entries):")
        for display_text in missing_ua[:5]:
            print(f"  - {display_text}")
        if len(missing_ua) > 5:
            print(f"  ... and {len(missing_ua) - 5} more")

    if missing_ru:
        has_issues = True
        print(f"\n⚠️  Missing 'ru' field ({len(missing_ru)} entries):")
        for display_text in missing_ru[:5]:
            print(f"  - {display_text}")
        if len(missing_ru) > 5:
            print(f"  ... and {len(missing_ru) - 5} more")

    if duplicate_keys:
        has_issues = True
        print(f"\n⚠️  Duplicate keys ({len(duplicate_keys)}):")
        for key in duplicate_keys[:10]:
            print(f"  - {key}")
        if len(duplicate_keys) > 10:
            print(f"  ... and {len(duplicate_keys) - 10} more")

    # Summary
    print("\n" + "=" * 70)
    if has_issues:
        print("⚠️  Validation completed with warnings (see above)")
        print("   The script will skip entries with missing required fields.")
    else:
        print("✅ Validation passed! File is ready for processing.")
    print("=" * 70)

    return True

def main():
    """Main entry point."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'translations-to-add.json')

    validate_json(json_path)

if __name__ == '__main__':
    main()
