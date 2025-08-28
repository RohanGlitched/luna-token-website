// Service Worker for Luna Token - Aggressive Caching
const CACHE_NAME = 'luna-token-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/create-token/index.html',
    '/my-portfolio/index.html',
    '/assets/Satoshi-Variable-ChAXbpFa.ttf',
    '/assets/material-symbols-rounded.woff2',
    '/assets/bg1-DWJ0RCfe.png',
    '/assets/logo-full.svg',
    '/assets/index-DXrY5z_5.css',
    '/assets/styles-DQqVfxH3.css',
    '/assets/Nav-BSSNAbSG.css',
    '/assets/Footer-BFSbDbyr.css',
    '/assets/Landing-BPBDyXu0.css',
    '/assets/css2.css'
];

// Install SW and cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Fetch - Cache First Strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
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