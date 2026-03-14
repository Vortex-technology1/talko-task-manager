// /api/site.js
// Публічний endpoint для перегляду опублікованих сайтів
// URL: /api/site?id=SITE_ID&cid=COMPANY_ID
// або через rewrite: /s/SITE_ID

const admin = require('firebase-admin');

let _db = null;
function db() {
    if (!_db) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId:   process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey:  (process.env.FIREBASE_PRIVATE_KEY||'').replace(/\\n/g,'\n'),
                }),
            });
        }
        _db = admin.firestore();
    }
    return _db;
}

module.exports = async (req, res) => {
    const { id: siteId, cid: companyId } = req.query;

    if (!siteId || !companyId) {
        return res.status(400).send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:3rem;">
                <h2>Сайт не знайдено</h2>
                <p style="color:#6b7280;">Невірне посилання</p>
            </body></html>
        `);
    }

    try {
        const siteDoc = await db()
            .collection('companies').doc(companyId)
            .collection('sites').doc(siteId)
            .get();

        if (!siteDoc.exists) {
            return res.status(404).send(`
                <html><body style="font-family:sans-serif;text-align:center;padding:3rem;">
                    <h2>Сайт не знайдено</h2>
                    <p style="color:#6b7280;">Можливо його видалено або посилання застаріле</p>
                </body></html>
            `);
        }

        const site = siteDoc.data();

        if (site.status !== 'published') {
            return res.status(403).send(`
                <html><body style="font-family:sans-serif;text-align:center;padding:3rem;">
                    <h2>Сайт не опублікований</h2>
                    <p style="color:#6b7280;">Цей сайт ще не доступний публічно</p>
                </body></html>
            `);
        }

        // ── Трекаємо відвідування ───────────────────────────
        try {
            await db()
                .collection('companies').doc(companyId)
                .collection('sites').doc(siteId)
                .update({
                    visits: admin.firestore.FieldValue.increment(1),
                    lastVisitAt: admin.firestore.FieldValue.serverTimestamp(),
                });
        } catch(e) { /* not critical */ }

        // ── Якщо rawHtml режим ──────────────────────────────
        if (site.mode === 'html' && site.rawHtml) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.status(200).send(site.rawHtml);
        }

        // ── Блок режим — збираємо HTML ──────────────────────
        const blocks  = site.blocks || [];
        const theme   = site.theme  || { primaryColor: '#22c55e', fontFamily: 'Inter', borderRadius: '12px' };
        const primary = theme.primaryColor || '#22c55e';
        const font    = theme.fontFamily   || 'Inter';

        // Рендеримо блоки
        const blocksHtml = blocks.map(block => renderBlock(block, primary, site, companyId)).join('\n');

        // Аналітика
        const headCode = site.analyticsHeadCode || '';
        const bodyCode = site.bodyCode || '';

        // GA4 / GTM
        const ga4  = site.analyticsGA4  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.analyticsGA4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${site.analyticsGA4}');</script>` : '';
        const gtm  = site.analyticsGTM  ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.analyticsGTM}');</script>` : '';
        const fb   = site.analyticsMetaPixel ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${site.analyticsMetaPixel}');fbq('track','PageView');</script>` : '';

        const html = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(site.seoTitle || site.name || 'Сайт')}</title>
${site.seoDescription ? `<meta name="description" content="${escHtml(site.seoDescription)}">` : ''}
${site.seoKeywords ? `<meta name="keywords" content="${escHtml(site.seoKeywords)}">` : ''}
<meta property="og:title" content="${escHtml(site.seoTitle || site.name || 'Сайт')}">
${site.seoDescription ? `<meta property="og:description" content="${escHtml(site.seoDescription)}">` : ''}
${ga4}${gtm}${fb}
${headCode}
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'${escHtml(font)}',Inter,system-ui,sans-serif;color:#1a1a1a;line-height:1.6;}
a{color:${primary};text-decoration:none;}
img{max-width:100%;height:auto;}
.site-btn{display:inline-block;padding:0.75rem 1.75rem;background:${primary};color:#fff;border-radius:${theme.borderRadius||'12px'};font-weight:700;font-size:1rem;cursor:pointer;border:none;transition:opacity .2s;}
.site-btn:hover{opacity:0.88;}
.site-section{padding:4rem 1.5rem;}
.site-container{max-width:900px;margin:0 auto;}
.site-block--html{width:100%;}
@media(max-width:640px){.site-section{padding:2.5rem 1rem;}}
</style>
</head>
<body>
${gtm ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${site.analyticsGTM}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : ''}
${blocksHtml}
${bodyCode}
<script>
// Track visit
fetch('/api/track-visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({siteId:'${siteId}',companyId:'${companyId}'})}).catch(()=>{});
</script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=60');
        return res.status(200).send(html);

    } catch(e) {
        console.error('[site.js]', e.message);
        return res.status(500).send(`<html><body style="padding:2rem;font-family:sans-serif;">
            <h2>Помилка завантаження</h2><p>${escHtml(e.message)}</p>
        </body></html>`);
    }
};

function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderBlock(block, primary, site, companyId) {
    const br = site.theme?.borderRadius || '12px';

    switch(block.type) {
        case 'hero':
            return `<section style="background:${block.bgColor||'#0a0f1a'};color:${block.textColor||'#ffffff'};padding:5rem 1.5rem;text-align:center;">
                <div style="max-width:800px;margin:0 auto;">
                    <h1 style="font-size:clamp(1.8rem,5vw,3rem);font-weight:800;margin-bottom:1rem;">${escHtml(block.title||'')}</h1>
                    ${block.subtitle?`<p style="font-size:clamp(1rem,2.5vw,1.25rem);opacity:.85;margin-bottom:2rem;">${escHtml(block.subtitle)}</p>`:''}
                    ${block.cta?`<a href="#form" class="site-btn">${escHtml(block.cta)}</a>`:''}
                </div>
            </section>`;

        case 'benefits':
            return `<section class="site-section" style="background:#f9fafb;">
                <div class="site-container">
                    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem;">${escHtml(block.title||'')}</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;">
                        ${(block.items||[]).map(it=>`<div style="background:#fff;border-radius:${br};padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.06);">
                            <div style="font-size:1.75rem;margin-bottom:0.5rem;">${it.icon||''}</div>
                            <h3 style="font-weight:700;margin-bottom:0.35rem;">${escHtml(it.title||'')}</h3>
                            <p style="color:#6b7280;font-size:.9rem;">${escHtml(it.text||'')}</p>
                        </div>`).join('')}
                    </div>
                </div>
            </section>`;

        case 'services':
            return `<section class="site-section">
                <div class="site-container">
                    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem;">${escHtml(block.title||'')}</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem;">
                        ${(block.items||[]).map(it=>`<div style="border:1px solid #e5e7eb;border-radius:${br};padding:1.5rem;">
                            <h3 style="font-weight:700;margin-bottom:.25rem;">${escHtml(it.title||'')}</h3>
                            <div style="color:${primary};font-weight:700;font-size:1.1rem;margin-bottom:.5rem;">${escHtml(it.price||'')}</div>
                            <p style="color:#6b7280;font-size:.88rem;">${escHtml(it.text||'')}</p>
                        </div>`).join('')}
                    </div>
                </div>
            </section>`;

        case 'reviews':
            return `<section class="site-section" style="background:#f9fafb;">
                <div class="site-container">
                    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem;">${escHtml(block.title||'')}</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;">
                        ${(block.items||[]).map(it=>`<div style="background:#fff;border-radius:${br};padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.06);">
                            <div style="color:#f59e0b;font-size:1.1rem;margin-bottom:.5rem;">${'★'.repeat(it.rating||5)}</div>
                            <p style="color:#374151;margin-bottom:1rem;font-style:italic;">"${escHtml(it.text||'')}"</p>
                            <div style="font-weight:600;font-size:.88rem;">${escHtml(it.name||'')}</div>
                        </div>`).join('')}
                    </div>
                </div>
            </section>`;

        case 'faq':
            return `<section class="site-section">
                <div class="site-container" style="max-width:700px;">
                    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem;">${escHtml(block.title||'')}</h2>
                    ${(block.items||[]).map(it=>`<details style="border:1px solid #e5e7eb;border-radius:${br};padding:1.25rem;margin-bottom:.75rem;">
                        <summary style="font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
                            ${escHtml(it.question||'')} <span style="color:${primary};">+</span>
                        </summary>
                        <p style="margin-top:.75rem;color:#6b7280;">${escHtml(it.answer||'')}</p>
                    </details>`).join('')}
                </div>
            </section>`;

        case 'form':
            return `<section id="form" class="site-section" style="background:${primary}15;">
                <div class="site-container" style="max-width:540px;">
                    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:.5rem;">${escHtml(block.title||'')}</h2>
                    ${block.subtitle?`<p style="text-align:center;color:#6b7280;margin-bottom:2rem;">${escHtml(block.subtitle)}</p>`:''}
                    <form id="site-form" style="background:#fff;border-radius:${br};padding:2rem;box-shadow:0 4px 20px rgba(0,0,0,.08);">
                        ${(block.fields||['name','phone']).map(f=>{
                            const labels={name:"Ім'я",phone:'Телефон',email:'Email',message:'Повідомлення',telegram:'Telegram'};
                            const types={email:'email',phone:'tel',message:'textarea'};
                            return types[f]==='textarea'
                                ? `<textarea name="${f}" placeholder="${labels[f]||f}" required style="width:100%;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:1rem;margin-bottom:1rem;min-height:100px;font-family:inherit;resize:vertical;"></textarea>`
                                : `<input type="${types[f]||'text'}" name="${f}" placeholder="${labels[f]||f}" required style="width:100%;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:8px;font-size:1rem;margin-bottom:1rem;display:block;">`;
                        }).join('')}
                        <button type="submit" class="site-btn" style="width:100%;">${escHtml(block.cta||'Відправити')}</button>
                        <div id="form-result" style="text-align:center;margin-top:1rem;font-weight:600;display:none;"></div>
                    </form>
                    <script>
                    document.getElementById('site-form').addEventListener('submit',async function(e){
                        e.preventDefault();
                        const btn=this.querySelector('button[type=submit]');
                        const res=document.getElementById('form-result');
                        btn.disabled=true; btn.textContent='Відправляємо...';
                        const data=Object.fromEntries(new FormData(this));
                        try{
                            await fetch('/api/crm-form',{method:'POST',headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({formId:'site_${escHtml(site.id||'')}',companyId:'${escHtml(companyId)}',
                                    name:data.name||data['Ім\\'я']||'',phone:data.phone||data['Телефон']||'',
                                    email:data.email||'',message:data.message||'',source:'site'})});
                            res.style.display='block'; res.style.color='#16a34a';
                            res.textContent='✓ Дякуємо! Ми зв\\'яжемося з вами найближчим часом.';
                            this.reset();
                        }catch(err){
                            res.style.display='block'; res.style.color='#dc2626';
                            res.textContent='Помилка. Спробуйте ще раз.';
                        }
                        btn.disabled=false; btn.textContent='${escHtml(block.cta||'Відправити')}';
                    });
                    </script>
                </div>
            </section>`;

        case 'team':
            return `<section class="site-section">
                <div class="site-container">
                    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem;">${escHtml(block.title||'')}</h2>
                    <div style="display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center;">
                        ${(block.items||[]).map(it=>`<div style="text-align:center;max-width:200px;">
                            ${it.photo?`<img src="${escHtml(it.photo)}" alt="${escHtml(it.name||'')}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:.75rem;">`:`<div style="width:100px;height:100px;border-radius:50%;background:${primary}22;display:flex;align-items:center;justify-content:center;margin:0 auto .75rem;font-size:2rem;font-weight:700;color:${primary};">${(it.name||'?').charAt(0)}</div>`}
                            <div style="font-weight:700;">${escHtml(it.name||'')}</div>
                            <div style="color:#6b7280;font-size:.85rem;">${escHtml(it.role||'')}</div>
                        </div>`).join('')}
                    </div>
                </div>
            </section>`;

        case 'prices':
            return `<section class="site-section" style="background:#f9fafb;">
                <div class="site-container">
                    <h2 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:2.5rem;">${escHtml(block.title||'')}</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;">
                        ${(block.items||[]).map(it=>`<div style="background:#fff;border-radius:${br};padding:2rem;box-shadow:0 2px 8px rgba(0,0,0,.06);text-align:center;">
                            <h3 style="font-weight:700;margin-bottom:.5rem;">${escHtml(it.title||'')}</h3>
                            <div style="font-size:1.75rem;font-weight:800;color:${primary};margin-bottom:1.25rem;">${escHtml(it.price||'')}</div>
                            <ul style="list-style:none;text-align:left;">
                                ${(it.features||[]).map(f=>`<li style="padding:.35rem 0;border-bottom:1px solid #f3f4f6;font-size:.9rem;">✓ ${escHtml(f)}</li>`).join('')}
                            </ul>
                            <a href="#form" class="site-btn" style="display:block;margin-top:1.5rem;">Обрати</a>
                        </div>`).join('')}
                    </div>
                </div>
            </section>`;

        case 'about':
            return `<section class="site-section">
                <div class="site-container" style="display:flex;gap:3rem;align-items:center;flex-wrap:wrap;">
                    ${block.photo?`<img src="${escHtml(block.photo)}" alt="Про нас" style="width:260px;border-radius:${br};object-fit:cover;">`:''}
                    <div style="flex:1;min-width:200px;">
                        <h2 style="font-size:1.75rem;font-weight:700;margin-bottom:1rem;">${escHtml(block.title||'')}</h2>
                        <p style="color:#374151;line-height:1.7;">${escHtml(block.text||'')}</p>
                    </div>
                </div>
            </section>`;

        case 'html':
            return block.rawHtml
                ? `<div class="site-block--html">${block.rawHtml}</div>`
                : '';

        default:
            return block.title
                ? `<section class="site-section"><div class="site-container"><h2>${escHtml(block.title)}</h2></div></section>`
                : '';
    }
}
