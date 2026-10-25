/* Offline support: cache the app shell, serve cache-first, refresh in the background. */
const CACHE = 'little-pianist-v1';
const ASSETS = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icons/icon.svg',
  'js/core/util.js', 'js/data/notes.js', 'js/data/songs.js', 'js/data/lessons.js', 'js/i18n.js',
  'js/core/store.js', 'js/core/audio.js', 'js/core/pitch.js', 'js/core/input.js',
  'js/ui/fx.js', 'js/ui/piano.js', 'js/ui/sheet.js', 'js/app.js',
  'js/views/home.js', 'js/views/learn.js', 'js/views/songs.js', 'js/views/helper.js',
  'js/views/games.js', 'js/views/free.js', 'js/views/settings.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes('fonts.g'))) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
