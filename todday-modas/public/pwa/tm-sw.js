/* Service Worker Todday Modas — cache-first para assets, network-first para páginas. */
var TM_CACHE = 'tm-cache-v2';
var TM_ASSETS = ['/'];

self.addEventListener('install', function (e) {
	e.waitUntil(caches.open(TM_CACHE).then(function (c) { return c.addAll(TM_ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (k) { if (k !== TM_CACHE) { return caches.delete(k); } }));
		}).then(function () { return self.clients.claim(); })
	);
});

self.addEventListener('fetch', function (e) {
	var req = e.request;
	if (req.method !== 'GET' || req.url.indexOf(location.origin) !== 0) { return; }

	// Páginas HTML: network-first com fallback offline.
	if (req.mode === 'navigate') {
		e.respondWith(
			fetch(req).then(function (res) {
				var clone = res.clone();
				caches.open(TM_CACHE).then(function (c) { c.put(req, clone); });
				return res;
			}).catch(function () {
				return caches.match(req).then(function (hit) { return hit || caches.match('/'); });
			})
		);
		return;
	}

	// Assets (css/js/img/font): cache-first.
	e.respondWith(
		caches.match(req).then(function (hit) {
			if (hit) { return hit; }
			return fetch(req).then(function (res) {
				if (res.ok) {
					var clone = res.clone();
					caches.open(TM_CACHE).then(function (c) { c.put(req, clone); });
				}
				return res;
			});
		})
	);
});
