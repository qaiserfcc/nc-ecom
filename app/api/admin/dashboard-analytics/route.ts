import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET enhanced dashboard analytics (admin only)
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7days" // 7days, 30days, 90days, 1year
    
    // Calculate date range based on period
    let intervalDays = 7
    switch (period) {
      case "30days":
        intervalDays = 30
        break
      case "90days":
        intervalDays = 90
        break
      case "1year":
        intervalDays = 365
        break
    }

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - intervalDays)

    // Get comprehensive overview stats
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      viewsToday,
      ordersToday,
      revenueToday,
      avgOrderValue,
      conversionRate
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`,
      sql`SELECT COUNT(*) as count FROM orders`,
      sql`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'`,
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM analytics WHERE event_type = 'view' AND created_at >= CURRENT_DATE`,
      sql`SELECT COUNT(*) as count FROM orders WHERE created_at >= CURRENT_DATE`,
      sql`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE created_at >= CURRENT_DATE AND status != 'cancelled'`,
      sql`SELECT COALESCE(AVG(total_amount), 0) as avg FROM orders WHERE status != 'cancelled'`,
      sql`
        SELECT 
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN event_type = 'view' THEN user_id END) > 0
            THEN (COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END)::DECIMAL / 
                  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN user_id END) * 100)
            ELSE 0 
          END as rate
        FROM analytics
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `
    ])

    // Get revenue trend
    const revenueTrend = await sql`
      SELECT 
        DATE(created_at) as date, 
        SUM(total_amount) as revenue, 
        COUNT(*) as orders,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE created_at >= ${fromDate} AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get orders by status with revenue
    const ordersByStatus = await sql`
      SELECT 
        status, 
        COUNT(*) as count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= ${fromDate}
      GROUP BY status
      ORDER BY count DESC
    `

    // Get top selling products
    const topSellingProducts = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.slug,
        p.image_url,
        p.current_price,
        COUNT(oi.id) as total_sold,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price_at_purchase * oi.quantity) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${fromDate} 
        AND o.status != 'cancelled'
      GROUP BY p.id, p.name, p.slug, p.image_url, p.current_price
      ORDER BY total_revenue DESC
      LIMIT 10
    `

    // Get most viewed products
    const mostViewedProducts = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.slug, 
        p.image_url,
        p.current_price,
        COUNT(a.id) as view_count
      FROM analytics a
      JOIN products p ON a.product_id = p.id
      WHERE a.event_type = 'view' AND a.created_at >= ${fromDate}
      GROUP BY p.id, p.name, p.slug, p.image_url, p.current_price
      ORDER BY view_count DESC
      LIMIT 10
    `

    // Get recent orders with customer info
    const recentOrders = await sql`
      SELECT 
        o.*, 
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `

    // Get conversion funnel
    const conversionFunnel = await sql`
      SELECT 
        SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as views,
        SUM(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) as add_to_cart,
        SUM(CASE WHEN event_type = 'add_to_wishlist' THEN 1 ELSE 0 END) as wishlist,
        SUM(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) as purchases
      FROM analytics
      WHERE created_at >= ${fromDate}
    `

    // Get hourly order distribution
    const hourlyOrders = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status != 'cancelled'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `

    // Get customer growth
    const customerGrowth = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_customers
      FROM users
      WHERE role = 'customer' AND created_at >= ${fromDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get category performance
    const categoryPerformance = await sql`
      SELECT 
        c.id,
        c.name,
        c.slug,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(oi.id) as total_orders,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.price_at_purchase * oi.quantity) as total_revenue
      FROM categories c
      JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
        AND o.created_at >= ${fromDate}
      GROUP BY c.id, c.name, c.slug
      ORDER BY total_revenue DESC NULLS LAST
      LIMIT 10
    `

    // Get top customers
    const topCustomers = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.status != 'cancelled' AND o.created_at >= ${fromDate}
      GROUP BY u.id, u.name, u.email
      ORDER BY total_spent DESC
      LIMIT 10
    `

    return NextResponse.json({
      overview: {
        totalUsers: Number.parseInt(totalUsers[0].count),
        totalOrders: Number.parseInt(totalOrders[0].count),
        totalRevenue: Number.parseFloat(totalRevenue[0].total),
        totalProducts: Number.parseInt(totalProducts[0].count),
        viewsToday: Number.parseInt(viewsToday[0].count),
        ordersToday: Number.parseInt(ordersToday[0].count),
        revenueToday: Number.parseFloat(revenueToday[0].total),
        avgOrderValue: Number.parseFloat(avgOrderValue[0].avg),
        conversionRate: Number.parseFloat(conversionRate[0].rate),
      },
      revenueTrend,
      ordersByStatus,
      topSellingProducts,
      mostViewedProducts,
      recentOrders,
      conversionFunnel: conversionFunnel[0],
      hourlyOrders,
      customerGrowth,
      categoryPerformance,
      topCustomers,
      period,
    })
  } catch (error) {
    console.error("Get dashboard analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
