const CACHE_NAME = 'journey4life-v1';
const OFFLINE_URL = 'offline.html';

const PRECACHE_ASSETS = [
  './',
  'index.html',
  'offline.html',
  'css/hover-animations.css',
  'js/ratings.js',
  'js/pwa.js',
  'images/Journey.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle navigation requests with offline fallback
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Put a copy in cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Cache-first for other requests (static assets)
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(networkRes => {
      // Optionally cache dynamic assets
      return networkRes;
    })).catch(() => caches.match(OFFLINE_URL))
  );
});
