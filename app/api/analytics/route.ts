import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET analytics (admin only)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get overview stats
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`
    const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`
    const totalRevenue =
      await sql`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'`
    const totalProducts = await sql`SELECT COUNT(*) as count FROM products`

    // Get views today
    const viewsToday = await sql`
      SELECT COUNT(*) as count FROM analytics 
      WHERE event_type = 'view' AND created_at >= CURRENT_DATE
    `

    // Get most viewed products
    const mostViewedProducts = await sql`
      SELECT p.id, p.name, p.slug, p.image_url, COUNT(a.id) as view_count
      FROM analytics a
      JOIN products p ON a.product_id = p.id
      WHERE a.event_type = 'view' AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY p.id, p.name, p.slug, p.image_url
      ORDER BY view_count DESC
      LIMIT 10
    `

    // Get recent orders
    const recentOrders = await sql`
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `

    // Get orders by status
    const ordersByStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `

    // Get daily revenue for last 7 days
    const dailyRevenue = await sql`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    return NextResponse.json({
      overview: {
        totalUsers: Number.parseInt(totalUsers[0].count),
        totalOrders: Number.parseInt(totalOrders[0].count),
        totalRevenue: Number.parseFloat(totalRevenue[0].total),
        totalProducts: Number.parseInt(totalProducts[0].count),
        viewsToday: Number.parseInt(viewsToday[0].count),
      },
      mostViewedProducts,
      recentOrders,
      ordersByStatus,
      dailyRevenue,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
