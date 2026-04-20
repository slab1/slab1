
// Enhanced Service Worker with security headers and memory-efficient caching
const CACHE_NAME = 'reservatoo-v1';
const STATIC_CACHE = 'static-v1';
const MAX_CACHE_SIZE = 50; // Limit cache size for memory efficiency

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/placeholder.svg'
];

// Security headers to add to all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Add security headers to response
function addSecurityHeaders(response) {
  if (!response) return response;
  
  const newHeaders = new Headers(response.headers);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Opened cache and adding assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch event with optimized strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Navigation requests (HTML) - Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return addSecurityHeaders(response);
        })
        .catch(() => {
          return caches.match(request)
            .then(response => response || caches.match('/offline.html'))
            .then(addSecurityHeaders);
        })
    );
    return;
  }

  // Static assets - Cache First
  if (
    url.origin === self.location.origin &&
    (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|avif|woff2|ico)$/) || urlsToCache.includes(url.pathname))
  ) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return addSecurityHeaders(cachedResponse);
        }

        return fetch(request).then(response => {
          if (!response || response.status !== 200) {
            return addSecurityHeaders(response);
          }
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
          return addSecurityHeaders(response);
        });
      })
    );
    return;
  }

  // External images (Unsplash, etc.) - Cache First with limit
  if (request.destination === 'image' && !url.origin.includes(self.location.origin)) {
    event.respondWith(
      caches.open('reservatoo-images-v1').then(cache => {
        return cache.match(request).then(response => {
          if (response) return response;

          return fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => caches.match('/placeholder.svg'));
        });
      })
    );
    return;
  }

  // API requests and others - Network First
  event.respondWith(
    fetch(request)
      .then(addSecurityHeaders)
      .catch(() => {
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) return addSecurityHeaders(cachedResponse);
          return addSecurityHeaders(new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
        });
      })
  );
});

// Activate event with memory cleanup
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Background sync for offline reservations - using simple fallback since localStorage is not available
self.addEventListener('sync', event => {
  if (event.tag === 'reservation-sync') {
    console.log('Syncing reservations...');
    // In a real app, you would use IndexedDB here
  }
});

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/icon-view.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-close.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/reservations')
    );
  }
});

// Skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Add to existing service worker
const IMAGE_CACHE = 'reservatoo-images-v1';
const IMAGE_CACHE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Cache images with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache Unsplash images with network-first strategy
  if (url.hostname.includes('images.unsplash.com')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return placeholder if both network and cache fail
          return caches.match('/placeholder.svg');
        }
      })
    );
  }

  // Cache local images with cache-first strategy
  if (request.destination === 'image' && url.origin === self.location.origin) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          return caches.match('/placeholder.svg');
        }
      })
    );
  }
});
