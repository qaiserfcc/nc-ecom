'use client'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes default

  /**
   * Get item from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set item in cache with optional TTL - only if data is valid
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Don't cache null, undefined, or empty objects
    if (!data) return
    
    // If it's an array, ensure it's not empty
    if (Array.isArray(data) && data.length === 0) return
    
    // If it's an object, ensure it has content
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) return
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        ttl: value.ttl,
        expired: Date.now() - value.timestamp > value.ttl,
      })),
    }
  }

  /**
   * Generate cache key from params
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&')
    return `${prefix}:${sortedParams}`
  }
}

// Export singleton instance
export const cacheService = new CacheService()
