// /api/site.js — публічний endpoint для сайтів TALKO
const admin = require('firebase-admin');

// ── Firebase init (перевірений патерн з webhook.js) ─────────
// Firebase init — точна копія telegram.js (перевірений патерн)
if (!admin.apps.length) {
    let pk = process.env.FIREBASE_PRIVATE_KEY || '';
    // Якщо ключ в base64 (деякі Vercel конфіги) — декодуємо
    if (pk && !pk.includes('-----BEGIN')) {
        try { pk = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
    }
    // Замінюємо literal \n на реальні переноси рядків
    if (pk && pk.includes('\\n')) {
        pk = pk.replace(/\\n/g, '\n');
    }
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId:   process.env.FIREBASE_PROJECT_ID || 'task-manager-44e84',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  pk || undefined,
            }),
        });
    } catch(e) {
        console.error('[site.js] Firebase init error:', e.message);
        // Зберігаємо помилку щоб показати в response
        global._siteInitError = e.message;
    }
}

const _db = () => {
    if (global._siteInitError) throw new Error('Firebase init failed: ' + global._siteInitError);
    if (!admin.apps.length) throw new Error('Firebase not initialized');
    return admin.firestore();
};

// ── HTML escape ──────────────────────────────────────────────
function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── CSS value sanitizer ──────────────────────────────────────
function cssVal(v, fallback) {
    const s = String(v || fallback || '');
    if (/[^a-zA-Z0-9#%.\-(),\s]/.test(s)) return fallback || '';
    if (/expression|javascript|url\s*\(|import|@/i.test(s)) return fallback || '';
    return s;
}

// ── Main handler ─────────────────────────────────────────────
module.exports = async (req, res) => {
    // CORS для preview
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Debug endpoint — тільки для superadmin з токеном
    if (req.query.debug === 'firebase_init') {
        // Перевірка авторизації
        const authToken = req.headers.authorization || req.query.token || '';
        const validToken = process.env.DEBUG_TOKEN || 'DISABLED';

        if (!authToken || authToken !== validToken || validToken === 'DISABLED') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const pk = process.env.FIREBASE_PRIVATE_KEY || '';
        let pkDecoded = pk;
        if (pk && !pk.includes('-----BEGIN')) {
            try { pkDecoded = Buffer.from(pk, 'base64').toString('utf8'); } catch(e) {}
        }

        // Безпечний debug - без витоку чутливих даних
        return res.status(200).json({
            hasProjectId:    !!process.env.FIREBASE_PROJECT_ID,
            hasClientEmail:  !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey:   !!pk,
            pkLength:        pk ? pk.length : 0,
            pkIsBase64:      pk ? !pk.includes('-----BEGIN') : false,
            pkHasLiteralN:   pk ? pk.includes('\\n') : false,
            pkHasNewline:    pk ? pk.includes('\n') : false,
            appsInitialized: admin.apps.length,
            initError:       global._siteInitError || null,
            nodeVersion:     process.version,
        });
    }

    let { id: siteId, cid: companyId, slug } = req.query;

    // ── Slug lookup: /s/clinic або ?slug=clinic ────────────
    if (slug && !siteId) {
        try {
            const snap = await _db()
                .collectionGroup('sites')
                .where('slug', '==', slug.toLowerCase().trim())
                .where('status', '==', 'published')
                .limit(1).get();
            if (snap.empty) return res.status(404).send(errPage('Сайт не знайдено: /' + slug));
            const parts = snap.docs[0].ref.path.split('/');
            companyId = parts[1];
            siteId    = parts[3];
        } catch(e) {
            return res.status(500).send(errPage(e.message));
        }
    }

    // ── Custom domain lookup ────────────────────────────────
    if (!siteId || !companyId) {
        const host = (req.headers.host || '').replace(/:\d+$/, '').toLowerCase();
        const isOwn = host.includes('vercel.app') || host.includes('localhost');

        if (!isOwn && host) {
            try {
                const snap = await _db()
                    .collectionGroup('sites')
                    .where('customDomain', '==', host)
                    .where('status', '==', 'published')
                    .limit(1).get();
                if (snap.empty) return res.status(404).send(errPage('Домен не підключено'));
                const parts = snap.docs[0].ref.path.split('/');
                companyId = parts[1];
                siteId    = parts[3];
            } catch(e) {
                return res.status(500).send(errPage(e.message));
            }
        } else {
            return res.status(400).send(errPage('Невірне посилання'));
        }
    }

    try {
        const doc = await _db()
            .collection('companies').doc(companyId)
            .collection('sites').doc(siteId)
            .get();

        if (!doc.exists)                return res.status(404).send(errPage('Сайт не знайдено'));
        const site = doc.data();
        if (site.status !== 'published') return res.status(403).send(errPage('Сайт не опублікований'));

        // Трекінг (non-blocking)
        _db().collection('companies').doc(companyId)
            .collection('sites').doc(siteId)
            .update({
                visits:      admin.firestore.FieldValue.increment(1),
                lastVisitAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(() => {});

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');


        // rawHtml режим — довіряємо власнику сайту, але захищаємо від clickjacking
        if (site.mode === 'html' && site.rawHtml) {
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            return res.status(200).send(site.rawHtml);
        }

        // Блок режим
        const primary = cssVal(site.theme?.primaryColor, '#22c55e');
        const br      = cssVal(site.theme?.borderRadius,  '12px');
        const font    = esc(site.theme?.fontFamily || 'Inter');

        const blocks  = (site.blocks || []).map(b => renderBlock(b, primary, br, companyId, siteId)).join('\n');
        const ga4     = site.analyticsGA4      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.analyticsGA4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${esc(site.analyticsGA4)}');</script>` : '';
        const gtm     = site.analyticsGTM      ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${esc(site.analyticsGTM)}');</script>` : '';
        // Якщо піксель вже є в analyticsHeadCode — не дублюємо
        const headCodeHasFbq = (site.analyticsHeadCode || '').includes('fbq(');
        const pixel   = (site.analyticsMetaPixel && !headCodeHasFbq) ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${esc(site.analyticsMetaPixel)}');fbq('track','PageView');</script>` : '';

        return res.status(200).send(`<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(site.seoTitle || site.name || 'Сайт')}</title>
${site.seoDescription ? `<meta name="description" content="${esc(site.seoDescription)}">` : ''}
${site.seoKeywords    ? `<meta name="keywords"    content="${esc(site.seoKeywords)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:url" content="https://taskmanagerai-vert.vercel.app/s/${esc(site.slug || '')}">
<meta property="og:title" content="${esc(site.seoTitle || site.name || '')}">
${site.seoDescription ? `<meta property="og:description" content="${esc(site.seoDescription)}">` : ''}
${site.ogImage || site.logoUrl ? `<meta property="og:image" content="${esc(site.ogImage || site.logoUrl)}">` : '<meta property="og:image" content="https://taskmanagerai-vert.vercel.app/icons/icon-512x512.png">'}
<meta property="og:locale" content="uk_UA">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(site.seoTitle || site.name || '')}">
${site.seoDescription ? `<meta name="twitter:description" content="${esc(site.seoDescription)}">` : ''}
${site.ogImage || site.logoUrl ? `<meta name="twitter:image" content="${esc(site.ogImage || site.logoUrl)}">` : ''}
<meta name="robots" content="${site.noIndex ? 'noindex,nofollow' : 'index,follow'}">
${ga4}${gtm}${pixel}
${site.analyticsHeadCode || ''}
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'${font}',system-ui,sans-serif;color:#1a1a1a;line-height:1.6}
a{color:${primary};text-decoration:none}
img{max-width:100%;height:auto}
.btn{display:inline-block;padding:.75rem 1.75rem;background:${primary};color:#fff;border-radius:${br};font-weight:700;font-size:1rem;cursor:pointer;border:none;transition:opacity .2s}
.btn:hover{opacity:.88}
.sec{padding:4rem 1.5rem}
.wrap{max-width:900px;margin:0 auto}
.html-block{width:100%}
@media(max-width:640px){.sec{padding:2.5rem 1rem}}
</style>
</head>
<body>
${blocks}
${site.bodyCode || ''}
</body>
</html>`);

    } catch(e) {
        console.error('[site.js]', e.message);
        return res.status(500).send(errPage('Помилка сервера: ' + e.message));
    }
};

// ── Error page ───────────────────────────────────────────────
function errPage(msg) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Помилка</title></head>
<body style="font-family:system-ui;text-align:center;padding:3rem;color:#374151">
<h2 style="margin-bottom:.5rem">Помилка завантаження</h2>
<p style="color:#6b7280">${esc(msg)}</p>
</body></html>`;
}

// ── Block renderer ───────────────────────────────────────────
function renderBlock(b, primary, br, companyId, siteId) {
    switch (b.type) {

    case 'hero':
        return `<section style="background:${cssVal(b.bgColor,'#0a0f1a')};color:${cssVal(b.textColor,'#fff')};padding:5rem 1.5rem;text-align:center">
  <div style="max-width:800px;margin:0 auto">
    <h1 style="font-size:clamp(1.8rem,5vw,3rem);font-weight:800;margin-bottom:1rem">${esc(b.title||'')}</h1>
    ${b.subtitle ? `<p style="font-size:clamp(1rem,2.5vw,1.25rem);opacity:.85;margin-bottom:2rem">${esc(b.subtitle)}</p>` : ''}
    ${b.cta      ? `<a href="#form" class="btn">${esc(b.cta)}</a>` : ''}
  </div>
</section>`;

    case 'benefits':
        return `<section class="sec" style="background:#f9fafb">
  <div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem">
      ${(b.items||[]).map(it => `<div style="background:#fff;border-radius:${br};padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="font-size:1.75rem;margin-bottom:.5rem">${it.icon||''}</div>
        <h3 style="font-weight:700;margin-bottom:.35rem">${esc(it.title||'')}</h3>
        <p style="color:#6b7280;font-size:.9rem">${esc(it.text||'')}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;

    case 'services':
        return `<section class="sec">
  <div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem">
      ${(b.items||[]).map(it => `<div style="border:1px solid #e5e7eb;border-radius:${br};padding:1.5rem">
        <h3 style="font-weight:700;margin-bottom:.25rem">${esc(it.title||'')}</h3>
        <div style="color:${primary};font-weight:700;font-size:1.1rem;margin-bottom:.5rem">${esc(it.price||'')}</div>
        <p style="color:#6b7280;font-size:.88rem">${esc(it.text||'')}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;

    case 'reviews':
        return `<section class="sec" style="background:#f9fafb">
  <div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem">
      ${(b.items||[]).map(it => `<div style="background:#fff;border-radius:${br};padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="color:#f59e0b;font-size:1.1rem;margin-bottom:.5rem">${'★'.repeat(Math.min(5, it.rating||5))}</div>
        <p style="color:#374151;margin-bottom:1rem;font-style:italic">"${esc(it.text||'')}"</p>
        <div style="font-weight:600;font-size:.88rem">${esc(it.name||'')}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

    case 'faq':
        return `<section class="sec">
  <div class="wrap" style="max-width:700px">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    ${(b.items||[]).map(it => `<details style="border:1px solid #e5e7eb;border-radius:${br};padding:1.25rem;margin-bottom:.75rem">
      <summary style="font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center">
        ${esc(it.question||'')} <span style="color:${primary};font-size:1.2rem">+</span>
      </summary>
      <p style="margin-top:.75rem;color:#6b7280">${esc(it.answer||'')}</p>
    </details>`).join('')}
  </div>
</section>`;

    case 'form': {
        const fields = (b.fields || ['name','phone']).map(f => {
            const labels = {name:"Ім'я", phone:'Телефон', email:'Email', message:'Повідомлення', telegram:'Telegram'};
            const types  = {email:'email', phone:'tel', message:'textarea'};
            const st = 'width:100%;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:1rem;margin-bottom:1rem;font-family:inherit';
            return types[f] === 'textarea'
                ? `<textarea name="${f}" placeholder="${labels[f]||f}" style="${st};min-height:100px;resize:vertical" required></textarea>`
                : `<input type="${types[f]||'text'}" name="${f}" placeholder="${labels[f]||f}" style="${st};display:block" required>`;
        }).join('');
        return `<section id="form" class="sec" style="background:${primary}18">
  <div class="wrap" style="max-width:540px">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:.5rem">${esc(b.title||'')}</h2>
    ${b.subtitle ? `<p style="text-align:center;color:#6b7280;margin-bottom:2rem">${esc(b.subtitle)}</p>` : ''}
    <form id="talko-form" style="background:#fff;border-radius:${br};padding:2rem;box-shadow:0 4px 20px rgba(0,0,0,.08)">
      ${fields}
      <button type="submit" class="btn" style="width:100%">${esc(b.cta||'Відправити')}</button>
      <p id="talko-result" style="text-align:center;margin-top:1rem;font-weight:600;display:none"></p>
    </form>
  </div>
</section>
<script>
(function(){
  var f=document.getElementById('talko-form');
  if(!f) return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=f.querySelector('button[type=submit]');
    var res=document.getElementById('talko-result');
    btn.disabled=true; btn.textContent='Відправляємо...';
    var d=Object.fromEntries(new FormData(f));
    fetch('/api/crm-form',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({formId:'site_${siteId}',companyId:'${companyId}',
        name:d.name||"",phone:d.phone||"",email:d.email||"",message:d.message||"",source:'site'})
    }).then(function(){
      res.style.display='block'; res.style.color='#16a34a';
      res.textContent='✓ Дякуємо! Ми зв\u2019яжемося з вами найближчим часом.';
      f.reset();
    }).catch(function(){
      res.style.display='block'; res.style.color='#dc2626';
      res.textContent='Помилка. Спробуйте ще раз.';
    }).finally(function(){
      btn.disabled=false; btn.textContent='${esc(b.cta||'Відправити')}';
    });
  });
})();
</script>`;
    }

    case 'team':
        return `<section class="sec">
  <div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center">
      ${(b.items||[]).map(it => `<div style="text-align:center;max-width:200px">
        ${it.photo
            ? `<img src="${esc(it.photo)}" alt="${esc(it.name||'')}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:.75rem">`
            : `<div style="width:100px;height:100px;border-radius:50%;background:${primary}22;display:flex;align-items:center;justify-content:center;margin:0 auto .75rem;font-size:2rem;font-weight:700;color:${primary}">${esc((it.name||'?').charAt(0))}</div>`}
        <div style="font-weight:700">${esc(it.name||'')}</div>
        <div style="color:#6b7280;font-size:.85rem">${esc(it.role||'')}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

    case 'prices':
        return `<section class="sec" style="background:#f9fafb">
  <div class="wrap">
    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem">${esc(b.title||'')}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem">
      ${(b.items||[]).map(it => `<div style="background:#fff;border-radius:${br};padding:2rem;box-shadow:0 2px 8px rgba(0,0,0,.06);text-align:center">
        <h3 style="font-weight:700;margin-bottom:.5rem">${esc(it.title||'')}</h3>
        <div style="font-size:1.75rem;font-weight:800;color:${primary};margin-bottom:1.25rem">${esc(it.price||'')}</div>
        <ul style="list-style:none;text-align:left">
          ${(it.features||[]).map(f => `<li style="padding:.35rem 0;border-bottom:1px solid #f3f4f6;font-size:.9rem">✓ ${esc(f)}</li>`).join('')}
        </ul>
        <a href="#form" class="btn" style="display:block;margin-top:1.5rem">Обрати</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;

    case 'about':
        return `<section class="sec">
  <div class="wrap" style="display:flex;gap:3rem;align-items:center;flex-wrap:wrap">
    ${b.photo ? `<img src="${esc(b.photo)}" alt="Про нас" style="width:260px;border-radius:${br};object-fit:cover">` : ''}
    <div style="flex:1;min-width:200px">
      <h2 style="font-size:1.75rem;font-weight:700;margin-bottom:1rem">${esc(b.title||'')}</h2>
      <p style="color:#374151;line-height:1.7">${esc(b.text||'')}</p>
    </div>
  </div>
</section>`;

    case 'html':
        return b.rawHtml ? `<div class="html-block">${b.rawHtml}</div>` : '';

    default:
        return b.title ? `<section class="sec"><div class="wrap"><h2>${esc(b.title)}</h2></div></section>` : '';
    }
}
