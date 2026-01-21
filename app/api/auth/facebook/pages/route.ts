import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * Get list of connected Facebook Pages
 * Used to display connected accounts in admin panel
 */
export async function GET(request: NextRequest) {
  try {
    const result = await executeQuery(
      `SELECT 
        id,
        platform,
        account_name,
        account_id,
        followers_count,
        is_active,
        created_at,
        updated_at
      FROM social_accounts 
      WHERE platform = 'facebook' 
      ORDER BY created_at DESC`,
      []
    );

    return NextResponse.json({
      success: true,
      pages: result.rows,
    });

  } catch (error: any) {
    console.error('Error fetching Facebook pages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

/**
 * Disconnect a Facebook Page
 */
export async function DELETE(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    await executeQuery(
      `UPDATE social_accounts 
       SET is_active = false, updated_at = NOW()
       WHERE account_id = $1 AND platform = 'facebook'`,
      [accountId]
    );

    return NextResponse.json({
      success: true,
      message: 'Facebook Page disconnected successfully',
    });

  } catch (error: any) {
    console.error('Error disconnecting Facebook page:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to disconnect page' },
      { status: 500 }
    );
  }
}
