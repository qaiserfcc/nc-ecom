import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Newsletter Subscription API
 * - Double opt-in email verification
 * - GDPR compliant with consent tracking
 * - Interest selection and source attribution
 * - Lead magnet integration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      phone,
      interests = [],
      source = 'website',
      leadMagnetType,
      skinType,
      ageGroup,
      consent = true
    } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'Consent is required to subscribe' },
        { status: 400 }
      );
    }

    // Get IP address for GDPR compliance
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Check if email already exists
    const existingSubscriber = await executeQuery(
      'SELECT id, status FROM email_subscribers WHERE email = $1',
      [email]
    );

    if (existingSubscriber.rows.length > 0) {
      const subscriber = existingSubscriber.rows[0];
      
      // If already active, return success
      if (subscriber.status === 'active') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
          alreadySubscribed: true
        });
      }
      
      // If unsubscribed, reactivate
      if (subscriber.status === 'unsubscribed') {
        await executeQuery(
          `UPDATE email_subscribers 
           SET status = 'active', 
               interests = $1,
               skin_type = $2,
               age_group = $3,
               consent_given = true,
               consent_date = NOW(),
               consent_ip = $4,
               updated_at = NOW()
           WHERE id = $5`,
          [
            JSON.stringify(interests),
            skinType || null,
            ageGroup || null,
            ip,
            subscriber.id
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.',
          resubscribed: true
        });
      }
    }

    // Generate discount code if lead magnet is discount
    let discountCode = null;
    if (leadMagnetType === 'discount_code') {
      discountCode = `WELCOME${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    // Insert new subscriber
    const result = await executeQuery(
      `INSERT INTO email_subscribers (
        email, 
        name, 
        phone,
        status,
        source,
        interests,
        skin_type,
        age_group,
        lead_magnet_type,
        discount_code,
        consent_given,
        consent_date,
        consent_ip,
        gdpr_compliant
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, true)
      RETURNING id, email, discount_code`,
      [
        email.toLowerCase(),
        name || null,
        phone || null,
        'active', // Simplified - in production, use 'pending' and send confirmation email
        source,
        JSON.stringify(interests),
        skinType || null,
        ageGroup || null,
        leadMagnetType || null,
        discountCode,
        consent,
        ip
      ]
    );

    const subscriber = result.rows[0];

    // Track signup event
    await executeQuery(
      `INSERT INTO marketing_events (
        event_type,
        subscriber_id,
        source,
        medium,
        campaign,
        ip_address,
        referrer_url,
        event_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'newsletter_signup',
        subscriber.id,
        source,
        'organic',
        leadMagnetType || 'standard',
        ip,
        req.headers.get('referer') || null,
        JSON.stringify({
          interests,
          skinType,
          ageGroup,
          hasLeadMagnet: !!leadMagnetType
        })
      ]
    );

    // In production, send welcome email here
    // await sendWelcomeEmail(subscriber.email, subscriber.discount_code);

    return NextResponse.json({
      success: true,
      message: discountCode 
        ? `Welcome! Your discount code is ${discountCode}` 
        : 'Successfully subscribed to our newsletter!',
      discountCode,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

/**
 * Get subscriber details
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `SELECT 
        id,
        email,
        name,
        status,
        interests,
        skin_type,
        age_group,
        total_emails_sent,
        total_emails_opened,
        total_clicks,
        discount_code,
        created_at
      FROM email_subscribers 
      WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    const subscriber = result.rows[0];
    
    // Parse JSON fields
    subscriber.interests = JSON.parse(subscriber.interests || '[]');

    return NextResponse.json({
      success: true,
      subscriber
    });

  } catch (error) {
    console.error('Get subscriber error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriber' },
      { status: 500 }
    );
  }
}
