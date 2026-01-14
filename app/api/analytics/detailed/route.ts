import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

// GET enhanced analytics with detailed breakdowns and funnels (admin only)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // --- Overview Stats ---
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`
    const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`
    const totalRevenue =
      await sql`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'`
    const totalProducts = await sql`SELECT COUNT(*) as count FROM products`
    const viewsToday = await sql`
      SELECT COUNT(*) as count FROM analytics_events 
      WHERE event_name = 'PageView' AND created_at >= CURRENT_DATE
    `
    const avgOrderValue =
      await sql`SELECT COALESCE(AVG(total_amount), 0) as avg FROM orders WHERE status != 'cancelled'`

    // --- Daily Metrics (Last 7 Days) ---
    const dailyMetrics = await sql`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as revenue,
        COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as orders,
        COUNT(DISTINCT user_id) as unique_customers
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // --- Traffic Breakdown (Page Views by Page) ---
    const trafficByPage = await sql`
      SELECT 
        page_url,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(DISTINCT user_id) as users
      FROM analytics_events
      WHERE event_name = 'PageView' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `

    // --- Device & Browser Breakdown ---
    const deviceBreakdown = await sql`
      SELECT 
        device_type,
        COUNT(*) as events,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND device_type != 'unknown'
      GROUP BY device_type
      ORDER BY events DESC
    `

    const browserBreakdown = await sql`
      SELECT 
        browser,
        COUNT(*) as events,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND browser != 'unknown'
      GROUP BY browser
      ORDER BY events DESC
    `

    // --- Product Performance ---
    const topProducts = await sql`
      SELECT 
        p.id,
        p.name,
        p.slug,
        COUNT(ae.id) as views,
        COUNT(DISTINCT ae.session_id) as unique_viewers,
        COUNT(CASE WHEN ae.event_name = 'add_to_cart' THEN 1 END) as add_to_cart,
        COUNT(CASE WHEN ae.event_name = 'add_to_wishlist' THEN 1 END) as add_to_wishlist
      FROM analytics_events ae
      JOIN products p ON ae.product_id = p.id
      WHERE ae.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY p.id, p.name, p.slug
      ORDER BY views DESC
      LIMIT 15
    `

    // --- Conversion Funnel ---
    const funnelStats = await sql`
      SELECT 
        'PageView' as stage,
        COUNT(DISTINCT CASE WHEN event_name = 'PageView' THEN session_id END) as count
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'ProductView' as stage,
        COUNT(DISTINCT CASE WHEN event_name = 'view' THEN session_id END) as count
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND event_category = 'product'
      
      UNION ALL
      
      SELECT 
        'AddToCart' as stage,
        COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN session_id END) as count
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'Checkout' as stage,
        COUNT(DISTINCT user_id) as count
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'Purchase' as stage,
        COUNT(DISTINCT user_id) as count
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status != 'cancelled'
    `

    // --- Orders by Status ---
    const ordersByStatus = await sql`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY status
      ORDER BY count DESC
    `

    // --- Geographic Distribution (if available) ---
      const topCities: any[] = []

    // --- Time of Day Analysis ---
    const timeOfDayMetrics = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at)::int as hour,
        COUNT(*) as events,
        COUNT(DISTINCT session_id) as sessions
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `

    // --- Recent High-Value Orders ---
    const recentHighValueOrders = await sql`
      SELECT 
        o.id,
        o.order_number,
        u.name as customer_name,
        o.total_amount,
        o.status,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days' AND o.status != 'cancelled'
      GROUP BY o.id, u.name
      ORDER BY o.total_amount DESC
      LIMIT 10
    `

    return NextResponse.json({
      overview: {
        totalUsers: Number.parseInt(totalUsers[0].count),
        totalOrders: Number.parseInt(totalOrders[0].count),
        totalRevenue: Number.parseFloat(totalRevenue[0].total),
        totalProducts: Number.parseInt(totalProducts[0].count),
        viewsToday: Number.parseInt(viewsToday[0].count),
        avgOrderValue: Number.parseFloat(avgOrderValue[0].avg),
      },
      dailyMetrics,
      trafficByPage,
      deviceBreakdown,
      browserBreakdown,
      topProducts,
      funnelStats: funnelStats.sort((a: any, b: any) => {
        const order = ["PageView", "ProductView", "AddToCart", "Checkout", "Purchase"]
        return order.indexOf(a.stage) - order.indexOf(b.stage)
      }),
      ordersByStatus,
      topCities,
      timeOfDayMetrics,
      recentHighValueOrders,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
