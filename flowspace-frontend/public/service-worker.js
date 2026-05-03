const CACHE_NAME = 'flowspace-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/tasks',
  '/goals',
  '/reminders',
  '/habits',
  '/notes',
  '/analytics',
  '/settings',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Handle API requests differently - don't cache them
        if (event.request.url.includes('/api/')) {
          return fetch(event.request).catch(() => {
            // Return a fallback response for API failures
            return new Response(JSON.stringify({ error: 'Network error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        }
        
        return fetch(event.request).catch((error) => {
          console.log('Fetch failed for:', event.request.url, error);
          // Return a basic HTML page for navigation failures
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        }).then((response) => {
          // Only cache successful responses
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
