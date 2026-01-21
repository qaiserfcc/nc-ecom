import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Marketing Events Tracking API
 * Tracks all marketing-related events for analytics
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventType,
      userId,
      subscriberId,
      campaignId,
      campaignType,
      eventData = {},
      source,
      medium,
      campaign
    } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: 'eventType is required' },
        { status: 400 }
      );
    }

    // Get technical details
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const referrer = req.headers.get('referer') || null;

    // Generate session ID from IP + User Agent (simplified)
    const sessionId = Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 50);

    // Insert event
    await executeQuery(
      `INSERT INTO marketing_events (
        event_type,
        user_id,
        subscriber_id,
        session_id,
        campaign_id,
        campaign_type,
        event_data,
        source,
        medium,
        campaign,
        user_agent,
        ip_address,
        referrer_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        eventType,
        userId || null,
        subscriberId || null,
        sessionId,
        campaignId || null,
        campaignType || null,
        JSON.stringify(eventData),
        source || 'unknown',
        medium || 'unknown',
        campaign || null,
        userAgent,
        ip,
        referrer
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Marketing event tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

/**
 * Get marketing events analytics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = 'SELECT * FROM marketing_events WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (eventType) {
      query += ` AND event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND event_timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND event_timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY event_timestamp DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await executeQuery(query, params);

    // Parse JSON fields
    const events = result.rows.map(event => ({
      ...event,
      event_data: JSON.parse(event.event_data || '{}')
    }));

    return NextResponse.json({
      success: true,
      events,
      total: events.length
    });

  } catch (error) {
    console.error('Get marketing events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
