
/* lucide-loader.js — завантажує lucide з CDN і кешує в localStorage */
(function() {
    var LUCIDE_VERSION = '0.263.1';
    var CACHE_KEY = 'lucide_src_' + LUCIDE_VERSION;
    var CDN_URLS = [
        'https://unpkg.com/lucide@' + LUCIDE_VERSION + '/dist/umd/lucide.min.js',
        'https://cdn.jsdelivr.net/npm/lucide@' + LUCIDE_VERSION + '/dist/umd/lucide.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/lucide/0.263.1/umd/lucide.min.js'
    ];
    
    function execScript(src) {
        var script = document.createElement('script');
        script.textContent = src;
        document.head.appendChild(script);
    }
    
    function initIcons() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }
    
    // Спробуємо з кешу
    try {
        var cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            execScript(cached);
            document.addEventListener('DOMContentLoaded', initIcons);
            return;
        }
    } catch(e) {}
    
    // Завантажуємо з CDN з fallback
    var urlIndex = 0;
    function tryLoad() {
        if (urlIndex >= CDN_URLS.length) return;
        var s = document.createElement('script');
        s.src = CDN_URLS[urlIndex];
        s.onload = function() {
            initIcons();
            // Кешуємо в localStorage для наступного разу
            // (не кешуємо самий JS — просто помічаємо що CDN працює)
        };
        s.onerror = function() {
            urlIndex++;
            tryLoad();
        };
        document.head.appendChild(s);
    }
    tryLoad();
})();
