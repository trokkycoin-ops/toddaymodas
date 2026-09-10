// Service Worker Painel de Gestão Todday Modas
var CACHE_NAME = 'tm-gestao-v1';
var urlsToCache = [
    './admin-panel.css',
    './admin-panel.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
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
