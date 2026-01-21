import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { sendCampaignEmail } from '@/lib/email';

// Helper to generate a random discount code
function generateDiscountCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper to personalize campaign content
function personalizeContent(
  template: string,
  subscriber: any,
  discountCode?: string
): string {
  let content = template;
  content = content.replace(/\{\{name\}\}/g, subscriber.name || 'there');
  content = content.replace(/\{\{email\}\}/g, subscriber.email);
  if (discountCode) {
    content = content.replace(/\{\{discount_code\}\}/g, discountCode);
  }
  return content;
}

// POST - Send campaign to recipients with real Resend integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured. Set RESEND_API_KEY in environment.',
        },
        { status: 500 }
      );
    }

    // Get campaign details
    const campaignResult = await executeQuery(
      'SELECT * FROM email_campaigns WHERE id = $1',
      [campaignId]
    );

    if (campaignResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaignResult.rows[0];

    // Check if campaign can be sent
    if (campaign.status === 'sent') {
      return NextResponse.json(
        { success: false, error: 'Campaign already sent' },
        { status: 400 }
      );
    }

    // Get target recipients based on campaign criteria
    let recipientQuery = `
      SELECT DISTINCT s.id, s.email, s.name, s.interests, s.skin_type
      FROM email_subscribers s
      WHERE s.status = 'active'
    `;

    const params = [];
    let paramIndex = 1;

    if (campaign.exclude_unsubscribed) {
      recipientQuery += ` AND s.status != 'unsubscribed'`;
    }

    if (campaign.target_interests) {
      const interests = JSON.parse(campaign.target_interests);
      if (interests.length > 0) {
        recipientQuery += ` AND s.interests ?| $${paramIndex}`;
        params.push(interests);
        paramIndex++;
      }
    }

    if (campaign.target_segment) {
      if (campaign.target_segment === 'engaged') {
        recipientQuery += ` AND s.total_emails_opened > 5`;
      } else if (campaign.target_segment === 'new') {
        recipientQuery += ` AND s.created_at > NOW() - INTERVAL '30 days'`;
      } else if (campaign.target_segment === 'inactive') {
        recipientQuery += ` AND (s.last_clicked_at IS NULL OR s.last_clicked_at < NOW() - INTERVAL '60 days')`;
      }
    }

    const recipientsResult = await executeQuery(recipientQuery, params);
    const recipients = recipientsResult.rows;

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients match campaign criteria' },
        { status: 400 }
      );
    }

    // Update campaign status to sending
    await executeQuery(
      `
      UPDATE email_campaigns
      SET status = 'sending', sent_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [campaignId]
    );

    // Send emails in batches to respect rate limits
    const BATCH_SIZE = 50; // Resend can handle ~50 concurrent requests
    let sentCount = 0;
    let failedCount = 0;
    const failedRecipients = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map(async (subscriber) => {
          try {
            // Generate discount code if campaign uses one
            const discountCode =
              campaign.campaign_type === 'discount'
                ? generateDiscountCode()
                : undefined;

            // Personalize the HTML content
            const personalizedHtml = personalizeContent(
              campaign.html_content,
              subscriber,
              discountCode
            );

            // Send via Resend
            const result = await sendCampaignEmail(
              subscriber.email,
              campaign.subject,
              personalizedHtml,
              campaignId
            );

            if (result.success) {
              sentCount++;
              // Insert recipient record with sent status
              await executeQuery(
                `
                INSERT INTO email_campaign_recipients (
                  campaign_id, subscriber_id, email, status, delivered_at, created_at
                ) VALUES ($1, $2, $3, 'sent', NOW(), NOW())
                ON CONFLICT (campaign_id, subscriber_id) DO UPDATE
                SET status = 'sent', delivered_at = NOW()
                `,
                [campaignId, subscriber.id, subscriber.email]
              );
            } else {
              failedCount++;
              failedRecipients.push({
                email: subscriber.email,
                error: result.error,
              });
              // Insert recipient record with failed status
              await executeQuery(
                `
                INSERT INTO email_campaign_recipients (
                  campaign_id, subscriber_id, email, status, created_at
                ) VALUES ($1, $2, $3, 'failed', NOW())
                ON CONFLICT (campaign_id, subscriber_id) DO UPDATE
                SET status = 'failed'
                `,
                [campaignId, subscriber.id, subscriber.email]
              );
            }
          } catch (error) {
            failedCount++;
            failedRecipients.push({
              email: subscriber.email,
              error: String(error),
            });
            await executeQuery(
              `
              INSERT INTO email_campaign_recipients (
                campaign_id, subscriber_id, email, status, created_at
              ) VALUES ($1, $2, $3, 'failed', NOW())
              ON CONFLICT (campaign_id, subscriber_id) DO UPDATE
              SET status = 'failed'
              `,
              [campaignId, subscriber.id, subscriber.email]
            );
          }
        })
      );

      // Add delay between batches to respect rate limits
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Update campaign status to sent
    await executeQuery(
      `
      UPDATE email_campaigns
      SET status = 'sent', updated_at = NOW()
      WHERE id = $1
      `,
      [campaignId]
    );

    // Track campaign send event
    await executeQuery(
      `
      INSERT INTO marketing_events (
        event_type, campaign_id, event_data, created_at
      ) VALUES ($1, $2, $3, NOW())
      `,
      [
        'campaign_sent',
        campaignId,
        JSON.stringify({
          recipientCount: recipients.length,
          sentCount,
          failedCount,
          campaignName: campaign.name,
        }),
      ]
    );

    // Log detailed results
    console.log(
      `Campaign ${campaignId} sent: ${sentCount} succeeded, ${failedCount} failed`
    );
    if (failedRecipients.length > 0 && failedRecipients.length <= 10) {
      console.log('Failed recipients:', failedRecipients);
    }

    return NextResponse.json({
      success: true,
      message: `Campaign processed: ${sentCount} sent, ${failedCount} failed`,
      sentCount,
      failedCount,
      totalRecipients: recipients.length,
      campaignId,
      ...(failedCount > 0
        ? {
            failedRecipients: failedRecipients.slice(0, 10),
            totalFailed: failedCount,
          }
        : {}),
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
