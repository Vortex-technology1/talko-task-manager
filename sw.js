const CACHE_VERSION = '2026-02-24-v2';
const CACHE_NAME = `talko-tasks-${CACHE_VERSION}`;

// Static assets to precache
const PRECACHE_URLS = [
  'index_task.html',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install — precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.log('[SW] Precache failed:', err))
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — strategy per request type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Firebase/Google API — network only (no cache)
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebase.google.com') ||
      url.hostname.includes('accounts.google.com') ||
      url.hostname.includes('gstatic.com/firebasejs') ||
      url.hostname.includes('firestore.googleapis.com')) {
    return;
  }

  // Fonts — cache first (rarely change)
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Icons — cache first
  if (url.pathname.includes('/icons/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // App shell (HTML, JS, CSS) — network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || new Response('Offline — перевірте з\'єднання з інтернетом', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        });
      })
  );
});
