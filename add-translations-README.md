# Translation Management Script

## Overview

`add-translations.py` is a Python script that automates the process of adding new translations to the Talko Task Manager system. It reads translations from `translations-to-add.json` and inserts them into the `01-translations-v2.js` file across all 6 language blocks (UA, EN, DE, CS, RU, PL).

## Features

- ✅ Loads unique translations from JSON file
- ✅ Auto-generates EN, DE, CS, PL translations from Ukrainian text
- ✅ Uses regex patterns to find language blocks (position-independent)
- ✅ Finds and inserts after "noComments" key in each language block
- ✅ Prevents duplicate keys
- ✅ Properly escapes quotes and special characters
- ✅ Maintains JavaScript syntax validity
- ✅ Creates automatic backup before modifying
- ✅ Provides detailed summary report

## Prerequisites

### Required
- Python 3.6 or higher

### Optional (for automatic translation)
- `deep-translator` library

Install with:
```bash
pip install deep-translator
```

**Note:** If `deep-translator` is not installed, the script will still work but will mark translations as `[TODO: text]` for manual translation.

## File Structure

```
talko-task-manager/
├── translations-to-add.json          # Input: translations to add
├── add-translations.py               # The script
├── js/
│   └── modules/
│       └── 01-translations-v2.js     # Output: updated translations file
```

## Input Format (translations-to-add.json)

```json
{
  "Display Text": {
    "key": "javascriptKeyName",
    "ua": "Ukrainian text",
    "ru": "Russian text",
    "source": "tg_call"
  },
  ...
}
```

**Required fields:**
- `key`: The JavaScript variable name (camelCase)
- `ua`: Ukrainian translation
- `ru`: Russian translation

**Auto-generated fields:**
- `en`: English translation (generated from UA)
- `de`: German translation (generated from UA)
- `cs`: Czech translation (generated from UA)
- `pl`: Polish translation (generated from UA)

## Usage

### Basic Usage

```bash
python add-translations.py
```

### What the Script Does

1. **Loads JSON**: Reads `translations-to-add.json`
2. **Extracts Unique Keys**: Removes duplicates based on key name
3. **Generates Translations**: Creates EN, DE, CS, PL from Ukrainian text
4. **Finds Language Blocks**: Uses regex to locate each language section
5. **Locates Insertion Point**: Finds "noComments" key in each block
6. **Checks for Duplicates**: Skips keys that already exist
7. **Inserts Translations**: Adds new keys after "noComments"
8. **Saves File**: Creates backup and saves updated file
9. **Generates Report**: Shows statistics and any errors/warnings

## Output Example

```
🚀 Starting translation update process...

✓ Loaded 150 translations from JSON
✓ Loaded JavaScript file: C:\...\01-translations-v2.js
✓ Extracted 150 unique translation keys

🌐 Generating missing translations...
  тижневийКалендар [en]: Weekly calendar
  тижневийКалендар [de]: Wochenkalender
  тижневийКалендар [cs]: Týdenní kalendář
  тижневийКалендар [pl]: Kalendarz tygodniowy
  ...
✓ Generated translations for all languages

📝 Updating language blocks...
  ✓ Added 45 keys to ua block
  ✓ Added 45 keys to en block
  ✓ Added 45 keys to de block
  ✓ Added 45 keys to cs block
  ✓ Added 45 keys to ru block
  ✓ Added 45 keys to pl block

✓ Created backup: C:\...\01-translations-v2.js.backup
✓ Saved updated file: C:\...\01-translations-v2.js

======================================================================
📊 TRANSLATION UPDATE SUMMARY
======================================================================

📈 Statistics:
  Total unique keys in JSON: 150
  New keys added: 45
  Skipped duplicates: 105

✅ Updated language blocks: ua, en, de, cs, ru, pl

======================================================================

✨ Translation update completed successfully!
```

## How It Works

### 1. Finding Language Blocks

The script uses regex patterns to find each language block:

```python
pattern = r'^\s+{lang}\s*:\s*\{'
```

This matches patterns like:
- `    ua: {`
- `    en: {`
- etc.

### 2. Finding Insertion Point

Searches for the `noComments` key in each block:

```python
pattern = r"^\s*noComments\s*:\s*'[^']*',?\s*$"
```

New translations are inserted immediately after this line.

### 3. Escaping Special Characters

All translations are properly escaped:
- Single quotes: `'` → `\'`
- Backslashes: `\` → `\\`
- Newlines: `\n` → `\\n`

### 4. Format Preservation

Each new line follows the format:
```javascript
keyName: 'translation text',
```

Indentation is matched to the surrounding code.

## Error Handling

The script handles various error cases:

- **Missing files**: Clear error message with file path
- **Invalid JSON**: Shows JSON parsing error
- **Translation API errors**: Falls back to `[TODO]` markers
- **Missing noComments**: Warning with language block name
- **Duplicate keys**: Automatically skipped with warning

## Backup and Safety

- **Automatic backup**: Creates `.backup` file before any changes
- **Duplicate prevention**: Checks existing keys before adding
- **Syntax validation**: Ensures proper JavaScript formatting
- **Non-destructive**: Original file preserved in backup

## Troubleshooting

### "deep_translator not installed"
```bash
pip install deep-translator
```
Or continue without it (manual translation required).

### "Language block not found"
Check that `01-translations-v2.js` has the standard structure with language blocks named `ua`, `en`, `de`, `cs`, `ru`, `pl`.

### "noComments key not found"
Ensure each language block has a `noComments` key. This is used as the insertion anchor point.

### Translations showing as "[TODO: ...]"
Install `deep-translator` or manually replace these markers with proper translations.

## Advanced Usage

### Custom Paths

Edit the script to use different file paths:

```python
json_path = '/custom/path/translations.json'
js_path = '/custom/path/translations.js'
```

### Translation Language Codes

The script uses these Google Translate language codes:
- `uk` - Ukrainian (source)
- `en` - English
- `de` - German
- `cs` - Czech
- `pl` - Polish

## Limitations

- Requires `noComments` key as insertion anchor
- Automatic translation quality depends on Google Translate
- Large files may take time to process
- Internet connection required for auto-translation

## Best Practices

1. **Review translations**: Always review auto-generated translations
2. **Test after update**: Verify JavaScript file loads without errors
3. **Keep backups**: Don't delete `.backup` files immediately
4. **Batch processing**: Add multiple translations in one run
5. **Manual review**: Check for context-specific translations

## Exit Codes

- `0`: Success
- `1`: Failure (check error messages)

## Support

For issues or questions, check:
1. Error messages in the output
2. The `.backup` file for rollback
3. JavaScript console for syntax errors
