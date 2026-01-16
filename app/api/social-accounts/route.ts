import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch connected social accounts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('active');

    let query = 'SELECT id, platform, account_name, account_id, followers_count, is_active, connected_at FROM social_accounts WHERE 1=1';
    const params: any[] = [];

    if (platform) {
      query += ' AND platform = $' + (params.length + 1);
      params.push(platform);
    }

    if (isActive !== null) {
      query += ' AND is_active = $' + (params.length + 1);
      params.push(isActive === 'true');
    }

    query += ' ORDER BY connected_at DESC';

    const data = await executeQuery(query, params);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch social accounts' }, { status: 500 });
  }
}

// POST - Add new social account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, accountName, accountId, accessToken, refreshToken, tokenExpiresAt, userId } = body;

    if (!platform || !accountName || !accountId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO social_accounts 
      (platform, account_name, account_id, access_token, refresh_token, token_expires_at, connected_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (platform, account_id) DO UPDATE SET
      access_token = $4,
      refresh_token = $5,
      token_expires_at = $6,
      updated_at = NOW()
      RETURNING *`,
      [platform, accountName, accountId, accessToken, refreshToken, tokenExpiresAt, userId]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error adding social account:', error);
    return NextResponse.json({ error: 'Failed to add social account' }, { status: 500 });
  }
}

// PUT - Update social account
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, followersCount } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (followersCount !== undefined) {
      updates.push(`followers_count = $${paramIndex}`);
      values.push(followersCount);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    values.push(id);

    const result = await executeQuery(
      `UPDATE social_accounts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating social account:', error);
    return NextResponse.json({ error: 'Failed to update social account' }, { status: 500 });
  }
}

// DELETE - Remove social account
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM social_accounts WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social account:', error);
    return NextResponse.json({ error: 'Failed to delete social account' }, { status: 500 });
  }
}
