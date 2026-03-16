// ============================================================
// js/modules/77d-crm-import.js — CRM імпорт клієнтів/угод з CSV
//
// Flow:
//   1. Юзер відкриває modal → завантажує CSV/XLSX
//   2. Парсинг в браузері (Papa Parse або ручний CSV)
//   3. Preview таблиця (перші 5 рядків) + маппінг колонок
//   4. Вибір: імпортувати як Клієнти або Угоди
//   5. Batch write в Firestore (по 499 за раз)
//   6. Toast з результатом
// ============================================================

window.crmOpenImport = function () {
    const existing = document.getElementById('crmImportModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'crmImportModal';
    modal.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10050;
        display:flex;align-items:center;justify-content:center;padding:1rem;`;
    modal.innerHTML = `
    <div style="background:white;border-radius:14px;width:100%;max-width:680px;
        max-height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;
            padding:1rem 1.25rem;border-bottom:1px solid #e8eaed;flex-shrink:0;">
            <div>
                <div style="font-weight:700;font-size:0.95rem;color:#111827;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Імпорт клієнтів / угод</div>
                <div style="font-size:0.72rem;color:#9ca3af;margin-top:1px;">CSV або Excel (.xlsx)</div>
            </div>
            <button onclick="document.getElementById('crmImportModal').remove()"
                style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.2rem;padding:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <!-- Body -->
        <div id="crmImportBody" style="flex:1;overflow-y:auto;padding:1.25rem;">
            ${_crmImportStepUpload()}
        </div>
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

function _crmImportStepUpload() {
    return `
    <div style="display:flex;flex-direction:column;gap:1rem;">
        <!-- Drop zone -->
        <div id="crmImportDropzone"
            onclick="document.getElementById('crmImportFileInput').click()"
            ondragover="event.preventDefault();this.style.background='#f0fdf4';this.style.borderColor='#22c55e';"
            ondragleave="this.style.background='#f8fafc';this.style.borderColor='#e8eaed';"
            ondrop="event.preventDefault();this.style.background='#f8fafc';this.style.borderColor='#e8eaed';crmImportHandleFile(event.dataTransfer.files[0])"
            style="border:2px dashed #e8eaed;border-radius:10px;padding:2.5rem;text-align:center;
            cursor:pointer;background:#f8fafc;transition:all 0.15s;">
            <div style="font-size:2rem;margin-bottom:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <div style="font-weight:600;color:#374151;font-size:0.88rem;">Перетягніть файл або натисніть</div>
            <div style="color:#9ca3af;font-size:0.75rem;margin-top:0.25rem;">CSV, XLSX — до 10 МБ</div>
        </div>
        <input type="file" id="crmImportFileInput" accept=".csv,.xlsx,.xls" style="display:none"
            onchange="crmImportHandleFile(this.files[0])">

        <!-- Шаблон -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:0.75rem 1rem;">
            <div style="font-size:0.78rem;font-weight:600;color:#16a34a;margin-bottom:0.4rem;">Формат CSV:</div>
            <div style="font-size:0.72rem;color:#374151;font-family:monospace;line-height:1.6;">
                name,phone,email,source,niche,note<br>
                Іванов Петро,+380501234567,ivan@mail.com,instagram,Стоматологія,VIP клієнт
            </div>
            <button onclick="crmImportDownloadTemplate()"
                style="margin-top:0.6rem;padding:0.3rem 0.7rem;background:white;color:#16a34a;
                border:1px solid #bbf7d0;border-radius:6px;font-size:0.73rem;cursor:pointer;font-weight:600;">
                ⬇ Завантажити шаблон
            </button>
        </div>
    </div>`;
}

window.crmImportDownloadTemplate = function () {
    const csv = 'name,phone,email,source,niche,note\nІванов Петро,+380501234567,ivan@mail.com,instagram,Стоматологія,VIP клієнт\nПетренко Марія,+380672345678,,site_form,Ортопедія,';
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'crm_import_template.csv';
    a.click();
};

window.crmImportHandleFile = async function (file) {
    if (!file) return;
    const body = document.getElementById('crmImportBody');
    body.innerHTML = '<div style="text-align:center;padding:2rem;color:#9ca3af;">Читаємо файл...</div>';

    try {
        let rows = [];

        if (file.name.endsWith('.csv') || file.type === 'text/csv') {
            const text = await file.text();
            rows = _parseCsv(text);
        } else if (file.name.match(/\.xlsx?$/i)) {
            rows = await _parseXlsx(file);
        } else {
            throw new Error(window.t('unsupportedFormat'));
        }

        if (rows.length < 2) throw new Error(window.t('fileEmpty'));
        if (rows.length > 10001) throw new Error(`Занадто багато рядків (${rows.length - 1}). Максимум 10 000 записів за один імпорт.`);

        window._crmImportRows = rows;
        _crmImportStepMapping(rows);
    } catch (e) {
        body.innerHTML = `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:1rem;color:#dc2626;font-size:0.82rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ${_escHtml(e.message)}
        </div>
        <button id="crmImportBackBtn"
            style="margin-top:0.75rem;padding:0.4rem 1rem;background:#f4f5f7;border:1px solid #e8eaed;
            border-radius:7px;cursor:pointer;font-size:0.8rem;">← Назад</button>`;
        document.getElementById('crmImportBackBtn').onclick = function () {
            body.innerHTML = _crmImportStepUpload();
            var inp = document.getElementById('crmImportFileInput');
            if (inp) inp.onchange = function (ev) { crmImportHandleFile(ev.target.files[0]); };
        };
    }
};

// ── CSV parser (без зовнішніх залежностей) ─────────────────
function _parseCsv(text) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
    return lines.map(line => {
        const cols = [];
        let cur = '', inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQuote = !inQuote; continue; }
            if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; continue; }
            cur += ch;
        }
        cols.push(cur.trim());
        return cols;
    });
}

// ── XLSX parser (через SheetJS якщо є, інакше помилка) ──────
async function _parseXlsx(file) {
    if (typeof XLSX === 'undefined') {
        // Завантажуємо SheetJS динамічно
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            s.onload = res; s.onerror = () => rej(new Error('Не вдалось завантажити XLSX парсер'));
            document.head.appendChild(s);
        });
    }
    const buf = await file.arrayBuffer();
    const wb  = XLSX.read(buf, { type: 'array' });
    const ws  = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
               .filter(r => r.some(c => c !== ''));
}

// ── Step 2: маппінг колонок ─────────────────────────────────
function _crmImportStepMapping(rows) {
    const body = document.getElementById('crmImportBody');
    const headers = rows[0];
    const preview = rows.slice(1, 6);

    const FIELDS = [
        { id: 'name',   label: "Ім'я клієнта",  required: true  },
        { id: 'phone',  label: 'Телефон',        required: false },
        { id: 'email',  label: 'Email',           required: false },
        { id: 'source', label: window.t('crmSrc2'),         required: false },
        { id: 'niche',  label: 'Ніша',            required: false },
        { id: 'note',   label: 'Нотатка',         required: false },
        { id: 'amount', label: 'Сума угоди',      required: false },
        { id: 'stage',  label: window.t('crmStg2'),          required: false },
        { id: 'skip',   label: '— Пропустити —',  required: false },
    ];

    // Автомаппінг по назві колонки
    const autoMap = headers.map(h => {
        const hn = h.toLowerCase().replace(/[^a-zа-яіїє0-9]/gi, '');
        if (['name','ім\'я','імя','клієнт','client','назва'].some(k => hn.includes(k.replace(/[^a-zа-яіїє0-9]/gi,'')))) return 'name';
        if (['phone','телефон','тел','mobile'].some(k => hn.includes(k))) return 'phone';
        if (['email','mail','пошта'].some(k => hn.includes(k))) return 'email';
        if (['source','джерело','канал'].some(k => hn.includes(k))) return 'source';
        if (['niche','ніша','сфера','галузь'].some(k => hn.includes(k))) return 'niche';
        if (['note','нотатка','коментар','comment','опис'].some(k => hn.includes(k))) return 'note';
        if (['amount','сума','sum','бюджет','ціна'].some(k => hn.includes(k))) return 'amount';
        if (['stage','стадія','статус','status'].some(k => hn.includes(k))) return 'stage';
        return 'skip';
    });

    const selStyle = 'padding:0.3rem 0.4rem;border:1px solid #e8eaed;border-radius:6px;font-size:0.75rem;width:100%;';

    body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1rem;">
        <div style="font-size:0.82rem;color:#374151;font-weight:600;">
            Знайдено ${rows.length - 1} рядків. Вкажіть відповідність колонок:
        </div>

        <!-- Маппінг -->
        <div style="display:grid;grid-template-columns:1fr 1.5rem 1fr;gap:0.4rem;align-items:center;">
            <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;">КОЛОНКА У ФАЙЛІ</div>
            <div></div>
            <div style="font-size:0.7rem;font-weight:700;color:#9ca3af;">ПОЛЕ В CRM</div>
            ${headers.map((h, i) => `
            <div style="background:#f8fafc;border:1px solid #e8eaed;border-radius:6px;
                padding:0.3rem 0.5rem;font-size:0.75rem;color:#374151;overflow:hidden;
                text-overflow:ellipsis;white-space:nowrap;" title="${_escAttr(h)}">${_escHtml(h)}</div>
            <div style="text-align:center;color:#9ca3af;font-size:0.7rem;">→</div>
            <select id="crmImportMap_${i}" style="${selStyle}">
                ${FIELDS.map(f => `<option value="${f.id}" ${autoMap[i]===f.id?'selected':''}>${f.label}${f.required?' *':''}</option>`).join('')}
            </select>`).join('')}
        </div>

        <!-- Preview -->
        <div>
            <div style="font-size:0.75rem;font-weight:600;color:#374151;margin-bottom:0.4rem;">Перегляд (перші 5 рядків):</div>
            <div style="overflow-x:auto;border:1px solid #e8eaed;border-radius:8px;">
                <table style="width:100%;border-collapse:collapse;font-size:0.72rem;">
                    <thead>
                        <tr style="background:#f8fafc;">
                            ${headers.map(h => `<th style="padding:0.4rem 0.5rem;text-align:left;border-bottom:1px solid #e8eaed;
                                white-space:nowrap;color:#6b7280;font-weight:600;">${_escHtml(h)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${preview.map(row => `
                        <tr style="border-bottom:1px solid #f1f5f9;">
                            ${headers.map((_, i) => `<td style="padding:0.35rem 0.5rem;color:#374151;
                                max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                ${_escHtml(String(row[i]||''))}</td>`).join('')}
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Тип імпорту -->
        <div style="display:flex;gap:0.5rem;">
            <label style="flex:1;display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;
                border:1px solid #e8eaed;border-radius:8px;cursor:pointer;background:#f8fafc;">
                <input type="radio" name="crmImportType" value="clients" checked style="accent-color:#22c55e;">
                <div>
                    <div style="font-size:0.8rem;font-weight:600;color:#111827;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Клієнти</div>
                    <div style="font-size:0.68rem;color:#6b7280;">Тільки картки клієнтів</div>
                </div>
            </label>
            <label style="flex:1;display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;
                border:1px solid #e8eaed;border-radius:8px;cursor:pointer;background:#f8fafc;">
                <input type="radio" name="crmImportType" value="deals" style="accent-color:#22c55e;">
                <div>
                    <div style="font-size:0.8rem;font-weight:600;color:#111827;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Угоди</div>
                    <div style="font-size:0.68rem;color:#6b7280;">Клієнти + угоди у воронці</div>
                </div>
            </label>
        </div>

        <!-- Дублікати -->
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.78rem;color:#374151;cursor:pointer;">
            <input type="checkbox" id="crmImportSkipDups" checked style="accent-color:#22c55e;">
            Пропускати дублікати (за номером телефону)
        </label>

        <!-- Кнопки -->
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;padding-top:0.25rem;">
            <button onclick="document.getElementById('crmImportBody').innerHTML = window._crmImportStepUploadHtml()"
                style="padding:0.5rem 1rem;background:#f4f5f7;border:1px solid #e8eaed;
                border-radius:7px;cursor:pointer;font-size:0.82rem;color:#374151;">
                ← Назад
            </button>
            <button onclick="crmImportExecute()"
                style="padding:0.5rem 1.25rem;background:#22c55e;color:white;border:none;
                border-radius:7px;cursor:pointer;font-size:0.82rem;font-weight:600;">
                Імпортувати →
            </button>
        </div>
    </div>`;

    // Зберігаємо HTML для кнопки window.t('flowBk2')
    window._crmImportStepUploadHtml = _crmImportStepUpload;
    // Відновлюємо file input listener
    setTimeout(() => {
        const fi = document.getElementById('crmImportFileInput');
        if (fi) fi.onchange = e => crmImportHandleFile(e.target.files[0]);
    }, 100);
}

function _escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _escAttr(s) {
    return String(s).replace(/"/g,'&quot;');
}

// ── Step 3: виконання імпорту ───────────────────────────────
window.crmImportExecute = async function () {
    const rows    = window._crmImportRows;
    if (!rows || rows.length < 2) return;

    const headers  = rows[0];
    const dataRows = rows.slice(1).filter(r => r.some(c => String(c).trim()));
    const type     = document.querySelector('input[name="crmImportType"]:checked')?.value || 'clients';
    const skipDups = document.getElementById('crmImportSkipDups')?.checked !== false;

    // Зчитуємо маппінг
    const mapping = headers.map((_, i) => {
        const sel = document.getElementById(`crmImportMap_${i}`);
        return sel ? sel.value : 'skip';
    });

    // Перевірка: є поле name?
    if (!mapping.includes('name')) {
        if (window.showToast) showToast("Вкажіть колонку \"Ім'я клієнта\"", 'error');
        return;
    }

    const body = document.getElementById('crmImportBody');
    body.innerHTML = `
    <div style="text-align:center;padding:2rem;">
        <div style="font-size:1.5rem;margin-bottom:0.5rem;">⏳</div>
        <div id="crmImportProgress" style="font-size:0.85rem;color:#374151;">Підготовка...</div>
        <div id="crmImportBar" style="margin-top:0.75rem;background:#e8eaed;border-radius:6px;height:6px;overflow:hidden;">
            <div id="crmImportBarFill" style="height:100%;background:#22c55e;width:0%;transition:width 0.3s;"></div>
        </div>
    </div>`;

    const db       = firebase.firestore();
    const compRef  = window.companyRef();
    if (!compRef) {
        if (window.showToast) showToast('Помилка: компанія не завантажена', 'error');
        return;
    }
    const uid      = window.currentUser?.uid || '';
    const email    = window.currentUser?.email || '';
    const pipeline = window.crm?.pipeline;
    const firstStage = (pipeline?.stages || []).filter(s => s.id !== 'won' && s.id !== 'lost')
                                               .sort((a,b) => a.order - b.order)[0];

    // Існуючі клієнти для перевірки дублікатів
    let existingPhones = new Set();
    if (skipDups) {
        // FIX: limit(5000) замість безмежного get() — великі компанії
        const snap = await compRef.collection('crm_clients').limit(5000).get().catch(() => null);
        if (snap) snap.forEach(d => {
            const p = (d.data().phone || '').replace(/\D/g, '');
            if (p) existingPhones.add(p);
        });
    }

    const setProgress = (text, pct) => {
        const el = document.getElementById('crmImportProgress');
        const bar = document.getElementById('crmImportBarFill');
        if (el) el.textContent = text;
        if (bar) bar.style.width = pct + '%';
    };

    let imported = 0, skipped = 0, errors = 0;
    const now = firebase.firestore.FieldValue.serverTimestamp();

    // FIX: при type='deals' кожен рядок = 2 ops (client + deal)
    // Ліміт Firestore = 500 ops per batch → безпечний розмір = 249
    const BATCH_SIZE = 249;
    let batch = db.batch();
    let batchCount = 0;

    const flushBatch = async () => {
        if (batchCount > 0) { await batch.commit(); batch = db.batch(); batchCount = 0; }
    };

    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        setProgress(`Обробка ${i+1} з ${dataRows.length}...`, Math.round((i+1)/dataRows.length*90));

        // Маппінг полів
        const rec = {};
        mapping.forEach((field, idx) => {
            if (field !== 'skip') rec[field] = String(row[idx] || '').trim();
        });

        if (!rec.name) { skipped++; continue; }

        // Перевірка дублікатів
        const phone = (rec.phone || '').replace(/\D/g, '');
        if (skipDups && phone && existingPhones.has(phone)) { skipped++; continue; }
        if (phone) existingPhones.add(phone);

        try {
            const clientRef = compRef.collection('crm_clients').doc();
            const clientData = {
                name:      rec.name,
                phone:     rec.phone  || '',
                email:     rec.email  || '',
                source:    rec.source || 'import',
                niche:     rec.niche  || '',
                note:      rec.note   || '',
                createdAt: now,
                createdBy: email,
            };
            batch.set(clientRef, clientData);
            batchCount++;

            if (type === 'deals' && pipeline?.id) {
                const stageId = _matchStage(rec.stage, pipeline.stages) || firstStage?.id || 'new';
                const dealRef = compRef.collection(window.DB_COLS?.CRM_DEALS || 'crm_deals').doc();
                batch.set(dealRef, {
                    clientId:    clientRef.id,
                    clientName:  rec.name,
                    clientNiche: rec.niche  || '',
                    phone:       rec.phone  || '',
                    email:       rec.email  || '',
                    source:      rec.source || 'import',
                    stage:       stageId,
                    stageId:     stageId,   // FIX: CRM reads d.stage, зберігаємо обидва
                    status:      'active',
                    amount:      rec.amount ? parseFloat(rec.amount.replace(/[^\d.]/g,'')) || 0 : 0,
                    note:        rec.note   || '',
                    pipelineId:  pipeline.id,
                    assigneeId:  uid,
                    creatorId:   uid,
                    stageEnteredAt: now,
                    createdAt:   now,
                    updatedAt:   now,
                    tags:        [],
                });
                batchCount++;
            }

            if (batchCount >= BATCH_SIZE) await flushBatch();
            imported++;
        } catch (e) {
            errors++;
        }
    }

    await flushBatch();
    setProgress('Готово!', 100);

    body.innerHTML = `
    <div style="text-align:center;padding:1.5rem;">
        <div style="font-size:2rem;margin-bottom:0.75rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div style="font-weight:700;font-size:1rem;color:#111827;margin-bottom:0.5rem;">Імпорт завершено</div>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.25rem;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:0.65rem 1.25rem;">
                <div style="font-size:1.5rem;font-weight:700;color:#16a34a;">${imported}</div>
                <div style="font-size:0.72rem;color:#6b7280;">Імпортовано</div>
            </div>
            ${skipped ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:0.65rem 1.25rem;">
                <div style="font-size:1.5rem;font-weight:700;color:#ea580c;">${skipped}</div>
                <div style="font-size:0.72rem;color:#6b7280;">Дублікати / порожні</div>
            </div>` : ''}
            ${errors ? `<div style="background:#fef2f2;border:1px solid#fecaca;border-radius:8px;padding:0.65rem 1.25rem;">
                <div style="font-size:1.5rem;font-weight:700;color:#ef4444;">${_escHtml(String(errors))}</div>
                <div style="font-size:0.72rem;color:#6b7280;">Помилки</div>
            </div>` : ''}
        </div>
        <button onclick="document.getElementById('crmImportModal').remove();if(window.initCRMModule)initCRMModule();"
            style="padding:0.55rem 1.5rem;background:#22c55e;color:white;border:none;
            border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem;">
            Закрити та оновити
        </button>
    </div>`;

    if (window.showToast) showToast(`Імпортовано: ${imported}, пропущено: ${skipped}`, imported > 0 ? 'success' : 'warning');
};

// Спробуємо знайти стадію по назві
function _matchStage(stageLabel, stages) {
    if (!stageLabel || !stages) return null;
    const sl = stageLabel.toLowerCase().trim();
    const found = stages.find(s =>
        s.label?.toLowerCase() === sl || s.id?.toLowerCase() === sl
    );
    return found?.id || null;
}
