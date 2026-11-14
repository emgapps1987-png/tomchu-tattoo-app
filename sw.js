// Service worker – עבודה גם בלי אינטרנט.
// אחרי כל שינוי בקבצים כדאי להעלות את מספר הגרסה כדי שהטלפונים יקבלו את העדכון.
// התראות (OneSignal) – אותו service worker משמש גם להתראות על מבצעים
try { importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js'); } catch (e) { /* בלי רשת – רק מטמון */ }
const VERSION = 'tomchu-v39';
const CORE = [
  './', 'index.html', 'install.html', 'privacy.html', 'css/styles.css', 'js/app.js', 'js/boot.js', 'js/i18n.js', 'js/i18n-data.js', 'js/content.js', 'manifest.webmanifest',
  'assets/img/logo-dark.png', 'assets/img/tom-studio.jpg',
  'assets/icons/icon-192.png', 'assets/icons/favicon-48.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com');
  if (!sameOrigin && !isFont) return;
  const isImage = req.destination === 'image' || isFont;
  if (isImage) {
    // תמונות ופונטים: קודם מהמטמון
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })));
  } else {
    // דפים וקוד: קודם מהרשת (כדי לקבל עדכונים), ובלי רשת – מהמטמון
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html'))));
  }
});
