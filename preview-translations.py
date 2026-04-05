#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Preview Translation Changes (Dry Run)

This script shows what would be changed without modifying any files.
Use this to preview the changes before running add-translations.py
"""

import json
import re
import os

def preview_changes(json_path, js_path):
    """Preview what changes would be made."""

    print("🔍 PREVIEW MODE - No files will be modified\n")
    print("=" * 70)

    # Load JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            translations_data = json.load(f)
        print(f"✓ Found {len(translations_data)} translations in JSON")
    except Exception as e:
        print(f"❌ Error loading JSON: {e}")
        return

    # Extract unique keys
    unique_keys = {}
    for display_text, trans_data in translations_data.items():
        if 'key' not in trans_data:
            continue
        key = trans_data['key']
        if key not in unique_keys:
            ua_text = trans_data.get('ua', '').strip() or trans_data.get('ru', '').strip() or display_text
            unique_keys[key] = ua_text

    print(f"✓ Found {len(unique_keys)} unique keys\n")

    # Load JS file
    try:
        with open(js_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
        print(f"✓ Loaded JavaScript file\n")
    except Exception as e:
        print(f"❌ Error loading JavaScript: {e}")
        return

    # Check which keys already exist
    existing_keys = []
    new_keys = []

    for key in unique_keys.keys():
        # Simple check - look for the key pattern
        pattern = rf'^\s*{re.escape(key)}\s*:'
        if re.search(pattern, js_content, re.MULTILINE):
            existing_keys.append(key)
        else:
            new_keys.append(key)

    print("=" * 70)
    print("📊 PREVIEW SUMMARY")
    print("=" * 70)

    print(f"\n📈 Statistics:")
    print(f"  Total unique keys in JSON: {len(unique_keys)}")
    print(f"  Keys already in JS file: {len(existing_keys)}")
    print(f"  NEW keys to be added: {len(new_keys)}")

    if new_keys:
        print(f"\n✨ New keys that will be added ({len(new_keys)}):")
        for i, key in enumerate(new_keys[:20], 1):
            ua_text = unique_keys[key]
            # Truncate long texts
            if len(ua_text) > 50:
                ua_text = ua_text[:47] + "..."
            print(f"  {i:3d}. {key:30s} → {ua_text}")

        if len(new_keys) > 20:
            print(f"  ... and {len(new_keys) - 20} more")

    if existing_keys:
        print(f"\n⏭️  Keys that will be skipped (already exist): {len(existing_keys)}")
        if len(existing_keys) <= 10:
            for key in existing_keys:
                print(f"  - {key}")
        else:
            for key in existing_keys[:5]:
                print(f"  - {key}")
            print(f"  ... and {len(existing_keys) - 5} more")

    print("\n" + "=" * 70)
    print("💡 To apply these changes, run:")
    print("   python add-translations.py")
    print("=" * 70)

def main():
    """Main entry point."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'translations-to-add.json')
    js_path = os.path.join(script_dir, 'js', 'modules', '01-translations-v2.js')

    preview_changes(json_path, js_path)

if __name__ == '__main__':
    main()
