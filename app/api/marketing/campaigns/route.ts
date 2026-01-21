import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - List all campaigns with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT cr.id) as total_recipients,
        COUNT(DISTINCT CASE WHEN cr.delivered_at IS NOT NULL THEN cr.id END) as delivered_count,
        COUNT(DISTINCT CASE WHEN cr.opened_at IS NOT NULL THEN cr.id END) as opened_count,
        COUNT(DISTINCT CASE WHEN cr.clicked_at IS NOT NULL THEN cr.id END) as clicked_count,
        SUM(cr.conversion_value) as total_revenue
      FROM email_campaigns c
      LEFT JOIN email_campaign_recipients cr ON c.id = cr.campaign_id
    `;

    const params = [];
    if (status) {
      query += ` WHERE c.status = $1`;
      params.push(status);
    }

    query += `
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const campaigns = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      campaigns: Array.isArray(campaigns) ? campaigns : [],
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      subject,
      previewText,
      campaignType = 'promotional',
      htmlContent,
      textContent,
      targetSegment,
      targetInterests,
      excludeUnsubscribed = true,
      scheduledFor,
      fromName = 'NC Ecom',
      fromEmail,
      replyTo,
    } = body;

    // Validation
    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert campaign
    const query = `
      INSERT INTO email_campaigns (
        name, subject, preview_text, campaign_type,
        html_content, text_content,
        target_segment, target_interests, exclude_unsubscribed,
        scheduled_for, from_name, from_email, reply_to,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *
    `;

    const status = scheduledFor ? 'scheduled' : 'draft';

    const result = await executeQuery(query, [
      name,
      subject,
      previewText || null,
      campaignType,
      htmlContent,
      textContent || null,
      targetSegment || null,
      targetInterests ? JSON.stringify(targetInterests) : null,
      excludeUnsubscribed,
      scheduledFor || null,
      fromName,
      fromEmail || 'noreply@ncecom.com',
      replyTo || fromEmail || 'noreply@ncecom.com',
      status,
    ]);

    const campaign = result.rows[0];

    // If scheduled, we'd normally queue it for sending
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully',
      campaign,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

// PUT - Update campaign
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    const fieldMapping: Record<string, string> = {
      name: 'name',
      subject: 'subject',
      previewText: 'preview_text',
      campaignType: 'campaign_type',
      htmlContent: 'html_content',
      textContent: 'text_content',
      targetSegment: 'target_segment',
      targetInterests: 'target_interests',
      excludeUnsubscribed: 'exclude_unsubscribed',
      scheduledFor: 'scheduled_for',
      fromName: 'from_name',
      fromEmail: 'from_email',
      replyTo: 'reply_to',
      status: 'status',
    };

    for (const [key, dbColumn] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        updateFields.push(`${dbColumn} = $${paramIndex}`);
        params.push(
          key === 'targetInterests' 
            ? JSON.stringify(updates[key]) 
            : updates[key]
        );
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE email_campaigns
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await executeQuery(query, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign updated',
      campaign: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
