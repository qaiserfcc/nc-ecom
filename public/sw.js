// Service Worker for image caching and offline support
const CACHE_VERSION = 'v3'
const CACHE_NAMES = {
  IMAGES: `images-${CACHE_VERSION}`,
  API: `api-${CACHE_VERSION}`,
  PAGES: `pages-${CACHE_VERSION}`,
}

const IMAGE_CACHE_TIMEOUT = 5000 // 5 seconds timeout for images
const API_CACHE_TIMEOUT = 30000 // API requests can take longer (DB/network)

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fall back to cache
  networkFirst: async (request) => {
    try {
      const url = new URL(request.url)
      const timeoutMs = url.pathname.startsWith('/api/') ? API_CACHE_TIMEOUT : IMAGE_CACHE_TIMEOUT

      const response = await Promise.race([
        fetch(request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), timeoutMs)
        ),
      ])
      
      // Only cache successful responses, exclude 206 (partial content) which Cache API doesn't support
      if (response && response.ok && response.status !== 206) {
        const cache = await caches.open(CACHE_NAMES.API)
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      const cached = await caches.match(request)
      if (cached) {
        console.log('[SW] Using cached response for:', request.url)
        return cached
      }
      return new Response('Network request failed', { status: 503 })
    }
  },

  // Images: Stale while revalidate strategy (serve cached quickly, update in background)
  imageStaleWhileRevalidate: async (request) => {
    const cached = await caches.match(request)
    
    // Start background fetch
    const fetchPromise = fetch(request)
      .then((response) => {
        if (response && response.ok && response.status !== 206) {
          // Clone the response before using it
          const responseToCache = response.clone()
          const cache = caches.open(CACHE_NAMES.IMAGES)
          cache.then((c) => c.put(request, responseToCache))
        }
        return response
      })
      .catch((error) => {
        console.log('[SW] Fetch failed for:', request.url, error)
        return cached || new Response('Resource not available', { status: 503 })
      })

    // Return cached immediately if available
    if (cached) {
      return cached
    }

    // Otherwise wait for network
    return fetchPromise
  },

  // Cache first, fall back to network
  cacheFirst: async (request) => {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
      const response = await Promise.race([
        fetch(request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), IMAGE_CACHE_TIMEOUT)
        ),
      ])
      
      // Only cache successful responses, exclude 206 (partial content) which Cache API doesn't support
      if (response && response.ok && response.status !== 206) {
        const cache = await caches.open(CACHE_NAMES.IMAGES)
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      console.log('[SW] Cache first error:', error)
      return new Response('Resource not available offline', { status: 503 })
    }
  },

  // Stale while revalidate for pages
  staleWhileRevalidate: async (request) => {
    const cached = await caches.match(request)
    
    const fetchPromise = fetch(request)
      .then((response) => {
        if (response && response.ok) {
          // Clone the response before using it
          const responseToCache = response.clone()
          const cache = caches.open(
            request.url.includes('/api/') ? CACHE_NAMES.API : CACHE_NAMES.PAGES
          )
          cache.then((c) => c.put(request, responseToCache))
        }
        return response
      })
      .catch((error) => {
        console.log('[SW] SWR fetch failed for:', request.url, error)
        return cached || new Response('Resource not available', { status: 503 })
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

  // Images: only intercept product and upload images; let other static images go default
  if (
    url.pathname.includes('/api/products-lite/images') ||
    url.pathname.startsWith('/uploads/')
  ) {
    event.respondWith(CACHE_STRATEGIES.imageStaleWhileRevalidate(request))
    return
  }

  // API calls: Network first with timeout fallback
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
