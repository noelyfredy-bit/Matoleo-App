// Service Worker ya Matoleo Kanisani — inahifadhi "ganda" la app (HTML/aikoni)
// kwenye kifaa ili iweze kufunguka hata bila mtandao. Data yenyewe ya matoleo
// inaendelea kuhifadhiwa kwa njia yake ya kawaida (localStorage/Supabase),
// hii ni kwa ajili ya app kufunguka tu, si data.

const CACHE_NAME = 'matoleo-kanisani-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Data ya mtandaoni (Supabase, maktaba za CDN) daima itokane na mtandao moja kwa moja.
  // "Ganda" la app (index.html na aikoni) linaweza kutumika kutoka cache ukiwa offline.
  const url = event.request.url;
  const isAppShell = FILES_TO_CACHE.some((f) => url.endsWith(f.replace('./', '')));
  if (!isAppShell) return; // acha ombi liende moja kwa moja kwenye mtandao

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
