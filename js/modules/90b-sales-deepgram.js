(function() {
  'use strict';

  // Стан Deepgram підключення
  let _ws = null;
  let _recorder = null;
  let _stream = null;

  // ── Підключення ──────────────────────────────────────
  window.saDeepgramConnect = async function(token) {
    if (_ws && _ws.readyState === WebSocket.OPEN) return;

    // 1. Захопити мікрофон
    let micStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch(e) {
      showToast('Немає доступу до мікрофону: ' + e.message, 'error');
      throw e;
    }

    // 2. Спробувати захопити системний звук (Zoom, Meet тощо)
    let systemStream = null;
    try {
      systemStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: { width: 1, height: 1 }, // Chrome вимагає відео
      });
      // Зупинити відео трек — потрібен тільки аудіо
      systemStream.getVideoTracks().forEach(t => t.stop());
    } catch(e) {
      // Системний звук недоступний — продовжуємо тільки з мікрофоном
      console.log('[sa-deepgram] System audio unavailable:', e.message);
    }

    // 3. Об'єднати потоки або використати тільки мікрофон
    if (systemStream && systemStream.getAudioTracks().length > 0) {
      const ctx = new AudioContext();
      const mic = ctx.createMediaStreamSource(micStream);
      const system = ctx.createMediaStreamSource(systemStream);
      const merger = ctx.createChannelMerger(2);
      mic.connect(merger, 0, 0);
      system.connect(merger, 0, 1);
      const dest = ctx.createMediaStreamDestination();
      merger.connect(dest);
      _stream = dest.stream;
    } else {
      _stream = micStream;
    }

    // 4. Відкрити WebSocket на Deepgram
    // utterance_end_ms=1000 — Deepgram сигналізує кінець фрази після 1сек тиші
    // endpointing=300 — детектує паузу після 300мс
    const lang = 'uk';
    const model = 'nova-2';
    const wsUrl = `wss://api.deepgram.com/v1/listen` +
      `?language=${lang}&model=${model}` +
      `&interim_results=true&punctuate=true&smart_format=true` +
      `&utterance_end_ms=1000&endpointing=300`;

    _ws = new WebSocket(wsUrl, ['token', token]);

    _ws.onopen = function() {
      console.log('[sa-deepgram] WebSocket connected');

      // 5. Запустити MediaRecorder
      _recorder = new MediaRecorder(_stream, { mimeType: 'audio/webm;codecs=opus' });
      _recorder.ondataavailable = function(e) {
        if (e.data.size > 0 && _ws && _ws.readyState === WebSocket.OPEN) {
          _ws.send(e.data);
        }
      };
      _recorder.start(100); // чанки кожні 100мс для мінімальної затримки
    };

    _ws.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);

        // Обробка фінального результату речення
        if (data.type === 'Results' && data.is_final) {
          const alt = data.channel?.alternatives?.[0];
          const text = alt?.transcript || '';
          if (!text || text.trim().length < 3) return;

          // Додати в транскрипт
          if (window._sa) {
            window._sa.transcript += ' ' + text;

            // Оновити відображення останньої фрази в overlay
            const el = document.getElementById('saTranscriptLast');
            if (el) el.textContent = text;

            // *** КЛЮЧОВА ЗМІНА: реакція на кожне завершене речення ***
            // Передаємо речення одразу на аналіз — без таймера
            window.saOnSentence(text);
          }
        }

        // utterance_end — Deepgram підтвердив паузу в мовленні
        if (data.type === 'UtteranceEnd') {
          console.log('[sa-deepgram] Utterance end detected');
        }

      } catch(e) {
        console.warn('[sa-deepgram] parse error:', e.message);
      }
    };

    _ws.onerror = function(e) {
      console.error('[sa-deepgram] WebSocket error:', e);
      showToast('Помилка транскрипції. Перевірте підключення.', 'error');
    };

    _ws.onclose = function(e) {
      console.log('[sa-deepgram] WebSocket closed:', e.code, e.reason);
    };
  };

  // ── Відключення ──────────────────────────────────────
  window.saDeepgramDisconnect = function() {
    if (_recorder && _recorder.state !== 'inactive') {
      _recorder.stop();
    }
    if (_ws) {
      _ws.close();
      _ws = null;
    }
    if (_stream) {
      _stream.getTracks().forEach(t => t.stop());
      _stream = null;
    }
    _recorder = null;
    console.log('[sa-deepgram] Disconnected');
  };

})();
