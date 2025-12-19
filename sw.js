/**
 * Service Worker for Audiotour PWA
 * Handles caching of static assets and audio files for offline use
 */

const CACHE_NAME = 'audiotour-v1';
const AUDIO_CACHE_NAME = 'audiotour-audio-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
    './',
    './index.html',
    './tour.html',
    './css/style.css',
    './js/app.js',
    './js/player.js',
    './js/qr.js',
    './manifest.json'
];

// Audio files to cache (add your actual audio files here)
const AUDIO_ASSETS = [
    './assets/audio/tourA/track01.mp3',
    './assets/audio/tourA/track02.mp3',
    './assets/audio/tourA/track03.mp3',
    './assets/audio/tourA/track04.mp3',
    './assets/audio/tourA/track05.mp3',
    './assets/audio/tourA/track06.mp3',
    './assets/audio/tourB/track01.mp3',
    './assets/audio/tourB/track02.mp3',
    './assets/audio/tourB/track03.mp3',
    './assets/audio/tourB/track04.mp3',
    './assets/audio/tourB/track05.mp3',
    './assets/audio/tourB/track06.mp3',
    './assets/audio/tourB/track07.mp3',
    './assets/audio/tourB/track08.mp3'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_NAME).then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache audio files (may take longer)
            caches.open(AUDIO_CACHE_NAME).then((cache) => {
                console.log('[SW] Caching audio files');
                return cache.addAll(AUDIO_ASSETS).catch((err) => {
                    console.warn('[SW] Some audio files not cached:', err);
                    // Don't fail if some audio files don't exist yet
                });
            })
        ]).then(() => {
            console.log('[SW] Installation complete');
            self.skipWaiting(); // Activate immediately
        })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name.startsWith('audiotour-') && 
                               name !== CACHE_NAME && 
                               name !== AUDIO_CACHE_NAME;
                    })
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('[SW] Activation complete');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip external requests (like the html5-qrcode library from CDN)
    if (!url.origin.includes(self.location.origin)) {
        return;
    }
    
    // Handle audio files with cache-first strategy
    if (url.pathname.includes('/assets/audio/')) {
        event.respondWith(
            caches.open(AUDIO_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[SW] Audio from cache:', url.pathname);
                        return cachedResponse;
                    }
                    
                    // Not in cache - fetch and cache
                    return fetch(event.request).then((response) => {
                        if (response.ok) {
                            cache.put(event.request, response.clone());
                            console.log('[SW] Audio cached:', url.pathname);
                        }
                        return response;
                    });
                });
            })
        );
        return;
    }
    
    // Handle static assets with stale-while-revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Update cache with fresh response
                if (networkResponse.ok) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Network failed, return cached if available
                return cachedResponse;
            });
            
            // Return cached version immediately if available
            return cachedResponse || fetchPromise;
        })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Pre-cache specific audio files on demand
    if (event.data.type === 'CACHE_AUDIO') {
        const audioUrls = event.data.urls;
        caches.open(AUDIO_CACHE_NAME).then((cache) => {
            audioUrls.forEach((url) => {
                cache.add(url).catch((err) => {
                    console.warn('[SW] Failed to cache:', url, err);
                });
            });
        });
    }
});
