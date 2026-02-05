// FitFlow Service Worker for PWA functionality
const CACHE_NAME = 'fitflow-v1.0.0';
const STATIC_CACHE = 'fitflow-static-v1';
const DYNAMIC_CACHE = 'fitflow-dynamic-v1';

// Files to cache for offline functionality
// Using relative paths for deployment flexibility
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json'
  // Note: Don't cache specific JS/CSS files as they change with each build
  // The service worker will cache them dynamically on first load
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/localhost:3000\/api\//,
  /^http:\/\/localhost:3000\/api\//
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('FitFlow SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('FitFlow SW: Caching static files');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch((error) => {
        console.log('FitFlow SW: Cache failed for some static files', error);
      })
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('FitFlow SW: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('FitFlow SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML pages - Network first, cache fallback
    event.respondWith(handleDocumentRequest(request));
  } else if (STATIC_FILES.some(file => request.url.includes(file))) {
    // Static files - Cache first
    event.respondWith(handleStaticRequest(request));
  } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    // API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else {
    // Other requests - Network first
    event.respondWith(handleOtherRequest(request));
  }
});

// Handle document requests (HTML pages)
async function handleDocumentRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page if available
    return caches.match('/index.html');
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('FitFlow SW: Failed to fetch static file:', request.url);
    throw error;
  }
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('FitFlow SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkoutData());
  }
});

// Sync workout data when back online
async function syncWorkoutData() {
  try {
    // Get pending workout data from IndexedDB or localStorage
    const pendingWorkouts = JSON.parse(localStorage.getItem('pendingWorkouts') || '[]');
    
    for (const workout of pendingWorkouts) {
      try {
        await fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workout)
        });
      } catch (error) {
        console.log('Failed to sync workout:', error);
      }
    }
    
    // Clear pending workouts after successful sync
    localStorage.removeItem('pendingWorkouts');
    console.log('FitFlow SW: Workout data synced successfully');
  } catch (error) {
    console.log('FitFlow SW: Sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('FitFlow SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Time for your workout!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start-workout',
        title: 'Start Workout',
        icon: '/icons/workout-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('FitFlow', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('FitFlow SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'start-workout') {
    event.waitUntil(
      clients.openWindow('/?action=workout')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});