(function() {
  'use strict';

  // ── Глобальний стан ──────────────────────────────────
  window._sa = {
    active: false,
    sessionId: null,
    dealId: null,
    companyId: null,
    startTime: null,
    transcript: '',
    hints: [],
    timerInterval: null,
    deepgramToken: null,
    // Захист від паралельних запитів до Claude
    _requesting: false,
  };

  // ── Реакція на речення (викликається з 90b після кожного is_final) ──
  window.saOnSentence = async function(sentence) {
    const sa = window._sa;
    if (!sa.active) return;
    if (sa._requesting) return; // попередній запит ще не завершився — пропускаємо

    sa._requesting = true;

    try {
      const user = firebase.auth().currentUser;
      const idToken = await user.getIdToken();

      const res = await fetch('/api/sales-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          companyId: sa.companyId,
          dealId: sa.dealId,
          sessionId: sa.sessionId,
          sentence,
          history: sa.hints.slice(-3).map(h => h.hint),
        }),
      });

      const data = await res.json();

      if (data.hint) {
        sa.hints.push({ at: Date.now(), sentence, hint: data.hint, action: data.action });
        saOverlayUpdate(data.hint, data.action);
      }

    } catch(e) {
      console.warn('[sa] hint request failed:', e.message);
    } finally {
      sa._requesting = false;
    }
  };

  // ── Старт сесії ──────────────────────────────────────
  window.saStart = async function(dealId) {
    if (window._sa.active) {
      showToast('Дзвінок вже активний', 'warning'); return;
    }

    const companyId = window.currentCompanyId;
    if (!companyId) { showToast('Компанія не визначена', 'error'); return; }

    // 1. Отримати Deepgram токен
    let deepgramToken;
    try {
      const user = firebase.auth().currentUser;
      const idToken = await user.getIdToken();
      const res = await fetch('/api/sales-assistant-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Token error');
      deepgramToken = data.token;
    } catch(e) {
      showToast('Помилка підключення: ' + e.message, 'error'); return;
    }

    // 2. Якщо немає dealId — створити угоду автоматично
    let finalDealId = dealId;
    if (!finalDealId) {
      try {
        const ref = await window.companyRef()
          .collection(window.DB_COLS.CRM_DEALS)
          .add({
            clientName: 'Дзвінок ' + new Date().toLocaleDateString('uk-UA'),
            stage: 'new',
            source: 'sales_assistant',
            createdBy: firebase.auth().currentUser?.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            note: 'Угода створена автоматично з Sales Assistant',
          });
        finalDealId = ref.id;
      } catch(e) {
        console.warn('[sa] Auto-deal creation failed:', e.message);
      }
    }

    // 3. Ініціалізація стану
    const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    Object.assign(window._sa, {
      active: true, sessionId, dealId: finalDealId, companyId,
      startTime: Date.now(), transcript: '', hints: [],
      deepgramToken, _requesting: false,
    });

    // 4. Показати overlay
    saOverlayShow();

    // 5. Підключити Deepgram
    try {
      await window.saDeepgramConnect(deepgramToken);
    } catch(e) {
      saStop(); return;
    }

    // 6. Таймер (тільки для відображення тривалості)
    window._sa.timerInterval = setInterval(saUpdateTimer, 1000);

    showToast('AI асистент увімкнено 🎙', 'success');
  };

  // ── Зупинка ──────────────────────────────────────────
  window.saStop = async function() {
    const sa = window._sa;
    if (!sa.active) return;

    clearInterval(sa.timerInterval);
    window.saDeepgramDisconnect();

    const duration = Math.round((Date.now() - sa.startTime) / 1000);

    // Показати що аналізуємо
    const hintEl = document.getElementById('saHintText');
    if (hintEl) hintEl.textContent = 'Аналізую дзвінок...';

    // Зберегти і отримати аналіз
    let analysis = null;
    try {
      const user = firebase.auth().currentUser;
      const idToken = await user.getIdToken();
      const res = await fetch('/api/sales-assistant-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({
          companyId: sa.companyId,
          dealId: sa.dealId,
          sessionId: sa.sessionId,
          transcript: sa.transcript,
          duration,
        }),
      });
      analysis = await res.json();
    } catch(e) {
      console.warn('[sa] save failed:', e.message);
    }

    saOverlayHide();
    if (analysis) saShowPostCallModal(analysis, duration);

    // Скинути стан
    Object.assign(window._sa, {
      active: false, sessionId: null, dealId: null,
      transcript: '', hints: [],
      timerInterval: null, _requesting: false,
    });
  };

  // ── Запуск з картки CRM ──────────────────────────────
  window.saOpenFromCRM = function(dealId) {
    window.saStart(dealId);
  };

  // ── Overlay ──────────────────────────────────────────
  function saOverlayShow() {
    let overlay = document.getElementById('saOverlay');
    if (!overlay) overlay = saCreateOverlay();
    overlay.style.display = 'flex';
  }

  function saOverlayHide() {
    const overlay = document.getElementById('saOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  window.saToggleOverlay = function() {
    const overlay = document.getElementById('saOverlay');
    if (!overlay) return;
    const isVisible = overlay.style.display !== 'none';
    overlay.style.display = isVisible ? 'none' : 'flex';
  };

  // ── Оновлення overlay після підказки ────────────────
  function saOverlayUpdate(hint, action) {
    const hintEl = document.getElementById('saHintText');
    const overlay = document.getElementById('saOverlay');
    if (!hintEl) return;

    hintEl.textContent = hint;
    hintEl.classList.remove('sa-hint-new');
    void hintEl.offsetWidth; // reflow для анімації
    hintEl.classList.add('sa-hint-new');

    if (overlay) overlay.dataset.action = action;

    // warn — мигання червоним (тривожна підказка)
    if (action === 'warn') {
      overlay.style.borderColor = '#ef4444';
      setTimeout(() => { overlay.style.borderColor = ''; }, 3000);
    }
  }

  // ── Таймер ───────────────────────────────────────────
  function saUpdateTimer() {
    const el = document.getElementById('saTimer');
    if (!el || !window._sa.startTime) return;
    const sec = Math.floor((Date.now() - window._sa.startTime) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    el.textContent = mm + ':' + ss;
  }

  // ── Створення overlay HTML ────────────────────────────
  function saCreateOverlay() {
    const div = document.createElement('div');
    div.id = 'saOverlay';
    div.innerHTML = `
      <div class="sa-header">
        <span class="sa-rec-dot"></span>
        <span class="sa-title">AI Асистент</span>
        <span id="saTimer" class="sa-timer">00:00</span>
        <button class="sa-btn-icon" onclick="saToggleOverlay()" title="Згорнути">_</button>
        <button class="sa-btn-icon sa-btn-stop" onclick="saStop()" title="Завершити дзвінок">■</button>
      </div>
      <div class="sa-hint-block">
        <div class="sa-hint-label">💡 Підказка:</div>
        <div id="saHintText" class="sa-hint-text">Слухаю розмову...</div>
      </div>
      <div class="sa-transcript-block">
        <div class="sa-transcript-label">Останнє речення:</div>
        <div id="saTranscriptLast" class="sa-transcript-text"></div>
      </div>
    `;
    document.body.appendChild(div);
    saMakeDraggable(div);
    return div;
  }

  // ── Draggable ─────────────────────────────────────────
  function saMakeDraggable(el) {
    const header = el.querySelector('.sa-header');
    if (!header) return;
    let startX, startY, startL, startT;

    header.addEventListener('mousedown', function(e) {
      startX = e.clientX; startY = e.clientY;
      startL = el.offsetLeft; startT = el.offsetTop;

      function onMove(e) {
        el.style.left = (startL + e.clientX - startX) + 'px';
        el.style.top = (startT + e.clientY - startY) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // ── Post-call модальне вікно ──────────────────────────
  function saShowPostCallModal(analysis, duration) {
    const mm = String(Math.floor(duration / 60)).padStart(2, '0');
    const ss = String(duration % 60).padStart(2, '0');

    const existing = document.getElementById('saPostCallModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'saPostCallModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:2rem;max-width:500px;width:90%;max-height:85vh;overflow-y:auto;">
        <h2 style="margin:0 0 1rem;font-size:1.2rem;color:#1E3A5F;">📊 Підсумок дзвінка</h2>
        <div style="display:flex;gap:1rem;margin-bottom:1rem;">
          <div style="background:#EEF6FF;border-radius:8px;padding:0.75rem 1rem;flex:1;text-align:center;">
            <div style="font-size:1.5rem;font-weight:700;color:#1E3A5F;">⭐ ${analysis.score || '-'}/10</div>
            <div style="font-size:0.75rem;color:#666;">Оцінка дзвінка</div>
          </div>
          <div style="background:#EEF6FF;border-radius:8px;padding:0.75rem 1rem;flex:1;text-align:center;">
            <div style="font-size:1.5rem;font-weight:700;color:#1E3A5F;">⏱ ${mm}:${ss}</div>
            <div style="font-size:0.75rem;color:#666;">Тривалість</div>
          </div>
        </div>
        ${analysis.summary ? `<div style="margin-bottom:1rem;"><b>📝 Підсумок:</b><p style="margin:0.25rem 0 0;color:#444;">${analysis.summary}</p></div>` : ''}
        ${analysis.nextStep ? `<div style="margin-bottom:1rem;background:#F0FDF4;border-radius:8px;padding:0.75rem;"><b>➡️ Наступний крок:</b><p style="margin:0.25rem 0 0;color:#166534;">${analysis.nextStep}</p></div>` : ''}
        ${analysis.risks ? `<div style="margin-bottom:1rem;background:#FFF8E1;border-radius:8px;padding:0.75rem;"><b>⚠️ Ризики:</b><p style="margin:0.25rem 0 0;color:#92400E;">${analysis.risks}</p></div>` : ''}
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
          ${window._sa?.dealId ? `<button onclick="window.crmOpenDeal && window.crmOpenDeal('${window._sa.dealId}');document.getElementById('saPostCallModal').remove();"
            style="flex:1;padding:0.75rem;background:#1E3A5F;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
            Відкрити угоду в CRM
          </button>` : ''}
          <button onclick="document.getElementById('saPostCallModal').remove()"
            style="flex:1;padding:0.75rem;background:#f3f4f6;color:#333;border:none;border-radius:8px;cursor:pointer;">
            Закрити
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

})();
