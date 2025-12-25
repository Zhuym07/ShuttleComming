const CACHE_NAME = 'gt-shuttle-cache-v7';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/lite.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force new SW to take control immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching critical assets');
      // We don't fail installation if some external asset fails to cache
      return cache.addAll(CRITICAL_ASSETS).catch(err => console.warn('Pre-cache warning:', err));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Become available to all clients immediately
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Navigation (HTML): Network First
  // Always try to get latest HTML from server to ensure we point to valid JS hashes.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache with the fresh HTML
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline? Return cached HTML
          return caches.match(event.request).then(res => {
              return res || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 2. Assets & Others: Cache First
  // JS/CSS from Vite have hash in filename, so they are immutable.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Cache valid responses
          // We check for status 200. For external images (opaque responses), the status might be 0, 
          // but typically we want to cache successful GETs.
          if (!response || (response.status !== 200 && response.status !== 0)) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback for images (e.g. if external image fails)
          if (event.request.destination === 'image') {
            return caches.match('/icon.svg');
          }
        });
    })
  );
});