// Service Worker for Luna Launch - Smart Caching with Live Chat Support
const CACHE_NAME = 'luna-launch-v2-20250130';
const LIVE_CHAT_VERSION = '20250130-001';
const urlsToCache = [
    '/',
    '/index.html',
    '/create-token/index.html',
    '/my-portfolio/index.html',
    '/terms-of-service.html',
    '/privacy-policy.html',
    '/assets/Satoshi-Variable-ChAXbpFa.ttf',
    '/assets/material-symbols-rounded.woff2',
    '/assets/bg1-DWJ0RCfe.png',
    '/assets/logo-full.svg',
    '/assets/index-DXrY5z_5.css',
    '/assets/styles-DQqVfxH3.css',
    '/assets/Nav-BSSNAbSG.css',
    '/assets/Footer-BFSbDbyr.css',
    '/assets/Landing-BPBDyXu0.css',
    '/assets/PolicyPage-DaYjxvSS.css',
    '/assets/css2.css',
    `/assets/live-chat.css?v=${LIVE_CHAT_VERSION}`,
    `/assets/live-chat.js?v=${LIVE_CHAT_VERSION}`
];

// Install SW and cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Fetch - Smart Caching Strategy
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Always fetch live chat files fresh (bypass cache)
    if (requestUrl.pathname.includes('live-chat.') || requestUrl.search.includes('v=20250130')) {
        event.respondWith(
            fetch(event.request).then(response => {
                // Cache the fresh response for next time
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            }).catch(() => {
                // Fallback to cached version if network fails
                return caches.match(event.request);
            })
        );
        return;
    }
    
    // Network First for HTML files (to get updates)
    if (requestUrl.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request).then(response => {
                // Cache fresh HTML
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(() => {
                // Fallback to cache if offline
                return caches.match(event.request);
            })
        );
        return;
    }
    
    // Cache First for static assets (CSS, JS, images, fonts)
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                // Cache new assets
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return fetchResponse;
            });
        })
    );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});