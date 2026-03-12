// ============================================================
// 76-coordination.js — TALKO Coordination Module FULL v2
// Повна реалізація: список, сесія, протокол, ескалація,
// AI-аналіз, рейтинги, метрики, Telegram, динамічний ПД
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

    const COORD_LUCIDE_ICONS = {
        daily: 'sun', weekly: 'calendar', monthly: 'calendar-range',
        council_rec: 'handshake', council_dir: 'target', council_exe: 'zap',
        council_own: 'crown', oneoff: 'bell',
    };

    const ESCALATION_CHAIN = {
        daily: 'weekly',
        weekly: 'council_rec',
        council_rec: 'council_dir',
        council_dir: 'council_exe',
        council_exe: 'council_own',
    };



    // ── i18n for Coordination module ──────────────────────
    const COORD_I18N = {
        ua: {
            title:'Координації', newCoord:'Нова координація', emptyText:'Координацій ще немає',
            addFirst:'+ Додати першу', modalTitle:'Нова координація', modalEdit:'Редагувати',
            labelName:'Назва координації', placeholderName:'Щоденна координація команди',
            labelType:'Тип', labelStatus:'Статус', statusActive:'Активна', statusPaused:'Призупинена',
            labelChairman:'Голова координації', selectChairman:'— Оберіть відповідального —',
            labelParticipants:'Учасники', labelDay:'День тижня', anyDay:'— Будь-який —',
            labelTime:'Час початку', labelFilter:'Фільтр завдань',
            filterFunctions:'По функціях', filterProjects:'По проектах',
            filterAssignees:'По виконавцях', filterOverdue:'Прострочені', filterReview:'На перевірці',
            labelEscal:'Ескалація до', escalAuto:'— Авто по типу —',
            escalHint:'Невирішені питання автоматично потраплять вгору по ланцюжку',
            labelTelegram:'Telegram Chat ID', telegramHint:'Протокол надсилається автоматично після завершення',
            btnCancel:'Скасувати', btnSave:'Зберегти',
            agendaTitle:'Порядок денний', agendaHint:'Учасники додають питання до початку координації',
            btnFinish:'Завершити', agendaSection:'Порядок денний', participantsLbl:'Учасники',
            decisionsLbl:'Рішення', escalLbl:'Ескалація (невирішені питання)',
            protocolTitle:'Протокол координації', protocolsTitle:'Протоколи', noProtocols:'Протоколів ще немає',
            aiTitle:'AI Рекомендації', escalated:'Ескальовано',
            statsLbl:'Статистики учасників', execLbl:'Виконання попередніх завдань',
            reportsLbl:'Звіти учасників', questionsLbl:'Питання від учасників',
            decisionsAgLbl:'Рішення', tasksAgLbl:'Нові завдання',
            typeDaily:'Щоденна', typeWeekly:'Щотижнева', typeMonthly:'Місячна',
            typeCouncilRec:'Рекомендаційна рада', typeCouncilDir:'Рада директора',
            typeCouncilExe:'Виконавча рада', typeCouncilOwn:'Рада засновників', typeOneoff:'Разова',
            analyticsTitle:'Аналітика',
            statsSummary:'Координацій: {total} · Рішень: {decisions} · Ескальовано: {unresolved} · Середня тривалість: {avg}хв',
        },
        ru: {
            title:'Координации', newCoord:'Новая координация', emptyText:'Координаций ещё нет',
            addFirst:'+ Добавить первую', modalTitle:'Новая координация', modalEdit:'Редактировать',
            labelName:'Название координации', placeholderName:'Ежедневная координация команды',
            labelType:'Тип', labelStatus:'Статус', statusActive:'Активная', statusPaused:'Приостановлена',
            labelChairman:'Руководитель координации', selectChairman:'— Выберите ответственного —',
            labelParticipants:'Участники', labelDay:'День недели', anyDay:'— Любой —',
            labelTime:'Время начала', labelFilter:'Фильтр задач',
            filterFunctions:'По функциям', filterProjects:'По проектам',
            filterAssignees:'По исполнителям', filterOverdue:'Просроченные', filterReview:'На проверке',
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
        },
        pl: {
            title:'Koordynacje', newCoord:'Nowa koordynacja', emptyText:'Brak koordynacji',
            addFirst:'+ Dodaj pierwszą', modalTitle:'Nowa koordynacja', modalEdit:'Edytuj',
            labelName:'Nazwa koordynacji', placeholderName:'Codzienna koordynacja zespołu',
            labelType:'Typ', labelStatus:'Status', statusActive:'Aktywna', statusPaused:'Wstrzymana',
            labelChairman:'Prowadzący koordynację', selectChairman:'— Wybierz odpowiedzialnego —',
            labelParticipants:'Uczestnicy', labelDay:'Dzień tygodnia', anyDay:'— Dowolny —',
            labelTime:'Godzina rozpoczęcia', labelFilter:'Filtr zadań',
            filterFunctions:'Wg funkcji', filterProjects:'Wg projektów',
            filterAssignees:'Wg wykonawców', filterOverdue:'Przeterminowane', filterReview:'Do weryfikacji',
            labelEscal:'Eskalacja do', escalAuto:'— Auto wg typu —',
            escalHint:'Nierozwiązane kwestie automatycznie trafią wyżej w łańcuchu',
            labelTelegram:'Telegram Chat ID', telegramHint:'Protokół wysyłany automatycznie po zakończeniu',
            btnCancel:'Anuluj', btnSave:'Zapisz',
            agendaTitle:'Porządek obrad', agendaHint:'Uczestnicy dodają pytania przed rozpoczęciem koordynacji',
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
            labelEscal:'Escalate to', escalAuto:'— Auto by type —',
            escalHint:'Unresolved issues will automatically move up the chain',
            labelTelegram:'Telegram Chat ID', telegramHint:'Protocol is sent automatically after completion',
            btnCancel:'Cancel', btnSave:'Save',
            agendaTitle:'Agenda', agendaHint:'Participants add questions before the coordination starts',
            btnFinish:'Finish', agendaSection:'Agenda', participantsLbl:'Participants',
            decisionsLbl:'Decisions', escalLbl:'Escalation (unresolved issues)',
            protocolTitle:'Coordination Protocol', protocolsTitle:'Protocols', noProtocols:'No protocols yet',
            aiTitle:'AI Recommendations', escalated:'Escalated',
            statsLbl:'Participant statistics', execLbl:'Previous task completion',
            reportsLbl:'Participant reports', questionsLbl:'Questions from participants',
            decisionsAgLbl:'Decisions', tasksAgLbl:'New tasks',
            typeDaily:'Daily', typeWeekly:'Weekly', typeMonthly:'Monthly',
            typeCouncilRec:"Advisory council", typeCouncilDir:"Director's council",
            typeCouncilExe:'Executive council', typeCouncilOwn:"Founders' council", typeOneoff:'One-off',
            analyticsTitle:'Analytics',
            statsSummary:'Coordinations: {total} · Decisions: {decisions} · Escalated: {unresolved} · Avg duration: {avg}min',
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
            labelEscal:'Eskalation an', escalAuto:'— Auto nach Typ —',
            escalHint:'Ungelöste Fragen werden automatisch in der Kette nach oben weitergeleitet',
            labelTelegram:'Telegram Chat-ID', telegramHint:'Protokoll wird nach Abschluss automatisch gesendet',
            btnCancel:'Abbrechen', btnSave:'Speichern',
            agendaTitle:'Tagesordnung', agendaHint:'Teilnehmer fügen Fragen vor Beginn der Koordination hinzu',
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
            statsSummary:'Koordinationen: {total} · Entscheidungen: {decisions} · Eskaliert: {unresolved} · Ø Dauer: {avg}Min',
        },
    };
    function ct(key) {
        const lang = localStorage.getItem('talko_lang') || 'ua';
        return (COORD_I18N[lang] && COORD_I18N[lang][key]) || COORD_I18N['ua'][key] || key;
    }
    const TYPES = {
        daily:       { get label(){ return ct('typeDaily'); },       icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></span>', color: '#f59e0b', duration: 20 },
        weekly:      { get label(){ return ct('typeWeekly'); },      icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>', color: '#3b82f6', duration: 60 },
        monthly:     { get label(){ return ct('typeMonthly'); },     icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg></span>', color: '#8b5cf6', duration: 90 },
        council_rec: { get label(){ return ct('typeCouncilRec'); },  icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg></span>', color: '#06b6d4', duration: 60 },
        council_dir: { get label(){ return ct('typeCouncilDir'); },  icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>', color: '#16a34a', duration: 60 },
        council_exe: { get label(){ return ct('typeCouncilExe'); },  icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>', color: '#ef4444', duration: 90 },
        council_own: { get label(){ return ct('typeCouncilOwn'); },  icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg></span>', color: '#d97706', duration: 120 },
        oneoff:      { get label(){ return ct('typeOneoff'); },      icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span>', color: '#6b7280', duration: 45 },
    };

    const DAYS_UK = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];

    const AGENDA_BASE = [
        { id: 'stats',     icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>', get label(){ return ct('statsLbl'); } },
        { id: 'execution', icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>', get label(){ return ct('execLbl'); } },
        { id: 'reports',   icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg></span>', get label(){ return ct('reportsLbl'); } },
        { id: 'questions', icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>', get label(){ return ct('questionsLbl'); } },
        { id: 'decisions', icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>', get label(){ return ct('decisionsAgLbl'); } },
        { id: 'tasks',     icon: '<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>', get label(){ return ct('tasksAgLbl'); } },
    ];

    // ── Helpers ────────────────────────────────────────────
    const db = () => firebase.firestore();
    const col = name => db().collection('companies').doc(window.currentCompanyId).collection(name);
    const uid = () => window.currentUser?.uid;
    const isSA = () => (window.currentUser?.email || '') === 'management.talco@gmail.com';
    const isManager = () => {
        if (isSA()) return true;
        // Read role from DOM element filled by auth listener
        const roleEl = document.getElementById('currentUserRole');
        const roleText = roleEl ? roleEl.textContent : '';
        if (roleText.includes('Власник') || roleText.includes('owner') ||
            roleText.includes('Адмін') || roleText.includes('admin') ||
            roleText.includes('Менеджер') || roleText.includes('manager')) return true;
        // Fallback: coordUsers array (available after load)
        const u = coordUsers.find(x => x.id === uid());
        return u && ['owner','admin','manager'].includes(u.role);
    };
    const esc = str => String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const fmtDate = iso => {
        if (!iso) return '';
        try { return new Date(iso.length===10?iso+'T12:00:00':iso).toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit',year:'numeric'}); }
        catch { return iso; }
    };
    const fmtTime = iso => {
        if (!iso) return '';
        try { return new Date(iso).toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}); }
        catch { return ''; }
    };
    const nowISO = () => new Date().toISOString();
    const todayStr = () => new Date().toISOString().split('T')[0];
    const toast = (msg, type='success') => window.showToast && window.showToast(msg, type);

    // ── Load ───────────────────────────────────────────────
    async function loadCoordData() {
        dbg('[Coord] loadCoordData start, companyId:', window.currentCompanyId);
        if (!window.currentCompanyId) { console.warn('[Coord] no companyId — abort'); return; }
        coordUnsubscribes.forEach(u => u());
        coordUnsubscribes = [];

        const [usSnap, fnSnap, meSnap] = await Promise.all([
            col('users').get(),
            col('functions').get(),
            col('metrics').get().catch(() => ({ docs: [] })),
        ]);

        coordUsers     = usSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        coordFunctions = fnSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        coordMetrics   = meSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const taskUnsub = col('tasks')
            .where('status','in',['new','progress','review'])
            .onSnapshot(snap => {
                coordTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (activeSession) renderSessionTasks(activeSession.coord);
            });
        coordUnsubscribes.push(taskUnsub);

        dbg('[Coord] subscribing to coordinations collection...');
        const coordUnsub = col('coordinations')
            .onSnapshot(snap => {
                dbg('[Coord] snapshot received, docs:', snap.docs.length);
                coordinations = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => {
                        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                        return tb - ta;
                    });
                window._coordinations = coordinations; // global for search
                renderCoordList();
            }, err => {
                console.error('[Coordination] snapshot error:', err.code, err.message);
                renderCoordList();
            });
        coordUnsubscribes.push(coordUnsub);
    }

    // ── Readiness & Rating ─────────────────────────────────
    async function getReadiness(ids) {
        const today = todayStr();
        const res = {};
        ids.forEach(id => res[id] = { opened: false, name: '?' });
        try {
            await Promise.all(ids.map(async id => {
                const snap = await col('users').doc(id).get();
                if (!snap.exists) return;
                const d = snap.data();
                const ls = d.lastSeen?.toDate?.()?.toISOString?.() || '';
                res[id] = { opened: ls.startsWith(today), name: d.name || d.email || id };
            }));
        } catch(e) { console.warn('[COORD] readiness:', e); }
        return res;
    }

    async function getExecutionRating(ids) {
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        const rating = {};
        try {
            // FIX BE: колекції 'completedTasks' не існує — читаємо з 'tasks' де status='done'
            const snap = await col('tasks').where('status','==','done').get();
            const completed = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => {
                // тільки виконані за останній тиждень
                const cd = t.completedDate || (t.completedAt?.toDate ? t.completedAt.toDate().toISOString().split('T')[0] : '');
                return cd >= weekAgoStr;
            });
            ids.forEach(id => {
                const mine = coordTasks.filter(t => t.assigneeId === id);
                const done = completed.filter(t => t.assigneeId === id);
                const overdue = mine.filter(t => t.deadlineDate && t.deadlineDate < todayStr());
                const total = mine.length + done.length;
                rating[id] = { total, completed: done.length, overdue: overdue.length,
                    rate: total > 0 ? Math.round(done.length / total * 100) : 100 };
            });
        } catch(e) { console.warn('[COORD] rating:', e); ids.forEach(id => { rating[id] = { total:0, completed:0, overdue:0, rate:100 }; }); }
        return rating;
    }

    // ── Main render ────────────────────────────────────────
    function renderCoordination() {
        const root = document.getElementById('coordinationRoot');
        if (!root) return;
        root.innerHTML = `
        <div style="padding:1rem 1rem 0;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem;margin-bottom:1rem;">
            <h3 style="margin:0;font-size:1.1rem;display:flex;align-items:center;gap:.5rem;">
              <i data-lucide="calendar-check" class="icon"></i> ${ct('title')}
              <span id="coordCount" style="background:var(--primary);color:#fff;padding:2px 8px;border-radius:10px;font-size:.8rem;"></span>
            </h3>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
              ${isManager()?`
              <button class="btn btn-success" onclick="openCoordModal()" style="padding:.42rem 1rem;font-size:.83rem;">
                <i data-lucide="plus" class="icon"></i> ${ct('newCoord')}
              </button>
`:''}
            </div>
          </div>
          <div id="coordList"></div>
        </div>
        ${htmlModal()}${htmlSession()}${htmlProtocol()}${htmlAnalysis()}${htmlDynAgenda()}`;
        setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);
        renderCoordList();
    }

    function renderCoordList() {
        const el = document.getElementById('coordList');
        const ce = document.getElementById('coordCount');
        if (!el) return;
        if (ce) ce.textContent = coordinations.length;
        if (!coordinations.length) {
            el.innerHTML = `<div style="text-align:center;padding:3rem 1rem;">
              <div style="display:flex;justify-content:center;margin-bottom:.75rem;"><i data-lucide="calendar-x" style="width:48px;height:48px;color:#d1d5db;"></i></div>
              <p style="color:#6b7280;margin:0 0 1rem;">${ct('emptyText')}</p>
              ${isManager()?'<button class="btn btn-success" onclick="openCoordModal()">${ct("addFirst")}</button>':''}
            </div>`;
            return;
        }
        const groups = {};
        coordinations.forEach(c => {
            const g = TYPES[c.type]?.label || 'Інше';
            if (!groups[g]) groups[g] = [];
            groups[g].push(c);
        });
        let html = '';
        Object.entries(groups).forEach(([g, items]) => {
            html += `<div style="margin-bottom:1.5rem;">
              <div style="font-size:.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem;">${esc(g)}</div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:.7rem;">
              ${items.map(coordCard).join('')}
              </div></div>`;
        });
        el.innerHTML = html;
        setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);
    }

    function coordCard(c) {
        const type = TYPES[c.type] || { label:c.type, icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>', color:'#6b7280', duration:60 };
        const chair = coordUsers.find(u => u.id === c.chairmanId);
        const chairName = chair ? (chair.name||chair.email).split(' ')[0] : '—';
        const cnt = (c.participantIds||[]).length;
        const sched = c.schedule?.day && c.schedule?.time ? `${DAYS_UK[c.schedule.day]||''} ${c.schedule.time}` : (c.schedule?.time||'');
        const active = c.status !== 'paused';
        const escalType = ESCALATION_CHAIN[c.type];
        const escalCoord = escalType ? coordinations.find(x => x.type === escalType) : null;
        const hasEscalated = escalCoord || c.escalTargetId;
        return `
        <div style="background:#fff;border-radius:14px;padding:1rem 1.1rem;border:1.5px solid ${active?'#f0f0f0':'#fde68a'};box-shadow:0 1px 4px rgba(0,0,0,.05);transition:box-shadow .15s;"
             onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.1)'" onmouseleave="this.style.boxShadow='0 1px 4px rgba(0,0,0,.05)'">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.45rem;">
            <div style="display:flex;align-items:center;gap:.5rem;flex:1;min-width:0;">
              <span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:${type.color}18;flex-shrink:0;">
                    <i data-lucide="${COORD_LUCIDE_ICONS[c.type]||'calendar'}" style="width:15px;height:15px;color:${type.color};"></i>
                  </span>
              <span style="font-weight:700;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(c.name)}">${esc(c.name)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:.25rem;flex-shrink:0;">
              <span style="width:7px;height:7px;border-radius:50%;background:${active?'#22c55e':'#fbbf24'};display:inline-block;" title="${active?'Активна':'Призупинена'}"></span>
              ${isManager()?`
              <button onclick="openCoordModal('${c.id}')" style="background:none;border:none;cursor:pointer;color:#d1d5db;padding:2px 3px;"><i data-lucide="pencil" style="width:13px;height:13px;"></i></button>
              <button onclick="deleteCoord('${c.id}')" style="background:none;border:none;cursor:pointer;color:#fca5a5;padding:2px 3px;"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button>`:''}
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.55rem;">
            <span style="background:${type.color}18;color:${type.color};padding:.1rem .4rem;border-radius:5px;font-size:.7rem;font-weight:600;">${type.label}</span>
            ${sched?`<span style="background:#f3f4f6;color:#6b7280;padding:.1rem .4rem;border-radius:5px;font-size:.7rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span> ${esc(sched)}</span>`:''}
            <span style="background:#f0fdf4;color:#16a34a;padding:.1rem .4rem;border-radius:5px;font-size:.7rem;"><i data-lucide="users" style="width:10px;height:10px;display:inline;vertical-align:middle;margin-right:2px;"></i>${cnt}</span>
            <span style="background:#f3f4f6;color:#6b7280;padding:.1rem .4rem;border-radius:5px;font-size:.7rem;">⏱ ~${type.duration}хв</span>
            ${(c.dynamicAgenda||[]).length?`<span style="background:#fef3c7;color:#d97706;padding:.1rem .4rem;border-radius:5px;font-size:.7rem;"><i data-lucide="help-circle" style="width:10px;height:10px;display:inline;vertical-align:middle;margin-right:2px;"></i>${c.dynamicAgenda.length}</span>`:''}
          </div>
          <div style="font-size:.77rem;color:#6b7280;margin-bottom:.55rem;">
            Голова: <strong style="color:#374151;">${esc(chairName)}</strong>
            ${hasEscalated?`<span style="margin-left:.4rem;color:#9ca3af;font-size:.7rem;">↑ ескалація</span>`:''}
          </div>
          <div style="display:flex;gap:.4rem;">
            <button onclick="startCoordSession('${c.id}')" class="btn btn-success" style="flex:1;padding:.35rem;font-size:.78rem;border-radius:9px;">
              <i data-lucide="play" style="width:13px;height:13px;"></i> Розпочати
            </button>
            <button onclick="openDynAgenda('${c.id}')" style="padding:.35rem .55rem;border-radius:9px;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;font-size:.78rem;color:#6b7280;" title="${ct('agendaTitle')}"><i data-lucide="list" style="width:14px;height:14px;"></i></button>
            <button onclick="viewCoordHistory('${c.id}')" style="padding:.35rem .55rem;border-radius:9px;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;font-size:.78rem;color:#6b7280;" title="Протоколи"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span></button>
          </div>
        </div>`;
    }

    // ── Modal HTML ─────────────────────────────────────────
    function htmlModal() {
        const uOpts = coordUsers.map(u=>`<option value="${u.id}">${esc(u.name||u.email)}</option>`).join('');
        const cOpts = coordinations.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
        const fieldStyle = 'width:100%;box-sizing:border-box;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:14px;font-size:.95rem;background:#fff;outline:none;color:#1a1a1a;';
        const labelStyle = 'display:block;font-size:.82rem;font-weight:600;color:#6b7280;margin-bottom:.4rem;letter-spacing:.01em;';
        const sectionStyle = 'display:flex;flex-direction:column;gap:0;';
        return `
        <div id="coordModal" class="modal" role="dialog" aria-modal="true" style="display:none;">
          <div class="modal-content" style="max-width:560px;max-height:94vh;overflow-y:auto;padding:1.75rem;border-radius:24px;">
            <!-- Header -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;">
              <h2 id="coordModalTitle" style="margin:0;font-size:1.25rem;font-weight:700;color:#1a1a1a;">${ct('modalTitle')}</h2>
              <button onclick="closeCoordModal()" style="background:#f3f4f6;border:none;cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:1rem;color:#6b7280;display:flex;align-items:center;justify-content:center;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
            </div>

            <div style="display:flex;flex-direction:column;gap:1.25rem;">

              <!-- Назва -->
              <div style="${sectionStyle}">
                <label style="${labelStyle}"><i data-lucide="pen-line" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelName')}</label>
                <input id="coordName" type="text" placeholder="${ct('placeholderName')}"
                  style="${fieldStyle}"
                  onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
              </div>

              <!-- Тип + Статус -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div style="${sectionStyle}">
                  <label style="${labelStyle}"><i data-lucide="layout-grid" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelType')}</label>
                  <select id="coordType" style="${fieldStyle}cursor:pointer;">
                    ${Object.entries(TYPES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}
                  </select>
                </div>
                <div style="${sectionStyle}">
                  <label style="${labelStyle}"><i data-lucide="activity" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelStatus')}</label>
                  <select id="coordStatus" style="${fieldStyle}cursor:pointer;">
                    <option value="active">${ct('statusActive')}</option>
                    <option value="paused">${ct('statusPaused')}</option>
                  </select>
                </div>
              </div>

              <!-- Голова -->
              <div style="${sectionStyle}">
                <label style="${labelStyle}"><i data-lucide="user-check" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelChairman')}</label>
                <select id="coordChairman" style="${fieldStyle}cursor:pointer;">
                  <option value="">${ct('selectChairman')}</option>${uOpts}
                </select>
              </div>

              <!-- Учасники -->
              <div style="${sectionStyle}">
                <label style="${labelStyle}"><i data-lucide="users" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelParticipants')}</label>
                <div id="coordParticipants" style="display:flex;flex-wrap:wrap;gap:.5rem;padding:.75rem;border:1.5px solid #e5e7eb;border-radius:14px;min-height:52px;background:#fafafa;">
                  ${coordUsers.map(u=>`
                  <label style="display:flex;align-items:center;gap:.4rem;padding:.35rem .7rem;background:#fff;border-radius:10px;cursor:pointer;font-size:.85rem;font-weight:500;border:1.5px solid #e5e7eb;transition:all .15s;"
                    onmouseenter="this.style.borderColor='#22c55e';this.style.background='#f0fdf4'"
                    onmouseleave="this.style.borderColor='#e5e7eb';this.style.background='#fff'">
                    <input type="checkbox" class="coord-participant-cb" value="${u.id}" style="width:16px;height:16px;accent-color:#22c55e;">
                    ${esc(u.name||u.email)}
                  </label>`).join('')}
                </div>
              </div>

              <!-- День + Час -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div style="${sectionStyle}">
                  <label style="${labelStyle}"><i data-lucide="calendar-days" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelDay')}</label>
                  <select id="coordDay" style="${fieldStyle}cursor:pointer;">
                    <option value="">${ct('anyDay')}</option>
                    ${DAYS_UK.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}
                  </select>
                </div>
                <div style="${sectionStyle}">
                  <label style="${labelStyle}"><i data-lucide="clock" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelTime')}</label>
                  <input id="coordTime" type="time" style="${fieldStyle}"
                    onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
              </div>

              <!-- Фільтр завдань -->
              <div style="${sectionStyle}">
                <label style="${labelStyle}"><i data-lucide="filter" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelFilter')}</label>
                <div style="display:flex;flex-wrap:wrap;gap:.5rem;">
                  ${[[['filterFunctions',ct('filterFunctions')],['filterProjects',ct('filterProjects')],
                     ['filterAssignees',ct('filterAssignees')],['filterOverdue',ct('filterOverdue')],
                     ['filterReview',ct('filterReview')]]].map(([id,l])=>`
                  <label style="display:flex;align-items:center;gap:.4rem;padding:.4rem .75rem;background:#f0fdf4;border-radius:10px;cursor:pointer;font-size:.85rem;font-weight:500;border:1.5px solid #d1fae5;">
                    <input type="checkbox" id="coord_${id}" style="width:15px;height:15px;accent-color:#22c55e;">${l}
                  </label>`).join('')}
                </div>
              </div>

              <!-- Ескалація -->
              <div style="${sectionStyle}">
                <label style="${labelStyle}"><i data-lucide="arrow-up-circle" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelEscal')}</label>
                <select id="coordEscalTarget" style="${fieldStyle}cursor:pointer;">
                  <option value="">${ct('escalAuto')}</option>${cOpts}
                </select>
                <div style="font-size:.75rem;color:#9ca3af;margin-top:.35rem;padding-left:.25rem;">Невирішені питання автоматично потраплять вгору по ланцюжку</div>
              </div>

              <!-- Telegram -->
              <div style="${sectionStyle}">
                <label style="${labelStyle}"><i data-lucide="send" style="width:13px;height:13px;display:inline;vertical-align:middle;margin-right:4px;"></i>${ct('labelTelegram')}</label>
                <input id="coordTelegramChat" type="text" placeholder="-100xxxxxxxxxx"
                  style="${fieldStyle}"
                  onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='#e5e7eb'">
                <div style="font-size:.75rem;color:#9ca3af;margin-top:.35rem;padding-left:.25rem;">Протокол надсилається автоматично після завершення</div>
              </div>

              <!-- Buttons -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:.5rem;">
                <button onclick="closeCoordModal()" style="padding:.85rem;border-radius:14px;border:1.5px solid #e5e7eb;background:#fff;font-size:.95rem;font-weight:600;color:#6b7280;cursor:pointer;">${ct('btnCancel')}</button>
                <button onclick="saveCoord()" style="padding:.85rem;border-radius:14px;border:none;background:#22c55e;font-size:.95rem;font-weight:700;color:#fff;cursor:pointer;">${ct('btnSave')}</button>
              </div>

            </div>
          </div>
        </div>`;
    }

    function htmlDynAgenda() {
        return `
        <div id="coordDynAgendaModal" class="modal" role="dialog" style="display:none;z-index:10015;">
          <div class="modal-content" style="max-width:480px;max-height:80vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.9rem;">
              <h2 id="dynAgendaTitle" style="margin:0;font-size:1rem;"><i data-lucide="list-checks" style="width:12px;height:12px;margin-right:4px;"></i>${ct('agendaTitle')}</h2>
              <button onclick="closeDynAgenda()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#9ca3af;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
            </div>
            <div style="font-size:.78rem;color:#6b7280;margin-bottom:.65rem;">${ct('agendaHint')}</div>
            <div id="dynAgendaList" style="display:flex;flex-direction:column;gap:.35rem;margin-bottom:.65rem;"></div>
            <div style="display:flex;gap:.45rem;">
              <input id="dynAgendaInput" type="text" class="form-control" placeholder="Ваше питання..." style="flex:1;" onkeydown="if(event.key==='Enter')addDynAgendaItem()">
              <button onclick="addDynAgendaItem()" class="btn btn-success" style="padding:.38rem .7rem;">Додати</button>
            </div>
          </div>
        </div>`;
    }

    function htmlSession() {
        return `
        <div id="coordSessionModal" class="modal" role="dialog" aria-modal="true" style="display:none;z-index:10020;">
          <div class="modal-content" style="max-width:920px;width:96vw;max-height:96vh;overflow-y:auto;padding:1.2rem;">
            <!-- Header -->
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;border-bottom:2px solid #f0fdf4;padding-bottom:.7rem;margin-bottom:1rem;">
              <div>
                <h2 id="coordSessionTitle" style="margin:0 0 .2rem;font-size:1rem;"></h2>
                <div id="coordReadinessBar" style="font-size:.73rem;color:#6b7280;"></div>
              </div>
              <div style="display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;">
                <span id="coordTimer" style="font-size:1.15rem;font-weight:700;color:#16a34a;font-variant-numeric:tabular-nums;background:#f0fdf4;padding:.18rem .55rem;border-radius:8px;">00:00</span>
                <button onclick="finishCoordSession()" class="btn btn-success" style="padding:.38rem .9rem;font-size:.82rem;"><i data-lucide="check-circle" style="width:14px;height:14px;margin-right:4px;"></i>${ct('btnFinish')}</button>
                <button onclick="closeCoordSession()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#9ca3af;" title="Закрити"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
              </div>
            </div>
            <!-- Body grid -->
            <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:1.1rem;">
              <!-- Left -->
              <div>
                <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="list-checks" style="width:12px;height:12px;margin-right:4px;"></i>${ct('agendaSection')}</div>
                <div id="coordAgenda" style="display:flex;flex-direction:column;gap:.3rem;margin-bottom:1rem;"></div>
                <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="users" style="width:12px;height:12px;margin-right:4px;"></i>${ct('participantsLbl')}</div>
                <div id="coordParticipantRatings" style="display:flex;flex-direction:column;gap:.35rem;"></div>
              </div>
              <!-- Right -->
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
            <!-- Decisions -->
            <div style="margin-top:.8rem;border-top:1px solid #f0f0f0;padding-top:.7rem;">
              <div style="font-weight:700;font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="zap" style="width:12px;height:12px;margin-right:4px;"></i>Рішення</div>
              <div id="coordDecisions" style="display:flex;flex-direction:column;gap:.28rem;margin-bottom:.45rem;"></div>
              <div style="display:flex;gap:.45rem;">
                <input id="coordNewDecision" type="text" class="form-control" placeholder="Зафіксувати рішення..." style="flex:1;font-size:.83rem;" onkeydown="if(event.key==='Enter')addCoordDecision()">
                <button onclick="addCoordDecision()" class="btn btn-success" style="padding:.35rem .65rem;font-size:.8rem;">Додати</button>
              </div>
            </div>
            <!-- Unresolved / Escalation -->
            <div style="margin-top:.8rem;border-top:1px solid #f0f0f0;padding-top:.7rem;">
              <div style="font-weight:700;font-size:.78rem;color:#d97706;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem;"><i data-lucide="arrow-up-circle" style="width:12px;height:12px;margin-right:4px;color:#d97706;"></i>Ескалація (невирішені питання)</div>
              <div id="coordUnresolved" style="display:flex;flex-direction:column;gap:.28rem;margin-bottom:.45rem;"></div>
              <div style="display:flex;gap:.45rem;">
                <input id="coordNewUnresolved" type="text" class="form-control" placeholder="Питання що потребує ескалації вгору..." style="flex:1;font-size:.83rem;" onkeydown="if(event.key==='Enter')addUnresolved()">
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
        return `
        <div id="coordProtocolModal" class="modal" role="dialog" aria-modal="true" style="display:none;z-index:10030;">
          <div class="modal-content" style="max-width:680px;max-height:92vh;overflow-y:auto;padding:1.4rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem;flex-wrap:wrap;gap:.45rem;">
              <h2 style="margin:0;font-size:1rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span> ${ct('protocolTitle')}</h2>
              <div style="display:flex;gap:.35rem;flex-wrap:wrap;">
                <button onclick="sendProtocolToTelegram()" style="padding:.3rem .65rem;font-size:.76rem;background:#2b9ef4;color:#fff;border:none;border-radius:7px;cursor:pointer;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-1 1-.1.4.1.9.4 1.2l4 4L4 15l-2 1 1 2 2-1 3.8 1.2 4 4c.3.3.8.5 1.2.4.5-.1.9-.5 1-1z"/></svg></span> Telegram</button>
                <button onclick="exportCoordHistoryExcel()" style="padding:.3rem .65rem;font-size:.76rem;background:#16a34a;color:#fff;border:none;border-radius:7px;cursor:pointer;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> Excel</button>
                <button onclick="printProtocol()" style="padding:.3rem .65rem;font-size:.76rem;background:#f3f4f6;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></span> PDF</button>
                <button onclick="closeProtocolModal()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#9ca3af;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
              </div>
            </div>
            <div id="coordProtocolContent"></div>
          </div>
        </div>`;
    }

    function htmlAnalysis() {
        return `
        <div id="coordAnalysisModal" class="modal" role="dialog" style="display:none;z-index:10025;">
          <div class="modal-content" style="max-width:620px;max-height:90vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
              <h2 style="margin:0;font-size:1rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span> AI Аналіз координацій</h2>
              <button onclick="closeCoordAnalysis()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#9ca3af;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
            </div>
            <div id="coordAnalysisContent" style="min-height:180px;"></div>
            <div style="margin-top:1rem;display:flex;gap:.5rem;">
              <button onclick="runCoordAI()" class="btn btn-success" style="flex:1;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span> Аналізувати</button>
              <button onclick="closeCoordAnalysis()" class="btn" style="flex:1;">Закрити</button>
            </div>
          </div>
        </div>`;
    }

    // ── CRUD ───────────────────────────────────────────────
    window.openCoordModal = function(coordId=null) {
        editingCoordId = coordId;
        const m = document.getElementById('coordModal');
        if (!m) return;
        document.getElementById('coordModalTitle').textContent = coordId ? ct('modalEdit') : ct('modalTitle');
        ['coordName','coordTelegramChat'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
        ['coordType','coordStatus','coordChairman','coordDay','coordTime','coordEscalTarget'].forEach(id => {
            const e=document.getElementById(id); if(e) e.value='';
        });
        document.getElementById('coordType').value='weekly';
        document.getElementById('coordStatus').value='active';
        ['filterFunctions','filterProjects','filterAssignees','filterOverdue','filterReview']
            .forEach(id => { const e=document.getElementById('coord_'+id); if(e) e.checked=false; });
        document.querySelectorAll('.coord-participant-cb').forEach(cb => cb.checked=false);

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
                ['filterFunctions','filterProjects','filterAssignees','filterOverdue','filterReview']
                    .forEach(id => { const e=document.getElementById('coord_'+id); if(e) e.checked=!!f[id]; });
                document.querySelectorAll('.coord-participant-cb').forEach(cb => {
                    cb.checked = (c.participantIds||[]).includes(cb.value);
                });
            }
        }
        m.style.display='flex';
    };

    window.closeCoordModal = () => {
        const m=document.getElementById('coordModal'); if(m) m.style.display='none';
    };

    let _saveCoordLock = false;
    window.saveCoord = async function() {
        if (_saveCoordLock) return;
        _saveCoordLock = true;
        const name = document.getElementById('coordName').value.trim();
        if (!name) { _saveCoordLock = false; toast('Введіть назву','error'); return; }
        if (!window.currentCompanyId) { _saveCoordLock = false; return; }
        const participantIds = Array.from(document.querySelectorAll('.coord-participant-cb:checked')).map(cb=>cb.value);
        const filters={};
        ['filterFunctions','filterProjects','filterAssignees','filterOverdue','filterReview']
            .forEach(id => { const e=document.getElementById('coord_'+id); if(e) filters[id]=e.checked; });
        const data = {
            name,
            type: document.getElementById('coordType').value,
            status: document.getElementById('coordStatus').value,
            chairmanId: document.getElementById('coordChairman').value||null,
            participantIds,
            schedule: { day:document.getElementById('coordDay').value, time:document.getElementById('coordTime').value },
            taskFilters: filters,
            telegramChatId: document.getElementById('coordTelegramChat').value.trim()||null,
            escalTargetId: document.getElementById('coordEscalTarget').value||null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        try {
            if (editingCoordId) {
                await col('coordinations').doc(editingCoordId).update(data);
                toast('Оновлено');
            } else {
                data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
                data.createdBy=uid();
                await col('coordinations').add(data);
                toast('Координацію створено');
            }
            closeCoordModal();
        } catch(e) { toast('Помилка: '+e.message,'error'); }
        finally { _saveCoordLock = false; }
    };

    window.deleteCoord = async function(coordId) {
        const ok = window.showConfirmModal
            ? await window.showConfirmModal('Видалити координацію?',{danger:true})
            : (window.showConfirmModal ? await showConfirmModal('Видалити?',{danger:true}) : confirm('Видалити?'));
        if (!ok) return;
        try { await col('coordinations').doc(coordId).delete(); toast('Видалено'); }
        catch(e) { toast('Помилка видалення','error'); }
    };

    // ── Dynamic Agenda ─────────────────────────────────────
    let dynAgendaCoordId = null;

    window.openDynAgenda = function(coordId) {
        dynAgendaCoordId = coordId;
        const c = coordinations.find(x=>x.id===coordId);
        sessionDynamicAgenda = [...(c?.dynamicAgenda||[])];
        document.getElementById('dynAgendaTitle').textContent = '' + (c?.name||ct('agendaTitle'));
        renderDynAgendaList();
        document.getElementById('coordDynAgendaModal').style.display='flex';
    };

    window.closeDynAgenda = () => {
        const m=document.getElementById('coordDynAgendaModal'); if(m) m.style.display='none';
    };

    function renderDynAgendaList() {
        const el=document.getElementById('dynAgendaList');
        if (!el) return;
        if (!sessionDynamicAgenda.length) {
            el.innerHTML=`<div style="color:#9ca3af;font-size:.8rem;text-align:center;padding:.6rem;">Питань ще немає</div>`;
            return;
        }
        el.innerHTML=sessionDynamicAgenda.map((item,i)=>{
            const author=coordUsers.find(u=>u.id===item.authorId);
            return `<div style="display:flex;align-items:flex-start;gap:.4rem;padding:.45rem .55rem;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
              <span style="color:#16a34a;font-weight:700;flex-shrink:0;font-size:.82rem;">${i+1}.</span>
              <div style="flex:1;">
                <div style="font-size:.83rem;font-weight:600;">${esc(item.text)}</div>
                ${author?`<div style="font-size:.7rem;color:#9ca3af;">${esc(author.name||author.email)}</div>`:''}
                ${item.escalatedFrom?`<div style="font-size:.68rem;color:#d97706;">${"↑ "+ct('escalated')}</div>`:''}
              </div>
              ${isManager()?`<button onclick="removeDynItem(${i})" style="background:none;border:none;cursor:pointer;color:#fca5a5;font-size:.82rem;padding:0;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>`:''}
            </div>`;
        }).join('');
    }

    window.addDynAgendaItem = async function() {
        const input=document.getElementById('dynAgendaInput');
        const text=input?.value.trim();
        if (!text||!dynAgendaCoordId) return;
        sessionDynamicAgenda.push({text,authorId:uid(),addedAt:nowISO()});
        input.value='';
        try {
            await col('coordinations').doc(dynAgendaCoordId).update({dynamicAgenda:sessionDynamicAgenda});
            renderDynAgendaList();
        } catch(e) { toast('Помилка','error'); }
    };

    window.removeDynItem = async function(idx) {
        sessionDynamicAgenda.splice(idx,1);
        try {
            await col('coordinations').doc(dynAgendaCoordId).update({dynamicAgenda:sessionDynamicAgenda});
            renderDynAgendaList();
        } catch(e) { toast('Помилка','error'); }
    };

    // ── Session ────────────────────────────────────────────
    window.startCoordSession = async function(coordId) {
        const c = coordinations.find(x=>x.id===coordId);
        if (!c) return;
        activeSession={coordId,coord:c,startedAt:nowISO()};
        sessionDecisions=[];
        sessionUnresolved=[];
        sessionAgendaDone={};
        sessionDynamicAgenda=[...(c.dynamicAgenda||[])];

        document.getElementById('coordSessionTitle').textContent=c.name;
        ['coordNotes','coordNewDecision','coordNewUnresolved'].forEach(id=>{
            const e=document.getElementById(id); if(e) e.value='';
        });

        // Timer
        sessionStartTime=Date.now();
        clearInterval(timerInterval);
        const warnMin = Math.round((TYPES[c.type]?.duration||60)*0.8);
        timerInterval=setInterval(()=>{
            const elapsed=Math.floor((Date.now()-sessionStartTime)/1000);
            const m=String(Math.floor(elapsed/60)).padStart(2,'0');
            const s=String(elapsed%60).padStart(2,'0');
            const el=document.getElementById('coordTimer'); if(el) el.textContent=`${m}:${s}`;
            if (elapsed===warnMin*60) toast(`Залишилось ~${(TYPES[c.type]?.duration||60)-warnMin} хв`,'info');
        },1000);

        renderAgenda(c);
        renderSessionTasks(c);
        renderSessionMetrics(c);
        renderDecisions();
        renderUnresolved();

        document.getElementById('coordSessionModal').style.display='flex';

        // Async: readiness + rating
        const ids=c.participantIds||[];
        Promise.all([getReadiness(ids),getExecutionRating(ids)]).then(([read,rate])=>{
            renderReadinessBar(ids,read);
            renderParticipantRatings(ids,read,rate);
        });
    };

    function renderReadinessBar(ids, read) {
        const el=document.getElementById('coordReadinessBar'); if(!el) return;
        const ready=ids.filter(id=>read[id]?.opened).length;
        const color=ready===ids.length?'#22c55e':ready>ids.length/2?'#f59e0b':'#ef4444';
        const notReady=ids.filter(id=>!read[id]?.opened).map(id=>{
            const u=coordUsers.find(u=>u.id===id); return u?(u.name||u.email).split(' ')[0]:'?';
        });
        el.innerHTML=`<span style="color:${color};font-weight:600;">${ready}/${ids.length} готові</span>${notReady.length?` <span style="color:#9ca3af;">· не відкрили: ${notReady.join(', ')}</span>`:''}`;
    }

    function renderParticipantRatings(ids, read, rate) {
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
              ${r.overdue?`<span style="font-size:.68rem;background:#fef2f2;color:#ef4444;padding:.08rem .3rem;border-radius:4px;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#ef4444"/></svg></span>${r.overdue}</span>`:''}
              <span style="font-size:.68rem;color:#9ca3af;">${r.completed}/${r.total}</span>
            </div>`;
        }).join('');
    }

    function renderAgenda(c) {
        const el=document.getElementById('coordAgenda'); if(!el) return;
        const items=[...AGENDA_BASE];
        if ((c.dynamicAgenda||[]).length) {
            items.splice(3,0,{id:'dynamic',icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>',label:`${ct('questionsLbl')} (${c.dynamicAgenda.length})`});
        }
        el.innerHTML=items.map(item=>`
        <div style="display:flex;align-items:center;gap:.4rem;padding:.38rem .55rem;border-radius:8px;border:1.5px solid ${sessionAgendaDone[item.id]?'#22c55e':'#e5e7eb'};background:${sessionAgendaDone[item.id]?'#f0fdf4':'#fff'};cursor:pointer;transition:all .12s;"
             onclick="toggleAgendaItem('${item.id}',this)">
          <input type="checkbox" ${sessionAgendaDone[item.id]?'checked':''} style="pointer-events:none;margin:0;">
          <span style="font-size:.82rem;">${item.icon}</span>
          <span style="font-size:.78rem;font-weight:600;color:${sessionAgendaDone[item.id]?'#16a34a':'#374151'};">${item.label}</span>
        </div>`).join('');
    }

    window.toggleAgendaItem = function(id, el) {
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
            if(f.filterFunctions){
                const pf=coordFunctions.filter(fn=>(fn.assigneeIds||[]).some(id=>pids.includes(id))).map(fn=>fn.id);
                return pf.includes(t.functionId);
            }
            return pids.includes(t.assigneeId)||pids.includes(t.creatorId);
        });
        filtered.sort((a,b)=>{
            const ao=a.deadlineDate&&a.deadlineDate<today, bo=b.deadlineDate&&b.deadlineDate<today;
            if(ao&&!bo) return -1; if(!ao&&bo) return 1;
            return (a.deadlineDate||'').localeCompare(b.deadlineDate||'');
        });
        const el=document.getElementById('coordTaskList'); if(!el) return;
        if(!filtered.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;text-align:center;padding:.4rem;">Завдань немає</div>`;return;}
        const sc={new:'#3b82f6',progress:'#f59e0b',review:'#8b5cf6',done:'#22c55e'};
        const sl={new:'Нове',progress:'В роботі',review:'Перевірка',done:'Виконано'};
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
              <div style="font-size:.68rem;color:#9ca3af;margin-top:1px;">${an?`${esc(an)}`:''}${t.deadlineDate?` · ${fmtDate(t.deadlineDate)}`:''}</div>
            </div>`;
        }).join('');
    }

    function renderSessionMetrics(c) {
        const el=document.getElementById('coordMetricsList'); if(!el) return;
        const entries=window._statsAllEntries||[];
        const metrics=coordMetrics.filter(m=>m.privacy!=='owner_only'||isManager()).slice(0,8);
        if(!metrics.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;">Метрики не налаштовані</div>`;return;}
        el.innerHTML=metrics.map(m=>{
            const last=entries.filter(e=>e.metricId===m.id).sort((a,b)=>(b.period||'').localeCompare(a.period||''))[0];
            const val=last?.value;
            const tgt=m.target;
            const ok=val!==undefined&&tgt!==undefined?val>=tgt:null;
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:.28rem .45rem;border-radius:6px;background:#f9fafb;border:1px solid #f0f0f0;">
              <span style="font-size:.76rem;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(m.name)}</span>
              <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0;">
                ${val!==undefined?`<span style="font-size:.8rem;font-weight:700;color:${ok===true?'#16a34a':ok===false?'#ef4444':'#374151'};">${val}${m.unit?' '+m.unit:''}</span>`:'<span style="color:#d1d5db;font-size:.72rem;">—</span>'}
                ${tgt!==undefined?`<span style="font-size:.68rem;color:#9ca3af;">/${tgt}</span>`:''}
                ${ok===true?'<i data-lucide="check-circle" style="width:13px;height:13px;color:#22c55e;"></i>':ok===false?'<i data-lucide="x-circle" style="width:13px;height:13px;color:#ef4444;"></i>':''}
              </div>
            </div>`;
        }).join('');
    }

    window.addCoordDecision = function() {
        const inp=document.getElementById('coordNewDecision');
        const text=inp?.value.trim(); if(!text) return;
        sessionDecisions.push({text,time:nowISO(),authorId:uid()});
        inp.value=''; renderDecisions();
    };
    function renderDecisions() {
        const el=document.getElementById('coordDecisions'); if(!el) return;
        if(!sessionDecisions.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;">Рішень ще немає</div>`;return;}
        el.innerHTML=sessionDecisions.map((d,i)=>`
        <div style="display:flex;align-items:flex-start;gap:.35rem;padding:.3rem .45rem;background:#f0fdf4;border-radius:6px;border:1px solid #d1fae5;">
          <span style="color:#16a34a;font-weight:700;flex-shrink:0;font-size:.8rem;">${i+1}.</span>
          <span style="flex:1;font-size:.8rem;">${esc(d.text)}</span>
          <button onclick="removeDecision(${i})" style="background:none;border:none;cursor:pointer;color:#fca5a5;font-size:.8rem;padding:0;line-height:1;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
        </div>`).join('');
    }
    window.removeDecision = idx => { sessionDecisions.splice(idx,1); renderDecisions(); };

    window.addUnresolved = function() {
        const inp=document.getElementById('coordNewUnresolved');
        const text=inp?.value.trim(); if(!text) return;
        sessionUnresolved.push({text,time:nowISO(),authorId:uid()});
        inp.value=''; renderUnresolved();
    };
    function renderUnresolved() {
        const el=document.getElementById('coordUnresolved'); if(!el) return;
        if(!sessionUnresolved.length){el.innerHTML=`<div style="color:#9ca3af;font-size:.76rem;">Невирішених питань немає</div>`;return;}
        el.innerHTML=sessionUnresolved.map((d,i)=>`
        <div style="display:flex;align-items:flex-start;gap:.35rem;padding:.3rem .45rem;background:#fefce8;border-radius:6px;border:1px solid #fde68a;">
          <span style="color:#d97706;font-weight:700;flex-shrink:0;font-size:.8rem;">!</span>
          <span style="flex:1;font-size:.8rem;">${esc(d.text)}</span>
          <button onclick="removeUnresolved(${i})" style="background:none;border:none;cursor:pointer;color:#fca5a5;font-size:.8rem;padding:0;line-height:1;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></button>
        </div>`).join('');
    }
    window.removeUnresolved = idx => { sessionUnresolved.splice(idx,1); renderUnresolved(); };

    window.openAddTaskFromCoord = function() {
        document.getElementById('coordSessionModal').style.display='none';
        if (window.openTaskModal) window.openTaskModal();
    };

    window.closeCoordSession = function() {
        document.getElementById('coordSessionModal').style.display='none';
        clearInterval(timerInterval);
        activeSession=null;
    };

    window.finishCoordSession = async function() {
        if (!activeSession) return;
        clearInterval(timerInterval);
        const notes=document.getElementById('coordNotes')?.value||'';
        const c=activeSession.coord;

        const session={
            coordId:activeSession.coordId,
            coordName:c.name,
            coordType:c.type,
            startedAt:activeSession.startedAt,
            finishedAt:nowISO(),
            decisions:sessionDecisions,
            unresolved:sessionUnresolved,
            agendaDone:sessionAgendaDone,
            dynamicAgendaItems:sessionDynamicAgenda,
            notes,
            conductedBy:uid(),
            participantIds:c.participantIds||[],
            taskSnapshot:coordTasks
                .filter(t=>(c.participantIds||[]).includes(t.assigneeId))
                .slice(0,50)
                .map(t=>({id:t.id,title:t.title,status:t.status,assigneeId:t.assigneeId,deadlineDate:t.deadlineDate})),
            createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            const ref=await col('coordination_sessions').add(session);
            session.id=ref.id;

            // Escalation
            if (sessionUnresolved.length) {
                const escalId=c.escalTargetId||findEscalTarget(c);
                if (escalId) {
                    const escalCoord=coordinations.find(x=>x.id===escalId);
                    const existing=escalCoord?.dynamicAgenda||[];
                    await col('coordinations').doc(escalId).update({
                        dynamicAgenda:[...existing,...sessionUnresolved.map(u=>({
                            text:`[Ескалація з "${c.name}"] ${u.text}`,
                            authorId:uid(),addedAt:nowISO(),escalatedFrom:activeSession.coordId
                        }))]
                    });
                    toast(`${sessionUnresolved.length} питань ескальовано ↑`);
                }
            }

            // Clear dynamic agenda
            if ((c.dynamicAgenda||[]).length) {
                await col('coordinations').doc(activeSession.coordId).update({dynamicAgenda:[]});
            }

            document.getElementById('coordSessionModal').style.display='none';
            activeSession=null;

            // Auto Telegram
            if (c.telegramChatId) await sendTelegramProto(session,c.telegramChatId);

            showProtocol(session);
        } catch(e) { console.error(e); toast('Помилка: '+e.message,'error'); }
    };

    function findEscalTarget(c) {
        const tt=ESCALATION_CHAIN[c.type]; if(!tt) return null;
        return coordinations.find(x=>x.type===tt)?.id||null;
    }

    // ── Protocol ───────────────────────────────────────────
    function showProtocol(session) {
        currentProtocol=session;
        const content=document.getElementById('coordProtocolContent'); if(!content) return;
        const type=TYPES[session.coordType]||{icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>',label:''};
        const startD=session.startedAt?new Date(session.startedAt):null;
        const endD=session.finishedAt?new Date(session.finishedAt):null;
        const dur=startD&&endD?Math.round((endD-startD)/60000):0;
        const decisions=session.decisions||[];
        const unresolved=session.unresolved||[];

        const taskRows=(session.taskSnapshot||[]).map(t=>{
            const a=coordUsers.find(u=>u.id===t.assigneeId);
            const sl={new:'Нове',progress:'В роботі',review:'Перевірка',done:'Виконано'};
            const ov=t.deadlineDate&&t.deadlineDate<todayStr();
            return `<tr>
              <td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;${ov?'color:#ef4444;':''}">${esc(t.title)}</td>
              <td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;">${esc(a?a.name||a.email:'—')}</td>
              <td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;">${sl[t.status]||t.status}</td>
              <td style="padding:4px 7px;border-bottom:1px solid #f0f0f0;font-size:.78rem;">${t.deadlineDate?fmtDate(t.deadlineDate):'—'}</td>
            </tr>`;
        }).join('');

        content.innerHTML=`<div id="protocolPrintable">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;border-radius:12px;padding:1.1rem;margin-bottom:.9rem;">
            <div style="font-size:.72rem;opacity:.8;margin-bottom:.2rem;">${type.label}</div>
            <div style="font-weight:800;font-size:1.05rem;margin-bottom:.2rem;">${esc(session.coordName)}</div>
            <div style="font-size:.76rem;opacity:.9;">${startD?fmtDate(session.startedAt):''} · ${startD?fmtTime(session.startedAt):''} — ${endD?fmtTime(session.finishedAt):''}${dur?' · '+dur+' хв':''}</div>
          </div>
          ${decisions.length?`<div style="margin-bottom:.85rem;">
            <div style="font-weight:700;font-size:.8rem;color:#374151;margin-bottom:.4rem;border-bottom:1.5px solid #f0fdf4;padding-bottom:.2rem;"><i data-lucide="zap" style="width:12px;height:12px;margin-right:4px;">>${ct('decisionsLbl')} (${decisions.length})</div>
            ${decisions.map((d,i)=>`<div style="display:flex;gap:.4rem;padding:.3rem 0;border-bottom:1px solid #f9fafb;">
              <span style="color:#16a34a;font-weight:700;">${i+1}.</span>
              <span style="font-size:.8rem;">${esc(d.text)}</span>
            </div>`).join('')}
          </div>`:''}
          ${unresolved.length?`<div style="margin-bottom:.85rem;">
            <div style="font-weight:700;font-size:.8rem;color:#d97706;margin-bottom:.4rem;border-bottom:1.5px solid #fef9c3;padding-bottom:.2rem;"><i data-lucide="arrow-up-circle" style="width:12px;height:12px;margin-right:4px;color:#d97706;">>${ct('escalLbl')} (${unresolved.length})</div>
            ${unresolved.map((d,i)=>`<div style="display:flex;gap:.4rem;padding:.3rem 0;border-bottom:1px solid #fef9c3;">
              <span style="color:#d97706;font-weight:700;">${i+1}.</span>
              <span style="font-size:.8rem;">${esc(d.text)}</span>
            </div>`).join('')}
          </div>`:''}
          ${session.taskSnapshot?.length?`<div style="margin-bottom:.85rem;">
            <div style="font-weight:700;font-size:.8rem;color:#374151;margin-bottom:.4rem;border-bottom:1.5px solid #f0fdf4;padding-bottom:.2rem;"><i data-lucide="check-square" style="width:12px;height:12px;margin-right:4px;"></i>Завдання (${session.taskSnapshot.length})</div>
            <table style="width:100%;border-collapse:collapse;">
              <tr style="background:#f9fafb;">
                <th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Завдання</th>
                <th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Виконавець</th>
                <th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Статус</th>
                <th style="padding:5px 7px;text-align:left;font-size:.72rem;color:#6b7280;">Дедлайн</th>
              </tr>${taskRows}
            </table>
          </div>`:''}
          ${session.notes?`<div style="margin-bottom:.85rem;">
            <div style="font-weight:700;font-size:.8rem;color:#374151;margin-bottom:.35rem;"><i data-lucide="file-text" style="width:12px;height:12px;margin-right:4px;"></i>Нотатки</div>
            <div style="font-size:.8rem;white-space:pre-wrap;background:#f9fafb;padding:.5rem;border-radius:8px;">${esc(session.notes)}</div>
          </div>`:''}
          <div style="margin-top:.85rem;padding-top:.6rem;border-top:1px solid #e5e7eb;font-size:.68rem;color:#9ca3af;">TALKO System · ${fmtDate(nowISO())}</div>
        </div>`;
        document.getElementById('coordProtocolModal').style.display='flex';
    }

    window.closeProtocolModal = function() {
        const m=document.getElementById('coordProtocolModal'); if(m) m.style.display='none';
        currentProtocol=null;
    };

    window.printProtocol = function() {
        const el=document.getElementById('protocolPrintable'); if(!el) return;
        const w=window.open('','_blank');
        w.document.write(`<html><head><meta charset="utf-8"><style>
          @page{margin:12mm} body{font-family:Arial,sans-serif;font-size:11px;color:#1a1a1a}
          table{width:100%;border-collapse:collapse} th,td{padding:5px 7px;border-bottom:1px solid #e5e7eb;text-align:left}
          th{background:#f9fafb;font-weight:600;font-size:10px;color:#6b7280}
        </style></head><body>${el.innerHTML}</body></html>`);
        w.document.close();
        setTimeout(()=>w.print(),350);
    };

    async function sendTelegramProto(session, chatId) {
        try {
            const snap=await db().collection('settings').doc('telegram').get();
            const token=snap.data()?.botToken; if(!token) return;
            const type=TYPES[session.coordType]||{icon:'<span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>'};
            const dec=session.decisions||[];
            const unr=session.unresolved||[];
            const lines=[`*${session.coordName}*`,
                `${fmtDate(session.startedAt)} ${fmtTime(session.startedAt)}—${fmtTime(session.finishedAt)}`,''];
            if(dec.length){lines.push(ct('decisionsLbl')+':');dec.forEach((d,i)=>lines.push(`${i+1}. ${d.text}`));lines.push('');}
            if(unr.length){lines.push(ct('escalLbl')+':');unr.forEach((d,i)=>lines.push(`${i+1}. ${d.text}`));lines.push('');}
            if(session.taskSnapshot?.length){
                lines.push(`*Завдань:* ${session.taskSnapshot.length}`);
                session.taskSnapshot.slice(0,5).forEach(t=>{
                    const a=coordUsers.find(u=>u.id===t.assigneeId);
                    lines.push(`• ${t.title}${a?' — '+(a.name||a.email).split(' ')[0]:''}`);
                });
                if(session.taskSnapshot.length>5) lines.push(`_...+${session.taskSnapshot.length-5}_`);
                lines.push('');
            }
            lines.push('_TALKO System_');
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
                method:'POST',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({chat_id:chatId,text:lines.join('\n'),parse_mode:'Markdown'})
            });
        } catch(e){console.warn('[COORD] TG:',e);}
    }

    window.sendProtocolToTelegram = async function() {
        if(!currentProtocol) return;
        const c=coordinations.find(x=>x.id===currentProtocol.coordId);
        if(!c?.telegramChatId){toast('Telegram чат не налаштований','error');return;}
        await sendTelegramProto(currentProtocol,c.telegramChatId);
        toast('Надіслано в Telegram <span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>');
    };

    // ── History ────────────────────────────────────────────
    window.viewCoordHistory = async function(coordId) {
        const coord=coordinations.find(c=>c.id===coordId); if(!coord) return;
        try {
            const snap=await col('coordination_sessions')
                .where('coordId','==',coordId).orderBy('createdAt','desc').limit(20).get();
            if(snap.empty){toast(ct('noProtocols'),'info');return;}
            const sessions=snap.docs.map(d=>({id:d.id,...d.data()}));
            const content=document.getElementById('coordProtocolContent'); if(!content) return;
            content.innerHTML=`
            <div style="font-weight:700;margin-bottom:.65rem;">${ct('protocolsTitle')}: ${esc(coord.name)}</div>
            ${sessions.map(s=>{
                const dur=s.startedAt&&s.finishedAt?Math.round((new Date(s.finishedAt)-new Date(s.startedAt))/60000):0;
                return `<div onclick="loadSessionProtocol('${s.id}')"
                  style="padding:.58rem .7rem;border:1.5px solid #e5e7eb;border-radius:10px;margin-bottom:.35rem;cursor:pointer;background:#f9fafb;transition:background .12s;"
                  onmouseenter="this.style.background='#f0fdf4'" onmouseleave="this.style.background='#f9fafb'">
                  <div style="font-weight:600;font-size:.82rem;">${fmtDate(s.startedAt)} ${fmtTime(s.startedAt)}</div>
                  <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">
                    ${(s.decisions||[]).length} рішень · ${(s.taskSnapshot||[]).length} завдань${dur?' · '+dur+'хв':''}${(s.unresolved||[]).length?' · '+s.unresolved.length+' ескал.':''}
                  </div>
                </div>`;
            }).join('')}`;
            document.getElementById('coordProtocolModal').style.display='flex';
        } catch(e){toast('Помилка завантаження','error');}
    };

    window.loadSessionProtocol = async function(sessionId) {
        try {
            const snap=await col('coordination_sessions').doc(sessionId).get();
            if(!snap.exists) return;
            showProtocol({id:snap.id,...snap.data()});
        } catch(e){toast('Помилка','error');}
    };

    // ── AI Analysis ────────────────────────────────────────
    window.openCoordAnalysis = () => { document.getElementById('coordAnalysisModal').style.display='flex'; };
    window.closeCoordAnalysis = () => { document.getElementById('coordAnalysisModal').style.display='none'; };

    window.runCoordAI = async function() {
        const el=document.getElementById('coordAnalysisContent'); if(!el) return;
        el.innerHTML=`<div style="text-align:center;padding:2rem;color:#9ca3af;"><div style="font-size:2rem;margin-bottom:.5rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span></div>Аналізую...</div>`;
        try {
            const snap=await col('coordination_sessions').orderBy('createdAt','desc').limit(30).get();
            const sessions=snap.docs.map(d=>({id:d.id,...d.data()}));
            if(!sessions.length){el.innerHTML=`<div style="text-align:center;padding:2rem;color:#9ca3af;">Проведіть хоча б одну координацію</div>`;return;}
            const patterns=analyzePatterns(sessions);

            // Try Anthropic API via settings
            let aiText='';
            try {
                const sSnap=await db().collection('settings').doc('ai').get();
                const apiKey=sSnap.data()?.anthropicApiKey||sSnap.data()?.apiKey;
                if(apiKey){
                    const resp=await fetch('https://api.anthropic.com/v1/messages',{
                        method:'POST',
                        headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
                        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:800,
                            messages:[{role:'user',content:buildPrompt(patterns)}]})
                    });
                    const data=await resp.json();
                    aiText=data.content?.[0]?.text||'';
                }
            } catch(ae){console.warn('[COORD] AI API:',ae);}

            el.innerHTML=`
            ${aiText?`<div style="background:linear-gradient(135deg,#7c3aed15,#a855f715);border:1.5px solid #e9d5ff;border-radius:12px;padding:.9rem;margin-bottom:.85rem;">
              <div style="font-weight:700;color:#7c3aed;margin-bottom:.4rem;font-size:.83rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/></svg></span> ${ct('aiTitle')}</div>
              <div style="font-size:.82rem;color:#374151;white-space:pre-wrap;line-height:1.55;">${esc(aiText)}</div>
            </div>`:''}
            ${renderPatterns(patterns)}`;
        } catch(e){el.innerHTML=`<div style="color:#ef4444;padding:1rem;">Помилка: ${esc(e.message)}</div>`;}
    };

    function analyzePatterns(sessions) {
        const df={},uf={};
        let td=0,tu=0;
        sessions.forEach(s=>{
            (s.decisions||[]).forEach(d=>{td++;const k=d.text.toLowerCase().slice(0,40);df[k]=(df[k]||0)+1;});
            (s.unresolved||[]).forEach(u=>{tu++;const k=u.text.toLowerCase().slice(0,40);uf[k]=(uf[k]||0)+1;});
        });
        const repD=Object.entries(df).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const repU=Object.entries(uf).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const avgDur=sessions.reduce((a,s)=>{
            if(!s.startedAt||!s.finishedAt) return a;
            return a+Math.round((new Date(s.finishedAt)-new Date(s.startedAt))/60000);
        },0)/sessions.length||0;
        return {total:sessions.length,totalDecisions:td,totalUnresolved:tu,repD,repU,avgDur:Math.round(avgDur)};
    }

    function buildPrompt(p) {
        return `Ти AI-аналітик TALKO. Дай конкретні рекомендації по координаціях (українська, коротко).

Дані: ${p.total} координацій, ${p.totalDecisions} рішень, ${p.totalUnresolved} ескальовано, середня тривалість ${p.avgDur}хв.
Повторювані рішення: ${p.repD.map(([k,c])=>`"${k}"(${c}р)`).join(', ')||'немає'}
Повторювані проблеми: ${p.repU.map(([k,c])=>`"${k}"(${c}р)`).join(', ')||'немає'}

3-4 конкретні рекомендації що зробити. Без зайвих слів.`;
    }

    function renderPatterns(p) {
        let html='';
        if(p.repD.length) html+=`<div style="background:#fef3c7;border-radius:8px;padding:.6rem;margin-bottom:.5rem;">
          <div style="font-weight:600;font-size:.8rem;color:#92400e;margin-bottom:.3rem;"><span style="display:inline-flex;align-items:center;vertical-align:middle;line-height:1;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></span> Повторювані рішення → системна проблема</div>
          ${p.repD.map(([k,c])=>`<div style="font-size:.76rem;color:#374151;margin-top:2px;">• "${k}..." — ${c} рази</div>`).join('')}
        </div>`;
        if(p.repU.length) html+=`<div style="background:#fef2f2;border-radius:8px;padding:.6rem;margin-bottom:.5rem;">
          <div style="font-weight:600;font-size:.8rem;color:#991b1b;margin-bottom:.3rem;"><i data-lucide="alert-triangle" style="width:12px;height:12px;margin-right:4px;"></i>Повторювані невирішені питання → потрібне рішення власника</div>
          ${p.repU.map(([k,c])=>`<div style="font-size:.76rem;color:#374151;margin-top:2px;">• "${k}..." — ${c} рази</div>`).join('')}
        </div>`;
        html+=`<div style="background:#f0fdf4;border-radius:8px;padding:.6rem;">
          <div style="font-weight:600;font-size:.8rem;color:#166534;margin-bottom:.3rem;"><i data-lucide="bar-chart-2" style="width:12px;height:12px;margin-right:4px;"></i>Загальна статистика</div>
          <div style="font-size:.76rem;color:#374151;">${ct('statsSummary').replace('{total}',p.total).replace('{decisions}',p.totalDecisions).replace('{unresolved}',p.totalUnresolved).replace('{avg}',p.avgDur)}</div>
        </div>`;
        return html;
    }

    // ── Tab integration ────────────────────────────────────
    function initCoordTab() {
        dbg('[Coord] initCoordTab called, companyId:', window.currentCompanyId);
        renderCoordination();
        loadCoordData();
    }
    window._initCoordTab = initCoordTab;

    // Реєструємо через onSwitchTab registry
    if (window.onSwitchTab) {
        window.onSwitchTab('coordination', initCoordTab);
        dbg('[Coord] registered via onSwitchTab');
    } else {
        console.warn('[Coord] window.onSwitchTab not found — will retry');
        // Fallback: чекаємо поки onSwitchTab з'явиться
        let retries = 0;
        const retry = setInterval(() => {
            if (window.onSwitchTab) {
                window.onSwitchTab('coordination', initCoordTab);
                dbg('[Coord] registered via onSwitchTab (retry', ++retries, ')');
                clearInterval(retry);
            } else if (++retries > 20) {
                clearInterval(retry);
                console.error('[Coord] onSwitchTab never appeared');
            }
        }, 100);
    }

    // Fallback через companyLoaded event — якщо вже на coordination вкладці
    document.addEventListener('companyLoaded', () => {
        dbg('[Coord] companyLoaded event, checking active tab');
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'coordinationTab') {
            dbg('[Coord] coordination is active tab, init');
            initCoordTab();
        }
    });

    // Cleanup для logout
    window.destroyCoordListeners = function() {
        coordUnsubscribes.forEach(u => { try { u(); } catch(e) {} });
        coordUnsubscribes = [];
        activeSession = null;
        coordinations = [];
        coordTasks = [];
    };

})();
