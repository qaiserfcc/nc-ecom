import Redis from 'ioredis'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl?: number
}

class RedisCacheService {
  private redis: Redis
  private isConnected: boolean = false

  constructor() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URL_LOCAL || 'redis://localhost:6379'

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      reconnectOnError: (err) => {
        console.warn('Redis reconnect on error:', err.message)
        return err.message.includes('READONLY')
      },
    })

    this.redis.on('connect', () => {
      console.log('✅ Redis connected')
      this.isConnected = true
    })

    this.redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message)
      this.isConnected = false
    })

    this.redis.on('ready', () => {
      console.log('✅ Redis ready')
      this.isConnected = true
    })
  }

  /**
   * Get item from Redis cache if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        console.warn('Redis not connected, skipping cache get')
        return null
      }

      const cached = await this.redis.get(key)
      if (!cached) return null

      const entry: CacheEntry<T> = JSON.parse(cached)

      // Check if entry has expired
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key) // Clean up expired entry
        return null
      }

      return entry.data
    } catch (error) {
      console.error('Redis cache get error:', error)
      return null
    }
  }

  /**
   * Set item in Redis cache with optional TTL
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      if (!this.isConnected) {
        console.warn('Redis not connected, skipping cache set')
        return
      }

      // Don't cache null, undefined, or empty objects
      if (data == null || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }

      const serialized = JSON.stringify(entry)

      if (ttl) {
        await this.redis.setex(key, Math.floor(ttl / 1000), serialized)
      } else {
        await this.redis.set(key, serialized)
      }
    } catch (error) {
      console.error('Redis cache set error:', error)
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false
      const result = await this.redis.del(key)
      return result > 0
    } catch (error) {
      console.error('Redis cache delete error:', error)
      return false
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      if (!this.isConnected) return
      await this.redis.flushall()
    } catch (error) {
      console.error('Redis cache clear error:', error)
    }
  }

  /**
   * Clear cache entries matching a pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      if (!this.isConnected) return

      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis cache clear pattern error:', error)
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean
    info?: any
    memory?: any
  }> {
    try {
      const connected = this.isConnected
      if (!connected) {
        return { connected: false }
      }

      const info = await this.redis.info()
      const memory = await this.redis.memory('STATS')

      return {
        connected: true,
        info: this.parseRedisInfo(info),
        memory,
      }
    } catch (error) {
      console.error('Redis stats error:', error)
      return { connected: false }
    }
  }

  private parseRedisInfo(info: string): Record<string, any> {
    const lines = info.split('\n')
    const result: Record<string, any> = {}

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        result[key] = value
      }
    }

    return result
  }

  /**
   * Gracefully close Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      this.isConnected = false
      console.log('✅ Redis disconnected')
    } catch (error) {
      console.error('Redis disconnect error:', error)
    }
  }

  /**
   * Health check for Redis connection
   */
  async ping(): Promise<boolean> {
    try {
      if (!this.isConnected) return false
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCacheService()

// Export class for testing or multiple instances
export { RedisCacheService }

// Cache key generators for common patterns
export const cacheKeys = {
  product: (id: number | string) => `product:${id}`,
  products: (filters: Record<string, any>) => `products:${JSON.stringify(filters)}`,
  category: (id: number) => `category:${id}`,
  categories: () => 'categories',
  brand: (id: number) => `brand:${id}`,
  brands: () => 'brands',
  user: (id: string) => `user:${id}`,
  cart: (userId: string) => `cart:${userId}`,
  wishlist: (userId: string) => `wishlist:${userId}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  search: (query: string, filters: Record<string, any>) => `search:${query}:${JSON.stringify(filters)}`,
}