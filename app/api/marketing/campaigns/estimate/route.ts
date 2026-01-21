import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment') || 'all';
    const interests = searchParams.get('interests')?.split(',').filter(Boolean) || [];

    let query = `
      SELECT COUNT(*) as count
      FROM email_subscribers
      WHERE status = 'active'
    `;

    const params: any[] = [];

    // Add segment filter
    if (segment === 'active') {
      query += ` AND last_email_opened_at > NOW() - INTERVAL '30 days'`;
    } else if (segment === 'inactive') {
      query += ` AND (last_email_opened_at < NOW() - INTERVAL '30 days' OR last_email_opened_at IS NULL)`;
    }

    // Add interests filter
    if (interests.length > 0) {
      query += ` AND interests ?| $${params.length + 1}`;
      params.push(interests);
    }

    const result = await executeQuery(query, params);
    const count = parseInt(Array.isArray(result) && result[0]?.count ? String(result[0].count) : '0');

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to estimate recipients:', error);
    return NextResponse.json(
      { error: 'Failed to estimate recipients' },
      { status: 500 }
    );
  }
}
