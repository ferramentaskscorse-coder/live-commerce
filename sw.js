const CACHE_NAME = 'live-commerce-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Instala e faz cache dos arquivos principais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback para cache
self.addEventListener('fetch', e => {
  // Ignora requisições externas (APIs, CDN)
  if(!e.request.url.startsWith(self.location.origin)){
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Atualiza cache com versão mais recente
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
