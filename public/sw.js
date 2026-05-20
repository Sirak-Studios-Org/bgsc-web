const CACHE = 'bgsc-v1';
const OFFLINE_URL = '/portal/offline';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match(OFFLINE_URL)))
  );
});
