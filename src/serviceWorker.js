/**
 * Service Worker for LWC OSS Mobile Application
 * Handles caching and offline capability
 */

// Service worker version - increment this when service worker logic changes
const CACHE_VERSION = 'v1';

// Cache names
const STATIC_CACHE_NAME = `lwc-oss-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `lwc-oss-dynamic-${CACHE_VERSION}`;

// Assets to cache immediately when service worker is installed
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/assets/css/main.css',
    '/assets/css/normalize.css',
    '/assets/icons/standard-sprite/svg/symbols.svg',
    '/assets/icons/utility-sprite/svg/symbols.svg',
    '/lwc.js'
];

// Install event handler - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker...', event);

    event.waitUntil(
        caches
            .open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching App Shell');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Precaching completed');
                return self.skipWaiting(); // Ensure the new service worker activates immediately
            })
    );
});

// Activate event handler - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker...', event);

    event.waitUntil(
        caches
            .keys()
            .then((keyList) => {
                return Promise.all(
                    keyList.map((key) => {
                        if (
                            key !== STATIC_CACHE_NAME &&
                            key !== DYNAMIC_CACHE_NAME
                        ) {
                            console.log(
                                '[Service Worker] Removing old cache',
                                key
                            );
                            return caches.delete(key);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Claiming clients');
                return self.clients.claim(); // Take control of all clients
            })
    );
});

// Fetch event handler - serve from cache or network
self.addEventListener('fetch', (event) => {
    // Skip for API calls and IndexedDB operations
    if (
        event.request.url.includes('/api/') ||
        event.request.url.includes('indexeddb')
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then((response) => {
                    // Don't cache responses that aren't successful
                    if (
                        !response ||
                        response.status !== 200 ||
                        response.type !== 'basic'
                    ) {
                        return response;
                    }

                    // Clone the response since it can only be consumed once
                    const responseToCache = response.clone();
                    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                })
                .catch((error) => {
                    console.log('[Service Worker] Fetch failed:', error);
                    // If it's an HTML request, return the offline page
                    if (
                        event.request.headers
                            .get('accept')
                            .includes('text/html')
                    ) {
                        return caches.match('/offline.html');
                    }
                });
        })
    );
});

// Background sync for pending operations
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background Sync:', event);
    if (event.tag === 'sync-pending-operations') {
        event.waitUntil(syncPendingOperations());
    }
});

// Periodic sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('[Service Worker] Periodic Sync:', event);
    if (event.tag === 'sync-pending-operations') {
        event.waitUntil(syncPendingOperations());
    }
});

// Function to sync pending operations
function syncPendingOperations() {
    console.log('[Service Worker] Syncing pending operations');

    // Notify all clients about the sync
    return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'SYNC_PENDING_OPERATIONS'
            });
        });
    });
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Notification received', event);

    let data = { title: 'New Notification', body: 'Something new happened!' };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    const options = {
        body: data.body,
        icon: '/assets/images/logo.svg',
        badge: '/assets/images/favicon-32x32.png'
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});
