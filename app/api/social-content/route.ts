import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Cache for social content
const contentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function getCacheKey(platform?: string, status?: string, limit?: number, offset?: number): string {
  return `social:${platform || 'all'}:${status || 'all'}:${limit}:${offset}`;
}

// GET - Fetch social content with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check cache
    const cacheKey = getCacheKey(platform || undefined, status || undefined, limit, offset);
    const cached = contentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📺 Cache hit for social content`);
      return NextResponse.json(cached.data);
    }

    let query = 'SELECT id, product_id, platform, title, content, hashtags, status, media_url, media_type, created_at, scheduled_at FROM social_content WHERE 1=1';
    const params: any[] = [];

    if (platform) {
      query += ' AND platform = $' + (params.length + 1);
      params.push(platform);
    }

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const data = await Promise.race([
      executeQuery(query, params),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 8000))
    ]).catch(err => {
      console.error('Query error:', err);
      return [];
    });
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM social_content WHERE 1=1';
    const countParams: any[] = [];
    
    if (platform) {
      countQuery += ' AND platform = $' + (countParams.length + 1);
      countParams.push(platform);
    }
    
    if (status) {
      countQuery += ' AND status = $' + (countParams.length + 1);
      countParams.push(status);
    }

    const countResult = await Promise.race([
      executeQuery(countQuery, countParams),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 8000))
    ]).catch(err => {
      console.error('Count query error:', err);
      return [{ count: 0 }];
    });
    const total = (countResult as any[])[0]?.count || 0;

    const result = {
      data,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };

    // Cache the result
    contentCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching social content:', error);
    return NextResponse.json({ data: [], total: 0, error: 'Service temporarily unavailable' }, { status: 200 });
  }
}

// POST - Not used (generation moved to /api/social-content/generate)
// This endpoint is kept for backward compatibility but should use /generate instead
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use POST /api/social-content/generate for content generation' },
    { status: 400 }
  );
}

// PUT - Update social content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      updates.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    values.push(id);

    const result = await executeQuery(
      `UPDATE social_content SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating social content:', error);
    return NextResponse.json({ error: 'Failed to update social content' }, { status: 500 });
  }
}

// DELETE - Delete social content
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM social_content WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social content:', error);
    return NextResponse.json({ error: 'Failed to delete social content' }, { status: 500 });
  }
}
