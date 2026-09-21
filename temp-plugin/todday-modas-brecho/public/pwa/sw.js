/**
 * Todday Modas Brechó — Service Worker
 * @version 1.0.20
 */

const CACHE_NAME = 'todday-modas-v20';
const ASSETS_TO_CACHE = [
  './',
  '../../assets/css/todday-frontend.css',
  '../../assets/js/todday-frontend.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Ignora falha de cache se executado em ambiente com caminhos parciais
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora chamadas à API REST ou AJAX para garantir dados frescos
  if (event.request.url.includes('/wp-json/') || event.request.url.includes('admin-ajax.php')) {
    return;
  }

  const isStoreAsset = event.request.url.includes('/wp-content/plugins/todday-modas-brecho/');
  event.respondWith(
    (isStoreAsset
      ? fetch(event.request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }).catch(() => caches.match(event.request))
      : caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))).catch(() => {
        // Fallback offline caso a rede esteja indisponível
        if (event.request.mode === 'navigate') {
          return new Response(
            '<div style="font-family:sans-serif;padding:30px;text-align:center;"><h2>Modo Offline</h2><p>Você está desconectado da internet. Conecte-se para continuar garimpando no Todday Modas Brechó.</p></div>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }
    )
  );
});
