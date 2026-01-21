import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Newsletter Unsubscribe API
 * - GDPR compliant one-click unsubscribe
 * - Tracks unsubscribe reason for analytics
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, reason } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const existingSubscriber = await executeQuery(
      'SELECT id, status FROM email_subscribers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingSubscriber.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email not found in our subscription list' },
        { status: 404 }
      );
    }

    const subscriber = existingSubscriber.rows[0];

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        success: true,
        message: 'You are already unsubscribed',
        alreadyUnsubscribed: true
      });
    }

    // Update subscriber status
    await executeQuery(
      `UPDATE email_subscribers 
       SET status = 'unsubscribed',
           unsubscribed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [subscriber.id]
    );

    // Track unsubscribe event
    await executeQuery(
      `INSERT INTO marketing_events (
        event_type,
        subscriber_id,
        source,
        event_data,
        ip_address
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        'newsletter_unsubscribe',
        subscriber.id,
        'email',
        JSON.stringify({ reason: reason || 'no_reason_given' }),
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}
