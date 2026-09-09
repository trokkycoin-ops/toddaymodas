/* Service Worker do app de Gestão Todday (escopo /painel-todday/).
   Estrategia segura: navegacao e dados sempre da rede (painel exige login);
   assets estaticos do painel com network-first (sempre tenta a rede, o cache
   e so fallback offline) — evita PWA instalado congelado em versao antiga. */
var TMG_CACHE = 'tmg-cache-v4';

self.addEventListener('install', function (e) {
	self.skipWaiting();
});

self.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (k) {
				if (k !== TMG_CACHE) { return caches.delete(k); }
			}));
		}).then(function () { return self.clients.claim(); })
	);
});

self.addEventListener('fetch', function (e) {
	var req = e.request;
	if (req.method !== 'GET' || req.url.indexOf(self.location.origin) !== 0) { return; }
	if (req.url.indexOf('/includes/panel/assets/') === -1) { return; }

	e.respondWith(
		fetch(req).then(function (res) {
			if (res.ok) {
				var clone = res.clone();
				caches.open(TMG_CACHE).then(function (c) { c.put(req, clone); });
			}
			return res;
		}).catch(function () {
			return caches.match(req);
		})
	);
});
