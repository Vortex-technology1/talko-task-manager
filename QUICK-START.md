# Quick Start Guide

## Installation

```bash
# 1. Install Python dependencies (optional but recommended)
pip install -r requirements.txt

# Alternative: install manually
pip install deep-translator
```

## Usage

### Step 1: Validate Your JSON (Optional)

```bash
python validate-translations-json.py
```

This will show you:
- Total entries in your JSON
- Missing fields
- Duplicate keys
- Statistics

### Step 2: Preview Changes (Optional but Recommended)

```bash
python preview-translations.py
```

This will show you:
- How many keys will be added
- Which keys already exist (will be skipped)
- Sample of new translations

**No files are modified in preview mode!**

### Step 3: Run the Translation Script

```bash
python add-translations.py
```

This will:
1. Load translations from `translations-to-add.json`
2. Generate EN, DE, CS, PL translations from Ukrainian text
3. Update `js/modules/01-translations-v2.js`
4. Create a backup file (`.backup`)
5. Show a detailed summary

### Step 4: Review the Results

Check the output for:
- ✅ Number of keys added
- ⚠️ Any warnings
- ❌ Any errors

### Step 5: Test Your Changes

1. Open your application
2. Check that all languages display correctly
3. Look for any `[TODO: ...]` markers that need manual translation
4. Verify JavaScript console shows no errors

## Common Commands

```bash
# Validate JSON before processing
python validate-translations-json.py

# Preview what will be changed (no files modified)
python preview-translations.py

# Run the translation update
python add-translations.py

# Restore from backup if needed
copy "js\modules\01-translations-v2.js.backup" "js\modules\01-translations-v2.js"
```

## Example Workflow

```bash
# 1. Validate your translations
python validate-translations-json.py

# 2. Preview the changes (recommended)
python preview-translations.py

# 3. If preview looks good, run the update
python add-translations.py

# 4. Review the output
# Look for "✨ Translation update completed successfully!"

# 5. Test in your application
# Open the app and check all language switches

# 6. If something went wrong, restore from backup
# copy "js\modules\01-translations-v2.js.backup" "js\modules\01-translations-v2.js"
```

## File Structure

```
talko-task-manager/
├── translations-to-add.json               # Input: Your translations
├── add-translations.py                    # Main script
├── validate-translations-json.py          # Validation helper
├── requirements.txt                       # Python dependencies
├── QUICK-START.md                        # This file
├── add-translations-README.md            # Full documentation
└── js/
    └── modules/
        ├── 01-translations-v2.js         # Will be updated
        └── 01-translations-v2.js.backup  # Auto-created backup
```

## Troubleshooting

### "Module not found: deep_translator"
```bash
pip install deep-translator
```

### "File not found: translations-to-add.json"
Make sure the JSON file is in the same directory as the script.

### "Language block not found"
Check that `01-translations-v2.js` exists at `js/modules/01-translations-v2.js`

### Translations show as "[TODO: ...]"
Install `deep-translator` or manually translate these entries.

## What Gets Updated?

The script updates ALL 6 language blocks in `01-translations-v2.js`:
- ✓ `ua` - Ukrainian (from JSON)
- ✓ `en` - English (auto-generated)
- ✓ `de` - German (auto-generated)
- ✓ `cs` - Czech (auto-generated)
- ✓ `ru` - Russian (from JSON)
- ✓ `pl` - Polish (auto-generated)

Each new key is inserted after the `noComments` line in each block.

## Safety Features

- ✅ Automatic backup before changes
- ✅ Duplicate key detection
- ✅ Proper quote escaping
- ✅ Syntax validation
- ✅ Detailed error reporting

## Need Help?

See the full documentation in `add-translations-README.md`
