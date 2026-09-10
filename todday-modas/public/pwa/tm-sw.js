// Service Worker PWA Todday Modas
var CACHE_NAME = 'tm-pwa-v1.0.27';
var ASSETS = [
    '/',
    '/wp-content/plugins/todday-modas/public/assets/css/tm-public.css',
    '/wp-content/plugins/todday-modas/public/assets/css/tm-variables.css',
    '/wp-content/plugins/todday-modas/public/assets/js/tm-public.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
