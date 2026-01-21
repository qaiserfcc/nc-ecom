import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Claim a lead magnet
 * Generates discount codes or provides access to downloadable content
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadMagnetId, subscriberId, email } = body;

    if (!leadMagnetId || (!subscriberId && !email)) {
      return NextResponse.json(
        { error: 'Lead magnet ID and subscriber info are required' },
        { status: 400 }
      );
    }

    // Get lead magnet details
    const leadMagnetResult = await executeQuery(
      'SELECT * FROM lead_magnets WHERE id = $1 AND is_active = true',
      [leadMagnetId]
    );

    if (leadMagnetResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lead magnet not found or inactive' },
        { status: 404 }
      );
    }

    const leadMagnet = leadMagnetResult.rows[0];

    // If email provided, get or create subscriber
    let finalSubscriberId = subscriberId;
    if (email && !subscriberId) {
      const subscriberResult = await executeQuery(
        'SELECT id FROM email_subscribers WHERE email = $1',
        [email.toLowerCase()]
      );

      if (subscriberResult.rows.length > 0) {
        finalSubscriberId = subscriberResult.rows[0].id;
      } else {
        // Create subscriber
        const newSubscriberResult = await executeQuery(
          `INSERT INTO email_subscribers (email, source, lead_magnet_type)
           VALUES ($1, $2, $3) RETURNING id`,
          [email.toLowerCase(), 'lead_magnet', leadMagnet.type]
        );
        finalSubscriberId = newSubscriberResult.rows[0].id;
      }
    }

    // Check if already claimed
    const existingClaim = await executeQuery(
      'SELECT * FROM lead_magnet_claims WHERE lead_magnet_id = $1 AND subscriber_id = $2',
      [leadMagnetId, finalSubscriberId]
    );

    if (existingClaim.rows.length > 0) {
      const claim = existingClaim.rows[0];
      return NextResponse.json({
        success: true,
        message: 'Lead magnet already claimed',
        alreadyClaimed: true,
        discountCode: claim.discount_code,
        claim
      });
    }

    // Generate discount code if applicable
    let discountCode = null;
    let expiresAt = null;

    if (leadMagnet.type === 'discount_code' && leadMagnet.discount_value) {
      discountCode = `${leadMagnet.discount_type === 'percentage' ? 'PCT' : 'USD'}${leadMagnet.discount_value}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + leadMagnet.valid_days);
    }

    // Create claim record
    const claimResult = await executeQuery(
      `INSERT INTO lead_magnet_claims (
        lead_magnet_id,
        subscriber_id,
        discount_code,
        code_expires_at,
        source,
        referrer_url
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        leadMagnetId,
        finalSubscriberId,
        discountCode,
        expiresAt,
        req.headers.get('referer') ? 'website' : 'unknown',
        req.headers.get('referer') || null
      ]
    );

    // Update lead magnet claim count
    await executeQuery(
      'UPDATE lead_magnets SET total_claims = total_claims + 1 WHERE id = $1',
      [leadMagnetId]
    );

    // Track event
    await executeQuery(
      `INSERT INTO marketing_events (
        event_type,
        subscriber_id,
        event_data,
        source,
        ip_address
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        'lead_magnet_claim',
        finalSubscriberId,
        JSON.stringify({
          leadMagnetId,
          leadMagnetType: leadMagnet.type,
          discountCode
        }),
        'lead_magnet',
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      ]
    );

    return NextResponse.json({
      success: true,
      message: discountCode 
        ? `Your discount code: ${discountCode}` 
        : 'Lead magnet claimed successfully',
      discountCode,
      expiresAt,
      claim: claimResult.rows[0],
      leadMagnet: {
        title: leadMagnet.title,
        description: leadMagnet.description,
        fileUrl: leadMagnet.file_url,
        contentHtml: leadMagnet.content_html
      }
    });

  } catch (error) {
    console.error('Claim lead magnet error:', error);
    return NextResponse.json(
      { error: 'Failed to claim lead magnet' },
      { status: 500 }
    );
  }
}

/**
 * Get user's claimed lead magnets
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriberId = searchParams.get('subscriberId');
    const email = searchParams.get('email');

    if (!subscriberId && !email) {
      return NextResponse.json(
        { error: 'Subscriber ID or email is required' },
        { status: 400 }
      );
    }

    let query = `
      SELECT 
        lmc.*,
        lm.name,
        lm.title,
        lm.type,
        lm.discount_type,
        lm.discount_value
      FROM lead_magnet_claims lmc
      JOIN lead_magnets lm ON lmc.lead_magnet_id = lm.id
    `;

    const params: any[] = [];

    if (subscriberId) {
      query += ' WHERE lmc.subscriber_id = $1';
      params.push(subscriberId);
    } else if (email) {
      query += ` WHERE lmc.subscriber_id IN (
        SELECT id FROM email_subscribers WHERE email = $1
      )`;
      params.push(email.toLowerCase());
    }

    query += ' ORDER BY lmc.created_at DESC';

    const result = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      claims: result.rows
    });

  } catch (error) {
    console.error('Get lead magnet claims error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
