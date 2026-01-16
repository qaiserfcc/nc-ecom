import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * GET /api/products/minimal
 * Fetch minimal product data (id, name, thumbnail) for displaying all products
 * This is a lightweight endpoint optimized for loading large product lists
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';

    // Validate limits (allow up to 10000 for bulk operations)
    if (limit > 10000) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 10000' },
        { status: 400 }
      );
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

    const countResult = await executeQuery(countQuery, params.length > 0 ? [params[0]] : []);
    const total = countResult[0]?.count || 0;

    // Add pagination
    const paramIndex = params.length + 1;
    query += ` ORDER BY id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Fetch products
    const products = await executeQuery(query, params);

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching minimal product data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
