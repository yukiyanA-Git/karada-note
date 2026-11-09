const CACHE_NAME = 'karada-note-v10';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app-icon.jpg',
  './app-icon-192.png',
  './app-icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 広告スクリプトや外部Hub等はキャッシュしない
  if (event.request.url.includes('yukiyanart-feedback-hub') || event.request.url.includes('googlesyndication')) {
    return;
  }

  // HTML / Navigation は Network First (最新データ優先取得)
  if (event.request.mode === 'navigate' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request) || caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
