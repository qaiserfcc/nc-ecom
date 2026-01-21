import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(search: string, offset: number, limit: number): string {
  return `products:${search}:${offset}:${limit}`;
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 Cache hit for: ${key}`);
    return cached.data;
  }
  if (cached) cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * GET /api/products/minimal
 * Fetch minimal product data (id, name, thumbnail) with caching
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';

    const cacheKey = getCacheKey(search, offset, limit);
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    let query = `SELECT id, name, image_url as thumbnail FROM products`;
    const params: any[] = [];

    // Add search filter if provided
    if (search.trim()) {
      query += ` WHERE name ILIKE $1 OR id::text LIKE $1`;
      params.push(`%${search}%`);
    }

    // Get total count for pagination
    const countQuery = search.trim()
      ? `SELECT COUNT(*) as count FROM products WHERE name ILIKE $1 OR id::text LIKE $1`
      : `SELECT COUNT(*) as count FROM products`;

    try {
      const countResult = await Promise.race([
        executeQuery(countQuery, params.length > 0 ? [params[0]] : []),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
      ]);
      
      const total = (countResult as any[])[0]?.count || 0;

      // Add pagination
      const paramIndex = params.length + 1;
      query += ` ORDER BY id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      // Fetch products with timeout
      const products = await Promise.race([
        executeQuery(query, params),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
      ]);

      const result = {
        products,
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      };

      // Cache the result
      setCachedData(cacheKey, result);

      return NextResponse.json(result);
    } catch (queryError) {
      console.error('Query error, returning cached or empty result:', queryError);
      // If query times out, return empty but don't error out
      return NextResponse.json({
        products: [],
        total: 0,
        limit,
        offset,
        pages: 0,
      });
    }
  } catch (error) {
    console.error('Error fetching minimal product data:', error);
    return NextResponse.json(
      { products: [], total: 0, error: 'Service temporarily unavailable' },
      { status: 200 }
    );
  }
}
