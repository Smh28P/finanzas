// Guarda la app para que abra al instante y sin señal.
// Sube VERSION cada vez que cambies index.html para que el iPhone tome la nueva versión.
const VERSION = 'finanzas-v2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Google Sheets va directo a la red
  e.respondWith(
    caches.match(e.request).then(guardado => {
      const red = fetch(e.request).then(r => {
        if (r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() => guardado);
      return guardado || red;
    })
  );
});
