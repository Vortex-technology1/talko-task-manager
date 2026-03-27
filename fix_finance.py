#!/usr/bin/env python3
import re, os

SVG = {
  'check_circle': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  'check':        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  'x':            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  'warn':         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  'settings':     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M2 12h2M20 12h2M12 2v2M12 20v2"/></svg>',
  'bar_chart':    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  'trend_up':     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  'file':         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  'calendar':     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  'dollar':       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  'briefcase':    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  'factory':      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>',
  'box':          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  'scale':        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v19"/><path d="M5 10l7-7 7 7"/><path d="M3 17l4-8 4 8"/><path d="M13 17l4-8 4 8"/><path d="M3 21h18"/></svg>',
  'bulb':         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  'robot':        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg>',
  'map':          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
  'search':       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
}

# Список замін: (рядок_для_пошуку, заміна)
REPLACEMENTS = [
    # ── Попередження ──
    ('⚠️ ', SVG['warn'] + ' '),
    ('⚠ ', SVG['warn'] + ' '),
    ('⚠️</span>', SVG['warn'] + '</span>'),
    # ── Галочки ──
    ('✅ ', SVG['check_circle'] + ' '),
    ("✓ Баланс зведений", SVG['check'] + ' Баланс зведений'),
    ("✓ Завершити", SVG['check'] + ' Завершити'),
    ("✓ Записати дохід у фінанси", SVG['check'] + ' Записати дохід у фінанси'),
    ("✓ Зафіксувати оплату", SVG['check'] + ' Зафіксувати оплату'),
    ("✓ Зберегти план", SVG['check'] + ' Зберегти план'),
    # ── X кнопки закриття (тільки окремі) ──
    ("'✕')", "'×')"),    # у тексті кнопок
    ('"✕")', '"×")'),
    ('> ✕ </', '>×</'),
    # ── Налаштування ──
    ('⚙️ Налаштування Балансу', SVG['settings'] + ' Налаштування Балансу'),
    ('⚙️ Налаштування\n', SVG['settings'] + ' Налаштування\n'),
    ('⚙️ Налаштування</', SVG['settings'] + ' Налаштування</'),
    ('⚙️ Налаштування"', SVG['settings'] + ' Налаштування"'),
    ('Натисніть ⚙️', 'Натисніть ' + SVG['settings']),
    # ── Графіки ──
    ("'📊 Тижневий план — доходи", "'" + SVG['bar_chart'] + ' Тижневий план — доходи'),
    ('📊 Cash Flow', SVG['bar_chart'] + ' Cash Flow'),
    ('📊 Бюджет місяця', SVG['bar_chart'] + ' Бюджет місяця'),
    ('📈 Виручка (Revenue)', SVG['trend_up'] + ' Виручка (Revenue)'),
    ("'📈 P&L", "'" + SVG['trend_up'] + ' P&L'),
    ('📈 P&L', SVG['trend_up'] + ' P&L'),
    # ── Виробництво/бізнес ──
    ("'🏭 Собівартість (COGS)'", "'" + SVG['factory'] + " Собівартість (COGS)'"),
    ('🏭 Собівартість (COGS)', SVG['factory'] + ' Собівартість (COGS)'),
    ('"🏭 COGS"', '"' + SVG['factory'] + ' COGS"'),
    ("'💼 Операційні витрати (OPEX)'", "'" + SVG['briefcase'] + " Операційні витрати (OPEX)'"),
    ('💼 Операційні витрати (OPEX)', SVG['briefcase'] + ' Операційні витрати (OPEX)'),
    ('"💼 OPEX"', '"' + SVG['briefcase'] + ' OPEX"'),
    # ── Активи/пасиви/капітал (sectionHdr виклики) ──
    ("sectionHdr('📦','АКТИВИ'", "sectionHdr('" + SVG['box'] + "','АКТИВИ'"),
    ("sectionHdr('📋','ПАСИВИ'", "sectionHdr('" + SVG['file'] + "','ПАСИВИ'"),
    ("sectionHdr('💰','ВЛАСНИЙ КАПІТАЛ'", "sectionHdr('" + SVG['dollar'] + "','ВЛАСНИЙ КАПІТАЛ'"),
    # ── Баланс ──
    ('⚖️ Баланс (Аналіти', SVG['scale'] + ' Баланс (Аналіти'),
    ('⚖️ Перевірте дані', SVG['warn'] + ' Перевірте дані'),
    # ── Підказки ──
    ('💡 <b>Підказка:</b>', SVG['bulb'] + ' <b>Підказка:</b>'),
    ('💡 Відредагуйте планові суми', SVG['bulb'] + ' Відредагуйте планові суми'),
    # ── Кнопка автозаповнення ──
    ('🤖 Заповнити з середнього 3M', SVG['robot'] + ' Заповнити з середнього 3M'),
    # ── Календар ──
    ('📅 Тижневий план 6M', SVG['calendar'] + ' Тижневий план 6M'),
    ("'📅 ' + mo", "'" + SVG['calendar'] + " ' + mo"),
    ('📅 ${mo}', SVG['calendar'] + ' ${mo}'),
    # ── Карта ──
    ('🗺️ Де що', SVG['map'] + ' Де що'),
    # ── Toast повідомлення (з SVG → текст зрозуміліший) ──
    ("'💰 Авто-транзакція: +", "'" + SVG['dollar'] + ' Авто-транзакція: +'),
    # ── How panel ──
    ('📊 Cash Flow (Дашборд)', SVG['bar_chart'] + ' Cash Flow (Дашборд)'),
    ('📈 P&L — Прибутки', SVG['trend_up'] + ' P&L — Прибутки'),
    ('📅 Тижневий план 6M (Планування', SVG['calendar'] + ' Тижневий план 6M (Планування'),
    ('📊 Бюджет місяця (Планування', SVG['bar_chart'] + ' Бюджет місяця (Планування'),
    ('🗺️ Де що знаходиться', SVG['map'] + ' Де що знаходиться'),
    ('🏭\n', SVG['factory'] + '\n'),
    ('💼\n', SVG['briefcase'] + '\n'),
]

def process_file(path):
    if not os.path.exists(path):
        print(f'⏭ {path} — не знайдено')
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    count = 0
    for old, new in REPLACEMENTS:
        if old in content:
            content = content.replace(old, new)
            count += 1
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'✅ {path}: {count} замін')

files = [
    'js/modules/98-finance.js',
    'js/modules/98-finance-balance.js',
    'js/modules/98-finance-weekly-plan.js',
    'js/modules/77j-crm-finance-bridge.js',
    'js/modules/100b-booking-bridge.js',
    'js/modules/99c-warehouse-finance-bridge.js',
]

for f in files:
    process_file(f)

print('\n✅ Emoji → SVG: готово')
