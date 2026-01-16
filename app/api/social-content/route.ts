import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch social content with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = 'SELECT * FROM social_content WHERE 1=1';
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

    const data = await executeQuery(query, params);
    
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

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      data,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching social content:', error);
    return NextResponse.json({ error: 'Failed to fetch social content' }, { status: 500 });
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
