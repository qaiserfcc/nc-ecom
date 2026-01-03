// Service Worker for image caching and offline support
const CACHE_VERSION = 'v1'
const CACHE_NAMES = {
  IMAGES: `images-${CACHE_VERSION}`,
  API: `api-${CACHE_VERSION}`,
  PAGES: `pages-${CACHE_VERSION}`,
}

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fall back to cache
  networkFirst: async (request) => {
    try {
      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(CACHE_NAMES.API)
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      const cached = await caches.match(request)
      return cached || new Response('Network request failed', { status: 503 })
    }
  },

  // Cache first, fall back to network
  cacheFirst: async (request) => {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(CACHE_NAMES.IMAGES)
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      return new Response('Resource not available offline', { status: 503 })
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cached = await caches.match(request)
    
    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        const cache = caches.open(
          request.url.includes('/api/') ? CACHE_NAMES.API : CACHE_NAMES.IMAGES
        )
        cache.then((c) => c.put(request, response.clone()))
      }
      return response
    })

    return cached || fetchPromise
  },
}

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAMES.PAGES).then((cache) => {
      return cache.addAll([
        '/',
        '/shop',
        '/favicon.ico',
      ]).catch((err) => {
        console.log('[SW] Cache addAll error:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return !Object.values(CACHE_NAMES).includes(name)
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Images: Network first with cache fallback (prevents caching failed requests)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico)$/i) ||
    url.pathname.includes('/api/products-lite/images')
  ) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request))
    return
  }

  // API calls: Network first strategy (prefer fresh data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request))
    return
  }

  // Pages: Stale while revalidate strategy
  if (url.pathname === '/' || url.pathname.startsWith('/shop') || url.pathname.startsWith('/product/')) {
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request))
    return
  }

  // Default: Network first
  event.respondWith(CACHE_STRATEGIES.networkFirst(request))
})

// Message handler for cache control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((name) => caches.delete(name))
      )
    })
  }
})
