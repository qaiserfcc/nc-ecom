import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    // Parallel queries for all analytics data
    const [
      subscriberStats,
      campaignStats,
      leadMagnetStats,
      abandonedCartStats,
      eventStats,
      revenueStats,
      leadSourceStats,
      interestStats,
      engagementTrend,
    ] = await Promise.all([
      getSubscriberStats(startDate, endDate),
      getCampaignStats(startDate, endDate),
      getLeadMagnetStats(startDate, endDate),
      getAbandonedCartStats(startDate, endDate),
      getEventStats(startDate, endDate),
      getRevenueStats(startDate, endDate),
      getLeadSourceStats(startDate, endDate),
      getInterestStats(),
      getEngagementTrend(startDate, endDate),
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        subscribers: subscriberStats,
        campaigns: campaignStats,
        leadMagnets: leadMagnetStats,
        abandonedCarts: abandonedCartStats,
        events: eventStats,
        revenue: revenueStats,
        leadSources: leadSourceStats,
        interests: interestStats,
        engagementTrend,
      },
      period: { startDate, endDate },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getSubscriberStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      COUNT(*) as total_subscribers,
      COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
      COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
      COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2) as new_subscribers,
      AVG(total_emails_opened) as avg_emails_opened,
      AVG(total_emails_clicked) as avg_emails_clicked
    FROM email_subscribers
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  return result.rows[0];
}

async function getCampaignStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      COUNT(*) as total_campaigns,
      COUNT(*) FILTER (WHERE status = 'sent') as sent_campaigns,
      COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_campaigns,
      COUNT(*) FILTER (WHERE sent_at >= $1 AND sent_at <= $2) as campaigns_this_period,
      AVG(
        CASE 
          WHEN (SELECT COUNT(*) FROM email_campaign_recipients ecr WHERE ecr.campaign_id = ec.id) > 0
          THEN (
            SELECT COUNT(*) * 100.0 / COUNT(*)
            FROM email_campaign_recipients ecr
            WHERE ecr.campaign_id = ec.id AND ecr.opened_at IS NOT NULL
          )
          ELSE 0
        END
      ) as avg_open_rate,
      AVG(
        CASE 
          WHEN (SELECT COUNT(*) FROM email_campaign_recipients ecr WHERE ecr.campaign_id = ec.id) > 0
          THEN (
            SELECT COUNT(*) * 100.0 / COUNT(*)
            FROM email_campaign_recipients ecr
            WHERE ecr.campaign_id = ec.id AND ecr.clicked_at IS NOT NULL
          )
          ELSE 0
        END
      ) as avg_click_rate
    FROM email_campaigns ec
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  return result.rows[0];
}

async function getLeadMagnetStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      COUNT(*) as total_lead_magnets,
      COUNT(*) FILTER (WHERE is_active = true) as active_magnets,
      SUM(total_claims) as total_claims,
      SUM(total_conversions) as total_conversions,
      CASE 
        WHEN SUM(total_claims) > 0 
        THEN (SUM(total_conversions) * 100.0 / SUM(total_claims))
        ELSE 0 
      END as conversion_rate
    FROM lead_magnets
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  
  // Get claims in period
  const claimsQuery = `
    SELECT COUNT(*) as claims_this_period
    FROM lead_magnet_claims
    WHERE claimed_at >= $1 AND claimed_at <= $2
  `;
  const claimsResult = await executeQuery(claimsQuery, [startDate, endDate]);
  
  return {
    ...result.rows[0],
    claims_this_period: parseInt(claimsResult.rows[0].claims_this_period),
  };
}

async function getAbandonedCartStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      COUNT(*) as total_abandoned,
      COUNT(*) FILTER (WHERE recovery_status = 'recovered') as recovered_count,
      COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2) as abandoned_this_period,
      SUM(cart_value) as total_abandoned_value,
      SUM(recovery_value) as total_recovered_value,
      CASE 
        WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE recovery_status = 'recovered') * 100.0 / COUNT(*))
        ELSE 0 
      END as recovery_rate
    FROM abandoned_carts
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  return result.rows[0];
}

async function getEventStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      event_type,
      COUNT(*) as event_count
    FROM marketing_events
    WHERE created_at >= $1 AND created_at <= $2
    GROUP BY event_type
    ORDER BY event_count DESC
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  
  // Convert to object for easier access
  const events: Record<string, number> = {};
  result.rows.forEach(row => {
    events[row.event_type] = parseInt(row.event_count);
  });
  
  return events;
}

async function getRevenueStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      SUM(ecr.conversion_value) as email_revenue,
      COUNT(DISTINCT ecr.subscriber_id) FILTER (WHERE ecr.converted_at IS NOT NULL) as email_conversions,
      SUM(ac.recovery_value) as recovered_revenue,
      COUNT(*) FILTER (WHERE ac.recovery_status = 'recovered') as cart_recoveries
    FROM email_campaign_recipients ecr
    FULL OUTER JOIN abandoned_carts ac ON true
    WHERE (ecr.converted_at >= $1 AND ecr.converted_at <= $2)
       OR (ac.updated_at >= $1 AND ac.updated_at <= $2 AND ac.recovery_status = 'recovered')
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  const row = result.rows[0];
  
  return {
    email_revenue: parseFloat(row.email_revenue || 0),
    email_conversions: parseInt(row.email_conversions || 0),
    recovered_revenue: parseFloat(row.recovered_revenue || 0),
    cart_recoveries: parseInt(row.cart_recoveries || 0),
    total_marketing_revenue: parseFloat(row.email_revenue || 0) + parseFloat(row.recovered_revenue || 0),
  };
}

async function getLeadSourceStats(startDate: string, endDate: string) {
  const query = `
    SELECT 
      source,
      COUNT(*) as subscriber_count,
      COUNT(*) FILTER (WHERE created_at >= $1 AND created_at <= $2) as new_this_period
    FROM email_subscribers
    WHERE source IS NOT NULL
    GROUP BY source
    ORDER BY subscriber_count DESC
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  return result.rows;
}

async function getInterestStats() {
  const query = `
    SELECT 
      jsonb_array_elements_text(interests) as interest,
      COUNT(*) as subscriber_count
    FROM email_subscribers
    WHERE interests IS NOT NULL AND jsonb_array_length(interests) > 0
    GROUP BY interest
    ORDER BY subscriber_count DESC
  `;

  const result = await executeQuery(query, []);
  return result.rows;
}

async function getEngagementTrend(startDate: string, endDate: string) {
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) FILTER (WHERE event_type = 'newsletter_signup') as signups,
      COUNT(*) FILTER (WHERE event_type = 'email_open') as opens,
      COUNT(*) FILTER (WHERE event_type = 'email_click') as clicks,
      COUNT(*) FILTER (WHERE event_type = 'lead_magnet_claim') as claims
    FROM marketing_events
    WHERE created_at >= $1 AND created_at <= $2
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const result = await executeQuery(query, [startDate, endDate]);
  return result.rows;
}
