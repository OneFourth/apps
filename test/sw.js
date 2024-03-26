const addResourcesToCache = async (resources) => {
    const cache = await caches.open('test');
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    const cache = await caches.open('test');
    await cache.put(request, response);
};

const cacheStrategy = async ({ request, preloadResponsePromise }) => {
    try {
        const responseFromNetwork = await fetch(request.clone());

        if (responseFromNetwork.ok) {
            putInCache(request, responseFromNetwork.clone());
        }

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
            '.',
            './app.js',
            './images/icons-192.png',
            './images/icons-512.png',
            './index.html',
            './manifest.json',
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        cacheStrategy({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
        })
    );
});
