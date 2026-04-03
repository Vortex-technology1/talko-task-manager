# Звіт про проблеми української локалізації

Дата аналізу: 2026-04-03
Файли: index.html, biz-structure.html

## Загальна статистика

- **index.html**: 32 проблеми з захардкодженими російськими текстами
- **biz-structure.html**: 3 проблеми з захардкодженими російськими текстами

**ВАЖЛИВО**: Секції з translations (ru: {...}) НЕ включені в звіт - вони є частиною системи мультимовності і працюють коректно.

---

## Файл: index.html

### 1. Рядок 1428: Кнопка створення проекту
**Проблема:** `Создать проект`
**Має бути:** `Створити проєкт`
**Рішення:** Використати data-i18n або замінити напряму
```html
<!-- Поточний код: -->
<i data-lucide="plus" class="icon"></i> Создать проект

<!-- Має бути: -->
<i data-lucide="plus" class="icon"></i> <span data-i18n="createProject">Створити проєкт</span>
```

---

### 2. Рядок 1728: Налаштування - назва компанії (label)
**Проблема:** `Название компании` в атрибуті data-i18n
**Має бути:** Атрибут має бути `data-i18n="companyNameSetting"`, але текст не перекладається
**Рішення:** Переконатись, що ключ "companyNameSetting" є в translations.ua
```html
<!-- Поточний код: -->
<label style="..." data-i18n="companyNameSetting">Название компании</label>

<!-- Має бути: -->
<label style="..." data-i18n="companyNameSetting">Назва компанії</label>
```

---

### 3. Рядок 1730: Налаштування - placeholder назви компанії
**Проблема:** `Название компании` в placeholder
**Має бути:** `Назва компанії`
**Рішення:** Використати data-i18n-placeholder або замінити текст
```html
<!-- Поточний код: -->
<input id="settingCompanyName" type="text" placeholder="Название компании" ...>

<!-- Має бути: -->
<input id="settingCompanyName" type="text" placeholder="Назва компанії" data-i18n-placeholder="companyNamePlaceholder">
```

---

### 4. Рядок 1779: Вибір ніші
**Проблема:** `Выберите нишу...`
**Має бути:** `Оберіть нішу...`
**Рішення:** Замінити текст
```html
<!-- Поточний код: -->
<option value="">Выберите нишу...</option>

<!-- Має бути: -->
<option value="">Оберіть нішу...</option>
```

---

### 5. Рядок 2056: Кнопка "Оновити" в адмін-панелі компаній
**Проблема:** `Обновить`
**Має бути:** `Оновити`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<i data-lucide="refresh-cw" class="icon icon-sm"></i> Обновить

<!-- Має бути: -->
<i data-lucide="refresh-cw" class="icon icon-sm"></i> <span data-i18n="refresh">Оновити</span>
```

---

### 6. Рядок 2080: Кнопка "Оновити" в ролях
**Проблема:** `Обновить`
**Має бути:** `Оновити`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<i data-lucide="refresh-cw" class="icon icon-sm"></i> Обновить

<!-- Має бути: -->
<i data-lucide="refresh-cw" class="icon icon-sm"></i> <span data-i18n="refresh">Оновити</span>
```

---

### 7. Рядок 2092: Заголовок "Настройки компании"
**Проблема:** `Настройки компании`
**Має бути:** `Налаштування компанії`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<h3 style="..."><i data-lucide="settings" class="icon" style="..."></i> Настройки компании</h3>

<!-- Має бути: -->
<h3 style="..."><i data-lucide="settings" class="icon" style="..."></i> <span data-i18n="companySettings">Налаштування компанії</span></h3>
```

---

### 8. Рядок 2095: Label "Название компании"
**Проблема:** `Название компании`
**Має бути:** `Назва компанії`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label style="...">Название компании</label>

<!-- Має бути: -->
<label style="..." data-i18n="companyName">Назва компанії</label>
```

---

### 9. Рядок 2097: Placeholder "Название компании"
**Проблема:** `Название компании` в placeholder
**Має бути:** `Назва компанії`
**Рішення:** Використати data-i18n-placeholder
```html
<!-- Поточний код: -->
<input id="settingCompanyName" type="text" placeholder="Название компании" ...>

<!-- Має бути: -->
<input id="settingCompanyName" type="text" placeholder="Назва компанії" data-i18n-placeholder="companyNamePlaceholder">
```

---

### 10. Рядок 2099: Кнопка "Сохранить"
**Проблема:** `Сохранить`
**Має бути:** `Зберегти`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<button onclick="saveCompanySetting('name')" class="btn btn-success" style="...">Сохранить</button>

<!-- Має бути: -->
<button onclick="saveCompanySetting('name')" class="btn btn-success" style="..." data-i18n="save">Зберегти</button>
```

---

### 11. Рядок 2103: Label "Часовой пояс"
**Проблема:** `Часовой пояс`
**Має бути:** `Часовий пояс`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label style="...">Часовой пояс</label>

<!-- Має бути: -->
<label style="..." data-i18n="timezone">Часовий пояс</label>
```

---

### 12. Рядок 2112: Кнопка "Сохранить часовой пояс"
**Проблема:** `Сохранить часовой пояс`
**Має бути:** `Зберегти часовий пояс`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<button onclick="saveCompanySetting('timezone')" class="btn" style="...">Сохранить часовой пояс</button>

<!-- Має бути: -->
<button onclick="saveCompanySetting('timezone')" class="btn" style="..." data-i18n="saveTimezone">Зберегти часовий пояс</button>
```

---

### 13. Рядок 2120: Кнопка "Сохранить"
**Проблема:** `Сохранить`
**Має бути:** `Зберегти`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<button onclick="saveCompanySetting('weeklyReport')" class="btn" style="...">Сохранить</button>

<!-- Має бути: -->
<button onclick="saveCompanySetting('weeklyReport')" class="btn" style="..." data-i18n="save">Зберегти</button>
```

---

### 14. Рядок 2139: aria-label "Закрыть диалог"
**Проблема:** `Закрыть диалог`
**Має бути:** `Закрити діалог`
**Рішення:** Замінити текст (aria-атрибути не локалізуються через data-i18n)
```html
<!-- Поточний код: -->
<button class="close" onclick="closeModal('projectModal')" aria-label="Закрыть диалог">&times;</button>

<!-- Має бути: -->
<button class="close" onclick="closeModal('projectModal')" aria-label="Закрити діалог">&times;</button>
```

---

### 15. Рядок 2158: Label "Описание"
**Проблема:** `Описание`
**Має бути:** `Опис`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Описание</label>

<!-- Має бути: -->
<label class="form-label" data-i18n="description">Опис</label>
```

---

### 16. Рядок 2200: title "Копировать задачу"
**Проблема:** `Копировать задачу`
**Має бути:** `Копіювати завдання`
**Рішення:** Замінити текст
```html
<!-- Поточний код: -->
<button id="duplicateTaskBtn" ... title="Копировать задачу" ...>

<!-- Має бути: -->
<button id="duplicateTaskBtn" ... title="Копіювати завдання" data-i18n-title="duplicateTask">
```

---

### 17. Рядок 2201: Текст кнопки "Копировать"
**Проблема:** `Копировать`
**Має бути:** `Копіювати`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
... Копировать

<!-- Має бути: -->
<span data-i18n="duplicate">Копіювати</span>
```

---

### 18. Рядок 2203: aria-label "Закрыть диалог"
**Проблема:** `Закрыть диалог`
**Має бути:** `Закрити діалог`
**Рішення:** Замінити текст
```html
<!-- Поточний код: -->
<button class="close" onclick="closeModal('taskModal')" aria-label="Закрыть диалог">

<!-- Має бути: -->
<button class="close" onclick="closeModal('taskModal')" aria-label="Закрити діалог">
```

---

### 19. Рядок 2211: Label "Функция" + option "Без функции"
**Проблема:** `Функция` та `Без функции`
**Має бути:** `Функція` та `Без функції`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Функция</label>
<select id="taskFunction" class="form-select" ...><option value="">Без функции</option></select>

<!-- Має бути: -->
<label class="form-label" data-i18n="function">Функція</label>
<select id="taskFunction" class="form-select" ...><option value="" data-i18n="noFunction">Без функції</option></select>
```

---

### 20. Рядок 2215-2216: "Проект" та "Этап"
**Проблема:** `Проект` / `Без проекта` та `Этап` / `Без этапа`
**Має бути:** `Проєкт` / `Без проєкту` та `Етап` / `Без етапу`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Проект</label>
<option value="">Без проекта</option>
<label class="form-label">Этап</label>
<option value="">Без этапа</option>

<!-- Має бути: -->
<label class="form-label" data-i18n="project">Проєкт</label>
<option value="" data-i18n="noProject">Без проєкту</option>
<label class="form-label" data-i18n="stage">Етап</label>
<option value="" data-i18n="noStage">Без етапу</option>
```

---

### 21. Рядок 2224: "Расширенные настройки"
**Проблема:** `Расширенные настройки`
**Має бути:** `Розширені налаштування`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<span>Расширенные настройки</span>

<!-- Має бути: -->
<span data-i18n="advancedSettings">Розширені налаштування</span>
```

---

### 22. Рядок 2230-2234: "Конец / Длительность", "Время окончания", "Длительность"
**Проблема:** Російські тексти в налаштуваннях часу
**Має бути:** `Кінець / Тривалість`, `Час закінчення`, `Тривалість`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Конец / Длительность</label>
<option value="end">Время окончания</option>
<option value="duration">Длительность</option>

<!-- Має бути: -->
<label class="form-label" data-i18n="endDuration">Кінець / Тривалість</label>
<option value="end" data-i18n="endTime">Час закінчення</option>
<option value="duration" data-i18n="duration">Тривалість</option>
```

---

### 23. Рядок 2242: "Дата начала"
**Проблема:** `Дата начала`
**Має бути:** `Дата початку`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Дата начала</label>

<!-- Має бути: -->
<label class="form-label" data-i18n="startDate">Дата початку</label>
```

---

### 24. Рядок 2244-2245: Пріоритет та Статус
**Проблема:** `Приоритет`, `Низкий`, `Средний`, `Высокий`, `Статус`, `Новая`, `В работе`, `На проверке`, `Готово`
**Має бути:** `Пріоритет`, `Низький`, `Середній`, `Високий`, `Статус`, `Нова`, `В роботі`, `На перевірці`, `Готово`
**Рішення:** Використати data-i18n для всіх елементів
```html
<!-- Поточний код: -->
<label class="form-label">Приоритет</label>
<option value="low">Низкий</option>
<option value="medium" selected>Средний</option>
<option value="high">Высокий</option>
<label class="form-label">Статус</label>
<option value="new">Новая</option>
<option value="progress">В работе</option>
<option value="review">На проверке</option>
<option value="done">Готово</option>

<!-- Має бути: -->
<label class="form-label" data-i18n="priority">Пріоритет</label>
<option value="low" data-i18n="priorityLow">Низький</option>
<option value="medium" selected data-i18n="priorityMedium">Середній</option>
<option value="high" data-i18n="priorityHigh">Високий</option>
<label class="form-label" data-i18n="status">Статус</label>
<option value="new" data-i18n="statusNew">Нова</option>
<option value="progress" data-i18n="statusProgress">В роботі</option>
<option value="review" data-i18n="statusReview">На перевірці</option>
<option value="done" data-i18n="statusDone">Готово</option>
```

---

### 25. Рядок 2249: "Соисполнители"
**Проблема:** `Соисполнители`
**Має бути:** `Співвиконавці`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<span>Соисполнители</span>

<!-- Має бути: -->
<span data-i18n="coExecutors">Співвиконавці</span>
```

---

### 26. Рядок 2275-2277: "Ожидаемый результат", "Формат отчёта", "Описание"
**Проблема:** Російські label
**Має бути:** `Очікуваний результат`, `Формат звіту`, `Опис`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Ожидаемый результат</label>
<label class="form-label">Формат отчёта</label>
<label class="form-label">Описание</label>

<!-- Має бути: -->
<label class="form-label" data-i18n="expectedResult">Очікуваний результат</label>
<label class="form-label" data-i18n="reportFormat">Формат звіту</label>
<label class="form-label" data-i18n="description">Опис</label>
```

---

### 27. Рядок 2281: "Непонятно? Спроси AI-помощника"
**Проблема:** `Непонятно? Спроси AI-помощника` (російська мова)
**Має бути:** `Незрозуміло? Запитай AI-помічника`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<span>Непонятно? Спроси AI-помощника</span>

<!-- Має бути: -->
<span data-i18n="askAiHelper">Незрозуміло? Запитай AI-помічника</span>
```

---

### 28. Рядок 2287: "Чеклист"
**Проблема:** `Чеклист` (російська транслітерація)
**Має бути:** `Чеклист` (в українській мові прийнятно) або `Список перевірки`
**Рішення:** Залишити як є або використати data-i18n="checklist"
```html
<!-- Рекомендація: -->
<span data-i18n="checklist">Чеклист</span>
```

---

### 29. Рядок 2290: "Добавить пункт"
**Проблема:** `Добавить пункт`
**Має бути:** `Додати пункт`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<span>Добавить пункт</span>

<!-- Має бути: -->
<span data-i18n="addItem">Додати пункт</span>
```

---

### 30. Рядок 2310: title та aria-label "Добавить время вручную"
**Проблема:** `Добавить время вручную`
**Має бути:** `Додати час вручну`
**Рішення:** Використати data-i18n-title
```html
<!-- Поточний код: -->
<button ... title="Добавить время вручную" aria-label="Добавить время вручную" data-i18n-title="addTimeManually">

<!-- Має бути: -->
<button ... title="Додати час вручну" aria-label="Додати час вручну" data-i18n-title="addTimeManually">
```

---

### 31. Рядок 2322: "Напоминания к дедлайну"
**Проблема:** `Напоминания к дедлайну`
**Має бути:** `Нагадування до дедлайну`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<span>Напоминания к дедлайну</span>

<!-- Має бути: -->
<span data-i18n="deadlineReminders">Нагадування до дедлайну</span>
```

---

### 32. Рядок 2349: "Создать повторную задачу"
**Проблема:** `Создать повторную задачу`
**Має бути:** `Створити повторне завдання`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<span style="...">Создать повторную задачу</span>

<!-- Має бути: -->
<span style="..." data-i18n="createRepeatTask">Створити повторне завдання</span>
```

---

### 33. Рядок 2386: "Открыть сделку CRM"
**Проблема:** `Открыть сделку CRM`
**Має бути:** `Відкрити угоду CRM`
**Рішення:** Використати data-i18n або замінити клас task-crm-name
```html
<!-- Поточний код: -->
<span class="task-crm-name">Открыть сделку CRM</span>

<!-- Має бути: -->
<span class="task-crm-name" data-i18n="openCrmDeal">Відкрити угоду CRM</span>
```

---

### 34. Рядок 2402: "Добавить"
**Проблема:** `Добавить`
**Має бути:** `Додати`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<i data-lucide="plus" class="icon icon-sm"></i> Добавить

<!-- Має бути: -->
<i data-lucide="plus" class="icon icon-sm"></i> <span data-i18n="add">Додати</span>
```

---

### 35. Рядок 2407: "Нажмите «+ Добавить» чтобы разбить задачу на части"
**Проблема:** `Нажмите «+ Добавить» чтобы разбить задачу на части`
**Має бути:** `Натисніть «+ Додати» щоб розбити завдання на частини`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
Нажмите «+ Добавить» чтобы разбить задачу на части

<!-- Має бути: -->
<span data-i18n="addSubtaskHint">Натисніть «+ Додати» щоб розбити завдання на частини</span>
```

---

### 36. Рядок 2482: aria-label "Закрыть диалог"
**Проблема:** `Закрыть диалог`
**Має бути:** `Закрити діалог`
**Рішення:** Замінити текст
```html
<!-- Поточний код: -->
<button class="close" onclick="closeModal('functionModal')" aria-label="Закрыть диалог">&times;</button>

<!-- Має бути: -->
<button class="close" onclick="closeModal('functionModal')" aria-label="Закрити діалог">&times;</button>
```

---

### 37. Рядок 2488: "Описание"
**Проблема:** `Описание`
**Має бути:** `Опис`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Описание</label>

<!-- Має бути: -->
<label class="form-label" data-i18n="description">Опис</label>
```

---

### 38. Рядок 2517, 2547, 2560, 2580, 2616, 2658, 2671, 2776, 2800, 3272, 3307, 3326, 4258, 4275, 4288: aria-label "Закрыть диалог" / "Закрыть"
**Проблема:** `Закрыть диалог` або `Закрыть`
**Має бути:** `Закрити діалог` або `Закрити`
**Рішення:** Замінити текст у всіх модальних вікнах

---

### 39. Рядок 2676: "Функция *" + option "Выберите"
**Проблема:** `Функция *` та `Выберите`
**Має бути:** `Функція *` та `Оберіть`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label class="form-label">Функция *</label>
<option value="">Выберите</option>

<!-- Має бути: -->
<label class="form-label" data-i18n="function">Функція *</label>
<option value="" data-i18n="select">Оберіть</option>
```

---

### 40. Рядок 2677-2678: "Исполнитель", "Периодичность"
**Проблема:** `Исполнитель`, `Из функции (авто)`, `Периодичность *`, `Ежедневно`, `Еженедельно`, `Ежемесячно`, `Ежеквартально`
**Має бути:** `Виконавець`, `Із функції (авто)`, `Періодичність *`, `Щодня`, `Щотижня`, `Щомісяця`, `Щокварталу`
**Рішення:** Використати data-i18n для всіх елементів
```html
<!-- Має бути: -->
<label class="form-label" data-i18n="assignee">Виконавець</label>
<option value="" data-i18n="fromFunction">Із функції (авто)</option>
<label class="form-label" data-i18n="frequency">Періодичність *</label>
<option value="daily" data-i18n="daily">Щодня</option>
<option value="weekly" data-i18n="weekly">Щотижня</option>
<option value="monthly" data-i18n="monthly">Щомісяця</option>
<option value="quarterly" data-i18n="quarterly">Щокварталу</option>
```

---

### 41. Рядок 2682: "Пропускать выходные (сб/вс)"
**Проблема:** `Пропускать выходные (сб/вс)`
**Має бути:** `Пропускати вихідні (сб/нд)`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<span>Пропускать выходные (сб/вс)</span>

<!-- Має бути: -->
<span data-i18n="skipWeekends">Пропускати вихідні (сб/нд)</span>
```

---

### 42. Рядок 2688: "Все дни"
**Проблема:** `Все дни`
**Має бути:** `Всі дні`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<button type="button" onclick="selectAllDays()" class="btn" style="...">Все дни</button>

<!-- Має бути: -->
<button type="button" onclick="selectAllDays()" class="btn" style="..." data-i18n="allDays">Всі дні</button>
```

---

### 43. Рядок 2721: "Время окончания"
**Проблема:** `Время окончания`
**Має бути:** `Час закінчення`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<option value="end">Время окончания</option>

<!-- Має бути: -->
<option value="end" data-i18n="endTime">Час закінчення</option>
```

---

### 44. Рядок 4005: "Редактировать показатель"
**Проблема:** `Редактировать показатель`
**Має бути:** `Редагувати показник`
**Рішення:** Використати data-i18n або замінити текст
```html
<!-- Поточний код: -->
<span id="metricModalTitle" style="...">Редактировать показатель</span>

<!-- Має бути: -->
<span id="metricModalTitle" style="..." data-i18n="editMetric">Редагувати показник</span>
```

---

### 45. Рядок 4014-4023: "Название показателя", "Описание"
**Проблема:** `Название показателя`, `Описание`
**Має бути:** `Назва показника`, `Опис`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label style="...">Название показателя</label>
<label style="...">Описание</label>

<!-- Має бути: -->
<label style="..." data-i18n="metricName">Назва показника</label>
<label style="..." data-i18n="description">Опис</label>
```

---

### 46. Рядок 4033: "Ответственный", "Не назначено"
**Проблема:** `Ответственный`, `Не назначено`
**Має бути:** `Відповідальний`, `Не призначено`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<label style="...">Ответственный</label>
<option value="">Не назначено</option>

<!-- Має бути: -->
<label style="..." data-i18n="responsible">Відповідальний</label>
<option value="" data-i18n="notAssigned">Не призначено</option>
```

---

### 47. Рядок 4042-4047: "Периодичность", "Ежедневная", "Еженедельная", "Ежемесячная"
**Проблема:** Російські тексти
**Має бути:** `Періодичність`, `Щоденна`, `Щотижнева`, `Щомісячна`
**Рішення:** Використати data-i18n
```html
<!-- Має бути: -->
<label style="..." data-i18n="frequency">Періодичність</label>
<option value="daily" data-i18n="frequencyDaily">Щоденна</option>
<option value="weekly" selected data-i18n="frequencyWeekly">Щотижнева</option>
<option value="monthly" data-i18n="frequencyMonthly">Щомісячна</option>
```

---

### 48. Рядок 4124-4127: "Период цели", "Неделя", "Месяц"
**Проблема:** `Период цели (targetPeriod)`, `Неделя`, `Месяц`
**Має бути:** `Період цілі`, `Тиждень`, `Місяць`
**Рішення:** Використати data-i18n
```html
<!-- Має бути: -->
<label style="..." data-i18n="targetPeriod">Період цілі (targetPeriod)</label>
<option value="week" data-i18n="week">Тиждень</option>
<option value="month" selected data-i18n="month">Місяць</option>
```

---

### 49. Рядок 4243: aria-label "Удалить метрику"
**Проблема:** `Удалить метрику`
**Має бути:** `Видалити метрику`
**Рішення:** Замінити текст
```html
<!-- Поточний код: -->
... aria-label="Удалить метрику">

<!-- Має бути: -->
... aria-label="Видалити метрику">
```

---

### 50. Рядок 4246-4247: "Отменить", "Сохранить"
**Проблема:** `Отменить`, `Сохранить`
**Має бути:** `Скасувати`, `Зберегти`
**Рішення:** Використати data-i18n
```html
<!-- Поточний код: -->
<button onclick="closeModal('metricModal')" style="...">Отменить</button>
<button onclick="saveMetric()" style="...">Сохранить</button>

<!-- Має бути: -->
<button onclick="closeModal('metricModal')" style="..." data-i18n="cancel">Скасувати</button>
<button onclick="saveMetric()" style="..." data-i18n="save">Зберегти</button>
```

---

## Файл: biz-structure.html

### 1. Рядок 8857: aria-label "Выбрать цвет"
**Проблема:** `Выбрать цвет`
**Має бути:** `Обрати колір`
**Рішення:** Замінити текст в шаблоні
```html
<!-- Поточний код: -->
aria-label="Выбрать цвет">

<!-- Має бути: -->
aria-label="Обрати колір">
```

---

### 2. Рядок 8871: placeholder "Название"
**Проблема:** `Название`
**Має бути:** `Назва`
**Рішення:** Замінити текст або використати динамічну локалізацію
```html
<!-- Поточний код: -->
placeholder="Название"

<!-- Має бути: -->
placeholder="Назва"
```

---

### 3. Рядок 8885: aria-label "Удалить метрику"
**Проблема:** `Удалить метрику`
**Має бути:** `Видалити метрику`
**Рішення:** Замінити текст в шаблоні
```javascript
// Поточний код:
aria-label="Удалить метрику"

// Має бути:
aria-label="Видалити метрику"
```

---

## Рекомендації щодо виправлення

### 1. Створити недостатні ключі перекладів
Додати в об'єкт translations.ua наступні ключі:
```javascript
ua: {
  createProject: 'Створити проєкт',
  companyNameSetting: 'Назва компанії',
  companyNamePlaceholder: 'Назва компанії',
  selectNiche: 'Оберіть нішу...',
  refresh: 'Оновити',
  companySettings: 'Налаштування компанії',
  companyName: 'Назва компанії',
  save: 'Зберегти',
  timezone: 'Часовий пояс',
  saveTimezone: 'Зберегти часовий пояс',
  description: 'Опис',
  duplicateTask: 'Копіювати завдання',
  duplicate: 'Копіювати',
  function: 'Функція',
  noFunction: 'Без функції',
  project: 'Проєкт',
  noProject: 'Без проєкту',
  stage: 'Етап',
  noStage: 'Без етапу',
  advancedSettings: 'Розширені налаштування',
  endDuration: 'Кінець / Тривалість',
  endTime: 'Час закінчення',
  duration: 'Тривалість',
  startDate: 'Дата початку',
  priority: 'Пріоритет',
  priorityLow: 'Низький',
  priorityMedium: 'Середній',
  priorityHigh: 'Високий',
  status: 'Статус',
  statusNew: 'Нова',
  statusProgress: 'В роботі',
  statusReview: 'На перевірці',
  statusDone: 'Готово',
  coExecutors: 'Співвиконавці',
  expectedResult: 'Очікуваний результат',
  reportFormat: 'Формат звіту',
  askAiHelper: 'Незрозуміло? Запитай AI-помічника',
  checklist: 'Чеклист',
  addItem: 'Додати пункт',
  addTimeManually: 'Додати час вручну',
  deadlineReminders: 'Нагадування до дедлайну',
  createRepeatTask: 'Створити повторне завдання',
  openCrmDeal: 'Відкрити угоду CRM',
  add: 'Додати',
  addSubtaskHint: 'Натисніть «+ Додати» щоб розбити завдання на частини',
  select: 'Оберіть',
  assignee: 'Виконавець',
  fromFunction: 'Із функції (авто)',
  frequency: 'Періодичність',
  daily: 'Щодня',
  weekly: 'Щотижня',
  monthly: 'Щомісяця',
  quarterly: 'Щокварталу',
  skipWeekends: 'Пропускати вихідні (сб/нд)',
  allDays: 'Всі дні',
  editMetric: 'Редагувати показник',
  metricName: 'Назва показника',
  responsible: 'Відповідальний',
  notAssigned: 'Не призначено',
  frequencyDaily: 'Щоденна',
  frequencyWeekly: 'Щотижнева',
  frequencyMonthly: 'Щомісячна',
  targetPeriod: 'Період цілі',
  week: 'Тиждень',
  month: 'Місяць',
  cancel: 'Скасувати',
  selectColor: 'Обрати колір',
  name: 'Назва',
  deleteMetric: 'Видалити метрику'
}
```

### 2. Замінити всі aria-label
Оскільки aria-label не локалізується через data-i18n, потрібно:
- Або замінити всі російські aria-label на українські тексти напряму
- Або створити JavaScript-функцію, яка динамічно оновлює aria-label при зміні мови

### 3. Використовувати data-i18n скрізь
Замінити всі захардкоджені тексти на конструкції виду:
```html
<span data-i18n="keyName">Український текст за замовчуванням</span>
```

---

## Висновок

Виявлено **35 унікальних проблем** з російськими текстами, що вимагають виправлення:

- **index.html**: 32 випадки
- **biz-structure.html**: 3 випадки

Основні типи проблем:
1. **Кнопки та labels без локалізації** (найбільша категорія)
2. **Атрибути aria-label з російськими текстами**
3. **Placeholders без data-i18n-placeholder**
4. **Options в select без data-i18n**

Всі проблеми можуть бути вирішені шляхом:
- Додавання відсутніх ключів перекладів
- Заміни захардкоджених текстів на data-i18n атрибути
- Прямої заміни aria-label на українські тексти
