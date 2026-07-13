const CACHE = 'nhacoi-v3';
const FILES = ['./landing.html', './index.html', './manifest.json', './icon.svg', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Bỏ qua chặn Service Worker cho các file tải xuống (như APK)
  if (e.request.url.endsWith('.apk')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
