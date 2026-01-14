/**
 * Comprehensive Caching Strategy Configuration
 *
 * This file outlines the multi-layer caching strategy implemented for optimal performance:
 * 1. Redis Cache Layer (Database queries, API responses, session data)
 * 2. ISR (Incremental Static Regeneration) for product pages
 * 3. Image optimization with CDN integration
 * 4. Browser caching with appropriate headers
 * 5. Service Worker caching for offline functionality
 */

export interface CacheConfig {
  // Redis cache settings
  redis: {
    ttl: {
      products: number
      categories: number
      user: number
      cart: number
      analytics: number
      images: number
    }
    keyPrefix: string
  }

  // ISR settings
  isr: {
    productPages: number
    categoryPages: number
    homepage: number
  }

  // Image optimization
  images: {
    formats: string[]
    breakpoints: number[]
    quality: {
      webp: number
      avif: number
      jpeg: number
    }
    cdnBaseUrl?: string
  }

  // HTTP caching headers
  headers: {
    staticAssets: string
    apiResponses: string
    images: string
  }
}

export const cacheConfig: CacheConfig = {
  // Redis cache TTL settings (in milliseconds)
  redis: {
    ttl: {
      products: 5 * 60 * 1000,      // 5 minutes
      categories: 30 * 60 * 1000,   // 30 minutes
      user: 15 * 60 * 1000,         // 15 minutes
      cart: 10 * 60 * 1000,         // 10 minutes
      analytics: 60 * 60 * 1000,    // 1 hour
      images: 24 * 60 * 60 * 1000,  // 24 hours
    },
    keyPrefix: 'ecommerce',
  },

  // ISR revalidation times (in seconds)
  isr: {
    productPages: 3600,    // 1 hour
    categoryPages: 1800,   // 30 minutes
    homepage: 900,         // 15 minutes
  },

  // Image optimization settings
  images: {
    formats: ['webp', 'avif', 'jpeg'],
    breakpoints: [320, 640, 768, 1024, 1280, 1536],
    quality: {
      webp: 80,
      avif: 70,
      jpeg: 85,
    },
    // cdnBaseUrl: process.env.CDN_BASE_URL, // Uncomment when CDN is configured
  },

  // HTTP cache headers
  headers: {
    staticAssets: 'public, max-age=31536000, immutable',
    apiResponses: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    images: 'public, max-age=31536000, immutable',
  },
}

/**
 * Cache key generators for consistent naming
 */
export const generateCacheKeys = {
  product: (id: number | string) => `product:${id}`,
  products: (filters: Record<string, any>) => {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key]
        return result
      }, {} as Record<string, any>)
    return `products:${JSON.stringify(sortedFilters)}`
  },
  category: (id: number | string) => `category:${id}`,
  categories: () => 'categories',
  brand: (id: number | string) => `brand:${id}`,
  brands: () => 'brands',
  user: (id: string) => `user:${id}`,
  cart: (userId: string) => `cart:${userId}`,
  wishlist: (userId: string) => `wishlist:${userId}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  search: (query: string, filters: Record<string, any>) => `search:${query}:${JSON.stringify(filters)}`,
  image: (url: string, options: Record<string, any>) => {
    const sortedOptions = Object.keys(options)
      .sort()
      .reduce((result, key) => {
        result[key] = options[key]
        return result
      }, {} as Record<string, any>)
    return `image:${url}:${JSON.stringify(sortedOptions)}`
  },
}

/**
 * Cache invalidation strategies
 */
export const cacheInvalidation = {
  // Invalidate product-related caches
  product: (productId: number | string) => [
    generateCacheKeys.product(productId),
    generateCacheKeys.products({}), // Invalidate general products list
  ],

  // Invalidate category-related caches
  category: (categoryId: number | string) => [
    generateCacheKeys.category(categoryId),
    generateCacheKeys.categories(),
  ],

  // Invalidate user-related caches
  user: (userId: string) => [
    generateCacheKeys.user(userId),
    generateCacheKeys.cart(userId),
    generateCacheKeys.wishlist(userId),
  ],

  // Invalidate all caches matching a pattern
  pattern: (pattern: string) => pattern,
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitoring = {
  // Track cache hit rates
  trackCacheHit: (key: string, hit: boolean) => {
    // Implementation would integrate with analytics service
    console.log(`Cache ${hit ? 'HIT' : 'MISS'}: ${key}`)
  },

  // Track response times
  trackResponseTime: (operation: string, startTime: number) => {
    const duration = Date.now() - startTime
    console.log(`${operation} took ${duration}ms`)
  },

  // Monitor cache memory usage
  getCacheStats: async () => {
    // Implementation would query Redis for stats
    return {
      hits: 0,
      misses: 0,
      memory: 0,
      keys: 0,
    }
  },
}

/**
 * CDN integration helpers
 */
export const cdnUtils = {
  // Generate CDN URLs for images
  getOptimizedImageUrl: (
    baseUrl: string,
    options: {
      width?: number
      height?: number
      format?: 'webp' | 'avif' | 'jpeg'
      quality?: number
      fit?: 'cover' | 'contain' | 'fill'
    } = {}
  ): string => {
    const cdnBase = cacheConfig.images.cdnBaseUrl
    const imageUrl = cdnBase ? `${cdnBase}${baseUrl}` : baseUrl

    const params = new URLSearchParams()
    params.set('url', imageUrl)

    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.format) params.set('f', options.format)
    if (options.quality) params.set('q', options.quality.toString())
    if (options.fit) params.set('fit', options.fit)

    return `/api/images/optimize?${params.toString()}`
  },

  // Preload critical images
  preloadCriticalImages: (imageUrls: string[]) => {
    if (typeof window === 'undefined') return

    imageUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  },
}

/**
 * Service Worker cache configuration for offline functionality
 */
export const serviceWorkerCache = {
  // Cache static assets
  staticAssets: [
    '/',
    '/shop',
    '/cart',
    '/wishlist',
    '/profile',
    '/manifest.json',
  ],

  // Cache API responses
  apiEndpoints: [
    '/api/categories',
    '/api/brands',
  ],

  // Runtime caching strategies
  runtimeCaching: [
    {
      urlPattern: /^\/api\/products\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'products-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
}