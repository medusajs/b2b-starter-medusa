import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache assets
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache images with Cache First strategy
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Cache API responses with Network First strategy
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 minutes
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Cache static assets with Stale While Revalidate
registerRoute(
    ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
            }),
        ],
    })
);

// Cache catalog pages with Network First
registerRoute(
    ({ url }) => url.pathname.includes('/produtos'),
    new NetworkFirst({
        cacheName: 'catalog-pages',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 20,
                maxAgeSeconds: 60 * 60, // 1 hour
            }),
        ],
    })
);

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Background sync implementation
async function doBackgroundSync() {
    try {
        const cache = await caches.open('sync-queue');
        const requests = await cache.keys();

        for (const request of requests) {
            try {
                await fetch(request);
                await cache.delete(request);
            } catch (error) {
                console.error('Background sync failed:', error);
            }
        }
    } catch (error) {
        console.error('Background sync error:', error);
    }
}

// Handle push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('critical-assets-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/manifest.json',
                '/icon-192x192.png',
                '/icon-512x512.png'
            ]);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith('critical-assets-') && cacheName !== 'critical-assets-v1')
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
    );
});