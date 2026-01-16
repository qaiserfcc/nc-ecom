import { neon } from "@neondatabase/serverless"
import ws from "ws"
import { redisCache, cacheKeys } from "./redis-cache"

// Configure WebSocket for Node.js environment (required for @neondatabase/serverless)
if (typeof WebSocket === 'undefined') {
  (global as any).WebSocket = ws
}

// Create serverless SQL function for Neon
let _sql: any | null = null

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

// Helper to safely construct SQL queries from text and params
// Neon's sql function expects template literals, so we use dynamic query building
async function querySql<T = any>(queryText: string, params: any[]): Promise<T[]> {
  const sql = getSql()
  
  // For Neon serverless with parameters, we need to manually replace placeholders
  // Convert PostgreSQL $1, $2 style to actual values in the template
  let processedQuery = queryText
  
  // Replace placeholders in reverse order to avoid issues with overlapping replacements
  for (let i = params.length; i >= 1; i--) {
    const placeholder = `$${i}`
    const param = params[i - 1]
    
    // Escape and quote string values, keep numbers as-is
    let escapedValue: string
    if (param === null || param === undefined) {
      escapedValue = 'NULL'
    } else if (typeof param === 'string') {
      escapedValue = `'${param.replace(/'/g, "''")}'`
    } else if (typeof param === 'boolean') {
      escapedValue = param ? 'true' : 'false'
    } else if (typeof param === 'object') {
      // For arrays and objects, convert to JSON string
      escapedValue = `'${JSON.stringify(param).replace(/'/g, "''")}'`
    } else {
      escapedValue = String(param)
    }
    
    // Replace all occurrences of this placeholder
    processedQuery = processedQuery.replaceAll(placeholder, escapedValue)
  }
  
  // Now execute with the processed query using sql tagged template
  const result = await sql`${sql.unsafe(processedQuery)}`
  return result
}

// Enhanced query execution with caching
export async function executeQuery<T = any>(
  queryText: string,
  params: any[] = [],
  options: {
    cache?: boolean
    cacheKey?: string
    cacheTtl?: number
  } = {}
): Promise<T[]> {
  const { cache = false, cacheKey, cacheTtl } = options

  // Try cache first if enabled
  if (cache && cacheKey) {
    const cachedResult = await redisCache.get<T[]>(cacheKey)
    if (cachedResult) {
      console.log(`📋 Cache hit for key: ${cacheKey}`)
      return cachedResult
    }
  }

  try {
    console.log(`[executeQuery] Running query with ${params.length} params`)
    
    // Use Neon serverless query function
    const result = await querySql<T>(queryText, params)
    console.log(`[executeQuery] Query returned ${result?.length || 0} rows`)

    // Cache result if enabled
    if (cache && cacheKey && result) {
      await redisCache.set(cacheKey, result, cacheTtl)
      console.log(`💾 Cached result for key: ${cacheKey}`)
    }

    return result
  } catch (error) {
    console.error('❌ Database query error:', error)
    throw error
  }
}

// Cached query helpers for common operations
export const cachedQueries = {
  // Product queries
  async getProduct(id: number): Promise<any> {
    try {
      const result = await executeQuery(
        'SELECT * FROM products WHERE id = $1',
        [id],
        {
          cache: true,
          cacheKey: cacheKeys.product(id),
          cacheTtl: 5 * 60 * 1000, // 5 minutes
        }
      )
      return result?.[0] || null
    } catch (error) {
      console.error('Error in getProduct:', error)
      return null
    }
  },

  async getProducts(filters: any = {}): Promise<any[]> {
    const { category, brand, limit = 20, offset = 0, search } = filters
    let query = 'SELECT * FROM products WHERE 1=1'
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

    try {
      const result = await executeQuery(query, params, {
        cache: true,
        cacheKey,
        cacheTtl: 10 * 60 * 1000, // 10 minutes
      })
      return result || []
    } catch (error) {
      console.error('Error in getProducts:', error)
      return []
    }
  },

  // Category queries
  async getCategories(): Promise<any[]> {
    try {
      const result = await executeQuery(
        'SELECT * FROM categories ORDER BY name',
        [],
        {
          cache: true,
          cacheKey: cacheKeys.categories(),
          cacheTtl: 30 * 60 * 1000, // 30 minutes
        }
      )
      return result || []
    } catch (error) {
      console.error('Error in getCategories:', error)
      return []
    }
  },

  // User queries
  async getUser(id: string): Promise<any> {
    try {
      const result = await executeQuery(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [id],
        {
          cache: true,
          cacheKey: cacheKeys.user(id),
          cacheTtl: 15 * 60 * 1000, // 15 minutes
        }
      )
      return result?.[0] || null
    } catch (error) {
      console.error('Error in getUser:', error)
      return null
    }
  },

  // Get product by slug
  async getProductById(id: number): Promise<any> {
    // First, try simple query without complex subqueries
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brand_partnerships b ON p.brand_id = b.id
      WHERE p.id = $1
    `

    try {
      console.log(`[getProductById] Fetching product ID: ${id}`)
      const result = await executeQuery(query, [id], {
        cache: true,
        cacheKey: cacheKeys.product(id),
        cacheTtl: 5 * 60 * 1000, // 5 minutes
      })

      console.log(`[getProductById] Query result for ID ${id}:`, result)
      return result?.[0] || null
    } catch (error) {
      console.error(`[getProductById] Error fetching product ${id}:`, error)
      return null
    }
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

    try {
      const result = await executeQuery(query, [], {
        cache: true,
        cacheKey: 'active-discounts',
        cacheTtl: 10 * 60 * 1000, // 10 minutes
      })
      return result || []
    } catch (error) {
      console.error('Error in getActiveDiscounts:', error)
      return []
    }
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
    // Neon serverless doesn't maintain persistent connections, so no pool to close
    // Just disconnect Redis if needed
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
