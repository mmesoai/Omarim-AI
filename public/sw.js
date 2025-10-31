
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // No caching strategy implemented yet, just installation.
});

self.addEventListener('fetch', (event) => {
  // This is a pass-through service worker. It doesn't intercept fetch requests yet.
  // This is the simplest strategy to ensure the app is installable (PWA).
  event.respondWith(fetch(event.request));
});
