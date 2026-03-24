// ============================================================
// 76-coordination.js — TALKO Coordination Module FULL v3
// v3: Рішення→Задача (одним кліком), розширені фільтри
//     (проекти/процеси/CRM), панель "Як це працює"
// ============================================================
(function () {
    'use strict';

    // ── State ──────────────────────────────────────────────
    let coordinations = [];
    let coordUsers = [];
    let coordFunctions = [];
    let coordTasks = [];
    let coordMetrics = [];
    let coordUnsubscribes = [];
    let activeSession = null;
    let sessionDecisions = [];
    let sessionUnresolved = [];
    let sessionAgendaDone = {};
    let sessionDynamicAgenda = [];
    let timerInterval = null;
    let sessionStartTime = null;
    let currentProtocol = null;
    let editingCoordId = null;
    // v3 extra
    let coordProjects = [];
    let coordProcessTemplates = [];
    let coordCrmPipeline = null;

    const COORD_LUCIDE_ICONS = {
        daily:'sun', weekly:'calendar', monthly:'calendar-range',
        council_rec:'handshake', council_dir:'target', council_exe:'zap',
        council_own:'crown', oneoff:'bell',
    };
    const ESCALATION_CHAIN = {
        daily:'weekly', weekly:'council_rec', council_rec:'council_dir',
        council_dir:'council_exe', council_exe:'council_own',
    };

    // ── i18n ───────────────────────────────────────────────
    const COORD_I18N = {
        ua: {
            title:window.t('coordKoordyna'), newCoord:window.t('coordNovaKoordyna'),
            emptyText:window.t('coordKoordynaShcheNemaye'),
            addFirst:'+ Додати першу', modalTitle:window.t('coordNovaKoordyna'), modalEdit:window.t('flowEdt2'),
            labelName:window.t('coordNazvaKoordyna'), placeholderName:window.t('coordShchodennaKoordynaKomandy'),
            labelType:window.t('flowTyp2'), labelStatus:'Статус', statusActive:'Активна', statusPaused:'Призупинена',
            labelChairman:window.t('coordHolovaKoordyna'), selectChairman:window.t('coordOberitVidpovid'),
            labelParticipants:'Учасники', labelDay:'День тижня', anyDay:'— Будь-який —',
            labelTime:'Час початку', labelFilter:window.t('coordFiltrZavdan'),
            filterFunctions:window.t('coordPoFunktsiyakh'), filterProjects:'По проектах',
            filterAssignees:'По виконавцях', filterOverdue:window.t('coordProstroch'), filterReview:window.t('coordNaPerevirts'),
            filterProjectsLabel:'Проекти (мультивибір)', filterProcessesLabel:'Процеси (мультивибір)',
            filterCrmStageLabel:'CRM стадія',
            labelEscal:window.t('coordEskalatsiDo'), escalAuto:'— Авто по типу —',
            escalHint:window.t('coordNevyrishePytannyaAvtomaty'),
            labelTelegram:'Telegram Chat ID', telegramHint:window.t('coordProtokolNadsylayeAvtomaty'),
            btnCancel:window.t('flowCncl2'), btnSave:window.t('flowSv2'),
            agendaTitle:'Порядок денний', agendaHint:window.t('coordUchasnykyDodayutPytannya'),
            btnFinish:'Завершити', agendaSection:'Порядок денний', participantsLbl:'Учасники',
            decisionsLbl:window.t('coordRishennya'), escalLbl:window.t('coordEskalatsiNevyrishePytannya'),
            protocolTitle:window.t('coordProtokolKoordyna'), protocolsTitle:'Протоколи',
            noProtocols:window.t('coordProtokolShcheNemaye'),
            aiTitle:window.t('coordRekomend'), escalated:'Ескальовано',
            statsLbl:window.t('coordStatystyUchasnyki'), execLbl:window.t('coordVykonannPoperednZavdan'),
            reportsLbl:window.t('coordZvityUchasnyki'), questionsLbl:window.t('coordPytannyaVidUchasnyki'),
            decisionsAgLbl:window.t('coordRishennya'), tasksAgLbl:window.t('coordNoviZavdannya'),
            typeDaily:'Щоденна', typeWeekly:'Щотижнева', typeMonthly:window.t('coordMisyachna'),
            typeCouncilRec:window.t('coordRekomendRada'), typeCouncilDir:'Рада директора',
            typeCouncilExe:'Виконавча рада', typeCouncilOwn:window.t('coordRadaZasnovny'), typeOneoff:'Разова',
            analyticsTitle:window.t('coordAnalityk'), statsSummary:window.t('coordStatsFull'),
            howItWorks:'Як це працює', howClose:'Закрити',
            createTaskBtn:'\u2192 Створити задачу', taskCreatedBadge:'\u2705 Задача створена',
            taskTitleLbl:'Заголовок задачі', taskAssigneeLbl:'Виконавець', taskDeadlineLbl:'Дедлайн',
            taskLinkProject:"Прив'язати до проекту", taskLinkProcess:"Прив'язати до процесу",
            taskLinkCrm:"Прив'язати до CRM угоди",
            taskCreateBtn:'Створити задачу', taskCancelBtn:'Скасувати', selectNone:'— Не вибрано —',
            howBlock1:'Яку проблему вирішують координації',
            howNoBefore:'Без координацій: рішення загубились в месенджері, через тиждень нічого не зроблено',
            howWithAfter:'З координаціями: кожне рішення → задача → виконавець → дедлайн → протокол',
            howBlock2:'8 типів координацій',
            howBlock3:'Порядок денний (6 секцій)',
            howBlock4:"Взаємозв'язки з іншими модулями",
            howBlock5:'Покроковий гайд: як провести координацію',
            howBlock6:'Типові помилки',
            howBlock7:'Результати через місяць',
            howErr1:"Нарада без протоколу → через тиждень ніхто нічого не пам'ятає",
            howErr2:'Рішення без виконавця → ніхто не відповідальний',
            howErr3:"Ескалація без адресата → питання підвисає",
            howStep1:'Відкрити координацію → натиснути Запустити',
            howStep2:'Статистики: учасники озвучують свої показники',
            howStep3:'Виконання: перевіряємо задачі з минулого тижня',
            howStep4:'Звіти: кожен учасник за 2 хв',
            howStep5:'Питання: розбираємо порядок денний',
            howStep6:'Рішення: фіксуємо кожне → кнопка Створити задачу',
            howStep7:'Завершити → протокол PDF автоматично',
        },
        ru: {
            title:'Координации', newCoord:'Новая координация', emptyText:'Координаций ещё нет',
            addFirst:'+ Добавить первую', modalTitle:'Новая координация', modalEdit:'Редактировать',
            labelName:'Название координации', placeholderName:'Ежедневная координация команды',
            labelType:window.t('flowTyp2'), labelStatus:'Статус', statusActive:'Активная', statusPaused:'Приостановлена',
            labelChairman:'Руководитель координации', selectChairman:'— Выберите ответственного —',
            labelParticipants:'Участники', labelDay:'День недели', anyDay:'— Любой —',
            labelTime:'Время начала', labelFilter:'Фильтр задач',
            filterFunctions:'По функциям', filterProjects:'По проектам',
            filterAssignees:'По исполнителям', filterOverdue:'Просроченные', filterReview:'На проверке',
            filterProjectsLabel:'Проекты (мультивыбор)', filterProcessesLabel:'Процессы (мультивыбор)',
            filterCrmStageLabel:'CRM стадия',
            labelEscal:'Эскалация до', escalAuto:'— Авто по типу —',
            escalHint:'Нерешённые вопросы автоматически попадут выше по цепочке',
            labelTelegram:'Telegram Chat ID', telegramHint:'Протокол отправляется автоматически после завершения',
            btnCancel:'Отмена', btnSave:'Сохранить',
            agendaTitle:'Повестка дня', agendaHint:'Участники добавляют вопросы до начала координации',
            btnFinish:'Завершить', agendaSection:'Повестка дня', participantsLbl:'Участники',
            decisionsLbl:'Решения', escalLbl:'Эскалация (нерешённые вопросы)',
            protocolTitle:'Протокол координации', protocolsTitle:'Протоколы', noProtocols:'Протоколов ещё нет',
            aiTitle:'AI Рекомендации', escalated:'Эскалировано',
            statsLbl:'Статистики участников', execLbl:'Выполнение предыдущих задач',
            reportsLbl:'Отчёты участников', questionsLbl:'Вопросы от участников',
            decisionsAgLbl:'Решения', tasksAgLbl:'Новые задачи',
            typeDaily:'Ежедневная', typeWeekly:'Еженедельная', typeMonthly:'Ежемесячная',
            typeCouncilRec:'Рекомендательный совет', typeCouncilDir:'Совет директора',
            typeCouncilExe:'Исполнительный совет', typeCouncilOwn:'Совет основателей', typeOneoff:'Разовая',
            analyticsTitle:'Аналитика',
            statsSummary:'Координаций: {total} · Решений: {decisions} · Эскалировано: {unresolved} · Средняя длительность: {avg}мин',
            howItWorks:'Как это работает', howClose:'Закрыть',
            createTaskBtn:'\u2192 Создать задачу', taskCreatedBadge:'\u2705 Задача создана',
            taskTitleLbl:'Заголовок задачи', taskAssigneeLbl:'Исполнитель', taskDeadlineLbl:'Дедлайн',
            taskLinkProject:'Привязать к проекту', taskLinkProcess:'Привязать к процессу',
            taskLinkCrm:'Привязать к CRM сделке',
            taskCreateBtn:'Создать задачу', taskCancelBtn:'Отмена', selectNone:'— Не выбрано —',
            howBlock1:'Какую проблему решают координации',
            howNoBefore:'Без координаций: решения потерялись в мессенджере, через неделю ничего не сделано',
            howWithAfter:'С координациями: каждое решение → задача → исполнитель → дедлайн → протокол',
            howBlock2:'8 типов координаций',
            howBlock3:'Повестка дня (6 разделов)',
            howBlock4:'Взаимосвязи с другими модулями',
            howBlock5:'Пошаговый гайд: как провести координацию',
            howBlock6:'Типичные ошибки',
            howBlock7:'Результаты через месяц',
            howErr1:'Совещание без протокола → через неделю никто ничего не помнит',
            howErr2:'Решение без исполнителя → никто не ответственен',
            howErr3:'Эскалация без адресата → вопрос подвисает',
            howStep1:'Открыть координацию → нажать Запустить',
            howStep2:'Статистики: участники озвучивают свои показатели',
            howStep3:'Выполнение: проверяем задачи с прошлой недели',
            howStep4:'Отчёты: каждый участник 2 мин',
            howStep5:'Вопросы: разбираем повестку дня',
            howStep6:'Решения: фиксируем каждое → кнопка Создать задачу',
            howStep7:'Завершить → протокол PDF автоматически',
        },
        pl: {
            title:'Koordynacje', newCoord:'Nowa koordynacja', emptyText:'Brak koordynacji',
            addFirst:'+ Dodaj pierwszą', modalTitle:'Nowa koordynacja', modalEdit:'Edytuj',
            labelName:'Nazwa koordynacji', placeholderName:'Codzienna koordynacja zespołu',
            labelType:'Typ', labelStatus:'Status', statusActive:'Aktywna', statusPaused:'Wstrzymana',
            labelChairman:'Prowadzący', selectChairman:'— Wybierz odpowiedzialnego —',
            labelParticipants:'Uczestnicy', labelDay:'Dzień tygodnia', anyDay:'— Dowolny —',
            labelTime:'Godzina', labelFilter:'Filtr zadań',
            filterFunctions:'Wg funkcji', filterProjects:'Wg projektów',
            filterAssignees:'Wg wykonawców', filterOverdue:'Przeterminowane', filterReview:'Do weryfikacji',
            filterProjectsLabel:'Projekty (multi)', filterProcessesLabel:'Procesy (multi)',
            filterCrmStageLabel:'Etap CRM',
            labelEscal:'Eskalacja do', escalAuto:'— Auto wg typu —',
            escalHint:'Nierozwiązane kwestie trafią wyżej w łańcuchu',
            labelTelegram:'Telegram Chat ID', telegramHint:'Protokół wysyłany automatycznie',
            btnCancel:'Anuluj', btnSave:'Zapisz',
            agendaTitle:'Porządek obrad', agendaHint:'Uczestnicy dodają pytania przed koordynacją',
            btnFinish:'Zakończ', agendaSection:'Porządek obrad', participantsLbl:'Uczestnicy',
            decisionsLbl:'Decyzje', escalLbl:'Eskalacja (nierozwiązane kwestie)',
            protocolTitle:'Protokół koordynacji', protocolsTitle:'Protokoły', noProtocols:'Brak protokołów',
            aiTitle:'Rekomendacje AI', escalated:'Eskalowane',
            statsLbl:'Statystyki uczestników', execLbl:'Realizacja poprzednich zadań',
            reportsLbl:'Raporty uczestników', questionsLbl:'Pytania od uczestników',
            decisionsAgLbl:'Decyzje', tasksAgLbl:'Nowe zadania',
            typeDaily:'Codzienna', typeWeekly:'Cotygodniowa', typeMonthly:'Comiesięczna',
            typeCouncilRec:'Rada doradcza', typeCouncilDir:'Rada dyrektora',
            typeCouncilExe:'Rada wykonawcza', typeCouncilOwn:'Rada założycieli', typeOneoff:'Jednorazowa',
            analyticsTitle:'Analityka',
            statsSummary:'Koordynacji: {total} · Decyzji: {decisions} · Eskalowane: {unresolved} · Śr. czas: {avg}min',
            howItWorks:'Jak to działa', howClose:'Zamknij',
            createTaskBtn:'\u2192 Utwórz zadanie', taskCreatedBadge:'\u2705 Zadanie utworzone',
            taskTitleLbl:'Tytuł zadania', taskAssigneeLbl:'Wykonawca', taskDeadlineLbl:'Termin',
            taskLinkProject:'Powiąż z projektem', taskLinkProcess:'Powiąż z procesem',
            taskLinkCrm:'Powiąż z CRM',
            taskCreateBtn:'Utwórz zadanie', taskCancelBtn:'Anuluj', selectNone:'— Nie wybrano —',
            howBlock1:'Jaki problem rozwiązują koordynacje',
            howNoBefore:'Bez koordynacji: decyzje zagubiły się, tydzień później nic nie zrobiono',
            howWithAfter:'Z koordynacjami: każda decyzja → zadanie → wykonawca → termin → protokół',
            howBlock2:'8 typów koordynacji', howBlock3:'Porządek obrad (6 sekcji)',
            howBlock4:'Powiązania z innymi modułami', howBlock5:'Przewodnik krok po kroku',
            howBlock6:'Typowe błędy', howBlock7:'Wyniki po miesiącu',
            howErr1:'Spotkanie bez protokołu → nikt nic nie pamięta',
            howErr2:'Decyzja bez wykonawcy → nikt nie jest odpowiedzialny',
            howErr3:'Eskalacja bez adresata → kwestia wisi',
            howStep1:'Otwórz koordynację → kliknij Uruchom',
            howStep2:'Statystyki: uczestnicy podają wskaźniki',
            howStep3:'Wykonanie: sprawdzamy zadania z tygodnia',
            howStep4:'Raporty: każdy uczestnik 2 min',
            howStep5:'Pytania: omawiamy porządek obrad',
            howStep6:'Decyzje: zapisujemy każdą → Utwórz zadanie',
            howStep7:'Zakończ → protokół PDF automatycznie',
        },
        en: {
            title:'Coordinations', newCoord:'New Coordination', emptyText:'No coordinations yet',
            addFirst:'+ Add first', modalTitle:'New Coordination', modalEdit:'Edit',
            labelName:'Coordination name', placeholderName:'Daily team coordination',
            labelType:'Type', labelStatus:'Status', statusActive:'Active', statusPaused:'Paused',
            labelChairman:'Coordination lead', selectChairman:'— Select responsible —',
            labelParticipants:'Participants', labelDay:'Day of week', anyDay:'— Any —',
            labelTime:'Start time', labelFilter:'Task filter',
            filterFunctions:'By functions', filterProjects:'By projects',
            filterAssignees:'By assignees', filterOverdue:'Overdue', filterReview:'In review',
            filterProjectsLabel:'Projects (multi-select)', filterProcessesLabel:'Processes (multi-select)',
            filterCrmStageLabel:'CRM stage',
            labelEscal:'Escalate to', escalAuto:'— Auto by type —',
            escalHint:'Unresolved issues will move up the chain',
            labelTelegram:'Telegram Chat ID', telegramHint:'Protocol sent automatically after completion',
            btnCancel:'Cancel', btnSave:'Save',
            agendaTitle:'Agenda', agendaHint:'Participants add questions before coordination',
            btnFinish:'Finish', agendaSection:'Agenda', participantsLbl:'Participants',
            decisionsLbl:'Decisions', escalLbl:'Escalation (unresolved issues)',
            protocolTitle:'Coordination Protocol', protocolsTitle:'Protocols', noProtocols:'No protocols yet',
            aiTitle:'AI Recommendations', escalated:'Escalated',
            statsLbl:'Participant statistics', execLbl:'Previous task completion',
            reportsLbl:'Participant reports', questionsLbl:'Questions from participants',
            decisionsAgLbl:'Decisions', tasksAgLbl:'New tasks',
            typeDaily:'Daily', typeWeekly:'Weekly', typeMonthly:'Monthly',
            typeCouncilRec:'Advisory council', typeCouncilDir:"Director's council",
            typeCouncilExe:'Executive council', typeCouncilOwn:"Founders' council", typeOneoff:'One-off',
            analyticsTitle:'Analytics',
            statsSummary:'Coordinations: {total} · Decisions: {decisions} · Escalated: {unresolved} · Avg: {avg}min',
            howItWorks:'How it works', howClose:'Close',
            createTaskBtn:'\u2192 Create task', taskCreatedBadge:'\u2705 Task created',
            taskTitleLbl:'Task title', taskAssigneeLbl:'Assignee', taskDeadlineLbl:'Deadline',
            taskLinkProject:'Link to project', taskLinkProcess:'Link to process',
            taskLinkCrm:'Link to CRM deal',
            taskCreateBtn:'Create task', taskCancelBtn:'Cancel', selectNone:'— None —',
            howBlock1:'What problem do coordinations solve',
            howNoBefore:'Without coordinations: decisions got lost, a week later nothing is done',
            howWithAfter:'With coordinations: every decision → task → assignee → deadline → protocol',
            howBlock2:'8 coordination types', howBlock3:'Agenda (6 sections)',
            howBlock4:'Connections with other modules', howBlock5:'Step-by-step guide',
            howBlock6:'Common mistakes', howBlock7:'Results after one month',
            howErr1:'Meeting without protocol → nobody remembers anything a week later',
            howErr2:'Decision without assignee → nobody is responsible',
            howErr3:'Escalation without addressee → issue hangs',
            howStep1:'Open coordination → click Start',
            howStep2:'Statistics: participants share their metrics',
            howStep3:'Execution: review tasks from last week',
            howStep4:'Reports: each participant 2 min',
            howStep5:'Questions: work through the agenda',
            howStep6:'Decisions: record each one → Create task button',
            howStep7:'Finish → PDF protocol automatically',
        },
        de: {
            title:'Koordinationen', newCoord:'Neue Koordination', emptyText:'Keine Koordinationen vorhanden',
            addFirst:'+ Erste hinzufügen', modalTitle:'Neue Koordination', modalEdit:'Bearbeiten',
            labelName:'Name der Koordination', placeholderName:'Tägliche Team-Koordination',
            labelType:'Typ', labelStatus:'Status', statusActive:'Aktiv', statusPaused:'Pausiert',
            labelChairman:'Koordinationsleiter', selectChairman:'— Verantwortlichen wählen —',
            labelParticipants:'Teilnehmer', labelDay:'Wochentag', anyDay:'— Beliebig —',
            labelTime:'Startzeit', labelFilter:'Aufgabenfilter',
            filterFunctions:'Nach Funktionen', filterProjects:'Nach Projekten',
            filterAssignees:'Nach Bearbeitern', filterOverdue:'Überfällig', filterReview:'In Überprüfung',
            filterProjectsLabel:'Projekte (Mehrfachauswahl)', filterProcessesLabel:'Prozesse (Mehrfachauswahl)',
            filterCrmStageLabel:'CRM-Stufe',
            labelEscal:'Eskalation an', escalAuto:'— Auto nach Typ —',
            escalHint:'Ungelöste Fragen werden weitergeleitet',
            labelTelegram:'Telegram Chat-ID', telegramHint:'Protokoll wird automatisch gesendet',
            btnCancel:'Abbrechen', btnSave:'Speichern',
            agendaTitle:'Tagesordnung', agendaHint:'Teilnehmer fügen Fragen hinzu',
            btnFinish:'Abschließen', agendaSection:'Tagesordnung', participantsLbl:'Teilnehmer',
            decisionsLbl:'Entscheidungen', escalLbl:'Eskalation (ungelöste Fragen)',
            protocolTitle:'Koordinationsprotokoll', protocolsTitle:'Protokolle', noProtocols:'Noch keine Protokolle',
            aiTitle:'KI-Empfehlungen', escalated:'Eskaliert',
            statsLbl:'Teilnehmerstatistiken', execLbl:'Ausführung früherer Aufgaben',
            reportsLbl:'Berichte der Teilnehmer', questionsLbl:'Fragen der Teilnehmer',
            decisionsAgLbl:'Entscheidungen', tasksAgLbl:'Neue Aufgaben',
            typeDaily:'Täglich', typeWeekly:'Wöchentlich', typeMonthly:'Monatlich',
            typeCouncilRec:'Beratender Rat', typeCouncilDir:'Direktorenrat',
            typeCouncilExe:'Exekutivrat', typeCouncilOwn:'Gründerrat', typeOneoff:'Einmalig',
            analyticsTitle:'Analytik',
            statsSummary:'Koordinationen: {total} · Entscheidungen: {decisions} · Eskaliert: {unresolved} · Ø {avg}Min',
            howItWorks:'Wie es funktioniert', howClose:'Schließen',
            createTaskBtn:'\u2192 Aufgabe erstellen', taskCreatedBadge:'\u2705 Aufgabe erstellt',
            taskTitleLbl:'Aufgabentitel', taskAssigneeLbl:'Bearbeiter', taskDeadlineLbl:'Frist',
            taskLinkProject:'Mit Projekt verknüpfen', taskLinkProcess:'Mit Prozess verknüpfen',
            taskLinkCrm:'Mit CRM-Deal verknüpfen',
            taskCreateBtn:'Aufgabe erstellen', taskCancelBtn:'Abbrechen', selectNone:'— Keine Auswahl —',
            howBlock1:'Welches Problem lösen Koordinationen',
            howNoBefore:'Ohne Koordinationen: Entscheidungen gingen verloren, nichts erledigt',
            howWithAfter:'Mit Koordinationen: jede Entscheidung → Aufgabe → Bearbeiter → Frist → Protokoll',
            howBlock2:'8 Koordinationstypen', howBlock3:'Tagesordnung (6 Abschnitte)',
            howBlock4:'Verbindungen mit anderen Modulen', howBlock5:'Schritt-für-Schritt-Anleitung',
            howBlock6:'Typische Fehler', howBlock7:'Ergebnisse nach einem Monat',
            howErr1:'Besprechung ohne Protokoll → niemand erinnert sich',
            howErr2:'Entscheidung ohne Bearbeiter → niemand ist verantwortlich',
            howErr3:'Eskalation ohne Adressat → Frage hängt',
            howStep1:'Koordination öffnen → Starten klicken',
            howStep2:'Statistiken: Teilnehmer nennen ihre Kennzahlen',
            howStep3:'Ausführung: Aufgaben aus der letzten Woche prüfen',
            howStep4:'Berichte: jeder Teilnehmer 2 Min',
            howStep5:'Fragen: Tagesordnung durcharbeiten',
            howStep6:'Entscheidungen: jede festhalten → Aufgabe erstellen',
            howStep7:'Abschließen → PDF-Protokoll automatisch',
        },
        cs: {
            title:'Koordinace', newCoord:'Nová koordinace', emptyText:'Zatím žádné koordinace',
            addFirst:'+ Přidat první', modalTitle:'Nová koordinace', modalEdit:'Upravit',
            labelName:'Název koordinace', placeholderName:'Každodenní koordinace týmu',
            labelType:'Typ', labelStatus:'Stav', statusActive:'Aktivní', statusPaused:'Pozastaveno',
            labelChairman:'Vedoucí koordinace', selectChairman:'— Vyberte odpovědného —',
            labelParticipants:'Účastníci', labelDay:'Den v týdnu', anyDay:'— Jakýkoli —',
            labelTime:'Čas začátku', labelFilter:'Filtr úkolů',
            filterFunctions:'Dle funkcí', filterProjects:'Dle projektů',
            filterAssignees:'Dle řešitelů', filterOverdue:'Po termínu', filterReview:'V kontrole',
            filterProjectsLabel:'Projekty (multi)', filterProcessesLabel:'Procesy (multi)',
            filterCrmStageLabel:'Fáze CRM',
            labelEscal:'Eskalovat na', escalAuto:'— Automaticky dle typu —',
            escalHint:'Nevyřešené otázky přejdou výše',
            labelTelegram:'Telegram Chat ID', telegramHint:'Protokol se odesílá automaticky',
            btnCancel:'Zrušit', btnSave:'Uložit',
            agendaTitle:'Program jednání', agendaHint:'Účastníci přidávají otázky',
            btnFinish:'Dokončit', agendaSection:'Program jednání', participantsLbl:'Účastníci',
            decisionsLbl:'Rozhodnutí', escalLbl:'Eskalace (nevyřešené otázky)',
            protocolTitle:'Protokol koordinace', protocolsTitle:'Protokoly', noProtocols:'Zatím žádné protokoly',
            aiTitle:'Doporučení AI', escalated:'Eskalováno',
            statsLbl:'Statistiky účastníků', execLbl:'Plnění předchozích úkolů',
            reportsLbl:'Zprávy účastníků', questionsLbl:'Otázky od účastníků',
            decisionsAgLbl:'Rozhodnutí', tasksAgLbl:'Nové úkoly',
            typeDaily:'Denní', typeWeekly:'Týdenní', typeMonthly:'Měsíční',
            typeCouncilRec:'Poradní rada', typeCouncilDir:'Rada ředitele',
            typeCouncilExe:'Výkonná rada', typeCouncilOwn:'Rada zakladatelů', typeOneoff:'Jednorázová',
            analyticsTitle:'Analytika',
            statsSummary:'Koordinací: {total} · Rozhodnutí: {decisions} · Eskalováno: {unresolved} · Prům.: {avg}min',
            howItWorks:'Jak to funguje', howClose:'Zavřít',
            createTaskBtn:'\u2192 Vytvořit úkol', taskCreatedBadge:'\u2705 Úkol vytvořen',
            taskTitleLbl:'Název úkolu', taskAssigneeLbl:'Řešitel', taskDeadlineLbl:'Termín',
            taskLinkProject:'Propojit s projektem', taskLinkProcess:'Propojit s procesem',
            taskLinkCrm:'Propojit s CRM',
            taskCreateBtn:'Vytvořit úkol', taskCancelBtn:'Zrušit', selectNone:'— Nevybráno —',
            howBlock1:'Jaký problém koordinace řeší',
            howNoBefore:'Bez koordinací: rozhodnutí se ztratila, za týden nic hotovo',
            howWithAfter:'S koordinacemi: každé rozhodnutí → úkol → řešitel → termín → protokol',
            howBlock2:'8 typů koordinací', howBlock3:'Program jednání (6 sekcí)',
            howBlock4:'Vazby na další moduly', howBlock5:'Průvodce krok za krokem',
            howBlock6:'Typické chyby', howBlock7:'Výsledky po měsíci',
            howErr1:'Porada bez protokolu → za týden si nikdo nic nepamatuje',
            howErr2:'Rozhodnutí bez řešitele → nikdo není zodpovědný',
            howErr3:'Eskalace bez adresáta → otázka visí',
            howStep1:'Otevřít koordinaci → kliknout Spustit',
            howStep2:'Statistiky: účastníci sdělí ukazatele',
            howStep3:'Plnění: zkontrolujeme úkoly z minulého týdne',
            howStep4:'Zprávy: každý účastník 2 min',
            howStep5:'Otázky: projednáme program',
            howStep6:'Rozhodnutí: zapíšeme každé → Vytvořit úkol',
            howStep7:'Dokončit → PDF protokol automaticky',
        },
    };
    function ct(key) {
        const lang = localStorage.getItem('talko_language') || localStorage.getItem('talko_lang') || 'ua';
        return (COORD_I18N[lang] && COORD_I18N[lang][key]) || COORD_I18N['ua'][key] || key;
    }

    // ── Types ───────────────────────────────────────────────
    const SVGS = {
        sun: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
        cal: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        calR: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
        target: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        zap: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        crown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>',
        bell: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        handshake: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>',
    };
    function si(svg) { return '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;">' + svg + '</span>'; }
    const TYPES = {
        daily:       { get label(){ return ct('typeDaily'); },       icon: si(SVGS.sun),       color:'#f59e0b', duration:20 },
        weekly:      { get label(){ return ct('typeWeekly'); },      icon: si(SVGS.cal),       color:'#3b82f6', duration:60 },
        monthly:     { get label(){ return ct('typeMonthly'); },     icon: si(SVGS.calR),      color:'#8b5cf6', duration:90 },
        council_rec: { get label(){ return ct('typeCouncilRec'); },  icon: si(SVGS.handshake), color:'#06b6d4', duration:60 },
        council_dir: { get label(){ return ct('typeCouncilDir'); },  icon: si(SVGS.target),    color:'#16a34a', duration:60 },
        council_exe: { get label(){ return ct('typeCouncilExe'); },  icon: si(SVGS.zap),       color:'#ef4444', duration:90 },
        council_own: { get label(){ return ct('typeCouncilOwn'); },  icon: si(SVGS.crown),     color:'#d97706', duration:120 },
        oneoff:      { get label(){ return ct('typeOneoff'); },      icon: si(SVGS.bell),      color:'#6b7280', duration:45 },
    };

    const DAYS_UK = [window.t('calSunS'),window.t('calMonS'),window.t('calTueS'),window.t('calWedS'),window.t('calThuS'),window.t('calFriS'),window.t('calSatS')];

    const AGENDA_BASE = [
        { id:'stats',     icon:si('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'), get label(){ return ct('statsLbl'); } },
        { id:'execution', icon:si('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'), get label(){ return ct('execLbl'); } },
        { id:'reports',   icon:si('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>'), get label(){ return ct('reportsLbl'); } },
        { id:'questions', icon:si('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'), get label(){ return ct('questionsLbl'); } },
        { id:'decisions', icon:si(SVGS.zap), get label(){ return ct('decisionsAgLbl'); } },
        { id:'tasks',     icon:si('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'), get label(){ return ct('tasksAgLbl'); } },
    ];

    // ── Helpers ─────────────────────────────────────────────
    const db  = () => firebase.firestore();
    const col = name => db().collection('companies').doc(window.currentCompanyId).collection(name);
    const uid = () => window.currentUser?.uid;
    const isSA = () => (window.currentUser?.email||'') === 'management.talco@gmail.com';
    const isManager = () => {
        if (isSA()) return true;
        const roleEl = document.getElementById('currentUserRole');
        const rt = roleEl ? roleEl.textContent : '';
        if (rt.includes('Власник')||rt.includes('owner')||rt.includes('admin')||rt.includes('Менеджер')||rt.includes('manager')) return true;
        const u = coordUsers.find(x => x.id === uid());
        return u && ['owner','admin','manager'].includes(u.role);
    };
    const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const fmtDate = iso => { if(!iso) return ''; try { return new Date(iso.length===10?iso+'T12:00:00':iso).toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit',year:'numeric'}); } catch{ return iso; } };
    const fmtTime = iso => { if(!iso) return ''; try { return new Date(iso).toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}); } catch{ return ''; } };
    const nowISO  = () => new Date().toISOString();
    const todayStr= () => new Date().toISOString().split('T')[0];
    const toast   = (msg, type='success') => window.showToast && window.showToast(msg, type);
    const XSVG = si('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>');

    // ── Load data ───────────────────────────────────────────
    async function loadCoordData() {
        window.dbg && dbg('[Coord] loadCoordData start, companyId:', window.currentCompanyId);
        if (!window.currentCompanyId) { console.warn('[Coord] no companyId'); return; }
        coordUnsubscribes.forEach(u => u());
        coordUnsubscribes = [];

        const [usSnap, fnSnap, meSnap, prSnap, ptSnap] = await Promise.all([
            col('users').get(),
            col('functions').get(),
            col('metrics').get().catch(() => ({ docs:[] })),
            col('projects').get().catch(() => ({ docs:[] })),
            col('processTemplates').get().catch(() => ({ docs:[] })),
        ]);
        coordUsers             = usSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        coordFunctions         = fnSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        coordMetrics           = meSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        coordProjects          = prSnap.docs.map(d => ({ id:d.id, ...d.data() }));
        coordProcessTemplates  = ptSnap.docs.map(d => ({ id:d.id, ...d.data() }));

        try {
            const crmPipelineCol = window.DB_COLS?.CRM_PIPELINE || 'crm_pipeline';
            const pipSnap = await col(crmPipelineCol).where('isDefault','==',true).limit(1).get();
            if (!pipSnap.empty) coordCrmPipeline = { id:pipSnap.docs[0].id, ...pipSnap.docs[0].data() };
        } catch(e) { console.warn('[Coord] crm pipeline:', e); }

        const taskUnsub = col('tasks')
            .where('status','in',['new','progress','review'])
            .onSnapshot(snap => {
                coordTasks = snap.docs.map(d => ({ id:d.id, ...d.data() }));
                if (activeSession) renderSessionTasks(activeSession.coord);
            }, err => console.error('[Coord] tasks snap error:', err.code));
        coordUnsubscribes.push(taskUnsub);

        const coordUnsub = col('coordinations').onSnapshot(snap => {
            coordinations = snap.docs.map(d => ({ id:d.id, ...d.data() }))
                .sort((a,b) => {
                    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime():0);
                    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime():0);
                    return tb - ta;
                });
            window._coordinations = coordinations;
            renderCoordList();
        }, err => { console.error('[Coord] snap error:', err.code); renderCoordList(); });
        coordUnsubscribes.push(coordUnsub);
    }

    // ── Readiness & Rating ──────────────────────────────────
    async function getReadiness(ids) {
        const today = todayStr();
        const res = {};
        ids.forEach(id => res[id] = { opened:false, name:'?' });
        try {
            await Promise.all(ids.map(async id => {
                const snap = await col('users').doc(id).get();
                if (!snap.exists) return;
                const d = snap.data();
                const ls = d.lastSeen?.toDate?.()?.toISOString?.() || '';
                res[id] = { opened: ls.startsWith(today), name: d.name||d.email||id };
            }));
        } catch(e) { console.warn('[Coord] readiness:', e); }
        return res;
    }

    async function getExecutionRating(ids) {
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        const rating = {};
        try {
            const snap = await col('tasks').where('status','==','done').get();
            const completed = snap.docs.map(d => ({ id:d.id, ...d.data() })).filter(t => {
                const cd = t.completedDate || (t.completedAt?.toDate ? t.completedAt.toDate().toISOString().split('T')[0] : '');
                return cd >= weekAgoStr;
            });
            ids.forEach(id => {
                const mine = coordTasks.filter(t => t.assigneeId === id);
                const done = completed.filter(t => t.assigneeId === id);
                const overdue = mine.filter(t => t.deadlineDate && t.deadlineDate < todayStr());
                const total = mine.length + done.length;
                rating[id] = { total, completed:done.length, overdue:overdue.length, rate: total>0 ? Math.round(done.length/total*100) : 100 };
            });
        } catch(e) { ids.forEach(id => { rating[id] = { total:0, completed:0, overdue:0, rate:100 }; }); }
        return rating;
    }

    // ── Render root ─────────────────────────────────────────
    function renderCoordination() {
        const root = document.getElementById('coordinationRoot');
        if (!root) return;
        root.innerHTML = `
        <div class="page-toolbar">
          <div class="page-toolbar-left">
            <h3 class="page-toolbar-title">
              <i data-lucide="calendar-check" class="icon"></i> ${ct('title')}
              <span id="coordCount" style="background:var(--primary);color:#fff;padding:2px 8px;border-radius:10px;font-size:.78rem;"></span>
            </h3>
          </div>
          <div class="page-toolbar-right">
            <a href="https://chatgpt.com/g/g-695e001cf1c48191a9c08cb8184ff767-ai-coordination-module"
              target="_blank" rel="noopener noreferrer" class="btn-ai hide-mobile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg> AI Асистент
            </a>
            <button id="coordHowBtn" onclick="toggleCoordHowItWorks()" class="btn-howto hide-mobile">
              <i data-lucide="help-circle" style="width:14px;height:14px;"></i> ${ct('howItWorks')}
            </button>
            ${isManager()?`<button class="btn btn-success" onclick="openCoordModal()"><i data-lucide="plus" class="icon"></i> ${ct('newCoord')}</button>`:''}
          </div>
        </div>
        <div style="padding:0 1rem;">
          <div id="coordHowPanel" style="display:none;margin-bottom:1rem;">${buildHowPanel()}</div>
          <div id="coordList"></div>
        </div>
        ${htmlModal()}${htmlSession()}${htmlProtocol()}${htmlAnalysis()}${htmlDynAgenda()}`;
        setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);
        renderCoordList();
    }

    // ── "How It Works" panel ────────────────────────────────
    window.toggleCoordHowItWorks = function() {
        const panel = document.getElementById('coordHowPanel');
        const btn   = document.getElementById('coordHowBtn');
        if (!panel) return;
        const vis = panel.style.display !== 'none';
        panel.style.display = vis ? 'none' : 'block';
        if (btn) { btn.style.background = vis ? '#fff' : '#f0fdf4'; btn.style.borderColor = vis ? '#e5e7eb' : '#22c55e'; btn.style.color = vis ? '#6b7280' : '#16a34a'; }
        setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);
    };

    function buildHowPanel() {
        const b = 'background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;padding:1rem 1.1rem;margin-bottom:.75rem;';
        const t = 'font-weight:700;font-size:.88rem;color:#1a1a1a;margin-bottom:.6rem;display:flex;align-items:center;gap:.4rem;';
        const steps = ['howStep1','howStep2','howStep3','howStep4','howStep5','howStep6','howStep7'].map(k => ct(k));
        const errs  = ['howErr1','howErr2','howErr3'].map(k => ct(k));
        return `
<div style="background:linear-gradient(135deg,#f0fdf4,#eff6ff);border-radius:16px;padding:1.1rem;border:2px solid #bbf7d0;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
    <div style="font-weight:800;font-size:1rem;color:#16a34a;display:flex;align-items:center;gap:.5rem;">
      <i data-lucide="help-circle" style="width:18px;height:18px;color:#16a34a;"></i> ${ct('howItWorks')}
    </div>
    <button onclick="toggleCoordHowItWorks()" style="background:#fff;border:1.5px solid #e5e7eb;border-radius:8px;padding:.25rem .65rem;font-size:.78rem;cursor:pointer;color:#6b7280;">${ct('howClose')}</button>
  </div>
  <div style="${b}">
    <div style="${t}"><i data-lucide="alert-circle" style="width:15px;height:15px;color:#ef4444;"></i>${ct('howBlock1')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
      <div style="background:#fef2f2;border-radius:10px;padding:.65rem;border:1.5px solid #fecaca;font-size:.72rem;font-weight:700;color:#ef4444;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></span> ${esc(ct('howNoBefore'))}</div>
      <div style="background:#f0fdf4;border-radius:10px;padding:.65rem;border:1.5px solid #bbf7d0;font-size:.72rem;font-weight:700;color:#16a34a;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span> ${esc(ct('howWithAfter'))}</div>
    </div>
  </div>
  <div style="${b}">
    <div style="${t}"><i data-lucide="layout-grid" style="width:15px;height:15px;color:#3b82f6;"></i>${ct('howBlock2')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:.4rem;font-size:.73rem;">
      <span style="background:#f0fdf4;color:#16a34a;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></span> ${esc(ct('typeDaily'))} (20хв)</span>
      <span style="background:#eff6ff;color:#1d4ed8;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span> ${esc(ct('typeWeekly'))} (60хв)</span>
      <span style="background:#f5f3ff;color:#6d28d9;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg></span> ${esc(ct('typeMonthly'))} (90хв)</span>
      <span style="background:#fef3c7;color:#92400e;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg></span> ${esc(ct('typeCouncilRec'))}</span>
      <span style="background:#f0fdf4;color:#16a34a;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span> ${esc(ct('typeCouncilDir'))}</span>
      <span style="background:#fef2f2;color:#991b1b;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> ${esc(ct('typeCouncilExe'))}</span>
      <span style="background:#fef3c7;color:#92400e;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg></span> ${esc(ct('typeCouncilOwn'))}</span>
      <span style="background:#f3f4f6;color:#374151;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span> ${esc(ct('typeOneoff'))}</span>
    </div>
  </div>
  <div style="${b}">
    <div style="${t}"><i data-lucide="list-checks" style="width:15px;height:15px;color:#8b5cf6;"></i>${ct('howBlock3')}</div>
    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:.3rem;font-size:.73rem;">
      <span style="background:#eff6ff;color:#1d4ed8;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> 1. ${ct('statsLbl')}</span>
      <span style="color:#9ca3af;">→</span>
      <span style="background:#f0fdf4;color:#16a34a;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span> 2. ${ct('execLbl')}</span>
      <span style="color:#9ca3af;">→</span>
      <span style="background:#fef3c7;color:#92400e;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span> 3. ${ct('reportsLbl')}</span>
      <span style="color:#9ca3af;">→</span>
      <span style="background:#f5f3ff;color:#6d28d9;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span> 4. ${ct('questionsLbl')}</span>
      <span style="color:#9ca3af;">→</span>
      <span style="background:#f0fdf4;color:#16a34a;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> 5. ${ct('decisionsAgLbl')}</span>
      <span style="color:#9ca3af;">→</span>
      <span style="background:#eff6ff;color:#1d4ed8;padding:.15rem .5rem;border-radius:6px;font-weight:600;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/></svg></span> 6. ${ct('tasksAgLbl')}</span>
    </div>
  </div>
  <div style="${b}">
    <div style="${t}"><i data-lucide="git-branch" style="width:15px;height:15px;color:#06b6d4;"></i>${ct('howBlock4')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:.5rem;font-size:.73rem;">
      <div style="background:#f0fdf4;border-radius:8px;padding:.55rem;border:1px solid #d1fae5;"><b style="color:#16a34a;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> ${ct('decisionsLbl')} → ${ct('tasksAgLbl')}</b><br>+ Проект · Процес · CRM угода</div>
      <div style="background:#eff6ff;border-radius:8px;padding:.55rem;border:1px solid #bfdbfe;"><b style="color:#1d4ed8;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> Статистики → Метрики</b><br>Аналітика / Статистики</div>
      <div style="background:#fef3c7;border-radius:8px;padding:.55rem;border:1px solid #fde68a;"><b style="color:#92400e;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg></span> Виконання → Задачі</b><br>Живі дані учасників</div>
      <div style="background:#f5f3ff;border-radius:8px;padding:.55rem;border:1px solid #ddd6fe;"><b style="color:#6d28d9;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span> Протокол → PDF</b><br>Telegram автоматично</div>
      <div style="background:#fef2f2;border-radius:8px;padding:.55rem;border:1px solid #fecaca;"><b style="color:#991b1b;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></span> Ескалація</b><br>→ Вища координація</div>
    </div>
  </div>
  <div style="${b}">
    <div style="${t}"><i data-lucide="play-circle" style="width:15px;height:15px;color:#22c55e;"></i>${ct('howBlock5')}</div>
    <div style="display:flex;flex-direction:column;gap:.3rem;">
      ${steps.map((s,i) => `<div style="display:flex;align-items:flex-start;gap:.5rem;padding:.3rem .4rem;border-radius:6px;background:${i===5?'#f0fdf4':'#f9fafb'};border:1px solid ${i===5?'#bbf7d0':'#f0f0f0'};"><span style="background:${i===5?'#22c55e':'#e5e7eb'};color:${i===5?'#fff':'#6b7280'};width:18px;height:18px;border-radius:50%;font-size:.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</span><span style="font-size:.78rem;color:#374151;">${esc(s)}</span></div>`).join('')}
    </div>
  </div>
  <div style="${b}">
    <div style="${t}"><i data-lucide="alert-triangle" style="width:15px;height:15px;color:#f59e0b;"></i>${ct('howBlock6')}</div>
    <div style="display:flex;flex-direction:column;gap:.3rem;">
      ${errs.map(e => `<div style="display:flex;gap:.5rem;padding:.3rem .5rem;background:#fef3c7;border-radius:7px;border:1px solid #fde68a;"><span style="color:#d97706;font-weight:700;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span></span><span style="font-size:.78rem;color:#92400e;">${esc(e)}</span></div>`).join('')}
    </div>
  </div>
  <div style="background:linear-gradient(135deg,#16a34a,#22c55e);border-radius:14px;padding:1rem;">
    <div style="font-weight:700;font-size:.88rem;color:#fff;margin-bottom:.55rem;display:flex;align-items:center;gap:.4rem;"><i data-lucide="trending-up" style="width:15px;height:15px;color:#fff;"></i>${ct('howBlock7')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.45rem;">
      ${[['95%','рішень виконуються'],['-40%','часу на де результат'],['×2','швидкість реакції'],['100%','рішень зафіксовані']].map(([v,l]) => `<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:.5rem;text-align:center;"><div style="font-size:1.2rem;font-weight:800;color:#fff;">${v}</div><div style="font-size:.7rem;color:rgba(255,255,255,.85);">${l}</div></div>`).join('')}
    </div>
  </div>
  <!-- AI Assistant CTA -->
  <div style="margin-top:.75rem;background:#fff;border-radius:14px;border:1.5px solid #8b5cf6;padding:.9rem 1.1rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">
    <div style="flex:1;min-width:180px;">
      <div style="font-weight:700;font-size:.88rem;color:#1a1a1a;margin-bottom:.2rem;display:flex;align-items:center;gap:.4rem;">
        <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span>
        AI Coordination Assistant
      </div>
      <div style="font-size:.78rem;color:#6b7280;">Запитайте AI — які координації потрібні вашому бізнесу, як їх налаштувати та з чого почати</div>
    </div>
    <a href="https://chatgpt.com/g/g-695e001cf1c48191a9c08cb8184ff767-ai-coordination-module"
       target="_blank" rel="noopener noreferrer"
       style="padding:.5rem 1.2rem;font-size:.83rem;border-radius:10px;border:none;background:#6d28d9;color:#fff;cursor:pointer;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:.4rem;white-space:nowrap;flex-shrink:0;">
      <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
      Запитати AI
    </a>
  </div>
</div>`;
    }

    function renderCoordList() {
        const el = document.getElementById('coordList');
        const ce = document.getElementById('coordCount');
        if (!el) return;
        if (ce) ce.textContent = coordinations.length;
        if (!coordinations.length) {
            el.innerHTML = `<div style="text-align:center;padding:3rem 1rem;"><div style="display:flex;justify-content:center;margin-bottom:.75rem;"><i data-lucide="calendar-x" style="width:48px;height:48px;color:#d1d5db;"></i></div><p style="color:#6b7280;margin:0 0 1rem;">${ct('emptyText')}</p>${isManager()?`<button class="btn btn-success" onclick="openCoordModal()">${ct('addFirst')}</button>`:''}</div>`;
            return;
        }
        const groups = {};
        coordinations.forEach(c => { const g = TYPES[c.type]?.label||window.t('finOth2'); if(!groups[g]) groups[g]=[]; groups[g].push(c); });
        let html = '';
        Object.entries(groups).forEach(([g,items]) => {
            html += `<div style="margin-bottom:1.5rem;"><div style="font-size:.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem;">${esc(g)}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:.7rem;">${items.map(coordCard).join('')}</div></div>`;
        });
        el.innerHTML = html;
        setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);
    }

    function coordCard(c) {
        const type    = TYPES[c.type]||{ label:c.type, icon:'', color:'#6b7280', duration:60 };
        const chair   = coordUsers.find(u => u.id === c.chairmanId);
        const chairName = chair ? (chair.name || chair.email || '—') : (c.chairmanName || '—');
        const chairInitial = chairName[0]?.toUpperCase() || '?';
        const participants = (c.participantIds||[]).map(pid => coordUsers.find(u=>u.id===pid)).filter(Boolean);
        const cnt     = participants.length;
        const sched   = c.schedule?.day != null && c.schedule?.time
            ? `${DAYS_UK[c.schedule.day]||''} ${c.schedule.time}`
            : (c.schedule?.time||'');
        const active  = c.status !== 'paused';
        const dynCnt  = (c.dynamicAgenda||[]).length;
        const escalType = ESCALATION_CHAIN[c.type];
        const hasEscalated = (escalType && coordinations.find(x=>x.type===escalType)) || c.escalTargetId;
        // Колір лівого бордера по типу
        const borderLeft = `4px solid ${type.color}`;

        return `<div style="background:#fff;border-radius:16px;border:1px solid #f0f0f0;border-left:${borderLeft};
            box-shadow:0 2px 8px rgba(0,0,0,.04);transition:all .18s;cursor:default;overflow:hidden;"
            onmouseenter="this.style.boxShadow='0 6px 20px rgba(0,0,0,.09)';this.style.transform='translateY(-1px)'"
            onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,.04)';this.style.transform='none'">

          <!-- Кольоровий топ-бар -->
          <div style="background:${type.color}10;padding:.65rem 1rem .55rem;border-bottom:1px solid ${type.color}20;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;">
              <div style="display:flex;align-items:center;gap:.55rem;flex:1;min-width:0;">
                <span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:${type.color}22;flex-shrink:0;">
                  <i data-lucide="${COORD_LUCIDE_ICONS[c.type]||'calendar'}" style="width:16px;height:16px;color:${type.color};"></i>
                </span>
                <div style="min-width:0;">
                  <div style="font-weight:700;font-size:.88rem;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(c.name)}">${esc(c.name)}</div>
                  <div style="font-size:.68rem;font-weight:600;color:${type.color};margin-top:1px;">${type.label}</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:.2rem;flex-shrink:0;">
                <span style="display:flex;align-items:center;gap:3px;font-size:.68rem;color:${active?'#16a34a':'#b45309'};background:${active?'#f0fdf4':'#fef3c7'};padding:2px 7px;border-radius:10px;font-weight:600;">
                  <span style="width:5px;height:5px;border-radius:50%;background:${active?'#22c55e':'#f59e0b'};display:inline-block;"></span>
                  ${active?'Активна':'Пауза'}
                </span>
                ${isManager()?`<button onclick="openCoordModal('${c.id}')" style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:3px;border-radius:6px;" onmouseenter="this.style.color='#374151'" onmouseleave="this.style.color='#9ca3af'"><i data-lucide="pencil" style="width:13px;height:13px;"></i></button>
                <button onclick="deleteCoord('${c.id}')" style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:3px;border-radius:6px;" onmouseenter="this.style.color='#ef4444'" onmouseleave="this.style.color='#fca5a5'"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button>`:''}
              </div>
            </div>
          </div>

          <!-- Тіло картки -->
          <div style="padding:.7rem 1rem;">

            <!-- Розклад + тривалість -->
            <div style="display:flex;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap;">
              ${sched?`<div style="display:flex;align-items:center;gap:4px;background:#f3f4f6;border-radius:8px;padding:3px 9px;font-size:.72rem;color:#374151;font-weight:600;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${esc(sched)}
              </div>`:''}
              <div style="display:flex;align-items:center;gap:4px;background:#f3f4f6;border-radius:8px;padding:3px 9px;font-size:.72rem;color:#6b7280;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ~${type.duration} хв
              </div>
              ${dynCnt?`<div style="display:flex;align-items:center;gap:4px;background:#fef3c7;border-radius:8px;padding:3px 9px;font-size:.72rem;color:#b45309;font-weight:600;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ${dynCnt} питань
              </div>`:''}
              ${hasEscalated?`<div style="background:#fdf4ff;border-radius:8px;padding:3px 9px;font-size:.68rem;color:#7c3aed;">↑ ${window.t('escalationArrow2')||'ескалація'}</div>`:''}
            </div>

            <!-- Голова + учасники -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;">
              <div style="display:flex;align-items:center;gap:.4rem;">
                <div style="width:22px;height:22px;border-radius:50%;background:${type.color};display:flex;align-items:center;justify-content:center;font-size:.62rem;font-weight:700;color:#fff;flex-shrink:0;">${chairInitial}</div>
                <span style="font-size:.75rem;color:#374151;font-weight:500;">${esc((chairName||'').split(' ')[0])}</span>
              </div>
              <!-- Аватари учасників -->
              <div style="display:flex;align-items:center;">
                ${participants.slice(0,4).map((u,i) => `<div style="width:22px;height:22px;border-radius:50%;background:#${['6366f1','f59e0b','22c55e','0ea5e9'][i%4]};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:.58rem;font-weight:700;color:#fff;margin-left:${i?'-6':'0'}px;flex-shrink:0;" title="${esc(u.name||u.email)}">${(u.name||u.email||'?')[0].toUpperCase()}</div>`).join('')}
                ${cnt>4?`<div style="width:22px;height:22px;border-radius:50%;background:#e5e7eb;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:.58rem;color:#6b7280;margin-left:-6px;">+${cnt-4}</div>`:''}
              </div>
            </div>
          </div>

          <!-- Кнопки дій -->
          <div style="padding:.5rem .75rem .65rem;border-top:1px solid #f3f4f6;display:flex;gap:.4rem;">
            <button onclick="startCoordSession('${c.id}')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:.45rem;border-radius:10px;border:none;background:#22c55e;color:#fff;font-size:.8rem;font-weight:700;cursor:pointer;transition:background .15s;" onmouseenter="this.style.background='#16a34a'" onmouseleave="this.style.background='#22c55e'">
              <i data-lucide="play" style="width:13px;height:13px;"></i> Розпочати
            </button>
            <button onclick="openDynAgenda('${c.id}')" style="display:flex;align-items:center;justify-content:center;padding:.45rem .65rem;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;color:#6b7280;transition:all .15s;" onmouseenter="this.style.borderColor='#22c55e';this.style.color='#16a34a'" onmouseleave="this.style.borderColor='#e5e7eb';this.style.color='#6b7280'" title="Порядок денний">
              <i data-lucide="list" style="width:14px;height:14px;"></i>
            </button>
            <button onclick="viewCoordHistory('${c.id}')" style="display:flex;align-items:center;justify-content:center;padding:.45rem .65rem;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;color:#6b7280;transition:all .15s;" onmouseenter="this.style.borderColor='#6366f1';this.style.color='#6366f1'" onmouseleave="this.style.borderColor='#e5e7eb';this.style.color='#6b7280'" title="Протоколи">
              ${si('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>')}
            </button>
          </div>
        </div>`;
    }

    // ── Modal HTML ──────────────────────────────────────────
    function htmlModal() {
        const uOpts = coordUsers.map(u => `<option value="${u.id}">${esc(u.name||u.email)}</option>`).join('');
        const cOpts = coordinations.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
        const prOpts = coordProjects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
        const ptOpts = coordProcessTemplates.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
        const crmStageOpts = (coordCrmPipeline?.stages||[]).map(s => `<option value="${s.id}">${esc(s.label||s.id)}</option>`).join('');
        const fs = 'width:100%;box-sizing:border-box;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:14px;font-size:.95rem;background:#fff;outline:none;color:#1a1a1a;';
        const ls = 'display:block;font-size:.82rem;font-weight:600;color:#6b7280;margin-bottom:.4rem;';
        const ms = 'width:100%;box-sizing:border-box;padding:.5rem .75rem;border:1.5px solid #e5e7eb;border-radius:14px;font-size:.85rem;background:#fff;outline:none;color:#1a1a1a;min-height:70px;';
        return `<div id="coordModal" class="modal" role="dialog" aria-modal="true" style="display:none;">
          <div class="modal-content" style="max-width:560px;max-height:94vh;overflow-y:auto;padding:1.75rem;border-radius:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;">
              <h2 id="coordModalTitle" style="margin:0;font-size:1.25rem;font-weight:700;color:#1a1a1a;">${ct('modalTitle')}</h2>
              <button onclick="closeCoordModal()" style="background:#f3f4f6;border:none;cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:1rem;color:#6b7280;display:flex;align-items:center;justify-content:center;">${XSVG}</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:1.25rem;">
              <div><label style="${ls}">${ct('labelName')}</label><input id="coordName" type="text" placeholder="${ct('placeholderName')}" style="${fs}" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'"></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div><label style="${ls}">${ct('labelType')}</label><select id="coordType" style="${fs}cursor:pointer;">${Object.entries(TYPES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></div>
                <div><label style="${ls}">${ct('labelStatus')}</label><select id="coordStatus" style="${fs}cursor:pointer;"><option value="active">${ct('statusActive')}</option><option value="paused">${ct('statusPaused')}</option></select></div>
              </div>
              <div><label style="${ls}">${ct('labelChairman')}</label><select id="coordChairman" style="${fs}cursor:pointer;"><option value="">${ct('selectChairman')}</option>${uOpts}</select></div>
              <div><label style="${ls}">${ct('labelParticipants')}</label>
                <div id="coordParticipants" style="display:flex;flex-wrap:wrap;gap:.5rem;padding:.75rem;border:1.5px solid #e5e7eb;border-radius:14px;min-height:52px;background:#fafafa;">
                  ${coordUsers.map(u => `<label style="display:flex;align-items:center;gap:.4rem;padding:.35rem .7rem;background:#fff;border-radius:10px;cursor:pointer;font-size:.85rem;border:1.5px solid #e5e7eb;" onmouseenter="this.style.borderColor='#22c55e';this.style.background='#f0fdf4'" onmouseleave="this.style.borderColor='#e5e7eb';this.style.background='#fff'"><input type="checkbox" class="coord-participant-cb" value="${u.id}" style="width:16px;height:16px;accent-color:#22c55e;">${esc(u.name||u.email)}</label>`).join('')}
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div><label style="${ls}">${ct('labelDay')}</label><select id="coordDay" style="${fs}cursor:pointer;"><option value="">${ct('anyDay')}</option>${DAYS_UK.map((d,i) => `<option value="${i}">${d}</option>`).join('')}</select></div>
                <div><label style="${ls}">${ct('labelTime')}</label><input id="coordTime" type="time" style="${fs}" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'"></div>
              </div>
              <!-- Task filters -->
              <div>
                <label style="${ls}">${ct('labelFilter')}</label>
                <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.6rem;">
                  ${[['filterFunctions',ct('filterFunctions')],['filterProjects',ct('filterProjects')],['filterAssignees',ct('filterAssignees')],['filterOverdue',ct('filterOverdue')],['filterReview',ct('filterReview')]].map(([id,l]) => `<label style="display:flex;align-items:center;gap:.4rem;padding:.4rem .75rem;background:#f0fdf4;border-radius:10px;cursor:pointer;font-size:.85rem;border:1.5px solid #d1fae5;"><input type="checkbox" id="coord_${id}" style="width:15px;height:15px;accent-color:#22c55e;">${l}</label>`).join('')}
                </div>
                <div style="background:#f9fafb;border-radius:12px;padding:.75rem;border:1px solid #e5e7eb;display:flex;flex-direction:column;gap:.55rem;">
                  <div style="font-size:.75rem;font-weight:700;color:#6b7280;">Розширені фільтри</div>
                  ${prOpts ? `<div><label style="${ls}margin-bottom:.25rem;">${ct('filterProjectsLabel')}</label><select id="coord_filterProjectIds" multiple style="${ms}"><option value="">${ct('selectNone')}</option>${prOpts}</select><div style="font-size:.68rem;color:#9ca3af;margin-top:.2rem;">Ctrl/Cmd+click для вибору кількох</div></div>` : ''}
                  ${ptOpts ? `<div><label style="${ls}margin-bottom:.25rem;">${ct('filterProcessesLabel')}</label><select id="coord_filterProcessIds" multiple style="${ms}"><option value="">${ct('selectNone')}</option>${ptOpts}</select></div>` : ''}
                  ${crmStageOpts ? `<div><label style="${ls}margin-bottom:.25rem;">${ct('filterCrmStageLabel')}</label><select id="coord_filterCrmStage" style="${fs}cursor:pointer;"><option value="">${ct('selectNone')}</option>${crmStageOpts}</select></div>` : ''}
                </div>
              </div>
              <div><label style="${ls}">${ct('labelEscal')}</label><select id="coordEscalTarget" style="${fs}cursor:pointer;"><option value="">${ct('escalAuto')}</option>${cOpts}</select><div style="font-size:.75rem;color:#9ca3af;margin-top:.35rem;">${ct('escalHint')}</div></div>
              <div><label style="${ls}">${ct('labelTelegram')}</label><input id="coordTelegramChat" type="text" placeholder="-100xxxxxxxxxx" style="${fs}" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'"><div style="font-size:.75rem;color:#9ca3af;margin-top:.35rem;">${ct('telegramHint')}</div></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:.5rem;">
                <button onclick="closeCoordModal()" style="padding:.85rem;border-radius:14px;border:1.5px solid #e5e7eb;background:#fff;font-size:.95rem;font-weight:600;color:#6b7280;cursor:pointer;">${ct('btnCancel')}</button>
                <button onclick="saveCoord()" style="padding:.85rem;border-radius:14px;border:none;background:#22c55e;font-size:.95rem;font-weight:700;color:#fff;cursor:pointer;">${ct('btnSave')}</button>
              </div>
            </div>
          </div>
        </div>`;
    }

    function htmlDynAgenda() {
        return `<div id="coordDynAgendaModal" class="modal" role="dialog" style="display:none;z-index:10015;">
          <div class="modal-content" style="max-width:480px;width:90vw;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
              <h2 id="dynAgendaTitle" style="margin:0;font-size:1rem;font-weight:700;"><i data-lucide="list-checks" style="width:14px;height:14px;margin-right:4px;vertical-align:-2px;"></i>${ct('agendaTitle')}</h2>
              <button onclick="closeDynAgenda()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;line-height:1;">&times;</button>
            </div>
            <div style="font-size:.78rem;color:#6b7280;margin-bottom:.6rem;padding:.5rem .65rem;background:#f9fafb;border-radius:8px;">${ct('agendaHint')}</div>
            <div id="dynAgendaList" style="display:flex;flex-direction:column;gap:.3rem;margin-bottom:.6rem;min-height:40px;"></div>
            <div style="display:flex;gap:.4rem;">
              <input id="dynAgendaInput" type="text" class="form-control" placeholder="Ваше питання..." style="flex:1;font-size:.85rem;" onkeydown="if(event.key==='Enter')addDynAgendaItem()">
              <button onclick="addDynAgendaItem()" class="btn btn-success" style="white-space:nowrap;">Додати</button>
            </div>
          </div>
        </div>`;
    }

    function htmlSession() {
        const uOpts = `<option value="">${ct('selectNone')}</option>` + coordUsers.map(u => `<option value="${u.id}">${esc(u.name||u.email)}</option>`).join('');
        const prOpts = `<option value="">${ct('selectNone')}</option>` + coordProjects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
        const ptOpts = `<option value="">${ct('selectNone')}</option>` + coordProcessTemplates.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
        const mf = 'width:100%;box-sizing:border-box;padding:.38rem .6rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.78rem;background:#fff;outline:none;color:#1a1a1a;';
        return `<div id="coordSessionModal" class="modal" role="dialog" aria-modal="true" style="display:none;z-index:10020;">
          <div class="modal-content" style="max-width:920px;width:96vw;max-height:96vh;overflow-y:auto;padding:1.2rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;border-bottom:2px solid #f0fdf4;padding-bottom:.7rem;margin-bottom:1rem;">
              <div><h2 id="coordSessionTitle" style="margin:0 0 .2rem;font-size:1rem;"></h2><div id="coordReadinessBar" style="font-size:.73rem;color:#6b7280;"></div></div>
              <div style="display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;">
                <span id="coordTimer" style="font-size:1.15rem;font-weight:700;color:#16a34a;font-variant-numeric:tabular-nums;background:#f0fdf4;padding:.18rem .55rem;border-radius:8px;">00:00</span>
                <button onclick="finishCoordSession()" class="btn btn-success" style="padding:.38rem .9rem;font-size:.82rem;"><i data-lucide="check-circle" style="width:14px;height:14px;margin-right:4px;"></i>${ct('btnFinish')}</button>
                <button onclick="closeCoordSession()" style="background:none;border:none;cursor:pointer;color:#9ca3af;">${XSVG}</button>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:1.1rem;">
              <div>
                <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="list-checks" style="width:12px;height:12px;margin-right:4px;"></i>${ct('agendaSection')}</div>
                <div id="coordAgenda" style="display:flex;flex-direction:column;gap:.3rem;margin-bottom:1rem;"></div>
                <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="users" style="width:12px;height:12px;margin-right:4px;"></i>${ct('participantsLbl')}</div>
                <div id="coordParticipantRatings" style="display:flex;flex-direction:column;gap:.35rem;"></div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;">
                  <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;"><i data-lucide="check-square" style="width:12px;height:12px;margin-right:4px;"></i>Завдання</div>
                  <button onclick="openAddTaskFromCoord()" style="background:#f0fdf4;border:1.5px solid #22c55e;color:#16a34a;border-radius:7px;padding:.18rem .5rem;font-size:.72rem;cursor:pointer;">+ Завдання</button>
                </div>
                <div id="coordTaskList" style="display:flex;flex-direction:column;gap:.28rem;max-height:230px;overflow-y:auto;margin-bottom:.9rem;"></div>
                <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="bar-chart-2" style="width:12px;height:12px;margin-right:4px;"></i>Метрики</div>
                <div id="coordMetricsList" style="display:flex;flex-direction:column;gap:.28rem;max-height:150px;overflow-y:auto;"></div>
              </div>
            </div>
            <!-- Decisions + Create Task mini-form -->
            <div style="margin-top:.8rem;border-top:1px solid #f0f0f0;padding-top:.7rem;">
              <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="zap" style="width:12px;height:12px;margin-right:4px;"></i>${ct('decisionsLbl')}</div>
              <div id="coordDecisions" style="display:flex;flex-direction:column;gap:.28rem;margin-bottom:.45rem;"></div>
              <!-- Mini task creation form (hidden) -->
              <div id="coordCreateTaskForm" style="display:none;background:#f0fdf4;border:1.5px solid #22c55e;border-radius:12px;padding:.8rem;margin-bottom:.55rem;">
                <div style="font-weight:700;font-size:.78rem;color:#16a34a;margin-bottom:.55rem;display:flex;align-items:center;gap:.4rem;"><i data-lucide="plus-circle" style="width:12px;height:12px;"></i>${ct('createTaskBtn')}</div>
                <input type="hidden" id="coordTaskDecisionIdx">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.4rem;">
                  <div><div style="font-size:.72rem;font-weight:600;color:#6b7280;margin-bottom:.2rem;">${ct('taskTitleLbl')}</div><input id="coordTaskTitle" type="text" style="${mf}" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'"></div>
                  <div><div style="font-size:.72rem;font-weight:600;color:#6b7280;margin-bottom:.2rem;">${ct('taskAssigneeLbl')}</div><select id="coordTaskAssignee" style="${mf}cursor:pointer;">${uOpts}</select></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.4rem;">
                  <div><div style="font-size:.72rem;font-weight:600;color:#6b7280;margin-bottom:.2rem;">${ct('taskDeadlineLbl')}</div><input id="coordTaskDeadline" type="date" style="${mf}"></div>
                  <div><div style="font-size:.72rem;font-weight:600;color:#6b7280;margin-bottom:.2rem;">${ct('taskLinkProject')}</div><select id="coordTaskProject" style="${mf}cursor:pointer;">${prOpts}</select></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.55rem;">
                  <div><div style="font-size:.72rem;font-weight:600;color:#6b7280;margin-bottom:.2rem;">${ct('taskLinkProcess')}</div><select id="coordTaskProcess" style="${mf}cursor:pointer;">${ptOpts}</select></div>
                  <div><div style="font-size:.72rem;font-weight:600;color:#6b7280;margin-bottom:.2rem;">${ct('taskLinkCrm')}</div><select id="coordTaskCrm" style="${mf}cursor:pointer;"><option value="">${ct('selectNone')}</option></select></div>
                </div>
                <div style="display:flex;gap:.4rem;">
                  <button onclick="submitCoordTask()" class="btn btn-success" style="flex:1;padding:.38rem;font-size:.78rem;"><i data-lucide="check" style="width:12px;height:12px;margin-right:3px;"></i>${ct('taskCreateBtn')}</button>
                  <button onclick="cancelCoordTaskForm()" style="flex:1;padding:.38rem;font-size:.78rem;background:#fff;border:1.5px solid #e5e7eb;border-radius:8px;cursor:pointer;color:#6b7280;">${ct('taskCancelBtn')}</button>
                </div>
              </div>
              <div style="display:flex;gap:.45rem;">
                <input id="coordNewDecision" type="text" class="form-control" placeholder="${window.t('coordZafiksuvRishennya')}" style="flex:1;font-size:.83rem;" onkeydown="if(event.key==='Enter')addCoordDecision()">
                <button onclick="addCoordDecision()" class="btn btn-success" style="padding:.35rem .65rem;font-size:.8rem;">Додати</button>
              </div>
            </div>
            <!-- Unresolved -->
            <div style="margin-top:.8rem;border-top:1px solid #f0f0f0;padding-top:.7rem;">
              <div style="font-weight:700;font-size:.78rem;color:#d97706;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="arrow-up-circle" style="width:12px;height:12px;margin-right:4px;color:#d97706;"></i>${ct('escalLbl')}</div>
              <div id="coordUnresolved" style="display:flex;flex-direction:column;gap:.28rem;margin-bottom:.45rem;"></div>
              <div style="display:flex;gap:.45rem;">
                <input id="coordNewUnresolved" type="text" class="form-control" placeholder="${window.t('coordPytannyaShchoPotrebuye')}" style="flex:1;font-size:.83rem;" onkeydown="if(event.key==='Enter')addUnresolved()">
                <button onclick="addUnresolved()" class="btn" style="padding:.35rem .65rem;font-size:.8rem;background:#fef3c7;border:1.5px solid #fbbf24;color:#92400e;">Додати</button>
              </div>
            </div>
            <!-- Notes -->
            <div style="margin-top:.8rem;border-top:1px solid #f0f0f0;padding-top:.7rem;">
              <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.35rem;"><i data-lucide="file-text" style="width:12px;height:12px;margin-right:4px;"></i>Нотатки голови</div>
              <textarea id="coordNotes" class="form-control" rows="2" placeholder="Нотатки..." style="width:100%;box-sizing:border-box;resize:vertical;font-size:.83rem;"></textarea>
            </div>
          </div>
        </div>`;
    }

    function htmlProtocol() {
        return `<div id="coordProtocolModal" class="modal" role="dialog" aria-modal="true" style="display:none;z-index:10030;">
          <div class="modal-content" style="max-width:680px;max-height:92vh;overflow-y:auto;padding:1.4rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem;flex-wrap:wrap;gap:.45rem;">
              <h2 style="margin:0;font-size:1rem;">${si('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>')} ${ct('protocolTitle')}</h2>
              <div style="display:flex;gap:.35rem;flex-wrap:wrap;">
                <button onclick="sendProtocolToTelegram()" style="padding:.3rem .65rem;font-size:.76rem;background:#2b9ef4;color:#fff;border:none;border-radius:7px;cursor:pointer;">Telegram</button>
                <button onclick="exportCoordHistoryExcel()" style="padding:.3rem .65rem;font-size:.76rem;background:#16a34a;color:#fff;border:none;border-radius:7px;cursor:pointer;">Excel</button>
                <button onclick="printProtocol()" style="padding:.3rem .65rem;font-size:.76rem;background:#f3f4f6;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;">PDF</button>
                <button onclick="closeProtocolModal()" style="background:none;border:none;cursor:pointer;color:#9ca3af;">${XSVG}</button>
              </div>
            </div>
            <div id="coordProtocolContent"></div>
          </div>
        </div>`;
    }

    function htmlAnalysis() {
        return `<div id="coordAnalysisModal" class="modal" role="dialog" style="display:none;z-index:10025;">
          <div class="modal-content" style="max-width:620px;max-height:90vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
              <h2 style="margin:0;font-size:1rem;">AI Аналіз координацій</h2>
              <button onclick="closeCoordAnalysis()" style="background:none;border:none;cursor:pointer;color:#9ca3af;">${XSVG}</button>
            </div>
            <div id="coordAnalysisContent" style="min-height:180px;"></div>
            <div style="margin-top:1rem;display:flex;gap:.5rem;">
              <button onclick="runCoordAI()" class="btn btn-success" style="flex:1;">Аналізувати</button>
              <button onclick="closeCoordAnalysis()" class="btn" style="flex:1;">Закрити</button>
            </div>
          </div>
        </div>`;
    }

    // ── CRUD ────────────────────────────────────────────────
    window.openCoordModal = function(coordId=null) {
        editingCoordId = coordId;
        const m = document.getElementById('coordModal');
        if (!m) return;
        document.getElementById('coordModalTitle').textContent = coordId ? ct('modalEdit') : ct('modalTitle');
        ['coordName','coordTelegramChat'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
        ['coordType','coordStatus','coordChairman','coordDay','coordTime','coordEscalTarget'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
        document.getElementById('coordType').value = 'weekly';
        document.getElementById('coordStatus').value = 'active';
        ['filterFunctions','filterProjects','filterAssignees','filterOverdue','filterReview'].forEach(id => { const e=document.getElementById('coord_'+id); if(e) e.checked=false; });
        document.querySelectorAll('.coord-participant-cb').forEach(cb => cb.checked=false);
        const fpi=document.getElementById('coord_filterProjectIds');
        const fpr=document.getElementById('coord_filterProcessIds');
        const fcs=document.getElementById('coord_filterCrmStage');
        if(fpi) Array.from(fpi.options).forEach(o=>o.selected=false);
        if(fpr) Array.from(fpr.options).forEach(o=>o.selected=false);
        if(fcs) fcs.value='';

        if (coordId) {
            const c = coordinations.find(x => x.id===coordId);
            if (c) {
                document.getElementById('coordName').value = c.name||'';
                document.getElementById('coordType').value = c.type||'weekly';
                document.getElementById('coordStatus').value = c.status||'active';
                document.getElementById('coordChairman').value = c.chairmanId||'';
                document.getElementById('coordDay').value = c.schedule?.day??'';
                document.getElementById('coordTime').value = c.schedule?.time||'';
                document.getElementById('coordTelegramChat').value = c.telegramChatId||'';
                document.getElementById('coordEscalTarget').value = c.escalTargetId||'';
                const f = c.taskFilters||{};
                ['filterFunctions','filterProjects','filterAssignees','filterOverdue','filterReview'].forEach(id => { const e=document.getElementById('coord_'+id); if(e) e.checked=!!f[id]; });
                if(fpi && f.projectIds) Array.from(fpi.options).forEach(o=>o.selected=(f.projectIds||[]).includes(o.value));
                if(fpr && f.processIds) Array.from(fpr.options).forEach(o=>o.selected=(f.processIds||[]).includes(o.value));
                if(fcs && f.crmStage) fcs.value=f.crmStage;
                document.querySelectorAll('.coord-participant-cb').forEach(cb => { cb.checked=(c.participantIds||[]).includes(cb.value); });
            }
        }
        m.style.display='flex';
    };
    window.closeCoordModal = () => { const m=document.getElementById('coordModal'); if(m) m.style.display='none'; };

    let _saveCoordLock = false;
    window.saveCoord = async function() {
        if (_saveCoordLock) return;
        _saveCoordLock = true;
        const name = document.getElementById('coordName').value.trim();
        if (!name) { _saveCoordLock=false; toast(window.t('coordVveditNazvu'),'error'); return; }
        if (!window.currentCompanyId) { _saveCoordLock=false; return; }
        const participantIds = Array.from(document.querySelectorAll('.coord-participant-cb:checked')).map(cb=>cb.value);
        const filters={};
        ['filterFunctions','filterProjects','filterAssignees','filterOverdue','filterReview'].forEach(id => { const e=document.getElementById('coord_'+id); if(e) filters[id]=e.checked; });
        const fpiEl=document.getElementById('coord_filterProjectIds');
        const fprEl=document.getElementById('coord_filterProcessIds');
        const fcsEl=document.getElementById('coord_filterCrmStage');
        if(fpiEl) filters.projectIds=Array.from(fpiEl.selectedOptions).map(o=>o.value).filter(Boolean);
        if(fprEl) filters.processIds=Array.from(fprEl.selectedOptions).map(o=>o.value).filter(Boolean);
        if(fcsEl) filters.crmStage=fcsEl.value||'';
        const data = {
            name,
            type:document.getElementById('coordType').value,
            status:document.getElementById('coordStatus').value,
            chairmanId:document.getElementById('coordChairman').value||null,
            participantIds,
            // functionIds: унікальні функції задіяних учасників (ТЗ пріоритет 17)
            functionIds: [...new Set(participantIds.flatMap(pid => {
                const u = (typeof users !== 'undefined' ? users : []).find(u => u.id === pid);
                return u?.functionIds || (u?.primaryFunctionId ? [u.primaryFunctionId] : []);
            }))],
            schedule:{ day:document.getElementById('coordDay').value, time:document.getElementById('coordTime').value },
            taskFilters:filters,
            telegramChatId:document.getElementById('coordTelegramChat').value.trim()||null,
            escalTargetId:document.getElementById('coordEscalTarget').value||null,
            updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
        };
        try {
            if (editingCoordId) { await col('coordinations').doc(editingCoordId).update(data); toast('Оновлено'); }
            else { data.createdAt=firebase.firestore.FieldValue.serverTimestamp(); data.createdBy=uid(); await col('coordinations').add(data); toast(window.t('coordKoordynaStvoreno')); }
            closeCoordModal();
        } catch(e) { toast(window.t('errPfx2')+e.message,'error'); }
        finally { _saveCoordLock=false; }
    };

    window.deleteCoord = async function(coordId) {
        const ok = window.showConfirmModal ? await window.showConfirmModal(window.t('coordVydalytyKoordyna'),{danger:true}) : confirm('Видалити?');
        if (!ok) return;
        try { await col('coordinations').doc(coordId).delete(); toast('Видалено'); }
        catch(e) { toast(window.t('delErr2'),'error'); }
    };

    // ── Dynamic Agenda ──────────────────────────────────────
    let dynAgendaCoordId = null;
    window.openDynAgenda = function(coordId) {
        dynAgendaCoordId = coordId;
        const c = coordinations.find(x=>x.id===coordId);
        sessionDynamicAgenda = [...(c?.dynamicAgenda||[])];
        document.getElementById('dynAgendaTitle').textContent = c?.name||ct('agendaTitle');
        renderDynAgendaList();
        document.getElementById('coordDynAgendaModal').style.display='flex';
    };
    window.closeDynAgenda = () => { const m=document.getElementById('coordDynAgendaModal'); if(m) m.style.display='none'; };
    function renderDynAgendaList() {
        const el=document.getElementById('dynAgendaList'); if(!el) return;
        if (!sessionDynamicAgenda.length) { el.innerHTML=`<div style="color:#9ca3af;font-size:.8rem;text-align:center;padding:.6rem;">${window.t('noQuestions2')}</div>`; return; }
        el.innerHTML=sessionDynamicAgenda.map((item,i)=>{
            const author=coordUsers.find(u=>u.id===item.authorId);
            return `<div style="display:flex;align-items:flex-start;gap:.4rem;padding:.45rem .55rem;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
              <span style="color:#16a34a;font-weight:700;flex-shrink:0;font-size:.82rem;">${i+1}.</span>
              <div style="flex:1;"><div style="font-size:.83rem;font-weight:600;">${esc(item.text)}</div>${author?`<div style="font-size:.7rem;color:#9ca3af;">${esc(author.name||author.email)}</div>`:''}${item.escalatedFrom?`<div style="font-size:.68rem;color:#d97706;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></span> ${ct('escalated')}</div>`:''}</div>
              ${isManager()?`<button onclick="removeDynItem(${i})" style="background:none;border:none;cursor:pointer;color:#fca5a5;">${XSVG}</button>`:''}
            </div>`;
        }).join('');
    }
    window.addDynAgendaItem = async function() {
        const input=document.getElementById('dynAgendaInput');
        const text=input?.value.trim(); if(!text||!dynAgendaCoordId) return;
        sessionDynamicAgenda.push({text,authorId:uid(),addedAt:nowISO()});
        input.value='';
        try { await col('coordinations').doc(dynAgendaCoordId).update({dynamicAgenda:sessionDynamicAgenda}); renderDynAgendaList(); }
        catch(e) { toast(window.t('errorWord'),'error'); }
    };
    window.removeDynItem = async function(idx) {
        sessionDynamicAgenda.splice(idx,1);
        try { await col('coordinations').doc(dynAgendaCoordId).update({dynamicAgenda:sessionDynamicAgenda}); renderDynAgendaList(); }
        catch(e) { toast(window.t('errorWord'),'error'); }
    };

    // ── Session ─────────────────────────────────────────────
    window.startCoordSession = async function(coordId) {
        const c = coordinations.find(x=>x.id===coordId); if(!c) return;
        activeSession={coordId,coord:c,startedAt:nowISO()};
        sessionDecisions=[]; sessionUnresolved=[]; sessionAgendaDone={};
        sessionDynamicAgenda=[...(c.dynamicAgenda||[])];

        // Load CRM deals for CRM stage filter
        window._coordCrmDeals=[];
        if (c.taskFilters?.crmStage) {
            try {
                const dSnap=await col('crm_deals').where('stage','==',c.taskFilters.crmStage).get();
                window._coordCrmDeals=dSnap.docs.map(d=>({id:d.id,...d.data()}));
            } catch(e) {}
        }
        // Populate CRM select in task form
        const crmSel=document.getElementById('coordTaskCrm');
        if(crmSel) { crmSel.innerHTML=`<option value="">${ct('selectNone')}</option>`+(window._coordCrmDeals||[]).map(d=>`<option value="${d.id}">${esc(d.title||d.name||d.id)}</option>`).join(''); }

        document.getElementById('coordSessionTitle').textContent=c.name;
        ['coordNotes','coordNewDecision','coordNewUnresolved'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
        const tf=document.getElementById('coordCreateTaskForm'); if(tf) tf.style.display='none';

        sessionStartTime=Date.now(); clearInterval(timerInterval);
        const warnMin=Math.round((TYPES[c.type]?.duration||60)*.8);
        timerInterval=setInterval(()=>{
            const elapsed=Math.floor((Date.now()-sessionStartTime)/1000);
            const el=document.getElementById('coordTimer');
            if(el) el.textContent=String(Math.floor(elapsed/60)).padStart(2,'0')+':'+String(elapsed%60).padStart(2,'0');
            if(elapsed===warnMin*60) toast(`Залишилось ~${(TYPES[c.type]?.duration||60)-warnMin} хв`,'info');
        },1000);

        renderAgenda(c); renderSessionTasks(c); renderSessionMetrics(c);
        renderDecisions(); renderUnresolved();
        document.getElementById('coordSessionModal').style.display='flex';

        const ids=c.participantIds||[];
        Promise.all([getReadiness(ids),getExecutionRating(ids)]).then(([read,rate])=>{
            renderReadinessBar(ids,read); renderParticipantRatings(ids,read,rate);
        });
    };

    function renderReadinessBar(ids,read) {
        const el=document.getElementById('coordReadinessBar'); if(!el) return;
        const ready=ids.filter(id=>read[id]?.opened).length;
        const color=ready===ids.length?'#22c55e':ready>ids.length/2?'#f59e0b':'#ef4444';
        const notReady=ids.filter(id=>!read[id]?.opened).map(id=>{ const u=coordUsers.find(u=>u.id===id); return u?(u.name||u.email).split(' ')[0]:'?'; });
        el.innerHTML=`<span style="color:${color};font-weight:600;">${ready}/${ids.length} готові</span>${notReady.length?` <span style="color:#9ca3af;">· не відкрили: ${notReady.join(', ')}</span>`:''}`;
    }

    function renderParticipantRatings(ids,read,rate) {
        const el=document.getElementById('coordParticipantRatings'); if(!el) return;
        el.innerHTML=ids.map(id=>{
            const u=coordUsers.find(x=>x.id===id);
            const name=u?(u.name||u.email).split(' ')[0]:'?';
            const r=rate[id]||{total:0,completed:0,overdue:0,rate:100};
            const ready=read[id]?.opened;
            const rc=r.rate>=80?'#22c55e':r.rate>=50?'#f59e0b':'#ef4444';
            return `<div style="display:flex;align-items:center;gap:.4rem;padding:.3rem .45rem;border-radius:7px;background:#f9fafb;border:1px solid #e5e7eb;">
              <span style="width:6px;height:6px;border-radius:50%;background:${ready?'#22c55e':'#d1d5db'};flex-shrink:0;"></span>
              <span style="font-size:.8rem;font-weight:600;flex:1;">${esc(name)}</span>
              <span style="font-size:.75rem;font-weight:700;color:${rc};">${r.rate}%</span>
              ${r.overdue?`<span style="font-size:.68rem;background:#fef2f2;color:#ef4444;padding:.08rem .3rem;border-radius:4px;">${r.overdue}</span>`:''}
              <span style="font-size:.68rem;color:#9ca3af;">${r.completed}/${r.total}</span>
            </div>`;
        }).join('');
    }

    function renderAgenda(c) {
        const el=document.getElementById('coordAgenda'); if(!el) return;
        const items=[...AGENDA_BASE];
        if((c.dynamicAgenda||[]).length) items.splice(3,0,{id:'dynamic',icon:si('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'),label:`${ct('questionsLbl')} (${c.dynamicAgenda.length})`});
        el.innerHTML=items.map(item=>`<div style="display:flex;align-items:center;gap:.4rem;padding:.38rem .55rem;border-radius:8px;border:1.5px solid ${sessionAgendaDone[item.id]?'#22c55e':'#e5e7eb'};background:${sessionAgendaDone[item.id]?'#f0fdf4':'#fff'};cursor:pointer;transition:all .12s;" onclick="toggleAgendaItem('${item.id}',this)">
          <input type="checkbox" ${sessionAgendaDone[item.id]?'checked':''} style="pointer-events:none;margin:0;">
          <span style="font-size:.82rem;">${item.icon}</span>
          <span style="font-size:.78rem;font-weight:600;color:${sessionAgendaDone[item.id]?'#16a34a':'#374151'};">${item.label}</span>
        </div>`).join('');
    }

    window.toggleAgendaItem = function(id,el) {
        sessionAgendaDone[id]=!sessionAgendaDone[id];
        const cb=el.querySelector('input[type=checkbox]'); if(cb) cb.checked=sessionAgendaDone[id];
        el.style.borderColor=sessionAgendaDone[id]?'#22c55e':'#e5e7eb';
        el.style.background=sessionAgendaDone[id]?'#f0fdf4':'#fff';
        const sp=el.querySelector('span:last-child'); if(sp) sp.style.color=sessionAgendaDone[id]?'#16a34a':'#374151';
    };

    function renderSessionTasks(c) {
        const f=c.taskFilters||{};
        const pids=c.participantIds||[];
        const today=todayStr();
        let filtered=coordTasks.filter(t=>{
            if(f.filterReview) return t.status==='review';
            if(f.filterOverdue) return t.deadlineDate&&t.deadlineDate<today;
            if(f.projectIds?.length) return f.projectIds.includes(t.projectId);
            if(f.processIds?.length) return f.processIds.includes(t.processTemplateId||t.processId);
            if(f.crmStage) { const ids=(window._coordCrmDeals||[]).map(d=>d.id); return ids.includes(t.crmDealId||t.dealId); }
            if(f.filterFunctions) { const pf=coordFunctions.filter(fn=>(fn.assigneeIds||[]).some(id=>pids.includes(id))).map(fn=>fn.id); return pf.includes(t.functionId); }
            return pids.includes(t.assigneeId)||pids.includes(t.creatorId);
        });
        filtered.sort((a,b)=>{ const ao=a.deadlineDate&&a.deadlineDate<today, bo=b.deadlineDate&&b.deadlineDate<today; if(ao&&!bo) return -1; if(!ao&&bo) return 1; return (a.deadlineDate||'').localeCompare(b.deadlineDate||''); });
        const el=document.getElementById('coordTaskList'); if(!el) return;
        if(!filtered.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;text-align:center;padding:.4rem;">${window.t('noTasks2')}</div>`;return;}
        const sc={new:'#3b82f6',progress:'#f59e0b',review:'#8b5cf6',done:'#22c55e'};
        const sl={new:'Нове',progress:window.t('coordVRoboti'),review:window.t('coordPerevirk'),done:'Виконано'};
        el.innerHTML=filtered.slice(0,40).map(t=>{
            const ov=t.deadlineDate&&t.deadlineDate<today;
            const a=coordUsers.find(u=>u.id===t.assigneeId);
            const an=a?(a.name||a.email).split(' ')[0]:'';
            const co=sc[t.status]||'#6b7280';
            return `<div style="padding:.3rem .45rem;border-radius:6px;border:1px solid ${ov?'#fecaca':'#f0f0f0'};background:${ov?'#fef2f2':'#fff'};">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.25rem;">
                <span style="font-size:.76rem;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(t.title)}">${esc(t.title)}</span>
                <span style="background:${co}15;color:${co};padding:.06rem .3rem;border-radius:4px;font-size:.66rem;flex-shrink:0;">${sl[t.status]||t.status}</span>
              </div>
              <div style="font-size:.68rem;color:#9ca3af;margin-top:1px;">${an?esc(an):''}${t.deadlineDate?` · ${fmtDate(t.deadlineDate)}`:''}</div>
            </div>`;
        }).join('');
    }

    function renderSessionMetrics(c) {
        const el=document.getElementById('coordMetricsList'); if(!el) return;
        const entries=window._statsAllEntries||[];
        const metrics=coordMetrics.filter(m=>m.privacy!=='owner_only'||isManager()).slice(0,8);
        if(!metrics.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;">${window.t('metricsNotSet2')}</div>`;return;}
        el.innerHTML=metrics.map(m=>{
            const last=entries.filter(e=>e.metricId===m.id).sort((a,b)=>(b.period||'').localeCompare(a.period||''))[0];
            const val=last?.value; const tgt=m.target;
            const ok=val!==undefined&&tgt!==undefined?val>=tgt:null;
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:.28rem .45rem;border-radius:6px;background:#f9fafb;border:1px solid #f0f0f0;">
              <span style="font-size:.76rem;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(m.name)}</span>
              <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0;">
                ${val!==undefined?`<span style="font-size:.8rem;font-weight:700;color:${ok===true?'#16a34a':ok===false?'#ef4444':'#374151'};">${val}${m.unit?' '+m.unit:''}</span>`:'<span style="color:#d1d5db;font-size:.72rem;">—</span>'}
                ${tgt!==undefined?`<span style="font-size:.68rem;color:#9ca3af;">/${tgt}</span>`:''}
              </div>
            </div>`;
        }).join('');
    }

    // ── Decisions with Task creation ────────────────────────
    window.addCoordDecision = function() {
        const inp=document.getElementById('coordNewDecision');
        const text=inp?.value.trim(); if(!text) return;
        sessionDecisions.push({text,time:nowISO(),authorId:uid(),taskId:null});
        inp.value=''; renderDecisions();
    };

    function renderDecisions() {
        const el=document.getElementById('coordDecisions'); if(!el) return;
        if(!sessionDecisions.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;">${window.t('noDecisions2')}</div>`;return;}
        el.innerHTML=sessionDecisions.map((d,i)=>`
        <div style="display:flex;align-items:flex-start;gap:.35rem;padding:.3rem .45rem;background:#f0fdf4;border-radius:6px;border:1px solid #d1fae5;">
          <span style="color:#16a34a;font-weight:700;flex-shrink:0;font-size:.8rem;">${i+1}.</span>
          <span style="flex:1;font-size:.8rem;">${esc(d.text)}</span>
          <div style="display:flex;align-items:center;gap:.2rem;flex-shrink:0;">
            ${d.taskId
              ? `<span style="font-size:.68rem;background:#f0fdf4;color:#16a34a;padding:.08rem .35rem;border-radius:5px;border:1px solid #bbf7d0;">${ct('taskCreatedBadge')}</span>`
              : `<button onclick="openCoordTaskForm(${i},'${esc(d.text).replace(/'/g,"\\'")}')" style="background:#22c55e;border:none;cursor:pointer;color:#fff;border-radius:6px;padding:.15rem .45rem;font-size:.7rem;white-space:nowrap;">${ct('createTaskBtn')}</button>`
            }
            <button onclick="removeDecision(${i})" style="background:none;border:none;cursor:pointer;color:#fca5a5;">${XSVG}</button>
          </div>
        </div>`).join('');
    }
    window.removeDecision = idx => { sessionDecisions.splice(idx,1); renderDecisions(); };

    window.openCoordTaskForm = function(decisionIdx, decisionText) {
        const form=document.getElementById('coordCreateTaskForm'); if(!form) return;
        document.getElementById('coordTaskDecisionIdx').value=String(decisionIdx);
        document.getElementById('coordTaskTitle').value=decisionText||sessionDecisions[decisionIdx]?.text||'';
        const asEl=document.getElementById('coordTaskAssignee'); if(asEl&&uid()) asEl.value=uid();
        const dl=document.getElementById('coordTaskDeadline');
        if(dl){ const d=new Date(); d.setDate(d.getDate()+3); dl.value=d.toISOString().split('T')[0]; }
        ['coordTaskProject','coordTaskProcess','coordTaskCrm'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
        form.style.display='block';
        form.scrollIntoView({behavior:'smooth',block:'nearest'});
        setTimeout(()=>{ if(window.lucide) lucide.createIcons(); },50);
    };
    window.cancelCoordTaskForm = () => {
        const f=document.getElementById('coordCreateTaskForm'); if(f) f.style.display='none';
        _submitTaskLock=false;
    };

    let _submitTaskLock = false;
    window.submitCoordTask = async function() {
        if (_submitTaskLock) return;
        _submitTaskLock = true;
        const btn = document.querySelector('#coordCreateTaskForm button.btn-success');
        if (btn) { btn.disabled = true; btn.textContent = '...'; }
        const idx=parseInt(document.getElementById('coordTaskDecisionIdx').value,10);
        const title=document.getElementById('coordTaskTitle').value.trim();
        if(!title){ toast('Введіть заголовок задачі','error'); _submitTaskLock=false; if(btn){btn.disabled=false;btn.innerHTML=`<i data-lucide="check" style="width:12px;height:12px;margin-right:3px;"></i>${ct('taskCreateBtn')}`;} return; }
        const assigneeId=document.getElementById('coordTaskAssignee').value||null;
        const deadline=document.getElementById('coordTaskDeadline').value||null;
        const projectId=document.getElementById('coordTaskProject')?.value||null;
        const processId=document.getElementById('coordTaskProcess')?.value||null;
        const crmDealId=document.getElementById('coordTaskCrm')?.value||null;
        const taskData={
            title, assigneeId, deadlineDate:deadline, status:'new',
            projectId:projectId||null, processTemplateId:processId||null, crmDealId:crmDealId||null,
            coordinationId:activeSession?.coordId||null, coordinationDecisionIdx:isNaN(idx)?null:idx,
            createdAt:firebase.firestore.FieldValue.serverTimestamp(), creatorId:uid(), source:'coordination',
        };
        try {
            const ref=await col('tasks').add(taskData);
            if(!isNaN(idx)&&sessionDecisions[idx]){ sessionDecisions[idx].taskId=ref.id; sessionDecisions[idx].taskTitle=title; }
            window.cancelCoordTaskForm(); renderDecisions(); toast('✅ Задачу створено');
        } catch(e) {
            toast('Помилка: '+e.message,'error');
            if(btn){ btn.disabled=false; btn.innerHTML=`<i data-lucide="check" style="width:12px;height:12px;margin-right:3px;"></i>${ct('taskCreateBtn')}`; }
        } finally { _submitTaskLock=false; }
    };

    window.addUnresolved = function() {
        const inp=document.getElementById('coordNewUnresolved');
        const text=inp?.value.trim(); if(!text) return;
        sessionUnresolved.push({text,time:nowISO(),authorId:uid()}); inp.value=''; renderUnresolved();
    };
    function renderUnresolved() {
        const el=document.getElementById('coordUnresolved'); if(!el) return;
        if(!sessionUnresolved.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;">${window.t('noUnresolved2')}</div>`;return;}
        el.innerHTML=sessionUnresolved.map((d,i)=>`
        <div style="display:flex;align-items:flex-start;gap:.35rem;padding:.3rem .45rem;background:#fefce8;border-radius:6px;border:1px solid #fde68a;">
          <span style="color:#d97706;font-weight:700;flex-shrink:0;font-size:.8rem;">!</span>
          <span style="flex:1;font-size:.8rem;">${esc(d.text)}</span>
          <button onclick="removeUnresolved(${i})" style="background:none;border:none;cursor:pointer;color:#fca5a5;">${XSVG}</button>
        </div>`).join('');
    }
    window.removeUnresolved = idx => { sessionUnresolved.splice(idx,1); renderUnresolved(); };

    window.openAddTaskFromCoord = function() { document.getElementById('coordSessionModal').style.display='none'; if(window.openTaskModal) window.openTaskModal(); };
    window.closeCoordSession = function() { document.getElementById('coordSessionModal').style.display='none'; clearInterval(timerInterval); activeSession=null; };

    window.finishCoordSession = async function() {
        if(!activeSession) return;
        clearInterval(timerInterval);
        const notes=document.getElementById('coordNotes')?.value||'';
        const c=activeSession.coord;
        const session={
            coordId:activeSession.coordId, coordName:c.name, coordType:c.type,
            startedAt:activeSession.startedAt, finishedAt:nowISO(),
            decisions:sessionDecisions, unresolved:sessionUnresolved,
            agendaDone:sessionAgendaDone, dynamicAgendaItems:sessionDynamicAgenda, notes,
            conductedBy:uid(), participantIds:c.participantIds||[],
            taskSnapshot:coordTasks.filter(t=>(c.participantIds||[]).includes(t.assigneeId)).slice(0,50)
                .map(t=>({id:t.id,title:t.title,status:t.status,assigneeId:t.assigneeId,deadlineDate:t.deadlineDate})),
            createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        };
        try {
            const ref=await col('coordination_sessions').add(session); session.id=ref.id;
            if(sessionUnresolved.length) {
                const escalId=c.escalTargetId||findEscalTarget(c);
                if(escalId) {
                    const escalCoord=coordinations.find(x=>x.id===escalId);
                    await col('coordinations').doc(escalId).update({ dynamicAgenda:[...(escalCoord?.dynamicAgenda||[]),...sessionUnresolved.map(u=>({text:`${window.t('escalationFrom').replace('{V}',c.name).replace('{V}',u.text)}`,authorId:uid(),addedAt:nowISO(),escalatedFrom:activeSession.coordId}))] });
                    toast(`${sessionUnresolved.length} питань ескальовано ↑`);
                }
            }
            if((c.dynamicAgenda||[]).length) await col('coordinations').doc(activeSession.coordId).update({dynamicAgenda:[]});
            document.getElementById('coordSessionModal').style.display='none'; activeSession=null;
            if(c.telegramChatId) await sendTelegramProto(session,c.telegramChatId);
            showProtocol(session);
        } catch(e) { console.error(e); toast(window.t('errPfx2')+e.message,'error'); }
    };

    function findEscalTarget(c) {
        const tt=ESCALATION_CHAIN[c.type]; if(!tt) return null;
        return coordinations.find(x=>x.type===tt)?.id||null;
    }

    // ── Protocol ────────────────────────────────────────────
    function showProtocol(session) {
        currentProtocol=session;
        const content=document.getElementById('coordProtocolContent'); if(!content) return;
        const type=TYPES[session.coordType]||{label:''};
        const startD=session.startedAt?new Date(session.startedAt):null;
        const endD=session.finishedAt?new Date(session.finishedAt):null;
        const dur=startD&&endD?Math.round((endD-startD)/60000):0;
        const decisions=session.decisions||[];
        const unresolved=session.unresolved||[];
        const sl={new:'Нове',progress:window.t('coordVRoboti'),review:window.t('coordPerevirk'),done:'Виконано'};
        const taskRows=(session.taskSnapshot||[]).map(t=>{ const a=coordUsers.find(u=>u.id===t.assigneeId); const ov=t.deadlineDate&&t.deadlineDate<todayStr(); return `<tr><td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;${ov?'color:#ef4444;':''}">${esc(t.title)}</td><td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;">${esc(a?a.name||a.email:'—')}</td><td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;">${sl[t.status]||t.status}</td><td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;">${t.deadlineDate?fmtDate(t.deadlineDate):'—'}</td></tr>`; }).join('');
        const createdTasks=decisions.filter(d=>d.taskId);
        content.innerHTML=`<div id="protocolPrintable">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;border-radius:12px;padding:1.1rem;margin-bottom:.9rem;">
            <div style="font-size:.72rem;opacity:.8;margin-bottom:.2rem;">${type.label}</div>
            <div style="font-weight:800;font-size:1.05rem;margin-bottom:.2rem;">${esc(session.coordName)}</div>
            <div style="font-size:.76rem;opacity:.9;">${startD?fmtDate(session.startedAt):''} · ${startD?fmtTime(session.startedAt):''} — ${endD?fmtTime(session.finishedAt):''}${dur?' · '+dur+' хв':''}</div>
          </div>
          ${decisions.length?`<div style="margin-bottom:.85rem;"><div style="font-weight:700;font-size:.8rem;color:#374151;margin-bottom:.4rem;border-bottom:1.5px solid #f0fdf4;padding-bottom:.2rem;">${ct('decisionsLbl')} (${decisions.length})</div>${decisions.map((d,i)=>`<div style="display:flex;gap:.4rem;padding:.3rem 0;border-bottom:1px solid #f9fafb;"><span style="color:#16a34a;font-weight:700;">${i+1}.</span><span style="font-size:.8rem;flex:1;">${esc(d.text)}</span>${d.taskId?`<span style="font-size:.68rem;color:#16a34a;background:#f0fdf4;padding:.05rem .3rem;border-radius:4px;">${ct('taskCreatedBadge')}</span>`:''}</div>`).join('')}</div>`:''}
          ${createdTasks.length?`<div style="margin-bottom:.85rem;"><div style="font-weight:700;font-size:.8rem;color:#1d4ed8;margin-bottom:.4rem;border-bottom:1.5px solid #eff6ff;padding-bottom:.2rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/></svg></span> Задачі зі зборів (${createdTasks.length})</div>${createdTasks.map(d=>`<div style="font-size:.78rem;color:#374151;padding:.2rem 0;">• ${esc(d.taskTitle||d.text)}</div>`).join('')}</div>`:''}
          ${unresolved.length?`<div style="margin-bottom:.85rem;"><div style="font-weight:700;font-size:.8rem;color:#d97706;margin-bottom:.4rem;border-bottom:1.5px solid #fef9c3;padding-bottom:.2rem;">${ct('escalLbl')} (${unresolved.length})</div>${unresolved.map((d,i)=>`<div style="display:flex;gap:.4rem;padding:.3rem 0;border-bottom:1px solid #fef9c3;"><span style="color:#d97706;font-weight:700;">${i+1}.</span><span style="font-size:.8rem;">${esc(d.text)}</span></div>`).join('')}</div>`:''}
          ${session.taskSnapshot?.length?`<div style="margin-bottom:.85rem;"><div style="font-weight:700;font-size:.8rem;color:#374151;margin-bottom:.4rem;border-bottom:1.5px solid #f0fdf4;padding-bottom:.2rem;">Завдання (${session.taskSnapshot.length})</div><table style="width:100%;border-collapse:collapse;"><tr style="background:#f9fafb;"><th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Завдання</th><th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Виконавець</th><th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Статус</th><th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Дедлайн</th></tr>${taskRows}</table></div>`:''}
          ${session.notes?`<div style="margin-bottom:.85rem;"><div style="font-weight:700;font-size:.8rem;color:#374151;margin-bottom:.35rem;">Нотатки</div><div style="font-size:.8rem;white-space:pre-wrap;background:#f9fafb;padding:.5rem;border-radius:8px;">${esc(session.notes)}</div></div>`:''}
          <div style="margin-top:.85rem;padding-top:.6rem;border-top:1px solid #e5e7eb;font-size:.68rem;color:#9ca3af;">TALKO System · ${fmtDate(nowISO())}</div>
        </div>`;
        document.getElementById('coordProtocolModal').style.display='flex';
    }

    window.closeProtocolModal = function() { const m=document.getElementById('coordProtocolModal'); if(m) m.style.display='none'; currentProtocol=null; };

    window.printProtocol = function() {
        const el=document.getElementById('protocolPrintable'); if(!el) return;
        const w=window.open('','_blank');
        w.document.write(`<html><head><meta charset="utf-8"><style>@page{margin:12mm}body{font-family:Arial,sans-serif;font-size:11px;color:#1a1a1a}table{width:100%;border-collapse:collapse}th,td{padding:5px 7px;border-bottom:1px solid #e5e7eb;text-align:left}th{background:#f9fafb;font-weight:600;font-size:10px;color:#6b7280}</style></head><body>${el.innerHTML}</body></html>`);
        w.document.close(); setTimeout(()=>w.print(),350);
    };

    async function sendTelegramProto(session,chatId) {
        try {
            const snap=await db().collection('settings').doc('telegram').get();
            const token=snap.data()?.botToken; if(!token) return;
            const dec=session.decisions||[]; const unr=session.unresolved||[];
            const lines=[`*${session.coordName}*`,`${fmtDate(session.startedAt)} ${fmtTime(session.startedAt)}—${fmtTime(session.finishedAt)}`,''];
            if(dec.length){lines.push(ct('decisionsLbl')+':');dec.forEach((d,i)=>lines.push(`${i+1}. ${d.text}${d.taskId?' ✅':''}`));lines.push('');}
            if(unr.length){lines.push(ct('escalLbl')+':');unr.forEach((d,i)=>lines.push(`${i+1}. ${d.text}`));lines.push('');}
            if(session.taskSnapshot?.length){lines.push(`*Завдань:* ${session.taskSnapshot.length}`);session.taskSnapshot.slice(0,5).forEach(t=>{const a=coordUsers.find(u=>u.id===t.assigneeId);lines.push(`• ${t.title}${a?' — '+(a.name||a.email).split(' ')[0]:''}`)});if(session.taskSnapshot.length>5)lines.push(`_...+${session.taskSnapshot.length-5}_`);lines.push('');}
            lines.push('_TALKO System_');
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text:lines.join('\n'),parse_mode:'Markdown'})});
        } catch(e){console.warn('[COORD] TG:',e);}
    }
    window.sendProtocolToTelegram = async function() {
        if(!currentProtocol) return;
        const c=coordinations.find(x=>x.id===currentProtocol.coordId);
        if(!c?.telegramChatId){toast('Telegram чат не налаштований','error');return;}
        await sendTelegramProto(currentProtocol,c.telegramChatId); toast('Надіслано в Telegram ✅');
    };

    // ── History ─────────────────────────────────────────────
    window.viewCoordHistory = async function(coordId) {
        const coord=coordinations.find(c=>c.id===coordId); if(!coord) return;
        try {
            const snap=await col('coordination_sessions').where('coordId','==',coordId).orderBy('createdAt','desc').limit(20).get();
            if(snap.empty){toast(ct('noProtocols'),'info');return;}
            const sessions=snap.docs.map(d=>({id:d.id,...d.data()}));
            const content=document.getElementById('coordProtocolContent'); if(!content) return;
            content.innerHTML=`<div style="font-weight:700;margin-bottom:.65rem;">${ct('protocolsTitle')}: ${esc(coord.name)}</div>${sessions.map(s=>{const dur=s.startedAt&&s.finishedAt?Math.round((new Date(s.finishedAt)-new Date(s.startedAt))/60000):0;const ct2=(s.decisions||[]).filter(d=>d.taskId).length;return `<div onclick="loadSessionProtocol('${s.id}')" style="padding:.58rem .7rem;border:1.5px solid #e5e7eb;border-radius:10px;margin-bottom:.35rem;cursor:pointer;background:#f9fafb;" onmouseenter="this.style.background='#f0fdf4'" onmouseleave="this.style.background='#f9fafb'"><div style="font-weight:600;font-size:.82rem;">${fmtDate(s.startedAt)} ${fmtTime(s.startedAt)}</div><div style="font-size:.72rem;color:#6b7280;margin-top:2px;">${(s.decisions||[]).length} рішень · ${(s.taskSnapshot||[]).length} завдань${dur?' · '+dur+'хв':''}${(s.unresolved||[]).length?' · '+s.unresolved.length+' ескал.':''}${ct2?' · '+ct2+' задач зі зборів':''}</div></div>`}).join('')}`;
            document.getElementById('coordProtocolModal').style.display='flex';
        } catch(e){toast(window.t('loadErr2'),'error');}
    };
    window.loadSessionProtocol = async function(sessionId) {
        try { const snap=await col('coordination_sessions').doc(sessionId).get(); if(!snap.exists) return; showProtocol({id:snap.id,...snap.data()}); }
        catch(e){toast(window.t('errorWord'),'error');}
    };

    // ── AI Analysis ─────────────────────────────────────────
    window.openCoordAnalysis = () => { document.getElementById('coordAnalysisModal').style.display='flex'; };
    window.closeCoordAnalysis = () => { document.getElementById('coordAnalysisModal').style.display='none'; };
    window.runCoordAI = async function() {
        const el=document.getElementById('coordAnalysisContent'); if(!el) return;
        el.innerHTML=`<div style="text-align:center;padding:2rem;color:#9ca3af;">Аналізую...</div>`;
        try {
            const snap=await col('coordination_sessions').orderBy('createdAt','desc').limit(30).get();
            const sessions=snap.docs.map(d=>({id:d.id,...d.data()}));
            if(!sessions.length){el.innerHTML=`<div style="text-align:center;padding:2rem;color:#9ca3af;">${window.t('doFirstCoord2')}</div>`;return;}
            const p=analyzePatterns(sessions);
            window.closeCoordAnalysis&&window.closeCoordAnalysis();
            window.openAiChat({module:'coordination',title:window.t('coordAnalizKoordyna'),contextText:buildPrompt(p),systemPrompt:null,initialMessage:window.t('coordProanaliTsiDani')});
        } catch(e){el.innerHTML=`<div style="color:#ef4444;padding:1rem;">Помилка: ${esc(e.message)}</div>`;}
    };
    function analyzePatterns(sessions) {
        const df={},uf={}; let td=0,tu=0,tc=0;
        sessions.forEach(s=>{(s.decisions||[]).forEach(d=>{td++;if(d.taskId)tc++;const k=d.text.toLowerCase().slice(0,40);df[k]=(df[k]||0)+1;});(s.unresolved||[]).forEach(u=>{tu++;const k=u.text.toLowerCase().slice(0,40);uf[k]=(uf[k]||0)+1;});});
        const repD=Object.entries(df).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const repU=Object.entries(uf).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const avgDur=sessions.reduce((a,s)=>{ if(!s.startedAt||!s.finishedAt) return a; return a+Math.round((new Date(s.finishedAt)-new Date(s.startedAt))/60000); },0)/sessions.length||0;
        return {total:sessions.length,totalDecisions:td,totalUnresolved:tu,tasksCreated:tc,repD,repU,avgDur:Math.round(avgDur)};
    }
    function buildPrompt(p) {
        return `Ти AI-аналітик TALKO. Дай конкретні рекомендації по координаціях (українська, коротко).\n\nДані: ${p.total} координацій, ${p.totalDecisions} рішень, ${p.tasksCreated} задач зі зборів, ${p.totalUnresolved} ескальовано, середня тривалість ${p.avgDur}хв.\nПовторювані рішення: ${p.repD.map(([k,c])=>'"'+k+'"('+c+'р)').join(', ')||window.t('coordNemaye')}\nПовторювані проблеми: ${p.repU.map(([k,c])=>'"'+k+'"('+c+'р)').join(', ')||window.t('coordNemaye')}\n\n3-4 конкретні рекомендації. Без зайвих слів.`;
    }

    // ── Tab integration ─────────────────────────────────────
    function initCoordTab() {
        window.dbg && dbg('[Coord] initCoordTab, companyId:', window.currentCompanyId);
        renderCoordination(); loadCoordData();
    }
    window._initCoordTab = initCoordTab;

    if (window.onSwitchTab) {
        window.onSwitchTab('coordination', initCoordTab);
    } else {
        let retries=0;
        const retry=setInterval(()=>{ if(window.onSwitchTab){ window.onSwitchTab('coordination',initCoordTab); clearInterval(retry); } else if(++retries>20) clearInterval(retry); },100);
    }

    document.addEventListener('companyLoaded',()=>{
        const activeTab=document.querySelector('.tab-content.active');
        if(activeTab&&activeTab.id==='coordinationTab') initCoordTab();
    });

    window.destroyCoordListeners = function() {
        coordUnsubscribes.forEach(u=>{ try{u();}catch(e){} });
        coordUnsubscribes=[]; activeSession=null; coordinations=[]; coordTasks=[];
    };

})();
