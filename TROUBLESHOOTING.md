# Troubleshooting Guide

Common issues and solutions for the translation management scripts.

## Installation Issues

### "Module not found: deep_translator"

**Problem:** The translation library is not installed.

**Solutions:**

1. **Install the library:**
   ```bash
   pip install deep-translator
   ```

2. **Or install from requirements.txt:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Continue without it (fallback mode):**
   - Script will work but mark translations as `[TODO: text]`
   - You'll need to manually translate these entries later

### "pip: command not found"

**Problem:** Python package manager is not in PATH.

**Solutions:**

1. **Use python -m pip:**
   ```bash
   python -m pip install deep-translator
   ```

2. **Or python3 on some systems:**
   ```bash
   python3 -m pip install deep-translator
   ```

## File Not Found Errors

### "File not found: translations-to-add.json"

**Problem:** The JSON file is missing or in the wrong location.

**Solution:**
- Ensure `translations-to-add.json` is in the same directory as the script
- Check the file name is exactly `translations-to-add.json` (case-sensitive on Linux/Mac)

**Expected structure:**
```
talko-task-manager/
├── add-translations.py
├── translations-to-add.json  ← Must be here
```

### "File not found: js/modules/01-translations-v2.js"

**Problem:** The JavaScript translations file is missing or in wrong location.

**Solution:**
- Ensure the file exists at `js/modules/01-translations-v2.js`
- Check the directory structure matches:

```
talko-task-manager/
├── add-translations.py
└── js/
    └── modules/
        └── 01-translations-v2.js  ← Must be here
```

## JSON Format Errors

### "Invalid JSON format"

**Problem:** The JSON file has syntax errors.

**Solutions:**

1. **Validate JSON online:**
   - Copy content to https://jsonlint.com/
   - Fix any syntax errors shown

2. **Common JSON errors:**
   - Missing commas between entries
   - Extra comma after last entry
   - Unescaped quotes in strings
   - Missing closing braces `}`

3. **Check for UTF-8 encoding:**
   - File must be saved as UTF-8
   - Some editors may save as different encoding

### "Skipping entry without key"

**Problem:** Some JSON entries are missing the `key` field.

**Solution:**
- Add the `key` field to each entry:
```json
{
  "Display Text": {
    "key": "keyName",    ← Required
    "ua": "Ukrainian text",
    "ru": "Russian text"
  }
}
```

## Language Block Errors

### "Could not find ua language block"

**Problem:** The script cannot locate the language block in the JS file.

**Solution:**

1. **Check the JS file structure:**
   ```javascript
   const translations = {
       ua: {    ← Must match this pattern
           // translations here
       }
   }
   ```

2. **Ensure proper formatting:**
   - Language name must be followed by `: {`
   - Proper indentation (spaces or tabs)

### "noComments key not found in ua block"

**Problem:** The insertion anchor point is missing.

**Solution:**

1. **Add noComments key to the language block:**
   ```javascript
   ua: {
       // ... other translations ...
       noComments: 'Ще немає коментарів',
       // ... more translations ...
   }
   ```

2. **Check spelling:**
   - Must be exactly `noComments` (camelCase)
   - Not `nocomments` or `no_comments`

## Translation Errors

### "Translation error for 'text' to en"

**Problem:** Translation API failed.

**Solutions:**

1. **Check internet connection:**
   - Translation requires internet access
   - Test: `ping google.com`

2. **API rate limiting:**
   - Too many requests in short time
   - Wait a few minutes and retry

3. **Use fallback mode:**
   - Script will mark as `[TODO: text]`
   - Manually translate these entries later

### Translations showing as "[TODO: ...]"

**Problem:** Automatic translation not available.

**Solutions:**

1. **Install deep-translator:**
   ```bash
   pip install deep-translator
   ```

2. **Or manually replace:**
   - Find all `[TODO: ...]` in the output
   - Replace with proper translations
   - Example:
     ```javascript
     key: '[TODO: Ukrainian text]',  // Before
     key: 'Proper translation',       // After
     ```

## Duplicate Key Errors

### "Key 'keyName' already exists - skipping"

**Problem:** The key is already in the JavaScript file.

**This is normal behavior - not an error!**

**What happens:**
- Script skips the duplicate
- Original translation is preserved
- No changes made for this key

**To override:**
1. Manually remove the old key from JS file
2. Run the script again
3. Or manually edit the translation in place

## JavaScript Syntax Errors

### "Unexpected token" in browser console

**Problem:** The updated JavaScript file has syntax errors.

**Solutions:**

1. **Validate JavaScript syntax:**
   ```bash
   node -c js/modules/01-translations-v2.js
   ```

2. **Common issues:**
   - Unescaped quotes: Check for `'` that should be `\'`
   - Missing commas: Each line should end with `,`
   - Mismatched braces: Count `{` and `}`

3. **Restore from backup:**
   ```bash
   copy "js\modules\01-translations-v2.js.backup" "js\modules\01-translations-v2.js"
   ```

4. **Check the problem area:**
   - Browser console shows line number
   - Look at that line and nearby lines
   - Check for proper escaping

### "Unterminated string literal"

**Problem:** Quote not properly escaped.

**Solution:**
- Find the problematic translation
- Ensure single quotes are escaped: `'` → `\'`
- Example:
  ```javascript
  // Wrong:
  key: 'Ім'я',

  // Correct:
  key: 'Ім\'я',
  ```

## Performance Issues

### Script is very slow

**Problem:** Many translations take time to process.

**Expected behavior:**
- ~1 translation per second with API
- 150 translations = 2-3 minutes
- This is normal

**To speed up:**
1. Pre-populate EN, DE, CS, PL in JSON
2. Script only generates missing translations
3. Or run in batches (split JSON file)

### Out of memory error

**Problem:** File too large to process.

**Solutions:**
1. Split JSON into smaller batches
2. Process 50-100 keys at a time
3. Increase Python memory limit

## Backup and Recovery

### "Lost my original file"

**Solution:**
1. **Check for backup:**
   ```bash
   dir "js\modules\01-translations-v2.js.backup"
   ```

2. **Restore it:**
   ```bash
   copy "js\modules\01-translations-v2.js.backup" "js\modules\01-translations-v2.js"
   ```

### "Backup file is corrupt"

**Prevention:**
- Always test on a copy first
- Keep version control (git)
- Make manual backups before running

**Recovery:**
- Check git history: `git log js/modules/01-translations-v2.js`
- Restore from git: `git checkout HEAD~1 js/modules/01-translations-v2.js`

## Character Encoding Issues

### "UnicodeDecodeError"

**Problem:** File encoding is not UTF-8.

**Solutions:**

1. **Re-save file as UTF-8:**
   - Open in text editor
   - Save As → Encoding: UTF-8

2. **Check BOM:**
   - Use UTF-8 without BOM
   - Some editors add BOM (Byte Order Mark)

### "Characters display as ??????"

**Problem:** Terminal/console doesn't support Unicode.

**Solutions:**

1. **Windows - Change code page:**
   ```bash
   chcp 65001
   ```

2. **Use Unicode-capable terminal:**
   - Windows Terminal
   - VS Code integrated terminal

## Script Stops Running

### Script hangs/freezes

**Problem:** Waiting for API response.

**Solutions:**
1. Wait - translation API can be slow
2. Check internet connection
3. Press Ctrl+C to cancel
4. Try again with fewer translations

### "KeyboardInterrupt" error

**Problem:** You pressed Ctrl+C.

**Solution:**
- This is normal if you cancelled
- No changes were made to the JS file
- Safe to run again

## Other Issues

### "Permission denied"

**Problem:** File is read-only or in use.

**Solutions:**
1. Close file in editors
2. Check file properties → remove Read-only
3. Run with administrator privileges (if needed)

### Changes not showing in application

**Problem:** Browser cache or old file loaded.

**Solutions:**
1. Hard refresh browser: Ctrl+F5
2. Clear cache
3. Restart development server
4. Check file was actually updated:
   ```bash
   dir "js\modules\01-translations-v2.js"
   ```
   Look at modified date/time

## Getting More Help

### Enable verbose output

**Modify the script** to add debug prints:
```python
# Add after imports:
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check the summary

The script provides detailed summary:
- Statistics
- Warnings
- Errors

Read carefully for clues.

### Validate each step

```bash
# Step 1: Validate
python validate-translations-json.py

# Step 2: Preview
python preview-translations.py

# Step 3: Run
python add-translations.py
```

### Manual inspection

1. Open both files side-by-side:
   - `translations-to-add.json`
   - `js/modules/01-translations-v2.js`

2. Manually verify:
   - Keys match
   - Translations are correct
   - Syntax is valid

## Still Having Issues?

Create a minimal test case:

1. **Create minimal JSON:**
   ```json
   {
     "Test": {
       "key": "test",
       "ua": "Тест",
       "ru": "Тест"
     }
   }
   ```

2. **Run on small dataset:**
   - If this works, the issue is with your data
   - If this fails, the issue is with setup

3. **Check Python version:**
   ```bash
   python --version
   ```
   Should be 3.6 or higher

4. **Reinstall dependencies:**
   ```bash
   pip uninstall deep-translator
   pip install deep-translator
   ```
