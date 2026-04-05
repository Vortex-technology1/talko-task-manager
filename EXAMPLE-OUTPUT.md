# Example Output Format

## What Gets Added to 01-translations-v2.js

The script finds the `noComments` line in each language block and inserts new translations immediately after it.

### Before (Original)

```javascript
ua: {
    // ... other translations ...
    noComments: 'Ще немає коментарів',
    unknown: 'Невідомий',
    justNow: 'щойно',
    // ... more translations ...
}
```

### After (With New Translations Added)

```javascript
ua: {
    // ... other translations ...
    noComments: 'Ще немає коментарів',
    тижневийКалендар: 'Тижневий календар',
    тиждень: 'Тиждень',
    пн: 'Пн',
    вт: 'Вт',
    ср: 'Ср',
    чт: 'Чт',
    пт: 'Пт',
    сб: 'Сб',
    нд: 'Нд',
    текст: 'Текст',
    unknown: 'Невідомий',
    justNow: 'щойно',
    // ... more translations ...
}
```

## Full Example Across All Languages

### Ukrainian (ua)
```javascript
ua: {
    noComments: 'Ще немає коментарів',
    тижневийКалендар: 'Тижневий календар',
    показуватиТелефон: 'Показувати телефон',
    завантаження: 'Завантаження...',
}
```

### English (en) - Auto-generated
```javascript
en: {
    noComments: 'There are no comments yet',
    тижневийКалендар: 'Weekly calendar',
    показуватиТелефон: 'Show phone',
    завантаження: 'Loading...',
}
```

### German (de) - Auto-generated
```javascript
de: {
    noComments: 'Es liegen noch keine Kommentare vor',
    тижневийКалендар: 'Wochenkalender',
    показуватиТелефон: 'Telefon anzeigen',
    завантаження: 'Wird geladen...',
}
```

### Czech (cs) - Auto-generated
```javascript
cs: {
    noComments: 'Zatím zde nejsou žádné komentáře',
    тижневийКалендар: 'Týdenní kalendář',
    показуватиТелефон: 'Zobrazit telefon',
    завантаження: 'Načítání...',
}
```

### Russian (ru) - From JSON
```javascript
ru: {
    noComments: 'Комментариев еще нет',
    тижневийКалендар: 'Недельный календарь',
    показуватиТелефон: 'Показывать телефон',
    завантаження: 'Загрузка...',
}
```

### Polish (pl) - Auto-generated
```javascript
pl: {
    noComments: 'Nie ma jeszcze żadnych komentarzy',
    тижневийКалендар: 'Kalendarz tygodniowy',
    показуватиТелефон: 'Pokaż telefon',
    завантаження: 'Ładowanie...',
}
```

## Special Character Handling

### Quotes Escaping

**Input JSON:**
```json
{
  "Ім'я": {
    "key": "імя",
    "ua": "Ім'я",
    "ru": "Имя"
  }
}
```

**Output JavaScript:**
```javascript
імя: 'Ім\'я',  // Single quote escaped as \'
```

### Emoji/Symbols Preservation

**Input JSON:**
```json
{
  "✓ Підтвердити": {
    "key": "підтвердити",
    "ua": "✓ Підтвердити",
    "ru": "✓ Подтвердить"
  }
}
```

**Output JavaScript:**
```javascript
підтвердити: '✓ Підтвердити',  // Emoji preserved
```

### Punctuation Preservation

**Input JSON:**
```json
{
  "Завантаження...": {
    "key": "завантаження",
    "ua": "Завантаження...",
    "ru": "Загрузка..."
  }
}
```

**Output JavaScript:**
```javascript
завантаження: 'Завантаження...',  // Ellipsis preserved
```

## Duplicate Key Handling

If a key already exists, it will be **skipped**:

```
⚠️  Key 'тижневийКалендар' already exists - skipping
```

The script will not overwrite existing translations.

## Format Details

### Indentation
- Matches the indentation of the `noComments` line
- Typically 16 spaces (4 levels of 4-space indents)

### Syntax
- Each line: `keyName: 'translation',`
- Trailing comma on every line
- Single quotes (escaped if needed)
- No semicolons

### Order
- All new keys inserted together after `noComments`
- Order matches the JSON file iteration
- Same keys in same order across all 6 language blocks

## Size Impact

For 150 unique keys across 6 languages:
- Approximately **900 new lines** added (150 keys × 6 languages)
- File size increase: ~50-100 KB (depending on translation length)
- Processing time: 2-5 minutes (including API translation calls)

## Validation

After running the script, verify:

1. **JavaScript syntax is valid**
   ```bash
   node -c js/modules/01-translations-v2.js
   ```

2. **All 6 language blocks have the same keys**
   - Count keys in each block should be equal

3. **Quotes are properly escaped**
   - Look for `\'` in translations with apostrophes

4. **No duplicate keys**
   - Each key should appear only once per language block

5. **Backup file created**
   - `01-translations-v2.js.backup` exists
