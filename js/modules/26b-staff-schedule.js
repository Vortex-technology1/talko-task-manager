// ============================================================
// 26b-staff-schedule.js — Розклад майстра + Рейтинги
// Beauty модуль для TALKO
// ============================================================
'use strict';

// ── ГЛОБАЛЬНІ ХЕЛПЕРИ ──────────────────────────────────────

window.getStaffSchedule = async function(userId) {
    if (!window.companyDoc) return null;
    try {
        const snap = await window.companyDoc('staff_schedules', userId).get();
        return snap.exists ? snap.data() : null;
    } catch(e) { return null; }
};

window.saveStaffSchedule = async function(userId, scheduleData) {
    if (!window.companyDoc) return false;
    try {
        await window.companyDoc('staff_schedules', userId).set({
            ...scheduleData,
            userId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return true;
    } catch(e) { console.error('saveStaffSchedule:', e); return false; }
};

window.getMasterReviews = async function(masterId) {
    if (!window.companyCol) return [];
    try {
        const snap = await window.companyCol('master_reviews')
            .where('masterId', '==', masterId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
};

window.saveMasterReview = async function(reviewData) {
    if (!window.companyCol) return false;
    try {
        const ref = window.companyCol('master_reviews').doc();
        await ref.set({
            ...reviewData,
            isDemo: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        // Оновлюємо середній рейтинг майстра
        await window._updateMasterRating(reviewData.masterId);
        return true;
    } catch(e) { console.error('saveMasterReview:', e); return false; }
};

window._updateMasterRating = async function(masterId) {
    try {
        const snap = await window.companyCol('master_reviews')
            .where('masterId', '==', masterId).get();
        if (snap.empty) return;
        const ratings = snap.docs.map(d => d.data().rating).filter(Boolean);
        const avg = ratings.reduce((s,r) => s+r, 0) / ratings.length;
        // Оновлюємо в users якщо є доступ
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(masterId);
        await userRef.update({
            averageRating: Math.round(avg * 100) / 100,
            totalReviews: ratings.length,
        }).catch(() => {}); // ігноруємо якщо немає доступу
    } catch(e) {}
};

// ── КОНСТАНТИ ──────────────────────────────────────────────

const DAY_NAMES = { mon:'Пн', tue:'Вт', wed:'Ср', thu:'Чт', fri:'Пт', sat:'Сб', sun:'Нд' };
const DAY_KEYS  = ['mon','tue','wed','thu','fri','sat','sun'];

function _defaultSchedule() {
    return {
        weeklyHours: {
            mon: { start:'09:00', end:'20:00', active:true },
            tue: { start:'09:00', end:'20:00', active:true },
            wed: { start:'09:00', end:'20:00', active:true },
            thu: { start:'09:00', end:'20:00', active:true },
            fri: { start:'09:00', end:'20:00', active:true },
            sat: { start:'10:00', end:'18:00', active:true },
            sun: { start:'00:00', end:'00:00', active:false },
        },
        breakTime: { start:'13:00', end:'14:00' },
    };
}

// ── UI: ВКЛАДКА РОЗКЛАДУ В КАРТЦІ СПІВРОБІТНИКА ────────────

window.renderStaffScheduleTab = async function(userId, userName) {
    let schedule = await window.getStaffSchedule(userId);
    if (!schedule) schedule = _defaultSchedule();

    const reviews = await window.getMasterReviews(userId);
    const avgRating = reviews.length
        ? (reviews.reduce((s,r) => s + (r.rating||0), 0) / reviews.length).toFixed(1)
        : null;

    const starsHtml = (rating) => {
        let s = '';
        for (let i=1; i<=5; i++) {
            const full = i <= Math.floor(rating);
            s += `<svg width="12" height="12" viewBox="0 0 24 24" fill="${full?'#f59e0b':'none'}" stroke="#f59e0b" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>`;
        }
        return s;
    };

    const reviewsHtml = reviews.slice(0,5).map(r => {
        const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('uk-UA') : '';
        return `<div style="padding:.6rem .75rem;border-bottom:1px solid #f1f5f9;font-size:.8rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.2rem;">
                <span style="font-weight:600;color:#374151;">${window._esc(r.clientName||'Клієнт')}</span>
                <div style="display:flex;gap:1px;">${starsHtml(r.rating||0)}</div>
            </div>
            <div style="color:#525252;line-height:1.4;">${window._esc(r.comment||'')}</div>
            <div style="color:#9ca3af;font-size:.72rem;margin-top:.2rem;">${window._esc(r.serviceName||'')} · ${date}</div>
        </div>`;
    }).join('');

    return `<div id="staff-schedule-tab-${userId}" style="padding:.75rem 0;">
        <!-- Рейтинг -->
        ${avgRating ? `
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;padding:.6rem .75rem;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;">
            <div style="display:flex;gap:1px;">${starsHtml(parseFloat(avgRating))}</div>
            <span style="font-weight:700;color:#d97706;font-size:1rem;">${avgRating}</span>
            <span style="color:#92400e;font-size:.8rem;">(${reviews.length} відгуків)</span>
        </div>` : '<div style="font-size:.8rem;color:#9ca3af;margin-bottom:.75rem;">Відгуків ще немає</div>'}

        <!-- Розклад -->
        <div style="font-weight:600;color:#374151;font-size:.85rem;margin-bottom:.6rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Розклад майстра
        </div>

        <div id="schedule-rows-${userId}">
            ${DAY_KEYS.map(dk => {
                const day = schedule.weeklyHours?.[dk] || { start:'09:00', end:'18:00', active:false };
                return `<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem 0;border-bottom:1px solid #f8fafc;" id="schedule-row-${userId}-${dk}">
                    <label style="display:flex;align-items:center;gap:.35rem;min-width:30px;cursor:pointer;">
                        <input type="checkbox" id="sch-active-${userId}-${dk}" ${day.active?'checked':''} 
                            onchange="window._toggleScheduleDay('${userId}','${dk}')"
                            style="width:14px;height:14px;accent-color:#6366f1;">
                        <span style="font-size:.82rem;font-weight:600;color:#374151;min-width:22px;">${DAY_NAMES[dk]}</span>
                    </label>
                    <div id="sch-time-${userId}-${dk}" style="display:${day.active?'flex':'none'};align-items:center;gap:.3rem;flex:1;">
                        <input type="time" id="sch-start-${userId}-${dk}" value="${day.start||'09:00'}"
                            style="border:1px solid #e2e8f0;border-radius:6px;padding:2px 5px;font-size:.78rem;width:80px;">
                        <span style="color:#9ca3af;font-size:.75rem;">—</span>
                        <input type="time" id="sch-end-${userId}-${dk}" value="${day.end||'18:00'}"
                            style="border:1px solid #e2e8f0;border-radius:6px;padding:2px 5px;font-size:.78rem;width:80px;">
                    </div>
                    ${!day.active ? `<span id="sch-time-${userId}-${dk}" style="font-size:.78rem;color:#9ca3af;">вихідний</span>` : ''}
                </div>`;
            }).join('')}
        </div>

        <!-- Перерва -->
        <div style="display:flex;align-items:center;gap:.5rem;margin-top:.6rem;padding:.4rem .5rem;background:#f0f9ff;border-radius:8px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style="font-size:.8rem;color:#0369a1;font-weight:500;">Перерва:</span>
            <input type="time" id="sch-break-start-${userId}" value="${schedule.breakTime?.start||'13:00'}"
                style="border:1px solid #bae6fd;border-radius:6px;padding:2px 5px;font-size:.78rem;width:75px;">
            <span style="color:#9ca3af;font-size:.75rem;">—</span>
            <input type="time" id="sch-break-end-${userId}" value="${schedule.breakTime?.end||'14:00'}"
                style="border:1px solid #bae6fd;border-radius:6px;padding:2px 5px;font-size:.78rem;width:75px;">
        </div>

        <button onclick="window._saveSchedule('${userId}')" 
            style="margin-top:.75rem;width:100%;padding:.5rem;background:#6366f1;color:white;border:none;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;">
            Зберегти розклад
        </button>

        <!-- Відгуки -->
        ${reviews.length > 0 ? `
        <div style="margin-top:1rem;">
            <div style="font-weight:600;color:#374151;font-size:.85rem;margin-bottom:.5rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Відгуки (${reviews.length})
            </div>
            <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
                ${reviewsHtml}
            </div>
        </div>` : ''}

        <!-- Кнопка додати відгук -->
        <button onclick="window._openAddReviewModal('${userId}','${userName}')"
            style="margin-top:.6rem;width:100%;padding:.45rem;background:#f8fafc;color:#374151;border:1px solid #e2e8f0;border-radius:8px;font-size:.78rem;cursor:pointer;">
            + Додати відгук
        </button>
    </div>`;
};

// ── TOGGLE ДНЯ ─────────────────────────────────────────────
window._toggleScheduleDay = function(userId, dk) {
    const cb = document.getElementById(`sch-active-${userId}-${dk}`);
    const timeDiv = document.getElementById(`sch-time-${userId}-${dk}`);
    if (!cb || !timeDiv) return;
    timeDiv.style.display = cb.checked ? 'flex' : 'none';
};

// ── ЗБЕРЕЖЕННЯ РОЗКЛАДУ ────────────────────────────────────
window._saveSchedule = async function(userId) {
    const weeklyHours = {};
    for (const dk of DAY_KEYS) {
        const active = document.getElementById(`sch-active-${userId}-${dk}`)?.checked || false;
        const start  = document.getElementById(`sch-start-${userId}-${dk}`)?.value || '09:00';
        const end    = document.getElementById(`sch-end-${userId}-${dk}`)?.value || '18:00';
        weeklyHours[dk] = { start, end, active };
    }
    const breakStart = document.getElementById(`sch-break-start-${userId}`)?.value || '13:00';
    const breakEnd   = document.getElementById(`sch-break-end-${userId}`)?.value || '14:00';

    const ok = await window.saveStaffSchedule(userId, {
        weeklyHours,
        breakTime: { start: breakStart, end: breakEnd },
    });
    if (ok) {
        window.showToast?.('Розклад збережено ✓', 'success');
    } else {
        window.showToast?.('Помилка збереження', 'error');
    }
};

// ── МОДАЛКА ДОДАТИ ВІДГУК ──────────────────────────────────
window._openAddReviewModal = function(masterId, masterName) {
    // Видаляємо стару якщо є
    document.getElementById('reviewModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'reviewModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;padding:1.5rem;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,.2);">
            <div style="font-weight:700;font-size:1rem;margin-bottom:1rem;color:#1a1a1a;">
                Відгук про ${window._esc(masterName)}
            </div>
            <div style="margin-bottom:.75rem;">
                <label style="font-size:.82rem;color:#374151;font-weight:500;">Оцінка</label>
                <div style="display:flex;gap:.4rem;margin-top:.35rem;" id="rev-stars">
                    ${[1,2,3,4,5].map(n => `
                        <button onclick="window._setReviewStar(${n})" id="rev-star-${n}"
                            style="width:36px;height:36px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;cursor:pointer;font-size:1.2rem;transition:all .15s;">
                            ⭐
                        </button>`).join('')}
                </div>
                <input type="hidden" id="rev-rating" value="5">
            </div>
            <div style="margin-bottom:.75rem;">
                <label style="font-size:.82rem;color:#374151;font-weight:500;">Клієнт</label>
                <input id="rev-client" type="text" placeholder="Ім'я клієнта"
                    style="width:100%;margin-top:.3rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:.75rem;">
                <label style="font-size:.82rem;color:#374151;font-weight:500;">Послуга</label>
                <input id="rev-service" type="text" placeholder="Наприклад: Манікюр гель-лак"
                    style="width:100%;margin-top:.3rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:1rem;">
                <label style="font-size:.82rem;color:#374151;font-weight:500;">Коментар</label>
                <textarea id="rev-comment" rows="3" placeholder="Відгук клієнта..."
                    style="width:100%;margin-top:.3rem;padding:.5rem .7rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.85rem;resize:none;box-sizing:border-box;"></textarea>
            </div>
            <div style="display:flex;gap:.5rem;">
                <button onclick="document.getElementById('reviewModal').remove()"
                    style="flex:1;padding:.55rem;border:1px solid #e2e8f0;background:white;border-radius:8px;font-size:.85rem;cursor:pointer;">
                    Скасувати
                </button>
                <button onclick="window._submitReview('${masterId}','${masterName}')"
                    style="flex:2;padding:.55rem;background:#6366f1;color:white;border:none;border-radius:8px;font-size:.85rem;font-weight:600;cursor:pointer;">
                    Зберегти відгук
                </button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    // Дефолт — 5 зірок
    window._setReviewStar(5);
};

window._setReviewStar = function(n) {
    document.getElementById('rev-rating').value = n;
    for (let i=1; i<=5; i++) {
        const btn = document.getElementById(`rev-star-${i}`);
        if (!btn) continue;
        btn.style.background = i <= n ? '#fef9c3' : '#f8fafc';
        btn.style.borderColor = i <= n ? '#fbbf24' : '#e2e8f0';
    }
};

window._submitReview = async function(masterId, masterName) {
    const rating  = parseInt(document.getElementById('rev-rating')?.value) || 5;
    const client  = document.getElementById('rev-client')?.value?.trim() || 'Клієнт';
    const service = document.getElementById('rev-service')?.value?.trim() || '';
    const comment = document.getElementById('rev-comment')?.value?.trim() || '';

    const ok = await window.saveMasterReview({
        masterId, masterName,
        clientName: client,
        serviceName: service,
        rating, comment,
    });

    if (ok) {
        document.getElementById('reviewModal')?.remove();
        window.showToast?.('Відгук збережено ✓', 'success');
    } else {
        window.showToast?.('Помилка збереження', 'error');
    }
};

// ── INJECT В КАРТКУ СПІВРОБІТНИКА ─────────────────────────
// Патчимо toggleUserDetail щоб додавати вкладку Розклад
(function() {
    const _origToggle = window.toggleUserDetail;
    if (!_origToggle) {
        // Буде заpatched пізніше через MutationObserver або при ініт
        window._scheduleTabPending = true;
        return;
    }
    // window._patchUserDetailWithSchedule called after definition below
    if (typeof window._patchUserDetailWithSchedule === 'function') window._patchUserDetailWithSchedule();
})();

window._patchUserDetailWithSchedule = function() {
    // Додаємо кнопку в userDetail через глобальний hook
    if (!window._staffScheduleHooked) {
        window._staffScheduleHooked = true;
        document.addEventListener('click', async function(e) {
            const btn = e.target.closest('[data-schedule-tab]');
            if (!btn) return;
            const userId   = btn.dataset.scheduleTab;
            const userName = btn.dataset.userName || 'Майстер';
            const container = document.getElementById(`schedule-container-${userId}`);
            if (!container) return;

            if (container.dataset.loaded) {
                container.style.display = container.style.display === 'none' ? 'block' : 'none';
                return;
            }
            container.style.display = 'block';
            container.innerHTML = '<div style="padding:1rem;text-align:center;color:#9ca3af;font-size:.82rem;">Завантаження...</div>';
            container.innerHTML = await window.renderStaffScheduleTab(userId, userName);
            container.dataset.loaded = '1';
            window.refreshIcons?.();
        });
    }
};
window._patchUserDetailWithSchedule();

// ── ESC HELPER ─────────────────────────────────────────────
if (!window._esc) {
    window._esc = function(str) {
        return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    };
}

console.log('[26b-staff-schedule] beauty module loaded ✓');
