# _tg() to window.t() Replacement Summary

## Overview

Successfully replaced **1,050** `_tg()` calls with `window.t()` calls across **12 JavaScript files**.

## Results by File

| File | Before | After | Replaced |
|------|--------|-------|----------|
| 100-booking.js | 32 | 1 | 31 |
| 104-sales.js | 137 | 7 | 130 |
| 105-food-production.js | 94 | 5 | 89 |
| 77-crm.js | 185 | 15 | 170 |
| 77h-crm-beauty.js | 16 | 0 | 16 |
| 77i-crm-niches.js | 12 | 0 | 12 |
| 81-bots-flows.js | 9 | 0 | 9 |
| 83-bots-contacts.js | 164 | 5 | 159 |
| 84-event-bus.js | 17 | 0 | 17 |
| 85-estimate.js | 130 | 12 | 118 |
| 96-integrations.js | 104 | 3 | 101 |
| 98-finance.js | 205 | 7 | 198 |
| **TOTAL** | **1,105** | **55** | **1,050** |

## Statistics

- **Files processed**: 12
- **Files modified**: 12 (100%)
- **Total replacements**: 1,050
- **Success rate**: 95% (1,050 out of 1,105)
- **Remaining _tg() calls**: 55

## Remaining _tg() Calls

55 `_tg()` calls were not replaced. These fall into the following categories:

### 1. Double Quotes (instead of single quotes)
Example:
```javascript
${_tg("Обов'язковий",'Обязательный')}
${_tg("Ім'я *","Имя *")}
```
These use double quotes because the Ukrainian text contains apostrophes.

### 2. Template Variables (${...})
Example:
```javascript
toast(_tg(`✓ Виробництво завершено. Зі складу списано інгредієнти для ${plan.portions} порц.`,
          `✓ Производство завершено. Со склада списаны ингредиенты для ${plan.portions} порц.`));
```
These contain dynamic variables that need special handling.

### 3. Ternary Operators
Example:
```javascript
_tg(order ? 'Редагувати рахунок' : 'Новий рахунок',
    order ? 'Редактировать счет' : 'Новый счет')
```
These have conditional logic inside the _tg() call.

### 4. Function Definition
```javascript
function _tg(ua,ru){return window.currentLang==='ru'?ru:ua;}
```
The actual _tg() function definition (1 occurrence).

## Replacement Examples

### Simple Replacements
```javascript
// Before:
_tg('Тижневий календар','Недельный календарь')

// After:
window.t('тижневийКалендар')
```

### With Special Characters
```javascript
// Before:
_tg('Запис завершено ✓','Запись завершена ✓')

// After:
window.t('записЗавершено')
```

## Backup Files

All modified files have backups with `.backup` extension:
- 100-booking.js.backup
- 104-sales.js.backup
- 105-food-production.js.backup
- 77-crm.js.backup
- 77h-crm-beauty.js.backup
- 77i-crm-niches.js.backup
- 81-bots-flows.js.backup
- 83-bots-contacts.js.backup
- 84-event-bus.js.backup
- 85-estimate.js.backup
- 96-integrations.js.backup
- 98-finance.js.backup

## Next Steps

### Recommended Actions:

1. **Review Changes**: Compare modified files with their backups to verify correctness
2. **Test Application**: Run the application to ensure all translations work correctly
3. **Handle Remaining Calls**: Manually review the 55 remaining `_tg()` calls:
   - Convert double-quoted strings to use single quotes where possible
   - For template variables, create separate translation keys or use interpolation
   - For ternary operators, consider splitting into separate translation keys
4. **Delete Backups**: Once satisfied, delete the `.backup` files

### Commands to Help:

```bash
# Find all remaining _tg() calls (excluding function definition)
grep -n "_tg(" js/modules/*.js | grep -v "function _tg"

# Find _tg() with template variables
grep -n "_tg(\\\`" js/modules/*.js

# Find _tg() with double quotes
grep -n '_tg("' js/modules/*.js

# Delete backups after verification
rm js/modules/*.backup
```

## Script Information

- **Script**: `replace-tg-calls.py`
- **Verification**: `verify-replacements.py`
- **Translation mapping**: `translations-to-add.json`
- **Analysis data**: `analysis-results.json`
