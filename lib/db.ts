import { neon, Pool } from "@neondatabase/serverless"
import ws from "ws"
import { redisCache, cacheKeys } from "./redis-cache"

// Configure WebSocket for Node.js environment (required for @neondatabase/serverless)
if (typeof WebSocket === 'undefined') {
  (global as any).WebSocket = ws
}

// Connection pooling configuration
const POOL_CONFIG = {
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Create connection pool for better performance
let _pool: Pool | null = null
let _sql: any | null = null

function getPool(): Pool {
  if (_pool) return _pool

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Ensure .env.local contains DATABASE_URL and you start the server via `npm run dev` or `npm start` (which load env)."
    )
  }

  _pool = new Pool({
    connectionString,
    ...POOL_CONFIG,
  })

  // Handle pool events
  _pool.on('connect', (client) => {
    console.log('✅ Database client connected')
  })

  _pool.on('error', (err, client) => {
    console.error('❌ Database pool error:', err.message)
  })

  return _pool
}

function getSql() {
  if (_sql) return _sql
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Ensure .env.local contains DATABASE_URL and you start the server via `npm run dev` or `npm start` (which load env)."
    )
  }
  _sql = neon(connectionString)
  return _sql
}

// Enhanced query execution with caching
export async function executeQuery<T = any>(
  queryText: string,
  params: any[] = [],
  options: {
    cache?: boolean
    cacheKey?: string
    cacheTtl?: number
    usePool?: boolean
  } = {}
): Promise<T[]> {
  const { cache = false, cacheKey, cacheTtl, usePool = false } = options

  // Try cache first if enabled
  if (cache && cacheKey) {
    const cachedResult = await redisCache.get<T[]>(cacheKey)
    if (cachedResult) {
      console.log(`📋 Cache hit for key: ${cacheKey}`)
      return cachedResult
    }
  }

  try {
    let result: T[]

    if (usePool) {
      // Use connection pool for better performance
      const client = await getPool().connect()
      try {
        const queryResult = await client.query(queryText, params)
        result = queryResult.rows
      } finally {
        client.release()
      }
    } else {
      // Use serverless neon for simple queries
      const response = await fetch(`${process.env.DATABASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Neon-Connection-String": process.env.DATABASE_URL!,
        },
        body: JSON.stringify({
          query: queryText,
          params: params,
        }),
      })

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`)
      }

      const data = await response.json()
      result = data.rows || data
    }

    // Cache result if enabled
    if (cache && cacheKey && result) {
      await redisCache.set(cacheKey, result, cacheTtl)
      console.log(`💾 Cached result for key: ${cacheKey}`)
    }

    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Cached query helpers for common operations
export const cachedQueries = {
  // Product queries
  async getProduct(id: number): Promise<any> {
    return executeQuery(
      'SELECT * FROM products WHERE id = $1 AND is_active = true',
      [id],
      {
        cache: true,
        cacheKey: cacheKeys.product(id),
        cacheTtl: 5 * 60 * 1000, // 5 minutes
      }
    )
  },

  async getProducts(filters: any = {}): Promise<any[]> {
    const { category, brand, limit = 20, offset = 0, search } = filters
    let query = 'SELECT * FROM products WHERE is_active = true'
    const params: any[] = []
    let paramIndex = 1

    if (category) {
      query += ` AND category_id = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (brand) {
      query += ` AND brand_id = $${paramIndex}`
      params.push(brand)
      paramIndex++
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const cacheKey = cacheKeys.products(filters)

    return executeQuery(query, params, {
      cache: true,
      cacheKey,
      cacheTtl: 10 * 60 * 1000, // 10 minutes
    })
  },

  // Category queries
  async getCategories(): Promise<any[]> {
    return executeQuery(
      'SELECT * FROM categories WHERE is_active = true ORDER BY name',
      [],
      {
        cache: true,
        cacheKey: cacheKeys.categories(),
        cacheTtl: 30 * 60 * 1000, // 30 minutes
      }
    )
  },

  // User queries
  async getUser(id: string): Promise<any> {
    return executeQuery(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [id],
      {
        cache: true,
        cacheKey: cacheKeys.user(id),
        cacheTtl: 15 * 60 * 1000, // 15 minutes
      }
    )
  },

  // Get product by slug
  async getProductBySlug(slug: string): Promise<any> {
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary))
                FROM product_images pi WHERE pi.product_id = p.id), '[]'
             ) as images,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pv.id, 'variant_name', pv.variant_name, 'variant_value', pv.variant_value, 'sku', pv.sku, 'price_modifier', pv.price_modifier, 'stock_quantity', pv.stock_quantity))
                FROM product_variants pv WHERE pv.product_id = p.id), '[]'
             ) as variants
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN brand_partnerships b ON p.brand_id = b.id
      WHERE p.slug = $1 AND p.is_active = true
    `

    const result = await executeQuery(query, [slug], {
      cache: true,
      cacheKey: cacheKeys.product(slug),
      cacheTtl: 5 * 60 * 1000, // 5 minutes
    })

    return result[0] || null
  },

  // Get active discounts
  async getActiveDiscounts(): Promise<any[]> {
    const query = `
      SELECT * FROM discounts
      WHERE is_active = true
      AND start_date <= NOW()
      AND end_date >= NOW()
      ORDER BY created_at DESC
    `

    return executeQuery(query, [], {
      cache: true,
      cacheKey: 'active-discounts',
      cacheTtl: 10 * 60 * 1000, // 10 minutes
    })
  },
}

// Export a callable proxy so existing `sql\`...\`` usage keeps working.
const sql: any = new Proxy(
  () => {
    throw new Error('sql proxy should not be called directly')
  },
  {
    apply(_target, thisArg, argArray) {
      return getSql().apply(thisArg, argArray as any)
    },
    get(_target, prop) {
      return (getSql() as any)[prop]
    },
  }
)

// Export both the sql function and a db object for convenience
export { sql }
export const db = sql

// Legacy query function for backward compatibility
export async function query(text: string, params: any[] = []) {
  return executeQuery(text, params, { usePool: true })
}

// Database health check
export async function healthCheck(): Promise<{
  database: boolean
  redis: boolean
  pool?: { total: number; idle: number; waiting: number }
}> {
  const results = {
    database: false,
    redis: false,
    pool: undefined as any,
  }

  try {
    // Test database connection
    await executeQuery('SELECT 1', [])
    results.database = true
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  try {
    // Test Redis connection
    results.redis = await redisCache.ping()
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  // Get pool stats if available
  if (_pool) {
    results.pool = {
      total: _pool.totalCount,
      idle: _pool.idleCount,
      waiting: _pool.waitingCount,
    }
  }

  return results
}

// Graceful shutdown
export async function closeConnections(): Promise<void> {
  try {
    if (_pool) {
      await _pool.end()
      _pool = null
      console.log('✅ Database pool closed')
    }

    await redisCache.disconnect()
  } catch (error) {
    console.error('Error closing connections:', error)
  }
}

// Auto-cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeConnections)
  process.on('SIGTERM', closeConnections)
}
