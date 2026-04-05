# Cyrillic String Replacement Script - Usage Guide

## Quick Start

```bash
cd C:/Users/User/talko-task-manager
python replace-cyrillic-strings.py
```

## What the Script Does

The script automatically:
1. Loads `analysis-results.json` to find all hardcoded Cyrillic strings
2. Loads `translations-to-add.json` to map strings to translation keys
3. Processes each JS file and replaces Cyrillic text with `window.t('key')` calls
4. Creates backups before modifying any files
5. Generates detailed logs and reports

## Files Required

- `analysis-results.json` - Analysis of Cyrillic strings in codebase
- `translations-to-add.json` - Mapping of Cyrillic text to translation keys

## Output Files

After running, you'll get:

1. **replacement-log.json** - Detailed log of every replacement made
   - File path, line number, original text, translation key, context
   - Use this for verification and debugging

2. **replacement-summary.json** - Summary statistics
   - Files processed/modified, replacements made, skip reasons
   - Top modified files

3. **backups/[timestamp]/** - Backup copies of modified files
   - Full directory structure preserved
   - Can restore original files if needed

4. **new-translation-keys.json** - New translation keys (if any)
   - Keys that need to be added to translation files
   - Generated when no existing translation found

## Replacement Examples

### Template Literals
```javascript
// Before
`Текст: ${value}`

// After
`${window.t('текст')}: ${value}`
```

### innerHTML Assignments
```javascript
// Before
element.innerHTML = 'Привіт'

// After
element.innerHTML = window.t('привіт')
```

### Quoted Strings
```javascript
// Before
const text = 'Назва товару'

// After
const text = window.t('назваТовару')
```

## What Gets Skipped

The script automatically skips:
- ✓ Strings already using `window.t()` or `_t()`
- ✓ Console.log statements
- ✓ Comments (// and /* */)
- ✓ CSS class names and IDs
- ✓ Firestore collection/field names
- ✓ Complex contexts that might break code

## Safety Features

### 1. Automatic Backups
Every modified file is backed up to `backups/[timestamp]/` before changes are made.

### 2. Conservative Approach
When in doubt, the script skips the replacement and logs the reason.

### 3. Detailed Logging
Every action is logged with context for review.

## Restoring from Backup

If you need to restore original files:

```bash
# Restore a specific file
cp backups/20260405_101251/js/modules/[filename].js js/modules/[filename].js

# Restore all files from a backup
cp -r backups/20260405_101251/js/modules/* js/modules/
```

## Verifying Results

### Check total replacements
```bash
python -c "import json; log=json.load(open('replacement-log.json')); print(f'{len(log)} replacements made')"
```

### Check specific file
```bash
grep -n "window.t(" js/modules/[filename].js
```

### Count modified files
```bash
python -c "import json; log=json.load(open('replacement-log.json')); files=set(e['file'] for e in log); print(f'{len(files)} files modified')"
```

## Troubleshooting

### Issue: Nested translation calls
**Problem:** `_t(window.t('key'), window.t('key'))`
**Solution:** Script should have skipped these. Review manually and fix.

### Issue: Broken JavaScript syntax
**Problem:** Replacement broke the code
**Solution:** Restore from backup, review the specific replacement

### Issue: Missing translation keys
**Problem:** Keys used don't exist in translation files
**Solution:** Check `new-translation-keys.json` and add them to translation files

## Script Configuration

The script is located at:
```
C:/Users/User/talko-task-manager/replace-cyrillic-strings.py
```

It automatically uses the current directory as the project root.

## Statistics from Last Run

- **Files Processed:** 60
- **Files Modified:** 48
- **Strings Replaced:** 377
- **Strings Skipped:** 142
- **Backup Files:** 65 (across 4 timestamp directories)

## Next Steps After Running

1. Review `REPLACEMENT-REPORT.md` for full details
2. Check `replacement-log.json` for all replacements
3. Test modified files in development environment
4. Fix any nested translation calls
5. Verify UI components render correctly
6. Add any new translation keys to translation files
7. Commit changes to version control

## Support

For issues or questions:
1. Check `REPLACEMENT-REPORT.md` for known issues
2. Review `replacement-log.json` for specific replacements
3. Restore from backups if needed
4. Manually review and fix problematic replacements

---

**Script Version:** 1.0
**Last Updated:** 2026-04-05
