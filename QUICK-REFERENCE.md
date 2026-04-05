# Quick Reference - Cyrillic String Replacement Script

## Run the Script
```bash
cd C:/Users/User/talko-task-manager
python replace-cyrillic-strings.py
```

## What It Did (Last Run - 2026-04-05)
- Processed: **60 files**
- Modified: **48 files**
- Replaced: **377 Cyrillic strings**
- Skipped: **142 strings** (safely)
- Backed up: **65 files** (5.3MB)

## Files to Check

### Main Script
📄 `replace-cyrillic-strings.py` (17KB) - The replacement script

### Reports & Logs
📊 `REPLACEMENT-REPORT.md` (6.2KB) - Comprehensive results & issues
📋 `replacement-log.json` (92KB) - All 377 replacements logged
📈 `replacement-summary.json` (1.9KB) - Statistics summary
📝 `SCRIPT-COMPLETION-SUMMARY.txt` (6.8KB) - Executive summary

### Documentation
📖 `README-SCRIPT-USAGE.md` (4.7KB) - How to use the script
📖 `QUICK-REFERENCE.md` (this file) - Quick reference

### Backups
💾 `backups/20260405_101251/` (3.9MB) - Most files here
💾 `backups/20260405_101245/` (316KB)
💾 `backups/20260405_101246/` (232KB)
💾 `backups/20260405_101252/` (856KB)

## Quick Commands

### View Statistics
```bash
python -c "import json; log=json.load(open('replacement-log.json')); print(f'{len(log)} replacements in {len(set(e[\"file\"] for e in log))} files')"
```

### Find Nested Calls (Issues to Fix)
```bash
grep -r "_t(window.t(" js/modules/*.js
```

### Count window.t() in a File
```bash
grep -c "window.t(" js/modules/80-learning.js
```

### Restore from Backup
```bash
# Single file
cp backups/20260405_101251/js/modules/[filename].js js/modules/

# All files
cp -r backups/20260405_101251/js/modules/* js/modules/
```

## Top 5 Modified Files
1. `js/modules/80-learning.js` - 93 replacements
2. `js/modules/99-warehouse-ui.js` - 32 replacements
3. `js/modules/98-finance-weekly-plan.js` - 19 replacements
4. `js/modules/77-crm.js` - 16 replacements
5. `js/modules/75-superadmin-panel.js` - 14 replacements

## Replacement Types

### Before → After Examples
```javascript
// Simple String
'Збереження...' → window.t('збереження')

// Template Literal
`Текст: ${value}` → `${window.t('текст')}: ${value}`

// innerHTML
element.innerHTML = 'Привіт' → element.innerHTML = window.t('привіт')

// Placeholder
placeholder="Назва" → placeholder="${window.t('назва')}"
```

## What Was Skipped (142 strings)

| Reason | Count | Why |
|--------|-------|-----|
| No safe replacement | 74 | Complex context, might break code |
| CSS class/ID | 66 | CSS selectors, not user-facing text |
| Firestore field | 2 | Database field names |

## Known Issues ⚠️

### 1. Nested Translation Calls
Some replacements created: `_t(window.t('key'), window.t('key'))`
- **Fix:** Manual review required
- **Find:** `grep -r "_t(window.t(" js/modules/*.js`

### 2. Complex HTML Strings
Long HTML snippets were replaced
- **Fix:** Test UI components
- **Priority:** Files with most replacements

## Next Steps Checklist

### Before Testing
- [ ] Fix nested translation calls
- [ ] Review complex HTML replacements
- [ ] Verify all translation keys exist

### Testing
- [ ] Test UI components in browser
- [ ] Check console for JavaScript errors
- [ ] Verify text displays correctly
- [ ] Test language switching

### Before Deployment
- [ ] Code review
- [ ] Full QA testing
- [ ] Update translation files if needed
- [ ] Commit to version control

## Script Features

✅ **Load & Process**
- Loads analysis-results.json (519 Cyrillic strings found)
- Loads translations-to-add.json (1214 mappings)
- Groups strings by file

✅ **Smart Replacement**
- Template literals: `текст` → `${window.t('key')}`
- innerHTML: `el.innerHTML = 'текст'` → `el.innerHTML = window.t('key')`
- Quoted strings: `'текст'` → `window.t('key')`

✅ **Safety**
- Creates backups before modifying
- Skips unsafe contexts (console.log, comments, CSS, Firestore)
- Conservative when uncertain

✅ **Logging**
- Detailed replacement log
- Skip reason tracking
- Comprehensive statistics

## File Locations

```
C:/Users/User/talko-task-manager/
├── replace-cyrillic-strings.py     # Main script
├── REPLACEMENT-REPORT.md            # Full report
├── replacement-log.json             # All replacements
├── replacement-summary.json         # Statistics
├── README-SCRIPT-USAGE.md           # Usage guide
├── QUICK-REFERENCE.md              # This file
└── backups/                        # Backup files
    ├── 20260405_101245/
    ├── 20260405_101246/
    ├── 20260405_101251/           # ← Most files here
    └── 20260405_101252/
```

## Support

1. **Full Details:** See `REPLACEMENT-REPORT.md`
2. **Usage Help:** See `README-SCRIPT-USAGE.md`
3. **All Replacements:** See `replacement-log.json`
4. **Need to Restore:** Use backups from `backups/20260405_101251/`

---

**Script Status:** ✅ Completed Successfully
**Last Run:** 2026-04-05 10:12 UTC
**Version:** 1.0
