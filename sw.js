// Define the cache name for this version of your PWA
const CACHE_NAME = 'fitness-cache-v5'; // <-- BUMPED VERSION AGAIN! This is key.

// List all the URLs that should be cached during the install phase
const urlsToCache = [
  '/', // Caches the root URL, typically index.html
  '/index.html',
  '/about.html', // Ensure about.html is in your project
  '/training.html',
  '/diet.html',
  '/contact.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event: Cache essential app shell content
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all app shell content');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
  // Force the new service worker to activate immediately, skipping the waiting phase.
  // Use with caution in production, but useful for development.
  self.skipWaiting(); 
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control of all clients immediately
  // without needing a page refresh.
  self.clients.claim();
});

// Fetch event: Serve from network first, then cache fallback for specific assets
self.addEventListener('fetch', (event) => {
  // Define assets that should always try to fetch from network first (e.g., CSS, JS)
  const networkFirstAssets = [
    '/style.css',
    '/script.js'
  ];

  // Check if the request URL matches one of the network-first assets
  const url = new URL(event.request.url);
  const isNetworkFirstAsset = networkFirstAssets.some(assetPath => url.pathname.endsWith(assetPath));

  if (event.request.method === 'GET' && url.origin === self.location.origin) {
    if (isNetworkFirstAsset) {
      // Network-first strategy for CSS and JS
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            // If network fetch is successful, cache the new response and return it
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            console.warn(`[Service Worker] Network failed for ${event.request.url}, falling back to cache.`);
            return caches.match(event.request);
          })
      );
    } else {
      // Cache-first, then network fallback for other assets (e.g., HTML pages, images)
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('[Service Worker] Serving from cache:', event.request.url);
              return response;
            }
            console.log('[Service Worker] Fetching from network:', event.request.url);
            return fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
                }
                return networkResponse;
              })
              .catch(() => {
                console.error('[Service Worker] Fetch failed and no cache match for:', event.request.url);
                if (event.request.mode === 'navigate') {
                  return caches.match('/index.html'); // Fallback for navigation if offline
                }
              });
          })
      );
    }
  }
});
