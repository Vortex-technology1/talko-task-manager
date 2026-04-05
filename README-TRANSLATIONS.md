# Translation Management System

Complete automated system for managing translations in Talko Task Manager.

## 📋 Overview

This system automates the process of adding translations from JSON files into the JavaScript translations file across all 6 supported languages (UA, EN, DE, CS, RU, PL).

## 🚀 Quick Start

```bash
# 1. Install dependencies (optional but recommended)
pip install -r requirements.txt

# 2. Preview what will happen
python preview-translations.py

# 3. Add the translations
python add-translations.py
```

## 📁 Files Included

### Scripts (3 files)
- **add-translations.py** - Main script that adds translations
- **validate-translations-json.py** - Validates JSON structure
- **preview-translations.py** - Preview changes without modifying files

### Documentation (6 files)
- **README-TRANSLATIONS.md** - This file (overview)
- **QUICK-START.md** - Quick reference guide
- **add-translations-README.md** - Complete documentation
- **EXAMPLE-OUTPUT.md** - Output format examples
- **TROUBLESHOOTING.md** - Common issues and solutions
- **FILES-CREATED.md** - Summary of all created files

### Configuration (1 file)
- **requirements.txt** - Python dependencies

## ✨ Features

✅ **Automatic Translation Generation**
- Generates EN, DE, CS, PL from Ukrainian text
- Uses Google Translate API
- Preserves special characters and formatting

✅ **Smart Processing**
- Finds language blocks using regex (position-independent)
- Inserts after "noComments" key
- Prevents duplicate keys
- Handles empty Ukrainian fields (uses Russian as fallback)

✅ **Safety**
- Automatic backup before changes
- Non-destructive (duplicates skipped, not overwritten)
- Proper quote escaping
- JavaScript syntax validation

✅ **Detailed Reporting**
- Shows exactly what was added
- Lists warnings and errors
- Statistics summary

## 📊 What It Does

```
translations-to-add.json  →  [Script Processing]  →  01-translations-v2.js
(150 entries)                                         (6 language blocks updated)

Input Format:                      Output Format:
{                                  ua: {
  "Text": {                          noComments: 'No comments yet',
    "key": "keyName",    →           keyName: 'Ukrainian text',
    "ua": "Text",                    ...
    "ru": "Текст"                  }
  }                                en: {
}                                    noComments: 'No comments yet',
                                     keyName: 'English text',
                                     ...
                                   }
                                   ... (4 more language blocks)
```

## 🎯 Use Cases

### 1. Adding New Translations
```bash
python add-translations.py
```

### 2. Validating Before Adding
```bash
python validate-translations-json.py
```

### 3. Previewing Changes
```bash
python preview-translations.py
```

### 4. Batch Processing
Process large JSON files in one go - script handles all languages automatically.

## 📝 Input Format (translations-to-add.json)

```json
{
  "Display Text": {
    "key": "javascriptKeyName",     // Required: camelCase key name
    "ua": "Ukrainian text",          // Required: Ukrainian translation
    "ru": "Russian text",            // Required: Russian translation
    "source": "tg_call"              // Optional: tracking field
  }
}
```

**Auto-generated fields:**
- `en` - English (if not provided)
- `de` - German (if not provided)
- `cs` - Czech (if not provided)
- `pl` - Polish (if not provided)

## 📤 Output Format (01-translations-v2.js)

```javascript
const translations = {
    ua: {
        // ... existing translations ...
        noComments: 'Ще немає коментарів',
        // NEW TRANSLATIONS INSERTED HERE ↓
        keyName: 'Ukrainian text',
        anotherKey: 'Another Ukrainian text',
        // ... rest of translations ...
    },
    en: {
        // ... existing translations ...
        noComments: 'No comments yet',
        // NEW TRANSLATIONS INSERTED HERE ↓
        keyName: 'English text',
        anotherKey: 'Another English text',
        // ... rest of translations ...
    },
    // ... 4 more language blocks (de, cs, ru, pl) ...
}
```

## 🔍 How It Works

1. **Load JSON** - Parse `translations-to-add.json`
2. **Extract Keys** - Get unique keys, remove duplicates
3. **Generate Translations** - Create EN, DE, CS, PL from UA text
4. **Find Language Blocks** - Use regex to locate each language section
5. **Find Insertion Point** - Locate "noComments" key in each block
6. **Check Duplicates** - Skip keys that already exist
7. **Insert Translations** - Add new keys after "noComments"
8. **Save File** - Create backup and save updated file
9. **Report** - Show summary of changes

## 🛡️ Safety Features

- ✅ Automatic `.backup` file created
- ✅ Duplicate keys are skipped, not overwritten
- ✅ Proper escaping of quotes and special characters
- ✅ JavaScript syntax preservation
- ✅ No data loss - original file backed up
- ✅ Rollback available (restore from backup)

## 📈 Performance

**Typical processing time:**
- 50 translations: ~1 minute
- 100 translations: ~2 minutes
- 150 translations: ~3 minutes

**File size impact:**
- Each translation adds ~6 lines (one per language)
- 150 translations ≈ 900 new lines
- File size increase: ~50-100 KB

## ⚙️ Requirements

**Required:**
- Python 3.6 or higher
- UTF-8 encoded files

**Optional (for auto-translation):**
- `deep-translator` library
- Internet connection

**Without deep-translator:**
- Script still works
- Translations marked as `[TODO: text]`
- Manual translation required

## 📚 Documentation Reference

| Need to... | Read this file |
|------------|----------------|
| Get started quickly | QUICK-START.md |
| Understand everything | add-translations-README.md |
| See output examples | EXAMPLE-OUTPUT.md |
| Fix problems | TROUBLESHOOTING.md |
| See what was created | FILES-CREATED.md |
| Overview (you are here) | README-TRANSLATIONS.md |

## 🔧 Common Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Validate JSON
python validate-translations-json.py

# Preview changes (no files modified)
python preview-translations.py

# Add translations (modifies files)
python add-translations.py

# Restore from backup (Windows)
copy "js\modules\01-translations-v2.js.backup" "js\modules\01-translations-v2.js"

# Restore from backup (Linux/Mac)
cp js/modules/01-translations-v2.js.backup js/modules/01-translations-v2.js
```

## ⚠️ Important Notes

1. **Backup Created Automatically**
   - File: `01-translations-v2.js.backup`
   - Created before any changes
   - Don't delete until you verify changes work

2. **Duplicates Are Skipped**
   - Not an error
   - Original translation preserved
   - See warnings in output

3. **Translation Quality**
   - Auto-generated translations use Google Translate
   - Review for context-specific terms
   - Manual correction may be needed

4. **Character Escaping**
   - Single quotes automatically escaped: `'` → `\'`
   - Emojis and special characters preserved
   - No manual escaping needed

5. **Internet Required**
   - Only for auto-translation
   - Script works offline (with `[TODO]` markers)

## 🎓 Example Workflow

```bash
# Day 1: Prepare translations
# - Edit translations-to-add.json
# - Add all new keys with UA and RU translations

# Day 2: Validate and preview
python validate-translations-json.py
# - Check output for any warnings
# - Fix any issues in JSON

python preview-translations.py
# - See what will be added
# - Verify counts look correct

# Day 3: Apply changes
python add-translations.py
# - Wait for processing (2-3 minutes)
# - Review summary output
# - Check for any errors

# Day 4: Test
# - Open application
# - Switch between languages
# - Verify all translations display correctly
# - Check browser console for JavaScript errors

# Day 5: Review and refine
# - Look for [TODO] markers
# - Manually improve auto-generated translations
# - Test again
```

## 🆘 Getting Help

1. **Check the output** - Script provides detailed error messages
2. **Read TROUBLESHOOTING.md** - Common issues and solutions
3. **Validate step-by-step** - Use validation and preview scripts
4. **Check the backup** - Restore if something goes wrong
5. **Review examples** - See EXAMPLE-OUTPUT.md

## 📊 Success Indicators

After running the script, you should see:

```
✨ Translation update completed successfully!

📊 Statistics:
  Total unique keys in JSON: 150
  New keys added: 45
  Skipped duplicates: 105

✅ Updated language blocks: ua, en, de, cs, ru, pl
```

If you see this, the update was successful!

## 🔄 Updates and Maintenance

**To add more translations later:**
1. Add new entries to `translations-to-add.json`
2. Run the script again
3. Only new keys will be added (duplicates skipped)

**To update existing translations:**
1. Manually edit `01-translations-v2.js`
2. Or remove the key and run script again

**To translate to more languages:**
1. Modify the script's `lang_map` dictionary
2. Add new language blocks to JS file
3. Update regex patterns if needed

## 📄 License

This script is part of the Talko Task Manager project.

## 🙏 Support

For issues, questions, or improvements:
1. Check the documentation files
2. Review the troubleshooting guide
3. Validate your input data
4. Test with a small dataset first

---

**Version:** 1.0
**Last Updated:** 2026-04-05
**Python Version:** 3.6+
**File Encoding:** UTF-8
