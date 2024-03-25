const addResourcesToCache = async (resources) => {
    const cache = await caches.open('v1');
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    const cache = await caches.open('v1');
    await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise }) => {
    try {
        const responseFromNetwork = await fetch(request.clone());
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            return responseFromCache;
        } else {
            return new Response('Unavailable from cache', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
            });
        }
    }
};

self.addEventListener('install', (event) => {
    event.waitUntil(
        addResourcesToCache([
            '/apps/',
            '/apps/app.js',
            '/apps/images/icons-192.png',
            '/apps/images/icons-512.png',
            '/apps/index.html',
            '/apps/styles.css',
            '/apps/manifest.json',
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
        })
    );
});
