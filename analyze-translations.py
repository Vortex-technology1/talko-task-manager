#!/usr/bin/env python3
"""
Analyze JavaScript files for translation issues in the TALKO project.
Finds _tg() calls and hardcoded Cyrillic strings that need translation.
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

# Configuration
PROJECT_ROOT = Path(__file__).parent
JS_MODULES_DIR = PROJECT_ROOT / "js" / "modules"

# Files to exclude from analysis
EXCLUDED_FILES = {
    "41-demo-data.js",
    "43-demo-tour.js",
    "80-learning-data.js",
    "80-learning-data-110.js",
    "97-onboarding-i18n.js",
    "97-onboarding.js",
    "93-sites-list.js",
    "01-translations-v2.js"
}

def should_exclude_file(filename):
    """Check if a file should be excluded from analysis."""
    if filename in EXCLUDED_FILES:
        return True
    if filename.startswith("42-niche-"):
        return True
    return False

def generate_camel_case_key(text):
    """Generate a camelCase key from Ukrainian text."""
    # Remove punctuation and special characters
    cleaned = re.sub(r'[^\w\s]', '', text)
    # Split into words
    words = cleaned.split()
    if not words:
        return "unknownKey"

    # Take first 3-4 words max for reasonable key length
    words = words[:4]

    # Convert to camelCase
    camel_key = words[0].lower()
    for word in words[1:]:
        camel_key += word.capitalize()

    # Limit length
    if len(camel_key) > 40:
        camel_key = camel_key[:40]

    return camel_key if camel_key else "unknownKey"

def find_tg_calls(content, filepath):
    """Find all _tg() function calls in the content."""
    tg_calls = []

    # Pattern to match _tg('ua text', 'ru text') or _tg("ua text", "ru text")
    # This pattern captures strings without template literals or arrays
    pattern = r'_tg\s*\(\s*(["\'])([^"\']*?)\1\s*,\s*(["\'])([^"\']*?)\3\s*\)'

    for match in re.finditer(pattern, content):
        ua_text = match.group(2)
        ru_text = match.group(4)

        # Skip if contains template literal variables
        if '${' in ua_text or '${' in ru_text:
            continue

        # Skip if empty
        if not ua_text.strip() or not ru_text.strip():
            continue

        # Find line number
        line_num = content[:match.start()].count('\n') + 1

        # Check if second argument is already window.t()
        full_match = match.group(0)
        is_using_window_t = 'window.t(' in full_match

        tg_calls.append({
            'file': str(filepath.relative_to(PROJECT_ROOT)),
            'line': line_num,
            'ua_text': ua_text,
            'ru_text': ru_text,
            'is_using_window_t': is_using_window_t,
            'full_match': full_match
        })

    return tg_calls

def has_cyrillic(text):
    """Check if text contains Cyrillic characters."""
    return bool(re.search('[А-Яа-яЁёІіЏїЄєҐґ]', text))

def find_cyrillic_strings(content, filepath):
    """Find hardcoded Cyrillic strings in UI rendering contexts."""
    cyrillic_strings = []

    # Split content into lines for better context analysis
    lines = content.split('\n')

    for i, line in enumerate(lines, 1):
        # Skip comments
        if re.match(r'^\s*//', line) or re.match(r'^\s*/\*', line):
            continue

        # Skip console.log statements
        if 'console.log' in line or 'console.error' in line or 'console.warn' in line:
            continue

        # Skip if line already uses window.t()
        if 'window.t(' in line:
            continue

        # Skip _tg() calls (already handled)
        if '_tg(' in line:
            continue

        # Find strings in innerHTML assignments
        innerHTML_pattern = r'\.innerHTML\s*=\s*(["\'])([^"\']*?)\1'
        for match in re.finditer(innerHTML_pattern, line):
            string_content = match.group(2)
            if has_cyrillic(string_content) and string_content.strip():
                cyrillic_strings.append({
                    'file': str(filepath.relative_to(PROJECT_ROOT)),
                    'line': i,
                    'text': string_content,
                    'context': 'innerHTML',
                    'line_content': line.strip()[:100]
                })

        # Find strings in template literals (backticks)
        template_pattern = r'`([^`]*?)`'
        for match in re.finditer(template_pattern, line):
            string_content = match.group(1)
            # Skip if contains template variables
            if '${' in string_content:
                continue
            if has_cyrillic(string_content) and string_content.strip():
                cyrillic_strings.append({
                    'file': str(filepath.relative_to(PROJECT_ROOT)),
                    'line': i,
                    'text': string_content,
                    'context': 'template_literal',
                    'line_content': line.strip()[:100]
                })

        # Find strings in regular quotes (likely UI text)
        # Only if in certain UI contexts (innerHTML, textContent, etc.)
        if any(ctx in line for ctx in ['innerHTML', 'textContent', 'innerText', 'title', 'placeholder', 'value']):
            quote_pattern = r'(["\'])([^"\']{3,}?)\1'
            for match in re.finditer(quote_pattern, line):
                string_content = match.group(2)
                if has_cyrillic(string_content) and string_content.strip():
                    # Avoid duplicates from innerHTML pattern
                    if not any(cs['line'] == i and cs['text'] == string_content for cs in cyrillic_strings):
                        cyrillic_strings.append({
                            'file': str(filepath.relative_to(PROJECT_ROOT)),
                            'line': i,
                            'text': string_content,
                            'context': 'ui_property',
                            'line_content': line.strip()[:100]
                        })

    return cyrillic_strings

def analyze_js_files():
    """Analyze all JavaScript files in the modules directory."""
    print(f"Analyzing JavaScript files in: {JS_MODULES_DIR}")
    print(f"Project root: {PROJECT_ROOT}\n")

    if not JS_MODULES_DIR.exists():
        print(f"Error: Directory not found: {JS_MODULES_DIR}")
        return None

    all_tg_calls = []
    all_cyrillic_strings = []
    file_stats = defaultdict(lambda: {'tg_calls': 0, 'cyrillic_strings': 0})

    # Find all .js files
    js_files = list(JS_MODULES_DIR.glob("*.js"))
    print(f"Found {len(js_files)} JavaScript files")

    analyzed_count = 0
    for js_file in js_files:
        filename = js_file.name

        # Skip excluded files
        if should_exclude_file(filename):
            print(f"Skipping excluded file: {filename}")
            continue

        print(f"Analyzing: {filename}")
        analyzed_count += 1

        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find _tg() calls
            tg_calls = find_tg_calls(content, js_file)
            all_tg_calls.extend(tg_calls)
            file_stats[filename]['tg_calls'] = len(tg_calls)

            # Find Cyrillic strings
            cyrillic_strings = find_cyrillic_strings(content, js_file)
            all_cyrillic_strings.extend(cyrillic_strings)
            file_stats[filename]['cyrillic_strings'] = len(cyrillic_strings)

            if tg_calls or cyrillic_strings:
                print(f"  Found: {len(tg_calls)} _tg() calls, {len(cyrillic_strings)} Cyrillic strings")

        except Exception as e:
            print(f"  Error processing {filename}: {e}")

    print(f"\nAnalyzed {analyzed_count} files\n")

    # Generate unique translations
    unique_translations = {}
    key_counter = defaultdict(int)

    # Process _tg() calls
    for call in all_tg_calls:
        ua_text = call['ua_text']
        if ua_text not in unique_translations:
            base_key = generate_camel_case_key(ua_text)
            # Ensure unique key
            key = base_key
            counter = key_counter[base_key]
            if counter > 0:
                key = f"{base_key}{counter}"
            key_counter[base_key] += 1

            unique_translations[ua_text] = {
                'key': key,
                'ua': ua_text,
                'ru': call['ru_text'],
                'source': 'tg_call'
            }

    # Process Cyrillic strings (assume they're Russian and need Ukrainian translation)
    for cyr_str in all_cyrillic_strings:
        text = cyr_str['text']
        if text not in unique_translations:
            base_key = generate_camel_case_key(text)
            # Ensure unique key
            key = base_key
            counter = key_counter[base_key]
            if counter > 0:
                key = f"{base_key}{counter}"
            key_counter[base_key] += 1

            unique_translations[text] = {
                'key': key,
                'ua': '',  # Needs manual translation
                'ru': text,
                'source': 'cyrillic_string',
                'needs_ua_translation': True
            }

    return {
        'tg_calls': all_tg_calls,
        'cyrillic_strings': all_cyrillic_strings,
        'file_stats': dict(file_stats),
        'unique_translations': unique_translations
    }

def save_results(results):
    """Save analysis results to JSON files."""
    # Save detailed analysis
    analysis_file = PROJECT_ROOT / "analysis-results.json"
    with open(analysis_file, 'w', encoding='utf-8') as f:
        json.dump({
            'tg_calls': results['tg_calls'],
            'cyrillic_strings': results['cyrillic_strings'],
            'file_stats': results['file_stats']
        }, f, ensure_ascii=False, indent=2)
    print(f"Saved detailed analysis to: {analysis_file}")

    # Save translations to add
    translations_file = PROJECT_ROOT / "translations-to-add.json"
    with open(translations_file, 'w', encoding='utf-8') as f:
        json.dump(results['unique_translations'], f, ensure_ascii=False, indent=2)
    print(f"Saved translations to add to: {translations_file}")

def print_summary(results):
    """Print summary of analysis results."""
    print("\n" + "="*80)
    print("ANALYSIS SUMMARY")
    print("="*80)

    total_tg = len(results['tg_calls'])
    total_cyrillic = len(results['cyrillic_strings'])
    total_unique = len(results['unique_translations'])

    print(f"\nTotal _tg() calls found: {total_tg}")
    print(f"Total Cyrillic strings found: {total_cyrillic}")
    print(f"Total unique translations needed: {total_unique}")

    # Calculate files with issues
    file_stats = results['file_stats']
    files_with_issues = {
        filename: stats['tg_calls'] + stats['cyrillic_strings']
        for filename, stats in file_stats.items()
        if stats['tg_calls'] > 0 or stats['cyrillic_strings'] > 0
    }

    if files_with_issues:
        print(f"\nTop 10 files with most issues:")
        sorted_files = sorted(files_with_issues.items(), key=lambda x: x[1], reverse=True)[:10]
        for i, (filename, count) in enumerate(sorted_files, 1):
            stats = file_stats[filename]
            print(f"  {i}. {filename}: {count} issues "
                  f"({stats['tg_calls']} _tg() calls, {stats['cyrillic_strings']} Cyrillic strings)")

    # Show breakdown of _tg() calls
    tg_with_window_t = sum(1 for call in results['tg_calls'] if call.get('is_using_window_t'))
    tg_without_window_t = total_tg - tg_with_window_t

    print(f"\n_tg() calls breakdown:")
    print(f"  Already using window.t(): {tg_with_window_t}")
    print(f"  Not using window.t(): {tg_without_window_t}")

    # Show sample translations needed
    if results['unique_translations']:
        print(f"\nSample translations (first 5):")
        for i, (text, trans) in enumerate(list(results['unique_translations'].items())[:5], 1):
            print(f"  {i}. {trans['key']}: {trans['ua'][:50]}..." if len(trans['ua']) > 50 else f"  {i}. {trans['key']}: {trans['ua']}")

    print("\n" + "="*80)

def main():
    """Main execution function."""
    print("TALKO Translation Analysis Tool")
    print("="*80 + "\n")

    results = analyze_js_files()

    if results:
        save_results(results)
        print_summary(results)
        print("\nAnalysis complete!")
    else:
        print("\nAnalysis failed!")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
